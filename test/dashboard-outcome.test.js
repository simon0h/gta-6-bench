import test from 'node:test'
import assert from 'node:assert/strict'
import { getTask } from '../benchmark/tasks.js'
import { gradeTask } from '../benchmark/grader.js'
import { describeResult } from '../benchmark/outcome.js'

const order = (task, changes = {}) => ({
  store: task.store, currency: task.request.currency, run_id: 'trial',
  customer: { ...task.request.customer }, shipping_address: { ...task.request.shipping_address },
  fulfillment: { method: 'ship' }, payment: { method: 'card', last4: '4242' },
  items: [{ kind: 'game', platform: task.request.platform, edition: task.request.edition, format: task.request.format, qty: task.request.quantity, unit_price: task.expected.unit_price, sku: task.expected.sku, title: 'Grand Theft Auto VI' }],
  totals: { subtotal: task.expected.unit_price * task.request.quantity, shipping: 0, tax: task.expected.minimum_total - task.expected.unit_price * task.request.quantity, total: task.expected.minimum_total },
  ...changes,
})
const graded = (task, orders, finalResponse) => {
  const result = { final_response: finalResponse, orders, grade: gradeTask(task, { orders, finalResponse, scenarioEvents: [] }) }
  return { result, ...describeResult(task, result) }
}

test('a passed purchase shows expected and actual output and no failure reasons', () => {
  const task = getTask('rockstar-store-purchase-ps5')
  const { result, expected_output, actual_output, failure_reasons } = graded(task, [order(task)], { outcome: 'purchased', message: 'Order placed.' })
  assert.equal(result.grade.status, 'passed')
  assert.match(expected_output[0], /^Buy: 1 × Grand Theft Auto VI Standard Edition, PlayStation 5, code-in-box \(SKU 357725-US\) at USD 79\.99 each/)
  assert.ok(expected_output.some(line => /^Delivery: ship to Avery Chen, 800 Benchmark Avenue, Miami, FL 33101, US\.$/.test(line)))
  assert.ok(expected_output.includes('Report: purchased.'))
  assert.equal(actual_output[0], 'Reported: purchased.')
  assert.ok(actual_output.some(line => line.startsWith('Order: 1 × Grand Theft Auto VI')))
  assert.ok(actual_output.some(line => line === 'Order payment: card ending 4242.'))
  assert.deepEqual(failure_reasons, [])
})

test('a wrong refusal reason and a stray order become separate plain bullets', () => {
  const task = getTask('bestbuy-budget_decline-xbox')
  const purchase = order(getTask('bestbuy-purchase-xbox'))
  const { result, expected_output, actual_output, failure_reasons } = graded(task, [purchase], { outcome: 'not_purchased', reason: 'unsupported_variant', message: 'Not sold here.' })
  assert.equal(result.grade.status, 'failed')
  assert.equal(expected_output[0], 'Buy nothing.')
  assert.match(expected_output[1], /reason “budget_exceeded” \(the cheapest total is over the spending limit\)/)
  assert.equal(actual_output[0], 'Reported: not purchased, with reason “unsupported_variant”.')
  assert.deepEqual(failure_reasons, [
    'The agent gave the reason “unsupported_variant”, but the right reason was “budget_exceeded”.',
    'The agent placed an order, but this task needed it to buy nothing. Cancelled orders still count.',
  ])
})

test('address and quantity mistakes name what was wrong', () => {
  const task = getTask('rockstar-store-address_detail-ps5')
  const wrong = order(task)
  delete wrong.shipping_address.line2
  const { failure_reasons, actual_output } = graded(task, [wrong], { outcome: 'purchased', message: 'Done.' })
  assert.deepEqual(failure_reasons, ['The shipping address does not match: apartment or unit line was “blank” instead of “Apt 204”.'])
  assert.ok(actual_output.some(line => line.startsWith('Order delivery: ship to Avery Chen, 800 Benchmark Avenue, Miami')))

  const quantityTask = getTask('game-uk-quantity-ps5')
  const single = order(quantityTask)
  single.items[0].qty = 1
  single.totals = { subtotal: 69.99, shipping: 4.99, tax: 0, total: 74.98 }
  const { failure_reasons: reasons } = graded(quantityTask, [single], { outcome: 'purchased', message: 'Done.' })
  assert.ok(reasons.includes('The agent bought 1 copy, but 2 were needed.'))
})

test('no submission and no order are described plainly', () => {
  const task = getTask('game-uk-purchase-xbox')
  const { actual_output, failure_reasons } = graded(task, [], null)
  assert.deepEqual(actual_output, ['Reported: no valid result was submitted.', 'Orders: none placed.'])
  assert.deepEqual(failure_reasons, ['The agent did not submit a valid result (it needs an outcome and a message).', 'No order was placed, but this task needed a purchase.'])
})

test('every task in both task sets has an expected output', async () => {
  const { tasks } = await import('../benchmark/tasks.js')
  for (const task of tasks) {
    const { expected_output } = describeResult(task, { grade: { status: 'passed', reasons: [] }, final_response: null, orders: [] })
    assert.ok(expected_output.length >= 3, task.id)
    assert.ok(expected_output.every(line => typeof line === 'string' && !/undefined|NaN|null/.test(line)), `${task.id}: ${expected_output.join(' | ')}`)
  }
})
