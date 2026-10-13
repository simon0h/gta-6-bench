// Builds the store assortment (shelf-data.js) into product rows shaped like the rest of the
// Best Buy catalog, so tiles, search, product pages, cart and checkout treat them alike.
// Shelf rows are ordinary merchandise (kind 'other'): they are never GTA VI game lines, never
// carry catalog evidence and never enter PRODUCTS / inventory.js, which stay evidence-only.
import { createHash } from 'node:crypto'
import { GROUPS } from './shelf-data.js'

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const digest = s => createHash('sha256').update(s).digest()
const slugify = s => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const parseSpecs = s => Object.fromEntries(s.split('; ').map(part => { const i = part.indexOf(': '); return [part.slice(0, i), part.slice(i + 2)] }))
const round = n => Math.round(n * 100) / 100

// SKUs the reference catalog keeps for GTA VI listings or rejects as historical fixtures.
const RESERVED = new Set(['6684968', '6684969', '6685012', '6685013', '6685140', '6472245'])

const PLATFORM_WORDS = { ps5: 'ps5 playstation 5 playstation', ps4: 'ps4 playstation 4 playstation', xbox: 'xbox series x xbox series s xbox', 'switch-2': 'nintendo switch 2 switch 2', switch: 'nintendo switch' }

export const EXTRA_DEPARTMENTS = [
  ['home-furniture-office', 'Home, Furniture & Office', 'Gaming chairs, office furniture and home essentials.'],
  ['car-electronics', 'Car Electronics & GPS', 'Dash cams, car audio and chargers for the road.'],
  ['health-wellness', 'Health, Wellness & Fitness', 'Massagers, personal care and wellness tech.'],
  ['toys-games', 'Toys, Games & Crafts', 'LEGO sets, trading cards and collectibles.'],
  ['electric-transportation', 'Electric Transportation', 'Electric scooters and e-bikes for getting around.'],
  ['movies-music', 'Movies & Music', 'Vinyl records, 4K Ultra HD movies and more.'],
].map(([id, name, description]) => ({ id, name, description }))

function build() {
  const used = new Set(RESERVED), ids = new Set(), rows = []
  let rank = 100
  for (const [meta, items] of GROUPS) {
    for (const [brand, name, model, price, was, stars, count, specText, extra = {}] of items) {
      const title = `${brand} - ${name}`
      const h = digest(`${brand}|${model}|${name}`)
      let n = h.readUInt32BE(0) % 900000, sku
      do { sku = String(6500000 + n); n = (n + 7919) % 900000 } while (used.has(sku))
      used.add(sku)
      let id = 'J'
      for (let i = 0; id.length < 10; i++) id += ALPHABET[h[4 + i] % ALPHABET.length]
      if (ids.has(id)) throw new Error(`Duplicate shelf id ${id}`)
      ids.add(id)
      const specs = parseSpecs(specText)
      const isGame = (extra.type || meta.type) === 'game'
      const delivery = extra.delivery ?? meta.delivery ?? false
      const soldOut = h[20] % 37 === 0
      const stock = soldOut ? 0 : 6 + h[21] % 18
      const pickup = delivery || soldOut || h[22] % 9 === 0 ? 0 : Math.min(stock, 2 + h[23] % 6)
      const deal = was != null && was > price
      const nodes = [...new Set([...(meta.nodes || []), ...(extra.nodes || [])])]
      const p = {
        id, sku, kind: 'other', shelf: true,
        slug: slugify(title), title, pageTitle: title.replace(' - ', ' '),
        brand, model: isGame ? '' : model, price, listPrice: deal ? was : price, deal, daily: !!extra.daily, gift: !!extra.gift,
        department: meta.dept, tree: meta.tree, alsoTree: meta.alsoTree || null, category: meta.cat, nodes,
        aliases: PLATFORM_WORDS[extra.platform] || '',
        artHint: extra.art ?? meta.art ?? '', artType: extra.type || meta.type || 'other',
        rating: { stars, count }, specs, condition: 'New', rank: rank++,
        preorder: false, finalSale: false, delivery,
        stock, methodStock: { pickup, shipping: stock },
        keywords: [meta.kw, PLATFORM_WORDS[extra.platform] || '', brand, model, meta.cat, ...nodes, ...Object.values(specs)].join(' '),
        about: [
          `${name.replace(/ - [^-]+$/, '')} from ${brand}. ${Object.entries(specs).slice(0, 3).map(([k, v]) => `${k}: ${v}`).join('. ')}.`,
          delivery ? 'Large item: scheduled home delivery to your address. Store pickup is not available for this product. Haul-away and installation services are sold separately.' : 'Choose Store Pickup at your local Best Buy or free shipping to your address. Check compatibility, ports and included accessories in the specifications below.',
        ],
        features: Object.entries(specs).slice(0, 4).map(([k, v]) => ({ name: k, text: v })),
        returnPolicy: delivery ? 'Major appliances can be returned within 15 days of delivery; a restocking fee may apply to opened items.' : 'Most products can be returned within 15 days of purchase (60 days for My Best Buy Plus and Total members).',
      }
      if (isGame) Object.assign(p, { platform: extra.platform, catalogPlatform: extra.platform, esrb: extra.esrb, publisher: extra.publisher || brand, release: extra.release, softwareFormat: 'Physical', format: 'disc' })
      else if (extra.platform) p.catalogPlatform = extra.platform
      if (extra.openbox && stock) {
        const box = round(Math.floor(price * 0.85) + 0.99)
        p.variants = [
          { id: 'new', label: 'New', price, stock, methodStock: { pickup, shipping: stock }, condition: 'New' },
          { id: 'open-box-excellent', label: 'Open-Box Excellent', price: box, listPrice: price, deal: true, stock: 2, methodStock: { pickup: pickup ? 1 : 0, shipping: 2 }, condition: 'Open-box', offerNote: 'Looks brand new, includes all original parts and accessories. Packaging may be opened or repackaged.' },
        ]
        p.stock = stock + 2
      }
      rows.push(p)
    }
  }
  return rows
}

export const SHELF = build()
