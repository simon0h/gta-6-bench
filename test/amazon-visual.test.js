import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer } from './helpers.js'

async function signin(c) {
  await c.post('/amazon/ax/claim', { email: 'tester@example.com' })
  return c.post('/amazon/ap/signin/password', { password: 'Password123!' })
}

test('amazon location: ZIP validation, page return, state feedback and browser/account isolation', async () => {
  const srv = await startServer()
  try {
    const c = srv.client(), other = srv.client()
    const form = await c.get('/amazon/gp/delivery-location?ret=%2Fs%3Fk%3Dkettle')
    assert.equal(form.status, 200)
    assert.match(form.text, /Enter a US ZIP code/)
    const invalid = await c.post('/amazon/gp/delivery-location', { mode: 'zip', zip: 'BAD', ret: '/s?k=kettle' })
    assert.equal(invalid.status, 400)
    assert.match(invalid.text, /value="BAD"/)
    assert.match(invalid.text, /value="\/s\?k=kettle"/)
    const updated = await c.post('/amazon/gp/delivery-location', { mode: 'zip', zip: '10001', ret: '/s?k=kettle' })
    assert.match(updated.url, /\/amazon\/s\?k=kettle$/)
    assert.match(updated.text, /Shopping location updated to 10001/)
    assert.match((await c.get('/amazon/dp/A0HOMEKT1')).text, /Delivering to 10001/)
    assert.doesNotMatch((await other.get('/amazon/')).text, /Delivering to 10001/)
    await signin(c)
    assert.doesNotMatch((await c.get('/amazon/')).text, /Delivering to 10001/)
    await c.get('/amazon/gp/flex/sign-out.html')
    assert.match((await c.get('/amazon/')).text, /Delivering to 10001/)
    for(const ret of ['https://example.com','//example.com','/\\example.com','/gp/delivery-location?ret=/s']) {
      const response = await c.post('/amazon/gp/delivery-location', { mode: 'zip', zip: '90210', ret }, { follow: false })
      assert.equal(response.headers.get('location'), '/amazon/')
    }
    const badMode = await c.post('/amazon/gp/delivery-location', { mode: 'country', zip: '33139' })
    assert.equal(badMode.status, 400)
    assert.match((await c.get('/amazon/')).text, /Delivering to 90210/)
    await c.post('/amazon/gp/delivery-location', { mode: 'default' })
    assert.match((await c.get('/amazon/')).text, /Delivering to San Jose 95112/)
  } finally { await srv.close() }
})

test('amazon location: saved addresses are owned and selection never replaces checkout address', async () => {
  const srv = await startServer()
  try {
    const c = srv.client(), other = srv.client()
    await signin(c); await signin(other)
    const saved = await c.post('/amazon/a/addresses', { label: 'Office', name: 'Alex Tester', phone: '3055550123', line1: '1 Test Street', city: 'Miami', state: 'FL', postal_code: '33139' })
    const id = /data-address-id="([^"]+)"/.exec(saved.text)[1]
    const forged = await other.post('/amazon/gp/delivery-location', { mode: 'address', addressId: id })
    assert.equal(forged.status, 400)
    assert.doesNotMatch(forged.text, /1 Test Street/)
    const selected = await c.post('/amazon/gp/delivery-location', { mode: 'address', addressId: id, ret: '/cart' })
    assert.match(selected.url, /\/amazon\/cart$/)
    assert.match(selected.text, /Shopping location updated to Miami 33139/)
    await c.post('/amazon/cart/add', { asin: 'A0HOMEKT1' })
    await c.get('/amazon/gp/cart/desktop/go-to-checkout.html')
    const address = await c.get('/amazon/gp/buy/addressselect')
    assert.match(address.text, /Deliver to this address/)
    assert.doesNotMatch(address.url, /payselect$/)
    await c.post(`/amazon/a/addresses/${id}/remove`, {})
    assert.doesNotMatch((await c.get('/amazon/')).text, /Delivering to Miami 33139/)
  } finally { await srv.close() }
})

test('amazon merchandising: all campaigns are populated and cart/support contain truthful actionable content', async () => {
  const srv = await startServer()
  try {
    const c = srv.client(), home = await c.get('/amazon/')
    assert.equal((home.text.match(/data-campaign /g)||[]).length, 3)
    assert.match(home.text, /toys-campaign\.png/)
    for(const node of ['toys-and-games','home','videogames']) {
      const landing = await c.get(`/amazon/b?node=${node}`)
      assert.equal(landing.status, 200)
      assert.match(landing.text, /data-asin=/)
    }
    const pdp = await c.get('/amazon/dp/A0HOMEKT1')
    assert.match(pdp.text, /href="\/amazon\/help\/product-support"/)
    assert.doesNotMatch(pdp.text, /Get \$50 off|upon approval/)
    await c.post('/amazon/cart/add', { asin: 'A0HOMEKT1' })
    const cart = await c.get('/amazon/cart')
    assert.match(cart.text, /data-product-asset src="\/product-assets\/amazon\/A0HOMEKT1\/0\.svg"/)
    assert.match(cart.text, /Subtotal \(1 item\): <b>\$32\.99<\/b>/)
    assert.doesNotMatch(cart.text, /Cost After Savings|name="gift"|Gift options available/)
    for(const article of ['location','product-support','price-feedback','services']) assert.equal((await c.get(`/amazon/help/${article}`)).status, 200)
    assert.match((await c.get('/amazon/tradein')).text, /Trade-in appraisals for video games are not available for your account right now/)
  } finally { await srv.close() }
})
