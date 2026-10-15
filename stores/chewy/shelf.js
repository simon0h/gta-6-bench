// Chewy storefront assortment for reference mode: builds product records from
// shelf-data.js and answers category, brand, deal and search queries.
// This array is kept apart from any GTA 6 / evidence-backed catalog: Chewy
// sells no video games, and these items are recorded as kind:'other' orders.
import { SHELF_ROWS, BRAND_COLORS } from './shelf-data.js'
import { DOG_MENU, CAT_MENU, OTHER_ANIMALS_MENU, PHARMACY_MENU, CATEGORIES, BRANDS, idOf } from './reference-data.js'

const hash = s => { let n = 2166136261; for (const c of String(s)) n = Math.imul(n ^ c.codePointAt(0), 16777619); return n >>> 0 }
const slugify = s => s.toLowerCase().replace(/&/g, 'and').replace(/['’®™°]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

// ── Category tree (child id → parent ids) from the captured menus ─────────
const PARENTS = new Map()
const link = (child, parent) => { if (!child || !parent || child === parent) return; if (!PARENTS.has(child)) PARENTS.set(child, new Set()); PARENTS.get(child).add(parent) }
for (const [menu, dept] of [[DOG_MENU, '288'], [CAT_MENU, '325'], [PHARMACY_MENU, '2515'], [OTHER_ANIMALS_MENU, null]]) {
  for (const g of menu) {
    const gid = idOf(g.path)
    link(gid, dept)
    for (const i of g.items) link(idOf(i.path), gid)
  }
}
// Homepage "Wild Bird" tile (/b/wild-bird-12931) shows the whole Wild Bird & Wildlife group.
export const CATEGORY_ALIASES = { 12931: '139606' }
function ancestors(id) {
  const out = new Set([String(id)]), queue = [String(id)]
  while (queue.length) for (const p of PARENTS.get(queue.shift()) || []) if (!out.has(p)) { out.add(p); queue.push(p) }
  return out
}
const PET_OF = { 288: 'Dog', 325: 'Cat', 1663: 'Horse', 12992: 'Chicken', 8403: 'Livestock', 139606: 'Wild Bird', 977: 'Small Pet', 941: 'Bird', 885: 'Fish', 1025: 'Reptile' }
const CONSUMABLE = new Set(['332', '387', '411', '335', '391', '372', '415', '2515', '351', '2744', '951', '8405', '9923', '139606', '942', '886', '1026', '1692', '1691', '2745', '12995', '128950', '10850', '10851', '10853', '10852'])

// ── Products ─────────────────────────────────────────────────────────────
const usedIds = new Set(['226306'])
function itemId(title) {
  if (/^Purina Pro Plan Adult Sensitive Skin & Stomach Salmon & Rice Formula Dry Dog Food/.test(title)) return '52404' // real chewy.com item id (research/parity/chewy.json)
  let n = 100000 + hash(title) % 900000
  while (usedIds.has(String(n))) n++
  return String(n)
}
function lifeStage(t) { return /puppy|kitten|healthy growth/i.test(t) ? (/kitten|cat/i.test(t) ? 'Kitten' : 'Puppy') : /senior|7\+/i.test(t) ? 'Senior' : 'Adult' }
function foodForm(cat, t) { return /freeze-dried/i.test(t) ? 'Freeze-Dried' : /fresh|frozen/i.test(t) ? 'Fresh' : ['293', '389'].includes(cat) || /canned|wet|tray/i.test(t) ? 'Wet' : 'Dry' }
function breedSize(t) { return /small breed|small bites|small puppy|mini|petite/i.test(t) ? 'Small' : /large breed|large dogs|large,|, large/i.test(t) ? 'Large' : /medium/i.test(t) ? 'Medium' : null }

const FALLBACK_COLORS = ['#2f5d8a', '#3c7a4e', '#8a3b3b', '#6a4c93', '#b0682a', '#2a7f86', '#7a5a2f', '#3f4f9a', '#9a3f6b', '#4b6b2a']
export const SHELF = SHELF_ROWS.map((row, index) => {
  const id = itemId(row.title); usedIds.add(id)
  const h = hash(row.title)
  const cats = ancestors(row.cat)
  const pet = Object.entries(PET_OF).find(([k]) => cats.has(k))?.[1] || null
  const flags = new Set(row.flags.split(/\s+/).filter(Boolean))
  const sizes = row.sizes ? row.sizes.map(([label, price]) => ({ label, price })) : null
  const price = row.price
  const onDeal = h % 100 < 24 && !flags.has('rx')
  const list = onDeal ? Math.round(price * (1.12 + (h % 17) / 100) * 100) / 100 : null
  const rating = Math.round((4.2 + ((h >>> 7) % 8) / 10) * 10) / 10
  const reviews = Math.round(Math.exp(3.6 + ((h >>> 11) % 1000) / 1000 * 6.2))
  const brandWords = row.brand.split(' ').length
  const subtitle = row.title.split(',')[0].split(' ').slice(brandWords).join(' ')
  const isFood = cats.has('332') || cats.has('387')
  const leaf = CATEGORIES.get(String(row.cat))
  const slug = id === '52404' ? 'purina-pro-plan-adult-sensitive-skin' : slugify(row.title.split(',')[0]).split('-').slice(0, 9).join('-')
  return Object.freeze({
    id, slug, path: `/${slug}/dp/${id}`, brand: row.brand, title: row.title, subtitle, price, list, rating, reviews,
    sizes, cat: String(row.cat), cats, catLabel: leaf?.h1 || '', pet, petLabel: isFood ? pet : null,
    rx: flags.has('rx'), isNew: flags.has('new') || h % 100 > 93, tags: flags, kind: 'other', order: index,
    autoship: [...cats].some(c => CONSUMABLE.has(c)),
    lifestage: isFood ? lifeStage(row.title) : null, foodForm: isFood ? foodForm(String(row.cat), row.title) : null, breedSize: cats.has('288') ? breedSize(row.title) : null,
    art: row.art, color: BRAND_COLORS[row.brand] || FALLBACK_COLORS[h % FALLBACK_COLORS.length],
    seller: 'Chewy',
  })
})
export const SHELF_BY_ID = new Map(SHELF.map(p => [p.id, p]))
export const autoshipPrice = price => Math.round(price * 0.95 * 100) / 100
export const priceOf = (p, size) => p.sizes?.find(s => s.label === size)?.price ?? p.price

// ── Selections used by category, landing, deal and brand pages ────────────
const MADE_BY_CHEWY = ['Frisco', 'American Journey', "Tylee's"]
const BRAND_MATCH = {
  '/brands/made-by-chewy': p => MADE_BY_CHEWY.includes(p.brand),
  '/brands/purina-pro-plan': p => p.brand.startsWith('Purina Pro Plan'),
  '/brands/hills': p => p.brand.startsWith("Hill's"),
  '/brands/blue-buffalo': p => p.brand === 'Blue Buffalo',
  '/brands/royal-canin': p => p.brand.startsWith('Royal Canin'),
  '/brands/bark': p => p.brand === 'BARK',
  '/brands/hills-prescription-diet-6879': p => p.brand === "Hill's Prescription Diet",
}
export const brandProducts = path => SHELF.filter(BRAND_MATCH[path] || (() => false))
export { BRANDS }

const SPECIAL = {
  14264: p => p.isNew,
  15682: p => p.autoship,
  2040: p => p.cats.has('335') || p.cats.has('391'),
  15520: p => p.tags.has('football'),
  159246: p => p.cats.has('365') || p.cats.has('425'),
  2026: p => p.tags.has('halloween'),
  15439: p => p.tags.has('parent') || p.cats.has('353') || p.cats.has('1985'),
  11718: p => false,
}
export function categoryProducts(id) {
  id = CATEGORY_ALIASES[id] || String(id)
  if (SPECIAL[id]) return SHELF.filter(SPECIAL[id])
  return SHELF.filter(p => p.cats.has(id))
}
export function dealProducts(slug) {
  if (slug === '50-off-your-first-autoship-order-3448422') return SHELF.filter(p => p.rx)
  if (slug === 'buy-3-get-4th-free-2685446') return SHELF.filter(p => p.cats.has('315') || p.cats.has('326') || p.tags.has('halloween') && p.cats.has('1470'))
  return SHELF.filter(p => p.list)
}
export function pickProducts(slug) {
  const pet = { 'dog-supplies_s100968': 'Dog', 'cat-supplies_s112080': 'Cat', 'horse-supplies_s123854': 'Horse', 'fish-aquarium-supplies_s121446': 'Fish', 'reptile-supplies_s122326': 'Reptile', 'bird-supplies_s122318': 'Bird', 'small-animal-supplies_s121454': 'Small Pet' }[slug]
  return SHELF.filter(p => p.pet === pet || (pet === 'Bird' && p.pet === 'Wild Bird')).filter(p => p.rating >= 4.5 || ['Horse', 'Fish', 'Reptile', 'Bird', 'Small Pet'].includes(pet)).sort((a, b) => b.reviews - a.reviews)
}

// ── Search ───────────────────────────────────────────────────────────────
const STOP = new Set(['for', 'and', 'the', 'with', 'a', 'an', 'of', 'in', 'to', 'by', 'on'])
const stem = w => w.length > 3 && w.endsWith('ies') ? w.slice(0, -3) + 'y' : w.length > 3 && w.endsWith('s') && !w.endsWith('ss') ? w.slice(0, -1) : w
const words = s => String(s).toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/['’]/g, '').split(/[^a-z0-9+]+/).filter(Boolean).map(stem)
const INDEX = SHELF.map(p => {
  const crumbs = [...p.cats].map(c => CATEGORIES.get(c)?.h1 || '').join(' ')
  return { p, title: new Set(words(`${p.brand} ${p.title}`)), all: new Set(words(`${p.brand} ${p.title} ${crumbs} ${p.pet || ''} ${p.pet === 'Dog' ? 'puppy' : p.pet === 'Cat' ? 'kitten kitty' : ''}`)) }
})
const has = (set, t) => set.has(t) || (t.length >= 4 && [...set].some(w => w.startsWith(t)))
// Every word of the query (numbers aside) must match; a query with no
// matching products returns [] so the caller can show its coverage state.
export function searchShelf(query) {
  const terms = words(query).filter(t => !STOP.has(t))
  const required = terms.filter(t => !/^\d+$/.test(t))
  if (!required.length) return []
  const scored = []
  for (const { p, title, all } of INDEX) {
    if (!required.every(t => has(all, t))) continue
    const score = terms.reduce((s, t) => s + (has(title, t) ? 3 : has(all, t) ? 1 : 0), 0) + Math.log10(p.reviews + 1) / 3
    scored.push([score, p])
  }
  return scored.sort((a, b) => b[0] - a[0] || a[1].order - b[1].order).map(([, p]) => p)
}

// ── Listing filters, sort and pagination (Chewy shows 36 per page) ───────
export const PAGE_SIZE = 36
export const PRICE_BANDS = [['Under $10', 0, 10], ['$10 - $25', 10, 25], ['$25 - $50', 25, 50], ['$50 - $100', 50, 100], ['$100 & Above', 100, Infinity]]
export const RATING_BANDS = [['4 Stars & Up', 4], ['3 Stars & Up', 3], ['2 Stars & Up', 2], ['1 Star & Up', 1]]
export const FILTER_FIELDS = {
  Brand: { key: 'f_brand', values: list => [...new Set(list.map(p => p.brand))].sort(), test: (p, v) => p.brand === v },
  Price: { key: 'f_price', values: list => PRICE_BANDS.filter(([, lo, hi]) => list.some(p => p.price >= lo && p.price < hi)).map(b => b[0]), test: (p, v) => { const b = PRICE_BANDS.find(x => x[0] === v); return !b || (p.price >= b[1] && p.price < b[2]) } },
  'Customer Rating': { key: 'f_customer-rating', values: () => RATING_BANDS.map(b => b[0]), test: (p, v) => p.rating >= (RATING_BANDS.find(b => b[0] === v)?.[1] || 0) },
  Autoship: { key: 'f_autoship', values: list => list.some(p => p.autoship) ? ['Autoship eligible'] : [], test: p => p.autoship },
  Lifestage: { key: 'f_lifestage', values: list => ['Puppy', 'Kitten', 'Adult', 'Senior'].filter(v => list.some(p => p.lifestage === v)), test: (p, v) => p.lifestage === v },
  'Breed Size': { key: 'f_breed-size', values: list => ['Small', 'Medium', 'Large'].filter(v => list.some(p => p.breedSize === v)), test: (p, v) => p.breedSize === v },
  'Food Form': { key: 'f_food-form', values: list => ['Dry', 'Wet', 'Fresh', 'Freeze-Dried'].filter(v => list.some(p => p.foodForm === v)), test: (p, v) => p.foodForm === v },
  'Deals & Savings': { key: 'f_deals-and-savings', values: list => list.some(p => p.list) ? ['Deals'] : [], test: p => !!p.list },
}
export function applyListing(list, query) {
  let out = list
  for (const f of Object.values(FILTER_FIELDS)) {
    const v = typeof query[f.key] === 'string' ? query[f.key].trim() : ''
    if (v) out = out.filter(p => f.test(p, v))
  }
  const sort = typeof query.sort === 'string' ? query.sort : 'Relevance'
  const cmp = {
    Newest: (a, b) => (b.isNew - a.isNew) || b.order - a.order,
    Bestselling: (a, b) => b.reviews * b.rating - a.reviews * a.rating,
    'Price: Low to High': (a, b) => a.price - b.price,
    'Price: High to Low': (a, b) => b.price - a.price,
    'Avg. Customer Review': (a, b) => b.rating - a.rating || b.reviews - a.reviews,
    'Most Reviewed': (a, b) => b.reviews - a.reviews,
  }[sort]
  if (cmp) out = [...out].sort(cmp)
  const pages = Math.max(1, Math.ceil(out.length / PAGE_SIZE))
  const page = Math.min(pages, Math.max(1, Number.parseInt(query.page, 10) || 1))
  return { all: out, total: out.length, page, pages, items: out.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), sort }
}
