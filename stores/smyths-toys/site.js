// Site-wide pages for the Smyths Toys clone: homepage, department/category pages on the real
// /<dept>/<sub>/c/<code> URLs, landing pages, help/policy pages, store finder, gift cards, catalogue
// request, HTML site map and /sitemap.xml. Product grids only ever show the store's own catalog.
import { esc, money, publicNotice } from '../../lib/html.js'
import { browseTiles, slug } from './browse.js'
import { shelfInCategory } from './shelf.js'
import { CATEGORY_ROWS, categoryByPath, childrenOf, topDepartments, AGE_TILES, TOP_CATEGORY_TILES, REGIONS, STORES, departmentRow } from './site-data.js'
import { PAGES, HELP_NAV, HELP_TOPICS } from './site-pages.js'

const str = v => typeof v === 'string' ? v.trim() : ''
const DEPT_OF = { Toys: 'toys', 'Baby Room': 'baby', Outdoor: 'outdoor', 'Gaming & Tech': 'gaming-and-tech' }

// ---------------------------------------------------------------- visual helpers
const PALETTE = ['#1763ac', '#e7212c', '#f5a800', '#2a9d5c', '#7a4fbf', '#e2587c', '#0f8fa8', '#ef7d00']
const GLYPHS = {
  bricks: '<rect x="14" y="30" width="36" height="18" rx="2"/><rect x="18" y="24" width="8" height="6" rx="1"/><rect x="38" y="24" width="8" height="6" rx="1"/>',
  car: '<path d="M12 40h40v-6l-6-8H22l-6 8h-4Z"/><circle cx="22" cy="42" r="5"/><circle cx="42" cy="42" r="5"/>',
  doll: '<circle cx="32" cy="20" r="8"/><path d="M22 52 26 30h12l4 22Z"/>',
  bike: '<circle cx="20" cy="40" r="9"/><circle cx="44" cy="40" r="9"/><path d="M20 40 28 26h10l6 14M28 26l6 14"/>',
  pad: '<path d="M14 28c0-5 4-8 9-8h18c5 0 9 3 9 8l2 14c0 5-6 6-9 1l-3-5H24l-3 5c-3 5-9 4-9-1Z"/>',
  baby: '<path d="M24 16h16v8l4 6v20a4 4 0 0 1-4 4H24a4 4 0 0 1-4-4V30l4-6Z"/>',
  gift: '<rect x="14" y="28" width="36" height="22" rx="2"/><rect x="12" y="22" width="40" height="8" rx="2"/><path d="M32 22v28M32 22c-4-8-12-8-10-2M32 22c4-8 12-8 10-2"/>',
  star: '<path d="m32 12 6 13 14 2-10 10 3 14-13-7-13 7 3-14-10-10 14-2Z"/>',
  ball: '<circle cx="32" cy="32" r="17"/><path d="m32 22 8 6-3 9h-10l-3-9Z"/>',
  card: '<rect x="12" y="20" width="40" height="26" rx="4"/><path d="M12 28h40"/>',
  bear: '<circle cx="32" cy="34" r="14"/><circle cx="21" cy="21" r="5"/><circle cx="43" cy="21" r="5"/>',
}
const glyphFor = label => {
  const l = label.toLowerCase()
  if (/lego|brick|construction|wooden/.test(l)) return 'bricks'
  if (/car|wheels|ride|kart|tractor/.test(l)) return 'car'
  if (/doll|barbie|fashion|blind|kpop|mirror|figure|spider/.test(l)) return 'doll'
  if (/bike|scooter|trike|skate|heel|hover/.test(l)) return 'bike'
  if (/gaming|playstation|xbox|nintendo|game|console|pc|controller|headset|vr|virtual|switch|funko|retro|pok/.test(l)) return 'pad'
  if (/baby|pushchair|car seat|cot|highchair|bath|months|nursery|toddler|monitor|bouncer|walker|bedding|sling/.test(l)) return 'baby'
  if (/gift|egift|card/.test(l)) return /card/.test(l) ? 'card' : 'gift'
  if (/ball|goal|football|basket|sport|trampoline|swing|garden|pool|castle/.test(l)) return 'ball'
  if (/tonies|paw|plush|soft|bear|play factory|pre-school/.test(l)) return 'bear'
  return 'star'
}
const hash = s => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7)
export const tileArt = (label, cls = 'st-tile-art') => { const c = PALETTE[hash(label) % PALETTE.length]; return `<span class="${cls}" style="--tile:${c}" aria-hidden="true"><svg viewBox="0 0 64 64"><g fill="#fff" fill-opacity=".92" stroke="#fff" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round">${GLYPHS[glyphFor(label)]}</g></svg></span>` }
const tile = (base, label, path) => `<a class="st-cat-tile" href="${base}${path}">${tileArt(label)}<span>${esc(label)}</span></a>`
const crumbs = (base, trail) => `<nav class="st-crumbs" aria-label="Breadcrumb"><ol><li><a href="${base}">Home</a></li>${trail.map(([t, u], i) => `<li>${u && i < trail.length - 1 ? `<a href="${base}${u}">${esc(t)}</a>` : `<span aria-current="page">${esc(t)}</span>`}</li>`).join('')}</ol></nav>`
const section = (title, inner, cls = '') => `<section class="st-section ${cls}"><div class="st-section-head"><h2>${title}</h2></div>${inner}</section>`

// ---------------------------------------------------------------- category matching (store catalog only)
function productsFor(c, catalog) {
  const leaf = c.segments[c.segments.length - 1]
  return catalog.filter(p => {
    if (p.shelf) return shelfInCategory(p, c)
    const dept = p.department ? DEPT_OF[p.department] : null
    if (c.top) return dept === c.department
    if (dept !== c.department) return false
    if (leaf === 'pre-order-games') return p.family === 'pre-order-games'
    if (leaf === 'playstation-5-pre-order-games') return p.family === 'pre-order-games' && p.platform === 'ps5'
    if (leaf === 'xbox-series-x-pre-order-games') return p.family === 'pre-order-games' && p.platform === 'xbox'
    return p.family === leaf || slug(p.category || '') === slug(c.label)
  })
}
const PRICE_BANDS = [['0-9.99', '£0 - £9.99', 0, 9.99], ['10-19.99', '£10 - £19.99', 10, 19.99], ['20-49.99', '£20 - £49.99', 20, 49.99], ['50-69.99', '£50 - £69.99', 50, 69.99], ['70-99.99', '£70 - £99.99', 70, 99.99], ['100-', '£100 +', 100, Infinity]]
const AGE_BANDS = [['0-6m', '0 - 6 Months', 0, 0.5], ['6-18m', '6 - 18 Months', 0.5, 1.5], ['18-36m', '18 - 36 Months', 1.5, 3], ['3-5', '3 - 5 Years', 3, 5], ['6-8', '6 - 8 Years', 6, 8], ['9-11', '9 - 11 Years', 9, 11], ['12+', '12 Years +', 12, 99]]
const SORTS = [['bestsellers', 'Bestsellers'], ['price-asc', 'Price: Low to High'], ['price-desc', 'Price: High to Low'], ['rating', 'Ratings'], ['newest', 'Newest']]
const asList = v => (Array.isArray(v) ? v : [v]).map(str).filter(Boolean)

export function categoryPage(base, c, catalog, query = {}) {
  const parents = []; for (let x = c.parent; x; x = x.parent) parents.unshift(x)
  const trail = [...parents.map(x => [x.label, x.path]), [c.label, c.path]]
  const kids = childrenOf(c)
  const banner = c.top ? `<section class="st-cat-banner st-cat-${esc(c.department)}"><div><h1>${esc(c.label)}</h1><p>${esc(c.blurb)}</p></div>${tileArt(c.label, 'st-banner-art')}</section>` : `<h1 class="st-cat-h1">${esc(c.label)}</h1>`
  const kidTiles = kids.length ? `<div class="st-cat-strip">${kids.map(k => tile(base, k.label, k.path)).join('')}</div>` : ''
  return listingPage(base, { all: productsFor(c, catalog), query, path: c.path, trail, head: banner + kidTiles, facetCats: kids.length ? kids : (c.parent ? childrenOf(c.parent) : []), current: c, label: c.label, back: (c.parent || departmentRow(c.department) || c).path })
}

// Product listing (category pages and search): Category / Age / Price / Brand facets, sort, 24 per page.
export function listingPage(base, { all, query = {}, path, trail, head = '', facetCats = [], current = null, label, back = '/search', keep = {}, defaultSort = 'bestsellers', sorts = SORTS }) {
  const price = asList(query.price), age = asList(query.age), brand = asList(query.brand), sort = sorts.some(s => s[0] === query.sort) ? query.sort : defaultSort
  const priceOf = p => p.price ?? p.unit_price
  let shown = all.filter(p => (!price.length || price.some(k => { const b = PRICE_BANDS.find(b => b[0] === k); return b && priceOf(p) != null && priceOf(p) >= b[2] && priceOf(p) <= b[3] }))
    && (!age.length || age.some(k => { const b = AGE_BANDS.find(b => b[0] === k); return b && (p.minAge ?? 0) <= b[3] && (p.maxAge ?? 99) >= b[2] }))
    && (!brand.length || brand.includes(p.brand)))
  const cmp = { 'price-asc': (a, b) => (priceOf(a) ?? 1e9) - (priceOf(b) ?? 1e9), 'price-desc': (a, b) => (priceOf(b) ?? -1) - (priceOf(a) ?? -1), rating: (a, b) => (b.rating || 0) - (a.rating || 0), newest: (a, b) => String(b.sku).localeCompare(String(a.sku)), bestsellers: (a, b) => (b.reviews || 0) - (a.reviews || 0), relevance: () => 0 }[sort]
  shown = [...shown].sort(cmp)
  const page = Math.max(1, Number.parseInt(query.page) || 1), per = 24, pages = Math.max(1, Math.ceil(shown.length / per)), cur = Math.min(page, pages)
  const pageItems = shown.slice((cur - 1) * per, cur * per)
  const brands = [...new Set(all.map(p => p.brand).filter(Boolean))].sort()
  const check = (name, value, text, on) => `<label class="st-check"><input type="checkbox" name="${name}" value="${esc(value)}"${on ? ' checked' : ''}><span>${esc(text)}</span></label>`
  const keepInputs = Object.entries(keep).filter(([, v]) => v).map(([k, v]) => `<input type="hidden" name="${esc(k)}" value="${esc(v)}">`).join('')
  const qs = extra => { const q = new URLSearchParams(); for (const [k, v] of Object.entries(keep)) if (v) q.set(k, v); for (const v of price) q.append('price', v); for (const v of age) q.append('age', v); for (const v of brand) q.append('brand', v); q.set('sort', sort); for (const [k, v] of Object.entries(extra)) q.set(k, v); return `?${q}` }
  const clear = `${base}${path}${Object.values(keep).some(Boolean) ? '?' + new URLSearchParams(Object.fromEntries(Object.entries(keep).filter(([, v]) => v))) : ''}`
  const filters = `<aside class="st-filters" aria-label="Filters"><details open class="st-filter-box"><summary><h2>Filters</h2></summary><form method="get" action="${base}${path}">${keepInputs}<input type="hidden" name="sort" value="${esc(sort)}">
  <fieldset class="st-facet"><legend>Category</legend>${facetCats.length ? `<ul>${facetCats.map(k => `<li><a href="${base}${k.path}"${k === current ? ' aria-current="page"' : ''}>${esc(k.label)}</a></li>`).join('')}</ul>` : `<p>${esc(label)}</p>`}</fieldset>
  <fieldset class="st-facet"><legend>Age</legend>${AGE_BANDS.map(([v, l]) => check('age', v, l, age.includes(v))).join('')}</fieldset>
  <fieldset class="st-facet"><legend>Price</legend>${PRICE_BANDS.map(([v, l]) => check('price', v, l, price.includes(v))).join('')}</fieldset>
  <fieldset class="st-facet"><legend>Brand</legend>${brands.length ? brands.map(b => check('brand', b, b, brand.includes(b))).join('') : '<p class="st-muted">No brands to show</p>'}</fieldset>
  <div class="st-filter-actions"><a href="${clear}">Clear all</a><button>Apply</button></div></form></details></aside>`
  const toolbar = `<div class="st-toolbar"><p class="st-count-line" role="status" data-result-count="${shown.length}"><strong>${shown.length} Products</strong>${shown.length ? ` <span>Showing ${(cur - 1) * per + 1}–${(cur - 1) * per + pageItems.length} of ${shown.length} products</span>` : ''}</p><form method="get" action="${base}${path}" class="st-sort">${keepInputs}${price.map(v => `<input type="hidden" name="price" value="${esc(v)}">`).join('')}${age.map(v => `<input type="hidden" name="age" value="${esc(v)}">`).join('')}${brand.map(v => `<input type="hidden" name="brand" value="${esc(v)}">`).join('')}<label for="sort">Sort by</label><select id="sort" name="sort">${sorts.map(([v, l]) => `<option value="${v}"${v === sort ? ' selected' : ''}>${l}</option>`).join('')}</select><button class="secondary">Sort</button></form></div>`
  const returnTo = `${path}${qs({ page: cur })}`
  const results = shown.length ? browseTiles(base, pageItems, 'GBP', /^\/search/.test(path) ? returnTo : '') : `<div class="st-empty"><h2>No products found</h2><p>${all.length ? 'No products match the filters you selected. Try removing a filter.' : `We couldn’t find any products in ${esc(label)} right now.`}</p><p>${all.length ? `<a class="button" href="${clear}">Clear all filters</a>` : `<a class="button" href="${base}${back}">Continue shopping</a>`} <a href="${base}/search">Search all products</a></p></div>`
  const pager = pages > 1 ? `<nav class="st-pager" aria-label="Pages">${cur > 1 ? `<a rel="prev" href="${base}${path}${qs({ page: cur - 1 })}">Previous</a>` : ''}${Array.from({ length: pages }, (_, i) => i + 1).filter(n => n === 1 || n === pages || Math.abs(n - cur) <= 2).map(n => `<a href="${base}${path}${qs({ page: n })}"${n === cur ? ' aria-current="page"' : ''}>${n}</a>`).join('')}<span>Page ${cur} of ${pages}</span>${cur < pages ? `<a rel="next" href="${base}${path}${qs({ page: cur + 1 })}">Next</a>` : ''}</nav>` : ''
  return `${crumbs(base, trail)}${head}<div class="st-plp">${filters}<section class="st-plp-results" aria-label="Products">${toolbar}${results}${pager}</section></div>`
}
export const SEARCH_SORTS = [['relevance', 'Relevance'], ...SORTS]

// ---------------------------------------------------------------- home
export function homePage(base, catalog) {
  const gta = catalog.filter(p => p.family === 'pre-order-games')
  const shelf = catalog.filter(p => p.shelf)
  const others = catalog.filter(p => p.family !== 'pre-order-games' && !p.shelf)
  const strip = (list, n) => browseTiles(base, list.slice(0, n))
  const bySku = skus => skus.map(sku => shelf.find(p => p.sku === sku)).filter(Boolean)
  const carousel = list => `<div class="st-carousel" tabindex="0" aria-label="Products">${browseTiles(base, list)}</div>`
  const cardRow = cards => `<div class="st-promo-cards">${cards.map(([title, text, path, cls = '']) => `<a class="st-pcard ${cls}" href="${base}${path}">${tileArt(title, 'st-pcard-art')}<b>${esc(title)}</b><span>${esc(text)}</span><em>Shop Now</em></a>`).join('')}</div>`
  // Reference mode: the real homepage carousels (captured 2026-10-13) drawn from the shop floor.
  const topPicks = shelf.length ? carousel(bySku(['189784', '225620', '259321', '259868', '259825', '236277', '223155', '259697', '258639', '254684', '263039', '261366', '258395', '261250']))
    : others.length ? strip(others.filter(p => p.department === 'Toys'), 8)
    : cardRow([['Top Toys', 'This season’s most wanted toys', '/toys/top-toys/c/top-toys'], ['LEGO New Arrivals', 'The latest sets to build', '/toys/lego-and-bricks/lego-new-arrivals/c/new-lego-range'], ['Console Bundle Deals', 'Consoles with games and accessories', '/gaming-and-tech/console-bundle-deals/c/SM060441'], ['Great Value Toys', 'Big fun for less', '/toys/great-value-toys/c/SM060108']])
  const chips = `<div class="st-chips">${[['Blind Boxes', '/toys/fashion-and-dolls/blind-boxes/c/SM06010416'], ['KPop Demon Hunters', '/brand/kpop-demon-hunters/c/SM060639'], ['Pokémon Gaming', '/gaming-and-tech/pokemon-gaming/c/pokemon-gaming'], ['Electric Ride Ons', '/outdoor/electric-ride-ons/c/SM060313'], ['Funko POP Culture', '/gaming-and-tech/funko-pop-culture/c/SM060453'], ['Hot Wheels', '/toys/construction-and-cars/car-toys/hot-wheels/c/SM06010210'], ['Tonies', '/toys/pre-school-and-electronic-learning/tonies/toniebox-audio/c/SM0601039702'], ['Pre-Order Games', '/gaming-and-tech/pre-order-games/c/SM060403']].map(([t, u]) => `<a href="${base}${u}">${esc(t)}</a>`).join('')}</div>`
  const trending = shelf.length ? chips + carousel(bySku(['261881', '259143', '256824', '262128', '258254', '249630', '230878', '253307', '259433', '248526']))
    : others.length ? strip(others.filter(p => p.department !== 'Toys' && p.department !== 'Gaming & Tech'), 8) : chips
  const toyPicks = shelf.length ? carousel(bySku(['148245', '199195', '200593', '255761', '245308', '242702', '258254', '258593', '255835', '250454', '256185', '259335', '254202']))
    : others.length ? strip(others.filter(p => p.department === 'Toys').slice(8), 4)
    : `<div class="st-cat-strip">${['SM060101', 'SM060102', 'SM060104', 'SM060107', 'SM060106', 'SM060105'].map(code => CATEGORY_ROWS.find(c => c.code === code)).map(c => tile(base, c.label, c.path)).join('')}</div>`
  // GTA VI sits in the gaming row among the consoles and other big releases, as one pre-order of several.
  const gamingList = shelf.length ? [...bySku(['249605', '232873', '249630']), gta[0], ...bySku(['263568', '263098', '236454']), gta[1], ...bySku(['240866', '244768'])].filter(Boolean) : gta
  const gaming = gamingList.length ? (shelf.length ? carousel(gamingList) : browseTiles(base, gamingList)) : ''
  const baby = shelf.length ? carousel(bySku(['245673', '243840', '252118', '216955', '223047', '208225', '253805', '226218'])) : ''
  return `<h1 class="sr-only">Smyths Toys Superstores – Toys, Baby, Outdoor and Gaming</h1>
<section class="st-hero"><div class="st-hero-copy"><p class="st-kicker">A world of play</p><h2>Power Up Playtime</h2><p>Electric ride ons, cars, quads and more – ready for adventure.</p><a class="button" href="${base}/outdoor/electric-ride-ons/c/SM060313">Shop Now</a></div><div class="st-hero-art" aria-hidden="true">${tileArt('Electric Ride Ons car', 'st-hero-blob')}${tileArt('star', 'st-hero-blob st-hero-blob2')}${tileArt('ball', 'st-hero-blob st-hero-blob3')}</div></section>
<ul class="st-usp"><li><a href="${base}/shipping-and-delivery"><b>FREE delivery</b> on orders over £20*</a></li><li><a href="${base}/shipping-and-delivery"><b>Order by 10pm</b> for next day delivery*</a></li><li><a href="${base}/click-and-collect"><b>FREE Click &amp; Collect</b> within 2 hours*</a></li></ul>
${section('Top categories', `<div class="st-cat-strip st-cat-strip-wide">${TOP_CATEGORY_TILES.map(([t, u]) => tile(base, t, u)).join('')}</div>`)}
${section('Top picks this week', topPicks)}
${section('Trending this week', trending)}
<section class="st-brand-hero"><div><p class="st-kicker">New</p><h2>Introducing Mirror Mi</h2><p>Discover the new interactive Mirror Mi range.</p><a class="button" href="${base}/brand/mirror-mi/c/SM060643">Shop Now</a></div>${tileArt('Mirror Mi', 'st-banner-art')}</section>
${section('Shop by age', `<div class="st-age-row">${AGE_TILES.map((a, i) => `<a class="st-age st-age-${i}" href="${base}${a.path}"><b>${esc(a.label)}</b></a>`).join('')}</div>`)}
${section('Top Toys picks this week!', toyPicks + `<p class="st-more"><a href="${base}/toys/top-toys/c/top-toys">Shop all Top Toys</a></p>`)}
<section class="st-split st-split-gaming"><div class="st-split-copy"><h2>Gaming at Smyths Toys</h2><p>Consoles, the biggest new releases, pre-orders and accessories for PlayStation, Xbox and Nintendo.</p><div class="st-chips st-chips-light"><a href="${base}/video-games">Video Games</a><a href="${base}/gaming-and-tech/pre-order-games/c/SM060403">Pre-Order Games</a><a href="${base}/gaming-and-tech/playstation-gaming/c/playstation-gaming">PlayStation</a><a href="${base}/gaming-and-tech/xbox-gaming/c/xbox-gaming">Xbox</a><a href="${base}/gaming-and-tech/nintendo-gaming/c/nintendo-gaming">Nintendo</a></div><a class="button" href="${base}/gaming-and-tech/c/SM0604">Shop Now</a></div>${gaming && !shelf.length ? `<div class="st-split-products">${gaming}</div>` : ''}</section>${gaming && shelf.length ? section('Gaming favourites', gaming + `<p class="st-more"><a href="${base}/gaming-and-tech/top-selling-games/c/top-selling-games">Shop Top Selling Games</a> · <a href="${base}/gaming-and-tech/pre-order-games/c/SM060403">Pre-Order Games</a></p>`) : ''}
<section class="st-split st-split-baby"><div class="st-split-copy"><h2>Shopping for baby?</h2><p>Pushchairs, car seats, nursery furniture and everything for little ones.</p><div class="st-chips">${['SM060205', 'SM060202', 'SM060203', 'SM060201', 'SM060216'].map(code => CATEGORY_ROWS.find(c => c.code === code)).map(c => `<a href="${base}${c.path}">${esc(c.label)}</a>`).join('')}</div><a class="button" href="${base}/baby/c/SM0602">Shop Now</a></div>${tileArt('baby', 'st-banner-art')}</section>${baby ? section('Baby favourites', baby) : ''}
${newsletter(base)}`
}
export const newsletter = base => `<section class="st-newsletter"><div><h2>Be the first to know</h2><p>Sign up for the latest toys, exclusive offers and events. You must be 18 or over.</p></div><form action="${base}/newsletter" method="post"><label class="sr-only" for="nl-email">Email address</label><input id="nl-email" name="email" type="email" autocomplete="email" placeholder="Enter your email address" required><button>Sign Up Now</button></form></section>`

// ---------------------------------------------------------------- info pages
const helpSide = (base, current) => `<aside class="st-side" aria-label="Help topics"><h2>Help &amp; FAQ</h2><ul>${HELP_NAV.map(([t, u]) => `<li><a href="${base}${u}"${u === current ? ' aria-current="page"' : ''}>${esc(t)}</a></li>`).join('')}</ul></aside>`
export function infoPage(base, path) {
  const page = PAGES[path]
  const fill = s => s.replaceAll('{base}', base)
  const article = `<article class="st-article"><h1>${esc(page.h1)}</h1>${fill(page.intro || '')}${page.sections.map(([h, html]) => `<h2>${esc(h)}</h2>${fill(html)}`).join('')}</article>`
  return `${crumbs(base, [[page.h1, path]])}<div class="st-info">${page.help ? helpSide(base, path) : ''}${article}</div>`
}
export function helpCentre(base, extra = '') {
  return `${crumbs(base, [['Help Centre', '/help']])}<section class="st-help-hero"><h1>Help Centre</h1><p>Find answers about delivery, Click &amp; Collect, returns, pre-orders and more.</p></section><div class="st-help-grid">${HELP_TOPICS.map(([t, u, d]) => `<a class="st-help-card" href="${base}${u}">${tileArt(t, 'st-help-art')}<b>${esc(t)}</b><span>${esc(d)}</span></a>`).join('')}</div>${extra}`
}

// ---------------------------------------------------------------- routes
export function installSite(router, { ROOT, url, render, field, catalog }) {
  const R = p => `${ROOT}${p}`
  router.get(['/sitemap.xml', R('/sitemap.xml')], (req, res) => {
    const base = url(res)
    const paths = ['', '/search', '/cart', '/login', '/wishlist', '/guest-lookup', '/help', '/storefinder', '/giftcardtype', '/gift-finder-hub', '/video-games', '/toys', '/baby', '/outdoor', '/gaming-and-tech', '/request-a-catalogue', '/sitemap', ...Object.keys(PAGES), '/contact-us', ...CATEGORY_ROWS.map(c => c.path), ...catalog.filter(p => p.family === 'pre-order-games' || p.shelf).map(p => p.path)]
    res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...new Set(paths)].map(p => `  <url><loc>${esc(base + p)}</loc></url>`).join('\n')}\n</urlset>\n`)
  })
  router.get(R('/sitemap'), (req, res) => {
    const base = url(res)
    const tree = d => `<section class="st-sm-dept"><h2><a href="${base}${d.path}">${esc(d.label)}</a></h2><ul>${childrenOf(d).map(k => `<li><a href="${base}${k.path}">${esc(k.label)}</a>${childrenOf(k).length ? `<ul>${childrenOf(k).map(g => `<li><a href="${base}${g.path}">${esc(g.label)}</a>${childrenOf(g).length ? `<ul>${childrenOf(g).map(h => `<li><a href="${base}${h.path}">${esc(h.label)}</a></li>`).join('')}</ul>` : ''}</li>`).join('')}</ul>` : ''}</li>`).join('')}</ul></section>`
    const other = CATEGORY_ROWS.filter(c => !c.department && !c.code.startsWith('gift-finder-'))
    const list = (h, items) => `<section class="st-sm-dept"><h2>${h}</h2><ul>${items.map(([t, u]) => `<li><a href="${base}${u}">${esc(t)}</a></li>`).join('')}</ul></section>`
    render(req, res, 'Site map', `${crumbs(base, [['Site map', '/sitemap']])}<h1>Site map</h1><p>Every department, category and service page in this store.</p><div class="st-sitemap">${topDepartments.map(tree).join('')}${list('Gift ideas by age', AGE_TILES.map(a => [a.label, a.path]))}${list('Brands', other.map(c => [c.label, c.path]))}${list('Shopping with us', [['Help centre', '/help'], ['Store finder', '/storefinder'], ['Gift Finder', '/gift-finder-hub'], ['Gift cards', '/giftcardtype'], ['Video Games', '/video-games'], ['Toys', '/toys'], ['In-store events', '/in-store-events'], ['Buying guides', '/buying-guides'], ['Request a catalogue', '/request-a-catalogue'], ['Manage my order', '/guest-lookup'], ['Sign in', '/login'], ['Wishlist', '/wishlist'], ['Basket', '/cart']])}${list('Help &amp; policies', [...HELP_NAV.filter(([, u]) => u !== '/help'), ['Payment Information', '/payment-information'], ['Product Information', '/product-information'], ['Privacy policy', '/privacy-policy'], ['Cookie policy', '/cookies-policy'], ['Terms & Conditions', '/terms-and-conditions'], ['Accessibility', '/accessibility'], ['Transparency statement', '/transparency-statement'], ['Tax Strategy', '/tax-strategy'], ['Gender Pay Gap', '/gender-pay-gap'], ['Charity partners', '/charity-partners'], ['Careers', '/careers']])}</div>`)
  })
  for (const path of Object.keys(PAGES)) {
    router.get(R(path), (req, res, next) => {
      // /stock-availability?sku=… keeps the existing store-stock journey.
      if (path === '/stock-availability' && req.query.sku) return next()
      render(req, res, PAGES[path].title, infoPage(url(res), path))
    })
  }

  // Store finder (real path /storefinder; the legacy /store-finder journey stays as is).
  router.get(R('/storefinder'), (req, res) => {
    const base = url(res), q = str(req.query.q).toLowerCase()
    const regions = REGIONS.map(r => [r, (STORES[r] || []).filter(s => !q || s.toLowerCase().includes(q) || r.toLowerCase().includes(q))]).filter(([r, list]) => !q || list.length || r.toLowerCase().includes(q))
    const storeLink = s => ['Beckton', 'Salford'].includes(s) ? `<a href="${base}/stores/${s.toLowerCase()}">${s}</a>` : esc(s)
    render(req, res, 'Store Finder & Opening Hours', `${crumbs(base, [['Store finder', '/storefinder']])}<section class="st-finder-hero"><h1>Store finder</h1><p>Find your nearest Smyths Toys Superstore. Our stores are open seven days a week.</p><form method="get" action="${base}/storefinder" class="st-finder-form"><label for="sf-q">Town, city or store name</label><div><input id="sf-q" name="q" value="${esc(req.query.q)}" placeholder="Enter town or store name"><button>Search</button></div></form><button type="button" class="secondary st-locate" disabled title="Location services are currently unavailable">Use my current location</button></section><h2>All stores</h2>${regions.length ? `<div class="st-regions">${regions.map(([r, list]) => `<section class="st-region-card"><h3>${esc(r)}</h3>${list.length ? `<ul>${list.map(s => `<li>${storeLink(s)}</li>`).join('')}</ul>` : '<p class="st-muted">Search by town or store name to find stores in this region.</p>'}</section>`).join('')}</div>` : `<p>No stores match “${esc(req.query.q)}”.</p>`}<p class="st-muted">Most stores open Monday–Saturday 9am–8pm and Sunday 11am–5pm (10am–4pm in Scotland and Northern Ireland). <a href="${base}/click-and-collect">How Click &amp; Collect works</a>.</p>`)
  })

  // Gift cards
  const giftCards = (req, res, v = {}, errors = [], status = 200, note = '') => {
    const base = url(res)
    render(req, res, 'Gift Cards', `${crumbs(base, [['Gift cards', '/giftcardtype']])}<section class="st-gc-hero"><h1>Smyths Toys Gift Cards</h1><p>The perfect gift for any occasion – choose an e-Gift Card delivered by email or a physical card delivered by post.</p></section><div class="st-gc-grid"><section class="st-gc-card st-gc-e"><div class="st-gc-visual" aria-hidden="true"><span>Smyths</span><small>e-Gift Card</small></div><h2>e-Gift Card</h2><p>Sent by email to the recipient with no shipping charges. Valid online and in store.</p><a class="button" href="${base}/gift-cards/egift-cards/c/SM060501">Shop e-gift cards</a></section><section class="st-gc-card st-gc-p"><div class="st-gc-visual" aria-hidden="true"><span>Smyths</span><small>Gift Card</small></div><h2>Physical Card</h2><p>Posted to the recipient as a plastic card; shipping may be charged. Valid online and in store.</p><a class="button" href="${base}/gift-cards/physical-gift-cards/c/SM060502">Shop Physical Gift Cards</a></section></div><section class="st-panel-soft"><h2>Already have a gift card?</h2><p>Check the balance on your Smyths Toys gift card.</p>${note}<form method="post" action="${base}/giftcardtype/balance" class="st-inline-form">${field('card_number', 'Gift card number (16 digits)', v, { autocomplete: 'off' })}${field('pin', 'PIN (8 digits)', {}, { type: 'password', autocomplete: 'off' })}<button>Check my balance</button></form></section><h2>Frequently asked questions</h2><div class="st-faq">${PAGES['/gift-card-info'].sections.map(([h, html]) => `<details><summary>${esc(h)}</summary>${html.replaceAll('{base}', base)}</details>`).join('')}</div>`, errors, status)
  }
  router.get(R('/giftcardtype'), (req, res) => giftCards(req, res))
  router.post(R('/giftcardtype/balance'), (req, res) => {
    const v = { card_number: str(req.body.card_number).replace(/\s+/g, '') }, errors = []
    if (!/^\d{16}$/.test(v.card_number)) errors.push('Enter the 16-digit gift card number.')
    if (!/^\d{8}$/.test(str(req.body.pin))) errors.push('Enter the 8-digit PIN.')
    if (errors.length) return giftCards(req, res, v, errors, 400)
    giftCards(req, res, {}, [], 200, '<p class="notice" role="status">Gift card balance checks are currently unavailable. Please try again later.</p>')
  })

  // Catalogue request
  const catalogue = (req, res, v = {}, errors = [], status = 200) => {
    const base = url(res)
    const done = req.store.smythsCatalogueRequest
    render(req, res, 'Request a Catalogue', `${crumbs(base, [['Request a catalogue', '/request-a-catalogue']])}<div class="st-catalogue"><section class="st-catalogue-intro"><div class="st-catalogue-cover" aria-hidden="true"><b>Smyths</b><span>Toy Catalogue</span><em>300 pages</em></div><div><h1>FREE Annual Smyths Toys Catalogue</h1><p>Request your free 300-page toy catalogue, delivered to your door each year. You must be 18 or over to request a catalogue.</p></div></section>${done && !errors.length && !v.first_name ? `<p class="notice" role="status">Thank you, ${esc(done.first_name)}. Your catalogue request has been received.${publicNotice(' (This is not the real Smyths Toys website; nothing will be posted.)')}</p>` : ''}<form method="post" action="${base}/request-a-catalogue" class="st-form-card"><div class="st-two">${field('first_name', 'First name', v, { autocomplete: 'given-name' })}${field('last_name', 'Last name', v, { autocomplete: 'family-name' })}</div><fieldset><legend>Address finder</legend><p class="st-muted">Enter address manually</p>${field('line1', 'Address line 1', v, { autocomplete: 'address-line1' })}${field('city', 'Town/City', v, { autocomplete: 'address-level2' })}${field('postal_code', 'Postcode', v, { autocomplete: 'postal-code' })}</fieldset>${field('email', 'Email address', v, { type: 'email', autocomplete: 'email', required: false })}<fieldset><legend>Catalogue options</legend><p class="st-muted">Tell us what you would like to hear about by email (optional).</p>${['Toys', 'Baby Room', 'Gaming'].map(o => `<label class="choice"><input type="checkbox" name="interests" value="${o}"${asList(v.interests).includes(o) ? ' checked' : ''}> ${o}</label>`).join('')}</fieldset><button>Subscribe</button><p class="st-muted">Your data is handled under our <a href="${base}/privacy-policy">Privacy policy</a>. You can unsubscribe at any time.</p></form></div>`, errors, status)
  }
  router.get(R('/request-a-catalogue'), (req, res) => catalogue(req, res))
  router.post(R('/request-a-catalogue'), (req, res) => {
    const v = { first_name: str(req.body.first_name), last_name: str(req.body.last_name), line1: str(req.body.line1), city: str(req.body.city), postal_code: str(req.body.postal_code).toUpperCase(), email: str(req.body.email), interests: asList(req.body.interests).filter(x => ['Toys', 'Baby Room', 'Gaming'].includes(x)) }, errors = []
    if (!v.first_name || !v.last_name) errors.push('Enter your first and last name.')
    if (!v.line1 || !v.city) errors.push('Enter your address.')
    if (!/^(GIR\s?0AA|[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2})$/i.test(v.postal_code)) errors.push('Enter a valid UK postcode.')
    if (v.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) errors.push('Enter a valid email address.')
    if (errors.length) return catalogue(req, res, v, errors, 400)
    req.store.smythsCatalogueRequest = { first_name: v.first_name, interests: v.interests }
    res.redirect(url(res, '/request-a-catalogue'))
  })

  // Newsletter
  router.post(R('/newsletter'), (req, res) => {
    const email = str(req.body.email), ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    const base = url(res)
    render(req, res, ok ? 'Thanks for signing up' : 'Newsletter sign-up', `${crumbs(base, [['Newsletter', '/newsletter']])}<h1>${ok ? 'Thanks for signing up' : 'Newsletter sign-up'}</h1>${ok ? `<p>You’re now signed up to hear about our latest offers.${publicNotice(' (This is not the real Smyths Toys website; no emails will be sent.)')}</p>` : ''}${newsletter(base)}`, ok ? [] : ['Enter a valid email address.'], ok ? 200 : 400)
  })
  router.get(R('/newsletter'), (req, res) => { const base = url(res); render(req, res, 'Newsletter sign-up', `${crumbs(base, [['Newsletter', '/newsletter']])}<h1>Newsletter sign-up</h1>${newsletter(base)}`) })

  // Video games landing (real /video-games)
  router.get(R('/video-games'), (req, res) => {
    const base = url(res)
    const gta = [...catalog.filter(p => p.family === 'pre-order-games'), ...catalog.filter(p => p.shelf && p.preorder)]
    const topGames = catalog.filter(p => p.shelf && p.codes.includes('top-selling-games')).slice(0, 10)
    const consoles = catalog.filter(p => p.shelf && p.catalogType === 'console')
    const row = list => `<div class="st-carousel" tabindex="0" aria-label="Products">${browseTiles(base, list)}</div>`
    const cats = ['playstation-gaming', 'xbox-gaming', 'nintendo-gaming', 'SM060441', 'SM060443', 'SM060403'].map(code => CATEGORY_ROWS.find(c => c.code === code))
    const shopBy = ['SM060404', 'SM060406', 'SM060405', 'SM060447', 'SM060455', 'gaming-accessories', 'SM060407', 'SM060459', 'SM060440', 'SM060453', 'SM060428', 'SM060465', 'SM060401', 'SM060434', 'SM060454', 'gaming-controllers'].map(code => CATEGORY_ROWS.find(c => c.code === code))
    render(req, res, 'Video Games, Consoles & Accessories', `${crumbs(base, [['Video Games', '/video-games']])}<section class="st-hero st-hero-dark"><div class="st-hero-copy"><p class="st-kicker">Out Now</p><h1>Video Games</h1><p>The biggest games, consoles and gaming tech for PlayStation, Xbox, Nintendo and PC.</p><a class="button" href="${base}/gaming-and-tech/c/SM0604">Shop Now</a></div><div class="st-hero-art" aria-hidden="true">${tileArt('gaming', 'st-hero-blob')}${tileArt('Xbox gaming', 'st-hero-blob st-hero-blob2')}</div></section>${section('Top categories', `<div class="st-cat-strip">${cats.map(c => tile(base, c.label, c.path)).join('')}</div>`)}${section('Coming soon', gta.length ? (gta.length > 4 ? row(gta) : browseTiles(base, gta)) : `<p>See <a href="${base}/gaming-and-tech/pre-order-games/c/SM060403">Pre-Order Games</a>.</p>`)}${topGames.length ? section('Top selling games', row(topGames)) : ''}${consoles.length ? section('Consoles', row(consoles)) : ''}${section('Shop by category', `<div class="st-cat-strip st-cat-strip-wide">${shopBy.map(c => tile(base, c.label, c.path)).join('')}${tile(base, 'Shop All', '/gaming-and-tech/c/SM0604')}</div>`)}`)
  })

  // Category pages on the real URL scheme.
  router.get(R('/{*rest}'), (req, res, next) => {
    const path = req.path.slice(ROOT.length).replace(/\/$/, '')
    const c = categoryByPath.get(path)
    if (!c) return next()
    render(req, res, c.label, categoryPage(url(res), c, catalog, req.query))
  })
}

// Extra sections appended to the legacy department hubs (/toys, /baby, /outdoor, /gaming-and-tech).
export function landingExtras(base, department) {
  const key = DEPT_OF[department], d = departmentRow(key)
  if (!d) return ''
  return `${section('Shop by category', `<div class="st-cat-strip st-cat-strip-wide">${childrenOf(d).map(k => tile(base, k.label, k.path)).join('')}${tile(base, 'Shop All', d.path)}</div>`)}${section('Shop by age', `<div class="st-age-row">${AGE_TILES.map((a, i) => `<a class="st-age st-age-${i}" href="${base}${a.path}"><b>${esc(a.label)}</b></a>`).join('')}</div>`)}`
}
// Reference-mode department landing (/toys, /baby, /outdoor, /gaming-and-tech): category tiles, ages
// and the department's best sellers from the shop floor.
export function departmentLanding(base, department, catalog) {
  const d = departmentRow(DEPT_OF[department])
  const items = catalog.filter(p => p.shelf && p.department === department).sort((a, b) => b.reviews - a.reviews)
  const offers = items.filter(p => p.was)
  const row = list => `<div class="st-carousel" tabindex="0" aria-label="Products">${browseTiles(base, list)}</div>`
  return `${crumbs(base, [[d.label, d.path]])}<section class="st-cat-banner st-cat-${esc(d.department)}"><div><h1>${esc(d.label)}</h1><p>${esc(d.blurb)}</p><a class="button" href="${base}${d.path}">Shop all ${esc(d.label)}</a></div>${tileArt(d.label, 'st-banner-art')}</section>${landingExtras(base, department)}${items.length ? section(`Bestsellers in ${esc(d.label)}`, row(items.slice(0, 12)) + `<p class="st-more"><a href="${base}${d.path}">Shop all ${items.length} products</a></p>`) : ''}${offers.length ? section('Offers', row(offers.slice(0, 12))) : ''}`
}
export const giftFinderIntro =(base, query) => `${crumbs(base, [['Gift Finder', '/gift-finder-hub']])}<section class="st-gift-hero"><h1>Gift Finder</h1><p>Find the perfect gift for kids of every age.</p><form method="get" action="${base}/gift-finder-hub" class="st-gift-form"><label for="gf-age">I would like a gift for someone aged between:</label><select id="gf-age" name="age"><option value="">Any age</option>${[['baby', '0 – 12 months'], ['1-2', '1 – 2 years'], ['3-4', '3 – 4 years'], ['5-7', '5 – 7 years'], ['8-11', '8 – 11 years'], ['12-16', '12 – 16 years'], ['18+', '18 years +']].map(([v, l]) => `<option value="${v}"${query.age === v ? ' selected' : ''}>${l}</option>`).join('')}</select><label for="gf-max">I would like to spend up to:</label><select id="gf-max" name="max"><option value="">Any budget</option>${['10', '20', '30', '50', '100'].map(v => `<option value="${v}"${query.max === v ? ' selected' : ''}>${money(Number(v), 'GBP')}</option>`).join('')}</select><button>Find your gift</button></form></section><div class="st-cat-strip">${[['LEGO Gift Finder', '/toys/lego-and-bricks/c/SM060107'], ['eGift Cards', '/gift-cards/egift-cards/c/SM060501'], ['Physical Gift Cards', '/gift-cards/physical-gift-cards/c/SM060502'], ['£10 & Below', '/toys/10-and-below/c/SM060114'], ['Top Toys', '/toys/top-toys/c/top-toys']].map(([t, u]) => tile(base, t, u)).join('')}</div><h2 class="st-h2-line">Top Toys picks this week!</h2>`
