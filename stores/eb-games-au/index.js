import { enterScenarioCart, scenarioPayment, scenarioAvailability, registerScenarioAdapter } from '../../lib/benchmark-scenarios.js'
import { fixtureCatalog } from '../../lib/catalog-policy.js'
import { productImage, productGallery } from '../../lib/product-assets.js'
import express from 'express'
import { orderStatus } from '../../lib/retail-state.js'
import { installJourneys, preferredStore, ownOrder, rememberSelection, productJourney, saveCartControl, addressCheckout, addressPicker, selectedAddress } from './journeys.js'
import { randomInt, randomBytes, createHash } from 'node:crypto'
import { GAME } from '../../lib/catalog.js'
import { esc, money, disclaimer } from '../../lib/html.js'
import { validateCard } from '../../lib/payment.js'
import { getOrder, recordOrder } from '../../lib/orders.js'

import { shelfArtSvg } from './shelf-art.js'
import { browseProducts, shopProducts, departments, brands, hubs, matching, browseTiles, browseProduct, catalogPage, resolveProduct, productArt } from './browse.js'
import { canonicalProducts as PRODUCTS } from './canonical-products.js'
import { header as siteHeader, footer as siteFooter, installSite, homePage, mapSearch, hubIntro, hubRows, tileRow } from './site.js'
import { ownedOrders } from '../../lib/retail-state.js'

const router = express.Router()
router.use((req, res, next) => {
  enterScenarioCart(req.store)
  const items = [...(req.store.cart || []), ...(req.store.buyNow ? [req.store.buyNow] : []), ...(req.store.gmarketPurchase?.items || [])]
  if ((/checkout/.test(req.path) || req.method === 'GET' && /cart/.test(req.path)) && items.some(item => scenarioAvailability(req.store, item.sku ?? item.pid, 'shipping') === false)) {
    const body = '<h1>Item unavailable</h1><p role="alert">Shipping unavailable. Availability changed after this item was selected. No order was placed.</p>'
    render(req, res, 'Item unavailable', body, 409)
    return
  }
  next()
})

const NAME = 'EB Games (Australia)'
const SLUG = 'eb-games-au'
const price = n => money(n, 'AUD')
const str = v => typeof v === 'string' ? v.trim() : ''
const round = n => Math.round(n * 100) / 100
const emailOK = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
const STATES = ['ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA']
// ASSUMPTION: checkout URLs, layout, delivery fees and sample pickup stores were not observed.
// Delivery fees are part of the later balance; only the A$10-per-copy deposit is paid now.
const SHIPPING = {
  standard: { name: 'Standard Delivery', fee: 7.95, eta: '2–7 business days after dispatch' },
  express: { name: 'Express Delivery', fee: 12.95, eta: '1–3 business days after dispatch' },
}
const STORES = fixtureCatalog ? [
  { id: 'sydney', name: 'EB Games Sydney', location: 'Sydney NSW 2000' },
  { id: 'melbourne', name: 'EB Games Melbourne', location: 'Melbourne VIC 3000' },
  { id: 'brisbane', name: 'EB Games Brisbane', location: 'Brisbane QLD 4000' },
] : []
const bySku = id => PRODUCTS.find(p => p.sku === id) || shopProducts.find(p => p.sku === id)
const canonical = p => PRODUCTS.includes(p)
const preorderItems = store => store.cart.some(i => canonical(bySku(i.sku)))
const lineDetails = i => canonical(bySku(i.sku)) ? `${bySku(i.sku).label} · Standard Edition · Code in Box` : `${bySku(i.sku)?.condition || ''}${Object.values(i.options || {}).length ? ' · '+Object.values(i.options).join(' / ') : ''}`
const field = (name, label, values = {}, type = 'text', autocomplete = '') => `<div class="field"><label for="${name}">${label}</label><input id="${name}" name="${name}" type="${type}" value="${esc(values[name])}"${autocomplete ? ` autocomplete="${autocomplete}"` : ''}></div>`
const select = (name, label, options, value) => `<div class="field"><label for="${name}">${label}</label><select id="${name}" name="${name}"><option value="">Please select</option>${options.map(([id, text]) => `<option value="${esc(id)}"${value === id ? ' selected' : ''}>${esc(text)}</option>`).join('')}</select></div>`
const errorsHTML = errors => errors.length ? `<div class="errors" role="alert"><h2>Please check the following</h2><ul>${errors.map(e => `<li>${esc(e)}</li>`).join('')}</ul></div>` : ''
const pick = (body, keys) => Object.fromEntries(keys.map(k => [k, str(body[k])]))
const repeatedFields = body => Object.values(body).some(value => typeof value !== 'string')
const quantity = value => /^\d+$/.test(str(value)) && Number(value) >= 1 && Number(value) <= 10 ? Number(value) : null

function render(req, res, title, body, status = 200) {
  const b = res.locals.base
  const chrome = { cartCount: req.store.cart.reduce((n, i) => n + i.qty, 0), storeName: preferredStore(req,STORES)?.name, user: req.store.user }
  res.status(status).type('html').send(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(title)} | EB Games Australia</title><link rel="stylesheet" href="${b}/static/style.css"><link rel="stylesheet" href="${b}/static/site.css"></head><body>
    ${siteHeader(req, b, chrome)}<main id="content">${body}</main>${siteFooter(b, disclaimer(NAME))}<script src="${b}/static/catalog.js" defer></script></body></html>`)
}

function totals(store) {
  const subtotal = round(store.cart.reduce((sum, i) => sum + i.qty * i.unit_price, 0))
  const info = store.checkout.info
  const shipping = info?.method === 'ship' && Object.hasOwn(SHIPPING, info.shipping_method) ? SHIPPING[info.shipping_method].fee : 0
  const deposit = store.cart.filter(i=>canonical(bySku(i.sku))).reduce((sum,i)=>sum+i.qty*10,0)
  const ordinary = round(store.cart.filter(i=>!canonical(bySku(i.sku))).reduce((sum,i)=>sum+i.qty*i.unit_price,0))
  const dueNow = round(deposit+ordinary+(ordinary>0 ? shipping : 0))
  return { subtotal, shipping, tax:0, total:round(subtotal+shipping), deposit, ordinary, dueNow, balance:round(subtotal+shipping-dueNow) }
}
function summary(store) {
 const t=totals(store), pre=preorderItems(store)
 return `<aside class="summary"><h2>Order summary</h2>${store.cart.map(i=>`<p>${esc(i.title)} · ${esc(lineDetails(i))} × ${i.qty}<br>${price(i.unit_price*i.qty)}</p>`).join('')}<dl><dt>Subtotal</dt><dd>${price(t.subtotal)}</dd><dt>Shipping</dt><dd>${store.checkout.info?price(t.shipping):'Calculated at checkout'}</dd><dt>Total (GST inclusive)</dt><dd>${price(t.total)}</dd>${pre?`<dt>Preorder deposit</dt><dd>${price(t.deposit)}</dd>`:''}<dt><strong>Pay today</strong></dt><dd><strong>${price(t.dueNow)}</strong></dd>${pre?`<dt>Remaining balance</dt><dd>${price(t.balance)}</dd>`:''}</dl><p>${pre?'Delivery preorder balances are charged 1–7 days before release. Click & Collect balances are paid in store. In-stock items are paid in full today.':'In-stock items and delivery charges are paid in full today.'}</p></aside>`
}
function trustedLine(item) {
 const p=bySku(item.sku)
 if(!p) return null
 if(canonical(p)) return {...item,platform:p.platform,edition:'standard',format:'code-in-box',unit_price:129.95,title:GAME.title}
 const selected=resolveProduct(p,item.variant_id||'')
 return selected ? {...item,kind:'other',title:p.title,unit_price:selected.price,options:selected.options} : null
}
function stockErrors(store) {
 const errors=[]
 for(const i of store.cart) {
  const p=bySku(i.sku),selected=p&&!canonical(p)?resolveProduct(p,i.variant_id||''):p
  const aggregate=store.cart.filter(x=>x.sku===i.sku).reduce((n,x)=>n+x.qty,0)
  const sameVariant=store.cart.filter(x=>x.sku===i.sku&&(x.variant_id||'')===(i.variant_id||'')).reduce((n,x)=>n+x.qty,0)
  if(!p||!selected||!Number.isInteger(i.qty)||i.qty<1||aggregate>Math.min(10,p.stock??10)||sameVariant>(selected.variantStock??p.stock??10)) errors.push(`${p?.title||'Product'}: the selected quantity or option is no longer available.`)
 }
 return [...new Set(errors)]
}
function reviewFingerprint(req) {
 return createHash('sha256').update(JSON.stringify({items:req.store.cart.map(trustedLine),info:req.store.checkout.info,email:req.store.checkout.email,account:req.store.user?.id||null,totals:totals({...req.store,cart:req.store.cart.map(trustedLine).filter(Boolean)})})).digest('hex')
}
function newReview(req) { req.store.ebReview={token:randomBytes(20).toString('hex'),fingerprint:reviewFingerprint(req)};return req.store.ebReview }

function tiles(base, list = PRODUCTS) {
  return `<div class="products">${list.map(p => `<article><a href="${base}${p.path}">${productImage('eb-games-au',{...p,title:`Grand Theft Auto VI — ${p.label}`})}<h2>Grand Theft Auto VI - ${p.label}</h2></a><p class="badge">Pre-Order</p><p>Standard Edition · Code in Box</p><strong>${price(129.95)}</strong><p>A$10 deposit</p></article>`).join('')}</div>`
}

const searchProducts = () => [...PRODUCTS.map(p=>({...p,title:`Grand Theft Auto VI - ${p.label}`,price:129.95,category:'Video Games',brand:'Rockstar Games',condition:'New',platform:p.label,keywords:`gta 6 gta6 gtavi grand theft auto vi preorder ${p.platform}`,...(fixtureCatalog ? {rating:0,reviews:0,stock:10} : {purchaseLimit:10}),release:GAME.release_date,preorder:true,art:`/static/art/${p.platform}-standard.svg`})),...shopProducts]
// Homepage carousels in the real site's order: New Releases, then Preorder Now, where the two
// Grand Theft Auto VI listings sit among the other preorders as they do on ebgames.com.au.
const carousel = (b, list) => `<div class="eb-carousel" tabindex="0" aria-label="Scrollable product row">${browseTiles(b, list)}</div>`
function homeRows(b) {
 const newReleases = shopProducts.filter(p => p.newRelease).sort((x, y) => y.release.localeCompare(x.release)).slice(0, 16)
 const preorders = shopProducts.filter(p => p.preorder), gta = searchProducts().filter(p => canonical(PRODUCTS.find(x => x.sku === p.sku)))
 return { newReleases: carousel(b, newReleases), preorderTiles: carousel(b, [...preorders.slice(0, 2), ...gta, ...preorders.slice(2, 14)]) }
}
installSite(router,{render,catalogPage,searchProducts,fixtureCatalog,retailOrders:req=>ownedOrders(req,SLUG).filter(o=>ownOrder(req,o.id))})
installJourneys(router,{render,login,field,select,errorsHTML,bySku,canonical,stockErrors,STORES,STATES})
router.get('/', (req,res) => {
 const b=res.locals.base
 const rows=fixtureCatalog?{preorderTiles:tiles(b),newReleases:browseTiles(b,browseProducts.filter(p=>p.category==='Video Games').slice(0,4))}:homeRows(b)
 render(req,res,'EB Games Australia | Video Games, Consoles, Trading Cards & Pop Culture',homePage(b,rows))
})
router.get(['/grand-theft-auto','/featured/preorder-now'],(req,res)=>render(req,res,'Preorder Grand Theft Auto VI',`<h1>Preorder now</h1><p>Grand Theft Auto VI · 19 November 2026 · A$10 deposit</p>${tiles(res.locals.base)}`))
router.get('/search/suggestions',(req,res)=>res.json(matching({q:str(req.query.q)},searchProducts()).slice(0,6).map(p=>({title:p.title,url:p.path||`/catalog/${p.sku}`}))))
router.get('/search',(req,res)=>{
 const m=mapSearch(req.url,req.query), q={...req.query,...m.filters}; if(q.sort==='price') q.sort=q.order==='desc'?'price-desc':'price-asc'
 delete q.attributes; if(!q.condition) delete q.condition
 const title=q.q?`Search results for “${q.q}”`:m.title||(departments.includes(q.category)?q.category:q.type==='controller'?'Controllers':'Shop all products')
 const promos=req.query.promotions?tileRow(res.locals.base,(m.kids||[])):''
 const crumbs=m.dept&&m.dept[0]!==title?`<p class="breadcrumb"><a href="${res.locals.base}">Home</a> › <a href="${res.locals.base}${esc(m.dept[1])}">${esc(m.dept[0])}</a> › ${esc(title)}</p>`:''
 const page=catalogPage(res.locals.base,title,q,searchProducts()),stock=`<p class="breadcrumb"><a href="${res.locals.base}">Home</a> › Shop</p>`
 render(req,res,q.q?'Search products':title,crumbs+(promos||(m.kids?.length?tileRow(res.locals.base,m.kids):''))+(crumbs?page.replace(stock,''):page))
})
for(const [path,title,intro,filters] of hubs) router.get(path,(req,res)=>render(req,res,title,hubIntro(res.locals.base,path)+catalogPage(res.locals.base,title,{...req.query,...filters},searchProducts(),intro)+hubRows(res.locals.base,path,fixtureCatalog?null:{matching:q=>matching(q,shopProducts),carousel})))
router.get('/brands',(req,res)=>render(req,res,'Shop by brand',`<h1>Shop by brand</h1><div class="category-tiles">${brands.map(brand=>`<a href="${res.locals.base}/brands/${encodeURIComponent(brand)}">${esc(brand)}</a>`).join('')}</div>`))
router.get('/brands/:brand',(req,res)=>brands.includes(req.params.brand)?render(req,res,req.params.brand,catalogPage(res.locals.base,req.params.brand,{...req.query,brand:req.params.brand},searchProducts())):render(req,res,'Brand not found','<h1>Brand not found</h1>',404))
function ordinaryProduct(req,res,p,errors=[],values={}) {
 render(req,res,p.title,browseProduct(res.locals.base,p,'AUD',values.variant_id??str(req.query.variant),{...values,added:req.query.added,journey:productJourney(req,res.locals.base,p,values.variant_id??str(req.query.variant),STORES)},errors),errors.length?400:200)
}
router.get('/catalog/:sku',(req,res)=>{
 const p=shopProducts.find(p=>p.sku===req.params.sku)
 if(!p) return render(req,res,'Product not found','<h1>Product not found</h1>',404)
 if(p.path) return res.redirect(301,`${res.locals.base}${p.path}${req.url.includes('?')?req.url.slice(req.url.indexOf('?')):''}`)
 if(req.query.variant&&!resolveProduct(p,str(req.query.variant))) return ordinaryProduct(req,res,p,['Choose an available product option.'])
 rememberSelection(req,p,str(req.query.variant));ordinaryProduct(req,res,p)
})

function product(req, res, p, errors = [], values = {}) {
  const b = res.locals.base
  const pickupStore = preferredStore(req, STORES)
  render(req, res, `Grand Theft Auto VI - ${p.label}`, `${errorsHTML(errors)}${req.query.added ? `<div class="notice">Added to your cart. <a href="${b}/cart">View Cart</a> · <a href="${b}/checkout">Checkout Now</a></div>` : ''}<p class="breadcrumb"><a href="${b}">Home</a> › <a href="${b}/search?category=gaming&amp;subcategory=gaming-video-game">Video Games</a> › <a href="${b}/search?category=gaming&amp;subcategory=gaming-video-game&amp;attributes=platform%3A${p.platform==='ps5'?'playstation-5':'xbox-series-x'}">${esc(p.label)}</a></p><div class="product">${productGallery('eb-games-au',{...p,title:`Grand Theft Auto VI — ${p.label}`})}<section><p class="badge">Pre-Order</p><h1>Grand Theft Auto VI</h1><h2>${p.label}</h2><p>Standard Edition · Code in Box — no disc included</p><p>Requires an Australian ${p.platform === 'ps5' ? 'PlayStation' : 'Xbox'} account.</p><p class="price">${price(129.95)}</p><p><strong>A$10 deposit per copy</strong></p><p>Release date: 19 November 2026</p><form action="${b}/cart/add" method="post"><input type="hidden" name="sku" value="${p.sku}">${field('qty', 'Quantity (1–10)', { qty: values.qty ?? '1' }, 'number')}<button>Preorder now</button></form><div class="eb-preorder-availability"><section><h3>Click &amp; Collect</h3><strong>${!fixtureCatalog ? 'Not available online' : pickupStore ? esc(pickupStore.name) : 'No store set'}</strong>${!fixtureCatalog || pickupStore ? '' : '<p>Find your local store to view product availability.</p>'}<a href="${b}/stores?sku=${p.sku}">Set your store</a></section><section><h3>Home Delivery</h3><strong>Available</strong><p>For exact delivery costs and times, proceed to checkout and enter your specific address.</p></section></div><p>${PRODUCTS.filter(x => x !== p).map(x => `<a href="${b}${x.path}">View ${x.label} version</a>`).join('')}</p></section></div><div class="eb-pdp-sections"><section class="panel"><h2>Description</h2><p>${esc(GAME.description)}</p><p>Delivery starts November 12, allowing the game to be downloaded and installed in advance. Grand Theft Auto VI is releasing and becomes playable on November 19.</p><p>Pay a deposit now. For delivery, the balance is charged to the same payment method 1–7 days before release. For Click &amp; Collect, pay the balance in store.</p></section><section class="panel"><h2>Details</h2><dl class="eb-details"><dt>Platform</dt><dd>${esc(p.label)}</dd><dt>Franchise</dt><dd>Grand Theft Auto</dd><dt>Developer</dt><dd>Rockstar Games</dd><dt>Category</dt><dd>Video Games</dd><dt>SKU</dt><dd>${esc(p.sku)}</dd><dt>Rating</dt><dd>R18+</dd></dl></section></div>${productJourney(req,b,p,'',STORES)}<section class="panel"><h2>EB World</h2><p>Keep your favourites together in EB World. <a href="${b}/plus">Explore EB World PLUS</a>.</p><a href="${b}/account">Sign in to EB World</a></section>${fixtureCatalog ? '<section class="panel"><h2>The Goodtime State — Vice City Collection</h2><p>A$699.95 · Collectibles only, game not included. <strong>Sold out</strong></p></section>' : ''}`, errors.length ? 400 : 200)
}
for (const p of PRODUCTS) router.get(p.path, (req, res) => { rememberSelection(req,p);product(req, res, p) })
// Assortment product pages at the real site's /product/{category}/{id}-{name} addresses.
const shelfByPath = new Map(shopProducts.filter(p => p.path).map(p => [p.path, p]))
router.get('/product/:section/:slug', (req, res, next) => {
 const p = shelfByPath.get(`/product/${req.params.section}/${req.params.slug}`)
 if (!p) return next()
 if (req.query.variant && !resolveProduct(p, str(req.query.variant))) return ordinaryProduct(req, res, p, ['Choose an available product option.'])
 rememberSelection(req, p, str(req.query.variant)); ordinaryProduct(req, res, p)
})
router.get('/shelf-art/:sku/:view.svg', (req, res) => {
 const p = shopProducts.find(x => x.shelf && x.sku === req.params.sku), view = Number(req.params.view)
 if (!p || !/^[0-3]$/.test(req.params.view) || view >= (p.catalogType === 'console' ? 4 : 3)) return res.status(404).type('text').send('Product image not found')
 res.set('Cache-Control', 'public, max-age=3600').set('X-Content-Type-Options', 'nosniff').type('image/svg+xml').send(shelfArtSvg(p, view))
})

router.post('/cart/add', (req,res)=>{
 const p=bySku(str(req.body.sku)),qty=quantity(req.body.qty??'1'),variantId=str(req.body.variant_id)
 if(!p) return render(req,res,'Select a product',`${errorsHTML(['Please select a valid platform and product.'])}${tiles(res.locals.base)}`,400)
 const show=(errors)=>canonical(p)?product(req,res,p,errors,{qty:str(req.body.qty)}):ordinaryProduct(req,res,p,errors,{qty:str(req.body.qty),variant_id:variantId})
 if(repeatedFields(req.body)) return show(['Submit one value for each product field.'])
 const selected=canonical(p)?p:resolveProduct(p,variantId)
 if(!selected||canonical(p)&&variantId) return show(['Choose a valid product option.'])
 if(!qty) return show(['Choose a quantity from 1 to 10.'])
 const key=`${p.sku}${variantId?':'+variantId:''}`,existing=req.store.cart.find(i=>(i.key||i.sku)===key)
 const item=canonical(p)?{platform:p.platform,edition:'standard',format:'code-in-box',qty,unit_price:129.95,title:GAME.title,sku:p.sku}:{kind:'other',key,sku:p.sku,title:p.title,qty,unit_price:selected.price,variant_id:variantId,options:selected.options}
 const trial=req.store.cart.map(i=>({...i}));if(existing) trial.find(i=>(i.key||i.sku)===key).qty+=qty;else trial.push(item)
 const errors=stockErrors({...req.store,cart:trial});if(errors.length) return show(errors)
 req.store.cart=trial;req.store.checkout={}
 res.redirect(`${res.locals.base}${p.path||'/catalog/'+p.sku}?added=1${variantId?'&variant='+encodeURIComponent(variantId):''}`)
})
function cart(req,res,errors=[],quantities={}) {
 const b=res.locals.base
 if(!req.store.cart.length) return render(req,res,'Your Cart',`<h1>Your Cart</h1><section class="panel eb-empty-cart"><p class="eb-empty-title"><strong>Oh no!</strong> currently your cart is empty.</p><p>Your cart is empty.</p><a class="button" href="${b}">Start Shopping</a> <a href="${b}/search">Continue shopping</a> · <a href="${b}/account/saved">Saved for later</a></section>`)
 render(req,res,'Your Cart',`<h1>Your Cart</h1><p><a href="${b}/account/saved">Saved for later</a></p>${errorsHTML(errors)}<div class="checkout"><section>${req.store.cart.map(i=>`<article class="panel cart-product"><a class="cart-art" href="${b}${bySku(i.sku).path||'/catalog/'+i.sku}${i.variant_id?'?variant='+encodeURIComponent(i.variant_id):''}">${productArt(resolveProduct(bySku(i.sku),i.variant_id||'')||bySku(i.sku))}</a><div class="cart-product-info"><h2>${esc(i.title)}</h2><p>${esc(lineDetails(i))}</p><p>${price(i.unit_price)} each${canonical(bySku(i.sku))?' · A$10 deposit per copy':' · Pay in full today'}</p><form method="post" action="${b}/cart/update"><input type="hidden" name="sku" value="${i.sku}"><input type="hidden" name="key" value="${esc(i.key||i.sku)}">${field(`qty_${i.sku}`,'Quantity (1–10)',{[`qty_${i.sku}`]:quantities[i.key||i.sku]??i.qty},'number')}<button name="action" value="update">Update quantity</button><button class="secondary" name="action" value="remove">Remove</button></form>${saveCartControl(b,i)}</div></article>`).join('')}<a class="button" href="${b}/checkout">Checkout Now</a></section>${summary(req.store)}</div>`,errors.length?400:200)
}
router.get('/cart',(req,res)=>cart(req,res))
router.post('/cart/update',(req,res)=>{
 if(repeatedFields(req.body)) return cart(req,res,['Submit one value for each cart field.'])
 const candidates=req.store.cart.filter(i=>i.sku===str(req.body.sku)),key=str(req.body.key)
 const item=key?candidates.find(i=>(i.key||i.sku)===key):candidates.length===1?candidates[0]:null
 if(!item) return cart(req,res,['Choose the exact product option in your cart.'])
 if(req.body.action==='remove') req.store.cart=req.store.cart.filter(i=>i!==item)
 else {
  const qty=quantity(req.body[`qty_${item.sku}`]);if(!qty) return cart(req,res,['Choose a quantity from 1 to 10.'],{[item.key||item.sku]:str(req.body[`qty_${item.sku}`])})
  const trial=req.store.cart.map(i=>i===item?{...i,qty}:i),errors=stockErrors({...req.store,cart:trial});if(errors.length) return cart(req,res,errors)
  req.store.cart=trial
 }
 req.store.checkout={};res.redirect(`${res.locals.base}/cart`)
})

const needsCart = (req, res, next) => req.store.cart.length ? next() : res.redirect(`${res.locals.base}/cart`)
const needsAuth = (req, res, next) => req.store.checkout.email ? next() : res.redirect(`${res.locals.base}/checkout`)
const needsInfo = (req, res, next) => {
 if (!fixtureCatalog && req.store.checkout.info?.method === 'pickup') {
  delete req.store.checkout.info; delete req.store.ebReview
  return delivery(req,res,{method:'ship'},['Click & Collect is not available for this order. Please choose Delivery.'])
 }
 return req.store.checkout.info ? next() : res.redirect(`${res.locals.base}/checkout/delivery`)
}

function login(req, res, values = {}, errors = []) {
  const b = res.locals.base
  const offerGuest = req.store.cart.length > 0 && !req.store.ebPending
  // ASSUMPTION: EB's documented guest/member options are presented as a checkout gate.
  render(req, res, offerGuest ? 'EB World or Guest' : 'Sign in to EB World', `<h1>${offerGuest ? 'EB World or Guest' : 'Sign in to EB World'}</h1>${errorsHTML(errors)}<div class="columns"><section class="panel"><h2>Sign In</h2><p>EB World member</p><form method="post" action="${b}/account/login">${field('email', 'Email', values, 'email', 'email')}${field('password', 'Password', {}, 'password', 'current-password')}<label class="check"><input type="checkbox" name="stay_logged_in" value="yes">Stay logged in</label><p class="eb-small">To keep your account secure we suggest you use this option only on your personal devices.</p><button>Sign In</button></form><p><a href="${b}/account/forgotten-password">Forgotten password</a></p><p><a class="button secondary eb-create" href="${b}/account/sign-up">Create an account</a></p><p><a href="${b}/account/sign-up">Create an EB World account</a></p>${req.store.ebPending?'<p>Your selected item will be saved after you sign in.</p>':''}</section>${offerGuest?`<section class="panel"><h2>Guest</h2><p>Continue without an EB World account.</p><form method="post" action="${b}/checkout/guest">${field('guest_email', 'Email address', { guest_email: values.guest_email }, 'email', 'email')}<button>Continue as Guest</button></form></section>`:`<section class="panel join-world"><span class="world-mark">EB WORLD</span><h2>Make it your world</h2><p>Keep your next adventure close.</p><ul><li>Save your favourite products and selected colours</li><li>Keep your delivery addresses ready</li><li>View your orders and manage your preferences</li></ul><a class="button" href="${b}/account/sign-up">Create an EB World account</a><p><a href="${b}/plus">Discover EB World PLUS</a></p></section>`}</div>`, errors.length ? 400 : 200)
}
router.get('/checkout', needsCart, (req, res) => {
  if (req.store.user) req.store.checkout.email = req.store.user.email
  if (req.store.checkout.email) return res.redirect(`${res.locals.base}/checkout/delivery`)
  login(req, res)
})
router.post('/checkout/guest', needsCart, (req, res) => {
  const email = str(req.body.guest_email)
  if (!emailOK(email)) return login(req, res, { guest_email: email }, ['Enter a valid email address.'])
  req.store.user = null
  req.store.ebReview = null
  delete req.store.ebPending
  delete req.store.ebReturn
  req.store.checkout = { email }
  res.redirect(`${res.locals.base}/checkout/delivery`)
})

const INFO_KEYS = ['method', 'first_name', 'last_name', 'phone', 'address', 'address_line2', 'suburb', 'state', 'postcode', 'shipping_method', 'store_id']
function delivery(req, res, values = {}, errors = []) {
  const b = res.locals.base
  render(req, res, 'Delivery or Click & Collect', `<p class="steps">EB World / Guest → <strong>Delivery or Click &amp; Collect</strong> → Payment</p><h1>Delivery or Click &amp; Collect</h1>${errorsHTML(errors)}${addressPicker(req,b)}<div class="checkout"><form class="panel" method="post" action="${b}/checkout/delivery"><p>Order confirmation: ${esc(req.store.checkout.email)}</p>${select('method', 'Delivery option', (fixtureCatalog ? [['ship', 'Delivery'], ['pickup', 'Click & Collect']] : [['ship', 'Delivery']]), values.method ?? 'ship')}<div class="columns">${field('first_name', 'First Name', values, 'text', 'given-name')}${field('last_name', 'Last Name', values, 'text', 'family-name')}</div>${field('phone', 'Mobile Number', values, 'tel', 'tel')}<fieldset><legend>Delivery address (required for Delivery)</legend>${field('address', 'Address / PO Box / Parcel Locker', values, 'text', 'address-line1')}${field('address_line2', 'Apartment or additional details', values, 'text', 'address-line2')}${field('suburb', 'Suburb', values, 'text', 'address-level2')}<div class="columns">${select('state', 'State', STATES.map(s => [s, s]), values.state)}${field('postcode', 'Postcode', values, 'text', 'postal-code')}</div>${select('shipping_method', 'Shipping option', Object.entries(SHIPPING).map(([id, s]) => [id, `${s.name} — ${price(s.fee)} — ${s.eta}`]), values.shipping_method ?? 'standard')}<p>${preorderItems(req.store)?'Same Day Delivery is unavailable for preorders.':'Available products dispatch in 1–2 business days.'}</p></fieldset>${fixtureCatalog ? `<fieldset><legend>Click &amp; Collect (required for collection)</legend>${select('store_id', 'Choose your store', STORES.map(s => [s.id, `${s.name} — ${s.location}`]), values.store_id)}<p>Bring your confirmation and photo ID once ready to collect.</p></fieldset>` : '<p>Click &amp; Collect is not available for this order.</p>'}<button>Continue to payment</button></form>${summary(req.store)}</div>`, errors.length ? 400 : 200)
}
router.get('/checkout/delivery', needsCart, needsAuth, (req,res)=>{ if(req.query.address_id){const a=selectedAddress(req,req.query.address_id);if(!a)return delivery(req,res,{},['Saved address not found.']);delete req.store.checkout.info;req.store.ebReview=null;return delivery(req,res,a)}delivery(req,res,req.store.checkout.info??addressCheckout(req)) })
router.post('/checkout/delivery', needsCart, needsAuth, (req, res) => {
  const v = pick(req.body, INFO_KEYS), errors = []
  if (repeatedFields(req.body)) errors.push('Submit one value for each delivery field.')
  if (!fixtureCatalog && v.method === 'pickup') errors.push('Click & Collect is not available for this order. Please choose Delivery.')
  if (!['ship', 'pickup'].includes(v.method)) errors.push('Choose Delivery or Click & Collect.')
  if (!v.first_name) errors.push('Enter your first name.')
  if (!v.last_name) errors.push('Enter your last name.')
  if (!/^(?:0[2-478]\d{8}|\+61[2-478]\d{8})$/.test(v.phone.replace(/[\s()-]/g, ''))) errors.push('Enter a valid Australian phone number.')
  if (v.method === 'ship') {
    if (!v.address) errors.push('Enter your delivery address.')
    if (!v.suburb) errors.push('Enter your suburb.')
    if (!STATES.includes(v.state)) errors.push('Choose an Australian state or territory.')
    if (!/^\d{4}$/.test(v.postcode)) errors.push('Enter a four-digit postcode.')
    if (!Object.hasOwn(SHIPPING, v.shipping_method)) errors.push('Choose Standard or Express Delivery.')
  } else if (v.method === 'pickup' && !STORES.some(s => s.id === v.store_id)) errors.push('Choose a Click & Collect store.')
  if (errors.length) return delivery(req, res, v, errors)
  req.store.checkout.info = v
  res.redirect(`${res.locals.base}/checkout/payment`)
})

function payment(req,res,values={},errors=[],status) {
 const trusted=req.store.cart.map(trustedLine);if(trusted.every(Boolean)) req.store.cart=trusted
 const b=res.locals.base,info=req.store.checkout.info,pickup=info.method==='pickup',pre=preorderItems(req.store),t=totals(req.store),zip=pickup&&t.ordinary===0
 const review=req.store.ebReview?.fingerprint===reviewFingerprint(req)?req.store.ebReview:newReview(req)
 const options=[['card','Credit Card — Visa, Mastercard or American Express'],...(zip?[['zip','Zip — deposit only']]:[])]
 render(req,res,'Payment',`<p class="steps">EB World / Guest → Delivery or Click &amp; Collect → <strong>Payment</strong></p><h1>Payment</h1>${errorsHTML(errors)}<div class="checkout"><form class="panel" method="post" action="${b}/checkout/payment"><input type="hidden" name="review_token" value="${review.token}"><p>${pickup?esc(STORES.find(s=>s.id===info.store_id).name):`${esc(info.address)}, ${esc(info.suburb)} ${esc(info.state)} ${esc(info.postcode)}`}</p><a href="${b}/checkout/delivery">Change delivery details</a><p>${pre?`Preorder deposits are paid today. ${pickup?'Pay remaining preorder balances in store. Zip cannot pay the remaining balance in store.':'Remaining preorder balances are charged to the same card 1–7 days before release.'} Available products are paid in full today.`:'Your items and delivery are paid in full today.'}</p>${select('payment_method','Payment type',options,values.payment_method??'card')}<fieldset><legend>Credit Card</legend>${field('card_name','Name on card',values,'text','cc-name')}${field('card_number','Card number',{},'text','cc-number')}<div class="columns">${field('card_expiry','Expiry (MM/YY)',values,'text','cc-exp')}${field('card_cvv','CVV / verification number',{},'password','cc-csc')}</div></fieldset>${zip?`<label class="check"><input name="zip_authorized" type="checkbox" value="yes"${values.zip_authorized==='yes'?' checked':''}>I authorise Zip to pay the deposit</label>`:''}<fieldset><legend>Promo Code</legend>${field('promo_code','Promo Code',values)}<button class="secondary" name="apply_promo" value="1">Apply</button><p>Only one promo code can be used per order.</p></fieldset><label class="check"><input type="checkbox" name="accept_deposit" value="yes"${values.accept_deposit==='yes'?' checked':''}>${pre?'I agree to the deposit and remaining balance payment terms above.':'I confirm the order and full payment shown above.'}</label><button>Place order</button></form>${summary(req.store)}</div>`,status??(errors.length?400:200))
}
router.get('/checkout/payment', needsCart, needsAuth, needsInfo, (req, res) => payment(req, res))
router.post('/checkout/payment', needsCart, needsAuth, needsInfo, (req, res) => {
  const v = pick(req.body, ['payment_method', 'card_name', 'card_expiry', 'promo_code', 'accept_deposit', 'zip_authorized'])
  // Keep only non-sensitive inputs on a re-render. Never persist or echo PAN or CVV.
  const errors = [], info = req.store.checkout.info, pickup = info.method === 'pickup'
  if (repeatedFields(req.body)) return payment(req,res,v,['Submit one value for each payment field.'])
  const stock = stockErrors(req.store)
  if (stock.length) return payment(req,res,v,stock,409)
  const review=req.store.ebReview, token=str(req.body.review_token)
  if ((Object.hasOwn(req.body,'review_token') && (!token || token!==review?.token)) || (review && review.fingerprint!==reviewFingerprint(req))) { req.store.cart=req.store.cart.map(trustedLine); return payment(req,res,v,['Your order changed. Review the updated items and payment amount before placing your order.'],409) }
  req.store.cart=req.store.cart.map(trustedLine)
  if (req.body.apply_promo || v.promo_code) return payment(req, res, v, ['This promo code is invalid or does not apply to this preorder.'])
  let paid = null
  if (v.payment_method === 'card') {
    const card = validateCard({ number: str(req.body.card_number), expiry: v.card_expiry, cvv: str(req.body.card_cvv) })
    if (!card.ok) errors.push(...Object.values(card.errors))
    else if (!['Visa', 'Mastercard', 'American Express'].includes(card.brand)) errors.push('Use Visa, Mastercard or American Express.')
    else paid = { method: 'card', brand: card.brand, last4: card.last4, name_on_card: v.card_name }
    if (!v.card_name) errors.push('Enter the name on your card.')
  } else if (v.payment_method === 'zip' && pickup && totals(req.store).ordinary === 0) {
    // ASSUMPTION: Zip's external authorization is represented by a local explicit authorization.
    if (v.zip_authorized !== 'yes') errors.push('Authorize the Zip deposit to continue.')
    else paid = { method: 'zip' }
  } else errors.push('Choose a payment type available for this order.')
  if (v.accept_deposit !== 'yes') errors.push(preorderItems(req.store)?'Please agree to the deposit and remaining balance payment terms.':'Please confirm the order and full payment terms.')
  if (errors.length) return payment(req, res, v, errors)
  const rejected = scenarioPayment(req.store, paid, req.store.cart)
  if (rejected) return payment(req,res,v,[rejected],402)
  const t = totals(req.store), location = STORES.find(s => s.id === info.store_id)
  const address = pickup ? null : { first_name: info.first_name, last_name: info.last_name, line1: info.address, ...(info.address_line2?{line2:info.address_line2}:{}), city: info.suburb, state: info.state, postal_code: info.postcode, country: 'AU', phone: info.phone }
  // ASSUMPTION: real order-number format was not observable; use a ten-digit number.
  let number
  do { number = String(randomInt(1_000_000_000, 10_000_000_000)) } while (getOrder(number))
  const order = recordOrder({
    store: SLUG, order_number: number, session: req.session, items: req.store.cart,
    customer: { email: req.store.checkout.email, first_name: info.first_name, last_name: info.last_name, phone: info.phone, account_id: req.store.user?.id ?? null, guest: !req.store.user },
    fulfillment: pickup ? { method: 'pickup', option: 'click_and_collect', store_id: location.id, store_location: location.name, store_address: location.location } : { method: 'ship', option: info.shipping_method, eta: SHIPPING[info.shipping_method].eta },
    shipping_address: address, billing_address: address, payment: paid,
    totals: { subtotal: t.subtotal, shipping: t.shipping, tax: 0, total: t.total }, currency: 'AUD',
    meta: { deposit_paid:t.deposit, paid_today:t.dueNow, balance_due:t.balance, balance_payment:t.balance?(pickup?'in store on collection':'same card 1–7 days before release'):null, gst_included:true, release_date:preorderItems(req.store)?GAME.release_date:null, options:req.store.cart.filter(i=>i.kind==='other').map(i=>({sku:i.sku,variant_id:i.variant_id,options:i.options,quantity:i.qty})), account_id:req.store.user?.id??null },
  })
  req.store.cart = []
  req.store.ebReview = null
  req.store.checkout = {}
  res.redirect(`${res.locals.base}/confirmation/${order.order_number}`)
})

function showOrder(req,res,order) {
 const pickup=order.fulfillment.method==='pickup',pre=order.items.some(i=>i.kind==='game'),title=pre?'Thank you for your preorder':'Thank you for your order'
 render(req,res,title,`<h1>${title}!</h1><p>Order number: <strong data-order-number>${esc(order.order_number)}</strong></p><p>Order contact: ${esc(order.customer.email)}.</p><p>Current status: <strong>${esc(orderStatus(order).replaceAll('_',' '))}</strong>. <a href="${res.locals.base}/account/orders/${order.order_number}">Manage this order</a></p><section class="panel"><h2>Original payment record</h2>${order.items.map((i,index)=>`<p>${esc(i.title)} · ${i.kind==='game'?esc(lineDetails(i)):esc(Object.values(order.meta.options?.filter(x=>x.sku===i.sku)[order.items.slice(0,index).filter(x=>x.sku===i.sku).length]?.options||{}).join(' / '))} × ${i.qty} — ${price(i.unit_price*i.qty)}</p>`).join('')}<p>Total (GST inclusive): ${price(order.totals.total)}</p><p><strong>Paid today: ${price(order.meta.paid_today)}</strong></p>${pre?`<p>Deposit paid: ${price(order.meta.deposit_paid)}</p><p>Remaining balance: ${price(order.meta.balance_due)}</p>`:''}<p>${order.payment.method==='card'?`${esc(order.payment.brand)} ending in ${esc(order.payment.last4)}`:'Zip deposit'}</p><p>${orderStatus(order)==='cancelled'?'This order is cancelled. No dispatch or collection is pending.':pickup?`Collect from ${esc(order.fulfillment.store_location)} — ${esc(order.fulfillment.store_address)}. Your order is not yet ready to collect.`:`Delivery to ${esc(order.shipping_address.line1)}, ${esc(order.shipping_address.city)} ${esc(order.shipping_address.state)} ${esc(order.shipping_address.postal_code)}.`}</p><p>${orderStatus(order)==='cancelled'?'Payment and balance figures above are the original transaction record.':pre?(pickup?'Pay the preorder balance in store. To cancel, visit your collection store no earlier than one business day after ordering.':'The preorder balance will be charged to the same card 1–7 days before release. Available products dispatch separately.'):'Payment complete. Available products are prepared for dispatch or collection in 1–2 business days.'}</p></section><a href="${res.locals.base}/account/order-history">My Orders</a>`)
}
router.get('/confirmation/:number', (req, res) => {
  const order = ownOrder(req,req.params.number)
  if (!order || order.store !== SLUG || order.session_id !== req.session.id || (order.customer.account_id && order.customer.account_id !== req.store.user?.id)) return render(req, res, 'Order not found', '<h1>Order not found</h1>', 404)
  showOrder(req, res, order)
})
router.use((req, res) => render(req, res, 'Page not found', `<h1>Page not found</h1><a href="${res.locals.base}">Continue shopping</a>`, 404))

export default { slug: SLUG, name: NAME, country: 'AU', currency: 'AUD', gta6_available: true, description: fixtureCatalog ? 'AU. PS5/Xbox Standard code-in-box preorders with A$10 deposits, EB World or guest checkout, Delivery or Click & Collect.' : 'AU. PS5/Xbox code-in-box preorders with A$10 deposits and delivery checkout.', router }

registerScenarioAdapter('eb-games-au', { seed(store, id, qty) { store.cart = [trustedLine({ sku: id, qty })] } })
