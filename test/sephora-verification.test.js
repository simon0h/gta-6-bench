import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer, fieldValue } from './helpers.js'
import { products } from '../stores/sephora/catalog.js'
import { getOrder } from '../lib/orders.js'

const login = client => client.post('/sephora/account', { email: 'tester@example.com', password: 'Password123!' })
const buyer = { email: 'verify-sephora@example.com', first_name: 'Alex', last_name: 'Verify', address: '98 Beauty Lane', city: 'Austin', state: 'TX', postal_code: '78701', card_name: 'Alex Verify', card_number: '4242424242424242', card_expiry: '12/39', card_cvv: '123' }
const selected = (html, name) => new RegExp(`<select name="${name}">([\\s\\S]*?)</select>`).exec(html)?.[1].match(/<option value="([^"]*)" selected/)?.[1]
const main = html => html.match(/<main[^>]*>([\s\S]*?)<\/main>/)?.[1] || ''

test('Sephora PDP Loves preserves exact selection and rejects malformed options before toggling', async () => {
  const server = await startServer()
  try {
    const client = server.client(), payload = { id: 'foundation', option_Shade: 'Medium warm', option_Size: 'Mini · 10 mL' }
    const pdp = await client.get('/sephora/product/foundation?Shade=Medium+warm&Size=Mini+%C2%B7+10+mL')
    const form = pdp.text.match(/<form class="sp-pdp-love"[^>]*>([\s\S]*?)<\/form>/)[1]
    assert.equal(fieldValue(form, 'option_Shade'), payload.option_Shade)
    assert.equal(fieldValue(form, 'option_Size'), payload.option_Size)
    const result = await client.post('/sephora/favorites', payload)
    assert.equal(fieldValue(result.text, 'option_Shade'), payload.option_Shade)
    assert.equal(fieldValue(result.text, 'option_Size'), payload.option_Size)
    assert.match(result.text, /data-selected-price="16"/)
    for (const input of [{ ...payload, option_Size: 'Huge' }, { ...payload, option_Forged: 'x' }, { ...payload, option_constructor: 'x' }, new URLSearchParams([...Object.entries(payload), ['option_Shade', 'Light neutral']]), new URLSearchParams([['id', 'foundation'], ['option_Size[value]', 'Mini · 10 mL']])]) {
      assert.equal((await client.post('/sephora/favorites', input)).status, 400)
      assert.match(main((await client.get('/sephora/favorites')).text), /data-product="foundation"/)
    }
    const removed = await client.post('/sephora/favorites', payload)
    assert.equal(fieldValue(removed.text, 'option_Size'), payload.option_Size)
    assert.doesNotMatch(main((await client.get('/sephora/favorites')).text), /data-product="foundation"/)
  } finally { await server.close() }
})

test('Sephora refill entry retains PDP size and rejects forged or repeated query options without creating a plan', async () => {
  const server = await startServer()
  try {
    const client = server.client(); await login(client)
    const pdp = await client.get('/sephora/product/moisturizer?Size=Mini+%C2%B7+15+mL')
    const destination = pdp.text.match(/href="([^"]+)">Plan a refill reminder/)[1].replaceAll('&amp;', '&')
    const plan = await client.get(destination)
    assert.equal(selected(plan.text, 'option_Size'), 'Mini · 15 mL')
    for (const query of ['option_Size=Huge', 'option_Size=Mini+%C2%B7+15+mL&option_Size=Standard+%C2%B7+50+mL', 'option_Size[value]=Mini', 'option_Shade=Blue']) {
      assert.equal((await client.get('/sephora/account/replenishment?product=moisturizer&' + query)).status, 400, query)
    }
    const next_date = new Date(Date.now() + 45 * 86400000).toISOString().slice(0, 10)
    const saved = await client.post('/sephora/account/replenishment', { product: 'moisturizer', option_Size: selected(plan.text, 'option_Size'), qty: 2, cadence: 60, next_date })
    assert.match(saved.text, /Mini · 15 mL · Quantity 2/)
    const back = saved.text.match(/href="([^"]+)">Review product &amp; buy once/)[1].replaceAll('&amp;', '&')
    assert.equal(fieldValue((await client.get(back)).text, 'option_Size'), 'Mini · 15 mL')
    assert.deepEqual(await client.json('/api/orders?store=sephora'), [])
  } finally { await server.close() }
})

test('Sephora checkout revalidates current variant stock and price, rejects repeated values and retains immutable receipts', async () => {
  const server = await startServer(), product = products.find(p => p.id === 'foundation'), variant = product.variants.find(v => v.options.Shade === 'Medium warm' && v.options.Size.startsWith('Mini'))
  const original = { price: variant.price, stock: variant.stock }
  try {
    const client = server.client(), item = { id: product.id, option_Shade: variant.options.Shade, option_Size: variant.options.Size, qty: 1 }
    for (const input of [{ ...item, option_Forged: 'x' }, new URLSearchParams([...Object.entries(item), ['qty', '2']]), new URLSearchParams([['id', 'foundation'], ['option_Shade[value]', 'Medium warm'], ['option_Size', item.option_Size]])]) assert.equal((await client.post('/sephora/cart/add', input)).status, 400)
    await client.post('/sephora/cart/add', item)
    const reviewed = await client.get('/sephora/checkout')
    variant.stock = 0
    assert.equal((await client.post('/sephora/checkout', { ...buyer, checkout_token: fieldValue(reviewed.text, 'checkout_token') })).status, 400)
    variant.stock = original.stock; variant.price = original.price + 1
    const stale = await client.post('/sephora/checkout', { ...buyer, checkout_token: fieldValue(reviewed.text, 'checkout_token') })
    assert.equal(stale.status, 409)
    assert.equal(fieldValue(stale.text, 'first_name'), buyer.first_name)
    assert.doesNotMatch(stale.text, /4242424242424242|value="123"/)
    const current = await client.get('/sephora/checkout')
    const confirmation = await client.post('/sephora/checkout', { ...buyer, checkout_token: fieldValue(current.text, 'checkout_token'), total: '.01', kind: 'game' })
    assert.match(confirmation.text, /Order confirmed/)
    const order = getOrder(confirmation.url.split('/').at(-1)), snapshot = JSON.stringify(order)
    assert.equal(order.items[0].kind, 'other'); assert.equal(order.items[0].unit_price, 17)
    assert.deepEqual(order.totals, { subtotal: 17, shipping: 6.95, tax: 0, total: 23.95 })
    variant.price = 3; variant.options.Size = 'TEMP TEST SIZE'
    assert.equal(JSON.stringify(order), snapshot)
    const page = await client.get(`/sephora/orders/${order.id}`)
    assert.match(page.text, /Shade: Medium warm · Size: Mini · 10 mL/)
    assert.equal((await client.get(`/nike/order/${order.id}`)).status, 404)
    assert.equal((await server.client().get(`/sephora/orders/${order.id}`)).status, 404)
    await client.post('/sephora/cart/add', { id: 'mascara' })
    assert.equal((await client.post('/sephora/checkout', { ...buyer, checkout_token: fieldValue(current.text, 'checkout_token') })).status, 409)
    assert.equal((await client.json('/api/orders?store=sephora')).length, 1)
  } finally { Object.assign(variant, original); variant.options.Size = 'Mini · 10 mL'; await server.close() }
})
