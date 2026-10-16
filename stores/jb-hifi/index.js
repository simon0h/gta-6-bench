import { enterScenarioCart, scenarioPayment, scenarioAvailability, registerScenarioAdapter } from '../../lib/benchmark-scenarios.js'
import { fixtureCatalog } from '../../lib/catalog-policy.js'
import { catalogObservations, recommendationBySlug, recommendationById, recommendationPreview } from './reference-recommendations.js'
import { DEPARTMENT_DEFS, CAMPAIGNS, FILTER_KEYS, slugify, selectedProduct, stockLimit, lineKey } from './catalog.js'
import { brandsHub } from './browsing.js'
import { Router } from 'express'
import { randomBytes, randomInt, createHash } from 'node:crypto'
import { recordOrder } from '../../lib/orders.js'
import { validateCard } from '../../lib/payment.js'
import { retailState, defaultAddress, saveAddress } from '../../lib/retail-state.js'
import { installJourneys, safeReturn, customerOrder, rememberSelection, savedItems, savedAddressPicker, checkoutAddressValues } from './journeys.js'
import { PRODUCTS, LISTED, byId, bySlug, games, search, totals, productPath, findStores, storeById, postcodeState, stateName, STATES, SHIPPING_METHODS, COURIER_METHOD, COLLECTION_METHOD, findCollectionPoints, collectionPointById } from './data.js'
import * as P from './pages.js'
import { installSite, departmentStrip } from './site.js'
import { installShelfArt } from './shelf-art.js'

const NAME = 'JB Hi-Fi'
const MAX_QTY = 5 // the cart quantity dropdown offers 1–5 (JB limits copies per order)
const router = Router()
router.use((req, res, next) => {
  enterScenarioCart(req.store)
  const items = [...(req.store.cart || []), ...(req.store.buyNow ? [req.store.buyNow] : []), ...(req.store.gmarketPurchase?.items || [])]
  if ((/checkout/.test(req.path) || req.method === 'GET' && /cart/.test(req.path)) && items.some(item => scenarioAvailability(req.store, item.sku ?? item.pid, 'shipping') === false)) {
    const body = '<h1>Item unavailable</h1><p role="alert">Shipping unavailable. Availability changed after this item was selected. No order was placed.</p>'
    render(req, res, { title: 'Item unavailable', body, status: 409 })
    return
  }
  next()
})


// ---- helpers ----
const str = (v) => (typeof v === 'string' ? v.trim() : '')
const round = (n) => Math.round(n * 100) / 100
const pick = (obj, keys) => Object.fromEntries(keys.filter(k => typeof obj[k] === 'string').map(k => [k, obj[k]]))
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

function render(req, res, { title, body, status = 200, checkout = null }) {
  // ?added=<sku> opens the full-screen "Item added to your cart!" modal (where POST /cart/add lands, no JS needed).
  const added = !checkout && req.query.added && req.store.cart.some(l => l.pid === String(req.query.added)) ? selectedProduct(byId(req.query.added), str(req.query.variant)) || byId(req.query.added) : null
  const here = new URL(req.originalUrl, 'http://jb.local')
  here.searchParams.delete('added')
  res.status(status).type('html').send(P.layout({ base: res.locals.base, title, body, cartCount: totals(req.store).count, user: req.store.user, added, closeHref: here.pathname + here.search, checkout }))
}

function notFound(req, res) {
  render(req, res, { title: 'Page not found | JB Hi-Fi', status: 404, body: P.simplePage({ title: 'Sorry, we couldn’t find that page', html: `<p>The page you're looking for may have moved or no longer exists. Try searching for what you need, or browse one of our popular departments.</p><form class="jb-help-search" method="get" action="${res.locals.base}/search" role="search"><label for="nf-search">Search JB Hi-Fi</label><div><input id="nf-search" name="query" type="search" placeholder="Search products, brands, and more…"><button class="jb-btn jb-btn-black" type="submit">Search</button></div></form><h2>Popular departments</h2><div class="jb-brand-links">${[['TVs','/collections/tvs'],['Laptops','/collections/laptops'],['Headphones','/collections/headphones'],['Mobile Phones','/collections/mobile-phones'],['Gaming','/collections/gaming'],['Home Appliances','/collections/home-appliances'],['Red Hot Deals','/collections/deals']].map(([l,u])=>`<a href="${res.locals.base}${u}">${l}</a>`).join('')}</div><p><a class="jb-btn" href="${res.locals.base}/">Continue shopping</a> &nbsp; <a href="${res.locals.base}/pages/help-and-support">Help &amp; Support</a></p>` }) })
}

// Only ever send the shopper back to a page inside this store.
installJourneys(router, {render,notFound,cartIssue,changedCart})

// ASSUMPTION: the thank-you page was not observed. Shopify shows "Order #<digits>"; JB numbers are 8 digits here.
const orderNumber = () => String(randomInt(10_000_000, 100_000_000))

// ---- browse ----
// ASSUMPTION: the home page was not part of the research. It is laid out like jbhifi.com.au's homepage:
// rotating banners, category tiles and product carousels across departments (see site.js siteHome).
router.get('/information', (req,res) => render(req,res,{ title: 'Shopping information', body: P.supportInformationPage(res.locals.base, typeof req.query.topic === 'string' ? req.query.topic : 'Shopping information') }))
router.get('/', (req, res) => render(req, res, { title: 'JB Hi-Fi | Always Cheap Prices', body: P.homePage({ base: res.locals.base, products: PRODUCTS }) }))

// Real URL: /search?query=grand+theft+auto+vi (also accept ?q= in case an agent guesses it).
function listing(req,res,{heading='',intro='',scope={},extra=''}={}) {
  const q=str(req.query.query)||str(req.query.q)
  const filters={...Object.fromEntries(FILTER_KEYS.map(k=>[k,str(req.query[k])])),...scope}
  const route=res.locals.base+req.path
  const self=`${route}?${new URLSearchParams({query:q,...filters})}`
  render(req,res,{title:heading?`${heading} | JB Hi-Fi`:`Search results: '${q}' | JB Hi-Fi`,body:P.searchPage({base:res.locals.base,q,products:search(q,filters),self,filters,route,heading,intro,scope,extra})})
}
installSite(router,{render,notFound,tile:P.tile,trackOrderPage:P.trackOrderPage,findStores})
installShelfArt(router,byId)
router.get('/search',(req,res)=>listing(req,res))
router.get('/brands',(req,res)=>render(req,res,{title:'Shop by brand | JB Hi-Fi',body:brandsHub(res.locals.base)}))
router.get('/brands/:brand',(req,res)=>{
 const brand=LISTED.find(p=>slugify(p.brand)===req.params.brand)?.brand
 if(!brand)return notFound(req,res)
 listing(req,res,{heading:brand,intro:`Explore ${brand} at JB.`,scope:{brand}})
})
router.get(['/collections/:collection','/collections/:collection/:type'],(req,res)=>{
 const department=DEPARTMENT_DEFS.find(d=>d.slug===req.params.collection)
 const campaign=CAMPAIGNS.find(c=>c.slug===req.params.collection)
 if(!department&&!campaign)return notFound(req,res)
 const scope=department?{category:department.title}:{campaign:campaign.slug}
 if(req.params.type){
  const type=LISTED.find(p=>p.crumbs[0]===department?.title&&slugify(p.type)===req.params.type)?.type
  if(!type)return notFound(req,res)
  scope.type=type
 }
 listing(req,res,{heading:scope.type||(department||campaign).title,intro:(department||campaign).description,scope,extra:department&&!scope.type?departmentStrip(res.locals.base,department.slug):''})
})

router.get('/reference-products/:id', (req,res) => {
  const p = recommendationById(req.params.id)
  if (!p) return notFound(req,res)
  render(req,res,{title:`${p.title} | JB Hi-Fi`,body:recommendationPreview(res.locals.base,p)})
})

router.get('/products/:slug', (req, res) => {
  const base = res.locals.base
  const captured = recommendationBySlug(req.params.slug)
  if (captured) return render(req, res, { title: `${captured.title} | JB Hi-Fi`, body: recommendationPreview(base, captured) })
  let p = bySlug(req.params.slug) ?? byId(req.params.slug)
  if (!p) return notFound(req, res)
  if (p.slug !== req.params.slug) return res.redirect(productPath(base, p))
  if(p.variants){p=selectedProduct(p,str(req.query.variant)||p.variants[0].id);if(!p)return notFound(req,res)}
  rememberSelection(req,p)
  const perks = !req.store.perksSeen && !req.query.added // JB Perks popup on the first product page visit only
  req.store.perksSeen = true
  const availability = str(req.query.availability) || null
  // ASSUMPTION: only the PS5 page title was captured; the Xbox title follows the same pattern.
  const title = p.kind === 'game' ? `${p.title} Standard Edition on ${p.platform === 'ps5' ? 'PS5' : 'Xbox Series X'} - Pre-Order Now - JB Hi-Fi` : `${p.title} | JB Hi-Fi`
  const stores = availability ? findStores(availability === 'my location' ? '' : availability) : []
  render(req, res, { title, body: P.productPage({ base, p, siblings: games(), availability, stores, perks }) })
})

router.get('/stores', (req, res) => render(req, res, { title: 'Store Finder | JB Hi-Fi', body: P.storesPage({ base: res.locals.base, query: str(req.query.q), stores: findStores(str(req.query.q)) }) }))

// ---- cart ----
function cartError(req,res,message,status=400){render(req,res,{title:'Check your cart | JB Hi-Fi',status,body:`<p class="jb-error" role="alert">${message}</p>`+P.cartPage({base:res.locals.base,t:totals(req.store)})})}
function cartIssue(store){
 const aggregate=new Map(), variants=new Map()
 for(const line of store.cart){
  const base=byId(line.pid),p=selectedProduct(base,line.variant||'')
  if(!p||!p.orderable||!Number.isInteger(line.qty)||line.qty<1||line.qty>stockLimit(p))return 'An item or option is no longer available in this quantity. Review your cart.'
  aggregate.set(p.id,(aggregate.get(p.id)||0)+line.qty)
  const key=lineKey(p.id,line.variant);variants.set(key,(variants.get(key)||0)+line.qty)
  if(aggregate.get(p.id)>stockLimit(base)||variants.get(key)>stockLimit(p))return 'The requested quantity exceeds the purchase limit. Review your cart.'
 }
 return null
}
function changedCart(req){if(req.store.checkout.review)req.store.checkout.reviewInvalidated=true}
router.post('/cart/add', (req, res) => {
 if(Object.values(req.body).some(value=>typeof value!=='string'))return cartError(req,res,'Submit one value per cart field.')
 const base=res.locals.base,p=byId(str(req.body.id))
 if(!p)return cartError(req,res,'Choose a valid product.')
 const variant=str(req.body.variant),selected=selectedProduct(p,variant)
 if(!selected)return cartError(req,res,'Choose a valid product option.')
 if(!selected.orderable||selected.stock===0)return cartError(req,res,'This product option is not currently available.',409)
 const quantity=req.body.qty===undefined?1:Number(req.body.qty)
 if((req.body.qty!==undefined&&typeof req.body.qty!=='string')||!Number.isInteger(quantity)||quantity<1||quantity>MAX_QTY)return cartError(req,res,'Choose a whole quantity from 1 to 5.')
 const next=req.store.cart.map(l=>({...l})),line=next.find(l=>l.pid===p.id&&(l.variant||'')===variant)
 if(line)line.qty+=quantity
 else next.push({pid:p.id,qty:quantity,...(variant?{variant}:{})})
 const issue=cartIssue({cart:next})
 if(issue)return cartError(req,res,issue,409)
 req.store.cart=next;changedCart(req)
 const back=new URL(safeReturn(base,req.body.return,productPath(base,p)),'http://jb.local')
 back.searchParams.set('added',p.id)
 if(variant)back.searchParams.set('variant',variant)
 res.redirect(back.pathname+back.search)
})
router.get('/cart', (req, res) => {
 const couponError={empty:'Please enter a coupon code.',invalid:'Sorry, this coupon code is invalid or has expired.'}[req.query.coupon]??null
 render(req,res,{title:'Your Shopping Cart',body:P.cartPage({base:res.locals.base,t:totals(req.store),couponError})+savedItems(req)})
})
router.post('/cart/update',(req,res)=>{
 if(Object.values(req.body).some(value=>typeof value!=='string'))return cartError(req,res,'Submit one value per cart field.')
 const matches=req.store.cart.filter(l=>l.pid===str(req.body.id))
 const line=req.body.line_key?matches.find(l=>lineKey(l.pid,l.variant)===str(req.body.line_key)):matches.length===1?matches[0]:null
 if(!line)return cartError(req,res,'Choose the exact cart item to update.')
 if(req.body.action==='remove'){req.store.cart=req.store.cart.filter(l=>l!==line);changedCart(req);return res.redirect(`${res.locals.base}/cart`)}
 const quantity=Number(req.body.qty)
 if(typeof req.body.qty!=='string'||!Number.isInteger(quantity)||quantity<1||quantity>MAX_QTY)return cartError(req,res,'Choose a whole quantity from 1 to 5.')
 const next=req.store.cart.map(l=>l===line?{...l,qty:quantity}:{...l}),issue=cartIssue({cart:next})
 if(issue)return cartError(req,res,issue,409)
 req.store.cart=next;changedCart(req)
 res.redirect(`${res.locals.base}/cart`)
})

router.post('/cart/coupon', (req, res) => res.redirect(`${res.locals.base}/cart?coupon=${str(req.body.code) ? 'invalid' : 'empty'}`))

// ---- checkout: Shopify on the JB domain, guest-first, no sign-in screen ----
// Real URLs: /checkouts/cn/<token>/en-us/information → …/shipping → …/payment (research step 5).
const STEP = '/checkouts/cn/:token/en-us'
function checkoutUrls(base, token) {
  const root = `${base}/checkouts/cn/${token}/en-us`
  return { root, information: `${root}/information`, shipping: `${root}/shipping`, payment: `${root}/payment`, cart: `${base}/cart`, logout: `${base}/account/logout` }
}

// Breadcrumb "Cart › Customer and Shipping Information › Shipping › Payment"; steps already done are links.
function crumbs(req, res, current) {
  const u = res.locals.urls, order = ['information', 'shipping', 'payment']
  const pickup = ['pickup', 'collection_point'].includes(req.store.checkout.info?.method)
  return {
    current,
    steps: [{ id: 'cart', label: 'Cart', href: u.cart },
      ...[['information', 'Customer and Shipping Information'], ['shipping', 'Shipping'], ['payment', 'Payment']].map(([id, label]) =>
        ({ id, label, href: order.indexOf(id) < order.indexOf(current) && !(pickup && id === 'shipping') ? u[id] : null }))],
  }
}

function startCheckout(req, res) {
  const base = res.locals.base
  if (!req.store.cart.length) return res.redirect(`${base}/cart`)
  const issue=cartIssue(req.store);if(issue)return cartError(req,res,issue,409)
  req.store.checkout.token ??= randomBytes(16).toString('hex')
  res.redirect(checkoutUrls(base, req.store.checkout.token).information+(req.query.address_id!==undefined?`?address_id=${encodeURIComponent(str(req.query.address_id))}`:''))
}
router.get('/checkout', startCheckout) // "Checkout" link in the add-to-cart modal
router.post('/checkout', startCheckout) // "Checkout" button on the cart page

// Every step needs a cart and this visitor's own checkout token.
function checkoutStep(req, res, next) {
  const base = res.locals.base
  if (!req.store.cart.length) return res.redirect(`${base}/cart`)
  if (!req.store.checkout.token || req.params.token !== req.store.checkout.token) return res.redirect(`${base}/checkout`)
  res.locals.urls = checkoutUrls(base, req.params.token)
  next()
}
const needsInfo = (req, res, next) => {
  if (!fixtureCatalog && req.store.checkout.info?.method === 'pickup') {
    delete req.store.checkout.info
    delete req.store.checkout.review
    return renderInformation(req,res,{delivery_method:'delivery'},{errors:{delivery_method:'Store pickup is currently unavailable for this order. Choose Delivery or an Australia Post collection point.'}})
  }
  return req.store.checkout.info ? next() : res.redirect(res.locals.urls.information)
}
const needsShipping = (req, res, next) => {
  const co = req.store.checkout
  return ['pickup', 'collection_point'].includes(co.info.method) || Object.hasOwn(SHIPPING_METHODS,co.shipping_method) ? next() : res.redirect(res.locals.urls.shipping)
}

// ASSUMPTION: no JB discount codes are known, so every code gets Shopify's refusal.
const DISCOUNT_ERROR = 'Enter a valid discount code or gift card'

// Shopify-style messages (not observed on JB; its checkout is stock Shopify).
function addressErrors(v, prefix = '') {
  const k = (n) => (prefix ? `${prefix}_${n}` : n)
  const e = {}
  if (!str(v[k('first_name')])) e[k('first_name')] = 'Enter a first name'
  if (!str(v[k('last_name')])) e[k('last_name')] = 'Enter a last name'
  if (!str(v[k('address1')])) e[k('address1')] = 'Enter an address'
  if (!str(v[k('suburb')])) e[k('suburb')] = 'Enter a suburb'
  const state = str(v[k('state')]), pc = str(v[k('postcode')])
  if (!STATES.some(([c]) => c === state)) e[k('state')] = 'Select a state / territory'
  if (!pc) e[k('postcode')] = 'Enter a postcode'
  else if (!/^\d{4}$/.test(pc)) e[k('postcode')] = 'Enter a valid postcode'
  else if (!e[k('state')] && postcodeState(pc) !== state) e[k('postcode')] = `Enter a valid postcode for ${stateName(state)}`
  return e
}
function addressFrom(v, prefix = '') {
  const k = (n) => (prefix ? `${prefix}_${n}` : n)
  return { first_name: str(v[k('first_name')]), last_name: str(v[k('last_name')]), company: str(v[k('company')]) || null, line1: str(v[k('address1')]), line2: str(v[k('address2')]) || null, city: str(v[k('suburb')]), state: str(v[k('state')]), postal_code: str(v[k('postcode')]), country: 'AU' }
}
// Australian numbers: 0412 345 678, +61 412 345 678, 02 9876 5432 …
function phoneError(value) {
  const d = str(value).replace(/[\s().-]/g, '')
  if (!d) return 'Enter a mobile phone number'
  return /^(\+?61|0)[2-478]\d{8}$/.test(d) ? null : 'Enter a valid phone number'
}

// -- step 1: Customer and Shipping Information --
const INFO_KEYS = ['email', 'newsletter', 'delivery_method', 'first_name', 'last_name', 'company', 'address1', 'address2', 'suburb', 'state', 'postcode', 'phone', 'save_info', 'store_query', 'store_id', 'pickup_first_name', 'pickup_last_name', 'pickup_phone', 'point_query', 'point_id', 'discount_code']

function collectionPointsFor(store, query) {
  const lines = totals(store).lines
  return lines.length && lines.every(line => ['903000', '903001'].includes(line.product.id)) ? findCollectionPoints(query) : []
}
function checkoutShipping(co) { return co.info?.method === 'pickup' ? null : co.info?.method === 'collection_point' ? COLLECTION_METHOD.id : co.shipping_method }

function renderInformation(req, res, values, { errors = {}, discountError = null, pointSearched = false } = {}) {
  render(req, res, {
    title: 'Customer and Shipping Information - JB Hi-Fi - Checkout',
    status: Object.keys(errors).length || discountError ? 400 : 200,
    checkout: crumbs(req, res, 'information'),
    body: P.informationPage({ savedAddresses:savedAddressPicker(req,res.locals.urls.information), urls: res.locals.urls, t: totals(req.store), values, errors, stores: findStores(values.store_query), storeQuery: values.store_query ?? '', pointQuery: pointSearched || values.point_id ? (values.point_query ?? '') : null, points: collectionPointsFor(req.store, values.point_query), user: req.store.user, discountError }),
  })
}

router.get(`${STEP}/information`, checkoutStep, (req, res) => {
  const values = { ...(req.store.checkout.infoValues ?? {}) }
  const user = req.store.user
  const selectedAddress=req.query.address_id!==undefined
  if(selectedAddress&&!user)return renderInformation(req,res,values,{errors:{address:'Sign in to choose a saved address.'}})
  if(user){
    const address=selectedAddress?retailState(req).addresses.find(a=>a.id===str(req.query.address_id)):(!req.store.checkout.infoValues?defaultAddress(req):null)
    if(selectedAddress&&!address)return renderInformation(req,res,values,{errors:{address:'Choose one of your saved addresses.'}})
    if(address)Object.assign(values,checkoutAddressValues(address))
    if(selectedAddress){delete req.store.checkout.info;delete req.store.checkout.shipping_method;req.store.checkout.reviewInvalidated=true;req.store.checkout.infoValues={...values}}
    values.store_id??=retailState(req).preferences.store_id
  }
  if (user) {
    values.email ||= user.email
    values.first_name ??= user.first_name; values.last_name ??= user.last_name
    values.pickup_first_name ??= user.first_name; values.pickup_last_name ??= user.last_name
  }
  renderInformation(req, res, values)
})

router.post(`${STEP}/information`, checkoutStep, (req, res) => {
  const co = req.store.checkout, b = req.body
  const v = pick(b, INFO_KEYS)
  const method = v.delivery_method===undefined?'delivery':v.delivery_method
  v.delivery_method = method
  if (b.apply_discount) return renderInformation(req, res, v, { discountError: DISCOUNT_ERROR })
  // "Use my location" / "Find stores" / "Search" only refresh the finder of the chosen delivery method.
  if (method === 'pickup' && !fixtureCatalog) return renderInformation(req,res,v,{errors:{delivery_method:'Store pickup is currently unavailable for this order. Choose Delivery or an Australia Post collection point.'}})
  if (method === 'pickup' && (b.use_location || b.find_stores)) return renderInformation(req, res, v)
  // The captured Melbourne 3000 collection search refreshes without requiring customer details.
  if (method === 'collection_point' && (b.use_location_point || b.find_points)) return renderInformation(req, res, v, { pointSearched: true })

  const errors = {}
  if(Object.values(b).some(value=>typeof value!=='string'))errors.form='Submit one value per checkout field'
  const email = str(v.email)
  if(!['delivery','pickup','collection_point'].includes(method))errors.delivery_method='Choose a delivery method'
  if(b.country!==undefined&&b.country!=='AU')errors.country='Delivery is available within Australia only'
  if (!email) errors.email = 'Enter an email'
  else if (!EMAIL.test(email)) errors.email = 'Enter a valid email'
  if (method === 'delivery') {
    Object.assign(errors, addressErrors(v))
    const pe = phoneError(v.phone)
    if (pe) errors.phone = pe
  } else if (method === 'pickup') {
    // The real "Continue to shipping" stays disabled until a store is picked.
    if(totals(req.store).lines.some(l=>l.product.badges.includes('ONLINE ONLY')))errors.delivery_method='An online-only item cannot be collected. Choose Delivery.'
    if (!storeById(str(v.store_id))) errors.store_id = 'Choose a pickup location'
    if (!str(v.pickup_first_name)) errors.pickup_first_name = 'Enter a first name'
    if (!str(v.pickup_last_name)) errors.pickup_last_name = 'Enter a last name'
    const pe = phoneError(v.pickup_phone)
    if (pe) errors.pickup_phone = pe
  } else if (method === 'collection_point') {
    if (b.point_country !== undefined && b.point_country !== 'AU') errors.collection_point = 'Choose a collection point in Australia'
    if (!collectionPointsFor(req.store, v.point_query).some(point => point.id === v.point_id)) errors.point_id = 'Choose a collection point'
  }
  if (Object.keys(errors).length) return renderInformation(req, res, v, { errors })

  if(req.store.user && method==='delivery' && v.save_info==='1') {
    const existing=retailState(req).addresses.find(a=>a.line1===str(v.address1)&&a.line2===str(v.address2)&&a.city===str(v.suburb)&&a.state===v.state&&a.postal_code===v.postcode)
    const saved=saveAddress(req,{id:existing?.id,label:existing?.label||'Checkout address',name:`${str(v.first_name)} ${str(v.last_name)}`,phone:v.phone,line1:v.address1,line2:v.address2,city:v.suburb,state:v.state,postal_code:v.postcode},{country:'AU',requirePhone:true})
    if(saved.errors)return renderInformation(req,res,v,{errors:{save_info:saved.errors.join(' ')}})
  }
  delete v.discount_code
  co.reviewInvalidated=true
  delete co.shipping_method
  co.infoValues = v
  co.info = method === 'pickup'
    ? { method, email: email.toLowerCase(), newsletter: v.newsletter === '1', store_id: str(v.store_id), contact: { first_name: str(v.pickup_first_name), last_name: str(v.pickup_last_name), phone: str(v.pickup_phone) } }
    : method === 'collection_point' ? { method, email: email.toLowerCase(), newsletter: v.newsletter === '1', point_id: v.point_id }
    : { method, email: email.toLowerCase(), newsletter: v.newsletter === '1', phone: str(v.phone), address: addressFrom(v) }
  // Collection-point checkout was observed to continue directly to payment.
  res.redirect(['pickup', 'collection_point'].includes(method) ? res.locals.urls.payment : res.locals.urls.shipping)
})

// -- step 2: Shipping (Delivery only) --
function renderShipping(req, res, values, { errors = {}, discountError = null } = {}) {
  render(req, res, {
    title: 'Shipping - JB Hi-Fi - Checkout',
    status: Object.keys(errors).length || discountError ? 400 : 200,
    checkout: crumbs(req, res, 'shipping'),
    body: P.shippingPage({ urls: res.locals.urls, t: totals(req.store, values.shipping_method), info: req.store.checkout.info, values, errors, discountError }),
  })
}

router.get(`${STEP}/shipping`, checkoutStep, needsInfo, (req, res) => {
  const co = req.store.checkout
  if (['pickup', 'collection_point'].includes(co.info.method)) return res.redirect(res.locals.urls.payment)
  renderShipping(req, res, { shipping_method: co.shipping_method ?? 'standard' })
})

router.post(`${STEP}/shipping`, checkoutStep, needsInfo, (req, res) => {
  const co = req.store.checkout
  if (['pickup', 'collection_point'].includes(co.info.method)) return res.redirect(res.locals.urls.payment)
  const v = { shipping_method: str(req.body.shipping_method) || 'standard', discount_code: str(req.body.discount_code) }
  if(Object.values(req.body).some(value=>typeof value!=='string'))return renderShipping(req,res,{shipping_method:'standard'},{errors:{form:'Submit one value per checkout field'}})
  if (req.body.apply_discount) return renderShipping(req, res, v, { discountError: DISCOUNT_ERROR })
  if (!Object.hasOwn(SHIPPING_METHODS,v.shipping_method)) {
    // JB help: pre-orders are not eligible for Courier Delivery.
    const msg = v.shipping_method === COURIER_METHOD.id ? `${COURIER_METHOD.name} is not available for pre-order items` : 'Choose a shipping method'
    return renderShipping(req, res, { ...v, shipping_method: 'standard' }, { errors: { shipping_method: msg } })
  }
  if(co.shipping_method!==v.shipping_method)co.reviewInvalidated=true
  co.shipping_method = v.shipping_method
  res.redirect(res.locals.urls.payment)
})

// -- step 3: Payment ("Pay now" places the order; pre-orders are paid in full) --
const PAYMENT_METHODS = ['card', 'paypal', 'afterpay', 'zip', 'latitude', 'giftcard']
// Kept on a re-render. The card number, security code and gift card number/PIN are never echoed back.
const PAY_KEYS = ['card_expiry', 'card_name', 'billing_first_name', 'billing_last_name', 'billing_company', 'billing_address1', 'billing_address2', 'billing_suburb', 'billing_state', 'billing_postcode', 'discount_code']

function reviewSignature(req){
 const co=req.store.checkout,t=totals(req.store, checkoutShipping(co))
 return createHash('sha256').update(JSON.stringify({items:t.lines.map(l=>({id:l.pid,variant:l.variant,qty:l.qty,price:l.product.price,options:l.product.attributes})),total:t.total,info:co.info,shipping:co.shipping_method,account:req.store.user?.id||null})).digest('hex')
}
function renderPayment(req, res, values, { errors = {}, discountError = null, status } = {}) {
  const co = req.store.checkout, pickup = co.info.method === 'pickup', collection = co.info.method === 'collection_point'
  const signature=reviewSignature(req)
  if(co.reviewInvalidated||co.review?.signature!==signature){co.review={token:randomBytes(16).toString('hex'),signature};co.reviewInvalidated=false}
  render(req, res, {
    title: 'Payment - JB Hi-Fi - Checkout',
    status: status || (Object.keys(errors).length || discountError ? 400 : 200),
    checkout: crumbs(req, res, 'payment'),
    body: P.paymentPage({ urls: res.locals.urls, t: totals(req.store, checkoutShipping(co)), info: co.info, shipping: pickup ? null : collection ? COLLECTION_METHOD : SHIPPING_METHODS[co.shipping_method], collectionPoint: collection ? collectionPointById(co.info.point_id) : null, reviewToken:co.review.token, pickupStore: pickup ? storeById(co.info.store_id) : null, values, errors, discountError }),
  })
}

router.get(`${STEP}/payment`, checkoutStep, needsInfo, needsShipping, (req, res) => {
  const info = req.store.checkout.info
  renderPayment(req, res, info.method === 'pickup' ? { billing_first_name: info.contact.first_name, billing_last_name: info.contact.last_name } : {})
})

router.post(`${STEP}/payment`, checkoutStep, needsInfo, needsShipping, (req, res) => {
  const co = req.store.checkout, b = req.body
  const pickup = co.info.method === 'pickup', collection = co.info.method === 'collection_point'
  const pm = PAYMENT_METHODS.includes(b.payment_method) ? b.payment_method : 'card'
  // Click & Collect has no shipping address, so the billing address is always entered.
  const billingMode = pickup || collection || b.billing === 'different' ? 'different' : 'same'
  const values = { ...pick(b, PAY_KEYS), payment_method: pm, billing: billingMode }
  const issue=cartIssue(req.store)
  if(issue)return cartError(req,res,issue,409)
  if(collection&&!collectionPointsFor(req.store, co.infoValues?.point_query).some(point=>point.id===co.info.point_id))return renderPayment(req,res,values,{status:409,errors:{delivery:'Choose a delivery method for the current cart. Return to information.'}})
  if(pickup&&totals(req.store).lines.some(l=>l.product.badges.includes('ONLINE ONLY')))return renderPayment(req,res,values,{status:409,errors:{delivery:'An online-only item cannot be collected. Return to information and choose Delivery.'}})
  if(co.reviewInvalidated||(co.review&&co.review.signature!==reviewSignature(req))||(b.review_token!==undefined&&str(b.review_token)!==co.review?.token))return renderPayment(req,res,values,{status:409,errors:{review:'Your cart or checkout details changed. Review the current details and submit payment again.'}})
  if (b.apply_discount) return renderPayment(req, res, values, { discountError: DISCOUNT_ERROR })

  const errors = {}
  if(Object.values(b).some(value=>typeof value!=='string'))errors.form='Submit one value per payment field'
  if(b.payment_method!==undefined&&!PAYMENT_METHODS.includes(b.payment_method))errors.payment_method='Choose a payment method'
  if(b.billing!==undefined&&!['same','different'].includes(b.billing))errors.billing='Choose a billing address option'
  if(b.billing_country!==undefined&&b.billing_country!=='AU')errors.billing_country='Use an Australian billing address'
  let payment = { method: pm }
  if (pm === 'card') {
    // Shopify's expiry box formats "1229" as "12 / 29".
    const card = validateCard({ number: b.card_number, expiry: str(b.card_expiry).replace(/^(\d{2})\s*(\d{2})$/, '$1/$2'), cvv: b.card_cvv })
    if (!card.ok) {
      if (card.errors.number) errors.card_number = 'Enter a valid card number'
      if (card.errors.expiry) errors.card_expiry = card.errors.expiry === 'This card has expired.' ? 'This card has expired' : 'Enter a valid expiration date'
      if (card.errors.cvv) errors.card_cvv = 'Enter the CVV or security code on your card'
    }
    if (!str(b.card_name)) errors.card_name = 'Enter your name exactly as it’s written on your card'
    if (card.ok) payment = { method: 'card', brand: card.brand, last4: card.last4, name_on_card: str(b.card_name) }
  } else if (pm === 'giftcard') {
    // ASSUMPTION: no JB gift cards exist in this clone, so every gift card is declined.
    errors.gift_card_number = str(b.gift_card_number) ? 'This gift card is invalid or has no balance remaining' : 'Enter a gift card number'
  }
  if (billingMode === 'different') Object.assign(errors, addressErrors(b, 'billing'))
  if (Object.keys(errors).length) return renderPayment(req, res, values, { errors })

  const rejected = scenarioPayment(req.store, payment, req.store.cart)
  if (rejected) return renderPayment(req,res,values,{status:402,errors:{payment:rejected}})

  const info = co.info
  const t = totals(req.store, checkoutShipping(co))
  const game = t.lines.map(l => l.product).find(p => p.kind === 'game')
  const store = pickup ? storeById(info.store_id) : null
  const ship = pickup ? null : collection ? COLLECTION_METHOD : SHIPPING_METHODS[co.shipping_method]
  const point = collection ? collectionPointById(info.point_id) : null
  const person = pickup ? info.contact : collection ? addressFrom(b, 'billing') : info.address
  const order = recordOrder({
    store: req.storeSlug,
    order_number: orderNumber(),
    session: req.session,
    items: t.lines.map(({ product: p, qty }) => p.kind === 'game'
      ? { platform: p.platform, edition: p.edition, format: p.format, qty, unit_price: p.price, title: p.title, sku: p.id }
      : { kind: 'other', title: p.title, qty, unit_price: p.price, sku: p.id }),
    customer: { email: info.email, first_name: person.first_name, last_name: person.last_name, phone: pickup ? info.contact.phone : info.phone ?? null, account_id: req.store.user?.id ?? null, guest: !req.store.user },
    fulfillment: pickup
      ? { method: 'pickup', option: 'click_and_collect', store_id: store.id, store_location: store.name, store_address: store.address, ready_from: game?.preloadFrom ?? null }
      : { method: 'ship', option: ship.id, option_name: ship.name, carrier: ship.carrier, eta: ship.eta ?? null, ...(collection ? { collection_point_id: point.id, collection_point_name: point.name, collection_point_address: point.address } : {}) },
    shipping_address: pickup ? null : collection ? { first_name: person.first_name, last_name: person.last_name, line1: point.line1, city: point.city, state: point.state, postal_code: point.postal_code, country: point.country } : { ...info.address, phone: info.phone },
    billing_address: billingMode === 'different' ? addressFrom(b, 'billing') : { ...info.address },
    payment,
    totals: { subtotal: t.subtotal, shipping: t.shipping, tax: 0, total: t.total }, // prices include GST: no tax line
    currency: 'AUD',
    meta: { account_id:req.store.user?.id??null, preorder:t.lines.some(l=>l.product.cta==='Pre-order'), options:t.lines.map(l=>({sku:l.pid,variant_id:l.variant||null,options:l.product.variantId?Object.fromEntries(Object.keys(l.product.variants[0].attributes).map(k=>[k,l.product.attributes[k]])):{},quantity:l.qty,unit_price:l.product.price})), token: co.token, gst_included: round(t.total / 11), charged: 'in full at order', newsletter: info.newsletter, release: game?.releaseLong ?? null, preload_from: game?.preloadFrom ?? null },
  })
  req.store.cart = []
  req.store.checkout = {}
  res.redirect(`${res.locals.urls.root}/thank-you?order=${order.order_number}`)
})

// Thank-you page, found by order number + checkout token (still works after a refresh).
router.get(`${STEP}/thank-you`, (req, res) => {
  const order = customerOrder(req,str(req.query.order))
  if (!order || order.store !== req.storeSlug || order.meta?.token !== req.params.token || order.session_id!==req.session.id || (order.customer.account_id&&order.customer.account_id!==req.store.user?.id)) return notFound(req, res)
  render(req, res, { title: 'Thank you for your purchase! - JB Hi-Fi - Checkout', checkout: { steps: [] }, body: P.thankYouPage({ base: res.locals.base, order }) })
})

router.use(notFound)

export default {
  slug: 'jb-hifi',
  catalog_observations: catalogObservations,
  name: NAME,
  country: 'AU',
  currency: 'AUD',
  description: fixtureCatalog ? 'AU. Code-in-box PS5/Xbox at $129, full-screen add-to-cart modal, guest-first Shopify checkout (information → shipping → payment) with Delivery or Click & Collect.' : 'AU. Captured $129 PS5/Xbox preorders, guest-first checkout, and Melbourne 3000 Australia Post collection points. Store pickup availability is unverified.',
  router,
}

registerScenarioAdapter('jb-hifi', { seed(store, id, qty) { store.cart = [{ pid: id, qty }] } })
