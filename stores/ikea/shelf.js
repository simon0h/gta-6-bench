// IKEA shelf: the home-furnishing assortment shown in the default reference catalog.
// Kept apart from the reference observations (reference.js keeps an empty, evidence-only
// GTA 6 catalog: IKEA does not sell GTA 6). Shelf items are never catalog observations
// and are ordered only as `kind: 'other'` lines.
import { createHash } from 'node:crypto'
import { renderProductAsset, classifyProductAsset } from '../../lib/product-asset-art.js'
import { categoryIndex, departments } from './site-data.js'
import { SHELF_SOURCE } from './shelf-data.js'

const fold = v => String(v ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const slugify = v => fold(v).replace(/["']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const digits = (seed, n) => String(BigInt('0x' + createHash('sha256').update(seed).digest('hex').slice(0, 15)) % (10n ** BigInt(n))).padStart(n, '0')
const COLORS = ['white', 'black', 'gray', 'beige', 'brown', 'green', 'blue', 'red', 'yellow', 'pink', 'orange', 'natural', 'birch', 'oak', 'pine', 'walnut', 'bamboo', 'stainless steel', 'clear', 'multicolor']
const COLOR_HEX = { white: '#ecebe6', black: '#2b2b2b', gray: '#8b8f92', beige: '#d6c7aa', brown: '#7a5a43', green: '#6f8b6b', blue: '#41658f', red: '#a8463e', yellow: '#d7b54a', pink: '#d8a6b2', orange: '#d17b3f', natural: '#c9ab7f', birch: '#d9c29b', oak: '#b99568', pine: '#cfae7a', walnut: '#6f4e37', bamboo: '#c6ac72', 'stainless steel': '#a9b3b9', clear: '#c9dde3', multicolor: '#8f7fae' }
export const colorOf = text => {
  const t = fold(text)
  if (/black-brown|anthracite|dark gray|dark grey/.test(t)) return /black-brown/.test(t) ? 'brown' : 'gray'
  if (/off-white|white stain/.test(t)) return 'white'
  if (/mixed colors|multicolor|patterned/.test(t)) return 'multicolor'
  return COLORS.find(c => new RegExp(`\\b${c}\\b`).test(t)) || null
}

function parse() {
  const rows = []
  let cat = null, shape = 'object'
  for (const raw of SHELF_SOURCE.split('\n')) {
    const line = raw.trim()
    if (!line) continue
    if (line.startsWith('# ')) { cat = line.slice(2).trim(); continue }
    if (line.startsWith('@ ')) { shape = line.slice(2).trim(); continue }
    const [name, type, variant, price, rating, reviews, deal = '', art = ''] = line.split('|')
    rows.push({ cat, shape, name, type, variant, price: Number(price), rating: Number(rating), reviews: Number(reviews), deal, art })
  }
  return rows
}

// The departments (top-level menu entries) whose category list includes a slug.
const deptsFor = slug => departments.filter(d => d.slug === slug || d.subs.some(s => s.slug === slug)).map(d => d.slug)

function build(r, index) {
  const category = categoryIndex.get(r.cat)
  if (!category) throw new Error(`Unknown IKEA shelf category ${r.cat}`)
  const seed = `ikea-shelf:${r.name}:${r.type}:${r.variant}`
  const id = r.art ? r.art.replace(/\D/g, '') : digits(seed, 8).replace(/^0/, '3')
  const artNo = `${id.slice(0, 3)}.${id.slice(3, 6)}.${id.slice(6)}`
  const colorText = r.variant.split(',')[0]
  const urlVariant = /\d/.test(colorText) ? '' : colorText
  const deals = Object.fromEntries(r.deal.split(',').filter(Boolean).map(d => [d[0], d.slice(1)]))
  const prevPrice = deals.L ? Number(deals.L) : 0
  const familyPrice = deals.F ? Number(deals.F) : 0
  const h = Number(digits(seed + ':h', 6))
  const color = colorOf(r.variant) || colorOf(r.name + ' ' + r.type)
  return Object.freeze({
    id, sku: id, artNo, kind: 'other', brand: 'IKEA',
    name: r.name, type: r.type, variant: r.variant, title: `${r.name} ${r.type}, ${r.variant}`,
    price: r.price, prevPrice, familyPrice, isNew: 'N' in deals,
    rating: r.rating, reviews: r.reviews, shape: r.shape, color,
    cat: category.slug, catTitle: category.title, dept: category.parent?.slug || category.slug, depts: deptsFor(category.slug),
    order: index, popularity: Math.round(r.reviews * (0.7 + (h % 60) / 100)), newness: ('N' in deals ? 1000 : 0) + h % 997,
    path: `/us/en/p/${slugify([r.name, r.type, urlVariant].join(' '))}-${id}/`,
  })
}

export const shelf = Object.freeze(parse().map(build))
const byId = new Map(shelf.map(p => [p.id, p]))
if (byId.size !== shelf.length) throw new Error('Duplicate IKEA shelf article numbers')
export const shelfById = id => byId.get(String(id))
export const shelfBySku = sku => byId.get(String(sku))
export const isShelfSku = sku => typeof sku === 'string' && byId.has(sku)
export const inCategory = slug => shelf.filter(p => p.cat === slug || p.depts.includes(slug))
export const deals = () => shelf.filter(p => p.prevPrice || p.familyPrice)
export const newArrivals = () => shelf.filter(p => p.isNew)

// Search. Every query word must match the start of a word in the product's name, type,
// variant or category (diacritics folded, simple plurals and common synonyms).
const SYNONYMS = { couch: 'sofa', couches: 'sofa', bookshelf: 'bookcase', bookshelves: 'bookcase', shelf: 'shelf shelving shelves', shelves: 'shelf shelving', dresser: 'dresser chest drawer', dressers: 'dresser chest', drawers: 'drawer dresser chest', closet: 'wardrobe', armoire: 'wardrobe', tv: 'tv media', lamp: 'lamp light', lamps: 'lamp light', light: 'lamp light', lights: 'light lamp', mattress: 'mattress', bed: 'bed', crib: 'crib', table: 'table', tables: 'table', chair: 'chair', chairs: 'chair', rug: 'rug', rugs: 'rug', carpet: 'rug', pillow: 'pillow cushion', pillows: 'pillow cushion', towel: 'towel', towels: 'towel', shark: 'blahaj shark', plush: 'soft toy', stuffed: 'soft toy', toy: 'toy', kitchen: 'kitchen', cart: 'cart', desk: 'desk', storage: 'storage box drawer shelving', box: 'box', boxes: 'box', bin: 'bin box', basket: 'basket', baskets: 'basket', blanket: 'throw blanket', plant: 'plant', plants: 'plant', pot: 'pot', pan: 'pan', dish: 'dish plate bowl dinnerware', dishes: 'plate bowl dinnerware', meatballs: 'meatballs', meatball: 'meatballs', office: 'office desk', gaming: 'gaming', speaker: 'speaker', smart: 'smart', curtain: 'curtain', curtains: 'curtain', blind: 'blind', blinds: 'blind', mirror: 'mirror', mirrors: 'mirror', frame: 'frame', frames: 'frame', candle: 'candle', candles: 'candle', vase: 'vase', mug: 'mug', glass: 'glass', knife: 'knife', cookware: 'cookware pan pot saucepan', sheets: 'sheet', bedding: 'duvet sheet comforter pillow' }
const words = p => fold([p.name, p.type, p.variant, p.catTitle, ...p.depts.map(d => categoryIndex.get(d)?.title)].join(' ')).split(/[^a-z0-9+]+/).filter(Boolean)
const INDEX = new Map(shelf.map(p => [p.id, { all: words(p), name: fold(p.name).split(/[^a-z0-9+]+/).filter(Boolean), type: fold(p.type).split(/[^a-z0-9+]+/).filter(Boolean) }]))
const stem = t => t.length > 3 && t.endsWith('es') && !t.endsWith('ses') ? t.slice(0, -2) : t.length > 3 && t.endsWith('s') && !t.endsWith('ss') ? t.slice(0, -1) : t
const PHRASES = [[/\btv stands?\b/g, 'tv unit'], [/\bnight ?stands?\b/g, 'nightstand'], [/\bbook ?shel(f|ves)\b/g, 'bookcase'], [/\bsofa beds?\b/g, 'sleeper sofa'], [/\bend tables?\b/g, 'side table']]
export const queryTokens = q => PHRASES.reduce((s, [re, to]) => s.replace(re, to), fold(q)).split(/[^a-z0-9+]+/).filter(t => t && !['and', 'for', 'the', 'with', 'of', 'a', 'in', 'ikea'].includes(t))
function tokenScore(entry, token) {
  const forms = [...new Set([token, stem(token), ...(SYNONYMS[token] || '').split(' ').filter(Boolean)])]
  const hit = list => forms.some(f => list.some(w => w === f || (f.length >= 3 && w.startsWith(f))))
  if (hit(entry.name)) return 5
  if (hit(entry.type)) return 4
  if (hit(entry.all)) return 1
  return 0
}
export function searchShelf(q) {
  const tokens = queryTokens(q)
  if (!tokens.length) return []
  const scored = shelf.map(p => { const e = INDEX.get(p.id), s = tokens.map(t => tokenScore(e, t)); return { p, all: s.every(Boolean), score: s.reduce((a, b) => a + b, 0) } })
  let hits = scored.filter(x => x.all)
  // No product matches every word: fall back to strong name/type matches on the longer words.
  if (!hits.length && tokens.length > 1) {
    const long = tokens.filter(t => t.length >= 3)
    hits = shelf.map(p => { const e = INDEX.get(p.id), s = long.map(t => tokenScore(e, t)); return { p, score: s.reduce((a, b) => a + b, 0), n: s.filter(x => x >= 4).length } })
      .filter(x => x.n && x.n * 2 >= tokens.length)
  }
  return hits.sort((a, b) => b.score - a.score || b.p.popularity - a.p.popularity).map(x => x.p)
}

// Sort and filter, using the real site's query values (?sort=PRICE_LOW_TO_HIGH ...).
export const SORTS = [['RELEVANCE', 'Best match'], ['PRICE_LOW_TO_HIGH', 'Price: low to high'], ['PRICE_HIGH_TO_LOW', 'Price: high to low'], ['NEWEST', 'Newest'], ['RATING', 'Customer rating'], ['NAME_ASCENDING', 'Name']]
export const PRICE_BANDS = [['0-50', '$0 - $49.99', 0, 50], ['50-100', '$50 - $99.99', 50, 100], ['100-200', '$100 - $199.99', 100, 200], ['200-500', '$200 - $499.99', 200, 500], ['500-', '$500+', 500, Infinity]]
export const RATINGS = [['4.5', '4.5 stars & up'], ['4', '4 stars & up'], ['3', '3 stars & up']]
export const many = v => (Array.isArray(v) ? v : [v]).filter(x => typeof x === 'string' && x)
export function filterShelf(items, query = {}) {
  const colors = many(query.color), cats = many(query.category), bands = PRICE_BANDS.filter(([v]) => many(query.price).includes(v))
  const rating = Number(query.rating) || 0
  return items.filter(p => (!colors.length || colors.includes(p.color))
    && (!cats.length || cats.includes(p.cat))
    && (!bands.length || bands.some(([, , lo, hi]) => p.price >= lo && p.price < hi))
    && p.rating >= rating
    && (query.offers !== 'true' || p.prevPrice || p.familyPrice)
    && (query.new !== 'true' || p.isNew))
}
const SORTERS = {
  RELEVANCE: (a, b) => b.popularity - a.popularity,
  PRICE_LOW_TO_HIGH: (a, b) => a.price - b.price || a.order - b.order,
  PRICE_HIGH_TO_LOW: (a, b) => b.price - a.price || a.order - b.order,
  NEWEST: (a, b) => b.newness - a.newness,
  RATING: (a, b) => b.rating - a.rating || b.reviews - a.reviews,
  NAME_ASCENDING: (a, b) => a.name.localeCompare(b.name, 'sv') || a.price - b.price,
}
export function sortShelf(items, sort, keepOrder = false) {
  if (keepOrder && (!sort || sort === 'RELEVANCE')) return items
  return [...items].sort(SORTERS[sort] || SORTERS.RELEVANCE)
}

// Product artwork via the shared renderer, in IKEA's muted palette.
export const SHELF_VIEWS = 3
const cache = new Map()
export function shelfArt(p, view = 0) {
  const key = `${p.id}:${view}`
  if (cache.has(key)) return cache.get(key)
  const base = COLOR_HEX[p.color] || '#c9b89a'
  const accent = p.color === 'white' ? '#cdbfa5' : p.color === 'black' ? '#5a5650' : base
  // "TV unit" is furniture: keep the renderer from drawing a television.
  const make = title => ({ store: 'ikea', title, brand: 'IKEA', assetKey: `ikea-shelf-${p.id}`, specs: {},
    raw: { title, brand: 'IKEA', shape: p.shape, colorName: base, accent, description: title } })
  let descriptor = make(`${p.name} ${p.type}`.replace(/\bTV\b/g, 'media'))
  // A few product types read as something else to the shared renderer (a food container
  // is not food, a tool kit is not a toy): draw those from the category's form instead.
  const kind = classifyProductAsset(descriptor)
  if (kind !== p.shape && ['food', 'beauty', 'toy', 'object'].includes(kind)) descriptor = make(p.name)
  let svg
  try { svg = renderProductAsset(descriptor, view) } catch { svg = null }
  if (!svg && view === 0) svg = renderProductAsset(make(p.name), 0)
  if (!svg) return null
  if (cache.size > 900) cache.delete(cache.keys().next().value)
  cache.set(key, svg)
  return svg
}

// Views the renderer can draw for an item (some forms have fewer meaningful angles).
const viewCache = new Map()
export function shelfViews(p) {
  if (!viewCache.has(p.id)) viewCache.set(p.id, Array.from({ length: SHELF_VIEWS }, (_, i) => i).filter(i => shelfArt(p, i)))
  return viewCache.get(p.id)
}
