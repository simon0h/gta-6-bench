import test from 'node:test'
import assert from 'node:assert/strict'
import { classifyProductAsset, describeProductAsset, renderProductAsset } from '../lib/product-asset-art.js'
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

const shelfItem = (store, title, raw = {}) => ({ store, title, assetKey: `${store}-${title}`, type: 'other', specs: {}, raw: { title, ...raw } })

test('products draw as what they are, not as an incidental word in their name', () => {
  const examples = [
    ['nike', "Nike Pro Men's Dri-FIT Tight Short-Sleeve Fitness Top", { shape: 'apparel' }, 'apparel'],
    ['nike', "Nike Academy Men's Dri-FIT Football Training Top", { shape: 'apparel' }, 'apparel'],
    ['nike', 'Nike Vapor Jet 8.0 Football Gloves', { shape: 'apparel' }, 'apparel'],
    ['argos', 'Tu Mens Navy Crew Neck Jumper', { category: 'Clothing' }, 'apparel'],
    ['nike', 'Jordan Jersey Backpack (27L)', { shape: 'bag' }, 'bag'],
    ['eb-games-au', 'Spinning top toy', { category: 'Toys & Games' }, 'toy'],
    ['amazon', 'Ray-Ban RB2140 Original Wayfarer Sunglasses – Black/Green', { type: 'sunglasses' }, 'eyewear'],
    ['coupang', 'swim goggles', { shape: 'apparel' }, 'eyewear'],
    ['williams-sonoma', 'Riedel Bar Rocks Glasses, Set of 2', { category: 'Tabletop', type: 'Glassware' }, 'cup'],
    ['smyths-toys', 'LEGO Editions 43023 McLaren F1 Team Lando Norris Helmet Set', { type: 'other', shape: 'toy', category: 'LEGO & Bricks', brand: 'LEGO' }, 'toy'],
    ['game-uk', "LEGO Icons The Lord of the Rings: Sauron's Helmet 11373", { shape: 'bricks', category: 'Building Sets', brand: 'LEGO' }, 'toy'],
    ['smyths-toys', 'LeapFrog Scoop & Learn Ice Cream Cart', { shape: 'toy', category: 'Pre-School & Electronic Learning', brand: 'LeapFrog' }, 'toy'],
    ['smyths-toys', "Bluey's Light and Surprise Mega House Playset", { shape: 'toy', category: 'Pre-School', brand: 'Bluey' }, 'toy'],
    ['argos', 'Ninja Foodi MAX Dual Zone 9.5L Air Fryer - Black', { category: 'Appliances' }, 'air-fryer'],
    ['argos', 'Tower Vortx 9L Dual Basket Air Fryer - Black', { category: 'Appliances' }, 'air-fryer'],
    ['argos', 'Bosch Series 2 Full Size Dishwasher - White', { category: 'Appliances' }, 'dishwasher'],
    ['target', 'Dishwasher Safe Stoneware Mug', { type: 'Mugs' }, 'cup'],
    ['argos', 'Dyson Airwrap i.d. Multi-Styler and Dryer - Vinca Blue', { category: 'Health & Beauty' }, 'hair-tool'],
    ['argos', 'ghd Platinum+ Hair Straightener - Black', { category: 'Health & Beauty' }, 'hair-tool'],
    ['bestbuy', 'clothes dryer', { category: 'Washers & Dryers' }, 'appliance'],
    ['argos', 'Hoover H-Wash 300 8KG 1400 Spin Washing Machine - White', { category: 'Appliances' }, 'appliance'],
    ['argos', 'Omron M3 Comfort Upper Arm Blood Pressure Monitor', { category: 'Health & Beauty' }, 'health-monitor'],
    ['argos', 'Opti Walking Pad Under Desk Treadmill', { category: 'Sports & Leisure' }, 'fitness'],
    ['target', 'Bounty Select-A-Size Paper Towels - 6 Double Rolls', { type: 'Paper Towels' }, 'paper-roll'],
    ['ikea', 'BROGRUND Toilet roll holder', { shape: 'jar' }, 'stand'],
    ['target', "Ben & Jerry's Half Baked Ice Cream - 16oz", { type: 'Frozen Foods', category: 'grocery' }, 'food'],
    ['coupang', 'apples fruit box', { shape: 'food' }, 'food'],
    ['smyths-toys', "Sadie's Wooden Doll House", { shape: 'toy', category: 'Wooden Toys' }, 'toy'],
  ]
  for (const [store, title, raw, expected] of examples) assert.equal(classifyProductAsset(shelfItem(store, title, raw)), expected, title)
})

test('televisions, soundbars, dolls, milk, produce and work lamps get their own drawings', () => {
  const shape = (store, title, raw, view = 0) => objectDrawing(renderProductAsset(shelfItem(store, title, raw), view)).replace(/-?\d+(?:\.\d+)?/g, '#')
  // A television stands on feet or a wide pedestal; a computer monitor keeps its neck stand.
  assert.notEqual(shape('bestbuy', 'television', { category: 'TVs' }), shape('bestbuy', 'Dell 27-inch QHD Monitor', { category: 'Monitors' }))
  assert.notEqual(shape('argos', 'Sonos Beam Soundbar', { category: 'Technology' }), shape('argos', 'Sonos Era 100 Speaker', { category: 'Technology' }))
  assert.notEqual(shape('argos', 'Barbie Fashionistas Doll', { category: 'Toys' }), shape('argos', 'Plush teddy bear', { category: 'Toys' }))
  assert.notEqual(shape('ikea', 'TERTIAL Work lamp', { shape: 'lamp' }), shape('ikea', 'Ceramic table lamp', { shape: 'lamp' }))
  assert.notEqual(shape('ikea', 'HEKTAR Floor lamp', { shape: 'lamp' }), shape('ikea', 'Ceramic table lamp', { shape: 'lamp' }))
  for (const [store, title, raw] of [['target', '2% Reduced Fat Milk - 1gal', { type: 'Dairy' }], ['target', 'Bananas - each', { type: 'Produce' }]]) {
    assert.notEqual(shape(store, title, raw), shape(store, 'Rolled oats', { type: 'Pantry' }), title)
  }
  for (const [store, title, raw] of [['amazon', 'Wayfarer Sunglasses', {}], ['coupang', 'swim goggles', {}], ['argos', 'Ninja Air Fryer AF100UK', {}], ['argos', 'Beko Slimline Dishwasher', {}], ['amazon', 'Hair dryer', {}], ['argos', 'Dyson Airwrap Multi-Styler', {}], ['argos', 'ghd Hair Straightener', {}], ['argos', 'Blood Pressure Monitor', {}], ['target', 'Toilet Paper - 12 Mega Rolls', {}], ['argos', 'Reebok Treadmill', {}], ['target', 'Organic Baby Spinach', { type: 'Produce' }], ['smyths-toys', 'Talking Baby Doll', {}]]) {
    const views = [0, 1, 2, 3].map(view => renderProductAsset(shelfItem(store, title, raw), view))
    for (const svg of views) assert.doesNotMatch(svg, /NaN|undefined|Infinity/, title)
    assert.equal(new Set(views.map(objectDrawing)).size, 4, `${title} has four distinct views`)
  }
})
