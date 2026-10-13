import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { startEnvironment } from '../benchmark/environment.js'
import { getTask } from '../benchmark/tasks.js'
import { client, fieldValue } from './helpers.js'

const base = '/rockstar-store'
const person = { first_name: 'Morgan', last_name: 'Rivera', email: 'morgan.rivera@example.com', phone: '2025550178' }
async function environment(t, type) {
  const task = structuredClone(getTask('rockstar-store-purchase-ps5'))
  if (type) task.scenario = { type, product_id: '357725-US', ...(type === 'cart_recovery' ? { alternate_product_id: '357733-US' } : {}), ...(['availability_fallback', 'pickup_required'].includes(type) ? { pickup_store: 'miami' } : {}) }
  const directory = await mkdtemp(path.join(tmpdir(), 'gta-rockstar-scenario-'))
  const env = await startEnvironment({ task, directory })
  t.after(async () => { await env.close(); await rm(directory, { recursive: true, force: true }) })
  return { env, task, c: client(env.baseUrl) }
}
async function start(c) {
  await c.post(`${base}/game/buy-gta-vi/preorder`, { platform: 'ps5' })
  await c.post(`${base}/verify-age`, { month: '1', day: '1', year: '1990' })
  return c.post(`${base}/checkout/guest`)
}
async function address(c, task) {
  const { customer: p, shipping_address: a } = task.request
  return c.post(`${base}/checkout/shipping-address`, { first_name: p.first_name, last_name: p.last_name, country: a.country, city: a.city, region: a.state, postal_code: a.postal_code, street_address: a.line1, phone: p.phone, email: p.email })
}
const pickupBody = (store = 'miami') => ({ shipping_method: 'pickup', pickup_store: store, ...Object.fromEntries(Object.entries(person).map(([k, v]) => [`pickup_${k}`, v])) })
async function pay(c, task, page, number = '4242424242424242') {
  return c.post(`${base}/checkout/payment`, { payment_method: 'card', review_token: fieldValue(page.text, 'review_token'), card_number: number, expiry: task.request.payment.expiry, cvc: task.request.payment.cvv, cardholder_name: task.request.payment.name })
}

test('Rockstar provider decline persists across refresh and rejects PayPal; backup succeeds once', async t => {
  const { env, task, c } = await environment(t, 'payment_recovery')
  await start(c); await address(c, task)
  let page = await c.post(`${base}/checkout/shipping-method`, { shipping_method: 'standard' })
  page = await pay(c, task, page, '123')
  assert.equal(page.status, 400)
  assert.deepEqual((await env.snapshot()).scenarioEvents, [])
  page = await pay(c, task, page)
  assert.equal(page.status, 402)
  assert.match(page.text, /card was declined/i)
  page = await c.get(`${base}/checkout/payment`)
  page = await pay(c, task, page)
  assert.equal(page.status, 402)
  page = await c.post(`${base}/checkout/payment`, { payment_method: 'paypal', review_token: fieldValue(page.text, 'review_token') })
  assert.equal(page.status, 402)
  assert.equal((await pay(c, task, page, '5555555555554444')).status, 200)
  const snapshot = await env.snapshot()
  assert.equal(snapshot.orders.length, 1)
  assert.equal(snapshot.orders[0].payment.last4, '4444')
  assert.equal(snapshot.scenarioEvents.filter(event => event.type === 'payment_rejected').length, 2)
  assert.doesNotMatch(JSON.stringify(snapshot), /4242424242424242|5555555555554444/)
})

test('Rockstar availability loss blocks checkout and survives reselecting in a fresh session', async t => {
  const { env, c } = await environment(t, 'availability_loss')
  assert.equal((await start(c)).status, 409)
  assert.match((await c.get(`${base}/checkout/payment`)).text, /Shipping unavailable/)
  assert.equal((await start(client(env.baseUrl))).status, 409)
  const snapshot = await env.snapshot()
  assert.equal(snapshot.orders.length, 0)
  assert.equal(snapshot.scenarioEvents.filter(event => event.type === 'availability_changed').length, 1)
})

test('Rockstar fallback rejects forged shipping and wrong location, then records pickup separately from billing', async t => {
  const { env, task, c } = await environment(t, 'availability_fallback')
  await start(c)
  let page = await address(c, task)
  assert.match(page.text, /Shipping unavailable/)
  assert.match(page.text, /value="standard"[^>]*disabled/)
  assert.equal((await c.post(`${base}/checkout/shipping-method`, { shipping_method: 'standard' })).status, 400)
  assert.equal((await c.post(`${base}/checkout/shipping-method`, pickupBody('orlando'))).status, 400)
  assert.equal((await c.post(`${base}/checkout/shipping-method`, { ...pickupBody(), pickup_email: 'invalid' })).status, 400)
  page = await c.post(`${base}/checkout/shipping-method`, pickupBody())
  assert.match(page.text, /Pickup at Miami collection point/)
  const done = await pay(c, task, page)
  assert.equal(done.status, 200)
  assert.match(done.text, /Morgan Rivera/)
  const { orders } = await env.snapshot()
  assert.equal(orders.length, 1)
  assert.equal(orders[0].fulfillment.method, 'pickup')
  assert.equal(orders[0].shipping_address, null)
  assert.equal(orders[0].billing_address.line1, task.request.shipping_address.line1)
  assert.equal(orders[0].customer.first_name, task.request.customer.first_name)
  assert.equal(orders[0].meta.pickup_store_id, 'miami')
  assert.deepEqual(orders[0].meta.pickup_person, person)
  assert.deepEqual(orders[0].meta.items_fulfillment, [{ sku: '357725-US', fulfillment: 'pickup' }])
})

test('Rockstar pickup requirements use a named person and bind the final review to the pickup details', async t => {
  const { env, task, c } = await environment(t, 'pickup_required')
  await start(c); await address(c, task)
  const oldPage = await c.post(`${base}/checkout/shipping-method`, pickupBody())
  await c.post(`${base}/checkout/shipping-method`, { ...pickupBody(), pickup_first_name: 'Taylor' })
  const stale = await pay(c, task, oldPage)
  assert.equal(stale.status, 409)
  assert.equal((await env.snapshot()).orders.length, 0)
})

test('Rockstar existing cart mistakes can be removed before its native single-copy preorder', async t => {
  const { env, task, c } = await environment(t, 'cart_recovery')
  let cart = await c.get(`${base}/cart`)
  assert.match(cart.text, /Xbox Series X/)
  assert.match(cart.text, /value="2" selected/)
  await c.post(`${base}/cart/update`, { sku: '357733-US', action: 'remove' })
  cart = await c.get(`${base}/cart`)
  assert.match(cart.text, /Your cart is empty/)
  await start(c); await address(c, task)
  const page = await c.post(`${base}/checkout/shipping-method`, { shipping_method: 'standard' })
  assert.equal((await pay(c, task, page)).status, 200)
  const snapshot = await env.snapshot()
  assert.equal(snapshot.orders.length, 1)
  assert.equal(snapshot.orders[0].items[0].sku, '357725-US')
  assert.equal(snapshot.orders[0].items[0].qty, 1)
  assert.equal(snapshot.scenarioEvents.filter(event => event.type === 'cart_seeded').length, 1)
})

test('Rockstar normal checkout neither exposes nor accepts benchmark pickup', async t => {
  const { env, task, c } = await environment(t)
  await start(c)
  const methods = await address(c, task)
  assert.doesNotMatch(methods.text, /name="pickup_store"/)
  assert.equal((await c.post(`${base}/checkout/shipping-method`, pickupBody())).status, 400)
  const page = await c.post(`${base}/checkout/shipping-method`, { shipping_method: 'standard' })
  assert.equal((await pay(c, task, page)).status, 200)
  const { orders } = await env.snapshot()
  assert.equal(orders.length, 1)
  assert.equal(orders[0].payment.last4, '4242')
})
