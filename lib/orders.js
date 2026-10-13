import { readFileSync, writeFileSync, mkdirSync, existsSync, openSync, closeSync, fsyncSync, renameSync, unlinkSync } from 'node:fs'
import path from 'node:path'
import { randomBytes } from 'node:crypto'
import { isPlatform, isEdition, isFormat } from './catalog.js'
import { captchaReceipt } from './captcha.js'
import { assertScenarioOrder, recordScenarioOrderEvidence, scenarioEventSequence } from './benchmark-scenarios.js'

// Ground truth for the benchmark: every completed checkout in every store
// lands here, normalized. Persisted to data/orders.json unless disabled.

let file = null
let orders = []
let benchmarkMetadata = null
let finalized = false

export function configureOrders({ file: f, metadata } = {}) {
  const nextFile = f || null
  if (metadata !== undefined && (!metadata || typeof metadata !== 'object' || Array.isArray(metadata) || ![Object.prototype, null].includes(Object.getPrototypeOf(metadata)))) {
    throw new Error('Order benchmark metadata must be a plain object')
  }
  const nextMetadata = metadata === undefined ? null : structuredClone(metadata)
  let nextOrders = []
  if (nextFile && existsSync(nextFile)) {
    try {
      nextOrders = JSON.parse(readFileSync(nextFile, 'utf8'))
      if (!Array.isArray(nextOrders) || nextOrders.some(order => !validSavedOrder(order))) {
        throw new Error('Expected an array of valid order records')
      }
    } catch (cause) {
      throw new Error(`Cannot load order evidence from ${nextFile}: ${cause.message}`, { cause })
    }
  }
  // A failed reconfiguration must not discard the previously loaded evidence.
  file = nextFile
  orders = nextOrders
  benchmarkMetadata = nextMetadata
  finalized = false
}

// Finishing evaluation seals the evidence even if an asynchronous storefront
// handler was already in progress when its HTTP access was disabled.
export function finalizeOrders() { finalized = true }

function assertWritable() {
  if (finalized) throw new Error('Order evidence is finalized')
}

function validSavedOrder(order) {
  return order && typeof order === 'object' && !Array.isArray(order)
    && ['id', 'store', 'order_number'].every(key => typeof order[key] === 'string' && order[key].length > 0)
    && Array.isArray(order.items) && order.items.length > 0
    && order.items.every(item => item && Number.isInteger(item.qty) && item.qty > 0 && Number.isFinite(item.unit_price))
    && typeof order.customer?.email === 'string'
    && typeof order.payment?.method === 'string'
    && Number.isFinite(order.totals?.total)
}

function persist(nextOrders = orders) {
  if (!file) return
  mkdirSync(path.dirname(file), { recursive: true })
  const temporary = `${file}.${process.pid}.${randomBytes(8).toString('hex')}.tmp`
  let fd
  try {
    fd = openSync(temporary, 'wx', 0o600)
    writeFileSync(fd, JSON.stringify(nextOrders, null, 2))
    fsyncSync(fd)
    closeSync(fd)
    fd = undefined
    renameSync(temporary, file)
  } finally {
    if (fd !== undefined) closeSync(fd)
    if (existsSync(temporary)) unlinkSync(temporary)
  }
}

function assert(cond, msg) { if (!cond) throw new Error(`recordOrder: ${msg}`) }

/**
 * Record a completed order. Throws on malformed input so a store clone
 * cannot silently record something the benchmark cannot grade.
 *
 * @param {object} o
 * @param {string} o.store            store slug, e.g. "gamestop"
 * @param {string} o.order_number     the customer-facing order number, in the store's own format
 * @param {object} o.session          req.session (for session_id + run_id)
 * @param {Array<{platform:string, edition:string, format:string, qty:number, unit_price:number, title?:string, sku?:string} | {kind:'other', title:string, qty:number, unit_price:number, sku?:string}>} o.items
 * @param {object} o.customer         { email, first_name, last_name, phone?, account_id? }
 * @param {object} o.fulfillment      { method: 'ship'|'pickup'|'digital'|'delivery', option?: string, store_location?: string, eta?: string }
 * @param {object|null} o.shipping_address  { line1, line2?, city, state, postal_code, country }
 * @param {object|null} o.billing_address
 * @param {object} o.payment          { method: 'card'|'paypal'|'gift_card'|'wallet'|..., brand?, last4?, name_on_card? }  NEVER the full number
 * @param {object} o.totals           { subtotal, shipping, tax, discount?, total }
 * @param {string} o.currency         USD|GBP|AUD|KRW
 * @param {object} [o.meta]           anything store-specific (membership applied, pickup person, etc.)
 */
export function recordOrder(o) {
  assertWritable()
  assertScenarioOrder(o)
  assert(o && typeof o.store === 'string' && o.store, 'store is required')
  assert(typeof o.order_number === 'string' && o.order_number, 'order_number is required')
  assert(Array.isArray(o.items) && o.items.length > 0, 'items must be a non-empty array')
  for (const it of o.items) {
    assert(Number.isInteger(it.qty) && it.qty > 0, 'qty must be a positive integer')
    assert(Number.isFinite(it.unit_price), 'unit_price must be a finite number')
    if (it.kind === 'other') {
      // A distractor product (controller, soundtrack, ...). Grading treats it as "wrong item".
      assert(typeof it.title === 'string' && it.title, 'other items need a title')
      continue
    }
    assert(isPlatform(it.platform), `unknown platform "${it.platform}" (use ps5|xbox)`)
    assert(isEdition(it.edition), `unknown edition "${it.edition}" (use standard|ultimate)`)
    assert(isFormat(it.format), `unknown format "${it.format}" (use physical|code-in-box|digital)`)
  }
  assert(o.customer && typeof o.customer.email === 'string', 'customer.email is required')
  assert(o.fulfillment && typeof o.fulfillment.method === 'string', 'fulfillment.method is required')
  assert(o.payment && typeof o.payment.method === 'string', 'payment.method is required')
  assert(o.payment.number === undefined && o.payment.cvv === undefined, 'never store card number or cvv')
  assert(o.totals && Number.isFinite(o.totals.total), 'totals.total must be a finite number')
  assert(['USD', 'GBP', 'AUD', 'KRW'].includes(o.currency), 'currency must be USD|GBP|AUD|KRW')

  const captcha = captchaReceipt(o.session, o.store)
  recordScenarioOrderEvidence(o)
  // Completed purchases are snapshots. Later profile, address or catalog edits
  // must not mutate their recorded totals, payment summary or purchased rights.
  const order = structuredClone({
    id: randomBytes(8).toString('hex'),
    store: o.store,
    order_number: o.order_number,
    created_at: new Date().toISOString(),
    session_id: o.session?.id ?? null,
    run_id: o.session?.run_id ?? null,
    items: o.items.map(it => it.kind === 'other'
      ? { kind: 'other', qty: it.qty, unit_price: it.unit_price, title: it.title, sku: it.sku ?? null }
      : { kind: 'game', platform: it.platform, edition: it.edition, format: it.format,
          qty: it.qty, unit_price: it.unit_price, title: it.title ?? null, sku: it.sku ?? null }),
    customer: o.customer,
    fulfillment: o.fulfillment,
    shipping_address: o.shipping_address ?? null,
    billing_address: o.billing_address ?? null,
    payment: o.payment,
    totals: o.totals,
    currency: o.currency,
    meta: { ...o.meta, ...(captcha ? { captcha } : {}) },
    ...(benchmarkMetadata ? { benchmark: { ...benchmarkMetadata, ...(scenarioEventSequence() !== null ? { scenario_event_sequence: scenarioEventSequence() } : {}) } } : {}),
  })
  persist([...orders, order])
  orders.push(order)
  return order
}

export function listOrders({ store, run } = {}) {
  return orders.filter(o => (!store || o.store === store) && (!run || o.run_id === run))
}

export function getOrder(id) {
  return orders.find(o => o.id === id || o.order_number === id) ?? null
}

export function clearOrders() {
  assertWritable()
  persist([])
  orders = []
}

export function exportOrders() { return structuredClone(orders) }

export function prepareOrderImport(snapshot) {
  assertWritable()
  if (!Array.isArray(snapshot)) throw new Error('Orders must be an array')
  const next = structuredClone(snapshot)
  const ids = new Set()
  for (const order of next) {
    if (!validSavedOrder(order) || ids.has(order.id)
      || order.payment.number !== undefined || order.payment.cvv !== undefined) {
      throw new Error('Invalid order checkpoint')
    }
    ids.add(order.id)
  }
  return () => {
    assertWritable()
    persist(next)
    orders = next
  }
}

// Customer actions append lifecycle metadata without rewriting the completed
// transaction, its items or payment. Authorization is mandatory at this boundary.
export function appendOrderEvent(orderId, { store, session_id, action, status, reason }) {
  assertWritable()
  const order = getOrder(orderId)
  if (!order || order.store !== store || !session_id || order.session_id !== session_id) throw new Error('Order not found')
  if (!['cancel', 'return'].includes(action) || !['cancelled', 'return_requested'].includes(status)) throw new Error('Unsupported order event')
  const meta = { ...order.meta, lifecycle: [...(order.meta?.lifecycle || []), { action, status, reason: String(reason || '').trim().slice(0, 1000), created_at: new Date().toISOString() }] }
  persist(orders.map(item => item === order ? { ...order, meta } : item))
  order.meta = meta
  return order
}
