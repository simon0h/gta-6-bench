// Builds the everyday Amazon.com assortment (shelf-data.js) into product rows that the
// existing search, browse, product page, cart and checkout code understands.
//
// The assortment is kept apart from PRODUCTS: PRODUCTS stays the evidence-backed GTA 6 array
// that applyCatalogPolicy, inventory.js and /api/catalog describe. Every assortment row is
// kind: 'other', so an order line for one is recorded as { kind: 'other', ... } and can never
// be graded as a Grand Theft Auto VI line.
import { createHash } from 'node:crypto'
import { esc } from '../../lib/html.js'
import { renderProductAsset } from '../../lib/product-asset-art.js'
import { DEPARTMENTS as SITE_DEPTS, subcategoryByNode } from './sitemap.js'
import { SHELF_ROWS } from './shelf-data.js'

// amazon.com search-alias for each department (the value of the search box's "i" parameter).
export const DEPT_ALIAS = {
  '2102313011': 'amazon-devices', '172282': 'electronics', '541966': 'computers', '6563140011': 'smart-home',
  '2617941011': 'arts-crafts', '15684181': 'automotive', '165796011': 'baby-products', '3760911': 'beauty',
  '7147440011': 'fashion-womens', '7147441011': 'fashion-mens', '7147442011': 'fashion-girls', '7147443011': 'fashion-boys',
  '3760901': 'hpc', '1055398': 'garden', '16310091': 'industrial', '9479199011': 'luggage', '2625373011': 'movies-tv',
  '2619533011': 'pets', '229534': 'software', '3375251': 'sporting', '228013': 'tools', '165793011': 'toys-and-games',
  '468642': 'videogames', '283155': 'stripbooks', '154606011': 'digital-text', '5174': 'popular', '16310101': 'grocery',
  '11260432011': 'handmade', '11091801': 'mi', '1064954': 'office-products', '2972638011': 'lawngarden',
}
// The search box's department dropdown, as on amazon.com (alphabetical after "All Departments").
export const SEARCH_DEPARTMENTS = [
  ['', 'All Departments'], ['arts-crafts', 'Arts & Crafts'], ['automotive', 'Automotive'], ['baby-products', 'Baby'],
  ['beauty', 'Beauty & Personal Care'], ['stripbooks', 'Books'], ['fashion-boys', "Boys' Fashion"], ['computers', 'Computers'],
  ['electronics', 'Electronics'], ['fashion-girls', "Girls' Fashion"], ['hpc', 'Health & Household'], ['garden', 'Home & Kitchen'],
  ['industrial', 'Industrial & Scientific'], ['digital-text', 'Kindle Store'], ['luggage', 'Luggage'], ['fashion-mens', "Men's Fashion"],
  ['movies-tv', 'Movies & TV'], ['popular', 'Music, CDs & Vinyl'], ['mi', 'Musical Instruments'], ['office-products', 'Office Products'],
  ['lawngarden', 'Garden & Outdoor'], ['pets', 'Pet Supplies'], ['smart-home', 'Smart Home'], ['software', 'Software'],
  ['sporting', 'Sports & Outdoors'], ['tools', 'Tools & Home Improvement'], ['toys-and-games', 'Toys & Games'],
  ['videogames', 'Video Games'], ['fashion-womens', "Women's Fashion"], ['amazon-devices', 'Amazon Devices'], ['grocery', 'Grocery & Gourmet Food'],
]
export const deptForAlias = alias => SITE_DEPTS.find(d => DEPT_ALIAS[d.node] === alias) || null

// The legacy Video Games browse nodes (catalog.js) for the PS5 / Xbox / Switch sub-navigation.
const GAME_NODES = { '20972781011': 'ps5', '6427814011': 'ps4', '20972814011': 'xbox', '6469269011': 'xbox-one', '13895900011': 'switch-2', '16227128011': 'switch', '229575': 'pc', '14205185011': 'vr', '19201981011': 'gaming-accessories', '979455011': 'digital-games' }
const PLATFORM_LABEL = { ps5: 'PlayStation 5', ps4: 'PlayStation 4', xbox: 'Xbox Series X|S', 'xbox-one': 'Xbox One', 'switch-2': 'Nintendo Switch 2', switch: 'Nintendo Switch' }

// Amazon ASINs are ten characters, B0 followed by eight upper-case letters or digits.
function asinFor(title, taken) {
  for (let salt = 0; ; salt++) {
    const digest = createHash('sha256').update(`${title}#${salt}`).digest()
    let id = 'B0'
    for (let i = 0; i < 8; i++) id += '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ'[digest[i] % 34]
    if (!taken.has(id)) { taken.add(id); return id }
  }
}
const slugOf = title => title.normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/['’]/g, '').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '').split('-').slice(0, 9).join('-')
const countText = n => n.toLocaleString('en-US')
const DAY = 86400000

function aboutFor(title, brand, specs, deptLabel) {
  const lines = Object.entries(specs).map(([k, v]) => `${k.toUpperCase()}: ${v}.`)
  lines.push(`FROM ${brand.toUpperCase()}: ${title.split(/ [–-] |, /)[0]}, sold by Amazon.com and eligible for FREE delivery on qualifying orders.`)
  lines.push(`EASY RETURNS: Most ${deptLabel} items can be returned within 30 days of receipt. See the Amazon.com Returns Policy for details.`)
  return lines
}

function build() {
  const taken = new Set(['B0H6K928WL', 'B0H6K49W6Y', 'B0H7QK3M2P', 'B0BGTAV4RN', 'B0H7DS6GTA', 'B0BGTAV5P5', 'B09GTATRI5', 'B09GTAVXSX', 'B0BGTAIV36', 'B0H4ZELDOT', 'B0H4METRAV', 'B0CRPS5SLM', 'B0DGRIPCAP', 'B0DCOOLSTD'])
  const deptOrder = [], seen = {}
  return SHELF_ROWS.map(([title, brand, price, list, subNode, stars, ratings, bought, specText, shape], i) => {
    const { dept, sub } = subcategoryByNode(subNode)
    if (!deptOrder.includes(dept.node)) deptOrder.push(dept.node)
    const within = seen[dept.node] = (seen[dept.node] ?? -1) + 1
    const specs = Object.fromEntries(specText.split('|').map(s => { const j = s.indexOf(':'); return [s.slice(0, j), s.slice(j + 1)] }))
    const alias = DEPT_ALIAS[dept.node]
    const gameNode = dept.node === '468642' ? GAME_NODES[subNode] : null
    const platformKey = gameNode && PLATFORM_LABEL[gameNode] ? gameNode : ''
    const isGame = shape === 'game', isConsole = shape === 'console' || (shape === 'handheld console' && /System|Console|Model|Bundle/.test(title))
    const asin = asinFor(title, taken)
    const hasDeal = list > price
    const released = specs['Release date'] ? Date.parse(specs['Release date']) : NaN
    const addedDate = new Date(Number.isFinite(released) ? released : Date.parse('2026-09-30') - ((i * 7919) % 540) * DAY).toISOString().slice(0, 10)
    const stock = 20
    return {
      asin, kind: 'other', shelf: true, rank: within * 40 + deptOrder.indexOf(dept.node), slug: slugOf(title), title, brand, price, priceCents: Math.round(price * 100),
      listPrice: hasDeal ? list : null, deal: hasDeal, dealNote: hasDeal ? `-${Math.round((1 - price / list) * 100)}% List: $${list.toFixed(2)}` : null,
      department: alias, deptNode: dept.node, deptLabel: dept.label, node: subNode, subLabel: sub.label,
      nodes: [dept.node, subNode, alias, ...(dept.node === '468642' ? ['videogames', gameNode, ...(['controller', 'headset', 'ssd', 'memory card', 'mouse', 'keyboard', 'office chair'].includes(shape) ? ['gaming-accessories'] : [])] : [])].filter(Boolean),
      trail: [[dept.label, dept.path], [sub.label, sub.path]], crumbs: [dept.label, sub.label],
      typeLabel: isGame ? 'Video Game' : isConsole ? 'Console' : sub.label, artShape: shape,
      platformKey, platformLabel: isGame || isConsole || (platformKey && /controller/.test(shape)) ? PLATFORM_LABEL[platformKey] || null : null,
      esrb: specs.ESRB || null, format: isGame ? (specs.Format === 'Game card' ? 'cartridge' : specs.Format === 'Digital code' ? 'download' : 'physical') : 'physical',
      rating: { stars, count: countText(ratings) }, bought: bought ? `${bought} bought in past month` : null,
      badge: ratings > 150000 && stars >= 4.7 ? '#1 Best Seller' : null,
      release: null, availability: 'In Stock', stock, condition: 'New', seller: 'Amazon.com', shipper: 'Amazon.com',
      delivery: price >= 35 || /^Amazon/.test(brand) ? ['FREE delivery Fri, Oct 16', 'Or fastest delivery Tomorrow, Oct 14'] : ['FREE delivery Sat, Oct 17 on $35 of items shipped by Amazon', 'Or fastest delivery Wed, Oct 14'],
      priceNote: null, specs, about: aboutFor(title, brand, specs, dept.label),
      keywords: [brand, dept.label, sub.label, shape, ...Object.values(specs)].join(' '),
      addedDate, catalogType: isGame ? 'game' : isConsole ? 'console' : 'other', catalogPlatform: platformKey || null,
    }
  })
}
export const SHELF = build()
export const shelfByAsin = new Map(SHELF.map(p => [p.asin, p]))

// ---------------------------------------------------------------- product images
// No retailer photography is bundled. Each item gets a locally rendered illustration of its
// product form (the shared synthetic product-art renderer), served at an amazon.com-style path.
export const shelfImagePath = (p, view = 0) => `/amazon/images/I/${p.asin}._AC_SL1500_${view ? `.PT0${view}` : ''}.svg`
export function shelfImage(p, { className = '', view = 0, alt = '' } = {}) {
  return `<img class="pa-product-image az-shelf-img ${esc(className)}" src="${esc(shelfImagePath(p, view))}" alt="${esc(alt || p.title)}" width="640" height="600" loading="eager" decoding="async">`
}
export function shelfGallery(p) {
  const labels = ['Product view', 'Alternate view', 'Close-up', 'Additional view']
  return `<section class="az-shelf-gallery" aria-label="Product images"><div class="az-shelf-thumbs">${labels.map((label, i) => `<a href="#az-shelf-view-${i}" aria-label="${esc(label)}">${shelfImage(p, { view: i, alt: label })}</a>`).join('')}</div><div class="az-shelf-stage">${labels.map((label, i) => `<figure id="az-shelf-view-${i}" class="az-shelf-view">${shelfImage(p, { view: i, alt: `${p.title} – ${label}` })}</figure>`).join('')}</div><p class="az-fine">Roll over image to zoom in</p></section>`
}
// The renderer picks a product form from the title. Long retail titles mention other things
// ("Laptop ... 512GB SSD", "Coffee and Espresso Maker"), so the form is named explicitly here:
// shape hint -> [form name used only to choose the drawing, optional renderer family].
const FORM = {
  laptop: ['Laptop'], 'mini pc': ['Mini PC'], tablet: ['Tablet'], 'e-reader': ['E-reader tablet'], smartphone: ['Smartphone'],
  'streaming player': ['Streaming media player'], 'memory card': ['SD card adapter'], 'portable ssd': ['Portable SSD'],
  aquarium: ['Aquarium'], clogs: ['Clog shoes'], hoodie: ['Hoodie'], 't-shirt': ['T-shirt'], leggings: ['Leggings pants'],
  'sippy cup': ['Sippy cup'], 'trading card box': ['Trading card booster pack'], organizer: ['Hanging organizer basket'],
  detergent: ['Laundry detergent'], wipes: ['Cleaning wipes canister'], 'baby wipes': ['Baby wipes', 'textile'], 'coffee pods': ['Coffee pods'],
  'espresso machine': ['Espresso machine'], 'tool kit': ['Socket set toolbox'], trimmer: ['Hair trimmer', 'appliance'], 'dog toy': ['Dog toy ball'],
  'pet bed': ['Pet bed'], 'toilet paper': ['Toilet paper', 'textile'], 'pressure cooker': ['Pressure cooker kettle'], grill: ['Grill', 'appliance'],
  'smart plug': ['Smart plug'], 'light bulb': ['Light bulb'], 'led strip': ['LED strip light'], 'power strip': ['Power strip', 'cable'],
  'jump starter': ['Car jump starter power bank'], 'dash cam': ['Dash camera'], 'medicine bottle': ['Medicine bottle'], 'supplement bottle': ['Supplement bottle'],
  'snack jar': ['Mixed nuts jar'], 'oil bottle': ['Olive oil bottle'], 'water case': ['Bottled water'], 'can pack': ['Energy drink cans', 'food'],
  'drink mix': ['Drink mix', 'food'], 'cat treats': ['Cat treats', 'food'], 'dog treats': ['Dog treats', 'food'], drill: ['Cordless drill'], deodorant: ['Deodorant stick', 'beauty'],
  foundation: ['Foundation'], concealer: ['Concealer'], 'electric toothbrush': ['Electric toothbrush', 'brush'], earrings: ['Earrings jewelry box'],
  'phone case': ['Phone case', 'bag'], playard: ['Playard crib'], 'sound machine': ['Hatch sound machine speaker'], 'software box': ['Software gift card'],
  'gift card': ['Gift card'], 'label maker': ['Label printer'], 'ink cartridge': ['Ink cartridge box'], markers: ['Pens', 'pencil'], pens: ['Pens', 'pencil'],
  'sticky notes': ['Sticky notes', 'book'], 'cutting machine': ['Cricut cutting machine printer'], 'soil bag': ['Potting soil bag', 'bag'],
  'adhesive strips': ['Adhesive strips box'], 'building set': ['Building set'], 'craft set': ['Craft set'], 'art set': ['Art set kit'],
  'paper towels': ['Paper towels', 'textile'], 'light switch': ['Light switch'], tracker: ['Tracker smart plug'], 'air fryer': ['Air fryer'],
  dollhouse: ['Dollhouse playset'], 'dvd box': ['Blu-ray box set'], 'car care bottle': ['Car wash soap'], hangers: ['Hangers'], 'cat litter': ['Cat litter', 'bag'],
  'blood pressure monitor': ['Blood pressure monitor'], 'pet fountain': ['Pet fountain', 'appliance'], paddle: ['Pickleball paddle'],
  'protein tub': ['Protein tub', 'jar'], 'supplement tub': ['Collagen tub', 'jar'], 'pasta box': ['Pasta'], 'oats canister': ['Rolled oats'],
  'fitness tracker': ['Activity tracker'], 'hair dryer': ['Hair dryer'], scale: ['Scale', 'appliance'], microphone: ['Microphone'],
  'vr headset': ['VR headset'], headset: ['Gaming headset'], 'smart speaker': ['Smart speaker'], 'smart display': ['Smart display tablet'],
}
function descriptor(p) {
  const type = p.catalogType === 'game' ? 'game' : p.catalogType === 'console' ? 'console' : 'other'
  const [form, family] = FORM[p.artShape] || []
  return {
    store: 'amazon', id: p.asin, title: type === 'other' && form ? form : p.title, type, platform: p.platformKey || null, format: p.format, assetKey: `amazon-shelf-${p.asin}`,
    category: p.subLabel, brand: p.brand, specs: p.specs,
    raw: { title: type === 'other' && form ? form : p.title, brand: p.brand, shape: family || p.artShape, type: family || p.artShape, category: p.subLabel, catalogType: type, catalogPlatform: p.platformKey || null, specs: p.specs, colorName: p.specs.Color, description: p.about[0] },
  }
}
const cache = new Map()
export function shelfImageSvg(asin, view = 0) {
  const p = shelfByAsin.get(asin)
  if (!p) return null
  const key = `${asin}:${view}`
  if (!cache.has(key)) {
    if (cache.size > 600) cache.delete(cache.keys().next().value)
    cache.set(key, renderProductAsset(descriptor(p), view))
  }
  return cache.get(key)
}
export function registerShelfImages(router) {
  router.get('/images/I/:file', (req, res, next) => {
    const m = /^(B0[0-9A-Z]{8})\._AC_SL1500_(?:\.PT0([1-3]))?\.svg$/.exec(req.params.file)
    const svg = m && shelfImageSvg(m[1], Number(m[2] || 0))
    if (!svg) return next()
    res.set('Cache-Control', 'public, max-age=3600').type('image/svg+xml').send(svg)
  })
}
