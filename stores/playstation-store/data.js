// Listings as they appear on store.playstation.com (research/playstation-store.md, 2026-09-29/30).
// Digital only, PS5 only. Product ids follow {publisherCode}-{titleId}_00-{sku}.

export const CONCEPT_ID = '10000730'

// ASSUMPTION: the research does not give a tax rate (tax only appears as a "Tax" row in the
// checkout drawer, computed from the account's saved US address). The seeded tester account
// is treated as registered in Miami-Dade, FL, whose combined sales tax is 7.0%.
export const TAX_RATE = 0.07
export const ACCOUNT_ADDRESS = { city: 'Miami', state: 'FL', postal_code: '33139', country: 'US' }

// ASSUMPTION: the seeded account starts with an empty wallet, so the whole amount goes to the
// selected card / payment service ("your wallet funds are used first" applies to the $0.00).
export const WALLET_BALANCE = 0

export const RELEASE = '11/18/2026'
export const UNLOCK = '11/18/2026 09:00 PM PST'
// ASSUMPTION: "Expected download date" in the drawer is the 7-day pre-load start.
export const PRELOAD = '11/11/2026 09:00 PM PST'
export const PROMO_LINE = '1-month GTA+ subscription with pre-order. Auto-renews. Check Game and Legal Info* below.'

export const COMPAT = ['In-game purchases optional', 'Offline play enabled', '1 player', 'Remote Play supported', 'PS5 Version', 'Vibration function and trigger effect supported (DualSense wireless controller)', 'PS5 Pro Enhanced']

export const LEGAL_INFO = [
  'Pre-order Grand Theft Auto VI and get one month of GTA+ on PlayStation 5 at no extra cost. Subscription continues until canceled.',
  'Offer ends November 19th 2026.',
  'You\'ll receive a confirmation email with redemption instructions. Your GTA+ subscription is non-transferable, and can only be redeemed on the account used to pre-order the game.',
  'Must be redeemed by March 31st 2027.',
  'Purchase prior to 19 November 2026 at 23:59:59 to receive: -The Vintage Vice City Pack -One Month of GTA+',
  'After the first month, your GTA+ subscription auto-renews at the then-current price unless canceled before the renewal date. Manage or cancel any time in Settings > Users and Accounts > Account > Payment and Subscriptions. Offer terms: https://www.playstation.com/support/games/gta-vi-offer-terms/',
  'Grand Theft Auto VI is a single-player experience.',
  'Vice City, USA. Jason and Lucia have always known the deck is stacked against them. But when an easy score goes wrong, they find themselves on the darkest side of the sunniest place in America, in the middle of a criminal conspiracy stretching across the state of Leonida - forced to rely on each other more than ever if they want to make it out alive.',
]
export const ULTIMATE_UPGRADE_BULLETS = ['Exclusive collection of premium vehicles', 'Additional weapons and outfits', 'Unlocked shops and businesses across Leonida', 'Bonus story content threaded through Jason and Lucia\'s story']
export const LEGAL_TEXT = [
  'Online features require an account for PlayStation and are subject to terms of service and applicable privacy policy (playstationnetwork.com/terms-of-service & playstationnetwork.com/privacy-policy).',
  'Software subject to license (us.playstation.com/softwarelicense). One-time license fee for play on account\'s designated primary PS5 system and other PS5 systems when signed in with that account.',
  'Purchase grants a license to the digital product subject to the Terms of Service and User Agreement and any other applicable terms, and is non-refundable except as described in the PlayStation Store Cancellation Policy.',
  'Rockstar Games, Inc. ©2026. Rockstar Games, Grand Theft Auto, the GTA Five, and the Rockstar Games marks and logos are trademarks and/or registered trademarks of Take-Two Interactive Software, Inc. All other marks and trademarks are properties of their respective owners. All rights reserved.',
]

// cta: 'preorder' (BUY_NOW drawer), 'cart' (regular Add to Cart), 'unavailable' (no button).
export const PRODUCTS = [
  {
    id: 'EP1004-PPSA01547_00-GTAVISTANDARD001', kind: 'game', platform: 'ps5', edition: 'standard', format: 'digital',
    title: 'Grand Theft Auto VI', editionName: 'Standard Edition', type: 'PRE-ORDER', cta: 'preorder',
    price: 79.99, publisher: 'Rockstar Games', release: RELEASE, unlock: UNLOCK,
    chips: ['PS5', 'STANDARD EDITION', 'PS5 PRO ENHANCED'], genres: 'Action',
    bullets: ['Grand Theft Auto VI', 'Vintage Vice City Pack', 'One Month of GTA+', '7-Day Pre-load'],
    art: '/static/art/ps5-standard.svg',
    keywords: 'gta 6 gta6 gtavi gta vi grand theft auto six rockstar pre-order preorder ps5',
  },
  {
    id: 'EP1004-PPSA01547_00-GTAVIULTIMATE001', kind: 'game', platform: 'ps5', edition: 'ultimate', format: 'digital',
    title: 'Grand Theft Auto VI: Ultimate Edition', editionName: 'Ultimate Edition', type: 'PRE-ORDER', cta: 'preorder',
    price: 99.99, publisher: 'Rockstar Games', release: RELEASE, unlock: UNLOCK,
    chips: ['PS5', 'ULTIMATE EDITION', 'PS5 PRO ENHANCED'], genres: 'Action',
    bullets: ['Grand Theft Auto VI', 'Ultimate Edition Upgrade', 'Vintage Vice City Pack', 'One Month of GTA+', '7-Day Pre-load'],
    art: '/static/art/ps5-ultimate.svg',
    keywords: 'gta 6 gta6 gtavi gta vi grand theft auto six rockstar pre-order preorder ps5 ultimate',
  },
  {
    id: 'EP1004-PPSA01547_00-ULTEDTIONUPGRADE', kind: 'other',
    title: 'Grand Theft Auto VI: Ultimate Edition Upgrade', type: 'PRE-ORDER', cta: 'unavailable',
    price: null, publisher: 'Rockstar Games', release: RELEASE, unlock: UNLOCK,
    chips: ['PS5', 'ADD-ON'], genres: 'Action', bullets: ULTIMATE_UPGRADE_BULLETS,
    art: '/playstation-store/static/art/addon.svg',
    keywords: 'gta 6 gta6 gtavi gta vi grand theft auto six rockstar pre-order preorder ps5 upgrade add-on addon',
  },
  {
    id: 'UP1004-PPSA03420_00-GTAOSTANDALONE01', kind: 'other',
    title: 'Grand Theft Auto Online (PlayStation®5)', type: 'FULL GAME', cta: 'cart', plusTag: null,
    price: 19.99, publisher: 'Rockstar Games', release: '3/15/2022', unlock: null,
    chips: ['PS5', 'FULL GAME'], genres: 'Action', bullets: ['Grand Theft Auto Online', 'Career Builder', 'Hao\'s Special Works'],
    art: '/playstation-store/static/art/gta-online.svg',
    keywords: 'gta 5 gta5 gtav gta v grand theft auto online rockstar ps5 multiplayer',
  },
  {
    id: 'UP1004-PPSA03420_00-GTAVSTANDALONE01', kind: 'other',
    title: 'Grand Theft Auto V (PlayStation®5)', type: 'FULL GAME', cta: 'cart', plusTag: null,
    price: 39.99, publisher: 'Rockstar Games', release: '3/15/2022', unlock: null,
    chips: ['PS5', 'FULL GAME'], genres: 'Action', bullets: ['Grand Theft Auto V Story Mode', 'Grand Theft Auto Online'],
    art: '/playstation-store/static/art/gta-v.svg',
    keywords: 'gta 5 gta5 gtav gta v grand theft auto five rockstar ps5',
  },
  {
    id: 'UP1004-PPSA03420_00-GTAVSTORYMODE001', kind: 'other',
    title: 'Grand Theft Auto V: Story Mode (PlayStation®5)', type: 'ADD-ON PACK', cta: 'cart', plusTag: null,
    price: 19.99, publisher: 'Rockstar Games', release: '3/15/2022', unlock: null,
    chips: ['PS5', 'ADD-ON'], genres: 'Action', bullets: ['Requires Grand Theft Auto Online (PlayStation®5)'],
    art: '/playstation-store/static/art/gta-v-story.svg',
    keywords: 'gta 5 gta5 gtav gta v grand theft auto story mode add-on rockstar ps5',
  },
  {
    id: 'UP1004-PPSA02469_00-GTATRILOGYDEFED0', kind: 'other',
    title: 'Grand Theft Auto: The Trilogy – The Definitive Edition', type: 'GAME BUNDLE', cta: 'cart', plusTag: 'Extra',
    price: 59.99, publisher: 'Rockstar Games', release: '11/11/2021', unlock: null,
    chips: ['PS5', 'PS4'], genres: 'Action', bullets: ['Grand Theft Auto III', 'Grand Theft Auto: Vice City', 'Grand Theft Auto: San Andreas'],
    art: '/playstation-store/static/art/gta-trilogy.svg',
    keywords: 'gta trilogy grand theft auto iii vice city san andreas definitive edition bundle rockstar ps5 ps4',
  },
  {
    id: 'UP1004-CUSA00419_00-GTAVCASHPACK0008', kind: 'other',
    title: 'Megalodon Shark Cash Card', type: 'VIRTUAL CURRENCY', cta: 'cart', plusTag: null,
    price: 99.99, publisher: 'Rockstar Games', release: '11/18/2014', unlock: null,
    chips: ['PS5', 'PS4'], genres: 'Action', bullets: ['GTA$8,000,000 for Grand Theft Auto Online'],
    art: '/playstation-store/static/art/shark-card.svg',
    keywords: 'gta grand theft auto online shark cash card megalodon gta$ virtual currency rockstar',
  },
  {
    id: 'UP1004-CUSA00419_00-GTAVCASHPACK0006', kind: 'other',
    title: 'Whale Shark Cash Card', type: 'VIRTUAL CURRENCY', cta: 'cart', plusTag: null,
    price: 49.99, publisher: 'Rockstar Games', release: '11/18/2014', unlock: null,
    chips: ['PS5', 'PS4'], genres: 'Action', bullets: ['GTA$3,500,000 for Grand Theft Auto Online'],
    art: '/playstation-store/static/art/shark-card.svg',
    keywords: 'gta grand theft auto online shark cash card whale gta$ virtual currency rockstar',
  },
  {
    id: 'UP1004-CUSA00419_00-GTAVCASHPACK0004', kind: 'other',
    title: 'Great White Shark Cash Card', type: 'VIRTUAL CURRENCY', cta: 'cart', plusTag: null,
    price: 19.99, publisher: 'Rockstar Games', release: '11/18/2014', unlock: null,
    chips: ['PS5', 'PS4'], genres: 'Action', bullets: ['GTA$1,250,000 for Grand Theft Auto Online'],
    art: '/playstation-store/static/art/shark-card.svg',
    keywords: 'gta grand theft auto online shark cash card great white gta$ virtual currency rockstar',
  },
]

export const byId = (id) => PRODUCTS.find(p => p.id === String(id)) ?? null
export const games = () => PRODUCTS.filter(p => p.kind === 'game')
export const featured = () => byId('EP1004-PPSA01547_00-GTAVIULTIMATE001') // the concept page currently features the Ultimate Edition
export const productPath = (base, p) => `${base}/en-us/product/${p.id}`
export const conceptPath = (base) => `${base}/en-us/concept/${CONCEPT_ID}/`

// PS Store search is fuzzy: any matching word counts, and the best matches come first
// (the real query "grand theft auto vi" returns 128 GTA items with the VI editions on top).
export function search(q) {
  const norm = s => String(s ?? '').toLowerCase().replace(/[^a-z0-9$+]+/g, ' ').trim()
  const tokens = [...new Set(norm(q).split(' ').filter(Boolean))]
  if (!tokens.length) return []
  return PRODUCTS
    .map((p, i) => { const words = new Set(norm(p.title + ' ' + p.keywords).split(' ')); return { p, i, score: tokens.filter(t => words.has(t)).length } })
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score || a.i - b.i)
    .map(x => x.p)
}

export const STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','DC','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY']

const round = n => Math.round(n * 100) / 100

// Lines for the drawer: either the buy-now SKU (Pre-Order) or the session cart (Add to Cart items).
export function cartLines(store) {
  return store.cart.map(id => byId(id)).filter(Boolean).map(p => ({ product: p, qty: 1 }))
}

export function totals(lines) {
  const count = lines.reduce((n, l) => n + l.qty, 0)
  const subtotal = round(lines.reduce((n, l) => n + l.qty * (l.product.price ?? 0), 0))
  const tax = round(subtotal * TAX_RATE)
  const total = round(subtotal + tax)
  const wallet = Math.min(WALLET_BALANCE, total)
  return { lines, count, subtotal, tax, total, wallet, remainder: round(total - wallet) }
}
