// Listings as they appear on amazon.com (research/amazon.md + amazon.json, observed 2026-09-29).
// Amazon US sells only the Standard edition, code in box, $79.99, one ASIN per platform.

// ASSUMPTION: Amazon collects destination-based sales tax ("Estimated tax to be collected");
// the research has no figure, so a flat estimate stands in for it.
export const TAX_RATE = 0.07

export const RELEASE_DATE_TEXT = 'November 12, 2026'
export const AVAILABILITY = `This item will be released on ${RELEASE_DATE_TEXT}.`

// Delivery options offered at the review step (research 6c). Standard is free for this item.
// ASSUMPTION: Amazon does not publish the non-Prime Release-Date Delivery fee ("varies by item,
// shown at checkout"); $3.99 is used here. It is FREE with Prime, which the test account lacks.
export const DELIVERY = {
  standard: { id: 'standard', name: 'FREE delivery', date: 'Monday, November 16', short: 'Nov 16', price: 0, detail: 'Standard shipping' },
  'release-date': { id: 'release-date', name: 'Release-Date Delivery', date: 'Thursday, November 12', short: 'Nov 12', price: 3.99, detail: 'Arrives on the release date. FREE with Prime.' },
}

const GAME_DELIVERY = ['FREE delivery Mon, Nov 16', 'Or fastest delivery Thu, Nov 12']
const STOCK_DELIVERY = ['FREE delivery Sat, Oct 3 on $35 of items shipped by Amazon', 'Or fastest delivery Tomorrow, Oct 1']

const GAME_ABOUT = (platform) => [
  platform === 'ps5'
    ? 'This product contains a download code inside the box — no disc is included. Customer shipments will begin arriving November 12 for pre-load; game is playable starting November 19. Code can only be used by users holding an account for PlayStation registered to the US or Canada.'
    : 'This product contains a download code inside the box — no disc is included. Customer shipments will begin arriving November 12 for pre-load; game is playable starting November 19.',
  'Pre-order to receive the Vintage Vice City Pack.',
  'Grand Theft Auto VI is a single-player experience.',
]

const GAME_KEYWORDS = 'gta 6 gta6 gta vi gtavi grand theft auto 6 six vi rockstar games pre-order preorder video games code in box'

// `rank` is the "Featured" sort order of the search results. The soundtrack ranks first and the
// game sits below sponsored / older-GTA tiles, as observed (the game was result #10 of 16).
export const PRODUCTS = [
  {
    asin: 'B0H6K928WL', kind: 'game', platform: 'ps5', edition: 'standard', format: 'code-in-box', rank: 10,
    slug: 'Grand-Theft-Auto-VI-PlayStation-Delivers',
    title: 'Grand Theft Auto VI - PlayStation 5 (Code in Box, Delivers 11/12/26, Playable 11/19/26)',
    brand: 'Rockstar Games', price: 79.99, department: 'videogames', typeLabel: 'Video Game',
    platformLabel: 'PlayStation 5', swatchLabel: 'PlayStation 5', crumbs: ['Video Games', 'PlayStation 5', 'Games'],
    esrb: 'Rating Pending', bought: '9K+ bought in past month', rating: null,
    release: RELEASE_DATE_TEXT, availability: AVAILABILITY, delivery: GAME_DELIVERY, priceNote: 'Pre-order Price Guarantee.',
    bestSellersRank: '#33 in Video Games, #5 in PlayStation 5 Games', art: '/static/art/ps5-standard.svg',
    about: GAME_ABOUT('ps5'), keywords: GAME_KEYWORDS + ' playstation ps5 sony',
  },
  {
    asin: 'B0H6K49W6Y', kind: 'game', platform: 'xbox', edition: 'standard', format: 'code-in-box', rank: 10,
    slug: 'Grand-Theft-Auto-VI-Delivers-Playable',
    title: 'Grand Theft Auto VI - Xbox Series X|S (Code in Box, Delivers 11/12/26, Playable 11/19/26)',
    brand: 'Rockstar Games', price: 79.99, department: 'videogames', typeLabel: 'Video Game',
    platformLabel: 'Xbox Series X|S', swatchLabel: 'Xbox Series X | S', crumbs: ['Video Games', 'Xbox Series X & S', 'Games'],
    esrb: 'Rating Pending', bought: '2K+ bought in past month', rating: null,
    release: RELEASE_DATE_TEXT, availability: AVAILABILITY, delivery: GAME_DELIVERY, priceNote: 'Pre-order Price Guarantee.',
    bestSellersRank: '#41 in Video Games, #3 in Xbox Series X & S Games', art: '/static/art/xbox-standard.svg',
    about: GAME_ABOUT('xbox'), keywords: GAME_KEYWORDS + ' xbox series x s microsoft',
  },
  // ---- distractors the real search shows next to the game (kind: 'other') ----
  {
    asin: 'B0H7QK3M2P', kind: 'other', rank: 1,
    slug: 'Grand-Theft-Auto-VI-Album-Explicit',
    title: 'Grand Theft Auto VI: The Album [Explicit]',
    brand: 'Various Artists', price: 15.97, department: 'music', typeLabel: 'Audio CD',
    formatsLine: 'MP3 Music · Audio CD $15.97 · Vinyl $49.98', crumbs: ['CDs & Vinyl', 'Soundtracks'],
    esrb: null, bought: '500+ bought in past month', rating: null,
    // ASSUMPTION: the album's street date was not captured; it is listed as a pre-order like the game.
    release: 'November 19, 2026', availability: 'This item will be released on November 19, 2026.', delivery: GAME_DELIVERY, priceNote: 'Pre-order Price Guarantee.',
    art: '/static/art/vinyl.svg',
    about: ['Official soundtrack album for Grand Theft Auto VI.', 'Audio CD edition; also available on MP3 and 2x LP vinyl.'],
    keywords: 'gta 6 gta6 gta vi gtavi grand theft auto vi album soundtrack music cd vinyl explicit rockstar',
  },
  {
    asin: 'B0BGTAV4RN', kind: 'other', rank: 2, sponsored: true,
    slug: 'Grand-Theft-Auto-V-PlayStation-4-Renewed',
    title: 'Grand Theft Auto V - PlayStation 4 (Renewed)',
    brand: 'Amazon Renewed', price: 17.99, department: 'videogames', typeLabel: 'Video Game', condition: 'Renewed',
    platformLabel: 'PlayStation 4', crumbs: ['Video Games', 'PlayStation 4', 'Games'],
    esrb: 'Mature', bought: null, rating: { stars: 4.3, count: '1,204' },
    release: null, availability: 'In Stock', delivery: STOCK_DELIVERY, priceNote: null,
    art: '/static/art/game-generic.svg',
    about: ['Renewed products work and look like new. Backed by the 90-day Amazon Renewed Guarantee.'],
    keywords: 'gta 5 gta v gtav grand theft auto v five gta 6 gta6 gta vi playstation ps4 renewed rockstar',
  },
  {
    asin: 'B0H7DS6GTA', kind: 'other', rank: 3,
    slug: 'PlayStation-DualSense-Wireless-Controller-Grand-Theft-Auto-VI',
    title: 'PlayStation DualSense Wireless Controller – Grand Theft Auto VI Limited Edition',
    // ASSUMPTION: the controller was not captured for Amazon; listed at Sony's $84.99 MSRP.
    brand: 'PlayStation', price: 84.99, department: 'videogames', typeLabel: 'Accessory',
    platformLabel: 'PlayStation 5', crumbs: ['Video Games', 'PlayStation 5', 'Accessories', 'Controllers'],
    esrb: null, bought: '1K+ bought in past month', rating: null,
    release: 'November 19, 2026', availability: 'This item will be released on November 19, 2026.', delivery: GAME_DELIVERY, priceNote: 'Pre-order Price Guarantee.',
    art: '/static/art/accessory.svg',
    about: ['Limited edition Grand Theft Auto VI design.', 'Haptic feedback and adaptive triggers.', 'Built-in microphone and headset jack.'],
    keywords: 'gta 6 gta6 gta vi gtavi grand theft auto vi controller dualsense playstation ps5 sony limited edition accessories',
  },
  {
    asin: 'B0BGTAV5P5', kind: 'other', rank: 4,
    slug: 'Grand-Theft-Auto-V-PlayStation-5',
    title: 'Grand Theft Auto V - PlayStation 5',
    brand: 'Rockstar Games', price: 24.34, department: 'videogames', typeLabel: 'Video Game',
    platformLabel: 'PlayStation 5', crumbs: ['Video Games', 'PlayStation 5', 'Games'],
    esrb: 'Mature', bought: '3K+ bought in past month', rating: { stars: 4.7, count: '8,912' },
    release: null, availability: 'In Stock', delivery: STOCK_DELIVERY, priceNote: null,
    art: '/static/art/game-generic.svg',
    about: ['Experience Los Santos and Blaine County on PlayStation 5 with faster loading, 4K resolution and up to 60 fps.', 'Includes GTA Online.'],
    keywords: 'gta 5 gta v gtav grand theft auto v five gta 6 gta6 gta vi playstation ps5 rockstar games',
  },
  // ASSUMPTION: the research names only the album, sponsored/renewed GTA IV and V tiles and unofficial guides
  // (seen for the Ultimate Edition query); these three stand in for the other tiles ranked above the game (#10).
  {
    asin: '1966402178', kind: 'other', rank: 5,
    slug: 'GTA-6-Unofficial-Guide-Walkthrough-Paperback',
    title: 'GTA 6 Unofficial Guide: Maps, Missions and Walkthrough for Vice City and Leonida',
    brand: 'Independently published', price: 14.99, department: 'stripbooks', typeLabel: 'Paperback',
    formatsLine: 'Paperback $14.99 · Kindle $4.99', crumbs: ['Books', 'Humor & Entertainment', 'Puzzles & Games'],
    esrb: null, bought: '50+ bought in past month', rating: { stars: 3.8, count: '41' },
    release: null, availability: 'In Stock', delivery: STOCK_DELIVERY, priceNote: null,
    art: '/amazon/static/book.svg',
    about: ['Unofficial companion guide. Not endorsed by Rockstar Games.', 'Maps, collectibles and mission tips.'],
    // Includes "ultimate edition": Amazon's search for the (non-existent) Ultimate Edition returns guides, not the game.
    keywords: 'gta 6 gta6 gta vi gtavi grand theft auto vi 6 guide unofficial walkthrough maps book paperback kindle ultimate edition',
  },
  {
    asin: 'B09GTATRI5', kind: 'other', rank: 6,
    slug: 'Grand-Theft-Auto-Trilogy-Definitive-PlayStation-5',
    title: 'Grand Theft Auto: The Trilogy – The Definitive Edition - PlayStation 5',
    brand: 'Rockstar Games', price: 29.99, department: 'videogames', typeLabel: 'Video Game',
    platformLabel: 'PlayStation 5', crumbs: ['Video Games', 'PlayStation 5', 'Games'],
    esrb: 'Mature', bought: '1K+ bought in past month', rating: { stars: 4.1, count: '12,905' },
    release: null, availability: 'In Stock', delivery: STOCK_DELIVERY, priceNote: null,
    art: '/static/art/game-generic.svg',
    about: ['Includes Grand Theft Auto III, Grand Theft Auto: Vice City and Grand Theft Auto: San Andreas.'],
    keywords: 'gta trilogy definitive edition gta 3 iii vice city san andreas grand theft auto gta 6 gta6 gta vi playstation ps5 rockstar games',
  },
  {
    asin: 'B09GTAVXSX', kind: 'other', rank: 7, sponsored: true,
    slug: 'Grand-Theft-Auto-V-Xbox-Series-X',
    title: 'Grand Theft Auto V - Xbox Series X',
    brand: 'Rockstar Games', price: 24.99, department: 'videogames', typeLabel: 'Video Game',
    platformLabel: 'Xbox Series X', crumbs: ['Video Games', 'Xbox Series X & S', 'Games'],
    esrb: 'Mature', bought: '2K+ bought in past month', rating: { stars: 4.7, count: '3,317' },
    release: null, availability: 'In Stock', delivery: STOCK_DELIVERY, priceNote: null,
    art: '/static/art/game-generic.svg',
    about: ['Experience Los Santos and Blaine County on Xbox Series X|S.', 'Includes GTA Online.'],
    keywords: 'gta 5 gta v gtav grand theft auto v five gta 6 gta6 gta vi xbox series x s microsoft rockstar games',
  },
  {
    asin: 'B0BGTAIV36', kind: 'other', rank: 12,
    slug: 'Grand-Theft-Auto-IV-Complete-Edition-Xbox-360-Renewed',
    title: 'Grand Theft Auto IV: The Complete Edition - Xbox 360 (Renewed)',
    brand: 'Amazon Renewed', price: 22.49, department: 'videogames', typeLabel: 'Video Game', condition: 'Renewed',
    platformLabel: 'Xbox 360', crumbs: ['Video Games', 'Legacy Systems', 'Xbox 360'],
    esrb: 'Mature', bought: null, rating: { stars: 4.5, count: '2,310' },
    release: null, availability: 'Only 3 left in stock - order soon.', delivery: STOCK_DELIVERY, priceNote: null,
    art: '/static/art/game-generic.svg',
    about: ['Includes Grand Theft Auto IV, The Lost and Damned and The Ballad of Gay Tony.'],
    keywords: 'gta 4 gta iv grand theft auto iv four gta 6 gta vi xbox 360 renewed rockstar',
  },
  // "Frequently bought together" bundle items on the product page (research: prices hidden until in cart).
  // ASSUMPTION: bundle prices were not shown ("To see our price, add these items to your cart"); $69.99 each.
  {
    asin: 'B0H4ZELDOT', kind: 'other', rank: 50, slug: 'Legend-Zelda-Ocarina-Time-Nintendo-Switch-2',
    title: 'The Legend of Zelda: Ocarina of Time - Nintendo Switch 2', brand: 'Nintendo', price: 69.99,
    department: 'videogames', typeLabel: 'Video Game', platformLabel: 'Nintendo Switch 2', crumbs: ['Video Games', 'Nintendo Switch 2', 'Games'],
    esrb: 'Everyone 10+', bought: '10K+ bought in past month', rating: { stars: 4.9, count: '21,077' }, badge: '#1 Best Seller',
    release: null, availability: 'In Stock', delivery: STOCK_DELIVERY, priceNote: null, art: '/static/art/game-generic.svg',
    about: ['The classic adventure, rebuilt for Nintendo Switch 2.'], keywords: 'zelda ocarina of time nintendo switch 2 link',
  },
  {
    asin: 'B0H4METRAV', kind: 'other', rank: 51, slug: 'Metroid-Ravenous-Nintendo-Switch-2',
    title: 'Metroid Ravenous - Nintendo Switch 2', brand: 'Nintendo', price: 69.99,
    department: 'videogames', typeLabel: 'Video Game', platformLabel: 'Nintendo Switch 2', crumbs: ['Video Games', 'Nintendo Switch 2', 'Games'],
    esrb: 'Teen', bought: '4K+ bought in past month', rating: { stars: 4.6, count: '3,402' },
    release: null, availability: 'In Stock', delivery: STOCK_DELIVERY, priceNote: null, art: '/static/art/game-generic.svg',
    about: ['Samus returns in a new 2D adventure.'], keywords: 'metroid ravenous nintendo switch 2 samus',
  },
  // The cart's "Customers who bought ... also bought these items from other categories" row (research, 2nd pass).
  {
    asin: 'B0CRPS5SLM', kind: 'other', rank: 60, slug: 'Sony-PlayStation-5-Console-Slim',
    title: 'Sony PlayStation 5 Console (Slim)', brand: 'PlayStation', price: 733.75,
    department: 'videogames', typeLabel: 'Console', platformLabel: 'PlayStation 5', crumbs: ['Video Games', 'PlayStation 5', 'Consoles'],
    esrb: null, bought: '2K+ bought in past month', rating: { stars: 4.7, count: '9,512' },
    release: null, availability: 'Only 2 left in stock - order soon.', delivery: STOCK_DELIVERY, priceNote: null, art: '/static/art/accessory.svg',
    about: ['PlayStation 5 console, slim design.', 'Includes a DualSense wireless controller.'], keywords: 'ps5 playstation 5 console slim sony',
  },
  {
    asin: 'B0DGRIPCAP', kind: 'other', rank: 61, slug: 'NEWDERY-Joystick-Grip-Caps-PS5-Controller',
    title: 'NEWDERY Joystick Grip Caps for PS5 Controller (8 Pack)', brand: 'NEWDERY', price: 9.99,
    department: 'videogames', typeLabel: 'Accessory', platformLabel: 'PlayStation 5', crumbs: ['Video Games', 'PlayStation 5', 'Accessories'],
    esrb: null, bought: '5K+ bought in past month', rating: { stars: 4.5, count: '6,208' },
    release: null, availability: 'In Stock', delivery: STOCK_DELIVERY, priceNote: null, art: '/static/art/accessory.svg',
    about: ['Silicone thumb grip caps for the DualSense controller.'], keywords: 'ps5 controller joystick grip caps thumb grips accessories newdery',
  },
  {
    asin: 'B0DCOOLSTD', kind: 'other', rank: 62, slug: 'PS5-Cooling-Stand-Dual-Controller-Charger',
    title: 'PS5 Cooling Stand with Dual Controller Charging Station', brand: 'Generic', price: 37.04, dealNote: '-7% Typical: $39.99',
    department: 'videogames', typeLabel: 'Accessory', platformLabel: 'PlayStation 5', crumbs: ['Video Games', 'PlayStation 5', 'Accessories'],
    esrb: null, bought: '3K+ bought in past month', rating: { stars: 4.4, count: '4,871' },
    release: null, availability: 'In Stock', delivery: STOCK_DELIVERY, priceNote: null, art: '/static/art/accessory.svg',
    about: ['Vertical stand with cooling fan and two controller charging docks.'], keywords: 'ps5 cooling stand fan controller charger charging station accessories',
  },
]

export const CART_RECS = ['B0CRPS5SLM', 'B0DGRIPCAP', 'B0DCOOLSTD']

export const byAsin = (asin) => PRODUCTS.find(p => p.asin === String(asin ?? '').toUpperCase()) ?? null
export const games = () => PRODUCTS.filter(p => p.kind === 'game')

export function productPath(base, p) {
  return `${base}/${p.slug}/dp/${p.asin}`
}

// Sign-in URL carrying the page to return to afterwards (Amazon's openid.return_to). The checkout wall
// uses assoc_handle amazon_checkout_us; every other sign-in link uses Amazon's usflex handle.
export function signinPath(returnTo = '/', handle = 'usflex') {
  return `/ap/signin?openid.return_to=${encodeURIComponent(returnTo)}&openid.assoc_handle=${handle}`
}

export const SORTS = [
  ['relevanceblender', 'Featured'], ['price-asc-rank', 'Price: Low to High'], ['price-desc-rank', 'Price: High to Low'],
  ['review-rank', 'Avg. Customer Review'], ['date-desc-rank', 'Newest Arrivals'], ['exact-aware-popularity-rank', 'Best Sellers'],
]

export const DEPARTMENTS = [
  ['', 'All'], ['videogames', 'Video Games'], ['electronics', 'Electronics'], ['music', 'CDs & Vinyl'], ['digital-music', 'Digital Music'],
  ['toys-and-games', 'Toys & Games'], ['stripbooks', 'Books'], ['fashion', 'Clothing, Shoes & Jewelry'],
]

export function search(q, dept = '', sort = '') {
  const norm = s => String(s ?? '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
  const tokens = norm(q).split(' ').filter(Boolean)
  if (!tokens.length) return []
  let hits = PRODUCTS.filter(p => { const hay = norm(p.title + ' ' + p.keywords); return tokens.every(t => hay.includes(t)) })
  if (dept) hits = hits.filter(p => p.department === dept)
  hits.sort((a, b) => a.rank - b.rank)
  if (sort === 'price-asc-rank') hits.sort((a, b) => a.price - b.price)
  if (sort === 'price-desc-rank') hits.sort((a, b) => b.price - a.price)
  return hits
}

export const STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','DC','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY']

const round = n => Math.round(n * 100) / 100

// Cart lines: { asin, qty } with the product attached. Amazon merges quantity when the same ASIN is re-added.
export function cartLines(store) {
  return store.cart.map(l => ({ ...l, product: byAsin(l.asin) })).filter(l => l.product)
}

// "Pre-order now" on the product page is Amazon's Buy Now: it checks out that one item on its own
// and leaves the cart untouched. "Proceed to checkout" from the cart checks out the cart.
export function checkoutLines(store) {
  const bn = store.checkout?.buyNow
  if (bn) { const product = byAsin(bn.asin); return product ? [{ asin: bn.asin, qty: bn.qty, product }] : [] }
  return cartLines(store)
}

export function totals(lines, deliveryId = 'standard') {
  const count = lines.reduce((n, l) => n + l.qty, 0)
  const subtotal = round(lines.reduce((n, l) => n + l.qty * l.product.price, 0))
  const shipping = count ? (DELIVERY[deliveryId] ?? DELIVERY.standard).price : 0
  const tax = round(subtotal * TAX_RATE)
  return { lines, count, subtotal, shipping, tax, total: round(subtotal + shipping + tax) }
}
