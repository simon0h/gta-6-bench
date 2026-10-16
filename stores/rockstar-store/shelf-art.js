// Product pictures for the store assortment (shelf.js). The shared /product-assets route only indexes the evidence-backed
// catalog rows from inventory.js, so assortment pictures are served by this store at /rockstar-store/shelf-art/<id>/<view>.svg,
// drawn with the same local illustration renderer (lib/product-asset-art.js). No external images are requested.
import { esc } from '../../lib/html.js'
import { productGallery } from '../../lib/product-assets.js'
import { renderProductAsset } from '../../lib/product-asset-art.js'
import { withPrint, currencySvg } from './shelf-prints.js'
import { gameArtSvg } from './game-covers.js'

const MOUNT = '/rockstar-store'
export const isShelf = p => !!(p?.shelf || p?.product?.shelf)

// The renderer picks a drawing from the title. Assortment titles are full of franchise words ("Goodtime State",
// "Gold Bars") that would steer it to the wrong object, so it gets a plain description of the physical item instead.
const ART_TITLE = { tee: 'T-shirt', crewneck: 'crewneck sweatshirt', hoodie: 'hoodie', cap: 'baseball cap', pack: 'digital cash card', currency: 'digital cash card' }
// A few garments in the tee / hoodie / cap groups have their own cut.
const CUT = [[/Long Sleeve/, 'long sleeve T-shirt'], [/Flannel/, 'long sleeve flannel shirt'], [/Polo/, 'polo shirt'], [/Jacket/, 'jacket'], [/Beanie/, 'beanie']]
const artTitle = p => CUT.find(([re]) => re.test(p.title))?.[1] || ART_TITLE[p.shape]
function descriptor(p, variant) {
  const game = p.section === 'Games'
  const title = game ? p.title : ART_TITLE[p.shape] ? `${p.title.match(/^(Black|Blue|Pink|White|Grey|Red|Yellow|Camo)\b/)?.[1] || ''} ${artTitle(p)}`.trim() : p.title.replace(/goodtime state|gold bars?/gi, '').trim()
  const color = variant?.color || p.color
  return { store: 'rockstar-store', id: p.id, title, type: game ? 'game' : 'other', category: p.category, brand: 'Rockstar Games', platform: game ? 'pc' : null, format: p.delivery === 'digital' ? 'digital' : 'physical', raw: { ...p, title, color }, assetKey: `rockstar-shelf-${p.id}`, specs: {} }
}
const cache = new Map()
export function shelfSvg(p, view = 0) {
  const key = `${p.id}:${view}`
  if (!cache.has(key)) {
    const svg = ['currency', 'pack'].includes(p.shape) ? currencySvg(p, view) : gameArtSvg(p, view) || renderProductAsset(descriptor(p), view)
    cache.set(key, view === 0 ? withPrint(svg, p, p.shape, p.color || '#1d1d1f') : svg)
  }
  return cache.get(key)
}
const url = (p, view = 0) => `${MOUNT}/shelf-art/${encodeURIComponent(p.id)}/${view}.svg`
export function shelfImage(item, cls = '') {
  const p = item.product || item
  return `<img class="pa-product-image ${esc(cls)}" data-product-asset src="${esc(url(p))}" alt="${esc(item.title || p.title)}" width="720" height="720" loading="lazy" decoding="async">`
}
// Same gallery markup and script hooks as the shared helper, pointed at this store's picture route.
export function shelfGallery(p, opts = {}) {
  return productGallery('rockstar-store', { id: p.id, title: p.title }, opts).replaceAll(`/product-assets/rockstar-store/${encodeURIComponent(p.id)}/`, `${MOUNT}/shelf-art/${encodeURIComponent(p.id)}/`)
}
export function installShelfArt(router, byId) {
  router.get('/shelf-art/:id/:view.svg', (req, res) => {
    const p = byId(req.params.id)
    if (!p?.shelf || !/^[0-3]$/.test(req.params.view)) return res.status(404).type('text').send('Product image not found')
    res.set('Cache-Control', 'public, max-age=3600').type('image/svg+xml').send(shelfSvg(p, Number(req.params.view)))
  })
}
