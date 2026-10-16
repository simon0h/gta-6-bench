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

// Lighting items the shared lamp drawing does not fit (bulbs, remotes, string lights,
// pendants and star shades) are drawn here: view 0 is the whole product, view 1 a close-up.
const LIGHT_FORMS = [
  ['remote', /\bremote control\b/i], ['string', /\bstring light\b/i], ['bulb', /\bLED bulb\b/i],
  ['star', /\blamp shade\b/i, /\bstar\b/i], ['pendant', /\bpendant lamp\b/i], ['floor', /^floor lamp/i],
]
const lightForm = p => p.shape === 'lamp' || /lamp shade/i.test(p.type)
  ? LIGHT_FORMS.find(([, type, variant]) => type.test(p.type) && (!variant || variant.test(p.variant)))?.[0] : null
const svgEsc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')
function lightArt(p, form, view) {
  if (view > 1) return null
  const ink = '#26313c', glass = '#f6f3ea', metal = '#a9b3b9'
  const shade = COLOR_HEX[p.color] && !['clear', 'multicolor'].includes(p.color) ? COLOR_HEX[p.color] : glass
  const bulb = (x, y, s, candle) => {
    const g = candle
      ? `<path d="M${x} ${y - 92 * s}C${x + 22 * s} ${y - 60 * s} ${x + 26 * s} ${y - 28 * s} ${x + 18 * s} ${y}H${x - 18 * s}C${x - 26 * s} ${y - 28 * s} ${x - 22 * s} ${y - 60 * s} ${x} ${y - 92 * s}Z" fill="${glass}" stroke="${ink}" stroke-width="3"/>`
      : `<path d="M${x - 24 * s} ${y}C${x - 24 * s} ${y - 22 * s} ${x - 62 * s} ${y - 44 * s} ${x - 62 * s} ${y - 86 * s}A${62 * s} ${62 * s} 0 1 1 ${x + 62 * s} ${y - 86 * s}C${x + 62 * s} ${y - 44 * s} ${x + 24 * s} ${y - 22 * s} ${x + 24 * s} ${y}Z" fill="${glass}" stroke="${ink}" stroke-width="3"/>`
    const w = (candle ? 18 : 24) * s
    const threads = [0, 1, 2, 3].map(i => `<path d="M${x - w} ${y + 8 * s + i * 11 * s}h${2 * w}" stroke="${ink}" stroke-opacity=".35" stroke-width="2"/>`).join('')
    return `${g}<rect x="${x - w}" y="${y}" width="${2 * w}" height="${50 * s}" rx="${4 * s}" fill="${metal}" stroke="${ink}" stroke-width="3"/>${threads}<path d="M${x - w * .6} ${y + 50 * s}h${w * 1.2}l-${w * .3} ${12 * s}h-${w * .6}Z" fill="${ink}"/>`
  }
  const star = (cx, cy, r, fill, sw = 3) => `<path d="${Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; return `${i ? 'L' : 'M'}${(cx + rr * Math.cos(a)).toFixed(1)} ${(cy + rr * Math.sin(a)).toFixed(1)}` }).join('')}Z" fill="${fill}" stroke="${ink}" stroke-width="${sw}" stroke-linejoin="round"/>`
  let body
  if (form === 'bulb') {
    const pack = Number(/(\d+) pack/.exec(p.variant)?.[1] || 1), candle = /chandelier|E12/i.test(`${p.type} ${p.variant}`)
    const n = Math.min(pack, 4), s = n > 1 ? .78 : 1.15, gap = 150 * s
    body = Array.from({ length: n }, (_, i) => bulb(320 + (i - (n - 1) / 2) * gap, n > 1 ? 380 : 360, s, candle)).join('')
    if (/color/i.test(p.variant)) body += `<circle cx="320" cy="${n > 1 ? 300 : 262}" r="22" fill="#e9b949" opacity=".35"/>`
  } else if (form === 'remote') {
    body = `<rect x="262" y="138" width="116" height="320" rx="26" fill="${glass}" stroke="${ink}" stroke-width="3"/><circle cx="320" cy="214" r="34" fill="#fff" stroke="${ink}" stroke-opacity=".5" stroke-width="2"/><path d="M308 214h24M320 202v24" stroke="${ink}" stroke-width="3" stroke-linecap="round"/><path d="M314 290l6-8 6 8M314 370l6 8 6-8" fill="none" stroke="${ink}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M282 330l-8 0M366 330l-8 0" stroke="${ink}" stroke-width="3" stroke-linecap="round"/><path d="M278 252h84M278 410h84" stroke="${ink}" stroke-opacity=".25" stroke-width="2"/>`
  } else if (form === 'string') {
    const stars = /star/i.test(p.variant), wire = 'M70 250C150 340 230 340 320 260S490 180 570 270'
    const pts = Array.from({ length: 9 }, (_, i) => { const t = i / 8, x = 70 + 500 * t, y = 250 + Math.sin(t * Math.PI * 2) * -55 + Math.sin(t * Math.PI) * 28; return [x, y] })
    body = `<path d="${wire}" fill="none" stroke="${metal}" stroke-width="4"/>${pts.map(([x, y]) => stars ? star(x, y + 26, 24, '#fff6d8', 2.5) : `<circle cx="${x.toFixed(1)}" cy="${(y + 18).toFixed(1)}" r="11" fill="#fff6d8" stroke="${ink}" stroke-width="2.5"/>`).join('')}<rect x="250" y="390" width="140" height="74" rx="12" fill="${metal}" stroke="${ink}" stroke-width="3"/><circle cx="364" cy="427" r="9" fill="${ink}"/><path d="M250 427C200 427 170 360 150 330" fill="none" stroke="${metal}" stroke-width="4"/>`
  } else if (form === 'star') {
    body = `<path d="M320 40V120" stroke="${ink}" stroke-width="3"/>${star(320, 270, 170, shade === glass ? '#fbfaf5' : shade)}<circle cx="320" cy="270" r="40" fill="#fff6d8" opacity=".6"/>`
  } else if (form === 'floor') {
    const base = `<ellipse cx="320" cy="482" rx="70" ry="13" fill="${shade === glass ? metal : shade}" stroke="${ink}" stroke-width="3"/>`
    if (/arched/i.test(p.type)) body = `${base}<path d="M320 478V170C320 100 420 70 470 140" fill="none" stroke="${metal}" stroke-width="9" stroke-linecap="round"/><path d="M455 140h30l-6 16h-18Z" fill="${metal}" stroke="${ink}" stroke-width="3"/>`
    else if (/3-spot/i.test(p.type)) body = `${base}<path d="M320 478V140" stroke="${metal}" stroke-width="9" stroke-linecap="round"/>${[[250, 150], [380, 210], [270, 270]].map(([x, y]) => `<path d="M320 ${y}L${x} ${y - 6}" stroke="${metal}" stroke-width="5"/><path d="M${x - 22} ${y - 18}h44l-8 34h-28Z" fill="${shade}" stroke="${ink}" stroke-width="3" transform="rotate(${x < 320 ? -20 : 20} ${x} ${y})"/>`).join('')}`
    else if (/paper|^white$/i.test(p.variant) && p.name === 'HOLMÖ') body = `<ellipse cx="320" cy="480" rx="62" ry="12" fill="#ecebe6" stroke="${ink}" stroke-width="3"/><path d="M272 120h96v360h-96Z" fill="${glass}" stroke="${ink}" stroke-width="3"/>${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<path d="M272 ${165 + i * 40}h96" stroke="${ink}" stroke-opacity=".12" stroke-width="2"/>`).join('')}`
    else body = `${base}<path d="M320 478V170" stroke="${p.color === 'white' || /ash/i.test(p.variant) ? '#c7a77a' : metal}" stroke-width="9" stroke-linecap="round"/><path d="M262 92h116l26 92H236Z" fill="${shade}" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/>`
  } else {
    const globe = /globe/i.test(p.variant)
    body = globe
      ? `<path d="M320 40V150" stroke="${ink}" stroke-width="3"/><rect x="300" y="150" width="40" height="34" rx="6" fill="${metal}" stroke="${ink}" stroke-width="3"/><circle cx="320" cy="290" r="110" fill="${glass}" stroke="${ink}" stroke-width="3"/><path d="M226 250h188M214 300h212M236 350h168" stroke="${ink}" stroke-opacity=".2" stroke-width="2"/>`
      : `<path d="M320 40V170" stroke="${ink}" stroke-width="3"/><path d="M296 170h48l14 34H282Z" fill="${metal}" stroke="${ink}" stroke-width="3"/><path d="M150 380C150 270 230 204 320 204S490 270 490 380Z" fill="${shade}" stroke="${ink}" stroke-width="3"/>${[0, 1, 2, 3, 4].map(i => `<path d="M${200 + i * 60} 378C${210 + i * 55} 300 ${260 + i * 30} 240 320 206" fill="none" stroke="${ink}" stroke-opacity=".22" stroke-width="2"/>`).join('')}<ellipse cx="320" cy="380" rx="170" ry="20" fill="#fff6d8" stroke="${ink}" stroke-width="3"/>`
  }
  const label = svgEsc(`${p.name} ${p.type}`)
  const zoom = view === 1 ? ' transform="translate(320 300) scale(1.55) translate(-320 -300)"' : ''
  return `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="600" viewBox="0 0 640 600" role="img" aria-label="${label}" data-product-form="lamp" data-view="${view}"><title>${label}</title><rect width="640" height="600" fill="#f5f4f0"/><ellipse cx="320" cy="493" rx="214" ry="18" fill="#b9b7b0" opacity="0.19"/><g${zoom}>${body}</g></svg>`
}

// Bookcases and KALLAX cube units, drawn to their real proportions (the shared shelf
// drawing is a low cabinet): view 0 front, view 1 close-up.
const inches = s => s.trim().split(/\s+/).reduce((t, part) => t + (part.includes('/') ? Number(part.split('/')[0]) / Number(part.split('/')[1]) : Number(part)), 0)
const dims = variant => { const m = /(\d[\d /]*(?:x\d[\d /]*)+)"/.exec(variant); return m ? m[1].split('x').map(inches).filter(Number.isFinite) : [] }
const caseForm = p => {
  if (p.cat === 'dressers-storage-drawers-st004' && /^\d+-drawer (dresser|chest)$/i.test(p.type)) return 'drawers'
  if (p.cat !== 'bookcases-shelving-units-st002') return null
  if (/^bookcase/i.test(p.type)) return 'bookcase'
  if ((p.name === 'KALLAX' && /^shelf unit$/i.test(p.type)) || p.name === 'EKET') return 'cubes'
  if (/^wall shelf$/i.test(p.type)) return 'board'
  if (/shel(f|ving) unit$/i.test(p.type) && p.name !== 'VITTSJÖ') return 'open'
  return null
}
function caseArt(p, form, view) {
  if (view > 1) return null
  const d = dims(p.variant), wIn = d[0] || 31.5, hIn = d.length > 2 ? d[2] : d[1] || 79.5
  const ink = '#26313c', wood = COLOR_HEX[p.color] || '#ecebe6', inner = p.color === 'black' || p.color === 'brown' ? '#3d3530' : '#e2dfd6'
  const maxH = 390, maxW = 470, s = Math.min(maxH / hIn, maxW / wIn), W = wIn * s, H = hIn * s, x = 320 - W / 2, y = 478 - H, t = Math.max(7, 1.1 * s)
  let body = form === 'open' || form === 'board' ? '' : `<rect x="${x}" y="${y}" width="${W}" height="${H}" fill="${wood}" stroke="${ink}" stroke-width="3"/>`
  if (form === 'board') {
    const bw = 470, bh = 26, bx = 320 - bw / 2
    body = `<rect x="${bx}" y="250" width="${bw}" height="${bh}" fill="${wood}" stroke="${ink}" stroke-width="3"/><path d="M${bx} 276l18 30h${bw - 36}l18-30" fill="${inner}" fill-opacity=".5" stroke="${ink}" stroke-opacity=".4" stroke-width="2"/>`
  } else if (form === 'open') {
    const metal = /metal|galvanized|in\/outdoor/i.test(p.variant), post = metal ? '#a9b3b9' : wood, shelves = Math.max(3, Math.round(hIn / 16)), gap = (H - t) / (shelves - 1)
    body += [0, 1].map(i => `<rect x="${x + i * (W - t)}" y="${y}" width="${t}" height="${H}" fill="${post}" stroke="${ink}" stroke-width="2"/>`).join('')
    if (metal || p.color === 'black') body += [0, 1].map(i => `<path d="M${x + t / 2 + i * (W - t)} ${y}V${y + H}" stroke="${ink}" stroke-opacity=".3" stroke-width="1"/>`).join('') + `<path d="M${x + t} ${y + H * .15}L${x + W - t} ${y + H * .55}M${x + W - t} ${y + H * .15}L${x + t} ${y + H * .55}" stroke="${post}" stroke-width="3"/>`
    for (let i = 0; i < shelves; i++) body += `<rect x="${x - 2}" y="${y + i * gap}" width="${W + 4}" height="${t}" fill="${metal ? '#c3cbd0' : wood}" stroke="${ink}" stroke-width="2"/>`
  } else if (form === 'drawers') {
    const n = Number(/^(\d+)/.exec(p.type)[1]), cols = n >= 6 && n % 2 === 0 && wIn > hIn ? 2 : 1, rows = n / cols
    const top = y + t, legs = /HEMNES|KOPPANG|TARVA|HAUGA|SONGESAND|NORDLI/.test(p.name) ? t * 1.8 : 0, bottom = y + H - t - legs, dw = (W - 2 * t) / cols, dh = (bottom - top) / rows
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const dx = x + t + c * dw, dy = top + r * dh; body += `<rect x="${dx + 2}" y="${dy + 2}" width="${dw - 4}" height="${dh - 4}" fill="${wood}" stroke="${ink}" stroke-opacity=".55" stroke-width="2"/><rect x="${dx + dw / 2 - Math.min(26, dw / 6)}" y="${dy + dh / 2 - 3}" width="${Math.min(52, dw / 3)}" height="6" rx="3" fill="${inner}" stroke="${ink}" stroke-opacity=".5" stroke-width="1.5"/>` }
    if (legs) body += `<path d="M${x} ${bottom + t}h${W}" stroke="${ink}" stroke-width="2"/>`
  } else if (form === 'cubes') {
    const cols = Math.max(1, Math.round(wIn / 14.6)), rows = Math.max(1, Math.round(hIn / 14.6)), cw = (W - t) / cols, ch = (H - t) / rows
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) body += `<rect x="${x + t + c * cw}" y="${y + t + r * ch}" width="${cw - t}" height="${ch - t}" fill="${inner}" stroke="${ink}" stroke-opacity=".5" stroke-width="1.5"/>`
  } else {
    const ext = /height extension/i.test(p.type), glassDoors = /glass doors/i.test(p.type)
    const shelves = Math.max(3, Math.round(hIn / 13)), bottom = y + H - t * 2.2, top = y + t, gap = (bottom - top) / shelves
    body += `<rect x="${x + t}" y="${top}" width="${W - 2 * t}" height="${bottom - top}" fill="${inner}"/>`
    for (let i = 1; i < shelves; i++) body += `<rect x="${x + t}" y="${top + i * gap - t / 2}" width="${W - 2 * t}" height="${t}" fill="${wood}" stroke="${ink}" stroke-opacity=".45" stroke-width="1.5"/>`
    if (ext) body += `<path d="M${x} ${top + gap - t / 2}h${W}" stroke="${ink}" stroke-width="2"/>`
    if (glassDoors) body += [0, 1].map(i => `<rect x="${x + t / 2 + i * (W - t) / 2}" y="${y + t / 2}" width="${(W - t) / 2}" height="${H - t * 2.4}" fill="#c9dde3" fill-opacity=".45" stroke="${ink}" stroke-width="2.5"/><rect x="${x + t / 2 + i * (W - t) / 2 + 6}" y="${y + t / 2 + 6}" width="${(W - t) / 2 - 12}" height="${H - t * 2.4 - 12}" fill="none" stroke="${wood}" stroke-width="4"/>`).join('')
    body += `<rect x="${x + t}" y="${y + H - t * 2.2}" width="${W - 2 * t}" height="${t * 1.4}" fill="${wood}" stroke="${ink}" stroke-opacity=".45" stroke-width="1.5"/>`
  }
  const label = svgEsc(`${p.name} ${p.type}`)
  const zoom = view === 1 ? ` transform="translate(320 ${y + 40}) scale(1.7) translate(-320 ${-(y + 40)})"` : ''
  return `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="600" viewBox="0 0 640 600" role="img" aria-label="${label}" data-product-form="shelf" data-view="${view}"><title>${label}</title><rect width="640" height="600" fill="#f5f4f0"/><ellipse cx="320" cy="484" rx="${Math.min(260, W / 2 + 60)}" ry="16" fill="#b9b7b0" opacity="0.25"/><g${zoom}>${body}</g></svg>`
}

// Product artwork via the shared renderer, in IKEA's muted palette.
export const SHELF_VIEWS = 3
const cache = new Map()
export function shelfArt(p, view = 0) {
  const key = `${p.id}:${view}`
  if (cache.has(key)) return cache.get(key)
  const form = lightForm(p)
  if (form) { const svg = lightArt(p, form, view); cache.set(key, svg); return svg }
  const cases = caseForm(p)
  if (cases) { const svg = caseArt(p, cases, view); cache.set(key, svg); return svg }
  const base = COLOR_HEX[p.color] || '#c9b89a'
  const accent = p.color === 'white' ? '#cdbfa5' : p.color === 'black' ? '#5a5650' : base
  // "TV unit" is furniture: keep the renderer from drawing a television.
  const make = title => ({ store: 'ikea', title, brand: 'IKEA', assetKey: `ikea-shelf-${p.id}`, specs: {},
    raw: { title, brand: 'IKEA', shape: p.shape, colorName: base, accent, description: /work lamp/i.test(title) ? `${title}, adjustable arm` : title } })
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
