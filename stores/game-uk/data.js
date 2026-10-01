// Listings as they appear on game.co.uk (research/game-uk.md, 2026-09-29).
// GAME runs on the shared Frasers Group platform: each platform is its own
// 6-digit product code (plus an 8-digit "colcode" variant), the platform is
// shown as a "Colour"/Format swatch (PS5 / XBS) and every price includes VAT,
// so there is no separate tax line anywhere in the flow.

export const RELEASE_ISO = '2026-11-19'
export const RELEASE_TEXT = '19 November 2026'
export const RELEASE_SHORT = '19/11/26'
export const DISPATCH_TEXT = '18 November 2026' // the day before launch, when GAME dispatches pre-orders via Express Delivery

export const PREORDER_NOTICE_1 = 'This item is currently on pre-order and not available for immediate dispatch. This item will be available for delivery from:'
export const PREORDER_NOTICE_2 = 'If added to your bag, please note your entire order will be held until all items are available.'
export const PACK_TEXT = "Pre-order to receive the Vintage Vice City Pack. Flash back to when the neon burned brightest with the Vintage Vice City Pack, featuring the timeless two-tone '55 Vapid Stanier sedan and garage alongside the world-famous Ocean Beach, decadent outfits and hairstyles for both Jason and Lucia, and an iconic weapon pattern that echoes the excess of the past."
export const LEGAL_TEXT = 'LEGAL: Rockstar Games, Grand Theft Auto and related marks are trademarks of Take-Two Interactive Software, Inc. All other marks and trademarks are properties of their respective owners. Software licence terms apply.'

const gtaDescription = (platform) => [
  'This product will only contain a download code inside the box to support pre-load starting on November 12. A disc will not be included in the box.',
  ...(platform === 'ps5' ? ['Code is intended for use by users holding an account for PlayStation® registered to the United Kingdom. Attempts to use the code by an account registered in other countries might be unsuccessful.'] : []),
  PACK_TEXT,
  'Grand Theft Auto VI is a single-player experience.',
  'Vice City, USA. Jason and Lucia have always known the deck is stacked against them. But when an easy score goes wrong, they find themselves on the darkest side of the sunniest place in America, in the middle of a criminal conspiracy stretching across the state of Leonida.',
]

const GTA_KEYWORDS = 'gta 6 gta6 gta vi gtavi grand theft auto 6 six rockstar games pre-order preorder coming soon'

export const PRODUCTS = [
  {
    id: '756802', colcode: '75680269', kind: 'game', platform: 'ps5', edition: 'standard', format: 'code-in-box',
    slug: 'rockstar-games-grand-theft-auto-vi-756802', title: 'Grand Theft Auto VI', brand: 'Rockstar Games',
    price: 69.99, ticketPrice: 69.99, swatch: 'PS5', platformFacet: 'PS5', category: 'Video Games', style: 'Action / Adventure',
    badges: ['PRE-ORDER', 'TRENDING'], preorder: true, release: RELEASE_ISO, pegi: 18, carrier: 'Evri',
    crumbs: ['PlayStation Gaming', 'PlayStation Games', 'Coming Soon'],
    art: '/static/art/ps5-standard.svg', artAlt: 'PS5 - Rockstar Games - Grand Theft Auto VI',
    description: gtaDescription('ps5'),
    keywords: `${GTA_KEYWORDS} playstation ps5 video games`,
  },
  {
    id: '400064', colcode: '40006469', kind: 'game', platform: 'xbox', edition: 'standard', format: 'code-in-box',
    slug: 'rockstar-games-grand-theft-auto-vi-400064', title: 'Grand Theft Auto VI', brand: 'Rockstar Games',
    price: 69.99, ticketPrice: 69.99, swatch: 'XBS', platformFacet: 'Xbox', category: 'Video Games', style: 'Action / Adventure',
    badges: ['PRE-ORDER'], preorder: true, release: RELEASE_ISO, pegi: 18, carrier: 'Evri',
    crumbs: ['Xbox Gaming', 'Xbox Games', 'Coming Soon'],
    art: '/static/art/xbox-standard.svg', artAlt: 'XBS - Rockstar Games - Grand Theft Auto VI',
    description: gtaDescription('xbox'),
    keywords: `${GTA_KEYWORDS} xbox series x xbs video games`,
  },
  // Distractors the real search shows next to the game (kind: 'other').
  // The research's Platform facet reads "PS5 1, Xbox 1" for 8 results, so the GTA V
  // listings carry no platform facet value (only the GTA VI listings are counted).
  {
    id: '271604', colcode: '27160469', kind: 'other',
    slug: 'rockstar-games-grand-theft-auto-v-271604', title: 'Grand Theft Auto V', brand: 'Rockstar Games',
    price: 17.99, ticketPrice: 29.99, swatch: 'PS5', platformFacet: null, category: 'Video Games', style: 'Action / Adventure',
    badges: ['UP TO 50% OFF'], preorder: false, release: '2022-03-15', pegi: 18, carrier: 'Evri',
    crumbs: ['PlayStation Gaming', 'PlayStation Games'],
    art: '/static/art/game-generic.svg', artAlt: 'PS5 - Rockstar Games - Grand Theft Auto V',
    description: ['Experience Los Santos and Blaine County in the PlayStation 5 version of Grand Theft Auto V, with new graphics modes, faster loading and GTA Online included.', 'Disc included.'],
    keywords: 'gta 5 gta5 gta v gtav five grand theft auto rockstar games playstation ps5 video games gta 6 gta vi',
  },
  {
    id: '271605', colcode: '27160569', kind: 'other',
    slug: 'rockstar-games-grand-theft-auto-v-271605', title: 'Grand Theft Auto V', brand: 'Rockstar Games',
    price: 17.99, ticketPrice: 29.99, swatch: 'XBS', platformFacet: null, category: 'Video Games', style: 'Action / Adventure',
    badges: ['UP TO 50% OFF'], preorder: false, release: '2022-03-15', pegi: 18, carrier: 'Evri',
    crumbs: ['Xbox Gaming', 'Xbox Games'],
    art: '/static/art/game-generic.svg', artAlt: 'XBS - Rockstar Games - Grand Theft Auto V',
    description: ['Experience Los Santos and Blaine County in the Xbox Series X|S version of Grand Theft Auto V, with new graphics modes, faster loading and GTA Online included.', 'Disc included.'],
    keywords: 'gta 5 gta5 gta v gtav five grand theft auto rockstar games xbox series x xbs video games gta 6 gta vi',
  },
  {
    id: '905117', colcode: '90511769', kind: 'other', digital: true,
    slug: 'rockstar-games-gta-online-great-white-shark-cash-card-905117', title: 'GTA Online: Great White Shark Cash Card (Xbox)', brand: 'Rockstar Games',
    price: 15.99, ticketPrice: 15.99, swatch: 'Digital', platformFacet: null, category: 'Digital Downloads', style: 'Currency and Subscriptions',
    badges: ['FAST FREE DELIVERY'], preorder: false, release: null, pegi: 18, carrier: 'email',
    crumbs: ['Digital Downloads', 'Currency & Subscriptions'],
    art: '/static/art/game-generic.svg', artAlt: 'Digital - Rockstar Games - GTA Online: Great White Shark Cash Card',
    description: ['Adds GTA$1,250,000 to your GTA Online account (Xbox). Your code is delivered by email.'],
    keywords: 'gta online shark cash card great white grand theft auto rockstar games digital download xbox gta 6 gta vi',
  },
  {
    id: '905118', colcode: '90511869', kind: 'other', digital: true,
    slug: 'rockstar-games-gta-online-megalodon-shark-cash-card-905118', title: 'GTA Online: Megalodon Shark Cash Card (PlayStation)', brand: 'Rockstar Games',
    price: 64.99, ticketPrice: 64.99, swatch: 'Digital', platformFacet: null, category: 'Digital Downloads', style: 'Currency and Subscriptions',
    badges: ['FAST FREE DELIVERY'], preorder: false, release: null, pegi: 18, carrier: 'email',
    crumbs: ['Digital Downloads', 'Currency & Subscriptions'],
    art: '/static/art/game-generic.svg', artAlt: 'Digital - Rockstar Games - GTA Online: Megalodon Shark Cash Card',
    description: ['Adds GTA$8,000,000 to your GTA Online account (PlayStation). Your code is delivered by email.'],
    keywords: 'gta online shark cash card megalodon grand theft auto rockstar games digital download playstation ps5 gta 6 gta vi',
  },
  {
    id: '813570', colcode: '81357069', kind: 'other',
    slug: 'sony-dualsense-wireless-controller-grand-theft-auto-vi-limited-edition-813570', title: 'DualSense Wireless Controller - Grand Theft Auto VI Limited Edition', brand: 'Sony',
    price: 74.99, ticketPrice: 74.99, swatch: 'White', platformFacet: null, category: 'Unclassified', style: null,
    badges: ['PRE-ORDER'], preorder: true, release: RELEASE_ISO, pegi: null, carrier: 'Evri',
    crumbs: ['PlayStation Gaming', 'PlayStation Accessories', 'Coming Soon'],
    art: '/static/art/accessory.svg', artAlt: 'PS5 - Sony - DualSense Wireless Controller - Grand Theft Auto VI Limited Edition',
    description: ['Limited edition Grand Theft Auto VI design in white.', 'Haptic feedback, adaptive triggers, built-in microphone and headset jack.', 'Controller only. Game not included.'],
    keywords: `${GTA_KEYWORDS} controller dualsense sony playstation ps5 accessories`,
  },
  {
    id: '813571', colcode: '81357169', kind: 'other',
    slug: 'rockstar-games-grand-theft-auto-vi-the-album-2x-lp-813571', title: 'Grand Theft Auto VI: The Album (Original Soundtrack) 2x LP', brand: 'Rockstar Games',
    price: 39.99, ticketPrice: 39.99, swatch: 'Black', platformFacet: null, category: 'Unclassified', style: null,
    badges: ['PRE-ORDER'], preorder: true, release: RELEASE_ISO, pegi: null, carrier: 'Evri',
    crumbs: ['Tech', 'Vinyl', 'Coming Soon'],
    art: '/static/art/vinyl.svg', artAlt: 'Vinyl - Rockstar Games - Grand Theft Auto VI: The Album 2x LP',
    description: ['Double LP pressing of the official soundtrack.', 'Gatefold sleeve. Game not included.'],
    keywords: `${GTA_KEYWORDS} album soundtrack vinyl lp music merchandise`,
  },
]

export const byId = (id) => PRODUCTS.find(p => p.id === String(id)) ?? null

// The real URL is /{brand}-{name}-{6-digit code}#colcode={8-digit variant}. Anything
// ending in a known 6-digit code resolves (the site redirects to the canonical slug).
export function bySlug(slug) {
  const m = /(\d{6})$/.exec(String(slug ?? ''))
  return m ? byId(m[1]) : null
}

export const productPath = (base, p) => `${base}/${p.slug}`
export const productHref = (base, p) => `${base}/${p.slug}#colcode=${p.colcode}`

// Top-level nav department for each breadcrumb root, so the header nav and breadcrumb
// links (which run a search here) land on the products that live under them.
// ASSUMPTION: GAME files Shark Cash Cards under "Digital Gift Cards" in the nav.
const DEPT = { 'PlayStation Gaming': 'Consoles & Video Games', 'Xbox Gaming': 'Consoles & Video Games', 'Digital Downloads': 'Digital Gift Cards', Tech: 'Tech' }

export function search(q, { platform, category } = {}) {
  const norm = s => String(s ?? '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
  const tokens = norm(q).split(' ').filter(Boolean)
  if (!tokens.length) return []
  return PRODUCTS.filter(p => {
    const hay = norm(`${p.brand} ${p.title} ${p.keywords} ${p.crumbs.join(' ')} ${DEPT[p.crumbs[0]] ?? ''} ${p.category} ${p.style ?? ''}`)
    return tokens.every(t => hay.includes(t)) && (!platform || p.platformFacet === platform) && (!category || p.category === category)
  })
}

// "Sort By" options in the order the real toolbar lists them; 'popular' keeps listing order.
const discount = p => p.ticketPrice - p.price
export const SORTS = [
  { key: 'popular', label: 'Most Popular', cmp: null },
  { key: 'new', label: 'New In', cmp: (a, b) => String(b.release ?? '').localeCompare(String(a.release ?? '')) },
  { key: 'discount-value', label: 'Discount £ GBP (High to Low)', cmp: (a, b) => discount(b) - discount(a) },
  { key: 'discount-pct', label: 'Discount % (High To Low)', cmp: (a, b) => discount(b) / b.ticketPrice - discount(a) / a.ticketPrice },
  { key: 'price-asc', label: 'Price (Low To High)', cmp: (a, b) => a.price - b.price },
  { key: 'price-desc', label: 'Price (High To Low)', cmp: (a, b) => b.price - a.price },
  { key: 'brand-asc', label: 'Brand (A To Z)', cmp: (a, b) => a.brand.localeCompare(b.brand) },
  { key: 'brand-desc', label: 'Brand (Z To A)', cmp: (a, b) => b.brand.localeCompare(a.brand) },
]
export function sortProducts(products, key) {
  const s = SORTS.find(x => x.key === key)
  return s?.cmp ? [...products].sort(s.cmp) : products
}

export const PRICE_BANDS = [
  { label: '£10 to £20', min: 10, max: 20 },
  { label: '£20 to £50', min: 20, max: 50 },
  { label: '£50 to £100', min: 50, max: 100 },
]

export function facets(products) {
  // Values listed by count, then name ("Video Games (4), Digital Downloads (2), Unclassified (2)"), whatever the sort order.
  const count = (key) => Object.fromEntries(Object.entries(products.reduce((acc, p) => { const v = p[key]; if (v) acc[v] = (acc[v] ?? 0) + 1; return acc }, {}))
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])))
  return {
    platform: count('platformFacet'),
    category: count('category'),
    style: count('style'),
    price: PRICE_BANDS.map(b => ({ ...b, n: products.filter(p => p.price >= b.min && p.price < b.max).length })).filter(b => b.n),
  }
}

// Delivery services from GAME's help centre "Delivery Options" table and the PDP
// "Delivery & Returns" accordion. Prices include VAT.
export const DELIVERY_METHODS = {
  standard: { id: 'standard', name: 'Standard Delivery', detail: 'Delivered within 3 - 7 days (excludes Public holidays).', price: 4.99, eta: '3 - 7 days', method: 'ship' },
  express: { id: 'express', name: 'Express Delivery - 48 Hours', detail: 'Order before 9pm (excludes Public holidays)', price: 7.99, eta: '48 hours', method: 'ship' },
  'nextday-evri': { id: 'nextday-evri', name: 'Next Day Delivery by Evri', detail: 'Order by 9pm for Next Day Delivery', price: 9.99, eta: 'Next day', method: 'ship' },
  'nextday-dpd': { id: 'nextday-dpd', name: 'Next Day Delivery by DPD', detail: 'Order by 9pm (excludes Public holidays)', price: 11.99, eta: 'Next day', method: 'ship' },
  collect: { id: 'collect', name: 'Click & Collect (Store Delivery)', detail: 'Delivered to your chosen store within 3 - 7 days.', price: 4.99, eta: '3 - 7 days to store', method: 'pickup' },
}
export const INTERNATIONAL_DELIVERY = { name: 'International Delivery', detail: 'International Delivery is available for this product. The cost and delivery time depend on the country.' }
// Order the PDP accordion lists them in (research/game-uk.md §3).
export const PDP_DELIVERY_ORDER = ['nextday-evri', 'nextday-dpd', 'express', 'standard']
// Order the checkout radios list them in (cheapest first, preselected).
export const CHECKOUT_DELIVERY_ORDER = ['standard', 'express', 'nextday-evri', 'nextday-dpd', 'collect']

// ASSUMPTION: GAME's remaining stores are concessions inside Frasers Group shops;
// the real picker is a postcode search. A short fixed list stands in for it.
export const COLLECT_STORES = [
  'GAME Birmingham - Sports Direct, Bullring',
  'GAME Cardiff - Sports Direct, St David\'s',
  'GAME Glasgow - Sports Direct, Argyle Street',
  'GAME Leeds - Sports Direct, Trinity Leeds',
  'GAME London - Sports Direct, Oxford Street',
  'GAME Manchester - Sports Direct, Arndale',
]

export const TITLES = ['Mr', 'Mrs', 'Miss', 'Ms', 'Mx', 'Dr']

export const MAX_QTY = 99 // "Quantity default 1, max 99 per item" (terms)

const round = n => Math.round(n * 100) / 100

export function cartLines(store) {
  return store.cart.map(l => ({ ...l, product: byId(l.pid) })).filter(l => l.product)
}

export const hasPreorder = (store) => cartLines(store).some(l => l.product.preorder)

// Delivery is only added at the checkout delivery step; the bag shows items + discount only.
export function totals(store, deliveryId = null) {
  const lines = cartLines(store)
  const count = lines.reduce((n, l) => n + l.qty, 0)
  const subtotal = round(lines.reduce((n, l) => n + l.qty * l.product.price, 0))
  const delivery = DELIVERY_METHODS[deliveryId]?.price ?? 0
  return { lines, count, subtotal, discount: 0, delivery, total: round(subtotal + delivery) }
}

// "49 days 22 hours left to pre-order" (live countdown on the PDP).
export function countdown(now = Date.now()) {
  const ms = new Date(`${RELEASE_ISO}T00:00:00Z`).getTime() - now
  if (ms <= 0) return null
  const days = Math.floor(ms / 86400000)
  const hours = Math.floor((ms % 86400000) / 3600000)
  return `${days} days ${hours} hours left to pre-order`
}
