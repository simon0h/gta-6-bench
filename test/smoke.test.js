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

test('a ?run= tag on any store URL is stamped on the orders that session places', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    await c.get('/gamestop?run=muse-01')
    await c.post('/gamestop/cart/add', { pid: '448295' })
    await c.post('/gamestop/checkout/login/', { action: 'guest' })
    await c.post('/gamestop/checkout/', {
      email: 'run@example.com', firstName: 'Run', lastName: 'Tag', address1: '1 Main St', city: 'Austin', stateCode: 'TX',
      postalCode: '78701', phone: '5125550100', shippingMethod: 'premium', paymentMethod: 'card',
      cardNumber: '4242424242424242', expirationMonthYear: '12/29', securityCode: '123', billingSame: '1',
    })
    const tagged = await c.json('/api/orders?run=muse-01')
    assert.equal(tagged.length, 1)
    assert.equal(tagged[0].run_id, 'muse-01')
    assert.deepEqual(await c.json('/api/orders?run=someone-else'), [])
  } finally { await srv.close() }
})
