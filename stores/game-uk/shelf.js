// Reference-mode shop floor: the GAME assortment (shelf-data.js) as product records that the
// existing bag and checkout understand. Every row is kind 'other', so an order line for it is
// never a GTA VI game line. It is a separate array from the evidence-backed GTA VI listings in
// data.js PRODUCTS, so catalog policy and the reference inventory keep describing only those.
import { esc } from '../../lib/html.js'
import { renderProductAsset } from '../../lib/product-asset-art.js'
import * as D from './shelf-data.js'

const slugify = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[™®'’.]/g, '').replace(/&/g, 'and').replace(/£/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const hash = s => [...String(s)].reduce((a, c) => (Math.imul(a, 31) + c.charCodeAt(0)) >>> 0, 7)
const PLATFORM_LABEL = { PS5: 'PlayStation 5', Xbox: 'Xbox Series X|S', 'Nintendo Switch 2': 'Nintendo Switch 2', 'Nintendo Switch': 'Nintendo Switch', PC: 'PC' }
const SWATCH = { PS5: 'PS5', Xbox: 'XBS', 'Nintendo Switch 2': 'NS2', 'Nintendo Switch': 'NSW', PC: 'PC' }
const ROOT = { PS5: 'PlayStation Gaming', Xbox: 'Xbox Gaming', 'Nintendo Switch 2': 'Nintendo Gaming', 'Nintendo Switch': 'Nintendo Gaming', PC: 'PC Gaming' }
const DEPT_TITLE = { gaming: 'Consoles & Video Games', digital: 'Digital Gift Cards', 'pc-gaming': 'PC Gaming', tech: 'Tech', lego: 'LEGO', toys: 'Toys & Games', 'toys/trading-cards': 'Trading Cards' }
const fmtDate = iso => new Date(iso + 'T00:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
const shortDate = iso => { const [y, m, d] = iso.split('-'); return `${d}/${m}/${y.slice(2)}` }

// Product copy in GAME's voice: a short "about" paragraph per category in place of repeating the title.
const GENRE = {
  'Action / Adventure': 'Explore a sprawling world, take on tough encounters and uncover the story at your own pace.',
  Shooter: 'Fast, tactical gunplay with a full campaign and online multiplayer to master.',
  Sports: 'Step onto the pitch, court or track with the latest teams, modes and seasonal content.',
  Racing: 'Tune your ride, master every corner and race friends locally or online.',
  Horror: 'Survive the night in a tense, atmospheric horror experience. Best played with the lights off.',
  Simulation: 'Build, manage and grow at your own pace in a relaxing simulation.',
  RPG: 'Create your hero, level up and make choices that shape an epic adventure.',
  Family: 'Easy to pick up and full of fun for players of all ages, solo or together on the sofa.',
  Strategy: 'Plan every move, outwit your rivals and lead your side to victory.',
}
const has = (t, re) => re.test(t)
function aboutCopy(category, title, platform) {
  const t = title.toLowerCase(), on = platform ? PLATFORM_LABEL[platform] : null
  switch (category) {
    case 'Controllers': return [has(t, /guitar/) ? 'Grab the guitar and play along to your favourite tracks with a full-size wireless controller.' : has(t, /wireless|dualsense|xbox/) ? 'Comfortable, responsive wireless control for everything from quick matches to marathon sessions, with precise sticks and triggers.' : 'A comfortable, responsive wired controller with precise sticks and triggers. Plug in and play.', on ? `Designed for ${on}. Game not included.` : 'Game not included.']
    case 'Charging Docks': return ['Keep your controllers topped up and ready to go. Drop them in the dock to charge, with a tidy stand that sits neatly next to your console.', on ? `Compatible with ${on} controllers. Controllers not included.` : 'Controllers not included.']
    case 'Racing Wheels': return ['Bring the feel of the track home with sim racing gear built for precise, realistic control.', on ? `Compatible with ${on} and PC. Games sold separately.` : 'Games sold separately.']
    case 'Headsets': return [has(t, /wireless/) ? 'Wireless gaming audio with clear chat and a comfortable fit for long sessions.' : 'Clear game audio and crisp chat, with cushioned ear cups for long sessions.', ...(on ? [`Designed for ${on}.`] : [])]
    case 'Keyboards': return ['A responsive gaming keyboard with a UK layout, durable keys and lighting to match your setup.', 'Plug-and-play USB connection for PC.']
    case 'Mice': return ['A lightweight gaming mouse with a precise optical sensor and programmable buttons.', 'Plug-and-play setup for PC.']
    case 'Monitors': return ['A crisp, clear monitor for gaming, streaming and everyday use on PC and console.', 'UK power lead included.']
    case 'Gaming Chairs': return ['Settle in for long sessions with an adjustable gaming chair with lumbar and neck support.', 'Delivered to your home. Self-assembly required.']
    case 'Headphones': return [has(t, /earbud|buds|airpods/) ? 'True wireless earbuds with a compact charging case, for music, calls and gaming on the go.' : 'Wireless headphones with rich sound, long battery life and a comfortable fit.', 'Connects over Bluetooth to your phone, tablet or laptop.']
    case 'Speakers': return ['A portable Bluetooth speaker with big sound for its size and a rechargeable battery.']
    case 'Smart Lighting': return ['Set the mood for game night with colour-changing smart lighting you control from your phone.', 'Works with popular smart home apps and voice assistants.']
    case 'Cables': return ['A high-speed HDMI cable for connecting your console or PC to a TV or monitor.']
    case 'Trading Cards': return [has(t, /display|booster box/) ? 'A sealed display of booster packs, perfect for opening with friends or building your collection.' : 'Sealed trading cards to build your deck and grow your collection.']
    case 'Soft Toys': return ['A super-soft plush, ready for cuddles, display shelves and gifting.']
    case 'Board Games': return ['A board game for game night: quick to learn and fun for all the family.']
    case 'Wooden Toys': return ['A beautifully made wooden toy built to last, for hours of imaginative play.']
    case 'Action Figures': return ['A collectible figure for display shelves and fans of the series.']
    case 'Building Sets': return ['Build, play and display with this LEGO set. Includes step-by-step building instructions.']
    default: return []
  }
}
function make({ id, brand, title, price, was, category, departments, platform = null, pegi = null, style = null, shape = null, type = 'other', digital = false, preorder = null, specs = {}, description = [], keywords = '', extra = {} }) {
  const h = hash(id)
  const stock = extra.stock ?? (digital ? 99 : 4 + h % 37)
  const p = {
    id, colcode: `${id}69`, kind: 'other', shelf: true,
    slug: `${slugify(brand)}-${slugify(title.startsWith(brand) ? title.slice(brand.length) : title)}-${id}`,
    title, brand, price, ticketPrice: was && was > price ? was : price,
    swatch: SWATCH[platform] || (digital ? 'Digital' : 'One Size'), platformFacet: platform, category, style: style || category,
    badges: preorder ? ['PRE-ORDER'] : was && (was - price) / was >= 0.3 ? ['SALE'] : [],
    preorder: Boolean(preorder), release: preorder || null,
    ...(preorder ? { releaseText: fmtDate(preorder), releaseShort: shortDate(preorder) } : {}),
    pegi, age: pegi ? `PEGI ${pegi}` : 'All ages', carrier: digital ? 'email' : 'Evri', digital,
    crumbs: [platform && ROOT[platform] && departments[0] === 'gaming' ? ROOT[platform] : DEPT_TITLE[departments[0]], category],
    departments, catalogType: type, catalogPlatform: platform ? ({ PS5: 'ps5', Xbox: 'xbox', 'Nintendo Switch 2': 'switch-2', 'Nintendo Switch': 'switch', PC: 'pc' })[platform] : null,
    family: `${brand} ${category}`, stock, collect: !digital && !preorder && extra.collect !== false,
    specs: { Brand: brand, ...(platform ? { Platform: PLATFORM_LABEL[platform] } : {}), ...specs },
    description, keywords: `${brand} ${title} ${category} ${style || ''} ${platform ? PLATFORM_LABEL[platform] + ' ' + SWATCH[platform] : ''} ${keywords}`.toLowerCase(),
    artShape: shape, art: null, artAlt: title,
  }
  p.campaigns = [...(p.preorder ? ['coming-soon'] : []), ...(p.price < 30 && !p.preorder ? ['under-30'] : []), ...(departments.includes('pc-gaming') ? ['pc-setup'] : []), ...(!p.preorder && p.price >= 10 && p.price <= 80 ? ['gifts-for-gamers'] : [])]
  return p
}

const rows = []
for (const [id, brand, title, price, was, platform, pegi, style, x = {}] of D.GAMES) {
  rows.push(make({ id, brand, title, price, was, category: 'Video Games', departments: ['gaming'], platform, pegi, style, type: 'game', preorder: x.preorder || null, keywords: `games video game ${x.keywords || ''}`,
    specs: { Format: platform === 'PC' ? 'Download code in box' : platform.startsWith('Nintendo') ? 'Game card' : 'Disc', Genre: style, 'PEGI rating': `PEGI ${pegi}`, Region: 'United Kingdom' },
    description: [`${title} for ${PLATFORM_LABEL[platform]}.`, ...(GENRE[style] ? [GENRE[style]] : []), x.preorder ? 'This item is on pre-order and will be dispatched for delivery on release.' : 'In stock for home delivery or Click & Collect.', `PEGI ${pegi}: suitable for people aged ${pegi} and over.`] }))
}
for (const [id, brand, title, price, was, platform, pegi, style, x = {}] of D.CONSOLES) {
  const arcade = x.shape === 'arcade'
  rows.push(make({ id, brand, title, price, was, category: 'Consoles', departments: ['gaming'], platform, pegi: pegi || null, style: arcade ? 'Retro' : 'Hardware', type: arcade ? 'other' : 'console', shape: x.shape, extra: x,
    specs: { Contents: arcade ? 'Arcade cabinet, riser and light-up marquee' : 'Console, controller, HDMI cable and UK power lead', Guarantee: '12 months' },
    description: [arcade ? 'Full-size arcade cabinet with classic Atari games built in. Adult assembly required.' : `Play the biggest games on ${PLATFORM_LABEL[platform] || 'your new console'}. Games sold separately unless stated.`, 'Hardware from GAME comes with a 12-month guarantee.'] }))
}
const accessory = (list, category, departments, shape, about) => {
  for (const [id, brand, title, price, was, platform = null, , , x = {}] of list) rows.push(make({ id, brand, title, price, was, category, departments: x.console ? ['gaming', 'pc-gaming'] : departments, platform, type: 'accessory', shape: x.shape || shape,
    specs: { ...(platform ? {} : { Compatibility: x.console ? 'PS5, PS4, Xbox Series X|S, Nintendo Switch and PC' : 'PC' }), ...(about ? { Type: about } : {}) },
    description: aboutCopy(category, title, platform).length ? aboutCopy(category, title, platform) : [`${title}.`, platform ? `Designed for ${PLATFORM_LABEL[platform]}. Game not included.` : 'Plug-and-play setup.'] }))
}
accessory(D.CONTROLLERS, 'Controllers', ['gaming'], 'controller', 'Controller')
accessory(D.CHARGING, 'Charging Docks', ['gaming'], 'dock', 'Charging')
accessory(D.WHEELS, 'Racing Wheels', ['gaming'], 'yoke', 'Racing')
accessory(D.HEADSETS, 'Headsets', ['pc-gaming'], 'headset', 'Gaming headset')
for (const [list, category, shape] of [[D.KEYBOARDS, 'Keyboards', 'keypad'], [D.MICE, 'Mice', 'mouse'], [D.MONITORS, 'Monitors', 'monitor'], [D.CHAIRS, 'Gaming Chairs', 'seat']]) {
  for (const [id, brand, title, price, was] of list) rows.push(make({ id, brand, title, price, was, category, departments: ['pc-gaming'], platform: null, type: 'accessory', shape, extra: shape === 'seat' ? { collect: false } : {},
    specs: { Compatibility: 'PC', Type: category.replace(/s$/, '') }, description: aboutCopy(category, title, null) }))
}
for (const [id, brand, title, price, was, kind] of D.HEADPHONES) rows.push(make({ id, brand, title, price, was, category: 'Headphones', departments: ['tech'], type: 'accessory', shape: kind,
  specs: { Type: kind === 'earbuds' ? 'Earbuds' : 'Headphones' }, description: aboutCopy('Headphones', kind === 'earbuds' ? title + ' earbuds' : title, null) }))
for (const [id, brand, title, price, was, category, shape] of D.TECH_OTHER) rows.push(make({ id, brand, title, price, was, category, departments: category === 'Cables' ? ['tech', 'gaming'] : ['tech'], type: 'accessory', shape,
  specs: { Type: category }, description: aboutCopy(category, title, null) }))
for (const [id, brand, title, price, was, category, platform] of D.DIGITAL) rows.push(make({ id, brand, title, price, was, category, departments: ['digital'], platform, digital: true, pegi: /Grand Theft Auto/.test(title) ? 18 : null, type: 'other', shape: 'card',
  specs: { Delivery: 'Email code', Region: 'United Kingdom', Redemption: platform ? `${PLATFORM_LABEL[platform]} account registered in the UK` : 'Account registered in the UK' },
  description: [/gift card|cash card|credit|wallet|£/i.test(title) ? 'Top up your account wallet to spend on games, add-ons and subscriptions.' : `Instant access with a digital code${platform ? ' for ' + PLATFORM_LABEL[platform] : ''}.`, 'Your UK redemption code is delivered by email. Digital codes cannot be returned once redeemed.'] }))
for (const [id, brand, title, price, was, preorder] of D.CARDS) rows.push(make({ id, brand, title, price, was, category: 'Trading Cards', departments: ['toys/trading-cards'], type: 'other', shape: 'card', preorder: preorder || null, keywords: 'tcg trading card game cards',
  specs: { Type: 'Trading cards', Age: '6 years and over' }, description: [...aboutCopy('Trading Cards', title, null), 'Contents are randomised. Not suitable for children under 3 years.'] }))
for (const [id, brand, title, price, was, category, shape, x = {}] of D.TOYS) rows.push(make({ id, brand, title, price, was, category, departments: ['toys'], type: 'other', shape: shape === 'kitchen' ? 'playset' : shape, extra: x, keywords: 'toys games',
  specs: { Type: category.replace(/s$/, ''), Age: category === 'Board Games' ? '8 years and over' : '3 years and over' }, description: aboutCopy(category, title, null) }))
for (const [id, title, price, was, age] of D.LEGO) rows.push(make({ id, brand: 'LEGO', title, price, was, category: 'Building Sets', departments: ['lego', 'toys'], type: 'other', shape: 'bricks', keywords: 'lego building set bricks toys',
  specs: { Theme: (title.match(/LEGO\s+(Star Wars|Technic|Creator|Harry Potter|Minecraft|Animal Crossing|Botanicals?|Super Mario|Marvel|City|Fortnite|Icons|Art|Pokemon)/) || [, 'LEGO'])[1], Age: `${age}+`, 'Set number': (title.match(/\b(\d{5})\b/) || [, '—'])[1] },
  description: [...aboutCopy('Building Sets', title, null), `Suitable for ages ${age}+.`] }))

export const SHELF = rows
export const shelfById = new Map(SHELF.map(p => [p.id, p]))
if (shelfById.size !== SHELF.length) throw new Error('game-uk shelf: duplicate product code')

// ------------------------------------------------------------------ pictures
// Locally rendered product illustrations (lib/product-asset-art.js), served from the store's own
// /images/products/ path because the shared /product-assets index only covers evidence-backed rows.
export const MEDIA = (base, id, view = 0) => `${base}/images/products/${encodeURIComponent(id)}/${view}.svg`
export const shelfViews = p => p.catalogType === 'console' || /bundle|set|pack/i.test(p.title) ? 4 : 3
const ART_SUFFIX = { card: ' trading card' }
function descriptor(p) {
  const type = p.catalogType === 'game' ? 'game' : p.catalogType === 'console' ? 'console' : 'other'
  const artTitle = p.artShape === 'card' && !/gift card|cash card|trading card|booster pack/i.test(p.title) ? p.title + (p.digital ? ' gift card' : ART_SUFFIX.card) : p.title
  return {
    store: 'game-uk', id: p.id, title: artTitle, canonicalTitle: p.title, type, category: p.category, brand: p.brand,
    platform: p.catalogPlatform, edition: type === 'game' ? 'standard' : null, format: type === 'game' ? 'disc' : p.digital ? 'digital' : 'physical',
    specs: {}, assetKey: `game-uk-shelf-${p.id}`, sourceArt: {},
    raw: { title: artTitle, brand: p.brand, shape: p.artShape === 'card' ? undefined : p.artShape, platformLabel: PLATFORM_LABEL[p.platformFacet], platform: p.catalogPlatform, colour: p.title.match(/\b(black|white|red|blue|green|pink|grey|purple)\b/i)?.[1] },
  }
}
const cache = new Map()
export function shelfSvg(p, view) {
  const key = `${p.id}:${view}`
  if (!cache.has(key)) { if (cache.size > 600) cache.delete(cache.keys().next().value); cache.set(key, renderProductAsset(descriptor(p), view)) }
  return cache.get(key)
}
export function shelfImage(base, p, { className = '', view = 0, alt, loading = 'lazy' } = {}) {
  return `<img class="pa-product-image ${esc(className)}" data-product-asset src="${esc(MEDIA(base, p.id, view))}" alt="${esc(alt || p.title)}" width="720" height="720" loading="${loading}" decoding="async">`
}
export function shelfGallery(base, p) {
  const labels = ['Product view', 'Alternate view', 'Close-up', 'Additional view'], count = shelfViews(p)
  const img = (i, extra = {}) => shelfImage(base, p, { view: i, ...extra })
  return `<section class="pa-gallery gu-shelf-gallery" data-product-gallery data-product-store="game-uk" data-product-id="${esc(p.id)}" aria-label="Product images"><div class="pa-gallery-stage"><button type="button" class="pa-gallery-enlarge" data-pa-enlarge aria-label="Enlarge product image">${img(0, { loading: 'eager', className: 'pa-gallery-main', alt: `${p.title} — ${labels[0]}` })}<span aria-hidden="true">⌕</span></button></div><div class="pa-gallery-controls"><button type="button" data-pa-step="-1" aria-label="Previous image">‹</button><p class="pa-gallery-caption" data-pa-caption aria-live="polite">1 / ${count}</p><button type="button" data-pa-step="1" aria-label="Next image">›</button></div><div class="pa-gallery-thumbnails" aria-label="Choose an image">${Array.from({ length: count }, (_, i) => `<button type="button" data-pa-select="${i}" data-pa-src="${esc(MEDIA(base, p.id, i))}" data-pa-label="${labels[i]}" data-pa-alt="${esc(`${p.title} — ${labels[i]}`)}" aria-label="${labels[i]}" aria-pressed="${i === 0}">${img(i, { alt: labels[i] })}</button>`).join('')}</div><dialog class="pa-gallery-dialog" aria-label="${esc(p.title)}"><button type="button" class="pa-gallery-close" data-pa-close aria-label="Close image">×</button><img data-pa-expanded src="${esc(MEDIA(base, p.id, 0))}" alt="${esc(`${p.title} — ${labels[0]}`)}" width="720" height="720"><div class="pa-gallery-controls"><button type="button" data-pa-step="-1" aria-label="Previous image">‹</button><p data-pa-caption>1 / ${count}</p><button type="button" data-pa-step="1" aria-label="Next image">›</button></div></dialog></section>`
}
export function installShelfMedia(router) {
  router.get('/images/products/:id/:view.svg', (req, res) => {
    const p = shelfById.get(req.params.id)
    if (!p || !/^\d$/.test(req.params.view) || Number(req.params.view) >= shelfViews(p)) return res.status(404).type('text').send('Product image not found')
    res.set('Cache-Control', 'public, max-age=3600').set('X-Content-Type-Options', 'nosniff').type('image/svg+xml').send(shelfSvg(p, Number(req.params.view)))
  })
}
