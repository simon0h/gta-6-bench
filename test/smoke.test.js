import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer } from './helpers.js'

test('server boots, index lists stores, API responds', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    const home = await c.get('/')
    assert.equal(home.status, 200)
    const health = await c.json('/api/health')
    assert.equal(health.ok, true)
    const stores = await c.json('/api/stores')
    assert.ok(Array.isArray(stores))
    for (const s of stores) {
      const r = await c.get(s.url)
      assert.equal(r.status, 200, `${s.slug} home should render`)
      assert.match(r.text, /Synthetic benchmark environment/, `${s.slug} home must include the disclaimer footer`)
    }
    assert.deepEqual(await c.json('/api/orders'), [])
  } finally { await srv.close() }
})
