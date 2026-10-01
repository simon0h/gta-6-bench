// Listings and distractors as they appear on store.rockstargames.com (research/rockstar-store.md, 2026-09-29/30).
import { PRICES } from '../../lib/catalog.js'

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
  { sku: '7Kw5cmiiWlfvDje2JFgAfo', platform: 'ps5', edition: 'standard', format: 'digital', price: USD.standard, title: 'Grand Theft Auto VI - Standard Edition (Digital, PS5)', linkOut: '/playstation-store/', storeName: 'PlayStation Store' },
  { sku: '61VDNENfCyijvOimxjyCFe', platform: 'xbox', edition: 'standard', format: 'digital', price: USD.standard, title: 'Grand Theft Auto VI - Standard Edition (Digital, Xbox Series X|S)', linkOut: '/xbox-store/', storeName: 'Microsoft Store' },
  { sku: '1k94fAGkvqcSNOS6PczG4Y', platform: 'ps5', edition: 'ultimate', format: 'digital', price: USD.ultimate, title: 'Grand Theft Auto VI - Ultimate Edition (Digital, PS5)', linkOut: '/playstation-store/', storeName: 'PlayStation Store' },
  { sku: '5RyqR1Lk56PH9OgVD3haBY', platform: 'xbox', edition: 'ultimate', format: 'digital', price: USD.ultimate, title: 'Grand Theft Auto VI - Ultimate Edition (Digital, Xbox Series X|S)', linkOut: '/xbox-store/', storeName: 'Microsoft Store' },
]

export const PLATFORM_OPTIONS = [
  { id: 'ps5', label: 'PS5', chip: 'PlayStation 5', storeName: 'PlayStation Store' },
  { id: 'xbox', label: 'Xbox Series X|S', chip: 'Xbox Series X', storeName: 'Microsoft Store' },
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
]

export const GAME = PRODUCTS[0]
export const byPath = (p) => PRODUCTS.find(x => x.path === p) ?? null
export const byId = (id) => PRODUCTS.find(x => x.id === String(id)) ?? null

// A cart / checkout line is { sku, qty }. bySku resolves it to a game listing (kind 'game') or a distractor (kind 'other').
export function bySku(sku) {
  const l = LISTINGS.find(x => x.sku === sku)
  if (l) return { ...l, kind: 'game', product: GAME }
  const p = PRODUCTS.find(x => x.sku === sku)
  return p ? { sku: p.sku, kind: 'other', title: p.title, price: p.price, art: p.art, product: p } : null
}

// The real search is fuzzy ("120 results" for "grand theft auto vi"): rank by how many query words match a product,
// keep anything with at least one hit, so GTA VI comes first and GTA V / merchandise trail it.
export function search(q) {
  const norm = s => String(s ?? '').toLowerCase().replace(/[^a-z0-9+]+/g, ' ').trim()
  const tokens = norm(q).split(' ').filter(Boolean)
  if (!tokens.length) return []
  return PRODUCTS
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
  }[sort]
  return by ? [...list].sort(by) : list
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

const round = n => Math.round(n * 100) / 100

export function shippingCost(methodId, subtotal) {
  const m = SHIPPING_METHODS[methodId]
  if (!m) return 0
  return m.freeOver !== null && subtotal >= m.freeOver ? 0 : m.price
}

export function lines(items = []) {
  return items.map(l => ({ ...l, item: bySku(l.sku) })).filter(l => l.item)
}

export function totals(items = [], shippingMethod = 'standard') {
  const ls = lines(items)
  const count = ls.reduce((n, l) => n + l.qty, 0)
  const subtotal = round(ls.reduce((n, l) => n + l.qty * l.item.price, 0))
  const shipping = shippingCost(shippingMethod, subtotal)
  const tax = round(subtotal * TAX_RATE)
  return { lines: ls, count, subtotal, shipping, tax, total: round(subtotal + shipping + tax) }
}
