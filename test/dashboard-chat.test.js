import test from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import express from 'express'
import { CHAT_HEADER, CHAT_LIMITS, chatLookup, clickPathText, runChat } from '../benchmark/ai-chat.js'
import { summaryInput } from '../benchmark/ai-summary.js'
import { createDashboardRouter } from '../dashboard/router.js'

const trial = (id, task, status) => ({ id, task_id: task, status: 'completed', result: { store: 'bestbuy', family: 'purchase', elapsed_ms: 30_000, grade: { status, reasons: [] }, expected_output: [], actual_output: [], failure_reasons: [] } })
const sampleRun = () => ({ id: 'run-one', name: 'Monday run', suite: 'original30', task_ids: ['bestbuy-purchase-ps5'], attempts: [
  { id: 'a1', agent: 'muse', tags: [], comments: '', total: 1, trials: [trial('t1', 'bestbuy-purchase-ps5', 'failed')] },
  { id: 'a2', agent: 'dots', tags: [], comments: '', total: 1, trials: [{ id: 't2', task_id: 'bestbuy-purchase-ps5', status: 'running', result: null }] },
] })
const events = [
  { kind: 'start', elapsed_ms: 0 },
  { kind: 'page', elapsed_ms: 1200, path: '/bestbuy/' },
  { kind: 'request', elapsed_ms: 1300, method: 'GET', path: '/bestbuy/', status: 200 },
  { kind: 'click', elapsed_ms: 5400, path: '/bestbuy/', label: 'Add to Cart' },
  { kind: 'change', elapsed_ms: 6000, label: 'Quantity' },
  { kind: 'request', elapsed_ms: 6100, method: 'POST', path: '/bestbuy/cart', status: 302 },
  { kind: 'navigation', elapsed_ms: 7000, navigation: 'back_forward' },
  { kind: 'complete', elapsed_ms: 9000 },
]

// A stand-in for client.beta.messages.stream: each call plays the next scripted reply.
function fakeClient(replies) {
  const requests = []
  return { requests, beta: { messages: { stream: params => {
    requests.push(structuredClone(params))
    const reply = replies.shift()
    const listeners = []
    return {
      on(name, listener) { if (name === 'text') listeners.push(listener); return this },
      async finalMessage() {
        for (const block of reply.content) if (block.type === 'text') for (const listener of listeners) listener(block.text)
        return { stop_reason: reply.stop_reason ?? 'end_turn', content: reply.content }
      },
    }
  } } } }
}
const text = value => ({ content: [{ type: 'thinking', thinking: '', signature: 'sig' }, { type: 'text', text: value }] })
const toolCall = input => ({ stop_reason: 'tool_use', content: [{ type: 'thinking', thinking: '', signature: 'sig' }, { type: 'tool_use', id: 'call-1', name: 'get_click_path', input }] })

test('click paths read as short lines, skip plain page loads and keep long paths in bounds', () => {
  assert.equal(clickPathText(events), [
    '+0s started the task', '+1s opened /bestbuy/', '+5s clicked "Add to Cart" on /bestbuy/', '+6s filled in "Quantity"',
    '+6s POST /bestbuy/cart answered 302', '+7s went back or forward', '+9s submitted its result',
  ].join('\n'))
  assert.equal(clickPathText([]), 'No click path was recorded for this task.')
  const long = clickPathText(Array.from({ length: 1000 }, (_, index) => ({ kind: 'page', elapsed_ms: index * 1000, path: `/p${index}` })))
  assert.equal(long.split('\n').length, CHAT_LIMITS.pathLines + 1)
  assert.match(long, /600 steps left out/)
})

test('the lookup maps agent labels and task ids to finished tasks only', () => {
  assert.deepEqual(chatLookup(sampleRun()), { Muse: { 'bestbuy-purchase-ps5': { attempt_id: 'a1', trial_id: 't1' } }, Dots: {} })
  const custom = { ...sampleRun(), tasks: [{ id: 'bestbuy-purchase-ps5', name: 'Two  copies to Ohio' }] }
  assert.deepEqual(chatLookup(custom).Muse, { 'Two copies to Ohio': { attempt_id: 'a1', trial_id: 't1' } }, 'dashboard tasks go by the name the run data shows')
  assert.equal(summaryInput(custom).agents[0].tasks[0].task, 'Two copies to Ohio')
})

test('a chat sends run data once, looks up click paths and only ever appends to its history', async () => {
  const input = summaryInput(sampleRun())
  const client = fakeClient([toolCall({ agent: 'Muse', task: 'bestbuy-purchase-ps5' }), text('Muse clicked Add to Cart, then went back.'), text('Nothing else changed.'), text('Now 2 results.')])
  const lookups = [], streamed = []
  const readClickPath = async (agent, task) => { lookups.push([agent, task]); return events }
  const first = await runChat({ client, chat: null, input, inputKey: 'k1', question: 'What did Muse do?', readClickPath, onText: piece => streamed.push(piece) })
  assert.deepEqual(lookups, [['Muse', 'bestbuy-purchase-ps5']])
  assert.equal(streamed.join(''), 'Muse clicked Add to Cart, then went back.')
  const [opening, followUp] = client.requests
  assert.equal(opening.model, 'claude-opus-5-5')
  assert.equal(opening.fallbacks, 'default')
  assert.deepEqual(opening.thinking, { type: 'adaptive', block_binding: { prefix_mismatch_behavior: 'drop_block' } })
  assert.deepEqual(opening.betas, ['server-side-fallback-2026-07-01', 'thinking-binding-controls-2026-08-01'])
  assert.equal(opening.tools[0].name, 'get_click_path')
  assert.equal(opening.tool_choice, undefined)
  assert.match(opening.messages[0].content[0].text, /^Run results as JSON/)
  assert.equal(opening.messages[0].content[1].text, 'What did Muse do?')
  assert.match(followUp.messages[2].content[0].content, /clicked "Add to Cart"/)
  assert.deepEqual(first.display.map(item => [item.role, item.text]), [['user', 'What did Muse do?'], ['assistant', 'Muse clicked Add to Cart, then went back.']])

  const second = await runChat({ client, chat: first, input, inputKey: 'k1', question: 'Anything else?', readClickPath })
  const repeat = client.requests[2]
  assert.deepEqual(repeat.messages.slice(0, first.messages.length), first.messages, 'earlier turns are sent back unchanged')
  assert.deepEqual(repeat.messages.at(-1).content, [{ type: 'text', text: 'Anything else?' }], 'unchanged results are not sent again')
  await runChat({ client, chat: second, input, inputKey: 'k2', question: 'And now?', readClickPath })
  assert.match(client.requests[3].messages.at(-1).content[0].text, /^Updated run results as JSON/)
})

test('unknown tasks, bad tool input and the round limit are handled', async () => {
  const input = summaryInput(sampleRun())
  const calls = Array.from({ length: CHAT_LIMITS.rounds }, () => toolCall({ agent: 'Nobody', task: 'x' }))
  calls[1] = toolCall({ wrong: true })
  calls[CHAT_LIMITS.rounds - 1] = text('Done looking.')
  const client = fakeClient(calls)
  const chat = await runChat({ client, chat: null, input, inputKey: 'k', question: 'Look around', readClickPath: async () => null })
  assert.match(client.requests[1].messages.at(-1).content[0].content, /No finished task x for Nobody/)
  assert.equal(client.requests[2].messages.at(-1).content[0].is_error, true)
  assert.deepEqual(client.requests.at(-1).tool_choice, { type: 'none' })
  assert.equal(chat.display.at(-1).text, 'Done looking.')
  await assert.rejects(runChat({ client: fakeClient([{ stop_reason: 'refusal', content: [] }]), chat: null, input, inputKey: 'k', question: 'Hi', readClickPath: async () => null }), /declined/)
})

async function serve(t, options) {
  const run = sampleRun()
  const manager = { getRun: async id => id === run.id ? run : null, getTraversalEvents: async () => ({ events, next_cursor: null }), ...options.manager }
  const app = express().use(createDashboardRouter({ local: true, ...options, manager }))
  const server = await new Promise(resolve => { const value = http.createServer(app).listen(0, '127.0.0.1', () => resolve(value)) })
  t.after(() => new Promise(resolve => server.close(resolve)))
  const base = `http://localhost:${server.address().port}/dashboard/api/runs/run-one/chat`
  const call = async (method = 'GET', body) => {
    const response = await fetch(base, { method, headers: body ? { 'content-type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined })
    const raw = await response.text()
    const type = response.headers.get('content-type') || ''
    return { status: response.status, header: response.headers.get(CHAT_HEADER), body: type.includes('ndjson') ? raw.trim().split('\n').map(line => JSON.parse(line)) : JSON.parse(raw) }
  }
  return { call }
}

test('local dashboard streams answers, keeps the chat and clears it', async t => {
  const claudeClient = fakeClient([toolCall({ agent: 'Muse', task: 'bestbuy-purchase-ps5' }), text('It went back once.')])
  const { call } = await serve(t, { anthropicApiKey: 'key', claudeClient })
  assert.deepEqual((await call()).body, { configured: true, messages: [], full: false })
  assert.equal((await call('POST', { question: '   ' })).status, 400)
  const answer = await call('POST', { question: 'What did Muse do?' })
  assert.equal(answer.status, 200)
  assert.deepEqual(answer.body.filter(event => event.type === 'text').map(event => event.text), ['It went back once.'])
  const done = answer.body.at(-1)
  assert.equal(done.type, 'done')
  assert.equal(done.messages.length, 2)
  assert.equal((await call()).body.messages[1].text, 'It went back once.')
  assert.deepEqual((await call('DELETE')).body.messages, [])
})

test('local dashboard without a key never calls Claude', async t => {
  const { call } = await serve(t, { anthropicApiKey: '' })
  assert.equal((await call()).body.configured, false)
  const result = await call('POST', { question: 'Hi' })
  assert.equal(result.status, 409)
  assert.match(result.body.error, /ANTHROPIC_API_KEY/)
})

test('hosted dashboard hands the question, run data and task lookup to the Worker', async t => {
  const { call } = await serve(t, { anthropicApiKey: 'key', manager: { traceArchive: true } })
  let result = await call()
  assert.equal(result.header, 'run-one')
  assert.deepEqual(result.body, { run_id: 'run-one' })
  result = await call('POST', { question: 'What happened?' })
  assert.equal(result.header, 'run-one')
  assert.equal(result.body.question, 'What happened?')
  assert.deepEqual(result.body.lookup.Muse['bestbuy-purchase-ps5'], { attempt_id: 'a1', trial_id: 't1' })
  assert.equal(result.body.input.agents.length, 2)
  assert.equal((await call('DELETE')).header, 'run-one')
})
