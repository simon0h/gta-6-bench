import { Router } from 'express'
import { randomBytes, randomInt } from 'node:crypto'
import { recordOrder, getOrder } from '../../lib/orders.js'
import { validateCard } from '../../lib/payment.js'
import { authenticate, createAccount, publicAccount } from '../../lib/accounts.js'
import { PRODUCTS, GAME, LISTINGS, byPath, byId, bySku, search, SORTS, sortProducts, lines, totals, SHIPPING_METHODS, COUNTRIES, MAX_QTY, XSOLLA_PROJECT } from './data.js'
import * as P from './pages.js'

const NAME = 'Rockstar Store'
const router = Router()

// ---- helpers ----
function render(req, res, title, body, status = 200, extra = {}) {
  res.status(status).type('html').send(P.layout({
    base: res.locals.base, title, body,
    cartCount: req.store.cart.reduce((n, l) => n + l.qty, 0),
    user: req.store.user,
    cookieBanner: !req.store.cookies,
    returnTo: req.originalUrl,
    searchQ: typeof req.query.q === 'string' ? req.query.q : '',
    ...extra,
  }))
}
const notFound = (req, res) => render(req, res, 'Page Not Found', P.simplePage({ title: 'Page Not Found', html: `<p>We can't find the page you're looking for.</p><a class="rs-btn rs-btn-primary" href="${res.locals.base}/">Back to Store</a>` }), 404)
const platformOf = (v) => (v === 'ps5' || v === 'xbox') ? v : null
// Xsolla transaction IDs are plain numbers (9-10 digits on receipts); no prefix.
const transactionId = () => String(randomInt(1_000_000_000, 9_999_999_999))

// The "pending checkout": the item(s) the shopper is buying right now. Set by Pre-Order Now / Buy Now (direct-to-checkout,
// no cart) or by PROCEED TO CHECKOUT on the merchandise cart. `source` is the page the modals and the lightbox sit over.
const pending = (store) => store.checkout.items?.length ? store.checkout : null
const startCheckout = (store, items, source) => { store.checkout = { items, source, guest: false } }
const withModal = (src, m) => `${src}${src.includes('?') ? '&' : '?'}modal=${m}`
// ASSUMPTION: the age gate is tied to 18+ products (GTA VI and the Ages 18+ collector's box) and, once passed, is remembered for the session.
const needsAgeGate = (store) => !store.ageVerified && lines(store.checkout.items).some(l => l.item.product.adult)
// COMING SOON items are pre-orders; Xsolla's address banner and the charge note differ for them ("...your pre-order." vs "...your order.").
const isPreorder = (co) => lines(co.items).some(l => l.item.product.badge === 'COMING SOON')
function nextGate(req, res) {
  const base = res.locals.base, co = req.store.checkout
  if (needsAgeGate(req.store)) return `${base}${withModal(co.source, 'verify-age')}`
  // ASSUMPTION: a shopper who is already signed in skips the "Sign In or Continue as Guest" modal.
  if (req.store.user) return `${base}/checkout/shipping-address`
  return `${base}${withModal(co.source, 'checkout-gate')}`
}
// Which modal (if any) to overlay on a product/cart page for ?modal=...
function modalFor(req, res) {
  const co = pending(req.store), base = res.locals.base, m = req.query.modal
  if (!co || !m) return { html: '' }
  const closeHref = `${base}${co.source}`
  if (m === 'verify-age') return needsAgeGate(req.store) ? { html: P.ageGateModal({ base, closeHref }) } : { redirect: nextGate(req, res) }
  if (m === 'checkout-gate') {
    if (needsAgeGate(req.store) || req.store.user) return { redirect: nextGate(req, res) }
    return { html: P.checkoutGateModal({ base, closeHref }) }
  }
  return { html: '' }
}
// Re-render the page the pending checkout started from (product page or cart) with a modal on top.
function renderSource(req, res, modal, status = 200) {
  const base = res.locals.base
  const [path, qs = ''] = (req.store.checkout.source ?? GAME.path).split('?')
  if (path === GAME.path) return render(req, res, GAME.title, P.gtaviPage({ base, platform: platformOf(new URLSearchParams(qs).get('platform')), modal }), status)
  if (path === '/cart') return render(req, res, 'My Cart', P.cartPage({ base, t: totals(req.store.cart), modal }), status)
  const p = byPath(path)
  if (!p) return res.redirect(`${base}/`)
  render(req, res, p.title, P.otherProductPage({ base, p, modal }), status)
}

// ---- browse ----
router.get('/', (req, res) => render(req, res, 'Rockstar Store | Official Store for GTA, Red Dead Redemption', P.homePage({ base: res.locals.base, products: PRODUCTS })))
router.get('/search', (req, res) => {
  const sort = SORTS.some(s => s[0] === req.query.sort) ? req.query.sort : 'relevance'
  render(req, res, 'My Search', P.searchPage({ base: res.locals.base, q: String(req.query.q ?? ''), sort, products: sortProducts(search(req.query.q), sort) }))
})
// Placeholder covers for the other games (the shared /static/art only has GTA VI covers).
router.get('/art/:id.svg', (req, res) => {
  const p = byId(req.params.id)
  if (!p) return notFound(req, res)
  res.type('image/svg+xml').send(P.coverSvg(p))
})
router.get('/view-all-games', (req, res) => render(req, res, 'Games', P.gridPage({ base: res.locals.base, title: 'Games', products: PRODUCTS.filter(p => p.section === 'Games') })))
router.get('/merchandise', (req, res) => render(req, res, 'Merchandise', P.gridPage({ base: res.locals.base, title: 'Merchandise', products: PRODUCTS.filter(p => p.section === 'Gear') })))

router.post('/cookies', (req, res) => {
  req.store.cookies = ['accept', 'reject', 'settings', 'close'].includes(req.body.choice) ? req.body.choice : 'close'
  const ret = String(req.body.return ?? '')
  res.redirect(ret.startsWith(`${res.locals.base}/`) ? ret : `${res.locals.base}/`)
})

// ---- GTA VI product page ----
router.get('/game/buy-gta-vi', (req, res) => {
  const m = modalFor(req, res)
  if (m.redirect) return res.redirect(m.redirect)
  render(req, res, GAME.title, P.gtaviPage({ base: res.locals.base, platform: platformOf(req.query.platform), modal: m.html }))
})

// "Pre-Order Now $79.99": direct to checkout, nothing touches the Rockstar cart.
router.post('/game/buy-gta-vi/preorder', (req, res) => {
  const platform = platformOf(req.body.platform)
  const l = LISTINGS.find(x => x.platform === platform && x.format === 'code-in-box')
  // ASSUMPTION: the research never clicked the button with no platform selected; the page re-renders asking for one.
  if (!l) return render(req, res, GAME.title, P.gtaviPage({ base: res.locals.base, platform: null, error: 'Please select a platform.' }), 400)
  startCheckout(req.store, [{ sku: l.sku, qty: 1 }], `${GAME.path}?platform=${platform}`)
  res.redirect(nextGate(req, res))
})

// Age gate ("Verify your age"): Month / Day / Year, OK.
router.post('/verify-age', (req, res) => {
  const base = res.locals.base
  if (!pending(req.store)) return res.redirect(`${base}${GAME.path}`)
  const m = Number(req.body.month), d = Number(req.body.day), y = Number(req.body.year)
  let error = null
  // ASSUMPTION: the real OK button simply stays disabled until all three are chosen; this message (the store's
  // "dob-is-required" string) is the no-JavaScript fallback.
  if (!(m >= 1 && m <= 12) || !(d >= 1 && d <= 31) || !(y >= 1900)) error = 'Date of birth is required'
  else {
    const now = new Date()
    const age = now.getFullYear() - y - ((now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < d)) ? 1 : 0)
    // Under 18 (JSON-LD requiredMinAge 18): the age-gate component's blocked label from the store's string table.
    if (age < 18) error = 'You do not meet the requirements for this content'
  }
  if (error) return renderSource(req, res, P.ageGateModal({ base, closeHref: `${base}${req.store.checkout.source}`, values: req.body, error }), 400)
  req.store.ageVerified = true
  res.redirect(nextGate(req, res))
})

// ---- other product pages ----
function otherProduct(req, res, p) {
  const m = modalFor(req, res)
  if (m.redirect) return res.redirect(m.redirect)
  const popover = req.query.added && p.sale === 'direct' ? P.addedPopover({ base: res.locals.base, item: bySku(p.sku), closeHref: `${res.locals.base}${p.path}` }) : ''
  render(req, res, p.title, P.otherProductPage({ base: res.locals.base, p, popover, modal: m.html }))
}
router.get('/game/:slug', (req, res) => { const p = byPath(`/game/${req.params.slug}`); return p ? otherProduct(req, res, p) : notFound(req, res) })
router.get('/merchandise/:slug', (req, res) => { const p = byPath(`/merchandise/${req.params.slug}`); return p ? otherProduct(req, res, p) : notFound(req, res) })

// ---- merchandise cart (Buy Now / Add to Cart / Go To Cart / PROCEED TO CHECKOUT) ----
const directItem = (sku) => { const it = bySku(sku); return it && it.kind === 'other' && it.product.sale === 'direct' ? it : null }

router.post('/buy-now', (req, res) => {
  const it = directItem(req.body.sku)
  if (!it) return res.redirect(`${res.locals.base}/`)
  startCheckout(req.store, [{ sku: it.sku, qty: 1 }], it.product.path)
  res.redirect(nextGate(req, res))
})
router.post('/cart/add', (req, res) => {
  const it = directItem(req.body.sku)
  if (!it) return res.redirect(`${res.locals.base}/`)
  const line = req.store.cart.find(l => l.sku === it.sku)
  if (line) line.qty = Math.min(MAX_QTY, line.qty + 1)
  else req.store.cart.push({ sku: it.sku, qty: 1 })
  res.redirect(`${res.locals.base}${it.product.path}?added=1`)
})
router.get('/cart', (req, res) => {
  const m = modalFor(req, res)
  if (m.redirect) return res.redirect(m.redirect)
  render(req, res, 'My Cart', P.cartPage({ base: res.locals.base, t: totals(req.store.cart), modal: m.html }))
})
router.post('/cart/update', (req, res) => {
  const line = req.store.cart.find(l => l.sku === req.body.sku)
  if (line) {
    if (req.body.action === 'remove') req.store.cart = req.store.cart.filter(l => l !== line)
    else { const q = Number(req.body.qty); if (q >= 1 && q <= MAX_QTY) line.qty = q }
  }
  res.redirect(`${res.locals.base}/cart`)
})
router.post('/cart/checkout', (req, res) => {
  if (!req.store.cart.length) return res.redirect(`${res.locals.base}/cart`)
  startCheckout(req.store, req.store.cart.map(l => ({ ...l })), '/cart')
  res.redirect(nextGate(req, res))
})

// ---- Rockstar Games Account (Social Club) sign-in; optional, guest checkout is always allowed ----
// Back into the checkout only when sign-in was started from the checkout modal (?return=checkout).
function afterAuth(req, res) {
  const base = res.locals.base
  return req.query.return === 'checkout' && pending(req.store) ? nextGate(req, res) : `${base}/`
}
router.get('/signin', (req, res) => render(req, res, 'Sign In', P.signInPage({ base: res.locals.base, returnTo: String(req.query.return ?? '') })))
router.post('/signin', (req, res) => {
  const acct = authenticate(req.storeSlug, req.body.email, req.body.password)
  // ASSUMPTION: the Social Club error copy was not observed.
  if (!acct) return render(req, res, 'Sign In', P.signInPage({ base: res.locals.base, returnTo: String(req.query.return ?? ''), email: req.body.email, error: 'The email/nickname or password you entered is incorrect. Please try again.' }), 401)
  req.store.user = publicAccount(acct)
  res.redirect(afterAuth(req, res))
})
router.get('/signup', (req, res) => render(req, res, 'Create Account', P.signUpPage({ base: res.locals.base, returnTo: String(req.query.return ?? '') })))
router.post('/signup', (req, res) => {
  const v = req.body, errors = {}
  for (const [k, label] of [['email', 'Email'], ['nickname', 'Nickname'], ['password', 'Password']]) if (!String(v[k] ?? '').trim()) errors[k] = `${label} is required.`
  if (v.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.email)) errors.email = 'Enter a valid email address.'
  if (v.password && v.password.length < 8) errors.password = 'Password must be at least 8 characters.'
  if (!Object.keys(errors).length) {
    const acct = createAccount(req.storeSlug, { email: v.email, password: v.password, nickname: String(v.nickname).trim(), country: COUNTRIES.some(c => c[0] === v.country) ? v.country : 'US' })
    if (acct.error) errors.email = acct.error
    else { req.store.user = publicAccount(acct); return res.redirect(afterAuth(req, res)) }
  }
  render(req, res, 'Create Account', P.signUpPage({ base: res.locals.base, returnTo: String(req.query.return ?? ''), values: v, errors }), 400)
})
router.get('/signout', (req, res) => { req.store.user = null; req.store.checkout = {}; res.redirect(`${res.locals.base}/`) })

// ---- Xsolla Pay Station checkout: Shipping Address -> Shipping Method -> Payment -> status page ----
function guard(req, res, step) {
  const base = res.locals.base, co = pending(req.store)
  if (!co) { res.redirect(`${base}${GAME.path}`); return null }
  if (needsAgeGate(req.store)) { res.redirect(`${base}${withModal(co.source, 'verify-age')}`); return null }
  if (!req.store.user && !co.guest) { res.redirect(`${base}${withModal(co.source, 'checkout-gate')}`); return null }
  if (step !== 'shipping-address' && !co.address) { res.redirect(`${base}/checkout/shipping-address`); return null }
  if (step === 'payment' && !co.shippingMethod) { res.redirect(`${base}/checkout/shipping-method`); return null }
  return co
}
const closeHrefOf = (res, co) => `${res.locals.base}${co.source}`

router.post('/checkout/guest', (req, res) => {
  const co = pending(req.store)
  if (!co) return res.redirect(`${res.locals.base}/`)
  if (needsAgeGate(req.store)) return res.redirect(nextGate(req, res))
  co.guest = true
  res.redirect(`${res.locals.base}/checkout/shipping-address`)
})

router.get('/checkout/shipping-address', (req, res) => {
  const co = guard(req, res, 'shipping-address')
  if (!co) return
  if (co.address) return res.redirect(`${res.locals.base}/checkout/shipping-method`) // locked once submitted
  const values = { ...(co.addressValues ?? {}) }
  const u = req.store.user
  if (u) { values.first_name ??= u.first_name; values.last_name ??= u.last_name; values.phone ??= u.phone; values.email ??= u.email }
  render(req, res, 'Shipping Address', P.shippingAddressStep({ base: res.locals.base, values, preorder: isPreorder(co), closeHref: closeHrefOf(res, co) }))
})
router.post('/checkout/shipping-address', (req, res) => {
  const co = guard(req, res, 'shipping-address')
  if (!co) return
  if (co.address) return res.redirect(`${res.locals.base}/checkout/shipping-method`)
  const v = req.body, errors = {}
  const t = (k) => String(v[k] ?? '').trim()
  for (const k of ['first_name', 'last_name', 'city', 'region', 'postal_code', 'street_address', 'phone', 'email']) if (!t(k)) errors[k] = 'Required'
  const country = COUNTRIES.some(c => c[0] === v.country) ? v.country : 'US'
  // ASSUMPTION: only the empty-field "Required" state was observed; format messages are guesses.
  if (!errors.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(t('email'))) errors.email = 'Invalid email address'
  if (!errors.phone && (t('phone').replace(/\D/g, '').length < 7 || t('phone').replace(/\D/g, '').length > 15)) errors.phone = 'Invalid phone number'
  if (!errors.postal_code && country === 'US' && !/^\d{5}(-\d{4})?$/.test(t('postal_code'))) errors.postal_code = 'Invalid Postal Code'
  co.addressValues = { ...v, country }
  if (Object.keys(errors).length) return render(req, res, 'Shipping Address', P.shippingAddressStep({ base: res.locals.base, values: co.addressValues, errors, preorder: isPreorder(co), closeHref: closeHrefOf(res, co) }), 400)
  co.address = { country, first_name: t('first_name'), last_name: t('last_name'), city: t('city'), state: t('region'), postal_code: t('postal_code'), line1: t('street_address'), line2: t('apartment') || null, phone: t('phone'), email: t('email').toLowerCase() }
  res.redirect(`${res.locals.base}/checkout/shipping-method`)
})

router.get('/checkout/shipping-method', (req, res) => {
  const co = guard(req, res, 'shipping-method')
  if (!co) return
  render(req, res, 'Shipping Method', P.shippingMethodStep({ base: res.locals.base, address: co.address, method: co.shippingMethod ?? 'standard', subtotal: totals(co.items).subtotal, preorder: isPreorder(co), closeHref: closeHrefOf(res, co) }))
})
router.post('/checkout/shipping-method', (req, res) => {
  const co = guard(req, res, 'shipping-method')
  if (!co) return
  const m = req.body.shipping_method
  if (!SHIPPING_METHODS[m]) return render(req, res, 'Shipping Method', P.shippingMethodStep({ base: res.locals.base, address: co.address, method: null, subtotal: totals(co.items).subtotal, error: 'Please select a shipping method.', preorder: isPreorder(co), closeHref: closeHrefOf(res, co) }), 400)
  co.shippingMethod = m
  res.redirect(`${res.locals.base}/checkout/payment`)
})

router.get('/checkout/payment', (req, res) => {
  const co = guard(req, res, 'payment')
  if (!co) return
  render(req, res, 'Payment', P.paymentStep({ base: res.locals.base, t: totals(co.items, co.shippingMethod), address: co.address, method: co.shippingMethod, values: co.payValues ?? {}, user: req.store.user, preorder: isPreorder(co), closeHref: closeHrefOf(res, co) }))
})
router.post('/checkout/payment', (req, res) => {
  const co = guard(req, res, 'payment')
  if (!co) return
  const v = req.body, errors = {}
  const pm = v.payment_method === 'paypal' ? 'paypal' : 'card'
  let payment
  if (pm === 'card') {
    const card = validateCard({ number: v.card_number, expiry: v.expiry, cvv: v.cvc })
    if (!card.ok) { if (card.errors.number) errors.card_number = card.errors.number; if (card.errors.expiry) errors.expiry = card.errors.expiry; if (card.errors.cvv) errors.cvc = card.errors.cvv }
    if (!String(v.cardholder_name ?? '').trim()) errors.cardholder_name = 'Required'
    if (!Object.keys(errors).length) payment = { method: 'card', brand: card.brand, last4: card.last4, name_on_card: String(v.cardholder_name).trim() }
  } else payment = { method: 'paypal' }
  co.payValues = { ...v, card_number: '', cvc: '' } // never echo the card number back
  if (Object.keys(errors).length) return render(req, res, 'Payment', P.paymentStep({ base: res.locals.base, t: totals(co.items, co.shippingMethod), address: co.address, method: co.shippingMethod, values: co.payValues, errors, user: req.store.user, preorder: isPreorder(co), closeHref: closeHrefOf(res, co) }), 400)

  const t = totals(co.items, co.shippingMethod)
  const a = co.address
  const shipTo = { first_name: a.first_name, last_name: a.last_name, line1: a.line1, line2: a.line2, city: a.city, state: a.state, postal_code: a.postal_code, country: a.country, phone: a.phone }
  const token = randomBytes(12).toString('hex')
  const order = recordOrder({
    store: req.storeSlug,
    order_number: transactionId(),
    session: req.session,
    items: t.lines.map(l => l.item.kind === 'game'
      ? { platform: l.item.platform, edition: l.item.edition, format: l.item.format, qty: l.qty, unit_price: l.item.price, title: l.item.title, sku: l.item.sku }
      : { kind: 'other', title: l.item.title, qty: l.qty, unit_price: l.item.price, sku: l.item.sku }),
    customer: { email: a.email, first_name: a.first_name, last_name: a.last_name, phone: a.phone, account_id: req.store.user?.id ?? null, guest: !req.store.user },
    fulfillment: { method: 'ship', option: co.shippingMethod, eta: SHIPPING_METHODS[co.shippingMethod].eta },
    shipping_address: shipTo,
    billing_address: { ...shipTo }, // Pay Station collects no separate billing address; it reuses the shipping details
    payment,
    totals: { subtotal: t.subtotal, shipping: t.shipping, tax: t.tax, total: t.total },
    currency: 'USD',
    meta: { token, xsolla_project: XSOLLA_PROJECT, source: co.source, preorder: isPreorder(co), save_payment: !!v.save_payment },
  })
  if (co.source === '/cart') req.store.cart = []
  req.store.checkout = {}
  res.redirect(`${res.locals.base}/checkout/status?transaction_id=${order.order_number}&token=${token}`)
})

router.get('/checkout/status', (req, res) => {
  const order = getOrder(String(req.query.transaction_id ?? ''))
  if (!order || order.store !== req.storeSlug || order.meta.token !== req.query.token) return render(req, res, 'Payment status', P.simplePage({ title: 'Transaction not found', html: `<p>We couldn't find that transaction.</p><a class="rs-btn rs-btn-primary" href="${res.locals.base}/">Back to Store</a>` }), 404)
  render(req, res, 'Payment status', P.statusPage({ base: res.locals.base, order }))
})

router.use(notFound)

export default {
  slug: 'rockstar-store',
  name: NAME,
  country: 'US',
  currency: 'USD',
  description: 'US. Code-in-box PS5/Xbox sold direct with no cart step: age gate, sign-in-or-guest modal, Xsolla-style 3-step checkout; digital editions link out.',
  router,
}
