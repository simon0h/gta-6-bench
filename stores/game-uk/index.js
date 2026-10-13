import { installJourneys, switchUser, saveChoice, deliveryAddress, addressPicker, rememberProduct } from './journeys.js'
import { DEPARTMENTS, CAMPAIGNS, categorySlug } from './catalog.js'
import { Router } from 'express'
import { randomBytes, randomInt } from 'node:crypto'
import { recordOrder, getOrder } from '../../lib/orders.js'
import { validateCard } from '../../lib/payment.js'
import { enterScenarioCart, scenarioProduct, scenarioPayment, scenarioAvailability, scenarioPickupEnabled } from '../../lib/benchmark-scenarios.js'
import { authenticate, createAccount, findAccount, publicAccount } from '../../lib/accounts.js'
import { PRODUCTS, quantityLimit, byId, bySlug, selectedProduct, cartProblem, eligibleMethods, search, sortProducts, SORTS, totals, hasPreorder, productPath, DELIVERY_METHODS, COLLECT_STORES, collectionStoreId, TITLES, MAX_QTY } from './data.js'
import * as P from './pages.js'
import { allLandings } from './site-data.js'
import { installSite } from './site.js'

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
const clampQty = (n) => Number.isInteger(Number(n)) && Number(n)>0 && Number(n)<=MAX_QTY ? Number(n) : 1
const validQty = n => typeof n==='string' && /^[1-9]\d*$/.test(n) && Number(n)<=MAX_QTY
const invalidate = req => { if(req.store.checkout.review) req.store.checkout.review.invalidated=true; delete req.store.checkout.payment }
const fingerprint = req => JSON.stringify({lines:totals(req.store).lines.map(l=>({id:l.pid,option:l.option||'',qty:l.qty,price:l.product.price,stock:l.product.stock,collect:l.product.collect,digital:l.product.digital})),delivery:req.store.checkout.delivery,user:req.store.user?.id||null,email:checkoutEmail(req)})
function review(req) { const r={token:randomBytes(18).toString('hex'),fingerprint:fingerprint(req)}; req.store.checkout.review=r; return r }
const safeValues = body => ({...Object.fromEntries(Object.entries(body).filter(([k,v])=>typeof v==='string'&&!['cardNumber','cvv','password'].includes(k))),billingSame:body.billingSame==='1'})

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
const UK_POSTCODE_RE = /^(?:GIR\s?0AA|[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2})$/i
const checkoutEmail = (req) => req.store.user?.email ?? req.store.checkout.email ?? ''
// Only ever redirect inside this store (returnUrl comes from the query string / form).
function safeReturn(base, u) {
  const value=typeof u==='string'?u:''
  if(!value.startsWith('/')||value.startsWith('//')||value.includes('\\'))return `${base}/account`
  try {
    const url=new URL(value===base||value.startsWith(base+'/')?value:base+value,'https://local.invalid')
    return url.origin==='https://local.invalid'&&(url.pathname===base||url.pathname.startsWith(base+'/'))?url.pathname+url.search:`${base}/account`
  } catch { return `${base}/account` }
}
const notFound = (req, res) => render(req, res, { title: 'Sorry – This Page Could Not Be Found | GAME', status: 404, body: P.notFoundPage({ base: res.locals.base }) })

router.use((req,res,next)=>{
  if(req.method==='POST' && Object.values(req.body||{}).some(v=>typeof v!=='string')) return render(req,res,{title:'Check your details | GAME',status:400,body:P.simplePage({title:'Check your details',html:'<p>Please submit each field once. Use the form to try again.</p>'})})
  next()
})

installJourneys(router, { render, invalidate, safeReturn })
installSite(router, { render })

// ---- browse ----
router.get('/information', (req,res) => render(req,res,{ title: 'Shopping information', body: P.supportInformationPage(res.locals.base, typeof req.query.topic === 'string' ? req.query.topic : 'Shopping information') }))
router.get('/', (req, res) => render(req, res, { title: 'GAME | Gaming Specialist For Consoles, Games & Accessories!', body: P.homePage({ base: res.locals.base, products: PRODUCTS }) }))

// The working search URL on game.co.uk is /searchresults?descriptionfilter=...; /search?q= is a 404 there too (it falls through to the product route below).
function listing(req,res,{route='/searchresults',heading='Search Results',intro='',scope={},department=null,match=null}={}) {
  const q=typeof req.query.descriptionfilter==='string'?req.query.descriptionfilter:''
  const filters=Object.fromEntries(['platform','category','price','style','brand','age','availability'].map(k=>[k,typeof req.query[k]==='string'?req.query[k]:null]))
  const sort=SORTS.some(s=>s.key===req.query.sort)?req.query.sort:'popular'
  const page=/^[1-9]\d*$/.test(String(req.query.page))?Number(req.query.page):1
  const landing=route==='/searchresults'?null:LANDING_MAP.get(route)||null
  const pick=list=>match?list.filter(match):list
  const title=landing?.title||(landing?.h1||heading)+' | GAME'
  render(req,res,{title,q,body:P.searchPage({base:res.locals.base,q,products:sortProducts(pick(search(q,{...filters,...scope})),sort),facetProducts:pick(search(q,scope)),filters,sort,page,hideFilters:req.query.hidefilters==='1',route,heading,intro,department,landing})})
}
router.get('/searchresults',(req,res)=>listing(req,res))
const LANDING_MAP=allLandings()
const registered=new Set()
for(const dept of DEPARTMENTS) {
  router.get('/'+dept.id,(req,res)=>listing(req,res,{route:'/'+dept.id,heading:dept.title,intro:dept.intro,scope:{department:dept.id},department:dept}))
  for(const category of dept.categories) router.get('/'+dept.id+'/'+categorySlug(category),(req,res)=>listing(req,res,{route:'/'+dept.id+'/'+categorySlug(category),heading:category,intro:dept.intro,scope:{department:dept.id,category},department:dept}))
}
for(const campaign of CAMPAIGNS) router.get('/campaign/'+campaign.id,(req,res)=>listing(req,res,{route:'/campaign/'+campaign.id,heading:campaign.title,intro:campaign.intro,scope:{campaign:campaign.id}}))
for(const brand of new Set(PRODUCTS.map(p=>p.brand))) router.get('/brands/'+categorySlug(brand),(req,res)=>listing(req,res,{route:'/brands/'+categorySlug(brand),heading:brand,intro:'Explore games, accessories and more from '+brand+'.',scope:{brand}}))
for(const dept of DEPARTMENTS){registered.add('/'+dept.id);for(const c of dept.categories)registered.add('/'+dept.id+'/'+categorySlug(c))}
// Landing pages from the real site's menus and /sitemap directory (see site-data.js).
for(const [path,l] of LANDING_MAP) if(!registered.has(path)) router.get(path,(req,res)=>listing(req,res,{route:path,heading:l.h1,intro:l.intro||'',match:l.match}))

// OneTrust-style cookie banner: "Manage cookies" / "Reject all" / "Allow all" (shown until a choice is made).
router.post('/cookies', (req, res) => {
  const base = res.locals.base
  req.store.cookieChoice = ['allow', 'reject', 'manage'].includes(req.body.choice) ? req.body.choice : 'reject'
  const back = String(req.body.back ?? '')
  res.redirect(safeReturn(base,back))
})

// ---- bag ----
router.get('/cart', (req, res) => {
  enterScenarioCart(req.store)
  render(req, res, { title: 'GAME > Cart', body: P.cartPage({ base: res.locals.base, t: totals(req.store), notice: req.query.notice ? String(req.query.notice) : null }) })
})

router.post('/cart/add', (req, res) => {
  const base = res.locals.base
  const p = scenarioProduct(req.store,byId(req.body.pid))
  if (!p) return res.redirect(`${base}/`)
  const qty=Number(req.body.qty), option=req.body.option||''
  const selected=selectedProduct(p,option)
  const productError=message=>render(req,res,{title:p.title+' | GAME',status:400,body:P.productPage({base,p,qty:clampQty(req.body.qty),option,error:message})})
  if(!validQty(req.body.qty)) return productError('Enter a whole quantity between 1 and '+MAX_QTY+'.')
  if(!selected) return productError('Choose a valid '+(p.optionLabel||'product option')+'.')
  const existing=req.store.cart.find(l=>l.pid===p.id&&(l.option||'')===option)
  const total=req.store.cart.filter(l=>l.pid===p.id).reduce((n,l)=>n+l.qty,0)
  if(qty+(existing?.qty||0)>quantityLimit(selected) || total+qty>quantityLimit(p)) return productError('The requested quantity exceeds the purchase limit.')
  if(p.pegi>=18 && req.body.age_confirmed!=='1') return res.redirect(`${productPath(base,p)}?agecheck=1&qty=${qty}${option?`&option=${encodeURIComponent(option)}`:''}`)
  if(existing) existing.qty+=qty
  else {req.store.cartSeq=(req.store.cartSeq||0)+1;req.store.cart.push({line:req.store.cartSeq,pid:p.id,qty,...(option?{option}:{})})}
  invalidate(req)
  res.redirect(`${productPath(base, p)}?added=1${option?`&option=${encodeURIComponent(option)}`:''}`)
})

router.post('/cart/update', (req, res) => {
  const base = res.locals.base
  const line = Number(req.body.line)
  const action = String(req.body.action ?? '')
  const item = req.store.cart.find(l => l.line === line)
  let notice = ''
  if (item) {
    if (action === 'inc') { const p=selectedProduct(byId(item.pid),item.option); const aggregate=req.store.cart.filter(l=>l.pid===item.pid).reduce((n,l)=>n+l.qty,0); if(p&&item.qty<Math.min(MAX_QTY,quantityLimit(p))&&aggregate<quantityLimit(byId(item.pid))) item.qty+=1; else notice='The requested quantity exceeds the purchase limit.' }
    else if (action === 'dec') item.qty = Math.max(1, item.qty - 1)
    else if (action === 'remove' || action === 'wishlist') {
      req.store.cart = req.store.cart.filter(l => l.line !== line)
      if (action === 'wishlist') { saveChoice(req,item.pid,item.option||'',item.qty,true); notice = 'Moved to your wish list.' }
    }
  }
  if(item) invalidate(req)
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
    if(req.store.user||req.store.checkout.email!==email) req.store.checkout={}
    switchUser(req,null)
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
      if (acct.error) { req.store.checkout.authEmail=email; return res.redirect(`${base}/account/login?step=password&returnUrl=${encodeURIComponent(returnUrl)}`) }
      switchUser(req,publicAccount(acct),dest===`${base}/wishlist`)
      req.store.checkout.guest = false
      req.store.checkout.email = acct.email
      return res.redirect(dest)
    }
    return render(req, res, { title: 'Register | GAME', mode: 'auth', status: 400, body: P.authRegisterPage({ base, returnUrl, email, values: { ...v, password: '' }, errors }) })
  }
  // action === 'signin'
  const acct = authenticate(req.storeSlug, email, req.body.password)
  if (!acct) return render(req, res, { title: 'Sign in | GAME', mode: 'auth', status: 401, body: P.authPasswordPage({ base, returnUrl, email, error: 'The password you entered is incorrect. Please try again.' }) })
  switchUser(req,publicAccount(acct),dest===`${base}/wishlist`)
  req.store.checkout.guest = false
  req.store.checkout.email = acct.email
  res.redirect(dest)
})

router.get('/logout', (req, res) => { req.store.user = null; req.store.checkout = {}; res.redirect(`${res.locals.base}/`) })

// ---- checkout: Delivery -> Payment -> Thank you (no separate review step) ----
// ASSUMPTION: the real checkout lives at a single /checkout URL; the delivery and payment steps
// were not reached in research, so they are modelled as /checkout/delivery and /checkout/payment.
function checkoutGuard(req, res) {
  const base = res.locals.base
  enterScenarioCart(req.store)
  if (!req.store.cart.length) { res.redirect(`${base}/cart`); return false }
  const problem=cartProblem(req.store)
  if(problem){render(req,res,{title:'Check your bag | GAME',status:409,body:P.cartPage({base,t:totals(req.store),notice:problem})});return false}
  if (!req.store.user && !req.store.checkout.guest) { res.redirect(`${base}/account/login?returnUrl=%2Fcheckout`); return false }
  return true
}
router.post('/checkout/start', (req, res) => { if (checkoutGuard(req, res)) res.redirect(`${res.locals.base}/checkout/delivery`) })
router.get('/checkout', (req, res) => { if (checkoutGuard(req, res)) res.redirect(`${res.locals.base}/checkout/delivery`) })

router.get('/checkout/delivery', (req, res) => {
  if (!checkoutGuard(req, res)) return
  const saved=deliveryAddress(req)
  if(saved===null) return notFound(req,res)
  const values = { ...(req.store.checkout.delivery ?? {}), ...saved }
  if (req.store.user) { values.firstName ??= req.store.user.first_name; values.lastName ??= req.store.user.last_name; values.mobile ??= req.store.user.phone }
  render(req, res, { title: 'Checkout - Delivery | GAME', mode: 'checkout', body: addressPicker(req,res.locals.base)+P.deliveryPage({ base: res.locals.base, t: totals(req.store), email: checkoutEmail(req), guest: !req.store.user, preorderInBag: hasPreorder(req.store), values }) })
})

router.post('/checkout/delivery', (req, res) => {
  if (!checkoutGuard(req, res)) return
  const base = res.locals.base
  const v = req.body, errors = {}
  const str = (k) => String(v[k] ?? '').trim()
  for (const [k, msg] of [['firstName', 'Enter your first name.'], ['lastName', 'Enter your last name.'], ['addressLine1', 'Enter the first line of your address.'], ['town', 'Enter your town or city.'], ['postcode', 'Enter your postcode.'], ['mobile', 'Enter your mobile number.']]) if (!str(k)) errors[k] = msg
  if (str('postcode') && !UK_POSTCODE_RE.test(str('postcode'))) errors.postcode = 'Enter a valid UK postcode.'
  if (str('mobile') && !/^\d{10,13}$/.test(str('mobile').replace(/\D/g, ''))) errors.mobile = 'Enter a valid mobile number.'
  if (str('title') && !TITLES.includes(str('title'))) errors.title = 'Select a title.'
  const preorder = hasPreorder(req.store)
  const method = Object.hasOwn(DELIVERY_METHODS,v.deliveryMethod) ? String(v.deliveryMethod) : null
  if (!method) errors.deliveryMethod = 'Select a delivery method.'
  else if(!eligibleMethods(req.store).includes(method)) errors.deliveryMethod=preorder&&method==='collect'?'Click & Collect is not available for pre-order items. Please choose a home delivery option.':'That delivery method is not available for the items in your bag.'
  else if (method === 'collect') {
    if (preorder && !scenarioPickupEnabled(req.store)) errors.deliveryMethod = 'Click & Collect is not available for pre-order items. Please choose a home delivery option.'
    else if (!COLLECT_STORES.includes(str('collectStore'))) errors.collectStore = 'Select a store to collect from.'
    else if (req.store.cart.some(l=>scenarioAvailability(req.store,l.pid,'pickup',collectionStoreId(str('collectStore'))||'unavailable')===false)) errors.collectStore = 'Collection is unavailable at that store. Choose the available collection store.'
    if (scenarioPickupEnabled(req.store)) {
      for (const [k,msg] of [['pickupFirstName','Enter the pickup first name.'],['pickupLastName','Enter the pickup last name.'],['pickupEmail','Enter the pickup email.'],['pickupPhone','Enter the pickup phone number.']]) if(!str(k)) errors[k]=msg
      if(str('pickupEmail')&&!EMAIL_RE.test(str('pickupEmail'))) errors.pickupEmail='Enter a valid pickup email address.'
      if(str('pickupPhone')&&!/^\d{10,13}$/.test(str('pickupPhone').replace(/\D/g,''))) errors.pickupPhone='Enter a valid pickup phone number.'
    }
  }
  const values = {
    title: str('title'), firstName: str('firstName'), lastName: str('lastName'), addressLine1: str('addressLine1'), addressLine2: str('addressLine2'),
    town: str('town'), county: str('county'), postcode: str('postcode').toUpperCase().replace(/\s+/g, ' '), country: 'GB', mobile: str('mobile'),
    deliveryMethod: method ?? 'standard', collectStore: method === 'collect' ? str('collectStore') : '',
    ...(method==='collect'&&scenarioPickupEnabled(req.store)?{pickupFirstName:str('pickupFirstName'),pickupLastName:str('pickupLastName'),pickupEmail:str('pickupEmail'),pickupPhone:str('pickupPhone')}:{}),
  }
  if (Object.keys(errors).length) {
    return render(req, res, { title: 'Checkout - Delivery | GAME', mode: 'checkout', status: 400, body: P.deliveryPage({ base, t: totals(req.store), email: checkoutEmail(req), guest: !req.store.user, preorderInBag: preorder, values: { ...values, postcode: str('postcode') }, errors }) })
  }
  if(v.country&&v.country!=='GB') return render(req,res,{title:'Checkout - Delivery | GAME',mode:'checkout',status:400,body:P.deliveryPage({base,t:totals(req.store),email:checkoutEmail(req),guest:!req.store.user,preorderInBag:preorder,values,errors:{country:'Delivery is available within the United Kingdom only.'}})})
  invalidate(req)
  req.store.checkout.delivery = values
  // Keep the invalidated review until its replacement is actually rendered.
  // Another tab may submit the old payment form before following this redirect.
  res.redirect(`${base}/checkout/payment`)
})

router.get('/checkout/payment', (req, res) => {
  if (!checkoutGuard(req, res)) return
  const d = req.store.checkout.delivery
  if (!d) return res.redirect(`${res.locals.base}/checkout/delivery`)
  if(!eligibleMethods(req.store).includes(d.deliveryMethod)) return res.redirect(`${res.locals.base}/checkout/delivery`)
  const checked=review(req)
  render(req, res, { title: 'Checkout - Payment | GAME', mode: 'checkout', body: P.paymentPage({ base: res.locals.base, t: totals(req.store, d.deliveryMethod), delivery: d, preorderInBag: hasPreorder(req.store), values: req.store.checkout.payment ?? {},reviewToken:checked.token }) })
})

router.post('/checkout/payment', (req, res) => {
  if (!checkoutGuard(req, res)) return
  const base = res.locals.base
  const d = req.store.checkout.delivery
  if (!d) return res.redirect(`${base}/checkout/delivery`)
  const prior=req.store.checkout.review
  if((req.body.review_token && req.body.review_token!==prior?.token) || (prior && (prior.invalidated || prior.fingerprint!==fingerprint(req)))) {
    const fresh=review(req)
    return render(req,res,{title:'Review your order | GAME',mode:'checkout',status:409,body:P.paymentPage({base,t:totals(req.store,d.deliveryMethod),delivery:d,preorderInBag:hasPreorder(req.store),values:safeValues(req.body),reviewToken:fresh.token,errors:{review:'Your bag or checkout details changed. Check the updated order and enter payment details again.'}})})
  }
  if(!eligibleMethods(req.store).includes(d.deliveryMethod) || (d.deliveryMethod==='collect'&&(!COLLECT_STORES.includes(d.collectStore)||req.store.cart.some(l=>scenarioAvailability(req.store,l.pid,'pickup',collectionStoreId(d.collectStore)||'unavailable')===false)))) return render(req,res,{title:'Check delivery | GAME',mode:'checkout',status:409,body:P.deliveryPage({base,t:totals(req.store),email:checkoutEmail(req),guest:!req.store.user,preorderInBag:hasPreorder(req.store),values:d,errors:{deliveryMethod:'Please choose an available delivery method for your current bag.'}})})
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
    if(str('billingPostcode')&&!UK_POSTCODE_RE.test(str('billingPostcode'))) errors.billingPostcode='Enter a valid UK billing postcode.'
    billing = { first_name: str('billingFirstName'), last_name: str('billingLastName'), line1: str('billingAddressLine1'), line2: null, city: str('billingTown'), state: '', postal_code: str('billingPostcode').toUpperCase(), country: 'GB' }
  }
  if (str('giftCard')) errors.giftCard = 'We could not find a Gift Card, eVoucher or Credit Note with that code.'
  if (str('promoCode')) errors.promoCode = 'This promo code is not valid or cannot be used with the items in your bag.'

  const kept = { ...v, cardNumber: '', cvv: '' } // never echo the card number or CVV back
  req.store.checkout.payment = { paymentMethod: pm ?? 'card', billingSame: v.billingSame, nameOnCard: str('nameOnCard') }
  if (Object.keys(errors).length) {
    return render(req, res, { title: 'Checkout - Payment | GAME', mode: 'checkout', status: 400, body: P.paymentPage({ base, t: totals(req.store, d.deliveryMethod), delivery: d, preorderInBag: preorder, values: kept, errors,reviewToken:prior?.token||'' }) })
  }
  const paymentError=scenarioPayment(req.store,payment)
  if(paymentError) return render(req,res,{title:'Checkout - Payment | GAME',mode:'checkout',status:402,body:P.paymentPage({base,t:totals(req.store,d.deliveryMethod),delivery:d,preorderInBag:preorder,values:kept,errors:{payment:paymentError},reviewToken:prior?.token||''})})

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
      : { method: m.method, option: d.deliveryMethod, eta: m.eta },
    shipping_address: m.method==='pickup'&&scenarioPickupEnabled(req.store)?null:{ title: d.title || null, first_name: d.firstName, last_name: d.lastName, line1: d.addressLine1, line2: d.addressLine2 || null, city: d.town, state: d.county || '', postal_code: d.postcode, country: 'GB', phone: d.mobile },
    billing_address: billing,
    payment,
    totals: { subtotal: t.subtotal, shipping: t.delivery, tax: 0, discount: 0, total: t.total }, // UK prices include VAT: no separate tax line
    currency: 'GBP',
    meta: { token, account_id:req.store.user?.id||null, options:t.lines.map(l=>({sku:l.pid,option:l.option||null,label:l.product.optionLabel||null,value:l.product.swatch,quantity:l.qty})), vat_included: true, preorder, charge_timing: 'authorised at order, debited at dispatch (day before launch for pre-orders)',
      items_fulfillment:t.lines.map(l=>({sku:l.product.id,fulfillment:m.method==='pickup'?'pickup':'shipping',qty:l.qty})),
      pickup_store_id:m.method==='pickup'?collectionStoreId(d.collectStore):null,
      pickup_person:m.method==='pickup'&&d.pickupFirstName?{first_name:d.pickupFirstName,last_name:d.pickupLastName,email:d.pickupEmail,phone:d.pickupPhone}:null,
      ...(m.method==='pickup'&&scenarioPickupEnabled(req.store)?{benchmark_pickup_simulation:true}:{}),
    },
  })
  req.store.cart = []
  req.store.checkout = {}
  res.redirect(`${base}/checkout/complete?orderNumber=${order.order_number}&token=${token}`)
})

router.get('/checkout/complete', (req, res) => {
  const order = getOrder(String(req.query.orderNumber ?? ''))
  if (!order || order.store !== req.storeSlug || order.session_id !== req.session.id || (order.customer.account_id??null)!==(req.store.user?.id??null) || order.meta.token !== req.query.token) return render(req, res, { title: 'Order not found | GAME', status: 404, body: P.simplePage({ title: 'Order not found', html: `<p>We couldn't find that order.</p><p><a class="gu-btn gu-btn-black" href="${res.locals.base}/">HOME</a></p>` }) })
  render(req, res, { title: 'Thank you for your order | GAME', body: P.completePage({ base: res.locals.base, order }) })
})

// ---- product pages: /{brand}-{name}-{6-digit code}  (anything else is the site's 404 page, including /search?q=) ----
router.get('/:slug', (req, res) => {
  const base = res.locals.base
  const p = scenarioProduct(req.store,bySlug(req.params.slug))
  if (!p) return notFound(req, res)
  rememberProduct(req,p.id)
  if (req.params.slug !== p.slug) { const i = req.url.indexOf('?'); return res.redirect(`${productPath(base, p)}${i >= 0 ? req.url.slice(i) : ''}`) }
  const modal = req.query.preorder && p.preorder ? 'preorder' : req.query.agecheck && p.pegi >=18 ? 'age' : null
  const title = p.kind === 'game' ? 'Grand Theft Auto VI | Rockstar Games | GAME' : `${p.title} | ${p.brand} | GAME`
  render(req, res, { title, body: P.productPage({ base, p, modal, qty: clampQty(req.query.qty), wished: !!req.query.wished,error:req.query.choose?'Choose an option, then add it to your wish list.':'',option:typeof req.query.option==='string'?req.query.option:'' }), flyoutOpen: !!req.query.added, closeHref: productPath(base, p) })
})

export default {
  slug: 'game-uk',
  name: NAME,
  country: 'UK',
  currency: 'GBP',
  description: 'UK. Code-in-box PS5/Xbox at £69.99, two-modal add-to-bag (pre-order notice + PEGI-18 age gate), email-first sign in with guest option, Delivery → Payment, card authorised at order and charged at dispatch.',
  router,
}
