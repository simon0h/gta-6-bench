import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer } from './helpers.js'

const PS5 = '/jb-hifi/products/playstation-5-grand-theft-auto-vi'
const DETAILS = { email: 'alex@example.com', delivery_method: 'delivery', country: 'AU', first_name: 'Alex', last_name: 'Tester', address1: '1 George St', suburb: 'Sydney', state: 'NSW', postcode: '2000', phone: '0412 345 678' }
const CARD = { payment_method: 'card', card_number: '4242 4242 4242 4242', card_expiry: '12/29', card_cvv: '123', card_name: 'Alex Tester', billing: 'same' }
const path = (r) => new URL(r.url).pathname + new URL(r.url).search

test('jb-hifi: guest pre-orders the PS5 code-in-box copy end to end (AUD)', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    for (const q of ['gta 6', 'gta vi', 'grand theft auto', 'grand theft auto vi', 'GTA6']) {
      const r = await c.get(`/jb-hifi/search?query=${encodeURIComponent(q)}`)
      assert.ok(r.text.includes(`href="${PS5}"`) && r.text.includes('href="/jb-hifi/products/xbox-series-x-grand-theft-auto-vi"'), `"${q}" finds both GTA VI listings`)
    }
    const results = await c.get('/jb-hifi/search?query=gta+6')
    assert.equal(results.status, 200)
    assert.match(results.text, /<title>Search results: &#39;gta 6&#39; \| JB Hi-Fi<\/title>/)
    assert.match(results.text, /\d+ results for "gta 6"/)
    assert.match(results.text, /placeholder="Search products, brands, and more…"/)

    const pdp = await c.get(PS5)
    assert.match(pdp.text, /<title>Grand Theft Auto VI Standard Edition on PS5 - Pre-Order Now - JB Hi-Fi<\/title>/)
    assert.match(pdp.text, /<h1>Grand Theft Auto VI<\/h1>/)
    assert.match(pdp.text, /<span>\$129<\/span>/, 'yellow tag shows whole dollars')
    assert.doesNotMatch(pdp.text, /A\$/)
    assert.match(pdp.text, />Pre-order<\/button>/)
    assert.match(pdp.text, /No Disc Included \(Code in Box\)\./)
    assert.match(pdp.text, /Release date<\/span><b>19 Nov 26/)
    assert.match(pdp.text, /Pre-Order DLC!/)
    assert.match(pdp.text, /Use my location/)
    assert.match(pdp.text, /aria-label="Add to wishlist"/)
    assert.match(pdp.text, />Log in<\/a>/, 'header offers Log in')
    assert.match(pdp.text, /WANT A \$10 WELCOME COUPON\*\?/, 'JB Perks popup on the first product page visit')

    const added = await c.post('/jb-hifi/cart/add', { id: '903000', return: PS5 })
    assert.equal(path(added), `${PS5}?added=903000`)
    assert.match(added.text, /Item added to your cart!/)
    assert.match(added.text, />Review cart<\/a>/)
    assert.match(added.text, /href="\/jb-hifi\/checkout">Checkout<\/a>/)
    assert.doesNotMatch(added.text, /WANT A \$10/, 'popup only shows once')

    const cart = await c.get('/jb-hifi/cart')
    assert.match(cart.text, /<title>Your Shopping Cart<\/title>/)
    assert.match(cart.text, /<h1>My Cart<\/h1>/)
    assert.match(cart.text, /Pre-order release date 19 Nov 2026/)
    assert.match(cart.text, /<span>Subtotal<\/span><span>\$129\.00<\/span>/)
    assert.match(cart.text, /Includes GST\. Shipping calculated at checkout\./)

    // Guest-first: Checkout goes straight to the Shopify information step, no sign-in screen.
    const info = await c.post('/jb-hifi/checkout')
    assert.match(path(info), /^\/jb-hifi\/checkouts\/cn\/[0-9a-f]{32}\/en-us\/information$/)
    assert.match(info.text, /<title>Customer and Shipping Information - JB Hi-Fi - Checkout<\/title>/)
    assert.match(info.text, /Cart<\/a><\/li>.*Customer and Shipping Information.*Shipping.*Payment/s)
    assert.match(info.text, /Used for your order confirmation and cart reminders/)
    assert.match(info.text, /<label class="jb-method [^"]*" for="delivery_method_pickup"><input type="radio" id="delivery_method_pickup"/)
    assert.match(info.text, /Click &amp; Collect/)
    assert.match(info.text, /<span>Shipping<\/span><span>Calculated at next step<\/span>/)
    assert.match(info.text, /<small>AUD<\/small> \$129\.00/)
    assert.match(info.text, />Continue to shipping<\/button>/)

    const shipping = await c.post(path(info), DETAILS)
    assert.match(path(shipping), /\/en-us\/shipping$/)
    assert.match(shipping.text, /1 George St, Sydney NSW 2000, Australia/)
    assert.match(shipping.text, /Standard Delivery<\/b> \(2 – 12 days\)/)
    assert.match(shipping.text, /value="courier" disabled/)
    assert.match(shipping.text, />Continue to payment<\/button>/)

    const payment = await c.post(path(shipping), { shipping_method: 'standard' })
    assert.match(path(payment), /\/en-us\/payment$/)
    assert.match(payment.text, /All transactions are secure and encrypted\./)
    assert.match(payment.text, /Same as shipping address/)
    assert.match(payment.text, />Pay now<\/button>/)

    const done = await c.post(path(payment), CARD)
    assert.match(path(done), /\/en-us\/thank-you\?order=\d{8}$/)
    assert.match(done.text, /Thank you, Alex!/)
    assert.match(done.text, /Your order is confirmed/)
    assert.match(done.text, /Order <span data-order-number>#\d{8}<\/span>/)
    assert.match(done.text, /You'll get shipping and delivery updates by email and SMS\./)
    assert.match(done.text, /Visa ending with 4242/)
    assert.doesNotMatch(done.text, /4242 4242 4242 4242/)

    const orders = await c.json('/api/orders?store=jb-hifi')
    assert.equal(orders.length, 1)
    const o = orders[0]
    assert.equal(path(done), `${path(payment).replace(/payment$/, 'thank-you')}?order=${o.order_number}`)
    assert.deepEqual(o.items, [{ kind: 'game', platform: 'ps5', edition: 'standard', format: 'code-in-box', qty: 1, unit_price: 129, title: 'Grand Theft Auto VI', sku: '903000' }])
    assert.equal(o.customer.email, 'alex@example.com')
    assert.equal(o.customer.guest, true)
    assert.equal(o.fulfillment.method, 'ship')
    assert.equal(o.fulfillment.option, 'standard')
    assert.equal(o.shipping_address.postal_code, '2000')
    assert.equal(o.shipping_address.state, 'NSW')
    assert.deepEqual(o.payment, { method: 'card', brand: 'Visa', last4: '4242', name_on_card: 'Alex Tester' })
    assert.deepEqual(o.totals, { subtotal: 129, shipping: 4.99, tax: 0, total: 133.99 })
    assert.equal(o.currency, 'AUD')

    const again = await c.get(path(done))
    assert.match(again.text, new RegExp(`#${o.order_number}`), 'thank-you page survives a refresh')
    const wrongToken = await c.get(path(done).replace(/cn\/[0-9a-f]+/, 'cn/deadbeef'))
    assert.equal(wrongToken.status, 404)
    assert.match((await c.get('/jb-hifi/cart')).text, /Your cart is empty/)
  } finally { await srv.close() }
})

test('jb-hifi: missing postcode and invalid card re-render the step, keep typed values, record nothing', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    await c.post('/jb-hifi/cart/add', { id: '903001', return: '/jb-hifi/products/xbox-series-x-grand-theft-auto-vi' })
    const info = await c.post('/jb-hifi/checkout')

    const noPostcode = await c.post(path(info), { ...DETAILS, postcode: '' })
    assert.equal(noPostcode.status, 400)
    assert.equal(path(noPostcode), path(info))
    assert.match(noPostcode.text, /Enter a postcode/)
    assert.match(noPostcode.text, /value="1 George St"/, 'typed values are kept')
    assert.match(noPostcode.text, /value="alex@example\.com"/)

    const wrongState = await c.post(path(info), { ...DETAILS, postcode: '3000' })
    assert.equal(wrongState.status, 400)
    assert.match(wrongState.text, /Enter a valid postcode for New South Wales/)

    const shipping = await c.post(path(info), DETAILS)
    const payment = await c.post(path(shipping), { shipping_method: 'express' })
    const bad = await c.post(path(payment), { ...CARD, card_number: '4242 4242 4242 4241' })
    assert.equal(bad.status, 400)
    assert.equal(path(bad), path(payment))
    assert.match(bad.text, /Enter a valid card number/)
    assert.match(bad.text, /value="Alex Tester"/, 'name on card is kept')
    assert.doesNotMatch(bad.text, /4242 4242 4242 4241/, 'card number is never echoed')
    assert.deepEqual(await c.json('/api/orders?store=jb-hifi'), [])

    const ok = await c.post(path(payment), CARD)
    assert.match(ok.text, /Thank you, Alex!/)
    const replay = await c.post(path(payment), CARD)
    assert.equal(path(replay), '/jb-hifi/cart', 'a second Pay now cannot place another order')
    const orders = await c.json('/api/orders?store=jb-hifi')
    assert.equal(orders.length, 1)
    assert.equal(orders[0].items[0].platform, 'xbox')
    assert.equal(orders[0].fulfillment.option, 'express')
    assert.deepEqual(orders[0].totals, { subtotal: 129, shipping: 9.99, tax: 0, total: 138.99 })
  } finally { await srv.close() }
})

test('jb-hifi: optional Log in (wrong password refused) then Click & Collect pre-order', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    const wrong = await c.post('/jb-hifi/account/login', { email: 'tester@example.com', password: 'nope', return_to: PS5 })
    assert.equal(wrong.status, 401)
    assert.match(wrong.text, /Wrong email or password\./)
    assert.match(wrong.text, /value="tester@example\.com"/)

    const ok = await c.post('/jb-hifi/account/login', { email: 'tester@example.com', password: 'Password123!', return_to: PS5 })
    assert.equal(path(ok), PS5, 'returns to the product')
    assert.match(ok.text, /Hi, Alex/)

    await c.post('/jb-hifi/cart/add', { id: '903000', return: PS5 })
    const info = await c.get('/jb-hifi/checkout') // "Checkout" link in the add-to-cart modal
    assert.match(path(info), /\/en-us\/information$/)
    assert.match(info.text, /Logged in as tester@example\.com/)
    assert.match(info.text, /id="email" name="email" type="email" value="tester@example\.com"/)

    const pickup = { email: 'tester@example.com', delivery_method: 'pickup', pickup_first_name: 'Alex', pickup_last_name: 'Tester', pickup_phone: '0412 345 678' }
    const found = await c.post(path(info), { ...pickup, store_query: '4000', find_stores: '1' })
    assert.equal(found.status, 200)
    assert.ok(found.text.indexOf('JB Hi-Fi Brisbane City') < found.text.indexOf('JB Hi-Fi Melbourne Central'), 'QLD postcode lists Brisbane first')
    assert.match(found.text, /value="4000"/)
    const noStore = await c.post(path(info), pickup)
    assert.equal(noStore.status, 400)
    assert.match(noStore.text, /Choose a pickup location/)

    const payment = await c.post(path(info), { ...pickup, store_id: 'sydney-city' })
    assert.match(path(payment), /\/en-us\/payment$/, 'Click & Collect skips the shipping step')
    assert.match(payment.text, /Ground Floor, 39 Pitt St, Sydney NSW 2000/)
    assert.match(payment.text, /id="billing_first_name" name="billing_first_name" type="text" value="Alex"/)

    const done = await c.post(path(payment), { payment_method: 'paypal', billing_first_name: 'Alex', billing_last_name: 'Tester', billing_address1: '1 George St', billing_suburb: 'Sydney', billing_state: 'NSW', billing_postcode: '2000' })
    assert.match(done.text, /Thank you, Alex!/)
    assert.match(done.text, /We'll send you an email and SMS when your order is ready to collect from <b>JB Hi-Fi Sydney City<\/b>/)

    const [o] = await c.json('/api/orders?store=jb-hifi')
    assert.equal(o.customer.email, 'tester@example.com')
    assert.equal(o.customer.guest, false)
    assert.equal(o.fulfillment.method, 'pickup')
    assert.equal(o.fulfillment.store_location, 'JB Hi-Fi Sydney City')
    assert.equal(o.shipping_address, null)
    assert.equal(o.billing_address.postal_code, '2000')
    assert.deepEqual(o.payment, { method: 'paypal' })
    assert.deepEqual(o.totals, { subtotal: 129, shipping: 0, tax: 0, total: 129 })
    assert.match((await c.get('/jb-hifi/account')).text, new RegExp(`#${o.order_number}`))
  } finally { await srv.close() }
})
