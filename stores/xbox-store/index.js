import { readShipping } from '../playstation-store/physical.js'
import { Router } from 'express'
import { randomBytes, randomInt } from 'node:crypto'
import { recordOrder, getOrder } from '../../lib/orders.js'
import { validateCard } from '../../lib/payment.js'
import { enterScenarioCart, scenarioAvailability, scenarioPayment, scenarioActive, registerScenarioAdapter } from '../../lib/benchmark-scenarios.js'
import { authenticate, createAccount, findAccount, publicAccount } from '../../lib/accounts.js'
import { filterProducts, PRODUCTS, CATALOG, byId, editions, search, totals, priceTotals, productPath, STATES, RELEASE, isBuyable, familyEditions, COLLECTIONS, queryOptions, FACETS, facetValues } from './data.js'
import * as P from './pages.js'
import { installSite } from './site.js'
import { shelfArt } from './shelf-art.js'
import { installJourneys, resumeAccount } from './journeys.js'
import { owns, lifecycle, token as serviceToken } from './journey-state.js'
import { directFingerprint, cartValid, cartFingerprint, review, matchesReview, safeValues, toOrderItem, entitlements } from './purchase.js'

const NAME = 'Xbox Store'
// Platforms and genres xbox.com lists stay browsable (with an empty state) even when the catalog has no title for them.
const KNOWN_VALUES = { platform: ['Xbox Series X|S', 'Xbox One', 'PC', 'Cloud', 'Handheld'], genre: ['Action & adventure', 'Platformer', 'Family & kids', 'Racing & flying', 'Role playing', 'Shooter', 'Sports', 'Strategy', 'Fighting'] }
const router = Router()
registerScenarioAdapter('xbox-store', { lines: store => [...store.cart, ...(store.checkout.scenarioItems || [])] })
router.use((req,res,next)=>{
  if(req.method==='POST' && Object.values(req.body||{}).some(v=>typeof v!=='string')) return render(req,res,'Check your request',P.simplePage({title:'Check your request',html:'<p>Each form field must have a single value. Please return to the form and try again.</p>'}),{status:400})
  next()
})

// ---- helpers ----
function render(req, res, title, body, { status = 200, theme = 'light' } = {}) {
  res.status(status).type('html').send(P.layout({ base: res.locals.base, title, body, cartCount: req.store.cart.length, user: req.store.user, theme, path: req.originalUrl }))
}
function renderAuth(req, res, title, body, status = 200) {
  res.status(status).type('html').send(P.authLayout({ base: res.locals.base, title, body }))
}
// ASSUMPTION: 10-digit numeric Microsoft Store order number (same shape as the 10-digit cart id).
const tenDigits = () => String(randomInt(1_000_000_000, 10_000_000_000))
function invalidateIdentityReviews(req) {
  delete req.store.journeyReviews
  delete req.store.pendingOrderAction
  delete req.store.checkout.purchase
  for(const key of ['paymentReview','cartReview']) if(req.store.checkout[key]) req.store.checkout[key]={token:'invalidated',fingerprint:'identity-changed'}
}

const savedMethods = (req) => (req.store.user && findAccount(req.storeSlug, req.store.user.email)?.payment_methods) || []
function signinWall(req, res, returnTo) {
  req.store.checkout.returnTo = returnTo
  res.redirect(P.signinUrl(res.locals.base))
}
const notFound = (req, res) => render(req, res, 'Page not found', P.simplePage({ title: 'Sorry, we can\'t find that page', html: `<p>The item may no longer be available.</p><a class="xb-btn xb-btn-buy" href="${res.locals.base}/">Go to Xbox home</a>` }), { status: 404 })

// Reads the payment picker (purchase dialog and cart checkout share it). Returns { payment, billing, values, errors }.
function readPayment(req, saved) {
  const v = safeValues(req.body)
  const errors = {}
  const chosen = typeof v.pi==='string' && /^(0|[1-9][0-9]*)$/.test(v.pi) ? saved[Number(v.pi)] : null
  if(v.pi!==undefined && v.pi!=='new' && !chosen) errors.pi='Choose an available payment method.'
  if(v.payType!==undefined && !['card','paypal','venmo'].includes(v.payType)) errors.payType='Choose a supported payment type.'
  if(v.country!==undefined && v.country!=='US') errors.country='Choose United States for this store.'
  if(Object.keys(errors).length) return {values:v,errors}
  if (chosen) return { payment: chosen.payment, billing: chosen.billing, values: v, errors }
  const payType = ['card', 'paypal', 'venmo'].includes(v.payType) ? v.payType : 'card'
  // ASSUMPTION: PayPal / Venmo would bounce to the provider's site; the clone treats them as approved eWallets.
  if (payType !== 'card') return { payment: { method: payType }, billing: null, values: v, errors }
  const card = validateCard({ number: req.body.cardNumber, exp_month: v.expMonth, exp_year: v.expYear, cvv: req.body.cvv })
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

function placeOrder(req, { items, payment, billing, t, path, shipping = null }) {
  const user = req.store.user
  const token = randomBytes(12).toString('hex')
  const preorder = items.some(i => byId(i.sku)?.ribbon === 'PRE-ORDER')
  const unlocks = [...new Set(items.filter(i=>byId(i.sku)?.ribbon==='PRE-ORDER').map(i=>byId(i.sku).release))].join(', ')
  const order = recordOrder({
    store: req.storeSlug,
    order_number: tenDigits(),
    session: req.session,
    items,
    customer: { email: user.email, first_name: user.first_name ?? '', last_name: user.last_name ?? '', phone: user.phone ?? '', account_id: user.id, guest: false },
    fulfillment: { method: shipping?'shipping':'digital', eta: shipping?'Free standard shipping · 3–5 business days':preorder ? `Unlocks on release, ${unlocks}; pre-download available before release` : 'Available now in My games & apps' },
    shipping_address: shipping,
    billing_address: billing,
    payment,
    totals: { subtotal: t.subtotal, shipping: 0, tax: t.tax, total: t.total },
    currency: 'USD',
    meta: { token, path, preorder, account_id:user.id, physical_items:items.filter(i=>byId(i.sku)?.physical).map(i=>({sku:i.sku,platform:byId(i.sku).catalogPlatform,format:byId(i.sku).formatLabel})), entitlements:entitlements(items), charge_timing: preorder && ['card', 'paypal', 'venmo'].includes(payment.method) ? shipping?'physical items immediately; digital pre-orders about 10 days before release':'about 10 days before release' : 'immediately' },
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
router.get('/', (req, res) => render(req, res, 'Xbox Official Site: Consoles, Games, and Community', P.homePage({ base: res.locals.base, products: PRODUCTS, user: req.store.user })))

// Result tabs: query type -> product type.
const TYPE_OF={games:'game','add-ons':'add-on',hardware:'hardware','gift-cards':'gift-card'}
const TAB_OF=Object.fromEntries(Object.entries(TYPE_OF).map(([tab,type])=>[type,tab]))
function browse(req,res,{title,scope=CATALOG,route,defaultType='games',defaultSort}={}) {
  const options=queryOptions(req.query)
  // Reference mode lists unsearched pages by popularity (or the collection's own order), like xbox.com's default sort.
  if(!fixtureCatalog&&!options.sort&&!(options.q||'').trim())options.sort=defaultSort||'popular'
  const q=(options.q||'').trim(), type=[...Object.keys(TYPE_OF),'all'].includes(options.type)?options.type:defaultType
  const matches=q?search(q,type):null
  const count=t=>scope.filter(p=>(t==='all'||p.type===t)&&(!q||search(q,t==='all'?'all':TAB_OF[t]).some(x=>x.id===p.id))).length
  const scopeIds=new Set(scope.map(p=>p.id))
  const items=(matches||scope).filter(p=>scopeIds.has(p.id)&&(type==='all'||p.type===TYPE_OF[type]))
  render(req,res,title||'Browse games',P.searchPage({base:res.locals.base,q,type,title,route,results:filterProducts(items,options),counts:{games:count('game'),addons:count('add-on'),hardware:count('hardware'),giftcards:count('gift-card'),all:count('all')},options}))
}
router.get('/en-US/search/results',(req,res)=>{
  if(req.query.type==='subscriptions')return res.redirect(`${res.locals.base}/en-US/xbox-game-pass`)
  if(req.query.type==='support')return res.redirect(`${res.locals.base}/en-US/support`)
  browse(req,res)
})
router.get(['/en-US/games/all-games/console','/en-US/games/browse'],(req,res)=>browse(req,res,{route:req.baseUrl+req.path}))
router.get('/en-US/games/all-games/pc',(req,res)=>browse(req,res,{title:'Browse all PC games',scope:CATALOG.filter(p=>p.platforms.includes('PC')),route:req.baseUrl+req.path}))
router.get('/en-US/games/collection/:collection',(req,res)=>{
  const c=COLLECTIONS.find(c=>c.id===req.params.collection)
  if(!c)return notFound(req,res)
  browse(req,res,{title:c.title,scope:CATALOG.filter(c.test),route:req.baseUrl+req.path,defaultType:c.type||'games',defaultSort:{'new-releases':'release',deals:'discount','coming-soon':'release'}[c.id]})
})
router.get(['/en-US/games/genres','/en-US/games/platforms'],(req,res)=>render(req,res,'Explore Xbox games',P.hubPage({base:res.locals.base,kind:req.path.endsWith('genres')?'genres':'platforms'})))
router.get('/en-US/games/:dimension/:value',(req,res,next)=>{
  if(!['genre','platform'].includes(req.params.dimension))return next()
  const f=FACETS.find(f=>f.key===req.params.dimension),value=req.params.value
  if(!facetValues(f).some(([v])=>v===value)&&!(KNOWN_VALUES[f.key]||[]).includes(value))return notFound(req,res)
  browse(req,res,{title:`${value} games`,scope:CATALOG.filter(p=>p[f.field].includes(value)),route:req.baseUrl+req.path})
})
router.get('/en-US/xbox-game-pass',(req,res)=>render(req,res,'Xbox Game Pass',P.gamePassPage({base:res.locals.base})))
router.get('/en-US/more',(req,res)=>render(req,res,'Explore Xbox',P.hubPage({base:res.locals.base,kind:'genres'})))

installSite(router, { render, tile: P.tile })
installJourneys(router, {render,signinWall,notFound})

// Consoles and accessories: Microsoft Store browse and product pages.
router.get('/en-US/store/b/xbox-accessories',(req,res)=>browse(req,res,{title:'Shop Xbox consoles & accessories',scope:CATALOG.filter(p=>p.type==='hardware'),route:req.baseUrl+req.path,defaultType:'hardware'}))
router.get('/en-US/d/:slug/:id',(req,res)=>{
  const p=byId(req.params.id)
  if(!p||!p.physical||!p.shelf)return notFound(req,res)
  if(req.params.slug!==p.slug)return res.redirect(productPath(res.locals.base,p))
  render(req,res,`${p.title} | Microsoft Store`,P.hardwarePage({base:res.locals.base,p,inCart:req.store.cart.some(l=>l.pid===p.id),added:req.query.added==='1'}))
})
router.get('/shelf-art/:id/:view.svg',(req,res)=>{
  const svg=shelfArt(byId(req.params.id),req.params.view)
  if(!svg)return res.status(404).type('text').send('Image not found')
  res.set('Cache-Control','public, max-age=3600').type('image/svg+xml').send(svg)
})

router.get('/art/:file', (req, res) => {
  const p = byId(String(req.params.file).replace(/\.svg$/, ''))
  if (!p) return res.status(404).end()
  res.type('image/svg+xml').send(P.coverArt(p))
})

function related(p) {
  const list = ids => (ids ?? []).map(byId).filter(Boolean)
  return { bundle: list(p.bundle), includedIn: list(p.includedIn), addons: list(p.addons), recommendations:CATALOG.filter(x=>x.family!==p.family&&x.type==='game'&&!(p.editions||[]).includes(x.id)&&isBuyable(x)&&x.genres.some(g=>p.genres.includes(g))).slice(0,p.shelf?8:4) }
}
function ownedResponse(req,res,p) {
  return render(req,res,'You own this item',P.simplePage({title:'You already own this item',html:`<p>This digital license is in your account library.</p><a class="xb-btn xb-btn-buy" href="${res.locals.base}/account/library">View my library</a>`}),{status:409})
}
function productHtml(req, res, p) {
  if(scenarioAvailability(req.store,p.id,'digital')===false)p={...p,available:false,purchasable:false}
  const menuOpen = req.store.menuOpen === p.id // one-shot flag set by the silent "Add to cart"
  delete req.store.menuOpen
  return P.productPage({ base: res.locals.base, p, editions: familyEditions(p), related: related(p), owned: owns(req,p), wishlistToken:req.store.user?serviceToken(req,`wishlist-${p.id}`,p.id):null, inCart: req.store.cart.some(l => l.pid === p.id), menuOpen })
}

router.get('/en-US/games/store/:slug/:id', (req, res) => {
  const p = byId(req.params.id)
  if (!p) return notFound(req, res)
  if (req.params.slug !== p.slug || (p.shelf && p.physical)) return res.redirect(productPath(res.locals.base, p))
  render(req, res, `${p.purchasable ? 'Buy ' : ''}${p.title}`, productHtml(req, res, p), { theme: 'dark' })
})

// ---- direct purchase: PRE-ORDER button -> sign-in wall -> Microsoft Store purchase dialog ----
router.post('/en-US/games/store/:slug/:id/preorder', (req, res) => {
  const p = byId(req.params.id)
  if (!isBuyable(p) || req.params.slug !== p.slug) return notFound(req, res)
  if(p.physical){if(!req.store.cart.some(l=>l.pid===p.id))req.store.cart.push({pid:p.id});return res.redirect(`${res.locals.base}/en-US/cart`)}
  if (owns(req,p)) return ownedResponse(req,res,p)
  const buyUrl = `${productPath(res.locals.base, p)}/buy`
  if (!req.store.user) return signinWall(req, res, buyUrl)
  res.redirect(buyUrl)
})

// Direct checkout and final confirmation both check the selected offer.
// Saving a payment instrument is separate from authorizing the purchase.
router.use('/en-US/games/store/:slug/:id/buy', (req,res,next)=>{
 const p=byId(req.params.id)
 if(req.store.user&&isBuyable(p)&&req.params.slug===p.slug){
  if(scenarioActive(req.store))req.store.checkout.scenarioItems=[{sku:p.id,qty:1}]
  enterScenarioCart(req.store,[{sku:p.id,qty:1}])
  if(scenarioAvailability(req.store,p.id,'digital')===false)return render(req,res,'Item unavailable',P.simplePage({title:'Item unavailable',html:`<p role="alert">This digital item became unavailable after it was selected. No order was placed.</p><a href="${productPath(res.locals.base,p)}">Return to product</a>`}),{status:409})
 }
 next()
})
router.get('/en-US/games/store/:slug/:id/buy', (req, res) => {
  const p = byId(req.params.id)
  if (!isBuyable(p) || req.params.slug !== p.slug) return notFound(req, res)
  if(p.physical)return res.redirect(`${res.locals.base}/en-US/cart`)
  if (!req.store.user) return signinWall(req, res, `${productPath(res.locals.base, p)}/buy`)
  if (owns(req,p)) return ownedResponse(req,res,p)
  const paymentToken = review(req,'paymentReview',directFingerprint(req,p))
  const dialog = P.payDialog({ base: res.locals.base, p, t: priceTotals(p.price), saved: savedMethods(req), paymentToken })
  render(req, res, `Buy ${p.title}`, P.dialogOver({ pageBody: productHtml(req, res, p), dialog }), { theme: 'dark' })
})

router.post('/en-US/games/store/:slug/:id/buy', (req, res) => {
  const p = byId(req.params.id)
  if (!isBuyable(p) || req.params.slug !== p.slug) return notFound(req, res)
  if(p.physical)return res.redirect(`${res.locals.base}/en-US/cart`)
  if (!req.store.user) return signinWall(req, res, `${productPath(res.locals.base, p)}/buy`)
  if (owns(req,p)) return ownedResponse(req,res,p)
  const saved = savedMethods(req)
  if(!matchesReview(req,'paymentReview',directFingerprint(req,p),req.body.payment_token)) {
    const paymentToken=review(req,'paymentReview',directFingerprint(req,p))
    const dialog=P.payDialog({base:res.locals.base,p,t:priceTotals(p.price),saved,values:safeValues(req.body),errors:{review:'Your selection or account changed. Review the current details and try again.'},paymentToken})
    return render(req,res,'Review your purchase',P.dialogOver({pageBody:productHtml(req,res,p),dialog}),{status:409,theme:'dark'})
  }
  const { payment, billing, values, errors } = p.price===0 ? {payment:{method:'free'},billing:null,values:{},errors:{}} : readPayment(req, saved)
  if (Object.keys(errors).length) {
    const dialog = P.payDialog({ base: res.locals.base, p, t: priceTotals(p.price), values, errors, saved, paymentToken:req.store.checkout.paymentReview?.token })
    return render(req, res, `Buy ${p.title}`, P.dialogOver({ pageBody: productHtml(req, res, p), dialog }), { status: 400, theme: 'dark' })
  }
  saveCard(req, payment, billing)
  req.store.checkout.purchase = { pid:p.id, payment, billing, fingerprint:directFingerprint(req,p,payment,billing), token:randomBytes(18).toString('hex') }
  res.redirect(`${productPath(res.locals.base, p)}/buy/confirm`)
})

router.get('/en-US/games/store/:slug/:id/buy/confirm', (req, res) => {
  const p = byId(req.params.id)
  if (!isBuyable(p) || req.params.slug !== p.slug) return notFound(req, res)
  if(p.physical)return res.redirect(`${res.locals.base}/en-US/cart`)
  if (!req.store.user) return signinWall(req, res, `${productPath(res.locals.base, p)}/buy`)
  if (owns(req,p)) return ownedResponse(req,res,p)
  const pending = req.store.checkout.purchase
  if (!pending || pending.pid !== p.id) return res.redirect(`${productPath(res.locals.base, p)}/buy`)
  if(pending.fingerprint!==directFingerprint(req,p,pending.payment,pending.billing) || (req.method==='POST'&&req.body.confirm_token!==undefined&&req.body.confirm_token!==pending.token)) {
    delete req.store.checkout.purchase
    return render(req,res,'Review your purchase',P.simplePage({title:'Your purchase details changed',html:`<p>Review the current price, availability and account before placing your order.</p><a class="xb-btn xb-btn-buy" href="${productPath(res.locals.base,p)}/buy">Review purchase</a>`}),{status:409})
  }
  const dialog = P.confirmDialog({ base: res.locals.base, p, payment: pending.payment, billing: pending.billing, t: priceTotals(p.price), confirmToken:pending.token })
  render(req, res, `Confirm payment - ${p.title}`, P.dialogOver({ pageBody: productHtml(req, res, p), dialog }), { theme: 'dark' })
})

router.post('/en-US/games/store/:slug/:id/buy/confirm', (req, res) => {
  const p = byId(req.params.id)
  if (!isBuyable(p) || req.params.slug !== p.slug) return notFound(req, res)
  if(p.physical)return res.redirect(`${res.locals.base}/en-US/cart`)
  if (!req.store.user) return signinWall(req, res, `${productPath(res.locals.base, p)}/buy`)
  if (owns(req,p)) return ownedResponse(req,res,p)
  const pending = req.store.checkout.purchase
  if (!pending || pending.pid !== p.id) return res.redirect(`${productPath(res.locals.base, p)}/buy`)
  if(pending.fingerprint!==directFingerprint(req,p,pending.payment,pending.billing) || (req.method==='POST'&&req.body.confirm_token!==undefined&&req.body.confirm_token!==pending.token)) {
    delete req.store.checkout.purchase
    return render(req,res,'Review your purchase',P.simplePage({title:'Your purchase details changed',html:`<p>Review the current price, availability and account before placing your order.</p><a class="xb-btn xb-btn-buy" href="${productPath(res.locals.base,p)}/buy">Review purchase</a>`}),{status:409})
  }
  const item = toOrderItem(p)
  const rejection=scenarioPayment(req.store,pending.payment,[item])
  if(rejection)return render(req,res,'Payment declined',P.dialogOver({pageBody:productHtml(req,res,p),dialog:P.confirmDialog({base:res.locals.base,p,payment:pending.payment,billing:pending.billing,t:priceTotals(p.price),confirmToken:pending.token,error:rejection})}),{status:402,theme:'dark'})
  const { order, token } = placeOrder(req, { items: [item], payment: pending.payment, billing: pending.billing, t: priceTotals(p.price), path: 'direct' })
  delete req.store.checkout.purchase
  req.store.cart = req.store.cart.filter(l => l.pid !== p.id)
  res.redirect(`${res.locals.base}/en-US/purchase/complete?order=${order.order_number}&token=${token}`)
})

router.get('/en-US/purchase/complete', (req, res) => {
  const order = getOrder(String(req.query.order ?? ''))
  if (!order || order.store !== req.storeSlug || order.meta.token !== req.query.token || order.session_id !== req.session.id || !req.store.user || order.customer.account_id !== req.store.user.id || order.meta.account_id !== req.store.user.id) return render(req, res, 'Order not found', P.simplePage({ title: 'Order not found', html: `<p>We couldn't find that order. Check <a href="${res.locals.base}/account/billing/orders">Order history</a>.</p>` }), { status: 404 })
  if(['cancelled','return_requested'].includes(lifecycle(order)))return res.redirect(`${res.locals.base}/account/billing/orders/${order.order_number}`)
  const p = byId(order.items[0]?.sku)
  const body = order.meta.path === 'direct' && p
    ? P.dialogOver({ pageBody: productHtml(req, res, p), dialog: P.thanksCard({ base: res.locals.base, order, p }) })
    : P.thanksPage({ base: res.locals.base, order, p })
  render(req, res, 'Thanks for your purchase', body, { theme: 'dark' })
})

// ---- cart path: "..." -> Add to cart -> Cart -> Checkout ----
router.post('/en-US/cart/add', (req, res) => {
  const p = byId(req.body.pid)
  if (!isBuyable(p)) return notFound(req,res)
  if (owns(req,p)) return ownedResponse(req,res,p)
  // A digital licence is one per account: re-adding does not create a second line.
  if (!req.store.cart.some(l => l.pid === p.id)) req.store.cart.push({ pid: p.id })
  req.store.saved = (req.store.saved ?? []).filter(id => id !== p.id)
  if (p.shelf && p.physical) return res.redirect(`${productPath(res.locals.base, p)}?added=1`)
  req.store.menuOpen = p.id
  res.redirect(productPath(res.locals.base, p)) // silent add: no modal or toast, the open menu's entry becomes "Open cart"
})

router.get('/en-US/cart', (req, res) => {
  enterScenarioCart(req.store)
  req.store.cartId ??= tenDigits()
  const saved = (req.store.saved ?? []).map(id => ({ product: byId(id) })).filter(l => l.product)
  const unavailable=req.store.cart.some(l=>scenarioAvailability(req.store,l.pid,'digital')===false)
  render(req, res, 'Shopping cart', (unavailable?'<p class="xb-error-summary" role="alert">An item in your cart became unavailable. Remove it before checkout.</p>':'')+P.cartPage({ base: res.locals.base, t: totals(req.store), saved, cartId: req.store.cartId }), { theme: 'dark' })
})

router.post('/en-US/cart/update', (req, res) => {
  const pid = String(req.body.pid ?? '')
  const action = req.body.action
  if(!['remove','save','move'].includes(action)||!byId(pid))return render(req,res,'Invalid cart update',P.simplePage({title:'Check your cart selection',html:`<p>Choose an available item and cart action.</p><a href="${res.locals.base}/en-US/cart">Return to cart</a>`}),{status:400})
  if (action === 'remove' || action === 'save') req.store.cart = req.store.cart.filter(l => l.pid !== pid)
  if (action === 'save' && isBuyable(byId(pid)) && !(req.store.saved ?? []).includes(pid)) req.store.saved = [...(req.store.saved ?? []), pid]
  if (action === 'move' && isBuyable(byId(pid)) && !owns(req,byId(pid))) {
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

router.use('/en-US/checkout',(req,res,next)=>{
 if(scenarioActive(req.store))req.store.checkout.scenarioItems=[]
 enterScenarioCart(req.store)
 if(req.store.cart.some(l=>scenarioAvailability(req.store,l.pid,'digital')===false))return render(req,res,'Item unavailable',P.simplePage({title:'Item unavailable',html:`<p role="alert">A digital item in your cart became unavailable. No order was placed.</p><a href="${res.locals.base}/en-US/cart">Return to cart</a>`}),{status:409})
 next()
})
router.get('/en-US/checkout', (req, res) => {
  if (!req.store.cart.length) return res.redirect(`${res.locals.base}/en-US/cart`)
  if (!req.store.user) return signinWall(req, res, `${res.locals.base}/en-US/checkout`)
  if(!cartValid(req))return render(req,res,'Cart changed',P.simplePage({title:'Review your cart',html:`<p>An item is no longer available to purchase.</p><a href="${res.locals.base}/en-US/cart">Return to cart</a>`}),{status:409})
  const checkoutToken=review(req,'cartReview',cartFingerprint(req))
  render(req, res, 'Checkout', P.checkoutPage({ base: res.locals.base, user: req.store.user, t: totals(req.store), saved: savedMethods(req), checkoutToken }), { theme: 'dark' })
})

router.post('/en-US/checkout', (req, res) => {
  const base = res.locals.base
  if (!req.store.cart.length) return res.redirect(`${base}/en-US/cart`)
  if (!req.store.user) return signinWall(req, res, `${base}/en-US/checkout`)
  const saved = savedMethods(req)
  const t = totals(req.store)
  if(!cartValid(req) || !matchesReview(req,'cartReview',cartFingerprint(req),req.body.checkout_token)) {
    const checkoutToken=review(req,'cartReview',cartFingerprint(req))
    return render(req,res,'Review your cart',P.checkoutPage({base,user:req.store.user,t,saved,values:safeValues(req.body),errors:{review:'Your cart or account changed. Review the current items and total before placing your order.'},checkoutToken}),{status:409,theme:'dark'})
  }
  if(req.body.action!==undefined&&!['place','promo'].includes(req.body.action))return render(req,res,'Check your request',P.simplePage({title:'Invalid checkout action',html:'<p>Return to checkout and choose Place order.</p>'}),{status:400})
  const checkoutToken=req.store.checkout.cartReview?.token || review(req,'cartReview',cartFingerprint(req))
  if (req.body.action === 'promo') {
    // ASSUMPTION: no promo code applies to this pre-order; the real wording of the rejection was not observed.
    const values = { ...req.body, cardNumber: '', cvv: '' }
    const promoError = String(req.body.promo ?? '').trim() ? 'That promo code isn\'t valid for the items in your cart.' : 'Enter a promo code.'
    return render(req, res, 'Checkout', P.checkoutPage({ base, user: req.store.user, t, values, saved, promoError, checkoutToken }), { theme: 'dark' })
  }
  const { payment, billing, values, errors } = t.total===0 ? {payment:{method:'free'},billing:null,values:{},errors:{}} : readPayment(req, saved)
  if (Object.keys(errors).length) return render(req, res, 'Checkout', P.checkoutPage({ base, user: req.store.user, t, values, errors, saved, checkoutToken }), { status: 400, theme: 'dark' })
  const shipping=t.lines.some(l=>l.product.physical)?readShipping(req.body):{address:null}
  if(shipping.error)return render(req,res,'Shipping address required',P.checkoutPage({base,user:req.store.user,t,values:{...values,...shipping.values},errors:{shipping:shipping.error},saved,checkoutToken}),{status:400,theme:'dark'})
  const items = t.lines.map(l=>toOrderItem(l.product))
  const rejection=scenarioPayment(req.store,payment,items)
  if(rejection)return render(req,res,'Payment declined',P.checkoutPage({base,user:req.store.user,t,values,errors:{payment:rejection},saved,checkoutToken}),{status:402,theme:'dark'})
  const { order, token } = placeOrder(req, { items, payment, billing, t, path: 'cart', shipping:shipping.address })
  req.store.cart = []
  delete req.store.checkout.cartReview
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
  if(req.store.user?.id!==acct.id) invalidateIdentityReviews(req)
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
  resumeAccount(req)
  const ru = req.store.checkout.returnTo
  delete req.store.checkout.returnTo
  res.redirect(req.store.user && typeof ru === 'string' && ru.startsWith(`${base}/`) ? ru : `${base}/`)
})
router.get('/signout', (req, res) => { invalidateIdentityReviews(req); const {paymentReview,cartReview}=req.store.checkout; req.store.user = null; req.store.checkout = {paymentReview,cartReview}; res.redirect(`${res.locals.base}/`) })

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
    else { invalidateIdentityReviews(req); req.store.user = publicAccount(acct); return res.redirect(`${res.locals.base}/auth/msa?action=loggedIn`) }
  }
  renderAuth(req, res, 'Create account', P.signupPage({ base: res.locals.base, values: { ...v, password: '' }, errors }), 400)
})

router.use(notFound)

export default {
  slug: 'xbox-store',
  name: NAME,
  country: 'US',
  currency: 'USD',
  description: fixtureCatalog ? 'US. Native digital Xbox licenses with Microsoft-account checkout; physical games, consoles and accessories ship separately without digital entitlements.' : 'US. Captured digital GTA VI offers. Microsoft sign-in and payment are local simulations; no physical inventory.',
  router,
}
import { fixtureCatalog } from '../../lib/catalog-policy.js'
