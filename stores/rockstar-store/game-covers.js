// Box art and in-game scenes for the Rockstar PC titles sold on the store (no real artwork can be used).
// Each cover is drawn in the look of the real one: the comic-panel grid of Grand Theft Auto V, the red-and-black grid
// of Red Dead Redemption 2, the sunset outlaw of Red Dead Redemption, the notebook of Bully, and so on. Scenes are the
// 16:9 pictures used for a title's screenshot and video tiles and for the extra gallery pictures.
import { esc } from '../../lib/html.js'

const W = 416, H = 514
const HEAVY = 'font-family="Arial Black, Impact, Helvetica Neue, Arial, sans-serif" font-weight="900"'
const SERIF = 'font-family="Georgia, Times New Roman, serif" font-weight="700"'
const rng = seed => { let s = [...String(seed)].reduce((n, c) => (n * 31 + c.charCodeAt(0)) >>> 0, 7) || 1; return () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 2 ** 32 }
const grad = (id, stops, vertical = true) => `<linearGradient id="${id}" x1="0" y1="0" x2="${vertical ? 0 : 1}" y2="${vertical ? 1 : 0}">${stops.map((c, i) => `<stop offset="${i / (stops.length - 1)}" stop-color="${c}"/>`).join('')}</linearGradient>`
const txt = (x, y, size, fill, s, extra = '') => `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" ${extra.includes('font-family') ? '' : HEAVY} ${extra}>${esc(s)}</text>`
const at = (x, y, s, inner, flip = false) => `<g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})">${inner}</g>`

// ---------- silhouettes, drawn around a local origin (ground at y=0 unless noted) ----------
const SIL = {
  cowboy: f => `<g fill="${f}"><path d="M-14 16L-16 30Q-60 38-82 74H82Q60 38 16 30L14 16Z"/><ellipse cy="0" rx="18" ry="22"/><path d="M-62-16Q-40-26-26-22L-22-52Q0-64 22-52L26-22Q40-26 62-16Q40-6 0-8Q-40-6-62-16Z"/></g>`,
  rider: f => `<g fill="${f}"><ellipse cy="-50" rx="38" ry="16"/><path d="M24-60L44-88L56-84L48-58Z M44-88L64-76L60-68L46-74Z M-38-54Q-54-40-48-22L-43-24Q-46-40-33-48Z"/><rect x="-32" y="-44" width="5" height="44"/><rect x="-22" y="-42" width="5" height="42"/><rect x="18" y="-42" width="5" height="42"/><rect x="28" y="-44" width="5" height="44"/><path d="M-7-62H7L9-94H-9Z"/><circle cy="-101" r="7"/><ellipse cy="-106" rx="14" ry="3"/><rect x="-6" y="-115" width="12" height="9" rx="2"/><path d="M8-90L30-96L31-93L9-86Z"/></g>`,
  person: f => `<g fill="${f}"><circle cy="-92" r="9"/><path d="M-14-80H14L18-42H10L8 0H2L0-36L-2 0H-8L-10-42H-18Z"/></g>`,
  fedora: f => `<g fill="${f}"><path d="M-18 14L-20 28Q-66 40-86 80H86Q66 40 20 28L18 14Z"/><ellipse rx="17" ry="21"/><path d="M-50-14Q-30-22-22-20L-20-44Q0-54 20-44L22-20Q30-22 50-14Q30-6 0-8Q-30-6-50-14Z"/><path d="M-22 26L0 60L22 26L12 24L0 40L-12 24Z" fill-opacity=".55"/></g>`,
  bald: f => `<g fill="${f}"><path d="M-16 18L-18 30Q-64 40-84 78H84Q64 40 18 30L16 18Z"/><ellipse cy="-4" rx="20" ry="25"/><rect x="40" y="38" width="44" height="10" rx="2"/><rect x="44" y="46" width="10" height="20"/></g>`,
  palm: f => `<g fill="${f}"><path d="M-3 0Q2-60 10-118L14-118Q6-60 3 0Z"/>${['M12-118Q-20-132-44-104Q-14-122 12-113Z', 'M12-118Q44-134 64-106Q38-122 12-113Z', 'M12-118Q0-150-26-152Q2-140 10-116Z', 'M12-118Q30-150 52-150Q28-136 14-116Z', 'M12-118Q-10-110-24-84Q-4-106 12-114Z', 'M12-118Q36-108 44-84Q30-106 12-114Z'].map(d => `<path d="${d}"/>`).join('')}</g>`,
  pine: f => `<path fill="${f}" d="M0-110L18-70H8L26-36H10L32 0H-32L-10-36H-26L-8-70H-18Z"/>`,
  tree: f => `<g fill="${f}"><rect x="-3" y="-40" width="6" height="40"/><circle cy="-56" r="24"/><circle cx="-16" cy="-44" r="16"/><circle cx="16" cy="-44" r="16"/></g>`,
  cactus: f => `<path fill="${f}" d="M-6 0V-70Q0-78 6-70V0Z M-6-36H-18V-58Q-14-62-12-58V-44H-6Z M6-44H16V-64Q20-68 22-64V-38H6Z"/>`,
  car: f => `<g fill="${f}"><path d="M-62-8L-58-22L-32-26L-16-40H24L42-26L60-22L64-8Z"/><circle cx="-36" cy="-6" r="10"/><circle cx="38" cy="-6" r="10"/></g>`,
  oldcar: f => `<g fill="${f}"><path d="M-64-6Q-66-22-48-24L-30-26Q-20-46 6-46Q30-46 34-28L56-24Q66-20 64-6Z"/><circle cx="-38" cy="-6" r="11"/><circle cx="40" cy="-6" r="11"/></g>`,
  bike: f => `<g fill="${f}"><circle cx="-30" cy="-12" r="12" fill="none" stroke="${f}" stroke-width="5"/><circle cx="32" cy="-12" r="12" fill="none" stroke="${f}" stroke-width="5"/><path d="M-30-12L-8-34H18L32-12L24-10L14-28H-4L-24-8Z M-6-36L-12-50H-2Z M14-30L22-46L30-44L22-28Z"/><circle cx="2" cy="-62" r="7"/><path d="M-4-54L8-54L14-36L-6-36Z"/></g>`,
  heli: f => `<g fill="${f}"><ellipse rx="30" ry="14"/><path d="M24-4L82-10V-4L26 6Z"/><rect x="-62" y="-23" width="124" height="3"/><rect x="-2" y="-21" width="4" height="8"/><rect x="-24" y="16" width="48" height="3"/><rect x="74" y="-18" width="3" height="16"/></g>`,
  plane: f => `<g fill="${f}"><path d="M-70 0L60-6Q76-4 76 0Q76 4 60 6Z M-6-2L-32-42H-18L20-2Z M-6 2L-32 42H-18L20 2Z M-60-2L-74-24H-64L-48-2Z"/></g>`,
  train: f => `<g fill="${f}"><rect x="-90" y="-44" width="70" height="36"/><rect x="-16" y="-30" width="78" height="22"/><rect x="40" y="-52" width="12" height="24"/><path d="M62-8L80-8L70-24H62Z"/>${[-76, -46, -6, 26, 52].map(x => `<circle cx="${x}" cy="-6" r="8"/>`).join('')}</g>`,
  tent: f => `<path fill="${f}" d="M-40 0L0-50L40 0Z M0-50V-60"/>`,
  ferris: f => `<g fill="none" stroke="${f}" stroke-width="4"><circle cy="-80" r="70"/><circle cy="-80" r="8" fill="${f}"/>${[0, 30, 60, 90, 120, 150].map(a => `<line x1="${-70 * Math.cos(a * Math.PI / 180)}" y1="${-80 - 70 * Math.sin(a * Math.PI / 180)}" x2="${70 * Math.cos(a * Math.PI / 180)}" y2="${-80 + 70 * Math.sin(a * Math.PI / 180)}"/>`).join('')}<path d="M-40 0L0-80L40 0"/></g>`,
}

function skyline(x0, base, w, maxH, r, fill, lit, k = 1) {
  let x = x0, out = ''
  while (x < x0 + w) {
    const bw = (18 + r() * 34) * k, bh = maxH * (0.3 + r() * 0.7)
    out += `<rect x="${x.toFixed(1)}" y="${(base - bh).toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" fill="${fill}"/>`
    if (lit) for (let wy = base - bh + 8 * k; wy < base - 6 * k; wy += 10 * k) for (let wx = x + 4 * k; wx < x + bw - 5 * k; wx += 8 * k) if (r() < 0.32) out += `<rect x="${wx.toFixed(1)}" y="${wy.toFixed(1)}" width="${(3.5 * k).toFixed(1)}" height="${(5 * k).toFixed(1)}" fill="${lit}"/>`
    if (r() < 0.12) out += `<rect x="${(x + bw / 2 - k).toFixed(1)}" y="${(base - bh - 18 * k).toFixed(1)}" width="${2 * k}" height="${18 * k}" fill="${fill}"/>`
    x += bw + (r() < 0.3 ? 4 * k : 0)
  }
  return out
}
function ridge(x0, base, w, h, r, fill, steps = 7, jag = 0.5) {
  const pts = [[x0, base]]
  for (let i = 0; i <= steps; i++) pts.push([x0 + (w * i) / steps, base - h * (1 - jag + jag * r())])
  pts.push([x0 + w, base])
  return `<path fill="${fill}" d="M${pts.map(p => p.map(n => n.toFixed(1)).join(' ')).join('L')}Z"/>`
}
const mesa = (x, base, w, h, fill) => `<path fill="${fill}" d="M${x} ${base}L${x + w * 0.12} ${base - h}H${x + w * 0.88}L${x + w} ${base}Z"/>`

// ---------- panel scenes (used inside cover grids and as full scenes) ----------
// p: { sky: [top, bottom], far, near, ground, sil, sun, lit }
function panelScene(kind, x, y, w, h, p, seed) {
  const r = rng(seed), cx = x + w / 2, base = y + h, big = w > 600, k = big ? 2.4 : 1, s = Math.min(w, h) / (big ? 170 : 120)
  const road = big ? `<rect x="${x}" y="${base - h * 0.2}" width="${w}" height="${h * 0.2}" fill="${p.ground}"/>${Array.from({ length: 8 }, (_, i) => `<rect x="${x + i * w / 7 - 30}" y="${base - h * 0.1}" width="70" height="6" fill="#f2e6c0" opacity=".7"/>`).join('')}` : ''
  const stars = big && p === P.night ? Array.from({ length: 50 }, () => `<circle cx="${(x + r() * w).toFixed(0)}" cy="${(y + r() * h * 0.45).toFixed(0)}" r="${(1 + r() * 1.6).toFixed(1)}" fill="#fff" opacity=".7"/>`).join('') : ''
  let out = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#sky-${seed})"/>`
  const defs = grad(`sky-${seed}`, p.sky)
  const sun = (fx, fy, rr) => p.sun ? `<circle cx="${x + w * fx}" cy="${y + h * fy}" r="${rr * s}" fill="${p.sun}"/>` : ''
  switch (kind) {
    case 'skyline': out += sun(0.75, 0.32, 16) + skyline(x - 4, base, w + 8, h * 0.7, r, p.far, p.lit, k) + skyline(x - 10, base, w + 20, h * 0.42, r, p.sil, p.lit, k) + (big ? at(x + w * 0.06, base, s * 1.3, SIL.palm(p.sil)) + at(x + w * 0.95, base, s * 1.1, SIL.palm(p.sil), true) : ''); break
    case 'palms': out += sun(0.5, 0.55, 26) + `<rect x="${x}" y="${base - h * 0.22}" width="${w}" height="${h * 0.22}" fill="${p.near}"/>` + at(x + w * 0.22, base, s * 1.05, SIL.palm(p.sil)) + at(x + w * 0.78, base, s * 0.8, SIL.palm(p.sil), true); break
    case 'heli': out += sun(0.2, 0.3, 12) + skyline(x, base, w, h * 0.3, r, p.far) + at(cx, y + h * 0.42, s * 0.9, SIL.heli(p.sil)); break
    case 'plane': out += sun(0.8, 0.7, 20) + ridge(x, base, w, h * 0.25, r, p.far) + at(cx, y + h * 0.4, s * 0.8, SIL.plane(p.sil)); break
    case 'car': out += stars + sun(0.82, 0.3, 14) + ridge(x, base - h * 0.2, w, h * 0.3, r, p.far) + (big ? skyline(x + w * 0.05, base - h * 0.2, w * 0.5, h * 0.38, r, p.far, p.lit, k) + road + at(x + w * 0.84, base - h * 0.2, s * 1.4, SIL.palm(p.sil)) : `<rect x="${x}" y="${base - h * 0.22}" width="${w}" height="${h * 0.22}" fill="${p.ground}"/>`) + at(cx, base - h * 0.06, s * 0.85, SIL.car(p.sil)); break
    case 'bike': out += sun(0.7, 0.35, 18) + (big ? skyline(x, base - h * 0.2, w, h * 0.4, r, p.far, p.lit, k) + road : `<rect x="${x}" y="${base - h * 0.18}" width="${w}" height="${h * 0.18}" fill="${p.ground}"/>`) + at(cx, base - h * 0.05, s, SIL.bike(p.sil)); break
    case 'person': out += sun(0.3, 0.3, 30) + at(cx, base, s * 1.15, SIL.person(p.sil)); break
    case 'bust': out += at(cx, base - h * 0.42, s * 0.95, SIL.cowboy(p.sil)); break
    case 'fedora': out += (big ? skyline(x, base, w, h * 0.55, r, p.far, p.lit, k) + `<rect x="${x + w * 0.78}" y="${y + h * 0.2}" width="10" height="${h * 0.8}" fill="${p.sil}"/><path d="M${x + w * 0.78 - 30} ${y + h * 0.2}h70l-12 26h-46z" fill="${p.sil}"/><path d="M${x + w * 0.78 - 60} ${base}L${x + w * 0.78 - 18} ${y + h * 0.25}h36L${x + w * 0.78 + 80} ${base}z" fill="#ffe9a8" opacity=".14"/>` : '') + at(big ? x + w * 0.4 : cx, base - h * 0.42, s * 0.95, SIL.fedora(p.sil)); break
    case 'vinewood': out += ridge(x, base, w, h * 0.55, r, p.far, 5, 0.4) + [...'VINEWOOD'].map((c, i) => txt(x + w * (big ? 0.06 : 0.16) + i * w * (big ? 0.05 : 0.09), y + h * (big ? 0.62 : 0.62), (big ? 15 : 12) * s, p.lit || '#fff', c, `${HEAVY}`)).join('') + ridge(x, base, w, h * 0.25, r, p.near); break
    case 'beach': out += sun(0.6, 0.4, 18) + `<rect x="${x}" y="${y + h * 0.55}" width="${w}" height="${h * 0.2}" fill="${p.far}"/>${[0, 1, 2, 3].map(i => `<rect x="${x + w * (0.6 - 0.08 + i * 0.015)}" y="${y + h * (0.58 + i * 0.045)}" width="${w * (0.16 - i * 0.03)}" height="${h * 0.012}" fill="${p.sun}" opacity=".6"/>`).join('')}<rect x="${x}" y="${y + h * 0.75}" width="${w}" height="${h * 0.25}" fill="${p.ground}"/>` + at(x + w * 0.8, base, s * 0.75, SIL.palm(p.sil)) + (big ? at(x + w * 0.12, base - h * 0.04, s * 0.8, SIL.person(p.sil)) : ''); break
    case 'rider': out += sun(0.75, 0.35, 16) + (big ? ridge(x, base - h * 0.15, w, h * 0.55, r, p.near, 9, 0.5) : '') + ridge(x, base - h * 0.15, w, h * 0.35, r, p.far) + `<rect x="${x}" y="${base - h * 0.16}" width="${w}" height="${h * 0.16}" fill="${p.ground}"/>` + at(cx, base - h * 0.08, s * 0.85, SIL.rider(p.sil)); break
    case 'pines': out += sun(0.7, 0.25, 12) + (big ? ridge(x, base - h * 0.1, w, h * 0.85, r, '#eef3f6', 4, 0.5) : '') + ridge(x, base - h * 0.1, w, h * 0.6, r, p.far, 5, 0.6) + [0.15, 0.4, 0.62, 0.86].map((f, i) => at(x + w * f, base, s * (0.7 + 0.3 * (i % 2)), SIL.pine(p.sil))).join(''); break
    case 'train': out += sun(0.2, 0.3, 14) + ridge(x, base - h * 0.2, w, h * 0.3, r, p.far) + `<rect x="${x}" y="${base - h * 0.2}" width="${w}" height="${h * 0.2}" fill="${p.ground}"/><rect x="${x}" y="${base - h * 0.19}" width="${w}" height="${3 * k}" fill="${p.sil}"/>` + (big ? [0, 1, 2, 3].map(i => `<circle cx="${cx + (36 - i * 50) * s * 0.7}" cy="${base - h * 0.18 - (70 + i * 26) * s * 0.7}" r="${(16 + i * 8) * s * 0.7}" fill="#fff" opacity="${0.5 - i * 0.1}"/>`).join('') + at(x + w * 0.12, base - h * 0.2, s * 0.9, SIL.pine(p.sil)) + at(x + w * 0.9, base - h * 0.2, s * 1.1, SIL.pine(p.sil)) : '') + at(cx, base - h * 0.18, s * 0.7, SIL.train(p.sil)); break
    case 'camp': out += stars + sun(0.8, 0.25, 6) + (big ? ridge(x, base - h * 0.15, w, h * 0.45, r, p.near, 6, 0.5) + [0.06, 0.14, 0.88, 0.95].map((f, i) => at(x + w * f, base - h * 0.1, s * (1 + (i % 2) * 0.3), SIL.pine(p.sil))).join('') + at(cx + w * 0.24, base - h * 0.08, s * 0.7, SIL.person(p.sil)) : '') + ridge(x, base - h * 0.15, w, h * 0.3, r, p.far) + `<rect x="${x}" y="${base - h * 0.16}" width="${w}" height="${h * 0.16}" fill="${p.ground}"/>` + at(x + w * 0.3, base - h * 0.1, s * 0.8, SIL.tent(p.sil)) + `<path d="M${cx + w * 0.15} ${base - h * 0.1}l${6 * s} ${-18 * s} ${6 * s} ${18 * s}z" fill="${p.lit || '#f5a623'}"/>`; break
    case 'cactus': out += sun(0.5, 0.45, 24) + (big ? mesa(x + w * 0.55, base - h * 0.14, w * 0.4, h * 0.2, p.near) : '') + mesa(x + w * 0.05, base - h * 0.14, w * 0.45, h * 0.3, p.far) + `<rect x="${x}" y="${base - h * 0.16}" width="${w}" height="${h * 0.16}" fill="${p.ground}"/>` + (big ? at(x + w * 0.4, base - h * 0.04, s * 0.8, SIL.rider(p.sil)) : '') + at(x + w * 0.75, base - h * 0.04, s * 0.9, SIL.cactus(p.sil)); break
    default: break
  }
  return { defs, body: out }
}
// Draw a list of panels [kind, x, y, w, h, palette] clipped to their rectangles on a frame color.
function grid(frame, panels, seed) {
  let defs = '', body = `<rect width="${W}" height="${H}" fill="${frame}"/>`
  panels.forEach(([kind, x, y, w, h, pal], i) => {
    const id = `${seed}${i}`, sc = panelScene(kind, x, y, w, h, pal, id)
    defs += `<clipPath id="c${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath>${sc.defs}`
    body += `<g clip-path="url(#c${id})">${sc.body}</g>`
  })
  return { defs, body }
}
const svg = (defs, body, label, w = W, h = H) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label)}"><defs>${defs}</defs>${body}</svg>`
const outlined = (stroke, width) => `stroke="${stroke}" stroke-width="${width}" paint-order="stroke" stroke-linejoin="round"`
const gtaWordmark = (x, y, size, fill = '#fff', stroke = '#000') => ['grand', 'theft', 'auto'].map((w, i) => txt(x, y + i * size * 0.86, size, fill, w, `${HEAVY} ${outlined(stroke, size * 0.16)} letter-spacing="-1"`)).join('')
const rLogo = (x, y, s = 1, fill = '#fff') => at(x, y, s, `<rect x="-17" y="-17" width="34" height="34" rx="6" fill="${fill === '#fff' ? '#fcaf17' : fill}"/>${txt(-11, 10, 26, '#111', 'R', `${HEAVY} font-style="italic"`)}<path d="M8-12l2 4.5 5 .5-3.8 3.3 1.2 4.9-4.4-2.6-4.4 2.6 1.2-4.9L1-7l5-.5z" fill="#111"/>`)

// ---------- palettes ----------
const P = {
  dusk: { sky: ['#f6a04d', '#e2557b'], far: '#7a3b6e', near: '#3a1f3f', ground: '#4b2a3d', sil: '#1a0f1c', sun: '#ffe08a', lit: '#ffd36b' },
  day: { sky: ['#6fc3ef', '#c9ecff'], far: '#5b8fb0', near: '#5c8a3a', ground: '#8a8f96', sil: '#1d2833', sun: '#fff4c2', lit: '#ffffff' },
  smog: { sky: ['#f2c27b', '#f7e3b5'], far: '#b9895b', near: '#7d5a3c', ground: '#6f6a64', sil: '#2b1f17', sun: '#fff1c9', lit: '#fff' },
  teal: { sky: ['#1f9fb4', '#7fe0d2'], far: '#167a8a', near: '#0c4f5a', ground: '#e8d3a2', sil: '#082a30', sun: '#fff6cf', lit: '#fff' },
  night: { sky: ['#0b1736', '#283a6b'], far: '#1a2547', near: '#0e1530', ground: '#232a3a', sil: '#05070f', sun: '#e9eef7', lit: '#ffd36b' },
  red: { sky: ['#d3122f', '#7d0a19'], far: '#5a0710', near: '#3a0508', ground: '#2a0306', sil: '#0d0102', sun: '#f2e6d0', lit: '#f2e6d0' },
  redPale: { sky: ['#e8d9c0', '#c9a98a'], far: '#a2192b', near: '#6d0e18', ground: '#5a0b14', sil: '#140203', sun: '#b3131f', lit: '#fff' },
  grey: { sky: ['#9fb0bf', '#d7dee5'], far: '#6c7b88', near: '#4b5661', ground: '#565e66', sil: '#1c2228', sun: '#eef2f5', lit: '#f2e7b8' },
  greyNight: { sky: ['#1d2833', '#4a5866'], far: '#2e3a46', near: '#1a222b', ground: '#2a3138', sil: '#0b0f13', sun: '#cfd8e0', lit: '#f2d58a' },
  vice: { sky: ['#ff5fa2', '#ffb86b'], far: '#9c2f8a', near: '#2a9d9f', ground: '#ffd1a1', sil: '#2b0b33', sun: '#fff0a6', lit: '#7ff0ff' },
  sa: { sky: ['#f39c3a', '#f7d27a'], far: '#7c5a2a', near: '#2f6b2f', ground: '#6b4e2e', sil: '#1c1408', sun: '#fff1b0', lit: '#fff' },
  lc: { sky: ['#30425e', '#8094ab'], far: '#3c4a5c', near: '#24303d', ground: '#3a414a', sil: '#0b1016', sun: '#dfe6ee', lit: '#f6d27c' },
}

// ---------- covers ----------
function gtaV() {
  const g = grid('#0b0b0b', [
    ['heli', 6, 6, 198, 128, P.day], ['palms', 210, 6, 200, 128, P.dusk],
    ['person', 6, 140, 128, 150, P.smog], ['skyline', 140, 140, 136, 150, P.dusk], ['bike', 282, 140, 128, 150, P.teal],
    ['car', 6, 404, 132, 104, P.smog], ['vinewood', 144, 404, 128, 104, P.day], ['plane', 278, 404, 132, 104, P.dusk],
  ], 'v')
  const logo = `<rect x="6" y="296" width="404" height="102" fill="#0b0b0b"/>${gtaWordmark(36, 330, 34)}`
    + `<g transform="translate(262 300)"><path d="M0 0H44L64 66L84 0H128L86 96H42Z" fill="url(#money)" stroke="#000" stroke-width="5" stroke-linejoin="round"/></g>`
  const defs = g.defs + `<linearGradient id="money" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#9ed36a"/><stop offset=".5" stop-color="#4d9a33"/><stop offset="1" stop-color="#2d6a1f"/></linearGradient>`
  return svg(defs, g.body + logo, 'Grand Theft Auto V cover art')
}
function rdr2() {
  const g = grid('#0a0a0a', [
    ['bust', 6, 6, 404, 236, P.redPale],
    ['rider', 6, 248, 132, 120, P.red], ['train', 144, 248, 128, 120, P.red], ['camp', 278, 248, 132, 120, P.red],
  ], 'r')
  const logo = `<rect x="6" y="374" width="404" height="134" fill="#0a0a0a"/>${txt(208, 424, 44, '#f2ebe0', 'RED DEAD', 'text-anchor="middle" letter-spacing="2"')}${txt(208, 462, 30, '#f2ebe0', 'REDEMPTION', 'text-anchor="middle" letter-spacing="3"')}${txt(208, 500, 34, '#d3122f', 'II', 'text-anchor="middle"')}`
  return svg(g.defs, g.body + logo, 'Red Dead Redemption 2 cover art')
}
function rdr() {
  const r = rng('rdr')
  const defs = grad('s', ['#f9d27a', '#f08a2f', '#b8401f'])
  const body = `<rect width="${W}" height="${H}" fill="url(#s)"/><circle cx="300" cy="190" r="70" fill="#fff0b8" opacity=".85"/>${mesa(10, 392, 170, 90, '#8a3a1c')}${mesa(250, 392, 160, 60, '#7a3218')}<rect y="390" width="${W}" height="124" fill="#4a1d0e"/>${at(64, 412, 0.9, SIL.cactus('#2a0f06'))}${at(212, 352, 2.6, SIL.cowboy('#1c0a04'))}<path d="M296 318L360 210L368 214L306 322Z" fill="#1c0a04"/>${ridge(0, 514, W, 30, r, '#2a0f06', 9)}`
    + `<rect y="430" width="${W}" height="84" fill="#120603" opacity=".55"/>${txt(208, 470, 40, '#b81d24', 'RED DEAD', `text-anchor="middle" letter-spacing="2" ${outlined('#120603', 4)}`)}${txt(208, 500, 26, '#f2e6c8', 'REDEMPTION', 'text-anchor="middle" letter-spacing="4"')}`
  return svg(defs, body, 'Red Dead Redemption cover art')
}
function rdo() {
  const r = rng('rdo')
  const defs = grad('s', ['#2a0d0a', '#8c1d14', '#e0753a'])
  const body = `<rect width="${W}" height="${H}" fill="url(#s)"/>${ridge(0, 380, W, 120, r, '#3a0f0a', 6, 0.6)}<rect y="378" width="${W}" height="136" fill="#1c0604"/>${[[90, 0.9], [170, 1.1], [250, 1.25], [330, 1]].map(([x, s], i) => at(x, 386 + i * 3, s, SIL.rider('#0b0202'), i % 2 === 1)).join('')}`
    + `${txt(208, 90, 46, '#f2ebe0', 'RED DEAD', 'text-anchor="middle" letter-spacing="2"')}${txt(208, 136, 40, '#d3122f', 'ONLINE', 'text-anchor="middle" letter-spacing="6"')}${txt(208, 480, 14, '#f2ebe0', 'STANDALONE · PC', 'text-anchor="middle" letter-spacing="4" font-family="Arial, sans-serif" font-weight="700"')}`
  return svg(defs, body, 'Red Dead Online cover art')
}
function trilogy(definitive) {
  const panels = definitive
    ? [['skyline', 0, 120, W, 130, P.lc], ['palms', 0, 252, W, 130, P.vice], ['person', 0, 384, W, 130, P.sa]]
    : [['skyline', 6, 132, 132, 376, P.greyNight], ['palms', 142, 132, 132, 376, P.vice], ['person', 278, 132, 132, 376, P.sa]]
  const g = grid(definitive ? '#111' : '#000', panels, definitive ? 'd' : 't')
  const head = definitive
    ? `<rect width="${W}" height="118" fill="#111"/>${txt(208, 46, 30, '#fff', 'grand theft auto', `text-anchor="middle" ${outlined('#000', 5)}`)}${txt(208, 82, 26, '#fcaf17', 'THE TRILOGY', 'text-anchor="middle" letter-spacing="6"')}${txt(208, 106, 13, '#fff', 'THE DEFINITIVE EDITION', 'text-anchor="middle" letter-spacing="5" font-family="Arial, sans-serif" font-weight="700"')}`
      + [['III', 160], ['VICE CITY', 292], ['SAN ANDREAS', 424]].map(([t, y]) => txt(22, y, 22, '#fff', t, `${outlined('#000', 5)}`)).join('')
    : `<rect width="${W}" height="128" fill="#000"/>${gtaWordmark(24, 46, 34)}${txt(392, 112, 30, '#fff', 'THE TRILOGY', 'text-anchor="end" letter-spacing="2"')}`
      + [['III', 72], ['VICE CITY', 208], ['SAN ANDREAS', 344]].map(([t, x]) => txt(x, 494, t.length > 3 ? 13 : 30, '#fff', t, `text-anchor="middle" ${outlined('#000', 4)}`)).join('')
  return svg(g.defs, g.body + head, `Grand Theft Auto: The Trilogy${definitive ? ' – The Definitive Edition' : ''} cover art`)
}
function gtaIV() {
  const g = grid('#e9e6df', [
    ['skyline', 8, 8, 196, 140, P.lc], ['person', 212, 8, 196, 140, P.grey],
    ['car', 8, 156, 128, 128, P.greyNight], ['heli', 144, 156, 128, 128, P.grey], ['bust', 280, 156, 128, 128, P.grey],
    ['skyline', 8, 418, 200, 88, P.greyNight], ['bike', 216, 418, 192, 88, P.lc],
  ], 'f')
  const logo = `<rect x="8" y="292" width="400" height="118" fill="#e9e6df"/>${gtaWordmark(30, 326, 32, '#fff', '#111')}<text x="258" y="400" font-size="112" fill="#111" ${HEAVY} letter-spacing="-6">IV</text>`
  return svg(g.defs, g.body + logo, 'Grand Theft Auto IV cover art')
}
function sanAndreas() {
  const g = grid('#f4f1ea', [
    ['person', 8, 8, 196, 150, P.sa], ['palms', 212, 8, 196, 150, P.dusk],
    ['bike', 8, 166, 128, 128, P.smog], ['skyline', 144, 166, 128, 128, P.sa], ['car', 280, 166, 128, 128, P.teal],
    ['plane', 8, 420, 196, 86, P.day], ['heli', 212, 420, 196, 86, P.sa],
  ], 's')
  const logo = `<rect x="8" y="302" width="400" height="110" fill="#f4f1ea"/>${gtaWordmark(28, 334, 30, '#fff', '#111')}${txt(400, 400, 34, '#fcaf17', 'San Andreas', `text-anchor="end" ${SERIF} font-style="italic" ${outlined('#111', 5)}`)}`
  return svg(g.defs, g.body + logo, 'Grand Theft Auto: San Andreas cover art')
}
function laNoire(vr) {
  const r = rng(vr ? 'lavr' : 'la')
  const defs = grad('s', vr ? ['#06121f', '#163a5c', '#2d6d99'] : ['#0b0b0b', '#2b2b2b', '#5a5a5a'])
  const rain = Array.from({ length: 70 }, () => { const x = r() * W, y = r() * H; return `<line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${(x - 6).toFixed(1)}" y2="${(y + 22).toFixed(1)}" stroke="#fff" stroke-opacity=".18" stroke-width="1.2"/>` }).join('')
  const body = `<rect width="${W}" height="${H}" fill="url(#s)"/>${skyline(-10, 420, W + 20, 200, r, vr ? '#0c2236' : '#1a1a1a', vr ? '#8fd3ff' : '#e8d9a8')}<rect y="418" width="${W}" height="96" fill="#0a0a0a"/>${at(208, 300, 2.3, SIL.fedora('#050505'))}${rain}`
    + `${txt(208, 84, 64, '#f2f2f2', 'L.A.', `text-anchor="middle" ${SERIF} letter-spacing="6"`)}${txt(208, 140, 52, '#c4161c', 'NOIRE', `text-anchor="middle" ${SERIF} letter-spacing="10"`)}${vr ? txt(208, 486, 22, '#8fd3ff', 'THE VR CASE FILES', 'text-anchor="middle" letter-spacing="3"') : `<rect x="148" y="470" width="120" height="2" fill="#c4161c"/>`}`
  return svg(defs, body, `L.A. Noire${vr ? ': The VR Case Files' : ''} cover art`)
}
function bully() {
  const lines = Array.from({ length: 24 }, (_, i) => `<line x1="0" x2="${W}" y1="${40 + i * 20}" y2="${40 + i * 20}" stroke="#7fb3d9" stroke-width="1.4"/>`).join('')
  const body = `<rect width="${W}" height="${H}" fill="#fbf7e9"/>${lines}<line x1="62" x2="62" y1="0" y2="${H}" stroke="#e05a5a" stroke-width="2"/>${[90, 250, 410].map(y => `<circle cx="28" cy="${y}" r="10" fill="#d8d2bf"/>`).join('')}`
    + `<g transform="rotate(-6 208 150)">${txt(208, 170, 112, '#c8102e', 'BULLY', `text-anchor="middle" ${outlined('#1a1a1a', 10)} letter-spacing="2"`)}</g>`
    + `<g transform="translate(250 290) scale(.8)" fill="none" stroke="#5a3a1a" stroke-width="13" stroke-linecap="round"><path d="M0 150V60L-40 0 M0 60L40 0"/></g><path d="M218 290Q250 338 282 290" fill="none" stroke="#8a6a4a" stroke-width="4"/><circle cx="250" cy="330" r="9" fill="#555"/>`
    + `<g transform="rotate(-4 208 470)"><rect x="78" y="448" width="260" height="42" rx="4" fill="#fbf7e9" stroke="#1d4f91" stroke-width="3"/>${txt(208, 477, 19, '#1d4f91', 'SCHOLARSHIP EDITION', 'text-anchor="middle"')}</g>`
    + txt(110, 250, 22, '#1a1a1a', 'Bullworth Academy', `${SERIF} font-style="italic" opacity=".75"`)
  return svg('', body, 'Bully: Scholarship Edition cover art')
}
function maxPayne3() {
  const r = rng('mp3')
  const splat = Array.from({ length: 14 }, () => `<circle cx="${(260 + r() * 140).toFixed(1)}" cy="${(120 + r() * 240).toFixed(1)}" r="${(3 + r() * 14).toFixed(1)}" fill="#a30f14" opacity=".8"/>`).join('')
  const defs = grad('s', ['#d9d9d6', '#8d8d8a', '#2a2a2a'])
  const body = `<rect width="${W}" height="${H}" fill="url(#s)"/>${skyline(0, 420, W, 140, r, '#3a3a3a')}${at(190, 270, 2.6, SIL.bald('#111'))}${splat}<rect y="410" width="${W}" height="104" fill="#111"/>`
    + `${txt(26, 474, 44, '#f2f2f2', 'MAX PAYNE')}${txt(336, 490, 88, '#c4161c', '3')}`
  return svg(defs, body, 'Max Payne 3 cover art')
}

const COVERS = { 'gta-v': gtaV, 'red-dead-redemption-2': rdr2, 'red-dead-redemption': rdr, 'red-dead-online': rdo, 'gta-trilogy-de': () => trilogy(true), 'gta-trilogy': () => trilogy(false), 'gta-iv': gtaIV, 'gta-san-andreas': sanAndreas, 'la-noire': () => laNoire(false), 'la-noire-vr': () => laNoire(true), bully, 'max-payne-3': maxPayne3 }

// ---------- 16:9 scenes ----------
const SW = 1280, SH = 720
const SCENES = {
  'gta-v': [['skyline', P.dusk], ['vinewood', P.day], ['beach', P.dusk]],
  'gta-san-andreas': [['palms', P.sa], ['car', P.smog], ['skyline', P.sa]],
  'gta-iv': [['skyline', P.lc], ['car', P.greyNight], ['heli', P.grey]],
  'gta-trilogy-de': [['skyline', P.lc], ['palms', P.vice], ['bike', P.sa]],
  'gta-trilogy': [['skyline', P.greyNight], ['beach', P.vice], ['car', P.sa]],
  'red-dead-redemption-2': [['pines', { ...P.day, sky: ['#8fb7d6', '#e8eef2'], far: '#9fb2c4', sil: '#22331f' }], ['rider', P.dusk], ['train', { ...P.smog, sky: ['#c9a477', '#f1dcb3'] }]],
  'red-dead-online': [['rider', P.red], ['camp', P.night], ['pines', P.dusk]],
  'red-dead-redemption': [['cactus', P.smog], ['rider', P.dusk], ['camp', P.night]],
  'la-noire': [['skyline', P.greyNight], ['fedora', P.grey], ['car', { ...P.greyNight, sil: '#000' }]],
  'la-noire-vr': [['skyline', P.night], ['fedora', { ...P.night, sky: ['#163a5c', '#2d6d99'] }], ['car', P.night]],
  bully: [['tree', { ...P.day, near: '#6a9a3a' }], ['bike', { ...P.day, ground: '#7a7a72' }], ['ferris', P.night]],
  'max-payne-3': [['skyline', P.smog], ['heli', P.dusk], ['skyline', P.night]],
}
function scene(p, view) {
  const list = SCENES[p.id], [kind, pal] = list[(view - 1) % list.length], r = rng(`${p.id}-${view}`)
  if (kind === 'tree' || kind === 'ferris') {
    // Bully: Bullworth Academy (brick school and clock tower) and the carnival at night.
    const defs = grad('sky', pal.sky)
    let body = `<rect width="${SW}" height="${SH}" fill="url(#sky)"/>`
    if (kind === 'tree') body += `<rect y="520" width="${SW}" height="200" fill="${pal.near}"/><rect x="380" y="260" width="520" height="270" fill="#8a3b2a"/><path d="M360 262L640 150L920 262Z" fill="#4a2a22"/><rect x="590" y="90" width="100" height="180" fill="#9a4632"/><path d="M580 92L640 30L700 92Z" fill="#4a2a22"/><circle cx="640" cy="150" r="30" fill="#f4efe0" stroke="#3a2a22" stroke-width="5"/><path d="M640 150V130M640 150L656 158" stroke="#222" stroke-width="4"/>${Array.from({ length: 16 }, (_, i) => `<rect x="${410 + (i % 8) * 60}" y="${300 + Math.floor(i / 8) * 100}" width="34" height="56" fill="#f2e2b0" stroke="#3a2a22" stroke-width="3"/>`).join('')}<rect x="610" y="430" width="60" height="100" fill="#3a2a22"/>${[120, 260, 1020, 1170].map((x, i) => at(x, 560, 2.4 + (i % 2) * 0.6, SIL.tree(i % 2 ? '#c46a1e' : '#3e6b2a'))).join('')}${at(800, 600, 1.3, SIL.person('#1d2833'))}`
    else body += `${Array.from({ length: 60 }, () => `<circle cx="${(r() * SW).toFixed(0)}" cy="${(r() * 360).toFixed(0)}" r="${(1 + r() * 1.5).toFixed(1)}" fill="#fff" opacity=".7"/>`).join('')}<rect y="600" width="${SW}" height="120" fill="#141a2c"/>${at(820, 610, 3.6, SIL.ferris('#ffd36b'))}${[200, 420].map(x => `<path d="M${x - 90} 610L${x} 470L${x + 90} 610Z" fill="#c8102e"/><path d="M${x - 30} 610L${x} 470L${x + 30} 610Z" fill="#f4efe0"/>`).join('')}${at(560, 640, 1.4, SIL.person('#05070f'))}${at(620, 640, 1.2, SIL.person('#05070f'))}`
    return svg(defs, body, `${p.title} screenshot`, SW, SH)
  }
  const sc = panelScene(kind, 0, 0, SW, SH, pal, `s${view}`)
  // Depth: a second, farther skyline or ridge for the big scenes, and a soft vignette.
  const vignette = `<radialGradient id="vg" cx=".5" cy=".5" r=".75"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".45"/></radialGradient>`
  return svg(sc.defs + vignette, sc.body + `<rect width="${SW}" height="${SH}" fill="url(#vg)"/>`, `${p.title} screenshot`, SW, SH)
}

export const hasGameArt = p => Object.hasOwn(COVERS, p?.id)
// view 0: box art; views 1-3: in-game scenes.
export function gameArtSvg(p, view = 0) {
  if (!hasGameArt(p)) return null
  return view === 0 ? COVERS[p.id]() : scene(p, view)
}
