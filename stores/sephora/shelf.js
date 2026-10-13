// Reference-mode Sephora assortment: product records built from shelf-data.js, plus the
// category, collection, brand and search queries the storefront uses. Kept apart from the
// captured search observations so catalog evidence and inventory reports stay unchanged.
import { SHELF_ROWS } from './shelf-data.js'
import { CATEGORIES } from './site-data.js'
import { capturedSearchProducts } from './search-reference.js'

export const brandSlug = name => name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const slugify = text => brandSlug(text.replace(/[#'’]/g, '')).split('-').slice(0, 9).join('-')
const hash = text => { let h = 2166136261; for (const c of text) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619) } return h >>> 0 }
const round = n => Math.round(n * 100) / 100

const LUXURY = new Set(['La Mer', 'Dior', 'CHANEL', 'Charlotte Tilbury', 'Armani Beauty', 'Yves Saint Laurent', 'YSL Beauty', 'Tatcha', 'Hourglass', 'Gucci', 'Prada', 'Valentino', 'Lancôme', 'Sulwhasoo', 'Maison Margiela', 'Burberry', 'Estée Lauder', 'Shiseido', 'Natasha Denona'])
const MEN = /fragrances-for-men/
const capturedIds = new Set(capturedSearchProducts.map(p => p.id))
const usedIds = new Set()
let skuSeed = 2600000

export const shortReviews = n => n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, '')}K` : String(n)
export const money = n => `$${Number(n).toFixed(2)}`

export const products = SHELF_ROWS.map(([brand, name, sub, price, size, rating, reviews, art, color, extra = {}]) => {
  const flags = new Set((extra.f || '').split(/\s+/).filter(Boolean))
  let num = 400000 + hash(`${brand}|${name}`) % 130000
  while (usedIds.has(num) || capturedIds.has(`P${num}`)) num++
  usedIds.add(num)
  const id = `P${num}`
  skuSeed += 7 + hash(name) % 40
  const base = skuSeed
  const shades = extra.s ? extra.s.split('|').map(part => { const [label, hex] = part.split(':'); const [shadeName, ...desc] = label.split(' - '); return { name: shadeName.trim(), desc: desc.join(' - ').trim(), hex } }) : []
  const variants = shades.length
    ? shades.map((shade, i) => ({ sku: String(base + i), label: shade.name, desc: shade.desc, hex: shade.hex, size, price }))
    : extra.z ? extra.z.map(([label, p], i) => ({ sku: String(base + i), label, size: label, price: p, hex: null }))
      : [{ sku: String(base), label: size, size, price, hex: null }]
  skuSeed += variants.length
  const prices = variants.map(v => v.price)
  const min = Math.min(...prices), max = Math.max(...prices)
  const sizesMini = variants.some(v => /mini|travel|rollerball/i.test(v.size || ''))
  if (sizesMini) flags.add('mini')
  if (extra.z?.some(([label]) => /jumbo/i.test(label))) flags.add('jumbo')
  const cat = CATEGORIES[sub]
  const dept = cat?.top ? sub : cat?.parent || 'makeup-cosmetics'
  const slug = slugify(name)
  return Object.freeze({
    id, brand, name, title: name, sub, dept, size, rating, reviews, art, color, flags, variants,
    shades: shades.length > 0, sizes: Boolean(extra.z), price: min, maxPrice: max,
    was: extra.was || null, keywords: extra.k || '', luxury: LUXURY.has(brand),
    slug, path: `/product/${slug}-${id}`, kind: 'other',
    priceDisplay: min === max ? money(min) : `${money(min)} - ${money(max)}`,
    reviewDisplay: shortReviews(reviews), ratingPercent: round(rating / 5 * 100),
    badge: flags.has('new') ? 'NEW' : flags.has('limited') ? 'LIMITED EDITION' : flags.has('excl') ? 'ONLY AT SEPHORA' : flags.has('sale') ? 'SALE' : '',
    image: `/productimages/sku/s${variants[0].sku}-main-zoom.svg`,
    alt: `${brand} - ${name}`,
  })
})

export const productById = new Map(products.map(p => [p.id, p]))
export const skuIndex = new Map(products.flatMap(p => p.variants.map(v => [v.sku, { product: p, variant: v }])))
export const findByPathId = param => {
  const match = /-(P\d+)$/.exec(String(param || ''))
  return match ? productById.get(match[1]) || null : null
}
export const variantImage = sku => `/productimages/sku/s${sku}-main-zoom.svg`
export const shelfBrands = [...new Set(products.map(p => p.brand))].sort((a, b) => a.localeCompare(b))

// Which listing pages a product appears on. Mirrors sephora.com's overlapping category tree:
// virtual categories (mini, vegan, value sets, gifts) are derived from product attributes.
const SETS = { 'makeup-cosmetics': 'makeup-kits-makeup-sets', skincare: 'skin-care-sets-travel-value', 'hair-products': 'hair-care-sets', fragrance: 'fragrance-value-sets-gifts', 'bath-body': 'bath-gift-sets' }
const MINIS = { 'makeup-cosmetics': 'mini-makeup', skincare: 'mini-skincare', 'hair-products': 'mini-hair-products', fragrance: 'mini-perfume', 'bath-body': 'mini-bath-products' }
const VEGAN = { 'makeup-cosmetics': 'vegan-makeup', skincare: 'vegan-skin-care', 'hair-products': 'vegan-hair-care', fragrance: 'vegan-fragrance' }
const PARENT_OF = { 'foundation-makeup': 'face-makeup', mascara: 'eye-makeup', 'face-serum': 'facial-treatments', 'makeup-brushes': 'makeup-tools', 'hair-brushes': 'makeup-tools', 'hair-styling-tools': 'makeup-tools', 'skin-care-tools': 'makeup-tools', 'hair-clips-hair-bands': 'makeup-tools' }
const TOOL_SUBS = new Set(['makeup-brushes', 'hair-styling-tools', 'skin-care-tools', 'hair-brushes', 'hair-clips-hair-bands', 'makeup-tools'])
const isSet = p => p.flags.has('set')
export function inCategory(p, slug) {
  if (p.sub === slug || PARENT_OF[p.sub] === slug) return true
  switch (slug) {
    case 'makeup-tools': return TOOL_SUBS.has(p.sub)
    case 'travel-size-toiletries': return p.flags.has('mini')
    case 'gifts': return isSet(p) || p.dept === 'fragrance' || p.flags.has('limited')
    case 'value-sets': return isSet(p)
    case 'gifts-under-25': return p.price < 25
    case 'gifts-under-50': return p.price < 50
    case 'gifts-for-her': return isSet(p) || p.sub === 'fragrances-for-women'
    case 'gifts-for-men': case 'men': return MEN.test(p.sub) || (isSet(p) && /men/i.test(p.keywords))
    case 'luxury-beauty': return p.luxury
    case 'luxury-skincare': return p.luxury && p.dept === 'skincare'
    case 'clean-makeup': return p.flags.has('clean') && p.dept === 'makeup-cosmetics'
    case 'clean-skin-care': return p.flags.has('clean') && p.dept === 'skincare'
    case 'face-wash-facial-cleanser': return p.sub === 'cleanser'
    case 'fsa-eligible-products': return /sunscreen|sun-lotion/.test(p.sub)
    case 'best-hair-products-by-hair-type': return p.dept === 'hair-products' && !TOOL_SUBS.has(p.sub)
    case 'fragrance-families-notes': return p.dept === 'fragrance' && p.sub !== 'home-fragrance'
    case 'body-care-by-concern': return p.dept === 'bath-body' && /body-care|body-moisturizers/.test(p.sub)
    case 'home-scents-candles': return p.sub === 'home-fragrance'
    case 'body-care': return p.dept === 'bath-body' && /body-/.test(p.sub)
    case 'sun-lotion': return p.sub === 'sun-lotion'
  }
  if (Object.values(SETS).includes(slug)) return isSet(p) && SETS[p.dept] === slug
  if (Object.values(MINIS).includes(slug)) return p.flags.has('mini') && MINIS[p.dept] === slug
  if (Object.values(VEGAN).includes(slug)) return p.flags.has('vegan') && VEGAN[p.dept] === slug
  if (CATEGORIES[slug]?.top) return p.dept === slug
  return false
}
export const categoryProducts = slug => products.filter(p => inCategory(p, slug))

export const COLLECTIONS = {
  'new-beauty-products': ['New Beauty Products', 'The latest launches across makeup, skincare, hair and fragrance.', p => p.flags.has('new')],
  'best-selling-beauty': ['Bestsellers', 'The most-loved products at Sephora right now.', p => p.reviews >= 5000],
  'beauty-under-20': ['Beauty Under $20', 'Affordable picks across makeup, skincare, hair and fragrance.', p => p.price < 20],
  'clean-beauty': ['Clean at Sephora', 'Products formulated without a list of ingredients Sephora restricts.', p => p.flags.has('clean')],
  'supersized-beauty-products': ['Jumbo Size', 'Value and jumbo sizes of beauty favorites.', p => p.flags.has('jumbo')],
}
export const saleProducts = () => products.filter(p => p.was)

// Search: every term must prefix-match a word in the product's brand, name, category or
// keywords. Brand and name hits rank above category and keyword hits.
const norm = text => text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9$%+]+/g, ' ').trim()
const stem = word => word.length > 3 && word.endsWith('s') && !word.endsWith('ss') ? word.slice(0, -1) : word
const words = text => norm(text).split(/\s+/).filter(Boolean).map(stem)
const deptTitle = p => CATEGORIES[p.dept]?.title || ''
const fields = products.map(p => ({ p,
  brand: words(p.brand), name: words(p.name),
  other: words(`${CATEGORIES[p.sub]?.title || ''} ${deptTitle(p)} ${p.keywords} ${p.variants.map(v => v.label).join(' ')} ${p.flags.has('vegan') ? 'vegan' : ''} ${p.flags.has('clean') ? 'clean' : ''} ${p.flags.has('mini') ? 'mini travel' : ''} ${p.flags.has('set') ? 'gift set value' : ''}`) }))
export function searchProducts(query) {
  const terms = words(String(query || ''))
  if (!terms.length) return []
  const hit = (list, t, exact, prefix) => list.includes(t) ? exact : t.length >= 3 && list.some(w => w.startsWith(t)) ? prefix : 0
  const out = []
  for (const f of fields) {
    let score = 0
    for (const t of terms) {
      const s = Math.max(hit(f.brand, t, 5, 3), hit(f.name, t, 4, 1.5), hit(f.other, t, 2, 1))
      if (!s) { score = -1; break }
      score += s
    }
    if (score > 0) out.push([score + Math.log10(f.p.reviews + 1) / 10, f.p])
  }
  return out.sort((a, b) => b[0] - a[0]).map(([, p]) => p)
}

// Category-page filtering, sorting and paging, with sephora.com-style query keys.
export const PRICE_RANGES = [['0-25', 'Under $25', 0, 25], ['25-50', '$25 to $50', 25, 50], ['50-100', '$50 to $100', 50, 100], ['100-', '$100 and above', 100, Infinity]]
export const SORTS = [['', 'Relevance'], ['BEST_SELLING', 'Bestselling'], ['RATING', 'Top Rated'], ['EXCLUSIVE', 'Exclusive'], ['NEW', 'New'], ['PRICE_LOW_TO_HIGH', 'Price Low to High'], ['PRICE_HIGH_TO_LOW', 'Price High to Low']]
export const PAGE_SIZE = 60
const str = v => typeof v === 'string' ? v : ''
export function refine(list, query) {
  const brands = str(query.brand).split(',').filter(Boolean)
  const range = PRICE_RANGES.find(r => r[0] === str(query.price))
  const rating = Number(str(query.rating)) || 0
  const pref = str(query.pref)
  let out = list.filter(p => (!brands.length || brands.includes(brandSlug(p.brand))) && (!range || (p.price >= range[2] && p.price < range[3])) && p.rating >= rating
    && (!pref || (pref === 'new' ? p.flags.has('new') : pref === 'sale' ? Boolean(p.was) : pref === 'exclusive' ? p.flags.has('excl') : p.flags.has(pref))))
  const sort = str(query.sortBy)
  if (sort === 'BEST_SELLING') out = out.toSorted((a, b) => b.reviews - a.reviews)
  if (sort === 'RATING') out = out.toSorted((a, b) => b.rating - a.rating || b.reviews - a.reviews)
  if (sort === 'EXCLUSIVE') out = out.toSorted((a, b) => Number(b.flags.has('excl')) - Number(a.flags.has('excl')))
  if (sort === 'NEW') out = out.toSorted((a, b) => Number(b.flags.has('new')) - Number(a.flags.has('new')))
  if (sort === 'PRICE_LOW_TO_HIGH') out = out.toSorted((a, b) => a.price - b.price)
  if (sort === 'PRICE_HIGH_TO_LOW') out = out.toSorted((a, b) => b.price - a.price)
  const pages = Math.max(1, Math.ceil(out.length / PAGE_SIZE))
  const page = Math.min(pages, Math.max(1, Number.parseInt(str(query.currentPage), 10) || 1))
  return { all: out, items: out.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), page, pages, total: out.length }
}
