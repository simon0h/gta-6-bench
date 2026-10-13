import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { request as httpRequest } from 'node:http'
import path from 'node:path'
import { startEnvironment, BENCHMARK_DATE } from '../benchmark/environment.js'

const task = { id: 'environment-contract', version: '1', store: 'gamestop' }
const address = { firstName: 'Alex', lastName: 'Tester', address1: '123 Ocean Dr', city: 'Miami', stateCode: 'FL', postalCode: '33139', phone: '3055550123' }

async function temporaryDirectory(t) {
  const directory = await mkdtemp(path.join(tmpdir(), 'gta-benchmark-environment-'))
  t.after(() => rm(directory, { recursive: true, force: true }))
  return directory
}

async function environment(t, options = {}) {
  const directory = options.directory || await temporaryDirectory(t)
  const env = await startEnvironment({ task, directory, ...options })
  t.after(() => env.close())
  return env
}

function shopper(baseUrl) {
  const cookies = new Map()
  return async function request(method, pathname, body, { follow = true } = {}) {
    let url = new URL(baseUrl + pathname)
    let payload = body === undefined ? undefined : new URLSearchParams(body).toString()
    for (let redirects = 0; redirects < 10; redirects++) {
      assert.equal(url.origin, new URL(baseUrl).origin, 'test shopper must stay within its environment')
      const response = await fetch(url, {
        method, redirect: 'manual', signal: AbortSignal.timeout(10_000), body: payload,
        headers: { cookie: [...cookies].map(([name, value]) => `${name}=${value}`).join('; '), ...(payload === undefined ? {} : { 'content-type': 'application/x-www-form-urlencoded' }) },
      })
      for (const cookie of response.headers.getSetCookie()) {
        const pair = cookie.split(';')[0], separator = pair.indexOf('=')
        cookies.set(pair.slice(0, separator), pair.slice(separator + 1))
      }
      const text = await response.text()
      if (follow && response.status >= 300 && response.status < 400 && response.headers.has('location')) {
        url = new URL(response.headers.get('location'), url)
        method = 'GET'; payload = undefined
      } else return { status: response.status, text, headers: response.headers, url: url.href }
    }
    throw new Error('Too many storefront redirects')
  }
}

async function buyGame(request, { email = 'alex@example.com', tag = '' } = {}) {
  assert.equal((await request('POST', `/gamestop/cart/add${tag}`, { pid: '448295' })).status, 200)
  assert.equal((await request('POST', `/gamestop/checkout/start${tag}`, {})).status, 200)
  assert.equal((await request('POST', `/gamestop/mrt/checkout/contact${tag}`, { email, customerName: 'Alex Tester', c_phone: address.phone })).status, 200)
  const result = await request('POST', `/gamestop/checkout/${tag}`, {
    email, ...address, shippingMethod: 'premium', paymentMethod: 'card', cardNumber: '4242424242424242',
    expirationMonthYear: '12/29', securityCode: '123', billingSame: '1',
  })
  assert.equal(result.status, 200)
  assert.match(result.text, /Thank you for your order!/)
  return result
}

test('benchmark HTTP exposes only the chosen storefront, with no grading API or index', async t => {
  const env = await environment(t), request = shopper(env.baseUrl)
  const root = await request('GET', '/?run=override', undefined, { follow: false })
  assert.equal(root.status, 302)
  assert.equal(root.headers.get('location'), '/gamestop')
  const home = await request('GET', '/')
  assert.equal(home.status, 200)
  assert.doesNotMatch(home.text, /\/api\/(?:stores|catalog|orders|captcha|health)|GTA 6 pre-order benchmark: synthetic stores/)
  for (const endpoint of ['/api/health', '/api/stores', '/api/catalog', '/api/captcha', '/api/orders', '/api/orders/some-id']) {
    for (const method of ['GET', 'DELETE']) {
      const response = await request(method, `${endpoint}?run=override&store=amazon`, undefined, { follow: false })
      assert.equal(response.status, 404, `${method} ${endpoint} must not expose evaluator access`)
    }
  }
  for (const endpoint of ['/API/ORDERS/', '/%61pi/orders', '//api/orders', '/gamestop/../api/orders', '/gamestop/%2e%2e/api/orders', '/gamestop%2f../api/orders', '/amazon', '/amazon/cart/add']) {
    const response = await request('GET', endpoint, undefined, { follow: false })
    assert.equal(response.status, 404, `${endpoint} must not bypass the storefront boundary`)
  }
  assert.equal((await request('POST', '/amazon/cart/add', { asin: 'B0GTA6PS5S' })).status, 404)
  assert.deepEqual((await env.snapshot()).orders, [])
})

test('successful checkout retains the assigned run and evidence despite public API tampering', async t => {
  const env = await environment(t, { runId: 'immutable-worker-run', metadata: { suite_version: '1', environment_revision: 'test-revision' } })
  const request = shopper(env.baseUrl)
  await request('GET', '/gamestop?run=before-checkout')
  await buyGame(request, { tag: '?run=retag-at-checkout' })
  const first = await env.snapshot()
  assert.deepEqual(first.errors, [])
  assert.equal(first.orders.length, 1)
  const order = first.orders[0]
  assert.equal(order.run_id, 'immutable-worker-run')
  assert.equal(order.benchmark.run_id, env.runId)
  assert.equal(order.benchmark.task_id, task.id)
  assert.equal(order.benchmark.task_version, task.version)
  assert.equal(order.benchmark.catalog_mode, 'reference')
  assert.equal(order.benchmark.benchmark_date, BENCHMARK_DATE)
  assert.equal(order.benchmark.environment_revision, 'test-revision')
  assert.equal(order.items[0].platform, 'ps5')
  assert.equal(order.items[0].qty, 1)
  assert.equal(order.payment.last4, '4242')
  assert.doesNotMatch(JSON.stringify(order), /4242424242424242/)
  assert.equal((await request('DELETE', '/api/orders?run=immutable-worker-run')).status, 404)
  assert.equal((await request('GET', `/api/orders/${order.id}`)).status, 404)
  assert.deepEqual((await env.snapshot()).orders, first.orders)
})

test('parallel workers isolate repeated account registration and recorded purchases', async t => {
  const root = await temporaryDirectory(t)
  const results = await Promise.allSettled([
    environment(t, { directory: path.join(root, 'left'), runId: 'left-run' }),
    environment(t, { directory: path.join(root, 'right'), runId: 'right-run' }),
  ])
  for (const result of results) assert.equal(result.status, 'fulfilled', result.reason?.message)
  const [left, right] = results.map(result => result.value)
  const a = shopper(left.baseUrl), b = shopper(right.baseUrl)
  const account = { email: 'same-address@example.com', firstName: 'Alex', lastName: 'Tester', password: 'Isolated123!', confirmPassword: 'Isolated123!' }
  for (const request of [a, b]) {
    const signup = await request('POST', '/gamestop/account/create', account)
    assert.equal(signup.status, 200)
    assert.doesNotMatch(signup.text, /An account with this email already exists/)
    assert.match(signup.url, /\/gamestop\/account\/$/)
  }
  const duplicate = await a('POST', '/gamestop/account/create', account)
  assert.equal(duplicate.status, 400, 'registration must actually persist inside its own worker')
  assert.match(duplicate.text, /An account with this email already exists/)
  await buyGame(a, { email: account.email })
  const [leftBefore, rightBefore] = await Promise.all([left.snapshot(), right.snapshot()])
  assert.equal(leftBefore.orders.length, 1)
  assert.equal(leftBefore.orders[0].run_id, 'left-run')
  assert.deepEqual(rightBefore.orders, [])
  await buyGame(b, { email: account.email })
  const [leftAfter, rightAfter] = await Promise.all([left.snapshot(), right.snapshot()])
  assert.deepEqual(leftAfter.orders, leftBefore.orders)
  assert.equal(rightAfter.orders.length, 1)
  assert.equal(rightAfter.orders[0].run_id, 'right-run')
  assert.notEqual(leftAfter.orders[0].session_id, rightAfter.orders[0].session_id)
})

test('finishing a run prevents further storefront requests and order changes', async t => {
  const env = await environment(t), request = shopper(env.baseUrl)
  await buyGame(request)
  const finished = await env.snapshot(true)
  assert.equal(finished.orders.length, 1)
  assert.equal((await request('POST', '/gamestop/cart/add?run=new-run', { pid: '448295' })).status, 409)
  assert.equal((await request('POST', '/gamestop/checkout/', { ...address })).status, 409)
  assert.equal((await request('GET', '/gamestop/logout')).status, 409)
  assert.deepEqual((await env.snapshot()).orders, finished.orders)
})

test('finish also blocks a request already waiting for its form body', async t => {
  const env = await environment(t)
  const body = 'pid=448295'
  let completeResponse, failResponse, allowBody, failContinue
  const response = new Promise((resolve, reject) => { completeResponse = resolve; failResponse = reject })
  const continued = new Promise((resolve, reject) => { allowBody = resolve; failContinue = reject })
  const upload = httpRequest(env.baseUrl + '/gamestop/cart/add', {
    method: 'POST', headers: { Expect: '100-continue', 'content-type': 'application/x-www-form-urlencoded', 'content-length': Buffer.byteLength(body) },
  }, res => {
    res.resume()
    res.on('end', () => completeResponse(res.statusCode))
    res.on('error', failResponse)
  })
  t.after(() => upload.destroy())
  upload.on('continue', allowBody)
  upload.on('error', error => { failResponse(error); failContinue(error) })
  upload.setTimeout(10_000, () => upload.destroy(new Error('Delayed form upload timed out')))
  upload.flushHeaders()
  // Node emits the request handler synchronously after sending 100 Continue.
  // The public gate has run, but the form parser is still awaiting this body.
  await continued
  const finished = await env.snapshot(true)
  upload.end(body)
  assert.equal(await response, 409)
  assert.deepEqual((await env.snapshot()).orders, finished.orders)
})

test('a missing required store fails startup instead of creating an incomplete environment', async t => {
  const directory = await temporaryDirectory(t)
  await assert.rejects(startEnvironment({ task: { ...task, store: 'missing-store' }, directory }), /Required benchmark store is missing: missing-store/)
})

test('a run directory cannot be reused while active or after close', async t => {
  const directory = await temporaryDirectory(t)
  const env = await environment(t, { directory })
  await buyGame(shopper(env.baseUrl))
  const evidenceFile = path.join(directory, 'orders.json')
  const evidence = await readFile(evidenceFile, 'utf8')
  await assert.rejects(startEnvironment({ task, directory }), /EEXIST|already exists|already used/i)
  assert.equal(await readFile(evidenceFile, 'utf8'), evidence)
  await env.close()
  await assert.rejects(startEnvironment({ task, directory }), /EEXIST|already exists|already used/i)
  assert.equal(await readFile(evidenceFile, 'utf8'), evidence)
})
