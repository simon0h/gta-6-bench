import { Router } from 'express'
import { randomBytes, randomInt } from 'node:crypto'
import { recordOrder, getOrder, listOrders } from '../../lib/orders.js'
import { validateCard } from '../../lib/payment.js'
import { authenticate, createAccount, publicAccount } from '../../lib/accounts.js'
import { PRODUCTS, byId, search, totals, SHIPPING_METHODS, STATES } from './data.js'
import * as P from './pages.js'

const NAME = 'GameStop'
const router = Router()

// ---- helpers ----
function render(req, res, title, body, status = 200) {
  const t = totals(req.store)
  res.status(status).type('html').send(P.layout({ base: res.locals.base, title, body, cartCount: t.count, user: req.store.user }))
}
function orderNumber() { return '1101000' + String(randomInt(0, 1e9)).padStart(9, '0') }
const games = () => PRODUCTS.filter(p => p.kind === 'game')

// ---- browse ----
router.get('/', (req, res) => render(req, res, 'Power to the Players', P.homePage({ base: res.locals.base, products: PRODUCTS })))

router.get('/search', (req, res) => {
  const q = String(req.query.q ?? '')
  render(req, res, `${q} | Search Results`, P.searchPage({ base: res.locals.base, q, products: search(q) }))
})

router.get('/video-games/:category/products/:name/:id.html', (req, res) => {
  const p = byId(req.params.id)
  if (!p) return render(req, res, 'Not Found', P.simplePage({ title: 'Page Not Found', html: `<p>We can't find the page you're looking for.</p><a href="${res.locals.base}/">Return Home</a>` }), 404)
  const added = req.query.added ? byId(req.query.added) : null
  const title = p.kind === 'game' ? `GTAVI - ${p.selectorLabel} - Pre-Order Now` : p.title
  render(req, res, title, P.productPage({ base: res.locals.base, p, siblings: games(), added }))
})
// Short product URL, as an agent might type it.
router.get('/products/:id', (req, res) => {
  const p = byId(req.params.id)
  if (!p) return res.redirect(`${res.locals.base}/`)
  res.redirect(`${res.locals.base}/video-games/${encodeURIComponent(p.category)}/products/${p.slug}/${p.id}.html`)
})

router.get('/trade-in', (req, res) => render(req, res, 'Trade-In', P.simplePage({ title: 'Trade-In', html: '<p>Bring your games, consoles and accessories to any GameStop store for cash or trade credit.</p>' })))

// ---- cart ----
router.post('/cart/add', (req, res) => {
  const p = byId(req.body.pid)
  if (!p) return res.redirect(`${res.locals.base}/`)
  // Quirk replicated from the real site: re-adding creates a new line item instead of bumping qty.
  req.store.cartSeq = (req.store.cartSeq ?? 0) + 1
  req.store.cart.push({ line: req.store.cartSeq, pid: p.id, qty: 1 })
  res.redirect(`${res.locals.base}/video-games/${encodeURIComponent(p.category)}/products/${p.slug}/${p.id}.html?added=${p.id}`)
})

router.get('/cart', (req, res) => render(req, res, 'Cart', P.cartPage({ base: res.locals.base, t: totals(req.store), promoError: req.query.promoError, savedMsg: req.query.saved ? 'Item saved for later.' : null })))

router.post('/cart/update', (req, res) => {
  const line = Number(req.body.line)
  const action = req.body.action || 'update'
  const item = req.store.cart.find(l => l.line === line)
  if (item) {
    if (action === 'remove' || action === 'save') req.store.cart = req.store.cart.filter(l => l.line !== line)
    else { const q = Number(req.body.qty); if (q >= 1 && q <= 5) item.qty = q }
  }
  res.redirect(`${res.locals.base}/cart/${action === 'save' ? '?saved=1' : ''}`)
})

router.post('/cart/promo', (req, res) => {
  const code = String(req.body.code ?? '').trim()
  const msg = code ? 'Coupons cannot be applied to pre-orders.' : 'No coupon code entered'
  res.redirect(`${res.locals.base}/cart/?promoError=${encodeURIComponent(msg)}`)
})

// ---- checkout entry ----
router.post('/checkout/start', (req, res) => {
  if (!req.store.cart.length) return res.redirect(`${res.locals.base}/cart/`)
  if (req.store.user || req.store.checkout.guest) return res.redirect(`${res.locals.base}/checkout/`)
  res.redirect(`${res.locals.base}/checkout/login/?required=false`)
})
router.post('/checkout/express', (req, res) => {
  if (!req.store.cart.length) return res.redirect(`${res.locals.base}/cart/`)
  req.store.checkout.guest = true
  req.store.checkout.values = { ...(req.store.checkout.values ?? {}), paymentMethod: 'paypal' }
  res.redirect(`${res.locals.base}/checkout/`)
})

// ---- auth ----
function loginHandler(checkout) {
  return (req, res) => {
    const base = res.locals.base
    if (req.body.action === 'guest') {
      req.store.checkout.guest = true
      return res.redirect(`${base}/checkout/`)
    }
    const acct = authenticate(req.storeSlug, req.body.email, req.body.password)
    if (!acct) return render(req, res, 'Sign In', P.loginPage({ base, checkout, email: req.body.email, error: 'The email or password you entered is incorrect. Please try again.' }), 401)
    req.store.user = publicAccount(acct)
    res.redirect(checkout || req.store.cart.length ? `${base}/checkout/` : `${base}/account/`)
  }
}
router.get('/login', (req, res) => render(req, res, 'Sign In', P.loginPage({ base: res.locals.base, checkout: false })))
router.post('/login', loginHandler(false))
router.get('/checkout/login', (req, res) => {
  if (!req.store.cart.length) return res.redirect(`${res.locals.base}/cart/`)
  render(req, res, 'Sign In or Checkout as Guest', P.loginPage({ base: res.locals.base, checkout: true }))
})
router.post('/checkout/login', loginHandler(true))
router.get('/logout', (req, res) => { req.store.user = null; req.store.checkout = {}; res.redirect(`${res.locals.base}/`) })

router.get('/account/create', (req, res) => render(req, res, 'Create Account', P.createAccountPage({ base: res.locals.base, checkout: !!req.query.checkout })))
router.post('/account/create', (req, res) => {
  const v = req.body, errors = {}
  for (const [k, label] of [['firstName', 'First Name'], ['lastName', 'Last Name'], ['email', 'Email'], ['password', 'Password']]) if (!String(v[k] ?? '').trim()) errors[k] = `${label} is required.`
  if (v.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.email)) errors.email = 'Enter a valid email address.'
  if (v.password && v.password.length < 8) errors.password = 'Password must be at least 8 characters.'
  if (v.password !== v.confirmPassword) errors.confirmPassword = 'Passwords do not match.'
  if (!Object.keys(errors).length) {
    const acct = createAccount(req.storeSlug, { email: v.email, password: v.password, first_name: v.firstName.trim(), last_name: v.lastName.trim(), phone: v.phone ?? '' })
    if (acct.error) errors.email = acct.error
    else { req.store.user = publicAccount(acct); return res.redirect(req.query.checkout && req.store.cart.length ? `${res.locals.base}/checkout/` : `${res.locals.base}/account/`) }
  }
  render(req, res, 'Create Account', P.createAccountPage({ base: res.locals.base, values: v, errors, checkout: !!req.query.checkout }), 400)
})

router.get('/account', (req, res) => {
  if (!req.store.user) return res.redirect(`${res.locals.base}/login/`)
  const orders = listOrders({ store: req.storeSlug }).filter(o => o.customer.email === req.store.user.email)
  render(req, res, 'My Account', P.accountPage({ base: res.locals.base, user: req.store.user, orders }))
})

// ---- checkout (single page, as GameStop's help center describes it) ----
router.get('/checkout', (req, res) => {
  const base = res.locals.base
  if (!req.store.cart.length) return res.redirect(`${base}/cart/`)
  if (!req.store.user && !req.store.checkout.guest) return res.redirect(`${base}/checkout/login/?required=false`)
  const values = req.store.checkout.values ?? {}
  if (req.store.user) { values.firstName ??= req.store.user.first_name; values.lastName ??= req.store.user.last_name; values.phone ??= req.store.user.phone }
  render(req, res, 'Checkout', P.checkoutPage({ base, user: req.store.user, t: totals(req.store, values.shippingMethod), values, shippingMethod: values.shippingMethod ?? 'premium' }))
})

router.post('/checkout', (req, res) => {
  const base = res.locals.base
  if (!req.store.cart.length) return res.redirect(`${base}/cart/`)
  if (!req.store.user && !req.store.checkout.guest) return res.redirect(`${base}/checkout/login/?required=false`)
  const v = { ...req.body, billingSame: req.body.billingSame === '1' }
  if (req.store.user) v.email = req.store.user.email
  const errors = {}
  const req_ = (k, label) => { if (!String(v[k] ?? '').trim()) errors[k] = `${label} is required.` }
  req_('email', 'Email'); req_('firstName', 'First Name'); req_('lastName', 'Last Name'); req_('address1', 'Address 1'); req_('city', 'City'); req_('stateCode', 'State'); req_('postalCode', 'ZIP Code'); req_('phone', 'Phone Number')
  if (v.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.email)) errors.email = 'Enter a valid email address.'
  if (v.stateCode && !STATES.includes(v.stateCode)) errors.stateCode = 'Select a state.'
  if (v.postalCode && !/^\d{5}(-\d{4})?$/.test(v.postalCode.trim())) errors.postalCode = 'Enter a valid 5-digit ZIP Code.'
  if (v.phone && String(v.phone).replace(/\D/g, '').length !== 10) errors.phone = 'Enter a valid 10-digit phone number.'
  const shippingMethod = SHIPPING_METHODS[v.shippingMethod] ? v.shippingMethod : 'premium'
  const paymentMethod = ['card', 'paypal', 'bnpl'].includes(v.paymentMethod) ? v.paymentMethod : 'card'
  let payment
  if (paymentMethod === 'card') {
    const card = validateCard({ number: v.cardNumber, expiry: v.expirationMonthYear, cvv: v.securityCode })
    if (!card.ok) { if (card.errors.number) errors.cardNumber = card.errors.number; if (card.errors.expiry) errors.expirationMonthYear = card.errors.expiry; if (card.errors.cvv) errors.securityCode = card.errors.cvv }
    else payment = { method: 'card', brand: card.brand, last4: card.last4, expiration: String(v.expirationMonthYear).trim() }
  } else payment = { method: paymentMethod === 'bnpl' ? 'zip' : 'paypal' }
  const billing = v.billingSame
    ? { first_name: v.firstName, last_name: v.lastName, line1: v.address1, line2: v.address2 || null, city: v.city, state: v.stateCode, postal_code: v.postalCode, country: 'US' }
    : { first_name: v.billingFirstName, last_name: v.billingLastName, line1: v.billingAddress1, line2: null, city: v.billingCity, state: v.billingStateCode, postal_code: v.billingPostalCode, country: 'US' }
  if (!v.billingSame) for (const [k, label] of [['billingFirstName', 'Billing First Name'], ['billingLastName', 'Billing Last Name'], ['billingAddress1', 'Billing Address 1'], ['billingCity', 'Billing City'], ['billingStateCode', 'Billing State'], ['billingPostalCode', 'Billing ZIP Code']]) if (!String(v[k] ?? '').trim()) errors[k] = `${label} is required.`

  req.store.checkout.values = { ...v, cardNumber: '', securityCode: '' }
  if (Object.keys(errors).length) {
    return render(req, res, 'Checkout', P.checkoutPage({ base, user: req.store.user, t: totals(req.store, shippingMethod), values: { ...v, cardNumber: '', securityCode: '' }, errors, shippingMethod }), 400)
  }

  const t = totals(req.store, shippingMethod)
  const token = randomBytes(12).toString('hex')
  const order = recordOrder({
    store: req.storeSlug,
    order_number: orderNumber(),
    session: req.session,
    items: t.lines.map(l => l.product.kind === 'game'
      ? { platform: l.product.platform, edition: l.product.edition, format: l.product.format, qty: l.qty, unit_price: l.product.price, title: l.product.title, sku: l.product.id }
      : { kind: 'other', title: l.product.title, qty: l.qty, unit_price: l.product.price, sku: l.product.id }),
    customer: { email: String(v.email).trim().toLowerCase(), first_name: v.firstName.trim(), last_name: v.lastName.trim(), phone: v.phone, account_id: req.store.user?.id ?? null, guest: !req.store.user },
    fulfillment: { method: 'ship', option: shippingMethod, eta: SHIPPING_METHODS[shippingMethod].eta },
    shipping_address: { first_name: v.firstName.trim(), last_name: v.lastName.trim(), line1: v.address1.trim(), line2: v.address2?.trim() || null, city: v.city.trim(), state: v.stateCode, postal_code: v.postalCode.trim(), country: 'US', phone: v.phone },
    billing_address: billing,
    payment,
    totals: { subtotal: t.subtotal, shipping: t.shipping, tax: t.tax, total: t.total },
    currency: 'USD',
    meta: { token, gift_card_entered: !!String(v.giftCardNumber ?? '').trim() },
  })
  req.store.cart = []
  req.store.checkout = {}
  res.redirect(`${base}/order/confirmation/?ID=${order.order_number}&token=${token}`)
})

router.get('/order/confirmation', (req, res) => {
  const order = getOrder(String(req.query.ID ?? ''))
  if (!order || order.store !== req.storeSlug || order.meta.token !== req.query.token) return render(req, res, 'Order Confirmation', P.simplePage({ title: 'Order not found', html: `<p>We couldn't find that order.</p><a href="${res.locals.base}/">Return Home</a>` }), 404)
  render(req, res, 'Order Confirmation', P.confirmationPage({ base: res.locals.base, order }))
})

export default {
  slug: 'gamestop',
  name: NAME,
  country: 'US',
  currency: 'USD',
  description: 'US. Code-in-box PS5/Xbox, guest checkout, single-page checkout, Pro upsells.',
  router,
}
