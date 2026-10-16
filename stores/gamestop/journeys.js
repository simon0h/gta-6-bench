import { randomBytes } from 'node:crypto'
import { esc, money, publicNotice } from '../../lib/html.js'
import { retailState, rememberProduct, toggleFavorite, saveAddress, deleteAddress, defaultAddress, ownedOrders, ownedOrder, orderStatus, requestOrderAction, createSupportCase } from '../../lib/retail-state.js'
import { byId, selectedProduct, productPath, cartError, STATES } from './data.js'
import { artwork } from './catalog-pages.js'
import { glyph } from './site.js'
import { gradingPage } from './marketing.js'

const clean = (value, max = 240) => typeof value === 'string' ? value.trim().slice(0, max) : ''
const optionKey = p => p.id + (p.variant ? ':' + p.variant : '')
const fromKey = key => { const [id, variant] = key.split(':'); return selectedProduct(byId(id), variant) }
const options = p => [p.condition, ...Object.entries(p.selectedOptions || {}).filter(([key]) => key !== 'Condition').map(([key, value]) => `${key}: ${value}`)].filter(Boolean).join(' · ')
const url = (base, p) => productPath(base, p) + (p.variant ? '?variant=' + encodeURIComponent(p.variant) : '')
const notice = errors => errors?.length ? `<div class="gs-error-summary" role="alert">${errors.map(e => `<p>${esc(e)}</p>`).join('')}</div>` : ''
const field = (name, label, value = '', type = 'text', extra = '') => `<label for="journey-${name}">${label}<input id="journey-${name}" name="${name}" type="${type}" value="${esc(value)}" ${extra}></label>`
const statusLabel = order => ({ processing: 'Processing', cancelled: 'Cancelled', delivered: 'Delivered', return_requested: 'Return requested' }[orderStatus(order)] || 'Processing')
const ownerMatches = (req, order) => {
  const owner = order?.meta?.account_id ?? order?.customer?.account_id
  return !!order && (owner ? owner === req.store.user?.id : !req.store.user)
}
export const privateOrder = (req, id) => { const order = ownedOrder(req, id, 'gamestop'); return ownerMatches(req, order) ? order : null }
export const privateOrders = req => ownedOrders(req, 'gamestop').filter(order => ownerMatches(req, order))
export function rememberSelection(req, p) { rememberProduct(req, optionKey(p)) }
export function savedCartItem(req, item) {
  const state = retailState(req)
  if (state.savedForLater.length >= 100) return false
  state.savedForLater.push({ id: 'saved-' + randomBytes(6).toString('hex'), pid: item.pid, variant: item.variant || null, qty: item.qty })
  return true
}
export function resumeSignIn(req, base) {
  const state = retailState(req)
  if (state.profile) Object.assign(req.store.user, state.profile)
  const pending = req.store.gsPendingFavorite
  delete req.store.gsPendingFavorite
  if (pending) {
    const p = selectedProduct(byId(pending.pid), pending.variant)
    if (p && !state.favorites.includes(optionKey(p))) toggleFavorite(req, optionKey(p))
  }
  const target = req.store.gsAuthReturn
  delete req.store.gsAuthReturn
  return target ? base + target : null
}
export function addressValues(req, addressId) {
  const state = retailState(req)
  const address = addressId ? state.addresses.find(a => a.id === addressId) : defaultAddress(req)
  if (!address) return null
  const [firstName, ...last] = address.name.split(/\s+/)
  return { firstName, lastName: last.join(' '), address1: address.line1, address2: address.line2, city: address.city, stateCode: address.state, postalCode: address.postal_code, phone: address.phone, address_id: address.id }
}
export function addressPicker(req, base, selected) {
  if (!req.store.user) return ''
  const addresses = retailState(req).addresses
  return `<section class="gs-saved-address"><h2>Saved shipping addresses</h2>${addresses.length ? `<form action="${base}/checkout" method="get" class="gs-inline-form"><label for="address-picker">Choose an address</label><select id="address-picker" name="address_id">${addresses.map(a => `<option value="${a.id}" ${a.id === selected ? 'selected' : ''}>${esc(a.label || a.name)} — ${esc(a.line1)}${a.is_default ? ' (default)' : ''}</option>`).join('')}</select><button class="gs-btn gs-btn-outline">Use address</button></form>` : '<p>No saved addresses yet.</p>'}<a href="${base}/account/addresses">Manage addresses</a></section>`
}
function accountNav(base, title) {
  return `<div class="gs-journey"><nav class="gs-account-nav" aria-label="My account"><a href="${base}/account">Overview</a><a href="${base}/account/orders">Orders</a><a href="${base}/account/profile">Profile</a><a href="${base}/account/addresses">Address book</a><a href="${base}/account/preferences">Preferences</a><a href="${base}/account/saved">Saved &amp; recently viewed</a><a href="${base}/help/contact">Support</a></nav><h1>${esc(title)}</h1>`
}
function savedRows(req, base, section) {
  const state = retailState(req)
  const entries = section === 'savedForLater' ? state.savedForLater : state[section].map(key => ({ key }))
  if (!entries.length) return `<p>${section === 'recent' ? 'Products you view will appear here.' : 'No items here yet.'}</p>`
  return `<div class="gs-saved-grid">${entries.map(item => {
    const p = item.key ? fromKey(item.key) : selectedProduct(byId(item.pid), item.variant)
    if (!p) return ''
    return `<article class="gs-saved-card">${artwork(p)}<div><a href="${url(base, p)}"><b>${esc(p.title)}</b></a><p>${esc(options(p))}</p><p>${money(p.price)}${item.qty ? ` · Quantity: ${item.qty}` : ''} · ${p.catalogEvidence?.availability === 'preorder' ? 'Pre-order' : p.stock ? 'In stock' : 'Currently unavailable'}</p>${section === 'savedForLater' ? `<form method="post" action="${base}/saved/restore"><input type="hidden" name="id" value="${item.id}"><button class="gs-btn gs-btn-outline">Move to cart</button></form><form method="post" action="${base}/saved/remove"><input type="hidden" name="id" value="${item.id}"><button class="gs-link-btn">Remove saved item</button></form>` : section === 'favorites' ? `<form method="post" action="${base}/favorites/toggle"><input type="hidden" name="pid" value="${p.id}"><input type="hidden" name="variant" value="${esc(p.variant || '')}"><button class="gs-link-btn">Remove favorite</button></form>` : ''}</div></article>`
  }).join('')}</div>`
}
export function savedCartSection(req, base) {
  return `<section class="gs-journey gs-cart-saved"><h2>Saved for Later</h2>${savedRows(req, base, 'savedForLater')}<p><a href="${base}/account/saved">View favorites and recently viewed</a></p></section>`
}
export function productSaveActions(req, base, p) {
  const saved = retailState(req).favorites.includes(optionKey(p))
  return `<section class="gs-product-save"><form method="post" action="${base}/favorites/toggle"><input type="hidden" name="pid" value="${p.id}"><input type="hidden" name="variant" value="${esc(p.variant || '')}"><button class="gs-btn gs-btn-outline">${saved ? 'Remove favorite' : 'Save to favorites'}</button></form><a href="${base}/account/saved">Saved &amp; recently viewed</a></section>`
}
const ARTICLES = [
  { id: 'orders', title: 'Track or cancel an order', topic: 'Orders', text: 'Look up any order in Order Status with your order number, email and billing ZIP Code. Signed-in shoppers can see every order in Order History. Orders that are still processing can be cancelled before they ship; guest shoppers can contact support with their order number. Tracking details appear once your order ships.' },
  { id: 'returns', title: 'Return eligibility and condition', topic: 'Returns', text: 'Most new, unopened items can be returned within 15 days of delivery, and pre-owned items within 7 days. Start a return from Order Status once your order has been delivered, and keep the original packaging and accessories. Pre-orders and sealed trading-card products cannot be returned online. Our team reviews each request and follows up with next steps by email.' },
  { id: 'preorders', title: 'Preorders and release dates', topic: 'Preorders', text: 'Pre-orders are charged about a week before release and ship to arrive on or shortly after release day. Code-in-box is a physical package containing a code, and ships to your address. New preorders remain Processing until fulfillment information is available.' },
  { id: 'payments', title: 'Payments and saved addresses', topic: 'Payments', text: 'We accept Visa, Mastercard, American Express, Discover, the GameStop Pro Credit Card, PayPal and Zip. Only the last four digits of your card appear on your order. Gift cards cannot be redeemed online at this time. Signed-in shoppers can fill checkout from a saved address.' },
  { id: 'pro', title: 'GameStop Pro information', topic: 'GameStop Pro', text: 'GameStop Pro is $29.99 per year and includes a $5 monthly Pro reward, 5% extra off pre-owned and collectibles, and extra trade credit. Join in any GameStop store; memberships renew automatically each year. See the GameStop Pro page for benefits and exclusions.' },
  { id: 'trades', title: 'Prepare for a trade-in', topic: 'Trade-In', text: 'Bring your games, consoles and devices to any GameStop store with their accessories and a valid ID. A store associate inspects each item and offers cash or trade credit based on its condition. Pro members get extra trade credit.' },
  { id: 'digital', title: 'Digital games and codes', topic: 'Digital content', text: 'Code-in-box editions are physical packages that contain a download code and ship to your address; they are not instant downloads. If there is a problem with a code from your order, contact support with your order number.' },
  { id: 'shipping', title: 'Shipping Options at GameStop', topic: 'Shipping', text: 'Orders ship to addresses in the continental U.S. Pre-orders of $59 or more ship free, and GameStop Pro members get free shipping on qualifying orders of $54 or more; exclusions apply. Choose Premium (free on eligible pre-orders, arrives on or shortly after release day) or Rush ($9.99, arrives on release day) at checkout. We do not currently ship to Alaska, Hawaii, APO/FPO or international addresses. Tracking appears in Order Status once an order ships.' },
  { id: 'stores', title: 'Find a GameStop store', topic: 'Stores', text: 'Search by city or ZIP Code to find a GameStop near you and set it as My Store. Hours can vary on holidays, so check before you visit. Choosing a store does not hold items for you. PSA grading submissions are handled in store.' },
]
const STORES = [
  { id: 'miami', name: 'Miami - Biscayne Blvd', city: 'Miami', state: 'FL', zip: '33132', address: '1200 Biscayne Boulevard', services: ['Trade-In', 'Cards & collectibles', 'PSA card grading'], hours: 'Mon–Sat 10 AM–8 PM · Sun 11 AM–6 PM' },
  { id: 'austin', name: 'Austin - South Congress', city: 'Austin', state: 'TX', zip: '78704', address: '2400 South Congress Avenue', services: ['Trade-In', 'Pre-Owned', 'Retro games'], hours: 'Mon–Sat 10 AM–8 PM · Sun 12 PM–6 PM' },
  { id: 'seattle', name: 'Seattle - Northgate', city: 'Seattle', state: 'WA', zip: '98125', address: '1100 Northgate Way', services: ['Trade-In', 'Cards & collectibles', 'PSA card grading'], hours: 'Mon–Sat 10 AM–9 PM · Sun 11 AM–7 PM' },
  { id: 'chicago', name: 'Chicago - State Street', city: 'Chicago', state: 'IL', zip: '60603', address: '27 South State Street', services: ['Trade-In', 'Pre-Owned', 'Cards & collectibles'], hours: 'Mon–Sat 10 AM–9 PM · Sun 11 AM–7 PM' },
  { id: 'new-york', name: 'New York - 34th Street', city: 'New York', state: 'NY', zip: '10001', address: '32 West 34th Street', services: ['Trade-In', 'Cards & collectibles', 'PSA card grading'], hours: 'Mon–Sat 9 AM–9 PM · Sun 10 AM–8 PM' },
  { id: 'los-angeles', name: 'Los Angeles - Hollywood', city: 'Los Angeles', state: 'CA', zip: '90028', address: '6801 Hollywood Boulevard', services: ['Trade-In', 'Pre-Owned', 'Retro games'], hours: 'Mon–Sat 10 AM–9 PM · Sun 11 AM–7 PM' },
]
export const selectedStoreName = req => STORES.find(s => s.id === retailState(req).selectedStore)?.name

export function registerJourneys(router, { render, invalidateReview }) {
  const baseOf = res => res.locals.base
  function requireUser(req, res, next) {
    if (req.store.user) return next()
    req.store.gsAuthReturn = req.path.startsWith('/account/') ? req.path : '/account'
    res.redirect(baseOf(res) + '/login')
  }
  const notFound = (req, res) => render(req, res, 'Not found', '<div class="gs-journey"><h1>Not found</h1><p>We could not find this item in your account.</p></div>', 404)
  const savedPage = (req, res, errors = [], status = 200) => render(req, res, 'Saved & recently viewed', `${accountNav(baseOf(res), 'Saved & recently viewed')}${notice(errors)}${!req.store.user ? '<p>Cart saves and recently viewed products stay in this guest session. Sign in to save favorites in your account.</p>' : ''}<h2>Saved for Later</h2>${savedRows(req, baseOf(res), 'savedForLater')}<h2>Favorites</h2>${savedRows(req, baseOf(res), 'favorites')}<h2>Recently viewed</h2>${savedRows(req, baseOf(res), 'recent')}</div>`, status)
  router.get('/account/saved', (req, res) => savedPage(req, res))
  router.post('/favorites/toggle', (req, res) => {
    const p = selectedProduct(byId(req.body.pid), req.body.variant || undefined)
    if (!p) return savedPage(req, res, ['Choose a valid product and option.'], 400)
    if (!req.store.user) { req.store.gsPendingFavorite = { pid: p.id, variant: p.variant }; req.store.gsAuthReturn = '/account/saved'; return res.redirect(baseOf(res) + '/login') }
    toggleFavorite(req, optionKey(p)); res.redirect(baseOf(res) + '/account/saved')
  })
  router.post('/saved/remove', (req, res) => {
    const state = retailState(req), item = state.savedForLater.find(x => x.id === req.body.id)
    if (!item) return notFound(req, res)
    state.savedForLater = state.savedForLater.filter(x => x.id !== item.id); res.redirect(baseOf(res) + '/account/saved')
  })
  router.post('/saved/restore', (req, res) => {
    const state = retailState(req), item = state.savedForLater.find(x => x.id === req.body.id)
    if (!item) return notFound(req, res)
    const line = { line: (req.store.cartSeq || 0) + 1, pid: item.pid, variant: item.variant, qty: item.qty }
    const error = cartError([...req.store.cart, line])
    if (error) return savedPage(req, res, [error + ' Your saved item has been kept.'], 400)
    req.store.cartSeq = line.line; req.store.cart.push(line); state.savedForLater = state.savedForLater.filter(x => x.id !== item.id)
    invalidateReview(req); res.redirect(baseOf(res) + '/cart')
  })
  const orderLinks = (req, base) => privateOrders(req).map(o => `<article class="gs-journey-card"><h2><a href="${base}/order/details/${o.id}">Order ${esc(o.order_number)}</a></h2><p>${statusLabel(o)} · ${money(o.totals.total)} · ${new Date(o.created_at).toLocaleDateString('en-US')}</p><p>${o.items.map(i => esc(i.title)).join(' · ')}</p></article>`).join('') || '<p>You have no orders yet.</p>'
  router.get('/account', requireUser, (req, res) => {
    const base = baseOf(res), state = retailState(req)
    render(req, res, 'My Account', `${accountNav(base, `Hello, ${req.store.user.first_name}`)}<p>${esc(req.store.user.email)} · <a href="${base}/logout">Sign Out</a></p><div class="gs-journey-grid"><article class="gs-journey-card"><h2>Your details</h2><p>${state.addresses.length} saved addresses · ${state.favorites.length} favorites</p><a href="${base}/account/profile">Edit profile</a></article><article class="gs-journey-card"><h2>My store</h2><p>${esc(selectedStoreName(req) || 'Choose a store for your next visit.')}</p><a href="${base}/stores">Find a store</a></article></div><h2>Recent orders</h2>${orderLinks(req, base)}</div>`)
  })
  router.get('/account/orders', requireUser, (req, res) => render(req, res, 'Order History', `${accountNav(baseOf(res), 'Order History')}${orderLinks(req, baseOf(res))}</div>`))
  const profilePage = (req, res, values = req.store.user, errors = [], status = 200) => render(req, res, 'Profile', `${accountNav(baseOf(res), 'Profile')}${notice(errors)}<p>Sign-in email: ${esc(req.store.user.email)}</p><form class="gs-journey-form" method="post">${field('first_name', 'First Name', values.first_name)}${field('last_name', 'Last Name', values.last_name)}${field('phone', 'Phone Number', values.phone, 'tel')}<button class="gs-btn">Save profile</button></form>${req.query.saved ? '<p class="gs-notice">Profile saved.</p>' : ''}</div>`, status)
  router.get('/account/profile', requireUser, (req, res) => profilePage(req, res))
  router.post('/account/profile', requireUser, (req, res) => {
    const values = { first_name: clean(req.body.first_name, 80), last_name: clean(req.body.last_name, 80), phone: clean(req.body.phone, 25) }, errors = []
    if (!values.first_name || !values.last_name) errors.push('Enter your first and last name.')
    if (values.phone && !/^\d{10}$/.test(values.phone.replace(/\D/g, ''))) errors.push('Enter a 10-digit phone number.')
    if (errors.length) return profilePage(req, res, values, errors, 400)
    retailState(req).profile = values; Object.assign(req.store.user, values); res.redirect(baseOf(res) + '/account/profile?saved=1')
  })
  function addressPage(req, res, values = {}, errors = [], status = 200) {
    const base = baseOf(res), state = retailState(req)
    render(req, res, 'Address book', `${accountNav(base, 'Address book')}${notice(errors)}<div class="gs-journey-grid">${state.addresses.map(a => `<article class="gs-journey-card"><h2>${esc(a.label || a.name)}${a.is_default ? ' · Default' : ''}</h2><address>${esc(a.name)}<br>${esc(a.line1)} ${esc(a.line2)}<br>${esc(a.city)}, ${esc(a.state)} ${esc(a.postal_code)}<br>${esc(a.phone)}</address><a href="${base}/account/addresses?edit=${a.id}">Edit address</a><form method="post" action="${base}/account/addresses/default"><input type="hidden" name="id" value="${a.id}"><button class="gs-link-btn">Make default</button></form><form method="post" action="${base}/account/addresses/delete"><input type="hidden" name="id" value="${a.id}"><button class="gs-link-btn">Delete address</button></form></article>`).join('') || '<p>Your address book is empty.</p>'}</div><h2>${values.id ? 'Edit address' : 'Add an address'}</h2><form method="post" action="${base}/account/addresses" class="gs-journey-form"><input type="hidden" name="id" value="${esc(values.id || '')}">${field('label', 'Address label (optional)', values.label)}${field('name', 'Recipient full name', values.name)}${field('phone', 'Phone Number', values.phone, 'tel')}${field('line1', 'Street address', values.line1)}${field('line2', 'Apartment / suite (optional)', values.line2)}${field('city', 'City', values.city)}<label for="journey-state">State<select name="state" id="journey-state"><option value="">Choose state</option>${STATES.map(s => `<option ${s === values.state ? 'selected' : ''}>${s}</option>`).join('')}</select></label>${field('postal_code', 'ZIP Code', values.postal_code)}<p>Country: United States. Checkout ships to the continental U.S. only.</p><label class="gs-check"><input type="checkbox" name="is_default" value="yes" ${values.is_default ? 'checked' : ''}>Use as default</label><button class="gs-btn">Save address</button></form></div>`, status)
  }
  router.get('/account/addresses', requireUser, (req, res) => {
    const address = req.query.edit ? retailState(req).addresses.find(a => a.id === req.query.edit) : {}
    if (!address) return notFound(req, res)
    addressPage(req, res, address)
  })
  router.post('/account/addresses', requireUser, (req, res) => {
    const input = { ...req.body, state: clean(req.body.state).toUpperCase() }, errors = []
    if (!STATES.includes(input.state)) errors.push('Select a valid US state.')
    if (!/^\d{10}$/.test(clean(input.phone).replace(/\D/g, ''))) errors.push('Enter a 10-digit phone number.')
    if (errors.length) return addressPage(req, res, input, errors, 400)
    const result = saveAddress(req, input, { country: 'US', requirePhone: true })
    if (result.errors) return addressPage(req, res, { ...result.values, id: clean(input.id), is_default: input.is_default === 'yes' }, result.errors, 400)
    res.redirect(baseOf(res) + '/account/addresses')
  })
  router.post('/account/addresses/default', requireUser, (req, res) => {
    const state = retailState(req), address = state.addresses.find(a => a.id === req.body.id)
    if (!address) return notFound(req, res)
    state.addresses.forEach(a => { a.is_default = a === address }); res.redirect(baseOf(res) + '/account/addresses')
  })
  router.post('/account/addresses/delete', requireUser, (req, res) => {
    if (!deleteAddress(req, req.body.id)) return notFound(req, res)
    res.redirect(baseOf(res) + '/account/addresses')
  })
  const preferencePage = (req, res, error) => {
    const values = retailState(req).preferences
    render(req, res, 'Preferences', `${accountNav(baseOf(res), 'Preferences')}${notice(error ? [error] : [])}<form method="post" class="gs-journey-form"><label class="gs-check"><input type="checkbox" name="promotions" value="yes" ${values.promotions ? 'checked' : ''}>Interested in promotions and events</label><label for="journey-platform">Favorite gaming platform<select id="journey-platform" name="platform">${['No preference', 'PlayStation', 'Xbox', 'Nintendo', 'PC'].map(p => `<option ${p === values.platform ? 'selected' : ''}>${p}</option>`).join('')}</select></label><button class="gs-btn">Save preferences</button></form>${publicNotice('<p>These preferences are saved locally. No emails are sent.</p>')}${req.query.saved ? '<p class="gs-notice">Preferences saved.</p>' : ''}</div>`, error ? 400 : 200)
  }
  router.get('/account/preferences', requireUser, (req, res) => preferencePage(req, res))
  router.post('/account/preferences', requireUser, (req, res) => {
    if (!['No preference', 'PlayStation', 'Xbox', 'Nintendo', 'PC'].includes(req.body.platform)) return preferencePage(req, res, 'Choose one of the listed platforms.')
    retailState(req).preferences = { promotions: req.body.promotions === 'yes', platform: req.body.platform }; res.redirect(baseOf(res) + '/account/preferences?saved=1')
  })
  const eligibleReturn = order => order.items.every(item => { const p = byId(item.sku); return p && !p.preorder && !['tcg-booster', 'tcg-deck', 'sports-card-box', 'graded-card'].includes(p.family) })
  function orderPage(req, res, order, errors = [], status = 200) {
    const base = baseOf(res), current = orderStatus(order), canReturn = current === 'delivered' && eligibleReturn(order)
    render(req, res, 'Order details', `${accountNav(base, 'Order ' + order.order_number)}${notice(errors)}<p class="gs-status">${statusLabel(order)}</p>${current === 'processing' ? `<p>${esc(order.fulfillment.eta || 'Awaiting fulfillment information.')}</p>` : ''}<h2>Tracking</h2><p>${current === 'processing' ? 'Order received. Awaiting shipment; tracking details will appear here once your order ships.' : current === 'cancelled' ? 'This order was cancelled before shipment.' : current === 'return_requested' ? 'Your return request has been received and is being reviewed.' : 'This order has been delivered.'}</p><div class="gs-journey-card">${order.items.map((i, n) => `<p><b>${esc(i.title)}</b> × ${i.qty} — ${money(i.unit_price * i.qty)}<br>${Object.entries(order.meta.items?.[n]?.options || {}).map(([k, v]) => `${esc(k)}: ${esc(v)}`).join(' · ')}</p>`).join('')}<p><b>Total ${money(order.totals.total)}</b></p><p>Ship to ${esc(order.shipping_address?.first_name)} ${esc(order.shipping_address?.last_name)}, ${esc(order.shipping_address?.line1)}, ${esc(order.shipping_address?.city)}, ${esc(order.shipping_address?.state)} ${esc(order.shipping_address?.postal_code)}</p></div><h2>Manage this order</h2>${req.store.user && current === 'processing' ? `<form method="post" action="${base}/order/details/${order.id}/action" class="gs-journey-form"><input type="hidden" name="action" value="cancel">${field('reason', 'Reason for cancellation', '', 'text', 'required')}<button class="gs-btn gs-btn-outline">Cancel order</button></form>` : ''}${canReturn ? `<form method="post" action="${base}/order/details/${order.id}/action" class="gs-journey-form"><input type="hidden" name="action" value="return">${field('reason', 'Reason for return', '', 'text', 'required')}<button class="gs-btn gs-btn-outline">Request return</button></form>` : current !== 'return_requested' ? '<p>Returns require delivered, eligible merchandise. Preorders and sealed trading-card products are excluded.</p>' : ''}<p><a href="${base}/help/contact?order_id=${order.id}">${!req.store.user && current === 'processing' ? 'Contact support to request guest cancellation' : 'Get help with this order'}</a></p>${order.meta.lifecycle?.length ? `<h2>Status activity</h2><ul>${order.meta.lifecycle.map(event => `<li>${esc(event.status.replaceAll('_', ' '))} · ${esc(event.reason)}</li>`).join('')}</ul>` : ''}</div>`, status)
  }
  router.get(['/order/details/:id', '/account/orders/:id'], (req, res) => { const order = privateOrder(req, req.params.id); if (!order) return notFound(req, res); orderPage(req, res, order) })
  router.post('/order/details/:id/action', (req, res) => {
    const order = privateOrder(req, req.params.id)
    if (!order) return notFound(req, res)
    if (req.body.action === 'cancel' && !req.store.user) return orderPage(req, res, order, ['For guest cancellation, contact support with this order.'], 400)
    if (req.body.action === 'return' && !eligibleReturn(order)) return orderPage(req, res, order, ['These items are not eligible for an online return request.'], 400)
    const result = requestOrderAction(req, order.id, req.body.action, req.body.reason, 'gamestop')
    if (result.error) return orderPage(req, res, order, [result.error], result.status)
    res.redirect(baseOf(res) + '/order/details/' + order.id)
  })
  const lookupPage = (req, res, error) => render(req, res, 'Order Status', `<div class="gs-journey"><h1>Order Status</h1><p>Enter your order number, the email used to place the order and your billing ZIP Code. Have an account? Sign in to see all of your orders.</p>${notice(error ? [error] : [])}<form method="post" class="gs-journey-form">${field('order_number', 'Order Number', clean(req.body?.order_number))}${field('email', 'Order Email', clean(req.body?.email), 'email')}${field('postal_code', 'Billing ZIP Code', clean(req.body?.postal_code))}<button class="gs-btn">Find order</button></form><p><a href="${baseOf(res)}/account/orders">Signed-in order history</a></p></div>`, error ? 404 : 200)
  router.get('/order/search', (req, res) => lookupPage(req, res))
  router.post('/order/search', (req, res) => {
    const order = privateOrder(req, clean(req.body.order_number))
    if (!order || order.customer.email !== clean(req.body.email).toLowerCase() || order.billing_address?.postal_code !== clean(req.body.postal_code)) return lookupPage(req, res, 'We could not find an order matching those details. Check your order number, email and ZIP Code and try again.')
    res.redirect(baseOf(res) + '/order/details/' + order.id)
  })
  router.get('/help', (req, res) => {
    const base = baseOf(res), query = clean(req.query.q, 120), articles = ARTICLES.filter(a => `${a.title} ${a.topic} ${a.text}`.toLowerCase().includes(query.toLowerCase()))
    const topics = [['Order Help', 'orders', 'box'], ['GameStop PRO', 'pro', 'star'], ['Returns & Exchanges', 'returns', 'tag'], ['Trades', 'trades', 'console'], ['Payments & Gift Cards', 'payments', 'gift'], ['Digital Content', 'digital', 'bolt'], ['Pre-orders', 'preorders', 'disc'], ["Shipping FAQ's", 'shipping', 'box']]
    render(req, res, 'Help Center', `<div class="gs-journey gs-help"><section class="gs-help-hero"><p class="gs-info-kicker">GameStop Help Center</p><h1>How Can We Help?</h1><form method="get" class="gs-inline-form">${field('q', 'Search help', query, 'search')}<button class="gs-btn">Search help</button></form><p><a href="${base}/order/search">Order Status</a> · <a href="${base}/help/contact">Contact support</a> · <a href="${base}/stores">Find a store</a></p></section>${query ? '' : `<section><h2>Browse Help Topics</h2><nav class="gs-help-topics" aria-label="Help topics">${topics.map(([label, id, icon]) => `<a href="${base}/help/articles/${id}">${glyph(icon)}<b>${esc(label)}</b></a>`).join('')}</nav></section>`}<section><h2>${query ? `Results for “${esc(query)}”` : 'Frequently Asked Questions'}</h2><div class="gs-journey-grid">${articles.map(a => `<article class="gs-journey-card"><span class="gs-fine">${a.topic}</span><h3><a href="${base}/help/articles/${a.id}">${a.title}</a></h3><p>${esc(a.text.split('. ')[0])}.</p></article>`).join('') || `<p>No help articles match your search. <a href="${base}/help">Browse all topics</a></p>`}</div></section><section class="gs-help-contact"><h2>Still need help?</h2><p>Our customer service team can help with orders, returns, trades and your account.</p><a class="gs-btn" href="${base}/help/contact">Contact Us</a></section></div>`)
  })
  router.get('/help/articles/:id', (req, res) => {
    const article = ARTICLES.find(a => a.id === req.params.id), base = baseOf(res)
    if (!article) return notFound(req, res)
    render(req, res, article.title, `<div class="gs-journey"><a href="${base}/help">Help Center</a><h1>${article.title}</h1><p>${article.text}</p><p><a href="${base}/help/contact?category=${encodeURIComponent(article.topic)}">Contact support about ${article.topic}</a></p></div>`)
  })
  const categories = ARTICLES.map(a => a.topic)
  function contactPage(req, res, values = {}, errors = [], status = 200) {
    const base = baseOf(res), state = retailState(req), orders = privateOrders(req)
    render(req, res, 'Contact support', `<div class="gs-journey"><h1>Contact GameStop support</h1><p>Tell us what you need help with and our Customer Care team will review your request.</p>${publicNotice('<p>Send a local support request. No message is sent to a live agent or service.</p>')}${notice(errors)}<form method="post" class="gs-journey-form"><label for="journey-category">Topic<select id="journey-category" name="category"><option value="">Choose a topic</option>${categories.map(c => `<option ${c === values.category ? 'selected' : ''}>${c}</option>`).join('')}</select></label>${field('email', 'Contact Email', values.email || req.store.user?.email, 'email')}${field('subject', 'Subject', values.subject)}<label for="journey-order">Link an order (optional)<select id="journey-order" name="order_id"><option value="">No order</option>${orders.map(o => `<option value="${o.id}" ${values.order_id === o.id ? 'selected' : ''}>${o.order_number} — ${statusLabel(o)}</option>`).join('')}</select></label><label for="journey-message">Message<textarea id="journey-message" name="message" rows="6" required>${esc(values.message || '')}</textarea></label><button class="gs-btn">Submit request</button></form><h2>Your support requests</h2>${state.cases.map(c => `<p><a href="${base}/help/cases/${c.id}">${esc(c.subject)}</a> · Received</p>`).join('') || '<p>No support requests yet.</p>'}</div>`, status)
  }
  router.get('/help/contact', (req, res) => {
    if (req.query.order_id && !privateOrder(req, req.query.order_id)) return notFound(req, res)
    contactPage(req, res, { category: req.query.category, order_id: req.query.order_id })
  })
  router.post('/help/contact', (req, res) => {
    const values = { category: clean(req.body.category), email: clean(req.body.email), subject: clean(req.body.subject, 160), message: clean(req.body.message, 3000), order_id: clean(req.body.order_id) }
    const errors = []
    if (!categories.includes(values.category)) errors.push('Choose one of the listed topics.')
    if (values.order_id && !privateOrder(req, values.order_id)) errors.push('We could not find that order in your account.')
    if (errors.length) return contactPage(req, res, values, errors, 400)
    const result = createSupportCase(req, values, 'gamestop')
    if (result.errors) return contactPage(req, res, result.values, result.errors, 400)
    res.redirect(baseOf(res) + '/help/cases/' + result.supportCase.id)
  })
  router.get('/help/cases/:id', (req, res) => {
    const supportCase = retailState(req).cases.find(c => c.id === req.params.id)
    if (!supportCase) return notFound(req, res)
    render(req, res, 'Request received', `<div class="gs-journey"><h1>Support request received</h1><p>Reference: <b>${supportCase.id}</b> · Status: Received</p><h2>${esc(supportCase.subject)}</h2><p>${esc(supportCase.category)} · ${esc(supportCase.email)}</p><p class="gs-case-message">${esc(supportCase.message)}</p>${supportCase.order_id ? `<a href="${baseOf(res)}/order/details/${supportCase.order_id}">View linked order</a>` : ''}<p>Thanks for contacting GameStop. Our Customer Care team will follow up by email.</p>${publicNotice('<p>This request is saved locally. No live agent, return label or refund has been issued.</p>')}<a href="${baseOf(res)}/help/contact">Your support requests</a></div>`)
  })
  router.get(['/stores', '/shopmystore'], (req, res) => {
    const base = baseOf(res), q = clean(req.query.q, 80), invalid = q && !/^\d{5}$/.test(q) && !/^[a-zA-Z\s.,-]{2,60}$/.test(q)
    const matches = !q ? STORES : /^\d{5}$/.test(q) ? STORES.filter(s => s.zip.slice(0, 3) === q.slice(0, 3)) : STORES.filter(s => `${s.city} ${s.state} ${s.name}`.toLowerCase().includes(q.toLowerCase()))
    render(req, res, 'Find a store', `<div class="gs-journey gs-store-locator"><nav class="gs-crumbs" aria-label="Breadcrumb"><a href="${base}/">Home</a> <span aria-hidden="true">/</span> <span aria-current="page">Find A Store</span></nav><h1>Find A Store</h1><p>Find a GameStop near you for trade-ins, pre-owned games, collectibles and more.</p><form method="get" class="gs-inline-form">${field('q', 'City or ZIP Code', q)}<button class="gs-btn">Find stores</button></form>${notice(invalid ? ['Enter a city name or a 5-digit ZIP Code.'] : [])}<p>My store: <b>${esc(selectedStoreName(req) || 'Not selected')}</b></p><div class="gs-journey-grid">${!invalid ? matches.map(s => `<article class="gs-journey-card"><h2>${s.name}</h2><address>${s.address}<br>${s.city}, ${s.state} ${s.zip}</address><p>${s.hours}</p><p>${s.services.join(' · ')}</p><form method="post" action="${base}/stores/select"><input type="hidden" name="id" value="${s.id}"><button class="gs-btn gs-btn-outline">${retailState(req).selectedStore === s.id ? 'Selected store' : 'Make this my store'}</button></form></article>`).join('') || `<p>No stores match. <a href="${base}/stores">View all stores</a></p>` : ''}</div><p>Set a store as My Store to see its hours and services. Online orders ship to your address. Store hours may vary on holidays.</p><a href="${base}/card-grading-service">Card grading information</a></div>`, invalid ? 400 : 200)
  })
  router.post('/stores/select', (req, res) => {
    if (!STORES.some(s => s.id === req.body.id)) return notFound(req, res)
    retailState(req).selectedStore = req.body.id; res.redirect(baseOf(res) + '/stores')
  })
  router.get('/card-grading-service', (req, res) => render(req, res, 'PSA Card Grading', gradingPage(baseOf(res))))
  router.get('/trade', (req, res) => res.redirect(baseOf(res) + '/trade-in'))
}
