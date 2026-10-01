import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer } from './helpers.js'

const PS5 = 'B0H6K928WL'
const XBOX = 'B0H6K49W6Y'
const ADDRESS = { countryCode: 'US', fullName: 'Alex Tester', phoneNumber: '305-555-0123', addressLine1: '123 Ocean Dr', addressLine2: 'Apt 4', city: 'Miami', state: 'FL', postalCode: '33139', deliveryInstructions: '' }
const CARD = { cardNumber: '4242 4242 4242 4242', nameOnCard: 'Alex Tester', expMonth: '12', expYear: '2029' }
const orders = (c) => c.json('/api/orders?store=amazon')

test('amazon: search → product → Pre-order now → sign in → address → payment → review → Order placed, thanks!', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    const home = await c.get('/amazon/')
    assert.match(home.text, /placeholder="Search Amazon"/)

    // The header form sends the "All" department as an empty i=; the store drops it for Amazon's /s?k={q}.
    const results = await c.get('/amazon/s?i=&k=gta+6')
    assert.match(results.url, /\/amazon\/s\?k=gta\+6$/)
    assert.match(results.text, /results for <span class="az-q">"gta 6"<\/span>/)
    assert.match(results.text, /Check each product page for other buying options\./)
    // Noisy results: the soundtrack ranks first, the game tile comes later.
    const titles = [...results.text.matchAll(/class="az-result-title"><a href="([^"]+)">([^<]+)</g)]
    assert.match(titles[0][2], /Grand Theft Auto VI: The Album/)
    const game = titles.find(t => t[1].endsWith(`/dp/${PS5}`))
    assert.ok(game, 'the PS5 code-in-box listing is in the results')
    assert.ok(titles.indexOf(game) > 3, 'the game is not the top result')
    assert.match(results.text, /Pre-order Price Guarantee\./)
    assert.match(results.text, /FREE delivery Mon, Nov 16/)

    const pdp = await c.get(game[1])
    assert.equal(pdp.url.endsWith('/amazon/Grand-Theft-Auto-VI-PlayStation-Delivers/dp/B0H6K928WL'), true)
    assert.match(pdp.text, /<h1 class="az-title" id="productTitle">Grand Theft Auto VI - PlayStation 5 \(Code in Box, Delivers 11\/12\/26, Playable 11\/19\/26\)<\/h1>/)
    assert.match(pdp.text, /Visit the Rockstar Games Store/)
    assert.match(pdp.text, /FREE delivery Monday, November 16/)
    assert.match(pdp.text, /Or fastest Release Day delivery <b>Thursday, November 12<\/b>/)
    assert.match(pdp.text, /Delivering to San Jose 95112 - <a href="#">Update location<\/a>/)
    assert.match(pdp.text, /This item will be released on November 12, 2026\./)
    assert.match(pdp.text, /<label for="quantity">Quantity:<\/label>/)
    assert.match(pdp.text, /id="buy-now-button"[^>]*><span id="submit\.buy-now-announce">Pre-order now<\/span><\/button>/)
    assert.doesNotMatch(pdp.text, /add-to-cart-button/, 'the pre-order buy box has no Add to Cart (research quirk)')
    assert.match(pdp.text, /You're not charged until your order enters the shipping process\./)
    assert.match(pdp.text, /Shipper \/ Seller<\/th><td>Amazon\.com/)
    assert.match(pdp.text, />Add to List<\/button>/)

    // "Pre-order now" is Amazon's Buy Now: straight to checkout entry, which is the sign-in wall for a guest.
    const wall = await c.post('/amazon/gp/product/handle-buy-box', { ASIN: PS5, quantity: '1', 'submit.buy-now': '1' })
    assert.ok(wall.visited.some(v => v.url.includes('/checkout/entry/buynow?ASIN=B0H6K928WL')))
    assert.match(wall.url, /\/amazon\/ap\/signin\?openid\.return_to=%2Fgp%2Fbuy%2Faddressselect&openid\.assoc_handle=amazon_checkout_us$/)
    assert.match(wall.text, /<h1>Sign in or create account<\/h1>/)
    assert.match(wall.text, /<label for="ap_email_login">Enter mobile number or email<\/label>/)
    assert.doesNotMatch(wall.text, /guest/i, 'no guest checkout')

    const pw = await c.post('/amazon/ax/claim', { email: 'tester@example.com' })
    assert.match(pw.url, /\/amazon\/ap\/signin\/password$/)
    assert.match(pw.text, /<h1>Sign in<\/h1>/)
    assert.match(pw.text, /Keep me signed in\./)

    const address = await c.post('/amazon/ap/signin/password', { password: 'Password123!', rememberMe: 'true' })
    assert.match(address.url, /\/amazon\/gp\/buy\/addressselect$/)
    assert.match(address.text, /<span class="az-co-title">Checkout \(1 item\)<\/span>/)
    assert.match(address.text, /<h1>Select a delivery address<\/h1>/)
    for (const label of ['Country/Region', 'Full name \\(First and Last name\\)', 'Phone number', 'Address', 'City', 'State', 'ZIP Code']) assert.match(address.text, new RegExp(`>${label}</label>`))
    assert.match(address.text, /value="Alex Tester"/, 'full name is prefilled from the account')
    assert.match(address.text, />Use this address<\/button>/)

    const payment = await c.post('/amazon/gp/buy/addressselect', ADDRESS)
    assert.match(payment.url, /\/amazon\/gp\/buy\/payselect$/)
    assert.match(payment.text, /<h1>Select a payment method<\/h1>/)
    assert.match(payment.text, /Add a credit or debit card/)
    for (const label of ['Card number', 'Name on card']) assert.match(payment.text, new RegExp(`>${label}</label>`))
    assert.match(payment.text, /<legend>Expiration date<\/legend>/)
    assert.match(payment.text, />Use this payment method<\/button>/)

    const review = await c.post('/amazon/gp/buy/payselect', CARD)
    assert.match(review.url, /\/amazon\/gp\/buy\/spc$/)
    assert.match(review.text, /<h2>Review items and shipping<\/h2>/)
    assert.match(review.text, /Paying with Visa ending in 4242/)
    assert.match(review.text, /FREE delivery: Monday, November 16/)
    assert.match(review.text, /Release-Date Delivery: Thursday, November 12/)
    assert.match(review.text, /id="placeYourOrder">Place your order<\/button>/)
    assert.match(review.text, /By placing your order, you agree to Amazon's <a href="#">privacy notice<\/a> and <a href="#">conditions of use<\/a>\./)
    assert.match(review.text, /Order total:<\/span><span>\$85\.59/)
    assert.doesNotMatch(review.text, /4242 4242|4242424242424242/, 'the full card number is never echoed')

    const done = await c.post('/amazon/gp/buy/spc', { [`quantity_${PS5}`]: '1', delivery: 'standard', action: 'place' })
    assert.match(done.url, /\/amazon\/gp\/buy\/thankyou\?purchaseId=\d{3}-\d{7}-\d{7}&token=/)
    assert.match(done.text, /<h1>Order placed, thanks!<\/h1>/)
    assert.match(done.text, /Confirmation will be sent to <b>tester@example\.com<\/b>\./)
    assert.match(done.text, /Delivering to Alex Tester, Miami, FL 33139/)
    const shown = /Order number: <span data-order-number>(\d{3}-\d{7}-\d{7})<\/span>/.exec(done.text)
    assert.ok(shown, 'order number in the 3-7-7 format is shown')
    assert.match(done.text, /You're not charged until your order enters the shipping process\./)

    const list = await orders(c)
    assert.equal(list.length, 1)
    const o = list[0]
    assert.equal(o.order_number, shown[1])
    assert.match(o.order_number, /^\d{3}-\d{7}-\d{7}$/)
    assert.deepEqual(o.items, [{ kind: 'game', platform: 'ps5', edition: 'standard', format: 'code-in-box', qty: 1, unit_price: 79.99, title: 'Grand Theft Auto VI - PlayStation 5 (Code in Box, Delivers 11/12/26, Playable 11/19/26)', sku: PS5 }])
    assert.equal(o.customer.email, 'tester@example.com')
    assert.equal(o.customer.guest, false)
    assert.deepEqual(o.fulfillment, { method: 'ship', option: 'standard', eta: 'Monday, November 16' })
    assert.equal(o.shipping_address.line1, '123 Ocean Dr')
    assert.equal(o.shipping_address.postal_code, '33139')
    assert.deepEqual(o.payment, { method: 'card', brand: 'Visa', last4: '4242', name_on_card: 'Alex Tester', expiration: '12/2029' })
    assert.deepEqual(o.totals, { subtotal: 79.99, shipping: 0, tax: 5.6, total: 85.59 })
    assert.equal(o.currency, 'USD')
    assert.equal(o.meta.buy_now, true)
    assert.doesNotMatch(JSON.stringify(o), /4242424242424242/)

    // The confirmation link reaches Your Orders, where the pre-order waits to ship.
    const history = await c.get('/amazon/gp/css/order-history')
    assert.match(history.text, new RegExp(`ORDER # ${o.order_number}`))
    assert.match(history.text, /Not yet shipped/)
  } finally { await srv.close() }
})

test('amazon: search-tile Add to cart adds in place, cart checkout, create an account, Release-Date Delivery', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    // Every agreed search wording finds the game; the (non-existent) Ultimate Edition does not.
    for (const q of ['gta 6', 'gta vi', 'grand theft auto', 'grand theft auto vi', 'GTA6']) {
      const r = await c.get(`/amazon/s?k=${encodeURIComponent(q)}`)
      assert.match(r.text, new RegExp(`/dp/${XBOX}`), `search "${q}" finds the game`)
    }
    const ultimate = await c.get('/amazon/s?k=grand+theft+auto+vi+ultimate+edition')
    assert.doesNotMatch(ultimate.text, new RegExp(PS5))

    // In-place add: back on the same results page, with the tile marker, header count and right-rail cart panel.
    const added = await c.post('/amazon/cart/add', { asin: XBOX, quantity: '1', ret: '/s?k=gta+6', 'submit.addToCart': '1' })
    assert.match(added.url, /\/amazon\/s\?k=gta\+6$/)
    assert.match(added.text, /<span class="az-in-cart">1 in cart<\/span>/)
    assert.match(added.text, /<span class="az-cart-count">1<\/span>/)
    assert.match(added.text, /Added to cart/)
    assert.match(added.text, /Proceed to checkout \(1 item\)/)
    assert.match(added.text, />Go to Cart<\/a>/)
    assert.match(added.text, /Your order qualifies for FREE delivery\. Choose this option at checkout\./)

    // The panel's stepper raises the quantity without leaving the page.
    const stepped = await c.post('/amazon/cart/update', { asin: XBOX, action: 'inc', ret: '/s?k=gta+6' })
    assert.match(stepped.url, /\/amazon\/s\?k=gta\+6$/)
    assert.match(stepped.text, /<span class="az-cart-count">2<\/span>/)

    const cart = await c.get('/amazon/cart')
    assert.match(cart.text, /<h1>Shopping Cart<\/h1>/)
    assert.match(cart.text, /Platform For Display:<\/b> Xbox Series X \| S/)
    assert.match(cart.text, /aria-label="Quantity is 2"/)
    assert.match(cart.text, />Delete<\/button>/)
    assert.match(cart.text, />Save for later<\/button>/)
    assert.match(cart.text, /Subtotal \(2 items\): <b>\$159\.98<\/b>/)
    assert.match(cart.text, /Proceed to checkout \(2 items\)<\/button>/)

    // Account wall, then a brand-new email branches to account creation.
    const wall = await c.post('/amazon/gp/cart/desktop/go-to-checkout.html', {})
    assert.match(wall.url, /\/amazon\/ap\/signin\?openid\.return_to=%2Fgp%2Fbuy%2Faddressselect&openid\.assoc_handle=amazon_checkout_us$/)
    const create = await c.post('/amazon/ax/claim', { email: 'jordan.new@example.com' })
    assert.match(create.url, /\/amazon\/ap\/register$/)
    assert.match(create.text, /<h1>Create account<\/h1>/)
    for (const label of ['Your name', 'Mobile number or email', 'Password', 'Re-enter password']) assert.match(create.text, new RegExp(`>${label}</label>`))
    assert.match(create.text, /placeholder="At least 6 characters"/)
    assert.match(create.text, /value="jordan\.new@example\.com"/, 'the email carries over')

    const invalid = await c.post('/amazon/ap/register', { customerName: 'Jordan New', email: 'jordan.new@example.com', password: 'abc', passwordCheck: 'abd' })
    assert.equal(invalid.status, 400)
    assert.match(invalid.text, /Passwords must be at least 6 characters\./)
    assert.match(invalid.text, /Passwords must match/)
    assert.match(invalid.text, /value="Jordan New"/, 'typed values are kept')

    const address = await c.post('/amazon/ap/register', { customerName: 'Jordan New', email: 'jordan.new@example.com', password: 'secret12', passwordCheck: 'secret12' })
    assert.match(address.url, /\/amazon\/gp\/buy\/addressselect$/)
    assert.match(address.text, /Checkout \(2 items\)/)
    assert.match(address.text, /value="Jordan New"/)

    await c.post('/amazon/gp/buy/addressselect', { ...ADDRESS, fullName: 'Jordan New' })
    await c.post('/amazon/gp/buy/payselect', { ...CARD, cardNumber: '5555555555554444', nameOnCard: 'Jordan New', expMonth: '03', expYear: '2031' })
    // Choosing Release-Date Delivery re-renders the review page with the fee in the Order Summary.
    const review = await c.post('/amazon/gp/buy/spc', { [`quantity_${XBOX}`]: '2', delivery: 'release-date' })
    assert.match(review.text, /Arriving Thursday, November 12/)
    assert.match(review.text, /Shipping &amp; handling:<\/span><span>\$3\.99/)
    const done = await c.post('/amazon/gp/buy/spc', { [`quantity_${XBOX}`]: '2', delivery: 'release-date', action: 'place' })
    assert.match(done.text, /Order placed, thanks!/)
    assert.match(done.text, /Confirmation will be sent to <b>jordan\.new@example\.com<\/b>\./)
    assert.match(done.text, /Arriving Nov 12 \(Release-Date Delivery\)/)

    const [o] = await orders(c)
    assert.deepEqual(o.items, [{ kind: 'game', platform: 'xbox', edition: 'standard', format: 'code-in-box', qty: 2, unit_price: 79.99, title: 'Grand Theft Auto VI - Xbox Series X|S (Code in Box, Delivers 11/12/26, Playable 11/19/26)', sku: XBOX }])
    assert.equal(o.customer.email, 'jordan.new@example.com')
    assert.equal(o.customer.first_name, 'Jordan')
    assert.equal(o.fulfillment.option, 'release-date')
    assert.deepEqual(o.payment, { method: 'card', brand: 'Mastercard', last4: '4444', name_on_card: 'Jordan New', expiration: '03/2031' })
    assert.deepEqual(o.totals, { subtotal: 159.98, shipping: 3.99, tax: 11.2, total: 175.17 })
    assert.equal(o.meta.buy_now, false)

    const after = await c.get('/amazon/cart')
    assert.match(after.text, /Your Amazon Cart is empty/)

    // The new account can sign in again later.
    const d = srv.client()
    await d.post('/amazon/ax/claim', { email: 'jordan.new@example.com' })
    const back = await d.post('/amazon/ap/signin/password', { password: 'secret12' })
    assert.match(back.text, /Hello, Jordan/)
  } finally { await srv.close() }
})

test('amazon: invalid card re-renders the payment step with an error and records no order', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    // Checkout pages need a signed-in shopper: without one they bounce to the sign-in wall.
    await c.post('/amazon/gp/product/handle-buy-box', { ASIN: PS5, quantity: '1', 'submit.buy-now': '1' })
    const bounced = await c.get('/amazon/gp/buy/payselect')
    assert.match(bounced.url, /\/amazon\/ap\/signin\?openid\.return_to=%2Fgp%2Fbuy%2Fpayselect/)
    await c.post('/amazon/ax/claim', { email: 'tester@example.com' })
    const first = await c.post('/amazon/ap/signin/password', { password: 'Password123!' })
    assert.match(first.url, /\/amazon\/gp\/buy\/addressselect$/, 'the address step comes first')

    const noAddress = await c.post('/amazon/gp/buy/addressselect', { ...ADDRESS, addressLine1: '', postalCode: '3313' })
    assert.equal(noAddress.status, 400)
    assert.match(noAddress.text, /Please enter an address\./)
    assert.match(noAddress.text, /Please enter a valid ZIP or postal code\./)
    assert.match(noAddress.text, /value="Miami"/, 'typed values are kept')

    await c.post('/amazon/gp/buy/addressselect', ADDRESS)
    const bad = await c.post('/amazon/gp/buy/payselect', { ...CARD, cardNumber: '4242 4242 4242 4241' })
    assert.equal(bad.status, 400)
    assert.match(bad.url, /\/amazon\/gp\/buy\/payselect$/)
    assert.match(bad.text, /<h1>Select a payment method<\/h1>/)
    assert.match(bad.text, /There was a problem/)
    assert.match(bad.text, /Please enter a valid card number\./)
    assert.match(bad.text, /id="nameOnCard"[^>]*value="Alex Tester"/, 'typed name is kept')
    assert.doesNotMatch(bad.text, /4242 4242 4242 4241|4242424242424241/, 'the card number is not echoed')

    const expired = await c.post('/amazon/gp/buy/payselect', { ...CARD, expMonth: '01', expYear: '2026' })
    assert.equal(expired.status, 400)
    assert.match(expired.text, /This card has expired\./)

    // Skipping ahead to the review step without a payment method sends the shopper back to it.
    const skipped = await c.post('/amazon/gp/buy/spc', { delivery: 'standard', action: 'place' })
    assert.match(skipped.url, /\/amazon\/gp\/buy\/payselect$/)
    assert.deepEqual(await orders(c), [])
  } finally { await srv.close() }
})

test('amazon: sign in with the test account, wrong password is rejected, header sign-in returns to the page', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    const pdp = await c.get(`/amazon/dp/${PS5}`)
    const link = /<a class="az-nav-item" href="([^"]+)"><span class="az-nav-line1">Hello, sign in<\/span>/.exec(pdp.text)
    assert.ok(link, 'header shows "Hello, sign in"')
    const start = await c.get(link[1].replaceAll('&amp;', '&'))
    assert.match(start.text, /Sign in or create account/)

    const empty = await c.post('/amazon/ax/claim', { email: '' })
    assert.equal(empty.status, 400)
    assert.match(empty.text, /Enter your mobile number or email/)
    const malformed = await c.post('/amazon/ax/claim', { email: 'tester@example' })
    assert.match(malformed.text, /Invalid email address/)

    await c.post('/amazon/ax/claim', { email: 'tester@example.com' })
    const wrong = await c.post('/amazon/ap/signin/password', { password: 'Password123' })
    assert.equal(wrong.status, 401)
    assert.match(wrong.text, /There was a problem/)
    assert.match(wrong.text, /Your password is incorrect/)
    assert.match(wrong.text, /tester@example\.com/)
    assert.match((await c.get('/amazon/')).text, /Hello, sign in/, 'still signed out')

    const ok = await c.post('/amazon/ap/signin/password', { password: 'Password123!' })
    assert.match(ok.url, /\/amazon\/dp\/B0H6K928WL$/, 'back on the product page')
    assert.match(ok.text, /Hello, Alex/)
    assert.match(ok.text, /Deliver to Alex/)

    // Signed in, "Pre-order now" skips the wall and opens checkout.
    const co = await c.post('/amazon/gp/product/handle-buy-box', { ASIN: PS5, quantity: '2', 'submit.buy-now': '1' })
    assert.match(co.url, /\/amazon\/gp\/buy\/addressselect$/)
    assert.match(co.text, /Checkout \(2 items\)/)
    assert.deepEqual(await orders(c), [])
  } finally { await srv.close() }
})
