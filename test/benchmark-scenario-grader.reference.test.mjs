import test from 'node:test'
import assert from 'node:assert/strict'
import { tasks, getTask, publicTask } from '../benchmark/tasks.js'
import { gradeTask } from '../benchmark/grader.js'
import { totals } from '../stores/bestbuy/data.js'

const scenarios = tasks.filter(task => task.scenario && task.store === 'bestbuy')
const purchased = { outcome: 'purchased', message: 'Completed the authorized purchase.' }
const taskFor = family => getTask(`bestbuy-${family}-ps5`)
function eventsFor(task) {
  return (task.expected.scenario_events ?? []).map(type => {
    if (type === 'payment_rejected') return { type, product_id: task.scenario.product_id, last4: '4242', sequence: 1 }
    if (type === 'availability_changed') return { type, product_id: task.scenario.product_id, requested_fulfillment: 'shipping', shipping_available: false, pickup_available: task.family === 'availability_fallback', sequence: 1 }
    if (type === 'cart_corrected') return { type, product_id: task.scenario.product_id, session_id: 'shopper-1', order_number: 'order-1', unexpected_items: 0, excess_quantity: 0, sequence: 2 }
    return { type, product_id: task.scenario.alternate_product_id, quantity: 2, sequence: 1 }
  })
}
function orderFor(task) {
  const request = task.request, fulfillment = task.expected.fulfillment ?? request.fulfillment
  const subtotal = task.expected.unit_price * request.quantity
  return {
    id: 'scenario-order', order_number: 'order-1', session_id: 'shopper-1', store: task.store, currency: request.currency,
    benchmark: { scenario_event_sequence: eventsFor(task).length },
    items: [{ kind: 'game', sku: task.expected.sku, platform: request.platform, edition: request.edition, format: request.format, qty: request.quantity, unit_price: task.expected.unit_price }],
    customer: structuredClone(request.customer),
    shipping_address: fulfillment === 'ship' ? structuredClone(request.shipping_address) : null,
    fulfillment: { method: fulfillment, ...(fulfillment === 'pickup' ? { store_location: request.pickup.store_name, option: 'store_pickup' } : {}) },
    payment: { method: 'card', last4: task.expected.payment_last4 ?? '4242' },
    totals: { subtotal, shipping: 0, tax: Math.round((task.expected.minimum_total - subtotal) * 100) / 100, total: task.expected.minimum_total },
    meta: fulfillment === 'pickup' ? { pickup_store_id: request.pickup.store_id, pickup_person: structuredClone(request.pickup.person), items_fulfillment: [{ sku: task.expected.sku, fulfillment: 'pickup' }] } : {},
  }
}
function evidenceFor(task) {
  return { orders: task.expected.outcome === 'purchased' ? [orderFor(task)] : [], scenarioEvents: eventsFor(task), finalResponse: { outcome: task.expected.outcome, reason: task.expected.reason, message: 'Completed the task under the stated constraints.' } }
}
function rejects(task, evidence, code) {
  const result = gradeTask(task, evidence)
  assert.equal(result.status, 'failed', JSON.stringify(result))
  assert.ok(result.reasons.some(reason => reason.code === code), JSON.stringify(result))
}

test('new scenarios cover both platforms and expose only actionable user authorizations', () => {
  assert.equal(scenarios.length, 12)
  for (const family of ['payment_recovery', 'payment_decline', 'availability_loss', 'availability_fallback', 'pickup_required', 'cart_recovery']) {
    assert.deepEqual(scenarios.filter(task => task.family === family).map(task => task.request.platform), ['ps5', 'xbox'])
  }
  for (const task of scenarios) {
    const visible = publicTask(task)
    assert.deepEqual(Object.keys(visible).sort(), ['id', 'version', 'store', 'instruction', 'timeout_ms', 'request'].sort())
    assert.equal(JSON.stringify(visible).includes('scenario_events'), false)
    assert.match(visible.id, /^[0-9a-f]{16}$/)
    assert.equal(task.version, 2)
    assert.equal(task.store, 'bestbuy')
    if (task.expected.outcome === 'purchased') {
      const method = task.expected.fulfillment === 'pickup' ? 'pickup' : 'shipping'
      const actual = totals({ cart: [{ pid: task.expected.sku, qty: 1, fulfillment: method }] })
      assert.equal(actual.total, task.expected.minimum_total)
      assert.ok(actual.total <= visible.request.max_total)
    }
    assert.equal('backup_payment' in visible.request, task.family === 'payment_recovery')
    assert.equal('pickup' in visible.request, ['pickup_required', 'availability_fallback'].includes(task.family))
  }
})

test('all scenario outcomes pass with exact orders, trusted obstacle evidence and matching final claims', () => {
  for (const task of scenarios) {
    const result = gradeTask(task, evidenceFor(task))
    assert.equal(result.status, 'passed', `${task.id}: ${JSON.stringify(result)}`)
  }
})

test('backup payment requires actual primary rejection and the authorized replacement card', () => {
  const task = taskFor('payment_recovery')
  for (const last4 of ['4242', '1111']) {
    const evidence = evidenceFor(task); evidence.orders[0].payment.last4 = last4
    rejects(task, evidence, 'wrong_payment')
  }
  const skipped = evidenceFor(task); skipped.scenarioEvents = []
  rejects(task, skipped, 'missing_scenario_event')
  for (const change of [{ product_id: '6684969' }, { last4: '4444' }]) {
    const wrong = evidenceFor(task); Object.assign(wrong.scenarioEvents[0], change)
    rejects(task, wrong, 'missing_scenario_event')
  }
})

test('a matching obstacle event recorded after purchase cannot satisfy recovery', () => {
  for (const family of ['payment_recovery', 'availability_fallback', 'cart_recovery']) {
    const task = taskFor(family)
    const afterward = evidenceFor(task); afterward.orders[0].benchmark.scenario_event_sequence = 0
    rejects(task, afterward, 'scenario_event_after_purchase')
    const missing = evidenceFor(task); delete missing.orders[0].benchmark
    const result = gradeTask(task, missing)
    assert.equal(result.status, 'environment_error')
    assert.equal(result.reasons[0].code, 'invalid_scenario_evidence')
    const multiple = evidenceFor(task)
    multiple.scenarioEvents.push({ ...multiple.scenarioEvents[0], sequence: 2 })
    assert.equal(gradeTask(task, multiple).status, 'passed', 'Later events do not erase a matching event that preceded purchase')
  }
})

test('payment rejection without a backup requires zero orders and the correct reason', () => {
  const task = taskFor('payment_decline')
  const unexpected = evidenceFor(task); unexpected.orders = [orderFor(taskFor('payment_recovery'))]
  rejects(task, unexpected, 'unexpected_purchase')
  const wrong = evidenceFor(task); wrong.finalResponse.reason = 'unavailable'
  rejects(task, wrong, 'final_reason_mismatch')
  const fabricated = evidenceFor(task); fabricated.scenarioEvents = []
  rejects(task, fabricated, 'missing_scenario_event')
})

test('availability fallback must follow an observed loss of shipping and use the approved pickup store', () => {
  const task = taskFor('availability_fallback')
  const shipped = evidenceFor(task); shipped.orders[0].fulfillment.method = 'ship'
  rejects(task, shipped, 'wrong_fulfillment')
  for (const change of [{ product_id: '6684969' }, { shipping_available: true }, { pickup_available: false }, { requested_fulfillment: 'pickup' }, { requested_fulfillment: undefined }]) {
    const wrong = evidenceFor(task); Object.assign(wrong.scenarioEvents[0], change)
    rejects(task, wrong, 'missing_scenario_event')
  }
  const skipped = evidenceFor(task); skipped.scenarioEvents = []
  rejects(task, skipped, 'missing_scenario_event')
})

test('loss of availability requires an observed stock change, no purchase and an unavailable claim', () => {
  const task = taskFor('availability_loss')
  const skipped = evidenceFor(task); skipped.scenarioEvents = []
  rejects(task, skipped, 'missing_scenario_event')
  const bought = evidenceFor(task); bought.orders = [orderFor(taskFor('pickup_required'))]
  rejects(task, bought, 'unexpected_purchase')
  const wrong = evidenceFor(task); wrong.finalResponse.reason = 'unsupported_variant'
  rejects(task, wrong, 'final_reason_mismatch')
  const pickupFirst = evidenceFor(task); pickupFirst.scenarioEvents[0].requested_fulfillment = 'pickup'
  rejects(task, pickupFirst, 'missing_scenario_event')
})

test('pickup verifies store identity and every supplied recipient field without requiring a shipping address', () => {
  const task = taskFor('pickup_required')
  for (const change of [order => { order.meta.pickup_store_id = 'burbank' }, order => { order.fulfillment.store_location = 'Burbank' }]) {
    const evidence = evidenceFor(task); change(evidence.orders[0])
    rejects(task, evidence, 'wrong_pickup_location')
  }
  for (const field of ['first_name', 'last_name', 'email', 'phone']) {
    const evidence = evidenceFor(task); evidence.orders[0].meta.pickup_person[field] = 'Wrong'
    rejects(task, evidence, 'wrong_pickup_person')
  }
  const noPerson = evidenceFor(task); noPerson.orders[0].meta.pickup_person = null
  rejects(task, noPerson, 'wrong_pickup_person')
  const optionalAddress = structuredClone(task); delete optionalAddress.request.shipping_address
  assert.equal(gradeTask(optionalAddress, evidenceFor(task)).status, 'passed')
  const shipped = evidenceFor(task); shipped.orders[0].fulfillment.method = 'ship'
  rejects(task, shipped, 'wrong_fulfillment')
})

test('pickup rejects shipping addresses and item fulfillment that contradicts the order summary', () => {
  const task = taskFor('pickup_required')
  for (const shippingAddress of [task.request.shipping_address, {}, undefined]) {
    const evidence = evidenceFor(task); evidence.orders[0].shipping_address = shippingAddress
    rejects(task, evidence, 'unexpected_shipping_address')
  }
  for (const mutate of [
    order => { order.fulfillment.option = 'standard' },
    order => { delete order.meta.items_fulfillment },
    order => { order.meta.items_fulfillment = [] },
    order => { order.meta.items_fulfillment[0].fulfillment = 'shipping' },
    order => { order.meta.items_fulfillment[0].sku = '6684969' },
    order => { order.meta.items_fulfillment.push({ sku: task.expected.sku, fulfillment: 'pickup' }) },
  ]) {
    const evidence = evidenceFor(task); mutate(evidence.orders[0])
    rejects(task, evidence, 'wrong_item_fulfillment')
  }
})

test('recovery must remove the wrong platform and excess quantities without leaving extra orders', () => {
  const task = taskFor('cart_recovery')
  const wrong = evidenceFor(task); Object.assign(wrong.orders[0].items[0], { sku: task.scenario.alternate_product_id, platform: 'xbox', qty: 2 })
  rejects(task, wrong, 'wrong_item'); rejects(task, wrong, 'wrong_quantity')
  const excess = evidenceFor(task); excess.orders[0].items.push({ ...excess.orders[0].items[0], sku: task.scenario.alternate_product_id, platform: 'xbox', qty: 2 })
  rejects(task, excess, 'wrong_item'); rejects(task, excess, 'wrong_quantity')
  const missingSeed = evidenceFor(task); missingSeed.scenarioEvents = []
  rejects(task, missingSeed, 'missing_scenario_event')
  const badSeed = evidenceFor(task); badSeed.scenarioEvents[0].quantity = 1
  rejects(task, badSeed, 'missing_scenario_event')
})

test('missing trusted scenario evidence is an environment error, not an agent failure', () => {
  const task = taskFor('payment_recovery')
  for (const scenarioEvents of [undefined, null, {}, [null], [{ type: null }]]) {
    const result = gradeTask(task, { ...evidenceFor(task), scenarioEvents })
    assert.equal(result.status, 'environment_error')
    assert.equal(result.reasons[0].code, 'invalid_scenario_evidence')
  }
  for (const sequence of [undefined, -1, 0, 1.5, '1']) {
    const evidence = evidenceFor(task); evidence.scenarioEvents[0].sequence = sequence
    assert.equal(gradeTask(task, evidence).status, 'environment_error')
  }
  const invalid = structuredClone(task); invalid.request.payment.number = 4242
  assert.equal(gradeTask(invalid, { orders: [], finalResponse: purchased }).status, 'environment_error')
  const unauthorized = structuredClone(taskFor('availability_fallback')); delete unauthorized.request.allowed_fallback
  assert.equal(gradeTask(unauthorized, evidenceFor(unauthorized)).status, 'environment_error')
})
