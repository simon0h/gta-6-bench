// Listings as they appear on xbox.com (research/xbox-store.md, 2026-09-29).
// The Xbox Store sells only the Xbox Series X|S digital version; the two editions are
// separate product pages. Everything the real search shows next to them is kept as a distractor.

// ASSUMPTION: the real tax comes from the billing address of the payment method; the research
// never saw a taxed total, so a flat estimated rate is used and shown as "Estimated tax".
export const TAX_RATE = 0.07

export const RELEASE = '11/18/2026' // xbox.com shows 11/18 even though the description says 19 November
export const ESRB = { short: 'RATING PENDING LIKELY MATURE 17+', note: 'May contain content inappropriate for children. Visit ESRB.org for rating information.' }

const PREORDER_BONUS = [
  'Purchase prior to 19 November 2026 23:59:59 to receive:',
  '-The Vintage Vice City Pack',
  '-One Month of GTA+',
  'Receive a month of GTA+ with your pre-order; must be redeemed within 180 days after placing your pre-order. Subscription redemption is not available to child accounts with restrictions on age-restricted content. You will receive a pop-up notification on your console when your GTA+ subscription month is available to redeem. Open the Store, select your profile icon in the top left corner, and select “Offers & credits” to find and redeem this offer. Limited to one redemption per Platform Account.',
]
const STORY = [
  'Grand Theft Auto VI is a single-player experience.',
  'Vice City, USA.',
  'Jason and Lucia have always known the deck is stacked against them. But when an easy score goes wrong, they find themselves on the darkest side of the sunniest place in America, in the middle of a criminal conspiracy stretching across the state of Leonida — forced to rely on each other more than ever if they want to make it out alive.',
]
const LICENSE = 'Purchase grants a license to the digital product subject to the Terms of Service (“ToS”) and Privacy Policy at rockstargames.com/legal and rockstargames.com/privacy. Non-transferable access to special features such as exclusive, unlockable, downloadable or online content, services or functions may require single-use serial code, additional fee and/or online account registration.'
const ULTIMATE_UPGRADE_ITEMS = ["'95 GROTTI CHEETAH", 'HAWK & LITTLE MORGAN REVOLVERS', 'PERSONALIZED WEAPON VARIANTS', 'VICE CITY STYLE', "JASON'S SAFEHOUSE VEHICLES", 'GANADO RETRO BUILD', 'SHITZU SQUALO', "'67 VAPID DOMINATOR BUGGY & GARAGE", 'GOODTIME GEAR', 'PTT YOUNGIN$ COMPOUND', 'CLASSIC CAR COLLECTION']
const ULTIMATE_DESTINATIONS = ['RIDEOUT CUSTOMS', "SARA'S UNISEX SALON", 'STOCK 305', 'ELECTRIC FANG TATTOO', "ONE-EYED WILLIE'S"]

// Listings without shared box art get a text-only placeholder cover drawn by this store (GET /xbox-store/art/<id>.svg).
const storeArt = (id) => `/xbox-store/art/${id}.svg`

const GTA_KEYWORDS ='gta 6 gta6 gta vi gtavi grand theft auto 6 vi six rockstar games pre-order preorder xbox series x s digital leonida vice city'

export const PRODUCTS = [
  {
    id: '9p3h4968grsm', slug: 'grand-theft-auto-vi', kind: 'game', type: 'game', rank: 1,
    platform: 'xbox', edition: 'standard', format: 'digital',
    title: 'Grand Theft Auto VI', shortTitle: 'Grand Theft Auto VI',
    price: 79.99, listPrice: null, iap: true, ribbon: 'PRE-ORDER', purchasable: true,
    publisher: 'Rockstar Games', developer: 'Rockstar Games', genre: 'Action & adventure', rating: '4.9', ratingCount: '6.0K',
    release: RELEASE, languages: 13, art: '/static/art/xbox-standard.svg',
    description: [...PREORDER_BONUS, ...STORY, LICENSE],
    gamesIncluded: ['Grand Theft Auto VI'],
    addonsIncluded: ['Grand Theft Auto VI: Vintage Vice City Pack'],
    bundle: ['9nl3wwnzlzzn', '9plvssh8849x'],
    addons: ['9pn4llbr8rch'],
    keywords: GTA_KEYWORDS + ' standard edition',
  },
  {
    id: '9nnzsnhlr63l', slug: 'grand-theft-auto-vi-ultimate-edition', kind: 'game', type: 'game', rank: 2,
    platform: 'xbox', edition: 'ultimate', format: 'digital',
    title: 'Grand Theft Auto VI: Ultimate Edition', shortTitle: 'Grand Theft Auto VI: Ultimate Edition',
    price: 99.99, listPrice: null, iap: true, ribbon: 'PRE-ORDER', purchasable: true,
    publisher: 'Rockstar Games', developer: 'Rockstar Games', genre: 'Action & adventure', rating: '4.9', ratingCount: '6.0K',
    release: RELEASE, languages: 13, art: '/static/art/xbox-ultimate.svg',
    description: [
      ...PREORDER_BONUS,
      'This purchase includes the Ultimate Edition Upgrade with exclusive in-game bonuses for Grand Theft Auto VI, plus Special Destinations only open for business with the Ultimate Edition.',
      ...STORY, LICENSE,
    ],
    upgradeItems: ULTIMATE_UPGRADE_ITEMS, destinations: ULTIMATE_DESTINATIONS,
    gamesIncluded: ['Grand Theft Auto VI'],
    addonsIncluded: ['Grand Theft Auto VI: Ultimate Edition Upgrade', 'Grand Theft Auto VI: Vintage Vice City Pack'],
    bundle: ['9nl3wwnzlzzn', '9pn4llbr8rch', '9plvssh8849x'],
    addons: [],
    keywords: GTA_KEYWORDS + ' ultimate edition',
  },
  // The base-game entry that lives inside the bundle: shows as "View game" with no price.
  {
    id: '9nl3wwnzlzzn', slug: 'grand-theft-auto-vi', kind: 'other', type: 'game', rank: 3,
    title: 'Grand Theft Auto VI', shortTitle: 'Grand Theft Auto VI',
    price: null, listPrice: null, iap: true, ribbon: null, cta: 'View game', purchasable: false,
    publisher: 'Rockstar Games', developer: 'Rockstar Games', genre: 'Action & adventure', rating: '4.9', ratingCount: '6.0K',
    release: RELEASE, languages: 13, art: '/static/art/xbox-standard.svg',
    description: [...STORY, LICENSE],
    includedIn: ['9p3h4968grsm', '9nnzsnhlr63l'],
    keywords: GTA_KEYWORDS,
  },
  {
    id: '9pn4llbr8rch', slug: 'grand-theft-auto-vi-ultimate-edition-upgrade', kind: 'other', type: 'add-on', rank: 4,
    title: 'Grand Theft Auto VI: Ultimate Edition Upgrade', shortTitle: 'Ultimate Edition Upgrade',
    price: 20.00, listPrice: null, iap: false, ribbon: 'PRE-ORDER', purchasable: true,
    publisher: 'Rockstar Games', developer: 'Rockstar Games', genre: 'Action & adventure', rating: '4.7', ratingCount: '312',
    release: RELEASE, languages: 13, art: storeArt('9pn4llbr8rch'),
    description: [
      'Upgrade Grand Theft Auto VI to the Ultimate Edition and receive exclusive in-game bonuses. Requires Grand Theft Auto VI (sold separately).',
      'ULTIMATE EDITION UPGRADE: ' + ULTIMATE_UPGRADE_ITEMS.join(', ') + '.',
      'Special Destinations Only Open for Business with the Ultimate Edition: ' + ULTIMATE_DESTINATIONS.join(', ') + '.',
    ],
    includedIn: ['9nnzsnhlr63l'],
    keywords: GTA_KEYWORDS + ' ultimate edition upgrade add-on dlc',
  },
  {
    id: '9plvssh8849x', slug: 'grand-theft-auto-vi-vintage-vice-city-pack', kind: 'other', type: 'add-on', rank: 5,
    title: 'Grand Theft Auto VI: Vintage Vice City Pack', shortTitle: 'Vintage Vice City Pack',
    price: null, listPrice: null, iap: false, ribbon: null, cta: 'View add-on', purchasable: false,
    publisher: 'Rockstar Games', developer: 'Rockstar Games', genre: 'Action & adventure', rating: null, ratingCount: null,
    release: RELEASE, languages: 13, art: storeArt('9plvssh8849x'),
    description: ['The Vintage Vice City Pack is a pre-order bonus for Grand Theft Auto VI. It is included with every pre-order placed before 19 November 2026 23:59:59.'],
    includedIn: ['9p3h4968grsm', '9nnzsnhlr63l'],
    keywords: GTA_KEYWORDS + ' vintage vice city pack pre-order bonus add-on',
  },
  // ASSUMPTION: the research only notes that other tiles use the sale layout ("$49.99" struck, "$24.99+", "-50%");
  // the games below are what an xbox.com search for GTA shows today, priced plausibly.
  {
    id: '9nfvz4qg6frw', slug: 'grand-theft-auto-v-xbox-series-xs', kind: 'other', type: 'game', rank: 6,
    title: 'Grand Theft Auto V (Xbox Series X|S)', shortTitle: 'Grand Theft Auto V',
    price: 24.99, listPrice: 49.99, discount: '-50%', iap: true, ribbon: null, purchasable: true,
    publisher: 'Rockstar Games', developer: 'Rockstar Games', genre: 'Action & adventure', rating: '4.3', ratingCount: '48K',
    release: '03/15/2022', languages: 13, art: storeArt('9nfvz4qg6frw'),
    description: ['Experience the blockbuster Grand Theft Auto V and Grand Theft Auto Online on Xbox Series X|S with new features, upgrades and faster loading times.'],
    keywords: 'gta 5 gta5 gtav grand theft auto v five rockstar games xbox series x s digital los santos',
  },
  {
    id: '9pfd9xd3v0ch', slug: 'grand-theft-auto-online-xbox-series-xs', kind: 'other', type: 'game', rank: 7,
    title: 'Grand Theft Auto Online (Xbox Series X|S)', shortTitle: 'Grand Theft Auto Online',
    price: 19.99, listPrice: null, iap: true, ribbon: null, purchasable: true,
    publisher: 'Rockstar Games', developer: 'Rockstar Games', genre: 'Action & adventure', rating: '4.1', ratingCount: '21K',
    release: '03/15/2022', languages: 13, art: storeArt('9pfd9xd3v0ch'),
    description: ['Grand Theft Auto Online for Xbox Series X|S, available as a standalone title. Requires Xbox Game Pass Core or Ultimate.'],
    keywords: 'gta online gtao grand theft auto online rockstar games xbox series x s digital multiplayer',
  },
  {
    id: '9pkx8x2cs67d', slug: 'red-dead-redemption-2', kind: 'other', type: 'game', rank: 8,
    title: 'Red Dead Redemption 2', shortTitle: 'Red Dead Redemption 2',
    price: 19.79, listPrice: 59.99, discount: '-67%', iap: true, ribbon: null, purchasable: true,
    publisher: 'Rockstar Games', developer: 'Rockstar Games', genre: 'Action & adventure', rating: '4.8', ratingCount: '110K',
    release: '10/26/2018', languages: 13, art: storeArt('9pkx8x2cs67d'),
    description: ['Winner of over 175 Game of the Year Awards. Red Dead Redemption 2 is an epic tale of life in America’s unforgiving heartland.'],
    // The real search surfaces RDR2 for GTA queries (same publisher), so it carries those terms too.
    keywords: 'red dead redemption 2 rdr2 rockstar games xbox one series x s digital western gta grand theft auto',
  },
]

export const byId = (id) => PRODUCTS.find(p => p.id === String(id)) ?? null
export const editions = () => PRODUCTS.filter(p => p.kind === 'game')

export function productPath(base, p) {
  return `${base}/en-US/games/store/${p.slug}/${p.id}`
}

// Real search is fuzzy: "grand theft auto vi" also returns GTA V, GTA Online, RDR2. Items matching every
// token come first (in catalogue order), then items matching at least one meaningful token.
export function search(q, type = 'games') {
  const norm = s => String(s ?? '').toLowerCase().replace(/[^a-z0-9|]+/g, ' ').trim()
  const tokens = norm(q).split(' ').filter(Boolean)
  if (!tokens.length) return []
  const wanted = type === 'add-ons' ? 'add-on' : type === 'games' ? 'game' : null
  const scored = PRODUCTS
    .filter(p => wanted === null ? false : p.type === wanted)
    .map(p => {
      const hay = norm(p.title + ' ' + p.keywords)
      const hits = tokens.filter(t => hay.includes(t))
      return { p, full: hits.length === tokens.length, partial: hits.some(t => t.length >= 3) }
    })
    .filter(s => s.full || s.partial)
    .sort((a, b) => (b.full - a.full) || (a.p.rank - b.p.rank))
  return scored.map(s => s.p)
}

export const STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','DC','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY']

const round = n => Math.round(n * 100) / 100

// Digital licences: one copy per account, no quantity stepper. A cart line is just { pid }.
export function cartLines(store) {
  return store.cart.map(l => ({ ...l, product: byId(l.pid), qty: 1 })).filter(l => l.product)
}

export function totals(store) {
  const lines = cartLines(store)
  const subtotal = round(lines.reduce((n, l) => n + l.product.price, 0))
  const tax = round(subtotal * TAX_RATE)
  return { lines, count: lines.length, subtotal, shipping: 0, tax, total: round(subtotal + tax) }
}

export function priceTotals(price) {
  const subtotal = round(price)
  const tax = round(subtotal * TAX_RATE)
  return { subtotal, shipping: 0, tax, total: round(subtotal + tax) }
}
