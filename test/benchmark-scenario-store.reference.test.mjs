import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { startEnvironment } from '../benchmark/environment.js'
import { getTask } from '../benchmark/tasks.js'
import { client, fieldValue } from './helpers.js'

async function environment(t, family, platform = 'ps5') {
  const task = getTask(`bestbuy-${family}-${platform}`)
  assert.ok(task, `Missing scenario task ${family}`)
  const directory = await mkdtemp(path.join(tmpdir(), 'gta-scenario-store-'))
  const env = await startEnvironment({ task, directory })
  t.after(async () => { await env.close(); await rm(directory, { recursive: true, force: true }) })
  return { env, task, c: client(env.baseUrl) }
}

async function add(c, task, fulfillment = 'shipping', follow = true) {
  return c.post('/bestbuy/cart/add', { pid: task.scenario?.product_id || task.expected.sku, qty: '1', fulfillment }, { follow })
}

async function paymentPage(c, task, fulfillment = 'shipping') {
  const { customer, shipping_address: a, pickup } = task.request
  assert.equal((await c.get('/bestbuy/checkout/r/fast-track')).status, 200)
  assert.equal((await c.post('/bestbuy/checkout/contact', { emailAddress: customer.email, phoneNumber: customer.phone })).status, 200)
  if (fulfillment === 'pickup') {
    if (pickup?.person) {
      const p = pickup.person
      assert.equal((await c.post('/bestbuy/checkout/pickup', {
        action: 'confirmPerson', firstName: p.first_name, lastName: p.last_name,
        emailAddress: p.email, phoneNumber: p.phone,
      })).status, 200)
      return c.post('/bestbuy/checkout/pickup', {
        action: 'continue', firstName: p.first_name, lastName: p.last_name,
        emailAddress: p.email, phoneNumber: p.phone,
      })
    }
    return c.post('/bestbuy/checkout/pickup', { action: 'continue' })
  }
  assert.equal((await c.post('/bestbuy/checkout/shipping-address', {
    firstName: customer.first_name, lastName: customer.last_name, addressLine1: a.line1,
    city: a.city, state: a.state, postalCode: a.postal_code, useAsBilling: '1',
  })).status, 200)
  return c.post('/bestbuy/checkout/shipping-details', { levelOfService: 'standard' })
}

async function pay(c, task, page, number = task.request.payment.number) {
  const { customer: p, shipping_address: a } = task.request
  return c.post('/bestbuy/checkout/payment', {
    paymentMethod: 'card', reviewToken: fieldValue(page.text, 'reviewToken'), number,
    expirationDate: task.request.payment.expiry, cvv: task.request.payment.cvv,
    billingFirstName: p.first_name, billingLastName: p.last_name,
    billingAddressLine1: a.line1, billingCity: a.city, billingState: a.state, billingPostalCode: a.postal_code,
  })
}

test('provider rejection persists across valid retries and refresh; backup creates exactly one order', async t => {
  const { env, task, c } = await environment(t, 'payment_recovery')
  await add(c, task)
  let page = await paymentPage(c, task)
  const malformed = await pay(c, task, page, '123')
  assert.equal(malformed.status, 400)
  assert.doesNotMatch(malformed.text, /card was declined/i)
  assert.deepEqual((await env.snapshot()).scenarioEvents, [], 'input validation is not a provider rejection')
  page = await pay(c, task, malformed)
  assert.equal(page.status, 402)
  assert.match(page.text, /role="alert"[^>]*>[^<]*declined/i)
  assert.deepEqual((await env.snapshot()).orders, [])
  page = await c.get('/bestbuy/checkout/c/standard')
  page = await pay(c, task, page)
  assert.equal(page.status, 402, 'decline cannot be cleared by refresh or retry')
  const done = await pay(c, task, page, task.request.backup_payment.number)
  assert.equal(done.status, 200)
  assert.match(done.text, /Thanks for your order!/)
  const snapshot = await env.snapshot()
  assert.equal(snapshot.orders.length, 1)
  assert.equal(snapshot.orders[0].payment.last4, '4444')
  assert.equal(snapshot.scenarioEvents.filter(event => event.type === 'payment_rejected').length, 2)
  assert.doesNotMatch(JSON.stringify(snapshot), /4242424242424242|5555555555554444/)
})

test('declined payment cannot be bypassed by switching to simulated PayPal', async t => {
  const { env, task, c } = await environment(t, 'payment_decline')
  await add(c, task)
  let page = await paymentPage(c, task)
  assert.equal((await pay(c, task, page)).status, 402)
  page = await c.post('/bestbuy/checkout/payment', { action: 'paypal' })
  const paypal = await c.post('/bestbuy/checkout/payment', { paymentMethod: 'paypal', reviewToken: fieldValue(page.text, 'reviewToken') })
  assert.equal(paypal.status, 402)
  assert.doesNotMatch(paypal.text, /Thanks for your order!/)
  page = await c.post('/bestbuy/checkout/payment', { action: 'card' })
  assert.equal((await pay(c, task, page)).status, 402)
  const snapshot = await env.snapshot()
  assert.deepEqual(snapshot.orders, [])
  assert.equal(snapshot.scenarioEvents.filter(event => event.type === 'payment_method_rejected').length, 1)
})

test('lost shipping blocks direct checkout and fulfillment changes, while authorized pickup succeeds', async t => {
  const { env, task, c } = await environment(t, 'availability_fallback')
  assert.equal((await add(c, task, 'shipping', false)).status, 302)
  const checkout = await c.get('/bestbuy/checkout/r/fast-track')
  assert.equal(checkout.status, 400, 'skipping cart navigation must not preserve stale shipping stock')
  assert.match(checkout.text, /Shipping unavailable/)
  const line = fieldValue(checkout.text, 'line')
  const shipping = await c.post('/bestbuy/cart/update', { line, 'availability-selection': 'shipping' })
  assert.equal(shipping.status, 400)
  const pickup = await c.post('/bestbuy/cart/update', { line, 'availability-selection': 'pickup' })
  assert.equal(pickup.status, 200)
  const page = await paymentPage(c, task, 'pickup')
  const done = await pay(c, task, page)
  assert.equal(done.status, 200)
  const { orders } = await env.snapshot()
  assert.equal(orders.length, 1)
  assert.equal(orders[0].fulfillment.method, 'pickup')
  assert.equal(orders[0].meta.pickup_store_id, 'compton')
  assert.equal(orders[0].meta.pickup_person.first_name, task.request.pickup.person.first_name)
  assert.equal(orders[0].shipping_address, null)
})

test('complete availability loss survives refresh, removal, re-add and a fresh shopper session', async t => {
  const { env, task, c } = await environment(t, 'availability_loss')
  const cart = await add(c, task)
  assert.match(cart.text, /Shipping unavailable/)
  assert.match(cart.text, /Unavailable at this store/)
  const line = fieldValue(cart.text, 'line')
  assert.equal((await c.post('/bestbuy/cart/update', { line, 'availability-selection': 'pickup' })).status, 400)
  assert.equal((await c.get('/bestbuy/checkout/c/standard')).status, 400)
  assert.match((await c.get('/bestbuy/cart')).text, /Shipping unavailable/)
  await c.post('/bestbuy/cart/update', { line, action: 'remove' })
  assert.equal((await add(c, task)).status, 400)
  const fresh = client(env.baseUrl)
  assert.equal((await add(fresh, task, 'pickup')).status, 400)
  const snapshot = await env.snapshot()
  assert.deepEqual(snapshot.orders, [])
  assert.equal(snapshot.scenarioEvents.filter(event => event.type === 'availability_changed').length, 1)
})

test('required pickup saves the specified alternate person and rejects an unverified store', async t => {
  const { env, task, c } = await environment(t, 'pickup_required')
  await c.post('/bestbuy/stores/select', { store_id: 'burbank' })
  assert.equal((await add(c, task, 'pickup')).status, 400)
  await c.post('/bestbuy/stores/select', { store_id: 'compton' })
  assert.equal((await add(c, task, 'pickup')).status, 200)
  const page = await paymentPage(c, task, 'pickup')
  assert.equal((await pay(c, task, page)).status, 200)
  const { orders } = await env.snapshot()
  assert.equal(orders.length, 1)
  assert.equal(orders[0].fulfillment.store_location, 'Compton')
  assert.deepEqual(orders[0].meta.pickup_person, task.request.pickup.person)
})

test('seeded wrong-platform cart can be corrected and is not re-seeded on later navigation', async t => {
  const { env, task, c } = await environment(t, 'cart_recovery')
  let cart = await c.get('/bestbuy/cart')
  assert.match(cart.text, /XBOX Series X/)
  const wrongLine = fieldValue(cart.text, 'line')
  await c.post('/bestbuy/cart/update', { line: wrongLine, action: 'remove' })
  cart = await c.get('/bestbuy/cart')
  assert.doesNotMatch(cart.text, /class="bb-line-title"[^>]*>[^<]*XBOX/)
  await add(c, task)
  cart = await c.get('/bestbuy/cart')
  const targetLine = fieldValue(cart.text, 'line')
  await c.post('/bestbuy/cart/update', { line: targetLine, qty: '1' })
  const page = await paymentPage(c, task)
  assert.equal((await pay(c, task, page)).status, 200)
  const { orders, scenarioEvents } = await env.snapshot()
  assert.equal(orders.length, 1)
  assert.equal(orders[0].items.length, 1)
  assert.equal(orders[0].items[0].platform, 'ps5')
  assert.equal(orders[0].items[0].qty, 1)
  assert.equal(scenarioEvents.filter(event => event.type === 'cart_seeded').length, 1)
})

test('ordinary reference checkout continues accepting the primary card', async t => {
  const { env, task, c } = await environment(t, 'purchase')
  await add(c, task)
  const page = await paymentPage(c, task)
  assert.equal((await pay(c, task, page)).status, 200)
  const { orders } = await env.snapshot()
  assert.equal(orders.length, 1)
  assert.equal(orders[0].payment.last4, '4242')
})
