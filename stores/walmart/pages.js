import { esc, money, disclaimer } from '../../lib/html.js'
import { productPath, STATES, LOCATION, ARRIVAL, PREORDER_PRICE_GUARANTEE, WALMART_PLUS } from './data.js'

const NAME = 'Walmart'
const NAV = ['Rollbacks & More', 'Restaurants', 'Halloween', 'Get it Fast', 'Pharmacy', 'Walmart+', 'More']

// Inline icons only (no external assets). The spark is six rounded yellow spokes, not Walmart's logo file.
const ICON = {
  spark: '<svg class="wm-spark" viewBox="0 0 40 40" aria-hidden="true" focusable="false"><g stroke="#FFC220" stroke-width="5.5" stroke-linecap="round"><line x1="20" y1="3" x2="20" y2="13"/><line x1="20" y1="27" x2="20" y2="37"/><line x1="5.3" y1="11.5" x2="14" y2="16.5"/><line x1="26" y1="23.5" x2="34.7" y2="28.5"/><line x1="5.3" y1="28.5" x2="14" y2="23.5"/><line x1="26" y1="16.5" x2="34.7" y2="11.5"/></g></svg>',
  search: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="10" cy="10" r="6.5" fill="none" stroke="currentColor" stroke-width="2.2"/><line x1="15" y1="15" x2="21" y2="21" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
  pin: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" fill="currentColor"/></svg>',
  heart: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
  user: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M4 21a8 8 0 0 1 16 0" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
  cart: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M3 4h2l2.5 11h11l2-8H7" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="9" cy="19" r="1.6" fill="currentColor"/><circle cx="17" cy="19" r="1.6" fill="currentColor"/></svg>',
  truck: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M2 6h11v9H2zM13 9h4l3 3v3h-7z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="6" cy="17.5" r="2" fill="currentColor"/><circle cx="17" cy="17.5" r="2" fill="currentColor"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="10" fill="#0053E2"/><path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  card: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="2" y="5" width="20" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><line x1="2" y1="10" x2="22" y2="10" stroke="currentColor" stroke-width="2"/></svg>',
}
const WPLUS = '<span class="wm-wplus">Walmart<span>+</span></span>'
const loginHref = (base, state) => `${base}/account/login${state ? `?state=${encodeURIComponent(state)}` : ""}`
const SHOW_HIDE_JS = `<script>document.querySelectorAll('[data-toggle]').forEach(function(b){b.addEventListener('click',function(){var i=document.getElementById(b.getAttribute('data-toggle'));var show=i.type==='password';i.type=show?'text':'password';b.textContent=show?'Hide':'Show'})})</script>`

// ---- layout ----
export function layout({ base, title, body, t, user = null, variant = 'store', q = '' }) {
  const header = variant === 'store' ? storeHeader({ base, t, user, q }) : variant === 'checkout' ? checkoutHeader({ base }) : identityHeader({ base })
  const footer = variant === 'identity' ? identityFooter() : storeFooter()
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<link rel="stylesheet" href="${base}/static/style.css"></head>
<body class="wm-body-${esc(variant)}">
${header}
<main class="wm-main">${body}</main>
${footer}
${variant === 'store' ? `<a class="wm-sparky" href="#" aria-label="Sparky, Walmart's AI assistant: Ask me anything">${ICON.spark}<span>Ask me anything</span></a>` : ''}
</body></html>`
}

function storeHeader({ base, t, user, q }) {
  return `<header class="wm-header">
  <div class="wm-header-top">
    <a class="wm-logo" href="${base}/" aria-label="Walmart Homepage">${ICON.spark}</a>
    <a class="wm-loc" href="${base}/cart#pickup-delivery" aria-label="Pickup or delivery? ${esc(LOCATION.city)}, ${esc(LOCATION.zip)} &bull; ${esc(LOCATION.store)}">${ICON.pin}<span><b>Pickup or delivery?</b><small>${esc(LOCATION.city)}, ${esc(LOCATION.zip)} &bull; ${esc(LOCATION.store)}</small></span></a>
    <form class="wm-search" action="${base}/search" method="get" role="search">
      <input type="search" name="q" placeholder="Search Walmart" aria-label="Search Walmart" value="${esc(q)}">
      <button type="submit" aria-label="Search icon">${ICON.search}</button>
    </form>
    <a class="wm-util" href="${user ? `${base}/account` : `${base}/account/login`}" aria-label="Reorder My Items">${ICON.heart}<span><small>Reorder</small><b>My Items</b></span></a>
    <a class="wm-util" href="${user ? `${base}/account` : `${base}/account/login`}" aria-label="${user ? `Hi, ${esc(user.first_name || 'there')} Account` : 'Sign In Account'}">${ICON.user}<span><small>${user ? `Hi, ${esc(user.first_name || 'there')}` : 'Sign In'}</small><b>Account</b></span></a>
    <a class="wm-cart-link" href="${base}/cart" aria-label="Cart contains ${t.count} item${t.count === 1 ? '' : 's'}, total ${money(t.subtotal)}">${ICON.cart}<span class="wm-cart-count">${t.count}</span><small>${money(t.subtotal)}</small></a>
  </div>
  <nav class="wm-header-nav" aria-label="Departments and services">
    <button type="button" class="wm-nav-dd" aria-haspopup="true">&#9776; Departments &#9662;</button>
    <button type="button" class="wm-nav-dd" aria-haspopup="true">&#9881; Services &#9662;</button>
    ${NAV.map(n => `<a href="${base}/search?q=${encodeURIComponent(n)}">${esc(n)}</a>`).join('')}
  </nav>
</header>`
}

function checkoutHeader({ base }) {
  return `<header class="wm-co-header"><a class="wm-logo" href="${base}/" aria-label="Walmart Homepage">${ICON.spark}</a><span class="wm-co-header-title">Checkout</span></header>`
}

function identityHeader({ base }) {
  return `<header class="wm-id-header"><a class="wm-wordmark" href="${base}/" aria-label="Walmart">${ICON.spark}<span>Walmart</span></a></header>`
}

function storeFooter() {
  const links = ['All Departments', 'Store Directory', 'Careers', 'Our Company', 'Sell on Walmart.com', 'Help', 'Product Recalls', 'Accessibility', 'Tax Exempt Program', 'Get the Walmart App', 'Sign-up for Email', 'Safety Data Sheet', 'Terms of Use', 'Privacy Notice', 'California Supply Chain Act', 'Your Privacy Choices', 'Notice at Collection', 'AdChoices', 'Consumer Health Data Privacy Notices', 'Brand Shop Directory', 'Pharmacy', 'Walmart Business', '#IYWYK', 'Delete Account']
  return `<footer class="wm-footer">
  <div class="wm-feedback">We&rsquo;d love to hear what you think! <a href="#">Give feedback</a></div>
  <nav class="wm-footer-links" aria-label="Footer">${links.map(l => `<a href="#">${esc(l)}</a>`).join('')}</nav>
  <p class="wm-copy">&copy; 2026 Walmart. All Rights Reserved.</p>
  ${disclaimer(NAME)}
</footer>`
}

function identityFooter() {
  const links = ['Give feedback', 'Terms of Use', 'Privacy Notice', 'California Supply Chain Act', 'Your Privacy Choices', 'Customer Privacy Center', 'Notice at Collection']
  return `<footer class="wm-id-footer"><p>&copy; 2026 Walmart. All Rights Reserved.</p><nav aria-label="Legal">${links.map(l => `<a href="#">${esc(l)}</a>`).join('')}</nav>${disclaimer(NAME)}</footer>`
}

// ---- shared pieces ----
function ppg() {
  return `<details class="wm-ppg"><summary>Preorder Price Guarantee <span class="wm-link">Details</span></summary><div class="wm-popover">${esc(PREORDER_PRICE_GUARANTEE)}</div></details>`
}

function starGlyphs(rating) {
  const full = Math.round(rating)
  return `<span class="wm-stars" aria-hidden="true">${'★'.repeat(full)}${'☆'.repeat(5 - full)}</span>`
}

function tilePrice(p) {
  const [d, c] = p.price.toFixed(2).split('.')
  return `<div class="wm-tile-price">${p.wasPrice ? '<span class="wm-now">Now </span>' : ''}<span class="sr-only">current price ${money(p.price)}</span><span class="wm-dollars" aria-hidden="true">$${d}</span><span class="wm-cents" aria-hidden="true">${c}</span>${p.wasPrice ? ` <s class="wm-was"><span class="sr-only">Was </span>${money(p.wasPrice)}</s>` : ''}</div>`
}

function ratingLine(p) {
  if (!p.rating) return '<div class="wm-rating wm-fine">No ratings yet</div>'
  return `<div class="wm-rating">${starGlyphs(p.rating)} ${p.rating} out of 5 stars <span class="wm-count">${p.ratings}</span></div>`
}

// Product tile: badge ribbon, square image, heart, pill CTA, price, title, stars, Save with W+, fulfillment line, ESRB.
function tile(base, p, { from = 'search', longCta = false } = {}) {
  const href = productPath(base, p, from === 'search')
  const cta = longCta && p.cta === 'Add' ? 'Add to cart' : p.cta
  return `<article class="wm-tile">
  ${p.tileBadge ? `<span class="wm-badge">${esc(p.tileBadge)}</span>` : ''}
  <div class="wm-tile-media">
    <a href="${href}" tabindex="-1"><img src="${p.art}" alt=""></a>
    <a class="wm-heart" href="${base}/account/login" aria-label="Sign in to add to Favorites list">${ICON.heart}</a>
    <form method="post" action="${base}/cart/add" class="wm-tile-cta"><input type="hidden" name="pid" value="${p.id}"><button type="submit" class="wm-pill wm-pill-sm" aria-label="${esc(cta)} ${esc(p.title)}">${esc(cta)}</button></form>
  </div>
  ${tilePrice(p)}
  <h3 class="wm-tile-title"><a href="${href}">${esc(p.title)}</a></h3>
  ${ratingLine(p)}
  <div class="wm-save-wplus">Save with ${WPLUS}</div>
  <div class="wm-tile-ful">${p.preorder ? '<b>Preorder</b><br>' : ''}${esc(p.shippingText)}</div>
  ${p.esrb ? `<div class="wm-esrb">${esc(p.esrb)}</div>` : ''}
</article>`
}

function stepper(base, p, qty, next) {
  return `<form method="post" action="${base}/cart/update" class="wm-stepper"><input type="hidden" name="pid" value="${p.id}"><input type="hidden" name="next" value="${esc(next)}"><button type="submit" name="action" value="dec" aria-label="Decrease quantity">&minus;</button><span aria-live="polite">${qty}</span><button type="submit" name="action" value="inc" aria-label="Increase quantity">+</button></form>`
}

function field({ name, label, type = 'text', values = {}, errors = {}, extra = '', id = name }) {
  return `<div class="wm-field"><label for="${id}">${label}</label><input id="${id}" name="${name}" type="${type}" value="${esc(values[name] ?? '')}" ${extra} ${errors[name] ? `aria-invalid="true" aria-describedby="${id}-error"` : ''}>${errors[name] ? `<p class="wm-error" id="${id}-error">${esc(errors[name])}</p>` : ''}</div>`
}

function stateSelect({ name, label, values = {}, errors = {}, id = name, extra = '' }) {
  return `<div class="wm-field"><label for="${id}">${label}</label><select id="${id}" name="${name}" autocomplete="address-level1" ${extra} ${errors[name] ? `aria-invalid="true" aria-describedby="${id}-error"` : ''}><option value="">Select</option>${STATES.map(s => `<option value="${s}" ${values[name] === s ? 'selected' : ''}>${s}</option>`).join('')}</select>${errors[name] ? `<p class="wm-error" id="${id}-error">${esc(errors[name])}</p>` : ''}</div>`
}

// Card expiry is two half-width selects "MM*" / "YY*" under a small "Expiration date" caption, with aria-labels
// "Expiration month" / "Expiration year" (research/walmart.json, checkout card-form chunk), not one MM/YY box.
function expirySelects({ values = {}, errors = {} }) {
  const yy = new Date().getFullYear() % 100
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'))
  const years = Array.from({ length: 20 }, (_, i) => String(yy + i).padStart(2, '0'))
  const opts = (list, sel) => list.map(v => `<option value="${v}" ${sel === v ? 'selected' : ''}>${v}</option>`).join('')
  const bad = errors.expiration ? 'aria-invalid="true" aria-describedby="expiration-error"' : ''
  return `<fieldset class="wm-exp"><legend>Expiration date</legend><div class="wm-2col">
    <div class="wm-field"><label for="expMonth">MM*</label><select id="expMonth" name="expMonth" aria-label="Expiration month" autocomplete="cc-exp-month" required ${bad}><option value="">MM</option>${opts(months, values.expMonth)}</select></div>
    <div class="wm-field"><label for="expYear">YY*</label><select id="expYear" name="expYear" aria-label="Expiration year" autocomplete="cc-exp-year" required ${bad}><option value="">YY</option>${opts(years, values.expYear)}</select></div>
  </div>${errors.expiration ? `<p class="wm-error" id="expiration-error">${esc(errors.expiration)}</p>` : ''}</fieldset>`
}

// autofocus scrolls a re-rendered page (no JS) to the card that failed, as inline validation would.
function errorSummary(errors = {}) {
  const list = Object.values(errors)
  return list.length ? `<div class="wm-error-summary" role="alert" tabindex="-1" autofocus><b>Please fix the following:</b><ul>${list.map(e => `<li>${esc(e)}</li>`).join('')}</ul></div>` : ''
}

// ---- browse ----
export function homePage({ base, products }) {
  const game = products.filter(p => p.kind === 'game')
  const rest = products.filter(p => p.kind !== 'game' && !p.sponsored)
  return `<section class="wm-hero-grid">
  <div class="wm-hero wm-hero-gta">
    <p class="wm-eyebrow">Preorder now</p>
    <h1>Get Grand Theft Auto VI ready</h1>
    <p>Everything you need to upgrade. Code in Box, delivers 11/12/26, playable 11/19/26. Free shipping, arrives by release date Nov 12.</p>
    <a class="wm-pill wm-pill-white" href="${base}/search?q=grand+theft+auto+vi">Shop now</a>
  </div>
  <div class="wm-hero wm-hero-plus"><p class="wm-eyebrow">${WPLUS}</p><h2>Try Walmart+ for $1</h2><p>30 days of free delivery, free shipping with no order minimum &amp; more. T&amp;C apply.</p><a class="wm-pill wm-pill-white" href="#">Claim offer now</a></div>
  <div class="wm-hero wm-hero-onepay"><p class="wm-eyebrow">OnePay</p><h2>CashRewards Card</h2><p>Earn unlimited 3% cash back at Walmart and 1.5% back on all other purchases.</p><a class="wm-pill wm-pill-white" href="#">Learn more</a></div>
</section>
<section><div class="wm-section-head"><h2>Preorder Grand Theft Auto VI</h2><a href="${base}/search?q=gta+vi">View all</a></div><div class="wm-grid">${game.map(p => tile(base, p, { from: 'home' })).join('')}</div></section>
<section><div class="wm-section-head"><h2>Flash Deals &amp; more in Video Games</h2><a href="${base}/search?q=video+games">View all</a></div><div class="wm-grid">${rest.map(p => tile(base, p, { from: 'home' })).join('')}</div></section>`
}

export function searchPage({ base, q, products }) {
  const chips = ['In-store', 'Get it fast', 'Price', 'Brand']
  const quick = ['GTA VI', 'Memory', 'Consoles & bundles', 'Accessories', 'GTA Shop']
  const suggested = ['Action & Adventure', 'Rockstar Games', 'Rating Pending']
  const facets = ['Price', 'Brand', 'Video Game Platform', 'Product Category', 'Video Game Genre', 'Video Game Format', 'Game Collections', 'Compatible Devices', 'ESRB Rating', 'Rating', 'Number of Pieces', 'Availability', 'Departments', 'Customer Rating', 'Retailer', 'Gifting']
  const related = ['gta 6 ps5', 'gta 6 xbox', 'grand theft auto vi', 'gta shop', 'ps5 games']
  const chip = (c) => `<a class="wm-chip" href="${base}/search?q=${encodeURIComponent(c)}">${esc(c)}</a>`
  return `<div class="wm-search-page">
  <div class="wm-chip-row">${chips.map(c => `<button type="button" class="wm-chip">${esc(c)} &#9662;</button>`).join('')}<span class="wm-sort">Sort by | <b>Best Match</b> &#9662;</span></div>
  <div class="wm-chip-row wm-quick">${quick.map(chip).join('')}<span class="wm-chip-label">Suggested</span>${suggested.map(chip).join('')}</div>
  <div class="wm-search-body">
    <aside class="wm-facets" aria-label="Filters">${facets.map(f => `<details><summary>${esc(f)}</summary><label><input type="checkbox"> Any</label></details>`).join('')}</aside>
    <div>
      <h1 class="wm-results-head">Results for &quot;${esc(q)}&quot;<span>(${products.length})</span></h1>
      <p class="wm-fine">Uses item details. Price when purchased online</p>
      ${products.length ? `<div class="wm-grid">${products.map(p => tile(base, p)).join('')}</div>` : `<p class="wm-empty">There were no search results for &quot;${esc(q)}&quot;. Check the spelling or try a different search.</p>`}
      <div class="wm-banner"><b>Get Grand Theft Auto VI ready</b> &mdash; Everything you need to upgrade. <a href="${base}/search?q=gta+vi">Shop now</a></div>
      <div class="wm-related"><b>Related searches</b> ${related.map(chip).join('')}</div>
      <nav class="wm-pager" aria-label="Pagination"><span aria-current="page">1</span><span>2</span><span>3</span></nav>
    </div>
  </div>
</div>`
}

function reviewsSection(p) {
  if (!p.rating) return `<section class="wm-reviews" id="reviews"><h2>Customer ratings &amp; reviews</h2><p class="wm-fine">No reviews yet. Be the first to review this item.</p></section>`
  const split = [0.38, 0.16, 0.14, 0.11, 0.21].map(f => Math.round(f * p.ratings))
  return `<section class="wm-reviews" id="reviews">
  <h2>Customer ratings &amp; reviews</h2>
  <div class="wm-reviews-sum">
    <div class="wm-rev-score"><b>${p.rating}</b> out of 5<br>${starGlyphs(p.rating)}<br><small>(${p.ratings} ratings | ${p.reviews} reviews)</small></div>
    <div class="wm-histogram">${[5, 4, 3, 2, 1].map((n, i) => `<div class="wm-hist-row"><span>${n} stars</span><span class="wm-hist-bar"><i style="width:${Math.round(split[i] / p.ratings * 100)}%"></i></span><span>${split[i]}</span></div>`).join('')}</div>
  </div>
  <div class="wm-chip-row"><button type="button" class="wm-chip">All filters</button><button type="button" class="wm-chip">Star rating &#9662;</button><label class="wm-chip" for="verified-only"><input type="checkbox" id="verified-only"> Verified purchases only</label><span class="wm-sort">Sort by | <b>Most relevant</b> &#9662;</span></div>
  <article class="wm-review">${starGlyphs(5)}<b>Ready for preload</b><p>Preordered the code-in-box copy so I can preload on the 12th. Free shipping by release date sealed it.</p><small>Review from samsclub.com</small></article>
  <article class="wm-review">${starGlyphs(2)}<b>No disc in the box</b><p>Heads up: there is no disc, just a download code inside the case. Wish that was clearer up front.</p><small>Review from samsclub.com</small></article>
</section>`
}

function buyBox({ base, p, sponsored }) {
  const cta = p.cta === 'Add' ? 'Add to cart' : p.cta
  return `<aside class="wm-buybox">
  <div class="wm-onepay-banner"><b>OnePay</b> CashRewards Card &mdash; Earn unlimited 3% cash back at Walmart and 1.5% back on all other purchases &mdash; <a href="#">Learn More</a></div>
  <div class="wm-price-big"><span class="sr-only">Current price is </span>${money(p.price)}</div>
  ${p.preorder ? ppg() : ''}
  <div class="wm-fine">Price when purchased online</div>
  <div class="wm-fine">As low as $14/mo with <b>OnePay Later</b> <a href="#">Learn more</a></div>
  <div class="wm-perks"><span>Free shipping</span><span>Free 30-day returns</span></div>
  <form method="post" action="${base}/cart/add" class="wm-buy-form">
    <input type="hidden" name="pid" value="${p.id}">
    <button type="submit" class="wm-pill wm-pill-block wm-pill-lg">${esc(cta)}</button>
    <h3 class="wm-h6">How you&rsquo;ll get this item:</h3>
    <label class="wm-check wm-plus-check" for="plus"><input type="checkbox" id="plus" name="plus" value="1" aria-label="I want delivery savings with Walmart+"> <span>I want delivery savings with ${WPLUS}<br><small>Try 30 days for just $1! Choose a plan at checkout.</small></span></label>
    <h3 class="wm-h6">How do you want your item?</h3>
    <div class="wm-ful-tiles">
      <label class="wm-ful-tile is-selected" for="fulfillment-shipping"><input type="radio" id="fulfillment-shipping" name="fulfillment" value="shipping" aria-label="Shipping, Arrives ${esc(ARRIVAL.short)}, Free" checked>${ICON.truck}<b>Shipping</b><span>Arrives ${esc(ARRIVAL.short)}</span><span>Free</span></label>
      <div class="wm-ful-tile is-disabled" aria-disabled="true"><b>Pickup</b><span>Check nearby</span></div>
      <div class="wm-ful-tile is-disabled" aria-disabled="true"><b>Delivery</b><span>Not available</span></div>
    </div>
  </form>
  <p class="wm-fine">Ships to ${esc(LOCATION.city)}, ${esc(LOCATION.zip)} &nbsp;&middot;&nbsp; <b>Arrives by ${esc(ARRIVAL.full)}</b></p>
  <p class="wm-fine">Sold and shipped by Walmart.com &nbsp;&middot;&nbsp; <a href="#">Report an issue with seller or item</a></p>
  <details class="wm-ppg"><summary>Free 30-day returns <span class="wm-link">Details</span></summary><div class="wm-popover"><b>Return policy</b><br>Return within 30 days after item is delivered.<br>Returnable to store? Yes<br>Special return instructions: Video Game downloads are not returnable after purchase. If you are unable to locate or redeem your code, contact Customer Care.</div></details>
  <p class="wm-fine">This item is gift eligible <a href="#">Learn more</a></p>
  <p class="wm-fine">Packaging note: Ships in the manufacturer&rsquo;s original packaging, which may reveal the contents.</p>
  <p class="wm-fine"><a href="${base}/account/login">Add to list</a> &nbsp;&middot;&nbsp; <a href="${base}/account/login">Add to registry</a></p>
  <div class="wm-plus-banner">Try 30 days of ${WPLUS} for just $1! T&amp;C apply. <a href="#">Claim offer now</a></div>
  ${sponsored ? `<div class="wm-sponsored"><small>Sponsored</small><img src="${sponsored.art}" alt=""><div><a href="${productPath(base, sponsored)}">${esc(sponsored.title)}</a><div class="wm-sponsored-price">${money(sponsored.price)}</div><form method="post" action="${base}/cart/add"><input type="hidden" name="pid" value="${sponsored.id}"><button type="submit" class="wm-pill wm-pill-sm">Add to cart</button></form></div></div>` : ''}
</aside>`
}

export function productPage({ base, p, similar, sponsored }) {
  const isGame = p.kind === 'game'
  const ratingText = p.rating ? `${p.rating} out of 5 stars (${p.rating}) | ${p.ratings} ratings` : 'No ratings yet'
  return `<div class="wm-pdp">
  <div class="wm-pdp-media">
    <div class="wm-thumbs">${Array.from({ length: 5 }, () => `<img src="${p.art}" alt="">`).join('')}<a href="#" class="wm-thumb-more">+6<br>View all</a></div>
    <div class="wm-hero-img"><img src="${p.art}" alt="${esc(p.title)}"><div class="wm-media-tools"><a href="#">Zoom image modal</a><a href="#">Share</a><a href="${base}/account/login" aria-label="Sign in to add to Favorites list">${ICON.heart}</a></div></div>
  </div>
  <div class="wm-pdp-info">
    <div class="wm-badges">${p.pdpBadges.map(b => `<span class="wm-badge-inline">${esc(b)}</span>`).join('')}${p.preorder ? `<span class="wm-badge-inline wm-badge-pre">Preorder <span>${esc(p.releaseText)}</span></span>` : ''}</div>
    <a class="wm-brand" href="${base}/search?q=${encodeURIComponent(p.brand)}">${esc(p.brand)}</a>
    <h1 class="wm-pdp-title">${esc(p.title)}</h1>
    <div class="wm-rating-line">${p.rating ? `${starGlyphs(p.rating)} ` : ''}${esc(ratingText)}${p.esrb ? ` &nbsp;&middot;&nbsp; <span class="wm-esrb">${esc(p.esrb)}</span>` : ''}</div>
    <h2 class="wm-h6">Key item features</h2>
    <ul class="wm-features">${p.features.map(f => `<li>${esc(f)}</li>`).join('')}</ul>
    <a href="#details" class="wm-link">View all item details</a>
    <div id="details" class="wm-details">
      <details class="wm-acc"><summary>About this item</summary><div class="wm-acc-body"><h3>Product details</h3><p>${esc(p.features.join(' '))}</p><p class="wm-fine">We aim to show you accurate product information. Manufacturers, suppliers and others provide what you see here, and we have not verified it.</p></div></details>
      <details class="wm-acc"><summary>Specifications</summary><table class="wm-specs"><tr><th>Brand</th><td>${esc(p.brand)}</td></tr>${isGame ? `<tr><th>Video Game Platform</th><td>${p.platform === 'ps5' ? 'PlayStation 5' : 'Xbox Series X|S'}</td></tr><tr><th>Edition</th><td>Standard Edition</td></tr><tr><th>Video Game Format</th><td>Code in Box (no disc)</td></tr><tr><th>Release Date</th><td>Delivers 11/12/26, playable 11/19/26</td></tr>` : ''}${p.esrb ? `<tr><th>ESRB Rating</th><td>${esc(p.esrb)}</td></tr>` : ''}</table></details>
    </div>
  </div>
  ${buyBox({ base, p, sponsored })}
</div>
<section class="wm-carousel-sec"><div class="wm-section-head"><h2>Similar items you might like</h2><span class="wm-fine">Based on what customers bought</span></div><div class="wm-carousel">${similar.map(s => tile(base, s, { from: 'pdp' })).join('')}</div></section>
${reviewsSection(p)}
<nav class="wm-crumbs" aria-label="Breadcrumb">${p.crumbs.map((c, i) => `<a href="${base}/search?q=${encodeURIComponent(c)}">${esc(c)}</a>${i < p.crumbs.length - 1 ? ' / ' : ''}`).join('')}</nav>`
}

// "Added to cart!" interstitial at /pac (full-page redirect, no modal).
export function addedPage({ base, p, qty, t, recommendations }) {
  const next = `${base}/pac?id=${p.id}&ip=${p.price}&qt=${qty}`
  return `<div class="wm-pac">
  <a class="sr-only" href="#pac-cart">Skip to Cart and Checkout Section</a>
  <h1 class="wm-pac-title">${ICON.check} Added to cart!</h1>
  <div class="wm-pac-item">
    <img src="${p.art}" alt="">
    <div class="wm-pac-info"><a href="${productPath(base, p)}">${esc(p.title)}</a><div class="wm-fine">${money(p.price)} ea</div></div>
    ${stepper(base, p, qty, next)}
  </div>
  <div class="wm-onepay-banner"><b>OnePay</b> CashRewards Card &mdash; Earn unlimited 5% cash back at Walmart with Walmart+ and 1.5% back on all other purchases. <a href="#">Learn more</a></div>
  <section class="wm-carousel-sec"><div class="wm-section-head"><h2>Product Recommendations</h2><span class="wm-fine">Customers also bought these products</span></div><div class="wm-carousel">${recommendations.map(r => tile(base, r, { from: 'pac', longCta: true })).join('')}</div></section>
  <section class="wm-carousel-sec"><div class="wm-section-head"><h2>Customers also considered</h2></div><div class="wm-carousel">${[...recommendations].reverse().map(r => tile(base, r, { from: 'pac', longCta: true })).join('')}</div></section>
  <div class="wm-sticky-bar" id="pac-cart"><a class="wm-pill wm-pill-lg" href="${base}/cart">View cart (${t.count})</a></div>
</div>`
}

export function cartPage({ base, t, saved, user, flags }) {
  if (!t.lines.length) {
    // ASSUMPTION: empty-cart copy was not captured; Walmart's current wording is "Time to start shopping!".
    return `<div class="wm-cart-empty"><h1>Time to start shopping!</h1><p>Your cart is empty.</p><a class="wm-pill" href="${base}/">Shop now</a>${savedSection(base, saved)}</div>`
  }
  const lines = t.lines.map(l => `<div class="wm-line">
  <img src="${l.product.art}" alt="">
  <div class="wm-line-info">
    <a href="${productPath(base, l.product)}" class="wm-line-title">${esc(l.product.title)}</a>
    ${l.product.cartBadges.length ? `<div class="wm-badges">${l.product.cartBadges.map(b => `<span class="wm-badge-inline">${esc(b)}</span>`).join('')}</div>` : ''}
    ${l.product.preorder ? `<div class="wm-fine"><b>Preorder</b> &nbsp; ${esc(l.product.releaseText)}</div>` : ''}
    <div class="wm-fine">Free 30-day returns</div>
    <div class="wm-fine">Gift eligible: original packaging</div>
    ${l.product.preorder ? ppg() : ''}
    <form method="post" action="${base}/cart/update" class="wm-line-actions"><input type="hidden" name="pid" value="${l.product.id}"><button type="submit" name="action" value="remove" class="wm-link-btn">Remove</button><button type="submit" name="action" value="save" class="wm-link-btn">Save for later</button></form>
  </div>
  <div class="wm-line-right"><div class="wm-line-price">${money(l.product.price * l.qty)}</div>${stepper(base, l.product, l.qty, `${base}/cart`)}</div>
</div>`).join('')
  return `<div class="wm-cart">
  <div class="wm-cart-main">
    <h1>Cart <span class="wm-cart-n">(${t.count} item${t.count === 1 ? '' : 's'})</span></h1>
    <a class="sr-only" href="#checkout-section">Skip to Checkout Section</a>
    <details class="wm-acc" id="pickup-delivery"><summary>Pickup and delivery options</summary><div class="wm-acc-body"><p>Shipping to ${esc(LOCATION.city)}, ${esc(LOCATION.zip)} is the only option for preorders. Pickup: Check nearby &middot; Delivery: Not available.</p></div></details>
    <div class="wm-group">
      <div class="wm-group-head"><b>Free shipping, arrives by ${esc(ARRIVAL.day)}</b><button type="button" class="wm-zip">${esc(LOCATION.zip)}</button></div>
      <div class="wm-fine">Sold and shipped by Walmart &nbsp;&middot;&nbsp; Free shipping</div>
      ${lines}
    </div>
    ${savedSection(base, saved)}
    <section class="wm-carousel-sec"><div class="wm-section-head"><h2>Discover Great Brands</h2></div><div class="wm-carousel wm-carousel-brands">${['Rockstar Games', 'Sony PlayStation', 'Xbox', 'Turtle Beach', 'Logitech G'].map(b => `<a class="wm-brand-tile" href="${base}/search?q=${encodeURIComponent(b)}">${esc(b)}</a>`).join('')}</div></section>
  </div>
  <aside class="wm-summary" id="checkout-section">
    <form method="post" action="${base}/cart/checkout">
      <button type="submit" class="wm-pill wm-pill-block wm-pill-lg">Continue to checkout</button>
      ${user ? '' : `<p class="wm-fine wm-center">For the best shopping experience, <a href="${base}/account/login?state=%2Fcart">sign in</a></p>`}
      <div class="wm-row"><span>Subtotal (${t.count} item${t.count === 1 ? '' : 's'})</span><span>${money(t.subtotal)}</span></div>
      <div class="wm-row"><span>Shipping</span><span class="wm-green">Free</span></div>
      <div class="wm-row"><span>Taxes</span><span>Calculated at checkout</span></div>
      <div class="wm-row wm-total"><span>Estimated total</span><span>${money(t.total)}</span></div>
      <p class="wm-fine">As low as $14/mo &mdash; No credit impact to apply &mdash; <b>OnePay Later</b> <a href="#">Learn more</a></p>
      <label class="wm-check wm-plus-box" for="plus"><input type="checkbox" id="plus" name="plus" value="1" aria-label="Try 30 days of Walmart+ for just $1! Claim offer" ${flags.plus ? 'checked' : ''}> <span>Try 30 days of ${WPLUS} for just $1! <b>Claim offer</b><br><small>You&rsquo;ll choose your plan at checkout.</small></span></label>
      <label class="wm-check" for="gift"><input type="checkbox" id="gift" name="gift" value="1" ${flags.gift ? 'checked' : ''}> This order is a gift.</label>
      <p class="wm-fine">Earn ${money(Math.floor((75 + t.subtotal * 0.03) * 100 + 1e-6) / 100)} cash back! That&rsquo;s 3% cash back with the OnePay CashRewards Card including a $75 welcome bonus. <a href="#">Learn how</a></p>
    </form>
  </aside>
</div>`
}

function savedSection(base, saved) {
  if (!saved.length) return ''
  return `<section class="wm-saved"><h2>Saved for later (${saved.length})</h2>${saved.map(p => `<div class="wm-line wm-line-saved"><img src="${p.art}" alt=""><div class="wm-line-info"><a href="${productPath(base, p)}" class="wm-line-title">${esc(p.title)}</a><div class="wm-line-price">${money(p.price)}</div><form method="post" action="${base}/cart/update" class="wm-line-actions"><input type="hidden" name="pid" value="${p.id}"><button type="submit" name="action" value="move" class="wm-link-btn">Move to cart</button><button type="submit" name="action" value="forget" class="wm-link-btn">Remove</button></form></div></div>`).join('')}</section>`
}

// ---- identity (identity.walmart.com look) ----
export function loginPage({ base, state, error, identifier = '' }) {
  return `<div class="wm-id-wrap">
  <div class="wm-id-card">
    <h1>Sign in or create your account</h1>
    <p>Not sure if you have an account? Enter your phone number or email and we&rsquo;ll check for you.</p>
    <form method="post" action="${loginHref(base, state)}" novalidate>
      <div class="wm-field"><label for="identifier">Phone number or email (required)</label><input id="identifier" name="identifier" type="text" autocomplete="username" value="${esc(identifier)}" required ${error ? 'aria-invalid="true" aria-describedby="identifier-error"' : ''}>${error ? `<p class="wm-error" id="identifier-error" role="alert">${esc(error)}</p>` : ''}</div>
      <p class="wm-fine">Securing your personal information is our priority. <a href="#">See our privacy measures.</a></p>
      <button type="submit" class="wm-pill wm-pill-block">Continue</button>
    </form>
  </div>
  <div class="wm-id-card wm-id-biz"><b>Walmart Business</b><p>Buying for work?</p><a class="wm-pill wm-pill-white" href="#">Create a business account</a></div>
</div>`
}

export function passwordPage({ base, identifier, isEmail, error, state }) {
  return `<div class="wm-id-wrap"><div class="wm-id-card">
  <h1>Welcome back!</h1>
  <p class="wm-id-who">${esc(identifier)} <a href="${loginHref(base, state)}">${isEmail ? 'Change email address' : 'Change phone number'}</a></p>
  <form method="post" action="${base}/account/signin/withpassword" novalidate>
    <p class="wm-h6">Enter your password</p>
    <div class="wm-field"><label for="password">Password</label><div class="wm-pw"><input id="password" name="password" type="password" autocomplete="current-password" required ${error ? 'aria-invalid="true" aria-describedby="password-error"' : ''}><button type="button" class="wm-show" data-toggle="password">Show</button></div>${error ? `<p class="wm-error" id="password-error" role="alert">${esc(error)}</p>` : ''}</div>
    <p><a href="#" class="wm-link">Forgot password</a></p>
    <label class="wm-check" for="keep"><input type="checkbox" id="keep" name="keep" value="1" aria-label="Keep me signed in" checked> <span>Keep me signed in<br><small>Uncheck if using a public device.</small></span></label>
    <p class="wm-fine">We&rsquo;ll keep you signed in on this device. You may be asked to enter your password when modifying sensitive account information.</p>
    <button type="submit" class="wm-pill wm-pill-block">Sign in</button>
    <button type="button" class="wm-pill wm-pill-white wm-pill-block">Sign in with passkey</button>
  </form>
</div></div>${SHOW_HIDE_JS}`
}

export function signupPage({ base, values = {}, errors = {}, state }) {
  return `<div class="wm-id-wrap"><div class="wm-id-card">
  <h1>Create your Walmart account</h1>
  ${errorSummary(errors)}
  <form method="post" action="${base}/account/sign-up" novalidate>
    ${field({ name: 'firstName', label: 'First name', values, errors, extra: 'autocomplete="given-name" required' })}
    ${field({ name: 'lastName', label: 'Last name', values, errors, extra: 'autocomplete="family-name" required' })}
    ${field({ name: 'email', label: 'Email address', type: 'email', values, errors, extra: 'autocomplete="email" required' })}
    ${field({ name: 'phone', label: 'Phone number', type: 'tel', values, errors, extra: 'autocomplete="tel" inputmode="numeric" required' })}
    <div class="wm-field"><label for="password">Create a password</label><div class="wm-pw"><input id="password" name="password" type="password" autocomplete="new-password" required ${errors.password ? 'aria-invalid="true" aria-describedby="password-error"' : ''}><button type="button" class="wm-show" data-toggle="password">Show</button></div>${errors.password ? `<p class="wm-error" id="password-error">${esc(errors.password)}</p>` : ''}
      <p class="wm-fine">Your password must include the following:</p><ul class="wm-pw-rules"><li>8-100 characters</li><li>Upper &amp; lowercase letters</li><li>At least one number or special character</li></ul></div>
    <label class="wm-check" for="keep"><input type="checkbox" id="keep" name="keep" value="1" aria-label="Keep me signed in" checked> <span>Keep me signed in<br><small>Uncheck if using a public device.</small></span></label>
    <label class="wm-check" for="marketing"><input type="checkbox" id="marketing" name="marketing" value="1" ${values.marketing ? 'checked' : ''}> Send me emails about new arrivals, hot items, daily savings, &amp; more.</label>
    <p class="wm-fine">By clicking Create Account, you acknowledge you have read and agreed to our <a href="#">Terms of Use</a> and <a href="#">Privacy Policy</a>. You also agree to receive account related text messages.</p>
    <button type="submit" class="wm-pill wm-pill-block">Create account</button>
    <p class="wm-center">Already have an account? <a href="${loginHref(base, state)}">Sign in</a></p>
  </form>
</div></div>${SHOW_HIDE_JS}`
}

export function accountPage({ base, user, orders }) {
  return `<div class="wm-account"><h1>Hi, ${esc(user.first_name)}</h1>
  <p>${esc(user.email)} &nbsp;&middot;&nbsp; <a href="${base}/account/logout">Sign out</a></p>
  <h2>Purchase history</h2>
  ${orders.length ? orders.map(o => `<div class="wm-card"><div class="wm-co-sub-head"><div><b>Order number ${esc(o.order_number)}</b><div class="wm-fine">${new Date(o.created_at).toLocaleDateString('en-US')} &middot; ${money(o.totals.total)}</div></div><span class="wm-badge-inline">Preorder &middot; Arrives by ${esc(o.fulfillment.eta)}</span></div>${o.items.map(i => `<div class="wm-fine">${esc(i.title)} &times; ${i.qty}</div>`).join('')}</div>`).join('') : '<p>You have no orders yet.</p>'}
  </div>`
}

// ---- checkout (/checkout/review-order): one page of cards, one form open at a time ----
function fulfillmentCard({ base, t, c, open, values, errors }) {
  const items = t.lines.map(l => `<div class="wm-co-item"><img src="${l.product.art}" alt=""><div><div class="wm-co-item-title">${esc(l.product.title)}</div><div class="wm-fine">Qty ${l.qty}${l.product.preorder ? ` &nbsp;&middot;&nbsp; Preorder, ${esc(l.product.releaseText)}` : ''}</div></div><div class="wm-co-item-price">${money(l.product.price * l.qty)}</div></div>`).join('')
  const a = c.address
  let addressBlock
  if (open === 'address') addressBlock = addressForm({ base, values, errors, editing: !!a })
  else if (a) addressBlock = `<div class="wm-co-sub"><div class="wm-co-sub-head"><h3>Delivery address</h3><a href="${base}/checkout/review-order?edit=address" class="wm-link">Change</a></div><address>${esc(a.firstName)} ${esc(a.lastName)}<br>${esc(a.address1)}${a.address2 ? `, ${esc(a.address2)}` : ''}<br>${esc(a.city)}, ${esc(a.state)} ${esc(a.zip)}<br>${esc(a.phone)}</address></div>`
  else addressBlock = `<div class="wm-co-sub"><h3>Delivery address</h3><a class="wm-pill wm-pill-white" href="${base}/checkout/review-order?edit=address">Add address</a></div>`
  return `<section class="wm-card" id="shipping">
  <div class="wm-card-head">${ICON.truck}<div><h2>Shipping</h2><p>Arrives by ${esc(ARRIVAL.day)}</p></div><a href="${base}/cart" class="wm-link">Edit items</a></div>
  <details class="wm-co-items" open><summary>Items details</summary>${items}</details>
  ${addressBlock}
</section>`
}

function addressForm({ base, values, errors, editing }) {
  return `<form method="post" action="${base}/checkout/address" id="form-address" class="wm-co-form" novalidate>
  <h3>${editing ? 'Edit delivery address' : 'Add address'}</h3>
  ${errorSummary(errors)}
  <div class="wm-2col">${field({ name: 'firstName', label: 'First name*', values, errors, extra: 'autocomplete="given-name" required' })}${field({ name: 'lastName', label: 'Last name*', values, errors, extra: 'autocomplete="family-name" required' })}</div>
  ${field({ name: 'address1', label: 'Street address*', values, errors, extra: 'autocomplete="address-line1" required' })}
  ${field({ name: 'address2', label: 'Apt, suite, etc.', values, errors, extra: 'autocomplete="address-line2"' })}
  <div class="wm-3col">${field({ name: 'city', label: 'City*', values, errors, extra: 'autocomplete="address-level2" required' })}${stateSelect({ name: 'state', label: 'State*', values, errors, extra: 'required' })}${field({ name: 'zip', label: 'Zip code*', values, errors, extra: 'autocomplete="postal-code" inputmode="numeric" required' })}</div>
  ${field({ name: 'phone', label: 'Phone number*', type: 'tel', values, errors, extra: 'autocomplete="tel" required' })}
  <p class="wm-fine">Your phone number will be used to contact you if there is any trouble delivering your order. We will never sell or share your number, or use it for unsolicited marketing.</p>
  <div class="wm-field"><label for="instructions">Delivery instructions (optional)</label><textarea id="instructions" name="instructions" rows="2">${esc(values.instructions ?? '')}</textarea></div>
  <label class="wm-check" for="preferred"><input type="checkbox" id="preferred" name="preferred" value="1" ${values.preferred ? 'checked' : ''}> Set as my preferred address</label>
  <p class="wm-fine">No PO boxes. Military addresses OK.</p>
  <div class="wm-form-actions">${editing ? `<a href="${base}/checkout/review-order" class="wm-link-btn">Cancel</a>` : ''}<button type="submit" class="wm-pill">Save</button></div>
</form>`
}

function paymentCard({ base, c, open, values, errors }) {
  const p = c.payment
  let body
  if (open === 'payment') body = paymentForm({ base, values, errors, editing: !!p })
  else if (p) body = `<div class="wm-co-sub-head"><div class="wm-pay-summary">${ICON.card}<div>${p.method === 'card' ? `${esc(p.brand)} ending in ${esc(p.last4)}<div class="wm-fine">${esc(p.firstName)} ${esc(p.lastName)} &middot; Expires ${esc(p.expiration)}${p.billingSame ? ' &middot; Billing: same as delivery address' : ''}</div>` : 'PayPal'}</div></div><a href="${base}/checkout/review-order?edit=payment" class="wm-link">Change</a></div>`
  else body = c.address ? `<a class="wm-pill wm-pill-white" href="${base}/checkout/review-order?edit=payment">+ Add new payment</a>` : `<p class="wm-fine">Add a payment method after your delivery address is saved.</p>`
  return `<section class="wm-card" id="payment"><h2>Payment method</h2>${body}</section>`
}

function paymentForm({ base, values, errors, editing }) {
  const same = values.billingSame === undefined ? true : !!values.billingSame
  return `<form method="post" action="${base}/checkout/payment" id="form-payment" class="wm-co-form" novalidate>
  <input type="hidden" name="method" value="card">
  <h3>${editing ? 'Edit payment method' : 'Add credit or debit card'}</h3>
  <p class="wm-fine">Credit/Debit Card. Visa, Amex, Discover, Mastercard, Capital One and more accepted.</p>
  <h4>Card information</h4>
  ${errorSummary(errors)}
  ${field({ name: 'cardNumber', label: 'Card number *', values, errors, extra: 'autocomplete="cc-number" inputmode="numeric" required' })}
  <div class="wm-2col">${field({ name: 'firstName', label: 'First name *', values, errors, extra: 'autocomplete="cc-given-name" required' })}${field({ name: 'lastName', label: 'Last name *', values, errors, extra: 'autocomplete="cc-family-name" required' })}</div>
  <div class="wm-2col wm-end">${expirySelects({ values, errors })}${field({ name: 'cvv', label: 'CVV *', values, errors, extra: 'autocomplete="cc-csc" inputmode="numeric" maxlength="4" required' })}</div>
  <p class="wm-fine">Discover, Mastercard and Visa: Use the 3 digits found on the back of your card. American Express: Use the 4 digits on the front of your card. <a href="#">Learn more about CVV</a></p>
  ${field({ name: 'phone', label: 'Phone number*', type: 'tel', values, errors, extra: 'autocomplete="tel" required' })}
  <h4>Billing address</h4>
  <label class="wm-check" for="billingSame"><input type="checkbox" name="billingSame" value="1" id="billingSame" ${same ? 'checked' : ''}> Same as delivery address</label>
  <div id="billing-fields" class="wm-billing">
    ${field({ name: 'billingAddress1', label: 'Street Address*', values, errors, extra: 'autocomplete="billing address-line1"' })}
    ${field({ name: 'billingAddress2', label: 'Apt(optional)', values, errors, extra: 'autocomplete="billing address-line2"' })}
    <div class="wm-3col">${field({ name: 'billingCity', label: 'City*', values, errors, extra: 'autocomplete="billing address-level2"' })}${stateSelect({ name: 'billingState', label: 'State*', values, errors })}${field({ name: 'billingZip', label: 'Zip Code*', values, errors, extra: 'autocomplete="billing postal-code" inputmode="numeric"' })}</div>
  </div>
  <label class="wm-check" for="saveCard"><input type="checkbox" id="saveCard" name="saveCard" value="1" ${values.saveCard === undefined || values.saveCard ? 'checked' : ''}> Save this card to your wallet</label>
  <label class="wm-check" for="defaultCard"><input type="checkbox" id="defaultCard" name="defaultCard" value="1" ${values.defaultCard ? 'checked' : ''}> Set as default card</label>
  <p class="wm-fine">This payment method will be added to your profile. You can edit or remove this card at any time in your Account settings.</p>
  <p class="wm-fine">*Required fields</p>
  <div class="wm-form-actions"><a href="${base}/checkout/review-order" class="wm-link-btn">Cancel</a><button type="submit" class="wm-pill">Save</button></div>
</form>
<div class="wm-alt-pay"><h4>Accepted payment methods</h4>
  <form method="post" action="${base}/checkout/payment" class="wm-alt-pay-form"><input type="hidden" name="method" value="paypal"><button type="submit" class="wm-pill wm-pill-white">Continue to PayPal</button></form>
  <span class="wm-chip">Walmart Gift Card</span><span class="wm-chip">Monthly Payments</span><span class="wm-chip">EBT card</span>
  <p class="wm-fine">Gift cards can&rsquo;t be used to buy digital items.</p>
</div>
<script>(function(){var s=document.getElementById('billingSame'),b=document.getElementById('billing-fields');function t(){b.hidden=s.checked}s.addEventListener('change',t);t()})()</script>`
}

function contactCard({ base, c, open, values, errors }) {
  const k = c.contact
  let body
  if (open === 'contact') body = contactForm({ base, values, errors })
  else if (k) body = `<div class="wm-co-sub-head"><div>${esc(k.email)}<div class="wm-fine">Phone number ending in ${esc(String(k.phone).replace(/\D/g, '').slice(-4))}${k.textUpdates ? ' &nbsp;&middot;&nbsp; Text updates for this order' : ''}</div></div><a href="${base}/checkout/review-order?edit=contact" class="wm-link">Edit Contact</a></div>`
  else body = `<a class="wm-pill wm-pill-white" href="${base}/checkout/review-order?edit=contact">Add an email address</a>`
  return `<section class="wm-card" id="contact"><h2>Contact</h2>${body}</section>`
}

function contactForm({ base, values, errors }) {
  return `<form method="post" action="${base}/checkout/contact" id="form-contact" class="wm-co-form" novalidate>
  ${errorSummary(errors)}
  ${field({ name: 'email', label: 'Email address*', type: 'email', values, errors, extra: 'autocomplete="email" required' })}
  ${field({ name: 'phone', label: 'Phone number (10 digits)', type: 'tel', values, errors, extra: 'autocomplete="tel" inputmode="numeric" required' })}
  <label class="wm-check" for="textUpdates"><input type="checkbox" id="textUpdates" name="textUpdates" value="1" ${values.textUpdates === undefined || values.textUpdates ? 'checked' : ''}> Text updates for this order</label>
  <label class="wm-check" for="marketing"><input type="checkbox" id="marketing" name="marketing" value="1" ${values.marketing ? 'checked' : ''}> Get emails about hot items, great savings, and more</label>
  <p class="wm-fine">Go to Account &gt; Personal info to save your phone number for faster checkout next time.</p>
  <div class="wm-form-actions"><a href="${base}/checkout/review-order" class="wm-link-btn">Cancel</a><button type="submit" class="wm-pill">Save</button></div>
</form>`
}

function plusCard({ base, c, open, values, errors }) {
  const pl = c.plus
  if (!pl?.opted) return ''
  const decline = `<form method="post" action="${base}/checkout/plus" class="wm-decline"><button type="submit" name="decline" value="1" class="wm-link-btn">No thanks, continue without Walmart+</button></form>`
  if (open === 'plus') {
    return `<section class="wm-card wm-plus-card" id="walmart-plus"><h2>${WPLUS}</h2>
  <form method="post" action="${base}/checkout/plus" id="form-plus" class="wm-co-form" novalidate>
    <h3>Choose your plan</h3>
    ${errorSummary(errors)}
    <div class="wm-plans">${Object.values(WALMART_PLUS.plans).map(p => `<label class="wm-plan ${values.plan === p.id ? 'is-selected' : ''}" for="plan-${p.id}"><input type="radio" id="plan-${p.id}" name="plan" value="${p.id}" aria-label="${esc(p.name)}${p.badge ? `, ${esc(p.badge)}` : ''}: 30 days for $1, then ${esc(p.text)} plus applicable tax" ${values.plan === p.id ? 'checked' : ''}> <span><b>${esc(p.name)}</b>${p.badge ? ` <span class="wm-badge-inline">${esc(p.badge)}</span>` : ''}<br><small>30 days for $1, then ${esc(p.text)} plus applicable tax</small></span></label>`).join('')}</div>
    <p class="wm-fine">By signing up, you agree that after the 30-day trial we will charge the fee of $12.95/month or $98/year for the plan you picked, plus applicable tax, until you cancel. <a href="#">See full terms</a></p>
    <label class="wm-check" for="agree"><input type="checkbox" id="agree" name="agree" value="1" ${values.agree ? 'checked' : ''}> I agree to the terms (required)</label>
    <div class="wm-form-actions"><button type="submit" class="wm-pill">Continue</button></div>
  </form>
  ${decline}
</section>`
  }
  if (pl.decided && pl.plan) {
    const plan = WALMART_PLUS.plans[pl.plan]
    return `<section class="wm-card wm-plus-card" id="walmart-plus"><div class="wm-co-sub-head"><div><h2>${WPLUS}</h2><div>30-day trial &middot; ${esc(plan.name)} plan, then ${esc(plan.text)} plus applicable tax</div><div class="wm-fine">Savings/trial: ${money(WALMART_PLUS.trial)}</div></div><a href="${base}/checkout/review-order?edit=plus" class="wm-link">Change</a></div></section>`
  }
  if (pl.decided) return ''
  return `<section class="wm-card wm-plus-card" id="walmart-plus"><h2>${WPLUS}</h2><p>Try 30 days for just $1! Finish picking a plan and verifying your phone number to join Walmart+.</p><div class="wm-form-actions wm-left"><a class="wm-pill wm-pill-white" href="${base}/checkout/review-order?edit=plus">Pick a plan</a>${decline}</div></section>`
}

function summaryRail({ base, t, c, open, ctaLabel }) {
  const cta = open === 'review'
    ? `<form method="post" action="${base}/checkout/place-order" class="wm-place">
      <label class="wm-check" for="gift"><input type="checkbox" id="gift" name="gift" value="1" ${c.gift ? 'checked' : ''}> This order is a gift.</label>
      <button type="submit" class="wm-pill wm-pill-block wm-pill-lg">Place order for ${money(t.total)}</button>
      <p class="wm-fine wm-center">By placing this order, you agree to our <a href="#">Terms of Use</a> and <a href="#">Privacy Policy</a></p>
      ${c.payment?.method === 'card' ? `<p class="wm-fine wm-center">We&rsquo;ll apply a temporary charge of ${money(t.total)} to your payment method.</p>` : ''}
    </form>`
    : `<button type="submit" form="form-${esc(open)}" class="wm-pill wm-pill-block wm-pill-lg">${esc(ctaLabel)}</button>`
  return `<aside class="wm-summary wm-co-summary">
  <h2>Order summary</h2>
  <div class="wm-row"><span>Subtotal (${t.count} item${t.count === 1 ? '' : 's'})</span><span>${money(t.subtotal)}</span></div>
  <div class="wm-row"><span>Shipping</span><span class="wm-green">Free</span></div>
  <div class="wm-row"><span>Taxes</span><span>${t.taxed ? money(t.tax) : '&mdash;'}</span></div>
  ${t.walmartPlus ? `<div class="wm-row"><span>Walmart+ 30-day trial</span><span>${money(t.walmartPlus)}</span></div>` : ''}
  <div class="wm-row wm-total"><span>Estimated total</span><span>${money(t.total)}</span></div>
  ${c.payment ? '' : '<p class="wm-fine">Estimated total does not include all taxes and fees. Select a payment method for a better estimate.</p>'}
  ${cta}
  ${t.lines.some(l => l.product.preorder) ? `<div class="wm-fine">${ppg()}</div>` : ''}
</aside>`
}

export function checkoutPage({ base, t, c, open, ctaLabel, values = {}, errors = {} }) {
  return `<div class="wm-co">
  <div class="wm-co-main">
    <h1 class="sr-only">Review your order</h1>
    ${fulfillmentCard({ base, t, c, open, values, errors })}
    ${paymentCard({ base, c, open, values, errors })}
    ${contactCard({ base, c, open, values, errors })}
    ${plusCard({ base, c, open, values, errors })}
  </div>
  ${summaryRail({ base, t, c, open, ctaLabel })}
</div>`
}

// ---- /thankyou ----
export function thankyouPage({ base, order }) {
  const a = order.shipping_address, pay = order.payment, tt = order.totals
  const trialEnd = new Date(new Date(order.created_at).getTime() + 30 * 864e5).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  return `<div class="wm-ty">
  <div class="wm-ty-head">${ICON.check}<div><h1>Thanks for your order!</h1><p>Now kick back and relax, we&rsquo;ll take care of the rest!</p><p class="wm-ty-num">Order# <span data-order-number>${esc(order.order_number)}</span></p></div></div>
  <div class="wm-ty-actions"><a class="wm-pill" href="${base}/account">Track my order</a><a class="wm-pill wm-pill-white" href="${base}/account">View order details</a><a class="wm-pill wm-pill-white" href="${base}/">Keep shopping</a></div>
  <div class="wm-ty-grid">
    <div>
      <section class="wm-card"><div class="wm-card-head">${ICON.truck}<div><h2>Shipping</h2><p>Arrives by ${esc(order.fulfillment.eta)}</p></div></div>
        ${order.items.map(it => `<div class="wm-co-item"><div><div class="wm-co-item-title">${esc(it.title)}</div><div class="wm-fine">Qty ${it.qty}</div></div><div class="wm-co-item-price">${money(it.unit_price * it.qty)}</div></div>`).join('')}
        <div class="wm-co-sub"><h3>Delivery address</h3><address>${esc(a.first_name)} ${esc(a.last_name)}<br>${esc(a.line1)}${a.line2 ? `, ${esc(a.line2)}` : ''}<br>${esc(a.city)}, ${esc(a.state)} ${esc(a.postal_code)}<br>${esc(a.phone)}</address></div>
      </section>
      <section class="wm-card"><h2>Payment method</h2><p>${pay.method === 'card' ? `${esc(pay.brand)} ending in ${esc(pay.last4)}` : 'PayPal'}</p></section>
      <section class="wm-card"><h2>Contact</h2><p>${esc(order.customer.email)}<br><span class="wm-fine">Phone number ending in ${esc(String(order.customer.phone ?? '').replace(/\D/g, '').slice(-4))}</span></p></section>
      ${order.meta.walmart_plus ? `<section class="wm-card wm-plus-card"><h2>${WPLUS}</h2><p>Your W+ trial membership has been created. Cancel anytime through your Account until ${esc(trialEnd)} to avoid charges.</p></section>` : ''}
      <section class="wm-card"><h2>Get order updates</h2><p>Verify your phone number to secure your account and get order updates.</p><a class="wm-pill wm-pill-white" href="#">Verify phone number</a></section>
    </div>
    <aside class="wm-summary">
      <h2>Order summary</h2>
      <div class="wm-row"><span>Subtotal (${order.items.reduce((n, i) => n + i.qty, 0)} item${order.items.reduce((n, i) => n + i.qty, 0) === 1 ? '' : 's'})</span><span>${money(tt.subtotal)}</span></div>
      <div class="wm-row"><span>Shipping</span><span class="wm-green">Free</span></div>
      <div class="wm-row"><span>Taxes</span><span>${money(tt.tax)}</span></div>
      ${tt.walmart_plus ? `<div class="wm-row"><span>Walmart+ 30-day trial</span><span>${money(tt.walmart_plus)}</span></div>` : ''}
      <div class="wm-row wm-total"><span>Total</span><span>${money(tt.total)}</span></div>
      <p class="wm-fine">Unless you paid with a gift card or PayPal, you will not be charged until the preordered item ships.</p>
    </aside>
  </div>
</div>`
}

export function simplePage({ title, html }) {
  return `<div class="wm-simple"><h1>${esc(title)}</h1>${html}</div>`
}
