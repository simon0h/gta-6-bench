import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer } from './helpers.js'

const ADDRESS = { firstName: 'Alex', lastName: 'Tester', address1: '123 Ocean Dr', address2: 'Apt 4', city: 'Miami', state: 'FL', zip: '33139', phone: '3055550123' }
const CARD = { method: 'card', cardNumber: '4242424242424242', expMonth: '12', expYear: '29', cvv: '123', firstName: 'Alex', lastName: 'Tester', phone: '3055550123', billingSame: '1', saveCard: '1' }
const GATE = '/walmart/account/login?state=%2Fcart%3Fcheckout%3Dtrue'

// Accessibility-tree readers name a checkbox/radio by its aria-label or by the direct text of its <label for=id>;
// without either they show its value ("checkbox 1"). Returns the choices that would be unnamed.
function unlabelledChoices(html) {
  return [...html.matchAll(/<input\b[^>]*type="(?:checkbox|radio)"[^>]*>/g)].map(m => m[0]).filter(tag => {
    if (/\baria-label="[^"]+"/.test(tag)) return false
    const id = /\bid="([^"]+)"/.exec(tag)?.[1]
    const label = id && new RegExp(`<label[^>]*\\bfor="${id}"[^>]*>([\\s\\S]*?)</label>`).exec(html)?.[1]
    if (!label) return true
    let text = label.replace(/<input\b[^>]*>|<br>/g, '')
    for (let prev; prev !== text;) { prev = text; text = text.replace(/<(\w+)[^>]*>[^<]*<\/\1>/g, '') }
    return !text.trim()
  })
}

test('walmart: shopper searches, preorders the PS5 copy, signs in at the gate and places the order', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    for (const q of ['gta 6', 'gta vi', 'GTA6', 'grand theft auto', 'grand theft auto vi']) {
      const r = await c.get(`/walmart/search?q=${encodeURIComponent(q)}`)
      assert.equal(r.status, 200)
      assert.match(r.text, /\/ip\/Grand-Theft-Auto-VI-PlayStation-5-Game\/20482917228/, `"${q}" finds the PS5 listing`)
      assert.match(r.text, /\/ip\/Grand-Theft-Auto-VI-Xbox-Series-X-Game\/20459958275/, `"${q}" finds the Xbox listing`)
    }
    const results = await c.get('/walmart/search?q=gta+6')
    assert.match(results.text, /Results for &quot;gta 6&quot;/)
    assert.match(results.text, /Uses item details\. Price when purchased online/)
    assert.match(results.text, /Overall pick/)
    assert.match(results.text, /In 50\+ people&#39;s carts/)
    assert.match(results.text, />Preorder<\/button>/)
    assert.match(results.text, /The Album \(Original Soundtrack\)/, 'soundtrack distractor is listed')
    assert.match(results.text, /Grand Theft Auto V, PlayStation 5 Game/, 'GTA V distractor is listed')
    const link = /href="(\/walmart\/ip\/Grand-Theft-Auto-VI-PlayStation-5-Game\/20482917228[^"]*)"/.exec(results.text)
    assert.ok(link, 'PS5 listing links to its product page')

    const pdp = await c.get(link[1].replaceAll('&amp;', '&'))
    assert.equal(pdp.status, 200)
    assert.match(pdp.text, /<h1 class="wm-pdp-title">Grand Theft Auto VI, PlayStation 5 Game, \(Code in Box, Delivers 11\/12\/26, Playable 11\/19\/26\)<\/h1>/)
    assert.match(pdp.text, /Current price is <\/span>\$79\.99/)
    assert.match(pdp.text, /Preorder Price Guarantee/)
    assert.match(pdp.text, /wm-pill-lg">Preorder<\/button>/)
    assert.match(pdp.text, /I want delivery savings with/)
    assert.match(pdp.text, /How do you want your item\?/)
    assert.match(pdp.text, /Check nearby/)
    assert.match(pdp.text, /Not available/)
    assert.match(pdp.text, /Arrives by Thu, Nov 12, 2026/)
    assert.match(pdp.text, /Add to list/)
    assert.deepEqual(unlabelledChoices(pdp.text), [], 'PDP checkboxes/radios have label[for]')
    assert.match(pdp.text, /aria-label="Sign In Account"/)

    const added = await c.post('/walmart/cart/add', { pid: '20482917228', fulfillment: 'shipping' })
    assert.match(added.url, /\/walmart\/pac\?id=20482917228&ip=79\.99&qt=1/)
    assert.match(added.text, /Added to cart!/)
    assert.match(added.text, /View cart \(1\)/)
    assert.doesNotMatch(added.text, /Continue to checkout/)

    const cart = await c.get('/walmart/cart')
    assert.match(cart.text, /Cart <span class="wm-cart-n">\(1 item\)/)
    assert.match(cart.text, /Free shipping, arrives by Thu, Nov 12/)
    assert.match(cart.text, /Taxes<\/span><span>Calculated at checkout/)
    assert.match(cart.text, /Estimated total<\/span><span>\$79\.99/)
    assert.match(cart.text, /This order is a gift\./)
    assert.match(cart.text, /Continue to checkout/)
    assert.doesNotMatch(cart.text, /promo/i)
    assert.match(cart.text, /Earn \$77\.39 cash back!/, 'cash back is truncated to the cent like the real cart')
    assert.match(cart.text, /aria-label="Cart contains 1 item, total \$79\.99"/)
    assert.deepEqual(unlabelledChoices(cart.text), [], 'cart checkboxes have label[for]')

    const gate = await c.post('/walmart/cart/checkout', {})
    assert.match(gate.url, /\/walmart\/account\/login\?state=%2Fcart%3Fcheckout%3Dtrue&tp=CXO$/)
    assert.match(gate.text, /Sign in or create your account/)
    assert.match(gate.text, /Phone number or email \(required\)/)
    assert.match(gate.text, />Continue<\/button>/)
    assert.doesNotMatch(gate.text, /guest/i, 'no guest option anywhere')

    const pw = await c.post(GATE, { identifier: 'tester@example.com' })
    assert.match(pw.url, /\/walmart\/account\/signin\/withpassword$/)
    assert.match(pw.text, /Welcome back!/)
    assert.match(pw.text, /tester@example\.com/)
    assert.match(pw.text, /Keep me signed in/)
    assert.match(pw.text, />Sign in<\/button>/)
    assert.match(pw.text, /href="\/walmart\/account\/login\?state=%2Fcart%3Fcheckout%3Dtrue">Change email address/, 'identity links keep the checkout return path')
    assert.deepEqual(unlabelledChoices(pw.text), [])

    const co = await c.post('/walmart/account/signin/withpassword', { password: 'Password123!', keep: '1' })
    assert.match(co.url, /\/walmart\/checkout\/review-order\?cartId=[0-9a-f-]{36}$/)
    assert.match(co.text, /<h2>Shipping<\/h2><p>Arrives by Thu, Nov 12<\/p>/)
    assert.match(co.text, /<h3>Add address<\/h3>/)
    assert.match(co.text, /id="form-address"/)
    assert.match(co.text, /form="form-address"[^>]*>Continue<\/button>/, 'order-summary CTA submits the open card')
    assert.deepEqual(unlabelledChoices(co.text), [])

    const afterAddress = await c.post('/walmart/checkout/address', ADDRESS)
    assert.match(afterAddress.url, /\/checkout\/review-order\?cartId=/)
    assert.match(afterAddress.text, /123 Ocean Dr, Apt 4<br>Miami, FL 33139/)
    assert.match(afterAddress.text, /Taxes<\/span><span>\$5\.60/)
    assert.match(afterAddress.text, /id="form-payment"/)
    assert.match(afterAddress.text, /Same as delivery address/)
    assert.match(afterAddress.text, /Save and review order/)
    // Card form (research/walmart.json): Card number, First/Last name, "MM*" / "YY*" selects under "Expiration date", CVV, Phone.
    assert.match(afterAddress.text, /<legend>Expiration date<\/legend>/)
    assert.match(afterAddress.text, /<label for="expMonth">MM\*<\/label><select id="expMonth" name="expMonth" aria-label="Expiration month"/)
    assert.match(afterAddress.text, /<label for="expYear">YY\*<\/label><select id="expYear" name="expYear" aria-label="Expiration year"/)
    assert.doesNotMatch(afterAddress.text, /name="expiration"/)
    const order = ['for="cardNumber"', 'for="firstName"', 'for="lastName"', 'for="expMonth"', 'for="cvv"', 'for="phone"', 'for="billingSame"'].map(s => afterAddress.text.indexOf(s))
    assert.ok(order.every((i, n) => i > 0 && (n === 0 || i > order[n - 1])), `card fields in research order: ${order}`)
    assert.deepEqual(unlabelledChoices(afterAddress.text), [])

    const afterPayment = await c.post('/walmart/checkout/payment', CARD)
    assert.match(afterPayment.text, /Visa ending in 4242/)
    assert.match(afterPayment.text, /tester@example\.com/, 'contact is pre-filled from the account')
    assert.match(afterPayment.text, /Edit Contact/)
    assert.match(afterPayment.text, /Place order for \$85\.59/)
    assert.match(afterPayment.text, /By placing this order, you agree to our/)
    assert.deepEqual(unlabelledChoices(afterPayment.text), [])

    const done = await c.post('/walmart/checkout/place-order', {})
    assert.match(done.url, /\/walmart\/thankyou\?order=\d{7}-\d{8}&token=[0-9a-f]{24}$/)
    assert.match(done.text, /Thanks for your order!/)
    assert.match(done.text, /Order# <span data-order-number>\d{7}-\d{8}<\/span>/)
    assert.match(done.text, /Track my order/)
    assert.match(done.text, /Keep shopping/)
    assert.match(done.text, /Visa ending in 4242/)

    const orders = await c.json('/api/orders?store=walmart')
    assert.equal(orders.length, 1)
    const o = orders[0]
    assert.match(o.order_number, /^\d{7}-\d{8}$/)
    assert.deepEqual(o.items, [{ kind: 'game', platform: 'ps5', edition: 'standard', format: 'code-in-box', qty: 1, unit_price: 79.99, title: 'Grand Theft Auto VI, PlayStation 5 Game, (Code in Box, Delivers 11/12/26, Playable 11/19/26)', sku: '20482917228' }])
    assert.equal(o.customer.email, 'tester@example.com')
    assert.equal(o.customer.guest, false)
    assert.equal(o.fulfillment.method, 'ship')
    assert.equal(o.fulfillment.eta, 'Thu, Nov 12')
    assert.deepEqual(o.shipping_address, { first_name: 'Alex', last_name: 'Tester', line1: '123 Ocean Dr', line2: 'Apt 4', city: 'Miami', state: 'FL', postal_code: '33139', country: 'US', phone: '3055550123', instructions: null })
    assert.equal(o.billing_address.postal_code, '33139')
    assert.deepEqual(o.payment, { method: 'card', brand: 'Visa', last4: '4242', name_on_card: 'Alex Tester', expiration: '12/29' })
    assert.deepEqual(o.totals, { subtotal: 79.99, shipping: 0, tax: 5.6, total: 85.59 })
    assert.equal(o.currency, 'USD')
    assert.equal(o.meta.gift, false)
    assert.equal(o.meta.walmart_plus, null)

    const cartAfter = await c.get('/walmart/cart')
    assert.match(cartAfter.text, /Your cart is empty/)
  } finally { await srv.close() }
})

test('walmart: missing address fields and an invalid card re-render the card with errors and record nothing', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    await c.post('/walmart/cart/add', { pid: '20459958275' })
    await c.post('/walmart/cart/checkout', {})
    await c.post(GATE, { identifier: 'tester@example.com' })
    const co = await c.post('/walmart/account/signin/withpassword', { password: 'Password123!' })
    assert.match(co.url, /\/checkout\/review-order/)

    const badAddress = await c.post('/walmart/checkout/address', { ...ADDRESS, zip: '', phone: '555' })
    assert.equal(badAddress.status, 400)
    assert.match(badAddress.text, /Enter a valid ZIP code/)
    assert.match(badAddress.text, /Enter a valid 10 digit phone number/)
    assert.match(badAddress.text, /value="123 Ocean Dr"/, 'typed values are kept')

    await c.post('/walmart/checkout/address', ADDRESS)
    const badCard = await c.post('/walmart/checkout/payment', { ...CARD, cardNumber: '1234567890123456' })
    assert.equal(badCard.status, 400)
    assert.match(badCard.text, /Please enter a valid card number\./)
    assert.match(badCard.text, /value="Alex"/, 'typed values are kept')
    assert.match(badCard.text, /<option value="12" selected>12<\/option>/, 'the chosen expiry month is kept')
    assert.doesNotMatch(badCard.text, /1234567890123456/, 'the card number is never echoed')
    assert.match(badCard.text, /class="wm-error-summary" role="alert" tabindex="-1" autofocus/, 'the re-rendered page jumps to the failed card')
    const noYear = await c.post('/walmart/checkout/payment', { ...CARD, expYear: '' })
    assert.equal(noYear.status, 400)
    assert.match(noYear.text, /Expiration date is required/)
    assert.match(noYear.text, /aria-invalid="true" aria-describedby="expiration-error"/)

    const early = await c.post('/walmart/checkout/place-order', {})
    assert.match(early.url, /\/checkout\/review-order/, 'place order is refused while a card is unsaved')
    assert.match(early.text, /id="form-payment"/)
    assert.deepEqual(await c.json('/api/orders?store=walmart'), [])
  } finally { await srv.close() }
})

test('walmart: the identity gate rejects a wrong password and sends new emails to "Create your Walmart account"', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    const invalid = await c.post('/walmart/account/login', { identifier: 'not-an-email' })
    assert.equal(invalid.status, 400)
    assert.match(invalid.text, /Please enter a valid phone number or email/)
    await c.post('/walmart/account/login', { identifier: 'tester@example.com' })
    const wrong = await c.post('/walmart/account/signin/withpassword', { password: 'wrong' })
    assert.equal(wrong.status, 401)
    assert.match(wrong.text, /Your email address and password don&#39;t match\. Please try again or reset your password\./)
    assert.deepEqual(await c.json('/api/orders?store=walmart'), [])

    // A new shopper ticks Walmart+ on the PDP, marks the order as a gift in the cart, and has to create an account.
    const n = srv.client()
    await n.post('/walmart/cart/add', { pid: '20459958275', plus: '1' })
    const cart = await n.get('/walmart/cart')
    assert.match(cart.text, /name="plus" value="1"[^>]* checked>/, 'the PDP Walmart+ choice carries into the cart')
    await n.post('/walmart/cart/checkout', { plus: '1', gift: '1' })
    const signup = await n.post(GATE, { identifier: 'new.shopper@example.com' })
    assert.match(signup.url, /\/walmart\/account\/sign-up$/)
    assert.match(signup.text, /Create your Walmart account/)
    assert.match(signup.text, /value="new.shopper@example.com"/)
    for (const label of ['First name', 'Last name', 'Email address', 'Phone number', 'Create a password']) assert.match(signup.text, new RegExp(`>${label}</label>`))
    assert.match(signup.text, />Create account<\/button>/)
    assert.doesNotMatch(signup.text, /guest/i)
    assert.deepEqual(unlabelledChoices(signup.text), [])
    assert.match(signup.text, /href="\/walmart\/account\/login\?state=%2Fcart%3Fcheckout%3Dtrue">Sign in<\/a>/, '"Sign in" keeps the checkout return path')

    const weak = await n.post('/walmart/account/sign-up', { firstName: 'Sam', lastName: 'New', email: 'new.shopper@example.com', phone: '4025550199', password: 'short' })
    assert.equal(weak.status, 400)
    assert.match(weak.text, /8-100 characters/)
    assert.match(weak.text, /value="Sam"/)
    const dup = await n.post('/walmart/account/sign-up', { firstName: 'Sam', lastName: 'New', email: 'tester@example.com', phone: '4025550199', password: 'Password123!' })
    assert.equal(dup.status, 400)
    assert.match(dup.text, /An account with this email already exists\./)

    const co = await n.post('/walmart/account/sign-up', { firstName: 'Sam', lastName: 'New', email: 'new.shopper@example.com', phone: '4025550199', password: 'Password123!', keep: '1' })
    assert.match(co.url, /\/walmart\/checkout\/review-order\?cartId=/)
    assert.match(co.text, /Xbox Series X\/S Game/)
    await n.post('/walmart/checkout/address', { ...ADDRESS, firstName: 'Sam', lastName: 'New' })
    const paid = await n.post('/walmart/checkout/payment', { ...CARD, firstName: 'Sam', lastName: 'New' })
    assert.match(paid.text, /Choose your plan/)
    assert.match(paid.text, /No thanks, continue without Walmart\+/)
    assert.doesNotMatch(paid.text, /Place order for/, 'the Walmart+ card must be answered first')
    const declined = await n.post('/walmart/checkout/plus', { decline: '1' })
    assert.match(declined.text, /Place order for \$85\.59/)
    assert.match(declined.text, /name="gift" value="1" checked/)

    const editContact = await n.get('/walmart/checkout/review-order?edit=contact')
    assert.match(editContact.text, /id="form-contact"/)
    assert.match(editContact.text, /value="new.shopper@example.com"/)
    await n.post('/walmart/checkout/contact', { email: 'new.shopper@example.com', phone: '4025550199', textUpdates: '1' })
    const done = await n.post('/walmart/checkout/place-order', { gift: '1' })
    assert.match(done.text, /Thanks for your order!/)
    const [o] = await n.json('/api/orders?store=walmart')
    assert.equal(o.customer.email, 'new.shopper@example.com')
    assert.equal(o.customer.first_name, 'Sam')
    assert.equal(o.customer.phone, '4025550199')
    assert.equal(o.items[0].platform, 'xbox')
    assert.equal(o.meta.gift, true)
    assert.equal(o.meta.walmart_plus, null)
    assert.equal(o.totals.total, 85.59)
  } finally { await srv.close() }
})

test('walmart: picking a Walmart+ plan at checkout adds the $1 trial to the order', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    await c.post('/walmart/cart/add', { pid: '20482917228' })
    await c.post('/walmart/cart/checkout', { plus: '1' })
    await c.post(GATE, { identifier: 'tester@example.com' })
    await c.post('/walmart/account/signin/withpassword', { password: 'Password123!' })
    await c.post('/walmart/checkout/address', ADDRESS)
    // A scripted post with a single "MM/YY" expiration instead of the two selects is still accepted.
    const { expMonth, expYear, ...legacyCard } = CARD
    await c.post('/walmart/checkout/payment', { ...legacyCard, expiration: '12/29' })
    const noAgree = await c.post('/walmart/checkout/plus', { plan: 'annual' })
    assert.equal(noAgree.status, 400)
    assert.match(noAgree.text, /You must check the box to agree to the terms/)
    assert.match(noAgree.text, /<label class="wm-check" for="agree"><input type="checkbox" id="agree"/)
    assert.deepEqual(unlabelledChoices(noAgree.text), [])
    const picked = await c.post('/walmart/checkout/plus', { plan: 'annual', agree: '1' })
    assert.match(picked.text, /Walmart\+ 30-day trial<\/span><span>\$1\.00/)
    assert.match(picked.text, /Place order for \$86\.59/)
    const done = await c.post('/walmart/checkout/place-order', {})
    assert.match(done.text, /Your W\+ trial membership has been created/)
    const [o] = await c.json('/api/orders?store=walmart')
    assert.deepEqual(o.totals, { subtotal: 79.99, shipping: 0, tax: 5.6, walmart_plus: 1, total: 86.59 })
    assert.equal(o.meta.walmart_plus, 'annual')
    assert.equal(o.payment.expiration, '12/29')
  } finally { await srv.close() }
})
