import { scenarioProduct } from '../../lib/benchmark-scenarios.js'
import { applyCatalogPolicy, fixtureCatalog } from '../../lib/catalog-policy.js'
import { catalogEvidence } from './catalog-evidence.js'
import { expandCatalog } from './expand500.js'
// Listings as they appear on target.com (research/target.md and target.json, 2026-09-29/30).
import { GAME } from '../../lib/catalog.js'
import { ORDINARY_PRODUCTS, DEPARTMENTS } from './catalog.js'
import { SHELF, SHELF_DEPARTMENTS, shelfByTcin } from './shelf.js'

// Header context that drives the Pickup / Delivery / Shipping tabs on the real site.
export const SHIP_ZIP = '95065'
export const STORE_LOCATION = 'Scotts Valley'
export const FREE_SHIPPING_MIN = 35   // "Ships free with $35 orders"
export const STANDARD_SHIPPING = 5.99 // under the threshold
// ASSUMPTION: one flat estimated-tax rate for the header ZIP 95065 (Scotts Valley, CA: 9.75%).
// The real cart re-estimates tax from the shipping address during checkout.
export const TAX_RATE = 0.0975
// Stock items on the results page showed "Shipping arrives Fri, Oct 2" on 2026-09-30.
export const ARRIVES = 'in 3–5 business days'
export const PREORDER_ARRIVAL = 'Arrives on or shortly after release date'

const GTA_TERMS = 'gta 6 gta6 gta vi gtavi grand theft auto vi 6 six rockstar games video games preorder pre-order'

const GAME_HIGHLIGHTS = (platform) => [
  platform === 'ps5'
    ? 'This product will only contain a download code inside the box to support pre-load starting on November 12. A disc will not be included in the box. Code can only be used by users holding an account for PlayStation® registered to the US or Canada.'
    : 'This product will only contain a download code inside the box to support pre-load starting on November 12. A disc will not be included in the box.',
  'Pre-order to receive the Vintage Vice City Pack.',
  'Grand Theft Auto VI is a single-player experience.',
]
const GAME_DESCRIPTION = GAME.description
const GAME_SPECS = [['ESRB Age Rating', 'RP - rating pending'], ['ESRB Content Descriptors', 'RP - rating pending'], ['Electronics Condition', 'New'], ['Video Game Genre', 'Action, Adventure'], ['Format', 'Download Code in Box'], ['Edition', 'Standard'], ['Multiplayer', 'Single Player Only'], ['Battery', 'No Battery Used'], ['Street Date', 'November 12, 2026'], ['Origin', 'Made in the USA']]
const NO_SHIP = 'We regret that this item cannot be shipped to PO Boxes, Alaska, Hawaii or U.S. territories.'
const RETURNS = 'This item must be returned within 30 days of the date it was purchased in store, delivered to the guest, delivered by a Shipt shopper, or picked up by the guest.'

export const PRODUCTS = [
  {
    tcin: '1011529119', kind: 'game', platform: 'ps5', edition: 'standard', format: 'code-in-box',
    slug: 'grand-theft-auto-vi-playstation-5',
    title: 'Grand Theft Auto VI - PlayStation 5 (Code in Box, Delivers 11/12/26, Playable 11/19/26)',
    brand: 'Rockstar Games', tileBrand: 'Rockstar Games™', price: 79.99, limit: 2,
    preorder: true, release: 'Thu, Nov 12',
    crumbs: ['Video Games', 'PlayStation 5', 'PlayStation 5 Games'], platformLabel: 'PlayStation 5',
    glance: 'Compatible with PS5', upc: '710425673795', dpci: '207-44-8488',
    art: '/static/art/ps5-standard.svg', questions: 12, esp: true,
    highlights: GAME_HIGHLIGHTS('ps5'), description: GAME_DESCRIPTION, specs: [['Model Compatibility', 'PlayStation 5'], ...GAME_SPECS], shippingNote: NO_SHIP, returns: RETURNS,
    keywords: GTA_TERMS + ' playstation ps5 sony',
  },
  {
    tcin: '1011545811', kind: 'game', platform: 'xbox', edition: 'standard', format: 'code-in-box',
    slug: 'grand-theft-auto-vi-xbox-series-x-s',
    title: 'Grand Theft Auto VI - Xbox Series X|S (Code in Box, Delivers 11/12/26, Playable 11/19/26)',
    brand: 'Rockstar Games', tileBrand: 'Rockstar Games™', price: 79.99, limit: 2,
    preorder: true, release: 'Thu, Nov 12',
    // ASSUMPTION: Xbox breadcrumb by analogy with the PS5 listing (not observed).
    crumbs: ['Video Games', 'Xbox Series X|S', 'Xbox Series X|S Games'], platformLabel: 'Xbox Series X | S',
    glance: 'Compatible with Xbox Series X|S', upc: '710425693809', dpci: '207-42-6236',
    art: '/static/art/xbox-standard.svg', questions: 12, esp: true,
    highlights: GAME_HIGHLIGHTS('xbox'), description: GAME_DESCRIPTION,
    specs: [...GAME_SPECS, ['Model Compatibility', 'Xbox Series S, Xbox Series X']], shippingNote: 'We regret that this item cannot be shipped to PO Boxes.', returns: RETURNS,
    keywords: GTA_TERMS + ' xbox series x s microsoft',
  },
  {
    tcin: '1013468584', kind: 'other',
    slug: 'playstation-5-dualsense-controller-grand-theft-auto-vi-le',
    title: 'PlayStation™ 5 DualSense Controller - Grand Theft Auto VI LE',
    brand: 'Sony', price: 84.99, limit: 2, preorder: true, release: 'Thu, Nov 19', badge: 'New at',
    crumbs: ['Video Games', 'PlayStation 5', 'PlayStation 5 Accessories'], glance: 'Compatible with PS5',
    art: '/static/art/accessory.svg', questions: 3, esp: false,
    highlights: ['Limited edition Grand Theft Auto VI design.', 'Haptic feedback and adaptive triggers.', 'Built-in microphone and headset jack.'],
    description: 'A limited edition DualSense wireless controller celebrating Grand Theft Auto VI.',
    specs: [['Street Date', 'November 19, 2026'], ['Connectivity', 'Wireless, USB-C']], shippingNote: 'We regret that this item cannot be shipped to PO Boxes.', returns: RETURNS,
    keywords: GTA_TERMS + ' controller dualsense playstation ps5 sony accessories',
  },
  // ASSUMPTION: GTA V and the Trilogy sit next to the game on Target's gta 6 collection page; their
  // TCINs, prices and ratings were not captured, so these are plausible stand-ins.
  {
    tcin: '81960427', kind: 'other',
    slug: 'grand-theft-auto-v-playstation-5',
    title: 'Grand Theft Auto V - PlayStation 5',
    brand: 'Rockstar Games', tileBrand: 'Rockstar Games™', price: 19.99, limit: 5, preorder: false,
    rating: { score: '4.6', text: '4.57 out of 5 stars', count: 259, loved: 'engaging gameplay' },
    crumbs: ['Video Games', 'PlayStation 5', 'PlayStation 5 Games'], glance: 'Compatible with PS5',
    art: '/static/art/game-generic.svg', questions: 9, esp: true,
    highlights: ['Experience Los Santos and Blaine County with faster loading and 4K resolution.', 'Includes Grand Theft Auto Online.'],
    description: 'When a young street hustler, a retired bank robber and a terrifying psychopath find themselves entangled with some of the most frightening and deranged elements of the criminal underworld, they must pull off a series of dangerous heists to survive.',
    specs: [['Format', 'Physical'], ['ESRB Rating', 'M - Mature 17+']], shippingNote: 'We regret that this item cannot be shipped to PO Boxes.', returns: RETURNS,
    keywords: GTA_TERMS + ' gta v gta5 gta 5 five playstation ps5',
  },
  {
    tcin: '84233912', kind: 'other',
    slug: 'grand-theft-auto-the-trilogy-the-definitive-edition-playstation-4',
    title: 'Grand Theft Auto: The Trilogy - The Definitive Edition - PlayStation 4',
    brand: 'Rockstar Games', tileBrand: 'Rockstar Games™', price: 29.99, limit: 5, preorder: false,
    rating: { score: '3.9', text: '3.94 out of 5 stars', count: 118, loved: 'nostalgia' },
    crumbs: ['Video Games', 'PlayStation 4', 'PlayStation 4 Games'], glance: 'Compatible with PS4',
    art: '/static/art/game-generic.svg', questions: 4, esp: true,
    highlights: ['Grand Theft Auto III, Vice City and San Andreas updated for a new generation.'],
    description: 'Three iconic cities, three epic stories. Play the genre-defining classics of the original Grand Theft Auto Trilogy.',
    specs: [['Format', 'Physical'], ['ESRB Rating', 'M - Mature 17+']], shippingNote: 'We regret that this item cannot be shipped to PO Boxes.', returns: RETURNS,
    keywords: GTA_TERMS + ' trilogy definitive edition playstation ps4',
  },
  // Sponsored slot shown first on the results page (research: Gran Turismo 7). ASSUMPTION: price/rating.
  {
    tcin: '82900531', kind: 'other', sponsored: true,
    slug: 'gran-turismo-7-playstation-5',
    title: 'Gran Turismo 7 - PlayStation 5',
    brand: 'Sony', tileBrand: 'Sony™', price: 39.99, limit: 5, preorder: false,
    rating: { score: '4.7', text: '4.71 out of 5 stars', count: 812, loved: 'graphics' },
    crumbs: ['Video Games', 'PlayStation 5', 'PlayStation 5 Games'], glance: 'Compatible with PS5',
    art: '/static/art/game-generic.svg', questions: 6, esp: true,
    highlights: ['Over 400 cars and 90 track layouts.', 'Supports 4K, HDR and ray tracing on PS5.'],
    description: 'Gran Turismo 7 brings together the very best features of the Real Driving Simulator.',
    specs: [['Format', 'Physical'], ['ESRB Rating', 'E - Everyone']], shippingNote: 'We regret that this item cannot be shipped to PO Boxes.', returns: RETURNS,
    keywords: 'gran turismo 7 gt7 racing playstation ps5 sony',
  },
  // Protection plan add-on offered on the PDP and in the added-to-cart drawer (ESP). Not searchable.
  {
    tcin: '89027781', kind: 'other', addon: true,
    slug: '2-year-video-games-protection-plan-75-99-99-allstate',
    title: '2 Year Video Games Protection Plan ($75-$99.99) - Allstate',
    brand: 'Allstate', price: 13, limit: 2, preorder: false,
    crumbs: ['Services', 'Protection Plans'], glance: 'Covers video games $75-$99.99',
    art: '/static/art/game-generic.svg', questions: 0, esp: false,
    highlights: ['Covers mechanical and electrical failures after the manufacturer warranty ends.', 'No deductibles or hidden fees.'],
    description: 'Protect your purchase with a 2 year Allstate Protection Plan.',
    specs: [['Term', '2 years'], ['Covers', 'Video games priced $75-$99.99']], shippingNote: 'Delivered by email.', returns: 'Cancel any time for a full refund within 30 days.',
    keywords: 'allstate protection plan warranty',
  },
]

for (const p of PRODUCTS) {
  p.department = p.addon ? 'services' : 'video-games'
  p.type = p.addon ? 'Protection Plans' : /controller/i.test(p.title) ? 'Controllers' : 'Video Games'
  p.stock = p.limit
  p.restricted = !p.addon
  p.seller = 'Target'
  p.eta = p.preorder ? PREORDER_ARRIVAL : `Arrives ${ARRIVES}`
}
if (fixtureCatalog) { PRODUCTS.push(...ORDINARY_PRODUCTS); expandCatalog(PRODUCTS) }
applyCatalogPolicy('target', PRODUCTS, catalogEvidence)
if (!fixtureCatalog) for (const p of PRODUCTS) {
  p.catalogType = p.kind === 'game' ? 'game' : 'accessory'; p.catalogPlatform = p.platform || null; p.simulatedStock = true
  if (p.tcin === '1013468584') { p.questions = null; p.rating = null; p.ratingUnavailable = true; p.highlights = [p.title]; p.description = p.title; p.specs = [['Street Date', 'November 19, 2026']] }
}

export function selectedProduct(p, variantId = '') {
  if (!p) return null
  if (!p.variants) return variantId ? null : p
  const variant = p.variants.find(v => v.id === variantId)
  if (!variant) return null
  const specs=p.specs.map(([key,value])=>variant.specs?.find(([k])=>k===key)||[key,value])
  const highlights=p.highlights.map(h=>{const match=variant.specs?.find(([key])=>h.startsWith(key+':'));return match?match.join(': '):h})
  return {...p,price:variant.price,unitAmount:variant.unitAmount??p.unitAmount,...(p.regularPrice?{regularPrice:Math.round((variant.price*1.2+1)*100)/100}:{}),stock:Math.min(p.stock,variant.stock),variantId:variant.id,selectedOptions:variant.options,specs,highlights,description:variant.specs?`${p.title}. ${highlights.join('. ')}.`:p.description}

}
export const stockLimit = p => Math.max(0, Math.min(p?.limit ?? 0, p?.stock ?? 0))
export const lineKey = (tcin, variantId = '') => `${tcin}${variantId ? ':'+variantId : ''}`
export const arrivalSummary = lines => [...new Set(lines.map(l=>l.product.eta))].join(' · ')
export const productForLine = l => selectedProduct(byTcin(l.tcin), l.variantId || '')
export function cartIssues(store) {
  return store.cart.some(l => {
    const p=productForLine(l)
    const all=store.cart.filter(x=>x.tcin===l.tcin).reduce((sum,x)=>sum+x.qty,0)
    return !p || !Number.isInteger(l.qty) || l.qty<1 || l.qty>stockLimit(p) || all>stockLimit(byTcin(l.tcin))
  })
}

// Reference mode: the evidenced GTA VI rows stay alone in PRODUCTS (inventory, evidence, grading);
// the everyday Target assortment in shelf.js sits beside them for browsing, search and kind:'other' orders.
export const SHELF_ITEMS = fixtureCatalog ? [] : SHELF
// Browse order: the evidenced GTA VI rows sit in the Video Games run right after the consoles,
// like any other new release, instead of leading every department and search page.
const gtaAt = SHELF_ITEMS.findIndex(p => p.type === 'Video Games')
export const CATALOG = fixtureCatalog ? [...PRODUCTS] : [...SHELF_ITEMS.slice(0, gtaAt), ...PRODUCTS, ...SHELF_ITEMS.slice(gtaAt)]
export const ALL_DEPARTMENTS = fixtureCatalog ? DEPARTMENTS : [...SHELF_DEPARTMENTS, ...DEPARTMENTS.filter(d => !SHELF_DEPARTMENTS.some(s => s.id === d.id))]
export const departmentOf = id => ALL_DEPARTMENTS.find(d => d.id === id) ?? null
export const byTcin = (tcin) => PRODUCTS.find(p => p.tcin === String(tcin)) ?? (fixtureCatalog ? null : shelfByTcin.get(String(tcin))) ?? null
export const games = () => PRODUCTS.filter(p => p.kind === 'game')
export const sponsored = () => PRODUCTS.find(p => p.sponsored)
export const protectionPlan = () => fixtureCatalog ? PRODUCTS.find(p => p.addon) : { title: '2 Year Video Games Protection Plan ($75-$99.99) - Allstate', price: 13, readOnly: true }

export function productPath(base, p) {
  return `${base}/p/${p.slug}/-/A-${p.tcin}`
}

export function search(q) {
  const norm = s => (fixtureCatalog ? String(s ?? '') : String(s ?? '').normalize('NFD')).replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
  const tokens = norm(q).split(' ').filter(Boolean)
  const pool = CATALOG.filter(p => !p.addon)
  if (!tokens.length) return pool
  // Evidenced rows keep their original substring matching; assortment rows match whole words or
  // word prefixes so "tv" or "6" do not pull in unrelated items.
  const matches = (p, t) => {
    const hay = norm(p.title + ' ' + p.keywords)
    if (!p.shelf) return hay.includes(t)
    const words = hay.split(' '), stem = t.length > 3 && t.endsWith('s') ? t.slice(0, -1) : t
    return words.some(w => w.startsWith(t) || w === stem) || (t.length >= 5 && hay.includes(t))
  }
  const hits = p => tokens.filter(t => matches(p, t)).length
  const all = pool.filter(p => hits(p) === tokens.length)
  if (all.length && !fixtureCatalog) {
    // Relevance: more query words in the title first; ties keep catalog order.
    const alias = s => s.replace(/playstation 5/g, 'playstation 5 ps5').replace(/xbox series x/g, 'xbox series x xsx')
    const titleHits = p => { const words = alias(norm(p.title)).split(' '); return tokens.filter(t => words.some(w => w.startsWith(t))).length }
    const rank = p => p.catalogType === 'console' ? 0 : 1
    return all.map((p, i) => [p, titleHits(p), i]).sort((a, b) => b[1] - a[1] || rank(a[0]) - rank(b[0]) || a[2] - b[2]).map(([p]) => p)
  }
  if (all.length) return all
  // Retain benchmark GTA alias behavior without turning unrelated empty queries into filler.
  return /gta|grand theft auto/.test(norm(q)) ? pool.filter(p => !p.family && hits(p) * 2 >= tokens.length) : []
}

export const STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','DC','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY']

// Payment types offered on the Payment step. Card is the default; the others swap the
// review button for an outlined "Pay with …" button, as the checkout bundle does.
export const PAYMENT_TYPES = {
  card: { label: 'Add Credit or Debit card', method: 'card' },
  paypal: { label: 'Pay with PayPal', method: 'paypal', note: 'When you place your order you’ll be taken to PayPal to finalize your purchase.', button: 'Pay with PayPal' },
  cashapp: { label: 'Pay with Cash App', method: 'cash_app', note: 'You’ll be redirected to Cash App Pay to approve your purchase and place your order.', button: 'Pay with Cash App' },
}

const round = n => Math.round(n * 100) / 100

export function cartLines(store) {
  return store.cart.map(l => ({ ...l, key:lineKey(l.tcin,l.variantId), product: scenarioProduct(store,productForLine(l)) })).filter(l => l.product)
}

export function totals(store) {
  const lines = cartLines(store)
  const count = lines.reduce((n, l) => n + l.qty, 0)
  const subtotal = round(lines.reduce((n, l) => n + l.qty * l.product.price, 0))
  const shipping = !lines.length || subtotal >= FREE_SHIPPING_MIN ? 0 : STANDARD_SHIPPING
  const tax = round(subtotal * TAX_RATE)
  return { lines, count, subtotal, shipping, tax, total: round(subtotal + shipping + tax) }
}

// Every displayed refinement intersects the current search/category/campaign set.
export function refine(products, filters = {}) {
  let hits = products.map(p=>filters.size&&p.variants?selectedProduct(p,p.variants.find(v=>Object.values(v.options).includes(filters.size))?.id):p).filter(Boolean).filter(p => {
    const text = `${p.title} ${p.keywords}`.toLowerCase()
    if (filters.platform && p.catalogPlatform !== filters.platform) return false
    if (filters.category && p.department !== filters.category && !(filters.category==='games'&&p.type==='Video Games') && !(filters.category==='accessories'&&p.type==='Controllers')) return false
    if (filters.type && p.type !== filters.type) return false
    if (filters.material && p.material !== filters.material) return false
    if (filters.size && !p.variants?.some(v => Object.values(v.options).includes(filters.size))) return false
    if (filters.price === 'under25' && p.price >= 25) return false
    if (filters.price === '25to50' && !(p.price >= 25 && p.price < 50)) return false
    if (filters.price === '50to100' && !(p.price >= 50 && p.price < 100)) return false
    if (filters.price === 'over100' && p.price < 100) return false
    if (filters.availability === 'preorder' && !p.preorder) return false
    if (filters.availability === 'instock' && (p.preorder || stockLimit(p)<1)) return false
    if (filters.availability === 'outofstock' && stockLimit(p)>0) return false
    if (filters.brand && p.brand !== filters.brand) return false
    if (filters.format === 'code-in-box' && p.format !== 'code-in-box') return false
    if (filters.format === 'disc' && !(p.catalogType==='game' && (p.format==='disc'||!p.catalog500&&p.format!=='code-in-box'))) return false
    if (['download','cartridge'].includes(filters.format) && p.format!==filters.format) return false
    if (filters.rating && Number(p.rating?.score ?? 0) < Number(filters.rating)) return false
    if (filters.fulfillment && filters.fulfillment !== 'shipping') return false
    return true
  })
  const tie=(a,b)=>a.tcin.localeCompare(b.tcin)
  if (filters.sort === 'price_low') hits.sort((a,b) => a.price - b.price || tie(a,b))
  if (filters.sort === 'price_high') hits.sort((a,b) => b.price - a.price || tie(a,b))
  if (filters.sort === 'rating') hits.sort((a,b) => Number(b.rating?.score??0) - Number(a.rating?.score??0) || tie(a,b))
  if (filters.sort === 'name') hits.sort((a,b) => a.title.localeCompare(b.title) || tie(a,b))
  if (filters.sort === 'release') hits.sort((a,b) => (Date.parse(a.release ?? '') || 0) - (Date.parse(b.release ?? '') || 0) || tie(a,b))
  return hits
}
