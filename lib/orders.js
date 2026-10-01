import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import path from 'node:path'
import { randomBytes } from 'node:crypto'
import { isPlatform, isEdition, isFormat } from './catalog.js'
import { captchaReceipt } from './captcha.js'

// Ground truth for the benchmark: every completed checkout in every store
// lands here, normalized. Persisted to data/orders.json unless disabled.

let file = null
let orders = []

export function configureOrders({ file: f } = {}) {
  file = f || null
  orders = []
  if (file && existsSync(file)) {
    try { orders = JSON.parse(readFileSync(file, 'utf8')) } catch { orders = [] }
  }
}

function persist() {
  if (!file) return
  mkdirSync(path.dirname(file), { recursive: true })
  writeFileSync(file, JSON.stringify(orders, null, 2))
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
 * @param {string} o.currency         USD|GBP|AUD
 * @param {object} [o.meta]           anything store-specific (membership applied, pickup person, etc.)
 */
export function recordOrder(o) {
  assert(o && typeof o.store === 'string' && o.store, 'store is required')
  assert(typeof o.order_number === 'string' && o.order_number, 'order_number is required')
  assert(Array.isArray(o.items) && o.items.length > 0, 'items must be a non-empty array')
  for (const it of o.items) {
    assert(Number.isInteger(it.qty) && it.qty > 0, 'qty must be a positive integer')
    assert(typeof it.unit_price === 'number', 'unit_price must be a number')
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
  assert(o.totals && typeof o.totals.total === 'number', 'totals.total is required')
  assert(['USD', 'GBP', 'AUD'].includes(o.currency), 'currency must be USD|GBP|AUD')

  const captcha = captchaReceipt(o.session, o.store)
  const order = {
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
  }
  orders.push(order)
  persist()
  return order
}

export function listOrders({ store, run } = {}) {
  return orders.filter(o => (!store || o.store === store) && (!run || o.run_id === run))
}

export function getOrder(id) {
  return orders.find(o => o.id === id || o.order_number === id) ?? null
}

export function clearOrders() {
  orders = []
  persist()
}
