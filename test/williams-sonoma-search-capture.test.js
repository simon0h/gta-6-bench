import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { capturedSearchProducts, capturedWilliamsSearch, isCapturedQuery } from '../stores/williams-sonoma/search-capture.js'
import { startServer } from './helpers.js'

test('Williams Sonoma search capture preserves all observed cards, prices, source images and query scope', async () => {
  assert.equal(capturedSearchProducts.length, 198)
  assert.equal(new Set(capturedSearchProducts.map(p => p.id)).size, 192, 'source DOM includes six repeated product cards')
  assert.ok(capturedSearchProducts.every(p => p.kind === 'other' && Number.isFinite(p.price)))
  assert.equal(capturedSearchProducts[0].price_text, '$649.95')
  assert.equal(capturedSearchProducts[1].price_text, '$ 369.95 – $ 389.95')
  const manifest = JSON.parse(await readFile(new URL('../public/reference/williams-sonoma/manifest.json', import.meta.url)))
  assert.equal(manifest.classification, 'official-captured')
  const productAssets = manifest.assets.filter(asset => asset.placement.startsWith('gta 6 search result'))
  assert.equal(productAssets.length, 198)
  for (const asset of manifest.assets) {
    assert.match(asset.source_url, /^https:\/\//)
    const bytes = await readFile(new URL(`../${asset.local_path}`, import.meta.url))
    assert.equal(asset.sha256, createHash('sha256').update(bytes).digest('hex'))
  }
  assert.deepEqual(manifest.fonts.map(font => font.weight).sort(), [300, 400, 500, 700])
  for (const font of manifest.fonts) {
    const bytes = await readFile(new URL(`../${font.local_path}`, import.meta.url))
    assert.equal(bytes.subarray(0, 4).toString(), 'wOF2')
    assert.equal(font.sha256, createHash('sha256').update(bytes).digest('hex'))
    assert.match(font.source_url, /^https:\/\/fonts\.gstatic\.com\//)
  }
  assert.equal(isCapturedQuery(' GTA   6 '), true)
  assert.equal(isCapturedQuery('GTA6'), false)
  assert.equal(isCapturedQuery('Grand Theft Auto VI'), false)
  const sorted = capturedWilliamsSearch('/williams-sonoma', { words: 'gta 6', sort: 'price-asc' })
  const ids = [...sorted.matchAll(/data-product-id="([^"]+)"/g)].map(match => match[1])
  const prices = ids.map(id => capturedSearchProducts.find(product => product.id === id).price)
  assert.deepEqual(prices, prices.toSorted((a, b) => a - b))
})

test('Williams Sonoma native captured search preserves local links without fabricating purchasable game inventory', async () => {
  const server = await startServer()
  try {
    const client = server.client()
    const page = await client.get('/williams-sonoma/search/results.html?words=gta+6')
    assert.equal(page.status, 200)
    assert.match(page.text, /198 search results for/)
    assert.match(page.text, /src="\/static\/reference\/williams-sonoma\/official-logo\.svg"/)
    assert.equal((page.text.match(/data-product-kind="other"/g) || []).length, 198)
    for (const product of capturedSearchProducts) {
      assert.ok(page.text.includes(`href="/williams-sonoma${product.path}"`))
      assert.ok(page.text.includes(`src="${product.image}"`))
    }
    for (const product of capturedSearchProducts.filter((_, i) => i % 20 === 0)) {
      const detail = await client.get(`/williams-sonoma${product.path}`)
      assert.equal(detail.status, 200)
      assert.ok(detail.text.includes(product.price_text))
      assert.doesNotMatch(detail.text, /class="ws-add-to-cart"/, 'uncaptured inventory must not become a fictional offer')
    }
    assert.equal((await client.get('/williams-sonoma/products/gta6/')).status, 404)
    const brand = await client.get('/williams-sonoma/search/results.html?words=gta+6&brand=Breville')
    assert.doesNotMatch(brand.text, /data-product-id="technivorm-moccamaster-kgb-select"/)
    assert.match(brand.text, /data-product-id="breville-barista-express-impress-espresso"/)
    const alias = await client.get('/williams-sonoma/search/results.html?words=Grand+Theft+Auto+VI')
    assert.doesNotMatch(alias.text, /data-product-kind="other"/)
    assert.equal((await client.get('/williams-sonoma/search/results.html?words=gta+6&brand=x&brand=y')).status, 400)
    assert.deepEqual(await client.json('/api/orders?store=williams-sonoma'), [])
  } finally { await server.close() }
})
