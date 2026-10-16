// Tasks that dashboard users write themselves. A saved task holds only the
// fields a person fills in; buildCustomTask turns it into the same shape as the
// built-in tasks, including the right answer, so it is graded the same way.
// The right answer is worked out from the store's own prices and rules, never
// typed in, so a custom task cannot expect something the store cannot do.
import { createHash } from 'node:crypto'
import { profiles } from './tasks.js'

export const CUSTOM_TASK_LIMIT = 200
export const CUSTOM_RUN_LIMIT = 100

const US_STATES = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY']
const US_ZIP = /^\d{5}(-\d{4})?$/
const UK_POSTCODE = /^(?:GIR\s?0AA|[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2})$/i
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
const digits = value => String(value ?? '').replace(/\D/g, '')

// What each store's checkout accepts. Quantity limits come from the store
// code and checkout: Best Buy's cart offers 1 to 3, and Rockstar's code-in-box
// pre-order checkout sells one copy at a time.
const rules = {
  bestbuy: { maxQuantity: 3, country: 'United States', stateLabel: 'State', states: US_STATES, stateRequired: true, postalLabel: 'ZIP code',
    postal: value => US_ZIP.test(value), phone: value => digits(value).length === 10, phoneHelp: 'a 10-digit US phone number' },
  'game-uk': { maxQuantity: 5, country: 'United Kingdom', stateLabel: 'County', stateRequired: false, postalLabel: 'Postcode',
    postal: value => UK_POSTCODE.test(value), phone: value => /^\d{10,13}$/.test(digits(value)), phoneHelp: 'a UK mobile number (10 to 13 digits)' },
  'rockstar-store': { maxQuantity: 1, country: 'United States', stateLabel: 'State', states: US_STATES, stateRequired: true, postalLabel: 'ZIP code',
    postal: value => US_ZIP.test(value), phone: value => digits(value).length >= 7 && digits(value).length <= 15, phoneHelp: 'a phone number of 7 to 15 digits' },
}

const round = value => Math.round(value * 100) / 100
const fail = message => Object.assign(new Error(message), { status: 400 })
const text = (value, label, { max = 80, required = true } = {}) => {
  if (value === undefined || value === null) value = ''
  if (typeof value !== 'string') throw fail(`${label} must be text.`)
  const clean = value.trim().replace(/\s+/g, ' ')
  if (required && !clean) throw fail(`Enter ${label.toLowerCase()}.`)
  if (clean.length > max) throw fail(`${label} can be at most ${max} characters.`)
  return clean
}

/** Store choices and starting values for the task form. */
export function customTaskOptions() {
  return Object.entries(rules).map(([store, rule]) => {
    const profile = profiles[store]
    return {
      store, name: profile.name, currency: profile.currency, country: rule.country, country_code: profile.address.country,
      max_quantity: rule.maxQuantity, state_label: rule.stateLabel, state_required: rule.stateRequired, states: rule.states ?? null,
      postal_label: rule.postalLabel, unit_price: profile.price,
      defaults: {
        customer: { first_name: 'Avery', last_name: 'Chen', email: 'avery.chen@example.com', phone: profile.phone },
        shipping_address: { line1: profile.address.line1, line2: '', city: profile.address.city, state: profile.address.state, postal_code: profile.address.postal_code },
      },
    }
  })
}

/** Check what a person typed and return a clean saved definition (no id). */
export function normalizeCustomTask(input = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw fail('Send the task as an object.')
  const name = text(input.name, 'Task name', { max: 80 })
  const store = input.store
  if (!Object.hasOwn(rules, store)) throw fail('Choose Best Buy, GAME or Rockstar Store.')
  const rule = rules[store]
  const platform = input.platform
  if (!['ps5', 'xbox'].includes(platform)) throw fail('Choose PlayStation 5 or Xbox Series X|S.')
  const edition = input.edition ?? 'standard'
  if (!['standard', 'ultimate'].includes(edition)) throw fail('Choose the Standard or Ultimate Edition.')
  const quantity = Number(input.quantity)
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > rule.maxQuantity) throw fail(`${profiles[store].name} sells 1 to ${rule.maxQuantity} copies in one order. Choose a quantity in that range.`)
  const maxTotal = Number(input.max_total)
  if (!Number.isFinite(maxTotal) || maxTotal <= 0 || maxTotal > 100000 || Math.abs(maxTotal * 100 - Math.round(maxTotal * 100)) > 1e-6) throw fail('Enter a spending limit above 0 with at most two decimal places.')
  const customer = input.customer ?? {}, address = input.shipping_address ?? {}
  const email = text(customer.email, 'Email', { max: 120 }).toLowerCase()
  if (!EMAIL.test(email)) throw fail('Enter a valid email address.')
  const phone = text(customer.phone, 'Phone', { max: 30 })
  if (!rule.phone(phone)) throw fail(`Enter ${rule.phoneHelp}.`)
  let state = text(address.state, rule.stateLabel, { max: 60, required: rule.stateRequired })
  if (rule.states) {
    state = state.toUpperCase()
    if (!rule.states.includes(state)) throw fail('Choose a US state, such as CA.')
  }
  let postal = text(address.postal_code, rule.postalLabel, { max: 12 })
  if (!rule.postal(postal)) throw fail(`Enter a valid ${rule.postalLabel}.`)
  if (store === 'game-uk') postal = postal.toUpperCase()
  const instruction = text(input.instruction, 'Instructions', { max: 4000, required: false })
  return {
    name, store, platform, edition, quantity, max_total: round(maxTotal),
    customer: { first_name: text(customer.first_name, 'First name', { max: 60 }), last_name: text(customer.last_name, 'Last name', { max: 60 }), email, phone },
    shipping_address: {
      line1: text(address.line1, 'Street address', { max: 100 }), line2: text(address.line2, 'Apartment or unit', { max: 60, required: false }),
      city: text(address.city, store === 'game-uk' ? 'Town or city' : 'City', { max: 60 }), state, postal_code: postal,
    },
    ...(instruction ? { instruction } : {}),
  }
}

/** The cheapest total this store charges for the request. */
export function cheapestTotal(store, quantity) {
  const profile = profiles[store]
  const subtotal = round(profile.price * quantity)
  return round(subtotal + round(subtotal * profile.tax) + profile.shipping)
}

/** The answer an agent should give, worked out from the store's rules. */
export function customAnswer(fields) {
  const minimumTotal = cheapestTotal(fields.store, fields.quantity)
  // None of the three stores sells the Ultimate Edition as a code-in-box.
  if (fields.edition === 'ultimate') return { outcome: 'not_purchased', reason: 'unsupported_variant' }
  if (Math.round(minimumTotal * 100) > Math.round(fields.max_total * 100)) return { outcome: 'not_purchased', reason: 'budget_exceeded', minimum_total: minimumTotal }
  const profile = profiles[fields.store]
  return { outcome: 'purchased', sku: profile.sku[fields.platform], unit_price: profile.price, minimum_total: minimumTotal }
}

export function standardInstruction(fields) {
  const profile = profiles[fields.store]
  const copies = `${fields.quantity} ${fields.quantity === 1 ? 'copy' : 'copies'}`
  return `At ${profile.name}, pre-order exactly ${copies} of Grand Theft Auto VI ${fields.edition === 'ultimate' ? 'Ultimate' : 'Standard'} Edition for ${fields.platform === 'ps5' ? 'PlayStation 5' : 'Xbox Series X|S'}, in code-in-box format, shipped to the supplied recipient and address. The code-in-box format contains a download code, not a disc. Spend no more than ${profile.currency} ${fields.max_total.toFixed(2)} in total, including shipping and tax. Use the supplied card and contact details; guest checkout is allowed. Purchase from this store only, in one order, with no other items or substitutions. If the exact requested variant is not offered here, do not buy anything and report unsupported_variant. If its cheapest supported shipping total exceeds the budget, do not buy anything and report budget_exceeded. Otherwise complete the purchase and report purchased.`
}

/** A saved definition ({ id, version, ...fields }) as a gradable task. */
export function buildCustomTask(definition) {
  const fields = normalizeCustomTask(definition)
  if (typeof definition.id !== 'string' || !/^custom-[a-z0-9]{8,32}$/.test(definition.id)) throw fail('Invalid custom task id')
  const version = definition.version ?? 1
  if (!Number.isInteger(version) || version < 1) throw fail('Invalid custom task version')
  const profile = profiles[fields.store]
  const name = `${fields.customer.first_name} ${fields.customer.last_name}`
  const shipping = { line1: fields.shipping_address.line1, ...(fields.shipping_address.line2 ? { line2: fields.shipping_address.line2 } : {}),
    city: fields.shipping_address.city, state: fields.shipping_address.state, postal_code: fields.shipping_address.postal_code, country: profile.address.country }
  return {
    id: definition.id, version, store: fields.store, family: 'custom', split: 'custom', name: fields.name,
    instruction: fields.instruction ?? standardInstruction(fields),
    request: {
      platform: fields.platform, edition: fields.edition, format: 'code-in-box', quantity: fields.quantity, max_total: fields.max_total,
      currency: profile.currency, fulfillment: 'ship', customer: { ...fields.customer }, shipping_address: shipping,
      payment: { number: '4242424242424242', expiry: '12/99', cvv: '123', name },
    },
    expected: customAnswer(fields),
  }
}

export function newCustomTaskId(seed) {
  return `custom-${createHash('sha256').update(String(seed)).digest('hex').slice(0, 12)}`
}
