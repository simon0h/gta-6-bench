import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer } from './helpers.js'

const STD = '/xbox-store/en-US/games/store/grand-theft-auto-vi/9p3h4968grsm'
const ULT = '/xbox-store/en-US/games/store/grand-theft-auto-vi-ultimate-edition/9nnzsnhlr63l'
const CARD = { pi: 'new', payType: 'card', cardNumber: '4242424242424242', expMonth: '12', expYear: '2029', cvv: '123', nameOnCard: 'Alex Tester', address1: '123 Ocean Dr', address2: '', city: 'Miami', state: 'FL', zip: '33139', country: 'US' }

// The two-step Microsoft account sign-in plus the "Stay signed in?" interstitial. Returns the page it lands on.
async function signIn(c, email = 'tester@example.com', password = 'Password123!') {
  const pw = await c.post('/xbox-store/login.live.com/oauth20_authorize.srf', { loginfmt: email })
  assert.match(pw.url, /\/login\.live\.com\/password\.srf$/)
  assert.match(pw.text, /Enter password/)
  const kmsi = await c.post('/xbox-store/login.live.com/password.srf', { passwd: password })
  assert.match(kmsi.url, /\/login\.live\.com\/kmsi\.srf$/)
  assert.match(kmsi.text, /Stay signed in\?/)
  return c.post('/xbox-store/login.live.com/kmsi.srf', { kmsi: 'yes' })
}

test('xbox-store: search -> Ultimate Edition -> PRE-ORDER -> Microsoft sign-in -> purchase dialog -> Pre-order -> confirmation', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    const results = await c.get('/xbox-store/en-US/search/results?q=gta+6')
    assert.equal(results.status, 200)
    assert.match(results.text, /Search results for: gta 6/)
    assert.ok(results.text.includes(`href="${STD}"`), 'Standard listing tile links to its product page')
    assert.ok(results.text.includes(`href="${ULT}"`), 'Ultimate listing tile links to its product page')
    assert.match(results.text, /PRE-ORDER<\/span>/)
    assert.match(results.text, /Grand Theft Auto V \(Xbox Series X\|S\)/, 'distractor GTA V is shown next to the game')

    const pdp = await c.get(STD)
    assert.match(pdp.text, /<h1>Grand Theft Auto VI<\/h1>/)
    assert.match(pdp.text, /PRE-ORDER<\/span><span class="xb-btn-sub">\$79\.99<sup>\+<\/sup>/)
    assert.match(pdp.text, /CHOOSE EDITION/)
    assert.match(pdp.text, /Compare editions/)
    assert.match(pdp.text, /GO TO GAME/)
    assert.match(pdp.text, /RETURN TO TOP/)
    assert.match(pdp.text, /Purchase prior to 19 November 2026 23:59:59 to receive:/)
    assert.ok(pdp.text.includes(`<a class="xb-edition-row " href="${ULT}"`), 'CHOOSE EDITION row for the Ultimate Edition is a plain link')
    assert.doesNotMatch(pdp.text, /role="listitem"/, 'edition rows keep their link role')
    assert.match(pdp.text, /id="more"[\s\S]*XBOX GAME PASS[\s\S]*JOIN NOW/, 'Game Pass upsell is the MORE tab target')
    // Header: the magnifier opens an inline "Search Xbox.com" box with Search / Cancel; store pages use the dark header.
    assert.match(pdp.text, /<summary class="xb-search-toggle"[^>]*aria-label="Search Xbox\.com"/)
    assert.match(pdp.text, /placeholder="Search Xbox\.com"[\s\S]*>Search<\/button>[\s\S]*>Cancel<\/button>/)
    assert.match(pdp.text, /<body class="xb-dark">/)
    assert.match(pdp.text, /href="[^"]*oauth20_authorize\.srf[^"]*" aria-label="Sign in"/)

    const ult = await c.get(ULT)
    assert.match(ult.text, /<h1>Grand Theft Auto VI: Ultimate Edition<\/h1>/)
    assert.match(ult.text, /PRE-ORDER<\/span><span class="xb-btn-sub">\$99\.99<sup>\+<\/sup>/)

    // Signed out, PRE-ORDER hits the Microsoft account wall: no guest option.
    const wall = await c.post(`${ULT}/preorder`)
    assert.match(wall.url, /\/xbox-store\/login\.live\.com\/oauth20_authorize\.srf/)
    assert.match(wall.text, /<title>Sign in<\/title>/)
    assert.match(wall.text, /Use your Microsoft account\./)
    assert.match(wall.text, /Email or phone number/)
    assert.match(wall.text, />Next<\/button>/)
    assert.doesNotMatch(wall.text, /guest/i)

    const dialog = await signIn(c)
    assert.equal(dialog.url, `${srv.base}${ULT}/buy`, 'sign-in returns to the game with the purchase dialog open')
    assert.match(dialog.text, /Choose a way to pay/)
    assert.match(dialog.text, /Add a new payment method/)
    for (const label of ['Card number', 'Expiration month', 'Expiration year', 'CVV', 'Name on card', 'Address line 1', 'City', 'State', 'ZIP code']) assert.match(dialog.text, new RegExp(`<label for="[a-zA-Z0-9]+">${label}`), `field "${label}" present`)
    assert.match(dialog.text, /Credit or debit card/)
    // The payment screen already shows the order summary with tax and a "Pre-order" button...
    assert.match(dialog.text, /Order summary[\s\S]*Estimated tax<\/span><span>\$7\.00[\s\S]*Total<\/span><span>\$106\.99/)
    assert.match(dialog.text, /<button type="submit" class="xb-btn xb-btn-buy">Pre-order<\/button>/)

    // ...but pressing it only opens the confirmation screen, where "Pre-order" has to be pressed again.
    const confirm = await c.post(`${ULT}/buy`, CARD)
    assert.match(confirm.url, /\/buy\/confirm$/)
    assert.deepEqual(await c.json('/api/orders?store=xbox-store'), [], 'first Pre-order press records nothing')
    assert.match(confirm.text, /Confirm payment/)
    assert.match(confirm.text, /Visa &bull;&bull;&bull;&bull; 4242/)
    assert.match(confirm.text, /Subtotal<\/span><span>\$99\.99/)
    assert.match(confirm.text, /Estimated tax<\/span><span>\$7\.00/)
    assert.match(confirm.text, /Total<\/span><span>\$106\.99/)
    assert.match(confirm.text, /10 days before the release date/)
    assert.match(confirm.text, />Pre-order<\/button>/)
    // "Change" goes back to the payment screen, where the card just added is now a saved method.
    const change = await c.get(`${ULT}/buy`)
    assert.match(change.text, /<input type="radio" id="pi-0" name="pi" value="0" checked> Visa •••• 4242/)

    const done = await c.post(`${ULT}/buy/confirm`)
    assert.match(done.url, /\/xbox-store\/en-US\/purchase\/complete\?order=\d{10}&token=[0-9a-f]{24}$/)
    assert.match(done.text, /Thanks for your purchase/)
    assert.match(done.text, /Order #<span data-order-number>\d{10}<\/span>/)
    assert.match(done.text, /Order history/)
    assert.match(done.text, /Microsoft Store - Order Confirmation \(Order #\d{10}\)/)

    const orders = await c.json('/api/orders?store=xbox-store')
    assert.equal(orders.length, 1)
    const o = orders[0]
    assert.match(o.order_number, /^\d{10}$/)
    assert.deepEqual(o.items, [{ kind: 'game', platform: 'xbox', edition: 'ultimate', format: 'digital', qty: 1, unit_price: 99.99, title: 'Grand Theft Auto VI: Ultimate Edition', sku: '9nnzsnhlr63l' }])
    assert.equal(o.customer.email, 'tester@example.com')
    assert.equal(o.customer.guest, false)
    assert.deepEqual(o.fulfillment, { method: 'digital', eta: 'Unlocks on release, 11/18/2026; pre-download available before release' })
    assert.equal(o.shipping_address, null)
    assert.equal(o.billing_address.postal_code, '33139')
    assert.deepEqual(o.payment, { method: 'card', brand: 'Visa', last4: '4242', name_on_card: 'Alex Tester' })
    assert.deepEqual(o.totals, { subtotal: 99.99, shipping: 0, tax: 7, total: 106.99 })
    assert.equal(o.currency, 'USD')
    assert.equal(o.meta.charge_timing, 'about 10 days before release', 'a card pre-order is billed near release')

    const history = await c.get('/xbox-store/account/billing/orders')
    assert.match(history.text, new RegExp(o.order_number))
    assert.match(history.text, /Completed/)

    // The card stays on the Microsoft account: a second pre-order can use it without retyping anything.
    const again = await c.post(`${STD}/preorder`)
    assert.equal(again.url, `${srv.base}${STD}/buy`, 'signed in, PRE-ORDER opens the purchase dialog directly')
    assert.match(again.text, /<input type="radio" id="pi-0" name="pi" value="0" checked> Visa •••• 4242/)
    const confirm2 = await c.post(`${STD}/buy`, { pi: '0' })
    assert.match(confirm2.text, /Visa &bull;&bull;&bull;&bull; 4242/)
    await c.post(`${STD}/buy/confirm`)
    const all = await c.json('/api/orders?store=xbox-store')
    assert.equal(all.length, 2)
    assert.equal(all[1].items[0].edition, 'standard')
    assert.deepEqual(all[1].payment, { method: 'card', brand: 'Visa', last4: '4242', name_on_card: 'Alex Tester' })
  } finally { await srv.close() }
})

test('xbox-store: search finds the game for every common query and lists the real distractors', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    for (const q of ['gta 6', 'gta vi', 'GTA6', 'grand theft auto', 'grand theft auto vi']) {
      const r = await c.get(`/xbox-store/en-US/search/results?q=${encodeURIComponent(q)}`)
      assert.ok(r.text.includes(`href="${STD}"`), `"${q}" finds the Standard listing`)
      assert.ok(r.text.includes(`href="${ULT}"`), `"${q}" finds the Ultimate listing`)
    }
    const r = await c.get('/xbox-store/en-US/search/results?q=grand+theft+auto+vi')
    assert.match(r.text, /Grand Theft Auto Online/)
    assert.match(r.text, /Red Dead Redemption 2/)
    assert.match(r.text, /<s>\$49\.99<\/s> \$24\.99<sup>\+<\/sup> <b class="xb-discount">-50%/)
    const addons = await c.get('/xbox-store/en-US/search/results?q=grand+theft+auto+vi&type=add-ons')
    assert.match(addons.text, /Grand Theft Auto VI: Ultimate Edition Upgrade/)
    assert.match(addons.text, /\$20\.00/)
    assert.match(addons.text, /Vintage Vice City Pack/)
    const direct = await c.get(STD)
    assert.equal(direct.status, 200)
    // Listings without shared box art get their own text-only cover instead of a generic "OTHER GAME" image.
    assert.ok(r.text.includes('src="/xbox-store/art/9nfvz4qg6frw.svg"'), 'GTA V tile uses its own cover')
    const art = await c.get('/xbox-store/art/9pn4llbr8rch.svg')
    assert.equal(art.status, 200)
    assert.match(art.headers.get('content-type'), /^image\/svg\+xml/)
    assert.match(art.text, /ADD-ON[\s\S]*GTA VI[\s\S]*ULTIMATE/)
  } finally { await srv.close() }
})

test('xbox-store: invalid card re-renders the purchase dialog with errors and records nothing', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    await c.post(`${STD}/preorder`)
    const dialog = await signIn(c)
    assert.match(dialog.text, /Choose a way to pay/)
    const bad = await c.post(`${STD}/buy`, { ...CARD, cardNumber: '1234567890123456', zip: '' })
    assert.equal(bad.status, 400)
    assert.match(bad.text, /Enter a valid card number\./)
    assert.match(bad.text, /Enter a valid ZIP code\./)
    assert.match(bad.text, /value="Alex Tester"/, 'typed values are kept')
    assert.match(bad.text, /value="123 Ocean Dr"/)
    assert.doesNotMatch(bad.text, /4242424242424242|1234567890123456/, 'card number is never echoed')
    assert.deepEqual(await c.json('/api/orders?store=xbox-store'), [])
    // Skipping the payment screen is not possible either.
    const skip = await c.get(`${STD}/buy/confirm`)
    assert.match(skip.url, /\/buy$/)
  } finally { await srv.close() }
})

test('xbox-store: Microsoft account wall rejects unknown accounts and wrong passwords; Create an account signs the shopper in', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    const unknown = await c.post('/xbox-store/login.live.com/oauth20_authorize.srf', { loginfmt: 'nobody@example.com' })
    assert.equal(unknown.status, 400)
    assert.match(unknown.text, /That Microsoft account doesn&#39;t exist/)

    await c.post('/xbox-store/login.live.com/oauth20_authorize.srf', { loginfmt: 'tester@example.com' })
    const wrong = await c.post('/xbox-store/login.live.com/password.srf', { passwd: 'wrong' })
    assert.equal(wrong.status, 401)
    assert.match(wrong.text, /Your account or password is incorrect/)
    assert.match(wrong.text, /<label for="passwd">Password<\/label>/)

    // Signed out shopper presses PRE-ORDER, then takes "Create an account" on the wall and lands back in the dialog.
    const c2 = srv.client()
    const wall = await c2.post(`${STD}/preorder`)
    assert.match(wall.text, /New to Microsoft\? <a href="\/xbox-store\/signup\.live\.com\/signup">Create an account<\/a>/)
    const form = await c2.get('/xbox-store/signup.live.com/signup')
    for (const label of ['Email', 'Password', 'First name', 'Last name', 'Country/region', 'Birthdate']) assert.ok(form.text.includes(label), `signup shows "${label}"`)
    const weak = await c2.post('/xbox-store/signup.live.com/signup', { email: 'new@example.com', password: 'short', firstName: 'Sam', lastName: 'New', birthMonth: '5', birthDay: '9', birthYear: '1990' })
    assert.equal(weak.status, 400)
    assert.match(weak.text, /Passwords must have at least 8 characters/)
    const created = await c2.post('/xbox-store/signup.live.com/signup', { email: 'new@example.com', password: 'Newpass123', firstName: 'Sam', lastName: 'New', birthMonth: '5', birthDay: '9', birthYear: '1990' })
    assert.equal(created.url, `${srv.base}${STD}/buy`)
    assert.match(created.text, /Choose a way to pay/)
    const dup = await srv.client().post('/xbox-store/signup.live.com/signup', { email: 'new@example.com', password: 'Newpass123', firstName: 'Sam', lastName: 'New', birthMonth: '5', birthDay: '9', birthYear: '1990' })
    assert.equal(dup.status, 400)
    assert.match(dup.text, /Someone already has this email address/)

    // "Stay signed in?" -> "Don't show this again" skips the prompt the next time.
    const c3 = srv.client()
    await c3.post('/xbox-store/login.live.com/oauth20_authorize.srf', { loginfmt: 'tester@example.com' })
    await c3.post('/xbox-store/login.live.com/password.srf', { passwd: 'Password123!' })
    await c3.post('/xbox-store/login.live.com/kmsi.srf', { kmsi: 'no', dontshow: '1' })
    await c3.get('/xbox-store/signout')
    await c3.post(`${STD}/preorder`)
    await c3.post('/xbox-store/login.live.com/oauth20_authorize.srf', { loginfmt: 'tester@example.com' })
    const back = await c3.post('/xbox-store/login.live.com/password.srf', { passwd: 'Password123!' })
    assert.equal(back.url, `${srv.base}${STD}/buy`)
    assert.ok(!back.visited.some(v => v.url.includes('kmsi')), 'no "Stay signed in?" prompt')
  } finally { await srv.close() }
})

test('xbox-store: cart route ("..." -> Add to cart -> Cart -> Checkout -> Place order) records the Standard edition', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    const added = await c.post('/xbox-store/en-US/cart/add', { pid: '9p3h4968grsm' })
    assert.equal(added.url, `${srv.base}${STD}`, 'silent add returns to the product page')
    assert.match(added.text, /<details class="xb-overflow xb-menu-host" open>[\s\S]*?Open cart/, 'the "..." menu stays open and now reads "Open cart"')
    assert.match(added.text, /class="xb-badge">1</)
    const reload = await c.get(STD)
    assert.match(reload.text, /<details class="xb-overflow xb-menu-host" >/, 'menu is closed again on the next visit')
    await c.post('/xbox-store/en-US/cart/add', { pid: '9p3h4968grsm' })

    const cart = await c.get('/xbox-store/en-US/cart')
    assert.match(cart.text, /<h1>Cart<\/h1>/)
    assert.match(cart.text, /Keep shopping/)
    assert.match(cart.text, /Release date: 11\/18\/2026/)
    assert.match(cart.text, /<div>Digital<\/div>/)
    assert.match(cart.text, /Quantity: 1/)
    assert.match(cart.text, /Subtotal \(1 item\)<\/span><span>\$79\.99/, 'a digital licence is not added twice')
    assert.match(cart.text, /Before applicable taxes/)
    assert.match(cart.text, />Checkout<\/button>/)
    assert.match(cart.text, /Cart: \d{10}/)

    const wall = await c.post('/xbox-store/en-US/cart/checkout')
    assert.match(wall.url, /login\.live\.com\/oauth20_authorize\.srf/)
    const checkout = await signIn(c)
    assert.equal(checkout.url, `${srv.base}/xbox-store/en-US/checkout`)
    assert.match(checkout.text, /Step 1: Shipping/)
    assert.match(checkout.text, /Step 2: Payment/)
    assert.match(checkout.text, /Add a promo code/)
    assert.match(checkout.text, /Order summary[\s\S]*Estimated tax<\/span><span>\$5\.60[\s\S]*Place order[\s\S]*Add a promo code/, 'totals, Place order and the promo box sit in the order summary')
    // Place order must be the form's default button, so pressing Enter in a payment field places the order.
    assert.equal(/<button type="submit" form="co-form"[^>]*>([^<]*)</.exec(checkout.text)?.[1], 'Place order')

    const promo = await c.post('/xbox-store/en-US/checkout', { action: 'promo', promo: 'FREEGTA' })
    assert.match(promo.text, /promo code isn&#39;t valid/)
    assert.deepEqual(await c.json('/api/orders?store=xbox-store'), [])

    const done = await c.post('/xbox-store/en-US/checkout', { action: 'place', ...CARD })
    assert.match(done.url, /\/en-US\/purchase\/complete\?order=\d{10}&token=/)
    assert.match(done.text, /Thanks for your purchase/)
    const [o] = await c.json('/api/orders?store=xbox-store')
    assert.deepEqual(o.items, [{ kind: 'game', platform: 'xbox', edition: 'standard', format: 'digital', qty: 1, unit_price: 79.99, title: 'Grand Theft Auto VI', sku: '9p3h4968grsm' }])
    assert.equal(o.customer.email, 'tester@example.com')
    assert.equal(o.fulfillment.method, 'digital')
    assert.deepEqual(o.payment, { method: 'card', brand: 'Visa', last4: '4242', name_on_card: 'Alex Tester' })
    assert.deepEqual(o.totals, { subtotal: 79.99, shipping: 0, tax: 5.6, total: 85.59 })
    assert.equal(o.meta.path, 'cart')

    const cartAfter = await c.get('/xbox-store/en-US/cart')
    assert.match(cartAfter.text, /Your cart is empty/)
  } finally { await srv.close() }
})
