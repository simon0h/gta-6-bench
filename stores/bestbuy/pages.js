import { esc, money, disclaimer } from '../../lib/html.js'
import { GAME } from '../../lib/catalog.js'
import { productPath, games, STATES, STORE_NAME, SHIP_ZIP, RELEASE, FULFILLMENT } from './data.js'

const NAME = 'Best Buy'
const NAV_MENUS = ['Shop', 'Deals', 'Support & Services', 'Discover']
const NAV_LINKS = ['Sports Hub', 'Top Deals', 'Deal of the Day', 'Gift Ideas', 'Best Buy Membership', 'Financing & Rewards', 'Gift Cards', 'Trade-In', 'Best Buy Business']
const HUB_PATH = '/site/video-game-franchises/grand-theft-auto/pcmcat301800050002.c'

const ICON_CART = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.5L21 8H6.2"/><circle cx="10" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/></svg>'
const ICON_SEARCH = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><circle cx="10.5" cy="10.5" r="7"/><path d="m21 21-5.2-5.2"/></svg>'
const ICON_USER = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>'
const ICON_PIN = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 22s7-7.1 7-12a7 7 0 0 0-14 0c0 4.9 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>'

const logo = (base) => `<a class="bb-logo" href="${base}/" aria-label="best buy home"><span class="bb-tag">BEST<br>BUY</span></a>`
const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`

export function layout({ base, title, body, cartCount = 0, user = null, chrome = 'full', back = null }) {
  const header = chrome === 'full' ? `<header class="bb-header">
  <div class="bb-header-top">
    ${logo(base)}
    <form class="bb-search" action="${base}/site/searchpage.jsp" method="get" role="search">
      <input type="search" name="st" placeholder="Search Best Buy" aria-label="What can we help you find? Suggestions appear below" autocomplete="off">
      <button type="submit" aria-label="Submit search">${ICON_SEARCH}</button>
    </form>
    <button type="button" class="bb-store-pick">${ICON_PIN} <span>Your Store: <b>${STORE_NAME}</b></span></button>
    ${user ? `<a class="bb-account" href="${base}/account">${ICON_USER} <span>Hi, ${esc(user.first_name || 'there')}</span></a>` : `<a class="bb-account" href="${base}/identity/global/signin">${ICON_USER} <span>Account</span></a>`}
    <a class="bb-cart-link" href="${base}/cart" aria-label="cart, ${plural(cartCount, 'item')}">${ICON_CART}${cartCount ? `<span class="bb-cart-count">${cartCount}</span>` : ''}</a>
  </div>
  <nav class="bb-nav" aria-label="Site">
    ${NAV_MENUS.map(n => `<button type="button" class="bb-menu-btn">${esc(n)} &#9662;</button>`).join('')}
    ${NAV_LINKS.map(n => `<a href="${base}/site/searchpage.jsp?st=${encodeURIComponent(n)}">${esc(n)}</a>`).join('')}
  </nav>
  <div class="bb-band">Pre-order <a href="${base}${HUB_PATH}">Grand Theft Auto VI</a> &mdash; Available to play ${RELEASE.playLong}.</div>
</header>` : `<header class="bb-header bb-header-slim">
  <div class="bb-header-top">
    ${logo(base)}
    ${back ? `<a class="bb-back" href="${esc(back.href)}">${esc(back.label)}${back.count ? ` <span class="bb-cart-count">${back.count}</span>` : ''}</a>` : ''}
  </div>
</header>`
  const footer = chrome === 'full' ? `<footer class="bb-footer">
  <div class="bb-footer-cols">
    <div><h4>Order &amp; Purchases</h4><a href="#">Check Order Status</a><a href="#">Shipping, Delivery &amp; Store Pickup</a><a href="#">Returns &amp; Exchanges</a><a href="#">Price Match Guarantee</a></div>
    <div><h4>Payment Options</h4><a href="#">My Best Buy&reg; Credit Card</a><a href="#">Pay Your Bill at Citibank</a><a href="#">Lease to Own</a><a href="#">Gift Cards</a></div>
    <div><h4>Support &amp; Services</h4><a href="#">Visit our Support Center</a><a href="#">Shop with an Expert</a><a href="#">Schedule a Service</a><a href="#">Manage an Appointment</a></div>
    <div><h4>Rewards &amp; Membership</h4><a href="#">My Best Buy Memberships&trade;</a><a href="#">View Points &amp; Certificates</a><a href="#">Member Offers</a></div>
  </div>
  <p class="bb-copy">Returns &amp; Exchanges &middot; Get Support &middot; Give Feedback &middot; Terms &amp; Conditions &middot; Privacy &middot; Interest-Based Ads<br>Prices and offers are subject to change. &copy; 2026 Best Buy. All rights reserved. BEST BUY, the BEST BUY logo, the tag design, and MY BEST BUY are trademarks of Best Buy and its affiliated companies.</p>
  ${disclaimer(NAME)}
</footer>` : `<footer class="bb-footer bb-footer-slim">
  <p class="bb-copy">Returns &amp; Exchanges &middot; Get Support &middot; Give Feedback &middot; Terms &amp; Conditions &middot; Privacy &middot; Interest-Based Ads<br>Prices and offers are subject to change. &copy; 2026 Best Buy. All rights reserved.</p>
  ${disclaimer(NAME)}
</footer>`
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<link rel="stylesheet" href="${base}/static/style.css"></head>
<body>
${header}
<main class="bb-main">${body}</main>
${footer}
</body></html>`
}

// ---- shared bits ----
function stars(p) {
  if (!p.rating) return `<span class="bb-not-reviewed">${p.preorder ? 'Not yet reviewed' : 'Not yet reviewed'}</span>`
  const full = Math.round(p.rating.stars)
  return `<span class="bb-stars" aria-label="Rated ${p.rating.stars} out of 5 stars with ${p.rating.count} reviews"><span class="bb-star-row">${'&#9733;'.repeat(full)}${'&#9734;'.repeat(5 - full)}</span> ${p.rating.stars} (${p.rating.count} reviews)</span>`
}

function tile(base, p) {
  const href = productPath(base, p)
  return `<article class="bb-tile">
  ${p.badge ? `<span class="bb-badge">${esc(p.badge)}</span>` : '<span class="bb-badge bb-badge-empty"></span>'}
  <a class="bb-tile-img" href="${href}"><img src="${p.art}" alt="${esc(p.title)}"></a>
  <h3 class="bb-tile-title"><a href="${href}">${esc(p.title)}</a></h3>
  <ul class="bb-tile-meta">
    ${p.esrb ? `<li>ESRB Ratings: ${esc(p.esrb)}</li>` : ''}
    ${p.publisher ? `<li>Publisher: ${esc(p.publisher)}</li>` : ''}
    ${!p.esrb && p.softwareFormat ? `<li>Format: ${esc(p.softwareFormat)}</li>` : ''}
    <li>Release Date: ${esc(p.release)}</li>
  </ul>
  <div class="bb-tile-rating">${stars(p)}</div>
  <div class="bb-tile-price">${money(p.price)}</div>
  <form method="post" action="${base}/cart/add"><input type="hidden" name="pid" value="${p.sku}"><button class="bb-btn bb-btn-yellow bb-btn-block" type="submit">${p.preorder ? 'Pre-order' : 'Add to cart'}</button></form>
  <div class="bb-tile-actions"><label><input type="checkbox"> Compare</label><a class="bb-heart" href="${base}/identity/global/signin">&#9825; Save</a></div>
</article>`
}

function summaryRows(t, { taxLabel = 'Estimated Sales Tax', showShipping = true } = {}) {
  return `<div class="bb-row"><span>Subtotal</span><span>${money(t.subtotal)}</span></div>
    ${showShipping || t.hasShipping ? `<div class="bb-row"><span>Shipping</span><span>FREE</span></div>` : ''}
    ${t.hasPickup ? `<div class="bb-row"><span>Store Pickup</span><span>FREE</span></div>` : ''}
    <div class="bb-row"><span>${taxLabel}</span><span>${money(t.tax)}</span></div>
    <div class="bb-row bb-total"><span>Total</span><span>${money(t.total)}</span></div>`
}

// ---- home / franchise hub ----
export function homePage({ base, products }) {
  const game = products.filter(p => p.kind === 'game')
  const music = products.filter(p => /The Album/.test(p.title))
  const controller = products.filter(p => /DualSense/.test(p.title))
  return `<section class="bb-hero">
  <div class="bb-hero-text">
    <p class="bb-eyebrow">Pre-order</p>
    <h1>Grand Theft Auto VI</h1>
    <p>Pre-order your copy now and check out an exclusive offer.</p>
    <p><b>Available to play ${RELEASE.playLong}.</b></p>
    <a class="bb-btn bb-btn-yellow" href="#preorder-game">Pre-order this game</a>
  </div>
  <img src="${game[0].art}" alt="Grand Theft Auto VI box art">
</section>
<section id="preorder-game" class="bb-section"><h2>Pre-order Grand Theft Auto VI</h2><div class="bb-grid">${game.map(p => tile(base, p)).join('')}</div></section>
<section class="bb-section"><h2>Pre-order the music</h2><div class="bb-grid">${music.map(p => tile(base, p)).join('')}</div></section>
<section class="bb-section"><h2>Pre-order Limited Edition controller</h2><div class="bb-grid">${controller.map(p => tile(base, p)).join('')}</div></section>
<section class="bb-section bb-member-offer"><h2>Exclusive My Best Buy offer</h2><p>Plus and Total members get 10x rewards with pre-order of Grand Theft Auto VI. Exclusions, terms and conditions apply.</p><a class="bb-btn bb-btn-yellow" href="${productPath(base, game[0])}">Pre-order</a></section>
<section class="bb-section bb-notify"><h2>Sign up to receive notifications about Grand Theft Auto VI</h2><form onsubmit="return false"><label for="notify-email" class="visually-hidden">Enter your email address</label><input id="notify-email" type="email" placeholder="Enter your email address"><button type="button" class="bb-btn bb-btn-blue">Sign up to be notified</button></form></section>
<section class="bb-section"><h2>About Grand Theft Auto VI</h2><p>${esc(GAME.description)}</p></section>`
}

// ---- search ----
export function searchPage({ base, q, products }) {
  const hasGame = products.some(p => p.kind === 'game')
  const facets = `<aside class="bb-filters"><h2>Filters</h2>
  <details open><summary>Get it fast</summary><label><input type="checkbox"> Pickup &middot; Ready today <a href="#">Select Store</a></label><label><input type="checkbox"> Shipping &middot; Get it today <a href="#">${SHIP_ZIP}</a></label></details>
  <details open><summary>Sold &amp; shipped by</summary><label><input type="checkbox"> Best Buy</label></details>
  <details open><summary>Category</summary><label><input type="checkbox"> All Video Games</label><label><input type="checkbox"> Physical Video Games</label><label><input type="checkbox"> XBOX Series X|S</label><a href="#">Show all (4)</a></details>
  <details><summary>Compatible Platform</summary><label><input type="checkbox"> PlayStation 5</label><label><input type="checkbox"> XBOX Series X</label><label><input type="checkbox"> PlayStation 4</label><label><input type="checkbox"> Nintendo Switch</label><label><input type="checkbox"> Windows</label><label><input type="checkbox"> XBOX Series S</label><a href="#">Show all (10)</a></details>
  <details><summary>Format</summary><label><input type="checkbox"> Physical</label><label><input type="checkbox"> Physical (Download Code Only)</label><label><input type="checkbox"> CD</label><label><input type="checkbox"> VINYL</label></details>
  <details><summary>Price</summary><label><input type="checkbox"> $50 - $99.99</label><label><input type="checkbox"> $25 - $49.99</label><label><input type="checkbox"> Less than $25</label></details>
  <details><summary>Brand</summary><label><input type="checkbox"> Rockstar Games</label><label><input type="checkbox"> Sony Interactive Entertainment</label><label><input type="checkbox"> Take 2 Interactive</label></details>
  <details><summary>Current Deals</summary><label><input type="checkbox"> On Sale</label></details>
  <details><summary>Genre</summary><label><input type="checkbox"> Action</label><label><input type="checkbox"> Adventure</label></details>
  <details><summary>Upcoming and New</summary><label><input type="checkbox"> Pre-Order</label></details>
  <details><summary>ESRB Rating</summary><label><input type="checkbox"> RP (Rating Pending)</label><label><input type="checkbox"> M (Mature 17+)</label></details>
  <details><summary>Customer Rating</summary><label><input type="checkbox"> 4 &amp; Up</label></details>
  <details><summary>Game Franchise</summary><label><input type="checkbox"> Grand Theft Auto</label><label><input type="checkbox"> Call of Duty</label></details>
  </aside>`
  const banner = hasGame ? `<div class="bb-promo-banner"><b>Grand Theft Auto VI</b><span>Exclusive member offer available with pre-order.</span><a href="${base}${HUB_PATH}">Pre-order this game</a><span>Available to play ${RELEASE.playLong}.</span></div>` : ''
  const related = ['gta 6', 'ps5', 'ps5 controller', 'playstation 5', 'grand theft auto 6']
  return `<div class="bb-search-page">
  <h1 class="visually-hidden">${esc(q)} search results</h1>
  <div class="bb-search-body">${facets}
  <div class="bb-results">
    <div class="bb-results-head"><h2 class="bb-results-title">${esc(q)} (${products.length})</h2><span class="bb-chip">Current Deals: On Sale</span><label class="bb-sort">Sort by: <select aria-label="Sort by"><option>Best Match</option><option>Price Low to High</option><option>Price High to Low</option><option>Release Date</option><option>Customer Rating</option></select></label></div>
    ${banner}
    ${products.length ? `<div class="bb-grid">${products.map(p => tile(base, p)).join('')}</div><p class="bb-results-count">${products.length} of ${products.length} products</p>` : `<div class="bb-empty"><p>Sorry, we didn't find any results for &ldquo;${esc(q)}&rdquo;.</p><p>Check your spelling, try a different search, or browse our categories.</p></div>`}
    <div class="bb-related"><b>Related searches</b> ${related.map(r => `<a class="bb-chip" href="${base}/site/searchpage.jsp?st=${encodeURIComponent(r)}">${esc(r)}</a>`).join('')}</div>
  </div></div></div>`
}

// ---- product page ----
export function productPage({ base, p, accessories }) {
  const isGame = p.kind === 'game'
  const zipPay = money(Math.round(p.price / 4 * 100) / 100)
  const chips = isGame ? games().map(s => `<a class="bb-chip-platform${s.sku === p.sku ? ' is-selected' : ''}" href="${productPath(base, s)}" aria-current="${s.sku === p.sku ? 'true' : 'false'}">${esc(s.platformLabel)}</a>`).join('') + `<a class="bb-chip-platform" href="${base}/site/searchpage.jsp?st=grand+theft+auto">+ 4 more</a>` : ''
  const pickupHelp = p.preorder ? `Order now for pickup on Release Date at <b>${STORE_NAME}</b>` : `Order now for pickup today at <b>${STORE_NAME}</b>`
  const pickupDetail = p.preorder ? FULFILLMENT.pickup.detail : 'Ready in 1 hour'
  const shipDetail = p.preorder ? FULFILLMENT.shipping.detail : 'Get it in 2-4 days'
  const [dollars, cents] = p.price.toFixed(2).split('.')
  return `<nav class="bb-crumbs" aria-label="Breadcrumb"><a href="${base}/">Best Buy</a> &rsaquo; <a href="${base}/site/searchpage.jsp?st=video+games">Video Games</a> &rsaquo; <a href="${base}/site/searchpage.jsp?st=video+games">All Video Games</a> &rsaquo; <a href="${base}/site/searchpage.jsp?st=${encodeURIComponent(p.category)}">${esc(p.category)}</a></nav>
<p class="bb-shop-brand"><a href="${base}/site/searchpage.jsp?st=${encodeURIComponent(p.brand)}">Shop ${esc(p.brand)}</a></p>
<div class="bb-pdp">
  <div class="bb-pdp-main">
    ${p.badge ? `<p class="bb-badge-line"><span class="bb-badge">${esc(p.badge)}</span>${p.badgeIn ? ` <span class="bb-badge-in">${esc(p.badgeIn)}</span>` : ''}</p>` : ''}
    <h1>${esc(p.title)}</h1>
    <p class="bb-pdp-meta">${p.esrb ? `ESRB Rating: ${esc(p.esrb)} &middot; ` : ''}SKU: ${esc(p.sku)} &middot; Release Date: ${esc(p.release)} &middot; ${p.rating ? stars(p) : 'Reviews coming soon'} &middot; Sold by Best Buy</p>
    <div class="bb-gallery"><div class="bb-thumbs">${[1, 2, 3, 4].map(() => `<img src="${p.art}" alt="">`).join('')}<a href="#" class="bb-fine">View All Images</a></div><img class="bb-gallery-hero" src="${p.art}" alt="${esc(p.title)}">${isGame ? '<p class="bb-gallery-caption">PRE-ORDER BONUS OCEAN VIEW VINTAGE VICE CITY PACK</p>' : ''}</div>
    <section class="bb-about"><h2>About this product</h2>${p.about.map(t => `<p>${esc(t)}</p>`).join('')}</section>
    ${isGame ? `<section class="bb-platforms"><h2>Compatible Platform(s): ${esc(p.platformLabel)}</h2><div class="bb-chip-row">${chips}</div></section>` : ''}
  </div>
  <aside class="bb-buybox">
    <div class="bb-price-big" aria-label="${money(p.price)}"><sup>$</sup>${dollars}<sup>${cents}</sup></div>
    <p class="bb-zip">or 4 payments starting at ${zipPay} with <b class="bb-zip-logo">Zip</b> <a href="#">Learn more &rsaquo;</a></p>
    <form method="post" action="${base}/cart/add" class="bb-buy-form">
      <input type="hidden" name="pid" value="${p.sku}">
      <fieldset class="bb-avail"><legend>Availability</legend>
        <label class="bb-avail-card"><input type="radio" name="fulfillment" value="pickup" checked><span class="bb-avail-text"><b>${FULFILLMENT.pickup.label}</b><span>${pickupDetail}</span><small>${pickupHelp}</small></span></label>
        <label class="bb-avail-card"><input type="radio" name="fulfillment" value="shipping"><span class="bb-avail-text"><b>${FULFILLMENT.shipping.label}</b><span>${shipDetail}</span><small>FREE shipping to <b>${SHIP_ZIP}</b></small></span></label>
      </fieldset>
      <button class="bb-btn bb-btn-yellow bb-btn-preorder" type="submit">${p.preorder ? 'Pre-order' : 'Add to cart'}</button>
    </form>
    <div class="bb-buybox-actions"><a href="${base}/identity/global/signin">&#9825; Save</a><a href="${base}/identity/global/signin">&#128276; Deal Alert</a></div>
    <p class="bb-fine">Sold by Best Buy &middot; <a href="#">Return &amp; Exchange Policy</a></p>
    <div class="bb-finance"><h3>Finance options</h3><p>10% back in rewards on your first day of purchases when approved for the My Best Buy&reg; Credit Card or choose financing</p><p><b>Buy now. Pay later.</b> 4 payments starting at ${zipPay}</p></div>
    ${isGame ? `<div class="bb-member-box"><b>Exclusive My Best Buy offer</b><p>Plus and Total members get 10x rewards with pre-order of Grand Theft Auto VI. Exclusions, terms and conditions apply.</p><a href="${base}/identity/global/signin">Sign in or join</a></div>` : ''}
  </aside>
</div>
${accessories.length ? `<section class="bb-section"><h2>Key Accessories:</h2><div class="bb-carousel">${accessories.map(a => `<div class="bb-mini"><a href="${productPath(base, a)}"><img src="${a.art}" alt=""><span>${esc(a.title)}</span></a><b>${money(a.price)}</b><form method="post" action="${base}/cart/add"><input type="hidden" name="pid" value="${a.sku}"><button class="bb-btn bb-btn-yellow bb-btn-sm" type="submit">${a.preorder ? 'Pre-order' : 'Add to cart'}</button></form></div>`).join('')}</div></section>` : ''}
<section class="bb-section"><h2>Features</h2><dl class="bb-features">${p.features.map(f => `<dt>${esc(f.name)}</dt><dd>${esc(f.text)}</dd>`).join('')}</dl><a href="#">See all features</a></section>
<section class="bb-section"><h2>Specifications</h2><table class="bb-specs">${p.esrb ? `<tr><th>ESRB Rating</th><td>${esc(p.esrb)}</td></tr>` : ''}${isGame ? `<tr><th>Compatible Platform(s)</th><td>${esc(p.platformLabel)}</td></tr>` : ''}${p.softwareFormat ? `<tr><th>Software Format</th><td>${esc(p.softwareFormat)}</td></tr>` : ''}<tr><th>Brand</th><td>${esc(p.brand)}</td></tr><tr><th>Release Date</th><td>${esc(p.release)}</td></tr></table><a href="#">See all specifications</a></section>
<section class="bb-section"><h2>Reviews</h2><p class="bb-fine">${p.rating ? stars(p) : 'Reviews coming soon. Be the first to review this product.'}</p></section>
${isGame ? `<section class="bb-section"><h2>Compare similar products</h2><table class="bb-specs bb-compare"><tr><th></th>${games().map(s => `<th>${esc(s.platformLabel)}</th>`).join('')}</tr><tr><th>Price</th>${games().map(s => `<td>${money(s.price)}</td>`).join('')}</tr><tr><th>Release Date</th>${games().map(s => `<td>${esc(s.release)}</td>`).join('')}</tr><tr><th>Software Format</th>${games().map(s => `<td>${esc(s.softwareFormat)}</td>`).join('')}</tr></table></section>
<section class="bb-section"><h2>Questions &amp; Answers</h2><p><b>Q:</b> Where is ultimate version?</p><p class="bb-fine"><b>A:</b> The Grand Theft Auto VI: Ultimate Edition Upgrade will be available to Standard Edition owners as a digital add-on through the PlayStation and Xbox storefronts.</p></section>` : ''}`
}

// ---- cart ----
export function cartPage({ base, t, savedMsg, alsoBought, saved = [] }) {
  const savedSection = `<section class="bb-saved"><h2>Saved Items</h2>${saved.length
    ? saved.map(s => `<div class="bb-saved-item"><img src="${s.product.art}" alt=""><div><a href="${productPath(base, s.product)}">${esc(s.product.title)}</a><p><b>${money(s.product.price)}</b></p>
      <form method="post" action="${base}/cart/saved"><input type="hidden" name="pid" value="${s.product.sku}"><button type="submit" name="action" value="move" class="bb-link-btn">Move to cart</button><button type="submit" name="action" value="remove" class="bb-link-btn">Remove</button></form></div></div>`).join('')
    : '<p>Your list is currently empty</p><p class="bb-fine">Need inspiration? Check out recommended items, or search for items to save.</p>'}</section>`
  if (!t.lines.length) {
    return `<div class="bb-cart-empty"><h1>Your cart is empty</h1><p>Have an account? <a href="${base}/identity/global/signin">Sign in</a> to see your cart.</p><a class="bb-btn bb-btn-blue" href="${base}/">Continue shopping</a></div>${saved.length ? savedSection : ''}`
  }
  const rows = t.lines.map(l => {
    const p = l.product
    return `<div class="bb-line">
  <img src="${p.art}" alt="">
  <div class="bb-line-body">
    <a class="bb-line-title" href="${productPath(base, p)}">${esc(p.title)}</a>
    ${p.finalSale ? '<p class="bb-final">Final sale. Not returnable.</p>' : ''}
    <p class="bb-fine">Sold by Best Buy ${p.preorder ? '<span class="bb-pill">Pre-order</span>' : ''}</p>
    <form method="post" action="${base}/cart/update" class="bb-line-form">
      <input type="hidden" name="line" value="${l.line}">
      <fieldset class="bb-item-avail"><legend>Item Availability</legend>
        <label><input type="radio" name="availability-selection" id="availability-selection-pickup-${l.line}" value="pickup" ${l.fulfillment === 'pickup' ? 'checked' : ''} onchange="this.form.submit()"> <b>Pickup at ${STORE_NAME}</b><span>${p.preorder ? FULFILLMENT.pickup.eta : 'Ready in 1 hour'}</span></label>
        <label><input type="radio" name="availability-selection" id="availability-selection-shipping-${l.line}" value="shipping" ${l.fulfillment === 'shipping' ? 'checked' : ''} onchange="this.form.submit()"> <b>FREE Shipping to ${SHIP_ZIP}</b><span>${p.preorder ? FULFILLMENT.shipping.eta : 'Get it in 2-4 days'}</span></label>
      </fieldset>
      <div class="bb-line-actions">
        <label>Item Quantity <select name="qty" onchange="this.form.submit()">${[1, 2, 3].map(n => `<option value="${n}" ${n === l.qty ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
        <noscript><button type="submit" name="action" value="update" class="bb-link-btn">Update</button></noscript>
        <button type="submit" name="action" value="save" class="bb-link-btn">Save for later</button>
        <button type="submit" name="action" value="remove" class="bb-link-btn">Remove</button>
      </div>
    </form>
  </div>
  <div class="bb-line-price"><span>Price</span><b>${money(p.price * l.qty)}</b></div>
</div>`
  }).join('')
  return `<h1>Your Cart</h1>
${savedMsg ? `<p class="bb-notice">${esc(savedMsg)}</p>` : ''}
<div class="bb-cart">
  <div class="bb-cart-items">
    ${rows}
    ${savedSection}
    <section class="bb-section"><h2>People also bought</h2><div class="bb-carousel">${alsoBought.map(a => `<div class="bb-mini"><a href="${productPath(base, a)}"><img src="${a.art}" alt=""><span>${esc(a.title)}</span></a><b>${money(a.price)}</b></div>`).join('')}</div></section>
  </div>
  <aside class="bb-summary">
    <h2>Order Summary</h2>
    ${summaryRows(t)}
    <form method="post" action="${base}/checkout/r/fast-track" class="checkout-buttons__checkout"><button class="bb-btn bb-btn-checkout bb-btn-block" type="submit">Checkout</button></form>
    <form method="post" action="${base}/cart/paypal"><button class="bb-paypal bb-btn-block" type="submit"><span class="bb-pp1">Pay</span><span class="bb-pp2">Pal</span> Checkout</button></form>
    <p class="bb-fine bb-center">By using PayPal Checkout, you agree to Best Buy's Terms &amp; Privacy Policy</p>
    <div class="bb-promo-list">
      <p>My Best Buy&reg; members enjoy exclusive offers &amp; free shipping on eligible items with no minimum purchase. <a href="${base}/identity/global/signin">Sign in or create an account now</a></p>
      <p>10% back in rewards on first day of purchases or flexible financing for new My Best Buy&reg; Credit Cardmembers. <a href="#">Show me how &rsaquo;</a></p>
      <p>Looking for a lease to own option? Enjoy the tech you want today. <a href="#">Learn more &rsaquo;</a></p>
      <p>${t.zip.n} payments starting at ${money(t.zip.amount)} &mdash; Select <b>Zip</b> under 'Other payment options' when checking out.</p>
      <p>Buying a gift for someone special? Gift options can be added in checkout. <a href="#">Learn more &rsaquo;</a></p>
    </div>
  </aside>
</div>
<div class="bb-assist" aria-hidden="true"><b>Best Buy Help</b><span>Hi, need shopping advice or product support? Let me know.</span><span class="bb-assist-chips"><span>Price Match</span><span>Change Shipping or Pickup</span><span>Payment Methods</span></span></div>`
}

// ---- sign in ----
const field = ({ name, label, id = name, type = 'text', value = '', error, extra = '', help = '' }) =>
  `<div class="bb-field${error ? ' has-error' : ''}"><label for="${esc(id)}">${label}</label><input id="${esc(id)}" name="${esc(name)}" type="${type}" value="${esc(value)}" ${extra}${error ? ` aria-invalid="true" aria-describedby="err-${esc(name)}"` : ''}>${help}${error ? `<span class="bb-error" id="err-${esc(name)}">${esc(error)}</span>` : ''}</div>`

// mode: 'checkout' (interstitial after the cart's Checkout button) or 'global' (header account link).
// stage: 'email' (first screen) or 'password' (the real site asks for the password on the next screen).
export function signinPage({ base, mode, stage = 'email', email = '', error }) {
  const action = mode === 'checkout' ? `${base}/identity/signin` : `${base}/identity/global/signin`
  const form = stage === 'password'
    ? `<form method="post" action="${action}" novalidate>
      <input type="hidden" name="action" value="signin">
      <input type="hidden" name="email" value="${esc(email)}">
      <p class="bb-signin-email">${esc(email)} <a href="${action}">Change</a></p>
      ${field({ name: 'password', label: 'Password', id: 'fld-p', type: 'password', extra: 'autocomplete="current-password" required', error })}
      <label class="bb-check"><input type="checkbox" name="keepSignedIn" value="1"> Keep me signed in.</label>
      <p class="bb-fine">By continuing or signing in, you agree to our Terms and Conditions, Privacy Policy, and My Best Buy&trade; Terms.</p>
      <button class="bb-btn bb-btn-blue bb-btn-block" type="submit">Sign In</button>
      <p class="bb-fine"><a href="#">Forgot your password?</a></p>
    </form>`
    : `<form method="post" action="${action}" novalidate>
      <input type="hidden" name="action" value="signin">
      ${field({ name: 'email', label: 'Email Address', id: 'fld-e', type: 'email', value: email, extra: 'autocomplete="email" required', error })}
      <label class="bb-check"><input type="checkbox" name="keepSignedIn" value="1"> Keep me signed in.</label> <span class="bb-fine">We'll keep you signed in on this device.</span>
      <p class="bb-fine">By continuing or signing in, you agree to our Terms and Conditions, Privacy Policy, and My Best Buy&trade; Terms.</p>
      <button class="bb-btn bb-btn-blue bb-btn-block" type="submit">Continue</button>
    </form>
    <div class="bb-alt-signin"><button type="button" class="bb-btn bb-btn-outline bb-btn-block">Sign in with a Passkey</button><button type="button" class="bb-btn bb-btn-outline bb-btn-block">Sign in with Apple</button><button type="button" class="bb-btn bb-btn-outline bb-btn-block">Sign in with Google</button></div>`
  const right = mode === 'checkout'
    ? `<section class="bb-signin-col cia-guest-content"><h2>New Customers</h2>
      <p>Don't have an account? No problem, you can check out as a guest. You'll have the option to create an account during checkout.</p>
      <p class="bb-fine">By continuing as guest, you agree to our Terms and Conditions and Privacy Policy.</p>
      <form method="post" action="${action}"><input type="hidden" name="action" value="guest"><button class="bb-btn bb-btn-outline bb-btn-block js-cia-guest-button" type="submit">Continue as Guest</button></form>
    </section>`
    : `<section class="bb-signin-col"><h2>New Customers</h2>
      <p>Don't have an account? Create an account to check out faster, track orders and earn My Best Buy rewards.</p>
      <a class="bb-btn bb-btn-outline bb-btn-block" href="${base}/identity/newAccount">Create an account</a>
    </section>`
  return `<div class="bb-signin">
  <h1>${mode === 'checkout' ? 'Sign In to Best Buy' : 'Sign in or create your account'}</h1>
  <div class="bb-signin-cols">
    <section class="bb-signin-col"><h2>Returning Customers</h2><p>Sign in for faster checkout.</p>${form}</section>
    <div class="bb-or">or</div>
    ${right}
  </div>
</div>`
}

export function createAccountPage({ base, values = {}, errors = {} }) {
  const f = (name, label, type = 'text', extra = '') => field({ name, label, type, value: values[name] ?? '', error: errors[name], extra })
  return `<div class="bb-signin bb-signin-single">
  <h1>Create an account</h1>
  <form method="post" action="${base}/identity/newAccount" novalidate>
    <div class="bb-2col">${f('firstName', 'First name', 'text', 'autocomplete="given-name" required')}${f('lastName', 'Last name', 'text', 'autocomplete="family-name" required')}</div>
    ${f('email', 'Email address', 'email', 'autocomplete="email" required')}
    ${f('password', 'Password', 'password', 'autocomplete="new-password" required')}
    ${f('phone', 'Phone number (optional)', 'tel', 'autocomplete="tel"')}
    <p class="bb-fine">By creating an account, you agree to our Terms and Conditions, Privacy Policy, and My Best Buy&trade; Terms.</p>
    <button class="bb-btn bb-btn-blue bb-btn-block" type="submit">Create Account</button>
    <p class="bb-fine">Already have an account? <a href="${base}/identity/global/signin">Sign in</a></p>
  </form>
</div>`
}

export function accountPage({ base, user, orders }) {
  return `<div class="bb-account-page"><h1>Hi, ${esc(user.first_name)}</h1>
  <p>${esc(user.email)} &middot; <a href="${base}/logout">Sign out</a></p>
  <h2>Order history</h2>
  ${orders.length ? `<table class="bb-table"><thead><tr><th>Order #</th><th>Date</th><th>Items</th><th>Total</th></tr></thead><tbody>${orders.map(o => `<tr><td>${esc(o.order_number)}</td><td>${new Date(o.created_at).toLocaleDateString('en-US')}</td><td>${o.items.map(i => esc(i.title)).join('<br>')}</td><td>${money(o.totals.total)}</td></tr>`).join('')}</tbody></table>` : '<p>You have no recent orders.</p>'}
  </div>`
}

// ---- checkout (one page, numbered steps) ----
export const STEP_TITLES = { contact: 'Contact info', address: 'Shipping address', shipdetails: 'Shipping details', pickup: 'Pickup details', payment: 'Payment method' }
// ASSUMPTION: the checkout's own charge-timing line was not captured; this paraphrases Best Buy's Terms & Conditions
// (pre-orders are preauthorized when ordered and charged when the item ships or is ready for pickup).
const CHARGE_NOTE = 'Pre-orders: we preauthorize your order amount when you place your order. Your payment method is charged when your item ships or is ready for pickup.'

export function formatPhone(digits) {
  const d = String(digits ?? '').replace(/\D/g, '')
  return d.length === 10 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : d
}

function addressBlock(a) {
  if (!a) return ''
  return `${esc(a.firstName ?? a.first_name)} ${esc(a.lastName ?? a.last_name)}<br>${esc(a.addressLine1 ?? a.line1)}${(a.addressLine2 ?? a.line2) ? `<br>${esc(a.addressLine2 ?? a.line2)}` : ''}<br>${esc(a.city)}, ${esc(a.state)} ${esc(a.postalCode ?? a.postal_code)}`
}

const stateSelect = (name, id, value, error) => `<div class="bb-field${error ? ' has-error' : ''}"><label for="${id}">State</label><select id="${id}" name="${name}" autocomplete="address-level1"${error ? ' aria-invalid="true"' : ''}><option value="">Select</option>${STATES.map(s => `<option value="${s}" ${value === s ? 'selected' : ''}>${s}</option>`).join('')}</select>${error ? `<span class="bb-error">${esc(error)}</span>` : ''}</div>`

// gift: { values: { [line]: { message, email, text, receipt } }, errors } for the "Gift options" sheet.
export function checkoutPage({ base, user, t, steps, active, co, values = {}, errors = {}, toast, gift = {} }) {
  const f = (name, label, opts = {}) => field({ name, label, value: values[name] ?? '', error: errors[name], ...opts })
  const checked = (name, dflt = false) => (values[name] === undefined ? dflt : values[name] === '1') ? 'checked' : ''
  const shippingAsBilling = t.hasShipping && co.address && co.address.useAsBilling === '1'
  const person = co.pickup?.person ?? null
  const shopperName = user ? `${user.first_name} ${user.last_name} (Name on billing address)` : 'You (Name on billing address)'

  const forms = {
    contact: () => `<form method="post" action="${base}/checkout/contact" novalidate>
      ${user ? `<div class="bb-field"><label for="user.emailAddress">Email address</label><p id="user.emailAddress" class="bb-static">${esc(user.email)}</p><input type="hidden" name="emailAddress" value="${esc(user.email)}"></div>` : f('emailAddress', 'Email address', { id: 'user.emailAddress', type: 'email', extra: 'autocomplete="email" required' })}
      ${f('phoneNumber', 'Phone number', { id: 'user.phone', type: 'tel', extra: 'autocomplete="tel" required' })}
      <p class="bb-fine">By placing your order, you agree that Best Buy or its authorized service partners may call or text you at the phone number above to fulfill your order, or with information about your purchase, including delivery and scheduling. Calls may be live or pre-recorded and may be automated. Message/data rates may apply.</p>
      <p class="bb-label">Opt-in for text updates</p>
      <label class="bb-check"><input type="checkbox" id="text-updates" name="smsOptIn" value="1" ${checked('smsOptIn')}> My orders, services and appointments</label>
      <div class="button--continue"><button class="bb-btn bb-btn-blue" type="submit">Continue</button></div>
    </form>`,
    address: () => `<form method="post" action="${base}/checkout/shipping-address" novalidate>
      <div class="bb-2col">${f('firstName', 'First name', { extra: 'autocomplete="given-name" maxlength="50" required' })}${f('lastName', 'Last name', { extra: 'autocomplete="family-name" maxlength="50" required' })}</div>
      ${f('addressLine1', 'Address', { extra: 'autocomplete="address-line1" maxlength="35" required', help: '<p class="bb-fine"><a href="#">Military</a> &middot; <a href="#">Non-US Address</a></p>' })}
      <details class="bb-apt" ${values.addressLine2 || errors.addressLine2 ? 'open' : ''}><summary>Add Apt., Suite, Floor (optional)</summary>${f('addressLine2', 'Apt., Suite, Floor (optional)', { extra: 'autocomplete="address-line2"' })}</details>
      <div class="bb-3col">${f('city', 'City', { extra: 'autocomplete="address-level2" required' })}${stateSelect('state', 'state', values.state, errors.state)}${f('postalCode', 'ZIP code', { extra: 'autocomplete="postal-code" inputmode="numeric" required' })}</div>
      ${user ? `<label class="bb-check"><input type="checkbox" id="saveToProfile" name="saveToProfile" value="1" ${checked('saveToProfile')}> Save this address to my profile</label><label class="bb-check"><input type="checkbox" id="defaultAddress" name="defaultAddress" value="1" ${checked('defaultAddress')}> Make this my default shipping address</label>` : ''}
      <label class="bb-check"><input type="checkbox" id="useAsBillingCheckbox" name="useAsBilling" value="1" ${checked('useAsBilling', true)}> Use as billing address</label>
      <p class="bb-fine">Note: If you ship to a PO BOX, it can take up to a week longer to receive your item than shipping to a residential or business address.</p>
      <div class="button--continue"><button class="bb-btn bb-btn-blue" type="submit">Continue</button></div>
    </form>`,
    // ASSUMPTION: the GTA VI pre-order has a single FREE level of service, so (as the checkout bundle does) no
    // speed chooser is rendered: the step only shows the shipped item card with its delivery estimate.
    shipdetails: () => `<form method="post" action="${base}/checkout/shipping-details" novalidate>
      ${t.lines.filter(l => l.fulfillment === 'shipping').map(l => `<div class="bb-ship-item"><img src="${l.product.art}" alt=""><div><p class="bb-ship-heading">${l.product.preorder ? FULFILLMENT.shipping.eta : 'Get it in 2-4 days'}</p><p>${esc(l.product.title)}</p><p class="bb-fine">Qty ${l.qty} &middot; <b>FREE</b></p></div></div>`).join('')}
      <input type="hidden" name="levelOfService" value="standard">
      <div class="button--continue"><button class="bb-btn bb-btn-blue" type="submit">Continue</button></div>
    </form>`,
    pickup: () => `<form method="post" action="${base}/checkout/pickup" novalidate>
      <div class="bb-pickup-store"><p><b>Pickup at ${STORE_NAME}</b></p><p>${FULFILLMENT.pickup.eta} &mdash; We&rsquo;ll notify you when it&rsquo;s available for pickup</p><p class="bb-fine">Photo ID required</p>
        ${t.lines.filter(l => l.fulfillment === 'pickup').map(l => `<p class="bb-fine">${esc(l.product.title)} &middot; Qty ${l.qty}</p>`).join('')}</div>
      <div class="bb-pickup-person"><p class="bb-label">Pickup person</p>
        <p class="bb-pickup-person-name">${person ? `${esc(person.firstName)} ${esc(person.lastName)}<br><span class="bb-fine">${esc(person.emailAddress)} &middot; ${esc(formatPhone(person.phoneNumber))}</span>` : esc(shopperName)}</p>
        <details class="bb-sheet" ${Object.keys(errors).length ? 'open' : ''}>
          <summary id="changePickupPersonButton" class="card-call-to-action-button">Change</summary>
          <div class="bb-sheet-body"><h3>Pickup person</h3>
            ${user ? `<p class="bb-fine">Choose <b>Name on billing address</b> by leaving this form empty, or add a new pickup person below.</p>` : ''}
            <div class="bb-2col">${f('firstName', 'First name', { id: 'pickup-firstName', extra: 'autocomplete="given-name"' })}${f('lastName', 'Last name', { id: 'pickup-lastName', extra: 'autocomplete="family-name"' })}</div>
            ${f('emailAddress', 'Email address', { id: 'pickup-emailAddress', type: 'email', extra: 'autocomplete="email"' })}
            ${f('phoneNumber', 'Phone number', { id: 'pickup-phoneNumber', type: 'tel', extra: 'autocomplete="tel"' })}
            <label class="bb-check"><input type="checkbox" id="addToProfileCheckbox" name="rememberPickupPerson" value="1" ${checked('rememberPickupPerson')}> Remember for future pickups</label>
            ${errors.pickupPerson ? `<p class="bb-error" role="alert">${esc(errors.pickupPerson)}</p>` : ''}
            <button class="bb-btn bb-btn-blue" type="submit" name="action" value="confirmPerson">Confirm pickup person</button>
          </div>
        </details>
      </div>
      <div class="button--continue"><button class="bb-btn bb-btn-blue" type="submit" name="action" value="continue">Continue</button></div>
    </form>`,
    // ASSUMPTION: PayPal's approval window can't be simulated, so the PayPal button marks PayPal as the payment
    // method and the shopper still finishes with "Place order".
    payment: () => co.paymentMethod === 'paypal' ? `<form method="post" action="${base}/checkout/payment" id="payment-form" novalidate>
      <input type="hidden" name="paymentMethod" value="paypal">
      <div class="bb-paypal-chosen"><span class="bb-paypal-mark"><span class="bb-pp1">Pay</span><span class="bb-pp2">Pal</span></span><p>PayPal is your payment method for this order. Select <b>Place order</b> to finish.</p></div>
      <p class="bb-fine bb-charge-note">${CHARGE_NOTE}</p>
    </form>
    <form method="post" action="${base}/checkout/payment"><input type="hidden" name="action" value="card"><button class="bb-link-btn" type="submit">Use a credit or debit card instead</button></form>`
    : `<form method="post" action="${base}/checkout/payment" id="payment-form" novalidate>
      <input type="hidden" name="paymentMethod" value="card">
      <p class="bb-card-logos" aria-label="Accepted cards"><span>My Best Buy Consumer Credit Card</span><span>My Best Buy Visa</span><span>Mastercard</span><span>Visa</span><span>Discover</span><span>Amex</span><span>Union Pay</span><span>JCB</span></p>
      ${f('number', 'Card number', { extra: 'inputmode="numeric" maxlength="19" pattern="[0-9 ]*" autocomplete="cc-number" required' })}
      <div class="bb-2col">${f('expirationDate', 'Expiration date', { extra: 'inputmode="numeric" placeholder="MM/YY" autocomplete="cc-exp" required' })}${f('cvv', 'Security code', { type: 'tel', extra: 'inputmode="numeric" maxlength="4" placeholder="CVV" autocomplete="cc-csc" required', help: '<span class="visually-hidden">Enter the 3- or 4-digit security code associated with your card.</span>' })}</div>
      ${user ? `<label class="bb-check"><input type="checkbox" name="saveCard" value="1" ${checked('saveCard')}> Save this card to my profile</label><label class="bb-check"><input type="checkbox" name="preferredCard" value="1" ${checked('preferredCard')}> Make this my preferred card</label>` : ''}
      <h3>Billing address</h3>
      ${shippingAsBilling
        ? `<div class="bb-address-card billing-info"><address>${addressBlock(co.address)}</address><a class="bb-fine" href="${base}/checkout/c/standard?step=address">Edit</a></div>`
        : `<div class="payment-component-billing-address">
        <div class="bb-2col">${f('billingFirstName', 'First name', { id: 'payment.billingAddress.firstName', extra: 'autocomplete="given-name" required' })}${f('billingLastName', 'Last name', { id: 'payment.billingAddress.lastName', extra: 'autocomplete="family-name" required' })}</div>
        ${f('billingAddressLine1', 'Address', { id: 'payment.billingAddress.street', extra: 'autocomplete="address-line1" required', help: '<p class="bb-fine"><a href="#">Military</a> &middot; <a href="#">Non-US Address</a></p>' })}
        <details class="bb-apt" ${values.billingAddressLine2 ? 'open' : ''}><summary>Add Apt., Suite, Floor (Optional)</summary>${f('billingAddressLine2', 'Apt., Suite, Floor (Optional)', { id: 'payment.billingAddress.street2', extra: 'autocomplete="address-line2"' })}</details>
        <div class="bb-3col">${f('billingCity', 'City', { id: 'payment.billingAddress.city', extra: 'autocomplete="address-level2" required' })}${stateSelect('billingState', 'payment.billingAddress.state', values.billingState, errors.billingState)}${f('billingPostalCode', 'ZIP code', { id: 'payment.billingAddress.zipcode', extra: 'autocomplete="postal-code" inputmode="numeric" required' })}</div>
      </div>`}
      <details class="bb-giftcard"${errors.giftCardNumber ? ' open' : ''}><summary>Add gift card, store credit or discount code</summary><div class="bb-2col">${f('giftCardNumber', 'Card number or discount code', { id: 'giftCardNumber' })}${f('giftCardPin', 'PIN', { id: 'giftCardPin' })}</div><p class="bb-fine">15, 16 or 18-digit numbers. PIN required. Letters and/or numbers. PIN not required.</p></details>
      <p class="bb-fine">Other payment options: <b>Zip</b> &mdash; ${t.zip.n} payments starting at ${money(t.zip.amount)}</p>
      <p class="bb-fine bb-charge-note">${CHARGE_NOTE}</p>
    </form>
    <div class="bb-or">or</div>
    <form method="post" action="${base}/checkout/payment" class="bb-paypal-form"><input type="hidden" name="action" value="paypal"><button class="bb-paypal" type="submit" aria-label="PayPal"><span class="bb-pp1">Pay</span><span class="bb-pp2">Pal</span></button><p class="bb-fine bb-center">Finance charge may apply</p></form>`,
  }

  const summaries = {
    contact: () => `${esc(co.contact?.emailAddress)}<br>${esc(formatPhone(co.contact?.phoneNumber))}`,
    address: () => `${addressBlock(co.address)}${co.address?.useAsBilling === '1' ? '<br><span class="bb-fine">Use as billing address</span>' : ''}`,
    shipdetails: () => `${FULFILLMENT.shipping.eta} &middot; FREE`,
    pickup: () => `Pickup at ${STORE_NAME} &middot; Pickup person: ${person ? `${esc(person.firstName)} ${esc(person.lastName)}` : esc(shopperName)}`,
    payment: () => '',
  }

  const stepHtml = steps.map((key, i) => {
    const state = key === active ? 'active' : co.done[key] ? 'done' : 'todo'
    return `<section class="bb-step is-${state}" id="step-${key}" aria-current="${state === 'active' ? 'step' : 'false'}">
  <h2><span class="bb-step-num">${i + 1}</span> ${STEP_TITLES[key]}</h2>
  ${state === 'done' ? `<div class="bb-step-summary"><p>${summaries[key]()}</p><a class="bb-edit" href="${base}/checkout/c/standard?step=${key}">Edit</a></div>` : ''}
  ${state === 'active' ? `<div class="bb-step-body">${forms[key]()}</div>` : ''}
</section>`
  }).join('')

  const paymentActive = active === 'payment'
  // "Add gift options" opens the "Gift options" sheet: gift message for shipped items, gift receipt for pickup items.
  const giftValues = gift.values ?? co.gift ?? {}, giftErrors = gift.errors ?? {}
  const giftSheet = `<details class="bb-sheet bb-gift-sheet"${Object.keys(giftErrors).length ? ' open' : ''}>
        <summary class="bb-link-btn">${co.gift ? 'Edit gift options' : 'Add gift options'}</summary>
        <form method="post" action="${base}/checkout/gift-options" class="bb-sheet-body" novalidate>
          <h3>Gift options</h3>
          ${t.lines.map(l => {
            const k = l.line, g = giftValues[k] ?? {}
            return l.fulfillment === 'shipping'
              ? `<fieldset class="bb-gift-item"><legend>${esc(l.product.title)}</legend>
            <label class="bb-check"><input type="checkbox" name="includeGiftMessage-${k}" value="1"${g.message ? ' checked' : ''}> Include gift message</label>
            ${field({ name: `giftEmail-${k}`, label: 'Recipient email address', type: 'email', value: g.email ?? '', error: giftErrors[`giftEmail-${k}`], extra: 'autocomplete="off"' })}
            <div class="bb-field${giftErrors[`giftMessage-${k}`] ? ' has-error' : ''}"><label for="giftMessage-${k}">Gift message</label><textarea id="giftMessage-${k}" name="giftMessage-${k}" maxlength="150" rows="3">${esc(g.text ?? '')}</textarea><span class="bb-fine">${150 - (g.text ?? '').length} Characters Remaining</span>${giftErrors[`giftMessage-${k}`] ? `<span class="bb-error">${esc(giftErrors[`giftMessage-${k}`])}</span>` : ''}</div>
          </fieldset>`
              : `<fieldset class="bb-gift-item"><legend>${esc(l.product.title)}</legend>
            <label class="bb-check"><input type="checkbox" name="includeGiftReceipt-${k}" value="1"${g.receipt ? ' checked' : ''}> Include gift receipt</label>
            <p class="bb-fine">You&rsquo;ll receive a gift receipt when you pick up your item.</p>
          </fieldset>`
          }).join('')}
          <button class="bb-btn bb-btn-blue" type="submit">Save gift options</button>
        </form>
      </details>`
  return `<div class="bb-checkout checkout__container">
  <div class="bb-checkout-head"><h1>Checkout</h1><span class="bb-checkout-total">Total: <b>${money(t.total)}</b></span></div>
  ${toast ? `<p class="bb-toast" role="status">${esc(toast)}</p>` : ''}
  ${Object.keys(errors).length ? `<div class="bb-error-summary" role="alert">Please correct the highlighted fields to continue.</div>` : ''}
  <div class="bb-checkout-cols">
    <div class="bb-steps fulfillment">${stepHtml}</div>
    <aside class="bb-summary bb-co-summary">
      <h2>Summary</h2>
      ${t.lines.map(l => `<div class="bb-sum-item"><p class="bb-sum-fulfil">${l.fulfillment === 'pickup' ? `${FULFILLMENT.pickup.eta}<br><span class="bb-fine">We&rsquo;ll notify you when it&rsquo;s available for pickup</span>` : FULFILLMENT.shipping.eta}</p><p class="bb-sum-title">${esc(l.product.title)}</p>${l.product.finalSale ? '<p class="bb-final">Final sale. Not returnable.</p>' : ''}<p class="bb-fine">Sold by Best Buy${l.qty > 1 ? ` &middot; Qty ${l.qty}` : ''}</p><p class="bb-sum-price">${money(l.product.price * l.qty)}</p></div>`).join('')}
      ${summaryRows(t, { taxLabel: 'Est. Sales Tax', showShipping: false })}
      <p class="bb-fine"><a href="#">Apply for a tax exempt account</a></p>
      ${giftSheet}
      <p class="bb-fine">By clicking place order, you agree to Best Buy&rsquo;s Terms &amp; Privacy Policy.</p>
      <div class="button--place-order"><button class="bb-btn bb-btn-yellow bb-btn-block btn-primary" type="submit" form="payment-form" ${paymentActive ? '' : 'disabled title="Complete the steps above first"'}>Place order</button></div>
    </aside>
  </div>
</div>`
}

// ---- thank you ----
export function thankYouPage({ base, order, accountCreated = null }) {
  const ship = order.shipping_address, bill = order.billing_address, pay = order.payment
  const lines = order.meta.items_fulfillment ?? []
  const byF = f => order.items.filter((it, i) => (lines[i]?.fulfillment ?? (order.fulfillment.method === 'pickup' ? 'pickup' : 'shipping')) === f)
  const shipped = byF('shipping'), pickup = byF('pickup')
  const person = order.meta.pickup_person
  const itemList = items => `<ul class="bb-thanks-items">${items.map(it => `<li>${esc(it.title)} &times; ${it.qty} <span>${money(it.unit_price * it.qty)}</span></li>`).join('')}</ul>`
  const guestBlock = order.customer.guest ? (accountCreated?.ok
    ? `<section class="bb-create-account"><h2>Welcome to the Club!</h2><p>You&rsquo;ve successfully created a My Best Buy account!</p></section>`
    : `<section class="bb-create-account"><h2>${accountCreated ? 'Create Your Account' : 'Create an account'}</h2>
      ${accountCreated ? `<p class="bb-error" role="alert">${esc(accountCreated.error)}</p>` : ''}
      <form method="post" action="${base}/checkout/r/create-account" novalidate>
        <input type="hidden" name="order" value="${esc(order.order_number)}"><input type="hidden" name="token" value="${esc(order.meta.token)}">
        <label class="bb-check"><input type="checkbox" name="save" value="1" checked> Save your details securely for faster checkout next time.</label>
        ${field({ name: 'password', label: 'Password', id: 'new-password', type: 'password', extra: 'autocomplete="new-password"' })}
        <button class="bb-btn bb-btn-blue" type="submit">Create account</button>
        <p class="bb-fine">By creating an account and saving your details, you agree to our Terms and Conditions, Privacy Policy, and My Best Buy&trade; Terms.</p>
      </form></section>`) : ''
  return `<div class="bb-thanks">
  <h1>Thanks for your order!</h1>
  <p class="bb-order-num">Order #: <b data-order-number>${esc(order.order_number)}</b></p>
  <p>We&rsquo;re sending a confirmation email to <b>${esc(order.customer.email)}</b></p>
  <div class="bb-thanks-cols">
    <div>
      ${shipped.length ? `<section class="bb-thanks-section"><h2>Ship to</h2><address>${addressBlock(ship)}</address><p>Your order will arrive by Release Date: <b>${RELEASE.ship}</b>.</p>${itemList(shipped)}</section>` : ''}
      ${pickup.length ? `<section class="bb-thanks-section"><h2>Store pickup</h2><p>Your order will be ready for pickup on Release Date: <b>${RELEASE.ship}</b> at <b>${STORE_NAME}</b>.</p><p>We&rsquo;ll send you an email when it&rsquo;s ready for pickup.</p>${person ? `<p>Make sure <b>${esc(person.first_name)} ${esc(person.last_name)}</b> brings their photo ID and your order number to the store.</p>` : '<p class="bb-fine">Bring your government-issued photo ID and your order number.</p>'}${itemList(pickup)}</section>` : ''}
      ${order.meta.sms_opt_in ? '<section class="bb-thanks-section"><h2>Thanks for signing up!</h2><p>We&rsquo;ll be sending you a confirmation text shortly.</p></section>' : ''}
      ${guestBlock}
    </div>
    <aside class="bb-summary">
      <h2>Order summary</h2>
      <div class="bb-row"><span>Subtotal</span><span>${money(order.totals.subtotal)}</span></div>
      ${shipped.length ? '<div class="bb-row"><span>Shipping</span><span>FREE</span></div>' : ''}
      ${pickup.length ? '<div class="bb-row"><span>Store Pickup</span><span>FREE</span></div>' : ''}
      <div class="bb-row"><span>Est. Sales Tax</span><span>${money(order.totals.tax)}</span></div>
      <div class="bb-row bb-total"><span>Total</span><span>${money(order.totals.total)}</span></div>
      <h3>Payment</h3>
      <p>${pay.method === 'card' ? `${esc(pay.brand)} ending in ${esc(pay.last4)}` : 'PayPal'}</p>
      ${bill ? `<p class="bb-fine">Billing address<br>${addressBlock(bill)}</p>` : ''}
      <p class="bb-fine">Your ${pay.method === 'card' ? 'card' : 'payment method'} is preauthorized now and charged when your item ships or is ready for pickup.</p>
      <a class="bb-btn bb-btn-blue bb-btn-block" href="${base}/">Continue shopping</a>
    </aside>
  </div>
</div>`
}

export function simplePage({ title, html }) {
  return `<div class="bb-simple"><h1>${esc(title)}</h1>${html}</div>`
}
