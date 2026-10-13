import test from 'node:test'
import assert from 'node:assert/strict'
import { createDashboardApp } from '../dashboard/server.js'
import { createRunManager } from '../benchmark/dashboard-manager.js'
import { tasks } from '../benchmark/tasks.js'

const operatorToken = 'dashboard-http-integration-operator-token'
const operatorHeaders = { authorization: `Bearer ${operatorToken}` }
const budgetTask = tasks.find(task => task.id === 'bestbuy-budget_decline-ps5')
const taskSets = { original30: [budgetTask], all240: [budgetTask] }
const environment = { environment_sha256: 'dashboard-http-test-source' }

function browser(base, initial = []) {
  const jar = new Map(initial)
  async function request(pathname, { method = 'GET', json, form, headers = {} } = {}) {
    const requestHeaders = { cookie: [...jar].map(([key, value]) => `${key}=${value}`).join('; '), ...headers }
    let body
    if (json !== undefined) { requestHeaders['content-type'] = 'application/json'; body = JSON.stringify(json) }
    if (form !== undefined) { requestHeaders['content-type'] = 'application/x-www-form-urlencoded'; body = new URLSearchParams(form).toString() }
    const response = await fetch(base + pathname, { method, headers: requestHeaders, body, redirect: 'manual' })
    for (const cookie of response.headers.getSetCookie()) {
      const pair = cookie.split(';')[0], index = pair.indexOf('=')
      jar.set(pair.slice(0, index), pair.slice(index + 1))
    }
    const text = await response.text()
    return { status: response.status, headers: response.headers, text, body: response.headers.get('content-type')?.includes('application/json') ? JSON.parse(text) : null }
  }
  return { jar, request }
}

async function server(t, snapshot) {
  const manager = await createRunManager({ persist: false, environment, taskSets })
  if (snapshot) await manager.importState(snapshot)
  const app = await createDashboardApp({ local: false, apiToken: operatorToken, manager })
  const listener = await new Promise((resolve, reject) => {
    const result = app.listen(0, '127.0.0.1', error => error ? reject(error) : resolve(result))
    result.once('error', reject)
  })
  let stopped = false
  const close = async () => {
    if (stopped) return
    stopped = true
    listener.closeAllConnections()
    await new Promise(resolve => listener.close(resolve))
    await manager.close()
  }
  t.after(close)
  return { manager, base: `http://127.0.0.1:${listener.address().port}`, close }
}

async function createRun(operator, name = 'HTTP benchmark') {
  const created = await operator.request('/dashboard/api/runs', { method: 'POST', json: { name }, headers: operatorHeaders })
  assert.equal(created.status, 201)
  return created.body.run
}

async function addAttempt(operator, run, values = {}) {
  const created = await operator.request(`/dashboard/api/runs/${run.id}/attempts`, {
    method: 'POST', json: { agent: 'muse', tags: ['private-tag'], comments: 'private-comment', ...values }, headers: operatorHeaders,
  })
  assert.equal(created.status, 201)
  return created.body.attempt
}

test('HTTP dashboard creates and edits attempts; agent portal starts, proxies, and privately grades an isolated task', async t => {
  const host = await server(t), operator = browser(host.base), agent = browser(host.base)
  const run = await createRun(operator)
  assert.equal(run.suite, 'original30')
  assert.equal(run.task_count, 1)
  const attempt = await addAttempt(operator, run)
  assert.equal(new URL(attempt.url).pathname, `/agent/${attempt.token}`)
  const updated = await operator.request(`/dashboard/api/runs/${run.id}/attempts/${attempt.id}`, {
    method: 'PATCH', headers: operatorHeaders, json: { agent: 'dots', tags: ['comparison'], comments: 'updated private note' },
  })
  assert.equal(updated.status, 200)
  assert.equal(updated.body.attempt.agent, 'dots')
  assert.deepEqual(updated.body.attempt.tags, ['comparison'])
  const listing = await operator.request('/dashboard/api/runs', { headers: operatorHeaders })
  assert.equal(listing.status, 200)
  assert.equal(listing.body.runs[0].attempts[0].comments, 'updated private note')

  const portal = await agent.request(`/agent/${attempt.token}`)
  assert.equal(portal.status, 200)
  assert.match(portal.text, /Start task/)
  assert.doesNotMatch(portal.text, /updated private note|comparison/)
  const ready = await agent.request(`/agent/${attempt.token}/state`)
  assert.deepEqual(ready.body, { status: 'ready', completed: 0, total: 1, currentTask: null })
  assert.equal((await agent.request('/dashboard/api/runs')).status, 401)
  assert.equal((await agent.request(`/dashboard/api/runs/${run.id}`)).status, 401)

  const start = await agent.request(`/agent/${attempt.token}/start`, { method: 'POST', json: {} })
  assert.equal(start.status, 200)
  assert.deepEqual(start.body, { startUrl: '/bestbuy' })
  const running = (await agent.request(`/agent/${attempt.token}/state`)).body
  assert.equal(running.status, 'running')
  assert.equal(running.currentTask.instruction, budgetTask.instruction)
  assert.deepEqual(running.currentTask.request, budgetTask.request)
  assert.match(running.currentTask.id, /^[a-f0-9]{16}$/)
  for (const forbidden of ['grade', 'expected', 'scenario', 'family', 'agent', 'tags', 'comments']) assert.equal(forbidden in running.currentTask, false)

  const storefront = await agent.request('/bestbuy')
  assert.equal(storefront.status, 200)
  assert.match(storefront.text, /Best Buy/)
  assert.match(storefront.text, /Task &amp; submit result/)
  assert.equal((await agent.request('/api/orders')).status, 404)
  assert.equal((await agent.request('/api/catalog')).status, 404)
  assert.equal((await agent.request('/gamestop')).status, 404)
  assert.equal((await agent.request('/__hosting/state')).status, 404)

  const finished = await agent.request(`/agent/${attempt.token}/finish`, { method: 'POST', json: {
    outcome: 'not_purchased', reason: 'budget_exceeded', message: 'The full price is above the authorized budget.',
  } })
  assert.equal(finished.status, 200)
  assert.deepEqual(finished.body, { status: 'complete', completed: 1, total: 1, currentTask: null })
  const detail = (await operator.request(`/dashboard/api/runs/${run.id}`, { headers: operatorHeaders })).body.run
  assert.equal(detail.attempts[0].trials[0].result.grade.status, 'passed')
  assert.equal(detail.attempts[0].summary.passed, 1)
  assert.equal((await agent.request('/bestbuy')).status, 409)
})

test('HTTP backend caps a run at five links and protects browser assignment and cross-origin actions', async t => {
  const host = await server(t), operator = browser(host.base)
  const run = await createRun(operator), attempts = []
  for (let index = 0; index < 5; index++) attempts.push(await addAttempt(operator, run, { agent: 'grokbot' }))
  const sixth = await operator.request(`/dashboard/api/runs/${run.id}/attempts`, { method: 'POST', headers: operatorHeaders, json: { agent: 'grokbot' } })
  assert.equal(sixth.status, 409)
  assert.match(sixth.body.error, /five/)
  assert.equal(new Set(attempts.map(attempt => attempt.url)).size, 5)
  const agent = browser(host.base)
  assert.equal((await agent.request(`/agent/${attempts[0].token}`)).status, 200)
  const switching = await agent.request(`/agent/${attempts[1].token}`)
  assert.equal(switching.status, 409)
  assert.match(switching.text, /separate browser/)
  const separate = browser(host.base)
  assert.equal((await separate.request(`/agent/${attempts[1].token}`)).status, 200)
  const crossSite = await agent.request(`/agent/${attempts[0].token}/start`, { method: 'POST', json: {}, headers: { origin: 'https://unrelated.example', 'sec-fetch-site': 'cross-site' } })
  assert.equal(crossSite.status, 403)
  const illegalOperatorAction = await operator.request('/dashboard/api/runs', { method: 'POST', headers: { ...operatorHeaders, origin: 'https://unrelated.example' }, json: { name: 'Cross-site' } })
  assert.equal(illegalOperatorAction.status, 403)
})

test('HTTP checkpoint restart retains the active deadline, routing cookie and shopper cart', async t => {
  const host = await server(t), operator = browser(host.base), agent = browser(host.base)
  const run = await createRun(operator), attempt = await addAttempt(operator, run)
  await agent.request(`/agent/${attempt.token}`)
  assert.equal((await agent.request(`/agent/${attempt.token}/start`, { method: 'POST', json: {} })).status, 200)
  const before = (await agent.request(`/agent/${attempt.token}/state`)).body
  const added = await agent.request('/bestbuy/cart/add?run=untrusted-tag', { method: 'POST', form: { pid: '6684968', qty: '1', fulfillment: 'shipping' } })
  assert.equal(added.status, 302)
  assert.equal(added.headers.get('location'), '/bestbuy/cart')
  assert.equal((await agent.request('/bestbuy/cart')).status, 200)
  const state = await host.manager.exportState(), cookies = [...agent.jar]
  const trial = state.dashboard_trials[0]
  assert.equal(trial.snapshot.sessions.length, 1)
  assert.equal(trial.snapshot.sessions[0].stores.bestbuy.cart.length, 1)
  assert.equal(trial.snapshot.sessions[0].run_id, trial.id)
  await host.close()

  const replacement = await server(t, JSON.parse(JSON.stringify(state))), restored = browser(replacement.base, cookies)
  const after = (await restored.request(`/agent/${attempt.token}/state`)).body
  assert.equal(after.currentTask.deadline_at, before.currentTask.deadline_at)
  assert.equal(after.currentTask.id, before.currentTask.id)
  const cart = await restored.request('/bestbuy/cart')
  assert.equal(cart.status, 200)
  assert.match(cart.text, /Grand Theft Auto VI/)
  const next = (await replacement.manager.exportState()).dashboard_trials[0]
  assert.equal(next.snapshot.sessions.length, 1)
  assert.equal(next.snapshot.sessions[0].id, trial.snapshot.sessions[0].id)
  assert.deepEqual(next.snapshot.sessions[0].stores.bestbuy.cart, trial.snapshot.sessions[0].stores.bestbuy.cart)
  assert.equal((await restored.request('/api/orders')).status, 404)
})
