// Locally drawn artwork for the assortment (no downloaded images). Digital content gets square
// key-art tiles (a scene for the game's world and a title lockup, see key-art.js), PS Plus gets its black-and-gold tier card,
// and PlayStation Direct hardware gets a simple product illustration on a light studio backdrop.
import { keyArtSvg } from './key-art.js'
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
const svg = (body, bg) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600" role="img">${bg}${body}</svg>`

// Games, add-ons and in-game currency use the per-title key art in key-art.js.

function plusArt(p, view) {
  const tierColor = { Essential: '#f5c400', Extra: '#f5c400', Premium: '#f5c400' }[p.tier]
  const shade = { Essential: '#151515', Extra: '#1d1a12', Premium: '#231c05' }[p.tier]
  const plus = `<path d="M300 140 h50 v95 h95 v50 h-95 v95 h-50 v-95 h-95 v-50 h95z" fill="${tierColor}" transform="translate(${view ? 0 : 0} ${view ? 30 : 0})"/>`
  return svg(`${plus}<text x="300" y="${view ? 560 : 470}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="44" fill="#fff">PlayStation Plus</text>${view ? '' : `<text x="300" y="520" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="34" fill="${tierColor}">${esc(p.tier.toUpperCase())} · ${p.months} MONTH${p.months > 1 ? 'S' : ''}</text>`}`, `<rect width="600" height="600" fill="${shade}"/><circle cx="300" cy="260" r="210" fill="#fff" opacity=".04"/>`)
}

// ---- hardware illustrations ----
const COLORS = { white: ['#f3f4f6', '#1b1d22'], black: ['#25272c', '#0f1013'], red: ['#b3262e', '#1b1d22'], blue: ['#1e4fa8', '#1b1d22'], pink: ['#f2a7c3', '#f3f4f6'], purple: ['#4c3a8c', '#1b1d22'], silver: ['#c7cdd3', '#1b1d22'], teal: ['#3aa6a4', '#123c3c'], indigo: ['#3b3f9e', '#171a4a'], gold: ['#cfa64a', '#1b1d22'] }
const STROKE = '#2b2f36'
function controller(color, edge = false) {
  const [body, center] = COLORS[color] || COLORS.white
  const mid = center
  const sides = body
  const pad = color === 'white' || color === 'pink' ? '#f3f4f6' : center
  return `<g transform="translate(0 30)">
<path d="M120 260 C120 210 160 190 205 190 L395 190 C440 190 480 210 480 260 L520 410 C532 456 500 480 470 470 C445 462 430 430 410 400 L190 400 C170 430 155 462 130 470 C100 480 68 456 80 410Z" fill="${sides}" stroke="${STROKE}" stroke-width="4"/>
<path d="M190 200 L410 200 C430 200 445 215 445 240 L430 360 C425 385 400 395 380 395 L220 395 C200 395 175 385 170 360 L155 240 C155 215 170 200 190 200Z" fill="${mid}" stroke="${STROKE}" stroke-width="3"/>
<rect x="235" y="205" width="130" height="80" rx="14" fill="${pad}" stroke="${STROKE}" stroke-width="3"/>
<circle cx="245" cy="345" r="30" fill="#1b1d22"/><circle cx="355" cy="345" r="30" fill="#1b1d22"/><circle cx="245" cy="345" r="18" fill="#3a3d44"/><circle cx="355" cy="345" r="18" fill="#3a3d44"/>
<path d="M150 255 h20 v-20 h18 v20 h20 v18 h-20 v20 h-18 v-20 h-20z" fill="${color === 'white' ? '#cfd3d9' : '#e6e8eb'}"/>
${[[425, 232], [452, 258], [425, 284], [398, 258]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="13" fill="none" stroke="${color === 'white' ? '#cfd3d9' : '#e6e8eb'}" stroke-width="4"/>`).join('')}
<rect x="270" y="372" width="60" height="6" rx="3" fill="#5aa0ff"/>
${edge ? '<rect x="220" y="160" width="160" height="22" rx="8" fill="#1b1d22"/><path d="M196 400 l-14 34 M404 400 l14 34" stroke="#1b1d22" stroke-width="10" stroke-linecap="round"/>' : ''}
</g>`
}
function consoleArt(color, kind) {
  const pro = kind === 'console-pro', digital = kind === 'console-digital'
  return `<g transform="translate(0 0)"><ellipse cx="300" cy="540" rx="180" ry="18" fill="#000" opacity=".12"/>
<path d="M230 70 L300 80 L300 530 L235 520 C220 400 215 200 230 70Z" fill="#f3f4f6" stroke="${STROKE}" stroke-width="4"/>
<rect x="300" y="80" width="${pro ? 46 : 40}" height="450" fill="#1b1d22"/>
${pro ? [0, 1, 2].map(i => `<rect x="300" y="${250 + i * 26}" width="46" height="8" fill="#f3f4f6"/>`).join('') : ''}
<path d="M${pro ? 346 : 340} 80 L410 70 C425 200 420 400 405 520 L${pro ? 346 : 340} 530Z" fill="#f3f4f6" stroke="${STROKE}" stroke-width="4"/>
${digital || pro ? '' : '<rect x="242" y="300" width="6" height="140" rx="3" fill="#c8ccd2"/>'}
<circle cx="320" cy="470" r="4" fill="#5aa0ff"/></g>`
}
const HW = {
  console: (c) => consoleArt(c, 'console'), 'console-digital': (c) => consoleArt(c, 'console-digital'), 'console-pro': (c) => consoleArt(c, 'console-pro'),
  controller: (c) => controller(c), 'controller-edge': (c) => controller(c, true),
  access: () => `<circle cx="300" cy="300" r="190" fill="#f3f4f6" stroke="${STROKE}" stroke-width="4"/><circle cx="300" cy="300" r="70" fill="#1b1d22"/><circle cx="300" cy="300" r="40" fill="#3a3d44"/>${Array.from({ length: 8 }, (_, i) => { const a = i * Math.PI / 4; return `<circle cx="${300 + Math.cos(a) * 130}" cy="${300 + Math.sin(a) * 130}" r="34" fill="#e3e6ea" stroke="${STROKE}" stroke-width="3"/>` }).join('')}`,
  'stick-module': () => `<rect x="200" y="220" width="200" height="190" rx="24" fill="#1b1d22"/><circle cx="300" cy="300" r="60" fill="#3a3d44"/><circle cx="300" cy="300" r="34" fill="#55595f"/><rect x="230" y="380" width="140" height="14" rx="6" fill="#c7a046"/>`,
  headset: (c) => { const [b] = COLORS[c] || COLORS.white; return `<path d="M150 330 C150 120 450 120 450 330" fill="none" stroke="${b === '#f3f4f6' ? '#1b1d22' : b}" stroke-width="28" stroke-linecap="round"/><path d="M165 320 C170 170 430 170 435 320" fill="none" stroke="#3a3d44" stroke-width="8"/><rect x="110" y="300" width="100" height="170" rx="46" fill="${b}" stroke="${STROKE}" stroke-width="4"/><rect x="390" y="300" width="100" height="170" rx="46" fill="${b}" stroke="${STROKE}" stroke-width="4"/><rect x="140" y="320" width="44" height="130" rx="22" fill="#1b1d22"/><rect x="416" y="320" width="44" height="130" rx="22" fill="#1b1d22"/><path d="M150 460 C160 520 210 530 250 525" fill="none" stroke="#1b1d22" stroke-width="10" stroke-linecap="round"/>` },
  earbuds: () => `<rect x="170" y="300" width="260" height="170" rx="80" fill="#f3f4f6" stroke="${STROKE}" stroke-width="4"/><path d="M175 370 H425" stroke="#c8ccd2" stroke-width="4"/><circle cx="240" cy="230" r="55" fill="#f3f4f6" stroke="${STROKE}" stroke-width="4"/><circle cx="360" cy="230" r="55" fill="#f3f4f6" stroke="${STROKE}" stroke-width="4"/><circle cx="240" cy="230" r="22" fill="#1b1d22"/><circle cx="360" cy="230" r="22" fill="#1b1d22"/>`,
  portal: (c) => { const [b] = COLORS[c] || COLORS.white; const body = c === 'black' ? '#25272c' : '#f3f4f6'; return `<path d="M60 230 C60 200 80 190 110 190 L490 190 C520 190 540 200 540 230 L560 400 C565 440 530 450 510 440 L460 400 L140 400 L90 440 C70 450 35 440 40 400Z" fill="${body}" stroke="${STROKE}" stroke-width="4"/><rect x="155" y="185" width="290" height="190" rx="10" fill="#1b1d22"/><rect x="167" y="197" width="266" height="166" rx="4" fill="url(#scr)"/><defs><linearGradient id="scr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0b3c91"/><stop offset="1" stop-color="#2d7ff9"/></linearGradient></defs><circle cx="110" cy="340" r="22" fill="#1b1d22"/><circle cx="490" cy="340" r="22" fill="#1b1d22"/><path d="M90 250 h14 v-14 h12 v14 h14 v12 h-14 v14 h-12 v-14 h-14z" fill="#9aa0a8"/>${[[495, 245], [515, 265], [495, 285], [475, 265]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="8" fill="none" stroke="#9aa0a8" stroke-width="3"/>`).join('')}` },
  vr2: () => `<ellipse cx="300" cy="250" rx="190" ry="120" fill="none" stroke="#f3f4f6" stroke-width="40"/><ellipse cx="300" cy="250" rx="190" ry="120" fill="none" stroke="${STROKE}" stroke-width="3"/><path d="M160 230 C160 180 440 180 440 230 L430 330 C425 360 175 360 170 330Z" fill="#f3f4f6" stroke="${STROKE}" stroke-width="4"/><path d="M190 300 C230 330 370 330 410 300" fill="none" stroke="#1b1d22" stroke-width="22" stroke-linecap="round"/><circle cx="170" cy="470" r="60" fill="none" stroke="#f3f4f6" stroke-width="18"/><circle cx="430" cy="470" r="60" fill="none" stroke="#f3f4f6" stroke-width="18"/><circle cx="170" cy="470" r="60" fill="none" stroke="${STROKE}" stroke-width="2"/><circle cx="430" cy="470" r="60" fill="none" stroke="${STROKE}" stroke-width="2"/>`,
  charger: () => `<path d="M140 470 L460 470 L440 400 L160 400Z" fill="#f3f4f6" stroke="${STROKE}" stroke-width="4"/><rect x="150" y="460" width="300" height="24" rx="8" fill="#1b1d22"/><g transform="translate(70 120) scale(.5)">${controller('white')}</g><g transform="translate(250 120) scale(.5)">${controller('white')}</g>`,
  adapter: () => `<rect x="200" y="230" width="200" height="140" rx="20" fill="#25272c"/><circle cx="370" cy="260" r="8" fill="#5aa0ff"/><path d="M200 300 C120 300 120 420 60 430" fill="none" stroke="#1b1d22" stroke-width="12" stroke-linecap="round"/><path d="M400 300 C480 300 480 420 540 430" fill="none" stroke="#1b1d22" stroke-width="12" stroke-linecap="round"/>`,
  'disc-drive': () => `<path d="M160 120 L380 110 C420 230 420 400 380 500 L160 490Z" fill="#f3f4f6" stroke="${STROKE}" stroke-width="4"/><rect x="190" y="280" width="6" height="140" rx="3" fill="#c8ccd2"/><circle cx="300" cy="300" r="70" fill="none" stroke="#e1e4e8" stroke-width="4"/>`,
  stand: () => `<ellipse cx="300" cy="420" rx="170" ry="50" fill="#1b1d22"/><ellipse cx="300" cy="405" rx="170" ry="50" fill="#2f3238"/><rect x="270" y="260" width="60" height="150" rx="8" fill="#1b1d22"/>`,
  remote: () => `<rect x="250" y="80" width="100" height="440" rx="46" fill="#25272c"/><circle cx="300" cy="190" r="34" fill="none" stroke="#5a5e65" stroke-width="6"/>${[0, 1, 2, 3, 4, 5].map(i => `<circle cx="${280 + (i % 2) * 40}" cy="${270 + Math.floor(i / 2) * 50}" r="12" fill="#45484f"/>`).join('')}<rect x="270" y="440" width="60" height="30" rx="10" fill="#45484f"/>`,
  camera: () => `<rect x="120" y="250" width="360" height="100" rx="50" fill="#25272c"/><rect x="130" y="260" width="340" height="80" rx="40" fill="#f3f4f6" opacity=".12"/><circle cx="230" cy="300" r="30" fill="#0f1013"/><circle cx="370" cy="300" r="30" fill="#0f1013"/><circle cx="230" cy="300" r="12" fill="#2d5aa0"/><circle cx="370" cy="300" r="12" fill="#2d5aa0"/><rect x="270" y="350" width="60" height="80" fill="#1b1d22"/><rect x="220" y="430" width="160" height="24" rx="10" fill="#1b1d22"/>`,
  covers: (c) => { const [b] = COLORS[c] || COLORS.white; return `<path d="M150 80 L270 95 L270 520 L160 505 C140 380 135 200 150 80Z" fill="${b}" stroke="${STROKE}" stroke-width="4"/><path d="M330 95 L450 80 C465 200 460 380 440 505 L330 520Z" fill="${b}" stroke="${STROKE}" stroke-width="4"/>` },
  ssd: () => `<rect x="90" y="250" width="420" height="100" rx="8" fill="#1b1d22"/>${Array.from({ length: 12 }, (_, i) => `<rect x="${110 + i * 32}" y="258" width="18" height="84" rx="4" fill="#33363d"/>`).join('')}<rect x="90" y="350" width="420" height="16" fill="#2e7d32"/>${Array.from({ length: 20 }, (_, i) => `<rect x="${470 + (i % 2) * 6}" y="352" width="4" height="12" fill="#c7a046"/>`).slice(0, 4).join('')}`,
}
function hardwareArt(p, view) {
  const draw = HW[p.art] || HW.controller
  const t = view === 0 ? '' : view === 1 ? 'translate(600 0) scale(-1 1)' : view === 2 ? 'translate(-150 -150) scale(1.5)' : 'translate(75 75) scale(.75)'
  return svg(`<g transform="${t}">${draw(p.color)}</g>`, '<rect width="600" height="600" fill="#f5f6f8"/>')
}

// Hardware drawings for PlayStation.com page heroes (transparent background, sits on the blue band).
export function heroIllustration(kind, color = 'white') {
  const body = kind === 'plus'
    ? `<path d="M265 120 h70 v145 h145 v70 h-145 v145 h-70 v-145 h-145 v-70 h145z" fill="#f5c400"/><path d="M335 120 v145 h145 v70 h-145 v145 h-14 v-145 h-145 v-14 h145 v-145h14z" fill="#c99a00" opacity=".55"/>`
    : kind === 'giftcard'
      ? `<g transform="rotate(-8 300 300)"><rect x="90" y="170" width="400" height="250" rx="22" fill="#00439c" stroke="#fff" stroke-opacity=".5" stroke-width="3"/><rect x="90" y="170" width="400" height="250" rx="22" fill="url(#gc)"/><text x="120" y="226" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="700" fill="#fff">PlayStation Store</text><text x="466" y="236" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="46" font-weight="300" fill="#fff">$50</text></g><g transform="rotate(6 300 300) translate(90 10)"><rect x="150" y="300" width="320" height="200" rx="18" fill="#1f1f1f" stroke="#fff" stroke-opacity=".4" stroke-width="3"/><text x="176" y="346" font-family="Arial, Helvetica, sans-serif" font-size="21" font-weight="700" fill="#fff">PlayStation Store</text><text x="444" y="474" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="50" font-weight="300" fill="#fff">$25</text></g><defs><linearGradient id="gc" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1f8fe5" stop-opacity=".0"/><stop offset="1" stop-color="#1f8fe5" stop-opacity=".7"/></linearGradient></defs>`
      : (HW[kind] || HW.controller)(color)
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600" aria-hidden="true" focusable="false">${body}</svg>`
}

export function shelfArtSvg(p, view = 0) {
  const v = Math.max(0, Math.min(3, Number(view) || 0))
  if (p.department === 'hardware') return hardwareArt(p, v)
  if (p.contentType === 'subscription') return plusArt(p, v)
  return keyArtSvg(p, v)
}
export const shelfArtUrl = (p, view = 0) => `/playstation-store/shelf-art/${encodeURIComponent(p.id)}/${view}.svg`
export const shelfImg = (p, alt = p.title, view = 0) => `<img class="ps-shelf-img" src="${shelfArtUrl(p, view)}" alt="${esc(alt)}" width="600" height="600" loading="lazy" decoding="async">`
