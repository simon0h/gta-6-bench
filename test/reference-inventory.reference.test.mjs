import test from 'node:test'
import assert from 'node:assert/strict'
import { access } from 'node:fs/promises'
import { startServer } from './helpers.js'
import { readStoreInventories } from '../lib/store-inventory.js'
import { readProductAssetCatalog } from '../lib/product-asset-catalog.js'

test('every default catalog row has source evidence and unknown stock stays unknown', async () => {
  const stores = await readStoreInventories()
  assert.equal(stores.length, 20)
  const count = stores.reduce((n, s) => n + s.inventory.length, 0)
  assert.ok(count > 0 && count < 100, `bounded captured catalog, got ${count}`)
  for (const store of stores) {
    assert.equal(store.mode, 'reference')
    assert.equal(store.total, store.inventory.length)
    for (const item of store.inventory) {
      assert.match(item.evidence.source_url, /^https:\/\//)
      await access(new URL('../' + item.evidence.evidence_path.split('#')[0], import.meta.url))
      assert.equal(item.stock_quantity, null)
      if (item.availability === 'unknown') assert.equal(item.available, null)
    }
  }
  const assets = await readProductAssetCatalog()
  assert.equal(assets.length, count)
  for (const p of assets) {
    assert.ok(!p.raw.catalog500, `generated row leaked: ${p.store}/${p.id}`)
    if (['playstation-store', 'xbox-store'].includes(p.store)) {
      assert.equal(p.raw.physical, undefined, `${p.store}/${p.id}: physical offer on digital store`)
      assert.notEqual(p.type, 'console')
    }
  }
})

test('default API separates observed listings, purchase simulations and unknown availability', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    const stores = await c.json('/api/stores')
    assert.equal(stores.length, 20)
    for (const slug of ['coupang', 'chewy']) {
      assert.equal(stores.find(s => s.slug === slug).gta6_available, null)
      assert.equal(stores.find(s => s.slug === slug).availability_status, 'unknown')
    }
    assert.equal(stores.find(s => s.slug === 'gmarket').availability_status, 'listing_only')
    const catalog = await c.json('/api/catalog')
    assert.equal(catalog.mode, 'reference')
    assert.equal(catalog.stores.length, 20)
    assert.equal((await c.json('/api/catalog?store=amazon')).stores.length, 1)
    for (const slug of ['coupang','chewy','ikea','nike','sephora','williams-sonoma','gmarket']) {
      assert.equal(catalog.stores.find(s => s.slug === slug).inventory.length, 0)
    }
    const gmarket = catalog.stores.find(s => s.slug === 'gmarket').observations
    assert.equal(gmarket.length, 2)
    assert.ok(gmarket.every(p => p.purchase === 'unverified'))
    for (const store of stores) {
      const home = await c.get(store.url)
      assert.equal(home.status, 200, `${store.slug} home`)
      assert.doesNotMatch(home.text, /TypeError|ReferenceError|Cannot read properties/)
    }
  } finally { await srv.close() }
})

test('unknown and read-only references cannot become orders through old purchase endpoints', async () => {
  const srv = await startServer()
  try {
    for (const [slug, path, body] of [
      ['coupang', '/cart/add', { id: 'gta6-ps5', productId: 'gta6-ps5', qty: '1' }],
      ['gmarket', '/cart/add', { sku: '4796016651', qty: '1' }],
      ['nike', '/cart/add', { id: 'running-shoes', qty: '1' }],
      ['ikea', '/cart/add', { id: 'billy-bookcase', qty: '1' }],
      ['chewy', '/cart/add', { id: 'dry-dog-food', qty: '1' }],
    ]) {
      const c = srv.client()
      const result = await c.post('/' + slug + path, body, { follow: false })
      assert.ok(result.status >= 400, `${slug}: inactive purchase must be refused, got ${result.status}`)
    }
    assert.deepEqual(await srv.client().json('/api/orders'), [])
    assert.equal((await srv.client().get('/product-assets/amazon/A5G0000001/0.svg')).status, 404)
  } finally { await srv.close() }
})
