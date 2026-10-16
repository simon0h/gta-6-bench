import test, { beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import express from 'express'
import { MAX_PUBLIC_SESSIONS, createSessionMiddleware, exportSessions, resetSessions, sessionMiddleware } from '../lib/session.js'
import { MAX_ACCOUNTS_PER_STORE, TEST_ACCOUNT, authenticate, createAccount, exportAccounts, prepareAccountImport, resetAccounts } from '../lib/accounts.js'
import { configureOrders, listOrders, recordOrder } from '../lib/orders.js'
import { checkpointChanges } from '../deploy/coordinator.js'
import { createDashboardRouter } from '../dashboard/router.js'

beforeEach(() => { resetSessions(); resetAccounts(); configureOrders({ file: null }) })

function visit(middleware, cookie) {
  const headers = {}
  const req = { headers: cookie ? { cookie } : {}, path: '/bestbuy', query: {}, socket: { localPort: 1 }, app: { get: () => undefined } }
  const res = { setHeader: (name, value) => { headers[name] = value } }
  middleware(req, res, () => {})
  return { session: req.session, cookie: headers['Set-Cookie']?.split(';')[0] ?? cookie }
}

test('the shared store sessions drop the least recently seen visitors past the limit', () => {
  const first = visit(sessionMiddleware), second = visit(sessionMiddleware)
  for (let i = 0; i < MAX_PUBLIC_SESSIONS - 2; i++) visit(sessionMiddleware)
  assert.equal(exportSessions().length, MAX_PUBLIC_SESSIONS)
  // The first visitor came back later than everyone else.
  assert.equal(visit(sessionMiddleware, first.cookie).session, first.session)
  first.session.seen_at = '9999-12-31T23'
  const newest = visit(sessionMiddleware)
  const kept = new Set(exportSessions().map(session => session.id))
  assert.ok(kept.size < MAX_PUBLIC_SESSIONS)
  assert.ok(kept.has(first.session.id) && kept.has(newest.session.id))
  assert.ok(!kept.has(second.session.id))
})

test('a benchmark run keeps every session of its own worker', () => {
  const middleware = createSessionMiddleware({ runId: 'limits-run' })
  for (let i = 0; i < MAX_PUBLIC_SESSIONS + 5; i++) visit(middleware)
  assert.equal(exportSessions({ runId: 'limits-run' }).length, MAX_PUBLIC_SESSIONS + 5)
})

test('store accounts keep hashed passwords, never the typed one', () => {
  const account = createAccount('bestbuy', { email: 'reuse@example.com', password: 'Reused-Elsewhere-1' })
  assert.doesNotMatch(JSON.stringify(exportAccounts()), /Reused-Elsewhere-1|Password123!/)
  assert.equal(authenticate('bestbuy', 'reuse@example.com', 'Reused-Elsewhere-1'), account)
  assert.equal(authenticate('bestbuy', 'reuse@example.com', 'wrong'), null)
  assert.ok(authenticate('bestbuy', TEST_ACCOUNT.email, TEST_ACCOUNT.password))
})

test('plain passwords from older checkpoints are hashed on import and still sign in', () => {
  prepareAccountImport([{ store: 'gamestop', account: { id: 'gamestop-2', email: 'old@example.com', password: 'Older-Plain-1' } }])()
  assert.doesNotMatch(JSON.stringify(exportAccounts()), /Older-Plain-1/)
  assert.ok(authenticate('gamestop', 'old@example.com', 'Older-Plain-1'))
})

test('each store keeps the tester and its newest sign-ups', () => {
  for (let i = 0; i < MAX_ACCOUNTS_PER_STORE + 3; i++) createAccount('target', { email: `shopper${i}@example.com`, password: 'Shopper-Pass-1' })
  const accounts = exportAccounts().filter(entry => entry.store === 'target').map(entry => entry.account)
  assert.ok(accounts.length <= MAX_ACCOUNTS_PER_STORE + 1)
  assert.ok(accounts.some(account => account.email === TEST_ACCOUNT.email))
  assert.ok(!accounts.some(account => account.email === 'shopper0@example.com'))
  assert.equal(new Set(accounts.map(account => account.id)).size, accounts.length)
  assert.equal(createAccount('target', { email: 'late@example.com', password: 'Shopper-Pass-1' }).id, `target-${MAX_ACCOUNTS_PER_STORE + 5}`)
  assert.ok(authenticate('target', 'late@example.com', 'Shopper-Pass-1'))
})

test('an order limit keeps only the newest orders', () => {
  configureOrders({ file: null, limit: 5 })
  const order = n => recordOrder({ store: 'bestbuy', order_number: `BBY-${n}`, session: null, items: [{ kind: 'other', title: 'Controller', qty: 1, unit_price: 69.99 }],
    customer: { email: 'buyer@example.com' }, fulfillment: { method: 'ship' }, payment: { method: 'card', last4: '4242' }, totals: { total: 69.99 }, currency: 'USD' })
  for (const n of [1, 2, 3, 4, 5, 6]) order(n)
  assert.deepEqual(listOrders().map(item => item.order_number), ['BBY-3', 'BBY-4', 'BBY-5', 'BBY-6'])
  assert.throws(() => configureOrders({ file: null, limit: 0 }), /positive integer/)
})

test('operator sign-in pauses an address after ten wrong tokens', async t => {
  const token = 'limits-operator-token-'.repeat(2)
  const app = express().use(createDashboardRouter({ manager: {}, apiToken: token }))
  const server = app.listen(0)
  t.after(() => server.close())
  await new Promise(resolve => server.once('listening', resolve))
  const base = `http://127.0.0.1:${server.address().port}`
  const login = (value, address = '203.0.113.7') => fetch(base + '/dashboard/api/login', {
    method: 'POST', headers: { 'content-type': 'application/json', origin: base, 'cf-connecting-ip': address }, body: JSON.stringify({ token: value }),
  })
  for (let i = 0; i < 10; i++) assert.equal((await login('wrong')).status, 401)
  const blocked = await login(token)
  assert.equal(blocked.status, 429)
  assert.ok(Number(blocked.headers.get('retry-after')) > 0)
  assert.equal((await login(token, '198.51.100.4')).status, 200)
})

test('a checkpoint save writes only the rows that changed', () => {
  const rows = [
    { kind: 'sessions', ordinal: 0, value: '{"id":"a"}' }, { kind: 'sessions', ordinal: 1, value: '{"id":"b"}' },
    { kind: 'sessions', ordinal: 2, value: '{"id":"c"}' }, { kind: 'retired', ordinal: 0, value: '{}' },
  ]
  const { writes, trims } = checkpointChanges(rows, { sessions: [{ id: 'a' }, { id: 'B' }], orders: [{ id: 1 }] }, ['sessions', 'orders'])
  assert.deepEqual(writes, [{ kind: 'sessions', ordinal: 1, value: '{"id":"B"}' }, { kind: 'orders', ordinal: 0, value: '{"id":1}' }])
  assert.deepEqual(trims, [{ kind: 'sessions', from: 2 }, { kind: 'retired', from: 0 }])
})
