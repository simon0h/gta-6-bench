import { createHmac, timingSafeEqual } from 'node:crypto'

export const TRAVERSAL_KINDS = ['request', 'page', 'click', 'submit', 'change', 'navigation', 'start', 'complete']
export const BROWSER_KINDS = ['page', 'click', 'submit', 'change', 'navigation']
const NAVIGATIONS = ['navigate', 'reload', 'back_forward', 'push', 'replace', 'hash']
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const KEYS = new Set(['trial_id', 'id', 'kind', 'at', 'elapsed_ms', 'page_id', 'parent_page_id', 'path', 'method', 'status', 'duration_ms', 'label', 'navigation', 'html'])
const fail = message => Object.assign(new Error(message), { status: 400 })
const signature = (secret, id) => createHmac('sha256', secret).update(id).digest('base64url')

// Keep paths useful without storing search terms, credentials or capability URLs.
export function traversalPath(value) {
  if (typeof value !== 'string' || !value || value.length > 8192) return undefined
  try {
    return new URL(value, 'https://trace.invalid').pathname
      .replace(/(\/agent\/)[^/]+/gi, '$1[task]')
      .replace(/[\u0000-\u001f\u007f]/g, '').slice(0, 1000)
  } catch { return undefined }
}

export function traversalLabel(value) {
  if (typeof value !== 'string') return undefined
  // Instrumentation sends control names only. Apply additional redaction before
  // accepting browser-supplied labels; field values and bodies are never read.
  return value.replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[email]')
    .replace(/\b(?:\d[ -]?){12,19}\b/g, '[number]')
    .replace(/\b[A-Za-z0-9_-]{32,}\b/g, '[identifier]')
    .replace(/\s+/g, ' ').trim().slice(0, 120) || undefined
}

export function signPageId(secret, id) {
  if (!UUID.test(id || '')) throw fail('Invalid page identifier')
  return `${id}.${signature(secret, id)}`
}

export function validPageId(secret, value) {
  if (typeof secret !== 'string' || typeof value !== 'string' || value.length !== 80) return false
  const [id, supplied, extra] = value.split('.')
  if (extra || !UUID.test(id) || !/^[A-Za-z0-9_-]{43}$/.test(supplied || '')) return false
  return timingSafeEqual(Buffer.from(supplied), Buffer.from(signature(secret, id)))
}

export function browserEvent(input, pageId, secret) {
  if (!input || typeof input !== 'object' || Array.isArray(input) || !BROWSER_KINDS.includes(input.kind)) throw fail('Invalid browser event')
  const event = { kind: input.kind, page_id: pageId }
  if (input.parent_page_id !== undefined) {
    if (!validPageId(secret, input.parent_page_id)) throw fail('Invalid parent page identifier')
    event.parent_page_id = input.parent_page_id
  }
  const path = traversalPath(input.path), label = traversalLabel(input.label)
  if (path) event.path = path
  if (label) event.label = label
  if (input.navigation !== undefined) {
    if (!NAVIGATIONS.includes(input.navigation)) throw fail('Invalid navigation type')
    event.navigation = input.navigation
  }
  return event
}

export function requestEvent(input, secret) {
  const event = { kind: 'request' }
  const path = traversalPath(input.path)
  if (path) event.path = path
  if (typeof input.method === 'string' && /^[A-Z]{1,16}$/.test(input.method)) event.method = input.method
  if (Number.isInteger(input.status) && input.status >= 100 && input.status <= 599) event.status = input.status
  if (Number.isFinite(input.duration_ms) && input.duration_ms >= 0) event.duration_ms = Math.round(input.duration_ms)
  event.html = Boolean(input.html)
  if (event.html && input.page_id) event.page_id = signPageId(secret, input.page_id)
  return event
}

export function dynamicTraversalRequest(path, contentType = '') {
  const pathname = traversalPath(path) || ''
  if (/^\/(?:assets|static|images|fonts)(?:\/|$)/i.test(pathname)
    || /\.(?:css|[cm]?js|map|png|jpe?g|gif|webp|avif|ico|svg|woff2?|ttf|otf|eot|mp[34]|webm|ogg|wav|pdf)$/i.test(pathname)) return false
  return !/^(?:image\/|font\/|audio\/|video\/)|(?:javascript|text\/css|application\/pdf)/i.test(contentType)
}

export function validateTraversalEvent(event, trial) {
  if (!event || typeof event !== 'object' || Array.isArray(event) || Object.keys(event).some(key => !KEYS.has(key))
    || event.trial_id !== trial.id || !TRAVERSAL_KINDS.includes(event.kind)
    || !Number.isSafeInteger(event.id) || event.id < 1 || event.id > trial.traversal.event_count
    || typeof event.at !== 'string' || !Number.isFinite(Date.parse(event.at))
    || !Number.isSafeInteger(event.elapsed_ms) || event.elapsed_ms < 0
    || (event.page_id !== undefined && !validPageId(trial.traversal_secret, event.page_id))
    || (event.parent_page_id !== undefined && !validPageId(trial.traversal_secret, event.parent_page_id))
    || (BROWSER_KINDS.includes(event.kind) && !event.page_id)
    || (event.path !== undefined && traversalPath(event.path) !== event.path)
    || (event.label !== undefined && traversalLabel(event.label) !== event.label)
    || (event.navigation !== undefined && !NAVIGATIONS.includes(event.navigation))
    || (event.method !== undefined && (typeof event.method !== 'string' || !/^[A-Z]{1,16}$/.test(event.method)))
    || (event.status !== undefined && (!Number.isInteger(event.status) || event.status < 100 || event.status > 599))
    || (event.duration_ms !== undefined && (!Number.isSafeInteger(event.duration_ms) || event.duration_ms < 0))
    || (event.html !== undefined && typeof event.html !== 'boolean')) throw fail('Invalid traversal event checkpoint')
}
