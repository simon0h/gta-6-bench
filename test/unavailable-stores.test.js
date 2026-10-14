import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer } from './helpers.js'

const stores = [
  ['ikea', 'IKEA', 'desk', 'Furniture'],
  ['nike', 'Nike', 'running-shoes', 'Shoes'],
  ['sephora', 'Sephora', 'lip-color', 'Makeup'],
  ['chewy', 'Chewy', 'dog-food', 'Dog'],
  ['williams-sonoma', 'Williams Sonoma', 'skillet', 'Cookware'],
]
const productOptions = { ikea: { option_Color: 'White' }, nike: { option_Size: 'US 9' }, sephora: { option_Shade: 'Rosewood' }, chewy: {}, 'williams-sonoma': { option_Finish: 'Stainless steel' } }
const buyer = {
  email: 'tester@example.com', first_name: 'Alex', last_name: 'Tester',
  address: '123 Main Street', city: 'Austin', state: 'TX', postal_code: '78701',
  card_name: 'Alex Tester', card_number: '4242424242424242', card_expiry: '12/39', card_cvv: '123',
}

test('store API and index distinguish preorder and unavailable scenarios', async () => {
  const srv = await startServer()
  try {
    const c = srv.client(), all = await c.json('/api/stores')
    assert.equal(all.length, 20, 'all storefront modules must load; import errors must not silently reduce coverage')
    assert.deepEqual(all.filter(store => !store.gta6_available).map(store => store.slug).sort(), stores.map(([slug]) => slug).sort())
    assert.ok(all.every(store => typeof store.gta6_available === 'boolean'))
    assert.equal(all.find(store => store.slug === 'gamestop').gta6_available, true)
    for (const [slug] of stores) assert.equal(all.find(store => store.slug === slug).captcha, null)
    const home = await c.get('/')
    assert.match(home.text, /GTA 6 pre-order scenarios/)
    assert.match(home.text, /GTA 6 not offered in captured references/)
  } finally { await srv.close() }
})

for (const [slug, name, id, category] of stores) {
  test(`${name}: real catalog browsing, GTA searches do not offer the game, forged game IDs cannot be bought`, async () => {
    const srv = await startServer()
    try {
      const c = srv.client(), base = `/${slug}`
      const home = await c.get(`${base}?run=negative-${slug}`)
      assert.equal(home.status, 200)
      assert.doesNotMatch(home.text, /Synthetic benchmark environment/)
      for (const q of ['gta 6', 'gta vi', 'grand theft auto', 'grand theft auto vi', 'GTA6', 'Grand Theft Auto 6']) {
        const search = await c.get(`${base}/search?q=${encodeURIComponent(q)}`)
        assert.equal(search.status, 200)
        if (slug === 'nike' && q === 'gta 6') {
          assert.match(search.text, /gta 6 \(32\)/)
          assert.equal((search.text.match(/data-product-kind="other"/g) || []).length, 32)
        } else if (slug === 'williams-sonoma' && q === 'gta 6') {
          assert.match(search.text, /198 search results for/)
          assert.equal((search.text.match(/data-product-kind="other"/g) || []).length, 198)
        } else if (slug === 'sephora' && q === 'gta 6') {
          assert.match(search.text, /100 Results/)
          assert.equal((search.text.match(/data-product-kind="other"/g) || []).length, 100)
        } else if (slug === 'ikea') {
          assert.match(search.text, /There are no results for/)
          assert.match(search.text, /We found 0 products and 0 content results/)
          assert.match(search.text, /More inspiration like this/)
        } else {
          assert.match(search.text, /0 results/)
          assert.match(search.text, /No results found/)
          assert.match(search.text, /You may also like/)
        }
      }
      const normal = await c.get(`${base}/search?q=${encodeURIComponent(category)}`)
      assert.doesNotMatch(normal.text, /No results found/)
      assert.match(normal.text, new RegExp(`${base}/product/${id}`))
      assert.equal((await c.get(`${base}/product/${id}`)).status, 200)
      assert.equal((await c.get(`${base}/product/gta6`)).status, 404)
      const forged = await c.post(`${base}/cart/add`, { id: 'gta6', platform: 'ps5', edition: 'standard', qty: '1', unit_price: '0' })
      assert.equal(forged.status, 400)
      assert.match(forged.text, /not available from our catalog/)
      const checkout = await c.post(`${base}/checkout`, buyer)
      assert.match(checkout.url, /\/cart$/)
      assert.deepEqual(await c.json(`/api/orders?store=${slug}`), [])
      const injection = await c.get(`${base}/search?q=${encodeURIComponent('<img src=x onerror=alert(1)>')}`)
      assert.doesNotMatch(injection.text, /<img src=x/)
      assert.match(injection.text, /&lt;img/)
    } finally { await srv.close() }
  })

  test(`${name}: unrelated purchase is gradeable, validated, isolated and never creates a GTA order`, async () => {
    const srv = await startServer()
    try {
      const c = srv.client(), base = `/${slug}`
      await c.get(`${base}?run=other-${slug}`)
      const added = await c.post(`${base}/cart/add`, { id, qty: 2, kind: 'game', unit_price: 0, ...productOptions[slug] })
      assert.equal(added.status, 200)
      assert.match(added.text, /Continue to checkout/)
      assert.match((await c.get(`${base}/checkout`)).text, /Contact and delivery/)
      const bad = await c.post(`${base}/checkout`, { ...buyer, card_number: '4111111111111112' })
      assert.equal(bad.status, 400)
      assert.match(bad.text, /role="alert"/)
      assert.match(bad.text, /value="Alex"/)
      assert.match(bad.text, /name="card_expiry"[^>]*value="12\/39"/)
      assert.doesNotMatch(bad.text, /4111111111111112/)
      assert.deepEqual(await c.json('/api/orders'), [])
      const missing = await c.post(`${base}/checkout`, { ...buyer, email: 'bad-email', postal_code: '' })
      assert.equal(missing.status, 400)
      assert.match(missing.text, /valid email/)
      const confirmation = await c.post(`${base}/checkout`, buyer)
      assert.equal(confirmation.status, 200)
      assert.match(confirmation.text, /Order confirmed/)
      const orders = await c.json(`/api/orders?store=${slug}&run=other-${slug}`)
      assert.equal(orders.length, 1)
      const order = orders[0]
      assert.equal(order.items.length, 1)
      assert.equal(order.items[0].kind, 'other')
      assert.equal(order.items[0].qty, 2)
      assert.equal(order.items[0].sku, id)
      assert.ok(order.items[0].unit_price > 0)
      assert.equal(order.items[0].platform, undefined)
      assert.equal(order.customer.email, buyer.email)
      assert.equal(order.fulfillment.method, 'ship')
      assert.equal(order.shipping_address.postal_code, buyer.postal_code)
      assert.equal(order.totals.subtotal, Math.round(order.items[0].unit_price * 2 * 100) / 100)
      assert.equal(order.totals.shipping, slug === 'sephora' ? 6.95 : 0)
      assert.equal(order.totals.total, Math.round((order.totals.subtotal + order.totals.shipping) * 100) / 100)
      assert.equal(order.meta.gta6_available, false)
      assert.equal(order.payment.last4, '4242')
      assert.equal(order.payment.number, undefined)
      assert.equal(order.payment.cvv, undefined)
      assert.doesNotMatch(JSON.stringify(order), /4242424242424242|card_cvv/)
      assert.equal((await srv.client().get(`${base}/order/${order.id}`)).status, 404)
      assert.match((await c.get(`${base}/cart`)).text, /is empty/)
      await c.post(`${base}/checkout`, buyer)
      assert.equal((await c.json('/api/orders')).length, 1, 'resubmission after checkout must not duplicate the order')
    } finally { await srv.close() }
  })
}

test('unavailable storefront carts validate quantities and remain isolated across retailers', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    await c.post('/ikea/cart/add', { id: 'desk', qty: 1, option_Color: 'White' })
    for (const qty of ['-1', '0', '1.5', 'NaN', '11']) {
      assert.equal((await c.post('/ikea/cart/add', { id: 'desk', qty })).status, 400)
      assert.equal((await c.post('/ikea/cart/update', { id: 'desk', qty })).status, 400)
    }
    assert.match((await c.get('/nike/cart')).text, /is empty/)
    assert.match((await srv.client().get('/ikea/cart')).text, /is empty/)
    const removed = await c.post('/ikea/cart/update', { id: 'desk', action: 'remove' })
    assert.match(removed.text, /is empty/)
  } finally { await srv.close() }
})

test('retail filters, variants, favorites and location preserve shopper choices', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    const mainContent = response => {
      const match = response.text.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)
      assert.ok(match, 'Storefront has a main content landmark')
      return match[1]
    }
    for (const [slug, , id, category] of stores) {
      const home = await c.get(`/${slug}/`)
      if (slug === 'ikea') {
        assert.match(home.text, /src="\/static\/reference\/ikea\/kitchen-accessories.jpg"/)
        assert.match(home.text, /src="\/static\/reference\/ikea\/kitchen-planning.jpg"/)
        assert.match(home.text, /src="\/ikea\/static\/official-logo.svg"/)
      } else {
        assert.match(home.text, new RegExp(`/static/art/retail/${slug}.png`))
      }
      const filtered = await c.get(`/${slug}/search?category=${encodeURIComponent(category)}&sort=price-asc&price=50`)
      const prices = [...mainContent(filtered).split('<h2>You may also like</h2>')[0].matchAll(/data-price="([\d.]+)"/g)].map(m => Number(m[1]))
      assert.ok(prices.every(p => p < 50))
      assert.deepEqual(prices, [...prices].sort((a, b) => a - b))
      await c.post(`/${slug}/favorites`, { id })
      assert.match(mainContent(await c.get(`/${slug}/favorites`)), new RegExp(`/${slug}/product/${id}`))
      assert.doesNotMatch(mainContent(await srv.client().get(`/${slug}/favorites`)), new RegExp(`/${slug}/product/${id}`))
      assert.equal((await c.get(`/${slug}/help`)).status, 200)
      assert.equal((await c.post(`/${slug}/location`, { postal_code: 'bad' })).status, 400)
      await c.post(`/${slug}/location`, { postal_code: '78701' })
      if (slug === 'nike') {
        // Nike's observed header does not display a delivery ZIP. Verify the
        // existing delivery selector retains the value and isolates browsers.
        const delivery = mainContent(await c.get('/nike/location'))
        assert.match(delivery, /name="postal_code"[^>]*value="78701"/)
        const separateDelivery = mainContent(await srv.client().get('/nike/location'))
        assert.match(separateDelivery, /name="postal_code"[^>]*value=""/)
      } else {
        assert.match((await c.get(`/${slug}/`)).text, /(?:Deliver to|ZIP) 78701/)
      }
    }
    assert.equal((await c.post('/nike/cart/add', { id: 'running-shoes', qty: 1 })).status, 400, 'missing required size must not silently choose a variant')
    assert.equal((await c.post('/nike/cart/add', { id: 'running-shoes', qty: 1, option_Size: 'US 900' })).status, 400)
    await c.post('/nike/cart/add', { id: 'running-shoes', qty: 1, option_Size: 'US 9' })
    await c.post('/nike/cart/add', { id: 'running-shoes', qty: 1, option_Size: 'US 10' })
    const cart = await c.get('/nike/cart')
    assert.match(cart.text, /Size: US 9/)
    assert.match(cart.text, /Size: US 10/)
    await c.post('/nike/cart/update', { id: 'running-shoes', key: 'running-shoes:US 9', action: 'remove' })
    const order = await c.post('/nike/checkout', buyer)
    assert.match(order.text, /Size: US 10/)
    assert.doesNotMatch(order.text, /Size: US 9/)
  } finally { await srv.close() }
})

test('member sign-in changes shipping, remains isolated and never exposes credentials', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    await c.post('/sephora/cart/add', { id: 'lip-color', qty: 1, option_Shade: 'Berry' })
    assert.match((await c.get('/sephora/cart')).text, /Delivery <strong>\$6.95/)
    assert.equal((await c.post('/sephora/account', { email: buyer.email, password: 'wrong' })).status, 400)
    const signedIn = await c.post('/sephora/account', { email: buyer.email, password: 'Password123!' })
    assert.match(signedIn.text, /Welcome, Alex/)
    assert.doesNotMatch(signedIn.text, /Password123!/)
    assert.match((await c.get('/sephora/cart')).text, /Delivery <strong>Free/)
    assert.match((await c.get('/nike/account')).text, /Sign in or join us/)
    const checkout = await c.get('/sephora/checkout')
    assert.match(checkout.text, /value="Alex"/)
    await c.post('/sephora/checkout', buyer)
    const order = (await c.json('/api/orders?store=sephora'))[0]
    assert.equal(order.customer.guest, false)
    assert.equal(order.totals.shipping, 0)
    assert.match(order.items[0].title, /Shade: Berry/)
    await c.post('/sephora/logout', {})
    assert.match((await c.get('/sephora/account')).text, /Sign in or join us/)
    assert.equal((await c.post('/nike/account', { mode: 'register', email: 'invalid', password: 'x' })).status, 400)
    const registered = await c.post('/nike/account', { mode: 'register', first_name: 'Casey', last_name: 'Example', email: 'casey@example.com', password: 'TestPass123!' })
    assert.match(registered.text, /Welcome, Casey/)
    assert.match((await srv.client().get('/nike/account')).text, /Sign in or join us/)
  } finally { await srv.close() }
})
