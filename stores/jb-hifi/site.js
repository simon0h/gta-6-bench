// JB Hi-Fi site chrome (header, footer, homepage) and the non-checkout pages that mirror
// jbhifi.com.au: /collections/all, department + sub-category landings, /pages/* help, service
// and policy pages, /blogs/*, the HTML site map and /sitemap.xml. Product grids only ever list
// products from the store's own catalogue (data.js); nothing here adds inventory.
import { esc, publicNotice } from '../../lib/html.js'
import { fixtureCatalog } from '../../lib/catalog-policy.js'
import { productPhoto, photoStyle } from '../../lib/product-photos.js'
import { PRODUCTS, LISTED, ASSORTMENT, productPath } from './data.js'
import { DEPARTMENT_DEFS, CAMPAIGNS, slugify } from './catalog.js'
import { DEPARTMENTS, UTILITIES, NEW_MENU, DEALS_MENU, SERVICES_MENU, POPULAR_BRANDS, FOOTER, LEGAL, HELP_TOPICS, HELP_ARTICLES, INFO_PAGES, BLOGS } from './site-data.js'

const DEPT_PHOTO = Object.fromEntries(DEPARTMENT_DEFS.map(d => [d.slug, d.photo]))
Object.assign(DEPT_PHOTO, { 'health-beauty': 'hairdryer', 'electric-transportation': 'bicycle', software: 'keyboard', 'car-audio-gps': 'smartphone', 'movies-tv': 'television' })
const SUBS = DEPARTMENTS.flatMap(d => d.subs.map(s => ({ ...s, dept: d })))
const OWN_DEPTS = new Set(DEPARTMENT_DEFS.map(d => d.slug).concat(CAMPAIGNS.map(c => c.slug)))
export const departmentBySlug = slug => DEPARTMENTS.find(d => d.slug === slug)
const haystack = p => [p.type, ...(p.crumbs || []), p.title, p.subtitle, ...(p.badges || [])].filter(Boolean).join(' ')
const deptProducts = d => LISTED.filter(p => p.crumbs?.[0] === d.title)
const subProducts = s => deptProducts(s.dept).filter(p => s.match.test(haystack(p)))
const crumbs = (base, trail) => `<nav class="jb-crumbs" aria-label="Breadcrumb"><a href="${base}/">Home</a>${trail.map(([label, href]) => ` &rsaquo; ${href ? `<a href="${base}${href}">${esc(label)}</a>` : `<span aria-current="page">${esc(label)}</span>`}`).join('')}</nav>`
const deptIcon = (slug, title) => DEPT_PHOTO[slug] ? productPhoto(DEPT_PHOTO[slug], title) : `<span class="jb-dept-mono" aria-hidden="true">${esc(title.split(/\s+/).map(w => w[0]).join('').slice(0, 3))}</span>`

// ---------- header ----------
function icon(name) {
  const paths = { track: '<path d="M4 7h16v13H4zM4 7l8-4 8 4M12 3v8M4 7l8 4 8-4"/>', store: '<path d="M3 9h18l-2-5H5zM5 9v11h14V9M9 20v-7h6v7M2 20h20"/>', user: '<circle cx="12" cy="7" r="4"/><path d="M4 21v-2a8 8 0 0116 0v2z"/>', cart: '<path d="M2 3h3l3 13h11l3-9H6"/><circle cx="9" cy="21" r="1"/><circle cx="18" cy="21" r="1"/>', heart: '<path d="M12 21L3 12C-3 5 6-1 12 6c6-7 15-1 9 6z"/>' }
  return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`
}
export function siteHeader(base, cartCount, user, reference = false) {
  const menu = (title, content, cls = '') => `<details class="jb-nav-menu ${cls}"><summary>${title}<span aria-hidden="true">⌄</span></summary><div class="jb-menu-panel">${content}</div></details>`
  const links = rows => rows.map(([label, href]) => `<a href="${base}${href}">${esc(label)}</a>`).join('')
  const products = `<a class="jb-menu-title jb-menu-all" href="${base}/collections/all">Shop all Products &rsaquo;</a>${DEPARTMENTS.map(d => `<section><a class="jb-menu-title" href="${base}/collections/${d.slug}">${esc(d.title)} &rsaquo;</a>${d.subs.slice(0, 5).map(s => `<a href="${base}/collections/${s.slug}">${esc(s.title)}</a>`).join('')}</section>`).join('')}`
  const brands = `<a class="jb-menu-title" href="${base}/pages/brands">All Brands &rsaquo;</a>${POPULAR_BRANDS.map(b => `<a href="${base}/search?query=${encodeURIComponent(b)}">${esc(b)}</a>`).join('')}`
  const utils = UTILITIES.map(([label, href, ico]) => {
    if (ico === 'user' && user) return `<a href="${base}/account"><span class="jb-ico">${icon('user')}</span>Hi, ${esc(user.first_name || 'there')}</a>`
    if (ico === 'cart') return `<a href="${base}/cart" class="jb-cart-link" aria-label="Cart, ${cartCount} items"><span class="jb-ico">${icon('cart')}${cartCount ? `<span class="jb-badge">${cartCount}</span>` : ''}</span>Cart</a>`
    return `<a href="${base}${href}"><span class="jb-ico">${icon(ico)}</span>${label}</a>`
  }).join('')
  return `<header class="jb-header">
 <div class="jb-strip"><span><b>Seen it cheaper?</b> Ask for a JB Deal! <span class="jb-strip-chat"><a href="${base}/pages/contact-us">Live chat</a> or call</span> <a class="jb-strip-call" href="${base}/pages/contact-us">13 52 44</a></span><button type="button" aria-label="Close" onclick="this.parentNode.remove()">&times;</button></div>
 <div class="jb-bar"><a class="jb-logo" href="${base}/" aria-label="JB Hi-Fi home">${reference ? '<img class="jb-reference-logo" src="/static/reference/jb-hifi/jb-logo.svg" alt="">' : '<span class="jb-wordmark">JB HI-FI</span>'}<span class="jb-tagline">ALWAYS CHEAP PRICES</span></a>
 <form class="jb-search" action="${base}/search" method="get" role="search"><input type="search" name="query" list="jb-search-suggestions" placeholder="Search products, brands, and more…" aria-label="Search products, brands, and more"><button type="submit" aria-label="Search"><svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M15.5 15.5 21 21" stroke="currentColor" stroke-width="2.4"/></svg></button><datalist id="jb-search-suggestions">${['Grand Theft Auto VI', 'PS5', 'Xbox Series X', 'headphones', 'laptop', 'iPhone', 'vinyl', 'TV'].map(v => `<option value="${v}"></option>`).join('')}</datalist></form>
 <nav class="jb-utils" aria-label="Account">${utils}</nav></div>
 <nav class="jb-nav" aria-label="Shop"><a href="${base}/collections/new">New</a>${menu('Products', products, 'jb-products-menu')}${menu('Brands', brands, 'jb-brands-menu')}${menu('Deals &amp; Catalogues', `<a class="jb-menu-title" href="${base}/pages/catalogues">All Deals &amp; Catalogues &rsaquo;</a>${links(DEALS_MENU)}`)}<a href="${base}/collections/clearance">Clearance</a>${menu('Services', `<a class="jb-menu-title" href="${base}/pages/services">All Services &rsaquo;</a>${links(SERVICES_MENU)}`)}<a href="${base}/pages/gift-cards">Gift Cards</a><a href="${base}/pages/perks">Join JB Perks</a><a href="${base}/blogs/news-and-reviews">News &amp; Reviews</a></nav></header>`
}

// ---------- footer ----------
export function siteFooter(base) {
  return `<section class="jb-footer-signup" aria-labelledby="jb-signup-title"><div><h2 id="jb-signup-title">Keep me in the loop on hot news and offers!</h2><p>Be the first to hear about catalogues, sales and new releases.</p></div><form method="post" action="${base}/newsletter"><label class="visually-hidden" for="footer-email">Email address</label><input id="footer-email" name="email" type="email" autocomplete="email" placeholder="Enter your email address"><button class="jb-btn jb-btn-black" type="submit">Sign up</button></form></section>
  <div class="jb-footer-cols">${FOOTER.map(([heading, links]) => `<div><h4>${esc(heading)}</h4>${links.map(([l, h]) => `<a href="${base}${h}">${esc(l)}</a>`).join('')}</div>`).join('')}
    <div class="jb-footer-help"><h4>Need help?</h4><p><b>Call 13 52 44</b><br>for online orders and enquiries</p><a class="jb-btn jb-btn-black jb-btn-small" href="${base}/pages/contact-us">Contact us</a><p class="jb-footer-pay" aria-label="Payment methods accepted">${['VISA', 'Mastercard', 'AMEX', 'PayPal', 'Afterpay', 'Zip', 'Apple Pay'].map(m => `<span>${m}</span>`).join('')}</p></div>
  </div>
  <div class="jb-legal"><span>&copy; 2026 JB Hi-Fi Group Pty Ltd · ABN 37 093 114 286 · All prices include GST</span><span>${LEGAL.map(([l, h]) => `<a href="${base}${h}">${esc(l)}</a>`).join('')}</span></div>
  <p class="jb-fine jb-center">^Discounts apply to previous ticketed / advertised price prior to the discount offer.</p>`
}

// ---------- homepage ----------
export function siteHome({ base, tile, artwork, catalogHome }) {
  const games = PRODUCTS.filter(p => p.kind === 'game')
  const ps5 = games.find(p => p.platform === 'ps5') || games[0]
  const tiles = DEPARTMENTS.map(d => `<a href="${base}/collections/${d.slug}"><span class="jb-dept-circle">${deptIcon(d.slug, d.title)}</span><span>${esc(d.title)}</span></a>`).join('')
  const hero = ps5 ? `<section class="jb-hero" aria-labelledby="jb-hero-title"><div class="jb-hero-copy"><p class="jb-eyebrow">PRE-ORDER NOW · RELEASES 19 NOV 26</p><h2 id="jb-hero-title">Grand Theft Auto VI</h2><p>Code in Box for PlayStation 5 and Xbox Series X|S. Pick up your copy in store to preload from 12 November.</p><p class="jb-hero-cta"><a class="jb-btn" href="${base}/collections/game-pre-orders">Pre-order now</a><a class="jb-btn jb-btn-black" href="${productPath(base, ps5)}">PS5</a>${games.filter(g => g !== ps5).map(g => `<a class="jb-btn jb-btn-black" href="${productPath(base, g)}">Xbox</a>`).join('')}</p><p class="jb-fine">Pre-order price guarantee applies.</p></div><a class="jb-hero-art" href="${productPath(base, ps5)}" tabindex="-1" aria-hidden="true">${artwork(ps5)}</a></section>` : ''
  const catalogue = `<section class="jb-catalogue-band"><div><p class="jb-eyebrow">CATALOGUES</p><h2>Current catalogues</h2><p>Shop Red Hot Deals at JB Hi-Fi! Browse this week’s catalogue and hot deals across tech, gaming and home.</p></div><div class="jb-catalogue-links"><a class="jb-btn jb-btn-black" href="${base}/pages/catalogues">View catalogues</a><a class="jb-btn jb-btn-red" href="${base}/collections/deals">Red Hot Deals</a><a class="jb-btn jb-btn-grey" href="${base}/collections/clearance">Clearance</a></div></section>`
  const perks = `<section class="jb-perks-band"><div class="jb-perks-badge" aria-hidden="true">JB<br>PERKS</div><div><h2>Join JB Perks</h2><p><b>Want a $10 welcome coupon*?</b> Join for free member benefits: member-only offers, early access to sales, a Birthday Perk and digital receipts.</p><p class="jb-fine">*Valid for 28 days from issue. T&amp;Cs apply.</p></div><a class="jb-btn" href="${base}/pages/perks">Join &amp; get my $10</a></section>`
  const services = `<section class="jb-service-section"><h2 class="jb-display">More than just products</h2><div class="jb-service-grid">${[['Installations', 'TVs, appliances and smart home set up by the experts.', '/pages/installations'], ['Trade-in', 'Trade in your old phone, tablet or console.', '/pages/tradein'], ['JB Hi-Fi ExtraCare', 'Extended care for your tech.', '/pages/extracare'], ['Interest Free Finance', 'Spread the cost with Latitude, Zip and more.', '/pages/interest-free-finance']].map(([t, c, u]) => `<a href="${base}${u}"><h3>${t} &rsaquo;</h3><p>${c}</p></a>`).join('')}</div></section>`
  const news = `<section class="jb-home-section"><div class="jb-section-heading"><h2 class="jb-display">Latest News &amp; Reviews</h2><a href="${base}/blogs/news-and-reviews">View all &rsaquo;</a></div><div class="jb-news-grid">${BLOGS.filter(b => b[0] !== 'news-and-reviews' && b[0] !== 'competitions').map(([slug, title, blurb]) => `<a href="${base}/blogs/${slug}"><span class="jb-news-kicker">${esc(title)}</span><b>${esc(blurb)}</b><span>Read more &rsaquo;</span></a>`).join('')}</div></section>`
  const brands = `<section class="jb-home-section"><div class="jb-section-heading"><h2 class="jb-display">Popular brands</h2><a href="${base}/pages/brands">All brands &rsaquo;</a></div><div class="jb-brand-links jb-brand-wall">${POPULAR_BRANDS.slice(0, 12).map(b => `<a href="${base}/search?query=${encodeURIComponent(b)}">${esc(b)}</a>`).join('')}</div></section>`
  const categories = `<section class="jb-home-section jb-shop-categories"><h2 class="jb-display">Shop by category</h2><div class="jb-departments jb-dept-grid">${tiles}</div></section>`
  const preorders = `<section class="jb-home-section"><div class="jb-section-heading"><h2 class="jb-display">Gaming pre-orders</h2><a href="${base}/collections/game-pre-orders">View all pre-orders &rsaquo;</a></div><div class="jb-grid jb-preorder-grid">${games.map(p => tile(base, p, base + '/')).join('')}</div></section>`
  const h1 = '<h1 class="visually-hidden">JB Hi-Fi — Always Cheap Prices</h1>'
  if (fixtureCatalog) return `${h1}${catalogHome}${categories}${catalogue}${perks}${news}`
  if (!ASSORTMENT.length) return `${h1}${hero}${categories}${catalogue}${preorders}${perks}${services}${news}${brands}`
  return `${h1}${heroCarousel(base, games, artwork)}${categories}${productRow(base, tile, 'Red Hot Deals', '/collections/deals', 'Shop all deals', mixDepartments(ASSORTMENT.filter(p => p.badges.includes('RED HOT DEAL')), 14))}${catalogue}${productRow(base, tile, 'New at JB!', '/collections/new', 'Explore new', mixDepartments(ASSORTMENT.filter(p => p.campaigns.includes('new')), 14))}${productRow(base, tile, 'Top TVs', '/collections/tvs', 'Shop all TVs', ASSORTMENT.filter(p => p.type === 'TVs').slice(0, 12))}${productRow(base, tile, 'Laptops for work & study', '/collections/laptops', 'Shop all laptops', ASSORTMENT.filter(p => p.type === 'Laptops').slice(0, 12))}${perks}${productRow(base, tile, 'Headphones & speakers', '/collections/headphones-audio', 'Shop audio', mixDepartments(ASSORTMENT.filter(p => /^(?:Headphones|Earbuds|Portable speakers)$/.test(p.type)), 12, 'type'))}${productRow(base, tile, 'Gaming pre-orders & new releases', '/collections/gaming', 'Shop gaming', gamingRow(games))}${productRow(base, tile, 'Phones & wearables', '/collections/mobile-phones', 'Shop phones', ASSORTMENT.filter(p => p.top && /Mobile Phones|Wearables/.test(p.crumbs[0])).concat(ASSORTMENT.filter(p => !p.top && /^(?:iPhone|Android phones|Smart watches)$/.test(p.type))).slice(0, 12))}${productRow(base, tile, 'Kitchen & home appliances', '/collections/home-appliances', 'Shop appliances', mixDepartments(ASSORTMENT.filter(p => p.crumbs[0] === 'Home Appliances'), 12, 'type'))}${productRow(base, tile, 'Music & movies', '/collections/music', 'Shop music', mixDepartments(ASSORTMENT.filter(p => /Music|Movies/.test(p.crumbs[0]) && p.campaigns.includes('new')), 12, 'type'))}${services}${news}${brands}`
}

// ---------- homepage product rows (reference mode, with the everyday assortment) ----------
// Round-robin across departments (or product types) so a row is not ten of the same thing.
function mixDepartments(items, limit, key = 'department') {
  const groups = new Map()
  for (const p of items) { const k = key === 'type' ? p.type : p.crumbs[0]; groups.set(k, [...(groups.get(k) || []), p]) }
  const out = [], lists = [...groups.values()]
  for (let i = 0; out.length < limit && lists.some(l => l[i]); i++) for (const l of lists) if (l[i] && out.length < limit) out.push(l[i])
  return out
}
function gamingRow(games) {
  const shelf = ASSORTMENT.filter(p => p.crumbs[0] === 'Gaming')
  const pick = re => shelf.filter(p => re.test(p.type))
  const titles = pick(/ games$/).filter((p, i, a) => a.findIndex(q => q.title === p.title) === i)
  const newGames = titles.filter(p => p.campaigns.includes('new')), topGames = titles.filter(p => p.top && !p.campaigns.includes('new'))
  // GTA VI pre-orders sit among the other new releases, not ahead of them.
  return [...newGames.slice(0, 2), ...games.slice(0, 1), ...topGames.slice(0, 2), ...pick(/consoles$/).filter(p => p.top), ...games.slice(1), ...newGames.slice(2), ...topGames.slice(2)].slice(0, 14)
}
function productRow(base, tile, title, href, linkText, items) {
  if (!items.length) return ''
  const id = 'row-' + slugify(title)
  return `<section class="jb-home-section jb-product-row" aria-labelledby="${id}"><div class="jb-section-heading"><h2 class="jb-display" id="${id}">${esc(title)}</h2><a href="${base}${href}">${esc(linkText)} &rsaquo;</a></div><div class="jb-carousel jb-row-carousel">${items.map(p => tile(base, p, base + '/')).join('')}</div></section>`
}
function heroCarousel(base, games, artwork) {
  const find = title => ASSORTMENT.find(p => p.title === title)
  const ps5 = games.find(p => p.platform === 'ps5') || games[0]
  const slide = (i, cls, eyebrow, title, copy, ctas, art, fine = '') => `<section class="jb-hero jb-hero-slide ${cls}" id="hero-${i}" aria-roledescription="slide" aria-label="${i} of 4"><div class="jb-hero-copy"><p class="jb-eyebrow">${eyebrow}</p><h2>${title}</h2><p>${copy}</p><p class="jb-hero-cta">${ctas}</p>${fine ? `<p class="jb-fine">${fine}</p>` : ''}</div>${art}</section>`
  const art = (p, href) => p ? `<a class="jb-hero-art" href="${href}" tabindex="-1" aria-hidden="true">${artwork(p)}</a>` : ''
  const tv = find('Samsung 65" S90F 4K OLED Smart TV [2025]'), phone = find('Apple iPhone 17 Pro 256GB (Cosmic Orange)'), sw = find('Nintendo Switch 2 Console + Mario Kart World Bundle')
  const slides = [
    slide(1, 'jb-hero-deals', 'RED HOT DEALS · ENDS SUNDAY', 'Big screens. Bigger savings.', 'Save on OLED and Mini LED TVs, soundbars, laptops and headphones from Samsung, LG, Sony and more.', `<a class="jb-btn" href="${base}/collections/deals">Shop Red Hot Deals</a><a class="jb-btn jb-btn-black" href="${base}/collections/tvs">Shop TVs</a>`, tv && photoStyle('television') ? `<a class="jb-hero-art jb-hero-photo" href="${base}/collections/tvs" tabindex="-1" aria-hidden="true">${productPhoto('television')}</a>` : art(tv, `${base}/collections/tvs`), '^Discounts apply to previous ticketed price. While stocks last.'),
    slide(2, 'jb-hero-phone', 'NEW · APPLE', 'iPhone 17 Pro', 'The most powerful iPhone yet. Trade in your old phone and save at JB Hi-Fi.', `<a class="jb-btn" href="${base}/collections/iphone">Shop iPhone</a><a class="jb-btn jb-btn-black" href="${base}/pages/tradein">Trade-in</a>`, art(phone, phone ? productPath(base, phone) : base)),
    ps5 ? slide(3, 'jb-hero-gta', 'PRE-ORDER NOW · RELEASES 19 NOV 26', 'Grand Theft Auto VI', 'Code in Box for PlayStation 5 and Xbox Series X|S. Pick up your copy in store to preload from 12 November.', `<a class="jb-btn" href="${base}/collections/game-pre-orders">Pre-order now</a><a class="jb-btn jb-btn-black" href="${productPath(base, ps5)}">PS5</a>${games.filter(g => g !== ps5).map(g => `<a class="jb-btn jb-btn-black" href="${productPath(base, g)}">Xbox</a>`).join('')}`, art(ps5, productPath(base, ps5)), 'Pre-order price guarantee applies.') : '',
    slide(4, 'jb-hero-switch', 'NINTENDO SWITCH 2', 'Race into Mario Kart World', 'Nintendo Switch 2 + Mario Kart World bundle, plus the latest Switch 2 games and accessories.', `<a class="jb-btn" href="${base}/collections/nintendo-switch">Shop Nintendo Switch 2</a>`, art(sw, sw ? productPath(base, sw) : base)),
  ].filter(Boolean)
  return `<div class="jb-hero-carousel" aria-roledescription="carousel" aria-label="Featured offers"><div class="jb-hero-track">${slides.join('')}</div><nav class="jb-hero-dots" aria-label="Choose a featured offer">${slides.map((_, i) => `<a href="#hero-${i + 1}" aria-label="Show offer ${i + 1}"${i ? '' : ' aria-current="true"'}></a>`).join('')}</nav></div>`
}

// ---------- department / sub-category landing ----------
function filterRail(route, q = {}) {
  const opt = (name, label, values) => `<details class="jb-filter-group" open><summary>${label}</summary>${values.map(([v, l]) => `<label><input type="radio" name="${name}" value="${v}" ${q[name] === v ? 'checked' : ''}> ${l}</label>`).join('')}</details>`
  return `<details class="jb-filter-drawer" open><summary>Filter products</summary><form class="jb-facets" method="get" action="${route}"><h2 class="visually-hidden">Filter</h2>${opt('availability', 'Availability', [['in-stock', 'Available online'], ['preorder', 'Pre-order'], ['click-collect', 'Click &amp; Collect']])}${opt('price', 'Price', [['under50', 'Under $50'], ['50to150', '$50 – $150'], ['150to500', '$150 – $500'], ['over500', 'Over $500']])}${opt('deal', 'Deals', [['on-sale', 'On sale'], ['red-hot', 'Red Hot Deal']])}<button class="jb-btn jb-btn-block" type="submit">Apply filters</button><a href="${route}">Clear filters</a></form></details>`
}
function applyFilters(items, q) {
  return items.filter(p => (!q.availability || (q.availability === 'preorder' ? /pre-order/i.test(p.cta || '') : q.availability === 'in-stock' ? p.orderable : true)) &&
    (!q.price || (q.price === 'under50' ? p.price < 50 : q.price === '50to150' ? p.price >= 50 && p.price <= 150 : q.price === '150to500' ? p.price > 150 && p.price <= 500 : p.price > 500)) &&
    (!q.deal || (p.badges || []).some(b => /sale|deal/i.test(b))))
}
function sortItems(items, sort) {
  const s = [...items]
  if (sort === 'price-asc') s.sort((a, b) => a.price - b.price)
  else if (sort === 'price-desc') s.sort((a, b) => b.price - a.price)
  else if (sort === 'name-asc') s.sort((a, b) => a.title.localeCompare(b.title))
  else if (sort === 'name-desc') s.sort((a, b) => b.title.localeCompare(a.title))
  return s
}
export function landingPage({ base, dept, sub, query, tile }) {
  const q = Object.fromEntries(['availability', 'price', 'deal', 'sort'].map(k => [k, typeof query[k] === 'string' ? query[k] : '']))
  const route = `${base}/collections/${(sub || dept).slug}`
  const items = sortItems(applyFilters(sub ? subProducts(sub) : deptProducts(dept), q), q.sort)
  const title = (sub || dept).title
  const siblings = dept.subs.map(s => `<a href="${base}/collections/${s.slug}" ${sub?.slug === s.slug ? 'aria-current="page"' : ''}>${esc(s.title)}</a>`).join('')
  const sortForm = `<form method="get" action="${route}">${['availability', 'price', 'deal'].filter(k => q[k]).map(k => `<input type="hidden" name="${k}" value="${esc(q[k])}">`).join('')}<label for="sort-by">Sort by: <select id="sort-by" name="sort">${[['best', 'Best Match'], ['price-asc', 'Price: Low - High'], ['price-desc', 'Price: High - Low'], ['name-asc', 'Title: A - Z'], ['name-desc', 'Title: Z - A']].map(([v, l]) => `<option value="${v}" ${q.sort === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label><button class="jb-btn jb-btn-small" type="submit">Sort</button></form>`
  const results = items.length ? `<div class="jb-grid">${items.map(p => tile(base, p, route)).join('')}</div>` : `<div class="jb-empty"><h2>0 results</h2><p>Sorry, there are no products in ${esc(title)} to show right now.</p><p>Try another category, clear your filters or search for a product or brand.</p><p><a class="jb-btn jb-btn-black jb-btn-small" href="${base}/collections/${dept.slug}">Back to ${esc(dept.title)}</a> <a class="jb-btn jb-btn-grey jb-btn-small" href="${base}/collections/all">All products</a></p></div>`
  return `${crumbs(base, sub ? [[dept.title, '/collections/' + dept.slug], [sub.title]] : [[dept.title]])}
<section class="jb-collection-heading jb-dept-banner"><div><h1>${esc(title)}</h1><p>${esc(sub ? `Shop ${sub.title} at JB Hi-Fi. ${dept.blurb}` : dept.blurb)}</p></div><span class="jb-dept-banner-art">${deptIcon(dept.slug, dept.title)}</span></section>
<nav class="jb-subcat-tiles" aria-label="${esc(dept.title)} categories">${siblings}</nav>
<div class="jb-search-head"><h2>${items.length} result${items.length === 1 ? '' : 's'}</h2><div class="jb-toolbar">${sortForm}</div></div>
<div class="jb-search-body">${filterRail(route, q)}<div>${results}<p class="jb-fine jb-center">Showing ${items.length} of ${items.length} results</p></div></div>
<section class="jb-dept-copy"><h2>${esc(title)} at JB Hi-Fi</h2><p>${esc(dept.blurb)} Every purchase is backed by our everyday low prices and friendly expert advice in store and online. Seen it cheaper? Ask for a JB Deal!</p></section>`
}
// Sub-category strip used on the store's existing department listing pages.
export function departmentStrip(base, slug) {
  const d = departmentBySlug(slug)
  return d ? `<nav class="jb-subcat-tiles" aria-label="${esc(d.title)} categories">${d.subs.map(s => `<a href="${base}/collections/${s.slug}"><span class="jb-subcat-icon">${deptIcon(d.slug, s.title)}</span>${esc(s.title)}</a>`).join('')}</nav>` : ''
}

function allProductsPage(base) {
  return `${crumbs(base, [['Products']])}<section class="jb-collection-heading"><h1>Products</h1><p>Browse every department at JB Hi-Fi.</p></section><h2 class="jb-display">Shop by department</h2><div class="jb-dept-directory">${DEPARTMENTS.map(d => `<section><a class="jb-dept-head" href="${base}/collections/${d.slug}"><span class="jb-dept-circle">${deptIcon(d.slug, d.title)}</span><b>${esc(d.title)}</b></a><ul>${d.subs.map(s => `<li><a href="${base}/collections/${s.slug}">${esc(s.title)}</a></li>`).join('')}</ul></section>`).join('')}</div>`
}

// ---------- info / help / blog pages ----------
const page = (base, trail, title, lead, body) => `${crumbs(base, trail)}<div class="jb-info"><header class="jb-info-head"><h1>${esc(title)}</h1>${lead ? `<p>${esc(lead)}</p>` : ''}</header>${body}</div>`
const linkList = (base, rows) => rows.length ? `<ul class="jb-link-cards">${rows.map(([l, h]) => `<li><a href="${base}${h}">${esc(l)} &rsaquo;</a></li>`).join('')}</ul>` : ''
function infoPage(base, path) {
  const [title, lead, sections, related] = INFO_PAGES[path]
  return page(base, [[title]], title, lead, `${sections.map(([h, html]) => `<section class="jb-info-section"><h2>${esc(h)}</h2>${html}</section>`).join('')}${path === '/pages/privacy-policy' ? publicNotice('<section class="jb-info-section"><h2>This website</h2><p>This is not the real JB Hi-Fi website. Information stays in your browser session and is not sent to JB Hi-Fi.</p></section>') : ''}${related.length ? `<section class="jb-info-section"><h2>${path === '/pages/services' ? 'Our services' : 'Related'}</h2>${linkList(base, related)}</section>` : ''}`)
}
function helpHub(base) {
  return page(base, [['Help & Support']], 'Help & Support', 'How can we help you today?', `<form class="jb-help-search" method="get" action="${base}/help"><label for="help-search">Search help articles</label><div><input id="help-search" name="q" type="search" placeholder="e.g. pre-orders, Click & Collect, returns"><button class="jb-btn jb-btn-black" type="submit">Search</button></div></form>
<div class="jb-help-topics">${HELP_TOPICS.map(([title, slug, ids]) => `<section><h2><a href="${base}/pages/help-and-support/${slug}">${esc(title)}</a></h2><ul>${ids.map(id => `<li><a href="${base}/pages/help-and-support/${id}">${esc(HELP_ARTICLES[id][0])}</a></li>`).join('')}</ul></section>`).join('')}</div>
<section class="jb-info-section jb-help-contact"><h2>Still need help?</h2><p>Track an order, find a store or get in touch with our team.</p>${linkList(base, [['Track my order', '/pages/track-my-order'], ['Contact us', '/pages/contact-us'], ['Store finder', '/pages/store-finder'], ['My support requests', '/help/cases']])}</section>`)
}
function helpTopic(base, topic) {
  const [title, slug, ids] = topic
  return page(base, [['Help & Support', '/pages/help-and-support'], [title]], title, `Help articles about ${title.toLowerCase()}.`, linkList(base, ids.map(id => [HELP_ARTICLES[id][0], `/pages/help-and-support/${id}`])))
}
function helpArticle(base, id) {
  const [title, html] = HELP_ARTICLES[id]
  const topic = HELP_TOPICS.find(t => t[2].includes(id))
  return page(base, [['Help & Support', '/pages/help-and-support'], ...(topic ? [[topic[0], `/pages/help-and-support/${topic[1]}`]] : []), [title]], 'Help & Support', '', `<article class="jb-help-article"><h2>${esc(title)}</h2>${html}</article><section class="jb-info-section"><h2>Was this helpful?</h2>${linkList(base, [['Back to Help & Support', '/pages/help-and-support'], ['Contact us', '/pages/contact-us']])}</section>`)
}
function blogPage(base, slug) {
  const [, title, blurb] = BLOGS.find(b => b[0] === slug)
  const trail = slug === 'news-and-reviews' ? [[title]] : [['News & Reviews', '/blogs/news-and-reviews'], [title]]
  return page(base, trail, title, blurb, `<nav class="jb-subcat-tiles" aria-label="News & Reviews sections">${BLOGS.map(([s, t]) => `<a href="${base}/blogs/${s}" ${s === slug ? 'aria-current="page"' : ''}>${esc(t)}</a>`).join('')}</nav><div class="jb-news-grid">${BLOGS.filter(b => b[0] !== slug && b[0] !== 'news-and-reviews').map(([s, t, b]) => `<a href="${base}/blogs/${s}"><span class="jb-news-kicker">${esc(t)}</span><b>${esc(b)}</b><span>Explore &rsaquo;</span></a>`).join('')}</div><p class="jb-fine">New articles from the JB Hi-Fi team are published every week.</p>`)
}
function brandsPage(base) {
  const own = [...new Set(LISTED.map(p => p.brand).filter(Boolean))].sort()
  const letters = [...new Set(POPULAR_BRANDS.map(b => b[0].toUpperCase()))].sort()
  return page(base, [['Brands']], 'Brands', 'Shop the best tech brands at JB Hi-Fi.', `<h2 class="jb-display">Popular brands</h2><div class="jb-brand-links jb-brand-wall">${POPULAR_BRANDS.map(b => `<a href="${base}/search?query=${encodeURIComponent(b)}">${esc(b)}</a>`).join('')}</div><h2 class="jb-display">Brands A–Z</h2><div class="jb-az">${letters.map(l => `<section><h3>${l}</h3>${POPULAR_BRANDS.filter(b => b[0].toUpperCase() === l).map(b => `<a href="${base}/search?query=${encodeURIComponent(b)}">${esc(b)}</a>`).join('')}</section>`).join('')}</div>${own.length ? `<h2 class="jb-display">Brands in our range</h2><div class="jb-brand-links">${own.map(b => `<a href="${base}/brands/${slugify(b)}">${esc(b)}</a>`).join('')}</div>` : ''}`)
}
const STORE_DIRECTORY = [
  ['VIC', ['Melbourne Central', 'City Bourke Street', 'Chadstone Shopping Centre', 'Highpoint', 'Doncaster', 'Southland', 'Geelong', 'Ballarat']],
  ['NSW', ['City Strand Arcade Pitt St Mall', 'City Westfield Sydney', 'Broadway', 'Bondi', 'Parramatta Westfield', 'Chatswood Westfield', 'Hornsby', 'Liverpool']],
  ['QLD', ['City Brisbane Queen St', 'Chermside', 'Carindale Westfield', 'Pacific Fair', 'Cairns Central', 'Sunshine Plaza']],
  ['WA', ['Forrest Chase', 'Karrinyup', 'Booragoon', 'Lakeside Joondalup', 'Cannington']],
  ['SA', ['City Adelaide', 'Marion', 'West Lakes', 'Elizabeth']],
  ['ACT', ['City Canberra', 'Belconnen Westfield', 'Woden Westfield']],
  ['TAS', ['Hobart', 'Launceston']],
  ['NT', ['Casuarina']],
]
export function storeFinderPage(base, query, stores) {
  const q = String(query || '').toLowerCase()
  const groups = STORE_DIRECTORY.map(([st, names]) => [st, names.filter(n => !q || n.toLowerCase().includes(q) || st.toLowerCase() === q)]).filter(([, n]) => n.length)
  const pickup = stores.length ? `<section class="jb-info-section"><h2>Click &amp; Collect stores</h2><ul class="jb-store-list">${stores.map(s => `<li><a href="${base}/stores/${s.id}"><b>${esc(s.name)}</b></a><br><span class="jb-fine">${esc(s.address)}</span></li>`).join('')}</ul></section>` : `<p class="jb-notice">Store pickup availability for online orders is confirmed at checkout.</p>`
  return page(base, [['Store Finder']], 'Store Finder', 'Find your nearest JB Hi-Fi store.', `<form class="jb-help-search" method="get" action="${base}/pages/store-finder"><label for="store-search">Enter postcode, suburb or state</label><div><input id="store-search" name="q" type="search" value="${esc(query || '')}" placeholder="e.g. Melbourne or VIC"><button class="jb-btn jb-btn-black" type="submit">Find stores</button></div></form>${pickup}<section class="jb-info-section"><h2>All stores${q ? ` matching “${esc(query)}”` : ''}</h2>${groups.length ? `<div class="jb-store-dir">${groups.map(([st, names]) => `<section><h3>${st}</h3><ul>${names.map(n => `<li>JB Hi-Fi ${esc(n)}</li>`).join('')}</ul></section>`).join('')}</div>` : '<p>No stores match your search. Try a suburb or state such as NSW.</p>'}<p class="jb-fine">Opening hours vary by store and on public holidays. Contact your local store for today's hours.</p></section>`)
}
function perksPage(base, user) {
  return page(base, [['JB Perks']], 'JB Perks', 'Join JB Perks for FREE member benefits.', `<section class="jb-perks-band"><div class="jb-perks-badge" aria-hidden="true">JB<br>PERKS</div><div><h2>Want a $10 welcome coupon*?</h2><p>Become a member today and enjoy a welcome coupon, member discounts and early sales notifications.</p><p class="jb-fine">*Valid for 28 days from issue. T&amp;Cs apply.</p></div><a class="jb-btn" href="${base}${user ? '/account/profile' : '/account/register'}">${user ? 'Manage my preferences' : 'Join &amp; get my $10'}</a></section>
<section class="jb-info-section"><h2>Member benefits</h2><ul class="jb-benefits">${['$10 welcome coupon', 'Member-only offers and discounts', 'Early access to sales', 'Birthday Perk', 'Digital receipts — no paper needed'].map(b => `<li>${b}</li>`).join('')}</ul></section>
<section class="jb-info-section"><h2>How to join</h2><p>Create a JB Hi-Fi account and add your Australian mobile number. Membership is free and not required to shop.</p>${linkList(base, [['Create account', '/account/register'], ['Log in', '/account/login'], ['JB Perks help', '/pages/help-and-support/jb-perks']])}${publicNotice('<p class="jb-fine">This is not the real JB Hi-Fi website. Coupons are not issued.</p>')}</section>`)
}

// ---------- site map ----------
const NON_PRODUCT = [['Help & Support', '/pages/help-and-support'], ['Track my order', '/pages/track-my-order'], ['Store finder', '/pages/store-finder'], ['Gift Cards', '/pages/gift-cards'], ['JB Perks', '/pages/perks'], ['Catalogues', '/pages/catalogues'], ['Services', '/pages/services'], ['News & Reviews', '/blogs/news-and-reviews'], ['Brands', '/pages/brands'], ['About us', '/pages/about-us'], ['Contact us', '/pages/contact-us'], ['Clearance', '/collections/clearance'], ['New at JB!', '/collections/new'], ['My account', '/account'], ['Cart', '/cart']]
function sitemapPage(base) {
  return page(base, [['Site map']], 'Site map', 'Every department, category and service page at JB Hi-Fi.', `<h2 class="jb-display">Products</h2><div class="jb-dept-directory">${DEPARTMENTS.map(d => `<section><a class="jb-dept-head" href="${base}/collections/${d.slug}"><b>${esc(d.title)}</b></a><ul>${d.subs.map(s => `<li><a href="${base}/collections/${s.slug}">${esc(s.title)}</a></li>`).join('')}</ul></section>`).join('')}</div>
<h2 class="jb-display">Shopping &amp; services</h2><div class="jb-dept-directory">${[['Shop', NON_PRODUCT], ...FOOTER, ['Legal', LEGAL.filter(l => l[1] !== '/sitemap')]].map(([h, rows]) => `<section><b>${esc(h)}</b><ul>${rows.map(([l, u]) => `<li><a href="${base}${u}">${esc(l)}</a></li>`).join('')}</ul></section>`).join('')}</div>`)
}
export function sitemapPaths() {
  const set = new Set(['/', '/collections/all', '/search', '/cart', '/account/login', '/account/register', '/sitemap'])
  DEPARTMENTS.forEach(d => { set.add('/collections/' + d.slug); d.subs.forEach(s => set.add('/collections/' + s.slug)) })
  CAMPAIGNS.forEach(c => set.add('/collections/' + c.slug))
  ;[...NON_PRODUCT, ...FOOTER.flatMap(f => f[1]), ...LEGAL].forEach(([, u]) => set.add(u))
  Object.keys(INFO_PAGES).forEach(u => set.add(u))
  Object.keys(HELP_ARTICLES).forEach(id => set.add('/pages/help-and-support/' + id))
  HELP_TOPICS.forEach(t => set.add('/pages/help-and-support/' + t[1]))
  BLOGS.forEach(([s]) => set.add('/blogs/' + s))
  LISTED.forEach(p => set.add(productPath('', p)))
  return [...set]
}

// ---------- routes ----------
export function installSite(router, { render, notFound, tile, trackOrderPage, findStores }) {
  const show = (req, res, title, body, status = 200) => render(req, res, { title: `${title} | JB Hi-Fi`, body, status })
  const base = res => res.locals.base
  router.get('/collections/all', (req, res) => show(req, res, 'Products', allProductsPage(base(res))))
  router.get('/collections/:handle', (req, res, next) => {
    const h = req.params.handle
    if (OWN_DEPTS.has(h)) return next()
    const dept = departmentBySlug(h), sub = SUBS.find(s => s.slug === h)
    if (!dept && !sub) return next()
    show(req, res, (sub || dept).title, landingPage({ base: base(res), dept: dept || sub.dept, sub, query: req.query, tile }))
  })
  router.get('/pages/help-and-support', (req, res) => show(req, res, 'Help & Support', helpHub(base(res))))
  router.get('/pages/help-and-support/:id', (req, res) => {
    const topic = HELP_TOPICS.find(t => t[1] === req.params.id)
    if (topic) return show(req, res, `${topic[0]} - Help & Support`, helpTopic(base(res), topic))
    if (!HELP_ARTICLES[req.params.id]) return notFound(req, res)
    show(req, res, `${HELP_ARTICLES[req.params.id][0]} - Help & Support`, helpArticle(base(res), req.params.id))
  })
  router.get('/pages/track-my-order', (req, res) => render(req, res, { title: 'Order Tracking - JB Hi-Fi', body: `${crumbs(base(res), [['Track my order']])}${trackOrderPage({ base: base(res) })}${req.store.user ? `<p class="jb-center"><a href="${base(res)}/account/orders">View all my orders</a></p>` : ''}` }))
  router.get('/pages/store-finder', (req, res) => {
    const q = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 60) : ''
    render(req, res, { title: 'JB Hi-Fi Store Finder | JB Hi-Fi', body: storeFinderPage(base(res), q, findStores(q)) })
  })
  router.get('/pages/perks', (req, res) => render(req, res, { title: 'JB Hi-Fi Perks - Become A Member Today To Enjoy Benefits', body: perksPage(base(res), req.store.user) }))
  router.get('/pages/brands', (req, res) => render(req, res, { title: 'Electronic Brands - Shop Best Tech Brands at JB Hi-Fi', body: brandsPage(base(res)) }))
  router.get('/pages/:handle', (req, res, next) => {
    const path = '/pages/' + req.params.handle
    if (!INFO_PAGES[path]) return next()
    const title = path === '/pages/catalogues' ? 'Current catalogues - Shop Red Hot Deals at JB Hi-Fi!' : `${INFO_PAGES[path][0]} - JB Hi-Fi`
    render(req, res, { title, body: infoPage(base(res), path) })
  })
  router.get('/blogs/:blog', (req, res, next) => {
    if (!BLOGS.some(b => b[0] === req.params.blog)) return next()
    show(req, res, BLOGS.find(b => b[0] === req.params.blog)[1], blogPage(base(res), req.params.blog))
  })
  router.get('/sitemap', (req, res) => show(req, res, 'Site map', sitemapPage(base(res))))
  router.get('/sitemap.xml', (req, res) => {
    const origin = `${req.protocol}://${req.get('host')}${base(res)}`
    res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapPaths().map(p => `  <url><loc>${esc(origin + p)}</loc></url>`).join('\n')}\n</urlset>\n`)
  })
  router.post('/newsletter', (req, res) => {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim() : ''
    const ok = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)
    show(req, res, ok ? 'Thanks for signing up' : 'Sign up to our newsletter', page(base(res), [['Newsletter']], ok ? 'Thanks for signing up' : 'Sign up to our newsletter', '', ok ? `<p role="status">You're on the list, ${esc(email)}.</p><p><a class="jb-btn" href="${base(res)}/">Continue shopping</a></p>` : `<p class="jb-error" role="alert">Enter a valid email address.</p><form method="post" action="${base(res)}/newsletter" class="jb-help-search"><label for="nl-email">Email address</label><div><input id="nl-email" name="email" type="email" autocomplete="email" value="${esc(email)}"><button class="jb-btn jb-btn-black" type="submit">Sign up</button></div></form>`), ok ? 200 : 400)
  })
}
