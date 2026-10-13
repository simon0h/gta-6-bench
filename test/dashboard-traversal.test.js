import test from 'node:test'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import http from 'node:http'
import { createRunManager } from '../benchmark/dashboard-manager.js'
import { createDashboardApp } from '../dashboard/server.js'
import { tasks } from '../benchmark/tasks.js'
import { dynamicTraversalRequest, traversalPath } from '../benchmark/traversal.js'

const task = tasks.find(task => task.id === 'bestbuy-budget_decline-ps5')
const options = { persist: false, environment: { environment_sha256: 'traversal-test-source' }, taskSets: { original30: [task], all240: [task] } }
const factory = baseUrl => async ({ trial }) => ({
  target: { baseUrl: baseUrl || 'http://127.0.0.1:1', startPath: '/bestbuy' },
  snapshot: async () => ({ version: 1, run_id: trial.id, orders: [], errors: [], sessions: [], request_count: 0 }), close: async () => {},
})
async function manager(t, extra = {}) {
  const m = await createRunManager({ ...options, workerFactory: factory(), ...extra })
  t.after(() => m.close())
  return m
}
async function setup(m) {
  const run = await m.createRun({ name: 'Traversal' }), attempt = await m.addAttempt(run.id, { agent: 'muse' })
  await m.startTask(attempt.token)
  const { trialId } = await m.getTarget(attempt.token)
  return { run, attempt, trialId }
}
const request = (m, a, trialId, extra = {}) => m.recordRequest(a.token, trialId, {
  path: '/bestbuy/cart?email=private@example.com&token=secret', method: 'GET', status: 200, html: true, page_id: randomUUID(), duration_ms: 4.5, ...extra,
})
const events = (m, a, trialId, pageId, rows) => m.recordBrowserEvents(a.token, { trial_id: trialId, page_id: pageId, events: rows })

test('traversal records the task lifecycle and sanitized browser actions without changing grading', async t => {
  let clock = Date.now()
  const m = await manager(t, { now: () => clock }), { run, attempt, trialId } = await setup(m)
  clock += 80
  const page = await request(m, attempt, trialId, { body: 'secret-body', headers: { authorization: 'secret-header' } })
  assert.equal(page.id, 2)
  assert.equal(page.path, '/bestbuy/cart')
  assert.equal(page.elapsed_ms, 80)
  assert.equal(page.duration_ms, 5)
  assert.match(page.page_id, /^[\da-f-]{36}\.[\w-]{43}$/)
  await events(m, attempt, trialId, page.page_id, [
    { kind: 'page', path: '/bestbuy/cart?password=secret', navigation: 'navigate' },
    { kind: 'click', path: `/agent/${attempt.token}?private=secret`, label: 'Buy now', value: 'secret-value', body: 'secret-body', id: 999, at: 'untrusted' },
    { kind: 'change', label: 'email private@example.com', value: 'secret-value' },
    { kind: 'submit', label: '4111 1111 1111 1111', path: '/bestbuy/checkout' },
  ])
  const next = await request(m, attempt, trialId, { path: '/bestbuy/checkout' })
  await events(m, attempt, trialId, next.page_id, [{ kind: 'page', parent_page_id: page.page_id, navigation: 'back_forward' }])
  await m.finishTask(attempt.token, { outcome: 'not_purchased', reason: 'budget_exceeded', message: 'Over budget' })
  const trace = await m.getTraversalEvents(run.id, attempt.id, trialId)
  assert.deepEqual(trace.events.map(event => event.id), Array.from({ length: 9 }, (_, index) => index + 1))
  assert.equal(trace.events[0].kind, 'start')
  assert.equal(trace.events.at(-1).kind, 'complete')
  assert.equal(trace.events[3].path, '/agent/[task]')
  assert.equal(trace.events[4].label, 'email [email]')
  assert.equal(trace.events[5].label, '[number]')
  assert.equal(trace.events[7].parent_page_id, page.page_id)
  assert.doesNotMatch(JSON.stringify(trace), /secret|private@example|4111|untrusted/)
  assert.ok(trace.events.every(event => !('trial_id' in event)))
  const summary = await m.getTraversal(run.id, attempt.id)
  assert.equal(summary.tasks[0].recorded, true)
  assert.equal(summary.tasks[0].event_count, 9)
  assert.equal(summary.tasks[0].index, 1)
  assert.equal(summary.tasks[0].grade.status, 'passed')
  const detail = await m.getRun(run.id)
  assert.equal('traversal_secret' in detail.attempts[0].trials[0], false)
  assert.equal('events' in detail.attempts[0].trials[0].result, false)
  clock += 5001
  await assert.rejects(events(m, attempt, trialId, page.page_id, [{ kind: 'click' }]), /no longer running/)
})

test('trusted in-flight request and a final departure beacon can finish after grading without changing the result', async t => {
  let clock = Date.now()
  const m = await manager(t, { now: () => clock }), { run, attempt, trialId } = await setup(m)
  const page = await request(m, attempt, trialId)
  await m.finishTask(attempt.token, { outcome: 'not_purchased', reason: 'budget_exceeded' })
  const sealed = structuredClone((await m.getRun(run.id)).attempts[0].trials[0].result)
  clock += 100
  await events(m, attempt, trialId, page.page_id, [{ kind: 'click', path: `/agent/${attempt.token}`, label: 'Return to task' }])
  clock += 6000
  assert.equal((await request(m, attempt, trialId, { html: false, status: 302 })).kind, 'request')
  assert.deepEqual((await m.getRun(run.id)).attempts[0].trials[0].result, sealed)
  await assert.rejects(events(m, attempt, trialId, page.page_id, [{ kind: 'click' }]), /no longer running/)
})

test('traversal rejects cross-attempt pages, tasks, parents and invalid batches atomically', async t => {
  const m = await manager(t), left = await setup(m), right = await setup(m)
  const a = await request(m, left.attempt, left.trialId), b = await request(m, right.attempt, right.trialId)
  await assert.rejects(request(m, left.attempt, right.trialId), { status: 404 })
  await assert.rejects(events(m, left.attempt, right.trialId, b.page_id, []), { status: 404 })
  await assert.rejects(events(m, left.attempt, left.trialId, b.page_id, []), { status: 403 })
  await assert.rejects(events(m, left.attempt, left.trialId, a.page_id.slice(0, -1) + '!', []), { status: 403 })
  await assert.rejects(events(m, left.attempt, left.trialId, a.page_id, [{ kind: 'page', parent_page_id: b.page_id }]), /parent/)
  await assert.rejects(events(m, left.attempt, left.trialId, a.page_id, [{ kind: 'click' }, { kind: 'request' }]), /Invalid browser/)
  await assert.rejects(events(m, left.attempt, left.trialId, a.page_id, Array.from({ length: 33 }, () => ({ kind: 'click' }))), /at most 32/)
  assert.equal((await m.getTraversal(left.run.id, left.attempt.id)).tasks[0].event_count, 2)
  await assert.rejects(m.getTraversal(left.run.id, right.attempt.id), { status: 404 })
  await assert.rejects(m.getTraversalEvents(left.run.id, left.attempt.id, right.trialId), { status: 404 })
  await assert.rejects(m.getTraversalEvents(left.run.id, left.attempt.id, left.trialId, { after: -1 }), /pagination/)
})

test('archive acknowledgement is idempotent and releases only committed events without resetting IDs', async t => {
  const m = await manager(t, { traceArchive: true }), { run, attempt, trialId } = await setup(m)
  const page = await request(m, attempt, trialId)
  await events(m, attempt, trialId, page.page_id, [{ kind: 'page' }, { kind: 'click' }])
  await m.acknowledgeTraversal([{ trial_id: trialId, id: 2 }])
  await m.acknowledgeTraversal([{ trial_id: trialId, id: 2 }])
  assert.deepEqual((await m.exportState()).dashboard_trace_events.map(event => event.id), [3, 4])
  assert.equal((await m.getTraversal(run.id, attempt.id)).tasks[0].event_count, 4)
  await assert.rejects(m.acknowledgeTraversal([{ trial_id: trialId, id: 5 }]), /acknowledgement/)
  await m.acknowledgeTraversal([{ trial_id: trialId, id: 4 }])
  const snapshot = await m.exportState()
  assert.deepEqual(snapshot.dashboard_trace_events, [])
  const restored = await manager(t, { traceArchive: true })
  await restored.importState(snapshot)
  await events(restored, attempt, trialId, page.page_id, [{ kind: 'click' }])
  assert.equal((await restored.exportState()).dashboard_trace_events[0].id, 5)
})

test('local disk checkpoints retain events, signed page ownership and pagination across restart', async t => {
  const directory = await mkdtemp(path.join(tmpdir(), 'dashboard-traversal-'))
  t.after(() => rm(directory, { recursive: true, force: true }))
  const m = await manager(t, { directory, persist: true }), { run, attempt, trialId } = await setup(m)
  const page = await request(m, attempt, trialId)
  await events(m, attempt, trialId, page.page_id, [{ kind: 'click' }, { kind: 'change', label: 'email' }])
  await m.acknowledgeTraversal([{ trial_id: trialId, id: 4 }])
  await m.close()
  const saved = JSON.parse(await readFile(path.join(directory, 'dashboard-state.json'), 'utf8'))
  assert.equal(saved.dashboard_trace_events.length, 4)
  const restored = await manager(t, { directory, persist: true })
  await events(restored, attempt, trialId, page.page_id, [{ kind: 'page', parent_page_id: page.page_id }])
  const first = await restored.getTraversalEvents(run.id, attempt.id, trialId, { limit: 2 })
  assert.equal(first.next_cursor, 2)
  const next = await restored.getTraversalEvents(run.id, attempt.id, trialId, { after: first.next_cursor })
  assert.deepEqual(next.events.map(event => event.id), [3, 4, 5])
  assert.equal(next.next_cursor, null)
})

test('checkpoint import preserves old unrecorded trials and rejects forged, orphaned or incomplete traces', async t => {
  const m = await manager(t), { run, attempt, trialId } = await setup(m)
  const page = await request(m, attempt, trialId)
  await events(m, attempt, trialId, page.page_id, [{ kind: 'page' }])
  const saved = await m.exportState()
  for (const mutate of [
    state => state.dashboard_trace_events.push(state.dashboard_trace_events[0]),
    state => { state.dashboard_trace_events[0].trial_id = 'unknown' },
    state => { state.dashboard_trace_events[1].page_id = randomUUID() + '.' + 'A'.repeat(43) },
    state => { state.dashboard_trace_events[0].body = 'secret' },
    state => { state.dashboard_trace_events[1].path = '/cart?private=secret' },
    state => state.dashboard_trace_events.pop(),
    state => { state.dashboard_trials[0].traversal_secret = 'bad' },
  ]) {
    const invalid = structuredClone(saved); mutate(invalid)
    assert.throws(() => m.validateState(invalid), /traversal|Traversal/)
  }
  const old = structuredClone(saved)
  delete old.dashboard_trace_events
  delete old.dashboard_trials[0].traversal
  delete old.dashboard_trials[0].traversal_secret
  await m.importState(old)
  assert.equal(await request(m, attempt, trialId), null)
  assert.equal((await m.getTraversal(run.id, attempt.id)).tasks[0].recorded, false)
  assert.deepEqual((await m.getTraversalEvents(run.id, attempt.id, trialId)).events, [])
  await m.finishTask(attempt.token, { outcome: 'not_purchased', reason: 'budget_exceeded' })
  assert.equal((await m.getTraversal(run.id, attempt.id)).tasks[0].recorded, false)
})

test('request filtering excludes static resources and strips query values and agent capabilities', () => {
  for (const resource of ['/assets/logo', '/bestbuy/main.CSS?version=secret', '/image.svg', '/font.woff2', '/script.mjs', '/file.pdf']) assert.equal(dynamicTraversalRequest(resource), false)
  assert.equal(dynamicTraversalRequest('/dynamic-image', 'image/png'), false)
  assert.equal(dynamicTraversalRequest('/bestbuy/cart', 'text/html; charset=utf-8'), true)
  assert.equal(dynamicTraversalRequest('/bestbuy/cart/add', 'application/json'), true)
  assert.equal(traversalPath('https://name:secret@example.com/agent/private-token?q=private#secret'), '/agent/[task]')
})

async function listen(t, app) {
  const server = http.createServer(app)
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve) })
  t.after(async () => { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)) })
  return `http://127.0.0.1:${server.address().port}`
}

test('HTTP instrumentation authenticates capture and reads, verifies ownership and checkpoints requests before response', async t => {
  const upstream = await listen(t, (req, res) => {
    if (req.url.startsWith('/assets/')) res.writeHead(200, { 'content-type': 'image/svg+xml' }).end('<svg/>')
    else res.writeHead(200, { 'content-type': 'text/html' }).end('<!doctype html><body><h1>Storefront</h1></body>')
  })
  const m = await manager(t, { workerFactory: factory(upstream), traceArchive: true })
  const { run, attempt, trialId } = await setup(m)
  const operatorToken = 'operator-traversal-test', app = await createDashboardApp({ manager: m, local: false, apiToken: operatorToken })
  const base = await listen(t, app), cookie = `bench_attempt=${attempt.token}`, auth = { authorization: `Bearer ${operatorToken}` }
  const storefront = await fetch(base + '/bestbuy?email=private@example.com', { headers: { cookie } })
  assert.equal(storefront.status, 200)
  const html = await storefront.text(), injected = html.match(/<script src="\/dashboard\/capture.js" data-trial="([^"]+)" data-page="([^"]+)" defer><\/script>/)
  assert.ok(injected)
  assert.equal(injected[1], trialId)
  assert.doesNotMatch(injected[0], new RegExp(attempt.token))
  const state = await m.exportState()
  assert.equal(state.dashboard_trace_events[1].path, '/bestbuy')
  const size = state.dashboard_trace_events.length
  await fetch(base + '/assets/logo.svg', { headers: { cookie } })
  assert.equal((await m.exportState()).dashboard_trace_events.length, size)
  const body = JSON.stringify({ trial_id: trialId, page_id: injected[2], events: [{ kind: 'click', label: 'Buy now' }] })
  const post = headers => fetch(base + '/agent/events', { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body })
  assert.equal((await post({})).status, 401)
  assert.equal((await post({ cookie, origin: 'https://other.example' })).status, 403)
  assert.equal((await post({ cookie, origin: base })).status, 204)
  const route = `/dashboard/api/runs/${run.id}/attempts/${attempt.id}/traversal`
  const denied = await fetch(base + route + '/' + trialId, { headers: { cookie } })
  assert.equal(denied.status, 401)
  assert.equal(denied.headers.get('x-benchmark-trace-trial'), null)
  const summary = await fetch(base + route, { headers: auth })
  assert.equal((await summary.json()).tasks[0].event_count, 3)
  const result = await fetch(base + route + '/' + trialId + '?after=1', { headers: auth })
  assert.equal(result.headers.get('x-benchmark-trace-trial'), trialId)
  assert.deepEqual((await result.json()).events.map(event => event.kind), ['request', 'click'])
  const missing = await fetch(base + route + '/unknown', { headers: auth })
  assert.equal(missing.status, 404)
  assert.equal(missing.headers.get('x-benchmark-trace-trial'), null)
  assert.equal((await fetch(base + route + '/' + trialId + '?after=-1', { headers: auth })).status, 400)
  assert.equal((await fetch(base + '/agent/events', { method: 'POST', headers: { cookie, 'content-type': 'application/json' }, body: JSON.stringify({ ignored: 'x'.repeat(33000) }) })).status, 413)
})
