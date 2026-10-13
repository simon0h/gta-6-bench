import { assertProductGallery } from './product-gallery-assertions.js'
import { galleryPrimaryImage, galleryImageUrls } from './helpers.js'
import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer, fieldValue } from './helpers.js'
import { products } from '../stores/nike/catalog.js'
import { getOrder } from '../lib/orders.js'

const profile = { first_name: 'Jordan', last_name: 'Verifier', phone: '5551234567', department: 'Women', sports: 'Running' }
const buyer = { email: 'nike97@example.com', first_name: 'Jordan', last_name: 'Verifier', address: '97 Example Street', city: 'Austin', state: 'TX', postal_code: '78701', card_name: 'Jordan Verifier', card_number: '4242424242424242', card_expiry: '12/39', card_cvv: '123' }
const login = c => c.post('/nike/account', { email: 'tester@example.com', password: 'Password123!' })

test('Nike rejects ambiguous product/search choices and inherited collection names', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    for (const route of ['/product/cushion-runner?Color=White&Color=Black', '/product/kids-tracksuit?Size=8Y&Size=10Y', '/product/kids-tracksuit?view=1&view=2', '/search?color=White&color=Black']) assert.equal((await c.get('/nike' + route)).status, 400, route)
    for (const id of ['__proto__', 'constructor', 'toString']) assert.equal((await c.get('/nike/collection/' + id)).status, 404, id)
    for (const form of [new URLSearchParams('id=windbreaker&option_Color=Black&option_Color=Blue&option_Size=M&qty=1'), new URLSearchParams('id=windbreaker&option_Color=Black&option_Size[value]=M&qty=1'), new URLSearchParams('id=windbreaker&option_Color=Black&option_Size=M&qty=1&qty=2')]) assert.equal((await c.post('/nike/cart/add', form)).status, 400)
    assert.match((await c.get('/nike/cart')).text, /is empty/)
  } finally { await srv.close() }
})

test('Nike Favorite roundtrip retains trusted color, size and gallery choices', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    const pdp = await c.get('/nike/product/cushion-runner?Color=White&Size=US%208')
    const favorite = /<form action="\/nike\/favorites"[\s\S]*?<\/form>/.exec(pdp.text)[0]
    assert.equal(fieldValue(favorite, 'Color'), 'White'); assert.equal(fieldValue(favorite, 'Size'), 'US 8')
    const saved = await c.post('/nike/favorites', { id: 'cushion-runner', Color: 'White', Size: 'US 8', view: '0' })
    assert.equal(new URL(saved.url).searchParams.get('Color'), 'White')
    assert.match(saved.text, /value="US 8" data-stock="2" checked/); assert.match(saved.text, /\$95.00/)
    const gallery = await c.post('/nike/favorites', { id: 'kids-tracksuit', Color: 'Blue', Size: '8Y', view: '2' })
    assert.equal(new URL(gallery.url).searchParams.get('view'), '2')
    const views = await assertProductGallery(c, gallery.text, 'nike', 'kids-tracksuit')
    assert.equal(galleryPrimaryImage(gallery.text), views[2])
    assert.equal((await c.post('/nike/favorites', { id: 'windbreaker', Color: 'Pink', Size: 'M' })).status, 400)
    assert.doesNotMatch((await c.get('/nike/favorites')).text, /product\/windbreaker/)
  } finally { await srv.close() }
})

test('Nike malformed optional fields cannot erase preferences, save partial addresses or detach support orders', async () => {
  const srv = await startServer()
  try {
    const c = srv.client(); await login(c); await c.post('/nike/account/profile', profile)
    const badProfile = new URLSearchParams(profile); badProfile.append('phone', '5559876543'); badProfile.delete('sports'); badProfile.append('sports[bad]', 'Tennis')
    const invalid = await c.post('/nike/account/profile', badProfile)
    assert.equal(invalid.status, 400); assert.equal(fieldValue(invalid.text, 'first_name'), 'Jordan')
    const unchanged = await c.get('/nike/account/profile'); assert.equal(fieldValue(unchanged.text, 'phone'), profile.phone); assert.match(unchanged.text, /value="Running" checked/)
    const address = new URLSearchParams({ name: 'Jordan Verifier', line1: '97 Example Street', city: 'Austin', state: 'TX', postal_code: '78701', phone: '5551234567' }); address.append('phone', '5559876543')
    assert.equal((await c.post('/nike/account/addresses', address)).status, 400)
    assert.match((await c.get('/nike/account/addresses')).text, /No saved addresses yet/)
    const support = new URLSearchParams({ category: 'Orders', email: buyer.email, subject: 'Order question', message: 'Please check this order.', order_id: 'not-owned' }); support.append('order_id', 'another-order')
    const rejected = await c.post('/nike/help/contact', support)
    assert.equal(rejected.status, 400); assert.equal(fieldValue(rejected.text, 'subject'), 'Order question')
    assert.match((await c.get('/nike/help/cases')).text, /no saved requests/)
  } finally { await srv.close() }
})

test('Nike aggregates stock across variants and rechecks trusted stock before recording an immutable other purchase', async () => {
  const srv = await startServer()
  const p = products.find(p => p.id === 'windbreaker'), stock = p.stock
  try {
    const c = srv.client()
    p.stock = 3
    assert.equal((await c.post('/nike/cart/add', { id: p.id, option_Color: 'Black', option_Size: 'M', qty: '2' })).status, 200)
    assert.equal((await c.post('/nike/cart/add', { id: p.id, option_Color: 'Blue', option_Size: 'M', qty: '2' })).status, 400)
    const review = await c.get('/nike/checkout')
    p.stock = 1
    assert.equal((await c.post('/nike/checkout', { ...buyer, checkout_token: fieldValue(review.text, 'checkout_token') })).status, 400)
    assert.deepEqual(await c.json('/api/orders?store=nike'), [])
    p.stock = stock
    const fresh = await c.get('/nike/checkout')
    assert.match((await c.post('/nike/checkout', { ...buyer, checkout_token: fieldValue(fresh.text, 'checkout_token'), kind: 'game', unit_price: '0.01' })).text, /Order confirmed/)
    const [order] = await c.json('/api/orders?store=nike'), snapshot = structuredClone(order)
    assert.equal(order.items[0].kind, 'other'); assert.equal(order.items[0].unit_price, 75)
    await c.post(`/nike/orders/${order.id}/action`, { action: 'cancel', reason: 'Changed plans' })
    assert.deepEqual(getOrder(order.id).items, snapshot.items)
    assert.deepEqual(getOrder(order.id).totals, snapshot.totals)
    assert.deepEqual(getOrder(order.id).payment, snapshot.payment)
    assert.deepEqual(getOrder(order.id).meta.options, snapshot.meta.options)
    assert.match((await c.post('/nike/checkout', { ...buyer, checkout_token: fieldValue(fresh.text, 'checkout_token') })).text, /is empty/)
    assert.equal((await c.json('/api/orders?store=nike')).length, 1)
  } finally { p.stock = stock; await srv.close() }
})
