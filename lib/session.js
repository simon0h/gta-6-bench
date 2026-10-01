import { randomBytes } from 'node:crypto'

// In-memory sessions keyed by an httpOnly cookie. One session per visitor,
// with an isolated sub-state per store so carts never leak between clones.
const sessions = new Map()

function parseCookies(header = '') {
  const out = {}
  for (const part of header.split(';')) {
    const i = part.indexOf('=')
    if (i < 0) continue
    out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim())
  }
  return out
}

export function sessionMiddleware(req, res, next) {
  // Browsers share cookies across ports on one host, so the port goes in the
  // cookie name. Otherwise two bench servers on localhost reset each other's sessions.
  const name = `sid_${req.socket.localPort}`
  const cookies = parseCookies(req.headers.cookie)
  let sid = cookies[name]
  if (!sid || !sessions.has(sid)) {
    sid = randomBytes(16).toString('hex')
    sessions.set(sid, { id: sid, created_at: new Date().toISOString(), run_id: null, stores: {} })
    res.setHeader('Set-Cookie', `${name}=${sid}; Path=/; HttpOnly; SameSite=Lax`)
  }
  const s = sessions.get(sid)
  // A benchmark harness can tag a bot's session by sending it to /<store>?run=<id>.
  // API run parameters are filters, not navigation into a new benchmark run.
  if (!/^\/api(?:\/|$)/i.test(req.path) && req.query && req.query.run) s.run_id = String(req.query.run)
  req.session = s
  next()
}

export function freshStoreState() {
  return { cart: [], checkout: {}, user: null }
}

export function storeState(session, slug) {
  if (!session.stores[slug]) session.stores[slug] = freshStoreState()
  return session.stores[slug]
}

export function resetSessions() { sessions.clear() }
export function sessionCount() { return sessions.size }
