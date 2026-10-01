import { Router } from 'express'
import { randomBytes, randomInt } from 'node:crypto'
import { recordOrder, getOrder, listOrders } from '../../lib/orders.js'
import { validateCard } from '../../lib/payment.js'
import { authenticate, createAccount, findAccount, publicAccount } from '../../lib/accounts.js'
import { PRODUCTS, byId, bySlug, search, sortProducts, SORTS, totals, hasPreorder, productPath, DELIVERY_METHODS, COLLECT_STORES, TITLES, MAX_QTY } from './data.js'
import * as P from './pages.js'

const NAME = 'GAME'
const router = Router()

// ---- helpers ----
function render(req, res, { title, body, status = 200, mode = 'full', flyoutOpen = false, closeHref = '', q = '' }) {
  res.status(status).type('html').send(P.layout({
    base: res.locals.base, title, body, t: totals(req.store), user: req.store.user, mode,
    cookieChoice: req.store.cookieChoice ?? null, flyoutOpen, closeHref, q, back: req.originalUrl,
  }))
}
// ASSUMPTION: GAME does not publish its order-number format (no order was placed during research);
// a plausible 9-digit number stands in for it.
const orderNumber = () => String(randomInt(100000000, 1000000000))
const clampQty = (n) => Math.min(MAX_QTY, Math.max(1, parseInt(n, 10) || 1))
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
const checkoutEmail = (req) => req.store.user?.email ?? req.store.checkout.email ?? ''
// Only ever redirect inside this store (returnUrl comes from the query string / form).
function safeReturn(base, u) {
  const s = String(u ?? '')
  if (!s.startsWith('/') || s.startsWith('//')) return `${base}/account`
  return s === base || s.startsWith(`${base}/`) ? s : `${base}${s}`
}
const notFound = (req, res) => render(req, res, { title: 'Sorry – This Page Could Not Be Found | GAME', status: 404, body: P.notFoundPage({ base: res.locals.base }) })

// ---- browse ----
router.get('/', (req, res) => render(req, res, { title: 'GAME | Gaming Specialist For Consoles, Games & Accessories!', body: P.homePage({ base: res.locals.base, products: PRODUCTS }) }))

// The working search URL on game.co.uk is /searchresults?descriptionfilter=...; /search?q= is a 404 there too (it falls through to the product route below).
router.get('/searchresults', (req, res) => {
  const q = String(req.query.descriptionfilter ?? '')
  const filters = { platform: req.query.platform ? String(req.query.platform) : null, category: req.query.category ? String(req.query.category) : null }
  const sort = SORTS.some(s => s.key === req.query.sort) ? String(req.query.sort) : 'popular'
  const hideFilters = req.query.hidefilters === '1'
  render(req, res, { title: 'Search Results | GAME', q, body: P.searchPage({ base: res.locals.base, q, products: sortProducts(search(q, filters), sort), filters, sort, hideFilters }) })
})

router.get('/stores', (req, res) => render(req, res, { title: 'Store Finder | GAME', body: P.storesPage({ base: res.locals.base }) }))
router.get('/contact', (req, res) => render(req, res, { title: 'Contact Us | GAME', body: P.simplePage({ title: 'Contact Us', html: '<p>Visit the GAME help centre for delivery, order and pre-order questions, or use the live chat and contact form there.</p>' }) }))
router.get('/frasersplus', (req, res) => render(req, res, { title: 'Frasers Plus | GAME', body: P.simplePage({ title: 'Frasers Plus', html: '<p>Buy now. Pay later. Earn rewards. Spread the cost with Frasers Plus: Buy now, Pay in 3, interest free.</p><p class="gu-fine">Representative APR 29.9% (Variable). Credit subject to status. 18+, UK residents only. Terms apply.</p>' }) }))

router.get('/wishlist', (req, res) => render(req, res, { title: 'My Wish List | GAME', body: P.wishlistPage({ base: res.locals.base, products: (req.store.wishlist ?? []).map(byId).filter(Boolean) }) }))
router.post('/wishlist/add', (req, res) => {
  const base = res.locals.base
  const p = byId(req.body.pid)
  if (!p) return res.redirect(`${base}/`)
  req.store.wishlist ??= []
  if (!req.store.wishlist.includes(p.id)) req.store.wishlist.push(p.id)
  const back = String(req.body.back ?? '')
  const dest = back.startsWith(`${base}/`) ? back : productPath(base, p)
  res.redirect(`${dest}${dest.includes('?') ? '&' : '?'}wished=1`)
})

// OneTrust-style cookie banner: "Manage cookies" / "Reject all" / "Allow all" (shown until a choice is made).
router.post('/cookies', (req, res) => {
  const base = res.locals.base
  req.store.cookieChoice = ['allow', 'reject', 'manage'].includes(req.body.choice) ? req.body.choice : 'reject'
  const back = String(req.body.back ?? '')
  res.redirect(back === base || back.startsWith(`${base}/`) ? back : `${base}/`)
})

// ---- bag ----
router.get('/cart', (req, res) => render(req, res, { title: 'GAME > Cart', body: P.cartPage({ base: res.locals.base, t: totals(req.store), notice: req.query.notice ? String(req.query.notice) : null }) }))

router.post('/cart/add', (req, res) => {
  const base = res.locals.base
  const p = byId(req.body.pid)
  if (!p) return res.redirect(`${base}/`)
  const qty = clampQty(req.body.qty)
  // The PEGI-18 "Age Verification" gate is enforced here, not only in the modal markup:
  // without "I'm Old Enough" the bag does not accept the item.
  if (p.pegi && req.body.age_confirmed !== '1') return res.redirect(`${productPath(base, p)}?agecheck=1&qty=${qty}`)
  const existing = req.store.cart.find(l => l.pid === p.id)
  if (existing) existing.qty = Math.min(MAX_QTY, existing.qty + qty)
  else { req.store.cartSeq = (req.store.cartSeq ?? 0) + 1; req.store.cart.push({ line: req.store.cartSeq, pid: p.id, qty }) }
  res.redirect(`${productPath(base, p)}?added=1`)
})

router.post('/cart/update', (req, res) => {
  const base = res.locals.base
  const line = Number(req.body.line)
  const action = String(req.body.action ?? '')
  const item = req.store.cart.find(l => l.line === line)
  let notice = ''
  if (item) {
    if (action === 'inc') item.qty = Math.min(MAX_QTY, item.qty + 1)
    else if (action === 'dec') item.qty = Math.max(1, item.qty - 1)
    else if (action === 'remove' || action === 'wishlist') {
      req.store.cart = req.store.cart.filter(l => l.line !== line)
      if (action === 'wishlist') { req.store.wishlist ??= []; if (!req.store.wishlist.includes(item.pid)) req.store.wishlist.push(item.pid); notice = 'Moved to your wish list.' }
    }
  }
  res.redirect(`${base}/cart${notice ? `?notice=${encodeURIComponent(notice)}` : ''}`)
})

// ---- sign in or register (the real site hands off to auth.game.co.uk; email first, then password / register / guest) ----
router.get('/login', (req, res) => {
  const ret = req.query.returnurl ? `/${String(req.query.returnurl).replace(/^\/+/, '')}` : '/account'
  res.redirect(`${res.locals.base}/account/login?returnUrl=${encodeURIComponent(ret)}`)
})

router.get('/account/login', (req, res) => {
  const base = res.locals.base
  const returnUrl = String(req.query.returnUrl ?? '/account')
  const email = req.store.checkout.authEmail
  if (req.query.step === 'password' && email && findAccount(req.storeSlug, email)) return render(req, res, { title: 'Sign in | GAME', mode: 'auth', body: P.authPasswordPage({ base, returnUrl, email }) })
  if (req.query.step === 'register' && email) return render(req, res, { title: 'Register | GAME', mode: 'auth', body: P.authRegisterPage({ base, returnUrl, email }) })
  render(req, res, { title: 'Sign in or register | GAME', mode: 'auth', body: P.authEmailPage({ base, returnUrl }) })
})

router.post('/account/login', (req, res) => {
  const base = res.locals.base
  const returnUrl = String(req.body.returnUrl || '/account')
  const dest = safeReturn(base, returnUrl)
  const action = String(req.body.action ?? 'email')
  const email = String(req.body.email || req.store.checkout.authEmail || '').trim().toLowerCase()
  if (!EMAIL_RE.test(email)) return render(req, res, { title: 'Sign in or register | GAME', mode: 'auth', status: 400, body: P.authEmailPage({ base, returnUrl, email: req.body.email ?? '', error: 'Enter a valid email address.' }) })
  if (action === 'email') {
    req.store.checkout.authEmail = email
    return res.redirect(`${base}/account/login?step=${findAccount(req.storeSlug, email) ? 'password' : 'register'}&returnUrl=${encodeURIComponent(returnUrl)}`)
  }
  if (action === 'guest') {
    req.store.user = null
    req.store.checkout.guest = true
    req.store.checkout.email = email
    return res.redirect(dest)
  }
  if (action === 'register') {
    const v = req.body, errors = {}
    for (const [k, msg] of [['firstName', 'Enter your first name.'], ['lastName', 'Enter your last name.'], ['password', 'Enter a password.']]) if (!String(v[k] ?? '').trim()) errors[k] = msg
    if (v.password && v.password.length < 8) errors.password = 'Your password must be at least 8 characters.'
    if (!Object.keys(errors).length) {
      const acct = createAccount(req.storeSlug, { email, password: v.password, first_name: v.firstName.trim(), last_name: v.lastName.trim(), marketing: v.marketing === '1' })
      if (acct.error) return res.redirect(`${base}/account/login?step=password&returnUrl=${encodeURIComponent(returnUrl)}`)
      req.store.user = publicAccount(acct)
      req.store.checkout.guest = false
      req.store.checkout.email = acct.email
      return res.redirect(dest)
    }
    return render(req, res, { title: 'Register | GAME', mode: 'auth', status: 400, body: P.authRegisterPage({ base, returnUrl, email, values: { ...v, password: '' }, errors }) })
  }
  // action === 'signin'
  const acct = authenticate(req.storeSlug, email, req.body.password)
  if (!acct) return render(req, res, { title: 'Sign in | GAME', mode: 'auth', status: 401, body: P.authPasswordPage({ base, returnUrl, email, error: 'The password you entered is incorrect. Please try again.' }) })
  req.store.user = publicAccount(acct)
  req.store.checkout.guest = false
  req.store.checkout.email = acct.email
  res.redirect(dest)
})

router.get('/logout', (req, res) => { req.store.user = null; req.store.checkout = {}; res.redirect(`${res.locals.base}/`) })

router.get('/account', (req, res) => {
  if (!req.store.user) return res.redirect(`${res.locals.base}/account/login?returnUrl=%2Faccount`)
  const orders = listOrders({ store: req.storeSlug }).filter(o => o.customer.email === req.store.user.email)
  render(req, res, { title: 'My Account | GAME', body: P.accountPage({ base: res.locals.base, user: req.store.user, orders }) })
})

// ---- checkout: Delivery -> Payment -> Thank you (no separate review step) ----
// ASSUMPTION: the real checkout lives at a single /checkout URL; the delivery and payment steps
// were not reached in research, so they are modelled as /checkout/delivery and /checkout/payment.
function checkoutGuard(req, res) {
  const base = res.locals.base
  if (!req.store.cart.length) { res.redirect(`${base}/cart`); return false }
  if (!req.store.user && !req.store.checkout.guest) { res.redirect(`${base}/account/login?returnUrl=%2Fcheckout`); return false }
  return true
}
router.post('/checkout/start', (req, res) => { if (checkoutGuard(req, res)) res.redirect(`${res.locals.base}/checkout/delivery`) })
router.get('/checkout', (req, res) => { if (checkoutGuard(req, res)) res.redirect(`${res.locals.base}/checkout/delivery`) })

router.get('/checkout/delivery', (req, res) => {
  if (!checkoutGuard(req, res)) return
  const values = { ...(req.store.checkout.delivery ?? {}) }
  if (req.store.user) { values.firstName ??= req.store.user.first_name; values.lastName ??= req.store.user.last_name; values.mobile ??= req.store.user.phone }
  render(req, res, { title: 'Checkout - Delivery | GAME', mode: 'checkout', body: P.deliveryPage({ base: res.locals.base, t: totals(req.store), email: checkoutEmail(req), guest: !req.store.user, preorderInBag: hasPreorder(req.store), values }) })
})

router.post('/checkout/delivery', (req, res) => {
  if (!checkoutGuard(req, res)) return
  const base = res.locals.base
  const v = req.body, errors = {}
  const str = (k) => String(v[k] ?? '').trim()
  for (const [k, msg] of [['firstName', 'Enter your first name.'], ['lastName', 'Enter your last name.'], ['addressLine1', 'Enter the first line of your address.'], ['town', 'Enter your town or city.'], ['postcode', 'Enter your postcode.'], ['mobile', 'Enter your mobile number.']]) if (!str(k)) errors[k] = msg
  if (str('postcode') && !/^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i.test(str('postcode'))) errors.postcode = 'Enter a valid UK postcode.'
  if (str('mobile') && !/^\d{10,13}$/.test(str('mobile').replace(/\D/g, ''))) errors.mobile = 'Enter a valid mobile number.'
  if (str('title') && !TITLES.includes(str('title'))) errors.title = 'Select a title.'
  const preorder = hasPreorder(req.store)
  const method = DELIVERY_METHODS[v.deliveryMethod] ? String(v.deliveryMethod) : null
  if (!method) errors.deliveryMethod = 'Select a delivery method.'
  else if (method === 'collect') {
    if (preorder) errors.deliveryMethod = 'Click & Collect is not available for pre-order items. Please choose a home delivery option.'
    else if (!COLLECT_STORES.includes(str('collectStore'))) errors.collectStore = 'Select a store to collect from.'
  }
  const values = {
    title: str('title'), firstName: str('firstName'), lastName: str('lastName'), addressLine1: str('addressLine1'), addressLine2: str('addressLine2'),
    town: str('town'), county: str('county'), postcode: str('postcode').toUpperCase().replace(/\s+/g, ' '), country: 'GB', mobile: str('mobile'),
    deliveryMethod: method ?? 'standard', collectStore: method === 'collect' ? str('collectStore') : '',
  }
  if (Object.keys(errors).length) {
    return render(req, res, { title: 'Checkout - Delivery | GAME', mode: 'checkout', status: 400, body: P.deliveryPage({ base, t: totals(req.store), email: checkoutEmail(req), guest: !req.store.user, preorderInBag: preorder, values: { ...values, postcode: str('postcode') }, errors }) })
  }
  req.store.checkout.delivery = values
  res.redirect(`${base}/checkout/payment`)
})

router.get('/checkout/payment', (req, res) => {
  if (!checkoutGuard(req, res)) return
  const d = req.store.checkout.delivery
  if (!d) return res.redirect(`${res.locals.base}/checkout/delivery`)
  render(req, res, { title: 'Checkout - Payment | GAME', mode: 'checkout', body: P.paymentPage({ base: res.locals.base, t: totals(req.store, d.deliveryMethod), delivery: d, preorderInBag: hasPreorder(req.store), values: req.store.checkout.payment ?? {} }) })
})

router.post('/checkout/payment', (req, res) => {
  if (!checkoutGuard(req, res)) return
  const base = res.locals.base
  const d = req.store.checkout.delivery
  if (!d) return res.redirect(`${base}/checkout/delivery`)
  const v = { ...req.body, billingSame: req.body.billingSame === '1' }
  const str = (k) => String(v[k] ?? '').trim()
  const errors = {}
  const preorder = hasPreorder(req.store)
  // PayPal is accepted in general but "pre-orders can't be paid with PayPal"; Apple Pay / Frasers Plus are display-only here.
  const allowed = preorder ? ['card'] : ['card', 'paypal']
  const pm = allowed.includes(v.paymentMethod) ? v.paymentMethod : null
  if (!pm) errors.paymentMethod = v.paymentMethod === 'paypal' ? 'PayPal is not available for pre-orders. Please pay by card.' : 'Select a payment method.'
  let payment = null
  if (pm === 'card') {
    const card = validateCard({ number: v.cardNumber, expiry: v.expiry, cvv: v.cvv })
    if (!card.ok) { if (card.errors.number) errors.cardNumber = card.errors.number; if (card.errors.expiry) errors.expiry = card.errors.expiry; if (card.errors.cvv) errors.cvv = card.errors.cvv }
    if (!str('nameOnCard')) errors.nameOnCard = 'Enter the name on the card.'
    if (card.ok) payment = { method: 'card', brand: card.brand, last4: card.last4, name_on_card: str('nameOnCard') }
  } else if (pm === 'paypal') payment = { method: 'paypal' }
  let billing
  if (v.billingSame) billing = { first_name: d.firstName, last_name: d.lastName, line1: d.addressLine1, line2: d.addressLine2 || null, city: d.town, state: d.county || '', postal_code: d.postcode, country: 'GB' }
  else {
    for (const [k, msg] of [['billingFirstName', 'Enter the billing first name.'], ['billingLastName', 'Enter the billing last name.'], ['billingAddressLine1', 'Enter the billing address.'], ['billingTown', 'Enter the billing town or city.'], ['billingPostcode', 'Enter the billing postcode.']]) if (!str(k)) errors[k] = msg
    billing = { first_name: str('billingFirstName'), last_name: str('billingLastName'), line1: str('billingAddressLine1'), line2: null, city: str('billingTown'), state: '', postal_code: str('billingPostcode').toUpperCase(), country: 'GB' }
  }
  if (str('giftCard')) errors.giftCard = 'We could not find a Gift Card, eVoucher or Credit Note with that code.'
  if (str('promoCode')) errors.promoCode = 'This promo code is not valid or cannot be used with the items in your bag.'

  const kept = { ...v, cardNumber: '', cvv: '' } // never echo the card number or CVV back
  req.store.checkout.payment = { paymentMethod: pm ?? 'card', billingSame: v.billingSame, nameOnCard: str('nameOnCard') }
  if (Object.keys(errors).length) {
    return render(req, res, { title: 'Checkout - Payment | GAME', mode: 'checkout', status: 400, body: P.paymentPage({ base, t: totals(req.store, d.deliveryMethod), delivery: d, preorderInBag: preorder, values: kept, errors }) })
  }

  const t = totals(req.store, d.deliveryMethod)
  const m = DELIVERY_METHODS[d.deliveryMethod]
  const token = randomBytes(12).toString('hex')
  const order = recordOrder({
    store: req.storeSlug,
    order_number: orderNumber(),
    session: req.session,
    items: t.lines.map(l => l.product.kind === 'game'
      ? { platform: l.product.platform, edition: l.product.edition, format: l.product.format, qty: l.qty, unit_price: l.product.price, title: l.product.title, sku: l.product.id }
      : { kind: 'other', title: l.product.title, qty: l.qty, unit_price: l.product.price, sku: l.product.id }),
    customer: { email: checkoutEmail(req), first_name: d.firstName, last_name: d.lastName, phone: d.mobile, account_id: req.store.user?.id ?? null, guest: !req.store.user },
    fulfillment: m.method === 'pickup'
      ? { method: 'pickup', option: 'collect', store_location: d.collectStore, eta: m.eta }
      : { method: 'ship', option: d.deliveryMethod, eta: m.eta },
    shipping_address: { title: d.title || null, first_name: d.firstName, last_name: d.lastName, line1: d.addressLine1, line2: d.addressLine2 || null, city: d.town, state: d.county || '', postal_code: d.postcode, country: 'GB', phone: d.mobile },
    billing_address: billing,
    payment,
    totals: { subtotal: t.subtotal, shipping: t.delivery, tax: 0, discount: 0, total: t.total }, // UK prices include VAT: no separate tax line
    currency: 'GBP',
    meta: { token, vat_included: true, preorder, charge_timing: 'authorised at order, debited at dispatch (day before launch for pre-orders)' },
  })
  req.store.cart = []
  req.store.checkout = {}
  res.redirect(`${base}/checkout/complete?orderNumber=${order.order_number}&token=${token}`)
})

router.get('/checkout/complete', (req, res) => {
  const order = getOrder(String(req.query.orderNumber ?? ''))
  if (!order || order.store !== req.storeSlug || order.meta.token !== req.query.token) return render(req, res, { title: 'Order not found | GAME', status: 404, body: P.simplePage({ title: 'Order not found', html: `<p>We couldn't find that order.</p><p><a class="gu-btn gu-btn-black" href="${res.locals.base}/">HOME</a></p>` }) })
  render(req, res, { title: 'Thank you for your order | GAME', body: P.completePage({ base: res.locals.base, order }) })
})

// ---- product pages: /{brand}-{name}-{6-digit code}  (anything else is the site's 404 page, including /search?q=) ----
router.get('/:slug', (req, res) => {
  const base = res.locals.base
  const p = bySlug(req.params.slug)
  if (!p) return notFound(req, res)
  if (req.params.slug !== p.slug) { const i = req.url.indexOf('?'); return res.redirect(`${productPath(base, p)}${i >= 0 ? req.url.slice(i) : ''}`) }
  const modal = req.query.preorder && p.preorder ? 'preorder' : req.query.agecheck && p.pegi ? 'age' : null
  const title = p.kind === 'game' ? 'Grand Theft Auto VI | Rockstar Games | GAME' : `${p.title} | ${p.brand} | GAME`
  render(req, res, { title, body: P.productPage({ base, p, modal, qty: clampQty(req.query.qty), wished: !!req.query.wished }), flyoutOpen: !!req.query.added, closeHref: productPath(base, p) })
})

export default {
  slug: 'game-uk',
  name: NAME,
  country: 'UK',
  currency: 'GBP',
  description: 'UK. Code-in-box PS5/Xbox at £69.99, two-modal add-to-bag (pre-order notice + PEGI-18 age gate), email-first sign in with guest option, Delivery → Payment, card authorised at order and charged at dispatch.',
  router,
}
