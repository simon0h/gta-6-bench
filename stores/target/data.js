// Listings as they appear on target.com (research/target.md and target.json, 2026-09-29/30).
import { GAME } from '../../lib/catalog.js'

// Header context that drives the Pickup / Delivery / Shipping tabs on the real site.
export const SHIP_ZIP = '95065'
export const STORE_LOCATION = 'Scotts Valley'
export const FREE_SHIPPING_MIN = 35   // "Ships free with $35 orders"
export const STANDARD_SHIPPING = 5.99 // under the threshold
// ASSUMPTION: one flat estimated-tax rate for the header ZIP 95065 (Scotts Valley, CA: 9.75%).
// The real cart re-estimates tax from the shipping address during checkout.
export const TAX_RATE = 0.0975
// Stock items on the results page showed "Shipping arrives Fri, Oct 2" on 2026-09-30.
export const ARRIVES = 'Fri, Oct 2'
export const PREORDER_ARRIVAL = 'Arrives on or shortly after release date'

const GTA_TERMS = 'gta 6 gta6 gta vi gtavi grand theft auto vi 6 six rockstar games video games preorder pre-order'

const GAME_HIGHLIGHTS = (platform) => [
  platform === 'ps5'
    ? 'This product will only contain a download code inside the box to support pre-load starting on November 12. A disc will not be included in the box. Code can only be used by users holding an account for PlayStation® registered to the US or Canada.'
    : 'This product will only contain a download code inside the box to support pre-load starting on November 12. A disc will not be included in the box.',
  'Pre-order to receive the Vintage Vice City Pack.',
  'Grand Theft Auto VI is a single-player experience.',
]
const GAME_DESCRIPTION = `Vice City, USA. Jason and Lucia have always known the deck is stacked against them. ${GAME.description}`
const GAME_SPECS = [['Format', 'Download Code in Box'], ['Street Date', 'November 12, 2026'], ['Multiplayer', 'Single Player Only'], ['ESRB Rating', 'RP - rating pending']]
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
    highlights: GAME_HIGHLIGHTS('ps5'), description: GAME_DESCRIPTION, specs: GAME_SPECS, shippingNote: NO_SHIP, returns: RETURNS,
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

export const byTcin = (tcin) => PRODUCTS.find(p => p.tcin === String(tcin)) ?? null
export const games = () => PRODUCTS.filter(p => p.kind === 'game')
export const sponsored = () => PRODUCTS.find(p => p.sponsored)
export const protectionPlan = () => PRODUCTS.find(p => p.addon)

export function productPath(base, p) {
  return `${base}/p/${p.slug}/-/A-${p.tcin}`
}

export function search(q) {
  const norm = s => String(s ?? '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
  const tokens = norm(q).split(' ').filter(Boolean)
  if (!tokens.length) return []
  const pool = PRODUCTS.filter(p => !p.sponsored && !p.addon)
  const hits = p => { const hay = norm(p.title + ' ' + p.keywords); return tokens.filter(t => hay.includes(t)).length }
  const all = pool.filter(p => hits(p) === tokens.length)
  // ASSUMPTION: Target's search is loose ("1,000+ results"): when no listing matches every word, show
  // the ones matching at least half of them, so "gta 6 ultimate edition" still lists the Standard game.
  return all.length ? all : pool.filter(p => hits(p) * 2 >= tokens.length)
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
  return store.cart.map(l => ({ ...l, product: byTcin(l.tcin) })).filter(l => l.product)
}

export function totals(store) {
  const lines = cartLines(store)
  const count = lines.reduce((n, l) => n + l.qty, 0)
  const subtotal = round(lines.reduce((n, l) => n + l.qty * l.product.price, 0))
  const shipping = !lines.length || subtotal >= FREE_SHIPPING_MIN ? 0 : STANDARD_SHIPPING
  const tax = round(subtotal * TAX_RATE)
  return { lines, count, subtotal, shipping, tax, total: round(subtotal + shipping + tax) }
}
