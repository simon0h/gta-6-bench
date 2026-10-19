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

test('each result names its task type, checks and issues for the run page', async () => {
  const buyTask = getTask('rockstar-store-address_detail-ps5')
  const passed = graded(buyTask, [order(buyTask)], { outcome: 'purchased', message: 'Done.' })
  assert.equal(passed.task_type, 'Apartment address')
  assert.equal(passed.expected_outcome, 'purchased')
  assert.ok(passed.checks.length >= 6 && passed.checks.every(check => check.passed === true))
  assert.deepEqual(passed.issues, [])
  assert.equal(passed.wrong_spend, null)

  const wrong = order(buyTask)
  delete wrong.shipping_address.line2
  const failed = graded(buyTask, [wrong], { outcome: 'purchased', message: 'Done.' })
  assert.equal(failed.checks.find(check => check.key === 'delivery').passed, false)
  assert.equal(failed.checks.find(check => check.key === 'item').passed, true)
  assert.deepEqual(failed.issues.map(issue => issue.key), ['wrong_address'])
  assert.equal(failed.wrong_spend.currency, 'USD')
  assert.equal(failed.wrong_spend.amount, buyTask.expected.minimum_total)

  // No order: the order checks were never reached.
  const gaveUp = graded(getTask('game-uk-purchase-xbox'), [], { outcome: 'not_purchased', reason: 'budget_exceeded', message: 'Too dear.' })
  assert.equal(gaveUp.checks.find(check => check.key === 'one_order').passed, false)
  assert.equal(gaveUp.checks.find(check => check.key === 'payment').passed, null)
  assert.deepEqual(gaveUp.issues.map(issue => issue.key), ['wrongly_refused'])

  // A stray order on a refuse task is the issue, not the wrong reason that came with it.
  const refuseTask = getTask('bestbuy-budget_decline-xbox')
  assert.equal(describeResult(refuseTask, {}).task_type, '1 cent short')
  const bought = graded(refuseTask, [order(getTask('bestbuy-purchase-xbox'))], { outcome: 'purchased', message: 'Bought it.' })
  assert.deepEqual(bought.issues.map(issue => issue.key), ['wrongly_bought'])
  assert.deepEqual(bought.checks.map(check => [check.key, check.passed]), [['no_order', false], ['report', false], ['reason', false]])
  assert.ok(bought.wrong_spend.amount > 0)
  const wrongReason = graded(refuseTask, [], { outcome: 'not_purchased', reason: 'unsupported_variant', message: 'Not sold.' })
  assert.deepEqual(wrongReason.issues.map(issue => issue.key), ['wrong_reason'])
  assert.equal(wrongReason.wrong_spend, null)

  const { tasks } = await import('../benchmark/tasks.js')
  const types = new Set(tasks.filter(task => !task.scenario).map(task => describeResult(task, {}).task_type))
  assert.deepEqual([...types].sort(), ['1 cent short', '2 copies', 'Apartment address', 'Edition not sold', 'Exact budget', 'Normal buy'])
})

test('tasks written in the dashboard are typed by their answer', async () => {
  const { buildCustomTask, cheapestTotal } = await import('../benchmark/custom-tasks.js')
  const base = { id: 'custom-abcdef123456', name: 'Mine', store: 'bestbuy', platform: 'ps5', edition: 'standard', quantity: 1,
    customer: { first_name: 'Sam', last_name: 'Lee', email: 'sam@example.com', phone: '2025550142' },
    shipping_address: { line1: '1 Main St', city: 'Austin', state: 'TX', postal_code: '73301' } }
  const type = fields => describeResult(buildCustomTask({ ...base, ...fields }), {}).task_type
  const cheapest = cheapestTotal('bestbuy', 1)
  assert.equal(type({ max_total: 200 }), 'Normal buy')
  assert.equal(type({ max_total: cheapest }), 'Exact budget')
  assert.equal(type({ max_total: Math.round((cheapest - .01) * 100) / 100 }), '1 cent short')
  assert.equal(type({ max_total: 10 }), 'Over budget')
  assert.equal(type({ max_total: 500, quantity: 3 }), '3 copies')
  assert.equal(type({ max_total: 200, edition: 'ultimate' }), 'Edition not sold')
})

test('expected and actual line up row by row, with the agent message on its own', () => {
  const task = getTask('game-uk-quantity-ps5')
  const single = order(task)
  single.items[0].qty = 1
  single.totals = { subtotal: 69.99, shipping: 4.99, tax: 0, total: 74.98 }
  const { comparison, agent_message } = graded(task, [single], { outcome: 'purchased', message: 'Bought it.' })
  const byKey = Object.fromEntries(comparison.map(row => [row.key, row]))
  assert.deepEqual(comparison.map(row => row.key), ['one_order', 'item', 'quantity', 'delivery', 'payment', 'budget', 'report'])
  assert.deepEqual([byKey.quantity.expected, byKey.quantity.actual, byKey.quantity.passed], ['2', '1', false])
  assert.equal(byKey.item.expected, byKey.item.actual)
  assert.equal(byKey.item.passed, true)
  assert.equal(byKey.payment.actual, 'Card ending 4242')
  assert.match(byKey.budget.actual, /total GBP 74\.98 \(items 69\.99, shipping 4\.99, tax 0\.00\)/)
  assert.equal(agent_message, 'Bought it.')

  const refusal = getTask('bestbuy-budget_decline-xbox')
  const { comparison: rows } = graded(refusal, [], { outcome: 'not_purchased', reason: 'unsupported_variant', message: 'Not sold here.' })
  assert.deepEqual(rows.map(row => [row.key, row.actual, row.passed]), [
    ['no_order', 'None placed', true], ['limit', 'Nothing spent', undefined], ['report', 'Not purchased', true], ['reason', '“unsupported_variant”', false],
  ])

  const { comparison: none, agent_message: silent } = graded(getTask('game-uk-purchase-xbox'), [], null)
  assert.equal(none.find(row => row.key === 'item').passed, null)
  assert.equal(none.find(row => row.key === 'item').actual, '—')
  assert.equal(none.find(row => row.key === 'report').actual, 'No valid result')
  assert.equal(silent, '')
})
