import test from 'node:test'
import assert from 'node:assert/strict'
import { tasks, getTask, publicTask, SUITE_VERSION } from '../benchmark/tasks.js'
import { gradeTask } from '../benchmark/grader.js'
import * as bestbuy from '../stores/bestbuy/data.js'
import * as game from '../stores/game-uk/data.js'
import * as rockstar from '../stores/rockstar-store/data.js'
import { CATALOG_MODE } from '../lib/catalog-policy.js'

const task = getTask('bestbuy-purchase-ps5')
const originalTasks = tasks.filter(task => !task.scenario)
const purchased = { outcome: 'purchased', message: 'Completed the requested purchase.' }
function orderFor(target = task) {
  const request = target.request, subtotal = Math.round(target.expected.unit_price * request.quantity * 100) / 100
  const total = target.expected.minimum_total, shipping = target.store === 'game-uk' ? 4.99 : 0
  return {
    id: 'order-1', store: target.store, order_number: 'EXAMPLE-1',
    items: [{ kind: 'game', sku: target.expected.sku, platform: request.platform, edition: request.edition, format: request.format, qty: request.quantity, unit_price: target.expected.unit_price }],
    customer: structuredClone(request.customer), shipping_address: structuredClone(request.shipping_address),
    fulfillment: { method: request.fulfillment }, payment: { method: 'card', last4: '4242' }, currency: request.currency,
    totals: { subtotal, shipping, tax: Math.round((total - subtotal - shipping) * 100) / 100, total }, meta: {},
  }
}
function gradeOrder(order, overrides = {}) { return gradeTask(task, { orders: [order], finalResponse: purchased, ...overrides }) }
function has(result, code) { assert.equal(result.success, false); assert.ok(result.reasons.some(reason => reason.code === code), JSON.stringify(result)) }

test('v3 suite preserves 30 original tasks and covers all 20 storefronts with immutable scenarios without exposing private expectations', () => {
  assert.equal(CATALOG_MODE, 'reference')
  assert.equal(tasks.length, 240)
  assert.equal(originalTasks.length, 30)
  assert.equal(new Set(tasks.map(task => task.id )).size, 240)
  assert.equal(new Set(tasks.map(task => task.store)).size, 20)
  assert.equal(tasks.filter(task => task.split === 'validation').length, 120)
  for (const store of ['bestbuy', 'game-uk', 'rockstar-store']) assert.equal(originalTasks.filter(task => task.store === store).length, 10)
  assert.equal(getTask('missing'), null)
  assert.equal(SUITE_VERSION, 'gta6-commerce-v3')
  const visible = publicTask(task)
  assert.equal('expected' in visible, false)
  assert.equal('family' in visible, false)
  assert.equal('split' in visible, false)
  assert.match(visible.id, /^[0-9a-f]{16}$/)
  assert.notEqual(visible.id, task.id)
  assert.equal(visible.id, publicTask(task).id)
  assert.equal(new Set(tasks.map(task => publicTask(task).id)).size, tasks.length)
  visible.request.customer.first_name = 'Changed'
  assert.equal(task.request.customer.first_name, 'Avery')
  assert.throws(() => { task.request.max_total = 0 }, TypeError)
})

test('pinned expectations agree with actual reference offers, supported UI quantities and cheapest delivered totals', () => {
  for (const target of originalTasks) {
    const request = target.request
    const catalog = target.store === 'bestbuy' ? bestbuy.PRODUCTS : target.store === 'game-uk' ? game.PRODUCTS : rockstar.LISTINGS.filter(product => !product.linkOut)
    const offer = catalog.find(product => product.platform === request.platform && product.edition === request.edition && product.format === request.format)
    if (target.family === 'unsupported_variant') { assert.equal(offer, undefined); continue }
    assert.ok(offer)
    const sku = offer.sku ?? offer.id
    const totals = target.store === 'bestbuy'
      ? bestbuy.totals({ cart: [{ pid: sku, qty: request.quantity, fulfillment: 'shipping' }] })
      : target.store === 'game-uk'
        ? game.totals({ cart: [{ pid: sku, qty: request.quantity }] }, 'standard')
        : rockstar.totals([{ sku, qty: request.quantity }], 'standard')
    assert.equal(target.expected.minimum_total, totals.total, target.id)
    if (target.store === 'rockstar-store') assert.equal(request.quantity, 1, 'GTA UI is Buy Now for one copy')
    if (target.family === 'budget_decline') assert.equal(Math.round((totals.total - request.max_total) * 100), 1)
    else { assert.equal(String(target.expected.sku), String(sku)); assert.equal(target.expected.unit_price, offer.price); assert.ok(request.max_total >= totals.total) }
  }
})

test('every intended purchase and abstention passes with matching authoritative evidence and structured claim', () => {
  for (const target of originalTasks) {
    const outcome = target.expected.outcome
    const result = gradeTask(target, { orders: outcome === 'purchased' ? [orderFor(target)] : [], finalResponse: { outcome, reason: target.expected.reason, message: outcome === 'purchased' ? 'Ordered.' : 'Did not order for the stated reason.' } })
    assert.equal(result.status, 'passed', `${target.id}: ${JSON.stringify(result.reasons)}`)
    assert.equal(result.task_version, 1)
  }
})

test('wrong platform, edition, format, SKU, distractor and extra item cannot pass', () => {
  for (const [field, value] of [['platform', 'xbox'], ['edition', 'ultimate'], ['format', 'physical'], ['sku', 'another-product'], ['kind', 'other']]) {
    const order = orderFor(); order.items[0][field] = value; has(gradeOrder(order), 'wrong_item')
  }
  const extra = orderFor(); extra.items.push({ kind: 'other', sku: 'controller', qty: 1, unit_price: 0 }); has(gradeOrder(extra), 'wrong_item')
})

test('quantity must match exactly and stay a positive integer', () => {
  for (const value of [0, -1, 1.5, '1', NaN]) {
    const order = orderFor(); order.items[0].qty = value; has(gradeOrder(order), 'invalid_quantity')
  }
  const order = orderFor(); order.items[0].qty = 2; has(gradeOrder(order), 'wrong_quantity')
})

test('missing and duplicate orders fail, including a duplicate subsequently cancelled', () => {
  has(gradeTask(task, { orders: [], finalResponse: purchased }), 'missing_order')
  const duplicate = orderFor(); duplicate.meta.lifecycle = [{ action: 'cancel', status: 'cancelled' }]
  const result = gradeTask(task, { orders: [orderFor(), duplicate], finalResponse: purchased })
  has(result, 'duplicate_orders'); has(result, 'cancelled_or_returned')
})

test('cancelled, returned and malformed lifecycle records fail', () => {
  for (const event of [{ action: 'cancel', status: 'cancelled' }, { action: 'return', status: 'return_requested' }]) {
    const order = orderFor(); order.meta.lifecycle = [event]; has(gradeOrder(order), 'cancelled_or_returned')
  }
  const order = orderFor(); order.meta.lifecycle = {}; has(gradeOrder(order), 'invalid_lifecycle')
})

test('store, currency, fulfillment, supplied card and recipient are enforced', () => {
  const cases = [
    ['wrong_store', order => { order.store = 'game-uk' }],
    ['wrong_currency', order => { order.currency = 'GBP' }],
    ['wrong_fulfillment', order => { order.fulfillment.method = 'pickup' }],
    ['wrong_payment', order => { order.payment.method = 'paypal' }],
    ['wrong_payment', order => { order.payment.last4 = '1111' }],
    ['wrong_customer', order => { order.customer.first_name = 'Another' }],
    ['wrong_customer', order => { order.customer.email = 'other@example.com' }],
    ['wrong_customer', order => { order.customer.phone = '2025550999' }],
    ['wrong_recipient', order => { order.shipping_address.last_name = 'Another' }],
  ]
  for (const [code, mutate] of cases) { const order = orderFor(); mutate(order); has(gradeOrder(order), code) }
})

test('all destination fields must match, including apartment; omitted, null and empty line2 are equivalent', () => {
  for (const field of ['line1', 'city', 'state', 'postal_code', 'country']) {
    const order = orderFor(); order.shipping_address[field] = 'WRONG'; has(gradeOrder(order), 'wrong_address')
  }
  for (const value of [undefined, null, '']) { const order = orderFor(); order.shipping_address.line2 = value; assert.equal(gradeOrder(order).success, true) }
  const added = orderFor(); added.shipping_address.line2 = 'Apt 9'; has(gradeOrder(added), 'wrong_address')
  const detailTask = getTask('rockstar-store-address_detail-ps5'), missing = orderFor(detailTask)
  delete missing.shipping_address.line2
  has(gradeTask(detailTask, { orders: [missing], finalResponse: purchased }), 'wrong_address')
})

test('budget compares all-in total in integer cents, with exact boundary accepted', () => {
  const target = getTask('bestbuy-budget_boundary-ps5'), order = orderFor(target)
  assert.equal(gradeTask(target, { orders: [order], finalResponse: purchased }).success, true)
  order.totals.shipping = .01; order.totals.total = Math.round((order.totals.total + .01) * 100) / 100
  has(gradeTask(target, { orders: [order], finalResponse: purchased }), 'budget_exceeded')
})

test('NaN, infinity, negative, imprecise and string prices/totals cannot bypass comparisons', () => {
  for (const value of [NaN, Infinity, -1, 79.991, '79.99']) {
    const price = orderFor(); price.items[0].unit_price = value; has(gradeOrder(price), 'wrong_price')
    const total = orderFor(); total.totals.total = value; has(gradeOrder(total), 'invalid_totals')
  }
  const subtotal = orderFor(); subtotal.totals.subtotal = 1; has(gradeOrder(subtotal), 'inconsistent_totals')
  const discount = orderFor(); discount.totals.discount = 10; discount.totals.total -= 10; has(gradeOrder(discount), 'below_reference_total')
})

test('abstention needs correct reason and zero transactions even when cancelled', () => {
  for (const family of ['budget_decline', 'unsupported_variant']) {
    const target = getTask(`bestbuy-${family}-ps5`)
    has(gradeTask(target, { orders: [], finalResponse: { outcome: 'not_purchased', reason: 'out_of_stock', message: 'Unavailable.' } }), 'final_reason_mismatch')
    const order = orderFor(); order.meta.lifecycle = [{ status: 'cancelled' }]
    has(gradeTask(target, { orders: [order], finalResponse: { outcome: 'not_purchased', reason: target.expected.reason, message: 'Cancelled.' } }), 'unexpected_purchase')
    has(gradeTask(target, { orders: [], finalResponse: purchased }), 'final_outcome_mismatch')
  }
})

test('final claims must agree with purchase evidence and intended outcome', () => {
  has(gradeOrder(orderFor(), { finalResponse: { outcome: 'not_purchased', reason: 'budget_exceeded', message: 'Did not order.' } }), 'final_outcome_mismatch')
  has(gradeOrder(orderFor(), { finalResponse: { ...purchased, reason: 'unsupported_variant' } }), 'contradictory_final_response')
  for (const finalResponse of [null, 'purchased', { outcome: 'purchased' }, { outcome: 'unknown', message: 'Unsure.' }]) has(gradeOrder(orderFor(), { finalResponse }), 'invalid_final_response')
})

test('environment failures and malformed evidence are distinguished from agent failures/timeouts', () => {
  const environment = gradeTask(task, { orders: [], finalResponse: null, environmentError: new Error('Store failed startup') })
  assert.equal(environment.status, 'environment_error'); has(environment, 'environment_error')
  assert.equal(gradeTask(task, { finalResponse: purchased }).status, 'environment_error')
  assert.equal(gradeTask(null, { orders: [], finalResponse: purchased }).status, 'environment_error')
  assert.equal(gradeTask(task, { orders: [null], finalResponse: purchased }).status, 'environment_error')
  const invalidTask = structuredClone(task); invalidTask.request.payment.number = null
  assert.equal(gradeTask(invalidTask, { orders: [], finalResponse: purchased }).status, 'environment_error')
  has(gradeOrder(orderFor(), { timedOut: true }), 'timed_out')
  has(gradeOrder(orderFor(), { agentError: new Error('Agent crashed') }), 'agent_error')
})
