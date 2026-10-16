import { enterScenarioCart, scenarioAvailability, scenarioPayment } from '../../lib/benchmark-scenarios.js'
import { Router } from 'express'
import { randomBytes, randomInt, createHash } from 'node:crypto'
import { recordOrder } from '../../lib/orders.js'
import { retailState } from '../../lib/retail-state.js'
import { validateCard } from '../../lib/payment.js'
import { authenticate, createAccount, publicAccount } from '../../lib/accounts.js'
import { PRODUCTS, ALL, byId, search, refine, totals, SHIPPING_METHODS, STATES, selectedProduct, cartError, shippingEta, parseFilters, collection, DEPARTMENTS, HUBS, productPath } from './data.js'
import * as P from './pages.js'
import { shelfAssetSvg } from './shelf-art.js'
import { LANDINGS, FACETS, EXTRA_COLLECTIONS, GIFT_BRANDS, INFO, landingHeader, subLanding, preownedLanding, infoPage, sitemapPage, sitemapXml } from './site.js'
import { proPage, tradePage, creditPage, gradingPage, digitalPage } from './marketing.js'
import { capturedRecommendations } from './recommendation-reference.js'
import { contactPage } from './checkout-reference.js'
import { registerJourneys, selectedStoreName, rememberSelection, productSaveActions, savedCartItem, savedCartSection, resumeSignIn, privateOrder, addressValues, addressPicker } from './journeys.js'

const NAME = 'GameStop'
const router = Router()

// ---- helpers ----
function render(req, res, title, body, status = 200) {
  const t = totals(req.store)
  res.status(status).type('html').send(P.layout({ base: res.locals.base, title, body, cartCount: t.count, user: req.store.user, q: String(req.query.q ?? ''), selectedStore: selectedStoreName(req) }))
}
function orderNumber() { return '1101000' + String(randomInt(0, 1e9)).padStart(9, '0') }
const games = () => PRODUCTS.filter(p => p.kind === 'game')


// Run-scoped availability changes are checked before every checkout boundary,
// including direct legacy routes. They never mutate the shared catalog.
router.use((req,res,next)=>{
  const checkout=/^\/(?:checkout(?:\/|$)|mrt\/checkout|gp\/buy\/|gp\/cart\/desktop\/go-to-checkout)/.test(req.path)
  if(checkout || (req.method==='GET' && /^\/(?:cart(?:\/|$)|gp\/cart\/view)/.test(req.path))) enterScenarioCart(req.store)
  const selection=[...req.store.cart,...(req.store.checkout.buyNow?[req.store.checkout.buyNow]:[])]
  const unavailable=selection.some(l=>scenarioAvailability(req.store,l.asin??l.tcin??l.pid,'shipping')===false)
  const adding=req.method==='POST'&&['/cart/add','/buy-now','/gp/product/handle-buy-box'].includes(req.path)
  const ids=[].concat(req.body?.asin??req.body?.ASIN??req.body?.tcin??req.body?.pid??[])
  if((checkout&&unavailable)||(adding&&ids.some(id=>scenarioAvailability(req.store,id,'shipping')===false))) return render(req,res,'Review your cart',P.cartPage({base:res.locals.base,t:totals(req.store)}),409)
  next()
})

registerJourneys(router, { render, invalidateReview })

// ---- browse ----
router.get('/', (req, res) => render(req, res, 'Power to the Players', P.homePage({ base: res.locals.base, products: ALL, user: req.store.user })))

function browse(req,res,hub=null) {
  const q = String(req.query.q ?? '')
  const filters = parseFilters(req.query)
  const source = hub ? hub.products.filter(p=>!q || search(q).some(x=>x.id===p.id)) : search(q)
  render(req,res,hub?.name || `${q} | Search Results`,P.searchPage({base:res.locals.base,q,filters,source,products:refine(source,filters),hub,path:res.locals.base+req.path,page:req.query.page}))
}
// Department and collection landings: real page structure around catalog rows only.
function withLanding(base,hub,path,extra={}) {
  const landing={...(LANDINGS[path]||{}),...extra}
  if(!landing.top && !landing.crumbs && !extra.name) return hub
  const name=landing.name||hub.name
  return {...hub,name,facets:FACETS[landing.facets]||FACETS.default,landingHtml:landingHeader(base,{name,crumbs:landing.crumbs||[],top:landing.top})}
}
function landingBrowse(req,res,{name,crumbs=[],top,filter,facets}) {
  browse(req,res,{name,description:'',products:ALL.filter(filter),facets:FACETS[facets]||FACETS.default,landingHtml:landingHeader(res.locals.base,{name,crumbs,top})})
}
router.get('/search',(req,res)=>browse(req,res))
for (const slug of [...DEPARTMENTS.map(d=>d.id),...Object.keys(HUBS),'gaming-accessories/controllers']) router.get('/'+slug,(req,res)=>browse(req,res,withLanding(res.locals.base,collection(slug),'/'+slug,slug==='gaming-accessories/controllers'?{crumbs:[['Gaming Accessories','/gaming-accessories']]}:{})))
router.get('/pre-order-online-pick-up-in-store',(req,res)=>browse(req,res,withLanding(res.locals.base,collection('pre-order'),'/pre-order-online-pick-up-in-store')))
router.get('/preowned',(req,res)=>browse(req,res,withLanding(res.locals.base,collection('pre-owned'),'/preowned')))
router.get('/preowned/:sub',(req,res,next)=>{const l=preownedLanding(req.params.sub);if(!l)return next();landingBrowse(req,res,l)})
router.get('/gift-cards',(req,res)=>landingBrowse(req,res,{...LANDINGS['/gift-cards'],filter:()=>false}))
router.get('/gift-cards/:brand',(req,res,next)=>{const b=GIFT_BRANDS[req.params.brand];if(!b)return next();landingBrowse(req,res,{name:`${b} Gift Cards`,crumbs:[['Gift Cards','/gift-cards']],filter:()=>false,top:()=>`<p class="gs-landing-note">${P.escapeText(b)} gift cards and digital codes are delivered by email on GameStop.com. Gift-card purchase and redemption are not offered in this local catalog.</p>`})})
for (const [path,c] of Object.entries(EXTRA_COLLECTIONS)) router.get(path,(req,res)=>landingBrowse(req,res,c))
const SLUG=/^[a-z0-9|-]{2,60}$/
for (const dept of ['video-games','consoles-hardware','gaming-accessories','collectibles','toys-games','toys-games/trading-cards','deals']) {
  router.get(`/${dept}/:sub`,(req,res,next)=>{if(!SLUG.test(req.params.sub))return next();landingBrowse(req,res,subLanding(dept,req.params.sub))})
}
router.get('/consoles-hardware/:sub/:sub2',(req,res,next)=>{if(!SLUG.test(req.params.sub)||!SLUG.test(req.params.sub2))return next();landingBrowse(req,res,subLanding('consoles-hardware',req.params.sub,req.params.sub2))})
router.get('/digital-store/:sub',(req,res,next)=>{if(!SLUG.test(req.params.sub))return next();const l=subLanding('digital-store',req.params.sub);landingBrowse(req,res,{...l,crumbs:[['Digital Store','/digital-store']],filter:()=>false,top:()=>`<p class="gs-landing-note">Digital codes are emailed and redeemed on the platform's store. Downloadable games and currency are not offered online in this local catalog.</p>`})})
for (const path of Object.keys(INFO)) router.get(path,(req,res)=>render(req,res,INFO[path].title,infoPage(res.locals.base,path)))
router.get('/sitemap',(req,res)=>render(req,res,'Site Map',sitemapPage(res.locals.base)))
router.get('/sitemap.xml',(req,res)=>res.type('application/xml').send(sitemapXml(res.locals.base)))
router.get('/credit',(req,res)=>render(req,res,'GameStop Pro Credit Card',creditPage(res.locals.base)))
router.post('/newsletter',(req,res)=>{
  const email=typeof req.body.email==='string'?req.body.email.trim():''
  const ok=/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)
  render(req,res,'Sign Up',P.simplePage({title:ok?"You're on the list!":'Sign Up',html:ok?`<p>Thanks for signing up. This local storefront does not send email; your address was not stored.</p><a class="gs-btn" href="${res.locals.base}/">Continue Shopping</a>`:`<p class="gs-error" role="alert">Enter a valid email address.</p><form method="post" action="${res.locals.base}/newsletter" class="gs-inline-form"><label for="gs-signup-retry">Email address</label><input id="gs-signup-retry" name="email" type="email" autocomplete="email" value="${P.escapeText(email)}" required><button class="gs-btn">Join</button></form>`}),ok?200:400)
})
router.get('/brands/:brand',(req,res)=>{
  const products=ALL.filter(p=>p.brand.toLowerCase()===req.params.brand.toLowerCase())
  if(!products.length) return render(req,res,'Brand not found',P.simplePage({title:'Brand not found',html:`<a href="${res.locals.base}/search">Browse all products</a>`}),404)
  browse(req,res,{name:products[0].brand,description:'Browse games, gear and collectibles from this brand.',products})
})
router.get('/digital-store',(req,res)=>render(req,res,'Digital Store',digitalPage(res.locals.base,LANDINGS['/digital-store'].top(res.locals.base))))
function productHandler(req,res) {
  const p=selectedProduct(byId(req.params.id),req.query.variant)
  if (!p) {
    const reference=capturedRecommendations.find(item=>item.id===req.params.id)
    if (reference) return render(req,res,reference.title,`<section class="gs-reference-product"><img src="${reference.image}" alt="${P.escapeText(reference.title)}"><div><p>PlayStation 5</p><h1>${P.escapeText(reference.title)}</h1><p class="gs-price">$${reference.price.toFixed(2)}</p>${reference.proPrice?`<p class="gs-pro-price">$${reference.proPrice.toFixed(2)} for Pros</p>`:''}<p>Item ${reference.id}</p><a class="gs-btn gs-btn-outline" href="${res.locals.base}/video-games/playstation-5/products/grand-theft-auto-vi---playstation-5-code-in-box/448295.html?added=448295">Back to recommendations</a></div></section>`)
  }
  if(!p) return render(req,res,'Product not found',P.simplePage({title:'Product or option not found',html:`<a href="${res.locals.base}/search">Browse products</a>`}),404)
  const added=req.query.added===p.id?p:null
  rememberSelection(req,p)
  render(req,res,p.title,P.productPage({base:res.locals.base,p,siblings:games(),added,saveActions:productSaveActions(req,res.locals.base,p)}))
}
router.get('/video-games/:category/products/:name/:id.html',productHandler)
router.get('/products/:id',productHandler)
// gamestop.com product URLs: /<department>/<category>[/<sub>]/products/<slug>/<item>.html
router.get(/^\/((?:[a-z0-9-]+\/){1,3})products\/([^/]+)\/(\d{5,9})\.html$/,(req,res,next)=>{
  const p=byId(req.params[2])
  if(!p?.shelf) return next()
  req.params.id=req.params[2]
  productHandler(req,res)
})
// Shelf product pictures (synthetic illustrations rendered locally).
router.get('/shelf-assets/:id/:view.svg',(req,res)=>{
  const p=byId(req.params.id)
  if(!p?.shelf || !/^[0-3]$/.test(req.params.view)) return res.status(404).type('text').send('Product image not found')
  res.set('Cache-Control','public, max-age=3600').set('X-Content-Type-Options','nosniff').type('image/svg+xml').send(shelfAssetSvg(p,Number(req.params.view)))
})

router.get('/trade-in', (req, res) => render(req, res, 'Trade-In', tradePage(res.locals.base)))

// ---- cart ----
function invalidateReview(req) { delete req.store.checkout.review }
function cartFailure(req,res,message) { render(req,res,'Cart',`<p class="gs-error-summary" role="alert">${P.escapeText(message)}</p>`+P.cartPage({base:res.locals.base,t:totals(req.store)})+savedCartSection(req,res.locals.base),400) }
router.post('/cart/add', (req,res)=>{
  const p=selectedProduct(byId(req.body.pid),req.body.variant)
  if(!p) return cartFailure(req,res,'Choose a valid product and option.')
  if(Object.keys(req.body).some(k=>k.startsWith('option')) || (req.body.fulfillment && req.body.fulfillment!=='shipping')) return cartFailure(req,res,'Choose the product options and shipping method shown on the product page.')
  const qty=req.body.qty===undefined?1:Number(req.body.qty)
  const line={line:(req.store.cartSeq || 0)+1,pid:p.id,qty,...(p.variant?{variant:p.variant}: {})}
  const error=cartError([...req.store.cart,line])
  if(error) return cartFailure(req,res,error)
  // Intentional real-site behavior: re-adding creates a separate cart line.
  req.store.cartSeq=line.line;req.store.cart.push(line);invalidateReview(req)
  res.redirect(`${productPath(res.locals.base,p)}?added=${p.id}${p.variant?'&variant='+p.variant:''}`)
})
router.get('/cart',(req,res)=>render(req,res,'Cart',P.cartPage({base:res.locals.base,t:totals(req.store),promoError:req.query.promoError,savedMsg:req.query.saved?'Item saved for later.':null})+savedCartSection(req,res.locals.base)))
router.post('/cart/update',(req,res)=>{
  const line=Number(req.body.line), action=req.body.action || 'update'
  const item=req.store.cart.find(l=>l.line===line)
  if(!item || !['remove','save','update'].includes(action)) return cartFailure(req,res,'That cart line or action is not available.')
  if(action==='save' && !savedCartItem(req,item)) return cartFailure(req,res,'Remove a saved item before saving another.')
  if(action==='remove'||action==='save') req.store.cart=req.store.cart.filter(l=>l.line!==line)
  else {
    const candidate=req.store.cart.map(l=>l.line===line?{...l,qty:Number(req.body.qty)}:l),error=cartError(candidate)
    if(error) return cartFailure(req,res,error)
    req.store.cart=candidate
  }
  invalidateReview(req)
  res.redirect(`${res.locals.base}/cart/${action==='save'?'?saved=1':''}`)
})

router.post('/cart/promo', (req, res) => {
  const code = String(req.body.code ?? '').trim()
  const msg = code ? (totals(req.store).lines.some(l=>l.product.preorder) ? 'Coupons cannot be applied to pre-orders.' : 'This promo code is not valid for the items in your cart.') : 'No coupon code entered'
  res.redirect(`${res.locals.base}/cart/?promoError=${encodeURIComponent(msg)}`)
})

// ---- checkout entry ----
router.post('/checkout/start', (req, res) => {
  if (!req.store.cart.length) return res.redirect(`${res.locals.base}/cart/`)
  res.redirect(`${res.locals.base}/mrt/checkout`)
})
router.post('/checkout/express', (req, res) => {
  if (!req.store.cart.length) return res.redirect(`${res.locals.base}/cart/`)
  req.store.checkout.guest = true
  req.store.checkout.values = { ...(req.store.checkout.values ?? {}), paymentMethod: 'paypal' }
  res.redirect(`${res.locals.base}/mrt/checkout`)
})

// ---- auth ----
function loginHandler(checkout) {
  return (req, res) => {
    const base = res.locals.base
    if (checkout && req.body.action === 'guest') {
      req.store.checkout.guest = true
      return res.redirect(`${base}/checkout/`)
    }
    const acct = authenticate(req.storeSlug, req.body.email, req.body.password)
    if (!acct) return render(req, res, 'Sign In', P.loginPage({ base, checkout, email: req.body.email, error: 'The email or password you entered is incorrect. Please try again.' }), 401)
    if (req.store.user?.id !== acct.id) req.store.checkout = {}
    req.store.user = publicAccount(acct)
    const resumed = resumeSignIn(req,base)
    res.redirect(resumed || (checkout || req.store.cart.length ? `${base}/checkout/` : `${base}/account/`))
  }
}
router.get('/login', (req, res) => render(req, res, 'Sign In', P.loginPage({ base: res.locals.base, checkout: false })))
router.post('/login', loginHandler(false))
router.get('/checkout/login', (req, res) => {
  if (!req.store.cart.length) return res.redirect(`${res.locals.base}/cart/`)
  render(req, res, 'Sign In or Checkout as Guest', P.loginPage({ base: res.locals.base, checkout: true }))
})
router.post('/checkout/login', loginHandler(true))
router.get('/logout', (req, res) => { req.store.user = null; req.store.checkout = {}; delete req.store.gsPendingFavorite; delete req.store.gsAuthReturn; res.redirect(`${res.locals.base}/`) })

router.get('/account/create', (req, res) => render(req, res, 'Create Account', P.createAccountPage({ base: res.locals.base, checkout: !!req.query.checkout })))
router.post('/account/create', (req, res) => {
  const v = req.body, errors = {}
  for (const [k, label] of [['firstName', 'First Name'], ['lastName', 'Last Name'], ['email', 'Email'], ['password', 'Password']]) if (!String(v[k] ?? '').trim()) errors[k] = `${label} is required.`
  if (v.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.email)) errors.email = 'Enter a valid email address.'
  if (v.password && v.password.length < 8) errors.password = 'Password must be at least 8 characters.'
  if (v.password !== v.confirmPassword) errors.confirmPassword = 'Passwords do not match.'
  if (!Object.keys(errors).length) {
    const acct = createAccount(req.storeSlug, { email: v.email, password: v.password, first_name: v.firstName.trim(), last_name: v.lastName.trim(), phone: v.phone ?? '' })
    if (acct.error) errors.email = acct.error
    else { req.store.checkout = {}; req.store.user = publicAccount(acct); retailState(req).preferences = { promotions: v.emails === '1', platform: 'No preference' }; const resumed = resumeSignIn(req,res.locals.base); return res.redirect(resumed || (req.query.checkout && req.store.cart.length ? `${res.locals.base}/checkout/` : `${res.locals.base}/account/`)) }
  }
  render(req, res, 'Create Account', P.createAccountPage({ base: res.locals.base, values: v, errors, checkout: !!req.query.checkout }), 400)
})

function reviewFingerprint(req) {
  const t=totals(req.store)
  return createHash('sha256').update(JSON.stringify({owner:req.store.user?.id||'guest',cart:req.store.cart,products:t.lines.map(l=>({id:l.pid,price:l.product.price,stock:l.product.stock,options:l.product.selectedOptions,fulfillment:l.product.fulfillment,preorder:l.product.preorder}))})).digest('hex')
}
function checkoutRender(req,res,values,errors={},status=200,native=req.store.checkout.native===true) {
  const token=randomBytes(16).toString('hex')
  req.store.checkout.review={token,fingerprint:reviewFingerprint(req)}
  const body=P.checkoutPage({base:res.locals.base,user:req.store.user,t:totals(req.store,values.shippingMethod),values,errors,shippingMethod:values.shippingMethod||'premium',reviewToken:token,addressPicker:addressPicker(req,res.locals.base,values.address_id)})
  render(req,res,'Checkout',native ? `<div class="gs-native-checkout gs-native-continuation"><p class="gs-native-contact-saved">Contact Information: ${P.escapeText(values.email || req.store.user?.email || '')} <a href="${res.locals.base}/mrt/checkout?edit=contact">Change</a></p>${body}</div>` : body,status)
}

function nativeContactRender(req,res,values,errors={},status=200) {
  const token=randomBytes(16).toString('hex')
  req.store.checkout.review={token,fingerprint:reviewFingerprint(req)}
  render(req,res,'Checkout',contactPage({base:res.locals.base,t:totals(req.store,values.shippingMethod),values,errors,reviewToken:token}),status)
}
router.get('/mrt/checkout',(req,res)=>{
  if (!req.store.cart.length) return res.redirect(`${res.locals.base}/cart/`)
  req.store.checkout.guest = !req.store.user
  req.store.checkout.native = true
  const values={...(req.store.checkout.values || {})}
  if(req.store.user) {
    values.email=req.store.user.email
    values.firstName ??= req.store.user.first_name
    values.lastName ??= req.store.user.last_name
    values.phone ??= req.store.user.phone
    if(!values.address1) Object.assign(values,addressValues(req) || {})
  }
  if(req.store.checkout.contactComplete && req.query.edit !== 'contact') return checkoutRender(req,res,values,{},200,true)
  nativeContactRender(req,res,values)
})
router.post('/mrt/checkout/contact',(req,res)=>{
  if (!req.store.cart.length) return res.redirect(`${res.locals.base}/cart/`)
  const values={}, errors={}
  for(const key of ['email','customerName','c_phone']) {
    if(typeof req.body[key] !== 'string') { errors[key]='Enter '+({email:'an email address',customerName:'your full name',c_phone:'a phone number'}[key])+'.'; continue }
    values[key]=req.body[key].trim()
  }
  if(req.store.user) values.email=req.store.user.email
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(values.email || '')) errors.email='Enter a valid email address.'
  if(!values.customerName || values.customerName.length > 160) errors.customerName='Enter your full name.'
  if((values.c_phone || '').replace(/\D/g,'').length !== 10) errors.c_phone='Enter a valid 10-digit phone number.'
  if(Object.keys(errors).length) return nativeContactRender(req,res,values,errors,400)
  const [firstName,...rest]=values.customerName.split(/\s+/)
  req.store.checkout.values={...(req.store.checkout.values || {}),email:values.email,firstName,lastName:rest.join(' '),phone:values.c_phone,customerName:values.customerName}
  req.store.checkout.guest=!req.store.user
  req.store.checkout.contactComplete=true
  req.store.checkout.native=true
  res.redirect(`${res.locals.base}/mrt/checkout`)
})

// ---- validated local shipping/payment continuation and legacy entry aliases ----
router.get('/checkout', (req, res) => {
  const base = res.locals.base
  if (!req.store.cart.length) return res.redirect(`${base}/cart/`)
  if (!req.store.user && !req.store.checkout.guest) return res.redirect(`${base}/checkout/login/?required=false`)
  const values = { ...(req.store.checkout.values ?? {}) }
  if (req.store.user && (req.query.address_id || !values.address1)) {
    const saved = addressValues(req,req.query.address_id)
    if (req.query.address_id && !saved) return checkoutRender(req,res,values,{address:'Saved address not found in this account.'},400)
    if (saved) Object.assign(values,saved)
  }
  if (req.store.user) { values.firstName ??= req.store.user.first_name; values.lastName ??= req.store.user.last_name; values.phone ??= req.store.user.phone }
  checkoutRender(req,res,values)
})

router.post('/checkout', (req, res) => {
  const base = res.locals.base
  if (!req.store.cart.length) return res.redirect(`${base}/cart/`)
  if (!req.store.user && !req.store.checkout.guest) return res.redirect(`${base}/checkout/login/?required=false`)
  const fields = ['email','firstName','lastName','address1','address2','city','stateCode','postalCode','phone','shippingMethod','paymentMethod','fulfillment','giftCardNumber','giftCardPin','cardNumber','expirationMonthYear','securityCode','billingSame','billingFirstName','billingLastName','billingAddress1','billingCity','billingStateCode','billingPostalCode','reviewToken','address_id']
  const v = {}, errors = {}
  for (const key of fields) {
    if (req.body[key] === undefined) continue
    if (typeof req.body[key] !== 'string') { errors.fields = 'Submit one value for each checkout field.'; continue }
    v[key] = req.body[key]
  }
  v.billingSame = v.billingSame === '1'
  if (req.store.user) v.email = req.store.user.email
  const stockError=cartError(req.store.cart)
  if(stockError) errors.cart=stockError
  const review=req.store.checkout.review
  if(!review || review.fingerprint!==reviewFingerprint(req) || (v.reviewToken && v.reviewToken!==review.token)) errors.review='Your cart changed. Review the current items and total before placing your order.'
  const req_ = (k, label) => { if (!String(v[k] ?? '').trim()) errors[k] = `${label} is required.` }
  req_('email', 'Email'); req_('firstName', 'First Name'); req_('lastName', 'Last Name'); req_('address1', 'Address 1'); req_('city', 'City'); req_('stateCode', 'State'); req_('postalCode', 'ZIP Code'); req_('phone', 'Phone Number')
  if (v.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.email)) errors.email = 'Enter a valid email address.'
  if (v.stateCode && !STATES.includes(v.stateCode)) errors.stateCode = 'Select a state.'
  if (v.postalCode && !/^\d{5}(-\d{4})?$/.test(v.postalCode.trim())) errors.postalCode = 'Enter a valid 5-digit ZIP Code.'
  if (v.phone && String(v.phone).replace(/\D/g, '').length !== 10) errors.phone = 'Enter a valid 10-digit phone number.'
  if(v.shippingMethod && !Object.hasOwn(SHIPPING_METHODS,v.shippingMethod)) errors.shippingMethod='Select a valid shipping method.'
  if(v.paymentMethod && !['card','paypal','bnpl'].includes(v.paymentMethod)) errors.paymentMethod='Select a valid payment method.'
  if(['AK','HI'].includes(v.stateCode)) errors.stateCode='Shipping is available to the continental U.S. only.'
  if(v.fulfillment && v.fulfillment!=='shipping') errors.fulfillment='Only Ship to Home is available for this cart.'
  if(v.giftCardNumber || v.giftCardPin) errors.giftCardNumber='Gift-card redemption is not available for this order. Choose a supported payment method.'
  const shippingMethod = Object.hasOwn(SHIPPING_METHODS,v.shippingMethod) ? v.shippingMethod : 'premium'
  const paymentMethod = ['card', 'paypal', 'bnpl'].includes(v.paymentMethod) ? v.paymentMethod : 'card'
  let payment
  if (paymentMethod === 'card') {
    const card = validateCard({ number: v.cardNumber, expiry: v.expirationMonthYear, cvv: v.securityCode })
    if (!card.ok) { if (card.errors.number) errors.cardNumber = card.errors.number; if (card.errors.expiry) errors.expirationMonthYear = card.errors.expiry; if (card.errors.cvv) errors.securityCode = card.errors.cvv }
    else payment = { method: 'card', brand: card.brand, last4: card.last4, expiration: String(v.expirationMonthYear).trim() }
  } else payment = { method: paymentMethod === 'bnpl' ? 'zip' : 'paypal' }
  const billing = v.billingSame
    ? { first_name: v.firstName, last_name: v.lastName, line1: v.address1, line2: v.address2 || null, city: v.city, state: v.stateCode, postal_code: v.postalCode, country: 'US' }
    : { first_name: v.billingFirstName, last_name: v.billingLastName, line1: v.billingAddress1, line2: null, city: v.billingCity, state: v.billingStateCode, postal_code: v.billingPostalCode, country: 'US' }
  if (!v.billingSame) for (const [k, label] of [['billingFirstName', 'Billing First Name'], ['billingLastName', 'Billing Last Name'], ['billingAddress1', 'Billing Address 1'], ['billingCity', 'Billing City'], ['billingStateCode', 'Billing State'], ['billingPostalCode', 'Billing ZIP Code']]) if (!String(v[k] ?? '').trim()) errors[k] = `${label} is required.`

  if(!v.billingSame && v.billingStateCode && !STATES.includes(v.billingStateCode)) errors.billingStateCode='Select a valid billing state.'
  if(!v.billingSame && v.billingPostalCode && !/^\d{5}(-\d{4})?$/.test(v.billingPostalCode.trim())) errors.billingPostalCode='Enter a valid billing ZIP Code.'
  req.store.checkout.values = { ...v, cardNumber: '', securityCode: '', giftCardNumber:'',giftCardPin:'',reviewToken:'' }
  if (Object.keys(errors).length) {
    return checkoutRender(req,res,req.store.checkout.values,errors,400)
  }

  const paymentError=scenarioPayment(req.store,payment,req.store.cart)
  if(paymentError) return checkoutRender(req,res,req.store.checkout.values,{payment:paymentError},402)

  const t = totals(req.store, shippingMethod)
  const token = randomBytes(12).toString('hex')
  const order = recordOrder({
    store: req.storeSlug,
    order_number: orderNumber(),
    session: req.session,
    items: t.lines.map(l => l.product.kind === 'game'
      ? { platform: l.product.platform, edition: l.product.edition, format: l.product.format, qty: l.qty, unit_price: l.product.price, title: l.product.title, sku: l.product.id }
      : { kind: 'other', title: l.product.title, qty: l.qty, unit_price: l.product.price, sku: l.product.id }),
    customer: { email: String(v.email).trim().toLowerCase(), first_name: v.firstName.trim(), last_name: v.lastName.trim(), phone: v.phone, account_id: req.store.user?.id ?? null, guest: !req.store.user },
    fulfillment: { method: 'ship', option: shippingMethod, eta: t.lines.every(l=>l.product.preorder) ? SHIPPING_METHODS[shippingMethod].eta : 'Ships after order processing'+(t.lines.some(l=>l.product.preorder)?'; preorders follow their release date':'') },
    shipping_address: { first_name: v.firstName.trim(), last_name: v.lastName.trim(), line1: v.address1.trim(), line2: v.address2?.trim() || null, city: v.city.trim(), state: v.stateCode, postal_code: v.postalCode.trim(), country: 'US', phone: v.phone },
    billing_address: billing,
    payment,
    totals: { subtotal: t.subtotal, shipping: t.shipping, tax: t.tax, total: t.total },
    currency: 'USD',
    meta: { token, account_id:req.store.user?.id??null, gift_card_entered:false, items:t.lines.map(l=>({sku:l.pid,variant:l.product.variant||null,options:l.product.selectedOptions||{},qty:l.qty,eta:shippingEta(l.product,shippingMethod)})) },
  })
  req.store.cart = []
  req.store.checkout = {}
  res.redirect(`${base}/order/confirmation/?ID=${order.order_number}&token=${token}`)
})

router.get('/order/confirmation', (req, res) => {
  const order = privateOrder(req,String(req.query.ID ?? ''))
  if (!order || order.meta.token !== req.query.token) return render(req, res, 'Order Confirmation', P.simplePage({ title: 'Order not found', html: `<p>We couldn't find that order.</p><a href="${res.locals.base}/">Return Home</a>` }), 404)
  render(req, res, 'Order Confirmation', P.confirmationPage({ base: res.locals.base, order }))
})

router.get('/pro', (req, res) => render(req, res, 'GameStop Pro', proPage(res.locals.base)))

router.use((req, res) => render(req, res, 'Page Not Found', P.simplePage({ title: "Sorry, we can't find that page.", html: `<p>The page you're looking for may have moved or is no longer available.</p><a class="gs-btn" href="${res.locals.base}/">Continue Shopping</a>` }), 404))

export default {
  slug: 'gamestop',
  name: NAME,
  country: 'US',
  currency: 'USD',
  catalog_observations: capturedRecommendations.map(item => ({ id: item.id, title: item.title, kind: 'other', price: item.price, source_url: item.sourceUrl, captured_at: '2026-10-06', evidence_path: 'stores/gamestop/recommendation-reference.js', observation: 'recommendation-card', availability: 'unknown', purchase: 'unverified', purchasable: false, local_path: item.path })),
  description: 'US. Code-in-box PS5/Xbox, guest checkout, single-page checkout, Pro upsells.',
  router,
}
