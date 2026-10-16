// Nike shelf: the nike.com assortment shown in the default reference catalog.
// Kept apart from the captured "gta 6" search evidence (search-reference.js,
// catalogObservations in reference.js): shelf rows are never catalog
// observations and are ordered only as `kind: 'other'` lines.
import { createHash } from 'node:crypto'
import { renderProductAsset } from '../../lib/product-asset-art.js'
import { SECTIONS } from './shelf-data.js'

const hash = s => createHash('sha256').update(s).digest()
const ALPHA = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const urlId = seed => [...hash(seed).subarray(0, 6)].map(b => ALPHA[b % 62]).join('')
const kebab = s => s.toLowerCase().replace(/[®™]/g, '').replace(/['’"]/g, '').replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

// Nike colour names -> the colour families used by the "Color" filter.
const FAMILY = [
  ['Black', /^(black|anthracite|obsidian|dark smoke grey|off noir|carbon|iron grey|dark grey)/i],
  ['White', /^(white|summit white|photon dust|pure platinum|optical white|ivory)/i],
  ['Grey', /^(wolf grey|cool grey|dark grey heather|light smoke grey|metallic silver|smoke grey|grey|light iron ore|football grey|platinum)/i],
  ['Brown', /^(wheat|cacao|light orewood brown|baroque brown|hemp|khaki|light british tan|carob brown|dark stucco|parchment)/i],
  ['Blue', /^(game royal|hyper royal|midnight navy|university blue|armory navy|rush blue|deep royal|old royal|college navy|laser blue|coast)/i],
  ['Red', /^(university red|gym red|light crimson|burgundy|noble red|varsity red|team red)/i],
  ['Pink', /^(pink foam|aster pink|hyper pink|light soft pink)/i],
  ['Purple', /^(hydrangeas|field purple)/i],
  ['Green', /^(medium olive|vintage green|mint foam|sail\/medium olive)/i],
  ['Orange', /^(hyper orange|total orange|amber)/i],
  ['Yellow', /^(volt|amarillo|citrine|wheat gold)/i],
  ['Multi-Color', /^multi/i],
  ['White', /^(sail|coconut milk|light bone|egret)/i],
]
const family = name => FAMILY.find(([, re]) => re.test(name))?.[0] || 'Multi-Color'
const SWATCH = { Black: '#111111', White: '#f5f5f5', Grey: '#9e9ea0', Brown: '#8d6e4d', Blue: '#1f4fa0', Red: '#c4262e', Pink: '#f4a7b9', Purple: '#8e6bbf', Green: '#5d7a4b', Orange: '#f26b21', Yellow: '#d6e030', 'Multi-Color': '#8a8a8a' }
const ART = { Black: 'black', White: 'white', Grey: 'grey', Brown: 'brown', Blue: 'navy', Red: 'red', Pink: 'pink', Purple: 'purple', Green: 'green', Orange: 'orange', Yellow: 'yellow', 'Multi-Color': 'stone' }

// Size runs as nike.com lists them.
const range = (from, to, step = 0.5) => { const out = []; for (let v = from; v <= to + 1e-9; v += step) out.push(String(v)); return out }
const SIZE_RUNS = {
  men: range(6, 13).concat(['14', '15']).map(s => `M ${s} / W ${+s + 1.5}`),
  women: range(5, 12).map(s => `W ${s} / M ${+s - 1.5}`),
  unisex: range(4, 13).concat(['14', '15']).map(s => `M ${s} / W ${+s + 1.5}`),
  big: range(3.5, 7).map(s => `${s}Y`),
  little: ['10.5C', '11C', '11.5C', '12C', '12.5C', '13C', '13.5C', '1Y', '1.5Y', '2Y', '2.5Y', '3Y'],
  baby: ['2C', '3C', '4C', '5C', '6C', '7C', '8C', '9C', '10C'],
  apparel: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  'apparel-w': ['XS (0-2)', 'S (4-6)', 'M (8-10)', 'L (12-14)', 'XL (16-18)', '2XL (20-22)'],
  'apparel-k': ['XS (6-7)', 'S (8)', 'M (10-12)', 'L (14-16)', 'XL (18-20)'],
  'apparel-little': ['4', '5', '6', '7'],
  'apparel-baby': ['12M', '18M', '24M'],
  socks: ['S (W 4-6 / Y 3-5)', 'M (M 6-8 / W 6-10)', 'L (M 8-12 / W 10-13)', 'XL (M 12-15 / W 14-16)'],
  one: ['One Size'],
  balls: ['Size 4', 'Size 5'],
  basketball: ['Size 6 (28.5")', 'Size 7 (29.5")'],
  gloves: ['S', 'M', 'L', 'XL'],
}
function sizesFor(p) {
  if (p.cat === 'shoes') return p.g === 'kids' ? SIZE_RUNS[p.age] : SIZE_RUNS[p.g]
  if (p.cat === 'clothing') return p.g === 'kids' ? SIZE_RUNS[p.age === 'big' ? 'apparel-k' : p.age === 'little' ? 'apparel-little' : 'apparel-baby'] : p.g === 'women' ? SIZE_RUNS['apparel-w'] : SIZE_RUNS.apparel
  if (p.type === 'socks') return SIZE_RUNS.socks
  if (/Soccer Ball/.test(p.subtitle)) return SIZE_RUNS.balls
  if (/Basketball \(/.test(p.subtitle)) return SIZE_RUNS.basketball
  if (/Gloves|Shin Guards/.test(p.subtitle)) return SIZE_RUNS.gloves
  return SIZE_RUNS.one
}

// Shoe art leans on the renderer's keyword cues for each silhouette.
function artHint(p) {
  if (p.cat === 'shoes') {
    const bits = [p.type === 'sandals' ? 'slide sandal' : p.type === 'cleats' ? 'soccer cleat stud' : p.type === 'trail' ? 'trail lug shoe' : p.type === 'basketball' ? 'high-top shoe' : 'lace sneaker']
    if (p.height === 'high' || p.height === 'mid') bits.push('high-top')
    if (/Air Max|Vomero|Invincible|Alphafly|Vaporfly|Pegasus Plus/.test(p.title)) bits.push('cushion')
    return bits.join(' ')
  }
  if (p.cat === 'clothing') return { hoodies: 'hoodie pocket long', pants: 'pants jogger', leggings: 'leggings tights', shorts: 'shorts', tops: 'tee shirt', bras: 'bra tank', jackets: 'jacket zip long', jerseys: 'jersey tank', sets: 'hoodie long', swim: 'bra tank' }[p.type] || 'shirt'
  if (p.type === 'socks') return 'sock'
  if (p.type === 'hats') return /Headband/.test(p.subtitle) ? 'cap band' : 'cap'
  if (p.type === 'bags') return /Backpack/.test(p.subtitle) ? 'backpack' : 'duffel gym bag'
  if (p.shape === 'ball') return 'ball'
  if (/Gloves/.test(p.subtitle)) return 'glove'
  if (/Bottle/.test(p.subtitle)) return 'bottle'
  if (/Mat/.test(p.subtitle)) return 'yoga mat'
  return 'fitness exercise'
}
const ART_SHAPE = p => p.cat === 'shoes' ? 'shoe' : p.cat === 'clothing' || ['socks', 'hats'].includes(p.type) || /Gloves/.test(p.subtitle) ? 'apparel' : p.type === 'bags' ? 'bag' : p.shape === 'ball' ? 'ball' : /Bottle/.test(p.subtitle) ? 'jar' : /Mat/.test(p.subtitle) ? 'textile' : 'fitness'

const GENDER_LABEL = { men: 'Men', women: 'Women', unisex: 'Unisex', kids: 'Kids' }
const SPORT_LABEL = { lifestyle: 'Lifestyle', running: 'Running', trail: 'Running', training: 'Training & Gym', basketball: 'Basketball', soccer: 'Soccer', golf: 'Golf', tennis: 'Tennis', football: 'Football', baseball: 'Baseball', skateboarding: 'Skateboarding', volleyball: 'Volleyball', wrestling: 'Wrestling', lacrosse: 'Lacrosse', swimming: 'Swimming', cheer: 'Cheer' }

function build({ defaults, row }, index) {
  const [title, subtitle, listPrice, salePrice, base, colorText, extra = {}] = row
  const o = { ...defaults, ...extra }
  const colorways = colorText.split('|').map(part => {
    const [code, ...name] = part.trim().split(' ')
    const colorName = name.join(' ')
    const style = base ? `${base}-${code}` : code
    const fam = family(colorName)
    return { style, code, name: colorName, family: fam, swatch: SWATCH[fam] }
  })
  const id = colorways[0].style
  const slug = `${kebab(title.replace(/^Nike /, '').replace(/^NikeCourt /, 'court '))}-${kebab(subtitle)}-${o.id || urlId('nike-shelf:' + id)}`
  const h = hash('nike-shelf-rank:' + id).readUInt32BE(0)
  const p = {
    id, kind: 'other', title, subtitle, brand: o.brand, g: o.g, age: o.age || null, cat: o.cat, type: o.type, sport: o.sport,
    gender: GENDER_LABEL[o.g], sportLabel: SPORT_LABEL[o.sport] || 'Lifestyle',
    price: salePrice || listPrice, fullPrice: listPrice, sale: salePrice > 0,
    discount: salePrice ? Math.round((1 - salePrice / listPrice) * 100) : 0,
    badge: o.b || (salePrice ? '' : ''), rating: o.r || 4.5, reviews: o.n || 100,
    tags: `${defaults.t || ''} ${o.t || ''}`.trim(), height: o.cat === 'shoes' ? (o.h || 'low') : null, shape: o.shape || '',
    description: o.d || '', colorways, slug, order: index,
    newness: (o.b === 'Just In' || o.b === 'Coming Soon' ? 2000 : 0) + (h % 1000),
  }
  p.sizes = sizesFor(p)
  p.path = `/t/${slug}/${id}`
  p.art = { shape: ART_SHAPE(p), hint: artHint(p) }
  return Object.freeze(p)
}

export const shelf = Object.freeze(SECTIONS.map(build))
const byStyle = new Map()
for (const p of shelf) for (const c of p.colorways) {
  if (byStyle.has(c.style)) throw new Error(`Duplicate Nike shelf style ${c.style}`)
  byStyle.set(c.style, { product: p, color: c })
}
const bySlug = new Set(shelf.map(p => p.slug))
if (bySlug.size !== shelf.length) throw new Error('Duplicate Nike shelf slugs')

/** The product and colourway for a nike.com style-colour code (e.g. CW2288-111). */
export const shelfStyle = style => typeof style === 'string' ? byStyle.get(style) : undefined
export const isShelfStyle = style => typeof style === 'string' && byStyle.has(style)
export const stylePath = (p, c = p.colorways[0]) => `/t/${p.slug}/${c.style}`

// ---------- category codes ----------
// nike.com listing slugs end in z-joined filter codes (mens-shoes-nik1zy7ok =
// nik1 [Men] + y7ok [Shoes]). Each known code narrows the shelf; a listing with
// an unknown code keeps the captured category structure instead.
const isKidsShoeOrWear = p => p.g === 'kids' || (p.cat === 'accessories' && p.g === 'unisex' && p.sport !== 'golf' && ['socks', 'bags', 'hats'].includes(p.type))
const has = (p, word) => p.tags.split(' ').includes(word)
const CODES = {
  nik1: p => p.g === 'men' || p.g === 'unisex', '5e1x6': p => p.g === 'women' || p.g === 'unisex', v4dh: isKidsShoeOrWear,
  y7ok: p => p.cat === 'shoes', '6ymx6': p => p.cat === 'clothing', awwpw: p => p.cat === 'accessories',
  '37eef': p => p.brand === 'Jordan', '1n7xt': p => p.brand === 'Jordan', '4foky': p => /Jordan 1\b/.test(p.title), '1onra': () => true, '3aqeg': () => true,
  '37v7j': p => p.sport === 'running' || p.sport === 'trail', '8kwew': p => p.type === 'road', '9gdhk': p => p.type === 'race', '7nem3': p => p.type === 'track',
  '93bsd': p => p.brand === 'ACG' || p.type === 'trail', '75jcn': p => p.type === 'trail', '90dwj': p => p.brand === 'ACG', '1v964': p => p.brand === 'ACG',
  '3glsm': p => p.sport === 'basketball', '13jrm': p => p.sport === 'lifestyle', '58jto': p => p.sport === 'training',
  '7frqv': p => p.sport === 'training', '8wvhh': p => p.sport === 'training', '45gbi': p => p.sport === 'training' && p.cat !== 'clothing' || p.type === 'training',
  '59fco': p => ['leggings', 'bras'].includes(p.type) || /Yoga/.test(p.subtitle), '5vfyy': p => p.type === 'sandals',
  '1gdj0': p => p.sport === 'soccer', '8yh10': p => p.type === 'indoor', av9de: p => has(p, 'federation'), '6fu9q': p => has(p, 'club'),
  '23q9w': p => p.sport === 'golf', ed1q: p => p.sport === 'tennis', '273vc': p => p.sport === 'tennis',
  '3hj8m': p => p.sport === 'football', '5ufbh': p => p.type === 'cleats', '2dlpv': p => p.sport === 'baseball', '8mfrf': p => p.sport === 'skateboarding',
  '3yaep': p => p.sale, '3n82y': p => p.newness >= 600, k0gk: p => p.badge === 'Just In' || p.badge === 'Coming Soon', '76m50': p => p.reviews >= 1500,
  '4xh6q': p => has(p, 'fleece'), '6rive': p => p.type === 'hoodies', '50r7y': p => p.type === 'jackets', '2kq19': p => ['pants', 'leggings'].includes(p.type),
  '9om13': p => ['tops', 'jerseys'].includes(p.type), '38fph': p => p.type === 'shorts', '40qgm': p => p.type === 'bras', '29sh2': p => p.type === 'leggings',
  '88mej': p => ['leggings', 'bras'].includes(p.type), '2lukp': p => p.type === 'sets' || has(p, 'fleece'),
  '7ny3q': p => p.type === 'socks', '52r49': p => p.type === 'hats', '9xy71': p => p.type === 'bags',
  agibj: p => p.age === 'big', '6dace': p => p.age === 'little', '2j488': p => p.age === 'baby',
  b2asd: p => p.brand === 'NikeSKIMS', '5c1qq': () => true, '5s3en': () => true, '93ehs': p => p.brand === 'NikeSKIMS', '97fc5': () => true, '6lh4s': () => true, '21jwl': () => true, '7sut9': p => p.brand === 'NikeSKIMS', admbq: p => p.brand === 'NikeSKIMS', '4csx8': () => true,
  '557pq': p => p.colorways.some(c => c.family === 'Brown'), ayp69: p => p.colorways.some(c => c.family === 'Yellow'), '4g797': p => p.colorways.some(c => c.family === 'White'), '90poy': p => p.colorways.some(c => c.family === 'Black'),
  '4elb3': p => p.colorways.some(c => c.family === 'Brown'), '9g6re': p => p.colorways.some(c => c.family === 'Purple'), '9cm3q': p => p.colorways.some(c => c.family === 'Green'), '9cd0e': p => p.colorways.some(c => ['Pink', 'Red'].includes(c.family)), '98ed2': p => p.colorways.some(c => ['Brown', 'White'].includes(c.family)),
  arlyp: p => p.type === 'sunglasses' && !/Goggles/.test(p.subtitle), '6ealh': p => has(p, 'byyou'), '58jr': p => has(p, 'lego'), '2obuy': p => has(p, 'dance'), '9b8qk': p => has(p, 'spacejam'),
  '1cyjk': p => p.sport === 'cheer', '4nvmr': p => p.sport === 'lacrosse', '3c2dj': p => p.sport === 'swimming', tc2u: p => p.sport === 'volleyball', '52dy6': p => p.sport === 'wrestling', '2wq2g': p => has(p, 'ncaa'), '5yy3b': p => has(p, 'nwsl'),
  akmjx: p => p.brand === 'Converse', b170o: p => has(p, 'team'), '1vofi': p => has(p, 'nba'), '9bklc': p => has(p, 'nfl'), b0g9x: p => has(p, 'mlb'), '6ef6n': p => has(p, 'wnba'),
}
export function listingItems(slug) {
  const codes = String(slug).split('-').pop().split('z')
  if (!codes.length || codes.some(code => !CODES[code])) return []
  const preds = codes.map(code => CODES[code])
  return shelf.filter(p => preds.every(fn => fn(p)))
}
// Small listings close with nearby styles, as nike.com rounds out short grids.
export function relatedItems(slug, shown, n = 8) {
  const codes = String(slug).split('-').pop().split('z').filter(code => CODES[code])
  const seen = new Set(shown.map(p => p.id))
  const pools = [...codes.map(code => shelf.filter(CODES[code])), shown[0] ? shelf.filter(p => p.cat === shown[0].cat && p.g === shown[0].g) : []]
  const pool = pools.find(list => list.filter(p => !seen.has(p.id)).length >= 4) || shelf
  return pool.filter(p => !seen.has(p.id)).sort((a, b) => b.reviews - a.reviews).slice(0, n)
}

// Hub and department pages: the rows nike.com shows under each landing.
export const HUB_ITEMS = {
  '/men': p => p.g === 'men' || p.g === 'unisex', '/women': p => p.g === 'women' || p.g === 'unisex', '/kids': p => p.g === 'kids',
  '/jordan': p => p.brand === 'Jordan', '/nikeskims': p => p.brand === 'NikeSKIMS', '/sportswear': p => p.brand === 'Nike Sportswear',
  '/gear-up': p => p.sport !== 'lifestyle', '/basketball': p => p.sport === 'basketball', '/kobe': p => p.brand === 'Kobe' || p.sport === 'basketball',
  '/court': p => p.sport === 'tennis', '/soccer': p => p.sport === 'soccer', '/training': p => p.sport === 'training', '/running': p => p.sport === 'running' || p.sport === 'trail',
  '/golf': p => p.sport === 'golf', '/LockerRoom': p => has(p, 'team'), '/acg': p => p.brand === 'ACG' || p.type === 'trail',
  '/baseball': p => p.sport === 'baseball', '/us-football': p => p.sport === 'football', '/training/hybrid': p => p.sport === 'training',
}

// ---------- search ----------
const fold = v => String(v || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/['’®™]/g, '')
const ALIASES = { af1: ['air force 1'], aj1: ['air jordan 1', 'jordan 1'], aj4: ['air jordan 4'], am90: ['air max 90'], sneaker: ['shoes'], sneakers: ['shoes'], shoe: ['shoes'], hoodie: ['hoodies'], sweatshirt: ['hoodies'], sweatshirts: ['hoodies'], jogger: ['joggers'], sweatpants: ['joggers'], tee: ['t-shirt'], tees: ['t-shirt'], tshirt: ['t-shirt'], shirt: ['t-shirt', 'top'], legging: ['leggings'], bra: ['bras'], sock: ['socks'], hat: ['cap', 'beanie', 'headband'], hats: ['cap', 'beanie', 'headband'], backpack: ['backpack'], bag: ['bags'], peg: ['pegasus'], cleat: ['cleats'], slide: ['slides'], sandal: ['slides', 'sandals'], sandals: ['slides', 'sandals'], kid: ['kids'], boys: ['kids'], girls: ['kids'], womens: ['women'], mens: ['men'], fleece: ['fleece'], jacket: ['jackets', 'jacket'], ball: ['ball'] }
const haystack = p => fold([p.title, p.subtitle, p.brand, p.gender, p.g === 'kids' ? 'kids youth' : '', p.sportLabel, p.cat, p.type, p.tags, p.colorways.map(c => `${c.name} ${c.family} ${c.style}`).join(' '),
  p.type === 'hoodies' ? 'hoodie sweatshirt' : '', p.type === 'pants' ? 'pants joggers sweatpants' : '', p.type === 'tops' ? 't-shirt tee top' : '', p.type === 'bags' ? 'bag' : '', p.type === 'hats' ? 'hat cap' : '', p.sale ? 'sale' : '', p.cat === 'shoes' ? 'shoes sneakers' : ''].join(' '))
const HAY = new Map(shelf.map(p => [p.id, haystack(p)]))
const STOP = new Set(['nike', 'the', 'and', 'for', 'with', 'of', 'a'])
export function searchShelf(q) {
  const raw = fold(q).trim()
  const terms = fold(q).split(/[^a-z0-9.'-]+/).filter(w => w && !STOP.has(w))
  if (!terms.length) return raw === 'nike' ? [...shelf] : []
  const hits = []
  for (const p of shelf) {
    const hay = HAY.get(p.id)
    // Every typed word must match (directly or through a nike.com synonym).
    const ok = terms.every(t => [t, ...(ALIASES[t] || [])].some(w => new RegExp(`(^|[^a-z0-9])${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(hay)))
    if (!ok) continue
    const title = fold(p.title), sub = fold(p.subtitle)
    const score = (title.includes(raw) ? 40 : 0) + terms.filter(t => sub.includes(t)).length * 3 + (title.startsWith(raw) || title.startsWith('nike ' + raw) ? 20 : 0) + terms.filter(t => title.includes(t)).length * 5 + (p.cat === 'shoes' ? 2 : 0) + Math.log10(p.reviews)
    hits.push({ p, score })
  }
  return hits.sort((a, b) => b.score - a.score).map(x => x.p)
}

// ---------- facets and sort ----------
export const PRICE_BANDS = [['$0 - $25', 0, 25], ['$25 - $50', 25, 50], ['$50 - $100', 50, 100], ['$100 - $150', 100, 150], ['Over $150', 150, Infinity]]
export function filterShelf(items, q = {}) {
  const band = PRICE_BANDS.find(([label]) => label === q['shop-by-price'])
  return items.filter(p => (!q.gender || p.gender === q.gender || (p.g === 'unisex' && ['Men', 'Women'].includes(q.gender)))
    && (!q['sale-offers'] || p.sale)
    && (!band || (p.price >= band[1] && p.price < band[2]))
    && (!q.color || p.colorways.some(c => c.family === q.color))
    && (!q.brand || p.brand === q.brand || (q.brand === 'Nike By You' && has(p, 'byyou')))
    && (!q.sports || p.sportLabel === q.sports)
    && (!q.size || (p.cat === 'shoes' && p.g !== 'kids'))
    && (!q['shoe-height'] || (p.cat === 'shoes' && `${p.height[0].toUpperCase()}${p.height.slice(1)} Top` === q['shoe-height']))
    && (!q.width || (p.cat === 'shoes' && (q.width === 'Regular' || (q.width === 'Wide' && /Wide/.test(p.subtitle))))))
}
export const SORTS = ['Featured', 'Newest', 'Price: High-Low', 'Price: Low-High']
export function sortShelf(items, sort) {
  if (sort === 'Newest' || sort === 'newest') return [...items].sort((a, b) => b.newness - a.newness)
  if (sort === 'Price: High-Low' || sort === 'price-desc') return [...items].sort((a, b) => b.price - a.price)
  if (sort === 'Price: Low-High' || sort === 'price-asc') return [...items].sort((a, b) => a.price - b.price)
  return items
}

// ---------- product art ----------
export const VIEWS = 4
const cache = new Map()
// Eyewear (sunglasses and swim goggles) is drawn here: the shared renderer has
// no eyewear silhouette.
function eyewearArt(p, color, view) {
  const [frameName, lensName = ''] = color.name.split('/')
  const frame = /white|clear/i.test(frameName) ? '#ececec' : /tortoise/i.test(frameName) ? '#6b4426' : /navy/i.test(frameName) ? '#1d2a4a' : /royal/i.test(frameName) ? '#1f4fa0' : '#1b1b1b'
  const lens = /mirror/i.test(lensName) ? ['#c9d6e3', '#3b4e66'] : /brown/i.test(lensName) ? ['#a7835c', '#4a3220'] : /tint/i.test(lensName) ? ['#f2b8a8', '#a8564a'] : /clear|light/i.test(lensName) ? ['#e9edf0', '#a9b3ba'] : ['#6f747a', '#202326']
  const goggles = /Goggles/.test(p.subtitle)
  const shield = /Windshield|Show X3/.test(p.title)
  const shape = shield
    ? `<path d="M140 256h360" stroke="${frame}" stroke-width="12" stroke-linecap="round"/><path d="M146 258c0 64 30 102 92 102 46 0 66-24 82-52 16 28 36 52 82 52 62 0 92-38 92-102z" fill="url(#lens)" stroke="${frame}" stroke-width="6" stroke-linejoin="round"/><path d="M300 300q20-26 40 0" stroke="${frame}" stroke-width="8" fill="none"/><path d="M186 280c20-8 60-10 90-4" stroke="#fff" stroke-opacity=".45" stroke-width="6" stroke-linecap="round" fill="none"/><path d="M140 258l-30 12M500 258l30 12" stroke="${frame}" stroke-width="10" stroke-linecap="round"/>`
    : goggles
    ?`<path d="M120 300c40-14 80-12 130 4M520 300c-40-14-80-12-130 4" stroke="${frame}" stroke-width="14" fill="none" stroke-linecap="round"/><ellipse cx="250" cy="300" rx="62" ry="44" fill="url(#lens)" stroke="${frame}" stroke-width="12"/><ellipse cx="390" cy="300" rx="62" ry="44" fill="url(#lens)" stroke="${frame}" stroke-width="12"/><path d="M308 298q12-10 24 0" stroke="${frame}" stroke-width="8" fill="none"/>`
    : `<path d="M150 262h340" stroke="${frame}" stroke-width="12" stroke-linecap="round"/><path d="M156 262c-2 58 18 104 74 104 58 0 76-40 80-96l10-8 10 8c4 56 22 96 80 96 56 0 76-46 74-104z" fill="url(#lens)" stroke="${frame}" stroke-width="10" stroke-linejoin="round"/><path d="M190 284c12-6 40-8 60-4M380 284c12-6 40-8 60-4" stroke="#fff" stroke-opacity=".45" stroke-width="6" stroke-linecap="round" fill="none"/><path d="M150 264l-34 10M490 264l34 10" stroke="${frame}" stroke-width="10" stroke-linecap="round"/><path d="M296 352h48" stroke="#fff" stroke-opacity=".5" stroke-width="3"/>`
  const transform = ['', 'translate(320 300) scale(.82 1) skewY(-6) translate(-320 -300)', 'translate(320 300) scale(1.55) translate(-250 -300)', 'translate(320 300) scale(.9) rotate(-8) translate(-320 -300)'][view] || ''
  const label = `${p.title} ${p.subtitle}`.replace(/&/g, '&amp;').replace(/</g, '&lt;')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="600" viewBox="0 0 640 600" role="img" aria-label="${label}" data-product-form="eyewear" data-view="${view}"><title>${label}</title><defs><linearGradient id="lens" x1="0" y1="0" x2=".4" y2="1"><stop stop-color="${lens[0]}"/><stop offset="1" stop-color="${lens[1]}"/></linearGradient></defs><rect width="640" height="600" fill="#f5f5f5"/><ellipse cx="320" cy="470" rx="190" ry="18" fill="#000" fill-opacity=".06"/><g transform="${transform}">${shape}</g></svg>`
}

export function shelfArt(p, color, view = 0) {
  const key = `${color.style}:${view}`
  if (cache.has(key)) return cache.get(key)
  if (p.type === 'sunglasses') { const svg = eyewearArt(p, color, view); cache.set(key, svg); return svg }
  const second = color.name.split('/')[1] || ''
  // The shared renderer reads "Sleeve" as a textile sleeve, "Football" as a ball and "Fitness" as
  // equipment; garments keep their garment silhouette without those words.
  const name = p.cat === 'clothing' ? `${p.title} ${p.subtitle}`.replace(/\b(?:Short|Long)-Sleeve\b|\b(?:Football|Fitness)\b/g, '').replace(/\s+/g, ' ').trim() : `${p.title} ${p.subtitle}`
  const svg = renderProductAsset({ store: 'nike', title: name, brand: p.brand, assetKey: `nike-${p.id}`, specs: {},
    raw: { title: name, brand: p.brand, shape: p.art.shape, description: `${p.art.hint}. Shown: ${color.name}.`, color: ART[color.family], accent: second ? ART[family(second)] : undefined } }, view)
    .replace(/#f5f4f0/, '#f5f5f5')
  if (cache.size > 800) cache.delete(cache.keys().next().value)
  cache.set(key, svg)
  return svg
}
export const artUrl = (base, style, view = 0) => `${base}/images/t_PDP/${encodeURIComponent(style)}/${view}.svg`
