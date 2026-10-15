// Chewy reference-mode storefront assortment: homepage rows span several
// departments, search finds assortment items (but never a GTA 6 game), and an
// assortment item can be bought end to end as a kind:'other' order line.
import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer, fieldValue } from './helpers.js'
import { SHELF } from '../stores/chewy/shelf.js'

test('chewy shelf: homepage, search, cart and checkout', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    const home = await c.get('/chewy/')
    assert.equal(home.status, 200)
    const ids = [...home.text.matchAll(/data-shelf-product="(\d+)"/g)].map(m => m[1])
    assert.ok(new Set(ids).size >= 40, `homepage shows many products (${new Set(ids).size})`)
    const pets = new Set(ids.map(id => SHELF.find(p => p.id === id)?.pet))
    for (const pet of ['Dog', 'Cat', 'Fish']) assert.ok(pets.has(pet), `homepage includes ${pet} items`)
    assert.doesNotMatch(home.text, /Grand Theft Auto|GTA/i)

    const search = await c.get('/chewy/s?query=dog+food')
    assert.equal(search.status, 200)
    assert.match(search.text, /Results for “dog food”/)
    assert.ok((search.text.match(/data-product-kind="other"/g) || []).length >= 20)
    const gta = await c.get('/chewy/s?query=gta%206')
    assert.match(gta.text, /data-reference-state="uncaptured"/)
    assert.doesNotMatch(gta.text, /data-shelf-product=/)

    const category = await c.get('/chewy/b/litter-411?sort=Price%3A+Low+to+High')
    const prices = [...category.text.matchAll(/cw-card-price"><strong>\$([\d.]+)/g)].map(m => Number(m[1]))
    assert.ok(prices.length > 5)
    assert.deepEqual(prices, [...prices].sort((a, b) => a - b))

    const item = SHELF.find(p => p.id === '52404')
    const pdp = await c.get('/chewy' + item.path)
    assert.equal(pdp.status, 200)
    assert.match(pdp.text, /Add to Cart/)
    const added = await c.post('/chewy/app/cart/add', { id: item.id, size: '16-lb bag', purchase: 'buyonce', qty: '2' })
    assert.match(added.url, /\/chewy\/app\/cart$/)
    assert.match(added.text, /Proceed to Checkout/)
    assert.match(added.text, /Cart, 2 items/)

    const gate = await c.get('/chewy/app/checkout')
    assert.match(gate.url, /\/app\/login\?next=/)
    const page = await c.post('/chewy/app/login', { email: 'tester@example.com', password: 'Password123!', next: '/app/checkout' })
    assert.match(page.url, /\/chewy\/app\/checkout$/)
    const invalid = await c.post('/chewy/app/checkout', { checkout_token: fieldValue(page.text, 'checkout_token') })
    assert.equal(invalid.status, 400)
    assert.deepEqual(await c.json('/api/orders'), [])
    const done = await c.post('/chewy/app/checkout', {
      checkout_token: fieldValue(invalid.text, 'checkout_token'), first_name: 'Test', last_name: 'Shopper', address: '1 Main St', city: 'Plantation',
      state: 'FL', postal_code: '33324', phone: '9545550100', email: 'tester@example.com', card_name: 'Test Shopper',
      card_number: '4242424242424242', card_expiry: '12/30', card_cvv: '123',
    })
    assert.equal(done.status, 200)
    assert.match(done.text, /Thanks for your order/)
    const orders = await c.json('/api/orders')
    assert.equal(orders.length, 1)
    assert.equal(orders[0].store, 'chewy')
    assert.deepEqual(orders[0].items.map(i => [i.kind, i.qty, i.unit_price, i.sku]), [['other', 2, 54.48, '52404']])
    assert.doesNotMatch(JSON.stringify(orders), /4242424242424242/)
    assert.match((await c.get('/chewy/app/cart')).text, /Your cart is empty/)
  } finally { await srv.close() }
})
