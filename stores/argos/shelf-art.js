// Product pictures for the Argos assortment. Most items reuse the shared synthetic product renderer
// (lib/product-asset-art.js); a few Argos-heavy categories the renderer has no drawing for (jewellery,
// garden buildings, barbecues, Christmas trees, handheld grooming devices, baby baths) get a simple
// local illustration in the same style. These are illustrations, not retailer packshots.
import { esc } from '../../lib/html.js'
import { renderProductAsset, classifyProductAsset } from '../../lib/product-asset-art.js'

// category -> art noun the shared renderer understands, or custom:<kind> for a local drawing
const ART = {
  tv: 'television', soundbar: 'custom:soundbar', camera: 'camera', phone: 'mobile phone', watch: 'smartwatch', headphones: 'headphones',
  laptop: 'laptop', tablet: 'tablet', headset: 'gaming headset', gaminglaptop: 'laptop', psdigital: 'gift card',
  bed: 'bed', sofa: 'sofa', rug: 'rug', kitchenware: 'frying pan', dining: 'dining table', desk: 'desk', ceilinglight: 'ceiling light',
  storage: 'storage unit', hairstyler: 'custom:styler', toothbrush: 'tooth brush', perfume: 'perfume bottle', makeup: 'makeup palette',
  beautyappliance: 'custom:handheld', massager: 'custom:handheld', shaver: 'custom:handheld', bpmonitor: 'custom:bpmonitor',
  vacuum: 'custom:vacuum', fridge: 'fridge freezer', washer: 'washing machine', cooker: 'oven', dishwasher: 'custom:dishwasher', kettle: 'custom:kettle', toaster: 'custom:toaster', microwave: 'microwave', coffee: 'custom:coffee',
  heater: 'heater', airfryer: 'custom:airfryer', dumbbell: 'dumbbell', treadmill: 'custom:treadmill', exercisemat: 'yoga mat', bike: 'bike',
  football: 'football', suitcase: 'suitcase', tent: 'tent', tracker: 'activity tracker', menswatch: 'smartwatch', womenswatch: 'smartwatch',
  earrings: 'custom:earrings', chain: 'custom:chain', weddingring: 'custom:ring', jewellerybox: 'custom:jewellerybox', pram: 'stroller',
  earlylearning: 'learning toy', cot: 'cot', highchair: 'high chair', babybath: 'custom:tub', babymonitor: 'baby monitor', nightlight: 'nightlight',
  toddler: 'toy', playset: 'playset', boardgame: 'board game', creative: 'craft kit', doll: 'custom:doll', vehicle: 'remote control car',
  womens: 'hoodie', mens: 'hoodie', boys: 'hoodie', girls: 'hoodie', uniform: 'polo shirt', fancydress: 'hoodie',
  patio: 'garden table', gazebo: 'tent', shed: 'custom:shed', summerhouse: 'custom:shed', greenhouse: 'custom:greenhouse', bbq: 'custom:bbq', xmastree: 'custom:tree',
}
const ITEM_ART = { 'Habitat 16 Piece Stoneware Dinner Set - White': 'dinner plates', 'Joseph Joseph Nest 9 Plus Compact Food Preparation Set': 'mixing bowl', 'Stellar James Martin 5 Piece Knife Block Set': 'kitchen knife', 'PlayStation Plus Essential 12 Month Membership': 'gift card', 'Gro Company Hatch Groclock Sleep Trainer': 'nightlight', 'Shark Steam & Scrub Automatic Steam Mop S6002UK': 'custom:vacuum', 'Smeg KLF03 Electric Kettle - Cream': 'custom:kettle', 'Hoover H-Wash 300 8KG 1400 Spin Washing Machine - White': 'washing machine', 'Opti Vinyl Dumbbells - 2 x 3kg': 'dumbbell', 'Tower T17088 Vortx 9L Dual Basket Air Fryer - Black': 'custom:airfryer', 'Remington One Dry & Style Hair Dryer Brush': 'custom:styler', 'Revolution Ultimate Beauty Advent Calendar Makeup Set': 'makeup palette', 'Rimmel London Mascara and Lip Makeup Gift Set': 'lipstick', 'VTech Baby Musical Rhyme Book': 'learning toy', 'Tommee Tippee Closer to Nature Starter Feeding Set': 'baby bottle', 'Cuggl Lulworth 3 in 1 Cot Bed - White': 'cot', 'LEGO Classic Large Creative Brick Box 10698': 'building bricks', 'Chad Valley Bumper Craft Box': 'craft kit', 'Hot Wheels 5 Car Gift Pack': 'toy car', 'Chicco Next2Me Magic Bedside Crib - Grey': 'crib', 'Fitbit Charge 6 Fitness Tracker - Obsidian': 'activity tracker', 'Fitbit Inspire 3 Fitness Tracker - Midnight Zen': 'activity tracker', 'Tu Mens Slim Fit Stretch Jeans - Indigo': 'jeans', 'Tu Girls Black Leggings 3 Pack': 'jeans', 'Tu Girls Grey Pleated School Skirt 2 Pack': 'skirt', 'Kickmaster 8ft x 5ft Folding Football Goal': 'football', 'Argos Home Rattan Effect 4 Seater Garden Sofa Set - Grey': 'sofa', 'Mele & Co Grey Velvet Jewellery Box': 'custom:jewellerybox', 'Argos Home Mirrored Jewellery Cabinet - White': 'storage cabinet', 'Chad Valley Ocean Light Projector': 'nightlight' }

const hash = s => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) } return h >>> 0 }
const COLOURS = [['black', '#2b2e33'], ['white', '#ecebe6'], ['grey', '#8b9296'], ['gray', '#8b9296'], ['silver', '#b7bec4'], ['stainless', '#b7bec4'], ['steel', '#b7bec4'], ['navy', '#2f3f63'], ['blue', '#3d6aa8'], ['green', '#4f7a5a'], ['sage', '#8ea58a'], ['pink', '#d898b0'], ['red', '#b5443f'], ['cream', '#efe4cb'], ['natural', '#c9b48e'], ['oak', '#b99a73'], ['walnut', '#7a5a3f'], ['brass', '#b9974b'], ['gold', '#c8a24a'], ['rose gold', '#c99583'], ['purple', '#7a5aa0'], ['brown', '#7b5a43'], ['charcoal', '#43474c'], ['terracotta', '#b8674a']]
const colourOf = (title, fallback) => (COLOURS.filter(([k]) => new RegExp(`\\b${k}\\b`, 'i').test(title)).sort((a, b) => b[0].length - a[0].length)[0] || [, fallback])[1]

function descriptor(p, title) {
  const type = p.catalogType === 'game' ? 'game' : p.catalogType === 'console' ? 'console' : 'other'
  return { store: 'argos', id: p.sku, title, canonicalTitle: title, type, platform: p.catalogPlatform, format: p.format || (type === 'game' ? 'disc' : 'physical'), edition: type === 'game' ? 'standard' : null, category: p.category, brand: p.brand, specs: p.specs, assetKey: `argos-shelf-${p.sku}`, raw: { ...p, title, shape: undefined, art: undefined, colorName: type === 'other' ? finish(p.title) : undefined } }
}
// Argos titles name the finish after the dash ("... Electric Kettle - White"); draw the item in that colour.
const finish = title => colourOf(String(title).split(' - ').slice(1).join(' '), undefined)

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
  airfryer(c) {
    const dual = /dual|double|2 drawer|basket/i.test(this.t), stack = /stack/i.test(this.t), clear = /clear|window/i.test(this.t)
    const trim = '#565b61', hi = '#ffffff22'
    if (stack) return r(200, 120, 240, 350, c, 34) + r(215, 140, 210, 34, '#1d2024', 10) + circ(320, 157, 9, '#e0473f') + [190, 330].map(y => r(222, y, 196, 120, trim, 18) + r(275, y + 48, 90, 20, '#1d2024', 10)).join('') + r(212, 128, 20, 320, hi, 10)
    if (dual) return r(130, 170, 380, 300, c, 34) + r(150, 186, 340, 44, '#1d2024', 10) + [190, 290, 360, 450].map((x, i) => circ(x, 208, i % 3 ? 6 : 8, i === 1 ? '#e0473f' : '#9aa1a8')).join('') + [150, 330].map(x => r(x, 250, 160, 196, trim, 18) + r(x + 45, 330, 70, 22, '#1d2024', 11)).join('') + r(140, 180, 18, 270, hi, 9)
    return r(205, 150, 230, 320, c, 60) + r(235, 172, 170, 50, '#1d2024', 14) + circ(320, 197, 12, '#e0473f') + r(225, 260, 190, 190, trim, 24) + (clear ? r(250, 290, 140, 70, '#c9d6db', 10, 'opacity=".85"') : '') + r(285, 375, 70, 24, '#1d2024', 12) + r(215, 170, 18, 280, hi, 9)
  },
  styler(c) {
    const t = this.t, body = c
    if (/straightener/i.test(t)) return `<g transform="rotate(-18 320 300)">${r(250, 120, 52, 360, body, 22)}${r(318, 120, 52, 360, body, 22)}${r(262, 140, 28, 150, '#c9c3bb', 6)}${r(330, 140, 28, 150, '#c9c3bb', 6)}${r(250, 420, 120, 60, body, 24)}${circ(310, 380, 7, '#e0473f')}${pth('M310 480 q-10 40 40 70', 'none', '#3a3e44', 6)}</g>`
    if (/brush/i.test(t)) return `<g transform="rotate(-20 320 300)">${r(292, 280, 56, 220, body, 26)}<ellipse cx="320" cy="200" rx="78" ry="105" fill="${body}"/><ellipse cx="320" cy="200" rx="58" ry="84" fill="#2f3439"/>${Array.from({ length: 30 }, (_, i) => circ(285 + (i % 5) * 17, 140 + Math.floor(i / 5) * 24, 5, '#d8d2c8')).join('')}${circ(320, 360, 8, '#e0473f')}</g>`
    if (/dryer/i.test(t) && !/styler/i.test(t)) return r(170, 170, 260, 120, body, 60) + r(150, 185, 60, 90, '#3a3e44', 24) + Array.from({ length: 4 }, (_, i) => r(162, 198 + i * 18, 36, 8, '#5d6268', 4)).join('') + circ(380, 230, 34, '#3a3e44') + circ(380, 230, 20, '#5d6268') + r(280, 260, 72, 210, body, 26) + r(298, 320, 36, 50, '#00000020', 12) + circ(316, 300, 7, '#e0473f')
    // multi-styler: wand with a barrel attachment, spare attachments alongside
    return r(250, 200, 66, 270, body, 30) + r(262, 230, 42, 30, '#00000022', 10) + circ(283, 300, 7, '#ffffffaa') + r(256, 90, 54, 120, '#c9b8a6', 24) + Array.from({ length: 7 }, (_, i) => r(260, 102 + i * 15, 46, 5, '#8f7f6f', 2)).join('') + r(380, 260, 46, 130, '#c9b8a6', 22) + Array.from({ length: 6 }, (_, i) => r(384, 272 + i * 17, 38, 5, '#8f7f6f', 2)).join('') + r(450, 300, 70, 110, body, 30) + Array.from({ length: 12 }, (_, i) => circ(466 + (i % 3) * 19, 318 + Math.floor(i / 3) * 22, 4, '#d8d2c8')).join('') + pth('M283 470 q0 30 -60 20', 'none', '#3a3e44', 6)
  },
  bpmonitor(c) { const unit = '#ecebe6'; return pth('M110 360 q0 -70 90 -80 h70 q20 0 20 20 v110 q0 20 -20 20 h-70 q-90 -10 -90 -70Z', '#4c5866', dark, 2) + r(150, 300, 90, 120, '#5e6b7a', 14) + pth('M290 350 q40 0 50 30 t60 20', 'none', '#3a3e44', 6) + r(340, 230, 200, 230, unit, 26, `stroke="${dark}" stroke-width="3"`) + r(365, 258, 150, 110, '#c9d6c4', 8, `stroke="${dark}" stroke-width="2"`) + `<text x="440" y="312" font-size="40" font-family="monospace" font-weight="700" text-anchor="middle" fill="#2f3439">120</text><text x="440" y="352" font-size="26" font-family="monospace" text-anchor="middle" fill="#2f3439">80</text>` + circ(440, 410, 22, '#3d6aa8') + circ(385, 410, 10, '#8b9296') + circ(495, 410, 10, '#8b9296') },
  dishwasher(c) { const slim = /slim/i.test(this.t), w = slim ? 210 : 270, x = 320 - w / 2; return r(x, 140, w, 330, c, 10, `stroke="${dark}" stroke-width="3"`) + r(x, 140, w, 52, '#3a3e44', 10) + r(x + 18, 156, 70, 20, '#1d2024', 5) + [0, 1, 2, 3].map(i => circ(x + w - 30 - i * 26, 166, 6, i ? '#8b9296' : '#7fb6d6')).join('') + r(x + w / 2 - 50, 212, 100, 12, '#9aa1a8', 6) + r(x + 14, 240, w - 28, 210, '#ffffff14', 6) + r(x + 6, 462, w - 12, 16, '#2f3439', 4) },
  soundbar(c) { const sub = /sub|\b[23]\.1\b/i.test(this.t), bx = sub ? 70 : 100, bw = sub ? 360 : 440; const dots = Array.from({ length: Math.floor((bw - 50) / 14) }, (_, i) => Array.from({ length: 3 }, (_, j) => circ(bx + 25 + i * 14, 375 + j * 13, 3, '#00000040')).join('')).join(''); return r(bx, 355, bw, 76, c, 36) + dots + circ(bx + bw / 2, 362, 3, '#7fb6d6') + (sub ? r(455, 230, 130, 240, c, 16) + circ(520, 330, 46, '#00000035') + circ(520, 330, 24, '#00000035') + r(470, 450, 100, 6, '#00000030', 3) : '') },
  treadmill(c) { const pad = /walking pad|under desk/i.test(this.t), belt = '#2f3439'; if (pad) return pth('M110 420 L530 420 L555 455 L90 455Z', c, dark, 3) + r(140, 412, 360, 14, belt, 6) + r(470, 395, 70, 24, '#3a3e44', 8) + circ(505, 407, 6, '#7fb6d6'); return pth('M90 430 L470 430 L520 470 L80 470Z', c, dark, 3) + r(110, 420, 350, 14, belt, 6) + pth('M455 430 L430 200', 'none', c, 18, 'stroke-linecap="round"') + pth('M455 430 L430 200', 'none', dark, 2) + r(380, 160, 150, 60, '#3a3e44', 14) + r(398, 172, 80, 34, '#7fb6d6', 6, 'opacity=".75"') + circ(500, 190, 9, '#e0473f') + pth('M430 225 L330 245', 'none', '#3a3e44', 12, 'stroke-linecap="round"') },
  doll(c) {
    const t = this.t, skin = /annabell/i.test(t) ? '#f1c9a5' : ['#f1c9a5', '#c68e65', '#8d5a3b'][hash(t) % 3], hair = /ruby|rainbow/i.test(t) ? '#c0392b' : /annabell/i.test(t) ? '#c8954a' : '#e6c46a'
    if (/dreamhouse|house/i.test(t)) return r(140, 200, 360, 270, '#f3b6cf', 6, `stroke="${dark}" stroke-width="3"`) + pth('M120 205 L320 90 L520 205Z', '#e05f97', dark, 3) + r(140, 290, 360, 10, '#ffffff') + r(140, 380, 360, 10, '#ffffff') + r(318, 200, 6, 270, '#ffffff') + [[170, 220], [350, 220], [170, 310], [350, 310], [170, 400], [350, 400]].map(([x, y], i) => r(x, y, 120, 60, i % 2 ? '#bfe3ef' : '#ffe08a', 6)).join('') + pth('M500 300 q60 40 40 170', 'none', '#f7d34a', 18, 'stroke-linecap="round"') + circ(320, 150, 22, '#ffffff', 'opacity=".85"')
    if (/annabell|baby/i.test(t)) return circ(320, 190, 72, skin) + pth('M250 170 q70 -80 140 0 q-30 -30 -70 -28 q-40 -2 -70 28Z', hair) + circ(295, 195, 7, dark) + circ(345, 195, 7, dark) + pth('M305 228 q15 12 30 0', 'none', '#b5443f', 4) + pth('M235 280 q85 -30 170 0 l20 160 q-105 30 -210 0Z', c) + circ(225, 330, 26, skin) + circ(415, 330, 26, skin) + circ(270, 455, 28, skin) + circ(370, 455, 28, skin)
    return circ(320, 140, 34, skin) + pth('M282 140 q-6 -60 38 -62 q44 2 38 62 l10 110 q-20 6 -26 -10 l-6 -80 q-16 -30 -32 0 l-6 80 q-6 16 -26 10Z', hair) + circ(308, 140, 4, dark) + circ(332, 140, 4, dark) + pth('M312 158 q8 6 16 0', 'none', '#c0392b', 3) + r(312, 172, 16, 18, skin) + pth('M292 190 h56 l6 70 l40 120 h-148 l40 -120Z', c) + r(266, 196, 14, 120, skin, 7, 'transform="rotate(12 273 196)"') + r(360, 196, 14, 120, skin, 7, 'transform="rotate(-12 367 196)"') + r(300, 380, 14, 90, skin, 7) + r(326, 380, 14, 90, skin, 7) + r(294, 462, 24, 10, c, 5) + r(322, 462, 24, 10, c, 5)
  },
  jewellerybox(c) { const lid = '#a9afb3'; return pth('M190 300 L220 170 H420 L450 300Z', lid, dark, 3) + pth('M205 290 L230 185 H410 L435 290Z', '#c6cbcf') + r(180, 300, 280, 160, c, 14, `stroke="${dark}" stroke-width="3"`) + r(198, 314, 244, 70, '#6f767b', 8) + Array.from({ length: 5 }, (_, i) => r(206 + i * 47, 322, 40, 54, '#7d858a', 18)).join('') + r(270, 405, 100, 14, '#c8a24a', 7) },
  // Floorcare: cordless stick (default), upright, cylinder (Henry gets his face), robot and steam mop.
  vacuum(c) {
    const t = this.t, round = 'stroke-linecap="round"', clear = '#cfdde2', wheel = '#3a3e44'
    if (/robot/i.test(t)) return `<ellipse cx="320" cy="425" rx="190" ry="58" fill="${dark}"/><ellipse cx="320" cy="408" rx="186" ry="56" fill="${c}"/><ellipse cx="320" cy="402" rx="150" ry="42" fill="#ffffff22"/><ellipse cx="320" cy="388" rx="46" ry="16" fill="#3a3e44"/><ellipse cx="320" cy="384" rx="30" ry="9" fill="#55595e"/>` + circ(250, 410, 6, '#7fb6d6') + pth('M150 440 l-34 22 M150 440 l-6 30 M150 440 l26 20', 'none', '#8b9296', 4, round)
    if (/steam mop/i.test(t)) return pth('M300 455 L372 120', 'none', steel, 14, round) + r(352, 92, 40, 70, dark, 14) + `<g transform="rotate(12 336 300)">${r(312, 230, 50, 140, '#bfdbe8', 18, `stroke="#7d9aa6" stroke-width="3"`)}${r(320, 300, 34, 60, '#ffffff66', 12)}</g>` + r(180, 446, 250, 30, c, 13) + r(186, 474, 238, 9, '#ffffff', 4, `stroke="#d6d4ce" stroke-width="1"`)
    if (/cylinder|henry/i.test(t)) {
      const henry = /henry/i.test(t)
      return pth('M335 400 C 440 400 455 330 430 250', 'none', '#3a3e44', 15, round) + pth('M430 250 L488 448', 'none', steel, 12, round) + r(412, 222, 34, 48, dark, 12) + r(440, 444, 120, 30, dark, 12) + r(150, 320, 200, 150, c, 70) + r(150, 395, 200, 75, '#00000018', 40) + circ(190, 472, 17, wheel) + circ(310, 472, 17, wheel)
        + (henry ? r(168, 296, 164, 44, dark, 20) + circ(222, 372, 13, '#fff') + circ(278, 372, 13, '#fff') + circ(225, 374, 6, dark) + circ(281, 374, 6, dark) + pth('M215 410 q35 28 70 0', 'none', dark, 6, round) + circ(250, 393, 9, dark) : r(176, 306, 148, 30, dark, 14) + r(300, 350, 30, 30, '#ffffff33', 10))
    }
    if (/upright/i.test(t)) return r(190, 420, 260, 56, dark, 22) + r(205, 428, 230, 10, c, 5) + circ(214, 478, 12, wheel) + circ(426, 478, 12, wheel) + r(268, 190, 104, 246, c, 32) + r(284, 218, 72, 120, clear, 22, `stroke="#8a9aa1" stroke-width="3"`) + r(294, 240, 24, 70, '#ffffff66', 10) + r(372, 250, 10, 100, '#444a50', 4) + r(305, 80, 30, 128, dark, 14) + r(288, 66, 64, 28, dark, 14)
    // cordless stick: handle, motor and clear bin at the top, long wand, floor head
    return pth('M392 282 L252 446', 'none', steel, 16, round) + r(150, 440, 210, 38, dark, 16) + r(166, 446, 176, 8, c, 4) + circ(338, 476, 8, '#555b61')
      + r(368, 172, 60, 112, clear, 24, `stroke="#8a9aa1" stroke-width="3"`) + r(378, 192, 18, 62, '#ffffff77', 8) + r(360, 118, 78, 72, c, 24) + pth('M430 132 q54 -6 54 -58 q0 -22 -22 -22 h-34', 'none', c, 18, round) + r(424, 186, 48, 82, dark, 12) + circ(448, 205, 5, '#7fb6d6')
  },
  // Electric kettles: cordless jug on a power base (default), glass jug, or a rounded retro dome.
  kettle(c) {
    const t = this.t, round = 'stroke-linecap="round"', base = r(196, 446, 248, 26, '#2f3439', 10) + r(214, 452, 12, 6, '#7fb6d6', 3)
    if (/dome|retro|smeg|dualit|classic/i.test(t)) return base + pth('M206 446 Q200 252 320 236 Q440 252 434 446Z', c, dark, 3) + pth('M220 420 Q216 290 300 262', 'none', '#ffffff55', 10, round) + pth('M212 330 Q160 300 150 250 l18 -6 Q190 290 222 300Z', c, dark, 3) + pth('M268 244 Q320 140 392 248', 'none', dark, 20, round) + circ(320, 232, 13, dark) + r(300, 400, 40, 12, '#00000022', 6)
    const glass = /glass/i.test(t), body = glass ? '#d3e3e9' : c
    return base + pth('M246 196 L398 196 Q412 196 413 210 L428 432 Q429 446 414 446 L226 446 Q211 446 212 432 L231 210 Q232 196 246 196Z', body, dark, 3)
      + (glass ? r(232, 230, 180, 34, '#2f3439', 4) + pth('M224 360 L420 360 L426 432 Q427 440 418 440 L222 440 Q213 440 214 432Z', '#9fd0e6', 'none', 0, 'opacity=".75"') + r(232, 410, 180, 30, '#2f3439', 4) : r(252, 236, 22, 168, '#bfdbe8', 10, `stroke="${dark}" stroke-width="2"`) + pth('M254 336 h18 v58 a9 9 0 0 1 -18 0Z', '#7fb6d6') + pth('M300 220 L306 420', 'none', '#ffffff40', 12, round))
      + r(238, 176, 168, 26, dark, 12) + r(296, 166, 52, 14, '#3a3e44', 7) + pth('M244 200 L196 172 L206 214 L238 236Z', body, dark, 3)
      + pth('M404 214 Q478 214 474 314 Q470 404 426 418', 'none', dark, 28, round) + pth('M404 214 Q462 216 460 314 Q456 396 424 406', 'none', glass ? '#2f3439' : c, 14, round)
  },
  toaster(c) {
    const four = /4 slice/i.test(this.t), slots = four ? [196, 262, 344, 410].map(x => r(x, 236, 44, 12, '#1d2024', 6)) : [214, 336].map(x => r(x, 236, 92, 12, '#1d2024', 6))
    return r(170, 226, 300, 32, c, 16) + r(170, 226, 300, 32, '#00000018', 16) + slots.join('') + r(170, 246, 300, 200, c, 44) + r(188, 268, 14, 150, '#ffffff38', 7) + r(170, 400, 300, 46, '#00000014', 30) + r(470, 300, 26, 16, dark, 5) + circ(272, 378, 15, '#d9d6cf') + circ(272, 378, 6, dark) + [330, 362, 394].map(x => r(x - 12, 372, 24, 12, '#d9d6cf', 6)).join('') + r(190, 444, 260, 10, '#00000030', 5)
  },
  coffee(c) {
    const t = this.t, cup = (x, y) => r(x, y, 64, 58, '#ffffff', 8, `stroke="${dark}" stroke-width="3"`) + pth(`M${x + 64} ${y + 14} q24 0 24 18 q0 18 -24 18`, 'none', dark, 5) + r(x + 4, y + 6, 56, 10, '#6b4a33', 4)
    if (/filter|grind and brew/i.test(t)) return r(318, 140, 130, 320, c, 18) + r(196, 128, 252, 74, c, 28) + r(208, 196, 120, 8, '#00000030', 4) + pth('M212 300 h132 l-12 150 h-108Z', '#c9d6dbaa', dark, 3) + pth('M219 372 h118 l-7 72 h-104Z', '#5a3b28') + pth('M344 320 q36 0 36 40 q0 40 -40 40', 'none', dark, 7) + r(200, 452, 252, 20, dark, 6) + circ(400, 250, 9, '#e0473f')
    if (/bean to cup|3-in-1/i.test(t)) return r(168, 140, 304, 330, c, 18) + r(196, 112, 96, 36, dark, 10) + r(330, 168, 116, 62, '#1d2024', 8) + r(344, 182, 88, 32, '#7fb6d6', 4) + r(206, 248, 228, 182, '#1d2024', 14) + r(296, 258, 48, 28, steel, 6) + r(214, 418, 212, 20, '#55595e', 6) + cup(288, 360)
    if (/\bespresso|bambino|dedica|barista/i.test(t)) return r(196, 132, 248, 330, c, 18) + r(196, 132, 248, 40, '#00000022', 18) + r(224, 186, 96, 22, '#1d2024', 6) + [240, 262, 284, 306].map((x, i) => circ(x, 197, 5, i ? '#9aa1a8' : '#7fb6d6')).join('') + r(372, 180, 44, 30, '#d9d6cf', 8) + r(286, 244, 68, 34, steel, 10) + pth('M320 284 L470 306', 'none', dark, 18, 'stroke-linecap="round"') + r(296, 278, 48, 16, steel, 4) + pth('M410 236 L440 372', 'none', steel, 6, 'stroke-linecap="round"') + r(214, 428, 212, 26, '#55595e', 6) + cup(288, 370)
    // pod machine: water tank behind, head with spout, cup on the drip tray
    return r(400, 170, 52, 270, '#bfdbe8aa', 12, `stroke="#7d9aa6" stroke-width="2"`) + r(312, 150, 110, 310, c, 18) + r(206, 146, 236, 96, c, 32) + r(206, 210, 236, 30, '#00000022', 12) + r(292, 238, 40, 22, dark, 6) + circ(380, 176, 10, '#7fb6d6') + r(206, 440, 236, 28, dark, 8) + cup(278, 382)
  },
}
function custom(kind, p, view) {
  const h = hash(p.sku), c = colourOf(p.title, { soundbar: '#2b2e33', treadmill: '#3a3e44', airfryer: '#2b2e33', coffee: '#2b2e33', toaster: '#ecebe6', kettle: '#b7bec4', dishwasher: '#ecebe6', bpmonitor: '#ecebe6' }[kind] || `hsl(${h % 360} 30% 52%)`)
  const metal = /rose gold/i.test(p.title) ? '#c99583' : /gold|9ct/i.test(p.title) ? '#c8a24a' : /platinum/i.test(p.title) ? '#d7dbe0' : '#b9c2c9'
  const ctx = { t: p.title }
  const body = DRAW[kind].call(ctx, c, view, metal)
  const t = view === 1 ? 'translate(640,0) scale(-1,1)' : view === 2 ? 'translate(-96,-90) scale(1.3)' : view === 3 ? 'translate(80,60) scale(.75)' : ''
  const label = ['Product view', 'Reverse or interior view', 'Construction and material detail', 'Component and alternate views'][view]
  return `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="600" viewBox="0 0 640 600" role="img" aria-label="${esc(p.title + ' — ' + label)}"><title>${esc(p.title + ' — ' + label)}</title><desc>${esc(p.title)}</desc>${r(0, 0, 640, 600, '#f5f4f0')}<ellipse cx="320" cy="493" rx="214" ry="18" fill="#b9b7b0" opacity=".19"/><g transform="${t}">${body}</g></svg>`
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
