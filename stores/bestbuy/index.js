import { Router } from 'express'
import { randomBytes, randomInt } from 'node:crypto'
import { recordOrder, getOrder, listOrders } from '../../lib/orders.js'
import { validateCard } from '../../lib/payment.js'
import { authenticate, createAccount, publicAccount } from '../../lib/accounts.js'
import { PRODUCTS, byId, search, totals, STATES, STORE_NAME, FULFILLMENT } from './data.js'
import * as P from './pages.js'

const router = Router()
const HUB = '/site/video-game-franchises/grand-theft-auto/pcmcat301800050002.c'
const MAX_QTY = 3 // the cart's Item Quantity select offers 1, 2, 3
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
const NAME_RE = /^[\p{L}][\p{L} .'-]*$/u
const ZIP_RE = /^\d{5}(-\d{4})?$/

// ---- helpers ----
const trim = v => String(v ?? '').trim()
const digits = v => String(v ?? '').replace(/\D/g, '')
const phoneDigits = v => { const d = digits(v); return d.length === 11 && d.startsWith('1') ? d.slice(1) : d }
// The real MM/YY field inserts the slash as you type, so "1229" means 12/29.
const expiry = v => { const s = trim(v); return /^\d{4}$|^\d{6}$/.test(s) ? `${s.slice(0, 2)}/${s.slice(2)}` : s }
const hasErrors = errors => Object.keys(errors).length > 0

function render(req, res, title, body, { status = 200, chrome = 'full', back = null } = {}) {
  res.status(status).type('html').send(P.layout({ base: res.locals.base, title, body, cartCount: totals(req.store).count, user: req.store.user, chrome, back }))
}
function notFound(req, res) {
  render(req, res, 'Page Not Found - Best Buy', P.simplePage({ title: "Sorry, we can't find that page.", html: `<p>The page you requested may have moved or is no longer available.</p><p><a href="${res.locals.base}/">Go to the Best Buy home page</a></p>` }), { status: 404 })
}

// BBY01- plus 11 digits, e.g. BBY01-80665361421.
function orderNumber() { return `BBY01-8${String(randomInt(0, 1e10)).padStart(10, '0')}` }

const checkoutUrl = base => `${base}/checkout/c/standard`
const signinUrl = base => `${base}/identity/signin?token=tid.${randomBytes(12).toString('hex')}`
const co = req => { req.store.checkout.done ??= {}; return req.store.checkout }
const hasLines = req => totals(req.store).lines.length > 0

// Steps depend on the fulfillment mix: pickup-only 3, shipping-only 4, mixed 5.
function stepsFor(t) {
  return ['contact', ...(t.hasShipping ? ['address', 'shipdetails'] : []), ...(t.hasPickup ? ['pickup'] : []), 'payment']
}
// The first unfinished step is open; "Edit" (?step=) reopens a finished one.
function activeStep(steps, c, requested) {
  if (requested && requested !== 'payment' && steps.includes(requested) && c.done[requested]) return requested
  return steps.find(s => s === 'payment' || !c.done[s])
}
const priorStepsDone = (steps, c) => steps.filter(s => s !== 'payment').every(s => c.done[s])

// Saved values for a step, so "Edit" and re-renders show what the shopper typed.
function stepValues(req, step) {
  const c = co(req), u = req.store.user
  if (step === 'contact') return c.contact ?? (u ? { emailAddress: u.email, phoneNumber: u.phone } : {})
  if (step === 'address') return c.address ?? (u ? { firstName: u.first_name, lastName: u.last_name } : {})
  if (step === 'pickup') return c.pickup?.person ?? {}
  if (step === 'payment') return c.paymentValues ?? (u ? { billingFirstName: u.first_name, billingLastName: u.last_name } : {})
  return {}
}

function renderCheckout(req, res, { active, values, errors = {}, gift, status = 200 } = {}) {
  const base = res.locals.base
  const t = totals(req.store), c = co(req), steps = stepsFor(t)
  active ??= activeStep(steps, c, req.query.step)
  values ??= stepValues(req, active)
  const toast = c.toast
  delete c.toast
  render(req, res, 'Checkout – Best Buy', P.checkoutPage({ base, user: req.store.user, t, steps, active, co: c, values, errors, toast, gift }),
    { status, chrome: 'checkout', back: { href: `${base}/cart`, label: 'Back to cart', count: t.count } })
}

// Checkout needs items plus a signed-in shopper or a "Continue as Guest" choice.
function gate(req, res) {
  if (!hasLines(req)) { res.redirect(`${res.locals.base}/cart`); return false }
  if (!req.store.user && !req.store.checkout.guest) { res.redirect(signinUrl(res.locals.base)); return false }
  return true
}

function validateAddress(v, { first, last, line1, city, state, zip }) {
  const e = {}
  if (!v[first]) e[first] = 'Please enter a first name.'
  else if (!NAME_RE.test(v[first])) e[first] = 'Please enter a valid first name.'
  if (!v[last]) e[last] = 'Please enter a last name.'
  else if (!NAME_RE.test(v[last])) e[last] = 'Please enter a valid last name.'
  if (!v[line1]) e[line1] = line1 === 'addressLine1' ? 'Please enter address.' : 'Please enter a valid address.'
  else if (!/[a-z0-9]/i.test(v[line1])) e[line1] = 'Please enter a valid address.'
  if (!v[city]) e[city] = city === 'city' ? 'Please enter city name.' : 'Please enter a city.'
  else if (!/^[\p{L} .'-]+$/u.test(v[city])) e[city] = 'Please enter a valid city.'
  if (!STATES.includes(v[state])) e[state] = 'Please select a state.'
  if (!v[zip]) e[zip] = 'Please enter a ZIP code.'
  else if (!ZIP_RE.test(v[zip])) e[zip] = 'Please enter a valid ZIP code.'
  return e
}

router.use((req, res, next) => { req.body ??= {}; next() })

// ---- browse ----
router.get('/', (req, res) => render(req, res, 'Best Buy | Official Online Store | Shop Now & Save', P.homePage({ base: res.locals.base, products: PRODUCTS })))
// Franchise hub the search banner and header band link to.
router.get(HUB, (req, res) => render(req, res, 'Grand Theft Auto VI - Best Buy', P.homePage({ base: res.locals.base, products: PRODUCTS })))

router.get('/site/searchpage.jsp', (req, res) => {
  const q = trim(req.query.st ?? req.query.q)
  render(req, res, `${q || 'Search'} - Best Buy`, P.searchPage({ base: res.locals.base, q, products: search(q) }))
})

function productRoute(req, res) {
  const p = byId(req.params.sku ?? '') ?? byId(req.params.id)
  if (!p) return notFound(req, res)
  const accessories = p.kind === 'game' ? PRODUCTS.filter(x => x.kind === 'other' && /The Album/.test(x.title)) : []
  render(req, res, `${p.pageTitle} - Best Buy`, P.productPage({ base: res.locals.base, p, accessories }))
}
router.get('/product/:slug/:id/sku/:sku', productRoute)
router.get('/product/:slug/:id', productRoute)

// ---- cart ----
// "Pre-order" adds the SKU with the chosen fulfillment and goes straight to the cart (no modal).
router.post('/cart/add', (req, res) => {
  const base = res.locals.base
  const p = byId(req.body.pid)
  if (!p) return res.redirect(`${base}/cart`)
  const chosen = ['pickup', 'shipping'].includes(req.body.fulfillment) ? req.body.fulfillment : null
  const line = req.store.cart.find(l => l.pid === p.sku)
  if (line) {
    line.qty = Math.min(line.qty + 1, MAX_QTY)
    if (chosen) line.fulfillment = chosen
  } else {
    req.store.cartSeq = (req.store.cartSeq ?? 0) + 1
    // Pickup is the default fulfillment (store auto-picked from location).
    req.store.cart.push({ line: req.store.cartSeq, pid: p.sku, qty: 1, fulfillment: chosen ?? 'pickup' })
  }
  res.redirect(`${base}/cart`)
})

router.get('/cart', (req, res) => {
  const t = totals(req.store)
  const inCart = new Set(t.lines.map(l => l.product.sku))
  const alsoBought = PRODUCTS.filter(p => !inCart.has(p.sku)).slice(0, 4)
  const saved = (req.store.saved ?? []).map(s => ({ ...s, product: byId(s.pid) })).filter(s => s.product)
  render(req, res, 'Cart - Best Buy', P.cartPage({ base: res.locals.base, t, alsoBought, saved }))
})

router.post('/cart/update', (req, res) => {
  const item = req.store.cart.find(l => l.line === Number(req.body.line))
  const action = req.body.action || 'update' // the selects/radios auto-submit without an action
  if (item) {
    if (action === 'remove' || action === 'save') req.store.cart = req.store.cart.filter(l => l !== item)
    if (action === 'save') req.store.saved = [...(req.store.saved ?? []).filter(s => s.pid !== item.pid), { pid: item.pid, fulfillment: item.fulfillment }]
    if (action === 'update') {
      const q = Number(req.body.qty)
      if (Number.isInteger(q) && q >= 1 && q <= MAX_QTY) item.qty = q
      const f = req.body['availability-selection']
      if (f === 'pickup' || f === 'shipping') item.fulfillment = f
    }
  }
  res.redirect(`${res.locals.base}/cart`)
})

router.post('/cart/saved', (req, res) => {
  const s = (req.store.saved ?? []).find(x => x.pid === String(req.body.pid))
  if (s) {
    req.store.saved = req.store.saved.filter(x => x !== s)
    if (req.body.action === 'move' && !req.store.cart.some(l => l.pid === s.pid)) {
      req.store.cartSeq = (req.store.cartSeq ?? 0) + 1
      req.store.cart.push({ line: req.store.cartSeq, pid: s.pid, qty: 1, fulfillment: s.fulfillment ?? 'pickup' })
    }
  }
  res.redirect(`${res.locals.base}/cart`)
})

// ASSUMPTION: PayPal Checkout from the cart hands off to PayPal and comes back to guest checkout with PayPal
// as the payment method; the PayPal window itself is not simulated.
router.post('/cart/paypal', (req, res) => {
  const base = res.locals.base
  if (!hasLines(req)) return res.redirect(`${base}/cart`)
  if (!req.store.user) req.store.checkout.guest = true
  co(req).paymentMethod = 'paypal'
  res.redirect(checkoutUrl(base))
})

// ---- checkout entry ----
// The cart's "Checkout" button posts here; signed-out shoppers get the "Sign In to Best Buy" interstitial.
router.post('/checkout/r/fast-track', (req, res) => {
  const base = res.locals.base
  if (!hasLines(req)) return res.redirect(`${base}/cart`)
  if (req.store.user || req.store.checkout.guest) return res.redirect(checkoutUrl(base))
  res.redirect(signinUrl(base))
})
// Quirk from the research: deep-linking /checkout/r/fast-track skipped the interstitial and opened guest checkout.
router.get('/checkout/r/fast-track', (req, res) => {
  const base = res.locals.base
  if (!hasLines(req)) return res.redirect(`${base}/cart`)
  if (!req.store.user) req.store.checkout.guest = true
  res.redirect(checkoutUrl(base))
})
router.get('/checkout', (req, res) => res.redirect(checkoutUrl(res.locals.base)))

// ---- sign in ----
function signinChrome(req, res, mode) {
  return mode === 'checkout' ? { chrome: 'slim', back: { href: `${res.locals.base}/cart`, label: 'Return to cart' } } : { chrome: 'slim' }
}
function signinHandler(mode) {
  return (req, res) => {
    const base = res.locals.base, b = req.body ?? {}
    const page = (stage, email, error, status) => render(req, res, 'Sign In to Best Buy', P.signinPage({ base, mode, stage, email, error }), { status, ...signinChrome(req, res, mode) })
    if (b.action === 'guest') {
      if (!hasLines(req)) return res.redirect(`${base}/cart`)
      req.store.checkout.guest = true
      return res.redirect(checkoutUrl(base))
    }
    const email = trim(b.email)
    // ASSUMPTION: sign-in error wording (the password screen was not opened in the research).
    if (!email) return page('email', '', 'Please enter your email address.', 400)
    if (!EMAIL_RE.test(email)) return page('email', email, 'Please enter a valid email address.', 400)
    // Email first; the password is asked for on the next screen.
    if (!Object.hasOwn(b, 'password')) return page('password', email)
    if (!b.password) return page('password', email, 'Please enter your password.', 400)
    const acct = authenticate(req.storeSlug, email, b.password)
    if (!acct) return page('password', email, 'Oops! The email or password did not match our records. Please try again.', 401)
    req.store.user = publicAccount(acct)
    delete req.store.checkout.guest
    if (req.store.checkout.contact) req.store.checkout.contact.emailAddress = acct.email // signed in mid-checkout
    res.redirect(mode === 'checkout' && hasLines(req) ? checkoutUrl(base) : `${base}/`)
  }
}
router.get('/identity/signin', (req, res) => {
  if (req.store.user && hasLines(req)) return res.redirect(checkoutUrl(res.locals.base))
  render(req, res, 'Sign In to Best Buy', P.signinPage({ base: res.locals.base, mode: 'checkout' }), signinChrome(req, res, 'checkout'))
})
router.post('/identity/signin', signinHandler('checkout'))
router.get('/identity/global/signin', (req, res) => render(req, res, 'Sign In to Best Buy', P.signinPage({ base: res.locals.base, mode: 'global' }), signinChrome(req, res, 'global')))
router.post('/identity/global/signin', signinHandler('global'))

router.get('/identity/newAccount', (req, res) => render(req, res, 'Create an Account - Best Buy', P.createAccountPage({ base: res.locals.base }), { chrome: 'slim' }))
router.post('/identity/newAccount', (req, res) => {
  const v = { firstName: trim(req.body.firstName), lastName: trim(req.body.lastName), email: trim(req.body.email), password: String(req.body.password ?? ''), phone: trim(req.body.phone) }
  const errors = {}
  if (!v.firstName) errors.firstName = 'Please enter a first name.'
  if (!v.lastName) errors.lastName = 'Please enter a last name.'
  if (!v.email) errors.email = 'Please enter an email address.'
  else if (!EMAIL_RE.test(v.email)) errors.email = 'Please enter a valid email address.'
  // ASSUMPTION: password rule wording (the create-account form was not opened in the research).
  if (v.password.length < 8) errors.password = 'Your password must be at least 8 characters.'
  if (v.phone && phoneDigits(v.phone).length !== 10) errors.phone = 'Please enter a valid phone number.'
  if (!hasErrors(errors)) {
    const acct = createAccount(req.storeSlug, { email: v.email, password: v.password, first_name: v.firstName, last_name: v.lastName, phone: phoneDigits(v.phone) })
    if (acct.error) errors.email = acct.error
    else { req.store.user = publicAccount(acct); return res.redirect(`${res.locals.base}/account`) }
  }
  render(req, res, 'Create an Account - Best Buy', P.createAccountPage({ base: res.locals.base, values: { ...v, password: '' }, errors }), { status: 400, chrome: 'slim' })
})

router.get('/account', (req, res) => {
  if (!req.store.user) return res.redirect(`${res.locals.base}/identity/global/signin`)
  const orders = listOrders({ store: req.storeSlug }).filter(o => o.customer.email === req.store.user.email)
  render(req, res, 'Account Home - Best Buy', P.accountPage({ base: res.locals.base, user: req.store.user, orders }))
})
router.get('/logout', (req, res) => { req.store.user = null; req.store.checkout = {}; res.redirect(`${res.locals.base}/`) })

// ---- checkout: one page, numbered steps ----
router.get('/checkout/c/standard', (req, res) => {
  if (!gate(req, res)) return
  renderCheckout(req, res)
})

router.post('/checkout/contact', (req, res) => {
  if (!gate(req, res)) return
  const c = co(req), u = req.store.user
  const v = { emailAddress: u ? u.email : trim(req.body.emailAddress), phoneNumber: trim(req.body.phoneNumber), smsOptIn: req.body.smsOptIn === '1' ? '1' : '' }
  const errors = {}
  if (!v.emailAddress) errors.emailAddress = 'Please enter an email address.'
  else if (!EMAIL_RE.test(v.emailAddress)) errors.emailAddress = 'Please enter a valid email address.'
  if (!v.phoneNumber) errors.phoneNumber = 'Please enter a phone number.'
  else if (phoneDigits(v.phoneNumber).length !== 10) errors.phoneNumber = 'Please enter a valid phone number.' // ASSUMPTION: wording
  if (hasErrors(errors)) return renderCheckout(req, res, { active: 'contact', values: v, errors, status: 400 })
  c.contact = { ...v, phoneNumber: phoneDigits(v.phoneNumber) }
  c.done.contact = true
  res.redirect(checkoutUrl(res.locals.base))
})

router.post('/checkout/shipping-address', (req, res) => {
  if (!gate(req, res)) return
  const c = co(req), b = req.body
  if (!totals(req.store).hasShipping) return res.redirect(checkoutUrl(res.locals.base))
  const v = {
    firstName: trim(b.firstName), lastName: trim(b.lastName), addressLine1: trim(b.addressLine1), addressLine2: trim(b.addressLine2),
    city: trim(b.city), state: trim(b.state).toUpperCase(), postalCode: trim(b.postalCode),
    useAsBilling: b.useAsBilling === '1' ? '1' : '', saveToProfile: b.saveToProfile === '1' ? '1' : '', defaultAddress: b.defaultAddress === '1' ? '1' : '',
  }
  const errors = validateAddress(v, { first: 'firstName', last: 'lastName', line1: 'addressLine1', city: 'city', state: 'state', zip: 'postalCode' })
  if (hasErrors(errors)) return renderCheckout(req, res, { active: 'address', values: v, errors, status: 400 })
  c.address = v
  c.done.address = true
  res.redirect(checkoutUrl(res.locals.base))
})

// The pre-order has one FREE level of service, so this step only confirms it (see pages.js).
router.post('/checkout/shipping-details', (req, res) => {
  if (!gate(req, res)) return
  const c = co(req)
  if (totals(req.store).hasShipping) { c.levelOfService = 'standard'; c.done.shipdetails = true }
  res.redirect(checkoutUrl(res.locals.base))
})

const PERSON_FIELDS = ['firstName', 'lastName', 'emailAddress', 'phoneNumber']
router.post('/checkout/pickup', (req, res) => {
  if (!gate(req, res)) return
  const base = res.locals.base, c = co(req), b = req.body
  if (!totals(req.store).hasPickup) return res.redirect(checkoutUrl(base))
  const v = { firstName: trim(b.firstName), lastName: trim(b.lastName), emailAddress: trim(b.emailAddress), phoneNumber: trim(b.phoneNumber), rememberPickupPerson: b.rememberPickupPerson === '1' ? '1' : '' }
  if (b.action === 'confirmPerson') {
    const errors = {}
    if (!v.firstName) errors.firstName = 'Please enter a first name.'
    else if (!NAME_RE.test(v.firstName)) errors.firstName = 'Please enter a valid first name.'
    if (!v.lastName) errors.lastName = 'Please enter a last name.'
    else if (!NAME_RE.test(v.lastName)) errors.lastName = 'Please enter a valid last name.'
    if (!v.emailAddress) errors.emailAddress = 'Please enter an email address.'
    else if (!EMAIL_RE.test(v.emailAddress)) errors.emailAddress = 'Please enter a valid email address.'
    if (!v.phoneNumber) errors.phoneNumber = 'Please enter a phone number.'
    else if (phoneDigits(v.phoneNumber).length !== 10) errors.phoneNumber = 'Please enter a valid phone number.'
    if (hasErrors(errors)) return renderCheckout(req, res, { active: 'pickup', values: v, errors, status: 400 })
    c.pickup = { person: { ...v, phoneNumber: phoneDigits(v.phoneNumber) } }
    c.toast = 'Pickup person updated'
    return res.redirect(`${checkoutUrl(base)}?step=pickup`)
  }
  // "Continue" with a filled-in but unconfirmed pickup person trips the real guard message.
  const saved = c.pickup?.person
  const same = k => k === 'phoneNumber' ? phoneDigits(v[k]) === (saved?.[k] ?? '') : v[k] === (saved?.[k] ?? '')
  if (PERSON_FIELDS.some(k => v[k]) && !PERSON_FIELDS.every(same)) {
    return renderCheckout(req, res, { active: 'pickup', values: v, errors: { pickupPerson: 'Save your pickup person selection to continue.' }, status: 400 })
  }
  if (!PERSON_FIELDS.some(k => v[k])) c.pickup = null // emptied sheet: the shopper (name on billing address) picks up
  c.done.pickup = true
  res.redirect(checkoutUrl(base))
})

router.post('/checkout/gift-options', (req, res) => {
  if (!gate(req, res)) return
  const c = co(req), b = req.body, t = totals(req.store)
  const gift = {}, errors = {}
  for (const l of t.lines) {
    const k = l.line
    if (l.fulfillment === 'shipping') {
      const g = { message: b[`includeGiftMessage-${k}`] === '1', email: trim(b[`giftEmail-${k}`]), text: trim(b[`giftMessage-${k}`]).slice(0, 150) }
      if (!g.message) continue
      if (!g.text) errors[`giftMessage-${k}`] = 'Please enter a gift message.'
      if (g.email && !EMAIL_RE.test(g.email)) errors[`giftEmail-${k}`] = 'Please enter a valid email address.'
      gift[k] = g
    } else if (b[`includeGiftReceipt-${k}`] === '1') gift[k] = { receipt: true }
  }
  if (hasErrors(errors)) return renderCheckout(req, res, { gift: { values: gift, errors }, status: 400 })
  c.gift = Object.keys(gift).length ? gift : null
  c.toast = 'Gift options updated'
  res.redirect(checkoutUrl(res.locals.base))
})

router.post('/checkout/payment', (req, res) => {
  if (!gate(req, res)) return
  const base = res.locals.base, b = req.body, c = co(req)
  const t = totals(req.store), steps = stepsFor(t)
  if (b.action === 'paypal' || b.action === 'card') {
    c.paymentMethod = b.action
    return res.redirect(checkoutUrl(base))
  }
  if (!priorStepsDone(steps, c)) return res.redirect(checkoutUrl(base))

  const a = t.hasShipping ? c.address : null
  const billingFromShipping = !!a && a.useAsBilling === '1'
  const shipAddr = a ? { first_name: a.firstName, last_name: a.lastName, line1: a.addressLine1, line2: a.addressLine2 || null, city: a.city, state: a.state, postal_code: a.postalCode, country: 'US' } : null

  if (c.paymentMethod === 'paypal') {
    return placeOrder(req, res, { payment: { method: 'paypal' }, billing: billingFromShipping ? shipAddr : null })
  }

  const v = {
    expirationDate: expiry(b.expirationDate),
    billingFirstName: trim(b.billingFirstName), billingLastName: trim(b.billingLastName), billingAddressLine1: trim(b.billingAddressLine1), billingAddressLine2: trim(b.billingAddressLine2),
    billingCity: trim(b.billingCity), billingState: trim(b.billingState).toUpperCase(), billingPostalCode: trim(b.billingPostalCode),
    giftCardNumber: trim(b.giftCardNumber), giftCardPin: trim(b.giftCardPin), saveCard: b.saveCard === '1' ? '1' : '', preferredCard: b.preferredCard === '1' ? '1' : '',
  }
  const errors = {}
  const card = validateCard({ number: b.number, expiry: v.expirationDate, cvv: b.cvv })
  if (!card.ok) {
    if (card.errors.number) errors.number = 'Please enter a valid card number.'
    if (card.errors.expiry) errors.expirationDate = card.errors.expiry === 'This card has expired.'
      ? 'Your credit card is expired. Please use a different card or update the expiration date.'
      : 'Please enter a valid expiration date.'
    if (card.errors.cvv) errors.cvv = 'Please enter a valid Security Code.'
  } else if (t.lines.some(l => l.product.preorder)) {
    // Pre-orders are charged when the item is available (11/2026), so the card must still be valid then.
    const [, m, y] = v.expirationDate.match(/^(\d{1,2})\s*\/\s*(\d{2}|\d{4})$/)
    const year = Number(y) < 100 ? 2000 + Number(y) : Number(y)
    if (year < 2026 || (year === 2026 && Number(m) < 11)) errors.expirationDate = 'Your credit card is expiring soon. Since one of your items won’t be charged until it’s available, we need you to use a different card for this order.'
  }
  if (!billingFromShipping) Object.assign(errors, validateAddress(v, { first: 'billingFirstName', last: 'billingLastName', line1: 'billingAddressLine1', city: 'billingCity', state: 'billingState', zip: 'billingPostalCode' }))
  // No gift cards or discount codes exist in this environment, so any code is rejected like an unknown one.
  if (v.giftCardNumber) errors.giftCardNumber = 'Please enter a valid gift card or discount code.'

  c.paymentValues = v // never the card number or security code
  if (hasErrors(errors)) return renderCheckout(req, res, { active: 'payment', values: v, errors, status: 400 })

  const billing = billingFromShipping ? shipAddr
    : { first_name: v.billingFirstName, last_name: v.billingLastName, line1: v.billingAddressLine1, line2: v.billingAddressLine2 || null, city: v.billingCity, state: v.billingState, postal_code: v.billingPostalCode, country: 'US' }
  placeOrder(req, res, {
    payment: { method: 'card', brand: card.brand, last4: card.last4, name_on_card: `${billing.first_name} ${billing.last_name}`, expiration: v.expirationDate },
    billing,
  })
})

function placeOrder(req, res, { payment, billing }) {
  const base = res.locals.base, c = co(req), u = req.store.user
  const t = totals(req.store)
  const a = t.hasShipping ? c.address : null
  const person = t.hasPickup ? c.pickup?.person ?? null : null
  const kinds = [...new Set(t.lines.map(l => l.fulfillment))]
  const method = kinds.length > 1 ? 'mixed' : kinds[0] === 'pickup' ? 'pickup' : 'ship'
  const first = u?.first_name || a?.firstName || billing?.first_name || person?.firstName || ''
  const last = u?.last_name || a?.lastName || billing?.last_name || person?.lastName || ''
  const token = randomBytes(12).toString('hex')
  const order = recordOrder({
    store: req.storeSlug,
    order_number: orderNumber(),
    session: req.session,
    items: t.lines.map(l => l.product.kind === 'game'
      ? { platform: l.product.platform, edition: l.product.edition, format: l.product.format, qty: l.qty, unit_price: l.product.price, title: l.product.title, sku: l.product.sku }
      : { kind: 'other', title: l.product.title, qty: l.qty, unit_price: l.product.price, sku: l.product.sku }),
    customer: { email: (u?.email ?? c.contact.emailAddress).toLowerCase(), first_name: first, last_name: last, phone: c.contact.phoneNumber, account_id: u?.id ?? null, guest: !u },
    fulfillment: {
      method,
      option: t.hasShipping ? 'standard' : 'store_pickup',
      store_location: t.hasPickup ? STORE_NAME : null,
      eta: kinds.map(k => FULFILLMENT[k].eta).join(' / '),
    },
    shipping_address: a ? { first_name: a.firstName, last_name: a.lastName, line1: a.addressLine1, line2: a.addressLine2 || null, city: a.city, state: a.state, postal_code: a.postalCode, country: 'US', phone: c.contact.phoneNumber } : null,
    billing_address: billing,
    payment,
    totals: { subtotal: t.subtotal, shipping: t.shipping, tax: t.tax, total: t.total },
    currency: 'USD',
    meta: {
      token,
      items_fulfillment: t.lines.map(l => ({ sku: l.product.sku, fulfillment: l.fulfillment })),
      pickup_person: person ? { first_name: person.firstName, last_name: person.lastName, email: person.emailAddress, phone: person.phoneNumber } : null,
      sms_opt_in: c.contact.smsOptIn === '1',
      gift_options: c.gift ? t.lines.filter(l => c.gift[l.line]).map(l => ({ sku: l.product.sku, ...c.gift[l.line] })) : null,
    },
  })
  req.store.cart = []
  req.store.checkout = {}
  res.redirect(`${base}/checkout/r/thank-you?order=${encodeURIComponent(order.order_number)}&token=${token}`)
}

// ---- thank you ----
function findOrder(req, number, token) {
  const order = getOrder(String(number ?? ''))
  return order && order.store === req.storeSlug && order.meta.token === String(token ?? '') ? order : null
}
function orderNotFound(req, res) {
  render(req, res, 'Order Not Found - Best Buy', P.simplePage({ title: "We couldn't find that order.", html: `<p>Check your confirmation email for your order details.</p><p><a href="${res.locals.base}/">Continue shopping</a></p>` }), { status: 404 })
}
// ASSUMPTION: the thank-you page's <title> was not observed.
router.get('/checkout/r/thank-you', (req, res) => {
  const order = findOrder(req, req.query.order, req.query.token)
  if (!order) return orderNotFound(req, res)
  render(req, res, 'Thank You - Best Buy', P.thankYouPage({ base: res.locals.base, order }))
})

// Guest "Create an account" block on the thank-you page.
router.post('/checkout/r/create-account', (req, res) => {
  const order = findOrder(req, req.body.order, req.body.token)
  if (!order) return orderNotFound(req, res)
  let accountCreated = null
  if (order.customer.guest && req.body.save === '1') {
    const password = String(req.body.password ?? '')
    const acct = password.length >= 8
      ? createAccount(req.storeSlug, { email: order.customer.email, password, first_name: order.customer.first_name, last_name: order.customer.last_name, phone: order.customer.phone })
      : { error: 'short password' }
    if (acct.error) accountCreated = { ok: false, error: 'Sorry, but we were unable to create your account. Please try again.' }
    else { req.store.user = publicAccount(acct); accountCreated = { ok: true } }
  }
  render(req, res, 'Thank You - Best Buy', P.thankYouPage({ base: res.locals.base, order, accountCreated }), { status: accountCreated?.ok === false ? 400 : 200 })
})

router.use(notFound)

export default {
  slug: 'bestbuy',
  name: 'Best Buy',
  country: 'US',
  currency: 'USD',
  description: 'US. Code-in-box PS5/Xbox, Pickup or Shipping per item, straight-to-cart Pre-order, sign-in or guest, one-page stepped checkout.',
  router,
}
