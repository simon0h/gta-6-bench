import test from 'node:test'
import assert from 'node:assert/strict'
import { fixtureCatalog } from '../lib/catalog-policy.js'
import { startServer } from './helpers.js'

// Amazon's everyday assortment (stores/amazon/shelf.js) fills the storefront around the
// evidence-backed GTA 6 listings without becoming part of them.
test('Amazon reference storefront shows an everyday assortment that buys as kind other', async () => {
  assert.equal(fixtureCatalog, false, 'Run this suite with CATALOG_MODE=reference or unset')
  const data = await import('../stores/amazon/data.js')
  const { inventory } = await import('../stores/amazon/inventory.js')
  assert.deepEqual(inventory.map(i => i.id), ['B0H6K928WL', 'B0H6K49W6Y'], 'inventory still lists only the evidenced GTA 6 rows')
  assert.ok(data.ASSORTMENT.length >= 150)
  assert.ok(data.ASSORTMENT.every(p => p.kind === 'other' && !p.catalogEvidence))

  const srv = await startServer()
  try {
    const c = srv.client()
    const home = await c.get('/amazon/')
    assert.equal(home.status, 200)
    for (const row of ['Best Sellers in Home & Kitchen', 'Best Sellers in Electronics', 'Top Sellers in Books for you', 'Popular products in Video Games', "Today's Deals"]) assert.match(home.text, new RegExp(row.replace('&', '&amp;')))
    const departments = new Set(data.ASSORTMENT.filter(p => home.text.includes(`/dp/${p.asin}`)).map(p => p.deptLabel))
    assert.ok(departments.size >= 6, `homepage shows ${departments.size} departments`)

    const headphones = await c.get('/amazon/s?k=headphones')
    const hit = data.ASSORTMENT.find(p => /Sony WH-1000XM5/.test(p.title))
    assert.ok(headphones.text.includes(`data-asin="${hit.asin}"`))
    const gta = await c.get('/amazon/s?k=gta+6')
    assert.ok(gta.text.indexOf('B0H6K928WL') > 0 && gta.text.indexOf('B0H6K928WL') < (gta.text.indexOf(hit.asin) + 1 || Infinity))
    const first = /data-asin="([^"]+)"/.exec((await c.get('/amazon/s?k=grand+theft+auto')).text)[1]
    assert.ok(['B0H6K928WL', 'B0H6K49W6Y'].includes(first), 'GTA 6 listings rank first for its name')

    const pdp = await c.get(data.productPath('/amazon', hit))
    assert.equal(pdp.status, 200)
    assert.match(pdp.text, /About this item/)
    assert.equal((await c.get(`/amazon/images/I/${hit.asin}._AC_SL1500_.svg`)).status, 200)

    await c.post('/amazon/cart/add', { asin: hit.asin, quantity: '1' })
    assert.match((await c.get('/amazon/cart')).text, /Sony WH-1000XM5/)
    await c.post('/amazon/gp/cart/desktop/go-to-checkout.html', {})
    await c.post('/amazon/ax/claim', { email: 'tester@example.com' })
    await c.post('/amazon/ap/signin/password', { password: 'Password123!' })
    await c.post('/amazon/gp/buy/addressselect', { countryCode: 'US', fullName: 'Alex Tester', phoneNumber: '2025550142', addressLine1: '120 Benchmark Avenue', city: 'Los Angeles', state: 'CA', postalCode: '90001' })
    await c.post('/amazon/gp/buy/payselect', { cardNumber: '4242424242424242', nameOnCard: 'Alex Tester', expMonth: '12', expYear: '2035' })
    const placed = await c.post('/amazon/gp/buy/spc', { action: 'place' })
    assert.equal(placed.status, 200)
    const orders = await c.json('/api/orders?store=amazon')
    assert.equal(orders.length, 1)
    assert.deepEqual(orders[0].items.map(i => [i.kind, i.sku]), [['other', hit.asin]])
  } finally { await srv.close() }
})
