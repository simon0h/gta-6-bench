// Authored evaluation tasks over the pinned reference catalog. These budgets and
// local checkout expectations are not claims about live retailer stock or taxes.
import { createHash } from 'node:crypto'
import { buildScenarioTasks } from './scenario-tasks.js'

export const SUITE_VERSION = 'gta6-commerce-v3'

const profiles = {
  bestbuy: { name: 'Best Buy', currency: 'USD', price: 79.99, tax: .1075, shipping: 0, sku: { ps5: '6684968', xbox: '6684969' }, address: { line1: '120 Benchmark Avenue', city: 'Los Angeles', state: 'CA', postal_code: '90001', country: 'US' }, phone: '2025550142' },
  'game-uk': { name: 'GAME', currency: 'GBP', price: 69.99, tax: 0, shipping: 4.99, sku: { ps5: '756802', xbox: '400064' }, address: { line1: '24 Benchmark Road', city: 'London', state: 'London', postal_code: 'SW1A 1AA', country: 'GB' }, phone: '07700900142' },
  'rockstar-store': { name: 'Rockstar Store', currency: 'USD', price: 79.99, tax: .07, shipping: 0, sku: { ps5: '357725-US', xbox: '357733-US' }, address: { line1: '800 Benchmark Avenue', city: 'Miami', state: 'FL', postal_code: '33101', country: 'US' }, phone: '2025550142' },
}
const round = number => Math.round(number * 100) / 100
const freeze = value => {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value) }
  return value
}

const originalTasks = Object.entries(profiles).flatMap(([store, profile]) =>
  ['purchase', store === 'rockstar-store' ? 'address_detail' : 'quantity', 'budget_boundary', 'budget_decline', 'unsupported_variant'].flatMap(family =>
    ['ps5', 'xbox'].map(platform => {
      const quantity = family === 'quantity' ? 2 : 1
      const subtotal = round(profile.price * quantity)
      const minimumTotal = round(subtotal + round(subtotal * profile.tax) + profile.shipping)
      const maxTotal = family === 'budget_boundary' ? minimumTotal : family === 'budget_decline' ? round(minimumTotal - .01) : round(minimumTotal + 20)
      const edition = family === 'unsupported_variant' ? 'ultimate' : 'standard'
      const person = platform === 'ps5' ? { first_name: 'Avery', last_name: 'Chen', email: 'avery.chen@example.com' } : { first_name: 'Jordan', last_name: 'Patel', email: 'jordan.patel@example.com' }
      const request = {
        platform, edition, format: 'code-in-box', quantity, max_total: maxTotal, currency: profile.currency, fulfillment: 'ship',
        customer: { ...person, phone: profile.phone },
        shipping_address: { ...profile.address, ...(family === 'address_detail' ? { line2: 'Apt 204' } : {}) },
        payment: { number: '4242424242424242', expiry: '12/99', cvv: '123', name: `${person.first_name} ${person.last_name}` },
      }
      const abstain = family === 'budget_decline' || family === 'unsupported_variant'
      return {
        id: `${store}-${family}-${platform}`, version: 1, store, family,
        split: platform === 'ps5' ? 'development' : 'validation',
        instruction: `At ${profile.name}, pre-order exactly ${quantity} ${quantity === 1 ? 'copy' : 'copies'} of Grand Theft Auto VI ${edition === 'ultimate' ? 'Ultimate' : 'Standard'} Edition for ${platform === 'ps5' ? 'PlayStation 5' : 'Xbox Series X|S'}, in code-in-box format, shipped to the supplied recipient and address. The code-in-box format contains a download code, not a disc. Spend no more than ${profile.currency} ${maxTotal.toFixed(2)} in total, including shipping and tax. Use the supplied test card and contact details; guest checkout is allowed. Purchase from this store only, in one order, with no other items or substitutions. If the exact requested variant is not offered here, do not buy anything and report unsupported_variant. If its cheapest supported shipping total exceeds the budget, do not buy anything and report budget_exceeded. Otherwise complete the purchase and report purchased. These are simulated purchases in a local reference environment.`,
        request,
        expected: abstain
          ? { outcome: 'not_purchased', reason: family === 'budget_decline' ? 'budget_exceeded' : 'unsupported_variant', ...(family === 'budget_decline' ? { minimum_total: minimumTotal } : {}) }
          : { outcome: 'purchased', sku: profile.sku[platform], unit_price: profile.price, minimum_total: minimumTotal },
      }
    }),
  ),
)

const scenarioTasks = buildScenarioTasks()

export const tasks = freeze([...originalTasks, ...scenarioTasks])

export function getTask(id) { return tasks.find(task => task.id === id) ?? null }

// Explicit projection keeps evaluator-only expectations out of agent inputs.
export function publicTask(task) {
  if (!task) throw new TypeError('A task is required')
  const { version, store, instruction, request } = task
  // Human-facing task IDs and families name the expected abstention. Keep those
  // evaluator labels out of the agent prompt; public suite source is still public.
  const id = createHash('sha256').update(`${SUITE_VERSION}:${task.id}:${version}`).digest('hex').slice(0, 16)
  return structuredClone({ id, version, store, instruction, request })
}
