// Reference-mode shopping for the Williams Sonoma assortment (shelf.js): product
// listing grids with filters, sort and pagination, keyword search, product pages,
// product illustrations, cart, checkout and order confirmation. Orders are recorded
// as kind:'other' lines; nothing here touches GTA 6 listings or their evidence.
// The captured "gta 6" search and every unknown product or cart line fall through
// to the read-only reference router (which answers purchase POSTs with 409).
import { Router } from 'express'
import { esc } from '../../lib/html.js'
import { recordOrder } from '../../lib/orders.js'
import { validateCard } from '../../lib/payment.js'
import { renderProductAsset } from '../../lib/product-asset-art.js'
import { capturedPhrase } from '../reference-retail.js'
import { shelf, shelfById } from './shelf.js'
import { departments, subcategories } from './site-data.js'

export const SHELF_STORE = 'williams-sonoma'
const PAGE_SIZE = 24
const str = v => typeof v === 'string' ? v.trim() : ''
export const usd = n => `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: Number.isInteger(n) && n >= 1000 ? 0 : 2, maximumFractionDigits: 2 })}`
const cents = n => Math.round(n * 100) / 100
const a = (base, path, label, attrs = '') => `<a href="${esc(base + path)}"${attrs}>${esc(label)}</a>`
const crumbs = (base, items) => `<nav class="wsx-crumbs" aria-label="Breadcrumb"><ol>${[['Home', '/'], ...items].map(([label, path], i, all) => `<li>${i === all.length - 1 || !path ? `<span aria-current="page">${esc(label)}</span>` : a(base, path, label)}</li>`).join('')}</ol></nav>`
const deptBySlug = new Map(departments.map(d => [d.slug, d]))
const norm = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[®™]/g, '').toLowerCase().trim()

// ------------------------------------------------------------------ membership
const saleOnly = p => p.was !== null
const brandIs = name => p => norm(p.brand) === norm(name)
const RULES = new Map(Object.entries({
  '/shop/sale-special-offer/offers-all-clad-cookware/': p => saleOnly(p) && p.brand === 'All-Clad',
  '/shop/sale-special-offer/offers-le-creuset-cookware/': p => saleOnly(p) && p.brand === 'Le Creuset',
  '/shop/sale-special-offer/offers-staub-cookware/': p => saleOnly(p) && p.brand === 'Staub',
  '/shop/sale-special-offer/offers-zwilling-cutlery-promo/': p => saleOnly(p) && p.brand === 'Zwilling',
  '/shop/sale-special-offer/offers-shun-promo/': p => saleOnly(p) && p.brand === 'Shun',
  '/shop/sale-special-offer/breville-promo/': p => saleOnly(p) && p.brand === 'Breville',
  '/shop/sale-special-offer/vitamix-promo/': p => saleOnly(p) && p.brand === 'Vitamix',
  '/shop/sale-special-offer/coffee-espresso-event/': p => saleOnly(p) && p.dept === 'electrics' && /espresso|coffee|grinder|frother|kettle/i.test(p.title),
  '/shop/sale-special-offer/premier-cookware/': p => saleOnly(p) && p.dept === 'cookware',
  '/shop/sale-special-offer/premier-cutlery/': p => saleOnly(p) && p.dept === 'cutlery',
  '/shop/sale-special-offer/premier-electrics/': p => saleOnly(p) && p.dept === 'electrics',
  '/shop/sale-special-offer/premier-bakeware/': p => saleOnly(p) && p.dept === 'bakeware',
  '/shop/sale-special-offer/premier-view-all/': saleOnly,
  '/shop/sale-special-offer/free-shipping/': p => p.freeShipping,
  '/shop/sale-special-offer/view-all-sale/': p => p.clearance || (saleOnly(p) && !p.limitedDeal),
  ...Object.fromEntries([['sale-cookware', 'cookware'], ['sale-cooks-tools', 'cooks-tools'], ['sale-cutlery', 'cutlery'], ['sale-electrics', 'electrics'], ['sale-bakeware', 'bakeware'], ['sale-food', 'food'], ['sale-tabletop-bar', 'tabletop-glassware-bar']]
    .map(([key, dept]) => [`/shop/sale-special-offer/${key}/`, p => p.dept === dept && (p.clearance || (saleOnly(p) && !p.limitedDeal))])),
  ...Object.fromEntries([['/shop/cookware/cookware-new/', 'cookware'], ['/shop/cooks-tools/cooks-tools-new/', 'cooks-tools'], ['/shop/cutlery/cutlery-new/', 'cutlery'], ['/shop/electrics/electrics-new/', 'electrics'], ['/shop/bakeware/bakeware-new/', 'bakeware'], ['/shop/food/food-new/', 'food'], ['/shop/tabletop-glassware-bar/tabletop-bar-new-arrivals/', 'tabletop-glassware-bar'], ['/shop/outdoor/outdoor-new/', 'outdoor'], ['/shop/home-new/home-new-furniture/', 'home-furniture']]
    .map(([path, dept]) => [path, p => p.isNew && p.dept === dept])),
}))
// Brand links in each department's menu ("Brands" groups).
for (const d of departments) for (const g of d.groups) if (g.title === 'Brands') for (const [label, path] of g.links) {
  if (/^All /.test(label) || RULES.has(path)) continue
  const goldtouch = /goldtouch/i.test(label)
  RULES.set(path, p => p.dept === d.slug && (goldtouch ? /goldtouch/i.test(p.title) : brandIs(label)(p)))
}

const memo = new Map()
export function productsForPath(path) {
  if (memo.has(path)) return memo.get(path)
  memo.set(path, [])
  const found = new Set(shelf.filter(p => p.subs.includes(path) || RULES.get(path)?.(p)))
  // "All …" links collect every sibling link in their menu group.
  const sub = subcategories.get(path)
  if (sub && /^All /.test(sub.label)) {
    const group = sub.dept.groups.find(g => g.title === sub.group)
    for (const [label, sibling] of group?.links || []) if (sibling !== path && !/^All /.test(label) && sibling.startsWith('/shop/')) for (const p of productsForPath(sibling)) found.add(p)
  }
  const list = [...found].sort((x, y) => x.order - y.order)
  memo.set(path, list)
  return list
}
export function productsForDepartment(dept) {
  const found = new Set(dept.slug === 'new' ? shelf.filter(p => p.isNew) : dept.slug === 'sale-special-offer' ? shelf.filter(saleOnly) : shelf.filter(p => p.dept === dept.slug))
  for (const g of dept.groups) for (const [, path] of g.links) if (path.startsWith('/shop/')) for (const p of productsForPath(path)) found.add(p)
  return [...found].sort((x, y) => x.order - y.order)
}

// ------------------------------------------------------------------ cards
export const imageUrl = (base, p, view = 0, color = '') => `${base}/product-images/${encodeURIComponent(p.id)}/${view}.svg${color ? `?color=${encodeURIComponent(color)}` : ''}`
const stars = (rating, reviews) => `<span class="wss-stars" role="img" aria-label="${rating} out of 5 stars, ${reviews} reviews"><span class="wss-stars-fill" style="width:${Math.round(rating / 5 * 100)}%">★★★★★</span><span class="wss-stars-empty">★★★★★</span></span> <span class="wss-review-count">(${reviews.toLocaleString('en-US')})</span>`
const priceRange = list => { const lo = Math.min(...list), hi = Math.max(...list); return lo === hi ? usd(lo) : `${usd(lo)} – ${usd(hi)}` }
export function priceBlock(p, size = null) {
  const sizes = size ? [size] : p.sizes
  const now = priceRange(sizes.map(s => s.price))
  if (!p.was) return `<p class="wsx-price">${now}</p>`
  const label = p.limitedDeal ? 'LIMITED TIME DEAL!' : p.clearance ? 'Clearance' : 'Sale'
  return `<p class="wsx-sale-label">${label}</p><p class="wsx-price wsx-price-sale"><span class="wss-now">${now}</span> <span class="wss-sugg">Sugg. Price <s>${priceRange(sizes.map(s => s.was))}</s></span></p>`
}
const badgeOf = p => p.isNew ? 'New' : p.exclusive ? 'Exclusive' : p.bestSeller ? 'Best Seller' : ''
export function shelfCard(base, p, index = 0) {
  return `<article class="wsx-card wss-card" data-product-id="${esc(p.id)}" data-item-number="${esc(p.item)}" data-product-kind="other"><a class="wsx-card-art" href="${esc(base + p.path)}"><img src="${esc(imageUrl(base, p, 0, p.colors[0] || ''))}" alt="${esc(p.title)}" width="400" height="400"${index > 3 ? ' loading="lazy"' : ''}>${badgeOf(p) ? `<span>${esc(badgeOf(p))}</span>` : ''}</a>${p.colors.length > 1 ? `<p class="wss-swatch-count">${p.colors.length} Colors</p>` : ''}<h3><a href="${esc(base + p.path)}">${esc(p.title)}</a></h3>${priceBlock(p)}<p class="wss-rating">${stars(p.rating, p.reviews)}</p>${p.freeShipping ? '<p class="wsx-ship">Free Shipping</p>' : ''}</article>`
}

// ------------------------------------------------------------------ listing (filters, sort, pages)
const PRICE_BANDS = [['0-25', 'Under $25', 0, 25], ['25-50', '$25 – $50', 25, 50], ['50-100', '$50 – $100', 50, 100], ['100-250', '$100 – $250', 100, 250], ['250-500', '$250 – $500', 250, 500], ['500-1000', '$500 – $1,000', 500, 1000], ['1000-up', '$1,000 & Above', 1000, Infinity]]
const SORTS = [['', 'Best Match'], ['best-sellers', 'Best Sellers'], ['price-asc', 'Price: Low to High'], ['price-desc', 'Price: High to Low'], ['rating', 'Customer Rating'], ['new', 'New Arrivals']]
export function listing(base, path, all, query, { extraParams = {}, relevance = null } = {}) {
  const brands = [...new Set(all.map(p => p.brand))].sort((x, y) => x.localeCompare(y))
  const brand = brands.includes(str(query.brand)) ? str(query.brand) : ''
  const band = PRICE_BANDS.find(b => b[0] === str(query.price))
  const minRating = ['4', '3'].includes(str(query.rating)) ? Number(query.rating) : 0
  const flags = { freeShipping: str(query.free_shipping) === '1', exclusive: str(query.exclusive) === '1', sale: str(query.sale) === '1' }
  let products = all.filter(p => (!brand || p.brand === brand) && (!band || (p.price >= band[2] && p.price < band[3])) && p.rating >= minRating
    && (!flags.freeShipping || p.freeShipping) && (!flags.exclusive || p.exclusive) && (!flags.sale || p.was))
  const sort = SORTS.some(([v]) => v === str(query.sort)) ? str(query.sort) : ''
  if (sort === 'price-asc') products = products.toSorted((x, y) => x.price - y.price || x.order - y.order)
  if (sort === 'price-desc') products = products.toSorted((x, y) => y.price - x.price || x.order - y.order)
  if (sort === 'rating') products = products.toSorted((x, y) => y.rating - x.rating || y.reviews - x.reviews)
  if (sort === 'best-sellers') products = products.toSorted((x, y) => Number(y.bestSeller) - Number(x.bestSeller) || y.reviews - x.reviews)
  if (sort === 'new') products = products.toSorted((x, y) => Number(y.isNew) - Number(x.isNew) || x.order - y.order)
  if (!sort && relevance) products = products.toSorted((x, y) => relevance(y) - relevance(x) || x.order - y.order)
  const pages = Math.max(1, Math.ceil(products.length / PAGE_SIZE))
  const page = Math.min(pages, Math.max(1, Number.parseInt(str(query.page), 10) || 1))
  const shown = products.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const state = { ...extraParams, brand, price: band?.[0] || '', rating: minRating ? String(minRating) : '', free_shipping: flags.freeShipping ? '1' : '', exclusive: flags.exclusive ? '1' : '', sale: flags.sale ? '1' : '', sort }
  const href = changes => { const params = new URLSearchParams(Object.entries({ ...state, ...changes }).filter(([, v]) => v)); return esc(`${base}${path}${params.size ? '?' + params : ''}`) }
  const select = (id, name, label, options, value) => `<div class="wsx-filter"><label for="${id}">${label}</label><select id="${id}" name="${name}">${options.map(([v, l]) => `<option value="${esc(v)}"${v === value ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select></div>`
  const check = (name, label) => `<label class="wss-check"><input type="checkbox" name="${name}" value="1"${state[name] ? ' checked' : ''}> ${label}</label>`
  const hidden = Object.entries(extraParams).map(([k, v]) => `<input type="hidden" name="${esc(k)}" value="${esc(v)}">`).join('')
  const chips = [brand && ['brand', brand], band && ['price', band[1]], minRating && ['rating', `${minRating} Stars & Up`], flags.freeShipping && ['free_shipping', 'Free Shipping'], flags.exclusive && ['exclusive', 'Williams Sonoma Exclusives'], flags.sale && ['sale', 'On Sale']].filter(Boolean)
  const toolbar = `<form class="wsx-toolbar wss-toolbar" method="get" action="${esc(base + path)}" data-shelf-filters>${hidden}${select('wss-brand', 'brand', 'Brand', [['', 'All Brands'], ...brands.map(b => [b, b])], brand)}${select('wss-price', 'price', 'Price', [['', 'Any Price'], ...PRICE_BANDS.map(b => [b[0], b[1]])], band?.[0] || '')}${select('wss-rating', 'rating', 'Customer Rating', [['', 'Any Rating'], ['4', '4 Stars & Up'], ['3', '3 Stars & Up']], state.rating)}<div class="wss-checks">${check('free_shipping', 'Free Shipping')}${check('exclusive', 'Exclusives')}${check('sale', 'On Sale')}</div>${select('wss-sort', 'sort', 'Sort By', SORTS, sort)}<button type="submit">Apply</button></form>`
  const chipBar = chips.length ? `<p class="wss-chips">${chips.map(([key, label]) => `<a href="${href({ [key]: '', page: '' })}" aria-label="Remove filter ${esc(label)}">${esc(label)} ×</a>`).join('')} <a href="${href({ brand: '', price: '', rating: '', free_shipping: '', exclusive: '', sale: '', page: '' })}">Clear All</a></p>` : ''
  const pager = pages > 1 ? `<nav class="wss-pager" aria-label="Pages">${page > 1 ? `<a href="${href({ page: String(page - 1) })}" rel="prev">‹ Previous</a>` : ''}${Array.from({ length: pages }, (_, i) => i + 1).map(n => n === page ? `<span aria-current="page">${n}</span>` : `<a href="${href({ page: String(n) })}">${n}</a>`).join('')}${page < pages ? `<a href="${href({ page: String(page + 1) })}" rel="next">Next ›</a>` : ''}</nav>` : ''
  const grid = shown.length ? `<div class="wsx-grid" data-reference-state="catalog" data-result-count="${products.length}">${shown.map((p, i) => shelfCard(base, p, i)).join('')}</div>` : ''
  return { count: products.length, page, pages, toolbar, chipBar, grid, pager, html: `${toolbar}${chipBar}${grid}${pager}` }
}

// ------------------------------------------------------------------ search
const stem = w => w.replace(/knives$/, 'knife').replace(/(ches|shes|sses|xes)$/, m => m.slice(0, -2)).replace(/ies$/, 'y').replace(/([^s])s$/, '$1')
const words = s => norm(s).replace(/[^a-z0-9]+/g, ' ').split(' ').filter(Boolean).map(stem)
const SYNONYMS = { pot: ['pot', 'stockpot', 'multipot', 'dutch', 'cocotte', 'saucepan'], pan: ['pan', 'skillet', 'saucepan', 'saucier', 'griddle'], knife: ['knife', 'cleaver', 'nakiri', 'santoku'], cocotte: ['cocotte', 'dutch'], mixer: ['mixer'], coffee: ['coffee', 'espresso', 'coffeemaker', 'latte'], espresso: ['espresso'], plate: ['plate', 'platter'], glass: ['glass', 'glassware', 'tumbler', 'goblet'], towel: ['towel'], kettle: ['kettle'] }
const haystack = new Map(shelf.map(p => [p.id, { title: words(p.title), brand: words(p.brand), extra: words(`${p.type} ${deptBySlug.get(p.dept)?.label || ''} ${p.colors.join(' ')} ${p.item} ${p.sizes.map(s => s.sku).join(' ')}`) }]))
const tokenHits = (list, token) => list.some(w => w === token || (token.length >= 4 && w.startsWith(token)))
export function searchShelf(query) {
  const tokens = words(query).filter(t => !['the', 'and', 'for', 'with', 'of', 'a'].includes(t))
  if (!tokens.length) return { results: [], score: () => 0 }
  const scores = new Map()
  for (const p of shelf) {
    const h = haystack.get(p.id)
    let score = 0
    for (const t of tokens) {
      const options = SYNONYMS[t] || [t]
      const s = options.some(o => tokenHits(h.title, o)) ? (tokenHits(h.title, t) ? 4 : 2) : options.some(o => tokenHits(h.brand, o)) ? 3 : options.some(o => tokenHits(h.extra, o)) ? 1 : 0
      if (!s) { score = 0; break }
      score += s
    }
    if (score) scores.set(p.id, score + (norm(p.title).includes(norm(query)) ? 5 : 0) + Math.min(p.reviews, 5000) / 5000)
  }
  return { results: shelf.filter(p => scores.has(p.id)), score: p => scores.get(p.id) || 0 }
}

// ------------------------------------------------------------------ cart helpers
export const cartOf = store => Array.isArray(store?.wsCart) ? store.wsCart : []
export const cartCount = store => cartOf(store).reduce((n, line) => n + (Number.isInteger(line.qty) ? line.qty : 0), 0)
function resolveLine(line) {
  const p = shelfById.get(line.id)
  const size = p?.sizes.find(s => s.sku === line.sku)
  if (!p || !size || (line.color && !p.colors.includes(line.color))) return null
  return { ...line, product: p, size, total: cents(size.price * line.qty) }
}
const lines = store => cartOf(store).map(resolveLine).filter(Boolean)
const STATE_TAX = { CA: 0.0825, NY: 0.08875, TX: 0.0825, WA: 0.101, IL: 0.1025, FL: 0.07, MA: 0.0625, NJ: 0.06625, PA: 0.06, OR: 0, NH: 0, DE: 0, MT: 0, AK: 0 }
export const SHIPPING = [
  ['standard', 'Standard Delivery', '5 – 7 business days', 0],
  ['express', 'Express Delivery', '2 – 3 business days', 24.95],
  ['premium', 'Premium Delivery', '1 – 2 business days', 39.95],
]
const STATES = 'AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY'.split(' ')
function totals(items, method = 'standard', state = '') {
  const subtotal = cents(items.reduce((n, l) => n + l.total, 0))
  const baseShipping = items.every(l => l.product.freeShipping) ? 0 : subtotal >= 1000 ? 49.95 : subtotal >= 250 ? 29.95 : subtotal >= 75 ? 19.95 : 12.95
  const option = SHIPPING.find(s => s[0] === method) || SHIPPING[0]
  const shipping = cents(baseShipping + option[3])
  const rate = state ? (STATE_TAX[state] ?? 0.07) : null
  const tax = rate === null ? null : cents((subtotal + shipping) * rate)
  return { subtotal, shipping, tax, total: cents(subtotal + shipping + (tax || 0)) }
}

// ------------------------------------------------------------------ pages
function productPage(base, p, query, notice = '') {
  const size = p.sizes.find(s => s.sku === str(query.sku)) || p.sizes[0]
  const color = p.colors.includes(str(query.color)) ? str(query.color) : p.colors[0] || ''
  const dept = deptBySlug.get(p.dept), sub = subcategories.get(p.primary)
  const gallery = `<div class="wss-gallery" data-product-gallery><div class="wss-gallery-main"><img src="${esc(imageUrl(base, p, 0, color))}" alt="${esc(p.title)}${color ? ` in ${esc(color)}` : ''}" width="640" height="640"></div><div class="wss-thumbs">${[0, 1, 2].map(v => `<a href="${esc(imageUrl(base, p, v, color))}" aria-label="View image ${v + 1} of 3"><img src="${esc(imageUrl(base, p, v, color))}" alt="" width="96" height="96" loading="lazy"></a>`).join('')}</div></div>`
  const sizePicker = p.sizes.length > 1 || p.sizes[0].label ? `<fieldset class="wss-options"><legend>Size: <strong>${esc(size.label || 'One Size')}</strong></legend>${p.sizes.map(s => `<label class="wss-option"><input type="radio" name="sku" value="${esc(s.sku)}"${s === size ? ' checked' : ''} required> <span>${esc(s.label || 'One Size')}</span> <small>${usd(s.price)}</small></label>`).join('')}</fieldset>` : `<input type="hidden" name="sku" value="${esc(size.sku)}">`
  const colorPicker = p.colors.length ? `<fieldset class="wss-options wss-colors"><legend>Color: <strong>${esc(color)}</strong></legend>${p.colors.map(c => `<label class="wss-option"><input type="radio" name="color" value="${esc(c)}"${c === color ? ' checked' : ''} required> <span>${esc(c)}</span></label>`).join('')}</fieldset>` : ''
  const related = productsForPath(p.primary).filter(x => x.id !== p.id).slice(0, 4)
  const specs = [['Item #', size.sku], ['Brand', p.brand], ['Category', sub?.label || p.type], ...(p.sizes[0].label ? [['Sizes', p.sizes.map(s => s.label).join(', ')]] : []), ...(p.colors.length ? [['Colors', p.colors.join(', ')]] : []), ['Shipping', p.freeShipping ? 'Free Standard Shipping' : 'Standard shipping rates apply'], ['Returns', 'Returnable within 30 days of delivery']]
  const dist = [5, 4, 3, 2, 1].map(n => { const share = n === 5 ? Math.max(0.4, (p.rating - 3.6) / 1.4) : n === 4 ? 0.18 : n === 3 ? 0.06 : n === 2 ? 0.03 : 0.02; return [n, Math.round(p.reviews * share)] })
  return `${crumbs(base, [[dept?.label || 'Shop', dept?.path], ...(sub ? [[sub.label, sub.path]] : []), [p.title]])}
<div class="wss-pdp" data-product-id="${esc(p.id)}" data-product-kind="other">${gallery}<div class="wss-buy">
${p.isNew || p.exclusive ? `<p class="wsx-eyebrow">${[p.isNew && 'New', p.exclusive && 'Only at Williams Sonoma'].filter(Boolean).join(' · ')}</p>` : ''}<h1>${esc(p.title)}</h1>
<p class="wss-rating">${stars(p.rating, p.reviews)} <a href="#reviews">Read Reviews</a></p>
${priceBlock(p)}${p.freeShipping ? '<p class="wsx-ship">Free Shipping</p>' : ''}
${notice}
<form class="wss-add" method="post" action="${esc(base)}/cart/add" data-add-to-cart><input type="hidden" name="id" value="${esc(p.id)}">${sizePicker}${colorPicker}<div class="wss-qty"><label for="wss-qty">Quantity</label><select id="wss-qty" name="qty">${Array.from({ length: 10 }, (_, i) => `<option${i === 0 ? ' selected' : ''}>${i + 1}</option>`).join('')}</select></div><button type="submit" class="wsx-btn wss-add-btn">Add to Cart</button></form>
<p class="wss-secondary">${a(base, '/registry/', 'Add to Registry', ' class="wsx-btn wsx-btn-light"')} ${a(base, '/favorites/', '♡ Add to Favorites', ' class="wsx-btn wsx-btn-light"')}</p>
<section class="wss-fulfil" aria-label="Delivery options"><div><strong>Ship to Home</strong><span>${p.freeShipping ? 'FREE Standard Shipping. ' : ''}Usually ships within 1 – 3 business days.</span></div><div><strong>Pick Up in Store</strong><span>${a(base, '/stores/', 'Check availability at a store near you')}</span></div></section>
<p class="wss-item">Item # ${esc(size.sku)}</p></div></div>
<section class="wss-details"><h2>Details</h2><p>${esc(p.about)}</p><ul>${[p.exclusive ? 'Only at Williams Sonoma.' : `From ${p.brand}.`, p.sizes.length > 1 ? `Available in ${p.sizes.length} sizes.` : '', p.colors.length > 1 ? `Available in ${p.colors.length} colors.` : ''].filter(Boolean).map(t => `<li>${esc(t)}</li>`).join('')}</ul>
<h2>Specifications</h2><dl class="wss-specs">${specs.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl></section>
<section class="wss-reviews" id="reviews"><h2>Customer Reviews</h2><div class="wss-review-summary"><p class="wss-review-score"><strong>${p.rating.toFixed(1)}</strong> out of 5</p><p>${stars(p.rating, p.reviews)}</p><p>${Math.round(Math.min(98, p.rating * 20))}% of reviewers recommend this product</p></div><ul class="wss-dist">${dist.map(([n, c]) => `<li><span>${n} ★</span><span class="wss-bar"><span style="width:${p.reviews ? Math.min(100, Math.round(c / p.reviews * 100)) : 0}%"></span></span><span>${c.toLocaleString('en-US')}</span></li>`).join('')}</ul></section>
${related.length ? `<section class="wsx-section"><h2 class="wsx-section-title">You May Also Like</h2><div class="wsx-grid">${related.map((x, i) => shelfCard(base, x, i + 4)).join('')}</div></section>` : ''}`
}

const summary = (t, { estimate = false, taxNote = 'Calculated at checkout' } = {}) => `<dl class="wss-summary"><dt>Subtotal</dt><dd data-subtotal>${usd(t.subtotal)}</dd><dt>${estimate ? 'Estimated Shipping' : 'Shipping'}</dt><dd>${t.shipping ? usd(t.shipping) : 'FREE'}</dd><dt>${estimate ? 'Estimated Tax' : 'Tax'}</dt><dd>${t.tax === null ? taxNote : usd(t.tax)}</dd><dt class="wss-total">${estimate ? 'Estimated Total' : 'Order Total'}</dt><dd class="wss-total" data-order-total>${usd(t.total)}</dd></dl>`
const lineInfo = (base, l) => `<a href="${esc(base + l.product.path)}">${esc(l.product.title)}</a><span class="wss-line-meta">Item # ${esc(l.size.sku)}${l.size.label ? ` · Size: ${esc(l.size.label)}` : ''}${l.color ? ` · Color: ${esc(l.color)}` : ''}</span>`

function cartPage(base, store, notice = '') {
  const items = lines(store)
  if (!items.length) return `${crumbs(base, [['Cart', '/cart/']])}<div class="wsx-cart" data-cart-count="0"><h1>Your cart is empty.</h1>${notice}${store.user ? '' : '<p>Already have an account? Sign in to pick up where you left off.</p>'}<p>${a(base, '/', 'Start Shopping', ' class="wsx-btn"')}${store.user ? '' : ` ${a(base, '/account/login.html', 'Sign In', ' class="wsx-btn wsx-btn-light"')}`}</p></div>`
  const t = totals(items)
  return `${crumbs(base, [['Cart', '/cart/']])}<div class="wss-cart" data-cart-count="${cartCount(store)}"><div><h1>Shopping Cart <span>(${cartCount(store)} ${cartCount(store) === 1 ? 'item' : 'items'})</span></h1>${notice}
<ul class="wss-lines">${items.map((l, i) => `<li class="wss-line" data-cart-line="${esc(l.product.id)}"><img src="${esc(imageUrl(base, l.product, 0, l.color))}" alt="" width="120" height="120"><div class="wss-line-info">${lineInfo(base, l)}${l.product.freeShipping ? '<span class="wsx-ship">Free Shipping</span>' : ''}<span>${usd(l.size.price)} each</span></div><form method="post" action="${esc(base)}/cart/update" class="wss-line-form"><input type="hidden" name="line" value="${i}"><label for="qty-${i}">Qty</label><select id="qty-${i}" name="qty">${Array.from({ length: Math.max(10, l.qty) }, (_, n) => `<option${n + 1 === l.qty ? ' selected' : ''}>${n + 1}</option>`).join('')}</select><button type="submit" name="action" value="update">Update</button><button type="submit" name="action" value="remove" class="wss-link">Remove</button></form><strong class="wss-line-total">${usd(l.total)}</strong></li>`).join('')}</ul></div>
<aside class="wss-order-summary"><h2>Order Summary</h2>${summary(t, { estimate: true })}<a class="wsx-btn wss-checkout-btn" href="${esc(base)}/checkout/">Checkout</a><p class="wsx-note">Free shipping applies to eligible cookware, electrics and cutlery. Tax is calculated from your shipping address.</p></aside></div>`
}

const field = (id, label, name, value = '', type = 'text', extra = '') => `<div class="wsx-field"><label for="${id}">${label}</label><input id="${id}" name="${name}" type="${type}" value="${esc(value)}"${extra}></div>`
function checkoutPage(base, store, values = {}, errors = []) {
  const items = lines(store)
  const method = SHIPPING.some(s => s[0] === values.shipping_method) ? values.shipping_method : 'standard'
  const t = totals(items, method, STATES.includes(values.state) ? values.state : '')
  const user = store.user || {}
  const v = { email: user.email || '', first_name: user.first_name || '', last_name: user.last_name || '', ...values }
  return `${crumbs(base, [['Cart', '/cart/'], ['Checkout']])}<div class="wss-cart wss-checkout"><form method="post" action="${esc(base)}/checkout/" class="wsx-form" data-checkout-form><h1>Checkout</h1><p class="wss-secure"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="1"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>Secure Checkout</p>${errors.length ? `<div class="wsx-alert wsx-alert-error" role="alert"><p>Please correct the following:</p><ul>${errors.map(e => `<li>${esc(e)}</li>`).join('')}</ul></div>` : ''}
<fieldset><legend>1. Contact Information</legend>${field('co-email', 'Email Address', 'email', v.email, 'email', ' autocomplete="email" required')}${field('co-phone', 'Phone Number', 'phone', v.phone, 'tel', ' autocomplete="tel"')}</fieldset>
<fieldset><legend>2. Shipping Address</legend><div class="wss-two">${field('co-first', 'First Name', 'first_name', v.first_name, 'text', ' autocomplete="given-name" required')}${field('co-last', 'Last Name', 'last_name', v.last_name, 'text', ' autocomplete="family-name" required')}</div>${field('co-address', 'Street Address', 'address', v.address, 'text', ' autocomplete="address-line1" required')}${field('co-address2', 'Apt, Suite, etc. (Optional)', 'address2', v.address2, 'text', ' autocomplete="address-line2"')}<div class="wss-three">${field('co-city', 'City', 'city', v.city, 'text', ' autocomplete="address-level2" required')}<div class="wsx-field"><label for="co-state">State</label><select id="co-state" name="state" autocomplete="address-level1" required><option value="">Select</option>${STATES.map(s => `<option${s === v.state ? ' selected' : ''}>${s}</option>`).join('')}</select></div>${field('co-zip', 'ZIP Code', 'postal_code', v.postal_code, 'text', ' autocomplete="postal-code" inputmode="numeric" required')}</div></fieldset>
<fieldset><legend>3. Delivery Method</legend>${SHIPPING.map(([id, label, eta, fee]) => `<label class="wsx-radio wss-ship-option"><input type="radio" name="shipping_method" value="${id}"${id === method ? ' checked' : ''}> <strong>${label}</strong> <span>${eta}</span> <span>${fee ? `+${usd(fee)}` : (items.every(l => l.product.freeShipping) ? 'FREE' : 'Standard rate')}</span></label>`).join('')}</fieldset>
<fieldset><legend>4. Payment</legend><p class="wss-cards" aria-label="Accepted cards"><span>VISA</span><span>MASTERCARD</span><span>AMEX</span><span>DISCOVER</span><span>WILLIAMS SONOMA CARD</span></p>${field('co-card-name', 'Name on Card', 'card_name', v.card_name, 'text', ' autocomplete="cc-name" required')}${field('co-card-number', 'Card Number', 'card_number', '', 'text', ' autocomplete="cc-number" inputmode="numeric" required')}<div class="wss-two">${field('co-card-expiry', 'Expiration (MM/YY)', 'card_expiry', v.card_expiry, 'text', ' autocomplete="cc-exp" placeholder="MM/YY" required')}${field('co-card-cvv', 'Security Code', 'card_cvv', '', 'text', ' autocomplete="cc-csc" inputmode="numeric" required')}</div><p class="wsx-note">Billing address is the same as the shipping address.</p></fieldset>
<button type="submit" class="wsx-btn wss-place-order">Place Order</button></form>
<aside class="wss-order-summary"><h2>Order Summary</h2><ul class="wss-mini-lines">${items.map(l => `<li><img src="${esc(imageUrl(base, l.product, 0, l.color))}" alt="" width="64" height="64"><div>${lineInfo(base, l)}<span>Qty ${l.qty} · ${usd(l.total)}</span></div></li>`).join('')}</ul>${summary(t, { estimate: true, taxNote: 'TBD' })}<p>${a(base, '/cart/', 'Edit Cart')}</p></aside></div>`
}

function confirmationPage(base, order) {
  const addr = order.shipping_address
  return `${crumbs(base, [['Order Confirmation']])}<div class="wsx-info wss-confirm" data-order-number="${esc(order.order_number)}"><article><p class="wsx-eyebrow">Thank you for your order</p><h1>Your order has been placed.</h1><p class="wsx-lead">Order Number: <strong>${esc(order.order_number)}</strong></p><p>A confirmation email will be sent to ${esc(order.customer.email)}.</p>
<section class="wsx-info-section"><h2>Items</h2><ul class="wss-mini-lines">${order.items.map(it => `<li><div><strong>${esc(it.title)}</strong><span>Item # ${esc(it.sku)} · Qty ${it.qty} · ${usd(it.unit_price)} each</span></div></li>`).join('')}</ul></section>
<section class="wsx-info-section"><h2>Shipping To</h2><p>${esc(`${order.customer.first_name} ${order.customer.last_name}`)}<br>${esc(addr.line1)}${addr.line2 ? `<br>${esc(addr.line2)}` : ''}<br>${esc(`${addr.city}, ${addr.state} ${addr.postal_code}`)}</p><p>${esc(order.fulfillment.option)} · ${esc(order.fulfillment.eta)}</p></section>
<section class="wsx-info-section"><h2>Payment</h2><p>${esc(order.payment.brand)} ending in ${esc(order.payment.last4)}</p>${summary(order.totals)}</section>
<p>${a(base, '/', 'Continue Shopping', ' class="wsx-btn"')}</p></article></div>`
}

// ------------------------------------------------------------------ router
export function installShelf({ render }) {
  const router = Router()
  // Malformed (repeated) query fields go to the reference router's 400 handler.
  router.use((req, res, next) => Object.values(req.query).some(v => typeof v !== 'string') ? next('router') : next())

  const artCache = new Map()
  const SWATCH = { Flame: '#e0592a', Cerise: '#a3232e', Marseille: '#2f5f9f', Sage: '#9fae93', Oyster: '#c9c3b8', White: '#f1efe9', Shallot: '#cfa79b', Nectar: '#e5a23d', Artichaut: '#7f8d5b', Indigo: '#2e3b5e', 'Graphite Grey': '#4b4e51', 'Black Matte': '#272727', Cherry: '#8d1c24', 'Dark Blue': '#25355b', 'White Truffle': '#e5dfd4', Basil: '#506c40', 'Burnt Orange': '#c55b1d', 'Empire Red': '#b21c1c', 'Onyx Black': '#202020', Pistachio: '#c3d2a0', 'Ice Blue': '#bcd6e0', 'Matte Black': '#2a2a2a', 'Contour Silver': '#b9bcbf', 'Blue Velvet': '#2c3e66', Hibiscus: '#c2456d', 'Twilight Blue': '#3b4f7a', 'Pastel Green': '#a8d5b5', Cream: '#efe6cf', Black: '#232323', Red: '#c0292e', 'Pastel Blue': '#a9cbe0', 'Brushed Stainless Steel': '#b9bdc0', 'Stainless Steel': '#b9bdc0', 'Brushed Stainless': '#b9bdc0', 'Black Stainless': '#3a3a3a', Graphite: '#4b4e51', 'Black Truffle': '#2c2927', 'Sea Salt': '#dad7cf', 'Light Grey': '#bfc2c3', 'Cherry Red': '#9d1f2a', Espresso: '#4a3527', 'Venetian Blue': '#2b5a8a', Gold: '#c9a45a', Copper: '#b87333', Natural: '#c9ab80', Chocolate: '#5a3b2a', Flour: '#ece6d8', Burgundy: '#6e1f2b', 'Blue Flame': '#2d4f86', Charcoal: '#3a3a3a', Navy: '#24375a', Flax: '#c8b593', Rust: '#a8522d', 'White Marble': '#ecebe7', Ivory: '#efe9dc', Oatmeal: '#cdbfa6', 'Natural Oak': '#c19a6b', Saddle: '#8b5a2b', Brass: '#b5964d', Silver: '#c0c4c7', 'Studio White': '#f1f1ee', Teal: '#2a8a8a', Beige: '#d9cbb3', Tan: '#c8ad84', Seafoam: '#9fd3c7', 'Rose Quartz': '#e3b9bd', Fog: '#c9cdd0', Bone: '#e8e0cf', Olive: '#6b6e3f', 'Ebonized Oak': '#2b2723', Green: '#4f7a4a', Yellow: '#e2c044', Blue: '#2f5f9f', Chrome: '#c4c8cb' }
  const materialTone = p => /copper/i.test(p.title) ? '#b87333' : /olivewood|walnut|maple|acacia|wood|rattan|bamboo|oak/i.test(p.title) ? '#a57c52' : /nonstick|hard anodized|carbon steel|cast iron skillet|seasoned/i.test(p.title) ? '#33363a' : /stainless|steel|aluminum|aluminized|goldtouch/i.test(p.title) ? (/goldtouch/i.test(p.title) ? '#c9a45a' : '#b9c0c5') : /porcelain|stoneware|dinnerware|plates|bowls|mugs/i.test(p.title) ? '#f0eee8' : /glass|tritan|decanter/i.test(p.title) ? '#cfe0e6' : /linen|towel|napkin|apron|mitt|tablecloth|runner/i.test(p.title) ? '#d8cdb8' : null
  router.get('/product-images/:id/:view.svg', (req, res, next) => {
    const p = shelfById.get(req.params.id)
    if (!p || !/^[0-2]$/.test(req.params.view)) return next()
    const color = p.colors.includes(str(req.query.color)) ? str(req.query.color) : p.colors[0] || ''
    const key = `${p.id}:${color}:${req.params.view}`
    let svg = artCache.get(key)
    if (!svg) {
      const descriptor = { store: SHELF_STORE, id: p.id, title: p.title, category: p.art.category, brand: p.brand, type: 'other', assetKey: `${p.id}:${color}`, specs: {}, sourceArt: {},
        raw: { title: p.title, category: p.art.category, type: p.art.type, brand: p.brand, ...((SWATCH[color] || materialTone(p)) ? { colorName: SWATCH[color] || materialTone(p) } : {}) } }
      // Some illustration families have fewer distinct faces; fall back to the main view.
      try { svg = renderProductAsset(descriptor, Number(req.params.view)) } catch { svg = renderProductAsset(descriptor, 0) }
      if (artCache.size > 1500) artCache.delete(artCache.keys().next().value)
      artCache.set(key, svg)
    }
    res.set('Cache-Control', 'public, max-age=3600').type('image/svg+xml').send(svg)
  })

  router.get('/products/:id', (req, res, next) => {
    const p = shelfById.get(req.params.id)
    if (!p) return next()
    render(req, res, p.title, productPage(res.locals.base, p, req.query))
  })

  router.get(['/search/results.html', '/search'], (req, res, next) => {
    const raw = typeof req.query.words === 'string' ? req.query.words : typeof req.query.q === 'string' ? req.query.q : ''
    // The live "gta 6" search was captured; that exact result page stays as recorded.
    if (capturedPhrase(raw)) return next()
    const base = res.locals.base, query = raw.trim().replace(/\s+/g, ' ').slice(0, 120)
    if (!query) return render(req, res, 'Search', `${crumbs(base, [['Search']])}<div class="wsx-empty"><h1>What can we help you find?</h1><p>Enter a product, brand or item number in the search box above.</p><p>${a(base, '/shop/new/', 'Shop New Arrivals', ' class="wsx-btn"')}</p></div>`)
    const exact = shelf.find(p => p.sizes.some(s => s.sku === query))
    if (exact) return res.redirect(`${base}${exact.path}?sku=${exact.sizes.find(s => s.sku === query).sku}`)
    const { results, score } = searchShelf(query)
    const list = listing(base, '/search/results.html', results, req.query, { extraParams: { words: query }, relevance: score })
    const body = results.length
      ? `<header class="wsx-plp-head wss-search-head"><h1>${list.count} ${list.count === 1 ? 'result' : 'results'} for <strong>“${esc(query)}”</strong></h1></header>${list.html}`
      : `<div class="wsx-empty wss-no-results" data-result-count="0"><h1>We couldn’t find a match for “${esc(query)}”.</h1><p>Check the spelling, try a more general term, or browse our departments.</p><ul class="wss-dept-links">${departments.filter(d => !d.hidden && d.path.startsWith('/shop/') && !['new', 'sale-special-offer', 'holidays', 'gifts'].includes(d.slug)).map(d => `<li>${a(base, d.path, d.label)}</li>`).join('')}</ul></div>`
    render(req, res, `Search results for ${query}`, `${crumbs(base, [[`Search: ${query}`]])}<section class="wss-search" data-search-query="${esc(query)}">${body}</section>`)
  })

  const cartBody = (req, res, notice, status = 200) => render(req, res, 'Shopping Cart', cartPage(res.locals.base, req.store, notice), status)
  router.get('/cart/', (req, res, next) => cartOf(req.store).length ? cartBody(req, res) : next())

  router.post('/cart/add', (req, res, next) => {
    const body = req.body || {}, id = str(body.id ?? body.pid), p = shelfById.get(id)
    if (!p) return next()
    const size = p.sizes.find(s => s.sku === str(body.sku)) || (p.sizes.length === 1 ? p.sizes[0] : null)
    const color = p.colors.length ? (p.colors.includes(str(body.color)) ? str(body.color) : p.colors.length === 1 ? p.colors[0] : null) : ''
    const qty = Number.parseInt(str(String(body.qty ?? '1')), 10)
    const problem = !size ? 'Please select a size.' : color === null ? 'Please select a color.' : !(qty >= 1 && qty <= 10) ? 'Please choose a quantity from 1 to 10.' : ''
    if (problem) return render(req, res, p.title, productPage(res.locals.base, p, { sku: size?.sku || '', color: color || '' }, `<p class="wsx-alert wsx-alert-error" role="alert">${esc(problem)}</p>`), 400)
    req.store.wsCart = cartOf(req.store)
    const existing = req.store.wsCart.find(l => l.id === p.id && l.sku === size.sku && l.color === color)
    if (existing) existing.qty = Math.min(99, existing.qty + qty)
    else req.store.wsCart.push({ id: p.id, sku: size.sku, color, qty })
    res.redirect(303, `${res.locals.base}/cart/?added=${encodeURIComponent(p.id)}`)
  })

  router.post('/cart/update', (req, res, next) => {
    const cart = cartOf(req.store), index = Number.parseInt(str(String(req.body?.line ?? '')), 10)
    if (!cart.length || !(index >= 0 && index < cart.length)) return next()
    if (str(req.body?.action) === 'remove') cart.splice(index, 1)
    else {
      const qty = Number.parseInt(str(String(req.body?.qty ?? '')), 10)
      if (!(qty >= 1 && qty <= 99)) return cartBody(req, res, '<p class="wsx-alert wsx-alert-error" role="alert">Please choose a valid quantity.</p>', 400)
      cart[index].qty = qty
    }
    res.redirect(303, `${res.locals.base}/cart/`)
  })

  router.get('/checkout/', (req, res, next) => {
    if (!lines(req.store).length) return res.redirect(`${res.locals.base}/cart/`)
    render(req, res, 'Checkout', checkoutPage(res.locals.base, req.store))
  })
  router.post('/checkout/', (req, res, next) => {
    const items = lines(req.store)
    if (!items.length) return next()
    const b = req.body || {}, v = Object.fromEntries(['email', 'phone', 'first_name', 'last_name', 'address', 'address2', 'city', 'state', 'postal_code', 'shipping_method', 'card_name', 'card_expiry'].map(k => [k, str(b[k])]))
    const errors = []
    if (!/^\S+@\S+\.\S+$/.test(v.email)) errors.push('Enter a valid email address.')
    if (!v.first_name || !v.last_name) errors.push('Enter your first and last name.')
    if (!v.address || !v.city) errors.push('Enter your street address and city.')
    if (!STATES.includes(v.state)) errors.push('Select a state.')
    if (!/^\d{5}(?:-\d{4})?$/.test(v.postal_code)) errors.push('Enter a valid 5-digit ZIP code.')
    if (!v.card_name) errors.push('Enter the name on the card.')
    const card = validateCard({ number: str(b.card_number), expiry: v.card_expiry, cvv: str(b.card_cvv) })
    if (!card.ok) errors.push(...Object.values(card.errors))
    if (errors.length) return render(req, res, 'Checkout', checkoutPage(res.locals.base, req.store, v, errors), 400)
    const method = SHIPPING.find(s => s[0] === v.shipping_method) || SHIPPING[0]
    const t = totals(items, method[0], v.state)
    const address = { line1: v.address, ...(v.address2 ? { line2: v.address2 } : {}), city: v.city, state: v.state, postal_code: v.postal_code, country: 'US' }
    const orderNumber = String(Date.now() % 1e9 + 7e9 + Math.floor(Math.random() * 1000))
    const order = recordOrder({
      store: SHELF_STORE, order_number: orderNumber, session: req.session,
      items: items.map(l => ({ kind: 'other', title: [l.product.title, l.size.label, l.color].filter(Boolean).join(', '), qty: l.qty, unit_price: l.size.price, sku: l.size.sku })),
      customer: { email: v.email, first_name: v.first_name, last_name: v.last_name, ...(v.phone ? { phone: v.phone } : {}) },
      fulfillment: { method: 'ship', option: method[1], eta: method[2] },
      shipping_address: address, billing_address: address,
      payment: { method: 'card', brand: card.brand, last4: card.last4, name_on_card: v.card_name },
      totals: { subtotal: t.subtotal, shipping: t.shipping, tax: t.tax, total: t.total }, currency: 'USD',
      meta: { catalog: 'williams-sonoma-shelf', product_ids: items.map(l => l.product.id) },
    })
    req.store.wsCart = []
    req.store.wsOrders = [...(Array.isArray(req.store.wsOrders) ? req.store.wsOrders : []), structuredClone(order)].slice(-20)
    res.redirect(303, `${res.locals.base}/checkout/confirmation.html?order=${encodeURIComponent(order.order_number)}`)
  })
  router.get('/checkout/confirmation.html', (req, res, next) => {
    const order = (Array.isArray(req.store.wsOrders) ? req.store.wsOrders : []).find(o => o.order_number === str(req.query.order))
    if (!order) return next()
    render(req, res, 'Order Confirmation', confirmationPage(res.locals.base, order))
  })
  return router
}
