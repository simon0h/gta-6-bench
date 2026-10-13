import test from 'node:test'
import assert from 'node:assert/strict'
import { readProductAssetCatalog, createProductAssetIndex } from '../lib/product-asset-catalog.js'
import * as argos from '../stores/argos/data.js'
import { artwork as argosArt } from '../stores/argos/catalog.js'
import * as bestbuy from '../stores/bestbuy/data.js'
import { art as bestbuyArt } from '../stores/bestbuy/browse-pages.js'
import * as eb from '../stores/eb-games-au/browse.js'
import * as smyths from '../stores/smyths-toys/browse.js'
import * as gamestop from '../stores/gamestop/data.js'
import { artwork as gamestopArt } from '../stores/gamestop/catalog-pages.js'
import * as game from '../stores/game-uk/data.js'
import { artwork as gameArt } from '../stores/game-uk/pages.js'
import * as jb from '../stores/jb-hifi/data.js'
import { selectedProduct as selectedJbProduct } from '../stores/jb-hifi/catalog.js'
import { artwork as jbArt } from '../stores/jb-hifi/pages.js'
import * as target from '../stores/target/data.js'
import { productImage as targetArt } from '../stores/target/media.js'
import * as coupang from '../stores/coupang/catalog.js'
import * as rockstar from '../stores/rockstar-store/data.js'
import { art as rockstarArt } from '../stores/rockstar-store/depth-pages.js'

const adapters = [
  ['argos', argos.PRODUCTS, (p,v)=>argos.selectedProduct(p,v.id), argosArt],
  ['bestbuy', bestbuy.PRODUCTS, (p,v)=>bestbuy.selectedProduct(p,v.id), bestbuyArt],
  ['eb-games-au', eb.browseProducts, (p,v)=>eb.resolveProduct(p,v.id), eb.productArt],
  ['smyths-toys', smyths.browseProducts, (p,v)=>smyths.resolveProduct(p,v.options), smyths.artwork],
  ['gamestop', gamestop.PRODUCTS, (p,v)=>gamestop.selectedProduct(p,v.id), gamestopArt],
  ['game-uk', game.PRODUCTS, (p,v)=>game.selectedProduct(p,v.id), gameArt],
  ['jb-hifi', jb.PRODUCTS, (p,v)=>selectedJbProduct(p,v.id), jbArt],
  ['target', target.PRODUCTS, (p,v)=>target.selectedProduct(p,v.id), targetArt],
  ['coupang', coupang.products, (p,v)=>coupang.bySku(v.sku), p=>coupang.media('/coupang',p)],
  ['rockstar-store', rockstar.PRODUCTS, (p,v)=>rockstar.bySku(`${p.sku}:${v.id}`), rockstarArt],
]

test('positive store media preserves the native product and selected option through real variant resolvers', async () => {
  const catalog = await readProductAssetCatalog(), index = createProductAssetIndex(catalog)
  let checked = 0
  const mismatches = []
  for (const [store, products, select, render] of adapters) {
    for (const product of products) {
      const variants = product.variants?.length ? product.variants : Array.isArray(product.options) && product.options[0]?.id ? product.options : []
      for (const variant of variants) {
        const selected = select(product, variant)
        assert.ok(selected, `${store}: selected ${product.title} ${variant.id || variant.sku}`)
        const markup = render(selected)
        const url = new URL(/src="([^"]+)"/.exec(markup)[1].replaceAll('&amp;', '&'), 'http://local')
        const [, prefix, actualStore, actualId] = url.pathname.split('/')
        assert.equal(prefix, 'product-assets')
        assert.equal(actualStore, store)
        const resolved = index.get(store, decodeURIComponent(actualId), Object.fromEntries(url.searchParams))
        assert.ok(resolved, `${store}: ${url.pathname}${url.search}`)
        if (resolved.variant?.id !== String(variant.id || variant.sku)) mismatches.push(`${store}: ${url.pathname}${url.search} resolved ${resolved.variant?.id || 'base'}, expected ${variant.id || variant.sku}`)
        checked++
      }
    }
  }
  assert.deepEqual(mismatches, [], 'Every image matches the selected option')
  assert.ok(checked > 100, `Checked ${checked} real selected product configurations`)
})
