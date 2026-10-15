// Reference-mode shop floor: the Smyths assortment from shelf-data.js turned into product records
// that the existing basket/checkout understands (kind: 'other'). It is deliberately a separate array
// from the evidence-backed GTA VI rows in data.js, so catalog policy and the reference inventory
// report keep describing only the GTA listings.
import { esc } from '../../lib/html.js'
import { renderProductAsset } from '../../lib/product-asset-art.js'
import { SHELF_ROWS } from './shelf-data.js'
import { categoryByCode, CATEGORY_ROWS } from './site-data.js'

const DEPARTMENT = { toys: 'Toys', baby: 'Baby Room', outdoor: 'Outdoor', 'gaming-and-tech': 'Gaming & Tech' }
export const realSlug = value => String(value).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/['’]/g, '').replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const hash = s => [...String(s)].reduce((a, c) => (Math.imul(a, 31) + c.charCodeAt(0)) >>> 0, 17)

// Age suitability by aisle (min, max years). Used for the Age facet and Gift Finder only.
const AGES = {
  SM060101: [3, 12], SM060102: [3, 12], SM060103: [1, 5], SM06010315: [1, 5], SM06010350: [3, 6], SM0601039702: [3, 8],
  SM060104: [3, 10], SM06010403: [3, 10], SM06010416: [5, 12], SM060105: [4, 12], SM060106: [5, 99], SM060107: [6, 99],
  SM060120: [2, 7], SM06010210: [3, 10],
  SM060201: [0, 3], SM060202: [0, 12], SM060203: [0, 4], SM060205: [0, 4], SM060208: [0, 3], SM060211: [0, 1],
  SM060213: [0, 1], SM060214: [0, 4], SM060216: [0, 2],
  SM060301: [5, 14], SM060311: [5, 14], SM060309: [6, 99], SM060304: [1, 5], SM060327: [8, 99], SM060315: [5, 99],
  SM06030701: [5, 99], SM060316: [6, 99], SM060308: [3, 12],
}
const ASSEMBLY = /SM060107|SM060301|SM060309|SM060203|SM060316|SM060315|SM060304|SM060308/

function kindOf(r) {
  if (!r.catPath.startsWith('gaming-and-tech')) return 'other'
  if (/controller|headset|drive|speakers|bundle|ssd|hdd/i.test(r.title)) return 'accessory'
  if (/console|nintendo switch neon|digital edition slim/i.test(r.title)) return 'console'
  if (/\/games|pre-order-games|pokemon-gaming|mario-gaming|-games$/.test(r.catPath)) return 'game'
  return 'accessory'
}
const platformOf = t => /\bPS5\b|PlayStation 5/i.test(t) ? 'ps5' : /Switch 2/i.test(t) ? 'switch-2' : /Nintendo Switch/i.test(t) ? 'switch' : /xbox/i.test(t) ? 'xbox' : null
const PLATFORM_LABEL = { ps5: 'PlayStation 5', 'switch-2': 'Nintendo Switch 2', switch: 'Nintendo Switch', xbox: 'Xbox Series X|S' }

function artShape(r, kind) {
  const code = r.codes[0], t = r.title.toLowerCase()
  if (/game drive|ssd/.test(t)) return 'ssd'
  if (/speakers/.test(t)) return 'speaker'
  if (/disc drive/.test(t)) return 'object'
  if (kind !== 'other') return null
  if (/SM060202/.test(code)) return 'seat'
  if (/SM060203/.test(code)) return 'bed'
  if (/SM060301|SM060311/.test(code)) return 'bicycle'
  if (/SM060104|SM06010403|SM060101/.test(code)) return 'figure'
  if (/SM06030701|SM060315/.test(code)) return 'ball'
  return 'toy'
}

function features(p) {
  const list = []
  const set = p.title.match(/\b(\d{5})\b/)
  if (p.brand === 'LEGO' && set) list.push(`LEGO set number ${set[1]}`)
  const pieces = p.title.match(/(\d+)[ -]Piece/i)
  if (pieces) list.push(`Contains ${pieces[1]} pieces`)
  if (p.platform) list.push(`Platform: ${PLATFORM_LABEL[p.platform]}`)
  if (p.preorder) list.push('Pre-order now – your order is dispatched or ready to collect on release')
  if (/R129|i-Size/.test(p.title)) list.push('Meets the R129 (i-Size) car seat standard')
  if (/LED/.test(p.title)) list.push('LED light-up features')
  if (/Remote Control/i.test(p.title)) list.push('Remote control included')
  if (/Interactive/i.test(p.title)) list.push('Interactive play with lights, sounds and reactions')
  list.push(p.minAge >= 18 ? 'Designed for adult collectors and builders' : p.minAge === 0 ? 'Suitable from birth – always follow the supplied instructions' : `Suitable for ages ${p.minAge}+`)
  list.push(`Brand: ${p.brand}`)
  return list
}
function description(p) {
  if (p.kind === 'game') return `${p.title.replace(/\s*\(.*\)$/, '')} on ${PLATFORM_LABEL[p.platform] || 'console'}. ${p.preorder ? 'Pre-order today at Smyths Toys and benefit from our Pre-order Price Promise.' : 'Available for Home Delivery and Click & Collect.'}`
  if (p.catalogType === 'console') return `The ${p.title}. Games and accessories are sold separately.`
  return `${p.title} from ${p.brand}. Find it in the ${p.category} aisle at your local Smyths Toys Superstore, or order online for Home Delivery or FREE Click & Collect.`
}

export const shelfProducts = SHELF_ROWS.map((r, i) => {
  const primary = categoryByCode(r.codes[0])
  if (!primary?.department || !DEPARTMENT[primary.department]) throw new Error(`Shelf row ${r.sku} needs a department category first`)
  const kind = kindOf(r), platform = kind === 'game' || kind === 'console' || /PS5|PlayStation 5|Xbox|Switch/i.test(r.title) ? platformOf(r.title) : null
  const leaf = primary.path.split('/c/')[0].split('/').filter(Boolean).at(-1)
  let [minAge, maxAge] = AGES[r.codes.find(c => AGES[c])] || (kind === 'other' ? [3, 99] : [7, 99])
  if (/for Adults/i.test(r.title)) [minAge, maxAge] = [18, 99]
  if (/3 Wheel/i.test(r.title)) [minAge, maxAge] = [3, 6]
  const h = hash(r.sku)
  const preorder = r.codes.some(c => ['SM060403', 'SM06040301', 'SM06040302'].includes(c))
  const codes = [...r.codes]
  const department = DEPARTMENT[primary.department]
  if (r.was && department === 'Toys') codes.push('SM060108')
  if (r.was && department === 'Gaming & Tech' && !codes.includes('gaming-offers')) codes.push('gaming-offers')
  if (r.price <= 10 && department === 'Toys') codes.push('SM060114')
  const bulky = /SM060309|SM060301|SM060203|SM060316|SM060304/.test(r.codes[0])
  const deliveryStock = 24, collectionStock = bulky ? { beckton: 2, salford: 0 } : { beckton: 6 + h % 5, salford: 3 + h % 4 }
  const p = {
    shelf: true, sku: r.sku, title: r.title, brand: r.brand, kind: 'other', catalogType: kind === 'other' ? null : kind,
    price: r.price, unit_price: r.price, was: r.was, department, category: primary.label, family: leaf, categoryCode: r.codes[0], codes: [...new Set(codes)],
    catPath: r.catPath, path: `/${r.catPath}/${realSlug(r.title)}/p/${r.sku}`,
    rating: r.rating ?? +(4.2 + (h % 8) / 10).toFixed(1), reviews: r.rating == null ? 2 + h % 97 : 4 + h % 236,
    minAge, maxAge, platform, preorder, rank: i, keywords: `${PLATFORM_LABEL[platform] || ''} ${platform || ''} ${preorder ? 'pre-order preorder' : ''}`.trim(),
    stock: 10, purchaseLimit: 10, deliveryStock, collectionStock, options: [], variants: [], bulky, artShape: artShape(r, kind),
  }
  p.features = features(p)
  p.description = description(p)
  p.dimensions = p.category
  p.assembly = ASSEMBLY.test(r.codes.join(' ')) ? 'Yes' : 'No'
  return p
})
export const shelfBySku = new Map(shelfProducts.map(p => [p.sku, p]))
export const isShelfSku = sku => shelfBySku.has(String(sku))

// Category membership: a product belongs to each of its aisle codes and to all of their ancestors.
const ancestorsOf = code => { const out = []; for (let c = categoryByCode(code); c; c = c.parent) out.push(c.code); return out }
for (const p of shelfProducts) p.memberOf = new Set(p.codes.flatMap(ancestorsOf))
const GIFT_AGES = { 'gift-finder-0-18-months': [0, 1.5], 'gift-finder-18-36-months': [1.5, 3], 'gift-finder-3-5-years': [3, 5], 'gift-finder-6-8-years': [6, 8], 'gift-finder-9-11-years': [9, 11], 'gift-finder-big-kids': [12, 99] }
export function shelfInCategory(p, c) {
  if (GIFT_AGES[c.code]) { const [lo, hi] = GIFT_AGES[c.code]; return p.minAge <= hi && p.maxAge >= lo && p.minAge < 18 }
  return p.memberOf.has(c.code)
}
export const categoryCount = code => { const c = CATEGORY_ROWS.find(x => x.code === code); return c ? shelfProducts.filter(p => shelfInCategory(p, c)).length : 0 }

// ------------------------------------------------------------------ pictures
// Locally rendered product illustrations (lib/product-asset-art.js), served from the store's own
// /medias/ path because the shared /product-assets index only covers evidence-backed rows.
export const MEDIA_ROOT = '/smyths-toys/uk/en-gb/medias'
export const MEDIA = (sku, view = 0) => `${MEDIA_ROOT}/${encodeURIComponent(sku)}/${view}.svg`
export const shelfViews = p => p.catalogType === 'console' || /bundle|set|kit|pack/i.test(p.title) ? 4 : 3
function descriptor(p) {
  const type = p.catalogType === 'game' ? 'game' : p.catalogType === 'console' ? 'console' : 'other'
  return {
    store: 'smyths-toys', id: p.sku, title: p.title, canonicalTitle: p.title, type, category: p.category, brand: p.brand,
    platform: p.platform, edition: type === 'game' ? 'standard' : null, format: type === 'game' ? (/switch/.test(p.platform || '') ? 'cartridge' : 'disc') : 'physical',
    specs: {}, assetKey: `smyths-shelf-${p.sku}`, sourceArt: {},
    raw: { title: p.title, brand: p.brand, type: /SM060107|SM060106|SM060102|SM06010210/.test(p.categoryCode) ? 'board games' : undefined, description: p.description, shape: p.artShape === 'ssd' ? 'ssd' : undefined, artShape: p.artShape, platform: p.platform },
  }
}
const cache = new Map()
export function shelfSvg(p, view) {
  const key = `${p.sku}:${view}`
  if (!cache.has(key)) cache.set(key, renderProductAsset(descriptor(p), view))
  return cache.get(key)
}
export function shelfImage(p, { className = '', view = 0, alt, loading = 'lazy' } = {}) {
  return `<img class="pa-product-image ${esc(className)}" data-product-asset src="${esc(MEDIA(p.sku, view))}" alt="${esc(alt || p.title)}" width="720" height="720" loading="${loading}" decoding="async">`
}
export function shelfGallery(p) {
  const labels = ['Product view', 'Alternate view', 'Close-up', 'Additional view'], count = shelfViews(p)
  const img = (i, extra = {}) => shelfImage(p, { view: i, ...extra })
  return `<section class="pa-gallery st-shelf-gallery" data-product-gallery data-product-store="smyths-toys" data-product-id="${esc(p.sku)}" aria-label="Product images"><div class="pa-gallery-stage"><button type="button" class="pa-gallery-enlarge" data-pa-enlarge aria-label="Enlarge product image">${img(0, { loading: 'eager', className: 'pa-gallery-main', alt: `${p.title} — ${labels[0]}` })}<span aria-hidden="true">⌕</span></button></div><div class="pa-gallery-controls"><button type="button" data-pa-step="-1" aria-label="Previous image">‹</button><p class="pa-gallery-caption" data-pa-caption aria-live="polite">${labels[0]} · 1 / ${count}</p><button type="button" data-pa-step="1" aria-label="Next image">›</button></div><div class="pa-gallery-thumbnails" aria-label="Choose an image">${Array.from({ length: count }, (_, i) => `<button type="button" data-pa-select="${i}" data-pa-src="${esc(MEDIA(p.sku, i))}" data-pa-label="${labels[i]}" data-pa-alt="${esc(`${p.title} — ${labels[i]}`)}" aria-label="${labels[i]}" aria-pressed="${i === 0}">${img(i, { alt: labels[i] })}</button>`).join('')}</div><dialog class="pa-gallery-dialog" aria-label="${esc(p.title)}"><button type="button" class="pa-gallery-close" data-pa-close aria-label="Close image">×</button><img data-pa-expanded src="${esc(MEDIA(p.sku, 0))}" alt="${esc(`${p.title} — ${labels[0]}`)}" width="720" height="720"><div class="pa-gallery-controls"><button type="button" data-pa-step="-1" aria-label="Previous image">‹</button><p data-pa-caption>${labels[0]} · 1 / ${count}</p><button type="button" data-pa-step="1" aria-label="Next image">›</button></div></dialog></section>`
}
