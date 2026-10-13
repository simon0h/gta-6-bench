import test from 'node:test'
import assert from 'node:assert/strict'
import { COLLECTION_POINTS, findCollectionPoints, totals } from '../stores/jb-hifi/data.js'
import { informationPage, paymentPage } from '../stores/jb-hifi/pages.js'
import { startServer, fieldValue } from './helpers.js'

const urls = { cart: '/jb-hifi/cart', information: '/information', shipping: '/shipping', payment: '/payment', logout: '/logout' }
const path = r => new URL(r.url).pathname + new URL(r.url).search

test('JB captured collection fixtures are limited to the observed area and render escaped point values', () => {
  for (const query of ['3000', 'Melbourne 3000', 'Melbourne, VIC 3000']) assert.equal(findCollectionPoints(query).length, 5)
  for (const query of ['', '2000', 'Melbourne 3001', '3000 Sydney', '<script>3000</script>']) assert.deepEqual(findCollectionPoints(query), [])
  const t = totals({ cart: [{ pid: '903000', qty: 1 }] }, 'collection_point')
  assert.equal(t.shipping, 4.99)
  assert.equal(t.total, 133.99)
  const info = informationPage({ urls, t, values: { delivery_method: 'collection_point', point_query: '3000' }, pointQuery: '3000', points: COLLECTION_POINTS })
  assert.match(info, /5 pickup points near your location/)
  assert.match(info, /name="point_id" value="melbourne-gpo-boxes" checked/)
  assert.match(info, />Continue to payment<\/button>/)
  assert.match(info, /name="email"[^>]*placeholder=" "/)
  const hostile = informationPage({ urls, t, points: [{ id: '<bad>', name: '<script>', address: '" test', price: 4.99 }], values: {} })
  assert.doesNotMatch(hostile, /<script>/)
  assert.match(hostile, /&lt;script&gt;/)
  const pay = paymentPage({ urls, t, info: { method: 'collection_point', email: 'test@example.com' }, shipping: { name: 'Ship to collection point', price: 4.99 }, collectionPoint: COLLECTION_POINTS[0], reviewToken: 'local-test' })
  assert.match(pay, /MELBOURNE GPO BOXES/)
  assert.match(pay, /name="billing_first_name"/)
  assert.doesNotMatch(pay, /Same as shipping address/)
})

test('JB guest collection checkout validates point and email, skips shipping and records the captured fee', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    await c.post('/jb-hifi/cart/add', { id: '903000', return: '/jb-hifi/products/playstation-5-grand-theft-auto-vi' })
    const initial = await c.post('/jb-hifi/checkout')
    const fields = { delivery_method: 'collection_point', point_query: 'Melbourne 3000', point_country: 'AU', point_id: 'qv-parcel-locker' }
    const found = await c.post(path(initial), { ...fields, find_points: '1' })
    assert.equal(found.status, 200)
    assert.match(found.text, /5 pickup points near your location/)
    const missingEmail = await c.post(path(initial), fields)
    assert.equal(missingEmail.status, 400)
    assert.match(missingEmail.text, /Enter an email/)
    assert.doesNotMatch(missingEmail.text, /Enter a first name/)
    const invalidPoint = await c.post(path(initial), { ...fields, email: 'alex@example.com', point_id: '__proto__' })
    assert.equal(invalidPoint.status, 400)
    assert.match(invalidPoint.text, /Choose a collection point/)
    const wrongArea = await c.post(path(initial), { ...fields, email: 'alex@example.com', point_query: '2000' })
    assert.equal(wrongArea.status, 400)
    const payment = await c.post(path(initial), { ...fields, email: 'alex@example.com' })
    assert.match(path(payment), /\/payment$/)
    assert.match(payment.text, /QV Parcel Locker/)
    assert.match(payment.text, /\$133\.99/)
    const body = { payment_method: 'card', card_number: '4242424242424242', card_expiry: '12/29', card_cvv: '123', card_name: 'Alex Tester', review_token: fieldValue(payment.text, 'review_token'), billing_country: 'AU', billing_first_name: 'Alex', billing_last_name: 'Tester', billing_address1: '1 Test St', billing_suburb: 'Melbourne', billing_state: 'VIC', billing_postcode: '3000' }
    const done = await c.post(path(payment), body)
    assert.equal(done.status, 200)
    assert.match(done.text, /Your order is confirmed/)
    assert.match(done.text, /QV Parcel Locker/)
    const orders = await c.json('/api/orders?store=jb-hifi')
    assert.equal(orders.length, 1)
    const order = orders[0]
    assert.equal(order.fulfillment.option, 'collection_point')
    assert.equal(order.fulfillment.collection_point_id, 'qv-parcel-locker')
    assert.equal(order.fulfillment.collection_point_name, 'QV Parcel Locker')
    assert.equal(order.shipping_address.line1, '213-219 Little Lonsdale St')
    assert.equal(order.shipping_address.postal_code, '3000')
    assert.deepEqual(order.totals, { subtotal: 129, shipping: 4.99, tax: 0, total: 133.99 })
  } finally { await srv.close() }
})
