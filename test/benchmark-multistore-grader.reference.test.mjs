import test from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync } from 'node:fs'
import { tasks, publicTask } from '../benchmark/tasks.js'
import { gradeTask } from '../benchmark/grader.js'
import { startEnvironment } from '../benchmark/environment.js'
import { configureOrders, recordOrder } from '../lib/orders.js'
import {
  configureBenchmarkScenario, initializeScenarioStore, scenarioEvents,
  enterScenarioCart, scenarioAvailability, scenarioPayment, assertScenarioOrder,
} from '../lib/benchmark-scenarios.js'

const scenarios = tasks.filter(task => task.scenario)
const stores = readdirSync(new URL('../stores/', import.meta.url), { withFileTypes: true })
  .filter(entry => entry.isDirectory() && !entry.name.startsWith('_') && !entry.name.startsWith('.'))
  .map(entry => entry.name).sort()
const pickupStores = ['argos', 'bestbuy', 'game-uk', 'rockstar-store', 'smyths-toys']
const fixtureStores = ['argos', 'chewy', 'coupang', 'gmarket', 'ikea', 'nike', 'sephora', 'smyths-toys', 'williams-sonoma']
const goodsStores = ['chewy', 'ikea', 'nike', 'sephora', 'williams-sonoma']
const digitalStores = ['playstation-store', 'xbox-store']
const tasksFor = (store, family) => scenarios.filter(task => task.store === store && task.family === family)
const round = number => Math.round(number * 100) / 100

function eventsFor(task) {
  return (task.expected.scenario_events ?? []).map((type, index) => ({
    type, store: task.store, sequence: index + 1,
    ...(type === 'payment_rejected' ? { product_id: task.scenario.product_id, last4: '4242' }
      : type === 'availability_changed' ? {
        product_id: task.scenario.product_id,
        requested_fulfillment: digitalStores.includes(task.store) ? 'digital' : 'shipping',
        shipping_available: false, pickup_available: task.family === 'availability_fallback',
      } : type === 'cart_corrected' ? {
        product_id: task.scenario.product_id, unexpected_items: 0, excess_quantity: 0,
        session_id: 'reference-session', order_number: 'REFERENCE-ORDER',
      } : { product_id: task.scenario.alternate_product_id, quantity: digitalStores.includes(task.store) ? 1 : 2 }),
  }))
}

function orderFor(task) {
  const request = task.request, fulfillment = task.expected.fulfillment ?? request.fulfillment
  const item = {
    kind: request.kind, sku: task.expected.sku, qty: request.quantity, unit_price: task.expected.unit_price,
    ...(request.kind === 'other' ? { title: request.product.title }
      : { platform: request.platform, edition: request.edition, format: request.format }),
  }
  const subtotal = round(item.qty * item.unit_price)
  return {
    id: `${task.id}-order`, order_number: 'REFERENCE-ORDER', session_id: 'reference-session', store: task.store, currency: request.currency,
    benchmark: { scenario_event_sequence: eventsFor(task).length, catalog_mode: task.catalog_mode },
    items: [item], customer: structuredClone(request.customer),
    shipping_address: fulfillment === 'ship' ? structuredClone(request.shipping_address) : null,
    billing_address: structuredClone(request.billing_address ?? request.shipping_address),
    fulfillment: { method: fulfillment, ...(fulfillment === 'pickup' ? { option: 'store_pickup', store_location: request.pickup.store_name } : {}) },
    payment: { method: 'card', last4: task.expected.payment_last4 ?? '4242' },
    totals: { subtotal, shipping: 0, tax: round(task.expected.minimum_total - subtotal), total: task.expected.minimum_total },
    meta: fulfillment === 'pickup' ? {
      pickup_store_id: request.pickup.store_id, pickup_person: structuredClone(request.pickup.person),
      items_fulfillment: [{ sku: item.sku, fulfillment: 'pickup' }],
    } : {},
  }
}

function evidenceFor(task) {
  return {
    orders: task.expected.outcome === 'purchased' ? [orderFor(task)] : [],
    scenarioEvents: eventsFor(task),
    finalResponse: { outcome: task.expected.outcome, ...(task.expected.reason ? { reason: task.expected.reason } : {}), message: 'Completed under the authorized constraints.' },
  }
}
function rejects(task, evidence, code) {
  const grade = gradeTask(task, evidence)
  assert.equal(grade.status, 'failed', `${task.id}: ${JSON.stringify(grade)}`)
  assert.ok(grade.reasons.some(reason => reason.code === code), `${task.id}: expected ${code}, got ${JSON.stringify(grade)}`)
}

test('all twenty mounted stores have two products for every applicable obstacle', () => {
  assert.equal(stores.length, 20)
  assert.equal(scenarios.length, 210)
  assert.deepEqual([...new Set(scenarios.map(task => task.store))].sort(), stores)
  assert.equal(new Set(tasks.map(task => task.id)).size, tasks.length)
  for (const store of stores) {
    const families = ['payment_recovery', 'payment_decline', 'availability_loss', 'pickup_required', 'cart_recovery', ...(pickupStores.includes(store) ? ['availability_fallback'] : [])]
    assert.deepEqual([...new Set(scenarios.filter(task => task.store === store).map(task => task.family))].sort(), families.sort(), store)
    for (const family of families) {
      const pair = tasksFor(store, family)
      assert.equal(pair.length, 2, `${store} ${family}`)
      assert.equal(new Set(pair.map(task => task.scenario.product_id)).size, 2)
      assert.deepEqual(pair.map(task => task.split), ['development', 'validation'])
    }
    const pickup = tasksFor(store, 'pickup_required')
    for (const task of pickup) {
      assert.equal(task.request.fulfillment, 'pickup')
      assert.equal(task.expected.outcome, pickupStores.includes(store) ? 'purchased' : 'not_purchased')
      assert.equal(task.expected.reason, pickupStores.includes(store) ? undefined : 'unsupported_fulfillment')
    }
  }
})

test('fixture inventory and authored pickup are disclosed without claiming live stock', () => {
  assert.equal(scenarios.filter(task => task.catalog_mode === 'fixtures').length, 94)
  for (const task of scenarios) {
    assert.equal(task.catalog_mode, fixtureStores.includes(task.store) ? 'fixtures' : 'reference', task.id)
    assert.match(task.instruction, /simulated local purchases/)
    assert.match(task.instruction, fixtureStores.includes(task.store) ? /authored fixture inventory, not verified live offers/ : /captured reference listings with simulated checkout/)
    if (['game-uk', 'rockstar-store'].includes(task.store)) assert.match(task.instruction, /pickup controls are authored benchmark behavior/)
    const visible = publicTask(task)
    assert.match(visible.id, /^[a-f0-9]{16}$/)
    for (const field of ['scenario', 'expected', 'family', 'split', 'catalog_mode']) assert.equal(Object.hasOwn(visible, field), false)
    assert.deepEqual(visible.request, task.request)
  }
})

test('ordinary goods retain exact identities and digital tasks never invent physical alternatives', () => {
  for (const task of scenarios) {
    if (goodsStores.includes(task.store)) {
      assert.equal(task.request.kind, 'other')
      assert.equal(task.request.product.sku, task.scenario.product_id)
      assert.ok(task.request.product.title)
      for (const field of ['platform', 'edition', 'format']) assert.equal(Object.hasOwn(task.request, field), false)
      assert.doesNotMatch(task.instruction, /Grand Theft Auto/)
    } else {
      assert.equal(task.request.kind, 'game')
      assert.equal(task.request.format, digitalStores.includes(task.store) ? 'digital' : 'code-in-box')
    }
    if (digitalStores.includes(task.store)) {
      assert.equal(task.request.fulfillment, task.family === 'pickup_required' ? 'pickup' : 'digital')
      assert.equal(Object.hasOwn(task.request, 'shipping_address'), false)
      assert.ok(task.request.billing_address)
      assert.equal(task.family === 'availability_fallback', false)
    }
  }
})

test('all 210 authored scenarios accept exact orders or justified abstentions', () => {
  for (const task of scenarios) {
    const result = gradeTask(task, evidenceFor(task))
    assert.equal(result.status, 'passed', `${task.id}: ${JSON.stringify(result)}`)
  }
})

test('every recovery rejects wrong products, excess units, duplicate orders, and a false final claim', () => {
  for (const task of scenarios.filter(task => task.expected.outcome === 'purchased')) {
    for (const [mutate, code] of [
      [order => { order.items[0].sku = 'unrequested-product' }, 'wrong_item'],
      [order => { order.items[0].kind = order.items[0].kind === 'other' ? 'game' : 'other' }, 'wrong_item'],
      [order => { order.items[0].qty = 2 }, 'wrong_quantity'],
      [order => { order.payment.last4 = '1111' }, 'wrong_payment'],
      [order => { order.currency = 'EUR' }, 'wrong_currency'],
    ]) {
      const evidence = evidenceFor(task); mutate(evidence.orders[0]); rejects(task, evidence, code)
    }
    const duplicate = evidenceFor(task); duplicate.orders.push(structuredClone(duplicate.orders[0])); rejects(task, duplicate, 'duplicate_orders')
    const claim = evidenceFor(task); claim.finalResponse.outcome = 'not_purchased'; rejects(task, claim, 'final_outcome_mismatch')
    const empty = evidenceFor(task); empty.orders = []; rejects(task, empty, 'missing_order')
  }
})

test('digital editions, delivery and physical game variants are independently graded', () => {
  for (const task of scenarios.filter(task => task.expected.outcome === 'purchased' && task.request.kind === 'game')) {
    for (const field of ['platform', 'edition', 'format']) {
      const evidence = evidenceFor(task); evidence.orders[0].items[0][field] = 'unrequested'; rejects(task, evidence, 'wrong_item')
    }
    if (digitalStores.includes(task.store)) {
      const shipped = evidenceFor(task); shipped.orders[0].shipping_address = { ...task.request.billing_address }; rejects(task, shipped, 'unexpected_shipping_address')
      const physical = evidenceFor(task); physical.orders[0].fulfillment.method = 'ship'; rejects(task, physical, 'wrong_fulfillment')
    }
  }
})

test('no-obstacle guesses and evidence for another store or product cannot pass', () => {
  for (const task of scenarios.filter(task => task.expected.scenario_events?.length)) {
    const empty = evidenceFor(task); empty.scenarioEvents = []; rejects(task, empty, 'missing_scenario_event')
    for (const change of [{ store: 'unrelated-store' }, { product_id: 'unrelated-product' }]) {
      const evidence = evidenceFor(task); Object.assign(evidence.scenarioEvents[0], change); rejects(task, evidence, 'missing_scenario_event')
    }
    if (task.expected.outcome === 'purchased') {
      const late = evidenceFor(task); late.orders[0].benchmark.scenario_event_sequence = 0; rejects(task, late, 'scenario_event_after_purchase')
    }
  }
})

test('payment declines require trying the primary card and recovery requires the supplied replacement', () => {
  for (const task of scenarios.filter(task => task.family.startsWith('payment_'))) {
    const evidence = evidenceFor(task); evidence.scenarioEvents[0].last4 = '4444'; rejects(task, evidence, 'missing_scenario_event')
    if (task.family === 'payment_recovery') {
      const primary = evidenceFor(task); primary.orders[0].payment.last4 = '4242'; rejects(task, primary, 'wrong_payment')
    }
  }
})

test('payment evidence belongs to the actual checkout selection, not an unrelated saved cart', t => {
  t.after(() => configureBenchmarkScenario())
  for (const storeName of stores) {
    const [task, alternate] = tasksFor(storeName, 'payment_recovery')
    configureBenchmarkScenario(task)
    const store = { cart: [{ sku: task.scenario.product_id, qty: 1 }], checkout: {} }
    initializeScenarioStore(storeName, store)
    assert.equal(scenarioPayment(store, { method: 'card', last4: '4242' }, [{ sku: alternate.scenario.product_id, qty: 1 }]), null)
    assert.deepEqual(scenarioEvents(), [], storeName)
    assert.match(scenarioPayment(store, { method: 'card', last4: '4242' }, [{ sku: task.scenario.product_id, qty: 1 }]), /declined/)
    assert.equal(scenarioEvents().length, 1)
  }
})

test('legitimate native member delivery savings pass without relaxing item prices or budgets', () => {
  for (const [store, guestShipping, memberShipping] of [['nike', 8, 5], ['sephora', 6.95, 0]]) {
    for (const task of tasksFor(store, 'payment_recovery')) {
      const evidence = evidenceFor(task), order = evidence.orders[0]
      order.customer.guest = false
      order.totals = { subtotal: task.expected.unit_price, shipping: memberShipping, tax: 0, total: round(task.expected.unit_price + memberShipping) }
      assert.equal(gradeTask(task, evidence).status, 'passed', task.id)
      order.customer.guest = true
      order.totals.shipping = guestShipping
      order.totals.total = round(task.expected.unit_price + guestShipping)
      assert.equal(gradeTask(task, evidence).status, 'passed', task.id)
      order.items[0].unit_price -= 1
      rejects(task, evidence, 'wrong_price')
    }
  }
})

test('all abstentions reject purchases even when the wrong transaction was cancelled', () => {
  for (const task of scenarios.filter(task => task.expected.outcome === 'not_purchased')) {
    const evidence = evidenceFor(task)
    evidence.orders = [{ store: task.store, meta: { lifecycle: [{ action: 'cancel', status: 'cancelled' }] } }]
    rejects(task, evidence, 'unexpected_purchase')
    const wrongReason = evidenceFor(task); wrongReason.finalResponse.reason = 'budget_exceeded'; rejects(task, wrongReason, 'final_reason_mismatch')
  }
})

test('all five pickup implementations must honor the store, named collector and every item', () => {
  for (const task of scenarios.filter(task => task.expected.fulfillment === 'pickup')) {
    for (const [mutate, code] of [
      [order => { order.meta.pickup_store_id = 'other-location' }, 'wrong_pickup_location'],
      [order => { order.fulfillment.store_location = 'Other location' }, 'wrong_pickup_location'],
      [order => { order.meta.pickup_person = structuredClone(task.request.customer) }, 'wrong_pickup_person'],
      [order => { order.meta.items_fulfillment[0].fulfillment = 'shipping' }, 'wrong_item_fulfillment'],
      [order => { order.shipping_address = task.request.shipping_address }, 'unexpected_shipping_address'],
      [order => { order.fulfillment.method = 'ship' }, 'wrong_fulfillment'],
    ]) {
      const evidence = evidenceFor(task); mutate(evidence.orders[0]); rejects(task, evidence, code)
    }
  }
})

test('digital stock events and seeded quantities cannot be substituted for physical ones', () => {
  for (const task of scenarios.filter(task => ['availability_loss', 'availability_fallback', 'cart_recovery'].includes(task.family))) {
    const evidence = evidenceFor(task), digital = digitalStores.includes(task.store)
    if (task.family === 'cart_recovery') evidence.scenarioEvents[0].quantity = digital ? 2 : 1
    else evidence.scenarioEvents[0].requested_fulfillment = digital ? 'shipping' : 'digital'
    rejects(task, evidence, 'missing_scenario_event')
  }
})

test('Buy Now cannot bypass correction of the seeded cart or reuse another purchase correction', () => {
  for (const task of scenarios.filter(task => task.family === 'cart_recovery')) {
    const ignoredCart = evidenceFor(task)
    ignoredCart.scenarioEvents = ignoredCart.scenarioEvents.filter(event => event.type !== 'cart_corrected')
    rejects(task, ignoredCart, 'missing_scenario_event')
    for (const changes of [
      { session_id: 'different-shopper' }, { order_number: 'other-order' },
      { unexpected_items: 1 }, { excess_quantity: 1 },
    ]) {
      const evidence = evidenceFor(task)
      Object.assign(evidence.scenarioEvents.find(event => event.type === 'cart_corrected'), changes)
      rejects(task, evidence, 'missing_scenario_event')
    }
    const cleanupAfterPurchase = evidenceFor(task)
    cleanupAfterPurchase.orders[0].benchmark.scenario_event_sequence = 1
    rejects(task, cleanupAfterPurchase, 'scenario_event_after_purchase')
  }
})

test('all store configurations reject unsupported products, fallback locations and private settings', t => {
  t.after(() => configureBenchmarkScenario())
  for (const task of scenarios) assert.doesNotThrow(() => configureBenchmarkScenario(task), task.id)
  for (const store of stores) {
    const task = tasksFor(store, 'payment_recovery')[0]
    for (const changes of [{ product_id: 'invented-offer' }, { type: 'invented-scenario' }, { primary_last4: '4444' }, { pickup_store: 'invented-location' }, { available: true }]) {
      assert.throws(() => configureBenchmarkScenario({ store, scenario: { ...task.scenario, ...changes } }), undefined, `${store}: ${JSON.stringify(changes)}`)
    }
    const recovery = tasksFor(store, 'cart_recovery')[0]
    assert.throws(() => configureBenchmarkScenario({ store, scenario: { ...recovery.scenario, alternate_product_id: recovery.scenario.product_id } }))
    if (!pickupStores.includes(store)) assert.throws(() => configureBenchmarkScenario({ store, scenario: { ...task.scenario, type: 'availability_fallback' } }))
  }
})

test('every store has a final-commit defense against card or stock route bypasses', t => {
  t.after(() => configureBenchmarkScenario())
  for (const storeName of stores) {
    const paymentTask = tasksFor(storeName, 'payment_recovery')[0]
    configureBenchmarkScenario(paymentTask)
    const store = { cart: [{ sku: paymentTask.scenario.product_id, qty: 1 }], checkout: {} }
    initializeScenarioStore(storeName, store)
    assert.match(scenarioPayment(store, { method: 'card', last4: '4242' }), /declined/)
    assert.deepEqual(scenarioEvents().map(event => [event.store, event.product_id]), [[storeName, paymentTask.scenario.product_id]])
    for (const payment of [{ method: 'card', last4: '4242' }, { method: 'wallet' }]) {
      assert.throws(() => assertScenarioOrder({ store: storeName, items: [{ sku: paymentTask.scenario.product_id }], payment }), /not authorized/)
    }
    const stockTask = tasksFor(storeName, 'availability_loss')[0]
    configureBenchmarkScenario(stockTask)
    initializeScenarioStore(storeName, store)
    const order = { store: storeName, items: [{ sku: stockTask.scenario.product_id }], fulfillment: { method: 'ship' } }
    assert.throws(() => assertScenarioOrder(order), /transition/)
    enterScenarioCart(store)
    assert.equal(scenarioAvailability(store, stockTask.scenario.product_id, 'shipping'), false)
    assert.equal(scenarioAvailability(store, stockTask.scenario.product_id, 'pickup'), false)
    assert.throws(() => assertScenarioOrder(order), /unavailable/)
  }
})

test('normalized orders retain evaluator provenance and cannot override it with checkout input', t => {
  t.after(() => { configureBenchmarkScenario(); configureOrders() })
  for (const storeName of stores) {
    const task = tasksFor(storeName, 'cart_recovery')[0]
    configureBenchmarkScenario(task)
    const state = { cart: [], checkout: {} }
    initializeScenarioStore(storeName, state)
    state.cart = []
    const metadata = { run_id: 'trusted-run', task_id: task.id, task_version: task.version, catalog_mode: task.catalog_mode }
    configureOrders({ metadata })
    const order = orderFor(task)
    const saved = recordOrder({ ...order, benchmark: { catalog_mode: 'live', task_id: 'forged-task', scenario_event_sequence: 999 }, session: { id: 'reference-session', run_id: 'trusted-run', stores: { [storeName]: state } } })
    assert.deepEqual(saved.benchmark, { ...metadata, scenario_event_sequence: 2 })
    assert.equal(saved.items[0].kind, task.request.kind)
    assert.equal(saved.run_id, 'trusted-run')
    assert.equal(gradeTask(task, { ...evidenceFor(task), orders: [saved], scenarioEvents: scenarioEvents() }).status, 'passed')
  }
})

test('invalid catalog mode is rejected before a worker can serve an invented live offer', async () => {
  for (const catalog_mode of ['live', 'reference-with-fixtures', '', 1]) {
    await assert.rejects(startEnvironment({ task: { catalog_mode }, directory: '/nonexistent-invalid-catalog-test' }), /Unsupported task catalog mode/)
  }
})
