import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer } from './helpers.js'
import { PRODUCTS, SHELF_ITEMS, bySku, search } from '../stores/rockstar-store/data.js'
import { inventory } from '../stores/rockstar-store/inventory.js'

const base = '/rockstar-store'

test('rockstar-store assortment stays separate from the evidence-backed GTA VI catalog', () => {
  assert.ok(SHELF_ITEMS.length >= 150, `assortment has ${SHELF_ITEMS.length} items`)
  assert.deepEqual(PRODUCTS.map(p => p.id), ['gta-vi'])
  assert.deepEqual(inventory.map(p => p.id), ['gta-vi'])
  assert.ok(SHELF_ITEMS.every(p => p.kind === 'other' && !/Grand Theft Auto VI\b/.test(p.title) || p.section !== 'Games'), 'no assortment game claims to be GTA VI')
  for (const q of ['gta 6', 'grand theft auto', 'grand theft auto vi', 'gta']) assert.equal(search(q)[0].id, 'gta-vi', q)
})

test('rockstar-store homepage, search and departments show assortment products', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    const home = await c.get(`${base}/`)
    assert.equal(home.status, 200)
    for (const name of ['Black Grand Theft Auto VI Logo Tee', 'Red Dead Redemption 2', 'Great White Shark Cash Card (PC)', 'Red Dead Redemption 2 Glass Candle by Joya', 'Grand Theft Auto VI']) assert.ok(home.text.includes(name), name)
    for (const heading of ['New Arrivals', 'Games', 'Popular Items', 'Apparel', 'Game Add-Ons', 'Accessories', 'Collectibles']) assert.match(home.text, new RegExp(`<h2>${heading}</h2>`))
    const hoodies = await c.get(`${base}/search?q=hoodie`)
    assert.match(hoodies.text, /\d+ results/)
    assert.match(hoodies.text, /Grand Theft Auto V Hoodie/)
    const gta6 = await c.get(`${base}/search?q=gta%206`)
    assert.ok(gta6.text.indexOf('/game/buy-gta-vi"') < gta6.text.indexOf('/merchandise/'), 'GTA VI listed first')
    const apparel = await c.get(`${base}/search?sort=date.desc&subcategories%5Ball%5D=apparel`)
    assert.match(apparel.text, /Page 1 of \d+/)
    assert.doesNotMatch(apparel.text, /0 results/)
    const img = await c.get(`${base}/shelf-art/gta-v/0.svg`)
    assert.equal(img.status, 200)
  } finally { await srv.close() }
})

test('rockstar-store assortment item is added to the cart and ordered as kind other', async () => {
  const srv = await startServer()
  try {
    srv.reset()
    const c = srv.client()
    const p = SHELF_ITEMS.find(x => x.id === 'red-dead-redemption-2-glass-candle-by-joya')
    const page = await c.get(`${base}${p.path}`)
    assert.match(page.text, /Add to Cart/)
    await c.post(`${base}/cart/add`, { sku: p.sku, qty: '1' })
    const cart = await c.get(`${base}/cart`)
    assert.match(cart.text, /Red Dead Redemption 2 Glass Candle by Joya/)
    await c.post(`${base}/cart/checkout`)
    await c.post(`${base}/checkout/guest`)
    await c.post(`${base}/checkout/shipping-address`, { country: 'US', first_name: 'Alex', last_name: 'Tester', city: 'Miami', region: 'FL', postal_code: '33139', street_address: '123 Ocean Dr', phone: '3055550123', email: 'alex@example.com' })
    await c.post(`${base}/checkout/shipping-method`, { shipping_method: 'standard' })
    const done = await c.post(`${base}/checkout/payment`, { payment_method: 'card', card_number: '4242424242424242', expiry: '12/39', cvc: '123', cardholder_name: 'Alex Tester' })
    assert.equal(done.status, 200)
    const orders = await c.json('/api/orders?store=rockstar-store')
    assert.equal(orders.length, 1)
    assert.deepEqual(orders[0].items.map(i => [i.kind, i.title, i.sku]), [['other', p.title, p.sku]])
    assert.equal(bySku(p.sku).kind, 'other')
  } finally { await srv.close() }
})
