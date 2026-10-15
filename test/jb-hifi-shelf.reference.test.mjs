import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer } from './helpers.js'
import { PRODUCTS, ASSORTMENT, byId } from '../stores/jb-hifi/data.js'
import { inventory } from '../stores/jb-hifi/inventory.js'

// JB Hi-Fi everyday assortment (stores/jb-hifi/shelf.js): the store looks full like jbhifi.com.au,
// while the evidence-backed GTA VI rows and their purchase rules stay exactly as they were.
const au = { email: 'alex@example.com', first_name: 'Alex', last_name: 'Tester', phone: '0412 345 678', suburb: 'Sydney', state: 'NSW', postcode: '2000', address1: '1 George St', country: 'AU' }
const path = r => new URL(r.url).pathname

test('assortment is separate from the evidenced GTA VI catalogue', () => {
  assert.deepEqual(PRODUCTS.map(p => p.id).sort(), ['903000', '903001'])
  assert.deepEqual(inventory.map(p => p.id).sort(), ['903000', '903001'])
  assert.ok(ASSORTMENT.length >= 150)
  assert.ok(ASSORTMENT.every(p => p.kind === 'other' && !p.catalogEvidence && /^\d{6}$/.test(p.id)))
  assert.equal(new Set(ASSORTMENT.map(p => p.id)).size, ASSORTMENT.length)
  assert.equal(byId('991106'), null)
})

test('homepage shows several departments; search mixes the assortment and keeps GTA VI first', async () => {
  const srv = await startServer()
  try {
    srv.reset()
    const c = srv.client()
    const home = await c.get('/jb-hifi/')
    assert.equal(home.status, 200)
    assert.match(home.text, /Grand Theft Auto VI/)
    const departments = new Set([...home.text.matchAll(/href="\/jb-hifi\/products\/([^"?]+)"/g)].map(m => ASSORTMENT.find(p => p.slug === m[1])?.crumbs[0]).filter(Boolean))
    assert.ok(departments.size >= 6, `homepage departments: ${[...departments]}`)
    assert.ok(home.text.indexOf('Red Hot Deals') < home.text.indexOf('Gaming pre-orders'), 'GTA VI is not the first product row')

    const headphones = await c.get('/jb-hifi/search?query=headphones')
    assert.match(headphones.text, /Sony WH-1000XM6/)
    for (const q of ['gta 6', 'grand theft auto']) {
      const r = await c.get(`/jb-hifi/search?query=${encodeURIComponent(q)}`)
      const titles = [...r.text.matchAll(/<h3><a[^>]*>([^<]*)<\/a>/g)].map(m => m[1])
      assert.deepEqual(titles.slice(0, 2), ['Grand Theft Auto VI', 'Grand Theft Auto VI'], q)
    }
    const tvs = await c.get('/jb-hifi/collections/tvs-home-theatre?sort=price-asc&brand=LG')
    const tiles = [...tvs.text.matchAll(/<h3><a[^>]*>([^<]*)<\/a>/g)].map(m => m[1])
    assert.ok(tiles.length >= 3 && tiles.every(t => t.startsWith('LG ')), tiles.join())
    const prices = [...tvs.text.matchAll(/class="jb-tag "><span>\$([\d,.]+)</g)].map(m => Number(m[1].replace(/,/g, '')))
    assert.ok(prices.length >= 3)
    assert.deepEqual(prices, [...prices].sort((a, b) => a - b))
  } finally { await srv.close() }
})

test('an assortment item is bought through the normal checkout as a kind: other line', async () => {
  const srv = await startServer()
  try {
    srv.reset()
    const c = srv.client()
    const item = ASSORTMENT.find(p => p.title.startsWith('Sony WH-1000XM6'))
    const pdp = await c.get(`/jb-hifi/products/${item.slug}`)
    assert.equal(pdp.status, 200)
    assert.match(pdp.text, /shelf-art\//)
    assert.equal((await c.get(`/jb-hifi/shelf-art/${item.id}/0.svg`)).status, 200)
    await c.post('/jb-hifi/cart/add', { id: item.id, qty: '1' })
    const info = await c.post('/jb-hifi/checkout')
    const shipping = await c.post(path(info), { ...au, delivery_method: 'delivery' })
    const payment = await c.post(path(shipping), { shipping_method: 'standard' })
    const done = await c.post(path(payment), { payment_method: 'card', card_number: '4242424242424242', card_expiry: '12/39', card_cvv: '123', card_name: 'Alex Tester', billing: 'same' })
    assert.equal(done.status, 200)
    const orders = await c.json('/api/orders?store=jb-hifi')
    assert.equal(orders.length, 1)
    assert.deepEqual(orders[0].items.map(i => [i.kind, i.sku, i.qty, i.unit_price]), [['other', item.id, 1, item.price]])
    assert.equal(orders[0].items[0].platform, undefined)
  } finally { await srv.close() }
})
