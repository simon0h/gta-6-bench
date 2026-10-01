import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer } from './helpers.js'

const ADDRESS = { firstName: 'Alex', lastName: 'Tester', address1: '123 Ocean Dr', address2: 'Apt 4', city: 'Miami', stateCode: 'FL', postalCode: '33139', phone: '3055550123' }
const CARD = { paymentMethod: 'card', cardNumber: '4242424242424242', expirationMonthYear: '12/29', securityCode: '123' }

test('gamestop: guest pre-orders the PS5 code-in-box copy end to end', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    const results = await c.get('/gamestop/search/?q=gta+6')
    assert.equal(results.status, 200)
    assert.match(results.text, /Search Results for "gta 6"/)
    const link = /href="(\/gamestop\/video-games\/playstation-5\/products\/[^"]+\/448295\.html)"/.exec(results.text)
    assert.ok(link, 'PS5 listing should be in the results')

    const pdp = await c.get(link[1])
    assert.match(pdp.text, /Grand Theft Auto VI - PlayStation 5 \(Code in Box\)/)
    assert.match(pdp.text, /Pre-Order<\/button>/)
    assert.match(pdp.text, /Billing does not occur until order is processed/)

    const added = await c.post('/gamestop/cart/add', { pid: '448295' })
    assert.match(added.text, /Added to the cart/)
    assert.match(added.text, /View Cart &amp; Checkout/)

    const cart = await c.get('/gamestop/cart/')
    assert.match(cart.text, /Ship To Home: 1 Item/)
    assert.match(cart.text, /Estimated Total<\/span><span>\$85\.69/)
    assert.match(cart.text, /Proceed to Checkout/)

    const gate = await c.post('/gamestop/checkout/start')
    assert.match(gate.url, /\/checkout\/login\/\?required=false$/)
    assert.match(gate.text, /Checkout as Guest/)

    const co = await c.post('/gamestop/checkout/login/', { action: 'guest' })
    assert.match(co.url, /\/gamestop\/checkout\/$/)
    assert.match(co.text, /Shipping Address/)
    assert.match(co.text, /Place Order/)

    const done = await c.post('/gamestop/checkout/', { email: 'alex@example.com', ...ADDRESS, shippingMethod: 'premium', ...CARD, billingSame: '1' })
    assert.match(done.url, /\/gamestop\/order\/confirmation\/\?ID=1101000\d{9}&token=/)
    assert.match(done.text, /Thank you for your order!/)
    assert.match(done.text, /Order Number:/)
    assert.match(done.text, /\*{12}4242/)

    const orders = await c.json('/api/orders?store=gamestop')
    assert.equal(orders.length, 1)
    const o = orders[0]
    assert.match(o.order_number, /^1101000\d{9}$/)
    assert.deepEqual(o.items, [{ kind: 'game', platform: 'ps5', edition: 'standard', format: 'code-in-box', qty: 1, unit_price: 79.99, title: 'Grand Theft Auto VI - PlayStation 5 (Code in Box)', sku: '448295' }])
    assert.equal(o.customer.email, 'alex@example.com')
    assert.equal(o.fulfillment.method, 'ship')
    assert.equal(o.shipping_address.postal_code, '33139')
    assert.deepEqual(o.payment, { method: 'card', brand: 'Visa', last4: '4242', expiration: '12/29' })
    assert.deepEqual(o.totals, { subtotal: 79.99, shipping: 0, tax: 5.7, total: 85.69 })
    assert.equal(o.currency, 'USD')

    const cartAfter = await c.get('/gamestop/cart/')
    assert.match(cartAfter.text, /Your cart is empty/)
  } finally { await srv.close() }
})

test('gamestop: invalid card re-renders checkout with errors and records nothing', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    await c.post('/gamestop/cart/add', { pid: '448297' })
    await c.post('/gamestop/checkout/login/', { action: 'guest' })
    const bad = await c.post('/gamestop/checkout/', { email: 'alex@example.com', ...ADDRESS, ...CARD, cardNumber: '1234567890123456', billingSame: '1' })
    assert.equal(bad.status, 400)
    assert.match(bad.text, /Enter a valid card number/)
    assert.match(bad.text, /value="Alex"/, 'typed values are kept')
    assert.deepEqual(await c.json('/api/orders?store=gamestop'), [])
  } finally { await srv.close() }
})

test('gamestop: signed-in shopper skips the guest gate and sees prefilled name', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    const bad = await c.post('/gamestop/login/', { action: 'signin', email: 'tester@example.com', password: 'wrong' })
    assert.equal(bad.status, 401)
    assert.match(bad.text, /incorrect/)
    await c.post('/gamestop/cart/add', { pid: '448295' })
    const ok = await c.post('/gamestop/login/', { action: 'signin', email: 'tester@example.com', password: 'Password123!' })
    assert.match(ok.url, /\/gamestop\/checkout\/$/)
    assert.match(ok.text, /tester@example\.com/)
    assert.match(ok.text, /value="Alex"/)
    const done = await c.post('/gamestop/checkout/', { ...ADDRESS, shippingMethod: 'rush', paymentMethod: 'paypal', billingSame: '1' })
    assert.match(done.text, /Thank you for your order!/)
    const [o] = await c.json('/api/orders?store=gamestop')
    assert.equal(o.customer.email, 'tester@example.com')
    assert.equal(o.customer.guest, false)
    assert.equal(o.payment.method, 'paypal')
    assert.equal(o.totals.shipping, 9.99)
  } finally { await srv.close() }
})
