import { Router } from 'express'
import { randomBytes, randomInt } from 'node:crypto'
import { recordOrder, getOrder, listOrders } from '../../lib/orders.js'
import { validateCard } from '../../lib/payment.js'
import { authenticate, createAccount, publicAccount } from '../../lib/accounts.js'
import { PRODUCTS, byTcin, games, sponsored, protectionPlan, productPath, search, totals, STATES, PAYMENT_TYPES, PREORDER_ARRIVAL, ARRIVES } from './data.js'
import * as P from './pages.js'

const NAME = 'Target'
const router = Router()

// ---- helpers ----
function render(req, res, title, body, { status = 200, minimal = false, q = '' } = {}) {
  const t = totals(req.store)
  res.status(status).type('html').send(P.layout({ base: res.locals.base, title, body, cartCount: t.count, user: req.store.user, q, minimal }))
}
// ASSUMPTION: 15 digits with no separators (one public example: 902001863311107); shipped
// Target.com orders appear to start with 102… (low confidence in the research).
function orderNumber() { return '102' + String(randomInt(0, 1e12)).padStart(12, '0') }
// Only ever redirect back to a path inside this store.
function safePath(base, s, fallback) {
  s = typeof s === 'string' ? s : ''
  return s.startsWith(base + '/') && !s.startsWith(base + '//') ? s : fallback
}
function withQuery(path, params) {
  const u = new URL(path, 'http://x')
  for (const k of ['added', 'notadded', 'list']) u.searchParams.delete(k)
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v)
  return u.pathname + u.search
}
const recsFor = (p) => PRODUCTS.filter(x => x !== p && !x.addon).slice(0, 4)
function drawerFor(req, res, closeHref) {
  const added = req.query.added ? byTcin(req.query.added) : null
  const notAdded = req.query.notadded ? byTcin(req.query.notadded) : null
  if (!added && !notAdded) return ''
  return P.addedDrawer({ base: res.locals.base, added, notAdded, closeHref, plan: protectionPlan(), recs: recsFor(added ?? notAdded) })
}
function addToCart(store, p, qty) {
  const line = store.cart.find(l => l.tcin === p.tcin)
  if ((line ? line.qty : 0) + qty > p.limit) return false // purchase limit (2 for the game)
  if (line) line.qty += qty; else store.cart.push({ tcin: p.tcin, qty })
  return true
}
function notFound(req, res) {
  render(req, res, 'Page not found : Target', P.simplePage({ title: 'Oops! Something went wrong.', html: `<p>We can&rsquo;t find the page you&rsquo;re looking for.</p><a class="tg-btn" href="${res.locals.base}/">Go to homepage</a>` }), { status: 404 })
}

// ---- browse ----
router.get('/', (req, res) => render(req, res, 'Target : Expect More. Pay Less.', P.homePage({ base: res.locals.base, products: PRODUCTS.filter(p => !p.addon && !p.sponsored), games: games() })))

function searchRender(req, res, q) {
  const base = res.locals.base
  const products = search(q)
  const path = `${base}/s?searchTerm=${encodeURIComponent(q)}`
  render(req, res, `${q} : Target`, P.searchPage({ base, q, products, sponsored: products.length ? sponsored() : null, backPath: path, drawer: drawerFor(req, res, path) }), { q })
}
router.get('/s', (req, res) => searchRender(req, res, String(req.query.searchTerm ?? '').trim()))
// Curated collection URL, e.g. /s/gta+6
router.get('/s/:term', (req, res) => searchRender(req, res, String(req.params.term).replace(/\+/g, ' ').trim()))

router.get('/p/:slug/-/A-:tcin', (req, res) => {
  const base = res.locals.base
  const p = byTcin(req.params.tcin)
  if (!p) return notFound(req, res)
  const fulfillment = ['pickup', 'delivery', 'shipping'].includes(req.query.fulfillment) ? req.query.fulfillment : 'shipping'
  const path = productPath(base, p)
  render(req, res, `${p.title} : Target`, P.productPage({
    base, p, siblings: games(), fulfillment, plan: protectionPlan(), recs: recsFor(p), user: req.store.user,
    drawer: drawerFor(req, res, path), listMsg: req.query.list === 'added' ? 'Item added to your list.' : null,
  }))
})

// ---- cart ----
router.post('/cart/add', (req, res) => {
  const base = res.locals.base
  const p = byTcin(req.body.tcin)
  if (!p) return res.redirect(`${base}/`)
  const back = safePath(base, req.body.back, productPath(base, p))
  const qty = Math.max(1, Math.min(p.limit, parseInt(req.body.qty, 10) || 1))
  const ok = addToCart(req.store, p, qty)
  const plan = ok && req.body.addon ? byTcin(req.body.addon) : null
  if (plan?.addon) addToCart(req.store, plan, 1)
  res.redirect(withQuery(back, ok ? { added: p.tcin } : { notadded: p.tcin }))
})

// ASSUMPTION: Target's one-click "Buy now" drawer needs a saved address and card; here it adds the
// item and goes straight to checkout. Guests get "Sign in to buy now" on the page instead.
router.post('/buy-now', (req, res) => {
  const base = res.locals.base
  const p = byTcin(req.body.tcin)
  if (!p) return res.redirect(`${base}/`)
  if (!req.store.user) return res.redirect(`${base}/login?redirect=${encodeURIComponent(productPath(base, p))}`)
  addToCart(req.store, p, 1)
  res.redirect(`${base}/checkout`)
})

router.post('/list/add', (req, res) => {
  const base = res.locals.base
  const p = byTcin(req.body.tcin)
  if (!p) return res.redirect(`${base}/`)
  if (!req.store.user) return res.redirect(`${base}/login?redirect=${encodeURIComponent(productPath(base, p))}`)
  res.redirect(withQuery(productPath(base, p), { list: 'added' }))
})

router.get('/cart', (req, res) => {
  const saved = (req.store.saved ?? []).map(byTcin).filter(Boolean)
  render(req, res, 'Cart : Target', P.cartPage({
    base: res.locals.base, t: totals(req.store), saved, user: req.store.user, recs: recsFor(null),
    promo: !!req.query.promo, promoError: req.query.promoError, promoValue: req.query.code,
  }))
})

router.post('/cart/update', (req, res) => {
  const tcin = String(req.body.tcin ?? ''), action = req.body.action || 'update', p = byTcin(tcin)
  req.store.saved ??= []
  const drop = () => { req.store.cart = req.store.cart.filter(l => l.tcin !== tcin) }
  if (p) {
    if (action === 'remove') drop()
    else if (action === 'save') { drop(); if (!req.store.saved.includes(tcin)) req.store.saved.push(tcin) }
    else if (action === 'restore') { req.store.saved = req.store.saved.filter(t => t !== tcin); addToCart(req.store, p, 1) }
    else if (action === 'removesaved') req.store.saved = req.store.saved.filter(t => t !== tcin)
    else {
      const line = req.store.cart.find(l => l.tcin === tcin), q = parseInt(req.body.qty, 10)
      if (line && q === 0) drop() // Target help: "reduce the qty to 0" removes the item
      else if (line && q >= 1 && q <= p.limit) line.qty = q
    }
  }
  res.redirect(`${res.locals.base}/cart`)
})

router.post('/cart/promo', (req, res) => {
  const code = String(req.body.code ?? '').trim()
  const msg = code.length < 4 || code.length > 36 ? 'Enter a promo code between 4 and 36 characters.' : 'Promo code doesn’t apply to any item in your cart'
  res.redirect(`${res.locals.base}/cart?promo=1&promoError=${encodeURIComponent(msg)}&code=${encodeURIComponent(code)}`)
})

// "Pay with PayPal" under the Check out button: needs a signed-in account, then the same
// Shipping → Payment → Review steps with PayPal preselected and "Pay with PayPal" on the review step.
router.post('/cart/paypal', (req, res) => {
  const base = res.locals.base
  if (!req.store.cart.length) return res.redirect(`${base}/cart`)
  req.store.checkout.paymentValues = { paymentType: 'paypal' }
  req.store.checkout.payment = null
  if (!req.store.user) return res.redirect(`${base}/login?redirect=${encodeURIComponent(base + '/checkout')}`)
  res.redirect(`${base}/checkout`)
})

// ---- auth (no guest checkout: "You'll need to sign in to a Target account in order to proceed with checkout.") ----
// ASSUMPTION: like checkout, the sign-in and create-account pages use the reduced logo-only chrome
// (no search bar or marketing footer); the research does not describe their header/footer.
const AUTH = { minimal: true }
router.get('/login', (req, res) => render(req, res, 'Login: Target', P.loginPage({ base: res.locals.base, redirect: safePath(res.locals.base, req.query.redirect, '') }), AUTH))
router.post('/login', (req, res) => {
  const base = res.locals.base
  const redirect = safePath(base, req.body.redirect, '')
  const acct = authenticate(req.storeSlug, req.body.email, req.body.password)
  // ASSUMPTION: Target's exact wrong-password message was not captured.
  if (!acct) return render(req, res, 'Login: Target', P.loginPage({ base, redirect, email: req.body.email, error: 'We couldn’t sign you in. Check your email address and password and try again.' }), { ...AUTH, status: 401 })
  req.store.user = publicAccount(acct)
  res.redirect(redirect || `${base}/account`)
})
router.get('/login/:kind', (req, res) => {
  if (!['passkey', 'phone'].includes(req.params.kind)) return notFound(req, res)
  render(req, res, 'Login: Target', P.altSignInPage({ base: res.locals.base, kind: req.params.kind, redirect: safePath(res.locals.base, req.query.redirect, '') }), AUTH)
})
router.get('/logout', (req, res) => { req.store.user = null; req.store.checkout = {}; res.redirect(`${res.locals.base}/`) })

router.get('/account/create', (req, res) => render(req, res, 'Create account : Target', P.createAccountPage({ base: res.locals.base, redirect: safePath(res.locals.base, req.query.redirect, '') }), AUTH))
router.post('/account/create', (req, res) => {
  const base = res.locals.base
  const v = req.body, errors = {}
  const redirect = safePath(base, v.redirect, '')
  const email = String(v.email ?? '').trim(), pw = String(v.password ?? '')
  if (!email) errors.email = 'Email address is required'
  else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errors.email = 'Enter a valid email address'
  if (!String(v.firstName ?? '').trim()) errors.firstName = 'First name is required'
  if (!String(v.lastName ?? '').trim()) errors.lastName = 'Last name is required'
  if (v.phone && String(v.phone).replace(/\D/g, '').length !== 10) errors.phone = 'Enter a valid 10-digit mobile phone number'
  // Password rules from Target help: 8–20 characters, 2 of lowercase/uppercase/numbers/special, no < >.
  const classes = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter(re => re.test(pw)).length
  if (!pw) errors.password = 'Password is required'
  else if (pw.length < 8 || pw.length > 20) errors.password = 'Password must be 8–20 characters'
  else if (/[<>]/.test(pw)) errors.password = 'Password can’t contain < or >'
  else if (classes < 2) errors.password = 'Password must include at least 2 of the following: lowercase letters, uppercase letters, numbers, special characters'
  if (!Object.keys(errors).length) {
    const acct = createAccount(req.storeSlug, { email, password: pw, first_name: v.firstName.trim(), last_name: v.lastName.trim(), phone: String(v.phone ?? '').trim() })
    if (acct.error) errors.email = acct.error
    else { req.store.user = publicAccount(acct); return res.redirect(redirect || `${base}/account`) }
  }
  render(req, res, 'Create account : Target', P.createAccountPage({ base, redirect, values: { ...v, password: '' }, errors }), { ...AUTH, status: 400 })
})

router.get('/account', (req, res) => {
  const base = res.locals.base
  if (!req.store.user) return res.redirect(`${base}/login?redirect=${encodeURIComponent(base + '/account')}`)
  const orders = listOrders({ store: req.storeSlug }).filter(o => o.customer.email === req.store.user.email)
  render(req, res, 'Account : Target', P.accountPage({ base, user: req.store.user, orders }))
})

// ---- checkout: Shipping address → Payment → Review & place order (one page, one URL per step) ----
function gate(req, res) {
  const base = res.locals.base
  if (!req.store.cart.length) { res.redirect(`${base}/cart`); return false }
  if (!req.store.user) { res.redirect(`${base}/login?redirect=${encodeURIComponent(base + '/checkout')}`); return false }
  return true
}
function renderCheckout(req, res, step, { values, errors = {} } = {}, status = 200) {
  const c = req.store.checkout, u = req.store.user
  const defaults = step === 'shipping'
    ? (c.shippingValues ?? { firstName: u.first_name, lastName: u.last_name, phone: u.phone })
    : step === 'payment' ? (c.paymentValues ?? {}) : {}
  render(req, res, 'Checkout : Target', P.checkoutPage({ base: res.locals.base, step, t: totals(req.store), checkout: c, values: values ?? defaults, errors }), { status, minimal: true })
}
function nextStep(c) { return !c.shipping ? 'shipping' : !c.payment ? 'payment' : 'review' }

const startCheckout = (req, res) => { if (gate(req, res)) res.redirect(`${res.locals.base}/checkout/${nextStep(req.store.checkout)}`) }
router.get('/checkout', startCheckout)
router.get('/checkout/start', startCheckout)

router.get('/checkout/shipping', (req, res) => { if (gate(req, res)) renderCheckout(req, res, 'shipping') })
router.post('/checkout/shipping', (req, res) => {
  if (!gate(req, res)) return
  const v = req.body, errors = {}
  const req_ = (k, label) => { if (!String(v[k] ?? '').trim()) errors[k] = `${label} is required` }
  req_('firstName', 'First name'); req_('lastName', 'Last name'); req_('address1', 'Address line 1'); req_('zip', 'Zip code'); req_('city', 'City'); req_('state', 'State'); req_('phone', 'Phone number')
  if (v.zip && !/^\d{5}(-\d{4})?$/.test(String(v.zip).trim())) errors.zip = 'Check your ZIP code and try again.'
  if (v.state && !STATES.includes(v.state)) errors.state = 'State is required'
  if (v.phone && String(v.phone).replace(/\D/g, '').length !== 10) errors.phone = 'Enter a valid 10-digit phone number'
  // This item cannot ship to PO Boxes, Alaska, Hawaii or US territories.
  if (!errors.address1 && (['AK', 'HI'].includes(v.state) || /\bp\.?\s*o\.?\s*box\b/i.test(String(v.address1)))) errors.address1 = 'Can’t ship to your address. This item can’t be shipped to PO Boxes, Alaska, Hawaii or U.S. territories.'
  if (Object.keys(errors).length) return renderCheckout(req, res, 'shipping', { values: v, errors }, 400)
  const c = req.store.checkout
  const shipping = { first_name: v.firstName.trim(), last_name: v.lastName.trim(), line1: v.address1.trim(), line2: String(v.address2 ?? '').trim() || null, city: v.city.trim(), state: v.state, postal_code: String(v.zip).trim(), country: 'US', phone: String(v.phone).trim() }
  // Target help: changing the shipping address during checkout forces CVV re-entry.
  if (c.payment?.type === 'card' && c.shipping && JSON.stringify(c.shipping) !== JSON.stringify(shipping)) c.payment = null
  c.shipping = shipping
  c.shippingValues = v
  c.instructions = String(v.instructions ?? '').trim() || null
  res.redirect(`${res.locals.base}/checkout/${nextStep(c)}`)
})

router.get('/checkout/payment', (req, res) => {
  if (!gate(req, res)) return
  if (!req.store.checkout.shipping) return res.redirect(`${res.locals.base}/checkout/shipping`)
  renderCheckout(req, res, 'payment')
})
router.post('/checkout/payment', (req, res) => {
  if (!gate(req, res)) return
  const c = req.store.checkout
  if (!c.shipping) return res.redirect(`${res.locals.base}/checkout/shipping`)
  const v = req.body, errors = {}
  const type = PAYMENT_TYPES[v.paymentType] ? v.paymentType : 'card'
  const kept = { ...v, cardNumber: '', cvv: '' } // never echo the card number or CVV
  if (v.action === 'giftcard') {
    errors.giftCardNumber = 'We couldn’t find a gift card with that number. Check the card number and access number and try again.'
    return renderCheckout(req, res, 'payment', { values: kept, errors }, 400)
  }
  let payment = { type }
  if (type === 'card') {
    const number = String(v.cardNumber ?? '').trim(), expiry = String(v.expiry ?? '').trim(), cvv = String(v.cvv ?? '').trim(), name = String(v.nameOnCard ?? '').trim()
    const card = validateCard({ number, expiry, cvv })
    if (!number) errors.cardNumber = 'Card number is required'
    else if (!card.ok && card.errors.number) errors.cardNumber = 'Invalid card number. Try again'
    if (!expiry) errors.expiry = 'Expiration date is required'
    else if (!card.ok && card.errors.expiry) errors.expiry = card.errors.expiry === 'This card has expired.' ? 'This card has expired. Try a different card' : 'Invalid expiration date. Try again'
    if (!cvv) errors.cvv = 'CVV is required'
    else if (!card.ok && card.errors.cvv) errors.cvv = 'Invalid CVV. Try again'
    if (!name) errors.nameOnCard = 'Name on card is required'
    if (card.ok) payment = { type, brand: card.brand, last4: card.last4, name_on_card: name, expiration: expiry }
  }
  const billingSame = v.billingSame !== '0'
  if (type === 'card' && !billingSame) {
    for (const [k, label] of [['billingFirstName', 'Billing first name'], ['billingLastName', 'Billing last name'], ['billingAddress1', 'Billing address line 1'], ['billingZip', 'Billing zip code'], ['billingCity', 'Billing city'], ['billingState', 'Billing state']]) if (!String(v[k] ?? '').trim()) errors[k] = `${label} is required`
  }
  if (Object.keys(errors).length) return renderCheckout(req, res, 'payment', { values: kept, errors }, 400)
  payment.billing_address = type !== 'card' || billingSame
    ? { ...c.shipping }
    : { first_name: v.billingFirstName.trim(), last_name: v.billingLastName.trim(), line1: v.billingAddress1.trim(), line2: null, city: v.billingCity.trim(), state: v.billingState, postal_code: String(v.billingZip).trim(), country: 'US' }
  c.payment = payment
  c.paymentValues = kept
  c.giftCardEntered = !!String(v.giftCardNumber ?? '').trim()
  res.redirect(`${res.locals.base}/checkout/review`)
})

router.get('/checkout/review', (req, res) => {
  if (!gate(req, res)) return
  const c = req.store.checkout
  if (!c.shipping || !c.payment) return res.redirect(`${res.locals.base}/checkout/${nextStep(c)}`)
  renderCheckout(req, res, 'review')
})

router.post('/checkout/place-order', (req, res) => {
  const base = res.locals.base
  if (!gate(req, res)) return
  const c = req.store.checkout, u = req.store.user
  if (!c.shipping || !c.payment) return res.redirect(`${base}/checkout/${nextStep(c)}`)
  const t = totals(req.store)
  const token = randomBytes(12).toString('hex')
  const pay = c.payment
  const payment = pay.type === 'card'
    ? { method: 'card', brand: pay.brand, last4: pay.last4, name_on_card: pay.name_on_card, expiration: pay.expiration }
    : { method: PAYMENT_TYPES[pay.type].method }
  const preorder = t.lines.some(l => l.product.preorder)
  const order = recordOrder({
    store: req.storeSlug,
    order_number: orderNumber(),
    session: req.session,
    items: t.lines.map(l => l.product.kind === 'game'
      ? { platform: l.product.platform, edition: l.product.edition, format: l.product.format, qty: l.qty, unit_price: l.product.price, title: l.product.title, sku: l.product.tcin }
      : { kind: 'other', title: l.product.title, qty: l.qty, unit_price: l.product.price, sku: l.product.tcin }),
    customer: { email: u.email, first_name: u.first_name, last_name: u.last_name, phone: c.shipping.phone, account_id: u.id, guest: false },
    fulfillment: { method: 'ship', option: 'standard', eta: preorder ? PREORDER_ARRIVAL : `Arrives ${ARRIVES}` },
    shipping_address: c.shipping,
    billing_address: pay.billing_address,
    payment,
    totals: { subtotal: t.subtotal, shipping: t.shipping, tax: t.tax, total: t.total },
    currency: 'USD',
    meta: { token, delivery_instructions: c.instructions ?? null, gift_card_entered: !!c.giftCardEntered },
  })
  req.store.cart = []
  req.store.checkout = {}
  res.redirect(`${base}/order-confirmation?orderId=${order.order_number}&token=${token}`)
})

router.get('/order-confirmation', (req, res) => {
  const order = getOrder(String(req.query.orderId ?? ''))
  if (!order || order.store !== req.storeSlug || order.meta.token !== req.query.token) return notFound(req, res)
  render(req, res, 'Order confirmation : Target', P.confirmationPage({ base: res.locals.base, order }))
})

router.get('/orders/:number', (req, res) => {
  const base = res.locals.base
  if (!req.store.user) return res.redirect(`${base}/login?redirect=${encodeURIComponent(base + '/orders/' + req.params.number)}`)
  const order = getOrder(String(req.params.number))
  if (!order || order.store !== req.storeSlug || order.customer.email !== req.store.user.email) return notFound(req, res)
  render(req, res, `Order # ${order.order_number} : Target`, P.orderDetailsPage({ base, order }))
})

export default {
  slug: 'target',
  name: NAME,
  country: 'US',
  currency: 'USD',
  description: 'US. Code-in-box PS5/Xbox, account required (no guest checkout), Shipping → Payment → Review steps, Circle upsells.',
  router,
}
