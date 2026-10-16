import test from 'node:test'
import assert from 'node:assert/strict'
import { registerHooks } from 'node:module'
import { DatabaseSync } from 'node:sqlite'

// The deployed Worker calls Claude with its own secret and keeps summaries in
// Durable Object SQLite. Replace only Cloudflare's base class and the network.
const hook = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === 'cloudflare:workers') return { url: 'data:text/javascript,export class DurableObject { constructor(ctx, env) { this.ctx = ctx; this.env = env } }', shortCircuit: true }
    return nextResolve(specifier, context)
  },
})
const { Storefront } = await import('../deploy/worker.js')
hook.deregister()

const input = { run: { name: 'Monday run' }, agents: [{ label: 'Muse', agent: 'muse', finished: 2, tasks: [] }] }
const claudeReply = { overview: 'Muse passed 1 of 2.', agents: [{ label: 'Muse', summary: 'Missed one refusal.' }], patterns: [] }

function harness(t, env = { ANTHROPIC_API_KEY: 'sk-test' }) {
  const database = new DatabaseSync(':memory:')
  t.after(() => database.close())
  const context = {
    storage: { sql: { exec(query, ...bindings) {
      const rows = database.prepare(query).all(...bindings)
      return { toArray: () => rows, [Symbol.iterator]: () => rows[Symbol.iterator]() }
    } } },
    container: {},
  }
  const object = new Storefront(context, env)
  let nodeBody = null, nodeStatus = 200, nodeHeader = 'run-one'
  object.coordinator = { fetch: async () => new Response(JSON.stringify(nodeBody), { status: nodeStatus, headers: nodeHeader ? { 'x-benchmark-summary-run': nodeHeader } : {} }) }
  const requests = []
  const realFetch = globalThis.fetch
  globalThis.fetch = async (url, init) => {
    requests.push({ url: String(url), headers: new Headers(init.headers), body: JSON.parse(init.body) })
    return Response.json({ id: 'msg_1', type: 'message', role: 'assistant', model: 'claude-opus-5-5', content: [{ type: 'text', text: JSON.stringify(claudeReply) }], stop_reason: 'end_turn', stop_sequence: null, usage: { input_tokens: 5, output_tokens: 5 } })
  }
  t.after(() => { globalThis.fetch = realFetch })
  const call = async (method, body, { status = 200, header = 'run-one' } = {}) => {
    nodeBody = body; nodeStatus = status; nodeHeader = header
    const response = await object.fetch(new Request('https://bench.example/dashboard/api/runs/run-one/summary', { method }))
    return { status: response.status, header: response.headers.get('x-benchmark-summary-run'), body: await response.json() }
  }
  return { database, requests, call }
}

test('the Worker writes a summary with its own key, saves it and reports when it is stale', async t => {
  const fixture = harness(t)
  let result = await fixture.call('GET', { run_id: 'run-one', key: 'k1', finished: 2 })
  assert.deepEqual(result.body, { configured: true, finished: 2, summary: null, written_at: null, written_from: null, stale: false })
  assert.equal(result.header, null)
  result = await fixture.call('POST', { run_id: 'run-one', key: 'k1', finished: 2, input })
  assert.equal(result.status, 200)
  assert.equal(result.body.summary.overview, 'Muse passed 1 of 2.')
  assert.equal(result.body.summary.agents[0].agent, 'muse')
  assert.equal(result.body.input, undefined)
  const [request] = fixture.requests
  assert.match(request.url, /\/v1\/messages/)
  assert.equal(request.headers.get('x-api-key'), 'sk-test')
  assert.match(request.headers.get('anthropic-beta'), /server-side-fallback-2026-07-01/)
  assert.equal(request.body.model, 'claude-opus-5-5')
  assert.equal(request.body.fallbacks, 'default')
  assert.match(request.body.messages[0].content, /Monday run/)
  assert.equal(fixture.database.prepare('SELECT COUNT(*) AS count FROM run_summaries').get().count, 1)
  result = await fixture.call('GET', { run_id: 'run-one', key: 'k1', finished: 2 })
  assert.equal(result.body.stale, false)
  assert.equal(result.body.written_from, 2)
  result = await fixture.call('GET', { run_id: 'run-one', key: 'k2', finished: 3 })
  assert.equal(result.body.stale, true)
  assert.equal(fixture.requests.length, 1)
})

test('without the secret the Worker says how to turn summaries on and never calls Claude', async t => {
  const fixture = harness(t, {})
  assert.equal((await fixture.call('GET', { run_id: 'run-one', key: 'k1', finished: 2 })).body.configured, false)
  const result = await fixture.call('POST', { run_id: 'run-one', key: 'k1', finished: 2, input })
  assert.equal(result.status, 409)
  assert.match(result.body.error, /ANTHROPIC_API_KEY/)
  assert.equal(fixture.requests.length, 0)
})

test('Node refusals pass through untouched, and mismatched runs are rejected', async t => {
  const fixture = harness(t)
  const refused = await fixture.call('POST', { error: 'Operator sign-in required' }, { status: 401, header: null })
  assert.equal(refused.status, 401)
  assert.equal(fixture.requests.length, 0)
  await assert.rejects(fixture.call('GET', { run_id: 'run-two', key: 'k', finished: 1 }, { header: 'run-two' }), /Invalid authorized summary response/)
})
