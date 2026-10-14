import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer, fieldValue } from './helpers.js'
import { getOrder } from '../lib/orders.js'
import { isAccountOrder, eligibleForReplenishment, preferenceQuery } from '../stores/sephora/journeys.js'
import { products, filterCatalog } from '../stores/sephora/catalog.js'
const login = client => client.post('/sephora/account', { email: 'tester@example.com', password: 'Password123!' })
const register = (client, email) => client.post('/sephora/account', { mode: 'register', first_name: 'Casey', last_name: 'Beauty', email, password: 'BeautyPassword123!' })
const buyer = { email: 'tester@example.com', first_name: 'Alex', last_name: 'Tester', address: '123 Beauty Way', city: 'Austin', state: 'TX', postal_code: '78701', card_name: 'Alex Tester', card_number: '4242424242424242', card_expiry: '12/39', card_cvv: '123' }
const address = { label: 'Home', name: 'Alex Tester', line1: '123 Beauty Way', line2: 'Suite 6', city: 'Austin', state: 'TX', postal_code: '78701', phone: '512-555-1234', is_default: 'yes' }
const capture = (html, key) => new RegExp(`data-${key}="([^"]+)"`).exec(html)?.[1]
const productIds = html => [...html.matchAll(/data-product="([^"]+)"/g)].map(match => match[1])
const futureDate = () => new Date(Date.now() + 45 * 86400000).toISOString().slice(0, 10)
async function buy(client, sku = 'mascara') {
  await client.post('/sephora/cart/add', { id: sku })
  const review = await client.get('/sephora/checkout')
  const confirmation = await client.post('/sephora/checkout', { ...buyer, checkout_token: fieldValue(review.text, 'checkout_token') })
  assert.match(confirmation.text, /Order confirmed/)
  return confirmation.url.split('/').at(-1)
}

test('Sephora profile validation retains ordinary values, updates greetings and isolates active owners', async () => {
  const server = await startServer()
  try {
    const client = server.client()
    const invalid = await client.post('/sephora/account', { mode: 'register', first_name: 'KeepMyName', last_name: 'Retained', email: 'invalid', password: 'SECRET' })
    assert.equal(invalid.status, 400)
    assert.match(invalid.text, /value="KeepMyName"/)
    assert.doesNotMatch(invalid.text, /SECRET/)
    await login(client)
    const invalidProfile = await client.post('/sephora/account/profile', { first_name: 'Jordan', last_name: '', phone: 'wrong' })
    assert.equal(invalidProfile.status, 400)
    assert.equal(fieldValue(invalidProfile.text, 'first_name'), 'Jordan')
    const updated = await client.post('/sephora/account/profile', { first_name: 'Jordan', last_name: 'Beauty', phone: '555-123-1234' })
    assert.match(updated.text, /Welcome, Jordan/)
    assert.match(updated.text, /Hi, Jordan/)
    await client.post('/sephora/logout')
    await register(client, 'second-owner@example.com')
    assert.doesNotMatch((await client.get('/sephora/account')).text, /Jordan/)
    await client.post('/sephora/logout')
    await login(client)
    assert.match((await client.get('/sephora/account')).text, /Welcome, Jordan/)
    const fresh = server.client(); await login(fresh)
    assert.doesNotMatch((await fresh.get('/sephora/account')).text, /Jordan/)
    assert.equal((await server.client().get('/sephora/account/profile', { follow: false })).status, 302)
  } finally { await server.close() }
})

test('Sephora preferences produce real, clearable matching catalog filters; Loves and recent views retain owner scope', async () => {
  const server = await startServer()
  try {
    const client = server.client()
    await client.get('/sephora/product/lip-color')
    await client.post('/sephora/favorites', { id: 'lip-color' })
    assert.deepEqual(productIds((await client.get('/sephora/profile/Lists')).text), ['lip-color'])
    await login(client)
    assert.deepEqual(productIds((await client.get('/sephora/favorites')).text), [])
    assert.deepEqual(productIds((await client.get('/sephora/recently-viewed')).text), [])
    await client.get('/sephora/product/moisturizer')
    await client.get('/sephora/product/serum')
    await client.get('/sephora/product/moisturizer')
    assert.deepEqual(productIds((await client.get('/sephora/recently-viewed')).text), ['moisturizer', 'serum'])
    const preferences = { skin: 'Dry', hair: 'Curly', finish: 'Matte', scent: 'Floral', brand: 'daily-theory', preference: 'Fragrance-free' }
    assert.equal((await client.post('/sephora/account/preferences', preferences)).status, 200)
    const matches = await client.get('/sephora/account/discover?scope=skin')
    const expected = filterCatalog(preferenceQuery(preferences, 'skin')).map(p => p.id)
    assert.ok(expected.length > 0 && expected.length < products.length)
    assert.deepEqual(productIds(matches.text), expected.slice(0, 12))
    assert.match(matches.text, /Remove Skin type filter/)
    assert.match(matches.text, /Clear all/)
    assert.match(matches.text, new RegExp(`${expected.length} results`))
    const secondPage = await client.get('/sephora/search?' + new URLSearchParams({ ...preferenceQuery(preferences, 'skin'), page: '2' }))
    assert.deepEqual(productIds(secondPage.text), expected.slice(12, 24))
    const bad = await client.post('/sephora/account/preferences', { ...preferences, skin: ['Dry', 'Normal'] })
    assert.equal(bad.status, 400)
    assert.deepEqual(productIds((await client.get('/sephora/account/discover?scope=skin')).text), expected.slice(0, 12))
    await client.post('/sephora/recently-viewed/clear')
    assert.deepEqual(productIds((await client.get('/sephora/recently-viewed')).text), [])
    await client.post('/sephora/account/preferences/clear')
    assert.equal((await client.get('/sephora/account/discover?scope=skin')).status, 400)
    await client.post('/sephora/logout')
    assert.deepEqual(productIds((await client.get('/sephora/profile/Lists')).text), ['lip-color'])
    assert.deepEqual(productIds((await client.get('/sephora/recently-viewed')).text), ['lip-color'])
  } finally { await server.close() }
})

test('Sephora address create, edit, default and delete wire to canonical saved-address checkout without mutating a receipt', async () => {
  const server = await startServer()
  try {
    const client = server.client(); await login(client)
    const invalid = await client.post('/sephora/account/addresses', { ...address, postal_code: 'bad' })
    assert.equal(invalid.status, 400); assert.equal(fieldValue(invalid.text, 'line1'), address.line1)
    const first = await client.post('/sephora/account/addresses', address), id = capture(first.text, 'address')
    assert.ok(id)
    await client.post('/sephora/account/addresses', { ...address, id, label: 'Edited home', line1: '456 Updated Lane' })
    const second = await client.post('/sephora/account/addresses', { ...address, label: 'Studio', line1: '789 Studio Road' }), ids = [...second.text.matchAll(/data-address="([^"]+)"/g)].map(m => m[1]), id2 = ids.find(value => value !== id)
    await client.post(`/sephora/account/addresses/${id}/default`)
    await client.post('/sephora/cart/add', { id: 'mascara' })
    const review = await client.get('/sephora/checkout')
    assert.equal(fieldValue(review.text, 'address'), '456 Updated Lane, Suite 6')
    const otherReview = await client.get(`/sephora/checkout?address_id=${id2}`)
    assert.equal(fieldValue(otherReview.text, 'address'), '789 Studio Road, Suite 6')
    const receipt = await client.post('/sephora/checkout', { ...buyer, address: fieldValue(otherReview.text, 'address'), checkout_token: fieldValue(otherReview.text, 'checkout_token') })
    assert.match(receipt.text, /Order confirmed/)
    const order = getOrder(receipt.url.split('/').at(-1))
    assert.equal(order.totals.shipping, 0); assert.equal(order.items[0].kind, 'other')
    await client.post(`/sephora/account/addresses/${id2}/delete`)
    assert.equal(order.shipping_address.line1, '789 Studio Road, Suite 6')
    await client.post('/sephora/logout'); await register(client, 'address-other@example.com')
    assert.doesNotMatch((await client.get('/sephora/account/addresses')).text, /Edited home|456 Updated Lane/)
    assert.equal((await client.post(`/sephora/account/addresses/${id}/default`)).status, 404)
    assert.equal((await client.post(`/sephora/account/addresses/${id}/delete`)).status, 404)
    assert.equal((await client.post('/sephora/account/addresses', { ...address, id })).status, 404)
    await client.post('/sephora/cart/add', { id: 'mascara' })
    assert.equal((await client.get(`/sephora/checkout?address_id=${id}`)).status, 400)
  } finally { await server.close() }
})

test('Sephora Insider and orders require active account plus session; cancel and delivered-only return preserve purchase snapshots', async () => {
  const server = await startServer()
  try {
    const client = server.client(); await login(client)
    assert.equal((await client.post('/sephora/beauty-insider/enroll')).status, 400)
    const enrolled = await client.post('/sephora/beauty-insider/enroll', { consent: 'yes' })
    assert.match(enrolled.text, /You’re enrolled/)
    const first = await buy(client), order = getOrder(first), snapshot = JSON.stringify({ items: order.items, totals: order.totals, payment: order.payment })
    assert.match((await client.get('/sephora/beauty-insider')).text, new RegExp(order.order_number))
    assert.equal((await client.post(`/sephora/orders/${first}/action`, { action: 'return', reason: 'I changed my mind' })).status, 400)
    assert.equal((await client.post(`/sephora/orders/${first}/action`, { action: 'cancel', reason: '' })).status, 400)
    assert.match((await client.post(`/sephora/orders/${first}/action`, { action: 'cancel', reason: 'Ordered the wrong item' })).text, /Cancelled/)
    await client.post(`/sephora/orders/${first}/action`, { action: 'cancel', reason: 'Repeated cancel' })
    assert.equal(order.meta.lifecycle.length, 1)
    assert.equal(JSON.stringify({ items: order.items, totals: order.totals, payment: order.payment }), snapshot)
    const second = await buy(client, 'serum'), delivered = getOrder(second)
    delivered.meta.lifecycle = [{ status: 'delivered', created_at: new Date().toISOString(), reason: 'Test-only eligibility setup' }]
    assert.match((await client.post(`/sephora/orders/${second}/action`, { action: 'return', reason: 'Return this unopened product' })).text, /Return requested/)
    await client.post('/sephora/logout'); await register(client, 'orders-other@example.com')
    assert.doesNotMatch((await client.get('/sephora/orders')).text, new RegExp(order.order_number))
    for (const path of [`/order/${first}`, `/orders/${first}`, `/account/orders/${first}`, `/help/contact?order_id=${first}`]) assert.equal((await client.get('/sephora' + path)).status, 404)
    assert.equal((await client.post(`/sephora/orders/${first}/action`, { action: 'cancel', reason: 'Forged' })).status, 404)
    assert.doesNotMatch((await client.get('/sephora/beauty-insider')).text, /You’re enrolled/)
    const stranger = server.client(); await login(stranger)
    assert.equal((await stranger.get(`/sephora/orders/${first}`)).status, 404)
    assert.equal(isAccountOrder({ store: { user: { id: 'different' } } }, order), false)
  } finally { await server.close() }
})

test('Sephora searchable help, private support cases and owned order references reject cross-account or malformed submissions', async () => {
  const server = await startServer()
  try {
    const client = server.client(); await login(client)
    assert.match((await client.get('/sephora/help?q=shipping')).text, /help topics for “shipping”/)
    assert.match((await client.get('/sephora/help?q=xyz-nothing')).text, /No matching topics/)
    const orderId = await buy(client), payload = { category: 'shipping', subject: 'Please check my delivery', message: 'Can I change the delivery address for this order?', email: 'tester@example.com', order_id: orderId }
    const bad = await client.post('/sephora/help/contact', { ...payload, message: 'short' })
    assert.equal(bad.status, 400); assert.equal(fieldValue(bad.text, 'subject'), payload.subject)
    const result = await client.post('/sephora/help/contact', payload), id = result.url.split('/').at(-1)
    assert.match(result.text, /Support request saved/); assert.match(result.text, /No email has been sent/)
    const escaped = await client.post('/sephora/help/contact', { ...payload, subject: '<img src=x onerror=alert(1)>' })
    assert.doesNotMatch(escaped.text, /<img src=x/)
    await client.post('/sephora/logout'); await register(client, 'support-other@example.com')
    assert.equal((await client.get(`/sephora/help/cases/${id}`)).status, 404)
    assert.doesNotMatch((await client.get('/sephora/help/cases')).text, /Please check my delivery/)
    const forged = await client.post('/sephora/help/contact', payload)
    assert.equal(forged.status, 400); assert.match(forged.text, /not available in this account/)
    assert.equal((await client.post('/sephora/help/contact', { ...payload, category: 'unknown', order_id: '' })).status, 400)
    assert.equal((await client.post('/sephora/help/contact', new URLSearchParams([['category', 'shipping'], ['category', 'returns'], ['message', 'Normal message'], ['subject', 'Test'], ['email', 'tester@example.com']]))).status, 400)
  } finally { await server.close() }
})

test('Sephora sample-store choice and service drafts are validated, owner-scoped, removable and explicitly unbooked', async () => {
  const server = await startServer()
  try {
    const client = server.client(); await login(client)
    assert.equal((await client.post('/sephora/stores/preferred', { store: 'real-store' })).status, 400)
    assert.match((await client.post('/sephora/stores/preferred', { store: 'garden-walk' })).text, /Your preferred store/)
    assert.match((await client.get('/sephora/services')).text, /value="garden-walk" selected/)
    const draft = await client.post('/sephora/services/interests', { service: 'beauty-lesson', store: 'garden-walk', notes: 'Soft eye makeup ideas' }), id = capture(draft.text, 'interest')
    assert.ok(id); assert.match(draft.text, /No real appointment/)
    await client.post('/sephora/logout'); await register(client, 'service-other@example.com')
    assert.doesNotMatch((await client.get('/sephora/services')).text, /Soft eye makeup ideas/)
    assert.equal((await client.post(`/sephora/services/interests/${id}/delete`)).status, 404)
    await client.post('/sephora/logout'); await login(client)
    await client.post(`/sephora/services/interests/${id}/delete`)
    assert.doesNotMatch((await client.get('/sephora/services')).text, /Soft eye makeup ideas/)
  } finally { await server.close() }
})

test('Sephora refill plans enforce exact consumable options, date, quantity and cadence; edits/cancellation never create purchases', async () => {
  const server = await startServer()
  try {
    const client = server.client(); await login(client)
    assert.equal(eligibleForReplenishment(products.find(p => p.id === 'hair-dryer')), false)
    const payload = { product: 'moisturizer', option_Size: 'Mini · 15 mL', qty: '2', cadence: '60', next_date: futureDate(), card_number: 'untrusted', price: '0.01' }
    const result = await client.post('/sephora/account/replenishment', payload), id = capture(result.text, 'plan')
    assert.ok(id); assert.match(result.text, /No automatic charge or dispatch/); assert.doesNotMatch(result.text, /untrusted/)
    assert.match(result.text, /Mini · 15 mL · Quantity 2/)
    for (const change of [{ product: 'hair-dryer' }, { option_Size: 'Huge' }, { option_Shade: 'Invented' }, { qty: '11' }, { qty: '2.5' }, { cadence: '7' }, { next_date: '2026-02-30' }, { next_date: '2999-01-01' }, { next_date: '2020-01-01' }]) {
      const bad = await client.post('/sephora/account/replenishment', { ...payload, ...change })
      assert.equal(bad.status, 400, JSON.stringify(change)); assert.equal(fieldValue(bad.text, 'next_date'), change.next_date || payload.next_date)
    }
    await client.post(`/sephora/account/replenishment/${id}`, { ...payload, qty: '3', cadence: '90' })
    assert.match((await client.get('/sephora/account/replenishment')).text, /Every 90 days/)
    assert.match((await client.get('/sephora/account/replenishment')).text, /Quantity 3/)
    await client.post('/sephora/logout'); await register(client, 'plan-other@example.com')
    assert.doesNotMatch((await client.get('/sephora/account/replenishment')).text, /data-plan=/)
    assert.equal((await client.post(`/sephora/account/replenishment/${id}`, payload)).status, 404)
    assert.equal((await client.post(`/sephora/account/replenishment/${id}/cancel`)).status, 404)
    await client.post('/sephora/logout'); await login(client)
    assert.match((await client.post(`/sephora/account/replenishment/${id}/cancel`)).text, /Cancelled plan/)
    assert.equal((await client.post(`/sephora/account/replenishment/${id}`, payload)).status, 404)
    assert.equal((await client.post(`/sephora/account/replenishment/${id}/cancel`)).status, 200)
    assert.deepEqual(await client.json('/api/orders?store=sephora'), [])
  } finally { await server.close() }
})
