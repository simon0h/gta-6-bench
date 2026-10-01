import { Router } from 'express'
import { randomBytes, randomInt } from 'node:crypto'
import { recordOrder, getOrder, listOrders } from '../../lib/orders.js'
import { validateCard } from '../../lib/payment.js'
import { authenticate, createAccount, publicAccount } from '../../lib/accounts.js'
import { PRODUCTS, byId, bySlug, games, search, totals, productPath, findStores, storeById, postcodeState, stateName, STATES, SHIPPING_METHODS, COURIER_METHOD } from './data.js'
import * as P from './pages.js'

const NAME = 'JB Hi-Fi'
const MAX_QTY = 5 // the cart quantity dropdown offers 1–5 (JB limits copies per order)
const router = Router()

// ---- helpers ----
const str = (v) => (typeof v === 'string' ? v.trim() : '')
const round = (n) => Math.round(n * 100) / 100
const pick = (obj, keys) => Object.fromEntries(keys.filter(k => typeof obj[k] === 'string').map(k => [k, obj[k]]))
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

function render(req, res, { title, body, status = 200, checkout = null }) {
  // ?added=<sku> opens the full-screen "Item added to your cart!" modal (where POST /cart/add lands, no JS needed).
  const added = !checkout && req.query.added && req.store.cart.some(l => l.pid === String(req.query.added)) ? byId(req.query.added) : null
  const here = new URL(req.originalUrl, 'http://jb.local')
  here.searchParams.delete('added')
  res.status(status).type('html').send(P.layout({ base: res.locals.base, title, body, cartCount: totals(req.store).count, user: req.store.user, added, closeHref: here.pathname + here.search, checkout }))
}

function notFound(req, res) {
  render(req, res, { title: 'Page not found | JB Hi-Fi', status: 404, body: P.simplePage({ title: 'Sorry, we couldn’t find that page', html: `<p>The page you're looking for may have moved or no longer exists.</p><p><a class="jb-btn" href="${res.locals.base}/">Continue shopping</a></p>` }) })
}

// Only ever send the shopper back to a page inside this store.
const safeReturn = (base, value, fallback) => (str(value).startsWith(`${base}/`) ? str(value) : fallback)

// ASSUMPTION: the thank-you page was not observed. Shopify shows "Order #<digits>"; JB numbers are 8 digits here.
const orderNumber = () => String(randomInt(10_000_000, 100_000_000))

// ---- browse ----
// ASSUMPTION: the home page was not part of the research; it is a plain entry point with the header search.
router.get('/', (req, res) => render(req, res, { title: 'JB Hi-Fi | Always Cheap Prices', body: P.homePage({ base: res.locals.base, products: PRODUCTS }) }))

// Real URL: /search?query=grand+theft+auto+vi (also accept ?q= in case an agent guesses it).
router.get('/search', (req, res) => {
  const q = str(req.query.query) || str(req.query.q)
  const self = `${res.locals.base}/search?query=${encodeURIComponent(q).replaceAll('%20', '+')}`
  render(req, res, { title: `Search results: '${q}' | JB Hi-Fi`, body: P.searchPage({ base: res.locals.base, q, products: search(q), self }) })
})

router.get('/products/:slug', (req, res) => {
  const base = res.locals.base
  const p = bySlug(req.params.slug) ?? byId(req.params.slug)
  if (!p) return notFound(req, res)
  if (p.slug !== req.params.slug) return res.redirect(productPath(base, p))
  const perks = !req.store.perksSeen && !req.query.added // JB Perks popup on the first product page visit only
  req.store.perksSeen = true
  const availability = str(req.query.availability) || null
  // ASSUMPTION: only the PS5 page title was captured; the Xbox title follows the same pattern.
  const title = p.kind === 'game' ? `${p.title} Standard Edition on ${p.platform === 'ps5' ? 'PS5' : 'Xbox Series X'} - Pre-Order Now - JB Hi-Fi` : `${p.title} | JB Hi-Fi`
  const stores = availability ? findStores(availability === 'my location' ? '' : availability) : []
  render(req, res, { title, body: P.productPage({ base, p, siblings: games(), availability, stores, perks }) })
})

router.get('/stores', (req, res) => render(req, res, { title: 'Store Finder | JB Hi-Fi', body: P.storesPage({ base: res.locals.base, query: str(req.query.q), stores: findStores(req.query.q) }) }))

// Hearts link here. Guests get "You're one step away from having this in your wishlist!".
router.get('/wishlist/add', (req, res) => {
  const p = byId(req.query.id)
  if (!p) return notFound(req, res)
  if (req.store.user) req.store.wishlist = [...new Set([...(req.store.wishlist ?? []), p.id])]
  render(req, res, { title: 'Wishlist | JB Hi-Fi', body: P.wishlistPage({ base: res.locals.base, p, user: req.store.user }) })
})

// ---- cart ----
router.post('/cart/add', (req, res) => {
  const base = res.locals.base
  const p = byId(req.body.id)
  if (!p) return res.redirect(`${base}/`)
  const back = new URL(safeReturn(base, req.body.return, productPath(base, p)), 'http://jb.local')
  back.searchParams.delete('added')
  if (p.orderable) {
    // Shopify merges the same product into one line.
    const line = req.store.cart.find(l => l.pid === p.id)
    if (line) line.qty = Math.min(MAX_QTY, line.qty + 1)
    else req.store.cart.push({ pid: p.id, qty: 1 })
    back.searchParams.set('added', p.id)
  }
  res.redirect(back.pathname + back.search)
})

router.get('/cart', (req, res) => {
  // ASSUMPTION: coupon wording not observed (codes are JB Perks coupons; none exist here).
  const couponError = { empty: 'Please enter a coupon code.', invalid: 'Sorry, this coupon code is invalid or has expired.' }[req.query.coupon] ?? null
  render(req, res, { title: 'Your Shopping Cart', body: P.cartPage({ base: res.locals.base, t: totals(req.store), couponError }) })
})

router.post('/cart/update', (req, res) => {
  const line = req.store.cart.find(l => l.pid === String(req.body.id))
  if (line) {
    if (req.body.action === 'remove') req.store.cart = req.store.cart.filter(l => l !== line)
    else { const q = Number(req.body.qty); if (Number.isInteger(q) && q >= 1 && q <= MAX_QTY) line.qty = q }
  }
  res.redirect(`${res.locals.base}/cart`)
})

router.post('/cart/coupon', (req, res) => res.redirect(`${res.locals.base}/cart?coupon=${str(req.body.code) ? 'invalid' : 'empty'}`))

// ---- account (optional: checkout never asks for it) ----
// ASSUMPTION: the login page (auth.jbhifi.com.au) was not opened; Email + Password with the usual Auth0-style error.
router.get('/account/login', (req, res) => render(req, res, { title: 'Log in | JB Hi-Fi', body: P.loginPage({ base: res.locals.base, returnTo: safeReturn(res.locals.base, req.query.return_to, '') }) }))
router.post('/account/login', (req, res) => {
  const base = res.locals.base
  const returnTo = safeReturn(base, req.body.return_to, '')
  const acct = authenticate(req.storeSlug, str(req.body.email), req.body.password)
  if (!acct) return render(req, res, { title: 'Log in | JB Hi-Fi', status: 401, body: P.loginPage({ base, email: str(req.body.email), returnTo, error: 'Wrong email or password.' }) })
  req.store.user = publicAccount(acct)
  res.redirect(returnTo || `${base}/account`)
})
router.get('/account/logout', (req, res) => { req.store.user = null; req.store.checkout = {}; res.redirect(`${res.locals.base}/`) })

router.get('/account/register', (req, res) => render(req, res, { title: 'Create account | JB Hi-Fi', body: P.registerPage({ base: res.locals.base }) }))
router.post('/account/register', (req, res) => {
  const base = res.locals.base
  const v = pick(req.body, ['email', 'first_name', 'last_name', 'phone'])
  const password = typeof req.body.password === 'string' ? req.body.password : ''
  const errors = {}
  if (!EMAIL.test(str(v.email))) errors.email = 'Enter a valid email address.'
  if (password.length < 8) errors.password = 'Your password must be at least 8 characters.'
  if (!str(v.first_name)) errors.first_name = 'Enter your first name.'
  if (!str(v.last_name)) errors.last_name = 'Enter your last name.'
  if (str(v.phone) && phoneError(v.phone)) errors.phone = 'Enter a valid Australian mobile number.'
  if (!Object.keys(errors).length) {
    const acct = createAccount(req.storeSlug, { email: str(v.email), password, first_name: str(v.first_name), last_name: str(v.last_name), phone: str(v.phone) })
    if (!acct.error) { req.store.user = publicAccount(acct); return res.redirect(`${base}/account`) }
    errors.email = acct.error
  }
  render(req, res, { title: 'Create account | JB Hi-Fi', status: 400, body: P.registerPage({ base, values: v, errors }) })
})

router.get('/account', (req, res) => {
  const base = res.locals.base, user = req.store.user
  if (!user) return res.redirect(`${base}/account/login?return_to=${encodeURIComponent(`${base}/account`)}`)
  const orders = listOrders({ store: req.storeSlug }).filter(o => o.customer.email === user.email)
  render(req, res, { title: 'My account | JB Hi-Fi', body: P.accountPage({ base, user, orders }) })
})

// Header "Track order": logged-in shoppers see their orders; guests look one up by order number + email.
router.get('/account/orders', (req, res) => {
  if (req.store.user) return res.redirect(`${res.locals.base}/account`)
  render(req, res, { title: 'Track your order | JB Hi-Fi', body: P.trackOrderPage({ base: res.locals.base }) })
})
router.post('/account/orders', (req, res) => {
  const values = { order_number: str(req.body.order_number).replace(/^#/, ''), email: str(req.body.email).toLowerCase() }
  const o = values.order_number ? getOrder(values.order_number) : null
  const order = o && o.store === req.storeSlug && o.order_number === values.order_number && o.customer.email === values.email ? o : null
  const error = order ? null : 'We couldn’t find an order with those details. Check your order number and email.'
  render(req, res, { title: 'Track your order | JB Hi-Fi', status: order ? 200 : 404, body: P.trackOrderPage({ base: res.locals.base, values, order, error }) })
})

// ---- checkout: Shopify on the JB domain, guest-first, no sign-in screen ----
// Real URLs: /checkouts/cn/<token>/en-us/information → …/shipping → …/payment (research step 5).
const STEP = '/checkouts/cn/:token/en-us'
function checkoutUrls(base, token) {
  const root = `${base}/checkouts/cn/${token}/en-us`
  return { root, information: `${root}/information`, shipping: `${root}/shipping`, payment: `${root}/payment`, cart: `${base}/cart`, logout: `${base}/account/logout` }
}

// Breadcrumb "Cart › Customer and Shipping Information › Shipping › Payment"; steps already done are links.
function crumbs(req, res, current) {
  const u = res.locals.urls, order = ['information', 'shipping', 'payment']
  const pickup = req.store.checkout.info?.method === 'pickup'
  return {
    current,
    steps: [{ id: 'cart', label: 'Cart', href: u.cart },
      ...[['information', 'Customer and Shipping Information'], ['shipping', 'Shipping'], ['payment', 'Payment']].map(([id, label]) =>
        ({ id, label, href: order.indexOf(id) < order.indexOf(current) && !(pickup && id === 'shipping') ? u[id] : null }))],
  }
}

function startCheckout(req, res) {
  const base = res.locals.base
  if (!req.store.cart.length) return res.redirect(`${base}/cart`)
  req.store.checkout.token ??= randomBytes(16).toString('hex')
  res.redirect(checkoutUrls(base, req.store.checkout.token).information)
}
router.get('/checkout', startCheckout) // "Checkout" link in the add-to-cart modal
router.post('/checkout', startCheckout) // "Checkout" button on the cart page

// Every step needs a cart and this visitor's own checkout token.
function checkoutStep(req, res, next) {
  const base = res.locals.base
  if (!req.store.cart.length) return res.redirect(`${base}/cart`)
  if (!req.store.checkout.token || req.params.token !== req.store.checkout.token) return res.redirect(`${base}/checkout`)
  res.locals.urls = checkoutUrls(base, req.params.token)
  next()
}
const needsInfo = (req, res, next) => (req.store.checkout.info ? next() : res.redirect(res.locals.urls.information))
const needsShipping = (req, res, next) => {
  const co = req.store.checkout
  return co.info.method === 'pickup' || SHIPPING_METHODS[co.shipping_method] ? next() : res.redirect(res.locals.urls.shipping)
}

// ASSUMPTION: no JB discount codes are known, so every code gets Shopify's refusal.
const DISCOUNT_ERROR = 'Enter a valid discount code or gift card'

// Shopify-style messages (not observed on JB; its checkout is stock Shopify).
function addressErrors(v, prefix = '') {
  const k = (n) => (prefix ? `${prefix}_${n}` : n)
  const e = {}
  if (!str(v[k('first_name')])) e[k('first_name')] = 'Enter a first name'
  if (!str(v[k('last_name')])) e[k('last_name')] = 'Enter a last name'
  if (!str(v[k('address1')])) e[k('address1')] = 'Enter an address'
  if (!str(v[k('suburb')])) e[k('suburb')] = 'Enter a suburb'
  const state = str(v[k('state')]), pc = str(v[k('postcode')])
  if (!STATES.some(([c]) => c === state)) e[k('state')] = 'Select a state / territory'
  if (!pc) e[k('postcode')] = 'Enter a postcode'
  else if (!/^\d{4}$/.test(pc)) e[k('postcode')] = 'Enter a valid postcode'
  else if (!e[k('state')] && postcodeState(pc) !== state) e[k('postcode')] = `Enter a valid postcode for ${stateName(state)}`
  return e
}
function addressFrom(v, prefix = '') {
  const k = (n) => (prefix ? `${prefix}_${n}` : n)
  return { first_name: str(v[k('first_name')]), last_name: str(v[k('last_name')]), company: str(v[k('company')]) || null, line1: str(v[k('address1')]), line2: str(v[k('address2')]) || null, city: str(v[k('suburb')]), state: str(v[k('state')]), postal_code: str(v[k('postcode')]), country: 'AU' }
}
// Australian numbers: 0412 345 678, +61 412 345 678, 02 9876 5432 …
function phoneError(value) {
  const d = str(value).replace(/[\s().-]/g, '')
  if (!d) return 'Enter a mobile phone number'
  return /^(\+?61|0)[2-478]\d{8}$/.test(d) ? null : 'Enter a valid phone number'
}

// -- step 1: Customer and Shipping Information --
const INFO_KEYS = ['email', 'newsletter', 'delivery_method', 'first_name', 'last_name', 'company', 'address1', 'address2', 'suburb', 'state', 'postcode', 'phone', 'save_info', 'store_query', 'store_id', 'pickup_first_name', 'pickup_last_name', 'pickup_phone', 'point_query', 'discount_code']

function renderInformation(req, res, values, { errors = {}, discountError = null, pointSearched = false } = {}) {
  render(req, res, {
    title: 'Customer and Shipping Information - JB Hi-Fi - Checkout',
    status: Object.keys(errors).length || discountError ? 400 : 200,
    checkout: crumbs(req, res, 'information'),
    body: P.informationPage({ urls: res.locals.urls, t: totals(req.store), values, errors, stores: findStores(values.store_query), storeQuery: values.store_query ?? '', pointQuery: pointSearched ? (values.point_query ?? '') : null, user: req.store.user, discountError }),
  })
}

router.get(`${STEP}/information`, checkoutStep, (req, res) => {
  const values = { ...(req.store.checkout.infoValues ?? {}) }
  const user = req.store.user
  if (user) {
    values.email ||= user.email
    values.first_name ??= user.first_name; values.last_name ??= user.last_name
    values.pickup_first_name ??= user.first_name; values.pickup_last_name ??= user.last_name
  }
  renderInformation(req, res, values)
})

router.post(`${STEP}/information`, checkoutStep, (req, res) => {
  const co = req.store.checkout, b = req.body
  const v = pick(b, INFO_KEYS)
  const method = ['delivery', 'pickup', 'collection_point'].includes(v.delivery_method) ? v.delivery_method : 'delivery'
  v.delivery_method = method
  if (b.apply_discount) return renderInformation(req, res, v, { discountError: DISCOUNT_ERROR })
  // "Use my location" / "Find stores" / "Search" only refresh the finder of the chosen delivery method.
  if (method === 'pickup' && (b.use_location || b.find_stores)) return renderInformation(req, res, v)
  // ASSUMPTION: the collection-point search was never run in research; here it finds nothing for this pre-order.
  if (method === 'collection_point' && (b.use_location_point || b.find_points)) return renderInformation(req, res, v, { pointSearched: true })

  const errors = {}
  const email = str(v.email)
  if (!email) errors.email = 'Enter an email'
  else if (!EMAIL.test(email)) errors.email = 'Enter a valid email'
  if (method === 'delivery') {
    Object.assign(errors, addressErrors(v))
    const pe = phoneError(v.phone)
    if (pe) errors.phone = pe
  } else if (method === 'pickup') {
    // The real "Continue to shipping" stays disabled until a store is picked.
    if (!storeById(str(v.store_id))) errors.store_id = 'Choose a pickup location'
    if (!str(v.pickup_first_name)) errors.pickup_first_name = 'Enter a first name'
    if (!str(v.pickup_last_name)) errors.pickup_last_name = 'Enter a last name'
    const pe = phoneError(v.pickup_phone)
    if (pe) errors.pickup_phone = pe
  } else {
    errors.collection_point = 'No collection points available with your item. Choose Delivery or Click & Collect.'
  }
  if (Object.keys(errors).length) return renderInformation(req, res, v, { errors })

  delete v.discount_code
  co.infoValues = v
  co.info = method === 'pickup'
    ? { method, email: email.toLowerCase(), newsletter: v.newsletter === '1', store_id: str(v.store_id), contact: { first_name: str(v.pickup_first_name), last_name: str(v.pickup_last_name), phone: str(v.pickup_phone) } }
    : { method, email: email.toLowerCase(), newsletter: v.newsletter === '1', phone: str(v.phone), address: addressFrom(v) }
  // ASSUMPTION: like Shopify local pickup, Click & Collect has no shipping step and goes straight to Payment.
  res.redirect(method === 'pickup' ? res.locals.urls.payment : res.locals.urls.shipping)
})

// -- step 2: Shipping (Delivery only) --
function renderShipping(req, res, values, { errors = {}, discountError = null } = {}) {
  render(req, res, {
    title: 'Shipping - JB Hi-Fi - Checkout',
    status: Object.keys(errors).length || discountError ? 400 : 200,
    checkout: crumbs(req, res, 'shipping'),
    body: P.shippingPage({ urls: res.locals.urls, t: totals(req.store, values.shipping_method), info: req.store.checkout.info, values, errors, discountError }),
  })
}

router.get(`${STEP}/shipping`, checkoutStep, needsInfo, (req, res) => {
  const co = req.store.checkout
  if (co.info.method === 'pickup') return res.redirect(res.locals.urls.payment)
  renderShipping(req, res, { shipping_method: co.shipping_method ?? 'standard' })
})

router.post(`${STEP}/shipping`, checkoutStep, needsInfo, (req, res) => {
  const co = req.store.checkout
  if (co.info.method === 'pickup') return res.redirect(res.locals.urls.payment)
  const v = { shipping_method: str(req.body.shipping_method) || 'standard', discount_code: str(req.body.discount_code) }
  if (req.body.apply_discount) return renderShipping(req, res, v, { discountError: DISCOUNT_ERROR })
  if (!SHIPPING_METHODS[v.shipping_method]) {
    // JB help: pre-orders are not eligible for Courier Delivery.
    const msg = v.shipping_method === COURIER_METHOD.id ? `${COURIER_METHOD.name} is not available for pre-order items` : 'Choose a shipping method'
    return renderShipping(req, res, { ...v, shipping_method: 'standard' }, { errors: { shipping_method: msg } })
  }
  co.shipping_method = v.shipping_method
  res.redirect(res.locals.urls.payment)
})

// -- step 3: Payment ("Pay now" places the order; pre-orders are paid in full) --
const PAYMENT_METHODS = ['card', 'paypal', 'afterpay', 'zip', 'latitude', 'giftcard']
// Kept on a re-render. The card number, security code and gift card number/PIN are never echoed back.
const PAY_KEYS = ['card_expiry', 'card_name', 'billing_first_name', 'billing_last_name', 'billing_company', 'billing_address1', 'billing_address2', 'billing_suburb', 'billing_state', 'billing_postcode', 'discount_code']

function renderPayment(req, res, values, { errors = {}, discountError = null } = {}) {
  const co = req.store.checkout, pickup = co.info.method === 'pickup'
  render(req, res, {
    title: 'Payment - JB Hi-Fi - Checkout',
    status: Object.keys(errors).length || discountError ? 400 : 200,
    checkout: crumbs(req, res, 'payment'),
    body: P.paymentPage({ urls: res.locals.urls, t: totals(req.store, pickup ? null : co.shipping_method), info: co.info, shipping: pickup ? null : SHIPPING_METHODS[co.shipping_method], pickupStore: pickup ? storeById(co.info.store_id) : null, values, errors, discountError }),
  })
}

router.get(`${STEP}/payment`, checkoutStep, needsInfo, needsShipping, (req, res) => {
  const info = req.store.checkout.info
  renderPayment(req, res, info.method === 'pickup' ? { billing_first_name: info.contact.first_name, billing_last_name: info.contact.last_name } : {})
})

router.post(`${STEP}/payment`, checkoutStep, needsInfo, needsShipping, (req, res) => {
  const co = req.store.checkout, b = req.body
  const pickup = co.info.method === 'pickup'
  const pm = PAYMENT_METHODS.includes(b.payment_method) ? b.payment_method : 'card'
  // Click & Collect has no shipping address, so the billing address is always entered.
  const billingMode = pickup || b.billing === 'different' ? 'different' : 'same'
  const values = { ...pick(b, PAY_KEYS), payment_method: pm, billing: billingMode }
  if (b.apply_discount) return renderPayment(req, res, values, { discountError: DISCOUNT_ERROR })

  const errors = {}
  let payment = { method: pm }
  if (pm === 'card') {
    // Shopify's expiry box formats "1229" as "12 / 29".
    const card = validateCard({ number: b.card_number, expiry: str(b.card_expiry).replace(/^(\d{2})\s*(\d{2})$/, '$1/$2'), cvv: b.card_cvv })
    if (!card.ok) {
      if (card.errors.number) errors.card_number = 'Enter a valid card number'
      if (card.errors.expiry) errors.card_expiry = card.errors.expiry === 'This card has expired.' ? 'This card has expired' : 'Enter a valid expiration date'
      if (card.errors.cvv) errors.card_cvv = 'Enter the CVV or security code on your card'
    }
    if (!str(b.card_name)) errors.card_name = 'Enter your name exactly as it’s written on your card'
    if (card.ok) payment = { method: 'card', brand: card.brand, last4: card.last4, name_on_card: str(b.card_name) }
  } else if (pm === 'giftcard') {
    // ASSUMPTION: no JB gift cards exist in this clone, so every gift card is declined.
    errors.gift_card_number = str(b.gift_card_number) ? 'This gift card is invalid or has no balance remaining' : 'Enter a gift card number'
  }
  if (billingMode === 'different') Object.assign(errors, addressErrors(b, 'billing'))
  if (Object.keys(errors).length) return renderPayment(req, res, values, { errors })

  const info = co.info
  const t = totals(req.store, pickup ? null : co.shipping_method)
  const game = t.lines.map(l => l.product).find(p => p.kind === 'game')
  const store = pickup ? storeById(info.store_id) : null
  const ship = pickup ? null : SHIPPING_METHODS[co.shipping_method]
  const person = pickup ? info.contact : info.address
  const order = recordOrder({
    store: req.storeSlug,
    order_number: orderNumber(),
    session: req.session,
    items: t.lines.map(({ product: p, qty }) => p.kind === 'game'
      ? { platform: p.platform, edition: p.edition, format: p.format, qty, unit_price: p.price, title: p.title, sku: p.id }
      : { kind: 'other', title: p.title, qty, unit_price: p.price, sku: p.id }),
    customer: { email: info.email, first_name: person.first_name, last_name: person.last_name, phone: pickup ? info.contact.phone : info.phone, account_id: req.store.user?.id ?? null, guest: !req.store.user },
    fulfillment: pickup
      ? { method: 'pickup', option: 'click_and_collect', store_id: store.id, store_location: store.name, store_address: store.address, ready_from: game?.preloadFrom ?? null }
      : { method: 'ship', option: ship.id, option_name: ship.name, carrier: ship.carrier, eta: ship.eta },
    shipping_address: pickup ? null : { ...info.address, phone: info.phone },
    billing_address: billingMode === 'different' ? addressFrom(b, 'billing') : { ...info.address },
    payment,
    totals: { subtotal: t.subtotal, shipping: t.shipping, tax: 0, total: t.total }, // prices include GST: no tax line
    currency: 'AUD',
    meta: { token: co.token, gst_included: round(t.total / 11), charged: 'in full at order', newsletter: info.newsletter, release: game?.releaseLong ?? null, preload_from: game?.preloadFrom ?? null },
  })
  req.store.cart = []
  req.store.checkout = {}
  res.redirect(`${res.locals.urls.root}/thank-you?order=${order.order_number}`)
})

// Thank-you page, found by order number + checkout token (still works after a refresh).
router.get(`${STEP}/thank-you`, (req, res) => {
  const order = getOrder(str(req.query.order))
  if (!order || order.store !== req.storeSlug || order.meta?.token !== req.params.token) return notFound(req, res)
  render(req, res, { title: 'Thank you for your purchase! - JB Hi-Fi - Checkout', checkout: { steps: [] }, body: P.thankYouPage({ base: res.locals.base, order }) })
})

router.use(notFound)

export default {
  slug: 'jb-hifi',
  name: NAME,
  country: 'AU',
  currency: 'AUD',
  description: 'AU. Code-in-box PS5/Xbox at $129, full-screen add-to-cart modal, guest-first Shopify checkout (information → shipping → payment) with Delivery or Click & Collect.',
  router,
}
