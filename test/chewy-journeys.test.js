import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer, fieldValue } from './helpers.js'
import { products } from '../stores/chewy/catalog.js'
import { validDate, prepareAutoshipCart } from '../stores/chewy/journeys.js'
import { getOrder, recordOrder } from '../lib/orders.js'

const account = { email: 'tester@example.com', password: 'Password123!' }
const address = { label: 'Home', name: 'Alex Tester', line1: '24 Pet Street', line2: 'Apt 2', city: 'Austin', state: 'TX', postal_code: '78701', phone: '555-123-4567', is_default: 'yes' }
const pet = { name: 'Mochi', species: 'Cat', breed: 'Domestic shorthair', birthday: '2024-02-29', lifeStage: 'Adult', preference: 'Food & treats' }
const buyer = { email: 'tester@example.com', first_name: 'Alex', last_name: 'Tester', address: '24 Pet Street', city: 'Austin', state: 'TX', postal_code: '78701', card_name: 'Alex Tester', card_number: '4242424242424242', card_expiry: '12/39', card_cvv: '123' }
const extract = (html, pattern) => { const value = pattern.exec(html)?.[1]; assert.ok(value, 'Expected generated ID in page'); return value }
const addressId = html => extract(html, /\/account\/addresses\/(address-[a-f0-9]+)"/)
const petId = html => extract(html, /\/account\/pets\/(pet-[a-f0-9]+)"/)
const planId = response => new URL(response.url).pathname.split('/').at(-1)
async function setup(c) { await c.post('/chewy/account', account); const a = await c.post('/chewy/account/addresses', address); return addressId(a.text) }
const planInput = id => ({ name: 'Weekly favorites', product_id: 'cat-litter', option_Pack: '14 lb', qty: '1', cadence: '4', next_date: '2092-03-10', address_id: id })
async function plan(c, address_id, overrides = {}) { const input = { ...planInput(address_id), ...overrides }; for (const key of Object.keys(input)) if (input[key] === undefined) delete input[key]; const result = await c.post('/chewy/account/autoship', input); assert.equal(result.status, 200); assert.match(result.url, /autoship-[a-f0-9]+$/); return result }
async function switchOwner(c, email) { return c.post('/chewy/account', { mode: 'register', email, password: 'SafePassword123!', first_name: 'Other', last_name: 'Parent' }) }
const action = (c, id, body) => c.post(`/chewy/account/autoship/${id}/action`, body)

// Calendar round-trips reject dates that JavaScript otherwise normalizes.
test('Chewy calendar and atomic cart validation reject impossible dates and partial transfers', () => {
  for (const date of ['2025-02-29', '2024-02-30', '2024-13-01', '2024-01-32', '24-01-01', ['2024-01-01'], '0000-01-01']) assert.equal(validDate(date), false)
  assert.equal(validDate('2024-02-29'), true)
  const productById = id => products.find(p => p.id === id)
  const stockLimit = p => p.available === false ? 0 : Math.min(10, p.stock)
  const selectedProduct = (p, opts) => !p.variants?.length ? p : p.variants.find(v => Object.entries(opts).every(([k, val]) => v.options[k] === val))
  const cart = [{ pid: 'dog-food', key: 'dog-food:', options: {}, qty: 1 }], before = JSON.stringify(cart)
  const result = prepareAutoshipCart(cart, [{ pid: 'cat-food', options: {}, qty: 1 }, { pid: 'cooling-mat', options: {}, qty: 1 }], { productById, stockLimit, selectedProduct })
  assert.ok(result.error); assert.equal(JSON.stringify(cart), before)
})

test('Chewy pets validate date/enums, preserve values, edit/delete and remain private across account and session switches', async () => {
  const srv = await startServer(); try {
    const c = srv.client(); assert.match((await c.get('/chewy/account/pets')).url, /\/account$/)
    await c.post('/chewy/account', account)
    assert.equal((await c.post('/chewy/account', { ...account, password: 'wrong' })).status, 400)
    const invalid = await c.post('/chewy/account/pets', { ...pet, birthday: '2025-02-29' }); assert.equal(invalid.status, 400); assert.match(invalid.text, /value="Mochi"/)
    for (const change of [{ birthday: '2099-01-01' }, { species: '__proto__' }, { lifeStage: 'Kitten-doctor' }, { preference: 'unknown' }]) assert.equal((await c.post('/chewy/account/pets', { ...pet, ...change })).status, 400)
    const created = await c.post('/chewy/account/pets', pet), id = petId(created.text)
    assert.match((await c.post('/chewy/account/pets/' + id, { ...pet, name: 'Mochi Bean' })).text, /Mochi Bean/)
    await c.post('/chewy/account/profile', { first_name: 'Jordan', last_name: 'Tester', phone: '5551234567', shopping: 'Play & enrichment' })
    const dashboard = await c.get('/chewy/account'); assert.match(dashboard.text, /Welcome, Jordan/); assert.match(dashboard.text, /Hi, Jordan/)
    await switchOwner(c, 'chewy-pet-owner-b@example.com')
    assert.doesNotMatch((await c.get('/chewy/account/pets')).text, /Mochi Bean/)
    assert.equal((await c.get('/chewy/account/pets/' + id)).status, 404)
    assert.equal((await c.post('/chewy/account/pets/' + id, pet)).status, 404)
    assert.equal((await c.post('/chewy/account/pets/' + id + '/delete')).status, 404)
    const other = srv.client(); await other.post('/chewy/account', account); assert.equal((await other.get('/chewy/account/pets/' + id)).status, 404)
    await c.post('/chewy/account', account); assert.match((await c.get('/chewy/account/profile')).text, /value="Jordan"/)
    await c.post('/chewy/account/pets/' + id + '/delete'); assert.doesNotMatch((await c.get('/chewy/account/pets')).text, /Mochi Bean/)
    await c.post('/chewy/logout'); assert.match((await c.get('/chewy/account/pets')).url, /\/account$/)
  } finally { await srv.close() }
})

test('Chewy favorite and recent product bridge keeps guests and each owner separate; guides save actual filtered progress', async () => {
  const srv = await startServer(); try {
    const c = srv.client(); await c.post('/chewy/favorites', { id: 'bird-feeder' }); await c.get('/chewy/product/bird-seed')
    await c.post('/chewy/account', account); assert.doesNotMatch((await c.get('/chewy/favorites')).text, /Small bird feeding station/)
    await c.post('/chewy/favorites', { id: 'cat-food' }); await c.get('/chewy/product/cat-litter')
    const created = await c.post('/chewy/account/pets', pet), id = petId(created.text)
    const path = '/chewy/guides/cat?pet_id=' + id
    const first = await c.get(path); assert.match(first.text, /Mochi/); assert.match(first.text, /species=Cat&amp;type=Food&amp;lifeStage=Adult/)
    const filtered = await c.get('/chewy/search?species=Cat&type=Food&lifeStage=Adult'); assert.match(filtered.text, /data-product-id="cat-food"/)
    const progress = await c.post('/chewy/guides/cat', { pet_id: id, action: 'save', done: 'Food' }); assert.match(progress.text, /1 of \d+ categories checked/)
    assert.equal((await c.post('/chewy/guides/cat', { pet_id: id, action: 'save', done: '__proto__' })).status, 400)
    await switchOwner(c, 'chewy-guide-owner-b@example.com')
    assert.doesNotMatch((await c.get('/chewy/favorites')).text, /Indoor adult cat food/); assert.doesNotMatch((await c.get('/chewy/recent')).text, /Unscented clumping/)
    assert.equal((await c.get(path)).status, 404); assert.equal((await c.post('/chewy/guides/cat', { pet_id: id, action: 'reset' })).status, 404)
    await c.post('/chewy/account', account); assert.match((await c.get('/chewy/favorites')).text, /Indoor adult cat food/); assert.match((await c.get(path)).text, /1 of \d+ categories checked/)
    assert.match((await c.post('/chewy/guides/cat', { pet_id: id, action: 'reset' })).text, /0 of \d+ categories checked/)
    await c.post('/chewy/logout'); assert.match((await c.get('/chewy/favorites')).text, /Small bird feeding station/)
  } finally { await srv.close() }
})

test('Chewy address CRUD/default feeds canonical checkout and rejects foreign addresses', async () => {
  const srv = await startServer(); try {
    const c = srv.client(), id = await setup(c)
    assert.equal((await c.post('/chewy/account/addresses', { ...address, postal_code: 'bad' })).status, 400)
    assert.equal((await c.post('/chewy/account/addresses', { ...address, state: 'Texas' })).status, 400)
    await c.post('/chewy/account/addresses/' + id, { ...address, line1: '25 Pet Street' })
    const second = await c.post('/chewy/account/addresses', { ...address, label: 'Work', line1: '8 Office Road', is_default: '' }), ids = [...second.text.matchAll(/\/account\/addresses\/(address-[a-f0-9]+)"/g)].map(m => m[1]), id2 = ids.find(x => x !== id)
    await c.post('/chewy/account/addresses/' + id2 + '/default')
    await c.post('/chewy/cart/add', { id: 'dog-food', qty: 1 })
    assert.match((await c.get('/chewy/checkout')).text, /value="8 Office Road, Apt 2"/)
    assert.match((await c.get('/chewy/checkout?address_id=' + id)).text, /value="25 Pet Street, Apt 2"/)
    await switchOwner(c, 'chewy-address-owner-b@example.com')
    assert.equal((await c.get('/chewy/account/addresses/' + id)).status, 404)
    for (const suffix of ['', '/delete', '/default']) assert.equal((await c.post('/chewy/account/addresses/' + id + suffix, address)).status, 404)
    assert.equal((await c.get('/chewy/checkout?address_id=' + id)).status, 400)
    assert.doesNotMatch((await c.get('/chewy/checkout')).text, /value="8 Office Road/)
    await c.post('/chewy/account', account); await c.post('/chewy/account/addresses/' + id2 + '/delete')
    assert.match((await c.get('/chewy/checkout')).text, /value="25 Pet Street, Apt 2"/)
  } finally { await srv.close() }
})

test('Chewy Autoship validates products/options/dates, preserves independent cadence/date, and skips/cancels without orders', async () => {
  const srv = await startServer(); try {
    const c = srv.client(), address_id = await setup(c)
    for (const patch of [{ next_date: '2092-02-30' }, { next_date: '2020-01-01' }, { cadence: '3' }, { option_Pack: '200 lb' }, { qty: '1.5' }, { address_id: 'foreign' }, { pet_id: 'foreign' }]) assert.equal((await c.post('/chewy/account/autoship', { ...planInput(address_id), ...patch })).status, 400, JSON.stringify(patch))
    assert.equal((await c.post('/chewy/account/autoship', { ...planInput(address_id), product_id: 'cat-bed' })).status, 404)
    const created = await plan(c, address_id), id = planId(created)
    assert.match(created.text, /does not automatically charge/)
    const otherSession = srv.client(); await otherSession.post('/chewy/account', account); assert.equal((await otherSession.get('/chewy/account/autoship/' + id)).status, 404); assert.equal((await action(otherSession, id, { action: 'skip' })).status, 404)
    const repeated = new URLSearchParams([['action', 'date'], ['next_date', '2092-04-02'], ['next_date', '2092-04-03']]); assert.equal((await action(c, id, repeated)).status, 400)
    const cadence = await action(c, id, { action: 'cadence', cadence: '8' }); assert.match(cadence.text, /Next shopping date<\/span><strong>2092-03-10<\/strong>[\s\S]*Shopping routine<\/span><strong>Every 8 weeks/)
    const date = await action(c, id, { action: 'date', next_date: '2092-04-02' }); assert.match(date.text, /Next shopping date<\/span><strong>2092-04-02<\/strong>[\s\S]*Shopping routine<\/span><strong>Every 8 weeks/)
    assert.equal((await action(c, id, { action: 'date', next_date: '2091-02-29' })).status, 400)
    await action(c, id, { action: 'add', product_id: 'wet-cat-food', option_Pack: '24 × 3 oz', qty: '2' })
    const changed = await action(c, id, { action: 'quantity', item_key: 'wet-cat-food:24 × 3 oz', qty: '3' }); assert.match(changed.text, /Quantity 3/); assert.match(changed.text, /\$34.99 each/)
    const selectedHref = changed.text.match(/class="ch-plan-photo" href="([^"]*wet-cat-food[^"]*)"/)[1].replaceAll('&amp;', '&')
    const selectedPdp = await c.get(selectedHref); assert.match(selectedPdp.text, /data-selected-price="34.99"/); assert.match(selectedPdp.text, /name="option_Pack" value="24 × 3 oz"/)
    await action(c, id, { action: 'remove', item_key: 'wet-cat-food:24 × 3 oz' })
    assert.equal((await action(c, id, { action: 'remove', item_key: 'cat-litter:14 lb' })).status, 400)
    assert.equal((await c.post('/chewy/account/addresses/' + address_id + '/delete')).status, 400)
    assert.match((await action(c, id, { action: 'skip' })).text, /Next shopping date<\/span><strong>2092-05-28/)
    assert.deepEqual(await c.json('/api/orders?store=chewy'), [])
    await switchOwner(c, 'chewy-plan-owner-b@example.com'); assert.equal((await c.get('/chewy/account/autoship/' + id)).status, 404); assert.equal((await action(c, id, { action: 'skip' })).status, 404)
    await c.post('/chewy/account', account)
    assert.equal((await action(c, id, { action: 'cancel' })).status, 400)
    assert.match((await action(c, id, { action: 'cancel', confirm: 'yes' })).text, /No upcoming date/)
    assert.equal((await action(c, id, { action: 'order-now' })).status, 400)
    assert.equal((await action(c, id, { action: 'skip' })).status, 400)
    assert.deepEqual(await c.json('/api/orders?store=chewy'), [])
    assert.equal((await c.post('/chewy/account/addresses/' + address_id + '/delete')).status, 200)
  } finally { await srv.close() }
})

test('Chewy Autoship cart transfer is atomic, revalidates stock, invalidates old reviews, and only canonical card checkout purchases', async () => {
  const srv = await startServer(); try {
    const c = srv.client(), address_id = await setup(c), id = planId(await plan(c, address_id, { product_id: 'dog-food', option_Pack: undefined, qty: '1' }))
    await action(c, id, { action: 'add', product_id: 'cat-food', qty: '1' })
    const stock = products.find(p => p.id === 'cat-food').stock
    await c.post('/chewy/cart/add', { id: 'cat-food', qty: Math.min(stock, 10) })
    const before = await c.get('/chewy/cart'), rejected = await action(c, id, { action: 'order-now' })
    assert.equal(rejected.status, 400); assert.equal((await c.get('/chewy/cart')).text, before.text)
    await c.post('/chewy/cart/update', { id: 'cat-food', action: 'remove' }); await c.post('/chewy/cart/add', { id: 'pet-bowl', qty: 1 })
    const review = await c.get('/chewy/checkout')
    const moved = await action(c, id, { action: 'order-now', price: '0.01', kind: 'gta6' }); assert.match(moved.url, /\/cart$/); assert.match(moved.text, /Adult dry dog food/); assert.match(moved.text, /Indoor adult cat food/)
    assert.deepEqual(await c.json('/api/orders?store=chewy'), [])
    const stale = await c.post('/chewy/checkout', { ...buyer, checkout_token: fieldValue(review.text, 'checkout_token') }); assert.equal(stale.status, 409); assert.doesNotMatch(stale.text, /value="4242424242424242"/)
    const invalidPayment = await c.post('/chewy/checkout', { ...buyer, card_number: '', payment_method: 'autoship', checkout_token: fieldValue(stale.text, 'checkout_token') }); assert.equal(invalidPayment.status, 400)
    const done = await c.post('/chewy/checkout', { ...buyer, checkout_token: fieldValue(invalidPayment.text, 'checkout_token') }); assert.match(done.text, /Order confirmed/)
    const [order] = await c.json('/api/orders?store=chewy'); assert.equal(order.totals.total, 71.97); assert.equal(order.payment.method, 'card'); assert.equal(order.totals.shipping, 0); assert.equal(order.totals.tax, 0); assert.ok(order.items.every(i => i.kind === 'other')); assert.ok(order.meta.account_id)
    assert.match((await c.get('/chewy/account/autoship/' + id)).text, /Next shopping date<\/span><strong>2092-03-10/)
  } finally { await srv.close() }
})

test('Chewy orders and support require active account plus store/session, and only eligible lifecycle actions succeed', async () => {
  const srv = await startServer(); try {
    const c = srv.client(); await setup(c); await c.post('/chewy/cart/add', { id: 'dog-food', qty: 1 }); await c.post('/chewy/checkout', buyer)
    const [order] = await c.json('/api/orders?store=chewy'), path = '/chewy/account/orders/' + order.id
    const details = await c.get(path); assert.match(details.text, /processing/); assert.match(details.text, /Cancel order/); assert.doesNotMatch(details.text, />Request a return</)
    assert.equal((await c.post(path + '/action', { action: 'return', reason: 'Wrong size' })).status, 400)
    assert.match((await c.get('/chewy/help?q=cadence')).text, /1 topics/)
    const invalidCase = await c.post('/chewy/help/cases', { category: 'autoship', subject: 'My schedule', message: 'short', email: 'bad' }); assert.equal(invalidCase.status, 400); assert.match(invalidCase.text, /value="My schedule"/)
    const receipt = await c.post('/chewy/help/cases', { category: 'shipping', subject: 'Check my address', message: 'Please help me check the saved delivery address.', email: account.email, order_id: order.id }); assert.match(receipt.text, /No message has been sent/); assert.match(receipt.text, /View linked order/)
    const casePath = new URL(receipt.url).pathname
    await switchOwner(c, 'chewy-orders-owner-b@example.com')
    assert.equal((await c.get(path)).status, 404); assert.equal((await c.get('/chewy/order/' + order.id)).status, 404); assert.equal((await c.post(path + '/action', { action: 'cancel', reason: 'Foreign attempt' })).status, 404)
    assert.equal((await c.get(casePath)).status, 404); assert.equal((await c.get('/chewy/help/cases/new?order_id=' + order.id)).status, 404)
    assert.equal((await c.post('/chewy/help/cases', { category: 'shipping', subject: 'Foreign order', message: 'This must not link someone else’s order.', email: 'b@example.com', order_id: order.id })).status, 400)
    assert.doesNotMatch((await c.get('/chewy/account/orders')).text, new RegExp(order.order_number))
    const other = srv.client(); await other.post('/chewy/account', account); assert.equal((await other.get(path)).status, 404); assert.equal((await other.get(casePath)).status, 404)
    await c.post('/chewy/account', account); assert.match((await c.post(path + '/action', { action: 'cancel', reason: 'Ordered twice' })).text, /This order is cancelled/)
    await c.post('/chewy/cart/add', { id: 'cat-food', qty: 1 }); await c.post('/chewy/checkout', buyer)
    const second = (await c.json('/api/orders?store=chewy')).find(o => o.id !== order.id)
    getOrder(second.id).meta.lifecycle = [{ status: 'delivered', action: 'test-fixture', reason: 'Test eligible state' }]
    const returned = await c.post('/chewy/account/orders/' + second.id + '/action', { action: 'return', reason: 'Unopened package' }); assert.match(returned.text, /return requested/); assert.match(returned.text, /No return label or refund/)
    const foreignStore = recordOrder({ ...getOrder(second.id), store: 'nike', session: { id: second.session_id }, order_number: 'FOREIGN-TEST' })
    assert.equal((await c.get('/chewy/account/orders/' + foreignStore.id)).status, 404)
    assert.equal((await c.post(path.replace(order.id, foreignStore.id) + '/action', { action: 'cancel', reason: 'Wrong store' })).status, 404)
  } finally { await srv.close() }
})
