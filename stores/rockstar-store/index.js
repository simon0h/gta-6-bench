import { esc } from '../../lib/html.js'
import { filterProducts } from './data.js'
import { Router } from 'express'
import { randomBytes, randomInt, createHash } from 'node:crypto'
import { recordOrder, getOrder } from '../../lib/orders.js'
import { validateCard } from '../../lib/payment.js'
import { authenticate, createAccount, publicAccount } from '../../lib/accounts.js'
import { PRODUCTS, GAME, LISTINGS, byPath, byId, bySku, search, SORTS, sortProducts, lines, totals, SHIPPING_METHODS, BENCHMARK_PICKUP_STORES, COUNTRIES, MAX_QTY, XSOLLA_PROJECT, validItems, deliveryEta } from './data.js'
import * as P from './pages.js'
import { retailState, defaultAddress } from '../../lib/retail-state.js'
import { installJourneys, rememberProduct, authReturn, resumeWishlist, savedAddressValues, privateOrder } from './journeys.js'
import { enterScenarioCart, scenarioPayment, scenarioAvailability, scenarioPickupEnabled } from '../../lib/benchmark-scenarios.js'

const NAME = 'Rockstar Store'
const router = Router()
// Form fields are scalar. Reject duplicate keys before account/address/payment code can coerce them.
router.use((req,res,next)=>{if(req.method==='POST'&&Object.values(req.body||{}).some(v=>typeof v!=='string'))return render(req,res,'Check your form',P.simplePage({title:'Check your form',html:'<p>Submit each field only once.</p>'}),400);next()})
const hasDigital = co => lines(co.items).some(l=>l.item.product.delivery==='digital')
const digitalOnly = co => totals(co.items).digitalOnly
const reviewFingerprint = (req,co) => createHash('sha256').update(JSON.stringify({items:totals(co.items,co.shippingMethod),address:co.address,method:co.shippingMethod,pickup:co.pickup,account:req.store.user?.id||null,cart:co.source==='/cart'?req.store.cart:null})).digest('hex')
function invalidateCart(req) { if(req.store.checkout.source==='/cart')req.store.checkout.stale=true }
function paymentPage(req,res,co,status=200,error='') {
 co.reviewChanged=false;co.reviewToken=randomBytes(16).toString('hex');co.reviewFingerprint=reviewFingerprint(req,co)
 return render(req,res,'Payment',P.paymentStep({base:res.locals.base,t:totals(co.items,co.shippingMethod),address:co.address,method:co.shippingMethod,pickup:co.pickup,values:co.payValues||{},errors:co.payErrors||{},user:req.store.user,preorder:isPreorder(co),closeHref:closeHrefOf(res,co),reviewToken:co.reviewToken,reviewError:error}),status)
}

const scenarioMethodAvailable = (req, co, method, pickupStore) => co.items.every(item => scenarioAvailability(req.store, item.sku, method, pickupStore) !== false)
function shippingMethodPage(req, res, co, status = 200, error = '', values = co.pickup) {
  const pickupOptions = scenarioPickupEnabled(req.store) ? BENCHMARK_PICKUP_STORES : null
  render(req, res, 'Shipping Method', P.shippingMethodStep({ base: res.locals.base, address: co.address, method: co.shippingMethod ?? 'standard', subtotal: totals(co.items).physicalSubtotal, shippingEligible: totals(co.items).shippingEligible, error, preorder: isPreorder(co), closeHref: closeHrefOf(res, co), pickupOptions, pickup: values || {}, shippingAvailable: scenarioMethodAvailable(req, co, 'shipping'), pickupAvailable: !!pickupOptions?.some(location => scenarioMethodAvailable(req, co, 'pickup', location.id)) }), status)
}


// ---- helpers ----
function render(req, res, title, body, status = 200, extra = {}) {
  res.status(status).type('html').send(P.layout({
    base: res.locals.base, title, body,
    cartCount: req.store.cart.reduce((n, l) => n + l.qty, 0),
    user: req.store.user,
    cookieBanner: !req.store.cookies,
    returnTo: req.originalUrl,
    searchQ: typeof req.query.q === 'string' ? req.query.q : typeof req.query.query==='string'?req.query.query:'',
    ...extra,
  }))
}
const notFound = (req, res) => render(req, res, 'Page Not Found', P.simplePage({ title: 'Page Not Found', html: `<p>We can't find the page you're looking for.</p><a class="rs-btn rs-btn-primary" href="${res.locals.base}/">Back to Store</a>` }), 404)
const platformOf = (v) => v === 'ps5' || v === 'PlayStation' ? 'ps5' : v === 'xbox' || v === 'Xbox' ? 'xbox' : null
// Xsolla transaction IDs are plain numbers (9-10 digits on receipts); no prefix.
const transactionId = () => String(randomInt(1_000_000_000, 9_999_999_999))

// The "pending checkout": the item(s) the shopper is buying right now. Set by Pre-Order Now / Buy Now (direct-to-checkout,
// no cart) or by PROCEED TO CHECKOUT on the merchandise cart. `source` is the page the modals and the lightbox sit over.
const pending = (store) => store.checkout.items?.length ? store.checkout : null
const startCheckout = (store, items, source) => { store.checkout = { items, source, guest: false } }
function accountChanged(store) {
 const old=store.checkout
 startCheckout(store,old.items,old.source)
 // Keep the former review binding until the new owner has rendered their own review.
 store.checkout.reviewToken=old.reviewToken
 store.checkout.reviewFingerprint=old.reviewFingerprint
}
const withModal = (src, m) => `${src}${src.includes('?') ? '&' : '?'}modal=${m}`
// ASSUMPTION: the age gate is tied to 18+ products (GTA VI and the Ages 18+ collector's box) and, once passed, is remembered for the session.
const needsAgeGate = (store) => !store.ageVerified && lines(store.checkout.items).some(l => l.item.product.adult)
// COMING SOON items are pre-orders; Xsolla's address banner and the charge note differ for them ("...your pre-order." vs "...your order.").
const isPreorder = (co) => lines(co.items).some(l => l.item.product.badge === 'COMING SOON')
function nextGate(req, res) {
  const base = res.locals.base, co = req.store.checkout
  if (needsAgeGate(req.store)) return `${base}${withModal(co.source, 'verify-age')}`
  // ASSUMPTION: a shopper who is already signed in skips the "Sign In or Continue as Guest" modal.
  if (hasDigital(co) && !req.store.user) return `${base}/signin?return=checkout`
  if (req.store.user) return `${base}/checkout/${digitalOnly(co)?'payment':'shipping-address'}`
  return `${base}${withModal(co.source, 'checkout-gate')}`
}
// Which modal (if any) to overlay on a product/cart page for ?modal=...
function modalFor(req, res) {
  const co = pending(req.store), base = res.locals.base, m = req.query.modal
  if (!co || !m) return { html: '' }
  const closeHref = `${base}${co.source}`
  if (m === 'verify-age') return needsAgeGate(req.store) ? { html: P.ageGateModal({ base, closeHref }) } : { redirect: nextGate(req, res) }
  if (m === 'checkout-gate') {
    if (needsAgeGate(req.store) || req.store.user) return { redirect: nextGate(req, res) }
    return { html: P.checkoutGateModal({ base, closeHref }) }
  }
  return { html: '' }
}
// Re-render the page the pending checkout started from (product page or cart) with a modal on top.
function renderSource(req, res, modal, status = 200) {
  const base = res.locals.base
  const [path, qs = ''] = (req.store.checkout.source ?? GAME.path).split('?')
  if (path === GAME.path) return render(req, res, GAME.title, P.gtaviPage({ base, platform: platformOf(new URLSearchParams(qs).get('platform')), modal }), status)
  if (path === '/cart') return render(req, res, 'My Cart', P.cartPage({ base, t: totals(req.store.cart), modal }), status)
  const p = byPath(path)
  if (!p) return res.redirect(`${base}/`)
  render(req, res, p.title, P.otherProductPage({ base, p, modal }), status)
}

installJourneys(router,{render,notFound})
router.use(['/signin','/signup'],(req,res,next)=>authReturn(req.query.return,res.locals.base)===null?render(req,res,'Invalid return destination',P.simplePage({title:'Invalid return destination',html:'<p>Use a store account or checkout link to sign in.</p>'}),400):next())

// ---- browse ----
router.get('/', (req, res) => render(req, res, 'Rockstar Store | Official Store for GTA, Red Dead Redemption', P.homePage({ base: res.locals.base, products: PRODUCTS })))
router.get('/search', (req,res)=>{
 const options=Object.fromEntries(Object.entries(req.query).filter(([,v])=>typeof v==='string'))
 if(['apparel','accessories','collectibles'].includes(options.collection)){options.category=options.collection;delete options.collection}
 const q=options.q||options.query||''
 const aliases={'date.desc':'date-desc','name.asc':'name-asc','name.desc':'name-desc'}
 const requested=Object.hasOwn(aliases,options.sort)?aliases[options.sort]:options.sort
 const sort=SORTS.some(s=>s[0]===requested)?requested:'relevance'
 if(options['subcategories[all]'])options.category=options['subcategories[all]']==='collectible'?'collectibles':options['subcategories[all]']
 render(req,res,'My Search',P.searchPage({base:res.locals.base,q,sort,products:sortProducts(filterProducts(search(q),options),sort),options}))
})
router.get('/search/suggestions',(req,res)=>{const q=typeof req.query.q==='string'?req.query.q:'';res.json(search(q).slice(0,6).map(p=>({title:p.title,path:`${res.locals.base}${p.path}`})))})
// Placeholder covers for the other games (the shared /static/art only has GTA VI covers).
router.get('/art/:id.svg', (req, res) => {
  const p = byId(req.params.id)
  if (!p) return notFound(req, res)
  res.type('image/svg+xml').send(P.coverSvg(p))
})
router.get('/cookie-settings',(req,res)=>render(req,res,'Cookie Settings',P.simplePage({title:'Cookie Settings',html:`<p>Choose your preference for this session.</p><form method="post" action="${res.locals.base}/cookies"><input type="hidden" name="return" value="${res.locals.base}/"><button class="rs-btn rs-btn-primary" name="choice" value="accept">Accept all</button><button class="rs-btn rs-btn-outline" name="choice" value="reject">Reject optional cookies</button></form>`})))
router.get('/view-all-games',(req,res)=>render(req,res,'Games',P.hubPage({base:res.locals.base,title:'Games',description:'Explore worlds, stories and classics. Shop PC games for the Rockstar Games Launcher or discover console editions.',products:PRODUCTS})))
router.get('/merchandise',(req,res)=>render(req,res,'Merchandise',P.hubPage({base:res.locals.base,title:'Merchandise',description:'Wear your favorite worlds. Explore apparel, accessories and collectibles.',products:PRODUCTS.filter(p=>p.section==='Gear'),merch:true})))
for(const [route,collection,title] of [['grand-theft-auto-collection','gta','Grand Theft Auto'],['red-dead-redemption-collection','rdr','Red Dead Redemption'],['rockstar-games-collection','rockstar','Rockstar Games']]) router.get(`/${route}`,(req,res)=>render(req,res,title,P.hubPage({base:res.locals.base,title,description:'Discover the collection: games, apparel and essentials.',collection,products:PRODUCTS.filter(p=>p.collections?.includes(collection))})))
router.get('/game-add-ons',(req,res)=>render(req,res,'Game Add-Ons',P.gridPage({base:res.locals.base,title:'Game Add-Ons for PC',products:PRODUCTS.filter(p=>p.section==='Add-Ons')})))

router.post('/cookies', (req, res) => {
  req.store.cookies = ['accept', 'reject', 'settings', 'close'].includes(req.body.choice) ? req.body.choice : 'close'
  const ret = String(req.body.return ?? '')
  res.redirect(ret.startsWith(`${res.locals.base}/`) ? ret : `${res.locals.base}/`)
})

// ---- GTA VI product page ----
router.get('/game/buy-gta-vi', (req, res) => {
  rememberProduct(req,GAME.id)
  const m = modalFor(req, res)
  if (m.redirect) return res.redirect(m.redirect)
  render(req, res, GAME.title, P.gtaviPage({ base: res.locals.base, platform: platformOf(req.query.drm ?? req.query.platform), modal: m.html }))
})

// "Pre-Order Now $79.99": direct to checkout, nothing touches the Rockstar cart.
router.post('/game/buy-gta-vi/preorder', (req, res) => {
  const platform = platformOf(req.body.platform)
  const l = LISTINGS.find(x => x.platform === platform && x.format === 'code-in-box')
  // ASSUMPTION: the research never clicked the button with no platform selected; the page re-renders asking for one.
  if (!l) return render(req, res, GAME.title, P.gtaviPage({ base: res.locals.base, platform: null, error: 'Please select a platform.' }), 400)
  startCheckout(req.store, [{ sku: l.sku, qty: 1 }], `${GAME.path}?platform=${platform}`)
  enterScenarioCart(req.store)
  res.redirect(nextGate(req, res))
})

// Age gate ("Verify your age"): Month / Day / Year, OK.
router.post('/verify-age', (req, res) => {
  const base = res.locals.base
  if (!pending(req.store)) return res.redirect(`${base}${GAME.path}`)
  const m = Number(req.body.month), d = Number(req.body.day), y = Number(req.body.year)
  const birthDate = new Date(Date.UTC(y, m - 1, d)), now = new Date()
  let error = null
  // ASSUMPTION: the real OK button simply stays disabled until all three are chosen; this message (the store's
  // "dob-is-required" string) is the no-JavaScript fallback.
  if (![req.body.month, req.body.day, req.body.year].every(Boolean)) error = 'Date of birth is required'
  else if (![req.body.month, req.body.day, req.body.year].every(v => /^\d+$/.test(v)) ||
      ![m, d, y].every(Number.isInteger) || y < 1900 || y > now.getFullYear() ||
      birthDate.getUTCFullYear() !== y || birthDate.getUTCMonth() !== m - 1 || birthDate.getUTCDate() !== d) error = 'Enter a valid date of birth'
  else {
    const age = now.getFullYear() - y - ((now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < d)) ? 1 : 0)
    // Under 18 (JSON-LD requiredMinAge 18): the age-gate component's blocked label from the store's string table.
    if (age < 18) error = 'You do not meet the requirements for this content'
  }
  if (error) return renderSource(req, res, P.ageGateModal({ base, closeHref: `${base}${req.store.checkout.source}`, values: req.body, error }), 400)
  req.store.ageVerified = true
  res.redirect(nextGate(req, res))
})

// ---- other product pages ----
function otherProduct(req, res, p) {
  rememberProduct(req,p.id)
  const m = modalFor(req, res)
  if (m.redirect) return res.redirect(m.redirect)
  const popover = req.query.added && p.sale === 'direct' ? P.addedPopover({ base: res.locals.base, item: bySku(p.variants?.some(v=>v.id===req.query.variant)?`${p.sku}:${req.query.variant}`:p.sku), closeHref: `${res.locals.base}${p.path}` }) : ''
  render(req, res, p.title, P.otherProductPage({ base: res.locals.base, p, popover, modal: m.html, variantId:typeof req.query.variant==='string'?req.query.variant:'' }))
}
router.get('/game/:slug', (req, res) => { const p = byPath(`/game/${req.params.slug}`); return p ? otherProduct(req, res, p) : notFound(req, res) })
router.get('/merchandise/:slug', (req, res) => { const p = byPath(`/merchandise/${req.params.slug}`); return p ? otherProduct(req, res, p) : notFound(req, res) })

// ---- merchandise cart (Buy Now / Add to Cart / Go To Cart / PROCEED TO CHECKOUT) ----
function directItem(body) {
 const raw=bySku(body.sku)
 if(!raw || raw.kind!=='other'||raw.product.sale!=='direct')return null
 if(raw.product.variants) {
  const variant=raw.product.variants.find(v=>v.id===body.variant)
  if(!variant)return null
  return bySku(`${raw.product.sku}:${variant.id}`)
 }
 return raw
}
function purchaseError(req,res,message) {
 const p=bySku(req.body.sku)?.product
 return p?render(req,res,p.title,P.otherProductPage({base:res.locals.base,p,variantId:req.body.variant,error:message}),400):render(req,res,'Unavailable product',P.simplePage({title:'Unavailable product',html:'<p>Select a product from the store.</p>'}),400)
}
router.post('/buy-now',(req,res)=>{
 const it=directItem(req.body)
 if(!it||!it.stock)return purchaseError(req,res,'Select an available option before buying.')
 if(req.body.qty!==undefined && req.body.qty!=='1')return purchaseError(req,res,'Buy Now accepts one item.')
 startCheckout(req.store,[{sku:it.sku,qty:1}],it.product.path)
 res.redirect(nextGate(req,res))
})
router.post('/cart/add',(req,res)=>{
 const it=directItem(req.body),qty=req.body.qty===undefined?1:Number(req.body.qty)
 if(!it||!Number.isInteger(qty)||qty<1||qty>MAX_QTY||!/^\d+$/.test(req.body.qty??'1'))return purchaseError(req,res,'Select an available option and a whole-number quantity.')
 const line=req.store.cart.find(l=>l.sku===it.sku)
 if((line?.qty||0)+qty>Math.min(MAX_QTY,it.stock))return purchaseError(req,res,'The requested quantity is not available.')
 if(line)line.qty+=qty;else req.store.cart.push({sku:it.sku,qty})
 invalidateCart(req)
 res.redirect(`${res.locals.base}${it.product.path}?added=1${it.variant?`&variant=${it.variant.id}`:''}`)
})
router.get('/cart', (req, res) => {
  enterScenarioCart(req.store)
  const m = modalFor(req, res)
  if (m.redirect) return res.redirect(m.redirect)
  render(req, res, 'My Cart', P.cartPage({ base: res.locals.base, t: totals(req.store.cart), modal: m.html }))
})
router.post('/cart/update',(req,res)=>{
 const line=req.store.cart.find(l=>l.sku===req.body.sku)
 if(!line)return purchaseError(req,res,'Select the exact cart item to update.')
 if(req.body.action==='remove')req.store.cart=req.store.cart.filter(l=>l!==line)
 else {
  const q=Number(req.body.qty),it=bySku(line.sku)
  if(!/^\d+$/.test(req.body.qty||'')||!Number.isInteger(q)||q<1||q>Math.min(MAX_QTY,it.stock??MAX_QTY)||req.body.action && req.body.action!=='update')return purchaseError(req,res,'Enter an available whole-number quantity.')
  line.qty=q
 }
 invalidateCart(req);res.redirect(`${res.locals.base}/cart`)
})
router.post('/cart/checkout',(req,res)=>{
 if(!validItems(req.store.cart))return render(req,res,'Check your cart',P.simplePage({title:'Check your cart',html:`<p>One or more items are unavailable. Review your quantities and options.</p><a href="${res.locals.base}/cart">Return to cart</a>`}),400)
 startCheckout(req.store,req.store.cart.map(l=>({...l})),'/cart');res.redirect(nextGate(req,res))
})

// ---- Rockstar Games Account (Social Club) sign-in; optional, guest checkout is always allowed ----
// Back into the checkout only when sign-in was started from the checkout modal (?return=checkout).
function afterAuth(req, res) {
  const base = res.locals.base
  if(resumeWishlist(req))return `${base}/wishlist`
  const target=authReturn(req.query.return,base)
  return target==='checkout'&&pending(req.store)?nextGate(req,res):target==='checkout'?`${base}/`:target
}
router.get('/signin', (req, res) => render(req, res, 'Sign In', P.signInPage({ base: res.locals.base, returnTo: String(req.query.return ?? '') })))
router.post('/signin', (req, res) => {
  const acct = authenticate(req.storeSlug, req.body.email, req.body.password)
  // ASSUMPTION: the Social Club error copy was not observed.
  if (!acct) return render(req, res, 'Sign In', P.signInPage({ base: res.locals.base, returnTo: String(req.query.return ?? ''), email: req.body.email, error: 'The email/nickname or password you entered is incorrect. Please try again.' }), 401)
  if(req.store.user?.id!==acct.id && pending(req.store)){accountChanged(req.store)}
  req.store.user = publicAccount(acct)
  Object.assign(req.store.user,retailState(req).preferences.profile||{})
  res.redirect(afterAuth(req, res))
})
router.get('/signup', (req, res) => render(req, res, 'Create Account', P.signUpPage({ base: res.locals.base, returnTo: String(req.query.return ?? '') })))
router.post('/signup', (req, res) => {
  const v = req.body, errors = {}
  for (const [k, label] of [['email', 'Email'], ['nickname', 'Nickname'], ['password', 'Password']]) if (!String(v[k] ?? '').trim()) errors[k] = `${label} is required.`
  if (v.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.email)) errors.email = 'Enter a valid email address.'
  if (v.password && v.password.length < 8) errors.password = 'Password must be at least 8 characters.'
  if (!Object.keys(errors).length) {
    const acct = createAccount(req.storeSlug, { email: v.email, password: v.password, nickname: String(v.nickname).trim(), country: COUNTRIES.some(c => c[0] === v.country) ? v.country : 'US' })
    if (acct.error) errors.email = acct.error
    else { if(pending(req.store)){accountChanged(req.store)} req.store.user = publicAccount(acct); return res.redirect(afterAuth(req, res)) }
  }
  render(req, res, 'Create Account', P.signUpPage({ base: res.locals.base, returnTo: String(req.query.return ?? ''), values: v, errors }), 400)
})
router.route('/signout').get(signout).post(signout)
function signout(req,res){req.store.user=null;req.store.checkout={};delete req.store.wishlistIntent;res.redirect(`${res.locals.base}/`)}

// ---- Xsolla Pay Station checkout: Shipping Address -> Shipping Method -> Payment -> status page ----
function guard(req, res, step) {
  const base = res.locals.base, co = pending(req.store)
  if (!co) { res.redirect(`${base}${GAME.path}`); return null }
  enterScenarioCart(req.store)
  if (!scenarioMethodAvailable(req, co, 'shipping') && !scenarioPickupEnabled(req.store)) {
    render(req, res, 'Item unavailable', P.simplePage({ title: 'Item unavailable', html: `<p role="alert">Shipping unavailable. This item became unavailable after it was selected. No order was placed.</p><a href="${base}${GAME.path}">Return to product</a>` }), 409)
    return null
  }
  if(co.stale){render(req,res,'Review your cart',P.simplePage({title:'Your cart has changed',html:`<p>Review your cart and restart checkout.</p><a href="${base}/cart">Return to cart</a>`}),409);return null}
  if(!validItems(co.items)){render(req,res,'Unavailable items',P.simplePage({title:'Check your items',html:`<p>One or more items or quantities are no longer available.</p><a href="${base}/cart">Return to cart</a>`}),409);return null}
  if (needsAgeGate(req.store)) { res.redirect(`${base}${withModal(co.source, 'verify-age')}`); return null }
  if(hasDigital(co)&&!req.store.user){res.redirect(`${base}/signin?return=checkout`);return null}
  if(digitalOnly(co)&&req.store.user){co.address={email:req.store.user.email,first_name:req.store.user.first_name||req.store.user.nickname||'',last_name:req.store.user.last_name||'',phone:''};co.shippingMethod='digital';if(step!=='payment'){res.redirect(`${base}/checkout/payment`);return null}return co}
  if (!req.store.user && !co.guest) { res.redirect(`${base}${withModal(co.source, 'checkout-gate')}`); return null }
  if (step !== 'shipping-address' && !co.address) { res.redirect(`${base}/checkout/shipping-address`); return null }
  if (step === 'payment' && !co.shippingMethod) { res.redirect(`${base}/checkout/shipping-method`); return null }
  if (step === 'payment' && !scenarioMethodAvailable(req, co, co.shippingMethod === 'pickup' ? 'pickup' : 'shipping', co.pickup?.store_id)) { shippingMethodPage(req, res, co, 409, 'Your selected fulfillment is no longer available. Choose an available option.'); return null }
  return co
}
const closeHrefOf = (res, co) => `${res.locals.base}${co.source}`

router.post('/checkout/guest', (req, res) => {
  const co = pending(req.store)
  if (!co) return res.redirect(`${res.locals.base}/`)
  if (needsAgeGate(req.store)) return res.redirect(nextGate(req, res))
  if(hasDigital(co))return res.redirect(`${res.locals.base}/signin?return=checkout`)
  co.guest = true
  res.redirect(`${res.locals.base}/checkout/shipping-address`)
})

router.get('/checkout/shipping-address', (req, res) => {
  const co = guard(req, res, 'shipping-address')
  if (!co) return
  const selector=req.query.address_id
  const addresses=req.store.user?retailState(req).addresses:[]
  if(selector!==undefined) {
    const selected=typeof selector==='string'&&addresses.find(a=>a.id===selector)
    if(!selected)return render(req,res,'Address unavailable',P.simplePage({title:'Address unavailable',html:'<p>Select one of your saved addresses.</p>'}),400)
    co.addressValues=savedAddressValues(selected,req.store.user);co.selectedAddress=selected.id
    delete co.address;delete co.shippingMethod;co.payValues={};co.payErrors={};co.reviewChanged=true
  }
  if (co.address) return res.redirect(`${res.locals.base}/checkout/shipping-method`) // submitted address stays locked unless an owned saved address is explicitly selected
  const saved=req.store.user?defaultAddress(req):null
  const values = { ...(co.addressValues ?? (saved?savedAddressValues(saved,req.store.user):{})) }
  const u = req.store.user
  if (u) { values.first_name ??= u.first_name; values.last_name ??= u.last_name; values.phone ??= u.phone; values.email ??= u.email }
  render(req, res, 'Shipping Address', P.shippingAddressStep({ base: res.locals.base, values, addresses, selectedAddress:co.selectedAddress||saved?.id, preorder: isPreorder(co), closeHref: closeHrefOf(res, co) }))
})
router.post('/checkout/shipping-address', (req, res) => {
  const co = guard(req, res, 'shipping-address')
  if (!co) return
  if (co.address) return res.redirect(`${res.locals.base}/checkout/shipping-method`)
  const v = req.body, errors = {}
  const t = (k) => String(v[k] ?? '').trim()
  for (const k of ['first_name', 'last_name', 'city', 'region', 'postal_code', 'street_address', 'phone', 'email']) if (!t(k)) errors[k] = 'Required'
  const country = v.country === undefined ? 'US' : v.country
  if (!COUNTRIES.some(c => c[0] === country)) errors.country = 'Choose a supported country.'
  // ASSUMPTION: only the empty-field "Required" state was observed; format messages are guesses.
  if (!errors.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(t('email'))) errors.email = 'Invalid email address'
  if (!errors.phone && (t('phone').replace(/\D/g, '').length < 7 || t('phone').replace(/\D/g, '').length > 15)) errors.phone = 'Invalid phone number'
  if (!errors.postal_code && country === 'US' && !/^\d{5}(-\d{4})?$/.test(t('postal_code'))) errors.postal_code = 'Invalid Postal Code'
  co.addressValues = { ...Object.fromEntries(['first_name','last_name','city','region','postal_code','street_address','apartment','phone','email'].map(k=>[k,t(k)])), country }
  if (Object.keys(errors).length) return render(req, res, 'Shipping Address', P.shippingAddressStep({ base: res.locals.base, values: co.addressValues, errors, addresses:req.store.user?retailState(req).addresses:[], selectedAddress:co.selectedAddress, preorder: isPreorder(co), closeHref: closeHrefOf(res, co) }), 400)
  co.address = { country, first_name: t('first_name'), last_name: t('last_name'), city: t('city'), state: t('region'), postal_code: t('postal_code'), line1: t('street_address'), line2: t('apartment') || null, phone: t('phone'), email: t('email').toLowerCase() }
  res.redirect(`${res.locals.base}/checkout/shipping-method`)
})

router.get('/checkout/shipping-method', (req, res) => {
  const co = guard(req, res, 'shipping-method')
  if (!co) return
  shippingMethodPage(req, res, co)
})
router.post('/checkout/shipping-method', (req, res) => {
  const co = guard(req, res, 'shipping-method')
  if (!co) return
  const m = req.body.shipping_method
  if (m === 'pickup' && scenarioPickupEnabled(req.store)) {
    const location = BENCHMARK_PICKUP_STORES.find(location => location.id === req.body.pickup_store)
    const person = Object.fromEntries(['first_name', 'last_name', 'email', 'phone'].map(key => [key, String(req.body[`pickup_${key}`] || '').trim()]))
    const pickup = { store_id: location?.id || '', store_name: location?.name || '', person }
    if (!location || !scenarioMethodAvailable(req, co, 'pickup', location.id)) return shippingMethodPage(req, res, co, 400, 'Choose an available pickup location.', pickup)
    if (Object.values(person).some(value => !value) || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(person.email) || !/^\d{7,15}$/.test(person.phone.replace(/\D/g, ''))) return shippingMethodPage(req, res, co, 400, 'Enter the pickup person’s name, valid email and phone.', pickup)
    co.pickup = pickup
  } else if (!Object.hasOwn(SHIPPING_METHODS, m) || !scenarioMethodAvailable(req, co, 'shipping')) return shippingMethodPage(req, res, co, 400, 'Please select an available shipping method.')
  else delete co.pickup
  co.shippingMethod = m
  co.reviewChanged = true
  res.redirect(`${res.locals.base}/checkout/payment`)
})

router.get('/checkout/payment', (req, res) => {
  const co = guard(req, res, 'payment')
  if (!co) return
  paymentPage(req,res,co)
})
router.post('/checkout/payment', (req, res) => {
  const co = guard(req, res, 'payment')
  if (!co) return
  if(co.reviewChanged || co.reviewFingerprint && co.reviewFingerprint!==reviewFingerprint(req,co) || req.body.review_token!==undefined&&req.body.review_token!==co.reviewToken)return paymentPage(req,res,co,409,'Your order review changed. Check the updated details and submit payment again.')
  const v = req.body, errors = {}
  if(v.payment_method!==undefined&&!['card','paypal'].includes(v.payment_method))return paymentPage(req,res,co,400,'Choose an available payment method.')
  const pm = v.payment_method === 'paypal' ? 'paypal' : 'card'
  let payment
  if (pm === 'card') {
    const card = validateCard({ number: v.card_number, expiry: v.expiry, cvv: v.cvc })
    if (!card.ok) { if (card.errors.number) errors.card_number = card.errors.number; if (card.errors.expiry) errors.expiry = card.errors.expiry; if (card.errors.cvv) errors.cvc = card.errors.cvv }
    if (!String(v.cardholder_name ?? '').trim()) errors.cardholder_name = 'Required'
    if (!Object.keys(errors).length) payment = { method: 'card', brand: card.brand, last4: card.last4, name_on_card: String(v.cardholder_name).trim() }
  } else payment = { method: 'paypal' }
  co.payValues = {payment_method:pm,cardholder_name:v.cardholder_name||''}
  co.payErrors=errors
  if(Object.keys(errors).length)return paymentPage(req,res,co,400)
  const rejected = scenarioPayment(req.store, payment, co.items)
  if (rejected) return paymentPage(req, res, co, 402, rejected)

  const t = totals(co.items, co.shippingMethod)
  const a = co.address
  const physicalAddress = digitalOnly(co)?null:{ first_name: a.first_name, last_name: a.last_name, line1: a.line1, line2: a.line2, city: a.city, state: a.state, postal_code: a.postal_code, country: a.country, phone: a.phone }
  const shipTo = co.shippingMethod === 'pickup' ? null : physicalAddress
  const token = randomBytes(12).toString('hex')
  const order = recordOrder({
    store: req.storeSlug,
    order_number: transactionId(),
    session: req.session,
    items: t.lines.map(l => l.item.kind === 'game'
      ? { platform: l.item.platform, edition: l.item.edition, format: l.item.format, qty: l.qty, unit_price: l.item.price, title: l.item.title, sku: l.item.sku }
      : { kind: 'other', title: l.item.title, qty: l.qty, unit_price: l.item.price, sku: l.item.sku }),
    customer: { email: a.email, first_name: a.first_name, last_name: a.last_name, phone: a.phone, account_id: req.store.user?.id ?? null, guest: !req.store.user },
    fulfillment: digitalOnly(co)?{method:'digital',option:'rockstar-launcher',eta:'Assigned to the purchasing Rockstar Games account'}:co.shippingMethod === 'pickup' ? { method: 'pickup', option: 'pickup', store_location: co.pickup.store_name, eta: 'Collect when ready with photo ID' }:{ method:'ship',option:co.shippingMethod,eta:deliveryEta(co.shippingMethod,isPreorder(co)) },
    shipping_address: shipTo,
    billing_address: physicalAddress?{ ...physicalAddress }:null, // The submitted address is the buyer's billing address when collecting.
    payment,
    totals: { subtotal: t.subtotal, shipping: t.shipping, tax: t.tax, total: t.total },
    currency: 'USD',
    meta: { token, account_id:req.store.user?.id||null, ...(co.pickup ? { pickup_store_id: co.pickup.store_id, pickup_person: co.pickup.person, items_fulfillment: t.lines.map(l => ({ sku: l.sku, fulfillment: 'pickup' })) } : {}), options:t.lines.map(l=>({sku:l.sku,options:l.item.options||{},quantity:l.qty})), entitlements:t.lines.filter(l=>l.item.product.delivery==='digital').map(l=>({product_id:l.item.product.id,title:l.item.title,sku:l.sku,label:l.item.variant?.label||'PC game',account_id:req.store.user.id})), xsolla_project: XSOLLA_PROJECT, source: co.source, preorder: isPreorder(co), save_payment: false },
  })
  if (co.source === '/cart') req.store.cart = []
  req.store.checkout = {}
  res.redirect(`${res.locals.base}/checkout/status?transaction_id=${order.order_number}&token=${token}`)
})

router.get('/checkout/status', (req, res) => {
  const order = getOrder(String(req.query.transaction_id ?? ''))
  if (!order || typeof req.query.transaction_id!=='string' || typeof req.query.token!=='string' || !privateOrder(req,order.id) || order.meta.token !== req.query.token) return render(req, res, 'Payment status', P.simplePage({ title: 'Transaction not found', html: `<p>We couldn't find that transaction.</p><a class="rs-btn rs-btn-primary" href="${res.locals.base}/">Back to Store</a>` }), 404)
  render(req, res, 'Payment status', P.statusPage({ base: res.locals.base, order }))
})

router.use(notFound)

export default {
  slug: 'rockstar-store',
  name: NAME,
  country: 'US',
  currency: 'USD',
  description: 'US. Code-in-box PS5/Xbox sold direct with no cart step: age gate, sign-in-or-guest modal, Xsolla-style 3-step checkout; digital editions link out.',
  router,
}
