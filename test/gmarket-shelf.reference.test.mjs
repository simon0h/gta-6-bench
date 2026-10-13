import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer } from './helpers.js'
import { shelf } from '../stores/gmarket/shelf.js'

// Reference mode: Gmarket shows an everyday assortment around the evidenced GTA 6
// listings. Shelf items can be bought (recorded as kind 'other'); the GTA 6
// observations stay read-only and their purchase POSTs are still refused.
test('gmarket shelf: homepage, search, cart and order for assortment items', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    assert.ok(shelf.length >= 150, `assortment size ${shelf.length}`)
    assert.ok(shelf.every(p => !/GTA|Grand Theft|그랜드 ?테프트/i.test(p.title)), 'GTA 6 stays out of the shelf')

    const home = await c.get('/gmarket/')
    assert.equal(home.status, 200)
    assert.match(home.text, /data-reference-state="catalog"/)
    const codes = [...home.text.matchAll(/data-shelf-product="(\d+)"/g)].map(m => m[1])
    const depts = new Set(codes.map(code => shelf.find(p => p.code === code).dept))
    assert.ok(depts.size >= 6, `homepage departments: ${depts.size}`)
    assert.match(home.text, /data-reference-product="4796016651"/, 'GTA 6 sits in the games row')

    const search = await c.get('/gmarket/n/search?keyword=' + encodeURIComponent('삼성'))
    assert.equal(search.status, 200)
    assert.ok((search.text.match(/data-shelf-product=/g) || []).length >= 5)
    for (const q of ['gta 6', 'grand theft auto']) {
      const gta = await c.get('/gmarket/n/search?keyword=' + encodeURIComponent(q))
      const first = /data-(shelf|reference)-product="(\d+)"/.exec(gta.text)
      assert.equal(first[1], 'reference', q)
    }

    const list = await c.get('/gmarket/n/list?category=100001007&sub=1&sort=' + encodeURIComponent('낮은가격순'))
    assert.equal(list.status, 200)
    assert.match(list.text, /data-reference-product="4796016651"/)

    const item = shelf.find(p => p.code === '1651273917')
    const detail = await c.get('/gmarket/Item?goodscode=' + item.code)
    assert.equal(detail.status, 200)
    assert.match(detail.text, /action="\/gmarket\/cart\/add"/)
    assert.equal((await c.get(`/gmarket/shelf-art/${item.code}/0.svg`)).headers.get('content-type'), 'image/svg+xml; charset=utf-8')

    const cart = await c.post('/gmarket/cart/add', { sku: item.code, qty: '2', action: 'cart' })
    assert.match(cart.text, new RegExp(item.title.slice(0, 20)))
    const checkout = await c.get('/gmarket/checkout?mode=cart')
    assert.equal(checkout.status, 200)
    const done = await c.post('/gmarket/checkout', { email: 'shopper@example.com', recipient: '김지민', phone: '010-1234-5678', postal_code: '06236', city: '서울특별시', line1: '테헤란로 152', name_on_card: 'KIM JIMIN', card_number: '4111111111111111', expiry: '12/29', cvv: '123', terms: '1' })
    assert.equal(done.status, 200)
    assert.match(done.text, /주문이 완료되었습니다/)
    const orders = await c.json('/api/orders?store=gmarket')
    assert.equal(orders.length, 1)
    assert.deepEqual(orders[0].items.map(i => [i.kind, i.sku, i.qty, i.unit_price]), [['other', item.code, 2, item.price]])

    // The evidenced GTA 6 listings remain read-only.
    const refused = await c.post('/gmarket/cart/add', { sku: '4796016651', qty: '1', action: 'cart' }, { follow: false })
    assert.equal(refused.status, 409)
    assert.equal((await c.json('/api/orders?store=gmarket')).length, 1)
  } finally { await srv.close() }
})
