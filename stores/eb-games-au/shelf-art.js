// Product pictures for the shop assortment. The shared /product-assets route only knows the
// evidence-backed inventory, so assortment art is rendered by the same local illustration
// renderer and served from this store's own /shelf-art route.
import { esc } from '../../lib/html.js'
import { renderProductAsset } from '../../lib/product-asset-art.js'

const LABELS = ['Product view', 'Alternate view', 'Close-up', 'Additional view']
const xml = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]))

export function shelfArtDescriptor(p, variant = null) {
  const title = p.artHint || p.title
  const type = p.catalogType === 'game' ? 'game' : p.catalogType === 'console' ? 'console' : 'other'
  const colour = variant?.label && /black|white|red|blue|navy|grey|green/i.test(variant.label) ? variant.label : undefined
  return {
    store: 'eb-games-au', id: p.sku, title, type, category: p.category, brand: p.brand,
    platform: p.platform === 'All platforms' ? null : p.platform, format: type === 'game' ? 'disc' : 'physical', specs: p.specs,
    raw: { ...p, title, type: p.type === 'movie' ? 'Blu-ray' : p.artHint ? '' : p.type, colorName: colour, description: '' },
    assetKey: `eb-shelf-${p.sku}`,
  }
}

const cache = new Map()
export function shelfArtSvg(p, view = 0) {
  const key = `${p.sku}:${view}`
  if (cache.has(key)) return cache.get(key)
  let svg = renderProductAsset(shelfArtDescriptor(p), view)
  if (p.artHint) svg = svg.split(`${xml(p.artHint)} — `).join(`${xml(p.title)} — `)
  if (cache.size > 800) cache.delete(cache.keys().next().value)
  cache.set(key, svg)
  return svg
}

export const shelfArtUrl = (base, p, view = 0) => `${base}/shelf-art/${encodeURIComponent(p.sku)}/${view}.svg`
export const shelfViewCount = p => p.catalogType === 'console' ? 4 : 3

export function shelfImage(base, p, { className = '', view = 0, alt, loading = 'lazy' } = {}) {
  return `<img class="pa-product-image ${esc(className)}" data-product-asset src="${esc(shelfArtUrl(base, p, view))}" alt="${esc(alt || p.title)}" width="720" height="720" loading="${loading}" decoding="async">`
}

// Same markup as lib/product-assets.js productGallery, so the shared gallery script and styles apply.
export function shelfGallery(base, p) {
  const count = shelfViewCount(p), title = p.title
  const images = Array.from({ length: count }, (_, i) => ({ src: shelfArtUrl(base, p, i), label: LABELS[i] }))
  const controls = cls => `<div class="pa-gallery-controls"><button type="button" data-pa-step="-1" aria-label="Previous image">‹</button><p${cls} data-pa-caption aria-live="polite">1 / ${count}</p><button type="button" data-pa-step="1" aria-label="Next image">›</button></div>`
  return `<section class="pa-gallery" data-product-gallery data-product-store="eb-games-au" data-product-id="${esc(p.sku)}" aria-label="Product images"><div class="pa-gallery-stage"><button type="button" class="pa-gallery-enlarge" data-pa-enlarge aria-label="Enlarge product image">${shelfImage(base, p, { loading: 'eager', className: 'pa-gallery-main', alt: `${title} — ${LABELS[0]}` })}<span aria-hidden="true">⌕</span></button></div>${controls(' class="pa-gallery-caption"')}<div class="pa-gallery-thumbnails" aria-label="Choose an image">${images.map((image, i) => `<button type="button" data-pa-select="${i}" data-pa-src="${esc(image.src)}" data-pa-label="${esc(image.label)}" data-pa-alt="${esc(title + ' — ' + image.label)}" aria-label="${esc(image.label)}" aria-pressed="${i === 0}">${shelfImage(base, p, { view: i, alt: image.label })}</button>`).join('')}</div><dialog class="pa-gallery-dialog" aria-label="${esc(title)}"><button type="button" class="pa-gallery-close" data-pa-close aria-label="Close image">×</button><img data-pa-expanded src="${esc(images[0].src)}" alt="${esc(title + ' — ' + LABELS[0])}" width="720" height="720">${controls('')}</dialog><noscript><div class="pa-gallery-noscript">${images.slice(1).map((image, i) => `<figure>${shelfImage(base, p, { view: i + 1, alt: title + ' — ' + image.label })}<figcaption>${esc(image.label)}</figcaption></figure>`).join('')}</div></noscript></section>`
}
