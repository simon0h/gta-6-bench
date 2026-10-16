// Rendering for the reference shop floor: product cards, product detail pages and search ranking.
import { esc, money } from '../../lib/html.js'
import { shelfProducts, shelfImage, shelfGallery, shelfInCategory } from './shelf.js'
import { categoryByCode } from './site-data.js'

const cash = n => money(n, 'GBP')
const stars = r => { const full = Math.round(r); return `<span class="st-stars" aria-hidden="true">${'★'.repeat(full)}${'☆'.repeat(5 - full)}</span>` }
export const priceBlock = p => `<p class="st-price-line"><strong class="browse-price">${cash(p.price)}</strong>${p.was ? ` <s class="st-was">${cash(p.was)}</s> <span class="st-save">Save ${cash(Math.round((p.was - p.price) * 100) / 100)}</span>` : ''}</p>`

// Star breakdown whose average lands on the product's rating (a rounded bell around a shifted centre).
function starCounts(rating, total) {
  const weights = m => [5, 4, 3, 2, 1].map(k => Math.exp(-((k - m) ** 2) / 1.3))
  const mean = w => w.reduce((s, x, i) => s + x * (5 - i), 0) / w.reduce((s, x) => s + x, 0)
  let best = rating, gap = Infinity
  for (let m = rating - 1; m <= rating + 4; m += 0.02) { const d = Math.abs(mean(weights(m)) - rating); if (d < gap) { gap = d; best = m } }
  const w = weights(best), sum = w.reduce((s, x) => s + x, 0), counts = w.map(x => Math.round(x / sum * total))
  counts[counts.indexOf(Math.max(...counts))] += total - counts.reduce((s, x) => s + x, 0)
  return counts
}
function ratingBars(p) {
  const counts = starCounts(p.rating, p.reviews)
  return `<ul class="st-rating-bars">${counts.map((n, i) => `<li><span>${5 - i} star</span><span class="st-rating-bar"><i style="width:${p.reviews ? Math.round(n / p.reviews * 100) : 0}%"></i></span><span>${n}</span></li>`).join('')}</ul>`
}

export function shelfTile(base, p, returnTo = '') {
  const href = `${base}${p.path}${returnTo ? `?return=${encodeURIComponent(returnTo)}` : ''}`
  return `<article class="browse-tile st-ptile" data-sku="${esc(p.sku)}"><a href="${href}">${shelfImage(p, { className: 'product-art' })}<small>${esc(p.brand)} · ${esc(p.category)}</small><h2>${esc(p.title)}</h2></a><p class="rating" aria-label="Rated ${p.rating} out of 5 from ${p.reviews} reviews">${stars(p.rating)} ${p.rating.toFixed(1)} <span>(${p.reviews})</span></p>${priceBlock(p)}<p class="st-tile-stock">${p.preorder ? 'Pre-order' : 'In stock'} · Delivery &amp; Collection</p><form class="st-tile-add" action="${base}/cart/add" method="post"><input type="hidden" name="sku" value="${esc(p.sku)}"><input type="hidden" name="qty" value="1"><button>${p.preorder ? 'Pre-order' : 'Add to Basket'}</button></form><a class="st-tile-view" href="${href}">View product</a></article>`
}

function crumbsFor(base, p) {
  const trail = []
  for (let c = categoryByCode(p.categoryCode); c; c = c.parent) trail.unshift(c)
  return `<nav class="st-crumbs" aria-label="Breadcrumb"><ol><li><a href="${base}">Home</a></li>${trail.map(c => `<li><a href="${base}${c.path}">${esc(c.label)}</a></li>`).join('')}<li><span aria-current="page">${esc(p.title)}</span></li></ol></nav>`
}

export function shelfProductPage(base, p, { values = {}, tools = '', returnTo = '' } = {}) {
  const related = shelfProducts.filter(x => x !== p && x.categoryCode === p.categoryCode).slice(0, 8)
  const more = related.length < 4 ? shelfProducts.filter(x => x !== p && x.department === p.department && !related.includes(x)).slice(0, 8 - related.length) : []
  const qty = typeof values.qty === 'string' ? values.qty : '1'
  const collect = Object.entries(p.collectionStock).map(([b, n]) => `${b === 'beckton' ? 'Beckton' : 'Salford'}: ${n ? 'In stock' : 'Out of stock'}`).join(' · ')
  const safety = p.department === 'Baby Room' ? 'Always follow the manufacturer’s instructions and check the stated child height and weight limits before use.'
    : p.department === 'Outdoor' ? 'Adult assembly required where indicated. Protective equipment should be worn. Not to be used in traffic.'
      : p.department === 'Gaming & Tech' ? 'Read the enclosed health and safety information before use.'
        : p.minAge >= 3 ? 'Warning: not suitable for children under 3 years. Small parts. Choking hazard.' : 'Read and keep the enclosed instructions for future reference.'
  return `${returnTo ? `<p class="st-back"><a href="${base}${esc(returnTo)}">‹ Back to your results</a></p>` : ''}${crumbsFor(base, p)}<div class="columns st-pdp st-shelf-pdp">${shelfGallery(p)}<section class="st-buybox"><p class="st-brand">${esc(p.brand)}</p><h1>${esc(p.title)}</h1><p class="st-ref">Ref: ${esc(p.sku)}</p><p class="rating"><a href="#reviews">${stars(p.rating)} ${p.rating.toFixed(1)} <span>(${p.reviews} reviews)</span></a></p>${priceBlock(p)}${p.preorder ? '<p class="st-badge-pre">Pre-order</p><p>Pre-order Price Promise: if the price drops before dispatch or collection you pay the lower price.</p>' : ''}<div class="st-fulfil"><p><strong>Home Delivery</strong><br>${p.preorder ? 'Available to pre-order' : 'In stock'} · ${p.price >= 20 ? 'FREE delivery' : '£2.99 delivery on orders under £20'}</p><p><strong>Click &amp; Collect — FREE</strong><br>${collect}</p></div><form action="${base}/cart/add" method="post" class="st-add"><input type="hidden" name="sku" value="${esc(p.sku)}"><label for="qty">Quantity</label><input id="qty" name="qty" type="number" min="1" max="10" step="1" value="${esc(qty)}" required><button>${p.preorder ? 'Pre-order' : 'Add to Basket'}</button></form>${tools}</section></div>
<div class="st-pdp-tabs"><section class="panel" id="product-details"><h2>Key features</h2><ul>${p.features.map(f => `<li>${esc(f)}</li>`).join('')}</ul></section><section class="panel"><h2>Product details</h2><p>${esc(p.description)}</p><dl><dt>Ref</dt><dd>${esc(p.sku)}</dd><dt>Brand</dt><dd>${esc(p.brand)}</dd><dt>Aisle</dt><dd>${esc(p.category)}</dd><dt>Age</dt><dd>${p.minAge === 0 ? 'From birth' : `${p.minAge}+ years`}</dd><dt>Assembly required</dt><dd>${p.assembly}</dd></dl></section><section class="panel"><h2>Safety &amp; manufacturer information</h2><p>${esc(safety)}</p></section><section class="panel" id="reviews"><h2>Reviews</h2><p class="st-review-score">${stars(p.rating)} <strong>${p.rating.toFixed(1)}</strong> out of 5</p><p>Based on ${p.reviews} customer ${p.reviews === 1 ? 'review' : 'reviews'}</p>${ratingBars(p)}</section></div>
${related.length + more.length ? `<section class="st-section"><div class="st-section-head"><h2>You may also like</h2></div><div class="browse-grid">${[...related, ...more].map(x => shelfTile(base, x)).join('')}</div></section>` : ''}`
}

// ------------------------------------------------------------------ search ranking
const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’']/g, '').replace(/[^a-z0-9]+/g, ' ').trim()
// Scores every product (GTA listings included) by how well the query matches. All terms must match
// somewhere; title hits weigh most. Ties keep catalogue order, which lists the GTA rows first.
export function rankSearch(all, q) {
  const terms = norm(q).split(' ').filter(Boolean)
  if (!terms.length) return all
  const phrase = terms.join(' ')
  return all.map((p, i) => {
    const title = ` ${norm(p.title)} `, brand = norm(p.brand), rest = norm(`${p.department} ${p.category} ${p.keywords || ''}`)
    let score = 0
    for (const t of terms) {
      const hit = title.includes(` ${t} `) ? 4 : title.includes(t) ? 3 : brand.includes(t) ? 2 : rest.includes(t) ? 1 : 0
      if (!hit) return null
      score += hit
    }
    if (title.includes(phrase)) score += 5
    if (` ${norm(p.keywords)} `.includes(` ${phrase} `)) score += 6
    return { p, score, i }
  }).filter(Boolean).sort((a, b) => b.score - a.score || a.i - b.i).map(x => x.p)
}
export { shelfInCategory }
