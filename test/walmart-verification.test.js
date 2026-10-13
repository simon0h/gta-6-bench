import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer, fieldValue } from './helpers.js'
import { byId } from '../stores/walmart/data.js'

const ADDRESS = { firstName: 'Alex', lastName: 'Tester', address1: '123 Test Ocean Dr', city: 'Miami', state: 'FL', zip: '33139', phone: '3055550123' }
const CARD = { method: 'card', cardNumber: '4242424242424242', expMonth: '12', expYear: '29', cvv: '123', firstName: 'Alex', lastName: 'Tester', phone: '3055550123', billingSame: '1' }

test('walmart verification: repeated identity and checkout fields return validation without changing saved state', async () => {
  const srv = await startServer()
  const duplicate = (fields, key) => { const body = new URLSearchParams(fields); body.append(key, 'Unexpected second value'); return body }
  try {
    const c = srv.client()
    const signup = await c.post('/walmart/account/sign-up', duplicate({ firstName:'Alex', lastName:'Tester', email:'duplicate-check@example.com', phone:'3055550123', password:'Password123!' }, 'firstName'))
    assert.equal(signup.status, 400)
    assert.doesNotMatch(signup.text, /value="Password123!"/)
    await c.post('/walmart/cart/add', {pid:'310000002', variant:'travel'})
    await c.post('/walmart/account/login?state=%2Fcart', {identifier:'tester@example.com'})
    await c.post('/walmart/account/signin/withpassword', {password:'Password123!'})
    await c.post('/walmart/cart/checkout', {})
    assert.equal((await c.post('/walmart/checkout/address', duplicate(ADDRESS, 'firstName'))).status, 400)
    assert.equal((await c.post('/walmart/checkout/address', ADDRESS)).status, 200)
    const invalidCard = await c.post('/walmart/checkout/payment', duplicate(CARD, 'firstName'))
    assert.equal(invalidCard.status, 400)
    assert.doesNotMatch(invalidCard.text, /4242424242424242|name="cvv"[^>]*value="123"/)
    const ready = await c.post('/walmart/checkout/payment', CARD)
    const confirmed = await c.post('/walmart/checkout/place-order', {review_token:fieldValue(ready.text, 'review_token')})
    assert.match(confirmed.text, /Thanks for your order!/)
    const [order] = await c.json('/api/orders?store=walmart')
    assert.equal(order.customer.first_name, 'Alex')
    assert.equal(order.items[0].kind, 'other')
  } finally { await srv.close() }
})

test('walmart verification: stale cart and price reviews require review again before placing an order', async () => {
  const srv = await startServer(), product = byId('310000002'), variant = product.variants.find(v => v.id === 'travel'), originalPrice = variant.price
  try {
    const c = srv.client()
    assert.equal((await c.post('/walmart/cart/add', { pid: 'forged', price: '0.01', stock: '99' })).status, 404)
    for (const qty of ['0', '-1', '1.5', '99']) {
      assert.equal((await c.post('/walmart/cart/add', { pid: product.id, variant: 'travel', qty, stock: '99' })).status, 409)
    }
    await c.post('/walmart/cart/add', { pid: product.id, variant: 'travel' })
    await c.post('/walmart/account/login?state=%2Fcart', { identifier: 'tester@example.com' })
    await c.post('/walmart/account/signin/withpassword', { password: 'Password123!' })
    await c.post('/walmart/cart/checkout', {})
    await c.post('/walmart/checkout/address', ADDRESS)
    const reviewed = await c.post('/walmart/checkout/payment', CARD)
    assert.doesNotMatch(reviewed.text, /4242424242424242|name="cvv"[^>]*value="123"/)
    const token = fieldValue(reviewed.text, 'review_token')
    await c.post('/walmart/cart/update', { line: `${product.id}::travel`, action: 'inc' })
    const stale = await c.post('/walmart/checkout/place-order', { review_token: token || 'old-review' })
    assert.equal(stale.status, 409)
    assert.match(stale.text, /order changed.*Review/s)
    assert.deepEqual(await c.json('/api/orders?store=walmart'), [])
    const currentToken = fieldValue(stale.text, 'review_token')
    assert.ok(currentToken)
    assert.notEqual(currentToken, token)
    // A refreshed second tab must not make the original review token valid again.
    assert.equal((await c.post('/walmart/checkout/place-order', { review_token: token || 'old-review' })).status, 409)
    variant.price += 1
    const priceChanged = await c.post('/walmart/checkout/place-order', { review_token: currentToken, price: '0.01' })
    assert.equal(priceChanged.status, 409)
    assert.deepEqual(await c.json('/api/orders?store=walmart'), [])
    const confirmed = await c.post('/walmart/checkout/place-order', { review_token: fieldValue(priceChanged.text, 'review_token') })
    assert.match(confirmed.text, /Thanks for your order!/)
    const [order] = await c.json('/api/orders?store=walmart')
    assert.equal(order.items[0].kind, 'other')
    assert.equal(order.items[0].qty, 2)
    assert.equal(order.items[0].unit_price, originalPrice + 1)
    assert.equal(order.meta.options[0].variant_id, 'travel')
    await c.post('/walmart/checkout/place-order', { review_token: fieldValue(priceChanged.text, 'review_token') })
    assert.equal((await c.json('/api/orders?store=walmart')).length, 1)
  } finally { variant.price = originalPrice; await srv.close() }
})
