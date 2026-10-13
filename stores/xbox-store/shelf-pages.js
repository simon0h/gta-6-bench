// Microsoft Store device page (microsoft.com/en-us/d/<slug>/<id>) for the consoles and accessories in shelf.js:
// gallery, rating, price, configuration options, add to cart, delivery and returns, tech specs, ratings summary.
import { esc, money } from '../../lib/html.js'
import { CATALOG, productPath, isBuyable } from './data.js'
import { shelfGallery, shelfImage } from './shelf-art.js'

const stars = rating => { const n = Math.round(Number(rating) || 0); return `<span class="xh-stars" role="img" aria-label="${esc(rating)} out of 5 stars">${'★'.repeat(n)}${'☆'.repeat(5 - n)}</span>` }
const countOf = s => { const m = /^([\d.]+)(K?)$/.exec(String(s || '')); return m ? Math.round(Number(m[1]) * (m[2] ? 1000 : 1)) : 0 }
// A plausible star distribution for the average shown on the page.
function histogram(rating, total) {
  const r = Number(rating) || 0
  const five = Math.max(0.3, Math.min(0.9, (r - 3.4) / 1.6)), four = Math.max(0.05, (1 - five) * 0.55), one = Math.max(0.02, (5 - r) * 0.05)
  const rest = Math.max(0, 1 - five - four - one), split = [five, four, rest * 0.6, rest * 0.4, one]
  const sum = split.reduce((a, b) => a + b, 0)
  return split.map((v, i) => ({ stars: 5 - i, share: v / sum, count: Math.round(total * v / sum) }))
}
const categoryAnchor = { Controllers: 'controllers', 'Headsets & communication': 'headsets', Storage: 'storage', 'Stands & charging': 'charging', 'Wheels & joysticks': 'wheels', 'Mobile gaming': 'mobile', 'Assistive technologies': 'assistive', 'Handheld gaming': 'handheld', 'PC accessories': 'controllers' }

export function hardwarePage({ base, p, inCart = false, added = false }) {
  const path = productPath(base, p)
  const siblings = p.group ? CATALOG.filter(x => x.group === p.group) : []
  const related = CATALOG.filter(x => x.shelf && x.physical && x.id !== p.id && x.group !== p.group && (x.category === p.category || (p.catalogType === 'console' && x.category === 'Storage') || (p.category === 'Controllers' && x.category === 'Stands & charging'))).slice(0, 5)
  const total = countOf(p.ratingCount)
  const save = p.listPrice ? p.listPrice - p.price : 0
  const crumbParent = p.catalogType === 'console' ? ['Consoles', '/en-US/consoles/all-consoles'] : ['Accessories', '/en-US/store/b/xbox-accessories']
  const buy = isBuyable(p)
    ? inCart
      ? `<a class="xb-btn xb-btn-buy xh-cta" href="${base}/en-US/cart">In your cart · View cart</a>`
      : `<form method="post" action="${base}/en-US/cart/add"><input type="hidden" name="pid" value="${esc(p.id)}"><button type="submit" class="xb-btn xb-btn-buy xh-cta" aria-label="Add ${esc(p.title)} to cart">Add to cart</button></form>`
    : '<p class="xh-oos" role="status">Out of stock</p>'
  const specs = Object.entries(p.specs || {})
  return `<div class="xh-page">
  <nav class="xs-crumbs xh-crumbs" aria-label="Breadcrumb"><a href="${base}/">Microsoft Store</a><span aria-hidden="true">›</span><a href="${base}/en-US/store/b/xbox-accessories">Xbox</a><span aria-hidden="true">›</span><a href="${base}${crumbParent[1]}">${crumbParent[0]}</a>${p.catalogType === 'console' ? '' : `<span aria-hidden="true">›</span><a href="${base}/en-US/store/b/xbox-accessories?category=${encodeURIComponent(p.category)}">${esc(p.category)}</a>`}</nav>
  ${added ? `<p class="xh-added" role="status">Added to your cart. <a href="${base}/en-US/cart">View cart and check out</a></p>` : ''}
  <div class="xh-grid">
    <div class="xh-gallery">${shelfGallery(p, { className: 'xh-gallery-main' })}</div>
    <div class="xh-buy">
      <p class="xh-brand">${esc(p.brand)}</p>
      <h1>${esc(p.title)}</h1>
      <p class="xh-rating"><a href="#reviews">${stars(p.rating)} <span>${esc(p.rating)}</span> <span class="xh-muted">(${esc(p.ratingCount)} ratings)</span></a></p>
      <p class="xh-price">${p.listPrice ? `<s aria-label="Original price ${money(p.listPrice)}">${money(p.listPrice)}</s> ` : ''}<b>${money(p.price)}</b>${save ? ` <span class="xh-save">Save ${money(save)}</span>` : ''}</p>
      ${siblings.length > 1 ? `<fieldset class="xh-options"><legend>${p.catalogType === 'console' ? 'Configuration' : p.category === 'Storage' ? 'Capacity' : 'Style'}</legend><div>${siblings.map(x => `<a class="xh-option${x.id === p.id ? ' is-selected' : ''}" href="${productPath(base, x)}"${x.id === p.id ? ' aria-current="true"' : ''}>${esc(x.option)}<small>${money(x.price)}</small></a>`).join('')}</div></fieldset>` : ''}
      <div class="xh-actions">${buy}</div>
      <ul class="xh-delivery" aria-label="Delivery and returns">
        <li><b>Free shipping</b><span>Arrives in 3–5 business days. Free standard shipping on eligible orders.</span></li>
        <li><b>Pickup</b><span>Not available for this item. Ships from Microsoft Store.</span></li>
        <li><b>Free 60-day returns</b><span>Return eligible physical products within 60 days. <a href="${base}/en-US/returns">Return policy</a></span></li>
        <li><b>Limited warranty</b><span>${p.brand === 'Microsoft' ? '1-year limited hardware warranty from Microsoft.' : `Manufacturer warranty from ${esc(p.brand)}.`}</span></li>
      </ul>
      <p class="xh-muted">Sold and shipped by Microsoft Store · Physical items do not grant a digital license.</p>
    </div>
  </div>
  <section class="xh-section" id="overview"><h2>Overview</h2>${p.description.map(t => `<p>${esc(t)}</p>`).join('')}</section>
  ${specs.length ? `<section class="xh-section" id="specs"><h2>Tech specs</h2><dl class="xh-specs"><dt>Brand</dt><dd>${esc(p.brand)}</dd><dt>Category</dt><dd>${esc(p.category)}</dd><dt>Works with</dt><dd>${esc(p.platforms.join(', '))}</dd>${p.color ? `<dt>Color</dt><dd>${esc(p.color[0].toUpperCase() + p.color.slice(1))}</dd>` : ''}${specs.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}<dt>Product ID</dt><dd>${esc(p.id.toUpperCase())}</dd></dl></section>` : ''}
  <section class="xh-section" id="reviews"><h2>Ratings and reviews</h2><div class="xh-reviews"><div class="xh-score"><b>${esc(p.rating)}</b>${stars(p.rating)}<span class="xh-muted">${total.toLocaleString('en-US')} ratings</span></div><div class="xh-bars">${histogram(p.rating, total).map(h => `<div class="xh-bar"><span>${h.stars} ★</span><span class="xh-track"><span style="width:${Math.round(h.share * 100)}%"></span></span><span class="xh-muted">${h.count.toLocaleString('en-US')}</span></div>`).join('')}</div></div><p class="xh-muted">Ratings are from verified Microsoft Store purchasers in the United States. Written reviews are not available in this store.</p></section>
  ${related.length ? `<section class="xh-section"><h2>${p.catalogType === 'console' ? 'Expand your storage' : 'You may also like'}</h2><div class="xb-grid xb-home-grid">${related.map(x => `<a class="xb-tile" href="${productPath(base, x)}" aria-label="${esc(x.title)}, ${money(x.price)}">${shelfImage(x, { className: 'xb-art' })}<span class="xb-tile-title">${esc(x.title)}</span><span class="xb-tile-price">${x.listPrice ? `<s>${money(x.listPrice)}</s> ` : ''}${money(x.price)}</span></a>`).join('')}</div></section>` : ''}
  <p class="xh-more-links"><a href="${base}/en-US/accessories#${categoryAnchor[p.category] || 'controllers'}">Explore ${esc(p.catalogType === 'console' ? 'Xbox consoles' : p.category.toLowerCase())}</a> · <a href="${base}/en-US/store/b/xbox-accessories">Shop all consoles &amp; accessories</a></p>
</div>`
}
