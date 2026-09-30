import { PLATFORMS, EDITIONS } from './catalog.js'

// Placeholder cover art as inline SVG (no real artwork is used).
// Usage: <img src="/static/art/ps5-standard.svg"> or boxArtSvg('ps5','ultimate').
export function boxArtSvg(platform = 'ps5', edition = 'standard', { width = 300, height = 380 } = {}) {
  const band = platform === 'xbox' ? '#107c10' : '#0070d1'
  const bandText = platform === 'xbox' ? 'XBOX SERIES X|S' : 'PS5'
  const ed = EDITIONS[edition]?.name ?? 'Standard Edition'
  const pname = PLATFORMS[platform]?.name ?? platform
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 300 380" role="img" aria-label="Grand Theft Auto VI ${ed} for ${pname} box art placeholder">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff7ab6"/><stop offset=".5" stop-color="#ff9a5c"/><stop offset="1" stop-color="#7b3fe4"/></linearGradient></defs>
<rect width="300" height="380" fill="url(#g)"/>
<rect y="0" width="300" height="34" fill="${band}"/>
<text x="150" y="23" font-family="Arial,Helvetica,sans-serif" font-size="14" font-weight="700" fill="#fff" text-anchor="middle">${bandText}</text>
<text x="150" y="170" font-family="Impact,Arial Black,sans-serif" font-size="64" fill="#fff" text-anchor="middle" stroke="#000" stroke-width="2">GTA</text>
<text x="150" y="240" font-family="Impact,Arial Black,sans-serif" font-size="72" fill="#fff" text-anchor="middle" stroke="#000" stroke-width="2">VI</text>
<text x="150" y="290" font-family="Arial,Helvetica,sans-serif" font-size="16" font-weight="700" fill="#fff" text-anchor="middle">${ed.toUpperCase()}</text>
<text x="150" y="350" font-family="Arial,Helvetica,sans-serif" font-size="12" fill="#fff" text-anchor="middle">ROCKSTAR GAMES</text>
<rect x="8" y="356" width="36" height="18" rx="2" fill="#000"/><text x="26" y="369" font-family="Arial" font-size="11" font-weight="700" fill="#fff" text-anchor="middle">M</text>
</svg>`
}
