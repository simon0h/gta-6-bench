// Live position of a running task, kept as a small summary on the trial so the
// dashboard can show where each agent is without reading the event archive.
// It is built only from traversal events that are already sanitized.

export const LIVE_TRAIL = 8
export const PAGE_KINDS = ['home', 'search', 'product', 'cart', 'checkout', 'ordered', 'account', 'browse']
const ACTIONS = ['click', 'submit', 'change']

// Rough page type from a sanitized path. Paths start with the store slug.
export function pageKind(path) {
  const rest = String(path || '').replace(/^\/[^/]+/, '').toLowerCase()
  if (!rest || rest === '/') return 'home'
  if (/confirmation|thank-?you|purchase\/complete|checkout\/(?:complete|status)/.test(rest)) return 'ordered'
  if (/checkout|place-order|buy-now|\/buy(?:\/|$)|\/preorder(?:\/|$)|\/pac$/.test(rest)) return 'checkout'
  if (/\/(?:cart|trolley|basket|bag)(?:\/|$)/.test(rest)) return 'cart'
  if (/log-?in|sign-?in|sign-?up|sign-?out|log-?out|register|identity|newaccount|\/ap\/|\/account|\/auth\//.test(rest)) return 'account'
  if (/search|^\/s(?:\/|$)/.test(rest)) return 'search'
  if (/^\/(?:p|dp|ip|product|products|catalog|game|reference-products|vp\/products|gp\/product)\/|\/dp\/|\/games\/store\/|\/concept\/|\/products\/[^/]+\/\d+\.html$|^\/item$/.test(rest)) return 'product'
  return 'browse'
}

const stop = (path, at) => ({ path, kind: pageKind(path), at })

function visit(live, path, at, pageId) {
  live.page = { ...stop(path, at), ...(pageId ? { page_id: pageId } : {}) }
  live.pages++
  if (!live.seen.includes(live.page.kind)) live.seen = [...live.seen, live.page.kind]
  if (live.trail.at(-1)?.path !== path) live.trail = [...live.trail, stop(path, at)].slice(-LIVE_TRAIL)
}

export function updateLivePosition(previous, event) {
  const live = previous ? structuredClone(previous) : { version: 1, page: null, trail: [], seen: [], action: null, pages: 0, actions: 0, last_at: null }
  if (event.kind !== 'start') live.last_at = event.at
  // Redirects are not places; error pages are, since the agent is looking at one.
  if (event.kind === 'request' && event.html && event.path && !(event.status >= 300 && event.status < 400)) {
    visit(live, event.path, event.at, event.page_id)
  } else if (event.kind === 'page' && event.path && event.page_id !== live.page?.page_id) {
    // Pages restored from the browser cache arrive without a server request.
    visit(live, event.path, event.at, event.page_id)
  } else if (event.kind === 'navigation' && event.path && event.path !== live.page?.path) {
    visit(live, event.path, event.at, event.page_id)
  } else if (ACTIONS.includes(event.kind)) {
    live.action = { kind: event.kind, at: event.at, ...(event.label ? { label: event.label } : {}), ...(event.path ? { path: event.path } : {}) }
    live.actions++
  }
  return live
}

const text = (value, max) => typeof value === 'string' && value.length <= max
const time = value => typeof value === 'string' && Number.isFinite(Date.parse(value))
const validStop = item => item && typeof item === 'object' && text(item.path, 1000) && PAGE_KINDS.includes(item.kind) && time(item.at)

export function validLivePosition(live) {
  return Boolean(live && typeof live === 'object' && live.version === 1
    && (live.page === null || (validStop(live.page) && (live.page.page_id === undefined || text(live.page.page_id, 80))))
    && Array.isArray(live.trail) && live.trail.length <= LIVE_TRAIL && live.trail.every(validStop)
    && Array.isArray(live.seen) && new Set(live.seen).size === live.seen.length && live.seen.every(kind => PAGE_KINDS.includes(kind))
    && (live.action === null || (live.action && ACTIONS.includes(live.action.kind) && time(live.action.at)
      && (live.action.label === undefined || text(live.action.label, 120)) && (live.action.path === undefined || text(live.action.path, 1000))))
    && Number.isSafeInteger(live.pages) && live.pages >= 0 && Number.isSafeInteger(live.actions) && live.actions >= 0
    && (live.last_at === null || time(live.last_at)))
}

// What the dashboard sees: no page identifiers, which are signed capabilities.
export function publicLivePosition(live) {
  if (!live) return null
  const { page_id, ...page } = live.page ?? {}
  return { page: live.page ? page : null, trail: structuredClone(live.trail), seen: [...live.seen], action: live.action ? { ...live.action } : null,
    pages: live.pages, actions: live.actions, last_at: live.last_at }
}
