// Listings as they appear on gamestop.com (research/gamestop.md, 2026-09-29).
export const TAX_RATE = 0.07125 // cart showed $5.70 estimated tax on $79.99 before any address

const GAME_FEATURES = (platform) => [
  platform === 'ps5'
    ? 'This product will only contain a download code inside the box to support pre-load starting on November 12. A disc will not be included in the box. Code can only be used by users holding an account for PlayStation® registered to the US or Canada.'
    : 'This product will only contain a download code inside the box to support pre-load starting on November 12. A disc will not be included in the box.',
  'Pre-order to receive the Vintage Vice City Pack.',
  'Grand Theft Auto VI is a single-player experience.',
  'Grand Theft Auto VI heads to the state of Leonida, home to the neon-soaked streets of Vice City and beyond, in the biggest, most immersive evolution of the Grand Theft Auto series yet.',
]

export const PRODUCTS = [
  {
    id: '448295', kind: 'game', platform: 'ps5', edition: 'standard', format: 'code-in-box',
    category: 'playstation-5', categoryName: 'PlayStation 5', selectorLabel: 'PlayStation 5',
    slug: 'grand-theft-auto-vi---playstation-5-code-in-box',
    title: 'Grand Theft Auto VI - PlayStation 5 (Code in Box)',
    brand: 'Rockstar Games', price: 79.99, proPrice: null, release: '11/12/2026',
    badge: '50+ Purchased Recently', esrb: 'RP (Rating Pending)', condition: 'New',
    art: '/static/art/ps5-standard.svg', features: GAME_FEATURES('ps5'),
    keywords: 'gta 6 gta6 gta vi gtavi grand theft auto 6 rockstar games pre-order preorder playstation ps5 video games',
  },
  {
    id: '448297', kind: 'game', platform: 'xbox', edition: 'standard', format: 'code-in-box',
    category: 'xbox-series-x|s', categoryName: 'Xbox Series X|S', selectorLabel: 'Xbox Series X',
    slug: 'grand-theft-auto-vi---xbox-series-x-s-code-in-box',
    title: 'Grand Theft Auto VI - Xbox Series X/S (Code in Box)',
    brand: 'Rockstar Games', price: 79.99, proPrice: null, release: '11/12/2026',
    badge: null, esrb: 'RP (Rating Pending)', condition: 'New',
    art: '/static/art/xbox-standard.svg', features: GAME_FEATURES('xbox'),
    keywords: 'gta 6 gta6 gta vi gtavi grand theft auto 6 rockstar games pre-order preorder xbox series x video games',
  },
  {
    id: '448310', kind: 'other', category: 'playstation-5', categoryName: 'PlayStation 5',
    slug: 'sony-dualsense-wireless-controller-for-playstation-5---grand-theft-auto-vi-white-limited-edition',
    title: 'Sony DualSense Wireless Controller for PlayStation 5 - Grand Theft Auto VI White Limited Edition',
    brand: 'Sony Interactive Entertainment', price: 84.99, proPrice: null, release: '11/19/2026',
    badge: null, esrb: null, condition: 'New', art: '/static/art/accessory.svg',
    features: ['Limited edition Grand Theft Auto VI design in white.', 'Haptic feedback and adaptive triggers.', 'Built-in microphone and headset jack.'],
    keywords: 'gta 6 gta6 gta vi gtavi grand theft auto controller dualsense sony playstation ps5 pre-order preorder gaming accessories',
  },
  {
    id: '448312', kind: 'other', category: 'electronics', categoryName: 'Electronics',
    slug: 'grand-theft-auto-vi-the-album-original-soundtrack-various-artists-2x-lp',
    title: 'Grand Theft Auto VI: The Album (Original Soundtrack) (Various Artists) 2x LP',
    brand: 'Rockstar Games', price: 54.99, proPrice: 52.24, release: '11/19/2026',
    badge: null, esrb: null, condition: 'New', art: '/static/art/vinyl.svg',
    features: ['Double LP pressing of the official soundtrack.', 'Gatefold sleeve.'],
    keywords: 'gta 6 gta6 gta vi gtavi grand theft auto album soundtrack vinyl lp music pre-order preorder electronics',
  },
]

export const byId = (id) => PRODUCTS.find(p => p.id === String(id)) ?? null

export function productPath(base, p) {
  return `${base}/video-games/${encodeURIComponent(p.category)}/products/${p.slug}/${p.id}.html`
}

export function search(q) {
  const norm = s => String(s ?? '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
  const tokens = norm(q).split(' ').filter(Boolean)
  if (!tokens.length) return []
  return PRODUCTS.filter(p => { const hay = norm(p.title + ' ' + p.keywords); return tokens.every(t => hay.includes(t)) })
}

export const STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','DC','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY']

export const SHIPPING_METHODS = {
  premium: { id: 'premium', name: 'Premium', price: 0, eta: 'Arrives on or shortly after release day' },
  rush: { id: 'rush', name: 'Rush', price: 9.99, eta: 'Arrives on release day' },
}

const round = n => Math.round(n * 100) / 100

export function cartLines(store) {
  return store.cart.map(l => ({ ...l, product: byId(l.pid) })).filter(l => l.product)
}

export function totals(store, shippingMethod = 'premium') {
  const lines = cartLines(store)
  const count = lines.reduce((n, l) => n + l.qty, 0)
  const subtotal = round(lines.reduce((n, l) => n + l.qty * l.product.price, 0))
  const shipping = SHIPPING_METHODS[shippingMethod]?.price ?? 0
  const tax = round(subtotal * TAX_RATE)
  return { lines, count, subtotal, shipping, tax, total: round(subtotal + shipping + tax) }
}
