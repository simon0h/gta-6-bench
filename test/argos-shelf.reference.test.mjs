import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer } from './helpers.js'
import { SHELF } from '../stores/argos/shelf.js'
import { PRODUCTS, validateCart } from '../stores/argos/data.js'
import { inventory } from '../stores/argos/inventory.js'

const main = r => r.text.slice(r.text.indexOf('<main'))
const find = prefix => SHELF.find(p => p.title.startsWith(prefix))

test('argos assortment stays separate from the evidenced GTA VI listings', () => {
  assert.ok(SHELF.length >= 150, `assortment has ${SHELF.length} items`)
  assert.equal(PRODUCTS.length, 2)
  assert.deepEqual(inventory.map(p => p.id).sort(), ['8747437', '8747444'])
  assert.equal(new Set(SHELF.map(p => p.sku)).size, SHELF.length)
  for (const p of SHELF) {
    assert.match(p.sku, /^\d{7}$/)
    assert.equal(p.kind, 'other')
    assert.ok(!p.catalogEvidence)
    assert.doesNotMatch(p.title, /Grand Theft Auto VI|GTA VI|GTA 6/i)
  }
})

test('argos homepage shows products from several departments, with GTA VI as one row item', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    const home = await c.get('/argos/')
    assert.equal(home.status, 200)
    for (const p of [find('Ninja Foodi MAX'), find('Fujifilm Instax'), find('LEGO Classic Large'), find('Habitat Squares 9 Cube')]) assert.ok(home.text.includes(`/argos/product/${p.sku}`), p.title)
    const cards = home.text.match(/class="product-card"/g).length
    assert.ok(cards >= 40, `${cards} cards`)
    assert.match(home.text, /Grand Theft Auto VI PS5 Game Pre-Order/)
    assert.ok(main(home).indexOf('Top deals') < main(home).indexOf('Grand Theft Auto VI'))
    const tv = await c.get('/argos/browse/technology/televisions-and-accessories/televisions/c:30106/?brand=LG&sort=price-low')
    assert.match(tv.text, /<strong>3 products<\/strong>/)
    assert.ok(main(tv).indexOf('LG 43 Inch') < main(tv).indexOf('LG 55 Inch') && main(tv).indexOf('LG 55 Inch') < main(tv).indexOf('LG 65 Inch'))
  } finally { await srv.close() }
})

test('argos search mixes the assortment and still leads with GTA VI for GTA queries', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    const kettles = await c.get('/argos/search?q=kettle')
    assert.match(kettles.text, /Russell Hobbs 26051 Brushed Steel/)
    assert.doesNotMatch(main(kettles), /Grand Theft Auto VI/)
    for (const q of ['gta 6', 'grand theft auto']) {
      const r = await c.get(`/argos/search?q=${encodeURIComponent(q)}`)
      const first = main(r).indexOf('Grand Theft Auto VI'), other = main(r).indexOf('Grand Theft Auto V PS5 Game')
      assert.ok(first > 0, q)
      assert.ok(other === -1 || first < other, q)
    }
  } finally { await srv.close() }
})

test('an assortment item is ordered as kind other while GTA VI stays unpurchasable', async () => {
  const srv = await startServer()
  try {
    srv.reset()
    const c = srv.client(), p = find('Russell Hobbs 26051')
    const blocked = await c.post('/argos/trolley/add', { sku: '8747444', qty: '1', age_confirmed: '1' }, { follow: false })
    assert.equal(blocked.status, 409)
    assert.equal((await c.post(`/argos/product/${p.sku}/stock`, { postcode: 'SW1A 2AA', variant: '' })).status, 200)
    const add = await c.post('/argos/trolley/add', { sku: p.sku, variant: '', qty: '1' })
    assert.match(add.text, /Russell Hobbs 26051/)
    await c.post('/argos/account', { action: 'guest', email: 'shopper@example.com' })
    const details = await c.post('/argos/checkout/details', { first_name: 'Sam', last_name: 'Shopper', phone: '07700 900123', line1: '1 High Street', city: 'London', postcode: 'SW1A 2AA', method: 'ship' })
    assert.match(details.text, /Pay now/)
    const done = await c.post('/argos/checkout/payment', { name_on_card: 'Sam Shopper', card_number: '4242424242424242', expiry: '12/30', cvv: '123', billing_same: '1', terms: '1' })
    assert.match(done.text, /Your order number is/)
    const orders = await c.json('/api/orders')
    assert.equal(orders.length, 1)
    assert.deepEqual(orders[0].items.map(i => [i.kind, i.sku, i.qty]), [['other', p.sku, 1]])
    assert.equal(orders[0].totals.total, p.unit_price)
    // A trolley that also holds a GTA VI line is rejected as a whole.
    const mixed = validateCart([{ ...PRODUCTS[0], qty: 1, age_confirmed: true }, { ...p, variant_id: '', qty: 1 }])
    assert.deepEqual(mixed.cart, [])
    assert.ok(mixed.messages.length)
  } finally { await srv.close() }
})
