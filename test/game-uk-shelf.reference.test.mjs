import test from 'node:test'
import assert from 'node:assert/strict'
import { fixtureCatalog } from '../lib/catalog-policy.js'
import { startServer } from './helpers.js'

// Reference mode: GAME carries its everyday assortment around the evidence-backed GTA VI
// listings. The assortment browses and sells like the real store, and its orders are kind 'other'.
test('game-uk reference store shows a full assortment and sells it as non-game lines', async () => {
  assert.equal(fixtureCatalog, false, 'Run this suite with CATALOG_MODE=reference or unset')
  const data = await import('../stores/game-uk/data.js')
  const { inventory, assortment } = await import('../stores/game-uk/inventory.js')
  assert.deepEqual(inventory.map(i => i.id), ['756802', '400064'], 'inventory still lists only evidenced GTA VI rows')
  assert.ok(data.ASSORTMENT.length >= 150 && assortment.length === data.ASSORTMENT.length, 'assortment is a realistic size')
  assert.ok(data.ASSORTMENT.every(p => p.kind === 'other' && !p.catalogEvidence), 'assortment never becomes a GTA VI game line')

  const server = await startServer()
  try {
    const c = server.client()
    const home = await c.get('/game-uk/')
    assert.equal(home.status, 200)
    const rows = [...home.text.matchAll(/data-home-row="([^"]+)"/g)].map(m => m[1])
    for (const row of ['coming-soon', 'trending', 'deals', 'trading-cards', 'pc-gaming', 'lego', 'tech']) assert.ok(rows.includes(row), row)
    const departments = new Set(data.ASSORTMENT.filter(p => home.text.includes(`data-product-id="${p.id}"`)).map(p => p.departments[0]))
    assert.ok(departments.size >= 6, `homepage products span departments (${[...departments]})`)

    const results = await c.get('/game-uk/searchresults?descriptionfilter=headset')
    assert.match(results.text, /Turtle Beach Recon 70/)
    const gta = await c.get('/game-uk/searchresults?descriptionfilter=grand+theft+auto')
    const first = gta.text.match(/data-product-id="(\d+)"/)[1]
    assert.ok(['756802', '400064'].includes(first), 'GTA VI listings come first for a GTA search')

    const dept = await c.get('/game-uk/pc-gaming?sort=price-asc&brand=Razer')
    assert.equal(dept.status, 200)
    assert.match(dept.text, /We found \d+ products/)

    const item = data.ASSORTMENT.find(p => p.id === '384553')
    const pdp = await c.get(data.productPath('/game-uk', item))
    assert.equal(pdp.status, 200)
    assert.match(pdp.text, /Add to bag/)
    assert.equal((await c.get('/game-uk/images/products/384553/0.svg')).status, 200)
    await c.post('/game-uk/cart/add', { pid: item.id, qty: '1' })
    assert.match((await c.get('/game-uk/cart')).text, /DualSense Wireless Controller - Midnight Black/)

    await c.post('/game-uk/checkout/start')
    await c.post('/game-uk/account/login', { action: 'email', email: 'shelf@example.com', returnUrl: '/checkout' })
    await c.post('/game-uk/account/login', { action: 'guest', email: 'shelf@example.com', returnUrl: '/checkout' })
    await c.post('/game-uk/checkout/delivery', { title: 'Ms', firstName: 'Sam', lastName: 'Shopper', addressLine1: '1 High Street', town: 'Leeds', postcode: 'LS1 4AP', country: 'GB', mobile: '07700 900456', deliveryMethod: 'standard' })
    const placed = await c.post('/game-uk/checkout/payment', { paymentMethod: 'card', cardNumber: '4242424242424242', expiry: '12/39', cvv: '123', nameOnCard: 'Sam Shopper', billingSame: '1' })
    assert.match(placed.url, /\/checkout\/complete\?orderNumber=/)
    const orders = await c.json('/api/orders?store=game-uk')
    const order = orders.at(-1)
    assert.equal(order.items.length, 1)
    assert.deepEqual({ kind: order.items[0].kind, sku: order.items[0].sku }, { kind: 'other', sku: '384553' })
  } finally { await server.close() }
})
