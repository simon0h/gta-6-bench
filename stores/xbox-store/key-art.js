// Store-drawn key art for the everyday digital assortment (games, add-ons, bundles and in-game currency).
// xbox.com tiles show full-bleed box art: a scene for the genre with the title set large over it. No real
// artwork or logos are used; every picture is an original illustration built from the product's own data.
// View 0 is the cover (scene + title); views 1-3 are title-free scenes for the product page gallery.

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
function seedOf(s) { let h = 2166136261; for (const c of String(s)) h = Math.imul(h ^ c.codePointAt(0), 16777619) >>> 0; return h }
function rngOf(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296 } }
const r1 = n => Math.round(n * 10) / 10

// [sky top, sky horizon, glow, far, mid, near, accent]
const PALETTES = {
  shooter: [['#0d1b24', '#c2541c', '#ffb35c', '#2a2f36', '#1a1d22', '#0b0c0e', '#ff7a1a'], ['#08131f', '#2f6f8f', '#9fe8ff', '#1d2c38', '#131d26', '#070b10', '#46d0ff'], ['#140c06', '#8f6a2a', '#ffe08a', '#33291a', '#211a10', '#0c0905', '#ffc23a']],
  action: [['#1b1030', '#e0763a', '#ffd28a', '#3b2a4a', '#24182f', '#0e0a14', '#ffcc66'], ['#071a1f', '#2d8a7a', '#c8fff0', '#16343a', '#0f2428', '#061012', '#5fffd1'], ['#200a0a', '#b8452a', '#ffcf9a', '#3e1d16', '#26110d', '#0f0605', '#ff9a4a']],
  horror: [['#050607', '#2b0d10', '#ff5a4a', '#15181a', '#0d0f10', '#050505', '#d8261f'], ['#04070a', '#1d2b33', '#cfe7ff', '#12191d', '#0b1013', '#040607', '#9bc7e6']],
  racing: [['#1a0f3a', '#ff5e7e', '#ffd36b', '#3a1f5c', '#20123a', '#0b0718', '#33e1ff'], ['#071b33', '#ff9a3c', '#fff0b3', '#1d3350', '#132238', '#070d18', '#ffcf3a']],
  flying: [['#3f8fd6', '#cfe9fb', '#fffbe6', '#8db7d6', '#6f9cc0', '#4d7ea6', '#ffffff']],
  sports: [['#06142b', '#1f4f8a', '#eaf4ff', '#0b1f3d', '#1c6b33', '#0f4a22', '#ffffff'], ['#120a24', '#5a2a8a', '#f4e8ff', '#1c1238', '#1f6e3a', '#114d26', '#ffd84a']],
  rpg: [['#0b1230', '#3d5a8a', '#e6efff', '#1b2547', '#121935', '#070a18', '#9fd3ff'], ['#1a0f08', '#a0622a', '#ffe1a8', '#3a2414', '#24170c', '#0d0805', '#ffb84a'], ['#0d0618', '#5a2a7a', '#f0d0ff', '#25123a', '#170b26', '#08040e', '#d68cff']],
  family: [['#4fc3f7', '#c9f1ff', '#fff3b0', '#8ad98f', '#5cbf63', '#3a9a45', '#ff5fa2'], ['#7e6cf2', '#ffc6e7', '#fff6c9', '#ffb36b', '#ff8f5a', '#e86a4a', '#3ad6ff']],
  survival: [['#0e1a14', '#3b5b3f', '#ffb14a', '#1b2b20', '#121d16', '#070d09', '#ff8a2a'], ['#0a1420', '#3a5d7a', '#e8f4ff', '#203242', '#16242f', '#0a1117', '#ffd27a']],
  simulation: [['#6fb7ec', '#e4f4ff', '#fffbe0', '#9cc98a', '#79ad66', '#55894a', '#ffffff']],
  fighting: [['#1a0008', '#8a0f2a', '#ffcf4a', '#3a0a18', '#220510', '#0c0206', '#ff3b3b'], ['#060a1f', '#2a2a8a', '#9ee8ff', '#151a40', '#0d1029', '#05060f', '#5ad1ff']],
  strategy: [['#2a2412', '#8a7444', '#ffe2a0', '#4d4428', '#3a331d', '#1d1a0e', '#d4af37'], ['#0f1c22', '#4a7380', '#e6f6ff', '#23383f', '#182a30', '#0b1418', '#7fd6e8']],
  scifi: [['#03050f', '#1b2a5a', '#bfe3ff', '#16203f', '#0e152b', '#05070f', '#4fd8ff'], ['#0a0414', '#4a1f6a', '#ffd0f5', '#24123a', '#170b26', '#06030b', '#ff6ad5'], ['#02090a', '#0f4a4a', '#c8fff6', '#103033', '#0a2023', '#030909', '#3dffcf']],
  puzzle: [['#ffd6e6', '#fff3e0', '#ffffff', '#f7a8c4', '#ffcf7a', '#8ccaf2', '#6b4cff']],
}
function themeOf(p) {
  const t = `${p.title} ${p.keywords || ''}`.toLowerCase()
  if (/resident evil|dead space|alan wake|silent hill|little nightmares|dead by daylight|plague tale|lies of p|horror/.test(t)) return 'horror'
  if (/flight|plane|ace combat/.test(t)) return 'flying'
  if (/halo|destiny|warframe|starfield|mass effect|outer worlds|no man|helldivers|space marine|deep rock|star wars|stellar|dead space|borderlands|subnautica|the finals|overwatch|cyberpunk/.test(t)) return t.includes('dead space') ? 'horror' : 'scifi'
  if (/\bufc\b|\bwwe\b/.test(t)) return 'fighting'
  return { 'Shooter': 'shooter', 'Action & adventure': 'action', 'Racing & flying': 'racing', 'Sports': 'sports', 'Role playing': 'rpg', 'Family & kids': 'family', 'Platformer': 'family', 'Survival': 'survival', 'Simulation': 'simulation', 'Fighting': 'fighting', 'Strategy': 'strategy', 'Puzzle & trivia': 'puzzle' }[p.genre] || 'action'
}

// ---- scenery ----
function ridge(rng, y, amp, color, step = 40, jag = 1) {
  let d = `M0 720 L0 ${r1(y)}`
  for (let x = 0; x <= 720; x += step) d += ` L${x} ${r1(y - rng() * amp * jag - (x % (step * 2) ? amp * 0.3 : 0))}`
  return `<path d="${d} L720 720Z" fill="${color}"/>`
}
function hills(rng, y, amp, color) {
  let d = `M0 720 L0 ${r1(y)}`, x = 0
  while (x < 720) { const w = 140 + rng() * 160; d += ` Q${r1(x + w / 2)} ${r1(y - amp - rng() * amp)} ${r1(x + w)} ${r1(y + rng() * 10)}`; x += w }
  return `<path d="${d} L720 720Z" fill="${color}"/>`
}
function skyline(rng, y, color, windows) {
  let s = '', x = -10
  while (x < 730) {
    const w = 34 + rng() * 60, h = 60 + rng() * 210
    s += `<rect x="${r1(x)}" y="${r1(y - h)}" width="${r1(w)}" height="${r1(h + 400)}" fill="${color}"/>`
    if (windows) for (let wy = y - h + 12; wy < y - 10; wy += 16) for (let wx = x + 6; wx < x + w - 8; wx += 12) if (rng() < 0.22) s += `<rect x="${r1(wx)}" y="${r1(wy)}" width="5" height="7" fill="${windows}" opacity=".7"/>`
    if (rng() < 0.25) s += `<rect x="${r1(x + w / 2 - 1.5)}" y="${r1(y - h - 30)}" width="3" height="30" fill="${color}"/>`
    x += w + rng() * 6
  }
  return s
}
function pines(rng, y, color, n, scale = 1) {
  let s = ''
  for (let i = 0; i < n; i++) {
    const x = rng() * 760 - 20, h = (70 + rng() * 120) * scale, w = h * 0.38, b = y + rng() * 30
    s += `<path d="M${r1(x)} ${r1(b - h)} L${r1(x + w / 2)} ${r1(b - h * 0.55)} L${r1(x + w / 4)} ${r1(b - h * 0.55)} L${r1(x + w * 0.65)} ${r1(b - h * 0.2)} L${r1(x + w * 0.1)} ${r1(b - h * 0.2)} L${r1(x + w * 0.1)} ${r1(b)} L${r1(x - w * 0.1)} ${r1(b)} L${r1(x - w * 0.1)} ${r1(b - h * 0.2)} L${r1(x - w * 0.65)} ${r1(b - h * 0.2)} L${r1(x - w / 4)} ${r1(b - h * 0.55)} L${r1(x - w / 2)} ${r1(b - h * 0.55)}Z" fill="${color}"/>`
  }
  return s
}
const glowDisc = (x, y, r, color, id) => `<circle cx="${x}" cy="${y}" r="${r * 3.2}" fill="url(#${id})"/><circle cx="${x}" cy="${y}" r="${r}" fill="${color}" opacity=".95"/>`
function soldier(x, y, s, c, accent) {
  return `<g transform="translate(${x} ${y}) scale(${s})" fill="${c}"><path d="M-14 -150 q14 -22 30 -4 l4 14 l-36 0z"/><circle cx="0" cy="-130" r="15"/><path d="M-30 -112 h58 l10 70 h-22 l-4 50 l14 92 h-26 l-12 -80 l-12 80 h-26 l14 -92 l-6 -50 h-18z"/><path d="M14 -98 l92 -24 l3 9 l-92 26z"/><path d="M-26 -100 l40 -6 l4 12 l-40 8z"/><circle cx="4" cy="-133" r="3" fill="${accent}"/></g>`
}
function hero(x, y, s, c) {
  return `<g transform="translate(${x} ${y}) scale(${s})" fill="${c}"><circle cx="0" cy="-150" r="14"/><path d="M-18 -134 h36 l6 62 h-14 l4 72 h-14 l-6 -60 l-6 60 h-14 l4 -72 h-14z"/><path d="M-16 -132 q-60 60 -40 140 q30 -40 52 -86z"/><path d="M18 -126 l46 -50 l5 4 l-44 52z"/></g>`
}
const cliff = (x, y, c) => `<path d="M${x - 140} 720 L${x - 120} ${y + 40} L${x - 60} ${y} L${x + 70} ${y + 6} L${x + 120} ${y + 60} L${x + 150} 720Z" fill="${c}"/>`
function car(x, y, s, c, accent) {
  return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-150 0 q4 -26 40 -32 l60 -8 q30 -30 80 -32 q50 0 84 30 l40 6 q36 6 40 36 z" fill="${c}"/><path d="M-36 -42 q26 -24 64 -24 q36 0 58 22z" fill="${accent}" opacity=".35"/><rect x="-150" y="-12" width="22" height="6" fill="${accent}"/><rect x="132" y="-12" width="18" height="6" fill="#ff3a3a"/><circle cx="-88" cy="2" r="22" fill="#08080a"/><circle cx="88" cy="2" r="22" fill="#08080a"/><circle cx="-88" cy="2" r="9" fill="#555"/><circle cx="88" cy="2" r="9" fill="#555"/></g>`
}
function road(c, line) {
  let s = `<path d="M300 430 L420 430 L760 720 L-40 720Z" fill="${c}"/>`
  for (let i = 0; i < 6; i++) { const t = i / 6, t2 = (i + 0.5) / 6, y1 = 430 + 290 * t * t, y2 = 430 + 290 * t2 * t2, w1 = 2 + 10 * t, w2 = 2 + 10 * t2; s += `<path d="M${360 - w1} ${r1(y1)} L${360 + w1} ${r1(y1)} L${360 + w2} ${r1(y2)} L${360 - w2} ${r1(y2)}Z" fill="${line}"/>` }
  return s
}
const plane = (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s}) rotate(-8)" fill="${c}"><path d="M-170 0 q0 -14 30 -16 l250 -6 q50 2 60 22 q-10 18 -60 20 l-250 -4 q-30 -2 -30 -16z"/><path d="M-20 -14 l-70 -110 h34 l110 110z"/><path d="M-20 14 l-60 90 h30 l100 -90z"/><path d="M-150 -12 l-30 -60 h22 l44 58z"/></g>`
function stadium(rng, pal) {
  let s = `<path d="M0 470 L720 470 L720 720 L0 720Z" fill="${pal[4]}"/><path d="M0 470 L720 470 L720 500 L0 500Z" fill="${pal[3]}"/>`
  for (let i = 0; i < 9; i++) s += `<path d="M${-200 + i * 140} 720 L${300 + i * 15} 470" stroke="${pal[5]}" stroke-width="18" opacity=".45"/>`
  s += `<path d="M0 560 L720 560" stroke="#fff" stroke-width="3" opacity=".55"/><ellipse cx="360" cy="600" rx="150" ry="40" fill="none" stroke="#fff" stroke-width="3" opacity=".5"/>`
  for (const x of [70, 650]) s += `<rect x="${x - 3}" y="250" width="6" height="220" fill="${pal[3]}"/><rect x="${x - 34}" y="236" width="68" height="26" rx="3" fill="${pal[2]}"/><circle cx="${x}" cy="249" r="120" fill="url(#lamp)"/>`
  for (let x = 0; x < 720; x += 6) s += `<circle cx="${x}" cy="${r1(455 + rng() * 12)}" r="${r1(1 + rng() * 1.6)}" fill="${pal[2]}" opacity="${r1(0.15 + rng() * 0.35)}"/>`
  return s
}
function ball(kind, x, y, r) {
  if (kind === 'football') return `<g transform="translate(${x} ${y}) rotate(-28)"><ellipse rx="${r * 1.6}" ry="${r}" fill="#7a3b1c"/><path d="M${-r * 0.6} 0 H${r * 0.6}" stroke="#fff" stroke-width="5"/>${[-0.4, -0.2, 0, 0.2, 0.4].map(t => `<path d="M${r * t} -8 V8" stroke="#fff" stroke-width="4"/>`).join('')}</g>`
  if (kind === 'basketball') return `<g transform="translate(${x} ${y})"><circle r="${r}" fill="#e2701f"/><path d="M${-r} 0 H${r} M0 ${-r} V${r} M${-r * 0.7} ${-r * 0.7} Q0 0 ${-r * 0.7} ${r * 0.7} M${r * 0.7} ${-r * 0.7} Q0 0 ${r * 0.7} ${r * 0.7}" stroke="#2a1205" stroke-width="4" fill="none"/></g>`
  if (kind === 'baseball') return `<g transform="translate(${x} ${y})"><circle r="${r}" fill="#f4f1ea"/><path d="M${-r * 0.55} ${-r * 0.8} Q${-r * 0.1} 0 ${-r * 0.55} ${r * 0.8} M${r * 0.55} ${-r * 0.8} Q${r * 0.1} 0 ${r * 0.55} ${r * 0.8}" stroke="#d22" stroke-width="4" fill="none" stroke-dasharray="6 5"/></g>`
  if (kind === 'golf') return `<g transform="translate(${x} ${y})"><path d="M0 ${r * 2.4} V${-r * 1.6}" stroke="#ddd" stroke-width="5"/><path d="M0 ${-r * 1.6} l${r * 1.4} ${r * 0.5} l${-r * 1.4} ${r * 0.5}z" fill="#ff3b3b"/><circle cx="${-r * 1.4}" cy="${r * 2.2}" r="${r * 0.35}" fill="#fff"/></g>`
  if (kind === 'tennis') return `<g transform="translate(${x} ${y})"><circle r="${r * 0.8}" fill="#d7f23a"/><path d="M${-r * 0.8} ${-r * 0.1} Q0 ${-r * 0.5} ${r * 0.8} ${-r * 0.1} M${-r * 0.8} ${r * 0.1} Q0 ${r * 0.5} ${r * 0.8} ${r * 0.1}" stroke="#fff" stroke-width="5" fill="none"/></g>`
  if (kind === 'skate') return `<g transform="translate(${x} ${y}) rotate(-18)"><rect x="${-r * 1.9}" y="-8" width="${r * 3.8}" height="16" rx="8" fill="#ffd84a"/><circle cx="${-r * 1.2}" cy="16" r="9" fill="#eee"/><circle cx="${r * 1.2}" cy="16" r="9" fill="#eee"/></g>`
  return `<g transform="translate(${x} ${y})"><circle r="${r}" fill="#fafafa"/><path d="M0 ${-r * 0.35} l${r * 0.33} ${r * 0.24} l${-r * 0.13} ${r * 0.4} h${-r * 0.4} l${-r * 0.13} ${-r * 0.4}z" fill="#111"/>${[0, 72, 144, 216, 288].map(a => `<path d="M0 ${-r * 0.35} V${-r}" stroke="#111" stroke-width="3" transform="rotate(${a})"/>`).join('')}</g>`
}
function castle(x, y, c) {
  let s = `<g fill="${c}"><rect x="${x - 120}" y="${y - 90}" width="240" height="200"/>`
  for (const [dx, h, w] of [[-130, 170, 50], [-40, 230, 60], [60, 190, 46], [128, 140, 40]]) {
    s += `<rect x="${x + dx - w / 2}" y="${y - h}" width="${w}" height="${h + 110}"/><path d="M${x + dx - w / 2 - 6} ${y - h} L${x + dx} ${y - h - w * 1.1} L${x + dx + w / 2 + 6} ${y - h}Z"/>`
  }
  for (let i = -110; i < 120; i += 22) s += `<rect x="${x + i}" y="${y - 104}" width="12" height="14"/>`
  return s + `</g>`
}
function mascot(x, y, r, body, accent) {
  return `<g transform="translate(${x} ${y})"><ellipse cx="0" cy="${r * 0.95}" rx="${r * 0.9}" ry="${r * 0.18}" fill="#000" opacity=".15"/><circle r="${r}" fill="${body}"/><circle cx="${-r * 0.32}" cy="${-r * 0.15}" r="${r * 0.22}" fill="#fff"/><circle cx="${r * 0.32}" cy="${-r * 0.15}" r="${r * 0.22}" fill="#fff"/><circle cx="${-r * 0.27}" cy="${-r * 0.12}" r="${r * 0.1}" fill="#1b1b2f"/><circle cx="${r * 0.37}" cy="${-r * 0.12}" r="${r * 0.1}" fill="#1b1b2f"/><path d="M${-r * 0.3} ${r * 0.3} Q0 ${r * 0.55} ${r * 0.3} ${r * 0.3}" stroke="#1b1b2f" stroke-width="${r * 0.07}" fill="none" stroke-linecap="round"/><path d="M${-r * 0.5} ${-r * 0.85} Q0 ${-r * 1.35} ${r * 0.5} ${-r * 0.85}" fill="${accent}"/></g>`
}
const campfire = (x, y, glowId) => `<circle cx="${x}" cy="${y - 20}" r="170" fill="url(#${glowId})"/><path d="M${x - 40} ${y} l80 -10 M${x - 40} ${y - 10} l80 10" stroke="#3a2210" stroke-width="12" stroke-linecap="round"/><path d="M${x} ${y - 90} q30 40 22 70 q-22 20 -44 0 q-8 -30 22 -70z" fill="#ffb02e"/><path d="M${x} ${y - 55} q14 22 10 38 q-10 10 -20 0 q-4 -18 10 -38z" fill="#fff2b0"/>`
function fighter(x, y, s, c, flip) {
  return `<g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})" fill="${c}"><circle cx="6" cy="-196" r="17"/><path d="M-14 -176 h36 l18 70 l-14 4 l-8 -24 l2 34 l30 92 h-22 l-30 -70 l-26 70 h-22 l22 -96 l-2 -64 l-36 30 l-10 -12z"/><path d="M22 -170 l58 -12 l4 14 l-58 14z"/></g>`
}
function hexmap(rng, pal) {
  let s = ''
  const R = 34, h = R * Math.sqrt(3)
  for (let row = 0; row < 9; row++) for (let col = 0; col < 13; col++) {
    const cx = col * R * 1.5, cy = 300 + row * h + (col % 2 ? h / 2 : 0)
    const k = rng(), fill = k < 0.18 ? pal[6] : k < 0.55 ? pal[4] : pal[3]
    s += `<path d="${[0, 1, 2, 3, 4, 5].map((i, j) => `${j ? 'L' : 'M'}${r1(cx + R * Math.cos(Math.PI / 3 * i))} ${r1(cy + R * Math.sin(Math.PI / 3 * i))}`).join(' ')}Z" fill="${fill}" stroke="${pal[5]}" stroke-width="2" opacity="${k < 0.18 ? 0.8 : 1}"/>`
  }
  return s + `<g fill="${pal[6]}"><path d="M200 420 v-90 l50 18 l-50 18" stroke="${pal[5]}" stroke-width="4"/><path d="M520 380 v-80 l46 16 l-46 16" stroke="${pal[5]}" stroke-width="4"/></g>`
}
function blocks(rng, pal) {
  let s = ''
  for (let i = 0; i < 16; i++) { const x = 40 + rng() * 600, y = 260 + rng() * 300, w = 50 + rng() * 80; s += `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(w * (0.6 + rng() * 0.5))}" rx="6" fill="${pal[3 + Math.floor(rng() * 4)]}" transform="rotate(${r1(rng() * 30 - 15)} ${r1(x)} ${r1(y)})" opacity=".9"/>` }
  return s
}
function stars(rng, n, color) { let s = ''; for (let i = 0; i < n; i++) s += `<circle cx="${r1(rng() * 720)}" cy="${r1(rng() * 380)}" r="${r1(0.6 + rng() * 1.6)}" fill="${color}" opacity="${r1(0.3 + rng() * 0.7)}"/>`; return s }
function clouds(rng, n, color, op = 0.8) { let s = ''; for (let i = 0; i < n; i++) { const x = rng() * 720, y = 60 + rng() * 260, w = 60 + rng() * 90; s += `<g fill="${color}" opacity="${op}"><ellipse cx="${r1(x)}" cy="${r1(y)}" rx="${r1(w)}" ry="${r1(w * 0.32)}"/><ellipse cx="${r1(x + w * 0.3)}" cy="${r1(y - w * 0.18)}" rx="${r1(w * 0.5)}" ry="${r1(w * 0.3)}"/></g>` } return s }

function sportOf(p) {
  const t = `${p.title} ${p.keywords || ''}`.toLowerCase()
  return /pga|golf/.test(t) ? 'golf' : /topspin|tennis/.test(t) ? 'tennis' : /nfl|madden|college football/.test(t) ? 'football' : /nba|basketball/.test(t) ? 'basketball' : /mlb|baseball/.test(t) ? 'baseball' : /skate|tony hawk|riders/.test(t) ? 'skate' : 'soccer'
}

function scene(p, theme, pal, rng, view) {
  const [, , glow, far, mid, near, accent] = pal
  // Glows sit below the title band (titles are set at the top on most themes).
  const sunX = 140 + rng() * 440, sunY = 290 + rng() * 50, alt = seedOf(p.id) % 3
  switch (theme) {
    case 'shooter': if (alt === 1) return glowDisc(sunX, sunY + 40, 60, glow, 'g') + ridge(rng, 470, 60, far, 70, 0.8) + `<g opacity=".5">${clouds(rng, 6, near, 0.6)}</g>` + ridge(rng, 600, 30, mid, 90, 0.6) + `<path d="M${r1(120 + rng() * 120)} 380 h120 m-60 0 v14 m-40 0 h90 l14 22 h-110z" stroke="${near}" stroke-width="5" fill="${near}"/>` + soldier(view % 2 ? 260 : 460, 690, 1.45, near, accent) + soldier(view % 2 ? 470 : 240, 700, 1.25, near, accent) + soldier(360, 650, 0.8, mid, accent)
      return glowDisc(sunX, sunY + 40, 46, glow, 'g') + skyline(rng, 470, far, null) + ridge(rng, 560, 50, mid, 60) + `<g opacity=".35">${clouds(rng, 4, '#000', 0.5)}</g>` + soldier(view % 2 ? 230 : 470, 690, 1.55, near, accent) + soldier(view % 2 ? 470 : 250, 640, 0.9, mid, accent)
    case 'horror': return glowDisc(sunX, sunY - 20, 52, glow, 'g') + stars(rng, 40, '#fff') + pines(rng, 520, far, 14, 1.4) + `<rect y="430" width="720" height="290" fill="${glow}" opacity=".08"/>` + pines(rng, 640, near, 10, 1.9) + hero(view % 2 ? 250 : 470, 640, 1.2, '#000')
    case 'racing': return glowDisc(360, 400, 70, glow, 'g') + ridge(rng, 430, 70, far, 50) + `<rect y="430" width="720" height="290" fill="${mid}"/>` + road(near, accent) + Array.from({ length: 10 }, () => `<path d="M${r1(rng() * 720)} ${r1(470 + rng() * 200)} h${r1(80 + rng() * 140)}" stroke="${accent}" stroke-width="2" opacity=".5"/>`).join('') + car(360, 640, 1.25, ['#d6203a', '#f2f2f5', '#f5b700', '#1f6fe0'][seedOf(p.id) % 4], accent)
    case 'flying': return glowDisc(sunX, 150, 50, glow, 'g') + clouds(rng, 6, '#fff', 0.9) + hills(rng, 600, 40, mid) + hills(rng, 650, 30, near) + plane(view % 2 ? 300 : 400, 330, 1.25, '#f6f8fb') + `<path d="M${view % 2 ? 120 : 220} 360 q-200 20 -260 60" stroke="#fff" stroke-width="6" opacity=".6" fill="none"/>`
    case 'sports': return stars(rng, 30, '#fff') + stadium(rng, pal) + ball(sportOf(p), view % 2 ? 470 : 360, 360, 70)
    case 'rpg': return stars(rng, 70, '#fff') + glowDisc(sunX, sunY - 30, 44, glow, 'g') + ridge(rng, 430, 120, far, 45, 1.3) + castle(view % 2 ? 230 : 480, 520, mid) + ridge(rng, 610, 40, near, 70) + hero(view % 2 ? 520 : 200, 640, 1.1, near) + `<rect y="420" width="720" height="120" fill="${glow}" opacity=".07"/>`
    case 'family': return glowDisc(sunX, sunY - 40, 50, glow, 'g') + clouds(rng, 5, '#fff', 0.95) + hills(rng, 520, 60, far) + hills(rng, 600, 50, mid) + hills(rng, 670, 30, near) + Array.from({ length: 6 }, () => `<path d="M0 -14 L4 -4 L14 -4 L6 3 L9 14 L0 7 L-9 14 L-6 3 L-14 -4 L-4 -4Z" fill="#ffd84a" transform="translate(${r1(rng() * 700)} ${r1(100 + rng() * 300)}) scale(${r1(0.8 + rng())})"/>`).join('') + mascot(view % 2 ? 250 : 400, 520, 78, accent, pal[3])
    case 'survival': return stars(rng, 60, '#fff') + glowDisc(sunX, sunY - 20, 40, glow, 'g2') + pines(rng, 470, far, 18, 1.1) + ridge(rng, 560, 30, mid, 80) + pines(rng, 660, near, 9, 1.9) + campfire(view % 2 ? 260 : 420, 640, 'fire')
    case 'simulation': return glowDisc(sunX, 140, 50, glow, 'g') + clouds(rng, 5, '#fff', 0.95) + hills(rng, 540, 50, far) + `<path d="M0 560 Q360 500 720 560 V720 H0Z" fill="${mid}"/>` + Array.from({ length: 9 }, (_, i) => `<path d="M${-60 + i * 90} 720 Q${300 + i * 15} 590 ${360 + i * 4} 560" stroke="${near}" stroke-width="7" fill="none" opacity=".6"/>`).join('') + `<g transform="translate(${view % 2 ? 520 : 180} 520)"><rect x="-60" y="-50" width="120" height="70" fill="#b8352b"/><path d="M-72 -50 L0 -100 L72 -50Z" fill="#7a2420"/><rect x="-16" y="-20" width="32" height="40" fill="#f4e6c8"/></g>`
    case 'fighting': return `<g opacity=".5">${Array.from({ length: 18 }, (_, i) => `<path d="M360 380 L${r1(360 + 900 * Math.cos(i * 0.35))} ${r1(380 + 900 * Math.sin(i * 0.35))} L${r1(360 + 900 * Math.cos(i * 0.35 + 0.12))} ${r1(380 + 900 * Math.sin(i * 0.35 + 0.12))}Z" fill="${far}"/>`).join('')}</g>` + glowDisc(360, 380, 40, glow, 'g') + `<rect y="560" width="720" height="160" fill="${near}"/>` + fighter(230, 640, 1.35, '#050206', false) + fighter(490, 640, 1.35, '#050206', true)
    case 'strategy': return glowDisc(sunX, 120, 40, glow, 'g') + `<rect y="250" width="720" height="470" fill="${mid}"/>` + hexmap(rng, pal)
    case 'scifi': {
      const px = alt === 2 ? 520 : 200, planet = `<circle cx="${px}" cy="${alt === 0 ? 900 : 420}" r="${alt === 0 ? 520 : 150}" fill="${mid}"/><circle cx="${px}" cy="${alt === 0 ? 900 : 420}" r="${alt === 0 ? 520 : 150}" fill="none" stroke="${glow}" stroke-width="3" opacity=".6"/>`
      const ring = alt === 0 ? '' : `<ellipse cx="${px}" cy="420" rx="250" ry="38" fill="none" stroke="${accent}" stroke-width="5" opacity=".55" transform="rotate(-14 ${px} 420)"/>`
      const ship = `<g transform="translate(${alt === 2 ? 190 : 520} ${alt === 0 ? 330 : 300}) rotate(-12)" fill="${near}"><path d="M-90 0 l60 -16 h80 l40 16 l-40 16 h-80z"/><path d="M-30 -14 l-30 -36 h20 l40 36z M-30 14 l-30 36 h20 l40 -36z"/><circle cx="-96" cy="0" r="7" fill="${accent}"/></g>`
      return stars(rng, 120, '#fff') + planet + ring + ship + ridge(rng, 640, 40, near, 50, 0.7) + soldier(view % 2 ? 470 : 250, 700, 1.3, near, accent)
    }
    case 'puzzle': return clouds(rng, 3, '#fff', 0.8) + blocks(rng, pal)
    default: return glowDisc(sunX, sunY, 50, glow, 'g') + ridge(rng, 470, 110, far, 45, 1.2) + ridge(rng, 560, 60, mid, 60) + cliff(view % 2 ? 230 : 470, 560, near) + hero(view % 2 ? 230 : 470, 566, 1.05, near) + Array.from({ length: 5 }, () => `<path d="M0 0 q8 -8 16 0 q8 -8 16 0" stroke="${near}" stroke-width="3" fill="none" transform="translate(${r1(rng() * 600 + 40)} ${r1(120 + rng() * 160)})"/>`).join('')
  }
}

// ---- title typography ----
function wrap(text, max) {
  const lines = []
  for (const w of text.split(/\s+/).filter(Boolean)) {
    const last = lines.length ? lines[lines.length - 1] : null
    if (last !== null && `${last} ${w}`.length <= max) lines[lines.length - 1] = `${last} ${w}`
    else lines.push(w)
  }
  return lines
}
function splitTitle(p) {
  if (p.productType === 'currency') {
    // The pack size: the number that matches the quantity, else the largest number in the title (not "FC 26").
    const nums = [...p.title.matchAll(/\d[\d,]*/g)], val = x => Number(x[0].replace(/,/g, ''))
    const m = nums.find(x => val(x) === p.quantity) || nums.filter(x => val(x) >= 100).sort((a, b) => val(b) - val(a))[0]
    if (m) {
      const after = p.title.slice(m.index + m[0].length).replace(/\bfor Xbox\b/i, '').trim(), before = p.title.slice(0, m.index).replace(/[\s:–-]+$/, '').trim()
      return { main: m[0].includes(',') || m[0].length < 4 ? m[0] : Number(m[0]).toLocaleString('en-US'), sub: after || before, kicker: after ? before : '' }
    }
  }
  const m = /^(.*?)(?::\s+|\s+[–-]\s+)(.+)$/.exec(p.title)
  if (m && m[1].length >= 3) return { main: m[1], sub: m[2] }
  return { main: p.title, sub: '' }
}
const FONT = `'Bahnschrift','Segoe UI','Inter Display','Helvetica Neue',Arial,sans-serif`
function titleBlock(p, pal, atTop, bright) {
  const { main, sub, kicker } = splitTitle(p)
  const lines = wrap(main.toUpperCase(), main.length > 22 ? 13 : 11).slice(0, 4)
  const longest = Math.max(...lines.map(l => l.length))
  const size = Math.max(40, Math.min(p.productType === 'currency' ? 128 : 100, 640 / (longest * 0.62)))
  const subLines = sub ? wrap(sub.toUpperCase(), 30).slice(0, 2) : []
  let y = 672 - (p.publisher ? 26 : 0)
  let out = ''
  for (const l of [...subLines].reverse()) { out = `<text x="360" y="${r1(y)}" font-size="26" font-weight="600" letter-spacing="3" fill="${bright ? '#fff' : pal[6]}" text-anchor="middle">${esc(l)}</text>` + out; y -= 34 }
  if (subLines.length) y -= 8
  for (const l of [...lines].reverse()) {
    const fits = l.length * size * 0.62 <= 660
    out = `<text x="360" y="${r1(y)}" font-size="${r1(size)}" font-weight="800" fill="#fff" text-anchor="middle"${fits ? '' : ` textLength="650" lengthAdjust="spacingAndGlyphs"`}>${esc(l)}</text>` + out
    y -= size * 0.96
  }
  if (kicker) out = `<text x="360" y="${r1(y - 4)}" font-size="26" font-weight="700" letter-spacing="2" fill="#fff" opacity=".85" text-anchor="middle">${esc(kicker.toUpperCase())}</text>` + out
  if (p.publisher) out += `<text x="360" y="700" font-size="15" font-weight="600" letter-spacing="2.5" fill="#fff" opacity=".7" text-anchor="middle">${esc(p.publisher.toUpperCase())}</text>`
  const top = Math.max(250, y - 40)
  // Titles over a big foreground figure sit at the top of the art, as on most key art; the block is moved up whole.
  const shift = atTop ? r1(y - 40 - 14) : 0
  const pub = p.publisher ? `<text x="360" y="700" font-size="15" font-weight="600" letter-spacing="2.5" fill="#fff" opacity=".7" text-anchor="middle">${esc(p.publisher.toUpperCase())}</text>` : ''
  const textOnly = p.publisher ? out.slice(0, out.lastIndexOf('<text x="360" y="700"')) : out
  const g = body => `<g font-family="${FONT}" style="paint-order:stroke" stroke="#000" stroke-opacity=".25" stroke-width="2">${body}</g>`
  return atTop ? { svg: `<g transform="translate(0 ${-shift})">${g(textOnly)}</g>${g(pub)}`, top: 0, bottom: 720 - shift + 30 } : { svg: g(out), top }
}

function coins(pal, rng) {
  let s = ''
  for (let stack = 0; stack < 3; stack++) {
    const x = 220 + stack * 140, n = 4 + Math.floor(rng() * 5), base = 400 - (stack === 1 ? 30 : 0)
    for (let i = 0; i < n; i++) s += `<ellipse cx="${x}" cy="${base - i * 18}" rx="62" ry="20" fill="${pal[6]}" stroke="#000" stroke-opacity=".35" stroke-width="3"/>`
    s += `<ellipse cx="${x}" cy="${base - n * 18}" rx="62" ry="20" fill="${pal[2]}"/><ellipse cx="${x}" cy="${base - n * 18}" rx="40" ry="12" fill="none" stroke="${pal[6]}" stroke-width="4"/>`
  }
  return s
}

export function keyArt(p, view = 0) {
  const theme = themeOf(p)
  const options = PALETTES[theme]
  const pal = options[seedOf(p.family || p.id) % options.length]
  const rng = rngOf(seedOf(`${p.id}:${view}`))
  const currency = p.productType === 'currency'
  const body = currency
    ? `<rect width="720" height="720" fill="url(#sky)"/>${glowDisc(360, 250, 60, pal[2], 'g')}${coins(pal, rng)}`
    : `<rect width="720" height="720" fill="url(#sky)"/>${scene(p, theme, pal, rng, view)}`
  const title = view === 0 ? titleBlock(p, pal, !currency && !['sports', 'puzzle', 'strategy', 'flying'].includes(theme), ['family', 'puzzle', 'simulation', 'flying'].includes(theme)) : null
  const label = `${p.title}${view === 0 ? '' : ' artwork'}`
  return `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="720" viewBox="0 0 720 720" role="img" aria-label="${esc(label)}"><title>${esc(label)}</title>
<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${pal[0]}"/><stop offset=".62" stop-color="${pal[1]}"/><stop offset="1" stop-color="${pal[3]}"/></linearGradient>
<radialGradient id="g"><stop offset="0" stop-color="${pal[2]}" stop-opacity=".55"/><stop offset="1" stop-color="${pal[2]}" stop-opacity="0"/></radialGradient>
<radialGradient id="g2"><stop offset="0" stop-color="${pal[2]}" stop-opacity=".3"/><stop offset="1" stop-color="${pal[2]}" stop-opacity="0"/></radialGradient>
<radialGradient id="fire"><stop offset="0" stop-color="#ffb02e" stop-opacity=".55"/><stop offset="1" stop-color="#ff7a1a" stop-opacity="0"/></radialGradient>
<radialGradient id="lamp"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<radialGradient id="vig" cx=".5" cy=".45" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></radialGradient>
<linearGradient id="shadeTop" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".6"/></linearGradient>
<linearGradient id="shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".78"/></linearGradient></defs>
${body}<rect width="720" height="720" fill="url(#vig)"/>${title ? title.bottom ? `<rect width="720" height="${r1(Math.min(460, title.bottom + 40))}" fill="url(#shadeTop)"/><rect y="560" width="720" height="160" fill="url(#shade)" opacity=".7"/>${title.svg}` : `<rect y="${r1(title.top)}" width="720" height="${r1(720 - title.top)}" fill="url(#shade)"/>${title.svg}` : ''}
</svg>`
}

export const drawsKeyArt = p => !!p && !p.physical && (p.type === 'game' || p.type === 'add-on')
