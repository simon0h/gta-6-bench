import test from 'node:test'
import assert from 'node:assert/strict'
import { fixtureCatalog } from '../lib/catalog-policy.js'
import { startServer } from './helpers.js'

// Reference mode shows a full IKEA US assortment (stores/ikea/shelf.js). IKEA sells no
// GTA 6: the captured catalog stays empty and GTA searches keep their old answers. Shelf
// items are bought only as `kind: 'other'` order lines; GTA SKUs still meet the 409 guard.
test('ikea shelf: homepage departments, search, category filters and a kind-other order', async () => {
  assert.equal(fixtureCatalog, false, 'Run this suite with CATALOG_MODE=reference or unset')
  const { shelf } = await import('../stores/ikea/shelf.js')
  const ikea = (await import('../stores/ikea/index.js')).default
  assert.ok(shelf.length >= 150, 'assortment size')
  assert.equal(ikea.catalog_observations.length, 0, 'no GTA 6 observations')
  assert.equal(ikea.gta6_available, false)
  const srv = await startServer()
  try {
    const c = srv.client()
    const home = await c.get('/ikea')
    assert.equal(home.status, 200)
    assert.match(home.text, /data-reference-state="catalog"/)
    const ids = [...home.text.matchAll(/data-shelf-product="(\d+)"/g)].map(m => m[1])
    const depts = new Set(ids.map(id => shelf.find(p => p.id === id).dept))
    assert.ok(ids.length >= 40, `homepage shows many products (${ids.length})`)
    assert.ok(depts.size >= 8, `homepage covers several departments (${depts.size})`)

    const desk = await c.get('/ikea/us/en/search/?q=desk')
    assert.equal(desk.status, 200)
    assert.match(desk.text, /MICKE/)
    assert.ok((desk.text.match(/data-product-kind="other"/g) || []).length >= 10)
    const gta = await c.get('/ikea/us/en/search/?q=gta%206')
    assert.match(gta.text, /We found 0 products and 0 content results/)
    assert.doesNotMatch(gta.text, /data-shelf-product/)
    const gtaLong = await c.get('/ikea/us/en/search/?q=grand%20theft%20auto')
    assert.match(gtaLong.text, /data-reference-state="uncaptured"/)

    const cat = await c.get('/ikea/us/en/cat/storage-organization-st001/?sort=PRICE_LOW_TO_HIGH&color=white&color=black&page=2')
    assert.equal(cat.status, 200)
    const prices = [...cat.text.matchAll(/data-shelf-product="(\d+)"/g)].map(m => shelf.find(p => p.id === m[1]))
    assert.ok(prices.length > 24 && prices.every(p => ['white', 'black'].includes(p.color)))
    assert.deepEqual(prices.map(p => p.price), [...prices.map(p => p.price)].sort((a, b) => a - b))

    const billy = shelf.find(p => p.artNo === '002.638.50')
    const page = await c.get('/ikea' + billy.path)
    assert.equal(page.status, 200)
    assert.match(page.text, /Add to bag/)
    assert.match(page.text, /002\.638\.50/)
    const img = await c.get(`/ikea/us/en/images/products/${billy.id}-0.svg`)
    assert.equal(img.status, 200)

    await c.post('/ikea/cart/add', { sku: billy.sku, qty: '2' })
    const bag = await c.get('/ikea/us/en/shoppingcart/')
    assert.match(bag.text, new RegExp(`data-cart-sku="${billy.sku}"`))
    const checkout = await c.get('/ikea/us/en/checkout/')
    assert.equal(checkout.status, 200)
    const token = checkout.text.match(/name="checkout_token" value="([^"]+)"/)[1]
    const done = await c.post('/ikea/us/en/checkout/place/', { checkout_token: token, email: 'shelf@example.com', phone: '(312) 555-0142', fulfillment: 'delivery',
      first_name: 'Alex', last_name: 'Berg', address: '1 Main St', city: 'Chicago', state: 'IL', postal_code: '60601',
      card_name: 'Alex Berg', card_number: '4111111111111111', card_expiry: '12/30', card_cvv: '123' })
    assert.equal(done.status, 200)
    assert.match(done.text, /Thank you for your order/)
    const orders = await c.json('/api/orders?store=ikea')
    assert.equal(orders.length, 1)
    assert.deepEqual(orders[0].items.map(i => [i.kind, i.sku, i.qty, i.unit_price]), [['other', billy.sku, 2, billy.price]])
    assert.equal((await c.get('/ikea/us/en/shoppingcart/')).text.includes('Your bag is empty'), true)

    // GTA fixture SKUs and legacy ids remain read-only.
    assert.equal((await c.post('/ikea/cart/add', { sku: 'CP-GTA6-PS5', qty: '1' }, { follow: false })).status, 409)
    assert.equal((await c.post('/ikea/cart/add', { id: 'billy-bookcase', qty: '1' }, { follow: false })).status, 409)
  } finally { await srv.close() }
})
