import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { createRunManager } from '../benchmark/dashboard-manager.js'
import { tasks } from '../benchmark/tasks.js'
import { client } from './helpers.js'
import { createSessionMiddleware, exportSessions, prepareSessionImport, sessionStates } from '../lib/session.js'
import { configureBenchmarkScenario, initializeScenarioStore, scenarioKeepCartOnSignIn,
  exportScenarioState, restoreScenarioState, enterScenarioCart, scenarioAvailability, scenarioEvents } from '../lib/benchmark-scenarios.js'

const environment = { environment_sha256: 'dashboard-test-environment' }
const selected = id => tasks.find(task => task.id === id)
const set = task => ({ original30: [task], all240: [task] })
async function manager(t, options = {}) {
  const instance = await createRunManager({ persist: false, environment, ...options })
  t.after(() => instance.close().catch(error => { if (!/closed/.test(error.message)) throw error }))
  return instance
}
async function attempt(instance) {
  const run = await instance.createRun({ name: 'External agent evaluation' })
  const a = await instance.addAttempt(run.id, { agent: 'muse', tags: ['experiment'], comments: 'private annotation' })
  return { run, a }
}

test('run defaults select the original thirty tasks and backend enforces five unique URLs with repeated agents allowed', async t => {
  const m = await manager(t)
  const run = await m.createRun({ name: 'A' })
  assert.equal(run.suite, 'original30')
  assert.equal(run.task_ids.length, 30)
  const full = await m.createRun({ name: 'Full', suite: 'all240' })
  assert.equal(full.task_ids.length, 240)
  const results = await Promise.allSettled(Array.from({ length: 8 }, () => m.addAttempt(run.id, { agent: 'muse' })))
  assert.equal(results.filter(result => result.status === 'fulfilled').length, 5)
  const detail = await m.getRun(run.id)
  assert.equal(new Set(detail.attempts.map(a => a.token)).size, 5)
  assert.ok(detail.attempts.every(a => a.agent === 'muse' && /^[A-Za-z0-9_-]{43}$/.test(a.token)))
  const first = detail.attempts[0]
  await m.updateAttempt(run.id, first.id, { agent: 'dots', tags: 'one, two, one', comments: 'Operator only' })
  assert.deepEqual((await m.getRun(run.id)).attempts[0].tags, ['one', 'two'])
  assert.deepEqual(await m.agentView(first.token), { status: 'ready', completed: 0, total: 30, currentTask: null })
  await assert.rejects(m.addAttempt(full.id, { agent: 'unknown' }), /Choose grokbot/)
  await assert.rejects(m.agentView('guessed-token'), /not found/)
})

test('a real isolated task exposes no grader API and grades its final response privately', async t => {
  const m = await manager(t, { taskSets: set(selected('bestbuy-budget_decline-ps5')) })
  const { run, a } = await attempt(m)
  const target = await m.startTask(a.token)
  assert.equal(target.startPath, '/bestbuy')
  assert.equal((await fetch(target.baseUrl + '/api/orders')).status, 404)
  assert.equal((await fetch(target.baseUrl + '/gamestop')).status, 404)
  const view = await m.agentView(a.token)
  assert.equal(view.currentTask.index, 1)
  assert.match(view.currentTask.id, /^[a-f0-9]{16}$/)
  for (const forbidden of ['expected', 'family', 'scenario', 'agent', 'tags', 'comments', 'grade']) assert.equal(forbidden in view.currentTask, false)
  const done = await m.finishTask(a.token, { outcome: 'not_purchased', reason: 'budget_exceeded', message: 'The total exceeds the authorized budget.' })
  assert.deepEqual(done, { status: 'complete', completed: 1, total: 1, currentTask: null })
  assert.equal(await m.getTarget(a.token), null)
  const result = (await m.getRun(run.id)).attempts[0].trials[0].result
  assert.equal(result.grade.status, 'passed')
  await assert.rejects(m.finishTask(a.token, { outcome: 'purchased', message: 'Duplicate finish' }), /no running/)
})

test('separate agent URLs isolate account creation and browser state', async t => {
  const m = await manager(t, { taskSets: set(selected('gamestop-payment_decline-ps5')) })
  const { run, a } = await attempt(m)
  const b = await m.addAttempt(run.id, { agent: 'muse' })
  const left = await m.startTask(a.token), right = await m.startTask(b.token)
  assert.notEqual(left.baseUrl, right.baseUrl)
  for (const target of [left, right]) {
    const shopper = client(target.baseUrl)
    const response = await shopper.post('/gamestop/account/create', {
      firstName: 'Isolated', lastName: 'Agent', email: 'same@example.com', password: 'Password123!', confirmPassword: 'Password123!',
    })
    assert.equal(response.status, 200)
  }
  const saved = await m.exportState()
  assert.equal(saved.dashboard_trials.length, 2)
  const ids = saved.dashboard_trials.map(trial => trial.snapshot.sessions[0].id)
  assert.notEqual(ids[0], ids[1])
  assert.ok(saved.dashboard_trials.every(trial => trial.snapshot.sessions.every(session => session.run_id === trial.id)))
})

test('restart resumes the same session and corrected cart without seeding a second mistake', async t => {
  const task = selected('bestbuy-cart_recovery-ps5'), taskSets = set(task)
  const m = await manager(t, { taskSets }), { run, a } = await attempt(m)
  const target = await m.startTask(a.token), shopper = client(target.baseUrl)
  await shopper.get('/bestbuy/cart?run=attacker-supplied')
  assert.equal((await shopper.post('/bestbuy/cart/update', { line: '1', action: 'remove' })).status, 200)
  const saved = await m.exportState()
  const trial = saved.dashboard_trials[0]
  assert.equal(trial.snapshot.sessions[0].run_id, trial.id)
  assert.deepEqual(trial.snapshot.sessions[0].stores.bestbuy.cart, [])
  assert.equal(trial.snapshot.scenario.events.filter(event => event.type === 'cart_seeded').length, 1)
  const cookies = [...shopper.jar]
  await m.close()
  const resumed = await manager(t, { taskSets })
  await resumed.importState(JSON.parse(JSON.stringify(saved)))
  const next = await resumed.getTarget(a.token), restoredShopper = client(next.baseUrl)
  for (const [key, value] of cookies) restoredShopper.jar.set(key, value)
  assert.equal((await restoredShopper.get('/bestbuy/cart?run=another-override')).status, 200)
  const restored = (await resumed.exportState()).dashboard_trials[0]
  assert.equal(restored.snapshot.sessions.length, 1)
  assert.equal(restored.snapshot.sessions[0].id, trial.snapshot.sessions[0].id)
  assert.equal(restored.snapshot.sessions[0].run_id, trial.id)
  assert.deepEqual(restored.snapshot.sessions[0].stores.bestbuy.cart, [])
  assert.equal(restored.snapshot.scenario.events.filter(event => event.type === 'cart_seeded').length, 1)
  assert.equal((await resumed.getRun(run.id)).attempts[0].status, 'running')
})

test('local atomic checkpoints reload and reject changed environment or task definitions when resumed', async t => {
  const directory = await mkdtemp(path.join(tmpdir(), 'dashboard-persistence-'))
  t.after(() => rm(directory, { recursive: true, force: true }))
  const taskSets = set(selected('bestbuy-budget_decline-ps5'))
  const m = await manager(t, { directory, persist: true, taskSets }), { run, a } = await attempt(m)
  await m.startTask(a.token)
  await m.close()
  const changed = await manager(t, { directory, persist: true, taskSets, environment: { environment_sha256: 'changed-source' } })
  assert.equal((await changed.getRun(run.id)).attempts.length, 1)
  await assert.rejects(changed.getTarget(a.token), /environment or task set changed/)
  await changed.close()
  const taskChanged = await manager(t, { directory, persist: true, taskSets: set({ ...taskSets.original30[0], version: 999 }) })
  await assert.rejects(taskChanged.startTask(a.token), /environment or task set changed/)
})

test('a task has no time limit: it stays open and records how long it took', async t => {
  let clock = Date.parse('2026-10-15T12:00:00Z')
  const m = await manager(t, { now: () => clock }), { run, a } = await attempt(m)
  const target = await m.startTask(a.token)
  const view = await m.agentView(a.token)
  assert.equal('deadline_at' in view.currentTask, false)
  assert.equal('timeout_ms' in view.currentTask, false)
  // Hours later the task is still running and its store still answers.
  clock += 5 * 60 * 60 * 1000
  assert.equal((await m.agentView(a.token)).status, 'running')
  assert.notEqual(await m.getTarget(a.token), null)
  assert.equal((await fetch(target.baseUrl + '/bestbuy')).status, 200)
  clock += 1234
  await m.finishTask(a.token, { outcome: 'not_purchased', reason: 'budget_exceeded', message: 'Over budget.' })
  const record = (await m.getRun(run.id)).attempts[0].trials[0]
  assert.equal(record.status, 'completed')
  assert.equal(record.result.elapsed_ms, 5 * 60 * 60 * 1000 + 1234)
  assert.equal('timed_out' in record.result, false)
  assert.equal(record.result.grade.reasons.some(reason => reason.code === 'timed_out'), false)
  assert.equal((await m.getTraversal(run.id, a.id)).tasks[0].elapsed_ms, 5 * 60 * 60 * 1000 + 1234)
})

test('checkpoints saved while tasks had deadlines still load', async t => {
  const m = await manager(t), { run, a } = await attempt(m)
  await m.startTask(a.token)
  const saved = await m.exportState()
  const trial = saved.dashboard_trials[0]
  trial.deadline_at = new Date(Date.parse(trial.started_at) + 60_000).toISOString()
  trial.snapshot.timed_out = false
  const restored = await manager(t)
  await restored.importState(saved)
  assert.equal((await restored.agentView(a.token)).status, 'running')
  await restored.finishTask(a.token, { outcome: 'not_purchased', reason: 'budget_exceeded', message: 'Over budget.' })
  assert.equal((await restored.getRun(run.id)).attempts[0].trials[0].status, 'completed')
})

test('scenario checkpoint reconnects immutable scoped sessions, signed-in membership and availability flags', () => {
  const runId = 'snapshot-unit-run'
  const middleware = createSessionMiddleware({ runId })
  const req = { socket: { localPort: 1234 }, headers: {}, query: {}, path: '/bestbuy' }
  middleware(req, { setHeader() {} }, () => {})
  const state = req.session.stores.bestbuy = { cart: [], checkout: {}, user: null }
  const configuration = { store: 'bestbuy', scenario: { type: 'cart_recovery', product_id: '6684968', alternate_product_id: '6684969' } }
  configureBenchmarkScenario(configuration)
  initializeScenarioStore('bestbuy', state)
  assert.equal(scenarioKeepCartOnSignIn(state), true)
  state.cart = []
  const sessions = exportSessions({ runId }), scenario = exportScenarioState(sessionStates({ runId }))
  configureBenchmarkScenario(configuration)
  prepareSessionImport(JSON.parse(JSON.stringify(sessions)), { runId })()
  restoreScenarioState(JSON.parse(JSON.stringify(scenario)), sessionStates({ runId }))
  const restored = sessionStates({ runId })[0]
  assert.throws(() => { restored.run_id = 'other' }, TypeError)
  initializeScenarioStore('bestbuy', restored.stores.bestbuy)
  assert.deepEqual(restored.stores.bestbuy.cart, [])
  assert.equal(scenarioKeepCartOnSignIn(restored.stores.bestbuy), false)

  const stockConfiguration = { store: 'bestbuy', scenario: { type: 'availability_loss', product_id: '6684968' } }
  configureBenchmarkScenario(stockConfiguration)
  initializeScenarioStore('bestbuy', restored.stores.bestbuy)
  restored.stores.bestbuy.cart = [{ pid: '6684968', qty: 1, fulfillment: 'shipping' }]
  enterScenarioCart(restored.stores.bestbuy)
  const stock = exportScenarioState(sessionStates({ runId }))
  configureBenchmarkScenario(stockConfiguration)
  restoreScenarioState(stock, sessionStates({ runId }))
  assert.equal(scenarioAvailability(restored.stores.bestbuy, '6684968', 'shipping'), false)
  enterScenarioCart(restored.stores.bestbuy)
  assert.equal(scenarioEvents().length, 1)
  assert.throws(() => prepareSessionImport([{ ...sessions[0], run_id: 'other' }], { runId }), /escaped/)
  configureBenchmarkScenario()
})
