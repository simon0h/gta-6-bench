import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer } from './helpers.js'

test('Williams Sonoma reference site reproduces the real chrome and key pages without purchase controls', async () => {
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
    assert.match(espresso.text, /data-purchase-evidence="unverified"/)
    assert.doesNotMatch(espresso.text, /add to cart/i)
    const empty = await client.get('/williams-sonoma/shop/bakeware/cake-pans/')
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
    assert.equal((await client.post('/williams-sonoma/cart/add', { pid: 'breville-barista-express-impress-espresso' })).status, 409)
    assert.deepEqual(await client.json('/api/orders?store=williams-sonoma'), [])
  } finally { await server.close() }
})
