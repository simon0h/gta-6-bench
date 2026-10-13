import test from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import { createDashboardApp } from '../dashboard/server.js'

const operatorToken = 'test-operator-secret-'.repeat(3)
const agentToken = 'A'.repeat(43)
const agentCookie = `bench_attempt=${agentToken}`
const bearer = { authorization: `Bearer ${operatorToken}` }
const agentState = { status: 'ready', completed: 0, total: 30, currentTask: null }

function stubManager(overrides = {}) {
  const attempt = { id: 'attempt-one', token: agentToken, agent: 'muse', comments: 'Private operator note', tags: ['private'] }
  const run = { id: 'run-one', suite: 'original30', attempts: [attempt] }
  return {
    listRuns: async () => [run],
    getRun: async () => run,
    createRun: async () => run,
    addAttempt: async () => attempt,
    updateAttempt: async () => attempt,
    agentView: async token => {
      if (token !== agentToken) throw Object.assign(new Error('Agent URL not found'), { status: 404 })
      return agentState
    },
    startTask: async () => ({ startPath: '/bestbuy' }),
    finishTask: async () => agentState,
    getTarget: async () => null,
    exportState: async () => ({}),
    close: async () => {},
    ...overrides,
  }
}

async function listen(t, handler) {
  const server = http.createServer(handler)
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve) })
  t.after(async () => { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)) })
  return { server, port: server.address().port, base: `http://127.0.0.1:${server.address().port}` }
}

async function dashboard(t, { manager = stubManager(), local = false, trustProxy = false } = {}) {
  const app = await createDashboardApp({ manager, local, apiToken: operatorToken })
  if (trustProxy) app.set('trust proxy', 1)
  return { ...(await listen(t, app)), app }
}

// HTTP request targets must remain byte-for-byte intact for proxy origin tests.
function rawRequest(port, path, headers = {}) {
  return new Promise((resolve, reject) => {
    http.get({ hostname: '127.0.0.1', port, path, headers }, response => {
      let body = ''
      response.setEncoding('utf8')
      response.on('data', chunk => { body += chunk })
      response.on('end', () => resolve({ status: response.statusCode, headers: response.headers, body }))
    }).on('error', reject)
  })
}

test('operator APIs require operator credentials and agent capabilities expose only the task view', async t => {
  const { base } = await dashboard(t)
  for (const headers of [{}, { cookie: agentCookie }, { cookie: 'bench_operator=9999999999999.forged' }, { cookie: 'bench_operator=%ZZ' }]) {
    assert.equal((await fetch(base + '/dashboard/api/runs', { headers })).status, 401)
  }
  assert.equal((await fetch(base + '/dashboard/api/runs', { headers: bearer })).status, 200)
  const portal = await fetch(`${base}/agent/${agentToken}`)
  assert.equal(portal.status, 200)
  assert.match(portal.headers.get('set-cookie'), /bench_attempt=.*HttpOnly; SameSite=Lax; Secure/)
  assert.equal(portal.headers.get('referrer-policy'), 'no-referrer')
  assert.equal(portal.headers.get('cache-control'), 'no-store')
  assert.doesNotMatch(await portal.text(), /Private operator note/)
  const state = await fetch(`${base}/agent/${agentToken}/state`)
  assert.deepEqual(await state.json(), agentState)
  assert.equal((await fetch(`${base}/agent/${'B'.repeat(43)}/state`)).status, 404)
  assert.equal((await fetch(`${base}/agent/too-short/state`)).status, 404)
  assert.equal((await fetch(base + '/bestbuy')).status, 404)
  const root = await fetch(base, { redirect: 'manual' })
  assert.equal(root.status, 302)
  assert.equal(root.headers.get('location'), '/dashboard')
})

test('operator sign-in issues a signed cookie and invalid or cross-site writes do not authenticate', async t => {
  const { base } = await dashboard(t)
  const login = token => fetch(base + '/dashboard/api/login', {
    method: 'POST', headers: { 'content-type': 'application/json', origin: base }, body: JSON.stringify({ token }),
  })
  assert.equal((await login('wrong-token')).status, 401)
  assert.equal((await login({ unexpected: 'object' })).status, 401)
  const result = await login(operatorToken)
  assert.equal(result.status, 200)
  const setCookie = result.headers.get('set-cookie')
  assert.match(setCookie, /HttpOnly; SameSite=Strict; Secure/)
  const cookie = setCookie.split(';')[0]
  assert.equal((await fetch(base + '/dashboard/api/runs', { headers: { cookie } })).status, 200)
  assert.equal((await fetch(base + '/dashboard/api/runs', {
    method: 'POST', headers: { cookie, origin: 'https://unrelated.example', 'content-type': 'application/json' }, body: '{}',
  })).status, 403)
  assert.equal((await fetch(base + '/dashboard/api/runs', {
    method: 'POST', headers: { ...bearer, 'sec-fetch-site': 'cross-site', 'content-type': 'application/json' }, body: '{}',
  })).status, 403)
  assert.equal((await fetch(base + '/dashboard/api/runs', {
    method: 'POST', headers: { ...bearer, 'content-type': 'application/json' }, body: '{broken',
  })).status, 400)
  const logout = await fetch(base + '/dashboard/api/logout', { method: 'POST', headers: { cookie, origin: base } })
  assert.match(logout.headers.get('set-cookie'), /Max-Age=0/)
})

test('trusted hosting proxy preserves the public origin in agent URLs and permits dashboard writes', async t => {
  const { base } = await dashboard(t, { trustProxy: true })
  const publicOrigin = 'https://benchmark.example:8443'
  const headers = { ...bearer, host: 'container', 'x-forwarded-host': 'benchmark.example:8443', 'x-forwarded-proto': 'https' }
  const response = await fetch(base + '/dashboard/api/runs', { headers })
  assert.equal(response.status, 200)
  assert.equal((await response.json()).runs[0].attempts[0].url, `${publicOrigin}/agent/${agentToken}`)
  assert.equal((await fetch(base + '/dashboard/api/runs', {
    method: 'POST', headers: { ...headers, origin: publicOrigin, 'content-type': 'application/json' }, body: '{}',
  })).status, 201)
  assert.equal((await fetch(base + '/dashboard/api/login', {
    method: 'POST', headers: { ...headers, origin: publicOrigin, 'content-type': 'application/json' }, body: JSON.stringify({ token: operatorToken }),
  })).status, 200)
})

test('untrusted forwarded headers cannot alter generated URLs or satisfy the origin guard', async t => {
  const { base } = await dashboard(t)
  const headers = { ...bearer, 'x-forwarded-host': 'attacker.example', 'x-forwarded-proto': 'https' }
  const response = await fetch(base + '/dashboard/api/runs', { headers })
  assert.equal((await response.json()).runs[0].attempts[0].url, `${base}/agent/${agentToken}`)
  assert.equal((await fetch(base + '/dashboard/api/runs', {
    method: 'POST', headers: { ...headers, origin: 'https://attacker.example', 'content-type': 'application/json' }, body: '{}',
  })).status, 403)
})

test('storefront proxy rejects request targets that escape the assigned worker origin', async t => {
  let assignedRequests = 0, otherRequests = 0
  const assigned = await listen(t, (req, res) => { assignedRequests++; res.end('Assigned trial') })
  const other = await listen(t, (req, res) => { otherRequests++; res.end('Other trial') })
  const { port } = await dashboard(t, { manager: stubManager({ getTarget: async () => ({ baseUrl: assigned.base }) }) })
  for (const path of [`//127.0.0.1:${other.port}/private`, `/\\127.0.0.1:${other.port}/private`, `${other.base}/private`]) {
    const response = await rawRequest(port, path, { cookie: agentCookie })
    assert.equal(response.status, 400, path)
  }
  assert.equal(assignedRequests, 0)
  assert.equal(otherRequests, 0)
  const response = await rawRequest(port, '/bestbuy?query=normal', { cookie: agentCookie })
  assert.equal(response.status, 200)
  assert.equal(response.body, 'Assigned trial')
  assert.equal(assignedRequests, 1)
})

test('storefront proxy strips operator and routing credentials before forwarding to a trial', async t => {
  let receivedHeaders
  const assigned = await listen(t, (req, res) => {
    receivedHeaders = req.headers
    res.setHeader('set-cookie', 'trial_example=new-session; Path=/; HttpOnly')
    res.end('Storefront')
  })
  const { base } = await dashboard(t, { manager: stubManager({ getTarget: async () => ({ baseUrl: assigned.base }) }) })
  const response = await fetch(base + '/bestbuy', {
    headers: { ...bearer, cookie: `${agentCookie}; bench_operator=operator-cookie; trial_example=shopper-session`, forwarded: 'host=attacker.example' },
  })
  assert.equal(response.status, 200)
  assert.equal(receivedHeaders.authorization, undefined)
  assert.equal(receivedHeaders.forwarded, undefined)
  assert.equal(receivedHeaders.cookie.trim(), 'trial_example=shopper-session')
  assert.equal(receivedHeaders['x-forwarded-host'], new URL(base).host)
  assert.equal(response.headers.get('set-cookie'), 'trial_example=new-session; Path=/; HttpOnly')
  assert.equal(response.headers.get('cache-control'), 'no-store')
})

test('an unfinished attempt cannot be silently replaced by another agent URL in the same browser', async t => {
  const nextToken = 'B'.repeat(43)
  let previousStatus = 'ready', starts = 0
  const manager = stubManager({
    agentView: async token => ({ ...agentState, status: token === agentToken ? previousStatus : 'ready' }),
    startTask: async () => { starts++; return { startPath: '/bestbuy' } },
  })
  const { base } = await dashboard(t, { manager })
  for (previousStatus of ['ready', 'running']) {
    const portal = await fetch(`${base}/agent/${nextToken}`, { headers: { cookie: agentCookie } })
    assert.equal(portal.status, 409)
    assert.equal(portal.headers.get('set-cookie'), null)
    assert.match(await portal.text(), /separate browser/)
    const start = await fetch(`${base}/agent/${nextToken}/start`, {
      method: 'POST', headers: { cookie: agentCookie, 'content-type': 'application/json' }, body: '{}',
    })
    assert.equal(start.status, 409)
    assert.equal(start.headers.get('set-cookie'), null)
  }
  assert.equal(starts, 0)
  const ownPortal = await fetch(`${base}/agent/${agentToken}`, { headers: { cookie: agentCookie } })
  assert.equal(ownPortal.status, 200)
})

test('a completed or removed attempt allows the browser to claim the next agent URL', async t => {
  const nextToken = 'B'.repeat(43)
  let removed = false
  const manager = stubManager({
    agentView: async token => {
      if (token === agentToken && removed) throw Object.assign(new Error('Agent URL not found'), { status: 404 })
      return { ...agentState, status: token === agentToken ? 'complete' : 'ready' }
    },
  })
  const { base } = await dashboard(t, { manager })
  for (removed of [false, true]) {
    const response = await fetch(`${base}/agent/${nextToken}`, { headers: { cookie: agentCookie } })
    assert.equal(response.status, 200)
    assert.match(response.headers.get('set-cookie'), new RegExp(`^bench_attempt=${nextToken};`))
  }
})

test('a streamed sign-in POST preserves the storefront 401 response without replaying the request', async t => {
  let count = 0, received = '', receivedCookie
  const assigned = await listen(t, async (req, res) => {
    count++
    receivedCookie = req.headers.cookie
    for await (const chunk of req) received += chunk
    res.writeHead(401, { 'content-type': 'text/html' })
    res.end('<body>Incorrect email or password</body>')
  })
  const { base } = await dashboard(t, { manager: stubManager({ getTarget: async () => ({ baseUrl: assigned.base }) }) })
  const response = await fetch(base + '/bestbuy/identity/global/signin', {
    method: 'POST', headers: { cookie: `${agentCookie}; trial_example=shopper-session`, 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ email: 'test@example.test', password: 'incorrect-test-value' }),
  })
  assert.equal(response.status, 401)
  assert.match(await response.text(), /Incorrect email or password/)
  assert.equal(count, 1)
  assert.equal(new URLSearchParams(received).get('password'), 'incorrect-test-value')
  assert.equal(receivedCookie.trim(), 'trial_example=shopper-session')
})
