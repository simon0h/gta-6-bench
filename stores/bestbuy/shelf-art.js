// Product pictures for the store assortment. The shared product-asset route only indexes the
// evidence-backed catalog, so shelf items are drawn with the same local illustration renderer
// and served from this store at /bestbuy/shelf-art/<sku>/<view>.svg.
import { renderProductAsset } from '../../lib/product-asset-art.js'
import { productImage, productGallery } from '../../lib/product-assets.js'

const SHAPES = new Set(['desktop', 'router', 'watch', 'ssd'])
const cache = new Map()

function descriptor(p) {
  const named = ['game', 'console', 'media'].includes(p.artType)
  const title = named || !p.artHint ? p.title.replace(/^.*? - /, '') : p.artHint
  const colorName = p.title.split(' - ').at(-1)
  const type = ['game', 'console'].includes(p.artType) ? p.artType : 'other'
  return {
    store: 'bestbuy', id: p.id, title, category: p.artType === 'media' ? `${p.artHint} ${p.category}` : p.category, brand: p.brand, type,
    platform: p.catalogPlatform || null, format: type === 'game' ? 'disc' : 'physical', edition: type === 'game' ? 'standard' : null,
    assetKey: `bestbuy-shelf-${p.sku}`, specs: p.specs,
    raw: { title, category: p.artType === 'media' ? 'Vinyl' : p.category, colorName, brand: p.brand, platform: p.catalogPlatform, publisher: p.publisher, ...(SHAPES.has(p.artHint) ? { shape: p.artHint } : {}) },
  }
}

export function shelfArtSvg(p, view) {
  const key = `${p.sku}:${view}`
  if (!cache.has(key)) {
    if (cache.size > 2000) cache.delete(cache.keys().next().value)
    cache.set(key, renderProductAsset(descriptor(p), view))
  }
  return cache.get(key)
}

const ASSET_URL = /\/product-assets\/bestbuy\/[^/"]+\/(\d+)\.svg[^"]*/g
const local = (p, html) => html.replace(ASSET_URL, (_, view) => `/bestbuy/shelf-art/${p.sku}/${view}.svg`)
export const shelfImage = (p, options) => local(p, productImage('bestbuy', p, options))
export const shelfGallery = (p, options) => local(p, productGallery('bestbuy', p, options))
