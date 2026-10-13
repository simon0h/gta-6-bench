import { enterScenarioCart, scenarioAvailability, scenarioPayment } from '../../lib/benchmark-scenarios.js'
import { fixtureCatalog } from '../../lib/catalog-policy.js'
import { productImage, productGallery } from '../../lib/product-assets.js'
import { Router } from 'express'
import { randomBytes, randomInt, randomUUID } from 'node:crypto'
import { recordOrder } from '../../lib/orders.js'
import { retailState, saveAddress, orderStatus } from '../../lib/retail-state.js'
import { registerJourneys, rememberProduct, privateOrder, locationFor, savedAddressValues, savedAddressPicker, checkoutAddress } from './journeys.js'
import { validateCard } from '../../lib/payment.js'
import { authenticate, createAccount, findAccount, publicAccount } from '../../lib/accounts.js'
import { PRODUCTS, byId, productPath, search, totals, STATES, WALMART_PLUS, selectedProduct, lineKey, stockLimit, validCart, cartLines, arrivalSummary } from './data.js'
import * as P from './pages.js'
import * as B from './browse.js'
import { DEPARTMENTS, CAMPAIGNS, SELLERS, categorySlug } from './catalog.js'
import { esc } from '../../lib/html.js'

const NAME = 'Walmart'
const router = Router()

// ---- helpers ----
function render(req, res, { title, body, variant = 'store', status = 200, q = '' }) {
  res.status(status).type('html').send(P.layout({ base: res.locals.base, title, body, t: totals(req.store), user: req.store.user, variant, q, location: locationFor(req) }))
}
function notFound(req, res) {
  return render(req, res, { title: 'Page not found - Walmart.com', status: 404, body: P.simplePage({ title: 'This page could not be found', html: `<p>The item may have been removed or the link is wrong.</p><a class="wm-pill" href="${res.locals.base}/">Go to Walmart.com</a>` }) })
}
// ASSUMPTION: no real Walmart order number was observed. research/walmart.md gives the current shape as 7 digits,
// a hyphen, 8 digits (e.g. 2000123-45678901); walmart.json's later pass leans to 13 plain digits. Both are low
// confidence; this keeps the hyphenated form, printed on /thankyou as "Order# ...".
function orderNumber() { return `200${String(randomInt(0, 10000)).padStart(4, '0')}-${String(randomInt(0, 1e8)).padStart(8, '0')}` }
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
const digits = s => String(s ?? '').replace(/\D/g, '')
function scalarForm(body, keys) {
  const values = {}, errors = {}
  for (const key of keys.split(' ')) {
    if (body[key] === undefined) continue
    if (typeof body[key] === 'string') values[key] = body[key]
    else { values[key] = ''; errors[key] = 'Enter one value for this field.' }
  }
  return { values, errors }
}
// The identity gate's return path (state=...) must be a relative path on this store, never an external URL.
const safeState = s => (typeof s === 'string' && /^\/(?![/\\])/.test(s) ? s : null)
const gateUrl = (base, state, tp) => `${base}/account/login?state=${encodeURIComponent(state)}&tp=${tp}`
function cartId(store) { store.checkout.cartId ??= randomUUID(); return store.checkout.cartId }
const reviewUrl = (base, store, extra = '') => `${base}/checkout/review-order?cartId=${cartId(store)}${extra}`

function addToCart(store,p,qty=1) {
  if (!p || !Number.isInteger(qty) || qty<1) return {error:'Choose a valid quantity.'}
  const key=lineKey(p.id,p.variantId)
  const line=store.cart.find(l=>lineKey(l.pid,l.variantId)===key)
  const current=(line?.qty ?? 0)+qty
  const aggregate=store.cart.filter(l=>l.pid===p.id).reduce((n,l)=>n+l.qty,0)+qty
  if (current>stockLimit(p) || aggregate>stockLimit(byId(p.id))) return {error:p.stock===0?'This option is out of stock. Choose another option.':p.simulatedStock?'The requested quantity exceeds the per-order limit. Review your cart quantity.':`Only ${stockLimit(p)} of this option are available per order. Review your cart quantity.`}
  if (line) {line.qty=current;return {line}}
  const created={pid:p.id,variantId:p.variantId ?? null,key,qty}
  store.cart.push(created)
  return {line:created}
}
const savedProducts = store => cartLines({cart:(store.saved??[]).map(l=>typeof l==='string'?{pid:l,qty:1}:l)})
function cartError(req,res,message,status=409) {
  return render(req,res,{title:'Review your cart - Walmart.com',status,body:`<div class="wm-error-summary" role="alert">${esc(message)}</div>`+P.cartPage({base:res.locals.base,t:totals(req.store),saved:savedProducts(req.store),user:req.store.user,location:locationFor(req),flags:{plus:!!req.store.checkout.plus?.opted,gift:!!req.store.checkout.gift}})})
}
function renderProduct(req,res,product,{status=200,error=''}={}) {
  rememberProduct(req, product.id)
  const recent = retailState(req)
  recent.recentVariants ||= {}
  recent.recentVariants[product.id] = product.variantId || null
  const similar=PRODUCTS.filter(x=>x.id!==product.id && x.department===product.department && !x.sponsored).slice(0,8)
  const sponsored=product.kind==='game' ? PRODUCTS.find(x=>x.sponsored && x.id!==product.id):null
  return render(req,res,{title:`${product.title} - Walmart.com`,status,body:P.productPage({base:res.locals.base,p:product,similar,sponsored,error,location:locationFor(req)})})
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
  if((checkout&&unavailable)||(adding&&ids.some(id=>scenarioAvailability(req.store,id,'shipping')===false))) return render(req,res,{title:'Review your cart',body:P.cartPage({base:res.locals.base,t:totals(req.store),saved:[],user:req.store.user,location:locationFor(req),flags:{}}),status:409})
  next()
})

registerJourneys(router, { render, notFound, gateUrl, addToCart })

// ---- browse ----
router.get('/', (req,res)=>render(req,res,{title:'Walmart.com | Save Money. Live better.',body:P.homePage({base:res.locals.base,products:PRODUCTS})}))
router.get('/search',(req,res)=>{
 const q=String(req.query.q??'')
 render(req,res,{title:`${q || 'Shop all'} - Walmart.com`,q,body:P.searchPage({base:res.locals.base,q,filters:B.filtersFrom(req.query),page:req.query.page,products:search(q)})})
})
router.get('/departments',(req,res)=>render(req,res,{title:'All Departments - Walmart.com',body:B.departmentsPage({base:res.locals.base,tile:P.tile})}))
router.get('/cp/pharmacy/5431',(req,res)=>render(req,res,{title:'Pharmacy - Walmart.com',body:B.servicePage({base:res.locals.base,slug:'pharmacy'})}))
router.get('/cp/halloween/9516159',(req,res)=>render(req,res,{title:'Halloween inspiration - Walmart.com',body:B.listingPage({base:res.locals.base,route:`${res.locals.base}/cp/halloween/9516159`,title:'Halloween inspiration',description:'Seasonal costumes and Halloween decorations are not stocked in this assortment. Explore family games and creative supplies for a cozy night in.',source:PRODUCTS.filter(p=>p.department==='toys' && p.category!=='Bikes'),filters:B.filtersFrom(req.query),page:req.query.page,tile:P.tile})}))
router.get('/cp/:slug/:id',(req,res)=>{
 const d=DEPARTMENTS.find(d=>d.id===req.params.id && d.slug===req.params.slug)
 if(!d)return notFound(req,res)
 render(req,res,{title:`${d.name} - Walmart.com`,body:B.departmentPage({base:res.locals.base,department:d,filters:B.filtersFrom(req.query),page:req.query.page,tile:P.tile})})
})
router.get('/browse/:category',(req,res)=>{
 const category=PRODUCTS.find(p=>categorySlug(p.category)===req.params.category)?.category
 if(!category)return notFound(req,res)
 const source=PRODUCTS.filter(p=>p.category===category)
 render(req,res,{title:`${category} - Walmart.com`,body:B.listingPage({base:res.locals.base,route:`${res.locals.base}/browse/${req.params.category}`,title:category,source,filters:B.filtersFrom(req.query),page:req.query.page,tile:P.tile})})
})
router.get('/shop/:slug',(req,res)=>{
 const base=res.locals.base,campaign=CAMPAIGNS.find(c=>c.slug===req.params.slug)
 const common={base,filters:B.filtersFrom(req.query),page:req.query.page,tile:P.tile}
 if(campaign)return render(req,res,{title:`${campaign.title} - Walmart.com`,body:B.campaignPage({...common,campaign})})
 if(!['savings','get-it-fast'].includes(req.params.slug))return notFound(req,res)
 const deals=req.params.slug==='savings'
 render(req,res,{title:deals?'Rollbacks & More - Walmart.com':'Get it Fast - Walmart.com',body:B.listingPage({...common,route:`${base}/shop/${req.params.slug}`,title:deals?'Rollbacks & More':'Get it Fast',description:deals?'Lower prices on everyday favorites.':fixtureCatalog?'Items with shipping estimates of tomorrow. Pickup and same-day delivery are not available.':'Items with captured next-day shipping estimates. Regional pickup and delivery availability is unverified.',source:PRODUCTS.filter(p=>deals?p.wasPrice:p.arrival.day==='tomorrow' && p.stock>0)})})
})
router.get('/seller/:id',(req,res)=>{
 const seller=Object.hasOwn(SELLERS,req.params.id)?SELLERS[req.params.id]:null;if(!seller || (!fixtureCatalog && !PRODUCTS.some(p=>p.sellerId===seller.id)))return notFound(req,res)
 render(req,res,{title:`${seller.name} - Walmart.com`,body:B.sellerPage({base:res.locals.base,seller,filters:B.filtersFrom(req.query),page:req.query.page,tile:P.tile})})
})
for(const path of ['/services','/services/:slug','/store-directory','/plus'])router.get(path,(req,res)=>{
 const slug=req.params.slug ?? req.path.slice(1)
 const body=B.servicePage({base:res.locals.base,slug});if(!body)return notFound(req,res)
 render(req,res,{title:'Walmart services',body})
})
router.get('/reviews/product/:id',(req,res)=>{
 const p=byId(req.params.id);if(!p)return notFound(req,res)
 render(req,res,{title:`Reviews for ${p.title}`,body:`<section class="wm-simple"><h1>${esc(p.title)}</h1><a href="${productPath(res.locals.base,p)}">Back to item</a></section>`+P.reviewsSection(p,{base:res.locals.base,rating:String(req.query.rating??''),sort:String(req.query.sort??'relevant')})})
})
// The public GTA VI PDP exposes "Check nearby" even when shipping is the only
// purchasable method. Store inventory remains the benchmark's fixed snapshot.
router.get('/ip/:id/pickup',(req,res)=>{
 const p=byId(req.params.id),base=res.locals.base
 if(!p||p.kind!=='game')return notFound(req,res)
 const zip=String(req.query.zip??locationFor(req).zip),valid=/^\d{5}$/.test(zip)
 render(req,res,{title:`Pickup options - ${p.title}`,status:valid?200:400,body:`<section class="wm-pickup-availability"><a href="${productPath(base,p)}">Back to item</a><h1>Check nearby stores</h1><h2>${esc(p.title)}</h2><form method="get" action="${base}/ip/${p.id}/pickup"><label for="pickup-zip">ZIP code</label><input id="pickup-zip" name="zip" inputmode="numeric" autocomplete="postal-code" pattern="[0-9]{5}" value="${esc(zip)}" required><button class="wm-pill" type="submit">Update location</button></form>${valid?`<p role="status"><b>${fixtureCatalog?'Pickup not available':'Pickup availability unverified'}</b> near ${esc(zip)}.</p><p>${fixtureCatalog?'Shipping is available for this item.':'The captured product page offered shipping preorder and a Check nearby link. No store-level pickup result was captured.'}</p><a class="wm-pill" href="${productPath(base,p)}">Continue with shipping</a>`:'<p class="wm-error" role="alert">Enter a valid 5-digit ZIP code.</p>'}</section>`})
})
router.get('/ip/:id/gallery',(req,res)=>{
 const product=byId(req.params.id);if(!product)return notFound(req,res)
 const p=selectedProduct(product,req.query.variant ?? product.variants?.[0].id)
 if(!p)return renderProduct(req,res,selectedProduct(product,product.variants?.[0].id),{status:400,error:'That option is not available. Choose one of the listed options.'})
 render(req,res,{title:`${p.title} - Product gallery`,body:`<section class="wm-product-gallery"><a href="${productPath(res.locals.base,p)}${p.variantId?`?variant=${encodeURIComponent(p.variantId)}`:''}">Back to item</a><h1>${esc(p.title)}</h1><div>${productGallery('walmart',p)}<article><h2>Product image & details</h2><p>Use the item specifications and selected option to check size, pack and compatibility.</p><ul>${p.features.map(f=>`<li>${esc(f)}</li>`).join('')}</ul>${p.variants?`<h3>Available choices</h3><ul>${p.variants.map(v=>`<li><a href="${productPath(res.locals.base,p)}?variant=${v.id}">${esc(Object.values(v.options).join(' · '))}</a></li>`).join('')}</ul>`:''}</article></div></section>`})
})
router.get('/ip/:slug/:id',(req,res)=>{
 const product=byId(req.params.id);if(!product)return notFound(req,res)
 const selected=selectedProduct(product,req.query.variant ?? product.variants?.[0].id)
 if(!selected)return renderProduct(req,res,selectedProduct(product,product.variants?.[0].id),{status:400,error:'That option is not available. Choose one of the listed options.'})
 renderProduct(req,res,selected)
})
router.get('/ip/:id',(req,res)=>{
 const p=byId(req.params.id);if(!p)return notFound(req,res)
 res.redirect(`${productPath(res.locals.base,p)}${req.query.variant?`?variant=${encodeURIComponent(req.query.variant)}`:''}`)
})

// ---- cart ----
// "Preorder" / "Add to cart" hard-redirects to the "Added to cart!" interstitial (/pac), never a modal.
router.post('/cart/add',(req,res)=>{
 const base=res.locals.base,product=byId(req.body.pid)
 if(!product)return notFound(req,res)
 const p=selectedProduct(product,req.body.variant)
 if(!p)return renderProduct(req,res,selectedProduct(product,product.variants?.[0].id),{status:400,error:'Choose a valid product option before adding this item.'})
 if(req.body.fulfillment && req.body.fulfillment!=='shipping')return renderProduct(req,res,p,{status:400,error:'Shipping is the available fulfillment method for this item.'})
 const qty=req.body.qty===undefined?1:Number(req.body.qty)
 const result=addToCart(req.store,p,qty)
 if(result.error)return renderProduct(req,res,p,{status:409,error:result.error})
 if(req.body.plus==='1')req.store.checkout.plus={opted:true,decided:false,plan:null}
 res.redirect(`${base}/pac?id=${p.id}&ip=${p.price}&qt=${result.line.qty}&g=FC${p.variantId?`&variant=${encodeURIComponent(p.variantId)}`:''}`)
})
router.get('/pac',(req,res)=>{
 const base=res.locals.base,p=selectedProduct(byId(req.query.id),req.query.variant)
 const line=p&&req.store.cart.find(l=>lineKey(l.pid,l.variantId)===lineKey(p.id,p.variantId))
 if(!line)return res.redirect(`${base}/cart`)
 const recommendations=PRODUCTS.filter(x=>x.id!==p.id && x.department===p.department).slice(0,8)
 render(req,res,{title:'Added to cart | Relevant recommendations',body:P.addedPage({base,p,qty:line.qty,t:totals(req.store),recommendations})})
})

router.get('/cart', (req, res) => {
  const base = res.locals.base
  // Return trip from the identity gate (state=/cart?checkout=true): go straight on to checkout.
  if (req.query.checkout === 'true' && req.store.cart.length) {
    if (req.store.user) return res.redirect(reviewUrl(base, req.store))
    return res.redirect(gateUrl(base, '/cart?checkout=true', 'CXO'))
  }
  render(req, res, { title: 'Cart - Walmart.com', body: P.cartPage({ base, t: totals(req.store), saved: savedProducts(req.store), user: req.store.user, location: locationFor(req), flags: { plus: !!req.store.checkout.plus?.opted, gift: !!req.store.checkout.gift } }) })
})

router.post('/cart/update',(req,res)=>{
 const base=res.locals.base,store=req.store,action=String(req.body.action??'')
 store.saved=(store.saved??[]).map(l=>typeof l==='string'?{pid:l,qty:1}:l)
 const source=['move','forget'].includes(action)?store.saved:store.cart
 const matching=source.filter(l=>req.body.line?lineKey(l.pid,l.variantId)===req.body.line:l.pid===String(req.body.pid??''))
 if(matching.length!==1)return cartError(req,res,'Choose a valid cart item and option.',400)
 const line=matching[0],p=selectedProduct(byId(line.pid),line.variantId)
 if(!p)return cartError(req,res,'This item option is no longer available.',409)
 if(action==='inc') {const added=addToCart(store,p);if(added.error)return cartError(req,res,added.error)}
 else if(action==='dec') {if(line.qty>1)line.qty--;else store.cart=store.cart.filter(l=>l!==line)}
 else if(action==='remove')store.cart=store.cart.filter(l=>l!==line)
 else if(action==='save') {
   store.cart=store.cart.filter(l=>l!==line)
   const existing=store.saved.find(l=>lineKey(l.pid,l.variantId)===lineKey(line.pid,line.variantId))
   if(existing)existing.qty+=line.qty;else store.saved.push({...line})
 }
 else if(action==='move') {const added=addToCart(store,p,line.qty);if(added.error)return cartError(req,res,added.error);store.saved=store.saved.filter(l=>l!==line)}
 else if(action==='forget')store.saved=store.saved.filter(l=>l!==line)
 else return cartError(req,res,'Choose a valid cart action.',400)
 const next=typeof req.body.next==='string' && req.body.next.startsWith(`${base}/`) ? req.body.next:`${base}/cart`
 res.redirect(next)
})

// "Continue to checkout": remembers the Walmart+ / gift boxes, then the identity gate (no guest option) or checkout.
router.post('/cart/checkout', (req, res) => {
  const base = res.locals.base
  if (!req.store.cart.length) return res.redirect(`${base}/cart`)
  if (!validCart(req.store)) return cartError(req,res,'An item or quantity is no longer available. Review your cart before checkout.')
  const c = req.store.checkout
  if (req.body.plus === '1') { if (!c.plus?.opted) c.plus = { opted: true, decided: false, plan: null } }
  else c.plus = { opted: false, decided: false, plan: null }
  c.gift = req.body.gift === '1'
  if (req.store.user) return res.redirect(reviewUrl(base, req.store))
  res.redirect(gateUrl(base, '/cart?checkout=true', 'CXO'))
})

// ---- identity gate (identity.walmart.com/account/login) ----
router.get('/account/login', (req, res) => {
  const state = safeState(req.query.state)
  render(req, res, { title: 'Login | Walmart', variant: 'identity', body: P.loginPage({ base: res.locals.base, state }) })
})
router.post('/account/login', (req, res) => {
  const base = res.locals.base
  const state = safeState(req.query.state)
  const id = String(req.body.identifier ?? '').trim()
  const isEmail = EMAIL_RE.test(id)
  const isPhone = !isEmail && digits(id).length === 10 && !/[a-z@]/i.test(id)
  if (!isEmail && !isPhone) return render(req, res, { title: 'Login | Walmart', variant: 'identity', status: 400, body: P.loginPage({ base, state, identifier: id, error: 'Please enter a valid phone number or email' }) })
  req.store.auth = { identifier: isEmail ? id.toLowerCase() : id, isEmail, state }
  // ASSUMPTION: lib/accounts.js keys accounts by email, so a phone number is never "recognized" and goes to sign-up.
  if (isEmail && findAccount(req.storeSlug, id)) return res.redirect(`${base}/account/signin/withpassword`)
  res.redirect(`${base}/account/sign-up`)
})

function finishAuth(req, res, acct) {
  if (req.store.user && req.store.user.id !== acct.id) req.store.checkout = {}
  req.store.user = publicAccount(acct)
  const state = req.store.auth?.state ?? null
  req.store.auth = null
  res.redirect(`${res.locals.base}${state ?? '/account'}`)
}

router.get('/account/signin/withpassword', (req, res) => {
  const a = req.store.auth
  if (!a?.identifier) return res.redirect(`${res.locals.base}/account/login`)
  render(req, res, { title: 'Login | Walmart', variant: 'identity', body: P.passwordPage({ base: res.locals.base, identifier: a.identifier, isEmail: a.isEmail, state: a.state }) })
})
router.post('/account/signin/withpassword', (req, res) => {
  const a = req.store.auth
  if (!a?.identifier) return res.redirect(`${res.locals.base}/account/login`)
  const acct = authenticate(req.storeSlug, a.identifier, req.body.password)
  if (!acct) return render(req, res, { title: 'Login | Walmart', variant: 'identity', status: 401, body: P.passwordPage({ base: res.locals.base, identifier: a.identifier, isEmail: a.isEmail, state: a.state, error: "Your email address and password don't match. Please try again or reset your password." }) })
  finishAuth(req, res, acct)
})

router.get('/account/sign-up', (req, res) => {
  const a = req.store.auth ?? {}
  const values = a.isEmail ? { email: a.identifier } : a.identifier ? { phone: a.identifier } : {}
  render(req, res, { title: 'Create your Walmart account | Walmart', variant: 'identity', body: P.signupPage({ base: res.locals.base, values, state: a.state }) })
})
router.post('/account/sign-up', (req, res) => {
  const { values: v, errors } = scalarForm(req.body, 'firstName lastName email phone password marketing')
  const need = (k, msg) => { if (!String(v[k] ?? '').trim()) errors[k] = msg }
  need('firstName', 'First name is required.'); need('lastName', 'Last name is required.'); need('email', 'Email address is required.'); need('phone', 'Phone number is required.'); need('password', 'Password is required.')
  if (v.email && !EMAIL_RE.test(String(v.email).trim())) errors.email = 'Please enter a valid email address.'
  if (v.phone && digits(v.phone).length !== 10) errors.phone = 'Please enter a valid 10-digit phone number.'
  const pw = String(v.password ?? '')
  if (pw && !(pw.length >= 8 && pw.length <= 100 && /[a-z]/.test(pw) && /[A-Z]/.test(pw) && /[^a-zA-Z]/.test(pw))) errors.password = 'Your password must include the following: 8-100 characters, upper & lowercase letters, at least one number or special character.'
  if (!Object.keys(errors).length) {
    const acct = createAccount(req.storeSlug, { email: String(v.email).trim(), password: pw, first_name: v.firstName.trim(), last_name: v.lastName.trim(), phone: digits(v.phone), marketing: v.marketing === '1' })
    if (acct.error) errors.email = acct.error
    // ASSUMPTION: the real flow follows "Create account" with a 6-digit SMS code ("Verify number"). No SMS can be
    // sent here, so the new number counts as verified and the shopper lands where the gate was going to send them.
    else return finishAuth(req, res, acct)
  }
  render(req, res, { title: 'Create your Walmart account | Walmart', variant: 'identity', status: 400, body: P.signupPage({ base: res.locals.base, values: { ...v, password: '', marketing: v.marketing === '1' }, errors, state: req.store.auth?.state ?? null }) })
})

router.get('/account/logout', (req, res) => { req.store.user = null; req.store.checkout = {}; req.store.auth = null; res.redirect(`${res.locals.base}/`) })

// ---- checkout (/checkout/review-order): one page of cards that save one at a time ----
function checkoutGuard(req, res) {
  const base = res.locals.base
  if (!req.store.cart.length) { res.redirect(`${base}/?reason=invalidCartIdOrPcId`); return false }
  if (!validCart(req.store)) { cartError(req,res,'An item or quantity is no longer available. Review your cart before checkout.'); return false }
  if (!req.store.user) { res.redirect(gateUrl(base, `/checkout/review-order?cartId=${cartId(req.store)}`, 'AuthMiddlewareCsr')); return false }
  const c = req.store.checkout
  c.owner = req.store.user.id
  c.plus ??= { opted: false, decided: false, plan: null }
  // Contact is pre-filled from the account, so the shopper normally only sees "Edit Contact".
  c.contact ??= { email: req.store.user.email, phone: digits(req.store.user.phone), textUpdates: retailState(req).preferences.order_updates ?? true, marketing: retailState(req).preferences.offers ?? false }
  return true
}
// Step order from the checkout app's state machine: shipping address -> payment -> contact -> (Walmart+ plan) -> review.
function remainingSteps(c) {
  const steps = []
  if (!c.address) steps.push('address')
  if (!c.payment) steps.push('payment')
  if (!c.contact) steps.push('contact')
  if (c.plus?.opted && !c.plus.decided) steps.push('plus')
  return steps
}
const coTotals = (store) => totals(store, { taxed: !!store.checkout.address, trial: !!(store.checkout.plus?.decided && store.checkout.plus.plan) })
// Bind the final review to trusted item prices/quantities and the saved checkout details.
const reviewSignature = (store, t = coTotals(store)) => JSON.stringify({
  items: t.lines.map(l => [l.pid, l.variantId ?? null, l.qty, l.product.price]),
  total: t.total, address: store.checkout.address, payment: store.checkout.payment,
  contact: store.checkout.contact, plus: store.checkout.plus, owner: store.user?.id,
})

function defaultValues(req, open) {
  const u = req.store.user, c = req.store.checkout
  if (open === 'address') return c.address ?? savedAddressValues(req) ?? { firstName: u.first_name, lastName: u.last_name, phone: digits(u.phone) }
  if (open === 'payment') {
    const p = c.payment
    if (p?.method === 'card') return { firstName: p.firstName, lastName: p.lastName, phone: p.phone, billingSame: p.billingSame, ...(p.billingSame ? {} : { billingAddress1: p.billing.line1, billingAddress2: p.billing.line2 ?? '', billingCity: p.billing.city, billingState: p.billing.state, billingZip: p.billing.postal_code }) }
    return { firstName: u.first_name, lastName: u.last_name, phone: c.address?.phone ?? digits(u.phone) }
  }
  if (open === 'contact') return c.contact ?? {}
  if (open === 'plus') return { plan: c.plus?.plan ?? '' }
  return {}
}

function renderCheckout(req, res, { open, values, errors = {}, status = 200 } = {}) {
  const c = req.store.checkout
  const remaining = remainingSteps(c)
  open ??= remaining[0] ?? 'review'
  const ctaLabel = remaining.filter(s => s !== open).length ? 'Continue' : 'Save and review order'
  const t = coTotals(req.store)
  if (open === 'review' && !remaining.length) {
    const signature = reviewSignature(req.store, t)
    if (c.reviewedSignature !== signature) c.reviewToken = randomUUID()
    c.reviewedSignature = signature
  }
  const body = savedAddressPicker(req, res.locals.base) + P.checkoutPage({ base: res.locals.base, t, c, open, ctaLabel, values: values ?? defaultValues(req, open), errors })
  res.status(status).type('html').send(P.layout({ base: res.locals.base, title: 'Review your order - Walmart.com', body, t, user: req.store.user, variant: 'checkout' }))
}

router.get('/checkout/review-order', (req, res) => {
  if (!checkoutGuard(req, res)) return
  const c = req.store.checkout
  const edit = String(req.query.edit ?? '')
  if (req.query.address_id) {
    const address = retailState(req).addresses.find(a => a.id === req.query.address_id)
    if (!address) return renderCheckout(req, res, { open: 'address', errors: { address: 'Choose an address from your own address book.' }, status: 400 })
    return renderCheckout(req, res, { open: 'address', values: checkoutAddress(address, req.store.user) })
  }
  if (req.query.cartId !== cartId(req.store)) return res.redirect(reviewUrl(res.locals.base, req.store, edit ? `&edit=${encodeURIComponent(edit)}` : ''))
  const canEdit = { address: true, payment: !!c.address, contact: true, plus: !!c.plus?.opted }
  renderCheckout(req, res, { open: canEdit[edit] ? edit : undefined })
})

router.post('/checkout/address', (req, res) => {
  if (!checkoutGuard(req, res)) return
  const { values: v, errors } = scalarForm(req.body, 'firstName lastName address1 address2 city state zip phone instructions preferred addressId')
  v.preferred = v.preferred === '1'
  const need = (k, msg) => { if (!String(v[k] ?? '').trim()) errors[k] = msg }
  need('firstName', 'Enter a first name'); need('lastName', 'Enter a last name'); need('address1', 'Enter a street address'); need('city', 'Enter a city')
  if (!STATES.includes(v.state)) errors.state = 'Select a state'
  if (!/^\d{5}(-\d{4})?$/.test(String(v.zip ?? '').trim())) errors.zip = 'Enter a valid ZIP code'
  if (digits(v.phone).length !== 10) errors.phone = 'Enter a valid 10 digit phone number'
  if (/^\s*p\.?\s*o\.?\s*box/i.test(String(v.address1 ?? ''))) errors.address1 = 'No PO boxes. Military addresses OK.'
  if (v.addressId && !retailState(req).addresses.some(a => a.id === v.addressId)) errors.addressId = 'Choose an address from your own address book.'
  if (Object.keys(errors).length) return renderCheckout(req, res, { open: 'address', values: v, errors, status: 400 })
  if (v.preferred) {
    const saved = saveAddress(req, { id: v.addressId || undefined, label: 'Delivery address', name: `${v.firstName.trim()} ${v.lastName.trim()}`, line1: v.address1, line2: v.address2, city: v.city, state: v.state, postal_code: v.zip, phone: digits(v.phone), is_default: 'yes' }, { country: 'US', requirePhone: true })
    if (saved.errors) return renderCheckout(req, res, { open: 'address', values: v, errors: { address: saved.errors.join(' ') }, status: 400 })
    v.addressId = saved.address.id
  }
  req.store.checkout.address = { firstName: v.firstName.trim(), lastName: v.lastName.trim(), address1: v.address1.trim(), address2: String(v.address2 ?? '').trim(), city: v.city.trim(), state: v.state, zip: String(v.zip).trim(), phone: digits(v.phone), instructions: String(v.instructions ?? '').trim(), preferred: v.preferred, ...(v.addressId ? { addressId: v.addressId } : {}) }
  if (req.store.checkout.payment?.billingSame) req.store.checkout.payment.billing = { line1: v.address1.trim(), line2: String(v.address2 ?? '').trim() || null, city: v.city.trim(), state: v.state, postal_code: String(v.zip).trim() }
  res.redirect(reviewUrl(res.locals.base, req.store))
})

router.post('/checkout/payment', (req, res) => {
  if (!checkoutGuard(req, res)) return
  const base = res.locals.base
  const c = req.store.checkout
  if (!c.address) return res.redirect(reviewUrl(base, req.store))
  if (req.body.method === 'paypal') {
    // ASSUMPTION: "Continue to PayPal" would hand off to PayPal; here it counts as approved and is recorded as { method: 'paypal' }.
    c.payment = { method: 'paypal' }
    return res.redirect(reviewUrl(base, req.store))
  }
  const { values: v, errors } = scalarForm(req.body, 'method cardNumber expMonth expYear expiration cvv firstName lastName phone billingSame saveCard defaultCard billingAddress1 billingAddress2 billingCity billingState billingZip')
  v.billingSame = v.billingSame === '1'; v.saveCard = v.saveCard === '1'; v.defaultCard = v.defaultCard === '1'
  // The form posts the "MM*" / "YY*" selects; a single "MM/YY" expiration field is still accepted.
  const expiry = (v.expMonth || v.expYear || v.expiration === undefined) ? `${v.expMonth ?? ''}/${v.expYear ?? ''}` : String(v.expiration).trim()
  const card = validateCard({ number: v.cardNumber, expiry, cvv: v.cvv })
  if (!card.ok) {
    if (card.errors.number) errors.cardNumber = 'Please enter a valid card number.'
    if (card.errors.expiry) errors.expiration = /^\d{1,2}\/\d{2,4}$/.test(expiry) ? 'Expiration date is invalid' : 'Expiration date is required'
    if (card.errors.cvv) errors.cvv = 'Enter a 3 or 4 digit CVV code'
  }
  if (!String(v.firstName ?? '').trim()) errors.firstName = 'First name on card is required'
  if (!String(v.lastName ?? '').trim()) errors.lastName = 'Last name on card is required'
  if (digits(v.phone).length !== 10) errors.phone = 'Enter a valid 10 digit phone number'
  if (!v.billingSame) {
    if (!String(v.billingAddress1 ?? '').trim()) errors.billingAddress1 = 'Enter a billing street address'
    if (!String(v.billingCity ?? '').trim()) errors.billingCity = 'Enter a billing city'
    if (!STATES.includes(v.billingState)) errors.billingState = 'Select a billing state'
    if (!/^\d{5}(-\d{4})?$/.test(String(v.billingZip ?? '').trim())) errors.billingZip = 'Enter a valid billing ZIP code'
  }
  // Never echo the card number or CVV back into the form.
  if (Object.keys(errors).length) return renderCheckout(req, res, { open: 'payment', values: { ...v, cardNumber: '', cvv: '' }, errors, status: 400 })
  const a = c.address
  c.payment = {
    method: 'card', brand: card.brand, last4: card.last4, expiration: expiry,
    firstName: v.firstName.trim(), lastName: v.lastName.trim(), phone: digits(v.phone), billingSame: v.billingSame, saveCard: v.saveCard,
    billing: v.billingSame
      ? { line1: a.address1, line2: a.address2 || null, city: a.city, state: a.state, postal_code: a.zip }
      : { line1: v.billingAddress1.trim(), line2: String(v.billingAddress2 ?? '').trim() || null, city: v.billingCity.trim(), state: v.billingState, postal_code: String(v.billingZip).trim() },
  }
  res.redirect(reviewUrl(base, req.store))
})

router.post('/checkout/contact', (req, res) => {
  if (!checkoutGuard(req, res)) return
  const { values: v, errors } = scalarForm(req.body, 'email phone textUpdates marketing')
  v.textUpdates = v.textUpdates === '1'; v.marketing = v.marketing === '1'
  if (!EMAIL_RE.test(String(v.email ?? '').trim())) errors.email = 'Please enter a valid email address'
  if (digits(v.phone).length !== 10) errors.phone = 'Enter a valid 10 digit phone number'
  if (Object.keys(errors).length) return renderCheckout(req, res, { open: 'contact', values: v, errors, status: 400 })
  req.store.checkout.contact = { email: String(v.email).trim().toLowerCase(), phone: digits(v.phone), textUpdates: v.textUpdates, marketing: v.marketing }
  res.redirect(reviewUrl(res.locals.base, req.store))
})

router.post('/checkout/plus', (req, res) => {
  if (!checkoutGuard(req, res)) return
  const base = res.locals.base
  const c = req.store.checkout
  if (!c.plus?.opted) return res.redirect(reviewUrl(base, req.store))
  if (req.body.decline === '1') { c.plus = { opted: true, decided: true, plan: null }; return res.redirect(reviewUrl(base, req.store)) }
  const errors = {}
  const plan = Object.hasOwn(WALMART_PLUS.plans, req.body.plan) ? req.body.plan : null
  if (!plan) errors.plan = 'Choose a plan'
  if (req.body.agree !== '1') errors.agree = 'You must check the box to agree to the terms'
  if (Object.keys(errors).length) return renderCheckout(req, res, { open: 'plus', values: { plan: req.body.plan, agree: req.body.agree === '1' }, errors, status: 400 })
  c.plus = { opted: true, decided: true, plan }
  res.redirect(reviewUrl(base, req.store))
})

router.post('/checkout/place-order', (req, res) => {
  if (!checkoutGuard(req, res)) return
  const base = res.locals.base
  const c = req.store.checkout
  // Something still needs saving: the review page re-opens that card instead of placing the order.
  if (remainingSteps(c).length) return res.redirect(reviewUrl(base, req.store))
  const t = coTotals(req.store)
  if (c.reviewedSignature !== reviewSignature(req.store, t) || (req.body.review_token !== undefined && req.body.review_token !== c.reviewToken)) {
    return renderCheckout(req, res, { open: 'review', status: 409, errors: { review: 'Your order changed since it was reviewed. Review the items, total and delivery details before placing your order.' } })
  }
  const token = randomBytes(12).toString('hex')
  const a = c.address, u = req.store.user, pay = c.payment
  const paymentError=scenarioPayment(req.store,pay,t.lines)
  if(paymentError) return renderCheckout(req,res,{open:'payment',errors:{payment:paymentError},status:402})
  const order = recordOrder({
    store: req.storeSlug,
    order_number: orderNumber(),
    session: req.session,
    items: t.lines.map(l => l.product.kind === 'game'
      ? { platform: l.product.platform, edition: l.product.edition, format: l.product.format, qty: l.qty, unit_price: l.product.price, title: l.product.title, sku: l.product.id }
      : { kind: 'other', title: l.product.title, qty: l.qty, unit_price: l.product.price, sku: l.product.id }),
    customer: { email: c.contact.email, first_name: u.first_name, last_name: u.last_name, phone: c.contact.phone, account_id: u.id, guest: false },
    fulfillment: { method: 'ship', option: 'Free shipping', eta: arrivalSummary(t.lines) },
    shipping_address: { first_name: a.firstName, last_name: a.lastName, line1: a.address1, line2: a.address2 || null, city: a.city, state: a.state, postal_code: a.zip, country: 'US', phone: a.phone, instructions: a.instructions || null },
    billing_address: pay.method === 'card' ? { first_name: pay.firstName, last_name: pay.lastName, ...pay.billing, country: 'US' } : null,
    payment: pay.method === 'card' ? { method: 'card', brand: pay.brand, last4: pay.last4, name_on_card: `${pay.firstName} ${pay.lastName}`, expiration: pay.expiration } : { method: 'paypal' },
    totals: { subtotal: t.subtotal, shipping: t.shipping, tax: t.tax, ...(t.walmartPlus ? { walmart_plus: t.walmartPlus } : {}), total: t.total },
    currency: 'USD',
    meta: { token, account_id: u.id, cart_id: c.cartId, gift: req.body.gift === '1', walmart_plus: c.plus.plan, text_updates: c.contact.textUpdates, options:t.lines.map(l=>({sku:l.pid,variant_id:l.variantId??null,options:l.product.selectedOptions??{},quantity:l.qty,eta:l.product.arrival.day,seller_id:l.product.sellerId})) },
  })
  if (c.plus.plan) retailState(req).membership = { plan: c.plus.plan, order_number: order.order_number, started_at: order.created_at, cancelled: false }
  req.store.cart = []
  req.store.checkout = {}
  res.redirect(`${base}/thankyou?order=${order.order_number}&token=${token}`)
})

router.get('/thankyou', (req, res) => {
  const base = res.locals.base
  const order = privateOrder(req, String(req.query.order ?? ''))
  if (!order || order.meta.token !== req.query.token) {
    return render(req, res, { title: 'Order not found - Walmart.com', status: 404, body: P.simplePage({ title: "We couldn't find that order", html: `<p>Check your Purchase history for order details.</p><a class="wm-pill" href="${base}/account">Purchase history</a>` }) })
  }
  render(req, res, { title: 'Thanks for your order - Walmart.com', body: P.thankyouPage({ base, order, status: orderStatus(order) }) })
})


export default {
  slug: 'walmart',
  name: NAME,
  country: 'US',
  currency: 'USD',
  description: 'US. Code-in-box PS5/Xbox at $79.99, "Added to cart!" interstitial, no guest checkout (email-first identity gate), one-page checkout of Save cards, Walmart+ upsells.',
  router,
}
