import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer, fieldValue } from './helpers.js'
import { getOrder } from '../lib/orders.js'
import { nikeOrderEligibility } from '../stores/nike/journeys.js'

const login = c => c.post('/nike/account', { email: 'tester@example.com', password: 'Password123!' })
const address = { label: 'Home Court', name: 'Alex Runner', line1: '83 Court Avenue', line2: 'Suite 2', city: 'Austin', state: 'TX', postal_code: '78701' }
const buyer = { email: 'runner@example.com', first_name: 'Alex', last_name: 'Runner', address: '83 Court Avenue', city: 'Austin', state: 'TX', postal_code: '78701', card_name: 'Alex Runner', card_number: '4242424242424242', card_expiry: '12/39', card_cvv: '123' }
const addrIds = html => [...new Set([...html.matchAll(/\/account\/addresses\/(address-[a-f0-9]+)\/edit/g)].map(m => m[1]))]
async function purchase(c) {
  await c.post('/nike/cart/add', { id: 'running-shoes', option_Size: 'US 9', qty: 1, price: '0.01', kind: 'game' })
  const checkout = await c.get('/nike/checkout')
  const confirmation = await c.post('/nike/checkout', { ...buyer, checkout_token: fieldValue(checkout.text, 'checkout_token') })
  assert.match(confirmation.text, /Order confirmed/)
  assert.match(confirmation.text, /View or Manage This Order/)
  return (await c.json('/api/orders?store=nike')).at(-1)
}

test('Nike member profile, address CRUD/default and checkout ownership remain isolated', async () => {
  const srv = await startServer()
  try {
    const c = srv.client(), outsider = srv.client()
    assert.equal((await c.get('/nike/account/addresses')).status, 401)
    const badRegistration = await c.post('/nike/account', { mode: 'register', first_name: 'Safe <Runner>', last_name: 'Testing', email: 'bad-email', password: 'shortsecret' })
    assert.match(badRegistration.text, /value="Safe &lt;Runner&gt;"/)
    assert.doesNotMatch(badRegistration.text, /shortsecret/)
    await login(c)
    const bad = await c.post('/nike/account/profile', { first_name: 'Jordan', last_name: 'Runner', department: 'Forged', sports: 'Running', phone: 'bad' })
    assert.equal(bad.status, 400)
    assert.match(bad.text, /value="Jordan"/)
    const p = new URLSearchParams({ first_name: 'Jordan', last_name: 'Runner', department: 'Women', phone: '555-123-4567' }); p.append('sports', 'Running'); p.append('sports', 'Training')
    const updatedProfile = await c.post('/nike/account/profile', p)
    assert.match(updatedProfile.text, /Welcome, Jordan/)
    assert.match(updatedProfile.text, /Hi, Jordan/)
    assert.match((await c.get('/nike/account/profile')).text, /value="Training" checked/)
    const invalid = await c.post('/nike/account/addresses', { ...address, postal_code: 'bad', line1: '<svg onload=alert(1)>' })
    assert.equal(invalid.status, 400)
    assert.match(invalid.text, /value="&lt;svg onload=alert\(1\)&gt;"/)
    assert.doesNotMatch(invalid.text, /<svg onload=/)
    const first = await c.post('/nike/account/addresses', address), [one] = addrIds(first.text)
    assert.ok(one)
    const second = await c.post('/nike/account/addresses', { ...address, label: 'Track', line1: '18 Track Street' }), [, two] = addrIds(second.text)
    assert.equal((await c.post(`/nike/account/addresses/${two}/default`)).status, 200)
    await c.post('/nike/cart/add', { id: 'running-shoes', option_Size: 'US 9', qty: 1 })
    assert.equal(fieldValue((await c.get('/nike/checkout')).text, 'address'), '18 Track Street, Suite 2')
    assert.equal(fieldValue((await c.get(`/nike/checkout?address_id=${one}`)).text, 'address'), '83 Court Avenue, Suite 2')
    await login(outsider)
    for (const route of [`/nike/account/addresses/${one}/edit`, `/nike/account/addresses/${one}/default`, `/nike/account/addresses/${one}/delete`]) assert.equal((route.endsWith('edit') ? await outsider.get(route) : await outsider.post(route)).status, 404)
    await outsider.post('/nike/cart/add', { id: 'backpack', qty: 1 })
    assert.equal((await outsider.get(`/nike/checkout?address_id=${one}`)).status, 400)
    await c.post('/nike/account/addresses', { ...address, id: one, line1: '99 Updated Avenue' })
    assert.match((await c.get(`/nike/account/addresses/${one}/edit`)).text, /99 Updated Avenue/)
    await c.post(`/nike/account/addresses/${two}/delete`)
    assert.equal(fieldValue((await c.get('/nike/checkout')).text, 'address'), '99 Updated Avenue, Suite 2')
    await c.post('/nike/logout')
    await c.post('/nike/account', { mode: 'register', email: 'other-nike@example.com', password: 'Password123!', first_name: 'Other', last_name: 'Runner' })
    assert.doesNotMatch((await c.get('/nike/account')).text, /Hi, Jordan/)
    assert.doesNotMatch((await c.get('/nike/account/addresses')).text, /Updated Avenue/)
    assert.equal((await c.get(`/nike/account/addresses/${one}/edit`)).status, 404)
    await c.post('/nike/logout'); await login(c)
    assert.match((await c.get('/nike/account')).text, /Welcome, Jordan/)
    assert.match((await c.get('/nike/account/addresses')).text, /99 Updated Avenue/)
  } finally { await srv.close() }
})

test('Nike favorites bridge, recent browsing and preferred stores switch with owner', async () => {
  const srv = await startServer()
  try {
    const c = srv.client(), outsider = srv.client()
    assert.equal((await c.post('/nike/favorites', { id: 'gta6' })).status, 404)
    await c.post('/nike/favorites', { id: 'backpack' })
    assert.match((await c.get('/nike/product/backpack')).text, /Saved — Remove/)
    assert.match((await c.get('/nike/recent')).text, /product\/backpack/)
    assert.match((await c.get('/nike/favorites')).text, /Remove from favorites/)
    assert.doesNotMatch((await outsider.get('/nike/favorites')).text, /Remove from favorites/)
    await c.post('/nike/stores/austin-downtown/preferred', { action: 'save' })
    assert.match((await c.get('/nike/stores?q=78701&type=Nike+Store')).text, /Your preferred store/)
    assert.doesNotMatch((await c.get('/nike/stores?q=NoSuchCity')).text, /\/stores\/austin-downtown/)
    assert.equal((await c.post('/nike/stores/forged/preferred', { action: 'save' })).status, 404)
    assert.equal((await c.post('/nike/stores/austin-downtown/preferred', { action: 'ship' })).status, 400)
    await login(c)
    assert.doesNotMatch((await c.get('/nike/favorites')).text, /Remove from favorites/)
    assert.match((await c.get('/nike/recent')).text, /No recently viewed styles yet/)
    assert.doesNotMatch((await c.get('/nike/stores')).text, /Your preferred store/)
    await c.post('/nike/favorites', { id: 'running-shoes' })
    await c.post('/nike/stores/portland-central/preferred', { action: 'save' })
    assert.match((await c.get('/nike/account')).text, /Nike Portland Central/)
    await c.post('/nike/logout')
    assert.match((await c.get('/nike/favorites')).text, /product\/backpack/)
    assert.doesNotMatch((await c.get('/nike/favorites')).text, /product\/running-shoes/)
    assert.match((await c.get('/nike/stores')).text, /Your preferred store/)
    await c.post('/nike/favorites', { id: 'backpack', action: 'remove', return_to: 'favorites' })
    await c.post('/nike/favorites', { id: 'backpack', action: 'remove', return_to: 'favorites' })
    assert.doesNotMatch((await c.get('/nike/favorites')).text, /Remove from favorites/)
    await c.post('/nike/recent/clear')
    assert.match((await c.get('/nike/recent')).text, /No recently viewed styles yet/)
  } finally { await srv.close() }
})

test('Nike order history and guest lookup enforce session/account ownership and lifecycle windows', async () => {
  const srv = await startServer()
  try {
    const c = srv.client(), outsider = srv.client()
    const guest = await purchase(c)
    assert.equal(guest.items[0].kind, 'other'); assert.equal(guest.items[0].unit_price, 89.99)
    assert.equal((await outsider.post('/nike/orders/guest', { order_number: guest.order_number, email: buyer.email })).status, 404)
    assert.equal((await c.post('/nike/orders/guest', { order_number: guest.order_number, email: 'wrong@example.com' })).status, 404)
    assert.match((await c.post('/nike/orders/guest', { order_number: guest.order_number, email: buyer.email })).text, /Preparing your order/)
    assert.equal((await c.post(`/nike/orders/${guest.id}/action`, { action: 'return', reason: 'Wrong fit' })).status, 400)
    getOrder(guest.id).created_at = new Date(Date.now() - 31 * 60000).toISOString()
    assert.equal((await c.post(`/nike/orders/${guest.id}/action`, { action: 'cancel', reason: 'Changed plans' })).status, 400)
    await login(c)
    const order = await purchase(c)
    assert.match((await c.get('/nike/orders')).text, new RegExp(order.order_number))
    assert.doesNotMatch((await c.get('/nike/orders')).text, new RegExp(guest.order_number))
    await login(outsider)
    assert.equal((await outsider.get(`/nike/orders/${order.id}`)).status, 404)
    assert.equal((await outsider.post(`/nike/orders/${order.id}/action`, { action: 'cancel', reason: 'Foreign order' })).status, 404)
    assert.equal((await c.post(`/nike/orders/${order.id}/action`, { action: 'cancel', reason: 'x' })).status, 400)
    await c.post('/nike/logout')
    assert.equal((await c.get(`/nike/orders/${order.id}`)).status, 404)
    await c.post('/nike/account', { mode: 'register', email: 'second-nike@example.com', password: 'Password123!', first_name: 'Second', last_name: 'Runner' })
    assert.equal((await c.get(`/nike/orders/${order.id}`)).status, 404)
    assert.equal((await c.get(`/nike/order/${order.id}`)).status, 404)
    assert.equal((await c.post('/nike/help/contact', { category: 'Orders', email: 'second-nike@example.com', order_id: order.id, subject: 'Other order', message: 'Trying a foreign order' })).status, 400)
    await c.post('/nike/logout'); await login(c)
    assert.match((await c.post(`/nike/orders/${order.id}/action`, { action: 'cancel', reason: 'Changed plans' })).text, /Cancellation recorded/)
    assert.equal(getOrder(order.id).meta.lifecycle.at(-1).status, 'cancelled')
    assert.equal((await c.post(`/nike/orders/${order.id}/action`, { action: 'cancel', reason: 'Again' })).status, 400)
    assert.equal(getOrder(order.id).meta.lifecycle.length, 1)
    assert.equal(getOrder(order.id).items[0].kind, 'other')
    assert.deepEqual(getOrder(order.id).totals, order.totals)
    // Trusted backend delivery evidence is required; the shopper cannot mark delivered.
    const delivered = getOrder(guest.id)
    delivered.meta.lifecycle = [{ status: 'delivered', created_at: new Date().toISOString() }]
    assert.match((await c.post(`/nike/orders/${guest.id}/action`, { action: 'return', reason: 'Size did not fit' })).text, /Return request received/)
  } finally { await srv.close() }
})

test('Nike return eligibility needs trusted delivery date within 60 days', () => {
  const now = Date.now(), order = { created_at: new Date(now - 10 * 86400000).toISOString(), meta: {} }
  assert.deepEqual(nikeOrderEligibility(order, now), { cancel: false, return: false })
  order.meta.lifecycle = [{ status: 'delivered', created_at: new Date(now - 59 * 86400000).toISOString() }]
  assert.equal(nikeOrderEligibility(order, now).return, true)
  order.meta.lifecycle[0].created_at = new Date(now - 61 * 86400000).toISOString()
  assert.equal(nikeOrderEligibility(order, now).return, false)
  order.meta.lifecycle[0].created_at = 'invalid'
  assert.equal(nikeOrderEligibility(order, now).return, false)
})

test('Nike searchable help and support case validation retain safe inputs and private requests', async () => {
  const srv = await startServer()
  try {
    const c = srv.client(), outsider = srv.client()
    assert.match((await c.get('/nike/help?q=standard+shipping')).text, /What are my shipping options/)
    assert.match((await c.get('/nike/help?q=unlikelyword')).text, /0 results/)
    assert.equal((await c.get('/nike/help/nope')).status, 404)
    const values = { category: 'Products & Sizing', email: 'runner@example.com', subject: 'Fit <script>alert(1)</script>', message: 'How does this shoe fit for wide feet?' }
    const invalid = await c.post('/nike/help/contact', { ...values, message: 'short' })
    assert.equal(invalid.status, 400)
    assert.match(invalid.text, /value="Fit &lt;script&gt;/)
    assert.match(invalid.text, />short<\/textarea>/)
    assert.equal((await c.post('/nike/help/contact', { ...values, category: 'Forged' })).status, 400)
    const saved = await c.post('/nike/help/contact', values), id = /Reference: (case-[a-f0-9]+)/.exec(saved.text)[1]
    assert.match(saved.text, /Support Request Saved/)
    assert.doesNotMatch(saved.text, /<script>alert/)
    assert.equal((await outsider.get(`/nike/help/cases/${id}`)).status, 404)
    await login(c)
    assert.equal((await c.get(`/nike/help/cases/${id}`)).status, 404)
    await c.post('/nike/logout')
    assert.equal((await c.get(`/nike/help/cases/${id}`)).status, 200)
    const foreignGuest = await c.get('/sephora/help/cases/' + id)
    assert.equal(new URL(foreignGuest.url).pathname, '/sephora/account')
    assert.doesNotMatch(foreignGuest.text, /How does this shoe fit for wide feet|Reference: case-/)
    await c.post('/sephora/account', { email: 'tester@example.com', password: 'Password123!' })
    assert.equal((await c.get('/sephora/help/cases/' + id)).status, 404)
  } finally { await srv.close() }
})
