import { fixtureCatalog } from '../../lib/catalog-policy.js'
import { esc, money, publicNotice } from '../../lib/html.js'
import { retailState, toggleFavorite, saveAddress, deleteAddress, defaultAddress, ownedOrders, ownedOrder, orderStatus, requestOrderAction, createSupportCase } from '../../lib/retail-state.js'
import { bySku, selectedProduct, lineKey, validateCart, POSTCODE_RE, COLLECTION_POINTS } from './data.js'
import { artwork } from './catalog.js'
import { HELP_SECTIONS } from './site-data.js'

const clean = (v, max = 240) => typeof v === 'string' ? v.trim().slice(0, max) : ''
const price = n => money(n, 'GBP')
const errors = messages => messages.length ? `<div class="error" role="alert"><strong>Please check your details</strong><ul>${messages.map(m => `<li>${esc(m)}</li>`).join('')}</ul></div>` : ''
const field = (name, label, values = {}, type = 'text', required = true) => `<div class="field"><label for="${name}">${label}</label><input id="${name}" name="${name}" type="${type}" value="${esc(values[name])}" ${required ? 'required' : ''} maxlength="240"></div>`
const hidden = (name, value) => `<input type="hidden" name="${name}" value="${esc(value)}">`
const productUrl = (base, p) => `${base}/product/${p.sku}${p.variant_id ? `?variant=${encodeURIComponent(p.variant_id)}` : ''}`
const resolveKey = key => { const [sku, variant = ''] = clean(key).split(':'); return selectedProduct(bySku(sku), variant) }
const canSeeOrder = (req, order) => order && (!(order.customer?.account_id || order.meta?.account_id) || (order.customer?.account_id || order.meta?.account_id) === req.store.user?.id)
export const privateOrder = (req, id) => { const order = ownedOrder(req, id); return canSeeOrder(req, order) ? order : null }
const myOrders = req => ownedOrders(req).filter(order => canSeeOrder(req, order)).reverse()
export function profile(req) { return { ...req.store.user, ...retailState(req).preferences.profile } }
export function applyProfile(req) { if (req.store.user) Object.assign(req.store.user, retailState(req).preferences.profile || {}) }
export function addressValues(address) {
  const [first_name, ...last] = address.name.split(/\s+/)
  return { first_name, last_name: last.join(' '), phone: address.phone, line1: address.line1, line2: address.line2, city: address.city, postcode: address.postal_code }
}
export function checkoutContext(req) {
  const state = retailState(req), user = profile(req), address = req.store.user ? defaultAddress(req) : null
  return { addresses: req.store.user ? state.addresses : [], values: { first_name: user.first_name, last_name: user.last_name, phone: user.phone, postcode: req.store.postcode, ...(address ? addressValues(address) : {}), collection_point: state.selectedStore || '' } }
}
const accountNav = base => `<nav class="journey-nav" aria-label="Your account"><a href="${base}/account">Account overview</a><a href="${base}/account/orders">Recent orders</a><a href="${base}/account/profile">Personal details</a><a href="${base}/account/addresses">Address book</a><a href="${base}/account/preferences">Preferences</a><a href="${base}/wishlist">Wishlist</a><a href="${base}/help/cases">Your help requests</a></nav>`
const statusText = order => ({ processing: 'Processing', cancelled: 'Cancelled', delivered: 'Delivered', return_requested: 'Return requested' })[orderStatus(order)] || 'Processing'
export function dashboard(base, req) {
  const state = retailState(req), user = profile(req)
  return `<h1>Hello ${esc(user.first_name)}</h1><p>${esc(user.email)}</p>${accountNav(base)}<div class="journey-grid">${[['Recent orders', '/account/orders', `${myOrders(req).length} ${myOrders(req).length === 1 ? 'order' : 'orders'} placed in this browser`], ['Address book', '/account/addresses', `${state.addresses.length} saved ${state.addresses.length === 1 ? 'address' : 'addresses'}`], ['Wishlist', '/wishlist', `${state.favorites.length} saved choices`], ['Personal details', '/account/profile', 'Your name and contact number'], ['Preferences', '/account/preferences', 'Your shopping and communication choices'], ['Help & services', '/help', 'Delivery, collection and product support']].map(([title, href, text]) => `<a class="journey-tile" href="${base}${href}"><h2>${title}</h2><p>${text}</p></a>`).join('')}</div><p><a href="${base}/recently-viewed">Recently viewed products</a> · <a href="${base}/trolley">Your trolley and saved items</a></p><form method="post" action="${base}/account/signout"><button class="secondary">Sign out</button></form>`
}
function savedCard(base, p, action) {
  return `<article class="saved-card">${artwork(p, 'saved-photo')}<div><h2><a href="${productUrl(base, p)}">${esc(p.title)}</a></h2><p>${esc(p.variant_label || p.family)} · ${price(p.unit_price)}${p.qty ? ` · Quantity ${p.qty}` : ''}</p><p>${p.catalogEvidence?.availability === 'unknown' ? 'Check stock on the product page for delivery and collection options.' : p.stock > 0 ? 'Check your postcode for delivery or collection.' : 'This option is currently out of stock.'}</p>${action}</div></article>`
}
export function savedItems(base, req, messages = []) {
  const saved = retailState(req).savedForLater
  return `<section class="saved-items"><h2>Saved for later (${saved.length})</h2>${errors(messages)}${saved.length ? saved.map(item => {
    const p = selectedProduct(bySku(item.sku), item.variant)
    if (!p) return `<article><p>This saved option is no longer in the range.</p><form method="post" action="${base}/trolley/saved/remove">${hidden('line_key', item.key)}<button class="secondary">Remove saved item</button></form></article>`
    return savedCard(base, { ...p, qty: item.qty }, `<form method="post" action="${base}/trolley/restore">${hidden('line_key', item.key)}<button>Move to trolley</button><button class="secondary" formaction="${base}/trolley/saved/remove">Remove saved item</button></form>`)
  }).join('') : '<p>Save an item from your trolley to come back to it later.</p>'}</section>`
}
function addressPage(base, req, values = {}, messages = [], editing = false) {
  const state = retailState(req)
  return `<h1>Your address book</h1>${accountNav(base)}${errors(messages)}<div class="journey-grid">${state.addresses.map(a => `<article class="journey-tile"><h2>${esc(a.label || a.name)}${a.is_default ? ' · Default' : ''}</h2><p>${esc(a.name)}<br>${esc(a.line1)}<br>${a.line2 ? `${esc(a.line2)}<br>` : ''}${esc(a.city)}, ${esc(a.postal_code)}<br>${esc(a.phone)}</p><a href="${base}/account/addresses/${a.id}/edit">Edit address</a><form method="post" action="${base}/account/addresses/${a.id}/default"><button class="secondary">Make default</button></form><form method="post" action="${base}/account/addresses/${a.id}/delete"><button class="secondary">Delete address</button></form></article>`).join('') || '<p>No saved addresses yet.</p>'}</div><h2>${editing ? 'Edit address' : 'Add an address'}</h2><form class="narrow" method="post" action="${base}/account/addresses">${hidden('id', values.id || '')}${field('label', 'Address label (optional)', values, 'text', false)}${field('name', 'Full name', values)}${field('phone', 'Mobile number', values, 'tel')}${field('line1', 'Address line 1', values)}${field('line2', 'Address line 2 (optional)', values, 'text', false)}${field('city', 'Town or city', values)}${field('postal_code', 'Postcode', values)}<p>Country: United Kingdom</p><label class="check"><input type="checkbox" name="is_default" value="yes" ${values.is_default ? 'checked' : ''}> Use as my default address</label><button>Save address</button></form>`
}
function profilePage(base, req, values = profile(req), messages = [], saved = false) {
  return `<h1>Personal details</h1>${accountNav(base)}${errors(messages)}${saved ? '<p class="notice" role="status">Your details have been saved.</p>' : ''}<p>Sign-in email: ${esc(req.store.user.email)}. To change your sign-in email or password, please contact customer services.</p><form class="narrow" method="post" action="${base}/account/profile">${field('first_name', 'First name', values)}${field('last_name', 'Last name', values)}${field('phone', 'Mobile number', values, 'tel')}<button>Save personal details</button></form>`
}
function preferencesPage(base, req, messages = [], saved = false, values = retailState(req).preferences) {
  return `<h1>Your preferences</h1>${accountNav(base)}${errors(messages)}${saved ? '<p class="notice" role="status">Your preferences have been saved.</p>' : ''}<form class="narrow" method="post" action="${base}/account/preferences"><label class="check"><input type="checkbox" name="offers" value="yes" ${values.offers ? 'checked' : ''}> I would like news and offers by email</label><div class="field"><label for="shopping_method">Preferred way to shop</label><select id="shopping_method" name="shopping_method">${[['ask', 'Choose each time'], ['ship', 'Home delivery'], ['pickup', 'Click & Collect']].map(([v, l]) => `<option value="${v}" ${values.shopping_method === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div><p>These preferences stay with this account in this browser. No marketing emails are sent.</p><button>Save preferences</button></form><h2>Nectar at Argos</h2><p>Nectar linking is not available here. <a href="${base}/help/nectar-services">Read about services and rewards</a>.</p>`
}
function orderList(base, req) {
  const orders = myOrders(req)
  return `<h1>Your orders</h1>${req.store.user ? accountNav(base) : `<p>Orders placed as a guest in this browser appear here. <a href="${base}/order/tracking">Track an order</a>.</p>`}${orders.length ? orders.map(o => `<article class="order-card"><div><h2><a href="${base}/orders/${o.order_number}">Order ${esc(o.order_number)}</a></h2><p>${esc(new Date(o.created_at).toLocaleDateString('en-GB'))} · ${o.items.length} ${o.items.length === 1 ? 'item' : 'items'} · ${price(o.totals.total)}</p></div><p class="order-status">${statusText(o)}</p><p>${esc(o.items.map(i => i.title).join(', '))}</p><a href="${base}/orders/${o.order_number}">View details and track order</a></article>`).join('') : '<p>No orders to show in this browser yet.</p>'}<p><a href="${base}/">Continue shopping</a></p>`
}
function orderPage(base, order, messages = [], reason = '') {
  const status = orderStatus(order), estimate = status === 'cancelled' ? 'Cancelled — no delivery or collection is due.' : status === 'return_requested' ? 'Your return request has been recorded. No refund has been processed.' : status === 'delivered' ? 'Delivery recorded for this order.' : order.fulfillment.eta
  return `<nav class="breadcrumbs"><a href="${base}/orders">Your orders</a> / ${esc(order.order_number)}</nav><h1>Order ${esc(order.order_number)}</h1><p class="order-status">${statusText(order)}</p>${errors(messages)}<div class="columns"><section><h2>Track your order</h2><p>${esc(estimate)}</p>${status === 'processing' ? `<p>${order.fulfillment.method === 'pickup' ? `Collection point: ${esc(order.fulfillment.store_location)}. Your order is not ready to collect.` : 'Your order is being prepared. Carrier tracking is not available yet.'}</p>` : ''}${order.items.map((item,index) => { const option = order.meta.options?.[index]; return `<article class="order-item"><h2>${esc(item.title)}</h2><p>${esc(option?.label || '')} · Quantity ${item.qty} · ${price(item.unit_price * item.qty)}</p><p>${esc(status === 'processing' ? option?.estimate || estimate : estimate)}</p></article>` }).join('')}<h2>Manage your order</h2>${status === 'processing' || status === 'delivered' ? `<form class="narrow" method="post" action="${base}/orders/${order.order_number}/action">${hidden('action', status === 'processing' ? 'cancel' : 'return')}${field('reason', status === 'processing' ? 'Reason for cancellation' : 'Reason for return', { reason })}<button>${status === 'processing' ? 'Cancel order' : 'Request a return'}</button></form>${status === 'processing' ? '<p>Returns become available after delivery. You can cancel while this order is processing.</p>' : '<p>The request records your need for help; it does not arrange a collection or issue a refund.</p>'}` : `<p>${status === 'cancelled' ? 'This order has been cancelled.' : 'Your return request is already recorded.'}</p>${status === 'cancelled' ? publicNotice('<p>This is not the real Argos website: no payment was taken, so no bank refund is processed.</p>') : ''}`}<a href="${base}/help/contact?order_id=${order.order_number}">Get help with this order</a></section><aside class="summary"><h2>Order details</h2><p>${esc(order.customer.first_name)} ${esc(order.customer.last_name)}<br>${esc(order.customer.email)}</p>${order.shipping_address ? `<p>${esc(order.shipping_address.line1)}<br>${esc(order.shipping_address.city)}<br>${esc(order.shipping_address.postal_code)}</p>` : ''}<p>Total paid: <strong>${price(order.totals.total)}</strong></p><p>${esc(order.payment.brand)} ending ${esc(order.payment.last4)}</p><h3>Order updates</h3><p>Order received</p>${(order.meta.lifecycle || []).map(e => `<p>${esc(({ cancelled: 'Cancelled', return_requested: 'Return requested', delivered: 'Delivered' })[e.status] || e.status)}${e.reason ? `: ${esc(e.reason)}` : ''}</p>`).join('')}</aside></div>`
}
const ARTICLES = [
  { id: 'delivery-collection', title: 'Delivery & collection', category: 'Delivery and collection', intro: 'Check your postcode, choose home delivery or collect from an Argos store.', paragraphs: ['Check stock on the product page before adding to your trolley. Each product shows whether home delivery and Click & Collect are offered. Large furniture is delivered to your home.', 'Choose your collection point at checkout. Wait until your order is ready before travelling. New orders show as processing until they are ready.', 'Ordinary small items show an estimate of 3–5 working days. Large items and pre-orders have their own estimates on the product and order pages. Any delivery or collection charge is shown at checkout before you pay.'], notice: 'This is not the real Argos website: no collection codes are sent and no real delivery slots are booked.', links: [['Find a store', '/stores'], ['Track an order', '/order/tracking']] },
  { id: 'returns-cancellations', title: 'Returns, cancellations & order issues', category: 'Orders and returns', intro: 'See which actions are available for your order and get help with a problem.', paragraphs: ['Open your recent orders and choose the order you need. While an order is processing, you can cancel it and record the reason.', 'A return can only be requested when delivery has been recorded. The request is saved for review; it does not create a shipping label, collect an item or process a refund.', 'If your product is faulty or you need advice, record a help request with the order reference. Keep any packaging and order details available.'], links: [['Your orders', '/orders'], ['Get help', '/help/contact']] },
  { id: 'manage-account', title: 'Manage your account', category: 'Account', intro: 'Update personal details, saved addresses and shopping preferences.', paragraphs: ['Sign in to see account tools. You can change your name and mobile number, add or edit UK addresses, and choose a default for checkout.', 'Wishlists and saved details stay in this browser and are separate for each signed-in account. Guest saves are kept separately. Order history only includes orders from this browser session.', 'Use Sign out on your account overview when you have finished. Password recovery and email changes are not available here.'], links: [['Your account', '/account'], ['Address book', '/account/addresses']] },
  { id: 'payments', title: 'Payments and pre-orders', category: 'Payments', intro: 'Review your payment and understand pre-order timing.', paragraphs: ['Review your items, quantity and delivery details before payment. We accept Visa, Mastercard and American Express.', 'The full total is recorded when you place your order. Pre-order release and redemption information appears on the product page. Ordinary products do not have pre-order release dates.', 'Only card brand and last four digits appear in your order. Gift cards and finance applications cannot be used online at the moment.'], notice: 'This is not the real Argos website: use test card details only. No card is charged and no real payment is processed.', links: [['Your trolley', '/trolley']] },
  { id: 'product-support', title: 'Product support and care', category: 'Product support', intro: 'Find the product information and support options you need.', paragraphs: ['Use the catalogue number or product name in product search to find specifications, included contents and available options.', 'Record a product-support request if you need help. Describe the issue and include your order reference when you have one. Never include passwords or full payment details.', 'For manual downloads, repair appointments, replacement parts and Argos Care, please contact customer services.'], links: [['Search products', '/search'], ['Product support request', '/help/contact?category=Product%20support']] },
  { id: 'nectar-services', title: 'Nectar and Argos services', category: 'Services', intro: 'Find information about rewards and extra services.', paragraphs: ['Nectar is part of the Argos shopping experience. Nectar account linking, points balances and reward redemption are currently unavailable online.', 'Assembly, recycling, installation, delivery passes and trade-in are provided by our partners and booked separately, not added to your order.', 'Choose delivery or collection for eligible products at checkout, or use product support for help with an item.'], links: [['Product support', '/help/product-support'], ['Delivery & collection', '/help/delivery-collection']] },
]
const categories = [...new Set(ARTICLES.map(a => a.category))]
function helpHome(base, q) {
  const found = ARTICLES.filter(a => `${a.title} ${a.intro} ${a.paragraphs.join(' ')}`.toLowerCase().includes(q.toLowerCase()))
  return `<section class="help-intro"><p class="eyebrow">Argos help</p><h1>HOW CAN WE HELP?</h1><form method="get" action="${base}/help"><label for="help-search">Search help and FAQs</label><div class="inline-form"><input id="help-search" name="q" value="${esc(q)}" placeholder="Try delivery, returns or account"><button>Search help</button></div></form></section><h2>${q ? `Help results for “${esc(q)}”` : 'Help topics'}</h2><div class="journey-grid">${found.map(a => `<a class="journey-tile" href="${base}/help/${a.id}"><h2>${a.title}</h2><p>${a.intro}</p></a>`).join('') || `<p>No matching articles. Try a different word or <a href="${base}/help">browse all topics</a>.</p>`}</div>${q ? '' : `<div class="ar-help-sections">${HELP_SECTIONS.map(sec => `<section><h2>${esc(sec.title)}</h2><ul>${sec.links.map(([l, p]) => `<li><a href="${base}${p}">${esc(l)}</a></li>`).join('')}</ul></section>`).join('')}<section class="ar-help-promo"><h2>Save, save, save while you spend, spend, spend</h2><p><a href="${base}/events/voucher-discount-codes">Discover our promotional codes</a></p></section></div><div class="ar-help-quick"><a href="${base}/stores"><strong>Find a store near you</strong><span>Find a store</span></a><a href="${base}/orders"><strong>Check your account</strong><span>Your orders</span></a><a href="${base}/help/contact"><strong>Still stuck?</strong><span>Contact us</span></a></div>`}<section class="help-footer"><h2>Didn't find what you are looking for?</h2><a class="button" href="${base}/help/contact">Contact us</a> <a href="${base}/help/cases">Your help requests</a> · <a href="${base}/order/tracking">Track your order</a></section>`
}
function contactPage(base, req, values = {}, messages = []) {
  return `<h1>Contact us</h1><div class="ar-contact-grid"><section><h2>Common questions</h2><ul><li><a href="${base}/order/tracking">Track my order</a></li><li><a href="${base}/help/returns-product-support-and-repairs">Returns and refunds</a></li><li><a href="${base}/help/returns-cancellations">Cancel my order</a></li><li><a href="${base}/help/terms-and-conditions#trusted-seller">Trusted Sellers</a></li><li><a href="${base}/help/argos-pay">Argos Pay</a></li></ul></section><section><h2>Store information</h2><p>Visit any Argos store for the quickest help. <a href="${base}/stores">Find a store</a>.</p></section><section><h2>My Argos Account</h2><p><a href="${base}/account/login">Log in</a> to manage your account and see past orders.</p></section><section><h2>Chat with us</h2><p>Live chat is currently unavailable. Please use the form below instead.</p></section><section><h2>Call Us</h2><p>Argos customer services are on 0345 640 2020, 8am to 8pm, seven days a week.</p></section><section><h2>Write to Us</h2><p>Argos Limited, Customer Services, Widnes, WA8 8HS.</p></section><section><h2>SignVideo (BSL)</h2><p>A free British Sign Language interpreter service, Monday to Friday, 8am to 6pm.</p></section></div><h2>Send us a message</h2><p><a href="${base}/help">Help & FAQs</a> · <a href="${base}/help/cases">Your help requests</a></p><p>Tell us what you need help with. Please leave out passwords and card details.</p>${publicNotice('<p>This is not the real Argos website: no email is sent and no Argos adviser is contacted.</p>')}${errors(messages)}<form class="narrow" method="post" action="${base}/help/contact"><div class="field"><label for="category">Topic</label><select name="category" id="category" required><option value="">Choose a topic</option>${categories.map(c => `<option ${values.category === c ? 'selected' : ''}>${c}</option>`).join('')}</select></div>${field('email', 'Email address', { email: req.store.user?.email, ...values }, 'email')}${field('subject', 'Subject', values)}<div class="field"><label for="order_id">Related order (optional)</label><select id="order_id" name="order_id"><option value="">No related order</option>${myOrders(req).map(o => `<option value="${o.order_number}" ${values.order_id === o.order_number || values.order_id === o.id ? 'selected' : ''}>${o.order_number} — ${esc(o.items[0].title)}</option>`).join('')}</select></div><div class="field"><label for="message">How can we help?</label><textarea id="message" name="message" rows="6" minlength="10" maxlength="3000" required>${esc(values.message)}</textarea></div><button>Save help request</button></form>`
}
const UNVERIFIED_STORES = '<p class="notice" role="status"><strong>Check stock before you travel.</strong> Stock and Click &amp; Collect availability vary by store, so check stock on the product page first.</p>'
export const STORES = COLLECTION_POINTS.map((name, index) => ({ id: ['london-central', 'manchester-city-centre', 'birmingham-central'][index], name, town: ['London', 'Manchester', 'Birmingham'][index], postcode: ['SW1A 1AA', 'M1 1AA', 'B1 1AA'][index], area: ['SW', 'M', 'B'][index], address: ['10 High Street', '20 Market Street', '30 High Street'][index], hours: ['Monday–Saturday 09:00–18:00', 'Sunday 10:00–16:00'] }))
function storeFinder(base, req, q, sku) {
  const product = bySku(sku), norm = q.toUpperCase().replace(/\s/g, ''), area = norm.match(/^[A-Z]+(?=\d)/)?.[0]
  const found = STORES.filter(s => !q || `${s.name} ${s.town} ${s.postcode}`.toLowerCase().includes(q.toLowerCase()) || s.area === area)
  return `<h1>Find an Argos store near you</h1><p>Search our collection points by town or postcode.</p>${!fixtureCatalog ? UNVERIFIED_STORES : product ? `<p>For <strong>${esc(product.title)}</strong>: ${product.methods.includes('pickup') ? 'Click & Collect is available when in stock. Check your postcode on the product page.' : 'This large item is available for home delivery only.'}</p>` : ''}<form method="get" action="${base}/stores"><label for="store-search">Town or postcode</label><div class="inline-form"><input id="store-search" name="q" value="${esc(q)}">${hidden('sku', sku)}<button>Find stores</button></div><p class="ar-muted"><button type="button" class="secondary ar-locate" disabled title="Location services are unavailable">Use my location</button></p></form><div class="journey-grid">${found.map(s => `<article class="journey-tile"><h2><a href="${base}/stores/${s.id}${sku ? `?sku=${encodeURIComponent(sku)}` : ''}">${s.name}</a></h2><p>${s.address}, ${s.town}<br>${s.postcode}</p><p>Click & Collect · Step-free entrance</p><p>${retailState(req).selectedStore === s.name ? 'Your selected store' : ''}</p></article>`).join('') || `<p>No collection points match. <a href="${base}/stores">See all stores</a>.</p>`}</div>${q ? "" : `<section class="ar-all-stores"><h2>All Stores</h2>${['A-C', 'D-K', 'L-S', 'T-Z'].map(range => { const [from, to] = range.split('-'); const list = STORES.filter(s => s.town[0] >= from && s.town[0] <= to); return `<div><h3>${range}</h3>${list.length ? `<ul>${list.map(s => `<li><a href="${base}/stores/${s.id}">${esc(s.town)}</a></li>`).join('')}</ul>` : '<p class="ar-muted">No stores</p>'}</div>` }).join('')}</section>`}`
}

export function mountJourneys(router, { render, notFound, invalidateCheckout }) {
  router.use((req,res,next)=>{
    if (!fixtureCatalog && req.method !== 'GET' && (req.path === '/stores' || req.path.startsWith('/stores/'))) return render(req,res,'Click & Collect unavailable','<h1>Click &amp; Collect is currently unavailable</h1><p>Sorry, we can’t reserve items at this store right now. Please check stock on the product page or try again later.</p>',req.method==='GET'?200:409)
    next()
  })
  const base = res => res.locals.base
  const member = (req, res, next) => req.store.user ? next() : res.redirect(`${base(res)}/account`)
  const showSaved = (req, res, messages = [], status = 200) => render(req, res, 'Saved for later', `<h1>Saved for later</h1><a href="${base(res)}/trolley">Back to your trolley</a>${savedItems(base(res), req, messages)}`, status)
  router.get('/wishlist', (req, res) => {
    const state = retailState(req)
    render(req, res, 'Your wishlist', `<h1>Your wishlist</h1><p>${req.store.user ? 'Your choices are saved for this account in this browser.' : `Your choices are saved in this browser. <a href="${base(res)}/account">Sign in</a> to use your separate account wishlist.`}</p>${state.favorites.map(key => resolveKey(key)).filter(Boolean).map(p => savedCard(base(res), p, `<form method="post" action="${base(res)}/wishlist/toggle">${hidden('sku', p.sku)}${hidden('variant', p.variant_id)}${hidden('destination', 'wishlist')}<button class="secondary">Remove from wishlist</button></form>`)).join('') || `<p>Your wishlist is empty. <a href="${base(res)}/">Find something you love</a>.</p>`}<p><a href="${base(res)}/recently-viewed">Recently viewed</a> · <a href="${base(res)}/trolley">Saved for later in your trolley</a></p>`)
  })
  router.post('/wishlist/toggle', (req, res) => {
    const p = selectedProduct(bySku(clean(req.body.sku)), clean(req.body.variant))
    if (!p) return notFound(req, res)
    toggleFavorite(req, lineKey(p))
    res.redirect(req.body.destination === 'wishlist' ? `${base(res)}/wishlist` : productUrl(base(res), p))
  })
  router.get('/recently-viewed', (req, res) => render(req, res, 'Recently viewed', `<h1>Recently viewed</h1>${retailState(req).recent.map(key => resolveKey(key)).filter(Boolean).map(p => savedCard(base(res), p, `<a href="${productUrl(base(res), p)}">View product and options</a>`)).join('') || '<p>Products you look at will appear here.</p>'}<form method="post" action="${base(res)}/recently-viewed/clear"><button class="secondary">Clear recently viewed</button></form>`))
  router.post('/recently-viewed/clear', (req, res) => { retailState(req).recent = []; res.redirect(`${base(res)}/recently-viewed`) })
  router.post('/trolley/save', (req, res) => {
    const item = req.store.cart.find(p => lineKey(p) === clean(req.body.line_key))
    if (!item) return showSaved(req, res, ['Choose an exact item and option in your trolley.'], 400)
    const state = retailState(req), key = lineKey(item), previous = state.savedForLater.find(p => p.key === key)
    if (previous && previous.qty + item.qty > 5) return showSaved(req, res, ['You can save up to five of this option.'], 400)
    if (previous) previous.qty += item.qty
    else state.savedForLater.push({ key, sku: item.sku, variant: item.variant_id || '', qty: item.qty, age_confirmed: item.age_confirmed === true })
    req.store.cart = req.store.cart.filter(p => p !== item)
    invalidateCheckout(req)
    res.redirect(`${base(res)}/trolley`)
  })
  router.post('/trolley/saved/remove', (req, res) => {
    const state = retailState(req), item = state.savedForLater.find(p => p.key === clean(req.body.line_key))
    if (!item) return showSaved(req, res, ['Saved item not found.'], 404)
    state.savedForLater = state.savedForLater.filter(p => p !== item)
    res.redirect(`${base(res)}/trolley`)
  })
  router.post('/trolley/restore', (req, res) => {
    const state = retailState(req), item = state.savedForLater.find(p => p.key === clean(req.body.line_key))
    if (!item) return showSaved(req, res, ['Saved item not found.'], 404)
    const p = selectedProduct(bySku(item.sku), item.variant)
    if (!p || !POSTCODE_RE.test(req.store.postcode || '') || (p.pegi && !item.age_confirmed)) return showSaved(req, res, ['Check this product option and your postcode before moving it to your trolley.'], 400)
    const candidate = req.store.cart.map(p => ({ ...p })), existing = candidate.find(line => lineKey(line) === item.key)
    if (existing) existing.qty += item.qty
    else candidate.push({ ...p, qty: item.qty, age_confirmed: item.age_confirmed })
    const validation = validateCart(candidate)
    if (validation.messages.length) return showSaved(req, res, validation.messages, 400)
    req.store.cart = candidate
    state.savedForLater = state.savedForLater.filter(p => p !== item)
    invalidateCheckout(req)
    res.redirect(`${base(res)}/trolley`)
  })
  router.get('/account/profile', member, (req, res) => render(req, res, 'Personal details', profilePage(base(res), req)))
  router.post('/account/profile', member, (req, res) => {
    const values = Object.fromEntries(['first_name', 'last_name', 'phone'].map(k => [k, clean(req.body[k])])), messages = []
    if (!values.first_name || !values.last_name) messages.push('Enter your first and last name.')
    if (!/^\+?[\d\s()-]{10,20}$/.test(values.phone) || values.phone.replace(/\D/g, '').length < 10) messages.push('Enter a valid mobile number.')
    if (messages.length) return render(req, res, 'Personal details', profilePage(base(res), req, values, messages), 400)
    retailState(req).preferences.profile = values
    applyProfile(req); invalidateCheckout(req)
    render(req, res, 'Personal details', profilePage(base(res), req, values, [], true))
  })
  router.get('/account/preferences', member, (req, res) => render(req, res, 'Preferences', preferencesPage(base(res), req)))
  router.post('/account/preferences', member, (req, res) => {
    const values = { offers: req.body.offers === 'yes', shopping_method: clean(req.body.shopping_method) }
    if (!['ask', 'ship', 'pickup'].includes(values.shopping_method)) return render(req, res, 'Preferences', preferencesPage(base(res), req, ['Choose a delivery or collection preference.'], false, values), 400)
    Object.assign(retailState(req).preferences, values)
    invalidateCheckout(req)
    render(req, res, 'Preferences', preferencesPage(base(res), req, [], true))
  })
  router.get('/account/addresses', member, (req, res) => render(req, res, 'Address book', addressPage(base(res), req)))
  router.get('/account/addresses/:id/edit', member, (req, res) => {
    const address = retailState(req).addresses.find(a => a.id === req.params.id)
    if (!address) return notFound(req, res)
    render(req, res, 'Edit address', addressPage(base(res), req, address, [], true))
  })
  router.post('/account/addresses', member, (req, res) => {
    const values = Object.fromEntries(['id', 'label', 'name', 'phone', 'line1', 'line2', 'city', 'postal_code', 'is_default'].map(k => [k, clean(req.body[k])]))
    values.postal_code = values.postal_code.toUpperCase()
    const messages = []
    if (!/^\+?[\d\s()-]{10,20}$/.test(values.phone) || values.phone.replace(/\D/g, '').length < 10) messages.push('Enter a valid mobile number.')
    if (!POSTCODE_RE.test(values.postal_code)) messages.push('Enter a valid UK postcode.')
    if (messages.length) return render(req, res, 'Address book', addressPage(base(res), req, values, messages, !!values.id), 400)
    const result = saveAddress(req, values, { country: 'UK', requirePhone: true })
    if (result.errors) return render(req, res, 'Address book', addressPage(base(res), req, values, result.errors.map(e => e.replace('city', 'town or city').replace('postal code', 'UK postcode')), !!values.id), 400)
    invalidateCheckout(req)
    res.redirect(`${base(res)}/account/addresses`)
  })
  router.post('/account/addresses/:id/default', member, (req, res) => {
    const state = retailState(req), address = state.addresses.find(a => a.id === req.params.id)
    if (!address) return notFound(req, res)
    state.addresses.forEach(a => { a.is_default = a === address }); invalidateCheckout(req)
    res.redirect(`${base(res)}/account/addresses`)
  })
  router.post('/account/addresses/:id/delete', member, (req, res) => {
    if (!deleteAddress(req, req.params.id)) return notFound(req, res)
    invalidateCheckout(req); res.redirect(`${base(res)}/account/addresses`)
  })
  router.get(['/orders', '/account/orders'], (req, res) => {
    if (req.path.startsWith('/account') && !req.store.user) return res.redirect(`${base(res)}/account`)
    render(req, res, 'Your orders', orderList(base(res), req))
  })
  router.get(['/orders/:number', '/account/orders/:number'], (req, res) => {
    const order = privateOrder(req, req.params.number)
    if (!order) return notFound(req, res)
    render(req, res, `Order ${order.order_number}`, orderPage(base(res), order))
  })
  router.post('/orders/:number/action', (req, res) => {
    const order = privateOrder(req, req.params.number)
    if (!order) return notFound(req, res)
    const result = requestOrderAction(req, order.id, clean(req.body.action), clean(req.body.reason, 1000))
    if (result.error) return render(req, res, 'Manage your order', orderPage(base(res), order, [result.error], clean(req.body.reason, 1000)), result.status)
    res.redirect(`${base(res)}/orders/${order.order_number}`)
  })
  const tracking = (req, res, values = {}, messages = [], status = 200) => render(req, res, req.query?.type === 'returns' ? 'Returns' : 'Track your order', `${req.query?.type === 'returns' ? `<h1>Returns</h1><p>Find your order to start a return. Returns are accepted within 30 days for change of mind; see <a href="${base(res)}/help/returns-product-support-and-repairs">Returns, product support and repairs</a>.</p><h2>Track your order</h2>` : '<h1>Track your order</h1>'}<p>Enter your order details. Orders can be looked up only in the browser where they were placed. Sign in to the owning account for account orders.</p>${errors(messages)}<form class="narrow" method="post" action="${base(res)}/order/tracking">${field('order_number', 'Order number', values)}${field('email', 'Email address', values, 'email')}${field('last_name', 'Last name', values)}${field('postcode', 'Billing postcode', values)}<button>Track order</button></form>`, status)
  router.get('/order/tracking', (req, res) => tracking(req, res))
  router.post('/order/tracking', (req, res) => {
    const values = Object.fromEntries(['order_number', 'email', 'last_name', 'postcode'].map(k => [k, clean(req.body[k])])), order = privateOrder(req, values.order_number)
    const normalise = v => clean(v).toLowerCase().replace(/\s/g, '')
    if (!order || normalise(values.email) !== normalise(order.customer.email) || normalise(values.last_name) !== normalise(order.customer.last_name) || normalise(values.postcode) !== normalise(order.billing_address?.postal_code)) return tracking(req, res, values, ['We could not find an order matching those details in this session.'], 404)
    res.redirect(`${base(res)}/orders/${order.order_number}`)
  })
  router.get('/help', (req, res) => render(req, res, 'Help & FAQs', helpHome(base(res), clean(req.query.q))))
  router.get('/help/contact', (req, res) => {
    const orderId = clean(req.query.order_id)
    if (orderId && !privateOrder(req, orderId)) return notFound(req, res)
    render(req, res, 'Contact us', contactPage(base(res), req, { order_id: orderId, category: clean(req.query.category) }))
  })
  router.post('/help/contact', (req, res) => {
    const values = Object.fromEntries(['category', 'email', 'subject', 'message', 'order_id'].map(k => [k, clean(req.body[k], k === 'message' ? 3000 : 240)])), messages = []
    if (!categories.includes(values.category)) messages.push('Choose one of the help topics.')
    if (values.order_id && !privateOrder(req, values.order_id)) messages.push('Order not found in this session and account.')
    if (messages.length) return render(req, res, 'Contact us', contactPage(base(res), req, values, messages), 400)
    const result = createSupportCase(req, values)
    if (result.errors) return render(req, res, 'Contact us', contactPage(base(res), req, result.values, result.errors), 400)
    res.redirect(`${base(res)}/help/cases/${result.supportCase.id}`)
  })
  router.get('/help/cases', (req, res) => render(req, res, 'Your help requests', `<h1>Your help requests</h1>${retailState(req).cases.map(c => `<article class="order-card"><h2><a href="${base(res)}/help/cases/${c.id}">${esc(c.subject)}</a></h2><p>${esc(c.id)} · Received · ${esc(c.category)}</p></article>`).join('') || '<p>No help requests saved here yet.</p>'}<a href="${base(res)}/help/contact">Create a help request</a>`))
  router.get('/help/cases/:id', (req, res) => {
    const supportCase = retailState(req).cases.find(c => c.id === req.params.id)
    if (!supportCase) return notFound(req, res)
    render(req, res, 'Help request received', `<h1>Your help request has been received</h1><p class="notice">Reference: ${esc(supportCase.id)} · Status: Received</p><h2>${esc(supportCase.subject)}</h2><p>${esc(supportCase.category)}</p><p class="case-message">${esc(supportCase.message)}</p><p>Contact email: ${esc(supportCase.email)}</p>${supportCase.order_id ? `<p>Related order: <a href="${base(res)}/orders/${esc(supportCase.order_id)}">${esc(supportCase.order_id)}</a></p>` : ''}<p>This request is stored locally. No message has been sent to Argos and no live reply is scheduled.</p><a href="${base(res)}/help/cases">View your help requests</a>`)
  })
  router.get('/help/:topic', (req, res) => {
    const article = ARTICLES.find(a => a.id === req.params.topic)
    if (!article) return notFound(req, res)
    render(req, res, article.title, `<nav class="breadcrumbs"><a href="${base(res)}/help">Help & FAQs</a> / ${article.category}</nav><article class="help-article"><h1>${article.title}</h1><p class="listing-description">${article.intro}</p>${article.paragraphs.map(p => `<p>${p}</p>`).join('')}${article.notice ? publicNotice(`<p>${article.notice}</p>`) : ''}<div class="journey-nav">${article.links.map(([label, url]) => `<a href="${base(res)}${url}">${label}</a>`).join('')}</div></article>`)
  })
  router.get('/stores', (req, res) => render(req, res, 'Find a store', storeFinder(base(res), req, clean(req.query.q), clean(req.query.sku))))
  router.get('/stores/:id', (req, res) => {
    const store = STORES.find(s => s.id === req.params.id), sku = clean(req.query.sku), p = bySku(sku)
    if (!store) return notFound(req, res)
    render(req, res, store.name, `<nav class="breadcrumbs"><a href="${base(res)}/stores">Find a store</a> / ${store.town}</nav><h1>${store.name}</h1>${fixtureCatalog ? '' : UNVERIFIED_STORES}<div class="columns"><section><p>${store.address}<br>${store.town}<br>${store.postcode}</p><h2>Opening hours</h2>${store.hours.map(h => `<p>${h}</p>`).join('')}<h2>Services</h2><ul><li>Click & Collect for eligible items</li><li>Step-free entrance</li><li>Product and returns advice</li></ul><p>Bring your order reference when collecting. Wait for a ready-to-collect confirmation before travelling.</p></section><section class="summary"><h2>Your collection store</h2><p>${retailState(req).selectedStore === store.name ? 'This is your selected store.' : 'Select this store to prefill your next collection order.'}</p>${fixtureCatalog ? `${p && !p.methods.includes('pickup') ? `<p>${esc(p.title)} is home delivery only.</p>` : ''}<form method="post" action="${base(res)}/stores/${store.id}/select"><button>Select this store</button></form>` : ''}${p ? `<p><a href="${base(res)}/product/${p.sku}">Back to ${esc(p.title)}</a></p>` : ''}<p><a href="${base(res)}/help/delivery-collection">Delivery & collection help</a></p></section></div>`)
  })
  router.post('/stores/:id/select', (req, res) => {
    const store = STORES.find(s => s.id === req.params.id)
    if (!store) return notFound(req, res)
    retailState(req).selectedStore = store.name; invalidateCheckout(req)
    res.redirect(`${base(res)}/stores/${store.id}`)
  })
}
