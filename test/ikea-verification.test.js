import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer, fieldValue } from './helpers.js'
import { products } from '../stores/ikea/catalog.js'
import { getOrder } from '../lib/orders.js'

const buyer = { email: 'ikea-verification@example.com', first_name: 'Casey', last_name: 'Home', address: '100 Test Lane', city: 'Austin', state: 'TX', postal_code: '78701', card_name: 'Casey Home', card_number: '4242424242424242', card_expiry: '12/39', card_cvv: '123' }
const pathname = result => new URL(result.url).pathname

test('IKEA first configured save creates its named list atomically and keeps the selected SKU through the bag', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    const page = await c.get('/ikea/lists/add?product_id=desk&option_Color=Oak+effect')
    assert.match(page.text, /<option value="Oak effect" selected>/)
    assert.match(page.text, /Create list and save product/)
    const input = { name: 'My first office', product_id: 'desk', option_Color: 'Oak effect', qty: '1', notes: 'Window corner' }
    for (const bad of [
      { ...input, option_Color: 'Blue' }, { ...input, option_Size: 'Huge' }, { ...input, qty: '1.5' },
      new URLSearchParams([...Object.entries(input), ['option_Color', 'White']]),
      new URLSearchParams([...Object.entries(input), ['qty', '2']]),
      new URLSearchParams([...Object.entries(input), ['product_id', 'mug']]),
    ]) {
      const rejected = await c.post('/ikea/lists/add', bad)
      assert.ok([400, 404].includes(rejected.status))
      assert.doesNotMatch((await c.get('/ikea/lists')).text, /data-list-id=/)
    }
    const created = await c.post('/ikea/lists/add', { ...input, price: '0', kind: 'game' })
    assert.match(created.text, /data-list-total="99.99"/)
    const listPath = pathname(created)
    const bag = await c.post(`${listPath}/bag`, { action: 'move' })
    assert.match(bag.text, /href="\/ikea\/product\/desk\?option_Color=Oak\+effect"/)
    assert.match(bag.text, /\$99\.99/)
    assert.doesNotMatch((await c.get(listPath)).text, /data-row-id=/)
    assert.equal((await srv.client().get(listPath)).status, 404)
  } finally { await srv.close() }
})

test('IKEA list transfer and checkout recheck current variant stock and price; receipt retains its original snapshot', async () => {
  const srv = await startServer()
  const desk = products.find(p => p.id === 'desk'), oak = desk.variants.find(v => v.options.Color === 'Oak effect')
  const saved = { stock: oak.stock, price: oak.price, title: desk.title }
  try {
    const c = srv.client()
    const created = await c.post('/ikea/lists/add', { name: 'Stock review', product_id: 'desk', option_Color: 'Oak effect', qty: '1' })
    const listPath = pathname(created)
    await c.post('/ikea/cart/add', { id: 'mug', qty: '1' })
    oak.stock = 0
    assert.equal((await c.post(`${listPath}/bag`, { action: 'move' })).status, 400)
    assert.match((await c.get(listPath)).text, /data-row-id=/)
    const unchanged = await c.get('/ikea/cart')
    assert.match(unchanged.text, /Stoneware coffee mug/)
    assert.doesNotMatch(unchanged.text, /Compact home office desk/)
    oak.stock = saved.stock
    await c.post(`${listPath}/bag`, { action: 'move' })
    const stockReview = await c.get('/ikea/checkout')
    oak.stock = 0
    assert.equal((await c.post('/ikea/checkout', { ...buyer, checkout_token: fieldValue(stockReview.text, 'checkout_token') })).status, 400)
    assert.equal((await c.json('/api/orders?store=ikea')).length, 0)
    oak.stock = saved.stock
    const priceReview = await c.get('/ikea/checkout')
    oak.price = 109.99
    const changed = await c.post('/ikea/checkout', { ...buyer, checkout_token: fieldValue(priceReview.text, 'checkout_token') })
    assert.equal(changed.status, 409)
    assert.equal(fieldValue(changed.text, 'card_number'), '')
    assert.equal(fieldValue(changed.text, 'card_cvv'), '')
    assert.equal(fieldValue(changed.text, 'first_name'), 'Casey')
    oak.price = saved.price
    const review = await c.get('/ikea/checkout')
    const confirmed = await c.post('/ikea/checkout', { ...buyer, checkout_token: fieldValue(review.text, 'checkout_token') })
    assert.equal(confirmed.status, 200)
    const orderPath = pathname(confirmed), recorded = getOrder(orderPath.split('/').at(-1))
    assert.equal(recorded.totals.total, 103.98)
    assert.equal(recorded.totals.shipping, 0); assert.equal(recorded.totals.tax, 0)
    assert.ok(recorded.items.every(item => item.kind === 'other'))
    const snapshot = JSON.stringify({ items: recorded.items, options: recorded.meta.options, totals: recorded.totals, payment: recorded.payment })
    oak.price = 1; desk.title = 'Changed catalog title'
    const receipt = await c.get(`${orderPath}/receipt`)
    assert.match(receipt.text, /Compact home office desk/); assert.match(receipt.text, /\$99\.99/)
    assert.doesNotMatch(receipt.text, /Changed catalog title|4242424242424242/)
    await c.post(`${orderPath}/action`, { action: 'cancel', reason: 'Room changed' })
    assert.equal(JSON.stringify({ items: recorded.items, options: recorded.meta.options, totals: recorded.totals, payment: recorded.payment }), snapshot)
  } finally { Object.assign(oak, { stock: saved.stock, price: saved.price }); desk.title = saved.title; await srv.close() }
})
