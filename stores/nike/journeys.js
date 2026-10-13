import { esc, money } from '../../lib/html.js'
import { retailState, rememberProduct, saveAddress, deleteAddress, ownedOrders, ownedOrder, orderStatus, requestOrderAction, createSupportCase } from '../../lib/retail-state.js'

const clean = (value, max = 240) => typeof value === 'string' ? value.trim().slice(0, max) : ''
const fields = (body, names) => Object.fromEntries(names.map(name => [name, clean(body[name])]))
const structured = (body, names) => names.some(name => body[name] !== undefined && typeof body[name] !== 'string')
const notices = errors => errors.length ? `<div class="error" role="alert"><ul>${errors.map(e => `<li>${esc(e)}</li>`).join('')}</ul></div>` : ''
const input = (name, label, values, required = true, type = 'text') => `<label>${label}<input name="${name}" type="${type}" value="${esc(values[name] || '')}"${required ? ' required' : ''}></label>`
const statusLabel = order => ({ processing: 'Preparing your order', cancelled: 'Cancelled', return_requested: 'Return requested', delivered: 'Delivered' })[orderStatus(order)] || 'Processing'
const sameAccount = (req, order) => !!order && (!order.meta.account_id || order.meta.account_id === req.store.user?.id)
const allowedOrder = (req, id) => { const order = ownedOrder(req, id, 'nike'); return sameAccount(req, order) ? order : null }
const countLabel = (count, one, many = `${one}s`) => `${count} ${count === 1 ? one : many}`
const when = value => new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })

export function nikeOrderEligibility(order, now = Date.now()) {
  const status = orderStatus(order), created = Date.parse(order.created_at)
  const delivered = Date.parse(order.meta.delivered_at || order.meta.lifecycle?.findLast(event => event.status === 'delivered')?.created_at || '')
  return { cancel: status === 'processing' && Number.isFinite(created) && now >= created && now - created <= 30 * 60 * 1000,
    return: status === 'delivered' && Number.isFinite(delivered) && now >= delivered && now - delivered <= 60 * 86400000 }
}

export const nikeHelp = [
  { id: 'shipping', group: 'Delivery', title: 'What are my shipping options?', summary: 'Standard shipping and member shipping thresholds.', text: 'Standard US shipping is free for members on orders of $50 or more and for guests on orders of $75 or more. Below these amounts, standard shipping is $5 for members and $8 for guests. Your bag shows the charge before checkout. Express delivery and store pickup are not offered in this shopping experience.', route: '/cart', action: 'Review your bag' },
  { id: 'order-status', group: 'Orders', title: 'How do I check my order?', summary: 'Find member orders or look up a guest order.', text: 'Sign in to see orders placed with your account in this browser. Guest shoppers can enter their order number and checkout email. Orders remain in preparing status until a supported action changes them. Carrier tracking and delivery updates are unavailable here.', route: '/orders', action: 'View orders' },
  { id: 'cancel', group: 'Orders', title: 'Can I change or cancel my order?', summary: 'Cancel a processing order within 30 minutes.', text: 'You can request cancellation within 30 minutes of placing an order while it is still processing. You cannot edit an order after checkout. Open the order, choose a reason and confirm cancellation. A cancellation updates the saved order status; no payment refund is processed here.', route: '/orders', action: 'Manage an order' },
  { id: 'returns', group: 'Returns', title: 'How do returns work?', summary: 'Return timing, order eligibility and next steps.', text: 'The public Nike policy generally allows returns within 60 days, with exceptions. This experience accepts a return request only when an order has a recorded delivery date within 60 days. Newly placed orders are not marked delivered. A request does not create a shipping label, carrier collection or refund. For product or eligibility questions, save a support request.', route: '/help/contact', action: 'Get return help' },
  { id: 'size-fit', group: 'Products', title: 'How do I choose my size?', summary: 'Fit guidance, available sizes and color choices.', text: 'Open Size & Fit on a product page for that style’s size system and approximate measurements. Select the color and an available size before adding it to your bag. Kids and adult size ranges differ. A crossed-out option cannot be purchased.', route: '/category/shoes', action: 'Explore shoes' },
  { id: 'membership', group: 'Membership', title: 'What comes with membership?', summary: 'Favorites, addresses and qualifying shipping.', text: 'Create an account to keep an address book, preferences and member orders in this browser. Members receive the listed shipping threshold; membership does not add a product discount. SNKRS, Nike By You, Run Club and member events are separate services and are not connected here.', route: '/membership', action: 'Explore membership' },
  { id: 'payment', group: 'Orders', title: 'How is payment handled?', summary: 'Review totals and payment details.', text: 'The checkout accepts card details for a simulated order and retains only a masked payment summary. No charge is made. If your bag or account changes after reviewing checkout, review the updated total and enter payment details again.', route: '/cart', action: 'Go to bag' },
  { id: 'stores', group: 'Stores', title: 'Can I choose a preferred store?', summary: 'Browse stores and save a preference.', text: 'Search the example store directory by city, ZIP code or store type. Your preferred store is remembered with your current account or guest visit. Store pickup and live store inventory are unavailable; choosing a store does not change standard shipping.', route: '/stores', action: 'Find a store' },
]
export const nikeStores = [
  { id: 'austin-downtown', name: 'Nike Austin Downtown', city: 'Austin', state: 'TX', zip: '78701', address: '120 Example Avenue', type: 'Nike Store', hours: 'Monday–Saturday 10 AM–8 PM · Sunday 11 AM–6 PM', services: ['Footwear and apparel', 'Running and training selection', 'Accessible entrance'] },
  { id: 'portland-central', name: 'Nike Portland Central', city: 'Portland', state: 'OR', zip: '97205', address: '240 Sample Street', type: 'Nike Store', hours: 'Monday–Saturday 10 AM–7 PM · Sunday 11 AM–6 PM', services: ['Footwear and apparel', 'Basketball and lifestyle selection', 'Accessible entrance'] },
  { id: 'los-angeles-west', name: 'Nike Los Angeles West', city: 'Los Angeles', state: 'CA', zip: '90025', address: '360 Example Boulevard', type: 'Nike Store', hours: 'Monday–Saturday 10 AM–8 PM · Sunday 11 AM–7 PM', services: ['Women, men and kids', 'Training and tennis selection', 'Accessible entrance'] },
  { id: 'orlando-value', name: 'Nike Orlando Value', city: 'Orlando', state: 'FL', zip: '32819', address: '480 Sample Way', type: 'Nike Value Store', hours: 'Monday–Saturday 10 AM–9 PM · Sunday 11 AM–7 PM', services: ['Footwear and apparel', 'Seasonal value selection', 'Accessible entrance'] },
]

export function nikeJourneys(router, { render, productById, artwork }) {
  // req.store.favorites remains the catalog contract; switch its reference to the
  // current owner's array before every route, including shared sign-in redirects.
  router.use((req, res, next) => {
    const state = retailState(req)
    if (!req.store.nikeFavoritesMigrated) {
      state.favorites = [...new Set([...(state.favorites || []), ...(req.store.favorites || [])])].filter(id => productById(id))
      req.store.nikeFavoritesMigrated = true
    }
    req.store.favorites = state.favorites
    next()
  })
  const page = (req, res, title, body, status = 200) => render(req, res, title, `<section class="nk-service"><div class="nk-service-heading"><p class="eyebrow">NIKE · YOUR EVERYDAY</p><h1>${esc(title)}</h1></div>${body}</section>`, status)
  const missing = (req, res, thing = 'Page') => page(req, res, `${thing} not found`, `<p>We couldn’t find that ${thing.toLowerCase()} for this visit.</p><a class="button" href="${res.locals.base}/account">My account</a>`, 404)
  const member = (req, res, next) => req.store.user ? next() : page(req, res, 'Sign in to continue', `<p>Sign in to manage your member details.</p><a class="button" href="${res.locals.base}/account">Sign in or join us</a>`, 401)
  const nav = base => `<nav class="nk-member-nav" aria-label="Member pages">${[['/account', 'Overview'], ['/account/profile', 'Profile & Preferences'], ['/account/addresses', 'Addresses'], ['/favorites', 'Favorites'], ['/orders', 'Orders'], ['/help/cases', 'Support Requests'], ['/stores', 'Stores']].map(([url, label]) => `<a href="${base}${url}">${label}</a>`).join('')}</nav>`
  const tiles = (base, data) => `<div class="nk-service-grid">${data.map(([url, title, text]) => `<a class="nk-service-card" href="${base}${url}"><h2>${title}</h2><p>${text}</p><span>Explore →</span></a>`).join('')}</div>`
  const savedCards = (req, res, list, remove = false) => `<div class="nk-saved-grid">${list.map(id => productById(id)).filter(Boolean).map(p => `<article><a href="${res.locals.base}/product/${p.id}">${artwork(p)}<h2>${esc(p.title)}</h2></a><p>${esc(p.type)} · ${money(p.price)}</p><a class="button secondary" href="${res.locals.base}/product/${p.id}">${Object.keys(p.options || {}).length ? 'Choose options' : 'View product'}</a>${remove ? `<form action="${res.locals.base}/favorites" method="post"><input type="hidden" name="id" value="${p.id}"><input type="hidden" name="return_to" value="favorites"><input type="hidden" name="action" value="remove"><button class="nk-text-button">Remove from favorites</button></form>` : ''}</article>`).join('')}</div>`

  router.get('/membership', (req, res) => page(req, res, 'More of What Moves You', `<p class="nk-service-intro">A little support for your everyday movement. Membership is free.</p><a class="button" href="${res.locals.base}/account">${req.store.user ? 'Your member profile' : 'Join Us / Sign In'}</a>${tiles(res.locals.base, [['/favorites', 'Your Favorites', 'Keep the styles you love close.'], ['/account/addresses', 'Ready for Checkout', 'Save addresses for your next order.'], ['/help/shipping', 'Member Shipping', 'Free standard shipping on orders $50+. $5 below $50.'], ['/account/profile', 'Make It Yours', 'Choose your sports and shopping preferences.']])}<section class="nk-service-panel"><h2>More from Nike</h2><p>SNKRS, Nike By You, Nike Run Club and member experiences are separate Nike services. They are not connected to this account.</p></section>`))
  router.get('/account', (req, res, next) => {
    if (!req.store.user) return next()
    const state = retailState(req), base = res.locals.base, profile = state.profile || req.store.user
    page(req, res, `Welcome, ${profile.first_name || req.store.user.first_name}`, `${nav(base)}<p>${esc(req.store.user.email)}</p>${req.query.saved === 'profile' ? '<p class="nk-success" role="status">Your profile and preferences are saved.</p>' : ''}${tiles(base, [['/orders', 'Your Orders', `${countLabel(ownedOrders(req, 'nike').filter(o => o.meta.account_id === req.store.user.id).length, 'member order')} placed in this browser.`], ['/favorites', 'Favorites', `${countLabel(state.favorites.length, 'saved style')}. Find your next favorite.`], ['/account/addresses', 'Address Book', `${countLabel(state.addresses.length, 'saved address', 'saved addresses')}. Make your next checkout easier.`], ['/account/profile', 'Profile & Preferences', 'Your name, sports and shopping preferences.'], ['/help/cases', 'Support Requests', `${countLabel(state.cases.length, 'request')} saved for this account.`], ['/stores', 'Preferred Store', nikeStores.find(s => s.id === state.preferredStore)?.name || 'Find a store near you.']])}<form action="${base}/logout" method="post"><button class="secondary">Sign out</button></form>`)
  })
  const sports = ['Running', 'Training', 'Basketball', 'Soccer', 'Tennis', 'Swimming']
  const departments = ['All', 'Men', 'Women', 'Kids']
  function profilePage(req, res, values, errors = [], status = 200) {
    const base = res.locals.base
    page(req, res, 'Profile & Preferences', `${nav(base)}${notices(errors)}<form class="nk-service-form" action="${base}/account/profile" method="post">${input('first_name', 'First name', values)}${input('last_name', 'Last name', values)}${input('phone', 'Phone (optional)', values, false, 'tel')}<p>Email: ${esc(req.store.user.email)}. Email and password changes are not available here.</p><label>Shopping preference<select name="department">${departments.map(d => `<option${values.department === d ? ' selected' : ''}>${d}</option>`).join('')}</select></label><fieldset><legend>Your sports</legend>${sports.map(s => `<label class="nk-check"><input type="checkbox" name="sports" value="${s}"${(values.sports || []).includes(s) ? ' checked' : ''}>${s}</label>`).join('')}</fieldset><p>These preferences are saved for your account in this browser. No emails or notifications are sent.</p><button>Save profile</button></form>` , status)
  }
  router.get('/account/profile', member, (req, res) => profilePage(req, res, { ...req.store.user, ...retailState(req).profile, ...retailState(req).preferences }))
  router.post('/account/profile', member, (req, res) => {
    const values = { ...fields(req.body, ['first_name', 'last_name', 'phone', 'department']), sports: Array.isArray(req.body.sports) ? req.body.sports.map(s => clean(s)) : clean(req.body.sports) ? [clean(req.body.sports)] : [] }
    const errors = []
    if (structured(req.body, ['first_name', 'last_name', 'phone', 'department']) || (req.body.sports !== undefined && typeof req.body.sports !== 'string' && (!Array.isArray(req.body.sports) || req.body.sports.some(s => typeof s !== 'string')))) errors.push('Use one text value for each profile field and choose the listed sports.')
    if (!values.first_name || !values.last_name) errors.push('Enter your first and last name.')
    if (values.phone && !/^[+\d\s().-]{7,25}$/.test(values.phone)) errors.push('Enter a valid phone number.')
    if (!departments.includes(values.department) || values.sports.some(s => !sports.includes(s))) errors.push('Choose an available shopping preference and sport.')
    if (errors.length) return profilePage(req, res, values, errors, 400)
    const state = retailState(req)
    state.profile = fields(values, ['first_name', 'last_name', 'phone'])
    state.preferences = { department: values.department, sports: [...new Set(values.sports)] }
    res.redirect(`${res.locals.base}/account?saved=profile`)
  })
  function addressForm(req, res, values = {}, errors = [], status = 200) {
    const base = res.locals.base
    page(req, res, values.id ? 'Edit Address' : 'Add Address', `${nav(base)}${notices(errors)}<form class="nk-service-form" method="post" action="${base}/account/addresses"><input type="hidden" name="id" value="${esc(values.id || '')}">${input('label', 'Address label (optional)', values, false)}${input('name', 'Recipient name', values)}${input('phone', 'Phone (optional)', values, false, 'tel')}${input('line1', 'Street address', values)}${input('line2', 'Apartment, suite, etc. (optional)', values, false)}${input('city', 'City', values)}${input('state', 'State (two-letter code)', values)}${input('postal_code', 'ZIP code', values)}<p>United States</p><label class="nk-check"><input type="checkbox" name="is_default" value="yes"${values.is_default ? ' checked' : ''}>Use as my default address</label><button>Save address</button><a href="${base}/account/addresses">Back to addresses</a></form>`, status)
  }
  router.get('/account/addresses', member, (req, res) => {
    const base = res.locals.base, addresses = retailState(req).addresses
    page(req, res, 'Address Book', `${nav(base)}<p>Your default address fills the delivery fields at checkout. You can review and change them before ordering.</p><a class="button" href="${base}/account/addresses/new">Add address</a><div class="nk-service-grid">${addresses.map(a => `<article class="nk-service-card"><h2>${esc(a.label || a.name)}</h2>${a.is_default ? '<p class="nk-tag">Default address</p>' : ''}<p>${esc(a.name)}<br>${esc(a.line1)}${a.line2 ? `<br>${esc(a.line2)}` : ''}<br>${esc(a.city)}, ${esc(a.state)} ${esc(a.postal_code)}</p><a href="${base}/account/addresses/${a.id}/edit">Edit address</a><div class="nk-actions">${!a.is_default ? `<form action="${base}/account/addresses/${a.id}/default" method="post"><button class="secondary">Make default</button></form>` : ''}<form action="${base}/account/addresses/${a.id}/delete" method="post"><button class="nk-text-button">Delete address</button></form></div></article>`).join('')}</div>${addresses.length ? `<a href="${base}/cart">Return to your bag</a>` : '<p>No saved addresses yet.</p>'}`)
  })
  router.get('/account/addresses/new', member, (req, res) => addressForm(req, res, { name: [retailState(req).profile?.first_name || req.store.user.first_name, retailState(req).profile?.last_name || req.store.user.last_name].join(' ') }))
  router.get('/account/addresses/:id/edit', member, (req, res) => {
    const address = retailState(req).addresses.find(a => a.id === req.params.id)
    return address ? addressForm(req, res, address) : missing(req, res, 'Address')
  })
  router.post('/account/addresses', member, (req, res) => {
    const values = { ...fields(req.body, ['id', 'label', 'name', 'phone', 'line1', 'line2', 'city', 'state', 'postal_code']), is_default: req.body.is_default === 'yes' }
    if (structured(req.body, ['id', 'label', 'name', 'phone', 'line1', 'line2', 'city', 'state', 'postal_code', 'is_default'])) return addressForm(req, res, values, ['Use one text value for each address field.'], 400)
    if (values.id && !retailState(req).addresses.some(a => a.id === values.id)) return missing(req, res, 'Address')
    if (!/^[A-Z]{2}$/i.test(values.state)) return addressForm(req, res, values, ['Enter a two-letter state code.'], 400)
    const result = saveAddress(req, { ...values, state: values.state.toUpperCase(), is_default: values.is_default ? 'yes' : '' }, { country: 'US' })
    if (result.errors) return addressForm(req, res, values, result.errors, 400)
    res.redirect(`${res.locals.base}/account/addresses`)
  })
  router.post('/account/addresses/:id/default', member, (req, res) => {
    const state = retailState(req), address = state.addresses.find(a => a.id === req.params.id)
    if (!address) return missing(req, res, 'Address')
    state.addresses.forEach(a => { a.is_default = a === address })
    res.redirect(`${res.locals.base}/account/addresses`)
  })
  router.post('/account/addresses/:id/delete', member, (req, res) => {
    if (!deleteAddress(req, req.params.id)) return missing(req, res, 'Address')
    res.redirect(`${res.locals.base}/account/addresses`)
  })

  router.get('/product/:id', (req, res, next) => { if (productById(req.params.id)) rememberProduct(req, req.params.id); next() })
  router.get('/favorites', (req, res) => page(req, res, 'Favorites', `<p>Keep your favorite styles in one place.${req.store.user ? '' : ' Your guest list stays with this visit; sign in to use your separate member list.'}</p><div class="nk-pills"><a href="${res.locals.base}/recent">Recently Viewed</a><a href="${res.locals.base}/search">Discover More</a></div>${req.store.favorites.length ? savedCards(req, res, req.store.favorites, true) : '<section class="nk-service-panel"><h2>Your next favorite is waiting</h2><p>Tap Favorite on a product page to save it here.</p></section>'}`))
  router.post('/favorites', (req, res) => {
    const product = productById(req.body.id)
    if (!product) return missing(req, res, 'Product')
    if (req.body.action && req.body.action !== 'remove') return page(req, res, 'Choose an action', '<p>Choose a supported favorites action.</p>', 400)
    const options = {}
    if (structured(req.body, ['Color', 'Size', 'view', 'return_to'])) return page(req, res, 'Check your selection', '<p>Choose one color and size before saving this style.</p>', 400)
    const color = clean(req.body.Color), size = clean(req.body.Size), view = clean(req.body.view)
    if ((color && !(product.options.Color || [product.colorName]).includes(color)) || (size && !product.options.Size?.includes(size)) || (view && !/^\d+$/.test(view))) return page(req, res, 'Check your selection', '<p>Choose an available color and size before saving this style.</p>', 400)
    if (color) options.Color = color
    if (size) options.Size = size
    if (view) options.view = view
    const selection = new URLSearchParams(options).toString()
    const state = retailState(req), exists = state.favorites.includes(product.id)
    state.favorites = exists || req.body.action === 'remove' ? state.favorites.filter(id => id !== product.id) : [...state.favorites, product.id].slice(-100)
    req.store.favorites = state.favorites
    res.redirect(`${res.locals.base}${req.body.return_to === 'favorites' ? '/favorites' : `/product/${product.id}${selection ? '?' + selection : ''}`}`)
  })
  router.get('/recent', (req, res) => page(req, res, 'Recently Viewed', `<p>Pick up where you left off.</p>${retailState(req).recent.length ? `${savedCards(req, res, retailState(req).recent)}<form action="${res.locals.base}/recent/clear" method="post"><button class="secondary">Clear recently viewed</button></form>` : `<p>No recently viewed styles yet.</p><a class="button" href="${res.locals.base}/search">Explore Nike</a>`}`))
  router.post('/recent/clear', (req, res) => { retailState(req).recent = []; res.redirect(`${res.locals.base}/recent`) })

  function lookup(req, res, values = {}, errors = [], status = 200) {
    page(req, res, 'Find a Guest Order', `${notices(errors)}<p>Enter the order number and email used at checkout. Guest lookup can find orders placed during this browser visit.</p><form class="nk-service-form" action="${res.locals.base}/orders/guest" method="post">${input('order_number', 'Order number', values)}${input('email', 'Checkout email', values, true, 'email')}<button>Find order</button></form><p><a href="${res.locals.base}/account">Sign in for member orders</a></p>`, status)
  }
  router.get('/orders/guest', (req, res) => lookup(req, res))
  router.post('/orders/guest', (req, res) => {
    const values = fields(req.body, ['order_number', 'email'])
    const order = ownedOrders(req, 'nike').find(o => !o.meta.account_id && o.order_number.toLowerCase() === values.order_number.toLowerCase() && o.customer.email.toLowerCase() === values.email.toLowerCase())
    if (!order) return lookup(req, res, values, ['We could not find a matching guest order from this visit. Check your order number and email.'], 404)
    res.redirect(`${res.locals.base}/orders/${order.id}`)
  })
  router.get('/orders', (req, res) => {
    const base = res.locals.base
    if (!req.store.user) return page(req, res, 'Your Orders', `<p>Sign in to see member orders, or look up an order placed as a guest.</p><div class="nk-actions"><a class="button" href="${base}/account">Sign in</a><a class="button secondary" href="${base}/orders/guest">Find a guest order</a></div>`)
    const orders = ownedOrders(req, 'nike').filter(o => o.meta.account_id === req.store.user.id).reverse()
    page(req, res, 'Your Orders', `${nav(base)}${orders.length ? orders.map(o => `<article class="nk-order-row"><div><h2>${esc(o.order_number)}</h2><p>${when(o.created_at)} · ${statusLabel(o)} · ${money(o.totals.total)}</p><p>${esc(o.items.map(i => i.title).join(', '))}</p></div><a class="button secondary" href="${base}/orders/${o.id}">View or Manage</a></article>`).join('') : '<p>No member orders placed in this browser yet.</p>'}<a href="${base}/orders/guest">Find an order placed as a guest</a>`)
  })
  function orderPage(req, res, order, errors = [], values = {}, status = 200) {
    const base = res.locals.base, eligibility = nikeOrderEligibility(order), lifecycle = order.meta.lifecycle || []
    page(req, res, `Order ${order.order_number}`, `${notices(errors)}<div class="nk-pills"><a href="${base}/orders">All Orders</a><a href="${base}/help/contact?order_id=${order.id}">Get Order Help</a></div><section class="nk-service-panel"><h2>${statusLabel(order)}</h2><p>Placed ${when(order.created_at)} · ${esc(order.customer.email)}</p><p>Carrier tracking and delivery estimates are unavailable for this order.</p></section><div class="nk-order-layout"><section><h2>Your Items</h2>${order.items.map(i => `<article class="nk-order-row"><div><h3>${esc(i.title)}</h3><p>Quantity ${i.qty}</p></div><strong>${money(i.qty * i.unit_price)}</strong></article>`).join('')}<h2>Order Activity</h2><ol class="nk-timeline"><li>Order placed · ${when(order.created_at)}</li>${lifecycle.map(e => `<li>${esc(({ cancelled: 'Cancellation recorded', return_requested: 'Return request received', delivered: 'Delivery recorded' })[e.status] || e.status)} · ${when(e.created_at)}${e.reason ? `<p>${esc(e.reason)}</p>` : ''}</li>`).join('')}</ol></section><aside class="nk-service-panel"><h2>Order Summary</h2><p>Subtotal ${money(order.totals.subtotal)}</p><p>Standard shipping ${money(order.totals.shipping)}</p><p><strong>Total ${money(order.totals.total)}</strong></p><p>Paid with ${esc(order.payment.brand)} ending in ${esc(order.payment.last4)}</p><h3>Delivery Address</h3><p>${esc(order.customer.first_name)} ${esc(order.customer.last_name)}<br>${esc(order.shipping_address.line1)}<br>${esc(order.shipping_address.city)}, ${esc(order.shipping_address.state)} ${esc(order.shipping_address.postal_code)}</p></aside></div><section class="nk-service-panel"><h2>Manage Your Order</h2>${eligibility.cancel || eligibility.return ? `<form class="nk-service-form" action="${base}/orders/${order.id}/action" method="post"><input type="hidden" name="action" value="${eligibility.cancel ? 'cancel' : 'return'}"><label>Reason<textarea name="reason" minlength="3" maxlength="1000" required>${esc(values.reason || '')}</textarea></label><p>${eligibility.cancel ? 'Cancellation is available for 30 minutes after checkout. Confirming updates this order to cancelled.' : 'Send a return request for this delivered order. No return label or refund is created.'}</p><button>${eligibility.cancel ? 'Confirm cancellation' : 'Request a return'}</button></form>` : `<p>${orderStatus(order) === 'cancelled' ? 'This order has been cancelled. No refund transaction is processed here.' : orderStatus(order) === 'return_requested' ? 'Your return request has been saved. No carrier label or refund is generated.' : 'Cancellation is available for processing orders within 30 minutes. Returns require a recorded delivery within the past 60 days.'}</p>`}</section>`, status)
  }
  router.get('/orders/:id', (req, res) => { const order = allowedOrder(req, req.params.id); return order ? orderPage(req, res, order) : missing(req, res, 'Order') })
  router.post('/orders/:id/action', (req, res) => {
    const order = allowedOrder(req, req.params.id)
    if (!order) return missing(req, res, 'Order')
    const values = { action: clean(req.body.action), reason: clean(req.body.reason, 1000) }, eligibility = nikeOrderEligibility(order)
    if (!['cancel', 'return'].includes(values.action) || !eligibility[values.action]) return orderPage(req, res, order, ['This order is not eligible for that action. Check the cancellation or return window below.'], values, 400)
    if (values.reason.length < 3) return orderPage(req, res, order, ['Enter a reason of at least 3 characters.'], values, 400)
    const result = requestOrderAction(req, order.id, values.action, values.reason, 'nike')
    if (result.error) return orderPage(req, res, order, [result.error], values, result.status)
    res.redirect(`${res.locals.base}/orders/${order.id}`)
  })

  router.get('/help', (req, res) => {
    const base = res.locals.base, q = clean(req.query.q, 120), words = q.toLowerCase().split(/\s+/).filter(Boolean)
    const articles = nikeHelp.filter(a => words.every(w => `${a.title} ${a.summary} ${a.text} ${a.group}`.toLowerCase().includes(w)))
    page(req, res, 'Get Help', `<p class="nk-service-intro">What can we help you with?</p><form class="nk-help-search" action="${base}/help"><label class="sr-only" for="nike-help-search">Search help</label><input id="nike-help-search" name="q" type="search" value="${esc(q)}" placeholder="Shipping, orders, returns…"><button>Search help</button></form><h2>${q ? `${articles.length} results for “${esc(q)}”` : 'Quick Assists'}</h2><div class="nk-service-grid">${articles.map(a => `<a class="nk-service-card" id="${a.id}" href="${base}/help/${a.id}"><p class="eyebrow">${a.group}</p><h2>${a.title}</h2><p>${a.summary}</p></a>`).join('')}</div>${articles.length ? '' : '<p>Try fewer words, or save a request below.</p>'}<div class="nk-actions"><a class="button" href="${base}/help/contact">Contact Us</a><a class="button secondary" href="${base}/help/cases">Your Support Requests</a></div>`)
  })
  const categories = ['Orders', 'Delivery', 'Returns', 'Products & Sizing', 'Membership', 'Stores']
  function contactPage(req, res, values = {}, errors = [], status = 200) {
    const base = res.locals.base
    page(req, res, 'Contact Us', `${notices(errors)}<p>Tell us what you need help with. This saves a support request for your current account or guest visit; no message is sent to Nike and no agent reply is generated.</p><form class="nk-service-form" action="${base}/help/contact" method="post"><label>Topic<select name="category" required><option value="">Choose a topic</option>${categories.map(c => `<option${values.category === c ? ' selected' : ''}>${c}</option>`).join('')}</select></label>${input('email', 'Email address', values, true, 'email')}${input('order_id', 'Order number or ID (optional)', values, false)}${input('subject', 'Subject', values)}<label>Message<textarea name="message" minlength="10" maxlength="3000" required>${esc(values.message || '')}</textarea></label><button>Save support request</button></form><p><a href="${base}/help/cases">View saved requests</a></p>`, status)
  }
  router.get('/help/contact', (req, res) => contactPage(req, res, { email: req.store.user?.email || '', order_id: clean(req.query.order_id) }))
  router.post('/help/contact', (req, res) => {
    const values = { ...fields(req.body, ['category', 'email', 'order_id', 'subject']), message: clean(req.body.message, 3000) }, errors = []
    if (structured(req.body, ['category', 'email', 'order_id', 'subject', 'message'])) errors.push('Use one text value for each support request field.')
    if (!categories.includes(values.category)) errors.push('Choose an available topic.')
    if (values.order_id && !allowedOrder(req, values.order_id)) errors.push('Choose an order belonging to your current account or guest visit.')
    if (errors.length) return contactPage(req, res, values, errors, 400)
    const result = createSupportCase(req, values, 'nike')
    if (result.errors) return contactPage(req, res, values, result.errors, 400)
    res.redirect(`${res.locals.base}/help/cases/${result.supportCase.id}`)
  })
  router.get('/help/cases', (req, res) => page(req, res, 'Your Support Requests', `<p>Requests saved for ${req.store.user ? 'your current account in this browser' : 'this guest visit'}.</p><a class="button" href="${res.locals.base}/help/contact">New support request</a>${retailState(req).cases.length ? retailState(req).cases.map(c => `<article class="nk-order-row"><div><h2><a href="${res.locals.base}/help/cases/${c.id}">${esc(c.subject)}</a></h2><p>${esc(c.category)} · Received · ${when(c.created_at)}</p></div></article>`).join('') : '<p>You have no saved requests.</p>'}`))
  router.get('/help/cases/:id', (req, res) => {
    const c = retailState(req).cases.find(item => item.id === req.params.id)
    if (!c) return missing(req, res, 'Request')
    page(req, res, 'Support Request Saved', `<section class="nk-service-panel"><p class="nk-tag">Received</p><h2>${esc(c.subject)}</h2><p>Reference: ${esc(c.id)} · ${when(c.created_at)}</p><p>${esc(c.category)} · ${esc(c.email)}</p><p class="nk-preserve-lines">${esc(c.message)}</p>${c.order_id ? `<p>Order: ${esc(c.order_id)}</p>` : ''}<p>Your request is saved here. No external support team has been contacted.</p></section><a class="button secondary" href="${res.locals.base}/help/cases">All support requests</a>`)
  })
  router.get('/help/:topic', (req, res) => {
    const a = nikeHelp.find(item => item.id === req.params.topic)
    if (!a) return missing(req, res)
    page(req, res, a.title, `<div class="nk-article"><p class="eyebrow">${a.group}</p><p>${a.text}</p><a class="button" href="${res.locals.base}${a.route}">${a.action}</a><p><a href="${res.locals.base}/help">All Help Topics</a> · <a href="${res.locals.base}/help/contact">Contact Us</a></p></div>`)
  })

  const storeNote = '<p class="nk-muted">Example store directory: names, addresses and hours are sample location data. Pickup, directions and live store inventory are not available.</p>'
  router.get('/stores', (req, res) => {
    const base = res.locals.base, q = clean(req.query.q, 100), type = clean(req.query.type), state = retailState(req)
    const list = nikeStores.filter(s => (!q || `${s.name} ${s.city} ${s.state} ${s.zip}`.toLowerCase().includes(q.toLowerCase())) && (!type || s.type === type))
    page(req, res, 'Find a Nike Store', `${storeNote}<form class="nk-store-search" action="${base}/stores"><label>City or ZIP code<input name="q" value="${esc(q)}" placeholder="Austin or 78701"></label><label>Store type<select name="type">${[['', 'All Stores'], ['Nike Store', 'Nike Stores'], ['Nike Value Store', 'Nike Value Stores']].map(([v, text]) => `<option value="${v}"${type === v ? ' selected' : ''}>${text}</option>`).join('')}</select></label><button>Find stores</button></form><p>${countLabel(list.length, 'store')} found${q ? ` for “${esc(q)}”` : ''}</p><div class="nk-service-grid">${list.map(s => `<article class="nk-service-card"><p class="eyebrow">${s.type}</p><h2><a href="${base}/stores/${s.id}">${s.name}</a></h2>${state.preferredStore === s.id ? '<p class="nk-tag">Your preferred store</p>' : ''}<p>${s.address}<br>${s.city}, ${s.state} ${s.zip}</p><p>${s.hours}</p><a href="${base}/stores/${s.id}">Store details →</a></article>`).join('')}</div>${list.length ? '' : `<p>Try a different city or clear the filters.</p><a href="${base}/stores">Show all stores</a>`}`)
  })
  router.get('/stores/:id', (req, res) => {
    const s = nikeStores.find(item => item.id === req.params.id), base = res.locals.base
    if (!s) return missing(req, res, 'Store')
    const preferred = retailState(req).preferredStore === s.id
    page(req, res, s.name, `${storeNote}<div class="nk-order-layout"><section class="nk-service-panel"><p class="eyebrow">${s.type}</p><h2>Visit Information</h2><p>${s.address}<br>${s.city}, ${s.state} ${s.zip}</p><h3>Hours</h3><p>${s.hours}</p><h3>In Store</h3><ul>${s.services.map(service => `<li>${service}</li>`).join('')}</ul></section><section class="nk-service-panel"><h2>${preferred ? 'Your Preferred Store' : 'Make It Your Store'}</h2><p>Save this store for ${req.store.user ? 'your account' : 'this guest visit'}. Your bag will continue to use standard shipping.</p><form action="${base}/stores/${s.id}/preferred" method="post"><button name="action" value="${preferred ? 'remove' : 'save'}">${preferred ? 'Remove preferred store' : 'Make this my store'}</button></form><p><a href="${base}/stores">Find another store</a></p><a href="${base}/search">Shop Nike</a></section></div>`)
  })
  router.post('/stores/:id/preferred', (req, res) => {
    if (!nikeStores.some(s => s.id === req.params.id)) return missing(req, res, 'Store')
    if (!['save', 'remove'].includes(req.body.action)) return page(req, res, 'Choose an action', '<p>Choose whether to save or remove this store.</p>', 400)
    const state = retailState(req)
    if (req.body.action === 'save') state.preferredStore = req.params.id
    else if (state.preferredStore === req.params.id) delete state.preferredStore
    res.redirect(`${res.locals.base}/stores/${req.params.id}`)
  })
}
