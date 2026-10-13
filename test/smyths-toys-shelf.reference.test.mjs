import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer, fieldValue } from './helpers.js'

const R = '/smyths-toys/uk/en-gb'

test('Smyths reference homepage is a full shop floor, not a GTA-only page', async () => {
  const srv = await startServer()
  try {
    const c = srv.client(), home = await c.get(R)
    assert.equal(home.status, 200)
    const skus = [...home.text.matchAll(/data-sku="(\d+)"/g)].map(m => m[1])
    assert.ok(new Set(skus).size >= 30, `only ${new Set(skus).size} products on the homepage`)
    for (const dept of ['Toys', 'Baby Room', 'Gaming & Tech']) assert.ok((await import('../stores/smyths-toys/shelf.js')).shelfProducts.some(p => p.department === dept && skus.includes(p.sku)), dept)
    assert.match(home.text, /Barbie Dream Plane/)
    assert.match(home.text, /Graco Miravi Compact Stroller/)
    assert.match(home.text, /Nintendo Switch 2 Console/)
    assert.ok(skus.filter(s => s === '263307' || s === '263308').length <= 2, 'GTA VI is one product among many')
    const pic = /src="(\/smyths-toys\/uk\/en-gb\/medias\/[^"]+)"/.exec(home.text)[1]
    const img = await c.get(pic)
    assert.equal(img.status, 200)
    assert.match(img.headers.get('content-type'), /svg/)
  } finally { await srv.close() }
})

test('Smyths search mixes the assortment and still ranks GTA VI first for GTA queries', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    const lego = await c.get(`${R}/search?text=lego`)
    assert.ok(Number(/data-result-count="(\d+)"/.exec(lego.text)[1]) >= 15)
    assert.match(lego.text, /LEGO Classic 10698/)
    for (const q of ['gta 6', 'grand theft auto']) {
      const r = await c.get(`${R}/search?text=${encodeURIComponent(q)}`)
      const first = /data-sku="(\d+)"/.exec(r.text)[1]
      assert.ok(['263307', '263308'].includes(first), `${q}: ${first}`)
    }
    const ps5 = await c.get(`${R}/search?text=ps5`)
    assert.match(ps5.text, /Grand Theft Auto VI PS5/)
    assert.match(ps5.text, /DualSense/)
    const dept = await c.get(`${R}/baby/c/SM0602`)
    assert.ok(Number(/data-result-count="(\d+)"/.exec(dept.text)[1]) >= 30)
  } finally { await srv.close() }
})

test('Smyths assortment items can be ordered as kind other while GTA VI stays read-only', async () => {
  const srv = await startServer()
  try {
    srv.reset()
    const c = srv.client()
    const gta = await c.post(`${R}/cart/add`, { sku: '263307', qty: '1' }, { follow: false })
    assert.equal(gta.status, 409)
    const pdp = await c.get(`${R}/toys/lego-and-bricks/lego-classic/lego-classic-10698-large-creative-brick-box-classic-building-bricks-set/p/141295`)
    assert.equal(pdp.status, 200)
    assert.match(pdp.text, /Add to Basket/)
    assert.match((await c.post(`${R}/cart/add`, { sku: '141295', qty: '2' })).text, /LEGO Classic 10698/)
    await c.post(`${R}/checkout`, { action: 'guest', email: 'shopper@example.com' })
    await c.post(`${R}/checkout/method`, { method: 'ship', action: 'continue' })
    await c.post(`${R}/checkout/details`, { email: 'shopper@example.com', phone: '07700 900123', first_name: 'Sam', last_name: 'Shopper', line1: '1 High Street', city: 'London', postal_code: 'E6 6LG', country: 'GB', delivery_option: 'standard' })
    const review = await c.post(`${R}/checkout/payment`, { payment_method: 'card', card_number: '4242424242424242', expiry: '12/30', cvv: '123', name_on_card: 'Sam Shopper', billing_same: '1' })
    const done = await c.post(`${R}/checkout/place-order`, { terms: '1', token: fieldValue(review.text, 'token') })
    assert.match(done.text, /Thank you for your order/)
    const orders = await c.json('/api/orders?store=smyths-toys')
    assert.equal(orders.length, 1)
    assert.deepEqual(orders[0].items.map(i => [i.kind, i.sku, i.qty, i.unit_price]), [['other', '141295', 2, 34.99]])
    // A GTA line can never join the basket, so checkout stays closed for it.
    assert.equal((await c.post(`${R}/cart/add`, { sku: '263308', qty: '1' }, { follow: false })).status, 409)
  } finally { await srv.close() }
})
