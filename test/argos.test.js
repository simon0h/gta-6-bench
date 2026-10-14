import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer } from './helpers.js'

const DETAILS = { first_name: 'Alex', last_name: 'Tester', phone: '07700 900123', line1: '10 High Street', city: 'London', postcode: 'SW1A 1AA', method: 'ship' }
const CARD = { name_on_card: 'Alex Tester', card_number: '4242424242424242', expiry: '12/99', cvv: '123', billing_same: '1', terms: '1' }
const route = response => new URL(response.url).pathname
async function add(c, sku = '8747444', qty = '1') {
  await c.post(`/argos/product/${sku}/stock`, { postcode: 'SW1A 1AA' })
  return c.post('/argos/trolley/add', { sku, qty, age_confirmed: '1' })
}
async function guest(c) {
  await add(c)
  await c.post('/argos/account', { action: 'guest', email: 'guest@example.com' })
  return c.post('/argos/checkout/details', DETAILS)
}

test('argos: search to guest delivery checkout records canonical products and clears the trolley', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    for (const q of ['gta 6', 'gta vi', 'grand theft auto', 'grand theft auto vi', 'GTA6']) {
      const results = await c.get(`/argos/search?q=${encodeURIComponent(q)}`)
      assert.match(results.text, /href="\/argos\/product\/8747444"/)
      assert.match(results.text, /href="\/argos\/product\/8747437"/)
    }
    const product = await c.get('/argos/product/8747444')
    assert.match(product.text, /No disc included/)
    assert.match(product.text, /<html lang="en">/)
    assert.match(product.text, /name="viewport"/)
    assert.doesNotMatch(product.text, /Synthetic benchmark environment/)
    const cart = await add(c, '8747444', '2')
    assert.equal(route(cart), '/argos/trolley')
    assert.equal(route(await c.get('/argos/checkout')), '/argos/account')
    const details = await c.post('/argos/account', { action: 'guest', email: 'guest@example.com' })
    assert.equal(route(details), '/argos/checkout/details')
    const payment = await c.post('/argos/checkout/details', DETAILS)
    assert.equal(route(payment), '/argos/checkout/payment')
    const done = await c.post('/argos/checkout/payment', CARD)
    assert.equal(done.status, 200)
    assert.match(route(done), /^\/argos\/checkout\/confirmation\/\d{9}$/)
    assert.match(done.text, /Thanks for your order/)
    assert.match(done.text, /Visa ending 4242/)
    const orders = await c.json('/api/orders?store=argos')
    assert.equal(orders.length, 1)
    const order = orders[0]
    assert.deepEqual(order.items.map(({ platform, edition, format, qty, unit_price }) => ({ platform, edition, format, qty, unit_price })), [{ platform: 'ps5', edition: 'standard', format: 'code-in-box', qty: 2, unit_price: 67.99 }])
    assert.equal(order.customer.email, 'guest@example.com')
    assert.equal(order.customer.guest, true)
    assert.equal(order.fulfillment.method, 'ship')
    assert.equal(order.shipping_address.postal_code, 'SW1A 1AA')
    assert.deepEqual(order.payment, { method: 'card', brand: 'Visa', last4: '4242', name_on_card: 'Alex Tester' })
    assert.deepEqual(order.totals, { subtotal: 135.98, shipping: 0, tax: 0, discount: 0, total: 135.98 })
    assert.equal(order.currency, 'GBP')
    assert.doesNotMatch(JSON.stringify(order), /4242424242424242|"cvv"/)
    assert.match((await c.get('/argos/trolley')).text, /Your trolley is empty/)
    await c.post('/argos/checkout/payment', CARD)
    assert.equal((await c.json('/api/orders?store=argos')).length, 1, 'resubmitting payment does not duplicate orders')
  } finally { await srv.close() }
})

test('argos: account sign-in and collection preserve Xbox edition and a separate billing address', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    await add(c, '8747437')
    const wrong = await c.post('/argos/account', { action: 'signin', email: 'tester@example.com', password: 'wrong' })
    assert.equal(wrong.status, 400)
    assert.match(wrong.text, /email or password is incorrect/)
    await c.post('/argos/account', { action: 'signin', email: 'tester@example.com', password: 'Password123!' })
    const invalid = await c.post('/argos/checkout/details', { ...DETAILS, method: 'pickup', collection_point: 'Forged shop' })
    assert.equal(invalid.status, 400)
    assert.match(invalid.text, /Choose a collection store/)
    await c.post('/argos/checkout/details', { ...DETAILS, method: 'pickup', collection_point: 'London Central Argos' })
    const done = await c.post('/argos/checkout/payment', { ...CARD, billing_same: '0', billing_line1: '20 New Street', billing_city: 'Manchester', billing_postcode: 'M1 1AA' })
    assert.equal(done.status, 200)
    const [order] = await c.json('/api/orders?store=argos')
    assert.equal(order.items[0].platform, 'xbox')
    assert.equal(order.customer.guest, false)
    assert.equal(order.customer.account_id, 'argos-1')
    assert.equal(order.fulfillment.method, 'pickup')
    assert.equal(order.fulfillment.store_location, 'London Central Argos')
    assert.equal(order.shipping_address, null)
    assert.equal(order.billing_address.line1, '20 New Street')
    assert.equal(order.totals.total, 67.99)
  } finally { await srv.close() }
})

test('argos: missing details, invalid card and missing terms rerender without storing sensitive data', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    await add(c)
    await c.post('/argos/account', { action: 'guest', email: 'guest@example.com' })
    const missing = await c.post('/argos/checkout/details', { first_name: '<Alex>', postcode: 'bad' })
    assert.equal(missing.status, 400)
    assert.match(missing.text, /value="&lt;Alex&gt;"/)
    assert.match(missing.text, /valid UK postcode/)
    assert.equal(route(await c.post('/argos/checkout/payment', CARD)), '/argos/checkout/details')
    await c.post('/argos/checkout/details', DETAILS)
    const bad = await c.post('/argos/checkout/payment', { ...CARD, card_number: '4111111111111112', cvv: '987', name_on_card: 'Retained Name' })
    assert.equal(bad.status, 400)
    assert.match(bad.text, /Enter a valid card number/)
    assert.match(bad.text, /value="Retained Name"/)
    assert.doesNotMatch(bad.text, /4111111111111112|value="987"/)
    assert.match(bad.text, /name="card_number"[^>]*value=""/)
    const terms = await c.post('/argos/checkout/payment', { ...CARD, terms: '0' })
    assert.equal(terms.status, 400)
    assert.match(terms.text, /Please agree/)
    const billing = await c.post('/argos/checkout/payment', { ...CARD, billing_same: '0', billing_postcode: 'bad' })
    assert.equal(billing.status, 400)
    assert.match(billing.text, /billing postcode/)
    assert.equal((await c.json('/api/orders?store=argos')).length, 0)
  } finally { await srv.close() }
})

test('argos: stock, age and quantity validation prevents fabricated cart contents and client prices', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    let r = await c.post('/argos/trolley/add', { sku: '8747444', qty: '1' })
    assert.equal(r.status, 400)
    assert.match(r.text, /Check stock using your postcode/)
    assert.match(r.text, /confirm you are 18 or over/)
    assert.equal((await c.post('/argos/product/8747444/stock', { postcode: '123' })).status, 400)
    await c.post('/argos/product/8747444/stock', { postcode: 'SW1A 1AA' })
    for (const qty of ['0', '-1', '1.5', '1junk', '6', '999999']) {
      assert.equal((await c.post('/argos/trolley/add', { sku: '8747444', qty, age_confirmed: '1' })).status, 400)
    }
    assert.equal((await c.post('/argos/trolley/add', { sku: 'fake', qty: '1', age_confirmed: '1' })).status, 400)
    r = await c.post('/argos/trolley/add', { sku: '8747444', qty: '1', age_confirmed: '1', unit_price: '0', platform: 'xbox' })
    assert.match(r.text, /£67\.99/)
    await c.post('/argos/trolley/update', { sku: '8747444', qty: '2', action: 'update' })
    assert.match((await c.get('/argos/trolley')).text, /£135\.98/)
    await c.post('/argos/trolley/update', { sku: '8747444', action: 'remove' })
    assert.match((await c.get('/argos/trolley')).text, /Your trolley is empty/)
  } finally { await srv.close() }
})

test('argos: sessions isolate stock, cart, checkout and confirmation access', async () => {
  const srv = await startServer()
  try {
    const a = srv.client(), b = srv.client()
    await guest(a)
    assert.match((await b.get('/argos/trolley')).text, /Your trolley is empty/)
    assert.equal(route(await b.post('/argos/checkout/payment', CARD)), '/argos/trolley')
    assert.equal((await b.post('/argos/trolley/add', { sku: '8747444', qty: '1', age_confirmed: '1' })).status, 400)
    const done = await a.post('/argos/checkout/payment', CARD)
    assert.equal((await b.get(route(done))).status, 404)
    assert.equal((await a.get(route(done))).status, 200)
  } finally { await srv.close() }
})

test('argos: shoppers can register an account and finish checkout', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    await add(c)
    const invalid = await c.post('/argos/account/register', { first_name: 'Alex', last_name: 'Tester', email: 'new@example.com', password: 'short' })
    assert.equal(invalid.status, 400)
    assert.doesNotMatch(invalid.text, /value="short"/)
    const account = await c.post('/argos/account/register', { first_name: 'Alex', last_name: 'Tester', email: 'new@example.com', password: 'Password123!' })
    assert.equal(route(account), '/argos/checkout/details')
    await c.post('/argos/checkout/details', DETAILS)
    await c.post('/argos/checkout/payment', CARD)
    const [order] = await c.json('/api/orders?store=argos')
    assert.equal(order.customer.email, 'new@example.com')
    assert.equal(order.customer.guest, false)
  } finally { await srv.close() }
})

test('argos: category search, price sort and surrounding products are real browse destinations', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    const home = await c.get('/argos/')
    assert.match(home.text, /Make room for what you love/)
    assert.match(home.text, /Nectar at Argos/)
    const toys = await c.get('/argos/search?category=Toys&sort=price-asc')
    assert.match(toys.text, /LEGO Classic Creative Bricks/)
    assert.doesNotMatch(toys.text, /href="\/argos\/product\/8747444"/)
    const gaming = await c.get('/argos/search?category=Gaming&q=grand+theft+auto&sort=price-asc')
    assert.ok(gaming.text.indexOf('/product/9901002') < gaming.text.indexOf('/product/8747444'))
    const noMatch = await c.get('/argos/search?q=gta+6&category=Toys')
    assert.match(noMatch.text, /0 products/)
    const kettle = await c.get('/argos/product/9901005')
    assert.doesNotMatch(kettle.text, /name="age_confirmed"/)
    assert.doesNotMatch(kettle.text, /No disc included/)
  } finally { await srv.close() }
})

test('argos: a surrounding catalog purchase is recorded as the wrong item, never as GTA VI', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    await c.post('/argos/product/9901005/stock', { postcode: 'SW1A 1AA' })
    await c.post('/argos/trolley/add', { sku:'9901005', qty:'1' })
    await c.post('/argos/account', { action:'guest', email:'other@example.com' })
    await c.post('/argos/checkout/details', DETAILS)
    const done = await c.post('/argos/checkout/payment', CARD)
    assert.equal(done.status, 200)
    const orders = await c.json('/api/orders?store=argos')
    assert.deepEqual(orders[0].items.map(({kind,title,unit_price})=>({kind,title,unit_price})), [{kind:'other',title:'Russell Hobbs 1.7L Cordless Kettle - Black',unit_price:29.99}])
    assert.doesNotMatch(done.text, /undefined/)
  } finally { await srv.close() }
})
