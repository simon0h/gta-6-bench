import test from 'node:test'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import http from 'node:http'
import { createRunManager } from '../benchmark/dashboard-manager.js'
import { createDashboardApp } from '../dashboard/server.js'
import { tasks } from '../benchmark/tasks.js'
import { LIVE_TRAIL, pageKind, updateLivePosition, validLivePosition } from '../benchmark/live.js'

const task = tasks.find(task => task.id === 'bestbuy-budget_decline-ps5'), second = tasks.find(task => task.id === 'bestbuy-purchase-ps5')
const options = { persist: false, environment: { environment_sha256: 'live-test-source' }, taskSets: { original30: [task, second], all240: [task] } }
const factory = async ({ trial }) => ({
  target: { baseUrl: 'http://127.0.0.1:1', startPath: '/bestbuy' },
  snapshot: async () => ({ version: 1, run_id: trial.id, orders: [], errors: [], sessions: [], request_count: 0 }), close: async () => {},
})
async function manager(t, extra = {}) {
  const m = await createRunManager({ ...options, workerFactory: factory, ...extra })
  t.after(() => m.close())
  return m
}
async function setup(m) {
  const run = await m.createRun({ name: 'Live' }), attempt = await m.addAttempt(run.id, { agent: 'dots' })
  await m.startTask(attempt.token)
  const { trialId } = await m.getTarget(attempt.token)
  return { run, attempt, trialId }
}
const visit = (m, a, trialId, path, extra = {}) => m.recordRequest(a.token, trialId, { path, method: 'GET', status: 200, html: true, page_id: randomUUID(), duration_ms: 3, ...extra })
const events = (m, a, trialId, pageId, rows) => m.recordBrowserEvents(a.token, { trial_id: trialId, page_id: pageId, events: rows })

test('page kinds follow the store routes an agent passes through', () => {
  const cases = {
    '/bestbuy': 'home', '/walmart/': 'home', '/bestbuy/site/searchpage.jsp': 'search', '/amazon/s': 'search', '/target/search': 'search',
    '/xbox-store/en-US/search/results': 'search', '/amazon/dp/B0ABC': 'product', '/amazon/grand-theft-auto/dp/B0ABC': 'product',
    '/walmart/ip/123': 'product', '/target/p/gta/-/A-123': 'product', '/xbox-store/en-US/games/store/gta-vi/9ABC': 'product',
    '/gamestop/video-games/playstation-5/products/gta/12345.html': 'product', '/rockstar-store/game/buy-gta-vi': 'product',
    '/bestbuy/cart': 'cart', '/argos/trolley': 'cart', '/bestbuy/checkout/payment': 'checkout', '/amazon/gp/buy/thankyou': 'ordered',
    '/bestbuy/checkout/confirmation/BB1': 'ordered', '/game-uk/confirmation/G12': 'ordered', '/xbox-store/en-US/purchase/complete': 'ordered',
    '/amazon/buy-now': 'checkout', '/rockstar-store/game/buy-gta-vi/preorder': 'checkout', '/amazon/ap/signin': 'account',
    '/bestbuy/identity/signin': 'account', '/target/account': 'account', '/walmart/browse/video-games': 'browse', '/bestbuy/departments': 'browse',
  }
  for (const [path, kind] of Object.entries(cases)) assert.equal(pageKind(path), kind, path)
})

test('live tracker follows the current page, steps reached and last action of a running task', async t => {
  let clock = Date.now()
  const m = await manager(t, { now: () => clock }), { run, attempt, trialId } = await setup(m)
  let live = await m.getLive(run.id)
  assert.equal(live.agents[0].status, 'running')
  assert.equal(live.agents[0].current.index, 1)
  assert.equal(live.agents[0].current.store, 'bestbuy')
  assert.equal(live.agents[0].current.position.page, null)
  clock += 1000
  const home = await visit(m, attempt, trialId, '/bestbuy')
  await events(m, attempt, trialId, home.page_id, [{ kind: 'page', path: '/bestbuy', navigation: 'navigate' }, { kind: 'click', label: 'Search', path: '/bestbuy' }])
  await visit(m, attempt, trialId, '/bestbuy/site/searchpage.jsp?st=gta')
  // A redirect is not a place the agent stops.
  await visit(m, attempt, trialId, '/bestbuy/cart/add', { method: 'POST', status: 302 })
  clock += 2000
  const cart = await visit(m, attempt, trialId, '/bestbuy/cart')
  await events(m, attempt, trialId, cart.page_id, [{ kind: 'page', path: '/bestbuy/cart' }, { kind: 'change', label: 'quantity', path: '/bestbuy/cart' }])
  live = await m.getLive(run.id)
  const { current } = live.agents[0], position = current.position
  assert.equal(position.page.kind, 'cart')
  assert.equal(position.page.path, '/bestbuy/cart')
  assert.deepEqual(position.seen, ['home', 'search', 'cart'])
  assert.deepEqual(position.trail.map(stop => stop.path), ['/bestbuy', '/bestbuy/site/searchpage.jsp', '/bestbuy/cart'])
  assert.deepEqual(position.action, { kind: 'change', label: 'quantity', at: new Date(clock).toISOString(), path: '/bestbuy/cart' })
  assert.equal(position.pages, 3)
  assert.equal(position.actions, 2)
  assert.equal(current.deadline_at, (await m.getRun(run.id)).attempts[0].trials[0].deadline_at)
  // Signed page identifiers and search terms never reach the tracker.
  assert.doesNotMatch(JSON.stringify(live), /page_id|st=gta|\.[\w-]{43}/)
  // The run listing stays as it was.
  assert.equal('live' in (await m.getRun(run.id)).attempts[0].trials[0], false)

  await m.finishTask(attempt.token, { outcome: 'not_purchased', reason: 'budget_exceeded' })
  live = await m.getLive(run.id)
  assert.equal(live.agents[0].status, 'ready')
  assert.equal(live.agents[0].current, null)
  assert.equal(live.agents[0].last.index, 1)
  assert.equal(live.agents[0].last.grade, (await m.getRun(run.id)).attempts[0].trials[0].result.grade.status)
  // A departure beacon after submitting does not bring the position back.
  await events(m, attempt, trialId, cart.page_id, [{ kind: 'click', label: 'late' }])
  assert.equal((await m.exportState()).dashboard_trials[0].live, undefined)
  await assert.rejects(m.getLive('missing'), { status: 404 })
})

test('live position survives a checkpoint restore and a damaged one is dropped', async t => {
  const m = await manager(t, { traceArchive: true }), { run, attempt, trialId } = await setup(m)
  await visit(m, attempt, trialId, '/bestbuy/checkout/payment')
  const snapshot = await m.exportState()
  const restored = await manager(t, { traceArchive: true })
  await restored.importState(snapshot)
  assert.equal((await restored.getLive(run.id)).agents[0].current.position.page.kind, 'checkout')
  snapshot.dashboard_trials[0].live.trail = 'broken'
  const damaged = await manager(t, { traceArchive: true })
  await damaged.importState(snapshot)
  assert.equal((await damaged.getLive(run.id)).agents[0].current.position, null)
})

test('live summary stays small on long tasks', () => {
  let live
  for (let index = 0; index < 50; index++) {
    live = updateLivePosition(live, { kind: 'request', html: true, status: 200, path: `/bestbuy/p/${index}`, at: new Date().toISOString() })
  }
  assert.equal(live.trail.length, LIVE_TRAIL)
  assert.equal(live.pages, 50)
  assert.deepEqual(live.seen, ['product'])
  assert.ok(validLivePosition(live))
})

test('live endpoint requires operator sign-in', async t => {
  const m = await manager(t), { run } = await setup(m)
  const token = 'operator-live-test', app = await createDashboardApp({ manager: m, local: false, apiToken: token })
  const server = http.createServer(app)
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  t.after(() => new Promise(resolve => server.close(resolve)))
  const base = `http://127.0.0.1:${server.address().port}/dashboard`
  assert.equal((await fetch(`${base}/api/runs/${run.id}/live`)).status, 401)
  const response = await fetch(`${base}/api/runs/${run.id}/live`, { headers: { authorization: `Bearer ${token}` } })
  assert.equal(response.status, 200)
  assert.equal((await response.json()).agents.length, 1)
  assert.equal((await fetch(`${base}/live.js`)).status, 200)
})
