import { esc, money, disclaimer } from '../../lib/html.js'
import {
  byId, productPath, productHref, facets, countdown, SORTS, DELIVERY_METHODS, INTERNATIONAL_DELIVERY, PDP_DELIVERY_ORDER, CHECKOUT_DELIVERY_ORDER,
  COLLECT_STORES, TITLES, MAX_QTY, RELEASE_TEXT, RELEASE_SHORT, DISPATCH_TEXT, PREORDER_NOTICE_1, PREORDER_NOTICE_2, LEGAL_TEXT,
} from './data.js'

const NAME = 'GAME'
const gbp = (n) => money(n, 'GBP')
const NAV = ['Consoles & Video Games', 'Digital Gift Cards', 'PC Gaming', 'Tech', 'LEGO', 'Toys & Games', 'Trading Cards']
const PROMOS = [
  'FC27 - Out now! Get in the game',
  'Coming Soon - Shop upcoming releases on games and more',
  'Spread the cost of gifting with Frasers Plus: Buy now, Pay in 3, interest free. Representative APR 29.9% (Variable)',
]
// "Consoles & Video Games" mega-menu. The research names the Trending column items and the
// "Just Landed & Up Next" / PlayStation columns. ASSUMPTION: the other column items, and every
// link target, are searches here; "GTA VI Pre-Order" (href not captured) opens the GTA VI results.
const MEGA = [
  ['Trending', [['GTA VI Pre-Order', 'grand theft auto vi'], ['EA Sports FC 27'], ['Call of Duty Modern Warfare 4 - Pre-Order'], ['LEGO Batman']]],
  ['Just Landed & Up Next', [['Coming Soon'], ['Just Landed']]],
  ['PlayStation', [['PlayStation Consoles'], ['PlayStation Games'], ['PlayStation Accessories']]],
  ['Xbox', [['Xbox Consoles'], ['Xbox Games'], ['Xbox Accessories']]],
]

// Inline icons only (no external assets).
const ICON = {
  search: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="10" cy="10" r="7" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M15.5 15.5 21 21" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
  pin: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M12 22s7-7.1 7-12a7 7 0 0 0-14 0c0 4.9 7 12 7 12z" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="10" r="2.5" fill="currentColor"/></svg>',
  user: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
  heart: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M12 21s-8-5.3-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.7-8 11-8 11z" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
  bag: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M5 8h14l-1 13H6L5 8z" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M9 8V6a3 3 0 0 1 6 0v2" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
  share: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M10 14 20 4M20 4h-6M20 4v6M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  lock: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
  info: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 11v6M12 7v1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  bolt: '<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
  tag: '<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path d="M3 12V3h9l9 9-9 9-9-9z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="8" cy="8" r="1.5" fill="currentColor"/></svg>',
  userBig: '<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
}

const searchHref = (base, q) => `${base}/searchresults?descriptionfilter=${encodeURIComponent(q)}`

// ---- chrome ----
function minibag(base, t, closeHref) {
  return `<div class="gu-flyout" id="minibag" role="dialog" aria-label="My Bag">
  <div class="gu-flyout-head"><b>My Bag</b>${closeHref ? `<a class="gu-modal-close" href="${esc(closeHref)}" aria-label="Close">&times;</a>` : ''}</div>
  ${t.lines.map(l => `<div class="gu-mini-line">
    <img src="${l.product.art}" alt="">
    <div><div class="gu-brand">${esc(l.product.brand)}</div><a href="${productHref(base, l.product)}">${esc(l.product.title)}</a>
      <div class="gu-fine">Colour: ${esc(l.product.swatch)}<br>Size: One Size</div>
      <form method="post" action="${base}/cart/update" class="gu-line-actions"><input type="hidden" name="line" value="${l.line}">
        <span class="gu-qty gu-qty-sm"><button type="submit" name="action" value="dec" aria-label="Reduce quantity">&minus;</button><span>${l.qty}</span><button type="submit" name="action" value="inc" aria-label="Increase quantity">+</button></span>
        <span>Price: <b>${gbp(l.product.price)}</b></span><span>Total: <b>${gbp(l.product.price * l.qty)}</b></span>
        <button type="submit" name="action" value="remove" class="gu-link-btn">Remove</button><button type="submit" name="action" value="wishlist" class="gu-link-btn">Move to wish list</button>
      </form></div></div>`).join('')}
  <p class="gu-hurry">Hurry! Items in bag aren't reserved! Don't miss out and checkout now!</p>
  <div class="gu-row"><span>Discount:</span><span>${gbp(t.discount)}</span></div>
  <div class="gu-row gu-total"><span>Total:</span><span>${gbp(t.total)}</span></div>
  <div class="gu-flyout-btns"><a class="gu-btn gu-btn-black" href="${base}/cart">View Bag</a><form method="post" action="${base}/checkout/start"><button class="gu-btn" type="submit">Checkout</button></form></div>
</div>`
}

function fullHeader({ base, t, user, q, flyoutOpen, closeHref }) {
  return `<header class="gu-header">
  <div class="gu-row1">
    <a class="gu-logo" href="${base}/" aria-label="GAME home">GAME</a>
    <form class="gu-search" action="${base}/searchresults" method="get" role="search">
      <input type="search" name="descriptionfilter" value="${esc(q)}" placeholder="Search product or brand" aria-label="Search product or brand">
      <button type="submit" aria-label="Search">${ICON.search}</button>
    </form>
    <nav class="gu-icons" aria-label="Account and bag">
      <a href="${base}/stores">${ICON.pin}<span>Stores</span></a>
      ${user ? `<a href="${base}/account">${ICON.user}<span>Hi, ${esc(user.first_name || 'there')}</span></a>` : `<a href="${base}/login">${ICON.user}<span>Sign In</span></a>`}
      <a href="${base}/wishlist">${ICON.heart}<span>My Wish List</span></a>
      <div class="gu-bag${flyoutOpen ? ' is-open' : ''}">
        <a href="${base}/cart" class="gu-bag-link" aria-label="My Bag, ${t.count} item${t.count === 1 ? '' : 's'}">${ICON.bag}<span>My Bag</span><span class="gu-count">${t.count}</span></a>
        ${t.lines.length ? minibag(base, t, flyoutOpen ? closeHref : '') : ''}
      </div>
    </nav>
  </div>
  <nav class="gu-nav" aria-label="Shop by category">${NAV.map((n, i) => i === 0
    ? `<div class="gu-mega-item"><a href="${searchHref(base, n)}">${esc(n)}</a><div class="gu-mega">${MEGA.map(([h, links]) => `<div><h4>${esc(h)}</h4>${links.map(([label, q = label]) => `<a href="${searchHref(base, q)}">${esc(label)}</a>`).join('')}</div>`).join('')}</div></div>`
    : `<a href="${searchHref(base, n)}">${esc(n)}</a>`).join('')}</nav>
  <div class="gu-promo" id="gu-promo"><a href="${base}/frasersplus">${esc(PROMOS[0])}</a></div>
</header>`
}

function slimHeader({ base, mode }) {
  return `<header class="gu-header gu-header-slim"><div class="gu-row1 gu-row1-slim"><a class="gu-logo" href="${base}/" aria-label="GAME home">GAME</a>${mode === 'checkout' ? `<span class="gu-secure">${ICON.lock} Secure checkout</span>` : ''}</div></header>`
}

function cookieBanner(base, back) {
  return `<div class="gu-cookies" role="region" aria-label="Our cookies">
  <div><b>Our cookies</b><p>Our website uses cookies and similar technologies to personalise the ads that are shown to you and to help you get the best experience on our site. <a href="#">Cookie policy</a></p></div>
  <form method="post" action="${base}/cookies"><input type="hidden" name="back" value="${esc(back)}">
    <button type="submit" name="choice" value="manage" class="gu-link-btn">Manage cookies</button>
    <button type="submit" name="choice" value="reject" class="gu-btn gu-btn-black">Reject all</button>
    <button type="submit" name="choice" value="allow" class="gu-btn">Allow all</button>
  </form></div>`
}

function footer(base, mode) {
  // ASSUMPTION: like the minimal auth.game.co.uk page, the sign-in and checkout steps carry
  // only a slim legal footer (no newsletter or link columns).
  if (mode !== 'full') return `<footer class="gu-footer gu-footer-slim"><p class="gu-copy">&copy; 2026 Frasers Group Trading Limited &middot; <a href="#">Terms &amp; Conditions</a> &middot; <a href="#">Privacy Policy</a> &middot; <a href="#">Cookie Policy</a></p>${disclaimer(NAME)}</footer>`
  const col = (h, links) => `<div><h4>${h}</h4>${links.map(l => `<a href="#">${l}</a>`).join('')}</div>`
  return `<footer class="gu-footer">
  <div class="gu-newsletter"><h4>Sign up to our newsletter</h4><form onsubmit="return false"><label for="nl-email" class="visually-hidden">Email address</label><input id="nl-email" type="email" placeholder="Enter your email address"><button type="button" class="gu-btn gu-btn-black">Sign up</button></form></div>
  <div class="gu-footer-cols">
    ${col('Customer services', ['Help Home', 'Contact Us', 'Delivery &amp; Collection', 'Returns &amp; Cancellations', 'Track order'])}
    ${col('Information', ['Terms &amp; Conditions', 'Privacy Policy', 'Cookie Policy', 'Frasers Plus', 'Modern Slavery Statement'])}
    ${col('About', ['About GAME', 'Careers', 'Store Finder', 'Affiliates', 'Corporate'])}
    ${col('Stay connected', ['Facebook', 'Instagram', 'X', 'YouTube', 'TikTok'])}
  </div>
  <div class="gu-ways"><span>Ways to pay</span>${['VISA', 'VISA Debit', 'Mastercard', 'Maestro', 'Apple Pay', 'PayPal', 'Gift Cards', 'Frasers+'].map(w => `<span class="gu-paylogo">${w}</span>`).join('')}</div>
  <div class="gu-currency">&pound; GBP <a href="#">Edit</a></div>
  <p class="gu-copy">&copy; 2026 Frasers Group Trading Limited</p>
  <p class="gu-fca">*Frasers Plus is a credit product. Buy now, Pay in 3, interest free. Representative APR 29.9% (Variable). Credit subject to status. Terms apply. 18+, UK residents only. Frasers Group Trading Limited acts as a credit broker and not a lender.</p>
  ${disclaimer(NAME)}
</footer>`
}

export function layout({ base, title, body, t, user = null, mode = 'full', cookieChoice = null, flyoutOpen = false, closeHref = '', q = '', back = '/' }) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<link rel="stylesheet" href="${base}/static/style.css"></head>
<body class="gu-mode-${esc(mode)}">
${mode === 'full' ? fullHeader({ base, t, user, q, flyoutOpen, closeHref }) : slimHeader({ base, mode })}
<main class="gu-main">${body}</main>
${footer(base, mode)}
${cookieChoice ? '' : cookieBanner(base, back)}
<script>
(function(){
  var promo=document.querySelector('#gu-promo a');if(promo){var msgs=${JSON.stringify(PROMOS)},i=0;setInterval(function(){i=(i+1)%msgs.length;promo.textContent=msgs[i]},4000)}
  document.querySelectorAll('.gu-qty-btn').forEach(function(b){b.addEventListener('click',function(){var inp=b.parentNode.querySelector('input');var v=(parseInt(inp.value,10)||1)+parseInt(b.dataset.step,10);inp.value=Math.min(${MAX_QTY},Math.max(1,v))})});
})();
</script>
</body></html>`
}

// ---- browse ----
function tile(base, p, back) {
  return `<article class="gu-tile">
  <div class="gu-badges">${p.badges.map(b => `<span class="gu-flag">${esc(b)}</span>`).join('')}</div>
  <form method="post" action="${base}/wishlist/add" class="gu-tile-heart"><input type="hidden" name="pid" value="${p.id}"><input type="hidden" name="back" value="${esc(back)}"><button type="submit" aria-label="Add ${esc(p.title)} to wish list" title="Add to wish list">${ICON.heart}</button></form>
  <a class="gu-tile-img" href="${productHref(base, p)}"><img src="${p.art}" alt="${esc(p.artAlt)}"></a>
  <div class="gu-brand">${esc(p.brand)}</div>
  <a class="gu-tile-name" href="${productHref(base, p)}">${esc(p.title)}</a>
  <div class="gu-tile-price">${gbp(p.price)}${p.ticketPrice > p.price ? ` <s>${gbp(p.ticketPrice)}</s>` : ''}</div>
</article>`
}

export function homePage({ base, products }) {
  const circles = ['Coming Soon', 'XBOX', 'PlayStation', 'Nintendo', 'Pokemon', 'LEGO', 'Toys', 'PC']
  const gta = products.find(p => p.kind === 'game')
  return `<section class="gu-circles">${circles.map(c => `<a href="${searchHref(base, c)}"><span class="gu-circle">${esc(c.slice(0, 2).toUpperCase())}</span><span>${esc(c)}</span></a>`).join('')}</section>
<section class="gu-hero"><div><p class="gu-eyebrow">OUT NOW</p><h1>FC27</h1><p>Get in the game. The new season starts here.</p><a class="gu-btn gu-btn-black" href="${searchHref(base, 'FC27')}">Shop Now</a></div><div class="gu-hero-art" aria-hidden="true">FC<span>27</span></div></section>
<section class="gu-gifts"><h2>Gifts for Gamers</h2><p>Find the perfect present for every player.</p><div class="gu-gift-btns">${['Games', 'PS5', 'XBOX', 'Switch'].map(g => `<a class="gu-btn gu-btn-black" href="${searchHref(base, g)}">${g}</a>`).join('')}</div></section>
<section class="gu-fplus"><b>FRASERSPLUS</b><span class="gu-fplus-big">SPREAD THE COST OF GIFTING*</span><span>Buy now. Pay later. Earn rewards. Representative APR: 29.9% (variable). Credit subject to status. Terms apply.</span><a class="gu-btn" href="${base}/frasersplus">Find out more</a></section>
<section class="gu-trending"><h2>Trending</h2><div class="gu-grid">${[gta, ...products.filter(p => p !== gta)].map(p => tile(base, p, `${base}/`)).join('')}</div></section>`
}

export function searchPage({ base, q, products, filters = {}, sort = 'popular', hideFilters = false }) {
  const f = facets(products)
  // Every toolbar/facet link keeps the other choices (query, filters, sort, hidden rail).
  const url = (over = {}) => {
    const params = { descriptionfilter: q, platform: filters.platform, category: filters.category, sort: sort === 'popular' ? null : sort, hidefilters: hideFilters ? '1' : null, ...over }
    return `${base}/searchresults?${Object.entries(params).filter(([, v]) => v).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')}`
  }
  const here = url()
  const facetLink = (key, val, n) => `<a class="gu-facet${filters[key] === val ? ' is-active' : ''}" href="${esc(url({ [key]: val }))}">${esc(val)} <span>(${n})</span></a>`
  const active = Object.entries(filters).filter(([, v]) => v)
  return `<div class="gu-search-page">
  <h1>Search Results</h1>
  <p class="gu-found">We found ${products.length} product${products.length === 1 ? '' : 's'} for ${esc(q)}</p>
  ${active.length ? `<p class="gu-fine">Filtered by ${active.map(([k, v]) => `${esc(k)}: <b>${esc(v)}</b>`).join(', ')} &middot; <a href="${esc(url({ platform: null, category: null }))}">Clear filters</a></p>` : ''}
  <div class="gu-toolbar"><a class="gu-link-btn" href="${esc(url({ hidefilters: hideFilters ? null : '1' }))}">${hideFilters ? 'Show Filters' : 'Hide Filters'}</a><span>${products.length} Products</span>
    <details class="gu-sort"><summary>Sort By</summary><ul>${SORTS.map(s => `<li><a class="gu-sort-opt${s.key === sort ? ' is-active' : ''}" href="${esc(url({ sort: s.key === 'popular' ? null : s.key }))}"${s.key === sort ? ' aria-current="true"' : ''}>${esc(s.label)}</a></li>`).join('')}</ul></details></div>
  <div class="gu-search-body${hideFilters ? ' gu-no-facets' : ''}">
    <aside class="gu-facets"${hideFilters ? ' hidden' : ''}>
      <details open><summary>Platform</summary>${Object.entries(f.platform).map(([k, n]) => facetLink('platform', k, n)).join('') || '<span class="gu-fine">None</span>'}</details>
      <details open><summary>Category</summary>${Object.entries(f.category).map(([k, n]) => facetLink('category', k, n)).join('') || '<span class="gu-fine">None</span>'}</details>
      <details open><summary>Style</summary>${Object.entries(f.style).map(([k, n]) => `<span class="gu-facet">${esc(k)} <span>(${n})</span></span>`).join('') || '<span class="gu-fine">None</span>'}</details>
      <details open><summary>Price</summary>${f.price.map(b => `<span class="gu-facet">${esc(b.label)} <span>(${b.n})</span></span>`).join('') || '<span class="gu-fine">None</span>'}</details>
    </aside>
    <div class="gu-grid">${products.length ? products.map(p => tile(base, p, here)).join('') : `<p class="gu-empty">Sorry, we couldn't find any products matching "${esc(q)}". Try checking your spelling or using a different search term.</p>`}</div>
  </div>
  <div class="gu-fplus-banner"><b>FRASERSPLUS</b> Buy now. Pay later. Earn rewards. <small>Representative APR: 29.9% (variable). Credit subject to status. Terms apply.</small></div>
</div>`
}

export function productPage({ base, p, modal = null, qty = 1, wished = false }) {
  const path = productPath(base, p)
  const isGame = p.kind === 'game'
  const hidden = (n, v) => `<input type="hidden" name="${n}" value="${esc(v)}">`
  // The real flow: "Pre-order now" opens a Pre-order modal, "Add to bag" then opens the PEGI-18
  // Age Verification modal, and only "I'm Old Enough" actually adds. Each modal is a server-rendered
  // state (?preorder=1 / ?agecheck=1) so the whole sequence works without JavaScript.
  const addForm = (label, cls) => p.pegi
    ? `<form method="get" action="${path}">${hidden('agecheck', '1')}${hidden('qty', qty)}<button class="${cls}" type="submit">${label}</button></form>`
    : `<form method="post" action="${base}/cart/add">${hidden('pid', p.id)}${hidden('qty', qty)}<button class="${cls}" type="submit">${label}</button></form>`
  let modalHtml = ''
  if (modal === 'preorder') {
    modalHtml = `<div class="gu-modal-backdrop"><div class="gu-modal" role="dialog" aria-labelledby="modal-title">
  <div class="gu-modal-head"><h2 id="modal-title">Pre-order</h2><a class="gu-modal-close" href="${path}" aria-label="Close">&times;</a></div>
  <div class="gu-modal-body"><img src="${p.art}" alt=""><div><p>${PREORDER_NOTICE_1}</p><p><b>${RELEASE_TEXT}</b></p><p>${PREORDER_NOTICE_2}</p></div></div>
  <div class="gu-modal-foot"><a class="gu-btn gu-btn-black" href="${path}">Cancel</a>${addForm('Add to bag', 'gu-btn')}</div>
</div></div>`
  } else if (modal === 'age') {
    modalHtml = `<div class="gu-modal-backdrop"><div class="gu-modal gu-modal-sm" role="dialog" aria-labelledby="modal-title">
  <div class="gu-modal-head"><h2 id="modal-title">Age Verification</h2><a class="gu-modal-close" href="${path}" aria-label="Close">&times;</a></div>
  <div class="gu-modal-body"><p>You must be 18 years old or older to purchase this item.</p></div>
  <div class="gu-modal-foot gu-modal-foot-stack"><form method="post" action="${base}/cart/add">${hidden('pid', p.id)}${hidden('qty', qty)}${hidden('age_confirmed', '1')}<button class="gu-btn gu-btn-block" type="submit">I'm Old Enough</button></form><a class="gu-link" href="${path}">Cancel</a></div>
</div></div>`
  }
  // Primary CTA: pre-order items open the Pre-order modal, 18-rated stock items the age gate, anything else adds directly.
  const cta = p.preorder
    ? { method: 'get', action: path, hidden: hidden('preorder', '1'), label: 'Pre-order now' }
    : p.pegi ? { method: 'get', action: path, hidden: hidden('agecheck', '1'), label: 'Add to bag' }
      : { method: 'post', action: `${base}/cart/add`, hidden: hidden('pid', p.id), label: 'Add to bag' }
  const crumbs = [`<a href="${base}/">Home</a>`, ...p.crumbs.map(c => `<a href="${searchHref(base, c)}">${esc(c)}</a>`), `<span>${esc(p.brand)} ${esc(p.title)}</span>`]
  const deliveryList = PDP_DELIVERY_ORDER.map(id => DELIVERY_METHODS[id]).map(m => `<li><b>${esc(m.name)}</b><span>${esc(m.detail)}</span><b>${gbp(m.price)}</b></li>`).join('')
  const collectLine = p.preorder ? '' : `<li><b>${esc(DELIVERY_METHODS.collect.name)}</b><span>Delivered to your chosen store within 3 - 7 days.</span><b>${gbp(DELIVERY_METHODS.collect.price)}</b></li>`
  return `${modalHtml}
<nav class="gu-crumbs" aria-label="Breadcrumb">${crumbs.join(' / ')}</nav>
<div class="gu-pdp">
  <div class="gu-gallery">
    <div class="gu-gallery-main"><div class="gu-thumbs">${Array.from({ length: 6 }, () => `<img src="${p.art}" alt="">`).join('')}</div><div class="gu-hero-wrap"><span class="gu-art"><img class="gu-hero-img" src="${p.art}" alt="${esc(p.artAlt)}">${p.pegi ? `<span class="gu-pegi" title="PEGI ${p.pegi}">${p.pegi}</span>` : ''}</span></div></div>
  </div>
  <div class="gu-buybox">
    <div class="gu-badges gu-badges-buy">${p.badges.map(b => `<span class="gu-flag">${esc(b)}</span>`).join('')}</div>
    <div class="gu-brand">${esc(p.brand)}</div>
    <div class="gu-title-row"><h1>${esc(p.title)}</h1>
      <form method="post" action="${base}/wishlist/add" class="gu-heart-form"><input type="hidden" name="pid" value="${p.id}"><input type="hidden" name="back" value="${esc(path)}"><button type="submit" aria-label="Add to wish list" title="Add to wish list">${ICON.heart}</button></form>
      <a class="gu-share" href="${path}" title="Copy link" aria-label="Copy link">${ICON.share}</a></div>
    ${wished ? '<p class="gu-notice">Added to your wish list. Wish lists are held for 30 days; sign in to sync yours to any device.</p>' : ''}
    <div class="gu-price">${gbp(p.price)}${p.ticketPrice > p.price ? ` <s>${gbp(p.ticketPrice)}</s>` : ''}</div>
    <form method="${cta.method}" action="${cta.action}" class="gu-buy-form" id="gu-buy-form">
      <div class="gu-format"><span class="gu-label">Format:</span> <span class="gu-swatch is-selected" aria-current="true">${esc(p.swatch)}</span></div>
      <div class="gu-qty"><button type="button" class="gu-qty-btn" data-step="-1" aria-label="Reduce quantity">&minus;</button><label for="qty" class="visually-hidden">Quantity</label><input id="qty" name="qty" type="number" min="1" max="${MAX_QTY}" value="${qty}" inputmode="numeric"><button type="button" class="gu-qty-btn" data-step="1" aria-label="Increase quantity">+</button></div>
      ${cta.hidden}
      <button class="gu-btn gu-btn-block gu-cta" type="submit" ${modal ? 'disabled' : ''}>${modal ? 'Adding...' : cta.label}</button>
    </form>
    ${p.preorder ? `<div class="gu-countdown"><b>Release Date: ${RELEASE_SHORT}</b><span>${countdown() ?? 'Out now'}</span></div>` : ''}
    ${p.pegi ? `<p class="gu-pegi-line"><b>Pegi Rating:</b> Suitable for people aged 18 and over. <a href="#">Read More...</a></p>` : ''}
  </div>
  <div class="gu-pdp-info">
    <details class="gu-acc" open><summary>Description</summary><div class="gu-acc-body">
      ${p.preorder ? `<p class="gu-preorder-info">${ICON.info}<span>${PREORDER_NOTICE_1} <b>${RELEASE_TEXT}</b>. ${PREORDER_NOTICE_2}</span></p>` : ''}
      <p>Product code: ${esc(p.id)}</p>
      <p><b>${esc(p.title)}</b></p>
      ${p.description.map(d => `<p>${esc(d)}</p>`).join('')}
      ${isGame ? `<p class="gu-legal">${esc(LEGAL_TEXT)}</p>` : ''}
    </div></details>
    <details class="gu-acc"><summary>Delivery &amp; Returns</summary><div class="gu-acc-body">
      <ul class="gu-delivery-list">${deliveryList}<li><b>${INTERNATIONAL_DELIVERY.name}</b><span>${INTERNATIONAL_DELIVERY.detail}</span><b></b></li>${collectLine}</ul>
      ${p.preorder ? `<p class="gu-fine">Click &amp; Collect is not available for pre-order items. Pre-orders are dispatched via Express Delivery the day before the launch date.</p>` : ''}
      <p class="gu-fine">Returns: unwanted items can be returned within 28 days of delivery. Sealed software and digital codes cannot be returned once opened or redeemed.</p>
    </div></details>
  </div>
</div>
${modal ? '' : `<div class="gu-sticky" hidden><div class="gu-sticky-inner"><span>${esc(p.title)}</span><b>${gbp(p.price)}</b><button class="gu-btn" type="submit" form="gu-buy-form">${cta.label}</button></div></div>
<script>
// The real PDP shows a sticky "title / price / CTA" bar once the buy button scrolls out of view.
(function(){var bar=document.querySelector('.gu-sticky'),cta=document.querySelector('.gu-cta');if(!bar||!cta||!('IntersectionObserver' in window))return;
  new IntersectionObserver(function(e){bar.hidden=e[0].isIntersecting||e[0].boundingClientRect.top>0}).observe(cta)})();
</script>`}`
}

// ---- bag ----
export function cartPage({ base, t, notice = null }) {
  if (!t.lines.length) {
    return `<div class="gu-cart-empty">${notice ? `<p class="gu-notice">${esc(notice)}</p>` : ''}<h1>Your Bag Is Empty</h1><div class="gu-empty-icon">${ICON.bag}</div><p>We'll hold your bag for 30 days.</p><p>Sign in or register to sync your bag to any device.</p><a class="gu-btn" href="${base}/login?returnurl=cart">Sign In</a></div>`
  }
  const rows = t.lines.map(l => `<div class="gu-line">
  <a href="${productHref(base, l.product)}"><img src="${l.product.art}" alt="${esc(l.product.artAlt)}"></a>
  <div class="gu-line-info">
    <div class="gu-brand">${esc(l.product.brand)}</div>
    <a class="gu-line-name" href="${productHref(base, l.product)}">${esc(l.product.title)}</a>
    <div class="gu-fine">Colour: ${esc(l.product.swatch)}</div><div class="gu-fine">Size: One Size</div>
    <form method="post" action="${base}/cart/update" class="gu-line-actions"><input type="hidden" name="line" value="${l.line}">
      <span class="gu-qty"><button type="submit" name="action" value="dec" aria-label="Reduce quantity">&minus;</button><span>${l.qty}</span><button type="submit" name="action" value="inc" aria-label="Increase quantity">+</button></span>
      <span>Price: <b>${gbp(l.product.price)}</b></span><span>Total: <b>${gbp(l.product.price * l.qty)}</b></span>
      <button type="submit" name="action" value="remove" class="gu-link-btn">Remove</button><button type="submit" name="action" value="wishlist" class="gu-link-btn">Move to wish list</button>
    </form>
    <p class="gu-fine">${l.product.digital ? 'This product is a digital code and will be delivered by email.' : `This product will be delivered by ${esc(l.product.carrier)}, and may arrive separately to other items in your basket.`}</p>
    ${l.product.preorder ? `<p class="gu-fine gu-preorder-info">${ICON.info} Pre-order: available for delivery from ${RELEASE_TEXT}. Your entire order will be held until all items are available.</p>` : ''}
  </div>
</div>`).join('')
  return `<div class="gu-cart">
  <div class="gu-cart-main"><h1>My Bag</h1>${notice ? `<p class="gu-notice">${esc(notice)}</p>` : ''}${rows}<p class="gu-hurry">Hurry! Items in bag aren't reserved! Don't miss out and checkout now!</p></div>
  <aside class="gu-summary">
    <div class="gu-row"><span>Total (${t.count} item${t.count === 1 ? '' : 's'})</span><span>${gbp(t.subtotal)}</span></div>
    <div class="gu-row"><span>Discount:</span><span>${gbp(t.discount)}</span></div>
    <div class="gu-row gu-total"><span>Total:</span><span>${gbp(t.total)}</span></div>
    <p class="gu-fine">Delivery options and charges are shown at the checkout. Prices include VAT.</p>
    <form method="post" action="${base}/checkout/start"><button class="gu-btn gu-btn-block" type="submit">Continue Securely</button></form>
    <p class="gu-fine gu-center"><a href="${base}/">Continue shopping</a></p>
  </aside>
</div>`
}

export function wishlistPage({ base, products }) {
  return `<div class="gu-simple"><h1>My Wish List</h1><p class="gu-fine">We'll hold your wish list for 30 days. Sign in or register to sync it to any device.</p>
  ${products.length ? `<div class="gu-grid">${products.map(p => tile(base, p, `${base}/wishlist`)).join('')}</div>` : '<p>Your wish list is empty.</p>'}</div>`
}

export function storesPage({ base }) {
  return `<div class="gu-simple"><h1>Store Finder</h1><p>GAME is now in-store at selected Sports Direct and Frasers locations.</p><ul>${COLLECT_STORES.map(s => `<li>${esc(s)}</li>`).join('')}</ul><p class="gu-fine">Click &amp; Collect is available for most items (not pre-orders). <a href="${base}/">Back to shopping</a></p></div>`
}

// ---- sign in or register (stands in for auth.game.co.uk) ----
function authShell(inner) {
  return `<div class="gu-auth">
  <div class="gu-benefits"><div>${ICON.userBig}<span>Personalised experience</span></div><div>${ICON.bolt}<span>Speedy checkout</span></div><div>${ICON.tag}<span>Offers and promotions</span></div></div>
  <div class="gu-auth-box">${inner}</div>
  <p class="gu-recaptcha">Protected by reCAPTCHA &middot; <a href="#">Privacy</a> &middot; <a href="#">Terms</a></p>
</div>`
}

export function authEmailPage({ base, returnUrl, email = '', error = null }) {
  return authShell(`<h1>Sign in or register</h1>
    ${error ? `<p class="gu-error" role="alert">${esc(error)}</p>` : ''}
    <form method="post" action="${base}/account/login"><input type="hidden" name="returnUrl" value="${esc(returnUrl)}"><input type="hidden" name="action" value="email">
      <label for="email">Email address</label><input id="email" name="email" type="email" autocomplete="email" placeholder="Enter email address" value="${esc(email)}" required>
      <button class="gu-btn gu-btn-block" type="submit">Continue securely</button>
    </form>`)
}

// ASSUMPTION: the password and register screens were not reachable in research (typing an email was
// out of scope). Labels follow the Frasers Group shared sign-in: the email is shown with a "Change"
// link, one pink "Continue securely" button, and "Continue as guest" underneath (per GAME's terms).
export function authPasswordPage({ base, returnUrl, email, error = null }) {
  const change = `${base}/account/login?returnUrl=${encodeURIComponent(returnUrl)}`
  return authShell(`<h1>Welcome back</h1>
    <p class="gu-fine">${esc(email)} <a href="${change}">Change</a></p>
    ${error ? `<p class="gu-error" role="alert">${esc(error)}</p>` : ''}
    <form method="post" action="${base}/account/login"><input type="hidden" name="returnUrl" value="${esc(returnUrl)}"><input type="hidden" name="action" value="signin"><input type="hidden" name="email" value="${esc(email)}">
      <label for="password">Password</label><input id="password" name="password" type="password" autocomplete="current-password" required>
      <button class="gu-btn gu-btn-block" type="submit">Continue securely</button>
      <a class="gu-fine gu-forgot" href="#">Forgotten your password?</a>
    </form>
    <div class="gu-or">or</div>
    <form method="post" action="${base}/account/login"><input type="hidden" name="returnUrl" value="${esc(returnUrl)}"><input type="hidden" name="action" value="guest"><input type="hidden" name="email" value="${esc(email)}"><button class="gu-btn gu-btn-black gu-btn-block" type="submit">Continue as guest</button></form>`)
}

export function authRegisterPage({ base, returnUrl, email, values = {}, errors = {} }) {
  const change = `${base}/account/login?returnUrl=${encodeURIComponent(returnUrl)}`
  const f = (name, label, type, extra) => `<label for="${name}">${label}</label><input id="${name}" name="${name}" type="${type}" value="${esc(values[name] ?? '')}" ${extra}>${errors[name] ? `<span class="gu-error">${esc(errors[name])}</span>` : ''}`
  return authShell(`<h1>Create an account</h1>
    <p class="gu-fine">${esc(email)} <a href="${change}">Change</a></p>
    <p class="gu-fine">We couldn't find an account for this email address. Register in a few seconds, or continue as a guest.</p>
    <form method="post" action="${base}/account/login"><input type="hidden" name="returnUrl" value="${esc(returnUrl)}"><input type="hidden" name="action" value="register"><input type="hidden" name="email" value="${esc(email)}">
      ${f('firstName', 'First name', 'text', 'autocomplete="given-name" required')}
      ${f('lastName', 'Last name', 'text', 'autocomplete="family-name" required')}
      ${f('password', 'Password', 'password', 'autocomplete="new-password" required minlength="8"')}
      <label class="gu-check"><input type="checkbox" name="marketing" value="1"> Yes, email me about offers, promotions and new releases from GAME.</label>
      <button class="gu-btn gu-btn-block" type="submit">Register</button>
    </form>
    <div class="gu-or">or</div>
    <form method="post" action="${base}/account/login"><input type="hidden" name="returnUrl" value="${esc(returnUrl)}"><input type="hidden" name="action" value="guest"><input type="hidden" name="email" value="${esc(email)}"><button class="gu-btn gu-btn-black gu-btn-block" type="submit">Continue as guest</button></form>`)
}

// ---- checkout ----
const steps = (current) => `<ol class="gu-steps">${['Sign in', 'Delivery', 'Payment'].map((s, i) => `<li class="${i < current ? 'is-done' : i === current ? 'is-current' : ''}"><span>${i + 1}</span>${s}</li>`).join('')}</ol>`
const errorSummary = (errors) => Object.keys(errors).length ? `<div class="gu-error-summary" role="alert"><b>Please check the following:</b><ul>${Object.values(errors).map(e => `<li>${esc(e)}</li>`).join('')}</ul></div>` : ''
const fieldFactory = (values, errors) => (name, label, { type = 'text', extra = '', required = false } = {}) =>
  `<div class="gu-field"><label for="${name}">${label}${required ? ' <span class="gu-req" aria-hidden="true">*</span>' : ''}</label><input id="${name}" name="${name}" type="${type}" value="${esc(values[name] ?? '')}" ${extra}${required ? ' required' : ''}${errors[name] ? ` aria-invalid="true" aria-describedby="err-${name}"` : ''}>${errors[name] ? `<span class="gu-error" id="err-${name}">${esc(errors[name])}</span>` : ''}</div>`
const summaryLines = (t) => t.lines.map(l => `<div class="gu-sum-item"><img src="${l.product.art}" alt=""><div><div class="gu-brand">${esc(l.product.brand)}</div>${esc(l.product.title)}<div class="gu-fine">Colour: ${esc(l.product.swatch)} &middot; Qty ${l.qty}</div></div><b>${gbp(l.product.price * l.qty)}</b></div>`).join('')

export function deliveryPage({ base, t, email, guest, preorderInBag, values = {}, errors = {} }) {
  const input = fieldFactory(values, errors)
  const method = DELIVERY_METHODS[values.deliveryMethod] ? values.deliveryMethod : 'standard'
  const radios = CHECKOUT_DELIVERY_ORDER.map(id => {
    const m = DELIVERY_METHODS[id]
    const disabled = id === 'collect' && preorderInBag
    return `<label class="gu-radio gu-ship${disabled ? ' is-disabled' : ''}"><input type="radio" name="deliveryMethod" value="${id}" data-price="${m.price}" ${method === id ? 'checked' : ''} ${disabled ? 'disabled' : ''}><span class="gu-ship-name"><b>${esc(m.name)}</b> <span class="gu-fine">${esc(m.detail)}</span>${disabled ? '<span class="gu-fine gu-unavailable">Not available for pre-order items</span>' : ''}</span><b class="gu-ship-price">${gbp(m.price)}</b></label>`
  }).join('')
  return `<div class="gu-checkout">
  <form method="post" action="${base}/checkout/delivery" class="gu-co-form" novalidate>
    ${steps(1)}
    <h1>Delivery</h1>
    ${errorSummary(errors)}
    <section class="gu-co-section"><h2>Delivery address</h2>
      <p class="gu-fine">Order confirmation will be sent to <b>${esc(email)}</b>${guest ? ` &middot; <a href="${base}/account/login?returnUrl=%2Fcheckout">Not you?</a>` : ''}</p>
      <div class="gu-3col">
        <div class="gu-field"><label for="title">Title</label><select id="title" name="title" autocomplete="honorific-prefix"><option value="">Please select</option>${TITLES.map(x => `<option value="${x}" ${values.title === x ? 'selected' : ''}>${x}</option>`).join('')}</select></div>
        ${input('firstName', 'First name', { extra: 'autocomplete="given-name"', required: true })}
        ${input('lastName', 'Last name', { extra: 'autocomplete="family-name"', required: true })}
      </div>
      ${input('postcode', 'Postcode', { extra: 'autocomplete="postal-code" placeholder="e.g. SW1A 1AA"', required: true })}
      <p class="gu-fine">Enter your address manually below.</p>
      ${input('addressLine1', 'Address line 1', { extra: 'autocomplete="address-line1"', required: true })}
      ${input('addressLine2', 'Address line 2 (optional)', { extra: 'autocomplete="address-line2"' })}
      <div class="gu-2col">${input('town', 'Town/City', { extra: 'autocomplete="address-level2"', required: true })}${input('county', 'County (optional)', { extra: 'autocomplete="address-level1"' })}</div>
      <div class="gu-field"><label for="country">Country <span class="gu-req" aria-hidden="true">*</span></label><select id="country" name="country" autocomplete="country" required><option value="GB" selected>United Kingdom</option></select></div>
      ${input('mobile', 'Mobile number', { type: 'tel', extra: 'autocomplete="tel" inputmode="tel"', required: true })}
      <p class="gu-fine">We'll only use your mobile number for delivery updates.</p>
    </section>
    <section class="gu-co-section"><h2>Delivery method</h2>
      ${preorderInBag ? `<p class="gu-preorder-info">${ICON.info} Your bag contains a pre-order item. Your whole order will be held and dispatched via Express Delivery the day before the launch date (${DISPATCH_TEXT}).</p>` : ''}
      ${radios}
      <div class="gu-field gu-collect-store"><label for="collectStore">Collection store</label><select id="collectStore" name="collectStore" ${preorderInBag ? 'disabled' : ''}><option value="">Select a store</option>${COLLECT_STORES.map(s => `<option value="${esc(s)}" ${values.collectStore === s ? 'selected' : ''}>${esc(s)}</option>`).join('')}</select>${errors.collectStore ? `<span class="gu-error">${esc(errors.collectStore)}</span>` : ''}</div>
      ${errors.deliveryMethod ? `<span class="gu-error">${esc(errors.deliveryMethod)}</span>` : ''}
    </section>
    <button class="gu-btn gu-btn-block" type="submit">Continue to payment</button>
  </form>
  <aside class="gu-summary">
    <h2>Order summary</h2>${summaryLines(t)}
    <div class="gu-row"><span>Subtotal</span><span>${gbp(t.subtotal)}</span></div>
    <div class="gu-row"><span>Delivery</span><span id="sum-delivery">${gbp(DELIVERY_METHODS[method].price)}</span></div>
    <div class="gu-row gu-total"><span>Total</span><span id="sum-total">${gbp(t.subtotal + DELIVERY_METHODS[method].price)}</span></div>
    <p class="gu-fine">Prices include VAT.</p>
  </aside>
</div>
<script>
(function(){
  var sub=${t.subtotal};var radios=document.querySelectorAll('input[name=deliveryMethod]');
  function upd(){var r=document.querySelector('input[name=deliveryMethod]:checked');if(!r)return;var p=parseFloat(r.dataset.price)||0;document.getElementById('sum-delivery').textContent='£'+p.toFixed(2);document.getElementById('sum-total').textContent='£'+(sub+p).toFixed(2);var cs=document.querySelector('.gu-collect-store');if(cs)cs.style.display=r.value==='collect'?'':'none'}
  radios.forEach(function(r){r.addEventListener('change',upd)});upd();
})();
</script>`
}

export function paymentPage({ base, t, delivery, preorderInBag, values = {}, errors = {} }) {
  const input = fieldFactory(values, errors)
  const pm = values.paymentMethod || 'card'
  const m = DELIVERY_METHODS[delivery.deliveryMethod]
  const a = delivery
  // ASSUMPTION: Apple Pay and Frasers Plus are shown (GAME accepts both) but cannot be used here;
  // the research does not say whether Frasers Plus takes pre-orders, so it is marked unavailable.
  return `<div class="gu-checkout">
  <form method="post" action="${base}/checkout/payment" class="gu-co-form" novalidate>
    ${steps(2)}
    <h1>Payment</h1>
    ${errorSummary(errors)}
    <section class="gu-co-section"><h2>How would you like to pay?</h2>
      <div class="gu-paytabs">
        <label class="gu-paytab"><input type="radio" name="paymentMethod" value="card" ${pm === 'card' ? 'checked' : ''}><span><b>Credit/Debit card</b><small>VISA, VISA Debit, Mastercard, Maestro</small></span></label>
        <label class="gu-paytab is-disabled"><input type="radio" name="paymentMethod" value="applepay" disabled><span><b>Apple Pay</b><small>Available in Safari on Apple devices</small></span></label>
        <label class="gu-paytab is-disabled"><input type="radio" name="paymentMethod" value="frasersplus" disabled><span><b>Frasers Plus</b><small>Buy now, Pay in 3, interest free. Representative APR 29.9% (Variable). Credit subject to status. Not available for this order.</small></span></label>
        <label class="gu-paytab${preorderInBag ? ' is-disabled' : ''}"><input type="radio" name="paymentMethod" value="paypal" ${pm === 'paypal' ? 'checked' : ''} ${preorderInBag ? 'disabled' : ''}><span><b>PayPal</b><small>${preorderInBag ? 'PayPal is not available for pre-orders.' : 'You will be redirected to PayPal to complete your payment.'}</small></span></label>
      </div>
      <div class="gu-paypanel" data-panel="card">
        ${input('cardNumber', 'Card number', { extra: 'autocomplete="cc-number" inputmode="numeric" placeholder="0000 0000 0000 0000"', required: true })}
        <div class="gu-2col">${input('expiry', 'Expiry date (MM/YY)', { extra: 'autocomplete="cc-exp" placeholder="MM/YY"', required: true })}${input('cvv', 'Security code (CVV)', { extra: 'autocomplete="cc-csc" inputmode="numeric" maxlength="4"', required: true })}</div>
        ${input('nameOnCard', 'Name on card', { extra: 'autocomplete="cc-name"', required: true })}
        <p class="gu-fine">${ICON.lock} Your card details are encrypted. 3D Secure payment authentication may be requested by your bank.</p>
      </div>
      <div class="gu-paypanel" data-panel="paypal"><p>You will be redirected to PayPal to complete your payment.</p></div>
    </section>
    <section class="gu-co-section"><h2>Billing address</h2>
      <label class="gu-check"><input type="checkbox" id="billingSame" name="billingSame" value="1" ${values.billingSame === undefined || values.billingSame ? 'checked' : ''}> Billing address same as delivery address</label>
      <div id="billing-fields">
        <div class="gu-2col">${input('billingFirstName', 'First name')}${input('billingLastName', 'Last name')}</div>
        ${input('billingAddressLine1', 'Address line 1')}
        <div class="gu-2col">${input('billingTown', 'Town/City')}${input('billingPostcode', 'Postcode')}</div>
      </div>
    </section>
    <section class="gu-co-section"><h2>Gift cards &amp; promo codes</h2>
      <details ${values.giftCard || errors.giftCard ? 'open' : ''}><summary class="gu-link">use Gift Card/eVoucher</summary>${input('giftCard', 'Gift Card / eVoucher / Credit Note code')}</details>
      ${input('promoCode', 'Promo code')}
    </section>
    <p class="gu-fine">On receipt of your order, an authorisation will be created on your account. This will show on your bank statement as a reservation of funds which allocates the money to your order but will not be taken until your order has been picked and processed. Pre-orders are held and dispatched via Express Delivery the day before the launch date.</p>
    <button class="gu-btn gu-btn-block" type="submit">Pay now</button>
    <p class="gu-fine">By clicking Pay now you agree to GAME's Terms &amp; Conditions and Privacy Policy. It is not possible to amend a pre-order once placed.</p>
  </form>
  <aside class="gu-summary">
    <h2>Order summary</h2>${summaryLines(t)}
    <h3>Delivery address <a class="gu-fine" href="${base}/checkout/delivery">Edit</a></h3>
    <address>${esc([a.title, a.firstName, a.lastName].filter(Boolean).join(' '))}<br>${esc(a.addressLine1)}${a.addressLine2 ? `<br>${esc(a.addressLine2)}` : ''}<br>${esc(a.town)}${a.county ? `, ${esc(a.county)}` : ''}<br>${esc(a.postcode)}<br>United Kingdom<br>${esc(a.mobile)}</address>
    <h3>Delivery method</h3>
    <p>${esc(m.name)} &middot; ${esc(m.eta)}${a.collectStore ? `<br><span class="gu-fine">${esc(a.collectStore)}</span>` : ''}</p>
    <div class="gu-row"><span>Subtotal</span><span>${gbp(t.subtotal)}</span></div>
    <div class="gu-row"><span>Delivery</span><span>${gbp(t.delivery)}</span></div>
    <div class="gu-row gu-total"><span>Total</span><span>${gbp(t.total)}</span></div>
    <p class="gu-fine">Prices include VAT.</p>
  </aside>
</div>
<script>
(function(){
  var form=document.querySelector('.gu-co-form');
  function showPanel(){var r=form.querySelector('input[name=paymentMethod]:checked');var val=r?r.value:'card';form.querySelectorAll('.gu-paypanel').forEach(function(p){p.hidden=p.dataset.panel!==val})}
  form.querySelectorAll('input[name=paymentMethod]').forEach(function(r){r.addEventListener('change',showPanel)});showPanel();
  var same=document.getElementById('billingSame'),bf=document.getElementById('billing-fields');
  function toggle(){bf.hidden=same.checked}same.addEventListener('change',toggle);toggle();
})();
</script>`
}

export function completePage({ base, order }) {
  const a = order.shipping_address
  const m = DELIVERY_METHODS[order.fulfillment.option] ?? DELIVERY_METHODS.standard
  const pay = order.payment.method === 'card' ? `${esc(order.payment.brand)} card ending ${esc(order.payment.last4)}` : 'PayPal'
  return `<div class="gu-confirm">
  <h1>Thank you for your order</h1>
  <p class="gu-order-no">Your order number is <b data-order-number>${esc(order.order_number)}</b></p>
  <p>We've sent an order acknowledgement to <b>${esc(order.customer.email)}</b>. An order acknowledgement does not mean that your order has been accepted. When your order has been picked, packed and is ready for delivery, you will receive an email confirming that we have accepted your order.</p>
  <p class="gu-preorder-info">${ICON.info} Your ${pay} has been authorised for ${gbp(order.totals.total)}; payment will be taken when your order is dispatched.${order.meta.preorder ? ` Pre-order items are held and dispatched via Express Delivery the day before the launch date (${DISPATCH_TEXT}).` : ''}</p>
  <div class="gu-confirm-grid">
    <div>
      <h2>Items ordered</h2>
      <table class="gu-table"><thead><tr><th>Item</th><th>Qty</th><th>Price</th></tr></thead><tbody>${order.items.map(it => {
        const p = byId(it.sku)
        return `<tr><td>${p ? `<div class="gu-brand">${esc(p.brand)}</div>` : ''}${esc(it.title)}${p ? `<div class="gu-fine">Colour: ${esc(p.swatch)} &middot; Size: One Size &middot; Product code: ${esc(p.id)}</div>` : ''}</td><td>${it.qty}</td><td>${gbp(it.unit_price * it.qty)}</td></tr>`
      }).join('')}</tbody></table>
      <h2>Delivery address</h2>
      <address>${esc([a.title, a.first_name, a.last_name].filter(Boolean).join(' '))}<br>${esc(a.line1)}${a.line2 ? `<br>${esc(a.line2)}` : ''}<br>${esc(a.city)}${a.state ? `, ${esc(a.state)}` : ''}<br>${esc(a.postal_code)}<br>United Kingdom<br>${esc(a.phone)}</address>
      <h2>Delivery method</h2>
      <p>${esc(m.name)} &middot; ${esc(m.eta)} &middot; ${gbp(order.totals.shipping)}${order.fulfillment.store_location ? `<br>Collect from: ${esc(order.fulfillment.store_location)}` : ''}</p>
      <h2>Payment</h2>
      <p>${pay}${order.payment.name_on_card ? `<br>${esc(order.payment.name_on_card)}` : ''}</p>
    </div>
    <aside class="gu-summary">
      <div class="gu-row"><span>Subtotal</span><span>${gbp(order.totals.subtotal)}</span></div>
      <div class="gu-row"><span>Delivery</span><span>${gbp(order.totals.shipping)}</span></div>
      <div class="gu-row"><span>Discount</span><span>${gbp(order.totals.discount ?? 0)}</span></div>
      <div class="gu-row gu-total"><span>Total</span><span>${gbp(order.totals.total)}</span></div>
      <p class="gu-fine">Prices include VAT.</p>
      <a class="gu-btn gu-btn-block" href="${base}/">Continue shopping</a>
    </aside>
  </div>
</div>`
}

export function accountPage({ base, user, orders }) {
  return `<div class="gu-simple"><h1>My Account</h1><p>Hello, ${esc(user.first_name)} &middot; ${esc(user.email)} &middot; <a href="${base}/logout">Sign out</a></p>
  <h2>Order history</h2>
  ${orders.length ? `<table class="gu-table"><thead><tr><th>Order number</th><th>Date</th><th>Items</th><th>Total</th></tr></thead><tbody>${orders.map(o => `<tr><td>${esc(o.order_number)}</td><td>${new Date(o.created_at).toLocaleDateString('en-GB')}</td><td>${o.items.map(i => esc(i.title)).join('<br>')}</td><td>${gbp(o.totals.total)}</td></tr>`).join('')}</tbody></table>` : '<p>You have no orders yet.</p>'}</div>`
}

export function notFoundPage({ base }) {
  return `<div class="gu-404"><h1>Sorry &ndash; This Page Could Not Be Found</h1><p>You may have entered an incorrect URL or the page you were after no longer exists.</p><p class="gu-404-btns"><a class="gu-btn gu-btn-black" href="${base}/">HOME</a><a class="gu-btn" href="${base}/contact">CONTACT US</a></p></div>`
}

export function simplePage({ title, html }) {
  return `<div class="gu-simple"><h1>${esc(title)}</h1>${html}</div>`
}
