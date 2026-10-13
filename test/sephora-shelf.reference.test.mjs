import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer, fieldValue } from './helpers.js'
import { products } from '../stores/sephora/shelf.js'

test('sephora homepage shows assortment rows from several departments', async () => {
  const srv = await startServer()
  try {
    const home = await srv.client().get('/sephora/')
    assert.equal(home.status, 200)
    assert.match(home.text, /data-reference-state="catalog"/)
    const ids = [...home.text.matchAll(/data-assortment="sephora"[^>]*>|data-product-id="(P\d+)" data-sku/g)].map(m => m[1]).filter(Boolean)
    const depts = new Set(ids.map(id => products.find(p => p.id === id)?.dept).filter(Boolean))
    for (const dept of ['makeup-cosmetics', 'skincare', 'fragrance', 'hair-products']) assert.ok(depts.has(dept), `homepage shows ${dept}`)
    assert.doesNotMatch(home.text, /grand theft auto|gta 6/i)
  } finally { await srv.close() }
})

test('sephora search finds assortment items and keeps the captured and GTA 6 search behaviour', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    const mascara = await c.get('/sephora/search?keyword=mascara')
    assert.equal(mascara.status, 200)
    assert.ok((mascara.text.match(/data-assortment="sephora"/g) || []).length >= 5)
    assert.match(mascara.text, /Better Than Sex Volumizing/)
    const captured = await c.get('/sephora/search?keyword=gta%206')
    assert.equal((captured.text.match(/data-product-kind="other"/g) || []).length, 100)
    for (const q of ['Grand+Theft+Auto+VI', 'grand%20theft%20auto', 'gta']) {
      const none = await c.get(`/sephora/search?keyword=${q}`)
      assert.match(none.text, /data-reference-state="uncaptured"/, q)
      assert.doesNotMatch(none.text, /data-assortment="sephora"/, q)
    }
    const category = await c.get('/sephora/shop/skincare?sortBy=PRICE_LOW_TO_HIGH&price=0-25')
    const prices = [...category.text.matchAll(/class="sx-card-price">(?:<span class="sx-sale">)?\$([\d.]+)/g)].map(m => Number(m[1]))
    assert.ok(prices.length > 3 && prices.every(p => p < 25))
    assert.deepEqual(prices, prices.toSorted((a, b) => a - b))
  } finally { await srv.close() }
})

test('an assortment item is bought through basket and checkout as a kind other order', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    const product = products.find(p => p.name === 'Soft Pinch Liquid Blush')
    const sku = product.variants[2].sku
    const page = await c.get(`/sephora${product.path}?skuId=${sku}`)
    assert.equal(page.status, 200)
    assert.match(page.text, /Add to Basket/)
    const basket = await c.post('/sephora/basket/add', { productId: product.id, skuId: sku, qty: '2' })
    assert.match(basket.text, /Soft Pinch Liquid Blush/)
    const checkout = await c.get('/sephora/checkout')
    assert.equal(checkout.status, 200)
    const done = await c.post('/sephora/checkout', { checkout_token: fieldValue(checkout.text, 'checkout_token'), email: 'shopper@example.com', first_name: 'Ana', last_name: 'Lee',
      address: '1 Market St', city: 'San Francisco', state: 'CA', postal_code: '94105', card_name: 'Ana Lee', card_number: '4242424242424242', card_expiry: '12/30', card_cvv: '123' })
    assert.equal(done.status, 200)
    assert.match(done.text, /Thank you for your order/)
    const orders = await c.json('/api/orders?store=sephora')
    assert.equal(orders.length, 1)
    assert.deepEqual(orders[0].items.map(i => [i.kind, i.sku, i.qty, i.unit_price]), [['other', sku, 2, 23]])
    assert.equal(orders[0].totals.total, 46 + 6.95)
    assert.ok(orders[0].items.every(i => !('platform' in i)))
    // Captured search cards and legacy purchase endpoints stay unpurchasable.
    const refused = await srv.client().post('/sephora/basket/add', { skuId: '2624369', qty: '1' })
    assert.equal(refused.status, 400)
    assert.equal((await srv.client().post('/sephora/checkout', {})).status, 409)
  } finally { srv.reset(); await srv.close() }
})
