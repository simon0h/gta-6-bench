import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer } from './helpers.js'
import { shelf } from '../stores/coupang/shelf.js'
import { DEPARTMENTS } from '../stores/coupang/site-data.js'

// The default reference catalog shows a full Coupang shelf next to (never instead of)
// the GTA 6 evidence rules: shelf items are bought only as `kind: 'other'` lines.
test('coupang shelf: homepage, search, category and an other-kind order', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    const home = await c.get('/coupang')
    assert.equal(home.status, 200)
    assert.match(home.text, /data-reference-state="catalog"/)
    const ids = [...home.text.matchAll(/data-shelf-product="(\d+)"/g)].map(m => m[1])
    const depts = new Set(ids.map(id => shelf.find(p => p.id === id).dept))
    assert.ok(ids.length >= 60, `homepage shows many products (${ids.length})`)
    assert.ok(depts.size >= 10, `homepage covers several departments (${depts.size})`)
    assert.doesNotMatch(home.text, /data-shelf-product="[^"]*"[^>]*>[^<]*<a[^>]*>[^<]*GTA 6/i)

    const milk = await c.get('/coupang/np/search?q=' + encodeURIComponent('우유'))
    assert.equal(milk.status, 200)
    assert.ok((milk.text.match(/data-product-kind="other"/g) || []).length >= 4)
    assert.doesNotMatch(milk.text, /data-reference-state="uncaptured"/)

    const gta = await c.get('/coupang/np/search?q=gta%206')
    assert.match(gta.text, /data-reference-state="uncaptured"/)

    const digital = DEPARTMENTS.find(d => d.label === '가전디지털')
    const category = await c.get(`/coupang/np/categories/${digital.id}?sorter=salePriceAsc&page=2`)
    assert.equal(category.status, 200)
    assert.match(category.text, /aria-current="page">2</)
    const filtered = await c.get(`/coupang/np/categories/${digital.id}?brand=${encodeURIComponent('삼성전자')}&brand=LG%EC%A0%84%EC%9E%90`)
    assert.equal(filtered.status, 200)
    const filteredIds = [...filtered.text.matchAll(/class="cs-card" data-product-kind="other" data-shelf-product="(\d+)"/g)].map(m => shelf.find(p => p.id === m[1]))
    assert.ok(filteredIds.length > 0 && filteredIds.every(p => ['삼성전자', 'LG전자'].includes(p.brand)))

    const item = shelf.find(p => p.title.startsWith('제주삼다수'))
    const detail = await c.get('/coupang' + item.path)
    assert.equal(detail.status, 200)
    assert.match(detail.text, /장바구니 담기/)
    const image = await c.get(`/coupang/image/vp/${item.id}/0.svg`)
    assert.equal(image.status, 200)
    assert.match(image.headers.get('content-type'), /svg/)

    await c.post('/coupang/cart/add', { product_id: item.id, sku: item.sku, qty: '2', intent: 'cart' })
    const cart = await c.get('/coupang/cart')
    assert.match(cart.text, new RegExp(`data-cart-sku="${item.sku}"`))

    await c.post('/coupang/register', { email: 'shelf@example.com', password: 'Password123!', password_confirm: 'Password123!', first_name: '김쿠팡', phone: '01012345678', agree: 'yes' })
    const checkout = await c.get('/coupang/checkout')
    assert.equal(checkout.status, 200)
    assert.match(checkout.text, /결제하기/)
    const done = await c.post('/coupang/checkout/order', { recipient: '김쿠팡', phone: '010-1234-5678', postcode: '05510', city: '서울특별시', address: '송파대로 570', payment_method: 'card', card_name: 'KIM COUPANG', card_number: '4111111111111111', card_expiry: '12/30', card_cvv: '123', agree: 'yes' })
    assert.equal(done.status, 200)
    assert.match(done.text, /주문이 완료되었습니다/)
    const orders = await c.json('/api/orders')
    assert.equal(orders.length, 1)
    assert.deepEqual(orders[0].items.map(i => [i.kind, i.sku, i.qty, i.unit_price]), [['other', item.sku, 2, item.price]])
    assert.equal(orders[0].totals.total, item.price * 2)

    // GTA fixture SKUs remain read-only in the reference catalog.
    const guarded = await c.post('/coupang/cart/add', { sku: 'CP-GTA6-PS5', qty: '1' }, { follow: false })
    assert.equal(guarded.status, 409)
  } finally { await srv.close() }
})
