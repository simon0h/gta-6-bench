import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer } from './helpers.js'

test('Williams Sonoma reference site reproduces the real chrome and key pages; captured listings stay read-only', async () => {
  const server = await startServer()
  try {
    const client = server.client()
    const home = await client.get('/williams-sonoma/')
    assert.equal(home.status, 200)
    for (const text of ['Free Shipping on Cookware, Electrics, Cutlery &amp; More', 'Events &amp; Services', 'Be the first to know about new arrivals', 'Williams Sonoma Credit Card', 'data-reference-state="catalog"'])
      assert.ok(home.text.includes(text), text)
    assert.match(home.text, /href="\/williams-sonoma\/shop\/electrics\/espresso-makers\/"/)
    assert.doesNotMatch(home.text, /href="(?:https?:)?\/\//, 'no off-site links')
    assert.doesNotMatch(home.text, /action="[^"]*\/(?:cart|checkout)/)

    const espresso = await client.get('/williams-sonoma/shop/electrics/espresso-makers/?sort=price-asc')
    assert.equal(espresso.status, 200)
    // Category grids list the purchasable kitchen assortment (shelf.js), sorted as requested.
    const prices = [...espresso.text.matchAll(/data-product-kind="other"[\s\S]*?class="wsx-price[^"]*">(?:<span class="wss-now">)?\$([\d,.]+)/g)].map(m => Number(m[1].replace(/,/g, '')))
    assert.ok(prices.length >= 5)
    assert.deepEqual(prices, prices.toSorted((x, y) => x - y))
    // Every menu category now has products; filtering to nothing still shows the empty state.
    const empty = await client.get('/williams-sonoma/shop/sale-special-offer/open-box-deals/?price=0-25')
    assert.match(empty.text, /0 Results/)
    assert.equal((await client.get('/williams-sonoma/shop/cookware/not-a-category/')).status, 404)

    for (const path of ['/stores/', '/customer-service/', '/customer-service/return/', '/registry/', '/recipe/', '/cart/', '/sitemap.html', '/customer-service/order-shipment-tracking/?orderNumber=123&email=a%40b.co'])
      assert.equal((await client.get('/williams-sonoma' + path)).status, 200, path)
    const xml = await client.get('/williams-sonoma/sitemap.xml')
    assert.match(xml.text, /<loc>\/williams-sonoma\/shop\/cookware\/<\/loc>/)
    assert.equal((await client.get('/williams-sonoma/category/cookware')).url.endsWith('/williams-sonoma/shop/cookware/'), true)

    const wrong = await client.post('/williams-sonoma/account/login.html', { email: 'tester@example.com', password: 'nope' })
    assert.equal(wrong.status, 401)
    const signedIn = await client.post('/williams-sonoma/account/login.html', { email: 'tester@example.com', password: 'Password123!' })
    assert.equal(signedIn.status, 200)
    assert.match(signedIn.text, /Hi, Alex/)
    // Captured "gta 6" search observations stay read-only.
    assert.equal((await client.post('/williams-sonoma/cart/add', { pid: 'breville-barista-express-impress-espresso' })).status, 409)
    assert.match((await client.get('/williams-sonoma/products/breville-barista-express-impress-espresso/')).text, /Back to search results/)
    assert.deepEqual(await client.json('/api/orders?store=williams-sonoma'), [])
  } finally { await server.close() }
})
