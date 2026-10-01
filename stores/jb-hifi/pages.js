import { esc, money, disclaimer } from '../../lib/html.js'
import { byId, productPath, upsells, STATES, SHIPPING_METHODS, COURIER_METHOD, PREORDER_BONUS } from './data.js'

const NAME = 'JB Hi-Fi'
const NAV = ['New', 'Products', 'Brands', 'Deals & Catalogues', 'Clearance', 'Services', 'Gift Cards', 'Join JB Perks', 'News & Reviews']
// JB prints AUD prices with a plain "$" ("$129.00"); only the checkout total carries an "AUD" prefix.
const aud = (n) => money(n, 'AUD').replace('A$', '$')
// JB's yellow price tag shows whole dollars ("$129"); cents only when there are some ("$36.99").
const tagPrice = (n) => aud(n).replace(/\.00$/, '')

// ---- layout ----
export function layout({ base, title, body, cartCount = 0, user = null, added = null, closeHref = '', checkout = null }) {
  const header = checkout ? checkoutHeader(base, checkout) : storeHeader(base, cartCount, user)
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<link rel="stylesheet" href="${base}/static/style.css"></head>
<body class="${checkout ? 'jb-checkout-body' : ''}">
${added ? addedModal(base, added, closeHref) : ''}
${header}
<main class="jb-main">${body}</main>
<footer class="jb-footer">
  ${checkout ? `<p class="jb-footer-links"><a href="#">Refund policy</a> <a href="#">Shipping policy</a> <a href="#">Privacy policy</a> <a href="#">Terms of service</a> <a href="#">Contact</a></p>` : `<div class="jb-footer-cols">
    <div><h4>Help &amp; Support</h4><a href="#">Help Centre</a><a href="${base}/account/orders">Track my order</a><a href="#">Delivery &amp; Collection</a><a href="#">Returns &amp; Refunds</a><a href="#">Contact us</a></div>
    <div><h4>About JB Hi-Fi</h4><a href="#">About us</a><a href="#">Careers</a><a href="${base}/stores">Store finder</a><a href="#">Gift Cards</a><a href="#">JB Perks</a></div>
    <div><h4>Shop</h4><a href="${base}/search?query=gaming">Gaming</a><a href="#">TVs</a><a href="#">Computers</a><a href="#">Mobile Phones</a><a href="#">Music &amp; Movies</a></div>
    <div><h4>Stay in the loop</h4><p>Get the latest deals, catalogues and news.</p><form onsubmit="return false"><label for="footer-email" class="visually-hidden">Email address</label><input id="footer-email" type="email" placeholder="Email address"><button type="button">Sign up</button></form></div>
  </div>
  <p class="jb-copy">&copy; 2026 JB Hi-Fi Group Pty Ltd &nbsp;·&nbsp; ABN 37 093 114 286 &nbsp;·&nbsp; Prices include GST</p>`}
  ${disclaimer(NAME)}
</footer>
<div class="jb-chat" aria-hidden="true">Chat</div>
</body></html>`
}

function storeHeader(base, cartCount, user) {
  return `<header class="jb-header">
  <div class="jb-strip"><span>Seen it cheaper? Ask for a JB Deal! Live chat or call 13 52 44</span><button type="button" aria-label="Close" onclick="this.parentNode.remove()">&times;</button></div>
  <div class="jb-bar">
    <a class="jb-logo" href="${base}/" aria-label="JB Hi-Fi home"><span class="jb-wordmark">JB HI-FI</span><span class="jb-tagline">ALWAYS CHEAP PRICES</span></a>
    <form class="jb-search" action="${base}/search" method="get" role="search">
      <input type="search" name="query" placeholder="Search products, brands, and more…" aria-label="Search products, brands, and more">
      <button type="submit" aria-label="Search"><svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M15.5 15.5 21 21" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg></button>
    </form>
    <nav class="jb-utils" aria-label="Account">
      <a href="${base}/account/orders"><span class="jb-ico">&#128230;</span>Track order</a>
      <a href="${base}/stores"><span class="jb-ico">&#128205;</span>Stores</a>
      ${user ? `<a href="${base}/account"><span class="jb-ico">&#128100;</span>Hi, ${esc(user.first_name || 'there')}</a>` : `<a href="${base}/account/login"><span class="jb-ico">&#128100;</span>Log in</a>`}
      <a href="${base}/cart" class="jb-cart-link" aria-label="Cart, ${cartCount} items"><span class="jb-ico">&#128722;${cartCount ? `<span class="jb-badge">${cartCount}</span>` : ''}</span>Cart</a>
    </nav>
  </div>
  <nav class="jb-nav" aria-label="Shop">${NAV.map(n => `<a href="${base}/search?query=${encodeURIComponent(n)}">${esc(n)} <small>&#9662;</small></a>`).join('')}</nav>
</header>`
}

function checkoutHeader(base, { steps = [], current }) {
  return `<header class="jb-header jb-header-checkout">
  <div class="jb-bar jb-bar-centered"><a class="jb-logo" href="${base}/" aria-label="JB Hi-Fi home"><span class="jb-wordmark">JB HI-FI</span><span class="jb-tagline">ALWAYS CHEAP PRICES</span></a></div>
  ${steps.length ? `<nav class="jb-steps" aria-label="Breadcrumb"><ol>${steps.map(s => `<li ${s.id === current ? 'aria-current="step" class="is-current"' : ''}>${s.href && s.id !== current ? `<a href="${s.href}">${esc(s.label)}</a>` : esc(s.label)}</li>`).join('<li class="jb-sep" aria-hidden="true">&rsaquo;</li>')}</ol></nav>` : ''}
</header>`
}

// Full-screen "Item added to your cart!" panel (the ?added= fallback keeps it working without JavaScript).
function addedModal(base, p, closeHref) {
  const actions = `<div class="jb-modal-actions"><a class="jb-btn jb-btn-black" href="${base}/cart">Review cart</a><a class="jb-btn" href="${base}/checkout">Checkout</a></div>`
  return `<div class="jb-modal-backdrop"><div class="jb-modal" role="dialog" aria-modal="true" aria-labelledby="added-title">
  <a class="jb-modal-close" href="${closeHref}" aria-label="Close">&times;</a>
  <div class="jb-modal-top"><span class="jb-check" aria-hidden="true">&#10003;</span><h2 id="added-title">Item added to your cart!</h2></div>
  <div class="jb-modal-item"><img src="${p.art}" alt=""><div class="jb-modal-name"><b>${esc(p.title)}</b><div class="jb-subtitle">${esc(p.subtitle)}</div></div>${actions}</div>
  <h3 class="jb-display">Enhance your product</h3>
  <div class="jb-carousel">${upsells().map(u => tile(base, u, closeHref)).join('')}</div>
  ${actions}
</div></div>`
}

// ---- shared bits ----
function badges(p) { return p.badges.length ? `<div class="jb-badges">${p.badges.map(b => `<span class="jb-badge-tag is-${b.toLowerCase().replace(/[^a-z]+/g, '-')}">${esc(b)}</span>`).join('')}</div>` : '' }
function stars(p) { return p.stars ? `<div class="jb-stars" aria-label="Rated ${p.stars} out of 5 from ${p.reviews} reviews">&#9733;&#9733;&#9733;&#9733;&#9733; <span>${p.stars} (${p.reviews})</span></div>` : '' }
function priceTag(p, big = false) { return `<div class="jb-tag ${big ? 'jb-tag-big' : ''}"><span>${tagPrice(p.price)}</span></div>` }
function ctaForm(base, p, returnTo, block = true) {
  if (!p.orderable) return `<span class="jb-btn jb-btn-grey ${block ? 'jb-btn-block' : ''}" aria-disabled="true">${esc(p.cta)}</span>`
  return `<form method="post" action="${base}/cart/add" class="jb-add-form"><input type="hidden" name="id" value="${p.id}"><input type="hidden" name="return" value="${esc(returnTo)}"><button class="jb-btn ${block ? 'jb-btn-block' : ''}" type="submit">${esc(p.cta)}</button></form>`
}

function tile(base, p, returnTo) {
  return `<article class="jb-tile">
  ${badges(p)}
  <a class="jb-heart" href="${base}/wishlist/add?id=${p.id}" aria-label="Add ${esc(p.title)} to wishlist">&#9825;</a>
  <a class="jb-tile-art" href="${productPath(base, p)}"><img src="${p.art}" alt="${esc(p.title)}"></a>
  <h3><a href="${productPath(base, p)}">${esc(p.title)}</a></h3>
  <div class="jb-subtitle">${esc(p.subtitle)}</div>
  ${stars(p)}
  ${priceTag(p)}
  ${p.deliveryFrom ? `<div class="jb-delivery-from">+ DELIVERY FROM ${tagPrice(p.deliveryFrom)}</div>` : ''}
  ${ctaForm(base, p, returnTo)}
</article>`
}

// ---- store pages ----
export function homePage({ base, products }) {
  const game = products.filter(p => p.kind === 'game')
  const rest = products.filter(p => p.kind !== 'game' && !p.upsell && /Grand Theft Auto VI/.test(p.title))
  return `<section class="jb-hero">
  <div><span class="jb-badge-tag is-pre-order">PRE-ORDER</span><h1>Grand Theft Auto VI</h1><p>Out 19 November 2026 on PlayStation 5 and Xbox Series X. Pre-order now for the Vintage Vice City Pack. Code in box — pick up your copy from 12 November to preload.</p>
  <div class="jb-hero-links">${game.map(g => `<a class="jb-btn" href="${productPath(base, g)}">Pre-order ${esc(g.subtitle)}</a>`).join('')}</div></div>
  <img src="${game[0].art}" alt="Grand Theft Auto VI box art">
</section>
<section><h2 class="jb-display">Hot pre-orders</h2><div class="jb-grid">${game.map(p => tile(base, p, `${base}/`)).join('')}</div></section>
<section><h2 class="jb-display">More from Grand Theft Auto VI</h2><div class="jb-grid">${rest.map(p => tile(base, p, `${base}/`)).join('')}</div></section>`
}

export function searchPage({ base, q, products, self }) {
  const games = products.filter(p => p.kind === 'game').length
  const facet = (name, opts, open = false) => `<details ${open ? 'open' : ''}><summary>${esc(name)}</summary>${opts.map(([l, n]) => { const id = `f-${(name + ' ' + l).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`; return `<label for="${id}"><input type="checkbox" id="${id}"> ${esc(l)} (${n})</label>` }).join('')}</details>`
  const rail = `<aside class="jb-facets"><h2>Filter</h2>
  ${facet('Brand', [['Rockstar Games', products.filter(p => /rockstar/i.test(p.keywords)).length], ['Sony', products.filter(p => /sony/i.test(p.keywords)).length]], true)}
  ${facet('Price', [['Under $50', products.filter(p => p.price < 50).length], ['$50 - $150', products.filter(p => p.price >= 50 && p.price <= 150).length], ['Over $150', products.filter(p => p.price > 150).length]])}
  ${facet('Category', [['Games', products.filter(p => /games/.test(p.keywords)).length], ['Accessories', products.filter(p => /accessories/.test(p.keywords)).length], ['Music', products.filter(p => /music/.test(p.keywords)).length]])}
  ${facet('Primary Format - Games', [['Code in Box', games]])}
  ${facet('Console compatibility', [['PlayStation 5', products.filter(p => /ps5/.test(p.keywords)).length], ['Xbox Series X|S', products.filter(p => /xbox/.test(p.keywords)).length]])}
  ${facet('Game Genre', [['Action & Adventure', products.filter(p => p.specs.some(s => s[1] === 'Action & Adventure')).length]])}
  ${facet('Game publisher', [['Rockstar Games', products.filter(p => p.specs.some(s => s[0] === 'Game publisher')).length]])}
  ${facet('Game developer', [['Rockstar Games', games]])}
  ${facet('Primary Format - Music', [['CD', products.filter(p => p.subtitle === 'CD').length], ['Vinyl', products.filter(p => p.subtitle === 'Vinyl').length]])}
  </aside>`
  return `<nav class="jb-crumbs" aria-label="Breadcrumb"><a href="${base}/">Home</a> &rsaquo; Search results: '${esc(q)}'</nav>
<div class="jb-search-head"><h1>${products.length} results for "${esc(q)}"</h1>
  <div class="jb-toolbar"><span>Show: <b>36</b> 72 100</span><label for="sort-by">Sort by: <select id="sort-by"><option>Best Match</option><option>Price: Low - High</option><option>Price: High - Low</option><option>New - Old</option><option>Old - New</option><option>Title: A - Z</option><option>Title: Z - A</option><option>Highest rated</option></select></label></div></div>
<div class="jb-search-body">${rail}
  <div>${products.length ? `<div class="jb-grid">${products.map(p => tile(base, p, self)).join('')}</div>` : `<p class="jb-empty">Sorry, we couldn't find anything for "${esc(q)}". Check the spelling or try a different search.</p>`}
  <p class="jb-fine jb-center">Showing ${products.length} of ${products.length} results</p>
  <p class="jb-fine">^Discounts apply to previous ticketed / advertised price prior to the discount offer. As we negotiate on price, products are likely to have sold below ticketed / advertised price in stores prior to the discount offer.</p></div>
</div>`
}

export function productPage({ base, p, siblings, availability, stores = [], perks = false }) {
  const isGame = p.kind === 'game'
  const self = productPath(base, p)
  const inStore = p.orderable && !p.badges.includes('ONLINE ONLY')
  const preorder = p.cta === 'Pre-order'
  const availPanel = availability ? `<div class="jb-store-panel"><div class="jb-store-panel-head"><b>Your store</b> &nbsp;·&nbsp; Click &amp; Collect &nbsp;·&nbsp; Check store availability</div>
    ${inStore ? `<p>Stores near <b>${esc(availability === 'my location' ? 'your location' : availability)}</b>:</p><ul class="jb-store-list">${stores.map(s => `<li><b>${esc(s.name)}</b><br><span class="jb-fine">${esc(s.address)}</span><br><span class="jb-avail-ok">&#10003; Click &amp; Collect${preorder ? ` — pre-order now, collect from ${esc(p.preloadFrom ?? p.releaseLong)}` : ''}</span></li>`).join('')}</ul>` : `<p class="jb-error">Sorry, there are no in-store options available for this product.</p>`}
    <a class="jb-fine" href="${self}">Close</a></div>` : ''
  const deliveryText = !p.orderable ? 'Coming soon' : preorder ? `Available to pre-order${p.preloadFrom ? ` — delivery starts ${esc(p.preloadFrom)}` : ''}` : 'Available for delivery'
  // First product-page visit only: JB Perks popup in the lower left (research step 2). X closes it; it does not come back.
  const perksPopup = perks ? `<aside class="jb-perks" aria-label="JB Perks offer">
  <a class="jb-perks-close" href="${self}" aria-label="Close" onclick="this.parentNode.remove();return false">&times;</a>
  <p class="jb-perks-title">WANT A $10 WELCOME COUPON*?</p>
  <p class="jb-perks-sub">JOIN FOR FREE MEMBER BENEFITS!</p>
  <p class="jb-fine">Valid for 28 days from issue. T&amp;Cs apply.</p>
  <a class="jb-btn jb-btn-block" href="${base}/account/register">Join &amp; get my $10</a>
</aside>` : ''
  const variants = siblings.map(s => `<a class="jb-variant ${s.id === p.id ? 'is-selected' : ''}" href="${productPath(base, s)}" aria-current="${s.id === p.id ? 'true' : 'false'}"><b>${esc(s.variantLabel)}</b><span>${tagPrice(s.price)}</span></a>`).join('')
  const crumbs = [`<a href="${base}/">Home</a>`, ...p.crumbs.map(c => `<a href="${base}/search?query=${encodeURIComponent(c)}">${esc(c)}</a>`), esc(p.title)].join(' &rsaquo; ')
  return `<nav class="jb-crumbs" aria-label="Breadcrumb">${crumbs}</nav>
<div class="jb-pdp">
  <div class="jb-gallery">
    <div class="jb-gallery-top">${isGame ? '<span class="jb-badge-tag is-pre-order-dlc">PRE-ORDER DLC</span>' : ''}<a href="${base}/search?query=${encodeURIComponent(p.title)}" class="jb-fine">Similar items &rsaquo;</a></div>
    <div class="jb-gallery-body"><div class="jb-thumbs">${Array.from({ length: 5 }, () => `<img src="${p.art}" alt="">`).join('')}</div><div class="jb-hero-art"><img src="${p.art}" alt="${esc(p.title)}">${p.rating ? `<span class="jb-rating-mark">${esc(p.rating)}</span>` : ''}</div></div>
  </div>
  <div class="jb-buybox">
    ${badges(p)}
    ${isGame ? `<div class="jb-platform-logo">${esc(p.platformName)}</div>` : ''}
    <h1>${esc(p.title)}</h1>
    <div class="jb-ids">MODEL: ${esc(p.model ?? p.id)} &nbsp; SKU: ${esc(p.id)} &nbsp; PLU: ${esc(p.model ?? p.id)}</div>
    ${priceTag(p, true)}
    <div class="jb-bnpl"><a href="#" class="jb-bnpl-afterpay">afterpay</a><a href="#" class="jb-bnpl-zip">zip</a><a href="#" class="jb-bnpl-paypal">PayPal</a></div>
    <div class="jb-coupon-row">&#127991; <a href="${base}/account/login?return_to=${encodeURIComponent(self)}">Log in</a> to see if you have coupons.</div>
    ${isGame ? `<div class="jb-variants"><div class="jb-label">Primary Format - Games</div><div class="jb-variant-row"><a class="jb-variant" href="${base}/products/grand-theft-auto-vi-the-goodtime-state-vice-city-collection"><b>The Goodtime State - Vice City Collection</b><span>${tagPrice(699)}</span></a>${variants}</div></div>` : ''}
    <div class="jb-cta-row">${ctaForm(base, p, self, false)}<a class="jb-heart-btn" href="${base}/wishlist/add?id=${p.id}" aria-label="Add to wishlist">&#9825;</a></div>
    ${p.notice.length ? `<div class="jb-notice"><span class="jb-notice-icon" aria-hidden="true">!</span><ul>${p.notice.map(n => `<li>${esc(n)}</li>`).join('')}</ul></div>` : ''}
    <h2 class="jb-display">Description</h2>
    ${p.rating ? `<p class="jb-fine">Rating: <b>${esc(p.rating)}</b> &nbsp; Consumer Advice: <b>${esc(p.rating)}</b></p>` : ''}
    ${p.release ? `<div class="jb-kv"><span>Release date</span><b>${esc(p.release)}</b></div>` : ''}
    ${isGame ? `<div class="jb-kv jb-kv-stack"><span>Pre-order price guarantee</span><span class="jb-fine">If the price of your pre-order drops before release day, we'll refund you the difference shortly after release.</span></div>` : ''}
    <a class="jb-fine" href="#overview">&darr; Product overview</a>
    <h2 class="jb-display">Availability</h2>
    <div class="jb-avail-rows">
      <div class="jb-avail-row"><span class="jb-avail-ico" aria-hidden="true">&#128666;</span><div><b>Delivery</b><div class="jb-fine">${deliveryText}</div></div></div>
      <div class="jb-avail-row"><span class="jb-avail-ico" aria-hidden="true">&#127978;</span><div><b>Click &amp; Collect</b><div class="jb-fine">${inStore ? 'Check store availability' : 'Not available for this product'}</div></div></div>
    </div>
    <form method="get" action="${self}" class="jb-avail-form"><label for="availability" class="visually-hidden">Enter postcode or suburb</label><input id="availability" name="availability" type="text" placeholder="Enter postcode or suburb" value="${esc(availability && availability !== 'my location' ? availability : '')}"><button type="submit" class="jb-btn jb-btn-black jb-btn-small">Check</button><a href="${self}?availability=my+location">Use my location</a></form>
    ${availPanel}
    <div class="jb-deal-box"><b>SEEN IT CHEAPER? ASK FOR A JB DEAL!</b><div>INSTORE | ONLINE</div><div class="jb-fine">Excludes JB Hi-Fi Marketplace products</div><div class="jb-deal-actions"><a class="jb-btn jb-btn-black jb-btn-small" href="#">Live chat</a><a class="jb-btn jb-btn-black jb-btn-small" href="#">Call 13 52 44</a></div><div class="jb-fine">9am – 8pm AEST</div></div>
  </div>
</div>
${isGame ? `<section class="jb-dlc"><div class="jb-dlc-art">PRE-ORDER BONUS</div><div><div class="jb-display">${esc(PREORDER_BONUS.heading)}</div><h2>${esc(PREORDER_BONUS.title)}</h2><p>${esc(PREORDER_BONUS.text)}</p><p class="jb-fine">${esc(PREORDER_BONUS.ends)}</p></div></section>` : ''}
<section><h2 class="jb-display">Frequently bought together</h2><div class="jb-carousel">${upsells().map(u => tile(base, u, self)).join('')}</div></section>
<section id="overview" class="jb-overview"><h2 class="jb-display">Description</h2>${p.description.map(d => `<p>${esc(d)}</p>`).join('')}
  <table class="jb-specs">${p.specs.map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`).join('')}</table></section>
<section><h2 class="jb-display">Recommended for you</h2><div class="jb-carousel">${siblings.filter(s => s.id !== p.id).concat(upsells().slice(0, 2)).map(u => tile(base, u, self)).join('')}</div></section>
${perksPopup}`
}

export function cartPage({ base, t, couponError }) {
  if (!t.lines.length) {
    return `<div class="jb-cart-empty"><h1>My Cart</h1><p>Your cart is empty</p><p class="jb-fine">Includes GST. Shipping calculated at checkout.</p><a class="jb-btn" href="${base}/">Continue shopping</a></div>`
  }
  const rows = t.lines.map(l => `<div class="jb-line">
  <img src="${l.product.art}" alt="">
  <div class="jb-line-info">
    <a href="${productPath(base, l.product)}"><b>${esc(l.product.title)}</b></a>
    <div class="jb-fine">${esc(l.product.subtitle)}</div>
    ${l.product.release && l.product.cta === 'Pre-order' ? `<div class="jb-fine">&#9432; Pre-order release date ${esc(l.product.releaseLong)}</div>` : ''}
  </div>
  <form method="post" action="${base}/cart/update" class="jb-line-actions">
    <input type="hidden" name="id" value="${l.product.id}">
    <label for="qty-${l.product.id}">Quantity <select id="qty-${l.product.id}" name="qty" onchange="this.form.submit()">${[1, 2, 3, 4, 5].map(n => `<option value="${n}" ${n === l.qty ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
    <button type="submit" name="action" value="update" class="jb-link-btn">Update</button>
    <span class="jb-line-price">${aud(l.product.price * l.qty)}</span>
    <button type="submit" name="action" value="remove" class="jb-link-btn">&#128465; Remove</button>
  </form>
</div>`).join('')
  return `<div class="jb-cart-head"><h1>My Cart</h1><a href="${base}/">&#128722; Continue shopping</a></div>
<div class="jb-cart">
  <div class="jb-cart-main">${rows}</div>
  <aside class="jb-summary">
    <form method="post" action="${base}/cart/coupon" class="jb-inline-form"><label for="coupon">Coupon code</label><div><input id="coupon" name="code" type="text"><button type="submit" class="jb-btn jb-btn-black jb-btn-small">Apply</button></div>${couponError ? `<p class="jb-error" role="alert">${esc(couponError)}</p>` : ''}</form>
    <div class="jb-inline-form"><label for="cart-availability">Availability</label><div><input id="cart-availability" type="text" placeholder="Enter postcode or suburb"><a href="${base}/cart" class="jb-fine">Use my location</a></div></div>
    <div class="jb-row jb-total"><span>Subtotal</span><span>${aud(t.subtotal)}</span></div>
    <p class="jb-fine">Includes GST. Shipping calculated at checkout.</p>
    <form method="post" action="${base}/checkout"><button type="submit" class="jb-btn jb-btn-block">Checkout</button></form>
  </aside>
</div>
<section><h2 class="jb-display">Don’t forget these</h2><div class="jb-carousel">${upsells().map(u => tile(base, u, `${base}/cart`)).join('')}</div></section>`
}

// ---- account ----
export function loginPage({ base, error, email = '', returnTo = '' }) {
  return `<div class="jb-auth">
  <h1>Log in</h1>
  ${error ? `<p class="jb-error" role="alert">${esc(error)}</p>` : ''}
  <form method="post" action="${base}/account/login">
    <input type="hidden" name="return_to" value="${esc(returnTo)}">
    <div class="jb-field"><label for="email">Email</label><input id="email" name="email" type="email" autocomplete="email" value="${esc(email)}" required></div>
    <div class="jb-field"><label for="password">Password</label><input id="password" name="password" type="password" autocomplete="current-password" required></div>
    <button class="jb-btn jb-btn-block" type="submit">Log in</button>
    <p class="jb-fine"><a href="#">Forgot your password?</a></p>
  </form>
  <p>Don't have an account? <a href="${base}/account/register">Create account</a></p>
</div>`
}

export function registerPage({ base, values = {}, errors = {} }) {
  const f = (name, label, type = 'text', extra = '') => `<div class="jb-field"><label for="${name}">${label}</label><input id="${name}" name="${name}" type="${type}" value="${esc(values[name] ?? '')}" ${extra}>${errors[name] ? `<span class="jb-error">${esc(errors[name])}</span>` : ''}</div>`
  return `<div class="jb-auth"><h1>Create account</h1>
  <form method="post" action="${base}/account/register">
    ${f('email', 'Email', 'email', 'autocomplete="email" required')}
    ${f('password', 'Password', 'password', 'autocomplete="new-password" required')}
    ${f('first_name', 'First name', 'text', 'autocomplete="given-name" required')}
    ${f('last_name', 'Last name', 'text', 'autocomplete="family-name" required')}
    ${f('phone', 'Mobile number', 'tel', 'autocomplete="tel"')}
    <button class="jb-btn jb-btn-block" type="submit">Create account</button>
    <p class="jb-fine">Already have an account? <a href="${base}/account/login">Log in</a></p>
  </form></div>`
}

export function accountPage({ base, user, orders }) {
  return `<div class="jb-account"><h1>My account</h1>
  <p>Hi, ${esc(user.first_name)} (${esc(user.email)}) · <a href="${base}/account/logout">Log out</a></p>
  <h2 class="jb-display">Order history</h2>
  ${orders.length ? `<table class="jb-table"><thead><tr><th>Order</th><th>Date</th><th>Items</th><th>Total</th></tr></thead><tbody>${orders.map(o => `<tr><td>#${esc(o.order_number)}</td><td>${new Date(o.created_at).toLocaleDateString('en-AU')}</td><td>${o.items.map(i => `${esc(i.title)} × ${i.qty}`).join('<br>')}</td><td>${aud(o.totals.total)}</td></tr>`).join('')}</tbody></table>` : '<p>You have no orders yet.</p>'}
  </div>`
}

export function wishlistPage({ base, p, user }) {
  return `<div class="jb-auth jb-wishlist">
  ${user ? `<h1>Added to your wishlist</h1><p>${esc(p.title)} is in your wishlist.</p><a class="jb-btn" href="${productPath(base, p)}">Back to product</a>`
    : `<h1>You're one step away from having this in your wishlist!</h1><p>Create a free JB Hi-Fi account to save ${esc(p.title)} and get a $10 JB Perks welcome coupon.</p>
  <div class="jb-modal-actions"><a class="jb-btn" href="${base}/account/register">Create account</a><a class="jb-btn jb-btn-black" href="${base}/account/login?return_to=${encodeURIComponent(productPath(base, p))}">Log in</a></div>
  <p><a href="${productPath(base, p)}">Back to product</a></p>`}
</div>`
}

export function simplePage({ title, html }) { return `<div class="jb-simple"><h1>${esc(title)}</h1>${html}</div>` }

export function storesPage({ base, query, stores }) {
  return `<nav class="jb-crumbs" aria-label="Breadcrumb"><a href="${base}/">Home</a> &rsaquo; Stores</nav>
<div class="jb-simple"><h1>Find a store</h1>
  <form method="get" action="${base}/stores" class="jb-avail-form"><label for="store-q" class="visually-hidden">Enter postcode or suburb</label><input id="store-q" name="q" type="text" placeholder="Enter postcode or suburb" value="${esc(query)}"><button type="submit" class="jb-btn jb-btn-black jb-btn-small">Search</button></form>
  <ul class="jb-store-list">${stores.map(s => `<li><b>${esc(s.name)}</b><br><span class="jb-fine">${esc(s.address)}</span><br><span class="jb-avail-ok">Click &amp; Collect available</span></li>`).join('')}</ul>
</div>`
}

export function trackOrderPage({ base, values = {}, error = null, order = null }) {
  const result = order ? `<div class="jb-notice jb-notice-ok" role="status"><ul>
    <li><b>Order #${esc(order.order_number)}</b> — placed ${esc(new Date(order.created_at).toLocaleDateString('en-AU'))}</li>
    ${order.items.map(i => `<li>${esc(i.title)}${byId(i.sku) ? ` (${esc(byId(i.sku).subtitle)})` : ''} × ${i.qty}</li>`).join('')}
    <li>Status: Pre-order confirmed, paid in full. ${order.fulfillment.method === 'pickup' ? `Click &amp; Collect from ${esc(order.fulfillment.store_location)}.` : `We'll email you when it ships.`}</li></ul></div>` : ''
  return `<div class="jb-auth"><h1>Track your order</h1>
  ${result}${error ? `<p class="jb-error" role="alert">${esc(error)}</p>` : ''}
  <form method="post" action="${base}/account/orders">
    <div class="jb-field"><label for="order_number">Order number</label><input id="order_number" name="order_number" type="text" inputmode="numeric" value="${esc(values.order_number ?? '')}"></div>
    <div class="jb-field"><label for="track_email">Email</label><input id="track_email" name="email" type="email" autocomplete="email" value="${esc(values.email ?? '')}"></div>
    <button class="jb-btn jb-btn-block" type="submit">Track order</button>
  </form>
  <p class="jb-fine">Have an account? <a href="${base}/account/login?return_to=${encodeURIComponent(`${base}/account`)}">Log in</a> to see all your orders.</p>
</div>`
}

// ---- checkout (Shopify-style, three pages + thank you) ----
// The discount box belongs to the step's own form (form="…"), so "Apply" keeps whatever the shopper has typed.
function orderSummary({ t, shipping, pickup, discountError, formId, code = '' }) {
  const shipText = pickup ? 'Free' : shipping ? aud(shipping.price) : 'Calculated at next step'
  return `<aside class="jb-co-summary" aria-label="Order summary">
  ${t.lines.map(l => `<div class="jb-co-item"><span class="jb-co-thumb"><img src="${l.product.art}" alt=""><span class="jb-qty-badge">${l.qty}</span></span><span class="jb-co-item-title">${esc(l.product.title)}<small>${esc(l.product.subtitle)}</small></span><span>${aud(l.product.price * l.qty)}</span></div>`).join('')}
  <div class="jb-co-discount"><label for="summary-discount" class="visually-hidden">Discount code or gift card</label><input id="summary-discount" type="text" placeholder="Discount code or gift card" form="${formId}" name="discount_code" value="${esc(code)}"><button type="submit" form="${formId}" name="apply_discount" value="1" class="jb-btn jb-btn-grey jb-btn-small">Apply</button></div>
  ${discountError ? `<p class="jb-error" role="alert">${esc(discountError)}</p>` : ''}
  <div class="jb-row"><span>Subtotal</span><span>${aud(t.subtotal)}</span></div>
  <div class="jb-row"><span>Shipping</span><span>${shipText}</span></div>
  <div class="jb-row jb-total"><span>Total</span><span><small>AUD</small> ${aud(t.subtotal + (pickup ? 0 : shipping?.price ?? 0))}</span></div>
  <p class="jb-fine">Includes GST.</p>
</aside>`
}

function coField(name, label, values, errors, { type = 'text', extra = '' } = {}) {
  return `<div class="jb-field ${errors[name] ? 'has-error' : ''}"><label for="${name}">${label}</label><input id="${name}" name="${name}" type="${type}" value="${esc(values[name] ?? '')}" ${extra} ${errors[name] ? `aria-invalid="true" aria-describedby="err-${name}"` : ''}>${errors[name] ? `<span class="jb-error" id="err-${name}">${esc(errors[name])}</span>` : ''}</div>`
}
function stateSelect(name, values, errors) {
  return `<div class="jb-field ${errors[name] ? 'has-error' : ''}"><label for="${name}">State/territory</label><select id="${name}" name="${name}" autocomplete="address-level1"><option value="">Select</option>${STATES.map(([c, n]) => `<option value="${c}" ${values[name] === c ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select>${errors[name] ? `<span class="jb-error" id="err-${name}">${esc(errors[name])}</span>` : ''}</div>`
}
function addressFields(prefix, values, errors) {
  const k = (n) => prefix ? `${prefix}_${n}` : n
  return `<div class="jb-field"><label for="${k('country')}">Country/Region</label><select id="${k('country')}" name="${k('country')}" autocomplete="country"><option value="AU" selected>Australia</option></select></div>
  <div class="jb-2col">${coField(k('first_name'), 'First name', values, errors, { extra: 'autocomplete="given-name"' })}${coField(k('last_name'), 'Last name', values, errors, { extra: 'autocomplete="family-name"' })}</div>
  ${coField(k('company'), 'Company (optional)', values, errors, { extra: 'autocomplete="organization"' })}
  ${coField(k('address1'), 'Address', values, errors, { extra: 'autocomplete="address-line1"' })}
  ${coField(k('address2'), 'Address line 2 (optional)', values, errors, { extra: 'autocomplete="address-line2"' })}
  <div class="jb-3col">${coField(k('suburb'), 'Suburb', values, errors, { extra: 'autocomplete="address-level2"' })}${stateSelect(k('state'), values, errors)}${coField(k('postcode'), 'Postcode', values, errors, { extra: 'autocomplete="postal-code" inputmode="numeric"' })}</div>`
}
const errorBanner = (errors) => Object.keys(errors).length ? `<div class="jb-error-banner" role="alert"><b>There was a problem with your submission.</b><ul>${Object.values(errors).map(e => `<li>${esc(e)}</li>`).join('')}</ul></div>` : ''

export function informationPage({ urls, t, values = {}, errors = {}, stores = null, storeQuery = '', pointQuery = null, user, discountError }) {
  const method = values.delivery_method || 'delivery'
  const radio = (id, label, icon) => `<label class="jb-method ${method === id ? 'is-selected' : ''}" for="delivery_method_${id}"><input type="radio" id="delivery_method_${id}" name="delivery_method" value="${id}" ${method === id ? 'checked' : ''}><span class="jb-method-icon" aria-hidden="true">${icon}</span><span>${label}</span>${id === 'delivery' ? '<span class="jb-method-cost">Calculated at next step</span>' : id === 'pickup' ? '<span class="jb-method-cost">Free</span>' : ''}</label>`
  const storeList = stores ? (stores.length ? `<div class="jb-store-results" role="radiogroup" aria-label="Pickup locations">${stores.map(s => `<label class="jb-store-option ${values.store_id === s.id ? 'is-selected' : ''}" for="store_${s.id}"><input type="radio" id="store_${s.id}" name="store_id" value="${s.id}" ${values.store_id === s.id ? 'checked' : ''}><span><b>${esc(s.name)}</b><br><span class="jb-fine">${esc(s.address)}</span><br><span class="jb-fine">${esc(collectNote(t))} Bring your confirmation email/SMS and photo ID.</span></span><span class="jb-store-cost">Free</span></label>`).join('')}</div>`
    : `<div class="jb-error-box">No stores available with your item<br><span class="jb-fine">Ship your items or search elsewhere.</span></div>`) : ''
  return `<div class="jb-co">
  <form method="post" action="${urls.information}" class="jb-co-form" novalidate id="jb-information-form">
    ${errorBanner(errors)}
    <section class="jb-co-section"><div class="jb-express"><span>Express checkout</span><div class="jb-express-btns"><button type="button" class="jb-express-btn jb-express-paypal" disabled>PayPal</button><button type="button" class="jb-express-btn jb-express-gpay" disabled>G Pay</button></div><div class="jb-or">OR</div></div></section>
    <section class="jb-co-section"><h2>Your details</h2>
      ${user ? `<p class="jb-fine">Logged in as ${esc(user.email)} · <a href="${urls.logout}">Log out</a></p>` : ''}
      ${coField('email', 'Email', values, errors, { type: 'email', extra: 'autocomplete="email"' })}
      <p class="jb-fine">Used for your order confirmation and cart reminders</p>
      <label class="jb-check" for="newsletter"><input type="checkbox" id="newsletter" name="newsletter" value="1" ${values.newsletter ? 'checked' : ''}> Keep me in the loop on hot news and offers!</label>
    </section>
    <section class="jb-co-section"><h2>Delivery method</h2><p class="jb-fine">Choose a delivery method</p>
      <div class="jb-methods">${radio('delivery', 'Delivery', '&#128666;')}${radio('pickup', 'Click &amp; Collect', '&#127978;')}${radio('collection_point', 'Ship to collection point', '&#128205;')}</div>
      ${errors.delivery_method ? `<span class="jb-error">${esc(errors.delivery_method)}</span>` : ''}
      <div class="jb-panel jb-panel-delivery"><h2>Shipping address</h2>
        ${addressFields('', values, errors)}
        ${coField('phone', 'Mobile phone', values, errors, { type: 'tel', extra: 'autocomplete="tel"' })}
        <label class="jb-check" for="save_info"><input type="checkbox" id="save_info" name="save_info" value="1" ${values.save_info ? 'checked' : ''}> Save this information for next time</label>
      </div>
      <div class="jb-panel jb-panel-pickup"><h2>Pickup locations</h2>
        <div class="jb-finder"><button type="submit" name="use_location" value="1" class="jb-btn jb-btn-black jb-btn-small">Use my location</button><span class="jb-or-inline">OR</span>
          <div class="jb-field"><label for="store_country">Country/region</label><select id="store_country" name="store_country"><option value="AU" selected>Australia</option></select></div>
          <div class="jb-field"><label for="store_query">Suburb or postcode</label><input id="store_query" name="store_query" type="text" value="${esc(storeQuery)}"></div>
          <button type="submit" name="find_stores" value="1" class="jb-btn jb-btn-grey jb-btn-small">Find stores</button></div>
        ${storeList}
        ${errors.store_id ? `<span class="jb-error">${esc(errors.store_id)}</span>` : ''}
        <div class="jb-2col">${coField('pickup_first_name', 'First name', values, errors, { extra: 'autocomplete="given-name"' })}${coField('pickup_last_name', 'Last name', values, errors, { extra: 'autocomplete="family-name"' })}</div>
        ${coField('pickup_phone', 'Mobile phone', values, errors, { type: 'tel', extra: 'autocomplete="tel"' })}
        <p class="jb-fine">We'll SMS and email you when your order is ready to collect.</p>
      </div>
      <div class="jb-panel jb-panel-collection_point"><h2>Collection point</h2>
        <div class="jb-finder"><button type="submit" name="use_location_point" value="1" class="jb-btn jb-btn-black jb-btn-small">Use my location</button><span class="jb-or-inline">or</span>
          <div class="jb-field"><label for="point_country">Country/region</label><select id="point_country" name="point_country"><option value="AU" selected>Australia</option></select></div>
          <div class="jb-field"><label for="point_query">Address, suburb or postcode</label><input id="point_query" name="point_query" type="text" value="${esc(pointQuery ?? '')}"></div>
          <button type="submit" name="find_points" value="1" class="jb-btn jb-btn-grey jb-btn-small">Search</button></div>
        ${pointQuery !== null ? `<div class="jb-error-box">No collection points available with your item<br><span class="jb-fine">Pre-order items ship from our warehouse. Choose Delivery or Click &amp; Collect instead.</span></div>` : ''}
        ${errors.collection_point ? `<span class="jb-error">${esc(errors.collection_point)}</span>` : ''}
      </div>
    </section>
    <div class="jb-co-actions"><a href="${urls.cart}">&lsaquo; Return to cart</a><button class="jb-btn" type="submit">Continue to shipping</button></div>
  </form>
  ${orderSummary({ t, discountError, formId: 'jb-information-form', code: values.discount_code })}
</div>`
}

// GTA VI can be collected from 12 Nov to preload (PDP notice); other pre-orders are ready on release day.
function collectNote(t) {
  const items = t.lines.map(l => l.product)
  const p = items.find(i => i.preloadFrom) ?? items.find(i => i.cta === 'Pre-order')
  return p ? `Pre-order: ready to collect from ${p.preloadFrom ?? p.releaseLong}.` : 'Usually ready to collect within 24 hours.'
}

function coSummaryRows(rows) {
  return `<div class="jb-co-review">${rows.map(([k, v, href]) => `<div class="jb-co-review-row"><span class="jb-co-review-key">${k}</span><span class="jb-co-review-val">${v}</span>${href ? `<a href="${href}">Change</a>` : ''}</div>`).join('')}</div>`
}
export const formatAddress = (a) => [a.first_name + ' ' + a.last_name, a.company, a.line1, a.line2, `${a.city} ${a.state} ${a.postal_code}`, 'Australia'].filter(Boolean).map(esc).join(', ')

export function shippingPage({ urls, t, info, values = {}, errors = {}, discountError }) {
  const method = values.shipping_method || 'standard'
  const note = dispatchNote(t)
  return `<div class="jb-co">
  <form method="post" action="${urls.shipping}" class="jb-co-form" novalidate id="jb-shipping-form">
    ${errorBanner(errors)}
    ${coSummaryRows([['Contact', esc(info.email), urls.information], ['Ship to', formatAddress(info.address), urls.information]])}
    <section class="jb-co-section"><h2>Shipping method</h2>
      ${note ? `<p class="jb-preorder-note">&#9432; ${esc(note)}</p>` : ''}
      <div class="jb-ship-methods">
        ${Object.values(SHIPPING_METHODS).map(m => `<label class="jb-ship-method ${method === m.id ? 'is-selected' : ''}" for="shipping_method_${m.id}"><input type="radio" id="shipping_method_${m.id}" name="shipping_method" value="${m.id}" ${method === m.id ? 'checked' : ''}><span><b>${esc(m.name)}</b> (${esc(m.eta)})<br><span class="jb-fine">${esc(m.carrier)}</span></span><span class="jb-ship-price">${aud(m.price)}</span></label>`).join('')}
        <label class="jb-ship-method is-disabled" for="shipping_method_${COURIER_METHOD.id}"><input type="radio" id="shipping_method_${COURIER_METHOD.id}" name="shipping_method" value="${COURIER_METHOD.id}" disabled><span><b>${esc(COURIER_METHOD.name)}</b> (${esc(COURIER_METHOD.eta)})<br><span class="jb-fine">${esc(COURIER_METHOD.note)}</span></span><span class="jb-ship-price">—</span></label>
      </div>
      ${errors.shipping_method ? `<span class="jb-error">${esc(errors.shipping_method)}</span>` : ''}
    </section>
    <div class="jb-co-actions"><a href="${urls.information}">&lsaquo; Return to information</a><button class="jb-btn" type="submit">Continue to payment</button></div>
  </form>
  ${orderSummary({ t, shipping: SHIPPING_METHODS[method], discountError, formId: 'jb-shipping-form', code: values.discount_code })}
</div>`
}

// JB help: pre-orders are "highlighted during the checkout process" and leave the Victorian warehouse just before
// release; the GTA VI listing itself says "Delivery and pickup starts November 12".
function dispatchNote(t) {
  const items = t.lines.map(l => l.product)
  const game = items.find(p => p.preloadFrom)
  if (game) return `Pre-order: delivery and pickup starts ${game.preloadFrom}, so you can download and install ${game.title} before release on ${game.releaseLong}.`
  return items.some(p => p.cta === 'Pre-order') ? 'Pre-order items are dispatched from our Victorian warehouse just before release day.' : ''
}

export function paymentPage({ urls, t, info, shipping, pickupStore, values = {}, errors = {}, discountError }) {
  const pm = values.payment_method || 'card'
  const billing = values.billing || 'same'
  const pickup = !!pickupStore
  const methodRow = pickup
    ? ['Pickup', `${esc(pickupStore.name)} — Free`, urls.information]
    : ['Method', `${esc(shipping.name)} (${esc(shipping.eta)}) · ${aud(shipping.price)}`, urls.shipping]
  const pmOption = (id, label, panel) => `<div class="jb-pay-option ${pm === id ? 'is-selected' : ''}"><label class="jb-pay-head" for="payment_method_${id}"><input type="radio" id="payment_method_${id}" name="payment_method" value="${id}" ${pm === id ? 'checked' : ''}> ${label}</label><div class="jb-pay-panel">${panel}</div></div>`
  const redirectNote = (name) => `<p class="jb-fine">After clicking “Pay now”, you will be redirected to ${name} to complete your purchase securely.</p>`
  return `<div class="jb-co">
  <form method="post" action="${urls.payment}" class="jb-co-form" novalidate id="jb-payment-form">
    ${errorBanner(errors)}
    ${coSummaryRows([['Contact', esc(info.email), urls.information], pickup ? ['Pick up at', esc(pickupStore.address), urls.information] : ['Ship to', formatAddress(info.address), urls.information], methodRow])}
    <section class="jb-co-section"><h2>Payment</h2><p class="jb-fine">All transactions are secure and encrypted.</p>
      <div class="jb-pay-options">
        ${pmOption('card', `Credit card <span class="jb-card-brands"><span>VISA</span><span>Mastercard</span><span>AMEX</span><span>UnionPay</span></span>`, `
          ${coField('card_number', 'Card number', values, errors, { extra: 'autocomplete="cc-number" inputmode="numeric"' })}
          <div class="jb-2col">${coField('card_expiry', 'Expiration date (MM / YY)', values, errors, { extra: 'autocomplete="cc-exp" placeholder="MM / YY"' })}${coField('card_cvv', 'Security code', values, errors, { extra: 'autocomplete="cc-csc" inputmode="numeric" maxlength="4"' })}</div>
          ${coField('card_name', 'Name on card', values, errors, { extra: 'autocomplete="cc-name"' })}`)}
        ${pmOption('paypal', 'PayPal <span class="jb-fine">(incl. Pay in 4)</span>', redirectNote('PayPal'))}
        ${pmOption('afterpay', 'Afterpay', redirectNote('Afterpay') + '<p class="jb-fine">4 interest-free payments of ' + aud(t.total / 4) + '.</p>')}
        ${pmOption('zip', 'Zip', redirectNote('Zip'))}
        ${pmOption('latitude', 'Latitude Interest Free', redirectNote('Latitude'))}
        ${pmOption('giftcard', 'JB Hi-Fi Gift Card', `<div class="jb-2col">${coField('gift_card_number', 'Gift card number', values, errors, { extra: 'autocomplete="off" inputmode="numeric"' })}${coField('gift_card_pin', 'PIN', values, errors, { extra: 'autocomplete="off" inputmode="numeric"' })}</div>`)}
      </div>
      <p class="jb-fine">Buy now, pay later options such as Afterpay, Zip and PayPal cannot be used together when checking out.</p>
    </section>
    <section class="jb-co-section"><h2>Billing address</h2>
      ${pickup ? `<p class="jb-fine">Enter the address that matches your card or payment method.</p><div class="jb-panel-billing-always">${addressFields('billing', values, errors)}</div>`
      : `<div class="jb-methods jb-billing-choice">
        <label class="jb-method ${billing === 'same' ? 'is-selected' : ''}" for="billing_same"><input type="radio" id="billing_same" name="billing" value="same" ${billing === 'same' ? 'checked' : ''}><span>Same as shipping address</span></label>
        <label class="jb-method ${billing === 'different' ? 'is-selected' : ''}" for="billing_different"><input type="radio" id="billing_different" name="billing" value="different" ${billing === 'different' ? 'checked' : ''}><span>Use a different billing address</span></label>
      </div>
      <div class="jb-panel jb-panel-billing">${addressFields('billing', values, errors)}</div>`}
    </section>
    <p class="jb-fine">Pre-orders are paid in full when placed. Pre-order price guarantee: if the price drops before release day, we'll refund you the difference shortly after release.</p>
    <div class="jb-co-actions"><a href="${pickup ? urls.information : urls.shipping}">&lsaquo; Return to ${pickup ? 'information' : 'shipping'}</a><button class="jb-btn" type="submit" name="pay" value="1">Pay now</button></div>
  </form>
  ${orderSummary({ t, shipping, pickup, discountError, formId: 'jb-payment-form', code: values.discount_code })}
</div>`
}

const PAY_NAMES = { paypal: 'PayPal', afterpay: 'Afterpay', zip: 'Zip', latitude: 'Latitude Interest Free' }

// ASSUMPTION: not observed. Shopify's thank-you page ("Thank you, <name>!" / "Your order is confirmed") with JB's
// email + SMS updates from the help pages.
export function thankYouPage({ base, order }) {
  const f = order.fulfillment, pickup = f.method === 'pickup', pay = order.payment
  const payText = `${pay.method === 'card' ? `${esc(pay.brand)} ending with ${esc(pay.last4)}` : esc(PAY_NAMES[pay.method] ?? pay.method)} — ${aud(order.totals.total)}`
  const preload = order.meta.preload_from
  return `<div class="jb-co jb-thanks">
  <div class="jb-co-form">
    <div class="jb-thanks-head"><span class="jb-check-ring" aria-hidden="true">&#10003;</span><div><p class="jb-fine">Order <span data-order-number>#${esc(order.order_number)}</span></p><h1>Thank you, ${esc(order.customer.first_name)}!</h1></div></div>
    <section class="jb-co-section"><h2>Your order is confirmed</h2>
      <p>You'll receive a confirmation email with your order number shortly.</p>
      <p class="jb-fine">Your pre-order has been paid in full. Pre-order price guarantee: if the price drops before release day, we'll refund you the difference shortly after release.</p>
    </section>
    <section class="jb-co-section"><h2>Order updates</h2>
      ${pickup
        ? `<p>We'll send you an email and SMS when your order is ready to collect from <b>${esc(f.store_location)}</b>${f.ready_from ? ` (from ${esc(f.ready_from)})` : ''}. Show the order number or barcode from that email or SMS, with photo ID, when you collect.</p>`
        : `<p>You'll get shipping and delivery updates by email and SMS.${preload ? ` Delivery and pickup starts ${esc(preload)}, so you can preload before release on ${esc(order.meta.release)}.` : ''}</p>`}
    </section>
    <section class="jb-co-section"><h2>Customer information</h2>
      <div class="jb-2col">
        <div><h3>Contact information</h3><p>${esc(order.customer.email)}<br>${esc(order.customer.phone)}</p></div>
        <div><h3>Payment method</h3><p>${payText}</p></div>
        <div><h3>${pickup ? 'Pickup location' : 'Shipping address'}</h3><p>${pickup ? `${esc(f.store_location)}<br>${esc(f.store_address)}` : formatAddress(order.shipping_address)}</p></div>
        <div><h3>Billing address</h3><p>${formatAddress(order.billing_address)}</p></div>
        <div><h3>${pickup ? 'Pickup method' : 'Shipping method'}</h3><p>${pickup ? 'Click &amp; Collect — Free' : `${esc(f.option_name)} (${esc(f.eta)}) · ${aud(order.totals.shipping)}`}</p></div>
      </div>
    </section>
    <div class="jb-co-actions"><span class="jb-fine">Need help? <a href="#">Contact us</a></span><a class="jb-btn" href="${base}/">Continue shopping</a></div>
  </div>
  <aside class="jb-co-summary" aria-label="Order summary">
    ${order.items.map(it => { const p = byId(it.sku); return `<div class="jb-co-item"><span class="jb-co-thumb"><img src="${p?.art ?? '/static/art/game-generic.svg'}" alt=""><span class="jb-qty-badge">${it.qty}</span></span><span class="jb-co-item-title">${esc(it.title)}${p ? `<small>${esc(p.subtitle)}</small>` : ''}</span><span>${aud(it.unit_price * it.qty)}</span></div>` }).join('')}
    <div class="jb-row"><span>Subtotal</span><span>${aud(order.totals.subtotal)}</span></div>
    <div class="jb-row"><span>Shipping</span><span>${order.totals.shipping ? aud(order.totals.shipping) : 'Free'}</span></div>
    <div class="jb-row jb-total"><span>Total</span><span><small>AUD</small> ${aud(order.totals.total)}</span></div>
    <p class="jb-fine">Includes GST. Paid in full.</p>
  </aside>
</div>`
}
