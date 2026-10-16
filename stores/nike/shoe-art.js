// Nike shoe drawings for the shelf: a studio-style side profile per model
// family (court, runner, max-cushion, racer, trail, basketball, cleat, spike,
// trainer, slide, Converse), coloured from the nike.com colourway name
// ("Black/White-Anthracite" -> upper / Swoosh / sole accent).
// Views: 0 lateral side, 1 medial side, 2 top, 3 outsole.
import { createHash } from 'node:crypto'

// ---------- colour ----------
const NAMED = [
  [/^black$/i, "#1a1a1b"], [/^anthracite/i, '#36383b'], [/^off noir/i, '#2b2a2c'], [/^dark smoke grey/i, '#4a4c50'], [/^smoke grey/i, '#6f7175'], [/^iron grey/i, '#57595d'],
  [/^dark grey/i, '#4e5054'], [/^cool grey/i, '#8f9196'], [/^wolf grey/i, '#b3b5b9'], [/^light smoke grey/i, '#c9cacb'], [/^pure platinum/i, '#d7d9dc'], [/^platinum tint/i, '#e4e5e2'],
  [/^football grey/i, '#d6dad6'], [/^photon dust/i, '#e1e0db'], [/^neutral grey/i, '#a4a6a8'], [/^flat pewter/i, '#8b8a84'], [/^light iron ore/i, '#c8c3b8'], [/^metallic silver/i, '#c3c7cc'], [/^metallic dark grey/i, '#5d6064'],
  [/^metallic gold/i, '#c8a14a'], [/^university gold/i, '#f2b41c'], [/^metallic/i, '#b9bcc0'],
  [/^(summit white|optical white)/i, '#f4f4f1'], [/^white/i, '#f7f7f7'], [/^sail/i, '#eee8d9'], [/^coconut milk/i, '#efe6d3'], [/^light bone/i, '#e5ddc8'], [/^egret/i, '#ece4d1'], [/^parchment/i, '#e6dac0'], [/^ivory/i, '#f1ead8'],
  [/^gum light brown/i, '#c08447'], [/^gum medium brown/i, '#a8673a'], [/^gum yellow/i, '#d0a24d'], [/^gum/i, '#b87a40'],
  [/^wheat/i, '#c99b57'], [/^cacao/i, '#4a2f22'], [/^light orewood/i, '#d8cbb3'], [/^baroque brown/i, '#5d3b2a'], [/^hemp/i, '#b39c7a'], [/^khaki/i, '#b6a57c'], [/^light british tan/i, '#d2b48a'], [/^dark stucco/i, '#8b9083'], [/^oil grey/i, '#6d6a62'],
  [/^(game royal|varsity royal|old royal|deep royal)/i, '#1e48a8'], [/^hyper royal/i, '#2d5fd8'], [/^(midnight navy|college navy|armory navy|obsidian)/i, '#1c2440'], [/^university blue/i, '#8db6e1'], [/^laser blue/i, '#3c8de0'], [/^rush blue/i, '#2c62c9'], [/^nightshade/i, '#3a2a58'],
  [/^(university red|varsity red|gym red|team red)/i, '#c4182c'], [/^(light crimson|bright crimson)/i, '#ee2a4f'], [/^noble red/i, '#8e1b28'], [/^burgundy|^garnet/i, '#6e1f2c'],
  [/^volt/i, '#d6f20d'], [/^(total orange|max orange|hyper orange)/i, '#ff6418'], [/^amarillo/i, '#f7b500'], [/^citrine/i, '#f0d34a'], [/^vapor green/i, '#9fe9bd'], [/^medium olive/i, '#6a6c3b'], [/^vintage green/i, '#2f5a3f'], [/^mint foam/i, '#c4ecd8'],
  [/^(pink foam|light soft pink)/i, '#f6c9d3'], [/^(hyper pink|aster pink)/i, '#ff5c9b'], [/^hydrangeas/i, '#a9a6e1'], [/^field purple/i, '#5b3c8f'], [/^resin/i, '#b98a4d'],
]
const WORDS = [[/red|crimson/i, '#c8202f'], [/navy/i, '#1f2a4a'], [/royal|blue/i, '#2556b8'], [/green|olive/i, '#4f6e3e'], [/pink/i, '#f08bb0'], [/purple|violet/i, '#7253a8'], [/orange/i, '#f26b21'], [/yellow|gold/i, '#e8b923'], [/brown|tan/i, '#8d6e4d'], [/grey|gray|silver|platinum/i, '#a9abae'], [/white|bone|sail/i, '#f2f0ea'], [/black/i, '#161616']]
export const hexOf = name => { const n = String(name || '').trim(); return (NAMED.find(([re]) => re.test(n)) || WORDS.find(([re]) => re.test(n)) || [, '#8a8a8a'])[1] }
const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16))
const hex = c => '#' + c.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('')
const shade = (h, amt) => hex(rgb(h).map(v => amt < 0 ? v * (1 + amt) : v + (255 - v) * amt))
const mix = (a, b, t) => { const x = rgb(a), y = rgb(b); return hex(x.map((v, i) => v + (y[i] - v) * t)) }
const lum = h => { const [r, g, b] = rgb(h); return (0.299 * r + 0.587 * g + 0.114 * b) / 255 }
const light = h => lum(h) > 0.72
const contrast = h => lum(h) > 0.55 ? '#151515' : '#f7f7f7'
const edge = h => shade(h, lum(h) > 0.5 ? -0.22 : 0.18)

export function palette(colorName, kind) {
  const parts = String(colorName).split(/[/-]/).map(s => s.trim()).filter(Boolean)
  const names = parts.length ? parts : ['Black']
  const c = names.map(hexOf)
  const gum = names.findIndex(n => /gum/i.test(n))
  const upper = c[0]
  let swoosh = c[1] && Math.abs(lum(c[1]) - lum(upper)) > 0.08 ? c[1] : contrast(upper)
  if (c[1] && c[1] !== upper && (kind === 'dunk' || kind === 'aj1')) swoosh = c[1]
  const accent = c[2] || c[1] || shade(upper, 0.3)
  let mid
  if (['court', 'dunk', 'aj1', 'chuck', 'skate', 'retro', 'basket', 'trainer', 'golf'].includes(kind)) mid = light(upper) ? upper : names.some(n => /^(white|sail|summit white|egret)/i.test(n)) && kind !== 'basket' && kind !== 'trainer' ? (c.find(light) || '#f4f4f1') : (kind === 'chuck' ? '#f1ece0' : shade(upper, 0.06))
  else if (c.length >= 3) mid = c[2]
  else if (c[1]) mid = light(c[1]) ? c[1] : c[1]
  else mid = light(upper) ? upper : '#f2f2f0'
  if (gum >= 0 && ['court', 'dunk', 'aj1', 'skate', 'retro', 'chuck'].includes(kind)) mid = light(upper) ? upper : '#efe9dc'
  const outsole = gum >= 0 ? c[gum] : (kind === 'court' || kind === 'dunk' || kind === 'skate') ? mid : light(mid) ? '#2b2b2b' : shade(mid, -0.25)
  return { upper, swoosh, accent, mid, outsole, laces: light(upper) ? shade(upper, -0.04) : shade(upper, 0.08), lining: light(upper) ? '#d9d6cf' : shade(upper, 0.12) }
}

// ---------- model families ----------
function familyOf(p) {
  const t = p.title
  if (p.type === 'sandals') return 'slide'
  if (/Converse/.test(p.brand) || /^Converse/.test(t)) return 'chuck'
  if (p.type === 'cleats') return 'cleat'
  if (p.type === 'track') return 'spike'
  if (p.type === 'trail' || /ACG Mountain Fly/.test(t)) return 'trail'
  if (p.type === 'race') return 'racer'
  if (p.type === 'road') return /Vomero 18|Vomero Plus|Invincible|Pegasus Plus/.test(t) ? 'cushion' : 'runner'
  if (p.type === 'basketball') return 'basket'
  if (p.type === 'training' || p.sport === 'training') return 'trainer'
  if (p.type === 'golf') return 'golf'
  if (['tennis', 'court', 'wrestling', 'indoor'].includes(p.type) || ['tennis', 'volleyball', 'cheer', 'wrestling'].includes(p.sport)) return 'basket'
  if (/Jordan 1\b|Jordan 1 Low|Jordan 1 Mid|Air Jordan 1/.test(t)) return 'aj1'
  if (/Dunk/.test(t)) return p.sport === 'skateboarding' ? 'dunk' : 'dunk'
  if (/SB Chron|Blazer|Killshot|Court Vision|Court Legacy|Gamma Force|Field General|Total 90|Stay Loyal|Jordan 4|Jordan 3|Jordan 11|Spizike|Max Aura/.test(t)) return /Jordan 4|Jordan 3|Jordan 11|Spizike|Max Aura/.test(t) ? 'basket' : 'court'
  if (/Air Force 1/.test(t)) return 'court'
  if (/Cortez|Waffle|V2K|P-6000|Vomero 5|Superfly|Shox|Air Max|Revolution|Flex Runner|Star Runner/.test(t)) return /Air Max|Shox/.test(t) ? 'airmax' : /Revolution|Flex Runner|Star Runner/.test(t) ? 'runner' : 'retro'
  return p.cat === 'shoes' ? 'court' : 'court'
}
const seedOf = s => createHash('sha256').update(s).digest()

// Geometry per family. Units: px on a 640x600 canvas, toe on the left.
const BASE = {
  court: { stackH: 30, stackT: 28, out: 9, spring: 6, collar: 172, upperToe: 56, throat: 330, swoosh: [250, 300, 1.15], stitch: true },
  dunk: { stackH: 28, stackT: 26, out: 8, spring: 6, collar: 176, upperToe: 54, throat: 330, swoosh: [258, 298, 1.1], panels: true, stitch: true },
  aj1: { stackH: 26, stackT: 24, out: 8, spring: 6, collar: 250, upperToe: 54, throat: 345, swoosh: [262, 300, 1.08], panels: true, wings: true, stitch: true },
  retro: { stackH: 30, stackT: 18, out: 6, spring: 10, collar: 168, upperToe: 50, throat: 320, swoosh: [242, 300, 1.15], suede: true },
  airmax: { stackH: 46, stackT: 26, out: 7, spring: 12, collar: 172, upperToe: 52, throat: 325, swoosh: [248, 292, 0.95], air: 'window', mudguard: true },
  runner: { stackH: 40, stackT: 24, out: 6, spring: 14, collar: 166, upperToe: 50, throat: 320, swoosh: [250, 296, 1.0], mesh: true },
  cushion: { stackH: 60, stackT: 38, out: 6, spring: 20, collar: 162, upperToe: 50, throat: 322, swoosh: [256, 286, 0.92], mesh: true },
  racer: { stackH: 62, stackT: 42, out: 5, spring: 22, collar: 150, upperToe: 44, throat: 326, swoosh: [262, 286, 0.88], mesh: true, plate: true, thin: true },
  trail: { stackH: 40, stackT: 28, out: 11, spring: 12, collar: 172, upperToe: 54, throat: 322, swoosh: [250, 300, 0.95], mesh: true, lugs: true, bumper: true },
  basket: { stackH: 36, stackT: 26, out: 9, spring: 10, collar: 212, upperToe: 56, throat: 336, swoosh: [258, 296, 1.15], wrap: true },
  trainer: { stackH: 30, stackT: 26, out: 9, spring: 6, collar: 170, upperToe: 54, throat: 326, swoosh: [254, 300, 1.0], heelClip: true, rope: true },
  golf: { stackH: 30, stackT: 24, out: 7, spring: 8, collar: 170, upperToe: 54, throat: 326, swoosh: [250, 300, 1.05], nubs: true },
  cleat: { stackH: 12, stackT: 10, out: 5, spring: 10, collar: 150, upperToe: 46, throat: 330, swoosh: [256, 300, 1.05], studs: 'soccer', thin: true },
  spike: { stackH: 14, stackT: 8, out: 4, spring: 16, collar: 146, upperToe: 42, throat: 330, swoosh: [262, 300, 0.95], studs: 'spike', thin: true },
  chuck: { stackH: 30, stackT: 30, out: 6, spring: 4, collar: 262, upperToe: 54, throat: 360, toeCap: true, foxing: true, patch: true },
  slide: {},
}
function geometry(p) {
  const fam = familyOf(p)
  const g = { fam, ...BASE[fam] }
  const t = p.title, s = seedOf(p.title.replace(/ By You$/, ''))
  const h = p.height === 'high' ? 'high' : p.height === 'mid' ? 'mid' : 'low'
  if (fam === 'court' || fam === 'dunk' || fam === 'retro' || fam === 'golf' || fam === 'trainer') { if (h === 'mid') g.collar = 226; if (h === 'high') g.collar = 258 }
  if (fam === 'dunk' && h === 'high') { g.collar = 256; g.throat = 345 }
  if (fam === 'aj1' && h === 'low') { g.collar = 176; g.wings = false; g.throat = 330 }
  if (fam === 'aj1' && h === 'mid') g.collar = 232
  if (fam === 'cleat' && (h === 'high' || /Superfly|Luna/.test(t))) { g.collar = 210; g.sock = true }
  if (fam === 'cleat' && (p.sport === 'football' || p.sport === 'lacrosse')) { g.studs = 'football'; g.stackH = 18; g.collar = h === 'mid' ? 222 : 176 }
  if (fam === 'cleat' && p.sport === 'baseball') { g.studs = 'baseball'; g.stackH = 18 }
  if (fam === 'basket' && p.sport === 'wrestling') { g.collar = 250; g.stackH = 10; g.stackT = 9; g.out = 5; g.wrap = false; g.thin = true }
  if (fam === 'basket' && ['tennis', 'volleyball', 'cheer'].includes(p.sport)) { g.collar = 176; g.wrap = false; g.mesh = p.sport !== 'tennis'; g.stackH = 30 }
  if (/Jordan 11/.test(t)) { g.patent = true; g.collar = 222 }
  if (/Jordan 4/.test(t)) { g.collar = 214; g.wingsJ4 = true }
  if (/Jordan 3/.test(t)) { g.collar = 206; g.elephant = true; g.air = 'window' }
  if (/Air Max 270/.test(t)) { g.air = '270'; g.stackH = 66 }
  if (/Air Max 97/.test(t)) { g.air = 'full'; g.waves = true; g.mudguard = false }
  if (/Air Max Plus/.test(t)) { g.air = 'tn'; g.cage = true; g.mudguard = false; g.stackH = 44 }
  if (/Air Max Dn/.test(t)) { g.air = 'dn'; g.stackH = 52; g.mudguard = false; g.mesh = true }
  if (/Air Max SC/.test(t)) { g.stackH = 38 }
  if (/Shox/.test(t)) { g.air = 'shox'; g.stackH = 56 }
  if (/Air Max 1|Air Max 90 G/.test(t)) g.stackH = 40
  if (/Revolution|Flex Runner|Star Runner|Interact|Motiva|Downshifter/.test(t)) { g.stackH = 34; g.stackT = 22 }
  if (/Structure/.test(t)) { g.stackH = 46; g.post = true }
  if (/Winflo/.test(t)) g.stackH = 38
  if (/Pegasus 41/.test(t)) { g.stackH = 44; g.zoomPods = true }
  if (/Alphafly/.test(t)) { g.alpha = true; g.stackH = 66 }
  if (/Vaporfly/.test(t)) { g.stackH = 64 }
  if (/Zoom Fly/.test(t)) { g.stackH = 58 }
  if (/Invincible/.test(t)) { g.stackH = 68; g.stackT = 44 }
  if (/Vomero/.test(t) && fam === 'cushion') { g.stackH = 62; g.zoomPods = true }
  if (/V2K|P-6000|Vomero 5|Superfly/.test(t)) { g.stackH = 40; g.overlays = true; g.mesh = true }
  if (/Cortez/.test(t)) { g.stackH = 30; g.stackT = 16; g.cortez = true }
  if (/Waffle/.test(t)) { g.stackH = 26; g.stackT = 16 }
  if (/Blazer/.test(t)) { g.stackH = 22; g.stackT = 20; g.vulc = true; g.swoosh = [262, 286, 1.3] }
  if (/Air Force 1/.test(t)) { g.af1 = true; g.stackH = 34; g.stackT = 30 }
  if (/Metcon/.test(t)) { g.heelClip = true }
  if (/Romaleos/.test(t)) { g.lifter = true; g.strap = true; g.stackH = 44; g.stackT = 20 }
  if (/Free Metcon/.test(t)) g.flex = true
  if (/Run Star Hike/.test(t)) { g.platform = true; g.stackH = 52; g.stackT = 48 }
  if (/Chuck 70/.test(t)) g.stackH = 34
  // Per-model variation so neighbouring styles do not read as clones.
  const v = k => s[k] / 255
  if (g.swoosh) g.swoosh = [g.swoosh[0] + (v(1) - 0.5) * 26, g.swoosh[1] + (v(2) - 0.5) * 14, g.swoosh[2] * (0.9 + v(3) * 0.22)]
  g.collar += Math.round((v(4) - 0.5) * 12)
  g.meshKind = s[5] % 3
  g.heelTab = s[6] % 2 === 0
  g.sweep = (v(7) - 0.5) * 10
  if (p.g === 'kids' && (p.age === 'little' || p.age === 'baby')) g.strapKids = /Little|Baby/.test(p.subtitle) && fam !== 'slide' && fam !== 'cleat' && s[8] % 2 === 0
  const sporty = ['runner', 'cushion', 'racer', 'trail', 'basket', 'trainer', 'golf'].includes(fam)
  g.swooshStyle = sporty ? ['solid', 'solid', 'outline', 'small', 'heel'][s[9] % 5] : 'solid'
  if (/Pegasus 41$|Revolution|Air Force|Dunk|Jordan 1/.test(t)) g.swooshStyle = 'solid'
  g.heelOverlay = sporty && s[10] % 3 === 0
  g.twoTone = ['runner', 'cushion', 'racer'].includes(fam) && s[11] % 2 === 0
  return g
}

// ---------- paths ----------
const f = n => Math.round(n * 10) / 10
function smooth(pts, closed = false) {
  const P = closed ? [pts[pts.length - 1], ...pts, pts[0], pts[1]] : [pts[0], ...pts, pts[pts.length - 1]]
  let d = `M${f(P[1][0])} ${f(P[1][1])}`
  for (let i = 1; i < P.length - 2; i++) {
    const [p0, p1, p2, p3] = [P[i - 1], P[i], P[i + 1], P[i + 2]]
    d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`
  }
  return d + (closed ? 'Z' : '')
}
const SWOOSH = 'M0 38C-14 52-9 70 18 68 36 67 66 56 200 0L44 50C26 56 8 52 0 38Z'
const swooshAt = (x, y, sc, fill, rot = -4, stroke = '') => `<path d="${SWOOSH}" transform="translate(${f(x)} ${f(y)}) rotate(${rot}) scale(${f(sc * 0.82)} ${f(sc * 0.78)})" fill="${fill}"${stroke ? ` stroke="${stroke}" stroke-width="2"` : ''}/>`

const G = 438, TOE = 92, HEEL = 548
function sideShoe(g, pal, id) {
  const stackAt = x => g.stackT + (g.stackH - g.stackT) * Math.pow((x - TOE) / (HEEL - TOE), 0.9)
  const lift = x => x < TOE + 150 ? g.spring * Math.pow(1 - (x - TOE) / 150, 2) : 0
  const bottom = x => G - lift(x)
  const top = x => bottom(x) - g.out - stackAt(x)
  const xs = Array.from({ length: 13 }, (_, i) => TOE + 6 + (HEEL - TOE - 12) * i / 12)
  const collarY = G - g.collar
  const toeTop = top(TOE + 50) - g.upperToe
  const thr = g.throat
  // Upper silhouette.
  const H = g.collar, high = H > 200
  const throatY = G - H * (high ? 0.97 : 1.1), tongueY = G - H * (high ? 1.06 : 1.24), dipY = G - H * (high ? 0.93 : 0.9)
  const upperPts = [
    [TOE + 10, top(TOE + 10) + 2], [TOE - 2, top(TOE) - g.upperToe * 0.45], [TOE + 26, toeTop + 4], [TOE + 75, toeTop - 4], [TOE + 122, toeTop - 16 + g.sweep],
    [(TOE + 122 + thr) / 2, (toeTop - 16 + throatY) / 2 + 4], [thr, throatY], [thr + 18, tongueY], [thr + 40, tongueY + 18],
    [thr + 100, dipY], [HEEL - 26, collarY - 2], [HEEL - 2, collarY + 30], [HEEL + 6, collarY + (top(HEEL) - collarY) * 0.6], [HEEL - 6, top(HEEL - 6) + 2],
  ]
  const upper = smooth(upperPts, false) + `L${f(TOE + 10)} ${f(top(TOE + 10) + 2)}Z`
  const clip = `<clipPath id="u${id}"><path d="${upper}"/></clipPath>`
  const out = []
  // Midsole and outsole.
  const solePts = [...xs.map(x => [x, top(x)]), [HEEL + 4, top(HEEL) + 4], [HEEL + 2, bottom(HEEL) - 4], ...[...xs].reverse().map(x => [x, bottom(x)]), [TOE - 4, bottom(TOE) - g.out - 2]]
  const sole = smooth(solePts, true)
  const outsole = smooth([...xs.map(x => [x, bottom(x) - g.out]), [HEEL + 3, bottom(HEEL) - g.out], [HEEL + 1, bottom(HEEL) - 2], ...[...xs].reverse().map(x => [x, bottom(x)]), [TOE - 2, bottom(TOE) - 3]], true)
  // ----- upper body
  out.push(`<path d="${upper}" fill="${pal.upper}"/>`)
  const inner = []
  if (g.mesh) {
    const op = light(pal.upper) ? 0.1 : 0.2, col = light(pal.upper) ? '#000' : '#fff'
    inner.push(`<rect x="60" y="80" width="520" height="400" fill="url(#mesh${g.meshKind}${id})" opacity="${op}" style="color:${col}"/>`)
  }
  if (g.suede || g.overlays || g.mudguard || g.af1 || g.cortez) {
    const o = g.af1 ? pal.upper : g.mudguard ? pal.accent : g.cortez ? pal.upper : mix(pal.upper, pal.accent, 0.5)
    inner.push(`<path d="M${TOE - 10} ${top(TOE) - 28}C${TOE + 30} ${toeTop + 4} ${TOE + 70} ${toeTop + 4} ${TOE + 110} ${top(TOE + 110) - 34}L${TOE + 120} ${G}L${TOE - 10} ${G}Z" fill="${o}" stroke="${edge(o)}" stroke-width="2"/>`)
    inner.push(`<path d="M${HEEL - 96} ${G}C${HEEL - 92} ${collarY + 60} ${HEEL - 60} ${collarY + 30} ${HEEL - 18} ${collarY + 18}L${HEEL + 20} ${collarY + 10}L${HEEL + 20} ${G}Z" fill="${o}" stroke="${edge(o)}" stroke-width="2"/>`)
    if (g.mudguard) inner.push(`<path d="M${TOE + 110} ${G}L${TOE + 118} ${top(TOE + 118) - 22}L${HEEL - 80} ${top(HEEL - 80) - 26}L${HEEL - 70} ${G}Z" fill="${pal.accent}" opacity=".9" stroke="${edge(pal.accent)}" stroke-width="2"/>`)
  }
  if (g.panels) {
    const c = pal.swoosh
    inner.push(`<path d="M${TOE - 10} ${top(TOE) - 30}C${TOE + 34} ${toeTop + 2} ${TOE + 80} ${toeTop + 2} ${TOE + 116} ${top(TOE + 116) - 30}L${TOE + 124} ${G}L${TOE - 10} ${G}Z" fill="${c}" stroke="${edge(c)}" stroke-width="2"/>`)
    inner.push(`<path d="M${HEEL - 100} ${G}C${HEEL - 94} ${collarY + 70} ${HEEL - 60} ${collarY + 26} ${HEEL - 26} ${collarY + 16}L${HEEL + 20} ${collarY + 4}L${HEEL + 20} ${G}Z" fill="${c}" stroke="${edge(c)}" stroke-width="2"/>`)
  }
  if (g.wrap) inner.push(`<path d="M${thr - 70} ${G}C${thr - 40} ${collarY + 90} ${thr + 40} ${collarY + 40} ${HEEL - 40} ${collarY + 60}L${HEEL - 30} ${collarY + 90}C${thr + 40} ${collarY + 80} ${thr - 10} ${collarY + 130} ${thr - 30} ${G}Z" fill="${pal.accent}" opacity=".85"/>`)
  if (g.patent) inner.push(`<path d="M${TOE - 10} ${top(TOE) - 40}C${TOE + 100} ${top(TOE + 100) - 44} ${HEEL - 120} ${top(HEEL - 120) - 70} ${HEEL + 20} ${top(HEEL) - 76}L${HEEL + 20} ${G}L${TOE - 10} ${G}Z" fill="#111" opacity=".92"/><path d="M${TOE + 20} ${top(TOE + 20) - 30}C${TOE + 120} ${top(TOE + 120) - 36} ${HEEL - 150} ${top(HEEL - 150) - 56} ${HEEL - 20} ${top(HEEL - 20) - 64}" stroke="#fff" stroke-opacity=".35" stroke-width="4" fill="none"/>`)
  if (g.elephant) inner.push(`<path d="M${TOE - 10} ${top(TOE) - 34}C${TOE + 30} ${toeTop} ${TOE + 80} ${toeTop} ${TOE + 110} ${top(TOE + 110) - 34}L${TOE + 118} ${G}L${TOE - 10} ${G}Z" fill="#9b9a96"/><path d="M${HEEL - 90} ${G}C${HEEL - 86} ${collarY + 70} ${HEEL - 50} ${collarY + 40} ${HEEL + 20} ${collarY + 40}L${HEEL + 20} ${G}Z" fill="#9b9a96"/>`)
  if (g.waves) for (let i = 0; i < 4; i++) inner.push(`<path d="M${TOE - 10} ${top(TOE) - 10 - i * 22}C${TOE + 140} ${top(TOE) - 40 - i * 26} ${HEEL - 160} ${top(HEEL) - 24 - i * 30} ${HEEL + 20} ${top(HEEL) - 30 - i * 30}" stroke="${shade(pal.upper, light(pal.upper) ? -0.2 : 0.25)}" stroke-width="3" fill="none"/>`)
  if (g.cage) for (let i = 0; i < 5; i++) inner.push(`<path d="M${TOE + 60 + i * 70} ${G}C${TOE + 80 + i * 70} ${top(TOE + 80) - 60} ${TOE + 120 + i * 66} ${collarY + 60} ${TOE + 150 + i * 66} ${collarY + 20}" stroke="${pal.accent}" stroke-width="6" fill="none" opacity=".9"/>`)
  if (g.toeCap) inner.push(`<path d="M${TOE - 10} ${top(TOE) - 22}C${TOE + 10} ${top(TOE) - 40} ${TOE + 50} ${top(TOE + 50) - 40} ${TOE + 70} ${top(TOE + 70) - 6}L${TOE + 70} ${G}L${TOE - 10} ${G}Z" fill="#f2eee4" stroke="#cfc9bb" stroke-width="2"/>`)
  if (g.heelClip) inner.push(`<path d="M${HEEL - 70} ${top(HEEL - 70) + 2}C${HEEL - 64} ${top(HEEL) - 60} ${HEEL - 20} ${top(HEEL) - 70} ${HEEL + 20} ${top(HEEL) - 64}L${HEEL + 20} ${G}Z" fill="${pal.accent}" stroke="${edge(pal.accent)}" stroke-width="2"/>`)
  if (g.sock) inner.push(`<path d="M${thr - 20} ${collarY + 60}L${thr + 10} ${collarY - 30}L${HEEL + 20} ${collarY - 30}L${HEEL + 20} ${collarY + 40}C${HEEL - 80} ${collarY + 40} ${thr + 40} ${collarY + 50} ${thr - 20} ${collarY + 60}Z" fill="${shade(pal.upper, light(pal.upper) ? -0.12 : 0.1)}"/>`)
  if (g.post) inner.push(`<path d="M${HEEL - 150} ${top(HEEL - 150) + 2}L${HEEL - 150} ${top(HEEL - 150) - 18}L${HEEL - 20} ${top(HEEL - 20) - 18}L${HEEL - 20} ${top(HEEL - 20) + 2}Z" fill="${shade(pal.upper, -0.15)}" opacity=".6"/>`)
  if (g.heelOverlay) inner.push(`<path d="M${HEEL - 120} ${G}C${HEEL - 110} ${top(HEEL - 110) - 40} ${HEEL - 70} ${top(HEEL) - 70} ${HEEL + 20} ${top(HEEL) - 76}L${HEEL + 20} ${G}Z" fill="${pal.accent === pal.upper ? shade(pal.upper, 0.2) : pal.accent}" opacity=".95"/>`)
  // Laces and eyestay along the throat line.
  const laceN = g.collar > 200 ? 7 : 5
  const a = [TOE + 128, toeTop - 8], b = [thr - 8, throatY + 14]
  const eyestay = `M${f(a[0] - 4)} ${f(a[1] + 14)}L${f(b[0] - 8)} ${f(b[1] + 18)}`
  if (!g.vulc) inner.push(`<path d="${eyestay}" stroke="${g.panels ? pal.swoosh : shade(pal.upper, light(pal.upper) ? -0.14 : 0.16)}" stroke-width="${g.panels ? 40 : 16}" stroke-linecap="round" fill="none"/>`)
  else inner.push(`<path d="${eyestay}" stroke="${shade(pal.upper, light(pal.upper) ? -0.1 : 0.12)}" stroke-width="12" stroke-linecap="round" fill="none"/>`)
  // Toe perforations on court shoes.
  if (g.af1 || g.fam === 'dunk' || g.fam === 'aj1') for (let r = 0; r < 3; r++) for (let c = 0; c < 4 - r; c++) inner.push(`<circle cx="${TOE + 24 + c * 13 + r * 7}" cy="${f(toeTop + 22 + r * 11)}" r="2" fill="${shade(pal.upper, -0.35)}" opacity=".7"/>`)
  if (g.stitch) inner.push(`<path d="${upper}" fill="none" stroke="${shade(pal.upper, light(pal.upper) ? -0.25 : 0.3)}" stroke-width="1.4" stroke-dasharray="4 4" transform="translate(320 300) scale(.965) translate(-320 -300)" opacity=".6"/>`)
  if (g.foxing) inner.push(`<path d="M${TOE - 10} ${top(TOE) - 6}L${HEEL + 20} ${top(HEEL) - 6}" stroke="#1b1b1b" stroke-width="3"/><path d="M${TOE - 10} ${top(TOE) - 12}L${HEEL + 20} ${top(HEEL) - 12}" stroke="#c22a2a" stroke-width="2.5" opacity=".9"/>`)
  out.push(`<g clip-path="url(#u${id})">${inner.join('')}</g>`)
  // Swoosh (lateral): hook at the midfoot above the sole, tip toward the heel.
  if (g.swoosh && g.fam !== 'chuck') {
    const [sx, sy, sc0] = g.swoosh
    const st = g.swooshStyle, sc = st === 'small' ? sc0 * 0.72 : st === 'heel' ? sc0 * 0.5 : sc0
    const x0 = st === 'heel' ? HEEL - 150 : TOE + 104 + (sx - 250) + (st === 'small' ? 40 : 0), w = 1.16 * sc, hgt = 1.08 * sc
    const y0 = top(x0 + 80) - 12 - 70 * hgt + (sy - 300) * 0.6 - (st === 'heel' ? 40 : 0)
    const paint = st === 'outline' ? `fill="none" stroke="${pal.swoosh}" stroke-width="${f(3.2 / sc)}"` : `fill="${pal.swoosh}" stroke="${edge(pal.swoosh)}" stroke-width="1.2"`
    out.push(`<g clip-path="url(#u${id})"><path d="${SWOOSH}" transform="translate(${f(x0)} ${f(y0)}) rotate(-5) scale(${f(w)} ${f(hgt)})" ${paint}/></g>`)
  }
  if (g.patch) out.push(`<circle cx="${HEEL - 70}" cy="${collarY + 70}" r="22" fill="#f4f1ea" stroke="#bbb" stroke-width="2"/><path d="M${HEEL - 70} ${collarY + 58}l4 9 10 1-8 6 3 10-9-6-9 6 3-10-8-6 10-1z" fill="#1d3b8a"/>`)
  if (g.wings) out.push(`<path d="M${HEEL - 64} ${collarY + 10}L${HEEL - 22} ${collarY + 4}L${HEEL - 22} ${collarY + 44}L${HEEL - 64} ${collarY + 48}Z" fill="${shade(pal.swoosh, -0.1)}" opacity=".55"/><circle cx="${HEEL - 43}" cy="${collarY + 26}" r="9" fill="none" stroke="${contrast(pal.swoosh)}" stroke-opacity=".5" stroke-width="2"/>`)
  if (g.wingsJ4) out.push(`<path d="M${thr - 30} ${collarY + 60}L${thr + 30} ${collarY + 100}M${thr - 10} ${collarY + 46}L${thr + 50} ${collarY + 86}" stroke="${pal.accent}" stroke-width="7" stroke-linecap="round"/>`)
  if (g.strap || g.strapKids) { const mx = a[0] + (b[0] - a[0]) * 0.55, my = a[1] + (b[1] - a[1]) * 0.55; out.push(`<path d="M${f(mx - 26)} ${f(my - 4)}L${f(mx + 46)} ${f(top(mx + 46) - 6)}" stroke="${shade(pal.upper, light(pal.upper) ? -0.2 : 0.22)}" stroke-width="34" fill="none" stroke-linecap="round" clip-path="url(#u${id})"/>`) }
  // Laces on top of the eyestay.
  const lc = light(pal.upper) ? shade(pal.upper, -0.08) : g.fam === 'runner' || g.fam === 'cushion' ? shade(pal.upper, 0.12) : pal.laces
  if (!g.strapKids) for (let i = 0; i < laceN; i++) {
    const t = (i + 0.5) / laceN, x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t
    out.push(`<path d="M${f(x - 10)} ${f(y + 4)}L${f(x + 8)} ${f(y - 8)}" stroke="${lc}" stroke-width="6" stroke-linecap="round"/><circle cx="${f(x + 2)}" cy="${f(y + 18)}" r="2.6" fill="${shade(pal.upper, -0.4)}"/>`)
  }
  // Tongue top and collar lining.
  out.push(`<path d="M${thr - 8} ${f(throatY + 18)}L${thr + 12} ${f(tongueY + 4)}Q${thr + 24} ${f(tongueY - 4)} ${thr + 40} ${f(tongueY + 16)}L${thr + 28} ${f(throatY + 30)}Z" fill="${shade(pal.upper, light(pal.upper) ? -0.06 : 0.1)}" stroke="${edge(pal.upper)}" stroke-width="2"/>`)
  out.push(`<path d="M${thr + 38} ${f(tongueY + 22)}C${thr + 70} ${f(dipY + 8)} ${HEEL - 70} ${f(dipY + 4)} ${HEEL - 28} ${f(collarY + 4)}" stroke="${pal.lining}" stroke-width="9" fill="none" stroke-linecap="round"/>`)
  if (g.heelTab && !g.wings && g.fam !== 'chuck') out.push(`<path d="M${HEEL - 20} ${collarY - 2}L${HEEL - 6} ${collarY - 14}L${HEEL + 4} ${collarY + 16}Z" fill="${pal.accent}"/>`)
  // Sole.
  out.push(`<path d="${sole}" fill="${pal.mid}" stroke="${edge(pal.mid)}" stroke-width="2"/>`)
  if (g.twoTone && pal.swoosh !== pal.mid) out.push(`<path d="${smooth([...xs.map(x => [x, top(x) + (bottom(x) - top(x) - g.out) * 0.55]), [HEEL + 3, bottom(HEEL) - g.out], ...[...xs].reverse().map(x => [x, bottom(x) - g.out + 1])], true)}" fill="${pal.swoosh}" opacity=".9"/>`)
  out.push(`<path d="${outsole}" fill="${pal.outsole}"/>`)
  if (g.stitch && (g.af1 || g.fam === 'court' || g.fam === 'dunk')) out.push(`<path d="${smooth(xs.map(x => [x, top(x) + 9]))}" stroke="${shade(pal.mid, -0.3)}" stroke-width="1.4" stroke-dasharray="5 4" fill="none" opacity=".7"/>`)
  if (g.af1) out.push(`<path d="M${HEEL - 120} ${top(HEEL - 120) + 14}L${HEEL - 50} ${top(HEEL - 50) + 14}" stroke="${shade(pal.mid, -0.3)}" stroke-width="1.6" opacity=".5"/>`)
  if (g.fam === 'runner' || g.fam === 'cushion' || g.fam === 'trail') out.push(`<path d="${smooth(xs.slice(1, -1).map((x, i) => [x, top(x) + (bottom(x) - top(x) - g.out) * (0.55 + 0.1 * Math.sin(i))]))}" stroke="${shade(pal.mid, light(pal.mid) ? -0.12 : 0.15)}" stroke-width="2" fill="none" opacity=".8"/>`)
  if (g.zoomPods) out.push(`<path d="M${TOE + 120} ${top(TOE + 120) + 10}h70" stroke="${shade(pal.mid, light(pal.mid) ? -0.18 : 0.2)}" stroke-width="3" stroke-linecap="round"/>`)
  if (g.plate) out.push(`<path d="${smooth(xs.map(x => [x, top(x) + (bottom(x) - top(x)) * 0.48]))}" stroke="${pal.accent === pal.mid ? contrast(pal.mid) : pal.accent}" stroke-width="4" fill="none"/>`)
  if (g.alpha) for (const x of [TOE + 70, TOE + 108]) out.push(`<ellipse cx="${x}" cy="${f(bottom(x) - g.out - 14)}" rx="16" ry="11" fill="#e8f1f5" stroke="#9fb3bd" stroke-width="2"/>`)
  if (g.air) {
    const hx = HEEL - 70, ty = top(hx) + 8, by = bottom(hx) - g.out - 4
    const win = g.air === '270' ? `<path d="M${HEEL - 130} ${f(top(HEEL - 130) + 8)}C${HEEL - 120} ${ty - 4} ${HEEL + 10} ${ty - 4} ${HEEL} ${f(by - 6)}L${HEEL - 130} ${f(by)}Z"/>`
      : g.air === 'full' ? `<path d="${smooth(xs.slice(1, -1).map(x => [x, top(x) + 10]))}L${HEEL - 34} ${f(by)}L${TOE + 40} ${f(bottom(TOE + 40) - g.out - 4)}Z"/>`
      : g.air === 'dn' ? [0, 1, 2, 3].map(i => `<ellipse cx="${HEEL - 50 - i * 52}" cy="${f((top(HEEL - 50 - i * 52) + bottom(HEEL - 50 - i * 52) - g.out) / 2)}" rx="22" ry="${f((bottom(HEEL) - top(HEEL) - g.out) * 0.32)}"/>`).join('')
      : g.air === 'tn' ? `<path d="M${HEEL - 120} ${f(top(HEEL - 120) + 10)}h100v${f(by - ty - 6)}h-100z"/><path d="M${TOE + 50} ${f(top(TOE + 50) + 8)}h70v20h-70z"/>`
      : g.air === 'shox' ? [0, 1, 2, 3].map(i => `<rect x="${HEEL - 120 + i * 26}" y="${f(ty)}" width="16" height="${f(by - ty)}" rx="8"/>`).join('')
      : `<path d="M${HEEL - 110} ${f(ty + 4)}h70a10 10 0 0 1 10 10v${f(by - ty - 20)}h-80z"/>`
    out.push(`<g fill="rgba(222,236,244,.88)" stroke="${shade(pal.mid, -0.3)}" stroke-width="2">${win}</g>`)
    if (g.air === 'shox') { out.push(`<path d="M${HEEL - 128} ${f(ty)}h112" stroke="${pal.mid}" stroke-width="5"/>`) }
  }
  if (g.vulc || g.fam === 'chuck') out.push(`<path d="M${TOE - 2} ${f(top(TOE) + 10)}L${HEEL + 2} ${f(top(HEEL) + 10)}" stroke="${g.fam === 'chuck' ? '#1b1b1b' : shade(pal.mid, -0.25)}" stroke-width="${g.fam === 'chuck' ? 3 : 2}" opacity=".85"/>`)
  if (g.platform) for (let i = 0; i < 8; i++) { const x = TOE + 20 + i * 58; out.push(`<path d="M${x} ${f(bottom(x))}l14 14 14-14" fill="${pal.outsole}" stroke="${edge(pal.outsole)}" stroke-width="1.5"/>`) }
  if (g.lugs) for (let i = 0; i < 11; i++) { const x = TOE + 10 + i * 42; out.push(`<rect x="${x}" y="${f(bottom(x) - 2)}" width="22" height="9" rx="2" fill="${pal.outsole}"/>`) }
  if (g.bumper) out.push(`<path d="M${TOE - 4} ${f(top(TOE) - 2)}C${TOE - 8} ${top(TOE) - 30} ${TOE + 10} ${top(TOE) - 40} ${TOE + 30} ${top(TOE + 30) - 40}L${TOE + 34} ${f(top(TOE + 34))}Z" fill="${pal.outsole}" opacity=".9"/>`)
  if (g.nubs) for (let i = 0; i < 12; i++) { const x = TOE + 14 + i * 38; out.push(`<rect x="${x}" y="${f(bottom(x) - 1)}" width="10" height="5" rx="2" fill="${pal.outsole}"/>`) }
  if (g.studs) {
    const stud = g.studs, col = stud === 'spike' ? '#9aa1a6' : stud === 'baseball' ? '#9aa1a6' : pal.outsole
    const at = stud === 'spike' ? [TOE + 40, TOE + 85, TOE + 130, TOE + 175, TOE + 215] : stud === 'baseball' ? [TOE + 40, TOE + 110, TOE + 175, HEEL - 90, HEEL - 30] : stud === 'football' ? [TOE + 34, TOE + 90, TOE + 150, TOE + 205, HEEL - 110, HEEL - 40] : [TOE + 36, TOE + 92, TOE + 150, TOE + 205, HEEL - 100, HEEL - 36]
    for (const x of at) out.push(stud === 'spike' || stud === 'baseball' ? `<path d="M${x - 6} ${f(bottom(x))}l6 ${stud === 'spike' ? 16 : 14} 6-${stud === 'spike' ? 16 : 14}z" fill="${col}"/>` : `<path d="M${x - 11} ${f(bottom(x) - 2)}h22l-4 ${stud === 'football' ? 18 : 22}h-14z" fill="${col}" stroke="${edge(col)}" stroke-width="1.5"/>`)
    if (stud === 'spike') out.push(`<path d="${smooth([[TOE + 6, bottom(TOE + 6) - 3], [TOE + 120, bottom(TOE + 120) - 2], [TOE + 240, bottom(TOE + 240) - 2]])}" stroke="${pal.accent}" stroke-width="6" fill="none"/>`)
  }
  if (g.lifter) out.push(`<path d="M${HEEL - 150} ${f(top(HEEL - 150) + 6)}L${HEEL + 2} ${f(top(HEEL) + 6)}L${HEEL + 2} ${f(bottom(HEEL) - 4)}L${HEEL - 150} ${f(bottom(HEEL - 150) - 4)}Z" fill="${shade(pal.mid, -0.12)}" opacity=".5"/>`)
  if (g.flex) for (let i = 0; i < 5; i++) { const x = TOE + 40 + i * 30; out.push(`<path d="M${x} ${f(bottom(x) - 1)}v-${f(g.stackT * 0.6)}" stroke="${shade(pal.mid, -0.3)}" stroke-width="2"/>`) }
  return { svg: out.join(''), clip, top, bottom }
}

function slideSide(pal, p, id) {
  const sole = `<path d="M90 420C80 404 92 386 120 384L520 380C552 380 560 400 552 418C546 432 530 436 510 436L120 438C102 438 94 432 90 420Z" fill="${pal.mid}" stroke="${edge(pal.mid)}" stroke-width="2"/><path d="M92 424C100 438 112 440 124 440L512 438C530 438 546 434 552 422" stroke="${pal.outsole}" stroke-width="8" fill="none"/>`
  const strapCol = pal.upper
  const strap = /Koko|Sunray|Sophia/.test(p.title)
    ? `<path d="M150 384C160 300 220 280 300 290C330 294 360 330 372 384Z" fill="${strapCol}" stroke="${edge(strapCol)}" stroke-width="2"/><path d="M410 384C420 330 470 316 520 326L524 384Z" fill="${strapCol}" stroke="${edge(strapCol)}" stroke-width="2"/>`
    : `<path d="M140 386C142 300 200 262 280 262C350 262 392 300 400 384Z" fill="${strapCol}" stroke="${edge(strapCol)}" stroke-width="2"/>`
  const mark = /Benassi|Victori|Calm|Offcourt|Koko|Sunray/.test(p.title) ? swooshAt(170, 300, 0.95, pal.swoosh, -4) : `<text x="270" y="342" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-weight="800" font-size="38" fill="${pal.swoosh}">${/Jordan/.test(p.title) ? 'JORDAN' : 'NIKE'}</text>`
  return `${sole}${strap}<g>${mark}</g>`
}

// ---------- views ----------
function topView(g, pal, fam) {
  if (fam === 'slide') return `<path d="M320 90C392 90 420 150 420 230C420 320 404 410 400 460C396 510 360 530 320 530C280 530 244 510 240 460C236 410 220 320 220 230C220 150 248 90 320 90Z" fill="${pal.mid}" stroke="${edge(pal.mid)}" stroke-width="3"/><path d="M226 200C240 160 400 160 414 200L420 300C380 320 260 320 220 300Z" fill="${pal.upper}" stroke="${edge(pal.upper)}" stroke-width="2"/>${swooshAt(262, 236, 0.62, pal.swoosh, -10)}`
  const lc = light(pal.upper) ? shade(pal.upper, -0.08) : shade(pal.upper, 0.14)
  const laces = Array.from({ length: 6 }, (_, i) => `<path d="M292 ${190 + i * 30}L348 ${190 + i * 30}" stroke="${lc}" stroke-width="7" stroke-linecap="round"/>`).join('')
  return `<g transform="rotate(-14 320 300)"><path d="M320 66C388 66 418 130 420 210C422 300 410 380 404 450C398 520 364 548 320 548C276 548 242 520 236 450C230 380 218 300 220 210C222 130 252 66 320 66Z" fill="${pal.mid}" stroke="${edge(pal.mid)}" stroke-width="3"/><path d="M320 80C380 80 404 140 404 214C404 300 394 380 388 440C384 500 356 528 320 528C284 528 256 500 252 440C246 380 236 300 236 214C236 140 260 80 320 80Z" fill="${pal.upper}" stroke="${edge(pal.upper)}" stroke-width="2"/>${g.toeCap ? `<path d="M254 150C262 100 300 84 320 84C340 84 378 100 386 150C350 140 290 140 254 150Z" fill="#f2eee4"/>` : ''}<path d="M286 168h68v220h-68z" fill="${shade(pal.upper, light(pal.upper) ? -0.05 : 0.08)}" stroke="${edge(pal.upper)}" stroke-width="2" rx="10"/>${laces}<path d="M276 400C276 380 364 380 364 400L360 480C340 500 300 500 280 480Z" fill="${pal.lining}" stroke="${edge(pal.upper)}" stroke-width="3"/><path d="M392 300C380 260 372 236 360 216" stroke="${pal.swoosh}" stroke-width="10" stroke-linecap="round" fill="none"/></g>`
}
function soleView(g, pal, fam) {
  const o = pal.outsole, line = shade(o, light(o) ? -0.25 : 0.22)
  const shape = 'M320 66C388 66 418 130 420 210C422 300 410 380 404 450C398 520 364 548 320 548C276 548 242 520 236 450C230 380 218 300 220 210C222 130 252 66 320 66Z'
  let tread = ''
  if (g?.studs) tread = (g.studs === 'spike' ? [[280, 130], [360, 130], [262, 190], [378, 190], [320, 230]] : [[284, 120], [356, 120], [262, 190], [378, 190], [276, 260], [364, 260], [290, 470], [350, 470], [320, 410]]).map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${g.studs === 'spike' ? 10 : 16}" fill="${g.studs === 'spike' ? '#9aa1a6' : shade(o, 0.1)}" stroke="${line}" stroke-width="2"/>`).join('')
  else if (g?.lugs) tread = Array.from({ length: 9 }, (_, r) => Array.from({ length: 3 }, (_, c) => `<path d="M${262 + c * 40} ${110 + r * 46}l24 10-6 18-24-10z" fill="${line}"/>`).join('')).join('')
  else if (['court', 'dunk', 'aj1', 'basket', 'skate'].includes(fam)) tread = `<g fill="none" stroke="${line}" stroke-width="3">${[18, 34, 50].map(r => `<circle cx="320" cy="170" r="${r}"/>`).join('')}${[16, 30].map(r => `<circle cx="320" cy="460" r="${r}"/>`).join('')}${Array.from({ length: 10 }, (_, i) => `<path d="M246 ${240 + i * 18}h148"/>`).join('')}</g>`
  else if (fam === 'chuck') tread = `<g fill="none" stroke="${line}" stroke-width="3">${Array.from({ length: 22 }, (_, i) => `<path d="M236 ${96 + i * 20}l84 14 84-14"/>`).join('')}</g>`
  else tread = `<g fill="${line}">${Array.from({ length: 10 }, (_, r) => Array.from({ length: 4 }, (_, c) => `<rect x="${252 + c * 34}" y="${100 + r * 44}" width="22" height="22" rx="3" transform="rotate(45 ${263 + c * 34} ${111 + r * 44})"/>`).join('')).join('')}</g>`
  return `<g transform="rotate(-14 320 300)"><path d="${shape}" fill="${pal.mid}" stroke="${edge(pal.mid)}" stroke-width="3"/><clipPath id="sole-clip"><path d="${shape}" transform="translate(320 307) scale(.93) translate(-320 -307)"/></clipPath><path d="${shape}" transform="translate(320 307) scale(.93) translate(-320 -307)" fill="${o}"/><g clip-path="url(#sole-clip)">${tread}</g>${fam === 'slide' ? '' : swooshAt(272, 300, 0.5, line, -76)}</g>`
}

const MESH = id => `<pattern id="mesh0${id}" width="10" height="10" patternUnits="userSpaceOnUse"><circle cx="5" cy="5" r="1.7" fill="currentColor"/></pattern><pattern id="mesh1${id}" width="12" height="8" patternUnits="userSpaceOnUse"><path d="M0 4h12" stroke="currentColor" stroke-width="2"/></pattern><pattern id="mesh2${id}" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><path d="M0 0v12" stroke="currentColor" stroke-width="2.2"/></pattern>`

export function nikeShoeArt(p, color, view = 0) {
  const g = geometry(p), fam = g.fam
  const pal = palette(color.name, fam)
  const id = String(color.style).replace(/[^a-z0-9]/gi, '') + view
  const label = `${p.title} ${p.subtitle}`.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')
  let body = '', defs = MESH(id)
  if (view === 2) body = topView(g, pal, fam)
  else if (view === 3) body = soleView(g, pal, fam)
  else {
    let inner
    if (fam === 'slide') inner = slideSide(pal, p, id)
    else { const s = sideShoe(g, pal, id); defs += s.clip; inner = s.svg }
    body = `<g transform="translate(320 300) scale(1.12) translate(-322 -330)">${view === 1 ? `<g transform="translate(640 0) scale(-1 1)">${inner}</g>` : inner}</g>`
  }
  const shadow = view >= 2 ? '<ellipse cx="320" cy="560" rx="150" ry="14" fill="#000" fill-opacity=".06"/>' : '<ellipse cx="320" cy="440" rx="270" ry="16" fill="#000" fill-opacity=".08"/>'
  return `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="600" viewBox="0 0 640 600" role="img" aria-label="${label}" data-product-form="shoe" data-view="${view}"><title>${label}</title><defs>${defs}</defs><rect width="640" height="600" fill="#f5f5f5"/>${shadow}<g transform="translate(0 20)">${body}</g></svg>`
}
