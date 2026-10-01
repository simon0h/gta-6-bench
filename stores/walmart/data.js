// Listings as they appear on walmart.com (research/walmart.md + walmart.json, 2026-09-29).
// ASSUMPTION: the cart says taxes are "Calculated at checkout" and no rate was observed; 7% is the
// combined Omaha, NE (68116) rate behind the header's default location. Applied once a delivery
// address has been saved in checkout.
export const TAX_RATE = 0.07
export const LOCATION = { city: 'Omaha', zip: '68116', store: 'Omaha W Maple Rd Supercenter' }
export const ARRIVAL = { short: 'Nov 12', day: 'Thu, Nov 12', full: 'Thu, Nov 12, 2026' }
export const WALMART_PLUS = {
  trial: 1.00,
  plans: {
    monthly: { id: 'monthly', name: 'Monthly', price: 12.95, per: 'month', text: '$12.95/month' },
    annual: { id: 'annual', name: 'Annual', price: 98, per: 'year', text: '$98/year', badge: 'Best value plan' },
  },
}

export const PREORDER_PRICE_GUARANTEE = 'When you order an item featuring the Preorder Price Guarantee, you will not be charged more than the price displayed when you completed your order. For items sold by Walmart, you will be charged the lowest price offered by Walmart for the item between the time you completed your order and the time the item ships to you. For items sold by third party Marketplace sellers, you will be charged the price displayed at the time you completed your order. Unless you pay using a gift card or Paypal, you will not be charged until the preordered item is shipped to you. If you pay using a gift card or Paypal, you will be charged at the time you completed your order.'

const GAME_FEATURES = (platform) => [
  'This product will only contain a download code inside the box to support pre-load starting on November 12. A disc will not be included in the box. Game is playable starting November 19.',
  ...(platform === 'ps5' ? ['Code can only be used by users holding an account for PlayStation® registered to the US or Canada.'] : []),
  'Pre-order to receive the Vintage Vice City Pack.',
  'Grand Theft Auto VI is a single-player experience.',
]

export const PRODUCTS = [
  {
    id: '20482917228', kind: 'game', platform: 'ps5', edition: 'standard', format: 'code-in-box', rank: 1,
    slug: 'Grand-Theft-Auto-VI-PlayStation-5-Game',
    title: 'Grand Theft Auto VI, PlayStation 5 Game, (Code in Box, Delivers 11/12/26, Playable 11/19/26)',
    brand: 'Rockstar Games', price: 79.99, wasPrice: null, cta: 'Preorder', preorder: true,
    tileBadge: 'Overall pick', pdpBadges: ['100+ bought since yesterday', 'Overall pick'], cartBadges: ["In 200+ people's carts", 'Best seller'],
    rating: 3.5, ratings: 37, reviews: 16, esrb: 'Rating Pending',
    releaseText: 'Release date Nov 12', shippingText: 'Free shipping, arrives by release date Nov 12',
    crumbs: ['Video Games', 'PlayStation', 'PlayStation 5', 'PlayStation 5 (PS5) Games'],
    art: '/static/art/ps5-standard.svg', features: GAME_FEATURES('ps5'),
    keywords: 'gta 6 gta6 gta vi gtavi grand theft auto six rockstar games preorder pre-order playstation ps5 sony video games',
  },
  {
    id: '20459958275', kind: 'game', platform: 'xbox', edition: 'standard', format: 'code-in-box', rank: 2,
    slug: 'Grand-Theft-Auto-VI-Xbox-Series-X-Game',
    title: 'Grand Theft Auto VI, Xbox Series X/S Game, (Code In Box, Delivers 11/12/26, Playable 11/19/26)',
    brand: 'Rockstar Games', price: 79.99, wasPrice: null, cta: 'Preorder', preorder: true,
    tileBadge: "In 50+ people's carts", pdpBadges: ["In 50+ people's carts", 'Best seller'], cartBadges: ["In 50+ people's carts", 'Best seller'],
    rating: 3.8, ratings: 8, reviews: 3, esrb: 'Rating Pending',
    releaseText: 'Release date Nov 12', shippingText: 'Free shipping, arrives by release date Nov 12',
    crumbs: ['Video Games', 'Xbox', 'Xbox Series X|S', 'Xbox Series X|S Games'],
    art: '/static/art/xbox-standard.svg', features: GAME_FEATURES('xbox'),
    keywords: 'gta 6 gta6 gta vi gtavi grand theft auto six rockstar games preorder pre-order xbox series x s microsoft video games',
  },
  // Distractors the real search shows next to the game (research: soundtrack pre-orders at $47.97 / $15.97, GTA V listings).
  {
    id: '20486211904', kind: 'other', rank: 3,
    slug: 'Grand-Theft-Auto-VI-The-Album-Original-Soundtrack-Various-Artists-2-LP-Vinyl',
    title: 'Grand Theft Auto VI: The Album (Original Soundtrack) (Various Artists) 2 LP (Vinyl)',
    brand: 'Rockstar Games', price: 47.97, wasPrice: null, cta: 'Preorder', preorder: true,
    tileBadge: null, pdpBadges: ['Preorder'], cartBadges: [],
    rating: null, ratings: 0, reviews: 0, esrb: null,
    releaseText: 'Release date Nov 19', shippingText: 'Free shipping, arrives by Nov 21',
    crumbs: ['Movies, Music & Books', 'Music', 'Vinyl Records'],
    art: '/static/art/vinyl.svg',
    features: ['Double LP pressing of the official Grand Theft Auto VI soundtrack.', 'Gatefold sleeve with printed inner sleeves.', 'Ships Nov 19; arrives by Nov 21.'],
    keywords: 'gta 6 gta6 gta vi gtavi grand theft auto album soundtrack vinyl lp record music preorder pre-order',
  },
  {
    id: '20486211905', kind: 'other', rank: 4,
    slug: 'Grand-Theft-Auto-VI-The-Album-Original-Soundtrack-Various-Artists-CD',
    title: 'Grand Theft Auto VI: The Album (Original Soundtrack) (Various Artists) (CD)',
    brand: 'Rockstar Games', price: 15.97, wasPrice: null, cta: 'Preorder', preorder: true,
    tileBadge: null, pdpBadges: ['Preorder'], cartBadges: [],
    rating: null, ratings: 0, reviews: 0, esrb: null,
    releaseText: 'Release date Nov 19', shippingText: 'Free shipping, arrives by Nov 21',
    crumbs: ['Movies, Music & Books', 'Music', 'CDs'],
    art: '/static/art/vinyl.svg',
    features: ['Single-disc CD of the official Grand Theft Auto VI soundtrack.', 'Ships Nov 19; arrives by Nov 21.'],
    keywords: 'gta 6 gta6 gta vi gtavi grand theft auto album soundtrack cd music preorder pre-order',
  },
  {
    // ASSUMPTION: the research only says "GTA V listings" follow the soundtrack; the Rollback price uses the
    // "Now $19.93 / was $23.50" pattern the doc observed on discounted tiles.
    id: '55461783', kind: 'other', rank: 5,
    slug: 'Grand-Theft-Auto-V-PlayStation-5-Game',
    title: 'Grand Theft Auto V, PlayStation 5 Game',
    brand: 'Rockstar Games', price: 19.93, wasPrice: 23.50, cta: 'Add', preorder: false,
    tileBadge: 'Rollback', pdpBadges: ['Rollback', 'Best seller'], cartBadges: ['Best seller'],
    rating: 4.6, ratings: 1287, reviews: 412, esrb: 'Mature 17+',
    releaseText: null, shippingText: 'Shipping, arrives tomorrow',
    crumbs: ['Video Games', 'PlayStation', 'PlayStation 5', 'PlayStation 5 (PS5) Games'],
    art: '/static/art/game-generic.svg',
    features: ['Experience Los Santos and Blaine County in stunning 4K on PlayStation 5.', 'Includes Grand Theft Auto Online.', 'Physical disc.'],
    keywords: 'gta 5 gta5 gtav grand theft auto v five rockstar games playstation ps5 sony video games rollback',
  },
  {
    // ASSUMPTION: the GTA VI DualSense controller is not in the Walmart research; it is the same distractor the
    // other US stores list and Walmart's "Get Grand Theft Auto VI ready" banner points at accessories.
    id: '20489120336', kind: 'other', rank: 6,
    slug: 'Sony-DualSense-Wireless-Controller-PlayStation-5-Grand-Theft-Auto-VI-Limited-Edition',
    title: 'Sony DualSense Wireless Controller for PlayStation 5 - Grand Theft Auto VI Limited Edition',
    brand: 'Sony', price: 84.99, wasPrice: null, cta: 'Preorder', preorder: true,
    tileBadge: null, pdpBadges: ['Preorder'], cartBadges: [],
    rating: null, ratings: 0, reviews: 0, esrb: null,
    releaseText: 'Release date Nov 19', shippingText: 'Free shipping, arrives by Nov 19',
    crumbs: ['Video Games', 'PlayStation', 'PlayStation 5', 'PlayStation 5 Controllers'],
    art: '/static/art/accessory.svg',
    features: ['Limited edition Grand Theft Auto VI design.', 'Haptic feedback and adaptive triggers.', 'Built-in microphone and headset jack.'],
    keywords: 'gta 6 gta6 gta vi gtavi grand theft auto controller dualsense sony playstation ps5 accessories preorder pre-order',
  },
  {
    // Sponsored tile shown inside the GTA VI buy box (research: "EA SPORTS FC 27 - PlayStation 5 Game $69.00 … Add to cart").
    id: '15982234771', kind: 'other', rank: 7, sponsored: true,
    slug: 'EA-SPORTS-FC-27-PlayStation-5-Game',
    title: 'EA SPORTS FC 27 - PlayStation 5 Game',
    brand: 'Electronic Arts', price: 69.00, wasPrice: null, cta: 'Add', preorder: false,
    tileBadge: null, pdpBadges: ['Best seller'], cartBadges: ['Best seller'],
    rating: 4.2, ratings: 214, reviews: 88, esrb: 'Everyone',
    releaseText: null, shippingText: 'Free shipping, arrives tomorrow',
    crumbs: ['Video Games', 'PlayStation', 'PlayStation 5', 'PlayStation 5 (PS5) Games'],
    art: '/static/art/game-generic.svg',
    features: ['The world\'s game on PlayStation 5.', 'Physical disc.'],
    keywords: 'ea sports fc 27 fifa soccer football playstation ps5 video games',
  },
]

export const byId = (id) => PRODUCTS.find(p => p.id === String(id)) ?? null
export const games = () => PRODUCTS.filter(p => p.kind === 'game')

// /ip/<Product-Name-Slug>/<item id>; links from the results grid carry Walmart's tracking query.
export function productPath(base, p, from = null) {
  return `${base}/ip/${p.slug}/${p.id}${from ? '?classType=REGULAR&athbdg=L1200&from=/search' : ''}`
}

// Any-token match ranked by how many query tokens hit, so "gta 6" lists the game first and GTA V last,
// like Walmart's fuzzy results. Sponsored-only items never show up in results.
export function search(q) {
  const norm = s => String(s ?? '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
  const tokens = [...new Set(norm(q).split(' ').filter(Boolean))]
  if (!tokens.length) return []
  return PRODUCTS.filter(p => !p.sponsored)
    .map(p => { const hay = norm(p.title + ' ' + p.keywords); return { p, hits: tokens.filter(t => hay.includes(t)).length } })
    .filter(x => x.hits > 0)
    .sort((a, b) => b.hits - a.hits || a.p.rank - b.p.rank)
    .map(x => x.p)
}

export const STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','DC','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY']

const round = n => Math.round(n * 100) / 100

export function cartLines(store) {
  return store.cart.map(l => ({ ...l, product: byId(l.pid) })).filter(l => l.product)
}

// Shipping is free for every listing. Tax is only known once a delivery address exists (taxed=true);
// trial=true adds the $1 Walmart+ 30-day trial picked in checkout.
export function totals(store, { taxed = false, trial = false } = {}) {
  const lines = cartLines(store)
  const count = lines.reduce((n, l) => n + l.qty, 0)
  const subtotal = round(lines.reduce((n, l) => n + l.qty * l.product.price, 0))
  const shipping = 0
  const tax = taxed ? round(subtotal * TAX_RATE) : 0
  const walmartPlus = trial ? WALMART_PLUS.trial : 0
  return { lines, count, subtotal, shipping, tax, taxed, walmartPlus, total: round(subtotal + shipping + tax + walmartPlus) }
}
