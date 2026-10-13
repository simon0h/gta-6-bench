// Product pictures for the everyday assortment (shelf.js). Real retailer photos cannot be used, so
// each item gets the repo's synthetic product illustration (lib/product-asset-art.js), chosen from
// its title, type and colour. Served by this store at /jb-hifi/shelf-art/<sku>/<view>.svg because
// the shared /product-assets index only knows the evidenced GTA VI inventory.
import { createHash } from 'node:crypto'
import { esc } from '../../lib/html.js'
import { renderProductAsset } from '../../lib/product-asset-art.js'

const BASE = '/jb-hifi'
const CONSOLE = /consoles$/
const titleFor = p => p.platformName && / games$/.test(p.type) ? `${p.title} — ${p.platformName}` : p.title
export const shelfViewCount = p => (CONSOLE.test(p.type) || /camera|laptop|kit|bundle|combo/i.test(p.title) ? 4 : 3)

// The illustration is picked from a plain product noun, so words such as "Bottom Mount" (a fridge)
// or "Conditioner" (an air conditioner) in a retail title cannot select the wrong drawing.
// Games, music and movies keep their real title, which is printed on the cover art.
const NOUNS = [
  [/macbook|laptop|chromebook|yoga slim/i, 'laptop'], [/mac mini/i, 'mini pc'], [/imac/i, 'monitor'], [/desktop pc/i, 'tower workstation'],
  [/ipad|tab\b|tab s|tab a|tab m/i, 'tablet'], [/printer/i, 'printer'], [/router|mesh|deco/i, 'router'], [/mouse/i, 'wireless mouse'], [/keyboard(?! piano)/i, 'keyboard'],
  [/webcam/i, 'webcam'], [/ssd|hard drive/i, 'portable ssd'], [/hub/i, 'usb-c hub adapter'], [/monitor/i, 'monitor'],
  [/power bank/i, 'power bank'], [/charging pad|wireless charg/i, 'wireless charger'], [/charger|power adapter/i, 'power adapter charger'],
  [/watch band|sport loop/i, 'watch band'], [/watch|forerunner|venu/i, 'smartwatch'], [/fitness tracker|charge 6|vivosmart/i, 'activity tracker'],
  [/soundbar|theatre bar|\bbar 500/i, 'soundbar'], [/projector/i, 'projector'], [/apple tv|tv streamer|set-top|blu-ray player/i, 'streaming media player'],
  [/wall mount/i, 'tv wall mount bracket'], [/hdmi/i, 'hdmi cable'], [/\btv\b/i, 'smart tv'],
  [/earbuds|airpods(?! max)|buds|powerbeats/i, 'earbuds'], [/headphones|airpods max|headset/i, 'headphones'],
  [/turntable/i, 'turntable'], [/bookshelf speakers/i, 'bookshelf speakers'], [/receiver/i, 'amplifier'], [/smart speaker|echo dot|nest audio/i, 'smart speaker'], [/speaker/i, 'portable speaker'],
  [/osmo action/i, 'action camera'], [/lens\b/i, 'camera lens'], [/drone/i, 'remote control quadcopter'], [/pocket 3/i, 'gimbal camera'], [/dash cam/i, 'dash camera'],
  [/security camera|nest cam|solocam/i, 'security camera'], [/doorbell/i, 'video doorbell'], [/bulb/i, 'smart light bulb'], [/bridge/i, 'router'], [/thermostat/i, 'thermostat'], [/smart wi-fi plug/i, 'smart plug'],
  [/camera/i, 'camera'],
  [/ally|portal/i, 'handheld console'], [/quest/i, 'vr headset'], [/joy-con|controller/i, 'controller'], [/microsd/i, 'portable ssd'], [/racing wheel/i, 'racing wheel'], [/charging station/i, 'controller charging station'],
  [/espresso|barista|bambino|magnifica|vertuo/i, 'espresso machine'], [/robot vacuum/i, 'robot vacuum'], [/vacuum/i, 'stick vacuum'], [/air fryer|airfryer/i, 'air fryer'],
  [/creami|ice cream/i, 'food processor'], [/stand mixer/i, 'stand mixer'], [/kettle/i, 'kettle'], [/toaster/i, 'toaster'], [/microwave/i, 'microwave'], [/blender/i, 'blender'],
  [/fridge/i, 'fridge'], [/washing machine|front loader/i, 'washing machine'], [/dryer(?!.*hair)/i, 'dryer'], [/purifier/i, 'air purifier'], [/air conditioner/i, 'tower fan'],
  [/airwrap|hair dryer|supersonic|straightener|oneblade|shaver|theragun|toothbrush/i, 'hair brush'],
  [/lego/i, 'building bricks set'], [/funko|amiibo/i, 'collectible figure'], [/tcg/i, 'trading card booster pack'],
  [/car stereo|gps navigator/i, 'tablet'], [/scooter/i, 'electric scooter'], [/bike/i, 'bike'],
  [/iphone|galaxy|pixel|reno|moto|telstra|case/i, 'smartphone'],
]
const KEEP_TITLE = /^(?:Vinyl|CDs|4K Ultra HD|Blu-ray|DVD|TV series|Musical instruments|Games & puzzles|Smart lighting|Microsoft 365|Antivirus & security)$/

function descriptor(p) {
  const game = / games$/.test(p.type)
  const noun = !game && !(KEEP_TITLE.test(p.type) && !/bulb|bridge/i.test(p.title)) ? NOUNS.find(([re]) => re.test(p.title))?.[1] : null
  const type = game ? 'game' : CONSOLE.test(p.type) || noun === 'handheld console' ? 'console' : 'other'
  const artTitle = noun ? `${p.brand} ${noun}` : titleFor(p)
  const media = /^(?:Vinyl|CDs|4K Ultra HD|Blu-ray|DVD|TV series|Microsoft 365|Antivirus & security)$/.test(p.type) || /instax mini film/i.test(p.title)
  const specs = Object.fromEntries(p.specs.map(([k, v]) => [k, String(v)]))
  const assetKey = `jb-shelf-${p.slug}--${createHash('sha256').update(p.id).digest('hex').slice(0, 12)}`
  const raw = { title: artTitle, brand: p.brand, category: p.crumbs[0], type: media ? (p.type === 'CDs' ? 'audio cd' : p.type === 'Vinyl' ? 'vinyl' : 'blu-ray') : noun || p.type, colour: p.attributes.Colour, specs: p.specs, ...(game ? { gameTitle: p.title, platformLabel: p.platformName, publisher: p.brand, platform: p.platform } : {}) }
  return { store: 'jb-hifi', id: p.id, aliases: [p.id], title: artTitle, canonicalTitle: p.title, type, category: p.crumbs[0], brand: p.brand, platform: p.platform || null, edition: game ? 'standard' : null, format: game ? (p.platform === 'switch-2' || p.platform === 'switch' ? 'cartridge' : p.platform === 'pc' ? 'digital' : 'disc') : 'physical', variant: null, identity: { type, store: 'jb-hifi', id: p.id }, assetKey, specs, raw, variants: [] }
}

const cache = new Map()
export function shelfArtSvg(p, view) {
  const key = `${p.id}:${view}`
  if (!cache.has(key)) cache.set(key, renderProductAsset(descriptor(p), view))
  return cache.get(key)
}
export const shelfArtUrl = (p, view = 0) => `${BASE}/shelf-art/${encodeURIComponent(p.id)}/${view}.svg`

export function shelfImage(p, { className = '', view = 0, alt, loading = 'lazy' } = {}) {
  return `<img class="pa-product-image ${esc(className)}" data-product-asset src="${shelfArtUrl(p, view)}" alt="${esc(alt || p.title)}" width="720" height="720" loading="${loading}" decoding="async">`
}

// Same markup and behaviour as lib/product-assets.js productGallery (shared gallery script and styles).
export function shelfGallery(p) {
  const count = shelfViewCount(p)
  const labels = ['Product view', 'Alternate view', 'Close-up', 'Additional view'].slice(0, count)
  const title = p.title
  return `<section class="pa-gallery" data-product-gallery data-product-store="jb-hifi" data-product-id="${esc(p.id)}" aria-label="Product images"><div class="pa-gallery-stage"><button type="button" class="pa-gallery-enlarge" data-pa-enlarge aria-label="Enlarge product image">${shelfImage(p, { loading: 'eager', className: 'pa-gallery-main', alt: `${title} — ${labels[0]}` })}<span aria-hidden="true">⌕</span></button></div><div class="pa-gallery-controls"><button type="button" data-pa-step="-1" aria-label="Previous image">‹</button><p class="pa-gallery-caption" data-pa-caption aria-live="polite">${labels[0]} · 1 / ${count}</p><button type="button" data-pa-step="1" aria-label="Next image">›</button></div><div class="pa-gallery-thumbnails" aria-label="Choose an image">${labels.map((label, i) => `<button type="button" data-pa-select="${i}" data-pa-src="${shelfArtUrl(p, i)}" data-pa-label="${esc(label)}" data-pa-alt="${esc(`${title} — ${label}`)}" aria-label="${esc(label)}" aria-pressed="${i === 0}">${shelfImage(p, { view: i, alt: label })}</button>`).join('')}</div><dialog class="pa-gallery-dialog" aria-label="${esc(title)}"><button type="button" class="pa-gallery-close" data-pa-close aria-label="Close image">×</button><img data-pa-expanded src="${shelfArtUrl(p, 0)}" alt="${esc(`${title} — ${labels[0]}`)}" width="720" height="720"><div class="pa-gallery-controls"><button type="button" data-pa-step="-1" aria-label="Previous image">‹</button><p data-pa-caption>${labels[0]} · 1 / ${count}</p><button type="button" data-pa-step="1" aria-label="Next image">›</button></div></dialog><noscript><div class="pa-gallery-noscript">${labels.slice(1).map((label, i) => `<figure>${shelfImage(p, { view: i + 1, alt: `${title} — ${label}` })}<figcaption>${esc(label)}</figcaption></figure>`).join('')}</div></noscript></section>`
}

export function installShelfArt(router, byId) {
  router.get('/shelf-art/:id/:view.svg', (req, res) => {
    const p = byId(req.params.id)
    const view = Number(req.params.view)
    if (!p?.shelf || !/^\d$/.test(req.params.view) || view >= shelfViewCount(p)) return res.status(404).type('text').send('Product image not found')
    const svg = shelfArtSvg(p, view)
    res.set('Cache-Control', 'public, max-age=3600').set('X-Content-Type-Options', 'nosniff').set('X-Product-Asset-Provenance', 'synthetic-illustration')
    res.type('image/svg+xml').send(svg)
  })
}
