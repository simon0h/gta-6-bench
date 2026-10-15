// Product cards, listings, product pages, cart and checkout for the Chewy
// reference-mode assortment (shelf.js). Every purchase here is recorded as a
// kind:'other' order line: Chewy sells pet supplies, never GTA 6.
import { randomInt, randomBytes } from 'node:crypto'
import { esc, money, publicNotice } from '../../lib/html.js'
import { recordOrder } from '../../lib/orders.js'
import { validateCard } from '../../lib/payment.js'
import { SHELF, SHELF_BY_ID, autoshipPrice, priceOf, FILTER_FIELDS, applyListing } from './shelf.js'
import { shelfArt } from './shelf-art.js'
import { CATEGORIES, DOG_MENU, CAT_MENU, OTHER_ANIMALS_MENU, PHARMACY_MENU, idOf } from './reference-data.js'
import { PHONE } from './reference-layout.js'

const str = v => (typeof v === 'string' ? v.trim() : '')
const imgUrl = (base, p, view = 0) => `${base}/product-images/${p.id}/${view}.svg`
const stars = r => `<span class="cw-stars" style="--r:${(r / 5 * 100).toFixed(0)}%" aria-hidden="true">★★★★★</span>`
const rating = p => `<span class="cw-rating">${stars(p.rating)}<span class="cw-sr">${p.rating} out of 5 stars</span> <span class="cw-review-count">${p.reviews.toLocaleString('en-US')}</span></span>`

export function productCard(base, p) {
  const badge = p.rx ? '<span class="cw-badge cw-badge-rx">Rx</span>' : p.list ? '<span class="cw-badge cw-badge-deal">Deal</span>' : p.isNew ? '<span class="cw-badge cw-badge-new">New</span>' : ''
  return `<article class="cw-card-product" data-shelf-product="${esc(p.id)}" data-product-kind="other"><a href="${base}${esc(p.path)}"><span class="cw-card-img"><img src="${imgUrl(base, p)}" alt="${esc(p.title)}" width="300" height="300" loading="lazy">${badge}</span><span class="cw-card-title">${esc(p.title)}</span></a>${rating(p)}<p class="cw-card-price"><strong>${money(p.price)}</strong>${p.list ? ` <s>${money(p.list)}</s>` : ''}</p>${p.autoship ? `<p class="cw-card-autoship">${money(autoshipPrice(p.price))} <span>Autoship</span></p>` : ''}</article>`
}
export const productRow = (base, title, list, more) => list.length ? `<section class="cw-section cw-row"><div class="cw-row-head"><h2>${esc(title)}</h2>${more ? `<a href="${base}${more}">Shop all</a>` : ''}</div><div class="cw-carousel">${list.map(p => productCard(base, p)).join('')}</div></section>` : ''

// ── Listing: filters, results bar, grid and pagination ───────────────────
const qs = (query, patch) => { const u = new URLSearchParams(); for (const [k, v] of Object.entries({ ...query, ...patch })) if (typeof v === 'string' && v !== '' && v !== undefined) u.set(k, v); const s = u.toString(); return s ? `?${s}` : '' }
export function listingFilters(base, path, req, groups, list, entry, hidden = {}) {
  const linkGroups = groups.filter(g => g === 'Category' || g === 'Product Category')
  const fieldGroups = [...new Set([...groups.filter(g => FILTER_FIELDS[g]), 'Brand', 'Price', 'Customer Rating'])]
  const keep = Object.entries(hidden).map(([k, v]) => `<input type="hidden" name="${esc(k)}" value="${esc(v)}">`).join('')
  const sort = str(req.query.sort)
  const cats = (entry?.tiles || []).slice(0, 10)
  return `<form class="cw-filters" id="cw-filters" method="get" action="${base}${path}"><h2>Filter</h2>${keep}${sort ? `<input type="hidden" name="sort" value="${esc(sort)}">` : ''}${linkGroups.length && cats.length ? `<details class="cw-filter" open><summary>${esc(linkGroups[0])}</summary><ul class="cw-filter-links">${cats.map(([l, p]) => `<li><a href="${base}${p}">${esc(l)}</a></li>`).join('')}</ul></details>` : ''}${fieldGroups.map(name => {
    const f = FILTER_FIELDS[name], chosen = str(req.query[f.key]), opts = f.values(list)
    if (!opts.length) return ''
    const count = v => list.filter(p => f.test(p, v)).length
    return `<details class="cw-filter"${chosen || ['Brand', 'Price'].includes(name) ? ' open' : ''}><summary>${esc(name)}</summary><fieldset><legend class="cw-sr">${esc(name)}</legend>${opts.slice(0, name === 'Brand' ? 14 : 8).map(o => `<label><input type="radio" name="${f.key}" value="${esc(o)}"${chosen === o ? ' checked' : ''}> ${esc(o)} <span class="cw-muted">(${count(o)})</span></label>`).join('')}</fieldset></details>`
  }).join('')}<button class="cw-btn" type="submit">Apply filters</button> <a href="${base}${path}${qs(hidden, {})}">Clear all</a></form>`
}
export function listingResults(base, path, req, list, label, hidden = {}) {
  const r = applyListing(list, req.query)
  const SORTS = ['Relevance', 'Newest', 'Bestselling', 'Price: Low to High', 'Price: High to Low', 'Avg. Customer Review', 'Most Reviewed']
  const chosen = Object.values(FILTER_FIELDS).map(f => [f.key, str(req.query[f.key])]).filter(([, v]) => v)
  const from = r.total ? (r.page - 1) * 36 + 1 : 0, to = Math.min(r.total, r.page * 36)
  const pager = r.pages > 1 ? `<nav class="cw-pager" aria-label="Pagination">${r.page > 1 ? `<a href="${base}${path}${qs(req.query, { page: String(r.page - 1) })}" rel="prev">‹ Previous</a>` : ''}${Array.from({ length: r.pages }, (_, i) => i + 1).map(n => n === r.page ? `<span aria-current="page">${n}</span>` : `<a href="${base}${path}${qs(req.query, { page: String(n) })}">${n}</a>`).join('')}${r.page < r.pages ? `<a href="${base}${path}${qs(req.query, { page: String(r.page + 1) })}" rel="next">Next ›</a>` : ''}</nav>` : ''
  return `<section class="cw-results" aria-label="${esc(label)} results"><div class="cw-results-bar"><p class="cw-results-count" data-result-count="${r.total}">${r.total ? `${from}–${to} of ${r.total} Results` : '0 Results'}</p><label for="cw-sort">Sort By</label><select id="cw-sort" name="sort" form="cw-filters">${SORTS.map(s => `<option${s === r.sort ? ' selected' : ''}>${esc(s)}</option>`).join('')}</select><button class="cw-btn cw-btn-outline" form="cw-filters" type="submit">Sort</button></div>${chosen.length ? `<p class="cw-chips">${chosen.map(([k, v]) => `<a href="${base}${path}${qs(req.query, { [k]: '', page: '' })}">${esc(v)} ✕</a>`).join('')} <a href="${base}${path}${qs(hidden, {})}">Clear all</a></p>` : ''}${r.items.length ? `<div class="cw-grid">${r.items.map(p => productCard(base, p)).join('')}</div>` : `<div class="cw-empty"><h2>No products match these filters.</h2><p><a href="${base}${path}${qs(hidden, {})}">Clear all filters</a></p></div>`}${pager}</section>`
}

// ── Product page ─────────────────────────────────────────────────────────
const defaultSize = p => p.sizes ? (p.sizes.find(s => s.price === p.price && p.title.includes(s.label)) || p.sizes.find(s => s.price === p.price) || p.sizes.at(-1)).label : ''
function about(p) {
  const c = p.cats
  if (c.has('332') || c.has('387')) return [`Complete and balanced nutrition formulated for ${p.lifestage === 'Puppy' ? 'growing puppies' : p.lifestage === 'Kitten' ? 'growing kittens' : p.lifestage === 'Senior' ? 'senior pets' : `adult ${(p.pet || 'pet').toLowerCase()}s`}.`, 'Real meat, fish or poultry protein supports strong muscles.', 'Made with guaranteed levels of vitamins, minerals and omega fatty acids for skin and coat health.', 'Transition gradually over 7–10 days when switching foods.']
  if (c.has('411')) return ['Locks in odors and forms firm clumps for easy scooping.', 'Low-dust formula helps keep your home and your cat’s paws clean.', 'Pour 3–4 inches into a clean litter box; scoop daily and top off as needed.']
  if (c.has('335') || c.has('391')) return ['A tasty reward your pet will look forward to.', 'Feed as a treat alongside a complete and balanced diet.', 'Always provide fresh, clean water; supervise your pet while treating.']
  if (c.has('315') || c.has('326') || c.has('1066') || c.has('970')) return ['Designed for interactive play and enrichment.', 'Inspect regularly and replace if damaged.', 'Choose the right size for your pet; supervise during play.']
  if (p.rx) return ['Prescription item: Chewy contacts your veterinarian to approve this prescription before it ships.', 'Give exactly as directed by your veterinarian.', `Licensed pharmacists are available 24/7 at ${PHONE}.`]
  if (c.has('372') || c.has('415') || c.has('1691')) return ['Veterinarian-recommended brand for everyday health support.', 'Follow label directions for your pet’s weight and species.', 'Consult your veterinarian if your pet is pregnant, nursing or on medication.']
  return ['Built for everyday use by pet parents.', 'Check product dimensions and your pet’s size before ordering.', 'Backed by Chewy’s 365-day satisfaction guarantee on most items.']
}
function crumbsFor(base, p) {
  const leaf = CATEGORIES.get(p.cat)
  const trail = [...(leaf?.crumbs || []), leaf ? [leaf.h1, catPath(p.cat)] : null].filter(Boolean)
  return `<nav class="cw-crumbs" aria-label="Breadcrumb"><ol><li><a href="${base}/">Chewy</a></li>${trail.map(([l, path]) => `<li><a href="${base}${path}">${esc(l)}</a></li>`).join('')}<li aria-current="page">${esc(p.title.split(',')[0])}</li></ol></nav>`
}
const CAT_PATH = new Map()
for (const g of [...DOG_MENU, ...CAT_MENU, ...OTHER_ANIMALS_MENU, ...PHARMACY_MENU]) { for (const x of [g, ...g.items]) { const id = idOf(x.path); if (id && !CAT_PATH.has(id)) CAT_PATH.set(id, x.path) } }
const catPath = id => CAT_PATH.get(String(id)) || '/b/dog-288'

export function productPage(base, req, p, { error = '' } = {}) {
  const size = p.sizes?.find(s => s.label === str(req.query.size))?.label || defaultSize(p)
  const price = priceOf(p, size), auto = autoshipPrice(price)
  const view = Math.min(2, Math.max(0, Number.parseInt(req.query.view, 10) || 0))
  const dist = [5, 4, 3, 2, 1].map(s => { const w = Math.max(1, Math.round(100 * Math.exp(-Math.abs(p.rating - s) * 1.6))); return [s, w] })
  const sum = dist.reduce((a, [, w]) => a + w, 0)
  const similar = SHELF.filter(x => x.cat === p.cat && x.id !== p.id).concat(SHELF.filter(x => x.cat !== p.cat && x.pet === p.pet && [...x.cats].some(c => p.cats.has(c) && CATEGORIES.get(c)?.kind === 'category'))).slice(0, 10)
  const specs = [['Item Number', p.id], ['Brand', p.brand], ['Pet', p.pet], ['Category', p.catLabel], ['Lifestage', p.lifestage], ['Food Form', p.foodForm], ['Breed Size', p.breedSize], ['Size', size || null], ['Prescription Item', p.rx ? 'Yes' : null], ['Autoship', p.autoship ? 'Eligible' : 'Not eligible']].filter(([, v]) => v)
  return `${crumbsFor(base, p)}<div class="cw-pdp cw-pdp-product" data-shelf-product="${esc(p.id)}" data-product-kind="other">
<section class="cw-pdp-gallery" aria-label="Product images"><div class="cw-pdp-stage"><img src="${imgUrl(base, p, view)}" alt="${esc(p.title)}" width="600" height="600"></div><div class="cw-pdp-thumbs">${[0, 1, 2].map(i => `<a href="${base}${p.path}${qs({ size: size && p.sizes ? size : '', view: i ? String(i) : '' }, {})}"${i === view ? ' aria-current="true"' : ''}><img src="${imgUrl(base, p, i)}" alt="${['Front of package', 'Back of package', 'Close-up'][i]}" width="72" height="72" loading="lazy"></a>`).join('')}</div></section>
<section class="cw-pdp-buy"><p class="cw-muted">By <a href="${base}/s?query=${encodeURIComponent(p.brand)}">${esc(p.brand)}</a></p><h1>${esc(p.title)}</h1><p>${rating(p)} <a href="#reviews">${p.reviews.toLocaleString('en-US')} Reviews</a></p>${p.rx ? `<p class="cw-rx-note"><strong>Rx</strong> Prescription required. We’ll contact your vet to approve this prescription after you order.</p>` : ''}
${error ? `<p class="cw-error" role="alert">${esc(error)}</p>` : ''}
<form class="cw-buy-form" method="post" action="${base}/app/cart/add"><input type="hidden" name="id" value="${esc(p.id)}">
${p.sizes ? `<fieldset class="cw-size"><legend>Size: <strong>${esc(size)}</strong></legend><div class="cw-size-opts">${p.sizes.map(s => `<label><input type="radio" name="size" value="${esc(s.label)}"${s.label === size ? ' checked' : ''}><span>${esc(s.label)}<small>${money(s.price)}</small></span></label>`).join('')}</div></fieldset>` : ''}
<fieldset class="cw-purchase-type"><legend class="cw-sr">Purchase option</legend>${p.autoship ? `<label class="cw-ptype"><input type="radio" name="purchase" value="autoship"><span><strong>Autoship &amp; Save</strong> <b>${money(auto)}</b><small>Save 5% on this item and 35% on your first Autoship order (up to $20). Change or cancel anytime.</small></span></label>` : ''}<label class="cw-ptype"><input type="radio" name="purchase" value="buyonce" checked><span><strong>Buy once</strong> <b>${money(price)}</b>${p.list && !p.sizes ? `<small><s>${money(p.list)}</s> List Price · Save ${money(p.list - p.price)}</small>` : ''}</span></label></fieldset>
<div class="cw-qty-row"><label for="pdp-qty">Quantity</label><select id="pdp-qty" name="qty">${Array.from({ length: 12 }, (_, i) => `<option${i === 0 ? ' selected' : ''}>${i + 1}</option>`).join('')}</select><button class="cw-btn cw-btn-cart" type="submit">Add to Cart</button></div></form>
<div class="cw-delivery"><p><strong>FREE 1-3 day delivery</strong> on orders $49+</p><p>In stock · Ships from Chewy</p><p class="cw-muted">Free returns on most items within 365 days.</p></div></section></div>
<section class="cw-section cw-pdp-details"><h2>At a Glance</h2><ul>${about(p).slice(0, 2).map(t => `<li>${esc(t)}</li>`).join('')}</ul><h2>About This Item</h2><ul>${about(p).map(t => `<li>${esc(t)}</li>`).join('')}</ul><h2>Specifications</h2><table class="cw-specs"><tbody>${specs.map(([k, v]) => `<tr><th scope="row">${esc(k)}</th><td>${esc(v)}</td></tr>`).join('')}</tbody></table></section>
<section class="cw-section cw-reviews" id="reviews"><h2>Customer Reviews</h2><div class="cw-review-summary"><p class="cw-review-score"><strong>${p.rating.toFixed(1)}</strong> out of 5</p><p>${stars(p.rating)}</p><p>${p.reviews.toLocaleString('en-US')} Reviews</p><table class="cw-review-bars"><tbody>${dist.map(([s, w]) => `<tr><th scope="row">${s} Star</th><td><span style="width:${Math.round(w / sum * 100)}%"></span></td><td>${Math.round(w / sum * 100)}%</td></tr>`).join('')}</tbody></table></div></section>
${productRow(base, 'Compare Similar Items', similar)}`
}

// ── Cart ─────────────────────────────────────────────────────────────────
const lines = req => (Array.isArray(req.store.cart) ? req.store.cart : []).filter(l => l && l.chewy_shelf && SHELF_BY_ID.has(l.id))
export const cartCount = req => lines(req).reduce((n, l) => n + l.qty, 0)
function priced(req) {
  const out = lines(req).map((l, i) => { const p = SHELF_BY_ID.get(l.id), base = priceOf(p, l.size); const unit = l.purchase === 'autoship' ? autoshipPrice(base) : base; return { l, i, p, unit, total: Math.round(unit * l.qty * 100) / 100 } })
  const subtotal = Math.round(out.reduce((s, x) => s + x.total, 0) * 100) / 100
  const shipping = subtotal >= 49 || subtotal === 0 ? 0 : 4.95
  const tax = Math.round(subtotal * 0.07 * 100) / 100
  return { items: out, subtotal, shipping, tax, total: Math.round((subtotal + shipping + tax) * 100) / 100 }
}
const summary = t => `<dl class="cw-totals"><div><dt>Item Subtotal</dt><dd>${money(t.subtotal)}</dd></div><div><dt>Shipping</dt><dd>${t.shipping ? money(t.shipping) : 'FREE'}</dd></div><div><dt>Estimated Tax</dt><dd>${money(t.tax)}</dd></div><div class="cw-total"><dt>Order Total</dt><dd>${money(t.total)}</dd></div></dl>`

export function cartPage(base, req) {
  const t = priced(req)
  if (!t.items.length) return null
  const toFree = Math.max(0, 49 - t.subtotal)
  return `<h1 class="cw-page-title">Cart (${cartCount(req)} item${cartCount(req) === 1 ? '' : 's'})</h1><div class="cw-cart-layout"><section aria-label="Items in your cart">${toFree ? `<p class="cw-ship-meter">You’re <strong>${money(toFree)}</strong> away from FREE 1-3 day shipping.</p>` : '<p class="cw-ship-meter cw-ship-ok">Your order qualifies for <strong>FREE 1-3 day shipping</strong>.</p>'}${t.items.map(({ l, i, p, unit, total }) => `<article class="cw-cart-line" data-shelf-product="${esc(p.id)}"><a href="${base}${p.path}"><img src="${imgUrl(base, p)}" alt="" width="110" height="110"></a><div><h2><a href="${base}${p.path}">${esc(p.title)}</a></h2>${l.size ? `<p class="cw-muted">Size: ${esc(l.size)}</p>` : ''}<p>${l.purchase === 'autoship' ? '<strong>Autoship</strong> · every 4 weeks' : 'Buy once'}${p.rx ? ' · <span class="cw-badge cw-badge-rx">Rx</span> vet approval required' : ''}</p><form method="post" action="${base}/app/cart/update" class="cw-line-form"><input type="hidden" name="line" value="${i}"><label for="qty-${i}">Qty</label><select id="qty-${i}" name="qty">${Array.from({ length: 13 }, (_, n) => `<option value="${n}"${n === l.qty ? ' selected' : ''}>${n === 0 ? '0 (Remove)' : n}</option>`).join('')}</select><button class="cw-btn cw-btn-outline" type="submit">Update</button></form><form method="post" action="${base}/app/cart/remove" class="cw-line-form"><input type="hidden" name="line" value="${i}"><button class="cw-linkbtn" type="submit">Remove</button></form></div><p class="cw-line-price"><strong>${money(total)}</strong>${l.qty > 1 ? `<small>${money(unit)} each</small>` : ''}</p></article>`).join('')}</section><aside class="cw-cart-summary"><h2>Order Summary</h2>${summary(t)}<a class="cw-btn cw-btn-block cw-btn-checkout" href="${base}/app/checkout">Proceed to Checkout</a><p class="cw-muted">Shipping and tax are finalized at checkout.</p></aside></div>`
}

export function addToCart(req, body) {
  const p = SHELF_BY_ID.get(str(body?.id))
  if (!p) return { error: 'unknown' }
  const qty = Number.parseInt(str(body?.qty) || '1', 10)
  if (!Number.isInteger(qty) || qty < 1 || qty > 12) return { error: 'Please choose a quantity from 1 to 12.', p }
  let size = str(body?.size)
  if (p.sizes) { if (!size) size = defaultSize(p); if (!p.sizes.some(s => s.label === size)) return { error: 'Please select a size.', p } } else size = ''
  const purchase = str(body?.purchase) === 'autoship' && p.autoship ? 'autoship' : 'buyonce'
  if (!Array.isArray(req.store.cart)) req.store.cart = []
  const existing = req.store.cart.find(l => l?.chewy_shelf && l.id === p.id && l.size === size && l.purchase === purchase)
  if (existing) existing.qty = Math.min(12, existing.qty + qty)
  else req.store.cart.push({ chewy_shelf: true, id: p.id, size, purchase, qty })
  return { p }
}
export function updateLine(req, body, remove = false) {
  const own = lines(req), idx = Number.parseInt(str(body?.line), 10)
  const target = own[idx]
  if (!target) return false
  const qty = remove ? 0 : Number.parseInt(str(body?.qty), 10)
  if (!Number.isInteger(qty) || qty < 0 || qty > 12) return false
  if (qty === 0) req.store.cart = req.store.cart.filter(l => l !== target)
  else target.qty = qty
  return true
}

// ── Checkout (sign-in required, like chewy.com) ─────────────────────────
const STATES = 'AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY'.split(' ')
export function checkoutPage(base, req, { values = {}, errors = {}, error = '' } = {}) {
  const t = priced(req), user = req.store.user
  if (!req.store.checkout || typeof req.store.checkout !== 'object') req.store.checkout = {}
  const token = req.store.checkout.chewy_token ||= randomBytes(12).toString('hex')
  const v = k => esc(values[k] ?? (k === 'first_name' ? user?.first_name : k === 'last_name' ? user?.last_name : k === 'email' ? user?.email : '') ?? '')
  const field = (id, lbl, ac, extra = '') => `<div class="cw-field${errors[id] ? ' cw-field-error' : ''}"><label for="co-${id}">${lbl}</label><input id="co-${id}" name="${id}" autocomplete="${ac}" value="${v(id)}" ${extra}${errors[id] ? ` aria-describedby="err-${id}" aria-invalid="true"` : ''}>${errors[id] ? `<p class="cw-error" id="err-${id}">${esc(errors[id])}</p>` : ''}</div>`
  const rx = t.items.some(x => x.p.rx)
  return `<h1 class="cw-page-title">Checkout</h1>${error ? `<p class="cw-error" role="alert">${esc(error)}</p>` : ''}<form class="cw-checkout" method="post" action="${base}/app/checkout" novalidate><input type="hidden" name="checkout_token" value="${esc(token)}"><div class="cw-checkout-main">
<section class="cw-co-step"><h2>1. Shipping Address</h2><div class="cw-field-grid">${field('first_name', 'First Name', 'given-name')}${field('last_name', 'Last Name', 'family-name')}${field('address', 'Street Address', 'address-line1')}${field('address2', 'Apt, Suite, etc. (optional)', 'address-line2')}${field('city', 'City', 'address-level2')}<div class="cw-field${errors.state ? ' cw-field-error' : ''}"><label for="co-state">State</label><select id="co-state" name="state" autocomplete="address-level1"><option value="">Select</option>${STATES.map(s => `<option${values.state === s ? ' selected' : ''}>${s}</option>`).join('')}</select>${errors.state ? `<p class="cw-error">${esc(errors.state)}</p>` : ''}</div>${field('postal_code', 'ZIP Code', 'postal-code', 'inputmode="numeric"')}${field('phone', 'Phone Number', 'tel', 'type="tel"')}${field('email', 'Email Address', 'email', 'type="email"')}</div></section>
${rx ? `<section class="cw-co-step"><h2>2. Pet &amp; Vet Information</h2><p class="cw-muted">Your order contains prescription items. Chewy contacts your vet to approve them before they ship.</p><div class="cw-field-grid">${field('pet_name', 'Pet’s Name', 'off')}${field('vet_clinic', 'Vet Clinic Name', 'off')}${field('vet_phone', 'Vet Clinic Phone', 'off', 'type="tel"')}</div></section>` : ''}
<section class="cw-co-step"><h2>${rx ? 3 : 2}. Payment Method</h2><div class="cw-field-grid">${field('card_name', 'Name on Card', 'cc-name')}${field('card_number', 'Card Number', 'cc-number', 'inputmode="numeric"')}${field('card_expiry', 'Expiration Date (MM/YY)', 'cc-exp', 'placeholder="MM/YY"')}${field('card_cvv', 'Security Code', 'cc-csc', 'inputmode="numeric"')}</div>${publicNotice('<p class="cw-muted">This is not the real Chewy website: no card is charged and no real order is placed.</p>')}</section>
<section class="cw-co-step"><h2>${rx ? 4 : 3}. Review Items</h2>${t.items.map(({ l, p, total }) => `<div class="cw-co-item"><img src="${imgUrl(base, p)}" alt="" width="64" height="64"><p>${esc(p.title)}${l.size ? ` <span class="cw-muted">(${esc(l.size)})</span>` : ''}<br><span class="cw-muted">Qty ${l.qty} · ${l.purchase === 'autoship' ? 'Autoship' : 'Buy once'}</span></p><strong>${money(total)}</strong></div>`).join('')}<p class="cw-muted">Standard shipping: arrives in 1-3 business days.</p></section></div>
<aside class="cw-cart-summary"><h2>Order Summary</h2>${summary(t)}<button class="cw-btn cw-btn-block cw-btn-checkout" type="submit">Place Order</button><p class="cw-muted">By placing your order, you agree to Chewy’s <a href="${base}/app/content/terms-of-use">Terms of Use</a> and <a href="${base}/app/content/privacy">Privacy Policy</a>.</p></aside></form>`
}

export function placeOrder(req, body) {
  const t = priced(req)
  if (!t.items.length) return { empty: true }
  const values = Object.fromEntries(['first_name', 'last_name', 'address', 'address2', 'city', 'state', 'postal_code', 'phone', 'email', 'pet_name', 'vet_clinic', 'vet_phone', 'card_name'].map(k => [k, str(body?.[k])]))
  const errors = {}
  const need = (k, msg) => { if (!values[k]) errors[k] = msg }
  need('first_name', 'Please enter a first name.'); need('last_name', 'Please enter a last name.'); need('address', 'Please enter a street address.'); need('city', 'Please enter a city.')
  if (!STATES.includes(values.state)) errors.state = 'Please select a state.'
  if (!/^\d{5}(-\d{4})?$/.test(values.postal_code)) errors.postal_code = 'Please enter a valid ZIP code.'
  if (values.phone.replace(/\D/g, '').length !== 10) errors.phone = 'Please enter a 10-digit phone number.'
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(values.email)) errors.email = 'Please enter a valid email address.'
  if (t.items.some(x => x.p.rx)) { need('pet_name', 'Please enter your pet’s name.'); need('vet_clinic', 'Please enter your vet clinic.'); if (values.vet_phone.replace(/\D/g, '').length !== 10) errors.vet_phone = 'Please enter your vet’s 10-digit phone number.' }
  need('card_name', 'Please enter the name on the card.')
  const card = validateCard({ number: str(body?.card_number), expiry: str(body?.card_expiry), cvv: str(body?.card_cvv) })
  if (!card.ok) { if (card.errors.number) errors.card_number = card.errors.number; if (card.errors.expiry) errors.card_expiry = card.errors.expiry; if (card.errors.cvv) errors.card_cvv = card.errors.cvv }
  if (str(body?.checkout_token) !== req.store.checkout?.chewy_token) return { values, errors, error: 'Your checkout session expired. Please review your order and try again.' }
  if (Object.keys(errors).length) return { values, errors, error: 'Please correct the highlighted fields.' }
  const order_number = String(randomInt(1000000000, 9999999999))
  const order = recordOrder({
    store: 'chewy', order_number, session: req.session,
    items: t.items.map(({ l, p, unit }) => ({ kind: 'other', title: l.size && !p.title.includes(l.size) ? `${p.title} (${l.size})` : p.title, qty: l.qty, unit_price: unit, sku: p.id })),
    customer: { email: values.email, first_name: values.first_name, last_name: values.last_name, phone: values.phone, account_id: req.store.user?.id ?? null },
    fulfillment: { method: 'ship', option: 'standard', eta: '1-3 business days' },
    shipping_address: { line1: values.address, line2: values.address2 || undefined, city: values.city, state: values.state, postal_code: values.postal_code, country: 'US' },
    billing_address: null,
    payment: { method: 'card', brand: card.brand, last4: card.last4, name_on_card: values.card_name },
    totals: { subtotal: t.subtotal, shipping: t.shipping, tax: t.tax, total: t.total }, currency: 'USD',
    meta: { autoship_lines: t.items.filter(x => x.l.purchase === 'autoship').map(x => x.p.id), ...(t.items.some(x => x.p.rx) ? { pet_name: values.pet_name, vet_clinic: values.vet_clinic } : {}) },
  })
  req.store.cart = (req.store.cart || []).filter(l => !l?.chewy_shelf)
  req.store.checkout = {}
  req.store.chewyOrders = [...(req.store.chewyOrders || []), { order_number, created_at: order.created_at, total: t.total, items: t.items.map(({ l, p, total }) => ({ id: p.id, title: p.title, size: l.size, qty: l.qty, total, purchase: l.purchase })), ship_to: `${values.first_name} ${values.last_name}, ${values.city}, ${values.state} ${values.postal_code}`, card: `${card.brand} ending in ${card.last4}` }]
  return { order_number }
}
export function confirmationPage(base, o) {
  return `<section class="cw-confirm"><h1>Thanks for your order!</h1><p>Order number: <strong data-order-number>${esc(o.order_number)}</strong></p><p>We’ve sent a confirmation email. Most orders arrive in 1-3 business days.</p><h2>Order Summary</h2>${o.items.map(i => `<div class="cw-co-item"><p>${esc(i.title)}${i.size ? ` <span class="cw-muted">(${esc(i.size)})</span>` : ''}<br><span class="cw-muted">Qty ${i.qty} · ${i.purchase === 'autoship' ? 'Autoship' : 'Buy once'}</span></p><strong>${money(i.total)}</strong></div>`).join('')}<p><strong>Order Total: ${money(o.total)}</strong></p><p class="cw-muted">Ship to ${esc(o.ship_to)} · Paid with ${esc(o.card)}</p><p><a class="cw-btn" href="${base}/app/account/orderhistory">View Your Orders</a> <a class="cw-btn cw-btn-outline" href="${base}/">Continue Shopping</a></p></section>`
}
export const orderHistory = (base, req) => (req.store.chewyOrders || []).slice().reverse().map(o => `<article class="cw-order-card"><h2>Order #${esc(o.order_number)}</h2><p class="cw-muted">Placed ${esc(new Date(o.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }))} · ${money(o.total)}</p><ul>${o.items.map(i => `<li>${esc(i.title)} × ${i.qty}</li>`).join('')}</ul><a href="${base}/app/checkout/confirmation/${esc(o.order_number)}">View order details</a></article>`).join('')

export { shelfArt }
