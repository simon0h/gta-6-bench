import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer, fieldValue } from './helpers.js'
import { ORDINARY } from '../stores/bestbuy/catalog.js'

const item = family => ORDINARY.find(p => p.family === family)
const card = { paymentMethod: 'card', number: '4242424242424242', expirationDate: '12/29', cvv: '123' }
const address = { firstName: 'Alex', lastName: 'Tester', addressLine1: '123 Ocean Drive', city: 'Miami', state: 'FL', postalCode: '33139', useAsBilling: '1' }
async function ready(c) {
  await c.post('/bestbuy/cart/add', { pid: item('controller').sku, fulfillment: 'shipping' })
  await c.get('/bestbuy/checkout/r/fast-track')
  await c.post('/bestbuy/checkout/contact', { emailAddress: 'verify@example.com', phoneNumber: '3055550123' })
  await c.post('/bestbuy/checkout/shipping-address', address)
  return c.post('/bestbuy/checkout/shipping-details', { levelOfService: 'standard' })
}

test('Best Buy verification: a trusted price change requires a new payment review', async () => {
  const srv = await startServer(), product = item('controller'), original = product.price
  try {
    const c = srv.client(), review = await ready(c)
    product.price = original + 10
    const changed = await c.post('/bestbuy/checkout/payment', { ...card, reviewToken: fieldValue(review.text, 'reviewToken') || '' })
    assert.equal(changed.status, 409)
    assert.match(changed.text, /Review the updated order/)
    assert.deepEqual(await c.json('/api/orders?store=bestbuy'), [])
    assert.doesNotMatch(changed.text, /4242424242424242/)
    const done = await c.post('/bestbuy/checkout/payment', { ...card, reviewToken: fieldValue(changed.text, 'reviewToken') })
    assert.match(done.text, /Thanks for your order!/)
    assert.equal((await c.json('/api/orders?store=bestbuy')).at(-1).items[0].unit_price, original + 10)
  } finally { product.price = original; await srv.close() }
})

test('Best Buy verification: cart and location changes invalidate review and PayPal selection', async () => {
  const srv = await startServer()
  try {
    for (const change of ['quantity', 'add', 'remove', 'save', 'zip', 'store']) {
      const c = srv.client()
      await ready(c)
      if (change === 'remove' || change === 'save') await c.post('/bestbuy/cart/add', { pid: item('mouse').sku, fulfillment: 'shipping' })
      const review = await c.post('/bestbuy/checkout/payment', { action: 'paypal' })
      const reviewToken = fieldValue(review.text, 'reviewToken')
      assert.ok(reviewToken)
      const cart = await c.get('/bestbuy/cart'), lines = [...cart.text.matchAll(/name="line" value="(\d+)"/g)].map(m => m[1])
      if (change === 'quantity') await c.post('/bestbuy/cart/update', { line: lines[0], qty: '2' })
      if (change === 'add') await c.post('/bestbuy/cart/add', { pid: item('mouse').sku, fulfillment: 'shipping' })
      if (change === 'remove' || change === 'save') await c.post('/bestbuy/cart/update', { line: lines.at(-1), action: change })
      if (change === 'zip') await c.post('/bestbuy/stores/zip', { postal_code: '90230' })
      if (change === 'store') await c.post('/bestbuy/stores/select', { store_id: 'burbank' })
      const stale = await c.post('/bestbuy/checkout/payment', { paymentMethod: 'paypal', reviewToken })
      assert.equal(stale.status, 409, change)
      assert.doesNotMatch(stale.text, /PayPal is your payment method|Thanks for your order!/)
      assert.deepEqual(await c.json('/api/orders?store=bestbuy'), [])
      const fresh = await c.get('/bestbuy/checkout/c/standard')
      assert.notEqual(fieldValue(fresh.text, 'reviewToken'), reviewToken)
      assert.equal((await c.post('/bestbuy/checkout/payment', { ...card, reviewToken })).status, 409, 'old tab stays invalid after another tab renders fresh review')
    }
  } finally { await srv.close() }
})

test('Best Buy verification: changed address and payment method reject a previously rendered token', async () => {
  const srv = await startServer()
  try {
    const c = srv.client(), initial = await ready(c), reviewToken = fieldValue(initial.text, 'reviewToken')
    assert.ok(reviewToken)
    await c.post('/bestbuy/checkout/shipping-address', { ...address, addressLine1: '555 Updated Road' })
    assert.equal((await c.post('/bestbuy/checkout/payment', { ...card, reviewToken })).status, 409)
    const review = await c.get('/bestbuy/checkout/c/standard')
    await c.post('/bestbuy/checkout/payment', { action: 'paypal' })
    assert.equal((await c.post('/bestbuy/checkout/payment', { ...card, reviewToken: fieldValue(review.text, 'reviewToken') })).status, 409)
    assert.deepEqual(await c.json('/api/orders?store=bestbuy'), [])
  } finally { await srv.close() }
})

test('Best Buy verification: cancelled mixed receipt removes estimates, pickup instructions and future charge copy', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    await ready(c)
    await c.post('/bestbuy/cart/add', { pid: item('mouse').sku, fulfillment: 'pickup' })
    const review = await c.post('/bestbuy/checkout/pickup', { action: 'continue' })
    const done = await c.post('/bestbuy/checkout/payment', { ...card, reviewToken: fieldValue(review.text, 'reviewToken') })
    assert.match(done.text, /Thanks for your order!/)
    const order = (await c.json('/api/orders?store=bestbuy')).at(-1)
    assert.deepEqual(order.meta.items_fulfillment.map(i => i.fulfillment), ['shipping', 'pickup'])
    assert.equal(order.meta.product_details.length, 2)
    await c.post(`/bestbuy/account/orders/${order.id}/action`, { action: 'cancel', reason: 'Local verification' })
    const receipt = await c.get(done.url)
    assert.match(receipt.text, /Order status: <b>cancelled/)
    assert.doesNotMatch(receipt.text, /Estimated delivery in|Estimated pickup in|preauthorized now|Bring your government-issued|brings their photo ID/)
    assert.match(receipt.text, /does not process charges or refunds/)
  } finally { await srv.close() }
})
