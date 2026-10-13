import { DurableObject } from 'cloudflare:workers'
import { timingSafeEqual } from 'node:crypto'
import { CheckpointCoordinator, isStaticRequest, readBounded, STATE_LIMIT } from './coordinator.js'

const IDLE_MS = 10 * 60 * 1000
const STORE_KEYS = ['sessions', 'orders', 'accounts', 'dashboard_runs', 'dashboard_trials']

function authorized(request, token) {
  if (!token || token.length < 32) return false
  const actual = new TextEncoder().encode(request.headers.get('authorization') || '')
  const expected = new TextEncoder().encode(`Bearer ${token}`)
  return actual.length === expected.length && timingSafeEqual(actual, expected)
}

export class Storefront extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env)
    this.ready = false
    this.preparing = null
    this.ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS checkpoint (kind TEXT NOT NULL, ordinal INTEGER NOT NULL, value TEXT NOT NULL, PRIMARY KEY (kind, ordinal))')
    this.ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS metadata (key TEXT PRIMARY KEY, value TEXT NOT NULL)')
    this.coordinator = new CheckpointCoordinator({
      prepare: () => this.prepare(),
      forward: request => this.forward(request),
      snapshot: () => this.snapshot(),
      save: state => this.save(state),
      invalidate: async () => { this.ready = false; await this.ctx.container.destroy() },
    })
  }

  metadata(key) {
    return this.ctx.storage.sql.exec('SELECT value FROM metadata WHERE key = ?', key).toArray()[0]?.value
  }

  save(state) {
    state = { dashboard_runs: [], dashboard_trials: [], ...state }
    if (state.version !== 1 || STORE_KEYS.some(key => !Array.isArray(state[key]))) throw new Error('Unsupported hosting checkpoint')
    this.ctx.storage.transactionSync(() => {
      this.ctx.storage.sql.exec('DELETE FROM checkpoint')
      for (const kind of STORE_KEYS) {
        for (const [ordinal, value] of state[kind].entries()) {
          this.ctx.storage.sql.exec('INSERT INTO checkpoint (kind, ordinal, value) VALUES (?, ?, ?)', kind, ordinal, JSON.stringify(value))
        }
      }
      this.ctx.storage.sql.exec('INSERT OR REPLACE INTO metadata (key, value) VALUES (?, ?)', 'version', '1')
    })
  }

  restore() {
    if (!this.metadata('version')) return null
    const state = { version: 1, ...Object.fromEntries(STORE_KEYS.map(key => [key, []])) }
    for (const row of this.ctx.storage.sql.exec('SELECT kind, value FROM checkpoint ORDER BY kind, ordinal')) {
      if (!STORE_KEYS.includes(row.kind)) throw new Error('Unknown checkpoint record')
      state[row.kind].push(JSON.parse(row.value))
    }
    return state
  }

  async internal(path, init = {}) {
    return this.ctx.container.getTcpPort(3000).fetch(`http://container/__hosting/${path}`, {
      signal: AbortSignal.timeout(10_000), ...init,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.token}`, ...init.headers },
    })
  }

  async snapshot() {
    const response = await this.internal('state')
    if (!response.ok) throw new Error('Cannot read hosting checkpoint')
    return JSON.parse(new TextDecoder().decode(await readBounded(response, STATE_LIMIT)))
  }

  async prepare() {
    if (this.ready && this.ctx.container.running) return
    if (!this.preparing) {
      this.preparing = this.start().finally(() => { this.preparing = null })
    }
    await this.preparing
  }

  async start() {
    this.ready = false
    this.token = this.metadata('internal-token') || crypto.randomUUID() + crypto.randomUUID()
    this.ctx.storage.sql.exec('INSERT OR REPLACE INTO metadata (key, value) VALUES (?, ?)', 'internal-token', this.token)
    const container = this.ctx.container
    const image = container.images.app
    // The durable_object scheduler does not roll running images automatically.
    const generation = image + ':' + this.env.BENCHMARK_API_TOKEN
    const generationHash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(generation))), byte => byte.toString(16).padStart(2, '0')).join('')
    if (container.running && this.metadata('generation') !== generationHash) await container.destroy()
    if (!container.running) {
      container.start({
        image, instance: 'standard-1', enableInternet: false,
        env: { NODE_ENV: 'production', PORT: '3000', CATALOG_MODE: 'reference', CAPTCHA_MODE: 'off', HOSTING_INTERNAL_TOKEN: this.token, BENCHMARK_API_TOKEN: this.env.BENCHMARK_API_TOKEN },
      })
    }
    await container.setInactivityTimeout(IDLE_MS)
    const deadline = Date.now() + 45_000
    let healthy = false
    while (Date.now() < deadline) {
      try {
        const response = await this.internal('health', { signal: AbortSignal.timeout(1500) })
        healthy = response.ok
        await response.body?.cancel()
        if (healthy) break
      } catch { /* The port is unavailable during startup. */ }
      await new Promise(resolve => setTimeout(resolve, 250))
    }
    if (!healthy) throw new Error('Storefront container did not become ready')
    const state = this.restore()
    if (state) {
      const response = await this.internal('state', { method: 'PUT', body: JSON.stringify(state) })
      if (!response.ok) throw new Error('Cannot restore hosting checkpoint')
      await response.body?.cancel()
    } else {
      this.save(await this.snapshot())
    }
    this.ctx.storage.sql.exec('INSERT OR REPLACE INTO metadata (key, value) VALUES (?, ?)', 'generation', generationHash)
    this.ready = true
  }

  forward(request) {
    const original = new URL(request.url)
    const destination = new URL(request.url)
    destination.protocol = 'http:'
    destination.host = 'container'
    const forwarded = new Request(destination, new Request(request, {
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(15_000)]),
    }))
    forwarded.headers.delete('host')
    forwarded.headers.delete('forwarded')
    forwarded.headers.set('X-Forwarded-Proto', 'https')
    forwarded.headers.set('X-Forwarded-Host', original.host)
    forwarded.headers.delete('X-Forwarded-For')
    return this.ctx.container.getTcpPort(3000).fetch(forwarded)
  }

  async fetch(request) {
    if (isStaticRequest(request)) {
      await this.prepare()
      return this.forward(request)
    }
    return this.coordinator.fetch(request)
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const headers = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow, noarchive' }
    if (!env.BENCHMARK_API_TOKEN || env.BENCHMARK_API_TOKEN.length < 32) return new Response('Hosting is not configured', { status: 503, headers })
    if (/^\/__hosting(?:\/|$)/i.test(url.pathname)) return new Response('Not found', { status: 404, headers })
    if (/^\/api(?:\/|$)/i.test(url.pathname) && url.pathname !== '/api/health' && !authorized(request, env.BENCHMARK_API_TOKEN)) {
      return new Response('Unauthorized', { status: 401, headers })
    }
    try {
      // One coordinator checkpoints the dashboard and its isolated task workers.
      const response = await env.STOREFRONT.getByName('reference-v1').fetch(request)
      const result = new Response(response.body, response)
      result.headers.set('X-Robots-Tag', headers['X-Robots-Tag'])
      return result
    } catch (error) {
      console.error(JSON.stringify({ event: 'hosting_request_failed', message: error.message }))
      return new Response('Storefront temporarily unavailable. Please retry.', { status: 503, headers })
    }
  },
}
