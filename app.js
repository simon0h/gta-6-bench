import express from 'express'
import { readdirSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { sessionMiddleware, createSessionMiddleware, storeState } from './lib/session.js'
import { configureOrders, listOrders, getOrder, clearOrders } from './lib/orders.js'
import { esc, setAgentView } from './lib/html.js'
import { createCaptcha } from './lib/captcha.js'
import { productAssetPageMiddleware } from './lib/product-assets.js'
import { mountProductAssetRoutes } from './lib/product-asset-routes.js'
import { CATALOG_MODE, catalogEvidenceSummary } from './lib/catalog-policy.js'
import { readStoreInventories } from './lib/store-inventory.js'
import { configureBenchmarkScenario, initializeScenarioStore } from './lib/benchmark-scenarios.js'

export const ROOT = path.dirname(fileURLToPath(import.meta.url))

/**
 * Build the Express app. Every directory under stores/ that has an index.js
 * exporting { slug, name, country, currency, router } is mounted at /<slug>.
 * @param {{ persist?: boolean, ordersFile?: string, captcha?: { mode?: string, stores?: string[]|string, now?: Function }, benchmark?: { runId: string, stores: string[], metadata?: object, scenario?: object } }} opts
 */
export async function createApp(opts = {}) {
  const benchmark = opts.benchmark
  setAgentView(Boolean(benchmark))
  if (benchmark && (!benchmark.runId || !Array.isArray(benchmark.stores) || !benchmark.stores.length)) {
    throw new Error('Benchmark mode requires a runId and an explicit store list')
  }
  if (benchmark?.scenario && benchmark.stores.length !== 1) throw new Error('Scenarios require exactly one store per worker')
  configureBenchmarkScenario({ store: benchmark?.stores[0], scenario: benchmark?.scenario })
  const captcha = createCaptcha({ mode: process.env.CAPTCHA_MODE ?? 'off', stores: process.env.CAPTCHA_STORES, ...opts.captcha })
  const persist = opts.persist ?? process.env.NODE_ENV !== 'test'
  configureOrders({ file: persist ? (opts.ordersFile ?? process.env.ORDERS_FILE ?? path.join(ROOT, 'data', 'orders.json')) : null, metadata: benchmark?.metadata })

  const app = express()
  app.disable('x-powered-by')
  app.set('etag', false)
  app.locals.benchmarkErrors = []
  // Evaluations expose storefronts only. Control/ground-truth access uses the
  // worker's parent IPC channel and is never mounted on an HTTP origin.
  if (benchmark) {
    app.use((req, res, next) => {
      if (app.locals.benchmarkFinished) return res.sendStatus(409)
      if (/^\/api(?:\/|$)/i.test(req.path)) return res.sendStatus(404)
      if (req.path === '/') return res.redirect(`/${benchmark.stores[0]}`)
      const allowed = [...benchmark.stores, 'static', 'product-assets']
      if (!allowed.some(prefix => req.path === `/${prefix}` || req.path.startsWith(`/${prefix}/`))) return res.sendStatus(404)
      res.on('finish', () => {
        if (res.statusCode >= 500) app.locals.benchmarkErrors.push({ method: req.method, path: req.path, status: res.statusCode })
      })
      next()
    })
  }
  app.use(express.urlencoded({ extended: true }))
  app.use(express.json())
  // A request may finish uploading its body after the evaluator closes a run.
  if (benchmark) app.use((req, res, next) => app.locals.benchmarkFinished ? res.sendStatus(409) : next())
  app.use(benchmark ? createSessionMiddleware({ runId: benchmark.runId }) : sessionMiddleware)
  app.use('/static', express.static(path.join(ROOT, 'public')))
  app.use(productAssetPageMiddleware)

  const stores = []
  const storesDir = path.join(ROOT, 'stores')
  const dirs = existsSync(storesDir) ? readdirSync(storesDir, { withFileTypes: true }) : []
  for (const dir of dirs.sort((a, b) => a.name.localeCompare(b.name))) {
    if (!dir.isDirectory() || dir.name.startsWith('_') || dir.name.startsWith('.')) continue
    const entry = path.join(storesDir, dir.name, 'index.js')
    if (!existsSync(entry)) continue
    let mod
    try {
      mod = (await import(pathToFileURL(entry).href)).default
      if (!mod || !mod.router) throw new Error('index.js must default-export { slug, name, country, currency, router }')
    } catch (err) {
      if (benchmark) throw new Error(`Benchmark store failed to load: ${dir.name}`, { cause: err })
      // One broken store must not take the whole bench down.
      console.error(`[stores] skipping stores/${dir.name}: ${err.message}`)
      continue
    }
    const slug = mod.slug || dir.name
    const pub = path.join(storesDir, dir.name, 'public')
    if (existsSync(pub)) app.use(`/${slug}/static`, express.static(pub))
    app.use(`/${slug}`, (req, res, next) => {
      req.storeSlug = slug
      req.store = storeState(req.session, slug)
      initializeScenarioStore(slug, req.store)
      res.locals.base = `/${slug}`
      res.set('Cache-Control', 'no-store')
      next()
    }, captcha.middleware({ slug, name: mod.name }), mod.router)
    const available = mod.gta6_available === null ? null : mod.gta6_available !== false
    stores.push({ slug, name: mod.name, country: mod.country, currency: mod.currency, url: `/${slug}`, description: mod.description ?? '', gta6_available: available,
      availability_status: mod.availability_status || (available === null ? 'unknown' : available ? 'available' : 'unavailable'),
      catalog: { ...catalogEvidenceSummary(slug), ...(typeof mod.catalog_status === 'string' ? { status: mod.catalog_status } : mod.catalog_status || {}) },
      catalog_observations: mod.catalog_observations || [], captcha: captcha.describe(slug) })
  }
  app.locals.stores = stores
  if (benchmark) {
    for (const slug of benchmark.stores) {
      if (!stores.some(store => store.slug === slug)) throw new Error(`Required benchmark store is missing: ${slug}`)
    }
  }
  await mountProductAssetRoutes(app)
  const inventories = await readStoreInventories()
  app.locals.catalogMode = CATALOG_MODE
  app.locals.inventories = inventories

  if (benchmark) return app

  // ---- Benchmark API (ground truth) ----
  app.get('/api/health', (req, res) => res.json({ ok: true, stores: stores.length, catalog_mode: CATALOG_MODE, time: new Date().toISOString() }))
  app.get('/api/stores', (req, res) => res.json(stores))
  app.get('/api/catalog', (req, res) => res.json({ mode: CATALOG_MODE, stores: inventories.filter(s => !req.query.store || req.query.store === s.slug).map(s => ({ ...s, observations: stores.find(store => store.slug === s.slug)?.catalog_observations || [] })) }))
  app.get('/api/captcha', (req, res) => res.json(captcha.list({ store: req.query.store, run: req.query.run })))
  app.get('/api/orders', (req, res) => res.json(listOrders({ store: req.query.store, run: req.query.run })))
  app.get('/api/orders/:id', (req, res) => {
    const o = getOrder(req.params.id)
    if (!o) return res.status(404).json({ error: 'not found' })
    res.json(o)
  })
  app.delete('/api/orders', (req, res) => { clearOrders(); res.json({ ok: true }) })

  // ---- Human-facing index ----
  app.get('/', (req, res) => {
    res.type('html').send(`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>GTA 6 Pre-order Bench</title>
<style>body{font-family:system-ui,sans-serif;max-width:760px;margin:40px auto;padding:0 16px;color:#111}li{margin:6px 0}code{background:#f3f3f3;padding:1px 4px;border-radius:3px}</style></head>
<body><h1>GTA 6 pre-order benchmark: synthetic stores</h1>
<p>Catalog mode: <strong>${esc(CATALOG_MODE)}</strong>. Reference mode uses captured listings; the older authored inventory requires <code>CATALOG_MODE=fixtures</code>. Catalog coverage is bounded by recorded evidence, not a complete live inventory. Point an agent at one store URL and read <code>GET /api/orders</code> to see what it ordered. Accounts and checkout remain local simulations.</p>
<p>Local CAPTCHA simulations: ${stores.some(s => s.captcha?.enabled) ? 'enabled for ' + stores.filter(s => s.captcha?.enabled).map(s => esc(s.name)).join(', ') : 'disabled (start with <code>CAPTCHA_MODE=on npm start</code> to enable supported scenarios)'}. See <code>GET /api/captcha</code> for verification outcomes.</p>
${[['available','GTA 6 pre-order scenarios'],['unavailable','GTA 6 not offered in captured references'],['listing_only','GTA 6 listing observed; purchase unverified'],['unknown','GTA 6 availability unverified']].map(([status,title]) => `<h2>${title}</h2><ul>${stores.filter(s => s.availability_status === status).map(s => `<li><a href="${s.url}">${esc(s.name)}</a> <small>(${esc(s.country)}, ${esc(s.currency)})</small>${s.description ? ` — ${esc(s.description)}` : ''}</li>`).join('') || '<li><em>No stores in this group.</em></li>'}</ul>`).join('')}
<h2>API</h2>
<ul><li><code>GET /api/stores</code></li><li><code>GET /api/catalog?store=</code></li><li><code>GET /api/orders?store=&amp;run=</code></li><li><code>GET /api/orders/:id</code></li><li><code>DELETE /api/orders</code></li><li><code>GET /api/health</code></li></ul>
<p>Tag a session with <code>?run=&lt;id&gt;</code> on any store URL and the orders it places carry that <code>run_id</code>.</p>
</body></html>`)
  })

  return app
}
