import { fixtureCatalog } from '../../lib/catalog-policy.js'
import { productImage } from '../../lib/product-assets.js'
import { shelfImage } from './shelf.js'
import { randomUUID } from 'node:crypto'
import { esc, money } from '../../lib/html.js'
import { retailState, rememberProduct, saveAddress, deleteAddress, defaultAddress, ownedOrders, ownedOrder, orderStatus, requestOrderAction, createSupportCase } from '../../lib/retail-state.js'
import { byId, selectedProduct, productPath, optionText, lineKey, stockLimit, STATES, LOCATION, WALMART_PLUS } from './data.js'

const clean = (value, max = 160) => typeof value === 'string' ? value.trim().slice(0, max) : ''
const hidden = (name, value) => `<input type="hidden" name="${name}" value="${esc(value)}">`
const button = (text, value = '') => `<button class="wm-pill wm-pill-white"${value ? ` name="action" value="${value}"` : ''}>${esc(text)}</button>`
const errors = messages => messages?.length ? `<div class="wm-error-summary" role="alert"><ul>${messages.map(m => `<li>${esc(m)}</li>`).join('')}</ul></div>` : ''
const field = (name, label, value = '', type = 'text') => `<div class="wm-field"><label for="journey-${name}">${label}</label><input id="journey-${name}" name="${name}" type="${type}" value="${esc(value)}"></div>`
const tabs = base => `<nav class="wm-journey-tabs" aria-label="My Items"><a href="${base}/my-items">Reorder</a><a href="${base}/lists">Lists</a><a href="${base}/my-items/recent">Recently viewed</a><a href="${base}/registries">Registries</a></nav>`
const accountNav = base => `<nav class="wm-journey-tabs" aria-label="Account"><a href="${base}/account">Account</a><a href="${base}/orders">Purchase history</a><a href="${base}/account/addresses">Addresses</a><a href="${base}/account/preferences">Preferences</a><a href="${base}/account/plus">Walmart+</a><a href="${base}/help/cases">Your help requests</a></nav>`
const statusLabel = order => ({ processing: 'Processing', cancelled: 'Cancelled', delivered: 'Delivered', return_requested: 'Return requested' }[orderStatus(order)] || 'Processing')
const recordedOwner = order => order.customer?.account_id || order.meta?.account_id
export const privateOrders = req => req.store.user ? ownedOrders(req).filter(o => recordedOwner(o) === req.store.user.id) : []
export function privateOrder(req, id) {
  const order = ownedOrder(req, id)
  return req.store.user && order && recordedOwner(order) === req.store.user.id ? order : null
}
export { rememberProduct }
export function checkoutAddress(address, user) {
  const [firstName, ...surname] = address.name.split(/\s+/)
  return { firstName, lastName: surname.join(' ') || user.last_name || '', address1: address.line1, address2: address.line2, city: address.city, state: address.state, zip: address.postal_code, phone: address.phone.replace(/\D/g, ''), preferred: address.is_default, addressId: address.id }
}
export function savedAddressValues(req) {
  const address = defaultAddress(req)
  return address ? checkoutAddress(address, req.store.user) : null
}
export function savedAddressPicker(req, base) {
  const addresses = retailState(req).addresses
  return addresses.length ? `<section class="wm-card wm-address-picker"><h2>Use a saved address</h2><form method="get" action="${base}/checkout/review-order"><label for="saved-address">Address book</label><select id="saved-address" name="address_id">${addresses.map(a => `<option value="${a.id}" ${a.id === req.store.checkout.address?.addressId || !req.store.checkout.address && a.is_default ? 'selected' : ''}>${esc(a.label || a.name)} — ${esc(a.line1)}, ${esc(a.postal_code)}${a.is_default ? ' (preferred)' : ''}</option>`).join('')}</select>${button('Use address')}</form><a href="${base}/account/addresses">Manage addresses</a></section>` : ''
}
function lists(req) {
  const state = retailState(req)
  state.lists ||= [{ id: 'favorites', name: 'Favorites', items: [] }]
  return state.lists
}
const selectedUrl = (base, product) => `${productPath(base, product)}${product.variantId ? `?variant=${encodeURIComponent(product.variantId)}` : ''}`
function miniItem(base, product, qty = 1, actions = '') {
  return `<article class="wm-journey-item" data-product="${product.id}">${product.shelf ? shelfImage(product) : productImage('walmart',product)}<div><a href="${selectedUrl(base, product)}"><b>${esc(product.title)}</b></a><p>${esc(optionText(product))}</p><p>${money(product.price)} · Qty ${qty} · ${stockLimit(product) ? 'Shipping available' : 'Out of stock'}</p>${actions}</div></article>`
}
const orderLink = (base, order) => `${base}/orders/${order.id}`
function orderCard(base, order) {
  return `<article class="wm-card"><div class="wm-co-sub-head"><h2>Order ${esc(order.order_number)}</h2><span class="wm-badge-inline">${statusLabel(order)}</span></div><p>${new Date(order.created_at).toLocaleDateString('en-US')} · ${money(order.totals.total)}</p><p>${order.items.map(i => `${esc(i.title)} × ${i.qty}`).join('<br>')}</p><a class="wm-pill wm-pill-white" href="${orderLink(base, order)}">View order details</a> <a href="${orderLink(base, order)}/tracking">Track order</a></article>`
}
function orderBody(base, order, { messages = [], reason = '' } = {}) {
  const state = orderStatus(order), a = order.shipping_address
  return `${accountNav(base)}<p><a href="${base}/orders">Back to purchase history</a></p><h1>Order ${esc(order.order_number)}</h1>${errors(messages)}<p class="wm-badge-inline">${statusLabel(order)}</p><div class="wm-journey-columns"><div><section class="wm-card"><h2>Items in your order</h2>${order.items.map((item, i) => {
    const selection = order.meta.options?.[i], current = selectedProduct(byId(item.sku), selection?.variant_id)
    return `<article class="wm-order-item"><h3>${esc(item.title)}</h3><p>${esc(Object.entries(selection?.options || {}).map(([k, v]) => `${k}: ${v}`).join(' · '))} · Qty ${item.qty} · ${money(item.unit_price * item.qty)}</p><p>${state === 'cancelled' ? 'Shipping cancelled.' : `Estimated arrival: ${esc(selection?.eta || order.fulfillment.eta)}. See tracking for the current status.`}</p>${current ? `<form method="post" action="${orderLink(base, order)}/reorder">${hidden('item', i)}${button('Buy this item again')}</form><p class="wm-fine">Current price and availability apply. This adds the same option and quantity to your cart.</p>` : '<p>This option is no longer offered.</p>'}</article>`
  }).join('')}</section><section class="wm-card"><h2>Delivery address</h2><address>${esc(a.first_name)} ${esc(a.last_name)}<br>${esc(a.line1)} ${esc(a.line2 || '')}<br>${esc(a.city)}, ${esc(a.state)} ${esc(a.postal_code)}</address></section><section class="wm-card"><h2>Manage your order</h2><p><a href="${orderLink(base, order)}/tracking">Track order</a> · <a href="${base}/help/contact?order_id=${order.id}">Get help with this order</a></p>${state === 'processing' || state === 'delivered' ? `<form method="post" action="${orderLink(base, order)}/action">${field('reason', 'Reason for your request', reason)}${button(state === 'processing' ? 'Cancel order' : 'Request a return', state === 'processing' ? 'cancel' : 'return')}</form>` : ''}<p>${state === 'processing' ? 'This order has not shipped and can be cancelled. Returns become eligible for review after delivery; item return terms apply.' : state === 'cancelled' ? 'This order is cancelled in your local purchase history. There was no real charge or refund.' : state === 'return_requested' ? 'Your local return request is recorded. No shipping label or carrier collection has been created.' : 'A return request records your reason for review. No automatic refund or return label is issued.'}</p>${order.meta.lifecycle?.length ? `<h3>Request history</h3><ul>${order.meta.lifecycle.map(event => `<li>${esc(event.status.replaceAll('_', ' '))}: ${esc(event.reason)}</li>`).join('')}</ul>` : ''}</section></div><aside class="wm-card"><h2>Receipt</h2><div class="wm-row"><span>Subtotal</span><span>${money(order.totals.subtotal)}</span></div><div class="wm-row"><span>Shipping</span><span>${money(order.totals.shipping)}</span></div><div class="wm-row"><span>Tax</span><span>${money(order.totals.tax)}</span></div>${order.totals.walmart_plus ? `<div class="wm-row"><span>Walmart+ trial</span><span>${money(order.totals.walmart_plus)}</span></div>` : ''}<div class="wm-row wm-total"><span>Total</span><span>${money(order.totals.total)}</span></div><p>${order.payment.method === 'card' ? `${esc(order.payment.brand)} ending in ${esc(order.payment.last4)}` : 'PayPal'}</p><p>${esc(order.customer.email)}</p></aside></div>`
}

const ARTICLES = [
  { slug: 'track-your-order', category: 'Orders', title: 'Track your order', text: ['Open Purchase history and choose an order to view its items, shipping estimate and status. Each order belongs to the account and browser session that placed it.', 'New orders here remain Processing. No carrier has received a parcel, so a tracking number and shipment events are not available. An estimated arrival date is not a delivery confirmation.'], link: '/orders', label: 'View purchase history' },
  { slug: 'edit-or-cancel-an-order', category: 'Orders', title: 'Edit or cancel an order', text: ['You can cancel an order while its status is Processing. Open the order details, enter a reason and select Cancel order. The updated status appears in your purchase history.', 'Item, payment and address changes are not supported after ordering. Cancel a processing order and add the items to a new cart if you need to make changes. Cancellation is local; no real bank charge or refund occurs.'], link: '/orders', label: 'Manage an order' },
  { slug: 'returns', category: 'Returns', title: 'Returns and eligibility', text: ['Review the return policy on the item page before ordering. Policies can vary for groceries, electronic items, Marketplace sellers and code-in-box games.', 'A return request is available after an order is marked Delivered. Fresh orders in this environment remain Processing and can instead be cancelled. A request records your reason; it does not generate a label, refund or carrier pickup.'], link: '/orders', label: 'Check an order' },
  { slug: 'pickup-and-delivery', category: 'Shipping', title: 'Shipping, pickup and delivery', text: ['This assortment supports shipping to a US delivery address. The location picker stores a browsing ZIP code and a sample preferred store. Confirm your full delivery address separately at checkout.', fixtureCatalog ? 'Pickup and same-day delivery are unavailable for this assortment. Selecting a preferred store does not reserve inventory or a time slot. Product pages and your cart show item-specific shipping estimates.' : 'Pickup availability was not captured. Same-day delivery was unavailable in the captured Omaha 68116 session; other locations are unverified. Selecting a location does not reserve stock. The shipping preorder estimate is the captured reference, not a live location lookup.'], link: '/store-finder', label: 'Change your location' },
  { slug: 'create-or-edit-an-account', category: 'Account', title: 'Manage your account and addresses', text: ['Use your email and password to sign in, or create a local account from the sign-in page. Your account dashboard links to your address book, purchase history, lists and preferences.', 'Save up to twelve addresses. Choose a preferred address to prefill the checkout form, then review and save it before continuing. Another browser session has its own saved details, even when using the same test account. Password reset and real text verification are not connected.'], link: '/account', label: 'Go to account' },
  { slug: 'reorder-and-lists', category: 'My Items', title: 'Reorder, Favorites and lists', text: ['My Items shows your previous local purchases. Buy again adds the same item option and quantity using the current price and stock limits. An unavailable option is not silently replaced.', 'Use Add to list on an item to save it to Favorites or a named list. Lists can be renamed and deleted. Cart Save for later is separate. Event registries, public sharing and collaborative editing are not available.'], link: '/my-items', label: 'Open My Items' },
  { slug: 'payments-and-preorders', category: 'Payments', title: 'Payments and preorders', text: ['Checkout accepts validated test card details or a local PayPal selection. Only the card brand and last four digits are retained; full card numbers and security codes are never saved.', 'The GTA VI code-in-box listings are shipped preorders. Check the item delivery date and playable date carefully. The order total includes the displayed tax fixture. Preorder price-guarantee information applies only to eligible items; there is no live price-monitoring service.'], link: '/cart', label: 'Review your cart' },
  { slug: 'manage-walmart-plus', category: 'Walmart+', title: 'Manage Walmart+ membership', text: ['An optional local Walmart+ trial can be selected at checkout. You must choose a plan and accept its terms, or select No thanks. The trial line appears in the order receipt.', 'Account membership management reflects the trial recorded by your completed checkout. You can cancel its local renewal selection. No real subscription, future charge, store delivery or third-party benefit is activated.'], link: '/account/plus', label: 'Manage membership' },
  { slug: 'marketplace-and-services', category: 'Services', title: 'Marketplace sellers and services', text: ['Check Sold and shipped by on each product page for its seller. Seller pages list their merchandise and local return information. Use an owned order when creating a help request about a seller.', 'Pharmacy, auto care, photo and financial services are informational entry points. Prescriptions, appointments, photo uploads, money transfers and credit applications cannot be submitted here. Help requests stay in this browser session and are not sent to Walmart or a seller.'], link: '/services', label: 'Explore services' },
]
const TOPICS = [...new Set(ARTICLES.map(a => a.category))]
const STORES = [
  { id: 'omaha-central', name: 'Omaha Central sample store', city: 'Omaha', state: 'NE', zip: '68102', services: ['Pharmacy', 'Photo'] },
  { id: 'miami-beach', name: 'Miami Beach sample store', city: 'Miami Beach', state: 'FL', zip: '33139', services: ['Pharmacy', 'Auto Care'] },
  { id: 'west-la', name: 'West LA sample store', city: 'Los Angeles', state: 'CA', zip: '90210', services: ['Photo', 'Auto Care'] },
]
const serviceLinks = { Pharmacy: '/cp/pharmacy/5431', Photo: '/services/photo', 'Auto Care': '/services/auto-care' }
export function locationFor(req) { return req.store.location || { ...LOCATION, store: 'No preferred store', store_id: null, method: 'shipping' } }

export function registerJourneys(router, { render, notFound, gateUrl, addToCart }) {
  const show = (req, res, title, body, status = 200) => render(req, res, { title: `${title} - Walmart.com`, body: `<section class="wm-journey">${body}</section>`, status })
  const requireAccount = (req, res, path) => {
    if (req.store.user) return true
    res.redirect(gateUrl(res.locals.base, path || req.originalUrl.slice(res.locals.base.length), 'MyAccount'))
    return false
  }
  const fail = (req, res, message, status = 400) => show(req, res, 'Please review your request', `<h1>Please review your request</h1>${errors([message])}<a href="${res.locals.base}/account">Back to account</a>`, status)

  router.get('/account', (req, res) => {
    if (!requireAccount(req, res)) return
    const base = res.locals.base, state = retailState(req), orders = privateOrders(req)
    show(req, res, 'Account', `${accountNav(base)}<h1>Hi, ${esc(req.store.user.first_name || 'there')}</h1><p>${esc(req.store.user.email)} · <a href="${base}/account/logout">Sign out</a></p><div class="wm-journey-grid">${[['Purchase history', '/orders', `${orders.length} local orders. Track, reorder or manage an eligible order.`], ['Address book', '/account/addresses', `${state.addresses.length} saved addresses. Set your preferred delivery address.`], ['My Items & lists', '/lists', `${lists(req).length} lists. Keep Favorites and shopping plans together.`], ['Communication preferences', '/account/preferences', 'Manage your saved choices for this local account.'], ['Walmart+', '/account/plus', 'Review or cancel your local membership selection.'], ['Your help requests', '/help/cases', `${state.cases.length} saved requests. Review your local case status.`]].map(([title, path, description]) => `<a class="wm-card" href="${base}${path}"><h2>${title}</h2><p>${description}</p></a>`).join('')}</div><h2>Recent purchases</h2>${orders.slice(-2).reverse().map(order => orderCard(base, order)).join('') || '<p>No orders in this browser session yet.</p>'}`)
  })
  router.get('/account/preferences', (req, res) => {
    if (!requireAccount(req, res)) return
    const base = res.locals.base, p = retailState(req).preferences
    show(req, res, 'Communication preferences', `${accountNav(base)}<h1>Communication preferences</h1>${req.query.saved ? '<p role="status">Your preferences are saved.</p>' : ''}<form method="post" class="wm-card">${[['offers', 'Email offers and savings'], ['order_updates', 'Order update preferences']].map(([key, label]) => `<label class="wm-check" for="pref-${key}"><input type="checkbox" id="pref-${key}" name="${key}" value="yes" ${p[key] ? 'checked' : ''}>${label}</label>`).join('')}<p>These choices are stored with your local account in this browser. No emails or texts are sent.</p>${button('Save preferences')}</form>`)
  })
  router.post('/account/preferences', (req, res) => {
    if (!requireAccount(req, res)) return
    Object.assign(retailState(req).preferences, { offers: req.body.offers === 'yes', order_updates: req.body.order_updates === 'yes' })
    res.redirect(`${res.locals.base}/account/preferences?saved=1`)
  })
  function addressBook(req, res, { values = {}, messages = [], status = 200 } = {}) {
    const base = res.locals.base, state = retailState(req)
    show(req, res, 'Address book', `${accountNav(base)}<h1>Addresses</h1>${errors(messages)}<div class="wm-journey-grid">${state.addresses.map(a => `<article class="wm-card" data-address-id="${a.id}"><h2>${esc(a.label || a.name)}</h2><p>${a.is_default ? '<b>Preferred address</b><br>' : ''}${esc(a.name)}<br>${esc(a.line1)} ${esc(a.line2)}<br>${esc(a.city)}, ${esc(a.state)} ${esc(a.postal_code)}<br>${esc(a.phone)}</p><a href="${base}/account/addresses?edit=${a.id}">Edit address</a><form method="post" action="${base}/account/addresses/${a.id}/default">${button('Set as preferred')}</form><form method="post" action="${base}/account/addresses/${a.id}/delete">${button('Delete address')}</form></article>`).join('') || '<p>No saved addresses yet.</p>'}</div><form method="post" action="${base}/account/addresses" class="wm-card"><h2>${values.id ? 'Edit address' : 'Add an address'}</h2>${hidden('id', values.id || '')}${field('label', 'Address label (optional)', values.label)}${field('name', 'Recipient name', values.name)}${field('line1', 'Street address', values.line1)}${field('line2', 'Apartment or suite (optional)', values.line2)}<div class="wm-3col">${field('city', 'City', values.city)}<div class="wm-field"><label for="journey-state">State</label><select id="journey-state" name="state"><option value="">Select state</option>${STATES.map(s => `<option value="${s}" ${values.state === s ? 'selected' : ''}>${s}</option>`).join('')}</select></div>${field('postal_code', 'ZIP code', values.postal_code)}</div>${field('phone', 'Phone number', values.phone, 'tel')}<label class="wm-check" for="address-default"><input id="address-default" type="checkbox" name="is_default" value="yes" ${values.is_default ? 'checked' : ''}>Set as my preferred address</label>${button('Save address')} <a href="${base}/account/addresses">Cancel editing</a></form>`, status)
  }
  router.get('/account/addresses', (req, res) => {
    if (!requireAccount(req, res)) return
    const a = req.query.edit ? retailState(req).addresses.find(a => a.id === req.query.edit) : null
    if (req.query.edit && !a) return notFound(req, res)
    addressBook(req, res, { values: a || {} })
  })
  router.post('/account/addresses', (req, res) => {
    if (!requireAccount(req, res)) return
    const v = req.body, messages = []
    if (!STATES.includes(v.state)) messages.push('Select a valid state.')
    if (String(v.phone || '').replace(/\D/g, '').length !== 10) messages.push('Enter a 10 digit phone number.')
    if (/^\s*p\.?\s*o\.?\s*box/i.test(v.line1 || '')) messages.push('No PO boxes. Military addresses OK.')
    if (messages.length) return addressBook(req, res, { values: v, messages, status: 400 })
    const result = saveAddress(req, v, { country: 'US', requirePhone: true })
    if (result.errors) return addressBook(req, res, { values: { ...result.values, id: clean(v.id), is_default: v.is_default === 'yes' }, messages: result.errors, status: 400 })
    res.redirect(`${res.locals.base}/account/addresses`)
  })
  router.post('/account/addresses/:id/:action', (req, res) => {
    if (!requireAccount(req, res, '/account/addresses')) return
    const a = retailState(req).addresses.find(a => a.id === req.params.id)
    if (!a) return notFound(req, res)
    if (req.params.action === 'delete') deleteAddress(req, a.id)
    else if (req.params.action === 'default') saveAddress(req, { ...a, is_default: 'yes' })
    else return notFound(req, res)
    res.redirect(`${res.locals.base}/account/addresses`)
  })
  router.get('/account/plus', (req, res) => {
    if (!requireAccount(req, res)) return
    const base = res.locals.base, membership = retailState(req).membership, plan = membership && WALMART_PLUS.plans[membership.plan]
    show(req, res, 'Walmart+ membership', `${accountNav(base)}<h1>Walmart+ membership</h1><section class="wm-card">${membership ? `<h2>${membership.cancelled ? 'Renewal cancelled' : 'Local trial recorded'}</h2><p>${esc(plan.name)} plan · ${esc(plan.text)} after the trial in the displayed offer.</p><p>Selected with order ${esc(membership.order_number)}.</p>${membership.cancelled ? '<p>Your local renewal selection is cancelled.</p>' : `<form method="post">${button('Cancel renewal')}</form>`}` : '<h2>No membership selected</h2><p>You can review the optional trial and terms at checkout.</p>'}<p>This is local membership state. No real subscription, future charge or third-party benefit is activated.</p><a href="${base}/plus">Learn about the offer</a></section>`)
  })
  router.post('/account/plus', (req, res) => {
    if (!requireAccount(req, res)) return
    const membership = retailState(req).membership
    if (!membership) return fail(req, res, 'There is no local membership to cancel.')
    membership.cancelled = true
    res.redirect(`${res.locals.base}/account/plus`)
  })

  router.get(['/my-items', '/my-items/recent', '/lists', '/registries'], (req, res) => {
    const base = res.locals.base
    if (!req.store.user) return show(req, res, 'My Items', `${tabs(base)}<h1>Make shopping easier with My Items</h1><p>Sign in to see your purchases, lists and recently viewed items.</p><a class="wm-pill" href="${gateUrl(base, req.path, 'MyItems')}">Sign in or create an account</a>`)
    if (req.path === '/registries') return show(req, res, 'Registries', `${tabs(base)}<h1>Plan your next occasion</h1><p>Public event registries and gift tracking are not connected here. A private named list can help you collect ideas for a celebration or a new home.</p><a class="wm-pill" href="${base}/lists">Create a private list</a>`)
    if (req.path === '/lists') return listIndex(req, res)
    if (req.path.endsWith('/recent')) {
      const state = retailState(req), recent = state.recent.map(byId).filter(Boolean)
      return show(req, res, 'Recently viewed', `${tabs(base)}<h1>Recently viewed</h1>${recent.length ? `<div class="wm-journey-grid">${recent.map(p => miniItem(base, selectedProduct(p, state.recentVariants?.[p.id] || p.variants?.[0].id))).join('')}</div><form method="post" action="${base}/my-items/recent/clear">${button('Clear recently viewed')}</form>` : '<p>Items you open while signed in appear here.</p>'}`)
    }
    const orders = privateOrders(req).slice().reverse()
    show(req, res, 'My Items', `${tabs(base)}<h1>Buy it again</h1><p>Your previous purchases in this browser. Current prices and availability apply when you add an item again.</p>${orders.map(o => orderCard(base, o)).join('') || `<p>No purchases yet. <a href="${base}/departments">Start shopping</a> or <a href="${base}/lists">view your lists</a>.</p>`}`)
  })
  router.post('/my-items/recent/clear', (req, res) => {
    if (!requireAccount(req, res, '/my-items/recent')) return
    retailState(req).recent = []
    retailState(req).recentVariants = {}
    res.redirect(`${res.locals.base}/my-items/recent`)
  })
  function listIndex(req, res, message = '', value = '') {
    const base = res.locals.base
    show(req, res, 'Your lists', `${tabs(base)}<h1>Your lists</h1>${errors(message ? [message] : [])}<div class="wm-journey-grid">${lists(req).map(l => `<a class="wm-card" href="${base}/lists/${l.id}"><h2>${esc(l.name)}</h2><p>${l.items.length} saved items</p></a>`).join('')}</div><form method="post" action="${base}/lists" class="wm-card"><h2>Create a list</h2>${field('name', 'List name', value)}${button('Create list')}</form>`, message ? 400 : 200)
  }
  router.post('/lists', (req, res) => {
    if (!requireAccount(req, res, '/lists')) return
    const name = clean(req.body.name, 80), all = lists(req)
    if (!name || all.some(l => l.name.toLowerCase() === name.toLowerCase()) || all.length >= 20) return listIndex(req, res, 'Enter a unique list name. You can keep up to 20 lists.', name)
    const list = { id: randomUUID(), name, items: [] }
    all.push(list)
    res.redirect(`${res.locals.base}/lists/${list.id}`)
  })
  function listPicker(req, res, messages = [], status = 200) {
    const base = res.locals.base, values = req.method === 'POST' ? req.body : req.query, p = byId(values.pid)
    if (!p) return notFound(req, res)
    show(req, res, 'Add to list', `${tabs(base)}<h1>Add to list</h1>${errors(messages)}<h2>${esc(p.title)}</h2><form method="post" action="${base}/lists/add" class="wm-card">${hidden('pid', p.id)}${p.variants ? `<div class="wm-field"><label for="list-variant">Item option</label><select id="list-variant" name="variant"><option value="">Choose an option</option>${p.variants.map(v => `<option value="${v.id}" ${values.variant === v.id ? 'selected' : ''}>${esc(Object.values(v.options).join(' · '))}${v.stock ? '' : ' — Out of stock'}</option>`).join('')}</select></div>` : ''}<div class="wm-field"><label for="list-choice">Choose a list</label><select id="list-choice" name="list_id">${lists(req).map(l => `<option value="${l.id}" ${values.list_id === l.id ? 'selected' : ''}>${esc(l.name)}</option>`).join('')}</select></div>${field('qty', 'Quantity', values.qty || 1, 'number')}${button('Save to list')}</form><p><a href="${base}/lists">Create another list</a> · <a href="${productPath(base, p)}${p.variants?.some(v => v.id === values.variant) ? `?variant=${encodeURIComponent(values.variant)}` : ''}">Back to item</a></p>`, status)
  }
  router.get('/lists/add', (req, res) => {
    if (!requireAccount(req, res)) return
    listPicker(req, res)
  })
  router.post('/lists/add', (req, res) => {
    if (!requireAccount(req, res, `/lists/add?pid=${encodeURIComponent(clean(req.body.pid))}&variant=${encodeURIComponent(clean(req.body.variant))}`)) return
    const p = selectedProduct(byId(req.body.pid), req.body.variant), list = lists(req).find(l => l.id === req.body.list_id), qty = Number(req.body.qty ?? 1)
    if (!p || !list || !Number.isInteger(qty) || qty < 1 || qty > 10) return listPicker(req, res, ['Choose a listed option, your list and a quantity from 1 to 10.'], 400)
    const key = lineKey(p.id, p.variantId), existing = list.items.find(l => l.key === key)
    if (!existing && list.items.length >= 100) return listPicker(req, res, ['This list already has 100 items. Remove an item first.'], 400)
    if (existing) existing.qty = qty
    else list.items.push({ pid: p.id, variantId: p.variantId || null, key, qty })
    res.redirect(`${res.locals.base}/lists/${list.id}?saved=${encodeURIComponent(p.id)}${p.variantId ? `&variant=${encodeURIComponent(p.variantId)}` : ''}`)
  })
  function listDetail(req, res, list, message = '', status = 200) {
    const base = res.locals.base
    const savedLine = list.items.find(line => line.pid === req.query.saved && (!req.query.variant || line.variantId === req.query.variant))
    const savedProduct = savedLine && selectedProduct(byId(savedLine.pid), savedLine.variantId)
    show(req, res, list.name, `${tabs(base)}<h1>${esc(list.name)}</h1>${errors(message ? [message] : [])}${req.query.saved ? '<p role="status">Item saved to your list.</p>' : ''}${list.items.map(line => {
      const p = selectedProduct(byId(line.pid), line.variantId)
      if (!p) return ''
      return miniItem(base, p, line.qty, `<form method="post" action="${base}/lists/${list.id}/items">${hidden('line', line.key)}${button('Add to cart', 'cart')} ${button('Remove from list', 'remove')}</form>`)
    }).join('') || '<p>This list is empty. Use Add to list on an item page to save something.</p>'}${savedProduct ? `<p><a href="${selectedUrl(base, savedProduct)}">Back to item</a></p>` : ''}${list.id !== 'favorites' ? `<form class="wm-card" method="post" action="${base}/lists/${list.id}">${field('name', 'List name', list.name)}${button('Rename list', 'rename')} ${button('Delete list', 'delete')}</form>` : ''}<p><a href="${base}/departments">Keep shopping</a></p>`, status)
  }
  router.get('/lists/:id', (req, res) => {
    if (!requireAccount(req, res)) return
    const list = lists(req).find(l => l.id === req.params.id)
    if (!list) return notFound(req, res)
    listDetail(req, res, list)
  })
  router.post('/lists/:id', (req, res) => {
    if (!requireAccount(req, res, '/lists')) return
    const list = lists(req).find(l => l.id === req.params.id)
    if (!list) return notFound(req, res)
    if (list.id === 'favorites') return listDetail(req, res, list, 'Favorites is your permanent default list.', 400)
    if (req.body.action === 'delete') retailState(req).lists = lists(req).filter(l => l !== list)
    else if (req.body.action === 'rename') {
      const name = clean(req.body.name, 80)
      if (!name || lists(req).some(l => l !== list && l.name.toLowerCase() === name.toLowerCase())) return listDetail(req, res, list, 'Enter a unique list name.', 400)
      list.name = name
    } else return listDetail(req, res, list, 'Choose a valid list action.', 400)
    res.redirect(`${res.locals.base}/lists`)
  })
  router.post('/lists/:id/items', (req, res) => {
    if (!requireAccount(req, res, '/lists')) return
    const list = lists(req).find(l => l.id === req.params.id), line = list?.items.find(l => l.key === req.body.line)
    if (!line) return notFound(req, res)
    if (req.body.action === 'remove') { list.items = list.items.filter(l => l !== line); return res.redirect(`${res.locals.base}/lists/${list.id}`) }
    if (req.body.action !== 'cart') return listDetail(req, res, list, 'Choose a valid item action.', 400)
    const result = addToCart(req.store, selectedProduct(byId(line.pid), line.variantId), line.qty)
    if (result.error) return listDetail(req, res, list, result.error, 409)
    res.redirect(`${res.locals.base}/cart`)
  })

  router.get('/orders', (req, res) => {
    if (!requireAccount(req, res)) return
    const base = res.locals.base, orders = privateOrders(req).slice().reverse()
    show(req, res, 'Purchase history', `${accountNav(base)}<h1>Purchase history</h1>${orders.map(o => orderCard(base, o)).join('') || '<p>You have no orders in this browser session yet.</p>'}`)
  })
  router.get('/orders/:id', (req, res) => {
    if (!requireAccount(req, res)) return
    const order = privateOrder(req, req.params.id)
    if (!order) return notFound(req, res)
    show(req, res, 'Order details', orderBody(res.locals.base, order))
  })
  router.get('/orders/:id/tracking', (req, res) => {
    if (!requireAccount(req, res)) return
    const order = privateOrder(req, req.params.id)
    if (!order) return notFound(req, res)
    const base = res.locals.base, status = orderStatus(order)
    show(req, res, 'Track order', `${accountNav(base)}<h1>Track order ${esc(order.order_number)}</h1><section class="wm-card"><h2>${statusLabel(order)}</h2>${status === 'processing' ? `<p>Your order is recorded and has not shipped. No carrier tracking number is available.</p><p>Estimated arrival: ${esc(order.fulfillment.eta)}.</p>` : status === 'cancelled' ? '<p>This order is cancelled. No shipment is scheduled.</p>' : '<p>See your order details for the recorded status. There is no connected carrier tracking feed.</p>'}<a href="${orderLink(base, order)}">View order details</a></section>`)
  })
  router.post('/orders/:id/action', (req, res) => {
    if (!requireAccount(req, res, '/orders')) return
    const order = privateOrder(req, req.params.id)
    if (!order) return notFound(req, res)
    const result = requestOrderAction(req, order.id, req.body.action, req.body.reason)
    if (result.error) return show(req, res, 'Order details', orderBody(res.locals.base, order, { messages: [result.error], reason: clean(req.body.reason, 1000) }), result.status)
    res.redirect(orderLink(res.locals.base, order))
  })
  router.post('/orders/:id/reorder', (req, res) => {
    if (!requireAccount(req, res, '/orders')) return
    const order = privateOrder(req, req.params.id)
    if (!order) return notFound(req, res)
    const index = Number(req.body.item), item = order.items[index]
    if (!/^\d+$/.test(String(req.body.item)) || !item) return fail(req, res, 'Choose an item from this order.')
    const product = selectedProduct(byId(item.sku), order.meta.options?.[index]?.variant_id)
    const result = addToCart(req.store, product, item.qty)
    if (result.error) return show(req, res, 'Order details', orderBody(res.locals.base, order, { messages: [result.error] }), 409)
    res.redirect(`${res.locals.base}/cart`)
  })

  router.get('/help', (req, res) => {
    const base = res.locals.base, q = clean(req.query.q), topic = clean(req.query.topic), matches = ARTICLES.filter(a => (!topic || a.category === topic) && (!q || `${a.title} ${a.text.join(' ')}`.toLowerCase().includes(q.toLowerCase())))
    const browse = !q && !topic
    const art = slug => `${base}/help/article/${slug}`
    const groups = [
      ['Your Order', [['Track your order', art('track-your-order')], ['Edit or cancel an order', art('edit-or-cancel-an-order')], ['Pickup and Delivery', art('pickup-and-delivery/d0d02a5f54e54592930f110aaf6a2f50')], ['Shipping, pickup and delivery', art('pickup-and-delivery')]]],
      ['Account & Payments', [['Manage your account and addresses', art('create-or-edit-an-account')], ['Payments and preorders', art('payments-and-preorders')], ['Check your gift card balance', `${base}/account/giftcards/balance`]]],
      ['Returns & Refunds', [['Walmart Standard Return Policy', art('walmart-standard-return-policy/adc0dfb692954e67a4de206fb8d9e03a')], ['Returns and eligibility', art('returns')]]],
      ['Walmart Services', [['Marketplace sellers and services', art('marketplace-and-services')], ['Services', `${base}/services`]]],
      ['Walmart+', [['Manage Walmart+ membership', art('manage-walmart-plus')], ['Walmart+ benefits', `${base}/plus`]]],
      ['Shopping with Walmart', [['Reorder, Favorites and lists', art('reorder-and-lists')], ['Store Directory', `${base}/store/directory`]]],
      ['Registry', [['Gift Registry', `${base}/registry`]]],
      ['Terms of Use', [['Walmart.com Terms of Use', art('walmart-com-terms-of-use/3b75080af40340d6bbd596f116fae5a0')]]],
      ['Policies', [['Responsible Disclosure and Accessibility Policies', art('responsible-disclosure-and-accessibility-policies/0f173dab8bd942da84b1cd7ab5ffc3cb')], ['Privacy Notice', `${base}/privacy-notice`], ['Product Recalls', `${base}/product-recalls`]]],
      ['Marketplace', [['Sell on Walmart.com', `${base}/sell-on-walmart`]]],
    ]
    const intro = `<p class="wm-help-kicker">Hello,</p><h1>Help &amp; customer support</h1><section class="wm-help-quick"><h2>Choose a help topic or chat with us</h2><nav>${[['Edit my order', art('edit-or-cancel-an-order')], ['Track my order', `${base}/orders`], ['Pickup &amp; delivery', art('pickup-and-delivery/d0d02a5f54e54592930f110aaf6a2f50')], ['Member benefits', art('manage-walmart-plus')]].map(([l, h]) => `<a class="wm-help-tile" href="${h}">${l}</a>`).join('')}</nav></section><h2>How may we help you?</h2>`
    const topics = browse ? `<div class="wm-help-topics">${groups.map(([g, links]) => `<section><h2>${esc(g)}</h2>${links.map(([l, h]) => `<a href="${h}">${esc(l)}</a>`).join('')}</section>`).join('')}</div>` : ''
    show(req, res, 'Help & customer support', `${intro}<form action="${base}/help" class="wm-card">${field('q', 'Search help', q, 'search')}<label for="help-topic">Topic</label><select name="topic" id="help-topic"><option value="">All topics</option>${TOPICS.map(t => `<option ${t === topic ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select>${button('Search help')}</form><nav class="wm-journey-tabs">${TOPICS.map(t => `<a href="${base}/help?topic=${encodeURIComponent(t)}">${esc(t)}</a>`).join('')}</nav>${browse ? '' : `<div class="wm-journey-grid">${matches.map(a => `<a class="wm-card" href="${base}/help/article/${a.slug}"><small>${esc(a.category)}</small><h2>${esc(a.title)}</h2><p>${esc(a.text[0])}</p></a>`).join('') || `<p>No help articles match. <a href="${base}/help">View all topics</a>.</p>`}</div>`}${topics}<section class="wm-card"><h2>Didn&#39;t find what you were looking for?</h2><p>Create a local help request and keep a record of it with your account. No message is sent to a retailer or seller.</p><a class="wm-pill" href="${base}/help/contact">Contact help</a> <a href="${base}/help/cases">Your help requests</a></section><p id="fulfillment"><a href="${base}/help/article/pickup-and-delivery">Shipping and fulfillment</a></p><p id="payments"><a href="${base}/help/article/payments-and-preorders">Payments and preorders</a></p><p id="walmart-plus"><a href="${base}/help/article/manage-walmart-plus">Walmart+ membership help</a></p>`)
  })
  router.get('/help/article/:slug', (req, res) => {
    const article = ARTICLES.find(a => a.slug === req.params.slug), base = res.locals.base
    if (!article) return notFound(req, res)
    show(req, res, article.title, `<p><a href="${base}/help">Help center</a> / ${esc(article.category)}</p><h1>${esc(article.title)}</h1><article class="wm-card">${article.text.map(p => `<p>${esc(p)}</p>`).join('')}<a class="wm-pill wm-pill-white" href="${base}${article.link}">${article.label}</a></article><a href="${base}/help/contact">Get help with this topic</a>`)
  })
  function contactForm(req, res, values = {}, messages = [], status = 200) {
    const base = res.locals.base
    show(req, res, 'Contact help', `${accountNav(base)}<h1>Create a help request</h1><p>Your request is saved locally. No message is sent to Walmart, a seller or a support agent.</p>${errors(messages)}<form method="post" action="${base}/help/contact" class="wm-card"><div class="wm-field"><label for="case-topic">Topic</label><select id="case-topic" name="category"><option value="">Choose a topic</option>${TOPICS.map(t => `<option ${values.category === t ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select></div>${field('subject', 'Subject', values.subject)}${field('email', 'Contact email', values.email || req.store.user.email, 'email')}<div class="wm-field"><label for="case-order">Related order (optional)</label><select id="case-order" name="order_id"><option value="">No related order</option>${privateOrders(req).map(o => `<option value="${o.id}" ${values.order_id === o.id ? 'selected' : ''}>${esc(o.order_number)}</option>`).join('')}</select></div><div class="wm-field"><label for="case-message">How can we help?</label><textarea name="message" id="case-message" rows="6">${esc(values.message || '')}</textarea></div>${button('Save help request')}</form>`, status)
  }
  router.get('/help/contact', (req, res) => {
    if (!requireAccount(req, res)) return
    if (req.query.order_id && !privateOrder(req, req.query.order_id)) return notFound(req, res)
    contactForm(req, res, { order_id: req.query.order_id, category: req.query.order_id ? 'Orders' : '' })
  })
  router.post('/help/contact', (req, res) => {
    if (!requireAccount(req, res, '/help/contact')) return
    if (req.body.order_id && !privateOrder(req, req.body.order_id)) return contactForm(req, res, req.body, ['Choose an order from your own purchase history.'], 400)
    if (!TOPICS.includes(req.body.category)) return contactForm(req, res, req.body, ['Choose a listed help topic.'], 400)
    const result = createSupportCase(req, req.body)
    if (result.errors) return contactForm(req, res, result.values, result.errors, 400)
    res.redirect(`${res.locals.base}/help/cases/${result.supportCase.id}`)
  })
  router.get('/help/cases', (req, res) => {
    if (!requireAccount(req, res)) return
    const base = res.locals.base
    show(req, res, 'Your help requests', `${accountNav(base)}<h1>Your help requests</h1>${retailState(req).cases.map(c => `<a class="wm-card" href="${base}/help/cases/${c.id}"><h2>${esc(c.subject)}</h2><p>${c.id} · Received locally</p></a>`).join('') || '<p>No saved help requests.</p>'}<p><a href="${base}/help/contact">Create a help request</a></p>`)
  })
  router.get('/help/cases/:id', (req, res) => {
    if (!requireAccount(req, res)) return
    const c = retailState(req).cases.find(c => c.id === req.params.id), base = res.locals.base
    if (!c) return notFound(req, res)
    show(req, res, 'Help request saved', `${accountNav(base)}<h1>Help request saved</h1><section class="wm-card"><p data-case-id="${c.id}">Case ${c.id} · Received locally</p><h2>${esc(c.subject)}</h2><p>${esc(c.category)} · ${esc(c.email)}</p><p class="wm-case-message">${esc(c.message)}</p>${c.order_id ? `<a href="${base}/orders/${c.order_id}">Related order</a>` : ''}<p>No message has been sent and no agent response is pending. This record stays in your local account in this browser.</p></section><a href="${base}/help/cases">All help requests</a>`)
  })

  function finder(req, res, values = {}, messages = [], status = 200) {
    const base = res.locals.base, location = locationFor(req), zip = clean(values.zip || req.query.zip || location.zip), valid = /^\d{5}$/.test(zip), nearby = valid ? STORES.filter(s => s.zip.slice(0, 3) === zip.slice(0, 3)) : []
    show(req, res, 'Walmart Stores Near Me - Locations, Hours & Services', `<p><a href="${base}/store/directory">Store Directory</a></p><h1>Walmart Stores Near Me</h1><h2>Choose your location</h2>${errors(messages)}<p>Current browsing location: ${esc(location.city)}, ${esc(location.zip)} · ${esc(location.store)}</p><p>${fixtureCatalog?'Sample stores help you explore local services. This assortment ships; pickup, same-day delivery and reservations are unavailable.':'Sample stores help you explore local services. Pickup availability is unverified; same-day delivery was unavailable in the Omaha 68116 capture. These sample locations do not establish regional stock.'}</p><form class="wm-card" action="${base}/store-finder">${field('zip', 'ZIP code', zip)}${button('Find sample stores')}</form><div class="wm-journey-grid">${nearby.map(s => `<article class="wm-card"><h2>${esc(s.name)}</h2><p>${esc(s.city)}, ${s.state} ${s.zip}</p><p>Service guides: ${s.services.map(name => `<a href="${base}${serviceLinks[name]}">${name}</a>`).join(', ')}</p><a href="${base}/store/${s.id}">Store details</a><form action="${base}/location" method="post">${hidden('zip', zip)}${hidden('store_id', s.id)}${hidden('method', 'shipping')}${button('Choose this store')}</form></article>`).join('') || '<p>No sample stores match this ZIP. You can still save it as your browsing ZIP for shipping.</p>'}</div><form action="${base}/location" method="post" class="wm-card">${hidden('zip', zip)}${hidden('method', 'shipping')}${button('Use this ZIP for shipping')}</form><p>Try sample ZIP codes 68102, 33139 or 90210. Store names are fictional fixtures and do not establish real stock or opening hours.</p><a href="${base}/services">Explore all services</a>`, status)
  }
  router.get(['/store-directory', '/store-finder'], (req, res) => {
    if (req.query.zip && !/^\d{5}$/.test(String(req.query.zip))) return finder(req, res, req.query, ['Enter a 5 digit ZIP code.'], 400)
    finder(req, res)
  })
  router.post('/location', (req, res) => {
    const zip = clean(req.body.zip), store = STORES.find(s => s.id === req.body.store_id), messages = []
    if (!/^\d{5}$/.test(zip)) messages.push('Enter a 5 digit ZIP code.')
    if (req.body.method !== 'shipping') messages.push('Shipping is the only supported method. Pickup and same-day delivery cannot be selected.')
    if (req.body.store_id && (!store || store.zip.slice(0, 3) !== zip.slice(0, 3))) messages.push('Choose a sample store in the searched ZIP area.')
    if (messages.length) return finder(req, res, req.body, messages, 400)
    const city = store?.city || STORES.find(s => s.zip.slice(0, 3) === zip.slice(0, 3))?.city || 'Shipping ZIP'
    req.store.location = { zip, city, store: store?.name || 'No preferred store', store_id: store?.id || null, method: 'shipping' }
    res.redirect(`${res.locals.base}/store-finder`)
  })
  router.get('/store/:id', (req, res) => {
    const store = STORES.find(s => s.id === req.params.id), base = res.locals.base
    if (!store) return notFound(req, res)
    show(req, res, store.name, `<p><a href="${base}/store-finder">Store finder</a></p><h1>${store.name}</h1><p>${store.city}, ${store.state} ${store.zip}</p><section class="wm-card"><h2>Store service guides</h2>${store.services.map(name => `<p><a href="${base}${serviceLinks[name]}">${name}</a></p>`).join('')}<p>This fictional sample store provides navigation to service information. Real addresses, hours, appointments, store stock and pickup windows are not connected.</p></section><form method="post" action="${base}/location">${hidden('zip', store.zip)}${hidden('store_id', store.id)}${hidden('method', 'shipping')}${button('Make this my preferred store')}</form>`)
  })
}
