import test from 'node:test'
import assert from 'node:assert/strict'
import { registerHooks } from 'node:module'
import { DatabaseSync } from 'node:sqlite'

// The deployed Worker runs the chat with its own key, reads click paths from
// its traversal archive and keeps the chat in Durable Object SQLite. Only
// Cloudflare's base class and the network are replaced; the SDK is real.
const hook = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === 'cloudflare:workers') return { url: 'data:text/javascript,export class DurableObject { constructor(ctx, env) { this.ctx = ctx; this.env = env } }', shortCircuit: true }
    return nextResolve(specifier, context)
  },
})
const { Storefront } = await import('../deploy/worker.js')
hook.deregister()

const sse = events => new Response(events.map(event => `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`).join(''), { headers: { 'content-type': 'text/event-stream' } })
const start = { type: 'message_start', message: { id: 'msg_1', type: 'message', role: 'assistant', model: 'claude-opus-5-5', content: [], stop_reason: null, stop_sequence: null, usage: { input_tokens: 5, output_tokens: 0 } } }
const end = reason => [{ type: 'message_delta', delta: { stop_reason: reason, stop_sequence: null }, usage: { output_tokens: 5 } }, { type: 'message_stop' }]
const toolTurn = sse([start,
  { type: 'content_block_start', index: 0, content_block: { type: 'tool_use', id: 'toolu_1', name: 'get_click_path', input: {} } },
  { type: 'content_block_delta', index: 0, delta: { type: 'input_json_delta', partial_json: '{"agent":"Muse","task":"bestbuy-purchase-ps5"}' } },
  { type: 'content_block_stop', index: 0 }, ...end('tool_use')])
const textTurn = words => sse([start,
  { type: 'content_block_start', index: 0, content_block: { type: 'text', text: '' } },
  ...words.map(text => ({ type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text } })),
  { type: 'content_block_stop', index: 0 }, ...end('end_turn')])

const input = { run: { name: 'Monday run' }, agents: [{ label: 'Muse', agent: 'muse', finished: 1, tasks: [] }] }
const lookup = { Muse: { 'bestbuy-purchase-ps5': { attempt_id: 'a1', trial_id: 'trial-one' } } }
const post = question => ({ run_id: 'run-one', key: 'k1', input, lookup, question })

function harness(t, env = { ANTHROPIC_API_KEY: 'sk-test' }, turns = []) {
  const database = new DatabaseSync(':memory:')
  t.after(() => database.close())
  const context = { storage: { sql: { exec(query, ...bindings) {
    const rows = database.prepare(query).all(...bindings)
    return { toArray: () => rows, [Symbol.iterator]: () => rows[Symbol.iterator]() }
  } } }, container: {} }
  const object = new Storefront(context, env)
  database.prepare('INSERT INTO traversal_events (trial_id, event_id, value) VALUES (?, ?, ?)').run('trial-one', 1, JSON.stringify({ kind: 'click', elapsed_ms: 4000, label: 'Add to Cart', path: '/bestbuy/' }))
  let nodeBody, nodeStatus, nodeHeader
  object.coordinator = { fetch: async () => new Response(JSON.stringify(nodeBody), { status: nodeStatus, headers: nodeHeader ? { 'x-benchmark-chat-run': nodeHeader } : {} }) }
  const requests = [], realFetch = globalThis.fetch
  globalThis.fetch = async (url, init) => { requests.push({ url: String(url), headers: new Headers(init.headers), body: JSON.parse(init.body) }); return turns.shift() }
  t.after(() => { globalThis.fetch = realFetch })
  const call = async (method, body, { status = 200, header = 'run-one' } = {}) => {
    nodeBody = body; nodeStatus = status; nodeHeader = header
    const response = await object.fetch(new Request('https://bench.example/dashboard/api/runs/run-one/chat', { method }))
    const raw = await response.text()
    return { status: response.status, type: response.headers.get('content-type'), body: response.headers.get('content-type').includes('ndjson') ? raw.trim().split('\n').map(line => JSON.parse(line)) : JSON.parse(raw) }
  }
  return { database, requests, call }
}

test('the Worker streams an answer, reads the click path from its archive and saves the chat', async t => {
  const fixture = harness(t, undefined, [toolTurn, textTurn(['Muse clicked ', 'Add to Cart.'])])
  assert.deepEqual((await fixture.call('GET', { run_id: 'run-one' })).body, { configured: true, messages: [], full: false })
  const answer = await fixture.call('POST', post('What did Muse do?'))
  assert.match(answer.type, /ndjson/)
  assert.deepEqual(answer.body.filter(event => event.type === 'text').map(event => event.text), ['Muse clicked ', 'Add to Cart.'])
  assert.equal(answer.body.at(-1).type, 'done')
  const [first, second] = fixture.requests
  assert.equal(first.headers.get('x-api-key'), 'sk-test')
  assert.match(first.headers.get('anthropic-beta'), /server-side-fallback-2026-07-01/)
  assert.match(first.headers.get('anthropic-beta'), /thinking-binding-controls-2026-08-01/)
  assert.equal(first.body.stream, true)
  assert.equal(first.body.tools[0].name, 'get_click_path')
  assert.equal(second.body.messages[2].content[0].content, '+4s clicked "Add to Cart" on /bestbuy/')
  const saved = (await fixture.call('GET', { run_id: 'run-one' })).body
  assert.deepEqual(saved.messages.map(item => item.text), ['What did Muse do?', 'Muse clicked Add to Cart.'])
  assert.equal((await fixture.call('DELETE', { run_id: 'run-one' })).body.messages.length, 0)
  assert.equal(fixture.database.prepare('SELECT COUNT(*) AS count FROM run_chats').get().count, 0)
})

test('without the secret the Worker never calls Claude', async t => {
  const fixture = harness(t, {})
  assert.equal((await fixture.call('GET', { run_id: 'run-one' })).body.configured, false)
  const result = await fixture.call('POST', post('Hi'))
  assert.equal(result.status, 409)
  assert.equal(fixture.requests.length, 0)
})

test('Claude errors arrive as a plain message and nothing is saved', async t => {
  const fixture = harness(t, undefined, [Response.json({ type: 'error', error: { type: 'authentication_error', message: 'bad key' } }, { status: 401 })])
  const result = await fixture.call('POST', post('Hi'))
  assert.deepEqual(result.body, [{ type: 'error', error: 'Claude rejected the API key. Check the ANTHROPIC_API_KEY secret.' }])
  assert.equal(fixture.database.prepare('SELECT COUNT(*) AS count FROM run_chats').get().count, 0)
})

test('Node refusals pass through and mismatched runs are rejected', async t => {
  const fixture = harness(t)
  assert.equal((await fixture.call('POST', { error: 'Operator sign-in required' }, { status: 401, header: null })).status, 401)
  await assert.rejects(fixture.call('GET', { run_id: 'run-two' }, { header: 'run-two' }), /Invalid authorized chat response/)
  assert.equal(fixture.requests.length, 0)
})
