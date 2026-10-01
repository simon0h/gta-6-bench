// Listings as they appear on bestbuy.com (research/bestbuy.md, 2026-09-29/30).
import { GAME } from '../../lib/catalog.js'

export const STORE_NAME = 'Compton' // store auto-picked from geolocation ("Your Store: Compton")
export const SHIP_ZIP = '90001'     // "FREE shipping to 90001" on the product page
// $8.60 estimated tax on $79.99 (10.75%, Compton CA) before any address is entered.
// ASSUMPTION: the real cart taxes each line by destination (store for pickup, ZIP for shipping); one flat rate keeps the clone simple.
export const TAX_RATE = 0.1075
export const RELEASE = { ship: '11/12/2026', play: '11/19/2026', playLong: 'Thursday, 11/19/26' }

const CODE_IN_BOX = 'This product will only contain a download code inside the box to support pre-load starting on November 12. A disc will not be included in the box.'
const ULTIMATE_NOTE = 'The Grand Theft Auto VI: Ultimate Edition Upgrade will also be available for Grand Theft Auto VI: Standard Edition owners to purchase separately at any time. Physical version buyers can upgrade at any point after their digital download code has been redeemed by purchasing the Ultimate Edition upgrade as a digital add-on through the PlayStation and Xbox storefronts.'

const GAME_ABOUT = [
  'Vice City, USA. Jason and Lucia have always known the deck is stacked against them. ' + GAME.description,
  CODE_IN_BOX,
  'Pre-order to receive the Vintage Vice City Pack.',
  ULTIMATE_NOTE,
]
const GAME_FEATURES = [
  { name: 'Download code', text: CODE_IN_BOX },
  { name: 'Pre order', text: 'Pre-order to receive the Vintage Vice City Pack.' },
  { name: 'Single player', text: 'Grand Theft Auto VI is a single-player experience.' },
]
const GAME_KEYWORDS = 'gta 6 gta6 gta vi gtavi grand theft auto 6 grand theft auto vi rockstar games pre-order preorder video games code in box'

export const PRODUCTS = [
  {
    id: 'JXHY5RW2JZ', sku: '6684968', kind: 'game', platform: 'ps5', edition: 'standard', format: 'code-in-box', rank: 3,
    slug: 'grand-theft-auto-vi-code-in-box-delivers-11-12-26-playable-11-19-26-playstation-5',
    title: 'Grand Theft Auto VI - (Code in Box, Delivers 11/12/26, Playable 11/19/26) - PlayStation 5',
    pageTitle: 'Grand Theft Auto VI (Code in Box, Delivers 11/12/26, Playable 11/19/26) PlayStation 5',
    platformLabel: 'PlayStation 5', badge: 'Best Selling', badgeIn: 'In PS5 Games',
    brand: 'Rockstar Games', publisher: 'Rockstar Games', price: 79.99, release: '11/12/2026', esrb: 'RP (Rating Pending)', rating: null,
    category: 'Physical Video Games', softwareFormat: 'Physical (Download Code Only)', art: '/static/art/ps5-standard.svg',
    preorder: true, finalSale: true, about: GAME_ABOUT, features: GAME_FEATURES,
    keywords: GAME_KEYWORDS + ' playstation ps5',
  },
  {
    id: 'JXHY5RKPCY', sku: '6684969', kind: 'game', platform: 'xbox', edition: 'standard', format: 'code-in-box', rank: 4,
    slug: 'grand-theft-auto-vi-code-in-box-delivers-11-12-26-playable-11-19-26-xbox-series-x-xbox-series-s',
    title: 'Grand Theft Auto VI - (Code in Box, Delivers 11/12/26, Playable 11/19/26) - XBOX Series X, XBOX Series S',
    pageTitle: 'Grand Theft Auto VI (Code in Box, Delivers 11/12/26, Playable 11/19/26) XBOX Series X, XBOX Series S',
    platformLabel: 'XBOX Series X / XBOX Series S', badge: 'Best Selling', badgeIn: 'In Xbox Series X|S Games', // ASSUMPTION: badge text for the Xbox listing was not captured
    brand: 'Rockstar Games', publisher: 'Rockstar Games', price: 79.99, release: '11/12/2026', esrb: 'RP (Rating Pending)', rating: null,
    category: 'Physical Video Games', softwareFormat: 'Physical (Download Code Only)', art: '/static/art/xbox-standard.svg',
    preorder: true, finalSale: true, about: GAME_ABOUT, features: GAME_FEATURES,
    keywords: GAME_KEYWORDS + ' xbox series x series s',
  },
  // Distractors the real search shows next to the game (kind: 'other'). Product ids / SKUs are made up (ASSUMPTION).
  {
    id: 'JXHZ2Q4V8N', sku: '6685012', kind: 'other', rank: 1,
    slug: 'grand-theft-auto-vi-the-album-best-buy-exclusive-clear-pink-with-purple-splatter-vinyl-includes-exclusive-12x24-poster',
    title: 'Grand Theft Auto VI: The Album - Best Buy Exclusive - Clear Pink with Purple Splatter Vinyl - Includes Exclusive 12x24 poster',
    pageTitle: 'Grand Theft Auto VI: The Album - Best Buy Exclusive Vinyl',
    badge: 'New!', brand: 'Rockstar Games', publisher: null, price: 49.98, release: '11/19/2026', esrb: null, rating: null,
    category: 'Vinyl Records', softwareFormat: 'VINYL', art: '/static/art/vinyl.svg', preorder: true, finalSale: false,
    about: ['The official Grand Theft Auto VI album on clear pink with purple splatter vinyl, exclusive to Best Buy, with an exclusive 12x24 poster.'],
    features: [{ name: 'Best Buy Exclusive', text: 'Clear pink with purple splatter vinyl pressing.' }, { name: 'Poster', text: 'Includes exclusive 12x24 poster.' }],
    keywords: 'gta 6 gta6 gta vi gtavi grand theft auto vi the album soundtrack music vinyl lp record pre-order preorder',
  },
  {
    id: 'JXHZ2Q4V9C', sku: '6685013', kind: 'other', rank: 2,
    slug: 'grand-theft-auto-vi-the-album-cd',
    title: 'Grand Theft Auto VI: The Album - CD',
    pageTitle: 'Grand Theft Auto VI: The Album - CD',
    badge: 'New!', brand: 'Rockstar Games', publisher: null, price: 17.98, release: '11/19/2026', esrb: null, rating: null,
    category: 'CDs', softwareFormat: 'CD', art: '/static/art/vinyl.svg', preorder: true, finalSale: false,
    about: ['The official Grand Theft Auto VI album on CD.'],
    features: [{ name: 'Format', text: 'Compact disc.' }],
    keywords: 'gta 6 gta6 gta vi gtavi grand theft auto vi the album soundtrack music cd pre-order preorder',
  },
  {
    id: 'JXHZ3P6L2D', sku: '6685140', kind: 'other', rank: 5,
    slug: 'sony-interactive-entertainment-dualsense-wireless-controller-grand-theft-auto-vi-limited-edition-for-ps5-pc-mac-mobile-white',
    title: 'Sony Interactive Entertainment - DualSense Wireless Controller – Grand Theft Auto VI Limited Edition for PS5, PC, Mac & Mobile - White',
    pageTitle: 'DualSense Wireless Controller – Grand Theft Auto VI Limited Edition - White',
    badge: null, brand: 'Sony Interactive Entertainment', publisher: null, price: 84.99, release: '11/19/2026', esrb: null, rating: null, // ASSUMPTION: price and date not in the research
    category: 'PS5 Controllers', softwareFormat: null, art: '/static/art/accessory.svg', preorder: true, finalSale: false,
    about: ['Limited edition Grand Theft Auto VI design in white. Haptic feedback, adaptive triggers, built-in microphone.'],
    features: [{ name: 'Limited edition', text: 'Grand Theft Auto VI design in white.' }, { name: 'Haptic feedback', text: 'Adaptive triggers and haptic feedback.' }],
    keywords: 'gta 6 gta6 gta vi gtavi grand theft auto vi dualsense wireless controller ps5 playstation sony limited edition pre-order preorder',
  },
  {
    id: 'J2G6Q8M4RV', sku: '6472245', kind: 'other', rank: 6,
    slug: 'grand-theft-auto-v-playstation-5',
    title: 'Grand Theft Auto V - PlayStation 5',
    pageTitle: 'Grand Theft Auto V PlayStation 5',
    badge: null, brand: 'Rockstar Games', publisher: 'Rockstar Games', price: 19.99, release: '03/15/2022', esrb: 'M (Mature 17+)', rating: { stars: 4.3, count: 64 }, // ASSUMPTION: price
    category: 'Physical Video Games', softwareFormat: 'Physical', art: '/static/art/game-generic.svg', preorder: false, finalSale: false,
    about: ['Experience the blockbuster Grand Theft Auto V on PlayStation 5 with new graphics modes and faster loading.'],
    features: [{ name: 'Physical disc', text: 'Disc included in the box.' }],
    keywords: 'gta 5 gta5 gta v gtav grand theft auto v five 6 vi gta 6 gta6 gta vi grand theft auto vi rockstar games playstation ps5 video games',
  },
]

export const byId = (id) => PRODUCTS.find(p => p.sku === String(id) || p.id === String(id)) ?? null
export const games = () => PRODUCTS.filter(p => p.kind === 'game')

// /product/<slug>/<productId>/sku/<skuId>, as on bestbuy.com.
export function productPath(base, p) {
  return `${base}/product/${p.slug}/${p.id}/sku/${p.sku}`
}

export function search(q) {
  const norm = s => String(s ?? '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
  const tokens = norm(q).split(' ').filter(Boolean)
  if (!tokens.length) return []
  return PRODUCTS
    .filter(p => { const hay = norm(p.title + ' ' + p.keywords); return tokens.every(t => hay.includes(t)) })
    .sort((a, b) => a.rank - b.rank)
}

export const STATES = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'AA', 'AE', 'AP', 'AS', 'GU', 'MP', 'PR', 'VI']

export const FULFILLMENT = {
  pickup: { id: 'pickup', label: 'Pickup', detail: 'Ready on Release Date', eta: 'Pickup on Release Date' },
  shipping: { id: 'shipping', label: 'Shipping', detail: 'Delivered on or shortly after Release Date', eta: 'Delivered on or shortly after Release Date' },
}

const round = n => Math.round(n * 100) / 100

export function cartLines(store) {
  return store.cart.map(l => ({ ...l, product: byId(l.pid) })).filter(l => l.product)
}

export function totals(store) {
  const lines = cartLines(store)
  const count = lines.reduce((n, l) => n + l.qty, 0)
  const subtotal = round(lines.reduce((n, l) => n + l.qty * l.product.price, 0))
  const tax = round(subtotal * TAX_RATE)
  const total = round(subtotal + tax)
  const hasPickup = lines.some(l => l.fulfillment === 'pickup')
  const hasShipping = lines.some(l => l.fulfillment === 'shipping')
  // Zip copy scales with the cart: 4 payments, or 8 once the order is large enough.
  const zip = total >= 200 ? { n: 8, amount: round(total / 8) } : { n: 4, amount: round(total / 4) }
  return { lines, count, subtotal, shipping: 0, pickupFee: 0, tax, total, hasPickup, hasShipping, zip }
}
