import { randomBytes } from 'node:crypto'

// In-memory sessions keyed by an httpOnly cookie. One session per visitor,
// with an isolated sub-state per store so carts never leak between clones.
const sessions = new Map()
const isolatedSessions = new Map()

function parseCookies(header = '') {
  const out = {}
  for (const part of header.split(';')) {
    const i = part.indexOf('=')
    if (i < 0) continue
    out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim())
  }
  return out
}

export function createSessionMiddleware({ runId } = {}) {
  if (runId !== undefined && (typeof runId !== 'string' || !runId.trim())) {
    throw new Error('Session runId must be a non-empty string')
  }
  // A benchmark worker owns one run. Its sessions cannot inherit state from a
  // different middleware instance, and storefront navigation cannot retag it.
  const sessionStore = runId === undefined ? sessions : new Map()
  if (runId !== undefined) isolatedSessions.set(runId, sessionStore)
  return function sessionMiddleware(req, res, next) {
    // Browsers share cookies across ports on one host, so the port goes in the
    // cookie name. Otherwise two bench servers on localhost reset each other's sessions.
    const hosted = req.app?.get('hosted session cookies') === true
    const name = req.app?.get('session cookie name') || (hosted ? 'sid_hosted' : `sid_${req.socket.localPort}`)
    const cookies = parseCookies(req.headers.cookie)
    let sid = cookies[name]
    if (!sid || !sessionStore.has(sid)) {
      sid = randomBytes(16).toString('hex')
      const session = { id: sid, created_at: new Date().toISOString(), run_id: runId ?? null, stores: {} }
      if (runId !== undefined) Object.defineProperty(session, 'run_id', { writable: false, configurable: false })
      sessionStore.set(sid, session)
      res.setHeader('Set-Cookie', `${name}=${sid}; Path=/; HttpOnly; SameSite=Lax${hosted ? '; Secure' : ''}`)
    }
    const s = sessionStore.get(sid)
    // A benchmark harness can tag a bot's session by sending it to /<store>?run=<id>.
    // API run parameters are filters, not navigation into a new benchmark run.
    if (runId === undefined && !/^\/api(?:\/|$)/i.test(req.path) && req.query && req.query.run) s.run_id = String(req.query.run)
    req.session = s
    next()
  }
}

export const sessionMiddleware = createSessionMiddleware()

export function freshStoreState() {
  return { cart: [], checkout: {}, user: null }
}

export function storeState(session, slug) {
  if (!session.stores[slug]) session.stores[slug] = freshStoreState()
  return session.stores[slug]
}

export function resetSessions() { sessions.clear() }
export function sessionCount() { return sessions.size }

// Hosting checkpoints use copies: importing or inspecting a checkpoint cannot
// retain references that later rewrite a shopper's state.
function selectedSessions(runId) {
  if (runId === undefined) return sessions
  const selected = isolatedSessions.get(runId)
  if (!selected) throw new Error('Unknown isolated session scope')
  return selected
}

// Live references are only for the private evaluator to reconnect scenario
// WeakSets after restoration. They are never exposed by an HTTP route.
export function sessionStates({ runId } = {}) { return [...selectedSessions(runId).values()] }
export function exportSessions({ runId } = {}) { return structuredClone(sessionStates({ runId })) }

export function prepareSessionImport(snapshot, { runId } = {}) {
  if (!Array.isArray(snapshot)) throw new Error('Sessions must be an array')
  const target = selectedSessions(runId)
  const next = new Map()
  for (const session of structuredClone(snapshot)) {
    if (!session || typeof session !== 'object' || Array.isArray(session)
      || !/^[a-f0-9]{32}$/.test(session.id) || next.has(session.id)
      || typeof session.created_at !== 'string' || !Number.isFinite(Date.parse(session.created_at))
      || !(session.run_id === null || typeof session.run_id === 'string')
      || !session.stores || typeof session.stores !== 'object' || Array.isArray(session.stores)) {
      throw new Error('Invalid session checkpoint')
    }
    for (const [slug, state] of Object.entries(session.stores)) {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
        || !state || typeof state !== 'object' || Array.isArray(state)
        || !Array.isArray(state.cart) || !state.checkout || typeof state.checkout !== 'object' || Array.isArray(state.checkout)
        || !(state.user === null || (state.user && typeof state.user === 'object' && !Array.isArray(state.user)))) {
        throw new Error('Invalid store session checkpoint')
      }
    }
    if (runId !== undefined) {
      if (session.run_id !== runId) throw new Error('Session checkpoint escaped its assigned run')
      Object.defineProperty(session, 'run_id', { writable: false, configurable: false })
    }
    next.set(session.id, session)
  }
  // Validation and cloning finish before a caller commits any state buckets.
  return () => {
    target.clear()
    for (const [id, session] of next) target.set(id, session)
  }
}
