// Hero and card artwork for xbox.com-style marketing pages. xbox.com fills these spots with product
// photography and game key art; the store draws original illustrations instead (no real photos or logos):
// the Series X|S consoles, a wireless controller, gift cards, and collages of the store's own game covers.
import { CATALOG as PRODUCTS } from './data.js'

const ART_ROOT = '/xbox-store/shelf-art'
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

// ---- devices ----
const controllerBody = (fill, shade, accent = '#3a3d42') => `
  <path d="M96 36c18-10 52-14 74-6l4 6h52l4-6c22-8 56-4 74 6l-6 14H102z" fill="${shade}"/>
  <path d="M70 60C95 38 150 36 180 48h40c30-12 85-10 110 12 30 26 52 112 48 156-3 34-34 46-58 24l-36-38c-10-10-20-14-34-14H150c-14 0-24 4-34 14l-36 38c-24 22-55 10-58-24-4-44 18-130 48-156z" fill="${fill}"/>
  <path d="M70 60C95 38 150 36 180 48h40c30-12 85-10 110 12 9 8 17 21 24 37-40-24-90-30-154-30S86 73 46 97c7-16 15-29 24-37z" fill="#fff" opacity=".07"/>
  <circle cx="200" cy="78" r="15" fill="${accent}"/><circle cx="200" cy="78" r="10" fill="none" stroke="#fff" stroke-opacity=".75" stroke-width="2.4"/>
  <circle cx="122" cy="104" r="25" fill="${shade}"/><circle cx="122" cy="104" r="17" fill="${accent}"/><circle cx="122" cy="104" r="11" fill="none" stroke="#fff" stroke-opacity=".12" stroke-width="2"/>
  <circle cx="246" cy="150" r="25" fill="${shade}"/><circle cx="246" cy="150" r="17" fill="${accent}"/><circle cx="246" cy="150" r="11" fill="none" stroke="#fff" stroke-opacity=".12" stroke-width="2"/>
  <circle cx="158" cy="150" r="23" fill="${shade}"/><path d="M151 134h14v9h9v14h-9v9h-14v-9h-9v-14h9z" fill="${accent}"/>
  <g stroke="${shade}" stroke-width="2"><circle cx="292" cy="78" r="11" fill="#e8b520"/><circle cx="270" cy="100" r="11" fill="#2f74d0"/><circle cx="314" cy="100" r="11" fill="#d7362f"/><circle cx="292" cy="122" r="11" fill="#5bb33a"/></g>
  <rect x="170" y="104" width="12" height="7" rx="3.5" fill="${accent}"/><rect x="218" y="104" width="12" height="7" rx="3.5" fill="${accent}"/><circle cx="200" cy="112" r="4" fill="${accent}"/>`
export function controllerSvg({ fill = '#1f2124', shade = '#121315', accent = '#3a3d42', label = 'Xbox Wireless Controller' } = {}) {
  return `<svg class="xs-art-svg" viewBox="0 0 400 270" role="img" aria-label="${esc(label)}"><ellipse cx="200" cy="258" rx="150" ry="9" fill="#000" opacity=".28"/>${controllerBody(fill, shade, accent)}</svg>`
}

function seriesX(x = 0, y = 0) {
  return `<g transform="translate(${x} ${y})">
  <path d="M180 26l50-24v280l-50 26z" fill="#141518"/>
  <path d="M0 26L50 2h180l-50 24z" fill="#1b1c1f"/>
  <ellipse cx="115" cy="14" rx="62" ry="10" fill="#060707"/>
  <ellipse cx="115" cy="14" rx="54" ry="7.5" fill="url(#xsVent)"/>
  <path d="M75 14h80M85 10h60M85 18h60" stroke="#0a0a0a" stroke-width="1.6" stroke-dasharray="2 3"/>
  <rect x="0" y="26" width="180" height="282" fill="url(#xsFront)"/>
  <circle cx="18" cy="44" r="6" fill="none" stroke="#e9e9e9" stroke-width="2"/><path d="M14 40l8 8M22 40l-8 8" stroke="#e9e9e9" stroke-width="1.6"/>
  <rect x="20" y="246" width="96" height="3" rx="1.5" fill="#050505"/>
  <circle cx="150" cy="270" r="3" fill="#2a2c30"/>
  <rect x="160" y="286" width="12" height="5" rx="1.5" fill="#050505"/></g>`
}
function seriesS(x = 0, y = 0) {
  // Standing Series S: the narrow front carries the power button and USB port, the wide side panel the round black vent.
  return `<g transform="translate(${x} ${y})">
  <path d="M58 35L128 0v250l-70 35z" fill="#d6d8db"/>
  <g transform="matrix(1 -.5 0 1 0 0)"><ellipse cx="93" cy="132" rx="25" ry="29" fill="#141516"/><ellipse cx="93" cy="132" rx="18" ry="21" fill="none" stroke="#2e3034" stroke-width="2.2" stroke-dasharray="1.5 3"/></g>
  <path d="M0 35L70 0h58L58 35z" fill="#f6f6f7"/>
  <rect x="0" y="35" width="58" height="250" fill="url(#xsWhite)"/>
  <circle cx="13" cy="50" r="4.5" fill="none" stroke="#9a9ca0" stroke-width="1.6"/>
  <rect x="10" y="258" width="14" height="5" rx="1.5" fill="#2a2c30"/></g>`
}
const consoleDefs = `<defs>
  <linearGradient id="xsFront" x1="0" x2="1"><stop offset="0" stop-color="#26282c"/><stop offset=".55" stop-color="#18191c"/><stop offset="1" stop-color="#101113"/></linearGradient>
  <linearGradient id="xsWhite" x1="0" x2="1"><stop offset="0" stop-color="#fbfbfb"/><stop offset="1" stop-color="#e3e4e6"/></linearGradient>
  <radialGradient id="xsVent"><stop offset="0" stop-color="#9bf00b" stop-opacity=".9"/><stop offset=".6" stop-color="#107c10" stop-opacity=".75"/><stop offset="1" stop-color="#0b3d12"/></radialGradient></defs>`
export function consolesSvg({ controller = true } = {}) {
  return `<svg class="xs-art-svg" viewBox="0 0 470 ${controller ? 480 : 420}" role="img" aria-label="Xbox Series X and Xbox Series S consoles">${consoleDefs}
  <ellipse cx="235" cy="398" rx="215" ry="16" fill="#000" opacity=".35"/>${seriesX(30, 64)}${seriesS(300, 112)}
  ${controller ? `<g transform="translate(96 330) scale(.55)">${controllerBody('#f2f2f3', '#cfd0d3', '#b9bbbf')}</g>` : ''}</svg>`
}
export const seriesXSvg = () => `<svg class="xs-art-svg" viewBox="0 0 270 390" role="img" aria-label="Xbox Series X">${consoleDefs}<ellipse cx="125" cy="376" rx="120" ry="10" fill="#000" opacity=".3"/>${seriesX(10, 50)}</svg>`
export const seriesSSvg = () => `<svg class="xs-art-svg" viewBox="0 0 160 320" role="img" aria-label="Xbox Series S">${consoleDefs}<ellipse cx="78" cy="300" rx="72" ry="7" fill="#000" opacity=".3"/>${seriesS(14, 16)}</svg>`

export function giftCardsSvg() {
  const card = (x, y, rot, fill, text, value) => `<g transform="translate(${x} ${y}) rotate(${rot})"><rect width="250" height="158" rx="12" fill="${fill}"/><rect width="250" height="158" rx="12" fill="url(#xsGcShine)"/>
    <circle cx="36" cy="36" r="15" fill="none" stroke="${text}" stroke-width="3"/><path d="M27 27l18 18M45 27L27 45" stroke="${text}" stroke-width="2.6" stroke-linecap="round"/>
    <text x="60" y="44" fill="${text}" font-family="'Segoe UI',Arial,sans-serif" font-weight="700" font-size="22" letter-spacing="1">XBOX</text>
    <text x="226" y="138" text-anchor="end" fill="${text}" font-family="'Segoe UI',Arial,sans-serif" font-weight="600" font-size="34">${value}</text></g>`
  return `<svg class="xs-art-svg" viewBox="0 0 420 330" role="img" aria-label="Xbox gift cards"><defs><linearGradient id="xsGcShine" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>
  ${card(20, 90, -12, '#0e0f10', '#fff', '$25')}${card(150, 30, 8, '#ffffff', '#107c10', '$100')}${card(95, 140, -2, '#107c10', '#fff', '$50')}</svg>`
}

// ---- game covers ----
const isGta = p => p.family === 'gta-vi' || /grand theft auto vi\b/i.test(p.title)
export function coverPicks(filter = () => true, n = 9) {
  return PRODUCTS.filter(p => p.shelf && (p.type === 'game') && p.price >= 0 && !isGta(p) && filter(p))
    .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))
    .filter(function (p) { const k = p.title.split(/[:(–]/)[0].trim().toLowerCase(); return this.has(k) ? false : this.add(k) }, new Set()).slice(0, n)
}
export function coverCollage(list, cls = '') {
  return `<div class="xs-collage ${cls}" aria-hidden="true">${list.map(p => `<img src="${ART_ROOT}/${esc(p.id)}/0.svg" alt="" loading="lazy">`).join('')}</div>`
}

// ---- hero art for editorial pages, picked from the page's own heading ----
export function heroArt(pg) {
  const t = `${pg.eyebrow || ''} ${pg.h1 || ''}`.toLowerCase()
  if (/gift card/.test(t)) return `<div class="xs-hero-pic">${giftCardsSvg()}</div>`
  if (/accessor|controller|design lab|gear/.test(t)) return `<div class="xs-hero-pic xs-hero-pic-ctrl">${controllerSvg({ fill: '#f2f2f3', shade: '#cfd0d3', accent: '#b9bbbf' })}</div>`
  if (/series s\b/.test(t)) return `<div class="xs-hero-pic">${seriesSSvg()}</div>`
  if (/series x\b(?!\|)/.test(t)) return `<div class="xs-hero-pic">${seriesXSvg()}</div>`
  if (/console|devices|retailer|where to buy/.test(t)) return `<div class="xs-hero-pic">${consolesSvg()}</div>`
  if (/deal|sale|special/.test(t)) return coverCollage(coverPicks(p => p.listPrice > p.price, 9), 'xs-collage-hero')
  if (/^\s*games\b|game pass|play anywhere|free-to-play|optimized|backward|handheld|cloud/.test(t)) return coverCollage(coverPicks(() => true, 9), 'xs-collage-hero')
  return ''
}

// ---- card art: the picture xbox.com puts on each promo card, drawn from what the card is about ----
const ICONS = {
  controller: 'M14 20c4-4 10-5 14-3h8c4-2 10-1 14 3 4 5 7 17 6 23-1 4-5 6-8 3l-5-5c-1-1-3-2-5-2H26c-2 0-4 1-5 2l-5 5c-3 3-7 1-8-3-1-6 2-18 6-23z M22 28v6 M19 31h6 M42 29h.1 M46 33h.1',
  console: 'M22 10h20v44H22z M27 16h.1 M28 46h8',
  gift: 'M12 26h40v26H12z M10 18h44v8H10z M32 18v34 M32 18c-4-8-14-8-12-1 1 3 8 2 12 1 4 1 11 2 12-1 2-7-8-7-12 1',
  box: 'M10 20l22-10 22 10v26L32 56 10 46z M10 20l22 10 22-10 M32 30v26',
  truck: 'M6 18h30v24H6z M36 26h12l8 8v8H36z M16 46a4 4 0 1 0 0 .1 M46 46a4 4 0 1 0 0 .1',
  return: 'M20 24h22a12 12 0 0 1 0 24H24 M28 14L18 24l10 10',
  card: 'M8 16h48v32H8z M8 24h48 M14 40h12',
  cloud: 'M20 46h26a10 10 0 0 0 0-20 14 14 0 0 0-27-3 12 12 0 0 0 1 23z',
  pc: 'M8 12h48v30H8z M24 52h16 M32 42v10',
  phone: 'M22 6h20v52H22z M30 52h4',
  tv: 'M6 12h52v32H6z M22 52h20',
  family: 'M22 24a6 6 0 1 0 0-.1 M42 24a6 6 0 1 0 0-.1 M10 50c0-8 6-14 12-14s12 6 12 14 M30 50c0-8 6-14 12-14s12 6 12 14',
  library: 'M8 10h14v14H8z M26 10h14v14H26z M44 10h12v14H44z M8 28h14v14H8z M26 28h14v14H26z M8 46h14v10H8z',
  person: 'M32 30a10 10 0 1 0 0-.1 M14 56c0-10 8-18 18-18s18 8 18 18',
  help: 'M32 56a24 24 0 1 0 0-48 24 24 0 0 0 0 48z M24 26a8 8 0 1 1 11 7c-2 1-3 3-3 5v2 M32 46h.1',
  access: 'M32 14a4 4 0 1 0 0-.1 M14 22l18 4 18-4 M32 26v12 M24 54l8-16 8 16',
  star: 'M32 8l7 15 16 2-12 11 3 16-14-8-14 8 3-16L9 25l16-2z',
  news: 'M10 12h36v40H10z M46 20h8v26a6 6 0 0 1-6 6 M16 20h24 M16 28h24 M16 36h16',
  leaf: 'M14 50C14 26 30 12 52 12c0 22-14 38-38 38z M14 50l20-20',
  shield: 'M32 8l20 8v14c0 12-8 22-20 26-12-4-20-14-20-26V16z',
  code: 'M24 20L12 32l12 12 M40 20l12 12-12 12 M36 14l-8 36',
  globe: 'M32 56a24 24 0 1 0 0-48 24 24 0 0 0 0 48z M8 32h48 M32 8c-8 8-8 40 0 48 M32 8c8 8 8 40 0 48',
  bolt: 'M36 6L14 36h16l-4 22 22-30H32z',
  headset: 'M12 40v-8a20 20 0 0 1 40 0v8 M12 38h8v14h-8z M44 38h8v14h-8z M48 52c0 4-6 6-12 6',
  storage: 'M12 16h40v32H12z M12 36h40 M44 42h.1',
}
const ICON_RULES = [
  [/series x|series s|console|xbox one/, 'console'], [/controller|elite|adaptive|design lab|gear up|accessor/, 'controller'], [/headset|audio/, 'headset'], [/storage|drive/, 'storage'],
  [/gift|trade in/, 'gift'], [/deliver|shipping|ship/, 'truck'], [/order|track/, 'box'], [/return|refund/, 'return'], [/pay|billing|price|sleigh|redeem|code/, 'card'],
  [/cloud|stream/, 'cloud'], [/\bpc\b|windows|developer|designed for/, 'pc'], [/handheld|mobile|phone/, 'phone'], [/\btvs?\b|smart tv/, 'tv'],
  [/family|kids|parent|safety/, 'family'], [/accessib|everyone/, 'access'], [/reward|achievement/, 'star'], [/news|wire|blog/, 'news'],
  [/sustain|eco/, 'leaf'], [/privacy|security|standard|legal|terms/, 'shield'], [/account|profile|sign|friends|social/, 'person'], [/help|support|faq|question|status/, 'help'],
  [/quick resume|fast|speed|load|optimized|dashboard/, 'bolt'], [/language|region|country/, 'globe'],
  [/game|play|library|pass|studio|fanfest|community|anniversary/, 'library'],
]
export function cardArt(card) {
  const t = `${card.h || ''} ${card.text || ''}`.toLowerCase()
  const h = String(card.h || '').toLowerCase()
  if (/^xbox series x\b/.test(h)) return `<div class="xs-card-art xs-card-art-dev" aria-hidden="true">${seriesXSvg()}</div>`
  if (/^xbox series s\b/.test(h)) return `<div class="xs-card-art xs-card-art-dev" aria-hidden="true">${seriesSSvg()}</div>`
  // Specific subjects win over the generic games/play match, first from the heading, then from the card text.
  const specific = ICON_RULES.slice(0, -1)
  const key = (specific.find(([re]) => re.test(h)) || specific.find(([re]) => re.test(t)) || [null, 'library'])[1]
  return `<div class="xs-card-art" aria-hidden="true"><svg class="xs-card-icon" viewBox="0 0 64 64"><path d="${ICONS[key]}"/></svg></div>`
}
