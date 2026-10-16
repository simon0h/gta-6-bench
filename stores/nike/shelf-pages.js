// Nike shelf pages for the default reference catalog: product cards and rows,
// category grids, search results, product pages (/t/<slug>/<style-colour>), the
// Bag, checkout and order confirmation. Bag lines live in req.store.nikeBag and
// only ever hold shelf style codes; orders are recorded as `kind: 'other'`.
// Anything else posted to /cart/add, /cart/update or /checkout/order (stale
// fixture carts, GTA fixture SKUs, unknown ids) falls through to the shared
// reference guard, which answers 409.
import { randomInt, randomUUID } from 'node:crypto'
import { esc, publicNotice } from '../../lib/html.js'
import { validateCard } from '../../lib/payment.js'
import { recordOrder, getOrder } from '../../lib/orders.js'
import { FILTERS } from './site-data.js'
import { shelf, shelfStyle, isShelfStyle, stylePath, filterShelf, sortShelf, SORTS, shelfArt, artUrl, VIEWS, relatedItems } from './shelf.js'

const str = v => typeof v === 'string' ? v.trim() : ''
const money = v => `$${Number.isInteger(v) ? v : v.toFixed(2)}`
const money2 = v => `$${v.toFixed(2)}`
const round = v => Math.round(v * 100) / 100
const A = (base, path, label, cls = '') => `<a${cls ? ` class="${cls}"` : ''} href="${base}${path}">${esc(label)}</a>`
const stars = r => `<span class="nks-stars" aria-label="${r} out of 5 stars"><span style="width:${Math.round(r / 5 * 100)}%"></span></span>`

// ---------- cards and rows ----------
const priceHTML = p => `<p class="nk-captured-price">${p.sale ? `${money(p.price)} <s>${money(p.fullPrice)}</s> <span>${p.discount}% off</span>` : money(p.price)}</p>`
export function card(base, p, { color = p.colorways[0], eager = false } = {}) {
  const path = stylePath(p, color)
  return `<article class="nks-card" data-product-kind="other" data-shelf-product="${esc(p.id)}"><a href="${base}${esc(path)}"><img class="nk-captured-image" src="${artUrl(base, color.style)}" alt="${esc(`${p.title} ${p.subtitle}`)}" width="640" height="600"></a><a href="${base}${esc(path)}"><div class="nk-captured-copy">${p.badge ? `<p class="nk-captured-badge">${esc(p.badge)}</p>` : p.sale ? '<p class="nk-captured-badge">Sale</p>' : ''}<h2>${esc(p.title)}</h2><p class="nk-captured-subtitle">${esc(p.subtitle)}</p><p class="nks-colors">${p.colorways.length} Color${p.colorways.length > 1 ? 's' : ''}</p>${priceHTML(p)}</div></a></article>`
}
export function row(base, title, items, link) {
  return `<section class="nkx-section nks-row-section"><div class="nkx-section-head"><h2>${esc(title)}</h2>${link ? A(base, link[1], link[0], 'nks-row-link') : ''}</div><div class="nks-row" role="list">${items.map((p, i) => card(base, p, { eager: i < 4 })).join('')}</div></section>`
}

// ---------- grids (category listings and search) ----------
const PER_PAGE = 24
const facetKey = name => name.toLowerCase().replace(/[^a-z]+/g, '-')
const FACET_KEYS = FILTERS.map(([name]) => facetKey(name))
const SORT_PARAMS = { newest: 'Newest', 'price-desc': 'Price: High-Low', 'price-asc': 'Price: Low-High' }
export function gridQuery(query) {
  const q = {}
  for (const key of FACET_KEYS) if (str(query[key])) q[key] = str(query[key])
  const sort = SORT_PARAMS[str(query.sort)] || (SORTS.includes(str(query.sort)) ? str(query.sort) : '')
  return { q, sort, page: Math.max(1, Number.parseInt(query.page, 10) || 1) }
}
export function grid(base, { action, hidden = {}, heading, crumbs = '', siblings = [], items, query, emptyTitle = 'We couldn’t find anything matching your filters.' }) {
  const { q, sort, page } = gridQuery(query)
  const filtered = sortShelf(filterShelf(items, q), sort)
  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const current = Math.min(page, pages)
  const shown = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE)
  const keep = Object.entries(hidden).map(([k, v]) => `<input type="hidden" name="${esc(k)}" value="${esc(v)}">`).join('')
  const keepFacets = Object.entries(q).map(([k, v]) => `<input type="hidden" name="${esc(k)}" value="${esc(v)}">`).join('')
  const facets = `<form action="${action}" method="get" class="nkx-filter-form">${keep}${sort ? `<input type="hidden" name="sort" value="${esc(sort)}">` : ''}${FILTERS.map(([name, options], i) => { const key = facetKey(name); return `<details${i < 3 || q[key] ? ' open' : ''}><summary>${esc(name)}${q[key] ? ' (1)' : ''}</summary>${options.map((o, j) => `<label class="nkx-check" for="f-${key}-${j}"><input id="f-${key}-${j}" type="radio" name="${key}" value="${esc(o)}"${q[key] === o ? ' checked' : ''}> ${esc(o)}</label>`).join('')}</details>` }).join('')}<button class="nkx-btn nkx-btn-outline">Apply Filters</button>${Object.keys(q).length ? `<a class="nks-clear" href="${action}${Object.keys(hidden).length ? '?' + esc(new URLSearchParams(hidden).toString()) : ''}">Clear All</a>` : ''}</form>`
  const pageHref = n => `${action}?${esc(new URLSearchParams({ ...hidden, ...q, ...(sort ? { sort } : {}), page: String(n) }).toString())}`
  const pager = pages > 1 ? `<nav class="nks-pager" aria-label="Pages">${current > 1 ? `<a href="${pageHref(current - 1)}" rel="prev">Previous</a>` : ''}${Array.from({ length: pages }, (_, i) => i + 1).map(n => n === current ? `<span aria-current="page">${n}</span>` : `<a href="${pageHref(n)}">${n}</a>`).join('')}${current < pages ? `<a href="${pageHref(current + 1)}" rel="next">Next</a>` : ''}</nav>` : ''
  const products = shown.length ? `<div class="nk-captured-products nks-grid" aria-label="Product results" data-result-count="${filtered.length}">${shown.map((p, i) => card(base, p, { eager: i < 6 })).join('')}</div>${pager}` : `<div class="nkx-empty"><h2>${esc(emptyTitle)}</h2><p>Try removing a filter or ${A(base, action.slice(base.length) || '/', 'clear all filters')}.</p></div>`
  return `<section class="nk-captured-search nkx-listing nks-listing" data-reference-state="shelf"><div class="nk-captured-toolbar"><div>${crumbs}${heading(filtered.length)}</div><div class="nk-captured-actions"><button type="button" data-reference-filters aria-expanded="true">Hide Filters <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7h18M3 17h18"/><circle cx="9" cy="7" r="3"/><circle cx="16" cy="17" r="3"/></svg></button><form action="${action}" method="get">${keep}${keepFacets}<label class="sr-only" for="nkx-sort">Sort By</label><select id="nkx-sort" name="sort" data-reference-sort><option value="">Sort By</option>${SORTS.map(o => `<option${sort === o ? ' selected' : ''}>${o}</option>`).join('')}</select><noscript><button class="nk-reference-sort-apply">Apply</button></noscript></form></div></div>${siblings.length ? `<nav class="nkx-subcats" aria-label="Subcategories">${siblings.map(([l, p]) => A(base, p, l)).join('')}</nav>` : ''}<div class="nk-captured-browse"><aside class="nk-captured-filters" aria-label="Filter products"><a class="nk-captured-pickup" href="${base}/retail">Pick Up Today <span aria-hidden="true"></span></a>${facets}</aside><div class="nks-results">${products}</div></div></section>`
}

export function listingGrid(base, slug, info, items, query) {
  const crumbs = info.dept ? `<nav class="nkx-crumbs" aria-label="Breadcrumb">${A(base, info.dept.path, info.dept.label)}<span aria-hidden="true">/</span><span>${esc(info.group)}</span></nav>` : ''
  const html = grid(base, { action: `${base}/w/${slug}`, crumbs, siblings: (info.siblings || []).filter(([, p]) => p !== `/w/${slug}`), items, query,
    heading: n => `<h1>${esc(info.title)} <span class="nks-count">(${n})</span></h1>` })
  return items.length < 8 ? html + row(base, 'You Might Also Like', relatedItems(slug, items)) : html
}

export function searchGrid(base, term, items, query) {
  return grid(base, { action: `${base}/w`, hidden: { q: term }, items, query,
    heading: n => `<p>Search results for</p><h1>${esc(term)} <span class="nks-count">(${n})</span></h1>` })
}

// ---------- product page ----------
function similar(p) {
  const same = shelf.filter(x => x !== p && x.g === p.g && x.cat === p.cat && x.sport === p.sport)
  const pool = same.length >= 4 ? same : shelf.filter(x => x !== p && x.cat === p.cat)
  return [...pool].sort((a, b) => b.reviews - a.reviews).slice(0, 8)
}
export function productPage(base, p, color, { error = '', added = null, size = '' } = {}) {
  const views = Array.from({ length: VIEWS }, (_, v) => v)
  const gallery = `<div class="nks-gallery"><div class="nks-thumbs" role="list">${views.map(v => `<a href="#nks-view-${v}" role="listitem" aria-label="View ${v + 1}"><img src="${artUrl(base, color.style, v)}" alt="" loading="lazy" width="64" height="60"></a>`).join('')}</div><div class="nks-stage">${views.map(v => `<img id="nks-view-${v}" src="${artUrl(base, color.style, v)}" alt="${esc(`${p.title} ${p.subtitle}, ${color.name}, view ${v + 1}`)}"${v ? ' loading="lazy"' : ''} width="640" height="600">`).join('')}</div></div>`
  const swatches = p.colorways.length > 1 ? `<div class="nks-swatches" aria-label="Colors">${p.colorways.map(c => `<a href="${base}${esc(stylePath(p, c))}"${c === color ? ' aria-current="true"' : ''} title="${esc(c.name)}"><img src="${artUrl(base, c.style)}" alt="${esc(c.name)}" loading="lazy" width="70" height="66"></a>`).join('')}</div>` : ''
  const sizes = `<fieldset class="nks-sizes"><legend class="sr-only">Select Size</legend>${p.sizes.map((s, i) => `<label for="size-${i}"><input id="size-${i}" type="radio" name="size" value="${esc(s)}"${size === s || p.sizes.length === 1 ? ' checked' : ''}${p.sizes.length === 1 ? '' : ' required'}><span>${esc(s)}</span></label>`).join('')}</fieldset>`
  const addedPanel = added ? `<div class="nks-added" role="status"><p><strong>✓ Added to Bag</strong></p><p>${esc(p.title)} · ${esc(added.size)} · ${money(p.price)}</p><div class="nkx-hero-ctas">${A(base, '/cart', `View Bag (${added.count})`, 'nkx-btn nkx-btn-outline')}${A(base, '/checkout', 'Checkout', 'nkx-btn nkx-btn-dark')}</div></div>` : ''
  const sub = p.g === 'kids' ? 'Kids' : p.gender
  const crumb = `<nav class="nkx-crumbs nks-crumbs" aria-label="Breadcrumb">${A(base, p.g === 'women' ? '/women' : p.g === 'kids' ? '/kids' : '/men', sub)}<span aria-hidden="true">/</span><span>${esc(p.cat === 'shoes' ? 'Shoes' : p.cat === 'clothing' ? 'Clothing' : 'Accessories')}</span></nav>`
  const desc = p.description || `${p.title} ${p.subtitle.replace(/^(Men's|Women's|Big Kids'|Little Kids'|Baby\/Toddler) /, '')} brings Nike ${p.sportLabel.toLowerCase()} design to every day, with the comfort and durability you expect from ${p.brand === 'Jordan' ? 'Jordan Brand' : p.brand}.`
  return `<section class="nks-pdp" data-shelf-product="${esc(p.id)}" data-product-kind="other">${crumb}<div class="nks-pdp-grid">${gallery}<div class="nkx-pdp-info nks-info">${p.badge ? `<p class="nks-badge">${esc(p.badge)}</p>` : ''}<h1>${esc(p.title)}</h1><p class="nkx-pdp-sub">${esc(p.subtitle)}</p><p class="nks-price">${p.sale ? `<b>${money(p.price)}</b> <s>${money(p.fullPrice)}</s> <span class="nks-off">${p.discount}% off</span>` : `<b>${money(p.price)}</b>`}</p>${swatches}${addedPanel}<form class="nks-buy" action="${base}/cart/add" method="post"><input type="hidden" name="style" value="${esc(color.style)}"><div class="nkx-pdp-size-head"><h2>Select Size</h2><a href="${base}/help/a/size-charts">Size Guide</a></div>${error ? `<p class="nks-error" role="alert">${esc(error)}</p>` : ''}${sizes}<label class="sr-only" for="nks-qty">Quantity</label><select id="nks-qty" name="qty" class="nks-qty">${[1, 2, 3, 4, 5].map(n => `<option value="${n}">Qty ${n}</option>`).join('')}</select><button class="nkx-btn nkx-btn-dark nkx-wide nks-add">Add to Bag</button></form><a class="nkx-btn nkx-btn-outline nkx-wide nks-fav" href="${base}/register?next=%2Ffavorites">Favorite <span aria-hidden="true">♡</span></a><div class="nkx-pdp-delivery"><h2>Shipping</h2><p>You'll see our shipping options at checkout.</p><h2>Free Pickup</h2><p><a href="${base}/retail">Find a Store</a></p></div><p class="nks-desc">${esc(desc)}</p><ul class="nks-facts"><li>Shown: ${esc(color.name)}</li><li>Style: ${esc(color.style)}</li></ul><details open><summary>Product Details</summary><ul><li>${esc(p.brand)}</li><li>${esc(p.sportLabel)}</li>${p.cat === 'shoes' ? `<li>${p.height === 'low' ? 'Low-top' : p.height === 'mid' ? 'Mid-top' : 'High-top'} design</li>` : ''}<li>Colors: ${p.colorways.map(c => esc(c.name)).join(', ')}</li></ul></details><details><summary>Size &amp; Fit</summary><p>${p.cat === 'shoes' ? 'Fits true to size. We recommend ordering your usual size.' : 'Standard fit for a relaxed, easy feel.'}</p><p><a href="${base}/help/a/size-charts">Size Guide</a></p></details><details><summary>Shipping &amp; Returns</summary><p>Free standard shipping on orders $50+ and free 60-day returns for Nike Members. <a href="${base}/help/a/returns-policy">Return policy exclusions apply.</a></p><p>Pick-up available at select Nike Stores.</p></details><details><summary>Reviews (${p.reviews.toLocaleString('en-US')}) ${stars(p.rating)}</summary><p>${stars(p.rating)} ${p.rating.toFixed(1)} Stars</p><p>${p.reviews.toLocaleString('en-US')} reviews from Nike Members.</p></details></div></div>${row(base, 'You Might Also Like', similar(p))}</section>`
}

// ---------- bag ----------
export const bagLines = req => (Array.isArray(req.store?.nikeBag) ? req.store.nikeBag : []).filter(l => isShelfStyle(l?.style))
export const bagCount = req => bagLines(req).reduce((n, l) => n + l.qty, 0)
const lineItems = req => bagLines(req).map(l => { const { product, color } = shelfStyle(l.style); return { ...l, product, color } })
const isMember = req => !!req.store?.user
const SHIPPING = [
  ['standard', 'Standard Shipping', 'Arrives in 4-7 business days'],
  ['expedited', 'Expedited Shipping', 'Arrives in 2-4 business days'],
  ['next-day', 'Next Business Day', 'Order by 11 a.m. PT'],
]
// Delivery window as nike.com prints it in the order summary ("Arrives Thu, Oct 22 - Mon, Oct 26").
const BUSINESS_DAYS = { standard: [4, 7], expedited: [2, 4], 'next-day': [1, 1] }
function addBusinessDays(from, n) { const d = new Date(from); while (n > 0) { d.setDate(d.getDate() + 1); if (d.getDay() % 6) n-- } return d }
function arrivalText(speed, now = new Date()) {
  const [lo, hi] = BUSINESS_DAYS[speed] || BUSINESS_DAYS.standard
  const fmt = d => d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  return lo === hi ? `Arrives ${fmt(addBusinessDays(now, lo))}` : `Arrives ${fmt(addBusinessDays(now, lo))} - ${fmt(addBusinessDays(now, hi))}`
}
const STATE_TAX = { AL: 4, AK: 0, AZ: 5.6, AR: 6.5, CA: 7.25, CO: 2.9, CT: 6.35, DE: 0, DC: 6, FL: 6, GA: 4, HI: 4, ID: 6, IL: 6.25, IN: 7, IA: 6, KS: 6.5, KY: 6, LA: 4.45, ME: 5.5, MD: 6, MA: 6.25, MI: 6, MN: 6.875, MS: 7, MO: 4.225, MT: 0, NE: 5.5, NV: 6.85, NH: 0, NJ: 6.625, NM: 4.875, NY: 4, NC: 4.75, ND: 5, OH: 5.75, OK: 4.5, OR: 0, PA: 6, RI: 7, SC: 6, SD: 4.2, TN: 7, TX: 6.25, UT: 6.1, VT: 6, VA: 5.3, WA: 6.5, WV: 6, WI: 5, WY: 4 }
export function totals(req, { shipping = 'standard', state = '' } = {}) {
  const lines = lineItems(req)
  const subtotal = round(lines.reduce((n, l) => n + l.qty * l.product.price, 0))
  const threshold = isMember(req) ? 50 : 75
  const standard = subtotal >= threshold ? 0 : isMember(req) ? 5 : 8
  const ship = shipping === 'expedited' ? 15 : shipping === 'next-day' ? 25 : standard
  const rate = STATE_TAX[state]
  const tax = rate === undefined ? null : round(subtotal * rate / 100)
  return { lines, subtotal, shipping: ship, standard, threshold, tax, total: round(subtotal + ship + (tax || 0)) }
}
const summaryTable = (t, { taxText } = {}) => `<table><caption class="sr-only">Order summary</caption><thead class="sr-only"><tr><th>Item</th><th>Amount</th></tr></thead><tbody><tr><th scope="row">Subtotal</th><td>${t.lines.length ? money2(t.subtotal) : '—'}</td></tr><tr><th scope="row">Estimated Shipping &amp; Handling</th><td>${t.lines.length ? (t.shipping ? money2(t.shipping) : 'Free') : '—'}</td></tr><tr><th scope="row">Estimated Tax</th><td>${t.tax === null ? (taxText || '—') : money2(t.tax)}</td></tr><tr class="nkx-total"><th scope="row">Total</th><td>${t.lines.length ? money2(t.total) : '—'}</td></tr></tbody></table>`

export function bagPage(base, req) {
  const t = totals(req)
  if (!t.lines.length) return null
  const lines = t.lines.map(l => `<article class="nks-line" data-bag-style="${esc(l.style)}" data-product-kind="other"><a href="${base}${esc(stylePath(l.product, l.color))}"><img src="${artUrl(base, l.style)}" alt="${esc(l.product.title)}" width="164" height="154"></a><div class="nks-line-copy"><h2>${A(base, stylePath(l.product, l.color), l.product.title)}</h2><p>${esc(l.product.subtitle)}</p><p>${esc(l.color.name)}</p><p>Size ${esc(l.size)}</p><form action="${base}/cart/update" method="post" class="nks-line-qty"><input type="hidden" name="style" value="${esc(l.style)}"><input type="hidden" name="size" value="${esc(l.size)}"><label for="qty-${esc(l.style)}-${esc(l.size).replace(/\W+/g, '')}">Quantity</label><select id="qty-${esc(l.style)}-${esc(l.size).replace(/\W+/g, '')}" name="qty">${Array.from({ length: 10 }, (_, i) => i + 1).map(n => `<option${n === l.qty ? ' selected' : ''}>${n}</option>`).join('')}</select><button class="nks-link-btn" name="action" value="update">Update</button><button class="nks-link-btn" name="action" value="remove" aria-label="Remove ${esc(l.product.title)}">Remove</button></form></div><p class="nks-line-price">${l.product.sale ? `<s>${money2(l.qty * l.product.fullPrice)}</s> ` : ''}${money2(l.qty * l.product.price)}</p></article>`).join('')
  const free = t.subtotal >= t.threshold ? `<p class="nks-free">✓ You qualify for Free Shipping${isMember(req) ? ' as a Member' : ''}!</p>` : `<p class="nkx-muted nkx-small">Add ${money2(t.threshold - t.subtotal)} more to qualify for Free Shipping${isMember(req) ? ' as a Member' : ''}! ${A(base, '/membership', 'Learn More')}</p>`
  return `<div class="nkx-bag nks-bag"><div><h1>Bag</h1><p class="nks-bag-count">${bagCount(req)} Item${bagCount(req) === 1 ? '' : 's'} | ${money2(t.subtotal)}</p>${lines}<section class="nkx-bag-favs"><h2>Favorites</h2><p>Want to view your favorites? ${A(base, '/membership', 'Join us')} or ${A(base, '/register', 'Sign-in')}</p></section></div><aside class="nkx-summary" aria-labelledby="nkx-summary-h"><h2 id="nkx-summary-h">Summary</h2><details><summary>Do you have a Promo Code?</summary><form action="${base}/cart" method="get"><label class="sr-only" for="nkx-promo-code">Promo Code</label><input id="nkx-promo-code" name="promo"><button class="nkx-btn nkx-btn-outline">Apply</button></form></details>${summaryTable(t)}${free}${A(base, '/checkout', isMember(req) ? 'Member Checkout' : 'Guest Checkout', 'nkx-btn nkx-btn-dark nkx-wide nks-bag-btn')}${isMember(req) ? '' : A(base, '/register?next=%2Fcheckout', 'Member Checkout', 'nkx-btn nkx-btn-outline nkx-wide nks-bag-btn')}</aside></div>`
}

// ---------- checkout ----------
const STATES = Object.keys(STATE_TAX)
const FIELDS = [['email', 'Email', 'email', 'email'], ['phone', 'Phone Number', 'tel', 'tel'], ['first_name', 'First Name', 'text', 'given-name'], ['last_name', 'Last Name', 'text', 'family-name'], ['address1', 'Street Address', 'text', 'address-line1'], ['address2', 'Apt, Suite, Building (Optional)', 'text', 'address-line2'], ['city', 'City', 'text', 'address-level2'], ['state', 'State', 'select', 'address-level1'], ['postal_code', 'ZIP Code', 'text', 'postal-code']]
function field(values, [name, label, type, auto]) {
  const id = `co-${name}`
  if (type === 'select') return `<div class="nks-field"><label for="${id}">${label}</label><select id="${id}" name="${name}" autocomplete="${auto}" required><option value="">Select</option>${STATES.map(s => `<option${values[name] === s ? ' selected' : ''}>${s}</option>`).join('')}</select></div>`
  return `<div class="nks-field"><label for="${id}">${label}</label><input id="${id}" name="${name}" type="${type}" autocomplete="${auto}" value="${esc(values[name] || '')}"${name === 'address2' ? '' : ' required'}></div>`
}
export function checkoutPage(base, req, values = {}, errors = []) {
  const t = totals(req, { shipping: values.shipping, state: values.state })
  req.store.nikeCheckout ||= {}
  req.store.nikeCheckout.token ||= randomUUID()
  const ship = SHIPPING.map(([v, label, eta], i) => { const cost = v === 'standard' ? t.standard : v === 'expedited' ? 15 : 25; return `<label class="nks-ship" for="ship-${v}"><input id="ship-${v}" type="radio" name="shipping" value="${v}"${(values.shipping || 'standard') === v ? ' checked' : ''}${i ? '' : ' required'}><span><b>${cost ? money2(cost) : 'Free'}</b> ${esc(label)}<small>${esc(eta)}</small></span></label>` }).join('')
  const items = t.lines.map(l => `<li data-product-kind="other"><img src="${artUrl(base, l.style)}" alt="" width="96" height="90"><div><p><b>${esc(l.product.title)}</b></p><p>${esc(l.product.subtitle)}</p><p>Qty ${l.qty} · Size ${esc(l.size)}</p><p>${money2(l.qty * l.product.price)}</p></div></li>`).join('')
  return `<div class="nks-checkout"><h1>Checkout</h1>${errors.length ? `<div class="nks-error" role="alert"><p>Please correct the following:</p><ul>${errors.map(e => `<li>${esc(e)}</li>`).join('')}</ul></div>` : ''}<div class="nks-checkout-grid"><form action="${base}/checkout/order" method="post" class="nks-checkout-form"><input type="hidden" name="checkout_token" value="${esc(req.store.nikeCheckout.token)}"><section><h2>Delivery</h2>${isMember(req) ? `<p>Signed in as ${esc(req.store.user.email || '')}</p>` : `<p class="nkx-muted">Checking out as a guest. ${A(base, '/register?next=%2Fcheckout', 'Sign in')} for member shipping.</p>`}<fieldset class="nks-fields"><legend>Enter your name and address:</legend>${FIELDS.map(f => field({ email: isMember(req) ? req.store.user.email : '', ...values }, f)).join('')}</fieldset></section><section><h2>Shipping</h2><fieldset class="nks-ships"><legend class="sr-only">Shipping speed</legend>${ship}</fieldset></section><section><h2>Payment</h2>${publicNotice('<p class="nkx-muted">Simulated card payment. No real charge is made.</p>')}<p class="nks-pay-methods">Credit or Debit Card <span>Visa · Mastercard · American Express · Discover</span></p><fieldset class="nks-fields"><legend class="sr-only">Card details</legend><div class="nks-field"><label for="co-card-name">Name on Card</label><input id="co-card-name" name="card_name" autocomplete="cc-name" value="${esc(values.card_name || '')}" required></div><div class="nks-field"><label for="co-card-number">Card Number</label><input id="co-card-number" name="card_number" inputmode="numeric" autocomplete="cc-number" required></div><div class="nks-field"><label for="co-card-expiry">MM/YY</label><input id="co-card-expiry" name="card_expiry" autocomplete="cc-exp" placeholder="MM/YY" value="${esc(values.card_expiry || '')}" required></div><div class="nks-field"><label for="co-card-cvv">CVV</label><input id="co-card-cvv" name="card_cvv" inputmode="numeric" autocomplete="cc-csc" required></div></fieldset></section><p class="nkx-small nkx-muted">By clicking Place Order, you agree to the Nike ${A(base, '/terms-of-sale', 'Terms of Sale')} and ${A(base, '/privacy-policy', 'Privacy Policy')}.</p><button class="nkx-btn nkx-btn-dark nkx-wide">Place Order</button></form><aside class="nkx-summary nks-order-summary" aria-labelledby="nks-sum-h"><h2 id="nks-sum-h">Order Summary</h2>${summaryTable(t, { taxText: 'Calculated after address' })}<h3>${esc(arrivalText(values.shipping || 'standard'))}</h3><ul class="nks-order-items">${items}</ul></aside></div></div>`
}

const ORDER_TITLE = l => `${l.product.title} ${l.product.subtitle} (${l.color.name}) - Size ${l.size}`
export function confirmationPage(base, order) {
  return `<div class="nks-confirm"><h1>Thanks for Your Order!</h1><p>Order Number: <strong data-order-number>${esc(order.order_number)}</strong></p><p>We'll send a confirmation email to ${esc(order.customer.email)} when your order ships.</p><div class="nks-checkout-grid"><section><h2>Shipping To</h2><p>${esc(order.customer.first_name)} ${esc(order.customer.last_name)}</p><p>${esc(order.shipping_address.line1)}${order.shipping_address.line2 ? `, ${esc(order.shipping_address.line2)}` : ''}</p><p>${esc(order.shipping_address.city)}, ${esc(order.shipping_address.state)} ${esc(order.shipping_address.postal_code)}</p><h2>Shipping Speed</h2><p>${esc(order.fulfillment.option)} · ${esc(order.fulfillment.eta)}</p><h2>Payment</h2><p>${esc(order.payment.brand || 'Card')} ending in ${esc(order.payment.last4)}</p></section><aside class="nkx-summary"><h2>Summary</h2><ul class="nks-order-items">${order.items.map(i => `<li data-product-kind="other"><img src="${artUrl(base, i.sku)}" alt="" width="96" height="90"><div><p><b>${esc(i.title)}</b></p><p>Qty ${i.qty} · ${money2(i.qty * i.unit_price)}</p></div></li>`).join('')}</ul><table><tbody><tr><th scope="row">Subtotal</th><td>${money2(order.totals.subtotal)}</td></tr><tr><th scope="row">Shipping &amp; Handling</th><td>${order.totals.shipping ? money2(order.totals.shipping) : 'Free'}</td></tr><tr><th scope="row">Tax</th><td>${money2(order.totals.tax)}</td></tr><tr class="nkx-total"><th scope="row">Total</th><td>${money2(order.totals.total)}</td></tr></tbody></table></aside></div><div class="nkx-hero-ctas">${A(base, `/orders/details?orderNumber=${encodeURIComponent(order.order_number)}&email=${encodeURIComponent(order.customer.email)}`, 'View Order Status', 'nkx-btn nkx-btn-dark')}${A(base, '/', 'Continue Shopping', 'nkx-btn nkx-btn-outline')}</div></div>`
}

// ---------- routes ----------
export function installShelf(router, { render, baseOf }) {
  router.get('/images/t_PDP/:style/:view.svg', (req, res, next) => {
    const hit = shelfStyle(req.params.style), view = Number(req.params.view)
    if (!hit || !Number.isInteger(view) || view < 0 || view >= VIEWS) return next()
    res.type('image/svg+xml').set('Cache-Control', 'public, max-age=86400').send(shelfArt(hit.product, hit.color, view))
  })

  router.get('/t/:slug/:style', (req, res, next) => {
    const hit = shelfStyle(req.params.style)
    if (!hit) return next()
    if (hit.product.slug !== req.params.slug) return res.redirect(301, baseOf(res) + stylePath(hit.product, hit.color))
    const added = req.query.added && req.store.nikeAdded?.style === hit.color.style ? { size: req.store.nikeAdded.size, count: bagCount(req) } : null
    render(req, res, `${hit.product.title} ${hit.product.subtitle}`, productPage(baseOf(res), hit.product, hit.color, { added }))
  })

  router.post('/cart/add', (req, res, next) => {
    const hit = shelfStyle(str(req.body?.style))
    if (!hit) return next()
    const { product, color } = hit
    const size = str(req.body?.size) || (product.sizes.length === 1 ? product.sizes[0] : '')
    if (!product.sizes.includes(size)) return render(req, res, `${product.title} ${product.subtitle}`, productPage(baseOf(res), product, color, { error: 'Please select a size.' }), 400)
    const qty = Math.min(10, Math.max(1, Number.parseInt(req.body?.qty, 10) || 1))
    req.store.nikeBag = bagLines(req)
    const line = req.store.nikeBag.find(l => l.style === color.style && l.size === size)
    if (line) line.qty = Math.min(10, line.qty + qty)
    else req.store.nikeBag.push({ style: color.style, size, qty })
    req.store.nikeAdded = { style: color.style, size }
    delete req.store.nikeCheckout
    res.redirect(303, `${baseOf(res)}${stylePath(product, color)}?added=1`)
  })

  router.post('/cart/update', (req, res, next) => {
    const style = str(req.body?.style), size = str(req.body?.size)
    const line = bagLines(req).find(l => l.style === style && l.size === size)
    if (!line) return next()
    if (str(req.body?.action) === 'remove') req.store.nikeBag = bagLines(req).filter(l => l !== line)
    else line.qty = Math.min(10, Math.max(1, Number.parseInt(req.body?.qty, 10) || line.qty))
    delete req.store.nikeCheckout
    res.redirect(303, `${baseOf(res)}/cart`)
  })

  router.get('/cart', (req, res, next) => {
    const html = bagPage(baseOf(res), req)
    return html ? render(req, res, 'Bag', html) : next()
  })

  router.get('/checkout', (req, res) => {
    if (!bagLines(req).length) return res.redirect(303, `${baseOf(res)}/cart`)
    render(req, res, 'Checkout', checkoutPage(baseOf(res), req, req.store.nikeCheckout?.values || {}))
  })

  router.post('/checkout/order', (req, res, next) => {
    const base = baseOf(res)
    const token = str(req.body?.checkout_token)
    const done = req.store.nikeCompleted
    if (done && token && done.token === token) return res.redirect(303, `${base}/orders/confirmation/${done.number}`)
    if (!bagLines(req).length) return next()
    const values = Object.fromEntries([...FIELDS.map(([n]) => n), 'shipping', 'card_name', 'card_expiry'].map(n => [n, str(req.body?.[n]).slice(0, 200)]))
    if (!['standard', 'expedited', 'next-day'].includes(values.shipping)) values.shipping = 'standard'
    const errors = []
    if (req.store.nikeCheckout?.token && token && token !== req.store.nikeCheckout.token) errors.push('Your bag changed. Please review your order and place it again.')
    if (!/^\S+@\S+\.\S+$/.test(values.email)) errors.push('Please enter a valid email address.')
    if (!/^[\d\s()+-]{10,}$/.test(values.phone)) errors.push('Please enter a valid phone number.')
    if (!values.first_name || !values.last_name) errors.push('Please enter your first and last name.')
    if (!values.address1 || !values.city) errors.push('Please enter your street address and city.')
    if (!STATES.includes(values.state)) errors.push('Please select a state.')
    if (!/^\d{5}(-\d{4})?$/.test(values.postal_code)) errors.push('Please enter a valid ZIP code.')
    if (!values.card_name) errors.push('Please enter the name on the card.')
    const card = validateCard({ number: str(req.body?.card_number).replace(/[\s-]/g, ''), expiry: values.card_expiry, cvv: str(req.body?.card_cvv) })
    if (!card.ok) errors.push(...Object.values(card.errors))
    req.store.nikeCheckout ||= {}
    req.store.nikeCheckout.values = values
    if (errors.length) return render(req, res, 'Checkout', checkoutPage(base, req, values, errors), 400)
    const t = totals(req, { shipping: values.shipping, state: values.state })
    const speed = SHIPPING.find(([v]) => v === values.shipping)
    const address = { line1: values.address1, line2: values.address2 || undefined, city: values.city, state: values.state, postal_code: values.postal_code, country: 'US' }
    const order = recordOrder({ store: 'nike', order_number: `C0${randomInt(0, 10 ** 10).toString().padStart(10, '0')}`, session: req.session,
      items: t.lines.map(l => ({ kind: 'other', title: ORDER_TITLE(l), sku: l.style, qty: l.qty, unit_price: l.product.price })),
      customer: { email: values.email, first_name: values.first_name, last_name: values.last_name, phone: values.phone, ...(req.store.user?.id ? { account_id: req.store.user.id } : {}) },
      fulfillment: { method: 'ship', option: speed[1].replace(/^Free /, ''), eta: speed[2] },
      shipping_address: address, billing_address: address,
      payment: { method: 'card', brand: card.brand, last4: card.last4, name_on_card: values.card_name },
      totals: { subtotal: t.subtotal, shipping: t.shipping, tax: t.tax, total: t.total }, currency: 'USD',
      meta: { catalog: 'nike-shelf', member: isMember(req), sizes: t.lines.map(l => ({ sku: l.style, size: l.size })) } })
    req.store.nikeCompleted = { number: order.order_number, token: req.store.nikeCheckout.token }
    req.store.nikeBag = []
    delete req.store.nikeCheckout
    delete req.store.nikeAdded
    res.redirect(303, `${base}/orders/confirmation/${order.order_number}`)
  })

  router.get('/orders/confirmation/:number', (req, res, next) => {
    const order = getOrder(req.params.number)
    if (!order || order.store !== 'nike' || order.session_id !== (req.session?.id ?? null)) return next()
    render(req, res, 'Order Confirmation', confirmationPage(baseOf(res), order))
  })

  // Order status lookup finds orders placed on this site.
  router.get(['/orders/details', '/orders/details/'], (req, res, next) => {
    const number = str(req.query.orderNumber), email = str(req.query.email).toLowerCase()
    const order = number && getOrder(number)
    if (!order || order.store !== 'nike' || order.customer.email.toLowerCase() !== email) return next()
    render(req, res, 'Order Status', `<div class="nks-confirm"><h1>Order Status</h1><p>Order Number: <strong>${esc(order.order_number)}</strong></p><p>Status: <strong>Order Placed</strong> · ${esc(order.fulfillment.eta)}</p><ul class="nks-order-items">${order.items.map(i => `<li data-product-kind="other"><img src="${artUrl(baseOf(res), i.sku)}" alt="" width="96" height="90"><div><p><b>${esc(i.title)}</b></p><p>Qty ${i.qty} · ${money2(i.qty * i.unit_price)}</p></div></li>`).join('')}</ul><p>Total: <strong>${money2(order.totals.total)}</strong></p></div>`)
  })
}
