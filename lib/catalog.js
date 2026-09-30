// Canonical GTA 6 product data shared by every store clone.
// Stores decide their own listing titles, SKUs and prices, but every
// cart line and every recorded order must use these canonical ids so the
// benchmark can check "did the agent pre-order the right thing?" uniformly.

export const GAME = {
  title: 'Grand Theft Auto VI',
  short_title: 'GTA VI',
  publisher: 'Rockstar Games',
  developer: 'Rockstar Games',
  release_date: '2026-11-19',
  release_date_text: 'November 19, 2026',
  genre: 'Action / Adventure',
  esrb: 'M (Mature 17+)',
  pegi: '18',
  players: '1 player (online multiplayer)',
  description:
    'Grand Theft Auto VI heads to the state of Leonida, home to the neon-soaked streets of Vice City and beyond, in the biggest, most immersive evolution of the Grand Theft Auto series yet. Follow Jason and Lucia as they get caught up in a criminal conspiracy that stretches across the state.',
  preorder_bonus:
    'Pre-order before November 20, 2026 to receive the Vintage Vice City Pack and one month of GTA+.',
}

export const PLATFORMS = {
  ps5: { id: 'ps5', name: 'PlayStation 5', short: 'PS5' },
  xbox: { id: 'xbox', name: 'Xbox Series X|S', short: 'Xbox Series X|S' },
}

export const EDITIONS = {
  standard: {
    id: 'standard',
    name: 'Standard Edition',
    includes: ['Grand Theft Auto VI', 'Vintage Vice City Pack (pre-order bonus)'],
  },
  ultimate: {
    id: 'ultimate',
    name: 'Ultimate Edition',
    includes: [
      'Grand Theft Auto VI',
      'Vintage Vice City Pack (pre-order bonus)',
      'Exclusive collection of premium vehicles, weapons and apparel',
      'Bonus story content threaded through Jason and Lucia\'s story',
    ],
  },
}

export const FORMATS = {
  physical: { id: 'physical', name: 'Physical (disc)' },
  'code-in-box': { id: 'code-in-box', name: 'Code in Box' },
  digital: { id: 'digital', name: 'Digital download' },
}

// Baseline prices per currency. A store may override (e.g. Walmart $79.00).
export const PRICES = {
  USD: { standard: 79.99, ultimate: 99.99 },
  GBP: { standard: 69.99, ultimate: 89.99 },
  AUD: { standard: 129.95, ultimate: 159.95 },
}

export function isPlatform(id) { return Object.hasOwn(PLATFORMS, id) }
export function isEdition(id) { return Object.hasOwn(EDITIONS, id) }
export function isFormat(id) { return Object.hasOwn(FORMATS, id) }
