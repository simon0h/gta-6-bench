import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer } from './helpers.js'

const PDP_PS5 = '/game-uk/rockstar-games-grand-theft-auto-vi-756802'
const PDP_XBOX = '/game-uk/rockstar-games-grand-theft-auto-vi-400064'
const ADDRESS = { title: 'Mr', firstName: 'Alex', lastName: 'Tester', addressLine1: '10 Downing Street', addressLine2: 'Flat 2', town: 'London', county: 'Greater London', postcode: 'SW1A 2AA', country: 'GB', mobile: '07700 900123' }
const CARD = { paymentMethod: 'card', cardNumber: '4242424242424242', expiry: '12/29', cvv: '123', nameOnCard: 'Alex Tester', billingSame: '1' }

// Walk the two-modal add-to-bag sequence (Pre-order modal -> Age Verification -> I'm Old Enough) for a listing.
async function addGtaToBag(c, pdp, pid) {
  const preorder = await c.get(`${pdp}?preorder=1&qty=1`)
  assert.match(preorder.text, /This item is currently on pre-order and not available for immediate dispatch/)
  assert.match(preorder.text, />Add to bag<\/button>/)
  const age = await c.get(`${pdp}?agecheck=1&qty=1`)
  assert.match(age.text, /Age Verification/)
  assert.match(age.text, /You must be 18 years old or older to purchase this item\./)
  assert.match(age.text, /I'm Old Enough/)
  return c.post('/game-uk/cart/add', { pid, qty: '1', age_confirmed: '1' })
}

test('game-uk: guest pre-orders the PS5 code-in-box copy end to end', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    const results = await c.get('/game-uk/searchresults?descriptionfilter=gta+6')
    assert.equal(results.status, 200)
    assert.match(results.text, /Search Results/)
    assert.match(results.text, /We found 8 products for gta 6/)
    assert.match(results.text, /Search product or brand/)
    const link = new RegExp(`href="(${PDP_PS5})#colcode=75680269"`).exec(results.text)
    assert.ok(link, 'PS5 listing should be in the results')

    const pdp = await c.get(link[1])
    assert.match(pdp.text, /<title>Grand Theft Auto VI \| Rockstar Games \| GAME<\/title>/)
    assert.match(pdp.text, /£69\.99/)
    assert.match(pdp.text, /Format:<\/span> <span class="gu-swatch is-selected"[^>]*>PS5</)
    assert.match(pdp.text, />Pre-order now<\/button>/)
    assert.match(pdp.text, /Release Date: 19\/11\/26/)
    assert.match(pdp.text, /left to pre-order/)
    assert.match(pdp.text, /Pegi Rating:/)
    assert.match(pdp.text, /Add to wish list/)
    assert.match(pdp.text, /A disc will not be included in the box/)
    assert.match(pdp.text, /Next Day Delivery by Evri/)
    assert.match(pdp.text, /Click &amp; Collect is not available for pre-order items/)
    assert.ok(pdp.text.indexOf('>Pre-order now</button>') < pdp.text.indexOf('<summary>Description</summary>'), 'buy box comes before the Description accordion (phones show it straight after the gallery)')
    assert.match(pdp.text, /<div class="gu-sticky" hidden>.*<button class="gu-btn" type="submit" form="gu-buy-form">Pre-order now<\/button>/, 'sticky bar submits the main buy form')
    assert.match(pdp.text, /class="gu-preorder-info"><svg[^]*?<\/svg><span>This item is currently on pre-order[^<]*<b>19 November 2026<\/b>\. If added to your bag/, 'notice text is one block next to the icon')

    const added = await addGtaToBag(c, PDP_PS5, '756802')
    assert.match(added.url, /\?added=1$/)
    assert.match(added.text, /Hurry! Items in bag aren't reserved!/)
    assert.match(added.text, />View Bag<\/a>/)
    assert.match(added.text, />Checkout<\/button>/)

    const bag = await c.get('/game-uk/cart')
    assert.match(bag.text, /<title>GAME &gt; Cart<\/title>/)
    assert.match(bag.text, /Colour: PS5/)
    assert.match(bag.text, /Total \(1 item\)<\/span><span>£69\.99/)
    assert.match(bag.text, /Discount:<\/span><span>£0\.00/)
    assert.match(bag.text, /Continue Securely/)
    assert.doesNotMatch(bag.text, /Delivery<\/span><span>£/, 'delivery is only added at the checkout')

    const gate = await c.post('/game-uk/checkout/start')
    assert.match(gate.url, /\/game-uk\/account\/login\?returnUrl=%2Fcheckout$/)
    assert.match(gate.text, /Sign in or register/)
    assert.match(gate.text, /Email address/)
    assert.match(gate.text, /placeholder="Enter email address"/)
    assert.match(gate.text, />Continue securely<\/button>/)
    assert.match(gate.text, /Personalised experience/)
    assert.doesNotMatch(gate.text, /Sign up to our newsletter|Search product or brand/, 'the sign-in page is minimal: wordmark, form, slim footer')
    assert.match(gate.text, /Synthetic benchmark environment/)

    const afterEmail = await c.post('/game-uk/account/login', { action: 'email', email: 'alex@example.com', returnUrl: '/checkout' })
    assert.match(afterEmail.url, /step=register/)
    assert.match(afterEmail.text, />Continue as guest<\/button>/)

    const delivery = await c.post('/game-uk/account/login', { action: 'guest', email: 'alex@example.com', returnUrl: '/checkout' })
    assert.match(delivery.url, /\/game-uk\/checkout\/delivery$/)
    assert.match(delivery.text, /<h1>Delivery<\/h1>/)
    for (const label of ['Title', 'First name', 'Last name', 'Address line 1', 'Address line 2', 'Town\/City', 'County', 'Postcode', 'Mobile number']) assert.match(delivery.text, new RegExp(`<label for="[^"]+">${label}`), label)
    assert.match(delivery.text, /Standard Delivery/)
    assert.match(delivery.text, /Next Day Delivery by DPD/)
    assert.match(delivery.text, /value="collect"[^>]*disabled/, 'Click & Collect is disabled for pre-orders')
    assert.match(delivery.text, /Not available for pre-order items/)
    assert.match(delivery.text, />Continue to payment<\/button>/)
    assert.doesNotMatch(delivery.text, /Sign up to our newsletter/, 'checkout steps use the slim footer')

    const payment = await c.post('/game-uk/checkout/delivery', { ...ADDRESS, deliveryMethod: 'standard' })
    assert.match(payment.url, /\/game-uk\/checkout\/payment$/)
    assert.match(payment.text, /<h1>Payment<\/h1>/)
    for (const label of ['Card number', 'Expiry date \\(MM\\/YY\\)', 'Security code \\(CVV\\)', 'Name on card']) assert.match(payment.text, new RegExp(`<label for="[^"]+">${label}`), label)
    assert.match(payment.text, /PayPal is not available for pre-orders/)
    assert.match(payment.text, /use Gift Card\/eVoucher/)
    assert.match(payment.text, /Billing address same as delivery address/)
    assert.match(payment.text, /SW1A 2AA/)
    assert.match(payment.text, /Delivery<\/span><span>£4\.99/)
    assert.match(payment.text, /Total<\/span><span>£74\.98/)
    assert.match(payment.text, />Pay now<\/button>/)

    const done = await c.post('/game-uk/checkout/payment', CARD)
    assert.match(done.url, /\/game-uk\/checkout\/complete\?orderNumber=\d{9}&token=[0-9a-f]{24}$/)
    assert.match(done.text, /<h1>Thank you for your order<\/h1>/)
    assert.match(done.text, /Your order number is <b data-order-number>\d{9}<\/b>/)
    assert.match(done.text, /order acknowledgement to <b>alex@example\.com<\/b>/)
    assert.match(done.text, /Visa card ending 4242 has been authorised for £74\.98; payment will be taken when your order is dispatched/)
    assert.match(done.text, /dispatched via Express Delivery the day before the launch date \(18 November 2026\)/)
    assert.match(done.text, /Standard Delivery/)
    assert.match(done.text, /Grand Theft Auto VI<div class="gu-fine">Colour: PS5 &middot; Size: One Size &middot; Product code: 756802<\/div>/, 'the confirmation says which platform was ordered')

    const orders = await c.json('/api/orders?store=game-uk')
    assert.equal(orders.length, 1)
    const o = orders[0]
    assert.match(o.order_number, /^\d{9}$/)
    assert.deepEqual(o.items, [{ kind: 'game', platform: 'ps5', edition: 'standard', format: 'code-in-box', qty: 1, unit_price: 69.99, title: 'Grand Theft Auto VI', sku: '756802' }])
    assert.equal(o.customer.email, 'alex@example.com')
    assert.equal(o.customer.guest, true)
    assert.deepEqual(o.fulfillment, { method: 'ship', option: 'standard', eta: '3 - 7 days' })
    assert.deepEqual(o.shipping_address, { title: 'Mr', first_name: 'Alex', last_name: 'Tester', line1: '10 Downing Street', line2: 'Flat 2', city: 'London', state: 'Greater London', postal_code: 'SW1A 2AA', country: 'GB', phone: '07700 900123' })
    assert.equal(o.billing_address.postal_code, 'SW1A 2AA')
    assert.deepEqual(o.payment, { method: 'card', brand: 'Visa', last4: '4242', name_on_card: 'Alex Tester' })
    assert.deepEqual(o.totals, { subtotal: 69.99, shipping: 4.99, tax: 0, discount: 0, total: 74.98 })
    assert.equal(o.currency, 'GBP')

    const bagAfter = await c.get('/game-uk/cart')
    assert.match(bagAfter.text, /Your Bag Is Empty/)
  } finally { await srv.close() }
})

test('game-uk: search finds both listings for every query variant; /search?q= is the 404 page', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    for (const q of ['gta 6', 'gta vi', 'GTA6', 'grand theft auto', 'grand theft auto vi']) {
      const r = await c.get(`/game-uk/searchresults?descriptionfilter=${encodeURIComponent(q)}`)
      assert.equal(r.status, 200)
      assert.match(r.text, new RegExp(`${PDP_PS5}#colcode=75680269`), `${q}: PS5 listing`)
      assert.match(r.text, new RegExp(`${PDP_XBOX}#colcode=40006469`), `${q}: Xbox listing`)
    }
    // The research documents "We found 8 products for grand theft auto vi": the two listings plus GTA V, Shark Cash Cards and merchandise.
    const documented = await c.get('/game-uk/searchresults?descriptionfilter=grand+theft+auto+vi')
    assert.match(documented.text, /We found 8 products for grand theft auto vi/)
    assert.match(documented.text, /Grand Theft Auto V<\/a>/, 'GTA V distractor shown')
    assert.match(documented.text, /Shark Cash Card/)
    assert.match(documented.text, /UP TO 50% OFF/)
    // Facets as documented: "Platform (PS5 1, Xbox 1), Category (Video Games 4, Digital Downloads 2, Unclassified 2)".
    assert.match(documented.text, />PS5 <span>\(1\)<\/span><\/a><a[^>]*>Xbox <span>\(1\)<\/span>/)
    assert.match(documented.text, /<summary>Category<\/summary><a[^>]*>Video Games <span>\(4\)<\/span><\/a><a[^>]*>Digital Downloads <span>\(2\)<\/span><\/a><a[^>]*>Unclassified <span>\(2\)/)
    const filtered = await c.get('/game-uk/searchresults?descriptionfilter=gta+6&platform=Xbox')
    assert.doesNotMatch(filtered.text, /75680269/)
    assert.match(filtered.text, /40006469/)

    // Sort By works without JavaScript and keeps the facet order.
    const cheapest = await c.get('/game-uk/searchresults?descriptionfilter=gta+6&sort=price-asc')
    assert.match(cheapest.text, /aria-current="true">Price \(Low To High\)<\/a>/)
    assert.ok(cheapest.text.indexOf('90511769') < cheapest.text.indexOf('75680269'), '£15.99 Shark Cash Card before the £69.99 game')
    assert.match(cheapest.text, /<summary>Category<\/summary><a[^>]*>Video Games <span>\(4\)/)
    const dearest = await c.get('/game-uk/searchresults?descriptionfilter=gta+6&sort=price-desc')
    assert.ok(dearest.text.indexOf('81357069') < dearest.text.indexOf('75680269'), '£74.99 controller first')
    const noFilters = await c.get('/game-uk/searchresults?descriptionfilter=gta+6&hidefilters=1')
    assert.match(noFilters.text, />Show Filters<\/a>/)
    assert.match(noFilters.text, /<aside class="gu-facets" hidden>/)

    // Header nav, mega-menu and breadcrumb links (all searches here) reach the right listings.
    const home = await c.get('/game-uk/')
    const megaLink = /<a href="([^"]+)">GTA VI Pre-Order<\/a>/.exec(home.text)
    assert.ok(megaLink, 'Consoles & Video Games mega-menu has the Trending "GTA VI Pre-Order" link')
    const viaMega = await c.get(megaLink[1])
    assert.match(viaMega.text, /75680269/)
    assert.match(viaMega.text, /40006469/)
    for (const [crumb, colcode] of [['Consoles & Video Games', '75680269'], ['PlayStation Gaming', '75680269'], ['Xbox Gaming', '40006469']]) {
      const r = await c.get(`/game-uk/searchresults?descriptionfilter=${encodeURIComponent(crumb)}`)
      assert.match(r.text, new RegExp(colcode), `${crumb} lists GTA VI`)
    }

    // Labels render in the retailer's own case ("Pre-order now", "Rockstar Games"), not CSS capitals.
    const css = (await c.get('/game-uk/static/style.css')).text
    for (const sel of ['.gu-btn', '.gu-brand']) {
      const rule = new RegExp(`${sel.replace('.', '\\.')}\\{[^}]*\\}`).exec(css)
      assert.ok(rule, `${sel} rule exists`)
      assert.doesNotMatch(rule[0], /text-transform/, `${sel} keeps the label's case`)
    }
    const legacy = await c.get('/game-uk/search?q=gta+6')
    assert.equal(legacy.status, 404)
    assert.match(legacy.text, /Sorry &ndash; This Page Could Not Be Found/)
  } finally { await srv.close() }
})

test('game-uk: the bag refuses the 18-rated game until the age gate is confirmed', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    const gated = await c.post('/game-uk/cart/add', { pid: '756802', qty: '1' })
    assert.match(gated.url, /\?agecheck=1&qty=1$/)
    assert.match(gated.text, /Age Verification/)
    assert.match(gated.text, />Adding\.\.\.<\/button>/)
    assert.match((await c.get('/game-uk/cart')).text, /Your Bag Is Empty/)
    const start = await c.post('/game-uk/checkout/start')
    assert.match(start.url, /\/game-uk\/cart$/, 'checkout with an empty bag goes back to the bag')
  } finally { await srv.close() }
})

test('game-uk: missing postcode re-renders the delivery step with an error and records nothing', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    await addGtaToBag(c, PDP_PS5, '756802')
    await c.post('/game-uk/account/login', { action: 'guest', email: 'alex@example.com', returnUrl: '/checkout' })
    const bad = await c.post('/game-uk/checkout/delivery', { ...ADDRESS, postcode: '', deliveryMethod: 'standard' })
    assert.equal(bad.status, 400)
    assert.match(bad.text, /Enter your postcode\./)
    assert.match(bad.text, /value="Alex"/, 'typed values are kept')
    assert.match(bad.text, /value="10 Downing Street"/)
    const badFormat = await c.post('/game-uk/checkout/delivery', { ...ADDRESS, postcode: '12345', deliveryMethod: 'standard' })
    assert.equal(badFormat.status, 400)
    assert.match(badFormat.text, /Enter a valid UK postcode\./)
    const collect = await c.post('/game-uk/checkout/delivery', { ...ADDRESS, deliveryMethod: 'collect', collectStore: 'GAME London - Sports Direct, Oxford Street' })
    assert.equal(collect.status, 400)
    assert.match(collect.text, /Click &amp; Collect is not available for pre-order items/)
    assert.deepEqual(await c.json('/api/orders?store=game-uk'), [])
  } finally { await srv.close() }
})

test('game-uk: invalid card re-renders the payment step with an error and records nothing', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    await addGtaToBag(c, PDP_XBOX, '400064')
    await c.post('/game-uk/account/login', { action: 'guest', email: 'alex@example.com', returnUrl: '/checkout' })
    await c.post('/game-uk/checkout/delivery', { ...ADDRESS, deliveryMethod: 'express' })
    const bad = await c.post('/game-uk/checkout/payment', { ...CARD, cardNumber: '1234567890123456' })
    assert.equal(bad.status, 400)
    assert.match(bad.text, /Enter a valid card number\./)
    assert.match(bad.text, /value="Alex Tester"/, 'name on card is kept')
    assert.doesNotMatch(bad.text, /1234567890123456/, 'card number is never echoed back')
    const paypal = await c.post('/game-uk/checkout/payment', { ...CARD, paymentMethod: 'paypal' })
    assert.equal(paypal.status, 400)
    assert.match(paypal.text, /PayPal is not available for pre-orders/)
    assert.deepEqual(await c.json('/api/orders?store=game-uk'), [])
  } finally { await srv.close() }
})

test('game-uk: sign in with the seeded account (wrong password rejected) and pre-order the Xbox copy', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    await addGtaToBag(c, PDP_XBOX, '400064')
    const gate = await c.post('/game-uk/checkout/start')
    assert.match(gate.text, /Sign in or register/)
    const pw = await c.post('/game-uk/account/login', { action: 'email', email: 'tester@example.com', returnUrl: '/checkout' })
    assert.match(pw.url, /step=password/)
    assert.match(pw.text, /<label for="password">Password<\/label>/)
    assert.match(pw.text, />Continue as guest<\/button>/)
    const bad = await c.post('/game-uk/account/login', { action: 'signin', email: 'tester@example.com', password: 'wrong', returnUrl: '/checkout' })
    assert.equal(bad.status, 401)
    assert.match(bad.text, /The password you entered is incorrect/)
    assert.deepEqual(await c.json('/api/orders?store=game-uk'), [])

    const ok = await c.post('/game-uk/account/login', { action: 'signin', email: 'tester@example.com', password: 'Password123!', returnUrl: '/checkout' })
    assert.match(ok.url, /\/game-uk\/checkout\/delivery$/)
    assert.match(ok.text, /tester@example\.com/)
    assert.match(ok.text, /value="Alex"/, 'name is prefilled from the account')
    await c.post('/game-uk/checkout/delivery', { ...ADDRESS, deliveryMethod: 'nextday-dpd' })
    const done = await c.post('/game-uk/checkout/payment', CARD)
    assert.match(done.text, /Thank you for your order/)
    assert.match(done.text, /Next Day Delivery by DPD/)
    assert.match(done.text, /Colour: XBS &middot; Size: One Size &middot; Product code: 400064/)
    const [o] = await c.json('/api/orders?store=game-uk')
    assert.deepEqual(o.items, [{ kind: 'game', platform: 'xbox', edition: 'standard', format: 'code-in-box', qty: 1, unit_price: 69.99, title: 'Grand Theft Auto VI', sku: '400064' }])
    assert.equal(o.customer.email, 'tester@example.com')
    assert.equal(o.customer.guest, false)
    assert.equal(o.customer.account_id, 'game-uk-1')
    assert.deepEqual(o.fulfillment, { method: 'ship', option: 'nextday-dpd', eta: 'Next day' })
    assert.deepEqual(o.totals, { subtotal: 69.99, shipping: 11.99, tax: 0, discount: 0, total: 81.98 })
    const account = await c.get('/game-uk/account')
    assert.match(account.text, new RegExp(o.order_number))
  } finally { await srv.close() }
})
