// Shared state primitives for brand-specific local customer-service screens.
// This module deliberately has no storefront HTML or automatic routes.
import { randomBytes } from 'node:crypto'
import { listOrders, getOrder, appendOrderEvent } from './orders.js'

const clean = (value, max = 240) => typeof value === 'string' ? value.trim().slice(0, max) : ''
const id = prefix => `${prefix}-${randomBytes(6).toString('hex')}`

export function retailState(req) {
  // Private saved details stay with the signed-in local account. Guest state
  // remains separate if a different account signs in on the same browser.
  const owner = req.store.user?.id || req.store.user?.email || 'guest'
  req.store.retailByOwner ||= Object.create(null)
  const state = req.store.retailByOwner[owner] ||= {}
  req.store.retail = state
  for (const key of ['favorites', 'recent', 'addresses', 'cases', 'savedForLater']) state[key] ||= []
  for (const key of ['preferences', 'questions', 'reviews']) state[key] ||= {}
  return state
}

export function rememberProduct(req, productId) {
  const state = retailState(req), value = clean(productId)
  if (!value) return
  state.recent = [value, ...state.recent.filter(item => item !== value)].slice(0, 24)
}

export function toggleFavorite(req, productId) {
  const state = retailState(req), value = clean(productId)
  if (!value) return false
  const exists = state.favorites.includes(value)
  state.favorites = exists ? state.favorites.filter(item => item !== value) : [...state.favorites, value].slice(-100)
  return !exists
}

export function ownedOrders(req, slug = req.storeSlug) {
  // The seeded login is intentionally shared between benchmark runs. Matching its
  // email must never reveal another browser session's order data.
  return listOrders({ store: slug }).filter(order => order.session_id === req.session.id)
}

export function ownedOrder(req, orderId, slug = req.storeSlug) {
  const order = getOrder(clean(orderId))
  return order?.store === slug && order.session_id === req.session.id ? order : null
}

export function orderStatus(order) {
  return order?.meta?.lifecycle?.at(-1)?.status || 'processing'
}

export function requestOrderAction(req, orderId, action, reason, slug = req.storeSlug) {
  const order = ownedOrder(req, orderId, slug)
  if (!order) return { error: 'Order not found.', status: 404 }
  const status = orderStatus(order), explanation = clean(reason, 1000)
  if (!['cancel', 'return'].includes(action)) return { error: 'Choose a supported order action.', status: 400 }
  if (!explanation) return { error: 'Choose or enter a reason for your request.', status: 400 }
  if (action === 'cancel') {
    if (status === 'cancelled') return { order, already: true }
    if (status !== 'processing') return { error: 'This order can no longer be cancelled before shipment.', status: 400 }
    appendOrderEvent(order.id, { store: slug, session_id: req.session.id, action, status: 'cancelled', reason: explanation })
  } else {
    if (status === 'return_requested') return { order, already: true }
    if (status !== 'delivered') return { error: 'A return can be requested after the order is delivered. You can cancel an order that is still processing.', status: 400 }
    appendOrderEvent(order.id, { store: slug, session_id: req.session.id, action, status: 'return_requested', reason: explanation })
  }
  return { order }
}

export function saveAddress(req, input, { country = 'US', requirePhone = false } = {}) {
  const fields = ['label', 'name', 'phone', 'line1', 'line2', 'city', 'state', 'postal_code']
  const values = Object.fromEntries(fields.map(key => [key, clean(input[key])]))
  values.country = country
  const errors = []
  if (!values.name) errors.push('Enter a recipient name.')
  if (!values.line1) errors.push('Enter a street address.')
  if (!values.city) errors.push('Enter a city.')
  const ukPostcode = /^(?:GIR\s?0AA|[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2})$/i
  const patterns = { US: /^\d{5}(?:-\d{4})?$/, KR: /^\d{5}$/, AU: /^\d{4}$/, UK: ukPostcode, GB: ukPostcode }
  if (!(patterns[country] || /\S/).test(values.postal_code)) errors.push('Enter a valid postal code.')
  if (requirePhone && !values.phone) errors.push('Enter a contact phone number.')
  if (values.phone && !/^[+\d\s().-]{7,25}$/.test(values.phone)) errors.push('Enter a valid phone number.')
  const state = retailState(req), existing = input.id ? state.addresses.find(address => address.id === clean(input.id)) : null
  if (input.id && !existing) errors.push('Address not found.')
  if (!existing && state.addresses.length >= 12) errors.push('Remove an address before saving another.')
  if (errors.length) return { errors, values }
  const saved = { ...values, id: existing?.id || id('address'), is_default: input.is_default === 'yes' || input.is_default === 'on' || (!existing && !state.addresses.length) }
  if (existing?.is_default) saved.is_default = true
  if (saved.is_default) state.addresses.forEach(address => { address.is_default = false })
  if (existing) Object.assign(existing, saved)
  else state.addresses.push(saved)
  return { address: saved }
}

export function deleteAddress(req, addressId) {
  const state = retailState(req), previous = state.addresses.length
  state.addresses = state.addresses.filter(address => address.id !== clean(addressId))
  if (state.addresses.length && !state.addresses.some(address => address.is_default)) state.addresses[0].is_default = true
  return previous !== state.addresses.length
}

export function defaultAddress(req) { return retailState(req).addresses.find(address => address.is_default) || null }

export function createSupportCase(req, input, slug = req.storeSlug) {
  const values = { category: clean(input.category, 80), subject: clean(input.subject, 160), message: clean(input.message, 3000), order_id: clean(input.order_id, 80), email: clean(input.email, 254) || req.store.user?.email || '' }
  const errors = []
  if (!values.category) errors.push('Choose a topic.')
  if (!values.subject) errors.push('Enter a subject.')
  if (values.message.length < 10) errors.push('Enter a message of at least 10 characters.')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.push('Enter a valid email address.')
  if (values.order_id && !ownedOrder(req, values.order_id, slug)) errors.push('Order not found in this session.')
  if (errors.length) return { errors, values }
  const state = retailState(req)
  if (state.cases.length >= 50) return { errors: ['You have reached the maximum number of saved requests.'], values }
  const supportCase = { ...values, id: id('case'), status: 'received', created_at: new Date().toISOString() }
  state.cases.unshift(supportCase)
  return { supportCase }
}

export function addProductQuestion(req, productId, input) {
  const message = clean(input.message, 1500)
  if (message.length < 5) return { error: 'Enter a question of at least 5 characters.' }
  const state = retailState(req), key = clean(productId)
  if (!key) return { error: 'Product not found.' }
  const questions = state.questions[key] ||= []
  if (questions.length >= 20) return { error: 'The question limit for this product has been reached.' }
  const question = { id: id('question'), message, created_at: new Date().toISOString(), status: 'pending', author: req.store.user?.first_name || 'Shopper' }
  questions.unshift(question)
  return { question }
}
