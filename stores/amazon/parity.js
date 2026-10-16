// Amazon.com site structure beyond the pre-order flow: the gateway homepage, department and
// subcategory landings, the site directory and /sitemap.xml, Customer Service policy pages and
// local summaries of Amazon programs and off-site destinations. Grids and product rows list the
// everyday assortment (shelf.js) together with the evidence-backed GTA 6 pre-orders.
import { esc, money } from '../../lib/html.js'
import { productPhoto } from '../../lib/product-photos.js'
import { productImage } from '../../lib/product-assets.js'
import { PRODUCTS, ASSORTMENT, CATALOG, productPath, signinPath } from './data.js'
import { productArt } from './art.js'
import { DEPARTMENTS, departmentByNode, subcategoryByNode, HEADER_NAV, FOOTER, LEGAL, PROGRAMS, VIDEO_GAMES_PATH, GIFT_CARDS_PATH, HELP_PATH, helpNode, SITE_DIRECTORY, deptPath } from './sitemap.js'

const photo = (key, label) => productPhoto(key, label, 'azp-photo') || `<span class="azp-photo azp-photo-blank" role="img" aria-label="${esc(label)}"></span>`
const crumbs = (base, trail) => `<nav class="az-crumbs azp-crumbs" aria-label="Breadcrumb">${trail.map(([label, path], i) => i === trail.length - 1 ? `<span>${esc(label)}</span>` : `<a href="${base}${path}">${esc(label)}</a>`).join(' <span aria-hidden="true">&rsaquo;</span> ')}</nav>`
const L = (base, path, label, cls = '') => `<a${cls ? ` class="${cls}"` : ''} href="${base}${path}">${esc(label)}</a>`
const catalogItems = () => PRODUCTS.filter(p => p.stock > 0)

// ---------------------------------------------------------------- homepage (gateway)
const card = (base, title, tiles, more) => `<section class="azp-card"><h2>${esc(title)}</h2><div class="azp-quad">${tiles.map(([label, key, path]) => `<a href="${base}${path}">${photo(key, label)}<span>${esc(label)}</span></a>`).join('')}</div>${more ? `<a class="azp-card-more" href="${base}${more[1]}">${esc(more[0])}</a>` : ''}</section>`
const single = (base, title, label, key, path, more) => `<section class="azp-card"><h2>${esc(title)}</h2><a class="azp-single" href="${base}${path}">${photo(key, label)}</a><a class="azp-card-more" href="${base}${path}">${esc(more)}</a></section>`
const D = deptPath
const sub = (dept, label) => DEPARTMENTS.find(d => d.label === dept).subs.find(s => s.label === label).path

// Product carousels (image strips) and the deal row of the homepage.
const shelfIn = (...nodes) => ASSORTMENT.filter(p => nodes.includes(p.deptNode))
const ratingCount = p => Number(String(p.rating?.count ?? 0).replaceAll(',', ''))
const bestIn = (...nodes) => shelfIn(...nodes).slice().sort((a, b) => ratingCount(b) - ratingCount(a)).slice(0, 12)
const alsoBought = () => ASSORTMENT.slice().sort((a, b) => a.rank - b.rank).filter((p, i) => i % 3 === 1).slice(0, 14)
// The GTA 6 pre-orders appear inside the Video Games row (third and seventh), among other games.
function gamingRow(games) {
  const row = shelfIn('468642').filter(p => /Video Game|Console/.test(p.typeLabel)).sort((a, b) => ratingCount(b) - ratingCount(a)).slice(0, 12)
  if (games[0]) row.splice(2, 0, games[0])
  if (games[1]) row.splice(6, 0, games[1])
  return row
}
const strip = (base, title, items, path, more) => items.length ? `<section class="azp-row"><div class="azp-row-head"><h2>${esc(title)}</h2><a href="${base}${path}">${esc(more)}</a></div><div class="azp-strip">${items.map(p => `<a href="${productPath(base, p)}" title="${esc(p.title)}">${productArt(p)}</a>`).join('')}</div></section>` : ''
function dealRow(base) {
  const deals = ASSORTMENT.filter(p => p.listPrice && p.price / p.listPrice <= 0.8).sort((a, b) => a.rank - b.rank).slice(0, 12)
  if (!deals.length) return ''
  return `<section class="azp-row azp-deal-row"><div class="azp-row-head"><h2>Today's Deals</h2><a href="${base}/gp/goldbox">See all deals</a></div><div class="azp-strip">${deals.map(p => `<a href="${productPath(base, p)}">${productArt(p)}<span class="azp-deal-line"><span class="azp-deal-pct">${Math.round((1 - p.price / p.listPrice) * 100)}% off</span><span class="azp-deal-tag">Limited time deal</span></span><span class="azp-deal-line"><b>${money(p.price)}</b><span class="az-fine">List: <s>${money(p.listPrice)}</s></span></span><span class="azp-deal-name">${esc(p.title)}</span></a>`).join('')}</div></section>`
}

export function gatewayHome({ base, user = null }) {
  const games = PRODUCTS.filter(p => p.kind === 'game')
  const signinCard = user
    ? `<section class="azp-card azp-signin-card"><h2>Hi, ${esc(user.first_name || 'there')}</h2><p>Pick up where you left off.</p><a class="az-btn az-btn-block" href="${base}/gp/css/order-history">Your Orders</a><a class="azp-card-more" href="${base}/gp/css/homepage.html">Your Account</a></section>`
    : `<section class="azp-card azp-signin-card"><h2>Sign in for the best experience</h2><a class="az-btn az-btn-block" href="${esc(base + signinPath('/'))}">Sign in securely</a><div class="azp-signin-art" aria-hidden="true">${photo('room-living', '')}</div><p class="az-fine">New to Amazon? <a href="${base}/ap/register">Start here.</a></p></section>`
  const heroDeals = ASSORTMENT.filter(p => ['Apple 2025 MacBook Air 13-inch Laptop with M4 chip, 16GB Unified Memory, 256GB SSD – Midnight', 'Sony WH-1000XM5 Wireless Industry Leading Noise Canceling Headphones – Black'].includes(p.title))
  const heroes = [
    ['azp-hero-deals', "Today's Deals", 'New deals every day across top departments.', '/gp/goldbox', 'Shop deals'],
    ['azp-hero-gift', 'Amazon Gift Cards', 'The gift of choice, delivered by email, print at home or mail.', GIFT_CARDS_PATH, 'Shop gift cards'],
    ['azp-hero-gta', 'Pre-order Grand Theft Auto VI', 'Code in Box for PlayStation 5 and Xbox Series X|S. Delivers 11/12/26.', '/s?k=grand+theft+auto+vi', 'Shop now'],
  ]
  return `<div class="azp-home">
  <section class="azp-hero" aria-label="Featured" aria-roledescription="carousel">${heroes.map(([cls, h, p, path, cta], i) => `<a class="azp-hero-slide ${cls}" href="${base}${path}" data-hero ${i ? 'hidden' : ''} aria-label="${i + 1} of ${heroes.length}: ${esc(h)}"><div><${i ? 'h2' : 'h1'}>${esc(h)}</${i ? 'h2' : 'h1'}><p>${esc(p)}</p><span class="azp-hero-cta">${esc(cta)}</span></div>${cls === 'azp-hero-gta' ? `<span class="azp-hero-art">${games.slice(0, 2).map(g => productImage('amazon', g)).join('')}</span>` : cls === 'azp-hero-deals' ? `<span class="azp-hero-art">${heroDeals.map(d => productArt(d)).join('')}</span>` : ''}</a>`).join('')}
    <button type="button" class="azp-hero-prev" data-hero-prev aria-label="Previous slide" hidden>&#8249;</button><button type="button" class="azp-hero-next" data-hero-next aria-label="Next slide" hidden>&#8250;</button><div class="azp-hero-fade" aria-hidden="true"></div></section>
  <div class="azp-grid azp-grid-over">
    ${single(base, 'Get your game on', 'Shop gaming', 'ps5-console', VIDEO_GAMES_PATH, 'Shop gaming')}
    ${card(base, 'Shop for your home essentials', [['Cleaning Tools', 'floor-mop', sub('Health & Household', 'Household Supplies')], ['Home Storage', 'storage-bins', sub('Home & Kitchen', 'Storage & Organization')], ['Home Decor', 'planter-stoneware-white', sub('Home & Kitchen', 'Home Décor')], ['Bedding', 'bedding-white', sub('Home & Kitchen', 'Bedding')]], ['Discover more in Home', D('Home & Kitchen')])}
    ${card(base, 'Gaming accessories', [['Headsets', 'gaming-headset', sub('Video Games', 'Gaming Accessories')], ['Keyboards', 'keyboard', sub('Computers', 'Computer Accessories & Peripherals')], ['Computer mice', 'mouse', sub('Computers', 'Computer Accessories & Peripherals')], ['Chairs', 'gaming-chair', sub('Video Games', 'Gaming Accessories')]], ['See more', sub('Video Games', 'Gaming Accessories')])}
    ${signinCard}
    ${card(base, 'Shop deals in Fashion', [['Jeans under $50', 'jeans', sub("Women's Fashion", 'Clothing')], ['Tops under $25', 'tshirt', sub("Women's Fashion", 'Clothing')], ['Hoodies under $30', 'hoodie', sub("Women's Fashion", 'Clothing')], ['Shoes under $50', 'canvas-sneakers', sub("Women's Fashion", 'Shoes')]], ['See all deals', '/gp/goldbox'])}
    ${card(base, 'Refresh your space', [['Dining', 'dining-table-oak', sub('Home & Kitchen', 'Kitchen & Dining')], ['Home', 'sofa-gray-three-seat', D('Home & Kitchen')], ['Kitchen', 'stand-mixer', sub('Home & Kitchen', 'Kitchen & Dining')], ['Health and Beauty', 'serum', D('Beauty & Personal Care')]], ['See more', D('Home & Kitchen')])}
    ${card(base, 'New home arrivals under $50', [['Kitchen & dining', 'mug-set-cream', sub('Home & Kitchen', 'Kitchen & Dining')], ['Home improvement', 'ceramic-lamp', D('Tools & Home Improvement')], ['Décor', 'planter-stoneware-white', sub('Home & Kitchen', 'Home Décor')], ['Bedding & bath', 'bath-towels', sub('Home & Kitchen', 'Bath')]], ['Shop the latest from Home', D('Home & Kitchen')])}
    ${card(base, 'Top categories in Kitchen appliances', [['Cooker', 'dutch-oven', sub('Home & Kitchen', 'Kitchen & Dining')], ['Coffee', 'espresso-machine', sub('Home & Kitchen', 'Kitchen & Dining')], ['Pots and Pans', 'frying-pan', sub('Home & Kitchen', 'Kitchen & Dining')], ['Kettles', 'kettle', sub('Home & Kitchen', 'Kitchen & Dining')]], ['Explore all products in Kitchen', sub('Home & Kitchen', 'Kitchen & Dining')])}
  </div>
  ${dealRow(base)}
  ${strip(base, 'Customers also bought', alsoBought(), '/gp/bestsellers', 'See more')}
  <div class="azp-grid">
    ${card(base, 'Homeroom to homework', [['Backpacks', 'backpack', sub('Luggage', 'Backpacks')], ['Notebooks', 'notebooks', sub('Office Products', 'Office & School Supplies')], ['Laptops', 'laptop', sub('Computers', 'Laptops')], ['Headphones', 'headphones', sub('Electronics', 'Headphones')]], ['Explore more', D('Office Products')])}
    ${card(base, 'The latest listens', [['Vinyl', 'vinyl-blue-hour', sub('CDs & Vinyl', 'Vinyl')], ['Headphones', 'headphones-cream', sub('Electronics', 'Headphones')], ['Speakers', 'speaker', sub('Electronics', 'Home Audio')], ['Amazon Music', 'earbuds-white', '/music/player']], ['Listen now', '/music/player'])}
    ${card(base, 'Wireless Tech', [['Smartphones', 'smartphone', sub('Electronics', 'Cell Phones & Accessories')], ['Watches', 'smartwatch-black', sub('Electronics', 'Wearable Technology')], ['Headphones', 'earbuds', sub('Electronics', 'Headphones')], ['Tablets', 'tablet', sub('Computers', 'Tablets')]], ['Discover more', D('Electronics')])}
    ${card(base, 'Fashion trends you like', [['Skirts', 'tennis-skirt-black', sub("Women's Fashion", 'Clothing')], ['Knits', 'tshirt', sub("Men's Fashion", 'Clothing')], ['Jackets', 'windbreaker-blue', sub("Men's Fashion", 'Clothing')], ['Jewelry', 'analog-watch', sub("Women's Fashion", 'Jewelry')]], ['Explore more', '/amazon-fashion/b?node=7141123011'])}
  </div>
  ${strip(base, 'Best Sellers in Home & Kitchen', bestIn('1055398'), D('Home & Kitchen'), 'See more')}
  <section class="azp-row"><div class="azp-row-head"><h2>Everyday essentials you might like</h2><a href="${base}${D('Health & Household')}">See more</a></div><div class="azp-strip azp-strip-cats">${[['Paper towels', 'paper-towels', 'Health & Household', 'Household Supplies'], ['Laundry', 'laundry-detergent', 'Health & Household', 'Household Supplies'], ['Trash bags', 'trash-bags', 'Health & Household', 'Household Supplies'], ['Dish soap', 'dish-soap', 'Health & Household', 'Household Supplies'], ['Cleaning wipes', 'cleaning-wipes', 'Health & Household', 'Household Supplies'], ['Coffee', 'coffee', 'Grocery & Gourmet Food', 'Beverages'], ['Snacks', 'cookies', 'Grocery & Gourmet Food', 'Snacks'], ['Pet food', 'dog-food', 'Pet Supplies', 'Dogs']].map(([label, key, d, s]) => `<a href="${base}${sub(d, s)}">${photo(key, label)}<span>${esc(label)}</span></a>`).join('')}</div></section>
  ${strip(base, 'Best Sellers in Electronics', bestIn('172282', '541966', '2102313011'), D('Electronics'), 'See more')}
  ${strip(base, 'Popular products in Video Games', gamingRow(games), VIDEO_GAMES_PATH, 'See more')}
  ${strip(base, 'Top Sellers in Books for you', bestIn('283155'), D('Books'), 'See more')}
  ${strip(base, 'Best Sellers in Toys & Games', bestIn('165793011'), D('Toys & Games'), 'See more')}
  ${strip(base, 'Best Sellers in Beauty & Personal Care', bestIn('3760911'), D('Beauty & Personal Care'), 'See more')}
  ${strip(base, 'Popular items in Pet Supplies', bestIn('2619533011'), D('Pet Supplies'), 'See more')}
  <section class="azp-row"><div class="azp-row-head"><h2>Explore more</h2><a href="${base}${SITE_DIRECTORY}">See all departments</a></div><div class="azp-strip azp-strip-cats">${DEPARTMENTS.slice(0, 12).map(d => `<a href="${base}${d.path}">${photo(d.photo, d.label)}<span>${esc(d.label)}</span></a>`).join('')}</div></section>
  ${user ? '' : `<section class="azp-perso"><div class="azp-perso-line"></div><h2>See personalized recommendations</h2><a class="az-btn azp-perso-btn" href="${esc(base + signinPath('/'))}">Sign in</a><p class="az-fine">New customer? <a href="${base}/ap/register">Start here.</a></p></section>`}
</div><script>(()=>{const s=[...document.querySelectorAll('[data-hero]')];if(s.length<2)return;let i=0;const show=n=>{s[i].hidden=true;i=(n+s.length)%s.length;s[i].hidden=false};document.querySelectorAll('[data-hero-prev],[data-hero-next]').forEach(b=>{b.hidden=false;b.addEventListener('click',()=>show(i+(b.hasAttribute('data-hero-next')?1:-1)))})})()</script>`
}

// ---------------------------------------------------------------- department / subcategory landings
const FASHION = { label: 'Amazon Fashion', slug: 'amazon-fashion', node: '7141123011', tagline: "Clothing, shoes, jewelry, watches and handbags for women, men, girls and boys.", photo: 'tote', path: '/amazon-fashion/b?node=7141123011',
  subs: DEPARTMENTS.filter(d => /Fashion$/.test(d.label)).map(d => ({ label: d.label, node: d.node, photo: d.photo, path: d.path })) }
export const SUPPORTED_DEPT_NODES = new Set([...DEPARTMENTS.map(d => d.node), FASHION.node])

const filterRail = (base, action, hidden, q) => {
  const radio = (name, value, label) => `<label class="azp-filter"><input type="radio" name="${name}" value="${value}" ${q[name] === value ? 'checked' : ''}> ${label}</label>`
  return `<form method="get" action="${base}${action}" class="azp-filters">${Object.entries(hidden).map(([k, v]) => `<input type="hidden" name="${k}" value="${esc(v)}">`).join('')}
  <fieldset><legend>Delivery Day</legend><label class="azp-filter"><input type="checkbox" name="delivery" value="tomorrow" ${q.delivery ? 'checked' : ''}> Get It by Tomorrow</label></fieldset>
  <fieldset><legend>Customer Reviews</legend>${radio('rating', '4', '<span class="azp-stars" aria-hidden="true">★★★★☆</span> &amp; Up')}</fieldset>
  <fieldset><legend>Price</legend>${[['under25', 'Up to $25'], ['25to50', '$25 to $50'], ['50to100', '$50 to $100'], ['100to200', '$100 to $200'], ['over200', '$200 &amp; above']].map(([v, l]) => radio('price', v, l)).join('')}</fieldset>
  <fieldset><legend>Deals &amp; Discounts</legend>${radio('deals', 'all', 'All Discounts')}${radio('deals', 'today', "Today's Deals")}</fieldset>
  <fieldset><legend>Condition</legend>${radio('condition', 'new', 'New')}${radio('condition', 'used', 'Used')}</fieldset>
  <fieldset><legend>Availability</legend><label class="azp-filter"><input type="checkbox" name="oos" value="1" ${q.oos ? 'checked' : ''}> Include Out of Stock</label></fieldset>
  <button class="az-btn az-btn-sm" type="submit">Apply</button></form>`
}
const filterQuery = q => Object.fromEntries(['delivery', 'rating', 'price', 'deals', 'condition', 'oos'].map(k => [k, typeof q[k] === 'string' ? q[k] : '']))

const PER_PAGE = 24
const SORT_OPTIONS = [['', 'Featured'], ['price-asc-rank', 'Price: Low to High'], ['price-desc-rank', 'Price: High to Low'], ['review-rank', 'Avg. Customer Review'], ['date-desc-rank', 'Newest Arrivals'], ['exact-aware-popularity-rank', 'Best Sellers']]
const PRICE_BANDS = { under25: [0, 25], '25to50': [25, 50], '50to100': [50, 100], '100to200': [100, 200], over200: [200, Infinity] }
const listOf = v => (Array.isArray(v) ? v : v === undefined ? [] : [v]).map(String).filter(Boolean)
function refine(products, q, brands) {
  let list = products.filter(p => p.stock > 0 || q.oos)
  if (q.delivery) list = list.filter(p => !p.release)
  if (q.rating) list = list.filter(p => (p.rating?.stars ?? 0) >= Number(q.rating))
  if (PRICE_BANDS[q.price]) { const [lo, hi] = PRICE_BANDS[q.price]; list = list.filter(p => p.price >= lo && p.price < hi) }
  if (q.deals) list = list.filter(p => p.deal)
  if (q.condition) list = list.filter(p => (p.condition || 'New').toLowerCase() === q.condition)
  if (brands.length) list = list.filter(p => brands.includes(p.brand))
  return list
}
function sortLanding(list, sort) {
  const count = p => Number(String(p.rating?.count ?? 0).replaceAll(',', ''))
  const featured = p => p.shelf ? p.rank : 4 * 40 + 0.5
  const by = { 'price-asc-rank': (a, b) => a.price - b.price, 'price-desc-rank': (a, b) => b.price - a.price, 'review-rank': (a, b) => (b.rating?.stars ?? 0) - (a.rating?.stars ?? 0), 'date-desc-rank': (a, b) => String(b.addedDate).localeCompare(String(a.addedDate)), 'exact-aware-popularity-rank': (a, b) => count(b) - count(a) }[sort]
  return list.slice().sort((a, b) => featured(a) - featured(b)).sort(by || (() => 0))
}

function landing({ base, req, dept, current, action, hidden, trail, sideTitle, sideLinks, tiles, products }) {
  const q = filterQuery(req.query)
  const brands = listOf(req.query.brand)
  const sort = SORT_OPTIONS.some(([v]) => v && v === req.query.s) ? String(req.query.s) : ''
  const filtered = Object.values(q).some(Boolean) || brands.length > 0
  const all = refine(products, q, brands)
  const sorted = sortLanding(all, sort)
  const pages = Math.max(1, Math.ceil(sorted.length / PER_PAGE))
  const page = Math.min(pages, Math.max(1, Number.parseInt(req.query.page, 10) || 1))
  const shown = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const state = { ...hidden, ...Object.fromEntries(Object.entries(q).filter(([, v]) => v)), ...(sort ? { s: sort } : {}) }
  const href = (changes) => { const u = new URLSearchParams(); for (const [k, v] of Object.entries({ ...state, ...changes })) if (v !== '' && v !== undefined) u.append(k, v); for (const b of brands) u.append('brand', b); return `${base}${action}?${u.toString().replace(/%20/g, '+')}` }
  const brandChoices = [...new Set(products.map(p => p.brand))].sort((a, b) => a.localeCompare(b))
  const rail = filterRail(base, action, { ...hidden, ...(sort ? { s: sort } : {}) }, q).replace('<button class="az-btn az-btn-sm" type="submit">Apply</button></form>', `${brandChoices.length ? `<fieldset class="azp-facet-brands"><legend>Brands</legend>${brandChoices.map(b => `<label class="azp-filter"><input type="checkbox" name="brand" value="${esc(b)}" ${brands.includes(b) ? 'checked' : ''}> ${esc(b)}</label>`).join('')}</fieldset>` : ''}<button class="az-btn az-btn-sm" type="submit">Apply</button>${filtered ? ` <a class="azp-clear" href="${base}${action}?${new URLSearchParams(hidden)}">Clear</a>` : ''}</form>`)
  const card = p => `<article class="azp-result" data-asin="${esc(p.asin)}"><a href="${productPath(base, p)}">${productArt(p)}</a><a class="azp-result-title" href="${productPath(base, p)}">${esc(p.title)}</a>${p.rating ? `<div class="az-stars"><span aria-hidden="true">${'★'.repeat(Math.round(p.rating.stars))}${'☆'.repeat(5 - Math.round(p.rating.stars))}</span> <span class="a-offscreen">${esc(p.rating.stars)} out of 5 stars</span><span class="az-static">${esc(p.rating.count)}</span></div>` : ''}${p.bought ? `<span class="az-fine">${esc(p.bought)}</span>` : ''}<b>${money(p.price)}</b>${p.listPrice ? `<span class="az-fine az-list-price">List: <s>${money(p.listPrice)}</s></span>` : ''}<span class="az-fine">${esc(p.release ? p.availability : p.delivery?.[0] || p.availability)}</span></article>`
  const results = shown.length
    ? `<div class="azp-results-grid">${shown.map(card).join('')}</div>${pages > 1 ? `<nav class="azp-pager" aria-label="Pagination">${page > 1 ? `<a href="${esc(href({ page: page - 1 }))}">&lsaquo; Previous</a>` : '<span class="is-disabled">&lsaquo; Previous</span>'}${Array.from({ length: pages }, (_, i) => i + 1).map(n => n === page ? `<span class="is-current" aria-current="page">${n}</span>` : `<a href="${esc(href({ page: n }))}">${n}</a>`).join('')}${page < pages ? `<a href="${esc(href({ page: page + 1 }))}">Next &rsaquo;</a>` : '<span class="is-disabled">Next &rsaquo;</span>'}</nav>` : ''}`
    : `<div class="azp-noresults"><h3>No results for ${esc(current.label)}${filtered ? ' with these filters' : ''}.</h3><p>Try removing a filter, checking your spelling or using more general terms, or shop a related category.</p><p>${L(base, VIDEO_GAMES_PATH, 'Shop Video Games')} &middot; ${L(base, '/gp/goldbox', "See Today's Deals")} &middot; ${L(base, SITE_DIRECTORY, 'See all departments')}</p></div>`
  const range = sorted.length ? `${(page - 1) * PER_PAGE + 1}-${(page - 1) * PER_PAGE + shown.length} of ${sorted.length} result${sorted.length === 1 ? '' : 's'}` : '0 results'
  return `${crumbs(base, trail)}
<div class="azp-dept">
  <aside class="azp-rail" aria-label="Refine">
    <h3>Department</h3>
    <ul class="azp-rail-list">${sideTitle ? `<li>${sideTitle}</li>` : ''}${sideLinks.map(s => `<li class="${s.node === current.node ? 'is-current' : 'azp-indent'}">${s.node === current.node ? `<b>${esc(s.label)}</b>` : L(base, s.path, s.label)}</li>`).join('')}</ul>
    ${rail}
  </aside>
  <div class="azp-dept-main">
    <header class="azp-dept-hero"><div><p class="azp-kicker">${esc(dept.label)}</p><h1>${esc(current.label)}</h1><p>${esc(current.tagline || dept.tagline)}</p><a class="az-btn az-btn-sm" href="${base}/gp/goldbox">Shop deals</a></div>${photo(current.photo || dept.photo, current.label)}</header>
    ${tiles.length ? `<section class="azp-shopby"><h2>Shop by category</h2><div class="azp-circles">${tiles.map(s => `<a href="${base}${s.path}">${photo(s.photo, s.label)}<span>${esc(s.label)}</span></a>`).join('')}</div></section>` : ''}
    <nav class="azp-curated" aria-label="Collections">${L(base, '/gp/bestsellers', `Best Sellers in ${dept.label}`)}${L(base, '/gp/new-releases', 'New Releases')}${L(base, '/gp/goldbox', "Today's Deals")}${L(base, '/coupons', 'Coupons')}</nav>
    <section class="azp-results"><div class="azp-results-head"><h2>Results</h2><form method="get" action="${base}${action}">${Object.entries({ ...hidden, ...Object.fromEntries(Object.entries(q).filter(([, v]) => v)) }).map(([k, v]) => `<input type="hidden" name="${k}" value="${esc(v)}">`).join('')}${brands.map(b => `<input type="hidden" name="brand" value="${esc(b)}">`).join('')}<label for="azp-sort">Sort by:</label> <select id="azp-sort" name="s">${SORT_OPTIONS.map(([v, l]) => `<option value="${v}"${v === sort ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select> <button class="az-btn az-btn-sm az-btn-outline" type="submit">Go</button></form></div>
      <p class="az-fine">${range} &middot; Check each product page for other buying options.</p>${results}</section>
    <section class="azp-editorial"><h2>About ${esc(current.label)}</h2><p>Shop ${esc(current.label.toLowerCase())} at Amazon.com. ${esc(current.tagline || dept.tagline)} Find categories above, refine with the filters on the left, and compare options on each product page.</p></section>
  </div>
</div>`
}
const gameProducts = node => node === '468642' || ['20972781011', '20972814011', '979455011'].includes(node) ? catalogItems().filter(p => p.kind === 'game' && (node === '468642' || node === '979455011' || (node === '20972781011' ? p.platform === 'ps5' : p.platform === 'xbox'))) : []

const FASHION_NODES = ['7147440011', '7147441011', '7147442011', '7147443011']
const nodeProducts = node => [...gameProducts(node), ...ASSORTMENT.filter(p => p.stock > 0 && (p.nodes.includes(node) || (node === '7141123011' && FASHION_NODES.includes(p.deptNode))))]

export function departmentLanding(base, req, node) {
  const dept = node === FASHION.node ? FASHION : departmentByNode(node)
  return landing({ base, req, dept, current: dept, action: `/${dept.slug}/b`, hidden: { node: dept.node }, trail: [['Amazon.com', '/'], [dept.label, dept.path]], sideLinks: dept.subs, tiles: dept.subs, products: nodeProducts(dept.node) })
}
export function subcategoryLanding(base, req, node) {
  const { dept, sub: current } = subcategoryByNode(node)
  return landing({ base, req, dept, current, action: '/b', hidden: { node: current.node }, trail: [['Amazon.com', '/'], [dept.label, dept.path], [current.label, current.path]], sideTitle: `<a href="${base}${dept.path}">&lsaquo; ${esc(dept.label)}</a>`, sideLinks: dept.subs, tiles: dept.subs.filter(s => s.node !== current.node), products: nodeProducts(current.node) })
}
// "Shop by category" row on the existing Video Games / catalog department pages.
export function shopByCategory(base, nodeId) {
  const dept = departmentByNode({ videogames: '468642', electronics: '172282', home: '1055398', 'toys-and-games': '165793011', stripbooks: '283155', music: '5174' }[nodeId] || '')
  if (!dept) return ''
  return `<section class="azp-shopby"><h2>Shop by category</h2><div class="azp-circles">${dept.subs.map(s => `<a href="${base}${s.path}">${photo(s.photo, s.label)}<span>${esc(s.label)}</span></a>`).join('')}</div></section>`
}

// ---------------------------------------------------------------- collection intros
export const COLLECTION_INTRO = {
  bestsellers: ['Amazon Best Sellers', 'Our most popular products based on sales. Updated frequently.'],
  new: ['Amazon Hot New Releases', 'Our best-selling new and future releases. Updated frequently.'],
  movers: ['Amazon Movers & Shakers', 'Our biggest gainers in sales rank over the past 24 hours. Updated frequently.'],
}
export function collectionIntro(base, kind) {
  if (kind === 'deals') return `<div class="azp-collection"><h2 class="azp-collection-title">Today's Deals</h2><nav class="azp-deal-tabs" aria-label="Deal types"><a class="is-current" href="${base}/gp/goldbox">All Deals</a><a href="${base}/gp/goldbox?deals-widget=prime">Prime Exclusive Deals</a><a href="${base}/coupons">Coupons</a></nav><div class="azp-deal-cats">${DEPARTMENTS.slice(0, 10).map(d => `<a href="${base}${d.path}">${photo(d.photo, d.label)}<span>${esc(d.label)}</span></a>`).join('')}</div></div>`
  const [title, copy] = COLLECTION_INTRO[kind]
  return `<div class="azp-collection"><h2 class="azp-collection-title">${title}</h2><p>${copy}</p><nav class="azp-deal-tabs" aria-label="Lists">${[['Best Sellers', '/gp/bestsellers'], ['New Releases', '/gp/new-releases'], ['Movers & Shakers', '/gp/movers-and-shakers']].map(([l, p]) => `<a href="${base}${p}"${title.includes(l.split(' ')[0]) ? ' class="is-current"' : ''}>${l}</a>`).join('')}</nav></div>`
}

// ---------------------------------------------------------------- info pages
// [h1, intro, [[h2, paragraph], ...], [[label, path], ...]]
const INFO = {
  '/careers': ['Careers at Amazon', 'Amazon is hiring across corporate, technology, operations, customer service and hourly roles in the US and around the world.', [['Find jobs', 'Search open roles by team, location and job category, from software development and data science to fulfillment and delivery.'], ['Hourly roles', 'Warehouse, delivery and customer service jobs with full-time, part-time, seasonal and flexible schedules.'], ['Benefits', 'Many roles include health care, paid time off, parental leave, 401(k) and Career Choice education funding.']], [['About Amazon', '/about']]],
  '/newsletter': ['Amazon Newsletter', 'Stories, news and updates from Amazon, delivered to your inbox.', [['What you will get', 'A weekly roundup of company news, product launches, community stories and behind-the-scenes features from About Amazon.'], ['Subscription', 'Sign up for the Amazon newsletter on About Amazon to get company news delivered to your inbox.']], [['About Amazon', '/about']]],
  '/about': ['About Amazon', "Amazon is guided by four principles: customer obsession rather than competitor focus, passion for invention, commitment to operational excellence, and long-term thinking.", [['Our company', 'Founded in 1994 in Seattle as an online bookstore, Amazon now offers retail, devices, entertainment, AWS cloud services and more.'], ['Our impact', 'Read about Amazon’s work on sustainability, community investment, workplace safety and small business support.']], [['Careers', '/careers'], ['Sustainability', '/sustainability'], ['Press Center', '/pr'], ['Investor Relations', '/ir']]],
  '/accessibility': ['Accessibility at Amazon', 'Amazon works to make its devices, services and shopping experiences usable by everyone.', [['Shopping accessibility', 'Amazon.com supports screen readers, keyboard navigation and high-contrast settings across desktop and the Amazon Shopping app.'], ['Device features', 'Fire TV, Kindle and Echo devices offer screen readers, magnifiers, captions and voice controls.'], ['Get help', 'Customers with disabilities can reach Accessibility Customer Service through Customer Service.']], [['Customer Service', HELP_PATH]]],
  '/sustainability': ['Sustainability', 'Amazon co-founded The Climate Pledge, a commitment to reach net-zero carbon emissions by 2040.', [['Climate Pledge Friendly', 'A program that highlights products with sustainability certifications.'], ['Packaging', 'Amazon works to reduce packaging and ship items in their own packaging where possible.']], [['About Amazon', '/about']]],
  '/pr': ['Press Center', 'News releases, media resources and contacts for journalists covering Amazon.', [['Latest news', 'Company announcements, product launches and financial results are published on the Amazon press site.'], ['Media contacts', 'Journalists can find press office contacts by business and region on the press site.']], [['Investor Relations', '/ir']]],
  '/ir': ['Investor Relations', 'Amazon.com, Inc. (NASDAQ: AMZN) quarterly results, annual reports, SEC filings and shareholder information.', [['Financial results', 'Amazon reports results each quarter, with earnings releases and conference call webcasts.'], ['Annual reports and proxies', 'Annual reports, shareholder letters and proxy statements are published on the investor relations site.']], [['About Amazon', '/about']]],
  '/science': ['Amazon Science', 'Research and publications from Amazon scientists in machine learning, robotics, quantum computing and more.', [['Research areas', 'Artificial intelligence, computer vision, conversational AI, economics, operations research, robotics and sustainability.'], ['Academic collaborations', 'Amazon funds research awards, fellowships and university partnerships.']], [['Careers', '/careers']]],
  '/b?node=12766669011': ['Sell on Amazon', 'Reach hundreds of millions of customers by selling your products in the Amazon store.', [['How it works', 'Register a seller account, list your products, and choose to fulfill orders yourself or with Fulfillment by Amazon (FBA).'], ['Selling plans', 'The Individual plan charges $0.99 per item sold; the Professional plan is $39.99 per month. Referral and fulfillment fees vary by category.'], ['Grow your brand', 'Brand Registry, Sponsored Products ads and Amazon Business help sellers build their business.']], [['Protect & Build Your Brand', '/brand-registry'], ['Advertise Your Products', '/advertising'], ['See More Ways to Make Money', '/make-money']]],
  '/sell-apps': ['Sell apps on Amazon', 'Publish apps and games to the Amazon Appstore for Fire TV and Fire tablets.', [['Amazon Appstore', 'Developers submit apps through the Amazon Developer Console and reach customers on Fire devices.'], ['Monetization', 'Sell paid apps, offer in-app purchases, or run subscriptions.']], [['See More Ways to Make Money', '/make-money']]],
  '/supply': ['Supply to Amazon', 'Manufacturers and distributors can become vendors and sell products wholesale to Amazon.', [['Vendor Central', 'Vendors receive purchase orders from Amazon, which then sells the products to customers.'], ['Requirements', 'Vendor relationships are by invitation and require meeting Amazon’s supply chain standards.']], [['Sell on Amazon', '/b?node=12766669011']]],
  '/brand-registry': ['Protect & Build Your Brand', 'Amazon Brand Registry helps rights owners protect their trademarks and grow their brand in the Amazon store.', [['Protection', 'Automated protections, a report-a-violation tool and Project Zero help remove infringing listings.'], ['Brand building', 'A+ Content, Stores and Sponsored Brands help shoppers discover your brand.']], [['Sell on Amazon', '/b?node=12766669011']]],
  '/associates': ['Become an Affiliate', 'Amazon Associates lets content creators, publishers and bloggers earn commissions on qualifying purchases.', [['How it works', 'Sign up, share links to Amazon products on your site or social channels, and earn on qualifying purchases.'], ['Influencer Program', 'Social media creators can get their own storefront to recommend products.']], [['See More Ways to Make Money', '/make-money']]],
  '/delivery-driver': ['Become a Delivery Driver', 'Amazon Flex lets you deliver packages with your own vehicle on your own schedule.', [['How it works', 'Download the Amazon Flex app, choose delivery blocks, and deliver packages in your area.'], ['Requirements', 'Drivers must be 21 or older, have a valid driver’s license and pass a background check.']], [['Start a Package Delivery Business', '/dsp']]],
  '/dsp': ['Start a Package Delivery Business', 'The Delivery Service Partner program helps entrepreneurs build a business delivering Amazon packages.', [['Program overview', 'Delivery Service Partners lead teams of drivers and get access to Amazon technology, vehicles and discounts.'], ['Getting started', 'Applicants need no logistics experience; startup costs can be as low as $10,000.']], [['Become a Delivery Driver', '/delivery-driver']]],
  '/advertising': ['Advertise Your Products', 'Amazon Ads helps brands reach customers across the Amazon store, Prime Video, Fire TV and third-party sites.', [['Sponsored ads', 'Sponsored Products, Sponsored Brands and Sponsored Display put your products in front of shoppers.'], ['Streaming TV and display', 'Reach audiences on Prime Video and Fire TV with video and display ads.']], [['Sell on Amazon', '/b?node=12766669011']]],
  '/kdp': ['Self-Publish with Us', 'Kindle Direct Publishing lets authors publish eBooks, paperbacks and hardcovers for free and reach readers worldwide.', [['Publish in minutes', 'Upload your manuscript and cover; books appear on Amazon within 72 hours.'], ['Earn royalties', 'Earn up to 70% royalty on eBook sales and enroll in Kindle Unlimited through KDP Select.']], [['Kindle Books', deptPath('Kindle Books')]]],
  '/hub': ['Become an Amazon Hub Partner', 'Earn extra income by delivering packages in your community as an Amazon Hub Delivery partner, or host an Amazon Hub Locker.', [['Hub Delivery', 'Local businesses deliver packages to nearby customers alongside their regular operations.'], ['Hub Locker and Counter', 'Host self-service lockers or a staffed pickup counter at your location.']], [['Amazon Pickup Locations', '/ulp/view']]],
  '/make-money': ['Make Money with Amazon', 'Ways to earn with Amazon as a seller, creator, partner or driver.', [['Sell and supply', 'Sell on Amazon, sell apps, supply to Amazon or protect your brand.'], ['Create and partner', 'Become an affiliate, self-publish, advertise or deliver packages.']], FOOTER[1][1].filter(([, p]) => p !== '/make-money')],
  '/amazon-visa': ['Amazon Visa', 'Earn rewards on Amazon.com and Whole Foods Market purchases with an Amazon Visa or Prime Visa card.', [['Rewards', 'Prime Visa earns unlimited 5% back at Amazon.com, Amazon Fresh and Whole Foods Market with an eligible Prime membership; Amazon Visa earns 3% back.'], ['Applying', 'Applications are not available for your account at this time.']], [['Amazon Store Card', '/amazon-store-card'], ['Shop with Points', '/shop-with-points']]],
  '/amazon-store-card': ['Amazon Store Card', 'A store card for purchases at Amazon.com with special financing on eligible purchases.', [['Benefits', 'Prime members earn 5% back on Amazon.com purchases; equal monthly payment and deferred interest financing on eligible purchases.'], ['Applying', 'Applications are not available for your account at this time.']], [['Amazon Secured Card', '/amazon-secured-card']]],
  '/amazon-secured-card': ['Amazon Secured Card', 'A secured card that helps build credit with a refundable security deposit.', [['How it works', 'Make a security deposit, use the card at Amazon.com, and make on-time payments to build credit.'], ['Applying', 'Applications are not available for your account at this time.']], [['Amazon Store Card', '/amazon-store-card']]],
  '/amazon-business-card': ['Amazon Business Card', 'Business credit cards with rewards on Amazon Business, AWS and Whole Foods Market purchases.', [['Rewards', 'Earn back on eligible Amazon Business purchases, or choose extended payment terms.'], ['Applying', 'Applications are not available for your account at this time.']], [['Amazon Visa', '/amazon-visa']]],
  '/shop-with-points': ['Shop with Points', 'Use eligible credit card rewards points to pay for purchases on Amazon.com.', [['Eligible programs', 'Link a participating card (for example, American Express Membership Rewards or Chase Ultimate Rewards) and apply points at checkout.'], ['Your account', 'No eligible rewards cards are linked to your account. Checkout accepts a credit or debit card.']], [['Payment methods', '/help/payment']]],
  '/credit-card-marketplace': ['Credit Card Marketplace', 'Compare credit card offers available from Amazon and its partners.', [['Amazon cards', 'Prime Visa, Amazon Visa, Amazon Store Card and Amazon Secured Card.'], ['Partner offers', 'Partner card offers vary. No partner offers are available for your account right now.']], FOOTER[2][1].slice(0, 4)],
  '/reload-your-balance': ['Reload Your Balance', 'Add money to your Amazon gift card balance and use it for purchases on Amazon.com.', [['How it works', 'Choose an amount, pay with a debit or credit card, and the funds are added to your balance instantly.'], ['Your balance', 'Your Amazon Gift Card balance is $0.00. Reloading is not available for your account at this time.']], [['Gift Cards', GIFT_CARDS_PATH]]],
  '/currency-converter': ['Amazon Currency Converter', 'Pay for Amazon.com purchases in your card’s currency when shopping from outside the US.', [['How it works', 'Amazon Currency Converter shows the total in your card’s billing currency at checkout, with the exchange rate locked in.'], ['U.S. cards', 'Cards issued in the United States are charged in U.S. dollars.']], [['Payment methods', '/help/payment']]],
  '/amazonprime': ['Amazon Prime', 'Prime members get fast, free delivery, exclusive deals, and award-winning entertainment for $14.99/month or $139/year.', [['Delivery', 'FREE Same-Day, One-Day and Two-Day Delivery on millions of items, and FREE Release-Date Delivery on eligible pre-orders.'], ['Streaming', 'Prime Video movies and TV, Amazon Music with ad-free podcasts, and Prime Gaming.'], ['Shopping', 'Prime Big Deal Days, Prime-exclusive deals, Prime Visa rewards and Amazon Pharmacy savings.'], ['Your membership', 'You are not a Prime member. Prime sign-up and free trials are not available for your account at this time; orders use the delivery options shown at checkout.']], [['Prime Video', '/gp/video/storefront'], ['Amazon Music', '/music/player'], ["Today's Deals", '/gp/goldbox']]],
  '/gp/video/storefront': ['Prime Video', 'Watch movies, TV shows and live sports, including Amazon Originals, included with Prime.', [['Included with Prime', 'Amazon Originals and a catalog of movies and series at no extra cost for Prime members.'], ['Store and channels', 'Rent or buy titles, or add subscriptions such as Max, Paramount+ and Apple TV+.'], ['Watching', 'Prime Video is not available for your account. Shop movies and TV on disc instead.']], [['Movies & Television', deptPath('Movies & Television')], ['Amazon Prime', '/amazonprime']]],
  '/music/player': ['Amazon Music', 'Stream millions of songs and podcasts. Prime members get access to the full catalog in shuffle mode and ad-free top podcasts.', [['Amazon Music Unlimited', 'On-demand access to 100 million songs in HD and Spatial Audio.'], ['Listening', 'Amazon Music is not available for your account. Shop CDs and vinyl instead.']], [['CDs & Vinyl', deptPath('CDs & Vinyl')], ['Amazon Prime', '/amazonprime']]],
  '/fresh': ['Amazon Fresh', 'Groceries delivered from Amazon Fresh, with low prices on fresh produce, meat, dairy and household essentials.', [['Delivery and pickup', 'Choose a 2-hour delivery window or free pickup at Amazon Fresh stores. Prime members get free delivery on qualifying orders.'], ['Delivery area', 'Amazon Fresh delivery is not available at your address. Browse Grocery & Gourmet Food instead.']], [['Grocery & Gourmet Food', deptPath('Grocery & Gourmet Food')], ['Same-Day Delivery', '/same-day-delivery']]],
  '/pharmacy': ['Amazon Pharmacy', 'Fill prescriptions online with transparent pricing and free delivery for Prime members.', [['How it works', 'Transfer a prescription or have your doctor send one, compare prices with insurance, and get it delivered.'], ['RxPass', 'Prime members can get eligible generic medications for one monthly fee.'], ['Your account', 'Amazon Pharmacy is not set up on your account. Shop Health & Household instead.']], [['Health & Household', deptPath('Health & Household')]]],
  '/amazonbasics': ['Amazon Basics', 'Everyday essentials at a great value, designed by Amazon: home, kitchen, electronics accessories, office and more.', [['Shop by category', 'Cables and chargers, batteries, storage, kitchen tools, bedding, office supplies and pet essentials.'], ['Find Amazon Basics', 'Search for “Amazon Basics” to see paper towels, trash bags, bath towels and more.']], [['Electronics', deptPath('Electronics')], ['Home & Kitchen', deptPath('Home & Kitchen')], ['Office Products', deptPath('Office Products')]]],
  '/coupons': ['Digital Coupons', 'Clip coupons and save on products across Amazon. Discounts are applied at checkout.', [['How coupons work', 'Clip a coupon on the product or coupons page; the savings are applied when you check out.'], ['Coupons available here', 'There are no coupons available for your account right now.']], [["Today's Deals", '/gp/goldbox']]],
  '/same-day-delivery': ['Same-Day Delivery', 'Get eligible items delivered today in select cities. Prime members get free same-day delivery on qualifying orders.', [['How it works', 'Look for “Today” delivery on eligible items and order by the cutoff time shown.'], ['Your address', 'Delivery options for each item are shown on its product page and at checkout.']], [['Shipping Rates and Delivery Estimates', helpNode('468520')]]],
  '/hz/mycd/myx': ['Manage Your Content and Devices', 'View and manage your digital content, devices, preferences and privacy settings.', [['Content', 'Kindle books, apps, videos and music you own.'], ['Devices', 'Register, deregister and manage Echo, Fire TV, Kindle and other devices.'], ['Your content', 'You have no digital content or registered devices.']], [['Your Account', '/gp/css/homepage.html']]],
  '/your-product-safety-alerts': ['Recalls and Product Safety Alerts', 'Amazon notifies customers about recalls and safety alerts for products they bought.', [['Your alerts', 'There are no recalls or product safety alerts for items you bought.'], ['Report a safety concern', 'Contact Customer Service to report a product safety issue.']], [['Customer Service', HELP_PATH], ['Your Orders', '/gp/css/order-history']]],
  '/adprefs': ['Your Ads Privacy Choices', 'Control whether Amazon shows you interest-based ads.', [['Interest-based ads', 'Amazon may use information about your activity to show ads for products you might like. You can opt out of interest-based ads at any time.'], ['Your choice', 'Interest-based ads are turned off for your account.']], [['Privacy Notice', helpNode('468496')]]],
  '/ap/cnep': ['Login & security', 'Edit your name, email, mobile number, password and two-step verification settings.', [['Account details', 'Sign in to view and edit the name, email and password on your account.'], ['Two-Step Verification', 'Two-step verification adds a one-time code to your sign-in. It is not available for your account at this time.']], [['Your Account', '/gp/css/homepage.html'], ['Sign-in help', '/help/signin']]],
  '/cpe/yourpayments/wallet': ['Your Payments', 'Manage payment methods, view transactions and set your default purchase preference.', [['Wallet', 'You have no saved cards. Add a card at checkout; your orders show only the card brand and last four digits.'], ['Transactions', 'Order totals are shown in Your Orders.']], [['Your Orders', '/gp/css/order-history'], ['Payment methods and charges', '/help/payment']]],
  [helpNode('508088')]: ['Conditions of Use', 'Welcome to Amazon.com. Amazon.com Services LLC and/or its affiliates provide website features and other products and services to you when you visit or shop at Amazon.com. By using Amazon services, you agree to these conditions. Please read them carefully.', [['Privacy', 'Please review our Privacy Notice, which also governs your use of Amazon Services, to understand our practices.'], ['Electronic communications', 'When you use Amazon Services, or send e-mails, text messages and other communications to us, you are communicating with us electronically.'], ['Your account', 'You may need your own Amazon account to use certain Amazon Services. You are responsible for maintaining the confidentiality of your account and password.'], ['Returns, refunds and title', 'Amazon does not take title to returned items until the item arrives at our fulfillment center. See our Returns Policy.']], [['Privacy Notice', helpNode('468496')], ['Amazon.com Returns Policy', helpNode('GKM69DUUYKQWKWX7')]]],
  [helpNode('468496')]: ['Amazon.com Privacy Notice', 'We know that you care how information about you is used and shared, and we appreciate your trust that we will do so carefully and sensibly. This Privacy Notice describes how Amazon.com and its affiliates collect and process your personal information.', [['What personal information do we collect?', 'Information you give us, information collected automatically, and information from other sources.'], ['For what purposes do we use your personal information?', 'To fulfill orders, provide and improve services, recommend products, comply with legal obligations and prevent fraud.'], ['What choices do I have?', 'You can review and update your information, adjust communication preferences and manage interest-based ads.']], [['Your Ads Privacy Choices', '/adprefs'], ['Consumer Health Data Privacy Disclosure', helpNode('TnACMrGftqtXpwyOQ0')]]],
  [helpNode('TnACMrGftqtXpwyOQ0')]: ['Consumer Health Data Privacy Disclosure', 'This disclosure supplements the Amazon.com Privacy Notice and explains how Amazon handles consumer health data under applicable state laws.', [['Health data we collect', 'For example, purchases of health products or information you provide when using health services.'], ['How we use it', 'To provide the products and services you request, and as described in the Privacy Notice.']], [['Privacy Notice', helpNode('468496')]]],
  [helpNode('GKM69DUUYKQWKWX7')]: ['Amazon.com Returns Policy', 'You may return most new, unopened items within 30 days of delivery for a full refund. We also pay the return shipping costs if the return is a result of our error.', [['Return window', 'Most items sold by Amazon.com can be returned within 30 days of receipt. Some products have different policies or requirements, and holiday purchases may have an extended return window.'], ['Refunds', 'Refunds are issued to the original payment method, usually within 3-5 business days after we receive your return. A quick refund may be issued within 24 hours at a drop-off location.'], ['Items that cannot be returned', 'Downloadable software, opened video games and code-in-box products whose code has been revealed, gift cards, and some health and personal care items.'], ['Pre-orders', 'A pre-order that has not shipped can be canceled from Your Orders instead of returned.']], [['Returns & Replacements', '/gp/css/returns/homepage.html'], ['Cancel an order', '/help/cancel']]],
  [helpNode('468520')]: ['Shipping Rates and Delivery Estimates', 'Shipping rates and delivery estimates depend on the item, the seller, your address and the shipping speed you choose. The total, including tax, is shown at checkout before you place your order.', [['Domestic shipping rates', 'Orders of eligible items shipped by Amazon qualify for FREE Shipping on orders over $35. Otherwise standard shipping charges apply per shipment and per item.'], ['Delivery estimates', 'The estimated delivery date is shown on the product page, at checkout and in Your Orders.'], ['Prime shipping benefits', 'Prime members get FREE Two-Day, One-Day and Same-Day Delivery on eligible items.'], ['Release-Date Delivery', 'Eligible pre-orders can arrive on the release date. Select Release-Date Delivery at checkout; it is FREE for Prime members.']], [['Same-Day Delivery', '/same-day-delivery'], ['Amazon Prime', '/amazonprime']]],
  [helpNode('G4BRP7LCB9DSDNCR')]: ['About the Pre-Order Price Guarantee', 'When you pre-order an eligible item sold by Amazon.com, you will be charged the lowest price offered by Amazon.com between the time you place your order and the end of the day of the release date.', [['When you are charged', 'Your payment method is charged when the item ships.'], ['If the price drops after shipping', 'If the item ships before the release date and the price drops by the end of the release day, the difference is refunded.'], ['Canceling', 'You can cancel a pre-order any time before it ships from Your Orders.']], [['Release-Date Delivery', helpNode('468520')], ['Cancel an order', '/help/cancel']]],
}
export const INFO_PATHS = Object.keys(INFO)

// Program and company pages open with a banner in the program's colours, then their topics as cards;
// help and policy pages stay plain articles, as on amazon.com.
const INFO_THEME = {
  '/amazonprime': ['#0F79AF', '#00A8E1'], '/gp/video/storefront': ['#0F171E', '#1A98FF'], '/music/player': ['#0D0D26', '#25D1DA'],
  '/fresh': ['#1E5B2E', '#5BA53A'], '/pharmacy': ['#0B4F6C', '#16A3B5'], '/same-day-delivery': ['#0F79AF', '#00A8E1'],
  '/amazonbasics': ['#232F3E', '#FF9900'], '/coupons': ['#B12704', '#E47911'], '/sustainability': ['#11483B', '#3E8E5E'],
  '/amazon-visa': ['#131A22', '#37475A'], '/amazon-store-card': ['#131A22', '#37475A'], '/amazon-secured-card': ['#131A22', '#37475A'], '/amazon-business-card': ['#131A22', '#37475A'],
}
function infoPage(base, path) {
  const [h1, intro, sections, links] = INFO[path]
  const isHelp = path.startsWith(HELP_PATH)
  const [c1, c2] = INFO_THEME[path] ?? ['#232F3E', '#485769']
  const head = isHelp ? `<h1>${esc(h1)}</h1><p class="azp-lead">${esc(intro)}</p>` : `<header class="azp-info-hero" style="background:linear-gradient(100deg,${c1},${c2})"><h1>${esc(h1)}</h1><p class="azp-lead">${esc(intro)}</p></header>`
  return `${crumbs(base, isHelp ? [['Help & Customer Service', HELP_PATH], [h1, path]] : [['Amazon.com', '/'], [h1, path]])}<div class="azp-info${isHelp ? '' : ' azp-info-program'}"><article>${head}<div class="azp-info-sections">${sections.map(([h, p]) => `<section><h2>${esc(h)}</h2><p>${esc(p)}</p></section>`).join('')}</div></article><aside class="azp-info-side"><h2>Related</h2>${links.map(([l, p]) => `<p>${L(base, p, l)}</p>`).join('')}<p>${L(base, HELP_PATH, 'Customer Service')}</p></aside></div>`
}

// ---------------------------------------------------------------- site directory and sitemap.xml
function siteDirectory(base) {
  return `<div class="azp-directory"><h1>Shop by Department</h1><p class="az-fine">Earth's biggest selection, organized by department.</p><div class="azp-dir-grid">${DEPARTMENTS.map(d => `<section><h2>${L(base, d.path, d.label)}</h2><ul>${d.subs.map(s => `<li>${L(base, s.path, s.label)}</li>`).join('')}</ul></section>`).join('')}</div>
  <h2 class="azp-dir-h">Programs &amp; Features</h2><ul class="azp-dir-programs">${PROGRAMS.map(([l, p]) => `<li>${L(base, p, l)}</li>`).join('')}</ul>
  <h2 class="azp-dir-h">Make Money with Us &amp; Company</h2><ul class="azp-dir-programs">${[...FOOTER[0][1], ...FOOTER[1][1], ...FOOTER[2][1]].map(([l, p]) => `<li>${L(base, p, l)}</li>`).join('')}</ul>
  <h2 class="azp-dir-h">Help &amp; Policies</h2><ul class="azp-dir-programs">${[...FOOTER[3][1], ...LEGAL, ['Amazon.com Returns Policy', helpNode('GKM69DUUYKQWKWX7')], ['About the Pre-Order Price Guarantee', helpNode('G4BRP7LCB9DSDNCR')]].map(([l, p]) => `<li>${L(base, p, l)}</li>`).join('')}</ul></div>`
}
function sitemapXml(base) {
  const paths = new Set(['/', SITE_DIRECTORY, '/s?k=grand+theft+auto+vi', ...PRODUCTS.map(p => productPath('', p)), ...HEADER_NAV.map(([, p]) => p), ...FOOTER.flatMap(([, l]) => l.map(([, p]) => p)), ...LEGAL.map(([, p]) => p), ...PROGRAMS.map(([, p]) => p), ...DEPARTMENTS.flatMap(d => [d.path, ...d.subs.map(s => s.path)]), ...INFO_PATHS, '/ulp/view', '/registries', GIFT_CARDS_PATH, '/gp/cart/view.html', '/ap/signin'])
  const x = s => s.replace(/&/g, '&amp;')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...paths].map(p => `  <url><loc>${x(base + p)}</loc></url>`).join('\n')}\n</urlset>\n`
}

// ---------------------------------------------------------------- gift cards, registry, pickup locations
// Drawn gift card designs for the "Shop by type" tiles (a card face per delivery type).
const gcSmile = (x, y, c) => `<path d="M${x} ${y}q34 15 68 0" fill="none" stroke="${c}" stroke-width="4" stroke-linecap="round"/><path d="M${x + 62} ${y - 6}l8 5-9 4" fill="none" stroke="${c}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`
const gcFace = (fill, ink, accent, tag) => `<rect x="40" y="52" width="240" height="150" rx="14" fill="${fill}"/><text x="62" y="98" font-family="Arial,Helvetica,sans-serif" font-size="30" font-weight="700" fill="${ink}">amazon</text>${gcSmile(64, 108, accent)}<text x="62" y="184" font-family="Arial,Helvetica,sans-serif" font-size="15" font-weight="700" fill="${ink}">${tag}</text>`
function giftCardArt(kind, label) {
  const face = gcFace
  const art = {
    egift: `<rect x="96" y="22" width="128" height="210" rx="18" fill="#232F3E"/><rect x="104" y="40" width="112" height="174" rx="6" fill="#F3F3F3"/><rect x="116" y="58" width="72" height="8" rx="4" fill="#D5D9D9"/><g transform="translate(89 55) scale(.44)">${face('#FF9900', '#131921', '#131921', 'eGift Card')}</g><rect x="116" y="188" width="88" height="8" rx="4" fill="#D5D9D9"/><rect x="116" y="200" width="56" height="8" rx="4" fill="#D5D9D9"/><rect x="146" y="28" width="28" height="5" rx="2.5" fill="#37475A"/>`,
    print: `<rect x="70" y="26" width="180" height="210" rx="4" fill="#fff" stroke="#D5D9D9" stroke-width="2"/><g transform="translate(86 52) scale(.62)">${face('#232F3E', '#fff', '#FF9900', 'Print at Home')}</g><rect x="96" y="176" width="128" height="8" rx="4" fill="#E3E6E6"/><rect x="96" y="192" width="92" height="8" rx="4" fill="#E3E6E6"/><path d="M70 214h180" stroke="#D5D9D9" stroke-dasharray="6 5" stroke-width="2"/>`,
    mail: `<rect x="44" y="96" width="232" height="134" rx="6" fill="#F7E7D4"/><path d="M44 102l116 74 116-74" fill="none" stroke="#E2C9AA" stroke-width="3"/><g transform="translate(64 24) scale(.8) rotate(-6 160 127)">${face('#FF9900', '#131921', '#131921', 'Gift Card')}</g><g transform="translate(246 56)"><ellipse cx="-13" cy="0" rx="14" ry="8" fill="#C7202F" transform="rotate(-25 -13 0)"/><ellipse cx="13" cy="0" rx="14" ry="8" fill="#C7202F" transform="rotate(25 13 0)"/><circle r="6" fill="#A3151F"/></g>`,
    reload: `<g transform="translate(0 20)">${face('#067D62', '#fff', '#FFD814', 'Reload Your Balance')}</g><circle cx="244" cy="74" r="26" fill="#FFD814"/><path d="M244 62v24M232 74h24" stroke="#131921" stroke-width="5" stroke-linecap="round"/>`,
  }[kind]
  return `<svg class="azp-gc-art" viewBox="0 0 320 256" role="img" aria-label="${esc(label)}"><rect width="320" height="256" fill="#F7F8F8"/>${art}</svg>`
}
function giftCards(base) {
  const types = [['eGift Cards', 'Delivered by email or text in minutes', 'egift'], ['Print at Home', 'Print a gift card or send it as a PDF', 'print'], ['Gift Cards by Mail', 'Free One-Day Shipping on eligible orders', 'mail'], ['Reload Your Balance', 'Add funds to your own gift card balance', 'reload']]
  return `${crumbs(base, [['Amazon.com', '/'], ['Gift Cards', GIFT_CARDS_PATH]])}<div class="azp-gift"><header class="azp-gift-hero"><div><h1>Gift Cards</h1><p>The gift of choice. Redeemable toward millions of items on Amazon.com. Never expire, no fees.</p></div><svg class="azp-gc-card" viewBox="40 52 240 150" aria-hidden="true">${gcFace('#FF9900', '#131921', '#131921', 'Gift Card')}</svg></header>
  <section><h2>Shop by type</h2><div class="azp-gc-types">${types.map(([t, c, k]) => `<a href="${base}${t === 'Reload Your Balance' ? '/reload-your-balance' : GIFT_CARDS_PATH + '#' + t.toLowerCase().replace(/\W+/g, '-')}" id="${t.toLowerCase().replace(/\W+/g, '-')}">${giftCardArt(k, t)}<b>${esc(t)}</b><span class="az-fine">${esc(c)}</span></a>`).join('')}</div></section>
  <section><h2>Shop by occasion</h2><div class="azp-chips">${['Birthday', 'Thank You', 'Congratulations', 'Holiday', 'Wedding', 'Baby', 'Graduation', 'Just Because'].map(o => `<span class="azp-chip">${o}</span>`).join('')}</div></section>
  <div class="azp-noresults"><h3>Gift card purchases are not available for your account.</h3><p>Gift cards can't be bought, redeemed or applied to orders on your account right now. <a href="${base}/help/payment">Payment methods and charges</a></p></div>
  <section><h2>Gift card help</h2><p>${L(base, '/reload-your-balance', 'Reload Your Balance')} &middot; ${L(base, '/currency-converter', 'Amazon Currency Converter')} &middot; ${L(base, HELP_PATH, 'Customer Service')}</p></section></div>`
}
function registries(base, q) {
  const name = typeof q.name === 'string' ? q.name.trim().slice(0, 80) : ''
  return `${crumbs(base, [['Amazon.com', '/'], ['Registry & Gifting', '/registries']])}<div class="azp-registry"><header class="azp-reg-hero"><h1>Registry &amp; Gifting</h1><p>Create a registry or gift list, or find one for someone special.</p></header>
  <form class="azp-reg-search" method="get" action="${base}/registries"><h2>Find a registry or gift list</h2><label for="reg-name">Search by registrant name</label><input id="reg-name" name="name" type="text" value="${esc(name)}" placeholder="Name"><label for="reg-type">Registry type</label><select id="reg-type" name="type"><option>All registries</option><option>Wedding Registry</option><option>Baby Registry</option><option>Birthday Gift List</option></select><button class="az-btn" type="submit">Search</button></form>
  ${name ? `<div class="azp-noresults" role="status"><h3>No registries found for "${esc(name)}".</h3><p>Check the spelling or try a different registry type.</p></div>` : ''}
  <div class="azp-reg-types">${[['Wedding Registry', 'Free 20% completion discount and a 365-day return window.', 'mug-set-cream'], ['Baby Registry', 'Free Welcome Box and 15% completion discount.', 'crib-wood'], ['Birthday Gift List', 'Share a list of ideas for birthdays.', 'teddy'], ['Custom Gift List', 'Lists for any occasion.', 'board-game']].map(([t, c, k]) => `<section>${photo(k, t)}<h2>${t}</h2><p>${c}</p><a class="az-btn az-btn-outline az-btn-sm" href="${esc(base + signinPath('/registries'))}">Create</a></section>`).join('')}</div></div>`
}
// Pickup points near a ZIP code: Hub Lockers carry one-word names, as on amazon.com.
const LOCKER_NAMES = ['Aurora', 'Basil', 'Cobalt', 'Dune', 'Ember', 'Fable', 'Gizmo', 'Harbor', 'Indigo', 'Juniper', 'Kestrel', 'Lumen', 'Maple', 'Nectar', 'Orbit', 'Pebble', 'Quill', 'Ripple', 'Sable', 'Tundra']
const PICKUP_KINDS = [
  ['Amazon Hub Locker', 'Whole Foods Market', 'Open daily 7:00 AM - 10:00 PM', 'Packages held for 3 days'],
  ['Amazon Hub Locker', 'Apartment building lobby', 'Open 24 hours', 'Packages held for 3 days'],
  ['Amazon Hub Counter', 'Partner store', 'Mon-Sat 9:00 AM - 9:00 PM, Sun 10:00 AM - 7:00 PM', 'Packages held for 14 days'],
  ['Amazon Fresh', 'Amazon Fresh store', 'Open daily 7:00 AM - 10:00 PM', 'Pickup and returns drop-off'],
  ['Amazon Hub Locker', 'Convenience store', 'Open 24 hours', 'Packages held for 3 days'],
  ['Amazon Hub Locker', 'Shopping center', 'Mon-Sat 10:00 AM - 9:00 PM, Sun 11:00 AM - 7:00 PM', 'Packages held for 3 days'],
]
function pickupResults(zip) {
  const n = Number(zip)
  const rows = PICKUP_KINDS.map(([kind, host, hours, hold], i) => {
    const name = kind === 'Amazon Fresh' ? 'Amazon Fresh Pickup' : kind === 'Amazon Hub Counter' ? 'Amazon Hub Counter' : `Amazon Hub Locker - ${LOCKER_NAMES[(n + i * 7) % LOCKER_NAMES.length]}`
    const miles = (0.3 + i * 0.6 + ((n >> i) % 5) / 10).toFixed(1)
    return `<li class="azp-pickup"><div><b>${esc(name)}</b><p class="az-fine">${esc(host)} &middot; ${esc(zip)}</p><p>${esc(hours)}</p><p class="az-fine">${esc(hold)}</p></div><span class="azp-pickup-mi">${miles} mi</span></li>`
  })
  return `<section class="azp-pickups" role="status"><h2>${rows.length} pickup locations near ${esc(zip)}</h2><ol>${rows.join('')}</ol><p class="az-fine">Choose a pickup location as your delivery address at checkout when it is offered for your items.</p></section>`
}
function pickup(base, q) {
  const zip = typeof q.zip === 'string' ? q.zip.trim().slice(0, 10) : ''
  const bad = zip && !/^\d{5}$/.test(zip)
  return `${crumbs(base, [['Amazon.com', '/'], ['Amazon Pickup Locations', '/ulp/view']])}<div class="azp-info"><article><h1>Amazon Pickup Locations</h1><p class="azp-lead">Pick up your packages at an Amazon Hub Locker, Amazon Hub Counter or select stores, at a time that works for you.</p>
  <form class="azp-reg-search" method="get" action="${base}/ulp/view"><label for="ulp-zip">Search by ZIP code</label><input id="ulp-zip" name="zip" inputmode="numeric" value="${esc(zip)}" ${bad ? 'aria-invalid="true"' : ''}><button class="az-btn" type="submit">Search</button>${bad ? '<p class="az-field-error" role="alert">Please enter a valid 5-digit ZIP code.</p>' : ''}</form>
  ${zip && !bad ? pickupResults(zip) : ''}
  ${[['Amazon Hub Locker', 'Self-service kiosks in grocery stores, convenience stores and apartment buildings. Packages are held for 3 days.'], ['Amazon Hub Counter', 'Pick up at a staffed counter in participating retail stores. Packages are held for up to 14 days.'], ['Whole Foods Market and Amazon Fresh stores', 'Pick up eligible orders and drop off returns at select stores.']].map(([h, p]) => `<section><h2>${h}</h2><p>${p}</p></section>`).join('')}</article>
  <aside class="azp-info-side"><h2>Related</h2><p>${L(base, '/hub', 'Become an Amazon Hub Partner')}</p><p>${L(base, helpNode('468520'), 'Shipping Rates and Delivery Estimates')}</p><p>${L(base, '/gp/css/returns/homepage.html', 'Returns & Replacements')}</p></aside></div>`
}

// ---------------------------------------------------------------- routes
export function registerParity(router, { render }) {
  const page = (title, body) => (req, res) => render(req, res, title, body(res.locals.base, req.query, req))
  router.get('/:slug/b', (req, res, next) => {
    const node = String(req.query.node ?? '')
    if (req.params.slug === 'gift-cards' && node === '2238192011') return render(req, res, 'Amazon.com Gift Cards', giftCards(res.locals.base))
    if (req.params.slug === 'computer-video-games-hardware-accessories' || !SUPPORTED_DEPT_NODES.has(node)) return next()
    const dept = node === FASHION.node ? FASHION : departmentByNode(node)
    render(req, res, `Amazon.com: ${dept.label}`, departmentLanding(res.locals.base, req, node))
  })
  router.get('/b', (req, res, next) => {
    const node = String(req.query.node ?? '')
    if (node === '12766669011') return render(req, res, 'Sell on Amazon', infoPage(res.locals.base, '/b?node=12766669011'))
    const hit = subcategoryByNode(node)
    if (!hit) return next()
    render(req, res, `Amazon.com: ${hit.sub.label}`, subcategoryLanding(res.locals.base, req, node))
  })
  router.get(HELP_PATH, (req, res, next) => {
    const path = `${HELP_PATH}?nodeId=${req.query.nodeId}`
    if (!req.query.nodeId || !INFO[path]) return next()
    render(req, res, INFO[path][0], infoPage(res.locals.base, path))
  })
  for (const path of INFO_PATHS.filter(p => !p.includes('?'))) router.get(path, (req, res) => render(req, res, INFO[path][0], infoPage(res.locals.base, path)))
  router.get(SITE_DIRECTORY, page('Amazon.com: All Departments', base => siteDirectory(base)))
  router.get('/sitemap', (req, res) => res.redirect(`${res.locals.base}${SITE_DIRECTORY}`))
  router.get('/sitemap.xml', (req, res) => res.type('application/xml').send(sitemapXml(res.locals.base)))
  router.get('/registries', page('Amazon.com: Registry & Gifting', (base, q) => registries(base, q)))
  router.get('/ulp/view', page('Amazon Pickup Locations', (base, q) => pickup(base, q)))
}
