import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, writeFileSync, statSync, linkSync, readdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { configureOrders, recordOrder, listOrders, clearOrders, appendOrderEvent, finalizeOrders } from '../lib/orders.js'
import { createSessionMiddleware, sessionMiddleware, resetSessions } from '../lib/session.js'
import { benchmarkDate, validateCard } from '../lib/payment.js'

function visit(middleware, { cookie, pathname = '/gamestop', run } = {}) {
  const req = { socket: { localPort: 3000 }, headers: { cookie }, path: pathname, query: run === undefined ? {} : { run } }
  let nextCalled = false, setCookie
  middleware(req, { setHeader(name, value) { if (name === 'Set-Cookie') setCookie = value } }, () => { nextCalled = true })
  assert.equal(nextCalled, true)
  return { session: req.session, cookie: setCookie?.split(';')[0] || cookie }
}

function orderInput(overrides = {}) {
  return {
    store: 'gamestop', order_number: 'TEST-001', session: { id: 'session-1', run_id: 'run-1' },
    items: [{ kind: 'game', platform: 'ps5', edition: 'standard', format: 'physical', qty: 1, unit_price: 79.99 }],
    customer: { email: 'tester@example.com' }, fulfillment: { method: 'ship' },
    payment: { method: 'card', last4: '4242' }, totals: { subtotal: 79.99, shipping: 0, tax: 0, total: 79.99 }, currency: 'USD',
    ...overrides,
  }
}

function temporaryEvidence(t) {
  const directory = mkdtempSync(path.join(tmpdir(), 'gta-benchmark-state-'))
  t.after(() => { configureOrders({ file: null }); rmSync(directory, { recursive: true, force: true }) })
  return { directory, file: path.join(directory, 'orders.json') }
}

test('benchmark sessions ignore query retagging and isolate state between workers', () => {
  const middleware = createSessionMiddleware({ runId: 'assigned-run' })
  const first = visit(middleware, { run: 'attacker-run' })
  assert.equal(first.session.run_id, 'assigned-run')
  first.session.stores.gamestop = { cart: ['existing-product'] }
  const second = visit(middleware, { cookie: first.cookie, run: 'another-run' })
  assert.equal(second.session, first.session)
  assert.equal(second.session.run_id, 'assigned-run')
  assert.throws(() => { second.session.run_id = 'changed' }, TypeError)
  const otherWorker = visit(createSessionMiddleware({ runId: 'other-run' }), { cookie: first.cookie })
  assert.equal(otherWorker.session.run_id, 'other-run')
  assert.notEqual(otherWorker.session.id, first.session.id)
  assert.deepEqual(otherWorker.session.stores, {})
  for (const runId of ['', '  ', null, 7]) assert.throws(() => createSessionMiddleware({ runId }), /runId/)
})

test('legacy sessions retain navigation tagging while API filters leave the tag alone', () => {
  resetSessions()
  const first = visit(sessionMiddleware, { run: 'first-run' })
  assert.equal(first.session.run_id, 'first-run')
  const api = visit(sessionMiddleware, { cookie: first.cookie, pathname: '/api/orders', run: 'filtered-run' })
  assert.equal(api.session.run_id, 'first-run')
  const second = visit(sessionMiddleware, { cookie: first.cookie, run: 'second-run' })
  assert.equal(second.session.run_id, 'second-run')
  resetSessions()
})

test('order evidence is replaced atomically with private permissions and remains reloadable', t => {
  const { directory, file } = temporaryEvidence(t)
  configureOrders({ file })
  const first = recordOrder(orderInput())
  const previous = path.join(directory, 'previous.json')
  linkSync(file, previous)
  recordOrder(orderInput({ order_number: 'TEST-002' }))
  assert.equal(JSON.parse(readFileSync(previous, 'utf8')).length, 1, 'old inode must retain its complete previous snapshot')
  assert.equal(JSON.parse(readFileSync(file, 'utf8')).length, 2)
  assert.equal(statSync(file).mode & 0o777, 0o600)
  assert.deepEqual(readdirSync(directory).sort(), ['orders.json', 'previous.json'])
  appendOrderEvent(first.id, { store: first.store, session_id: first.session_id, action: 'cancel', status: 'cancelled', reason: 'Changed plans' })
  configureOrders({ file })
  assert.equal(listOrders()[0].meta.lifecycle[0].status, 'cancelled')
  clearOrders()
  assert.deepEqual(JSON.parse(readFileSync(file, 'utf8')), [])
})

test('invalid saved evidence fails loudly without replacing loaded evidence or its source', t => {
  const { directory, file } = temporaryEvidence(t)
  configureOrders({ file })
  const prior = recordOrder(orderInput())
  const corrupted = path.join(directory, 'corrupted.json')
  for (const contents of ['{truncated', '{}', '[null]', '[{}]', JSON.stringify([{ ...prior, items: [] }])]) {
    writeFileSync(corrupted, contents)
    assert.throws(() => configureOrders({ file: corrupted }), /Cannot load order evidence/)
    assert.equal(listOrders()[0].id, prior.id)
    assert.equal(readFileSync(corrupted, 'utf8'), contents)
  }
  recordOrder(orderInput({ order_number: 'TEST-002' }))
  assert.equal(JSON.parse(readFileSync(file, 'utf8')).length, 2, 'failed configure must keep the original destination')
})

test('a failed evidence write leaves disk and in-memory evidence unchanged', t => {
  const { directory, file } = temporaryEvidence(t)
  configureOrders({ file })
  recordOrder(orderInput())
  const previous = readFileSync(file, 'utf8')
  assert.throws(() => recordOrder(orderInput({ order_number: 'UNSERIALIZABLE', meta: { invalid: 1n } })), /BigInt/)
  assert.equal(listOrders().length, 1)
  assert.equal(readFileSync(file, 'utf8'), previous)
  assert.deepEqual(readdirSync(directory), ['orders.json'])
})

test('benchmark metadata is independently snapshotted at configuration and purchase', t => {
  const { file } = temporaryEvidence(t)
  const metadata = { run_id: 'run-1', task_id: 'purchase-ps5', catalog_mode: 'reference', versions: { suite: '1' } }
  configureOrders({ file, metadata })
  metadata.versions.suite = 'modified-input'
  const first = recordOrder(orderInput())
  assert.equal(first.benchmark.versions.suite, '1')
  first.benchmark.versions.suite = 'modified-order'
  const second = recordOrder(orderInput({ order_number: 'TEST-002' }))
  assert.equal(second.benchmark.versions.suite, '1')
  configureOrders({ file })
  assert.equal(listOrders()[1].benchmark.task_id, 'purchase-ps5')
  configureOrders({ file: null })
  assert.equal('benchmark' in recordOrder(orderInput()), false, 'legacy orders retain their schema')
  assert.throws(() => configureOrders({ metadata: [] }), /plain object/)
})

test('finalized order evidence rejects new purchases, lifecycle edits and clearing', t => {
  const { file } = temporaryEvidence(t)
  configureOrders({ file })
  const order = recordOrder(orderInput())
  const original = readFileSync(file, 'utf8')
  finalizeOrders()
  finalizeOrders()
  assert.throws(() => recordOrder(orderInput({ order_number: 'AFTER-FINISH' })), /finalized/)
  assert.throws(() => appendOrderEvent(order.id, { store: order.store, session_id: order.session_id, action: 'cancel', status: 'cancelled', reason: 'Too late' }), /finalized/)
  assert.throws(() => clearOrders(), /finalized/)
  assert.equal(readFileSync(file, 'utf8'), original)
  assert.deepEqual(listOrders(), JSON.parse(original))
  configureOrders({ file })
  recordOrder(orderInput({ order_number: 'RECONFIGURED' }))
  assert.equal(listOrders().length, 2, 'explicit configuration opens a new writable repository')
})

test('only an explicit valid benchmark date pins payment expiry validation', t => {
  const original = process.env.BENCHMARK_DATE
  t.after(() => { if (original === undefined) delete process.env.BENCHMARK_DATE; else process.env.BENCHMARK_DATE = original })
  delete process.env.BENCHMARK_DATE
  assert.equal(benchmarkDate(), null)
  assert.equal(benchmarkDate('2024-02-29').toISOString(), '2024-02-29T00:00:00.000Z')
  for (const value of ['', '2023-02-29', '2024-02-30', '2026-13-01', '2026-10-07T00:00:00Z', '10/07/2026', null]) {
    assert.throws(() => benchmarkDate(value), /BENCHMARK_DATE.*YYYY-MM-DD/)
  }
  const card = { number: '4242424242424242', expiry: '02/01', cvv: '123' }
  process.env.BENCHMARK_DATE = '2001-02-28'
  assert.equal(validateCard(card).ok, true, 'the fixed current month remains valid regardless of the host date')
  process.env.BENCHMARK_DATE = '2001-03-01'
  assert.equal(validateCard(card).errors.expiry, 'This card has expired.')
  process.env.BENCHMARK_DATE = 'invalid'
  assert.throws(() => validateCard(card), /BENCHMARK_DATE/)
})
