import { enterScenarioCart, scenarioAvailability, scenarioPayment } from '../../lib/benchmark-scenarios.js'
import { fixtureCatalog } from '../../lib/catalog-policy.js'
import { Router } from 'express'
import { randomBytes, randomInt } from 'node:crypto'
import { recordOrder, getOrder } from '../../lib/orders.js'
import { luhn, cardBrand, last4 } from '../../lib/payment.js'
import { authenticate, findAccount, createAccount, publicAccount } from '../../lib/accounts.js'
import { byAsin, productPath, signinPath, search, cartLines, checkoutLines, totals, DELIVERY, STATES, PRODUCTS, deliveryOptions } from './data.js'
import { categoryIntro, productRow } from './browse.js'
import { FILTER_KEYS, values, nodeById, queryString } from './catalog.js'
import * as P from './pages.js'
import { retailState, rememberProduct, saveAddress } from '../../lib/retail-state.js'
import { registerJourneys, resumeWishlist, listsFor, savedInList, checkoutAddress, savedAddressChoices, accountOrders } from './journeys.js'
import { deliveryLocation, registerLocation } from './location.js'
import { registerParity, gatewayHome, collectionIntro } from './parity.js'

const NAME = 'Amazon'
const router = Router()

// Checkout step URLs (Amazon's legacy step handlers, minus the /handlers/display.html suffix).
const STEP = { address: '/gp/buy/addressselect', pay: '/gp/buy/payselect', spc: '/gp/buy/spc' }
// The checkout sign-in wall (research: openid.assoc_handle=amazon_checkout_us, return_to = checkout).
const checkoutWall = (step) => signinPath(STEP[step], 'amazon_checkout_us')

// ---- helpers ----
function render(req, res, title, body, { status = 200, chrome = 'full', ewc = false, subnav = false, q = '', dept = '' } = {}) {
  const lines = cartLines(req.store)
  const cartCount = lines.reduce((n, l) => n + l.qty, 0)
  // The "everywhere cart" right rail (search + product pages). "Added to cart" shows once, right after an add.
  const added = req.store.flash === 'added'
  req.store.flash = null
  const panel = ewc ? { lines, added, ret: req.originalUrl.slice(res.locals.base.length) || '/' } : null
  const checkoutCount = checkoutLines(req.store).reduce((n, l) => n + l.qty, 0)
  // "Hello, sign in" returns the shopper to the page they were on, as Amazon's openid.return_to does.
  const here = req.method === 'GET' ? (req.originalUrl.slice(res.locals.base.length) || '/') : '/'
  const state = retailState(req), locationNotice = state.amazonLocationNotice
  delete state.amazonLocationNotice
  res.status(status).type('html').send(P.layout({ base: res.locals.base, title, body, cartCount, user: req.store.user, chrome, ewc: panel, subnav, q, checkoutCount, here, dept, destination: deliveryLocation(req), addresses: req.store.user ? state.addresses : [], locationNotice }))
}
// Amazon order numbers are 3-7-7 digits, e.g. 113-1234567-1234567.
function orderNumber() { return `113-${String(randomInt(0, 1e7)).padStart(7, '0')}-${String(randomInt(0, 1e7)).padStart(7, '0')}` }
const clampQty = (v) => Math.min(5, Math.max(1, Number.parseInt(v, 10) || 1))
// Only a same-store path may be used as a post-action return target.
const safeRet = (ret) => (/^\/(?!\/)/.test(String(ret ?? '')) ? String(ret) : null)
const inCartMap = (store) => Object.fromEntries(store.cart.map(l => [l.asin, l.qty]))
function addToCart(store, asin, qty) {
  const line = store.cart.find(l => l.asin === asin)
  if (line) line.qty = Math.min(5, byAsin(asin).stock, line.qty + qty) // Amazon bumps the quantity of an ASIN already in the cart
  else store.cart.push({ asin, qty })
}
function notFound(req, res) {
  render(req, res, 'Page Not Found', P.simplePage({ title: "Sorry! We couldn't find that page.", html: `<p>Try searching or <a href="${res.locals.base}/">go to Amazon's home page</a>.</p>` }), { status: 404 })
}

function purchaseError(req,res) {
  return render(req,res,'Check your selection',P.simplePage({title:'Check your selection',html:`<p>Choose an available item and a quantity from 1 to 5${fixtureCatalog?', within the available stock':', within the local per-order limit'}. No items were added.</p><a href="${res.locals.base}/cart">Review your cart</a> · <a href="${res.locals.base}/">Continue shopping</a>`}),{status:400})
}


// Run-scoped availability changes are checked before every checkout boundary,
// including direct legacy routes. They never mutate the shared catalog.
router.use((req,res,next)=>{
  const checkout=/^\/(?:checkout(?:\/|$)|mrt\/checkout|gp\/buy\/|gp\/cart\/desktop\/go-to-checkout)/.test(req.path)
  if(checkout || (req.method==='GET' && /^\/(?:cart(?:\/|$)|gp\/cart\/view)/.test(req.path))) enterScenarioCart(req.store)
  const selection=[...req.store.cart,...(req.store.checkout.buyNow?[req.store.checkout.buyNow]:[])]
  const unavailable=selection.some(l=>scenarioAvailability(req.store,l.asin??l.tcin??l.pid,'shipping')===false)
  const adding=req.method==='POST'&&['/cart/add','/buy-now','/gp/product/handle-buy-box'].includes(req.path)
  const ids=[].concat(req.body?.asin??req.body?.ASIN??req.body?.tcin??req.body?.pid??[])
  if((checkout&&unavailable)||(adding&&ids.some(id=>scenarioAvailability(req.store,id,'shipping')===false))) return render(req,res,'Review your cart',P.cartPage({base:res.locals.base,t:totals(checkoutLines(req.store)),user:req.store.user}),{status:409})
  next()
})

registerParity(router, { render })
registerJourneys(router, { render, notFound, addToCart, purchaseError })
registerLocation(router, { render })

// ---- browse ----
router.get('/', (req, res) => {
  const recent = retailState(req).recent.map(byAsin).filter(Boolean).slice(0, 6)
  render(req, res, 'Amazon.com. Spend less. Smile more.', (fixtureCatalog ? P.homePage({ base: res.locals.base }) : gatewayHome({ base: res.locals.base, user: req.store.user })) + (recent.length ? productRow(res.locals.base, 'Your recently viewed items', recent) + `<p><a href="${res.locals.base}/gp/history">View or edit your browsing history</a></p>` : ''))
})

function browse(req,res,{node='',endpoint='/s',heading='',intro='',collection=''}={}) {
  const q = String(req.query.k ?? '').trim(), dept = String(req.query.i ?? '')
  const sort = String(req.query.s ?? (collection==='bestsellers'?'exact-aware-popularity-rank':collection==='new'?'date-desc-rank':''))
  const filters = Object.fromEntries(FILTER_KEYS.map(k=>[k,['brand','platform','type','condition','seller','format'].includes(k)?values(req.query[k]):String(req.query[k] ?? '')]))
  if (endpoint==='/s' && q && 'i' in req.query && !dept && !node && !Object.values(filters).some(v=>Array.isArray(v)?v.length:!!v) && !req.query.page) return res.redirect(`${res.locals.base}/s?k=${encodeURIComponent(q).replaceAll('%20','+')}${sort?`&s=${encodeURIComponent(sort)}`:''}`)
  let results=search(q,dept,sort,filters,node)
  if(collection==='deals') results=results.filter(p=>p.deal&&p.stock>0)
  render(req,res,`Amazon.com : ${heading||q||'All Departments'}`,intro+P.searchPage({base:res.locals.base,q,dept,sort,filters,results,node,endpoint,heading,page:req.query.page,inCart:inCartMap(req.store)}),{ewc:true,q,dept:dept||nodeById(node)?.parent||node})
}
router.get('/s', (req,res)=>browse(req,res,{node:String(req.query.node ?? '')}))
function departmentHandler(req,res) {
  const node=nodeById(String(req.query.node || 'videogames'))
  if(!node) return notFound(req,res)
  browse(req,res,{node:node.id,endpoint:'/b',heading:node.title,intro:categoryIntro({base:res.locals.base,node})})
}
router.get(['/b','/computer-video-games-hardware-accessories/b'],departmentHandler)
router.get('/gp/bestsellers',(req,res)=>browse(req,res,{endpoint:'/gp/bestsellers',heading:'Best Sellers',collection:'bestsellers',intro:collectionIntro(res.locals.base,'bestsellers')}))
router.get('/gp/new-releases',(req,res)=>browse(req,res,{endpoint:'/gp/new-releases',heading:'New Releases',collection:'new',intro:collectionIntro(res.locals.base,'new')}))
router.get('/gp/movers-and-shakers',(req,res)=>browse(req,res,{endpoint:'/gp/movers-and-shakers',heading:'Movers & Shakers',collection:'bestsellers',intro:collectionIntro(res.locals.base,'movers')}))
router.get('/gp/bestsellers/:department',(req,res)=>{
  const node=req.params.department==='all'?'':nodeById(req.params.department)?.id
  if(node===undefined) return notFound(req,res)
  browse(req,res,{node,endpoint:`/gp/bestsellers/${req.params.department}`,heading:'Best Sellers',collection:'bestsellers',intro:collectionIntro(res.locals.base,'bestsellers')})
})
router.get('/gp/new-releases/:department',(req,res)=>{
  const node=req.params.department==='all'?'':nodeById(req.params.department)?.id
  if(node===undefined) return notFound(req,res)
  browse(req,res,{node,endpoint:`/gp/new-releases/${req.params.department}`,heading:'New Arrivals',collection:'new',intro:collectionIntro(res.locals.base,'new')})
})
router.get('/gp/goldbox',(req,res)=>browse(req,res,{node:String(req.query.node||''),endpoint:'/gp/goldbox',heading:"Today's Deals",collection:'deals',intro:collectionIntro(res.locals.base,'deals')}))
router.get('/stores/:brand',(req,res)=>{
  const brand=[...new Set(PRODUCTS.map(p=>p.brand))].find(b=>b.toLowerCase().replace(/[^a-z0-9]/g,'')===req.params.brand.toLowerCase().replace(/[^a-z0-9]/g,''))
  if(!brand) return notFound(req,res)
  const products=PRODUCTS.filter(p=>p.brand===brand)
  render(req,res,`Amazon.com: ${brand} Store`,P.simplePage({title:`${brand} Store`,html:`<p>Explore products from this brand, compare options, and find your next favorite.</p><a href="${res.locals.base}/s?${queryString({brand})}">Search and refine this brand's products</a>`})+productRow(res.locals.base,'Shop the collection',products),{dept:products[0]?.department})
})

function productHandler(req, res) {
  const p = byAsin(req.params.asin)
  if (!p) return notFound(req, res)
  if (retailState(req).preferences.history !== false) rememberProduct(req, p.asin)
  const bundle = p.kind === 'game' ? [byAsin('B0H4ZELDOT'), byAsin('B0H4METRAV')].filter(Boolean) : []
  render(req, res, `Amazon.com: ${p.title} : ${p.crumbs[0]}`, P.productPage({ base: res.locals.base, p, inCart: inCartMap(req.store), listAdded: savedInList(req, p.asin), lists: listsFor(req), destination: deliveryLocation(req), bundle }), { ewc: true, subnav: p.department==='videogames', dept:p.department })
}
router.get('/dp/:asin', productHandler)
router.get('/gp/product/:asin', productHandler)
router.get('/:slug/dp/:asin', productHandler)

router.get('/tradein', (req, res) => render(req, res, 'Amazon Trade-In', P.simplePage({ title: 'Amazon Trade-In', html: `<p>Trade-in appraisal, shipping labels, and gift-card credit are not available in this storefront. You can browse accessories or contact Customer Service about a local order.</p><p><a href="${res.locals.base}/b?node=gaming-accessories">Browse gaming accessories</a> · <a href="${res.locals.base}/help">Customer Service</a></p>` })))

// ---- cart ----
// Search-tile "Add to cart" (and the PDP bundle button) add in place: the shopper is sent back to the
// page they were on, where the tile shows "N in cart" and the right-rail cart panel fills in.
router.post('/cart/add', (req, res) => {
  const asins = [...new Set([].concat(req.body.asin ?? []).map(a => String(a).toUpperCase()))]
  const qty = req.body.quantity===undefined?1:Number(req.body.quantity)
  if (!asins.length || !Number.isInteger(qty) || qty<1 || qty>5 || asins.some(asin=>!byAsin(asin)||byAsin(asin).stock<qty)) return purchaseError(req,res)
  for (const asin of asins) addToCart(req.store,asin,qty)
  req.store.flash='added'

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
  if(!['delete','dec','inc','save','move','delete-saved','update'].includes(action)) return purchaseError(req,res)
  if(action==='update' && req.body.quantity!==undefined && (!byAsin(asin) || !Number.isInteger(Number(req.body.quantity)) || Number(req.body.quantity)<1 || Number(req.body.quantity)>Math.min(5,byAsin(asin).stock))) return purchaseError(req,res)
  req.store.saved ??= []
  const line = req.store.cart.find(l => l.asin === asin)
  if (action === 'delete' || (action === 'dec' && line?.qty === 1)) req.store.cart = req.store.cart.filter(l => l.asin !== asin)
  else if (action === 'dec' && line) line.qty -= 1
  else if (action === 'inc' && line) line.qty = Math.min(5, byAsin(asin).stock, line.qty + 1)
  else if (action === 'save' && line) { req.store.cart = req.store.cart.filter(l => l.asin !== asin); req.store.saved.push({ asin, qty: line.qty }) }
  else if (action === 'move') { const s = req.store.saved.find(l => l.asin === asin); if (s) { if (!byAsin(asin) || byAsin(asin).stock < s.qty) return purchaseError(req,res); req.store.saved = req.store.saved.filter(l => l.asin !== asin); addToCart(req.store, asin, s.qty) } }
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
  const qty = Number(req.body.quantity ?? 1)
  if (!p || !Number.isInteger(qty) || qty<1 || qty>5 || qty>p.stock) return purchaseError(req,res)
  if (req.body['submit.add-to-cart'] !== undefined) {
    addToCart(req.store, p.asin, qty)
    req.store.flash = 'added'
    return res.redirect(`${base}${safeRet(req.body.ret) ?? productPath('', p)}`)
  }
  res.redirect(`${base}/checkout/entry/buynow?ASIN=${encodeURIComponent(p.asin)}&quantity=${qty}&isBuyNow=1`)
})
router.get('/checkout/entry/buynow', (req, res) => {
  const p = byAsin(req.query.ASIN)
  const qty=Number(req.query.quantity ?? 1)
  if (!p || !Number.isInteger(qty) || qty<1 || qty>5 || qty>p.stock) return purchaseError(req,res)
  req.store.checkout.buyNow = { asin: p.asin, qty }
  req.store.checkout.gift = false
  toCheckout(req, res)
})

// ---- auth: unified "Sign in or create account" flow ----
// The page to land on after signing in travels in openid.return_to (as on amazon.com) and is kept in
// req.store.signin until the password or create-account step succeeds.
function finishSignin(req, res, acct) {
  if (req.store.user && req.store.user.id !== acct.id) {
    // A direct account switch must not carry the previous shopper's private
    // delivery or payment details into the new account's checkout.
    req.store.checkout = { buyNow: req.store.checkout.buyNow || null }
  }
  req.store.user = publicAccount(acct)
  const ret = resumeWishlist(req) || safeRet(req.store.signin?.returnTo)
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

router.get('/gp/flex/sign-out.html', (req, res) => { req.store.user = null; req.store.checkout = {}; req.store.signin = null; delete req.store.amazonPendingList; res.redirect(`${res.locals.base}/`) })

// ---- checkout steps: address → payment → review ----
// Each step needs items to check out, a signed-in shopper, and the earlier steps completed.
function gate(req, res, step) {
  const base = res.locals.base, co = req.store.checkout
  if (!checkoutLines(req.store).length) { res.redirect(`${base}/cart`); return false }
  if (!req.store.user) { res.redirect(`${base}${checkoutWall(step)}`); return false }
  // Stock can change after an item was saved, added, or reviewed. Recheck the
  // complete selection at every checkout boundary, including final placement.
  const selection = co.buyNow ? [co.buyNow] : req.store.cart
  if (selection.some(l => !byAsin(l.asin) || !Number.isInteger(l.qty) || l.qty < 1 || l.qty > Math.min(5, byAsin(l.asin).stock))) {
    purchaseError(req,res); return false
  }
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
  render(req, res, 'Select a delivery address - Amazon.com Checkout', P.addressPage({ base: res.locals.base, t: coTotals(req), values, savedChoices: savedAddressChoices(res.locals.base, retailState(req).addresses) }), { chrome: 'checkout' })
})
router.post(STEP.address, (req, res) => {
  if (!gate(req, res, 'address')) return
  const v = req.body, errors = {}
  if (v.addressId !== undefined) {
    const address = retailState(req).addresses.find(a => a.id === v.addressId)
    if (!address) return render(req, res, 'Select a delivery address', P.addressPage({ base: res.locals.base, t: coTotals(req), errors: { addressId: 'Choose one of your saved addresses.' }, savedChoices: savedAddressChoices(res.locals.base, retailState(req).addresses) }), { chrome: 'checkout', status: 400 })
    req.store.checkout.address = checkoutAddress(address)
    return res.redirect(`${res.locals.base}${STEP.pay}`)
  }
  const s = (k) => String(v[k] ?? '').trim()
  // ASSUMPTION: Amazon's inline address-form messages were not captured; these follow its "Please enter ..." style.
  if (v.countryCode && v.countryCode !== 'US') errors.countryCode = 'Choose a United States address.'
  if (!s('fullName')) errors.fullName = 'Please enter a name.'
  if (!s('phoneNumber')) errors.phoneNumber = 'Please enter a phone number.'
  else if (s('phoneNumber').replace(/\D/g, '').length < 10) errors.phoneNumber = 'Please enter a valid phone number.'
  if (!s('addressLine1')) errors.addressLine1 = 'Please enter an address.'
  if (!s('city')) errors.city = 'Please enter a city name.'
  if (!STATES.includes(s('state'))) errors.state = 'Please select a state/province/region.'
  if (!s('postalCode')) errors.postalCode = 'Please enter a ZIP or postal code.'
  else if (!/^\d{5}(-\d{4})?$/.test(s('postalCode'))) errors.postalCode = 'Please enter a valid ZIP or postal code.'
  if (Object.keys(errors).length) {
    return render(req, res, 'Select a delivery address - Amazon.com Checkout', P.addressPage({ base: res.locals.base, t: coTotals(req), values: { ...v, isDefault: v.isDefault === '1' }, errors, savedChoices: savedAddressChoices(res.locals.base, retailState(req).addresses) }), { chrome: 'checkout', status: 400 })
  }
  req.store.checkout.address = { full_name: s('fullName'), phone: s('phoneNumber'), line1: s('addressLine1'), line2: s('addressLine2') || null, city: s('city'), state: s('state'), postal_code: s('postalCode'), country: 'US', instructions: s('deliveryInstructions') || null, is_default: v.isDefault === '1' }
  if (v.saveAddress === 'yes' || v.isDefault === '1') {
    const a = req.store.checkout.address
    const existing = retailState(req).addresses.find(row => row.name === a.full_name && row.line1 === a.line1 && row.line2 === (a.line2 || '') && row.postal_code === a.postal_code)
    const result = saveAddress(req, { id: existing?.id, name: a.full_name, phone: a.phone, line1: a.line1, line2: a.line2 || '', city: a.city, state: a.state, postal_code: a.postal_code, is_default: a.is_default ? 'yes' : '' }, { country: 'US', requirePhone: true })
    if (result.errors) return render(req, res, 'Save address', P.addressPage({ base: res.locals.base, t: coTotals(req), values: v, errors: { saveAddress: result.errors.join(' ') }, savedChoices: savedAddressChoices(res.locals.base, retailState(req).addresses) }), { chrome: 'checkout', status: 400 })
    result.address.instructions = a.instructions || ''
  }
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
  req.store.checkout.promoError = 'Gift card balances and promotional codes are unavailable in this storefront. Your order total has not changed.'
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
  if (checkoutLines(req.store).some(l=>{const value=req.body[`quantity_${l.asin}`];return value!==undefined && (!Number.isInteger(Number(value)) || Number(value)<1 || Number(value)>Math.min(5,l.product.stock))})) return purchaseError(req,res)
  for (const l of checkoutLines(req.store)) {
    const q = req.body[`quantity_${l.asin}`]
    if (q === undefined) continue
    if (co.buyNow) co.buyNow.qty = clampQty(q)
    else { const line = req.store.cart.find(c => c.asin === l.asin); if (line) line.qty = clampQty(q) }
  }
  const options=deliveryOptions(checkoutLines(req.store))
  if(req.body.delivery && !options[req.body.delivery]) return render(req,res,'Choose delivery',P.simplePage({title:'Choose an available delivery option',html:`<p>This delivery option does not apply to the selected items.</p><a href="${base}${STEP.spc}">Return to order review</a>`}),{status:400})
  if (options[req.body.delivery]) co.delivery = req.body.delivery
  if (!options[co.delivery]) co.delivery='standard'
  if (req.body.action !== 'place') return res.redirect(`${base}${STEP.spc}`)

  const paymentError=scenarioPayment(req.store,co.payment,checkoutLines(req.store))
  if(paymentError) return renderPayment(req,res,{errors:{payment:paymentError},status:402})
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
    fulfillment: { method: 'ship', option: delivery, eta: deliveryOptions(t.lines)[delivery].date },
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
  if (!order || !accountOrders(req).some(o => o.id === order.id) || order.meta.token !== req.query.token) return notFound(req, res)
  render(req, res, 'Amazon.com Thanks You', P.thankYouPage({ base: res.locals.base, order }))
})

router.use((req,res)=>notFound(req,res))

export default {
  slug: 'amazon',
  name: NAME,
  country: 'US',
  currency: 'USD',
  description: 'US. Code-in-box PS5/Xbox, $79.99 Standard only, no guest checkout, Buy Now from the product page, 3-step checkout.',
  router,
}
