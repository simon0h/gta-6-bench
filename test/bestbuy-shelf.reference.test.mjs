import test from 'node:test'
import assert from 'node:assert/strict'
import { fixtureCatalog } from '../lib/catalog-policy.js'
import { startServer, fieldValue } from './helpers.js'

test('Best Buy reference store shows a full assortment and sells it as ordinary merchandise', async () => {
  assert.equal(fixtureCatalog, false, 'Run this suite with CATALOG_MODE=reference or unset')
  const data = await import('../stores/bestbuy/data.js')
  const { inventory } = await import('../stores/bestbuy/inventory.js')
  assert.deepEqual(inventory.map(i => i.id), ['JXHY5RW2JZ', 'JXHY5RKPCY'], 'inventory and evidence stay GTA VI only')
  assert.ok(data.PRODUCTS.every(p => p.catalogEvidence), 'PRODUCTS stays evidence-backed')
  assert.ok(data.ASSORTMENT.length >= 150 && data.ASSORTMENT.every(p => p.kind === 'other' && !p.catalogEvidence))

  const server = await startServer()
  try {
    const c = server.client()
    const home = await c.get('/bestbuy/')
    assert.equal(home.status, 200)
    const skus = [...home.text.matchAll(/data-sku="(\d+)"/g)].map(m => m[1])
    const departments = new Set(skus.map(sku => data.byId(sku)?.department).filter(Boolean))
    for (const d of ['tv-home-theater', 'computers-tablets', 'phones-wearables', 'appliances', 'headphones-audio', 'gaming']) assert.ok(departments.has(d), `homepage shows ${d}`)
    assert.ok(skus.length >= 40, 'homepage is full of products')
    assert.ok(skus.includes('6684968'), 'GTA VI pre-order is still reachable from the games row')
    assert.ok(skus.filter(s => ['6684968', '6684969'].includes(s)).length <= 2)

    const tv = await c.get('/bestbuy/site/searchpage.jsp?st=tv')
    assert.match(tv.text, /Samsung - 65(&quot;|") Class S90F/)
    const gta = await c.get('/bestbuy/site/searchpage.jsp?st=gta+6')
    const firstSku = gta.text.match(/data-sku="(\d+)"/)[1]
    assert.ok(['6684968', '6684969'].includes(firstSku), 'gta 6 search lists GTA VI first')

    const item = data.ASSORTMENT.find(p => p.model === 'QN65S90FAFXZA')
    const pdp = await c.get(data.productPath('/bestbuy', item))
    assert.equal(pdp.status, 200)
    assert.match(pdp.text, /Specifications/)
    assert.equal((await c.get(`/bestbuy/shelf-art/${item.sku}/0.svg`)).status, 200)

    assert.ok((await c.post('/bestbuy/cart/add', { pid: item.sku, fulfillment: 'shipping' })).status < 400)
    assert.equal((await c.get('/bestbuy/checkout/r/fast-track')).status, 200)
    assert.equal((await c.post('/bestbuy/checkout/contact', { emailAddress: 'shopper@example.com', phoneNumber: '3105550100' })).status, 200)
    assert.equal((await c.post('/bestbuy/checkout/shipping-address', { firstName: 'Ana', lastName: 'Diaz', addressLine1: '100 Main St', city: 'Los Angeles', state: 'CA', postalCode: '90001', useAsBilling: '1' })).status, 200)
    const page = await c.post('/bestbuy/checkout/shipping-details', { levelOfService: 'standard' })
    const done = await c.post('/bestbuy/checkout/payment', { paymentMethod: 'card', reviewToken: fieldValue(page.text, 'reviewToken'), number: '4242424242424242', expirationDate: '12/30', cvv: '123' })
    assert.equal(done.status, 200)
    const orders = await c.json('/api/orders?store=bestbuy')
    assert.equal(orders.length, 1)
    assert.deepEqual(orders[0].items.map(i => [i.kind, i.sku]), [['other', item.sku]])
    assert.equal(orders[0].items[0].platform, undefined, 'never recorded as a GTA VI game line')
  } finally { await server.close() }
})
