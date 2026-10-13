import test from 'node:test'
import assert from 'node:assert/strict'
import { describeProductAsset, renderProductAsset } from '../lib/product-asset-art.js'
import { readProductAssetCatalog } from '../lib/product-asset-catalog.js'

const objectDrawing = svg => svg.slice(svg.indexOf('<g data-asset-object='), svg.lastIndexOf('<text'))
  .replace(/<(?:text|title|desc)\b[^>]*>[\s\S]*?<\/(?:text|title|desc)>/g, '')
  .replace(/\sdata-[\w-]+="[^"]*"/g, '')

test('art is deterministic and product titles cannot inject markup or external images', () => {
  const product = { assetKey: 'safe-game', title: 'A <script> & a "portrait"', type: 'game', format: 'digital', raw: { genre: 'Adventure' } }
  const svg = renderProductAsset(product, 0)
  assert.equal(svg, renderProductAsset(product, 0))
  assert.match(svg, /&lt;script&gt;/)
  assert.doesNotMatch(svg, /<script\b|<image\b|(?:href|src)="https?:/)
  assert.doesNotMatch(svg, /undefined|NaN|Infinity/)
})

test('physical console galleries show distinct hardware faces and their component view', async () => {
  const catalog = await readProductAssetCatalog()
  for (const platform of ['ps5', 'xbox', 'switch', 'nintendo-ds']) {
    const product = catalog.find(p => p.type === 'console' && p.platform === platform)
    assert.ok(product, platform)
    const drawings = [0, 1, 2, 3].map(v => objectDrawing(renderProductAsset(product, v)))
    assert.equal(new Set(drawings).size, 4, `${platform} must have four actual views`)
    assert.ok(drawings.every(drawing => /<(path|rect|circle|ellipse|polygon)\b/.test(drawing)))
  }
})

test('digital entitlements describe illustrated worlds rather than physical game cases', async () => {
  const catalog = await readProductAssetCatalog()
  const digital = catalog.find(p => p.type === 'game' && p.format === 'digital')
  const physical = catalog.find(p => p.type === 'game' && p.format === 'disc')
  assert.ok(digital && physical)
  assert.equal(describeProductAsset(digital, 3).label, 'Digital artwork collection')
  assert.equal(describeProductAsset(physical, 3).label, 'Case and media')
  assert.notEqual(objectDrawing(renderProductAsset(digital, 3)), objectDrawing(renderProductAsset(physical, 3)))
})

test('different construction and materials change the actual image, not only labels', async () => {
  const catalog = await readProductAssetCatalog()
  const desk = catalog.find(p => p.store === 'ikea' && p.title === 'Solid pine mobile laptop desk')
  const shirt = catalog.find(p => p.store === 'nike' && p.title === 'Cloud knit daily runner')
  assert.ok(desk && shirt)
  assert.equal(describeProductAsset(desk).material, 'wood')
  assert.equal(describeProductAsset(shirt).material, 'fabric')
  const wider = { ...desk, assetKey: `${desk.assetKey}-wider`, raw: { ...desk.raw, dimensions: { width: 60, height: 25, depth: 30 } } }
  for (const view of [0, 1, 2]) assert.notEqual(objectDrawing(renderProductAsset(desk, view)), objectDrawing(renderProductAsset(wider, view)))
})
