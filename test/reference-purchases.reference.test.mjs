import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer, fieldValue } from './helpers.js'

// These verify the local benchmark contract, not a real retailer checkout.
const us = { firstName: 'Alex', lastName: 'Tester', address1: '123 Ocean Dr', city: 'Miami', state: 'FL', zip: '33139', country: 'US', phone: '3055550123' }
const au = { email: 'alex@example.com', first_name: 'Alex', last_name: 'Tester', phone: '0412 345 678', suburb: 'Sydney', state: 'NSW', postcode: '2000' }
const path = r => new URL(r.url).pathname
const flows = {
  'playstation-store': async c => {
    const sku = 'EP1004-PPSA01547_00-GTAVISTANDARD001'
    const login = '/playstation-store/my.account.sony.com/central/signin/'
    await c.post(login, { step: 'email', email: 'tester@example.com' })
    await c.post(login, { step: 'password', email: 'tester@example.com', password: 'Password123!' })
    await c.post('/playstation-store/en-us/preorder', { sku })
    const buy = `/playstation-store/en-us/checkout/buynow/${sku}`
    await c.post(`${buy}/payment/card`, { cardNumber: '4242424242424242', cardholderName: 'Alex Tester', expMonth: '12', expYear: '2039', cvv: '123' })
    const saved = await c.post(`${buy}/payment/card/billing`, us)
    return c.post(buy, { paymentMethod: fieldValue(saved.text, 'paymentMethod') })
  },
  'xbox-store': async c => {
    const product = '/xbox-store/en-US/games/store/grand-theft-auto-vi/9p3h4968grsm'
    await c.post(`${product}/preorder`)
    await c.post('/xbox-store/login.live.com/oauth20_authorize.srf', { loginfmt: 'tester@example.com' })
    await c.post('/xbox-store/login.live.com/password.srf', { passwd: 'Password123!' })
    await c.post('/xbox-store/login.live.com/kmsi.srf', { kmsi: 'yes' })
    await c.post(`${product}/buy`, { ...us, pi: 'new', payType: 'card', cardNumber: '4242424242424242', expMonth: '12', expYear: '2039', cvv: '123', nameOnCard: 'Alex Tester' })
    return c.post(`${product}/buy/confirm`)
  },
  'rockstar-store': async c => {
    await c.post('/rockstar-store/game/buy-gta-vi/preorder', { platform: 'ps5' })
    await c.post('/rockstar-store/verify-age', { month: '5', day: '14', year: '1990' })
    await c.post('/rockstar-store/checkout/guest')
    await c.post('/rockstar-store/checkout/shipping-address', { country: 'US', first_name: 'Alex', last_name: 'Tester', city: 'Miami', region: 'FL', postal_code: '33139', street_address: '123 Ocean Dr', phone: '3055550123', email: 'alex@example.com' })
    await c.post('/rockstar-store/checkout/shipping-method', { shipping_method: 'standard' })
    return c.post('/rockstar-store/checkout/payment', { payment_method: 'card', card_number: '4242424242424242', expiry: '12/39', cvc: '123', cardholder_name: 'Alex Tester' })
  },
  'game-uk': async c => {
    await c.post('/game-uk/cart/add', { pid: '756802', qty: '1', age_confirmed: '1' })
    await c.post('/game-uk/checkout/start')
    await c.post('/game-uk/account/login', { action: 'email', email: 'alex@example.com', returnUrl: '/checkout' })
    await c.post('/game-uk/account/login', { action: 'guest', email: 'alex@example.com', returnUrl: '/checkout' })
    await c.post('/game-uk/checkout/delivery', { title: 'Mr', firstName: 'Alex', lastName: 'Tester', addressLine1: '10 Downing Street', town: 'London', county: 'Greater London', postcode: 'SW1A 2AA', country: 'GB', mobile: '07700 900123', deliveryMethod: 'standard' })
    return c.post('/game-uk/checkout/payment', { paymentMethod: 'card', cardNumber: '4242424242424242', expiry: '12/39', cvv: '123', nameOnCard: 'Alex Tester', billingSame: '1' })
  },
  'jb-hifi': async c => {
    await c.post('/jb-hifi/cart/add', { id: '903000', qty: '1' })
    const info = await c.post('/jb-hifi/checkout')
    const shipping = await c.post(path(info), { ...au, delivery_method: 'delivery', country: 'AU', address1: '1 George St' })
    const payment = await c.post(path(shipping), { shipping_method: 'standard' })
    return c.post(path(payment), { payment_method: 'card', card_number: '4242424242424242', card_expiry: '12/39', card_cvv: '123', card_name: 'Alex Tester', billing: 'same' })
  },
  'eb-games-au': async c => {
    await c.post('/eb-games-au/cart/add', { sku: '330056', qty: '1' })
    await c.get('/eb-games-au/checkout')
    await c.post('/eb-games-au/checkout/guest', { guest_email: 'alex@example.com' })
    await c.post('/eb-games-au/checkout/delivery', { ...au, method: 'ship', address: '1 George St', shipping_method: 'standard' })
    return c.post('/eb-games-au/checkout/payment', { payment_method: 'card', card_number: '4242424242424242', card_expiry: '12/39', card_cvv: '123', card_name: 'Alex Tester', accept_deposit: 'yes' })
  },
}

for (const [store, flow] of Object.entries(flows)) {
  test(`reference inventory preserves ${store} local GTA purchase simulation`, async () => {
    const srv = await startServer()
    try {
      srv.reset()
      const c = srv.client(), done = await flow(c)
      assert.equal(done.status, 200)
      const orders = await c.json(`/api/orders?store=${store}`)
      assert.equal(orders.length, 1, `No simulated order after ${done.url}`)
      assert.equal(orders[0].items.length, 1)
      assert.match(orders[0].items[0].title, /Grand Theft Auto VI/)
      assert.equal(orders[0].items[0].qty, 1)
      assert.ok(orders[0].totals.total > 0)
      assert.equal(orders[0].payment.last4, '4242')
      assert.doesNotMatch(JSON.stringify(orders), /4242424242424242/)
    } finally { await srv.close() }
  })
}

test('listing-only regional retailers refuse stock and checkout bypasses', async () => {
  const srv = await startServer()
  try {
    srv.reset()
    const c = srv.client()
    for (const url of ['/argos/product/8747444/stock', '/argos/trolley/add', '/argos/checkout/details', '/argos/checkout/payment', '/smyths-toys/uk/en-gb/cart/add', '/smyths-toys/uk/en-gb/checkout/payment', '/smyths-toys/uk/en-gb/checkout/place-order']) {
      const r = await c.post(url, { sku: url.startsWith('/argos') ? '8747444' : '263307', qty: '1', postcode: 'SW1A 2AA', terms: '1' }, { follow: false })
      assert.ok(r.status >= 400, `${url}: ${r.status}`)
      assert.doesNotMatch(r.text, /Your order is confirmed|Your order number is/)
    }
    assert.deepEqual(await c.json('/api/orders'), [])
  } finally { await srv.close() }
})
