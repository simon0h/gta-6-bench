import { enterScenarioCart, scenarioPayment, scenarioAvailability, registerScenarioAdapter } from '../../lib/benchmark-scenarios.js'
import { fixtureCatalog } from '../../lib/catalog-policy.js'
import { Router } from 'express'
import { randomInt, createHash } from 'node:crypto'
import { authenticate, createAccount, publicAccount } from '../../lib/accounts.js'
import { recordOrder } from '../../lib/orders.js'
import { validateCard } from '../../lib/payment.js'
import { esc } from '../../lib/html.js'
import { PRODUCTS, BRANDS, CAMPAIGNS, bySku, departmentById, slug, search, totals, selectedProduct, lineKey, validateCart, hasPreorder, orderEta, fulfilmentText, COLLECTION_POINTS, POSTCODE_RE, EMAIL_RE, isShelfSku } from './data.js'
import { shelfBySku } from './shelf.js'
import { shelfArtSvg } from './shelf-art.js'
import { MENU } from './site-data.js'
import * as P from './pages.js'
import * as J from './journeys.js'
import * as S from './site.js'
import { retailState, rememberProduct } from '../../lib/retail-state.js'

const router = Router()
router.use((req,res,next) => {
// Reference mode: the evidenced GTA VI listings remain listing-only (409 on every purchase route).
 // Everyday assortment items (shelf.js) can be checked, added and ordered; a trolley holding anything
 // else, or an empty trolley, cannot enter checkout.
 const stockSku = req.path.match(/^\/product\/([^/]+)\/stock$/)?.[1]
 const shelfOnlyCart = req.store.cart.length > 0 && req.store.cart.every(line => isShelfSku(line.sku))
 if (!fixtureCatalog && (req.path.startsWith('/checkout') && !(shelfOnlyCart || req.method === 'GET' && /^\/checkout\/confirmation\//.test(req.path)) || req.method === 'POST' && (req.path === '/trolley/add' && !isShelfSku(req.body?.sku) || stockSku && !isShelfSku(stockSku)))) {
  return render(req,res,'Availability not verified','<h1>Availability not verified</h1><p>This listing does not have verified delivery or collection availability.</p>',409)
 }
 next()
})
const str = value => typeof value === 'string' ? value.trim() : ''
const invalidateCheckout = req => { req.store.checkout = req.store.checkout.email ? { email: req.store.checkout.email } : {} }
const reviewSignature = req => createHash('sha256').update(JSON.stringify({ cart:req.store.cart.map(p=>({sku:p.sku,variant:p.variant_id,qty:p.qty,price:p.unit_price})), details:req.store.checkout.details, email:req.store.checkout.email, account:req.store.user?.id||null, postcode:req.store.postcode })).digest('hex')
const scenarioMessages = (req, method = 'ship', location) => req.store.cart.some(item => scenarioAvailability(req.store, item.sku, method === 'pickup' ? 'pickup' : 'shipping', location) === false) ? ['Shipping unavailable. Availability changed after this item was selected. Choose an authorized available collection option.'] : []
router.use((req, res, next) => {
  enterScenarioCart(req.store)
  if (/checkout/.test(req.path) && scenarioMessages(req).length && req.store.cart.some(item => scenarioAvailability(req.store, item.sku, 'pickup', 'London Central Argos') === false)) return render(req,res,'Item unavailable','<h1>Item unavailable</h1><p role="alert">Shipping unavailable. This item is no longer available for delivery or collection. No order was placed.</p>',409)
  next()
})
const qtyValue = value => /^\d+$/.test(str(value)) && Number(value) >= 1 && Number(value) <= 5 ? Number(value) : null
function render(req, res, title, body, status = 200) {
  res.status(status).type('html').send(P.layout({ base: res.locals.base, title, cart: req.store.cart, user: req.store.user, body }))
}
function productPage(req, res, p, values = {}, messages = [], status = 200) {
  render(req, res, (selectedProduct(p, values.variant) || p).title, P.product(res.locals.base, p, { values: { postcode: req.store.postcode ?? '', ...values, wishlisted:retailState(req).favorites.includes(lineKey(selectedProduct(p,values.variant)||selectedProduct(p))) }, checked: POSTCODE_RE.test(req.store.postcode || ''), messages }), status)
}
function notFound(req, res) {
  render(req, res, 'Page not found', `<h1>We couldn't find that page</h1><a href="${res.locals.base}/">Continue shopping</a>`, 404)
}
function guard(req, res, needDetails = false) {
  const base = res.locals.base
  if (!req.store.cart.length) { res.redirect(`${base}/trolley`); return false }
  if (!req.store.checkout.email) { res.redirect(`${base}/account`); return false }
  if (needDetails && !req.store.checkout.details) { res.redirect(`${base}/checkout/details`); return false }
  return true
}

// Every Argos form control is scalar. Never turn duplicate/nested options into
// an empty string, since an empty variant intentionally selects the default.
router.use((req, res, next) => {
  if (req.method === 'POST' && req.body === undefined) req.body = {}
  const malformedBody = req.method === 'POST' && (Array.isArray(req.body) || Object.values(req.body || {}).some(value => typeof value !== 'string'))
  const malformedChoice = ['variant', 'address_id'].some(key => req.query[key] !== undefined && typeof req.query[key] !== 'string') || Object.keys(req.query).some(key => /^(?:variant|address_id)\[/.test(key))
  if (malformedBody || malformedChoice) return render(req, res, 'Check your form', `<h1>Please check your form</h1><p>Submit one value for each field and choose a single product option.</p><a href="${res.locals.base}/trolley">Return to your trolley</a>`, 400)
  next()
})

S.mountSite(router, { render, notFound })
J.mountJourneys(router, { render, notFound, invalidateCheckout })

function browse(req,res,scope={}) {
  const filters={}
  for(const key of ['q','platform','category','brand','family','min','max','rating','availability','method','capacity','sort','page']) {
    const value=req.query[key]
    filters[key]=['category','brand','family','method'].includes(key) && Array.isArray(value) ? value.filter(v=>typeof v==='string') : str(value)
  }
  Object.assign(filters,scope)
  const q=filters.q||''
  render(req,res,scope.title||'Search results',P.listings(res.locals.base,search(q,filters),q,filters))
}
router.get('/', (req,res)=>{ const s=S.homeSections(res.locals.base); render(req,res,'Order online today for fast home delivery',`${s.pre}${P.home(res.locals.base)}${s.post}`) })
router.get('/search/:term',(req,res)=>browse(req,res,{q:String(req.params.term).replace(/[-+]+/g,' ').trim(),route:`${res.locals.base}/search`}))
router.get('/search',(req,res)=>browse(req,res))
router.get('/browse/:department',(req,res)=>{
  const menu=!fixtureCatalog && MENU.find(m=>m.id===req.params.department||m.dept===req.params.department)
  if(menu) return res.redirect(`${res.locals.base}${menu.path}`)
  const d=departmentById(req.params.department)
  if(!d) return notFound(req,res)
  render(req,res,d.name,P.department(res.locals.base,d))
})
router.get('/browse/:department/:family',(req,res)=>{
  const d=departmentById(req.params.department), p=PRODUCTS.find(p=>p.department===d?.id&&slug(p.family)===req.params.family)
  if(!d||!p) return notFound(req,res)
  browse(req,res,{department:d.id,family:req.params.family,fixedFamily:req.params.family,title:p.family,description:d.guide,route:`${res.locals.base}/browse/${d.id}/${req.params.family}`})
})
router.get('/brands',(req,res)=>render(req,res,'Shop by brand',P.brands(res.locals.base)))
router.get('/brands/:brand',(req,res)=>{
  const brand=BRANDS.find(b=>slug(b)===req.params.brand)
  if(!brand) return notFound(req,res)
  browse(req,res,{brand,fixedBrand:brand,title:`Shop ${brand}`,description:`Explore ${brand} across the Argos range.`,route:`${res.locals.base}/brands/${req.params.brand}`})
})
router.get('/events/:event',(req,res)=>{
  const event=CAMPAIGNS.find(e=>e.id===req.params.event)
  if(!event) return notFound(req,res)
  browse(req,res,{departments:event.departments,deal:event.deal,title:event.title,description:event.text,route:`${res.locals.base}/events/${event.id}`})
})
router.get('/shelf-art/:sku/:view.svg', (req, res) => {
  const p = shelfBySku(req.params.sku), view = Number(req.params.view)
  if (!p || !/^[0-3]$/.test(req.params.view)) return res.status(404).type('text').send('Product image not found')
  res.set('Cache-Control', 'public, max-age=3600').set('X-Product-Asset-Provenance', 'synthetic-illustration').type('image/svg+xml').send(shelfArtSvg(p, view))
})
router.get('/product/:sku', (req, res) => {
  const p = bySku(req.params.sku)
  if (!p) return notFound(req, res)
  const variant=str(req.query.variant)
  if(selectedProduct(p,variant)) rememberProduct(req,lineKey(selectedProduct(p,variant)))
  productPage(req,res,p,{variant},selectedProduct(p,variant)?[]:['Choose an available product option.'],selectedProduct(p,variant)?200:400)
})
router.post('/product/:sku/stock', (req, res) => {
  const p = bySku(req.params.sku)
  if (!p) return notFound(req, res)
  const postcode = str(req.body.postcode).toUpperCase(), variant=str(req.body.variant)
  if (!selectedProduct(p,variant)) return productPage(req,res,p,{postcode,variant},['Choose an available product option.'],400)
  if (!POSTCODE_RE.test(postcode)) return productPage(req, res, p, { postcode,variant }, ['Enter a valid UK postcode.'], 400)
  // ASSUMPTION: all valid UK postcodes receive the same deterministic fixture stock.
  if(req.store.postcode!==postcode) invalidateCheckout(req)
  req.store.postcode = postcode
  res.redirect(`${res.locals.base}/product/${p.sku}${variant ? `?variant=${encodeURIComponent(variant)}` : ''}`)
})
router.get('/trolley', (req, res) => render(req, res, 'Your trolley', P.trolley(res.locals.base, req.store.cart, scenarioMessages(req)) + J.savedItems(res.locals.base,req)))
router.get('/cart', (req, res) => res.redirect(`${res.locals.base}/trolley`))
router.post('/trolley/add',(req,res)=>{
  const product=bySku(req.body.sku)
  if(!product) return render(req,res,'Your trolley',P.trolley(res.locals.base,req.store.cart,['Choose a valid product.']),400)
  const variant=str(req.body.variant), p=selectedProduct(product,variant), qty=qtyValue(req.body.qty), messages=[]
  if(!POSTCODE_RE.test(req.store.postcode||'')) messages.push('Check stock using your postcode before adding to your trolley.')
  if(!p) messages.push('Choose an available product option.')
  if(!qty) messages.push('Choose a quantity from 1 to 5.')
  if(product.pegi&&req.body.age_confirmed!=='1') messages.push('Please confirm you are 18 or over.')
  const candidate=req.store.cart.map(line=>({...line}))
  if(p&&qty) {
    const existing=candidate.find(line=>lineKey(line)===lineKey(p))
    if(existing) existing.qty+=qty
    else candidate.push({...p,qty,age_confirmed:product.pegi?req.body.age_confirmed==='1':false})
    messages.push(...validateCart(candidate).messages)
  }
  if(messages.length) return productPage(req,res,product,{variant,qty:str(req.body.qty),age_confirmed:str(req.body.age_confirmed)},messages,400)
  req.store.cart=candidate
  invalidateCheckout(req)
  res.redirect(`${res.locals.base}/trolley`)
})
router.post('/trolley/update',(req,res)=>{
  const matches=req.store.cart.filter(line=>line.sku===str(req.body.sku))
  const p=req.body.line_key ? matches.find(line=>lineKey(line)===str(req.body.line_key)) : matches.length===1?matches[0]:null
  const fail=message=>render(req,res,'Your trolley',P.trolley(res.locals.base,req.store.cart,[message]),400)
  if(!p) return fail('Choose an exact item and option in your trolley.')
  if(req.body.action==='remove') req.store.cart=req.store.cart.filter(line=>line!==p)
  else {
    const qty=qtyValue(req.body.qty)
    if(!qty) return fail('Choose a quantity from 1 to 5.')
    const candidate=req.store.cart.map(line=>line===p?{...line,qty}:line)
    const validation=validateCart(candidate)
    if(validation.messages.length) return fail(validation.messages.join(' '))
    req.store.cart=candidate
  }
  invalidateCheckout(req)
  res.redirect(`${res.locals.base}/trolley`)
})

router.get('/account', (req, res) => {
  if (req.store.user) return render(req, res, 'Your account', J.dashboard(res.locals.base,req))
  render(req, res, 'Sign in or continue as a guest', P.account(res.locals.base))
})
router.get('/account/login', (req, res) => req.store.user ? res.redirect(`${res.locals.base}/account`) : render(req, res, 'Login', P.account(res.locals.base)))
router.post('/account', (req, res) => {
  const base = res.locals.base
  const email = str(req.body.email).toLowerCase()
  const messages = []
  if (!EMAIL_RE.test(email)) messages.push('Enter a valid email address.')
  if (!['guest', 'signin'].includes(req.body.action)) messages.push('Choose sign in or continue as guest.')
  let user = null
  if (req.body.action === 'signin' && !messages.length) {
    user = authenticate(req.storeSlug, email, req.body.password)
    if (!user) messages.push('Your email or password is incorrect. Please try again.')
  }
  if (messages.length) return render(req, res, 'Sign in or continue as a guest', P.account(base, { values: { email }, messages }), 400)
  req.store.user = publicAccount(user)
  J.applyProfile(req)
  req.store.checkout = { email }
  res.redirect(req.store.cart.length ? `${base}/checkout/details` : req.store.user ? `${base}/account` : `${base}/`)
})
router.get('/account/register', (req, res) => render(req, res, 'Create an account', P.register(res.locals.base)))
router.post('/account/register', (req, res) => {
  const values = Object.fromEntries(['first_name', 'last_name', 'email'].map(k => [k, str(req.body[k])]))
  values.email = values.email.toLowerCase()
  const messages = []
  if (!values.first_name || !values.last_name) messages.push('Enter your first and last name.')
  if (!EMAIL_RE.test(values.email)) messages.push('Enter a valid email address.')
  if (str(req.body.password).length < 8) messages.push('Choose a password with at least 8 characters.')
  let user
  if (!messages.length) {
    user = createAccount(req.storeSlug, { ...values, password: req.body.password })
    if (user.error) messages.push(user.error)
  }
  if (messages.length) return render(req, res, 'Create an account', P.register(res.locals.base, { values, messages }), 400)
  req.store.user = publicAccount(user)
  J.applyProfile(req)
  req.store.checkout = { email: user.email }
  res.redirect(req.store.cart.length ? `${res.locals.base}/checkout/details` : `${res.locals.base}/account`)
})
router.post('/account/signout', (req, res) => {
  req.store.user = null
  req.store.checkout = {}
  res.redirect(`${res.locals.base}/`)
})

// ASSUMPTION: exact authenticated checkout markup was not accessed. The local flow
// models the documented choices as identity -> details/fulfillment -> payment.
router.get('/checkout', (req, res) => {
  if (req.store.user && !req.store.checkout.email) req.store.checkout.email = req.store.user.email
  if (guard(req, res)) res.redirect(`${res.locals.base}/checkout/details`)
})
router.get('/checkout/details', (req, res) => {
  if (!guard(req, res)) return
  const context = J.checkoutContext(req)
  const selected = str(req.query.address_id)
  let address
  if(selected) {
    address = req.store.user && context.addresses.find(a=>a.id===selected)
    if(!address) return notFound(req,res)
    invalidateCheckout(req)
  }
  const values = address ? {...context.values,...J.addressValues(address)} : req.store.checkout.details ?? context.values
  if(!values.method && req.store.cart.every(p=>p.methods?.includes(retailState(req).preferences.shopping_method))) values.method=retailState(req).preferences.shopping_method
  render(req, res, 'Delivery and collection', P.details(res.locals.base, req.store.cart, { values, shippingAvailable:!scenarioMessages(req).length, messages:scenarioMessages(req), addresses:context.addresses, selectedAddress:selected || context.addresses.find(a=>a.is_default)?.id || '' }))
})
router.post('/checkout/details', (req, res) => {
  if (!guard(req, res)) return
  const values = Object.fromEntries(['first_name', 'last_name', 'phone', 'line1', 'line2', 'city', 'postcode', 'method', 'collection_point', 'pickup_first_name', 'pickup_last_name', 'pickup_email', 'pickup_phone'].map(k => [k, str(req.body[k])]))
  values.postcode = values.postcode.toUpperCase()
  const messages = []
  if (!values.first_name || !values.last_name) messages.push('Enter your first and last name.')
  if (!/^\+?[\d\s()-]{10,20}$/.test(values.phone) || values.phone.replace(/\D/g, '').length < 10) messages.push('Enter a valid mobile number.')
  if (!values.line1 || !values.city) messages.push('Enter your address and town or city.')
  if (!POSTCODE_RE.test(values.postcode)) messages.push('Enter a valid UK postcode.')
  if (!['ship', 'pickup'].includes(values.method)) messages.push('Choose home delivery or Click & Collect.')
  if (values.method === 'pickup' && !COLLECTION_POINTS.includes(values.collection_point)) messages.push('Choose a collection store.')
  messages.push(...validateCart(req.store.cart,values.method).messages, ...scenarioMessages(req, values.method, values.collection_point))
  if (values.method === 'pickup' && [values.pickup_first_name, values.pickup_last_name, values.pickup_email, values.pickup_phone].some(Boolean) && (!values.pickup_first_name || !values.pickup_last_name || !EMAIL_RE.test(values.pickup_email) || !/^[+\d][\d\s()-]{9,19}$/.test(values.pickup_phone))) messages.push('Enter the pickup person’s name, valid email and phone.')
  if (!POSTCODE_RE.test(req.store.postcode||'')) messages.push('Check stock using your postcode before checkout.')
  if (messages.length) return render(req, res, 'Delivery and collection', P.details(res.locals.base, req.store.cart, { values, messages, shippingAvailable:!scenarioMessages(req).length, addresses:J.checkoutContext(req).addresses }), 400)
  req.store.checkout.details = values
  req.store.checkout.reviewSignature=reviewSignature(req)
  res.redirect(`${res.locals.base}/checkout/payment`)
})
router.get('/checkout/payment', (req, res) => {
  if (guard(req,res,true)) render(req,res,'Payment',P.payment(res.locals.base,req.store.cart,req.store.checkout.details,{reviewToken:req.store.checkout.reviewSignature}))
})
router.post('/checkout/payment', (req, res) => {
  if (!guard(req, res, true)) return
  const base = res.locals.base
  const details = req.store.checkout.details
  const validation=validateCart(req.store.cart,details.method)
  validation.messages.push(...scenarioMessages(req, details.method, details.collection_point))
  if(!POSTCODE_RE.test(req.store.postcode||'') || !POSTCODE_RE.test(details.postcode||'') || !['ship','pickup'].includes(details.method) || (details.method==='pickup'&&!COLLECTION_POINTS.includes(details.collection_point))) validation.messages.push('Check your postcode and delivery or collection selection.')
  if(validation.messages.length) return render(req,res,'Your trolley',P.trolley(base,req.store.cart,validation.messages),400)
  if(req.store.checkout.reviewSignature!==reviewSignature(req) || (req.body.review_token && str(req.body.review_token)!==req.store.checkout.reviewSignature)) return render(req,res,'Payment',P.payment(base,req.store.cart,details,{messages:['Your trolley or details have changed. Review your order again before paying.'],reviewToken:req.store.checkout.reviewSignature}),409)
  // Legacy clients may omit a token; the session signature still binds the unchanged reviewed cart and details.
  // Whitelist only display-safe fields. PAN and CVV never reach session, HTML or orders.
  const values = Object.fromEntries(['name_on_card', 'expiry', 'billing_line1', 'billing_city', 'billing_postcode', 'terms'].map(k => [k, str(req.body[k])]))
  values.billing_same = req.body.billing_same === '1' ? '1' : '0'
  const card = validateCard({ number: str(req.body.card_number), expiry: values.expiry, cvv: str(req.body.cvv) })
  const messages = card.ok ? [] : Object.values(card.errors)
  if (card.ok && !['Visa', 'Mastercard', 'American Express'].includes(card.brand)) messages.push('Use Visa, Mastercard or American Express.')
  if (!values.name_on_card) messages.push('Enter the name on your card.')
  if (values.terms !== '1') messages.push(`Please agree to the order details and ${hasPreorder(req.store.cart)?'pre-order ':''}payment terms.`)
  if (values.billing_same === '0') {
    if (!values.billing_line1 || !values.billing_city) messages.push('Enter your billing address and town or city.')
    if (!POSTCODE_RE.test(values.billing_postcode)) messages.push('Enter a valid billing postcode.')
  }
  if (messages.length) return render(req, res, 'Payment', P.payment(base, req.store.cart, details, { values, messages, reviewToken:req.store.checkout.reviewSignature }), 400)
  const rejected = scenarioPayment(req.store, { method: 'card', last4: card.last4 }, validation.cart)
  if (rejected) return render(req,res,'Payment',P.payment(base,req.store.cart,details,{values,messages:[rejected],reviewToken:req.store.checkout.reviewSignature}),402)
  const address = { first_name: details.first_name, last_name: details.last_name, line1: details.line1, line2: details.line2, city: details.city, state: '', postal_code: details.postcode, country: 'GB' }
  const billing = values.billing_same === '1' ? address : { ...address, line1: values.billing_line1, line2: '', city: values.billing_city, postal_code: values.billing_postcode.toUpperCase() }
  // ASSUMPTION: no real order was placed; an illustrative nine-digit reference is used.
  const order = recordOrder({
    store: req.storeSlug, order_number: String(randomInt(100000000, 1000000000)), session: req.session,
    items: validation.cart.map(p => ({ ...p })),
    customer: { email: req.store.checkout.email, first_name: details.first_name, last_name: details.last_name, phone: details.phone, guest: !req.store.user, account_id: req.store.user?.id ?? null },
    fulfillment: { method: details.method, option: details.method === 'pickup' ? 'click-and-collect' : 'home-delivery', ...(details.method === 'pickup' ? { store_location: details.collection_point } : {}), eta: orderEta(validation.cart,details.method) },
    shipping_address: details.method === 'ship' ? address : null, billing_address: billing,
    payment: { method: 'card', brand: card.brand, last4: card.last4, name_on_card: values.name_on_card },
    totals: totals(req.store.cart), currency: 'GBP',
    meta: { ...(details.method === 'pickup' ? { pickup_store_id: details.collection_point, pickup_person: { first_name: details.pickup_first_name || details.first_name, last_name: details.pickup_last_name || details.last_name, email: details.pickup_email || req.store.checkout.email, phone: details.pickup_phone || details.phone }, items_fulfillment: validation.cart.map(item => ({ sku: item.sku, fulfillment: 'pickup' })) } : {}), preorder: hasPreorder(validation.cart), account_id:req.store.user?.id??null, options:validation.cart.map(p=>({sku:p.sku,variant_id:p.variant_id,label:p.variant_label,qty:p.qty,estimate:fulfilmentText(p,details.method)})), vat_included: true, charge_timing: 'paid in full at order', synthetic_inventory: true, synthetic_checkout: true },
  })
  req.store.cart = []
  req.store.checkout = {}
  res.redirect(`${base}/checkout/confirmation/${order.order_number}`)
})
router.get('/checkout/confirmation/:number', (req, res) => {
  const order = J.privateOrder(req,req.params.number)
  if (!order) return notFound(req, res)
  render(req, res, 'Order confirmation', P.complete(res.locals.base, order))
})
router.use(notFound)

export default { slug: 'argos', name: 'Argos', country: 'UK', currency: 'GBP', gta6_available: fixtureCatalog ? true : null, availability_status: fixtureCatalog ? 'available' : 'listing_only', description: fixtureCatalog ? 'UK code-in-box preorder fixture with postcode checkout.' : 'UK GTA VI listings; postcode availability unverified.', router }

registerScenarioAdapter('argos', { seed(store, id, qty) { store.cart = [{ ...selectedProduct(bySku(id)), qty, age_confirmed: true }] } })
