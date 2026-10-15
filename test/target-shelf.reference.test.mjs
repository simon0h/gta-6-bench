import test from 'node:test'
import assert from 'node:assert/strict'
import { fixtureCatalog } from '../lib/catalog-policy.js'
import { startServer } from './helpers.js'

// Reference mode shows Target's everyday assortment (stores/target/shelf.js) beside the
// evidenced GTA VI rows. The assortment is buyable only as kind:'other' order lines.
test('Target reference storefront is stocked like target.com and assortment orders are kind other', async () => {
  assert.equal(fixtureCatalog, false, 'Run this suite with CATALOG_MODE=reference or unset')
  const { SHELF } = await import('../stores/target/shelf.js')
  const data = await import('../stores/target/data.js')
  assert.ok(SHELF.length >= 150, 'assortment size')
  assert.deepEqual(data.PRODUCTS.map(p => p.tcin), ['1011529119', '1011545811', '1013468584'], 'evidenced rows stay separate')
  const server = await startServer()
  try {
    const c = server.client()
    const home = await c.get('/target/')
    assert.equal(home.status, 200)
    const tcins = [...home.text.matchAll(/data-tcin="(\d+)"/g)].map(m => m[1])
    const departments = new Set(tcins.map(t => SHELF.find(p => p.tcin === t)?.department).filter(Boolean))
    assert.ok(departments.size >= 6, `homepage departments: ${[...departments]}`)
    assert.ok(!tcins.includes('1011529119') && !tcins.includes('1011545811'), 'homepage is not a GTA VI landing page')

    const search = await c.get('/target/s?searchTerm=headphones')
    assert.match(search.text, /Beats Studio Pro/)
    const gta = await c.get('/target/s?searchTerm=gta+6')
    assert.match(gta.text.match(/class="tg-tile-title"[^>]*>([^<]*)/)[1], /^Grand Theft Auto VI/)

    const tv = SHELF.find(p => /S90D/.test(p.title))
    assert.equal((await c.get(`/target/p/${tv.slug}/-/A-${tv.tcin}`)).status, 200)
    assert.equal((await c.get(`/target/shelf-art/${tv.tcin}/0.svg`)).status, 200)
    assert.ok((await c.post('/target/cart/add', { tcin: tv.tcin, qty: '1' })).status < 400)
    await c.post('/target/login', { email: 'tester@example.com', password: 'Password123!' })
    await c.post('/target/checkout/shipping', { firstName: 'Alex', lastName: 'Tester', address1: '1 Main St', zip: '95065', city: 'Scotts Valley', state: 'CA', phone: '8315551234' })
    await c.post('/target/checkout/payment', { paymentType: 'card', cardNumber: '4111111111111111', expiry: '12/35', cvv: '123', nameOnCard: 'Alex Tester', billingSame: '1' })
    const placed = await c.post('/target/checkout/place-order', {})
    assert.match(placed.text, /Order confirmation|Thanks for your order|order/i)
    const orders = await c.json('/api/orders?store=target')
    assert.equal(orders.length, 1)
    assert.deepEqual(orders[0].items.map(i => [i.kind, i.sku]), [['other', tv.tcin]])
  } finally { await server.close() }
})
