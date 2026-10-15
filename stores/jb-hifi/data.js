import { fixtureCatalog, applyCatalogPolicy } from '../../lib/catalog-policy.js'
import { CATALOG_EVIDENCE } from './catalog-evidence.js'
import { expandJB } from './expansion.js'
import { enrichProducts, filterCatalog, selectedProduct } from './catalog.js'
import { SHELF } from './shelf.js'
// Listings as they appear on jbhifi.com.au (research/jb-hifi.md, 2026-09-29).
// JB sells both GTA VI listings as "Code in Box" at A$129 (below the A$129.95 RRP); prices include GST.

const RELEASE = '19 Nov 26'
const RELEASE_LONG = '19 Nov 2026'
// "Available 19 November. Pick up your copy instore to preload from 12 November." / "Delivery and pickup starts November 12"
const PRELOAD_FROM = '12 Nov 2026'

const NOTICE = (tos) => [
  'No Disc Included (Code in Box).',
  'Choose carefully as we do not accept change of mind returns for video games distributed by digital redemption code.',
  `Download Code is single-use, non-transferable and subject to Rockstar Games, and ${tos} Terms of Service.`,
  'Available 19 November. Pick up your copy instore to preload from 12 November.',
]

const GAME_DESCRIPTION = (platformName) => [
  'Delivery and pickup starts November 12, allowing the game to be downloaded and installed in advance. Grand Theft Auto VI is releasing and becomes playable on November 19.',
  `This box contains a download code (no disc). The ${platformName} version can only be used by users holding an account for ${platformName === 'PlayStation 5' ? 'PlayStation®' : 'Xbox'} registered to Australia.`,
  'Grand Theft Auto VI is a single-player experience.',
  'Vice City, USA. Jason and Lucia have always known the deck is stacked against them. But when an easy score goes wrong, they find themselves on the darkest side of the sunniest place in America, in the middle of a criminal conspiracy stretching across the state of Leonida — forced to rely on each other more than ever if they want to make it out alive.',
]

export const PREORDER_BONUS = {
  heading: "DON'T MISS OUT ON THIS!",
  title: 'Pre-Order DLC!',
  text: 'Flash back to when the neon burned brightest with the Vintage Vice City Pack, featuring the timeless two-tone ’55 Vapid Stanier sedan and garage alongside the world-famous Ocean Beach, decadent outfits and hairstyles for both Jason and Lucia, and an iconic weapon pattern that echoes the excess of the past.',
  ends: 'Offer ends 18 Nov 2026',
}

export const PRODUCTS = [
  {
    id: '903000', kind: 'game', platform: 'ps5', edition: 'standard', format: 'code-in-box',
    slug: 'playstation-5-grand-theft-auto-vi', title: 'Grand Theft Auto VI', subtitle: 'PlayStation 5',
    platformName: 'PlayStation 5', variantLabel: 'PS5', model: '5026555439930',
    crumbs: ['Gaming', 'PlayStation', 'PS5 games'],
    price: 129.00, deliveryFrom: null, badges: ['PRE-ORDER', 'PRE-ORDER DLC'], cta: 'Pre-order', orderable: true,
    release: RELEASE, releaseLong: RELEASE_LONG, preloadFrom: PRELOAD_FROM, rating: 'CTC',
    art: '/static/art/ps5-standard.svg', notice: NOTICE('PlayStation'), description: GAME_DESCRIPTION('PlayStation 5'),
    specs: [['Genre', 'Action & Adventure'], ['Rating', 'CTC'], ['Consumer Advice', 'CTC'], ['Game developer', 'Rockstar Games'], ['Game publisher', 'Rockstar Games'], ['Console compatibility', 'PlayStation 5']],
    keywords: 'gta 6 gta6 gta vi gtavi grand theft auto 6 six rockstar games pre-order preorder playstation ps5 video games gaming',
  },
  {
    id: '903001', kind: 'game', platform: 'xbox', edition: 'standard', format: 'code-in-box',
    slug: 'xbox-series-x-grand-theft-auto-vi', title: 'Grand Theft Auto VI', subtitle: 'Xbox Series X',
    platformName: 'Xbox Series X', variantLabel: 'XBOX', model: '5026555370219',
    crumbs: ['Gaming', 'Xbox', 'Xbox Series X|S games'],
    price: 129.00, deliveryFrom: null, badges: ['PRE-ORDER', 'PRE-ORDER DLC'], cta: 'Pre-order', orderable: true,
    release: RELEASE, releaseLong: RELEASE_LONG, preloadFrom: PRELOAD_FROM, rating: 'CTC',
    art: '/static/art/xbox-standard.svg', notice: NOTICE('Xbox'), description: GAME_DESCRIPTION('Xbox Series X'),
    specs: [['Genre', 'Action & Adventure'], ['Rating', 'CTC'], ['Consumer Advice', 'CTC'], ['Game developer', 'Rockstar Games'], ['Game publisher', 'Rockstar Games'], ['Console compatibility', 'Xbox Series X|S']],
    keywords: 'gta 6 gta6 gta vi gtavi grand theft auto 6 six rockstar games pre-order preorder xbox series x video games gaming',
  },
  // ---- distractors the real search shows next to the game (SKUs not observed; ASSUMPTION: plausible 6-digit JB SKUs) ----
  {
    id: '903002', kind: 'other', slug: 'grand-theft-auto-vi-the-goodtime-state-vice-city-collection',
    title: 'Grand Theft Auto VI: The Goodtime State – Vice City Collection', subtitle: 'Grand Theft Auto VI',
    crumbs: ['Gaming', 'Merchandise'], price: 699.00, deliveryFrom: 22.99,
    badges: ['COMING SOON', 'JB PERKS EXCLUSIVE', 'ONLINE ONLY'], cta: 'Coming soon', orderable: false,
    release: RELEASE, releaseLong: RELEASE_LONG, rating: null, art: '/static/art/game-generic.svg',
    notice: ['JB Perks exclusive. Coming soon — not yet available to order.'],
    description: ['The Goodtime State – Vice City Collection. Full contents to be announced.'], specs: [['Game publisher', 'Rockstar Games']],
    keywords: 'gta 6 gta6 gta vi gtavi grand theft auto 6 six vice city collection goodtime state collector rockstar games',
  },
  {
    id: '903005', kind: 'other', slug: 'ps5-playstation-5-dualsense-wireless-controller-grand-theft-auto-vi-white-limited-edition',
    title: 'PS5 PlayStation 5 DualSense Wireless Controller Grand Theft Auto VI White Limited Edition', subtitle: 'PlayStation 5',
    crumbs: ['Gaming', 'PlayStation', 'PS5 accessories'], price: 134.00, deliveryFrom: null,
    badges: ['PRE-ORDER', 'ONLINE ONLY'], cta: 'Pre-order', orderable: true,
    release: RELEASE, releaseLong: RELEASE_LONG, rating: null, art: '/static/art/accessory.svg',
    notice: ['Online only. Not available for Click & Collect.'],
    description: ['Limited edition Grand Theft Auto VI design in white.', 'Haptic feedback and adaptive triggers. Built-in microphone and headset jack.'],
    specs: [['Brand', 'Sony'], ['Console compatibility', 'PlayStation 5']],
    keywords: 'gta 6 gta6 gta vi gtavi grand theft auto 6 controller dualsense sony playstation ps5 accessories gaming pre-order',
  },
  {
    id: '903020', kind: 'other', slug: 'grand-theft-auto-vi-the-album-original-soundtrack-cd',
    title: 'Grand Theft Auto VI: The Album (Original Soundtrack)', subtitle: 'CD',
    crumbs: ['Music', 'CDs'], price: 36.99, deliveryFrom: 4.99, badges: ['PRE-ORDER'], cta: 'Pre-order', orderable: true,
    release: RELEASE, releaseLong: RELEASE_LONG, rating: null, art: '/static/art/vinyl.svg',
    notice: [], description: ['The official soundtrack to Grand Theft Auto VI on CD.'], specs: [['Primary Format - Music', 'CD']],
    keywords: 'gta 6 gta6 gta vi gtavi grand theft auto 6 album soundtrack music cd various artists pre-order',
  },
  {
    id: '903021', kind: 'other', slug: 'grand-theft-auto-vi-the-album-original-soundtrack-vinyl',
    title: 'Grand Theft Auto VI: The Album (Original Soundtrack)', subtitle: 'Vinyl',
    crumbs: ['Music', 'Vinyl'], price: 120.00, deliveryFrom: null, badges: ['PRE-ORDER'], cta: 'Pre-order', orderable: true,
    release: RELEASE, releaseLong: RELEASE_LONG, rating: null, art: '/static/art/vinyl.svg',
    notice: [], description: ['The official soundtrack to Grand Theft Auto VI on 2x LP vinyl.'], specs: [['Primary Format - Music', 'Vinyl']],
    keywords: 'gta 6 gta6 gta vi gtavi grand theft auto 6 album soundtrack music vinyl lp various artists pre-order',
  },
  {
    id: '903022', kind: 'other', slug: 'grand-theft-auto-vi-the-album-original-soundtrack-pink-blue-vinyl-jb-exclusive',
    title: 'Grand Theft Auto VI: The Album (Original Soundtrack) (Pink & Blue Vinyl)', subtitle: 'Vinyl',
    crumbs: ['Music', 'Vinyl'], price: 140.00, deliveryFrom: 9.99, badges: ['PRE-ORDER', 'JB EXCLUSIVE'], cta: 'Pre-order', orderable: true,
    release: RELEASE, releaseLong: RELEASE_LONG, rating: null, art: '/static/art/vinyl.svg',
    notice: [], description: ['JB Hi-Fi exclusive pink and blue coloured 2x LP pressing of the official soundtrack.'], specs: [['Primary Format - Music', 'Vinyl']],
    keywords: 'gta 6 gta6 gta vi gtavi grand theft auto 6 album soundtrack music vinyl lp exclusive coloured pre-order',
  },
  {
    // ASSUMPTION: the real search returned 20 results; the released GTA V listing is the obvious extra one.
    id: '569900', kind: 'other', slug: 'playstation-5-grand-theft-auto-v',
    title: 'Grand Theft Auto V', subtitle: 'PlayStation 5',
    crumbs: ['Gaming', 'PlayStation', 'PS5 games'], price: 49.00, deliveryFrom: 4.99, badges: [], cta: 'Add to cart', orderable: true,
    release: '15 Mar 22', releaseLong: '15 Mar 2022', rating: 'R18+', stars: '4.3', reviews: 24, art: '/static/art/game-generic.svg',
    notice: [], description: ['Experience Los Santos and Blaine County in the PlayStation 5 version of Grand Theft Auto V, with GTA Online included.'],
    specs: [['Genre', 'Action & Adventure'], ['Rating', 'R18+'], ['Game publisher', 'Rockstar Games'], ['Console compatibility', 'PlayStation 5']],
    keywords: 'gta 5 gta5 gta v gtav grand theft auto five rockstar games playstation ps5 video games gaming',
  },
  // ---- "Frequently bought together" / "Enhance your product" items (from the PDP carousel in the research) ----
  {
    id: '650331', kind: 'other', slug: 'ps5-dualsense-edge-wireless-controller', title: 'PS5 DualSense Edge Wireless Controller', subtitle: 'PlayStation 5',
    crumbs: ['Gaming', 'PlayStation', 'PS5 accessories'], price: 329.00, deliveryFrom: null, badges: [], cta: 'Add to cart', orderable: true,
    release: null, releaseLong: null, rating: null, stars: '4.6', reviews: 112, art: '/static/art/accessory.svg', upsell: true,
    notice: [], description: ['Ultra-customisable pro controller with swappable stick modules and back buttons.'], specs: [['Brand', 'Sony']],
    keywords: 'dualsense edge controller sony playstation ps5 accessories',
  },
  {
    id: '650332', kind: 'other', slug: 'playstation-5-marvels-wolverine', title: "Marvel's Wolverine", subtitle: 'PlayStation 5',
    crumbs: ['Gaming', 'PlayStation', 'PS5 games'], price: 109.00, deliveryFrom: 4.99, badges: [], cta: 'Add to cart', orderable: true,
    release: null, releaseLong: null, rating: 'MA15+', stars: '4.8', reviews: 57, art: '/static/art/game-generic.svg', upsell: true,
    notice: [], description: ['Insomniac Games brings Wolverine to PlayStation 5.'], specs: [['Genre', 'Action & Adventure']],
    keywords: 'marvel wolverine insomniac playstation ps5 video games',
  },
  {
    id: '650333', kind: 'other', slug: 'playstation-5-nba-2k27', title: 'NBA 2K27', subtitle: 'PlayStation 5',
    crumbs: ['Gaming', 'PlayStation', 'PS5 games'], price: 99.00, deliveryFrom: 4.99, badges: [], cta: 'Add to cart', orderable: true,
    release: null, releaseLong: null, rating: 'G', stars: '3.9', reviews: 41, art: '/static/art/game-generic.svg', upsell: true,
    notice: [], description: ['The latest NBA 2K on PlayStation 5.'], specs: [['Genre', 'Sports']],
    keywords: 'nba 2k27 basketball 2k sports playstation ps5 video games',
  },
  {
    id: '650334', kind: 'other', slug: 'ps5-dualsense-charging-station', title: 'PS5 DualSense Charging Station', subtitle: 'PlayStation 5',
    crumbs: ['Gaming', 'PlayStation', 'PS5 accessories'], price: 49.00, deliveryFrom: null, badges: [], cta: 'Add to cart', orderable: true,
    release: null, releaseLong: null, rating: null, stars: '4.7', reviews: 203, art: '/static/art/accessory.svg', upsell: true,
    notice: [], description: ['Charge two DualSense controllers at once.'], specs: [['Brand', 'Sony']],
    keywords: 'dualsense charging station dock sony playstation ps5 accessories',
  },
]


// Department breadth fixtures: categories observed on the official homepage; SKUs, stock and prices simulated.
PRODUCTS.push(...[{"id": "991101", "kind": "other", "slug": "sony-wireless-noise-cancelling-headphones", "title": "Sony Wireless Noise Cancelling Headphones", "subtitle": "Headphones & Audio", "crumbs": ["Headphones & Audio"], "price": 149, "deliveryFrom": null, "badges": [], "cta": "Add to cart", "orderable": true, "release": null, "releaseLong": null, "rating": null, "art": "/jb-hifi/static/catalog-headphones.svg", "notice": [], "description": ["Over-ear wireless headphones with active noise cancellation and a rechargeable battery."], "specs": [["Brand", "Sony"], ["Category", "Headphones & Audio"]], "keywords": "headphones audio sony music"}, {"id": "991102", "kind": "other", "slug": "samsung-55-inch-4k-smart-tv", "title": "Samsung 55-inch 4K Smart TV", "subtitle": "TVs & Home Theatre", "crumbs": ["TVs & Home Theatre"], "price": 699, "deliveryFrom": null, "badges": [], "cta": "Add to cart", "orderable": true, "release": null, "releaseLong": null, "rating": null, "art": "/jb-hifi/static/catalog-laptop.svg", "notice": [], "description": ["A 55-inch 4K television with smart streaming apps. Internet connection and subscriptions may be required."], "specs": [["Brand", "Samsung"], ["Category", "TVs & Home Theatre"]], "keywords": "tv television home theatre samsung"}, {"id": "991103", "kind": "other", "slug": "lenovo-14-inch-everyday-laptop", "title": "Lenovo 14-inch Everyday Laptop", "subtitle": "Computers & Tablets", "crumbs": ["Computers & Tablets"], "price": 649, "deliveryFrom": null, "badges": [], "cta": "Add to cart", "orderable": true, "release": null, "releaseLong": null, "rating": null, "art": "/jb-hifi/static/catalog-laptop.svg", "notice": [], "description": ["A portable 14-inch notebook for everyday study, browsing and productivity."], "specs": [["Brand", "Lenovo"], ["Category", "Computers & Tablets"]], "keywords": "computer laptop tablet lenovo"}, {"id": "991104", "kind": "other", "slug": "russell-hobbs-1.7l-kettle", "title": "Russell Hobbs 1.7L Kettle", "subtitle": "Home Appliances", "crumbs": ["Home Appliances"], "price": 49, "deliveryFrom": null, "badges": [], "cta": "Add to cart", "orderable": true, "release": null, "releaseLong": null, "rating": null, "art": "/jb-hifi/static/catalog-kettle.svg", "notice": [], "description": ["Cordless kettle with a removable filter and water-level window."], "specs": [["Brand", "Russell Hobbs"], ["Category", "Home Appliances"]], "keywords": "kitchen home appliances kettle"}, {"id": "991105", "kind": "other", "slug": "lego-classic-creative-bricks", "title": "LEGO Classic Creative Bricks", "subtitle": "Collectibles & Merchandise", "crumbs": ["Collectibles & Merchandise"], "price": 39, "deliveryFrom": null, "badges": [], "cta": "Add to cart", "orderable": true, "release": null, "releaseLong": null, "rating": null, "art": "/jb-hifi/static/catalog-bricks.svg", "notice": [], "description": ["Build and rebuild colourful creations. Suitable for ages 4 and over."], "specs": [["Brand", "LEGO"], ["Category", "Collectibles & Merchandise"]], "keywords": "lego toys collectibles merchandise"}, {"id": "991106", "kind": "other", "slug": "nintendo-switch-2-console", "title": "Nintendo Switch 2 Console", "subtitle": "Gaming", "crumbs": ["Gaming"], "price": 699, "deliveryFrom": null, "badges": [], "cta": "Add to cart", "orderable": true, "release": null, "releaseLong": null, "rating": null, "art": "/jb-hifi/static/catalog-controller.svg", "notice": [], "description": ["Nintendo gaming console. Games and additional controllers sold separately."], "specs": [["Brand", "Nintendo"], ["Category", "Gaming"]], "keywords": "gaming console nintendo switch"}])
enrichProducts(PRODUCTS)
if (fixtureCatalog) PRODUCTS.push(...expandJB(PRODUCTS))
applyCatalogPolicy('jb-hifi', PRODUCTS, CATALOG_EVIDENCE)
if (!fixtureCatalog) for (const p of PRODUCTS) { delete p.stock; delete p.stars; delete p.reviews; p.purchaseLimit = 5 }
// Everyday assortment around the evidenced GTA VI rows (reference mode only; see shelf.js). It is kept
// out of PRODUCTS so the catalog policy, inventory.js and /api/catalog `inventory` stay evidence-only.
// Fixture mode keeps its own authored 500-row catalogue untouched.
export const ASSORTMENT = fixtureCatalog ? [] : SHELF
// Everything a shopper can browse, search and open: the evidenced rows first, then the assortment.
export const LISTED = fixtureCatalog ? PRODUCTS : [...PRODUCTS, ...ASSORTMENT]
export const byId = (id) => LISTED.find(p => p.id === String(id)) ?? null
export const bySlug = (slug) => LISTED.find(p => p.slug === String(slug)) ?? null
export const games = () => PRODUCTS.filter(p => p.kind === 'game')
export const upsells = () => PRODUCTS.filter(p => p.upsell)

export function productPath(base, p) { return `${base}/products/${p.slug}` }

// "Best Match": rows whose title contains the query words rank above rows that only match on
// brand, category or keywords. Ties keep catalogue order, so the GTA VI listings stay first for
// "gta 6" / "grand theft auto". Explicit sorts (price, title, rating…) are applied by filterCatalog.
const norm = s => String(s ?? '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
function relevance(p, terms) {
  const title = ` ${norm(p.title)} `
  return terms.reduce((n, t) => n + (title.includes(` ${t} `) ? 3 : title.includes(t) ? 2 : 0), 0) + (terms.every(t => title.includes(t)) ? 2 : 0)
}
export function search(q, filters = {}) {
  const found = filterCatalog(LISTED, q, filters)
  const terms = norm(q).split(' ').filter(Boolean)
  if (fixtureCatalog || (filters.sort && filters.sort !== 'best')) return found
  if (!terms.length) {
    // Browsing without a query: bestsellers first (featured, then most reviewed), with the GTA VI
    // pre-orders placed among them rather than pinned to the top of every department.
    const evidenced = found.filter(p => !p.shelf), shelf = found.filter(p => p.shelf)
      .map((p, i) => [p, i]).sort(([a, i], [b, j]) => (b.top - a.top) || (b.reviews - a.reviews) || i - j).map(([p]) => p)
    shelf.splice(Math.min(3, shelf.length), 0, ...evidenced)
    return shelf
  }
  const score = new Map(found.map((p, i) => [p, [relevance(p, terms), i]]))
  return found.sort((a, b) => score.get(b)[0] - score.get(a)[0] || score.get(a)[1] - score.get(b)[1])
}
export const DEPARTMENTS = [...new Set(LISTED.map(p=>p.crumbs[0]))]

// State/territory select, in the order the checkout lists them.
export const STATES = [
  ['ACT', 'Australian Capital Territory'], ['NSW', 'New South Wales'], ['NT', 'Northern Territory'], ['QLD', 'Queensland'],
  ['SA', 'South Australia'], ['TAS', 'Tasmania'], ['VIC', 'Victoria'], ['WA', 'Western Australia'],
]
export const stateName = (code) => STATES.find(([c]) => c === code)?.[1] ?? code

// Australia Post postcode ranges, used to check "Postcode" against "State/territory" like Shopify does.
const POSTCODE_RANGES = {
  ACT: [[200, 299], [2600, 2618], [2900, 2920]], NSW: [[1000, 2599], [2619, 2899], [2921, 2999]], NT: [[800, 999]],
  QLD: [[4000, 4999], [9000, 9999]], SA: [[5000, 5999]], TAS: [[7000, 7999]], VIC: [[3000, 3999], [8000, 8999]], WA: [[6000, 6797], [6800, 6999]],
}
export function postcodeState(postcode) {
  if (!/^\d{4}$/.test(String(postcode ?? '').trim())) return null
  const n = Number(postcode)
  return Object.keys(POSTCODE_RANGES).find(s => POSTCODE_RANGES[s].some(([a, b]) => n >= a && n <= b)) ?? null
}

// ASSUMPTION: shipping prices for this item were not shown anywhere (gap in the research). Other game tiles show
// "+ DELIVERY FROM $4.99", so Standard Delivery is priced at that; Express is a plausible JB surcharge.
export const SHIPPING_METHODS = {
  standard: { id: 'standard', name: 'Standard Delivery', eta: '2 – 12 days', carrier: 'Australia Post Mail', price: 4.99 },
  express: { id: 'express', name: 'Express Delivery', eta: '1 – 2 business days', carrier: 'Australia Post Express', price: 9.99 },
}
// Shown but not selectable: JB's help page says pre-orders are not eligible for Courier Delivery.
export const COURIER_METHOD = { id: 'courier', name: 'Courier Delivery', eta: 'next business day', note: 'Not available for pre-order items' }

// Observed public guest checkout, 2026-10-06: Melbourne 3000 search only.
// Local IDs are benchmark identifiers; names, addresses and fee are captured source data.
export const COLLECTION_METHOD = { id: 'collection_point', name: 'Ship to collection point', carrier: 'Australia Post', price: 4.99 }
export const COLLECTION_POINTS = [
  { id: 'melbourne-gpo-boxes', name: 'MELBOURNE GPO BOXES', address: 'Collect at Post, Shop 17e, MELBOURNE VIC 3000', line1: 'Shop 17e' },
  { id: 'melbourne-gpo-parcels', name: 'Melbourne GPO Parcels Post Office', address: 'Collect at Post, Shop 17e, MELBOURNE VIC 3000', line1: 'Shop 17e' },
  { id: 'qv-parcel-locker', name: 'QV Parcel Locker', address: 'Collect at Locker, 213-219 Little Lonsdale St, MELBOURNE VIC 3000', line1: '213-219 Little Lonsdale St' },
  { id: 'flinders-st-parcel-locker', name: '452 Flinders St Parcel Locker', address: 'Collect at Locker, G 452 Flinders St, MELBOURNE VIC 3000', line1: 'G 452 Flinders St' },
  { id: 'queen-victoria-market-parcel-locker', name: 'Queen Victoria Market Parcel Locker', address: 'Collect at Locker, 465 Queen St, MELBOURNE VIC 3000', line1: '465 Queen St' },
].map(point => Object.freeze({ ...point, city: 'MELBOURNE', state: 'VIC', postal_code: '3000', country: 'AU', carrier: COLLECTION_METHOD.carrier, price: COLLECTION_METHOD.price }))
export const collectionPointById = id => COLLECTION_POINTS.find(point => point.id === id) ?? null
export function findCollectionPoints(query) {
  const q = String(query ?? '').trim().replace(/[,\s]+/g, ' ')
  return /^(?:melbourne(?: vic)? )?3000$/i.test(q) ? [...COLLECTION_POINTS] : []
}

// Authored location fixtures, not captured retail-store pickup availability.
export const STORES = fixtureCatalog ? [
  { id: 'melbourne-central', name: 'JB Hi-Fi Melbourne Central', address: 'Shop 1, Melbourne Central, 211 La Trobe St, Melbourne VIC 3000', state: 'VIC' },
  { id: 'sydney-city', name: 'JB Hi-Fi Sydney City', address: 'Ground Floor, 39 Pitt St, Sydney NSW 2000', state: 'NSW' },
  { id: 'brisbane-city', name: 'JB Hi-Fi Brisbane City', address: 'Level 1, 172 Queen St, Brisbane QLD 4000', state: 'QLD' },
  { id: 'perth-city', name: 'JB Hi-Fi Perth City', address: '702 Hay St, Perth WA 6000', state: 'WA' },
  { id: 'adelaide-rundle', name: 'JB Hi-Fi Adelaide Rundle Mall', address: 'Level 1, 23–25 Rundle Mall, Adelaide SA 5000', state: 'SA' },
] : []
export const storeById = (id) => STORES.find(s => s.id === id) ?? null

// ASSUMPTION: the real finder geolocates and sorts by distance. Here a postcode, state or suburb puts the matching
// stores first; "Use my location" (no query) keeps the default order. Every store is always offered.
export function findStores(query) {
  const q = String(query ?? '').trim().toLowerCase()
  if (!q) return STORES
  const pc = /\b\d{4}\b/.exec(q)?.[0]
  const state = (pc && postcodeState(pc)) || STATES.find(([c, n]) => new RegExp(`\\b${c.toLowerCase()}\\b`).test(q) || q.includes(n.toLowerCase()))?.[0]
  const near = (s) => (state && s.state === state) || s.address.toLowerCase().includes(q) ? 0 : 1
  return [...STORES].sort((a, b) => near(a) - near(b))
}

const round = n => Math.round(n * 100) / 100

export function cartLines(store) {
  return store.cart.map(l => ({ ...l, product: selectedProduct(byId(l.pid), l.variant || '') })).filter(l => l.product)
}

// Prices include GST, so there is no separate tax line (tax is recorded as 0).
export function totals(store, shippingMethod = null) {
  const lines = cartLines(store)
  const count = lines.reduce((n, l) => n + l.qty, 0)
  const subtotal = round(lines.reduce((n, l) => n + l.qty * l.product.price, 0))
  const shipping = shippingMethod === COLLECTION_METHOD.id ? COLLECTION_METHOD.price : Object.hasOwn(SHIPPING_METHODS, shippingMethod) ? SHIPPING_METHODS[shippingMethod].price : 0
  return { lines, count, subtotal, shipping, tax: 0, total: round(subtotal + shipping) }
}
