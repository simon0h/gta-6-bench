import test from 'node:test'
import assert from 'node:assert/strict'
import { auditProductAssets } from '../scripts/audit-product-assets.mjs'
import { readProductAssetCatalog } from '../lib/product-asset-catalog.js'
import { classifyProductAsset } from '../lib/product-asset-art.js'

test('image subjects follow actual product categories instead of incidental words', async () => {
  const catalog = await readProductAssetCatalog()
  const examples = [
    ['sephora', 'Apricot lip oil', 'beauty'],
    ['sephora', 'Green tea daily face cream', 'beauty'],
    ['sephora', 'Sandalwood & cardamom eau de parfum', 'beauty'],
    ['sephora', 'Rose & cedar perfume oil roller', 'beauty'],
    ['nike', 'Adjustable strap slide', 'shoe'],
    ['nike', 'Brushed winter crew', 'apparel'],
    ['ikea', 'Two-compartment shoe cabinet', 'shelf'],
    ['ikea', 'Solid pine mobile laptop desk', 'table'],
    ['ikea', 'Solid pine monitor riser', 'stand'],
    ['williams-sonoma', 'Tri-ply stainless rounded saucier', 'pan'],
    ['chewy', 'Dog salmon & oat baked reward bites', 'food'],
    ['coupang', '소니 PS5 듀얼센스 무선 컨트롤러, 화이트', 'controller'],
    ['walmart', 'Enameled Cast Iron Dutch Oven, 5 Quart', 'pan'],
    ['amazon', 'Northstar 7-in-1 USB-C Laptop Hub', 'cable'],
    ['amazon', 'The Lantern Keeper: A Coastal Novel - Paperback', 'book'],
    ['amazon', 'Grand Theft Auto VI: The Album [Explicit]', 'media'],
    ['amazon', 'Orchard Folk Lantern Season', 'media'],
    ['target', 'Short Sleeve Crewneck T-Shirt - Goodfellow & Co', 'apparel'],
    ['walmart', 'Tilt-Head Stand Mixer, 4.5 Quart', 'appliance'],
    ['gamestop', 'USB 10Gbps compact scratch drive', 'storage-drive'],
    ['rockstar-store', 'Console and cable travel organizer for Nintendo Switch 2 with Joy-Con 2 attached', 'bag'],
    ['argos', 'Insulated pushchair organiser', 'bag'],
    ['amazon', 'Quilted cotton bed runner', 'textile'],
    ['amazon', 'Silicone analog stick grips', 'stand'],
    ['amazon', 'Steel tea storage tin', 'jar'],
    ['amazon', 'Cotton drawstring shoe bags', 'bag'],
    ['amazon', 'Hearth & Table 1.7L Electric Kettle', 'appliance'],
    ['amazon', 'Northstar Full HD Webcam with Privacy Cover', 'camera'],
    ['walmart', 'Oat facial cleansing milk', 'beauty'],
    ['target', 'Buckwheat soba noodles', 'food'],
    ['amazon', 'Glass meal-prep container', 'jar'],
    ['target', 'Hamster ceramic food dish', 'bowl'],
    ['walmart', 'Coconut fiber pan scrubber', 'brush'],
    ['amazon', 'Market day trading card game', 'toy'],
    ['gamestop', 'Panel-mount extension USB-C data lead', 'cable'],
    ['gamestop', 'Mythic Realms Trading Card Booster', 'card'],
    ['argos', 'Mountain tunnel railway', 'toy'],
    ['amazon', 'Paper lantern craft kit', 'toy'],
    ['argos', 'Layered forest habitat puzzle', 'toy'],
    ['smyths-toys', 'Logic lock puzzle box', 'toy'],
  ]
  for (const [store, title, expected] of examples) {
    const descriptor = catalog.find(product => product.store === store && product.title === title)
    assert.ok(descriptor, `${store}/${title}`)
    assert.equal(classifyProductAsset(descriptor), expected, `${store}/${title}`)
  }
  for (const product of catalog.filter(product => ['nike', 'sephora', 'chewy', 'ikea', 'williams-sonoma'].includes(product.store))) {
    assert.notEqual(classifyProductAsset(product), 'object', `${product.store}/${product.id}`)
  }
})

test('every exact product and configuration has at least three distinct, self-contained visual assets', async () => {
  const report = await auditProductAssets()
  assert.equal(report.baseListings, 10000)
  assert.equal(report.assets, report.uniqueSVGs)
  assert.equal(report.assets, report.uniqueNonTextVisuals)
  assert.equal(report.assets, report.uniqueMainObjectVisuals)
})
