import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer, fieldValue } from './helpers.js'
import { products } from '../stores/chewy/catalog.js'
import { getOrder } from '../lib/orders.js'

const buyer = { email: 'chewy-verification@example.com', first_name: 'Casey', last_name: 'Petparent', address: '100 Test Lane', city: 'Austin', state: 'TX', postal_code: '78701', card_name: 'Casey Petparent', card_number: '4242424242424242', card_expiry: '12/39', card_cvv: '123' }
const account = { email: 'tester@example.com', password: 'Password123!' }

test('Chewy saving and removing a favorite preserves the selected variant and rejects invalid options before toggling', async () => {
  const srv = await startServer()
  try {
    const c = srv.client(), input = { id: 'cat-bed', option_Size: 'Medium' }
    const page = await c.get('/chewy/product/cat-bed?Size=Medium')
    assert.match(page.text, /class="ch-save-product"[^>]*>[\s\S]*?name="option_Size" value="Medium"/)
    for (const malformed of [{ ...input, option_Size: 'Huge' }, { ...input, option_Color: 'Blue' }, new URLSearchParams([...Object.entries(input), ['option_Size', 'Large']]), { id: 'cat-bed', 'option_Size[x]': 'Medium' }]) {
      assert.equal((await c.post('/chewy/favorites', malformed)).status, 400)
      assert.doesNotMatch((await c.get('/chewy/favorites')).text, /href="\/chewy\/product\/cat-bed"/)
    }
    const saved = await c.post('/chewy/favorites', input)
    assert.equal(new URL(saved.url).search, '?Size=Medium')
    assert.match(saved.text, /data-selected-price="32.99"/)
    assert.match(saved.text, /Saved to favorites/)
    assert.match((await c.get('/chewy/favorites')).text, /href="\/chewy\/product\/cat-bed"/)
    const removed = await c.post('/chewy/favorites', input)
    assert.equal(new URL(removed.url).search, '?Size=Medium')
    assert.match(removed.text, /data-selected-price="32.99"/)
    assert.doesNotMatch((await c.get('/chewy/favorites')).text, /href="\/chewy\/product\/cat-bed"/)
    assert.equal((await c.post('/chewy/favorites', { id: 'cat-bed' })).status, 200)
  } finally { await srv.close() }
})

test('Chewy independently purchases every available configuration at the trusted price and rejects both stockouts', async () => {
  const srv = await startServer()
  let configurations = 0, purchased = 0, unavailable = 0
  try {
    for (const product of products) for (const variant of product.variants?.length ? product.variants : [{ options: {}, price: product.price, stock: product.stock }]) {
      configurations++
      const c = srv.client(), options = Object.fromEntries(Object.entries(variant.options).map(([label, value]) => ['option_' + label, value]))
      const pdp = await c.get('/chewy/product/' + product.id + '?' + new URLSearchParams(variant.options))
      assert.equal(pdp.status, 200, product.id)
      const added = await c.post('/chewy/cart/add', { id: product.id, qty: '1', ...options, price: '0.01', kind: 'gta6' })
      if (product.available === false || variant.available === false || product.stock === 0 || variant.stock === 0) {
        assert.equal(added.status, 400, product.id)
        assert.match(pdp.text, /<button disabled>Out of stock/)
        unavailable++
        continue
      }
      assert.equal(added.status, 200, product.id)
      const review = await c.get('/chewy/checkout')
      const done = await c.post('/chewy/checkout', { ...buyer, checkout_token: fieldValue(review.text, 'checkout_token') })
      assert.match(done.text, /Order confirmed/, product.id)
      const order = getOrder(new URL(done.url).pathname.split('/').at(-1))
      assert.equal(order.items.length, 1)
      assert.equal(order.items[0].kind, 'other')
      assert.equal(order.items[0].unit_price, variant.price, product.id)
      assert.deepEqual(order.meta.options[0].options, variant.options)
      assert.equal(order.totals.total, variant.price)
      assert.equal(order.totals.shipping, 0); assert.equal(order.totals.tax, 0)
      assert.equal(order.meta.gta6_available, false)
      assert.equal((await srv.client().get(new URL(done.url).pathname)).status, 404)
      purchased++
    }
    assert.deepEqual({ configurations, purchased, unavailable }, { configurations: 508, purchased: 506, unavailable: 2 })
  } finally { await srv.close() }
})

test('Chewy Autoship transfer and checkout recheck changed trusted stock and prices while keeping recorded orders immutable', async () => {
  const srv = await startServer()
  const product = products.find(p => p.id === 'wet-cat-food'), variant = product.variants.find(v => v.options.Pack === '24 × 3 oz')
  const original = { price: variant.price, stock: variant.stock, title: product.title }
  try {
    const c = srv.client()
    await c.post('/chewy/account', account)
    const savedAddress = await c.post('/chewy/account/addresses', { name: 'Casey Petparent', line1: '100 Test Lane', city: 'Austin', state: 'TX', postal_code: '78701', is_default: 'yes' })
    const address_id = savedAddress.text.match(/\/account\/addresses\/(address-[a-f0-9]+)"/)[1]
    const created = await c.post('/chewy/account/autoship', { name: 'Food routine', product_id: product.id, option_Pack: '24 × 3 oz', qty: '1', cadence: '4', next_date: '2092-04-12', address_id })
    const planPath = new URL(created.url).pathname
    assert.match(planPath, /autoship-/)
    await c.post('/chewy/cart/add', { id: 'dog-toy', qty: '1' })
    variant.stock = 0
    assert.equal((await c.post(planPath + '/action', { action: 'order-now' })).status, 400)
    const unchanged = await c.get('/chewy/cart')
    assert.match(unchanged.text, /Durable rubber fetch ball/)
    assert.doesNotMatch(unchanged.text, /Chicken adult wet cat food/)
    variant.stock = original.stock
    await c.post(planPath + '/action', { action: 'order-now' })
    const stockReview = await c.get('/chewy/checkout')
    variant.stock = 0
    assert.equal((await c.post('/chewy/checkout', { ...buyer, checkout_token: fieldValue(stockReview.text, 'checkout_token') })).status, 400)
    assert.deepEqual(await c.json('/api/orders?store=chewy'), [])
    variant.stock = original.stock
    const priceReview = await c.get('/chewy/checkout')
    variant.price = 37.99
    const stale = await c.post('/chewy/checkout', { ...buyer, checkout_token: fieldValue(priceReview.text, 'checkout_token') })
    assert.equal(stale.status, 409)
    assert.equal(fieldValue(stale.text, 'first_name'), 'Casey')
    assert.equal(fieldValue(stale.text, 'card_number'), ''); assert.equal(fieldValue(stale.text, 'card_cvv'), '')
    variant.price = original.price
    const review = await c.get('/chewy/checkout')
    const done = await c.post('/chewy/checkout', { ...buyer, checkout_token: fieldValue(review.text, 'checkout_token') })
    assert.match(done.text, /Order confirmed/)
    const order = getOrder(new URL(done.url).pathname.split('/').at(-1))
    const snapshot = JSON.stringify({ items: order.items, options: order.meta.options, totals: order.totals, payment: order.payment })
    assert.equal(order.totals.total, 43.98)
    product.title = 'Changed catalog title'; variant.price = 1
    const orderPath = '/chewy/account/orders/' + order.id
    const receipt = await c.get(orderPath)
    assert.match(receipt.text, /Chicken adult wet cat food/)
    assert.match(receipt.text, /\$34\.99/)
    assert.doesNotMatch(receipt.text, /Changed catalog title|4242424242424242/)
    assert.match((await c.post(orderPath + '/action', { action: 'cancel', reason: 'Routine changed' })).text, /cancelled/)
    assert.equal(JSON.stringify({ items: order.items, options: order.meta.options, totals: order.totals, payment: order.payment }), snapshot)
    assert.equal((await c.json('/api/orders?store=chewy')).length, 1)
  } finally { variant.price = original.price; variant.stock = original.stock; product.title = original.title; await srv.close() }
})
