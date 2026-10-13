import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer } from './helpers.js'
import { byAsin } from '../stores/amazon/data.js'
import { getOrder } from '../lib/orders.js'

const KETTLE = 'A0HOMEKT1', PS5 = 'B0H6K928WL', CONSOLE = 'B0CRPS5SLM'
const ADDRESS = { fullName: 'Alex Tester', phoneNumber: '3055550123', addressLine1: '123 Ocean Dr', city: 'Miami', state: 'FL', postalCode: '33139', countryCode: 'US' }
const CARD = { cardNumber: '4242424242424242', nameOnCard: 'Alex Tester', expMonth: '12', expYear: '2031' }
async function signin(c) {
  await c.post('/amazon/ax/claim', { email: 'tester@example.com' })
  await c.post('/amazon/ap/signin/password', { password: 'Password123!' })
}
async function review(c, asin = KETTLE, quantity = '1') {
  await c.get(`/amazon/checkout/entry/buynow?ASIN=${asin}&quantity=${quantity}`)
  await c.post('/amazon/gp/buy/addressselect', ADDRESS)
  return c.post('/amazon/gp/buy/payselect', CARD)
}

test('amazon verification: checkout rejects stock changes after review and duplicate placement', async () => {
  const srv = await startServer(), product = byAsin(KETTLE), originalStock = product.stock
  try {
    const c = srv.client(); await signin(c); await review(c, KETTLE, '2')
    product.stock = 1
    const rejected = await c.post('/amazon/gp/buy/spc', { action: 'place', delivery: 'standard' })
    assert.equal(rejected.status, 400)
    assert.equal((await c.json('/api/orders?store=amazon')).length, 0)
    product.stock = originalStock
    assert.match((await c.post('/amazon/gp/buy/spc', { action: 'place', delivery: 'standard' })).text, /Order placed, thanks!/)
    await c.post('/amazon/gp/buy/spc', { action: 'place', delivery: 'standard' })
    assert.equal((await c.json('/api/orders?store=amazon')).length, 1)
    await c.post('/amazon/cart/add', { asin: KETTLE, quantity: '2' })
    await c.post('/amazon/cart/update', { asin: KETTLE, action: 'save' })
    product.stock = 0
    assert.equal((await c.post('/amazon/cart/update', { asin: KETTLE, action: 'move' })).status, 400)
    assert.match((await c.get('/amazon/cart')).text, /Saved for later/)
  } finally { product.stock = originalStock; await srv.close() }
})

test('amazon verification: list quantities and unavailable stock cannot bypass purchase limits', async () => {
  const srv = await startServer()
  try {
    const c = srv.client(); await signin(c)
    await c.post('/amazon/hz/wishlist/add', { asin: CONSOLE })
    const path = `/amazon/hz/wishlist/ls/default/items/${CONSOLE}`
    await c.post(path, { action: 'update', quantity: '3', priority: 'High', note: 'Wait for stock' })
    assert.equal((await c.post(path, { action: 'cart', quantity: '1', price: '0' })).status, 400)
    assert.match((await c.get('/amazon/cart')).text, /Your Amazon Cart is empty/)
    await c.post(path, { action: 'update', quantity: '2', priority: 'High' })
    await c.post(path, { action: 'cart', quantity: '5', price: '0' })
    await c.post(path, { action: 'cart' })
    assert.match((await c.get('/amazon/cart')).text, /Subtotal \(2 items\)/)
    await c.post('/amazon/hz/wishlist/add', { asin: 'A0ELECPL01' })
    assert.equal((await c.post('/amazon/hz/wishlist/ls/default/items/A0ELECPL01', { action: 'cart' })).status, 400)
    assert.equal((await c.post('/amazon/hz/wishlist/add', { asin: 'UNKNOWN' })).status, 400)
  } finally { await srv.close() }
})

test('amazon verification: delivered returns are owned, idempotent and retain the original receipt', async () => {
  const srv = await startServer()
  try {
    const c = srv.client(), foreign = srv.client(); await signin(c); await signin(foreign)
    await review(c); await c.post('/amazon/gp/buy/spc', { action: 'place' })
    const order = (await c.json('/api/orders?store=amazon'))[0], actual = getOrder(order.id)
    actual.meta.lifecycle = [{ status: 'delivered', created_at: new Date().toISOString(), reason: 'Test-only delivered fixture' }]
    const path = `/amazon/orders/${order.id}/return`
    assert.equal((await foreign.get(path)).status, 404)
    assert.equal((await foreign.post(path, { reason: 'Item damaged' })).status, 404)
    assert.match((await c.get(path)).text, /Request return/)
    assert.match((await c.post(path, { reason: 'Item damaged' })).text, /Return requested/)
    await c.post(path, { reason: 'Item damaged' })
    assert.equal(actual.meta.lifecycle.length, 2)
    assert.deepEqual(actual.items, order.items)
    assert.deepEqual(actual.payment, order.payment)
    assert.deepEqual(actual.totals, order.totals)
  } finally { await srv.close() }
})

test('amazon verification: arbitrary ASINs and client item metadata cannot alter canonical or ordinary orders', async () => {
  const srv = await startServer()
  try {
    const c = srv.client(); await signin(c)
    for (const asin of ['UNKNOWN', 'A0ELECPL01']) {
      assert.equal((await c.get(`/amazon/checkout/entry/buynow?ASIN=${asin}&quantity=1`)).status, 400)
      assert.equal((await c.post('/amazon/gp/product/handle-buy-box', { ASIN: asin, quantity: '1' })).status, 400)
    }
    for (const asin of [PS5, KETTLE]) {
      await review(c, asin)
      const done = await c.post('/amazon/gp/buy/spc', { action: 'place', ASIN: 'UNKNOWN', price: '0.01', kind: 'game', platform: 'xbox', edition: 'ultimate', quantity_UNKNOWN: '99' })
      assert.match(done.text, /Order placed, thanks!/)
    }
    const [game, ordinary] = await c.json('/api/orders?store=amazon')
    assert.equal(game.items[0].sku, PS5); assert.equal(game.items[0].platform, 'ps5'); assert.equal(game.items[0].edition, 'standard'); assert.equal(game.items[0].unit_price, 79.99)
    assert.equal(ordinary.items[0].kind, 'other'); assert.equal(ordinary.items[0].unit_price, 32.99)
    assert.doesNotMatch(JSON.stringify([game, ordinary]), /4242424242424242/)
  } finally { await srv.close() }
})

test('amazon verification: switching accounts requires a new checkout address and payment', async () => {
  const srv = await startServer()
  try {
    const c = srv.client(); await signin(c); await review(c)
    await c.get('/amazon/ap/signin?openid.return_to=%2Fgp%2Fbuy%2Fspc')
    await c.post('/amazon/ax/claim', { email: 'amazon-verifier-other@example.com' })
    await c.post('/amazon/ap/register', { customerName: 'Other Shopper', email: 'amazon-verifier-other@example.com', password: 'Another123!', passwordCheck: 'Another123!' })
    const reviewPage = await c.get('/amazon/gp/buy/spc')
    assert.match(reviewPage.url, /\/gp\/buy\/addressselect$/)
    assert.doesNotMatch(reviewPage.text, /123 Ocean Dr|ending in 4242/)
    await c.post('/amazon/gp/buy/spc', { action: 'place' })
    assert.equal((await c.json('/api/orders?store=amazon')).length, 0)
  } finally { await srv.close() }
})
