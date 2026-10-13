import test, { before, after, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { createHostedApp, startHostedServer, exportHostingState, importHostingState } from '../deploy/server.js'
import { readBounded, RESPONSE_LIMIT } from '../deploy/coordinator.js'
import { resetSessions, sessionMiddleware } from '../lib/session.js'
import { configureOrders, recordOrder } from '../lib/orders.js'
import { resetAccounts, authenticate } from '../lib/accounts.js'
import { client } from './helpers.js'

const internalToken = 'internal-checkpoint-test-token'
const apiToken = 'operator-api-test-token'
const privateHeaders = { authorization: `Bearer ${internalToken}` }
const operatorHeaders = { authorization: `Bearer ${apiToken}` }
let server, base

async function start() {
  server = await startHostedServer({ port: 0, internalToken, apiToken })
  base = `http://127.0.0.1:${server.address().port}`
}

async function stop() {
  server.closeAllConnections()
  await new Promise(resolve => server.close(resolve))
}

async function state() {
  const response = await fetch(`${base}/__hosting/state`, { headers: privateHeaders })
  assert.equal(response.status, 200)
  return response.json()
}

async function restore(snapshot) {
  return fetch(`${base}/__hosting/state`, {
    method: 'PUT', headers: { ...privateHeaders, 'content-type': 'application/json' }, body: JSON.stringify(snapshot),
  })
}

before(start)
after(stop)
beforeEach(() => { resetSessions(); resetAccounts(); configureOrders({ file: null }) })

test('hosted startup refuses missing internal or operator credentials', async () => {
  await assert.rejects(createHostedApp({ internalToken: '', apiToken }), /HOSTING_INTERNAL_TOKEN is required/)
  await assert.rejects(createHostedApp({ internalToken, apiToken: '' }), /BENCHMARK_API_TOKEN is required/)
})

test('only operators can read or clear ground truth and only the internal token can checkpoint', async () => {
  for (const pathname of ['/__hosting/state', '/__hosting/health', '/__HOSTING/state', '/__hosting/unknown']) {
    for (const headers of [{}, operatorHeaders, { authorization: 'Bearer invalid' }]) {
      assert.equal((await fetch(base + pathname, { headers })).status, 404, pathname)
    }
  }
  assert.equal((await fetch(`${base}/__hosting/health`, { headers: privateHeaders })).status, 200)
  for (const [method, pathname] of [
    ['GET', '/api/stores'], ['GET', '/api/catalog'], ['GET', '/api/captcha'],
    ['GET', '/api/orders'], ['GET', '/api/orders/example'], ['DELETE', '/api/orders'],
    ['GET', '/API/ORDERS/'],
  ]) {
    for (const headers of [{}, privateHeaders, { authorization: 'Bearer invalid' }]) {
      const response = await fetch(base + pathname, { method, headers })
      assert.equal(response.status, 401, `${method} ${pathname}`)
      assert.equal(response.headers.get('set-cookie'), null, 'denied API access must not create a session')
    }
  }
  assert.equal((await fetch(`${base}/api/health`)).status, 200)
  assert.equal((await fetch(`${base}/api/orders`, { headers: operatorHeaders })).status, 200)
  assert.equal((await fetch(`${base}/api/orders`, { method: 'DELETE', headers: operatorHeaders })).status, 200)
  const stores = await (await fetch(`${base}/api/stores`, { headers: operatorHeaders })).json()
  assert.equal(stores.length, 20)
  assert.ok(stores.every(store => !store.captcha?.enabled), 'hosted mode always disables synthetic CAPTCHA')
})

test('hosted static assets and missing assets never create sessions', async () => {
  for (const pathname of ['/static/product-gallery.css', '/gamestop/static/style.css', '/static/missing-file.svg', '/gamestop/static/missing-file.svg', '/unknown/static/missing-file.svg']) {
    for (const method of ['GET', 'HEAD']) {
      const response = await fetch(base + pathname, { method })
      assert.equal(response.status, pathname.includes('missing-file') ? 404 : 200)
      assert.equal(response.headers.get('set-cookie'), null)
      await response.arrayBuffer()
    }
  }
  assert.deepEqual((await state()).sessions, [])
})

test('large embedded product images fit the hosted dynamic response limit', async () => {
  for (const productId of ['448295', '448297']) {
    const response = await fetch(`${base}/product-assets/gamestop/${productId}/0.svg`)
    assert.equal(response.status, 200, productId)
    assert.match(response.headers.get('content-type'), /image\/svg\+xml/)
    const expectedLength = Number(response.headers.get('content-length'))
    assert.ok(expectedLength > 8 * 1024 * 1024, 'exercise a real asset larger than the old response limit')
    const body = await readBounded(response, RESPONSE_LIMIT)
    assert.equal(body.byteLength, expectedLength, 'the entire image must survive hosted response buffering')
    assert.ok(body.byteLength <= RESPONSE_LIMIT)
    assert.match(new TextDecoder().decode(body.subarray(0, 256)), /<svg\b/)
  }
})

test('health polling does not allocate shopper sessions', async () => {
  for (let count = 0; count < 3; count++) {
    const response = await fetch(`${base}/api/health`)
    assert.equal(response.status, 200)
    assert.equal(response.headers.get('set-cookie'), null)
    assert.equal((await response.json()).stores, 20)
  }
  assert.deepEqual((await state()).sessions, [])
})

test('hosted cookies are stable and secure while local middleware keeps its port-specific cookie', async () => {
  const response = await fetch(`${base}/gamestop?run=secure-cookie`)
  const cookie = response.headers.get('set-cookie')
  assert.match(cookie, /^sid_hosted=[a-f0-9]{32};/)
  assert.match(cookie, /; HttpOnly;/)
  assert.match(cookie, /; SameSite=Lax; Secure$/)
  const req = { socket: { localPort: 3456 }, headers: {}, path: '/', query: {} }
  let localCookie
  sessionMiddleware(req, { setHeader(name, value) { localCookie = value } }, () => {})
  assert.match(localCookie, /^sid_3456=/)
  assert.doesNotMatch(localCookie, /Secure/)
})

test('checkpoint restores carts, signed-in sessions, new account logins and order evidence after restart', async () => {
  const shopper = client(base)
  await shopper.get('/gamestop?run=hosted-round-trip')
  assert.equal((await shopper.post('/gamestop/account/create', {
    firstName: 'Hosting', lastName: 'Tester', email: 'hosting@example.com',
    password: 'Hosting123!', confirmPassword: 'Hosting123!',
  })).status, 200)
  assert.equal((await shopper.post('/gamestop/cart/add', { pid: '448295' })).status, 200)
  const current = (await state()).sessions[0]
  assert.equal(current.stores.gamestop.cart.length, 1)
  assert.equal(current.stores.gamestop.user.email, 'hosting@example.com')
  recordOrder({
    store: 'gamestop', order_number: 'HOSTED-001', session: current,
    items: [{ kind: 'game', platform: 'ps5', edition: 'standard', format: 'physical', qty: 1, unit_price: 79.99 }],
    customer: { email: 'hosting@example.com' }, fulfillment: { method: 'ship' },
    payment: { method: 'card', last4: '4242' }, totals: { subtotal: 79.99, shipping: 0, tax: 0, total: 79.99 }, currency: 'USD',
  })
  const saved = await state()
  const savedCookie = shopper.jar.get('sid_hosted')
  await stop()
  resetSessions()
  resetAccounts()
  await start()
  assert.deepEqual(await state(), { version: 1, sessions: [], orders: [], accounts: [] })
  assert.equal((await restore(saved)).status, 200)
  assert.deepEqual(await state(), saved)

  const resumed = client(base)
  resumed.jar.set('sid_hosted', savedCookie)
  const cart = await resumed.get('/gamestop/cart')
  assert.equal(cart.status, 200)
  assert.match(cart.text, /Hi, Hosting/)
  assert.match(cart.text, /Grand Theft Auto VI/)
  assert.equal((await state()).sessions.length, 1, 'the old browser cookie must retain its restored session')
  const orders = await (await fetch(`${base}/api/orders?run=hosted-round-trip`, { headers: operatorHeaders })).json()
  assert.equal(orders.length, 1)
  assert.equal(orders[0].order_number, 'HOSTED-001')

  await resumed.get('/gamestop/logout')
  assert.equal((await resumed.post('/gamestop/login', { email: 'hosting@example.com', password: 'Hosting123!' })).status, 200)
  assert.equal(authenticate('gamestop', 'hosting@example.com', 'Hosting123!')?.first_name, 'Hosting')
  assert.equal((await state()).sessions[0].stores.gamestop.user.email, 'hosting@example.com')
})

test('invalid checkpoints leave every state bucket intact', async () => {
  await fetch(`${base}/gamestop?run=unchanged`)
  const original = await state()
  const duplicateSession = structuredClone(original)
  duplicateSession.sessions.push(duplicateSession.sessions[0])
  for (const invalid of [
    { ...original, version: 2 }, { ...original, sessions: null }, duplicateSession,
    { ...original, sessions: [{ ...original.sessions[0], stores: { gamestop: { cart: 'invalid' } } }] },
    { ...original, sessions: [], orders: [{}] },
    { ...original, sessions: [], accounts: [{ store: 'gamestop', account: {} }] },
  ]) {
    assert.equal((await restore(invalid)).status, 400)
    assert.deepEqual(await state(), original)
  }
  const malformed = await fetch(`${base}/__hosting/state`, {
    method: 'PUT', headers: { ...privateHeaders, 'content-type': 'application/json' }, body: '{truncated',
  })
  assert.equal(malformed.status, 400)
  assert.deepEqual(await state(), original)
})

test('checkpoint exports and imports do not retain mutable caller references', async () => {
  await fetch(`${base}/gamestop?run=original`)
  const snapshot = exportHostingState()
  importHostingState(snapshot)
  snapshot.sessions[0].run_id = 'modified-input'
  assert.equal(exportHostingState().sessions[0].run_id, 'original')
  const exported = exportHostingState()
  exported.sessions[0].stores.gamestop.cart.push({ pid: 'forged' })
  assert.deepEqual(exportHostingState().sessions[0].stores.gamestop.cart, [])
})

test('hosted checkpoint restores dashboard metadata and an active isolated task without exposing its evidence', async () => {
  async function operator(pathname, body) {
    const response = await fetch(base + pathname, {
      method: 'POST', headers: { ...operatorHeaders, 'content-type': 'application/json' }, body: JSON.stringify(body),
    })
    assert.equal(response.status, 201)
    return response.json()
  }
  const { run } = await operator('/dashboard/api/runs', { name: 'Hosted checkpoint integration' })
  const { attempt } = await operator(`/dashboard/api/runs/${run.id}/attempts`, { agent: 'dots', tags: ['private-hosted-tag'], comments: 'Private hosted annotation' })
  const agent = client(base)
  assert.equal((await agent.get(`/agent/${attempt.token}`)).status, 200)
  const started = await fetch(`${base}/agent/${attempt.token}/start`, {
    method: 'POST', headers: { cookie: [...agent.jar].map(([key, value]) => `${key}=${value}`).join('; '), 'content-type': 'application/json' }, body: '{}',
  })
  assert.equal(started.status, 200)
  assert.deepEqual(await started.json(), { startUrl: '/bestbuy' })
  assert.equal((await agent.post('/bestbuy/cart/add', { pid: '6684968', qty: '1', fulfillment: 'shipping' })).status, 200)
  const saved = await state()
  assert.deepEqual(saved.sessions, [], 'isolated task shoppers never enter the shared demo session map')
  assert.equal(saved.dashboard_runs.length, 1)
  assert.equal(saved.dashboard_runs[0].attempts[0].comments, 'Private hosted annotation')
  assert.equal(saved.dashboard_trials.length, 1)
  const trial = saved.dashboard_trials[0]
  assert.equal(trial.snapshot.sessions.length, 1)
  assert.equal(trial.snapshot.sessions[0].stores.bestbuy.cart.length, 1)
  const publicView = await agent.json(`/agent/${attempt.token}/state`)
  assert.equal(publicView.status, 'running')
  assert.doesNotMatch(JSON.stringify(publicView), /private-hosted-tag|Private hosted annotation|environment_sha256|selected_tasks_sha256|scenario_events/)
  assert.equal((await agent.get('/dashboard/api/runs')).status, 401)
  assert.equal((await agent.get('/api/orders')).status, 401)
  assert.equal((await agent.get('/__hosting/state')).status, 404)

  const invalid = structuredClone(saved)
  invalid.sessions = []
  invalid.dashboard_runs[0].attempts.push(...Array.from({ length: 5 }, () => invalid.dashboard_runs[0].attempts[0]))
  assert.equal((await restore(invalid)).status, 400)
  assert.deepEqual(await state(), saved, 'an invalid dashboard bucket must not replace any checkpoint bucket')

  const cookies = [...agent.jar]
  await stop()
  await start()
  assert.equal((await restore(saved)).status, 200)
  const resumed = client(base)
  for (const [name, value] of cookies) resumed.jar.set(name, value)
  const nextView = await resumed.json(`/agent/${attempt.token}/state`)
  assert.equal(nextView.currentTask.deadline_at, publicView.currentTask.deadline_at)
  assert.equal((await resumed.get('/bestbuy/cart')).status, 200)
  const next = await state()
  assert.equal(next.dashboard_trials[0].snapshot.sessions.length, 1)
  assert.equal(next.dashboard_trials[0].snapshot.sessions[0].id, trial.snapshot.sessions[0].id)
  assert.deepEqual(next.dashboard_trials[0].snapshot.sessions[0].stores.bestbuy.cart, trial.snapshot.sessions[0].stores.bestbuy.cart)
  assert.equal(next.dashboard_runs[0].attempts[0].token, attempt.token)
  assert.equal((await restore({ version: 1, sessions: [], orders: [], accounts: [], dashboard_runs: [], dashboard_trials: [] })).status, 200)
})
