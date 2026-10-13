import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer } from './helpers.js'

const PS5 = 'B0H6K928WL', KETTLE = 'A0HOMEKT1'
const ADDRESS = { label: 'Home', name: 'Alex Tester', phone: '3055550123', line1: '123 Ocean Dr', line2: '', city: 'Miami', state: 'FL', postal_code: '33139', instructions: 'Leave with reception' }
const CARD = { cardNumber: '4242424242424242', nameOnCard: 'Alex Tester', expMonth: '12', expYear: '2031' }
const main = text => /<main[^>]*>([\s\S]*?)<\/main>/.exec(text)?.[1] || text
const idOfAddress = text => /data-address-id="([^"]+)"/.exec(text)[1]
const listId = response => new URL(response.url).pathname.split('/').at(-1)
async function signin(c, email = 'tester@example.com', password = 'Password123!') {
  await c.post('/amazon/ax/claim', { email })
  return c.post('/amazon/ap/signin/password', { password })
}
async function buy(c, asin = PS5, addressId = '') {
  await c.post('/amazon/gp/product/handle-buy-box', { ASIN: asin, quantity: '1', 'submit.buy-now': '1' })
  await c.post('/amazon/gp/buy/addressselect', addressId ? { addressId } : { countryCode: 'US', fullName: 'Alex Tester', phoneNumber: '3055550123', addressLine1: '123 Ocean Dr', city: 'Miami', state: 'FL', postalCode: '33139' })
  await c.post('/amazon/gp/buy/payselect', CARD)
  const done = await c.post('/amazon/gp/buy/spc', { delivery: 'standard', action: 'place' })
  assert.equal(done.status, 200)
  assert.match(done.text, /Order placed, thanks!/)
  const orders = await c.json('/api/orders?store=amazon')
  return { order: orders.at(-1), done }
}

test('amazon journeys: guest wishlist intent resumes once; list edit, move, cart, removal and account isolation persist', async () => {
  const srv = await startServer()
  try {
    const c = srv.client(), stranger = srv.client()
    assert.doesNotMatch(main((await c.get(`/amazon/dp/${PS5}?added_to_list=1`)).text), /Saved in|item added to Your List/)
    const wall = await c.post('/amazon/hz/wishlist/add', { asin: PS5 })
    assert.match(wall.url, /\/ap\/signin\?/)
    const resumed = await signin(c)
    assert.match(resumed.url, /\/hz\/wishlist\/ls\/default$/)
    assert.equal((main(resumed.text).match(/class="az-list-item"/g) || []).length, 1)
    assert.match(resumed.text, /Item added to your list/)
    await c.post('/amazon/hz/wishlist/add', { asin: PS5 })
    assert.equal((main((await c.get('/amazon/hz/wishlist/ls')).text).match(/class="az-list-item"/g) || []).length, 1, 'repeat add is idempotent')
    const created = await c.post('/amazon/hz/wishlist/ls', { name: 'Holiday <ideas>' }), id = listId(created)
    assert.match(created.text, /Holiday &lt;ideas&gt;/)
    await c.post(`/amazon/hz/wishlist/ls/default/items/${PS5}`, { action: 'update', quantity: 2, priority: 'High', note: 'For my <brother>' })
    const invalidEdit = await c.post(`/amazon/hz/wishlist/ls/default/items/${PS5}`, { action: 'update', quantity: '2.5', priority: 'High', note: 'Keep this comment' })
    assert.equal(invalidEdit.status, 400)
    assert.match(invalidEdit.text, /value="Keep this comment"/)
    assert.match(invalidEdit.text, /value="2.5"/)
    await c.post(`/amazon/hz/wishlist/ls/default/items/${PS5}`, { action: 'move', target: id })
    const moved = await c.get(`/amazon/hz/wishlist/ls/${id}`)
    assert.match(moved.text, /For my &lt;brother&gt;/)
    assert.match(moved.text, /<option selected>2<\/option>/)
    assert.doesNotMatch(main((await c.get('/amazon/hz/wishlist/ls/default')).text), /class="az-list-item"/)
    await c.post(`/amazon/hz/wishlist/ls/${id}/items/${PS5}`, { action: 'cart', quantity: 5, price: '.01', kind: 'other' })
    assert.match((await c.get('/amazon/cart')).text, /2 items/)
    assert.match((await c.get(`/amazon/hz/wishlist/ls/${id}`)).text, /class="az-list-item"/)
    await signin(stranger)
    assert.equal((await stranger.get(`/amazon/hz/wishlist/ls/${id}`)).status, 404)
    assert.equal((await stranger.post(`/amazon/hz/wishlist/ls/${id}/items/${PS5}`, { action: 'cart' })).status, 404)
    await c.get('/amazon/gp/flex/sign-out.html')
    await c.post('/amazon/ax/claim', { email: 'lists.other@example.com' })
    await c.post('/amazon/ap/register', { customerName: 'Second Shopper', email: 'lists.other@example.com', password: 'secret12', passwordCheck: 'secret12' })
    assert.equal((await c.get(`/amazon/hz/wishlist/ls/${id}`)).status, 404)
    await c.get('/amazon/gp/flex/sign-out.html')
    await signin(c)
    assert.match((await c.get(`/amazon/hz/wishlist/ls/${id}`)).text, /For my &lt;brother&gt;/)
    await c.post(`/amazon/hz/wishlist/ls/${id}/items/${PS5}`, { action: 'remove' })
    await c.post(`/amazon/hz/wishlist/ls/${id}/manage`, { action: 'rename', name: 'Next year' })
    assert.match((await c.get(`/amazon/hz/wishlist/ls/${id}`)).text, /Next year/)
    await c.post(`/amazon/hz/wishlist/ls/${id}/manage`, { action: 'delete' })
    assert.equal((await c.get(`/amazon/hz/wishlist/ls/${id}`)).status, 404)
    assert.equal((await c.post('/amazon/hz/wishlist/add', { asin: 'FAKE' })).status, 400)
  } finally { await srv.close() }
})

test('amazon journeys: address book validates, selects default for checkout, snapshots orders and rejects foreign IDs', async () => {
  const srv = await startServer()
  try {
    const c = srv.client(), other = srv.client()
    await c.get('/amazon/a/addresses')
    const landing = await signin(c)
    assert.match(landing.url, /\/a\/addresses$/)
    const bad = await c.post('/amazon/a/addresses', { ...ADDRESS, postal_code: '33' })
    assert.equal(bad.status, 400)
    assert.match(bad.text, /value="Miami"/)
    assert.match(bad.text, /valid postal code/)
    const first = await c.post('/amazon/a/addresses', ADDRESS), home = idOfAddress(first.text)
    const second = await c.post('/amazon/a/addresses', { ...ADDRESS, label: 'Work', line1: '75 Brickell Ave', is_default: 'yes' })
    const ids = [...second.text.matchAll(/data-address-id="([^"]+)"/g)].map(m => m[1]), work = ids.find(id => id !== home)
    assert.match((await c.get('/amazon/')).text, /Miami 33139/)
    await c.post(`/amazon/a/addresses/${home}/default`, {})
    assert.match((await c.get('/amazon/a/addresses')).text, /Default: Home/)
    await signin(other)
    assert.equal((await other.get(`/amazon/a/addresses/edit?id=${home}`)).status, 404)
    await other.post('/amazon/cart/add', { asin: PS5 })
    const forged = await other.post('/amazon/gp/buy/addressselect', { addressId: home })
    assert.equal(forged.status, 400)
    assert.match(forged.text, /Choose one of your saved addresses/)
    const { order } = await buy(c, PS5, work)
    assert.equal(order.shipping_address.line1, '75 Brickell Ave')
    assert.equal(order.meta.delivery_instructions, 'Leave with reception')
    await c.post('/amazon/a/addresses', { ...ADDRESS, id: work, label: 'Work', line1: '100 Updated Ave' })
    const details = await c.get(`/amazon/gp/your-account/order-details?orderID=${order.id}`)
    assert.match(main(details.text), /75 Brickell Ave/)
    assert.doesNotMatch(main(details.text), /100 Updated Ave/)
    await c.post(`/amazon/a/addresses/${home}/remove`, {})
    assert.match((await c.get('/amazon/a/addresses')).text, /Default: Work/)
    await c.post('/amazon/gp/product/handle-buy-box', { ASIN: KETTLE, quantity: 1, 'submit.buy-now': 1 })
    const saveAtCheckout = await c.post('/amazon/gp/buy/addressselect', { countryCode: 'US', fullName: 'Alex Tester', phoneNumber: '3055550123', addressLine1: '88 New St', city: 'Miami', state: 'FL', postalCode: '33139', saveAddress: 'yes', isDefault: '1' })
    assert.match(saveAtCheckout.url, /payselect$/)
    assert.match((await c.get('/amazon/a/addresses')).text, /88 New St/)
  } finally { await srv.close() }
})

test('amazon journeys: session-owned order detail, tracking, cancellation and return gates preserve canonical transaction', async () => {
  const srv = await startServer()
  try {
    const c = srv.client(), other = srv.client()
    await signin(c)
    const { order, done } = await buy(c)
    const detailPath = `/amazon/gp/your-account/order-details?orderID=${order.id}`
    const detail = await c.get(detailPath)
    assert.match(main(detail.text), /ending in 4242/)
    assert.doesNotMatch(detail.text, /4242424242424242/)
    assert.match(main((await c.get(`/amazon/gp/css/order-history?search=${order.order_number}`)).text), new RegExp(order.order_number))
    assert.doesNotMatch(main((await c.get('/amazon/gp/css/order-history?search=does-not-exist')).text), /data-order-id/)
    const tracking = await c.get(`/amazon/orders/${order.id}/track`)
    assert.match(tracking.text, /Not yet shipped/)
    assert.match(tracking.text, /November 19, 2026/)
    assert.equal((await c.post(`/amazon/orders/${order.id}/return`, { reason: 'No longer needed' })).status, 400)
    await signin(other)
    assert.doesNotMatch(main((await other.get('/amazon/gp/css/order-history')).text), new RegExp(order.order_number))
    for (const path of [detailPath, `/amazon/orders/${order.id}/track`, `/amazon/orders/${order.id}/cancel`, done.url]) assert.equal((await other.get(path)).status, 404, path)
    assert.equal((await other.post(`/amazon/orders/${order.id}/cancel`, { reason: 'No longer needed' })).status, 404)
    assert.equal((await c.post(`/amazon/orders/${order.id}/cancel`, { reason: 'unlisted' })).status, 400)
    const canceled = await c.post(`/amazon/orders/${order.id}/cancel`, { reason: 'No longer needed', details: 'Changed plans <now>' })
    assert.match(main(canceled.text), /This order has been canceled/)
    assert.match(main(canceled.text), /Changed plans &lt;now&gt;/)
    await c.post(`/amazon/orders/${order.id}/cancel`, { reason: 'No longer needed' })
    const [record] = await c.json('/api/orders?store=amazon')
    assert.equal(record.meta.lifecycle.length, 1)
    assert.equal(record.meta.lifecycle[0].status, 'cancelled')
    assert.deepEqual(record.items, order.items)
    assert.deepEqual(record.totals, order.totals)
    assert.deepEqual(record.payment, order.payment)
    assert.match((await c.get(`/amazon/orders/${order.id}/track`)).text, /no package to track/)
    assert.match(main((await c.get('/amazon/gp/css/order-history?view=cancelled')).text), new RegExp(order.order_number))
    assert.doesNotMatch(main((await c.get('/amazon/gp/css/order-history?view=processing')).text), /data-order-id/)
    await c.get('/amazon/gp/flex/sign-out.html')
    await c.post('/amazon/ax/claim', { email: 'order.other@example.com' })
    await c.post('/amazon/ap/register', { customerName: 'Other User', email: 'order.other@example.com', password: 'secret12', passwordCheck: 'secret12' })
    assert.equal((await c.get(detailPath)).status, 404, 'same session, different account cannot see order')
  } finally { await srv.close() }
})

test('amazon journeys: help search, articles and local cases support owned orders, preserve errors and escape messages', async () => {
  const srv = await startServer()
  try {
    const c = srv.client(), other = srv.client()
    for (const [query, article] of [['preorder price','preorder'],['shipping date','delivery'],['cancellation','cancel'],['changing address','addresses']]) {
      const result = await c.get(`/amazon/help?q=${encodeURIComponent(query)}`)
      assert.equal(result.status, 200)
      assert.match(main(result.text), new RegExp(`href="/amazon/help/${article}"`))
    }
    assert.match((await c.get('/amazon/help?q=unknowable123')).text, /No articles match/)
    assert.equal((await c.get('/amazon/gp/help/customer/display.html?nodeId=preorder')).status, 200)
    assert.equal((await c.get('/amazon/help/missing')).status, 404)
    await signin(c)
    const { order } = await buy(c, KETTLE)
    const values = { category: 'Shipping & Delivery', order_id: order.id, subject: 'Delivery instructions', email: 'alex@example.com', message: 'Please leave the package at <reception>.' }
    const bad = await c.post('/amazon/hz/contact-us', { ...values, message: 'short' })
    assert.equal(bad.status, 400)
    assert.match(bad.text, /Delivery instructions/)
    assert.match(bad.text, />short<\/textarea>/)
    const saved = await c.post('/amazon/hz/contact-us', values)
    assert.equal(saved.status, 200)
    assert.match(saved.text, /Received locally/)
    assert.match(saved.text, /&lt;reception&gt;/)
    assert.match(saved.text, /No email was sent/)
    const id = /data-case-id>([^<]+)</.exec(saved.text)[1]
    assert.match((await c.get('/amazon/hz/contact-us/cases')).text, new RegExp(id))
    await signin(other)
    assert.equal((await other.get(`/amazon/hz/contact-us/cases/${id}`)).status, 404)
    assert.equal((await other.post('/amazon/hz/contact-us', values)).status, 400)
    assert.doesNotMatch(main((await other.get('/amazon/hz/contact-us/cases')).text), /Delivery instructions/)
    assert.equal((await c.post('/amazon/hz/contact-us', { ...values, category: 'Fake topic' })).status, 400)
  } finally { await srv.close() }
})

test('amazon journeys: recent views deduplicate, remove, clear and honor disabled history with session/account isolation', async () => {
  const srv = await startServer()
  try {
    const c = srv.client(), other = srv.client()
    await c.get(`/amazon/dp/${PS5}`)
    await c.get(`/amazon/dp/${KETTLE}`)
    await c.get(`/amazon/dp/${PS5}`)
    const recent = main((await c.get('/amazon/gp/history')).text)
    assert.equal((recent.match(/<article>/g) || []).length, 2)
    assert.ok(recent.indexOf(PS5) < recent.indexOf(KETTLE))
    assert.doesNotMatch(main((await other.get('/amazon/gp/history')).text), /<article>/)
    await c.post('/amazon/gp/history', { action: 'remove', asin: PS5 })
    assert.doesNotMatch(main((await c.get('/amazon/gp/history')).text), new RegExp(PS5))
    await c.post('/amazon/gp/history', { action: 'settings' })
    await c.get(`/amazon/dp/${PS5}`)
    assert.doesNotMatch(main((await c.get('/amazon/gp/history')).text), new RegExp(PS5))
    await c.post('/amazon/gp/history', { action: 'clear' })
    assert.match(main((await c.get('/amazon/gp/history')).text), /No products to show/)
    await c.post('/amazon/gp/history', { action: 'settings', enabled: 'yes' })
    await c.get(`/amazon/dp/${KETTLE}`)
    await signin(c)
    assert.doesNotMatch(main((await c.get('/amazon/gp/history')).text), /<article>/, 'guest history stays separate from account history')
    assert.equal((await c.post('/amazon/gp/history', { action: 'remove', asin: 'fake' })).status, 400)
  } finally { await srv.close() }
})

test('amazon journeys: account, list and help links resolve to meaningful pages with protected return targets', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    const account = await c.get('/amazon/your-account')
    assert.equal(account.status, 200)
    assert.match(account.text, /Sign in to your account/)
    await c.get('/amazon/a/addresses/add')
    assert.match((await signin(c)).url, /\/a\/addresses\/add$/)
    for (const route of ['/gp/css/homepage.html','/hz/wishlist/ls','/a/addresses','/gp/history','/gp/css/order-history','/gp/your-account/order-history','/gp/css/returns/homepage.html','/help','/hz/contact-us','/hz/contact-us/cases']) {
      const page = await c.get(`/amazon${route}`)
      assert.equal(page.status, 200, route)
      for (const href of new Set([...main(page.text).matchAll(/href="([^"]+)"/g)].map(m=>m[1].replaceAll('&amp;','&')).filter(h=>h.startsWith('/amazon/')))) {
        assert.equal((await c.get(href)).status, 200, `${route} -> ${href}`)
      }
    }
    await c.get('/amazon/gp/flex/sign-out.html')
    assert.match((await c.get('/amazon/a/addresses')).url, /\/ap\/signin\?/)
    assert.match((await c.get('/amazon/gp/css/order-history')).url, /\/ap\/signin\?/)
  } finally { await srv.close() }
})
