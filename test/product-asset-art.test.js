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

test('home goods, toys and groceries draw as the item their name gives, not a word inside it', () => {
  const examples = [
    ['williams-sonoma', 'Washed Linen Table Runner, 108"', {}, 'textile'],
    ['ikea', 'SKURAR Plant pot', { shape: 'vase' }, 'vase'],
    ['ikea', 'OLIVBLAD Plant stand', { shape: 'stand' }, 'stand'],
    ['ikea', 'ÄLMAREN Kitchen faucet', { shape: 'appliance' }, 'faucet'],
    ['amazon', 'Moen Engage Magnetix Six-Function Handheld Shower Head – Chrome', {}, 'faucet'],
    ['ikea', 'BJÄRSEN Shower curtain', { shape: 'jar' }, 'curtain'],
    ['amazon', 'Weber Original Kettle Premium Charcoal Grill, 22-Inch – Black', {}, 'grill'],
    ['argos', 'Challenge 12 Inch Desk Fan - White', {}, 'appliance'],
    ['smyths-toys', 'Impala Quad Skates Pastel Fade', {}, 'skates'],
    ['amazon', 'Play-Doh Modeling Compound 10-Pack Case of Colors', {}, 'toy'],
    ['amazon', 'LEGO City Police Car', {}, 'toy'],
    ['smyths-toys', 'Dimples Wooden Light-Up Vanity Table and Stool', {}, 'toy'],
    ['jb-hifi', "De'Longhi Magnifica Evo Fully Automatic Coffee Machine", {}, 'coffee-machine'],
    ['ikea', 'METALLISK Espresso maker', { shape: 'jar' }, 'jar'],
    ['jb-hifi', 'Belkin BoostCharge Pro 3-in-1 Wireless Charging Pad with MagSafe 15W', {}, 'wireless-charger'],
    ['amazon', 'Windex Glass Cleaner', {}, 'beauty'],
    ['gmarket', '스와로브스키 하트 목걸이', {}, 'jewelry'],
    ['amazon', 'Cotton friendship bracelet kit', {}, 'toy'],
    ['gmarket', 'MSI 지포스 RTX 5060 그래픽카드', {}, 'graphics-card'],
    ['gmarket', '듀라셀 AA 건전지 20개입', {}, 'battery'],
    ['gmarket', 'KF94 마스크 100매', {}, 'face-mask'],
    ['coupang', '코코넛 헤어 마스크 200ml', {}, 'beauty'],
    ['gmarket', '하기스 기저귀 대형', {}, 'diapers'],
    ['gmarket', '시스테마 칫솔 12개', {}, 'oral-care'],
    ['gmarket', '퐁퐁 주방세제 1L', {}, 'dish-soap'],
    ['gmarket', '국내산 삼겹살 500g', {}, 'meat'],
    ['williams-sonoma', 'Forged full-tang steak knife pair', {}, 'utensil'],
    ['gmarket', '뉴질랜드 골드키위 3kg', {}, 'food'],
    ['coupang', '오이 수분 시트 마스크 5매', {}, 'beauty'],
  ]
  for (const [store, title, raw, expected] of examples) assert.equal(classifyProductAsset(shelfItem(store, title, raw)), expected, title)
})

test('toy sub-forms follow the toy, not the shop department, and new forms have distinct views', () => {
  const form = (title, raw) => objectDrawing(renderProductAsset(shelfItem('smyths-toys', title, { shape: 'toy', ...raw }), 0)).replace(/-?\d+(?:\.\d+)?/g, '#')
  assert.notEqual(form('Play-Doh Tubs 85g Super Colour 20 Pack', { category: 'Arts, Crafts & Music' }), form('Kids Xylophone', { category: 'Arts, Crafts & Music' }))
  assert.notEqual(form('LEGO City 60511 Vintage Steam Train Set', { brand: 'LEGO' }), form('Remote Control Titan Crawler Truck', {}))
  assert.notEqual(form('PJ Masks Playset 2-in-1 Transforming Mobile HQ', {}), form('Play Factory Foam Blocks 24 Pack', {}))
  for (const [store, title, raw] of [['amazon', 'Kitchen faucet', {}], ['amazon', 'Charcoal kettle grill', {}], ['amazon', 'Inline skates', {}], ['jb-hifi', 'Breville espresso machine', {}], ['jb-hifi', 'Belkin wireless charger', {}], ['gmarket', '하트 목걸이', {}], ['gmarket', 'RTX 5070 그래픽카드', {}], ['gmarket', 'AA 건전지 10개입', {}], ['gmarket', 'KF94 마스크', {}], ['gmarket', '기저귀 대형', {}], ['gmarket', '치약 150g', {}], ['gmarket', '주방세제 1L', {}], ['gmarket', '한우 등심 300g', {}], ['smyths-toys', 'Bolt the Robo Pup Interactive Toy', { shape: 'toy' }], ['smyths-toys', 'Play-Doh Tubs 20 Pack', { shape: 'toy' }]]) {
    const views = [0, 1, 2, 3].map(view => renderProductAsset(shelfItem(store, title, raw), view))
    for (const svg of views) assert.doesNotMatch(svg, /NaN|undefined|Infinity/, title)
    assert.equal(new Set(views.map(objectDrawing)).size, 4, `${title} has four distinct views`)
  }
})

test('game covers vary their world by title, and gift cards carry no English label', () => {
  const cover = title => objectDrawing(renderProductAsset({ assetKey: `cover-${title}`, title, type: 'game', format: 'disc', platform: 'ps5', raw: { title } }, 0)).replace(/-?\d+(?:\.\d+)?/g, '#').replace(/hsl\([^)]*\)|#[0-9a-f]{3,6}/gi, 'c')
  const scenes = new Set(['Astro Bot', 'Gran Turismo 7', 'Silent Hill 2', 'Minecraft', 'NBA 2K27', 'Donkey Kong Bananza', 'Tomodachi Life'].map(cover))
  assert.ok(scenes.size >= 4, `covers share too few scene layouts (${scenes.size})`)
  const card = renderProductAsset({ assetKey: 'gift', title: 'gift card', type: 'other', raw: { title: 'gift card' } }, 0)
  assert.doesNotMatch(card.slice(card.indexOf('<g data-asset-object')), />gift card</i)
  assert.match(card, /<title>gift card<\/title>/)
})
