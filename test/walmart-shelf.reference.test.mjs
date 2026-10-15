import test from 'node:test'
import assert from 'node:assert/strict'
import { fixtureCatalog } from '../lib/catalog-policy.js'
import { startServer, fieldValue } from './helpers.js'

// Reference mode: walmart.com carries its everyday assortment around the evidence-backed GTA VI
// listings. The assortment browses and sells like the real store, and its orders are kind 'other'.
test('walmart reference store shows a full assortment and sells it as non-game lines', async () => {
  assert.equal(fixtureCatalog, false, 'Run this suite with CATALOG_MODE=reference or unset')
  const data = await import('../stores/walmart/data.js')
  const { inventory } = await import('../stores/walmart/inventory.js')
  assert.deepEqual(inventory.map(i => i.id), ['20482917228', '20459958275'], 'inventory still lists only evidenced GTA VI rows')
  assert.ok(data.ASSORTMENT.length >= 150, 'assortment is a realistic size')
  assert.ok(data.ASSORTMENT.every(p => p.kind === 'other' && !p.catalogEvidence), 'assortment never becomes a GTA VI game line')

  const server = await startServer()
  try {
    const c = server.client()
    const home = await c.get('/walmart/')
    assert.equal(home.status, 200)
    const rows = [...home.text.matchAll(/data-home-row="([^"]+)"/g)].map(m => m[1])
    assert.ok(rows.length >= 6, 'several product rows on the homepage')
    for (const row of ['household', 'electronics', 'groceries', 'video-games']) assert.ok(rows.includes(row), row)
    const departments = new Set(data.ASSORTMENT.filter(p => home.text.includes(`/${p.id}?`) || home.text.includes(`/${p.id}"`)).map(p => p.department))
    assert.ok(departments.size >= 6, `homepage products span departments (${[...departments]})`)

    const results = await c.get('/walmart/search?q=paper+towels')
    assert.match(results.text, /Bounty Select-A-Size Paper Towels/)
    const gta = await c.get('/walmart/search?q=gta+6')
    assert.ok(gta.text.indexOf('Grand Theft Auto VI, PlayStation 5') > 0)

    const dept = await c.get('/walmart/cp/electronics/3944?sort=price_low')
    assert.equal(dept.status, 200)
    assert.match(dept.text, /Shop all Electronics<span>\(\d{2,}\)/)

    const item = data.ASSORTMENT.find(p => p.title.startsWith('Ninja Air Fryer'))
    const pdp = await c.get(data.productPath('/walmart', item))
    assert.equal(pdp.status, 200)
    assert.match(pdp.text, /Add to cart/)
    const added = await c.post('/walmart/cart/add', { pid: item.id })
    assert.equal(added.status, 200)
    assert.match((await c.get('/walmart/cart')).text, /Ninja Air Fryer/)

    await c.post('/walmart/account/login', { identifier: 'shelf.shopper@example.com' })
    await c.post('/walmart/account/sign-up', { firstName: 'Sam', lastName: 'Shopper', email: 'shelf.shopper@example.com', phone: '4025550142', password: 'Password123!' })
    await c.post('/walmart/checkout/address', { firstName: 'Sam', lastName: 'Shopper', address1: '100 Main St', city: 'Omaha', state: 'NE', zip: '68116', phone: '4025550142' })
    await c.post('/walmart/checkout/payment', { method: 'card', cardNumber: '4242424242424242', expMonth: '12', expYear: '35', cvv: '123', firstName: 'Sam', lastName: 'Shopper', phone: '4025550142', billingSame: '1' })
    const review = await c.get('/walmart/checkout/review-order')
    const placed = await c.post('/walmart/checkout/place-order', { review_token: fieldValue(review.text, 'review_token') })
    assert.equal(placed.status, 200)
    assert.match(placed.url, /\/thankyou\?order=/)
    const orders = await c.json('/api/orders?store=walmart')
    const order = orders.at(-1)
    assert.equal(order.items.length, 1)
    assert.deepEqual({ kind: order.items[0].kind, sku: order.items[0].sku }, { kind: 'other', sku: item.id })
  } finally { await server.close() }
})
