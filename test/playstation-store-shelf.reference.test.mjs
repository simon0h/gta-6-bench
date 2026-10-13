import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer, fieldValue } from './helpers.js'
import { listOrders } from '../lib/orders.js'

// Reference-mode PlayStation Store assortment: the store is full of real games, add-ons, PS Plus and
// PlayStation Direct hardware, while the evidence-backed GTA VI listings keep their own rules.
const B = '/playstation-store'
const billing = { firstName: 'Alex', lastName: 'Tester', address1: '123 Ocean Dr', city: 'Miami', state: 'FL', zip: '33139', country: 'US', phone: '3055550123' }

test('PlayStation Store shelf: home, search, Direct pages and an assortment order', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    const home = await c.get(`${B}/`)
    assert.equal(home.status, 200)
    for (const shelf of ['New releases', 'Pre-orders', 'Free-to-play games', 'Add-ons and in-game currency', 'Shop PS5 consoles and accessories']) assert.match(home.text, new RegExp(shelf), shelf)
    for (const item of ['Ghost of Yōtei', 'Fortnite', 'V-Bucks', 'DualSense', 'PlayStation®5 Pro Console', 'Grand Theft Auto VI']) assert.ok(home.text.includes(item), item)
    assert.ok((home.text.match(/class="ps-tile"/g) || []).length >= 60, 'home lists many products')
    assert.doesNotMatch(home.text, /undefined|NaN/)

    const art = home.text.match(/\/playstation-store\/shelf-art\/[^"]+\.svg/)[0]
    const svg = await c.get(art)
    assert.equal(svg.status, 200)
    assert.match(svg.text, /^<svg/)

    const racing = await c.get(`${B}/en-us/search/racing`)
    assert.match(racing.text, /Gran Turismo 7/)
    assert.match(racing.text, /of \d{2}/, 'paginated count')
    const gta = await c.get(`${B}/en-us/search/gta%206`)
    const first = gta.text.match(/class="ps-tile-title">([^<]+)</)[1]
    assert.match(first, /^Grand Theft Auto VI/)
    const browse = await c.get(`${B}/en-us/pages/browse?genre=Sport&sort=price-asc`)
    assert.match(browse.text, /MLB The Show 26|NBA 2K27/)

    const consoles = await c.get(`${B}/direct.playstation.com/en-us/hardware/ps5`)
    assert.match(consoles.text, /PlayStation®5 Pro Console/)
    const controllerPath = consoles.text.includes('buy-accessories') ? null : (await c.get(`${B}/direct.playstation.com/en-us/accessories/ps5?category=controllers`)).text.match(/href="(\/playstation-store\/direct\.playstation\.com\/en-us\/buy-accessories\/[^"]+)"/)[1]
    const page = await c.get(controllerPath)
    assert.equal(page.status, 200)
    assert.match(page.text, /Add to Cart/)

    // Buy a digital assortment game: recorded as an ordinary line, never as a GTA VI game line.
    const product = await c.get(`${B}/en-us/search/Hollow%20Knight`)
    const href = product.text.match(/href="(\/playstation-store\/en-us\/product\/[^"]+)"/)[1]
    const sku = href.split('/').pop()
    const login = `${B}/my.account.sony.com/central/signin/`
    await c.post(login, { step: 'email', email: 'tester@example.com' })
    await c.post(login, { step: 'password', email: 'tester@example.com', password: 'Password123!' })
    const cart = await c.post(`${B}/en-us/cart/add`, { sku, returnTo: href })
    assert.match(cart.text, /Hollow Knight: Silksong/)
    await c.post(`${B}/en-us/checkout/payment/card`, { cardNumber: '4242424242424242', cardholderName: 'Alex Tester', expMonth: '12', expYear: '2039', cvv: '123' })
    const saved = await c.post(`${B}/en-us/checkout/payment/card/billing`, billing)
    const done = await c.post(`${B}/en-us/checkout`, { paymentMethod: fieldValue(saved.text, 'paymentMethod'), review_token: fieldValue(saved.text, 'review_token') })
    assert.match(done.text, /Thank you for your purchase/)
    const order = listOrders({ store: 'playstation-store' }).at(-1)
    assert.equal(order.items.length, 1)
    assert.equal(order.items[0].kind, 'other')
    assert.equal(order.items[0].sku, sku)
    assert.equal(order.items[0].edition, undefined)
  } finally { await srv.close() }
})

test('assortment stays out of the evidence-backed catalog', async () => {
  const data = await import('../stores/playstation-store/data.js')
  const { inventory } = await import('../stores/playstation-store/inventory.js')
  assert.equal(data.PRODUCTS.length, 3)
  assert.equal(inventory.length, 3)
  assert.ok(data.ASSORTMENT.length >= 150)
  for (const p of data.ASSORTMENT) {
    assert.equal(p.kind, 'other')
    assert.equal(p.catalogEvidence, undefined)
    assert.doesNotMatch(p.title, /Grand Theft Auto VI|GTA VI/)
  }
})
