import { randomBytes } from 'node:crypto'
import { productPhoto } from '../../lib/product-photos.js'
import { esc, money, publicNotice } from '../../lib/html.js'
import { authenticate, createAccount, publicAccount } from '../../lib/accounts.js'
import { retailState, saveAddress, deleteAddress, ownedOrders, ownedOrder, orderStatus, requestOrderAction, createSupportCase } from '../../lib/retail-state.js'
import { products, brands, clean, filterCatalog, selectionOptions } from './catalog.js'

const scalar = (value, max = 240) => clean(value).slice(0, max)
const fields = (input, keys) => Object.fromEntries(keys.map(key => [key, scalar(input[key])]))
const errorsHtml = errors => errors.length ? `<div class="sp-errors" role="alert"><strong>Please check the following:</strong><ul>${errors.map(error => `<li>${esc(error)}</li>`).join('')}</ul></div>` : ''
const input = (name, label, value = '', attributes = '') => `<label>${label}<input name="${name}" value="${esc(value)}" ${attributes}></label>`
const select = (name, label, choices, value = '', optional = true) => `<label>${label}<select name="${name}">${optional ? '<option value="">No preference</option>' : ''}${choices.map(choice => { const [v, text] = Array.isArray(choice) ? choice : [choice, choice]; return `<option value="${esc(v)}"${String(value) === String(v) ? ' selected' : ''}>${esc(text)}</option>` }).join('')}</select></label>`
const date = value => new Date(value).toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric' })
const today = () => new Date().toISOString().slice(0, 10)
const newId = prefix => `${prefix}-${randomBytes(6).toString('hex')}`
const enums = {
  skin: [...new Set(products.flatMap(p => p.skin))], hair: [...new Set(products.flatMap(p => p.hair))],
  finish: [...new Set(products.map(p => p.finish).filter(Boolean))], scent: [...new Set(products.map(p => p.scent).filter(Boolean))],
  brand: brands.map(b => b.slug), preference: [...new Set(products.filter(p => p.category === 'Skincare').flatMap(p => p.preferences))],
}
export const sampleStores = [{ id: 'beauty-square', name: 'Beauty Square', area: 'Downtown' }, { id: 'garden-walk', name: 'Garden Walk', area: 'Neighborhood store' }, { id: 'coast-center', name: 'Coast Center', area: 'Shopping center' }]
const services = [{ id: 'full-face', name: 'Full-face inspiration', description: 'Explore a complete makeup look and your preferred finish.' }, { id: 'feature-focus', name: 'Feature focus', description: 'Build an eye or lip color story.' }, { id: 'beauty-lesson', name: 'Beauty lesson', description: 'Explore product directions and plan a routine at your own pace.' }]
const topics = [
  { id: 'shipping', title: 'Shipping & delivery', text: 'Signed-in members receive free standard shipping. Guests pay $6.95 below $50 and receive free shipping at $50. Choose a saved address during checkout or enter another address. Pickup and same-day delivery are currently unavailable online.', link: '/account/addresses', cta: 'Manage delivery addresses' },
  { id: 'returns', title: 'Returns & cancellations', text: 'A processing order can be cancelled with a reason. A return request becomes available only after delivered status is recorded. Track the status of each order from your order history.', notice: 'Requests on this site do not issue a carrier label or transfer a real refund.', link: '/orders', cta: 'View orders' },
  { id: 'insider', title: 'Beauty Insider', text: 'Join Beauty Insider to save your enrollment and view your own shopping activity. Points balances, tier upgrades, rewards and redemption are currently unavailable online. Signing in already qualifies for free standard shipping.', link: '/beauty-insider', cta: 'Explore Beauty Insider' },
  { id: 'preferences', title: 'Beauty Preferences & Loves', text: 'Choose optional skin, hair, finish, fragrance and brand preferences. Discover matching products with catalog filters. Preferences do not perform shade matching or assess medical conditions. Loves and recent views stay separate for each account and guest.', link: '/account/preferences', cta: 'Edit Beauty Preferences' },
  { id: 'services', title: 'Stores, services & events', text: 'Choose a store and save service interests to revisit later. Online booking is currently unavailable.', notice: 'No real appointment, event registration, store inventory check or message to a store is created.', link: '/services', cta: 'Explore services' },
  { id: 'replenish', title: 'Auto-Replenish plans', text: 'Save a consumable, its exact size, quantity, next reminder date and cadence. Return here to review or cancel your plan.', notice: 'Plans do not reserve stock or create purchases. There is no automatic charge or dispatch, and no scheduled notification is sent.', link: '/account/replenishment', cta: 'Manage plans' },
  { id: 'account', title: 'Account & sign-in', text: 'Create an account or sign in, edit your profile and save delivery details. Password recovery and email changes are currently unavailable online.', notice: 'This site is not connected to a sephora.com account. Support requests are saved here; no email is sent.', link: '/account', cta: 'My account' },
]
const statusLabel = status => ({ processing: 'Processing', cancelled: 'Cancelled', delivered: 'Delivered', return_requested: 'Return requested' })[status] || 'Processing'
export const isAccountOrder = (req, order) => Boolean(order && (order.meta?.account_id || null) === (req.store.user?.id || null))
export const eligibleForReplenishment = product => Boolean(product && ['Skincare', 'Hair', 'Bath & Body'].includes(product.category) && product.type !== 'Hair Dryer')
export function preferenceQuery(preferences, scope) {
  const keys = { skin: ['skin', 'preference'], hair: ['hair'], makeup: ['finish'], fragrance: ['scent'], brand: ['brand'] }[scope]
  if (!keys) return null
  const query = Object.fromEntries(keys.filter(key => preferences[key]).map(key => [key, preferences[key]]))
  if (!Object.keys(query).length) return null
  if (scope !== 'brand') query.category = { skin: 'Skincare', hair: 'Hair', makeup: 'Makeup', fragrance: 'Fragrance' }[scope]
  return query
}

export function sephoraJourneys(router, { render, config, productById, selectedProduct, stockLimit }) {
  const link = (base, path, text) => `<a href="${base}${path}">${esc(text)}</a>`
  const state = req => { const saved = retailState(req); saved.serviceDrafts ||= []; saved.replenishment ||= []; return saved }
  const profile = req => state(req).profile || req.store.user || {}
  const privateOrders = req => ownedOrders(req, 'sephora').filter(order => isAccountOrder(req, order))
  const privateOrder = (req, id) => { const order = ownedOrder(req, id, 'sephora'); return isAccountOrder(req, order) ? order : null }
  const navigation = (base, path) => `<details class="sp-account-directory" open><summary>My Sephora menu</summary><nav class="sp-account-nav" aria-label="My Sephora">${[['/account', 'Overview'], ['/account/profile', 'Profile'], ['/account/preferences', 'Beauty Preferences'], ['/beauty-insider', 'Beauty Insider'], ['/account/addresses', 'Addresses'], ['/orders', 'Orders'], ['/favorites', 'Loves'], ['/recently-viewed', 'Recently Viewed'], ['/account/replenishment', 'Auto-Replenish'], ['/help/cases', 'Support Requests'], ['/services', 'Service Interests']].map(([destination, name]) => `<a href="${base}${destination}"${path === destination ? ' aria-current="page"' : ''}>${esc(name)}</a>`).join('')}</nav></details>`
  const page = (req, res, title, content, status = 200) => render(req, res, title, `<p class="breadcrumb">${link(res.locals.base, '/', 'Sephora')} / ${link(res.locals.base, '/account', 'My Sephora')}</p><div class="sp-account-layout">${navigation(res.locals.base, req.path)}<section class="sp-account-content"><h1>${esc(title)}</h1>${content}</section></div>`, status)
  const missing = (req, res) => page(req, res, 'Not found', '<p>This item is not available in your current account or session.</p>', 404)
  const auth = (req, res, next) => req.store.user ? next() : res.redirect(`${res.locals.base}/account`)
  function accountPage(req, res, errors = [], values = {}, status = 200) {
    const base = res.locals.base
    if (!req.store.user || errors.length) return render(req, res, 'Sign in or join', `<section class="sp-auth"><div><p class="eyebrow">My Sephora</p><h1>Welcome to your beauty space</h1><p>Keep your Loves, routines and orders together. Sign in for free standard shipping.</p>${errorsHtml(errors)}<h2>Sign in or join us</h2><form class="sp-form" method="post" action="${base}/account">${input('email', 'Email address', values.email, 'type="email" autocomplete="email" required')}${input('password', 'Password', '', 'type="password" autocomplete="current-password" required')}<button>Sign in</button></form><p>Password recovery is currently unavailable.</p></div><div><h2>Create an account</h2><form class="sp-form" method="post" action="${base}/account"><input type="hidden" name="mode" value="register">${input('first_name', 'First name', values.first_name, 'required maxlength="80"')}${input('last_name', 'Last name', values.last_name, 'required maxlength="80"')}${input('email', 'Email address', values.email, 'type="email" autocomplete="email" required')}${input('password', 'Password (8 or more characters)', '', 'type="password" minlength="8" autocomplete="new-password" required')}<button>Create account</button></form><p>Beauty Insider enrollment is a separate choice after sign-in.</p></div></section>`, status)
    const saved = state(req)
    page(req, res, `Welcome, ${profile(req).first_name || 'Beauty Insider'}`, `<p>${esc(req.store.user.email)}</p><div class="sp-insider-band"><h2>${saved.insider ? 'Your Beauty Insider space' : 'Make beauty personal'}</h2><p>${saved.insider ? `Enrolled ${date(saved.insider.enrolled_at)}. Explore your own shopping activity.` : 'Save your beauty preferences and join Beauty Insider when you are ready.'}</p>${link(base, '/beauty-insider', 'Explore Beauty Insider →')}</div><div class="sp-journey-grid">${[['/account/preferences', 'Your beauty, your way', 'Save optional preferences and discover products that match.'], ['/orders', `${privateOrders(req).length} orders`, 'Review purchases and available order actions.'], ['/account/addresses', `${saved.addresses.length} saved addresses`, 'Make your next checkout easier.'], ['/favorites', `${saved.favorites.length} Loves`, 'Come back to the beauty you saved.'], ['/account/replenishment', 'Plan your next refill', 'Manage reminders for everyday essentials.'], ['/help/cases', `${saved.cases.length} support requests`, 'Review your case history.']].map(([path, title, copy]) => `<a class="sp-journey-card" href="${base}${path}"><h2>${esc(title)}</h2><p>${copy}</p><strong>Explore →</strong></a>`).join('')}</div><form method="post" action="${base}/logout"><button class="secondary">Sign out</button></form>`)
  }
  router.get('/account', (req, res) => accountPage(req, res))
  router.post('/account', (req, res) => {
    const values = fields(req.body, ['email', 'first_name', 'last_name']), password = typeof req.body.password === 'string' ? req.body.password : ''
    const errors = [], registering = req.body.mode === 'register'
    if (req.body.mode !== undefined && !['register', 'login'].includes(req.body.mode)) errors.push('Choose sign in or create account.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.push('Enter a valid email address.')
    if (registering && (!values.first_name || !values.last_name || values.first_name.length > 80 || values.last_name.length > 80 || password.length < 8)) errors.push('Enter your first and last name and a password of at least 8 characters.')
    if (errors.length) return accountPage(req, res, errors, values, 400)
    const account = registering ? createAccount('sephora', { ...values, password }) : authenticate('sephora', values.email, password)
    if (!account || account.error) return accountPage(req, res, [account?.error || 'The email or password did not match. Please try again.'], values, 400)
    req.store.user = publicAccount(account)
    res.redirect(`${res.locals.base}/account`)
  })
  function profilePage(req, res, values = profile(req), errors = []) {
    page(req, res, 'My profile', `<p>Your sign-in email is ${esc(req.store.user.email)}. Email and password changes are currently unavailable online.</p>${errorsHtml(errors)}<form class="sp-form" action="${res.locals.base}/account/profile" method="post">${input('first_name', 'First name', values.first_name, 'required maxlength="80"')}${input('last_name', 'Last name', values.last_name, 'required maxlength="80"')}${input('phone', 'Phone (optional)', values.phone, 'type="tel"')}<button>Save profile</button></form>` , errors.length ? 400 : 200)
  }
  router.get('/account/profile', auth, (req, res) => profilePage(req, res))
  router.post('/account/profile', auth, (req, res) => {
    const values = fields(req.body, ['first_name', 'last_name', 'phone']), errors = Object.values(req.body).some(value => typeof value !== 'string') ? ['Enter one value for each profile field.'] : []
    if (!values.first_name || !values.last_name || values.first_name.length > 80 || values.last_name.length > 80) errors.push('Enter a first and last name, each up to 80 characters.')
    if (values.phone && !/^[+\d\s().-]{7,25}$/.test(values.phone)) errors.push('Enter a valid phone number.')
    if (errors.length) return profilePage(req, res, values, errors)
    state(req).profile = values
    res.redirect(`${res.locals.base}/account`)
  })
  function preferencesPage(req, res, values = state(req).preferences, errors = []) {
    const base = res.locals.base
    const discoveries = [['skin', 'Skincare'], ['hair', 'Haircare'], ['makeup', 'Makeup finish'], ['fragrance', 'Fragrance family'], ['brand', 'Favorite brand']]
    page(req, res, 'Beauty Preferences', `<p>A routine that feels like you. These optional choices filter product descriptions; they do not assess your skin or match a shade.</p>${errorsHtml(errors)}<form class="sp-form sp-form-grid" method="post" action="${base}/account/preferences">${select('skin', 'Skin type', enums.skin, values.skin)}${select('hair', 'Hair type / texture', enums.hair, values.hair)}${select('finish', 'Makeup finish', enums.finish, values.finish)}${select('scent', 'Fragrance family', enums.scent, values.scent)}${select('brand', 'Favorite brand', brands.map(b => [b.slug, b.name]), values.brand)}${select('preference', 'Skincare preference', enums.preference, values.preference)}<button>Save Beauty Preferences</button></form><h2>Discover with your preferences</h2><p>Apply a group of saved preferences, then refine or clear any filter on the results page.</p><div class="sp-journey-grid">${discoveries.map(([scope, label]) => { const query = preferenceQuery(state(req).preferences, scope); return `<section class="sp-journey-card"><h3>${label}</h3>${query ? `<p>${filterCatalog(query).length} matching products</p>${link(base, `/account/discover?scope=${scope}`, 'Use my preferences →')}` : '<p>Save a preference above to find matches.</p>'}</section>` }).join('')}</div><form action="${base}/account/preferences/clear" method="post"><button class="secondary">Clear saved preferences</button></form>`, errors.length ? 400 : 200)
  }
  router.get(['/account/preferences', '/profile/BeautyPreferences'], auth, (req, res) => preferencesPage(req, res))
  router.post('/account/preferences', auth, (req, res) => {
    const values = fields(req.body, Object.keys(enums)), errors = Object.keys(enums).filter(key => req.body[key] !== undefined && (typeof req.body[key] !== 'string' || (values[key] && !enums[key].includes(values[key])))).map(key => `Choose a listed ${key} preference.`)
    if (errors.length) return preferencesPage(req, res, values, errors)
    state(req).preferences = values
    res.redirect(`${res.locals.base}/account/preferences`)
  })
  router.post('/account/preferences/clear', auth, (req, res) => { state(req).preferences = {}; res.redirect(`${res.locals.base}/account/preferences`) })
  router.get('/account/discover', auth, (req, res) => {
    const query = preferenceQuery(state(req).preferences, scalar(req.query.scope))
    if (!query) return page(req, res, 'Choose your preferences', `<p>Save a preference for this group before discovering matches.</p>${link(res.locals.base, '/account/preferences', 'Edit Beauty Preferences')}`, 400)
    res.redirect(`${res.locals.base}/search?${new URLSearchParams(query)}`)
  })
  router.get('/beauty-insider', (req, res) => {
    const saved = state(req), base = res.locals.base, orders = privateOrders(req)
    page(req, res, 'Beauty Insider', `<div class="sp-insider-band"><p class="eyebrow">Your beauty, your way</p><h2>${saved.insider ? 'You’re enrolled' : 'A space for your beauty discoveries'}</h2><p>Signed-in members enjoy free standard shipping. Save your Loves, discover with Beauty Preferences and keep your shopping activity together.</p>${saved.insider ? `<p>Member since ${date(saved.insider.enrolled_at)}.</p>` : req.store.user ? `<form method="post" action="${base}/beauty-insider/enroll"><label class="sp-check"><input type="checkbox" name="consent" value="yes" required>Join the Beauty Insider program</label><button>Join Beauty Insider</button></form>` : link(base, '/account', 'Sign in or create an account to join →')}</div><p>Points, rewards, tier upgrades and redemption are currently unavailable online.</p>${publicNotice('<p>No external loyalty account is changed.</p>')}${saved.insider ? `<h2>Your activity</h2><ul class="sp-activity"><li>Enrolled in Beauty Insider · ${date(saved.insider.enrolled_at)}</li>${orders.map(order => `<li>${link(base, `/orders/${order.id}`, order.order_number)} · ${date(order.created_at)} · ${statusLabel(orderStatus(order))} · ${order.items.reduce((n, item) => n + item.qty, 0)} items</li>`).join('')}</ul>${orders.length ? '' : '<p>Your purchases will appear here after checkout.</p>'}` : ''}`)
  })
  router.post('/beauty-insider/enroll', auth, (req, res) => {
    if (req.body.consent !== 'yes') return page(req, res, 'Join Beauty Insider', `<p role="alert">Choose the enrollment checkbox to join.</p>${link(res.locals.base, '/beauty-insider', 'Back to Beauty Insider')}`, 400)
    state(req).insider ||= { enrolled_at: new Date().toISOString() }
    res.redirect(`${res.locals.base}/beauty-insider`)
  })
  router.get('/recently-viewed', (req, res) => {
    const list = state(req).recent.map(productById).filter(Boolean)
    page(req, res, 'Recently Viewed', `<p>Return to products you explored in this account or guest session.</p>${list.length ? `<form method="post" action="${res.locals.base}/recently-viewed/clear"><button class="secondary">Clear recently viewed</button></form>${config.sephoraCards(res.locals.base, list)}` : '<p>You haven’t viewed any products yet.</p>'}`)
  })
  router.post('/recently-viewed/clear', (req, res) => { state(req).recent = []; res.redirect(`${res.locals.base}/recently-viewed`) })
  function addressPage(req, res, values = {}, errors = [], status = 200) {
    const base = res.locals.base, addresses = state(req).addresses
    page(req, res, 'Address Book', `<p>Save up to 12 US delivery addresses. Your default address pre-fills checkout; you can change it before purchasing.</p>${addresses.length ? `<div class="sp-journey-grid">${addresses.map(address => `<article class="sp-journey-card" data-address="${address.id}"><h2>${esc(address.label || 'Delivery address')}${address.is_default ? ' · Default' : ''}</h2><p>${esc(address.name)}<br>${esc(address.line1)} ${esc(address.line2)}<br>${esc(address.city)}, ${esc(address.state)} ${esc(address.postal_code)}</p><div class="sp-inline-actions">${link(base, `/account/addresses?edit=${address.id}`, 'Edit')}<form method="post" action="${base}/account/addresses/${address.id}/default"><button class="secondary"${address.is_default ? ' disabled' : ''}>Make default</button></form><form method="post" action="${base}/account/addresses/${address.id}/delete"><button class="secondary">Delete</button></form></div>${link(base, `/checkout?address_id=${address.id}`, 'Use at checkout →')}</article>`).join('')}</div>` : '<p>No saved addresses yet.</p>'}<h2>${values.id ? 'Edit address' : 'Add an address'}</h2>${errorsHtml(errors)}<form class="sp-form sp-form-grid" method="post" action="${base}/account/addresses">${values.id ? `<input type="hidden" name="id" value="${esc(values.id)}">` : ''}${input('label', 'Label (optional)', values.label)}${input('name', 'Recipient name', values.name, 'required')}${input('line1', 'Street address', values.line1, 'required')}${input('line2', 'Apartment / suite (optional)', values.line2)}${input('city', 'City', values.city, 'required')}${input('state', 'State (two-letter code)', values.state, 'required maxlength="2" pattern="[A-Za-z]{2}"')}${input('postal_code', 'ZIP code', values.postal_code, 'required')}${input('phone', 'Phone (optional)', values.phone, 'type="tel"')}<label class="sp-check"><input type="checkbox" name="is_default" value="yes"${values.is_default ? ' checked' : ''}>Use as default</label><button>Save address</button>${values.id ? link(base, '/account/addresses', 'Cancel editing') : ''}</form>`, status)
  }
  router.get('/account/addresses', auth, (req, res) => {
    const values = req.query.edit ? state(req).addresses.find(address => address.id === req.query.edit) : {}
    if (!values) return missing(req, res)
    addressPage(req, res, values)
  })
  router.post('/account/addresses', auth, (req, res) => {
    const values = { ...fields(req.body, ['id', 'label', 'name', 'line1', 'line2', 'city', 'state', 'postal_code', 'phone']), is_default: req.body.is_default === 'yes' }
    const errors = Object.keys(req.body).some(key => typeof req.body[key] !== 'string') ? ['Enter one value for each address field.'] : []
    if (!/^[A-Za-z]{2}$/.test(values.state)) errors.push('Enter a two-letter US state code.')
    if (values.id && !state(req).addresses.some(address => address.id === values.id)) return missing(req, res)
    if (errors.length) return addressPage(req, res, values, errors, 400)
    const result = saveAddress(req, { ...values, state: values.state.toUpperCase(), is_default: values.is_default ? 'yes' : '' }, { country: 'US' })
    if (result.errors) return addressPage(req, res, values, result.errors, 400)
    res.redirect(`${res.locals.base}/account/addresses`)
  })
  router.post('/account/addresses/:id/default', auth, (req, res) => {
    const address = state(req).addresses.find(address => address.id === req.params.id)
    if (!address) return missing(req, res)
    state(req).addresses.forEach(item => { item.is_default = item.id === address.id })
    res.redirect(`${res.locals.base}/account/addresses`)
  })
  router.post('/account/addresses/:id/delete', auth, (req, res) => {
    if (!deleteAddress(req, req.params.id)) return missing(req, res)
    res.redirect(`${res.locals.base}/account/addresses`)
  })
  router.get(['/orders', '/account/orders'], (req, res) => {
    const orders = privateOrders(req)
    page(req, res, 'My Orders', `<p>${req.store.user ? 'Orders placed with your account.' : 'Guest orders placed on this device. Sign in to view orders for your account.'}</p>${orders.length ? `<div class="sp-order-list">${orders.map(order => `<article class="sp-journey-card"><h2>${link(res.locals.base, `/orders/${order.id}`, order.order_number)}</h2><p>${date(order.created_at)} · ${statusLabel(orderStatus(order))} · ${money(order.totals.total)}</p><p>${order.items.map(item => esc(item.title)).join(' · ')}</p>${link(res.locals.base, `/orders/${order.id}`, 'Order details & available actions →')}</article>`).join('')}</div>` : `<p>No orders for your current account or guest session.</p>${link(res.locals.base, '/search', 'Explore beauty')}`}`)
  })
  function orderPage(req, res, order, errors = [], reason = '', status = 200) {
    const base = res.locals.base, current = orderStatus(order), action = current === 'processing' ? 'cancel' : current === 'delivered' ? 'return' : ''
    page(req, res, `Order ${order.order_number}`, `<p class="sp-status">${statusLabel(current)}</p><p>Placed ${date(order.created_at)} · Standard delivery</p><p>${current === 'processing' ? 'Your order is processing. Tracking information will be available once your order ships.' : current === 'cancelled' ? `Your order has been cancelled.${publicNotice(' No real charge or refund is processed.')}` : current === 'return_requested' ? `We've received your return request.${publicNotice(' No carrier label or refund is issued.')}` : 'Delivery status recorded for this order.'}</p><div class="sp-order-list">${order.items.map(item => `<section class="sp-journey-card"><h2>${esc(item.title)}</h2><p>Quantity ${item.qty} · ${money(item.unit_price)} each</p>${productById(item.sku) ? link(base, `/product/${item.sku}`, 'View product and choose options') : ''}</section>`).join('')}</div><p><strong>Total ${money(order.totals.total)}</strong> · Shipping ${money(order.totals.shipping)}</p><h2>Delivery address</h2><p>${esc(order.shipping_address.line1)}<br>${esc(order.shipping_address.city)}, ${esc(order.shipping_address.state)} ${esc(order.shipping_address.postal_code)}</p><p>${esc(order.payment.brand)} ending in ${esc(order.payment.last4)}</p>${errorsHtml(errors)}${action ? `<h2>${action === 'cancel' ? 'Cancel this order' : 'Request a return'}</h2><form class="sp-form" method="post" action="${base}/orders/${order.id}/action"><input type="hidden" name="action" value="${action}"><label>Reason<textarea name="reason" required maxlength="1000">${esc(reason)}</textarea></label><button>${action === 'cancel' ? 'Cancel order' : 'Request return'}</button></form>` : ''}${current === 'processing' ? '<p>Returns become available after delivery. You may cancel while this order is processing.</p>' : ''}${order.meta.lifecycle?.length ? `<h2>Order activity</h2><ul>${order.meta.lifecycle.map(event => `<li>${statusLabel(event.status)} · ${date(event.created_at)} · ${esc(event.reason)}</li>`).join('')}</ul>` : ''}${req.store.user ? link(base, `/help/contact?order_id=${order.id}`, 'Get help with this order →') : link(base, '/help', 'Visit Customer Service')}`, status)
  }
  router.get(['/orders/:id', '/account/orders/:id'], (req, res) => { const order = privateOrder(req, req.params.id); return order ? orderPage(req, res, order) : missing(req, res) })
  router.post('/orders/:id/action', (req, res) => {
    const order = privateOrder(req, req.params.id)
    if (!order) return missing(req, res)
    const result = requestOrderAction(req, order.id, scalar(req.body.action), scalar(req.body.reason, 1000), 'sephora')
    if (result.error) return orderPage(req, res, order, [result.error], scalar(req.body.reason, 1000), result.status)
    res.redirect(`${res.locals.base}/orders/${order.id}`)
  })
  router.get('/help', (req, res) => {
    const q = scalar(req.query.q), matches = topics.filter(topic => `${topic.title} ${topic.text}`.toLowerCase().includes(q.toLowerCase())), base = res.locals.base
    page(req, res, 'Customer Service', `<p>How can we help with your beauty experience?</p><form class="sp-help-search" action="${base}/help">${input('q', 'Search help', q, 'type="search"')}<button>Search help</button></form><p>${matches.length} help topics${q ? ` for “${esc(q)}”` : ''}</p><div class="sp-journey-grid">${matches.map(topic => `<article class="sp-journey-card" id="${topic.id}"><h2>${link(base, `/help/topic/${topic.id}`, topic.title)}</h2><p>${esc(topic.text)}</p>${topic.notice ? publicNotice(`<p>${esc(topic.notice)}</p>`) : ''}</article>`).join('')}</div>${matches.length ? '' : `<p>No matching topics. Try “shipping”, “return” or “preferences”. ${link(base, '/help', 'Clear search')}</p>`}<div class="sp-inline-actions">${link(base, '/help/contact', 'Create a support request')}${link(base, '/help/cases', 'Your support requests')}</div>`)
  })
  router.get('/help/topic/:id', (req, res) => {
    const topic = topics.find(item => item.id === req.params.id)
    if (!topic) return missing(req, res)
    page(req, res, topic.title, `<p>${esc(topic.text)}</p>${topic.notice ? publicNotice(`<p>${esc(topic.notice)}</p>`) : ''}<div class="sp-inline-actions">${link(res.locals.base, topic.link, topic.cta)}${link(res.locals.base, '/help/contact', 'Still need help?')}${link(res.locals.base, '/help', 'All help topics')}</div>`)
  })
  function contactPage(req, res, values = {}, errors = []) {
    page(req, res, 'Contact Customer Service', `<p>Send us a message and a Beauty Advisor will review it. Do not include payment card details or passwords.</p>${publicNotice('<p>No message is sent to Sephora and no reply is promised.</p>')}${errorsHtml(errors)}<form class="sp-form" method="post" action="${res.locals.base}/help/contact">${select('category', 'Topic', topics.map(topic => [topic.id, topic.title]), values.category || 'shipping', false)}${input('subject', 'Subject', values.subject, 'required maxlength="160"')}${input('email', 'Contact email', values.email || req.store.user.email, 'type="email" required')}<label>Order (optional)<select name="order_id"><option value="">No order reference</option>${privateOrders(req).map(order => `<option value="${order.id}"${values.order_id === order.id ? ' selected' : ''}>${esc(order.order_number)}</option>`).join('')}</select></label><label>Message<textarea name="message" minlength="10" maxlength="3000" required>${esc(values.message || '')}</textarea></label><button>Save support request</button></form>`, errors.length ? 400 : 200)
  }
  router.get('/help/contact', auth, (req, res) => {
    if (req.query.order_id && !privateOrder(req, scalar(req.query.order_id))) return missing(req, res)
    contactPage(req, res, { order_id: scalar(req.query.order_id) })
  })
  router.post('/help/contact', auth, (req, res) => {
    const values = { ...fields(req.body, ['category', 'subject', 'email', 'order_id']), message: scalar(req.body.message, 3000) }, errors = []
    if (!topics.some(topic => topic.id === values.category)) errors.push('Choose a listed support topic.')
    if (Object.values(req.body).some(value => typeof value !== 'string')) errors.push('Enter one value for each field.')
    if (values.order_id && !privateOrder(req, values.order_id)) errors.push('That order is not available in this account.')
    if (errors.length) return contactPage(req, res, values, errors)
    const result = createSupportCase(req, values, 'sephora')
    if (result.errors) return contactPage(req, res, values, result.errors)
    res.redirect(`${res.locals.base}/help/cases/${result.supportCase.id}`)
  })
  router.get('/help/cases', auth, (req, res) => page(req, res, 'Your Support Requests', `<p>Your support requests.</p>${publicNotice('<p>No external messages are sent.</p>')}${state(req).cases.length ? state(req).cases.map(item => `<article class="sp-journey-card"><h2>${link(res.locals.base, `/help/cases/${item.id}`, item.subject)}</h2><p>${date(item.created_at)} · Received</p></article>`).join('') : '<p>No saved requests yet.</p>'}${link(res.locals.base, '/help/contact', 'Create a support request')}`))
  router.get('/help/cases/:id', auth, (req, res) => {
    const item = state(req).cases.find(item => item.id === req.params.id)
    if (!item || (item.order_id && !privateOrder(req, item.order_id))) return missing(req, res)
    page(req, res, 'Support request saved', `<p class="sp-status">Received</p><h2>${esc(item.subject)}</h2><p>Reference ${esc(item.id)} · ${date(item.created_at)}</p><p class="sp-preserve">${esc(item.message)}</p><p>Contact email: ${esc(item.email)}</p>${item.order_id ? link(res.locals.base, `/orders/${item.order_id}`, 'Referenced order') : ''}<p>No email has been sent. A live support response is unavailable.</p>${link(res.locals.base, '/help/cases', 'All support requests')}`)
  })
  function servicesPage(req, res, errors = [], values = {}) {
    const saved = state(req), base = res.locals.base
    page(req, res, 'Services & Events', `<p>Make room for a moment of beauty. Save an interest to revisit when planning your routine.</p><div class="sp-journey-grid sp-services-grid">${services.map(service => `<section class="sp-journey-card">${productPhoto({ 'full-face': 'makeup-brush-set', 'feature-focus': 'eyeshadow', 'beauty-lesson': 'lipstick-rosewood' }[service.id], service.name)}<h2>${service.name}</h2><p>${service.description}</p></section>`).join('')}</div><p>Online booking is currently unavailable. Save your service interests and we'll help you plan your visit.</p>${publicNotice('<p>No real appointment or event booking is made.</p>')}${req.store.user ? `<h2>Save a service interest</h2>${errorsHtml(errors)}<form class="sp-form" method="post" action="${base}/services/interests">${select('service', 'Service interest', services.map(service => [service.id, service.name]), values.service || services[0].id, false)}${select('store', 'Store', sampleStores.map(store => [store.id, store.name]), values.store || saved.preferredStore || sampleStores[0].id, false)}<label>Your ideas (optional)<textarea name="notes" maxlength="1000">${esc(values.notes || '')}</textarea></label><button>Save interest draft</button></form><h2>Your saved interests</h2>${saved.serviceDrafts.length ? saved.serviceDrafts.map(draft => `<article class="sp-journey-card" data-interest="${draft.id}"><h3>${esc(services.find(service => service.id === draft.service)?.name)}</h3><p>${esc(sampleStores.find(store => store.id === draft.store)?.name)} · Saved</p><p class="sp-preserve">${esc(draft.notes)}</p><form method="post" action="${base}/services/interests/${draft.id}/delete"><button class="secondary">Remove draft</button></form></article>`).join('') : '<p>No interests saved yet.</p>'}` : link(base, '/account', 'Sign in to save your service interests')}${link(base, '/stores', 'Choose a preferred store')}`, errors.length ? 400 : 200)
  }
  router.get('/services', (req, res) => servicesPage(req, res))
  router.post('/services/interests', auth, (req, res) => {
    const values = { service: scalar(req.body.service), store: scalar(req.body.store), notes: scalar(req.body.notes, 1000) }, errors = []
    if (!services.some(service => service.id === values.service) || !sampleStores.some(store => store.id === values.store)) errors.push('Choose a listed service and store.')
    if (req.body.notes !== undefined && typeof req.body.notes !== 'string') errors.push('Enter one set of notes.')
    if (state(req).serviceDrafts.length >= 12) errors.push('Remove an interest before saving another.')
    if (errors.length) return servicesPage(req, res, errors, values)
    state(req).serviceDrafts.unshift({ ...values, id: newId('interest'), created_at: new Date().toISOString() })
    res.redirect(`${res.locals.base}/services`)
  })
  router.post('/services/interests/:id/delete', auth, (req, res) => {
    if (!state(req).serviceDrafts.some(draft => draft.id === req.params.id)) return missing(req, res)
    state(req).serviceDrafts = state(req).serviceDrafts.filter(draft => draft.id !== req.params.id)
    res.redirect(`${res.locals.base}/services`)
  })
  router.get('/stores', (req, res) => page(req, res, 'Stores & Delivery', `<p>Choose a store to organize your service interests.${publicNotice(' These fictional locations have no real addresses, opening hours or bookable appointments.')} Standard US shipping is available through checkout; store pickup and live inventory are unavailable.</p><div class="sp-journey-grid">${sampleStores.map(store => `<section class="sp-journey-card"><h2>${store.name}</h2><p>${store.area}</p>${state(req).preferredStore === store.id ? '<p class="sp-status">Your preferred store</p>' : req.store.user ? `<form method="post" action="${res.locals.base}/stores/preferred"><input type="hidden" name="store" value="${store.id}"><button>Select store</button></form>` : link(res.locals.base, '/account', 'Sign in to choose')}</section>`).join('')}</div><div class="sp-inline-actions">${link(res.locals.base, '/services', 'Explore service interests')}${link(res.locals.base, '/location', 'Set delivery ZIP code')}</div>`))
  router.post('/stores/preferred', auth, (req, res) => {
    if (!sampleStores.some(store => store.id === req.body.store)) return page(req, res, 'Choose a store', '<p>Choose a store from the list.</p>', 400)
    state(req).preferredStore = req.body.store
    res.redirect(`${res.locals.base}/stores`)
  })

  const planItems = products.filter(eligibleForReplenishment)
  function planPage(req, res, values = {}, errors = [], editing) {
    const base = res.locals.base, saved = state(req), product = productById(scalar(values.product)) || planItems[0]
    page(req, res, 'Auto-Replenish Plans', `<p>Plan your next refill with a reminder date. <strong>No automatic charge or dispatch.</strong> No stock is reserved or notification scheduled; return here to review your plans and shop when ready.</p>${saved.replenishment.length ? `<div class="sp-order-list">${saved.replenishment.map(plan => `<article class="sp-journey-card" data-plan="${plan.id}"><h2>${esc(plan.title)}</h2><p>${esc(Object.values(plan.options).join(' · '))} · Quantity ${plan.qty}</p><p>Every ${plan.cadence} days · Next reminder ${esc(plan.next_date)} · <strong>${plan.status === 'active' ? 'Active plan' : 'Cancelled plan'}</strong></p>${plan.status === 'active' ? `<div class="sp-inline-actions">${link(base, `/account/replenishment?edit=${plan.id}`, 'Edit plan')}<form method="post" action="${base}/account/replenishment/${plan.id}/cancel"><button class="secondary">Cancel plan</button></form>${link(base, `/product/${plan.product}?${new URLSearchParams(plan.options)}`, 'Review product & buy once')}</div>` : `<p>Cancelled ${date(plan.cancelled_at)}. No purchase was created.</p>`}</article>`).join('')}</div>` : '<p>No refill plans yet.</p>'}<h2>${editing ? 'Edit plan' : 'Create a plan'}</h2>${errorsHtml(errors)}${editing ? '' : `<form class="sp-form" method="get" action="${base}/account/replenishment">${select('product', 'Choose a refill product', planItems.map(item => [item.id, item.title]), product.id, false)}<button class="secondary">Choose product</button></form>`}<form class="sp-form sp-form-grid" method="post" action="${base}/account/replenishment${editing ? `/${editing.id}` : ''}"><input type="hidden" name="product" value="${product.id}"><p>${esc(product.title)}</p>${Object.entries(product.options).map(([label, choices]) => select(`option_${label}`, label, choices, values[`option_${label}`] || values.options?.[label] || product.defaultOptions?.[label], false)).join('')}${input('qty', 'Quantity', values.qty || '1', 'type="number" min="1" max="10" required')}${select('cadence', 'Reminder cadence', [30, 60, 90, 120].map(n => [String(n), `Every ${n} days`]), String(values.cadence || 60), false)}${input('next_date', 'Next reminder date', values.next_date || new Date(Date.now() + 60 * 86400000).toISOString().slice(0, 10), `type="date" min="${today()}" required`)}<button>${editing ? 'Save plan changes' : 'Save plan'}</button>${editing ? link(base, '/account/replenishment', 'Cancel editing') : ''}</form>`, errors.length ? 400 : 200)
  }
  router.get('/account/replenishment', auth, (req, res) => {
    const editing = req.query.edit ? state(req).replenishment.find(plan => plan.id === req.query.edit && plan.status === 'active') : null
    if (req.query.edit && !editing) return missing(req, res)
    if (req.query.product && !eligibleForReplenishment(productById(req.query.product))) return missing(req, res)
    const product = productById(req.query.product) || planItems[0]
    const options = selectionOptions(product, req.query)
    if (!options) return planPage(req, res, { product: product.id }, ['Choose one listed value for each product option.'])
    planPage(req, res, editing || { product: product.id, options }, [], editing)
  })
  function savePlan(req, res) {
    const saved = state(req), editing = req.params.id ? saved.replenishment.find(plan => plan.id === req.params.id && plan.status === 'active') : null
    if (req.params.id && !editing) return missing(req, res)
    const values = { ...fields(req.body, ['product', 'qty', 'cadence', 'next_date']), ...Object.fromEntries(Object.entries(req.body).filter(([key]) => key.startsWith('option_')).map(([key, value]) => [key, scalar(value)])) }
    const product = productById(values.product), errors = []
    if (Object.values(req.body).some(value => typeof value !== 'string')) errors.push('Enter one value for each plan field.')
    if (!eligibleForReplenishment(product)) errors.push('Choose an eligible consumable from the refill list.')
    const options = Object.fromEntries(Object.keys(product?.options || {}).map(key => [key, values[`option_${key}`]])), selected = product && selectedProduct(product, options)
    if (!selected || !stockLimit(selected)) errors.push('Choose an available size and option for your plan.')
    if (Object.keys(values).some(key => key.startsWith('option_') && !Object.hasOwn(product?.options || {}, key.slice(7)))) errors.push('Choose only the listed product options.')
    if (!/^(?:[1-9]|10)$/.test(values.qty) || (selected && Number(values.qty) > stockLimit(selected))) errors.push('Choose a quantity within current availability (maximum 10).')
    if (![30, 60, 90, 120].includes(Number(values.cadence)) || !/^\d+$/.test(values.cadence)) errors.push('Choose a 30, 60, 90 or 120 day cadence.')
    const parsed = new Date(`${values.next_date}T00:00:00Z`), nextTime = parsed.getTime(), max = Date.now() + 366 * 86400000
    if (!/^\d{4}-\d{2}-\d{2}$/.test(values.next_date) || !Number.isFinite(nextTime) || parsed.toISOString().slice(0, 10) !== values.next_date || values.next_date < today() || nextTime > max) errors.push('Choose a real date from today through the next year.')
    if (!editing && saved.replenishment.length >= 20) errors.push('The limit of 20 saved plans has been reached.')
    if (errors.length) return planPage(req, res, values, errors, editing)
    const plan = { id: editing?.id || newId('plan'), product: product.id, title: product.title, options, variant_id: selected.variantId || null, qty: Number(values.qty), cadence: Number(values.cadence), next_date: values.next_date, status: 'active', created_at: editing?.created_at || new Date().toISOString(), updated_at: new Date().toISOString() }
    if (editing) Object.assign(editing, plan)
    else saved.replenishment.unshift(plan)
    res.redirect(`${res.locals.base}/account/replenishment`)
  }
  router.post('/account/replenishment', auth, savePlan)
  router.post('/account/replenishment/:id', auth, savePlan)
  router.post('/account/replenishment/:id/cancel', auth, (req, res) => {
    const plan = state(req).replenishment.find(plan => plan.id === req.params.id)
    if (!plan) return missing(req, res)
    if (plan.status === 'active') Object.assign(plan, { status: 'cancelled', cancelled_at: new Date().toISOString() })
    res.redirect(`${res.locals.base}/account/replenishment`)
  })
}
