import { randomBytes } from 'node:crypto'
import { esc, money, publicNotice } from '../../lib/html.js'
import { authenticate, createAccount, publicAccount } from '../../lib/accounts.js'
import { retailState, rememberProduct, toggleFavorite, saveAddress, deleteAddress, ownedOrders, ownedOrder, orderStatus, requestOrderAction, createSupportCase } from '../../lib/retail-state.js'
import { species, slugify } from './catalog.js'

const clean = (v, max = 240) => typeof v === 'string' ? v.trim().slice(0, max) : ''
const uid = prefix => `${prefix}-${randomBytes(7).toString('hex')}`
const today = () => new Date().toISOString().slice(0, 10)
const stages = ['Young', 'Adult', 'Senior', 'Unknown']
const preferences = ['Everyday essentials', 'Food & treats', 'Play & enrichment', 'Comfort & care']
const cadences = [2, 4, 6, 8]
export function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || value < '1900-01-01') return false
  const date = new Date(`${value}T00:00:00.000Z`)
  return Number.isFinite(+date) && date.toISOString().slice(0, 10) === value
}
const advance = (date, weeks) => { const d = new Date(`${date}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + weeks * 7); return d.toISOString().slice(0, 10) }
const quantity = value => typeof value === 'string' && /^[1-9]\d*$/.test(value) ? Number(value) : NaN
const optionText = options => Object.entries(options).map(([label, value]) => `${label}: ${value}`).join(' · ')
const owned = (req, order) => order && order.meta?.account_id === req.store.user?.id ? order : null
const ownOrders = req => ownedOrders(req, 'chewy').filter(order => owned(req, order))
const ownOrder = (req, id) => owned(req, ownedOrder(req, id, 'chewy'))
const fields = (values, specs) => specs.map(([key, label, type = 'text', required = true]) => `<label>${esc(label)}<input name="${key}" type="${type}" value="${esc(clean(values[key]))}"${required ? ' required' : ''}></label>`).join('')
const select = (name, label, values, current = '', blank = '') => `<label>${esc(label)}<select name="${name}" required>${blank ? `<option value="">${esc(blank)}</option>` : ''}${values.map(v => { const [value, title] = Array.isArray(v) ? v : [v, v]; return `<option value="${esc(value)}"${String(current) === String(value) ? ' selected' : ''}>${esc(title)}</option>` }).join('')}</select></label>`
const errorsHtml = errors => errors.length ? `<div class="error" role="alert"><ul>${errors.map(e => `<li>${esc(e)}</li>`).join('')}</ul></div>` : ''
const notice = text => `<p class="ch-notice" role="status">${esc(text)}</p>`
const scheduleLimit = '<p class="ch-notice">This saved schedule does not automatically charge your card or send a shipment. When you are ready, add the items to your cart and complete checkout. No payment details are saved with your schedule.</p>'
const helpTopics = [
  ['shipping', 'Shipping & delivery', 'Review your delivery address at checkout. The order page shows the address you submitted. Each order page shows the current status of your order.', '/account/orders', 'View your orders'],
  ['autoship', 'Manage Autoship', 'Save eligible food and care supplies with an address and a date. Changing the cadence keeps the next date. Changing the date keeps the cadence. Skip moves the date forward by one cadence. Cancelling stops the saved plan. Neither action places an order.', '/account/autoship', 'Manage your schedules'],
  ['returns', 'Cancellations & returns', 'A processing order can be cancelled from its details. A return request becomes available only after an order has a delivered status. Saving a request does not by itself arrange a shipment or issue a refund.', '/account/orders', 'Find an order'],
  ['selection', 'Choose supplies for your pet', 'Compare intended species, dimensions, life stage and size or pack on each product page. Follow the instructions on the exact food package. Guides help organize shopping; they do not provide a feeding plan or medical advice.', '/guides', 'Explore pet guides'],
  ['account', 'Your account & saved details', 'My Pets, addresses, Autoship schedules and support receipts belong to the signed-in account in this browser. Signing out hides those details. Save a default address to prefill your next checkout.', '/account', 'Manage your account'],
]

// Build a complete candidate before changing the canonical cart. Both per-option
// and aggregate product stock are checked, including existing cart quantities.
export function prepareAutoshipCart(cart, items, { productById, selectedProduct, stockLimit }) {
  const candidate = cart.map(line => ({ ...line, options: { ...line.options } }))
  for (const item of items) {
    const original = productById(item.pid)
    if (!original?.autoship) return { error: 'An item is no longer eligible for Autoship. Update your schedule.' }
    const key = item.pid + ':' + Object.values(item.options).join('|')
    const existing = candidate.find(line => line.pid === item.pid && (line.key || line.pid) === key)
    if (existing) existing.qty += item.qty
    else candidate.push({ pid: item.pid, key, options: { ...item.options }, qty: item.qty })
  }
  const totals = new Map()
  for (const line of candidate) {
    const original = productById(line.pid)
    if (!original || Object.entries(original.options || {}).some(([label, allowed]) => !allowed.includes(line.options[label]))) return { error: 'A cart item or option is unavailable. Review your cart.' }
    const selected = selectedProduct(original, line.options)
    if (!selected || !Number.isInteger(line.qty) || line.qty < 1 || line.qty > stockLimit(selected)) return { error: 'These items would exceed the available quantity. Review your cart or schedule.' }
    totals.set(line.pid, (totals.get(line.pid) || 0) + line.qty)
  }
  if ([...totals].some(([pid, qty]) => qty > stockLimit(productById(pid)))) return { error: 'These items would exceed the available quantity. Review your cart or schedule.' }
  return { cart: candidate }
}

export function chewyJourneys(router, context) {
  const { render, products, productById, selectedProduct, stockLimit, cards, artwork } = context
  const state = req => { const r = retailState(req); r.pets ||= []; r.autoship ||= []; r.guides ||= {}; return r }
  function bridge(req) {
    const r = state(req)
    // Import the pre-journey list only once, into the owner active when first
    // encountered. Subsequent sign-ins bind the legacy PDP view to that owner.
    if (!req.store.chewyFavoritesMigrated) {
      if (Array.isArray(req.store.favorites)) r.favorites = [...new Set([...r.favorites, ...req.store.favorites.filter(id => productById(id))])]
      req.store.chewyFavoritesMigrated = true
    }
    req.store.favorites = r.favorites
  }
  router.use((req, res, next) => { bridge(req); next() })
  router.get('/product/:id', (req, res, next) => { if (productById(req.params.id)) rememberProduct(req, req.params.id); next() })
  const nav = (b, current) => {
    const destinations = [['Overview','/account'],['My Pets','/account/pets'],['Autoship','/account/autoship'],['Orders','/account/orders'],['Addresses','/account/addresses'],['Favorites','/favorites'],['Recently viewed','/recent'],['Support requests','/help/cases'],['Profile & preferences','/account/profile']]
    return `<div class="ch-account-menu"><button class="secondary" data-chewy-toggle="ch-account-links" aria-controls="ch-account-links" aria-expanded="true" hidden>Your account menu</button><nav id="ch-account-links" class="ch-account-nav" aria-label="Your account">${destinations.map(([label,path])=>`<a href="${b}${path}"${(path === '/account' ? current === path : current === path || current.startsWith(path+'/'))?' aria-current="page"':''}>${label}</a>`).join('')}</nav></div>`
  }
  const page = (req, res, title, body, status = 200) => render(req, res, title, `${nav(res.locals.base, req.path)}<section class="ch-journey"><h1>${esc(title)}</h1>${body}</section>`, status)
  const missing = (req, res) => page(req, res, 'We couldn’t find that page', `<p>Choose an item from your account to continue.</p>`, 404)
  const gate = (req, res, next) => req.store.user ? next() : res.redirect(`${res.locals.base}/account`)
  const scalarForm = (req, res, next) => Object.values(req.body).some(value => typeof value !== 'string') ? page(req, res, 'Please review your form', errorsHtml(['Choose one value for each field.']), 400) : next()
  router.use('/account', (req, res, next) => req.path === '/' ? next() : gate(req, res, next))
  router.use('/help/cases', gate)

  function accountPage(req, res, errors = [], values = {}, status = 200) {
    const b = res.locals.base, r = state(req)
    if (req.store.user && !errors.length) {
      const profile = r.profile || req.store.user
      return page(req, res, `Welcome, ${profile.first_name}`, `<p>A little care for every part of their day.</p><div class="ch-account-grid">${[
        ['My Pets', `${r.pets.length} pet ${r.pets.length === 1 ? 'profile' : 'profiles'}`, '/account/pets'], ['Autoship', `${r.autoship.filter(p => p.status === 'active').length} active schedules`, '/account/autoship'], ['Your orders', `${ownOrders(req).length} ${ownOrders(req).length === 1 ? 'order' : 'orders'} in this browser`, '/account/orders'], ['Address book', `${r.addresses.length} saved ${r.addresses.length === 1 ? 'address' : 'addresses'}`, '/account/addresses'], ['Your favorites', `${r.favorites.length} saved products`, '/favorites'], ['Support requests', `${r.cases.length} saved ${r.cases.length === 1 ? 'receipt' : 'receipts'}`, '/help/cases'],
      ].map(([title, copy, href]) => `<a class="ch-account-tile" href="${b}${href}"><h2>${title}</h2><p>${copy}</p><strong>View & manage →</strong></a>`).join('')}</div><form action="${b}/logout" method="post"><button class="secondary">Sign out</button></form>`)
    }
    return render(req, res, 'Your Chewy account', `<section class="ch-auth"><h1>Welcome, pet parent</h1><p>Sign in to keep your pets, plans and favorite things together.</p>${errorsHtml(errors)}<div class="ch-auth-grid"><form class="ch-form" action="${b}/account" method="post"><h2>Sign in</h2>${fields(values, [['email', 'Email address', 'email']])}<label>Password<input type="password" name="password" autocomplete="current-password" required></label><button>Sign in</button></form><form class="ch-form" action="${b}/account" method="post"><h2>New to Chewy?</h2><input type="hidden" name="mode" value="register">${fields(values, [['first_name', 'First name'], ['last_name', 'Last name'], ['email', 'Email address', 'email']])}<label>Password (8 or more characters)<input type="password" name="password" autocomplete="new-password" minlength="8" required></label><button>Create account</button></form></div></section>`, status)
  }
  router.get('/account', (req, res) => accountPage(req, res))
  router.post('/account', scalarForm, (req, res) => {
    const values = Object.fromEntries(['email', 'first_name', 'last_name'].map(key => [key, clean(req.body[key])]))
    const password = clean(req.body.password, 1000)
    let account
    if (req.body.mode === 'register') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email) || password.length < 8 || !values.first_name || !values.last_name) return accountPage(req, res, ['Enter your name, a valid email and a password with at least 8 characters.'], values, 400)
      account = createAccount('chewy', { ...values, password })
      if (account.error) return accountPage(req, res, [account.error], values, 400)
    } else {
      account = authenticate('chewy', values.email, password)
      if (!account) return accountPage(req, res, ['The email or password did not match. Please try again.'], values, 400)
    }
    req.store.user = publicAccount(account)
    bridge(req)
    res.redirect(`${res.locals.base}/account`)
  })
  router.post('/logout', (req, res) => { req.store.user = null; bridge(req); res.redirect(`${res.locals.base}/`) })
  function profilePage(req, res, errors = [], values = state(req).profile || req.store.user, status = 200) {
    const b = res.locals.base
    page(req, res, 'Profile & shopping preferences', `${errorsHtml(errors)}<p>Sign-in email: ${esc(req.store.user.email)}</p><form class="ch-form" action="${b}/account/profile" method="post">${fields(values, [['first_name', 'First name'], ['last_name', 'Last name'], ['phone', 'Phone number (optional)', 'tel', false]])}${select('shopping', 'What do you like to shop for?', preferences, values.shopping || preferences[0])}<button>Save profile</button></form>`, status)
  }
  router.get('/account/profile', (req, res) => profilePage(req, res))
  router.post('/account/profile', scalarForm, (req, res) => {
    const v = Object.fromEntries(['first_name', 'last_name', 'phone', 'shopping'].map(key => [key, clean(req.body[key])])), errors = []
    if (!v.first_name || !v.last_name) errors.push('Enter your first and last name.')
    if (v.phone && !/^[+\d\s().-]{7,25}$/.test(v.phone)) errors.push('Enter a valid phone number.')
    if (!preferences.includes(v.shopping)) errors.push('Choose a shopping preference.')
    if (errors.length) return profilePage(req, res, errors, v, 400)
    state(req).profile = v
    res.redirect(`${res.locals.base}/account`)
  })
  for (const [route, title, key] of [['/favorites', 'Your favorites', 'favorites'], ['/recent', 'Recently viewed', 'recent']]) router.get(route, (req, res) => {
    const b = res.locals.base, list = state(req)[key].map(productById).filter(Boolean)
    page(req, res, title, `<p>${key === 'favorites' ? 'Save the things they love from any product page.' : 'Pick up where you left off.'}</p>${list.length ? cards(b, list) : `<p>Your list is waiting. <a href="${b}/search">Explore pet supplies</a>.</p>`}`)
  })
  router.post('/favorites', scalarForm, (req, res) => {
    const p = productById(req.body.id)
    if (!p) return missing(req, res)
    const options = {}
    for (const [key, value] of Object.entries(req.body)) {
      if (!key.startsWith('option_')) continue
      const label = key.slice(7)
      if (!Object.hasOwn(p.options, label) || (value && !p.options[label].includes(value))) return page(req, res, 'Review your selection', errorsHtml(['Choose only options offered for this product.']), 400)
      if (value) options[label] = value
    }
    if (Object.keys(options).length === Object.keys(p.options).length && !selectedProduct(p, options)) return page(req, res, 'Review your selection', errorsHtml(['Choose an available combination.']), 400)
    toggleFavorite(req, p.id)
    bridge(req)
    res.redirect(`${res.locals.base}/product/${p.id}${Object.keys(options).length ? '?' + new URLSearchParams(options) : ''}`)
  })

  function petForm(req, res, pet = {}, errors = [], status = 200) {
    const b = res.locals.base
    page(req, res, pet.id ? `Edit ${pet.name || 'your pet'}` : 'Add a pet', `${errorsHtml(errors)}<form class="ch-form" method="post" action="${b}/account/pets${pet.id ? '/' + pet.id : ''}">${fields(pet, [['name', 'Pet name']])}${select('species', 'Species', species, pet.species, 'Choose a species')}${fields(pet, [['breed', 'Breed or animal type (optional)', 'text', false]])}<label>Birthday (optional)<input type="date" name="birthday" min="1900-01-01" max="${today()}" value="${esc(pet.birthday || '')}"></label>${select('lifeStage', 'Life stage', stages, pet.lifeStage || 'Unknown')}${select('preference', 'Shopping interests', preferences, pet.preference || preferences[0])}<p>These details help organize shopping. Check product suitability and package instructions for your pet.</p><button>Save pet</button></form>`, status)
  }
  router.get('/account/pets', (req, res) => { const b = res.locals.base; page(req, res, 'My Pets', `<p>The best part of your day, all in one place.</p><a class="button" href="${b}/account/pets/new">Add a pet</a><div class="ch-account-grid">${state(req).pets.map(p => `<article class="ch-account-tile"><p class="eyebrow">${esc(p.species)}</p><h2>${esc(p.name)}</h2><p>${esc([p.breed, p.lifeStage, p.birthday].filter(Boolean).join(' · '))}</p><p>${esc(p.preference)}</p><a href="${b}/account/pets/${p.id}">Edit pet</a> · <a href="${b}/guides/${slugify(p.species)}?pet_id=${p.id}">Shop for ${esc(p.name)}</a><form action="${b}/account/pets/${p.id}/delete" method="post"><button class="secondary">Remove pet</button></form></article>`).join('')}</div>${state(req).pets.length ? '' : '<p>Add your first pet to personalize a shopping checklist.</p>'}`) })
  router.get('/account/pets/new', (req, res) => petForm(req, res))
  router.get('/account/pets/:id', (req, res) => { const pet = state(req).pets.find(p => p.id === req.params.id); if (!pet) return missing(req, res); petForm(req, res, pet) })
  const savePet = (req, res) => {
    const r = state(req), existing = req.params.id && r.pets.find(p => p.id === req.params.id)
    if (req.params.id && !existing) return missing(req, res)
    const v = Object.fromEntries(['name', 'species', 'breed', 'birthday', 'lifeStage', 'preference'].map(key => [key, clean(req.body[key])])), errors = []
    if (!v.name) errors.push('Enter your pet’s name.')
    if (!species.includes(v.species)) errors.push('Choose a species.')
    if (!stages.includes(v.lifeStage)) errors.push('Choose a life stage.')
    if (!preferences.includes(v.preference)) errors.push('Choose a shopping interest.')
    if (v.birthday && (!validDate(v.birthday) || v.birthday > today())) errors.push('Enter a real birthday that is today or earlier.')
    if (!existing && r.pets.length >= 20) errors.push('Remove a pet before adding another.')
    if (errors.length) return petForm(req, res, { ...v, id: existing?.id }, errors, 400)
    if (existing) Object.assign(existing, v)
    else r.pets.push({ ...v, id: uid('pet') })
    res.redirect(`${res.locals.base}/account/pets`)
  }
  router.post('/account/pets', scalarForm, savePet)
  router.post('/account/pets/:id', scalarForm, savePet)
  router.post('/account/pets/:id/delete', scalarForm, (req, res) => { const r = state(req); if (!r.pets.some(p => p.id === req.params.id)) return missing(req, res); r.pets = r.pets.filter(p => p.id !== req.params.id); for (const plan of r.autoship) if (plan.pet_id === req.params.id) plan.pet_id = ''; delete r.guides['pet:' + req.params.id]; res.redirect(`${res.locals.base}/account/pets`) })

  const addressLabel = a => `${a.label || a.name} — ${a.line1}, ${a.city} ${a.postal_code}`
  function addressForm(req, res, address = {}, errors = [], status = 200) {
    page(req, res, address.id ? 'Edit address' : 'Add an address', `${errorsHtml(errors)}<form class="ch-form" action="${res.locals.base}/account/addresses${address.id ? '/' + address.id : ''}" method="post">${fields(address, [['label', 'Address nickname (optional)', 'text', false], ['name', 'Recipient name'], ['line1', 'Street address'], ['line2', 'Apartment or suite (optional)', 'text', false], ['city', 'City'], ['state', 'State (two-letter code)'], ['postal_code', 'ZIP code'], ['phone', 'Phone number (optional)', 'tel', false]])}<label class="ch-check"><input type="checkbox" name="is_default" value="yes"${address.is_default ? ' checked' : ''}>Use as my default checkout address</label><button>Save address</button></form>`, status)
  }
  router.get('/account/addresses', (req, res) => { const b = res.locals.base; page(req, res, 'Address book', `<p>Your default address is ready at checkout. You can review it before paying.</p><a class="button" href="${b}/account/addresses/new">Add an address</a><div class="ch-account-grid">${state(req).addresses.map(a => `<article class="ch-account-tile"><h2>${esc(a.label || a.name)}</h2>${a.is_default ? '<p class="ch-status">Default address</p>' : ''}<p>${esc(a.name)}<br>${esc(a.line1)} ${esc(a.line2)}<br>${esc(a.city)}, ${esc(a.state)} ${esc(a.postal_code)}</p><a href="${b}/account/addresses/${a.id}">Edit address</a><div class="ch-actions">${!a.is_default ? `<form method="post" action="${b}/account/addresses/${a.id}/default"><button class="secondary">Make default</button></form>` : ''}<form method="post" action="${b}/account/addresses/${a.id}/delete"><button class="secondary">Remove address</button></form></div></article>`).join('')}</div>`) })
  router.get('/account/addresses/new', (req, res) => addressForm(req, res))
  router.get('/account/addresses/:id', (req, res) => { const a = state(req).addresses.find(a => a.id === req.params.id); if (!a) return missing(req, res); addressForm(req, res, a) })
  const addressSave = (req, res) => {
    if (req.params.id && !state(req).addresses.some(a => a.id === req.params.id)) return missing(req, res)
    if (!/^[a-z]{2}$/i.test(clean(req.body.state))) return addressForm(req, res, { ...req.body, id: req.params.id }, ['Use a two-letter state code.'], 400)
    const result = saveAddress(req, { ...req.body, state: clean(req.body.state).toUpperCase(), id: req.params.id }, { country: 'US' })
    if (result.errors) return addressForm(req, res, { ...result.values, id: req.params.id, is_default: req.body.is_default === 'yes' }, result.errors, 400)
    res.redirect(`${res.locals.base}/account/addresses`)
  }
  router.post('/account/addresses', scalarForm, addressSave)
  router.post('/account/addresses/:id', scalarForm, addressSave)
  router.post('/account/addresses/:id/default', scalarForm, (req, res) => { const list = state(req).addresses; if (!list.some(a => a.id === req.params.id)) return missing(req, res); list.forEach(a => { a.is_default = a.id === req.params.id }); res.redirect(`${res.locals.base}/account/addresses`) })
  router.post('/account/addresses/:id/delete', scalarForm, (req, res) => { const r = state(req); if (!r.addresses.some(a => a.id === req.params.id)) return missing(req, res); if (r.autoship.some(p => p.status === 'active' && p.address_id === req.params.id)) return page(req, res, 'This address is part of a schedule', `<p>Choose a different address for its active Autoship schedules or cancel them before removing this address.</p><a href="${res.locals.base}/account/autoship">Manage Autoship</a>`, 400); deleteAddress(req, req.params.id); res.redirect(`${res.locals.base}/account/addresses`) })

  function itemInput(body) {
    const p = productById(body.product_id), errors = []
    if (!p?.autoship) return { errors: ['Choose an eligible Autoship product.'] }
    const options = Object.fromEntries(Object.entries(p.options).map(([label, allowed]) => { const value = clean(body['option_' + label]); if (!allowed.includes(value)) errors.push(`Choose an available ${label.toLowerCase()}.`); return [label, value] }))
    if (Object.keys(body).some(key => key.startsWith('option_') && !Object.hasOwn(p.options, key.slice(7)))) errors.push('Choose only options offered for this product.')
    const selected = errors.length ? null : selectedProduct(p, options), qty = quantity(body.qty)
    if (!selected || !stockLimit(selected)) errors.push('This option is currently unavailable.')
    if (!Number.isInteger(qty) || qty < 1 || qty > stockLimit(p) || (selected && qty > stockLimit(selected))) errors.push('Choose an available whole-number quantity.')
    return { errors, item: { pid: p.id, options, qty, key: p.id + ':' + Object.values(options).join('|') } }
  }
  const selectedLink = (b, p, options = {}) => b + '/product/' + p.id + (Object.keys(options).length ? '?' + new URLSearchParams(options) : '')
  const productChooser = (b, action, p, v = {}) => {
    const options = p ? Object.fromEntries(Object.keys(p.options).filter(label => p.options[label].includes(v['option_'+label])).map(label => [label, v['option_'+label]])) : {}
    const offer = p && (selectedProduct(p, options) || p)
    return `<form class="ch-form ch-picker" action="${b}${action}" method="get">${select('product_id', 'Choose an eligible product', products.filter(p => p.autoship).map(p => [p.id, p.title]), p?.id, 'Choose a product')}<button class="secondary">Choose product</button></form>${p ? `<a class="ch-chosen-product" href="${esc(selectedLink(b,p,options))}">${artwork(offer)}<span><strong>${esc(p.title)}</strong><small>${esc(Object.values(options).join(' · ') || p.pack)} · ${money(offer.price)}</small><small>View product details →</small></span></a>` : ''}`
  }
  const itemFields = (p, v = {}) => `<input type="hidden" name="product_id" value="${p.id}">${Object.entries(p.options).map(([label, opts]) => select('option_' + label, label, opts, v['option_' + label], 'Choose ' + label.toLowerCase())).join('')}<label>Quantity<input name="qty" type="number" min="1" max="${stockLimit(p)}" value="${esc(v.qty || '1')}" required></label>`
  function newPlan(req, res, errors = [], v = req.query, status = 200) {
    const b = res.locals.base, r = state(req), p = productById(v.product_id)
    if (v.product_id && !p?.autoship) return missing(req, res)
    page(req, res, 'Start an Autoship schedule', `${scheduleLimit}${errorsHtml(errors)}${!r.addresses.length ? `<p>Add a delivery address before saving a schedule.</p><a class="button" href="${b}/account/addresses/new">Add an address</a>` : `${productChooser(b, '/account/autoship/new', p, v)}${p ? `<form class="ch-form" action="${b}/account/autoship" method="post">${fields(v, [['name', 'Schedule name']])}${itemFields(p, v)}${select('cadence', 'How often?', cadences.map(n => [n, `Every ${n} weeks`]), v.cadence || 4)}<label>Next date<input name="next_date" type="date" min="${today()}" value="${esc(v.next_date || advance(today(), 4))}" required></label>${select('address_id', 'Delivery address', r.addresses.map(a => [a.id, addressLabel(a)]), v.address_id || r.addresses.find(a => a.is_default)?.id)}<label>Pet (optional)<select name="pet_id"><option value="">All my pets</option>${r.pets.map(p => `<option value="${p.id}"${v.pet_id === p.id ? ' selected' : ''}>${esc(p.name)}</option>`).join('')}</select></label><button>Save schedule</button></form>` : ''}`}`, status)
  }
  router.get('/autoship', (req, res) => render(req, res, 'Meet Autoship', `<section class="ch-service"><p class="eyebrow">A little planning. A lot of love.</p><h1>Keep their routine together</h1><p>Save eligible food and care supplies, choose an address, and plan your next shopping date. Adjust items, skip a date or cancel whenever your routine changes.</p>${scheduleLimit}<div class="ch-actions"><a class="button" href="${res.locals.base}/account/autoship">Manage Autoship</a><a href="${res.locals.base}/search?autoship=eligible">Shop eligible essentials</a></div></section>`))
  router.get('/account/autoship', (req, res) => { const b = res.locals.base; page(req, res, 'Your Autoship schedules', `${scheduleLimit}<a class="button" href="${b}/account/autoship/new">Start a schedule</a><div class="ch-account-grid">${state(req).autoship.map(p => `<article class="ch-account-tile"><p class="ch-status">${esc(p.status)}</p><h2>${esc(p.name)}</h2><p>${p.items.length} ${p.items.length === 1 ? 'item' : 'items'} · Every ${p.cadence} weeks</p><p>${p.status === 'active' ? 'Next date: ' + esc(p.next_date) : 'No upcoming date'}</p><a href="${b}/account/autoship/${p.id}">View schedule</a></article>`).join('')}</div>`) })
  router.get('/account/autoship/new', (req, res) => newPlan(req, res))
  router.post('/account/autoship', scalarForm, (req, res) => {
    const r = state(req), v = req.body, result = itemInput(v), errors = [...result.errors], cadence = Number(v.cadence)
    if (!clean(v.name)) errors.push('Give your schedule a name.')
    if (!cadences.includes(cadence) || !/^\d+$/.test(v.cadence)) errors.push('Choose a cadence of 2, 4, 6 or 8 weeks.')
    if (!validDate(v.next_date) || v.next_date < today()) errors.push('Choose a real next date that is today or later.')
    if (!r.addresses.some(a => a.id === v.address_id)) errors.push('Choose an address from your address book.')
    if (v.pet_id && !r.pets.some(p => p.id === v.pet_id)) errors.push('Choose one of your pets.')
    if (r.autoship.length >= 30) errors.push('You have reached the saved schedule limit.')
    if (errors.length) return newPlan(req, res, errors, v, 400)
    const plan = { id: uid('autoship'), name: clean(v.name), cadence, next_date: v.next_date, address_id: v.address_id, pet_id: clean(v.pet_id), items: [result.item], status: 'active', events: [] }
    r.autoship.push(plan)
    res.redirect(`${res.locals.base}/account/autoship/${plan.id}`)
  })
  function planPage(req, res, plan, errors = [], values = {}, status = 200) {
    const b = res.locals.base, r = state(req), address = r.addresses.find(a => a.id === plan.address_id), p = productById(values.product_id || req.query.product_id), action = `${b}/account/autoship/${plan.id}/action`
    const form = (actionName, body, label) => `<form class="ch-form" action="${action}" method="post"><input name="action" type="hidden" value="${actionName}">${body}<button${actionName === 'cancel' ? ' class="secondary"' : ''}>${label}</button></form>`
    const active = plan.status === 'active'
    const panel = (id, title, summary, content, isOpen = false) => `<details class="ch-plan-panel"${isOpen || values.action === id ? ' open' : ''}><summary><strong>${title}</strong><span>${esc(summary)}</span></summary>${content}</details>`
    const items = plan.items.map(item => {
      const original = productById(item.pid), selected = original && selectedProduct(original, item.options)
      return `<article class="ch-plan-item"><div class="ch-plan-product">${original ? `<a class="ch-plan-photo" href="${esc(selectedLink(b,original,item.options))}" aria-label="View ${esc(original.title)}">${artwork(selected || original)}</a>` : ''}<div><h2>${original ? `<a href="${esc(selectedLink(b,original,item.options))}">${esc(original.title)}</a>` : 'Unavailable item'}</h2><p>${esc(optionText(item.options) || original?.pack || '')} · Quantity ${item.qty}</p><p>${selected ? money(selected.price) + ' each at today’s catalog price' : 'Review availability'}</p></div></div>${active ? `<form action="${action}" method="post"><input type="hidden" name="item_key" value="${esc(item.key)}"><label>Quantity<input name="qty" type="number" min="1" max="${selected ? stockLimit(selected) : 1}" value="${esc(values.action === 'quantity' && values.item_key === item.key ? clean(values.qty) : String(item.qty))}"></label><button name="action" value="quantity">Update quantity</button><button class="secondary" name="action" value="remove">Remove item</button></form>` : ''}</article>`
    }).join('')
    page(req, res, plan.name, `${scheduleLimit}${errorsHtml(errors)}<p class="ch-status">${esc(plan.status)}</p><div class="ch-plan-overview"><div><span>Next shopping date</span><strong>${active ? esc(plan.next_date) : 'No upcoming date'}</strong></div><div><span>Shopping routine</span><strong>Every ${plan.cadence} weeks</strong></div><div><span>Delivery address</span><strong>${address ? esc(addressLabel(address)) : 'Address no longer saved'}</strong></div></div><div class="section-heading"><h2>Items in your schedule</h2><span>${plan.items.length} ${plan.items.length===1?'item':'items'}</span></div><div class="ch-plan-items">${items}</div>${active ? `<div class="ch-plan-controls"><section><h2>Manage your routine</h2>${panel('cadence','Change frequency', 'Every '+plan.cadence+' weeks', form('cadence', select('cadence', 'How often after the next date?', cadences.map(n => [n, `Every ${n} weeks`]), values.cadence || plan.cadence) + '<p>Changing this keeps your next date.</p>', 'Save cadence'))}${panel('date','Change next date', plan.next_date, form('date', `<label>Next date<input name="next_date" type="date" min="${today()}" value="${esc(values.next_date || plan.next_date)}" required></label><p>Changing this keeps your cadence.</p>`, 'Save next date'))}${panel('address','Delivery address', address?.label || 'Choose an address', form('address', select('address_id', 'Delivery address', r.addresses.map(a => [a.id, addressLabel(a)]), values.address_id || plan.address_id), 'Save delivery address'))}${panel('skip','Skip the next date','Move ahead by '+plan.cadence+' weeks',form('skip', `<p>Skip once advances your next date by ${plan.cadence} weeks.</p>`, 'Skip next date'))}${panel('cancel','Cancel this schedule','Your orders and other schedules stay saved',form('cancel', '<label class="ch-check"><input type="checkbox" name="confirm" value="yes" required>Cancel future dates for this schedule</label><p>Your orders and other schedules stay in your account.</p>', 'Cancel schedule'))}</section><section><h2>Ready to shop?</h2>${form('order-now', '<p>Add all scheduled quantities to your current cart. Review the combined quantities and current prices, then complete checkout. Your next date stays the same.</p>', 'Add schedule to cart')}${panel('add','Add another essential','Choose from eligible food and care supplies', productChooser(b, '/account/autoship/' + plan.id, p?.autoship ? p : null, values) + (p?.autoship ? form('add', itemFields(p, values), 'Add item') : ''), Boolean(p?.autoship))}</section></div>` : '<p>This schedule is cancelled. It cannot place an order or create future dates.</p>'}${plan.events.length ? `<details class="ch-plan-panel"><summary><strong>Schedule history</strong><span>${plan.events.length} updates</span></summary><ul>${plan.events.map(e => `<li>${esc(e.date)} — ${esc(e.description)}</li>`).join('')}</ul></details>` : ''}`, status)
  }
  router.get('/account/autoship/:id', (req, res) => { const plan = state(req).autoship.find(p => p.id === req.params.id); if (!plan) return missing(req, res); if (req.query.product_id && !productById(req.query.product_id)?.autoship) return missing(req, res); planPage(req, res, plan) })
  router.post('/account/autoship/:id/action', scalarForm, (req, res) => {
    const r = state(req), plan = r.autoship.find(p => p.id === req.params.id), v = req.body
    if (!plan) return missing(req, res)
    if (plan.status !== 'active') return planPage(req, res, plan, ['This schedule is cancelled. Start a new schedule to plan another routine.'], v, 400)
    const fail = message => planPage(req, res, plan, [message], v, 400)
    let description
    if (v.action === 'cadence') {
      if (!/^\d+$/.test(v.cadence) || !cadences.includes(Number(v.cadence))) return fail('Choose a cadence of 2, 4, 6 or 8 weeks.')
      plan.cadence = Number(v.cadence); description = `Cadence changed to ${plan.cadence} weeks; next date unchanged.`
    } else if (v.action === 'date') {
      if (!validDate(v.next_date) || v.next_date < today()) return fail('Choose a real next date that is today or later.')
      plan.next_date = v.next_date; description = 'Next date changed; cadence unchanged.'
    } else if (v.action === 'address') {
      if (!r.addresses.some(a => a.id === v.address_id)) return fail('Choose an address from your address book.')
      plan.address_id = v.address_id; description = 'Delivery address changed.'
    } else if (v.action === 'skip') {
      const next = advance(plan.next_date, plan.cadence)
      if (!validDate(next)) return fail('Choose an earlier next date before skipping.')
      plan.next_date = next; description = 'Skipped one date; no order placed.'
    } else if (v.action === 'cancel') {
      if (v.confirm !== 'yes') return fail('Confirm that you want to cancel this schedule.')
      plan.status = 'cancelled'; description = 'Schedule cancelled; no order placed.'
    } else if (['add', 'quantity', 'remove'].includes(v.action)) {
      let items = plan.items.map(item => ({ ...item, options: { ...item.options } }))
      if (v.action === 'add') {
        const result = itemInput(v)
        if (result.errors.length) return planPage(req, res, plan, result.errors, v, 400)
        const existing = items.find(item => item.key === result.item.key)
        if (existing) existing.qty += result.item.qty
        else items.push(result.item)
      } else {
        const item = items.find(item => item.key === v.item_key)
        if (!item) return fail('Choose an item in this schedule.')
        if (v.action === 'remove') { if (items.length === 1) return fail('A schedule needs at least one item. Cancel it to remove the final item.'); items = items.filter(x => x !== item) }
        else item.qty = quantity(v.qty)
      }
      const check = prepareAutoshipCart([], items, context)
      if (check.error) return fail(check.error)
      plan.items = items; description = 'Scheduled items updated.'
    } else if (v.action === 'order-now') {
      if (!r.addresses.some(a => a.id === plan.address_id)) return fail('Save a delivery address before adding this schedule to your cart.')
      const result = prepareAutoshipCart(req.store.cart, plan.items, context)
      if (result.error) return fail(result.error)
      req.store.cart = result.cart
      // Preserve the prior review fingerprint so a stale checkout POST rejects.
      plan.events.unshift({ date: today(), description: 'Items added to cart; checkout still required.' })
      return res.redirect(`${res.locals.base}/cart`)
    } else return fail('Choose a schedule action.')
    plan.events.unshift({ date: today(), description }); plan.events = plan.events.slice(0, 50)
    res.redirect(`${res.locals.base}/account/autoship/${plan.id}`)
  })

  router.get('/account/orders', (req, res) => { const b = res.locals.base, orders = ownOrders(req); page(req, res, 'Your orders', `${orders.length ? `<div class="ch-account-grid">${orders.map(o => `<article class="ch-account-tile"><h2>${esc(o.order_number)}</h2><p>${esc(orderStatus(o).replaceAll('_', ' '))} · ${money(o.totals.total)}</p><p>${o.items.map(i => esc(i.title)).join('<br>')}</p><a href="${b}/account/orders/${o.id}">Order details</a></article>`).join('')}</div>` : `<p>No orders for this account in this browser yet.</p><a href="${b}/search">Find their next favorite</a>`}`) })
  function orderPage(req, res, order, errors = [], reason = '', status = 200) {
    const b = res.locals.base, current = orderStatus(order)
    page(req, res, `Order ${order.order_number}`, `${errorsHtml(errors)}<p class="ch-status">${esc(current.replaceAll('_', ' '))}</p><p>${current === 'cancelled' ? 'This order is cancelled. No shipment is scheduled.' : current === 'return_requested' ? 'Your return request is saved. No return label or refund has been issued.' : 'Tracking information will appear here once your order ships.'}</p><div class="ch-order-items">${order.items.map(i => `<p>${esc(i.title)} × ${i.qty}<strong>${money(i.unit_price * i.qty)}</strong></p>`).join('')}<p>Total<strong>${money(order.totals.total)}</strong></p></div><h2>Delivery address</h2><p>${esc(order.shipping_address.line1)}, ${esc(order.shipping_address.city)}, ${esc(order.shipping_address.state)} ${esc(order.shipping_address.postal_code)}</p><p>Paid by ${esc(order.payment.brand)} ending in ${esc(order.payment.last4)}.</p>${['processing', 'delivered'].includes(current) ? `<form class="ch-form" action="${b}/account/orders/${order.id}/action" method="post"><input type="hidden" name="action" value="${current === 'processing' ? 'cancel' : 'return'}"><label>Reason<textarea name="reason" required maxlength="1000">${esc(reason)}</textarea></label><button>${current === 'processing' ? 'Cancel order' : 'Request a return'}</button><p>${current === 'processing' ? 'Save a cancellation for this processing order. This does not issue a refund.' : 'Save a return request for this delivered order. No return label or refund is issued.'}</p></form>` : ''}<p><a href="${b}/help/cases/new?order_id=${order.id}">Get help with this order</a></p>`, status)
  }
  router.get('/account/orders/:id', (req, res) => { const order = ownOrder(req, req.params.id); if (!order) return missing(req, res); orderPage(req, res, order) })
  router.post('/account/orders/:id/action', scalarForm, (req, res) => { const order = ownOrder(req, req.params.id); if (!order) return missing(req, res); const result = requestOrderAction(req, order.id, clean(req.body.action), clean(req.body.reason, 1000), 'chewy'); if (result.error) return orderPage(req, res, order, [result.error], clean(req.body.reason, 1000), result.status); res.redirect(`${res.locals.base}/account/orders/${order.id}`) })

  router.get('/help', (req, res) => {
    const b = res.locals.base, q = clean(req.query.q), matches = helpTopics.filter(topic => topic.slice(1, 3).join(' ').toLowerCase().includes(q.toLowerCase()))
    render(req, res, 'Help Center', `<section class="ch-help"><h1>How can we help your pack?</h1><form class="ch-help-search" action="${b}/help"><label>Search help<input name="q" type="search" value="${esc(q)}" placeholder="Try Autoship, returns or delivery"></label><button>Search help</button></form><p>${matches.length} topics</p><div class="ch-account-grid">${matches.map(([id, title, text]) => `<a class="ch-account-tile" href="${b}/help/topics/${id}" id="${id}"><h2>${title}</h2><p>${esc(text.slice(0, text.indexOf('.') + 1))}</p>Read topic →</a>`).join('')}</div>${!matches.length ? `<p>No topics match that search. Try “account” or “Autoship”.</p>` : ''}<div class="ch-guide-banner"><h2>Keep a support request with your account</h2><p>Save the details of a question and view its receipt anytime in this browser.</p><a class="button" href="${b}/help/cases/new">Save a support request</a> <a href="${b}/help/cases">View your requests</a></div></section>`)
  })
  router.get('/help/topics/:id', (req, res) => { const topic = helpTopics.find(t => t[0] === req.params.id); if (!topic) return missing(req, res); const b = res.locals.base; render(req, res, topic[1], `<section class="ch-service"><p><a href="${b}/help">Help Center</a></p><h1>${topic[1]}</h1><p>${topic[2]}</p><a class="button" href="${b}${topic[3]}">${topic[4]}</a><p><a href="${b}/help/cases/new">Save a support request</a></p></section>`) })
  function caseForm(req, res, errors = [], values = req.query, status = 200) {
    const b = res.locals.base
    page(req, res, 'Save a support request', `${errorsHtml(errors)}<p>Your request is saved in your account.</p>${publicNotice('<p>This is not the real Chewy website: it does not contact Chewy or send an email, and there is no live agent response.</p>')}<form class="ch-form" method="post" action="${b}/help/cases">${select('category', 'Topic', helpTopics.map(t => [t[0], t[1]]), values.category, 'Choose a topic')}${fields({ ...values, email: values.email || req.store.user.email }, [['email', 'Contact email', 'email'], ['subject', 'Subject']])}<label>Order (optional)<select name="order_id"><option value="">Not about an order</option>${ownOrders(req).map(o => `<option value="${o.id}"${values.order_id === o.id ? ' selected' : ''}>${esc(o.order_number)}</option>`).join('')}</select></label><label>How can we help?<textarea name="message" minlength="10" maxlength="3000" required>${esc(clean(values.message, 3000))}</textarea></label><button>Save request</button></form>`, status)
  }
  router.get('/help/cases/new', (req, res) => { if (req.query.order_id && !ownOrder(req, req.query.order_id)) return missing(req, res); caseForm(req, res) })
  router.get('/help/cases', (req, res) => { const b = res.locals.base; page(req, res, 'Your support requests', `<a class="button" href="${b}/help/cases/new">Save a request</a><div class="ch-account-grid">${state(req).cases.map(c => `<a class="ch-account-tile" href="${b}/help/cases/${c.id}"><h2>${esc(c.subject)}</h2><p>Received · ${esc(c.created_at.slice(0, 10))}</p><span>${esc(c.id)}</span></a>`).join('')}</div>${state(req).cases.length ? '' : '<p>No saved requests yet.</p>'}`) })
  router.post('/help/cases', scalarForm, (req, res) => {
    const v = req.body, errors = []
    if (!helpTopics.some(t => t[0] === v.category)) errors.push('Choose a help topic.')
    if (v.order_id && !ownOrder(req, v.order_id)) errors.push('Choose an order from your account in this browser.')
    if (errors.length) return caseForm(req, res, errors, v, 400)
    const result = createSupportCase(req, v, 'chewy')
    if (result.errors) return caseForm(req, res, result.errors, result.values, 400)
    res.redirect(`${res.locals.base}/help/cases/${result.supportCase.id}`)
  })
  router.get('/help/cases/:id', (req, res) => { const c = state(req).cases.find(c => c.id === req.params.id); if (!c) return missing(req, res); page(req, res, 'Support request saved', `${notice('Received in your account.')}${publicNotice(notice('No message has been sent to Chewy.'))}<h2>${esc(c.subject)}</h2><p>Receipt ${esc(c.id)} · ${esc(c.created_at.slice(0, 10))}</p><p>${esc(helpTopics.find(t => t[0] === c.category)?.[1] || c.category)} · ${esc(c.email)}</p><p class="ch-message">${esc(c.message)}</p>${c.order_id && ownOrder(req, c.order_id) ? `<a href="${res.locals.base}/account/orders/${c.order_id}">View linked order</a>` : ''}<p><a href="${res.locals.base}/help/cases">All your requests</a></p>`) })

  router.get('/services/my-pets', (req, res) => render(req, res, 'My Pets', `<section class="ch-service"><h1>Their own little corner</h1><p>Save their name, species, birthday, life stage and favorite things. Build a shopping checklist around each companion.</p><a class="button" href="${res.locals.base}/account/pets">Meet My Pets</a></section>`))
  router.get('/services/insurance', (req, res) => render(req, res, 'Pet insurance information', '<section class="ch-service"><h1>Planning for their care</h1><p>Insurance coverage, eligibility, exclusions and pricing must be confirmed with a licensed provider. Chewy does not provide insurance quotes, enroll pets or process claims on this page.</p></section>'))
  function guideContext(req) {
    const petSpecies = species.find(s => slugify(s) === req.params.species)
    if (!petSpecies) return null
    const petId = clean(req.method === 'POST' ? req.body.pet_id : req.query.pet_id), pet = petId && req.store.user && state(req).pets.find(p => p.id === petId && p.species === petSpecies)
    if (petId && !pet) return null
    const list = products.filter(p => p.species.includes(petSpecies)), types = [...new Set(list.map(p => p.type))]
    return { petSpecies, pet, list, types, key: pet ? 'pet:' + pet.id : 'species:' + petSpecies }
  }
  router.get('/guides/:species', (req, res) => {
    const guide = guideContext(req); if (!guide) return missing(req, res)
    const { petSpecies, pet, list, types, key } = guide, b = res.locals.base, r = state(req), completed = req.store.user ? r.guides[key] || [] : [], name = pet?.name || 'your ' + petSpecies.toLowerCase(), matchingPets = req.store.user ? r.pets.filter(p => p.species === petSpecies) : []
    const relevant = list.filter(p => !pet || p.lifeStage === 'All Life Stages' || (pet.lifeStage === 'Adult' && p.lifeStage === 'Adult') || (pet.lifeStage === 'Young' && p.lifeStage === 'Puppy'))
    const foodFilter = pet?.lifeStage === 'Adult' && list.some(p => p.type === 'Food' && p.lifeStage === 'Adult') ? '&amp;lifeStage=Adult' : ''
    render(req, res, `${petSpecies} shopping guide`, `<section class="ch-journey"><p><a href="${b}/guides">All pet guides</a></p><h1>A shopping checklist for ${esc(name)}</h1><p>Compare intended species, size and care instructions before choosing. For food, follow the instructions on the exact package. These shopping ideas do not replace a veterinarian’s guidance.</p>${petSpecies === 'Small Pet' ? '<p>Rabbit food and hamster activity supplies have different uses. The compact activity habitat is not a permanent home. Check the intended animal on every item.</p>' : ''}${matchingPets.length ? `<form class="ch-form" action="${b}/guides/${slugify(petSpecies)}"><label>Shop for<select name="pet_id"><option value="">Any ${esc(petSpecies.toLowerCase())}</option>${matchingPets.map(p => `<option value="${p.id}"${p.id === pet?.id ? ' selected' : ''}>${esc(p.name)} · ${esc(p.lifeStage)}</option>`).join('')}</select></label><button class="secondary">Use this pet</button></form>` : ''}<p class="ch-status">${completed.length} of ${types.length} categories checked</p><form method="post" action="${b}/guides/${slugify(petSpecies)}"><input name="pet_id" type="hidden" value="${pet?.id || ''}"><div class="ch-guide-checklist">${types.map(type => `<div><label class="ch-check"><input type="checkbox" name="done" value="${esc(type)}"${completed.includes(type) ? ' checked' : ''}>${esc(type)}</label><a href="${b}/search?species=${encodeURIComponent(petSpecies)}&amp;type=${encodeURIComponent(type)}${type === 'Food' ? foodFilter : ''}">Compare ${esc(type.toLowerCase())} →</a></div>`).join('')}</div>${req.store.user ? '<button name="action" value="save">Save checklist</button> <button class="secondary" name="action" value="reset">Reset checklist</button>' : `<p><a href="${b}/account">Sign in to save your checklist</a>.</p>`}</form><h2>Ideas for ${esc(name)}</h2><p>${pet ? `Matched to ${esc(pet.species)} and ${esc(pet.lifeStage.toLowerCase())} or all-life-stage products. Confirm each item’s intended use.` : 'Start with supplies intended for this species.'}</p>${cards(b, relevant.slice(0, 4))}</section>`)
  })
  router.post('/guides/:species', gate, (req, res) => {
    const guide = guideContext(req); if (!guide) return missing(req, res)
    const done = req.body.done === undefined ? [] : Array.isArray(req.body.done) ? req.body.done : [req.body.done]
    if (!['save', 'reset'].includes(req.body.action) || typeof req.body.pet_id !== 'string' || done.some(v => typeof v !== 'string' || !guide.types.includes(v))) return page(req, res, 'Review your checklist', errorsHtml(['Choose categories from this guide.']), 400)
    state(req).guides[guide.key] = req.body.action === 'reset' ? [] : [...new Set(done)]
    res.redirect(`${res.locals.base}/guides/${req.params.species}${guide.pet ? '?pet_id=' + guide.pet.id : ''}`)
  })
}
