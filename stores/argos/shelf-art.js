// Product pictures for the Argos assortment. Most items reuse the shared synthetic product renderer
// (lib/product-asset-art.js); a few Argos-heavy categories the renderer has no drawing for (jewellery,
// garden buildings, barbecues, Christmas trees, handheld grooming devices, baby baths) get a simple
// local illustration in the same style. These are illustrations, not retailer packshots.
import { esc } from '../../lib/html.js'
import { renderProductAsset, classifyProductAsset } from '../../lib/product-asset-art.js'

// category -> art noun the shared renderer understands, or custom:<kind> for a local drawing
const ART = {
  tv: 'television', soundbar: 'sound bar', camera: 'camera', phone: 'mobile phone', watch: 'smartwatch', headphones: 'headphones',
  laptop: 'laptop', tablet: 'tablet', headset: 'gaming headset', gaminglaptop: 'laptop', psdigital: 'gift card',
  bed: 'bed', sofa: 'sofa', rug: 'rug', kitchenware: 'frying pan', dining: 'dining table', desk: 'desk', ceilinglight: 'ceiling light',
  storage: 'storage unit', hairstyler: 'hair dryer', toothbrush: 'tooth brush', perfume: 'perfume bottle', makeup: 'makeup palette',
  beautyappliance: 'custom:handheld', massager: 'custom:handheld', shaver: 'custom:handheld', bpmonitor: 'blood pressure monitor',
  vacuum: 'vacuum cleaner', fridge: 'fridge freezer', washer: 'washing machine', cooker: 'oven', dishwasher: 'dishwasher', kettle: 'kettle',
  heater: 'heater', airfryer: 'air fryer', dumbbell: 'dumbbell', treadmill: 'treadmill', exercisemat: 'yoga mat', bike: 'bike',
  football: 'football', suitcase: 'suitcase', tent: 'tent', tracker: 'activity tracker', menswatch: 'smartwatch', womenswatch: 'smartwatch',
  earrings: 'custom:earrings', chain: 'custom:chain', weddingring: 'custom:ring', jewellerybox: 'jewellery box', pram: 'stroller',
  earlylearning: 'learning toy', cot: 'cot', highchair: 'high chair', babybath: 'custom:tub', babymonitor: 'baby monitor', nightlight: 'nightlight',
  toddler: 'toy', playset: 'playset', boardgame: 'board game', creative: 'craft kit', doll: 'doll', vehicle: 'remote control car',
  womens: 'hoodie', mens: 'hoodie', boys: 'hoodie', girls: 'hoodie', uniform: 'polo shirt', fancydress: 'hoodie',
  patio: 'garden table', gazebo: 'tent', shed: 'custom:shed', summerhouse: 'custom:shed', greenhouse: 'custom:greenhouse', bbq: 'custom:bbq', xmastree: 'custom:tree',
}
const ITEM_ART = { 'Habitat 16 Piece Stoneware Dinner Set - White': 'dinner plates', 'Joseph Joseph Nest 9 Plus Compact Food Preparation Set': 'mixing bowl', 'Stellar James Martin 5 Piece Knife Block Set': 'kitchen knife', 'PlayStation Plus Essential 12 Month Membership': 'gift card', 'Gro Company Hatch Groclock Sleep Trainer': 'nightlight', 'Shark Steam & Scrub Automatic Steam Mop S6002UK': 'vacuum cleaner', 'Smeg KLF03 Electric Kettle - Cream': 'kettle', 'Hoover H-Wash 300 8KG 1400 Spin Washing Machine - White': 'washing machine', 'Opti Vinyl Dumbbells - 2 x 3kg': 'dumbbell', 'Tower T17088 Vortx 9L Dual Basket Air Fryer - Black': 'air fryer', 'Remington One Dry & Style Hair Dryer Brush': 'hair dryer', 'Revolution Ultimate Beauty Advent Calendar Makeup Set': 'makeup palette', 'Rimmel London Mascara and Lip Makeup Gift Set': 'lipstick', 'VTech Baby Musical Rhyme Book': 'learning toy', 'Tommee Tippee Closer to Nature Starter Feeding Set': 'baby bottle', 'Cuggl Lulworth 3 in 1 Cot Bed - White': 'cot', 'LEGO Classic Large Creative Brick Box 10698': 'building bricks', 'Chad Valley Bumper Craft Box': 'craft kit', 'Hot Wheels 5 Car Gift Pack': 'toy car', 'Chicco Next2Me Magic Bedside Crib - Grey': 'crib', 'Fitbit Charge 6 Fitness Tracker - Obsidian': 'activity tracker', 'Fitbit Inspire 3 Fitness Tracker - Midnight Zen': 'activity tracker', 'Tu Mens Slim Fit Stretch Jeans - Indigo': 'jeans', 'Tu Girls Black Leggings 3 Pack': 'jeans', 'Tu Girls Grey Pleated School Skirt 2 Pack': 'skirt', 'Kickmaster 8ft x 5ft Folding Football Goal': 'football', 'Argos Home Rattan Effect 4 Seater Garden Sofa Set - Grey': 'sofa', 'Mele & Co Grey Velvet Jewellery Box': 'jewellery box', 'Argos Home Mirrored Jewellery Cabinet - White': 'storage cabinet', 'Chad Valley Ocean Light Projector': 'nightlight' }

const hash = s => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) } return h >>> 0 }
const COLOURS = [['black', '#2b2e33'], ['white', '#ecebe6'], ['grey', '#8b9296'], ['gray', '#8b9296'], ['silver', '#b7bec4'], ['navy', '#2f3f63'], ['blue', '#3d6aa8'], ['green', '#4f7a5a'], ['sage', '#8ea58a'], ['pink', '#d898b0'], ['red', '#b5443f'], ['cream', '#efe4cb'], ['natural', '#c9b48e'], ['oak', '#b99a73'], ['walnut', '#7a5a3f'], ['brass', '#b9974b'], ['gold', '#c8a24a'], ['rose gold', '#c99583'], ['purple', '#7a5aa0'], ['brown', '#7b5a43'], ['charcoal', '#43474c'], ['terracotta', '#b8674a']]
const colourOf = (title, fallback) => (COLOURS.filter(([k]) => new RegExp(`\\b${k}\\b`, 'i').test(title)).sort((a, b) => b[0].length - a[0].length)[0] || [, fallback])[1]

function descriptor(p, title) {
  const type = p.catalogType === 'game' ? 'game' : p.catalogType === 'console' ? 'console' : 'other'
  return { store: 'argos', id: p.sku, title, canonicalTitle: title, type, platform: p.catalogPlatform, format: p.format || (type === 'game' ? 'disc' : 'physical'), edition: type === 'game' ? 'standard' : null, category: p.category, brand: p.brand, specs: p.specs, assetKey: `argos-shelf-${p.sku}`, raw: { ...p, title, shape: undefined, art: undefined } }
}

export function artTitle(p) {
  if (['game', 'console', 'card'].includes(p.catalogType) && !ITEM_ART[p.title]) return p.title
  const noun = ITEM_ART[p.title] || ART[p.shelfCat] || 'product'
  if (noun.startsWith('custom:')) return noun
  const real = classifyProductAsset(descriptor(p, p.title)), wanted = classifyProductAsset(descriptor(p, noun))
  return real === wanted && real !== 'object' ? p.title : `${p.brand} ${noun}`
}

// ---------- local drawings (640 x 600 canvas, same palette as the shared renderer) ----------
const r = (x, y, w, h, fill, rx = 0, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" ${extra}/>`
const pth = (d, fill, stroke = 'none', sw = 0, extra = '') => `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" ${extra}/>`
const circ = (cx, cy, rr, fill, extra = '') => `<circle cx="${cx}" cy="${cy}" r="${rr}" fill="${fill}" ${extra}/>`
const dark = '#2f3439', steel = '#aab3ba', paper = '#f7f4ea'
const DRAW = {
  earrings(c, v, metal) { const gem = v === 2 ? '#7fb6d6' : '#e8f1f6'; return [0, 1].map(i => { const x = 250 + i * 140; return /hoop/i.test(this.t) ? circ(x, 300, 62, 'none', `stroke="${metal}" stroke-width="14"`) + r(x - 6, 220, 12, 30, metal, 4) : circ(x, 290, 34, gem, `stroke="${metal}" stroke-width="10"`) + pth(`M${x - 18} ${290}l18-22 18 22-18 22Z`, '#ffffff', 'none', 0, 'opacity=".7"') + r(x - 3, 320, 6, 46, metal, 2) }).join('') + (v === 1 ? r(190, 400, 260, 60, '#6b4f6f', 10) + r(205, 412, 230, 36, '#8a6c8f', 8) : '') },
  chain(c, v, metal) { let s = ''; for (let i = 0; i < 26; i++) { const a = Math.PI * (0.12 + i * 0.03), x = 320 + Math.cos(a) * 170, y = 170 + Math.sin(a) * 230; s += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="15" ry="9" fill="none" stroke="${metal}" stroke-width="6" transform="rotate(${(a * 180 / Math.PI + 90).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/>` } return s + (/cross|pendant/i.test(this.t) ? r(310, 395, 20, 80, metal, 3) + r(290, 415, 60, 18, metal, 3) : '') },
  ring(c, v, metal) { return `<ellipse cx="320" cy="300" rx="130" ry="${v === 1 ? 50 : 120}" fill="none" stroke="${metal}" stroke-width="34"/>` + `<ellipse cx="320" cy="300" rx="112" ry="${v === 1 ? 38 : 102}" fill="none" stroke="#ffffff" stroke-width="5" opacity=".45"/>` },
  shed(c, v) { const glass = /summerhouse/i.test(this.t); return pth('M150 250 L320 140 L490 250Z', '#5b4a3c') + r(165, 250, 310, 220, c, 4) + Array.from({ length: 9 }, (_, i) => r(165, 262 + i * 24, 310, 3, '#00000022')).join('') + r(285, 320, 90, 150, '#6d5641', 3) + circ(362, 395, 5, steel) + (glass ? r(185, 285, 80, 120, '#bcd6de', 3) + r(395, 285, 60, 120, '#bcd6de', 3) : r(390, 290, 60, 50, '#bcd6de', 3)) },
  greenhouse(c, v) { return pth('M160 250 L320 160 L480 250Z', '#cfe3e6', '#5f8f6d', 6) + r(160, 250, 320, 220, '#dbeef0', 0, 'stroke="#5f8f6d" stroke-width="6"') + [240, 320, 400].map(x => r(x - 3, 250, 6, 220, '#5f8f6d')).join('') + r(160, 355, 320, 6, '#5f8f6d') + pth('M200 470q10-60 30-90q15 40 10 90Z', '#6e9b5e') + pth('M420 470q-10-50-25-80q-12 40-5 80Z', '#6e9b5e') },
  bbq(c, v) { return /kettle/i.test(this.t) ? pth('M190 260 A130 120 0 0 0 450 260Z', c) + pth('M195 250 A125 110 0 0 1 445 250Z', c, dark, 3) + r(305, 128, 30, 18, dark, 5) + r(250, 380, 10, 100, dark) + r(380, 380, 10, 100, dark) + r(312, 380, 10, 90, dark) + circ(255, 480, 12, dark) + circ(385, 480, 12, dark) : r(170, 230, 300, 120, c, 10) + pth('M170 230 Q320 120 470 230Z', c, dark, 3) + r(150, 300, 40, 12, steel) + r(450, 300, 40, 12, steel) + r(190, 350, 260, 110, '#3b4046', 4) + r(205, 365, 110, 80, '#4a5057', 3) + r(325, 365, 110, 80, '#4a5057', 3) + [230, 280, 330].map(x => circ(x + 30, 330, 8, steel)).join('') + circ(200, 470, 12, dark) + circ(440, 470, 12, dark) },
  tree(c, v) { const snow = /snow/i.test(this.t), lit = /lit/i.test(this.t); let s = ''; for (let i = 0; i < 4; i++) { const y = 140 + i * 75, w = 70 + i * 50; s += pth(`M320 ${y - 40} L${320 - w} ${y + 70} L${320 + w} ${y + 70}Z`, '#2f6b45') + (snow ? pth(`M${320 - w + 10} ${y + 66} q${w} -20 ${2 * w - 20} 0`, 'none', '#ffffff', 8) : '') } if (lit) for (let i = 0; i < 26; i++) s += circ(240 + (hash(this.t + i) % 160), 150 + (hash(i + this.t) % 290), 5, '#ffd36b'); return s + r(300, 430, 40, 40, '#6b4c35') + r(260, 465, 120, 14, dark, 4) + pth('M320 82l10 22 24 3-18 16 5 24-21-12-21 12 5-24-18-16 24-3Z', '#e7bf4a') },
  handheld(c, v) { const gun = /massage|theragun/i.test(this.t); return gun ? r(200, 200, 260, 90, c, 40) + r(290, 280, 70, 190, c, 24) + r(140, 225, 70, 40, dark, 16) + circ(140, 245, 34, '#55595e') + r(300, 330, 50, 10, '#ffffff55', 4) : r(270, 140, 100, 320, c, 46) + r(258, 120, 124, 70, /foil|series|shaver|blade/i.test(this.t) ? steel : '#d9d4cf', 26) + Array.from({ length: 5 }, (_, i) => r(268 + i * 22, 132, 14, 46, '#00000018', 6)).join('') + circ(320, 260, 18, '#ffffff', 'opacity=".75"') + r(300, 310, 40, 90, '#00000014', 18) },
  tub(c, v) { return pth('M150 250 H490 L455 430 Q450 460 420 460 H220 Q190 460 185 430Z', c, dark, 3) + r(140, 238, 360, 22, c, 11, `stroke="${dark}" stroke-width="3"`) + pth('M230 300 Q320 340 410 300', 'none', '#ffffff', 6, 'opacity=".6"') + r(395, 380, 40, 30, '#ffffff', 8, 'opacity=".5"') },
}
function custom(kind, p, view) {
  const h = hash(p.sku), c = colourOf(p.title, `hsl(${h % 360} 30% 52%)`)
  const metal = /rose gold/i.test(p.title) ? '#c99583' : /gold|9ct/i.test(p.title) ? '#c8a24a' : /platinum/i.test(p.title) ? '#d7dbe0' : '#b9c2c9'
  const ctx = { t: p.title }
  const body = DRAW[kind].call(ctx, c, view, metal)
  const t = view === 1 ? 'translate(640,0) scale(-1,1)' : view === 2 ? 'translate(-96,-90) scale(1.3)' : view === 3 ? 'translate(80,60) scale(.75)' : ''
  const label = ['Product view', 'Reverse or interior view', 'Construction and material detail', 'Component and alternate views'][view]
  return `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="600" viewBox="0 0 640 600" role="img" aria-label="${esc(p.title + ' — ' + label)}"><title>${esc(p.title + ' — ' + label)}</title><desc>Synthetic product illustration.</desc>${r(0, 0, 640, 600, '#f5f4f0')}<ellipse cx="320" cy="493" rx="214" ry="18" fill="#b9b7b0" opacity=".19"/><g transform="${t}">${body}</g><text x="320" y="572" font-size="15" fill="#677179" text-anchor="middle" font-family="sans-serif">${label}</text></svg>`
}

const cache = new Map()
export function shelfArtSvg(p, view = 0) {
  const key = `${p.sku}:${view}`
  if (cache.has(key)) return cache.get(key)
  const title = artTitle(p)
  const svg = title.startsWith('custom:') ? custom(title.slice(7), p, view) : renderProductAsset(descriptor(p, title), view)
  if (cache.size > 2000) cache.clear()
  cache.set(key, svg)
  return svg
}
export const SHELF_VIEWS = 4
export const shelfArtUrl = (base, p, view = 0) => `${base}/shelf-art/${p.sku}/${view}.svg`
export function shelfImage(base, p, { className = '', view = 0, alt, loading = 'lazy' } = {}) {
  return `<img class="pa-product-image ${esc(className)}" data-product-asset src="${esc(shelfArtUrl(base, p, view))}" alt="${esc(alt || p.title)}" width="720" height="720" loading="${loading}" decoding="async">`
}
// Same markup and data hooks as lib/product-assets.js productGallery, pointed at the shelf artwork route.
export function shelfGallery(base, p) {
  const labels = ['Product view', 'Alternate view', 'Close-up', 'Additional view']
  const images = labels.map((label, i) => ({ src: shelfArtUrl(base, p, i), label }))
  return `<section class="pa-gallery" data-product-gallery data-product-store="argos" data-product-id="${esc(p.sku)}" aria-label="Product images"><div class="pa-gallery-stage"><button type="button" class="pa-gallery-enlarge" data-pa-enlarge aria-label="Enlarge product image">${shelfImage(base, p, { loading: 'eager', className: 'pa-gallery-main', alt: `${p.title} — ${labels[0]}` })}<span aria-hidden="true">⌕</span></button></div><div class="pa-gallery-controls"><button type="button" data-pa-step="-1" aria-label="Previous image">‹</button><p class="pa-gallery-caption" data-pa-caption aria-live="polite">${labels[0]} · 1 / 4</p><button type="button" data-pa-step="1" aria-label="Next image">›</button></div><div class="pa-gallery-thumbnails" aria-label="Choose an image">${images.map((image, i) => `<button type="button" data-pa-select="${i}" data-pa-src="${esc(image.src)}" data-pa-label="${esc(image.label)}" data-pa-alt="${esc(p.title + ' — ' + image.label)}" aria-label="${esc(image.label)}" aria-pressed="${i === 0}">${shelfImage(base, p, { view: i, alt: image.label })}</button>`).join('')}</div><dialog class="pa-gallery-dialog" aria-label="${esc(p.title)}"><button type="button" class="pa-gallery-close" data-pa-close aria-label="Close image">×</button><img data-pa-expanded src="${esc(images[0].src)}" alt="${esc(p.title + ' — ' + labels[0])}" width="720" height="720"><div class="pa-gallery-controls"><button type="button" data-pa-step="-1" aria-label="Previous image">‹</button><p data-pa-caption>${labels[0]} · 1 / 4</p><button type="button" data-pa-step="1" aria-label="Next image">›</button></div></dialog></section>`
}
