import test from 'node:test'
import assert from 'node:assert/strict'
import { registerHooks } from 'node:module'
import { DatabaseSync } from 'node:sqlite'
import { STATE_LIMIT } from '../deploy/coordinator.js'

// Exercise the deployed class against real SQLite, replacing only Cloudflare's
// runtime base class and container transport in this Node test process.
const hook = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === 'cloudflare:workers') return { url: 'data:text/javascript,export class DurableObject { constructor(ctx, env) { this.ctx = ctx; this.env = env } }', shortCircuit: true }
    return nextResolve(specifier, context)
  },
})
const { Storefront } = await import('../deploy/worker.js')
hook.deregister()

const emptyState = () => ({ version: 1, sessions: [], orders: [], accounts: [], dashboard_runs: [], dashboard_trials: [] })
const event = (id, extra = {}) => ({ trial_id: 'trial-one', id, kind: 'request', method: 'GET', path: '/bestbuy', ...extra })
function checkpoint(events = [], count = events.at(-1)?.id ?? 0) {
  return { ...emptyState(), dashboard_trials: [{ id: 'trial-one', traversal: { version: 1, event_count: count } }], dashboard_trace_events: events }
}
function harness(t) {
  const database = new DatabaseSync(':memory:')
  t.after(() => database.close())
  const calls = [], acknowledgements = []
  const context = {
    storage: {
      sql: { exec(query, ...bindings) {
        const rows = database.prepare(query).all(...bindings)
        return { toArray: () => rows, [Symbol.iterator]: () => rows[Symbol.iterator]() }
      } },
      transactionSync(callback) {
        database.exec('BEGIN')
        try { const value = callback(); database.exec('COMMIT'); calls.push('commit'); return value }
        catch (error) { database.exec('ROLLBACK'); throw error }
      },
      async sync() { calls.push('sync') },
    },
    container: { async destroy() { calls.push('destroy') } },
  }
  function instance() {
    const object = new Storefront(context, {})
    object.prepare = async () => {}
    object.internal = async (pathname, { body } = {}) => {
      assert.equal(pathname, 'traversal/ack')
      assert.equal(calls.at(-1), 'sync', 'Acknowledgement must follow confirmed storage commit')
      calls.push('ack')
      acknowledgements.push(JSON.parse(body))
      return Response.json({ ok: true })
    }
    return object
  }
  return { database, context, calls, acknowledgements, instance }
}

test('traversal archive grows beyond the checkpoint limit without enlarging recovery state', async t => {
  const fixture = harness(t), object = fixture.instance()
  for (let batch = 0; batch < 18; batch++) {
    const events = Array.from({ length: 500 }, (_, index) => event(batch * 500 + index + 1, { label: 'x'.repeat(2048) }))
    await object.save(checkpoint(events))
  }
  const archive = fixture.database.prepare('SELECT COUNT(*) AS count, SUM(LENGTH(value)) AS bytes FROM traversal_events').get()
  assert.equal(archive.count, 9000)
  assert.ok(archive.bytes > STATE_LIMIT)
  const restored = fixture.instance().restore()
  assert.equal(restored.dashboard_trials[0].traversal.event_count, 9000)
  assert.equal(Object.hasOwn(restored, 'dashboard_trace_events'), false)
  assert.ok(JSON.stringify(restored).length < 1000)
  assert.equal(fixture.acknowledgements.length, 18)
  assert.deepEqual(fixture.acknowledgements.at(-1), [{ trial_id: 'trial-one', id: 9000 }])
})

test('archive and checkpoint commit atomically, and repeated outbox deliveries are idempotent', async t => {
  const fixture = harness(t), object = fixture.instance()
  await object.save(checkpoint([event(1)]))
  await object.save(checkpoint([event(1)]))
  assert.equal(fixture.database.prepare('SELECT COUNT(*) AS count FROM traversal_events').get().count, 1)
  fixture.database.exec("CREATE TRIGGER reject_second BEFORE INSERT ON traversal_events WHEN NEW.event_id = 2 BEGIN SELECT RAISE(ABORT, 'archive unavailable'); END")
  await assert.rejects(object.save(checkpoint([event(2)])), /archive unavailable/)
  assert.equal(object.restore().dashboard_trials[0].traversal.event_count, 1)
  assert.equal(fixture.database.prepare('SELECT COUNT(*) AS count FROM traversal_events').get().count, 1)
  assert.equal(fixture.acknowledgements.length, 2, 'Failed commit must never acknowledge the outbox')
  await assert.rejects(object.save(checkpoint([event(1, { path: '/tampered' })])), /identity conflict/)
  assert.equal(object.restore().dashboard_trials[0].traversal.event_count, 1)
})

test('an acknowledgement failure keeps committed history and state available after restart', async t => {
  const fixture = harness(t), object = fixture.instance()
  object.internal = async () => new Response('unavailable', { status: 503 })
  object.forward = async () => new Response('purchase completed')
  object.snapshot = async () => checkpoint([event(1)])
  await assert.rejects(object.fetch(new Request('https://bench.test/bestbuy/checkout', { method: 'POST' })), /acknowledge/)
  assert.equal(fixture.calls.at(-1), 'destroy')
  const restarted = fixture.instance()
  assert.equal(restarted.restore().dashboard_trials[0].traversal.event_count, 1)
  await restarted.save(checkpoint([event(1), event(2)]))
  assert.equal(fixture.database.prepare('SELECT COUNT(*) AS count FROM traversal_events').get().count, 2)
  assert.deepEqual(fixture.acknowledgements.at(-1), [{ trial_id: 'trial-one', id: 2 }])
})

test('authorized traversal reads include just-committed events and page the archive after restart', async t => {
  const fixture = harness(t), object = fixture.instance()
  let state = checkpoint(Array.from({ length: 501 }, (_, index) => event(index + 1)))
  object.snapshot = async () => state
  object.forward = async () => Response.json({ trial_id: 'trial-one', events: [], next_cursor: null, event_count: 501 }, { headers: { 'x-benchmark-trace-trial': 'trial-one' } })
  const pathname = 'https://bench.test/dashboard/api/runs/run-one/attempts/attempt-one/traversal/trial-one'
  const response = await object.fetch(new Request(pathname))
  assert.equal(response.headers.get('x-benchmark-trace-trial'), null)
  assert.equal(response.headers.get('cache-control'), 'no-store')
  const first = await response.json()
  assert.equal(first.events.length, 500)
  assert.equal(first.events[0].id, 1)
  assert.equal(first.events.at(-1).id, 500)
  assert.equal(first.next_cursor, 500)
  assert.equal(first.event_count, 501)
  const restarted = fixture.instance()
  state = restarted.restore()
  restarted.snapshot = async () => state
  restarted.forward = object.forward
  const last = await (await restarted.fetch(new Request(`${pathname}?after=500`))).json()
  assert.deepEqual(last.events.map(item => item.id), [501])
  assert.equal(last.next_cursor, null)
  assert.equal(last.event_count, 501)
})

test('archive substitution requires the exact authorized endpoint; internal headers never escape', async t => {
  const fixture = harness(t), object = fixture.instance()
  await object.save(checkpoint([event(1)]))
  object.snapshot = async () => checkpoint([], 1)
  for (const [pathname, status, method] of [
    ['/dashboard/api/runs/run/attempts/attempt/traversal/trial-one', 401, 'GET'],
    ['/dashboard/api/runs/run/attempts/attempt/traversal/trial-one', 200, 'POST'],
    ['/bestbuy', 200, 'GET'],
    ['/static/test.js', 200, 'GET'],
  ]) {
    object.forward = async () => new Response('unchanged', { status, headers: { 'x-benchmark-trace-trial': 'trial-one' } })
    const response = await object.fetch(new Request(`https://bench.test${pathname}`, { method }))
    assert.equal(response.status, status)
    assert.equal(response.headers.get('x-benchmark-trace-trial'), null)
    assert.equal(await response.text(), 'unchanged')
  }
  object.forward = async () => Response.json({ trial_id: 'other-trial', event_count: 1 }, { headers: { 'x-benchmark-trace-trial': 'other-trial' } })
  await assert.rejects(object.fetch(new Request('https://bench.test/dashboard/api/runs/run/attempts/attempt/traversal/trial-one')), /Invalid authorized traversal/)
})
