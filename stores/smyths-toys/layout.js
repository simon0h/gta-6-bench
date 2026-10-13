import { esc, disclaimer } from '../../lib/html.js'
import { topDepartments, MENU, categoryByCode } from './site-data.js'

// Site chrome modelled on www.smythstoys.com/uk/en-gb (captured 2026-10-13): rotating promo strip,
// utility links (My orders, Store finder, UK (£)), logo + search + Wishlist/Basket row, department
// menu, and the three-column footer (Customer Information, Help & FAQ, Our payment methods).
const ICONS = {
  account: '<circle cx="12" cy="7.5" r="4"/><path d="M4 21v-1.5a8 8 0 0 1 16 0V21"/>',
  heart: '<path d="M12 20.5 4.2 12.9A4.9 4.9 0 0 1 12 6.6a4.9 4.9 0 0 1 7.8 6.3Z"/>',
  basket: '<path d="M3 9h18l-1.8 11H4.8ZM7.5 9 12 3l4.5 6M9 13v4m6-4v4"/>',
  pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/>',
  box: '<path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5Z"/><path d="m3 7.5 9 4.5 9-4.5M12 12v9"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/>',
  menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18"/>',
}
export const icon = name => `<svg class="st-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</g></svg>`

export const logo = `<svg class="st-logo-svg" viewBox="0 0 168 56" role="img" aria-label="Smyths Toys Superstores"><defs><radialGradient id="st-star" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#fbea07"/><stop offset="1" stop-color="#fdcd0c"/></radialGradient></defs><circle cx="146" cy="16" r="12" fill="url(#st-star)" stroke="#ecbc09" stroke-width="1.5"/><path d="m146 8 2.4 5 5.4.6-4 3.7 1.1 5.3-4.9-2.7-4.9 2.7 1.1-5.3-4-3.7 5.4-.6Z" fill="#fff" opacity=".85"/><text x="2" y="34" font-family="'Arial Rounded MT Bold','Trebuchet MS',Arial,sans-serif" font-size="34" font-weight="900" fill="#ed1c24" letter-spacing="-1">Smyths</text><text x="4" y="51" font-family="Arial,sans-serif" font-size="12.5" font-weight="700" fill="#231f20" letter-spacing=".2">TOYS SUPERSTORES</text></svg>`

const PAYMENT_BADGES = ['Visa', 'Mastercard', 'American Express', 'PayPal', 'Apple Pay', 'Google Pay']

export function chrome({ base, staticBase, title, body, qty, user, branch, query }) {
  const L = (path, text, attrs = '') => `<a href="${base}${path}"${attrs}>${text}</a>`
  const deptLinks = d => (MENU[d.department] || []).map(code => categoryByCode(code)).filter(Boolean)
  const drop = d => `<div class="st-drop"><div class="st-drop-inner"><p class="st-drop-title">${L(d.path, `Shop all ${esc(d.label)}`)}</p><div class="st-drop-grid">${deptLinks(d).map(c => L(c.path, esc(c.label))).join('')}</div></div></div>`
  const deptNav = topDepartments.map(d => `<li class="st-dept">${L(d.path, esc(d.label), ' class="st-dept-link"')}${drop(d)}</li>`).join('')
  const drawer = topDepartments.map(d => `<details><summary>${esc(d.label)}</summary>${L(d.path, `Shop all ${esc(d.label)}`, ' class="st-all"')}${deptLinks(d).map(c => L(c.path, esc(c.label))).join('')}</details>`).join('')
  const col = (heading, links) => `<section class="st-fcol"><h2>${heading}</h2><ul>${links.map(([t, p]) => `<li>${L(p, t)}</li>`).join('')}</ul></section>`
  const branchName = branch ? (branch === 'beckton' ? 'Beckton' : 'Salford') : ''
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)} | Smyths Toys UK</title><link rel="stylesheet" href="${staticBase}/static/style.css"><link rel="stylesheet" href="${staticBase}/static/site.css"><script src="${staticBase}/static/shop.js" defer></script></head><body class="st-body"><a class="skip-link" href="#main">Skip to main content</a>
<div class="st-promo" role="region" aria-label="Offers"><div class="st-promo-track"><span>FREE DELIVERY ON ORDERS OVER £20*</span><span>ORDER BY 10PM FOR NEXT DAY DELIVERY*</span><span>FREE CLICK &amp; COLLECT WITHIN 2 HOURS*</span></div></div>
<div class="st-utility"><div class="st-wrap"><p class="st-utility-msg">Welcome to Smyths Toys Superstores</p><ul class="st-utility-links"><li>${L('/my-account/orders', `${icon('box')}<span>My orders</span>`)}</li><li>${L('/storefinder', `${icon('pin')}<span>Store finder${branchName ? `: ${branchName}` : ''}</span>`)}</li><li><span class="st-region" title="Switch region">${icon('globe')}<span>UK (£)</span></span></li></ul></div></div>
<header class="st-header"><div class="st-wrap st-header-row"><details class="st-drawer department-menu"><summary aria-label="Open menu">${icon('menu')}<span>Menu</span></summary><div class="st-drawer-panel"><p class="st-drawer-title">Shop by department</p>${drawer}${L('/gift-finder-hub', 'Gift Finder', ' class="st-all"')}${L('/video-games', 'Video Games', ' class="st-all"')}${L('/in-store-events', 'In-store events', ' class="st-all"')}${L('/storefinder', 'Store finder', ' class="st-all"')}${L('/help', 'Help centre', ' class="st-all"')}</div></details><a class="st-logo" href="${base}" aria-label="Smyths Toys Superstores home">${logo}<span class="sr-only">Smyths Toys Superstores</span></a><form action="${base}/search" method="get" class="st-search" role="search"><label class="sr-only" for="search">Search</label><input id="search" name="text" value="${esc(query)}" type="search" placeholder="What are you looking for?" autocomplete="off" list="search-ideas"><button aria-label="Search">${icon('search')}</button><datalist id="search-ideas"><option value="LEGO"><option value="Barbie"><option value="scooter"><option value="board games"><option value="gta 6"></datalist></form><ul class="st-actions"><li>${L(user ? '/my-account' : '/login', `${icon('account')}<span>${user ? 'My account' : 'Sign in'}</span>`)}</li><li>${L('/wishlist', `${icon('heart')}<span>Wishlist</span>`)}</li><li>${L('/cart', `${icon('basket')}<span>Basket</span><b class="st-count" aria-label="${qty} items">${qty}</b>`, ' class="st-basket"')}</li></ul></div>
<nav class="st-depts" aria-label="Departments"><ul class="st-wrap">${deptNav}<li class="st-dept">${L('/gift-finder-hub', 'Gift Finder', ' class="st-dept-link"')}</li><li class="st-dept">${L('/gaming-and-tech/pre-order-games/c/SM060403', 'Pre-Order Games', ' class="st-dept-link"')}</li><li class="st-dept st-dept-end">${L('/toys/great-value-toys/c/SM060108', 'Great Value Toys', ' class="st-dept-link"')}</li></ul></nav></header>
<main id="main" class="st-main">${body}</main>
<footer class="st-footer"><div class="st-wrap st-fcols">${col('Customer Information', [['Request a catalogue', '/request-a-catalogue'], ['Gift cards', '/giftcardtype'], ['About us', '/about-us'], ['In-store events', '/in-store-events'], ['Charity partners', '/charity-partners'], ['Careers', '/careers']])}${col('Help &amp; FAQ', [['Help centre', '/help'], ['Returns', '/returns'], ['Shipping &amp; delivery', '/shipping-and-delivery'], ['Right of withdrawal', '/guest-lookup']])}<section class="st-fcol"><h2>Our payment methods</h2><ul class="st-pay">${PAYMENT_BADGES.map(p => `<li>${p}</li>`).join('')}</ul><p class="st-region-foot">${icon('globe')} UK (£)</p></section></div>
<div class="st-legal"><div class="st-wrap"><ul><li><span class="st-cookie">Cookie preferences</span></li><li>${L('/cookies-policy', 'Cookie policy')}</li><li>${L('/privacy-policy', 'Privacy policy')}</li><li>${L('/terms-and-policies', 'Terms &amp; policies')}</li><li>${L('/accessibility', 'Accessibility')}</li><li>${L('/transparency-statement', 'Transparency statement')}</li><li>${L('/sitemap', 'Site map')}</li></ul><p>© 2026 Smyths Toys Superstores</p></div></div>${disclaimer('Smyths Toys Superstores')}</footer></body></html>`
}
