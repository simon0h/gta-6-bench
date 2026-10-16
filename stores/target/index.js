import { enterScenarioCart, scenarioAvailability, scenarioPayment } from '../../lib/benchmark-scenarios.js'
import { Router } from 'express'
import { randomBytes, randomInt } from 'node:crypto'
import { recordOrder } from '../../lib/orders.js'
import { validateCard } from '../../lib/payment.js'
import { authenticate, createAccount, publicAccount } from '../../lib/accounts.js'
import { PRODUCTS, CATALOG, ALL_DEPARTMENTS, byTcin, games, sponsored, protectionPlan, productPath, search, refine, totals, STATES, PAYMENT_TYPES, PREORDER_ARRIVAL, ARRIVES, selectedProduct, stockLimit, lineKey, productForLine, cartIssues, arrivalSummary } from './data.js'
import * as P from './pages.js'
import * as B from './browse.js'
import * as S from './site.js'
import { installSite } from './site-routes.js'
import { CAMPAIGNS } from './catalog.js'
import { shelfByTcin, shelfArtDescriptor } from './shelf.js'
import { renderProductAsset } from '../../lib/product-asset-art.js'
import { fixtureCatalog } from '../../lib/catalog-policy.js'
import { saveAddress } from '../../lib/retail-state.js'
import { installJourneys, accountOrder, retailState, defaultAddress, addressValues, shippingAddressInput, rememberSelection, selectedStore, orderPage } from './journeys.js'

const NAME = 'Target'
const router = Router()

// ---- helpers ----
function render(req, res, title, body, { status = 200, minimal = false, q = '' } = {}) {
  const t = totals(req.store)
  res.status(status).type('html').send(P.layout({ base: res.locals.base, title, body, cartCount: t.count, user: req.store.user, q, minimal, shipZip: req.store.locationZip, storeLocation: selectedStore(req).name }))
}
// ASSUMPTION: 15 digits with no separators (one public example: 902001863311107); shipped
// Target.com orders appear to start with 102… (low confidence in the research).
function activateAccount(req,acct) {
  if(req.store.user?.id!==acct.id) {
    const paypal=!req.store.user&&req.store.checkout.paymentValues?.paymentType==='paypal'
    req.store.checkout=paypal?{paymentValues:{paymentType:'paypal'}}:{}
  }
  req.store.user=publicAccount(acct)
}
function orderNumber() { return '102' + String(randomInt(0, 1e12)).padStart(12, '0') }
// Only ever redirect back to a path inside this store.
function safePath(base, s, fallback) {
  s = typeof s === 'string' ? s : ''
  return s.startsWith(base + '/') && !s.startsWith(base + '//') ? s : fallback
}
function withQuery(path, params) {
  const u = new URL(path, 'http://x')
  for (const k of ['added', 'addedVariant', 'notadded', 'list']) u.searchParams.delete(k)
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v)
  return u.pathname + u.search
}
const recsFor = p => CATALOG.filter(x => x.tcin !== p?.tcin && !x.addon && stockLimit(x)>0 && (p ? x.department === p.department : !!x.family)).slice(0,4)
function drawerFor(req, res, closeHref) {
  const added = req.query.added ? selectedProduct(byTcin(req.query.added), String(req.query.addedVariant ?? '')) : null
  const notAdded = req.query.notadded ? byTcin(req.query.notadded) : null
  if (!added && !notAdded) return ''
  return P.addedDrawer({ base: res.locals.base, added, notAdded, closeHref, plan: protectionPlan(), recs: recsFor(added ?? notAdded) })
}
function invalidateCheckout(store) {
  if (!store.checkout.shipping && !store.checkout.payment) return
  // A changed basket needs fresh eligibility, totals and payment review.
  // Keep ordinary address fields so the shopper can confirm or correct them.
  store.checkout.shipping = null
  store.checkout.payment = null
  store.checkout.paymentValues = {}
}
function addToCart(store, p, qty) {
  if (!p || !Number.isInteger(qty) || qty<1 || qty>stockLimit(p)) return false
  const line=store.cart.find(l=>lineKey(l.tcin,l.variantId)===lineKey(p.tcin,p.variantId))
  const total=store.cart.filter(l=>l.tcin===p.tcin).reduce((n,l)=>n+l.qty,0)
  if ((line?.qty||0)+qty>stockLimit(p) || total+qty>stockLimit(byTcin(p.tcin))) return false
  if (line) line.qty+=qty; else store.cart.push({tcin:p.tcin,qty,...(p.variantId?{variantId:p.variantId}:{})})
  invalidateCheckout(store)
  return true
}
function selection(body) {
  if (body.fulfillment && body.fulfillment!=='shipping') return null
  if (['size','color','option','options'].some(k=>Object.hasOwn(body,k))) return null
  return selectedProduct(byTcin(body.tcin),String(body.variant||''))
}
function cartError(req,res,message='That option or quantity is unavailable. Check your selection and try again.') {
  render(req,res,'Check your cart : Target',P.simplePage({title:'Item not added to cart',html:`<p role="alert">${message}</p><a class="tg-btn" href="${res.locals.base}/cart">Return to cart</a> <a href="${res.locals.base}/c">Continue shopping</a>`}),{status:400})
}
function notFound(req, res) {
  render(req, res, 'Page not found : Target', P.simplePage({ title: 'Oops! Something went wrong.', html: `<p>We can&rsquo;t find the page you&rsquo;re looking for.</p><a class="tg-btn" href="${res.locals.base}/">Go to homepage</a>` }), { status: 404 })
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
  if((checkout&&unavailable)||(adding&&ids.some(id=>scenarioAvailability(req.store,id,'shipping')===false))) return render(req,res,'Review your cart',P.cartPage({base:res.locals.base,t:totals(req.store),user:req.store.user,recs:[]}),{status:409})
  next()
})

// ---- browse ----
router.get('/', (req,res)=>render(req,res,'Target : Expect More. Pay Less.',S.homePage({base:res.locals.base,catalog:B.catalogHome({base:res.locals.base}),rows:fixtureCatalog?{}:B.homeRows(res.locals.base)})+drawerFor(req,res,res.locals.base+'/')))
const filterNames=['platform','category','type','material','size','price','availability','brand','format','rating','fulfillment','sort']
function browseRender(req,res,{q='',pool=search(q),heading='',subheading='',intro='',outro='',crumbs=true,emptyCategory=false}={}) {
  const base=res.locals.base
  const filters=Object.fromEntries(filterNames.map(k=>[k,String(req.query[k]??'')]))
  const products=refine(pool,filters), page=Math.max(1,Number.parseInt(req.query.page,10)||1)
  const params=new URLSearchParams({...((req.path==='/s'||req.path.startsWith('/s/'))?{searchTerm:q}:{}),...Object.fromEntries(Object.entries(filters).filter(([,v])=>v)),...(page>1?{page:String(page)}:{})})
  const path=`${base}${req.path.startsWith('/s/')?'/s':req.path}${params.size?'?'+params:''}`
  render(req,res,`${heading||q||'Shop all products'} : Target`,B.listingPage({base,q,pool,products,filters,heading,subheading,intro,outro,crumbs,emptyCategory,page,backPath:path,drawer:drawerFor(req,res,path)}),{q})
}
// Locally rendered illustrations for the everyday assortment (see media.js).
const shelfArtCache=new Map()
router.get('/shelf-art/:tcin/:view.svg',(req,res)=>{
  const p=fixtureCatalog?null:shelfByTcin.get(req.params.tcin), view=Number(req.params.view), variant=typeof req.query.variant==='string'?req.query.variant:''
  if(!p||!/^[0-3]$/.test(req.params.view))return res.status(404).type('text').send('Product image not found')
  const key=`${p.tcin}:${variant}:${view}`
  if(!shelfArtCache.has(key)){if(shelfArtCache.size>=600)shelfArtCache.delete(shelfArtCache.keys().next().value);shelfArtCache.set(key,renderProductAsset(shelfArtDescriptor(p,variant),view))}
  res.set('Cache-Control','public, max-age=3600').set('X-Product-Asset-Provenance','synthetic-illustration').type('image/svg+xml').send(shelfArtCache.get(key))
})
installSite(router,{render,notFound,browseRender,products:CATALOG})
router.get('/s',(req,res)=>browseRender(req,res,{q:String(req.query.searchTerm??'').trim()}))
router.get('/s/:term',(req,res)=>browseRender(req,res,{q:String(req.params.term).replace(/\+/g,' ').trim()}))
router.get('/c',(req,res)=>render(req,res,'Shop all categories : Target',B.categoryDirectory({base:res.locals.base})))
router.get('/c/:department',(req,res)=>{
  const base=res.locals.base, department=ALL_DEPARTMENTS.find(d=>d.id===req.params.department),campaign=CAMPAIGNS.find(c=>c.id===req.params.department)
  if(!department&&!campaign) return notFound(req,res)
  const pool=CATALOG.filter(p=>!p.addon&&(department?p.department===department.id:campaign.select(p)))
  browseRender(req,res,{pool,heading:department?.name||campaign.name,intro:B.categoryIntro({base,department,campaign})})
})
router.get('/weekly-ad',(req,res)=>browseRender(req,res,{pool:CATALOG.filter(p=>p.deal),heading:'Weekly Ad',subheading:'Shop this week’s deals',intro:B.categoryIntro({base:res.locals.base,weekly:true})}))
router.get('/b/:brand',(req,res)=>{
  const pool=CATALOG.filter(p=>!p.addon&&B.brandSlug(p.brand)===req.params.brand)
  if(!pool.length)return notFound(req,res)
  browseRender(req,res,{pool,heading:pool[0].brand})
})
router.get('/p/:slug/-/A-:tcin',(req,res)=>{
  // Target's search and brand pages link the grouped GTA VI parent; its default
  // selection is the PS5 child TCIN. Swatches link the individual child listings.
  const base=res.locals.base, original=byTcin(req.params.tcin==='1012260588'?'1011529119':req.params.tcin)
  if(!original)return notFound(req,res)
  const p=selectedProduct(original,String(req.query.variant??original.variants?.[0]?.id??''))
  if(!p)return cartError(req,res,'That product option is not available. Return to the product and choose a listed option.')
  rememberSelection(req,p)
  const fulfillment=['pickup','delivery','shipping'].includes(req.query.fulfillment)?req.query.fulfillment:'shipping'
  const browseBack=safePath(base,req.query.returnTo,'')
  const path=withQuery(productPath(base,p),{...(p.variantId?{variant:p.variantId}:{}),...(browseBack?{returnTo:browseBack}:{})})
  render(req,res,`${p.title} : Target`,P.productPage({base,p,browseBack,siblings:games(),fulfillment,shipZip:req.store.locationZip,storeLocation:selectedStore(req).name,plan:protectionPlan(),recs:recsFor(p),user:req.store.user,drawer:drawerFor(req,res,path),listMsg:req.query.list==='added'?'Item added to your list.':null}))
})

// ---- cart ----
router.post('/cart/add',(req,res)=>{
  const base=res.locals.base,p=selection(req.body)
  if(!p)return cartError(req,res)
  const back=safePath(base,req.body.back,productPath(base,p)),qty=Number(req.body.qty??1)
  const plan=req.body.addon&&p.esp?byTcin(req.body.addon):null
  if(req.body.addon && !plan?.addon)return cartError(req,res,'That protection plan is not available in this catalog.')
  if(!addToCart(req.store,p,qty))return cartError(req,res)
  if(plan?.addon)addToCart(req.store,plan,1)
  res.redirect(withQuery(back,{added:p.tcin,...(p.variantId?{addedVariant:p.variantId}:{})}))
})
router.post('/buy-now',(req,res)=>{
  const base=res.locals.base,p=selection(req.body)
  if(!p)return cartError(req,res)
  if(!req.store.user)return res.redirect(`${base}/login?redirect=${encodeURIComponent(productPath(base,p)+(p.variantId?'?variant='+p.variantId:''))}`)
  if(!addToCart(req.store,p,1))return cartError(req,res)
  res.redirect(`${base}/checkout`)
})

router.get('/cart', (req, res) => {
  const saved = (retailState(req).savedForLater ?? []).map(l=>typeof l==='string'?byTcin(l):productForLine(l)).filter(Boolean)
  render(req, res, 'Cart : Target', P.cartPage({
    base: res.locals.base, t: totals(req.store), saved, user: req.store.user, recs: recsFor(productForLine(req.store.cart[0] || {})),
    storeLocation:selectedStore(req).name, promo: !!req.query.promo, promoError: req.query.promoError, promoValue: req.query.code,
  }))
})

router.post('/cart/update',(req,res)=>{
  const previousCart = JSON.stringify(req.store.cart)
  const tcin=String(req.body.tcin??''),variantId=String(req.body.variant??''),key=lineKey(tcin,variantId),action=req.body.action||'update'
  const p=selectedProduct(byTcin(tcin),variantId)
  retailState(req).savedForLater??=[]
  const matches=l=>lineKey(typeof l==='string'?l:l.tcin,typeof l==='string'?'':l.variantId)===key
  const drop=()=>{req.store.cart=req.store.cart.filter(l=>!matches(l))}
  if(!p)return cartError(req,res)
  if(action==='remove')drop()
  else if(action==='save') { const line=req.store.cart.find(matches);if(line){if(!retailState(req).savedForLater.some(matches))retailState(req).savedForLater.push({...line});drop()} }
  else if(action==='restore') {
    const saved=retailState(req).savedForLater.find(matches)
    if(!saved||!addToCart(req.store,p,typeof saved==='string'?1:saved.qty))return cartError(req,res)
    retailState(req).savedForLater=retailState(req).savedForLater.filter(l=>!matches(l))
  } else if(action==='removesaved')retailState(req).savedForLater=retailState(req).savedForLater.filter(l=>!matches(l))
  else {
    const line=req.store.cart.find(matches),qty=Number(req.body.qty)
    const others=req.store.cart.filter(l=>l.tcin===tcin&&!matches(l)).reduce((n,l)=>n+l.qty,0)
    if(line&&qty===0)drop()
    else if(line&&Number.isInteger(qty)&&qty>=1&&qty<=stockLimit(p)&&others+qty<=stockLimit(byTcin(tcin)))line.qty=qty
    else return cartError(req,res)
  }
  if (previousCart !== JSON.stringify(req.store.cart)) invalidateCheckout(req.store)
  res.redirect(`${res.locals.base}/cart`)
})

router.post('/cart/promo', (req, res) => {
  const code = String(req.body.code ?? '').trim()
  const msg = code.length < 4 || code.length > 36 ? 'Enter a promo code between 4 and 36 characters.' : 'Promo code doesn’t apply to any item in your cart'
  res.redirect(`${res.locals.base}/cart?promo=1&promoError=${encodeURIComponent(msg)}&code=${encodeURIComponent(code)}`)
})

// "Pay with PayPal" under the Check out button: needs a signed-in account, then the same
// Shipping → Payment → Review steps with PayPal preselected and "Pay with PayPal" on the review step.
router.post('/cart/paypal', (req, res) => {
  const base = res.locals.base
  if (!req.store.cart.length) return res.redirect(`${base}/cart`)
  req.store.checkout.paymentValues = { paymentType: 'paypal' }
  req.store.checkout.payment = null
  if (!req.store.user) return res.redirect(`${base}/login?redirect=${encodeURIComponent(base + '/checkout')}`)
  res.redirect(`${base}/checkout`)
})

// ---- auth (no guest checkout: "You'll need to sign in to a Target account in order to proceed with checkout.") ----
// ASSUMPTION: like checkout, the sign-in and create-account pages use the reduced logo-only chrome
// (no search bar or marketing footer); the research does not describe their header/footer.
const AUTH = { minimal: true }
router.get('/login', (req, res) => render(req, res, 'Login: Target', P.loginPage({ base: res.locals.base, redirect: safePath(res.locals.base, req.query.redirect, '') }), AUTH))
router.post('/login', (req, res) => {
  const base = res.locals.base
  const redirect = safePath(base, req.body.redirect, '')
  const acct = authenticate(req.storeSlug, req.body.email, req.body.password)
  // ASSUMPTION: Target's exact wrong-password message was not captured.
  if (!acct) return render(req, res, 'Login: Target', P.loginPage({ base, redirect, email: req.body.email, error: 'We couldn’t sign you in. Check your email address and password and try again.' }), { ...AUTH, status: 401 })
  activateAccount(req,acct)
  res.redirect(redirect || `${base}/account`)
})
router.get('/login/:kind', (req, res) => {
  if (!['passkey', 'phone'].includes(req.params.kind)) return notFound(req, res)
  render(req, res, 'Login: Target', P.altSignInPage({ base: res.locals.base, kind: req.params.kind, redirect: safePath(res.locals.base, req.query.redirect, '') }), AUTH)
})
router.get('/logout', (req, res) => { req.store.user = null; req.store.checkout = {}; res.redirect(`${res.locals.base}/`) })

router.get('/account/create', (req, res) => render(req, res, 'Create account : Target', P.createAccountPage({ base: res.locals.base, redirect: safePath(res.locals.base, req.query.redirect, '') }), AUTH))
router.post('/account/create', (req, res) => {
  const base = res.locals.base
  const v = req.body, errors = {}
  const redirect = safePath(base, v.redirect, '')
  const email = String(v.email ?? '').trim(), pw = String(v.password ?? '')
  if (!email) errors.email = 'Email address is required'
  else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errors.email = 'Enter a valid email address'
  if (!String(v.firstName ?? '').trim()) errors.firstName = 'First name is required'
  if (!String(v.lastName ?? '').trim()) errors.lastName = 'Last name is required'
  if (v.phone && String(v.phone).replace(/\D/g, '').length !== 10) errors.phone = 'Enter a valid 10-digit mobile phone number'
  // Password rules from Target help: 8–20 characters, 2 of lowercase/uppercase/numbers/special, no < >.
  const classes = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter(re => re.test(pw)).length
  if (!pw) errors.password = 'Password is required'
  else if (pw.length < 8 || pw.length > 20) errors.password = 'Password must be 8–20 characters'
  else if (/[<>]/.test(pw)) errors.password = 'Password can’t contain < or >'
  else if (classes < 2) errors.password = 'Password must include at least 2 of the following: lowercase letters, uppercase letters, numbers, special characters'
  if (!Object.keys(errors).length) {
    const acct = createAccount(req.storeSlug, { email, password: pw, first_name: v.firstName.trim(), last_name: v.lastName.trim(), phone: String(v.phone ?? '').trim() })
    if (acct.error) errors.email = acct.error
    else { activateAccount(req,acct); return res.redirect(redirect || `${base}/account`) }
  }
  render(req, res, 'Create account : Target', P.createAccountPage({ base, redirect, values: { ...v, password: '' }, errors }), { ...AUTH, status: 400 })
})

// ---- checkout: Shipping address → Payment → Review & place order (one page, one URL per step) ----
function gate(req, res) {
  const base = res.locals.base
  if (!req.store.cart.length) { res.redirect(`${base}/cart`); return false }
  if (!req.store.user) { res.redirect(`${base}/login?redirect=${encodeURIComponent(base + '/checkout')}`); return false }
  if (cartIssues(req.store)) { cartError(req,res,'An item or selected option is no longer available in the requested quantity. Please update your cart.'); return false }
  return true
}
function renderCheckout(req, res, step, { values, errors = {} } = {}, status = 200) {
  const c = req.store.checkout, u = req.store.user
  const defaults = step === 'shipping'
    ? (c.shippingValues ?? addressValues(defaultAddress(req)) ?? { firstName: u.first_name, lastName: u.last_name, phone: u.phone })
    : step === 'payment' ? (c.paymentValues ?? {}) : {}
  render(req, res, 'Checkout : Target', P.checkoutPage({ base: res.locals.base, step, t: totals(req.store), checkout: c, values: values ?? defaults, errors, addresses: retailState(req).addresses }), { status, minimal: true })
}
function nextStep(c) { return !c.shipping ? 'shipping' : !c.payment ? 'payment' : 'review' }

const startCheckout = (req, res) => { if (gate(req, res)) res.redirect(`${res.locals.base}/checkout/${nextStep(req.store.checkout)}`) }
router.get('/checkout', startCheckout)
router.get('/checkout/start', startCheckout)

router.get('/checkout/shipping', (req, res) => {
  if (!gate(req,res)) return
  if (req.query.address_id) {
    const a=retailState(req).addresses.find(a=>a.id===req.query.address_id)
    if(!a)return notFound(req,res)
    req.store.checkout.shippingValues=addressValues(a)
    // Choosing a different address requires review and payment entry again.
    req.store.checkout.shipping=null
    req.store.checkout.payment=null
    req.store.checkout.paymentValues={}
  }
  renderCheckout(req,res,'shipping')
})
router.post('/checkout/shipping', (req, res) => {
  if (!gate(req, res)) return
  const v = req.body, errors = {}
  if(v.address_id&&!retailState(req).addresses.some(a=>a.id===v.address_id))return notFound(req,res)
  const req_ = (k, label) => { if (!String(v[k] ?? '').trim()) errors[k] = `${label} is required` }
  req_('firstName', 'First name'); req_('lastName', 'Last name'); req_('address1', 'Address line 1'); req_('zip', 'Zip code'); req_('city', 'City'); req_('state', 'State'); req_('phone', 'Phone number')
  if (v.zip && !/^\d{5}(-\d{4})?$/.test(String(v.zip).trim())) errors.zip = 'Check your ZIP code and try again.'
  if (v.state && !STATES.includes(v.state)) errors.state = 'State is required'
  if (v.phone && String(v.phone).replace(/\D/g, '').length !== 10) errors.phone = 'Enter a valid 10-digit phone number'
  // This item cannot ship to PO Boxes, Alaska, Hawaii or US territories.
  if (totals(req.store).lines.some(l=>l.product.restricted) && !errors.address1 && (['AK', 'HI'].includes(v.state) || /\bp\.?\s*o\.?\s*box\b/i.test(String(v.address1)))) errors.address1 = 'Can’t ship to your address. This item can’t be shipped to PO Boxes, Alaska, Hawaii or U.S. territories.'
  if (Object.keys(errors).length) return renderCheckout(req, res, 'shipping', { values: v, errors }, 400)
  const c = req.store.checkout
  const shipping = { first_name: v.firstName.trim(), last_name: v.lastName.trim(), line1: v.address1.trim(), line2: String(v.address2 ?? '').trim() || null, city: v.city.trim(), state: v.state, postal_code: String(v.zip).trim(), country: 'US', phone: String(v.phone).trim() }
  // Target help: changing the shipping address during checkout forces CVV re-entry.
  if (c.payment && c.shipping && JSON.stringify(c.shipping) !== JSON.stringify(shipping)) { c.payment = null; c.paymentValues = {} }
  if(v.defaultAddress) {
    const saved=saveAddress(req,shippingAddressInput(v),{country:'US',requirePhone:true})
    if(saved.errors)return renderCheckout(req,res,'shipping',{values:v,errors:{address1:saved.errors.join(' ')}},400)
    v.address_id=saved.address.id
  }
  c.shipping = shipping
  c.shippingValues = Object.fromEntries(['address_id','firstName','lastName','address1','address2','zip','city','state','phone','defaultAddress','instructions'].map(k=>[k,String(v[k]??'')]))
  c.instructions = String(v.instructions ?? '').trim() || null
  res.redirect(`${res.locals.base}/checkout/${nextStep(c)}`)
})

router.get('/checkout/payment', (req, res) => {
  if (!gate(req, res)) return
  if (!req.store.checkout.shipping) return res.redirect(`${res.locals.base}/checkout/shipping`)
  renderCheckout(req, res, 'payment')
})
router.post('/checkout/payment', (req, res) => {
  if (!gate(req, res)) return
  const c = req.store.checkout
  if (!c.shipping) return res.redirect(`${res.locals.base}/checkout/shipping`)
  const v = req.body, errors = {}
  const type = PAYMENT_TYPES[v.paymentType] ? v.paymentType : 'card'
  const kept = Object.fromEntries(['paymentType','expiry','nameOnCard','billingSame','billingFirstName','billingLastName','billingAddress1','billingZip','billingCity','billingState'].map(k=>[k,String(v[k]??'')])) // never echo the card number or CVV
  if (v.action === 'giftcard') {
    errors.giftCardNumber = 'We couldn’t find a gift card with that number. Check the card number and access number and try again.'
    return renderCheckout(req, res, 'payment', { values: kept, errors }, 400)
  }
  let payment = { type }
  if (type === 'card') {
    const number = String(v.cardNumber ?? '').trim(), expiry = String(v.expiry ?? '').trim(), cvv = String(v.cvv ?? '').trim(), name = String(v.nameOnCard ?? '').trim()
    const card = validateCard({ number, expiry, cvv })
    if (!number) errors.cardNumber = 'Card number is required'
    else if (!card.ok && card.errors.number) errors.cardNumber = 'Invalid card number. Try again'
    if (!expiry) errors.expiry = 'Expiration date is required'
    else if (!card.ok && card.errors.expiry) errors.expiry = card.errors.expiry === 'This card has expired.' ? 'This card has expired. Try a different card' : 'Invalid expiration date. Try again'
    if (!cvv) errors.cvv = 'CVV is required'
    else if (!card.ok && card.errors.cvv) errors.cvv = 'Invalid CVV. Try again'
    if (!name) errors.nameOnCard = 'Name on card is required'
    if (card.ok) payment = { type, brand: card.brand, last4: card.last4, name_on_card: name, expiration: expiry }
  }
  const billingSame = v.billingSame !== '0'
  if (type === 'card' && !billingSame) {
    for (const [k, label] of [['billingFirstName', 'Billing first name'], ['billingLastName', 'Billing last name'], ['billingAddress1', 'Billing address line 1'], ['billingZip', 'Billing zip code'], ['billingCity', 'Billing city'], ['billingState', 'Billing state']]) if (!String(v[k] ?? '').trim()) errors[k] = `${label} is required`
  }
  if (Object.keys(errors).length) return renderCheckout(req, res, 'payment', { values: kept, errors }, 400)
  payment.billing_address = type !== 'card' || billingSame
    ? { ...c.shipping }
    : { first_name: v.billingFirstName.trim(), last_name: v.billingLastName.trim(), line1: v.billingAddress1.trim(), line2: null, city: v.billingCity.trim(), state: v.billingState, postal_code: String(v.billingZip).trim(), country: 'US' }
  c.payment = payment
  c.paymentValues = kept
  c.giftCardEntered = !!String(v.giftCardNumber ?? '').trim()
  res.redirect(`${res.locals.base}/checkout/review`)
})

router.get('/checkout/review', (req, res) => {
  if (!gate(req, res)) return
  const c = req.store.checkout
  if (!c.shipping || !c.payment) return res.redirect(`${res.locals.base}/checkout/${nextStep(c)}`)
  renderCheckout(req, res, 'review')
})

router.post('/checkout/place-order', (req, res) => {
  const base = res.locals.base
  if (!gate(req, res)) return
  const c = req.store.checkout, u = req.store.user
  if (!c.shipping || !c.payment) return res.redirect(`${base}/checkout/${nextStep(c)}`)
  const t = totals(req.store)
  const token = randomBytes(12).toString('hex')
  const pay = c.payment
  const payment = pay.type === 'card'
    ? { method: 'card', brand: pay.brand, last4: pay.last4, name_on_card: pay.name_on_card, expiration: pay.expiration }
    : { method: PAYMENT_TYPES[pay.type].method }
  const paymentError=scenarioPayment(req.store,payment,t.lines)
  if(paymentError) return renderCheckout(req,res,'payment',{errors:{payment:paymentError}},402)
  const order = recordOrder({
    store: req.storeSlug,
    order_number: orderNumber(),
    session: req.session,
    items: t.lines.map(l => l.product.kind === 'game'
      ? { platform: l.product.platform, edition: l.product.edition, format: l.product.format, qty: l.qty, unit_price: l.product.price, title: l.product.title, sku: l.product.tcin }
      : { kind: 'other', title: l.product.title, qty: l.qty, unit_price: l.product.price, sku: l.product.tcin }),
    customer: { email: u.email, first_name: u.first_name, last_name: u.last_name, phone: c.shipping.phone, account_id: u.id, guest: false },
    fulfillment: { method: 'ship', option: 'standard', eta: arrivalSummary(t.lines) },
    shipping_address: c.shipping,
    billing_address: pay.billing_address,
    payment,
    totals: { subtotal: t.subtotal, shipping: t.shipping, tax: t.tax, total: t.total },
    currency: 'USD',
    meta: { token, account_id:u.id, delivery_instructions: c.instructions ?? null, gift_card_entered: !!c.giftCardEntered, options: t.lines.map(l=>({tcin:l.tcin,variant_id:l.variantId??null,options:l.product.selectedOptions??{},quantity:l.qty,eta:l.product.eta})) },
  })
  req.store.cart = []
  req.store.checkout = {}
  res.redirect(`${base}/order-confirmation?orderId=${order.order_number}&token=${token}`)
})

router.get('/order-confirmation', (req, res) => {
  const order = accountOrder(req,String(req.query.orderId ?? ''))
  if (!order || order.meta.token !== req.query.token) return notFound(req, res)
  if(order.meta.lifecycle?.length)return render(req,res,'Order details : Target',orderPage(res.locals.base,order))
  render(req, res, 'Order confirmation : Target', P.confirmationPage({ base: res.locals.base, order }))
})

router.get('/location', (req, res) => render(req, res, 'Shipping location : Target', P.locationPage({ base: res.locals.base, zip: req.store.locationZip, returnTo: safePath(res.locals.base, req.query.returnTo, res.locals.base + '/') })))
router.post('/location', (req, res) => {
  const base = res.locals.base, zip = String(req.body.zip ?? '').trim(), returnTo = safePath(base, req.body.returnTo, base + '/')
  if (!/^\d{5}$/.test(zip)) return render(req, res, 'Shipping location : Target', P.locationPage({ base, zip, returnTo, error: 'Enter a valid 5-digit ZIP code.' }), { status: 400 })
  req.store.locationZip = zip
  res.redirect(returnTo)
})



installJourneys(router,{render,notFound,selection,addToCart,cartError})

router.use(notFound)

export default {
  slug: 'target',
  name: NAME,
  country: 'US',
  currency: 'USD',
  description: 'US. Code-in-box PS5/Xbox, account required (no guest checkout), Shipping → Payment → Review steps, Circle upsells.',
  router,
}
