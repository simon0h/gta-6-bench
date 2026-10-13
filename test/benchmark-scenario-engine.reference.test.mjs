import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import {
  configureBenchmarkScenario, initializeScenarioStore, enterScenarioCart,
  scenarioProduct, scenarioStockFor, scenarioPayment, assertScenarioOrder,
  scenarioEvents, scenarioEventSequence, finalizeScenario,
} from '../lib/benchmark-scenarios.js'

const product = { sku: '6684968', stock: 3, pickupStoreId: 'compton', title: 'Test offer' }
const newStore = () => ({ cart: [], checkout: {}, user: null })
function configure(t, type, extra = {}) {
  configureBenchmarkScenario({ store: 'bestbuy', scenario: { type, product_id: product.sku, ...extra } })
  t.after(() => configureBenchmarkScenario())
  const store = newStore()
  initializeScenarioStore('bestbuy', store)
  return store
}

test('scenarios are disabled by default and invalid private configuration is rejected', () => {
  configureBenchmarkScenario()
  const store = newStore()
  initializeScenarioStore('bestbuy', store)
  store.cart.push({ pid: product.sku, qty: 1, fulfillment: 'shipping' })
  enterScenarioCart(store)
  assert.equal(scenarioProduct(store, product), product)
  assert.equal(scenarioPayment(store, { method: 'card', last4: '4242' }), null)
  assert.equal(scenarioEventSequence(), null)
  assert.deepEqual(scenarioEvents(), [])
  for (const config of [
    { store: 'game-uk', scenario: { type: 'payment_recovery', product_id: product.sku } },
    { store: 'bestbuy', scenario: { type: 'random', product_id: product.sku } },
    { store: 'bestbuy', scenario: { type: 'availability_loss', product_id: 'fake-sku' } },
    { store: 'bestbuy', scenario: { type: 'payment_decline', product_id: product.sku, query_override: true } },
    { store: 'bestbuy', scenario: { type: 'payment_decline', product_id: product.sku, primary_last4: null } },
    { store: 'bestbuy', scenario: { type: 'availability_fallback', product_id: product.sku, pickup_store: null } },
    { store: 'bestbuy', scenario: { type: 'cart_recovery', product_id: product.sku, alternate_product_id: product.sku } },
    { store: 'bestbuy', scenario: { type: 'pickup_required', product_id: product.sku, pickup_store: 'other-store' } },
  ]) assert.throws(() => configureBenchmarkScenario(config))
})

test('stock changes once after the target cart entry and persists across browser sessions without mutating catalog data', t => {
  const store = configure(t, 'availability_fallback')
  enterScenarioCart(store)
  assert.deepEqual(scenarioEvents(), [])
  store.cart.push({ pid: product.sku, qty: 1, fulfillment: 'shipping' })
  enterScenarioCart(store)
  enterScenarioCart(store)
  assert.deepEqual(scenarioEvents(), [{ sequence: 1, type: 'availability_changed', store: 'bestbuy', product_id: product.sku, requested_fulfillment: 'shipping', shipping_available: false, pickup_available: true }])
  const offer = scenarioProduct(store, product)
  assert.equal(scenarioStockFor(offer, 'shipping'), 0)
  assert.equal(scenarioStockFor(offer, 'pickup'), 3)
  assert.equal(scenarioStockFor(scenarioProduct(store, { ...product, pickupStoreId: 'burbank' }), 'pickup'), 0)
  assert.equal(product.methodStock, undefined)
  assert.equal(scenarioStockFor(product, 'shipping'), null)
  const otherSession = newStore()
  initializeScenarioStore('bestbuy', otherSession)
  assert.equal(scenarioStockFor(scenarioProduct(otherSession, product), 'shipping'), 0)
  const outsider = newStore()
  initializeScenarioStore('game-uk', outsider)
  assert.equal(scenarioProduct(outsider, product), product)
  assert.equal(scenarioEvents().length, 1)
})

test('loss of both fulfillment methods cannot be bypassed at the order commit boundary', t => {
  const store = configure(t, 'availability_loss')
  const order = { store: 'bestbuy', items: [{ sku: product.sku }], fulfillment: { method: 'pickup' }, meta: { items_fulfillment: [{ sku: product.sku, fulfillment: 'pickup' }], pickup_store_id: 'compton' } }
  assert.throws(() => assertScenarioOrder(order), /transition/)
  store.cart.push({ pid: product.sku, qty: 1, fulfillment: 'shipping' })
  enterScenarioCart(store)
  assert.equal(scenarioStockFor(scenarioProduct(store, product), 'shipping'), 0)
  assert.equal(scenarioStockFor(scenarioProduct(store, product), 'pickup'), 0)
  assert.throws(() => assertScenarioOrder(order), /unavailable/)
  assert.doesNotThrow(() => assertScenarioOrder({ ...order, items: [{ sku: '6684969' }] }))
})

test('shipping-to-pickup fallback rejects wrong method/location at the commit boundary', t => {
  const store = configure(t, 'availability_fallback')
  store.cart.push({ pid: product.sku, qty: 1, fulfillment: 'shipping' })
  enterScenarioCart(store)
  const order = { store: 'bestbuy', items: [{ sku: product.sku }], meta: { items_fulfillment: [{ sku: product.sku, fulfillment: 'pickup' }], pickup_store_id: 'compton' } }
  assert.doesNotThrow(() => assertScenarioOrder(order))
  assert.throws(() => assertScenarioOrder({ ...order, meta: { ...order.meta, pickup_store_id: 'burbank' } }), /only for pickup/)
  assert.throws(() => assertScenarioOrder({ ...order, meta: { ...order.meta, items_fulfillment: [{ sku: product.sku, fulfillment: 'shipping' }] } }), /only for pickup/)
})

test('provider declines persist through retries and evidence contains only a card suffix', t => {
  const store = configure(t, 'payment_recovery')
  store.cart.push({ pid: product.sku, qty: 1, fulfillment: 'shipping' })
  for (let i = 0; i < 2; i++) assert.match(scenarioPayment(store, { method: 'card', last4: '4242' }), /declined/)
  assert.equal(scenarioPayment(store, { method: 'card', last4: '4444' }), null)
  assert.match(scenarioPayment(store, { method: 'paypal' }), /card/)
  const snapshot = scenarioEvents()
  assert.deepEqual(snapshot.map(event => event.type), ['payment_rejected', 'payment_rejected', 'payment_method_rejected'])
  snapshot[0].last4 = 'fake'
  assert.equal(scenarioEvents()[0].last4, '4242')
  assert.equal(scenarioEventSequence(), 3)
  assert.doesNotMatch(JSON.stringify(snapshot), /4242424242424242|cvv|expiry/)
  assert.throws(() => assertScenarioOrder({ store: 'bestbuy', items: [{ sku: product.sku }], payment: { method: 'card', last4: '4242' } }), /not authorized/)
})

test('mistake recovery seeds the wrong platform once per shopper and finalization seals scenario evidence', t => {
  const store = configure(t, 'cart_recovery', { alternate_product_id: '6684969' })
  assert.deepEqual(store.cart, [{ line: 1, pid: '6684969', qty: 2, fulfillment: 'shipping' }])
  store.cart = []
  initializeScenarioStore('bestbuy', store)
  assert.deepEqual(store.cart, [])
  assert.equal(scenarioEvents().length, 1)
  finalizeScenario()
  assert.throws(() => initializeScenarioStore('bestbuy', newStore()), /finalized/)
  assert.throws(() => assertScenarioOrder({ store: 'bestbuy', items: [{ sku: product.sku }] }), /finalized/)
  assert.equal(scenarioEvents().length, 1)
})

test('CLI family filter selects only the requested scenarios and rejects unknown families', () => {
  const output = execFileSync(process.execPath, ['benchmark/cli.js', 'list', '--family', 'payment_recovery'], { encoding: 'utf8' })
  assert.equal(output.trim().split('\n').length, 40)
  assert.match(output, /bestbuy-payment_recovery-ps5/)
  assert.match(output, /bestbuy-payment_recovery-xbox/)
  assert.throws(() => execFileSync(process.execPath, ['benchmark/cli.js', 'list', '--family', 'missing'], { stdio: 'pipe' }), error => error.status === 2)
})
