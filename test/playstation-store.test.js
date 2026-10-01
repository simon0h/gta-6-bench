import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer, fieldValue } from './helpers.js'

const S = '/playstation-store'
const STD_ID = 'EP1004-PPSA01547_00-GTAVISTANDARD001'
const ULT_ID = 'EP1004-PPSA01547_00-GTAVIULTIMATE001'
const STD = `${S}/en-us/product/${STD_ID}`
const ULT = `${S}/en-us/product/${ULT_ID}`
const CONCEPT = `${S}/en-us/concept/10000730/`
const SIGNIN = `${S}/my.account.sony.com/central/signin/`
const SIGNUP = `${S}/my.account.sony.com/central/signup/`
const YEAR = String(new Date().getFullYear() + 3) // always a future expiry
const CARD = { cardNumber: '4242 4242 4242 4242', cardholderName: 'Alex Tester', expMonth: '12', expYear: YEAR, cvv: '123' }
const BILLING = { firstName: 'Alex', lastName: 'Tester', address1: '123 Ocean Dr', address2: 'Apt 4', city: 'Miami', state: 'FL', zip: '33139', country: 'US', phone: '305-555-0123', setDefault: '1' }

// Sony's two-step sign-in: Sign-In ID > Next, Password > Sign In. Returns the page it lands on.
async function signIn(c, redirect = `${S}/`, password = 'Password123!') {
  const pw = await c.post(SIGNIN, { step: 'email', email: 'tester@example.com', redirect_uri: redirect })
  assert.match(pw.text, /<label for="password">Password<\/label>/)
  return c.post(SIGNIN, { step: 'password', email: 'tester@example.com', password, redirect_uri: redirect })
}

test('playstation-store: search -> concept page -> Standard Pre-Order -> Sony sign-in -> drawer -> Add Payment Method -> Pre-Order & Pay -> thank you', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    const home = await c.get(`${S}/`)
    assert.match(home.text, /placeholder="Search PS Store"/)
    assert.match(home.text, /class="ps-pill ps-pill-blue ps-signin"[^>]*>Sign In<\/a>/)

    // The header search submits ?q= and lands on the path-style search URL.
    const results = await c.get(`${S}/en-us/search?q=gta+6`)
    assert.equal(results.url, `${srv.base}${S}/en-us/search/gta%206`)
    assert.match(results.text, /<title>PlayStation Store \| Search \| gta 6<\/title>/)
    assert.match(results.text, /You searched for: <em>gta 6<\/em>/)
    assert.match(results.text, />Filter<\/button>/)
    const tiles = [...results.text.matchAll(/class="ps-tile" href="([^"]+)"/g)].map(m => m[1])
    assert.deepEqual(tiles.slice(0, 3), [STD, ULT, `${S}/en-us/product/EP1004-PPSA01547_00-ULTEDTIONUPGRADE`], 'both editions and the add-on lead the results')
    assert.match(results.text, /Grand Theft Auto V \(PlayStation®5\)/, 'GTA V is listed next to the game')
    for (const q of ['gta vi', 'grand theft auto', 'grand theft auto vi', 'GTA6']) {
      const r = await c.get(`${S}/en-us/search/${encodeURIComponent(q)}`)
      assert.ok(r.text.includes(`href="${STD}"`), `search "${q}" finds the Standard Edition`)
    }

    // Concept page: the featured Ultimate Edition hero, then the Editions section.
    const concept = await c.get(CONCEPT)
    assert.match(concept.text, /<h1>Grand Theft Auto VI: Ultimate Edition<\/h1>/)
    assert.match(concept.text, /11\/18\/2026 09:00 PM PST/)
    assert.match(concept.text, /<li>PS5<\/li><li>ULTIMATE EDITION<\/li><li>PS5 PRO ENHANCED<\/li>/)
    assert.match(concept.text, /1-month GTA\+ subscription with pre-order\. Auto-renews\. Check Game and Legal Info\* below\./)
    assert.match(concept.text, /<h2>Editions:<\/h2>/)
    assert.match(concept.text, /Standard Edition<\/a><\/h3>[\s\S]*?\$79\.99/)
    assert.match(concept.text, /Ultimate Edition<\/a><\/h3>[\s\S]*?\$99\.99/)
    assert.match(concept.text, /<h2>Add-Ons<\/h2>[\s\S]*?Unavailable/)
    assert.match(concept.text, /<h2>Game and Legal Info<\/h2>/)
    assert.equal(concept.text.match(/>Pre-Order<\/button>/g).length, 3, 'hero plus one per edition card')
    assert.doesNotMatch(concept.text, /name="qty"/, 'no quantity selector')

    // Signed out, Pre-Order goes to Sony sign-in (no guest option) and comes back to the same page.
    const wall = await c.post(`${S}/en-us/preorder`, { sku: STD_ID, returnTo: CONCEPT })
    assert.equal(wall.url, `${srv.base}${SIGNIN}?redirect_uri=${encodeURIComponent(CONCEPT)}`)
    assert.match(wall.text, /<h1>Sign In<\/h1>/)
    assert.match(wall.text, /<label for="email">Sign-In ID \(Email Address\)<\/label>/)
    assert.match(wall.text, />Next<\/button>/)
    assert.match(wall.text, /Sign in with Passkey/)
    assert.match(wall.text, /Trouble Signing In\?/)
    assert.match(wall.text, /Create New Account/)
    assert.doesNotMatch(wall.text, /guest/i)
    const back = await signIn(c, fieldValue(wall.text, 'redirect_uri'))
    assert.equal(back.url, `${srv.base}${CONCEPT}`, 'sign-in returns to the concept page')
    assert.match(back.text, /class="ps-avatar"/)
    assert.doesNotMatch(back.text, /ps-signin/)

    // Signed in, the Standard card's Pre-Order opens the drawer straight on "Confirm Pre-Order" (no cart step).
    const drawer = await c.post(`${S}/en-us/preorder`, { sku: STD_ID, returnTo: CONCEPT })
    const buyNow = `${S}/en-us/checkout/buynow/${STD_ID}`
    assert.equal(drawer.url, `${srv.base}${buyNow}`)
    assert.match(drawer.text, /<aside class="ps-drawer"/)
    assert.match(drawer.text, /<h2>Confirm Pre-Order<\/h2>/)
    assert.match(drawer.text, /<b>Grand Theft Auto VI<\/b>/)
    assert.match(drawer.text, /Release Date: 11\/18\/2026/)
    assert.match(drawer.text, /Wallet Balance<\/span><b>\$0\.00/)
    assert.match(drawer.text, /Please select a payment method\./)
    assert.match(drawer.text, /<dt>Subtotal<\/dt><dd>\$79\.99<\/dd>/)
    assert.match(drawer.text, /<dt>Tax<\/dt><dd>\$5\.60<\/dd>/)
    assert.match(drawer.text, /<dt>Total \(1 item\)<\/dt><dd>\$85\.59<\/dd>/)
    assert.match(drawer.text, /Learn more about taxes and fees/)
    assert.match(drawer.text, /You&#39;ll be charged for your pre-order when you select \[Pre-Order &amp; Pay\]\. If the price drops before the product is released, we&#39;ll refund you the difference\./)
    assert.match(drawer.text, />Pre-Order &amp; Pay<\/button>/)
    assert.ok(drawer.text.includes(`class="ps-drawer-close" href="${CONCEPT}"`), 'closing the drawer returns to the concept page')
    assert.match(drawer.text, /<h1>Grand Theft Auto VI: Ultimate Edition<\/h1>/, 'the concept page is still underneath')

    // Paying without a payment method re-renders the drawer with an error and records nothing.
    const noPm = await c.post(buyNow, {})
    assert.equal(noPm.status, 400)
    assert.match(noPm.text, /role="alert">Please select a payment method\./)
    assert.deepEqual(await c.json('/api/orders?store=playstation-store'), [])

    // Add Payment Method: card screen > Next, then billing screen > Save.
    const add = await c.get(`${buyNow}/payment`)
    assert.match(add.text, /<h2>Add Payment Method<\/h2>/)
    assert.match(add.text, /Add your payment method \(maximum 3 credit\/debit cards\)\./)
    assert.match(add.text, /Add a PayPal Account/)
    const cardForm = await c.get(`${buyNow}/payment/card`)
    assert.match(cardForm.text, /<h2>Add a Credit\/Debit Card<\/h2>/)
    for (const label of ['Credit/Debit Card Number', "Cardholder's Name", 'Month', 'Year', 'CVV']) assert.match(cardForm.text, new RegExp(`<label for="[a-zA-Z]+">${label}</label>`), `card field "${label}"`)
    assert.match(cardForm.text, /<legend>Expires On<\/legend>/)
    assert.match(cardForm.text, /This is the 3- or 4-digit code on your credit\/debit card\./)
    const billing = await c.post(`${buyNow}/payment/card`, CARD)
    assert.equal(billing.url, `${srv.base}${buyNow}/payment/card/billing`)
    assert.match(billing.text, /<h2>Billing Information<\/h2>/)
    assert.match(billing.text, /Visa · Card ending in 4242/)
    for (const label of ['First name', 'Last name', 'Street address', 'Address 2 \\(optional\\)', 'City', 'State', 'ZIP Code', 'Country or region', 'Phone number']) assert.match(billing.text, new RegExp(`<label for="[a-zA-Z0-9]+">${label}</label>`), `billing field "${label}"`)
    assert.match(billing.text, /name="firstName" type="text" value="Alex"/, 'account name is prefilled')
    assert.match(billing.text, />Save<\/button>/)
    const saved = await c.post(`${buyNow}/payment/card/billing`, BILLING)
    assert.equal(saved.url, `${srv.base}${buyNow}`)
    assert.match(saved.text, /Credit\/debit card has been successfully added\./)
    assert.match(saved.text, /value="card-[0-9a-f]+" checked><span>Visa · Card ending in 4242<\/span><span class="ps-default-tag">Default<\/span>/)

    const done = await c.post(buyNow, { paymentMethod: fieldValue(saved.text, 'paymentMethod') })
    assert.match(done.url, /\/playstation-store\/en-us\/checkout\/thankyou\?order=\d{11}&token=[0-9a-f]+$/)
    assert.match(done.text, /<title>Thank You \| Checkout<\/title>/)
    assert.match(done.text, /<h2>Thank you for your purchase!<\/h2>/)
    assert.match(done.text, /<p class="ps-online-id">AlexTester<\/p>/)
    assert.match(done.text, /This game will be released on 11\/18\/2026\./)
    assert.match(done.text, /Download to Console/)
    assert.match(done.text, />Download from Library<\/a>/)
    assert.match(done.text, />Continue Shopping<\/a>/)
    assert.match(done.text, /Must be redeemed by March 31st 2027\./)
    const number = /data-order-number>(\d{11})</.exec(done.text)[1]

    const orders = await c.json('/api/orders?store=playstation-store')
    assert.equal(orders.length, 1)
    const o = orders[0]
    assert.equal(o.order_number, number)
    assert.deepEqual(o.items, [{ kind: 'game', platform: 'ps5', edition: 'standard', format: 'digital', qty: 1, unit_price: 79.99, title: 'Grand Theft Auto VI', sku: STD_ID }])
    assert.equal(o.customer.email, 'tester@example.com')
    assert.equal(o.customer.online_id, 'AlexTester')
    assert.deepEqual(o.fulfillment, { method: 'digital' })
    assert.equal(o.shipping_address, null)
    assert.equal(o.billing_address.postal_code, '33139')
    assert.deepEqual(o.payment, { method: 'card', brand: 'Visa', last4: '4242', name_on_card: 'Alex Tester' })
    assert.deepEqual(o.totals, { subtotal: 79.99, shipping: 0, tax: 5.6, total: 85.59 })
    assert.equal(o.currency, 'USD')
    assert.doesNotMatch(JSON.stringify(o), /4242 ?4242 ?4242 ?4242/)

    // The thank-you view is looked up by order number + token.
    const forged = await c.get(`${S}/en-us/checkout/thankyou?order=${number}&token=wrong`)
    assert.equal(forged.status, 404)
    assert.match(forged.text, /Something went wrong\./)

    // The pre-order is now in the Game Library.
    const library = await c.get(`${S}/en-us/library`)
    assert.match(library.text, new RegExp(`Order Number ${number}`))

    // A digital licence cannot be bought twice: the Standard card shows its status and a resubmitted payment is refused.
    const after = await c.get(CONCEPT)
    assert.match(after.text, /aria-disabled="true">Pre-Ordered<\/span>/)
    assert.equal(after.text.match(/>Pre-Order<\/button>/g).length, 2, 'only the Ultimate Edition can still be pre-ordered')
    const again = await c.post(buyNow, { paymentMethod: fieldValue(saved.text, 'paymentMethod') })
    assert.equal(again.status, 409)
    assert.match(again.text, /You have already purchased this item\./)
    assert.equal((await c.json('/api/orders?store=playstation-store')).length, 1)
  } finally { await srv.close() }
})

test('playstation-store: invalid card and bad billing re-render the drawer with errors and record nothing', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    await signIn(c, ULT)
    const drawer = await c.post(`${S}/en-us/preorder`, { sku: ULT_ID, returnTo: ULT })
    assert.match(drawer.text, /<h2>Confirm Pre-Order<\/h2>/)
    assert.match(drawer.text, /<b>Grand Theft Auto VI: Ultimate Edition<\/b>/)
    assert.match(drawer.text, /<dt>Total \(1 item\)<\/dt><dd>\$106\.99<\/dd>/)
    const buyNow = `${S}/en-us/checkout/buynow/${ULT_ID}`

    const bad = await c.post(`${buyNow}/payment/card`, { ...CARD, cardNumber: '4242 4242 4242 4241' })
    assert.equal(bad.status, 400)
    assert.match(bad.text, /Enter a valid card number\./)
    assert.match(bad.text, /name="cardholderName" type="text" value="Alex Tester"/, 'typed values are kept')
    assert.match(bad.text, /<option value="12" selected>12<\/option>/)
    assert.ok(bad.text.includes(`<option value="${YEAR}" selected>${YEAR}</option>`), 'expiry year is kept')
    assert.doesNotMatch(bad.text, /4241/, 'the card number is never echoed back')

    const expired = await c.post(`${buyNow}/payment/card`, { ...CARD, expMonth: '01', expYear: '2026' })
    assert.equal(expired.status, 400)
    assert.match(expired.text, /This card has expired\./)

    const blank = await c.post(`${buyNow}/payment/card`, { cardNumber: '', cardholderName: '', expMonth: '', expYear: '', cvv: '' })
    assert.equal(blank.status, 400)
    assert.match(blank.text, /Enter the cardholder&#39;s name\./)
    assert.match(blank.text, /Enter the 3 or 4 digit security code\./)

    // The billing screen is unreachable until a card passes, then validates on Save.
    const early = await c.get(`${buyNow}/payment/card/billing`)
    assert.equal(early.url, `${srv.base}${buyNow}/payment/card`)
    await c.post(`${buyNow}/payment/card`, CARD)
    const badBilling = await c.post(`${buyNow}/payment/card/billing`, { ...BILLING, address1: '', zip: '331', phone: '' })
    assert.equal(badBilling.status, 400)
    assert.match(badBilling.text, /Enter your street address\./)
    assert.match(badBilling.text, /Enter a valid ZIP code\./)
    assert.match(badBilling.text, /Enter your phone number\./)
    assert.match(badBilling.text, /name="city" type="text" value="Miami"/, 'typed values are kept')
    assert.match(badBilling.text, /<option value="FL" selected>FL<\/option>/)

    // Pre-Order & Pay still refuses without a payment method.
    const noPm = await c.post(buyNow, { paymentMethod: 'card-doesnotexist' })
    assert.equal(noPm.status, 400)
    assert.match(noPm.text, /role="alert">Please select a payment method\./)
    assert.deepEqual(await c.json('/api/orders?store=playstation-store'), [])
  } finally { await srv.close() }
})

test('playstation-store: sign-in gate, signed-out cart drawer, wrong password and Create New Account', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    // The header Cart opens the drawer; signed out it only offers Sign In.
    const cart = await c.get(`${S}/en-us/checkout?return=${encodeURIComponent(STD)}`)
    assert.match(cart.text, /<h2>Sign In To Proceed<\/h2>/)
    assert.ok(cart.text.includes(`href="${SIGNIN}?redirect_uri=${encodeURIComponent(STD)}"`), 'drawer Sign In returns to the product')
    assert.match(cart.text, /<h1>Grand Theft Auto VI<\/h1>/, 'the drawer slides over the product page')
    // /en-us/cart is not a page: it redirects to the store fallback.
    const cartUrl = await c.get(`${S}/en-us/cart`)
    assert.equal(cartUrl.url, `${srv.base}${S}/en-us/pages/cart/`)
    assert.match(cartUrl.text, /This probably isn't what you're looking for/)

    // Add to Wishlist needs an account too.
    const wish = await c.post(`${S}/en-us/wishlist`, { sku: STD_ID, returnTo: STD })
    assert.equal(wish.url, `${srv.base}${SIGNIN}?redirect_uri=${encodeURIComponent(STD)}`)

    // Step 1 validates the sign-in ID; step 2 rejects a wrong password and keeps the ID.
    const empty = await c.post(SIGNIN, { step: 'email', email: '', redirect_uri: STD })
    assert.equal(empty.status, 400)
    assert.match(empty.text, /Enter your sign-in ID \(email address\)\./)
    const wrong = await signIn(c, STD, 'wrong-password')
    assert.equal(wrong.status, 401)
    assert.match(wrong.text, /The sign-in ID \(email address\) or password is incorrect\./)
    assert.match(wrong.text, /<span>tester@example\.com<\/span>/)
    const open = await c.get(`${S}/en-us/checkout?return=${encodeURIComponent(STD)}`)
    assert.match(open.text, /Sign In To Proceed/, 'still signed out')

    // Create New Account: errors re-render with typed values; success signs in and returns to the product.
    const email = `jordan.${Date.now()}@example.com`
    const NEW = { dob: '1995-04-12', country: 'US', state: 'FL', language: 'en-US', email, password: 'Secret123', onlineId: 'VCJordan', firstName: 'Jordan', lastName: 'Vice', terms: '1', redirect_uri: STD }
    const form = await c.get(`${SIGNUP}?redirect_uri=${encodeURIComponent(STD)}`)
    assert.match(form.text, /<h1>Create New Account<\/h1>/)
    const badNew = await c.post(SIGNUP, { ...NEW, terms: '', onlineId: '9x' })
    assert.equal(badNew.status, 400)
    assert.match(badNew.text, /You must agree to the terms to create an account\./)
    assert.match(badNew.text, /Your online ID must be 3-16 characters/)
    assert.match(badNew.text, /name="firstName" type="text" value="Jordan"/)
    assert.doesNotMatch(badNew.text, /Secret123/, 'the password is not echoed back')
    const dup = await c.post(SIGNUP, { ...NEW, email: 'tester@example.com' })
    assert.match(dup.text, /This sign-in ID \(email address\) is already in use\./)
    const created = await c.post(SIGNUP, NEW)
    assert.equal(created.url, `${srv.base}${STD}`)
    assert.match(created.text, /Account menu for VCJordan/)

    const wished = await c.post(`${S}/en-us/wishlist`, { sku: STD_ID, returnTo: STD })
    assert.match(wished.text, /Grand Theft Auto VI was added to your wishlist\./)
    const out = await c.get(`${S}/logout`)
    assert.match(out.text, /ps-signin/)
    const again = await c.post(SIGNIN, { step: 'password', email, password: 'Secret123', redirect_uri: STD })
    assert.match(again.text, /Account menu for VCJordan/)
    assert.deepEqual(await c.json('/api/orders?store=playstation-store'), [])
  } finally { await srv.close() }
})

test('playstation-store: a regular item goes through the Cart drawer and is recorded as a wrong item', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    const GTAV = 'UP1004-PPSA03420_00-GTAVSTANDALONE01'
    const page = `${S}/en-us/product/${GTAV}`
    await signIn(c, page)
    const cart = await c.post(`${S}/en-us/cart/add`, { sku: GTAV, returnTo: page })
    assert.equal(cart.url, `${srv.base}${S}/en-us/checkout`)
    assert.match(cart.text, /<h2>Cart \(1 Item\)<\/h2>/)
    assert.match(cart.text, /Remove Grand Theft Auto V \(PlayStation®5\) from cart/)
    assert.match(cart.text, />Confirm Purchase<\/button>/, 'no pre-order in the cart, so the regular label')
    const paypal = await c.post(`${S}/en-us/checkout/payment/service`, { service: 'paypal' })
    assert.match(paypal.text, /value="paypal" checked><span>PayPal<\/span>/)
    const done = await c.post(`${S}/en-us/checkout`, { paymentMethod: 'paypal' })
    assert.match(done.text, /Thank you for your purchase!/)
    const [o] = await c.json('/api/orders?store=playstation-store')
    assert.deepEqual(o.items, [{ kind: 'other', qty: 1, unit_price: 39.99, title: 'Grand Theft Auto V (PlayStation®5)', sku: GTAV }])
    assert.deepEqual(o.payment, { method: 'paypal' })
    const after = await c.get(`${S}/en-us/checkout`)
    assert.match(after.text, /Your cart is empty\./)
  } finally { await srv.close() }
})
