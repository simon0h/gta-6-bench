import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer, fieldValue } from './helpers.js'

// Reference mode shows the everyday Xbox Store assortment beside the evidence-backed GTA VI listings.
// The GTA VI allowlist, its evidence and purchase guards are covered by the reference purchase tests.
const card = { pi: 'new', payType: 'card', cardNumber: '4242424242424242', expMonth: '12', expYear: '2039', cvv: '123', nameOnCard: 'Alex Tester', address1: '123 Ocean Dr', city: 'Miami', state: 'FL', zip: '33139', country: 'US' }
const signIn = async c => {
  await c.post('/xbox-store/login.live.com/oauth20_authorize.srf', { loginfmt: 'tester@example.com' })
  await c.post('/xbox-store/login.live.com/password.srf', { passwd: 'Password123!' })
  await c.post('/xbox-store/login.live.com/kmsi.srf', { kmsi: 'yes' })
}
const firstProduct = (html, prefix) => new RegExp(`href="(/xbox-store/en-US/${prefix}/[^"/]+/[0-9a-z]{12})"`).exec(html)?.[1]

test('xbox-store homepage shows rows from several departments around GTA VI', async () => {
  const srv = await startServer()
  try {
    const home = await srv.client().get('/xbox-store/')
    assert.equal(home.status, 200)
    for (const heading of ['New releases', 'Best selling games', 'Deals', 'Consoles', 'Controllers &amp; accessories', 'Add-ons and in-game currency', 'Gift cards and Game Pass memberships']) assert.match(home.text, new RegExp(`<h2>${heading}</h2>`))
    for (const item of ['Forza Horizon 5', 'Xbox Series X – 2TB Galaxy Black Special Edition', 'Xbox Wireless Controller – Carbon Black', 'Xbox Gift Card – \\$50 Digital Code']) assert.match(home.text, new RegExp(item))
    assert.match(home.text, /Grand Theft Auto VI/)
    assert.ok((home.text.match(/class="xb-tile"/g) || []).length >= 40)
    assert.doesNotMatch(home.text, /undefined|NaN/)
  } finally { await srv.close() }
})

test('xbox-store search mixes the assortment with GTA VI listings, GTA VI first for GTA queries', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    const halo = await c.get('/xbox-store/en-US/search/results?q=halo')
    assert.match(halo.text, /Halo: The Master Chief Collection/)
    const controller = await c.get('/xbox-store/en-US/search/results?q=controller&type=hardware')
    assert.match(controller.text, /Xbox Wireless Controller – Carbon Black/)
    for (const q of ['gta 6', 'grand theft auto']) {
      const r = await c.get(`/xbox-store/en-US/search/results?q=${encodeURIComponent(q)}&type=all`)
      assert.equal(firstProduct(r.text, 'games/store'), '/xbox-store/en-US/games/store/grand-theft-auto-vi/9p3h4968grsm', q)
    }
    const accessories = await c.get('/xbox-store/en-US/store/b/xbox-accessories?brand=Razer&sort=price-asc')
    assert.match(accessories.text, /Razer Universal Quick Charging Stand/)
    assert.doesNotMatch(accessories.text, /class="xb-tile"[^>]*aria-label="Turtle Beach/)
    const catalog = await c.json('/api/catalog?store=xbox-store')
    assert.equal(catalog.stores[0].inventory.length, 5, 'inventory stays the evidenced GTA VI rows')
  } finally { await srv.close() }
})

test('xbox-store assortment items are bought through the cart and recorded as kind other', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    await signIn(c)
    const consoles = await c.get('/xbox-store/en-US/consoles/all-consoles')
    const device = firstProduct(consoles.text, 'd')
    assert.ok(device, 'a console product page link')
    const page = await c.get(device)
    assert.match(page.text, /Tech specs/)
    assert.match(page.text, /Free 60-day returns/)
    const pid = fieldValue(page.text, 'pid')
    await c.post('/xbox-store/en-US/cart/add', { pid })
    const search = await c.get('/xbox-store/en-US/search/results?q=v-bucks&type=add-ons')
    const vbucks = firstProduct(search.text, 'games/store')
    const addonPage = await c.get(vbucks)
    await c.post('/xbox-store/en-US/cart/add', { pid: fieldValue(addonPage.text, 'pid') })
    const cart = await c.get('/xbox-store/en-US/cart')
    assert.match(cart.text, /V-Bucks/)
    const checkout = await c.get('/xbox-store/en-US/checkout')
    const done = await c.post('/xbox-store/en-US/checkout', { ...card, action: 'place', checkout_token: fieldValue(checkout.text, 'checkout_token'), shipName: 'Alex Tester', shipAddress1: '123 Ocean Dr', shipCity: 'Miami', shipState: 'FL', shipZip: '33139', shipCountry: 'US' })
    assert.match(done.text, /Thanks for your purchase/)
    const orders = await c.json('/api/orders?store=xbox-store')
    const order = orders.at(-1)
    assert.equal(order.items.length, 2)
    for (const item of order.items) {
      assert.equal(item.kind, 'other')
      assert.equal(item.platform, undefined)
      assert.equal(item.edition, undefined)
      assert.doesNotMatch(item.title, /Grand Theft Auto VI/)
    }
    assert.ok(order.shipping_address, 'console ships to the delivery address')
  } finally { await srv.close() }
})
