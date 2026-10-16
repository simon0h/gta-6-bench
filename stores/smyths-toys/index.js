import { enterScenarioCart, scenarioPayment, scenarioAvailability, registerScenarioAdapter } from '../../lib/benchmark-scenarios.js'
import { fixtureCatalog } from '../../lib/catalog-policy.js'
import { productImage, productGallery } from '../../lib/product-assets.js'
import { products } from './data.js'
import express from 'express'
import { chrome } from './layout.js'
import { randomBytes, randomInt, createHash } from 'node:crypto'
import { esc, money, disclaimer, publicNotice } from '../../lib/html.js'
import { authenticate, publicAccount } from '../../lib/accounts.js'
import { validateCard } from '../../lib/payment.js'
import { recordOrder } from '../../lib/orders.js'
import { retailState, rememberProduct, defaultAddress } from '../../lib/retail-state.js'
import { installSite, homePage, landingExtras, giftFinderIntro } from './site.js'
import { installJourneys, productJourney, privateOrder } from './journeys.js'

import { browseProducts, departments, departmentPaths, slug, browseTiles, browseProduct, catalogListing, departmentHub, homeContent, resolveProduct, optionInput, quantityLimit, artwork, shelf } from './browse.js'
import { isShelfSku, shelfSvg, shelfViews } from './shelf.js'
import { shelfProductPage, rankSearch } from './shelf-pages.js'
import { listingPage, SEARCH_SORTS, departmentLanding } from './site.js'
import { categoryByCode, topDepartments } from './site-data.js'

const router = express.Router()
const NAME = 'Smyths Toys Superstores'
const ROOT = '/uk/en-gb'
// Reference mode: the GTA VI listings stay read-only (409), while ordinary shop-floor items from
// shelf.js can be bought. Checkout opens only for a basket made up entirely of shop-floor items.
const shelfBasket = items => items.length > 0 && items.every(line => isShelfSku(line.sku))
router.use((req,res,next) => {
 const checkout = /(?:^|\/)checkout(?:\/|$)/.test(req.path) && !/\/checkout\/confirmation$/.test(req.path)
 const mutate = req.method === 'POST' && /\/cart\/(?:add|update)$/.test(req.path)
 if (!fixtureCatalog && (checkout && !shelfBasket(req.store.cart) || mutate && !isShelfSku(typeof req.body?.sku === 'string' ? req.body.sku.trim() : ''))) {
  return render(req,res,'Currently unavailable','<h1>This item is currently unavailable</h1><p>This item isn’t available to buy online right now. Please check back soon.</p>',[],409)
 }
 next()
})
const catalog = [...browseProducts, ...products, ...shelf]
const catalogProduct = sku => catalog.find(p => p.sku === sku)
const isPreorder = item => products.some(p => p.sku === item.sku)
const hasPreorder = items => items.some(isPreorder)
const lineKey = (p, selected) => `${p.sku}:${selected.variant_id || 'base'}`
const itemDescription = p => isPreorder(p) ? 'Standard edition · Download code in a box' : Object.entries(p.selectedOptions || {}).map(([k,v]) => `${k}: ${v}`).join(' · ') || catalogProduct(p.sku)?.category || 'Product'
function trustedLine(p, selected, qty) {
 return p.kind === 'game' ? {kind:'game',platform:p.platform,edition:p.edition,format:p.format,qty,unit_price:p.unit_price,title:p.title,sku:p.sku} : {kind:'other',sku:p.sku,title:p.title,qty,unit_price:selected.unit_price,key:lineKey(p,selected),variant_id:selected.variant_id,selectedOptions:selected.selectedOptions}
}
function cartErrors(state, fulfillment = null) {
 enterScenarioCart(state)
 const errors=[], counts=new Map(), variantCounts=new Map()
 if (!fixtureCatalog && state.cart.some(line => !isShelfSku(line.sku))) return ['This item is currently unavailable to order online.']
 for(const line of state.cart) {
  const p=catalogProduct(line.sku), selected=resolveProduct(p,line.selectedOptions||{})
  if(!selected || !Number.isInteger(line.qty) || line.qty<1 || selected.unit_price!==line.unit_price) {errors.push('An item or option in your basket has changed. Remove it and choose the product again.');continue}
  counts.set(p.sku,(counts.get(p.sku)||0)+line.qty)
  const key=lineKey(p,selected), count=(variantCounts.get(key)||0)+line.qty;variantCounts.set(key,count)
  if(count>quantityLimit(selected)||counts.get(p.sku)>quantityLimit(p)) errors.push(`${p.title}: the quantity exceeds current stock or the purchase limit.`)
  if(fulfillment){
   if (scenarioAvailability(state,line.sku,fulfillment.method === 'pickup' ? 'pickup' : 'shipping',fulfillment.store_id) === false) errors.push('Shipping unavailable. Availability changed after this item was selected. Choose an available collection option.')
   const available=fulfillment.method==='ship'?selected.deliveryStock:selected.collectionStock[fulfillment.store_id]||0
   if(count>available) errors.push(`${p.title}: not enough stock for ${fulfillment.method==='ship'?'Home Delivery':'this collection store'}. Choose another method or update your basket.`)
   const totalAvailable=fulfillment.method==='ship'?p.deliveryStock:p.collectionStock[fulfillment.store_id]||0
   if(counts.get(p.sku)>totalAvailable) errors.push(`${p.title}: combined quantities exceed stock for this delivery method.`)
  }
 }
 return [...new Set(errors)]
}
function checkoutSnapshot(req) {
 const c=req.store.checkout
 return createHash('sha256').update(JSON.stringify({cart:req.store.cart,email:c.email,fulfillment:c.fulfillment,address:c.address,billing:c.billing,payment:c.payment,pickup:c.pickupPerson,delivery_option:c.delivery_option,account_id:req.store.user?.id||null,totals:totals(req.store)})).digest('hex')
}
// ASSUMPTION: these two collection branches and their preorder stock are synthetic fixtures.
router.use((req,res,next) => {
 enterScenarioCart(req.store)
 if (/checkout/.test(req.path) && req.store.cart.some(item => scenarioAvailability(req.store,item.sku,'shipping') === false && scenarioAvailability(req.store,item.sku,'pickup','beckton') === false)) return render(req,res,'Item unavailable','<h1>Item unavailable</h1><p role="alert">Shipping unavailable. This item is no longer available for delivery or collection. No order was placed.</p>',[],409)
 next()
})
const shippingAvailable = req => req.store.cart.every(item => scenarioAvailability(req.store,item.sku,'shipping') !== false)
const branches = [{ id: 'beckton', name: 'Smyths Toys Beckton', city: 'London', postcode: 'E6' }, { id: 'salford', name: 'Smyths Toys Salford', city: 'Manchester', postcode: 'M5' }]
const string = v => typeof v === 'string' ? v.trim() : ''
const pick = (values, keys) => Object.fromEntries(keys.map(k => [k, string(values[k])]))
const cash = n => money(n, 'GBP')
const emailValid = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
const postcodeValid = v => /^(GIR\s?0AA|[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2})$/i.test(v)
const url = (res, suffix = '') => `${res.locals.base}${ROOT}${suffix}`
const field = (key, label, values = {}, { type = 'text', autocomplete = '', required = true } = {}) => `<label for="${key}">${label}</label><input id="${key}" name="${key}" type="${type}" value="${esc(typeof values[key]==='string'||typeof values[key]==='number'?values[key]:'')}"${autocomplete ? ` autocomplete="${autocomplete}"` : ''}${required ? ' required' : ''}>`
const errorsHtml = errors => errors.length ? `<div class="error" role="alert"><p>Please check the following:</p><ul>${errors.map(e => `<li>${esc(e)}</li>`).join('')}</ul></div>` : ''

function totals(state) {
  const subtotal = Math.round(state.cart.reduce((sum, p) => sum + p.qty * p.unit_price, 0) * 100) / 100
  const shipping = state.checkout.fulfillment?.method === 'ship' ? (subtotal < 20 ? 2.99 : 0) + (state.checkout.delivery_option === 'express' ? 1.99 : 0) : 0
  return { subtotal, shipping, tax: 0, discount: 0, total: Math.round((subtotal + shipping) * 100) / 100 }
}
function summary(items, total, pendingDelivery = false) {
  return `<section class="panel order-summary"><h2>Order summary</h2>${items.map(p => `<p>${esc(p.title)} × ${p.qty} <strong>${cash(p.qty * p.unit_price)}</strong><br><small>${esc(itemDescription(p))} · Ref: ${esc(p.sku)}</small></p>`).join('')}<dl><dt>Subtotal</dt><dd>${cash(total.subtotal)}</dd><dt>Delivery</dt><dd>${pendingDelivery ? 'Calculated at checkout' : total.shipping ? cash(total.shipping) : 'FREE'}</dd><dt>${pendingDelivery ? 'Total before delivery' : 'Total (VAT included)'}</dt><dd><strong>${cash(total.total)}</strong></dd></dl></section>`
}
// Checkout frame: progress steps, the step's form on the left and the order summary on the right.
const CHECKOUT_STEPS = ['Sign in', 'Delivery', 'Your details', 'Payment', 'Review']
const LOCK = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="5" y="10.5" width="14" height="10.5" rx="2" fill="currentColor"/><path d="M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3" fill="none" stroke="currentColor" stroke-width="2"/></svg>'
function checkoutFrame(step, main, aside = '') {
  const steps = `<ol class="st-co-steps" aria-label="Checkout progress">${CHECKOUT_STEPS.map((s, i) => `<li class="${i < step ? 'is-done' : i === step ? 'is-current' : ''}"${i === step ? ' aria-current="step"' : ''}><span class="st-co-dot">${i < step ? '✓' : i + 1}</span><span class="st-co-label">${s}</span></li>`).join('')}</ol>`
  return `<div class="st-co"><div class="st-co-top"><p class="st-co-secure">${LOCK}<span>Secure checkout</span></p>${steps}</div><div class="st-co-grid${aside ? '' : ' st-co-single'}"><div class="st-co-main">${main}</div>${aside ? `<aside class="st-co-aside">${aside}</aside>` : ''}</div></div>`
}
const checkoutAside = (state, pendingDelivery = false) => `${summary(state.cart, totals(state), pendingDelivery)}<ul class="st-co-assure"><li><b>FREE Click &amp; Collect</b> from your local store</li><li><b>FREE delivery</b> on orders over £20</li><li><b>Easy returns</b> in store or by post</li></ul>`
function render(req, res, title, body, errors = [], status = 200) {
  const base = url(res), qty = req.store.cart.reduce((sum, p) => sum + p.qty, 0)
  res.status(status).type('html').send(chrome({base,staticBase:res.locals.base,title,body:errorsHtml(errors)+body,qty,user:req.store.user,branch:retailState(req).smythsBranch,query:string(req.query.text)}))
}
function cards(res, list = products) {
  return `<div class="grid">${list.map(p => `<article class="panel">${productImage('smyths-toys',p,{className:'cover'})}<h2><a href="${url(res, p.path)}">${esc(p.title)}</a></h2><p class="price">${p.unit_price == null ? 'Price coming soon' : cash(p.unit_price)}</p><p>Download code in a box · Standard edition</p><p>Available from 12 November 2026</p><a class="button" href="${url(res, p.path)}">Pre-order</a></article>`).join('')}</div>`
}
function product(req, res, p, values = {}, errors = [], status = 200) {
  rememberProduct(req,p.sku)
  const base = url(res), ps5 = p.platform === 'ps5', sub = ps5 ? ['PlayStation 5 Pre-Order Games', '/gaming-and-tech/pre-order-games/playstation-5-pre-order-games/c/SM06040301'] : ['Xbox Series X Pre-Order Games', '/gaming-and-tech/pre-order-games/xbox-series-x-pre-order-games/c/SM06040302']
  const crumbs = `<nav class="st-crumbs" aria-label="Breadcrumb"><ol><li><a href="${base}">Home</a></li><li><a href="${base}/gaming-and-tech/c/SM0604">Gaming &amp; Tech</a></li><li><a href="${base}/gaming-and-tech/pre-order-games/c/SM060403">Pre-Order Games</a></li><li><a href="${base}${sub[1]}">${sub[0]}</a></li></ol></nav>`
  const buy = fixtureCatalog
    ? `<p class="price">${p.unit_price == null ? 'Price coming soon' : cash(p.unit_price)}</p><p>Standard edition · Download code in a box</p><form action="${url(res, '/cart/add')}" method="post"><input name="sku" type="hidden" value="${p.sku}">${field('qty', 'Quantity', { qty: values.qty ?? '1' }, { type: 'number' })}<button>Pre-order</button></form>${productJourney(req,base,p,values)}<div class="st-fulfil"><p><strong>Home Delivery</strong> — FREE</p><p><strong>Click &amp; Collect</strong> — FREE</p></div>`
    : `${p.unit_price == null ? '' : `<p class="price">${cash(p.unit_price)}</p>`}<p>Standard edition · Download code in a box</p><p class="notice">Coming soon — not yet available to order online.</p><button disabled>Check availability</button><div class="st-fulfil"><p><strong>Home Delivery</strong><br>Currently unavailable</p><p><strong>Click &amp; Collect</strong><br>Check stock before you travel</p></div>`
  const body = `${crumbs}<div class="columns st-pdp">${productGallery('smyths-toys',p)}<section class="st-buybox"><p class="st-brand">Rockstar Games</p><h1>${esc(p.title)}</h1><p class="st-ref">Ref: ${p.sku} · <span class="st-pegi">PEGI 18</span></p>${buy}<p><strong>This product only contains a download code inside the box. A disc will not be included.</strong></p><p>Pre-load, collection and delivery available from 12 November 2026. Playable from 19 November 2026.</p>${ps5 ? '<p>Requires a PlayStation account registered to the United Kingdom.</p>' : ''}</section></div>
<div class="st-pdp-tabs"><section class="panel"><h2>Key features</h2><ul><li>Pre-order to receive the Vintage Vice City Pack.</li><li>Pre-load starting on November 12th. Pre-orders collection and delivery available on November 12th. Playable from November 19th.</li><li>This product will only contain a download code inside the box to support pre-load. A disc will not be included.</li><li>Grand Theft Auto VI is a single-player experience.</li>${ps5 ? '<li>The PlayStation 5 version can only be used by users holding an account for PlayStation registered to the United Kingdom.</li>' : ''}</ul><p>Pre-order Price Promise: a lower Smyths price on dispatch or collection is honoured automatically. This cannot be combined with a money-off voucher.</p><p>No payment upfront for card pre-orders. Cards are pre-authorised 2–7 days before availability and charged on dispatch or collection. PayPal orders are paid in full upfront.</p></section>
<section class="panel"><h2>Product details</h2><p>Grand Theft Auto VI heads to the state of Leonida, home to the neon-soaked streets of Vice City and beyond. Jason and Lucia are caught up in a criminal conspiracy that stretches across the state.</p><dl><dt>Ref</dt><dd>${p.sku}</dd><dt>Platform</dt><dd>${ps5 ? 'PlayStation 5' : 'Xbox Series X'}</dd><dt>Edition</dt><dd>Standard</dd><dt>Format</dt><dd>Download code in a box</dd><dt>Age rating</dt><dd>PEGI 18</dd><dt>Release date</dt><dd>19 November 2026</dd></dl></section>
<section class="panel"><h2>Safety &amp; manufacturer information</h2><p>Publisher: Rockstar Games. Age rating PEGI 18 – not suitable for persons under 18 years of age. Manufacturer: Rockstar Games, 622 Broadway, New York, NY 10012, USA. Please retain this information for future reference.</p></section></div>`
  render(req, res, p.title, body, errors, status)
}

installSite(router,{ROOT,url,render,field,catalog})
installJourneys(router,{ROOT,url,render,field,catalog,catalogProduct,branches,cash,trustedLine,lineKey,cartErrors})

router.get(['/', ROOT, `${ROOT}/`], (req, res) => render(req, res, 'Toys, Baby, Outdoor, Gaming & Tech', homePage(url(res), catalog)))
// Category facet for a search: the aisles the matching products sit in, busiest first.
function searchCategories(list) {
 const counts = new Map()
 for (const p of list) { const code = p.shelf ? p.categoryCode : p.family === 'pre-order-games' ? 'SM060403' : null; if (code) counts.set(code, (counts.get(code) || 0) + 1) }
 return [...counts].sort((a, b) => b[1] - a[1]).map(([code]) => categoryByCode(code)).filter(Boolean).slice(0, 8)
}
router.get([`${ROOT}/search`, '/search'], (req, res) => {
 const q=string(req.query.text||req.query.q)
 if(q) req.store.smythsSearches=[q,...(req.store.smythsSearches||[]).filter(x=>x!==q)].slice(0,5)
 const recent=(req.store.smythsSearches||[]).length?`<div class="recent-searches">Recent searches: ${(req.store.smythsSearches||[]).map(q=>`<a href="${url(res,'/search')}?text=${encodeURIComponent(q)}">${esc(q)}</a>`).join(' · ')} <form action="${url(res,'/search/clear')}" method="post"><button class="secondary">Clear recent searches</button></form></div>`:''
 if(fixtureCatalog)return render(req,res,'Search results',catalogListing(url(res),catalog,req.query,q?`Search results for “${q}”`:'Shop all toys and games')+recent)
 const heading=q?`Search results for “${q}”`:'Shop all toys and games'
 const all=q?rankSearch(catalog,q):catalog
 render(req,res,q?`Search results for ${q}`:'Search results',listingPage(url(res),{all,facetCats:q?searchCategories(all):topDepartments,query:req.query,path:'/search',trail:[[heading,'/search']],head:`<h1 class="st-cat-h1">${esc(heading)}</h1>${recent}`,keep:{text:q},label:'your search',defaultSort:q?'relevance':'bestsellers',sorts:SEARCH_SORTS}))
})
router.post(`${ROOT}/search/clear`,(req,res)=>{req.store.smythsSearches=[];res.redirect(url(res,'/search'))})
for(const department of departments) router.get(`${ROOT}${departmentPaths[department]}`,(req,res)=>render(req,res,department,fixtureCatalog?departmentHub(url(res),department)+landingExtras(url(res),department):departmentLanding(url(res),department,catalog)))
router.get(`${ROOT}/category/:slug`,(req,res)=>{
 const p=catalog.find(p=>p.family===req.params.slug)
 if(!p)return render(req,res,'Category not found','<h1>Category not found</h1>',[],404)
 render(req,res,p.category,catalogListing(url(res),catalog,{...req.query,category:p.category},p.category))
})
router.get(`${ROOT}/brands/:slug`,(req,res)=>{
 const p=catalog.find(p=>slug(p.brand)===req.params.slug)
 if(!p)return render(req,res,'Brand not found','<h1>Brand not found</h1>',[],404)
 render(req,res,p.brand,catalogListing(url(res),catalog,{...req.query,brand:p.brand},p.brand))
})
router.get([`${ROOT}/campaigns/:slug`,`${ROOT}/gaming-and-tech/pre-order-games`],(req,res)=>{
 const campaign=req.params.slug||'pre-orders', selected={...req.query}
 if(campaign==='pocket-money')selected.max='15'
 else if(campaign==='pre-orders')selected.category='Pre-order games'
 else return render(req,res,'Campaign not found','<h1>Campaign not found</h1>',[],404)
 render(req,res,campaign==='pocket-money'?'Pocket money picks':'Gaming pre-orders',catalogListing(url(res),catalog,selected,campaign==='pocket-money'?'Pocket money picks — £15 and under':'Gaming pre-orders'))
})
router.get(`${ROOT}/gift-finder-hub`,(req,res)=>render(req,res,'Gift Finder',giftFinderIntro(url(res),req.query)+'<div class="st-gf-results">'+catalogListing(url(res),catalog,req.query,'Gift Finder','/gift-finder-hub')+'</div>'))
function ordinaryProduct(req,res,p,values=req.query,errors=[],status=200){
 rememberProduct(req,p.sku)
 if(p.shelf){const returnTo=typeof values.return==='string'&&/^\/search\?/.test(values.return)?values.return:'';return render(req,res,p.title,shelfProductPage(url(res),p,{values,returnTo,tools:productJourney(req,url(res),p,values)}),errors,status)}
 render(req,res,p.title,browseProduct(url(res),p,values,[],productJourney(req,url(res),p,values)),errors,status)
}
for(const p of shelf)router.get(`${ROOT}${p.path}`,(req,res)=>ordinaryProduct(req,res,p,req.query))
router.get(`${ROOT}/p/:sku`,(req,res,next)=>{const p=shelf.find(p=>p.sku===req.params.sku);return p?res.redirect(301,url(res,p.path)):next()})
router.get(`${ROOT}/medias/:sku/:view.svg`,(req,res)=>{
 const p=shelf.find(p=>p.sku===req.params.sku),view=Number(req.params.view)
 if(!p||!/^\d$/.test(req.params.view)||view>=shelfViews(p))return res.status(404).type('text').send('Image not found')
 res.set('Cache-Control','public, max-age=3600').type('image/svg+xml').send(shelfSvg(p,view))
})
router.get(`${ROOT}/catalog/:sku`, (req,res) => {
 const p=browseProducts.find(p=>p.sku===req.params.sku)
 const floor=shelf.find(p=>p.sku===req.params.sku)
 if(floor)return res.redirect(301,url(res,floor.path))
 if(!p)return render(req,res,'Product not found','<h1>Product not found</h1>',[],404)
 const opts=optionInput(p,req.query),invalid=Object.keys(opts).length&&!resolveProduct(p,opts)
 ordinaryProduct(req,res,p,req.query,invalid?['Choose a valid combination of product options.']:[],invalid?400:200)
})

for (const p of products) router.get([`${ROOT}${p.path}`, `/product/${p.sku}`], (req, res) => product(req, res, p))

function cart(req, res, errors = [], status = 200, values = {}) {
 const base=url(res)
 render(req,res,'Your basket',`<h1>Your basket</h1>${req.query.added?`<div class="notice"><h2>Added to your basket</h2><a href="${base}/search">Continue Shopping</a> · <a href="${base}/cart">View Basket</a> · <a href="${base}/checkout">Checkout</a></div>`:''}${req.store.cart.length?`<div class="basket-layout"><div class="basket-items">${req.store.cart.map(p=>`<section class="panel basket-item"><div class="basket-art">${artwork(resolveProduct(catalogProduct(p.sku),p.selectedOptions||{})||catalogProduct(p.sku))}</div><div><h2><a href="${base}${catalogProduct(p.sku).path}">${esc(p.title)}</a></h2><p>Ref: ${esc(p.sku)} · ${p.unit_price == null ? 'Price coming soon' : cash(p.unit_price)} · ${esc(itemDescription(p))}</p><form action="${base}/cart/update" method="post"><input name="sku" type="hidden" value="${esc(p.sku)}"><input name="key" type="hidden" value="${esc(p.key||p.sku)}">${field(`qty-${p.key||p.sku}`,'Quantity',{[`qty-${p.key||p.sku}`]:values[`qty-${p.key||p.sku}`]??p.qty},{type:'number'})}<button name="action" value="update">Update</button><button class="secondary" name="action" value="remove">Remove</button></form><form action="${base}/saved-for-later/save" method="post"><input name="key" type="hidden" value="${esc(p.key||p.sku)}"><button class="secondary">Save for later</button></form></div></section>`).join('')}<a href="${base}/search">Continue Shopping</a></div><aside class="basket-summary">${summary(req.store.cart,totals(req.store),!req.store.checkout.fulfillment)}<p>Home Delivery: £2.99 for orders under £20, FREE over £20. Express adds £1.99 where available. Click &amp; Collect is FREE.</p><form action="${base}/cart/voucher" method="post">${field('voucher','Voucher code',values,{required:false})}<button class="secondary">Apply voucher</button></form><p><a class="button" href="${base}/checkout">Checkout</a></p></aside></div>`:`<p>Your basket is empty.</p><a href="${base}/search">Continue Shopping</a>`}`,errors,status)
}
router.get([`${ROOT}/cart`, '/cart'], (req, res) => cart(req, res))
router.post(`${ROOT}/cart/add`, (req, res) => {
 const p=catalogProduct(string(req.body.sku))
 if(!p)return render(req,res,'Product unavailable','<h1>Choose an available product</h1>'+cards(res),['Please select a platform or product from the product listings.'],400)
 const options=optionInput(p,req.body),selected=resolveProduct(p,options)
 const unknown=Object.keys(req.body).some(k=>k.startsWith('option_')&&!(p.options||[]).some(o=>`option_${o.name}`===k))
 if(!selected||unknown)return p.kind==='game'?product(req,res,p,req.body,['Choose a valid product option.'],400):ordinaryProduct(req,res,p,req.body,['Choose a valid value for every product option.'],400)
 const qty=typeof req.body.qty==='string'?Number(req.body.qty):NaN,key=lineKey(p,selected),line=req.store.cart.find(l=>(l.key||`${l.sku}:base`)===key)
 const aggregate=req.store.cart.filter(l=>l.sku===p.sku).reduce((sum,l)=>sum+l.qty,0)
 if(!Number.isInteger(qty)||qty<1||qty+(line?.qty||0)>quantityLimit(selected)||qty+aggregate>quantityLimit(p))return p.kind==='game'?product(req,res,p,{qty:string(req.body.qty)},['Choose a quantity from 1 to 4; no more than 4 copies of each game.'],400):ordinaryProduct(req,res,p,req.body,['Choose a whole quantity within current stock and the purchase limit.'],400)
 if(line)line.qty+=qty
 else req.store.cart.push(trustedLine(p,selected,qty))
 req.store.checkout={}
 res.redirect(url(res,'/cart?added=1'))
})
router.post(`${ROOT}/cart/update`, (req, res) => {
 const matching=req.store.cart.filter(p=>p.sku===string(req.body.sku)),key=string(req.body.key)
 const line=key?matching.find(p=>(p.key||p.sku)===key):matching.length===1?matching[0]:null
 if(!line)return cart(req,res,['Choose the exact basket line to update. This item may no longer be in your basket.'],400)
 if(req.body.action==='remove')req.store.cart=req.store.cart.filter(p=>p!==line)
 else {
  const name=`qty-${line.key||line.sku}`,raw=req.body[name]??req.body[`qty-${line.sku}`],qty=typeof raw==='string'?Number(raw):NaN,p=catalogProduct(line.sku),selected=resolveProduct(p,line.selectedOptions||{}),aggregate=req.store.cart.filter(l=>l.sku===p.sku&&l!==line).reduce((sum,l)=>sum+l.qty,0)
  if(!selected||!Number.isInteger(qty)||qty<1||qty>quantityLimit(selected)||qty+aggregate>quantityLimit(p))return cart(req,res,['Choose a whole quantity within current stock and the purchase limit.'],400,{[name]:string(raw)})
  line.qty=qty
 }
 req.store.checkout={}
 res.redirect(url(res,'/cart'))
})
// ASSUMPTION: no valid promotional vouchers are seeded in this benchmark.
router.post(`${ROOT}/cart/voucher`, (req, res) => cart(req, res, ['This voucher code is invalid or cannot be used with these items.'], 400, { voucher: string(req.body.voucher) }))

// ASSUMPTION: checkout route suffixes, screen layout and field labels were not observed behind Smyths' bot wall.
function gate(req, res, values = {}, errors = [], status = 200) {
  render(req, res, 'Sign in or continue as guest', checkoutFrame(0, `<h1>Checkout</h1><div class="st-co-auth"><section class="st-co-card"><h2>Returning customer</h2><p class="st-co-hint">Sign in to use your saved addresses and track your order in My Account.</p><form action="${url(res, '/checkout')}" method="post"><input name="action" value="signin" type="hidden">${field('email', 'Email address', values, { type: 'email', autocomplete: 'email' })}${field('password', 'Password', {}, { type: 'password', autocomplete: 'current-password' })}<button>Sign in</button></form></section><section class="st-co-card st-co-guest"><h2>New customer</h2><p class="st-co-hint">No account? Check out as a guest. We’ll send your order confirmation and updates to this email address.</p><form action="${url(res, '/checkout')}" method="post"><input name="action" value="guest" type="hidden"><label for="guest_email">Email address</label><input id="guest_email" name="email" type="email" autocomplete="email" value="${esc(values.email)}" required><button>Continue as guest</button></form><p class="st-co-alt">Want to save your details for next time? <a href="${url(res, '/register')}">Register</a></p></section></div>`, checkoutAside(req.store, true)), errors, status)
}
function guard(step = 0) {
  return (req, res, next) => {
    const c = req.store.checkout
    if (!req.store.cart.length) return res.redirect(url(res, '/cart'))
    if (!c.email) return res.redirect(url(res, '/checkout'))
    if (step >= 1 && !c.fulfillment) return res.redirect(url(res, '/checkout/method'))
    if (step >= 2 && !c.address) return res.redirect(url(res, '/checkout/details'))
    if (step >= 3 && !c.payment) return res.redirect(url(res, '/checkout/payment'))
    next()
  }
}
router.get([`${ROOT}/checkout`, '/checkout'], (req, res) => {
  if (!req.store.cart.length) return res.redirect(url(res, '/cart'))
  if (req.store.user) req.store.checkout.email = req.store.user.email
  if (req.store.checkout.email) return res.redirect(url(res, '/checkout/method'))
  gate(req, res)
})
router.post(`${ROOT}/checkout`, (req, res) => {
  if (!req.store.cart.length) return res.redirect(url(res, '/cart'))
  const email = string(req.body.email).toLowerCase()
  if (!emailValid(email)) return gate(req, res, { email }, ['Enter a valid email address.'], 400)
  if (req.body.action === 'signin') {
    const account = authenticate('smyths-toys', email, typeof req.body.password==='string'?req.body.password:'')
    if (!account) return gate(req, res, { email }, ['The email address or password is incorrect.'], 401)
    req.store.user = publicAccount(account)
    Object.assign(req.store.user,retailState(req).profile||{})
  } else if (req.body.action === 'guest') req.store.user = null
  else return gate(req, res, { email }, ['Choose Sign in or Continue as guest.'], 400)
  req.store.checkout = { email }
  res.redirect(url(res, '/checkout/method'))
})

function method(req, res, values = {}, errors = [], status = 200) {
  const query = string(values.store_query).toLowerCase()
  const matches = branches.filter(b => !query || `${b.name} ${b.city} ${b.postcode}`.toLowerCase().includes(query))
  const preorder = hasPreorder(req.store.cart), subtotal = totals(req.store).subtotal
  const homeNote = preorder ? 'Pre-orders delivered from 12 November 2026' : `${subtotal < 20 ? '£2.99 standard delivery on orders under £20' : 'FREE standard delivery'} · Express available`
  render(req, res, 'Delivery method', checkoutFrame(1, `<h1>Delivery method</h1>${shippingAvailable(req) ? '' : '<p role="alert">Shipping unavailable. Availability changed after this item was selected.</p>'}<form action="${url(res, '/checkout/method')}" method="post" class="st-co-form"><p class="st-co-q">How would you like to receive your order?</p><div class="st-co-options"><label class="choice st-co-option" for="home"><input id="home" name="method" value="ship" type="radio"${values.method !== 'pickup' ? ' checked' : ''}${shippingAvailable(req) ? '' : ' disabled'}> <span class="st-co-opt"><b>Home Delivery</b><small>${homeNote}</small></span></label><label class="choice st-co-option" for="collect"><input id="collect" name="method" value="pickup" type="radio"${values.method === 'pickup' ? ' checked' : ''}> <span class="st-co-opt"><b>Click &amp; Collect — FREE</b><small>${preorder ? 'Collect from 12 November 2026' : 'Usually ready within 2 hours'}</small></span></label></div><fieldset class="st-co-card st-co-stores"><legend>Check Store Stock</legend><p class="st-co-hint">For Click &amp; Collect, choose the store you’d like to collect from.</p><div class="st-co-find">${field('store_query', 'Town or postcode', values, { required: false })}<button class="secondary" name="action" value="find" formnovalidate>Find stores</button></div>${matches.map(b => `<label class="choice st-co-store" for="${b.id}"><input id="${b.id}" name="store_id" type="radio" value="${b.id}"${values.store_id === b.id ? ' checked' : ''}> <span class="st-co-opt"><b>${esc(b.name)}</b><small>${esc(b.city)} ${esc(b.postcode)} · ${preorder ? 'Collect from 12 November' : 'Mon–Sat 9am–8pm, Sun 11am–5pm'}</small></span></label>`).join('') || '<p>No stores found. Try London or Manchester.</p>'}<p class="st-co-note">Click &amp; Collect orders are held for 2 days. Bring photo ID and the Ready for Collection email. A £2 non-collection fee applies.</p></fieldset><button name="action" value="continue" class="st-co-next">Continue</button></form>`, checkoutAside(req.store, !req.store.checkout.fulfillment)), errors, status)
}
router.get(`${ROOT}/checkout/method`, guard(), (req, res) => method(req, res, req.store.checkout.methodValues||{store_id:retailState(req).smythsBranch}))
router.post(`${ROOT}/checkout/method`, guard(), (req, res) => {
  const v = pick(req.body, ['method', 'store_id', 'store_query'])
  if (req.body.action === 'find') return method(req, res, { ...v, method: 'pickup' })
  const branch = branches.find(b => b.id === v.store_id)
  if (!['ship', 'pickup'].includes(v.method) || (v.method === 'pickup' && !branch)) return method(req, res, v, ['Choose Home Delivery or select a Click & Collect store.'], 400)
  const stockErrors=cartErrors(req.store,{method:v.method,store_id:v.store_id})
  if(stockErrors.length)return method(req,res,v,stockErrors,400)
  const co = req.store.checkout
  co.methodValues = v
  co.fulfillment = v.method === 'pickup' ? { method: 'pickup', option: 'click_and_collect', store_id: branch.id, store_location: branch.name, eta: hasPreorder(req.store.cart) ? '12 November 2026' : 'Ready for collection after confirmation' } : { method: 'ship', eta: hasPreorder(req.store.cart) ? '12 November 2026' : 'Usually 2–4 working days' }
  delete co.address; delete co.payment; delete co.token; delete co.delivery_option
  res.redirect(url(res, '/checkout/details'))
})
const ADDRESS_KEYS = ['title', 'first_name', 'last_name', 'phone', 'line1', 'line2', 'city', 'state', 'postal_code', 'country']
function addressFields(values, prefix = '') {
  const specs = [['first_name', 'First name', 'given-name'], ['last_name', 'Last name', 'family-name'], ['line1', 'Address line 1', 'address-line1'], ['line2', 'Address line 2', 'address-line2'], ['city', 'Town/City', 'address-level2'], ['state', 'County', 'address-level1'], ['postal_code', 'Postcode', 'postal-code']]
  const f = ([key, label, autocomplete]) => `<div class="st-co-field">${field(prefix + key, label, values, { autocomplete, required: !['line2', 'state'].includes(key) })}</div>`
  const [first, last, line1, line2, city, county, postcode] = specs.map(f)
  return `<div class="st-co-row">${first}${last}</div>${line1}${line2}<div class="st-co-row">${city}${county}</div><div class="st-co-row">${postcode}<div class="st-co-field"><label for="${prefix}country">Country</label><select id="${prefix}country" name="${prefix}country"><option value="GB">United Kingdom</option></select></div></div>`
}
function addressErrors(v) {
  const errors = []
  for (const [key, label] of [['first_name', 'first name'], ['last_name', 'last name'], ['line1', 'address line 1'], ['city', 'town or city']]) if (!v[key]) errors.push(`Enter your ${label}.`)
  if (!postcodeValid(v.postal_code)) errors.push('Enter a valid UK postcode.')
  if (v.country !== 'GB') errors.push('Choose United Kingdom as the country.')
  return errors
}
function details(req, res, values = {}, errors = [], status = 200) {
  const pickup = req.store.checkout.fulfillment.method === 'pickup'
  const preorder = hasPreorder(req.store.cart), co = req.store.checkout
  const titles = ['Mr', 'Mrs', 'Miss', 'Ms', 'Mx', 'Dr'], title = typeof values.title === 'string' ? values.title : ''
  const titleSelect = `<div class="st-co-field st-co-title"><label for="title">Title</label><select id="title" name="title" autocomplete="honorific-prefix"><option value="">Select</option>${[...titles, ...(title && !titles.includes(title) ? [title] : [])].map(t => `<option${t === title ? ' selected' : ''}>${esc(t)}</option>`).join('')}</select></div>`
  const saved = req.store.user&&retailState(req).addresses.length?`<form method="get" class="st-co-saved"><label for="address_id">Use a saved address</label><div><select id="address_id" name="address_id">${retailState(req).addresses.map(a=>`<option value="${a.id}"${values.address_id===a.id?' selected':''}>${esc(a.label||a.name)} — ${esc(a.postal_code)}${a.is_default?' (Default)':''}</option>`).join('')}</select><button class="secondary">Use address</button></div></form>`:''
  const where = pickup ? `<p class="st-co-chosen"><b>Click &amp; Collect</b> · ${esc(co.fulfillment.store_location)}</p>` : '<p class="st-co-chosen"><b>Home Delivery</b></p>'
  render(req, res, 'Your details', checkoutFrame(2, `<h1>Your details</h1>${where}${saved}<form action="${url(res, '/checkout/details')}" method="post" class="st-co-form"><section class="st-co-card"><h2>Contact details</h2>${titleSelect}<div class="st-co-row"><div class="st-co-field">${field('email', 'Email address', { email: values.email ?? co.email }, { type: 'email', autocomplete: 'email' })}</div><div class="st-co-field">${field('phone', 'Phone number', values, { type: 'tel', autocomplete: 'tel' })}</div></div><p class="st-co-hint">We’ll only use these to contact you about your order.</p></section><section class="st-co-card"><h2>${pickup ? 'Billing' : 'Delivery'} address</h2>${addressFields(values)}</section>${pickup ? `<fieldset class="st-co-card"><legend>Someone else collecting? (optional)</legend><p class="st-co-hint">Tell us who will collect the order. They’ll need photo ID and the Ready for Collection email.</p><div class="st-co-row">${[['first_name', 'First name'], ['last_name', 'Last name']].map(([key, label]) => `<div class="st-co-field">${field('pickup_' + key, label, values, { required: false })}</div>`).join('')}</div><div class="st-co-row">${[['email', 'Email address'], ['phone', 'Phone number']].map(([key, label]) => `<div class="st-co-field">${field('pickup_' + key, label, values, { required: false })}</div>`).join('')}</div></fieldset>` : ''}${pickup ? '' : `<fieldset class="st-co-card"><legend>Delivery option</legend><div class="st-co-options"><label class="choice st-co-option" for="standard"><input id="standard" name="delivery_option" type="radio" value="standard"${values.delivery_option !== 'express' ? ' checked' : ''}> <span class="st-co-opt"><b>Standard Delivery</b><small>${preorder ? 'From 12 November 2026' : '2–4 working days'}</small></span><strong class="st-co-price">${totals(req.store).subtotal<20?'£2.99':'FREE'}</strong></label><label class="choice st-co-option" for="express"><input id="express" name="delivery_option" type="radio" value="express"${values.delivery_option === 'express' ? ' checked' : ''}> <span class="st-co-opt"><b>Express</b><small>${preorder ? 'From 12 November 2026' : '1–2 working days · Mon–Fri'}</small></span><strong class="st-co-price">${cash((totals(req.store).subtotal<20?2.99:0)+1.99)}</strong></label></div><p class="st-co-note">${preorder?'Pre-orders available for delivery from 12 November 2026.':'Express delivery is not available to the Scottish Highlands, Northern Ireland or the islands.'}</p></fieldset>`}<button class="st-co-next">Continue to payment</button></form>`, checkoutAside(req.store)), errors, status)
}
router.get(`${ROOT}/checkout/details`, guard(1), (req, res) => {
 const saved=req.store.user?(req.query.address_id?retailState(req).addresses.find(a=>a.id===req.query.address_id):defaultAddress(req)):null
 if(req.query.address_id&&!saved)return details(req,res,{},['Address not found in this account.'],404)
 const names=saved?.name.split(/\s+/)||[]
 const values=saved?{...saved,address_id:saved.id,first_name:names.slice(0,-1).join(' ')||names[0],last_name:names.length>1?names.at(-1):req.store.user.last_name,country:'GB'}:{country:'GB',first_name:req.store.user?.first_name,last_name:req.store.user?.last_name,phone:req.store.user?.phone}
 if(req.query.address_id){delete req.store.checkout.payment;delete req.store.checkout.token;delete req.store.checkout.reviewSnapshot}
 details(req,res,req.query.address_id?values:req.store.checkout.detailValues||values)
})
router.post(`${ROOT}/checkout/details`, guard(1), (req, res) => {
  const co = req.store.checkout, v = pick(req.body, [...ADDRESS_KEYS, 'email', 'delivery_option', 'pickup_first_name', 'pickup_last_name', 'pickup_email', 'pickup_phone']), errors = addressErrors(v)
  if (!emailValid(v.email)) errors.push('Enter a valid email address.')
  if (!/^[+\d][\d\s().-]{6,20}$/.test(v.phone)) errors.push('Enter a valid phone number.')
  if (co.fulfillment.method === 'ship' && !['standard', 'express'].includes(v.delivery_option)) errors.push('Choose a delivery option.')
  // ASSUMPTION: postal exclusions use these broad prefixes for the local Express simulation.
  if (co.fulfillment.method === 'ship' && v.delivery_option === 'express' && /^(BT|IM|IV|HS|KW|ZE)/i.test(v.postal_code)) errors.push('Express delivery is unavailable for this postcode. Choose Standard Delivery.')
  if (co.fulfillment.method === 'pickup' && ['pickup_first_name','pickup_last_name','pickup_email','pickup_phone'].some(key => v[key]) && (!v.pickup_first_name || !v.pickup_last_name || !emailValid(v.pickup_email) || !/^[+\d][\d\s().-]{6,20}$/.test(v.pickup_phone))) errors.push('Enter the pickup person’s name, valid email and phone.')
  if (errors.length) return details(req, res, v, errors, 400)
  co.email = req.store.user?.email ?? v.email.toLowerCase()
  co.pickupPerson = co.fulfillment.method === 'pickup' ? { first_name: v.pickup_first_name || v.first_name, last_name: v.pickup_last_name || v.last_name, email: v.pickup_email || v.email, phone: v.pickup_phone || v.phone } : null
  co.detailValues = v
  co.address = pick(v, ADDRESS_KEYS)
  co.address.postal_code = co.address.postal_code.toUpperCase()
  co.delivery_option = co.fulfillment.method === 'ship' ? v.delivery_option : null
  delete co.payment; delete co.token
  res.redirect(url(res, '/checkout/payment'))
})

function payment(req, res, values = {}, errors = [], status = 200) {
  const preorder = hasPreorder(req.store.cart)
  const brands = ['Visa', 'Mastercard', 'Amex', 'Maestro'].map(b => `<span class="st-co-brand st-co-brand-${b.toLowerCase()}">${b}</span>`).join('')
  render(req, res, 'Payment', checkoutFrame(3, `<h1>Payment</h1><form action="${url(res, '/checkout/payment')}" method="post" class="st-co-form"><fieldset class="st-co-card"><legend>Payment method</legend><div class="st-co-options"><label class="choice st-co-option" for="card"><input id="card" name="payment_method" value="card" type="radio"${values.payment_method !== 'paypal' ? ' checked' : ''}> <span class="st-co-opt"><b>Credit / Debit Card</b><small>${preorder?'There’s no payment upfront for pre-orders. Your card is pre-authorised 2–7 days before availability and charged on dispatch or collection.':'Payment is taken when you place your order.'}</small></span><span class="st-co-brands">${brands}</span></label><label class="choice st-co-option" for="paypal"><input id="paypal" name="payment_method" value="paypal" type="radio"${values.payment_method === 'paypal' ? ' checked' : ''}> <span class="st-co-opt"><b>PayPal</b><small>Full payment upfront. You’ll confirm your PayPal payment on the next step.</small></span><span class="st-co-brands"><span class="st-co-brand st-co-brand-paypal">PayPal</span></span></label></div>${preorder&&req.store.cart.some(p=>!isPreorder(p))?'<p class="st-co-note">In-stock items in this basket are charged when the order is placed and processed separately from pre-orders.</p>':''}${publicNotice('<p>This is not the real Smyths Toys website: no card is charged and no PayPal payment is taken.</p>')}</fieldset><fieldset class="st-co-card st-co-cardform"><legend>Card details</legend><p class="st-co-hint">Paying by PayPal? You can leave these blank.</p><div class="st-co-field">${field('card_number', 'Card number', {}, { autocomplete: 'cc-number', required: false })}</div><div class="st-co-row"><div class="st-co-field">${field('expiry', 'Expiry date (MM/YY)', values, { autocomplete: 'cc-exp', required: false })}</div><div class="st-co-field">${field('cvv', 'Security code (CVC)', {}, { type: 'password', autocomplete: 'cc-csc', required: false })}</div></div><div class="st-co-field">${field('name_on_card', 'Name on card', values, { autocomplete: 'cc-name', required: false })}</div></fieldset><section class="st-co-card"><h2>Billing address</h2><label class="choice" for="billing_same"><input id="billing_same" name="billing_same" value="1" type="checkbox"${values.billing_same !== '0' ? ' checked' : ''}> Billing address same as ${req.store.checkout.fulfillment.method === 'pickup' ? 'your details' : 'delivery address'}</label><details${values.billing_same === '0' ? ' open' : ''}><summary>Use a different billing address</summary>${addressFields(values, 'billing_').replaceAll(' required', '')}</details></section><button class="st-co-next">Continue to review</button></form>`, checkoutAside(req.store)), errors, status)
}
router.get(`${ROOT}/checkout/payment`, guard(2), (req, res) => payment(req, res))
router.post(`${ROOT}/checkout/payment`, guard(2), (req, res) => {
  const co = req.store.checkout, b = req.body
  // Only these safe display values survive re-rendering. PAN and CVC never enter session state or HTML.
  const v = { ...pick(b, ['payment_method', 'expiry', 'name_on_card', ...ADDRESS_KEYS.map(k => `billing_${k}`)]), billing_same: b.billing_same === '1' ? '1' : '0' }
  const errors = []
  let sanitized
  if (v.payment_method === 'card') {
    const result = validateCard({ number: string(b.card_number), expiry: v.expiry, cvv: string(b.cvv) })
    if (!result.ok) errors.push(...Object.values(result.errors))
    if (!v.name_on_card) errors.push('Enter the name on your card.')
    if (result.ok) sanitized = { method: 'card', brand: result.brand, last4: result.last4, name_on_card: v.name_on_card }
  } else if (v.payment_method === 'paypal') {
    // ASSUMPTION: PayPal authorization is simulated locally and confirmed on the final review screen.
    sanitized = { method: 'paypal' }
  } else errors.push('Choose Card or PayPal.')
  const billing = v.billing_same === '1' ? { ...co.address } : Object.fromEntries(ADDRESS_KEYS.map(k => [k, v[`billing_${k}`] ?? '']))
  if (v.billing_same !== '1') errors.push(...addressErrors(billing))
  if (errors.length) { delete co.payment; delete co.token; return payment(req, res, v, errors, 400) }
  co.billing = billing
  co.payment = sanitized
  co.token = randomBytes(16).toString('hex')
  co.reviewSnapshot = checkoutSnapshot(req)
  res.redirect(url(res, '/checkout/review'))
})
function addressText(a) { return [a.first_name + ' ' + a.last_name, a.line1, a.line2, a.city, a.postal_code, 'United Kingdom'].filter(Boolean).map(esc).join('<br>') }
function review(req, res, errors = [], status = 200) {
  const co = req.store.checkout
  render(req, res, 'Review & place order', checkoutFrame(4, `<h1>Review &amp; place order</h1><div class="st-co-review"><section class="st-co-card"><div class="st-co-card-head"><h2>${co.fulfillment.method === 'pickup' ? 'Click &amp; Collect' : 'Home Delivery'}</h2><a href="${url(res, '/checkout/details')}">Edit address</a></div><p>${co.fulfillment.method === 'pickup' ? esc(co.fulfillment.store_location) + '<br>' + esc(co.pickupPerson?.first_name || '') + ' ' + esc(co.pickupPerson?.last_name || '') : `${co.delivery_option === 'express' ? 'Express' : 'Standard Delivery'}<br>${addressText(co.address)}`}</p><p class="st-co-hint">${hasPreorder(req.store.cart)?'Pre-orders: available from 12 November 2026. Playable from 19 November 2026. Other items are processed separately.':'In-stock items are processed after order confirmation.'}</p><p>Email: ${esc(co.email)}</p></section><section class="st-co-card"><div class="st-co-card-head"><h2>Payment</h2><a href="${url(res, '/checkout/payment')}">Edit payment</a></div><p>${co.payment.method === 'card' ? `${esc(co.payment.brand)} ending ${esc(co.payment.last4)} — ${hasPreorder(req.store.cart)?`pre-orders charged on ${co.fulfillment.method === 'pickup' ? 'collection' : 'dispatch'}`:'charged when your order is placed'}` : 'PayPal — full payment upfront'}</p></section></div><form action="${url(res, '/checkout/place-order')}" method="post" class="st-co-card st-co-place"><input type="hidden" name="token" value="${co.token}"><label class="choice" for="terms"><input type="checkbox" id="terms" name="terms" value="1" required> I have read and agree to the Terms &amp; Conditions</label><details><summary>Terms &amp; Conditions</summary><p>For pre-orders, the Pre-order Price Promise applies and cards are charged on dispatch or collection. Ordinary items and PayPal are charged upfront. For Click &amp; Collect, wait for your Ready for Collection email, bring photo ID and collect within 2 days. A £2 non-collection fee applies.</p></details><button class="st-co-next">Place Order</button></form>`, checkoutAside(req.store)), errors, status)
}
router.get(`${ROOT}/checkout/review`, guard(3), (req, res) => review(req, res))
router.post(`${ROOT}/checkout/place-order`, guard(3), (req, res) => {
  const co = req.store.checkout
  if (req.body.terms !== '1') return review(req, res, ['Please agree to the Terms & Conditions.'], 400)
  if (!co.token || req.body.token !== co.token) return review(req, res, ['Your order review has changed. Review it and submit again.'], 400)
  const currentErrors=cartErrors(req.store,co.fulfillment)
  if(addressErrors(co.address).length || (co.fulfillment.method==='pickup'&&!branches.some(b=>b.id===co.fulfillment.store_id)) || (co.fulfillment.method==='ship'&&!['standard','express'].includes(co.delivery_option)))currentErrors.push('Please check your delivery details again.')
  if(co.fulfillment.method==='ship'&&co.delivery_option==='express'&&/^(BT|IM|IV|HS|KW|ZE)/i.test(co.address.postal_code))currentErrors.push('Express delivery is unavailable for this postcode.')
  if(co.reviewSnapshot!==checkoutSnapshot(req))currentErrors.push('Your order review has changed. Review your basket and checkout again.')
  if(currentErrors.length){req.store.checkout={};return cart(req,res,currentErrors,400)}
  const rejected = scenarioPayment(req.store, co.payment, req.store.cart)
  if (rejected) { const values = { payment_method: co.payment.method, name_on_card: co.payment.name_on_card }; delete co.payment; delete co.token; delete co.reviewSnapshot; return payment(req,res,values,[rejected],402) }
  const pickup = co.fulfillment.method === 'pickup', preorder=hasPreorder(req.store.cart), ordinary=req.store.cart.some(p=>!isPreorder(p))
  const order = recordOrder({
    store: 'smyths-toys',
    // ASSUMPTION: real order-number format was not found; a prefixed random number is used here.
    order_number: `ST${randomInt(100000000, 1000000000)}`,
    session: req.session, items: req.store.cart.map(line => trustedLine(catalogProduct(line.sku),resolveProduct(catalogProduct(line.sku),line.selectedOptions||{}),line.qty)),
    customer: { email: co.email, first_name: co.address.first_name, last_name: co.address.last_name, phone: co.address.phone, guest: !req.store.user, account_id: req.store.user?.id ?? null },
    fulfillment: { ...co.fulfillment, ...(pickup ? {} : { option: co.delivery_option }) },
    shipping_address: pickup ? null : { ...co.address }, billing_address: { ...co.billing }, payment: { ...co.payment }, totals: totals(req.store), currency: 'GBP',
    meta: { ...(pickup ? { pickup_store_id: co.fulfillment.store_id, pickup_person: co.pickupPerson, items_fulfillment: req.store.cart.map(item => ({sku:item.sku,fulfillment:'pickup'})) } : {}), ...(preorder?{availability_date:'2026-11-12',release_date:'2026-11-19',price_promise:true}:{}), charged: co.payment.method==='paypal'||!preorder?'in full at order':pickup?'on collection':'on dispatch', ...(preorder&&ordinary?{ordinary_items_charged:'in full at order',separate_processing:true}:{}), options:req.store.cart.filter(p=>p.kind==='other').map(p=>({sku:p.sku,variant_id:p.variant_id,options:p.selectedOptions,quantity:p.qty,line_index:req.store.cart.indexOf(p)})), synthetic_checkout:true },
  })
  req.store.cart = []
  req.store.checkout = {}
  res.redirect(url(res, `/checkout/confirmation?order=${order.order_number}`))
})
router.get(`${ROOT}/checkout/confirmation`, (req, res) => {
  const order = privateOrder(req,string(req.query.order))
  if (!order) return render(req, res, 'Order not found', '<h1>Order not found</h1><p>We could not find an order in this session.</p>', [], 404)
  if(order.meta.lifecycle?.length)return res.redirect(url(res,`/orders/${order.order_number}`))
  render(req, res, 'Thank you for your order', `<div class="st-co st-co-done"><section class="st-co-thanks"><span class="st-co-tick" aria-hidden="true">✓</span><div><h1>Thank you for your order</h1><p>Your order number is <strong data-order-number>${esc(order.order_number)}</strong>.</p><p>Order confirmation for ${esc(order.customer.email)}. We’ve emailed your confirmation with your order number and barcode.</p></div></section><div class="st-co-grid"><div class="st-co-main"><section class="st-co-card"><h2>${order.fulfillment.method === 'pickup' ? 'Click &amp; Collect' : 'Home Delivery'}</h2><p>${order.fulfillment.method === 'pickup' ? esc(order.fulfillment.store_location) + '<br>Wait for your Ready for Collection email. Bring photo ID and collect within 2 days.' : addressText(order.shipping_address)}</p><p>${hasPreorder(order.items)?'Pre-orders: available from 12 November 2026. Playable from 19 November 2026.':'Your in-stock items are being processed.'}</p>${order.meta.ordinary_items_charged?'<p>In-stock items are charged in full at order and processed separately from pre-orders.</p>':''}</section><section class="st-co-card"><h2>Payment</h2><p>${order.payment.method === 'card' ? `${esc(order.payment.brand)} ending ${esc(order.payment.last4)} ${hasPreorder(order.items)?'will be charged':'was charged'} ${esc(order.meta.charged)}.${hasPreorder(order.items)?' Pre-authorisation occurs 2–7 days before availability.':''}` : 'PayPal: full payment upfront.'}</p></section><p class="st-co-actions"><a class="button" href="${url(res,`/orders/${order.order_number}`)}">View order details &amp; tracking</a> <a href="${url(res)}">Continue Shopping</a></p></div><aside class="st-co-aside">${summary(order.items.map((p,index)=>({...p,selectedOptions:order.meta.options?.find(o=>o.line_index===index)?.options})), order.totals)}</aside></div></div>`)
})
router.use((req, res) => render(req, res, 'Page not found', `<h1>Page not found</h1><p><a href="${url(res)}">Continue Shopping</a></p>`, [], 404))

export default { slug: 'smyths-toys', name: NAME, country: 'UK', currency: 'GBP', gta6_available: fixtureCatalog ? true : null, availability_status: fixtureCatalog ? 'available' : 'listing_only', description: fixtureCatalog ? 'UK code-in-box preorder fixture with checkout.' : 'UK GTA VI listings; ordering availability unverified.', router }

registerScenarioAdapter('smyths-toys', { seed(store, id, qty) { const p = catalogProduct(id); store.cart = [trustedLine(p, resolveProduct(p, {}), qty)] } })
