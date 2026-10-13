import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer, fieldValue } from './helpers.js'
import { shelf } from '../stores/nike/shelf.js'

// The default reference catalog shows the nike.com assortment (shelf.js) beside,
// never instead of, the captured "gta 6" search: Nike sells no GTA 6, and shelf
// items are bought only as `kind: 'other'` lines.
test('nike shelf: homepage rows, search, category grid, product page and an other-kind order', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    const home = await c.get('/nike/')
    assert.equal(home.status, 200)
    assert.match(home.text, /data-reference-state="catalog"/)
    const ids = [...new Set([...home.text.matchAll(/data-shelf-product="([^"]+)"/g)].map(m => m[1]))]
    const kinds = new Set(ids.map(id => shelf.find(p => p.id === id)).map(p => `${p.g}/${p.cat}`))
    assert.ok(ids.length >= 48, `homepage shows many products (${ids.length})`)
    for (const cat of ['shoes', 'clothing', 'accessories']) assert.ok([...kinds].some(k => k.endsWith(cat)), cat)
    assert.ok(kinds.size >= 6, `homepage covers several departments (${[...kinds]})`)
    assert.doesNotMatch(home.text, /action="[^"]*\/(?:cart|checkout)/)

    const hoodies = await c.get('/nike/w?q=hoodie')
    assert.equal(hoodies.status, 200)
    assert.ok((hoodies.text.match(/data-shelf-product=/g) || []).length >= 8)
    assert.doesNotMatch(hoodies.text, /data-reference-state="uncaptured"/)
    // "gta 6" still shows nike.com's captured result and no shelf rows; GTA6 stays uncaptured.
    const gta = await c.get('/nike/w?q=gta%206')
    assert.equal((gta.text.match(/data-product-kind="other"/g) || []).length, 32)
    assert.doesNotMatch(gta.text, /data-shelf-product=/)
    assert.match((await c.get('/nike/w?q=GTA6')).text, /data-reference-state="uncaptured"/)

    const listing = await c.get('/nike/w/mens-shoes-nik1zy7ok?sort=Price%3A+Low-High&page=2')
    assert.equal(listing.status, 200)
    assert.match(listing.text, /<span aria-current="page">2<\/span>/)
    const prices = [...listing.text.matchAll(/class="nk-captured-price">\$([\d.]+)/g)].map(m => Number(m[1]))
    assert.deepEqual(prices, [...prices].sort((a, b) => a - b))
    const jordan = await c.get('/nike/w/mens-shoes-nik1zy7ok?brand=Jordan')
    const jordanIds = [...jordan.text.matchAll(/data-shelf-product="([^"]+)"/g)].map(m => shelf.find(p => p.id === m[1]))
    assert.ok(jordanIds.length > 0 && jordanIds.every(p => p.brand === 'Jordan'))

    const af1 = shelf.find(p => p.id === 'CW2288-111')
    assert.equal(af1.path, '/t/air-force-1-07-mens-shoes-jBrhbr/CW2288-111')
    const pdp = await c.get('/nike' + af1.path)
    assert.equal(pdp.status, 200)
    for (const s of ["Nike Air Force 1 &#39;07", 'Select Size', 'Add to Bag', 'Style: CW2288-111', 'Reviews (']) assert.ok(pdp.text.includes(s), s)
    assert.equal((await c.get('/nike/images/t_PDP/CW2288-111/0.svg')).headers.get('content-type').split(';')[0], 'image/svg+xml')

    const noSize = await c.post('/nike/cart/add', { style: 'CW2288-111', qty: '1' })
    assert.equal(noSize.status, 400)
    assert.match(noSize.text, /Please select a size/)
    const added = await c.post('/nike/cart/add', { style: 'CW2288-111', size: 'M 10 / W 11.5', qty: '2' })
    assert.match(added.text, /Added to Bag/)
    const bag = await c.get('/nike/cart')
    assert.match(bag.text, /data-bag-style="CW2288-111"/)
    assert.match(bag.text, /aria-label="Bag Items: 2"/)

    const checkout = await c.get('/nike/checkout')
    assert.equal(checkout.status, 200)
    const done = await c.post('/nike/checkout/order', { checkout_token: fieldValue(checkout.text, 'checkout_token'), email: 'shopper@example.com', phone: '503-555-0142', first_name: 'Sam', last_name: 'Rivera', address1: '1 Bowerman Dr', city: 'Beaverton', state: 'OR', postal_code: '97005', shipping: 'standard', card_name: 'Sam Rivera', card_number: '4111111111111111', card_expiry: '12/30', card_cvv: '123' })
    assert.equal(done.status, 200)
    assert.match(done.text, /Thanks for Your Order!/)
    const orders = await c.json('/api/orders?store=nike')
    assert.equal(orders.length, 1)
    assert.deepEqual(orders[0].items.map(i => [i.kind, i.sku, i.qty, i.unit_price]), [['other', 'CW2288-111', 2, 115]])
    assert.equal(orders[0].totals.total, 230)
    assert.match(orders[0].order_number, /^C0\d{10}$/)

    // Anything that is not a shelf style still reaches the read-only guard.
    for (const body of [{ id: 'running-shoes', qty: '1' }, { sku: 'CP-GTA6-PS5', qty: '1' }, { style: 'GTA6-PS5', size: 'M 10 / W 11.5' }]) {
      assert.equal((await c.post('/nike/cart/add', body, { follow: false })).status, 409)
    }
    assert.equal((await c.post('/nike/checkout/order', {}, { follow: false })).status, 409)
    assert.equal((await c.json('/api/orders?store=nike')).length, 1)
  } finally { await srv.close() }
})
