import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer } from './helpers.js'

const PS5 = '1011529119', XBOX = '1011545811'
const ADDRESS = { firstName: 'Alex', lastName: 'Tester', address1: '123 Ocean Dr', address2: 'Apt 4', zip: '33139', city: 'Miami', state: 'FL', phone: '3055550123' }
const CARD = { paymentType: 'card', cardNumber: '4242424242424242', expiry: '12/29', cvv: '123', nameOnCard: 'Alex Tester', billingSame: '1' }

test('target: shopper signs in at the gate and pre-orders the PS5 code-in-box copy end to end', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    // Search from the header box: /s?searchTerm=…, h1 is the query in lowercase.
    const results = await c.get('/target/s?searchTerm=GTA+6')
    assert.equal(results.status, 200)
    assert.match(results.text, /<h1>gta 6<\/h1>/)
    assert.match(results.text, /results for &ldquo;GTA 6&rdquo;/)
    assert.match(results.text, /Release date Thu, Nov 12/)
    assert.match(results.text, /Ships free - exclusions apply/)
    assert.match(results.text, /aria-label="Preorder Grand Theft Auto VI - PlayStation 5/)
    assert.match(results.text, /aria-label="cart 0 items"/)
    assert.doesNotMatch(results.text, /class="tg-badge"/, 'no count badge on an empty cart')
    const link = /href="(\/target\/p\/grand-theft-auto-vi-playstation-5\/-\/A-1011529119)"/.exec(results.text)
    assert.ok(link, 'PS5 listing should be in the results')
    // Target only sells Standard, but its loose search still lists the game for extra words.
    for (const q of ['gta vi', 'GTA6', 'grand theft auto', 'grand theft auto vi', 'gta 6 ultimate edition']) {
      const r = await c.get(`/target/s?searchTerm=${encodeURIComponent(q)}`)
      assert.match(r.text, /A-1011529119/, `search "${q}" finds the PS5 listing`)
      assert.match(r.text, /A-1011545811/, `search "${q}" finds the Xbox listing`)
    }

    const pdp = await c.get(link[1])
    assert.match(pdp.text, /<h1>Grand Theft Auto VI - PlayStation 5 \(Code in Box, Delivers 11\/12\/26, Playable 11\/19\/26\)<\/h1>/)
    assert.match(pdp.text, /\$79\.99/)
    assert.match(pdp.text, /Preorder for 95065/)
    assert.match(pdp.text, /Release date: Thu, Nov 12/)
    assert.match(pdp.text, /Delivered on or shortly after release date/)
    assert.match(pdp.text, /data-test="preorderButton"[^>]*>Preorder<\/button>/)
    assert.match(pdp.text, /<label class="tg-qty" for="qty">Qty<\/label>/)
    assert.match(pdp.text, /Sign in to buy now/)
    assert.match(pdp.text, /Add to list/)
    assert.match(pdp.text, /Pre-order to receive the Vintage Vice City Pack\./)

    // Preorder → server-rendered "Added to cart" drawer over the product page.
    const added = await c.post('/target/cart/add', { tcin: PS5, qty: '1', back: link[1] })
    assert.match(added.url, /\?added=1011529119$/)
    assert.match(added.text, /Added to cart/)
    assert.match(added.text, /Continue shopping/)
    assert.match(added.text, /View cart &amp; check out/)
    assert.match(added.text, /aria-label="cart 1 item"/)

    const cart = await c.get('/target/cart')
    assert.match(cart.text, /<h1>Cart<\/h1>/)
    assert.match(cart.text, /Release date Thu, Nov 12/)
    assert.match(cart.text, /Order summary/)
    assert.match(cart.text, /Estimated taxes<\/span><span>\$7\.80/)
    assert.match(cart.text, /Total<\/span><span>\$87\.79/)
    assert.match(cart.text, /Sign in to check out/)
    assert.match(cart.text, /aria-label="Pay with PayPal"/)
    assert.match(cart.text, /Learn more about Target Circle Card offer/)
    assert.match(cart.text, /Skip the \$9\.99 delivery fee all season long\./, 'Circle 360 banner under the cart')

    // No guest checkout: the gate sends the shopper to the login page and back afterwards.
    const gate = await c.get('/target/checkout')
    assert.match(gate.url, /\/target\/login\?redirect=%2Ftarget%2Fcheckout$/)
    assert.match(gate.text, /Email address/)
    assert.match(gate.text, /Create your Target account/)
    assert.equal(gate.text.match(/type="email"/g).length, 1, 'sign-in page has one email field (no footer sign-up box)')
    const signedIn = await c.post('/target/login', { email: 'tester@example.com', password: 'Password123!', redirect: '/target/checkout' })
    assert.match(signedIn.url, /\/target\/checkout\/shipping$/)
    assert.match(signedIn.text, /Shipping address/)
    assert.match(signedIn.text, /Save &amp; continue/)
    assert.match(signedIn.text, /value="Alex"/, 'name prefilled from the account')

    const payment = await c.post('/target/checkout/shipping', ADDRESS)
    assert.match(payment.url, /\/target\/checkout\/payment$/)
    assert.match(payment.text, /Select payment type/)
    assert.match(payment.text, /placeholder="Enter CVV"/)
    assert.match(payment.text, /Save and continue/)
    assert.match(payment.text, /123 Ocean Dr, Miami, FL 33139/, 'shipping step collapsed to a summary')
    const payForm = /<form[^>]*id="payment-form"[^>]*>([\s\S]*?)<\/form>/.exec(payment.text)[1]
    assert.equal(/<button type="submit"[^>]*>([^<]*)<\/button>/.exec(payForm)[1], 'Save and continue', 'Enter in a card field saves the card, not the gift card')
    assert.match(payForm, /<details class="tg-giftcard"><summary>Add gift card<\/summary>/, 'gift card form starts collapsed')

    const review = await c.post('/target/checkout/payment', CARD)
    assert.match(review.url, /\/target\/checkout\/review$/)
    assert.match(review.text, /Visa ending in 4242/)
    assert.match(review.text, /Arrives on or shortly after release date/)
    assert.match(review.text, /data-test="placeOrderButton">Place your order<\/button>/)
    assert.match(review.text, /You won't be charged for your order until it ships/)
    assert.doesNotMatch(/<form[^>]*class="tg-place"[^>]*>[\s\S]*?<\/form>/.exec(review.text)[0], /You won't be charged/, 'charge policy sits above the sticky place-order bar')
    assert.doesNotMatch(review.text, /4242424242424242/)

    const done = await c.post('/target/checkout/place-order')
    assert.match(done.url, /\/target\/order-confirmation\?orderId=102\d{12}&token=[0-9a-f]{24}$/)
    assert.match(done.text, /Thanks for your order!/)
    assert.match(done.text, /Order # <span data-order-number>102\d{12}<\/span>/)
    assert.match(done.text, /send confirmations and order updates to <b>tester@example\.com<\/b>/)
    assert.match(done.text, /View order details/)

    const orders = await c.json('/api/orders?store=target')
    assert.equal(orders.length, 1)
    const o = orders[0]
    assert.match(o.order_number, /^102\d{12}$/)
    assert.deepEqual(o.items, [{ kind: 'game', platform: 'ps5', edition: 'standard', format: 'code-in-box', qty: 1, unit_price: 79.99, title: 'Grand Theft Auto VI - PlayStation 5 (Code in Box, Delivers 11/12/26, Playable 11/19/26)', sku: PS5 }])
    assert.equal(o.customer.email, 'tester@example.com')
    assert.equal(o.customer.guest, false)
    assert.equal(o.fulfillment.method, 'ship')
    assert.deepEqual(o.shipping_address, { first_name: 'Alex', last_name: 'Tester', line1: '123 Ocean Dr', line2: 'Apt 4', city: 'Miami', state: 'FL', postal_code: '33139', country: 'US', phone: '3055550123' })
    assert.equal(o.billing_address.postal_code, '33139')
    assert.deepEqual(o.payment, { method: 'card', brand: 'Visa', last4: '4242', name_on_card: 'Alex Tester', expiration: '12/29' })
    assert.deepEqual(o.totals, { subtotal: 79.99, shipping: 0, tax: 7.8, total: 87.79 })
    assert.equal(o.currency, 'USD')

    const cartAfter = await c.get('/target/cart')
    assert.match(cartAfter.text, /Your cart is empty/)
    const details = await c.get(`/target/orders/${o.order_number}`)
    assert.match(details.text, new RegExp(`Order # ${o.order_number}`))
  } finally { await srv.close() }
})

test('target: invalid card and missing address fields re-render the step with errors and record nothing', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    // The protection plan offered with the game is emailed: no shipping / pickup choice on its cart line.
    await c.post('/target/cart/add', { tcin: XBOX, qty: '2', addon: '89027781' })
    const withPlan = await c.get('/target/cart')
    assert.match(withPlan.text, /Protection plan &middot; Delivered by email\./)
    assert.doesNotMatch(withPlan.text, /name="method-89027781"/)
    await c.post('/target/cart/update', { tcin: '89027781', action: 'remove' })
    await c.post('/target/login', { email: 'tester@example.com', password: 'Password123!', redirect: '/target/checkout' })

    const badAddress = await c.post('/target/checkout/shipping', { ...ADDRESS, zip: '', city: '' })
    assert.equal(badAddress.status, 400)
    assert.match(badAddress.text, /Zip code is required/)
    assert.match(badAddress.text, /City is required/)
    assert.match(badAddress.text, /value="123 Ocean Dr"/, 'typed values are kept')
    // Payment is not reachable until the address is saved.
    const skip = await c.get('/target/checkout/payment')
    assert.match(skip.url, /\/checkout\/shipping$/)

    await c.post('/target/checkout/shipping', ADDRESS)
    const badCard = await c.post('/target/checkout/payment', { ...CARD, cardNumber: '1234567890123456', cvv: '' })
    assert.equal(badCard.status, 400)
    assert.match(badCard.text, /Invalid card number\. Try again/)
    assert.match(badCard.text, /CVV is required/)
    assert.match(badCard.text, /value="Alex Tester"/, 'name on card is kept')
    assert.doesNotMatch(badCard.text, /1234567890123456/)
    assert.deepEqual(await c.json('/api/orders?store=target'), [])

    // Fixing the card completes the Xbox order at qty 2.
    await c.post('/target/checkout/payment', CARD)
    const done = await c.post('/target/checkout/place-order')
    assert.match(done.text, /Thanks for your order!/)
    const [o] = await c.json('/api/orders?store=target')
    assert.deepEqual(o.items, [{ kind: 'game', platform: 'xbox', edition: 'standard', format: 'code-in-box', qty: 2, unit_price: 79.99, title: 'Grand Theft Auto VI - Xbox Series X|S (Code in Box, Delivers 11/12/26, Playable 11/19/26)', sku: XBOX }])
    assert.deepEqual(o.totals, { subtotal: 159.98, shipping: 0, tax: 15.6, total: 175.58 })
  } finally { await srv.close() }
})

test('target: wrong password is rejected, sign-in works, and a new account can be created at the gate', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    const bad = await c.post('/target/login', { email: 'tester@example.com', password: 'wrong', redirect: '/target/checkout' })
    assert.equal(bad.status, 401)
    assert.match(bad.text, /Check your email address and password and try again/)
    assert.match(bad.text, /value="tester@example.com"/)
    assert.match(bad.text, /name="redirect" value="\/target\/checkout"/)

    await c.post('/target/cart/add', { tcin: PS5 })
    const ok = await c.post('/target/login', { email: 'tester@example.com', password: 'Password123!', redirect: '/target/checkout' })
    assert.match(ok.url, /\/target\/checkout\/shipping$/)
    const cart = await c.get('/target/cart')
    assert.match(cart.text, /data-test="checkout-button">Check out</)
    assert.match(cart.text, /Hi, Alex/)

    // A second shopper creates an account from the login page and lands in checkout.
    const c2 = srv.client()
    await c2.post('/target/cart/add', { tcin: PS5 })
    const weak = await c2.post('/target/account/create', { email: 'new@example.com', firstName: 'Sam', lastName: 'Shopper', password: 'short', redirect: '/target/checkout' })
    assert.equal(weak.status, 400)
    assert.match(weak.text, /Password must be 8–20 characters/)
    assert.match(weak.text, /value="Sam"/)
    const dupe = await c2.post('/target/account/create', { email: 'tester@example.com', firstName: 'Sam', lastName: 'Shopper', password: 'Shopper2026!', redirect: '/target/checkout' })
    assert.equal(dupe.status, 400)
    assert.match(dupe.text, /already exists/)
    const created = await c2.post('/target/account/create', { email: 'new@example.com', firstName: 'Sam', lastName: 'Shopper', phone: '3055550199', password: 'Shopper2026!', redirect: '/target/checkout' })
    assert.match(created.url, /\/target\/checkout\/shipping$/)
    assert.match(created.text, /value="Sam"/)
    await c2.post('/target/checkout/shipping', { ...ADDRESS, firstName: 'Sam', lastName: 'Shopper' })
    await c2.post('/target/checkout/payment', { ...CARD, nameOnCard: 'Sam Shopper' })
    const done = await c2.post('/target/checkout/place-order')
    assert.match(done.text, /send confirmations and order updates to <b>new@example\.com<\/b>/)
    const orders = await c2.json('/api/orders?store=target')
    assert.equal(orders.length, 1)
    assert.equal(orders[0].customer.email, 'new@example.com')
    assert.equal(orders[0].customer.first_name, 'Sam')
    assert.deepEqual(await c.json('/api/orders?store=target'), orders, 'the first shopper never placed an order')
  } finally { await srv.close() }
})
