import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { createRunManager } from '../benchmark/dashboard-manager.js'
import { createDashboardApp } from '../dashboard/server.js'
import { buildCustomTask, cheapestTotal, normalizeCustomTask } from '../benchmark/custom-tasks.js'
import { getTask, publicTask } from '../benchmark/tasks.js'
import { gradeTask } from '../benchmark/grader.js'

const environment = { environment_sha256: 'custom-task-test-environment' }
const fields = (overrides = {}) => ({
  name: 'Two copies to Denver', store: 'bestbuy', platform: 'xbox', edition: 'standard', quantity: 2, max_total: 200,
  customer: { first_name: 'Riley', last_name: 'Nguyen', email: 'Riley.Nguyen@example.com', phone: '(202) 555-0199' },
  shipping_address: { line1: '55 Oak Lane', line2: 'Suite 210', city: 'Denver', state: 'co', postal_code: '80202' },
  ...overrides,
})
async function manager(t, options = {}) {
  const instance = await createRunManager({ persist: false, environment, ...options })
  t.after(() => instance.close().catch(error => { if (!/closed/.test(error.message)) throw error }))
  return instance
}
function orderFor(task) {
  const request = task.request, subtotal = Math.round(task.expected.unit_price * request.quantity * 100) / 100
  const shipping = task.store === 'game-uk' ? 4.99 : 0, total = task.expected.minimum_total
  return {
    id: 'order-1', store: task.store, order_number: 'EXAMPLE-1',
    items: [{ kind: 'game', sku: task.expected.sku, platform: request.platform, edition: request.edition, format: request.format, qty: request.quantity, unit_price: task.expected.unit_price }],
    customer: structuredClone(request.customer), shipping_address: structuredClone(request.shipping_address),
    fulfillment: { method: 'ship' }, payment: { method: 'card', last4: '4242' }, currency: request.currency,
    totals: { subtotal, shipping, tax: Math.round((total - subtotal - shipping) * 100) / 100, total }, meta: {},
  }
}

test('the right answer comes from store prices, matching the built-in tasks', () => {
  for (const id of ['bestbuy-purchase-ps5', 'bestbuy-quantity-xbox', 'game-uk-quantity-ps5', 'rockstar-store-address_detail-xbox', 'bestbuy-budget_decline-ps5', 'game-uk-unsupported_variant-xbox']) {
    const original = getTask(id), request = original.request
    const custom = buildCustomTask({ id: 'custom-abcdef123456', version: 1, name: id, store: original.store, platform: request.platform, edition: request.edition,
      quantity: request.quantity, max_total: request.max_total, customer: request.customer,
      shipping_address: { ...request.shipping_address, country: undefined } })
    assert.deepEqual(custom.expected, original.expected, id)
    assert.deepEqual(custom.request, request, id)
    assert.equal(custom.instruction, original.instruction, id)
  }
  assert.equal(cheapestTotal('bestbuy', 3), 265.77)
  assert.equal(cheapestTotal('game-uk', 1), 74.98)
})

test('a custom task is graded like a built-in one and keeps its expectations out of the agent view', () => {
  const task = buildCustomTask({ id: 'custom-abcdef123456', version: 1, ...fields() })
  assert.equal(task.request.customer.email, 'riley.nguyen@example.com')
  assert.equal(task.request.shipping_address.state, 'CO')
  assert.equal(task.request.shipping_address.country, 'US')
  assert.equal(task.expected.outcome, 'purchased')
  assert.equal(task.expected.minimum_total, 177.18)
  const purchased = { outcome: 'purchased', message: 'Bought two copies.' }
  assert.equal(gradeTask(task, { orders: [orderFor(task)], finalResponse: purchased }).status, 'passed')
  const wrongStreet = orderFor(task); wrongStreet.shipping_address.line2 = null
  assert.ok(gradeTask(task, { orders: [wrongStreet], finalResponse: purchased }).reasons.some(reason => reason.code === 'wrong_address'))
  const view = publicTask(task)
  assert.deepEqual(Object.keys(view).sort(), ['id', 'instruction', 'request', 'store', 'version'])
  assert.ok(!JSON.stringify(view).includes('custom-abcdef123456'))
  const short = buildCustomTask({ id: 'custom-abcdef123457', version: 1, ...fields({ max_total: 177.17 }) })
  assert.deepEqual(short.expected, { outcome: 'not_purchased', reason: 'budget_exceeded', minimum_total: 177.18 })
  const ultimate = buildCustomTask({ id: 'custom-abcdef123458', version: 1, ...fields({ edition: 'ultimate', max_total: 10 }) })
  assert.deepEqual(ultimate.expected, { outcome: 'not_purchased', reason: 'unsupported_variant' })
  const own = buildCustomTask({ id: 'custom-abcdef123459', version: 1, ...fields({ instruction: '  Buy two Xbox copies for Riley.  ' }) })
  assert.equal(own.instruction, 'Buy two Xbox copies for Riley.')
})

test('the form only accepts what the store checkout accepts', () => {
  const rejects = [
    [{ store: 'walmart' }, /Best Buy, GAME or Rockstar/], [{ quantity: 4 }, /1 to 3/], [{ store: 'rockstar-store', quantity: 2 }, /1 to 1/],
    [{ max_total: 0 }, /spending limit/], [{ max_total: 10.001 }, /two decimal/], [{ shipping_address: { ...fields().shipping_address, postal_code: '8020' } }, /ZIP code/],
    [{ shipping_address: { ...fields().shipping_address, state: 'Colorado' } }, /US state/], [{ customer: { ...fields().customer, phone: '555' } }, /10-digit/],
    [{ customer: { ...fields().customer, email: 'riley' } }, /email/], [{ name: ' ' }, /task name/i],
    [{ store: 'game-uk', customer: { ...fields().customer, phone: '07700900142' } }, /postcode/i],
  ]
  for (const [overrides, message] of rejects) assert.throws(() => normalizeCustomTask(fields(overrides)), message, JSON.stringify(overrides))
  const uk = normalizeCustomTask(fields({ store: 'game-uk', customer: { ...fields().customer, phone: '07700900142' }, shipping_address: { line1: '7 Market Street', city: 'Manchester', state: '', postal_code: 'm1 1ae' } }))
  assert.equal(uk.shipping_address.postal_code, 'M1 1AE')
  assert.equal(uk.shipping_address.state, '')
})

test('saved tasks survive a restart, and runs keep their own copy after edits and deletes', async t => {
  const directory = await mkdtemp(path.join(tmpdir(), 'custom-tasks-'))
  t.after(() => rm(directory, { recursive: true, force: true }))
  const first = await createRunManager({ directory, environment })
  const buy = await first.createTask(fields())
  const refuse = await first.createTask(fields({ name: 'One cent short', max_total: 177.17 }))
  assert.equal(buy.preview.answer.outcome, 'purchased')
  assert.equal(refuse.preview.answer.reason, 'budget_exceeded')
  const run = await first.createRun({ name: 'Mine', suite: 'custom', task_ids: [refuse.id, buy.id] })
  assert.deepEqual(run.task_ids, [refuse.id, buy.id])
  await assert.rejects(first.createRun({ suite: 'custom', task_ids: [] }), /at least one/)
  await assert.rejects(first.createRun({ suite: 'custom', task_ids: [buy.id, buy.id] }), /only once/)
  await assert.rejects(first.createRun({ suite: 'custom', task_ids: ['custom-000000000000'] }), /no longer exists/)
  const edited = await first.updateTask(buy.id, fields({ quantity: 1 }))
  assert.equal(edited.version, 2)
  await first.deleteTask(refuse.id)
  await first.close()

  const second = await createRunManager({ directory, environment })
  t.after(() => second.close())
  const { tasks, stores } = await second.listTasks()
  assert.deepEqual(tasks.map(task => [task.id, task.version, task.quantity]), [[buy.id, 2, 1]])
  assert.deepEqual(stores.map(store => store.store), ['bestbuy', 'game-uk', 'rockstar-store'])
  const saved = await second.getRun(run.id)
  assert.equal(saved.suite, 'custom')
  assert.equal(saved.tasks[1].request.quantity, 2)
  assert.equal(saved.tasks[0].name, 'One cent short')
  await second.addAttempt(run.id, { agent: 'dots' })
})

test('an agent runs a custom task end to end and the run page explains the grade', async t => {
  const m = await manager(t)
  const refuse = await m.createTask(fields({ name: 'One cent short', max_total: 177.17 }))
  const buy = await m.createTask(fields())
  const run = await m.createRun({ name: 'Mine', suite: 'custom', task_ids: [refuse.id, buy.id] })
  const attempt = await m.addAttempt(run.id, { agent: 'muse' })
  const target = await m.startTask(attempt.token)
  assert.match(target.startPath, /^\/bestbuy/)
  const view = await m.agentView(attempt.token)
  assert.equal(view.total, 2)
  assert.equal(view.currentTask.instruction, refuse.preview.instruction)
  assert.equal(view.currentTask.request.max_total, 177.17)
  assert.ok(!JSON.stringify(view).includes('budget_exceeded","minimum_total'))
  await m.finishTask(attempt.token, { outcome: 'not_purchased', reason: 'budget_exceeded', message: 'Total is USD 177.18, over the limit.' })
  await m.startTask(attempt.token)
  await m.finishTask(attempt.token, { outcome: 'not_purchased', reason: 'budget_exceeded', message: 'Gave up.' })
  const detail = await m.getRun(run.id)
  const [first, second] = detail.attempts[0].trials.map(trial => trial.result)
  assert.equal(first.grade.status, 'passed')
  assert.equal(second.grade.status, 'failed')
  assert.ok(second.grade.reasons.some(reason => reason.code === 'missing_order'))
  assert.match(second.expected_output[0], /^Buy: 2 × Grand Theft Auto VI Standard Edition, Xbox Series X\|S/)
  assert.ok(second.failure_reasons.length)
  const live = await m.getLive(run.id)
  assert.equal(live.agents[0].last.store, 'bestbuy')
})

test('the task endpoints need the operator sign-in and report form problems plainly', async t => {
  const token = 'custom-task-http-operator-token-0000000000'
  const m = await manager(t)
  const app = await createDashboardApp({ local: false, apiToken: token, manager: m })
  const server = await new Promise(resolve => { const result = app.listen(0, '127.0.0.1', () => resolve(result)) })
  t.after(() => new Promise(resolve => { server.closeAllConnections(); server.close(resolve) }))
  const base = `http://127.0.0.1:${server.address().port}/dashboard/api`
  const call = (pathname, { method = 'GET', body, auth = true } = {}) => fetch(base + pathname, { method,
    headers: { ...(auth ? { authorization: `Bearer ${token}` } : {}), ...(body ? { 'content-type': 'application/json' } : {}) }, body: body && JSON.stringify(body) })
  assert.equal((await call('/tasks', { auth: false })).status, 401)
  assert.equal((await call('/tasks', { method: 'POST', body: fields(), auth: false })).status, 401)
  const preview = await (await call('/tasks/preview', { method: 'POST', body: fields() })).json()
  assert.equal(preview.cheapest_total, 177.18)
  assert.equal(preview.answer.outcome, 'purchased')
  const bad = await call('/tasks/preview', { method: 'POST', body: fields({ quantity: 9 }) })
  assert.equal(bad.status, 400)
  assert.match((await bad.json()).error, /1 to 3/)
  const created = await call('/tasks', { method: 'POST', body: fields() })
  assert.equal(created.status, 201)
  const { task } = await created.json()
  assert.equal((await (await call(`/tasks/${task.id}`, { method: 'PUT', body: fields({ name: 'Renamed' }) })).json()).task.name, 'Renamed')
  const run = await call('/runs', { method: 'POST', body: { name: 'Custom', suite: 'custom', task_ids: [task.id] } })
  assert.equal(run.status, 201)
  assert.equal((await run.json()).run.task_count, 1)
  assert.equal((await call(`/tasks/${task.id}`, { method: 'DELETE' })).status, 200)
  assert.equal((await call(`/tasks/${task.id}`, { method: 'DELETE' })).status, 404)
})
