import { createApp } from '../app.js'
import { resetSessions } from '../lib/session.js'
import { clearOrders } from '../lib/orders.js'
import { resetAccounts } from '../lib/accounts.js'

// Start the app on a random port with persistence off. Returns { base, close, client }.
export async function startServer() {
  process.env.NODE_ENV = 'test'
  const app = await createApp({ persist: false })
  const server = await new Promise(resolve => { const s = app.listen(0, '127.0.0.1', () => resolve(s)) })
  const base = `http://127.0.0.1:${server.address().port}`
  return {
    base,
    app,
    client: () => client(base),
    reset() { resetSessions(); clearOrders(); resetAccounts() },
    close: () => new Promise(r => server.close(r)),
  }
}

// Minimal cookie-jar HTTP client that follows redirects and keeps cookies,
// so a test can drive a whole checkout like a browser would.
export function client(base) {
  const jar = new Map()
  function cookieHeader() { return [...jar].map(([k, v]) => `${k}=${v}`).join('; ') }
  function storeCookies(res) {
    const set = res.headers.getSetCookie ? res.headers.getSetCookie() : []
    for (const c of set) { const [pair] = c.split(';'); const i = pair.indexOf('='); jar.set(pair.slice(0, i).trim(), pair.slice(i + 1).trim()) }
  }
  async function request(method, path, body, { follow = true } = {}) {
    let url = path.startsWith('http') ? path : base + path
    let init = { method, headers: { cookie: cookieHeader() }, redirect: 'manual' }
    if (body !== undefined) {
      init.headers['content-type'] = 'application/x-www-form-urlencoded'
      init.body = body instanceof URLSearchParams ? body.toString() : new URLSearchParams(body).toString()
    }
    const visited = []
    for (let hops = 0; hops < 10; hops++) {
      const res = await fetch(url, init)
      storeCookies(res)
      visited.push({ url, status: res.status })
      if (follow && res.status >= 300 && res.status < 400 && res.headers.get('location')) {
        url = new URL(res.headers.get('location'), url).href
        init = { method: 'GET', headers: { cookie: cookieHeader() }, redirect: 'manual' }
        continue
      }
      const text = await res.text()
      return { status: res.status, url, text, headers: res.headers, visited, $: (re) => re.exec(text) }
    }
    throw new Error('too many redirects: ' + visited.map(v => v.url).join(' -> '))
  }
  return {
    get: (path, opts) => request('GET', path, undefined, opts),
    post: (path, body, opts) => request('POST', path, body ?? {}, opts),
    json: async (path) => JSON.parse((await request('GET', path)).text),
    jar,
  }
}

// Pull the value of a named form field from an HTML page (hidden inputs etc.).
export function fieldValue(html, name) {
  const m = new RegExp(`<input[^>]*name=["']${name}["'][^>]*value=["']([^"']*)["']`, 'i').exec(html)
    || new RegExp(`<input[^>]*value=["']([^"']*)["'][^>]*name=["']${name}["']`, 'i').exec(html)
  return m ? m[1] : null
}
