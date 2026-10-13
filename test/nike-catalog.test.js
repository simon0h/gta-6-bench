import { assertProductGallery } from './product-gallery-assertions.js'
import { galleryPrimaryImage, galleryImageUrls } from './helpers.js'
import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { products } from '../stores/nike/catalog.js'
import { filterCatalog, facetCounts, catalogCandidates } from '../stores/nike/depth.js'
import { inventory } from '../stores/nike/inventory.js'
import { PHOTO_KEYS } from '../lib/product-photos.js'
import { startServer, fieldValue } from './helpers.js'

const originalProducts = products.slice(0, 40)
const originalIds = new Set(originalProducts.map(p => p.id))
const buyer = { email: 'nike-catalog@example.com', first_name: 'Jordan', last_name: 'Tester', address: '18 Court Street', city: 'Austin', state: 'TX', postal_code: '78701', card_name: 'Jordan Tester', card_number: '4242424242424242', card_expiry: '12/39', card_cvv: '123' }
const ids = html => [...html.matchAll(/data-product-id="([^"]+)"/g)].map(m => m[1])

test('Nike catalog has 500 distinct families and coherent required options, art and sizing', () => {
  assert.equal(products.length, 500)
  assert.equal(new Set(products.map(p => p.id)).size, 500)
  assert.equal(new Set(products.map(p => p.title)).size, 500)
  assert.equal(createHash('sha256').update(JSON.stringify(originalProducts)).digest('hex'), '7882804892b417581a9087a31b7ab183a1f2147ec7ddab1ea35b25e46261bfc4', 'all original product and variant data must remain unchanged')
  assert.deepEqual(['Shoes', 'Clothing', 'Accessories'].map(c => products.filter(p => p.category === c).length), [133, 257, 110])
  assert.deepEqual(['running-shoes', 'training-shirt', 'backpack', 'fleece-hoodie', 'court-shoes', 'running-shorts', 'crew-socks', 'kids-trainers'].map(id => products.find(p => p.id === id).price), [89.99, 29.99, 44.99, 65, 80, 40, 22, 55])
  assert.ok(products.find(p => p.id === 'running-shoes').options.Size.includes('US 9'))
  assert.deepEqual(products.find(p => p.id === 'kids-trainers').options.Size, ['US 10C', 'US 11C', 'US 12C', 'US 13C'])
  for (const p of products) {
    assert.ok(p.type && p.gender.length && p.ages.length && p.sports.length && p.measurement && p.material && p.care, p.id)
    if (p.photo) assert.ok(PHOTO_KEYS.includes(p.photo), p.photo)
    assert.ok(p.photo || p.art, p.id)
    for (const v of p.variants || []) {
      assert.deepEqual(Object.keys(v.options).sort(), Object.keys(p.options).sort())
      assert.ok(Object.entries(v.options).every(([label, value]) => p.options[label].includes(value)))
      assert.ok(Number.isInteger(v.stock) && v.stock >= 0)
    }
  }
})

test('Nike intersecting facets match a single size/color offer and stable prices', () => {
  const matching = filterCatalog({ category: 'Shoes', sport: 'Running', gender: 'Women', size: 'US 9', color: 'White', stock: 'in-stock' })
  assert.deepEqual(matching, [], 'White US 9 cushion is sold out; another color or size must not satisfy the intersection')
  assert.deepEqual(filterCatalog({ type: 'Road Running Shoes', size: 'US 9', color: 'White', stock: 'out-of-stock' }).map(p => p.id), ['cushion-runner'])
  const sale = filterCatalog({ category: 'Clothing', sport: 'Running', size: 'M', color: 'Black', price: '50-100', stock: 'in-stock', sort: 'price-asc' })
  assert.deepEqual(sale.filter(p => originalIds.has(p.id)).map(p => [p.id, p.displayPrice]), [['running-vest', 70], ['windbreaker', 75]])
  assert.ok(filterCatalog({ gender: 'Kids', age: 'Little Kids' }).every(p => p.ages.includes('Little Kids')))
  assert.deepEqual(filterCatalog({ age: 'Big Kids', size: '4Y' }), [])
  assert.deepEqual(filterCatalog({ age: 'Big Kids', size: '8Y' }).filter(p => originalIds.has(p.id)).map(p => p.id), ['kids-tracksuit'])
  assert.deepEqual(filterCatalog({ category: 'nonsense' }), [])
  assert.deepEqual(filterCatalog({ q: 'football' }).map(p => p.id), filterCatalog({ q: 'soccer' }).map(p => p.id))
})

test('Nike department and collection hubs work, pagination retains refinements and chips remove one filter', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    for (const route of ['', '/men', '/women', '/kids', '/new', '/sport', '/sport/running', '/sport/swimming', '/collection/club-fleece', '/category/shoes']) {
      const page = await c.get(`/nike${route}`)
      assert.equal(page.status, 200, route)
      assert.match(page.text, /nk-header/)
      assert.match(page.text, route === '/sport' ? /\/nike\/sport\/running/ : /\/nike\/product\//)
    }
    assert.equal((await c.get('/nike/sport/unknown')).status, 404)
    const first = await c.get('/nike/search?category=Clothing&sort=price-asc')
    const second = await c.get('/nike/search?category=Clothing&sort=price-asc&page=2')
    assert.equal(ids(first.text).length, 12)
    assert.equal(ids(second.text).length, 12)
    assert.equal(new Set([...ids(first.text), ...ids(second.text)]).size, 24)
    assert.match(second.text, /257 results · Showing 13–24/)
    assert.match(second.text, /sort=price-asc/)
    const prices = [...first.text.matchAll(/data-price="([\d.]+)"/g)].map(m => Number(m[1]))
    assert.deepEqual(prices, [...prices].sort((a, b) => a - b))
    const filtered = await c.get('/nike/search?gender=Women&sport=Running&color=Black&size=M&stock=in-stock')
    assert.match(filtered.text, /aria-label="Remove Color filter" href="\/nike\/search\?gender=Women&amp;sport=Running&amp;size=M&amp;stock=in-stock"/)
    assert.ok(ids(filtered.text).includes('windbreaker'))
    assert.doesNotMatch(first.text, /product\/training-shirt\?Size=/, 'unfiltered listings should not preselect a size')
  } finally { await srv.close() }
})

test('Nike PDP and bag resolve trusted color stock and sale price, reject invalid or unavailable combinations', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    const white = await c.get('/nike/product/cushion-runner?Color=White&Size=US%209')
    assert.equal(white.status, 200)
    assert.match(white.text, /\$95.00/)
    assert.match(white.text, /name="option_Size" value="US 9" data-stock="0" disabled/)
    assert.equal((await c.post('/nike/cart/add', { id: 'cushion-runner', option_Color: 'White', option_Size: 'US 9', qty: 1 })).status, 400)
    assert.equal((await c.post('/nike/cart/add', { id: 'kids-trainers', option_Size: 'US 9', qty: 1 })).status, 400)
    assert.equal((await c.get('/nike/product/windbreaker?Color=Pink')).status, 400)
    assert.equal((await c.post('/nike/cart/add', { id: 'windbreaker', option_Color: 'Black', option_Size: 'M', qty: 3 })).status, 400)
    const added = await c.post('/nike/cart/add', { id: 'windbreaker', option_Color: 'Black', option_Size: 'M', qty: 2, unit_price: 1, kind: 'game' })
    assert.equal(added.status, 200)
    assert.match(added.text, /Color: Black · Size: M/)
    assert.match(added.text, /\$75.00 each/)
    assert.match(added.text, /Subtotal <strong>\$150.00/)
    assert.doesNotMatch(added.text, /products-sportswear-deep.png/, 'black windbreaker uses truthful black art, not blue photo')
    const review = await c.get('/nike/checkout')
    const purchased = await c.post('/nike/checkout', { ...buyer, checkout_token: fieldValue(review.text, 'checkout_token') })
    assert.match(purchased.text, /Order confirmed/)
    const [order] = await c.json('/api/orders?store=nike')
    assert.equal(order.items[0].kind, 'other')
    assert.equal(order.items[0].unit_price, 75)
    assert.deepEqual(order.meta.options[0], { sku: 'windbreaker', variant_id: 'windbreaker-black-m', options: { Color: 'Black', Size: 'M' }, qty: 2 })
    assert.equal(order.meta.gta6_available, false)
  } finally { await srv.close() }
})

test('Nike GTA aliases and fabricated IDs cannot cross the unavailable-store boundary', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    for (const q of ['gta 6', 'gta vi', 'Grand Theft Auto VI', 'grand theft auto 6', 'GTA6', 'GTAVI', 'gta']) {
      const page = await c.get(`/nike/search?q=${encodeURIComponent(q)}`)
      if (q === 'gta 6') {
        assert.match(page.text, /gta 6 \(32\)/)
        assert.equal((page.text.match(/data-product-kind="other"/g) || []).length, 32)
        assert.doesNotMatch(page.text, /No results found/)
      } else {
        assert.match(page.text, /0 results/)
        assert.match(page.text, /No results found/)
        assert.match(page.text, /You may also like/)
      }
    }
    for (const id of ['gta6', 'gta-vi', 'nike-gta6']) {
      assert.equal((await c.get(`/nike/product/${id}`)).status, 404)
      assert.equal((await c.post('/nike/cart/add', { id, option_Size: 'US 9', qty: 1 })).status, 400)
    }
    const injected = await c.get('/nike/search?q=%3Cimg%20src=x%20onerror=alert(1)%3E')
    assert.doesNotMatch(injected.text, /<img src=x/)
    assert.match(injected.text, /&lt;img/)
    assert.deepEqual(await c.json('/api/orders?store=nike'), [])
  } finally { await srv.close() }
})

test('Nike preserves original size contracts, member shipping and reviewed-bag token protection', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    await c.post('/nike/cart/add', { id: 'running-shoes', option_Size: 'US 9', qty: 1 })
    await c.post('/nike/cart/add', { id: 'running-shoes', option_Size: 'US 10', qty: 1 })
    assert.equal((await c.post('/nike/cart/update', { id: 'running-shoes', action: 'remove' })).status, 400)
    await c.post('/nike/cart/update', { id: 'running-shoes', key: 'running-shoes:US 9', action: 'remove' })
    const review = await c.get('/nike/checkout')
    await c.post('/nike/cart/update', { id: 'running-shoes', key: 'running-shoes:US 10', qty: 2 })
    const stale = await c.post('/nike/checkout', { ...buyer, checkout_token: fieldValue(review.text, 'checkout_token') })
    assert.equal(stale.status, 409)
    assert.doesNotMatch(stale.text, /4242424242424242/)
    const guest = srv.client()
    await guest.post('/nike/cart/add', { id: 'training-duffel', qty: 1 })
    assert.match((await guest.get('/nike/cart')).text, /Delivery <strong>\$8.00/)
    await guest.post('/nike/account', { email: 'tester@example.com', password: 'Password123!' })
    assert.match((await guest.get('/nike/cart')).text, /Delivery <strong>\$5.00/)
    await guest.post('/nike/cart/add', { id: 'sport-bottle', qty: 1 })
    assert.match((await guest.get('/nike/cart')).text, /Delivery <strong>Free/)
    const threshold = srv.client()
    await threshold.post('/nike/cart/add', { id: 'windbreaker', option_Color: 'Black', option_Size: 'L', qty: 1 })
    assert.match((await threshold.get('/nike/cart')).text, /Delivery <strong>Free/)
    const memberThreshold = srv.client()
    await memberThreshold.post('/nike/cart/add', { id: 'basketball', option_Size: 'Size 7', qty: 1 })
    await memberThreshold.post('/nike/cart/add', { id: 'sport-bottle', qty: 1 })
    assert.match((await memberThreshold.get('/nike/cart')).text, /Delivery <strong>\$8.00/)
    await memberThreshold.post('/nike/account', { email: 'tester@example.com', password: 'Password123!' })
    assert.match((await memberThreshold.get('/nike/cart')).text, /Subtotal <strong>\$50.00/)
    assert.match((await memberThreshold.get('/nike/cart')).text, /Delivery <strong>Free/)
    assert.match((await srv.client().get('/nike/cart')).text, /is empty/)
  } finally { await srv.close() }
})

test('Nike product galleries and bag roundtrip use the chosen color and retain chosen size', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    assert.equal(originalProducts.filter(p => p.photo).length, 40)
    assert.equal(originalProducts.reduce((sum, p) => sum + (p.variants?.length || 0), 0), 159)
    assert.equal(originalProducts.filter(p => !p.variants?.length).length, 8)
    const white = await c.get('/nike/product/cushion-runner?Color=White&Size=US%208&view=9')
    const black = await c.get('/nike/product/cushion-runner?Color=Black&Size=US%208&view=9')
    const whiteImages = await assertProductGallery(c, white.text, 'nike', 'cushion-runner')
    const blackImages = await assertProductGallery(c, black.text, 'nike', 'cushion-runner')
    assert.notEqual(whiteImages[0], blackImages[0])
    assert.notEqual((await c.get(whiteImages[0])).text, (await c.get(blackImages[0])).text)
    assert.match(white.text, /href="\/nike\/product\/cushion-runner\?Color=Black&amp;Size=US\+8" aria-label="Color Black"/)
    assert.match(white.text, /value="US 8" data-stock="2" checked required/)
    const bag = await c.post('/nike/cart/add', { id: 'cushion-runner', option_Color: 'White', option_Size: 'US 8', qty: 1 })
    assert.match(bag.text, /cushion-runner\?Color=White&amp;Size=US\+8/)
    const bagImage = /src="([^\"]*\/product-assets\/nike\/cushion-runner\/0\.svg[^\"]*)"/.exec(bag.text)?.[1]?.replaceAll('&amp;', '&')
    assert.ok(bagImage, 'The bag includes the selected product image')
    assert.equal((await c.get(bagImage)).text, (await c.get(whiteImages[0])).text)
    const jacket = await c.get('/nike/product/windbreaker?Color=Black&Size=M')
    await assertProductGallery(c, jacket.text, 'nike', 'windbreaker')
    assert.match(galleryPrimaryImage(jacket.text), /variant=windbreaker-black-m/)
    const gallery = await c.get('/nike/product/kids-tracksuit?Size=8Y&view=1')
    const views = await assertProductGallery(c, gallery.text, 'nike', 'kids-tracksuit')
    assert.equal(galleryPrimaryImage(gallery.text), views[1])
    assert.equal((await c.get('/nike/product/cushion-runner?Color=__proto__')).status, 400)
  } finally { await srv.close() }
})

test('Nike expanded inventory contains only nongame base records and meaningful sport ranges', () => {
  assert.equal(inventory.length, 500)
  assert.equal(new Set(inventory.map(p => p.id)).size, 500)
  assert.ok(inventory.every(p => p.type === 'other' && p.platform === null && typeof p.available === 'boolean'))
  assert.ok(inventory.every(p => !/gta|grand theft auto/i.test(p.id + ' ' + p.title)))
  assert.equal(inventory.find(p => p.id === 'race-day-shoe').available, false)
  for (const sport of ['Running', 'Training', 'Basketball', 'Soccer', 'Tennis', 'Swimming', 'Hiking', 'Yoga', 'Cycling']) assert.ok(filterCatalog({ sport }).length >= 12, sport)
  assert.ok(filterCatalog({ gender: 'Kids', category: 'Clothing' }).length >= 24)
  assert.ok(filterCatalog({ gender: 'Women', type: 'Swimwear' }).length >= 12)
  assert.equal(new Set(products.slice(40).map(p => p.description)).size, 460, 'authored functions are distinct, not size/color copies')
  assert.ok(products.every(p => Number.isFinite(p.price) && p.price > 0 && catalogCandidates(p).every(v => Number.isFinite(v.stock))))
})

test('Nike facet counts stay equivalent to trusted offer intersections across the expanded catalog', () => {
  const queries = [
    { sport: 'Running', color: 'Black', size: 'US 9', stock: 'in-stock' },
    { gender: 'Kids', age: 'Big Kids', size: '8Y', stock: 'in-stock' },
    { category: 'Clothing', gender: 'Women', size: 'M', price: '50-100' },
    { q: 'pool', stock: 'out-of-stock' },
  ]
  for (const query of queries) {
    for (const [key, values] of Object.entries({ category: ['Shoes', 'Clothing', 'Accessories'], age: ['Adults', 'Little Kids', 'Big Kids', 'Teens'], size: ['US 9', 'M', '4Y', '8Y'], color: ['White', 'Black', 'Blue'], price: ['50', '50-100', '100+'], stock: ['in-stock', 'out-of-stock'] })) {
      const counts = facetCounts(query, key)
      for (const value of values) assert.equal(counts.get(value) || 0, filterCatalog({ ...query, [key]: value }).length, JSON.stringify({ query, key, value }))
    }
  }
  assert.equal(filterCatalog({ age: 'Big Kids', size: '4Y' }).length, 0)
  assert.equal(filterCatalog({ q: 'Playday raglan tee', size: '12Y', stock: 'in-stock' }).length, 0)
  assert.equal(filterCatalog({ q: 'Playday raglan tee', size: '12Y', stock: 'out-of-stock' }).length, 1)
})

test('Nike expanded last pages, suggestions and representative purchases reach trusted records', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    const last = await c.get('/nike/search?page=42')
    assert.equal(last.status, 200)
    assert.match(last.text, /500 results · Showing 493–500/)
    assert.match(last.text, /Page 42 of 42/)
    assert.deepEqual(ids(last.text), products.slice(492).map(p => p.id))
    assert.match(last.text, /rel="prev"/)
    assert.doesNotMatch(last.text, /rel="next"/)
    const nav = /<nav class="nk-pagination"[\s\S]*?<\/nav>/.exec(last.text)[0]
    assert.ok((nav.match(/<a /g) || []).length <= 8)
    assert.deepEqual(ids((await c.get('/nike/search?page=999999')).text), ids(last.text))
    const clothingLast = await c.get('/nike/search?category=Clothing&sort=price-asc&page=22')
    assert.match(clothingLast.text, /257 results · Showing 253–257/)
    assert.equal(ids(clothingLast.text).length, 5)
    assert.match(clothingLast.text, /category=Clothing&amp;sort=price-asc/)
    const suggestions = await c.json('/nike/suggest?q=kneeling')
    assert.equal(suggestions.products[0].id, 'kneeling-exercise-pad')
    assert.equal((await c.json('/nike/suggest?q=kneel')).products[0].id, 'kneeling-exercise-pad')
    assert.deepEqual((await c.json('/nike/suggest?q=gta%20vi')).products, [])
    assert.equal((await c.get('/nike/suggest?q=a&q=b')).status, 400)
    assert.ok((await c.json('/nike/suggest?q=running')).products.length <= 6)
    const shoe = products.find(p => p.id === 'rock-shield-trail-shoe')
    const garment = products.find(p => p.id === 'side-pocket-flow-leggings')
    const gear = products.at(-1)
    for (const [product, size] of [[shoe, 'US 9'], [garment, 'M'], [gear, null]]) {
      const page = await c.get(`/nike/product/${product.id}`)
      assert.equal(page.status, 200)
      assert.match(page.text, /Product illustration/)
      assert.ok(page.text.includes(product.description))
      if (size) assert.equal((await c.post('/nike/cart/add', { id: product.id, qty: 1 })).status, 400)
      assert.equal((await c.post('/nike/cart/add', { id: product.id, ...(size ? { option_Size: size } : {}), qty: 1, kind: 'game', unit_price: '0.01' })).status, 200)
    }
    const checkout = await c.get('/nike/checkout')
    assert.match((await c.post('/nike/checkout', { ...buyer, checkout_token: fieldValue(checkout.text, 'checkout_token') })).text, /Order confirmed/)
    const [order] = await c.json('/api/orders?store=nike')
    assert.deepEqual(order.items.map(p => [p.sku, p.kind, p.unit_price]), [shoe, garment, gear].map(p => [p.id, 'other', p.price]))
    assert.equal(order.meta.gta6_available, false)
    assert.equal(order.meta.options.length, 3)
    assert.equal(order.totals.subtotal, shoe.price + garment.price + gear.price)
  } finally { await srv.close() }
})
