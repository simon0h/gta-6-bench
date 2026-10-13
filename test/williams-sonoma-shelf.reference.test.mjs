import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer } from './helpers.js'
import { shelf } from '../stores/williams-sonoma/shelf.js'
import store from '../stores/williams-sonoma/index.js'

test('Williams Sonoma shelf: full homepage, assortment search and a kind:other order', async () => {
  // The assortment is separate from the captured observations and has no games.
  assert.ok(shelf.length >= 150)
  assert.equal(store.catalog_observations.length, 192)
  assert.equal(store.gta6_available, false)
  assert.ok(shelf.every(p => !/grand theft auto|gta/i.test(p.title)))

  const server = await startServer()
  try {
    const client = server.client()
    const home = await client.get('/williams-sonoma/')
    assert.equal(home.status, 200)
    const ids = [...home.text.matchAll(/data-product-id="([^"]+)"/g)].map(m => m[1])
    const depts = new Set(ids.map(id => shelf.find(p => p.id === id)?.dept).filter(Boolean))
    assert.ok(ids.length >= 20, 'homepage shows product rows')
    assert.ok(depts.size >= 5, `homepage spans departments: ${[...depts]}`)

    const search = await client.get('/williams-sonoma/search/results.html?words=dutch+oven')
    assert.equal(search.status, 200)
    assert.match(search.text, /data-product-id="le-creuset-signature-enameled-cast-iron-round-dutch-oven"/)
    // The captured live "gta 6" search is unchanged and nothing matches Grand Theft Auto.
    assert.match((await client.get('/williams-sonoma/search/results.html?words=gta%206')).text, /198 search results/)
    assert.match((await client.get('/williams-sonoma/search/results.html?words=grand+theft+auto')).text, /data-result-count="0"/)

    const p = shelf.find(x => x.id === 'kitchenaid-artisan-tilt-head-stand-mixer')
    const page = await client.get('/williams-sonoma' + p.path)
    assert.match(page.text, /Add to Cart/)
    const cart = await client.post('/williams-sonoma/cart/add', { id: p.id, sku: p.sizes[0].sku, color: p.colors[1], qty: '2' })
    assert.equal(cart.status, 200)
    assert.match(cart.text, /Cart \(2\)/)
    const done = await client.post('/williams-sonoma/checkout/', { email: 'shopper@example.com', first_name: 'Ann', last_name: 'Lee', address: '1 Main St', city: 'Austin', state: 'TX', postal_code: '78701', shipping_method: 'standard', card_name: 'Ann Lee', card_number: '4242 4242 4242 4242', card_expiry: '12/30', card_cvv: '123' })
    assert.equal(done.status, 200)
    assert.match(done.text, /Your order has been placed/)
    const orders = await client.json('/api/orders?store=williams-sonoma')
    assert.equal(orders.length, 1)
    assert.deepEqual(orders[0].items.map(i => [i.kind, i.qty, i.sku]), [['other', 2, p.sizes[0].sku]])
    assert.equal(orders[0].payment.last4, '4242')
    assert.doesNotMatch(JSON.stringify(orders), /4242424242424242/)
    assert.match((await client.get('/williams-sonoma/cart/')).text, /Your cart is empty/)
  } finally { await server.close() }
})
