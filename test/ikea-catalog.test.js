import { assertProductGallery } from './product-gallery-assertions.js'
import { galleryPrimaryImage, galleryImageUrls } from './helpers.js'
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { startServer, fieldValue } from './helpers.js'
import { products, departments, categories, rooms, deals, ideas } from '../stores/ikea/catalog.js'
import { inventory } from '../stores/ikea/inventory.js'

const buyer = { email: 'tester@example.com', first_name: 'Alex', last_name: 'Tester', address: '123 Main Street', city: 'Austin', state: 'TX', postal_code: '78701', card_name: 'Alex Tester', card_number: '4242424242424242', card_expiry: '12/39', card_cvv: '123' }
const ids = html => [...html.matchAll(/data-product-id="([^"]+)"/g)].map(match => match[1])
const prices = html => [...html.matchAll(/data-price="([\d.]+)"/g)].map(match => Number(match[1]))
const originalProducts = products.filter(p => !p.catalogRange)
const checkoutSamples = [...originalProducts, ...categories.map(category => products.find(p => p.catalogRange && p.subcategory === category.id))]
const bodyFor = (product, options = {}) => ({ id: product.id, qty: '1', ...Object.fromEntries(Object.entries(options).map(([key, value]) => [`option_${key}`, value])) })

test('IKEA 500-listing inventory has distinct identities, complete range metadata and no games', () => {
  assert.equal(inventory.length, 500)
  assert.equal(new Set(products.map(p => p.title.toLowerCase())).size, 500)
  assert.equal(originalProducts.length, 41)
  assert.equal(products.filter(p => p.catalogRange).length, 459)
  for (const category of categories) assert.equal(products.filter(p => p.catalogRange && p.subcategory === category.id).length, 27, category.id)
  for (const [index, entry] of inventory.entries()) {
    const p = products[index]
    assert.equal(entry.id, p.id)
    assert.equal(entry.type, 'other')
    assert.equal(entry.platform, null)
    assert.equal(entry.available, true)
    assert.doesNotMatch(`${p.id} ${p.title} ${p.description}`, /\bgta\s*[6v]|grand theft auto/i)
    assert.ok(Number.isFinite(p.price) && p.price > 0)
    assert.ok(Number.isInteger(p.stock) && p.stock > 0)
    assert.ok(Object.values(p.dimensions).every(value => Number.isFinite(value) && value > 0))
    if (p.catalogRange) {
      assert.equal(p.photo, null)
      assert.match(p.art, /^M/)
      assert.equal(p.options && Object.keys(p.options).length, 0)
      assert.ok(p.description.length > 80 && p.care && p.assembly && p.rooms.length)
    }
  }
})

test('IKEA every added leaf category can be found by its full title and exact material/dimensions', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    for (const category of categories) {
      const p = products.find(p => p.catalogRange && p.subcategory === category.id)
      const query = new URLSearchParams({ q: p.title, category: p.subcategory, material: p.material, stock: 'in', ...(['Furniture', 'Storage'].includes(p.category) ? { width: String(p.dimensions.width) } : {}) })
      const result = await c.get(`/ikea/search?${query}`)
      assert.equal(result.status, 200, p.id)
      assert.deepEqual(ids(result.text), [p.id], p.id)
      await assertProductGallery(c, (await c.get(`/ikea/product/${p.id}`)).text, 'ikea', p.id)
    }
    const last = await c.get('/ikea/search?page=42')
    assert.deepEqual(ids(last.text), products.slice(492).map(p => p.id))
    assert.match(last.text, /Showing 493–500/)
  } finally { await srv.close() }
})

test('IKEA: all 500 families have useful destinations and complete purchasable metadata', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    assert.equal(products.length, 500)
    assert.equal(new Set(products.map(p => p.id)).size, 500)
    for (const product of products) {
      assert.ok(product.material && product.assembly && product.care && product.dimensions.width && product.rooms.length, product.id)
      const page = await c.get(`/ikea/product/${product.id}`)
      assert.equal(page.status, 200, product.id)
      assert.match(page.text, /Product details & materials/)
      assert.match(page.text, /Assembly & care/)
      assert.match(page.text, /Measurements/)
      assert.match(page.text, /How to get it/)
      assert.match(page.text, /You may also like/)
      assert.equal((await c.get(`/ikea/product/${product.id}/assembly`)).status, 200)
    }
    const routes = ['/products', '/rooms', '/deals', '/ideas', '/services', ...departments.map(d => `/category/${d.id}`), ...categories.map(d => `/category/${d.id}`), ...rooms.map(r => `/rooms/${r.id}`), ...deals.map(d => `/deals/${d.id}`), ...ideas.map(i => `/ideas/${i.id}`), '/services/planning', '/services/assembly', '/services/delivery']
    for (const route of routes) {
      const page = await c.get(`/ikea${route}`)
      assert.equal(page.status, 200, route)
      if (route.startsWith('/category/') || route.startsWith('/deals/')) assert.ok(ids(page.text).length, route)
    }
    for (const route of ['/category/no-such-category', '/rooms/no-such-room', '/ideas/no-such-idea', '/services/__proto__', '/product/gta6']) assert.equal((await c.get(`/ikea${route}`)).status, 404, route)
    const home = await c.get('/ikea/')
    assert.match(home.text, /ik-mosaic/)
    const homeProductLinks = [...new Set([...home.text.matchAll(/href="(\/ikea\/product\/[^"]+)"/g)].map(m => m[1].replaceAll('&amp;', '&').split('#')[0]))]
    for (const href of homeProductLinks) assert.equal((await c.get(href)).status, 200, href)
    assert.match(home.text, /A table for everyday gatherings/)
    assert.match(home.text, /A place for everything/)
    assert.match(home.text, /products-room-inspiration.png/)
    const captures = [
      ['public/reference/ikea/kitchen-accessories.jpg', '/static/reference/ikea/kitchen-accessories.jpg', 'https://www.ikea.com/ext/ingkadam/m/5b190d9dd8981ba9/original/PE1012454.jpg', 'image/jpeg'],
      ['public/reference/ikea/kitchen-planning.jpg', '/static/reference/ikea/kitchen-planning.jpg', 'https://www.ikea.com/ext/ingkadam/m/6e5abd54fd8e16c7/original/PH186303-crop003.jpg', 'image/jpeg'],
      ['stores/ikea/public/official-logo.svg', '/ikea/static/official-logo.svg', 'https://www.ikea.com/global/assets/logos/brand/ikea.svg', 'image/svg+xml'],
    ]
    const manifest = await c.json('/static/reference/ikea/manifest.json')
    assert.equal(manifest.source_page, 'https://www.ikea.com/us/en/')
    assert.equal(manifest.captured_at, '2026-10-06')
    assert.equal(manifest.classification, 'official-captured')
    assert.equal(manifest.assets.length, captures.length + 24)
    for (const [path, url, source, mime] of captures) {
      assert.ok(home.text.includes(`src="${url}"`), `${url} is used by the homepage`)
      const response = await c.get(url)
      assert.equal(response.status, 200, url)
      assert.ok(response.headers.get('content-type').startsWith(mime), url)
      const asset = manifest.assets.find(entry => entry.local_path === path)
      assert.ok(asset, `source metadata for ${path}`)
      assert.equal(asset.source_url, source)
      assert.ok(asset.placement, `placement for ${path}`)
      const bytes = await readFile(new URL(`../${path}`, import.meta.url))
      assert.equal(asset.sha256, createHash('sha256').update(bytes).digest('hex'), path)
    }
    assert.match(home.text, /New, must-try kitchen accessories/)
    assert.match(home.text, /Plan your dream kitchen/)
  } finally { await srv.close() }
})

test('IKEA: all original families and each new leaf category purchase through trusted checkout as other, including the89.99 White desk', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    await c.get('/ikea/?run=ikea-catalog-500')
    const expected = new Map()
    for (const product of checkoutSamples) {
      const variant = product.variants?.find(v => v.stock > 0 && v.available !== false)
      const result = await c.post('/ikea/cart/add', { ...bodyFor(product, variant?.options), unit_price: '0', kind: 'game', platform: 'ps5' })
      assert.equal(result.status, 200, product.id)
      expected.set(product.id, variant?.price ?? product.price)
    }
    const review = await c.get('/ikea/checkout')
    const result = await c.post('/ikea/checkout', { ...buyer, checkout_token: fieldValue(review.text, 'checkout_token') })
    assert.equal(result.status, 200)
    assert.match(result.text, /Order confirmed/)
    const orders = await c.json('/api/orders?store=ikea&run=ikea-catalog-500')
    assert.equal(orders.length, 1)
    assert.equal(orders[0].items.length, checkoutSamples.length)
    for (const item of orders[0].items) {
      assert.equal(item.kind, 'other')
      assert.equal(item.unit_price, expected.get(item.sku), item.sku)
      assert.equal(item.platform, undefined)
    }
    assert.equal(orders[0].items.find(p => p.sku === 'desk').unit_price, 89.99)
    assert.equal(orders[0].totals.shipping, 0)
    assert.equal(orders[0].totals.total, Math.round([...expected.values()].reduce((sum, n) => sum + n, 0) * 100) / 100)
    assert.equal(orders[0].meta.gta6_available, false)
    assert.equal((await srv.client().get(`/ikea/order/${orders[0].id}`)).status, 404)
  } finally { await srv.close() }
})

test('IKEA: every explicit variant resolves price/stock and all 55 original available configurations can be ordered', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    const expected = []
    for (const product of originalProducts) {
      if (!product.variants?.length) {
        assert.equal((await c.post('/ikea/cart/add', bodyFor(product))).status, 200)
        expected.push({ sku: product.id, price: product.price, variant: null })
        continue
      }
      assert.equal((await srv.client().post('/ikea/cart/add', bodyFor(product))).status, 400, `missing options: ${product.id}`)
      for (const variant of product.variants) {
        const query = new URLSearchParams(Object.entries(variant.options).map(([key, value]) => [`option_${key}`, value]))
        const page = await c.get(`/ikea/product/${product.id}?${query}`)
        assert.equal(page.status, 200)
        assert.match(page.text, new RegExp(`data-selected-price="${variant.price}"`))
        assert.match(page.text, new RegExp(`data-selected-stock="${Math.min(variant.stock, 10)}"`))
        const result = await c.post('/ikea/cart/add', bodyFor(product, variant.options))
        assert.equal(result.status, variant.stock ? 200 : 400, variant.id)
        if (variant.stock) expected.push({ sku: product.id, price: variant.price, variant: variant.id })
      }
    }
    assert.equal(expected.length, 55)
    const result = await c.post('/ikea/checkout', buyer)
    assert.equal(result.status, 200)
    const order = (await c.json('/api/orders?store=ikea'))[0]
    assert.equal(order.items.length, 55)
    assert.deepEqual(order.items.map(i => i.unit_price), expected.map(i => i.price))
    assert.deepEqual(order.meta.options.map(i => i.variant_id), expected.map(i => i.variant))
  } finally { await srv.close() }
})

test('IKEA: composed facets apply to the same variant, retaining sorting and pagination', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    const desk = await c.get('/ikea/search?department=home-office&category=Furniture&room=home-office&material=Engineered+wood&color=White&min=80&max=90&width=40&depth=20&height=30&rating=4&stock=in&sort=price-asc')
    assert.deepEqual(ids(desk.text), ['desk'])
    assert.match(desk.text, /option_Color=White/)
    const noMix = await c.get('/ikea/search?q=desk&color=Oak+effect&max=95')
    assert.match(noMix.text, /0 results/)
    const full = await c.get('/ikea/search?q=bed+frame&max=230&width=60&stock=in')
    assert.deepEqual(ids(full.text), ['bed-frame'])
    assert.match(full.text, /option_Size=Full/)
    const out = await c.get('/ikea/search?color=Blue&stock=out')
    assert.deepEqual(ids(out.text), ['sofa'])
    assert.deepEqual(prices(out.text), [479])
    assert.match((await c.get('/ikea/search?color=Blue&stock=in')).text, /0 results/)
    const all = [], allPrices = []
    const pageCount = Math.ceil(products.length / 12)
    for (let page = 1; page <= pageCount; page++) {
      const result = await c.get(`/ikea/search?sort=price-asc&page=${page}`)
      all.push(...ids(result.text)); allPrices.push(...prices(result.text))
      assert.match(result.text, new RegExp(`Page ${page} of ${pageCount}`))
      if (page < pageCount) assert.match(result.text, /sort=price-asc&amp;page=/)
    }
    assert.equal(all.length, 500)
    assert.equal(new Set(all).size, 500)
    assert.deepEqual(allPrices, [...allPrices].sort((a, b) => a - b))
    assert.match((await c.get('/ikea/search?page=999')).text, /Page 42 of 42/)
    const category = await c.get('/ikea/category/storage-organization?material=Engineered+wood&sort=price-desc')
    assert.deepEqual(ids(category.text), ['wardrobe', 'chest-drawers', 'shoe-cabinet', 'shelf'])
    assert.deepEqual(prices(category.text), [179, 119, 79.99, 49.99])
    const legacy = await c.get('/ikea/search?category=Furniture&price=50&sort=price-asc')
    assert.ok(ids(legacy.text).length > 0)
    assert.ok(prices(legacy.text).every(price => price <= 50))
    const invalid = await c.get('/ikea/search?width=bad&color%5Bx%5D=White')
    assert.equal(invalid.status, 400)
    assert.match(invalid.text, /role="alert"/)
  } finally { await srv.close() }
})

test('IKEA: aliases help ordinary searches while GTA queries and forged options remain negative', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    assert.ok(ids((await c.get('/ikea/search?q=couch')).text).includes('sofa'))
    assert.ok(ids((await c.get('/ikea/search?q=workstation')).text).includes('desk'))
    for (const q of ['gta 6', 'gta vi', 'grand theft auto', 'grand theft auto vi', 'GTA6', 'Grand Theft Auto 6']) {
      const page = await c.get(`/ikea/search?q=${encodeURIComponent(q)}`)
      assert.match(page.text, /There are no results for/)
      assert.match(page.text, /We found 0 products and 0 content results/)
      assert.match(page.text, /More inspiration like this/)
      assert.match(page.text, /Recommended categories/)
      assert.equal((page.text.match(/src="\/static\/reference\/ikea\/search-/g) || []).length, 24)
    }
    assert.equal((await c.post('/ikea/cart/add', { id: 'gta6', qty: 1 })).status, 400)
    assert.equal((await c.post('/ikea/cart/add', { id: 'sofa', option_Color: 'Oak effect', qty: 1 })).status, 400)
    assert.equal((await c.post('/ikea/cart/add', { id: 'basket', option_Color: 'White', qty: 1 })).status, 400)
    assert.equal((await c.get('/ikea/product/desk?option_Color=Invisible')).status, 400)
    assert.equal((await c.get('/ikea/product/desk?option_Color%5Bx%5D=White')).status, 400)
    assert.match((await c.get('/ikea/cart')).text, /is empty/)
  } finally { await srv.close() }
})

test('IKEA: selected product images stay distinct, stock is enforced and changed reviews reject', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    const white = (await c.get('/ikea/product/desk?option_Color=White')).text.split('class="ik-buy"')[0]
    const oak = (await c.get('/ikea/product/desk?option_Color=Oak+effect')).text.split('class="ik-buy"')[0]
    const whiteImages = await assertProductGallery(c, white, 'ikea', 'desk')
    const oakImages = await assertProductGallery(c, oak, 'ikea', 'desk')
    assert.notEqual((await c.get(whiteImages[0])).text, (await c.get(oakImages[0])).text)
    const beech = await c.get('/ikea/product/dining-chair?option_Color=Natural+beech')
    assert.match(beech.text, /Beech/)
    await assertProductGallery(c, beech.text, 'ikea', 'dining-chair')
    const blue = await c.get('/ikea/product/sofa?option_Color=Blue')
    assert.match(blue.text, /This option is currently out of stock/)
    assert.match(blue.text, /<button disabled>Out of stock/)
    assert.equal((await c.post('/ikea/cart/add', { id: 'sofa', option_Color: 'Gray', qty: 6 })).status, 400)
    await c.post('/ikea/cart/add', { id: 'desk', option_Color: 'White', qty: 1 })
    await c.post('/ikea/cart/add', { id: 'desk', option_Color: 'Oak effect', qty: 1 })
    assert.equal((await c.post('/ikea/cart/update', { id: 'desk', qty: 2 })).status, 400)
    const review = await c.get('/ikea/checkout')
    await c.post('/ikea/cart/update', { id: 'desk', key: 'desk:White', qty: 2, action: 'update' })
    const stale = await c.post('/ikea/checkout', { ...buyer, checkout_token: fieldValue(review.text, 'checkout_token') })
    assert.equal(stale.status, 409)
    assert.match(stale.text, /value="Alex"/)
    assert.doesNotMatch(stale.text, /4242424242424242/)
    assert.equal((await c.json('/api/orders?store=ikea')).length, 0)
    const fresh = await c.get('/ikea/checkout')
    assert.equal((await c.post('/ikea/checkout', { ...buyer, checkout_token: fieldValue(fresh.text, 'checkout_token') })).status, 200)
    const order = (await c.json('/api/orders?store=ikea'))[0]
    assert.deepEqual(order.items.map(i => i.unit_price), [89.99, 99.99])
    assert.equal(order.items[0].qty, 2)
  } finally { await srv.close() }
})


test('IKEA saving a configured favorite preserves selection while rejecting untrusted option redirects', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    const saved = await c.post('/ikea/favorites', { id: 'desk', option_Color: 'Oak effect', return_to: 'https://example.com/' })
    assert.equal(new URL(saved.url).pathname, '/ikea/product/desk')
    assert.equal(new URL(saved.url).searchParams.get('option_Color'), 'Oak effect')
    assert.match(saved.text, /data-selected-price="99.99"/)
    assert.match(saved.text, /data-selected-stock="6"/)
    assert.match(saved.text, /Width: 39⅜ in/)
    const invalid = await c.post('/ikea/favorites', { id: 'desk', option_Color: 'Invisible', option_Size: 'fake' })
    assert.equal(new URL(invalid.url).search, '')
    assert.match(invalid.text, /Choose your options to check availability/)
    const filtered = await c.get('/ikea/search?q=desk&color=White&width=39.374')
    assert.match(filtered.text, /<strong>0 results<\/strong>/)
    assert.ok(!ids(filtered.text).includes('desk'))
    assert.match(filtered.text, /href="\/ikea\/search\?q=desk">Clear all filters/)
    assert.ok(ids((await c.get('/ikea/search?q=desk&color=White&width=39.375')).text).includes('desk'))
  } finally { await srv.close() }
})
