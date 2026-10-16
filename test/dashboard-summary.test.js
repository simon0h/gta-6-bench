import test from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import express from 'express'
import Anthropic from '@anthropic-ai/sdk'
import { SUMMARY_HEADER, SUMMARY_MODEL, summaryInput, summaryKey, summaryView, writeRunSummary } from '../benchmark/ai-summary.js'
import { createDashboardRouter } from '../dashboard/router.js'

const trial = (id, status, extra = {}) => ({
  id, task_id: `task-${id}`, status: 'completed',
  result: { store: 'bestbuy', family: 'budget_decline', elapsed_ms: 61_400, grade: { status, reasons: status === 'passed' ? [] : [{ code: 'final_outcome_mismatch', message: 'The final claim contradicts the required outcome.' }] },
    expected_output: ['Do not buy: the cheapest total is over the spending limit'], actual_output: ['Bought 1 copy, paid with card 4111 1111 1111 1111'],
    failure_reasons: status === 'passed' ? [] : ['The agent bought the game, but it should have refused.'], ...extra },
})
function sampleRun() {
  return {
    id: 'run-one', name: 'Monday run', suite: 'original30', task_ids: Array.from({ length: 30 }, (_, index) => `t${index}`),
    attempts: [
      { id: 'a1', agent: 'muse', tags: ['v2'], comments: 'Muse 2 at default settings', total: 30, trials: [trial(1, 'passed'), trial(2, 'failed'), { id: 'running', task_id: 'task-3', status: 'running', result: null }] },
      { id: 'a2', agent: 'muse', tags: [], comments: '', total: 30, trials: [] },
      { id: 'a3', agent: 'dots', tags: [], comments: '', total: 30, trials: [trial(4, 'environment_error')] },
    ],
  }
}
const reply = { overview: 'Muse passed 1 of 2.', agents: [{ label: 'Muse (URL 1)', summary: 'Bought when it should have refused.' }, { label: 'Dots', summary: 'One setup error.' }], patterns: ['Budget refusals are the weak spot.'] }
const message = (text, stop_reason = 'end_turn') => ({ id: 'msg_1', type: 'message', role: 'assistant', model: SUMMARY_MODEL, content: [{ type: 'text', text }], stop_reason, stop_sequence: null, usage: { input_tokens: 10, output_tokens: 10 } })

test('summary input keeps passed tasks short, explains the rest and hides card numbers', () => {
  const input = summaryInput(sampleRun())
  assert.deepEqual(input.agents.map(agent => agent.label), ['Muse (URL 1)', 'Muse (URL 2)', 'Dots'])
  const muse = input.agents[0]
  assert.equal(muse.finished, 2)
  assert.equal(muse.passed, 1)
  assert.equal(muse.failed, 1)
  assert.equal(muse.total_seconds, 123)
  assert.deepEqual(muse.tasks[0], { task: 'task-1', store: 'bestbuy', type: 'budget 1 cent short (should refuse)', result: 'passed', seconds: 61 })
  assert.deepEqual(muse.tasks[1].failure_reasons, ['The agent bought the game, but it should have refused.'])
  assert.match(muse.tasks[1].actual[0], /\[card number\]/)
  assert.doesNotMatch(JSON.stringify(input), /4111/)
  assert.equal(input.agents[2].environment_errors, 1)
})

test('summary key changes when results change', async () => {
  const run = sampleRun(), before = await summaryKey(summaryInput(run))
  run.attempts[1].trials.push(trial(5, 'passed'))
  assert.notEqual(await summaryKey(summaryInput(run)), before)
})

test('Claude is asked for structured output with fallbacks, and the reply is mapped to agents', async () => {
  let request
  const client = { beta: { messages: { create: async params => { request = params; return message(JSON.stringify(reply)) } } } }
  const input = summaryInput(sampleRun())
  const summary = await writeRunSummary({ input, client })
  assert.equal(request.model, 'claude-opus-5-5')
  assert.equal(request.fallbacks, 'default')
  assert.deepEqual(request.betas, ['server-side-fallback-2026-07-01'])
  assert.equal(request.output_config.format.type, 'json_schema')
  assert.equal(request.thinking, undefined)
  assert.match(request.messages[0].content, /Monday run/)
  assert.deepEqual(summary.agents.map(agent => agent.agent), ['muse', 'dots'])
  assert.deepEqual(summary.patterns, ['Budget refusals are the weak spot.'])
})

test('Claude failures become plain messages', async () => {
  const input = summaryInput(sampleRun())
  const failing = error => ({ beta: { messages: { create: async () => { throw error } } } })
  await assert.rejects(writeRunSummary({ input, client: failing(new Anthropic.AuthenticationError(401, {}, 'bad key', new Headers())) }), { status: 502, message: /rejected the API key/ })
  await assert.rejects(writeRunSummary({ input, client: failing(new Anthropic.RateLimitError(429, {}, 'slow down', new Headers())) }), { status: 503, message: /busy/ })
  await assert.rejects(writeRunSummary({ input, client: { beta: { messages: { create: async () => message('', 'refusal') } } } }), /declined/)
  await assert.rejects(writeRunSummary({ input, client: { beta: { messages: { create: async () => message('not json') } } } }), /could not read/)
})

test('summary view reports stale summaries', () => {
  const saved = { key: 'old', finished: 2, summary: reply, written_at: '2026-10-16T02:00:00.000Z' }
  assert.deepEqual(summaryView({ configured: true, saved, key: 'new', finished: 3 }), { configured: true, finished: 3, summary: reply, written_at: saved.written_at, written_from: 2, stale: true })
  assert.equal(summaryView({ configured: false, saved: null, key: 'k', finished: 0 }).summary, null)
})

async function serve(t, options) {
  const run = sampleRun()
  const manager = { getRun: async id => id === run.id ? run : null, ...options.manager }
  const app = express().use(createDashboardRouter({ local: true, ...options, manager }))
  const server = await new Promise(resolve => { const value = http.createServer(app).listen(0, '127.0.0.1', () => resolve(value)) })
  t.after(() => new Promise(resolve => server.close(resolve)))
  const base = `http://localhost:${server.address().port}/dashboard/api/runs`
  const call = async (path, method = 'GET') => {
    const response = await fetch(`${base}${path}`, { method })
    return { status: response.status, header: response.headers.get(SUMMARY_HEADER), body: await response.json() }
  }
  return { run, call }
}

test('local dashboard writes, keeps and marks summaries stale', async t => {
  const calls = []
  const { run, call } = await serve(t, { anthropicApiKey: 'key', writeSummary: async ({ apiKey, input }) => { calls.push({ apiKey, input }); return reply } })
  let result = await call('/run-one/summary')
  assert.equal(result.status, 200)
  assert.equal(result.body.configured, true)
  assert.equal(result.body.finished, 3)
  assert.equal(result.body.summary, null)
  result = await call('/run-one/summary', 'POST')
  assert.equal(result.status, 200)
  assert.deepEqual(result.body.summary, reply)
  assert.equal(calls[0].apiKey, 'key')
  assert.equal(calls[0].input.agents.length, 3)
  assert.equal((await call('/run-one/summary')).body.stale, false)
  run.attempts[1].trials.push(trial(6, 'passed'))
  result = await call('/run-one/summary')
  assert.equal(result.body.stale, true)
  assert.equal(result.body.finished, 4)
  assert.equal(result.body.written_from, 3)
  assert.equal((await call('/missing/summary')).status, 404)
})

test('local dashboard without a key explains how to turn summaries on', async t => {
  const { call } = await serve(t, { anthropicApiKey: '', writeSummary: async () => assert.fail('must not call Claude') })
  assert.equal((await call('/run-one/summary')).body.configured, false)
  const result = await call('/run-one/summary', 'POST')
  assert.equal(result.status, 409)
  assert.match(result.body.error, /ANTHROPIC_API_KEY/)
})

test('a run with no finished tasks cannot be summarized', async t => {
  const empty = { id: 'run-one', suite: 'original30', task_ids: [], attempts: [] }
  const { call } = await serve(t, { anthropicApiKey: 'key', manager: { getRun: async () => empty }, writeSummary: async () => assert.fail('must not call Claude') })
  const result = await call('/run-one/summary', 'POST')
  assert.equal(result.status, 409)
})

test('hosted dashboard hands the run data to the Worker instead of calling Claude', async t => {
  const { call } = await serve(t, { anthropicApiKey: 'key', manager: { traceArchive: true }, writeSummary: async () => assert.fail('the container never calls Claude') })
  let result = await call('/run-one/summary')
  assert.equal(result.header, 'run-one')
  assert.deepEqual(Object.keys(result.body).sort(), ['finished', 'key', 'run_id'])
  result = await call('/run-one/summary', 'POST')
  assert.equal(result.header, 'run-one')
  assert.equal(result.body.input.agents.length, 3)
})
