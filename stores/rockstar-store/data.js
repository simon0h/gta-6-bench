import { fixtureCatalog, applyCatalogPolicy } from '../../lib/catalog-policy.js'
import { CATALOG_EVIDENCE } from './catalog-evidence.js'
import { expandCatalog } from './catalog500.js'
// Listings and distractors as they appear on store.rockstargames.com (research/rockstar-store.md, 2026-09-29/30).
import { EXTRA_PRODUCTS, enrichCatalog } from './catalog.js'
import { PRICES } from '../../lib/catalog.js'
import { SHELF } from './shelf.js'

export const XSOLLA_PROJECT = '100851'
export const MAX_QTY = 4                 // "max quantity 4" per SKU
export const FREE_SHIPPING_OVER = 74.99  // cart: "Get FREE shipping with orders over $74.99"
// ASSUMPTION: the Xsolla payment step shows a single tax line but no rate was observed; a flat 7% (Miami-Dade, the tests' address) is used.
export const TAX_RATE = 0.07

const USD = PRICES.USD

// The six GTA VI listings from the research. Only the two code-in-box SKUs are sold by the Rockstar Store itself
// (Xsolla project 100851); the digital editions are "First Party Link Out SKUs" whose Pre-Order Now buttons open the
// platform store. Here they link to the sibling clones on the same host.
export const LISTINGS = [
  { sku: '357725-US', platform: 'ps5', edition: 'standard', format: 'code-in-box', price: USD.standard, title: 'Grand Theft Auto VI - PS5 (Code-in-Box)', art: '/static/art/ps5-standard.svg' },
  { sku: '357733-US', platform: 'xbox', edition: 'standard', format: 'code-in-box', price: USD.standard, title: 'Grand Theft Auto VI - Xbox Series X|S (Code-in-Box)', art: '/static/art/xbox-standard.svg' },
  { sku: '7Kw5cmiiWlfvDje2JFgAfo', platform: 'ps5', edition: 'standard', format: 'digital', price: USD.standard, title: 'Grand Theft Auto VI - Standard Edition (Digital, PS5)', linkOut: '/playstation-store/en-us/product/EP1004-PPSA01547_00-GTAVISTANDARD001', storeName: 'PlayStation Store' },
  { sku: '61VDNENfCyijvOimxjyCFe', platform: 'xbox', edition: 'standard', format: 'digital', price: USD.standard, title: 'Grand Theft Auto VI - Standard Edition (Digital, Xbox Series X|S)', linkOut: '/xbox-store/en-US/games/store/grand-theft-auto-vi/9p3h4968grsm', storeName: 'Microsoft Store' },
  { sku: '1k94fAGkvqcSNOS6PczG4Y', platform: 'ps5', edition: 'ultimate', format: 'digital', price: USD.ultimate, title: 'Grand Theft Auto VI - Ultimate Edition (Digital, PS5)', linkOut: '/playstation-store/en-us/product/EP1004-PPSA01547_00-GTAVIULTIMATE001', storeName: 'PlayStation Store' },
  { sku: '5RyqR1Lk56PH9OgVD3haBY', platform: 'xbox', edition: 'ultimate', format: 'digital', price: USD.ultimate, title: 'Grand Theft Auto VI - Ultimate Edition (Digital, Xbox Series X|S)', linkOut: '/xbox-store/en-US/games/store/grand-theft-auto-vi-ultimate-edition/9nnzsnhlr63l', storeName: 'Microsoft Store' },
]

export const PLATFORM_OPTIONS = [
  { id: 'ps5', drm: 'PlayStation', label: 'PS5', chip: 'PlayStation 5', storeName: 'PlayStation Store' },
  { id: 'xbox', drm: 'Xbox', label: 'Xbox Series X|S', chip: 'Xbox Series X', storeName: 'Microsoft Store' },
]

export const listing = (platform, edition, format) => LISTINGS.find(l => l.platform === platform && l.edition === edition && l.format === format) ?? null

// Product pages. The first entry is the game (its six listings live in LISTINGS); the rest are the distractors the
// real store shows around it. `sale`: 'direct' = sold here via Xsolla (Buy Now / Add to Cart), 'link-out' = opens the platform store.
// ASSUMPTION: merchandise SKUs and non-GTA-VI prices were not in the research; they follow the store's numeric "NNNNNN-US" pattern.
export const PRODUCTS = [
  {
    id: 'gta-vi', kind: 'game', section: 'Games', path: '/game/buy-gta-vi', title: 'Grand Theft Auto VI', badge: 'COMING SOON',
    price: USD.standard, art: '/static/art/ps5-standard.svg', chips: ['PlayStation 5', 'Xbox Series X'], adult: true,
    collections: ['games', 'gta', 'best-sellers'],
    keywords: 'gta 6 gta6 gtavi gta vi grand theft auto vi six rockstar games pre-order preorder coming soon leonida vice city jason lucia playstation 5 ps5 xbox series x console game',
  },
  {
    id: 'gta-v', kind: 'other', section: 'Games', path: '/game/buy-gta-v', title: 'Grand Theft Auto V', badge: null,
    price: 29.99, sku: '331120-US', art: '/rockstar-store/art/gta-v.svg', chips: ['PlayStation 5', 'Xbox Series X', 'PC'], sale: 'link-out',
    collections: ['games', 'gta', 'best-sellers'],
    blurb: 'Experience Rockstar Games’ critically acclaimed open world game, Grand Theft Auto V, plus GTA Online.',
    keywords: 'gta v gta5 gtav gta 5 grand theft auto v five online rockstar games playstation 5 ps5 xbox series x pc',
  },
  {
    id: 'red-dead-redemption-2', kind: 'other', section: 'Games', path: '/game/buy-red-dead-redemption-2', title: 'Red Dead Redemption 2', badge: null,
    price: 59.99, sku: '331210-US', art: '/rockstar-store/art/red-dead-redemption-2.svg', chips: ['PlayStation 4', 'Xbox One', 'PC'], sale: 'link-out',
    collections: ['games', 'rdr', 'best-sellers'],
    blurb: 'Winner of over 175 Game of the Year Awards, Red Dead Redemption 2 is an epic tale of life in America’s unforgiving heartland.',
    keywords: 'red dead redemption 2 rdr2 rdr arthur morgan western rockstar games playstation xbox pc',
  },
  {
    id: 'red-dead-redemption', kind: 'other', section: 'Games', path: '/game/buy-red-dead-redemption', title: 'Red Dead Redemption', badge: null,
    price: 49.99, sku: '331200-US', art: '/rockstar-store/art/red-dead-redemption.svg', chips: ['PlayStation 5', 'Xbox Series X', 'PC'], sale: 'link-out',
    collections: ['games', 'rdr'],
    blurb: 'Experience John Marston’s journey across the American frontier, now with Undead Nightmare.',
    keywords: 'red dead redemption rdr john marston undead nightmare western rockstar games',
  },
  {
    id: 'bully-scholarship-edition', kind: 'other', section: 'Games', path: '/game/buy-bully-scholarship-edition', title: 'Bully: Scholarship Edition', badge: null,
    price: 14.99, sku: '331300-US', art: '/rockstar-store/art/bully-scholarship-edition.svg', chips: ['PC'], sale: 'link-out',
    collections: ['games'],
    blurb: 'Bully tells the story of mischievous 15-year-old Jimmy Hopkins as he goes through the hilarity and awkwardness of adolescence.',
    keywords: 'bully scholarship edition jimmy hopkins bullworth rockstar games pc',
  },
  {
    id: 'gta-plus', kind: 'other', section: 'Games', path: '/game/gta-plus', title: 'GTA+', badge: null,
    price: 7.99, priceSuffix: '/Month', sku: '340100-US', art: '/rockstar-store/art/gta-plus.svg', chips: ['PlayStation 5', 'Xbox Series X'], sale: 'link-out',
    collections: ['best-sellers', 'gta'],
    blurb: 'GTA+ is a membership program for GTA Online on PlayStation 5 and Xbox Series X|S with a rotating selection of benefits each month.',
    keywords: 'gta plus gta+ membership subscription gta online rockstar games',
  },
  {
    id: 'gtavi-goodtime-state-vice-city-collection', kind: 'other', section: 'Gear', path: '/merchandise/gtavi-goodtime-state-vice-city-collection',
    title: 'Grand Theft Auto VI: The Goodtime State – Vice City Collection', badge: 'COMING SOON',
    price: 399.99, sku: '357790-US', art: '/rockstar-store/static/collection.svg', sale: 'direct', adult: true, stock: 'Low stock',
    collections: ['new-arrivals', 'gta', 'hero'],
    blurb: 'A premium Collector’s Box featuring all the essentials for a good time, inspired by Leonida’s hit TV show, Macca the Gator.',
    note: 'Grand Theft Auto VI game sold separately. Ages 18+.',
    keywords: 'gta 6 gta6 gtavi gta vi grand theft auto vi goodtime state vice city collection collector box merchandise collectibles macca the gator leonida',
  },
  {
    id: 'buy-loneliest-robot-greeting-card', kind: 'other', section: 'Gear', path: '/merchandise/buy-loneliest-robot-greeting-card',
    title: 'The Loneliest Robot Greeting Card', badge: null,
    price: 3.99, sku: '355001-US', art: '/rockstar-store/static/card.svg', sale: 'direct', stock: 'Low stock',
    collections: ['new-arrivals'],
    blurb: 'A folded greeting card featuring The Loneliest Robot from Vice City’s favorite TV show. Blank inside.',
    keywords: 'loneliest robot greeting card merchandise accessories gear',
  },
  // Official home-page merchandise types, with original local illustrations and deterministic catalog prices.
  {id:'vice-city-tee',kind:'other',section:'Gear',path:'/merchandise/vice-city-tee',title:'Grand Theft Auto: Vice City Screenshot Tee',price:39.99,sku:'BENCH-VC-TEE',art:'/rockstar-store/static/tee.svg',sale:'direct',stock:'In stock',collections:['best-sellers','gta','apparel'],blurb:'A black cotton tee with a Vice City-inspired print. Unisex fit.',note:'Size M. Game not included.',keywords:'grand theft auto vice city tee tshirt apparel merchandise clothing rockstar games'},
  {id:'rockstar-cap',kind:'other',section:'Gear',path:'/merchandise/rockstar-cap',title:'Rockstar Baseball Cap: Navy and White',price:29.99,sku:'BENCH-RS-CAP',art:'/rockstar-store/static/cap.svg',sale:'direct',stock:'In stock',collections:['best-sellers','accessories'],blurb:'Navy cap with an adjustable strap and contrast front emblem.',note:'One size. Game not included.',keywords:'rockstar games baseball cap navy white accessories merchandise headwear'},
]

PRODUCTS.push(...EXTRA_PRODUCTS)
enrichCatalog(PRODUCTS)
if (fixtureCatalog) PRODUCTS.push(...expandCatalog(PRODUCTS))
applyCatalogPolicy('rockstar-store', PRODUCTS, CATALOG_EVIDENCE)
if (!fixtureCatalog) for (const p of PRODUCTS) { delete p.inventory; delete p.stock; p.purchaseLimit = MAX_QTY }

export const GAME = PRODUCTS[0]
// The store assortment (shelf.js) is a separate array: PRODUCTS stays the evidence-backed catalog that applyCatalogPolicy,
// the inventory adapter and the reference reports describe. Browse, search, product pages and the cart read CATALOG.
// Fixture mode keeps its own authored 500-row catalog and does not add the shelf.
export const SHELF_ITEMS = fixtureCatalog ? [] : SHELF
export const CATALOG = [...PRODUCTS, ...SHELF_ITEMS]
export const byPath = (p) => CATALOG.find(x => x.path === p) ?? null
export const byId = (id) => CATALOG.find(x => x.id === String(id)) ?? null

// A cart / checkout line is { sku, qty }. bySku resolves it to a game listing (kind 'game') or a distractor (kind 'other').
export function bySku(sku) {
  const l = LISTINGS.find(x => x.sku === sku)
  if (l) return { ...l, kind: 'game', product: GAME }
  if (typeof sku !== 'string') return null
  const p = CATALOG.find(x => x.sku === sku || x.variants?.some(v => `${x.sku}:${v.id}` === sku))
  if (!p) return null
  const variant = p.variants?.find(v=>`${p.sku}:${v.id}`===sku)
  return { sku, kind:'other', title:p.title, price:variant?.price ?? p.price, art:p.art, photo:p.photo, product:p, variant, options:variant?{[p.optionLabel]:variant.label}:{}, stock:variant?.stock ?? p.inventory }

}

// The real search is fuzzy ("120 results" for "grand theft auto vi"): rank by how many query words match a product,
// keep anything with at least one hit, so GTA VI comes first and GTA V / merchandise trail it.
export function search(q) {
  const norm = s => String(s ?? '').toLowerCase().replace(/[^a-z0-9+]+/g, ' ').trim()
  const tokens = norm(q).split(' ').filter(Boolean)
  if (!tokens.length) return [...CATALOG]
  return CATALOG
    .map((p, i) => {
      // Collection names count too, so the home page "See all" links (e.g. "New Arrivals", "Best Sellers") find their items.
      const words = norm(`${p.title} ${p.keywords} ${(p.collections ?? []).join(' ')}`).split(' ')
      const score = tokens.filter(t => words.some(w => w.startsWith(t))).length
      return { p, i, score, all: score === tokens.length }
    })
    .filter(r => r.score > 0)
    .sort((a, b) => (b.all - a.all) || (b.score - a.score) || (a.i - b.i))
    .map(r => r.p)
}

// "Sort by..." options, labels from the real store's string table (search-sort-*).
export const SORTS = [['relevance', 'Relevance'], ['date-desc', 'New Arrivals'], ['price-asc', 'Price Low to High'], ['price-desc', 'Price High to Low'], ['name-asc', 'Name A to Z'], ['name-desc', 'Name Z to A']]
export function sortProducts(list, sort) {
  const isNew = p => (p.collections?.includes('new-arrivals') ? 1 : 0)
  const by = {
    // ASSUMPTION: the data has no arrival dates; "New Arrivals" lists the New Arrivals collection first.
    'date-desc': (a, b) => isNew(b) - isNew(a),
    'price-asc': (a, b) => a.price - b.price,
    'price-desc': (a, b) => b.price - a.price,
    'name-asc': (a, b) => a.title.localeCompare(b.title),
    'name-desc': (a, b) => b.title.localeCompare(a.title),
  }
  const comparator = Object.hasOwn(by,sort) ? by[sort] : null
  return comparator ? [...list].sort(comparator) : list
}

// FAQ: "What regions does the Rockstar Store ship to?" - the 20 countries. Country is pre-filled "USA" in the Xsolla form.
export const COUNTRIES = [
  ['US', 'USA'], ['CA', 'Canada'], ['GB', 'United Kingdom'], ['AT', 'Austria'], ['BE', 'Belgium'], ['CZ', 'Czechia'], ['DK', 'Denmark'],
  ['FI', 'Finland'], ['FR', 'France'], ['DE', 'Germany'], ['IE', 'Ireland'], ['IT', 'Italy'], ['LU', 'Luxembourg'], ['NL', 'Netherlands'],
  ['NO', 'Norway'], ['PL', 'Poland'], ['PT', 'Portugal'], ['ES', 'Spain'], ['SE', 'Sweden'], ['CH', 'Switzerland'],
]

// ASSUMPTION: the shipping-method step was never reached. Two options are modeled from the FAQ ("physical orders will ship in an
// estimated 1-7 days, depending on shipping selection") and the cart's free-standard-shipping threshold; labels, prices and ETAs are guesses.
export const SHIPPING_METHODS = {
  standard: { id: 'standard', name: 'Standard Shipping', price: 5.99, freeOver: FREE_SHIPPING_OVER, eta: 'Ships from November 12, 2026 · estimated 3–7 days after dispatch' },
  express: { id: 'express', name: 'Express Shipping', price: 14.99, freeOver: null, eta: 'Ships from November 12, 2026 · estimated 1–2 days after dispatch' },
}

// Authored collection locations exposed only by isolated benchmark scenarios.
// These are not claims that the live Rockstar Store offers store pickup.
export const BENCHMARK_PICKUP_STORES = [
  { id: 'miami', name: 'Miami collection point' },
  { id: 'orlando', name: 'Orlando collection point' },
]

const round = n => Math.round(n * 100) / 100

export function shippingCost(methodId, subtotal, eligible = true) {
  const m = Object.hasOwn(SHIPPING_METHODS, methodId) ? SHIPPING_METHODS[methodId] : null
  if (!m) return 0
  return eligible && m.freeOver !== null && subtotal >= m.freeOver ? 0 : m.price
}
export function deliveryEta(method, preorder) {
 return preorder ? SHIPPING_METHODS[method]?.eta : method === 'express' ? 'Estimated 1–2 business days after dispatch' : 'Estimated 3–7 business days after dispatch'
}
export function lines(items = []) { return items.map(l => ({ ...l, item: bySku(l.sku) })).filter(l => l.item) }
export function validItems(items) {
 return Array.isArray(items) && items.length>0 && items.every(l=>{const it=bySku(l.sku);return it && Number.isInteger(l.qty) && l.qty>0 && l.qty<=MAX_QTY && (it.kind==='game' || it.product.sale==='direct' && (!it.product.variants || it.variant) && l.qty<=it.stock)})
}
export function totals(items = [], shippingMethod = 'standard') {
 const ls=lines(items), count=ls.reduce((n,l)=>n+l.qty,0), subtotal=round(ls.reduce((n,l)=>n+l.qty*l.item.price,0))
 const physical=ls.filter(l=>l.item.product.delivery!=='digital'),digitalOnly=ls.length>0&&!physical.length,shippingEligible=!physical.some(l=>l.item.product.freeShipping===false)
 const physicalSubtotal=round(physical.reduce((n,l)=>n+l.qty*l.item.price,0))
 const shipping=physical.length?shippingCost(shippingMethod,physicalSubtotal,shippingEligible):0,tax=round(subtotal*TAX_RATE)
 return {lines:ls,count,subtotal,physicalSubtotal,shippingEligible,digitalOnly,shipping,tax,total:round(subtotal+shipping+tax)}
}
export function filterProducts(items, options = {}) {
 const category=options.category || options['subcategories[all]']
 return items.filter(p=>(!options.section||p.section===options.section)&&(!options.collection||p.collections?.includes(options.collection))&&(!options.platform||p.chips?.includes(options.platform))&&(!category||p.category===category||(category==='collectible'&&p.category==='collectibles'))&&(!options.availability||options.availability==='in-stock'&&p.inventory>0||options.availability==='out-of-stock'&&p.inventory===0)&&(!options.min||p.price>=Number(options.min))&&(!options.max||p.price<=Number(options.max)))
}
