import test from 'node:test'
import assert from 'node:assert/strict'
import { fixtureCatalog } from '../lib/catalog-policy.js'
import { startServer } from './helpers.js'

const ADDRESS = { firstName: 'Alex', lastName: 'Tester', address1: '123 Ocean Dr', city: 'Miami', stateCode: 'FL', postalCode: '33139', phone: '3055550123' }
const CARD = { paymentMethod: 'card', cardNumber: '4242424242424242', expirationMonthYear: '12/29', securityCode: '123' }

test('gamestop shelf: homepage, search and an ordinary purchase use the store assortment', async () => {
  assert.equal(fixtureCatalog, false, 'Run this suite with CATALOG_MODE=reference or unset')
  const data = await import('../stores/gamestop/data.js')
  assert.ok(data.SHELF.length >= 150, 'assortment is populated')
  assert.deepEqual(data.PRODUCTS.map(p => p.id), ['448295', '448297'], 'evidenced array stays GTA VI only')
  assert.ok(data.SHELF.every(p => p.kind === 'other' && !/grand theft auto vi\b/i.test(p.title)))

  const srv = await startServer()
  try {
    const c = srv.client()
    const home = await c.get('/gamestop/')
    const ids = [...home.text.matchAll(/data-product-id="([^"]+)"/g)].map(m => m[1])
    const departments = new Set(ids.map(id => data.byId(id)?.department).filter(Boolean))
    assert.ok(ids.length >= 40, `homepage shows many products (${ids.length})`)
    for (const d of ['video-games', 'consoles-hardware', 'gaming-accessories', 'toys-games/trading-cards', 'collectibles']) assert.ok(departments.has(d), d)
    assert.notEqual(ids[0], '448295')

    const gta = await c.get('/gamestop/search/?q=gta+6')
    const gtaIds = [...gta.text.matchAll(/data-product-id="([^"]+)"/g)].map(m => m[1])
    assert.deepEqual(gtaIds.slice(0, 2), ['448295', '448297'])
    const gtaLong = await c.get('/gamestop/search/?q=grand+theft+auto')
    assert.deepEqual([...gtaLong.text.matchAll(/data-product-id="([^"]+)"/g)].map(m => m[1]).slice(0, 2), ['448295', '448297'])

    const results = await c.get('/gamestop/search/?q=controller')
    const found = [...results.text.matchAll(/data-product-id="([^"]+)"/g)].map(m => m[1])
    assert.ok(found.length >= 10 && found.every(id => data.byId(id)?.shelf))
    const link = /href="(\/gamestop\/gaming-accessories\/controllers\/products\/[^"?]+\/10200401\.html)(?:\?[^"]*)?"/.exec(results.text)
    assert.ok(link, 'Xbox controller is listed with a gamestop.com style URL')

    const pdp = await c.get(link[1])
    assert.equal(pdp.status, 200)
    assert.match(pdp.text, /Microsoft Xbox Wireless Controller - Carbon Black/)
    assert.match(pdp.text, /Add to Cart/)
    const image = /src="(\/gamestop\/shelf-assets\/10200401\/0\.svg)"/.exec(pdp.text)
    assert.ok(image)
    const svg = await fetch(srv.base + image[1])
    assert.equal(svg.status, 200)
    assert.match(svg.headers.get('content-type'), /image\/svg\+xml/)

    await c.post('/gamestop/cart/add', { pid: '10200401', variant: 'new' })
    const cart = await c.get('/gamestop/cart/')
    assert.match(cart.text, /Ship To Home: 1 Item/)
    await c.post('/gamestop/checkout/start')
    await c.post('/gamestop/mrt/checkout/contact', { email: 'alex@example.com', customerName: 'Alex Tester', c_phone: ADDRESS.phone })
    const done = await c.post('/gamestop/checkout/', { email: 'alex@example.com', ...ADDRESS, shippingMethod: 'premium', ...CARD, billingSame: '1' })
    assert.match(done.text, /Thank you for your order!/)
    const [order] = await c.json('/api/orders?store=gamestop')
    assert.deepEqual(order.items, [{ kind: 'other', title: 'Microsoft Xbox Wireless Controller - Carbon Black', qty: 1, unit_price: 64.99, sku: '10200401' }])
  } finally {
    await srv.close()
  }
})
