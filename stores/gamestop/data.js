import { scenarioProduct } from '../../lib/benchmark-scenarios.js'
import { applyCatalogPolicy, fixtureCatalog } from '../../lib/catalog-policy.js'
import { catalogEvidence } from './catalog-evidence.js'
import { RETAIL_PRODUCTS, DEPARTMENTS, HUBS } from './catalog.js'
import { expandGameStop } from './catalog500.js'
export { DEPARTMENTS, HUBS }
// Listings as they appear on gamestop.com (research/gamestop.md, 2026-09-29).
export const TAX_RATE = 0.07125 // cart showed $5.70 estimated tax on $79.99 before any address

const GAME_FEATURES = (platform) => [
  platform === 'ps5'
    ? 'This product will only contain a download code inside the box to support pre-load starting on November 12. A disc will not be included in the box. Code can only be used by users holding an account for PlayStation® registered to the US or Canada.'
    : 'This product will only contain a download code inside the box to support pre-load starting on November 12. A disc will not be included in the box.',
  'Pre-order to receive the Vintage Vice City Pack.',
  'Grand Theft Auto VI is a single-player experience.',
  'Grand Theft Auto VI heads to the state of Leonida, home to the neon-soaked streets of Vice City and beyond, in the biggest, most immersive evolution of the Grand Theft Auto series yet.',
]

export const PRODUCTS = [
  {
    id: '448295', kind: 'game', platform: 'ps5', edition: 'standard', format: 'code-in-box',
    category: 'playstation-5', categoryName: 'PlayStation 5', selectorLabel: 'PlayStation 5',
    slug: 'grand-theft-auto-vi---playstation-5-code-in-box',
    title: 'Grand Theft Auto VI - PlayStation 5 (Code in Box)',
    brand: 'Rockstar Games', price: 79.99, proPrice: null, release: '11/12/2026',
    badge: '50+ Purchased Recently', esrb: 'RP (Rating Pending)', condition: 'New',
    art: '/static/art/ps5-standard.svg', features: GAME_FEATURES('ps5'),
    keywords: 'gta 6 gta6 gta vi gtavi grand theft auto 6 rockstar games pre-order preorder playstation ps5 video games',
  },
  {
    id: '448297', kind: 'game', platform: 'xbox', edition: 'standard', format: 'code-in-box',
    category: 'xbox-series-x|s', categoryName: 'Xbox Series X|S', selectorLabel: 'Xbox Series X',
    slug: 'grand-theft-auto-vi---xbox-series-x-s-code-in-box',
    title: 'Grand Theft Auto VI - Xbox Series X/S (Code in Box)',
    brand: 'Rockstar Games', price: 79.99, proPrice: null, release: '11/12/2026',
    badge: null, esrb: 'RP (Rating Pending)', condition: 'New',
    art: '/static/art/xbox-standard.svg', features: GAME_FEATURES('xbox'),
    keywords: 'gta 6 gta6 gta vi gtavi grand theft auto 6 rockstar games pre-order preorder xbox series x video games',
  },
  {
    id: '448310', kind: 'other', category: 'playstation-5', categoryName: 'PlayStation 5',
    slug: 'sony-dualsense-wireless-controller-for-playstation-5---grand-theft-auto-vi-white-limited-edition',
    title: 'Sony DualSense Wireless Controller for PlayStation 5 - Grand Theft Auto VI White Limited Edition',
    brand: 'Sony Interactive Entertainment', price: 84.99, proPrice: null, release: '11/19/2026',
    badge: null, esrb: null, condition: 'New', art: '/static/art/accessory.svg',
    features: ['Limited edition Grand Theft Auto VI design in white.', 'Haptic feedback and adaptive triggers.', 'Built-in microphone and headset jack.'],
    keywords: 'gta 6 gta6 gta vi gtavi grand theft auto controller dualsense sony playstation ps5 pre-order preorder gaming accessories',
  },
  {
    id: '448312', kind: 'other', category: 'electronics', categoryName: 'Electronics',
    slug: 'grand-theft-auto-vi-the-album-original-soundtrack-various-artists-2x-lp',
    title: 'Grand Theft Auto VI: The Album (Original Soundtrack) (Various Artists) 2x LP',
    brand: 'Rockstar Games', price: 54.99, proPrice: 52.24, release: '11/19/2026',
    badge: null, esrb: null, condition: 'New', art: '/static/art/vinyl.svg',
    features: ['Double LP pressing of the official soundtrack.', 'Gatefold sleeve.'],
    keywords: 'gta 6 gta6 gta vi gtavi grand theft auto album soundtrack vinyl lp music pre-order preorder electronics',
  },
  {
    id: 'gs-gta-v-preowned', kind: 'other', category: 'playstation-5', categoryName: 'PlayStation 5',
    slug: 'grand-theft-auto-v-playstation-5-pre-owned', title: 'Grand Theft Auto V - PlayStation 5',
    brand: 'Rockstar Games', price: 18.99, proPrice: 18.04, release: '03/15/2022', preorder: false,
    badge: 'Pre-Owned', esrb: 'M (Mature 17+)', condition: 'Pre-Owned', art: '/static/art/game-generic.svg',
    features: ['Explore Los Santos in the PlayStation 5 edition of Grand Theft Auto V.', 'Pre-owned physical disc. A disc-compatible PlayStation 5 console is required.', 'This is Grand Theft Auto V; it is not a preorder of Grand Theft Auto VI.'],
    keywords: 'gta 5 gta5 grand theft auto v rockstar video games pre-owned playstation 5 ps5',
  },
  {
    id: 'gs-dualsense-white', kind: 'other', category: 'playstation-5', categoryName: 'PlayStation 5',
    slug: 'sony-dualsense-wireless-controller-white', title: 'Sony DualSense Wireless Controller - White',
    brand: 'Sony Interactive Entertainment', price: 74.99, proPrice: null, release: '11/12/2020', preorder: false,
    badge: null, esrb: null, condition: 'New', art: '/static/art/accessory.svg',
    features: ['Wireless controller for PlayStation 5.', 'Haptic feedback, adaptive triggers, and a built-in microphone.', 'USB cable sold separately.'],
    keywords: 'sony dualsense controller accessories playstation 5 ps5 gaming accessories white',
  },

  ...(fixtureCatalog ? RETAIL_PRODUCTS : []),
]

// Explicit metadata for legacy URLs and benchmark identities.
const legacy = {
  "448295": { department:"video-games", family:"physical-game", platforms:["ps5"] },
  "448297": { department:"video-games", family:"physical-game", platforms:["xbox"] },
  "448310": { department:"gaming-accessories", family:"controller", platforms:["ps5"] },
  "448312": { department:"collectibles", family:"vinyl", format:"vinyl", platforms:[] },
  "gs-gta-v-preowned": { department:"video-games", family:"physical-game", platforms:["ps5"], format:"disc", offers:["deals"] },
  "gs-dualsense-white": { department:"gaming-accessories", family:"controller", platforms:["ps5"], photo:"controller", connection:"Wireless", options:{Condition:["New","Pre-Owned"]}, variants:[{id:"new",options:{Condition:"New"},price:74.99,stock:6},{id:"preowned",options:{Condition:"Pre-Owned"},price:54.99,stock:3}] },
}
for (const p of PRODUCTS) {
  Object.assign(p, legacy[p.id] || {})
  p.preorder ??= true; p.stock ??= 10; p.fulfillment ??= ["shipping"]; p.rating ??= p.preorder ? 0 : 4.5; p.reviews ??= p.preorder ? 0 : 47
  p.specs ??= { Brand:p.brand, Category:p.categoryName, ...(p.esrb ? {Rating:p.esrb} : {}), ...(p.kind === "game" ? {Edition:"Standard",Format:"Code in Box (no disc)"} : {}) }
}

if (fixtureCatalog) expandGameStop(PRODUCTS)
applyCatalogPolicy('gamestop', PRODUCTS, catalogEvidence)
if (!fixtureCatalog) for (const p of PRODUCTS) { p.catalogType = 'game'; p.catalogPlatform = p.platform; p.simulatedStock = true }
export const byId = (id) => PRODUCTS.find(p => p.id === String(id)) ?? null

export function productPath(base, p) {
  return p.id.startsWith("448") || ["gs-gta-v-preowned","gs-dualsense-white"].includes(p.id) ? `${base}/video-games/${encodeURIComponent(p.category)}/products/${p.slug}/${p.id}.html` : `${base}/products/${p.id}`
}

export function search(q) {
  const norm = s => String(s ?? '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
  const tokens = norm(q).split(' ').filter(Boolean)
  if (!tokens.length) return [...PRODUCTS]
  return PRODUCTS.filter(p => { const hay = norm(p.title + ' ' + p.keywords); return tokens.every(t => hay.includes(t)) })
}

export const STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','DC','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY']

export const SHIPPING_METHODS = {
  premium: { id: 'premium', name: 'Premium', price: 0, eta: 'Arrives on or shortly after release day' },
  rush: { id: 'rush', name: 'Rush', price: 9.99, eta: 'Arrives on release day' },
}

const round = n => Math.round(n * 100) / 100

export function cartLines(store) {
  return store.cart.map(l => ({ ...l, product: scenarioProduct(store,selectedProduct(byId(l.pid), l.variant)) })).filter(l => l.product)
}

export function totals(store, shippingMethod = 'premium') {
  const lines = cartLines(store)
  const count = lines.reduce((n, l) => n + l.qty, 0)
  const subtotal = round(lines.reduce((n, l) => n + l.qty * l.product.price, 0))
  const shipping = SHIPPING_METHODS[shippingMethod]?.price ?? 0
  const tax = round(subtotal * TAX_RATE)
  return { lines, count, subtotal, shipping, tax, total: round(subtotal + shipping + tax) }
}

// Resolve every price, option and image from server-owned catalog data.
export function selectedProduct(p, variantId) {
  if (!p) return null
  if (!p.variants) return variantId ? null : p
  const v = p.variants.find(v => v.id === (variantId || p.variants[0].id))
  return v ? {...p, ...v, id:p.id, options:p.options, wasPrice:v.wasPrice ?? (p.wasPrice>v.price?p.wasPrice:null), variants:p.variants, variant:v.id, selectedOptions:v.options, condition:v.options.Condition || p.condition, photo:v.photo === undefined ? p.photo : v.photo} : null
}
export function cartError(cart) {
  const products = new Map(), variants = new Map()
  for (const line of cart) {
    const original = byId(line.pid), p = selectedProduct(original,line.variant)
    if (!p || !Number.isInteger(line.qty) || line.qty < 1 || line.qty > 5) return 'Choose a valid product option and a whole-number quantity from 1 to 5.'
    if (!p.fulfillment.includes('shipping')) return 'This item is not available for shipping.'
    products.set(p.id,(products.get(p.id)||0)+line.qty)
    const key = `${p.id}:${p.variant || ''}`
    variants.set(key,(variants.get(key)||0)+line.qty)
    if (products.get(p.id) > original.stock || variants.get(key) > p.stock) return p.simulatedStock ? `${p.title}: the requested quantity exceeds the per-order limit.` : `${p.title}: the requested quantity exceeds available stock.`
  }
  return null
}
export const shippingEta = (p, method='premium') => p.preorder ? SHIPPING_METHODS[method]?.eta || SHIPPING_METHODS.premium.eta : method==='rush' ? 'Expedited handling after order processing' : 'Ships after order processing'
const multi = v => (Array.isArray(v) ? v : v ? [v] : []).map(String)
const valuesFor = (p,name) => {
  if (name === 'category') return [p.department, ({'video-games':'games','gaming-accessories':'accessories','toys-games/trading-cards':'cards'})[p.department],p.family,p.format==='vinyl'?'music':''].filter(Boolean)
  if (name === 'platform') return p.platforms
  if (name === 'availability') return [p.stock ? p.preorder ? 'preorder' : 'instock' : 'outofstock']
  if (name === 'fulfillment') return p.fulfillment
  if (name === 'condition') return p.selectedOptions ? [p.condition] : [...new Set([p.condition,...(p.variants || []).map(v=>v.options.Condition).filter(Boolean)])]
  if (name === 'size') return p.selectedOptions ? [p.selectedOptions.Size].filter(Boolean) : p.options?.Size || []
  if (name === 'color') return p.selectedOptions ? [p.selectedOptions.Color].filter(Boolean) : p.options?.Color || []
  return [String(p[name] || '')]
}
export function refine(products, filters = {}) {
  const matches = p => {
    for (const name of ['platform','category','availability','condition','brand','format','fulfillment','connection','franchise','grade','size','color']) {
      const chosen = multi(filters[name]); if (chosen.length && !chosen.some(v=>valuesFor(p,name)?.includes(v))) return false
    }
    const prices = multi(filters.price)
    if (prices.length && !prices.some(v => v==='under25' ? p.price < 25 : v==='25to50' ? p.price >= 25 && p.price < 50 : v==='50to100' ? p.price>=50 && p.price<100 : v==='100plus' ? p.price>=100 : false)) return false
    if (filters.rating && p.rating < Number(filters.rating)) return false
    return true
  }
  const hits = products.flatMap(p=>{const found=(p.variants ? p.variants.map(v=>selectedProduct(p,v.id)) : [p]).find(matches);return found?[found]:[]})
  const tie = (a,b)=>a.id.localeCompare(b.id)
  const sorts = {price_low:(a,b)=>a.price-b.price||tie(a,b), price_high:(a,b)=>b.price-a.price||tie(a,b), rating:(a,b)=>b.rating-a.rating||tie(a,b), popular:(a,b)=>b.reviews-a.reviews||tie(a,b), release:(a,b)=>(Date.parse(a.release)||0)-(Date.parse(b.release)||0)||tie(a,b), newest:(a,b)=>(Date.parse(b.release)||0)-(Date.parse(a.release)||0)||tie(a,b)}
  return filters.sort && sorts[filters.sort] ? hits.sort(sorts[filters.sort]) : hits
}
export const FILTERS = ['platform','category','price','availability','condition','brand','format','rating','fulfillment','connection','franchise','grade','size','color','sort']
export function parseFilters(query) {return Object.fromEntries(FILTERS.filter(k=>query[k]).map(k=>[k,['sort','rating'].includes(k)?String(query[k]):multi(query[k])]))}
export function collection(slug) {
  const d = DEPARTMENTS.find(d=>d.id===slug)
  if(d) return {...d,products:PRODUCTS.filter(p=>p.department===slug || slug==='toys-games' && p.department.startsWith('toys-games/'))}
  const h = HUBS[slug]
  if(h) return {...h,id:slug,products:PRODUCTS.filter(h.matches).map(p=>{
    if(slug!=='pre-owned' || !p.variants) return p
    const variants=p.variants.filter(v=>['Pre-Owned','Refurbished'].includes(v.options.Condition))
    return variants.length ? selectedProduct({...p,variants},variants[0].id) : p
  })}
  if(slug==='gaming-accessories/controllers') return {name:'Controllers',description:'Choose your platform and condition.',id:slug,products:PRODUCTS.filter(p=>p.family==='controller')}
  return null
}
