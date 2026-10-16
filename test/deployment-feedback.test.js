import test from 'node:test'
import assert from 'node:assert/strict'
import { registerHooks } from 'node:module'
import { DatabaseSync } from 'node:sqlite'
import { feedbackOperation } from '../benchmark/feedback.js'

// The deployed Worker keeps feedback notes in Durable Object SQLite after Node
// has checked sign-in. Only Cloudflare's base class is replaced.
const hook = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === 'cloudflare:workers') return { url: 'data:text/javascript,export class DurableObject { constructor(ctx, env) { this.ctx = ctx; this.env = env } }', shortCircuit: true }
    return nextResolve(specifier, context)
  },
})
const { Storefront } = await import('../deploy/worker.js')
hook.deregister()

function harness(t) {
  const database = new DatabaseSync(':memory:')
  t.after(() => database.close())
  const context = { storage: { sql: { exec(query, ...bindings) {
    const rows = database.prepare(query).all(...bindings)
    return { toArray: () => rows, [Symbol.iterator]: () => rows[Symbol.iterator]() }
  } } }, container: {} }
  const object = new Storefront(context, {})
  let nodeBody, nodeStatus, nodeHeader
  object.coordinator = { fetch: async () => new Response(JSON.stringify(nodeBody), { status: nodeStatus, headers: nodeHeader ? { 'x-benchmark-feedback': nodeHeader } : {} }) }
  const call = async (path, operation, { status = 200, header = '1' } = {}) => {
    nodeBody = operation; nodeStatus = status; nodeHeader = header
    const response = await object.fetch(new Request(`https://bench.example/dashboard/api/feedback${path}`))
    return { status: response.status, header: response.headers.get('x-benchmark-feedback'), body: await response.json() }
  }
  return { database, call }
}
const pin = { page: '/bestbuy', text: 'Logo looks blurry', x: 10, y: 20 }

test('the Worker saves, changes and removes one row per note', async t => {
  const { database, call } = harness(t)
  const added = await call('', { ...feedbackOperation('POST', undefined, pin), agent_browser: false })
  assert.equal(added.status, 201)
  assert.equal(added.header, null, 'the internal header never reaches the browser')
  const [note] = added.body.comments
  assert.equal(note.number, 1)
  await call('', feedbackOperation('POST', undefined, { ...pin, text: 'Second' }))
  assert.equal(database.prepare('SELECT COUNT(*) AS count FROM feedback_notes').get().count, 2)
  const resolved = await call(`/${note.id}`, feedbackOperation('PATCH', note.id, { resolved: true }))
  assert.equal(resolved.body.comments.find(item => item.id === note.id).resolved, true)
  const listed = await call('', { ...feedbackOperation('GET'), agent_browser: true })
  assert.deepEqual(listed.body.comments.map(item => item.number), [1, 2])
  assert.equal(listed.body.agent_browser, true)
  await call(`/${note.id}`, feedbackOperation('DELETE', note.id))
  assert.equal(database.prepare('SELECT COUNT(*) AS count FROM feedback_notes').get().count, 1)
  const missing = await call(`/${note.id}`, feedbackOperation('DELETE', note.id))
  assert.equal(missing.status, 404)
})

test('without Node’s go-ahead the Worker passes the answer through untouched', async t => {
  const { database, call } = harness(t)
  const refused = await call('', { error: 'Operator sign-in required' }, { status: 401, header: null })
  assert.equal(refused.status, 401)
  const unmarked = await call('', feedbackOperation('POST', undefined, pin), { header: null })
  assert.equal(unmarked.body.op, 'add')
  assert.equal(database.prepare('SELECT COUNT(*) AS count FROM feedback_notes').get().count, 0)
})
