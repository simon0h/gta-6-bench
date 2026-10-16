// GameStop site chrome, department landings, info pages and site map.
// Structure and copy summarised from gamestop.com on 2026-10-13
// (research/parity/gamestop.json). Product grids only ever show catalog rows
// from data.js; landing tiles are navigation, never purchasable listings.
import { esc } from '../../lib/html.js'
import { DEPARTMENTS } from './data.js'

// ---------- header menu (real top navigation, 2026-10-13) ----------
export const MENU = [
  { label: 'Trading Cards', path: '/toys-games/trading-cards', cols: [
    { links: [['Graded Cards', '/graded-trading-cards'], ['PSA Card Grading', '/card-grading-service'], ['New Trading Cards', '/toys-games/trading-cards'], ['Sports Trading Cards', '/toys-games/trading-cards/sports-trading-cards'], ['Pokémon Trading Cards', '/toys-games/trading-cards/trading-card-games'], ['Out-Of-Print Cards', '/toys-games/trading-cards/out-of-print']] },
  ] },
  { label: 'Deals', path: '/deals' },
  { label: 'Shop My Store', path: '/shopmystore' },
  { label: 'Pre-Order', path: '/pre-order-online-pick-up-in-store' },
  { label: 'Collectibles & More', path: '/collectibles', cols: [
    { title: 'Toys & More', links: [['Board Games', '/toys-games/board-games'], ['Clothing', '/clothing'], ['Homewares', '/home'], ['Stuffed Animals & Plush', '/toys-games/stuffed-animals-plush'], ['LEGO', '/lego']] },
    { title: 'Collectibles', links: [['Funko', '/collectibles/funko'], ['Figures', '/collectibles/figures'], ['Statues', '/collectibles/statues'], ['Replicas', '/collectibles/replicas'], ["Collector's Boxes", '/collectibles/collectors-boxes'], ['All Collectibles', '/collectibles']] },
  ] },
  { label: 'PlayStation', path: '/popular-consoles/playstation', cols: [
    { title: 'PlayStation 5', links: [['PS5 Consoles', '/consoles-hardware/playstation-5'], ['PS5 Games', '/video-games/playstation-5'], ['PS5 Accessories', '/gaming-accessories/playstation-5-accessories'], ['PlayStation Gift Cards', '/gift-cards/playstation'], ['All PlayStation 5', '/popular-consoles/playstation']] },
    { title: 'PlayStation 4', links: [['PS4 Consoles', '/consoles-hardware/playstation-4'], ['PS4 Games', '/video-games/playstation-4'], ['PS4 Accessories', '/gaming-accessories/playstation-4-accessories']] },
  ] },
  { label: 'Nintendo Switch', path: '/popular-consoles/nintendo-switch', cols: [
    { title: 'Nintendo Switch 2', links: [['Switch 2 Consoles', '/consoles-hardware/nintendo-switch-2'], ['Switch 2 Games', '/video-games/nintendo-switch-2'], ['Switch 2 Accessories', '/gaming-accessories/switch-2-accessories'], ['Switch 2 Digital Store', '/digital-store/switch-2-digital']] },
    { title: 'Nintendo Switch', links: [['Switch Consoles', '/consoles-hardware/nintendo-switch'], ['Switch Games', '/video-games/nintendo-switch'], ['Switch Accessories', '/gaming-accessories/nintendo-switch-accessories'], ['Switch Digital Store', '/digital-store/nintendo-digital']] },
    { title: 'More Nintendo', links: [['Nintendo eShop Gift Cards', '/gift-cards/nintendo'], ['Nintendo amiibo', '/consoles-hardware/nintendo-switch/nintendo-switch-amiibo'], ['All Nintendo Switch', '/popular-consoles/nintendo-switch']] },
  ] },
  { label: 'Xbox', path: '/popular-consoles/xbox', cols: [
    { title: 'Xbox Series X|S', links: [['Series X|S Consoles', '/consoles-hardware/xbox-series-x-s'], ['Series X|S Games', '/video-games/xbox-series-x-s'], ['Series X|S Accessories', '/gaming-accessories/xbox-series-x-s-accessories'], ['Xbox Gift Cards', '/gift-cards/xbox'], ['Xbox Digital Store', '/digital-store/xbox-digital'], ['All Xbox Series X|S', '/popular-consoles/xbox']] },
    { title: 'Xbox One', links: [['Xbox One Consoles', '/consoles-hardware/xbox-one'], ['Xbox One Games', '/video-games/xbox-one'], ['Xbox One Accessories', '/gaming-accessories/xbox-one-accessories']] },
  ] },
  { label: 'Pre-Owned', path: '/preowned', cols: [
    { title: 'Pre-Owned Nintendo Switch', links: [['Pre-Owned Switch Consoles', '/preowned/switch-consoles'], ['Pre-Owned Switch Accessories', '/preowned/switch-accessories'], ['Pre-Owned Switch Games', '/preowned/switch-games']] },
    { title: 'Pre-Owned Sony PlayStation', links: [['Pre-Owned PlayStation Consoles', '/preowned/playstation-consoles'], ['Pre-Owned PlayStation Accessories', '/preowned/playstation-accessories'], ['Pre-Owned PlayStation Games', '/preowned/playstation-games']] },
    { title: 'Pre-Owned Microsoft Xbox', links: [['Pre-Owned Xbox Consoles', '/preowned/xbox-consoles'], ['Pre-Owned Xbox Accessories', '/preowned/xbox-accessories'], ['Pre-Owned Xbox Games', '/preowned/xbox-games']] },
    { title: 'More Pre-Owned', links: [['Pre-Owned Electronics', '/preowned/pre-owned-tech'], ['Exclusive Design Controllers', '/links/gamestop-exclusive-design-refurbished-controllers'], ['All Pre-Owned', '/preowned']] },
  ] },
  { label: 'New & Upcoming', path: '/new-and-upcoming' },
  { label: 'Only At GameStop', path: '/only-at-gamestop' },
  { label: 'Digital Store', path: '/digital-store' },
  { label: 'Retro Gaming', path: '/retro' },
  { label: 'GS Pro Credit Card', path: '/credit' },
]

export function megaNav(base) {
  return MENU.map((m, i) => m.cols
    ? `<div class="gs-nav-item"><a href="${base}${m.path}" aria-haspopup="true">${esc(m.label)}<span class="gs-caret" aria-hidden="true"></span></a><div class="gs-mega" role="group" aria-label="${esc(m.label)}"><div class="gs-mega-inner">${m.cols.map(c => `<div class="gs-mega-col">${c.title ? `<p class="gs-mega-title">${esc(c.title)}</p>` : ''}${c.links.map(([l, p]) => `<a href="${base}${p}">${esc(l)}</a>`).join('')}</div>`).join('')}<a class="gs-mega-all" href="${base}${m.path}">Shop all ${esc(m.label)} ›</a></div></div></div>`
    : `<div class="gs-nav-item"><a href="${base}${m.path}">${esc(m.label)}</a></div>`).join('')
}
export function drawerMenu(base) {
  return `<section><h3>Shop By Category</h3>${MENU.map(m => m.cols
    ? `<details class="gs-drawer-group"><summary>${esc(m.label)}</summary>${m.cols.map(c => `${c.title ? `<p class="gs-mega-title">${esc(c.title)}</p>` : ''}${c.links.map(([l, p]) => `<a href="${base}${p}">${esc(l)}</a>`).join('')}`).join('')}</details>`
    : `<a href="${base}${m.path}">${esc(m.label)} <span aria-hidden="true">›</span></a>`).join('')}</section><section><h3>Departments</h3>${DEPARTMENTS.map(d => `<a href="${base}/${d.id}">${esc(d.name)}</a>`).join('')}<a href="${base}/gift-cards">Gift Cards</a><h3>Explore More</h3><a href="${base}/trade-in">Trade-In</a><a href="${base}/pro">GameStop Pro</a><a href="${base}/card-grading-service">PSA Card Grading</a><a href="${base}/order/search">Order Status</a><a href="${base}/help">Help Center</a><a href="${base}/sitemap">Site Map</a></section>`
}

// ---------- footer (real columns, 2026-10-13) ----------
export const FOOTER = [
  ['GET HELP', [['Help Center', '/help'], ['Order Status', '/order/search'], ['GameStop Pro Credit Card', '/credit'], ['Recall Notices', '/recallnotice.html'], ['Make a Return', '/returns'], ['Store Feedback', '/store-feedback']]],
  ['LEGAL & PRIVACY', [['CA Privacy Rights', '/californiaprivacy'], ['CA Transparency Act', '/catransparencyact.html'], ['Conditions of Use', '/disclaimer.html'], ['Returns Policy', '/fullreturnpolicy'], ['Privacy Policy', '/PrivacyPolicy.html'], ['GameStop Pro Terms & Conditions', '/TermsConditions.html'], ['Card Grading Service Terms & Conditions', '/CardGradingTermsConditions.html']]],
  ['ABOUT US', [['Accessibility', '/accessibility.html'], ['Affiliates', '/affiliate.html'], ['Careers', '/careers'], ['Find a Store', '/stores'], ['Investors', '/investors']]],
]
const appleSvg = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M16.4 12.6c0-2.6 2.1-3.8 2.2-3.9-1.2-1.8-3.1-2-3.7-2-1.6-.2-3.1.9-3.9.9s-2-.9-3.4-.9c-1.7 0-3.3 1-4.2 2.6-1.8 3.1-.5 7.7 1.3 10.2.9 1.2 1.9 2.6 3.2 2.6 1.3-.1 1.8-.8 3.3-.8s2 .8 3.4.8 2.2-1.3 3.1-2.5c1-1.4 1.4-2.8 1.4-2.9 0 0-2.7-1-2.7-4.1zM13.9 4.9c.7-.9 1.2-2 1.1-3.2-1 0-2.3.7-3 1.6-.7.8-1.2 2-1.1 3.1 1.2.1 2.3-.6 3-1.5z"/></svg>'
const playSvg = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 2.5v19l10-9.5zM15.3 13.3l2.5 2.4-11 6.2zm0-2.6L6.8 2.1l11 6.2zM19.1 9.1l2.6 1.5c.9.6.9 1.4 0 2l-2.6 1.5-2.6-2.5z"/></svg>'
export function footerHtml(base, disclaimerHtml) {
  return `<footer class="gs-footer">
  <section class="gs-signup" aria-labelledby="gs-signup-title"><div><h2 id="gs-signup-title">Sign Up</h2><p>Get Exclusive Promotions, Coupons, and the Latest Events</p></div><form method="post" action="${base}/newsletter"><label for="gs-signup-email" class="visually-hidden">Email address</label><input id="gs-signup-email" name="email" type="email" autocomplete="email" placeholder="Enter your email address" required><button type="submit">Join</button></form></section>
  <div class="gs-footer-cols">
    ${FOOTER.map(([h, links]) => `<div><h4>${esc(h)}</h4>${links.map(([l, p]) => `<a href="${base}${p}">${esc(l)}</a>`).join('')}</div>`).join('')}
    <div><h4>GET THE APP</h4><a class="gs-app-badge" href="${base}/mobile-app">${appleSvg}<span><small>Download on the</small>App Store</span></a><a class="gs-app-badge" href="${base}/mobile-app">${playSvg}<span><small>Get it on</small>Google Play</span></a><h4 class="gs-connect">CONNECT WITH US</h4><p class="gs-social" aria-label="GameStop social channels">Facebook · X · YouTube · Instagram · TikTok</p></div>
  </div>
  <p class="gs-copy">&copy; 1999-2026 GameStop &nbsp;·&nbsp; <a href="${base}/promotions-and-exclusions">Promotions &amp; Exclusions</a> &nbsp;·&nbsp; <a href="${base}/sitemap">Site Map</a> &nbsp;·&nbsp; <a href="${base}/PrivacyPolicy.html">Cookie Preferences</a></p>
  ${disclaimerHtml}
</footer>`
}

// ---------- icons for visual navigation circles ----------
const G = {
  controller: '<path d="M7 9h10a4 4 0 0 1 4 4l.6 3.5a2 2 0 0 1-3.5 1.6L16 16H8l-2.1 2.1a2 2 0 0 1-3.5-1.6L3 13a4 4 0 0 1 4-4z"/><path d="M8 11v3M6.5 12.5h3M15 12h.01M17 13.5h.01"/>',
  console: '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 14h4M15 10h2"/>',
  headset: '<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/>',
  card: '<rect x="6" y="3" width="12" height="18" rx="1.5"/><path d="M9 8h6M9 16h6"/><circle cx="12" cy="12" r="2"/>',
  figure: '<circle cx="12" cy="5" r="2.5"/><path d="M8 21v-6l-2-4 3-3h6l3 3-2 4v6M10 21v-5M14 21v-5"/>',
  gift: '<rect x="3" y="9" width="18" height="12" rx="1"/><path d="M3 13h18M12 9v12M12 9c-2-4-6-4-6-1.5S10 9 12 9c2 0 6 1 6-1.5S14 5 12 9z"/>',
  tag: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.5"/>',
  disc: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.5"/>',
  monitor: '<rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M8 20h8M12 16v4"/>',
  heart: '<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>',
  shirt: '<path d="M8 3 3 6l2 4 2-1v12h10V9l2 1 2-4-5-3c-.5 1.5-2 2.5-4 2.5S8.5 4.5 8 3z"/>',
  home: '<path d="M3 11 12 4l9 7M5 10v10h14V10M10 20v-6h4v6"/>',
  star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
  joystick: '<path d="M12 4v9"/><circle cx="12" cy="4" r="2"/><rect x="5" y="13" width="14" height="7" rx="2"/>',
  vr: '<path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-4l-2-3h-2l-2 3H5a2 2 0 0 1-2-2z"/>',
  bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  box: '<path d="m3 7 9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10"/>',
  cable: '<path d="M7 3v5M11 3v5M5 8h8v3a4 4 0 0 1-8 0zM9 15v2a4 4 0 0 0 8 0V7"/>',
  memory: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 3v4M12 3v4M15 3v4"/>',
  wheel: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2"/><path d="M3.5 10h6M14.5 10h6M12 14v7"/>',
  brick: '<rect x="3" y="10" width="18" height="10" rx="1"/><rect x="6" y="6" width="4" height="4"/><rect x="14" y="6" width="4" height="4"/>',
  puzzle: '<path d="M4 8h4a2 2 0 1 1 4 0h4v4a2 2 0 1 1 0 4v4H4v-4a2 2 0 1 0 0-4z"/>',
  bag: '<path d="M5 8h14l-1 13H6zM9 8V6a3 3 0 0 1 6 0v2"/>',
  dice: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M9 9h.01M15 15h.01M15 9h.01M9 15h.01M12 12h.01"/>',
  trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H4a4 4 0 0 0 4 4M16 6h4a4 4 0 0 1-4 4M12 13v4M8 21h8M9 17h6"/>',
  film: '<rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="M7 5v14M17 5v14M3 9h4M3 15h4M17 9h4M17 15h4"/>',
  phone: '<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>',
  store: '<path d="M3 9h18l-2-6H5zM4 10v11h16V10M9 21v-7h6v7"/>',
}
export const glyph = (name, cls = '') => `<svg class="gs-glyph ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${G[name] || G.star}</svg>`
const TONES = ['#d92d25', '#1d3f8f', '#0b8a43', '#6c2bd9', '#e2701a', '#00439c', '#107c10', '#e60012', '#222']
export function visnav(base, items, { heading = '', id = '' } = {}) {
  return `<section class="gs-visnav-section"${id ? ` id="${id}"` : ''}>${heading ? `<h2>${esc(heading)}</h2>` : ''}<nav class="gs-visnav" aria-label="${esc(heading || 'Categories')}">${items.map(([label, path, icon, tone], i) => `<a href="${base}${path}"><span class="gs-visnav-circle" style="--tone:${tone || TONES[i % TONES.length]}">${glyph(icon || 'star')}</span><b>${esc(label)}</b></a>`).join('')}</nav></section>`
}
export function promoBanner(base, { eyebrow = '', title, copy = '', cta, path, tone = 'red', tag = 'h2' }) {
  return `<section class="gs-banner gs-banner-${tone}"><div><p class="gs-banner-eyebrow">${esc(eyebrow)}</p><${tag}>${esc(title)}</${tag}>${copy ? `<p>${esc(copy)}</p>` : ''}${cta ? `<a class="gs-btn gs-btn-light" href="${base}${path}">${esc(cta)}</a>` : ''}</div></section>`
}

// ---------- department & sub-category landings ----------
const PLATFORM = { 'playstation-5': 'ps5', 'xbox-series-x-s': 'xbox', 'nintendo-switch': 'switch', 'playstation-4': 'ps4', 'xbox-one': 'xboxone', 'nintendo-switch-2': 'switch2', pc: 'pc' }
export const FACETS = {
  'video-games': ['Delivery Method', 'Categories', 'Platform', 'Condition', 'Franchise', 'Genre', 'Only At GameStop', 'New Releases', 'More Ways To Shop', 'Customer Rating', 'Price', 'ESRB', 'Publisher', 'Number of Players', 'Online Multiplayer', 'Co-Op Mode', 'Perspective'],
  'consoles-hardware': ['Delivery Method', 'Categories', 'Platform', 'Condition', 'Franchise', 'Genre', 'Only At GameStop', 'New Releases', 'More Ways To Shop', 'Customer Rating', 'Color', 'Brand', 'Price', 'ESRB'],
  collectibles: ['Delivery Method', 'Categories', 'Franchise', 'New Releases', 'More Ways To Shop', 'Customer Rating', 'Brand', 'Price', 'Character', 'Only At GameStop'],
  'toys-games': ['Delivery Method', 'New Releases', 'Age', 'More Ways To Shop', 'Price', 'Brand', 'Customer Rating', 'Franchise', 'Character', 'Only At GameStop'],
  default: ['Delivery Method', 'Categories', 'Platform', 'Condition', 'Franchise', 'Genre', 'New Releases', 'More Ways To Shop', 'Customer Rating', 'Brand', 'Price', 'ESRB'],
}
const PLATFORM_TILES = (prefix, suffix = '') => [['PlayStation 5', `/${prefix}/playstation-5${suffix}`, 'console', '#00439c'], ['PlayStation 4', `/${prefix}/playstation-4${suffix}`, 'console', '#003087'], ['Switch 2', `/${prefix}/${suffix ? 'switch-2' : 'nintendo-switch-2'}${suffix}`, 'console', '#e60012'], ['Nintendo Switch', `/${prefix}/nintendo-switch${suffix}`, 'console', '#e60012'], ['Xbox Series X|S', `/${prefix}/xbox-series-x-s${suffix}`, 'console', '#107c10'], ['Xbox One', `/${prefix}/xbox-one${suffix}`, 'console', '#107c10']]

// Each landing: name, crumbs (label/path pairs), products filter, intro sections.
export const LANDINGS = {
  '/video-games': { facets: 'video-games', top: base => promoBanner(base, { eyebrow: 'New this season', title: 'Press Start to Scream.', copy: "The season's most frightening games are here.", cta: 'View More Horror Video Games', path: '/search?q=horror', tone: 'dark' }) + visnav(base, [['Deals', '/deals', 'tag'], ...PLATFORM_TILES('video-games'), ['PC Gaming', '/pc-gaming', 'monitor', '#333'], ['Digital Store', '/digital-store', 'bolt', '#6c2bd9'], ['Retro Gaming', '/retro', 'joystick', '#e2701a']], { heading: 'Browse By Platform' }) },
  '/consoles-hardware': { facets: 'consoles-hardware', top: base => visnav(base, [...PLATFORM_TILES('consoles-hardware'), ['Virtual Reality', '/consoles-hardware/virtual-reality', 'vr', '#6c2bd9'], ['Retro Gaming', '/consoles-hardware/retro-consoles', 'joystick', '#e2701a']], { heading: 'Browse By Category' }) },
  '/gaming-accessories': { top: base => promoBanner(base, { eyebrow: 'Storage', title: 'Upgrade Your Memory Cards with Seagate', copy: 'More room for your library on console and handheld.', cta: 'Shop Memory', path: '/gaming-accessories/memory', tone: 'blue' }) + visnav(base, [['Audio', '/gaming-accessories/gaming-headsets', 'headset'], ['Controllers', '/gaming-accessories/controllers', 'controller'], ['Racing Wheels', '/gaming-accessories/racing-wheels', 'wheel'], ['Cases & Stands', '/gaming-accessories/cases-stands', 'box'], ['Chargers & Cables', '/gaming-accessories/chargers-cables', 'cable'], ['Memory', '/gaming-accessories/memory', 'memory']], { heading: 'Shop By Category' }) + visnav(base, [['Xbox Series X|S', '/gaming-accessories/xbox-series-x-s-accessories', 'controller', '#107c10'], ['Xbox One', '/gaming-accessories/xbox-one-accessories', 'controller', '#107c10'], ['PlayStation 5', '/gaming-accessories/playstation-5-accessories', 'controller', '#00439c'], ['PlayStation 4', '/gaming-accessories/playstation-4-accessories', 'controller', '#003087'], ['Switch 2', '/gaming-accessories/switch-2-accessories', 'controller', '#e60012'], ['Nintendo Switch', '/gaming-accessories/nintendo-switch-accessories', 'controller', '#e60012']], { heading: 'Browse By Platform' }) },
  '/collectibles': { facets: 'collectibles', top: base => visnav(base, [['Pre-Orders', '/collectibles/pre-orders', 'star'], ['GameStop Exclusives', '/only-at-gamestop', 'bolt'], ['Funko', '/collectibles/funko', 'figure'], ['Figures', '/collectibles/figures', 'figure'], ['Statues', '/collectibles/statues', 'trophy'], ['Replicas', '/collectibles/replicas', 'star'], ['Anime', '/anime', 'film'], ['Clothing', '/clothing', 'shirt'], ["Collector's Boxes", '/collectibles/collectors-boxes', 'box'], ['Trading Cards', '/toys-games/trading-cards', 'card'], ['Deals', '/deals', 'tag']]) + promoBanner(base, { eyebrow: 'Coming soon', title: 'Shop The Latest Pre-Orders In Collectibles!', copy: 'Reserve figures, statues and replicas before they sell out.', cta: 'Shop Pre-Orders', path: '/collectibles/pre-orders', tone: 'purple' }) + promoBanner(base, { eyebrow: 'Fandoms', title: 'Your Favorite, Your Fandom!', copy: 'Gaming, anime, film and TV icons for your shelf.', cta: 'Shop Figures', path: '/collectibles/figures', tone: 'dark' }) + visnav(base, [['Pokémon', '/search?q=pokemon', 'star', '#e2a11a'], ['Marvel', '/search?q=marvel', 'star', '#c4161c'], ['Star Wars', '/search?q=star+wars', 'star', '#222'], ['Dragon Ball', '/search?q=dragon+ball', 'star', '#e2701a'], ['Sonic', '/search?q=sonic', 'star', '#1d3f8f'], ['The Legend of Zelda', '/search?q=zelda', 'star', '#0b8a43']], { heading: 'Shop All Collectibles From These Top Fandoms' }) },
  '/toys-games': { facets: 'toys-games', top: base => visnav(base, [['Blind Bags', '/toys-games/blind-bags', 'bag'], ['Board Games', '/toys-games/board-games', 'dice'], ['Building & Construction Sets', '/toys-games/building-construction-sets', 'brick'], ['Action Figures & Playsets', '/toys-games/playsets', 'figure'], ['Trading Cards', '/toys-games/trading-cards', 'card'], ['Card Games', '/toys-games/card-games', 'card'], ['NERF', '/toys-games/nerf', 'bolt'], ['Puzzles', '/toys-games/puzzles', 'puzzle'], ['Plush', '/toys-games/stuffed-animals-plush', 'heart'], ['Deals', '/deals', 'tag']], { heading: 'Shop All Toys!' }) },
  '/toys-games/trading-cards': { top: base => promoBanner(base, { eyebrow: 'Trading cards', title: 'Pre-Order The Newest Trading Cards Before They Sell Out.', copy: 'Sealed boosters, boxes and collection supplies.', cta: 'Shop Pokémon Trading Cards', path: '/toys-games/trading-cards/trading-card-games', tone: 'red' }) + visnav(base, [['Pokémon Trading Cards', '/toys-games/trading-cards/trading-card-games', 'card', '#e2a11a'], ['Sports Trading Cards', '/toys-games/trading-cards/sports-trading-cards', 'trophy', '#1d3f8f'], ['Graded Cards', '/graded-trading-cards', 'star', '#222'], ['PSA Card Grading', '/card-grading-service', 'card', '#c4161c'], ['Out-Of-Print Cards', '/toys-games/trading-cards/out-of-print', 'box', '#6c2bd9'], ['Card Supplies', '/toys-games/trading-cards/supplies', 'box', '#0b8a43']], { heading: 'Shop Trading Cards' }) },
  '/digital-store': { top: base => visnav(base, [['PlayStation', '/gift-cards/playstation', 'console', '#00439c'], ['Xbox', '/digital-store/xbox-digital', 'console', '#107c10'], ['Nintendo Switch', '/digital-store/nintendo-digital', 'console', '#e60012'], ['Nintendo Switch 2', '/digital-store/switch-2-digital', 'console', '#e60012'], ['PC Gaming', '/digital-store/pc-digital', 'monitor', '#333'], ['Virtual Currency', '/digital-store/virtual-currency', 'bolt', '#6c2bd9']], { heading: 'Shop Digital By Platform' }) },
  '/deals': { top: base => promoBanner(base, { eyebrow: 'Top Deals', title: 'Deals', copy: 'Markdowns on games, consoles, accessories and collectibles.', tone: 'red', tag: 'p' }) + visnav(base, [['Video Game Deals', '/deals/video-games', 'disc'], ['Console Deals', '/deals/consoles-hardware', 'console'], ['Accessory Deals', '/deals/gaming-accessories', 'controller'], ['Collectible Deals', '/deals/collectibles', 'figure'], ['Toy Deals', '/deals/toys-games', 'brick'], ['Clearance', '/deals/clearance', 'tag']], { heading: 'Shop Deals By Category' }) },
  '/pre-order-online-pick-up-in-store': { name: 'Pre-Order Online, Pick Up In-Store', hub: 'pre-order', top: base => `<p class="gs-landing-note">Reserve the newest games, consoles and collectibles. Online pre-orders are paid in full and ship to your address, arriving on or shortly after release day.</p>` },
  '/preowned': { name: 'Pre-Owned', hub: 'pre-owned', top: base => promoBanner(base, { eyebrow: 'Pre-Owned', title: 'Tested, Cleaned & Ready To Play', copy: 'Pre-owned games, consoles and accessories with a defective exchange window.', tone: 'dark', tag: 'p' }) + visnav(base, [['Pre-Owned Switch Games', '/preowned/switch-games', 'disc', '#e60012'], ['Pre-Owned PlayStation Games', '/preowned/playstation-games', 'disc', '#00439c'], ['Pre-Owned Xbox Games', '/preowned/xbox-games', 'disc', '#107c10'], ['Pre-Owned Consoles', '/preowned/playstation-consoles', 'console'], ['Pre-Owned Electronics', '/preowned/pre-owned-tech', 'phone'], ['Exclusive Design Controllers', '/links/gamestop-exclusive-design-refurbished-controllers', 'controller']], { heading: 'Shop Pre-Owned' }) },
  '/gift-cards': { name: 'Gift Cards', top: base => visnav(base, [['Gift Cards', '/gift-cards/gamestop', 'gift'], ['Virtual Currency', '/digital-store/virtual-currency', 'bolt'], ['Digital Subscriptions', '/gift-cards/subscriptions', 'star'], ['Gaming Gift Cards', '/gift-cards/gaming', 'controller']]) + `<div class="gs-split-promos"><a class="gs-banner gs-banner-red" href="${base}/gift-cards/gamestop-digital"><p class="gs-banner-eyebrow">GameStop Digital Gift Cards</p><p class="gs-banner-title">The Perfect Last-Minute Gift</p><span class="gs-btn gs-btn-light">Shop Digital Cards</span></a><a class="gs-banner gs-banner-dark" href="${base}/gift-cards/gamestop"><p class="gs-banner-eyebrow">GameStop Physical Gift Card</p><p class="gs-banner-title">They'll Feel The Love</p><span class="gs-btn gs-btn-light">Shop Physical Cards</span></a></div>` + visnav(base, [['Xbox Gift Cards', '/gift-cards/xbox', 'gift', '#107c10'], ['PlayStation Gift Cards', '/gift-cards/playstation', 'gift', '#00439c'], ['Nintendo Gift Cards', '/gift-cards/nintendo', 'gift', '#e60012'], ['Steam Gift Cards', '/gift-cards/steam', 'gift', '#171a21'], ['Roblox Gift Cards', '/gift-cards/roblox', 'gift', '#333'], ['Razer Gold Gift Cards', '/gift-cards/razer-gold', 'gift', '#0b8a43'], ['Google Play Gift Cards', '/gift-cards/google-play', 'gift', '#1d3f8f'], ['Twitch Gift Cards', '/gift-cards/twitch', 'gift', '#6c2bd9']], { heading: 'Shop Gift Cards For Top Brands' }) },
}

const titleCase = s => s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).replace(/\bPs(\d)\b/g, 'PS$1').replace(/\bX S\b/, 'X|S').replace(/\bPc\b/, 'PC').replace(/\bNerf\b/, 'NERF')
const PLATFORM_NAME = { 'playstation-5': 'PlayStation 5', 'playstation-4': 'PlayStation 4', 'xbox-series-x-s': 'Xbox Series X|S', 'xbox-one': 'Xbox One', 'nintendo-switch': 'Nintendo Switch', 'nintendo-switch-2': 'Nintendo Switch 2', 'switch-2': 'Nintendo Switch 2' }
const DEPT_NAME = Object.fromEntries(DEPARTMENTS.map(d => [d.id, d.name]))
const FAMILY = { controllers: 'controller', 'gaming-headsets': 'gaming-headset', 'racing-wheels': 'racing-wheel', 'cases-stands': ['carrying-case', 'console-stand'], 'chargers-cables': ['charging-dock', 'charging-cable', 'hdmi-cable'], memory: 'internal-storage', 'board-games': 'board-game', 'building-construction-sets': 'building-set', 'stuffed-animals-plush': 'plush', figures: 'figure', 'sports-trading-cards': 'sports-card-box', 'trading-card-games': ['tcg-booster', 'tcg-deck'], supplies: ['card-sleeves', 'card-binder'], funko: 'funko-pop', statues: 'statue', replicas: 'replica', puzzles: 'puzzle', nerf: 'blaster', 'blind-bags': 'blind-box', 'card-games': 'card-game', playsets: 'action-figure', 'collectors-boxes': 'collectors-box', 'virtual-reality': 'vr-headset', 'retro-consoles': 'retro-console', 'pc-gaming-accessories': ['keyboard', 'mouse', 'mouse-pad'], monitors: 'monitor', streaming: ['webcam', 'stream-deck', 'capture-card', 'microphone'], 'gaming-chairs': 'gaming-chair', 'gaming-laptops': 'laptop', 't-shirts': 'tshirt', 'hoodies-sweatshirts': 'hoodie', accessories: 'hat', lighting: 'lamp', kitchen: 'mug', bedding: 'blanket', 'wall-art': 'poster', music: 'vinyl' }
const SUBNAMES = { 'sports-trading-cards': 'Sports Trading Cards', 'trading-card-games': 'Pokémon Trading Cards', 'out-of-print': 'Out-Of-Print Cards', 'stuffed-animals-plush': 'Stuffed Animals & Plush', 'collectors-boxes': "Collector's Boxes", 'nintendo-switch-amiibo': 'Nintendo amiibo', 'virtual-reality': 'Virtual Reality', 'retro-consoles': 'Retro Consoles', 'gaming-headsets': 'Gaming Headsets', 'cases-stands': 'Cases & Stands', 'chargers-cables': 'Chargers & Cables', 'building-construction-sets': 'Building & Construction Sets', playsets: 'Action Figures & Playsets', 'pre-orders': 'Collectible Pre-Orders', 'xbox-digital': 'Xbox Digital Store', 'nintendo-digital': 'Nintendo Switch Digital Store', 'switch-2-digital': 'Switch 2 Digital Store', 'pc-digital': 'PC Digital Store', 'virtual-currency': 'Virtual Currency', 'pre-owned-tech': 'Pre-Owned Electronics' }
const accessoryPlatform = sub => sub.replace(/-accessories$/, '').replace(/^switch-2$/, 'nintendo-switch-2')

// Resolve a department sub-path to a landing with a product filter over catalog rows.
export function subLanding(dept, sub, sub2) {
  sub = String(sub).replace('xbox-series-x|s', 'xbox-series-x-s')
  if (dept === 'video-games' || dept === 'consoles-hardware' || dept === 'gaming-accessories') {
    const plat = dept === 'gaming-accessories' ? accessoryPlatform(sub) : sub
    if (PLATFORM_NAME[plat]) {
      const name = dept === 'video-games' ? `${PLATFORM_NAME[plat]} Games` : dept === 'consoles-hardware' ? `${PLATFORM_NAME[plat]} Consoles` : `${PLATFORM_NAME[plat]} Accessories`
      if (sub2) return { name: SUBNAMES[sub2] || titleCase(sub2), dept, crumbs: [[DEPT_NAME[dept], '/' + dept], [name, `/${dept}/${sub}`]], filter: p => p.department === dept && p.platforms?.includes(PLATFORM[plat]) && p.family === 'amiibo' }
      return { name, dept, crumbs: [[DEPT_NAME[dept], '/' + dept]], filter: p => p.department === dept && p.platforms?.includes(PLATFORM[plat]) }
    }
  }
  const fam = FAMILY[sub]
  const name = SUBNAMES[sub] || titleCase(sub)
  const parents = dept.split('/').map((_, i, a) => a.slice(0, i + 1).join('/'))
  const crumbs = parents.map(p => [DEPT_NAME[p] || titleCase(p.split('/').at(-1)), '/' + p])
  if (dept === 'deals') return { name: `${DEPT_NAME[sub] || name} Deals`, dept, crumbs: [['Deals', '/deals']], filter: p => p.offers?.includes('deals') && (sub === 'clearance' || p.department === sub) }
  return { name, dept, crumbs, filter: p => (p.department === dept || p.department?.startsWith(dept + '/')) && (fam ? [].concat(fam).includes(p.family) : sub === 'pre-orders' ? p.preorder : false) }
}

// Stand-alone collection pages from the header that are not departments.
export const EXTRA_COLLECTIONS = {
  '/popular-consoles/playstation': { name: 'PlayStation', filter: p => p.platforms?.includes('ps5'), top: base => visnav(base, [['PS5 Consoles', '/consoles-hardware/playstation-5', 'console', '#00439c'], ['PS5 Games', '/video-games/playstation-5', 'disc', '#00439c'], ['PS5 Accessories', '/gaming-accessories/playstation-5-accessories', 'controller', '#00439c'], ['PlayStation Gift Cards', '/gift-cards/playstation', 'gift', '#00439c'], ['PS4 Games', '/video-games/playstation-4', 'disc', '#003087']], { heading: 'Shop PlayStation' }) },
  '/popular-consoles/nintendo-switch': { name: 'Nintendo Switch', filter: p => p.platforms?.includes('switch'), top: base => visnav(base, [['Switch 2 Consoles', '/consoles-hardware/nintendo-switch-2', 'console', '#e60012'], ['Switch 2 Games', '/video-games/nintendo-switch-2', 'disc', '#e60012'], ['Switch Games', '/video-games/nintendo-switch', 'disc', '#e60012'], ['Switch Accessories', '/gaming-accessories/nintendo-switch-accessories', 'controller', '#e60012'], ['Nintendo amiibo', '/consoles-hardware/nintendo-switch/nintendo-switch-amiibo', 'figure', '#e60012']], { heading: 'Shop Nintendo Switch' }) },
  '/popular-consoles/xbox': { name: 'Xbox Series X|S', filter: p => p.platforms?.includes('xbox'), top: base => visnav(base, [['Series X|S Consoles', '/consoles-hardware/xbox-series-x-s', 'console', '#107c10'], ['Series X|S Games', '/video-games/xbox-series-x-s', 'disc', '#107c10'], ['Series X|S Accessories', '/gaming-accessories/xbox-series-x-s-accessories', 'controller', '#107c10'], ['Xbox Gift Cards', '/gift-cards/xbox', 'gift', '#107c10'], ['Xbox Digital Store', '/digital-store/xbox-digital', 'bolt', '#107c10']], { heading: 'Shop Xbox' }) },
  '/lego': { name: 'LEGO', filter: p => p.family === 'building-set' && p.brand === 'LEGO' },
  '/anime': { name: 'Anime', filter: () => false },
  '/electronics': { name: 'Electronics', filter: p => p.category === 'electronics' },
  '/links/gamestop-exclusive-design-refurbished-controllers': { name: 'Exclusive Design Controllers', filter: p => p.family === 'controller' && p.variants?.some(v => v.options.Condition !== 'New'), top: () => `<p class="gs-landing-note">GameStop exclusive-design refurbished controllers are tested, cleaned and backed by the pre-owned defective exchange window.</p>` },
}
const PREOWNED = { 'switch-consoles': ['Pre-Owned Switch Consoles', 'switch', 'consoles-hardware'], 'switch-accessories': ['Pre-Owned Switch Accessories', 'switch', 'gaming-accessories'], 'switch-games': ['Pre-Owned Switch Games', 'switch', 'video-games'], 'playstation-consoles': ['Pre-Owned PlayStation Consoles', 'ps5', 'consoles-hardware'], 'playstation-accessories': ['Pre-Owned PlayStation Accessories', 'ps5', 'gaming-accessories'], 'playstation-games': ['Pre-Owned PlayStation Games', 'ps5', 'video-games'], 'xbox-consoles': ['Pre-Owned Xbox Consoles', 'xbox', 'consoles-hardware'], 'xbox-accessories': ['Pre-Owned Xbox Accessories', 'xbox', 'gaming-accessories'], 'xbox-games': ['Pre-Owned Xbox Games', 'xbox', 'video-games'], 'pre-owned-tech': ['Pre-Owned Electronics', null, 'electronics'] }
export function preownedLanding(sub) {
  const row = PREOWNED[sub]; if (!row) return null
  const [name, plat, dept] = row
  const used = p => p.condition === 'Pre-Owned' || p.variants?.some(v => ['Pre-Owned', 'Refurbished'].includes(v.options.Condition))
  return { name, crumbs: [['Pre-Owned', '/preowned']], filter: p => used(p) && p.department === dept && (!plat || p.platforms?.includes(plat)) }
}
export const GIFT_BRANDS = { playstation: 'PlayStation', xbox: 'Xbox', nintendo: 'Nintendo eShop', steam: 'Steam', roblox: 'Roblox', 'razer-gold': 'Razer Gold', 'google-play': 'Google Play', twitch: 'Twitch', gamestop: 'GameStop Physical', 'gamestop-digital': 'GameStop Digital', subscriptions: 'Digital Subscription', gaming: 'Gaming' }

export function landingHeader(base, { name, crumbs = [], top }) {
  return `<section class="gs-category-intro gs-landing"><nav class="gs-crumbs" aria-label="Breadcrumb"><a href="${base}/">Home</a>${crumbs.map(([l, p]) => ` <span aria-hidden="true">/</span> <a href="${base}${p}">${esc(l)}</a>`).join('')} <span aria-hidden="true">/</span> <span aria-current="page">${esc(name)}</span></nav><h1>${esc(name)}</h1>${top ? top(base) : ''}</section>`
}

// ---------- info pages (policy, about, service) ----------
const sec = (h, ...paras) => [h, paras]
export const INFO = {
  '/fullreturnpolicy': { title: 'GameStop Return Policy', group: 'Legal & Privacy', sections: [
    sec('Returns Process', 'Store returns need an in-store receipt or GameStop.com order number. Government ID may be required, and GameStop may limit returns to prevent fraud or abuse.', 'Refunds go back to the original payment method. Items without valid proof of purchase cannot be returned, but trade-in eligible items may be traded at the current value. Items must be in resalable, original-equivalent condition; gift-receipt returns receive a gift card or an even exchange.'),
    sec('Return Timeframes', 'New, unopened products may be returned within 15 days. Special and collector editions of games and hardware have 7 days.', 'Pre-owned products receive a full refund within 7 days. PCs, PC components and accessories, laptops, TVs and monitors also have 7 days. Online purchases over $500 cannot be returned in-store, and orders shipped to PR, HI or AK are in-store returns only.'),
    sec('Non-Returnable Items', 'Final-sale items include trading cards, blind items, clearance and seasonal products, consumables, bundle components, digital products, graded PSA cards, and books, magazines and guides.', 'Opened new hardware, software, accessories, collectibles and PCs cannot be returned, although defective items may be exchanged within the return window.'),
    sec('Defective Product Exchanges', 'Most defective items can be exchanged for an identical replacement within the return window, except PCs, PC components, laptops, TVs and monitors, which are handled by the manufacturer.', 'Defective pre-owned items can be exchanged within 30 days for Pro members and 15 days for other customers. Pre-owned PCs and tech are excluded.'),
    sec('Pro Member Benefits', 'Pros may return unopened new software and hardware within 30 days and exchange defective pre-owned items within 30 days.', 'A Pro membership can be cancelled for a full refund within 2 days of purchase if no benefits have been used.'),
    sec('Online and In-Store Returns', 'Most items can be returned in-store or by calling customer service. Online purchases can be returned in-store for free or shipped back for an $8.99 fee; video game console returns carry a $14.99 shipping fee.', 'Refurbished tech is returnable only through customer service by phone.'),
    sec('Additional Information', 'GameStop reserves final authority over return eligibility. "Lost in transit" claims must be submitted within 60 days of shipment. Sale or promotional purchases may have added restrictions, and Buy Now Pay Later installment payments to the provider still apply after a refund.'),
    sec('Need Help?', 'Questions can be directed to the GameStop Help Center.'),
  ], links: [['Help Center', '/help'], ['Make a Return', '/returns']] },
  '/PrivacyPolicy.html': { title: 'Privacy Policy', group: 'Legal & Privacy', sections: [
    sec('1. Services and Scope', 'This policy describes how GameStop collects, uses, discloses and protects personal information across its websites, apps, stores and programs.'),
    sec('2. Personal Information We Collect', 'Information you provide (such as account, order and contact details), information collected automatically from your device and browsing, and information from other sources.'),
    sec('3. How We Use Your Personal Information', 'To provide services and fulfil orders, support customers, personalise and market products, perform analytics, and protect security and prevent fraud.'),
    sec('4. How We Disclose Your Personal Information', 'With affiliates, service providers, marketing partners and advertisers, legal authorities where required, and in connection with a business transaction.'),
    sec('5. Cookies and Similar Technologies', 'GameStop and its partners use cookies, pixels and similar identifiers to recognise users across devices and services.'),
    sec('6. How We Protect Your Personal Information', 'Security safeguards are used, but no system is completely secure. Create a strong, unique account password.'),
    sec('7. Links to Third-Party Websites', 'GameStop is not responsible for the content or privacy practices of external sites.'),
    sec('8. Retention of Personal Information', 'Personal information is kept only as long as needed for the purpose it was collected.'),
    sec('9. Your Rights and Choices', 'Request access, correction or deletion; opt out of marketing or the sale and sharing of data; and manage text message subscriptions.'),
    sec('10. State Privacy Laws', 'Supplemental disclosures for residents of California, Nevada and other states with their own privacy laws.'),
    sec("11. Children's Privacy", 'The services are intended for people 13 and older. GameStop does not knowingly collect personal information from children under 13.'),
    sec('12. How to Contact Us', 'Use the privacy rights request form or contact customer service with questions about your personal information.'),
  ], links: [['CA Privacy Rights', '/californiaprivacy']] },
  '/californiaprivacy': { title: 'CA Privacy Rights', group: 'Legal & Privacy', sections: [
    sec('Your California Privacy Rights', 'California residents may request to know, correct or delete personal information, and may opt out of the sale or sharing of personal information and of targeted advertising.'),
    sec('Submitting a Request', 'Requests can be made through the privacy rights web form or by contacting customer service. GameStop verifies requests before acting on them and will not discriminate against you for exercising your rights.'),
    sec('More Information', 'See sections 9 and 10 of the Privacy Policy for the full state-law disclosures.'),
  ], links: [['Privacy Policy', '/PrivacyPolicy.html']] },
  '/catransparencyact.html': { title: 'California Human Trafficking in the Supply Chain Disclosure - CA SB 657', group: 'Legal & Privacy', sections: [
    sec('Supplier Expectations', 'GameStop expects its manufacturers and suppliers to uphold labor and human rights standards. Its Code of Conduct prohibits forced and child labor.'),
    sec('Verification and Audits', 'Supplier audits and factory visits help verify compliance, and employees are held to ethics rules covering sourcing decisions.'),
  ] },
  '/disclaimer.html': { title: 'Conditions of Use', group: 'Legal & Privacy', sections: [
    sec('Applicable Law', "Your state's laws govern these conditions and any dispute with GameStop."),
    sec('Copyright and Trademark Notice', 'Site content and GameStop trademarks are protected; other uses need written permission.'),
    sec('Digital Millennium Copyright Act', "Copyright owners can submit infringement notices to GameStop's designated agent."),
    sec('Your Account', 'You are responsible for account security. GameStop may refuse service or change the Sites.'),
    sec('Errors on the Sites', 'GameStop may cancel orders for incorrectly priced items and refund any charges.'),
    sec('Order Policy & Shipping', 'An order confirmation is not acceptance of the order. Risk of loss passes to you when the carrier takes the item.'),
    sec('Site Content and Information', 'Site information may contain errors; products not as described can be returned.'),
    sec('Distributing User Content', 'Reviews and comments you post grant GameStop a license to use them and must follow content rules.'),
    sec('Prohibited Uses', 'Scraping data, commercial use and interfering with the Sites are not allowed.'),
    sec('Accessibility', 'GameStop aims to make its website accessible; see the Accessibility Statement.'),
    sec('Sanctions and Export Compliance', 'Users must not be on sanctions lists and must follow export controls.'),
    sec('GameStop Pro Program', 'The rewards program is available to U.S. residents aged 13 and up and replaced PowerUp Rewards.'),
  ] },
  '/TermsConditions.html': { title: 'GameStop Pro & Account Terms & Conditions', group: 'Legal & Privacy', sections: [
    sec('Membership Eligibility', 'U.S. residents aged 13 or older may join, with parental permission under the age of majority.'),
    sec('Your Account', 'Hold one GameStop account, keep its information current and protect access to it.'),
    sec('GameStop Pro Membership', 'The annual fee is $29.99. Benefits include extra discounts, extra trade-in credit, monthly rewards and free shipping on qualifying orders. Benefits are non-transferable and have no cash value.'),
    sec('GameStop Pro Membership Management', 'A membership can be refunded within two days if no benefits were used. Memberships can be cancelled in store, online or through customer service.'),
    sec('GameStop Pro Membership Auto-renew Program', 'Memberships renew automatically each year unless cancelled at least five days before the anniversary date.'),
    sec('In-Store Preorders', 'In-store reservations may require a deposit. Unclaimed deposits convert to non-expiring digital gift cards after 30 days.'),
    sec('Preorder Online Pickup In Store', 'Online reservations are paid in full upfront. Release-date delays follow the stated refund rules.'),
    sec('Privacy Policy', 'Personal information is handled under the GameStop Privacy Policy.'),
  ], links: [['GameStop Pro', '/pro'], ['Privacy Policy', '/PrivacyPolicy.html']] },
  '/CardGradingTermsConditions.html': { title: 'Card Grading Service Terms & Conditions', group: 'Legal & Privacy', sections: [
    sec('Service Overview', 'GameStop accepts eligible trading cards in participating stores and submits them to PSA for authentication and grading. Grades are assigned by PSA, not GameStop.'),
    sec('Fees and Declared Value', 'The service fee is $59.99 per card plus a flat $9.99 shipping fee per order, with $5 off per card for Pros. Each card has a maximum declared value of $1,000.'),
    sec('Turnaround and Return', 'Estimated turnaround is 90-100 business days. Graded cards return to the drop-off store for pickup or trade-in.'),
    sec('Final Sale', 'Grading fees are non-refundable once a submission is accepted. Graded PSA cards are final sale.'),
  ], links: [['PSA Card Grading', '/card-grading-service']] },
  '/accessibility.html': { title: 'Accessibility Statement', group: 'About Us', kicker: 'Accessibility', sections: [
    sec('Our Commitment to Accessibility', 'GameStop wants its site to be usable by everyone. Report a problem through customer service with "Disabled Access" in the subject line.'),
    sec('Web Accessibility Guidelines', 'GameStop uses the Web Content Accessibility Guidelines (WCAG) 2.0 as its reference and aims for Level AA conformance where feasible.'),
    sec('Feedback', 'Accessibility specialists are available through the Help Desk, and visitors can submit issues through the contact page.'),
    sec('Third-Party Sites', 'Linked social media platforms are not controlled by GameStop and may present their own accessibility barriers.'),
  ], links: [['Contact support', '/help/contact']] },
  '/affiliate.html': { title: 'Affiliate Application', group: 'About Us', sections: [
    sec('Build a Better Site', 'Promoting GameStop products adds fresh content to your website and keeps visitors coming back.'),
    sec("It's Easy and Free", 'Joining the affiliate program costs nothing, and affiliates earn commissions on qualifying purchases.'),
    sec('A Name They Know and Trust', 'Linking to GameStop sends your visitors to a well-known retailer with thousands of stores.'),
  ] },
  '/careers': { title: 'Careers at GameStop', group: 'About Us', sections: [
    sec('Work Where You Play', 'GameStop hires store associates, store leaders, distribution and corporate team members across its U.S. stores and offices.'),
    sec('Store Roles', 'Store team members help customers with games, consoles, trade-ins and trading cards, and run pre-order and release-day events.'),
    sec('Corporate Roles', 'Corporate teams in Grapevine, Texas support merchandising, e-commerce, technology, finance and operations.'),
    sec('How to Apply', 'Applications are taken on GameStop\'s careers site. Search open roles in stores, distribution centers and our corporate offices.'),
  ] },
  '/investors': { title: 'Investor Relations', group: 'About Us', sections: [
    sec('GameStop Corp.', 'GameStop Corp. (NYSE: GME) is a specialty retailer of games, consoles, collectibles and trading cards, headquartered in Grapevine, Texas.'),
    sec('News & Filings', 'Quarterly results, annual reports, SEC filings and press releases are published on GameStop\'s investor relations site.'),
    sec('Shareholder Services', 'Questions about stock ownership are handled by GameStop\'s transfer agent.'),
  ] },
  '/recallnotice.html': { title: 'Recall Notice', group: 'Get Help', sections: [
    sec('Recall Summary', 'Name of product: Fallout 1:1 T-51 Power Armor Nuka Cola Helmet (Power Armor Collectible Helmets). Hazard: possible mold on the fabric insert of the helmet. Remedy: refund.'),
    sec('Recall Details', 'The recalled helmet is a one-size, ABS plastic wearable collectible with a fabric liner, sold in a red finish with white tubing (UPC 680168887110). The grey Fallout 76 Power Armor Edition helmet is not part of this recall.'),
    sec('Incidents/Injuries', 'No injuries have been reported.'),
    sec('Sold At', 'GameStop.com in June 2019 for about $150.'),
    sec('Consumer Contact', 'Stop using the helmet and contact GameStop customer service for a full refund.'),
  ], links: [['Help Center', '/help']] },
  '/promotions-and-exclusions': { title: 'Promotions & Exclusions', group: 'Get Help', sections: [
    sec('Current Promotions', 'Trade-in bonuses, multi-buy offers and free shipping thresholds each carry their own terms. Pre-orders, gift cards, digital products and Pro memberships are commonly excluded.'),
    sec('Free Shipping', 'Free shipping on pre-orders applies to orders of $59 or more; Pro members receive free shipping on qualifying orders of $54 or more. Exclusions apply.'),
    sec('Coupons', 'Coupons cannot be applied to pre-orders and may not be combined with other offers unless stated.'),
    sec('Still looking for an answer?', 'Check the Help Center for order, shipping and payment questions.'),
    sec('Ask our Customer Service Team!', 'Contact customer service through the Help Center.'),
  ], links: [['Help Center', '/help'], ['Contact support', '/help/contact']] },
  '/returns': { title: 'Make a Return', group: 'Get Help', sections: [
    sec('Start a Return', 'Online orders can be returned in any GameStop store for free, or shipped back for a fee. Signed-in shoppers can request a return from a delivered order in Order Status.'),
    sec('What You Need', 'Your GameStop.com order number and the email address used on the order. Items must be within the return window and in resalable condition.'),
    sec('Return Window', 'New, unopened items: 15 days. Pre-owned items: 7 days. Pro members: 30 days for unopened new software and hardware.'),
  ], links: [['Order Status', '/order/search'], ['Returns Policy', '/fullreturnpolicy']] },
  '/store-feedback': { title: 'Store Feedback', group: 'Get Help', sections: [
    sec('Tell Us About Your Visit', 'GameStop invites customers to share feedback about a recent store visit through a short survey printed on the receipt.'),
    sec('Need Help Instead?', 'For order, return or account questions, contact customer service through the Help Center.'),
  ], links: [['Help Center', '/help'], ['Find a Store', '/stores']] },
  '/mobile-app': { title: 'Get the GameStop App', group: 'About Us', sections: [
    sec('Shop, Trade and Track', 'Browse deals, check trade values, manage your Pro membership and track orders from your phone.'),
    sec('Download', 'The GameStop app is available on the App Store and Google Play. Shop, track orders and get Pro rewards on the go.'),
  ] },
}

export function infoPage(base, path) {
  const page = INFO[path]
  const group = Object.entries(INFO).filter(([, p]) => p.group === page.group)
  return `<div class="gs-info"><nav class="gs-crumbs" aria-label="Breadcrumb"><a href="${base}/">Home</a> <span aria-hidden="true">/</span> <span aria-current="page">${esc(page.title)}</span></nav><div class="gs-info-grid"><aside class="gs-info-nav" aria-label="${esc(page.group)}"><h2>${esc(page.group)}</h2>${group.map(([p, g]) => `<a href="${base}${p}"${p === path ? ' aria-current="page"' : ''}>${esc(g.title)}</a>`).join('')}</aside><article>${page.kicker ? `<p class="gs-info-kicker">${esc(page.kicker)}</p>` : ''}<h1>${esc(page.title)}</h1>${page.sections.map(([h, paras]) => `<section><h2>${esc(h)}</h2>${paras.map(t => `<p>${esc(t)}</p>`).join('')}</section>`).join('')}${page.links ? `<p class="gs-info-links">${page.links.map(([l, p]) => `<a class="gs-btn gs-btn-outline" href="${base}${p}">${esc(l)}</a>`).join(' ')}</p>` : ''}</article></div></div>`
}

// ---------- site map ----------
export function sitemapGroups() {
  return [
    ['Video Games', [['Video Games', '/video-games'], ['PlayStation 5 Games', '/video-games/playstation-5'], ['PlayStation 4 Games', '/video-games/playstation-4'], ['Xbox Series X|S Games', '/video-games/xbox-series-x-s'], ['Xbox One Games', '/video-games/xbox-one'], ['Nintendo Switch 2 Games', '/video-games/nintendo-switch-2'], ['Nintendo Switch Games', '/video-games/nintendo-switch'], ['PC Gaming', '/pc-gaming'], ['Digital Store', '/digital-store'], ['Retro Gaming', '/retro']]],
    ['Consoles & Hardware', [['Consoles & Hardware', '/consoles-hardware'], ['PlayStation 5 Consoles', '/consoles-hardware/playstation-5'], ['Xbox Series X|S Consoles', '/consoles-hardware/xbox-series-x-s'], ['Nintendo Switch 2 Consoles', '/consoles-hardware/nintendo-switch-2'], ['Nintendo Switch Consoles', '/consoles-hardware/nintendo-switch'], ['Virtual Reality', '/consoles-hardware/virtual-reality'], ['Electronics', '/electronics']]],
    ['Gaming Accessories', [['Gaming Accessories', '/gaming-accessories'], ['Controllers', '/gaming-accessories/controllers'], ['Headsets', '/gaming-accessories/gaming-headsets'], ['Racing Wheels', '/gaming-accessories/racing-wheels'], ['Cases & Stands', '/gaming-accessories/cases-stands'], ['Chargers & Cables', '/gaming-accessories/chargers-cables'], ['Memory', '/gaming-accessories/memory']]],
    ['Trading Cards', [['Trading Cards', '/toys-games/trading-cards'], ['Pokémon Trading Cards', '/toys-games/trading-cards/trading-card-games'], ['Sports Trading Cards', '/toys-games/trading-cards/sports-trading-cards'], ['Graded Trading Cards', '/graded-trading-cards'], ['PSA Card Grading', '/card-grading-service']]],
    ['Collectibles & More', [['Collectibles', '/collectibles'], ['Figures', '/collectibles/figures'], ['Funko', '/collectibles/funko'], ['Statues', '/collectibles/statues'], ['Toys & Games', '/toys-games'], ['Board Games', '/toys-games/board-games'], ['LEGO', '/lego'], ['Clothing', '/clothing'], ['Home & Lifestyle', '/home']]],
    ['Shop', [['Deals', '/deals'], ['Pre-Order', '/pre-order-online-pick-up-in-store'], ['Pre-Owned', '/preowned'], ['New & Upcoming', '/new-and-upcoming'], ['Only At GameStop', '/only-at-gamestop'], ['Gift Cards', '/gift-cards']]],
    ['Services', [['Trade-In', '/trade-in'], ['GameStop Pro', '/pro'], ['GameStop Pro Credit Card', '/credit'], ['Store Locator', '/stores'], ['Shop My Store', '/shopmystore'], ['Get the App', '/mobile-app']]],
    ['Help & Account', [['Help Center', '/help'], ['Order Status', '/order/search'], ['Shipping Options', '/help/articles/shipping'], ['Make a Return', '/returns'], ['Sign In', '/login'], ['Create Account', '/account/create'], ['Cart', '/cart']]],
    ['Legal & Privacy', Object.entries(INFO).map(([p, g]) => [g.title, p])],
  ]
}
export function sitemapPage(base) {
  return `<div class="gs-info gs-sitemap"><nav class="gs-crumbs" aria-label="Breadcrumb"><a href="${base}/">Home</a> <span aria-hidden="true">/</span> <span aria-current="page">Site Map</span></nav><h1>Site Map</h1><div class="gs-sitemap-grid">${sitemapGroups().map(([h, links]) => `<section><h2>${esc(h)}</h2><ul>${links.map(([l, p]) => `<li><a href="${base}${p}">${esc(l)}</a></li>`).join('')}</ul></section>`).join('')}</div></div>`
}
export function sitemapXml(base) {
  const paths = new Set(['/', '/sitemap', '/search'])
  for (const m of MENU) { paths.add(m.path); for (const c of m.cols || []) for (const [, p] of c.links) paths.add(p) }
  for (const [, links] of FOOTER) for (const [, p] of links) paths.add(p)
  for (const [, links] of sitemapGroups()) for (const [, p] of links) paths.add(p)
  for (const p of Object.keys(LANDINGS)) paths.add(p)
  for (const d of DEPARTMENTS) paths.add('/' + d.id)
  const urls = [...paths].map(p => `  <url><loc>${esc(base + (p === '/' ? '/' : p))}</loc></url>`).join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}

