import { assertProductGallery } from './product-gallery-assertions.js'
import { galleryPrimaryImage, galleryImageUrls } from './helpers.js'
import test from 'node:test'
import assert from 'node:assert/strict'
import { products, departments, brands, candidates, filterCatalog } from '../stores/sephora/catalog.js'
import { PHOTO_KEYS } from '../lib/product-photos.js'
import { startServer, fieldValue } from './helpers.js'
const buyer = { email: 'sephora-catalog@example.com', first_name: 'Alex', last_name: 'Tester', address: '18 Beauty Lane', city: 'Austin', state: 'TX', postal_code: '78701', card_name: 'Alex Tester', card_number: '4242424242424242', card_expiry: '12/39', card_cvv: '123' }
const ids = html => [...html.matchAll(/data-product="([^"]+)"/g)].map(m => m[1])
const optionFields = variant => Object.fromEntries(Object.entries(variant.options).map(([label, value]) => [`option_${label}`, value]))

test('Sephora has 500 distinct coherent beauty families and registered truthful variant artwork', () => {
  assert.equal(products.length, 500)
  assert.equal(new Set(products.map(p => p.id)).size, 500)
  assert.deepEqual(departments.map(category => products.filter(p => p.category === category).length), [100, 100, 90, 80, 80, 50])
  for (const id of ['lip-color', 'moisturizer', 'fragrance', 'serum', 'mascara', 'hair-mask', 'body-wash', 'mini-set']) assert.ok(products.some(p => p.id === id))
  assert.deepEqual(products.find(p => p.id === 'lip-color').options, { Shade: ['Rosewood', 'Nude pink', 'Berry'] })
  assert.equal(products.find(p => p.id === 'lip-color').price, 19.99)
  for (const brand of brands) assert.ok(products.filter(p => p.brandSlug === brand.slug).length >= 4)
  for (const p of products) {
    assert.ok(p.description && p.size && p.formulation && p.material && p.use)
    if (p.photo) assert.ok(PHOTO_KEYS.includes(p.photo), p.photo)
    for (const v of p.variants || []) {
      assert.deepEqual(Object.keys(v.options), Object.keys(p.options))
      assert.ok(Object.entries(v.options).every(([label, value]) => p.options[label].includes(value)))
      assert.ok(Number.isInteger(v.stock) && v.stock >= 0)
      if (v.photo) assert.ok(PHOTO_KEYS.includes(v.photo))
    }
  }
  assert.equal(candidates(products.find(p => p.id === 'concealer')).find(v => v.options.Shade === 'Deep cocoa').photo, 'concealer-deep-cocoa')
  const selections = products.flatMap(candidates)
  assert.equal(selections.length, 519)
  assert.equal(selections.filter(v => v.stock > 0).length, 517)
  const expectedPhotos = ['lipstick-rosewood', 'lipstick-nude-pink', 'lipstick-berry', 'foundation-light-neutral', 'foundation-medium-warm', 'foundation-deep-neutral', 'concealer-medium-golden', 'concealer-deep-cocoa', 'blush-warm-peach', 'brow-pencil-soft-black', 'lip-liner-cocoa', 'lip-oil-rose', 'primer-white-tube', 'toner-aqua', 'eye-cream-white', 'lip-mask-pink', 'leave-in-lavender', 'hair-oil-amber', 'perfume-woody-amber', 'perfume-citrus-yellow', 'body-mist-pink', 'mini-foundation-light', 'mini-foundation-medium', 'mini-foundation-deep', 'lip-oil-clear', 'mini-moisturizer-white']
  for (const key of expectedPhotos) assert.ok(selections.some(v => v.photo === key), key)
  for (const v of selections.filter(v => v.options.Size?.startsWith('Mini'))) {
    if (v.id === 'foundation') assert.ok(v.photo.startsWith('mini-foundation-'))
    else if (v.id === 'moisturizer') assert.equal(v.photo, 'mini-moisturizer-white')
    else assert.equal(v.photo, null, `${v.id} must keep truthful native mini artwork`)
  }
  assert.deepEqual(selections.filter(v => !v.stock).map(v => v.photo), ['mini-foundation-deep', 'lip-oil-clear'])
  assert.equal(filterCatalog({ size: 'Mini' }).length, 10)
})

test('Sephora filters intersect at the same variant and aliases find relevant families', () => {
  assert.deepEqual(filterCatalog({ category: 'Makeup', brand: 'studio-form', type: 'Foundation', size: 'Mini', shade: 'Deep', stock: 'in-stock' }), [])
  assert.deepEqual(filterCatalog({ category: 'Makeup', type: 'Foundation', size: 'Mini', shade: 'Deep', stock: 'out-of-stock' }).map(p => p.id), ['foundation'])
  assert.deepEqual(filterCatalog({ brand: 'studio-form', type: 'Foundation', size: 'Standard', price: '25', stock: 'in-stock' }), [])
  assert.deepEqual(filterCatalog({ q: 'face cream', skin: 'Dry', preference: 'Fragrance-free', size: 'Mini', price: '25', stock: 'in-stock' }).map(p => p.id), ['moisturizer'])
  assert.deepEqual(filterCatalog({ q: 'lip oils' }).map(p => p.id), filterCatalog({ q: 'lip oil' }).map(p => p.id))
  assert.equal(filterCatalog({ q: 'lip oils', type: 'Lip Oil' }).length, 6)
  const oils = filterCatalog({ category: 'Hair', hair: 'Curly', formulation: 'Oil', rating: '4.5' })
  assert.ok(oils.some(p => p.id === 'hair-oil'))
  assert.ok(oils.every(p => p.hair.includes('Curly') && p.formulation === 'Oil' && p.rating >= 4.5))
  assert.ok(filterCatalog({ collection: 'offers' }).every(p => p.price <= 28))
  assert.deepEqual(filterCatalog({ brand: 'unknown' }), [])
})

test('Sephora populated routes, refinement chips, counts, sorting and pagination preserve query state', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    for (const path of ['/', '/shop/makeup', '/shop/skincare', '/shop/hair', '/shop/fragrance', '/shop/bath-body', '/shop/sets', '/shop/mini-size', '/shop/gifts', '/beauty/new', '/beauty/offers', '/beauty/under-50', ...brands.map(b => `/brand/${b.slug}`)]) {
      const page = await c.get(`/sephora${path}`)
      assert.equal(page.status, 200, path)
      assert.match(page.text, /sp-header/)
      assert.ok(ids(page.text).length > 0, path)
    }
    assert.equal((await c.get('/sephora/brands-list')).status, 200)
    for (const path of ['/services', '/stores', '/gift-cards', '/beauty-insider']) assert.equal((await c.get(`/sephora${path}`)).status, 200)
    assert.equal((await c.get('/sephora/shop/nonsense')).status, 404)
    const first = await c.get('/sephora/search?category=Makeup&sort=price-asc')
    const second = await c.get('/sephora/search?category=Makeup&sort=price-asc&page=2')
    assert.equal(ids(first.text).length, 12)
    assert.equal(ids(second.text).length, 12)
    assert.equal(new Set([...ids(first.text), ...ids(second.text)]).size, 24)
    assert.match(second.text, /100 results/)
    assert.match(second.text, /Showing 13–24/)
    assert.match(first.text, /category=Makeup&sort=price-asc&page=2/)
    const prices = [...first.text.matchAll(/data-price="([\d.]+)"/g)].map(m => Number(m[1]))
    assert.deepEqual(prices, [...prices].sort((a, b) => a - b))
    const refine = await c.get('/sephora/search?category=Makeup&brand=studio-form&size=Mini&stock=in-stock')
    assert.match(refine.text, /aria-label="Remove Brand filter"/)
    assert.match(refine.text, /category=Makeup&size=Mini&stock=in-stock/)
    assert.deepEqual(ids(refine.text), ['foundation', 'setting-powder'])
    const suggestions = await c.json('/sephora/search/suggestions?q=lip%20oil')
    assert.equal(suggestions.suggestions.length, 6)
    assert.ok(suggestions.suggestions.some(s => s.url === '/sephora/product/lip-oil'))
  } finally { await srv.close() }
})

test('Sephora PDP selections show matching images, shade, stock, price and canonical form data', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    const light = await c.get('/sephora/product/concealer?Shade=Light%20beige')
    const deep = await c.get('/sephora/product/concealer?Shade=Deep%20cocoa')
    const lightImages = await assertProductGallery(c, light.text, 'sephora', 'concealer')
    const deepImages = await assertProductGallery(c, deep.text, 'sephora', 'concealer')
    assert.notEqual((await c.get(lightImages[0])).text, (await c.get(deepImages[0])).text)
    assert.match(deep.text, /Deep cocoa<\/strong> · Neutral brown undertone/)
    assert.equal(fieldValue(deep.text, 'option_Shade'), 'Deep cocoa')
    const mini = await c.get('/sephora/product/foundation?Shade=Medium%20warm&Size=Mini%20%C2%B7%2010%20mL')
    assert.match(mini.text, /data-selected-price="16"/)
    await assertProductGallery(c, mini.text, 'sephora', 'foundation')
    assert.equal(fieldValue(mini.text, 'option_Shade'), 'Medium warm')
    assert.equal(fieldValue(mini.text, 'option_Size'), 'Mini · 10 mL')
    const out = await c.get('/sephora/product/foundation?Shade=Deep%20neutral&Size=Mini%20%C2%B7%2010%20mL')
    assert.match(out.text, /type="submit" disabled>Unavailable/)
    assert.equal((await c.post('/sephora/cart/add', { id: 'foundation', option_Shade: 'Deep neutral', option_Size: 'Mini · 10 mL' })).status, 400)
    assert.equal((await c.get('/sephora/product/concealer?Shade=Blue')).status, 400)
    assert.equal((await c.get('/sephora/product/concealer?Shade=Light%20beige&Shade=Deep%20cocoa')).status, 400)
    assert.equal((await c.post('/sephora/cart/add', { id: 'lip-color' })).status, 400)
    assert.equal((await c.post('/sephora/cart/add', { id: 'lip-color', option_Shade: 'Blue' })).status, 400)
    const guide = await c.get('/sephora/product/concealer?Shade=Deep%20cocoa&view=guide')
    assert.equal(galleryPrimaryImage(guide.text), galleryImageUrls(guide.text)[1])
    assert.match(guide.text, /Neutral brown undertone/)
  } finally { await srv.close() }
})

test('Every available Sephora selection purchases through canonical kind:other checkout at trusted price', async () => {
  const srv = await startServer()
  try {
    let index = 0, unavailable = 0
    for (const product of products) for (const variant of candidates(product)) {
      const c = srv.client(), run = `sephora-agent81-${index++}`
      await c.get(`/sephora/?run=${run}`)
      const pdp = await c.get(`/sephora/product/${product.id}?${new URLSearchParams(variant.options)}`)
      assert.equal(pdp.status, 200, product.id)
      const added = await c.post('/sephora/cart/add', { id: product.id, qty: 1, kind: 'game', unit_price: '0.01', ...optionFields(variant) })
      if (!variant.stock) { assert.equal(added.status, 400); unavailable++; continue }
      assert.equal(added.status, 200, `${product.id} ${JSON.stringify(variant.options)}`)
      const review = await c.get('/sephora/checkout')
      const result = await c.post('/sephora/checkout', { ...buyer, checkout_token: fieldValue(review.text, 'checkout_token') })
      assert.equal(result.status, 200, product.id)
      assert.match(result.text, /Order confirmed/)
      const [order] = await c.json(`/api/orders?store=sephora&run=${run}`)
      assert.equal(order.items[0].kind, 'other')
      assert.equal(order.items[0].sku, product.id)
      assert.equal(order.items[0].unit_price, variant.price)
      assert.equal(order.meta.gta6_available, false)
      assert.deepEqual(order.meta.options[0].options, variant.options)
      assert.equal(order.meta.options[0].variant_id, variant.variantId || null)
      assert.equal(order.totals.shipping, variant.price < 50 ? 6.95 : 0)
      assert.equal((await srv.client().get(`/sephora/order/${order.id}`)).status, 404)
    }
    assert.equal(index, 519)
    assert.equal(unavailable, 2)
    assert.equal((await srv.client().json('/api/orders?store=sephora')).length, 517)
  } finally { await srv.close() }
})

test('Sephora variant lines, stale review, member shipping and owner-scoped Loves remain sound', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    await c.post('/sephora/cart/add', { id: 'foundation', option_Shade: 'Light neutral', option_Size: 'Standard · 30 mL' })
    const original = await c.get('/sephora/checkout')
    const cart = await c.post('/sephora/cart/add', { id: 'foundation', option_Shade: 'Medium warm', option_Size: 'Mini · 10 mL' })
    assert.match(cart.text, /\$36.00 each/)
    assert.match(cart.text, /\$16.00 each/)
    assert.equal((await c.post('/sephora/cart/update', { id: 'foundation', qty: 2 })).status, 400)
    assert.equal((await c.post('/sephora/checkout', { ...buyer, checkout_token: fieldValue(original.text, 'checkout_token') })).status, 409)
    await c.post('/sephora/favorites', { id: 'lip-color' })
    assert.deepEqual(ids((await c.get('/sephora/favorites')).text), ['lip-color'])
    await c.post('/sephora/account', { mode: 'register', first_name: 'Alex', last_name: 'Beauty', email: 'sephora-member@example.com', password: 'BeautyPassword123' })
    assert.deepEqual(ids((await c.get('/sephora/favorites')).text), [])
    await c.post('/sephora/cart/update', { id: 'foundation', key: 'foundation:Light neutral|Standard · 30 mL', action: 'remove' })
    const memberReview = await c.get('/sephora/checkout')
    const confirmation = await c.post('/sephora/checkout', { ...buyer, checkout_token: fieldValue(memberReview.text, 'checkout_token') })
    assert.match(confirmation.text, /Order confirmed/)
    const [order] = await c.json('/api/orders?store=sephora')
    assert.equal(order.totals.subtotal, 16)
    assert.equal(order.totals.shipping, 0)
    assert.ok(order.meta.account_id)
    await c.post('/sephora/logout')
    assert.equal((await c.get(`/sephora/order/${order.id}`)).status, 404)
    assert.deepEqual(ids((await c.get('/sephora/favorites')).text), ['lip-color'])
  } finally { await srv.close() }
})

test('Sephora GTA searches never offer the game and forged IDs are unpurchasable', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    for (const q of ['gta', 'gta 6', 'GTA6', 'GTA VI', 'GTAVI', 'Grand Theft Auto', 'Grand Theft Auto 6', 'grandtheftautovi']) {
      const result = await c.get(`/sephora/search?q=${encodeURIComponent(q)}`)
      if (q === 'gta 6') {
        assert.match(result.text, /100 Results/)
        assert.equal((result.text.match(/data-product-kind="other"/g) || []).length, 100)
      } else {
        assert.match(result.text, /0 results/)
        assert.match(result.text, /No results found/)
        assert.match(result.text, /You may also like/)
      }
      assert.deepEqual((await c.json(`/sephora/search/suggestions?q=${encodeURIComponent(q)}`)).suggestions, [])
    }
    for (const id of ['gta6', 'gta-vi', 'sephora-gta6']) {
      assert.equal((await c.get(`/sephora/product/${id}`)).status, 404)
      assert.equal((await c.post('/sephora/cart/add', { id, qty: 1, kind: 'game' })).status, 400)
    }
    const injection = await c.get('/sephora/search?q=%3Cimg%20src=x%20onerror=alert(1)%3E')
    assert.doesNotMatch(injection.text, /<img src=x/)
    assert.match(injection.text, /&lt;img/)
    assert.deepEqual(await c.json('/api/orders?store=sephora'), [])
  } finally { await srv.close() }
})
