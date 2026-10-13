import express from 'express'
import { timingSafeEqual } from 'node:crypto'
import { readdirSync, existsSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { createApp, ROOT } from '../app.js'
import { exportSessions, prepareSessionImport } from '../lib/session.js'
import { exportOrders, prepareOrderImport } from '../lib/orders.js'
import { exportAccounts, prepareAccountImport } from '../lib/accounts.js'
import { createRunManager } from '../benchmark/dashboard-manager.js'
import { createDashboardRouter } from '../dashboard/router.js'

function requireToken(value, name) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${name} is required for hosted deployment`)
  return Buffer.from(`Bearer ${value}`)
}

function authorized(req, expected) {
  const actual = Buffer.from(req.get('authorization') || '')
  return actual.length === expected.length && timingSafeEqual(actual, expected)
}

export function exportHostingState() {
  return { version: 1, sessions: exportSessions(), orders: exportOrders(), accounts: exportAccounts() }
}

export function importHostingState(snapshot) {
  prepareHostingImport(snapshot)()
}

function prepareHostingImport(snapshot) {
  if (!snapshot || snapshot.version !== 1) throw new Error('Unsupported hosting checkpoint version')
  // Prepare every bucket before changing any of them. Commit orders first,
  // since a filesystem failure (for non-hosted callers) must leave all intact.
  const sessions = prepareSessionImport(snapshot.sessions)
  const orders = prepareOrderImport(snapshot.orders)
  const accounts = prepareAccountImport(snapshot.accounts)
  return () => { orders(); sessions(); accounts() }
}

export async function createHostedApp({
  internalToken = process.env.HOSTING_INTERNAL_TOKEN,
  apiToken = process.env.BENCHMARK_API_TOKEN,
} = {}) {
  const internal = requireToken(internalToken, 'HOSTING_INTERNAL_TOKEN')
  const operator = requireToken(apiToken, 'BENCHMARK_API_TOKEN')
  const manager = await createRunManager({ persist: false, secureCookies: true, traceArchive: true })
  const app = express()
  app.locals.runManager = manager
  app.disable('x-powered-by')
  app.set('trust proxy', 1)
  app.use('/__hosting', (req, res, next) => {
    res.set('Cache-Control', 'no-store')
    if (!authorized(req, internal)) return res.sendStatus(404)
    next()
  })
  app.get('/__hosting/health', (req, res) => res.json({ ok: true }))
  app.get('/__hosting/state', async (req, res) => {
    const dashboard = await manager.exportState()
    res.json({ ...exportHostingState(), ...(dashboard.dashboard_runs.length || dashboard.dashboard_trials.length ? dashboard : {}) })
  })
  app.put('/__hosting/state', express.json({ limit: '64mb' }), async (req, res) => {
    try {
      const commit = prepareHostingImport(req.body)
      const dashboard = manager.validateState({ dashboard_runs: [], dashboard_trials: [], ...req.body })
      await manager.importState(dashboard)
      commit()
      res.json({ ok: true })
    } catch {
      res.status(400).json({ error: 'Invalid hosting checkpoint' })
    }
  })
  app.post('/__hosting/traversal/ack', express.json({ limit: '256kb' }), async (req, res) => {
    try {
      await manager.acknowledgeTraversal(req.body)
      res.json({ ok: true })
    } catch {
      res.status(400).json({ error: 'Invalid traversal acknowledgement' })
    }
  })
  app.use('/__hosting', (req, res) => res.sendStatus(404))
  app.use('/api', (req, res, next) => {
    res.set('Cache-Control', 'no-store')
    if (['GET', 'HEAD'].includes(req.method) && /^\/health\/?$/i.test(req.path)) return next()
    if (!authorized(req, operator)) return res.status(401).json({ error: 'Operator authorization required' })
    next()
  })
  app.use(createDashboardRouter({ manager, apiToken }))

  // These routes are also the Worker's checkpoint-free concurrent paths.
  // A missing asset must terminate here instead of creating a shopper session.
  app.use('/static', express.static(path.join(ROOT, 'public'), { fallthrough: false }))
  for (const entry of readdirSync(path.join(ROOT, 'stores'), { withFileTypes: true })) {
    if (!entry.isDirectory() || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.name)
      || !existsSync(path.join(ROOT, 'stores', entry.name, 'index.js'))) continue
    app.use(`/${entry.name}/static`, express.static(path.join(ROOT, 'stores', entry.name, 'public'), { fallthrough: false }))
  }
  app.use((req, res, next) => {
    if (['GET', 'HEAD'].includes(req.method) && /^\/(?:[^/]+\/)?static(?:\/|$)/i.test(req.path)) return res.sendStatus(404)
    next()
  })

  const storefront = await createApp({ persist: false, captcha: { mode: 'off', stores: [] } })
  storefront.set('trust proxy', 1)
  storefront.set('hosted session cookies', true)
  app.get('/api/health', (req, res) => res.json({
    ok: true, stores: storefront.locals.stores.length,
    catalog_mode: storefront.locals.catalogMode, time: new Date().toISOString(),
  }))
  app.use(storefront)
  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error)
    const status = Number.isInteger(error.status) && error.status >= 400 && error.status < 500 ? error.status : 500
    res.status(status).json({ error: status === 500 ? 'Hosting request failed' : 'Request rejected' })
  })
  return app
}

export async function startHostedServer({ port = Number(process.env.PORT || 3000), ...options } = {}) {
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('PORT must be a valid TCP port')
  const app = await createHostedApp(options)
  return await new Promise((resolve, reject) => {
    const server = app.listen(port, '0.0.0.0', error => error ? reject(error) : resolve(server))
    server.once('close', () => { void app.locals.runManager.close().catch(error => console.error('Run manager shutdown failed:', error.message)) })
    server.once('error', reject)
  })
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const server = await startHostedServer()
  console.log(`Hosted benchmark listening on port ${server.address().port}`)
}
