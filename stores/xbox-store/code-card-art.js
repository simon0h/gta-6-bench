// Store-drawn art for digital code products (Xbox gift cards and Game Pass membership codes). xbox.com shows
// these as the card itself on a coloured field; this draws an original card from the product's own data.
// View 0 is the front of the card, 1 the card at an angle, 2 the back with the code area, 3 a pair of cards.

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
const FONT = `'Segoe UI','Bahnschrift','Helvetica Neue',Arial,sans-serif`

export const drawsCodeCard = p => p?.type === 'gift-card'

function spec(p) {
  if (p.productType === 'membership-code' || /game pass/i.test(p.title)) {
    const plan = (/\b(ultimate|premium|essential)\b/i.exec(p.title)?.[1] || (/^pc game pass/i.test(p.title) ? 'PC' : 'Ultimate')).toUpperCase()
    const months = /(\d+)\s*month/i.exec(p.title)?.[1] || '1'
    const colors = { ULTIMATE: ['#0b0c0d', '#9bf00b'], PREMIUM: ['#0b0c0d', '#3ddc84'], ESSENTIAL: ['#0b0c0d', '#ffffff'], PC: ['#0b0c0d', '#b48cff'] }[plan]
    return { kind: 'gp', card: colors[0], ink: colors[1], field: ['#0f3d17', '#061208'], line1: plan === 'PC' ? 'PC GAME PASS' : 'GAME PASS', line2: plan === 'PC' ? '' : plan, foot: `${months} MONTH${months === '1' ? '' : 'S'}` }
  }
  const value = /\$\s?(\d+)/.exec(p.title)?.[1] || String(Math.round(p.price || 0))
  const card = { 10: '#ffffff', 25: '#0e0f10', 50: '#107c10', 100: '#0e0f10' }[value] || '#107c10'
  const ink = card === '#ffffff' ? '#107c10' : '#ffffff'
  return { kind: 'gift', card, ink, field: card === '#ffffff' ? ['#1d7a2a', '#0a2a10'] : ['#2c2f33', '#0c0d0e'], value: `$${value}` }
}

function front(s, w = 520, h = 330) {
  const mark = `<circle cx="58" cy="58" r="24" fill="none" stroke="${s.ink}" stroke-width="4.5"/><path d="M44 44l28 28M72 44L44 72" stroke="${s.ink}" stroke-width="4" stroke-linecap="round"/>`
  const brand = `<text x="96" y="70" fill="${s.ink}" font-family="${FONT}" font-weight="700" font-size="34" letter-spacing="2">XBOX</text>`
  const body = s.kind === 'gp'
    ? `<text x="40" y="${h - 118}" fill="${s.ink}" font-family="${FONT}" font-weight="800" font-size="58" letter-spacing="1">${esc(s.line1)}</text>${s.line2 ? `<text x="42" y="${h - 76}" fill="#fff" font-family="${FONT}" font-weight="600" font-size="30" letter-spacing="6">${esc(s.line2)}</text>` : ''}<text x="${w - 36}" y="${h - 32}" text-anchor="end" fill="#fff" fill-opacity=".85" font-family="${FONT}" font-weight="600" font-size="22" letter-spacing="3">${esc(s.foot)}</text>`
    : `<text x="40" y="${h - 36}" fill="${s.ink}" fill-opacity=".8" font-family="${FONT}" font-weight="600" font-size="20" letter-spacing="3">GIFT CARD</text><text x="${w - 36}" y="${h - 32}" text-anchor="end" fill="${s.ink}" font-family="${FONT}" font-weight="700" font-size="92">${esc(s.value)}</text>`
  return `<rect width="${w}" height="${h}" rx="22" fill="${s.card}"/><rect width="${w}" height="${h}" rx="22" fill="url(#ccShine)"/>${s.kind === 'gp' ? `<path d="M${w - 170} 0h148a22 22 0 0 1 22 22v120z" fill="${s.ink}" opacity=".9"/>` : ''}${mark}${brand}${body}`
}
function back(s, w = 520, h = 330) {
  const ink = s.card === '#ffffff' ? '#1b1b1b' : '#fff'
  return `<rect width="${w}" height="${h}" rx="22" fill="${s.card}"/><rect y="46" width="${w}" height="54" fill="#000" opacity=".55"/>
  <rect x="40" y="140" width="${w - 80}" height="64" rx="8" fill="#c9cbcf"/><rect x="40" y="140" width="${w - 80}" height="64" rx="8" fill="url(#ccScratch)"/>
  <text x="${w / 2}" y="181" text-anchor="middle" fill="#55585e" font-family="${FONT}" font-weight="600" font-size="20" letter-spacing="2">SCRATCH TO REVEAL CODE</text>
  <text x="40" y="250" fill="${ink}" fill-opacity=".8" font-family="${FONT}" font-size="17">Redeem at xbox.com/redeem</text>
  <text x="40" y="278" fill="${ink}" fill-opacity=".6" font-family="${FONT}" font-size="14">Valid only for U.S. Microsoft accounts. No expiration.</text>`
}

export function codeCardArt(p, view = 0) {
  const s = spec(p)
  const label = `${p.title}${view ? ' artwork' : ''}`
  const card = view === 2 ? back(s) : front(s)
  const placed = view === 1 ? `<g transform="translate(110 210) rotate(-14 260 165)">${card}</g>`
    : view === 3 ? `<g transform="translate(150 140) rotate(9 260 165)" opacity=".95">${back(s)}</g><g transform="translate(60 250) rotate(-6 260 165)">${front(s)}</g>`
      : `<g transform="translate(100 195)">${card}</g>`
  return `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="720" viewBox="0 0 720 720" role="img" aria-label="${esc(label)}"><title>${esc(label)}</title>
<defs><radialGradient id="ccField" cx=".5" cy=".42" r=".75"><stop offset="0" stop-color="${s.field[0]}"/><stop offset="1" stop-color="${s.field[1]}"/></radialGradient>
<linearGradient id="ccShine" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/></linearGradient>
<linearGradient id="ccScratch" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".25"/></linearGradient>
<filter id="ccShadow" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="22" stdDeviation="22" flood-color="#000" flood-opacity=".45"/></filter></defs>
<rect width="720" height="720" fill="url(#ccField)"/><g filter="url(#ccShadow)">${placed}</g></svg>`
}
