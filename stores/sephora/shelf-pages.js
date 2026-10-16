// Reference-mode Sephora pages for the assortment (shelf.js): product cards and rows, listing
// grids with filters/sort/paging, product detail pages, the basket, checkout and order
// confirmation. Orders are recorded as kind: 'other' lines; nothing here touches GTA 6 evidence.
import { randomBytes } from 'node:crypto'
import { esc } from '../../lib/html.js'
import { validateCard } from '../../lib/payment.js'
import { recordOrder, getOrder, listOrders } from '../../lib/orders.js'
import { CATEGORIES } from './site-data.js'
import { products, skuIndex, findByPathId, brandSlug, money, refine, PRICE_RANGES, SORTS, COLLECTIONS, saleProducts, variantImage, shortReviews } from './shelf.js'
import { renderArt } from './shelf-art.js'

const a = (base, path, label, cls = '') => `<a${cls ? ` class="${cls}"` : ''} href="${esc(base + path)}">${esc(label)}</a>`
const str = v => typeof v === 'string' ? v.trim() : ''
const crumbs = (base, trail) => `<nav class="sx-crumbs" aria-label="Breadcrumb">${trail.map(([l, p], i) => i === trail.length - 1 || !p ? `<span>${esc(l)}</span>` : a(base, p, l)).join('<span aria-hidden="true">›</span>')}</nav>`
export const stars = (p, count = true) => `<span class="sx-stars" aria-label="${p.rating} stars"><span style="width:${p.ratingPercent}%"></span></span>${count ? ` <span class="sx-reviews">${esc(p.reviewDisplay)}</span>` : ''}`
const priceHtml = p => p.was ? `<span class="sx-sale">${esc(p.priceDisplay)}</span> <s>${money(p.was)}</s>` : esc(p.priceDisplay)

export const shelfCard = (base, p) => `<article class="sx-card" data-product-id="${esc(p.id)}" data-sku="${esc(p.variants[0].sku)}" data-assortment="sephora"><a href="${esc(base + p.path)}"><span class="sx-card-img"><img src="${esc(base + p.image)}" alt="${esc(p.alt)}" loading="lazy" width="400" height="400"></span>${p.badge ? `<span class="sx-badge${p.badge === 'SALE' ? ' sx-badge-sale' : ''}">${esc(p.badge)}</span>` : ''}<strong>${esc(p.brand)}</strong><span class="sx-card-title">${esc(p.name)}</span></a>${p.shades && p.variants.length > 1 ? `<span class="sx-card-colors">${p.variants.length} colors</span>` : ''}<span class="sx-card-rating">${stars(p)}</span><span class="sx-card-price">${priceHtml(p)}</span></article>`
export const shelfRow = (base, title, list, more, attrs = '') => `<section class="sx-row"${attrs}><div class="sx-row-head"><h2>${esc(title)}</h2>${more ? a(base, more[1], more[0]) : ''}</div><div class="sx-carousel">${list.map(p => shelfCard(base, p)).join('')}</div></section>`

// ---------- listing grid (category, brand, collection and search pages) ----------
const LISTING_KEYS = ['keyword', 'category', 'brand', 'price', 'rating', 'pref', 'sortBy', 'currentPage']
export function listingUrl(base, path, query, changes = {}) {
  const params = new URLSearchParams()
  const next = { ...Object.fromEntries(LISTING_KEYS.map(k => [k, str(query[k])])), currentPage: '', ...changes }
  for (const k of LISTING_KEYS) if (next[k]) params.set(k, next[k])
  return `${base}${path}${params.size ? `?${params}` : ''}`
}
export function listing(base, path, list, query, { heading = '', showBrandFacet = true } = {}) {
  const r = refine(list, query)
  const link = changes => esc(listingUrl(base, path, query, changes))
  const brands = [...new Set(list.map(p => p.brand))].sort((x, y) => x.localeCompare(y))
  const selectedBrands = str(query.brand).split(',').filter(Boolean)
  const toggleBrand = slug => (selectedBrands.includes(slug) ? selectedBrands.filter(s => s !== slug) : [...selectedBrands, slug]).join(',')
  const check = (on, href, text, count) => `<a class="sx-check${on ? ' on' : ''}" href="${href}" aria-pressed="${on}"><span aria-hidden="true"></span>${esc(text)}${count !== undefined ? ` <small>(${count})</small>` : ''}</a>`
  const prefs = [['new', 'New'], ['sale', 'Sale'], ['exclusive', 'Only at Sephora'], ['clean', 'Clean at Sephora'], ['vegan', 'Vegan'], ['mini', 'Mini Size'], ['limited', 'Limited Edition']]
    .map(([v, l]) => [v, l, list.filter(p => v === 'sale' ? p.was : v === 'exclusive' ? p.flags.has('excl') : p.flags.has(v)).length]).filter(([, , n]) => n)
  const filters = `<div class="sx-filters" aria-label="Filters">
    ${showBrandFacet && brands.length > 1 ? `<details${selectedBrands.length ? ' open' : ''}><summary>Brand</summary><div class="sx-facet-list">${brands.map(b => check(selectedBrands.includes(brandSlug(b)), link({ brand: toggleBrand(brandSlug(b)) }), b, list.filter(p => p.brand === b).length)).join('')}</div></details>` : ''}
    <details${str(query.price) ? ' open' : ''}><summary>Price Range</summary>${PRICE_RANGES.map(([v, l]) => check(str(query.price) === v, link({ price: str(query.price) === v ? '' : v }), l)).join('')}</details>
    <details${str(query.rating) ? ' open' : ''}><summary>Rating</summary>${[['4', '4 stars & up'], ['4.5', '4.5 stars & up']].map(([v, l]) => check(str(query.rating) === v, link({ rating: str(query.rating) === v ? '' : v }), l)).join('')}</details>
    ${prefs.length ? `<details${str(query.pref) ? ' open' : ''}><summary>Shopping Preferences</summary>${prefs.map(([v, l, n]) => check(str(query.pref) === v, link({ pref: str(query.pref) === v ? '' : v }), l, n)).join('')}</details>` : ''}
    ${['brand', 'price', 'rating', 'pref'].some(k => str(query[k])) ? `<a class="sx-clear" href="${link({ brand: '', price: '', rating: '', pref: '' })}">Clear all</a>` : ''}</div>`
  const chips = [...selectedBrands.map(s => [brands.find(b => brandSlug(b) === s) || s, { brand: toggleBrand(s) }]), ...(str(query.price) ? [[PRICE_RANGES.find(p => p[0] === str(query.price))?.[1] || str(query.price), { price: '' }]] : []), ...(str(query.rating) ? [[`${str(query.rating)} stars & up`, { rating: '' }]] : []), ...(str(query.pref) ? [[prefs.find(p => p[0] === str(query.pref))?.[1] || str(query.pref), { pref: '' }]] : [])]
  const sort = `<form action="${esc(base + path)}" method="get" class="sx-sort">${LISTING_KEYS.filter(k => !['sortBy', 'currentPage'].includes(k) && str(query[k])).map(k => `<input type="hidden" name="${k}" value="${esc(str(query[k]))}">`).join('')}<label for="sx-sort">Sort by:</label><select id="sx-sort" name="sortBy" data-auto-submit>${SORTS.map(([v, l]) => `<option value="${v}"${str(query.sortBy) === v ? ' selected' : ''}>${l}</option>`).join('')}</select><button class="sx-btn sx-btn-small">Apply</button></form>`
  const pager = r.pages > 1 ? `<nav class="sx-pager" aria-label="Pagination">${r.page > 1 ? `<a href="${link({ currentPage: String(r.page - 1), sortBy: str(query.sortBy) })}" aria-label="Previous page">‹</a>` : ''}${Array.from({ length: r.pages }, (_, i) => i + 1).map(n => n === r.page ? `<strong aria-current="page">${n}</strong>` : `<a href="${link({ currentPage: String(n), sortBy: str(query.sortBy) })}">${n}</a>`).join('')}${r.page < r.pages ? `<a href="${link({ currentPage: String(r.page + 1), sortBy: str(query.sortBy) })}" aria-label="Next page">›</a>` : ''}</nav>` : ''
  const from = r.total ? (r.page - 1) * 60 + 1 : 0
  return { filters, html: `<div class="sx-toolbar"><p class="sx-count" data-result-count="${r.total}">${heading || `${r.total} Results`}</p>${sort}</div>${chips.length ? `<div class="sx-chips sx-active">${chips.map(([l, ch]) => `<a href="${link(ch)}">${esc(l)} ✕</a>`).join('')}</div>` : ''}${r.items.length ? `<div class="sx-grid" data-assortment-grid>${r.items.map(p => shelfCard(base, p)).join('')}</div>` : `<div class="sx-empty"><p class="sx-count">No products match these filters.</p><p><a href="${link({ brand: '', price: '', rating: '', pref: '' })}">Clear all filters</a></p></div>`}<p class="sx-showing">Showing ${from}–${from + r.items.length - 1 < from ? 0 : from + r.items.length - 1} of ${r.total} results</p>${pager}`, result: r }
}

export function collectionListing(base, path, h1, intro, list, query) {
  const view = listing(base, path, list, query)
  return `${crumbs(base, [['Home', '/'], [h1]])}<div class="sx-cat-layout"><aside class="sx-side"><h2>${esc(h1)}</h2>${[['Makeup', 'makeup-cosmetics'], ['Skincare', 'skincare'], ['Hair', 'hair-products'], ['Fragrance', 'fragrance'], ['Tools & Brushes', 'makeup-tools'], ['Bath & Body', 'bath-body']].map(([l, s]) => a(base, `/shop/${s}`, l)).join('')}<h3>Filters</h3>${view.filters}</aside><div class="sx-cat-main"><h1>${esc(h1)}</h1><p class="sx-intro">${esc(intro)}</p>${view.html}</div></div>`
}

export function searchPage(base, query, list, label) {
  const view = listing(base, '/search', list, query, { heading: `${refine(list, query).total} Results for <strong>"${esc(label)}"</strong>` })
  const depts = [...new Set(list.map(p => p.dept))]
  return `<div class="sx-cat-layout sx-search-page"><aside class="sx-side"><h1 class="sx-search-h1">Search Results</h1>${depts.map(d => `<span class="sx-side-dept">${esc(CATEGORIES[d]?.title || d)} (${list.filter(p => p.dept === d).length})</span>`).join('')}<h3>Filters</h3>${view.filters}</aside><div class="sx-cat-main">${view.html}</div></div>`
}

// ---------- product detail ----------
const ABOUT = {
  'foundation-makeup': ['A buildable foundation that evens skin tone and blurs imperfections while letting skin look like skin.', 'Shake well. Apply with fingertips, a brush or a damp sponge, starting at the center of the face and blending outward.'],
  'face-makeup': ['A complexion essential that perfects, sets or sculpts for a smooth, long-wearing finish.', 'Apply where needed and blend with a brush, sponge or fingertips. Build in thin layers.'],
  'cheek-makeup': ['A blendable cheek color that gives a healthy, natural-looking flush that lasts all day.', 'Dab a small amount onto the cheeks and blend upward. Build for more intensity.'],
  'lips-makeup': ['A lip formula that delivers rich color and a comfortable feel with long-lasting wear.', 'Apply directly to lips. Line lips first for added definition and longer wear.'],
  'lip-treatments': ['A nourishing lip treatment that hydrates, softens and protects dry lips.', 'Apply generously to lips as needed, or as a final step in your nighttime routine.'],
  mascara: ['A mascara that lifts, lengthens and volumizes lashes without clumping or flaking.', 'Wiggle the wand from the base of the lashes to the tips. Apply a second coat while wet for more drama.'],
  'eye-makeup': ['An eye essential for defined, long-wearing color and shape.', 'Apply in short strokes and blend or set as desired.'],
  'makeup-palettes': ['A curated palette of blendable, highly pigmented shades for everyday to evening looks.', 'Apply lighter shades to the lid, deeper shades to the crease and outer corner, and blend.'],
  'moisturizing-cream-oils-mists': ['A daily moisturizer that delivers lasting hydration and supports a healthy-looking skin barrier.', 'Apply morning and night to clean skin after serums.'],
  cleanser: ['A gentle face cleanser that removes makeup, sunscreen and impurities without stripping skin.', 'Massage onto damp skin, then rinse with warm water. Use morning and night.'],
  'face-serum': ['A targeted serum that addresses dullness, texture and visible signs of aging.', 'Apply a few drops to clean skin before moisturizer.'],
  'facial-treatments': ['A treatment step that exfoliates, refines and preps skin for the rest of your routine.', 'Apply to clean skin with a cotton pad or hands, avoiding the eye area.'],
  'face-mask': ['A mask that gives skin an instant boost of hydration, clarity or glow.', 'Apply an even layer to clean skin. Leave on as directed, then rinse or massage in.'],
  'eye-treatment-dark-circle-treatment': ['An eye treatment that targets puffiness, dark circles and fine lines.', 'Gently pat a small amount around the orbital bone morning and night.'],
  'sunscreen-sun-protection': ['A broad-spectrum sunscreen that protects against UVA/UVB rays with a weightless finish.', 'Apply liberally 15 minutes before sun exposure. Reapply at least every two hours.'],
}
const ABOUT_DEPT = {
  'hair-products': ['A hair essential that repairs, protects and styles for healthier-looking hair.', 'Apply to clean, damp or dry hair as directed and style as usual.'],
  fragrance: ['A signature scent with long-lasting, layered notes.', 'Spray onto pulse points, such as the wrists and neck.'],
  'bath-body': ['A body care essential that leaves skin soft, smooth and delicately scented.', 'Apply to clean skin, focusing on dry areas.'],
  'makeup-tools': ['A high-performance tool designed for salon-quality results at home.', 'Use as directed in the included instructions.'],
}
const TOOL_ABOUT = ['A high-performance tool designed for professional-quality results at home.', 'Use as directed in the included instructions. Clean regularly.']
const INGREDIENTS = {
  skincare: 'Water/Aqua/Eau, Glycerin, Butylene Glycol, Niacinamide, Sodium Hyaluronate, Squalane, Caprylic/Capric Triglyceride, Panthenol, Ceramide NP, Tocopherol, Phenoxyethanol, Ethylhexylglycerin.',
  'makeup-cosmetics': 'Dimethicone, Isododecane, Talc, Mica, Trimethylsiloxysilicate, Glycerin, Tocopheryl Acetate, Phenoxyethanol. May Contain/+/-: Titanium Dioxide (CI 77891), Iron Oxides (CI 77491, CI 77492, CI 77499), Red 7 Lake (CI 15850).',
  'hair-products': 'Water/Aqua/Eau, Cetearyl Alcohol, Behentrimonium Chloride, Glycerin, Argania Spinosa Kernel Oil, Hydrolyzed Keratin, Panthenol, Fragrance/Parfum, Citric Acid.',
  fragrance: 'Alcohol Denat., Parfum/Fragrance, Aqua/Water/Eau, Limonene, Linalool, Coumarin, Benzyl Salicylate, Citronellol, Geraniol.',
  'bath-body': 'Water/Aqua/Eau, Glycerin, Butyrospermum Parkii (Shea) Butter, Cocos Nucifera (Coconut) Oil, Cetearyl Alcohol, Fragrance/Parfum, Tocopherol.',
}
const TOOLS = new Set(['makeup-brushes', 'hair-styling-tools', 'skin-care-tools', 'hair-brushes', 'hair-clips-hair-bands', 'makeup-tools'])
const histogram = p => {
  const five = Math.round(p.reviews * Math.min(0.85, Math.max(0.35, (p.rating - 3.4) / 1.6)))
  const rest = p.reviews - five, four = Math.round(rest * 0.5), three = Math.round(rest * 0.22), two = Math.round(rest * 0.12)
  return [[5, five], [4, four], [3, three], [2, two], [1, rest - four - three - two]]
}

export function productPage(base, p, sku, notice = '') {
  const v = p.variants.find(x => x.sku === sku) || p.variants[0]
  const cat = CATEGORIES[p.sub], dept = CATEGORIES[p.dept]
  const [what, how] = TOOLS.has(p.sub) ? TOOL_ABOUT : ABOUT[p.sub] || ABOUT_DEPT[p.dept] || ABOUT_DEPT['bath-body']
  const highlights = [p.flags.has('clean') && 'Clean at Sephora', p.flags.has('vegan') && 'Vegan', p.flags.has('excl') && 'Only at Sephora', p.flags.has('new') && 'New', p.flags.has('limited') && 'Limited Edition', p.flags.has('mini') && 'Mini Size Available', p.dept === 'skincare' && 'Good for: Dryness', p.dept === 'fragrance' && 'Long-Lasting', 'Cruelty-Free'].filter(Boolean)
  const similar = products.filter(x => x.sub === p.sub && x.id !== p.id).slice(0, 12)
  const brandMore = products.filter(x => x.brand === p.brand && x.id !== p.id).slice(0, 12)
  const optionLabel = p.shades ? 'Color' : 'Size'
  const href = x => esc(`${base}${p.path}?skuId=${x.sku}`)
  const hist = histogram(p)
  return `${crumbs(base, [['Home', '/'], [dept?.title || 'Shop', `/shop/${p.dept}`], ...(cat && cat !== dept ? [[cat.title, `/shop/${p.sub}`]] : [])])}
  <section class="sx-pdp" data-product-id="${esc(p.id)}" data-product-kind="other" data-assortment="sephora">
    <div class="sx-pdp-gallery"><div class="sx-pdp-thumbs"><img src="${esc(base + variantImage(v.sku))}" alt="" width="64" height="64"></div><img class="sx-pdp-main" src="${esc(base + variantImage(v.sku))}" alt="${esc(`${p.brand} ${p.name}${p.shades ? ` in ${v.label}` : ''}`)}" width="400" height="400"></div>
    <div class="sx-pdp-info">
      ${p.badge ? `<span class="sx-badge sx-badge-inline">${esc(p.badge)}</span>` : ''}
      <p class="sx-pdp-brand">${a(base, `/brand/${brandSlug(p.brand)}`, p.brand)}</p>
      <h1>${esc(p.name)}</h1>
      <p class="sx-pdp-rating">${stars(p, false)} <a href="#reviews">${esc(p.reviews.toLocaleString('en-US'))} reviews</a> · <a href="#questions">Ask a question</a></p>
      <p class="sx-pdp-price">${p.was ? `<span class="sx-sale">${money(v.price)}</span> <s>${money(p.was)}</s>` : money(v.price)}</p>
      <p class="sx-pdp-afterpay">or 4 payments of ${money(v.price / 4)} with Klarna or Afterpay</p>
      ${notice ? `<p class="sx-alert" role="alert">${esc(notice)}</p>` : ''}
      <p class="sx-pdp-meta">${p.shades ? `Size ${esc(p.size)} · ` : ''}ITEM ${esc(v.sku)}</p>
      ${p.variants.length > 1 ? `<fieldset class="sx-options"><legend>${optionLabel}: <strong>${esc(v.label)}</strong>${v.desc ? ` - ${esc(v.desc)}` : ''}</legend><div class="${p.shades ? 'sx-swatches' : 'sx-sizes'}">${p.variants.map(x => p.shades
        ? `<a class="sx-swatch${x.sku === v.sku ? ' on' : ''}" href="${href(x)}" title="${esc(x.label)}${x.desc ? ` - ${esc(x.desc)}` : ''}" aria-label="${esc(x.label)}"${x.sku === v.sku ? ' aria-current="true"' : ''}><span style="background:${esc(x.hex)}"></span></a>`
        : `<a class="sx-size${x.sku === v.sku ? ' on' : ''}" href="${href(x)}"${x.sku === v.sku ? ' aria-current="true"' : ''}>${esc(x.label)}<small>${money(x.price)}</small></a>`).join('')}</div></fieldset>` : `<p class="sx-pdp-meta">Size: ${esc(v.size)}</p>`}
      <form class="sx-add" method="post" action="${esc(base)}/basket/add"><input type="hidden" name="productId" value="${esc(p.id)}"><input type="hidden" name="skuId" value="${esc(v.sku)}">
        <div class="sx-fulfil-options" role="radiogroup" aria-label="Delivery options">
          <label class="sx-fulfil-opt"><input type="radio" name="fulfillment" value="ship" checked><span><strong>Get It Shipped</strong><small>Free standard shipping for Beauty Insiders, or on orders of $50+</small></span></label>
          <label class="sx-fulfil-opt sx-disabled"><input type="radio" name="fulfillment" value="pickup" disabled><span><strong>Buy Online and Pick Up</strong><small>${a(base, '/happening/stores/sephora-near-me', 'Choose a store')} to see availability</small></span></label>
          <label class="sx-fulfil-opt sx-disabled"><input type="radio" name="fulfillment" value="sameday" disabled><span><strong>Same-Day Delivery</strong><small>${a(base, '/location', 'Set your ZIP code')} to see availability</small></span></label>
        </div>
        <div class="sx-add-row"><label for="sx-qty" class="sr-only">Quantity</label><select id="sx-qty" name="qty">${Array.from({ length: 10 }, (_, i) => `<option${i === 0 ? ' selected' : ''}>${i + 1}</option>`).join('')}</select><button class="sx-btn sx-add-btn" type="submit">Add to Basket</button></div>
      </form>
      <p class="sx-pdp-points">Beauty Insiders earn ${Math.floor(v.price)} points on this item. ${a(base, '/profile/BeautyInsider', 'Learn more')}</p>
      <div class="sx-highlights"><h2>Highlights</h2><ul>${highlights.map(h => `<li>${esc(h)}</li>`).join('')}</ul></div>
    </div>
  </section>
  <section class="sx-pdp-extra">
    <details class="sx-acc" open><summary><h2>About the Product</h2></summary><p><strong>What it is:</strong> ${esc(what)}</p><p><strong>Size:</strong> ${esc(v.size || p.size)}</p></details>
    <details class="sx-acc"><summary><h2>Ingredients</h2></summary><p>${esc(TOOLS.has(p.sub) || p.flags.has('set') ? 'See individual product packaging for ingredient lists.' : INGREDIENTS[p.dept] || INGREDIENTS.skincare)}</p><p>Ingredient lists are subject to change; refer to the product packaging for the most up-to-date list.</p></details>
    <details class="sx-acc"><summary><h2>How to Use</h2></summary><p>${esc(how)}</p></details>
    <details class="sx-acc"><summary><h2>Shipping &amp; Returns</h2></summary><p>Free standard shipping for Beauty Insiders. Returns accepted within 30 days of purchase. ${a(base, '/beauty/returns-exchanges', 'See return policy')}</p></details>
  </section>
  <section class="sx-reviews-summary" id="reviews"><h2>Ratings &amp; Reviews (${esc(shortReviews(p.reviews))})</h2><div class="sx-rr"><div class="sx-rr-score"><strong>${p.rating.toFixed(1)}</strong>${stars(p, false)}<span>${esc(p.reviews.toLocaleString('en-US'))} Reviews</span><span>${Math.round(70 + (p.rating - 4) * 40)}% of customers recommend this product</span></div><dl class="sx-hist">${hist.map(([n, c]) => `<dt>${n} ★</dt><dd><span style="width:${(c / p.reviews * 100).toFixed(1)}%"></span></dd><dd class="sx-hist-n">${c.toLocaleString('en-US')}</dd>`).join('')}</dl></div><p class="sx-note">Bought this product? ${a(base, '/login', 'Sign in')} to write a review.</p></section>
  <section class="sx-questions" id="questions"><h2>Questions &amp; Answers</h2><p class="sx-note">Have a question about this product? ${a(base, '/login', 'Sign in')} to ask the Beauty Insider Community.</p></section>
  ${brandMore.length ? shelfRow(base, `More from ${p.brand}`, brandMore, [`Shop all ${p.brand}`, `/brand/${brandSlug(p.brand)}`]) : ''}
  ${similar.length ? shelfRow(base, 'Similar Products', similar, cat ? [`Shop ${cat.title}`, `/shop/${p.sub}`] : null) : ''}`
}

// ---------- basket, checkout, confirmation ----------
export const basketLines = state => (Array.isArray(state.basket) ? state.basket : []).flatMap(line => {
  const hit = skuIndex.get(line.sku)
  return hit && Number.isInteger(line.qty) && line.qty > 0 ? [{ ...hit, qty: line.qty }] : []
})
export const basketCount = state => basketLines(state).reduce((n, l) => n + l.qty, 0)
const round = n => Math.round(n * 100) / 100
export function basketTotals(state) {
  const subtotal = round(basketLines(state).reduce((s, l) => s + l.variant.price * l.qty, 0))
  const shipping = state.user || subtotal >= 50 ? 0 : 6.95
  return { subtotal, shipping, tax: 0, total: round(subtotal + shipping) }
}
const lineTitle = ({ product, variant }) => `${product.brand} - ${product.name}${product.variants.length > 1 ? ` (${product.shades ? 'Color' : 'Size'}: ${variant.label})` : ''}`
const summary = (state, t, taxTbd = false) => `<dl class="sx-summary"><dt>Merchandise Subtotal</dt><dd>${money(t.subtotal)}</dd><dt>Shipping &amp; Handling</dt><dd>${t.shipping ? money(t.shipping) : 'FREE'}</dd><dt>Estimated Tax</dt><dd>${taxTbd ? 'TBD' : money(t.tax)}</dd><dt class="sx-total">Estimated Total</dt><dd class="sx-total">${money(t.total)}</dd></dl>${!state.user && t.subtotal < 50 ? `<p class="sx-note">You're ${money(50 - t.subtotal)} away from free shipping, or sign in for free standard shipping.</p>` : ''}`

export function basketPage(base, state, error = '', suggestions = []) {
  const lines = basketLines(state), t = basketTotals(state)
  const items = lines.map(l => `<article class="sx-line" data-sku="${esc(l.variant.sku)}"><a href="${esc(`${base}${l.product.path}?skuId=${l.variant.sku}`)}"><img src="${esc(base + variantImage(l.variant.sku))}" alt="${esc(l.product.alt)}" width="96" height="96"></a><div><strong>${esc(l.product.brand)}</strong><p>${a(base, `${l.product.path}?skuId=${l.variant.sku}`, l.product.name)}</p><p class="sx-note">ITEM ${esc(l.variant.sku)}${l.product.variants.length > 1 ? ` · ${l.product.shades ? 'Color' : 'Size'}: ${esc(l.variant.label)}` : ` · Size: ${esc(l.variant.size)}`}</p><form method="post" action="${esc(base)}/basket/update" class="sx-line-form"><input type="hidden" name="skuId" value="${esc(l.variant.sku)}"><label for="q-${esc(l.variant.sku)}" class="sr-only">Quantity</label><select id="q-${esc(l.variant.sku)}" name="qty">${Array.from({ length: 10 }, (_, i) => `<option${i + 1 === l.qty ? ' selected' : ''}>${i + 1}</option>`).join('')}</select><button class="sx-btn sx-btn-small sx-btn-outline" name="action" value="update">Update</button><button class="sx-link" name="action" value="remove">Remove</button></form></div><p class="sx-line-price">${money(l.variant.price * l.qty)}</p></article>`).join('')
  return `<h1>Basket <span class="sx-count-inline">(${basketCount(state)})</span></h1>${error ? `<p class="sx-alert" role="alert">${esc(error)}</p>` : ''}<div class="sx-basket"><section class="sx-panel sx-basket-items"><h2>Get It Shipped (${basketCount(state)})</h2>${lines.length ? items : `<p class="sx-count">Your basket is currently empty.</p><p>${a(base, '/beauty/new-beauty-products', 'Shop New Arrivals', 'sx-btn')}</p>`}</section><aside class="sx-panel">${lines.length ? `${summary(state, t, true)}<p>${a(base, '/checkout', 'Checkout Shipped Items', 'sx-btn sx-btn-block')}</p>` : ''}${state.user ? `<h2>Beauty Insider</h2><p>Signed in as ${esc(state.user.email)}. You get FREE standard shipping.</p>` : `<h2>Sign in for FREE Shipping</h2><p>Beauty Insiders get free standard shipping on every order.</p>${a(base, '/login', 'Sign In', 'sx-btn sx-btn-outline')}`}</aside></div>${suggestions.length ? shelfRow(base, 'You May Also Like', suggestions, null) : ''}`
}

const FIELDS = [['email', 'Email Address', 'email', 'email'], ['first_name', 'First Name', 'text', 'given-name'], ['last_name', 'Last Name', 'text', 'family-name'], ['address', 'Street Address', 'text', 'address-line1'], ['city', 'City', 'text', 'address-level2'], ['state', 'State', 'text', 'address-level1'], ['postal_code', 'ZIP Code', 'text', 'postal-code'], ['phone', 'Phone', 'tel', 'tel']]
export function checkoutPage(base, state, values = {}, error = '') {
  const t = basketTotals(state), lines = basketLines(state)
  const field = ([k, l, type, ac]) => `<div class="sx-field sx-f-${k}"><label for="co-${k}">${l}${k === 'phone' ? ' (optional)' : ''}</label><input id="co-${k}" name="${k}" type="${type}" autocomplete="${ac}" value="${esc(values[k] || '')}"${k === 'state' ? ' placeholder="e.g. CA"' : ''}${k === 'phone' ? '' : ' required'}></div>`
  return `<h1>Checkout</h1>${state.user ? '' : `<p class="sx-checkout-guest">Checking out as a guest. ${a(base, '/login', 'Sign in')} to use your saved addresses and get FREE standard shipping.</p>`}${error ? `<p class="sx-alert" role="alert">${esc(error)}</p>` : ''}<div class="sx-basket"><form class="sx-form sx-checkout" method="post" action="${esc(base)}/checkout"><input type="hidden" name="checkout_token" value="${esc(state.checkout?.sephoraToken || '')}">
    <section class="sx-panel"><h2>1. Shipping Address</h2>${FIELDS.map(field).join('')}</section>
    <section class="sx-panel"><h2>2. Delivery Method</h2><label class="sx-fulfil-opt"><input type="radio" name="shipping_method" value="standard" checked><span><strong>Standard Shipping</strong><small>${t.shipping ? money(t.shipping) : 'FREE'} · Estimated delivery in 3–5 business days</small></span></label></section>
    <section class="sx-panel"><h2>3. Payment</h2><p class="sx-pay-cards" aria-label="We accept Visa, Mastercard, American Express and Discover"><span>VISA</span><span>Mastercard</span><span>AMEX</span><span>DISCOVER</span></p><div class="sx-field sx-f-card_name"><label for="co-card_name">Name on Card</label><input id="co-card_name" name="card_name" autocomplete="cc-name" value="${esc(values.card_name || '')}" required></div><div class="sx-field sx-f-card_number"><label for="co-card_number">Card Number</label><input id="co-card_number" name="card_number" inputmode="numeric" autocomplete="cc-number" required></div><div class="sx-field sx-f-card_expiry"><label for="co-card_expiry">Expiration Date (MM/YY)</label><input id="co-card_expiry" name="card_expiry" autocomplete="cc-exp" placeholder="MM/YY" value="${esc(values.card_expiry || '')}" required></div><div class="sx-field sx-f-card_cvv"><label for="co-card_cvv">Security Code</label><input id="co-card_cvv" name="card_cvv" inputmode="numeric" autocomplete="cc-csc" required></div></section>
    <button class="sx-btn sx-btn-block" type="submit">Place Order</button><p class="sx-note">By placing your order you agree to Sephora's ${a(base, '/beauty/terms-of-use', 'Terms of Use')} and ${a(base, '/beauty/privacy-policy', 'Privacy Policy')}.</p></form>
    <aside class="sx-panel sx-co-summary"><h2>Order Summary</h2>${lines.map(l => `<p class="sx-sum-line sx-sum-item"><img src="${esc(base + variantImage(l.variant.sku))}" alt="" width="56" height="56"><span>${esc(lineTitle(l))} × ${l.qty}</span><strong>${money(l.variant.price * l.qty)}</strong></p>`).join('')}${summary(state, t)}<p>${a(base, '/basket', 'Edit Basket')}</p></aside></div>`
}

const addBusinessDays = (date, n) => { const d = new Date(date); while (n > 0) { d.setDate(d.getDate() + 1); if (d.getDay() % 6) n-- } return d }
const shortDate = d => d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
const CARD_NAMES = { visa: 'Visa', mastercard: 'Mastercard', amex: 'American Express', discover: 'Discover' }
export function confirmationPage(base, order) {
  const placed = new Date(order.created_at || Date.now())
  const eta = `${shortDate(addBusinessDays(placed, 3))} – ${shortDate(addBusinessDays(placed, 5))}`
  const pay = order.payment || {}
  const brand = CARD_NAMES[String(pay.brand || '').toLowerCase()] || (pay.brand ? String(pay.brand) : 'Card')
  const points = Math.floor(order.totals.subtotal)
  return `<section class="sx-confirm" data-order-number="${esc(order.order_number)}"><h1>Thank you for your order!</h1><p>Your order number is <strong>${esc(order.order_number)}</strong>. A confirmation email will be sent to ${esc(order.customer.email)}.</p>
  <div class="sx-confirm-grid"><div class="sx-panel"><h2>Get It Shipped</h2><p class="sx-confirm-eta"><strong>Estimated delivery: ${esc(eta)}</strong><br>Standard Shipping</p>${order.items.map(i => `<div class="sx-sum-line sx-sum-item">${i.sku && skuIndex.has(String(i.sku)) ? `<img src="${esc(base + variantImage(String(i.sku)))}" alt="" width="64" height="64">` : ''}<span>${esc(i.title)}<small>Qty ${i.qty}</small></span><strong>${money(i.unit_price * i.qty)}</strong></div>`).join('')}
  <dl class="sx-dl sx-confirm-details"><dt>Ship to</dt><dd>${esc(`${order.customer.first_name || ''} ${order.customer.last_name || ''}`.trim())}<br>${esc(order.shipping_address.line1)}<br>${esc(order.shipping_address.city)}, ${esc(order.shipping_address.state)} ${esc(order.shipping_address.postal_code)}</dd><dt>Payment</dt><dd>${esc(brand)}${pay.last4 ? ` ending in ${esc(pay.last4)}` : ''}</dd></dl></div>
  <aside class="sx-panel"><h2>Order Summary</h2><dl class="sx-summary"><dt>Merchandise Subtotal</dt><dd>${money(order.totals.subtotal)}</dd><dt>Shipping &amp; Handling</dt><dd>${order.totals.shipping ? money(order.totals.shipping) : 'FREE'}</dd><dt>Tax</dt><dd>${money(order.totals.tax)}</dd><dt class="sx-total">Order Total</dt><dd class="sx-total">${money(order.totals.total)}</dd></dl><p class="sx-confirm-points">${order.customer.guest ? `Join Beauty Insider to earn <strong>${points} points</strong> on orders like this one. ${a(base, '/registration', 'Join now')}` : `You earned <strong>${points} Beauty Insider points</strong> with this order.`}</p></aside></div>
  <p>${a(base, '/profile/MyAccount/Orders', 'View Order Status', 'sx-btn')} ${a(base, '/', 'Continue Shopping', 'sx-btn sx-btn-outline')}</p></section>
  ${shelfRow(base, 'You May Also Like', products.filter(p => p.reviews > 9000 && !order.items.some(i => skuIndex.get(String(i.sku))?.product === p)).slice(0, 12), null)}`
}

export function sessionOrders(session) {
  return listOrders({ store: 'sephora' }).filter(o => o.session_id && o.session_id === session?.id)
}

// ---------- routes ----------
export function installShelf(router, { render, baseOf }) {
  router.get('/productimages/sku/:file', (req, res, next) => {
    const m = /^s(\d{7})-main-zoom\.svg$/.exec(req.params.file)
    const hit = m && skuIndex.get(m[1])
    if (!hit) return next()
    res.set('Cache-Control', 'public, max-age=3600').type('image/svg+xml').send(renderArt(hit.product, hit.variant))
  })
  for (const [slug, [h1, intro, test]] of Object.entries(COLLECTIONS)) {
    router.get(`/beauty/${slug}`, (req, res) => render(req, res, h1, collectionListing(baseOf(res), `/beauty/${slug}`, h1, intro, products.filter(test), req.query)))
  }
  router.get('/sale', (req, res) => render(req, res, 'Sale', collectionListing(baseOf(res), '/sale', 'Sale', 'Limited-time markdowns on makeup, skincare, hair and fragrance.', saleProducts(), req.query)))
  router.get('/basket', (req, res) => render(req, res, 'Basket', basketPage(baseOf(res), req.store, '', products.filter(p => p.reviews > 9000).slice(0, 12))))
  router.post('/basket/add', (req, res) => {
    const base = baseOf(res), sku = str(req.body?.skuId), hit = skuIndex.get(sku)
    const qty = /^\d+$/.test(str(req.body?.qty || '1')) ? Number(str(req.body?.qty || '1')) : NaN
    if (!hit || (req.body?.productId !== undefined && str(req.body.productId) !== hit.product.id)) return render(req, res, 'Basket', basketPage(base, req.store, 'This item is not available. Choose a product and color or size from its product page.'), 400)
    req.store.basket = Array.isArray(req.store.basket) ? req.store.basket : []
    const line = req.store.basket.find(l => l.sku === sku)
    if (!Number.isInteger(qty) || qty < 1 || qty + (line?.qty || 0) > 10) return render(req, res, 'Basket', basketPage(base, req.store, 'You can add up to 10 of each item to your basket.'), 400)
    if (line) line.qty += qty
    else req.store.basket.push({ sku, qty })
    res.redirect(303, `${base}/basket`)
  })
  router.post('/basket/update', (req, res) => {
    const base = baseOf(res), sku = str(req.body?.skuId)
    const basket = Array.isArray(req.store.basket) ? req.store.basket : []
    const line = basket.find(l => l.sku === sku)
    if (!line) return render(req, res, 'Basket', basketPage(base, req.store, 'This item is not in your basket.'), 400)
    if (str(req.body?.action) === 'remove') req.store.basket = basket.filter(l => l !== line)
    else {
      const qty = /^\d+$/.test(str(req.body?.qty)) ? Number(str(req.body.qty)) : NaN
      if (!Number.isInteger(qty) || qty < 1 || qty > 10) return render(req, res, 'Basket', basketPage(base, req.store, 'Choose a quantity from 1 to 10.'), 400)
      line.qty = qty
    }
    res.redirect(303, `${base}/basket`)
  })
  router.get('/checkout', (req, res) => {
    const base = baseOf(res)
    if (!basketLines(req.store).length) return res.redirect(303, `${base}/basket`)
    req.store.checkout = { ...(req.store.checkout || {}), sephoraToken: randomBytes(12).toString('hex') }
    const u = req.store.user
    render(req, res, 'Checkout', checkoutPage(base, req.store, u ? { email: u.email, first_name: u.first_name, last_name: u.last_name, postal_code: req.store.location || '' } : { postal_code: req.store.location || '' }))
  })
  // Only an assortment basket can be checked out here; anything else falls through to the
  // reference store's "Purchase is not verified" 409 handler, unchanged.
  router.post('/checkout', (req, res, next) => {
    const lines = basketLines(req.store)
    if (!lines.length) return next()
    const base = baseOf(res)
    const values = Object.fromEntries([...FIELDS.map(f => f[0]), 'card_name', 'card_expiry'].map(k => [k, str(req.body?.[k])]))
    const token = req.store.checkout?.sephoraToken
    if (token && str(req.body?.checkout_token) && str(req.body.checkout_token) !== token) return render(req, res, 'Checkout', checkoutPage(base, req.store, values, 'Your basket changed. Review your order and enter your payment details again.'), 409)
    const errors = []
    for (const [k, l] of FIELDS) if (k !== 'phone' && !values[k]) errors.push(`Enter your ${l.toLowerCase().replace(' (2-letter)', '')}.`)
    if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.push('Enter a valid email address.')
    if (values.state && !/^[A-Za-z]{2}$/.test(values.state)) errors.push('Use a two-letter state code.')
    if (values.postal_code && !/^\d{5}(?:-\d{4})?$/.test(values.postal_code)) errors.push('Enter a valid ZIP code.')
    if (!values.card_name) errors.push('Enter the name on your card.')
    const card = validateCard({ number: str(req.body?.card_number).replace(/\s+/g, ''), expiry: values.card_expiry, cvv: str(req.body?.card_cvv) })
    if (!card.ok) errors.push(...Object.values(card.errors))
    if (errors.length) return render(req, res, 'Checkout', checkoutPage(base, req.store, values, errors.join(' ')), 400)
    const address = { line1: values.address, city: values.city, state: values.state.toUpperCase(), postal_code: values.postal_code, country: 'US' }
    const order = recordOrder({
      store: 'sephora', order_number: String(50000000000 + Number.parseInt(randomBytes(5).toString('hex'), 16) % 49999999999), session: req.session,
      items: lines.map(l => ({ kind: 'other', title: lineTitle(l), qty: l.qty, unit_price: l.variant.price, sku: l.variant.sku })),
      customer: { email: values.email.toLowerCase(), first_name: values.first_name, last_name: values.last_name, ...(values.phone ? { phone: values.phone } : {}), guest: !req.store.user, ...(req.store.user?.id ? { account_id: req.store.user.id } : {}) },
      fulfillment: { method: 'ship', option: 'standard' }, shipping_address: address, billing_address: { ...address },
      payment: { method: 'card', brand: card.brand, last4: card.last4, name_on_card: values.card_name },
      totals: basketTotals(req.store), currency: 'USD',
      meta: { gta6_available: false, catalog: 'assortment', account_id: req.store.user?.id || null, product_ids: lines.map(l => l.product.id) },
    })
    req.store.basket = []
    req.store.checkout = {}
    res.redirect(303, `${base}/checkout/confirmation?orderId=${order.order_number}`)
  })
  router.get('/checkout/confirmation', (req, res, next) => {
    const order = getOrder(str(req.query.orderId))
    if (!order || order.store !== 'sephora' || order.session_id !== req.session?.id) return next()
    render(req, res, 'Order Confirmation', confirmationPage(baseOf(res), order))
  })
}
