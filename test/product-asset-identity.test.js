import test from 'node:test'
import assert from 'node:assert/strict'
import { readProductAssetCatalog, createProductAssetIndex, getProductAsset } from '../lib/product-asset-catalog.js'
import { productAssetUrl } from '../lib/product-assets.js'

const catalog = await readProductAssetCatalog()
const index = createProductAssetIndex(catalog)

test('image identity registry covers all 20 actual catalogs and every base listing', () => {
  assert.equal(catalog.length, 10000)
  const counts = new Map()
  for (const row of catalog) {
    counts.set(row.store, (counts.get(row.store) || 0) + 1)
    assert.ok(row.id && row.title && row.raw && row.assetKey && row.identity)
    assert.equal(index.get(row.store, row.id), row)
    assert.ok(index.byAssetKey.has(row.assetKey))
    assert.ok(row.assetKey.length < 100)
  }
  assert.equal(counts.size, 20)
  for (const count of counts.values()) assert.equal(count, 500)
})

test('same physical GTA V item reuses assets across retailers, while platform and format differ', () => {
  const target = index.get('target', '81960427')
  const gamestop = index.get('gamestop', 'gs-gta-v-preowned')
  const amazon = index.get('amazon', 'B0BGTAV5P5')
  assert.equal(target.assetKey, gamestop.assetKey)
  assert.equal(target.assetKey, amazon.assetKey)
  assert.notEqual(target.assetKey, index.get('amazon', 'B09GTAVXSX').assetKey)
  assert.notEqual(target.assetKey, index.get('playstation-store', 'UP1004-PPSA03420_00-GTAVSTANDALONE01').assetKey)
  assert.notEqual(target.assetKey, index.get('target', '1011529119').assetKey)
})

test('expanded game identity retains platform and exact title rather than sharing a cover template', () => {
  const games = catalog.filter(row => row.raw.gameTitle === 'The Lantern Atlas')
  assert.ok(games.length > 5)
  const keysByPlatform = new Map()
  for (const game of games) {
    const grouping = `${game.platform}:${game.format}`
    const prior = keysByPlatform.get(grouping)
    if (prior) assert.equal(game.assetKey, prior)
    keysByPlatform.set(grouping, game.assetKey)
  }
  assert.ok(keysByPlatform.size > 1)
  assert.equal(new Set(keysByPlatform.values()).size, keysByPlatform.size)
  const another = catalog.find(row => row.raw.gameTitle === 'Letters from Bellwater')
  assert.ok(another)
  assert.ok(![...keysByPlatform.values()].includes(another.assetKey))
})

test('generic illustrations, photographs and bare product titles never authorize identity reuse', () => {
  const samePhoto = catalog.filter(row => row.sourceArt.photo === 'controller')
  assert.ok(samePhoto.length > 2)
  assert.equal(new Set(samePhoto.map(row => row.assetKey)).size, samePhoto.length)
  const inline = catalog.filter(row => row.sourceArt.inline)
  const byPath = new Map()
  let compared = 0
  for (const row of inline) {
    const previous = byPath.get(row.sourceArt.inline)
    if (previous && previous.id !== row.id) {
      assert.notEqual(previous.assetKey, row.assetKey)
      compared++
    }
    byPath.set(row.sourceArt.inline, row)
  }
  assert.ok(compared > 100)
  const rally = catalog.filter(row => row.canonicalTitle === 'Apex Rally' && row.platform === 'xbox' && row.format === 'disc')
  // These older retailer fixtures name different publishers. A matching bare
  // title does not establish that the products are actually the same edition.
  assert.ok(rally.length >= 2)
  assert.equal(new Set(rally.map(row => row.assetKey)).size, new Set(rally.map(row => row.identity.publisher)).size)
})

test('selected size, capacity, finish and Korean color variants have distinct images and merged specifications', () => {
  const targetSmall = index.get('target', '90000007', { variant: '90000007-1' })
  const targetLarge = index.get('target', '90000007', { options: { 'Size / capacity': '7 qt' } })
  assert.equal(targetSmall.specs.Capacity, '5 quarts')
  assert.equal(targetLarge.specs.Capacity, '7 quarts')
  assert.notEqual(targetSmall.assetKey, targetLarge.assetKey)
  assert.equal(index.get('target', '90000007-2'), targetLarge)
  const black = index.get('coupang', 'dualsense-white', { sku: 'CP-PAD-WHITE-BLACK' })
  const blue = index.get('coupang', 'dualsense-white', { sku: 'CP-PAD-WHITE-BLUE' })
  const white = index.get('coupang', 'dualsense-white', { sku: 'CP-PAD-WHITE' })
  assert.equal(white.variant.id, 'CP-PAD-WHITE')
  assert.equal(white.raw.color, '#edece7')
  assert.equal(black.raw.color, '#25262b')
  assert.equal(blue.raw.color, '#3569aa')
  assert.notEqual(black.assetKey, blue.assetKey)
  const oak = index.get('ikea', 'desk', { options: JSON.stringify({ Color: 'Oak effect' }) })
  assert.equal(oak.variant.id, 'desk-2')
  assert.equal(oak.raw.color, '#c5ae89')
  const size7 = index.get('nike', 'running-shoes', { variant: 'running-shoes-1' })
  const size8 = index.get('nike', 'running-shoes', { variant: 'running-shoes-2' })
  assert.notEqual(size7.assetKey, size8.assetKey)
})

test('shared hardware retains exact model identity; Rockstar offers resolve platform, edition and format', () => {
  const hardware = catalog.filter(row => row.identity.fixture === 'hardware-nintendo-ds-lite-console')
  assert.ok(hardware.length >= 3)
  assert.equal(new Set(hardware.map(row => row.assetKey)).size, 1)
  const ps5 = index.get('rockstar-store', 'gta-vi', { sku: '357725-US' })
  const xbox = index.get('rockstar-store', 'gta-vi', { sku: '357733-US' })
  assert.equal(ps5.platform, 'ps5')
  assert.equal(xbox.platform, 'xbox')
  assert.notEqual(ps5.assetKey, xbox.assetKey)
  assert.equal(ps5.assetKey, index.get('target', '1011529119').assetKey)
  const ultimate = index.get('rockstar-store', 'gta-vi', { platform: 'ps5', edition: 'ultimate', format: 'digital' })
  assert.equal(ultimate.edition, 'ultimate')
  assert.equal(ultimate.format, 'digital')
  assert.notEqual(ultimate.assetKey, ps5.assetKey)
})

test('native aliases and unknown IDs resolve predictably without leaking another product', async () => {
  const bestbuy = index.get('bestbuy', 'J2G6Q8M4RV')
  assert.equal(index.get('bestbuy', '6472245'), bestbuy)
  assert.equal(await getProductAsset('/bestbuy', '6472245'), bestbuy)
  assert.equal(index.get('nike', '6472245'), null)
  assert.equal(index.get('missing-store', '6472245'), null)
  assert.equal(index.get('coupang', 'white'), null)
  assert.equal(index.get('nike', '../../etc/passwd'), null)
})

test('every base and selected variant URL from the shared image helper resolves to its intended item', () => {
  const resolve = (store, raw) => {
    const url = new URL(productAssetUrl(store, raw), 'http://fixture.test')
    const [, , parsedStore, id] = url.pathname.split('/').map(decodeURIComponent)
    return index.get(parsedStore, id, Object.fromEntries(url.searchParams))
  }
  for (const row of catalog) {
    const found = resolve(row.store, row.raw)
    assert.ok(found, `${row.store}/${row.id}`)
    assert.equal(found.id, row.id)
    for (const variant of row.variants) {
      const selected = resolve(row.store, { ...variant.raw, variantId: variant.variant.id })
      assert.ok(selected, `${row.store}/${row.id}/${variant.variant.id}`)
      assert.equal(selected.assetKey, variant.assetKey)
    }
  }
  assert.equal(index.get('game-uk', '992005', { option: '256gb' }).variant.id, '256gb')
})
