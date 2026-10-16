// Store-drawn key art for the PlayStation Store's digital assortment. store.playstation.com tiles are
// square, full-bleed key art: a scene for the game's world, a hero figure and the title lockup. No real
// artwork or logos are used; every picture is an original illustration chosen from the product's own data
// (title words first, genre second), so different games get different worlds, figures, colours and type.
// View 0 is the cover with the title; views 1-3 are title-free scenes for the hero and screenshot strip.

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
const hash = s => { let n = 2166136261; for (const c of String(s)) n = Math.imul(n ^ c.codePointAt(0), 16777619); return n >>> 0 }
function rngOf(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296 } }
const r = n => Math.round(n * 10) / 10
const pick = (arr, n) => arr[n % arr.length]

// ---- worlds: [regex on the lower-case title, theme, sub-motif] (first match wins) ----
const WORLDS = [
  [/yōtei|yotei/, 'samurai', 'fuji'], [/tsushima|ronin|sekiro|nioh|onimusha/, 'samurai', 'blossom'], [/assassin's creed shadows|claws of awaji/, 'samurai', 'bamboo'],
  [/phantom blade|wukong|lost soul aside|ninja gaiden/, 'samurai', 'ink'],
  [/marvel rivals/, 'hero', ''], [/the finals/, 'neon', ''], [/apex/, 'military', ''], [/overwatch/, 'anime', ''],
  [/spider-man|miles morales/, 'hero', 'swing'], [/wolverine/, 'hero', 'claws'], [/batman|dark knight/, 'hero', 'cape'],
  [/lego/, 'bricks', ''], [/minecraft|roblox/, 'voxel', ''],
  [/astro bot|sackboy|ratchet|crash bandicoot|spyro|sonic x|fall guys|it takes two|split fiction|overcooked|grounded|goose/, 'toon', ''],
  [/call of duty|warzone|battlefield|delta force|black ops|modern warfare|metal gear|007|gears of war/, 'military', ''],
  [/helldivers|halo|destiny|marathon|saros|returnal|borderlands|outer worlds|no man's sky|starfield|warframe|apex|overwatch|the finals|marvel rivals|synapse|pragmata|star wars outlaws|star wars zero|galactic/, 'space', ''],
  [/cyberpunk|stellar blade|armored core|zenless|control/, 'neon', ''],
  [/until dawn|resident evil|silent hill|alan wake|dead by daylight|phasmophobia|dying light|metro|walking dead|hell is us|lies of p|bloodborne/, 'horror', ''],
  [/elden ring|souls|dragon's dogma|castlevania|dawnwalker|kingdom come|witcher|skyrim|oblivion|baldur|diablo|god of war|clair obscur|doom|crimson desert|hades|hollow knight|monster hunter|hogwarts/, 'fantasy', ''],
  [/final fantasy|persona|metaphor|dragon quest|tales of|genshin|honkai|like a dragon|attack on titan|layton/, 'anime', ''],
  [/red dead/, 'western', ''], [/last of us|days gone|death stranding|dune|atomfall|horizon/, 'wilds', ''],
  [/grand theft|shark cash|mafia|bully/, 'crime', ''], [/uncharted|indiana jones|prince of persia|sea of thieves/, 'explore', ''],
  [/ace combat|flight simulator/, 'flying', ''],
  [/gran turismo|f1|forza|crew motorfest|need for speed|motogp|hot wheels|sonic racing|racer/, 'racing', ''],
  [/tekken|street fighter|mortal kombat|tōkon|tokon|marvel vs|sparking|kakarot/, 'fighting', ''],
  [/fc |fc™|efootball|madden|college football|nba|mlb|nhl|pga|tony hawk|wwe|rocket league|kayak/, 'sport', ''],
  [/zoo|jurassic|coaster|farming|stardew|cities|two point|sims|powerwash|civilization/, 'sim', ''],
  [/just dance|beat saber|pistol whip|tetris/, 'music', ''], [/fortnite/, 'toon', ''],
]
const GENRE_WORLD = { Action: 'fantasy', Adventure: 'explore', Shooter: 'military', 'Driving/Racing': 'racing', 'Role Playing Games': 'anime', Sport: 'sport', Fighting: 'fighting', Simulation: 'sim', Strategy: 'sim', Horror: 'horror', Family: 'toon', Puzzle: 'music', Party: 'toon', 'Music/Rhythm': 'music' }
export function worldOf(p) {
  const t = ` ${p.title.toLowerCase()} `
  for (const [re, theme, sub] of WORLDS) if (re.test(t)) return { theme, sub }
  return { theme: GENRE_WORLD[p.genres] || 'fantasy', sub: '' }
}

// [sky top, sky bottom, glow, far, mid, near, accent]
const PALETTES = {
  samurai: [['#f4d9b0', '#d9824a', '#c8102e', '#9a5a3c', '#5c3524', '#1e120d', '#c8102e'], ['#1a1f2e', '#4a5a78', '#f2f2f2', '#2c3448', '#1b2131', '#0a0c12', '#d23c3c'], ['#e9e4d6', '#b7c4b1', '#b01e24', '#7d8f7a', '#4a5a49', '#141a14', '#b01e24'], ['#2a0d12', '#8a2a20', '#ffcf6a', '#4a1a18', '#2a0f0e', '#0c0505', '#ffb02e']],
  hero: [['#0b1030', '#3a2a6a', '#f2f4ff', '#1d2148', '#13163a', '#06081a', '#e8232f'], ['#130a1a', '#5a1f3a', '#ffd27a', '#2a1426', '#1a0c18', '#08040a', '#ffd400'], ['#071a2a', '#1f5a7a', '#cfefff', '#123044', '#0b2030', '#040c12', '#2f8fff']],
  military: [['#1a1612', '#a0581e', '#ffb35c', '#3a2c20', '#221a14', '#0b0907', '#ff7a1a'], ['#0d1418', '#4a6a72', '#d8f0ff', '#20303a', '#141f26', '#06090c', '#76d0ff'], ['#141a10', '#5f6a38', '#f0e6a0', '#2f3520', '#1d2214', '#090b06', '#c8e04a'], ['#0e0e14', '#5a2020', '#ff6a3a', '#2a1a1c', '#1a1012', '#070506', '#ff3b2a']],
  space: [['#02040c', '#1a2a5a', '#bfe3ff', '#16203f', '#0e152b', '#05070f', '#ffc800'], ['#0a0414', '#4a1f6a', '#ffd0f5', '#24123a', '#170b26', '#06030b', '#ff6ad5'], ['#02090a', '#0f4a4a', '#c8fff6', '#103033', '#0a2023', '#030909', '#3dffcf'], ['#140608', '#6a2a14', '#ffd9a0', '#3a160e', '#220c08', '#0a0403', '#ff8a2a']],
  neon: [['#05030f', '#2a0a4a', '#ff3df2', '#1a0a2e', '#100620', '#04020a', '#00f0ff'], ['#0a0a0a', '#3a3a0a', '#f6ff00', '#1e1e10', '#141408', '#050503', '#ff2a5a'], ['#020a10', '#0a2a4a', '#ff4040', '#0e1e2e', '#08121c', '#020508', '#ffffff']],
  horror: [['#050607', '#2b0d10', '#ff5a4a', '#15181a', '#0d0f10', '#050505', '#d8261f'], ['#04070a', '#1d2b33', '#cfe7ff', '#12191d', '#0b1013', '#040607', '#9bc7e6'], ['#0a0805', '#3a3020', '#ffe7a0', '#1d1a12', '#12100b', '#050403', '#c9b27a'], ['#0b0e0a', '#2f3a2a', '#d8ffd0', '#161c14', '#0e120d', '#040504', '#a8ff6a']],
  fantasy: [['#0b1230', '#3d5a8a', '#e6efff', '#1b2547', '#121935', '#070a18', '#ffd27a'], ['#1a0f08', '#a0622a', '#ffe1a8', '#3a2414', '#24170c', '#0d0805', '#ffb84a'], ['#0d0618', '#5a2a7a', '#f0d0ff', '#25123a', '#170b26', '#08040e', '#d68cff'], ['#120404', '#6a1a10', '#ffb070', '#2e0e0a', '#1c0806', '#080202', '#ff5a2a'], ['#0e1416', '#5e7680', '#fff4d0', '#2a3a40', '#1a252a', '#080c0e', '#e8c05a']],
  anime: [['#1b3cff', '#7ad0ff', '#ffffff', '#3a5ad8', '#2a44b0', '#141e60', '#ffe14a'], ['#e8001c', '#140405', '#ffffff', '#5a0a10', '#2a0508', '#0a0102', '#ffffff'], ['#3a1a6a', '#ff8ac8', '#fff6c0', '#6a3a9a', '#4a2a7a', '#1e1036', '#7af0ff'], ['#0a3a3a', '#7ae0c0', '#fffbe0', '#1e5a52', '#14403a', '#061a18', '#ffcf3a']],
  western: [['#3a1a0e', '#e07a3a', '#ffd88a', '#8a3a1e', '#5a2412', '#1e0c06', '#c8102e'], ['#1a1a2a', '#c86a4a', '#fff0c0', '#5a3a3a', '#3a2424', '#120a0a', '#ffe8b0']],
  wilds: [['#2a3a2a', '#c8b48a', '#fff4d0', '#4a5a3a', '#2e3a24', '#0e140b', '#d8a040'], ['#1e2a3a', '#e89a6a', '#ffe8c0', '#3a4a5a', '#24303c', '#0a0f14', '#ff7a3a'], ['#3a2a14', '#e8c890', '#fffbe8', '#a8865a', '#7a5a34', '#2a1c0e', '#3a8aff'], ['#0e2028', '#4a8a8a', '#e8fff8', '#1e3a40', '#14282e', '#060e10', '#ff6a3a']],
  crime: [['#1a0a3a', '#ff6a8a', '#ffd06a', '#3a1a5a', '#24103a', '#0a0518', '#2af0ff'], ['#06222a', '#ff9a4a', '#fff0b0', '#1a3a44', '#12282e', '#050e10', '#ff3a8a'], ['#2a1a0a', '#c8a06a', '#fff4d8', '#4a3420', '#2e2014', '#0e0905', '#c8102e']],
  explore: [['#0a3040', '#5ac0c8', '#fff8d8', '#1e5a50', '#14403a', '#061a16', '#ffcf3a'], ['#3a1a0a', '#e8a04a', '#fff0c0', '#6a3a1a', '#4a2810', '#1a0e05', '#3ad0ff'], ['#081a3a', '#3a8ad8', '#ffffff', '#123060', '#0a2048', '#04102a', '#ffd84a']],
  flying: [['#3f8fd6', '#cfe9fb', '#fffbe6', '#8db7d6', '#6f9cc0', '#4d7ea6', '#ffffff'], ['#1a2440', '#e88a5a', '#ffe8b0', '#4a4a6a', '#30304a', '#14141e', '#ffd84a']],
  racing: [['#1a0f3a', '#ff5e7e', '#ffd36b', '#3a1f5c', '#20123a', '#0b0718', '#33e1ff'], ['#071b33', '#ff9a3c', '#fff0b3', '#1d3350', '#132238', '#070d18', '#ffcf3a'], ['#0a0a0a', '#3a3a3a', '#ffffff', '#1e1e1e', '#141414', '#050505', '#e10600'], ['#0a2a4a', '#8ad0ff', '#ffffff', '#2a5a7a', '#1a3a5a', '#0a1a2a', '#ff6a00']],
  fighting: [['#1a0008', '#8a0f2a', '#ffcf4a', '#3a0a18', '#220510', '#0c0206', '#ff3b3b'], ['#060a1f', '#2a2a8a', '#9ee8ff', '#151a40', '#0d1029', '#05060f', '#5ad1ff'], ['#140a00', '#c86a00', '#fff2a0', '#3a1e00', '#241200', '#0c0600', '#ffe14a'], ['#0a0014', '#6a0a8a', '#ffb0ff', '#2a0a3a', '#1a0626', '#08020e', '#ff3df2']],
  sport: [['#06142b', '#1f4f8a', '#eaf4ff', '#0b1f3d', '#1c6b33', '#0f4a22', '#ffffff'], ['#120a24', '#5a2a8a', '#f4e8ff', '#1c1238', '#1f6e3a', '#114d26', '#ffd84a'], ['#0a0a0a', '#2a2a2a', '#ffffff', '#1a1a1a', '#1c6b33', '#0f4a22', '#e10600']],
  sim: [['#6fb7ec', '#e4f4ff', '#fffbe0', '#9cc98a', '#79ad66', '#55894a', '#ff6a3a'], ['#ffb36b', '#ffe8c0', '#fffbe0', '#a8c87a', '#86aa5a', '#5a7a3a', '#3a6aff'], ['#4a7ad8', '#c0e0ff', '#ffffff', '#7ab0d8', '#5a90c0', '#3a6a9a', '#ffd84a']],
  toon: [['#4fc3f7', '#c9f1ff', '#fff3b0', '#8ad98f', '#5cbf63', '#3a9a45', '#ff5fa2'], ['#7e6cf2', '#ffc6e7', '#fff6c9', '#ffb36b', '#ff8f5a', '#e86a4a', '#3ad6ff'], ['#ff8a3a', '#ffe08a', '#fffbe0', '#6ac0ff', '#3a9aff', '#1a6ad8', '#ff3a6a'], ['#0a2a6a', '#3a8aff', '#ffffff', '#5ad06a', '#3aa04a', '#1a6a2a', '#ffd400']],
  bricks: [['#ffd400', '#ffb000', '#ffffff', '#e3000b', '#0057a8', '#1a1a1a', '#e3000b'], ['#0a0a1a', '#2a2a4a', '#ffe14a', '#3a3a5a', '#24243a', '#0a0a14', '#ffd400'], ['#4ab0ff', '#c0e8ff', '#ffffff', '#00852b', '#e3000b', '#0057a8', '#ffd400']],
  voxel: [['#6ab8ff', '#c8e8ff', '#fffbe0', '#7a5a3a', '#5aa83a', '#3a7a2a', '#ffffff'], ['#1a1030', '#4a3a8a', '#ffd84a', '#5a4a3a', '#3a8a5a', '#2a5a3a', '#ff4a4a']],
  music: [['#05030f', '#2a0a5a', '#ff3df2', '#1a0a3a', '#100628', '#04020a', '#3dfcff'], ['#000814', '#003a6a', '#00e5ff', '#001a33', '#00101f', '#00040a', '#ff2a6a'], ['#14001a', '#6a004a', '#ffd400', '#2a0030', '#1a0020', '#08000a', '#00ff9a']],
}

// ---- drawing helpers (600 x 600 canvas) ----
function ridge(rng, y, amp, color, step = 40) {
  let d = `M0 600 L0 ${r(y)}`
  for (let x = 0; x <= 600; x += step) d += ` L${x} ${r(y - rng() * amp)}`
  return `<path d="${d} L600 600Z" fill="${color}"/>`
}
function hills(rng, y, amp, color) {
  let d = `M0 600 L0 ${r(y)}`, x = 0
  while (x < 600) { const w = 120 + rng() * 150; d += ` Q${r(x + w / 2)} ${r(y - amp - rng() * amp)} ${r(x + w)} ${r(y + rng() * 8)}`; x += w }
  return `<path d="${d} L600 600Z" fill="${color}"/>`
}
function skyline(rng, y, color, windows, minH = 50, maxH = 230) {
  let s = '', x = -10
  while (x < 610) {
    const w = 28 + rng() * 52, h = minH + rng() * (maxH - minH)
    s += `<rect x="${r(x)}" y="${r(y - h)}" width="${r(w)}" height="${r(h + 400)}" fill="${color}"/>`
    if (windows) for (let wy = y - h + 10; wy < y - 8; wy += 14) for (let wx = x + 5; wx < x + w - 6; wx += 10) if (rng() < 0.2) s += `<rect x="${r(wx)}" y="${r(wy)}" width="4" height="6" fill="${windows}" opacity=".75"/>`
    if (rng() < 0.2) s += `<rect x="${r(x + w / 2 - 1.5)}" y="${r(y - h - 26)}" width="3" height="26" fill="${color}"/>`
    x += w + rng() * 5
  }
  return s
}
function stars(rng, n, color = '#fff') { let s = ''; for (let i = 0; i < n; i++) s += `<circle cx="${r(rng() * 600)}" cy="${r(rng() * 340)}" r="${r(0.5 + rng() * 1.5)}" fill="${color}" opacity="${r(0.3 + rng() * 0.7)}"/>`; return s }
function clouds(rng, n, color, op = 0.8) { let s = ''; for (let i = 0; i < n; i++) { const x = rng() * 600, y = 50 + rng() * 220, w = 50 + rng() * 80; s += `<g fill="${color}" opacity="${op}"><ellipse cx="${r(x)}" cy="${r(y)}" rx="${r(w)}" ry="${r(w * 0.3)}"/><ellipse cx="${r(x + w * 0.3)}" cy="${r(y - w * 0.16)}" rx="${r(w * 0.5)}" ry="${r(w * 0.3)}"/></g>` } return s }
function pines(rng, y, color, n, scale = 1) {
  let s = ''
  for (let i = 0; i < n; i++) {
    const x = rng() * 640 - 20, h = (60 + rng() * 100) * scale, w = h * 0.36, b = y + rng() * 26
    s += `<path d="M${r(x)} ${r(b - h)} L${r(x + w / 2)} ${r(b - h * 0.5)} L${r(x + w / 4)} ${r(b - h * 0.5)} L${r(x + w * 0.6)} ${r(b - h * 0.15)} L${r(x - w * 0.6)} ${r(b - h * 0.15)} L${r(x - w / 4)} ${r(b - h * 0.5)} L${r(x - w / 2)} ${r(b - h * 0.5)}Z M${r(x - 4)} ${r(b - h * 0.16)} h8 v${r(h * 0.16)} h-8z" fill="${color}"/>`
  }
  return s
}
const sun = (x, y, rad, color, glowOp = 0.5) => `<circle cx="${r(x)}" cy="${r(y)}" r="${r(rad * 3)}" fill="${color}" opacity="${r(glowOp * 0.25)}"/><circle cx="${r(x)}" cy="${r(y)}" r="${r(rad * 1.8)}" fill="${color}" opacity="${r(glowOp * 0.35)}"/><circle cx="${r(x)}" cy="${r(y)}" r="${r(rad)}" fill="${color}"/>`
const rays = (x, y, color, n = 16, op = 0.18) => `<g opacity="${op}">${Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2, b = a + Math.PI / n / 1.6; return `<path d="M${x} ${y} L${r(x + 900 * Math.cos(a))} ${r(y + 900 * Math.sin(a))} L${r(x + 900 * Math.cos(b))} ${r(y + 900 * Math.sin(b))}Z" fill="${color}"/>` }).join('')}</g>`
const flip = (x, f) => f ? 600 - x : x

// ---- figures: drawn with their feet at (x, y), about 300 units tall at scale 1 ----
const g = (x, y, s, f, c, body) => `<g transform="translate(${r(x)} ${r(y)}) scale(${f ? -s : s} ${s})" fill="${c}">${body}</g>`
const FIG = {
  samurai: (x, y, s, f, c, a) => g(x, y, s, f, c, `<path d="M-62 -262 L0 -292 L62 -262 Q0 -250 -62 -262Z"/><path d="M-16 -262 h32 v26 h-32z"/><path d="M-40 -236 h80 l18 120 l26 116 h-60 l-22 -90 l-22 90 h-60 l26 -116z"/><path d="M-50 -220 l-40 70 l12 8 l46 -60z"/><path d="M30 -200 L170 -330 L176 -324 L40 -190z"/><path d="M28 -196 l22 18" stroke="${a}" stroke-width="6"/><path d="M-40 -236 q-50 40 -70 120 q30 -10 52 -40z" opacity=".85"/>`),
  soldier: (x, y, s, f, c, a) => g(x, y, s, f, c, `<path d="M-22 -298 q22 -26 46 -4 l4 16 l-54 0z"/><circle cx="0" cy="-270" r="20"/><path d="M-40 -246 h78 l14 96 h-28 l-6 66 l18 84 h-34 l-14 -76 l-14 76 h-34 l18 -84 l-8 -66 h-24z"/><path d="M20 -226 l130 -34 l4 12 l-130 36z"/><path d="M-34 -232 l58 -8 l4 16 l-56 10z"/><path d="M-40 -246 h26 l-6 70 h-28z" opacity=".8"/><rect x="-10" y="-276" width="22" height="6" fill="${a}" opacity=".9"/>`),
  knight: (x, y, s, f, c, a) => g(x, y, s, f, c, `<path d="M-20 -300 h40 v40 q-20 14 -40 0z"/><path d="M-4 -312 l4 -20 l4 20z"/><path d="M-60 -258 h120 l-6 30 l-12 128 h-30 l6 100 h-34 l-4 -90 l-4 90 h-34 l6 -100 h-30 l-12 -128z"/><path d="M-60 -250 q-60 120 -50 250 h60 l20 -230z" opacity=".75"/><path d="M58 -170 v-150 l8 -10 l8 10 v150z" fill="${a}" opacity=".9"/><path d="M44 -170 h44 v10 h-44z"/><circle cx="-8" cy="-286" r="3" fill="${a}"/>`),
  hero: (x, y, s, f, c, a) => g(x, y, s, f, c, `<circle cx="0" cy="-270" r="22"/><path d="M-40 -244 h80 l10 100 h-20 l6 144 h-30 l-8 -120 l-8 120 h-30 l6 -144 h-20z"/><path d="M-40 -240 l-60 -70 l10 -8 l64 64z"/><path d="M40 -240 l50 80 l-10 6 l-52 -72z"/><path d="M-14 -276 q14 -10 28 0 v6 h-28z" fill="${a}" opacity=".9"/>`),
  claws: (x, y, s, f, c, a) => g(x, y, s, f, c, `<path d="M-30 -300 l-14 -30 l24 18 h40 l24 -18 l-14 30 v30 h-60z"/><path d="M-56 -262 h112 l14 110 h-26 l10 152 h-38 l-12 -120 l-12 120 h-38 l10 -152 h-26z"/><path d="M-56 -258 l-50 90 l14 8 l52 -84z"/><path d="M56 -258 l50 90 l-14 8 l-52 -84z"/>${[-14, 0, 14].map(d => `<path d="M${-100 + d} -168 l${-18 + d} -90 l4 -2 l${18 - d * 0.5} 92z M${100 + d} -168 l${18 + d} -90 l-4 -2 l${-18 - d * 0.5} 92z" fill="${a}"/>`).join('')}`),
  cape: (x, y, s, f, c, a) => g(x, y, s, f, c, `<path d="M-20 -300 l-10 -26 l18 16 h24 l18 -16 l-10 26 v22 h-40z"/><path d="M-70 -262 q-50 150 -30 262 l50 -40 l50 40 l50 -40 l50 40 q20 -112 -30 -262z"/><path d="M-30 -270 h60 v20 h-60z"/><path d="M-12 -230 l12 -10 l12 10 l-12 8z" fill="${a}"/>`),
  swing: (x, y, s, f, c, a) => `<path d="M${r(flip(x, f) - (f ? -60 : 60) * s)} ${r(y - 300 * s)} L${r(flip(x, f) + (f ? -1 : 1) * 170)} -20" stroke="#fff" stroke-width="2.5" opacity=".75"/>` + g(flip(x, f), y, s, f, c, `<circle cx="-40" cy="-270" r="22"/><path d="M-60 -250 l70 -10 l40 90 l60 40 l-10 14 l-70 -30 l-30 -40 l-20 70 l40 90 l-16 8 l-56 -86 l0 -100z"/><path d="M-60 -246 l-10 -60 l14 -4 l14 56z"/><path d="M-52 -284 q12 -10 24 0" stroke="${a}" stroke-width="6" fill="none"/>`),
  armor: (x, y, s, f, c, a) => g(x, y, s, f, c, `<path d="M-30 -312 q30 -24 60 0 v40 q-30 12 -60 0z"/><path d="M-22 -296 h44 v12 h-44z" fill="${a}"/><path d="M-70 -270 h140 l-4 44 l-16 6 l-6 104 h-24 l8 120 h-38 l-10 -110 l-10 110 h-38 l8 -120 h-24 l-6 -104 l-16 -6z"/><path d="M-70 -270 q-26 0 -26 30 v20 h30z M70 -270 q26 0 26 30 v20 h-30z"/><path d="M26 -216 l150 -26 l4 16 l-150 30z"/>`),
  wanderer: (x, y, s, f, c, a) => g(x, y, s, f, c, `<circle cx="0" cy="-270" r="20"/><path d="M-34 -246 h66 l8 110 h-18 l8 136 h-30 l-10 -116 l-10 116 h-30 l8 -136 h-12z"/><path d="M-36 -244 h-34 q-12 0 -12 14 v100 h46z"/><path d="M32 -236 l20 120 l-10 2 l-22 -110z"/><path d="M-20 -290 q20 -14 40 0 l8 10 h-56z" fill="${a}" opacity=".85"/>`),
  rider: (x, y, s, f, c, a) => g(x, y, s, f, c, `<path d="M-150 -150 q20 -40 80 -40 h120 q40 0 60 -30 l30 -50 l30 10 l-10 30 l20 10 l-20 20 l-30 -10 q-10 70 -40 90 l10 120 h-20 l-24 -100 l-80 0 l-20 100 h-20 l0 -100 q-60 -10 -76 -50z"/><path d="M-160 -150 q-30 20 -26 80 l10 0 q0 -50 22 -70z"/><circle cx="-10" cy="-290" r="16"/><path d="M-40 -310 h60 l10 10 h-80z"/><path d="M-30 -272 h40 l10 90 h-60z"/>`),
  fighter: (x, y, s, f, c, a) => g(x, y, s, f, c, `<circle cx="8" cy="-276" r="22"/><path d="M-20 -250 h50 l26 96 l-18 6 l-12 -34 l2 48 l44 134 h-32 l-44 -100 l-36 100 h-32 l30 -138 l-2 -90 l-50 42 l-14 -16z"/><path d="M30 -240 l80 -16 l6 18 l-82 20z"/><path d="M-10 -298 q18 -14 36 0 l-36 8z" fill="${a}"/>`),
  athlete: (x, y, s, f, c, a) => g(x, y, s, f, c, `<circle cx="10" cy="-280" r="22"/><path d="M-20 -254 h52 l30 70 l40 -30 l12 14 l-52 46 l-26 -30 l-4 70 l50 60 l-30 54 l-18 -10 l22 -40 l-50 -50 l-30 100 h-24 l28 -134 l-6 -60 l-40 50 l-14 -12z"/><path d="M-20 -250 h52 v30 h-52z" fill="${a}" opacity=".9"/>`),
  mascot: (x, y, s, f, c, a) => g(x, y, s, f, c, `<ellipse cx="0" cy="-6" rx="70" ry="10" fill="#000" opacity=".18"/><rect x="-46" y="-120" width="92" height="90" rx="30"/><rect x="-36" y="-30" width="22" height="30" rx="10"/><rect x="14" y="-30" width="22" height="30" rx="10"/><rect x="-70" y="-230" width="140" height="112" rx="46"/><rect x="-54" y="-208" width="108" height="64" rx="28" fill="#0b1630"/><ellipse cx="-22" cy="-176" rx="12" ry="16" fill="${a}"/><ellipse cx="22" cy="-176" rx="12" ry="16" fill="${a}"/><path d="M0 -230 v-30" stroke="${c}" stroke-width="8"/><circle cx="0" cy="-264" r="10" fill="${a}"/>`),
  mech: (x, y, s, f, c, a) => g(x, y, s, f, c, `<path d="M-40 -330 h80 l10 30 h-100z"/><rect x="-22" y="-318" width="44" height="8" fill="${a}"/><path d="M-100 -300 h200 l-20 110 h-160z"/><path d="M-130 -300 h40 v120 h-40z M90 -300 h40 v120 h-40z"/><path d="M130 -270 h120 v30 h-120z"/><path d="M-70 -190 h50 l10 100 l-30 90 h-50 l30 -90z M20 -190 h50 l20 100 l30 90 h-50 l-30 -90z"/>`),
}

// ---- scenes ----
function scene(p, w, pal, rng, view, flipped) {
  const [, , glow, far, mid, near, accent] = pal
  const f = flipped, fx = x => flip(x, f)
  const sx = fx(150 + rng() * 120), sy = 150 + rng() * 80
  const t = p.title.toLowerCase()
  switch (w.theme) {
    case 'samurai': {
      let s = sun(sx, sy, 70 + rng() * 40, glow, 0.6)
      if (w.sub === 'fuji') s += `<path d="M20 470 L230 210 Q300 160 370 210 L580 470Z" fill="${far}"/><path d="M230 210 Q300 160 370 210 L340 250 L310 232 L285 258 L262 238 Z" fill="#fff" opacity=".92"/>`
      else s += ridge(rng, 400, 90, far, 50)
      s += ridge(rng, 480, 50, mid, 60)
      if (w.sub === 'bamboo') s += Array.from({ length: 9 }, () => { const x = rng() * 600, wd = 8 + rng() * 10; return `<rect x="${r(x)}" y="0" width="${r(wd)}" height="600" fill="${near}" opacity="${r(0.5 + rng() * 0.4)}"/>${[1, 2, 3, 4].map(k => `<rect x="${r(x - 1)}" y="${r(k * 120 + rng() * 40)}" width="${r(wd + 2)}" height="4" fill="${mid}"/>`).join('')}` }).join('')
      s += `<path d="M0 600 L0 520 Q300 470 600 520 L600 600Z" fill="${near}"/>`
      s += Array.from({ length: 60 }, () => { const x = rng() * 600, h = 20 + rng() * 50; return `<path d="M${r(x)} 600 q${r(rng() * 12 - 6)} ${r(-h / 2)} ${r(rng() * 20 - 4)} ${r(-h - 470 + 470)}" stroke="${near}" stroke-width="3" fill="none" transform="translate(0 -60)"/>` }).join('')
      s += FIG.samurai(fx(400 + rng() * 60), 560, 0.95 + rng() * 0.25, f, near, accent)
      s += Array.from({ length: w.sub === 'ink' ? 0 : 22 }, () => `<ellipse cx="${r(rng() * 600)}" cy="${r(rng() * 500)}" rx="5" ry="3" fill="${w.sub === 'blossom' ? '#ffb7c9' : accent}" opacity=".8" transform="rotate(${r(rng() * 180)})"/>`).join('')
      if (w.sub === 'ink') s += `<path d="M-20 ${r(380 + rng() * 60)} Q300 ${r(300 + rng() * 60)} 640 ${r(340 + rng() * 80)}" stroke="${accent}" stroke-width="${r(18 + rng() * 20)}" stroke-linecap="round" fill="none" opacity=".85"/>`
      return s
    }
    case 'hero': {
      let s = stars(rng, 40) + sun(fx(440), 140, 60, glow, 0.4) + skyline(rng, 470, far, pal[2], 80, 300) + skyline(rng, 560, mid, accent, 40, 170)
      const fig = w.sub === 'swing' ? 'swing' : w.sub === 'claws' ? 'claws' : w.sub === 'cape' ? 'cape' : pick(['hero', 'claws', 'cape'], hash(p.family))
      if (fig === 'swing') return s + FIG.swing(330, 470, 0.9, f, near, accent)
      return s + `<path d="M0 600 V500 h${r(260 + rng() * 120)} v100z" fill="${near}" transform="${f ? 'translate(600 0) scale(-1 1)' : ''}"/>` + FIG[fig](fx(150 + rng() * 80), 510, 0.95, f, near, accent)
    }
    case 'military': {
      let s = sun(sx, sy + 60, 50, glow, 0.6) + skyline(rng, 460, far, null, 40, 200) + `<g opacity=".45">${clouds(rng, 6, near, 0.6)}</g>` + ridge(rng, 520, 40, mid, 70)
      const heli = `<g transform="translate(${r(fx(140 + rng() * 80))} ${r(110 + rng() * 60)}) scale(${f ? -0.8 : 0.8} 0.8)" fill="${near}"><ellipse cx="0" cy="0" rx="60" ry="26"/><path d="M50 -6 h110 l10 -24 h8 l-6 34 h-120z"/><path d="M-120 -34 h240 v4 h-240z"/><path d="M-4 -34 v8 h8 v-8z"/><path d="M-30 26 v10 h60 v-10z"/></g>`
      const jets = Array.from({ length: 3 }, (_, i) => `<path d="M${fx(80 + i * 60)} ${130 + i * 26} l40 -6 l10 -12 h6 l-4 12 l30 4 l-30 4 l4 12 h-6 l-10 -12z" fill="${near}"/>`).join('')
      s += (hash(p.family) % 2 ? heli : jets)
      const n = 1 + hash(p.family) % 3
      for (let i = 0; i < n; i++) s += FIG.soldier(fx(380 - i * 120 + rng() * 30), 580 - i * 20, 1.15 - i * 0.22, f, i ? mid : near, accent)
      return s + `<rect y="560" width="600" height="40" fill="${near}"/>`
    }
    case 'space': {
      const alt = hash(p.family) % 3, px = fx(alt === 2 ? 440 : 170)
      let s = stars(rng, 140) + `<circle cx="${px}" cy="${alt === 0 ? 760 : 300}" r="${alt === 0 ? 440 : 120 + rng() * 40}" fill="${mid}"/><circle cx="${px}" cy="${alt === 0 ? 760 : 300}" r="${alt === 0 ? 440 : 140}" fill="none" stroke="${glow}" stroke-width="3" opacity=".5"/>`
      if (alt) s += `<ellipse cx="${px}" cy="300" rx="220" ry="34" fill="none" stroke="${accent}" stroke-width="5" opacity=".5" transform="rotate(-14 ${px} 300)"/>`
      s += `<g transform="translate(${fx(alt === 2 ? 150 : 440)} ${r(170 + rng() * 60)}) rotate(${f ? 12 : -12}) scale(${f ? -1 : 1} 1)" fill="${near}"><path d="M-80 0 l50 -14 h70 l36 14 l-36 14 h-70z"/><path d="M-26 -12 l-26 -32 h18 l36 32z M-26 12 l-26 32 h18 l36 -32z"/><circle cx="-86" cy="0" r="6" fill="${accent}"/></g>`
      s += ridge(rng, 540, 40, near, 50)
      return s + (/helldivers|halo|destiny|marathon|apex|overwatch|finals|rivals|borderlands|warframe|synapse/.test(t) ? FIG.armor(fx(380 + rng() * 50), 590, 1.1, f, near, accent) : FIG.wanderer(fx(380 + rng() * 50), 580, 1.0, f, near, accent))
    }
    case 'neon': {
      let s = `<rect y="0" width="600" height="600" fill="${far}" opacity=".2"/>` + skyline(rng, 420, far, accent, 120, 380) + skyline(rng, 470, mid, pal[2], 60, 220)
      s += `<rect y="470" width="600" height="130" fill="${near}"/>` + Array.from({ length: 9 }, (_, i) => `<path d="M300 470 L${-600 + i * 225} 600" stroke="${pal[2]}" stroke-width="1.5" opacity=".6"/>`).join('') + [490, 515, 550, 595].map(y => `<path d="M0 ${y} H600" stroke="${pal[2]}" stroke-width="1.5" opacity=".5"/>`).join('')
      s += Array.from({ length: 4 }, () => `<rect x="${r(rng() * 520)}" y="${r(120 + rng() * 220)}" width="${r(40 + rng() * 60)}" height="10" fill="${pick([accent, pal[2]], Math.floor(rng() * 2))}" opacity=".85"/>`).join('')
      return s + (/armored core/.test(t) ? FIG.mech(fx(330), 560, 1.0, f, '#06040c', accent) : FIG.hero(fx(400 + rng() * 40), 560, 1.15, f, '#06040c', accent))
    }
    case 'horror': {
      let s = sun(sx, sy - 20, 46, glow, 0.5) + stars(rng, 30) + pines(rng, 430, far, 12, 1.3)
      if (/until dawn|resident|silent hill|alan wake|dead by daylight|phasmophobia/.test(t)) s += `<g fill="${mid}" transform="translate(${fx(300)} 440)"><path d="M-110 0 v-90 l110 -80 l110 80 v90z"/><rect x="40" y="-200" width="22" height="70"/>${[-70, 30].map(x => `<rect x="${x}" y="-70" width="36" height="34" fill="${glow}" opacity="${r(0.35 + rng() * 0.5)}"/>`).join('')}</g>`
      s += `<rect y="380" width="600" height="220" fill="${glow}" opacity=".07"/>` + pines(rng, 560, near, 8, 1.7)
      const hx = fx(170 + rng() * 60)
      s += `<path d="M${hx} ${430} L${fx(600)} 340 L${fx(600)} 560Z" fill="${glow}" opacity=".12"/>`
      return s + FIG.wanderer(hx, 580, 0.95, f, '#000', glow) + `<rect y="560" width="600" height="40" fill="${near}"/>`
    }
    case 'fantasy': {
      let s = stars(rng, 60) + sun(sx, sy, 40 + rng() * 30, glow, 0.6)
      const alt = hash(p.family) % 3
      if (/elden|erdtree|nightreign/.test(t)) s += `<path d="M${fx(300)} 120 q-60 120 -20 340 h40 q40 -220 -20 -340z" fill="${accent}" opacity=".55"/>` + `<circle cx="${fx(300)}" cy="160" r="120" fill="${accent}" opacity=".18"/>`
      s += ridge(rng, 400, 120, far, 40)
      if (alt === 0 || /castlevania|dawnwalker|hogwarts|souls|bloodborne/.test(t)) s += `<g fill="${mid}">${[[-120, 160, 46], [-40, 230, 56], [50, 190, 44], [120, 130, 40]].map(([dx, h, wd]) => `<rect x="${fx(300) + dx - wd / 2}" y="${470 - h}" width="${wd}" height="${h}"/><path d="M${fx(300) + dx - wd / 2 - 6} ${470 - h} L${fx(300) + dx} ${470 - h - wd * 1.1} L${fx(300) + dx + wd / 2 + 6} ${470 - h}Z"/>`).join('')}<rect x="${fx(300) - 140}" y="400" width="280" height="80"/></g>`
      if (alt === 1 || /dragon|monster hunter|skyrim|diablo/.test(t)) s += `<g transform="translate(${fx(400)} ${r(150 + rng() * 40)}) scale(${f ? -0.9 : 0.9} 0.9)" fill="${mid}"><path d="M-120 0 q60 -20 120 0 q60 -70 150 -60 q-60 20 -80 70 q60 10 90 50 q-70 -20 -120 -10 q-40 40 -110 30 q40 -20 50 -40 z"/><path d="M-120 0 l-40 -20 l20 24z"/></g>`
      s += ridge(rng, 520, 40, near, 60)
      return s + FIG.knight(fx(170 + rng() * 70), 590, 1.1, f, near, accent)
    }
    case 'anime': {
      let s = rays(fx(380), 260, glow, 18, 0.16)
      const alt = hash(p.family) % 2
      if (/persona|metaphor/.test(t) || alt) s += Array.from({ length: 5 }, (_, i) => `<path d="M${-100 + i * 160} 600 L${80 + i * 160} 0 L${120 + i * 160} 0 L${-60 + i * 160} 600Z" fill="${i % 2 ? accent : far}" opacity=".45"/>`).join('')
      s += `<g transform="translate(${fx(400)} 250)"><path d="M0 -150 L60 0 L0 150 L-60 0Z" fill="${accent}" opacity=".85"/><path d="M0 -150 L20 0 L0 150 L-60 0Z" fill="#fff" opacity=".35"/></g>`
      s += Array.from({ length: 24 }, () => { const x = rng() * 600, y = rng() * 520, z = 3 + rng() * 6; return `<path d="M${r(x)} ${r(y - z)} L${r(x + z * 0.3)} ${r(y)} L${r(x)} ${r(y + z)} L${r(x - z * 0.3)} ${r(y)}Z" fill="#fff" opacity=".8"/>` }).join('')
      s += hills(rng, 540, 30, mid)
      return s + FIG.hero(fx(200 + rng() * 40), 580, 1.15, f, near, accent)
    }
    case 'western': return sun(sx, 300, 80, glow, 0.6) + `<g fill="${far}"><path d="M${fx(60)} 470 v-120 h40 l10 -30 h120 l10 30 h20 v120z"/><path d="M${fx(420)} 470 v-80 h30 l10 -20 h90 l10 20 v80z"/></g>` + hills(rng, 500, 20, mid) + `<path d="M${fx(470)} 560 v-120 m0 40 h-24 v-30 m24 20 h22 v-40" stroke="${near}" stroke-width="16" stroke-linecap="round" fill="none"/>` + `<rect y="540" width="600" height="60" fill="${near}"/>` + FIG.rider(fx(260), 560, 0.95, f, near, accent)
    case 'wilds': {
      let s = sun(sx, sy + 20, 60, glow, 0.5)
      if (/dune|death stranding/.test(t)) s += hills(rng, 430, 50, far) + hills(rng, 500, 40, mid) + hills(rng, 560, 30, near)
      else s += skyline(rng, 460, far, null, 60, 240) + Array.from({ length: 30 }, () => `<circle cx="${r(rng() * 600)}" cy="${r(200 + rng() * 260)}" r="${r(8 + rng() * 24)}" fill="${mid}" opacity=".9"/>`).join('') + ridge(rng, 520, 40, mid, 50) + `<rect y="540" width="600" height="60" fill="${near}"/>`
      if (/horizon/.test(t)) s += `<g transform="translate(${fx(430)} 460) scale(${f ? -1 : 1} 1)" fill="${mid}"><path d="M-70 -60 q40 -60 110 -40 l20 -40 l10 4 l-12 44 q30 20 20 60 h-20 l-4 76 h-14 l-6 -70 h-60 l-6 70 h-14 l-4 -74 q-30 -10 -20 -30z"/><circle cx="58" cy="-108" r="6" fill="${accent}"/></g>`
      return s + FIG.wanderer(fx(200 + rng() * 60), 585, 1.05, f, near, accent) + (/last of us|days gone/.test(t) ? FIG.wanderer(fx(300), 590, 0.8, f, near, accent) : '')
    }
    case 'crime': {
      let s = sun(fx(300), 330, 90, glow, 0.6) + Array.from({ length: 6 }, (_, i) => `<rect x="0" y="${300 + i * 16}" width="600" height="${4 + i}" fill="${pal[1]}"/>`).join('') + skyline(rng, 470, far, accent, 60, 260)
      s += [fx(60), fx(530)].map((x, i) => `<g fill="${near}"><path d="M${x} 600 q${i ? -10 : 10} -150 ${i ? 20 : -20} -290 h8 q${i ? -30 : 30} 140 ${i ? -10 : 10} 290z"/>${[0, 1, 2, 3, 4, 5].map(k => `<path d="M${x + (i ? 20 : -20)} 312 q${r(Math.cos(k) * 70)} ${r(-30 + Math.sin(k) * 30)} ${r(Math.cos(k) * 110)} ${r(30 + Math.sin(k) * 40)} q${r(-Math.cos(k) * 40)} -30 ${r(-Math.cos(k) * 110)} ${r(-30 - Math.sin(k) * 40)}z"/>`).join('')}</g>`).join('')
      s += `<rect y="520" width="600" height="80" fill="${near}"/>` + `<g transform="translate(${fx(330)} 560) scale(${f ? -1 : 1} 1)"><path d="M-130 0 q4 -22 34 -28 l50 -6 q26 -26 70 -28 q44 0 72 26 l34 6 q30 6 34 30z" fill="${mid}"/><circle cx="-76" cy="2" r="18" fill="#000"/><circle cx="76" cy="2" r="18" fill="#000"/><rect x="-130" y="-10" width="18" height="5" fill="${accent}"/></g>`
      return s
    }
    case 'explore': {
      if (/sea of thieves/.test(t)) return sun(sx, sy, 50, glow, 0.5) + clouds(rng, 5, '#fff', 0.5) + `<rect y="400" width="600" height="200" fill="${mid}"/>` + Array.from({ length: 10 }, () => `<path d="M${r(rng() * 600)} ${r(420 + rng() * 170)} q20 -10 40 0" stroke="#fff" stroke-width="3" fill="none" opacity=".5"/>`).join('') + `<g transform="translate(${fx(300)} 450)" fill="${near}"><path d="M-150 0 h300 l-40 50 h-220z"/><rect x="-6" y="-260" width="10" height="260"/><path d="M-100 -230 q90 -10 100 0 v120 q-50 -10 -100 0z M14 -220 q80 0 100 10 v100 q-50 -10 -100 0z" fill="#f0e8d0"/><path d="M-6 -260 l40 10 l-40 10z" fill="${accent}"/></g>`
      let s = sun(sx, sy, 50, glow, 0.5) + clouds(rng, 4, '#fff', 0.4) + ridge(rng, 420, 140, far, 35)
      s += `<g fill="${mid}" transform="translate(${fx(430)} 460)"><path d="M-100 0 h200 l-20 -40 h-160z"/><path d="M-70 -40 h140 l-20 -40 h-100z"/><path d="M-40 -80 h80 l-14 -40 h-52z"/><rect x="-14" y="-30" width="28" height="30" fill="${near}"/></g>`
      s += Array.from({ length: 14 }, () => `<path d="M${r(rng() * 600)} 0 q${r(rng() * 30 - 15)} ${r(150 + rng() * 150)} ${r(rng() * 10)} ${r(250 + rng() * 150)}" stroke="${near}" stroke-width="4" fill="none" opacity=".7"/>`).join('')
      return s + ridge(rng, 540, 30, near, 60) + FIG.wanderer(fx(170), 590, 1.1, f, near, accent)
    }
    case 'flying': return sun(sx, 130, 46, glow, 0.6) + clouds(rng, 6, '#fff', 0.85) + hills(rng, 520, 40, mid) + hills(rng, 560, 30, near) + `<g transform="translate(${fx(300)} 290) scale(${f ? -1.1 : 1.1} 1.1) rotate(-8)" fill="${/flight sim/.test(t) ? '#f6f8fb' : near}"><path d="M-150 0 q0 -12 26 -14 l220 -6 q44 2 52 20 q-8 16 -52 18 l-220 -4 q-26 -2 -26 -14z"/><path d="M-20 -12 l-60 -96 h30 l96 96z"/><path d="M-20 12 l-52 78 h26 l88 -78z"/><path d="M-132 -10 l-26 -52 h20 l38 50z"/></g><path d="M${fx(140)} 300 q-200 20 -240 60" stroke="#fff" stroke-width="5" opacity=".6" fill="none"/>`
    case 'racing': {
      let s = sun(fx(300), 330, 60, glow, 0.6) + ridge(rng, 360, 60, far, 50) + `<rect y="360" width="600" height="240" fill="${mid}"/>` + `<path d="M260 360 L340 360 L640 600 L-40 600Z" fill="${near}"/>`
      for (let i = 0; i < 6; i++) { const k = i / 6, k2 = (i + 0.5) / 6, y1 = 360 + 240 * k * k, y2 = 360 + 240 * k2 * k2; s += `<path d="M${r(300 - 2 - 8 * k)} ${r(y1)} L${r(300 + 2 + 8 * k)} ${r(y1)} L${r(300 + 2 + 8 * k2)} ${r(y2)} L${r(300 - 2 - 8 * k2)} ${r(y2)}Z" fill="${accent}"/>` }
      s += Array.from({ length: 10 }, () => `<path d="M${r(rng() * 600)} ${r(390 + rng() * 180)} h${r(70 + rng() * 120)}" stroke="${accent}" stroke-width="2" opacity=".5"/>`).join('')
      const color = pick(['#d6203a', '#f2f2f5', '#f5b700', '#1f6fe0', '#18a058', '#ff6a00'], hash(p.family))
      if (/motogp/.test(t)) return s + `<g transform="translate(300 540)"><ellipse cx="0" cy="0" rx="60" ry="20" fill="#000" opacity=".3"/><path d="M-60 -10 q0 -60 60 -70 q60 10 60 70z" fill="${color}"/><circle cx="0" cy="-90" r="26" fill="${color}"/><rect x="-20" y="-96" width="40" height="10" fill="#111"/></g>`
      if (/f1/.test(t)) return s + `<g transform="translate(300 540)"><rect x="-120" y="-30" width="240" height="14" fill="#111"/><path d="M-40 -16 L-20 -70 h40 L40 -16z" fill="${color}"/><rect x="-140" y="-46" width="60" height="50" rx="10" fill="#111"/><rect x="80" y="-46" width="60" height="50" rx="10" fill="#111"/><rect x="-60" y="-90" width="120" height="10" fill="${color}"/></g>`
      return s + `<g transform="translate(300 545) scale(1.15)"><path d="M-120 0 q2 -30 30 -38 q40 -40 90 -40 q50 0 90 40 q28 8 30 38z" fill="${color}"/><path d="M-60 -42 q30 -30 60 -30 q30 0 60 30z" fill="#0b1420" opacity=".85"/><rect x="-110" y="-20" width="34" height="10" fill="#ffefb0"/><rect x="76" y="-20" width="34" height="10" fill="#ffefb0"/><rect x="-120" y="-2" width="240" height="14" rx="4" fill="#111"/></g>`
    }
    case 'fighting': {
      let s = rays(300, 330, far, 22, 0.6) + sun(300, 330, 40, glow, 0.7)
      s += `<rect y="500" width="600" height="100" fill="${near}"/>`
      s += Array.from({ length: 18 }, () => `<circle cx="${r(300 + (rng() - 0.5) * 300)}" cy="${r(330 + (rng() - 0.5) * 260)}" r="${r(2 + rng() * 5)}" fill="${accent}" opacity=".8"/>`).join('')
      return s + FIG.fighter(190, 560, 1.05, false, '#050206', accent) + FIG.fighter(410, 560, 1.05, true, '#050206', glow)
    }
    case 'sport': {
      let s = stars(rng, 20)
      const sp = /nhl/.test(t) ? 'hockey' : /pga/.test(t) ? 'golf' : /madden|college football/.test(t) ? 'football' : /nba/.test(t) ? 'basketball' : /mlb/.test(t) ? 'baseball' : /tony hawk/.test(t) ? 'skate' : /wwe/.test(t) ? 'ring' : /rocket league/.test(t) ? 'carball' : /kayak/.test(t) ? 'water' : 'soccer'
      if (sp === 'golf') return sun(sx, 140, 50, '#fffbe0', 0.5) + `<rect width="600" height="600" fill="#7ac0f0" opacity=".9"/>` + hills(rng, 400, 50, '#3a8a3a') + hills(rng, 470, 40, '#58a848') + `<ellipse cx="${fx(400)}" cy="470" rx="150" ry="30" fill="#7acb5a"/><path d="M${fx(420)} 470 v-150" stroke="#eee" stroke-width="5"/><path d="M${fx(420)} 320 l${f ? -60 : 60} 18 l${f ? 60 : -60} 18z" fill="${accent === '#ffffff' ? '#e10600' : accent}"/>` + FIG.athlete(fx(170), 590, 1.0, f, '#0b1a10', '#fff')
      if (sp === 'hockey') return `<rect y="0" width="600" height="300" fill="${pal[0]}"/><rect y="300" width="600" height="300" fill="#e8f2fa"/><path d="M0 300 H600" stroke="#0a3a8a" stroke-width="10"/><path d="M300 300 V600" stroke="#c8102e" stroke-width="8"/><circle cx="300" cy="460" r="80" fill="none" stroke="#0a3a8a" stroke-width="5"/>` + stars(rng, 40) + FIG.athlete(fx(260), 560, 1.0, f, '#0a1430', accent) + `<ellipse cx="${fx(420)}" cy="560" rx="18" ry="7" fill="#111"/>`
      if (sp === 'water') return sun(sx, 140, 50, '#fff0c0', 0.6) + ridge(rng, 380, 80, far, 40) + `<rect y="380" width="600" height="220" fill="#1a6a9a"/>` + `<path d="M120 480 q180 -40 360 0 q-180 30 -360 0z" fill="${accent}"/><path d="M200 380 L420 540" stroke="#222" stroke-width="8"/>` + FIG.wanderer(300, 470, 0.4, false, '#0a1a24', accent)
      s += `<path d="M0 420 L600 420 L600 600 L0 600Z" fill="${sp === 'ring' ? '#e8e8ea' : sp === 'basketball' ? '#c8894a' : sp === 'skate' ? '#9aa4ae' : sp === 'baseball' ? '#b8744a' : mid}"/><path d="M0 420 L600 420 L600 444 L0 444Z" fill="${far}"/>`
      for (const x of [60, 540]) s += `<rect x="${x - 3}" y="200" width="6" height="220" fill="${far}"/><rect x="${x - 30}" y="186" width="60" height="22" rx="3" fill="#fff"/><circle cx="${x}" cy="197" r="110" fill="#fff" opacity=".08"/>`
      s += Array.from({ length: 100 }, (_, i) => `<circle cx="${i * 6}" cy="${r(408 + rng() * 10)}" r="${r(1 + rng() * 1.5)}" fill="${pal[2]}" opacity="${r(0.15 + rng() * 0.35)}"/>`).join('')
      if (sp === 'ring') s += [440, 470, 500].map(y => `<path d="M40 ${y - 80} H560" stroke="${accent === '#ffffff' ? '#e10600' : accent}" stroke-width="6"/>`).join('') + `<rect x="34" y="330" width="14" height="190" fill="#222"/><rect x="552" y="330" width="14" height="190" fill="#222"/>`
      if (sp === 'skate') s += `<path d="M0 420 Q0 600 150 600 H450 Q600 600 600 420" fill="#7a848e"/>`
      if (sp === 'carball') return s + `<circle cx="${fx(380)}" cy="300" r="90" fill="#f0f0f0"/><path d="M${fx(380) - 90} 300 h180 M${fx(380)} 210 v180" stroke="#888" stroke-width="5"/><g transform="translate(${fx(220)} 520) scale(${f ? -1 : 1} 1) rotate(-12)"><path d="M-90 0 l20 -40 h110 l40 20 l10 20z" fill="#1f6fe0"/><circle cx="-56" cy="6" r="22" fill="#111"/><circle cx="56" cy="6" r="22" fill="#111"/><path d="M-110 -20 l-60 -10 l-10 20z" fill="#ff8a00"/></g>`
      const ball = sp === 'football' ? `<g transform="translate(${fx(430)} 250) rotate(-28)"><ellipse rx="70" ry="42" fill="#7a3b1c"/><path d="M-26 0 H26" stroke="#fff" stroke-width="5"/>${[-16, -6, 4, 14].map(x => `<path d="M${x} -7 V7" stroke="#fff" stroke-width="4"/>`).join('')}</g>`
        : sp === 'basketball' ? `<g transform="translate(${fx(430)} 240)"><circle r="56" fill="#e2701f"/><path d="M-56 0 H56 M0 -56 V56 M-40 -40 Q0 0 -40 40 M40 -40 Q0 0 40 40" stroke="#2a1205" stroke-width="4" fill="none"/></g>`
        : sp === 'baseball' ? `<g transform="translate(${fx(430)} 240)"><circle r="46" fill="#f4f1ea"/><path d="M-26 -38 Q-4 0 -26 38 M26 -38 Q4 0 26 38" stroke="#d22" stroke-width="4" fill="none" stroke-dasharray="6 5"/></g>`
          : sp === 'soccer' ? `<g transform="translate(${fx(430)} 250)"><circle r="50" fill="#fafafa"/><path d="M0 -18 l17 12 l-7 20 h-20 l-7 -20z" fill="#111"/>${[0, 72, 144, 216, 288].map(a => `<path d="M0 -18 V-50" stroke="#111" stroke-width="3" transform="rotate(${a})"/>`).join('')}</g>` : ''
      return s + ball + FIG.athlete(fx(220), 590, 1.1, f, '#050a14', accent === '#ffffff' ? pal[1] : accent)
    }
    case 'sim': {
      let s = sun(sx, 120, 40, glow, 0.5) + clouds(rng, 4, '#fff', 0.9) + hills(rng, 430, 40, far) + `<path d="M0 470 Q300 420 600 470 V600 H0Z" fill="${mid}"/>`
      if (/zoo|jurassic/.test(t)) s += pines(rng, 470, near, 5, 0.9) + (/jurassic/.test(t) ? `<g transform="translate(${fx(330)} 520) scale(${f ? -1 : 1} 1)" fill="${near}"><path d="M-160 -60 q60 -40 140 -30 q40 -100 80 -150 q30 -10 40 10 l-10 20 q-30 0 -40 30 q-20 60 -20 120 q30 40 20 90 h-20 l-10 -60 l-40 0 l-10 60 h-20 l0 -60 q-60 0 -110 -30z"/></g>` : `<g transform="translate(${fx(380)} 530) scale(${f ? -1 : 1} 1)" fill="#e0a040"><path d="M-60 -80 h90 l10 -150 l20 -10 l20 6 l-8 14 l-14 0 l-10 140 l10 80 h-14 l-8 -60 l-60 0 l-8 60 h-14z"/>${[0, 1, 2, 3, 4, 5].map(i => `<circle cx="${-40 + (i % 3) * 30}" cy="${-70 + Math.floor(i / 3) * 0}" r="6" fill="#7a4a1a"/>`).join('')}</g>`)
      else if (/coaster/.test(t)) s += `<path d="M0 420 Q120 200 220 420 Q300 560 380 300 Q420 150 500 300 T600 360" stroke="${accent}" stroke-width="10" fill="none"/>` + Array.from({ length: 14 }, (_, i) => `<path d="M${20 + i * 42} 600 V${r(330 + rng() * 120)}" stroke="${near}" stroke-width="4"/>`).join('')
      else if (/farm|stardew/.test(t)) s += Array.from({ length: 8 }, (_, i) => `<path d="M${-80 + i * 100} 600 Q${300} 470 ${300 + (i - 3.5) * 10} 470" stroke="${near}" stroke-width="10" fill="none" opacity=".6"/>`).join('') + `<g transform="translate(${fx(430)} 470)"><rect x="-60" y="-60" width="120" height="70" fill="#b8352b"/><path d="M-72 -60 L0 -110 L72 -60Z" fill="#7a2420"/><rect x="-16" y="-30" width="32" height="40" fill="#f4e6c8"/></g>` + `<g transform="translate(${fx(200)} 540)"><rect x="-50" y="-50" width="70" height="40" fill="${accent}"/><rect x="0" y="-80" width="40" height="40" fill="${accent}"/><circle cx="-30" cy="-6" r="22" fill="#222"/><circle cx="30" cy="-2" r="26" fill="#222"/></g>`
      else if (/sims|powerwash/.test(t)) s += `<g transform="translate(${fx(300)} 500)"><rect x="-140" y="-120" width="280" height="130" fill="#f4efe6"/><path d="M-160 -120 L0 -220 L160 -120Z" fill="#5a6a8a"/>${[-100, -30, 40].map(x => `<rect x="${x}" y="-90" width="50" height="50" fill="#9ad0ff"/>`).join('')}<rect x="100" y="-70" width="30" height="80" fill="#8a5a3a"/></g>` + (/sims/.test(t) ? `<g transform="translate(${fx(300)} 150)"><path d="M0 -60 L30 0 L0 60 L-30 0Z" fill="#3ad24a"/><path d="M0 -60 L10 0 L0 60 L-30 0Z" fill="#fff" opacity=".3"/></g>` : `<path d="M${fx(520)} 560 L${fx(380)} 400" stroke="#3a3a3a" stroke-width="12"/><path d="M${fx(380)} 400 L${fx(250)} 300" stroke="#bfe8ff" stroke-width="18" opacity=".7"/>`)
      else s += Array.from({ length: 14 }, (_, i) => { const x = 20 + i * 42, h = 40 + rng() * 140; return `<rect x="${x}" y="${r(480 - h)}" width="34" height="${r(h)}" fill="${pick([far, near, '#f4efe6', accent], i + Math.floor(rng() * 4))}"/>` }).join('') + `<path d="M0 520 H600" stroke="#555" stroke-width="16"/>`
      return s
    }
    case 'toon': {
      let s = sun(sx, sy - 30, 46, glow, 0.6) + clouds(rng, 5, '#fff', 0.95)
      s += Array.from({ length: 3 }, (_, i) => { const x = 80 + i * 200 + rng() * 40, y = 200 + rng() * 140, w = 90 + rng() * 40; return `<g><ellipse cx="${r(x)}" cy="${r(y)}" rx="${r(w)}" ry="22" fill="${mid}"/><path d="M${r(x - w)} ${r(y)} q${r(w)} 90 ${r(w * 2)} 0z" fill="${near}"/></g>` }).join('')
      s += hills(rng, 520, 40, far) + hills(rng, 570, 26, mid)
      s += Array.from({ length: 6 }, () => `<path d="M0 -14 L4 -4 L14 -4 L6 3 L9 14 L0 7 L-9 14 L-6 3 L-14 -4 L-4 -4Z" fill="#ffd84a" transform="translate(${r(rng() * 580)} ${r(80 + rng() * 280)}) scale(${r(0.8 + rng())})"/>`).join('')
      const body = pick(['#f4f6fa', accent, '#ff8a2a', '#7a5af2'], hash(p.family))
      return s + FIG.mascot(fx(330 + rng() * 60), 580, 1.3, f, body, pick(['#3ad6ff', '#ffd400', '#ff5fa2'], hash(p.family) >> 3))
    }
    case 'bricks': {
      let s = ''
      for (let y = 0; y < 600; y += 60) for (let x = (y / 60) % 2 ? -50 : 0; x < 600; x += 100) { const c = pick([far, mid, near, accent, pal[0]], Math.floor(rng() * 5)); s += `<rect x="${x + 2}" y="${y + 2}" width="96" height="56" rx="4" fill="${c}" opacity=".9"/><circle cx="${x + 28}" cy="${y + 24}" r="12" fill="#fff" opacity=".18"/><circle cx="${x + 72}" cy="${y + 24}" r="12" fill="#fff" opacity=".18"/>` }
      return s + `<rect width="600" height="600" fill="#000" opacity=".25"/>` + FIG[/batman/.test(t) ? 'cape' : 'hero'](fx(320), 560, 1.0, f, '#111', pal[2])
    }
    case 'voxel': {
      let s = sun(sx, 120, 40, glow, 0.5) + clouds(rng, 4, '#fff', 0.9)
      for (let x = 0; x < 600; x += 40) { const h = 300 + Math.floor(rng() * 4) * 40; s += `<rect x="${x}" y="${h}" width="40" height="40" fill="${mid}"/><rect x="${x}" y="${h + 40}" width="40" height="${600 - h}" fill="${far}"/>`; for (let y = h + 40; y < 600; y += 40) s += `<rect x="${x}" y="${y}" width="40" height="40" fill="none" stroke="#000" stroke-opacity=".12"/>` }
      s += `<g transform="translate(${fx(420)} 220)"><rect x="-10" y="0" width="20" height="100" fill="#6a4a2a"/><rect x="-50" y="-60" width="100" height="70" fill="#3a8a2a"/></g>`
      return s + `<g transform="translate(${fx(200)} 300)"><rect x="-20" y="-120" width="40" height="40" fill="#c89a6a"/><rect x="-20" y="-80" width="40" height="50" fill="${accent === '#ffffff' ? '#3aa0d8' : accent}"/><rect x="-20" y="-30" width="40" height="30" fill="#3a3aa0"/></g>`
    }
    case 'music': {
      let s = rays(300, 300, far, 20, 0.5)
      if (/tetris/.test(t)) return s + Array.from({ length: 30 }, () => `<rect x="${Math.floor(rng() * 15) * 40}" y="${Math.floor(rng() * 15) * 40}" width="36" height="36" fill="${pick([accent, pal[2], '#ffd400', '#3aff6a'], Math.floor(rng() * 4))}" opacity="${r(0.4 + rng() * 0.6)}"/>`).join('')
      s += Array.from({ length: 16 }, (_, i) => { const h = 40 + rng() * 260; return `<rect x="${12 + i * 37}" y="${r(560 - h)}" width="24" height="${r(h)}" rx="12" fill="${i % 2 ? accent : pal[2]}" opacity=".75"/>` }).join('')
      if (/beat saber/.test(t)) s += `<path d="M120 520 L300 120" stroke="#ff2a4a" stroke-width="14" stroke-linecap="round"/><path d="M480 520 L300 120" stroke="#2a8aff" stroke-width="14" stroke-linecap="round"/>`
      return s + FIG.fighter(fx(300), 580, 1.0, f, '#050208', pal[2])
    }
  }
  return ''
}

// ---- title lockup ----
const FONTS = {
  serif: `'Trajan Pro','Cinzel','Optima',Georgia,'Times New Roman','Liberation Serif',serif`,
  sans: `'Helvetica Neue','SST','Inter','Arial','Liberation Sans',sans-serif`,
  cond: `'Bebas Neue','Impact','Haettenschweiler','Arial Narrow','Inter','Liberation Sans',sans-serif`,
  round: `'Arial Rounded MT Bold','Nunito','Varela Round','Inter','Liberation Sans',sans-serif`,
}
const STYLE = {
  samurai: { font: 'serif', weight: 600, upper: true, spacing: 6, color: '#fff', pos: 'bottom' },
  hero: { font: 'sans', weight: 900, upper: true, spacing: 0, color: '#fff', pos: 'top' },
  military: { font: 'cond', weight: 900, upper: true, spacing: 2, color: '#fff', pos: 'top' },
  space: { font: 'sans', weight: 800, upper: true, spacing: 8, color: '#fff', pos: 'top' },
  neon: { font: 'cond', weight: 900, upper: true, spacing: 4, color: 'accent', pos: 'top' },
  horror: { font: 'serif', weight: 400, upper: true, spacing: 8, color: '#f2efe6', pos: 'top' },
  fantasy: { font: 'serif', weight: 700, upper: true, spacing: 5, color: 'gold', pos: 'top' },
  anime: { font: 'sans', weight: 900, upper: true, spacing: 1, color: '#fff', pos: 'top', box: true },
  western: { font: 'serif', weight: 700, upper: true, spacing: 3, color: '#fff', pos: 'top' },
  wilds: { font: 'sans', weight: 700, upper: true, spacing: 5, color: '#fff', pos: 'top' },
  crime: { font: 'sans', weight: 900, upper: false, spacing: -1, color: '#fff', pos: 'top', italic: true },
  explore: { font: 'serif', weight: 700, upper: true, spacing: 3, color: 'gold', pos: 'top' },
  flying: { font: 'sans', weight: 800, upper: true, spacing: 4, color: '#fff', pos: 'top' },
  racing: { font: 'sans', weight: 900, upper: true, spacing: 0, color: '#fff', pos: 'top', italic: true },
  fighting: { font: 'cond', weight: 900, upper: true, spacing: 2, color: '#fff', pos: 'top' },
  sport: { font: 'cond', weight: 900, upper: true, spacing: 1, color: '#fff', pos: 'top' },
  sim: { font: 'round', weight: 800, upper: false, spacing: 0, color: '#fff', pos: 'top', box: true },
  toon: { font: 'round', weight: 900, upper: false, spacing: 0, color: '#fff', pos: 'top', outline: true },
  bricks: { font: 'round', weight: 900, upper: true, spacing: 0, color: '#fff', pos: 'top', outline: true },
  voxel: { font: 'cond', weight: 900, upper: true, spacing: 2, color: '#fff', pos: 'top', outline: true },
  music: { font: 'sans', weight: 900, upper: true, spacing: 3, color: 'accent', pos: 'top' },
}
function wrap(text, max) {
  const lines = []
  for (const w of text.split(/\s+/).filter(Boolean)) {
    const last = lines.length ? lines[lines.length - 1] : null
    if (last !== null && `${last} ${w}`.length <= max) lines[lines.length - 1] = `${last} ${w}`
    else lines.push(w)
  }
  return lines
}
function splitTitle(name) {
  const clean = name.replace(/[®™]/g, '').replace(/\s*\(PlayStation5\)/i, '').trim()
  const m = /^(.*?)(?::\s+|\s+[–-]\s+)(.+)$/.exec(clean)
  if (m && m[1].length >= 3) return { main: m[1], sub: m[2] }
  return { main: clean, sub: '' }
}
function lockup(p, name, world, pal, kicker) {
  const st = STYLE[world.theme] || STYLE.fantasy
  const color = st.color === 'accent' ? pal[6] : st.color === 'gold' ? '#f2d58a' : st.color
  const { main, sub } = splitTitle(name)
  const text = st.upper ? main.toUpperCase() : main
  // Conservative glyph widths (the fallback fonts are wide); spacing is added per letter.
  const cw = st.upper ? (st.font === 'serif' ? 0.76 : st.weight >= 800 ? 0.74 : 0.7) : 0.6
  const lines = wrap(text, text.length > 24 ? 14 : text.length > 12 ? 11 : 12).slice(0, 4)
  const longest = Math.max(...lines.map(l => l.length))
  const size = Math.max(30, Math.min(st.font === 'cond' ? 104 : 92, (520 - longest * st.spacing) / (longest * cw)))
  const subLines = sub ? wrap((st.upper ? sub.toUpperCase() : sub), 28).slice(0, 2) : []
  const subSize = Math.max(18, Math.min(30, size * 0.32))
  const font = FONTS[st.font]
  const attrs = `font-family="${font}" text-anchor="middle"`
  const outline = st.outline ? ` stroke="#1a1a2a" stroke-width="${r(size * 0.09)}" paint-order="stroke" stroke-linejoin="round"` : ` style="paint-order:stroke" stroke="#000" stroke-opacity=".3" stroke-width="2"`
  const subH = subLines.length ? subSize * 1.35 + (subLines.length - 1) * (subSize + 6) : 0
  // Bottom lockups end above the platform chips the store overlays on the bottom-left of each tile.
  let y = st.pos === 'bottom' ? 494 - subH - (lines.length - 1) * size * 0.98 : (p.originalPrice > p.price ? 112 : 84) + size * 0.8 + (kicker ? 34 : 0)
  let out = ''
  if (kicker) out += `<text x="300" y="${r(y - size * 0.8 - 14)}" ${attrs} font-size="${kicker.length > 24 ? 20 : 25}" font-weight="700" letter-spacing="2" fill="#f2d58a"${outline}>${esc(kicker.toUpperCase())}</text>`
  const top = y - size * 0.8
  for (const l of lines) {
    const est = l.length * (size * cw + st.spacing)
    out += `<text x="300" y="${r(y)}" ${attrs} font-size="${r(size)}" font-weight="${st.weight}" letter-spacing="${st.spacing}"${st.italic ? ' font-style="italic"' : ''} fill="${color}"${outline}${est > 540 ? ' textLength="540" lengthAdjust="spacingAndGlyphs"' : ''}>${esc(l)}</text>`
    y += size * 0.98
  }
  y += subSize * 1.35 - size * 0.98
  for (const l of subLines) { out += `<text x="300" y="${r(y)}" ${attrs} font-size="${r(subSize)}" font-weight="600" letter-spacing="3" fill="#fff"${l.length * subSize * 0.72 > 540 ? ' textLength="540" lengthAdjust="spacingAndGlyphs"' : ''}${outline}>${esc(l)}</text>`; y += subSize + 6 }
  const bottom = y
  let plate = ''
  if (st.box) plate = `<rect x="${r(300 - Math.min(270, longest * size * cw / 2 + 30))}" y="${r(top - 18)}" width="${r(Math.min(540, longest * size * cw + 60))}" height="${r(bottom - top + 6)}" fill="${pal[5]}" opacity=".55" rx="${world.theme === 'sim' ? 18 : 0}"/>`
  const shade = st.pos === 'bottom'
    ? `<rect y="${r(top - 80)}" width="600" height="${r(680 - top)}" fill="url(#shadeB)"/>`
    : `<rect width="600" height="${r(Math.min(420, bottom + 90))}" fill="url(#shadeT)"/>`
  return shade + plate + out
}

export function keyArtSvg(p, view = 0) {
  const world = worldOf(p)
  const fam = p.family || p.title
  const options = PALETTES[world.theme] || PALETTES.fantasy
  // Screenshots 2 and 3 move to another time of day / colour grade of the same world.
  const pal = options[((hash(fam) >>> 4) + (view >= 2 ? view - 1 : 0)) % options.length]
  const rng = rngOf(hash(`${fam}:${view}`))
  const flipped = (hash(fam) >>> 9) % 2 === 1 ? view % 2 === 0 : view % 2 === 1
  const currency = p.contentType === 'consumable'
  let body = scene(p, world, pal, rng, view, flipped)
  // Screenshot 2 is a closer shot of the same scene, framed on the lower half where the figures stand.
  if (view === 2) body = `<g transform="translate(${flipped ? -300 : -150} -300) scale(1.75)">${body}</g>`
  if (currency && view === 0) body = `<g opacity=".55">${body}</g>` + [0, 1, 2].map(k => { const x = 190 + k * 110, n = 3 + ((hash(p.id) >> k) % 4), base = 470 - (k === 1 ? 26 : 0); let s = ''; for (let i = 0; i < n; i++) s += `<ellipse cx="${x}" cy="${base - i * 16}" rx="54" ry="18" fill="#e9b23a" stroke="#7a5208" stroke-width="3"/>`; return s + `<ellipse cx="${x}" cy="${base - n * 16}" rx="54" ry="18" fill="#ffd76a" stroke="#7a5208" stroke-width="3"/><ellipse cx="${x}" cy="${base - n * 16}" rx="34" ry="10" fill="none" stroke="#c98f1a" stroke-width="4"/>` }).join('')
  let title = ''
  if (view === 0) {
    const edition = (p.type === 'PREMIUM EDITION' || p.type === 'GAME BUNDLE') && p.editionName && p.editionName !== 'Standard Edition'
    const name = currency ? p.title.split(' - ').at(-1).replace(/^.*?:\s*/, '') : p.contentType === 'add-on' ? p.title : edition && p.title.endsWith(p.editionName) ? p.title.slice(0, -p.editionName.length).trim() : p.title
    const kicker = currency && name !== p.title ? p.title.split(' - ')[0].replace(/[®™]/g, '').replace(/:.*$/, '') : edition ? p.editionName : ''
    title = lockup(p, name, world, pal, kicker)
  }
  const label = `${p.title}${view === 0 ? '' : ' artwork'}`
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600" role="img" aria-label="${esc(label)}">
<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${pal[0]}"/><stop offset=".7" stop-color="${pal[1]}"/><stop offset="1" stop-color="${pal[3]}"/></linearGradient>
<radialGradient id="vig" cx=".5" cy=".45" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".5"/></radialGradient>
<linearGradient id="shadeT" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".7"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>
<linearGradient id="shadeB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".7"/></linearGradient></defs>
<rect width="600" height="600" fill="url(#sky)"/>${body}<rect width="600" height="600" fill="url(#vig)"/>${title}
</svg>`
}
