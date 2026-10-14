// IKEA shelf pages for the default reference catalog: product cards and carousels,
// the sortable/filterable product list, product pages, the shopping bag, checkout and
// order confirmation. Only shelf items (shelf.js) can be bought here, always as
// `kind: 'other'` order lines. Anything else (GTA fixture SKUs, legacy ids, stale carts)
// falls through to the shared read-only guard in reference-retail.js, which answers 409.
import { randomInt, randomUUID } from 'node:crypto'
import { esc, publicNotice } from '../../lib/html.js'
import { validateCard } from '../../lib/payment.js'
import { recordOrder, listOrders } from '../../lib/orders.js'
import { shelf, shelfById, shelfBySku, isShelfSku, shelfArt, shelfViews, SHELF_VIEWS, filterShelf, sortShelf, SORTS, PRICE_BANDS, RATINGS, many } from './shelf.js'
import { categoryIndex, P } from './site-data.js'

const text = v => typeof v === 'string' ? v.trim() : ''
const usd = n => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
export const PER_PAGE = 24
export const MAX_QTY = 20
const PARCEL = 9.99, TRUCK = 59, PICKUP = 5, TAX_RATE = 0.07
export const PICKUP_STORES = ['IKEA Brooklyn, NY', 'IKEA Burbank, CA', 'IKEA Canton, MI', 'IKEA Charlotte, NC', 'IKEA Emeryville, CA', 'IKEA Frisco, TX', 'IKEA Schaumburg, IL', 'IKEA Seattle, WA']
const STATES = 'AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY'.split(' ')

// ── Prices, badges and images ──────────────────────────────────────────────
export function price(n, cls = '') {
  const [d, c] = n.toFixed(2).split('.')
  return `<span class="iks-price ${cls}" aria-label="${usd(n)}"><span aria-hidden="true"><sup>$</sup>${Number(d).toLocaleString('en-US')}${c === '00' ? '' : `<sup>.${c}</sup>`}</span></span>`
}
const badge = p => p.prevPrice ? '<span class="iks-badge iks-badge-lower">New lower price</span>' : p.isNew ? '<span class="iks-badge iks-badge-new">New</span>' : ''
const stars = (r, n) => `<span class="iks-rating"><span class="iks-stars" style="--r:${(r / 5) * 100}%" role="img" aria-label="Review: ${r} out of 5 stars. Total reviews: ${n}"></span><span>(${n.toLocaleString('en-US')})</span></span>`
export const imgUrl = (base, p, view = 0) => `${base}${P}/images/products/${p.id}-${view}.svg`
export const shelfImg = (base, p, { view = 0, lazy = true, cls = '' } = {}) => `<img class="iks-img ${cls}" src="${esc(imgUrl(base, p, view))}" alt="${esc(`${p.name} ${p.type}, ${p.variant}`)}" width="300" height="300"${lazy ? ' loading="lazy"' : ''} decoding="async">`
export const productHref = (base, p) => base + p.path
const priceBlock = p => p.familyPrice
  ? `<p class="iks-family"><span>IKEA Family price</span>${price(p.familyPrice, 'iks-price-family')}</p><p class="iks-regular">Regular price ${usd(p.price)}</p>`
  : `${price(p.price)}${p.prevPrice ? `<p class="iks-prev">Previous price: <s>${usd(p.prevPrice)}</s></p>` : ''}`

// ── Cards, carousels and the product list ─────────────────────────────────
export function card(base, p) {
  return `<li class="iks-card" data-product-kind="other" data-shelf-product="${p.id}" data-product-number="${p.artNo}"><a class="iks-card-link" href="${esc(productHref(base, p))}"><span class="iks-thumb">${shelfImg(base, p)}</span>${badge(p)}<span class="iks-name">${esc(p.name)}</span><span class="iks-desc">${esc(p.type)}, ${esc(p.variant)}</span></a><div class="iks-card-price">${priceBlock(p)}</div>${stars(p.rating, p.reviews)}<form method="post" action="${base}/cart/add" class="iks-quick"><input type="hidden" name="sku" value="${p.sku}"><input type="hidden" name="qty" value="1"><button class="iks-add" aria-label="Add ${esc(p.name)} ${esc(p.type)} to bag"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 8h18l-3 12H6L3 8Z"/><path d="M8 9V6a4 4 0 0 1 8 0v3"/><path d="M12 12v5m-2.5-2.5h5"/></svg></button></form></li>`
}
export const carousel = (base, title, items, more) => items.length ? `<section class="ik-sec iks-carousel" aria-label="${esc(title)}"><div class="iks-carousel-head"><h2>${esc(title)}</h2>${more ? `<a class="ik-link" href="${esc(more)}">See all</a>` : ''}</div><ul class="iks-row">${items.map(p => card(base, p)).join('')}</ul></section>` : ''

function link(action, hidden, query, patch) {
  const params = new URLSearchParams()
  for (const [k, v] of Object.entries(hidden)) if (typeof v === 'string' && v) params.set(k, v)
  for (const [k, v] of Object.entries({ ...query, ...patch })) {
    if (k in hidden || v === undefined || v === null || v === '') continue
    for (const x of many(v)) params.append(k, x)
  }
  const s = params.toString()
  return esc(s ? `${action}?${s}` : action)
}
const COLOR_LABEL = c => c === 'stainless steel' ? 'Stainless steel' : c[0].toUpperCase() + c.slice(1)

// Sort & filter pills, item count, product grid and "Show more" (GET forms, no JS).
export function listing(base, action, query, items, { hidden = {}, keepOrder = false, emptyTitle = 'No products match your filters' } = {}) {
  const sort = SORTS.some(([v]) => v === query.sort) ? query.sort : 'RELEVANCE'
  const filtered = sortShelf(filterShelf(items, query), sort, keepOrder)
  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const page = Math.min(pages, Math.max(1, Number.parseInt(query.page, 10) || 1))
  const shown = filtered.slice(0, page * PER_PAGE)
  const checked = (k, v) => many(query[k]).includes(v) ? ' checked' : ''
  const keep = Object.entries(hidden).map(([k, v]) => `<input type="hidden" name="${esc(k)}" value="${esc(v)}">`).join('')
  const count = (key, fn) => { const m = new Map(); for (const p of filterShelf(items, { ...query, [key]: undefined })) { const v = fn(p); if (v) m.set(v, (m.get(v) || 0) + 1) } return m }
  const colors = count('color', p => p.color), cats = count('category', p => p.cat)
  const pill = (label, name, body, active) => `<details class="ik-pill${active ? ' iks-active' : ''}"><summary>${label}</summary><div><fieldset><legend class="sr-only">${label}</legend>${body}</fieldset><button class="ik-btn ik-btn-small">Apply</button></div></details>`
  const boxes = (name, list) => list.map(([v, l, n]) => `<label><input type="${name === 'sort' || name === 'rating' ? 'radio' : 'checkbox'}" name="${name}" value="${esc(v)}"${name === 'sort' ? (v === sort ? ' checked' : '') : checked(name, v)}> ${esc(l)}${n !== undefined ? ` <small>(${n})</small>` : ''}</label>`).join('')
  const active = ['price', 'color', 'category', 'rating', 'offers', 'new'].some(k => many(query[k]).length)
  const form = `<form action="${esc(action)}" method="get" class="iks-filters">${keep}
${pill('Sort', 'sort', boxes('sort', SORTS), sort !== 'RELEVANCE')}
${pill('Price', 'price', boxes('price', PRICE_BANDS.map(([v, l]) => [v, l])), many(query.price).length)}
${colors.size ? pill('Color', 'color', boxes('color', [...colors].sort((a, b) => b[1] - a[1]).map(([v, n]) => [v, COLOR_LABEL(v), n])), many(query.color).length) : ''}
${cats.size > 1 ? pill('Category', 'category', boxes('category', [...cats].sort((a, b) => b[1] - a[1]).map(([v, n]) => [v, categoryIndex.get(v).title, n])), many(query.category).length) : ''}
${pill('Customer rating', 'rating', boxes('rating', RATINGS), query.rating)}
${pill('Offers', 'offers', `<label><input type="checkbox" name="offers" value="true"${query.offers === 'true' ? ' checked' : ''}> Lower price &amp; IKEA Family price</label><label><input type="checkbox" name="new" value="true"${query.new === 'true' ? ' checked' : ''}> New</label>`, query.offers === 'true' || query.new === 'true')}
${active ? `<a class="ik-pill-link" href="${link(action, hidden, {}, { sort: sort === 'RELEVANCE' ? undefined : sort })}">Clear all</a>` : ''}</form>`
  const more = page < pages ? `<div class="iks-more"><p>You've viewed ${shown.length} of ${filtered.length} products</p><progress max="${filtered.length}" value="${shown.length}"></progress><a class="ik-btn ik-btn-secondary" href="${link(action, hidden, query, { page: String(page + 1) })}" rel="next">Show more</a></div>` : filtered.length > PER_PAGE ? `<div class="iks-more"><p>You've viewed ${shown.length} of ${filtered.length} products</p></div>` : ''
  const body = shown.length ? `<ul class="iks-grid" data-result-count="${filtered.length}">${shown.map(p => card(base, p)).join('')}</ul>${more}`
    : `<div class="ik-results-empty" data-catalog-state="no-match"><h3>${esc(emptyTitle)}</h3><p>Try removing some filters to see more products.</p><a class="ik-btn ik-btn-secondary" href="${link(action, hidden, {}, {})}">Clear all filters</a></div>`
  return `<section class="ik-sortfilter iks-sortfilter" aria-label="Sort and Filter"><h2 class="sr-only">Sort and Filter</h2>${form}<p class="ik-count"><strong>${filtered.length} items</strong></p></section><h2 class="sr-only">Results list</h2>${body}`
}

// ── Product page ──────────────────────────────────────────────────────────
const DETAILS = {
  shelf: ['Adjustable shelves and drawers can be arranged to suit your needs.', 'This furniture must be secured to the wall with the included wall fastener to prevent tip-over.', 'Easy to keep clean; wipe with a damp cloth.'],
  chair: ['Generous seat depth and supportive cushions make it comfortable for everyday sitting.', 'The cover is easy to keep clean and can be removed for washing where noted on the care label.', '10-year limited warranty on the frame. Read about the terms in the warranty brochure.'],
  table: ['A sturdy, practical table with a durable surface that is easy to keep clean.', 'Adjustable feet make the table stable on uneven floors.', 'Assembly takes about 30 minutes; all hardware is included.'],
  bed: ['A stable bed frame that gives your mattress good support night after night.', 'Slatted bed base and mattress are sold separately unless stated in the product name.', '10-year limited warranty. Read about the terms in the warranty brochure.'],
  lamp: ['Gives a soft, diffused light that creates a cozy atmosphere in your home.', 'Use with LED bulbs; we recommend SOLHETTA or TRÅDFRI.', 'This lamp is UL listed for use in the US.'],
  textile: ['Soft, durable fabric made to last through everyday use.', 'Machine washable; see the care label for instructions.', 'Made with cotton and other materials from more sustainable sources.'],
  curtain: ['The curtains filter light and provide privacy while letting daylight in.', 'Heading tape lets you hang them from a curtain rod, rail or with rings and hooks.', 'Machine wash warm, max 104°F.'],
  basket: ['Helps you organize and keep things tidy in drawers, on shelves or under the bed.', 'Stackable and easy to label so you always find what you are looking for.', 'Folds flat when not in use.'],
  food: ['From the Swedish Food Market at IKEA.', 'Keep frozen products at 0°F or below. Do not refreeze after thawing.', 'See packaging for ingredients and allergen information.'],
}
const detailsFor = p => DETAILS[p.shape] || ['Well designed, functional and affordable — made for everyday life at home.', 'Easy to clean and care for.', 'Read the care instructions included with the product.']
function reviewSummary(p) {
  const w = p.rating >= 4.6 ? [79, 13, 4, 2, 2] : p.rating >= 4.3 ? [64, 21, 8, 4, 3] : [50, 24, 12, 7, 7]
  return `<div class="iks-reviews"><p class="iks-score"><strong>${p.rating.toFixed(1)}</strong>${stars(p.rating, p.reviews)}</p><dl>${w.map((n, i) => `<dt>${5 - i} stars</dt><dd><meter min="0" max="100" value="${n}">${n}%</meter> ${n}%</dd>`).join('')}</dl></div>`
}
export function productBody(base, p, query = {}, errors = []) {
  const cat = categoryIndex.get(p.cat), dept = categoryIndex.get(p.dept)
  const views = shelfViews(p), asked = Number.parseInt(query.view, 10) || 0
  const view = views.includes(asked) ? asked : 0
  const href = productHref(base, p)
  const similar = shelf.filter(x => x.id !== p.id && x.cat === p.cat).slice(0, 8)
  const goes = shelf.filter(x => x.id !== p.id && x.cat !== p.cat && x.depts.some(d => p.depts.includes(d))).sort((a, b) => b.popularity - a.popularity).slice(0, 8)
  const qty = /^\d+$/.test(text(query.qty)) ? text(query.qty) : '1'
  const crumbs = [['Products', `${P}/cat/products-products/`], ...(dept && dept.slug !== cat.slug ? [[dept.title, `${P}/cat/${dept.slug}/`]] : []), [cat.title, `${P}/cat/${cat.slug}/`]]
  const large = isLarge(p)
  return `${errors.length ? `<div class="ik-error" role="alert"><strong>Please check the following:</strong><ul>${errors.map(e => `<li>${esc(e)}</li>`).join('')}</ul></div>` : ''}${query.added ? `<div class="iks-toast" role="status"><strong>Added to bag</strong> <a class="ik-btn ik-btn-small" href="${base}${P}/shoppingcart/">Go to bag</a></div>` : ''}
<nav class="ik-crumbs" aria-label="Breadcrumb"><ol>${crumbs.map(([l, h]) => `<li><a href="${base}${h}">${esc(l)}</a></li>`).join('')}<li><span aria-current="page">${esc(p.name)}</span></li></ol></nav>
<div class="iks-pip" data-product-kind="other" data-shelf-product="${p.id}">
<section class="iks-gallery" aria-label="Product images"><div class="iks-gallery-main">${shelfImg(base, p, { view, lazy: false, cls: 'iks-main-img' })}</div><div class="iks-thumbs">${views.map(i => `<a href="${esc(`${href}?view=${i}`)}"${i === view ? ' aria-current="true"' : ''} aria-label="Image ${i + 1}">${shelfImg(base, p, { view: i })}</a>`).join('')}</div></section>
<section class="iks-buy">${badge(p)}<h1 class="iks-title"><span class="iks-name">${esc(p.name)}</span> <span class="iks-desc">${esc(p.type)}, ${esc(p.variant)}</span></h1>
<div class="iks-pip-price">${priceBlock(p)}</div>
<a href="#iks-reviews" class="iks-rating-link">${stars(p.rating, p.reviews)}</a>
<p class="iks-artno">Article number <span class="iks-artno-box">${p.artNo}</span></p>
<section class="iks-get" aria-label="How to get it"><h2>How to get it</h2><ul><li><strong>Delivery</strong><span>${large ? `Truck delivery from ${usd(TRUCK)}` : `Parcel delivery ${usd(PARCEL)}`} · Available to your ZIP code</span></li><li><strong>Click &amp; Collect</strong><span>${usd(PICKUP)} · Pick up at your selected IKEA store</span></li></ul></section>
<form class="iks-buy-form" method="post" action="${base}/cart/add"><input type="hidden" name="sku" value="${p.sku}"><label for="iks-qty">Quantity</label><input id="iks-qty" name="qty" type="number" min="1" max="${MAX_QTY}" value="${esc(qty)}" inputmode="numeric"><button class="ik-btn iks-add-btn">Add to bag</button></form>
${publicNotice('<p class="ik-note">This is not the real IKEA website. Prices, stock and delivery options may differ from ikea.com.</p>')}</section></div>
<section class="iks-section" id="iks-details"><h2>Product details</h2><ul>${detailsFor(p).map(d => `<li>${esc(d)}</li>`).join('')}</ul><dl class="iks-specs"><dt>Product name</dt><dd>${esc(p.name)}</dd><dt>Product type</dt><dd>${esc(p.type)}</dd><dt>Color / size</dt><dd>${esc(p.variant)}</dd><dt>Article number</dt><dd>${p.artNo}</dd><dt>Category</dt><dd><a href="${base}${P}/cat/${cat.slug}/">${esc(cat.title)}</a></dd><dt>Designer</dt><dd>IKEA of Sweden</dd></dl></section>
<section class="iks-section" id="iks-measurements"><h2>Measurements</h2><p>${/\d/.test(p.variant) ? esc(p.variant.split(',').slice(/\d/.test(p.variant.split(',')[0]) ? 0 : 1).join(',').trim()) : 'See the product label for measurements.'}</p></section>
<section class="iks-section" id="iks-reviews"><h2>Reviews</h2>${reviewSummary(p)}</section>
${goes.length ? carousel(base, 'Goes well with', goes) : ''}${similar.length ? carousel(base, 'Similar products', similar, `${base}${P}/cat/${cat.slug}/`) : ''}`
}

// ── Bag and checkout (shelf items only) ───────────────────────────────────
const isLarge = p => ['chair', 'table', 'bed', 'shelf'].includes(p.shape) && p.price >= 100
export const shelfLines = req => (req.store.cart || []).filter(l => isShelfSku(l?.sku))
const foreignLines = req => (req.store.cart || []).some(l => !isShelfSku(l?.sku))
const line = (p, qty) => ({ kind: 'other', sku: p.sku, title: `${p.name} ${p.type}, ${p.variant}`, qty, unit_price: p.price })
const validQty = v => /^\d{1,2}$/.test(text(String(v ?? ''))) && Number(v) >= 1 && Number(v) <= MAX_QTY ? Number(v) : null
export const bagCount = req => shelfLines(req).reduce((s, l) => s + l.qty, 0)
export function totals(items, method = 'delivery') {
  const subtotal = Math.round(items.reduce((s, i) => s + i.qty * i.unit_price, 0) * 100) / 100
  const shipping = !items.length ? 0 : method === 'pickup' ? PICKUP : items.some(i => isLarge(shelfBySku(i.sku))) ? TRUCK : PARCEL
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100
  return { subtotal, shipping, tax, discount: 0, total: Math.round((subtotal + shipping + tax) * 100) / 100 }
}
const purchaseLines = req => shelfLines(req).map(l => line(shelfBySku(l.sku), l.qty))
const errorsHTML = errors => errors.length ? `<div class="ik-error" role="alert"><strong>Please check the following:</strong><ul>${errors.map(e => `<li>${esc(e)}</li>`).join('')}</ul></div>` : ''
function summary(t, method, cta = '') {
  return `<dl class="iks-summary-list"><dt>Products price</dt><dd>${usd(t.subtotal)}</dd><dt>${method === 'pickup' ? 'Click &amp; Collect' : method ? 'Delivery' : 'Delivery'}</dt><dd>${method ? usd(t.shipping) : 'Calculated at checkout'}</dd><dt>Estimated sales tax</dt><dd>${usd(t.tax)}</dd><dt class="iks-total">Total</dt><dd class="iks-total">${usd(method ? t.total : Math.round((t.subtotal + t.tax) * 100) / 100)}</dd></dl>${cta}`
}
export function bagBody(req, base, errors = []) {
  const lines = shelfLines(req)
  if (!lines.length) return `<div class="ik-page-head"><h1>Shopping bag</h1></div>${errorsHTML(errors)}<section class="ik-empty-bag"><h2>Your bag is empty</h2><p>When you add products to your shopping bag, they will appear here.</p><a class="ik-btn" href="${base}${P}/cat/products-products/">Continue shopping</a> <a class="ik-btn ik-btn-secondary" href="${base}${P}/profile/login/">Log in or sign up</a></section>`
  const items = lines.map(l => line(shelfBySku(l.sku), l.qty)), t = totals(items, null)
  return `<div class="ik-page-head"><h1>Shopping bag</h1></div>${errorsHTML(errors)}<div class="iks-bag"><section aria-label="Products in your bag">${items.map(i => { const p = shelfBySku(i.sku); return `<article class="iks-bag-line" data-cart-sku="${p.sku}" data-product-kind="other"><a class="iks-bag-thumb" href="${esc(productHref(base, p))}">${shelfImg(base, p)}</a><div class="iks-bag-info"><a class="iks-name" href="${esc(productHref(base, p))}">${esc(p.name)}</a><p class="iks-desc">${esc(p.type)}, ${esc(p.variant)}</p><p class="iks-artno-box">${p.artNo}</p><form method="post" action="${base}/cart/update" class="iks-bag-qty"><input type="hidden" name="sku" value="${p.sku}"><label for="qty_${p.sku}">Quantity</label><input id="qty_${p.sku}" name="qty" type="number" min="1" max="${MAX_QTY}" value="${i.qty}"><button name="action" value="update" class="ik-btn ik-btn-secondary ik-btn-small">Update</button><button name="action" value="remove" class="iks-remove">Remove product</button></form></div><strong class="iks-bag-price">${usd(i.qty * i.unit_price)}${i.qty > 1 ? `<small>${usd(i.unit_price)} each</small>` : ''}</strong></article>` }).join('')}</section>
<aside class="iks-summary"><h2>Order summary</h2>${summary(t, null, `<a class="ik-btn iks-checkout-btn" href="${base}${P}/checkout/">Continue to checkout</a><p class="ik-note">Delivery and Click &amp; Collect options are chosen at checkout.</p>`)}</aside></div>`
}
const field = (name, label, values, { type = 'text', ac = '', req = true } = {}) => `<div class="iks-field"><label for="co-${name}">${label}${req ? '' : ' (optional)'}</label><input id="co-${name}" name="${name}" type="${type}" value="${esc(values[name] || '')}"${ac ? ` autocomplete="${ac}"` : ''}${req ? ' required' : ''}></div>`
export function checkoutBody(req, base, values = {}, errors = []) {
  req.store.shelfCheckout ||= {}
  req.store.shelfCheckout.token ||= randomUUID()
  const items = purchaseLines(req), method = values.fulfillment === 'pickup' ? 'pickup' : 'delivery', t = totals(items, method)
  const large = items.some(i => isLarge(shelfBySku(i.sku)))
  return `<div class="ik-page-head"><h1>Checkout</h1></div>${errorsHTML(errors)}<div class="iks-checkout"><form method="post" action="${base}${P}/checkout/place/" class="ik-form iks-checkout-form"><input type="hidden" name="checkout_token" value="${req.store.shelfCheckout.token}">
<section class="iks-panel"><h2>1. Contact details</h2>${req.store.user ? `<p>Logged in as ${esc(req.store.user.email)}</p>` : `<p>Already have an account? <a class="ik-link" href="${base}${P}/profile/login/">Log in</a> or continue as a guest.</p>`}${field('email', 'Email', { email: req.store.user?.email, ...values }, { type: 'email', ac: 'email' })}${field('phone', 'Mobile number', values, { type: 'tel', ac: 'tel' })}</section>
<section class="iks-panel"><h2>2. Delivery or Click &amp; Collect</h2><fieldset class="iks-options"><legend class="sr-only">How do you want to get your order?</legend><label><input type="radio" name="fulfillment" value="delivery"${method === 'delivery' ? ' checked' : ''}> <strong>${large ? 'Truck delivery' : 'Parcel delivery'}</strong> <span>${usd(large ? TRUCK : PARCEL)} · Delivered to your address</span></label><label><input type="radio" name="fulfillment" value="pickup"${method === 'pickup' ? ' checked' : ''}> <strong>Click &amp; Collect</strong> <span>${usd(PICKUP)} · Pick up at an IKEA store</span></label></fieldset><div class="iks-field"><label for="co-pickup_store">Pickup store (Click &amp; Collect only)</label><select id="co-pickup_store" name="pickup_store"><option value="">Select a store</option>${PICKUP_STORES.map(s => `<option${values.pickup_store === s ? ' selected' : ''}>${esc(s)}</option>`).join('')}</select></div></section>
<section class="iks-panel"><h2>3. Address</h2><p class="ik-note">Delivery address, or billing address for Click &amp; Collect.</p><div class="iks-two">${field('first_name', 'First name', values, { ac: 'given-name' })}${field('last_name', 'Last name', values, { ac: 'family-name' })}</div>${field('address', 'Street address', values, { ac: 'address-line1' })}${field('address2', 'Apartment, suite, etc.', values, { ac: 'address-line2', req: false })}<div class="iks-three">${field('city', 'City', values, { ac: 'address-level2' })}<div class="iks-field"><label for="co-state">State</label><select id="co-state" name="state" autocomplete="address-level1" required><option value="">Select</option>${STATES.map(s => `<option${values.state === s ? ' selected' : ''}>${s}</option>`).join('')}</select></div>${field('postal_code', 'ZIP code', values, { ac: 'postal-code' })}</div></section>
<section class="iks-panel"><h2>4. Payment</h2><p>Credit or debit card</p><input type="hidden" name="payment_method" value="card">${field('card_name', 'Name on card', values, { ac: 'cc-name' })}${field('card_number', 'Card number', {}, { ac: 'cc-number' })}<div class="iks-two">${field('card_expiry', 'Expiration date (MM/YY)', values, { ac: 'cc-exp' })}${field('card_cvv', 'Security code', {}, { type: 'password', ac: 'cc-csc' })}</div>${publicNotice('<p class="ik-note">This is a simulated payment. No card is charged.</p>')}</section>
<button class="ik-btn iks-place">Place order · ${usd(t.total)}</button></form>
<aside class="iks-summary"><h2>Order summary</h2>${items.map(i => { const p = shelfBySku(i.sku); return `<article class="iks-mini" data-product-kind="other">${shelfImg(base, p)}<div><strong>${esc(p.name)}</strong><p>${esc(p.type)}, ${esc(p.variant)}</p><p>Qty ${i.qty} · ${usd(i.qty * i.unit_price)}</p></div></article>` }).join('')}${summary(t, method)}<p><a class="ik-link" href="${base}${P}/shoppingcart/">Edit bag</a></p></aside></div>`
}
const FIELDS = ['email', 'phone', 'fulfillment', 'pickup_store', 'first_name', 'last_name', 'address', 'address2', 'city', 'state', 'postal_code', 'card_name', 'card_expiry']
export const findOrder = (req, number) => listOrders({ store: 'ikea' }).find(o => o.order_number === number && o.session_id === (req.session?.id ?? null) && o.meta?.catalog === 'ikea-shelf')

export function installShelf(router, { render }) {
  const base = res => res.locals.base || '/ikea'
  router.get(`${P}/images/products/:file`, (req, res) => {
    const m = /^(\d{8})-(\d)\.svg$/.exec(req.params.file), p = m && shelfById(m[1])
    const svg = p && Number(m[2]) < SHELF_VIEWS && shelfArt(p, Number(m[2]))
    if (!svg) return res.status(404).type('text').send('Not found')
    res.set('Cache-Control', 'public, max-age=3600').type('image/svg+xml').send(svg)
  })
  router.get(`${P}/p/:slug/`, (req, res, next) => {
    const p = shelfById(/-(\d{8})$/.exec(req.params.slug)?.[1])
    if (!p) return next()
    if (req.path !== p.path) return res.redirect(301, base(res) + p.path)
    render(req, res, `${p.name} ${p.type}, ${p.variant}`, productBody(base(res), p, req.query))
  })
  router.post('/cart/add', (req, res, next) => {
    const p = shelfBySku(text(req.body?.sku))
    // Unknown SKUs (GTA fixture SKUs, legacy ids) and stale foreign carts reach the read-only guard.
    if (!p || foreignLines(req)) return next()
    const qty = validQty(req.body.qty ?? '1')
    const existing = req.store.cart.find(l => l.sku === p.sku)
    if (!qty || qty + (existing?.qty || 0) > MAX_QTY) return render(req, res, p.title, productBody(base(res), p, {}, [`Enter a quantity from 1 to ${MAX_QTY}. The maximum per product is ${MAX_QTY}.`]), 400)
    if (existing) existing.qty += qty
    else req.store.cart.push(line(p, qty))
    delete req.store.shelfCheckout
    res.redirect(`${base(res)}${p.path}?added=1`)
  })
  router.get(`${P}/shoppingcart/`, (req, res) => render(req, res, 'Shopping bag', bagBody(req, base(res))))
  router.post('/cart/update', (req, res, next) => {
    if (foreignLines(req)) return next()
    const l = req.store.cart.find(x => x.sku === text(req.body?.sku))
    if (!l) return next()
    if (req.body.action === 'remove') req.store.cart = req.store.cart.filter(x => x !== l)
    else {
      const qty = validQty(req.body.qty)
      if (!qty) return render(req, res, 'Shopping bag', bagBody(req, base(res), [`Enter a quantity from 1 to ${MAX_QTY}.`]), 400)
      l.qty = qty
    }
    delete req.store.shelfCheckout
    res.redirect(`${base(res)}${P}/shoppingcart/`)
  })
  const shelfOnly = (req, res, next) => foreignLines(req) ? next('route') : shelfLines(req).length ? next() : res.redirect(`${base(res)}${P}/shoppingcart/`)
  router.get(`${P}/checkout/`, shelfOnly, (req, res) => render(req, res, 'Checkout', checkoutBody(req, base(res), { fulfillment: 'delivery', ...(req.store.shelfCheckout?.details || {}) })))
  router.post(`${P}/checkout/place/`, (req, res, next) => {
    const done = req.store.shelfCompleted
    if (done && text(req.body?.checkout_token) === done.token && findOrder(req, done.number)) return res.redirect(`${base(res)}${P}/checkout/confirmation/${done.number}/`)
    next()
  }, shelfOnly, (req, res) => {
    const values = Object.fromEntries(FIELDS.map(k => [k, text(req.body?.[k])]))
    req.store.shelfCheckout ||= {}
    const errors = []
    if (text(req.body.checkout_token) && text(req.body.checkout_token) !== req.store.shelfCheckout.token) errors.push('Your bag changed. Please review your order and place it again.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.push('Enter a valid email address.')
    const phone = values.phone.replace(/\D/g, '').replace(/^1(?=\d{10}$)/, '')
    if (phone.length !== 10) errors.push('Enter a 10-digit US phone number.')
    const method = values.fulfillment === 'pickup' ? 'pickup' : values.fulfillment === 'delivery' ? 'delivery' : ''
    if (!method) errors.push('Choose delivery or Click & Collect.')
    if (method === 'pickup' && !PICKUP_STORES.includes(values.pickup_store)) errors.push('Select a store for Click & Collect.')
    if (!values.first_name || !values.last_name) errors.push('Enter your first and last name.')
    if (!values.address || !values.city) errors.push('Enter your street address and city.')
    if (!STATES.includes(values.state)) errors.push('Select a state.')
    if (!/^\d{5}(?:-\d{4})?$/.test(values.postal_code)) errors.push('Enter a valid 5-digit ZIP code.')
    if (!values.card_name) errors.push('Enter the name on the card.')
    const card = validateCard({ number: text(req.body.card_number), expiry: values.card_expiry, cvv: text(req.body.card_cvv) })
    if (!card.ok) errors.push(...Object.values(card.errors))
    req.store.shelfCheckout.details = values
    if (errors.length) return render(req, res, 'Checkout', checkoutBody(req, base(res), values, errors), 400)
    const items = purchaseLines(req), t = totals(items, method)
    const address = { line1: values.address, line2: values.address2 || undefined, city: values.city, state: values.state, postal_code: values.postal_code, country: 'US' }
    const order = recordOrder({ store: 'ikea', order_number: String(randomInt(1000000000, 2000000000)), session: req.session, items,
      customer: { email: values.email, first_name: values.first_name, last_name: values.last_name, phone, ...(req.store.user?.id ? { account_id: req.store.user.id } : {}) },
      fulfillment: method === 'pickup' ? { method: 'pickup', option: 'click_and_collect', store_location: values.pickup_store } : { method: 'ship', option: items.some(i => isLarge(shelfBySku(i.sku))) ? 'truck_delivery' : 'parcel_delivery' },
      shipping_address: method === 'pickup' ? null : address, billing_address: address,
      payment: { method: 'card', brand: card.brand, last4: card.last4, name_on_card: values.card_name },
      totals: t, currency: 'USD', meta: { catalog: 'ikea-shelf' } })
    req.store.shelfCompleted = { number: order.order_number, token: req.store.shelfCheckout.token }
    const bought = new Set(items.map(i => i.sku))
    req.store.cart = req.store.cart.filter(l => !bought.has(l.sku))
    delete req.store.shelfCheckout
    res.redirect(`${base(res)}${P}/checkout/confirmation/${order.order_number}/`)
  })
  router.get(`${P}/checkout/confirmation/:number/`, (req, res, next) => {
    const order = findOrder(req, req.params.number)
    if (!order) return next()
    const b = base(res)
    render(req, res, 'Thank you for your order', `<section class="iks-thanks"><p class="ik-eyebrow">Hej ${esc(order.customer.first_name)}!</p><h1>Thank you for your order</h1><p>Your order number is <strong>${esc(order.order_number)}</strong>. We sent a confirmation to ${esc(order.customer.email)}.</p></section><div class="iks-checkout"><section class="iks-panel"><h2>${order.fulfillment.method === 'pickup' ? 'Click &amp; Collect' : 'Delivery'}</h2>${order.fulfillment.method === 'pickup' ? `<p>${esc(order.fulfillment.store_location)}</p><p>We’ll let you know when your order is ready to pick up.</p>` : `<p>${esc(order.customer.first_name)} ${esc(order.customer.last_name)}<br>${esc(order.shipping_address.line1)}${order.shipping_address.line2 ? `, ${esc(order.shipping_address.line2)}` : ''}<br>${esc(order.shipping_address.city)}, ${esc(order.shipping_address.state)} ${esc(order.shipping_address.postal_code)}</p><p>${order.fulfillment.option === 'truck_delivery' ? 'Truck delivery' : 'Parcel delivery'} · We’ll contact you to confirm a delivery date.</p>`}<h2>Payment</h2><p>${esc(order.payment.brand)} ending in ${esc(order.payment.last4)}</p></section><aside class="iks-summary"><h2>Your order</h2>${order.items.map(i => `<p data-product-kind="other">${esc(i.title)} · Qty ${i.qty} · ${usd(i.qty * i.unit_price)}</p>`).join('')}${summary(order.totals, order.fulfillment.method === 'pickup' ? 'pickup' : 'delivery')}</aside></div><p><a class="ik-btn" href="${b}/">Continue shopping</a> <a class="ik-btn ik-btn-secondary" href="${b}${P}/customer-service/track-manage-order/">Track and manage your order</a></p>`)
  })
}
