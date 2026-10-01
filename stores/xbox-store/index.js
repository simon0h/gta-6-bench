import { Router } from 'express'
import { randomBytes, randomInt } from 'node:crypto'
import { recordOrder, getOrder, listOrders } from '../../lib/orders.js'
import { validateCard } from '../../lib/payment.js'
import { authenticate, createAccount, findAccount, publicAccount } from '../../lib/accounts.js'
import { PRODUCTS, byId, editions, search, totals, priceTotals, productPath, STATES, RELEASE } from './data.js'
import * as P from './pages.js'

const NAME = 'Xbox Store'
const router = Router()

// ---- helpers ----
function render(req, res, title, body, { status = 200, theme = 'light' } = {}) {
  res.status(status).type('html').send(P.layout({ base: res.locals.base, title, body, cartCount: req.store.cart.length, user: req.store.user, theme, path: req.originalUrl }))
}
function renderAuth(req, res, title, body, status = 200) {
  res.status(status).type('html').send(P.authLayout({ base: res.locals.base, title, body }))
}
// ASSUMPTION: 10-digit numeric Microsoft Store order number (same shape as the 10-digit cart id).
const tenDigits = () => String(randomInt(1_000_000_000, 10_000_000_000))
const savedMethods = (req) => (req.store.user && findAccount(req.storeSlug, req.store.user.email)?.payment_methods) || []
function signinWall(req, res, returnTo) {
  req.store.checkout.returnTo = returnTo
  res.redirect(P.signinUrl(res.locals.base))
}
const notFound = (req, res) => render(req, res, 'Page not found', P.simplePage({ title: 'Sorry, we can\'t find that page', html: `<p>The item may no longer be available.</p><a class="xb-btn xb-btn-buy" href="${res.locals.base}/">Go to Xbox home</a>` }), { status: 404 })

// Reads the payment picker (purchase dialog and cart checkout share it). Returns { payment, billing, values, errors }.
function readPayment(req, saved) {
  const v = { ...req.body }
  const errors = {}
  const chosen = v.pi !== undefined && v.pi !== 'new' ? saved[Number(v.pi)] : null
  if (chosen) return { payment: chosen.payment, billing: chosen.billing, values: v, errors }
  const payType = ['card', 'paypal', 'venmo'].includes(v.payType) ? v.payType : 'card'
  // ASSUMPTION: PayPal / Venmo would bounce to the provider's site; the clone treats them as approved eWallets.
  if (payType !== 'card') return { payment: { method: payType }, billing: null, values: v, errors }
  const card = validateCard({ number: v.cardNumber, exp_month: v.expMonth, exp_year: v.expYear, cvv: v.cvv })
  if (!card.ok) {
    if (card.errors.number) errors.cardNumber = card.errors.number
    if (card.errors.expiry) errors.expMonth = card.errors.expiry
    if (card.errors.cvv) errors.cvv = card.errors.cvv
  }
  const need = (k, msg) => { if (!String(v[k] ?? '').trim()) errors[k] = msg }
  need('nameOnCard', 'Enter the name as it appears on the card.')
  need('address1', 'Enter your billing address.')
  need('city', 'Enter your city.')
  if (!STATES.includes(v.state)) errors.state = 'Select your state.'
  if (!/^\d{5}(-\d{4})?$/.test(String(v.zip ?? '').trim())) errors.zip = 'Enter a valid ZIP code.'
  const values = { ...v, cardNumber: '', cvv: '' }
  if (Object.keys(errors).length) return { values, errors }
  const payment = { method: 'card', brand: card.brand, last4: card.last4, name_on_card: v.nameOnCard.trim() }
  const billing = { line1: v.address1.trim(), line2: v.address2?.trim() || null, city: v.city.trim(), state: v.state, postal_code: v.zip.trim(), country: 'US' }
  return { payment, billing, values, errors }
}

function placeOrder(req, { items, payment, billing, t, path }) {
  const user = req.store.user
  const token = randomBytes(12).toString('hex')
  const preorder = items.some(i => byId(i.sku)?.ribbon === 'PRE-ORDER')
  const order = recordOrder({
    store: req.storeSlug,
    order_number: tenDigits(),
    session: req.session,
    items,
    customer: { email: user.email, first_name: user.first_name ?? '', last_name: user.last_name ?? '', phone: user.phone ?? '', account_id: user.id, guest: false },
    fulfillment: { method: 'digital', eta: preorder ? `Unlocks on release, ${RELEASE}; pre-download available before release` : 'Available now in My games & apps' },
    shipping_address: null,
    billing_address: billing,
    payment,
    totals: { subtotal: t.subtotal, shipping: 0, tax: t.tax, total: t.total },
    currency: 'USD',
    meta: { token, path, preorder, charge_timing: preorder && ['card', 'paypal', 'venmo'].includes(payment.method) ? 'about 10 days before release' : 'immediately' },
  })
  saveCard(req, payment, billing)
  return { order, token }
}

// A card added during a purchase is kept on the Microsoft account (after the $0 check), so "Change" on the
// confirmation screen and the next purchase both offer it as a saved payment method.
function saveCard(req, payment, billing) {
  if (payment.method !== 'card') return
  const acct = findAccount(req.storeSlug, req.store.user.email)
  if (acct && !acct.payment_methods.some(m => m.payment.last4 === payment.last4 && m.payment.brand === payment.brand)) {
    acct.payment_methods.push({ label: `${payment.brand} •••• ${payment.last4}`, payment, billing })
  }
}

// ---- browse ----
router.get('/', (req, res) => render(req, res, 'Xbox Official Site: Consoles, Games, and Community', P.homePage({ base: res.locals.base, products: PRODUCTS })))

router.get('/en-US/search/results', (req, res) => {
  const q = String(req.query.q ?? '').trim()
  const type = ['games', 'add-ons', 'subscriptions', 'hardware', 'support', 'general'].includes(req.query.type) ? req.query.type : 'games'
  const results = search(q, type)
  const counts = { games: search(q, 'games').length, addons: search(q, 'add-ons').length }
  render(req, res, `Search results for: ${q}`, P.searchPage({ base: res.locals.base, q, type, results, counts }))
})

router.get('/en-US/games/all-games/console', (req, res) => render(req, res, 'Shop all console games', P.gridPage({ base: res.locals.base, title: 'Console games', intro: 'Shop all games for Xbox Series X|S.', products: PRODUCTS.filter(p => p.type === 'game') })))

const STUBS = {
  '/en-US/xbox-game-pass': ['Xbox Game Pass', '<p>Xbox Game Pass Essential $9.99/mo, Premium $14.99/mo and Ultimate $22.99/mo. A subscription, not a store discount: it does not change the price of Grand Theft Auto VI.</p>'],
  '/en-US/consoles': ['Devices', '<p>Xbox Series X, Xbox Series S, controllers and accessories.</p>'],
  '/en-US/play': ['Play', '<p>Xbox Cloud Gaming lets you play from the browser on supported devices.</p>'],
  '/en-US/more': ['More', '<p>Store, Community, Support, My XBOX (Profile, Rewards, Wish list), Developers.</p>'],
  '/en-US/support': ['Xbox Support', '<p>Help with purchases, billing and pre-orders. Pre-orders can be cancelled from Order history up to 10 days before release.</p>'],
  '/en-US/redeem': ['Redeem a code', '<p>Enter the 25-character code from a gift card or prepaid code. The amount is added to your Microsoft account balance.</p>'],
}
for (const [path, [title, html]] of Object.entries(STUBS)) router.get(path, (req, res) => render(req, res, title, P.simplePage({ title, html: html + `<p><a href="${res.locals.base}/">Back to Xbox home</a></p>` })))

router.get('/art/:file', (req, res) => {
  const p = byId(String(req.params.file).replace(/\.svg$/, ''))
  if (!p) return res.status(404).end()
  res.type('image/svg+xml').send(P.coverArt(p))
})

function related(p) {
  const list = ids => (ids ?? []).map(byId).filter(Boolean)
  return { bundle: list(p.bundle), includedIn: list(p.includedIn), addons: list(p.addons) }
}
function productHtml(req, res, p) {
  const menuOpen = req.store.menuOpen === p.id // one-shot flag set by the silent "Add to cart"
  delete req.store.menuOpen
  return P.productPage({ base: res.locals.base, p, editions: editions(), related: related(p), inCart: req.store.cart.some(l => l.pid === p.id), menuOpen })
}

router.get('/en-US/games/store/:slug/:id', (req, res) => {
  const p = byId(req.params.id)
  if (!p) return notFound(req, res)
  if (req.params.slug !== p.slug) return res.redirect(productPath(res.locals.base, p))
  render(req, res, `${p.purchasable ? 'Buy ' : ''}${p.title}`, productHtml(req, res, p), { theme: 'dark' })
})

// ---- direct purchase: PRE-ORDER button -> sign-in wall -> Microsoft Store purchase dialog ----
router.post('/en-US/games/store/:slug/:id/preorder', (req, res) => {
  const p = byId(req.params.id)
  if (!p || !p.purchasable) return notFound(req, res)
  const buyUrl = `${productPath(res.locals.base, p)}/buy`
  if (!req.store.user) return signinWall(req, res, buyUrl)
  res.redirect(buyUrl)
})

router.get('/en-US/games/store/:slug/:id/buy', (req, res) => {
  const p = byId(req.params.id)
  if (!p || !p.purchasable) return notFound(req, res)
  if (!req.store.user) return signinWall(req, res, `${productPath(res.locals.base, p)}/buy`)
  const dialog = P.payDialog({ base: res.locals.base, p, t: priceTotals(p.price), saved: savedMethods(req) })
  render(req, res, `Buy ${p.title}`, P.dialogOver({ pageBody: productHtml(req, res, p), dialog }), { theme: 'dark' })
})

router.post('/en-US/games/store/:slug/:id/buy', (req, res) => {
  const p = byId(req.params.id)
  if (!p || !p.purchasable) return notFound(req, res)
  if (!req.store.user) return signinWall(req, res, `${productPath(res.locals.base, p)}/buy`)
  const saved = savedMethods(req)
  const { payment, billing, values, errors } = readPayment(req, saved)
  if (Object.keys(errors).length) {
    const dialog = P.payDialog({ base: res.locals.base, p, t: priceTotals(p.price), values, errors, saved })
    return render(req, res, `Buy ${p.title}`, P.dialogOver({ pageBody: productHtml(req, res, p), dialog }), { status: 400, theme: 'dark' })
  }
  saveCard(req, payment, billing)
  req.store.checkout.purchase = { pid: p.id, payment, billing }
  res.redirect(`${productPath(res.locals.base, p)}/buy/confirm`)
})

router.get('/en-US/games/store/:slug/:id/buy/confirm', (req, res) => {
  const p = byId(req.params.id)
  if (!p || !p.purchasable) return notFound(req, res)
  if (!req.store.user) return signinWall(req, res, `${productPath(res.locals.base, p)}/buy`)
  const pending = req.store.checkout.purchase
  if (!pending || pending.pid !== p.id) return res.redirect(`${productPath(res.locals.base, p)}/buy`)
  const dialog = P.confirmDialog({ base: res.locals.base, p, payment: pending.payment, billing: pending.billing, t: priceTotals(p.price) })
  render(req, res, `Confirm payment - ${p.title}`, P.dialogOver({ pageBody: productHtml(req, res, p), dialog }), { theme: 'dark' })
})

router.post('/en-US/games/store/:slug/:id/buy/confirm', (req, res) => {
  const p = byId(req.params.id)
  if (!p || !p.purchasable) return notFound(req, res)
  if (!req.store.user) return signinWall(req, res, `${productPath(res.locals.base, p)}/buy`)
  const pending = req.store.checkout.purchase
  if (!pending || pending.pid !== p.id) return res.redirect(`${productPath(res.locals.base, p)}/buy`)
  const item = p.kind === 'game'
    ? { platform: p.platform, edition: p.edition, format: p.format, qty: 1, unit_price: p.price, title: p.title, sku: p.id }
    : { kind: 'other', title: p.title, qty: 1, unit_price: p.price, sku: p.id }
  const { order, token } = placeOrder(req, { items: [item], payment: pending.payment, billing: pending.billing, t: priceTotals(p.price), path: 'direct' })
  delete req.store.checkout.purchase
  req.store.cart = req.store.cart.filter(l => l.pid !== p.id)
  res.redirect(`${res.locals.base}/en-US/purchase/complete?order=${order.order_number}&token=${token}`)
})

router.get('/en-US/purchase/complete', (req, res) => {
  const order = getOrder(String(req.query.order ?? ''))
  if (!order || order.store !== req.storeSlug || order.meta.token !== req.query.token) return render(req, res, 'Order not found', P.simplePage({ title: 'Order not found', html: `<p>We couldn't find that order. Check <a href="${res.locals.base}/account/billing/orders">Order history</a>.</p>` }), { status: 404 })
  const p = byId(order.items[0]?.sku)
  const body = order.meta.path === 'direct' && p
    ? P.dialogOver({ pageBody: productHtml(req, res, p), dialog: P.thanksCard({ base: res.locals.base, order, p }) })
    : P.thanksPage({ base: res.locals.base, order, p })
  render(req, res, 'Thanks for your purchase', body, { theme: 'dark' })
})

// ---- cart path: "..." -> Add to cart -> Cart -> Checkout ----
router.post('/en-US/cart/add', (req, res) => {
  const p = byId(req.body.pid)
  if (!p || !p.purchasable) return res.redirect(`${res.locals.base}/`)
  // A digital licence is one per account: re-adding does not create a second line.
  if (!req.store.cart.some(l => l.pid === p.id)) req.store.cart.push({ pid: p.id })
  req.store.saved = (req.store.saved ?? []).filter(id => id !== p.id)
  req.store.menuOpen = p.id
  res.redirect(productPath(res.locals.base, p)) // silent add: no modal or toast, the open menu's entry becomes "Open cart"
})

router.get('/en-US/cart', (req, res) => {
  req.store.cartId ??= tenDigits()
  const saved = (req.store.saved ?? []).map(id => ({ product: byId(id) })).filter(l => l.product)
  render(req, res, 'Shopping cart', P.cartPage({ base: res.locals.base, t: totals(req.store), saved, cartId: req.store.cartId }), { theme: 'dark' })
})

router.post('/en-US/cart/update', (req, res) => {
  const pid = String(req.body.pid ?? '')
  const action = req.body.action
  if (action === 'remove' || action === 'save') req.store.cart = req.store.cart.filter(l => l.pid !== pid)
  if (action === 'save' && byId(pid) && !(req.store.saved ?? []).includes(pid)) req.store.saved = [...(req.store.saved ?? []), pid]
  if (action === 'move' && byId(pid)) {
    req.store.saved = (req.store.saved ?? []).filter(id => id !== pid)
    if (!req.store.cart.some(l => l.pid === pid)) req.store.cart.push({ pid })
  }
  res.redirect(`${res.locals.base}/en-US/cart`)
})

router.post('/en-US/cart/checkout', (req, res) => {
  if (!req.store.cart.length) return res.redirect(`${res.locals.base}/en-US/cart`)
  const url = `${res.locals.base}/en-US/checkout`
  if (!req.store.user) return signinWall(req, res, url)
  res.redirect(url)
})

router.get('/en-US/checkout', (req, res) => {
  if (!req.store.cart.length) return res.redirect(`${res.locals.base}/en-US/cart`)
  if (!req.store.user) return signinWall(req, res, `${res.locals.base}/en-US/checkout`)
  render(req, res, 'Checkout', P.checkoutPage({ base: res.locals.base, user: req.store.user, t: totals(req.store), saved: savedMethods(req) }), { theme: 'dark' })
})

router.post('/en-US/checkout', (req, res) => {
  const base = res.locals.base
  if (!req.store.cart.length) return res.redirect(`${base}/en-US/cart`)
  if (!req.store.user) return signinWall(req, res, `${base}/en-US/checkout`)
  const saved = savedMethods(req)
  const t = totals(req.store)
  if (req.body.action === 'promo') {
    // ASSUMPTION: no promo code applies to this pre-order; the real wording of the rejection was not observed.
    const values = { ...req.body, cardNumber: '', cvv: '' }
    const promoError = String(req.body.promo ?? '').trim() ? 'That promo code isn\'t valid for the items in your cart.' : 'Enter a promo code.'
    return render(req, res, 'Checkout', P.checkoutPage({ base, user: req.store.user, t, values, saved, promoError }), { theme: 'dark' })
  }
  const { payment, billing, values, errors } = readPayment(req, saved)
  if (Object.keys(errors).length) return render(req, res, 'Checkout', P.checkoutPage({ base, user: req.store.user, t, values, errors, saved }), { status: 400, theme: 'dark' })
  const items = t.lines.map(l => l.product.kind === 'game'
    ? { platform: l.product.platform, edition: l.product.edition, format: l.product.format, qty: 1, unit_price: l.product.price, title: l.product.title, sku: l.product.id }
    : { kind: 'other', title: l.product.title, qty: 1, unit_price: l.product.price, sku: l.product.id })
  const { order, token } = placeOrder(req, { items, payment, billing, t, path: 'cart' })
  req.store.cart = []
  res.redirect(`${base}/en-US/purchase/complete?order=${order.order_number}&token=${token}`)
})

// ---- Microsoft account sign-in (login.live.com): email -> password -> "Stay signed in?" -> back to the store ----
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
const SIGNIN_TITLE = 'Sign in' // tab title of the observed sign-in page
router.get('/login.live.com/oauth20_authorize.srf', (req, res) => {
  const ru = String(req.query.ru ?? '')
  if (ru.startsWith(`${res.locals.base}/`)) req.store.checkout.returnTo = ru
  renderAuth(req, res, SIGNIN_TITLE, P.signinEmailPage({ base: res.locals.base, email: req.query.username ?? req.store.checkout.loginEmail ?? '' }))
})
router.post('/login.live.com/oauth20_authorize.srf', (req, res) => {
  const email = String(req.body.loginfmt ?? '').trim()
  if (!EMAIL_RE.test(email)) return renderAuth(req, res, SIGNIN_TITLE, P.signinEmailPage({ base: res.locals.base, email, error: 'Enter a valid email address or phone number.' }), 400)
  if (!findAccount(req.storeSlug, email)) return renderAuth(req, res, SIGNIN_TITLE, P.signinEmailPage({ base: res.locals.base, email, error: 'That Microsoft account doesn\'t exist. Enter a different account or get a new one.' }), 400)
  req.store.checkout.loginEmail = email
  res.redirect(`${res.locals.base}/login.live.com/password.srf`)
})
router.get('/login.live.com/password.srf', (req, res) => {
  if (!req.store.checkout.loginEmail) return res.redirect(`${res.locals.base}/login.live.com/oauth20_authorize.srf`)
  renderAuth(req, res, SIGNIN_TITLE, P.signinPasswordPage({ base: res.locals.base, email: req.store.checkout.loginEmail }))
})
router.post('/login.live.com/password.srf', (req, res) => {
  const email = req.store.checkout.loginEmail
  if (!email) return res.redirect(`${res.locals.base}/login.live.com/oauth20_authorize.srf`)
  const acct = authenticate(req.storeSlug, email, req.body.passwd)
  if (!acct) return renderAuth(req, res, SIGNIN_TITLE, P.signinPasswordPage({ base: res.locals.base, email, error: 'Your account or password is incorrect. If you don\'t remember your password, reset it now.' }), 401)
  req.store.user = publicAccount(acct)
  delete req.store.checkout.loginEmail
  res.redirect(req.store.skipKmsi ? `${res.locals.base}/auth/msa?action=loggedIn` : `${res.locals.base}/login.live.com/kmsi.srf`)
})
router.get('/login.live.com/kmsi.srf', (req, res) => {
  if (!req.store.user) return res.redirect(`${res.locals.base}/login.live.com/oauth20_authorize.srf`)
  renderAuth(req, res, 'Stay signed in?', P.kmsiPage({ base: res.locals.base }))
})
router.post('/login.live.com/kmsi.srf', (req, res) => {
  if (req.body.dontshow) req.store.skipKmsi = true // "Don't show this again" skips the prompt on later sign-ins
  res.redirect(`${res.locals.base}/auth/msa?action=loggedIn`) // "Yes" and "No" both continue
})

router.get('/auth/msa', (req, res) => {
  const base = res.locals.base
  const ru = req.store.checkout.returnTo
  delete req.store.checkout.returnTo
  res.redirect(req.store.user && typeof ru === 'string' && ru.startsWith(`${base}/`) ? ru : `${base}/`)
})
router.get('/signout', (req, res) => { req.store.user = null; req.store.checkout = {}; res.redirect(`${res.locals.base}/`) })

router.get('/signup.live.com/signup', (req, res) => renderAuth(req, res, 'Create account', P.signupPage({ base: res.locals.base })))
router.post('/signup.live.com/signup', (req, res) => {
  const v = req.body, errors = {}
  if (!EMAIL_RE.test(String(v.email ?? '').trim())) errors.email = 'Enter a valid email address.'
  const pw = String(v.password ?? '')
  const classes = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter(re => re.test(pw)).length
  if (pw.length < 8 || classes < 2) errors.password = 'Passwords must have at least 8 characters and contain at least two of the following: uppercase letters, lowercase letters, numbers, and symbols.'
  for (const [k, label] of [['firstName', 'First name'], ['lastName', 'Last name']]) if (!String(v[k] ?? '').trim()) errors[k] = `${label} is required.`
  if (!v.birthMonth || !v.birthDay || !v.birthYear) errors.birthdate = 'Enter your birthdate.'
  if (!Object.keys(errors).length) {
    const acct = createAccount(req.storeSlug, { email: v.email.trim(), password: pw, first_name: v.firstName.trim(), last_name: v.lastName.trim(), country: 'US', birthdate: `${v.birthYear}-${String(v.birthMonth).padStart(2, '0')}-${String(v.birthDay).padStart(2, '0')}` })
    if (acct.error) errors.email = 'Someone already has this email address. Try another name or sign in.'
    else { req.store.user = publicAccount(acct); return res.redirect(`${res.locals.base}/auth/msa?action=loggedIn`) }
  }
  renderAuth(req, res, 'Create account', P.signupPage({ base: res.locals.base, values: { ...v, password: '' }, errors }), 400)
})

// ---- account.microsoft.com > Payment & billing > Order history ----
router.get('/account/billing/orders', (req, res) => {
  if (!req.store.user) return signinWall(req, res, `${res.locals.base}/account/billing/orders`)
  const orders = listOrders({ store: req.storeSlug }).filter(o => o.customer.email === req.store.user.email)
  render(req, res, 'Order history', P.ordersPage({ base: res.locals.base, user: req.store.user, orders }))
})

export default {
  slug: 'xbox-store',
  name: NAME,
  country: 'US',
  currency: 'USD',
  description: 'US. Digital Xbox Series X|S only, Standard/Ultimate as separate pages, Microsoft-account wall (no guest), PRE-ORDER purchase dialog or cart checkout.',
  router,
}
