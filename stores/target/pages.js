import { esc, money, disclaimer } from '../../lib/html.js'
import { productPath, STATES, PAYMENT_TYPES, SHIP_ZIP, STORE_LOCATION, ARRIVES, PREORDER_ARRIVAL } from './data.js'

const NAME = 'Target'
const UTILITY_NAV = ['Target Circle™', 'Target Circle™ Card', 'Target Circle 360™', 'Registry & Wish List', 'Weekly Ad', 'Find Stores']
const CHARGE_POLICY = 'You won\'t be charged for your order until it ships or is ready for pickup. A new authorization hold will be placed 7 days before the street date. At the time of shipment, we will invoice you for the exact price of the item.'

const bullseye = (cls = '') => `<span class="tg-bullseye ${cls}" aria-hidden="true"></span>`
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`

// ASSUMPTION: the red count badge only appears once the cart has items; the link keeps its
// "cart 0 items" aria-label from the research either way.
export function layout({ base, title, body, cartCount = 0, user = null, q = '', minimal = false }) {
  const first = user?.first_name || 'there'
  const header = minimal
    ? `<header class="tg-header tg-header-min"><div class="tg-wrap"><a class="tg-logo" href="${base}/" aria-label="Target home" data-test="header-tgtLogo">${bullseye()}<span class="visually-hidden">Target</span></a></div></header>`
    : `<header class="tg-header">
  <div class="tg-utility"><div class="tg-wrap">
    <div class="tg-util-left"><a href="#" class="tg-util-btn">&#128205; Ship to ${SHIP_ZIP}</a><a href="#" class="tg-util-btn">&#127978; ${STORE_LOCATION}</a></div>
    <nav class="tg-util-right" aria-label="Target services">${UTILITY_NAV.map(n => `<a href="#">${esc(n)}</a>`).join('')}</nav>
  </div></div>
  <div class="tg-wrap tg-main-row">
    <a class="tg-logo" href="${base}/" aria-label="Target home">${bullseye()}<span class="visually-hidden">Target</span></a>
    <nav class="tg-nav" aria-label="Main menu"><a href="${base}/">&#9776; Categories</a><a href="${base}/s?searchTerm=deals">Deals</a><a href="#">Pickup &amp; delivery</a></nav>
    <form class="tg-search" action="${base}/s" method="get" role="search">
      <input type="search" name="searchTerm" value="${esc(q)}" placeholder="What can we help you find?" aria-label="search" autocomplete="off">
      <button type="submit" aria-label="search">&#128269;</button>
    </form>
    <button type="button" class="tg-ask">Ask Target</button>
    <nav class="tg-account-nav" aria-label="Account and cart">
      <a href="${user ? `${base}/account` : `${base}/login`}" class="tg-icon-link" aria-label="${user ? `Account, ${esc(first)}` : 'Account, sign in'}"><span aria-hidden="true">&#128100;</span><small>${user ? `Hi, ${esc(first)}` : 'Sign in'}</small></a>
      <a href="${base}/cart" class="tg-icon-link tg-cart-link" aria-label="cart ${plural(cartCount, 'item')}"><span aria-hidden="true">&#128722;</span>${cartCount ? `<span class="tg-badge">${cartCount}</span>` : ''}</a>
    </nav>
  </div>
</header>`
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<link rel="stylesheet" href="${base}/static/style.css">
<script>document.documentElement.className+=' js'</script></head>
<body>
${header}
<main class="tg-main ${minimal ? 'tg-main-min' : ''}">${body}</main>
<footer class="tg-footer${minimal ? ' tg-footer-min' : ''}">
  ${minimal ? '' : `<div class="tg-wrap tg-footer-cols">
    <div><h4>About</h4><a href="#">About Target</a><a href="#">Careers</a><a href="#">News &amp; features</a><a href="#">Investors</a></div>
    <div><h4>Help</h4><a href="#">Target Help</a><a href="#">Returns</a><a href="#">Track orders</a><a href="#">Contact us</a></div>
    <div><h4>Stores</h4><a href="#">Find a store</a><a href="#">Pharmacy</a><a href="#">Target Optical</a><a href="#">Store services</a></div>
    <div><h4>Services</h4><a href="#">Target Circle&trade;</a><a href="#">Target Circle&trade; Card</a><a href="#">Target Circle 360&trade;</a><a href="#">Same Day Delivery</a></div>
    <div class="tg-footer-email"><h4>Get top deals, latest trends, and more.</h4><form onsubmit="return false"><label for="footer-email" class="visually-hidden">Email address</label><input id="footer-email" type="email" placeholder="Email address"><button type="button" class="tg-btn">Sign up</button></form></div>
  </div>`}
  <p class="tg-copy">&copy; 2026 Target Brands, Inc.</p>
  ${disclaimer(NAME)}
</footer>
</body></html>`
}

function tile(base, p, backPath) {
  const href = productPath(base, p)
  const cta = p.preorder ? 'Preorder' : 'Add to cart'
  const badge = p.sponsored ? '<div class="tg-tile-badge">Sponsored</div>' : p.badge ? `<div class="tg-tile-badge">${esc(p.badge)} ${bullseye('tg-bullseye-xs')}</div>` : ''
  const rating = p.rating
    ? `<div class="tg-tile-rating"><span class="tg-stars" aria-hidden="true">&#9733;&#9733;&#9733;&#9733;&#9733;</span> <b>${esc(p.rating.score)}</b> <span class="visually-hidden">${esc(p.rating.text)}</span> <span class="tg-fine">(${p.rating.count})</span> <span class="tg-loved">Loved for: ${esc(p.rating.loved)}</span></div>`
    : ''
  return `<article class="tg-tile">
  <div class="tg-tile-media"><a href="${href}"><img src="${p.art}" alt="${esc(p.title)}"></a><button type="button" class="tg-heart" aria-label="sign in to favorite ${esc(p.title)} to keep tabs on it">&#9825;</button></div>
  ${badge}
  <div class="tg-tile-price">${money(p.price)}</div>
  <a class="tg-tile-title" href="${href}">${p.tileBrand ? `<span class="tg-tile-brand">${esc(p.tileBrand)}</span> ` : ''}${esc(p.title)}</a>
  ${rating}
  <div class="tg-tile-ship">${p.preorder ? `Release date ${esc(p.release)}` : `Shipping arrives ${esc(ARRIVES)}`}</div>
  <a class="tg-tile-free" href="#">Ships free - exclusions apply</a>
  <form method="post" action="${base}/cart/add"><input type="hidden" name="tcin" value="${p.tcin}"><input type="hidden" name="back" value="${esc(backPath)}"><button type="submit" class="tg-btn tg-btn-block" aria-label="${cta} ${esc(p.title)}">${cta}</button></form>
</article>`
}

function miniCarousel(base, products) {
  return `<div class="tg-mini-carousel">${products.map(p => `<a class="tg-mini-card" href="${productPath(base, p)}"><img src="${p.art}" alt=""><span>${esc(p.title)}</span><b>${money(p.price)}</b></a>`).join('')}</div>`
}

// Server-rendered version of Target's add-to-cart drawer (slides in from the right on desktop).
export function addedDrawer({ base, added, notAdded, closeHref, plan, recs }) {
  const p = added ?? notAdded
  if (!p) return ''
  const ok = !!added
  const esp = ok && p.esp && plan
    ? `<div class="tg-drawer-esp"><div><b>Protect your purchase</b><div class="tg-fine">${esc(plan.title)} &middot; ${money(plan.price)}</div></div><form method="post" action="${base}/cart/add"><input type="hidden" name="tcin" value="${plan.tcin}"><input type="hidden" name="back" value="${esc(closeHref)}"><button type="submit" class="tg-btn tg-btn-outline tg-btn-sm">Add</button></form></div>`
    : ''
  return `<div class="tg-drawer-backdrop"><aside class="tg-drawer" role="dialog" aria-labelledby="drawer-title">
  <div class="tg-drawer-head"><h2 id="drawer-title">${ok ? '<span class="tg-check-icon" aria-hidden="true">&#10003;</span> Added to cart' : 'Item not added to cart'}</h2><a class="tg-drawer-close" href="${closeHref}" aria-label="close">&times;</a></div>
  ${ok ? '' : '<p class="tg-error" role="alert">The maximum quantity of this item has already been added to your cart.</p>'}
  <div class="tg-drawer-item"><img src="${p.art}" alt=""><div><b>${esc(p.title)}</b><div class="tg-fine">${money(p.price)}</div></div></div>
  ${ok ? '<p class="tg-fine tg-drawer-note">Edit delivery method in cart</p>' : ''}
  ${esp}
  <a class="tg-btn tg-btn-block" href="${closeHref}">Continue shopping</a>
  <a class="tg-btn tg-btn-outline tg-btn-block" href="${base}/cart">View cart &amp; check out</a>
  <h3>You may also like</h3>${miniCarousel(base, recs)}
</aside></div>`
}

export function homePage({ base, products, games }) {
  const [ps5] = games
  return `<section class="tg-hero">
  <div><p class="tg-eyebrow">Preorder now</p><h1>Grand Theft Auto VI</h1><p>Vice City, USA. Preorder the PlayStation 5 or Xbox Series X|S edition today. Code in Box, delivers 11/12/26, playable 11/19/26.</p><a class="tg-btn" href="${productPath(base, ps5)}">Preorder Grand Theft Auto VI</a></div>
  <img src="${ps5.art}" alt="Grand Theft Auto VI box art placeholder">
</section>
<section class="tg-section"><h2>New &amp; trending in video games</h2><div class="tg-grid">${products.map(p => tile(base, p, `${base}/`)).join('')}</div></section>`
}

export function searchPage({ base, q, products, sponsored, backPath, drawer }) {
  const chips = [['Pickup', 'Ready within 2 hours'], ['Same-day Delivery', 'Get it as soon as today with Shipt'], ['Shipping', 'Free with Target Circle™ Card or $35 orders'], ['Shop in store', 'Find items in stock'], ['Deals', ''], ['Compatibility', '']]
  const tiles = products.length ? [sponsored, ...products].filter(Boolean).map(p => tile(base, p, backPath)).join('') : ''
  return `${drawer ?? ''}<div class="tg-search-page">
  <h1>${esc(q.toLowerCase())}</h1>
  <div class="tg-toolbar">
    <button type="button" class="tg-chip tg-chip-strong" aria-label="Filters Menu. 0 applied">Filter</button>
    <button type="button" class="tg-chip tg-chip-strong">Sort</button>
    ${chips.map(([l, s]) => `<button type="button" class="tg-chip"${s ? ` title="${esc(s)}"` : ''}>${esc(l)}${l === 'Compatibility' ? ' &#9662;' : ''}</button>`).join('')}
  </div>
  <p class="tg-count">${products.length ? `${plural(products.length + (sponsored ? 1 : 0), 'result')} for &ldquo;${esc(q)}&rdquo;` : `We couldn&rsquo;t find a match for your search.`}</p>
  ${products.length ? `<div class="tg-grid">${tiles}</div><p class="tg-paging">page 1 of 1</p>` : `<p class="tg-fine">Check your spelling or try a different search term, like &ldquo;grand theft auto vi&rdquo;.</p>`}
</div>`
}

export function productPage({ base, p, siblings, fulfillment = 'shipping', plan, recs, user, drawer, listMsg }) {
  const isGame = p.kind === 'game'
  const path = productPath(base, p)
  const tabs = [
    ['pickup', 'Pickup', 'Not available', '&#127978;'],
    ['delivery', 'Delivery', 'Check availability', '&#128663;'],
    ['shipping', 'Shipping', p.preorder ? 'Preorder' : `Arrives ${ARRIVES}`, '&#128230;'],
  ]
  const cells = {
    shipping: p.preorder
      ? `<div class="tg-cell-head"><h3>Preorder for ${SHIP_ZIP}</h3><a href="#">Edit ZIP code</a></div><p class="tg-green">Release date: ${esc(p.release)}</p><p class="tg-fine">Delivered on or shortly after release date</p><p class="tg-fine">Ships free with <b>Target Circle 360&trade;</b> or $35 orders</p>`
      : `<div class="tg-cell-head"><h3>Ship to ${SHIP_ZIP}</h3><a href="#">Edit ZIP code</a></div><p class="tg-green">Arrives ${esc(ARRIVES)}</p><p class="tg-fine">Ships free with <b>Target Circle 360&trade;</b> or $35 orders</p>`,
    pickup: `<div class="tg-cell-head"><h3>Pick up at ${STORE_LOCATION}</h3><a href="#">Change</a></div><p class="tg-orange">Not available</p><a href="#" class="tg-fine">Check other stores</a><p class="tg-fine">We&rsquo;re testing Order Pickup and Drive Up options for select preorder items and at select stores for release date pickup.</p>`,
    delivery: `<div class="tg-cell-head"><h3>Same Day Delivery</h3><a href="#">Add address</a></div><p class="tg-orange">Check availability</p><p class="tg-fine">Select electronics &amp; video games are not available for Same Day Delivery. $9.99 per order, or free with Target Circle 360&trade; on $35+ orders.</p>`,
  }
  const canBuy = fulfillment === 'shipping'
  const cta = p.preorder ? 'Preorder' : 'Add to cart'
  const qtyOptions = Array.from({ length: p.limit }, (_, i) => i + 1).map(n => `<option value="${n}">${n}</option>`).join('')
  const finance = isGame ? `<div class="tg-finance"><div><b>4 interest-free payments or as low as $15/mo</b><span>With Affirm</span></div><div><b>Pay in 4 interest-free payments of $20.00</b><span>PayPal Pay in 4</span></div></div>` : ''
  const variants = isGame ? `<div class="tg-variant"><span class="tg-variant-label">Platform</span><div class="tg-pills">${siblings.map(s => `<a class="tg-pill ${s.tcin === p.tcin ? 'is-selected' : ''}" href="${base}/p/-/-/A-${s.tcin}" aria-current="${s.tcin === p.tcin ? 'true' : 'false'}">${esc(s.platformLabel)}</a>`).join('')}</div></div>
    <div class="tg-variant"><span class="tg-variant-label">Edition</span><div class="tg-pills"><span class="tg-pill is-selected" aria-current="true">Standard</span></div></div>` : ''
  const loginBack = `${base}/login?redirect=${encodeURIComponent(path)}`
  return `${drawer ?? ''}
<nav class="tg-crumbs" aria-label="Breadcrumb"><a href="${base}/">Target</a>${p.crumbs.map(c => ` &rsaquo; <a href="${base}/s?searchTerm=${encodeURIComponent(c)}">${esc(c)}</a>`).join('')}</nav>
${listMsg ? `<p class="tg-toast" role="status">${esc(listMsg)}</p>` : ''}
<div class="tg-pdp">
  <div class="tg-gallery">
    <a class="tg-skip" href="#info-and-fulfillment">Skip images</a>
    <div class="tg-gallery-main"><img src="${p.art}" alt="${esc(p.title)}"><button type="button" class="tg-heart" aria-label="sign in to favorite ${esc(p.title)} to keep tabs on it">&#9825;</button><button type="button" class="tg-fullscreen">view full screen</button></div>
    <div class="tg-gallery-thumbs">${Array.from({ length: 4 }, () => `<img src="${p.art}" alt="">`).join('')}</div>
    <button type="button" class="tg-btn tg-btn-outline">Show more images</button>
  </div>
  <div class="tg-buybox" id="info-and-fulfillment">
    <a class="tg-brand" href="${base}/s?searchTerm=${encodeURIComponent(p.brand)}">Shop all ${esc(p.brand)}</a>
    <h1>${esc(p.title)}</h1>
    <div class="tg-rating-row">${p.rating ? `<span class="tg-stars" aria-hidden="true">&#9733;&#9733;&#9733;&#9733;&#9733;</span> <span>${esc(p.rating.text)}</span> <span>(${p.rating.count})</span>` : `<span class="tg-stars tg-stars-empty" aria-hidden="true">&#9734;&#9734;&#9734;&#9734;&#9734;</span> <span>0 out of 5 stars</span> <a href="#reviews">be the first!</a>`} <a href="#qa">${plural(p.questions, 'Question')}</a></div>
    <div class="tg-price-module"><span class="tg-price">${money(p.price)}</span><a href="#" class="tg-fine">More info about pricing</a></div>
    ${finance}
    ${variants}
    <div class="tg-fulfillment">
      <div class="tg-tabs" role="tablist" aria-label="Fulfillment">${tabs.map(([id, label, sub, icon]) => `<a role="tab" aria-selected="${fulfillment === id ? 'true' : 'false'}" class="tg-tab ${fulfillment === id ? 'is-selected' : ''} ${sub === 'Not available' ? 'is-unavailable' : ''}" href="${path}?fulfillment=${id}#info-and-fulfillment"><span class="tg-tab-icon" aria-hidden="true">${icon}</span><b>${label}</b><span>${esc(sub)}</span></a>`).join('')}</div>
      <div class="tg-cell" data-test="@web/AddToCart/Fulfillment/${p.preorder ? 'PreorderSellable' : 'Sellable'}">${cells[fulfillment] ?? cells.shipping}</div>
    </div>
    <form method="post" action="${base}/cart/add" class="tg-atc">
      <input type="hidden" name="tcin" value="${p.tcin}"><input type="hidden" name="back" value="${esc(path)}">
      <div class="tg-atc-row"><label class="tg-qty" for="qty">Qty</label><select id="qty" name="qty">${qtyOptions}</select>
      <button type="submit" class="tg-btn tg-btn-block" data-test="${p.preorder ? 'preorderButton' : 'addToCartButton'}" aria-label="${cta} ${esc(p.title)}"${canBuy ? '' : ' disabled aria-disabled="true"'}>${cta}</button></div>
      ${p.esp && plan ? `<label class="tg-addon"><input type="checkbox" name="addon" value="${plan.tcin}"> <span><b>${esc(plan.title)}</b><br><span class="tg-fine">Add protection for ${money(plan.price)}</span></span></label>` : ''}
    </form>
    ${user
      ? `<form method="post" action="${base}/buy-now" class="tg-buy-now"><input type="hidden" name="tcin" value="${p.tcin}"><button type="submit" class="tg-btn tg-btn-outline tg-btn-block" data-test="buy-now-button"${canBuy ? '' : ' disabled'}>Buy now</button></form>`
      : `<a class="tg-btn tg-btn-outline tg-btn-block tg-buy-now" href="${loginBack}" data-test="buy-now-button">Sign in to buy now</a>`}
    ${p.preorder ? `<p class="tg-fine tg-charge-note">${CHARGE_POLICY}</p>` : ''}
    <div class="tg-registry"><span>Eligible for registries and wish lists</span><div>${user ? '' : `<a class="tg-btn tg-btn-outline tg-btn-sm" href="${loginBack}">Sign in</a>`}${user ? `<form method="post" action="${base}/list/add"><input type="hidden" name="tcin" value="${p.tcin}"><button type="submit" class="tg-btn tg-btn-outline tg-btn-sm">Add to list</button></form>` : `<a class="tg-btn tg-btn-outline tg-btn-sm" href="${loginBack}">Add to list</a>`}</div></div>
    <div class="tg-glance"><h3>At a glance</h3><span class="tg-glance-badge">${esc(p.glance)}</span></div>
  </div>
</div>
<section class="tg-about"><h2>About this item</h2>
  <details class="tg-acc" open><summary>Details</summary>
    <h3>Highlights</h3><ul>${p.highlights.map(h => `<li>${esc(h)}</li>`).join('')}</ul>
    <h3>Description</h3><p>${esc(p.description)}</p>
  </details>
  <details class="tg-acc"><summary>Specifications</summary><table class="tg-specs">${p.specs.map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`).join('')}<tr><th>TCIN</th><td>${p.tcin}</td></tr>${p.upc ? `<tr><th>UPC</th><td>${p.upc}</td></tr>` : ''}${p.dpci ? `<tr><th>Item Number (DPCI)</th><td>${p.dpci}</td></tr>` : ''}</table></details>
  <details class="tg-acc"><summary>Shipping &amp; Returns</summary><h3>Shipping details</h3><p>${esc(p.shippingNote)}</p><h3>Return details</h3><p>${esc(p.returns)}</p></details>
  <details class="tg-acc" id="qa"><summary>Q&amp;A (${p.questions})</summary><p>${p.questions ? `${plural(p.questions, 'question')} from guests.` : 'No questions yet.'}</p><button type="button" class="tg-btn tg-btn-outline">Ask a question</button></details>
  <button type="button" class="tg-link-btn" onclick="document.querySelectorAll('.tg-acc').forEach(function(d){d.open=true})">Load all content at once</button>
</section>
<section class="tg-section"><h2>You may also like</h2>${miniCarousel(base, recs)}</section>
<section class="tg-section" id="reviews"><h2>Guest ratings &amp; reviews (${p.rating ? p.rating.count : 0})</h2>${p.rating ? `<p>${esc(p.rating.text)}</p>` : '<p>Be the first to review this item.</p>'}<button type="button" class="tg-btn tg-btn-outline">Write a review</button></section>
<section class="tg-section tg-disclaimer"><h2>Disclaimer</h2><p class="tg-fine">Content on this site is for reference purposes only. Product details, pricing and availability are subject to change. Please review the item once you receive it.</p></section>`
}

function cartLine(base, l) {
  const p = l.product
  const qtyOptions = Array.from({ length: p.limit }, (_, i) => i + 1).map(n => `<option value="${n}" ${n === l.qty ? 'selected' : ''}>${n}</option>`).join('')
  return `<div class="tg-line">
  <img src="${p.art}" alt="">
  <div class="tg-line-body">
    <div class="tg-line-top"><a class="tg-line-title" href="${productPath(base, p)}">${esc(p.title)}</a>
      <form method="post" action="${base}/cart/update"><input type="hidden" name="tcin" value="${p.tcin}"><button type="submit" name="action" value="remove" class="tg-line-x" aria-label="Remove item ${esc(p.title)}">&times;</button></form></div>
    ${p.preorder ? `<div class="tg-line-release" data-test="preorderStreetDate">Release date ${esc(p.release)}</div>` : ''}${p.addon ? `<p class="tg-fine">Protection plan &middot; ${esc(p.shippingNote)}</p>` : `<a href="#" class="tg-fine">Ships free - exclusions apply</a>
    <fieldset class="tg-methods"><legend class="visually-hidden">Delivery method</legend>
      <label class="is-selected"><input type="radio" name="method-${p.tcin}" value="shipping" checked> <b>Shipping</b> <span class="tg-fine">${p.preorder ? PREORDER_ARRIVAL : `Arrives ${esc(ARRIVES)}`} &middot; Free</span></label>
      <label class="is-disabled"><input type="radio" name="method-${p.tcin}" value="pickup" disabled> <b>Order Pickup</b> <span class="tg-fine">Not available at ${STORE_LOCATION}</span></label>
      <label class="is-disabled"><input type="radio" name="method-${p.tcin}" value="driveup" disabled> <b>Drive Up</b> <span class="tg-fine">Not available at ${STORE_LOCATION}</span></label>
    </fieldset>`}
    <form method="post" action="${base}/cart/update" class="tg-line-actions">
      <input type="hidden" name="tcin" value="${p.tcin}">
      <label for="qty-${p.tcin}">Qty</label><select id="qty-${p.tcin}" name="qty" onchange="this.form.submit()">${qtyOptions}</select>
      ${l.qty >= p.limit ? '<span class="tg-fine">Max quantity reached</span>' : ''}
      <button type="submit" name="action" value="update" class="tg-link-btn tg-qty-update">Update</button>
      <button type="submit" name="action" value="save" class="tg-btn tg-btn-outline tg-btn-sm" aria-label="Save for later ${esc(p.title)}">Save for later</button>
      <button type="submit" name="action" value="remove" class="tg-link-btn">Remove item</button>
    </form>
  </div>
  <div class="tg-line-price">${money(p.price * l.qty)}</div>
</div>`
}

export function cartPage({ base, t, saved = [], user, promo, promoError, promoValue = '', recs }) {
  const promoDrawer = promo ? `<div class="tg-drawer-backdrop"><aside class="tg-drawer" role="dialog" aria-labelledby="promo-title" data-test="promo-code-modal-drawer">
  <div class="tg-drawer-head"><h2 id="promo-title">Add promo code</h2><a class="tg-drawer-close" href="${base}/cart" aria-label="close">&times;</a></div>
  <form method="post" action="${base}/cart/promo"><label for="promo">Promo code</label><input id="promo" name="code" type="text" minlength="4" maxlength="36" value="${esc(promoValue)}" ${promoError ? 'aria-invalid="true" aria-describedby="promo-err"' : ''}>${promoError ? `<span class="tg-error" id="promo-err" role="alert">${esc(promoError)}</span>` : ''}<button type="submit" class="tg-btn tg-btn-block">Apply</button></form>
</aside></div>` : ''
  if (!t.lines.length && !saved.length) {
    return `<div class="tg-cart-empty"><h1>Your cart is empty</h1>${user ? '' : `<p><a href="${base}/login?redirect=${encodeURIComponent(base + '/cart')}">Sign in</a> to see items you may have added from another device.</p>`}
  <div class="tg-email-box"><h2>Get top deals, latest trends, and more.</h2><form onsubmit="return false"><label for="cart-email" class="visually-hidden">Email address</label><input id="cart-email" type="email" placeholder="Email address"><button type="button" class="tg-btn">Sign up</button></form></div></div>`
  }
  const savedRows = saved.map(p => `<div class="tg-saved-item"><img src="${p.art}" alt=""><div><a href="${productPath(base, p)}">${esc(p.title)}</a><div><b>${money(p.price)}</b></div></div>
    <form method="post" action="${base}/cart/update"><input type="hidden" name="tcin" value="${p.tcin}"><button type="submit" name="action" value="restore" class="tg-btn tg-btn-outline tg-btn-sm">Move to cart</button> <button type="submit" name="action" value="removesaved" class="tg-link-btn">Remove</button></form></div>`).join('')
  return `${promoDrawer}<div class="tg-cart">
  <h1>Cart</h1>
  <div class="tg-cart-sticky">${money(t.subtotal)} est. total &middot; ${plural(t.count, 'item')}</div>
  <div class="tg-cart-cols">
    <div class="tg-cart-main">
      ${t.lines.length ? `<section class="tg-group"><h2>Shipping</h2><p class="tg-fine">${t.lines.some(l => l.product.preorder) ? PREORDER_ARRIVAL : `Arrives ${esc(ARRIVES)}`} &middot; Standard Shipping</p>${t.lines.map(l => cartLine(base, l)).join('')}</section>` : '<p class="tg-fine">Your cart is empty.</p>'}
      <div class="tg-circle-banner"><div>${bullseye('tg-bullseye-sm')}</div><div><b>Target Circle&trade; Card</b><p>Save 5% instantly, in-store and online, plus free 2-day shipping on most items.</p></div><a href="#" aria-label="Learn more about Target Circle Card offer">Learn more</a></div>
      <section class="tg-saved"><h2>Save your items for later</h2>${saved.length ? savedRows : `<p class="tg-fine">If you aren&rsquo;t ready to buy, select Save for later. We&rsquo;ll keep the item safe here.</p>`}</section>
      <section class="tg-section"><h2>You may also like</h2>${miniCarousel(base, recs)}</section>
      <div class="tg-circle-banner"><div>${bullseye('tg-bullseye-sm')}</div><div><b>Target Circle 360&trade;</b><p>Skip the $9.99 delivery fee all season long.</p></div><a href="#">Learn more</a></div>
    </div>
    <aside class="tg-summary">
      <h2>Order summary</h2>
      <div class="tg-row"><span>Subtotal</span><span>${money(t.subtotal)}</span></div>
      <div class="tg-row"><span>Shipping</span><span>${t.shipping ? money(t.shipping) : 'Free'}</span></div>
      <div class="tg-row"><span>Estimated taxes</span><span>${money(t.tax)}</span></div>
      <div class="tg-row tg-total"><span>Total</span><span>${money(t.total)}</span></div>
      ${t.shipping ? '' : `<div class="tg-freeship"><span class="tg-check-icon" aria-hidden="true">&#10003;</span><div><b>Free shipping</b><div class="tg-fine">Spend $35 or more using any payment method (excludes AK, HI and U.S. protectorates).</div></div></div>`}
      <p class="tg-fine">*Total savings may differ at checkout based on Target Circle&trade; Card savings and other discounts</p>
      <div class="tg-promo-cell"><span aria-hidden="true">&#127991;</span><h3>Promo code</h3><a href="${base}/cart?promo=1" aria-label="Add for promo code" data-test="add-promo-code-btn">Add</a></div>
      ${t.lines.length ? `<a class="tg-btn tg-btn-block" href="${base}/checkout" data-test="checkout-button">${user ? 'Check out' : 'Sign in to check out'}</a>
      <form method="post" action="${base}/cart/paypal"><button type="submit" class="tg-btn tg-btn-outline tg-btn-block tg-paypal" aria-label="Pay with PayPal" data-test="paypalButton"><span class="pp1">Pay</span><span class="pp2">Pal</span></button></form>
      ${user ? '' : '<p class="tg-fine">Check out with PayPal &mdash; Sign in to your Target account to use PayPal.</p>'}` : ''}
    </aside>
  </div>
</div>`
}

export function loginPage({ base, redirect = '', error, email = '' }) {
  const r = redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''
  return `<div class="tg-auth">
  <h1>Sign in or create account</h1>
  ${error ? `<p class="tg-error tg-error-box" role="alert">${esc(error)}</p>` : ''}
  <form method="post" action="${base}/login">
    <input type="hidden" name="redirect" value="${esc(redirect)}">
    <label for="username">Email address</label><input id="username" name="email" type="email" autocomplete="username" value="${esc(email)}" required>
    <label for="password">Password</label><input id="password" name="password" type="password" autocomplete="current-password" required>
    <label class="tg-check"><input type="checkbox" name="keepSignedIn" value="1"> Keep me signed in</label>
    <button type="submit" class="tg-btn tg-btn-block">Sign in</button>
    <a href="#" class="tg-fine">Forgot password?</a>
  </form>
  <div class="tg-or">or</div>
  <a class="tg-btn tg-btn-outline tg-btn-block" href="${base}/login/passkey${r}">Sign in with passkey</a>
  <a class="tg-btn tg-btn-outline tg-btn-block" href="${base}/login/phone${r}">Get a verification code by phone</a>
  <p class="tg-auth-alt">New to Target? <a href="${base}/account/create${r}">Create your Target account</a></p>
</div>`
}

// ASSUMPTION: passkey and phone-code sign-in are not reproducible here; they fall back to password sign-in.
export function altSignInPage({ base, kind, redirect = '' }) {
  const r = redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''
  return `<div class="tg-auth"><h1>${kind === 'passkey' ? 'Sign in with passkey' : 'Get a verification code by phone'}</h1>
  <p>This sign-in option isn&rsquo;t available in this browser. Sign in with your email address and password instead.</p>
  <a class="tg-btn tg-btn-block" href="${base}/login${r}">Sign in with password</a></div>`
}

export function createAccountPage({ base, redirect = '', values = {}, errors = {} }) {
  const f = (name, label, type = 'text', extra = '') => `<label for="${name}">${label}</label><input id="${name}" name="${name}" type="${type}" value="${esc(values[name] ?? '')}" ${extra}${errors[name] ? ` aria-invalid="true" aria-describedby="err-${name}"` : ''}>${errors[name] ? `<span class="tg-error" id="err-${name}">${esc(errors[name])}</span>` : ''}`
  return `<div class="tg-auth">
  <h1>Create your Target account</h1>
  <form method="post" action="${base}/account/create">
    <input type="hidden" name="redirect" value="${esc(redirect)}">
    ${f('email', 'Email address', 'email', 'autocomplete="email" required')}
    ${f('firstName', 'First name', 'text', 'autocomplete="given-name" required')}
    ${f('lastName', 'Last name', 'text', 'autocomplete="family-name" required')}
    ${f('phone', 'Mobile phone (optional)', 'tel', 'autocomplete="tel"')}
    ${f('password', 'Create a password', 'password', 'autocomplete="new-password" required')}
    <p class="tg-fine">8&ndash;20 characters with at least 2 of the following: lowercase letters, uppercase letters, numbers, special characters. No &lt; or &gt;.</p>
    <p class="tg-fine">Prefer not to use a password? Set up a passkey (recommended) after you create your account.</p>
    <button type="submit" class="tg-btn tg-btn-block">Create account</button>
  </form>
  <p class="tg-auth-alt">Already have an account? <a href="${base}/login${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}">Sign in</a></p>
</div>`
}

function summaryAside(t, { collapsible = false } = {}) {
  const rows = `<div class="tg-row"><span>Subtotal</span><span>${money(t.subtotal)}</span></div>
    <div class="tg-row"><span>Shipping</span><span>${t.shipping ? money(t.shipping) : 'Free'}</span></div>
    <div class="tg-row"><span>Estimated taxes</span><span>${money(t.tax)}</span></div>
    <div class="tg-row tg-total"><span>Total</span><span>${money(t.total)}</span></div>`
  return `<aside class="tg-summary">
    ${collapsible ? `<details open><summary><span>Order summary</span><b>${money(t.total)} total</b></summary>${rows}</details>` : `<h2>Order summary</h2>${rows}`}
    <p class="tg-fine"><b>Target Circle&trade; Card holders:</b> save 5% instantly, in-store and online. <a href="#">Learn more</a></p>
  </aside>`
}

const addressBlock = (a) => `${esc(a.first_name)} ${esc(a.last_name)}<br>${esc(a.line1)}${a.line2 ? `<br>${esc(a.line2)}` : ''}<br>${esc(a.city)}, ${esc(a.state)} ${esc(a.postal_code)}${a.phone ? `<br>${esc(a.phone)}` : ''}`

// Target's checkout is one page: Shipping address → Payment → Review & place order, each step a
// container with active / done / pending states that pushes its own /checkout/<step> URL.
export function checkoutPage({ base, step, t, checkout, values = {}, errors = {} }) {
  const v = (n) => esc(values[n] ?? '')
  const err = (n) => errors[n] ? `<span class="tg-error" id="err-${n}">${esc(errors[n])}</span>` : ''
  const input = (name, label, type = 'text', extra = '') => `<div class="tg-field"><label for="${name}">${label}</label><input id="${name}" name="${name}" type="${type}" value="${v(name)}" ${extra}${errors[name] ? ` aria-invalid="true" aria-describedby="err-${name}"` : ''}>${err(name)}</div>`
  const stateSelect = (name, label) => `<div class="tg-field"><label for="${name}">${label}</label><select id="${name}" name="${name}" autocomplete="address-level1"${errors[name] ? ` aria-invalid="true" aria-describedby="err-${name}"` : ''}><option value="">Select</option>${STATES.map(s => `<option value="${s}" ${values[name] === s ? 'selected' : ''}>${s}</option>`).join('')}</select>${err(name)}</div>`
  const ship = checkout.shipping, pay = checkout.payment
  const state = (name) => step === name ? 'is-active' : (name === 'shipping' ? ship : name === 'payment' ? pay : false) ? 'is-done' : 'is-pending'
  const preorder = t.lines.some(l => l.product.preorder)
  const arrival = preorder ? PREORDER_ARRIVAL : `Arrives ${ARRIVES}`
  const errorSummary = Object.keys(errors).length ? `<div class="tg-error-box" role="alert"><b>Please fix the following to continue:</b><ul>${Object.values(errors).map(e => `<li>${esc(e)}</li>`).join('')}</ul></div>` : ''

  const shippingBody = step === 'shipping'
    ? `${errorSummary}<div class="tg-service"><b>Standard Shipping</b><span class="tg-fine">${preorder ? `Release date ${esc(t.lines.find(l => l.product.preorder).product.release)} &middot; ${PREORDER_ARRIVAL}` : arrival}</span></div>
    <form method="post" action="${base}/checkout/shipping" novalidate>
      <div class="tg-2col">${input('firstName', 'First name', 'text', 'autocomplete="given-name" required')}${input('lastName', 'Last name', 'text', 'autocomplete="family-name" required')}</div>
      ${input('address1', 'Address line 1', 'text', 'autocomplete="address-line1" required')}
      <details class="tg-addr2" ${values.address2 ? 'open' : ''}><summary>+ Address line 2</summary>${input('address2', 'Address line 2 (optional)', 'text', 'autocomplete="address-line2"')}</details>
      <div class="tg-3col">${input('zip', 'Zip code', 'tel', 'autocomplete="postal-code" inputmode="numeric" required')}${input('city', 'City', 'text', 'autocomplete="address-level2" required')}${stateSelect('state', 'State')}</div>
      ${input('phone', 'Phone number', 'tel', 'autocomplete="tel" required')}
      <label class="tg-check"><input type="checkbox" name="defaultAddress" value="1" ${values.defaultAddress ? 'checked' : ''}> Set as default address</label>
      ${input('instructions', 'Delivery instructions (optional)', 'text', '')}
      <button type="submit" class="tg-btn">Save &amp; continue</button>
    </form>`
    : ship ? `<p class="tg-step-summary">${addressBlock(ship)}</p><p class="tg-fine">Standard Shipping &middot; ${arrival}</p>` : ''

  const pt = values.paymentType && PAYMENT_TYPES[values.paymentType] ? values.paymentType : 'card'
  // Pressing Enter submits a form through its first submit button. The hidden copy of "Save and
  // continue" comes first so Enter in a card field saves the card instead of hitting the gift card "Apply".
  const paymentBody = step === 'payment'
    ? `${errorSummary}<form method="post" action="${base}/checkout/payment" novalidate id="payment-form">
      <button type="submit" class="visually-hidden" tabindex="-1" aria-hidden="true">Save and continue</button>
      <h3>Select payment type</h3>
      <div class="tg-pay-types">${Object.entries(PAYMENT_TYPES).map(([id, m]) => `<label class="tg-radio"><input type="radio" name="paymentType" value="${id}" ${pt === id ? 'checked' : ''}> <b>${esc(m.label)}</b>${m.note ? `<span class="tg-fine">${esc(m.note)}</span>` : ''}</label>`).join('')}</div>
      <div class="tg-pay-panel" data-panel="card">
        <p class="tg-fine">We accept Target Circle&trade; Card, Visa, Mastercard, American Express and Discover.</p>
        ${input('cardNumber', 'Card number', 'text', 'autocomplete="cc-number" inputmode="numeric"')}
        <div class="tg-2col">${input('expiry', 'Exp MM/YY', 'text', 'autocomplete="cc-exp" placeholder="MM/YY"')}<div class="tg-field"><label for="cvv">Security code</label><input id="cvv" name="cvv" type="text" value="" autocomplete="cc-csc" inputmode="numeric" maxlength="4" placeholder="Enter CVV"${errors.cvv ? ' aria-invalid="true" aria-describedby="err-cvv"' : ''}>${err('cvv')}<span class="tg-fine">This 3-digit code can be found on the back of your card.</span></div></div>
        ${input('nameOnCard', 'Name on card', 'text', 'autocomplete="cc-name"')}
        <h3>Billing address</h3>
        <label class="tg-radio"><input type="radio" name="billingSame" value="1" ${values.billingSame !== '0' ? 'checked' : ''} id="billing-same"> <b>Same as shipping address</b>${ship ? `<span class="tg-fine">${esc(ship.line1)}, ${esc(ship.city)}, ${esc(ship.state)} ${esc(ship.postal_code)}</span>` : ''}</label>
        <label class="tg-radio"><input type="radio" name="billingSame" value="0" ${values.billingSame === '0' ? 'checked' : ''} id="billing-new"> <b>Add a new billing address</b></label>
        <div id="billing-fields" class="tg-billing">
          <div class="tg-2col">${input('billingFirstName', 'First name')}${input('billingLastName', 'Last name')}</div>
          ${input('billingAddress1', 'Address line 1')}
          <div class="tg-3col">${input('billingZip', 'Zip code')}${input('billingCity', 'City')}${stateSelect('billingState', 'State')}</div>
        </div>
        <label class="tg-check"><input type="checkbox" name="saveCard" value="1" ${values.saveCard ? 'checked' : ''}> Save as default payment card</label>
      </div>
      <details class="tg-giftcard"${errors.giftCardNumber || values.giftCardNumber ? ' open' : ''}><summary>Add gift card</summary><h3>Pay with a Target GiftCard</h3><div class="tg-3col">${input('giftCardNumber', 'Card number')}${input('giftCardAccess', 'Access number')}<div class="tg-field tg-field-btn"><button type="submit" name="action" value="giftcard" class="tg-btn tg-btn-outline">Apply</button></div></div></details>
      <button type="submit" class="tg-btn">Save and continue</button>
    </form>
    <script>
    (function(){var f=document.getElementById('payment-form');function sync(){var t=f.querySelector('input[name=paymentType]:checked').value;f.querySelectorAll('.tg-pay-panel').forEach(function(p){p.hidden=p.dataset.panel!==t});var same=f.querySelector('#billing-same').checked;document.getElementById('billing-fields').hidden=same}f.querySelectorAll('input[name=paymentType],input[name=billingSame]').forEach(function(r){r.addEventListener('change',sync)});sync()})();
    </script>`
    : pay ? `<p class="tg-step-summary">${pay.type === 'card' ? `${esc(pay.brand)} ending in ${esc(pay.last4)}<br>${esc(pay.name_on_card)}` : esc(PAYMENT_TYPES[pay.type].label)}</p>` : ''

  const reviewBody = step === 'review'
    ? `<div class="tg-review-group"><h3>Shipping</h3><p class="tg-green">${arrival}</p>
      ${t.lines.map(l => `<div class="tg-review-item"><img src="${l.product.art}" alt=""><div>${esc(l.product.title)}<div class="tg-fine">Qty ${l.qty} &middot; ${money(l.product.price * l.qty)}</div></div></div>`).join('')}
      <p class="tg-fine">${addressBlock(ship)}</p></div>
    <div class="tg-review-group"><h3>Payment</h3><p>${pay.type === 'card' ? `${esc(pay.brand)} ending in ${esc(pay.last4)}` : esc(PAYMENT_TYPES[pay.type].label)}</p></div>
    <p class="tg-fine">${CHARGE_POLICY}</p>
    <form method="post" action="${base}/checkout/place-order" class="tg-place">
      <button type="submit" class="tg-btn tg-btn-block ${pay.type === 'card' ? '' : 'tg-btn-outline'}" data-test="placeOrderButton">${pay.type === 'card' ? 'Place your order' : esc(PAYMENT_TYPES[pay.type].button)}</button>
      <p class="tg-fine">By placing an order, you agree to the following: <a href="#">Target terms and conditions</a> and <a href="#">privacy policy</a>.</p>
    </form>`
    : ''

  const stepBox = (name, num, heading, body, testId) => `<section class="tg-step ${state(name)}" data-test="${testId}">
    <div class="tg-step-head"><span class="tg-step-num">${num}</span><h2>${heading}</h2>${state(name) === 'is-done' ? `<a href="${base}/checkout/${name}" class="tg-step-edit">Edit</a>` : ''}</div>
    ${body ? `<div class="tg-step-body">${body}</div>` : ''}
  </section>`

  return `<div class="tg-checkout">
  <div class="tg-co-main">
    <h1 class="visually-hidden">Checkout</h1>
    <details class="tg-cart-acc"><summary>Cart &middot; ${plural(t.count, 'item')}</summary>${t.lines.map(l => `<div class="tg-review-item"><img src="${l.product.art}" alt=""><div>${esc(l.product.title)}<div class="tg-fine">Qty ${l.qty} &middot; ${money(l.product.price * l.qty)}</div></div></div>`).join('')}<a href="${base}/cart" class="tg-fine">Return to cart</a></details>
    ${stepBox('shipping', 1, 'Shipping address', shippingBody, 'STEP_SHIPPING_CONTAINER')}
    ${stepBox('payment', 2, 'Payment', paymentBody, 'STEP_PAYMENT_CONTAINER')}
    ${stepBox('review', 3, 'Review &amp; place order', reviewBody, 'STEP_REVIEW_CONTAINER')}
  </div>
  ${summaryAside(t, { collapsible: true })}
</div>`
}

export function confirmationPage({ base, order }) {
  const a = order.shipping_address
  const count = order.items.reduce((n, i) => n + i.qty, 0)
  const pay = order.payment.method === 'card' ? `${esc(order.payment.brand)} ending in ${esc(order.payment.last4)}` : order.payment.method === 'paypal' ? 'PayPal' : 'Cash App Pay'
  return `<div class="tg-confirm">
  <div class="tg-check-big" aria-hidden="true">&#10003;</div>
  <h1>Thanks for your order!</h1>
  <p>We&rsquo;ll send confirmations and order updates to <b>${esc(order.customer.email)}</b></p>
  <p class="tg-order-num">Order # <span data-order-number>${esc(order.order_number)}</span></p>
  <section class="tg-group">
    <h2>${plural(count, 'item')}</h2>
    <p class="tg-green">${esc(order.fulfillment.eta)}</p>
    ${order.items.map(i => `<div class="tg-review-item"><img src="${i.kind === 'game' ? `/static/art/${i.platform}-${i.edition}.svg` : '/static/art/game-generic.svg'}" alt=""><div>${esc(i.title)}<div class="tg-fine">Qty ${i.qty} &middot; ${money(i.unit_price * i.qty)}</div></div></div>`).join('')}
    <p class="tg-fine"><b>Shipping to</b><br>${esc(a.first_name)} ${esc(a.last_name)}<br>${esc(a.line1)}${a.line2 ? `<br>${esc(a.line2)}` : ''}<br>${esc(a.city)}, ${esc(a.state)} ${esc(a.postal_code)}</p>
    <p class="tg-fine"><b>Payment</b><br>${pay}</p>
  </section>
  <a class="tg-btn tg-btn-outline" href="${base}/orders/${esc(order.order_number)}" aria-label="view details for order #${esc(order.order_number)}">View order details</a>
  <p><b>Need to make changes?</b> Edit your order as soon as possible.</p>
  <aside class="tg-summary tg-summary-inline">
    <h2>Order summary</h2>
    <div class="tg-row"><span>Subtotal</span><span>${money(order.totals.subtotal)}</span></div>
    <div class="tg-row"><span>Shipping</span><span>${order.totals.shipping ? money(order.totals.shipping) : 'Free'}</span></div>
    <div class="tg-row"><span>Estimated taxes</span><span>${money(order.totals.tax)}</span></div>
    <div class="tg-row tg-total"><span>Total</span><span>${money(order.totals.total)}</span></div>
  </aside>
  <div class="tg-circle-banner"><div>${bullseye('tg-bullseye-sm')}</div><div><b>Target Circle 360&trade;</b><p>Skip the $9.99 delivery fee all season long. Try it free for 14 days.</p></div><a href="#">Learn more</a></div>
  <div class="tg-survey"><b>Got shopping preferences?</b><p>Please share your experience.</p><button type="button" class="tg-btn tg-btn-outline tg-btn-sm">Take survey</button></div>
</div>`
}

export function orderDetailsPage({ base, order }) {
  const a = order.shipping_address
  return `<div class="tg-orders">
  <nav class="tg-crumbs" aria-label="Breadcrumb"><a href="${base}/account">Account</a> &rsaquo; <a href="${base}/account">Purchase History</a> &rsaquo; Order # ${esc(order.order_number)}</nav>
  <h1>Order # ${esc(order.order_number)}</h1>
  <p class="tg-fine">Placed ${new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
  <section class="tg-group"><h2>Shipping</h2><p class="tg-green">${esc(order.fulfillment.eta)}</p>
    ${order.items.map(i => `<div class="tg-review-item"><div>${esc(i.title)}<div class="tg-fine">Qty ${i.qty} &middot; ${money(i.unit_price * i.qty)}</div></div><button type="button" class="tg-btn tg-btn-outline tg-btn-sm">Request cancellation</button></div>`).join('')}
    <p class="tg-fine">${esc(a.first_name)} ${esc(a.last_name)}<br>${esc(a.line1)}<br>${esc(a.city)}, ${esc(a.state)} ${esc(a.postal_code)}</p></section>
  <aside class="tg-summary tg-summary-inline"><h2>Order summary</h2>
    <div class="tg-row"><span>Subtotal</span><span>${money(order.totals.subtotal)}</span></div>
    <div class="tg-row"><span>Shipping</span><span>${order.totals.shipping ? money(order.totals.shipping) : 'Free'}</span></div>
    <div class="tg-row"><span>Estimated taxes</span><span>${money(order.totals.tax)}</span></div>
    <div class="tg-row tg-total"><span>Total</span><span>${money(order.totals.total)}</span></div></aside>
</div>`
}

export function accountPage({ base, user, orders }) {
  return `<div class="tg-orders"><h1>Hi, ${esc(user.first_name || 'there')}</h1>
  <p>${esc(user.email)} &middot; <a href="${base}/logout">Sign out</a></p>
  <h2>Purchase History</h2>
  ${orders.length ? orders.map(o => `<div class="tg-order-row"><a href="${base}/orders/${esc(o.order_number)}"><b>Order # ${esc(o.order_number)}</b></a><span class="tg-fine">${new Date(o.created_at).toLocaleDateString('en-US')} &middot; ${o.items.map(i => esc(i.title)).join(', ')}</span><b>${money(o.totals.total)}</b></div>`).join('') : '<p class="tg-fine">You have no orders yet.</p>'}
</div>`
}

export function simplePage({ title, html }) {
  return `<div class="tg-simple"><h1>${esc(title)}</h1>${html}</div>`
}
