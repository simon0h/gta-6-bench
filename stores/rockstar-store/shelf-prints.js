// Artwork printed on the store's apparel pictures, and the faces of the digital Shark Cards / Gold Bars.
// The shared garment renderer draws a plain garment; every Rockstar tee is a graphic tee, so without a print a whole
// row of "Logo Tee", "Goodtime State Tee" and "Burger Shot Tee" reads as the same blank shirt. The print is picked
// from the product title and drawn on the chest of the main (front) picture only.
import { esc } from '../../lib/html.js'

const PINK = '#f45ca5', ORANGE = '#ffa24c', YELLOW = '#fcaf17', RED = '#c8102e', GREEN = '#6fbf5a', TEAL = '#2fb3b3'
const hash = s => [...s].reduce((n, c) => (n * 31 + c.charCodeAt(0)) >>> 0, 7)
const lum = hex => { const m = /^#?([0-9a-f]{6})$/i.exec(hex || ''); if (!m) return 0; const n = parseInt(m[1], 16); return ((n >> 16) * 0.299 + ((n >> 8) & 255) * 0.587 + (n & 255) * 0.114) / 255 }
const font = extra => `${/font-family/.test(extra) ? '' : 'font-family="Arial Black, Helvetica Neue, Arial, sans-serif"'} ${/font-weight/.test(extra) ? '' : 'font-weight="900"'}`
const t = (x, y, size, fill, text, extra = '') => `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" text-anchor="middle" ${font(extra)} ${extra}>${esc(text)}</text>`
const fit = (text, width, max) => Math.min(max, Math.floor(width / Math.max(1, text.length * 0.62)))

// Each design is drawn around (0,0), roughly 170 wide.
function rockstarLogo(ink, garment) {
  const box = lum(garment) > 0.6 ? '#1d1d1f' : YELLOW
  const letter = lum(box) > 0.5 ? '#1d1d1f' : '#f4f2ec'
  return `<rect x="-52" y="-52" width="104" height="104" rx="18" fill="${box}"/>${t(-8, 30, 84, letter, 'R', 'font-style="italic"')}<path d="M31 -30l5 11 12 1-9 8 3 12-11-6-11 6 3-12-9-8 12-1z" fill="${letter}"/>`
}
function viLogo(ink) {
  return `<defs><linearGradient id="vi-grad" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${PINK}"/><stop offset="1" stop-color="${ORANGE}"/></linearGradient></defs>${t(0, -46, 15, ink, 'GRAND THEFT AUTO', 'letter-spacing="2"')}<g fill="url(#vi-grad)" stroke="${ink}" stroke-width="3" stroke-linejoin="round"><path d="M-70 -34h30l22 66 22-66h30l-38 96h-28z"/><rect x="40" y="-34" width="28" height="96"/></g>`
}
function sunset(ink, garment, top, bottom, label, sub) {
  const stripes = [0, 1, 2, 3].map(i => `<rect x="-60" y="${4 + i * 12}" width="120" height="${3 + i}" fill="${garment}"/>`).join('')
  return `<defs><linearGradient id="sun" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient><clipPath id="sun-c"><circle r="52" cy="-8"/></clipPath></defs><g clip-path="url(#sun-c)"><rect x="-60" y="-60" width="120" height="110" fill="url(#sun)"/>${stripes}</g>${t(0, 72, fit(label, 200, 22), ink, label)}${sub ? t(0, 92, 12, ink, sub, 'letter-spacing="3"') : ''}`
}
function gator(ink) {
  return `<path d="M-80 18q30-34 90-30l40-16q20-4 30 10l-24 14 26 6q-6 16-32 14l-36 4q-50 14-94-2z" fill="${GREEN}" stroke="${ink}" stroke-width="3"/><circle cx="34" cy="-24" r="6" fill="#fff"/><circle cx="35" cy="-24" r="3" fill="#111"/><path d="M-10 4l6 8 6-8 6 8 6-8 6 8 6-8" stroke="#fff" stroke-width="3" fill="none"/>${t(0, 66, 30, ink, 'MACCA')}${t(0, 86, 11, ink, 'THE GATOR', 'letter-spacing="4"')}`
}
function scene(ink, a, b, label) {
  return `<defs><linearGradient id="scene" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect x="-76" y="-62" width="152" height="112" fill="url(#scene)" stroke="${ink}" stroke-width="3"/><circle cx="34" cy="-22" r="18" fill="#ffe08a" opacity=".9"/><path d="M-76 50v-34h14v-22h12v16h16v-30h14v40h12v-18h18v26h14v-12h14v34z" fill="#1d1d2b" opacity=".85"/><path d="M-50 50q4-30 16-46M-34 4q-14-6-26 2M-34 4q-2-12 10-18" stroke="#1d1d2b" stroke-width="4" fill="none"/>${label ? t(0, 80, fit(label, 190, 20), ink, label) : ''}`
}
function wanted(ink) {
  return `<rect x="-58" y="-74" width="116" height="150" fill="#e9dcc0" stroke="#5a4630" stroke-width="3"/>${t(0, -44, 26, '#3a2a1a', 'WANTED')}<rect x="-34" y="-34" width="68" height="62" fill="#b8a27c"/><circle cx="0" cy="-12" r="16" fill="#5a4630"/><path d="M-26 28q26-34 52 0z" fill="#5a4630"/>${t(0, 46, 12, '#3a2a1a', 'DEAD OR ALIVE')}${t(0, 64, 13, RED, '$5,000')}`
}
function redDead(ink, wordmark) {
  return `${t(0, -24, 26, ink, 'RED DEAD')}${t(0, 4, 20, ink, 'REDEMPTION', 'letter-spacing="1"')}${wordmark ? '' : t(0, 58, 52, RED, 'II')}`
}
function gtaV(ink) {
  return `${t(0, -40, 15, ink, 'GRAND THEFT AUTO', 'letter-spacing="2"')}<path d="M-46 -26h26l20 64 20-64h26l-34 96h-24z" fill="${GREEN}" stroke="${ink}" stroke-width="2"/>`
}
function badge(ink, garment, name, sub, color) {
  const words = name.toUpperCase().split(/\s+/)
  const lines = words.length > 2 ? [words.slice(0, Math.ceil(words.length / 2)).join(' '), words.slice(Math.ceil(words.length / 2)).join(' ')] : [words.join(' ')]
  const size = Math.min(...lines.map(l => fit(l, 150, 30)))
  const fill = lum(color) > 0.5 ? '#1d1d1f' : '#fff'
  return `<circle r="62" cy="-4" fill="${color}" stroke="${ink}" stroke-width="4"/>${lines.map((l, i) => t(0, -4 + (i - (lines.length - 1) / 2) * size * 1.05 + size * 0.36, size, fill, l)).join('')}${sub ? t(0, 84, 12, ink, sub, 'letter-spacing="3"') : ''}`
}
function wordmark(ink, text, color) {
  const words = text.toUpperCase().split(/\s+/)
  const lines = words.length > 2 ? [words.slice(0, Math.ceil(words.length / 2)).join(' '), words.slice(Math.ceil(words.length / 2)).join(' ')] : [words.join(' ')]
  const size = Math.min(...lines.map(l => fit(l, 180, 34)))
  return `${lines.map((l, i) => t(0, (i - (lines.length - 1) / 2) * size * 1.1 + size * 0.36, size, i === 0 ? ink : color, l)).join('')}<rect x="-60" y="${lines.length * size * 0.6 + 6}" width="120" height="5" fill="${color}"/>`
}

const BRANDS = [
  [/Burger Shot/, 'Burger Shot', 'LOS SANTOS', ORANGE], [/Cluckin/, 'Cluckin’ Bell', 'TASTE THE CLUCK', YELLOW], [/Sprunk/, 'Sprunk', 'THE ESSENCE OF LIFE', '#3fae49'],
  [/eCola/, 'eCola', 'DELICIOUSLY INFECTIOUS', RED], [/Pi(ß|ss)wasser/, 'Pißwasser', 'ICH BIN EIN BIER', '#d9a520'], [/Up-n-Atom/, 'Up-n-Atom', 'BURGERS', '#e8452c'],
  [/Los Santos Customs/, 'Los Santos Customs', 'EST. LS', '#2f6fb5'], [/Merryweather/, 'Merryweather', 'SECURITY CONSULTING', '#5d6146'], [/Diamond Casino/, 'The Diamond', 'CASINO & RESORT', '#b9a46a'],
  [/Cayo Perico/, 'Cayo Perico', 'HEIST', TEAL], [/Tuners/, 'LS Car Meet', 'TUNERS', '#7a4fd1'], [/Vinewood/, 'Vinewood', 'LOS SANTOS', '#efe6cf'],
  [/Chop/, 'Chop', 'GOOD BOY', '#6b4a32'], [/Grove Street/, 'Grove Street', 'SAN ANDREAS', '#2e7d32'], [/Malibu Club/, 'Malibu Club', 'VICE CITY', PINK],
  [/Kaufman Cabs/, 'Kaufman Cabs', 'VICE CITY', YELLOW], [/Liberty City/, 'Liberty City', 'GRAND THEFT AUTO IV', '#9fb3c8'], [/LAPD/, 'LAPD', 'L.A. NOIRE', '#c9a13b'],
  [/Bullworth/, 'Bullworth', 'ACADEMY', '#1f2f4d'], [/Coney Island/, 'Warriors', 'CONEY ISLAND', '#a92729'], [/Van der Linde/, 'Van der Linde', 'GANG', '#6b4a32'],
  [/Saint Denis/, 'Saint Denis', 'RED DEAD REDEMPTION 2', '#2a5d6b'], [/Wildlife/, 'Wildlife', 'RED DEAD REDEMPTION 2', '#5c7a3a'], [/Frontier Pursuits/, 'Frontier', 'PURSUITS', '#9e7656'],
  [/John Marston/, 'John Marston', 'RED DEAD REDEMPTION', '#8a5a2b'], [/Undead Nightmare/, 'Undead', 'NIGHTMARE', '#5b6b4a'], [/Arthur Morgan/, 'Arthur Morgan', 'RED DEAD REDEMPTION 2', '#7a1f1f'],
  [/Max Payne Logo/, 'Max Payne', '', '#b8b8b8'], [/Linocut/, 'Rockstar', 'LINOCUT', YELLOW],
]
const SCENES = [[/Vice City/, PINK, ORANGE], [/San Andreas/, '#e8a23c', '#7a4b2a'], [/Grand Theft Auto III/, '#8aa0b8', '#2d3640'], [/Max Payne/, '#d9c27a', '#4a3a28'],
  [/Midnight Club/, '#3a2a6b', '#e0529c'], [/Manhunt/, '#5a1a1a', '#1a1a1a'], [/Jason and Lucia|Key Art/, PINK, '#4a2d7a']]

// Returns { svg, scale, dx, dy } or null for no print.
export function apparelPrint(p, garment) {
  const title = p.title
  if (/Flannel|Bandana|Socks|Towel|Blanket/.test(title)) return null
  const ink = lum(garment) > 0.6 ? '#1d1d1f' : '#f4f2ec'
  const small = /Baby Logo|Pocket|Polo|Jacket|Wool Cap|Beanie|Snapback|Cap|Hat\b/.test(title)
  let svg
  if (/Rockstar/.test(title) && /Logo|Long Sleeve|Camo|Varsity|Coach|Track|Beanie|Snapback|Cap|Hat\b/.test(title) && !/Linocut/.test(title)) svg = rockstarLogo(ink, garment)
  else if (/Goodtime State/.test(title)) svg = sunset(ink, garment, ORANGE, PINK, 'THE GOODTIME STATE', 'LEONIDA')
  else if (/Macca/.test(title)) svg = gator(ink)
  else if (/Leonida Keys/.test(title)) svg = sunset(ink, garment, '#7fd3e6', TEAL, 'LEONIDA KEYS', '')
  else if (/Grand Theft Auto VI/.test(title) && /Vice City/.test(title)) svg = `${t(0, 10, 50, PINK, 'Vice City', 'font-style="italic" font-family="Brush Script MT, Segoe Script, cursive" font-weight="700"')}${t(0, 42, 12, ink, 'GRAND THEFT AUTO VI', 'letter-spacing="3"')}`
  else if (/Grand Theft Auto VI|Grand Theft Auto VI Logo/.test(title) && !/Key Art/.test(title)) svg = viLogo(ink)
  else if (/Wanted Poster/.test(title)) svg = wanted(ink)
  else if (/Red Dead Redemption 2 (Logo|Wool)/.test(title)) svg = redDead(ink, false)
  else if (/Grand Theft Auto V (Logo|Hoodie)|Grand Theft Auto V Chrome/.test(title)) svg = gtaV(ink)
  else {
    const scene_ = /Screenshot|Key Art/.test(title) && SCENES.find(([re]) => re.test(title))
    const brand = BRANDS.find(([re]) => re.test(title))
    if (scene_) svg = scene(ink, scene_[1], scene_[2], /Key Art/.test(title) ? 'JASON & LUCIA' : '')
    else if (brand) svg = badge(ink, garment, brand[1], brand[2], brand[3])
    else {
      const name = title.replace(/^(Black|Blue|Pink|White|Grey|Red|Yellow|Camo)\s+/, '').replace(/\b(Tee|Hoodie|Crewneck|Long Sleeve|Jacket|Shirt|Polo)\b/g, '').replace(/Grand Theft Auto/g, 'GTA').trim()
      svg = wordmark(ink, name, [PINK, ORANGE, TEAL, YELLOW, GREEN][hash(title) % 5])
    }
  }
  return { svg, small }
}

// Where the chest sits in the renderer's 640x600 garment drawing (inside its own transform group).
const CHEST = { tee: [320, 262, 0.62], crewneck: [320, 270, 0.6], hoodie: [320, 236, 0.5], cap: [318, 238, 0.42] }
export function withPrint(svg, p, shape, garment) {
  if (!CHEST[shape] || !svg.includes('data-asset-object="apparel"')) return svg
  const print = apparelPrint(p, garment)
  let out = svg
  // The hoodie's kangaroo pocket is drawn in a random accent color; make it read as the same fabric.
  if (shape === 'hoodie') out = out.replace(/(<rect [^>]*rx="12" )fill="hsl\([^"]*\)"/, '$1fill="#000" fill-opacity=".16" stroke="#000" stroke-opacity=".25" stroke-width="2"')
  if (!print) return out
  let [cx, cy, s] = CHEST[shape]
  if (print.small && shape !== 'cap') { cx += 52; cy -= 26; s *= 0.42 }
  const group = `<g data-print="chest" transform="translate(${cx} ${cy}) scale(${s})">${print.svg}</g>`
  const at = out.lastIndexOf('</g></g></g><text')
  return at < 0 ? out : out.slice(0, at) + group + out.slice(at)
}

// ---------- in-game currency: Shark Cards and Gold Bars ----------
const SHARK_VALUE = { megalodon: '8,000,000', whale: '3,500,000', 'great-white': '1,250,000', bull: '500,000', tiger: '200,000' }
const SHARK_COLOR = { megalodon: ['#0b1d3a', '#c9a227'], whale: ['#0d3b5c', '#4fb3e8'], 'great-white': ['#1b2b36', '#9fc4d6'], bull: ['#13361f', '#4fbf6b'], tiger: ['#3b1d0b', '#e88a2c'] }
const sharkPath = 'M-150 10q60-58 150-56l40-42 12 46q48 8 92 40l34-34-6 52 6 52-34-34q-44 32-92 40l-12 46-40-42q-90 2-150-56z'
function cardFrame(view, inner) {
  // view 0: straight-on; 1: tilted; 2: back of the card; 3: close-up of the value.
  const tilt = view === 1 ? 'rotate(-8 320 280)' : ''
  return `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="600" viewBox="0 0 640 600" role="img"><rect width="640" height="600" fill="#f5f4f0"/><ellipse cx="320" cy="470" rx="220" ry="16" fill="#b9b7b0" opacity=".25"/><g transform="${tilt}">${inner}</g></svg>`
}
export function currencySvg(p, view = 0) {
  const shark = /Shark Cash Card/.test(p.title)
  const pack = /Starter Pack/.test(p.title)
  if (shark || pack) {
    const key = pack ? 'whale' : Object.keys(SHARK_VALUE).find(k => p.id.includes(k)) || 'tiger'
    const [bg, accent] = pack ? ['#1d1d1f', YELLOW] : SHARK_COLOR[key]
    const name = pack ? 'CRIMINAL ENTERPRISE' : p.title.replace(/ Cash Card.*$/, '').toUpperCase()
    const value = pack ? '1,000,000' : SHARK_VALUE[key]
    if (view === 2) return cardFrame(view, `<rect x="110" y="140" width="420" height="270" rx="16" fill="${bg}"/><rect x="110" y="180" width="420" height="40" fill="#111"/>${t(320, 270, 18, '#fff', 'GRAND THEFT AUTO ONLINE')}${t(320, 300, 13, '#cfd8dc', pack ? 'STARTER PACK · PC' : 'SHARK CASH CARD · PC', 'font-weight="400"')}<text x="320" y="350" font-size="12" fill="#cfd8dc" text-anchor="middle" font-family="Arial, sans-serif">GTA$ is credited to the Rockstar Games account used at checkout.</text><text x="320" y="370" font-size="12" fill="#cfd8dc" text-anchor="middle" font-family="Arial, sans-serif">Requires Grand Theft Auto V for PC.</text>`)
    const zoom = view === 3 ? 'translate(320 280) scale(1.45) translate(-320 -280)' : ''
    return cardFrame(view, `<g transform="${zoom}"><defs><linearGradient id="card-bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${bg}"/><stop offset="1" stop-color="${accent}" stop-opacity=".55"/></linearGradient></defs><rect x="110" y="140" width="420" height="270" rx="16" fill="url(#card-bg)" stroke="${accent}" stroke-width="3"/><g transform="translate(330 270) scale(.82)" fill="${accent}" opacity=".9">${pack ? `<rect x="-120" y="-60" width="240" height="120" rx="10" fill="none" stroke="${accent}" stroke-width="8"/><path d="M-60 -20h120v40h-120z"/>` : `<path d="${sharkPath}"/><circle cx="-92" cy="-6" r="6" fill="${bg}"/>`}</g><rect x="132" y="160" width="40" height="40" rx="7" fill="${YELLOW}"/>${t(150, 191, 26, '#1d1d1f', 'R', 'font-style="italic"')}${t(330, 192, 15, '#fff', 'GRAND THEFT AUTO ONLINE', 'letter-spacing="2"')}${t(320, 372, 30, '#fff', `GTA$${value}`)}${t(320, 396, 14, accent, pack ? 'STARTER PACK' : `${name} CARD`, 'letter-spacing="2"')}</g>`)
  }
  const bars = Number((p.title.match(/^(\d+)/) || [])[1] || 25)
  const stack = Math.min(9, Math.max(2, Math.round(Math.log2(bars) * 1.3)))
  const ingot = (x, y) => `<path d="M${x} ${y}l16-34h92l16 34z" fill="#d9a520" stroke="#8a6410" stroke-width="2"/><path d="M${x + 16} ${y - 34}l8-10h76l8 10z" fill="#f2c94c" stroke="#8a6410" stroke-width="2"/>`
  const pile = Array.from({ length: stack }, (_, i) => { const row = i < 4 ? 0 : i < 7 ? 1 : 2, col = i < 4 ? i : i < 7 ? i - 4 : i - 7; return ingot(178 + col * 76 + row * 38, 360 - row * 44) }).join('')
  if (view === 2) return cardFrame(view, `<rect x="110" y="140" width="420" height="270" rx="16" fill="#2b0d0d"/>${t(320, 250, 22, '#e9dcc0', 'RED DEAD ONLINE')}${t(320, 284, 14, '#e9dcc0', 'GOLD BARS · PC', 'font-weight="400"')}<text x="320" y="330" font-size="12" fill="#e9dcc0" text-anchor="middle" font-family="Arial, sans-serif">Gold Bars are credited to the Rockstar Games account used at checkout.</text>`)
  const zoom = view === 3 ? 'translate(320 280) scale(1.35) translate(-320 -280)' : ''
  return cardFrame(view, `<g transform="${zoom}"><rect x="110" y="140" width="420" height="270" rx="16" fill="#4a1414" stroke="#d9a520" stroke-width="3"/>${t(320, 186, 20, '#e9dcc0', 'RED DEAD ONLINE', 'letter-spacing="3"')}${pile}${t(320, 396, 26, '#f2c94c', `${bars} GOLD BARS`)}</g>`)
}
