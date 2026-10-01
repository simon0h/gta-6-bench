import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer } from './helpers.js'

const ADDRESS = { country: 'US', first_name: 'Alex', last_name: 'Tester', city: 'Miami', region: 'FL', postal_code: '33139', street_address: '123 Ocean Dr', apartment: 'Apt 4', phone: '3055550123', email: 'alex@example.com' }
const CARD = { payment_method: 'card', card_number: '4242424242424242', expiry: '12/29', cvc: '123', cardholder_name: 'Alex Tester' }
const DOB = { month: '5', day: '14', year: '1990' }

test('rockstar-store: guest pre-orders the PS5 code-in-box straight from the product page (no cart step)', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    const results = await c.get('/rockstar-store/search?q=gta+6')
    assert.equal(results.status, 200)
    assert.match(results.text, /<title>My Search \| Rockstar Store<\/title>/)
    assert.match(results.text, /<h1>Search for: gta 6<\/h1>/)
    assert.match(results.text, /href="\/rockstar-store\/game\/buy-gta-vi"/, 'the GTA VI tile links to the product page')
    assert.match(results.text, /COMING SOON/)
    assert.match(results.text, /\$79\.99/)

    const pdp = await c.get('/rockstar-store/game/buy-gta-vi')
    assert.equal(pdp.status, 200)
    assert.match(pdp.text, /<h1>Grand Theft Auto VI<\/h1>/)
    assert.match(pdp.text, /Select Platform/)
    assert.match(pdp.text, /aria-pressed="false">.*PS5</)
    assert.match(pdp.text, /Xbox Series X\|S/)
    assert.match(pdp.text, /Order before November 20 to get the Vintage Vice City Pack at no additional cost\*/)
    assert.match(pdp.text, /Physical \(Code-in-Box\) Version Available/)
    assert.match(pdp.text, /Taxes and shipping will be calculated in the checkout window\./)
    assert.match(pdp.text, /Compare Editions/)
    assert.match(pdp.text, /Pre-load begins November 12, 2026/)
    assert.match(pdp.text, /Upgrade Now/)

    // Picking a platform makes the digital editions link out to the platform-store clone and arms the code-in-box button.
    const ps5 = await c.get('/rockstar-store/game/buy-gta-vi?platform=ps5')
    assert.match(ps5.text, /role="button" aria-pressed="true">.*PS5</)
    assert.match(ps5.text, /href="\/playstation-store\/" target="_blank"/, 'digital editions open the platform store in a new tab')
    assert.doesNotMatch(ps5.text, /href="\/xbox-store\/"/)
    assert.match(ps5.text, /name="platform" value="ps5"/)
    assert.match(ps5.text, /<span>Pre-Order Now<\/span><small>\$79\.99<\/small>/)

    // "Pre-Order Now $79.99" -> age gate lightbox on the product page.
    const gate = await c.post('/rockstar-store/game/buy-gta-vi/preorder', { platform: 'ps5' })
    assert.match(gate.url, /\/rockstar-store\/game\/buy-gta-vi\?platform=ps5&modal=verify-age$/)
    assert.match(gate.text, /Verify your age/)
    assert.match(gate.text, /Enter your date of birth/)
    for (const n of ['month', 'day', 'year']) assert.match(gate.text, new RegExp(`<select id="dob-${n}" name="${n}"`))
    assert.match(gate.text, />OK<\/button>/)

    // OK -> "Sign In or Continue as Guest" modal, still on the product page. Nothing was added to the Rockstar cart.
    const guest = await c.post('/rockstar-store/verify-age', DOB)
    assert.match(guest.url, /\/rockstar-store\/game\/buy-gta-vi\?platform=ps5&modal=checkout-gate$/)
    assert.match(guest.text, /Sign In or Continue as Guest/)
    assert.match(guest.text, /Choose to sign in or checkout as guest/)
    assert.match(guest.text, />SIGN IN<\/a>/)
    assert.match(guest.text, />CONTINUE AS GUEST<\/button>/)
    const cart = await c.get('/rockstar-store/cart')
    assert.match(cart.text, /Your cart is empty/)
    assert.doesNotMatch(cart.text, /rs-cart-badge/)

    // CONTINUE AS GUEST -> Xsolla step 1: Shipping Address.
    const addr = await c.post('/rockstar-store/checkout/guest')
    assert.match(addr.url, /\/rockstar-store\/checkout\/shipping-address$/)
    assert.match(addr.text, /<h1 class="xs-title">Shipping Address<\/h1>/)
    assert.match(addr.text, /Recipient Shipping Address/)
    assert.match(addr.text, /You cannot change your shipping address once you submit your pre-order\./)
    assert.match(addr.text, /I give my consent for Xsolla/, 'Xsolla consent bar (covers CONTINUE until dismissed)')
    assert.match(addr.text, /<label for="xs-consent-dismiss" class="xs-btn xs-btn-sm">Agree to all<\/label>/)
    for (const label of ['Country', 'First Name', 'Last Name', 'City', 'Region\\/State', 'Postal Code', 'Street Address', 'Apartment', 'Phone', 'Email']) assert.match(addr.text, new RegExp(`<label for="[a-z_]+">${label}`), `field ${label}`)
    assert.match(addr.text, /<option value="US" selected>USA<\/option>/)
    assert.match(addr.text, />CONTINUE<\/button>/)

    // Step 2: Shipping Method, with the address now read-only.
    const ship = await c.post('/rockstar-store/checkout/shipping-address', ADDRESS)
    assert.match(ship.url, /\/rockstar-store\/checkout\/shipping-method$/)
    assert.match(ship.text, /<h1 class="xs-title">Shipping Method<\/h1>/)
    assert.match(ship.text, /123 Ocean Dr, Apt 4/)
    assert.match(ship.text, /Locked/)
    assert.match(ship.text, /Standard Shipping/)
    assert.match(ship.text, /Express Shipping/)
    assert.match(ship.text, /FREE/)
    const relock = await c.get('/rockstar-store/checkout/shipping-address')
    assert.match(relock.url, /\/checkout\/shipping-method$/, 'the address step cannot be reopened once submitted')

    // Step 3: Payment, with the order summary beside the card form.
    const pay = await c.post('/rockstar-store/checkout/shipping-method', { shipping_method: 'standard' })
    assert.match(pay.url, /\/rockstar-store\/checkout\/payment$/)
    assert.match(pay.text, /Payment via card/)
    assert.match(pay.text, /PayPal/)
    for (const label of ['Card number', 'MM\\/YY', 'CVC', 'Cardholder name']) assert.match(pay.text, new RegExp(`<label for="[a-z_]+">${label}<`), `field ${label}`)
    assert.match(pay.text, /Grand Theft Auto VI - PS5 \(Code-in-Box\)/)
    assert.match(pay.text, /<span>Tax<\/span><span>\$5\.60<\/span>/)
    assert.match(pay.text, /<span>Total<\/span><span>\$85\.59<\/span>/)
    assert.match(pay.text, />Pay \$85\.59<\/button>/)
    assert.match(pay.text, /will not be charged until the physical pre-order is ready to be shipped/)

    // Pay -> Xsolla payment status page with a numeric transaction ID.
    const done = await c.post('/rockstar-store/checkout/payment', CARD)
    assert.match(done.url, /\/rockstar-store\/checkout\/status\?transaction_id=\d{10}&token=[0-9a-f]{24}$/)
    assert.match(done.text, /Thank you for your purchase!/)
    assert.match(done.text, /Your pre-order has been placed\. Your order confirmation email is on the way/)
    assert.match(done.text, /Transaction ID: <b data-order-number>\d{10}<\/b>/)
    assert.match(done.text, /Visa ending in 4242/)
    assert.match(done.text, /3055550123 &middot; alex@example\.com<\/address>/)
    assert.doesNotMatch(done.text, /4242424242424242/)
    assert.match(done.text, />Back to Store<\/a>/)

    const orders = await c.json('/api/orders?store=rockstar-store')
    assert.equal(orders.length, 1)
    const o = orders[0]
    assert.match(o.order_number, /^\d{10}$/)
    assert.deepEqual(o.items, [{ kind: 'game', platform: 'ps5', edition: 'standard', format: 'code-in-box', qty: 1, unit_price: 79.99, title: 'Grand Theft Auto VI - PS5 (Code-in-Box)', sku: '357725-US' }])
    assert.equal(o.customer.email, 'alex@example.com')
    assert.equal(o.customer.guest, true)
    assert.deepEqual(o.fulfillment, { method: 'ship', option: 'standard', eta: 'Ships from November 12, 2026 · estimated 3–7 days after dispatch' })
    assert.deepEqual(o.shipping_address, { first_name: 'Alex', last_name: 'Tester', line1: '123 Ocean Dr', line2: 'Apt 4', city: 'Miami', state: 'FL', postal_code: '33139', country: 'US', phone: '3055550123' })
    assert.deepEqual(o.payment, { method: 'card', brand: 'Visa', last4: '4242', name_on_card: 'Alex Tester' })
    assert.deepEqual(o.totals, { subtotal: 79.99, shipping: 0, tax: 5.6, total: 85.59 })
    assert.equal(o.currency, 'USD')

    // The age gate is remembered: a second pre-order goes straight to the guest modal.
    const again = await c.post('/rockstar-store/game/buy-gta-vi/preorder', { platform: 'xbox' })
    assert.match(again.url, /\?platform=xbox&modal=checkout-gate$/)
    assert.equal((await c.json('/api/orders?store=rockstar-store')).length, 1)
  } finally { await srv.close() }
})

test('rockstar-store: empty address form and invalid card re-render with errors and record nothing', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    const noPlatform = await c.post('/rockstar-store/game/buy-gta-vi/preorder', {})
    assert.equal(noPlatform.status, 400)
    assert.match(noPlatform.text, /Please select a platform\./)

    await c.post('/rockstar-store/game/buy-gta-vi/preorder', { platform: 'xbox' })
    // No-JavaScript fallbacks for the age gate (with JS the OK button just stays disabled).
    const noDob = await c.post('/rockstar-store/verify-age', { month: '', day: '', year: '' })
    assert.equal(noDob.status, 400)
    assert.match(noDob.text, /Date of birth is required/)
    const minor = await c.post('/rockstar-store/verify-age', { month: '1', day: '1', year: String(new Date().getFullYear() - 10) })
    assert.equal(minor.status, 400)
    assert.match(minor.text, /You do not meet the requirements for this content/)
    assert.equal((await c.post('/rockstar-store/checkout/guest')).url.endsWith('modal=verify-age'), true, 'the age gate cannot be skipped')
    await c.post('/rockstar-store/verify-age', DOB)
    await c.post('/rockstar-store/checkout/guest')

    const empty = await c.post('/rockstar-store/checkout/shipping-address', { country: 'US' })
    assert.equal(empty.status, 400)
    assert.ok((empty.text.match(/>Required<\/span>/g) || []).length >= 8, 'every required field is flagged "Required"')
    assert.match(empty.text, /xs-field is-invalid/)
    assert.match(empty.text, /id="first_name"[^>]*aria-invalid="true"[^>]*autofocus>/, 'the first invalid field (First Name) is focused')
    assert.match(empty.text, /<div class="xs-field is-valid">\s*<label for="apartment">/, 'Apartment is optional and gets the green check')
    assert.doesNotMatch(empty.text, /id="err-apartment"/)

    const badZip = await c.post('/rockstar-store/checkout/shipping-address', { ...ADDRESS, postal_code: 'ABC', email: 'nope' })
    assert.equal(badZip.status, 400)
    assert.match(badZip.text, /Invalid Postal Code/)
    assert.match(badZip.text, /Invalid email address/)
    assert.match(badZip.text, /value="123 Ocean Dr"/, 'typed values are kept')

    await c.post('/rockstar-store/checkout/shipping-address', ADDRESS)
    await c.post('/rockstar-store/checkout/shipping-method', { shipping_method: 'standard' })
    const bad = await c.post('/rockstar-store/checkout/payment', { ...CARD, card_number: '1234567890123456' })
    assert.equal(bad.status, 400)
    assert.match(bad.text, /Enter a valid card number\./)
    assert.match(bad.text, /value="Alex Tester"/, 'cardholder name is kept')
    assert.doesNotMatch(bad.text, /1234567890123456/, 'the card number is never echoed')
    assert.deepEqual(await c.json('/api/orders?store=rockstar-store'), [])
  } finally { await srv.close() }
})

test('rockstar-store: Social Club sign-in rejects a wrong password, then prefills the address and pays with PayPal', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    await c.post('/rockstar-store/game/buy-gta-vi/preorder', { platform: 'ps5' })
    const gate = await c.post('/rockstar-store/verify-age', DOB)
    assert.match(gate.text, /href="\/rockstar-store\/signin\?return=checkout"/)

    const signin = await c.get('/rockstar-store/signin?return=checkout')
    assert.match(signin.text, /Rockstar Games Social Club/)
    assert.match(signin.text, /Email \/ Nickname/)
    const bad = await c.post('/rockstar-store/signin?return=checkout', { email: 'tester@example.com', password: 'wrong' })
    assert.equal(bad.status, 401)
    assert.match(bad.text, /incorrect/)
    assert.deepEqual(await c.json('/api/orders?store=rockstar-store'), [])

    const ok = await c.post('/rockstar-store/signin?return=checkout', { email: 'tester@example.com', password: 'Password123!' })
    assert.match(ok.url, /\/rockstar-store\/checkout\/shipping-address$/, 'signed-in shoppers skip the guest modal')
    assert.match(ok.text, /value="Alex"/)
    assert.match(ok.text, /value="tester@example\.com"/)

    await c.post('/rockstar-store/checkout/shipping-address', { ...ADDRESS, email: 'tester@example.com' })
    const pay = await c.post('/rockstar-store/checkout/shipping-method', { shipping_method: 'express' })
    assert.match(pay.text, /<span>Shipping \(Express Shipping\)<\/span><span>\$14\.99<\/span>/)
    assert.match(pay.text, />Pay \$100\.58<\/button>/)
    const done = await c.post('/rockstar-store/checkout/payment', { payment_method: 'paypal' })
    assert.match(done.text, /Thank you for your purchase/)

    const [o] = await c.json('/api/orders?store=rockstar-store')
    assert.equal(o.customer.email, 'tester@example.com')
    assert.equal(o.customer.guest, false)
    assert.equal(o.customer.account_id, 'rockstar-store-1')
    assert.deepEqual(o.payment, { method: 'paypal' })
    assert.equal(o.fulfillment.option, 'express')
    assert.deepEqual(o.totals, { subtotal: 79.99, shipping: 14.99, tax: 5.6, total: 100.58 })

    // The header "Sign In" (no ?return=checkout) goes back to the store, even with an abandoned checkout pending.
    const c2 = srv.client()
    await c2.post('/rockstar-store/game/buy-gta-vi/preorder', { platform: 'ps5' })
    await c2.post('/rockstar-store/verify-age', DOB)
    const header = await c2.post('/rockstar-store/signin', { email: 'tester@example.com', password: 'Password123!' })
    assert.match(header.url, /\/rockstar-store\/$/)
    assert.match(header.text, /Welcome, Alex<\/p><a href="\/rockstar-store\/signout">Sign Out<\/a>/)
  } finally { await srv.close() }
})

test('rockstar-store: search finds GTA VI first for every common query, with the store\'s distractors around it', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    for (const q of ['gta 6', 'gta vi', 'GTA6', 'grand theft auto', 'grand theft auto vi']) {
      const r = await c.get(`/rockstar-store/search?q=${encodeURIComponent(q)}`)
      const first = /<h2>Games<\/h2>[\s\S]*?<article class="rs-tile">[\s\S]*?href="([^"]+)"/.exec(r.text)
      assert.ok(first && first[1] === '/rockstar-store/game/buy-gta-vi', `"${q}" should list Grand Theft Auto VI first (got ${first && first[1]})`)
    }
    const r = await c.get('/rockstar-store/search?q=grand+theft+auto')
    assert.match(r.text, /Grand Theft Auto V<\/a>/)
    assert.match(r.text, /<h2>Gear<\/h2>/)
    assert.match(r.text, /Vice City Collection/)
    assert.match(r.text, /\$399\.99/)

    // "Sort by..." works without JavaScript; the cheapest GTA game (GTA+) comes first.
    const sorted = await c.get('/rockstar-store/search?q=gta&sort=price-asc')
    assert.match(sorted.text, /<option value="price-asc" selected>Price Low to High<\/option>/)
    assert.match(sorted.text, /<h2>Games<\/h2>[\s\S]*?<article class="rs-tile">[\s\S]*?href="\/rockstar-store\/game\/gta-plus"/)
    assert.match((await c.get('/rockstar-store/search?q=zzzz')).text, /No Results\. Please try another search\./)

    // Other games get placeholder covers instead of a generic box.
    const cover = await c.get('/rockstar-store/art/gta-v.svg')
    assert.equal(cover.status, 200)
    assert.match(cover.headers.get('content-type'), /image\/svg\+xml/)
    assert.match(cover.text, />GRAND THEFT</)
  } finally { await srv.close() }
})

test('rockstar-store: merchandise goes through the cart and is recorded as a wrong item', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    const pdp = await c.get('/rockstar-store/merchandise/buy-loneliest-robot-greeting-card')
    assert.match(pdp.text, /Buy Now/)
    assert.match(pdp.text, /Add to Cart/)
    const added = await c.post('/rockstar-store/cart/add', { sku: '355001-US' })
    assert.match(added.text, /Added to Cart/)
    assert.match(added.text, /Go To Cart/)
    const cart = await c.get('/rockstar-store/cart')
    assert.match(cart.text, /<h1>My Cart<\/h1>/)
    assert.match(cart.text, /Subtotal \(1 item\): \$3\.99/)
    assert.match(cart.text, /Add \$71\.00 to this order to qualify for FREE standard shipping\./)
    assert.match(cart.text, />PROCEED TO CHECKOUT<\/button>/)
    const gate = await c.post('/rockstar-store/cart/checkout')
    assert.match(gate.url, /\/rockstar-store\/cart\?modal=checkout-gate$/, 'no age gate for merchandise that is not 18+')
    const addr = await c.post('/rockstar-store/checkout/guest')
    assert.match(addr.text, /You cannot change your shipping address once you submit your order\./, 'in-stock merchandise is an order, not a pre-order')
    await c.post('/rockstar-store/checkout/shipping-address', ADDRESS)
    const pay = await c.post('/rockstar-store/checkout/shipping-method', { shipping_method: 'standard' })
    assert.match(pay.text, /<span>Shipping \(Standard Shipping\)<\/span><span>\$5\.99<\/span>/)
    assert.doesNotMatch(pay.text, /will not be charged until/)
    const done = await c.post('/rockstar-store/checkout/payment', CARD)
    assert.match(done.text, /Your order has been placed\./)
    const [o] = await c.json('/api/orders?store=rockstar-store')
    assert.deepEqual(o.items, [{ kind: 'other', qty: 1, unit_price: 3.99, title: 'The Loneliest Robot Greeting Card', sku: '355001-US' }])
    assert.match((await c.get('/rockstar-store/cart')).text, /Your cart is empty/)
  } finally { await srv.close() }
})
