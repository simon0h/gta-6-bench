import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { capturedSearchProducts, isCapturedQuery, capturedProductAt } from '../stores/nike/search-capture.js'
import { capturedColorways } from '../stores/nike/search-colorways.js'
import { searchImages } from '../stores/ikea/search-reference.js'
import { startServer } from './helpers.js'

test('IKEA and Nike search captures retain source metadata and unmodified image bytes', async () => {
  for (const [store, count] of [['ikea', 27], ['nike', 92]]) {
    const manifest = JSON.parse(await readFile(new URL(`../public/reference/${store}/manifest.json`, import.meta.url)))
    assert.equal(manifest.assets.length, count)
    assert.equal(manifest.classification, 'official-captured')
    assert.equal(new Set(manifest.assets.map(asset => asset.local_path)).size, count)
    for (const asset of manifest.assets) {
      assert.match(asset.source_url, /^https:\/\//)
      assert.ok(asset.placement)
      const bytes = await readFile(new URL(`../${asset.local_path}`, import.meta.url))
      assert.equal(asset.sha256, createHash('sha256').update(bytes).digest('hex'))
    }
    if (store === 'nike' || store === 'ikea') {
      assert.equal(manifest.fonts.length, 2)
      assert.deepEqual(manifest.fonts.map(font => font.weight).sort(), store === 'nike' ? [400, 500] : [400, 700])
      for (const font of manifest.fonts) {
        const bytes = await readFile(new URL(`../${font.local_path}`, import.meta.url))
        assert.equal(bytes.subarray(0, 4).toString(), 'wOF2')
        assert.equal(font.sha256, createHash('sha256').update(bytes).digest('hex'))
        assert.match(font.source_url, store === 'nike' ? /^https:\/\/www\.nike\.com\// : /^https:\/\/www\.ikea\.com\/global\/assets\/fonts\//)
      }
    }
  }
  assert.equal(searchImages.length, 24)
  assert.equal(capturedSearchProducts.length, 32)
  assert.equal(Object.values(capturedColorways).flat().length, 60)
  for (const color of Object.values(capturedColorways).flat()) {
    const landing = capturedProductAt(color.path)
    assert.ok(landing)
    if (!capturedSearchProducts.some(product => product.path === color.path)) assert.equal(landing.price, null)
  }
  assert.ok(capturedSearchProducts.every(product => product.kind === 'other' && (product.subtitle.includes('Shoes') || product.subtitle === 'Tactical Boots')))
  assert.equal(isCapturedQuery(' GTA   6 '), true)
  assert.equal(isCapturedQuery('Grand Theft Auto VI'), false)
  assert.equal(isCapturedQuery('GTA6'), false)
})

test('Nike captured footwear results preserve price/order, native links, sorting and query scope', async () => {
  const server = await startServer()
  try {
    const client = server.client()
    const page = await client.get('/nike/w?q=gta+6')
    assert.equal(page.status, 200)
    assert.match(page.text, /gta 6 \(32\)/)
    assert.match(page.text, /\$126\.97 <s>\$210<\/s> <span>39% off/)
    for (const product of capturedSearchProducts) {
      assert.ok(page.text.includes(`href="/nike${product.path}"`))
      assert.ok(page.text.includes(`src="${product.image}"`))
      const detail = await client.get(`/nike${product.path}`)
      assert.equal(detail.status, 200)
      assert.ok(detail.text.includes(product.id))
    }
    assert.equal((page.text.match(/data-reference-colorway/g) || []).length, 60)
    for (const color of Object.values(capturedColorways).flat()) {
      assert.ok(page.text.includes(`src="${color.image}"`))
      assert.equal((await client.get(`/nike${color.path}`)).status, 200)
    }
    const ascending = await client.get('/nike/w?q=gta+6&sort=price-asc')
    const order = [...ascending.text.matchAll(/data-product-id="([^"]+)"/g)].map(match => capturedSearchProducts.find(p => p.id === match[1]).price)
    assert.deepEqual(order, order.toSorted((a, b) => a - b))
    const women = await client.get('/nike/w?q=gta+6&gender=Women')
    assert.doesNotMatch(women.text, /data-product-id="FV4897-003"/)
    assert.match(women.text, /data-product-id="IO7960-601"/)
    const alias = await client.get('/nike/w?q=Grand+Theft+Auto+VI')
    assert.doesNotMatch(alias.text, /data-product-kind="other"/)
    assert.deepEqual(await client.json('/api/orders?store=nike'), [])
  } finally { await server.close() }
})
