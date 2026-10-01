import { Router } from 'express'
import { randomBytes, randomInt, randomUUID } from 'node:crypto'
import { recordOrder, getOrder, listOrders } from '../../lib/orders.js'
import { validateCard } from '../../lib/payment.js'
import { authenticate, createAccount, findAccount, publicAccount } from '../../lib/accounts.js'
import { PRODUCTS, byId, productPath, search, totals, STATES, ARRIVAL, WALMART_PLUS } from './data.js'
import * as P from './pages.js'

const NAME = 'Walmart'
const router = Router()

// ---- helpers ----
function render(req, res, { title, body, variant = 'store', status = 200, q = '' }) {
  res.status(status).type('html').send(P.layout({ base: res.locals.base, title, body, t: totals(req.store), user: req.store.user, variant, q }))
}
function notFound(req, res) {
  return render(req, res, { title: 'Page not found - Walmart.com', status: 404, body: P.simplePage({ title: 'This page could not be found', html: `<p>The item may have been removed or the link is wrong.</p><a class="wm-pill" href="${res.locals.base}/">Go to Walmart.com</a>` }) })
}
// ASSUMPTION: no real Walmart order number was observed. research/walmart.md gives the current shape as 7 digits,
// a hyphen, 8 digits (e.g. 2000123-45678901); walmart.json's later pass leans to 13 plain digits. Both are low
// confidence; this keeps the hyphenated form, printed on /thankyou as "Order# ...".
function orderNumber() { return `200${String(randomInt(0, 10000)).padStart(4, '0')}-${String(randomInt(0, 1e8)).padStart(8, '0')}` }
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
const digits = s => String(s ?? '').replace(/\D/g, '')
// The identity gate's return path (state=...) must be a relative path on this store, never an external URL.
const safeState = s => (typeof s === 'string' && /^\/(?![/\\])/.test(s) ? s : null)
const gateUrl = (base, state, tp) => `${base}/account/login?state=${encodeURIComponent(state)}&tp=${tp}`
function cartId(store) { store.checkout.cartId ??= randomUUID(); return store.checkout.cartId }
const reviewUrl = (base, store, extra = '') => `${base}/checkout/review-order?cartId=${cartId(store)}${extra}`

function addToCart(store, p) {
  let line = store.cart.find(l => l.pid === p.id)
  if (line) line.qty = Math.min(line.qty + 1, 10)
  else { line = { pid: p.id, qty: 1 }; store.cart.push(line) }
  return line
}
const savedProducts = store => (store.saved ?? []).map(byId).filter(Boolean)

// ---- browse ----
router.get('/', (req, res) => render(req, res, { title: 'Walmart.com | Save Money. Live better.', body: P.homePage({ base: res.locals.base, products: PRODUCTS }) }))

router.get('/search', (req, res) => {
  const q = String(req.query.q ?? '')
  render(req, res, { title: `${q} - Walmart.com`, q, body: P.searchPage({ base: res.locals.base, q, products: search(q) }) })
})

router.get('/ip/:slug/:id', (req, res) => {
  const p = byId(req.params.id)
  if (!p) return notFound(req, res)
  const similar = PRODUCTS.filter(x => x.id !== p.id && !x.sponsored)
  const sponsored = PRODUCTS.find(x => x.sponsored && x.id !== p.id) ?? null
  render(req, res, { title: `${p.title} - Walmart.com`, body: P.productPage({ base: res.locals.base, p, similar, sponsored }) })
})
// Short product URL, as an agent might type it.
router.get('/ip/:id', (req, res) => {
  const p = byId(req.params.id)
  if (!p) return notFound(req, res)
  res.redirect(productPath(res.locals.base, p))
})

// ---- cart ----
// "Preorder" / "Add to cart" hard-redirects to the "Added to cart!" interstitial (/pac), never a modal.
router.post('/cart/add', (req, res) => {
  const base = res.locals.base
  const p = byId(req.body.pid)
  if (!p) return res.redirect(`${base}/`)
  const line = addToCart(req.store, p)
  if (req.body.plus === '1') req.store.checkout.plus = { opted: true, decided: false, plan: null }
  res.redirect(`${base}/pac?id=${p.id}&ip=${p.price}&qt=${line.qty}&g=FC`)
})

router.get('/pac', (req, res) => {
  const base = res.locals.base
  const p = byId(req.query.id)
  const line = p && req.store.cart.find(l => l.pid === p.id)
  if (!line) return res.redirect(`${base}/cart`)
  const recommendations = PRODUCTS.filter(x => x.id !== p.id && x.kind !== 'game')
  render(req, res, { title: 'Added to cart | Relevant recommendations', body: P.addedPage({ base, p, qty: line.qty, t: totals(req.store), recommendations }) })
})

router.get('/cart', (req, res) => {
  const base = res.locals.base
  // Return trip from the identity gate (state=/cart?checkout=true): go straight on to checkout.
  if (req.query.checkout === 'true' && req.store.cart.length) {
    if (req.store.user) return res.redirect(reviewUrl(base, req.store))
    return res.redirect(gateUrl(base, '/cart?checkout=true', 'CXO'))
  }
  render(req, res, { title: 'Cart - Walmart.com', body: P.cartPage({ base, t: totals(req.store), saved: savedProducts(req.store), user: req.store.user, flags: { plus: !!req.store.checkout.plus?.opted, gift: !!req.store.checkout.gift } }) })
})

router.post('/cart/update', (req, res) => {
  const base = res.locals.base
  const store = req.store
  const pid = String(req.body.pid ?? '')
  const action = String(req.body.action ?? '')
  const line = store.cart.find(l => l.pid === pid)
  store.saved ??= []
  if (action === 'inc' && line) line.qty = Math.min(line.qty + 1, 10)
  else if (action === 'dec' && line) { if (line.qty > 1) line.qty -= 1; else store.cart = store.cart.filter(l => l !== line) }
  else if (action === 'remove') store.cart = store.cart.filter(l => l.pid !== pid)
  else if (action === 'save' && line) { store.cart = store.cart.filter(l => l.pid !== pid); if (!store.saved.includes(pid)) store.saved.push(pid) }
  else if (action === 'move' && byId(pid)) { store.saved = store.saved.filter(id => id !== pid); addToCart(store, byId(pid)) }
  else if (action === 'forget') store.saved = store.saved.filter(id => id !== pid)
  const next = typeof req.body.next === 'string' && req.body.next.startsWith(`${base}/`) ? req.body.next : `${base}/cart`
  res.redirect(next)
})

// "Continue to checkout": remembers the Walmart+ / gift boxes, then the identity gate (no guest option) or checkout.
router.post('/cart/checkout', (req, res) => {
  const base = res.locals.base
  if (!req.store.cart.length) return res.redirect(`${base}/cart`)
  const c = req.store.checkout
  if (req.body.plus === '1') { if (!c.plus?.opted) c.plus = { opted: true, decided: false, plan: null } }
  else c.plus = { opted: false, decided: false, plan: null }
  c.gift = req.body.gift === '1'
  if (req.store.user) return res.redirect(reviewUrl(base, req.store))
  res.redirect(gateUrl(base, '/cart?checkout=true', 'CXO'))
})

// ---- identity gate (identity.walmart.com/account/login) ----
router.get('/account/login', (req, res) => {
  const state = safeState(req.query.state)
  render(req, res, { title: 'Login | Walmart', variant: 'identity', body: P.loginPage({ base: res.locals.base, state }) })
})
router.post('/account/login', (req, res) => {
  const base = res.locals.base
  const state = safeState(req.query.state)
  const id = String(req.body.identifier ?? '').trim()
  const isEmail = EMAIL_RE.test(id)
  const isPhone = !isEmail && digits(id).length === 10 && !/[a-z@]/i.test(id)
  if (!isEmail && !isPhone) return render(req, res, { title: 'Login | Walmart', variant: 'identity', status: 400, body: P.loginPage({ base, state, identifier: id, error: 'Please enter a valid phone number or email' }) })
  req.store.auth = { identifier: isEmail ? id.toLowerCase() : id, isEmail, state }
  // ASSUMPTION: lib/accounts.js keys accounts by email, so a phone number is never "recognized" and goes to sign-up.
  if (isEmail && findAccount(req.storeSlug, id)) return res.redirect(`${base}/account/signin/withpassword`)
  res.redirect(`${base}/account/sign-up`)
})

function finishAuth(req, res, acct) {
  req.store.user = publicAccount(acct)
  const state = req.store.auth?.state ?? null
  req.store.auth = null
  res.redirect(`${res.locals.base}${state ?? '/account'}`)
}

router.get('/account/signin/withpassword', (req, res) => {
  const a = req.store.auth
  if (!a?.identifier) return res.redirect(`${res.locals.base}/account/login`)
  render(req, res, { title: 'Login | Walmart', variant: 'identity', body: P.passwordPage({ base: res.locals.base, identifier: a.identifier, isEmail: a.isEmail, state: a.state }) })
})
router.post('/account/signin/withpassword', (req, res) => {
  const a = req.store.auth
  if (!a?.identifier) return res.redirect(`${res.locals.base}/account/login`)
  const acct = authenticate(req.storeSlug, a.identifier, req.body.password)
  if (!acct) return render(req, res, { title: 'Login | Walmart', variant: 'identity', status: 401, body: P.passwordPage({ base: res.locals.base, identifier: a.identifier, isEmail: a.isEmail, state: a.state, error: "Your email address and password don't match. Please try again or reset your password." }) })
  finishAuth(req, res, acct)
})

router.get('/account/sign-up', (req, res) => {
  const a = req.store.auth ?? {}
  const values = a.isEmail ? { email: a.identifier } : a.identifier ? { phone: a.identifier } : {}
  render(req, res, { title: 'Create your Walmart account | Walmart', variant: 'identity', body: P.signupPage({ base: res.locals.base, values, state: a.state }) })
})
router.post('/account/sign-up', (req, res) => {
  const v = req.body, errors = {}
  const need = (k, msg) => { if (!String(v[k] ?? '').trim()) errors[k] = msg }
  need('firstName', 'First name is required.'); need('lastName', 'Last name is required.'); need('email', 'Email address is required.'); need('phone', 'Phone number is required.'); need('password', 'Password is required.')
  if (v.email && !EMAIL_RE.test(String(v.email).trim())) errors.email = 'Please enter a valid email address.'
  if (v.phone && digits(v.phone).length !== 10) errors.phone = 'Please enter a valid 10-digit phone number.'
  const pw = String(v.password ?? '')
  if (pw && !(pw.length >= 8 && pw.length <= 100 && /[a-z]/.test(pw) && /[A-Z]/.test(pw) && /[^a-zA-Z]/.test(pw))) errors.password = 'Your password must include the following: 8-100 characters, upper & lowercase letters, at least one number or special character.'
  if (!Object.keys(errors).length) {
    const acct = createAccount(req.storeSlug, { email: String(v.email).trim(), password: pw, first_name: v.firstName.trim(), last_name: v.lastName.trim(), phone: digits(v.phone), marketing: v.marketing === '1' })
    if (acct.error) errors.email = acct.error
    // ASSUMPTION: the real flow follows "Create account" with a 6-digit SMS code ("Verify number"). No SMS can be
    // sent here, so the new number counts as verified and the shopper lands where the gate was going to send them.
    else return finishAuth(req, res, acct)
  }
  render(req, res, { title: 'Create your Walmart account | Walmart', variant: 'identity', status: 400, body: P.signupPage({ base: res.locals.base, values: { ...v, password: '', marketing: v.marketing === '1' }, errors, state: req.store.auth?.state ?? null }) })
})

router.get('/account', (req, res) => {
  if (!req.store.user) return res.redirect(gateUrl(res.locals.base, '/account', 'MyAccount'))
  const orders = listOrders({ store: req.storeSlug }).filter(o => o.customer.account_id === req.store.user.id)
  render(req, res, { title: 'Account - Walmart.com', body: P.accountPage({ base: res.locals.base, user: req.store.user, orders }) })
})
router.get('/account/logout', (req, res) => { req.store.user = null; req.store.checkout = {}; req.store.auth = null; res.redirect(`${res.locals.base}/`) })

// ---- checkout (/checkout/review-order): one page of cards that save one at a time ----
function checkoutGuard(req, res) {
  const base = res.locals.base
  if (!req.store.cart.length) { res.redirect(`${base}/?reason=invalidCartIdOrPcId`); return false }
  if (!req.store.user) { res.redirect(gateUrl(base, `/checkout/review-order?cartId=${cartId(req.store)}`, 'AuthMiddlewareCsr')); return false }
  const c = req.store.checkout
  c.plus ??= { opted: false, decided: false, plan: null }
  // Contact is pre-filled from the account, so the shopper normally only sees "Edit Contact".
  c.contact ??= { email: req.store.user.email, phone: digits(req.store.user.phone), textUpdates: true, marketing: false }
  return true
}
// Step order from the checkout app's state machine: shipping address -> payment -> contact -> (Walmart+ plan) -> review.
function remainingSteps(c) {
  const steps = []
  if (!c.address) steps.push('address')
  if (!c.payment) steps.push('payment')
  if (!c.contact) steps.push('contact')
  if (c.plus?.opted && !c.plus.decided) steps.push('plus')
  return steps
}
const coTotals = (store) => totals(store, { taxed: !!store.checkout.address, trial: !!(store.checkout.plus?.decided && store.checkout.plus.plan) })

function defaultValues(req, open) {
  const u = req.store.user, c = req.store.checkout
  if (open === 'address') return c.address ?? { firstName: u.first_name, lastName: u.last_name, phone: digits(u.phone) }
  if (open === 'payment') {
    const p = c.payment
    if (p?.method === 'card') return { firstName: p.firstName, lastName: p.lastName, phone: p.phone, billingSame: p.billingSame, ...(p.billingSame ? {} : { billingAddress1: p.billing.line1, billingAddress2: p.billing.line2 ?? '', billingCity: p.billing.city, billingState: p.billing.state, billingZip: p.billing.postal_code }) }
    return { firstName: u.first_name, lastName: u.last_name, phone: c.address?.phone ?? digits(u.phone) }
  }
  if (open === 'contact') return c.contact ?? {}
  if (open === 'plus') return { plan: c.plus?.plan ?? '' }
  return {}
}

function renderCheckout(req, res, { open, values, errors = {}, status = 200 } = {}) {
  const c = req.store.checkout
  const remaining = remainingSteps(c)
  open ??= remaining[0] ?? 'review'
  const ctaLabel = remaining.filter(s => s !== open).length ? 'Continue' : 'Save and review order'
  const t = coTotals(req.store)
  const body = P.checkoutPage({ base: res.locals.base, t, c, open, ctaLabel, values: values ?? defaultValues(req, open), errors })
  res.status(status).type('html').send(P.layout({ base: res.locals.base, title: 'Review your order - Walmart.com', body, t, user: req.store.user, variant: 'checkout' }))
}

router.get('/checkout/review-order', (req, res) => {
  if (!checkoutGuard(req, res)) return
  const c = req.store.checkout
  const edit = String(req.query.edit ?? '')
  if (req.query.cartId !== cartId(req.store)) return res.redirect(reviewUrl(res.locals.base, req.store, edit ? `&edit=${encodeURIComponent(edit)}` : ''))
  const canEdit = { address: true, payment: !!c.address, contact: true, plus: !!c.plus?.opted }
  renderCheckout(req, res, { open: canEdit[edit] ? edit : undefined })
})

router.post('/checkout/address', (req, res) => {
  if (!checkoutGuard(req, res)) return
  const v = { ...req.body, preferred: req.body.preferred === '1' }
  const errors = {}
  const need = (k, msg) => { if (!String(v[k] ?? '').trim()) errors[k] = msg }
  need('firstName', 'Enter a first name'); need('lastName', 'Enter a last name'); need('address1', 'Enter a street address'); need('city', 'Enter a city')
  if (!STATES.includes(v.state)) errors.state = 'Select a state'
  if (!/^\d{5}(-\d{4})?$/.test(String(v.zip ?? '').trim())) errors.zip = 'Enter a valid ZIP code'
  if (digits(v.phone).length !== 10) errors.phone = 'Enter a valid 10 digit phone number'
  if (/^\s*p\.?\s*o\.?\s*box/i.test(String(v.address1 ?? ''))) errors.address1 = 'No PO boxes. Military addresses OK.'
  if (Object.keys(errors).length) return renderCheckout(req, res, { open: 'address', values: v, errors, status: 400 })
  req.store.checkout.address = { firstName: v.firstName.trim(), lastName: v.lastName.trim(), address1: v.address1.trim(), address2: String(v.address2 ?? '').trim(), city: v.city.trim(), state: v.state, zip: String(v.zip).trim(), phone: digits(v.phone), instructions: String(v.instructions ?? '').trim(), preferred: v.preferred }
  res.redirect(reviewUrl(res.locals.base, req.store))
})

router.post('/checkout/payment', (req, res) => {
  if (!checkoutGuard(req, res)) return
  const base = res.locals.base
  const c = req.store.checkout
  if (!c.address) return res.redirect(reviewUrl(base, req.store))
  if (req.body.method === 'paypal') {
    // ASSUMPTION: "Continue to PayPal" would hand off to PayPal; here it counts as approved and is recorded as { method: 'paypal' }.
    c.payment = { method: 'paypal' }
    return res.redirect(reviewUrl(base, req.store))
  }
  const v = { ...req.body, billingSame: req.body.billingSame === '1', saveCard: req.body.saveCard === '1', defaultCard: req.body.defaultCard === '1' }
  const errors = {}
  // The form posts the "MM*" / "YY*" selects; a single "MM/YY" expiration field is still accepted.
  const expiry = (v.expMonth || v.expYear || v.expiration === undefined) ? `${v.expMonth ?? ''}/${v.expYear ?? ''}` : String(v.expiration).trim()
  const card = validateCard({ number: v.cardNumber, expiry, cvv: v.cvv })
  if (!card.ok) {
    if (card.errors.number) errors.cardNumber = 'Please enter a valid card number.'
    if (card.errors.expiry) errors.expiration = /^\d{1,2}\/\d{2,4}$/.test(expiry) ? 'Expiration date is invalid' : 'Expiration date is required'
    if (card.errors.cvv) errors.cvv = 'Enter a 3 or 4 digit CVV code'
  }
  if (!String(v.firstName ?? '').trim()) errors.firstName = 'First name on card is required'
  if (!String(v.lastName ?? '').trim()) errors.lastName = 'Last name on card is required'
  if (digits(v.phone).length !== 10) errors.phone = 'Enter a valid 10 digit phone number'
  if (!v.billingSame) {
    if (!String(v.billingAddress1 ?? '').trim()) errors.billingAddress1 = 'Enter a billing street address'
    if (!String(v.billingCity ?? '').trim()) errors.billingCity = 'Enter a billing city'
    if (!STATES.includes(v.billingState)) errors.billingState = 'Select a billing state'
    if (!/^\d{5}(-\d{4})?$/.test(String(v.billingZip ?? '').trim())) errors.billingZip = 'Enter a valid billing ZIP code'
  }
  // Never echo the card number or CVV back into the form.
  if (Object.keys(errors).length) return renderCheckout(req, res, { open: 'payment', values: { ...v, cardNumber: '', cvv: '' }, errors, status: 400 })
  const a = c.address
  c.payment = {
    method: 'card', brand: card.brand, last4: card.last4, expiration: expiry,
    firstName: v.firstName.trim(), lastName: v.lastName.trim(), phone: digits(v.phone), billingSame: v.billingSame, saveCard: v.saveCard,
    billing: v.billingSame
      ? { line1: a.address1, line2: a.address2 || null, city: a.city, state: a.state, postal_code: a.zip }
      : { line1: v.billingAddress1.trim(), line2: String(v.billingAddress2 ?? '').trim() || null, city: v.billingCity.trim(), state: v.billingState, postal_code: String(v.billingZip).trim() },
  }
  res.redirect(reviewUrl(base, req.store))
})

router.post('/checkout/contact', (req, res) => {
  if (!checkoutGuard(req, res)) return
  const v = { ...req.body, textUpdates: req.body.textUpdates === '1', marketing: req.body.marketing === '1' }
  const errors = {}
  if (!EMAIL_RE.test(String(v.email ?? '').trim())) errors.email = 'Please enter a valid email address'
  if (digits(v.phone).length !== 10) errors.phone = 'Enter a valid 10 digit phone number'
  if (Object.keys(errors).length) return renderCheckout(req, res, { open: 'contact', values: v, errors, status: 400 })
  req.store.checkout.contact = { email: String(v.email).trim().toLowerCase(), phone: digits(v.phone), textUpdates: v.textUpdates, marketing: v.marketing }
  res.redirect(reviewUrl(res.locals.base, req.store))
})

router.post('/checkout/plus', (req, res) => {
  if (!checkoutGuard(req, res)) return
  const base = res.locals.base
  const c = req.store.checkout
  if (!c.plus?.opted) return res.redirect(reviewUrl(base, req.store))
  if (req.body.decline === '1') { c.plus = { opted: true, decided: true, plan: null }; return res.redirect(reviewUrl(base, req.store)) }
  const errors = {}
  const plan = WALMART_PLUS.plans[req.body.plan] ? req.body.plan : null
  if (!plan) errors.plan = 'Choose a plan'
  if (req.body.agree !== '1') errors.agree = 'You must check the box to agree to the terms'
  if (Object.keys(errors).length) return renderCheckout(req, res, { open: 'plus', values: { plan: req.body.plan, agree: req.body.agree === '1' }, errors, status: 400 })
  c.plus = { opted: true, decided: true, plan }
  res.redirect(reviewUrl(base, req.store))
})

router.post('/checkout/place-order', (req, res) => {
  if (!checkoutGuard(req, res)) return
  const base = res.locals.base
  const c = req.store.checkout
  // Something still needs saving: the review page re-opens that card instead of placing the order.
  if (remainingSteps(c).length) return res.redirect(reviewUrl(base, req.store))
  const t = coTotals(req.store)
  const token = randomBytes(12).toString('hex')
  const a = c.address, u = req.store.user, pay = c.payment
  const order = recordOrder({
    store: req.storeSlug,
    order_number: orderNumber(),
    session: req.session,
    items: t.lines.map(l => l.product.kind === 'game'
      ? { platform: l.product.platform, edition: l.product.edition, format: l.product.format, qty: l.qty, unit_price: l.product.price, title: l.product.title, sku: l.product.id }
      : { kind: 'other', title: l.product.title, qty: l.qty, unit_price: l.product.price, sku: l.product.id }),
    customer: { email: c.contact.email, first_name: u.first_name, last_name: u.last_name, phone: c.contact.phone, account_id: u.id, guest: false },
    fulfillment: { method: 'ship', option: 'Free shipping', eta: ARRIVAL.day },
    shipping_address: { first_name: a.firstName, last_name: a.lastName, line1: a.address1, line2: a.address2 || null, city: a.city, state: a.state, postal_code: a.zip, country: 'US', phone: a.phone, instructions: a.instructions || null },
    billing_address: pay.method === 'card' ? { first_name: pay.firstName, last_name: pay.lastName, ...pay.billing, country: 'US' } : null,
    payment: pay.method === 'card' ? { method: 'card', brand: pay.brand, last4: pay.last4, name_on_card: `${pay.firstName} ${pay.lastName}`, expiration: pay.expiration } : { method: 'paypal' },
    totals: { subtotal: t.subtotal, shipping: t.shipping, tax: t.tax, ...(t.walmartPlus ? { walmart_plus: t.walmartPlus } : {}), total: t.total },
    currency: 'USD',
    meta: { token, cart_id: c.cartId, gift: req.body.gift === '1', walmart_plus: c.plus.plan, text_updates: c.contact.textUpdates },
  })
  req.store.cart = []
  req.store.checkout = {}
  res.redirect(`${base}/thankyou?order=${order.order_number}&token=${token}`)
})

router.get('/thankyou', (req, res) => {
  const base = res.locals.base
  const order = getOrder(String(req.query.order ?? ''))
  if (!order || order.store !== req.storeSlug || order.meta.token !== req.query.token) {
    return render(req, res, { title: 'Order not found - Walmart.com', status: 404, body: P.simplePage({ title: "We couldn't find that order", html: `<p>Check your Purchase history for order details.</p><a class="wm-pill" href="${base}/account">Purchase history</a>` }) })
  }
  render(req, res, { title: 'Thanks for your order - Walmart.com', body: P.thankyouPage({ base, order }) })
})

export default {
  slug: 'walmart',
  name: NAME,
  country: 'US',
  currency: 'USD',
  description: 'US. Code-in-box PS5/Xbox at $79.99, "Added to cart!" interstitial, no guest checkout (email-first identity gate), one-page checkout of Save cards, Walmart+ upsells.',
  router,
}
