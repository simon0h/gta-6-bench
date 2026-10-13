import { Router } from 'express'
import { randomBytes, randomInt } from 'node:crypto'
import { recordOrder } from '../../lib/orders.js'
import { validateCard } from '../../lib/payment.js'
import { authenticate, createAccount, publicAccount } from '../../lib/accounts.js'
import { PRODUCTS, byId, search, refine, totals, STATES, DEPARTMENTS, selectedProduct, cartIssue, stockFor, etaFor } from './data.js'
import * as P from './pages.js'
import * as D from './browse-pages.js'
import { installJourneys, retailState, rememberProduct, privateOrder, signInAccount, afterSignIn, selectedAddress, checkoutAddress } from './journeys.js'
import { saveAddress } from '../../lib/retail-state.js'
import { localProduct, currentStore, locationContext } from './location.js'
import { prepareReview, invalidateReview, currentReview } from './review.js'
import { enterScenarioCart, scenarioPayment } from '../../lib/benchmark-scenarios.js'

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
  res.status(status).type('html').send(P.layout({ ...locationContext(req.store), base: res.locals.base, title, body, cartCount: totals(req.store).count, user: req.store.user, chrome, back, q: String(req.query.st ?? req.query.q ?? '') }))
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
  if (step === 'address') {const a=selectedAddress(req);return c.address ?? (a?checkoutAddress(a):u ? { firstName: u.first_name, lastName: u.last_name } : {})}
  if (step === 'pickup') return c.pickup?.person ?? {}
  if (step === 'payment') return c.paymentValues ?? (u ? { billingFirstName: u.first_name, billingLastName: u.last_name } : {})
  return {}
}

function renderCheckout(req, res, { active, values, errors = {}, gift, status = 200 } = {}) {
  const base = res.locals.base
  const t = totals(req.store), c = co(req), steps = stepsFor(t)
  active ??= activeStep(steps, c, req.query.step)
  if (active === 'payment' && priorStepsDone(steps, c)) prepareReview(req.store)
  values ??= stepValues(req, active)
  const toast = c.toast
  delete c.toast
  render(req, res, 'Checkout – Best Buy', P.checkoutPage({ ...locationContext(req.store), addresses: req.store.user?retailState(req).addresses:[], base, user: req.store.user, t, steps, active, co: c, values, errors, toast, gift }),
    { status, chrome: 'checkout', back: { href: `${base}/cart`, label: 'Back to cart', count: t.count } })
}

// Checkout needs items plus a signed-in shopper or a "Continue as Guest" choice.
function gate(req, res) {
  enterScenarioCart(req.store)
  const issue=cartIssue(req.store)
  if(issue) { renderCart(req,res,issue,400);return false }
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

router.use((req, res, next) => { req.body ??= {}; retailState(req); next() })
installJourneys(router,{render,notFound})

// ---- browse ----
router.get('/', (req, res) => render(req, res, 'Best Buy | Official Online Store | Shop Now & Save', D.homePage({ base: res.locals.base, user:req.store.user, featured:req.query.featured, products: PRODUCTS.map(p=>localProduct(p,req.store)) })))
// Franchise hub the search banner and header band link to.
router.get(HUB, (req, res) => render(req, res, 'Grand Theft Auto VI - Best Buy', P.homePage({ base: res.locals.base, products: PRODUCTS.map(p=>localProduct(p,req.store)) })))

const FILTERS = ['department','platform','category','price','availability','condition','brand','format','rating','fulfillment','offer','sort','page']
function browse(req,res,defaults={},heading='',intro='') {
  const q=trim(req.query.st??req.query.q)
  const filters={...defaults,...Object.fromEntries(FILTERS.filter(k=>req.query[k]!==undefined).map(k=>[k,String(req.query[k])]))}
  render(req,res,`${q||heading||'Shop'} - Best Buy`,D.searchPage({base:res.locals.base,q,filters,heading,intro,products:refine(search(q).map(p=>localProduct(p,req.store)),filters)}))
}
router.get('/site/searchpage.jsp',(req,res)=>browse(req,res))
router.get('/search/suggestions',(req,res)=>res.json(search(trim(req.query.q)).slice(0,6).map(p=>({title:p.title,sku:p.sku,url:`${res.locals.base}/product/${p.slug}/${p.id}/sku/${p.sku}`}))))
router.get('/departments',(req,res)=>render(req,res,'Departments - Best Buy',D.departmentsPage({products:PRODUCTS.map(p=>localProduct(p,req.store)),base:res.locals.base})))
router.get('/departments/:slug',(req,res)=>{
  const department=DEPARTMENTS.find(d=>d.id===req.params.slug)
  if(!department) return notFound(req,res)
  render(req,res,`${department.name} - Best Buy`,D.departmentsPage({products:PRODUCTS.map(p=>localProduct(p,req.store)),base:res.locals.base,department}))
})
router.get('/brands',(req,res)=>render(req,res,'Shop by Brand - Best Buy',D.brandsPage({base:res.locals.base})))
for(const [path,offer,heading,intro] of [
  ['/top-deals','deals','Top Deals','Save on useful tech and home upgrades from across our departments.'],
  ['/deal-of-the-day','daily','Deal of the Day','A featured audio offer. Available while the listed inventory lasts.'],
  ['/gift-ideas','gifts','Gift Ideas','Find something for the music fan, home cook or tech enthusiast in your life.'],
  ['/outlet','outlet','Best Buy Outlet','Explore inspected open-box offers. Review condition, accessories and pickup availability before buying.'],
]) router.get(path,(req,res)=>browse(req,res,{offer},heading,intro))
const serviceInfo={
  services:['Support & Services','Get help choosing compatible equipment, setting up new technology and caring for your purchase.','TV mounting requires a compatible wall and mount. Smart doorbells and thermostats require suitable wiring. Computer upgrades require compatible ports and components. Installation and repair appointments are not bookable in this local store.'],
  membership:['My Best Buy Memberships','Compare membership benefits before joining.','The local catalog supports guest and account shopping. Paid Plus and Total enrollment, reward certificates and real membership benefits are not available here. Product offers show their own prices and conditions.'],
  financing:['Financing & Rewards','Choose a payment method that works for you.','Card and simulated PayPal checkout are available. Credit applications, installment financing and external rewards accounts are not connected. Compare the full order total before placing an order.'],
  'trade-in':['Trade-In','Learn what to prepare for a device trade-in.','Back up personal data, remove account locks and check your device condition. Trade-in valuations, mail-in kits and store appointments require services outside this local catalog.'],
  business:['Best Buy Business','Technology for work and small teams.','Browse computers, displays, audio and accessories. Business quotes, volume pricing, tax-exempt enrollment and business credit accounts are not connected in this local store.'],
  'gift-cards':['Gift Cards','Give the freedom to choose.','Gift card issuance and balance lookup are not supported in this local store. Browse gift ideas to purchase a physical item instead.'],
}
for(const [path,[title,lead,detail]] of Object.entries(serviceInfo)) router.get(`/${path}`,(req,res)=>render(req,res,`${title} - Best Buy`,P.simplePage({title,html:`<p>${lead}</p><p>${detail}</p><p><a href="${res.locals.base}/departments">Browse departments</a> · <a href="${res.locals.base}/help">Shopping help</a> · <a href="${res.locals.base}/gift-ideas">Gift ideas</a></p>`})))
function productRoute(req, res) {
  const source = byId(req.params.sku ?? req.params.id)
  if (!source || (req.params.id && source.id!==req.params.id)) return notFound(req,res)
  const p=localProduct(selectedProduct(source,req.query.variant),req.store)
  if(!p) return render(req,res,'Invalid selection',P.simplePage({title:'Choose a valid product option.',html:`<a href="${res.locals.base}/product/${source.slug}/${source.id}/sku/${source.sku}">Return to product</a>`}),{status:400})
  rememberProduct(req,p.sku)
  const accessories=p.kind==='game'?PRODUCTS.filter(x=>/The Album/.test(x.title)):PRODUCTS.filter(x=>x.sku!==p.sku&&x.department===p.department&&!x.preorder).slice(0,4)
  render(req,res,`${p.pageTitle} - Best Buy`,(p.model?D:P).productPage({...locationContext(req.store),base:res.locals.base,p,accessories:accessories.map(p=>localProduct(p,req.store))}))
}
router.get('/product/:slug/:id/sku/:sku', productRoute)
router.get('/product/:slug/:id', productRoute)

function renderCart(req,res,message='',status=200) {
  enterScenarioCart(req.store)
  const t=totals(req.store),inCart=new Set(t.lines.map(l=>l.product.sku))
  const departments=new Set(t.lines.map(l=>l.product.department))
  const alsoBought=PRODUCTS.filter(p=>!inCart.has(p.sku)&&(!departments.size||departments.has(p.department))).slice(0,4).map(p=>localProduct(p,req.store))
  const saved=(retailState(req).savedForLater??[]).map(s=>({...s,product:selectedProduct(byId(s.pid),s.variant)})).filter(s=>s.product)
  render(req,res,'Cart - Best Buy',P.cartPage({...locationContext(req.store),base:res.locals.base,t,alsoBought,saved,savedMsg:message||cartIssue(req.store)}),{status})
}
function validateCartChange(req,res,previous) {
  const issue=cartIssue(req.store)
  if(issue){req.store.cart=previous;renderCart(req,res,issue,400);return false}
  const oldMethods=new Set(previous.map(l=>l.fulfillment)),methods=new Set(req.store.cart.map(l=>l.fulfillment))
  if(!oldMethods.has('shipping')&&methods.has('shipping')) { delete co(req).done.address;delete co(req).done.shipdetails }
  if(!oldMethods.has('pickup')&&methods.has('pickup')) delete co(req).done.pickup
  if(JSON.stringify(previous)!==JSON.stringify(req.store.cart)) invalidateReview(req.store)
  enterScenarioCart(req.store)
  return true
}

// ---- cart ----
// "Pre-order" adds the SKU with the chosen fulfillment and goes straight to the cart (no modal).
router.post('/cart/add', (req, res) => {
  const p=localProduct(selectedProduct(byId(req.body.pid),req.body.variant),req.store)
  if(!p) return renderCart(req,res,'Choose a valid product and option.',400)
  if(req.body.qty!==undefined&&(!Number.isInteger(Number(req.body.qty))||Number(req.body.qty)<1||Number(req.body.qty)>MAX_QTY)) return renderCart(req,res,'Choose a valid quantity (1–3).',400)
  const preferred=retailState(req).preferences.fulfillment
  const chosen=req.body.fulfillment|| (preferred&&stockFor(p,preferred)?preferred:stockFor(p,'pickup')?'pickup':'shipping')
  if(!['pickup','shipping'].includes(chosen)) return renderCart(req,res,'Choose pickup or shipping.',400)
  const previous=structuredClone(req.store.cart),variant=p.variant||''
  const line=req.store.cart.find(l=>l.pid===p.sku&&(l.variant||'')===variant)
  const qty=Number(req.body.qty||1)
  if(line) {line.qty=p.model?line.qty+qty:Math.min(line.qty+qty,MAX_QTY);line.fulfillment=chosen}
  else {req.store.cartSeq=(req.store.cartSeq??0)+1;req.store.cart.push({line:req.store.cartSeq,pid:p.sku,qty,fulfillment:chosen,...(variant?{variant}:{})})}
  if(!validateCartChange(req,res,previous)) return
  res.redirect(`${res.locals.base}/cart`)
})
router.get('/cart',(req,res)=>renderCart(req,res))
router.post('/cart/update',(req,res)=>{
  const previous=structuredClone(req.store.cart)
  const item=req.store.cart.find(l=>l.line===Number(req.body.line)),action=req.body.action||'update'
  if(!item) return renderCart(req,res,'That item is no longer in your cart.',400)
  if(action==='remove'||action==='save') req.store.cart=req.store.cart.filter(l=>l!==item)
  if(action==='save') retailState(req).savedForLater=[...(retailState(req).savedForLater??[]).filter(s=>s.pid!==item.pid||(s.variant||'')!==(item.variant||'')),{...item}]
  if(action==='remove'||action==='save') invalidateReview(req.store)
  if(action==='update') {
    if(req.body.qty!==undefined) item.qty=Number(req.body.qty)
    if(req.body['availability-selection']!==undefined) item.fulfillment=req.body['availability-selection']
    if(!validateCartChange(req,res,previous)) return
  }
  res.redirect(`${res.locals.base}/cart`)
})
router.post('/cart/saved',(req,res)=>{
  const saved=(retailState(req).savedForLater??[]).find(s=>s.pid===String(req.body.pid)&&(s.variant||'')===String(req.body.variant||''))
  if(!saved) return renderCart(req,res,'That saved item could not be found.',400)
  if(req.body.action==='move') {
    const previous=structuredClone(req.store.cart)
    const existing=req.store.cart.find(l=>l.pid===saved.pid&&(l.variant||'')===(saved.variant||''))
    if(existing) existing.qty+=1
    else {req.store.cartSeq=(req.store.cartSeq??0)+1;req.store.cart.push({...saved,line:req.store.cartSeq,qty:1})}
    if(!validateCartChange(req,res,previous)) return
  } else if(req.body.action!=='remove') return renderCart(req,res,'Choose a valid saved-item action.',400)
  retailState(req).savedForLater=retailState(req).savedForLater.filter(s=>s!==saved)
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
    signInAccount(req,publicAccount(acct))
    res.redirect(afterSignIn(req,base,mode === 'checkout' && hasLines(req) ? checkoutUrl(base) : `${base}/account`))
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
    else { signInAccount(req,publicAccount(acct)); return res.redirect(afterSignIn(req,res.locals.base,`${res.locals.base}/account`)) }
  }
  render(req, res, 'Create an Account - Best Buy', P.createAccountPage({ base: res.locals.base, values: { ...v, password: '' }, errors }), { status: 400, chrome: 'slim' })
})

router.get('/logout', (req, res) => { req.store.user = null; req.store.checkout = {}; delete req.store.pendingSave; delete req.store.afterSignIn; res.redirect(`${res.locals.base}/`) })

// ---- checkout: one page, numbered steps ----
router.get('/checkout/c/standard', (req, res) => {
  if (!gate(req, res)) return
  if(req.query.address_id) {
    const a=selectedAddress(req,String(req.query.address_id))
    if(!a)return notFound(req,res)
    co(req).address=checkoutAddress(a);co(req).addressId=a.id;delete co(req).done.address;delete co(req).done.shipdetails
  }
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
  if(req.store.user && (v.saveToProfile==='1'||v.defaultAddress==='1')) {
    const saved=saveAddress(req,{name:`${v.firstName} ${v.lastName}`,line1:v.addressLine1,line2:v.addressLine2,city:v.city,state:v.state,postal_code:v.postalCode,is_default:v.defaultAddress==='1'?'yes':''},{country:'US'})
    if(saved.errors)return renderCheckout(req,res,{active:'address',values:v,errors:{addressLine1:saved.errors.join(' ')},status:400})
    c.addressId=saved.address.id
  }
  c.address = v
  c.done.address = true
  res.redirect(checkoutUrl(res.locals.base))
})

// The pre-order has one FREE level of service, so this step only confirms it (see pages.js).
router.post('/checkout/shipping-details', (req, res) => {
  if (!gate(req, res)) return
  const c = co(req)
  if(req.body.levelOfService&&req.body.levelOfService!=='standard')return renderCheckout(req,res,{active:'shipdetails',errors:{method:'Only standard shipping is available.'},status:400})
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
  if(b.paymentMethod&&!['card','paypal'].includes(b.paymentMethod))return renderCheckout(req,res,{active:'payment',errors:{method:'Choose card or PayPal. Other payment methods are not supported.'},status:400})
  if (b.action === 'paypal' || b.action === 'card') {
    c.paymentMethod = b.action
    return res.redirect(checkoutUrl(base))
  }
  if (!priorStepsDone(steps, c)) return res.redirect(checkoutUrl(base))
  if (!currentReview(req.store, b.reviewToken)) {
    invalidateReview(req.store)
    return renderCheckout(req, res, { active: 'payment', errors: { review: 'Review the updated order and enter your payment details again.' }, status: 409 })
  }

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
  enterScenarioCart(req.store)
  const issue=cartIssue(req.store)
  if(issue) return renderCart(req,res,issue,400)
  const paymentError=scenarioPayment(req.store,payment)
  if(paymentError) return renderCheckout(req,res,{active:'payment',errors:{payment:paymentError},status:402})
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
      store_location: t.hasPickup ? currentStore(req.store).name : null,
      eta: [...new Set(t.lines.map(l=>etaFor(l.product,l.fulfillment)))].join(' / '),
    },
    shipping_address: a ? { first_name: a.firstName, last_name: a.lastName, line1: a.addressLine1, line2: a.addressLine2 || null, city: a.city, state: a.state, postal_code: a.postalCode, country: 'US', phone: c.contact.phoneNumber } : null,
    billing_address: billing,
    payment,
    totals: { subtotal: t.subtotal, shipping: t.shipping, tax: t.tax, total: t.total },
    currency: 'USD',
    meta: {
      token,
      account_id: u?.id ?? null,
      pickup_store_id: t.hasPickup ? currentStore(req.store).id : null,
      shipping_zip: a?.postalCode || null,
      product_details: t.lines.map(l=>({sku:l.product.sku,variant:l.variant||null,option:l.product.label||null,condition:l.product.condition,preorder:!!l.product.preorder,release:l.product.release||null,eta:etaFor(l.product,l.fulfillment)})),
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
  const order = privateOrder(req,String(number ?? ''))
  return order && order.meta.token === String(token ?? '') ? order : null
}
function orderNotFound(req, res) {
  render(req, res, 'Order Not Found - Best Buy', P.simplePage({ title: "We couldn't find that order.", html: `<p>Check your confirmation email for your order details.</p><p><a href="${res.locals.base}/">Continue shopping</a></p>` }), { status: 404 })
}
// ASSUMPTION: the thank-you page's <title> was not observed.
router.get('/checkout/r/thank-you', (req, res) => {
  const order = findOrder(req, req.query.order, req.query.token)
  if (!order) return orderNotFound(req, res)
  render(req, res, 'Thank You - Best Buy', P.thankYouPage({ base: res.locals.base, order, guestClaimed:!!req.store.receiptOwners?.[order.id] }))
})

// Guest "Create an account" block on the thank-you page.
router.post('/checkout/r/create-account', (req, res) => {
  const order = findOrder(req, req.body.order, req.body.token)
  if (!order) return orderNotFound(req, res)
  let accountCreated = null
  if (order.customer.guest && !req.store.user && req.body.save === '1') {
    const password = String(req.body.password ?? '')
    const acct = password.length >= 8
      ? createAccount(req.storeSlug, { email: order.customer.email, password, first_name: order.customer.first_name, last_name: order.customer.last_name, phone: order.customer.phone })
      : { error: 'short password' }
    if (acct.error) accountCreated = { ok: false, error: 'Sorry, but we were unable to create your account. Please try again.' }
    else { signInAccount(req,publicAccount(acct)); req.store.receiptOwners ||= {}; req.store.receiptOwners[order.id]=acct.id; accountCreated = { ok: true } }
  }
  render(req, res, 'Thank You - Best Buy', P.thankYouPage({ base: res.locals.base, order, accountCreated }), { status: accountCreated?.ok === false ? 400 : 200 })
})

router.get('/compare', (req, res) => {
  const skus = [...new Set([].concat(req.query.sku ?? []).map(String))].slice(0, 3)
  const products = skus.map(byId).filter(Boolean)
  render(req, res, 'Compare Products - Best Buy', P.comparePage({ base: res.locals.base, products, catalog: PRODUCTS }))
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
