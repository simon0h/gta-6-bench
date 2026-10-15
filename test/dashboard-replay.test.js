import test from 'node:test'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import http from 'node:http'
import { gzipSync, gunzipSync } from 'node:zlib'
import { createRunManager } from '../benchmark/dashboard-manager.js'
import { createDashboardApp } from '../dashboard/server.js'
import { tasks } from '../benchmark/tasks.js'
import { REPLAY_LIMITS, replayChunk } from '../benchmark/replay.js'

const task = tasks.find(task => task.id === 'bestbuy-budget_decline-ps5')
const options = { persist: false, environment: { environment_sha256: 'replay-test-source' }, taskSets: { original30: [task], all240: [task] } }
const factory = baseUrl => async ({ trial }) => ({
  target: { baseUrl: baseUrl || 'http://127.0.0.1:1', startPath: '/bestbuy' },
  snapshot: async () => ({ version: 1, run_id: trial.id, orders: [], errors: [], sessions: [], request_count: 0 }), close: async () => {},
})
async function manager(t, extra = {}) {
  const m = await createRunManager({ ...options, workerFactory: factory(), ...extra })
  t.after(() => m.close())
  return m
}
async function setup(m) {
  const run = await m.createRun({ name: 'Replay' }), attempt = await m.addAttempt(run.id, { agent: 'grokbot' })
  await m.startTask(attempt.token)
  const { trialId } = await m.getTarget(attempt.token)
  const page = await m.recordRequest(attempt.token, trialId, { path: '/bestbuy', method: 'GET', status: 200, html: true, page_id: randomUUID() })
  return { run, attempt, trialId, pageId: page.page_id }
}
const snapshot = (timestamp, extra = {}) => [{ type: 4, data: { href: 'http://bench.test/bestbuy' }, timestamp }, { type: 2, data: { node: { type: 0, childNodes: [] } }, timestamp: timestamp + 1, ...extra }]
const gz = events => gzipSync(JSON.stringify(events))
const decode = chunk => JSON.parse(gunzipSync(Buffer.from(chunk.data, 'base64')).toString('utf8'))
async function listen(t, app) {
  const server = http.createServer(app)
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve) })
  t.after(async () => { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)) })
  return `http://127.0.0.1:${server.address().port}`
}

test('replay chunks accept gzip or plain events, remove the agent capability and reject malformed uploads', () => {
  const plain = replayChunk(Buffer.from(JSON.stringify(snapshot(1))))
  assert.equal(plain.count, 2)
  assert.deepEqual(JSON.parse(gunzipSync(Buffer.from(plain.data, 'base64'))), snapshot(1))
  const body = gz(snapshot(1, { data: { href: 'http://bench.test/agent/SECRET_TOKEN_VALUE' } }))
  assert.equal(replayChunk(body).data, body.toString('base64'), 'Compressed uploads without secrets are stored as sent')
  assert.doesNotMatch(gunzipSync(Buffer.from(replayChunk(body, ['SECRET_TOKEN_VALUE']).data, 'base64')).toString(), /SECRET_TOKEN_VALUE/)
  for (const bad of [Buffer.alloc(0), Buffer.from('{}'), Buffer.from('[]'), Buffer.from('[{"type":"2"}]'), Buffer.from('not json'), Buffer.from([0x1f, 0x8b, 1, 2])]) {
    assert.throws(() => replayChunk(bad), /replay/i)
  }
  assert.throws(() => replayChunk(Buffer.alloc(REPLAY_LIMITS.upload + 1, 32)), error => error.status === 413)
})

test('replays record per task, stay out of grading and are readable only through the owning attempt', async t => {
  let clock = Date.now()
  const m = await manager(t, { now: () => clock }), { run, attempt, trialId, pageId } = await setup(m)
  clock += 1200
  await m.recordReplay(attempt.token, { trial_id: trialId, page_id: pageId, seq: 1 }, gz(snapshot(10)))
  await m.recordReplay(attempt.token, { trial_id: trialId, page_id: pageId, seq: 2 }, Buffer.from(JSON.stringify([{ type: 3, data: { source: 1 }, timestamp: 20 }])))
  const summary = await m.getTraversal(run.id, attempt.id)
  assert.equal(summary.tasks[0].replay_recorded, true)
  assert.equal(summary.tasks[0].replay_chunks, 2)
  const replay = await m.getReplay(run.id, attempt.id, trialId)
  assert.deepEqual(replay.chunks.map(chunk => [chunk.id, chunk.seq, chunk.page_id, chunk.elapsed_ms]), [[1, 1, pageId, 1200], [2, 2, pageId, 1200]])
  assert.deepEqual(decode(replay.chunks[0]), snapshot(10))
  assert.equal(replay.next_cursor, null)
  assert.deepEqual((await m.getReplay(run.id, attempt.id, trialId, { after: 1 })).chunks.map(chunk => chunk.id), [2])
  await assert.rejects(m.recordReplay(attempt.token, { trial_id: trialId, page_id: `${randomUUID()}.${'x'.repeat(43)}`, seq: 3 }, gz(snapshot(30))), /Unknown task page/)
  const other = await m.addAttempt(run.id, { agent: 'muse' })
  await assert.rejects(m.getReplay(run.id, other.id, trialId), /not found/)
  await assert.rejects(m.recordReplay(other.token, { trial_id: trialId, page_id: pageId, seq: 3 }, gz(snapshot(30))), /not found/)
  await assert.rejects(m.recordReplay(attempt.token, { trial_id: trialId, page_id: pageId, seq: 0 }, gz(snapshot(30))), /Invalid replay chunk/)
  await m.finishTask(attempt.token, { outcome: 'not_purchased', reason: 'budget_exceeded', message: 'Over budget' })
  const detail = await m.getRun(run.id)
  assert.equal(detail.attempts[0].trials[0].result.grade.status, 'passed')
  assert.equal(JSON.stringify(detail).includes(replay.chunks[0].data), false)
  clock += 5001
  await assert.rejects(m.recordReplay(attempt.token, { trial_id: trialId, page_id: pageId, seq: 3 }, gz(snapshot(40))), /no longer running/)
})

test('per-task replay storage is capped', async t => {
  const m = await manager(t), { attempt, trialId, pageId } = await setup(m)
  const state = await m.exportState()
  state.dashboard_trials[0].replay.bytes = REPLAY_LIMITS.trial
  await m.importState(state)
  await assert.rejects(m.recordReplay(attempt.token, { trial_id: trialId, page_id: pageId, seq: 1 }, gz(snapshot(1))), error => error.status === 413)
})

test('local dashboards keep replay chunks in files, not the checkpoint, across restart', async t => {
  const directory = await mkdtemp(path.join(tmpdir(), 'dashboard-replay-'))
  t.after(() => rm(directory, { recursive: true, force: true }))
  const m = await manager(t, { directory, persist: true }), { run, attempt, trialId, pageId } = await setup(m)
  await m.recordReplay(attempt.token, { trial_id: trialId, page_id: pageId, seq: 1 }, gz(snapshot(1)))
  await m.close()
  const saved = await readFile(path.join(directory, 'dashboard-state.json'), 'utf8')
  assert.equal(JSON.parse(saved).dashboard_trials[0].replay.chunk_count, 1)
  assert.equal(Object.hasOwn(JSON.parse(saved), 'dashboard_replay_chunks'), false)
  assert.deepEqual(await readdir(path.join(directory, 'replays', trialId)), ['1.json'])
  const restored = await manager(t, { directory, persist: true })
  await restored.recordReplay(attempt.token, { trial_id: trialId, page_id: pageId, seq: 2 }, gz(snapshot(2)))
  const replay = await restored.getReplay(run.id, attempt.id, trialId)
  assert.deepEqual(replay.chunks.map(chunk => chunk.id), [1, 2])
  assert.deepEqual(decode(replay.chunks[1]), snapshot(2))
})

test('archive outbox exports replay chunks until acknowledged and rejects forged checkpoints', async t => {
  const m = await manager(t, { traceArchive: true }), { attempt, trialId, pageId } = await setup(m)
  await m.recordReplay(attempt.token, { trial_id: trialId, page_id: pageId, seq: 1 }, gz(snapshot(1)))
  await m.recordReplay(attempt.token, { trial_id: trialId, page_id: pageId, seq: 2 }, gz(snapshot(2)))
  let state = await m.exportState()
  assert.deepEqual(state.dashboard_replay_chunks.map(chunk => [chunk.trial_id, chunk.id]), [[trialId, 1], [trialId, 2]])
  await m.acknowledgeReplay([{ trial_id: trialId, id: 1 }])
  await m.acknowledgeReplay([{ trial_id: trialId, id: 1 }])
  state = await m.exportState()
  assert.deepEqual(state.dashboard_replay_chunks.map(chunk => chunk.id), [2])
  await assert.rejects(m.acknowledgeReplay([{ trial_id: trialId, id: 3 }]), /acknowledgement/)
  const forged = structuredClone(state)
  forged.dashboard_replay_chunks[0].id = 9
  assert.throws(() => m.validateState(forged), /Invalid replay chunk checkpoint/)
  const tampered = structuredClone(state)
  tampered.dashboard_replay_chunks[0].bytes += 1
  assert.throws(() => m.validateState(tampered), /Invalid replay chunk checkpoint/)
  const metadata = structuredClone(state)
  metadata.dashboard_trials[0].replay.extra = true
  assert.throws(() => m.validateState(metadata), /Invalid replay metadata/)
  await m.acknowledgeReplay([{ trial_id: trialId, id: 2 }])
  assert.deepEqual((await m.exportState()).dashboard_replay_chunks, [])
  const local = await manager(t)
  assert.throws(() => local.validateState(state), /Invalid replay checkpoint/)
})

test('HTTP replay capture is injected per page, authenticated, same-origin and operator-only to read', async t => {
  const upstream = await listen(t, (req, res) => res.writeHead(200, { 'content-type': 'text/html' }).end('<!doctype html><body><h1>Storefront</h1></body>'))
  const m = await manager(t, { workerFactory: factory(upstream), traceArchive: true })
  const run = await m.createRun({ name: 'Replay HTTP' }), attempt = await m.addAttempt(run.id, { agent: 'dots' })
  await m.startTask(attempt.token)
  const operatorToken = 'operator-replay-test', app = await createDashboardApp({ manager: m, local: false, apiToken: operatorToken })
  const base = await listen(t, app), cookie = `bench_attempt=${attempt.token}`, auth = { authorization: `Bearer ${operatorToken}` }
  const html = await (await fetch(base + '/bestbuy', { headers: { cookie } })).text()
  const injected = html.match(/<script src="\/dashboard\/vendor\/rrweb-record.js" defer><\/script><script src="\/dashboard\/recorder.js" data-trial="([^"]+)" data-page="([^"]+)" defer><\/script>/)
  assert.ok(injected)
  const [, trialId, pageId] = injected
  const recorder = await fetch(base + '/dashboard/vendor/rrweb-record.js')
  assert.equal(recorder.status, 200)
  assert.match(recorder.headers.get('content-type'), /javascript/)
  assert.match(await recorder.text(), /rrwebRecord/)
  assert.equal((await fetch(base + '/dashboard/vendor/rrweb-player.js')).status, 200)
  assert.match((await fetch(base + '/dashboard/vendor/rrweb-player.css')).headers.get('content-type'), /css/)
  const upload = (headers, seq = 1, body = gz(snapshot(1, { data: { href: `${base}/agent/${attempt.token}` } }))) =>
    fetch(`${base}/agent/replay?trial=${encodeURIComponent(trialId)}&page=${encodeURIComponent(pageId)}&seq=${seq}`, { method: 'POST', headers: { 'content-type': 'application/octet-stream', ...headers }, body })
  assert.equal((await upload({})).status, 401)
  assert.equal((await upload({ cookie, origin: 'https://other.example' })).status, 403)
  assert.equal((await upload({ cookie }, 'x')).status, 400)
  assert.equal((await upload({ cookie, origin: base })).status, 204)
  assert.equal((await upload({ cookie }, 2, Buffer.alloc(REPLAY_LIMITS.upload + 10, 32))).status, 413)
  const route = `/dashboard/api/runs/${run.id}/attempts/${attempt.id}/replay/${trialId}`
  const denied = await fetch(base + route, { headers: { cookie } })
  assert.equal(denied.status, 401)
  assert.equal(denied.headers.get('x-benchmark-replay-trial'), null)
  const result = await fetch(base + route, { headers: auth })
  assert.equal(result.headers.get('x-benchmark-replay-trial'), trialId)
  const body = await result.json()
  assert.equal(body.chunk_count, 1)
  assert.doesNotMatch(JSON.stringify(body.chunks.map(decode)), new RegExp(attempt.token))
  assert.equal((await fetch(base + route + '?after=-1', { headers: auth })).status, 400)
  assert.equal((await fetch(`${base}/dashboard/api/runs/${run.id}/attempts/${attempt.id}/replay/unknown`, { headers: auth })).status, 404)
})
