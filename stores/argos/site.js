// Argos.co.uk chrome (header mega menu, footer) and the non-checkout pages: department and category
// landings that mirror argos.co.uk /browse/.../c:<id>/ paths, promotional landings, help and policy
// pages, local stand-ins for off-site links, the HTML site map and /sitemap.xml.
// Category grids only show products from this store's catalogue (PRODUCTS); where argos.co.uk would list
// items the catalogue does not carry, the page keeps the real structure and shows a "0 products" state.
import { esc, publicNotice } from '../../lib/html.js'
import { fixtureCatalog } from '../../lib/catalog-policy.js'
import { PRODUCTS } from './data.js'
import { SHELF, byPopularity } from './shelf.js'
import { cards } from './catalog.js'
import { shelfArtUrl } from './shelf-art.js'
import { UTILITY, MENU, PROMOS, FOOTER, LEGAL, BRAND_HOMES } from './site-data.js'
import { INFO, LANDINGS, FEATURES } from './site-content.js'

const trim = p => p.length > 1 ? p.replace(/\/+$/, '') : p
const link = (base, [label, path], cls = '') => `<a${cls ? ` class="${cls}"` : ''} href="${esc(base + path)}">${esc(label)}</a>`
const chevron = '<span class="chev" aria-hidden="true">›</span>'
const svg = (body, cls = 'ar-ico') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`
export const ICONS = {
  account: svg('<circle cx="12" cy="7.5" r="4"/><path d="M4 21.5v-2a8 8 0 0 1 16 0v2"/>'),
  heart: svg('<path d="M12 20.5s-8-4.8-8-10.6A4.4 4.4 0 0 1 12 7.4a4.4 4.4 0 0 1 8 2.5c0 5.8-8 10.6-8 10.6Z"/>'),
  trolley: svg('<path d="M2 3h3l2.6 12.2a1.5 1.5 0 0 0 1.5 1.2h9.3a1.5 1.5 0 0 0 1.5-1.1L22 7H6.1"/><circle cx="9.5" cy="20.5" r="1.4"/><circle cx="18" cy="20.5" r="1.4"/>'),
  search: svg('<circle cx="10.5" cy="10.5" r="6.5"/><path d="m20 20-4.8-4.8"/>'),
  van: svg('<path d="M1.5 6h12v10h-12zM13.5 9.5h4.5l3.5 3.5v3h-8"/><circle cx="5.5" cy="17.5" r="1.8"/><circle cx="17.5" cy="17.5" r="1.8"/>'),
  menu: svg('<path d="M3 6h18M3 12h18M3 18h18"/>'),
  store: svg('<path d="M3 9.5 4.5 4h15L21 9.5M4 9.5V20h16V9.5M3 9.5h18M9.5 20v-5h5v5"/>'),
}

// ---------- category index (built from the captured mega menu) ----------
export const CATEGORIES = new Map()
for (const m of MENU) {
  CATEGORIES.set(trim(m.path), { key: trim(m.path), title: m.h1 || m.label, dept: m, top: true })
  for (const g of m.groups) for (const [label, path] of g.links) {
    if (!path.includes('/c:') || CATEGORIES.has(trim(path))) continue
    CATEGORIES.set(trim(path), { key: trim(path), title: label.replace(/^Shop all /, ''), dept: m, group: g })
  }
}
const gta = PRODUCTS.filter(p => p.kind !== 'other' && p.department === 'gaming')
// Reference mode: category grids list the everyday assortment for that category, with the evidenced
// GTA VI listings placed among the games where argos.co.uk would list them (never as the whole page).
const inPaths = paths => SHELF.filter(p => p.paths.some(x => paths.includes(x)))
const among = (list, extra, at = 4) => [...list.slice(0, at), ...extra, ...list.slice(at)]
const isShopAll = cat => /^shop all/i.test(cat.group?.links.find(([, x]) => trim(x) === cat.key)?.[0] || '')
function referenceProducts(cat) {
  const m = cat.dept, label = cat.title.toLowerCase()
  if (m.id === 'christmas' && cat.top) return byPopularity(SHELF.filter(p => ['toys', 'technology', 'gaming', 'health-and-beauty', 'christmas'].includes(p.menu))).slice(0, 48)
  if (m.id === 'gaming') {
    if (/pre-order/.test(label)) return gta
    if (cat.top) return among(byPopularity(SHELF.filter(p => p.menu === 'gaming')), gta, 6)
    const platform = cat.group?.platform
    const own = isShopAll(cat) ? inPaths(cat.group.links.map(([, x]) => trim(x))) : inPaths([cat.key])
    const games = platform && /games|playstation|xbox/.test(label) ? gta.filter(p => p.platform === platform) : []
    return among(byPopularity(own), games, 3)
  }
  if (cat.top) return byPopularity(SHELF.filter(p => p.menu === m.id))
  // A group's "Shop all" link covers the whole department section the menu column stands for.
  if (isShopAll(cat)) return byPopularity(SHELF.filter(p => p.menu === m.id))
  return byPopularity(inPaths([cat.key]))
}
function productsFor(cat) {
  if (!fixtureCatalog) return referenceProducts(cat)
  const m = cat.dept, label = cat.title.toLowerCase()
  if (m.id === 'gaming') {
    const platform = cat.group?.platform
    if (cat.top || /pre-order/.test(label)) return [...gta, ...(fixtureCatalog && cat.top ? PRODUCTS.filter(p => p.department === 'gaming' && p.kind === 'other').slice(0, 8) : [])]
    if (platform && /games|playstation|xbox/.test(label)) return gta.filter(p => p.platform === platform)
  }
  if (!fixtureCatalog || !m.dept) return []
  const inDept = PRODUCTS.filter(p => p.department === m.dept && p.kind === 'other')
  if (cat.top) return inDept.slice(0, 8)
  const words = label.replace(/&/g, ' ').split(/\s+/).filter(w => w.length > 3).map(w => w.replace(/s$/, ''))
  return inDept.filter(p => words.some(w => `${p.family} ${p.title}`.toLowerCase().includes(w)))
}

// ---------- chrome ----------
export function header(base, { cart = [], user } = {}) {
  const count = cart.reduce((n, p) => n + p.qty, 0)
  const mega = `<details class="shop-menu ar-mega-host"><summary>${ICONS.menu}<span>Shop</span></summary><div class="ar-mega"><p class="ar-mega-title">Shop by department</p><ul>${MENU.map(m => `<li><a class="ar-dept" href="${esc(base + m.path)}">${esc(m.label)} ${chevron}</a><div class="ar-sub"><a class="ar-sub-all" href="${esc(base + m.path)}">Shop all ${esc(m.label)} ${chevron}</a><div class="ar-sub-cols">${m.groups.map(g => `<div><p>${esc(g.title)}</p>${g.links.map(l => link(base, l)).join('')}</div>`).join('')}</div></div></li>`).join('')}</ul><div class="ar-mega-promos">${PROMOS.map(l => link(base, l)).join('')}<a href="${base}/features/advice-and-inspiration">Advice &amp; Inspiration</a><a href="${base}/sitemap">Site map</a></div></div></details>`
  const trending = `<details class="shop-menu trending-menu"><summary><span>Trending</span></summary><div class="ar-trending">${PROMOS.map(l => link(base, l)).join('')}<a href="${base}/events/voucher-discount-codes">Voucher codes</a><a href="${base}/features/gaming">Upcoming games</a></div></details>`
  return `<header class="ar-header"><div class="topline"><nav aria-label="Customer services">${UTILITY.map(l => link(base, l)).join('')}</nav></div><div class="nav"><a class="brand" href="${base}/" aria-label="Argos logo - go to homepage"><span>Argos</span></a><form action="${base}/search" method="get" role="search"><label class="visually-hidden" for="site-search">Search Argos</label><input id="site-search" name="q" placeholder="What are you looking for?" list="search-suggestions" autocomplete="off"><datalist id="search-suggestions">${[...PRODUCTS, ...byPopularity(SHELF).slice(0, 40)].slice(0, 60).map(p => `<option value="${esc(p.title)}"></option>`).join('')}</datalist><button aria-label="Search">${ICONS.search}<span class="visually-hidden">Search</span></button></form><a class="nav-action" href="${base}/account/login">${ICONS.account}<span>${user ? 'Your account' : 'Account'}</span></a><a class="nav-action" href="${base}/wishlist">${ICONS.heart}<span>Wishlist</span></a><a class="nav-action" href="${base}/basket">${ICONS.trolley}<span>Trolley</span>${count ? `<b class="ar-badge" aria-label="${count} items">${count}</b>` : ''}</a></div><nav class="departments" aria-label="Shop navigation">${mega}${trending}<a class="ar-event" href="${base}/events/big-event">The Big Red Event</a><span class="ar-nav-links"><a href="${base}/stores">${ICONS.store}Stores</a><a href="${base}/help">Help</a><a href="${base}/features/advice-and-inspiration">Advice &amp; Inspiration</a></span></nav><a class="ar-promo-strip" href="${base}/help/delivery-and-collection-guide">${ICONS.van}<span><strong>Small Item Delivery £4.95, free over £100</strong><span class="ar-promo-now">Now free during The Big Red Event</span></span></a></header>`
}

export function footer(base, disclaimerHtml) {
  return `<footer class="ar-footer"><div class="ar-footer-cols">${FOOTER.map(c => `<section><h2>${esc(c.title)}</h2>${c.links.map(l => link(base, l)).join('')}</section>`).join('')}</div><div class="ar-footer-blocks"><section><h3>Returning an item</h3><p>For returns, product support and repairs</p><a href="${base}/help/returns-product-support-and-repairs">Learn more here</a></section><section><h3>Payment methods</h3><p>We accept the following payment methods online</p><ul class="ar-pay" aria-label="Payment methods">${['Argos Pay', 'VISA', 'Mastercard', 'AMEX', 'PayPal', 'Klarna', 'Gift card'].map(x => `<li>${x}</li>`).join('')}</ul></section><section><h3>Follow us</h3><ul class="ar-social" aria-label="Argos social channels">${['YouTube', 'Facebook', 'X', 'Pinterest', 'Instagram'].map(x => `<li title="${x}">${x[0]}</li>`).join('')}</ul></section><section><h3>Download our app</h3><ul class="ar-apps"><li>App Store</li><li>Google Play</li></ul></section></div><div class="ar-brands" aria-label="Our brands">${BRAND_HOMES.map(b => b === 'Argos' ? `<a href="${base}/">Argos</a>` : `<a href="${base}/about-us#brands">${esc(b)}</a>`).join('')}</div><div class="ar-legal"><nav aria-label="Legal">${LEGAL.map(l => link(base, l)).join('')}<a href="${base}/help/cookie-list#preferences">Cookie preferences</a><a href="${base}/sitemap">Site map</a></nav><p>© Argos Limited 2026. All Rights Reserved.</p></div><div class="footer-bottom">${disclaimerHtml}</div></footer>`
}

// ---------- page blocks ----------
const crumbs = (base, trail) => `<nav class="breadcrumbs" aria-label="Breadcrumb"><a href="${base}/">Home</a>${trail.map(([l, p]) => p ? ` <span aria-hidden="true">›</span> <a href="${esc(base + p)}">${esc(l)}</a>` : ` <span aria-hidden="true">›</span> <span>${esc(l)}</span>`).join('')}</nav>`
// Department and category circles show a picture of a typical product, like argos.co.uk's photo tiles.
// Falls back to the department initial when the catalogue has nothing to show (fixtures mode).
const TILE_PICK = { christmas: 'xmastree', toys: 'doll', technology: 'tv', gaming: 'headset', 'home-and-furniture': 'sofa', 'health-and-beauty': 'hairstyler', appliances: 'airfryer', 'sports-and-leisure': 'bike', 'jewellery-and-watches': 'womenswatch', 'baby-and-nursery': 'pram', clothing: 'womens', 'garden-and-diy': 'bbq' }
const TILE_TITLE = { toys: /dreamhouse/i, 'health-and-beauty': /airwrap/i, gaming: /turtle beach/i }
const tileArt = (base, p, cls, letter) => p ? `<span class="ar-tile-art ar-tile-photo ${cls}" aria-hidden="true"><img src="${esc(shelfArtUrl(base, p))}" alt="" width="640" height="600" loading="lazy" decoding="async"></span>` : `<span class="ar-tile-art ${cls}" aria-hidden="true">${esc(letter)}</span>`
const deptPick = m => SHELF.find(p => p.menu === m.id && TILE_TITLE[m.id]?.test(p.title)) || byPopularity(SHELF.filter(p => p.menu === m.id && p.shelfCat === TILE_PICK[m.id]))[0] ||byPopularity(SHELF.filter(p => p.menu === m.id))[0]
const deptTile = (base, m) => `<a class="ar-tile" href="${esc(base + m.path)}">${tileArt(base, deptPick(m), `ar-art-${m.id}`, m.label.split(' ')[0][0])}<span>${esc(m.label)}</span></a>`
function groupTiles(base, m) {
  const used = new Set()
  return m.groups.map(g => {
    const cat = CATEGORIES.get(trim(g.links[0][1]))
    const pool = (cat ? productsFor(cat) : []).filter(p => SHELF.includes(p))
    const p = pool.find(x => !used.has(x.sku)) || pool[0]
    if (p) used.add(p.sku)
    return `<a class="ar-cat-tile" href="${esc(base + g.links[0][1])}">${tileArt(base, p, `ar-art-${m.id}`, g.title[0])}<span>${esc(g.title)}</span></a>`
  }).join('')
}
const byId = id => MENU.find(m => m.id === id)

const PRICE_BANDS = [['Up to £25', 0, 25], ['£25 - £50', 25, 50], ['£50 - £100', 50, 100], ['£100 - £250', 100, 250], ['£250 and above', 250, Infinity]]
const qvals = v => (Array.isArray(v) ? v : [v]).filter(x => typeof x === 'string' && x)
const PER_PAGE = 24
function resultsBlock(base, products, route, query = {}, { filters = true, side = '' } = {}) {
  const sort = typeof query.sort === 'string' ? query.sort : 'relevance'
  const prices = qvals(query.price), brandSel = qvals(query.brand), ratingSel = qvals(query.rating)
  const bands = PRICE_BANDS.filter(([l]) => prices.includes(l)), minRating = ratingSel.includes('3 or more') ? 3 : ratingSel.includes('4 or more') ? 4 : 0
  const list = products.filter(p => (!bands.length || bands.some(([, lo, hi]) => p.unit_price >= lo && p.unit_price < hi)) && (!brandSel.length || brandSel.includes(p.brand)) && (!minRating || (p.rating || 0) >= minRating) && (query.collect !== '1' || (p.methods || []).includes('pickup')) && (query.fast !== '1' || (p.methods || []).includes('ship') && !p.bulky))
  if (sort === 'price-low') list.sort((a, b) => a.unit_price - b.unit_price)
  if (sort === 'price-high') list.sort((a, b) => b.unit_price - a.unit_price)
  if (sort === 'rating') list.sort((a, b) => (b.rating || 0) - (a.rating || 0) || (b.reviews || 0) - (a.reviews || 0))
  const brands = [...new Set(products.map(p => p.brand).filter(Boolean))].sort()
  const n = list.length, pages = Math.max(1, Math.ceil(n / PER_PAGE)), page = Math.min(pages, Math.max(1, parseInt(query.page) || 1))
  const shown = list.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const keep = Object.entries(query).filter(([k]) => ['sort', 'price', 'brand', 'rating', 'fast', 'collect'].includes(k)).flatMap(([k, v]) => qvals(v).map(x => [k, x]))
  const pageHref = p => { const u = new URLSearchParams(keep); if (p > 1) u.set('page', String(p)); const q = u.toString(); return route + (q ? `?${q}` : '') }
  const checked = on => on ? ' checked' : ''
  const panel = `<details class="filter-panel" open><summary>Filter <span>Price, brand and rating</span></summary><form action="${esc(route)}" method="get" class="facets"><input type="hidden" name="sort" value="${esc(sort)}"><h2>Filter by</h2><fieldset><legend>Price</legend>${PRICE_BANDS.map(([r]) => `<label class="facet-option"><input type="checkbox" name="price" value="${esc(r)}"${checked(prices.includes(r))}> ${esc(r)}</label>`).join('')}</fieldset><fieldset class="facet-brands"><legend>Brand</legend>${brands.length ? `<div class="facet-scroll">${brands.map(b => `<label class="facet-option"><input type="checkbox" name="brand" value="${esc(b)}"${checked(brandSel.includes(b))}> ${esc(b)} (${products.filter(p => p.brand === b).length})</label>`).join('')}</div>` : '<p class="ar-muted">No brands to show</p>'}</fieldset><fieldset><legend>Customer Rating</legend>${['4 or more', '3 or more'].map(r => `<label class="facet-option"><input type="checkbox" name="rating" value="${esc(r)}"${checked(ratingSel.includes(r))}> ${esc(r)}</label>`).join('')}</fieldset><fieldset><legend>Delivery &amp; collection</legend><label class="facet-option"><input type="checkbox" name="fast" value="1"${checked(query.fast === '1')}> Fast Track delivery</label><label class="facet-option"><input type="checkbox" name="collect" value="1"${checked(query.collect === '1')}> Collect in store</label></fieldset><div class="filter-actions"><button>Apply</button><a href="${esc(route)}">Clear all</a></div></form></details>`
  const pager = pages > 1 ? `<nav class="pagination" aria-label="Product pages">${page > 1 ? `<a rel="prev" href="${esc(pageHref(page - 1))}">Previous</a>` : ''}${Array.from({ length: pages }, (_, i) => i + 1).map(i => `<a ${i === page ? 'aria-current="page" ' : ''}href="${esc(pageHref(i))}">${i}</a>`).join('')}<span>Page ${page} of ${pages}</span>${page < pages ? `<a rel="next" href="${esc(pageHref(page + 1))}">Next</a>` : ''}</nav>` : ''
  const sortHidden = keep.filter(([k]) => k !== 'sort').map(([k, v]) => `<input type="hidden" name="${esc(k)}" value="${esc(v)}">`).join('')
  return `<div class="${filters || side ? 'catalog-layout ' : ''}ar-results">${filters || side ? `<div class="ar-side">${side}${filters ? panel : ''}</div>` : ''}<section><div class="listing-controls"><p><strong>${n} ${n === 1 ? 'product' : 'products'}</strong>${n > PER_PAGE ? ` · Showing ${(page - 1) * PER_PAGE + 1}–${Math.min(page * PER_PAGE, n)}` : ''}</p><form method="get" action="${esc(route)}" class="sort-form">${sortHidden}<label for="sort">Sort by</label><select id="sort" name="sort">${[['relevance', 'Relevance'], ['price-low', 'Price: Low - High'], ['price-high', 'Price: High - Low'], ['rating', 'Customer Rating']].map(([v, l]) => `<option value="${v}" ${sort === v ? 'selected' : ''}>${l}</option>`).join('')}</select><button class="secondary">Sort</button></form></div>${n ? cards(base, shown) : `<div class="ar-empty"><h2>Sorry, there are no products available here right now</h2><p>${products.length ? 'No products match your filters. Try removing a filter.' : 'Try another category or search for a product.'}</p><p><a class="button" href="${base}/search">Search all products</a> <a class="button secondary" href="${base}/">Back to homepage</a></p></div>`}${pager}</section></div>`
}

// Left column of a department page: one list of its categories (argos.co.uk's "Category" facet), above the filters.
function deptCategoryNav(base, m) {
  // A column that opens with "Shop all X" lists its links under X; other columns are plain sibling categories.
  const items = m.groups.map(g => {
    const [first, ...rest] = g.links
    if (!/^Shop all /i.test(first[0]) || !rest.length) return g.links.map(l => `<li>${link(base, [l[0].replace(/^Shop all /i, ''), l[1]])}</li>`).join('')
    return `<li>${link(base, [first[0].replace(/^Shop all /i, ''), first[1]])}<ul>${rest.map(l => `<li>${link(base, l)}</li>`).join('')}</ul></li>`
  }).join('')
  return `<nav class="ar-side-cats" aria-label="${esc(m.label)} categories"><h2>Category</h2><ul>${items}</ul></nav>`
}
function departmentPage(base, cat, query) {
  const m = cat.dept, products = productsFor(cat)
  return `${crumbs(base, [[cat.title]])}<section class="ar-dept-hero ar-art-${m.id}"><div><h1>${esc(cat.title)}</h1><p>Shop ${esc(m.label.toLowerCase())} at Argos. Get it delivered to your door, or Click &amp; Collect from your nearest store.</p></div></section><h2 class="ar-section-title">Shop by category</h2><div class="ar-cat-tiles">${groupTiles(base, m)}</div><div class="ar-promo-row"><a class="ar-promo-card ar-promo-red" href="${base}/events/big-event"><strong>The Big Red Event</strong><span>Shop the event ${chevron}</span></a><a class="ar-promo-card" href="${base}/help/delivery-and-collection-guide"><strong>Fast Track same day delivery</strong><span>Order by 1pm for delivery by 9pm ${chevron}</span></a><a class="ar-promo-card" href="${base}/help/argos-pay"><strong>Argos Pay</strong><span>Buy what you love, pay at your pace ${chevron}</span></a></div><h2 class="ar-section-title">${fixtureCatalog ? 'Popular in' : 'Shop all'} ${esc(cat.title)}</h2>${resultsBlock(base, products, base + m.path, query, { filters: !fixtureCatalog, side: deptCategoryNav(base, m) })}<section class="ar-seo"><h2>${esc(cat.title)} at Argos</h2><p>Browse ${esc(m.label.toLowerCase())} by category using the links above, compare features and prices, then choose home delivery or Click &amp; Collect. Prices include VAT.</p></section>`
}

function categoryPage(base, cat, query) {
  const m = cat.dept
  const trail = [[m.h1 || m.label, m.path]], all = cat.group?.links.find(([l]) => l.startsWith('Shop all'))
  if (all && all[0].replace(/^Shop all /, '') !== cat.title) trail.push([cat.group.title, all[1]])
  trail.push([cat.title])
  const siblings = cat.group ? cat.group.links.filter(([l]) => l.replace(/^Shop all /, '') !== cat.title) : []
  return `${crumbs(base, trail)}<h1>${esc(cat.title)}</h1>${siblings.length ? `<div class="ar-chips" aria-label="Related categories">${siblings.map(l => link(base, l)).join('')}</div>` : ''}${resultsBlock(base, productsFor(cat), base + [...CATEGORIES].find(([, c]) => c === cat)[0] + '/', query)}`
}

function infoPage(base, path, pg) {
  const sec = s => `<section class="ar-info-section"${s.id ? ` id="${esc(s.id)}"` : ''}><h2>${esc(s.h2)}</h2>${(s.p || []).map(t => `<p>${esc(t)}</p>`).join('')}${s.list ? `<ul>${s.list.map(t => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}${s.cards ? `<div class="ar-info-cards">${s.cards.map(([h, t]) => `<article><h3>${esc(h)}</h3><p>${esc(t)}</p>${publicNotice('<span class="ar-muted">Not sold on this website</span>')}</article>`).join('')}</div>` : ''}${s.links ? `<p class="ar-links">${s.links.map(l => link(base, l)).join('')}</p>` : ''}</section>`
  const isHelp = path.startsWith('/help')
  return `${crumbs(base, isHelp ? [['Help', '/help'], [pg.crumb || pg.title]] : [[pg.crumb || pg.title]])}<div class="ar-info"><h1>${esc(pg.h1 || pg.title)}</h1>${pg.sections.map(sec).join('')}${pg.note ? `<p class="ar-note">${esc(pg.note)}</p>` : ''}${pg.publicNote ? publicNotice(`<p class="ar-note">${esc(pg.publicNote)}</p>`) : ''}${pg.links ? `<p class="ar-links">${pg.links.map(l => link(base, l)).join('')}</p>` : ''}<aside class="ar-help-cta"><h2>Still need help?</h2><p><a href="${base}/help">Help &amp; FAQs</a> · <a href="${base}/help/contact">Contact us</a> · <a href="${base}/stores">Find a store</a></p></aside></div>`
}

function landingShelf(path, l) {
  const deals = byPopularity(SHELF.filter(p => p.deal))
  const inMenus = ids => SHELF.filter(p => ids.includes(p.menu))
  if (path === '/list/3-for-20-on-selected-toys' || path === '/sd/gold-jewellery') return SHELF.filter(p => p.paths.includes(path))
  if (path === '/list/shop-the-traitors') return SHELF.filter(p => p.paths.includes(path) || p.shelfCat === 'boardgame')
  if (path === '/sd/1-to-2-years-toys') return byPopularity(SHELF.filter(p => p.paths.includes(path) || p.shelfCat === 'earlylearning'))
  if (path === '/events/christmas-gifts') return byPopularity(inMenus(['toys', 'technology', 'gaming', 'health-and-beauty', 'jewellery-and-watches', 'christmas'])).slice(0, 48)
  if (/toys-offers/.test(path)) return byPopularity(inMenus(['toys', 'baby-and-nursery']).filter(p => p.deal || p.unit_price <= 30))
  if (/garden-diy/.test(path)) return byPopularity(inMenus(['garden-and-diy']))
  if (/top-100/.test(path)) return deals.slice(0, 100)
  if (/voucher|amazing-deals/.test(path)) return deals
  if (/big-event/.test(path)) return deals.filter(p => (l.tiles || []).includes(p.menu))
  return []
}
function landingPage(base, path, l, query = {}) {
  const products = /gaming|christmas|big-event/.test(path) ? gta : []
  const shelf = fixtureCatalog ? [] : landingShelf(path, l)
  return `${crumbs(base, [[l.title]])}<section class="ar-event-hero"><div><p class="eyebrow">Argos</p><h1>${esc(l.title)}</h1><p>${esc(l.intro)}</p></div></section><h2 class="ar-section-title">Shop by department</h2><div class="ar-tiles">${l.tiles.map(id => byId(id)).filter(Boolean).map(m => deptTile(base, m)).join('')}</div>${shelf.length ? `<h2 class="ar-section-title">Shop the offers</h2>${resultsBlock(base, shelf, base + path, query)}${products.length ? `<h2 class="ar-section-title">Pre-order the biggest games</h2>${cards(base, products)}` : ''}` : products.length ? `<h2 class="ar-section-title">Pre-order the biggest games</h2>${cards(base, products)}` : `<div class="ar-empty"><h2>No offers to show right now</h2><p>${esc(l.empty || 'Offers change regularly. Check back soon for new deals.')}</p><p><a class="button" href="${base}/">Back to homepage</a></p></div>`}`
}

function featurePage(base, f) {
  return `${crumbs(base, [[f.title]])}<section class="ar-event-hero ar-feature-hero"><div><h1>${esc(f.title)}</h1><p>${esc(f.intro)}</p></div></section><div class="ar-guides">${f.guides.map(([h, t, p]) => `<a class="ar-guide" href="${esc(base + p)}"><h2>${esc(h)}</h2><p>${esc(t)}</p><span>Explore ${chevron}</span></a>`).join('')}</div>${f.showGames && gta.length ? `<h2 class="ar-section-title">Coming soon</h2>${cards(base, gta)}` : ''}${f.showGames && !fixtureCatalog ? `<h2 class="ar-section-title">Out now</h2>${cards(base, byPopularity(SHELF.filter(p => p.catalogType === 'game' && p.new)).slice(0, 8))}` : ''}`
}

// ---------- homepage ----------
export function homeSections(base) {
  const pre = `<section class="ar-hero"><div class="ar-hero-copy"><p class="eyebrow">Now on</p><h2>The Big Red Event</h2><p>Big savings across tech, toys, home and more.</p><a class="button" href="${base}/events/big-event">Shop the event</a></div><div class="ar-hero-side"><a href="${base}/list/shop-top-100-deals"><strong>Shop our top 100 deals</strong><span>Updated regularly ${chevron}</span></a><a href="${base}/events/christmas-gifts"><strong>Shop Christmas</strong><span>Gifts for everyone ${chevron}</span></a><a href="${base}/amazing-deals"><strong>Shop A-mazing deals</strong><span>Across the store ${chevron}</span></a></div></section><h2 class="ar-section-title">Shop by department</h2><div class="ar-tiles">${MENU.map(m => deptTile(base, m)).join('')}</div>`
  const post = `<section class="ar-services"><a href="${base}/help/delivery-and-collection-guide">${ICONS.van}<strong>Fast Track same day delivery</strong><span>Order by 1pm for delivery by 9pm</span></a><a href="${base}/stores">${ICONS.store}<strong>Click &amp; Collect</strong><span>Free collection from Argos stores and Sainsbury’s</span></a><a href="${base}/help/argos-pay"><span class="ar-pay-mark" aria-hidden="true">£</span><strong>Argos Pay</strong><span>Buy what you love, pay at your pace</span></a><a href="${base}/help/nectar"><span class="ar-nectar-mark" aria-hidden="true">N</span><strong>Nectar at Argos</strong><span>Collect points on what you buy</span></a></section><section class="ar-split"><a href="${base}/help/gift-cards"><h2>Gift cards</h2><p>Send an Argos eGift Card instantly by email.</p></a><a href="${base}/events/voucher-discount-codes"><h2>Voucher codes</h2><p>Find our latest codes and offers.</p></a><a href="${base}/features/advice-and-inspiration"><h2>Advice &amp; Inspiration</h2><p>Buying guides and ideas.</p></a></section>`
  return { pre, post }
}

// ---------- 404 ----------
export function notFoundPage(base) {
  return `<section class="ar-404"><h1>Sorry, we can’t find that page</h1><p>The page you’re looking for may have moved or is no longer available. Try searching for what you need, or shop by department below.</p><form action="${base}/search" method="get" role="search" class="inline-form"><label class="visually-hidden" for="nf-search">Search Argos</label><input id="nf-search" name="q" placeholder="What are you looking for?"><button>Search</button></form><p><a class="button" href="${base}/">Continue shopping</a> <a class="button secondary" href="${base}/help">Help &amp; FAQs</a></p></section><h2 class="ar-section-title">Shop by department</h2><div class="ar-tiles">${MENU.map(m => deptTile(base, m)).join('')}</div>`
}

// ---------- site map ----------
const SERVICE_LINKS = [['Customer services', [['Help & FAQs', '/help'], ['Contact us', '/help/contact'], ['Store finder', '/stores'], ['Track your order', '/order/tracking'], ['Returns & refunds', '/help/returns-product-support-and-repairs'], ['Delivery & collection', '/help/delivery-and-collection-guide']]], ['Ways to pay & offers', [['Gift cards', '/help/gift-cards'], ['Voucher codes', '/events/voucher-discount-codes'], ['Argos Pay', '/help/argos-pay'], ['Nectar at Argos', '/help/nectar'], ['Payment types', '/help/payment-types'], ['Shop our top 100 deals', '/list/shop-top-100-deals'], ['The Big Red Event', '/events/big-event']]], ['Inspiration', [['Advice & inspiration', '/features/advice-and-inspiration'], ['Upcoming Games', '/features/gaming'], ['Christmas Gifts', '/events/christmas-gifts']]], ['Your account', [['Account', '/account/login'], ['Your orders', '/orders'], ['Wishlist', '/wishlist'], ['Trolley', '/basket']]], ['About Argos', [...FOOTER.at(-1).links, ...LEGAL]]]
function sitemapPage(base) {
  return `${crumbs(base, [['Site map']])}<h1>Site map</h1><p>Every department, category and service page on Argos.co.uk.</p><div class="ar-sitemap">${MENU.map(m => `<section><h2><a href="${esc(base + m.path)}">${esc(m.label)}</a></h2>${m.groups.map(g => `<h3>${esc(g.title)}</h3><ul>${g.links.map(l => `<li>${link(base, l)}</li>`).join('')}</ul>`).join('')}</section>`).join('')}${SERVICE_LINKS.map(([h, links]) => `<section><h2>${esc(h)}</h2><ul>${links.map(l => `<li>${link(base, l)}</li>`).join('')}</ul></section>`).join('')}</div>`
}
function sitemapPaths() {
  const set = new Set(['/', '/search', '/brands', '/stores', '/help', '/help/contact', '/order/tracking', '/account/login', '/basket', '/wishlist', '/sitemap', ...[...CATEGORIES.keys()].map(p => p + '/'), ...Object.keys(INFO), ...Object.keys(LANDINGS), ...Object.keys(FEATURES), ...PRODUCTS.map(p => `/product/${p.sku}`), ...SHELF.map(p => `/product/${p.sku}`)])
  return [...set]
}

// ---------- routes ----------
export function mountSite(router, { render, notFound }) {
  const base = res => res.locals.base
  router.use((req, res, next) => {
    if (req.method !== 'GET') return next()
    const cat = CATEGORIES.get(trim(req.path))
    if (!cat) return next()
    render(req, res, cat.title, cat.top ? departmentPage(base(res), cat, req.query) : categoryPage(base(res), cat, req.query))
  })
  for (const [path, pg] of Object.entries(INFO)) router.get(path, (req, res) => render(req, res, pg.title, infoPage(base(res), path, pg)))
  for (const [path, l] of Object.entries(LANDINGS)) router.get(path, (req, res) => render(req, res, l.title, landingPage(base(res), path, l, req.query)))
  for (const [path, f] of Object.entries(FEATURES)) router.get(path, (req, res) => render(req, res, f.title, featurePage(base(res), f)))
  router.get('/basket', (req, res) => res.redirect(`${base(res)}/trolley`))
  router.get('/help/contact-us', (req, res) => res.redirect(`${base(res)}/help/contact`))
  router.get('/sitemap', (req, res) => render(req, res, 'Site map', sitemapPage(base(res))))
  router.get('/sitemap.xml', (req, res) => {
    const urls = sitemapPaths().map(p => `<url><loc>${esc(base(res) + (p === '/' ? '/' : p))}</loc></url>`).join('')
    res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`)
  })
}
