import { readShipping } from './physical.js'
import { installJourneys, accountState, resumeWishlist, restoreProfile } from './journeys.js'
import { COLLECTIONS } from './catalogue.js'
import { Router } from 'express'
import { randomBytes, randomInt, createHash } from 'node:crypto'
import { recordOrder, getOrder, listOrders } from '../../lib/orders.js'
import { validateCard } from '../../lib/payment.js'
import { enterScenarioCart, scenarioAvailability, scenarioPayment, scenarioKeepCartOnSignIn, scenarioActive, registerScenarioAdapter } from '../../lib/benchmark-scenarios.js'
import { authenticate, createAccount, publicAccount } from '../../lib/accounts.js'
import { ASSORTMENT, CATALOG } from './data.js'
import { shelfArtSvg } from './shelf-art.js'
import { PRODUCTS, filterProducts, CONCEPT_ID, STATES, byId, featured, search, cartLines, totals, productPath, conceptPath } from './data.js'
import * as P from './pages.js'
import { installPdc, INFORMATION_REDIRECTS } from './pdc.js'

const router = Router()
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
// ASSUMPTION: the <title> of store.playstation.com/en-us/pages/latest is not quoted in the research.
const HOME_TITLE = 'Official PlayStation™Store US | Home of PlayStation games, content and more'
registerScenarioAdapter('playstation-store', { lines: store => [...store.cart, ...(store.checkout.scenarioItems || [])] })

// ---- helpers ----
function render(req, res, { title, body, drawer = null, closeHref = null, chrome = 'store', status = 200 }) {
  res.status(status).type('html').send(P.layout({ base: res.locals.base, title, body, path: req.originalUrl, user: req.store.user, cartCount: req.store.cart.length, drawer, closeHref, chrome }))
}
const sony = (req, res, title, body, status = 200) => render(req, res, { title, body, chrome: 'sony', status })
const decode = (s) => { try { return decodeURIComponent(s) } catch { return s } }
const takeFlash = (req) => { const f = req.store.flash ?? null; req.store.flash = null; return f }

// Only paths inside this store are accepted as return targets (no open redirects), and never the
// drawer, sign-in or sign-out URLs themselves.
function returnPath(res, value) {
  const base = res.locals.base
  if (typeof value !== 'string' || value.length > 2048 || value.includes('\\')) return `${base}/`
  try {
    const url = new URL(value, 'http://store.local')
    const path = decodeURIComponent(url.pathname)
    const inStore = path === base || path.startsWith(`${base}/`)
    const rel = path.slice(base.length)
    return url.origin === 'http://store.local' && inStore && !/^\/(en-us\/checkout|my\.account\.sony\.com|logout)/.test(rel) ? `${url.pathname}${url.search}${url.hash}` : `${base}/`
  } catch { return `${base}/` }
}

// ---- page views (also used to draw the page underneath the drawer) ----
// Browsable digital listings: the evidence-backed GTA VI rows plus, in reference mode, the
// PlayStation Store assortment (hardware is listed on the PlayStation Direct pages instead).
const LISTED = CATALOG.filter(p => p.department !== 'hardware')
const directItem = (path) => ASSORTMENT.find(p => p.directPath && (path === p.directPath || path === `${p.directPath}/`)) ?? null
const homeView = (res) => ({ title: HOME_TITLE, body: P.homePage({ base: res.locals.base, products: PRODUCTS }) })
const searchView = (res, q, options = {}) => ({ title: `PlayStation Store | Search | ${q}`, body: P.searchPage({ base: res.locals.base, q, products: filterProducts(search(q), options), options }) })
const browseView = (res, options = {}) => ({ title: 'PlayStation Store | Browse', body: P.searchPage({ base: res.locals.base, q: '', products: filterProducts(LISTED, options), heading: 'Browse', options }) })
// The signed-in shopper's orders, from this visitor's session only: one benchmark run must never see
// another run's pre-orders for the shared test account.
const myOrders = (req) => req.store.user ? listOrders({ store: req.storeSlug }).filter(o => o.session_id === req.session.id && o.customer.email === req.store.user.email && o.customer.account_id === req.store.user.id && o.meta.account_id === req.store.user.id) : []
const ownedSkus = (req) => new Set(myOrders(req).flatMap(o => [...o.items.filter(i=>!byId(i.sku)?.physical&&byId(i.sku)?.contentType!=='consumable').map(i => i.sku), ...(o.meta.entitlements||[]).flatMap(e=>e.includedSkus||[])]))
// ASSUMPTION: product and concept pages are titled with the product name (the research does not quote the <title>).
const productView = (req, res, p, here, toast = null) => ({ title: p.title, body: P.productPage({ base: res.locals.base, p: scenarioAvailability(req.store,p.id,'digital')===false ? {...p,available:false,cta:'unavailable'} : p, here, toast, owned: ownedSkus(req), saved: new Set(accountState(req)?.wishlist || []) }) })
const libraryView = (req, res) => ({ title: 'Game Library', body: P.libraryPage({ base: res.locals.base, user: req.store.user, orders: myOrders(req) }) })
const notFound = (req, res) => render(req, res, { title: 'PlayStation Store', body: P.fallbackPage({ base: res.locals.base }), status: 404 })

// The drawer slides over the store page it was opened from (checkout.returnTo).
const closeHref = (req, res) => req.store.checkout.returnTo ?? `${res.locals.base}/`
function underlay(req, res) {
  const base = res.locals.base
  const path = closeHref(req, res).split('?')[0].slice(base.length)
  const product = /^\/en-us\/product\/([^/]+)\/?$/.exec(path)
  const query = /^\/en-us\/search\/([^/]+)\/?$/.exec(path)
  if (directItem(path)) return productView(req, res, directItem(path), productPath(base, directItem(path)))
  if (product && byId(product[1])) return productView(req, res, byId(product[1]), productPath(base, byId(product[1])))
  if (path.startsWith(`/en-us/concept/${CONCEPT_ID}`)) return productView(req, res, featured(), conceptPath(base))
  if (query) return searchView(res, decode(query[1]))
  if (path.startsWith('/en-us/pages/browse')) return browseView(res)
  if (path.startsWith('/en-us/library') && req.store.user) return libraryView(req, res)
  return homeView(res)
}
function drawer(req, res, title, html, status = 200) {
  render(req, res, { title, body: underlay(req, res).body, drawer: html, closeHref: closeHref(req, res), status })
}

// Saved payment methods per signed-in account, kept in this visitor's session only.
// ASSUMPTION: the seeded account starts with no saved card or payment service.
function wallet(req) {
  const all = (req.store.wallets ??= {})
  return (all[req.store.user.id] ??= { instruments: [], selected: null })
}

// Assortment artwork (drawn locally, see shelf-art.js) and PlayStation Direct product pages.
router.get('/shelf-art/:id/:view.svg', (req, res) => {
  const p = ASSORTMENT.find(item => item.id === req.params.id)
  if (!p || !/^[0-3]$/.test(req.params.view)) return res.status(404).type('text').send('Not found')
  res.set('Cache-Control', 'public, max-age=3600').type('image/svg+xml').send(shelfArtSvg(p, Number(req.params.view)))
})
router.get(['/direct.playstation.com/en-us/buy-consoles/:slug', '/direct.playstation.com/en-us/buy-accessories/:slug', '/direct.playstation.com/en-us/buy-consoles/:slug/', '/direct.playstation.com/en-us/buy-accessories/:slug/'], (req, res, next) => {
  const p = directItem(req.path)
  if (!p) return next()
  const view = productView(req, res, p, productPath(res.locals.base, p), takeFlash(req))
  render(req, res, { title: `${p.title} | PlayStation Direct`, body: view.body, chrome: 'pdc' })
})
installPdc(router, { render })
installJourneys(router, { render, myOrders, wallet, returnPath })

// ---- browse ----
router.get(['/', '/en-us/pages/latest'], (req, res) => render(req, res, homeView(res)))
// Older footer URLs: the real footer links to these PlayStation.com pages.
router.get('/en-us/information/:topic',(req,res)=>Object.hasOwn(INFORMATION_REDIRECTS,req.params.topic)?res.redirect(301,`${res.locals.base}${INFORMATION_REDIRECTS[req.params.topic]}`):notFound(req,res))
router.get('/en-us/pages/browse', (req, res) => render(req, res, browseView(res, req.query)))

router.get('/en-us/pages/collections', (req,res)=>render(req,res,{title:'Collections',body:P.collectionsPage({base:res.locals.base,products:PRODUCTS})}))
router.get('/en-us/collection/:id',(req,res)=>{
 const collection=COLLECTIONS.find(([id])=>id===req.params.id)
 if(!collection)return notFound(req,res)
 const [id,title,intro,predicate]=collection
 render(req,res,{title,body:P.searchPage({base:res.locals.base,heading:title,intro,products:filterProducts(LISTED.filter(predicate),req.query),options:req.query,action:`${res.locals.base}/en-us/collection/${id}`})})
})
router.get('/en-us/pages/deals',(req,res)=>render(req,res,{title:'Deals',body:P.searchPage({base:res.locals.base,heading:'Deals',intro:ASSORTMENT.length?'Autumn Sale: save up to 85% on games, editions and add-ons. Offers end 10/22/2026 11:59 PM PT.':'Explore Autumn offers on full games and editions. Offers end October 15, 2026.',products:filterProducts(LISTED.filter(p=>p.price!==null&&p.originalPrice>p.price),req.query),options:req.query,action:`${res.locals.base}/en-us/pages/deals`})}))
router.get('/en-us/pages/subscriptions',(req,res)=>render(req,res,{title:'PlayStation Plus',body:P.subscriptionsPage({base:res.locals.base})}))
// The header search field submits ?q=; the store's own search URL is a path: /en-us/search/{q}.
router.get('/en-us/search', (req, res) => {
  const q = String(req.query.q ?? '').trim()
  res.redirect(q ? `${res.locals.base}/en-us/search/${encodeURIComponent(q)}` : `${res.locals.base}/`)
})
router.get('/en-us/search/:q', (req, res) => render(req, res, searchView(res, req.params.q.trim(), req.query)))

// Edition-agnostic concept page: renders the featured edition (currently the Ultimate Edition).
router.get('/en-us/concept/:id', (req, res) => {
  if (req.params.id !== CONCEPT_ID) return notFound(req, res)
  render(req, res, productView(req, res, featured(), conceptPath(res.locals.base), takeFlash(req)))
})
router.get('/en-us/product/:id', (req, res) => {
  const p = byId(req.params.id)
  if (!p) return notFound(req, res)
  render(req, res, productView(req, res, p, productPath(res.locals.base, p), takeFlash(req)))
})

// ---- product CTAs: every one needs a PSN account (no guest) ----
function ctaTarget(req, res) {
  const p = byId(req.body.sku)
  return { p, back: returnPath(res, req.body.returnTo || (p ? productPath(res.locals.base, p) : '')) }
}

router.post(['/en-us/preorder','/en-us/cart/add'],(req,res,next)=>{
 const p=byId(req.body.sku)
 const invalid=!p||!p.available||(p.physical&&p.stock<=0)||(req.body.platform!==undefined&&!p.platforms.includes(req.body.platform))||(req.body.edition!==undefined&&req.body.edition!==p.editionName)||(req.body.qty!==undefined&&req.body.qty!=='1')||req.body.options!==undefined
 if(invalid)return render(req,res,{title:'Unable to add item',status:400,body:`<section class="ps-section"><h1>Unable to add item</h1><p>This item or edition is unavailable. Choose an available edition from the store.</p><a href="${res.locals.base}/en-us/pages/browse">Browse games</a></section>`})
 next()
})
function setUser(req,user){
 if(req.store.user?.id!==user.id){if(req.store.user || !scenarioKeepCartOnSignIn(req.store))req.store.cart=[];req.store.checkout={}}
 req.store.user=user
 req.store.user.online_id ||= P.onlineId(user)
 restoreProfile(req)
}

// Pre-Order is a BUY_NOW action: signed out it goes to Sony sign-in (and back to this page);
// signed in it opens the drawer straight on "Confirm Pre-Order" for that SKU (no cart step).
router.post('/en-us/preorder', (req, res) => {
  const { p, back } = ctaTarget(req, res)
  if (!p || p.cta !== 'preorder') return res.redirect(back)
  if (!req.store.user) return res.redirect(P.signInUrl(res.locals.base, back))
  if (ownedSkus(req).has(p.id)) return res.redirect(back)
  req.store.checkout.returnTo = back
  res.redirect(`${res.locals.base}/en-us/checkout/buynow/${encodeURIComponent(p.id)}`)
})

// Regular (non pre-order) items: ADD_TO_CART is also a drawer action, so the cart view opens.
router.post('/en-us/cart/add', (req, res) => {
  const { p, back } = ctaTarget(req, res)
  if (!p || p.cta !== 'cart') return res.redirect(back)
  if (!req.store.user) return res.redirect(P.signInUrl(res.locals.base, back))
  if (ownedSkus(req).has(p.id)) return res.redirect(back)
  if (!req.store.cart.includes(p.id)) req.store.cart.push(p.id) // digital licence: one of each
  req.store.checkout.returnTo = back
  res.redirect(`${res.locals.base}/en-us/checkout`)
})
router.post('/en-us/cart/remove', (req, res) => {
  req.store.cart = req.store.cart.filter(id => id !== String(req.body.sku))
  res.redirect(`${res.locals.base}/en-us/checkout`)
})
// Observed: /en-us/cart redirects to /en-us/pages/cart/, which shows the store's fallback page.
// ASSUMPTION: it shows the same fallback when signed in (the cart only exists as the drawer).
router.get('/en-us/cart', (req, res) => res.redirect(`${res.locals.base}/en-us/pages/cart/`))

// ---- Sony account sign-in (two steps) and Create New Account ----
router.get(P.SONY_SIGNIN, (req, res) => {
  const redirectUri = returnPath(res, req.query.redirect_uri)
  if (req.store.user) return res.redirect(redirectUri)
  sony(req, res, 'Sign In', P.signInPage({ base: res.locals.base, email: String(req.query.email ?? ''), redirectUri }))
})
router.post(P.SONY_SIGNIN, (req, res) => {
  const base = res.locals.base
  const redirectUri = returnPath(res, req.body.redirect_uri)
  const email = String(req.body.email ?? '').trim()
  // ASSUMPTION: no passkey is registered for the test accounts, so this option explains itself and stays on step 1.
  if (req.body.passkey) return sony(req, res, 'Sign In', P.signInPage({ base, email, redirectUri, error: 'No passkey is set up for this account on this device. Enter your sign-in ID (email address) to sign in with your password.' }), 400)
  if (req.body.step !== 'password') {
    const error = !email ? 'Enter your sign-in ID (email address).' : !EMAIL_RE.test(email) ? 'Enter a valid email address.' : null
    if (error) return sony(req, res, 'Sign In', P.signInPage({ base, email, redirectUri, error }), 400)
    return sony(req, res, 'Sign In', P.signInPage({ base, step: 'password', email, redirectUri }))
  }
  const acct = authenticate(req.storeSlug, email, req.body.password)
  // ASSUMPTION: Sony's wrong-password wording (the sign-in page itself was never observed).
  if (!acct) return sony(req, res, 'Sign In', P.signInPage({ base, step: 'password', email, redirectUri, error: 'The sign-in ID (email address) or password is incorrect.' }), 401)
  setUser(req,publicAccount(acct))
  resumeWishlist(req,redirectUri)
  res.redirect(redirectUri)
})

router.get(P.SONY_SIGNUP, (req, res) => {
  sony(req, res, 'Create New Account', P.createAccountPage({ base: res.locals.base, redirectUri: returnPath(res, req.query.redirect_uri), values: { country: 'US', language: 'en-US' } }))
})
// ASSUMPTION: the real sign-up spreads these fields over several "Next" screens and ends with email
// verification; the clone takes them on one screen and signs the new account in straight away.
router.post(P.SONY_SIGNUP, (req, res) => {
  const v = req.body
  const redirectUri = returnPath(res, v.redirect_uri)
  const text = (k) => String(v[k] ?? '').trim()
  const errors = {}
  const need = (k, msg) => { if (!text(k)) errors[k] = msg }
  need('dob', 'Enter your date of birth.')
  need('state', 'Select your state.')
  need('email', 'Enter your sign-in ID (email address).')
  need('password', 'Enter a password.')
  need('onlineId', 'Enter an online ID.')
  need('firstName', 'Enter your first name.')
  need('lastName', 'Enter your last name.')
  const dob = new Date(`${text('dob')}T00:00:00`)
  if (text('dob') && (Number.isNaN(dob.getTime()) || dob > new Date())) errors.dob = 'Enter a valid date of birth.'
  if (text('state') && !STATES.includes(text('state'))) errors.state = 'Select your state.'
  if (text('email') && !EMAIL_RE.test(text('email'))) errors.email = 'Enter a valid email address.'
  // ASSUMPTION: Sony's password and Online ID rules as commonly documented.
  if (v.password && !(String(v.password).length >= 8 && /[a-z]/i.test(v.password) && /\d/.test(v.password))) errors.password = 'Your password must be at least 8 characters and include both letters and numbers.'
  if (text('onlineId') && !/^[A-Za-z][A-Za-z0-9_-]{2,15}$/.test(text('onlineId'))) errors.onlineId = 'Your online ID must be 3-16 characters, start with a letter, and use only letters, numbers, hyphens (-) and underscores (_).'
  if (!v.terms) errors.terms = 'You must agree to the terms to create an account.'
  if (!Object.keys(errors).length) {
    const acct = createAccount(req.storeSlug, { email: text('email'), password: String(v.password), first_name: text('firstName'), last_name: text('lastName'), online_id: text('onlineId'), date_of_birth: text('dob'), state: text('state'), country: 'US' })
    if (acct.error) errors.email = 'This sign-in ID (email address) is already in use.'
    else { setUser(req,publicAccount(acct)); resumeWishlist(req,redirectUri); return res.redirect(redirectUri) }
  }
  sony(req, res, 'Create New Account', P.createAccountPage({ base: res.locals.base, values: { ...v, password: '' }, errors, redirectUri }), 400)
})

router.get('/logout', (req, res) => { req.store.user = null; delete req.store.pendingWishlist; req.store.checkout = {}; req.store.cart = []; res.redirect(`${res.locals.base}/`) })

// ---- the checkout drawer (checkout.playstation.com client, server-rendered as an overlay route) ----
// Cart view: /en-us/checkout (header Cart icon). Buy-now view: /en-us/checkout/buynow/{sku} (Pre-Order).
const DRAWER = ['/en-us/checkout', '/en-us/checkout/buynow/:sku']
const sub = (suffix) => DRAWER.map(p => p + suffix)

function drawerCtx(req, res) {
  const base = res.locals.base
  const sku = req.params.sku
  if (!sku) return { base, mode: 'cart', lines: cartLines(req.store), drawerPath: `${base}/en-us/checkout` }
  const p = byId(sku)
  return { base, mode: 'buynow', lines: p?.cta === 'preorder' ? [{ product: p, qty: 1 }] : null, drawerPath: `${base}/en-us/checkout/buynow/${encodeURIComponent(sku)}` }
}

// Drawer states that come before the Confirm view: signed out, unknown SKU, empty cart. Returns true if it rendered one.
function drawerGate(req, res, c) {
  if (!req.store.user) { drawer(req, res, 'Sign In | Checkout', P.drawerSignIn({ base: c.base, returnTo: closeHref(req, res) }), req.method === 'POST' ? 401 : 200); return true }
  if (!c.lines) { drawer(req, res, 'Error | Checkout', P.drawerError({ closeHref: closeHref(req, res) }), 404); return true }
  if (scenarioActive(req.store)) req.store.checkout.scenarioItems = c.lines.map(l=>({sku:l.product.id,qty:l.qty}))
  enterScenarioCart(req.store, c.lines.map(l=>({sku:l.product.id,qty:l.qty})))
  if(c.lines.some(l=>scenarioAvailability(req.store,l.product.id,'digital')===false)){drawer(req,res,'Unavailable | Checkout',P.drawerError({closeHref:closeHref(req,res),message:'This digital item became unavailable after it was selected. No order was placed.'}),409);return true}
  // ASSUMPTION: wording of the refusal when the licence is already owned (e.g. Back + resubmit after paying).
  if (c.mode === 'buynow' && ownedSkus(req).has(c.lines[0].product.id)) { drawer(req, res, 'Error | Checkout', P.drawerError({ closeHref: closeHref(req, res), message: 'You have already purchased this item. You can find it in your Game Library.' }), 409); return true }
  if(c.lines.some(l=>!l.product.available||(l.product.physical&&l.product.stock<=0)||l.product.price===null||l.qty!==1)){drawer(req,res,'Error | Checkout',P.drawerError({closeHref:closeHref(req,res),message:'An item is no longer available. Please update your cart.'}),409);return true}
  if(c.mode==='cart'&&c.lines.some(l=>ownedSkus(req).has(l.product.id))){drawer(req,res,'Error | Checkout',P.drawerError({closeHref:closeHref(req,res),message:'You have already purchased an item in this cart. Remove it to continue.'}),409);return true}
  if (!c.lines.length) { drawer(req, res, 'Cart | Checkout', P.drawerEmptyCart({ closeHref: closeHref(req, res) })); return true }
  return false
}

function reviewFingerprint(req,c){return createHash('sha256').update(JSON.stringify({account:req.store.user?.id,path:c.drawerPath,lines:c.lines.map(({product:p,qty})=>({id:p.id,qty,price:p.price,available:p.available,platforms:p.platforms,entitlements:p.entitlements,physical:p.physical,stock:p.stock,format:p.format})),totals:totals(c.lines)})).digest('hex')}

function showConfirm(req, res, c, { error = null, selected = null, status = 200, shippingValues = req.store.checkout.shippingValues || {} } = {}) {
  const review={token:randomBytes(18).toString('hex'),fingerprint:reviewFingerprint(req,c)}
  req.store.checkout.review=review
  const w = wallet(req)
  const notice = req.store.checkout.notice ?? null
  req.store.checkout.notice = null
  const pick = selected ?? w.selected ?? w.instruments.find(i => i.default)?.id ?? null
  // ASSUMPTION: title of the buy-now view (the client documents "Cart | Checkout" and "Thank You | Checkout" only).
  const title = c.mode === 'cart' ? 'Cart | Checkout' : 'Confirm Pre-Order | Checkout'
  drawer(req, res, title, P.drawerConfirm({ base: c.base, mode: c.mode, t: totals(c.lines), drawerPath: c.drawerPath, closeHref: closeHref(req, res), instruments: w.instruments, selected: pick, error, notice, reviewToken:review.token, shippingValues }), status)
}

router.get(DRAWER, (req, res) => {
  if (req.query.return) req.store.checkout.returnTo = returnPath(res, req.query.return)
  const c = drawerCtx(req, res)
  if (!drawerGate(req, res, c)) showConfirm(req, res, c)
})

// "Pre-Order & Pay" (or "Confirm Purchase" for a cart without pre-orders): charged immediately.
router.post(DRAWER, (req, res) => {
  const c = drawerCtx(req, res)
  if(req.store.user&&req.body.review_token!==undefined&&(!req.store.checkout.review||typeof req.body.review_token!=='string'||req.body.review_token!==req.store.checkout.review.token))return drawer(req,res,'Review expired | Checkout',P.drawerError({closeHref:closeHref(req,res),message:'This checkout review has expired. Open your cart and review the latest details before confirming.'}),409)
  if (drawerGate(req, res, c)) return
  const review=req.store.checkout.review
  const sent=req.body.review_token
  if((sent!==undefined&&(!review||typeof sent!=='string'||sent!==review.token))||(review&&review.fingerprint!==reviewFingerprint(req,c)))return showConfirm(req,res,c,{error:'Your cart or account changed. Review the updated details before confirming.',status:409})
  const t = totals(c.lines)
  const shipping=c.lines.some(l=>l.product.physical)?readShipping(req.body):{address:null}
  if(shipping.error)return showConfirm(req,res,c,{error:shipping.error,status:400,shippingValues:shipping.values})
  if(shipping.address)req.store.checkout.shippingValues=shipping.values
  const w = wallet(req)
  const instrument = w.instruments.find(i => i.id === req.body.paymentMethod) ?? null
  // Wallet funds are used first; anything they do not cover needs a selected card or service.
  if (!instrument && t.remainder > 0) return showConfirm(req, res, c, { error: 'Please select a payment method.', status: 400 })
  if (instrument) w.selected = instrument.id
  const payment = !instrument ? { method: 'wallet' } : instrument.type === 'card' ? { method: 'card', brand: instrument.brand, last4: instrument.last4, name_on_card: instrument.name } : { method: instrument.type }
  const rejection = scenarioPayment(req.store, payment, c.lines.map(({ product, qty }) => ({ sku: product.id, qty })))
  if (rejection) return showConfirm(req,res,c,{error:rejection,status:402})

  const user = req.store.user
  const token = randomBytes(12).toString('hex')
  const order = recordOrder({
    store: req.storeSlug,
    order_number: String(randomInt(10_000_000_000, 100_000_000_000)), // 11-digit receipt number
    session: req.session,
    items: c.lines.map(({ product: p, qty }) => p.kind === 'game'
      ? { platform: p.platform, edition: p.edition, format: p.format, qty, unit_price: p.price, title: p.title, sku: p.id }
      : { kind: 'other', title: p.title, qty, unit_price: p.price, sku: p.id }),
    customer: { email: user.email, first_name: user.first_name, last_name: user.last_name, online_id: P.onlineId(user), account_id: user.id },
    fulfillment: { method: shipping.address?'shipping':'digital', ...(shipping.address?{eta:'3–5 business days',service:'Free standard shipping'}:{}) },
    shipping_address: shipping.address,
    billing_address: instrument?.billing ?? null,
    payment,
    totals: { subtotal: t.subtotal, shipping: 0, tax: t.tax, total: t.total },
    currency: 'USD',
    meta: { token, view: c.mode, wallet_applied: t.wallet, account_id:user.id, physical_items:c.lines.filter(l=>l.product.physical).map(l=>({sku:l.product.id,platform:l.product.catalogPlatform,format:l.product.formatLabel})), entitlements:c.lines.filter(l=>!l.product.physical).map(({product:p})=>({sku:p.id,contentType:p.contentType,platforms:[...p.platforms],release:p.release,preorder:p.cta==='preorder',baseId:p.baseId||null,includedSkus:[...(p.includedSkus||[])],licenses:[...p.entitlements]})) },
  })
  if (c.mode === 'cart') req.store.cart = []
  req.store.checkout.pendingCard = null
  req.store.checkout.review = null
  res.redirect(`${c.base}/en-us/checkout/thankyou?order=${order.order_number}&token=${token}`)
})

router.get('/en-us/checkout/thankyou', (req, res) => {
  const order = getOrder(String(req.query.order ?? ''))
  if (!order || order.store !== req.storeSlug || order.session_id !== req.session.id || !req.store.user || order.customer.account_id !== req.store.user.id || order.meta.token !== req.query.token) return drawer(req, res, 'Error | Checkout', P.drawerError({ closeHref: closeHref(req, res) }), 404)
  drawer(req, res, 'Thank You | Checkout', P.drawerThankYou({ base: res.locals.base, order, closeHref: closeHref(req, res) }))
})

// ---- Add Payment Method (hosted transact screens inside the drawer): card > Next, billing > Save ----
// These screens need a signed-in shopper and something to pay for; otherwise the drawer's main view explains why.
function payCtx(req, res) {
  const c = drawerCtx(req, res)
  if (!req.store.user || !c.lines?.length) { res.redirect(c.drawerPath); return null }
  return c
}
const cardCount = (w) => w.instruments.filter(i => i.type === 'card').length

router.get(sub('/payment'), (req, res) => {
  const c = payCtx(req, res); if (!c) return
  drawer(req, res, 'Add Payment Method | Checkout', P.drawerAddPayment({ drawerPath: c.drawerPath, cardCount: cardCount(wallet(req)) }))
})

router.get(sub('/payment/card'), (req, res) => {
  const c = payCtx(req, res); if (!c) return
  drawer(req, res, 'Add a Credit/Debit Card | Checkout', P.drawerCardForm({ drawerPath: c.drawerPath }))
})
router.post(sub('/payment/card'), (req, res) => {
  const c = payCtx(req, res); if (!c) return
  // A failed replacement attempt must not leave a prior card ready to save.
  req.store.checkout.pendingCard = null
  const v = req.body
  const name = typeof v.cardholderName === 'string' ? v.cardholderName.trim() : ''
  const card = validateCard({ number: v.cardNumber, exp_month: v.expMonth, exp_year: v.expYear, cvv: v.cvv })
  const errors = {}
  if (!card.ok) for (const [k, field] of [['number', 'cardNumber'], ['expiry', 'expiry'], ['cvv', 'cvv']]) if (card.errors[k]) errors[field] = card.errors[k]
  if (!name) errors.cardholderName = 'Enter the cardholder\'s name.'
  if (cardCount(wallet(req)) >= 3) errors.cardNumber = 'You have reached the maximum of three credit/debit cards on file.'
  if (Object.keys(errors).length) {
    // The card number and CVV are never echoed back into the page.
    return drawer(req, res, 'Add a Credit/Debit Card | Checkout', P.drawerCardForm({ drawerPath: c.drawerPath, values: { cardholderName: name, expMonth: typeof v.expMonth==='string'?v.expMonth:'', expYear: typeof v.expYear==='string'?v.expYear:'' }, errors }), 400)
  }
  // Only what is needed to show and record the card is kept for the billing screen.
  req.store.checkout.pendingCard = { brand: card.brand, last4: card.last4, name, exp: `${String(v.expMonth).padStart(2, '0')}/${String(v.expYear).slice(-2)}` }
  res.redirect(`${c.drawerPath}/payment/card/billing`)
})

router.get(sub('/payment/card/billing'), (req, res) => {
  const c = payCtx(req, res); if (!c) return
  const card = req.store.checkout.pendingCard
  if (!card) return res.redirect(`${c.drawerPath}/payment/card`)
  // ASSUMPTION: the billing screen starts with the account holder's name filled in.
  drawer(req, res, 'Billing Information | Checkout', P.drawerBillingForm({ drawerPath: c.drawerPath, card, values: { firstName: req.store.user.first_name, lastName: req.store.user.last_name } }))
})
router.post(sub('/payment/card/billing'), (req, res) => {
  const c = payCtx(req, res); if (!c) return
  const card = req.store.checkout.pendingCard
  if (!card) return res.redirect(`${c.drawerPath}/payment/card`)
  const fields = ['firstName','lastName','address1','address2','city','state','zip','phone','country']
  const v = Object.fromEntries(fields.map(k=>[k,typeof req.body[k]==='string'?req.body[k].trim():'']))
  v.setDefault = req.body.setDefault === '1'
  const text = (k) => v[k]
  const errors = {}
  for(const k of fields)if(req.body[k]!==undefined&&typeof req.body[k]!=='string')errors[k]='Enter one value for this field.'
  if(req.body.setDefault!==undefined&&req.body.setDefault!=='1')errors.firstName='Choose a valid default payment preference.'
  if(v.country&&v.country!=='US')errors.state='Select a United States billing address.'
  for (const [k, msg] of [['firstName', 'Enter your first name.'], ['lastName', 'Enter your last name.'], ['address1', 'Enter your street address.'], ['city', 'Enter your city.'], ['state', 'Select your state.'], ['zip', 'Enter your ZIP code.'], ['phone', 'Enter your phone number.']]) if (!text(k)) errors[k] = msg
  if (text('state') && !STATES.includes(text('state'))) errors.state = 'Select your state.'
  if (text('zip') && !/^\d{5}(-\d{4})?$/.test(text('zip'))) errors.zip = 'Enter a valid ZIP code.'
  if (text('phone') && text('phone').replace(/\D/g, '').length !== 10) errors.phone = 'Enter a valid 10-digit phone number.'
  if (Object.keys(errors).length) return drawer(req, res, 'Billing Information | Checkout', P.drawerBillingForm({ drawerPath: c.drawerPath, card, values: v, errors }), 400)

  const w = wallet(req)
  const instrument = {
    id: `card-${randomBytes(4).toString('hex')}`, type: 'card', brand: card.brand, last4: card.last4, name: card.name, exp: card.exp,
    default: v.setDefault || !w.instruments.some(i => i.default),
    billing: { first_name: text('firstName'), last_name: text('lastName'), line1: text('address1'), line2: text('address2') || null, city: text('city'), state: text('state'), postal_code: text('zip'), country: 'US', phone: text('phone') },
  }
  if (instrument.default) for (const i of w.instruments) i.default = false
  w.instruments.push(instrument)
  w.selected = instrument.id
  req.store.checkout.pendingCard = null
  req.store.checkout.notice = 'Credit/debit card has been successfully added.'
  res.redirect(c.drawerPath)
})

// ASSUMPTION: the PayPal log-in hand-off cannot happen here, so the account links at once.
// One payment service per account: adding PayPal replaces any other service.
router.post(sub('/payment/service'), (req, res) => {
  const c = payCtx(req, res); if (!c) return
  if(req.body.service!=='paypal')return drawer(req,res,'Add Payment Method | Checkout',P.drawerError({closeHref:closeHref(req,res),message:'Select a supported payment service.'}),400)
  const w = wallet(req)
  w.instruments = [...w.instruments.filter(i => i.type === 'card'), { id: 'paypal', type: 'paypal', default: false }]
  w.selected = 'paypal'
  req.store.checkout.notice = 'Your PayPal account has been added.'
  res.redirect(c.drawerPath)
})

// Anything else (including /en-us/pages/cart/) gets the store's fallback page.
router.use(notFound)

export default {
  slug: 'playstation-store',
  name: 'PlayStation Store',
  country: 'US',
  currency: 'USD',
  description: fixtureCatalog ? 'US. Native digital PlayStation licenses with Sony sign-in and wallet-first checkout; physical games, consoles and accessories require a shipping address and grant no digital license.' : 'US. Captured digital GTA VI editions and add-on. Sony sign-in and payment are local simulations; no physical inventory.',
  router,
}
import { fixtureCatalog } from '../../lib/catalog-policy.js'
