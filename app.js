import express from 'express'
import { readdirSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { sessionMiddleware, storeState } from './lib/session.js'
import { configureOrders, listOrders, getOrder, clearOrders } from './lib/orders.js'
import { esc } from './lib/html.js'
import { createCaptcha } from './lib/captcha.js'

export const ROOT = path.dirname(fileURLToPath(import.meta.url))

/**
 * Build the Express app. Every directory under stores/ that has an index.js
 * exporting { slug, name, country, currency, router } is mounted at /<slug>.
 * @param {{ persist?: boolean, ordersFile?: string, captcha?: { mode?: string, stores?: string[]|string, now?: Function } }} opts
 */
export async function createApp(opts = {}) {
  const captcha = createCaptcha({ mode: process.env.CAPTCHA_MODE ?? 'off', stores: process.env.CAPTCHA_STORES, ...opts.captcha })
  const persist = opts.persist ?? process.env.NODE_ENV !== 'test'
  configureOrders({ file: persist ? (opts.ordersFile ?? process.env.ORDERS_FILE ?? path.join(ROOT, 'data', 'orders.json')) : null })

  const app = express()
  app.disable('x-powered-by')
  app.set('etag', false)
  app.use(express.urlencoded({ extended: true }))
  app.use(express.json())
  app.use(sessionMiddleware)
  app.use('/static', express.static(path.join(ROOT, 'public')))

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
      res.locals.base = `/${slug}`
      res.set('Cache-Control', 'no-store')
      next()
    }, captcha.middleware({ slug, name: mod.name }), mod.router)
    stores.push({ slug, name: mod.name, country: mod.country, currency: mod.currency, url: `/${slug}`, description: mod.description ?? '', captcha: captcha.describe(slug) })
  }
  app.locals.stores = stores

  // ---- Benchmark API (ground truth) ----
  app.get('/api/health', (req, res) => res.json({ ok: true, stores: stores.length, time: new Date().toISOString() }))
  app.get('/api/stores', (req, res) => res.json(stores))
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
<p>Each link below is a self-contained clone of a real retailer's pre-order flow for Grand Theft Auto VI. Point an agent at one store URL and give it a task; then read <code>GET /api/orders</code> to see what it actually ordered.</p>
<p>Local CAPTCHA simulations: ${stores.some(s => s.captcha?.enabled) ? 'enabled for ' + stores.filter(s => s.captcha?.enabled).map(s => esc(s.name)).join(', ') : 'disabled (start with <code>CAPTCHA_MODE=on npm start</code> to enable supported scenarios)'}. See <code>GET /api/captcha</code> for verification outcomes.</p>
<ul>${stores.map(s => `<li><a href="${s.url}">${esc(s.name)}</a> <small>(${esc(s.country)}, ${esc(s.currency)})</small>${s.description ? ` — ${esc(s.description)}` : ''}</li>`).join('') || '<li><em>No stores mounted yet.</em></li>'}</ul>
<h2>API</h2>
<ul><li><code>GET /api/stores</code></li><li><code>GET /api/orders?store=&amp;run=</code></li><li><code>GET /api/orders/:id</code></li><li><code>DELETE /api/orders</code></li><li><code>GET /api/health</code></li></ul>
<p>Tag a session with <code>?run=&lt;id&gt;</code> on any store URL and the orders it places carry that <code>run_id</code>.</p>
</body></html>`)
  })

  return app
}
