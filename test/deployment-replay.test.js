import test from 'node:test'
import assert from 'node:assert/strict'
import { registerHooks } from 'node:module'
import { DatabaseSync } from 'node:sqlite'

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

const chunk = (id, bytes = 10, extra = {}) => ({ trial_id: 'trial-one', id, page_id: 'page', seq: id, at: new Date(0).toISOString(), elapsed_ms: 0, count: 1, bytes, data: 'A'.repeat(Math.ceil(bytes / 3) * 4), ...extra })
function checkpoint(chunks = [], count = chunks.at(-1)?.id ?? 0) {
  return { version: 1, sessions: [], orders: [], accounts: [], dashboard_runs: [], dashboard_trials: [{ id: 'trial-one', traversal: { version: 1, event_count: 0 }, replay: { version: 1, chunk_count: count, bytes: 0 } }], dashboard_trace_events: [], dashboard_replay_chunks: chunks }
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
        try { const value = callback(); database.exec('COMMIT'); return value }
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
      assert.equal(calls.at(-1), 'sync', 'Acknowledgement must follow confirmed storage commit')
      acknowledgements.push([pathname, JSON.parse(body)])
      return Response.json({ ok: true })
    }
    return object
  }
  return { database, calls, acknowledgements, instance }
}

test('replay chunks are archived outside the recovery checkpoint and acknowledged after commit', async t => {
  const fixture = harness(t), object = fixture.instance()
  await object.save(checkpoint([chunk(1), chunk(2)]))
  await object.save(checkpoint([chunk(2)]))
  assert.equal(fixture.database.prepare('SELECT COUNT(*) AS count FROM replay_chunks').get().count, 2)
  assert.deepEqual(fixture.acknowledgements, [['replay/ack', [{ trial_id: 'trial-one', id: 2 }]], ['replay/ack', [{ trial_id: 'trial-one', id: 2 }]]])
  const restored = fixture.instance().restore()
  assert.equal(restored.dashboard_trials[0].replay.chunk_count, 2)
  assert.equal(Object.hasOwn(restored, 'dashboard_replay_chunks'), false)
  await assert.rejects(object.save(checkpoint([chunk(1, 10, { seq: 9 })])), /identity conflict/)
})

test('authorized replay reads page archived chunks by size and never leak the internal header', async t => {
  const fixture = harness(t), object = fixture.instance()
  const large = 3 * 1024 * 1024
  object.snapshot = async () => checkpoint([chunk(1, large), chunk(2, large), chunk(3, large), chunk(4)])
  object.forward = async () => Response.json({ trial_id: 'trial-one', recorded: true, chunk_count: 4, chunks: [], next_cursor: null }, { headers: { 'x-benchmark-replay-trial': 'trial-one' } })
  const pathname = 'https://bench.test/dashboard/api/runs/run-one/attempts/attempt-one/replay/trial-one'
  const response = await object.fetch(new Request(pathname))
  assert.equal(response.headers.get('x-benchmark-replay-trial'), null)
  assert.equal(response.headers.get('cache-control'), 'no-store')
  const first = await response.json()
  assert.deepEqual(first.chunks.map(item => item.id), [1, 2])
  assert.equal(first.next_cursor, 2)
  assert.equal(first.chunks.some(item => 'trial_id' in item), false)
  const last = await (await object.fetch(new Request(`${pathname}?after=2`))).json()
  assert.deepEqual(last.chunks.map(item => item.id), [3, 4])
  assert.equal(last.next_cursor, null)
  // A traversal header on a replay route (or the reverse) is never substituted.
  object.forward = async () => new Response('unchanged', { headers: { 'x-benchmark-trace-trial': 'trial-one' } })
  const mismatch = await object.fetch(new Request(pathname))
  assert.equal(await mismatch.text(), 'unchanged')
  object.forward = async () => new Response('unchanged', { status: 401, headers: { 'x-benchmark-replay-trial': 'trial-one' } })
  const denied = await object.fetch(new Request(pathname))
  assert.equal(denied.status, 401)
  assert.equal(denied.headers.get('x-benchmark-replay-trial'), null)
})
