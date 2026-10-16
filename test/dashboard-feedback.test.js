import test from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import express from 'express'
import { FEEDBACK_HEADER, FEEDBACK_LIMITS, applyFeedback, feedbackOperation } from '../benchmark/feedback.js'
import { createDashboardRouter } from '../dashboard/router.js'

const pin = { page: '/bestbuy/cart', title: 'Cart', text: '  The checkout button is too small.  ', selector: 'body > main:nth-of-type(1)', element: 'Button “Checkout”', x: 120.4, y: 900, dx: 0.25, dy: 0.5, width: 390, device: 'phone' }

test('requests become checked operations', () => {
  assert.deepEqual(feedbackOperation('GET'), { op: 'list' })
  const add = feedbackOperation('POST', undefined, pin)
  assert.equal(add.op, 'add')
  assert.equal(add.comment.text, 'The checkout button is too small.')
  assert.equal(add.comment.page, '/bestbuy/cart')
  assert.equal(add.comment.device, 'phone')
  assert.equal(feedbackOperation('POST', undefined, { ...pin, device: 'tv' }).comment.device, '')
  assert.deepEqual(feedbackOperation('PATCH', 'note-0001', { resolved: true }), { op: 'update', id: 'note-0001', changes: { resolved: true } })
  assert.deepEqual(feedbackOperation('DELETE', 'note-0001'), { op: 'delete', id: 'note-0001' })
  for (const body of [{ ...pin, text: '   ' }, { ...pin, page: 'https://example.com/' }, { ...pin, page: '//evil.example/x' }, { ...pin, text: 'x'.repeat(FEEDBACK_LIMITS.text + 1) }, { ...pin, dx: 2 }]) {
    assert.throws(() => feedbackOperation('POST', undefined, body), error => error.status === 400)
  }
  assert.throws(() => feedbackOperation('PATCH', 'note-0001', {}), /Nothing to change/)
  assert.throws(() => feedbackOperation('PATCH', 'note-0001', { resolved: 'yes' }), /true or false/)
  assert.throws(() => feedbackOperation('DELETE', '../x'), error => error.status === 404)
})

test('notes are numbered in order, edited, resolved and removed', () => {
  let ids = 0
  const options = { now: '2026-10-16T05:00:00.000Z', newId: () => `note-000${++ids}` }
  let { comments, changed } = applyFeedback([], feedbackOperation('POST', undefined, pin), options)
  assert.equal(changed.number, 1)
  assert.equal(changed.resolved, false)
  ;({ comments } = applyFeedback(comments, feedbackOperation('POST', undefined, { ...pin, page: '/walmart' }), options))
  assert.deepEqual(comments.map(note => note.number), [1, 2])
  ;({ comments, changed } = applyFeedback(comments, feedbackOperation('PATCH', 'note-0001', { resolved: true, text: 'Fixed' }), options))
  assert.equal(changed.resolved, true)
  assert.equal(changed.text, 'Fixed')
  const removed = applyFeedback(comments, feedbackOperation('DELETE', 'note-0001'), options)
  assert.equal(removed.removed, 'note-0001')
  assert.deepEqual(removed.comments.map(note => note.number), [2])
  assert.equal(applyFeedback(removed.comments, feedbackOperation('POST', undefined, pin), options).changed.number, 3, 'numbers are never reused')
  assert.throws(() => applyFeedback(comments, feedbackOperation('DELETE', 'note-9999')), error => error.status === 404)
  const full = Array.from({ length: FEEDBACK_LIMITS.comments }, (_, index) => ({ id: `n${index}`, number: index + 1 }))
  assert.throws(() => applyFeedback(full, feedbackOperation('POST', undefined, pin)), error => error.status === 409)
})

async function serve(t, options = {}) {
  const app = express().use(createDashboardRouter({ local: true, manager: {}, ...options }))
  const server = await new Promise(resolve => { const value = http.createServer(app).listen(0, '127.0.0.1', () => resolve(value)) })
  t.after(() => new Promise(resolve => server.close(resolve)))
  const base = `http://localhost:${server.address().port}/dashboard/api/feedback`
  return async (path = '', method = 'GET', body, headers = {}) => {
    const response = await fetch(`${base}${path}`, { method, headers: { ...(body ? { 'content-type': 'application/json' } : {}), ...headers }, ...(body ? { body: JSON.stringify(body) } : {}) })
    return { status: response.status, header: response.headers.get(FEEDBACK_HEADER), body: await response.json() }
  }
}

test('the local dashboard keeps notes in memory', async t => {
  const call = await serve(t)
  assert.deepEqual((await call()).body, { comments: [], agent_browser: false })
  const added = await call('', 'POST', pin)
  assert.equal(added.status, 201)
  const [note] = added.body.comments
  assert.equal(note.text, 'The checkout button is too small.')
  assert.equal((await call(`/${note.id}`, 'PATCH', { resolved: true })).body.comments[0].resolved, true)
  assert.equal((await call('', 'POST', { ...pin, text: '' })).status, 400)
  assert.equal((await call(`/${note.id}`, 'DELETE')).body.comments.length, 0)
  assert.equal((await call(`/${note.id}`, 'DELETE')).status, 404)
  assert.equal((await call('', 'GET', undefined, { cookie: 'bench_attempt=abc' })).body.agent_browser, true, 'a browser holding an agent link is flagged')
})

test('on Cloudflare Node only checks sign-in and hands the operation to the Worker', async t => {
  const call = await serve(t, { local: false, apiToken: 'x'.repeat(32), manager: { traceArchive: true } })
  assert.equal((await call()).status, 401)
  const result = await call('', 'POST', pin, { authorization: `Bearer ${'x'.repeat(32)}` })
  assert.equal(result.status, 200)
  assert.equal(result.header, '1')
  assert.equal(result.body.op, 'add')
  assert.equal(result.body.comment.text, 'The checkout button is too small.')
})
