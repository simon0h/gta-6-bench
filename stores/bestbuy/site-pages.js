// Real-site page shapes for Best Buy: homepage sections, department/category landing pages,
// membership / credit card / trade-in / gift card / business landing pages, help and policy
// pages, order lookup and the HTML site map. Content summarised from bestbuy.com (2026-10-13).
// Products are never invented here: grids receive only the store's active catalog rows.
import { esc } from '../../lib/html.js'
import { TREE, NODES, SECTIONS, FOOTER, LEGAL, HEADER_LINKS, SUPPORT_PANEL } from './site-tree.js'

const P = {
  outlet: '/site/electronics/outlet-refurbished-clearance/pcmcat142300050026.c',
  dotd: '/site/misc/deal-of-the-day/pcmcat248000050016.c',
  membership: '/site/electronics/best-buy-membership/pcmcat1679668833285.c',
  credit: '/site/misc/financing-rewards/pcmcat102500050032.c',
  giftCards: '/site/electronics/gift-cards/cat09000.c',
  giftIdeas: '/site/electronics/gift-ideas/abcat0010000.c',
  tradeIn: '/site/best-buy-trade-in/trade-in-offers/pcmcat1774297472214.c',
  business: '/site/electronics/bestbuy-business/pcmcat230900050001.c',
  app: '/site/misc/mobile-app/pcmcat208500050016.c',
  tvs: '/site/tv-home-theater/tvs/abcat0101000.c',
  protection: '/site/electronics/services/pcmcat1528819595254.c',
  shipping: '/site/help-topics/shipping-delivery-store-pickup/pcmcat316000050003.c',
  returns: '/site/help-topics/return-exchange-policy/pcmcat260800050014.c',
  schedule: '/services/triage/home',
  expert: '/services/triage/shopping',
  memberDeals: '/site/best-buy-membership/member-deals/pcmcat1679678876400.c',
  hub: '/site/video-game-franchises/grand-theft-auto/pcmcat301800050002.c',
}
export const PATHS = P
const search = (base, st) => `${base}/site/searchpage.jsp?st=${encodeURIComponent(st)}`
const nodeByName = name => NODES.find(n => n.name.toLowerCase() === name.toLowerCase())
const to = (base, target) => target.startsWith('/') ? base + target : (nodeByName(target) ? base + nodeByName(target).path : search(base, target))

// ---- icons (simple line drawings standing in for the real product photography) ----
const G = {
  tv: '<rect x="6" y="10" width="36" height="22" rx="2"/><path d="M18 38h12M24 32v6"/>',
  laptop: '<rect x="10" y="12" width="28" height="18" rx="2"/><path d="M5 36h38l-3-6H8z"/>',
  phone: '<rect x="15" y="5" width="18" height="38" rx="3"/><path d="M22 38h4"/>',
  headphones: '<path d="M9 30v-5a15 15 0 0 1 30 0v5"/><rect x="7" y="28" width="7" height="11" rx="2"/><rect x="34" y="28" width="7" height="11" rx="2"/>',
  game: '<path d="M14 16h20a8 8 0 0 1 8 8l1 9a4 4 0 0 1-7 3l-4-5H16l-4 5a4 4 0 0 1-7-3l1-9a8 8 0 0 1 8-8z"/><path d="M15 21v8M11 25h8"/><circle cx="32" cy="23" r="1.5"/><circle cx="35" cy="27" r="1.5"/>',
  camera: '<rect x="6" y="14" width="36" height="24" rx="3"/><circle cx="24" cy="26" r="7"/><path d="M17 14l3-5h8l3 5"/>',
  fridge: '<rect x="12" y="5" width="24" height="38" rx="2"/><path d="M12 19h24M16 10v5M16 24v6"/>',
  sofa: '<path d="M8 22v-5a4 4 0 0 1 4-4h24a4 4 0 0 1 4 4v5"/><path d="M5 24a3 3 0 0 1 6 0v4h26v-4a3 3 0 0 1 6 0v10H5z"/><path d="M9 34v4M39 34v4"/>',
  home: '<path d="M7 22 24 8l17 14"/><path d="M11 19v20h26V19"/><rect x="20" y="27" width="8" height="12"/>',
  car: '<path d="M8 30l3-9a4 4 0 0 1 4-3h18a4 4 0 0 1 4 3l3 9v7H8z"/><circle cx="15" cy="31" r="2"/><circle cx="33" cy="31" r="2"/>',
  watch: '<rect x="14" y="14" width="20" height="20" rx="5"/><path d="M18 14l2-8h8l2 8M18 34l2 8h8l2-8M24 19v5l3 3"/>',
  heart: '<path d="M24 40S7 30 7 18a8 8 0 0 1 17-3 8 8 0 0 1 17 3c0 12-17 22-17 22z"/>',
  sun: '<circle cx="24" cy="24" r="8"/><path d="M24 6v5M24 37v5M6 24h5M37 24h5M11 11l4 4M33 33l4 4M11 37l4-4M33 15l4-4"/>',
  toy: '<rect x="9" y="22" width="30" height="16" rx="2"/><circle cx="17" cy="16" r="5"/><circle cx="31" cy="16" r="5"/>',
  music: '<circle cx="24" cy="24" r="17"/><circle cx="24" cy="24" r="5"/>',
  scooter: '<circle cx="12" cy="36" r="5"/><circle cx="37" cy="36" r="5"/><path d="M12 36h20l6-26h4"/>',
  tag: '<path d="M6 24 22 8h18v18L24 42z"/><circle cx="33" cy="15" r="2.5"/>',
  gift: '<rect x="8" y="18" width="32" height="22" rx="2"/><path d="M6 18h36v-6H6zM24 12v28M24 12c-3-6-10-6-10-1s10 1 10 1zm0 0c3-6 10-6 10-1s-10 1-10 1z"/>',
  card: '<rect x="5" y="12" width="38" height="25" rx="3"/><path d="M5 19h38M10 30h10"/>',
  wrench: '<path d="M30 8a9 9 0 0 0-8 12L8 34a3 3 0 0 0 5 5l14-14a9 9 0 0 0 12-8l-5 4-5-1-1-5z"/>',
  star: '<path d="M24 6l5 11 12 1-9 8 3 12-11-7-11 7 3-12-9-8 12-1z"/>',
  truck: '<path d="M5 12h24v20H5zM29 19h8l6 7v6H29z"/><circle cx="13" cy="35" r="3.5"/><circle cx="36" cy="35" r="3.5"/>',
  store: '<path d="M6 18l4-10h28l4 10M6 18h36v22H6zM19 40V28h10v12"/>',
  chat: '<path d="M8 10h32v22H20l-8 7v-7H8z"/>',
}
const DEPT_ICON = { appliances: 'fridge', 'tv-home-theater': 'tv', 'computers-tablets': 'laptop', 'cell-phones': 'phone', audio: 'headphones', 'video-games': 'game', cameras: 'camera', 'home-furniture-office': 'sofa', 'smart-home': 'home', 'car-electronics': 'car', wearables: 'watch', 'health-wellness': 'heart', 'outdoor-living': 'sun', 'toys-games': 'toy', 'movies-music': 'music', 'electric-transportation': 'scooter' }
export const icon = (name, cls = 'bbx-ico') => `<svg class="${cls}" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${G[name] || G.tag}</svg>`
const iconFor = node => icon(DEPT_ICON[node.id] || DEPT_ICON[node.parent?.id] || 'tag')

// ---- shared building blocks ----
const crumbs = (base, trail) => `<nav class="bbx-crumbs" aria-label="Breadcrumb"><a href="${base}/">Best Buy</a>${trail.map(([l, p]) => ` <span aria-hidden="true">›</span> ${p ? `<a href="${base}${p}">${esc(l)}</a>` : `<span>${esc(l)}</span>`}`).join('')}</nav>`
const rail = (base, items, current = '') => `<div class="bbx-rail" role="list">${items.map(([label, path, ico]) => `<a role="listitem" class="bbx-rail-item${path === current ? ' is-current' : ''}" href="${to(base, path)}"><span class="bbx-rail-circle">${icon(ico || 'tag')}</span><span>${esc(label)}</span></a>`).join('')}</div>`
const cards = (base, items, cls = '') => `<div class="bbx-cards ${cls}">${items.map(([label, target, desc, ico]) => `<a class="bbx-card" href="${to(base, target)}">${ico ? `<span class="bbx-card-ico">${icon(ico)}</span>` : ''}<b>${esc(label)}</b>${desc ? `<span>${esc(desc)}</span>` : ''}<em>Shop now ›</em></a>`).join('')}</div>`
const section = (title, inner, cls = '') => `<section class="bbx-section ${cls}"><h2>${title}</h2>${inner}</section>`
const editorial = (title, parts) => `<section class="bbx-editorial"><h2>${title}</h2>${parts.map(([h, t]) => `<h3>${h}</h3><p>${t}</p>`).join('')}</section>`
const chips = (base, items) => `<div class="bbx-chips">${items.map(([l, t]) => `<a class="bbx-chip" href="${to(base, t)}">${esc(l)}</a>`).join('')}</div>`
const banner = (base, { eyebrow = '', title, text = '', cta = 'Shop now', href, tone = 'navy', note = '' }) => `<a class="bbx-banner bbx-tone-${tone}" href="${to(base, href)}"><span class="bbx-banner-copy">${eyebrow ? `<span class="bbx-eyebrow">${eyebrow}</span>` : ''}<strong>${title}</strong>${text ? `<span>${text}</span>` : ''}<span class="bbx-banner-cta">${cta}</span>${note ? `<small>${note}</small>` : ''}</span><span class="bbx-banner-art" aria-hidden="true"></span></a>`
const valueProps = () => `<div class="bbx-values">${[['truck', 'Free next-day shipping on thousands of items', 'On eligible orders to most ZIP codes.'], ['store', 'Ready in one hour with Store or Curbside Pickup', 'Order online and pick it up at your store.'], ['truck', 'Same-Day Delivery', 'Available on eligible items in many areas.'], ['chat', 'Expert support', 'Get help from Blue Shirts and Geek Squad agents.']].map(([i, h, t]) => `<div>${icon(i)}<h3>${h}</h3><p>${t}</p></div>`).join('')}</div>`

// ---- homepage ----
export function homePage({ base, user, featuredHtml, heading = true }) {
  const depts = TREE.map(d => [d.name, d.path, DEPT_ICON[d.id]])
  return `<div class="bbx-home">${heading ? '<h1 class="visually-hidden">Best Buy: Shop Electronics, Appliances, Video Games and More</h1>' : ''}
<div class="bbx-hero-grid">
  ${banner(base, { eyebrow: 'Outlet Event', title: 'Outlet Event', text: 'Save up to 60% on select open-box products. Top-quality tech. Even better prices.', href: P.outlet, tone: 'outlet', note: 'Ends 10/18/26.' })}
  ${banner(base, { eyebrow: 'TV & Home Theater', title: 'Select OLED TVs from $699.99', text: 'Perfect blacks, vivid color and a picture that pops from every seat.', href: P.tvs, tone: 'oled', cta: 'Shop OLED TVs' })}
</div>
${user ? `<section class="bbx-signin-prompt"><div><b>Welcome back, ${esc(user.first_name || 'shopper')}.</b><p>Track orders, see your saved items and manage your membership.</p></div><a class="bbx-btn bbx-btn-blue" href="${base}/account">Account Home</a><a class="bbx-btn bbx-btn-outline" href="${base}/account/orders">Order Status</a></section>`
    : `<section class="bbx-signin-prompt"><div><b>Sign in for free shipping*, recommendations, easy order tracking and more.</b><p class="bbx-fine">*Free standard shipping on eligible items for My Best Buy members.</p></div><a class="bbx-btn bbx-btn-blue" href="${base}/identity/global/signin">Sign in</a><a class="bbx-btn bbx-btn-outline" href="${base}/identity/newAccount">Create an account</a></section>`}
${section('Shop by category', rail(base, depts), 'bbx-home-cats')}
<section class="bbx-section bbx-deal-strip"><h2>Today's top deals</h2>${cards(base, [['Top Deals', '/top-deals', 'Save on TVs, laptops, appliances and more.', 'tag'], ['Deal of the Day', P.dotd, 'A new deal every day. While supplies last.', 'star'], ['Exclusive Member Deals', P.memberDeals, 'Member pricing for Plus and Total members.', 'card'], ['Best Buy Outlet', P.outlet, 'Open-box, refurbished and clearance.', 'store']])}</section>
${featuredHtml}
<section class="bbx-promo-pair">
  <a class="bbx-promo bbx-promo-member" href="${base}${P.membership}"><span class="bbx-eyebrow">My Best Buy Memberships™</span><strong>Get more from every purchase.</strong><span>Member pricing, free 2-day shipping, 60-day returns and more with My Best Buy Plus™ and My Best Buy Total™.</span><em>Compare memberships ›</em></a>
  <a class="bbx-promo bbx-promo-card" href="${base}${P.credit}"><span class="bbx-eyebrow">My Best Buy® Credit Card</span><strong>Get 10% back in rewards on your first day of purchases.</strong><span>When approved, or choose financing. Plus 5% back in rewards every day at Best Buy.</span><em>Learn more ›</em></a>
</section>
${section('More ways to shop', cards(base, [['Trade-In', P.tradeIn, 'Trade in your old tech for a Best Buy e-Gift Card.', 'tag'], ['Gift Ideas', P.giftIdeas, 'Find the perfect gift for everyone on your list.', 'gift'], ['Gift Cards', P.giftCards, 'No expiration date or fees.', 'card'], ['Shop with an Expert', P.expert, 'Free, personalized advice.', 'chat'], ['Schedule a Service', P.schedule, 'Repairs, setup and installation from Geek Squad.', 'wrench'], ['Best Buy Business', P.business, 'Technology and services for every business.', 'store']]), 'bbx-more')}
</div>`
}

// GTA VI franchise row shown on the homepage in reference mode (only the catalog's real listings).
export function gtaRow(base, tilesHtml) {
  return `<section class="bbx-section bbx-gta"><div class="bbx-section-head"><h2>Pre-order Grand Theft Auto VI</h2><a href="${base}${P.hub}">See all Grand Theft Auto VI ›</a></div><div class="bb-grid bbx-grid">${tilesHtml}</div></section>`
}

// ---- department / category landing pages ----
const DEPT_SECTIONS = {
  'tv-home-theater': base => [
    section('Shop confidently at Best Buy', cards(base, [['Home theater protection plans', P.protection, 'Protect your TV from the unexpected.', 'star'], ['TV mounting and install services', P.schedule, 'Let Geek Squad mount and set up your TV.', 'wrench'], ['Free shipping and delivery', P.shipping, 'On TVs and home theater items.', 'truck']])),
    section('Budget-friendly finds', chips(base, [['TVs under $500', 'TVs'], ['Sound bars under $200', 'Sound Bars'], ['Streaming devices under $50', 'Streaming Devices'], ['TV & Home Theater Deals', 'TV & Home Theater Deals']])),
    section('Popular TV types', cards(base, [['OLED TVs', 'TVs', 'Self-lit pixels for perfect blacks.', 'tv'], ['QLED TVs', 'TVs', 'Bright, vivid quantum dot color.', 'tv'], ['4K TVs', 'TVs', 'Four times the resolution of 1080p.', 'tv'], ['Projectors & Screens', 'Projectors & Screens', 'Big-screen cinema at home.', 'tv']])),
    section('Complement your lifestyle', chips(base, [['Outdoor Home Theater', 'Outdoor Home Theater'], ['Home Theater & Stereo Systems', 'Home Theater & Stereo Systems'], ['Blu-ray and DVD Players', 'Blu-ray and DVD Players']])),
    section('Accessorize your space', chips(base, [['TV Stands & Mounts', 'TV Stands & Mounts'], ['TV & Home Theater Accessories', 'TV & Home Theater Accessories'], ['Sound Bars', 'Sound Bars'], ['Home Audio', 'Home Audio']])),
    section('Choose your streaming platform', chips(base, [['Roku', 'Streaming Devices'], ['Fire TV', 'Streaming Devices'], ['Google TV', 'Streaming Devices'], ['Apple TV', 'Streaming Devices']])),
    section('Highly rated add-ons', chips(base, [['Sound Bars', 'Sound Bars'], ['TV Mounts', 'TV Stands & Mounts'], ['HDMI Cables', 'TV & Home Theater Accessories']])),
  ],
  'video-games': base => [
    section('Trending from Best Buy &amp; IGN', cards(base, [['Xbox', 'XBOX', 'Consoles, games and controllers.', 'game'], ['PlayStation', 'PlayStation', 'PS5 consoles, games and accessories.', 'game'], ['Nintendo', 'Nintendo', 'Nintendo Switch 2 and more.', 'game'], ['Virtual reality', 'Virtual Reality', 'Step inside the game.', 'game'], ['Handheld gaming', 'Handheld Gaming', 'Play anywhere.', 'game'], ['PC gaming', 'PC Gaming', 'Gaming laptops, desktops and gear.', 'laptop'], ['Retro gaming and arcade', 'Retro Gaming & Arcade', 'Classic consoles and cabinets.', 'game'], ['Video game accessories', 'Video Game Accessories', 'Controllers, headsets and storage.', 'headphones'], ['Video game releases and events', 'Video Game Releases & Events', 'Pre-order upcoming games, including Grand Theft Auto VI.', 'star']])),
  ],
  'computers-tablets': base => [
    section('Shop accessories', chips(base, [['Computer Accessories & Peripherals', 'Computer Accessories & Peripherals'], ['Monitors', 'Monitors'], ['Hard Drives, SSD & Storage', 'Hard Drives, SSD & Storage'], ['Printers, Ink & Toner', 'Printers, Ink & Toner'], ['Wi-Fi & Networking', 'Wi-Fi & Networking']])),
    section('Services and memberships', cards(base, [['Protection & Support Plans', P.protection, 'Coverage for drops, spills and failures.', 'star'], ['Schedule a Service', P.schedule, 'Setup, repairs and data transfer.', 'wrench'], ['My Best Buy Memberships', P.membership, '24/7 tech support with My Best Buy Total.', 'card']])),
    section('Featured technology', cards(base, [['AI PCs', 'Laptops', 'Built-in AI features for work and play.', 'laptop'], ['Tablets', 'Tablets', 'Stream, sketch and browse anywhere.', 'phone'], ['PC Gaming', 'PC Gaming', 'High-refresh displays and powerful graphics.', 'game']])),
  ],
}
const EDITORIAL = {
  'tv-home-theater': ['Building a home theater system', [['Why create a home theater?', 'A home theater brings the big-screen experience to your living room, with immersive sound and picture for movies, sports and gaming.'], ['Designing the best home theater system for you', 'Start with the right TV or projector for your room size and viewing distance, then add a sound bar or surround system and a streaming device.']]],
  'video-games': ['Shopping for video games at Best Buy', [['Choosing new video games or classic video game favorites', 'Shop new releases and pre-orders alongside classic favorites for PlayStation, Xbox, Nintendo and PC.'], ['The best video game consoles for your gaming sessions', 'Compare consoles by exclusive games, online services, storage and whether you play at home, on the go or both.']]],
  'computers-tablets': ['Powering your day with computers and tablets', [['How computers and tablets fit into everyday life', 'Laptops handle work and school, desktops power creative projects and gaming, and tablets are great for streaming and reading.'], ['Setting up and using your computer and tablet', 'Transfer your data, set up security software and connect accessories, or let Geek Squad do it for you.']]],
}

export function categoryPage({ base, node, tilesHtml, count, shown = count, moreHref = '', sort = '' }) {
  const dept = node.parent || node
  const siblings = dept.subs.map(s => [s.name, s.path, DEPT_ICON[dept.id]])
  const trail = node.parent ? [[dept.name, dept.path], [node.name]] : [[node.name]]
  const extra = !node.parent && DEPT_SECTIONS[node.id] ? DEPT_SECTIONS[node.id](base).join('') : ''
  const ed = !node.parent && EDITORIAL[node.id] ? EDITORIAL[node.id] : [`Shopping for ${esc(node.name)} at Best Buy`, [[`Finding the right ${esc(node.name.toLowerCase())}`, `${esc(node.intro || dept.intro || '')} Compare features, read specifications and check pickup or delivery options before you buy.`], ['Get help from an expert', 'Not sure what you need? Shop with an Expert for free advice, or add a protection plan and Geek Squad setup.']]]
  const sorts = [['', 'Best Match'], ['price_low', 'Price Low to High'], ['price_high', 'Price High to Low'], ['rating', 'Customer Rating']]
  return `${crumbs(base, trail)}
<div class="bbx-cat-head"><h1>${esc(node.name)}</h1>${node.intro || !node.parent ? `<p>${esc(node.intro || dept.intro)}</p>` : ''}</div>
${rail(base, siblings, node.path)}
${!node.parent && !DEPT_SECTIONS[node.id] ? section('Shop confidently at Best Buy', cards(base, [['Free shipping', P.shipping, 'On thousands of items, with fast Store Pickup.', 'truck'], ['Price Match Guarantee', '/site/help-topics/price-match-guarantee/pcmcat290300050002.c', 'We match key online and local competitors.', 'tag'], ['Protection & Support Plans', P.protection, 'Coverage from Geek Squad.', 'star']])) : ''}
${extra}
<section class="bbx-section bbx-cat-results" id="products"><div class="bbx-results-head"><h2>${esc(node.name)} <span>(${count} ${count === 1 ? 'item' : 'items'})</span></h2><form class="bbx-sort" method="get" action="${base}${node.path}#products"><label for="cat-sort">Sort by:</label><select id="cat-sort" name="sort">${sorts.map(([v, l]) => `<option value="${v}"${sort === v ? ' selected' : ''}>${l}</option>`).join('')}</select><button class="bbx-btn bbx-btn-outline bbx-btn-sm">Apply</button></form></div>
${count ? `<div class="bb-grid bbx-grid">${tilesHtml}</div>${shown < count ? `<p class="bbx-more">Showing ${shown} of ${count} items. <a href="${moreHref}">See all ${count} items ›</a></p>` : ''}` : `<div class="bbx-empty">${icon('store', 'bbx-empty-ico')}<h3>No products in this category are available from this store right now.</h3><p>This local Best Buy carries a limited catalog. Try another category, search, or browse <a href="${base}/top-deals">Top Deals</a>.</p><a class="bbx-btn bbx-btn-blue" href="${search(base, node.name)}">Search ${esc(node.name)}</a></div>`}
</section>
${editorial(ed[0], ed[1])}`
}

// ---- deal / landing pages that wrap the existing search results ----
const TOP_DEAL_TILES = [['Apple', 'Apple'], ['Exclusive Member Deals', P.memberDeals], ['TV & Home Theater', 'TV & Home Theater Deals'], ['Computers & Tablets', 'Computers & Tablets Deals'], ['All Video Games', 'Video Games Deals'], ['Appliances', 'Appliance Deals'], ['Headphones', 'Headphones'], ['Cameras, Camcorders & Drones', 'Cameras, Camcorders & Drones'], ['Wearable Technology', 'Wearable Technology'], ['Cell Phones', 'Cell Phone Deals'], ['Toys, Games & Crafts', 'Toys, Games & Crafts'], ['Home, Furniture & Office', 'Home, Furniture & Office'], ['Small Kitchen Appliances', 'Small Kitchen Appliances'], ['Smart Home, Security & Wi-Fi', 'Smart Home, Security & Wi-Fi'], ['Home Audio & Speakers', 'Audio'], ['Outdoor Living', 'Outdoor Living'], ['Car Electronics', 'Car Electronics & GPS'], ['Electric Transportation', 'Electric Transportation'], ['Health, Wellness & Personal Care', 'Health, Wellness & Fitness'], ['Music, Movies & TV Shows', 'Movies & Music'], ['Outlet Deals', P.outlet], ['Gift Cards & Subscriptions', P.giftCards]]
export const landings = {
  topDeals: base => ({
    before: `${crumbs(base, [['Top Deals']])}<div class="bbx-cat-head"><h1>Top Deals</h1><p>Shop the latest deals on TVs, laptops, appliances, video games and more.</p></div>${rail(base, TOP_DEAL_TILES.map(([l, t]) => [l, t, 'tag']))}<div class="bbx-hero-grid">${banner(base, { eyebrow: 'Limited time', title: 'Save up to $600 on select laptops', text: 'Powered by Intel®.', href: 'Laptops', tone: 'navy' })}${banner(base, { eyebrow: 'Fresh finds', title: 'Discover deals on fresh finds', text: 'New markdowns across the store.', href: 'Top Deals', tone: 'yellow' })}</div>`,
    after: `${section('12 month financing', `<p class="bbx-lead">On storewide purchases of $299 and up with your My Best Buy® Credit Card. <a href="${base}${P.credit}">See details</a></p>`, 'bbx-finance')}<section class="bbx-editorial"><h2>Top Deals details:</h2><p>Prices and offers are subject to change and may not be available in all stores.</p></section>${editorial('Scoring top deals and saving big with Best Buy', [['Why pay more when the best deals are here?', 'Top Deals gathers our best current prices in one place, refreshed often across every department.'], ['Getting the most from the top deals at Best Buy', 'Sign in to see member pricing, use our Price Match Guarantee, and check Deal of the Day for limited-time offers.']])}`,
  }),
  dealOfTheDay: base => ({
    before: `${crumbs(base, [['Deal of the Day']])}<div class="bbx-cat-head bbx-dotd-head"><h1>Deal of the Day</h1><p>One great deal every day, plus bonus deals. While supplies last.</p></div><div class="bbx-empty bbx-dotd-main">${icon('star', 'bbx-empty-ico')}<h2>Today's Deal of the Day</h2><p>One featured price, today only, while supplies last. Today's deal and bonus deals appear below.</p></div><h2 class="bbx-bonus-title">Bonus Deals of the Day</h2>`,
    after: `<section class="bbx-section bbx-alerts"><h2>Get the Deal of the Day delivered to you</h2><form method="post" action="${base}/newsletter" class="bbx-inline-form"><label for="dotd-email">Email</label><input id="dotd-email" type="email" name="deals_email" autocomplete="email"><input type="hidden" name="source" value="deal-of-the-day"><button class="bbx-btn bbx-btn-blue">Sign Up</button></form><p class="bbx-fine">Text alerts are also available on the real site. This local store does not send emails or texts.</p></section>${valueProps()}${section('Save up to 50% on must-have tech', `<p class="bbx-lead">Top-quality tech. Even better prices. <a href="${base}${P.outlet}">Shop the Best Buy Outlet</a></p>`)}${editorial('Exploring the Deal of the Day', [['Benefits of Best Buy daily deals', 'A new featured deal goes live every day, with bonus deals across departments.'], ['Getting the most out of daily deals', 'Check back daily, sign up for alerts and choose Store Pickup to get your deal fast.']])}`,
  }),
  outlet: base => ({
    before: `${crumbs(base, [['Best Buy Outlet']])}<div class="bbx-cat-head"><h1>Best Buy Outlet</h1><p>Open-box, refurbished and clearance products, inspected and backed by our standard return policy.</p></div>${banner(base, { eyebrow: 'Outlet Event', title: 'Top-quality tech. Even better prices.', text: 'Save up to 60% on select open-box products.', href: '/outlet', tone: 'outlet', note: 'Ends 10/18/26.' })}${section('Open-box', rail(base, [['Computers & Tablets', 'Computers & Tablets', 'laptop'], ['TV & Home Theater', 'TV & Home Theater', 'tv'], ['Major Appliances', 'Appliances', 'fridge'], ['Small Appliances', 'Small Kitchen Appliances', 'fridge'], ['Cell Phones', 'Cell Phones', 'phone'], ['Wearable Technology', 'Wearable Technology', 'watch'], ['Video Games', 'Video Games', 'game'], ['Headphones', 'Headphones', 'headphones'], ['Home Audio & Speakers', 'Audio', 'headphones'], ['Car Electronics & GPS', 'Car Electronics & GPS', 'car'], ['Home, Furniture & Office', 'Home, Furniture & Office', 'sofa'], ['Health, Wellness & Fitness', 'Health, Wellness & Fitness', 'heart'], ['Cameras, Camcorders & Drones', 'Cameras, Camcorders & Drones', 'camera'], ['Toys, Games & Crafts', 'Toys, Games & Crafts', 'toy'], ['Smart Home', 'Smart Home, Security & Wi-Fi', 'home'], ['Outdoor Living', 'Outdoor Living', 'sun']]))}<h2 class="bbx-bonus-title">Shop the Best Buy Outlet</h2>`,
    after: editorial('About open-box at Best Buy', [['What is open-box?', 'Open-box items were returned or used as display models. Each is inspected and graded Excellent, Good or Fair.'], ['Returns and protection', 'Open-box products have the same return and exchange period as new products.']]),
  }),
  giftIdeas: base => ({
    before: `${crumbs(base, [['Gift Ideas']])}<div class="bbx-cat-head"><h1>Gift Ideas</h1><p>Find something for everyone on your list.</p></div>${banner(base, { eyebrow: 'Gift guide', title: 'Top 26 Tech Gifts of 2026', text: 'The year\'s most wanted tech, all in one place.', href: 'Top Deals', tone: 'navy' })}${section('Who are you shopping for?', chips(base, ['Gifts for him', 'Gifts for her', 'Treat yourself', 'Gifts for teens', 'Gifts for kids', 'Gifts for families', 'Gifts for significant others', 'Gifts for grandparents', 'Gifts for pets'].map(l => [l, l])))}${section('Gifts that give more', chips(base, [['Under $25', '/gift-ideas?price=under25'], ['$25–$50', '/gift-ideas?price=25to50'], ['$50–$100', '/gift-ideas?price=50to100'], ['$100–$250', '/gift-ideas?price=100to500'], ['$250+', '/gift-ideas?price=over500']]))}${section('What they want for what they love', chips(base, ['Content creation', 'Crafting', 'Fitness', 'Grooming', 'Home gifts', 'Memory keeping', 'Sports fan gifts', 'Travel gifts', 'Toys, games, and crafts', 'Trading cards and collectibles', 'Stocking stuffers', 'White elephant'].map(l => [l, l])))}${section('Shop gifts by brand', chips(base, ['Amazon', 'Apple', 'Dyson', 'Meta', 'Microsoft', 'Nintendo', 'Samsung', 'Sonos'].map(l => [l, l])))}<h2 class="bbx-bonus-title">Gift ideas available from this store</h2>`,
    after: editorial('Gifting Ideas They\'ll Love', [['Great gifts for all ages', 'From headphones and smartwatches to games and kitchen gadgets, tech makes a gift they will use every day.'], ['Gift ideas for every occasion', 'Birthdays, graduations, holidays and housewarmings. Add a gift receipt at checkout.'], ['The coolest gifts are electronics gifts', 'Not sure what to get? A Best Buy Gift Card lets them choose.']]),
  }),
}

// ---- standalone landing pages ----
export function membershipPage(base) {
  const tier = (name, price, items, cls) => `<article class="bbx-tier ${cls}"><h2>${name}</h2><p class="bbx-tier-price">${price}</p><ul>${items.map(i => `<li>${i}</li>`).join('')}</ul></article>`
  return `${crumbs(base, [['My Best Buy Memberships']])}<div class="bbx-cat-head bbx-member-head"><h1>Meet the My Best Buy Memberships™</h1><p>Choose the membership that fits how you shop. Enrollment and paid benefits are not available in this local store.</p></div>
<div class="bbx-tiers">${tier('My Best Buy Total™', '$199.99/yr', ['Protection plans, including AppleCare+, for up to 24 months', '24/7 VIP tech support', 'Free in-store and remote computer and tablet services', '20% off repair labor', 'Member pricing and early access to sales', '60-day returns and exchanges', 'Free 2-day shipping'], 'is-total')}${tier('My Best Buy Plus™', '$29.99/yr', ['Member pricing and access to deals and events', '60-day returns and exchanges', 'Free 2-day shipping'], 'is-plus')}${tier('My Best Buy®', 'Free', ['Free standard shipping', 'Order tracking', 'Convenient checkout', 'Personalized shopping'], 'is-free')}</div>
${section('Get 6% back in rewards', '<p class="bbx-lead">Plus and Total members get 1% back in rewards, or 6% back when paired with the My Best Buy® Credit Card.</p>')}
${section('Exclusive access to sales and events', `<p class="bbx-lead">Members get member pricing and early access. <a href="${base}${P.memberDeals}">Don’t miss out on exclusive deals.</a></p>`)}
${section('Product protection is included for Total members', `<p class="bbx-lead">Eligible purchases are covered. <a href="${base}${P.protection}">Learn about protection plans</a></p>`)}
${section('Popular services are included', `<p class="bbx-lead">Total members get free in-store and remote computer and tablet services. <a href="${base}${P.schedule}">Schedule a Service</a></p>`)}
${section('Still have questions?', `<p class="bbx-lead"><a href="${base}/support">Visit our Support Center</a> or <a href="${base}/contact-us">contact us</a>.</p>`)}
${section('Ready to get more from every purchase?', `<p class="bbx-lead"><a class="bbx-btn bbx-btn-blue" href="${base}/identity/newAccount">Create an account</a></p>`)}
${editorial('Saving on products and services with a My Best Buy™ membership', [['Which membership is right for you?', 'Total adds protection and support on top of Plus pricing and shipping. My Best Buy is free for everyone.']])}`
}
export function creditPage(base) {
  return `${crumbs(base, [['Credit Cards']])}<div class="bbx-cat-head"><h1>My Best Buy® Credit Cards</h1><p>Get 10% back in rewards on your first day of purchases when approved, or choose financing.</p></div>
<div class="bbx-hero-grid">${banner(base, { eyebrow: 'New cardmember offer', title: '10% back in rewards', text: 'On your first day of purchases when approved, or choose financing.', href: '/identity/sso/signin', tone: 'navy', cta: 'Learn more' })}${banner(base, { eyebrow: 'Everyday rewards', title: '5% back in rewards at Best Buy', text: 'With Standard Credit on qualifying purchases.', href: P.membership, tone: 'yellow', cta: 'See memberships' })}</div>
${section('Cardmember offers', cards(base, [['12 months financing', 'Top Deals', 'Storewide on purchases of $299 and up.', 'card'], ['18 months on appliances', 'Appliances', 'On appliance purchases of $599 and up.', 'fridge'], ['24 months on home theater', 'TV & Home Theater', 'On purchases of $999 and up.', 'tv'], ['24 months on unlocked phones', 'Unlocked Cell Phones', 'On purchases of $649 and up.', 'phone']]))}
${section('Make the most of your Card', '<p class="bbx-lead">The My Best Buy® Visa® Card earns 3% back on gas, 2% on grocery, dining and takeout, and 1% everywhere else Visa is accepted, with no foreign transaction fees.</p>')}
${section('Credit Card dashboard', `<p class="bbx-lead">View your rewards, offers and statements. <a href="${base}/identity/sso/signin">Pay Your Bill at Citibank</a></p>`)}
${section('All your Card benefits. All in one app.', `<p class="bbx-lead"><a href="${base}${P.app}">Get the Best Buy app</a></p>`)}
${section('Ways to pay your bill', '<p class="bbx-lead">Pay online, by phone, by mail or in any Best Buy store. Credit applications and payments are not connected in this local store.</p>')}
<section class="bbx-editorial"><h2>Disclosures</h2><p>Subject to credit approval. The My Best Buy® Credit Card is issued by Citibank, N.A.</p></section>`
}
export function tradeInPage(base) {
  const cats = ['Cell phones', 'Headphones', 'Tablets', 'E-readers', 'Wearables', 'Computers', 'Gaming consoles', 'Gaming accessories', 'Networking', 'Computing accessories', 'Smart home', 'Cameras and camcorders', 'Health and wellness', 'Apple accessories']
  return `${crumbs(base, [['Trade-In']])}<div class="bbx-cat-head"><h1>Trade-In Offers</h1><p>Trade in your old devices for a Best Buy e-Gift Card or credit toward something new.</p></div>
${banner(base, { eyebrow: 'Trade-In', title: 'Trade in your device', text: 'Get value for the tech you no longer use.', href: P.tradeIn + '#how', tone: 'navy', cta: 'See how it works' })}
<section class="bbx-section" id="how"><h2>How trade-in works</h2><h3>Turn used tech into instant value</h3><ol class="bbx-steps"><li><b>Estimate the trade-in value</b> of your device.</li><li><b>Prepare the device:</b> back up your data, turn off location features and do a factory reset.</li><li><b>Bring or ship the device</b> to a participating store's Geek Squad counter, or ship it with a provided label.</li><li><b>Use the trade-in credit</b> toward a new device.</li></ol><p class="bbx-fine">Trade-in valuations, mail-in kits and store appointments are not available in this local store.</p></section>
${section('Trade-in promotions', cards(base, [['Up to $1,995 in trade-in for qualifying tech', 'Cameras, Camcorders & Drones', 'Trade in eligible cameras, lenses or action cameras.', 'camera'], ['Recycle a PC accessory and save 20%', 'Computer Accessories & Peripherals', 'On select Logitech accessories.', 'laptop']]))}
${section('Explore trade-in categories', chips(base, cats.map(c => [c, c])))}
${section('Savings. Support. Protection. It\'s the total package.', `<p class="bbx-lead"><a href="${base}${P.membership}">Learn about My Best Buy Total™</a></p>`)}
${section('12 month financing', `<p class="bbx-lead">On storewide purchases of $299 and up. <a href="${base}${P.credit}">See details</a></p>`)}
${section('Let’s lighten the landfills', `<p class="bbx-lead">We recycle all kinds of tech, no matter how old or where you bought it. <a href="${base}/site/services/recycling/pcmcat149900050025.c">Haul Away &amp; Recycling</a></p>`)}
${section('Trade-in FAQs', '<p class="bbx-lead"><b>What do I get?</b> A Best Buy e-Gift Card for the assessed value of an eligible device.</p>')}`
}
export function giftCardsPage(base) {
  return `${crumbs(base, [['Gift Cards']])}<div class="bbx-cat-head"><h1>Best Buy Gift Cards</h1><p>Give them the freedom to choose.</p></div>
${rail(base, [['Best Buy E-Gift Cards', '/gift-card-balance', 'card'], ['Holiday Gift Cards', 'Holiday Gift Cards', 'gift'], ['Any Occasion Gift Cards', 'Any Occasion Gift Cards', 'gift'], ['Corporate Gift Cards', 'Corporate Gift Cards', 'store'], ['Specialty Gift Cards', 'Gaming Gift Cards', 'game'], ['All Best Buy Gift Cards', 'Gift Cards', 'card']])}
${cards(base, [['Gift ideas made easy', P.giftIdeas, 'Send an e-gift card in minutes.', 'gift'], ['Check your gift card balance', '/gift-card-balance', 'See what is left on your card.', 'card'], ['Avoid gift card fraud', '/site/help-topics/privacy-policy/pcmcat204400050062.c', 'Never pay a bill or fee with a gift card.', 'star'], ['No expiration date or fees', P.returns, 'Use them in store or online.', 'tag']])}
<section class="bbx-section bbx-cat-results"><div class="bbx-results-head"><h2>Featured Best Buy Gift Cards <span>(0 items)</span></h2></div><div class="bbx-empty">${icon('card', 'bbx-empty-ico')}<h3>Gift cards can't be purchased in this local store.</h3><p>Gift card issuance and redemption aren't connected here. <a href="${base}${P.giftIdeas}">Browse gift ideas</a> instead.</p></div></section>
${section('Best-selling gift cards', '<p class="bbx-lead">Gaming, streaming, dining and retail gift cards are sold on the real site. None are available in this local store.</p>')}
${cards(base, [['Reward your customers with corporate gift cards', P.business, 'Bulk gift cards for business incentives.', 'store'], ['Their next favorite thing is here', P.giftIdeas, 'Shop gift ideas.', 'gift']])}
<section class="bbx-editorial"><h2>Exploring Best Buy Gift Cards</h2><h3>Benefits of Best Buy Gift Cards and e-gift cards</h3><p>Gift cards let them pick exactly what they want, from <a href="${base}/site/electronics/video-games/abcat0700000.c">video games</a> to <a href="${base}/site/home-appliances/small-appliances/abcat0912000.c">small kitchen appliances</a> and <a href="${base}/site/tv-home-theater/streaming-media-devices/pcmcat161100050040.c">streaming devices</a>.</p><h3>Choosing the best gift card or e-gift card</h3><p>Think about the recipient, your budget and the occasion. Best Buy Gift Cards have no expiration date or fees.</p></section>`
}
export function giftBalancePage(base, { values = {}, error = '' } = {}) {
  return `${crumbs(base, [['Gift Cards', P.giftCards], ['Gift Card Balance']])}<div class="bbx-form-page"><h1>Check Your Gift Card Balance</h1><p>Enter the card number and PIN from the back of your Best Buy Gift Card.</p>${error ? `<p class="bbx-alert" role="alert">${esc(error)}</p>` : ''}<form method="post" action="${base}/gift-card-balance" class="bbx-form"><label for="gc-number">Card Number</label><input id="gc-number" name="cardNumber" inputmode="numeric" autocomplete="off" value="${esc(values.cardNumber || '')}"><label for="gc-pin">PIN</label><input id="gc-pin" name="pin" inputmode="numeric" autocomplete="off"><button class="bbx-btn bbx-btn-blue">Check Balance</button></form><p class="bbx-fine">No gift cards have been issued by this local store, so balances can't be found.</p></div>`
}
export function businessPage(base) {
  return `${crumbs(base, [['Best Buy Business']])}<div class="bbx-cat-head"><h1>Best Buy Business</h1><p>Technology and services for businesses and schools of all sizes.</p></div>
${banner(base, { eyebrow: 'Best Buy Business', title: 'Your success is our business', text: 'Products, services and expertise for every kind of organization.', href: P.business + '#connect', tone: 'navy', cta: 'Connect with us' })}
${section('Need help with a complex project?', '<p class="bbx-lead">Custom solutions for large-scale projects, including nationwide services.</p>')}
${section('Need to make a purchase for your small business?', `<p class="bbx-lead">Open a free online account for volume purchasing and exclusive savings. <a href="${base}/site/bestbuy-business/best-buy-business-financing/pcmcat1556029048796.c">Best Buy Business Financing</a></p>`)}
<section class="bbx-section" id="connect"><h2>Connect with us</h2><div class="bbx-cards">${[['Chat with an Account Manager', 'Weekdays, 9 a.m.–5 p.m. CT.', 'chat'], ['Call an Account Manager', 'Weekdays, 7 a.m.–6:30 p.m. CT.', 'phone'], ['Email us', 'Tell us about your project.', 'chat']].map(([h, t, i]) => `<div class="bbx-card is-static"><span class="bbx-card-ico">${icon(i)}</span><b>${h}</b><span>${t}</span><span class="bbx-fine">Not connected in this local store.</span></div>`).join('')}</div></section>`
}
export function appPage(base) {
  return `${crumbs(base, [['Best Buy app']])}<div class="bbx-cat-head"><h1>Best Buy Mobile App</h1></div>
${banner(base, { eyebrow: 'Best Buy app', title: 'The gotta-have app for gotta-have tech', text: 'Available on the App Store and Google Play.', href: P.app + '#features', tone: 'navy', cta: 'See features' })}
<section class="bbx-section" id="features"><h2>App features</h2><div class="bbx-cards">${[['Rewards tracking', 'Track progress toward your next reward.'], ['Member Picks', 'One deeply discounted item per set, only in the app.'], ['Best Buy Wallet', 'Benefits, offers and favorites in one place.'], ['Best Buy Drops', 'Early access to limited releases.'], ['Personalized deals', 'Recommendations tailored to you.'], ['Alerts', 'Deals, price drops and restocks.'], ['AR Viewer', 'See how a product looks in your home.'], ['In-store self-checkout', 'Scan items to check out faster.']].map(([h, t]) => `<div class="bbx-card is-static"><b>${h}</b><span>${t}</span></div>`).join('')}</div><p class="bbx-fine">App downloads are not available from this local store.</p></section>`
}

// ---- help / policy / info pages ----
export function infoPage(base, path, page) {
  const groupLinks = { 'Help Topics': '/support', 'Legal &amp; Privacy': '/site/help-topics/privacy-policy/pcmcat204400050062.c' }
  return `${crumbs(base, [[page.group.replace('&amp;', '&'), groupLinks[page.group] || '/support'], [page.title.replace('&amp;', '&')]])}<div class="bbx-info"><article><h1>${page.title}</h1><p class="bbx-lead">${page.lead}</p>${page.sections.map(([h, html]) => `<section><h2>${h}</h2>${html}</section>`).join('')}${page.links ? `<p>${page.links.map(([l, p]) => `<a class="bbx-btn bbx-btn-outline" href="${base}${p}">${esc(l)}</a>`).join(' ')}</p>` : ''}</article>
<aside class="bbx-info-aside"><h2>Need more help?</h2><a href="${base}/support">Visit our Support Center</a><a href="${base}/profile/ss/orderlookup">Check Order Status</a><a href="${base}/contact-us">Contact Us</a><a href="${base}/site/store-locator">Find a Store</a></aside></div>`
}

// ---- order lookup ----
export function orderLookupPage(base, { values = {}, error = '', result = '' } = {}) {
  return `${crumbs(base, [['Order Status']])}<div class="bbx-form-page"><h1>Check Order Status</h1><p>Find your order with your order number and the email address you used at checkout. <a href="${base}/identity/global/signin">Sign in</a> to see all your purchases.</p>${error ? `<p class="bbx-alert" role="alert">${esc(error)}</p>` : ''}${result}<form method="get" action="${base}/profile/ss/orderlookup" class="bbx-form"><label for="ol-order">Order Number</label><input id="ol-order" name="orderNumber" placeholder="BBY01-" value="${esc(values.orderNumber || '')}"><label for="ol-email">Email Address</label><input id="ol-email" name="email" type="email" autocomplete="email" value="${esc(values.email || '')}"><button class="bbx-btn bbx-btn-blue">Check Status</button></form><p class="bbx-fine">Only orders placed in this browser can be found.</p></div>`
}

// ---- site map ----
export function sitemapPage(base) {
  return `${crumbs(base, [['Site Map']])}<div class="bbx-cat-head"><h1>Site Map</h1><p>Every department, category and service page in this Best Buy store.</p></div>
<div class="bbx-sitemap">${TREE.map(d => `<section><h2><a href="${base}${d.path}">${esc(d.name)}</a></h2><ul>${d.subs.map(s => `<li><a href="${base}${s.path}">${esc(s.name)}</a></li>`).join('')}</ul></section>`).join('')}
<section><h2>Shop &amp; Services</h2><ul>${SECTIONS.map(([l, p]) => `<li><a href="${base}${p}">${esc(l)}</a></li>`).join('')}</ul></section>
${FOOTER.map(([h, links]) => `<section><h2>${esc(h)}</h2><ul>${links.map(([l, p]) => `<li><a href="${base}${p}">${esc(l)}</a></li>`).join('')}</ul></section>`).join('')}
<section><h2>Legal &amp; Privacy</h2><ul>${LEGAL.map(([l, p]) => `<li><a href="${base}${p}">${esc(l)}</a></li>`).join('')}</ul></section></div>`
}
export function sitemapXml(base) {
  const paths = ['/', ...HEADER_LINKS.map(x => x[1]), ...NODES.map(n => n.path), ...SECTIONS.map(x => x[1]), ...SUPPORT_PANEL.map(x => x[1]), ...FOOTER.flatMap(([, l]) => l.map(x => x[1])), ...LEGAL.map(x => x[1]), '/sitemap']
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...new Set(paths)].map(p => `  <url><loc>${esc(base + p)}</loc></url>`).join('\n')}\n</urlset>\n`
}
