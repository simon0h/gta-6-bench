import { randomBytes } from 'node:crypto'
import { esc, money, publicNotice } from '../../lib/html.js'
import { retailState, saveAddress, deleteAddress, ownedOrders, ownedOrder, orderStatus, requestOrderAction, createSupportCase } from '../../lib/retail-state.js'
import { byAsin, productPath, signinPath, STATES } from './data.js'
import { productArt } from './art.js'

const clean = (s, max = 240) => typeof s === 'string' ? s.trim().slice(0, max) : ''
const uid = prefix => `${prefix}-${randomBytes(6).toString('hex')}`
const ACCOUNT = '/gp/css/homepage.html', LISTS = '/hz/wishlist/ls', ORDERS = '/gp/css/order-history'
const notice = message => message ? `<div class="az-notice" role="status">${esc(message)}</div>` : ''
const errors = messages => messages?.length ? `<div class="az-alert" role="alert"><b>There was a problem</b><ul>${messages.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>` : ''
const btn = (label, outline = false) => `<button class="az-btn${outline ? ' az-btn-outline' : ''}" type="submit">${esc(label)}</button>`
const input = (label, name, value = '', options = '') => `<label>${esc(label)}<input name="${name}" value="${esc(value)}" ${options}></label>`
const date = value => new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
const orderPath = order => `/gp/your-account/order-details?orderID=${encodeURIComponent(order.id)}`
const statusLabel = order => ({ processing: 'Not yet shipped', cancelled: 'Canceled', return_requested: 'Return requested', delivered: 'Delivered' }[orderStatus(order)] || 'Processing')
const addressText = a => `<address><b>${esc(a.name || [a.first_name, a.last_name].filter(Boolean).join(' '))}</b><br>${esc(a.line1)}${a.line2 ? `<br>${esc(a.line2)}` : ''}<br>${esc(a.city)}, ${esc(a.state)} ${esc(a.postal_code)}<br>United States${a.phone ? `<br>Phone: ${esc(a.phone)}` : ''}</address>`
const page = (base, title, body, crumb = '') => `<div class="az-journey">${title === 'Your Account' ? '' : `<nav class="az-crumbs"><a href="${base}${ACCOUNT}">Your Account</a>${crumb ? ` &rsaquo; ${crumb}` : ''} &rsaquo; ${esc(title)}</nav>`}<h1>${esc(title)}</h1>${body}</div>`
function state(req) {
  const s = retailState(req)
  s.amazonLists ||= [{ id: 'default', name: 'Shopping List', items: [] }]
  return s
}
export function listsFor(req) { return req.store.user ? state(req).amazonLists : [] }
export function savedInList(req, asin) { return listsFor(req).some(list => list.items.some(item => item.asin === asin)) }
function addToList(req, asin, listId) {
  const lists = state(req).amazonLists
  if (!lists.length) lists.push({ id: 'default', name: 'Shopping List', items: [] })
  const list = listId ? lists.find(l => l.id === listId) : lists[0]
  if (!list || !byAsin(asin)) return null
  if (!list.items.some(i => i.asin === asin)) {
    if (list.items.length >= 100) return null
    list.items.push({ asin, quantity: 1, note: '', priority: 'Medium', added_at: new Date().toISOString() })
  }
  return list
}
export function resumeWishlist(req) {
  const pending = req.store.amazonPendingList
  delete req.store.amazonPendingList
  if (!pending) return null
  const list = addToList(req, pending.asin)
  if (!list) return LISTS
  state(req).amazonNotice = 'Item added to your list.'
  return `${LISTS}/${list.id}`
}
export function accountOrders(req) {
  return ownedOrders(req).filter(o => req.store.user && (o.customer.account_id ? o.customer.account_id === req.store.user.id : o.customer.email === req.store.user.email))
}
function accountOrder(req, id) {
  const o = ownedOrder(req, id)
  return o && accountOrders(req).some(row => row.id === o.id) ? o : null
}
export function checkoutAddress(address) {
  return { full_name: address.name, phone: address.phone, line1: address.line1, line2: address.line2 || null, city: address.city, state: address.state, postal_code: address.postal_code, country: 'US', instructions: address.instructions || null, is_default: address.is_default }
}
export function savedAddressChoices(base, addresses) {
  return addresses.length ? `<section class="az-co-box"><h2>Your addresses</h2><div class="az-address-cards">${addresses.map(a => `<article class="az-address-card" data-address-id="${esc(a.id)}">${a.is_default ? '<p class="az-fine">Default address</p>' : ''}${addressText(a)}<form method="post" action="${base}/gp/buy/addressselect"><input type="hidden" name="addressId" value="${esc(a.id)}">${btn('Deliver to this address')}</form></article>`).join('')}</div><a href="${base}/a/addresses">Manage your addresses</a></section>` : ''
}
export const HELP_ARTICLES = [
  { id: 'location', title: 'Change your shopping location', category: 'Shipping & Delivery', text: 'Choose Update location in the header or product page. Enter a US ZIP code, or sign in and choose a saved address. Your shopping location remains available when you move between pages. It does not change an address on an existing order or select a checkout address for you. Delivery dates shown before checkout are estimates; confirm the full address at checkout.', action: ['Choose your location', '/gp/delivery-location'] },
  { id: 'product-support', title: 'Product support and warranty information', category: 'Customer Service', text: 'Use Product information on the item page to review included features and coverage. For warranty registration, claims or repairs, contact the manufacturer listed on the product page. For a problem with an order, create a Customer Service request and attach your order. Include the item name or ASIN in your message so you can identify it later.', action: ['Create a support request', '/hz/contact-us'] },
  { id: 'price-feedback', title: 'Report a lower price or a listing issue', category: 'Ordering', text: 'Found a lower price or a mistake on a listing? Tell us in a Customer Service request. Include the item name or ASIN and the price you found. We use your feedback to review our listings; prices do not change automatically and Amazon does not offer price matching.', action: ['Record your feedback', '/hz/contact-us'] },
  { id: 'services', title: 'What you can do with your Amazon account', category: 'Customer Service', text: 'Shop every department, place orders, manage addresses and lists, cancel orders that have not shipped, and contact Customer Service from Your Account. Some programs, including Prime sign-up, Amazon credit card applications, gift card balances, selling, the Associates program, trade-in, subscriptions, device management and business accounts, are not available for your account at this time.', action: ['Explore shopping departments', '/'] },
  { id: 'delivery', title: 'Delivery dates and shipping options', category: 'Shipping & Delivery', text: 'Choose an address at checkout to review delivery options and shipping charges. The order review is the final place to check the arrival date for each shipment. Track an order in Your Orders: it shows Not yet shipped until the package leaves our fulfillment center.', action: ['Review your orders', ORDERS] },
  { id: 'preorder', title: 'Pre-order Price Guarantee and release dates', category: 'Ordering', text: 'Eligible preorders show a price guarantee on the product page. Review the displayed price before ordering. A code in a box is a physical shipment, not a disc or an immediate download. GTA VI boxes may arrive before the game becomes playable on November 19, 2026. With the Pre-order Price Guarantee, you are charged the lowest price offered by Amazon.com between the time you place your order and the end of the day of the release date.', action: ['Browse Video Games', '/b?node=videogames'] },
  { id: 'cancel', title: 'Cancel an order before it ships', category: 'Returns & Refunds', text: 'Open Your Orders, choose View order details, then Cancel order. Select a reason and confirm. A processing order can be canceled in full. Its original receipt remains available with a Canceled status. Partial cancellation is not available for these orders. You are not charged until your order ships.', action: ['Find an order to cancel', ORDERS] },
  { id: 'returns', title: 'Returns, replacements and eligibility', category: 'Returns & Refunds', text: 'An order must be delivered before you can request a return. For an order that has not shipped, use cancellation instead. The return center shows the status of each order and its available action. Drop-off labels, replacements and carrier pickups are offered only for eligible delivered items.', action: ['Open the return center', '/gp/css/returns/homepage.html'] },
  { id: 'addresses', title: 'Add, edit or change a delivery address', category: 'Account & Lists', text: 'Open Your Addresses to add, edit or remove a saved destination. Set a default to make it easy to select at checkout. Address changes do not update an order you already placed. To correct a processing order, cancel it and place a new order with the right address. Amazon.com ships these items to US addresses only.', action: ['Manage Your Addresses', '/a/addresses'] },
  { id: 'lists', title: 'Create and manage your shopping lists', category: 'Account & Lists', text: 'Choose Add to List on a product page. If asked to sign in, the item will be saved when you finish. Create separate lists, add notes, set quantity and priority, or move items between lists. Adding a list item to your cart keeps the saved item so you can use your list again. Your lists are private to your account.', action: ['Go to Your Lists', LISTS] },
  { id: 'payment', title: 'Payment methods and order charges', category: 'Payments', text: 'Add a credit or debit card at checkout. Your order details show only the card brand, last four digits, cardholder name and expiration date; full card numbers and security codes are never displayed. You are charged when your order ships. Gift card balances, promotional codes and saved cards cannot be applied to orders on your account at this time.', action: ['Review your cart', '/cart'] },
  { id: 'signin', title: 'Sign in and manage your account', category: 'Account & Lists', text: 'Use Sign in or create account to access saved addresses, shopping lists and orders. Sign out from Your Account when you finish. Saved addresses, lists and orders stay with your account. Sign out when you use a shared device. If you cannot sign in, contact Customer Service.', action: ['Open Your Account', ACCOUNT] },
  { id: 'history', title: 'View or remove your browsing history', category: 'Account & Lists', text: 'Browsing History shows the products you viewed most recently. Remove one product, clear all items or turn history off. Turning history off prevents new visits from being added; it does not delete the items already in your history.', action: ['Manage browsing history', '/gp/history'] },
  { id: 'contact', title: 'Contact Customer Service and view requests', category: 'Customer Service', text: 'Choose a topic and describe your issue. You can attach an order from Your Orders. A request number and a copy of your message are saved in Your Customer Service Requests.', action: ['Contact us', '/hz/contact-us'] },
  { id: 'privacy', title: 'Privacy and your shopping information', category: 'Customer Service', text: 'Your cart, browsing history, addresses and support requests are used to provide shopping features on your account. You can remove items from your browsing history, manage saved addresses, and sign out at any time. See the Amazon.com Privacy Notice for details.', action: ['Your Account', ACCOUNT] },
]
const topics = [...new Set(HELP_ARTICLES.map(a => a.category))]
const helpWords = text => text.toLowerCase().replace(/pre[ -]?order/g, 'preorder').replace(/changing/g, 'change').replace(/shipping dates/g, 'shipping date').split(/\s+/).filter(Boolean)

export function registerJourneys(router, { render, notFound, addToCart, purchaseError }) {
  const show = (req, res, title, body, status = 200) => render(req, res, title, page(res.locals.base, title, body), { status })
  function gate(req, res, destination = null) {
    if (req.store.user) return true
    const ret = destination || (req.method === 'GET' ? req.originalUrl.slice(res.locals.base.length) : ACCOUNT)
    res.redirect(`${res.locals.base}${signinPath(ret)}`)
    return false
  }
  const flash = req => { const s = state(req), m = s.amazonNotice; delete s.amazonNotice; return notice(m) }
  function owned(req, res, id) {
    if (!gate(req, res)) return null
    const o = accountOrder(req, id)
    if (!o) notFound(req, res)
    return o
  }
  router.get([ACCOUNT, '/your-account'], (req, res) => {
    const base = res.locals.base, user = req.store.user
    const cards = [
      ['Your Orders', 'Track, cancel, or review an order', ORDERS, '▣'],
      ['Login & security', 'Edit login, name, and mobile number', '/ap/cnep', '⚿'],
      ['Prime', 'Manage your membership, view benefits', '/amazonprime', '✓'],
      ['Gift cards', 'View balance or redeem a card', '/gift-cards/b?node=2238192011', '▭'],
      ['Your Payments', 'View all transactions, manage payment methods and settings', '/cpe/yourpayments/wallet', '$'],
      ['Your Lists', 'Save ideas, organize gifts, and shop again', LISTS, '♡'],
      ['Your Addresses', 'Edit delivery addresses and set a default', '/a/addresses', '⌂'],
      ['Shopping Location', 'Choose a ZIP code or saved delivery area', '/gp/delivery-location', '⌖'],
      ['Returns & Replacements', 'Check return eligibility and cancellation options', '/gp/css/returns/homepage.html', '↶'],
      ['Sign-in & Account Help', 'Find help with account access and sign-in', '/help/signin', '◇'],
      ['Browsing History', 'See products you viewed recently', '/gp/history', '◷'],
      ['Customer Service', 'Find help with delivery, orders and your account', '/help', '?'],
      ['Your Customer Service Requests', 'Review your saved requests and their status', '/hz/contact-us/cases', '✉'],
    ]
    show(req, res, 'Your Account', `${user ? `<p>Hello, ${esc(user.first_name)}. <span class="az-fine">${esc(user.email)}</span> · <a href="${base}/gp/flex/sign-out.html">Sign out</a></p>` : `<p><a class="az-btn" href="${base}${signinPath(ACCOUNT)}">Sign in to your account</a> &nbsp; New customer? <a href="${base}${signinPath(ACCOUNT)}">Start here</a>.</p>`}<div class="az-account-grid">${cards.map(([title, copy, path, icon]) => `<a class="az-account-card" href="${base}${path}"><span aria-hidden="true">${icon}</span><div><h2>${title}</h2><p>${copy}</p></div></a>`).join('')}</div><div class="az-account-grid az-account-utilities"><section><h2>Shopping and ordering</h2><a href="${base}/cart">Your shopping cart</a><a href="${base}/gp/css/returns/homepage.html">Returns and replacements</a><a href="${base}/help/payment">Payment methods and charges</a></section><section><h2>Account help</h2><a href="${base}/help/signin">Sign-in help</a><a href="${base}/help/privacy">Privacy &amp; data</a><a href="${base}/hz/contact-us">Contact us</a></section></div>`)
  })

  router.post('/hz/wishlist/add', (req, res) => {
    const p = byAsin(req.body.asin)
    if (!p) return purchaseError(req, res)
    if (!req.store.user) {
      req.store.amazonPendingList = { asin: p.asin }
      return res.redirect(`${res.locals.base}${signinPath(LISTS)}`)
    }
    const list = addToList(req, p.asin, clean(req.body.list_id))
    if (!list) return show(req, res, 'Your Lists', '<p>That list is unavailable or full. Choose another list.</p>', 400)
    state(req).amazonNotice = 'Item added to your list.'
    res.redirect(`${res.locals.base}${LISTS}/${list.id}`)
  })
  router.get([LISTS, `${LISTS}/:id`], (req, res) => {
    if (!gate(req, res)) return
    const base = res.locals.base, s = state(req), lists = s.amazonLists
    const list = req.params.id ? lists.find(l => l.id === req.params.id) : lists[0]
    if (req.params.id && !list) return notFound(req, res)
    const content = list ? `<div class="az-list-heading"><h2>${esc(list.name)}</h2><p>Private · ${list.items.length} saved items</p></div><details class="az-list-manage"><summary>Manage list</summary><form method="post" action="${base}${LISTS}/${list.id}/manage" class="az-service-form">${input('List name', 'name', list.name, 'maxlength="80" required')}<button class="az-btn az-btn-outline" name="action" value="rename">Save name</button><button class="az-link-btn" name="action" value="delete" formnovalidate>Delete this list and its items</button></form></details>${list.items.length ? list.items.map(item => {
      const p = byAsin(item.asin)
      return `<article class="az-list-item" data-asin="${esc(item.asin)}"><a class="az-journey-product" href="${productPath(base, p)}">${productArt(p)}</a><div><h3><a href="${productPath(base, p)}">${esc(p.title)}</a></h3><p class="az-list-price">${money(p.price)}</p><p class="az-fine">Added ${date(item.added_at)}</p><form class="az-service-form az-list-edit" method="post" action="${base}${LISTS}/${list.id}/items/${p.asin}"><label>Quantity<select name="quantity">${[1,2,3,4,5].map(q => `<option${q === item.quantity ? ' selected' : ''}>${q}</option>`).join('')}</select></label><label>Priority<select name="priority">${['Low','Medium','High'].map(priority => `<option${priority === item.priority ? ' selected' : ''}>${priority}</option>`).join('')}</select></label>${input('Comment', 'note', item.note, 'maxlength="500"')}<div class="az-actions"><button class="az-btn az-btn-outline" name="action" value="update">Save changes</button><button class="az-link-btn" name="action" value="remove">Remove</button></div>${lists.length > 1 ? `<label>Move to<select name="target">${lists.filter(l => l.id !== list.id).map(l => `<option value="${l.id}">${esc(l.name)}</option>`).join('')}</select></label><button class="az-btn az-btn-outline" name="action" value="move">Move item</button>` : ''}</form></div><div><form method="post" action="${base}${LISTS}/${list.id}/items/${p.asin}"><input type="hidden" name="action" value="cart">${p.stock >= item.quantity ? btn('Add to cart') : '<p class="az-unavailable">Requested quantity unavailable</p>'}</form></div></article>`
    }).join('') : `<div class="az-empty"><h2>Your list is ready for ideas</h2><p>Choose Add to List on any product page to save it here.</p><a href="${base}/">Discover products</a></div>`}` : '<p>Create a list to save your next great find.</p>'
    show(req, res, 'Your Lists', `${flash(req)}<div class="az-lists-layout"><aside class="az-list-sidebar"><h2>Your lists</h2>${lists.map(l => `<a${l.id === list?.id ? ' aria-current="page"' : ''} href="${base}${LISTS}/${l.id}">${esc(l.name)} <span>(${l.items.length})</span></a>`).join('')}<details><summary>Create a list</summary><form class="az-service-form" method="post" action="${base}${LISTS}">${input('List name', 'name', '', 'maxlength="80" required')}${btn('Create list')}</form></details><a href="${base}/cart">Your cart and saved for later</a></aside><section>${content}</section></div>`)
  })
  router.post(LISTS, (req, res) => {
    if (!gate(req, res, LISTS)) return
    const lists = state(req).amazonLists, name = clean(req.body.name, 80)
    if (!name || lists.length >= 12) return show(req, res, 'Create a list', `${errors([!name ? 'Enter a list name.' : 'You can keep up to 12 lists.'])}<form class="az-service-form" method="post" action="${res.locals.base}${LISTS}">${input('List name', 'name', name, 'maxlength="80"')}${btn('Create list')}</form>`, 400)
    const list = { id: uid('list'), name, items: [] }; lists.push(list)
    res.redirect(`${res.locals.base}${LISTS}/${list.id}`)
  })
  router.post(`${LISTS}/:id/manage`, (req, res) => {
    if (!gate(req, res, LISTS)) return
    const s = state(req), list = s.amazonLists.find(l => l.id === req.params.id)
    if (!list) return notFound(req, res)
    if (req.body.action === 'delete') s.amazonLists = s.amazonLists.filter(l => l !== list)
    else if (req.body.action === 'rename' && clean(req.body.name, 80)) list.name = clean(req.body.name, 80)
    else return show(req, res, 'Manage list', `${errors(['Enter a list name and choose a supported action.'])}<form class="az-service-form" method="post" action="${res.locals.base}${LISTS}/${list.id}/manage">${input('List name', 'name', clean(req.body.name,80), 'maxlength="80"')}<button class="az-btn" name="action" value="rename">Save name</button><a href="${res.locals.base}${LISTS}/${list.id}">Back to list</a></form>`, 400)
    res.redirect(`${res.locals.base}${LISTS}${req.body.action === 'delete' ? '' : `/${list.id}`}`)
  })
  function listItemError(req, res, list, item, message) {
    const base = res.locals.base
    show(req, res, 'Edit list item', `${errors([message])}<form class="az-service-form" method="post" action="${base}${LISTS}/${list.id}/items/${item.asin}">${input('Quantity', 'quantity', clean(req.body.quantity), 'type="number" min="1" max="5" step="1"')}<label>Priority<select name="priority">${['Low','Medium','High'].map(priority => `<option${priority === req.body.priority ? ' selected' : ''}>${priority}</option>`).join('')}</select></label>${input('Comment', 'note', clean(req.body.note, 500), 'maxlength="500"')}<button class="az-btn" name="action" value="update">Save changes</button><a href="${base}${LISTS}/${list.id}">Back to list</a></form>`, 400)
  }
  router.post(`${LISTS}/:id/items/:asin`, (req, res) => {
    if (!gate(req, res, LISTS)) return
    const s = state(req), list = s.amazonLists.find(l => l.id === req.params.id), item = list?.items.find(i => i.asin === req.params.asin), p = byAsin(req.params.asin)
    if (!item || !p) return notFound(req, res)
    if (req.body.action === 'remove') list.items = list.items.filter(i => i !== item)
    else if (req.body.action === 'update') {
      const quantity = Number(req.body.quantity), priority = clean(req.body.priority)
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 5 || !['Low','Medium','High'].includes(priority)) return listItemError(req, res, list, item, 'Choose a quantity from 1 to 5 and a listed priority.')
      Object.assign(item, { quantity, priority, note: clean(req.body.note, 500) })
    } else if (req.body.action === 'move') {
      const target = s.amazonLists.find(l => l.id === req.body.target && l !== list)
      if (!target || target.items.length >= 100) return show(req, res, 'Move item', '<p>Choose another available list.</p>', 400)
      if (!target.items.some(i => i.asin === item.asin)) target.items.push({ ...item })
      list.items = list.items.filter(i => i !== item)
    } else if (req.body.action === 'cart') {
      if (p.stock < item.quantity) return purchaseError(req, res)
      addToCart(req.store, p.asin, item.quantity)
      s.amazonNotice = 'Added to cart. This item is still saved in your list.'
    } else return show(req, res, 'Your Lists', '<p>Choose an available list action.</p>', 400)
    res.redirect(`${res.locals.base}${LISTS}/${list.id}`)
  })

  router.get('/gp/history', (req, res) => {
    const base = res.locals.base, s = state(req), products = s.recent.map(byAsin).filter(Boolean)
    show(req, res, 'Your Browsing History', `<p>Keep track of products you recently explored.</p><form method="post" action="${base}/gp/history" class="az-history-controls"><label><input type="checkbox" name="enabled" value="yes"${s.preferences.history !== false ? ' checked' : ''}> Turn browsing history on</label><button class="az-btn az-btn-outline" name="action" value="settings">Save preference</button><button class="az-link-btn" name="action" value="clear">Remove all items</button></form><div class="az-recent-grid">${products.map(p => `<article><a class="az-journey-product" href="${productPath(base,p)}">${productArt(p)}</a><h2><a href="${productPath(base,p)}">${esc(p.title)}</a></h2><p>${money(p.price)}</p><form method="post" action="${base}/gp/history"><input type="hidden" name="asin" value="${p.asin}"><button class="az-btn az-btn-outline" name="action" value="remove">Remove from view</button></form></article>`).join('')}</div>${products.length ? '' : `<div class="az-empty"><h2>No products to show</h2><p>Product pages you open will appear here when browsing history is on.</p><a href="${base}/">Continue shopping</a></div>`}`)
  })
  router.post('/gp/history', (req, res) => {
    const s = state(req)
    if (req.body.action === 'clear') s.recent = []
    else if (req.body.action === 'remove' && byAsin(req.body.asin)) s.recent = s.recent.filter(id => id !== req.body.asin)
    else if (req.body.action === 'settings') s.preferences.history = req.body.enabled === 'yes'
    else return show(req, res, 'Browsing History', '<p>Choose an available history action.</p>', 400)
    res.redirect(`${res.locals.base}/gp/history`)
  })

  function addressForm(req, res, values = {}, messages = [], status = 200) {
    const base = res.locals.base
    show(req, res, values.id ? 'Edit address' : 'Add a new address', `${errors(messages)}<form class="az-service-form az-address-editor" method="post" action="${base}/a/addresses"><input type="hidden" name="id" value="${esc(values.id || '')}"><p>Country/Region: <b>United States</b></p>${input('Address label (optional)', 'label', values.label, 'maxlength="80"')}${input('Full name', 'name', values.name, 'autocomplete="name" required')}${input('Phone number', 'phone', values.phone, 'type="tel" autocomplete="tel" required')}${input('Street address', 'line1', values.line1, 'autocomplete="address-line1" required')}${input('Apartment, suite, unit (optional)', 'line2', values.line2, 'autocomplete="address-line2"')}${input('City', 'city', values.city, 'autocomplete="address-level2" required')}<label>State<select name="state"><option value="">Select a state</option>${STATES.map(st => `<option${st === values.state ? ' selected' : ''}>${st}</option>`).join('')}</select></label>${input('ZIP Code', 'postal_code', values.postal_code, 'autocomplete="postal-code" required')}${input('Delivery instructions (optional)', 'instructions', values.instructions, 'maxlength="500"')}<label class="az-check"><input type="checkbox" name="is_default" value="yes"${values.is_default ? ' checked' : ''}> Make this my default address</label><div class="az-actions">${btn('Save address')}<a href="${base}/a/addresses">Cancel</a></div></form>`, status)
  }
  router.get('/a/addresses', (req, res) => {
    if (!gate(req, res)) return
    const base = res.locals.base, addresses = state(req).addresses
    show(req, res, 'Your Addresses', `${flash(req)}<div class="az-address-cards"><a class="az-address-add" href="${base}/a/addresses/add"><span aria-hidden="true">＋</span>Add Address</a>${addresses.map(a => `<article class="az-address-card" data-address-id="${a.id}"><p class="az-address-label">${a.is_default ? 'Default: ' : ''}${esc(a.label || 'Delivery address')}</p>${addressText(a)}${a.instructions ? `<p class="az-fine">${esc(a.instructions)}</p>` : ''}<div class="az-actions"><a href="${base}/a/addresses/edit?id=${a.id}">Edit</a><form method="post" action="${base}/a/addresses/${a.id}/remove">${btn('Remove', true)}</form>${!a.is_default ? `<form method="post" action="${base}/a/addresses/${a.id}/default"><button class="az-link-btn">Set as Default</button></form>` : ''}</div></article>`).join('')}</div><p class="az-fine">Editing an address changes your address book. Existing orders keep the delivery address used at checkout.</p>`)
  })
  router.get(['/a/addresses/add', '/a/addresses/edit'], (req, res) => {
    if (!gate(req, res)) return
    const edit = req.path.endsWith('/edit'), address = edit ? state(req).addresses.find(a => a.id === req.query.id) : { name: `${req.store.user.first_name} ${req.store.user.last_name}`.trim(), phone: req.store.user.phone }
    if (!address) return notFound(req, res)
    addressForm(req, res, address)
  })
  router.post('/a/addresses', (req, res) => {
    if (!gate(req, res, '/a/addresses')) return
    const values = Object.fromEntries(['id','label','name','phone','line1','line2','city','state','postal_code','instructions'].map(k => [k, clean(req.body[k], k === 'instructions' ? 500 : 240)]))
    values.is_default = req.body.is_default === 'yes'
    if (values.id && !state(req).addresses.some(a => a.id === values.id)) return notFound(req, res)
    const localErrors = []
    if (!STATES.includes(values.state)) localErrors.push('Choose a state.')
    if (values.phone.replace(/\D/g,'').length < 10) localErrors.push('Enter a valid 10-digit phone number.')
    if (localErrors.length) return addressForm(req, res, values, localErrors, 400)
    const result = saveAddress(req, { ...values, is_default: values.is_default ? 'yes' : '' }, { country: 'US', requirePhone: true })
    if (result.errors) return addressForm(req, res, values, result.errors, 400)
    result.address.instructions = values.instructions
    state(req).amazonNotice = 'Address saved.'
    res.redirect(`${res.locals.base}/a/addresses`)
  })
  router.post('/a/addresses/:id/:action', (req, res) => {
    if (!gate(req, res, '/a/addresses')) return
    const addresses = state(req).addresses, a = addresses.find(row => row.id === req.params.id)
    if (!a) return notFound(req, res)
    if (req.params.action === 'remove') deleteAddress(req, a.id)
    else if (req.params.action === 'default') addresses.forEach(row => { row.is_default = row === a })
    else return notFound(req, res)
    res.redirect(`${res.locals.base}/a/addresses`)
  })

  function orderItems(base, order) {
    return order.items.map(item => { const p = byAsin(item.sku); return `<div class="az-order-item">${p ? `<a class="az-journey-product" href="${productPath(base,p)}">${productArt(p)}</a>` : ''}<div>${p ? `<a href="${productPath(base,p)}">${esc(item.title)}</a>` : esc(item.title)}<p>Quantity: ${item.qty} · ${money(item.unit_price)}</p>${p ? `<a class="az-btn az-btn-outline" href="${productPath(base,p)}">View product</a>` : ''}</div></div>` }).join('')
  }
  router.get([ORDERS, '/gp/your-account/order-history'], (req, res) => {
    if (!gate(req, res)) return
    const base = res.locals.base, query = clean(req.query.search, 160), view = ['all','processing','cancelled'].includes(req.query.view) ? req.query.view : 'all', days = ['30','90'].includes(req.query.days) ? req.query.days : 'all'
    const orders = accountOrders(req).filter(o => (view === 'all' || orderStatus(o) === view) && (days === 'all' || Date.now() - new Date(o.created_at).valueOf() < Number(days)*86400000) && `${o.order_number} ${o.items.map(i=>i.title).join(' ')}`.toLowerCase().includes(query.toLowerCase())).reverse()
    show(req, res, 'Your Orders', `<form class="az-order-search az-service-form" method="get" action="${base}${ORDERS}">${input('Search all orders', 'search', query, 'placeholder="Search by item or order number"')}<label>Order status<select name="view">${[['all','All orders'],['processing','Not yet shipped'],['cancelled','Canceled orders']].map(([v,l])=>`<option value="${v}"${view===v?' selected':''}>${l}</option>`).join('')}</select></label><label>Time period<select name="days">${[['all','All time'],['30','Past 30 days'],['90','Past 3 months']].map(([v,l])=>`<option value="${v}"${days===v?' selected':''}>${l}</option>`).join('')}</select></label>${btn('Search orders',true)}</form><p><b>${orders.length} order${orders.length===1?'':'s'}</b> found</p>${orders.map(o => `<article class="az-order-card" data-order-id="${o.id}"><div class="az-order-card-head"><div><span>ORDER PLACED</span><b>${date(o.created_at)}</b></div><div><span>TOTAL</span><b>${money(o.totals.total)}</b></div><div><span>SHIP TO</span><b>${esc(o.shipping_address.first_name)} ${esc(o.shipping_address.last_name)}</b></div><div class="az-order-card-num"><span>ORDER # ${esc(o.order_number)}</span><a href="${base}${orderPath(o)}">View order details</a></div></div><div class="az-order-card-body"><h2>${statusLabel(o)}</h2>${orderStatus(o)==='processing'?`<p>Estimated arrival: ${esc(o.fulfillment.eta)}</p>`:''}${orderItems(base,o)}<div class="az-actions"><a class="az-btn az-btn-outline" href="${base}/orders/${o.id}/track">Track package</a>${orderStatus(o)==='processing'?`<a class="az-btn az-btn-outline" href="${base}/orders/${o.id}/cancel">Cancel order</a>`:''}<a href="${base}/hz/contact-us?order_id=${o.id}">Get order help</a></div></div></article>`).join('')}${orders.length ? '' : `<div class="az-empty"><h2>No orders found</h2><p>We couldn't find any orders that match. Try a different search or time period.</p><a href="${base}${ORDERS}">Clear search</a> · <a href="${base}/">Continue shopping</a></div>`}`)
  })
  router.get('/gp/your-account/order-details', (req, res) => {
    const o = owned(req,res,req.query.orderID); if (!o) return
    const base = res.locals.base
    show(req,res,'Order Details', `<p>Ordered on ${date(o.created_at)} · Order # <b>${esc(o.order_number)}</b></p><div class="az-order-summary-grid"><section class="az-co-box"><h2>Shipping Address</h2>${addressText(o.shipping_address)}${o.meta.delivery_instructions?`<p>${esc(o.meta.delivery_instructions)}</p>`:''}</section><section class="az-co-box"><h2>Payment Method</h2><p>${esc(o.payment.brand)} ending in ${esc(o.payment.last4)}</p><p class="az-fine">${esc(o.payment.name_on_card)}</p><a href="${base}/help/payment">Payment information</a></section><section class="az-co-box"><h2>Order Summary</h2>${[['Item subtotal',o.totals.subtotal],['Shipping',o.totals.shipping],['Estimated tax',o.totals.tax],['Original order total',o.totals.total]].map(([label,n])=>`<div class="az-row"><span>${label}</span><b>${money(n)}</b></div>`).join('')}</section></div><section class="az-co-box"><h2>${statusLabel(o)}</h2>${orderStatus(o)==='processing'?`<p>Estimated arrival: ${esc(o.fulfillment.eta)}. Your order has not shipped.</p>`:orderStatus(o)==='cancelled'?'<p>This order has been canceled. No items will be fulfilled. The original order summary is kept for your records.</p>':''}${orderItems(base,o)}<div class="az-actions"><a href="${base}/orders/${o.id}/track">Track package</a>${orderStatus(o)==='processing'?`<a class="az-btn az-btn-outline" href="${base}/orders/${o.id}/cancel">Cancel order</a>`:''}<a href="${base}/orders/${o.id}/return">Return eligibility</a><a href="${base}/hz/contact-us?order_id=${o.id}">Get order help</a></div></section>${o.meta.lifecycle?.length ? `<section class="az-co-box"><h2>Order activity</h2>${o.meta.lifecycle.map(event=>`<p>${date(event.created_at)} — ${event.status==='cancelled'?'Canceled':'Return requested'}: ${esc(event.reason)}</p>`).join('')}</section>`:''}<a href="${base}${ORDERS}">Back to Your Orders</a>`)
  })
  router.get('/orders/:id/track', (req,res)=>{
    const o=owned(req,res,req.params.id);if(!o)return
    show(req,res,'Track your package',`<section class="az-co-box"><h2>${statusLabel(o)}</h2><p>Order # ${esc(o.order_number)}</p>${orderStatus(o)==='processing'?`<p>Estimated delivery: <b>${esc(o.fulfillment.eta)}</b></p><ol class="az-track"><li class="is-current">Order placed</li><li>Not yet shipped</li><li>Delivery pending</li></ol><p>Tracking information will be available after shipment. No carrier tracking number has been assigned.</p>${o.items.some(i=>i.kind==='game')?'<p>Your code-in-box game is playable on November 19, 2026. The box arrival date may be earlier.</p>':''}`:orderStatus(o)==='cancelled'?'<p>The order was canceled before shipment. There is no package to track.</p>':'<p>See Order Details for the latest recorded status.</p>'}<a href="${res.locals.base}${orderPath(o)}">View order details</a></section>`)
  })
  function actionPage(req,res,o,action,error='',status=200) {
    const base=res.locals.base, cancelling=action==='cancel', allowed=cancelling?orderStatus(o)==='processing':orderStatus(o)==='delivered'
    const reasons=cancelling?['Ordered by mistake','Need to change shipping address','Found a different item','No longer needed']:['Item damaged','Wrong item received','No longer needed']
    show(req,res,cancelling?'Cancel order':'Return eligibility',`${errors(error?[error]:[])}<section class="az-co-box"><p>Order # ${esc(o.order_number)} · <b>${statusLabel(o)}</b></p>${orderItems(base,o)}${allowed?`<p>${cancelling?'This cancels every item in this order. The original receipt remains in Your Orders.':'Request a return for all items in this delivered order. A request does not generate a shipping label.'}</p><form class="az-service-form" method="post" action="${base}/orders/${o.id}/${action}"><label>Reason<select name="reason"><option value="">Select a reason</option>${reasons.map(reason=>`<option${reason===req.body?.reason?' selected':''}>${reason}</option>`).join('')}</select></label>${input('Additional details (optional)','details',clean(req.body?.details,500),'maxlength="500"')}${btn(cancelling?'Confirm cancellation':'Request return')}</form>`:`<p>${cancelling?'This order is no longer eligible for cancellation.':'A return can be requested after delivery. You can cancel an order that has not shipped.'}</p>${orderStatus(o)==='processing'?`<a href="${base}/orders/${o.id}/cancel">Cancel this order instead</a>`:''}`}<p><a href="${base}${orderPath(o)}">Back to order details</a></p></section>`,status)
  }
  for(const action of ['cancel','return']) {
    router.get(`/orders/:id/${action}`,(req,res)=>{const o=owned(req,res,req.params.id);if(o)actionPage(req,res,o,action)})
    router.post(`/orders/:id/${action}`,(req,res)=>{
      const o=owned(req,res,req.params.id);if(!o)return
      const reasons=action==='cancel'?['Ordered by mistake','Need to change shipping address','Found a different item','No longer needed']:['Item damaged','Wrong item received','No longer needed']
      if(!reasons.includes(req.body.reason))return actionPage(req,res,o,action,'Choose a listed reason.',400)
      const result=requestOrderAction(req,o.id,action,`${req.body.reason}${clean(req.body.details,500)?`: ${clean(req.body.details,500)}`:''}`)
      if(result.error)return actionPage(req,res,o,action,result.error,result.status)
      res.redirect(`${res.locals.base}${orderPath(o)}`)
    })
  }
  router.get('/gp/css/returns/homepage.html',(req,res)=>{
    if(!gate(req,res))return
    const base=res.locals.base,orders=accountOrders(req).reverse()
    show(req,res,'Returns & Replacements',`<p>Select an order to check its eligibility. Orders that have not shipped can be canceled instead.</p>${orders.map(o=>`<section class="az-co-box"><h2>Order # ${esc(o.order_number)}</h2><p>${statusLabel(o)} · ${esc(o.items.map(i=>i.title).join(', '))}</p><a href="${base}/orders/${o.id}/return">Check return eligibility</a></section>`).join('')||`<p>You have no orders in this browser.</p><a href="${base}/">Continue shopping</a>`}`)
  })

  router.get(['/help','/gp/help/customer/display.html'],(req,res)=>{
    if(req.query.nodeId){const article=HELP_ARTICLES.find(a=>a.id===req.query.nodeId);if(!article)return notFound(req,res);return articlePage(req,res,article)}
    const base=res.locals.base,q=clean(req.query.q,160),topic=topics.includes(req.query.topic)?req.query.topic:'',results=HELP_ARTICLES.filter(a=>(!topic||a.category===topic)&&helpWords(q).every(word => helpWords(`${a.title} ${a.text} ${a.category}`).join(' ').includes(word)))
    show(req,res,'Welcome to Amazon Customer Service',`<p class="azp-help-sub">What would you like help with today? You can quickly take care of most things here, or connect with us when needed.</p><div class="azp-help-tiles">${[['A delivery, order or return',ORDERS,'Your Orders'],['Returns & Refunds','/gp/css/returns/homepage.html','Return or replace items'],['Manage Prime','/amazonprime','Prime membership and benefits'],['Payment, charges or gift cards','/cpe/yourpayments/wallet','Your Payments'],['Address, security & privacy','/ap/cnep','Login & security'],['Shipping & delivery','/gp/help/customer/display.html?nodeId=468520','Shipping rates and delivery estimates'],['Returns policy','/gp/help/customer/display.html?nodeId=GKM69DUUYKQWKWX7','Amazon.com Returns Policy'],['Pre-orders','/gp/help/customer/display.html?nodeId=G4BRP7LCB9DSDNCR','Pre-Order Price Guarantee']].map(([t,p,c])=>`<a class="azp-help-tile" href="${base}${p}"><b>${esc(t)}</b><span>${esc(c)}</span></a>`).join('')}</div><form class="az-help-search az-service-form" method="get" action="${base}/help">${input('Search our help library','q',q,'placeholder="Try cancellation, address, or preorder"')}<label>Topic<select name="topic"><option value="">All topics</option>${topics.map(t=>`<option${topic===t?' selected':''}>${t}</option>`).join('')}</select></label>${btn('Search help')}</form><div class="az-help-topics">${topics.map(t=>`<a href="${base}/help?topic=${encodeURIComponent(t)}">${t}</a>`).join('')}</div><div class="az-help-layout"><section><h2>${q||topic?`${results.length} matching articles`:'Browse help topics'}</h2>${results.map(a=>`<article class="az-help-result" id="${a.id}"><h3><a href="${base}/help/${a.id}">${a.title}</a></h3><p>${esc(a.text.slice(0,155))}…</p><span class="az-fine">${a.category}</span></article>`).join('')||`<p>No articles match your search. Try a shorter phrase or <a href="${base}/help">browse all topics</a>.</p>`}</section><aside class="az-co-box"><h2>Need more help?</h2><p>Manage your orders or save a customer service request.</p><a href="${base}${ORDERS}">Your Orders</a><p><a class="az-btn" href="${base}/hz/contact-us">Contact us</a></p><a href="${base}/hz/contact-us/cases">Your Customer Service Requests</a></aside></div>`)
  })
  function articlePage(req,res,a){const base=res.locals.base;show(req,res,a.title,`<div class="az-help-layout"><article class="az-help-article"><p class="az-fine">${a.category}</p>${a.text.split('. ').map((text,index,all)=>`<p>${esc(text)}${index===all.length-1?'':'.'}</p>`).join('')}<p><a class="az-btn az-btn-outline" href="${base}${a.action[1]}">${a.action[0]}</a></p><a href="${base}/help">Back to help topics</a></article><aside class="az-co-box"><h2>Related help</h2>${HELP_ARTICLES.filter(row=>row.category===a.category&&row!==a).map(row=>`<p><a href="${base}/help/${row.id}">${row.title}</a></p>`).join('')}<a href="${base}/hz/contact-us">Contact us</a></aside></div>`)}
  router.get('/help/:article',(req,res)=>{const a=HELP_ARTICLES.find(row=>row.id===req.params.article);if(!a)return notFound(req,res);articlePage(req,res,a)})
  function contact(req,res,values={},messages=[],status=200){
    const base=res.locals.base,orders=accountOrders(req)
    show(req,res,'Contact Customer Service',`${errors(messages)}<div class="az-help-layout"><form class="az-service-form az-contact-form" method="post" action="${base}/hz/contact-us"><h2>Tell us what you need help with</h2><label>Topic<select name="category"><option value="">Select a topic</option>${topics.map(t=>`<option${values.category===t?' selected':''}>${t}</option>`).join('')}</select></label><label>Related order (optional)<select name="order_id"><option value="">Not about an order</option>${orders.map(o=>`<option value="${o.id}"${values.order_id===o.id?' selected':''}>${esc(o.order_number)} — ${esc(o.items[0].title)}</option>`).join('')}</select></label>${input('Subject','subject',values.subject,'maxlength="160" required')}${input('Email address','email',values.email||req.store.user.email,'type="email" required')}<label>How can we help?<textarea name="message" rows="6" minlength="10" maxlength="3000" required>${esc(values.message||'')}</textarea></label><p class="az-fine">You can check the status of this request any time in Your Customer Service Requests.${publicNotice(' No message is sent to Amazon and no email reply will be delivered.')}</p>${btn('Submit')}</form><aside class="az-co-box"><h2>Try these first</h2><p><a href="${base}/help/cancel">Cancel an unshipped order</a></p><p><a href="${base}/help/addresses">Change a delivery address</a></p><p><a href="${base}/help/preorder">Preorder release dates</a></p><a href="${base}/hz/contact-us/cases">View your requests</a></aside></div>`,status)
  }
  router.get('/hz/contact-us',(req,res)=>{if(!gate(req,res))return;const id=clean(req.query.order_id);if(id&&!accountOrder(req,id))return notFound(req,res);contact(req,res,{order_id:id})})
  router.post('/hz/contact-us',(req,res)=>{
    if(!gate(req,res,'/hz/contact-us'))return
    const values=Object.fromEntries(['category','order_id','subject','email','message'].map(k=>[k,clean(req.body[k],k==='message'?3000:k==='subject'?160:254)])),extra=[]
    if(!topics.includes(values.category))extra.push('Choose a listed topic.')
    if(values.order_id&&!accountOrder(req,values.order_id))extra.push('Choose one of your orders.')
    if(extra.length)return contact(req,res,values,extra,400)
    const result=createSupportCase(req,values)
    if(result.errors)return contact(req,res,result.values,result.errors,400)
    res.redirect(`${res.locals.base}/hz/contact-us/cases/${result.supportCase.id}`)
  })
  router.get('/hz/contact-us/cases',(req,res)=>{
    if(!gate(req,res))return
    const base=res.locals.base,cases=state(req).cases
    show(req,res,'Your Customer Service Requests',`<p><a class="az-btn" href="${base}/hz/contact-us">Create a request</a></p>${cases.map(c=>`<article class="az-co-box"><h2><a href="${base}/hz/contact-us/cases/${c.id}">${esc(c.subject)}</a></h2><p>${esc(c.category)} · Saved ${date(c.created_at)} · Received</p><p class="az-fine">Request # ${c.id}</p></article>`).join('')||'<p>You have no saved requests.</p>'}`)
  })
  router.get('/hz/contact-us/cases/:id',(req,res)=>{
    if(!gate(req,res))return
    const c=state(req).cases.find(row=>row.id===req.params.id);if(!c)return notFound(req,res)
    const base=res.locals.base
    show(req,res,'Customer Service Request',`${notice('Your request is saved.')}<section class="az-co-box"><h2>${esc(c.subject)}</h2><p>Request # <b data-case-id>${esc(c.id)}</b></p><p>Status: <b>Received locally</b> · ${date(c.created_at)}</p><p>Topic: ${esc(c.category)} · Email: ${esc(c.email)}</p><p class="az-case-message">${esc(c.message)}</p>${c.order_id?`<p><a href="${base}${orderPath({id:c.order_id})}">Related order</a></p>`:''}<p>No email was sent and no Amazon representative received this request.</p><a href="${base}/hz/contact-us/cases">View all requests</a></section>`)
  })
}
