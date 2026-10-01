import { Router } from 'express'
import { randomBytes, randomInt } from 'node:crypto'
import { recordOrder, getOrder, listOrders } from '../../lib/orders.js'
import { validateCard } from '../../lib/payment.js'
import { authenticate, createAccount, publicAccount } from '../../lib/accounts.js'
import { PRODUCTS, CONCEPT_ID, STATES, byId, featured, search, cartLines, totals, productPath, conceptPath } from './data.js'
import * as P from './pages.js'

const router = Router()
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
// ASSUMPTION: the <title> of store.playstation.com/en-us/pages/latest is not quoted in the research.
const HOME_TITLE = 'Official PlayStation™Store US | Home of PlayStation games, content and more'

// ---- helpers ----
function render(req, res, { title, body, drawer = null, closeHref = null, chrome = 'store', status = 200 }) {
  res.status(status).type('html').send(P.layout({ base: res.locals.base, title, body, path: req.originalUrl, user: req.store.user, cartCount: req.store.cart.length, drawer, closeHref, chrome }))
}
const sony = (req, res, title, body, status = 200) => render(req, res, { title, body, chrome: 'sony', status })
const decode = (s) => { try { return decodeURIComponent(s) } catch { return s } }
const takeFlash = (req) => { const f = req.store.flash ?? null; req.store.flash = null; return f }

// Only paths inside this store are accepted as return targets (no open redirects), and never the
// drawer, sign-in or sign-out URLs themselves.
function returnPath(res, value) {
  const base = res.locals.base
  const v = String(value ?? '')
  const inStore = v === base || v.startsWith(`${base}/`) || v.startsWith(`${base}?`)
  const rel = v.slice(base.length)
  return inStore && !/^\/(en-us\/checkout|my\.account\.sony\.com|logout)/.test(rel) ? v : `${base}/`
}

// ---- page views (also used to draw the page underneath the drawer) ----
const homeView = (res) => ({ title: HOME_TITLE, body: P.homePage({ base: res.locals.base, products: PRODUCTS }) })
const searchView = (res, q) => ({ title: `PlayStation Store | Search | ${q}`, body: P.searchPage({ base: res.locals.base, q, products: search(q) }) })
const browseView = (res) => ({ title: 'PlayStation Store | Browse', body: P.searchPage({ base: res.locals.base, q: '', products: PRODUCTS, heading: 'Browse' }) })
// The signed-in shopper's orders, from this visitor's session only: one benchmark run must never see
// another run's pre-orders for the shared test account.
const myOrders = (req) => req.store.user ? listOrders({ store: req.storeSlug }).filter(o => o.session_id === req.session.id && o.customer.email === req.store.user.email) : []
const ownedSkus = (req) => new Set(myOrders(req).flatMap(o => o.items.map(i => i.sku)))
// ASSUMPTION: product and concept pages are titled with the product name (the research does not quote the <title>).
const productView = (req, res, p, here, toast = null) => ({ title: p.title, body: P.productPage({ base: res.locals.base, p, here, toast, owned: ownedSkus(req) }) })
const libraryView = (req, res) => ({ title: 'Game Library', body: P.libraryPage({ base: res.locals.base, user: req.store.user, orders: myOrders(req) }) })
const notFound = (req, res) => render(req, res, { title: 'PlayStation Store', body: P.fallbackPage({ base: res.locals.base }), status: 404 })

// The drawer slides over the store page it was opened from (checkout.returnTo).
const closeHref = (req, res) => req.store.checkout.returnTo ?? `${res.locals.base}/`
function underlay(req, res) {
  const base = res.locals.base
  const path = closeHref(req, res).split('?')[0].slice(base.length)
  const product = /^\/en-us\/product\/([^/]+)\/?$/.exec(path)
  const query = /^\/en-us\/search\/([^/]+)\/?$/.exec(path)
  if (product && byId(product[1])) return productView(req, res, byId(product[1]), productPath(base, byId(product[1])))
  if (path.startsWith(`/en-us/concept/${CONCEPT_ID}`)) return productView(req, res, featured(), conceptPath(base))
  if (query) return searchView(res, decode(query[1]))
  if (path.startsWith('/en-us/pages/browse')) return browseView(res)
  if (path.startsWith('/en-us/library') && req.store.user) return libraryView(req, res)
  return homeView(res)
}
function drawer(req, res, title, html, status = 200) {
  render(req, res, { title, body: underlay(req, res).body, drawer: html, closeHref: closeHref(req, res), status })
}

// Saved payment methods per signed-in account, kept in this visitor's session only.
// ASSUMPTION: the seeded account starts with no saved card or payment service.
function wallet(req) {
  const all = (req.store.wallets ??= {})
  return (all[req.store.user.email] ??= { instruments: [], selected: null })
}

// ---- browse ----
router.get(['/', '/en-us/pages/latest'], (req, res) => render(req, res, homeView(res)))
router.get('/en-us/pages/browse', (req, res) => render(req, res, browseView(res)))

// The header search field submits ?q=; the store's own search URL is a path: /en-us/search/{q}.
router.get('/en-us/search', (req, res) => {
  const q = String(req.query.q ?? '').trim()
  res.redirect(q ? `${res.locals.base}/en-us/search/${encodeURIComponent(q)}` : `${res.locals.base}/`)
})
router.get('/en-us/search/:q', (req, res) => render(req, res, searchView(res, req.params.q.trim())))

// Edition-agnostic concept page: renders the featured edition (currently the Ultimate Edition).
router.get('/en-us/concept/:id', (req, res) => {
  if (req.params.id !== CONCEPT_ID) return notFound(req, res)
  render(req, res, productView(req, res, featured(), conceptPath(res.locals.base), takeFlash(req)))
})
router.get('/en-us/product/:id', (req, res) => {
  const p = byId(req.params.id)
  if (!p) return notFound(req, res)
  render(req, res, productView(req, res, p, productPath(res.locals.base, p), takeFlash(req)))
})

// ---- product CTAs: every one needs a PSN account (no guest) ----
function ctaTarget(req, res) {
  const p = byId(req.body.sku)
  return { p, back: returnPath(res, req.body.returnTo || (p ? productPath(res.locals.base, p) : '')) }
}

// Pre-Order is a BUY_NOW action: signed out it goes to Sony sign-in (and back to this page);
// signed in it opens the drawer straight on "Confirm Pre-Order" for that SKU (no cart step).
router.post('/en-us/preorder', (req, res) => {
  const { p, back } = ctaTarget(req, res)
  if (!p || p.cta !== 'preorder') return res.redirect(back)
  if (!req.store.user) return res.redirect(P.signInUrl(res.locals.base, back))
  if (ownedSkus(req).has(p.id)) return res.redirect(back)
  req.store.checkout.returnTo = back
  res.redirect(`${res.locals.base}/en-us/checkout/buynow/${encodeURIComponent(p.id)}`)
})

// ASSUMPTION: the wishlist toast wording (research: "toggles the item ... and shows an inline toast").
router.post('/en-us/wishlist', (req, res) => {
  const { p, back } = ctaTarget(req, res)
  if (!p) return res.redirect(back)
  if (!req.store.user) return res.redirect(P.signInUrl(res.locals.base, back))
  const list = (req.store.wishlist ??= [])
  const had = list.includes(p.id)
  req.store.wishlist = had ? list.filter(id => id !== p.id) : [...list, p.id]
  req.store.flash = had ? `${p.title} was removed from your wishlist.` : `${p.title} was added to your wishlist.`
  res.redirect(back)
})

// Regular (non pre-order) items: ADD_TO_CART is also a drawer action, so the cart view opens.
router.post('/en-us/cart/add', (req, res) => {
  const { p, back } = ctaTarget(req, res)
  if (!p || p.cta !== 'cart') return res.redirect(back)
  if (!req.store.user) return res.redirect(P.signInUrl(res.locals.base, back))
  if (ownedSkus(req).has(p.id)) return res.redirect(back)
  if (!req.store.cart.includes(p.id)) req.store.cart.push(p.id) // digital licence: one of each
  req.store.checkout.returnTo = back
  res.redirect(`${res.locals.base}/en-us/checkout`)
})
router.post('/en-us/cart/remove', (req, res) => {
  req.store.cart = req.store.cart.filter(id => id !== String(req.body.sku))
  res.redirect(`${res.locals.base}/en-us/checkout`)
})
// Observed: /en-us/cart redirects to /en-us/pages/cart/, which shows the store's fallback page.
// ASSUMPTION: it shows the same fallback when signed in (the cart only exists as the drawer).
router.get('/en-us/cart', (req, res) => res.redirect(`${res.locals.base}/en-us/pages/cart/`))

// ---- Sony account sign-in (two steps) and Create New Account ----
router.get(P.SONY_SIGNIN, (req, res) => {
  const redirectUri = returnPath(res, req.query.redirect_uri)
  if (req.store.user) return res.redirect(redirectUri)
  sony(req, res, 'Sign In', P.signInPage({ base: res.locals.base, email: String(req.query.email ?? ''), redirectUri }))
})
router.post(P.SONY_SIGNIN, (req, res) => {
  const base = res.locals.base
  const redirectUri = returnPath(res, req.body.redirect_uri)
  const email = String(req.body.email ?? '').trim()
  // ASSUMPTION: no passkey is registered for the test accounts, so this option explains itself and stays on step 1.
  if (req.body.passkey) return sony(req, res, 'Sign In', P.signInPage({ base, email, redirectUri, error: 'No passkey is set up for this account on this device. Enter your sign-in ID (email address) to sign in with your password.' }), 400)
  if (req.body.step !== 'password') {
    const error = !email ? 'Enter your sign-in ID (email address).' : !EMAIL_RE.test(email) ? 'Enter a valid email address.' : null
    if (error) return sony(req, res, 'Sign In', P.signInPage({ base, email, redirectUri, error }), 400)
    return sony(req, res, 'Sign In', P.signInPage({ base, step: 'password', email, redirectUri }))
  }
  const acct = authenticate(req.storeSlug, email, req.body.password)
  // ASSUMPTION: Sony's wrong-password wording (the sign-in page itself was never observed).
  if (!acct) return sony(req, res, 'Sign In', P.signInPage({ base, step: 'password', email, redirectUri, error: 'The sign-in ID (email address) or password is incorrect.' }), 401)
  req.store.user = publicAccount(acct)
  res.redirect(redirectUri)
})

router.get(P.SONY_SIGNUP, (req, res) => {
  sony(req, res, 'Create New Account', P.createAccountPage({ base: res.locals.base, redirectUri: returnPath(res, req.query.redirect_uri), values: { country: 'US', language: 'en-US' } }))
})
// ASSUMPTION: the real sign-up spreads these fields over several "Next" screens and ends with email
// verification; the clone takes them on one screen and signs the new account in straight away.
router.post(P.SONY_SIGNUP, (req, res) => {
  const v = req.body
  const redirectUri = returnPath(res, v.redirect_uri)
  const text = (k) => String(v[k] ?? '').trim()
  const errors = {}
  const need = (k, msg) => { if (!text(k)) errors[k] = msg }
  need('dob', 'Enter your date of birth.')
  need('state', 'Select your state.')
  need('email', 'Enter your sign-in ID (email address).')
  need('password', 'Enter a password.')
  need('onlineId', 'Enter an online ID.')
  need('firstName', 'Enter your first name.')
  need('lastName', 'Enter your last name.')
  const dob = new Date(`${text('dob')}T00:00:00`)
  if (text('dob') && (Number.isNaN(dob.getTime()) || dob > new Date())) errors.dob = 'Enter a valid date of birth.'
  if (text('state') && !STATES.includes(text('state'))) errors.state = 'Select your state.'
  if (text('email') && !EMAIL_RE.test(text('email'))) errors.email = 'Enter a valid email address.'
  // ASSUMPTION: Sony's password and Online ID rules as commonly documented.
  if (v.password && !(String(v.password).length >= 8 && /[a-z]/i.test(v.password) && /\d/.test(v.password))) errors.password = 'Your password must be at least 8 characters and include both letters and numbers.'
  if (text('onlineId') && !/^[A-Za-z][A-Za-z0-9_-]{2,15}$/.test(text('onlineId'))) errors.onlineId = 'Your online ID must be 3-16 characters, start with a letter, and use only letters, numbers, hyphens (-) and underscores (_).'
  if (!v.terms) errors.terms = 'You must agree to the terms to create an account.'
  if (!Object.keys(errors).length) {
    const acct = createAccount(req.storeSlug, { email: text('email'), password: String(v.password), first_name: text('firstName'), last_name: text('lastName'), online_id: text('onlineId'), date_of_birth: text('dob'), state: text('state'), country: 'US' })
    if (acct.error) errors.email = 'This sign-in ID (email address) is already in use.'
    else { req.store.user = publicAccount(acct); return res.redirect(redirectUri) }
  }
  sony(req, res, 'Create New Account', P.createAccountPage({ base: res.locals.base, values: { ...v, password: '' }, errors, redirectUri }), 400)
})

router.get('/logout', (req, res) => { req.store.user = null; req.store.checkout = {}; res.redirect(`${res.locals.base}/`) })

router.get('/en-us/library', (req, res) => {
  if (!req.store.user) return res.redirect(P.signInUrl(res.locals.base, `${res.locals.base}/en-us/library`))
  render(req, res, libraryView(req, res))
})

// ---- the checkout drawer (checkout.playstation.com client, server-rendered as an overlay route) ----
// Cart view: /en-us/checkout (header Cart icon). Buy-now view: /en-us/checkout/buynow/{sku} (Pre-Order).
const DRAWER = ['/en-us/checkout', '/en-us/checkout/buynow/:sku']
const sub = (suffix) => DRAWER.map(p => p + suffix)

function drawerCtx(req, res) {
  const base = res.locals.base
  const sku = req.params.sku
  if (!sku) return { base, mode: 'cart', lines: cartLines(req.store), drawerPath: `${base}/en-us/checkout` }
  const p = byId(sku)
  return { base, mode: 'buynow', lines: p?.cta === 'preorder' ? [{ product: p, qty: 1 }] : null, drawerPath: `${base}/en-us/checkout/buynow/${encodeURIComponent(sku)}` }
}

// Drawer states that come before the Confirm view: signed out, unknown SKU, empty cart. Returns true if it rendered one.
function drawerGate(req, res, c) {
  if (!req.store.user) { drawer(req, res, 'Sign In | Checkout', P.drawerSignIn({ base: c.base, returnTo: closeHref(req, res) }), req.method === 'POST' ? 401 : 200); return true }
  if (!c.lines) { drawer(req, res, 'Error | Checkout', P.drawerError({ closeHref: closeHref(req, res) }), 404); return true }
  // ASSUMPTION: wording of the refusal when the licence is already owned (e.g. Back + resubmit after paying).
  if (c.mode === 'buynow' && ownedSkus(req).has(c.lines[0].product.id)) { drawer(req, res, 'Error | Checkout', P.drawerError({ closeHref: closeHref(req, res), message: 'You have already purchased this item. You can find it in your Game Library.' }), 409); return true }
  if (!c.lines.length) { drawer(req, res, 'Cart | Checkout', P.drawerEmptyCart({ closeHref: closeHref(req, res) })); return true }
  return false
}

function showConfirm(req, res, c, { error = null, selected = null, status = 200 } = {}) {
  const w = wallet(req)
  const notice = req.store.checkout.notice ?? null
  req.store.checkout.notice = null
  const pick = selected ?? w.selected ?? w.instruments.find(i => i.default)?.id ?? null
  // ASSUMPTION: title of the buy-now view (the client documents "Cart | Checkout" and "Thank You | Checkout" only).
  const title = c.mode === 'cart' ? 'Cart | Checkout' : 'Confirm Pre-Order | Checkout'
  drawer(req, res, title, P.drawerConfirm({ base: c.base, mode: c.mode, t: totals(c.lines), drawerPath: c.drawerPath, closeHref: closeHref(req, res), instruments: w.instruments, selected: pick, error, notice }), status)
}

router.get(DRAWER, (req, res) => {
  if (req.query.return) req.store.checkout.returnTo = returnPath(res, req.query.return)
  const c = drawerCtx(req, res)
  if (!drawerGate(req, res, c)) showConfirm(req, res, c)
})

// "Pre-Order & Pay" (or "Confirm Purchase" for a cart without pre-orders): charged immediately.
router.post(DRAWER, (req, res) => {
  const c = drawerCtx(req, res)
  if (drawerGate(req, res, c)) return
  const t = totals(c.lines)
  const w = wallet(req)
  const instrument = w.instruments.find(i => i.id === req.body.paymentMethod) ?? null
  // Wallet funds are used first; anything they do not cover needs a selected card or service.
  if (!instrument && t.remainder > 0) return showConfirm(req, res, c, { error: 'Please select a payment method.', status: 400 })
  if (instrument) w.selected = instrument.id

  const user = req.store.user
  const token = randomBytes(12).toString('hex')
  const order = recordOrder({
    store: req.storeSlug,
    order_number: String(randomInt(10_000_000_000, 100_000_000_000)), // 11-digit receipt number
    session: req.session,
    items: c.lines.map(({ product: p, qty }) => p.kind === 'game'
      ? { platform: p.platform, edition: p.edition, format: p.format, qty, unit_price: p.price, title: p.title, sku: p.id }
      : { kind: 'other', title: p.title, qty, unit_price: p.price, sku: p.id }),
    customer: { email: user.email, first_name: user.first_name, last_name: user.last_name, online_id: P.onlineId(user), account_id: user.id },
    fulfillment: { method: 'digital' },
    shipping_address: null,
    billing_address: instrument?.billing ?? null,
    payment: !instrument ? { method: 'wallet' }
      : instrument.type === 'card' ? { method: 'card', brand: instrument.brand, last4: instrument.last4, name_on_card: instrument.name }
      : { method: instrument.type },
    totals: { subtotal: t.subtotal, shipping: 0, tax: t.tax, total: t.total },
    currency: 'USD',
    meta: { token, view: c.mode, wallet_applied: t.wallet },
  })
  if (c.mode === 'cart') req.store.cart = []
  req.store.checkout.pendingCard = null
  res.redirect(`${c.base}/en-us/checkout/thankyou?order=${order.order_number}&token=${token}`)
})

router.get('/en-us/checkout/thankyou', (req, res) => {
  const order = getOrder(String(req.query.order ?? ''))
  if (!order || order.store !== req.storeSlug || order.meta.token !== req.query.token) return drawer(req, res, 'Error | Checkout', P.drawerError({ closeHref: closeHref(req, res) }), 404)
  drawer(req, res, 'Thank You | Checkout', P.drawerThankYou({ base: res.locals.base, order, closeHref: closeHref(req, res) }))
})

// ---- Add Payment Method (hosted transact screens inside the drawer): card > Next, billing > Save ----
// These screens need a signed-in shopper and something to pay for; otherwise the drawer's main view explains why.
function payCtx(req, res) {
  const c = drawerCtx(req, res)
  if (!req.store.user || !c.lines?.length) { res.redirect(c.drawerPath); return null }
  return c
}
const cardCount = (w) => w.instruments.filter(i => i.type === 'card').length

router.get(sub('/payment'), (req, res) => {
  const c = payCtx(req, res); if (!c) return
  drawer(req, res, 'Add Payment Method | Checkout', P.drawerAddPayment({ drawerPath: c.drawerPath, cardCount: cardCount(wallet(req)) }))
})

router.get(sub('/payment/card'), (req, res) => {
  const c = payCtx(req, res); if (!c) return
  drawer(req, res, 'Add a Credit/Debit Card | Checkout', P.drawerCardForm({ drawerPath: c.drawerPath }))
})
router.post(sub('/payment/card'), (req, res) => {
  const c = payCtx(req, res); if (!c) return
  const v = req.body
  const name = String(v.cardholderName ?? '').trim()
  const card = validateCard({ number: v.cardNumber, exp_month: v.expMonth, exp_year: v.expYear, cvv: v.cvv })
  const errors = {}
  if (!card.ok) for (const [k, field] of [['number', 'cardNumber'], ['expiry', 'expiry'], ['cvv', 'cvv']]) if (card.errors[k]) errors[field] = card.errors[k]
  if (!name) errors.cardholderName = 'Enter the cardholder\'s name.'
  if (cardCount(wallet(req)) >= 3) errors.cardNumber = 'You have reached the maximum of three credit/debit cards on file.'
  if (Object.keys(errors).length) {
    // The card number and CVV are never echoed back into the page.
    return drawer(req, res, 'Add a Credit/Debit Card | Checkout', P.drawerCardForm({ drawerPath: c.drawerPath, values: { cardholderName: name, expMonth: v.expMonth, expYear: v.expYear }, errors }), 400)
  }
  // Only what is needed to show and record the card is kept for the billing screen.
  req.store.checkout.pendingCard = { brand: card.brand, last4: card.last4, name, exp: `${String(v.expMonth).padStart(2, '0')}/${String(v.expYear).slice(-2)}` }
  res.redirect(`${c.drawerPath}/payment/card/billing`)
})

router.get(sub('/payment/card/billing'), (req, res) => {
  const c = payCtx(req, res); if (!c) return
  const card = req.store.checkout.pendingCard
  if (!card) return res.redirect(`${c.drawerPath}/payment/card`)
  // ASSUMPTION: the billing screen starts with the account holder's name filled in.
  drawer(req, res, 'Billing Information | Checkout', P.drawerBillingForm({ drawerPath: c.drawerPath, card, values: { firstName: req.store.user.first_name, lastName: req.store.user.last_name } }))
})
router.post(sub('/payment/card/billing'), (req, res) => {
  const c = payCtx(req, res); if (!c) return
  const card = req.store.checkout.pendingCard
  if (!card) return res.redirect(`${c.drawerPath}/payment/card`)
  const v = { ...req.body, setDefault: req.body.setDefault === '1' }
  const text = (k) => String(v[k] ?? '').trim()
  const errors = {}
  for (const [k, msg] of [['firstName', 'Enter your first name.'], ['lastName', 'Enter your last name.'], ['address1', 'Enter your street address.'], ['city', 'Enter your city.'], ['state', 'Select your state.'], ['zip', 'Enter your ZIP code.'], ['phone', 'Enter your phone number.']]) if (!text(k)) errors[k] = msg
  if (text('state') && !STATES.includes(text('state'))) errors.state = 'Select your state.'
  if (text('zip') && !/^\d{5}(-\d{4})?$/.test(text('zip'))) errors.zip = 'Enter a valid ZIP code.'
  if (text('phone') && text('phone').replace(/\D/g, '').length !== 10) errors.phone = 'Enter a valid 10-digit phone number.'
  if (Object.keys(errors).length) return drawer(req, res, 'Billing Information | Checkout', P.drawerBillingForm({ drawerPath: c.drawerPath, card, values: v, errors }), 400)

  const w = wallet(req)
  const instrument = {
    id: `card-${randomBytes(4).toString('hex')}`, type: 'card', brand: card.brand, last4: card.last4, name: card.name, exp: card.exp,
    default: v.setDefault || !w.instruments.some(i => i.default),
    billing: { first_name: text('firstName'), last_name: text('lastName'), line1: text('address1'), line2: text('address2') || null, city: text('city'), state: text('state'), postal_code: text('zip'), country: 'US', phone: text('phone') },
  }
  if (instrument.default) for (const i of w.instruments) i.default = false
  w.instruments.push(instrument)
  w.selected = instrument.id
  req.store.checkout.pendingCard = null
  req.store.checkout.notice = 'Credit/debit card has been successfully added.'
  res.redirect(c.drawerPath)
})

// ASSUMPTION: the PayPal log-in hand-off cannot happen here, so the account links at once.
// One payment service per account: adding PayPal replaces any other service.
router.post(sub('/payment/service'), (req, res) => {
  const c = payCtx(req, res); if (!c) return
  const w = wallet(req)
  w.instruments = [...w.instruments.filter(i => i.type === 'card'), { id: 'paypal', type: 'paypal', default: false }]
  w.selected = 'paypal'
  req.store.checkout.notice = 'Your PayPal account has been added.'
  res.redirect(c.drawerPath)
})

// Anything else (including /en-us/pages/cart/) gets the store's fallback page.
router.use(notFound)

export default {
  slug: 'playstation-store',
  name: 'PlayStation Store',
  country: 'US',
  currency: 'USD',
  description: 'US. Digital-only PS5: concept + edition pages, Sony two-step sign-in (no guest), right-side checkout drawer with wallet-first payment, Add Payment Method, Pre-Order & Pay charged immediately.',
  router,
}
