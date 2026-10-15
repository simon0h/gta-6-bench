import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer } from './helpers.js'

test('Nike reference site reproduces nike.com chrome and service pages; the shelf never makes captured or fixture listings purchasable', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    const home = await c.get('/nike/')
    assert.equal(home.status, 200)
    assert.match(home.text, /data-reference-state="catalog"/)
    for (const s of ['FULLY INVESTED', 'BODY OBSESSED', 'Members: Free Shipping on Orders $50+', 'href="/nike/retail"', 'href="/nike/register"', 'href="/nike/sitemap"']) assert.ok(home.text.includes(s), s)
    assert.doesNotMatch(home.text, /action="[^"]*\/(?:cart|checkout)/)

    const listing = await c.get('/nike/w/mens-shoes-nik1zy7ok?gender=Men')
    assert.equal(listing.status, 200)
    assert.match(listing.text, /<h1>Men&#39;s Shoes &amp; Sneakers <span class="nks-count">\(\d+\)<\/span><\/h1>/)
    // The nike.com assortment (shelf.js) fills category grids; nothing is marked uncaptured.
    assert.match(listing.text, /data-shelf-product="[^"]+"/)
    assert.doesNotMatch(listing.text, /data-reference-state="uncaptured"/)
    assert.equal((await c.get('/nike/w/not-a-real-category')).status, 404)

    for (const path of ['/help', '/help/a/returns-policy', '/retail', '/gift-cards', '/membership', '/cart', '/orders/details', '/sitemap', '/men', '/jordan']) {
      const page = await c.get('/nike' + path)
      assert.equal(page.status, 200, path)
      assert.match(page.text, /<h1/, path)
    }
    const xml = await c.get('/nike/sitemap.xml')
    assert.match(xml.headers.get('content-type'), /xml/)
    assert.match(xml.text, /<loc>\/nike\/retail<\/loc>/)

    // Two-step sign in works without JavaScript and keeps errors on the page.
    assert.match((await c.post('/nike/register', { email: 'tester@example.com' })).text, /What's your password\?/)
    const wrong = await c.post('/nike/register/password', { email: 'tester@example.com', password: 'nope' })
    assert.equal(wrong.status, 401)
    assert.match(wrong.text, /Your password is incorrect/)
    const ok = await c.post('/nike/register/password', { email: 'tester@example.com', password: 'Password123!' })
    assert.match(ok.text, /Hi, Alex/)

    // Purchase boundary is unchanged.
    const add = await c.post('/nike/cart/add', { id: 'running-shoes', qty: '1' }, { follow: false })
    assert.equal(add.status, 409)
    assert.deepEqual(await c.json('/api/orders?store=nike'), [])
  } finally { await srv.close() }
})
