import test from 'node:test'
import assert from 'node:assert/strict'
import { CheckpointCoordinator, isStaticRequest, readBounded } from '../deploy/coordinator.js'

test('concurrent purchases commit individually before responses return', async () => {
  let current = [], committed = [], responseCount = 0
  const saved = []
  const coordinator = new CheckpointCoordinator({
    prepare: async () => {},
    forward: async request => {
      current.push(await request.text())
      await new Promise(resolve => setTimeout(resolve, 5))
      return new Response(String(current.length))
    },
    snapshot: async () => structuredClone(current),
    save: async state => { committed = state; saved.push([...state]) },
    invalidate: async () => { current = [...committed] },
  })
  const requests = ['first', 'second'].map(body => coordinator.fetch(new Request('https://bench.test/order', { method: 'POST', body })).then(async response => {
    responseCount++
    assert.ok(committed.length >= responseCount)
    return response.text()
  }))
  assert.deepEqual(await Promise.all(requests), ['1', '2'])
  assert.deepEqual(saved, [['first'], ['first', 'second']])
})

test('failed persistence discards uncommitted process state without replaying purchase', async () => {
  let current = 0, committed = 0, writes = 0, failures = 0
  const coordinator = new CheckpointCoordinator({
    prepare: async () => {},
    forward: async request => {
      if (request.method === 'POST') { current++; writes++ }
      return new Response(String(current))
    },
    snapshot: async () => current,
    save: async value => { if (!failures++) throw new Error('storage unavailable'); committed = value },
    invalidate: async () => { current = committed },
  })
  await assert.rejects(coordinator.fetch(new Request('https://bench.test/order', { method: 'POST' })), /storage unavailable/)
  const response = await coordinator.fetch(new Request('https://bench.test/cart'))
  assert.equal(await response.text(), '0')
  assert.equal(writes, 1)
})

test('GET session changes are checkpointed and HEAD responses remain bodyless', async () => {
  let snapshots = 0
  const coordinator = new CheckpointCoordinator({
    prepare: async () => {}, forward: async () => new Response(null),
    snapshot: async () => (++snapshots), save: async () => {}, invalidate: async () => {},
  })
  await coordinator.fetch(new Request('https://bench.test/amazon'))
  const response = await coordinator.fetch(new Request('https://bench.test/amazon', { method: 'HEAD' }))
  assert.equal(snapshots, 2)
  assert.equal(response.body, null)
})

test('state reads enforce size limits even without a content-length', async () => {
  await assert.rejects(readBounded(new Response('too large'), 2), /limit/)
  assert.equal(new TextDecoder().decode(await readBounded(new Response('ok'), 2)), 'ok')
})

test('only read-only static paths may bypass the checkpoint queue', () => {
  assert.equal(isStaticRequest(new Request('https://bench.test/static/product-gallery.js')), true)
  assert.equal(isStaticRequest(new Request('https://bench.test/amazon/static/style.css')), true)
  assert.equal(isStaticRequest(new Request('https://bench.test/amazon/static/style.css', { method: 'POST' })), false)
  assert.equal(isStaticRequest(new Request('https://bench.test/amazon/cart')), false)
  assert.equal(isStaticRequest(new Request('https://bench.test/amazon/static/style.css', { headers: { cookie: 'bench_attempt=secret' } })), false)
})
