import { Router } from 'express'
import { randomBytes, randomInt } from 'node:crypto'
import { recordOrder, getOrder, listOrders } from '../../lib/orders.js'
import { luhn, cardBrand, last4 } from '../../lib/payment.js'
import { authenticate, findAccount, createAccount, publicAccount } from '../../lib/accounts.js'
import { byAsin, productPath, signinPath, search, cartLines, checkoutLines, totals, DELIVERY, STATES } from './data.js'
import * as P from './pages.js'

const NAME = 'Amazon'
const router = Router()

// Checkout step URLs (Amazon's legacy step handlers, minus the /handlers/display.html suffix).
const STEP = { address: '/gp/buy/addressselect', pay: '/gp/buy/payselect', spc: '/gp/buy/spc' }
// The checkout sign-in wall (research: openid.assoc_handle=amazon_checkout_us, return_to = checkout).
const checkoutWall = (step) => signinPath(STEP[step], 'amazon_checkout_us')

// ---- helpers ----
function render(req, res, title, body, { status = 200, chrome = 'full', ewc = false, subnav = false, q = '' } = {}) {
  const lines = cartLines(req.store)
  const cartCount = lines.reduce((n, l) => n + l.qty, 0)
  // The "everywhere cart" right rail (search + product pages). "Added to cart" shows once, right after an add.
  const added = req.store.flash === 'added'
  req.store.flash = null
  const panel = ewc ? { lines, added, ret: req.originalUrl.slice(res.locals.base.length) || '/' } : null
  const checkoutCount = checkoutLines(req.store).reduce((n, l) => n + l.qty, 0)
  // "Hello, sign in" returns the shopper to the page they were on, as Amazon's openid.return_to does.
  const here = req.method === 'GET' ? (req.originalUrl.slice(res.locals.base.length) || '/') : '/'
  res.status(status).type('html').send(P.layout({ base: res.locals.base, title, body, cartCount, user: req.store.user, chrome, ewc: panel, subnav, q, checkoutCount, here }))
}
// Amazon order numbers are 3-7-7 digits, e.g. 113-1234567-1234567.
function orderNumber() { return `113-${String(randomInt(0, 1e7)).padStart(7, '0')}-${String(randomInt(0, 1e7)).padStart(7, '0')}` }
const clampQty = (v) => Math.min(5, Math.max(1, Number.parseInt(v, 10) || 1))
// Only a same-store path may be used as a post-action return target.
const safeRet = (ret) => (/^\/(?!\/)/.test(String(ret ?? '')) ? String(ret) : null)
const inCartMap = (store) => Object.fromEntries(store.cart.map(l => [l.asin, l.qty]))
function addToCart(store, asin, qty) {
  const line = store.cart.find(l => l.asin === asin)
  if (line) line.qty = Math.min(5, line.qty + qty) // Amazon bumps the quantity of an ASIN already in the cart
  else store.cart.push({ asin, qty })
}
function notFound(req, res) {
  render(req, res, 'Page Not Found', P.simplePage({ title: "Sorry! We couldn't find that page.", html: `<p>Try searching or <a href="${res.locals.base}/">go to Amazon's home page</a>.</p>` }), { status: 404 })
}

// ---- browse ----
router.get('/', (req, res) => render(req, res, 'Amazon.com. Spend less. Smile more.', P.homePage({ base: res.locals.base })))

router.get('/s', (req, res) => {
  const q = String(req.query.k ?? '').trim()
  const dept = String(req.query.i ?? ''), sort = String(req.query.s ?? '')
  if (!q) return res.redirect(`${res.locals.base}/`)
  // The header form always sends the department; "All" has no value, so drop it to keep Amazon's /s?k={q} URL.
  if ('i' in req.query && !dept) return res.redirect(`${res.locals.base}/s?k=${encodeURIComponent(q).replaceAll('%20', '+')}${sort ? `&s=${encodeURIComponent(sort)}` : ''}`)
  render(req, res, `Amazon.com : ${q}`, P.searchPage({ base: res.locals.base, q, dept, sort, results: search(q, dept, sort), inCart: inCartMap(req.store) }), { ewc: true, q })
})

function productHandler(req, res) {
  const p = byAsin(req.params.asin)
  if (!p) return notFound(req, res)
  const bundle = p.kind === 'game' ? [byAsin('B0H4ZELDOT'), byAsin('B0H4METRAV')] : []
  render(req, res, `Amazon.com: ${p.title} : ${p.kind === 'game' ? 'Everything Else' : 'Video Games'}`, P.productPage({ base: res.locals.base, p, inCart: inCartMap(req.store), listAdded: req.query.added_to_list === '1', bundle }), { ewc: true, subnav: true })
}
router.get('/dp/:asin', productHandler)
router.get('/gp/product/:asin', productHandler)
router.get('/:slug/dp/:asin', productHandler)

router.get('/tradein', (req, res) => render(req, res, 'Amazon Trade-In', P.simplePage({ title: 'Amazon Trade-In', html: '<p>Trade in your eligible games, consoles and devices for an Amazon.com Gift Card. Get an instant offer, ship it for free and get paid once we receive it.</p>' })))

// ---- cart ----
// Search-tile "Add to cart" (and the PDP bundle button) add in place: the shopper is sent back to the
// page they were on, where the tile shows "N in cart" and the right-rail cart panel fills in.
router.post('/cart/add', (req, res) => {
  const asins = [].concat(req.body.asin ?? []).map(a => String(a).toUpperCase())
  const qty = clampQty(req.body.quantity)
  let added = 0
  for (const a of asins) if (byAsin(a)) { addToCart(req.store, a, qty); added++ }
  if (added) req.store.flash = 'added'
  res.redirect(`${res.locals.base}${safeRet(req.body.ret) ?? '/cart'}`)
})

function cartHandler(req, res) {
  const saved = (req.store.saved ?? []).map(l => ({ ...l, product: byAsin(l.asin) })).filter(l => l.product)
  render(req, res, 'Amazon.com Shopping Cart', P.cartPage({ base: res.locals.base, t: totals(cartLines(req.store)), saved, user: req.store.user }))
}
router.get('/cart', cartHandler)
router.get('/gp/cart/view.html', cartHandler)

// The cart and the right-rail panel use a quantity stepper (research: trash at 1, "-", count, "+"), capped at 5.
router.post('/cart/update', (req, res) => {
  const asin = String(req.body.asin ?? '').toUpperCase()
  const action = req.body.action || 'update'
  req.store.saved ??= []
  const line = req.store.cart.find(l => l.asin === asin)
  if (action === 'delete' || (action === 'dec' && line?.qty === 1)) req.store.cart = req.store.cart.filter(l => l.asin !== asin)
  else if (action === 'dec' && line) line.qty -= 1
  else if (action === 'inc' && line) line.qty = Math.min(5, line.qty + 1)
  else if (action === 'save' && line) { req.store.cart = req.store.cart.filter(l => l.asin !== asin); req.store.saved.push({ asin, qty: line.qty }) }
  else if (action === 'move') { const s = req.store.saved.find(l => l.asin === asin); if (s) { req.store.saved = req.store.saved.filter(l => l.asin !== asin); addToCart(req.store, asin, s.qty) } }
  else if (action === 'delete-saved') req.store.saved = req.store.saved.filter(l => l.asin !== asin)
  else if (line && req.body.quantity !== undefined) line.qty = clampQty(req.body.quantity)
  res.redirect(`${res.locals.base}${safeRet(req.body.ret) ?? '/cart'}`)
})

// ---- checkout entry (account wall: no guest checkout) ----
function toCheckout(req, res) {
  if (!req.store.user) return res.redirect(`${res.locals.base}${checkoutWall('address')}`)
  res.redirect(`${res.locals.base}${STEP.address}`)
}
// Cart "Proceed to checkout": checks out the cart.
function enterCheckout(req, res) {
  if (!req.store.cart.length) return res.redirect(`${res.locals.base}/cart`)
  req.store.checkout.buyNow = null
  req.store.checkout.gift = req.body?.gift === '1'
  toCheckout(req, res)
}
router.post('/gp/cart/desktop/go-to-checkout.html', enterCheckout)
router.get('/gp/cart/desktop/go-to-checkout.html', enterCheckout)

// Product-page buy box (form#addToCart → /gp/product/handle-buy-box). For the pre-order the only button
// is "Pre-order now", which is Amazon's Buy Now: it goes straight to checkout entry with just that item.
router.post('/gp/product/handle-buy-box', (req, res) => {
  const base = res.locals.base
  const p = byAsin(req.body.ASIN)
  if (!p) return res.redirect(`${base}/`)
  const qty = clampQty(req.body.quantity)
  if (req.body['submit.add-to-cart'] !== undefined) {
    addToCart(req.store, p.asin, qty)
    req.store.flash = 'added'
    return res.redirect(`${base}${safeRet(req.body.ret) ?? productPath('', p)}`)
  }
  res.redirect(`${base}/checkout/entry/buynow?ASIN=${encodeURIComponent(p.asin)}&quantity=${qty}&isBuyNow=1`)
})
router.get('/checkout/entry/buynow', (req, res) => {
  const p = byAsin(req.query.ASIN)
  if (!p) return res.redirect(`${res.locals.base}/`)
  req.store.checkout.buyNow = { asin: p.asin, qty: clampQty(req.query.quantity) }
  req.store.checkout.gift = false
  toCheckout(req, res)
})

// "Add to List" needs an account too (research quirk 2).
router.post('/hz/wishlist/add', (req, res) => {
  const p = byAsin(req.body.asin)
  if (!p) return res.redirect(`${res.locals.base}/`)
  if (!req.store.user) return res.redirect(`${res.locals.base}${signinPath(productPath('', p))}`)
  res.redirect(`${productPath(res.locals.base, p)}?added_to_list=1`)
})

// ---- auth: unified "Sign in or create account" flow ----
// The page to land on after signing in travels in openid.return_to (as on amazon.com) and is kept in
// req.store.signin until the password or create-account step succeeds.
function finishSignin(req, res, acct) {
  req.store.user = publicAccount(acct)
  const ret = safeRet(req.store.signin?.returnTo)
  req.store.signin = null
  res.redirect(`${res.locals.base}${ret ?? '/'}`)
}
const looksLikeEmail = (s) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s)
const looksLikePhone = (s) => /^\+?[\d\s().-]{7,}$/.test(s)
// "Change" / "Sign in" links on the later screens go back to the first screen with the same return_to.
const restartPath = (req) => signinPath(req.store.signin?.returnTo ?? '/')

// "Sign in or create account": one field, then the password screen (known email) or the create-account screen.
function signinStart(req, res) {
  req.store.signin = { email: req.store.signin?.email ?? '', returnTo: safeRet(req.query['openid.return_to']) }
  render(req, res, 'Amazon Sign-In', P.signinEmailPage({ base: res.locals.base, email: req.store.signin.email }), { chrome: 'auth' })
}
router.get('/ap/signin', signinStart)
router.post('/ax/claim', (req, res) => {
  const base = res.locals.base
  const email = String(req.body.email ?? '').trim()
  let error = ''
  if (!email) error = 'Enter your mobile number or email'
  else if (!looksLikeEmail(email) && !looksLikePhone(email)) error = email.includes('@') ? 'Invalid email address' : 'Invalid mobile number'
  if (error) return render(req, res, 'Amazon Sign-In', P.signinEmailPage({ base, email, error }), { chrome: 'auth', status: 400 })
  const known = !!findAccount(req.storeSlug, email)
  req.store.signin = { returnTo: req.store.signin?.returnTo ?? null, email, isNew: !known }
  // Existing account → password screen; unknown email → create-account screen (email carried over).
  res.redirect(known ? `${base}/ap/signin/password` : `${base}/ap/register`)
})
router.get('/ap/signin/password', (req, res) => {
  if (!req.store.signin?.email) return res.redirect(`${res.locals.base}${restartPath(req)}`)
  render(req, res, 'Amazon Sign-In', P.signinPasswordPage({ base: res.locals.base, email: req.store.signin.email, changePath: restartPath(req) }), { chrome: 'auth' })
})
router.post('/ap/signin/password', (req, res) => {
  const email = req.store.signin?.email
  if (!email) return res.redirect(`${res.locals.base}${restartPath(req)}`)
  const acct = authenticate(req.storeSlug, email, req.body.password)
  if (!acct) return render(req, res, 'Amazon Sign-In', P.signinPasswordPage({ base: res.locals.base, email, changePath: restartPath(req), error: 'Your password is incorrect' }), { chrome: 'auth', status: 401 })
  finishSignin(req, res, acct)
})

// Research: /ap/register shows the same "Sign in or create account" screen; the create-account form only
// appears once an email that has no account has been entered there.
router.get('/ap/register', (req, res) => {
  if (!req.store.signin?.isNew) return signinStart(req, res)
  render(req, res, 'Amazon Registration', P.registerPage({ base: res.locals.base, values: { email: req.store.signin.email }, signinPath: restartPath(req) }), { chrome: 'auth' })
})
// ASSUMPTION: real Amazon then asks for a one-time code emailed to the new address ("Verify email address").
// The clone cannot deliver email, so the account is created and signed in as soon as this form is valid.
router.post('/ap/register', (req, res) => {
  const v = req.body, errors = {}
  const name = String(v.customerName ?? '').trim(), email = String(v.email ?? '').trim()
  const password = String(v.password ?? ''), check = String(v.passwordCheck ?? '')
  if (!name) errors.customerName = 'Enter your name'
  if (!email) errors.email = 'Enter your email or mobile phone number'
  else if (!looksLikeEmail(email) && !looksLikePhone(email)) errors.email = 'Wrong or Invalid email address or mobile phone number. Please correct and try again.'
  if (!password) errors.password = 'Enter your password'
  else if (password.length < 6) errors.password = 'Passwords must be at least 6 characters.'
  if (password && password !== check) errors.passwordCheck = 'Passwords must match'
  if (!Object.keys(errors).length) {
    const [first_name, ...rest] = name.split(/\s+/)
    const acct = createAccount(req.storeSlug, { email, password, first_name, last_name: rest.join(' '), phone: '' })
    if (acct.error) errors.email = `You indicated you're a new customer, but an account already exists with the email ${email}.`
    else return finishSignin(req, res, acct)
  }
  render(req, res, 'Amazon Registration', P.registerPage({ base: res.locals.base, values: { customerName: name, email }, errors, signinPath: restartPath(req) }), { chrome: 'auth', status: 400 })
})

router.get('/gp/flex/sign-out.html', (req, res) => { req.store.user = null; req.store.checkout = {}; req.store.signin = null; res.redirect(`${res.locals.base}/`) })

router.get('/gp/css/order-history', (req, res) => {
  if (!req.store.user) return res.redirect(`${res.locals.base}${signinPath('/gp/css/order-history')}`)
  const orders = listOrders({ store: req.storeSlug }).filter(o => o.customer.email === req.store.user.email).reverse()
  render(req, res, 'Your Orders', P.ordersPage({ base: res.locals.base, user: req.store.user, orders }))
})

// ---- checkout steps: address → payment → review ----
// Each step needs items to check out, a signed-in shopper, and the earlier steps completed.
function gate(req, res, step) {
  const base = res.locals.base, co = req.store.checkout
  if (!checkoutLines(req.store).length) { res.redirect(`${base}/cart`); return false }
  if (!req.store.user) { res.redirect(`${base}${checkoutWall(step)}`); return false }
  if (step !== 'address' && !co.address) { res.redirect(`${base}${STEP.address}`); return false }
  if (step === 'spc' && !co.payment) { res.redirect(`${base}${STEP.pay}`); return false }
  return true
}
const coTotals = (req) => totals(checkoutLines(req.store), req.store.checkout.delivery ?? 'standard')

router.get(STEP.address, (req, res) => {
  if (!gate(req, res, 'address')) return
  const a = req.store.checkout.address, u = req.store.user
  const values = a
    ? { countryCode: 'US', fullName: a.full_name, phoneNumber: a.phone, addressLine1: a.line1, addressLine2: a.line2 ?? '', city: a.city, state: a.state, postalCode: a.postal_code, deliveryInstructions: a.instructions ?? '', isDefault: a.is_default }
    : { countryCode: 'US', fullName: `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim(), phoneNumber: u.phone ?? '' }
  render(req, res, 'Select a delivery address - Amazon.com Checkout', P.addressPage({ base: res.locals.base, t: coTotals(req), values }), { chrome: 'checkout' })
})
router.post(STEP.address, (req, res) => {
  if (!gate(req, res, 'address')) return
  const v = req.body, errors = {}
  const s = (k) => String(v[k] ?? '').trim()
  // ASSUMPTION: Amazon's inline address-form messages were not captured; these follow its "Please enter ..." style.
  if (!s('fullName')) errors.fullName = 'Please enter a name.'
  if (!s('phoneNumber')) errors.phoneNumber = 'Please enter a phone number.'
  else if (s('phoneNumber').replace(/\D/g, '').length < 10) errors.phoneNumber = 'Please enter a valid phone number.'
  if (!s('addressLine1')) errors.addressLine1 = 'Please enter an address.'
  if (!s('city')) errors.city = 'Please enter a city name.'
  if (!STATES.includes(s('state'))) errors.state = 'Please select a state/province/region.'
  if (!s('postalCode')) errors.postalCode = 'Please enter a ZIP or postal code.'
  else if (!/^\d{5}(-\d{4})?$/.test(s('postalCode'))) errors.postalCode = 'Please enter a valid ZIP or postal code.'
  if (Object.keys(errors).length) {
    return render(req, res, 'Select a delivery address - Amazon.com Checkout', P.addressPage({ base: res.locals.base, t: coTotals(req), values: { ...v, isDefault: v.isDefault === '1' }, errors }), { chrome: 'checkout', status: 400 })
  }
  req.store.checkout.address = { full_name: s('fullName'), phone: s('phoneNumber'), line1: s('addressLine1'), line2: s('addressLine2') || null, city: s('city'), state: s('state'), postal_code: s('postalCode'), country: 'US', instructions: s('deliveryInstructions') || null, is_default: v.isDefault === '1' }
  res.redirect(`${res.locals.base}${STEP.pay}`)
})

function renderPayment(req, res, { values = {}, errors = {}, status = 200 } = {}) {
  const promoError = req.store.checkout.promoError ?? ''
  req.store.checkout.promoError = null
  render(req, res, 'Select a payment method - Amazon.com Checkout', P.paymentPage({ base: res.locals.base, t: coTotals(req), address: req.store.checkout.address, values, errors, promoError }), { chrome: 'checkout', status })
}
router.get(STEP.pay, (req, res) => {
  if (!gate(req, res, 'pay')) return
  const p = req.store.checkout.payment
  renderPayment(req, res, { values: p ? { nameOnCard: p.name_on_card, expMonth: p.expiration.slice(0, 2), expYear: p.expiration.slice(3) } : { nameOnCard: req.store.checkout.address.full_name } })
})
router.post(STEP.pay, (req, res) => {
  if (!gate(req, res, 'pay')) return
  const v = req.body, errors = {}
  const number = String(v.cardNumber ?? '').replace(/[\s-]/g, ''), name = String(v.nameOnCard ?? '').trim()
  const month = String(v.expMonth ?? '').padStart(2, '0'), year = Number(v.expYear)
  // ASSUMPTION: Amazon's add-card form has no CVV field for Visa/Mastercard/Amex/Discover (research: CVV is only
  // mandatory for the Amazon Store Card), so the number, name and expiry are validated directly.
  if (!number) errors.cardNumber = 'Please enter a card number.'
  else if (!luhn(number)) errors.cardNumber = 'Please enter a valid card number.'
  if (!name) errors.nameOnCard = 'Please enter the name on the card.'
  const m = Number(month), now = new Date()
  if (!(m >= 1 && m <= 12) || !Number.isFinite(year)) errors.expiration = 'Please select an expiration date.'
  else if (year < now.getFullYear() || (year === now.getFullYear() && m < now.getMonth() + 1)) errors.expiration = 'This card has expired. Please enter a valid expiration date.'
  if (Object.keys(errors).length) return renderPayment(req, res, { values: { nameOnCard: name, expMonth: month, expYear: String(v.expYear ?? '') }, errors, status: 400 })
  req.store.checkout.payment = { method: 'card', brand: cardBrand(number), last4: last4(number), name_on_card: name, expiration: `${month}/${year}` }
  res.redirect(`${res.locals.base}${STEP.spc}`)
})
router.post(`${STEP.pay}/promo`, (req, res) => {
  if (!gate(req, res, 'pay')) return
  const code = String(req.body.code ?? '').trim()
  req.store.checkout.promoError = code ? 'The promotional code you entered is not valid.' : 'Please enter a gift card, voucher or promotional code.'
  res.redirect(`${res.locals.base}${STEP.pay}`)
})

router.get(STEP.spc, (req, res) => {
  if (!gate(req, res, 'spc')) return
  const co = req.store.checkout
  render(req, res, 'Place Your Order - Amazon.com Checkout', P.reviewPage({ base: res.locals.base, t: coTotals(req), address: co.address, payment: co.payment, delivery: co.delivery ?? 'standard' }), { chrome: 'checkout' })
})
router.post(STEP.spc, (req, res) => {
  if (!gate(req, res, 'spc')) return
  const base = res.locals.base, co = req.store.checkout
  // Quantity dropdowns and delivery radios on the review page post back to this same handler.
  for (const l of checkoutLines(req.store)) {
    const q = req.body[`quantity_${l.asin}`]
    if (q === undefined) continue
    if (co.buyNow) co.buyNow.qty = clampQty(q)
    else { const line = req.store.cart.find(c => c.asin === l.asin); if (line) line.qty = clampQty(q) }
  }
  if (DELIVERY[req.body.delivery]) co.delivery = req.body.delivery
  if (req.body.action !== 'place') return res.redirect(`${base}${STEP.spc}`)

  const delivery = co.delivery ?? 'standard'
  const t = totals(checkoutLines(req.store), delivery)
  const a = co.address, u = req.store.user
  const [first_name, ...rest] = a.full_name.split(/\s+/)
  const address = { first_name, last_name: rest.join(' '), line1: a.line1, line2: a.line2, city: a.city, state: a.state, postal_code: a.postal_code, country: 'US', phone: a.phone }
  const token = randomBytes(12).toString('hex')
  const order = recordOrder({
    store: req.storeSlug,
    order_number: orderNumber(),
    session: req.session,
    items: t.lines.map(l => l.product.kind === 'game'
      ? { platform: l.product.platform, edition: l.product.edition, format: l.product.format, qty: l.qty, unit_price: l.product.price, title: l.product.title, sku: l.product.asin }
      : { kind: 'other', title: l.product.title, qty: l.qty, unit_price: l.product.price, sku: l.product.asin }),
    customer: { email: u.email, first_name: u.first_name, last_name: u.last_name, phone: a.phone, account_id: u.id, guest: false },
    fulfillment: { method: 'ship', option: delivery, eta: DELIVERY[delivery].date },
    shipping_address: address,
    billing_address: address,
    payment: co.payment,
    totals: { subtotal: t.subtotal, shipping: t.shipping, tax: t.tax, total: t.total },
    currency: 'USD',
    meta: { token, buy_now: !!co.buyNow, gift: !!co.gift, delivery_instructions: a.instructions },
  })
  // Buy Now never touched the cart; a cart checkout empties it.
  if (!co.buyNow) req.store.cart = []
  req.store.checkout = {}
  res.redirect(`${base}/gp/buy/thankyou?purchaseId=${encodeURIComponent(order.order_number)}&token=${token}`)
})

router.get('/gp/buy/thankyou', (req, res) => {
  const order = getOrder(String(req.query.purchaseId ?? ''))
  if (!order || order.store !== req.storeSlug || order.meta.token !== req.query.token) return notFound(req, res)
  render(req, res, 'Amazon.com Thanks You', P.thankYouPage({ base: res.locals.base, order }))
})

router.use((req, res) => notFound(req, res))

export default {
  slug: 'amazon',
  name: NAME,
  country: 'US',
  currency: 'USD',
  description: 'US. Code-in-box PS5/Xbox, $79.99 Standard only, no guest checkout, Buy Now from the product page, 3-step checkout.',
  router,
}
