import express from 'express'
import { createHmac, timingSafeEqual, randomUUID } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import path from 'node:path'
import { readBounded, RESPONSE_LIMIT } from '../deploy/coordinator.js'
import { dynamicTraversalRequest } from '../benchmark/traversal.js'
import { SUMMARY_HEADER, finishedCount, summaryInput, summaryKey, summaryView, writeRunSummary } from '../benchmark/ai-summary.js'
import { CHAT_HEADER, chatFull, chatLookup, chatStream, chatView, validQuestion } from '../benchmark/ai-chat.js'
import { Readable } from 'node:stream'

const publicDirectory = fileURLToPath(new URL('../public/dashboard/', import.meta.url))
const require = createRequire(import.meta.url)
// Recorder and player bundles come straight from their pinned npm packages.
const vendor = {
  'rrweb-record.js': path.join(path.dirname(require.resolve('@rrweb/record')), 'record.umd.min.cjs'),
  'rrweb-player.js': path.join(path.dirname(require.resolve('rrweb-player')), 'rrweb-player.umd.min.cjs'),
  'rrweb-player.css': path.join(path.dirname(require.resolve('rrweb-player')), 'style.min.css'),
}
const ADMIN_COOKIE = 'bench_operator'
const LOGIN_ATTEMPTS = 10, LOGIN_WINDOW_MS = 15 * 60 * 1000
const AGENT_COOKIE = 'bench_attempt'
const esc = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character])
const equal = (a, b) => {
  if (typeof a !== 'string' || typeof b !== 'string') return false
  const left = Buffer.from(a || ''), right = Buffer.from(b || '')
  return left.length === right.length && timingSafeEqual(left, right)
}
function cookie(req, name) {
  for (const item of String(req.headers.cookie || '').split(';')) {
    const index = item.indexOf('=')
    if (item.slice(0, index).trim() === name) {
      try { return decodeURIComponent(item.slice(index + 1).trim()) } catch { return null }
    }
  }
  return null
}
function setCookie(res, name, value, { local, clear = false } = {}) {
  res.append('Set-Cookie', `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=${name === AGENT_COOKIE ? 'Lax' : 'Strict'}${local ? '' : '; Secure'}; Max-Age=${clear ? 0 : 86400}`)
}
function requestOrigin(req) {
  const host = req.app.get('trust proxy') ? req.get('x-forwarded-host') || req.get('host') : req.get('host')
  return `${req.protocol}://${host}`
}
function sameOrigin(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next()
  if (req.get('sec-fetch-site') === 'cross-site' || (req.get('origin') && req.get('origin') !== requestOrigin(req))) {
    return res.status(403).json({ error: 'Open this action from the benchmark site.' })
  }
  next()
}
function statusFor(error) {
  if (Number.isInteger(error.status) && error.status >= 400 && error.status < 600) return error.status
  if (/not found|unknown run|unknown attempt|invalid token/i.test(error.message)) return 404
  if (/five|limit|maximum|already|complete|running|expired|changed|fingerprint|mismatch/i.test(error.message)) return 409
  return 400
}
function attemptWithUrl(attempt, req) { return { ...attempt, url: `${requestOrigin(req)}/agent/${attempt.token}` } }
function runWithUrls(run, req) {
  return { ...run, task_count: run.task_count ?? run.task_ids?.length ?? (run.suite === 'all240' ? 240 : 30), attempts: (run.attempts || []).map(attempt => attemptWithUrl(attempt, req)) }
}

export function createDashboardRouter({ manager, apiToken, local = false, anthropicApiKey = process.env.ANTHROPIC_API_KEY, writeSummary = writeRunSummary, claudeClient }) {
  if (!manager) throw new Error('A run manager is required')
  if (!local && !apiToken) throw new Error('Dashboard requires a BENCHMARK_API_TOKEN')
  const router = express.Router()
  const sign = value => createHmac('sha256', apiToken || 'local-only').update(value).digest('base64url')
  const authenticated = req => {
    if (local) return true
    if (equal(req.get('authorization'), `Bearer ${apiToken}`)) return true
    const value = cookie(req, ADMIN_COOKIE) || ''
    const [expiry, signature, extra] = value.split('.')
    return !extra && /^\d+$/.test(expiry || '') && Number(expiry) > Date.now() && equal(signature, sign(expiry))
  }
  const protect = (req, res, next) => authenticated(req) ? next() : res.status(401).json({ error: 'Operator sign-in required' })
  const action = handler => async (req, res, next) => {
    try { await handler(req, res) } catch (error) {
      if (res.headersSent) return next(error)
      res.status(statusFor(error)).json({ error: error.message })
    }
  }
  router.use((req, res, next) => {
    if (local && !['localhost', '127.0.0.1', '[::1]', '::1'].includes(req.hostname)) return res.status(403).send('Use localhost to access this dashboard')
    res.set('Referrer-Policy', 'no-referrer')
    res.set('X-Robots-Tag', 'noindex, nofollow, noarchive')
    next()
  })
  router.use(['/dashboard', '/agent'], (req, res, next) => { res.set('Cache-Control', 'no-store'); next() })
  router.use('/dashboard/api', sameOrigin, express.json({ limit: '32kb' }))
  router.get('/dashboard/api/session', (req, res) => res.json({ authenticated: authenticated(req), local }))
  // Wrong tokens are counted per address (Cloudflare's, when hosted) to slow guessing.
  const failedLogins = new Map()
  router.post('/dashboard/api/login', (req, res) => {
    const address = req.get('cf-connecting-ip') || req.ip || 'unknown', now = Date.now()
    for (const [key, entry] of failedLogins) if (entry.reset <= now) failedLogins.delete(key)
    const failed = failedLogins.get(address)
    if (!local && failed?.count >= LOGIN_ATTEMPTS) {
      res.set('Retry-After', String(Math.ceil((failed.reset - now) / 1000)))
      return res.status(429).json({ error: 'Too many wrong tokens. Try again in 15 minutes.' })
    }
    if (!local && !equal(req.body?.token, apiToken)) {
      failedLogins.set(address, { count: (failed?.count ?? 0) + 1, reset: failed?.reset ?? now + LOGIN_WINDOW_MS })
      return res.status(401).json({ error: 'The operator token is incorrect.' })
    }
    failedLogins.delete(address)
    const expiry = String(Date.now() + 86400_000)
    setCookie(res, ADMIN_COOKIE, `${expiry}.${sign(expiry)}`, { local })
    res.json({ authenticated: true, local })
  })
  router.post('/dashboard/api/logout', (req, res) => {
    setCookie(res, ADMIN_COOKIE, '', { local, clear: true })
    res.json({ authenticated: local, local })
  })
  router.use('/dashboard/api', protect)
  router.get('/dashboard/api/runs', action(async (req, res) => res.json({ runs: (await manager.listRuns()).map(run => runWithUrls(run, req)) })))
  router.post('/dashboard/api/runs', action(async (req, res) => res.status(201).json({ run: runWithUrls(await manager.createRun(req.body || {}), req) })))
  router.get('/dashboard/api/runs/:id', action(async (req, res) => {
    const run = await manager.getRun(req.params.id)
    if (!run) return res.status(404).json({ error: 'Run not found' })
    res.json({ run: runWithUrls(run, req) })
  }))
  router.get('/dashboard/api/tasks', action(async (req, res) => res.json(await manager.listTasks())))
  router.post('/dashboard/api/tasks/preview', action(async (req, res) => res.json(await manager.previewTask(req.body || {}))))
  router.post('/dashboard/api/tasks', action(async (req, res) => res.status(201).json({ task: await manager.createTask(req.body || {}) })))
  router.put('/dashboard/api/tasks/:id', action(async (req, res) => res.json({ task: await manager.updateTask(req.params.id, req.body || {}) })))
  router.delete('/dashboard/api/tasks/:id', action(async (req, res) => res.json(await manager.deleteTask(req.params.id))))
  router.get('/dashboard/api/runs/:id/live', action(async (req, res) => res.json(await manager.getLive(req.params.id))))
  // AI run summary. On Cloudflare the container has no internet and no key:
  // Node checks sign-in and builds the run data, then the Worker calls Claude
  // and keeps the summary. Locally, Node does both and keeps it in memory.
  const summaries = new Map()
  const summaryState = async id => {
    const run = await manager.getRun(id)
    if (!run) throw Object.assign(new Error('Run not found'), { status: 404 })
    const input = summaryInput(run)
    return { run_id: run.id, input, key: await summaryKey(input), finished: finishedCount(input) }
  }
  router.get('/dashboard/api/runs/:id/summary', action(async (req, res) => {
    const { run_id, key, finished } = await summaryState(req.params.id)
    if (manager.traceArchive) { res.set(SUMMARY_HEADER, run_id); return res.json({ run_id, key, finished }) }
    res.json(summaryView({ configured: Boolean(anthropicApiKey), saved: summaries.get(run_id), key, finished }))
  }))
  router.post('/dashboard/api/runs/:id/summary', action(async (req, res) => {
    const { run_id, input, key, finished } = await summaryState(req.params.id)
    if (!finished) return res.status(409).json({ error: 'Finish at least one task before writing a summary.' })
    if (manager.traceArchive) { res.set(SUMMARY_HEADER, run_id); return res.json({ run_id, key, finished, input }) }
    if (!anthropicApiKey) return res.status(409).json({ error: 'Set ANTHROPIC_API_KEY before starting the dashboard to turn on summaries.' })
    const summary = await writeSummary({ apiKey: anthropicApiKey, input })
    summaries.set(run_id, { key, finished, summary, written_at: new Date().toISOString() })
    res.json(summaryView({ configured: true, saved: summaries.get(run_id), key, finished }))
  }))
  // Chat about a run, split the same way as the summary: on Cloudflare the
  // Worker calls Claude, reads click paths from its archive and keeps the chat.
  const chats = new Map(), answering = new Set()
  router.get('/dashboard/api/runs/:id/chat', action(async (req, res) => {
    const { run_id } = await summaryState(req.params.id)
    if (manager.traceArchive) { res.set(CHAT_HEADER, run_id); return res.json({ run_id }) }
    res.json(chatView({ configured: Boolean(anthropicApiKey), chat: chats.get(run_id) }))
  }))
  router.delete('/dashboard/api/runs/:id/chat', action(async (req, res) => {
    const { run_id } = await summaryState(req.params.id)
    if (manager.traceArchive) { res.set(CHAT_HEADER, run_id); return res.json({ run_id }) }
    if (answering.has(run_id)) return res.status(409).json({ error: 'Wait for Claude to finish answering.' })
    chats.delete(run_id)
    res.json(chatView({ configured: Boolean(anthropicApiKey), chat: null }))
  }))
  router.post('/dashboard/api/runs/:id/chat', action(async (req, res) => {
    const question = validQuestion(req.body?.question)
    const run = await manager.getRun(req.params.id)
    if (!run) return res.status(404).json({ error: 'Run not found' })
    const { run_id, input, key, finished } = await summaryState(req.params.id)
    if (!finished) return res.status(409).json({ error: 'Finish at least one task before chatting about this run.' })
    const lookup = chatLookup(run)
    if (manager.traceArchive) { res.set(CHAT_HEADER, run_id); return res.json({ run_id, input, key, lookup, question }) }
    if (!anthropicApiKey) return res.status(409).json({ error: 'Set ANTHROPIC_API_KEY before starting the dashboard to turn on chat.' })
    if (answering.has(run_id)) return res.status(409).json({ error: 'Claude is still answering the last question.' })
    if (chatFull(chats.get(run_id))) return res.status(409).json({ error: 'This chat is full. Clear it to start a new one.' })
    answering.add(run_id)
    const readClickPath = async (agent, task) => {
      const ref = Object.hasOwn(lookup, agent) && Object.hasOwn(lookup[agent], task) ? lookup[agent][task] : null
      if (!ref) return null
      const events = []
      for (let after = 0; after !== null && events.length < 5000;) {
        const page = await manager.getTraversalEvents(run_id, ref.attempt_id, ref.trial_id, { after })
        events.push(...page.events)
        after = page.next_cursor
      }
      return events
    }
    const stream = chatStream({ apiKey: anthropicApiKey, client: claudeClient, chat: chats.get(run_id), input, inputKey: key, question, readClickPath,
      save: chat => { chats.set(run_id, chat) }, finish: () => answering.delete(run_id) })
    res.type('application/x-ndjson')
    Readable.fromWeb(stream).pipe(res)
  }))
  router.post('/dashboard/api/runs/:id/attempts', action(async (req, res) => res.status(201).json({ attempt: attemptWithUrl(await manager.addAttempt(req.params.id, req.body || {}), req) })))
  router.patch('/dashboard/api/runs/:id/attempts/:attempt', action(async (req, res) => res.json({ attempt: attemptWithUrl(await manager.updateAttempt(req.params.id, req.params.attempt, req.body || {}), req) })))
  router.get('/dashboard/api/runs/:id/attempts/:attempt/traversal', action(async (req, res) => {
    res.json(await manager.getTraversal(req.params.id, req.params.attempt))
  }))
  router.get('/dashboard/api/runs/:id/attempts/:attempt/traversal/:trial', action(async (req, res) => {
    const cursor = req.query.after ?? '0'
    if (typeof cursor !== 'string' || !/^\d+$/.test(cursor) || !Number.isSafeInteger(Number(cursor))) return res.status(400).json({ error: 'Invalid traversal cursor' })
    const result = await manager.getTraversalEvents(req.params.id, req.params.attempt, req.params.trial, { after: Number(cursor) })
    // The hosting coordinator reads its private archive only after these
    // operator-authentication and task-ownership checks have succeeded.
    if (manager.traceArchive) res.set('x-benchmark-trace-trial', result.trial_id)
    res.json(result)
  }))
  router.get('/dashboard/api/runs/:id/attempts/:attempt/replay/:trial', action(async (req, res) => {
    const cursor = req.query.after ?? '0'
    if (typeof cursor !== 'string' || !/^\d+$/.test(cursor) || !Number.isSafeInteger(Number(cursor))) return res.status(400).json({ error: 'Invalid replay cursor' })
    const result = await manager.getReplay(req.params.id, req.params.attempt, req.params.trial, { after: Number(cursor) })
    // As with traversal, the host fills archived chunks only after these checks.
    if (manager.traceArchive) res.set('x-benchmark-replay-trial', result.trial_id)
    res.json(result)
  }))
  router.use('/dashboard/api', (req, res) => res.status(404).json({ error: 'Endpoint not found' }))
  router.use('/dashboard/assets', express.static(`${publicDirectory}/assets`, { fallthrough: false }))
  router.get('/dashboard/live.js', (req, res) => res.sendFile(`${publicDirectory}/live.js`))
  router.get('/dashboard', (req, res) => res.sendFile(`${publicDirectory}/index.html`))
  router.get('/dashboard/', (req, res) => res.sendFile(`${publicDirectory}/index.html`))
  for (const file of ['app.js', 'tasks.js', 'style.css', 'portal.js', 'portal.css', 'capture.js', 'traversal.js', 'recorder.js', 'replay.js']) router.get(`/dashboard/${file}`, (req, res) => res.sendFile(`${publicDirectory}/${file}`))
  for (const [file, source] of Object.entries(vendor)) {
    router.get(`/dashboard/vendor/${file}`, (req, res) => res.set('Cache-Control', 'private, max-age=86400').type(file.endsWith('.css') ? 'css' : 'text/javascript').sendFile(source))
  }

  router.post('/agent/events', sameOrigin, express.json({ limit: '32kb' }), action(async (req, res) => {
    const token = cookie(req, AGENT_COOKIE)
    if (!token) return res.status(401).json({ error: 'Open your agent URL before recording browser events.' })
    await manager.recordBrowserEvents(token, req.body)
    res.sendStatus(204)
  }))
  router.post('/agent/replay', sameOrigin, express.raw({ type: () => true, limit: '1mb' }), action(async (req, res) => {
    const token = cookie(req, AGENT_COOKIE)
    if (!token) return res.status(401).json({ error: 'Open your agent URL before recording.' })
    const { trial, page, seq } = req.query
    if (![trial, page, seq].every(value => typeof value === 'string') || !/^\d{1,6}$/.test(seq)) return res.status(400).json({ error: 'Invalid replay chunk' })
    await manager.recordReplay(token, { trial_id: trial, page_id: page, seq: Number(seq) }, Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0))
    res.sendStatus(204)
  }))

  const validToken = (req, res, next) => /^[a-zA-Z0-9_-]{20,128}$/.test(req.params.token) ? next() : res.sendStatus(404)
  const claimBrowser = async (req, res) => {
    const previous = cookie(req, AGENT_COOKIE)
    if (previous && previous !== req.params.token) {
      let view
      try { view = await manager.agentView(previous) } catch (error) { if (error.status !== 404) throw error }
      // Two URLs of one run in one browser would mean two agents sharing it.
      // A URL from a newer run takes the browser over: the earlier run was
      // usually abandoned, and its URL can still be reopened elsewhere.
      if (view && view.status !== 'complete' && await manager.sameRun(previous, req.params.token)) {
        const message = 'This browser is already being used for another session URL in this run. Open this URL in a separate browser profile or private browsing window.'
        if (req.method === 'GET') res.status(409).type('html').send(noticePage({ title: 'Use a separate browser session', message }))
        else res.status(409).json({ error: message })
        return false
      }
    }
    setCookie(res, AGENT_COOKIE, req.params.token, { local })
    return true
  }
  router.get('/agent/:token', validToken, action(async (req, res) => {
    await manager.agentView(req.params.token)
    if (!await claimBrowser(req, res)) return
    res.type('html').send(portalPage(req.params.token))
  }))
  router.get('/agent/:token/state', validToken, action(async (req, res) => res.json(await manager.agentView(req.params.token))))
  router.post('/agent/:token/start', validToken, sameOrigin, express.json({ limit: '16kb' }), action(async (req, res) => {
    if (!await claimBrowser(req, res)) return
    const target = await manager.startTask(req.params.token)
    res.json({ startUrl: target.startPath })
  }))
  router.post('/agent/:token/finish', validToken, sameOrigin, express.json({ limit: '16kb' }), action(async (req, res) => {
    res.json(await manager.finishTask(req.params.token, req.body))
  }))

  // Storefronts use root-relative URLs. A host-only capability cookie routes the
  // whole browser session to one assigned worker without rewriting retailer HTML.
  // Hosted requests are also serialized/checkpointed by the outer Durable Object.
  let queue = Promise.resolve()
  router.use((req, res, next) => {
    if (/^\/(?:dashboard|agent|__hosting)(?:\/|$)/i.test(req.path)) return next()
    const token = cookie(req, AGENT_COOKIE)
    if (!token) return req.path === '/' ? res.redirect('/dashboard') : next()
    const operation = queue.then(async () => {
      const target = await manager.getTarget(token)
      if (!target) return res.status(409).type('html').send(noticePage({ title: 'Return to your task', message: 'This task is not running.', token }))
      const headers = new Headers()
      for (const [name, value] of Object.entries(req.headers)) {
        if (value && !['host', 'connection', 'content-length', 'transfer-encoding', 'authorization', 'forwarded'].includes(name.toLowerCase())) headers.set(name, Array.isArray(value) ? value.join(', ') : value)
      }
      // Admin credentials and other attempts' credentials must not reach children.
      headers.set('cookie', String(req.headers.cookie || '').split(';').filter(item => ![ADMIN_COOKIE, AGENT_COOKIE].includes(item.trim().split('=')[0])).join(';'))
      headers.set('x-forwarded-proto', req.protocol)
      headers.set('x-forwarded-host', new URL(requestOrigin(req)).host)
      const hasBody = !['GET', 'HEAD'].includes(req.method)
      const destination = new URL(req.originalUrl, target.baseUrl)
      if (destination.origin !== new URL(target.baseUrl).origin) return res.status(400).send('Invalid storefront path')
      const requestStarted = performance.now()
      const upstream = await fetch(destination, {
        // Cookies are forwarded explicitly above. Disable Fetch's automatic
        // HTTP-auth retry, which cannot replay a streamed POST on a 401 response.
        method: req.method, headers, redirect: 'manual', credentials: 'omit',
        ...(hasBody ? { body: req, duplex: 'half' } : {}), signal: AbortSignal.timeout(15_000),
      })
      const body = await readBounded(upstream, RESPONSE_LIMIT)
      const html = Boolean(upstream.headers.get('content-type')?.includes('text/html')) && req.method !== 'HEAD' && ![204, 205, 304].includes(upstream.status)
      let traversal
      if (target.trialId && dynamicTraversalRequest(req.originalUrl, upstream.headers.get('content-type') || '')) {
        traversal = await manager.recordRequest(token, target.trialId, { path: req.originalUrl, method: req.method,
          status: upstream.status, duration_ms: performance.now() - requestStarted, html, ...(html ? { page_id: randomUUID() } : {}) })
      }
      await manager.exportState()
      for (const [name, value] of upstream.headers) {
        if (!['set-cookie', 'content-length', 'content-encoding', 'connection', 'transfer-encoding'].includes(name)) res.set(name, value)
      }
      for (const value of upstream.headers.getSetCookie()) res.append('Set-Cookie', value)
      const location = upstream.headers.get('location')
      if (location?.startsWith(target.baseUrl)) res.set('Location', location.slice(target.baseUrl.length) || '/')
      res.set('Cache-Control', 'no-store')
      res.set('Referrer-Policy', 'no-referrer')
      res.status(upstream.status)
      if (req.method === 'HEAD' || [204, 205, 304].includes(upstream.status)) return res.end()
      if (html) {
        const back = `<a href="/agent/${esc(token)}" aria-label="Return to benchmark task and submit result" style="position:fixed;z-index:2147483647;bottom:16px;right:16px;padding:11px 15px;background:#181c19;color:#fff;border:1px solid #59605b;border-radius:999px;font:600 12px system-ui;text-decoration:none;box-shadow:0 4px 16px #0002">Task &amp; submit result ↗</a>`
        const capture = traversal?.page_id ? `<script src="/dashboard/capture.js" data-trial="${esc(target.trialId)}" data-page="${esc(traversal.page_id)}" defer></script>` : ''
        const recorder = traversal?.page_id && target.replay ? `<script src="/dashboard/vendor/rrweb-record.js" defer></script><script src="/dashboard/recorder.js" data-trial="${esc(target.trialId)}" data-page="${esc(traversal.page_id)}" defer></script>` : ''
        const document = Buffer.from(body).toString('utf8'), addition = `${back}${capture}${recorder}`
        return res.send(/<\/body>/i.test(document) ? document.replace(/<\/body>/i, `${addition}</body>`) : document + addition)
      }
      res.end(Buffer.from(body))
    })
    queue = operation.catch(() => {})
    operation.catch(error => {
      console.error('[dashboard proxy]', error.message)
      if (!res.headersSent) res.status(503).type('html').send(noticePage({ title: 'Task unavailable', message: 'This task is temporarily unavailable.', token }))
    })
  })
  return router
}

// Short messages shown on store URLs outside a running task, in the task page's look.
function noticePage({ title, message, token }) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="referrer" content="no-referrer"><title>${esc(title)} · GTA6 Bench</title><link rel="stylesheet" href="/dashboard/portal.css"></head>
  <body><header><${token ? `a href="/agent/${esc(token)}"` : 'span'} class="brand"><span class="brand-mark">VI</span> GTA6 BENCH</${token ? 'a' : 'span'}><span class="eyebrow">AGENT WORKSPACE</span></header>
  <main><h1>${esc(title)}</h1><p class="intro">${esc(message)}</p>${token ? `<div class="task-actions"><a class="primary" href="/agent/${esc(token)}">Return to your task page</a></div>` : ''}</main></body></html>`
}

function portalPage(token) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="referrer" content="no-referrer"><title>Your benchmark task · GTA6 Bench</title><link rel="stylesheet" href="/dashboard/portal.css"><script src="/dashboard/portal.js" defer></script></head>
  <body data-token="${esc(token)}"><header><a href="/agent/${esc(token)}" class="brand"><span class="brand-mark">VI</span> GTA6 BENCH</a><span class="eyebrow">AGENT WORKSPACE</span></header>
  <main><div id="loading" role="status">Loading your task…</div><div id="error" role="alert" hidden></div>
  <section id="workspace" hidden><div class="topline"><span id="progress" class="eyebrow"></span><span id="status" class="pill"></span></div><h1 id="title">Your next task</h1><p class="intro">Complete each shopping task and submit its outcome here. Your workspace is isolated from other agents.</p>
  <article class="task-card"><div class="task-heading"><span class="eyebrow">INSTRUCTIONS</span></div><p id="instruction"></p><details open><summary>Supplied details</summary><pre id="request"></pre></details><div class="task-actions"><button id="start" class="primary">Start task</button><a id="resume" class="primary" hidden>Continue shopping ↗</a><span id="timing"></span></div></article>
  <section id="finish-section" class="result-card" hidden><h2>Submit your result</h2><p>Return here after completing the purchase or deciding not to buy. Submitting ends this task and opens the next one.</p><form id="finish"><label>Outcome<select id="outcome" required><option value="purchased">Purchased</option><option value="not_purchased">Did not purchase</option></select></label><label id="reason-field" hidden>Reason<select id="reason"><option value="">Select a reason</option><option value="budget_exceeded">Budget exceeded</option><option value="unsupported_variant">Requested variant not offered</option><option value="unsupported_fulfillment">Required fulfillment not supported</option><option value="payment_declined">Payment declined</option><option value="unavailable">Product unavailable</option></select></label><label>Your final answer<textarea id="message" rows="4" maxlength="5000" required placeholder="Explain the purchase you completed or why you did not purchase."></textarea></label><button class="primary" type="submit">Submit result &amp; continue</button></form></section>
  </section><section id="complete" class="complete" hidden><div class="completion-mark">✓</div><p class="eyebrow">BENCHMARK COMPLETE</p><h1>All tasks submitted.</h1><p>Your results have been recorded. You can return to the conversation where you received this link.</p></section></main><footer>GTA6 BENCH · AGENT WORKSPACE</footer></body></html>`
}
