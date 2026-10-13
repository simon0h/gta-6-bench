import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { capturedSephoraSearch, capturedSephoraProduct, capturedSearchProducts, isCapturedQuery } from '../stores/sephora/search-capture.js'

test('Sephora captured search preserves 100 unrelated products and official image bytes', async () => {
  const manifest = JSON.parse(await readFile(new URL('../public/reference/sephora/manifest.json', import.meta.url)))
  assert.equal(manifest.assets.length, 101)
  assert.equal(manifest.captured_at, '2026-10-06')
  assert.equal(capturedSearchProducts.length, 100)
  assert.equal(new Set(capturedSearchProducts.map(product => product.id)).size, 100)
  assert.ok(capturedSearchProducts.every(product => product.kind === 'other' && product.price > 0))
  for (const asset of manifest.assets) {
    assert.match(asset.source_url, /^https:\/\/www\.sephora\.com\//)
    const bytes = await readFile(new URL(`../public/reference/sephora/${asset.file}`, import.meta.url))
    assert.equal(bytes.length, asset.bytes)
    assert.equal(createHash('sha256').update(bytes).digest('hex'), asset.sha256)
  }
  assert.equal(isCapturedQuery(' GTA   6 '), true)
  assert.equal(isCapturedQuery('GTA6'), false)
  assert.equal(isCapturedQuery('Grand Theft Auto VI'), false)
  assert.equal(isCapturedQuery(['gta', '6']), false)
})

test('Sephora capture uses native product paths, captured relevance order, prices, and refinements', () => {
  const html = capturedSephoraSearch('/sephora', { q: 'gta 6' })
  assert.match(html, /100 Results/)
  assert.match(html, /\$29\.50 - \$87\.00/)
  assert.match(html, /aria-label="4\.5 stars"/)
  assert.match(html, /aria-label="720 reviews"/)
  assert.equal((html.match(/data-product-kind="other"/g) || []).length, 100)
  assert.deepEqual([...html.matchAll(/data-product-id="([^"]+)"/g)].map(match => match[1]), capturedSearchProducts.map(product => product.id))
  for (const product of capturedSearchProducts) {
    assert.ok(html.includes(`href="/sephora${product.path}"`))
    assert.ok(html.includes(`src="${product.image}"`))
    const detail = capturedSephoraProduct('/sephora', product)
    assert.ok(detail.includes(`Item ${product.sku}`))
    assert.doesNotMatch(detail, /cart\/add|Add to basket/)
  }
  const ascending = capturedSephoraSearch('/sephora', { q: 'gta 6', sort: 'price-asc' })
  const prices = [...ascending.matchAll(/data-price="([\d.]+)"/g)].map(match => Number(match[1]))
  assert.deepEqual(prices, prices.toSorted((a, b) => a - b))
  const filtered = capturedSephoraSearch('/sephora', { q: 'gta 6', brand: 'Dermalogica' })
  assert.equal((filtered.match(/data-product-kind="other"/g) || []).length, capturedSearchProducts.filter(product => product.brand === 'Dermalogica').length)
  const malicious = capturedSephoraSearch('/sephora', { q: '<script>alert(1)</script>', brand: '\"><script>bad</script>' })
  assert.doesNotMatch(malicious, /<script>/)
  assert.match(malicious, /&lt;script&gt;/)
})
