// Reference-mode chrome reproducing the live williams-sonoma.com header, department
// mega menus and footer (captured 2026-10-13). Links stay inside the store mount.
import { esc, disclaimer } from '../../lib/html.js'
import { brandBar, eventsServices, accountMenu, editorialNav, mainDepartments, footerColumns, legalLinks } from './site-data.js'

export const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${({
  account: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="9" r="2.5"/><path d="M7 17c0-5 10-5 10 0"/>',
  truck: '<path d="M2 5h12v13H2zM14 10h4l4 4v4h-8"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="19" r="2"/>',
  heart: '<path d="M12 20C-4 10 4-1 12 6c8-7 16 4 0 14Z"/>',
  cart: '<path d="m2 4 3 1 3 12h11l3-10H6"/><circle cx="9" cy="21" r="1"/><circle cx="18" cy="21" r="1"/>',
  search: '<circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/>',
  menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
  gift: '<rect x="3" y="9" width="18" height="12"/><path d="M3 13h18M12 9v12M12 9c-2-4-7-4-6-1s6 1 6 1c2-4 7-4 6-1s-6 1-6 1"/>',
  leaf: '<path d="M5 19c0-9 6-14 15-14 0 9-5 15-14 15"/><path d="M5 19 13 11"/>',
  phone: '<path d="M5 3h4l2 5-3 2a12 12 0 0 0 6 6l2-3 5 2v4a2 2 0 0 1-2 2A18 18 0 0 1 3 5a2 2 0 0 1 2-2"/>',
})[name] || ''}</svg>`

// Decorative line drawings used in place of retailer photography (none can be downloaded).
const MOTIFS = {
  pot: '<path d="M14 30h52v22a10 10 0 0 1-10 10H24a10 10 0 0 1-10-10z"/><path d="M8 30h64M30 30v-5a10 10 0 0 1 20 0v5M4 36h10M66 36h10"/>',
  pan: '<ellipse cx="34" cy="40" rx="24" ry="14"/><path d="M58 38l20-6"/><ellipse cx="34" cy="38" rx="16" ry="8"/>',
  knife: '<path d="M10 46 58 22c6-3 10 2 6 6L22 52z"/><path d="M22 52l-12 8M30 48l-4 4"/>',
  cup: '<path d="M18 26h36v18a16 16 0 0 1-16 16h-4a16 16 0 0 1-16-16z"/><path d="M54 32h6a7 7 0 0 1 0 14h-7M12 64h48M28 12c-3 4 3 6 0 10M38 12c-3 4 3 6 0 10"/>',
  whisk: '<path d="M40 70V44M40 44c-14-6-14-34 0-36 14 2 14 30 0 36zM40 44c-6-8-6-28 0-36M40 44c6-8 6-28 0-36"/>',
  plate: '<circle cx="40" cy="40" r="28"/><circle cx="40" cy="40" r="18"/><path d="M6 20v14a4 4 0 0 0 8 0V20M10 34v32M72 20c-6 0-6 18 0 18v28"/>',
  leaf: '<path d="M16 64c0-30 18-48 50-48 0 30-18 48-48 48"/><path d="M16 64 46 34"/>',
  gift: '<rect x="14" y="30" width="52" height="34"/><path d="M10 22h60v8H10zM40 22v42M40 22c-6-12-20-12-18-2s18 2 18 2c6-12 20-12 18-2s-18 2-18 2"/>',
  glass: '<path d="M26 10h28c0 22-6 30-14 30s-14-8-14-30zM40 40v22M28 66h24"/>',
  chair: '<path d="M22 40h36v8H22zM24 48v20M56 48v20M24 40V14h32v26"/>',
}
const motifFor = label => {
  const l = label.toLowerCase()
  const pick = [[/knife|knives|cutlery|shun|sharpen/, 'knife'], [/coffee|espresso|tea|mug|visa|credit/, 'cup'], [/bak|whisk|mix|kitchenaid|tool|pastry/, 'whisk'], [/glass|wine|bar|cocktail/, 'glass'], [/table|dinner|plate|thanksgiving|registry|serve/, 'plate'], [/furniture|sofa|home|chair|pottery|west elm/, 'chair'], [/gift|christmas|hanukkah|holiday|card|clearance|deal|off/, 'gift'], [/fall|outdoor|garden|décor|leaf|halloween|dead|peanuts|nightmare/, 'leaf'], [/pan|skillet|fry|griddle|grill/, 'pan']].find(([re]) => re.test(l))
  return pick ? pick[1] : 'pot'
}
export const tileArt = label => `<span class="wsx-tile-art" aria-hidden="true"><svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">${MOTIFS[motifFor(label)]}</svg></span>`

const link = (base, [label, path], attrs = '') => `<a href="${esc(base + path)}"${attrs}>${esc(label)}</a>`

function megaMenu(base, dept) {
  const groups = dept.groups.map(g => `<div class="wsx-mega-group"><h3>${esc(g.title)}</h3>${g.links.map(l => link(base, l)).join('')}</div>`).join('')
  return `<div class="wsx-mega" role="group" aria-label="${esc(dept.label)}"><div class="wsx-mega-groups">${groups}</div><a class="wsx-mega-feature" href="${esc(base + dept.path)}" style="--tone:${dept.tone}">${tileArt(dept.label)}<strong>Shop All ${esc(dept.label)}</strong><span>${esc(dept.intro)}</span></a></div>`
}

export function siteHeader(req, base, count = 0) {
  const user = req.store?.user
  const query = typeof (req.query?.words ?? req.query?.q) === 'string' ? (req.query.words ?? req.query.q) : ''
  const events = Object.entries(eventsServices).map(([title, links]) => `<div><h3>${esc(title)}</h3>${links.map(l => link(base, l)).join('')}</div>`).join('')
  const accountLinks = (user ? [['My Account', '/account/'], ...accountMenu.slice(3), ['Sign Out', '/account/logout']] : accountMenu).map(l => link(base, l)).join('')
  const depts = mainDepartments.map(d => `<li class="wsx-dept${d.slug === 'sale-special-offer' ? ' wsx-dept-sale' : ''}">${link(base, [d.label, d.path], ' class="wsx-dept-link"')}${megaMenu(base, d)}</li>`).join('')
  const mobileDepts = mainDepartments.map(d => link(base, [d.label, d.path])).join('') + editorialNav.map(l => link(base, l)).join('')
  return `<div class="wsx-brandbar"><nav aria-label="Our brands">${brandBar.map((l, i) => link(base, l, i === 0 ? ' class="wsx-current-brand" aria-current="page"' : '')).join('')}</nav>${link(base, ['Find A Store', '/stores/'], ' class="wsx-brandbar-store"')}</div>
<div class="wsx-promo"><p>Free Shipping on Cookware, Electrics, Cutlery &amp; More. <a href="${base}/shop/sale-special-offer/free-shipping/">SHOP NOW</a></p><p class="wsx-promo-secondary">Earn 10% in rewards today with a Williams Sonoma Visa. <a href="${base}/ccvalueprop/">LEARN MORE</a></p><details class="wsx-events"><summary>Events &amp; Services</summary><div class="wsx-events-panel">${events}</div></details></div>
<header class="wsx-header"><details class="wsx-mobile-menu"><summary aria-label="Menu">${icon('menu')}</summary><nav aria-label="Mobile menu">${mobileDepts}</nav></details><form class="wsx-search" action="${base}/search/results.html" method="get" role="search"><label class="wsx-sr" for="wsx-query">Search</label><input id="wsx-query" name="words" type="search" value="${esc(query)}" placeholder="Search" autocomplete="off"><button type="submit" aria-label="Search">${icon('search')}</button></form><a class="wsx-logo" href="${base}/" aria-label="Williams Sonoma home"><img src="/static/reference/williams-sonoma/official-logo.svg" alt="Williams Sonoma" width="338" height="25"></a><div class="wsx-utility"><div class="wsx-account"><a href="${base}${user ? '/account/' : '/account/login.html'}">${icon('account')}<span>${user ? esc(`Hi, ${user.first_name || 'Member'}`) : 'Account'}</span></a><div class="wsx-account-menu">${accountLinks}</div></div><a href="${base}/customer-service/order-shipment-tracking/">${icon('truck')}<span>Track Order</span></a><a href="${base}/favorites/">${icon('heart')}<span>Favorites</span></a><a href="${base}/cart/">${icon('cart')}<span>Cart (${Number(count) || 0})</span></a></div></header>
<nav class="wsx-editorial" aria-label="Inspiration and services">${editorialNav.map(l => link(base, l)).join('')}</nav>
<nav class="wsx-departments" aria-label="Departments"><ul>${depts}</ul></nav>`
}

export function siteFooter(req, base) {
  const cols = footerColumns.map(c => `<section><h2>${esc(c.title)}</h2>${c.links.map(l => link(base, l)).join('')}</section>`).join('')
  return `<section class="wsx-signup" aria-labelledby="wsx-signup-title"><h2 id="wsx-signup-title">Be the first to know about new arrivals, sales &amp; more.</h2><form method="post" action="${base}/email-signup"><label for="wsx-signup-email">Enter your email address*</label><input id="wsx-signup-email" name="email" type="email" autocomplete="email" required><label for="wsx-signup-phone">Enter your mobile number (Optional)</label><input id="wsx-signup-phone" name="phone" type="tel" autocomplete="tel"><button type="submit">Sign Up Now</button></form><p>By signing up you agree to receive marketing emails from Williams Sonoma. See our <a href="${base}/customer-service/legal-statement.html#privacy">Privacy Policy</a>.</p></section>
<footer class="wsx-footer"><div class="wsx-footer-cols">${cols}<section><h2>Williams Sonoma App</h2><a href="${base}/pages/williams-sonoma-app/">Everything you love about shopping with us all in one convenient place.</a><p class="wsx-call">${icon('phone')}<a href="tel:18778126235">Call Us 877.812.6235</a></p></section></div>
<div class="wsx-legal"><nav aria-label="Legal">${legalLinks.map(l => link(base, l)).join('')}</nav><p>© 2026 Williams-Sonoma Inc., All Rights Reserved</p></div>${disclaimer('Williams Sonoma').replace('pre-order flow', 'shopping experience')}</footer>`
}

// The shared "page not found" body is a bare heading and link; give it the help a
// Williams Sonoma 404 offers (search plus the main departments).
function notFoundHelp(base) {
  const depts = mainDepartments.filter(d => !['new', 'sale-special-offer'].includes(d.slug)).map(d => `<li>${link(base, [d.label, d.path])}</li>`).join('')
  return `<p class="wsx-404-lead">The page you requested may have moved or is no longer available. Try a search, or start with one of our departments.</p><form class="wsx-404-search" action="${base}/search/results.html" method="get" role="search"><label class="wsx-sr" for="wsx-404-query">Search</label><input id="wsx-404-query" name="words" type="search" placeholder="What can we help you find?"><button type="submit">Search</button></form><ul class="wsx-404-depts">${depts}</ul><p class="wsx-404-help">Need help? ${link(base, ['Contact Customer Service', '/customer-service/'])} or call 877.812.6235.</p>`
}

export function siteChrome({ req, base, title, body, count }) {
  if (title === "Sorry, we couldn't find that page" && body.includes('data-reference-state="uncaptured"')) body = body.replace(/<a href="[^"]*">Continue shopping<\/a><\/section>$/, m => notFoundHelp(base) + m)
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)} | Williams Sonoma</title><link rel="stylesheet" href="${base}/static/depth.css"><link rel="stylesheet" href="${base}/static/site.css"><link rel="stylesheet" href="${base}/static/shelf.css"></head><body class="williams-sonoma wsx ws-reference-page"><a class="wsx-skip" href="#main">Skip to content</a>
${siteHeader(req, base, count)}
<main id="main">${body}</main>
${siteFooter(req, base)}</body></html>`
}
