import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer } from './helpers.js'

const PS5 = { sku: '6684968', title: 'Grand Theft Auto VI - (Code in Box, Delivers 11/12/26, Playable 11/19/26) - PlayStation 5' }
const XBOX = { sku: '6684969', title: 'Grand Theft Auto VI - (Code in Box, Delivers 11/12/26, Playable 11/19/26) - XBOX Series X, XBOX Series S' }
const ADDRESS = { firstName: 'Alex', lastName: 'Tester', addressLine1: '123 Ocean Dr', addressLine2: '', city: 'Miami', state: 'FL', postalCode: '33139', useAsBilling: '1' }
const BILLING = { billingFirstName: 'Alex', billingLastName: 'Tester', billingAddressLine1: '123 Ocean Dr', billingCity: 'Miami', billingState: 'FL', billingPostalCode: '33139' }
const CARD = { number: '4242 4242 4242 4242', expirationDate: '12/29', cvv: '123' }

// Numbered step headings in page order, e.g. ['1 Contact info', '2 Shipping address', ...].
const stepHeadings = html => [...html.matchAll(/<span class="bb-step-num">(\d)<\/span> ([^<]+)<\/h2>/g)].map(m => `${m[1]} ${m[2]}`)
const activeStep = html => /<section class="bb-step is-active" id="step-(\w+)"/.exec(html)?.[1]

test('bestbuy: guest pre-orders the PS5 code-in-box copy for shipping, search to thank-you', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    const results = await c.get('/bestbuy/site/searchpage.jsp?st=gta+6')
    assert.equal(results.status, 200)
    assert.match(results.text, /<title>gta 6 - Best Buy<\/title>/)
    assert.match(results.text, /gta 6 \(\d+\)/)
    assert.match(results.text, /Exclusive member offer available with pre-order\./)
    const link = /href="(\/bestbuy\/product\/[^"]+\/JXHY5RW2JZ\/sku\/6684968)"/.exec(results.text)
    assert.ok(link, 'PS5 listing should be in the results')

    const pdp = await c.get(link[1])
    assert.equal(pdp.status, 200)
    assert.match(pdp.text, /<h1>Grand Theft Auto VI - \(Code in Box, Delivers 11\/12\/26, Playable 11\/19\/26\) - PlayStation 5<\/h1>/)
    assert.match(pdp.text, /Ready on Release Date/)
    assert.match(pdp.text, /Order now for pickup on Release Date at <b>Compton<\/b>/)
    assert.match(pdp.text, /FREE shipping to <b>90001<\/b>/)
    assert.match(pdp.text, /Pre-order<\/button>/)
    assert.match(pdp.text, /Deal Alert/)

    // Pre-order goes straight to the cart, no modal.
    const cart = await c.post('/bestbuy/cart/add', { pid: PS5.sku, fulfillment: 'shipping' })
    assert.match(cart.url, /\/bestbuy\/cart$/)
    assert.match(cart.text, /<h1>Your Cart<\/h1>/)
    assert.match(cart.text, /Final sale\. Not returnable\./)
    assert.match(cart.text, /id="availability-selection-shipping-1" value="shipping" checked/)
    assert.match(cart.text, /Estimated Sales Tax<\/span><span>\$8\.60/)
    assert.match(cart.text, /Total<\/span><span>\$88\.59/)
    assert.match(cart.text, /Checkout<\/button>/)
    assert.match(cart.text, /By using PayPal Checkout, you agree to Best Buy's Terms &amp; Privacy Policy/)
    assert.match(cart.text, /aria-label="cart, 1 item"/)

    const gate = await c.post('/bestbuy/checkout/r/fast-track')
    assert.match(gate.url, /\/bestbuy\/identity\/signin\?token=/)
    assert.match(gate.text, /<title>Sign In to Best Buy<\/title>/)
    assert.match(gate.text, /Continue as Guest<\/button>/)

    const contact = await c.post('/bestbuy/identity/signin', { action: 'guest' })
    assert.match(contact.url, /\/bestbuy\/checkout\/c\/standard$/)
    assert.deepEqual(stepHeadings(contact.text), ['1 Contact info', '2 Shipping address', '3 Shipping details', '4 Payment method'])
    assert.equal(activeStep(contact.text), 'contact')

    const address = await c.post('/bestbuy/checkout/contact', { emailAddress: 'alex@example.com', phoneNumber: '(305) 555-0123' })
    assert.equal(activeStep(address.text), 'address')
    assert.match(address.text, /id="useAsBillingCheckbox" name="useAsBilling" value="1" checked/)

    const details = await c.post('/bestbuy/checkout/shipping-address', ADDRESS)
    assert.equal(activeStep(details.text), 'shipdetails')
    assert.match(details.text, /Delivered on or shortly after Release Date/)

    const payment = await c.post('/bestbuy/checkout/shipping-details', { levelOfService: 'standard' })
    assert.equal(activeStep(payment.text), 'payment')
    assert.match(payment.text, /placeholder="MM\/YY"/)
    assert.match(payment.text, /placeholder="CVV"/)
    assert.match(payment.text, /billing-info"><address>Alex Tester<br>123 Ocean Dr/, 'billing defaults to the shipping address')
    assert.match(payment.text, /Place order<\/button>/)

    const done = await c.post('/bestbuy/checkout/payment', { paymentMethod: 'card', ...CARD })
    assert.match(done.url, /\/bestbuy\/checkout\/r\/thank-you\?order=BBY01-\d{11}&token=/)
    assert.match(done.text, /Thanks for your order!/)
    assert.match(done.text, /Order #: <b data-order-number>BBY01-\d{11}<\/b>/)
    assert.match(done.text, /sending a confirmation email to <b>alex@example\.com<\/b>/)
    assert.match(done.text, /Your order will arrive by Release Date: <b>11\/12\/2026<\/b>/)
    assert.match(done.text, /Create an account/)
    assert.doesNotMatch(done.text, /4242 4242 4242 4242|4242424242424242/)

    const orders = await c.json('/api/orders?store=bestbuy')
    assert.equal(orders.length, 1)
    const o = orders[0]
    assert.match(o.order_number, /^BBY01-\d{11}$/)
    assert.deepEqual(o.items, [{ kind: 'game', platform: 'ps5', edition: 'standard', format: 'code-in-box', qty: 1, unit_price: 79.99, title: PS5.title, sku: PS5.sku }])
    assert.equal(o.customer.email, 'alex@example.com')
    assert.equal(o.customer.phone, '3055550123')
    assert.equal(o.customer.guest, true)
    assert.equal(o.fulfillment.method, 'ship')
    assert.equal(o.shipping_address.line1, '123 Ocean Dr')
    assert.equal(o.shipping_address.postal_code, '33139')
    assert.deepEqual(o.billing_address, { first_name: 'Alex', last_name: 'Tester', line1: '123 Ocean Dr', line2: null, city: 'Miami', state: 'FL', postal_code: '33139', country: 'US' })
    assert.deepEqual(o.payment, { method: 'card', brand: 'Visa', last4: '4242', name_on_card: 'Alex Tester', expiration: '12/29' })
    assert.deepEqual(o.totals, { subtotal: 79.99, shipping: 0, tax: 8.6, total: 88.59 })
    assert.equal(o.currency, 'USD')

    const cartAfter = await c.get('/bestbuy/cart')
    assert.match(cartAfter.text, /Your cart is empty/)
  } finally { await srv.close() }
})

test('bestbuy: invalid input re-renders the step with errors and records nothing', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    await c.post('/bestbuy/cart/add', { pid: XBOX.sku }) // Pickup is the default
    await c.post('/bestbuy/checkout/r/fast-track')
    const co = await c.post('/bestbuy/identity/signin', { action: 'guest' })
    assert.deepEqual(stepHeadings(co.text), ['1 Contact info', '2 Pickup details', '3 Payment method'])

    const empty = await c.post('/bestbuy/checkout/contact', { emailAddress: '', phoneNumber: '' })
    assert.equal(empty.status, 400)
    assert.match(empty.text, /Please enter an email address\./)
    assert.match(empty.text, /Please enter a phone number\./)

    const pickup = await c.post('/bestbuy/checkout/contact', { emailAddress: 'alex@example.com', phoneNumber: '3055550123' })
    assert.equal(activeStep(pickup.text), 'pickup')
    assert.match(pickup.text, /You \(Name on billing address\)/)

    const payment = await c.post('/bestbuy/checkout/pickup', { action: 'continue' })
    assert.equal(activeStep(payment.text), 'payment')
    assert.match(payment.text, /id="payment\.billingAddress\.firstName"/, 'pickup-only carts show the full billing form')

    const bad = await c.post('/bestbuy/checkout/payment', { paymentMethod: 'card', ...BILLING, billingPostalCode: '3313', number: '1234 5678 9012 3456', expirationDate: '12/29', cvv: '12' })
    assert.equal(bad.status, 400)
    assert.equal(activeStep(bad.text), 'payment')
    assert.match(bad.text, /Please enter a valid card number\./)
    assert.match(bad.text, /Please enter a valid Security Code\./)
    assert.match(bad.text, /Please enter a valid ZIP code\./)
    assert.match(bad.text, /value="Alex"/, 'typed billing values are kept')
    assert.match(bad.text, /value="12\/29"/)
    assert.doesNotMatch(bad.text, /1234 5678 9012 3456|1234567890123456/, 'the card number is never echoed')

    const expired = await c.post('/bestbuy/checkout/payment', { paymentMethod: 'card', ...BILLING, ...CARD, expirationDate: '01/20' })
    assert.equal(expired.status, 400)
    assert.match(expired.text, /Your credit card is expired\./)

    assert.deepEqual(await c.json('/api/orders?store=bestbuy'), [])
  } finally { await srv.close() }
})

test('bestbuy: sign-in with the test account, wrong password first, then a store-pickup pre-order', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    await c.post('/bestbuy/cart/add', { pid: PS5.sku, fulfillment: 'pickup' })
    const gate = await c.post('/bestbuy/checkout/r/fast-track')
    assert.match(gate.text, /Returning Customers/)

    // Email first, password on the next screen.
    const pw = await c.post('/bestbuy/identity/signin', { action: 'signin', email: 'tester@example.com' })
    assert.equal(pw.status, 200)
    assert.match(pw.text, /type="password"/)
    const wrong = await c.post('/bestbuy/identity/signin', { action: 'signin', email: 'tester@example.com', password: 'wrong' })
    assert.equal(wrong.status, 401)
    assert.match(wrong.text, /did not match our records/)

    const co = await c.post('/bestbuy/identity/signin', { action: 'signin', email: 'tester@example.com', password: 'Password123!' })
    assert.match(co.url, /\/bestbuy\/checkout\/c\/standard$/)
    assert.match(co.text, /tester@example\.com/)
    assert.match(co.text, /value="555-014-2026"/, 'phone is prefilled from the account')

    const pickup = await c.post('/bestbuy/checkout/contact', { phoneNumber: '555-014-2026' })
    assert.match(pickup.text, /Alex Tester \(Name on billing address\)/)

    const someone = { firstName: 'Jamie', lastName: 'Rivera', emailAddress: 'jamie@example.com', phoneNumber: '305-555-0199' }
    const guard = await c.post('/bestbuy/checkout/pickup', { action: 'continue', ...someone })
    assert.equal(guard.status, 400)
    assert.match(guard.text, /Save your pickup person selection to continue\./)
    const confirmed = await c.post('/bestbuy/checkout/pickup', { action: 'confirmPerson', ...someone })
    assert.match(confirmed.text, /Pickup person updated/)
    assert.match(confirmed.text, /Jamie Rivera/)

    const payment = await c.post('/bestbuy/checkout/pickup', { action: 'continue', ...someone })
    assert.equal(activeStep(payment.text), 'payment')
    assert.match(payment.text, /id="payment\.billingAddress\.firstName" name="billingFirstName" type="text" value="Alex"/)

    const done = await c.post('/bestbuy/checkout/payment', { paymentMethod: 'card', number: '5555555555554444', expirationDate: '1130', cvv: '321', ...BILLING })
    assert.match(done.text, /Thanks for your order!/)
    assert.match(done.text, /ready for pickup on Release Date: <b>11\/12\/2026<\/b> at <b>Compton<\/b>/)
    assert.match(done.text, /Make sure <b>Jamie Rivera<\/b> brings their photo ID/)
    assert.doesNotMatch(done.text, /Create an account/, 'signed-in shoppers get no create-account block')

    const [o] = await c.json('/api/orders?store=bestbuy')
    assert.equal(o.customer.email, 'tester@example.com')
    assert.equal(o.customer.guest, false)
    assert.equal(o.fulfillment.method, 'pickup')
    assert.equal(o.fulfillment.store_location, 'Compton')
    assert.equal(o.shipping_address, null)
    assert.equal(o.billing_address.city, 'Miami')
    assert.deepEqual(o.meta.pickup_person, { first_name: 'Jamie', last_name: 'Rivera', email: 'jamie@example.com', phone: '3055550199' })
    assert.deepEqual(o.payment, { method: 'card', brand: 'Mastercard', last4: '4444', name_on_card: 'Alex Tester', expiration: '11/30' })
  } finally { await srv.close() }
})

test('bestbuy: search aliases, cart quirks and the five-step mixed checkout paid with PayPal', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    for (const q of ['gta 6', 'gta vi', 'grand theft auto', 'grand theft auto vi', 'GTA6']) {
      const r = await c.get(`/bestbuy/site/searchpage.jsp?st=${encodeURIComponent(q)}`)
      assert.match(r.text, /\/JXHY5RW2JZ\/sku\/6684968"/, `"${q}" should find the PS5 listing`)
      assert.match(r.text, /\/JXHY5RKPCY\/sku\/6684969"/, `"${q}" should find the Xbox listing`)
    }

    // Quantity is capped at 3; "Save for later" moves the line to Saved Items.
    for (let i = 0; i < 4; i++) await c.post('/bestbuy/cart/add', { pid: PS5.sku, fulfillment: 'shipping' })
    let cart = await c.get('/bestbuy/cart')
    assert.match(cart.text, /<option value="3" selected>3<\/option>/)
    await c.post('/bestbuy/cart/add', { pid: XBOX.sku })
    cart = await c.post('/bestbuy/cart/update', { line: '2', action: 'save' })
    assert.match(cart.text, /Saved Items<\/h2><div class="bb-saved-item">/)
    cart = await c.post('/bestbuy/cart/saved', { pid: XBOX.sku, action: 'move' })
    cart = await c.post('/bestbuy/cart/update', { line: '1', qty: '1', 'availability-selection': 'shipping', action: 'update' })
    assert.match(cart.text, /Store Pickup<\/span><span>FREE/)

    await c.post('/bestbuy/checkout/r/fast-track')
    const co = await c.post('/bestbuy/identity/signin', { action: 'guest' })
    assert.deepEqual(stepHeadings(co.text), ['1 Contact info', '2 Shipping address', '3 Shipping details', '4 Pickup details', '5 Payment method'])
    await c.post('/bestbuy/checkout/contact', { emailAddress: 'pat@example.com', phoneNumber: '3055550123' })
    await c.post('/bestbuy/checkout/shipping-address', ADDRESS)
    await c.post('/bestbuy/checkout/shipping-details', { levelOfService: 'standard' })
    const gift = await c.post('/bestbuy/checkout/gift-options', { 'includeGiftMessage-1': '1', 'giftMessage-1': '' })
    assert.equal(gift.status, 400)
    assert.match(gift.text, /Please enter a gift message\./)
    const gifted = await c.post('/bestbuy/checkout/gift-options', { 'includeGiftMessage-1': '1', 'giftMessage-1': 'Happy birthday!' })
    assert.match(gifted.text, /Gift options updated/)
    assert.match(gifted.text, /Edit gift options/)
    const payment = await c.post('/bestbuy/checkout/pickup', { action: 'continue' })
    assert.equal(activeStep(payment.text), 'payment')

    const paypal = await c.post('/bestbuy/checkout/payment', { action: 'paypal' })
    assert.match(paypal.text, /PayPal is your payment method/)
    const done = await c.post('/bestbuy/checkout/payment', { paymentMethod: 'paypal' })
    assert.match(done.text, /Thanks for your order!/)
    assert.match(done.text, /Ship to/)
    assert.match(done.text, /ready for pickup/)

    const [o] = await c.json('/api/orders?store=bestbuy')
    assert.equal(o.fulfillment.method, 'mixed')
    assert.deepEqual(o.items.map(i => [i.platform, i.qty]), [['ps5', 1], ['xbox', 1]])
    assert.deepEqual(o.meta.items_fulfillment, [{ sku: PS5.sku, fulfillment: 'shipping' }, { sku: XBOX.sku, fulfillment: 'pickup' }])
    assert.deepEqual(o.meta.gift_options, [{ sku: PS5.sku, message: true, email: '', text: 'Happy birthday!' }])
    assert.deepEqual(o.payment, { method: 'paypal' })
    assert.deepEqual(o.totals, { subtotal: 159.98, shipping: 0, tax: 17.2, total: 177.18 })
  } finally { await srv.close() }
})
