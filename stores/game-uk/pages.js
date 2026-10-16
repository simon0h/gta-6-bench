import { fixtureCatalog } from '../../lib/catalog-policy.js'
import { scenarioStockFor } from '../../lib/benchmark-scenarios.js'
import { productImage as assetImage, productGallery as assetGallery } from '../../lib/product-assets.js'
import { shelfImage, shelfGallery } from './shelf.js'
import { productPhoto } from '../../lib/product-photos.js'
import { DEPARTMENTS, CAMPAIGNS, categorySlug } from './catalog.js'
import { FOOTER_COLUMNS, ACCOUNT_LINKS } from './site.js'
import { esc, money, disclaimer, publicNotice } from '../../lib/html.js'
import {
  CATALOG, quantityLimit, byId, selectedProduct, eligibleMethods, productPath, productHref, facets, countdown, SORTS, DELIVERY_METHODS, INTERNATIONAL_DELIVERY, PDP_DELIVERY_ORDER, CHECKOUT_DELIVERY_ORDER,
  COLLECT_STORES, BENCHMARK_COLLECT_STORE, TITLES, MAX_QTY, RELEASE_TEXT, RELEASE_SHORT, DISPATCH_TEXT, PREORDER_NOTICE_1, PREORDER_NOTICE_2, LEGAL_TEXT,
} from './data.js'

const NAME = 'GAME'

function informationHref(base, label) {
 const text = label.replaceAll('&amp;', '&')
 const routes = {"Track order":"/accountinformation/orderhistorysummary","Store Finder":"/stores","Help Home":"/help","Contact Us":"/contact","Delivery & Collection":"/help/categories/delivery","Returns & Cancellations":"/help/categories/returns","Frasers Plus":"/frasersplus","Cookie policy":"/cookie-preferences","Privacy":"/help/categories/legal","Privacy Policy":"/help/categories/legal","Terms":"/help/articles/offers-promotions-and-competitions","Terms & Conditions":"/help/articles/offers-promotions-and-competitions","Cookie Policy":"/cookie-preferences"}
 return base + (routes[text] || '/information?topic=' + encodeURIComponent(text))
}
export function supportInformationPage(base, topic = 'Shopping information') {
 const title = String(topic).slice(0,100)
 const q = title.toLowerCase()
 let content
 if (/password|signing in/.test(q)) content = '<p>To reset your password, use the Forgotten password link on the sign in page. You can also check out as a guest where offered.</p>'
 else if (/afterpay|zip|paypal|frasers|gift cards/.test(q)) content = '<p>The payment methods currently available for an order are listed at checkout. Gift cards and eVouchers can be redeemed at the payment step of checkout.</p>'
 else if (/cookie|privacy/.test(q)) content = '<p>We use cookies to keep your basket, account and checkout together and to improve your shopping experience. You can change your choices at any time from Cookie preferences.</p>'
 else if (/return|refund|cancel/.test(q)) content = '<p>Review the item, format, delivery choice and total before placing your order. Digital redemption codes may have different return conditions from physical products. You can save a support enquiry from your order details. This does not approve a cancellation or refund.</p>'
 else if (/delivery|shipping|collection/.test(q)) content = '<p>Product pages show available fulfilment choices. Confirm your address or collection store at checkout to see the order-specific delivery estimate and charges. Pre-orders are fulfilled when available; wait for collection confirmation before visiting a store.</p>'
 else if (/terms/.test(q)) content = '<p>Check product compatibility, quantity, fulfilment and payment details before confirming.</p>' + publicNotice('<p>This is not the real GAME website: orders record your selected items without charging a real payment method.</p>')
 else if (/read more/.test(q)) content = '<p>PEGI 18 identifies games intended for adults. You must confirm you are 18 or over before adding this age-rated game to your bag.</p>'
 else if (/edit/.test(q)) content = '<p>Prices are displayed in pounds sterling and include VAT. Our UK website sells in pounds sterling only.</p>'
 else if (/mobile phones/.test(q)) content = '<p>We don’t currently sell mobile phones online. Browse our technology and gaming departments instead.</p>'
 else if (/contact|chat|call|help/.test(q)) content = '<p>For order details, use your account or the order confirmation. Live chat is currently unavailable; please try again later or send us a message from Contact Us. Product availability and delivery options are shown on the product page and at checkout.</p>'
 else content = '<p>This service is currently unavailable. Please try again later.</p>'
 return `<section><h1>${esc(title)}</h1>${content}<p><a href="${base}/">Continue shopping</a> · <a href="${base}/account">Your account and orders</a></p></section>`
}
const gbp = (n) => money(n, 'GBP')
// Bag and order lines name the variant the way GAME does ("Colour:" for game formats, "Size: One Size").
const PLATFORM_SWATCHES = new Set(['PS5', 'PS4', 'XBS', 'Xbox', 'NS2', 'NSW', 'Nintendo', 'PC'])
export function variantLabel(p) {
  if (!p) return 'Colour'
  if (p.optionLabel) return p.optionLabel
  if (p.kind === 'game') return 'Colour'
  if (/^(One Size|Standard)$/.test(p.swatch)) return 'Size'
  if (PLATFORM_SWATCHES.has(p.swatch) || p.category === 'Video Games') return 'Platform'
  if (p.swatch === 'Digital') return 'Format'
  return 'Colour'
}
const PROMOS = [
  'FC27 - Out now! Get in the game',
  'Coming Soon - Shop upcoming releases on games and more',
  'Spread the cost of gifting with Frasers Plus: Buy now, Pay in 3, interest free. Representative APR 29.9% (Variable)',
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
    ${artwork(l.product)}
    <div><div class="gu-brand">${esc(l.product.brand)}</div><a href="${productHref(base, l.product)}">${esc(l.product.title)}</a>
      <div class="gu-fine">${esc(variantLabel(l.product))}: ${esc(l.product.swatch)}</div>
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
      <input type="search" name="descriptionfilter" value="${esc(q)}" placeholder="Search product or brand" aria-label="Search product or brand" list="gu-suggestions">
      <button type="submit" aria-label="Search">${ICON.search}</button>
      <datalist id="gu-suggestions">${[...new Set(CATALOG.map(p=>p.brand)), "Nintendo", "headset", "LEGO", "gta 6", "monitor"].map(x=>`<option value="${esc(x)}">`).join('')}</datalist>
    </form>
    <nav class="gu-icons" aria-label="Account and bag">
      <a href="${base}/stores">${ICON.pin}<span>Stores</span></a>
      <div class="gu-account-menu">${user ? `<a href="${base}/account">${ICON.user}<span>Hi, ${esc(user.first_name || 'there')}</span></a>` : `<a href="${base}/login">${ICON.user}<span>Sign In</span></a>`}<details class="gu-account-drop"><summary aria-label="My account menu"><span aria-hidden="true">⌄</span></summary><div class="gu-account-pop">${user ? '' : `<a class="gu-btn gu-btn-block" href="${base}/login">Sign In</a>`}${ACCOUNT_LINKS.map(([l,u])=>`<a href="${base}${u}">${l}</a>`).join('')}${user ? `<a href="${base}/logout">Sign out</a>` : ''}</div></details></div>
      <a href="${base}/wishlist">${ICON.heart}<span>My Wish List</span></a>
      <div class="gu-bag${flyoutOpen ? ' is-open' : ''}">
        <a href="${base}/cart" class="gu-bag-link" aria-label="My Bag, ${t.count} item${t.count === 1 ? '' : 's'}">${ICON.bag}<span>My Bag</span><span class="gu-count">${t.count}</span></a>
        ${t.lines.length ? minibag(base, t, flyoutOpen ? closeHref : '') : ''}
      </div>
    </nav>
  </div>
  <details class="gu-navigation" open><summary>Shop departments <span aria-hidden="true">☰</span></summary><nav class="gu-nav" aria-label="Shop by category">${DEPARTMENTS.map(d=>`<div class="gu-mega-item"><a href="${base}/${d.id}">${esc(d.title)}</a><details class="gu-menu-disclosure"><summary aria-label="Explore ${esc(d.title)}"><span aria-hidden="true">⌄</span></summary><div class="gu-mega"><div><h4>${esc(d.title)}</h4><a class="gu-shop-all" href="${base}/${d.id}">Shop all ${esc(d.title)}</a>${d.categories.map(c=>`<a href="${base}/${d.id}/${categorySlug(c)}">${esc(c)}</a>`).join('')}</div><div><h4>Discover</h4>${d.id==='gaming'?`<a href="${searchHref(base,'grand theft auto vi')}">GTA VI Pre-Order</a>`:''}${CAMPAIGNS.map(c=>`<a href="${base}/campaign/${c.id}">${esc(c.title)}</a>`).join('')}</div><a class="gu-menu-photo" href="${base}/${d.id}">${productPhoto(d.photo,d.title)}<b>Explore ${esc(d.title)} →</b></a></div></details></div>`).join('')}</nav></details>
  <div class="gu-promo" id="gu-promo"><a href="${base}/frasersplus">${esc(PROMOS[2])}</a></div>
</header>`
}

function slimHeader({ base, mode }) {
  return `<header class="gu-header gu-header-slim"><div class="gu-row1 gu-row1-slim"><a class="gu-logo" href="${base}/" aria-label="GAME home">GAME</a>${mode === 'checkout' ? `<span class="gu-secure">${ICON.lock} Secure checkout</span>` : ''}</div></header>`
}

function cookieBanner(base, back) {
  return `<div class="gu-cookies" role="region" aria-label="Our cookies">
  <div><b>Our cookies</b><p>Our website uses cookies and similar technologies to personalise the ads that are shown to you and to help you get the best experience on our site. <a href="${informationHref(base, 'Cookie policy')}">Cookie policy</a></p></div>
  <form method="post" action="${base}/cookies"><input type="hidden" name="back" value="${esc(back)}">
    <button type="submit" name="choice" value="manage" class="gu-link-btn">Manage cookies</button>
    <button type="submit" name="choice" value="reject" class="gu-btn gu-btn-black">Reject all</button>
    <button type="submit" name="choice" value="allow" class="gu-btn">Allow all</button>
  </form></div>`
}

const SOCIAL = {
  X: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M4 4l16 16M20 4 4 20" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
  TikTok: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M14 3c.5 3 2.5 4.5 5 4.6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
  Instagram: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3.6" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17" cy="7" r="1.2" fill="currentColor"/></svg>',
  Facebook: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M13.5 21v-8h2.8l.4-3.2h-3.2V7.9c0-.9.3-1.6 1.6-1.6h1.7V3.5c-.3 0-1.3-.1-2.5-.1-2.5 0-4.1 1.5-4.1 4.2v2.3H7.4V13h2.8v8z" fill="currentColor"/></svg>',
}
function footer(base, mode) {
  // ASSUMPTION: like the minimal auth.game.co.uk page, the sign-in and checkout steps carry
  // only a slim legal footer (no newsletter or link columns).
  if (mode !== 'full') return `<footer class="gu-footer gu-footer-slim"><p class="gu-copy">&copy; 2026 Frasers Group Trading Limited &middot; <a href="${informationHref(base, 'Terms &amp; Conditions')}">Terms &amp; Conditions</a> &middot; <a href="${informationHref(base, 'Privacy Policy')}">Privacy Policy</a> &middot; <a href="${informationHref(base, 'Cookie Policy')}">Cookie Policy</a></p>${disclaimer(NAME)}</footer>`
  const col = (h, links) => `<div><h4>${h}</h4>${links.map(([l, u]) => `<a href="${base}${u}">${esc(l)}</a>`).join('')}</div>`
  return `<footer class="gu-footer">
  <div class="gu-newsletter"><h4>Sign up to our newsletter</h4><form class="gu-news-form" method="get" action="${base}/information"><input type="hidden" name="topic" value="Newsletter"><label class="gu-sr" for="gu-news-email">Email address</label><input id="gu-news-email" type="email" name="email" placeholder="Enter email address" autocomplete="email"><button class="gu-btn gu-btn-black" type="submit">Sign up</button></form></div>
  <div class="gu-footer-cols">
    ${FOOTER_COLUMNS.map(([h, links]) => col(h, links)).join('')}
    <div><h4>Stay connected</h4><a class="gu-store-badge" href="${base}/mobile-app"><small>Download on the</small> App Store</a><a class="gu-store-badge" href="${base}/mobile-app"><small>Get it on</small> Google Play</a><p class="gu-follow">Follow Us</p><div class="gu-social">${Object.entries(SOCIAL).map(([x, svg]) => `<span class="gu-social-icon" role="img" title="${x}" aria-label="${x}">${svg}</span>`).join('')}</div></div>
  </div>
  <div class="gu-ways"><span>Ways to pay</span>${['VISA', 'VISA Debit', 'Mastercard', 'Maestro', 'Apple Pay', 'PayPal', 'Gift Cards', 'Frasers+'].map(w => `<span class="gu-paylogo">${w}</span>`).join('')}</div>
  <div class="gu-currency">Currency &pound; GBP <a href="${informationHref(base, 'Edit')}">Edit</a></div>
  <p class="gu-copy">&copy; 2026 Frasers Group Trading Limited &middot; <a href="${base}/help/categories/legal">Privacy Policy</a> &middot; <a href="${base}/sitemap">Sitemap</a></p>
  <p class="gu-fca">Frasers Group Trading Limited acts as a credit broker and is an appointed representative of a lender authorised and regulated by the Financial Conduct Authority. *Frasers Plus is a credit product. Buy now, Pay in 3, interest free. Representative APR 29.9% (Variable). Credit subject to status. Terms apply. 18+, UK residents only. Missed payments may affect your credit score.</p>
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
<a class="gu-skip" href="#main-content">Skip to content</a>
<main class="gu-main" id="main-content">${body}</main>
${footer(base, mode)}
${cookieChoice ? '' : cookieBanner(base, back)}
<script>
(function(){
  var promo=document.querySelector('#gu-promo a');if(promo){var msgs=${JSON.stringify(PROMOS)},i=2;setInterval(function(){i=(i+1)%msgs.length;promo.textContent=msgs[i];promo.href=[${JSON.stringify(searchHref(base,'FC27'))},${JSON.stringify(base+'/coming-soon')},${JSON.stringify(base+'/frasersplus')}][i]},4000)}
  var navigation=document.querySelector('.gu-navigation');if(matchMedia('(max-width:700px)').matches){if(navigation)navigation.open=false;document.querySelectorAll('.gu-facets details').forEach(function(facet){facet.open=!!facet.querySelector('.is-active')})}
  var menus=[...document.querySelectorAll('.gu-menu-disclosure')];menus.forEach(function(menu){menu.addEventListener('toggle',function(){if(menu.open)menus.forEach(function(other){if(other!==menu)other.open=false})})});
  document.addEventListener('click',function(e){if(!e.target.closest('.gu-nav'))menus.forEach(function(m){m.open=false})});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')menus.forEach(function(m){if(m.open){m.open=false;m.querySelector('summary').focus()}})});
  document.querySelectorAll('.gu-qty-btn').forEach(function(b){b.addEventListener('click',function(){var inp=b.parentNode.querySelector('input');var v=(parseInt(inp.value,10)||1)+parseInt(b.dataset.step,10);inp.value=Math.min(Number(inp.max)||${MAX_QTY},Math.max(1,v))})});
})();
</script>
</body></html>`
}

// ---- browse ----
// Assortment rows draw their pictures from the store's own /images/products/ route (shelf.js).
const productImage = (store, p, opts) => p.shelf ? shelfImage('/'+store, p, opts) : assetImage(store, p, opts)
const productGallery = (store, p) => p.shelf ? shelfGallery('/'+store, p) : assetGallery(store, p)
export function artwork(p,className='') { return productImage('game-uk',{...p,variantId:p.option},{className}) }

function tile(base, p, back) {
  return `<article class="gu-tile" data-product-id="${p.id}">
  <div class="gu-badges">${p.badges.map(b => `<span class="gu-flag">${esc(b)}</span>`).join('')}</div>
  <form method="post" action="${base}/wishlist/add" class="gu-tile-heart"><input type="hidden" name="pid" value="${p.id}"><input type="hidden" name="back" value="${esc(back)}"><button type="submit" aria-label="Add ${esc(p.title)} to wish list" title="Add to wish list">${ICON.heart}</button></form>
  <a class="gu-tile-img" href="${productHref(base, p)}">${artwork(p)}</a>
  <div class="gu-brand">${esc(p.brand)}</div>
  <a class="gu-tile-name" href="${productHref(base, p)}">${esc(p.title)}</a>
  <p class="gu-fine">${esc(p.browseCategory || (p.category==='Unclassified' ? p.style : p.category))} · ${p.catalogEvidence ? 'Pre-order' : p.stock ? (p.preorder ? 'Pre-order' : 'In stock') : 'Out of stock'}</p><div class="gu-tile-price">${gbp(p.price)}${p.ticketPrice > p.price ? ` <s>${gbp(p.ticketPrice)}</s>` : ''}</div>
</article>`
}

// Homepage sections in the order seen on www.game.co.uk (2026-09-29 / 2026-10-13): round
// category shortcuts, Coming Soon hero, Gifts For Gamers, Frasers Plus band, Trending, Gift Shop.
// Reference mode adds the real homepage's Coming Soon carousel plus department rows from the
// GAME assortment (shelf.js), so GTA VI is one product among many.
const SHORTCUTS = [['Coming Soon','/coming-soon'],['XBOX','/xbox/all-xbox'],['PlayStation','/playstation'],['Nintendo','/nintendo'],['Pokemon','/pokemon'],['LEGO','/lego'],['Toys','/toys'],['PC','/pc-gaming']]
const SHORTCUT_ICON = {
  XBOX: '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="15" fill="none" stroke="currentColor" stroke-width="3"/><path d="M15 14c6 4 12 12 18 22M33 14c-6 4-12 12-18 22" stroke="currentColor" stroke-width="3" fill="none"/></svg>',
  PlayStation: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M19 10v28l6 2V17c0-2 3-2 3 0v8c4 2 8 0 8-5 0-6-5-8-17-10z" fill="currentColor"/><path d="M8 33c0 3 6 4 11 2v-3c-4 1-7 1-7 0 0-1 3-2 7-3v-3c-6 1-11 4-11 7z" fill="currentColor"/></svg>',
  Nintendo: '<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="10" y="12" width="12" height="24" rx="6" fill="none" stroke="currentColor" stroke-width="3"/><rect x="26" y="12" width="12" height="24" rx="6" fill="currentColor"/><circle cx="16" cy="19" r="2.5" fill="currentColor"/></svg>',
  Pokemon: '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="15" fill="none" stroke="currentColor" stroke-width="3"/><path d="M9 24h30" stroke="currentColor" stroke-width="3"/><circle cx="24" cy="24" r="5" fill="#fff" stroke="currentColor" stroke-width="3"/></svg>',
  LEGO: '<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="9" y="20" width="30" height="16" rx="2" fill="currentColor"/><rect x="13" y="14" width="8" height="7" rx="2" fill="currentColor"/><rect x="27" y="14" width="8" height="7" rx="2" fill="currentColor"/></svg>',
  Toys: '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="26" r="11" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="15" cy="14" r="5" fill="currentColor"/><circle cx="33" cy="14" r="5" fill="currentColor"/><circle cx="20" cy="25" r="1.8" fill="currentColor"/><circle cx="28" cy="25" r="1.8" fill="currentColor"/></svg>',
  PC: '<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="8" y="10" width="32" height="21" rx="2" fill="none" stroke="currentColor" stroke-width="3"/><path d="M18 38h12M24 31v7" stroke="currentColor" stroke-width="3"/></svg>',
}
// Category tiles carry a line icon for what they sell (the real site uses packshot tiles).
const TILE_ICON = {
  controller: '<path d="M14 18h20c5 0 8 4 9 10l1 6c1 4-3 6-6 3l-4-4H14l-4 4c-3 3-7 1-6-3l1-6c1-6 4-10 9-10z" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round"/><path d="M15 23v8M11 27h8" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><circle cx="32" cy="25" r="1.8" fill="currentColor"/><circle cx="36" cy="29" r="1.8" fill="currentColor"/>',
  headset: '<path d="M10 30v-5a14 14 0 0 1 28 0v5" fill="none" stroke="currentColor" stroke-width="2.6"/><rect x="8" y="28" width="7" height="11" rx="3" fill="currentColor"/><rect x="33" y="28" width="7" height="11" rx="3" fill="currentColor"/><path d="M15 37c2 3 6 4 9 4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
  console: '<rect x="8" y="15" width="32" height="18" rx="3" fill="none" stroke="currentColor" stroke-width="2.6"/><path d="M14 38h20" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><circle cx="33" cy="24" r="2" fill="currentColor"/><path d="M13 24h10" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>',
  game: '<rect x="13" y="8" width="22" height="32" rx="2" fill="none" stroke="currentColor" stroke-width="2.6"/><path d="M13 14h22" stroke="currentColor" stroke-width="2.6"/><path d="m19 31 5-8 5 8z" fill="currentColor"/>',
  card: '<rect x="7" y="14" width="34" height="22" rx="3" fill="none" stroke="currentColor" stroke-width="2.6"/><path d="M7 21h34" stroke="currentColor" stroke-width="3"/><path d="M12 30h10" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>',
  cards: '<rect x="11" y="13" width="18" height="26" rx="2" transform="rotate(-10 20 26)" fill="none" stroke="currentColor" stroke-width="2.4"/><rect x="20" y="10" width="18" height="26" rx="2" fill="currentColor"/>',
  bricks: '<rect x="9" y="20" width="30" height="16" rx="2" fill="currentColor"/><rect x="13" y="14" width="8" height="7" rx="2" fill="currentColor"/><rect x="27" y="14" width="8" height="7" rx="2" fill="currentColor"/>',
  toy: '<circle cx="24" cy="26" r="11" fill="none" stroke="currentColor" stroke-width="2.6"/><circle cx="15" cy="14" r="5" fill="currentColor"/><circle cx="33" cy="14" r="5" fill="currentColor"/><circle cx="20" cy="25" r="1.8" fill="currentColor"/><circle cx="28" cy="25" r="1.8" fill="currentColor"/><path d="M21 30c2 2 4 2 6 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  ball: '<circle cx="24" cy="24" r="15" fill="none" stroke="currentColor" stroke-width="2.6"/><path d="m24 17 6 4-2 7h-8l-2-7z" fill="currentColor"/><path d="M24 9v8M30 21l8-3M28 28l5 7M20 28l-5 7M18 21l-8-3" stroke="currentColor" stroke-width="2"/>',
  pc: '<rect x="8" y="10" width="32" height="21" rx="2" fill="none" stroke="currentColor" stroke-width="2.6"/><path d="M18 38h12M24 31v7" stroke="currentColor" stroke-width="2.6"/>',
  vr: '<rect x="7" y="17" width="34" height="16" rx="6" fill="none" stroke="currentColor" stroke-width="2.6"/><circle cx="17" cy="25" r="3" fill="currentColor"/><circle cx="31" cy="25" r="3" fill="currentColor"/>',
  tag: '<path d="M8 24V9h15l17 17-15 15z" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round"/><circle cx="16" cy="17" r="2.5" fill="currentColor"/>',
  star: '<path d="m24 8 4.7 10 10.8 1.2-8 7.4 2.2 10.7L24 31.9l-9.7 5.4 2.2-10.7-8-7.4L19.3 18z" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round"/>',
  music: '<path d="M19 34V12l18-4v22" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round"/><circle cx="14" cy="34" r="5" fill="currentColor"/><circle cx="32" cy="30" r="5" fill="currentColor"/>',
}
function tileIcon(label) {
  const l = String(label).toLowerCase()
  const key = /trading|pok[eé]mon|booster|tcg|binder/.test(l) ? 'cards'
    : /gift card|digital|currency|voucher|credit|subscription|top.?up|wallet/.test(l) ? 'card'
    : /headset|headphone|audio|speaker|earbud/.test(l) ? 'headset'
    : /controller|accessor|gamer|pad|wheel|charg|dock/.test(l) ? 'controller'
    : /console|hardware|switch 2$|bundle/.test(l) ? 'console'
    : /lego|brick|build/.test(l) ? 'bricks'
    : /football|sport|fc ?2/.test(l) ? 'ball'
    : /\bvr\b|virtual/.test(l) ? 'vr'
    : /\bpc\b|monitor|laptop|keyboard|mouse|mice|tech|webcam|storage|chair/.test(l) ? 'pc'
    : /vinyl|music|soundtrack/.test(l) ? 'music'
    : /character|collect|merch/.test(l) ? 'star'
    : /toy|plush|soft|figure|board/.test(l) ? 'toy'
    : /deal|sale|offer|under|clearance|price/.test(l) ? 'tag'
    : /game|release|coming|pre-?order|new|top|chart/.test(l) ? 'game'
    : 'star'
  return `<svg viewBox="0 0 48 48" width="30" height="30" aria-hidden="true">${TILE_ICON[key]}</svg>`
}
const GIFT_SHOP = [['Gifts For Gamers','/gifts/gifts-for-gamers','Headsets, controllers and gaming gear'],['Character Gifts','/gifts/character-gifts','Mario, Sonic, Pokémon and more'],['Toy Gifts','/gifts/toy-gifts','Plush, playsets and action figures'],['Trading Card Gifts','/gifts/trading-card-gifts','Booster packs, tins and binders'],['Football Gifts','/gifts/football-gifts','Football games and fan favourites'],['Digital Gift Cards and Currency','/gifts/digital-gift-cards-and-currency','Instant codes for every platform']]

export function homePage({ base, products }) {
  const gta = products.filter(p => p.kind === 'game' && p.preorder)
  const pick = ids => ids.map(id => products.find(p => p.id === id)).filter(Boolean)
  // Trending as on www.game.co.uk (2026-10-13): GTA VI, FC27, Star Wars Galactic Racer, Yu-Gi-Oh! Beyond the Brave.
  const trending = fixtureCatalog ? [...gta, ...products.filter(p=>['991202','992007','992001','991203'].includes(p.id))].slice(0,6) : pick(['756802','753767','754376','740026'])
  const section = (title, list, href, row='') => `<section class="gu-trending"${row?` data-home-row="${row}"`:''}><div class="gu-section-title"><h2>${esc(title)}</h2><a href="${href}">Shop all →</a></div><div class="gu-grid gu-shelf">${list.slice(0,4).map(p=>tile(base,p,base+'/')).join('')}</div></section>`
  const shelf = products.filter(p => p.shelf)
  const dealPct = p => (p.ticketPrice - p.price) / p.ticketPrice
  const comingSoon = fixtureCatalog ? '' : section('Coming Soon', pick(['756802','900043','757759','756389']), base+'/coming-soon', 'coming-soon')
  const shelfRows = fixtureCatalog ? '' : [
    section('Top Deals', [...shelf].filter(p => !p.preorder && p.ticketPrice > p.price).sort((a,b) => dealPct(b) - dealPct(a) || b.price - a.price).filter((p,i,a) => a.findIndex(x => x.category === p.category) === i), base+'/deals', 'deals'),
    section('Nintendo Switch 2', pick(['719937','719950','753530','758743']), base+'/nintendo', 'nintendo'),
    section('Controllers & Headsets', pick(['384553','371325','857967','712252']), base+'/accessories', 'accessories'),
    section('Trading Cards', pick(['741118','740747','741022','741183']), base+'/toys/trading-cards', 'trading-cards'),
    section('PC Gaming', pick(['735536','414107','394064','384680']), base+'/pc-gaming', 'pc-gaming'),
    section('LEGO', pick(['921347','988225','702500','988246']), base+'/lego', 'lego'),
    section('Tech', pick(['700010','389751','388435','807125']), base+'/tech', 'tech'),
    section('Plush & Board Games', pick(['397092','418479','890547','725624']), base+'/toys', 'toys'),
  ].join('')
  const discoveries = [['Gaming PCs & Laptops','/pc-gaming/laptops','laptop'],['Plush & Soft Toys','/toys/soft-toys','plush-rabbit'],['Creative Building Sets','/lego/building-sets','brick-city-bus'],['Trading Card Storage','/toys/trading-cards/card-storage','card-binder-red']]
  const fixtureExtras = fixtureCatalog ? `<section class="gu-popular"><div class="gu-section-title"><h2>Popular Categories</h2><a href="${base}/searchresults">Shop all →</a></div><div class="gu-discoveries">${discoveries.map(([title,url,photo])=>`<a href="${base}${url}">${productPhoto(photo,title)}<h3>${title}</h3><span>Shop all →</span></a>`).join('')}</div></section>
  ${section('Level up your PC setup',products.filter(p=>p.departments.includes('pc-gaming')),base+'/pc-gaming')}
  ${section('Great finds under £30',products.filter(p=>p.campaigns.includes('under-30')&&!p.keywords.includes('gta')),base+'/campaign/under-30')}` : ''
  return `<section class="gu-circles" aria-label="Shop by category">${SHORTCUTS.map(([name,url],i)=>`<a href="${base}${url}"><span class="gu-circle gu-circle-${i}">${i===0&&gta[0]?artwork(gta[0]):SHORTCUT_ICON[name]}</span><span>${esc(name)}</span></a>`).join('')}</section>
  <section class="gu-hero" aria-labelledby="gu-hero-title"><div class="gu-hero-copy"><p class="gu-hero-kicker">PRE-ORDER NOW</p><h1 id="gu-hero-title">Coming Soon</h1><p>Be first in line for the biggest upcoming releases on PlayStation and Xbox.</p><a class="gu-btn gu-btn-black" href="${base}/coming-soon">Shop Now</a></div><div class="gu-hero-covers" aria-hidden="true">${gta.slice(0,2).map(p=>productImage('game-uk',p)).join('')}</div></section>
  ${comingSoon}
  <section class="gu-gifts-panel"><div><h2>Gifts For Gamers</h2><p>Find their next game, console or favourite accessory.</p></div><div class="gu-campaign-links"><a class="gu-btn" href="${base}/games">Games</a><a class="gu-btn" href="${base}/playstation">PS5</a><a class="gu-btn" href="${base}/xbox/all-xbox">XBOX</a><a class="gu-btn" href="${base}/nintendo">Switch</a></div></section>
  <section class="gu-fplus"><div><b>FRASERS<span>PLUS</span></b><h2>SPREAD THE COST OF GIFTING*</h2><p>Buy now. Pay in 3, interest free.</p><small>Representative APR 29.9% (variable). Credit subject to status. Terms apply.</small></div><a class="gu-btn gu-btn-light" href="${base}/frasersplus">Find out more</a></section>
  <section class="gu-trending" data-home-row="trending"><div class="gu-section-title"><h2>Trending</h2><a href="${base}/coming-soon">Shop all →</a></div><div class="gu-grid gu-shelf">${trending.map(p=>tile(base,p,base+'/')).join('')}</div></section>
  <section class="gu-gift-shop"><div class="gu-section-title"><h2>Gift Shop</h2><a href="${base}/gifts">Shop all gifts →</a></div><div class="gu-cat-grid">${GIFT_SHOP.map(([l,u,d],i)=>`<a class="gu-cat-tile gu-tone-${i%6}" href="${base}${u}"><span class="gu-cat-mark" aria-hidden="true">${tileIcon(l)}</span><span>${esc(l)}</span><small>${esc(d)}</small></a>`).join('')}</div></section>
  ${shelfRows}
  ${fixtureExtras}`
}

export function searchPage({ base, q='', products, facetProducts=products, filters = {}, sort = 'popular', hideFilters = false, page=1, route='/searchresults', heading='Search Results', intro='', department=null, landing=null }) {
  if (landing) { heading = landing.h1 || heading; intro = landing.intro ?? intro }
  const f=facets(facetProducts), size=12, pages=Math.max(1,Math.ceil(products.length/size)), current=Math.min(Math.max(1,page),pages)
  const url=(over={})=>{const params={descriptionfilter:q,...filters,sort:sort==='popular'?null:sort,hidefilters:hideFilters?'1':null,...over};return `${base}${route}?${Object.entries(params).filter(([,v])=>v).map(([k,v])=>`${k}=${encodeURIComponent(v)}`).join('&')}`}
  const here=url({page:current}), keys=['platform','brand','age','category','style','price','availability']
  const facetLink=(key,val,n)=>`<a class="gu-facet${filters[key]===val?' is-active':''}" ${filters[key]===val?'aria-current="true"':''} href="${esc(url({[key]:filters[key]===val?null:val}))}">${esc(val)} <span>(${n})</span></a>`
  const active=Object.entries(filters).filter(([k,v])=>keys.includes(k)&&v)
  // Only list filter groups that have options; a Style group that repeats Category word for word is left out.
  const sameKeys=(a,b)=>JSON.stringify(Object.entries(a||{}).filter(([,n])=>n).sort())===JSON.stringify(Object.entries(b||{}).filter(([,n])=>n).sort())
  const facetKeys=keys.filter(key=>filters[key]||(key==='price'?f.price.some(b=>b.n):Object.values(f[key]||{}).some(n=>n))&&!(key==='style'&&sameKeys(f.style,f.category)))
  const reset=Object.fromEntries(keys.map(k=>[k,null]))
  const pageLinks=()=>`<nav class="gu-pagination" aria-label="Results pages">${Array.from({length:pages},(_,i)=>`<a href="${esc(url({page:i+1}))}" ${i+1===current?'aria-current="page"':''}>${i+1}</a>`).join('')}</nav>`
  const crumbs=(landing?.crumbs||(department&&heading!==department.title?[[department.title,'/'+department.id]]:[])).map(([l,u])=>`<a href="${base}${u}">${esc(l)}</a> / `).join('')
  const tiles=landing?.tiles?.length?`<section class="gu-cat-tiles" aria-label="${esc(landing.tilesHeading||'Shop by Category')}">${landing.tilesHeading?`<h2>${esc(landing.tilesHeading)}</h2>`:''}<div class="gu-cat-grid">${landing.tiles.map(([l,u],i)=>`<a class="gu-cat-tile gu-tone-${i%6}" href="${base}${u}"><span class="gu-cat-mark" aria-hidden="true">${tileIcon(l)}</span><span>${esc(l)}</span></a>`).join('')}</div></section>`:''
  const section=landing?.section?.length?`<nav class="gu-in-section" aria-label="In This Section"><h3>In This Section</h3>${landing.section.map(([l,u])=>`<a href="${base}${u}">${esc(l)}</a>`).join('')}</nav>`:''
  return `<div class="gu-search-page"><nav class="gu-crumbs" aria-label="Breadcrumb"><a href="${base}/">Home</a> / ${crumbs}<span>${esc(heading)}</span></nav><h1>${esc(heading)}</h1>${landing?.h2?`<h2 class="gu-landing-h2">${esc(landing.h2)}</h2>`:''}${intro?`<p class="gu-intro">${esc(intro)}</p>`:''}
  ${tiles}
  ${department&&!landing?.tiles?`<div class="gu-chips">${department.categories.map(c=>`<a href="${base}/${department.id}/${categorySlug(c)}"${c===heading?' class="is-active" aria-current="page"':''}>${esc(c)}</a>`).join('')}</div>`:''}
  <p class="gu-found">We found ${products.length} product${products.length===1?'':'s'}${route==='/searchresults'?` for ${esc(q)}`:''}</p>
  ${active.length?`<p class="gu-active-filters">Filtered by ${active.map(([k,v])=>`${esc(k)}: <b>${esc(v)}</b> <a aria-label="Remove ${esc(k)} filter" href="${esc(url({[k]:null}))}">×</a>`).join(', ')} · <a href="${esc(url(reset))}">Clear filters</a></p>`:''}
  <div class="gu-toolbar"><a class="gu-link-btn" href="${esc(url({hidefilters:hideFilters?null:'1',page:current}))}">${hideFilters?'Show Filters':'Hide Filters'}</a><span>${products.length} Products · Page ${current} of ${pages}</span><details class="gu-sort"><summary>Sort By</summary><ul>${SORTS.map(s=>`<li><a class="gu-sort-opt${s.key===sort?' is-active':''}" href="${esc(url({sort:s.key}))}"${s.key===sort?' aria-current="true"':''}>${esc(s.label)}</a></li>`).join('')}</ul></details></div>
  <div class="gu-search-body${hideFilters?' gu-no-facets':''}"><aside class="gu-facets"${hideFilters?' hidden':''}>${section}<h3 class="gu-filter-by">Filter By</h3>${!facetProducts.length&&landing?'<p class="gu-fine">No filters available</p>':facetKeys.map(key=>`<details open><summary>${({age:'Age Rating',availability:'Availability'})[key]||key[0].toUpperCase()+key.slice(1)}</summary>${key==='price'?f.price.map(b=>facetLink(key,b.label,b.n)).join(''):Object.entries(f[key]).filter(([,n])=>n).map(([v,n])=>facetLink(key,v,n)).join('')||'<span class="gu-fine">None</span>'}</details>`).join('')}</aside>
  <div><h2 class="gu-available">Available Products</h2>${products.length?`<div class="gu-grid">${products.slice((current-1)*size,current*size).map(p=>tile(base,p,here)).join('')}</div>${pageLinks()}`:`${landing&&!active.length?`<div class="gu-empty"><h2>0 Products</h2><p>There are currently no products available in ${esc(heading)}.</p><p>Browse <a href="${base}/coming-soon">Coming Soon</a> or <a href="${base}/gaming">Consoles &amp; Video Games</a>.</p></div>`:`<div class="gu-empty"><h2>No matching products</h2><p>Try another search term or <a href="${esc(url(reset))}">clear your filters</a>.</p><p>Popular searches: ${['Nintendo','LEGO','headset','monitor'].map(x=>`<a href="${searchHref(base,x)}">${x}</a>`).join(' · ')}</p><a href="${base}/gaming">Browse gaming</a></div>`}`}</div></div>${landing?.editorial?`<section class="gu-editorial"><h2>${esc(heading)}</h2><p>${esc(landing.editorial)}</p></section>`:''}${department&&landing?.tiles?`<div class="gu-chips" aria-label="More in ${esc(department.title)}">${department.categories.map(c=>`<a href="${base}/${department.id}/${categorySlug(c)}"${c===heading?' class="is-active" aria-current="page"':''}>${esc(c)}</a>`).join('')}</div>`:''}</div>`
}

export function productPage({ base, p, modal = null, qty = 1, wished = false, option = '', error = '' }) {
  const original = p
  p = selectedProduct(p,option) || p
  const related = CATALOG.filter(x=>x.id!==p.id && x.family!==p.family && x.departments.some(d=>p.departments.includes(d))).sort((a,b)=>Number(b.category===p.category)-Number(a.category===p.category)).slice(0,4)
  const path = productPath(base, p)
  const isGame = p.kind === 'game'
  const hidden = (n, v) => `<input type="hidden" name="${n}" value="${esc(v)}">`
  // The real flow: "Pre-order now" opens a Pre-order modal, "Add to bag" then opens the PEGI-18
  // Age Verification modal, and only "I'm Old Enough" actually adds. Each modal is a server-rendered
  // state (?preorder=1 / ?agecheck=1) so the whole sequence works without JavaScript.
  const addForm = (label, cls) => p.pegi >= 18
    ? `<form method="get" action="${path}">${hidden('agecheck', '1')}${hidden('qty', qty)}${hidden('option',option)}<button class="${cls}" type="submit">${label}</button></form>`
    : `<form method="post" action="${base}/cart/add">${hidden('pid', p.id)}${hidden('qty', qty)}${hidden('option',option)}<button class="${cls}" type="submit">${label}</button></form>`
  let modalHtml = ''
  if (modal === 'preorder') {
    modalHtml = `<div class="gu-modal-backdrop"><div class="gu-modal" role="dialog" aria-labelledby="modal-title">
  <div class="gu-modal-head"><h2 id="modal-title">Pre-order</h2><a class="gu-modal-close" href="${path}" aria-label="Close">&times;</a></div>
  <div class="gu-modal-body">${productImage('game-uk',p)}<div><p>${PREORDER_NOTICE_1}</p><p><b>${p.releaseText||RELEASE_TEXT}</b></p><p>${PREORDER_NOTICE_2}</p></div></div>
  <div class="gu-modal-foot"><a class="gu-btn gu-btn-black" href="${path}">Cancel</a>${addForm('Add to bag', 'gu-btn')}</div>
</div></div>`
  } else if (modal === 'age') {
    modalHtml = `<div class="gu-modal-backdrop"><div class="gu-modal gu-modal-sm" role="dialog" aria-labelledby="modal-title">
  <div class="gu-modal-head"><h2 id="modal-title">Age Verification</h2><a class="gu-modal-close" href="${path}" aria-label="Close">&times;</a></div>
  <div class="gu-modal-body"><p>You must be 18 years old or older to purchase this item.</p></div>
  <div class="gu-modal-foot gu-modal-foot-stack"><form method="post" action="${base}/cart/add">${hidden('pid', p.id)}${hidden('qty', qty)}${hidden('option',option)}${hidden('age_confirmed', '1')}<button class="gu-btn gu-btn-block" type="submit">I'm Old Enough</button></form><a class="gu-link" href="${path}">Cancel</a></div>
</div></div>`
  }
  // Primary CTA: pre-order items open the Pre-order modal, 18-rated stock items the age gate, anything else adds directly.
  const cta = p.preorder
    ? { method: 'get', action: path, hidden: hidden('preorder', '1'), label: 'Pre-order now' }
    : p.pegi >= 18 ? { method: 'get', action: path, hidden: hidden('agecheck', '1'), label: 'Add to bag' }
      : { method: 'post', action: `${base}/cart/add`, hidden: hidden('pid', p.id), label: 'Add to bag' }
  const crumbs = [`<a href="${base}/">Home</a>`, ...p.departments.slice(0,1).map(d=>`<a href="${base}/${d}">${esc(DEPARTMENTS.find(x=>x.id===d).title)}</a>`), `<a href="${base}/brands/${categorySlug(p.brand)}">${esc(p.brand)}</a>`, `<span>${esc(p.brand)} ${esc(p.title)}</span>`]
  const deliveryList = PDP_DELIVERY_ORDER.map(id => DELIVERY_METHODS[id]).map(m => `<li><b>${esc(m.name)}</b><span>${esc(m.detail)}</span><b>${gbp(m.price)}</b></li>`).join('')
  const collectLine = !p.collect ? '' : `<li><b>${esc(DELIVERY_METHODS.collect.name)}</b><span>Delivered to your chosen store within 3 - 14 days.</span><b>${gbp(DELIVERY_METHODS.collect.price)}</b></li>`
  return `${modalHtml}
<nav class="gu-crumbs" aria-label="Breadcrumb">${crumbs.join(' / ')}</nav>
<div class="gu-pdp">
  <div class="gu-gallery">${productGallery('game-uk',{...p,variantId:p.option})}</div>
  <div class="gu-buybox">
    <div class="gu-badges gu-badges-buy">${p.badges.map(b => `<span class="gu-flag">${esc(b)}</span>`).join('')}</div>
    <div class="gu-brand">${esc(p.brand)}</div>
    <div class="gu-title-row"><h1>${esc(p.title)}</h1>
      <form method="post" action="${base}/wishlist/add" class="gu-heart-form"><input type="hidden" name="pid" value="${p.id}"><input type="hidden" name="back" value="${esc(path)}"><input type="hidden" name="option" value="${esc(option)}"><button type="submit" aria-label="Add to wish list" title="Add to wish list">${ICON.heart}</button></form>
      <button class="gu-share" type="button" id="gu-share" title="Copy link" aria-label="Copy link">${ICON.share}</button><span id="gu-share-result" role="status"></span></div>
    ${wished ? '<p class="gu-notice">Added to your wish list for this browser session.</p>' : ''}
    ${error?`<p class="gu-error" role="alert">${esc(error)}</p>`:''}<div class="gu-price">${gbp(p.price)}${p.ticketPrice > p.price ? ` <s>${gbp(p.ticketPrice)}</s>` : ''}</div>
    <form method="${cta.method}" action="${cta.action}" class="gu-buy-form" id="gu-buy-form">
      <div class="gu-format"><span class="gu-label">${p.kind==='game'||p.category==='Video Games'?'Format:':esc(variantLabel(p))+':'}</span> <span class="gu-swatch is-selected" aria-current="true">${esc(original.options&&!option?'Choose an option':p.swatch)}</span></div>
      ${original.options?`<label for="option">${esc(p.optionLabel)} <span aria-hidden="true">*</span></label><select id="option" name="option" required><option value="">Choose ${esc(p.optionLabel.toLowerCase())}</option>${original.options.map(v=>`<option value="${v.id}" ${option===v.id?'selected':''} ${!v.stock?'disabled':''}>${esc(v.label)} — ${gbp(v.price)}${!v.stock?' — Out of stock':''}</option>`).join('')}</select><button id="gu-option-preview" class="gu-link-btn" type="submit" formaction="${path}" formmethod="get">Update selection</button>`:''}
      <p class="gu-stock${p.stock>0&&p.stock<10?' gu-low-stock':''}">${scenarioStockFor(p,'shipping')===0 ? (scenarioStockFor(p,'pickup')>0?'Shipping unavailable. Pickup available at '+esc(BENCHMARK_COLLECT_STORE)+'.':'Unavailable: shipping and pickup are no longer available.') : p.catalogEvidence ? 'Available to pre-order' : p.stock?`${p.preorder?'Available to pre-order':p.stock<10?'Running low':'In stock'} · ${p.stock} available`:'Out of stock'}</p>
      <div class="gu-qty"><button type="button" class="gu-qty-btn" data-step="-1" aria-label="Reduce quantity">&minus;</button><label for="qty" class="visually-hidden">Quantity</label><input id="qty" name="qty" type="number" min="1" max="${Math.min(MAX_QTY,quantityLimit(p))}" value="${qty}" inputmode="numeric"><button type="button" class="gu-qty-btn" data-step="1" aria-label="Increase quantity">+</button></div>
      ${cta.hidden}
      <button class="gu-btn gu-btn-block gu-cta" type="submit" ${modal||!quantityLimit(p) ? 'disabled' : ''}>${!quantityLimit(p)?'Out of stock':modal ? 'Adding...' : cta.label}</button>
    </form>
    <script>document.getElementById('gu-share').addEventListener('click',async function(){var result=document.getElementById('gu-share-result');try{await navigator.clipboard.writeText(location.origin+${JSON.stringify(path+(option?'?option='+encodeURIComponent(option):''))});result.textContent='Link copied'}catch(e){result.textContent='Copy this address: '+location.origin+${JSON.stringify(path+(option?'?option='+encodeURIComponent(option):''))}}});${original.options?`document.getElementById('option').addEventListener('change',function(){document.getElementById('gu-buy-form').requestSubmit(document.getElementById('gu-option-preview'))})`:''}</script>
    ${p.preorder ? `<div class="gu-countdown"><b>Release Date: ${p.releaseShort||RELEASE_SHORT}</b><span>${countdown(Date.now(), p.release||undefined) ?? 'Out now'}</span></div>` : ''}
    ${p.pegi ? `<p class="gu-pegi-line"><b>Pegi Rating:</b> Suitable for people aged ${p.pegi} and over. <a href="${informationHref(base, 'Read More...')}">Read More...</a></p>` : ''}
  </div>
  <div class="gu-pdp-info">
    <details class="gu-acc" open><summary>Description</summary><div class="gu-acc-body">
      ${p.preorder ? `<p class="gu-preorder-info">${ICON.info}<span>${PREORDER_NOTICE_1} <b>${p.releaseText||RELEASE_TEXT}</b>. ${PREORDER_NOTICE_2}</span></p>` : ''}
      <p>Product code: ${esc(p.id)}</p>
      <p><b>${esc(p.title)}</b></p>
      ${p.description.map(d => `<p>${esc(d)}</p>`).join('')}
      <dl class="gu-specs">${Object.entries(p.specs).map(([k,v])=>`<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>
      ${isGame ? `<p class="gu-legal">${esc(LEGAL_TEXT)}</p>` : ''}
    </div></details>
    <details class="gu-acc"><summary>Delivery &amp; Returns</summary><div class="gu-acc-body">
      <ul class="gu-delivery-list">${p.digital?`<li><b>Email delivery</b><span>UK redemption code. Check account region and compatibility before purchase.</span><b>Free</b></li>`:deliveryList}${collectLine}</ul>
      ${p.benchmarkPickup ? '<p class="gu-fine">Click &amp; Collect for this pre-order is available at '+esc(BENCHMARK_COLLECT_STORE)+' only.</p>' : p.preorder ? `<p class="gu-fine">Click &amp; Collect is not available for pre-order items. Pre-orders are dispatched via Express Delivery the day before the launch date.</p>` : ''}
      <p class="gu-fine">Returns: unwanted items can be returned within 28 days of delivery. Sealed software and digital codes cannot be returned once opened or redeemed.</p>
    </div></details>
  </div>
</div>
<section class="gu-related"><h2>You may also like</h2><div class="gu-grid">${related.map(x=>tile(base,x,path)).join('')}</div></section>
${modal ? '' : `<div class="gu-sticky" hidden><div class="gu-sticky-inner"><span>${esc(p.title)}</span><b>${gbp(p.price)}</b><button class="gu-btn" type="submit" form="gu-buy-form"${!quantityLimit(p)?' disabled':''}>${!quantityLimit(p)?'Out of stock':cta.label}</button></div></div>
<script>
// The real PDP shows a sticky "title / price / CTA" bar once the buy button scrolls out of view.
(function(){var bar=document.querySelector('.gu-sticky'),cta=document.querySelector('.gu-cta');if(!bar||!cta||!('IntersectionObserver' in window))return;
  new IntersectionObserver(function(e){bar.hidden=e[0].isIntersecting||e[0].boundingClientRect.top>0}).observe(cta)})();
</script>`}`
}

// ---- bag ----
export function cartPage({ base, t, notice = null }) {
  if (!t.lines.length) {
    return `<div class="gu-cart-empty">${notice ? `<p class="gu-notice">${esc(notice)}</p>` : ''}<h1>Your Bag Is Empty</h1><div class="gu-empty-icon">${ICON.bag}</div><p>We'll hold your bag for 30 days.</p><p>Sign in or register to sync your bag to any device.</p><p><a href="${base}/wishlist">View saved items</a> · <a href="${base}/recently-viewed">Recently viewed</a></p><a class="gu-btn" href="${base}/login?returnurl=cart">Sign In</a></div>`
  }
  const rows = t.lines.map(l => `<div class="gu-line">
  <a href="${productHref(base, l.product)}">${artwork(l.product)}</a>
  <div class="gu-line-info">
    <div class="gu-brand">${esc(l.product.brand)}</div>
    <a class="gu-line-name" href="${productHref(base, l.product)}">${esc(l.product.title)}</a>
    <div class="gu-fine">${esc(variantLabel(l.product))}: ${esc(l.product.swatch)}</div>
    ${scenarioStockFor(l.product,'shipping')===0?`<p class="gu-cart-availability" role="status">Shipping unavailable. ${scenarioStockFor(l.product,'pickup')>0?'Pickup available at '+esc(BENCHMARK_COLLECT_STORE)+'. Choose Click &amp; Collect during checkout.':'Unavailable: this item cannot be purchased for shipping or pickup.'}</p>`:''}
    <form method="post" action="${base}/cart/update" class="gu-line-actions"><input type="hidden" name="line" value="${l.line}">
      <span class="gu-qty"><button type="submit" name="action" value="dec" aria-label="Reduce quantity">&minus;</button><span>${l.qty}</span><button type="submit" name="action" value="inc" aria-label="Increase quantity">+</button></span>
      <span>Price: <b>${gbp(l.product.price)}</b></span><span>Total: <b>${gbp(l.product.price * l.qty)}</b></span>
      <button type="submit" name="action" value="remove" class="gu-link-btn">Remove</button><button type="submit" name="action" value="wishlist" class="gu-link-btn">Move to wish list</button>
    </form>
    <p class="gu-fine">${l.product.digital ? 'This product is a digital code and will be delivered by email.' : `This product will be delivered by ${esc(l.product.carrier)}, and may arrive separately to other items in your basket.`}</p>
    ${l.product.preorder ? `<p class="gu-fine gu-preorder-info">${ICON.info} Pre-order: available for delivery from ${l.product.releaseText||RELEASE_TEXT}. Your entire order will be held until all items are available.</p>` : ''}
  </div>
</div>`).join('')
  return `<div class="gu-cart">
  <div class="gu-cart-main"><h1>My Bag</h1><p><a href="${base}/wishlist">View saved items</a> · <a href="${base}/recently-viewed">Recently viewed</a></p>${notice ? `<p class="gu-notice">${esc(notice)}</p>` : ''}${rows}<p class="gu-hurry">Hurry! Items in bag aren't reserved! Don't miss out and checkout now!</p></div>
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

// ---- sign in or register (stands in for auth.game.co.uk) ----
function authShell(base, inner) {
  return `<div class="gu-auth">
  <div class="gu-benefits"><div>${ICON.userBig}<span>Personalised experience</span></div><div>${ICON.bolt}<span>Speedy checkout</span></div><div>${ICON.tag}<span>Offers and promotions</span></div></div>
  <div class="gu-auth-box">${inner}</div>
  <p class="gu-recaptcha">Protected by reCAPTCHA &middot; <a href="${informationHref(base, 'Privacy')}">Privacy</a> &middot; <a href="${informationHref(base, 'Terms')}">Terms</a></p>
</div>`
}

export function authEmailPage({ base, returnUrl, email = '', error = null }) {
  return authShell(base, `<h1>Sign in or register</h1>
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
  return authShell(base, `<h1>Welcome back</h1>
    <p class="gu-fine">${esc(email)} <a href="${change}">Change</a></p>
    ${error ? `<p class="gu-error" role="alert">${esc(error)}</p>` : ''}
    <form method="post" action="${base}/account/login"><input type="hidden" name="returnUrl" value="${esc(returnUrl)}"><input type="hidden" name="action" value="signin"><input type="hidden" name="email" value="${esc(email)}">
      <label for="password">Password</label><input id="password" name="password" type="password" autocomplete="current-password" required>
      <button class="gu-btn gu-btn-block" type="submit">Continue securely</button>
      <a class="gu-fine gu-forgot" href="${informationHref(base, 'Forgotten your password?')}">Forgotten your password?</a>
    </form>
    <div class="gu-or">or</div>
    <form method="post" action="${base}/account/login"><input type="hidden" name="returnUrl" value="${esc(returnUrl)}"><input type="hidden" name="action" value="guest"><input type="hidden" name="email" value="${esc(email)}"><button class="gu-btn gu-btn-black gu-btn-block" type="submit">Continue as guest</button></form>`)
}

export function authRegisterPage({ base, returnUrl, email, values = {}, errors = {} }) {
  const change = `${base}/account/login?returnUrl=${encodeURIComponent(returnUrl)}`
  const f = (name, label, type, extra) => `<label for="${name}">${label}</label><input id="${name}" name="${name}" type="${type}" value="${esc(values[name] ?? '')}" ${extra}>${errors[name] ? `<span class="gu-error">${esc(errors[name])}</span>` : ''}`
  return authShell(base, `<h1>Create an account</h1>
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
const summaryLines = (t) => t.lines.map(l => `<div class="gu-sum-item">${artwork(l.product)}<div><div class="gu-brand">${esc(l.product.brand)}</div>${esc(l.product.title)}<div class="gu-fine">${esc(variantLabel(l.product))}: ${esc(l.product.swatch)} &middot; Qty ${l.qty}</div></div><b>${gbp(l.product.price * l.qty)}</b></div>`).join('')

export function deliveryPage({ base, t, email, guest, preorderInBag, values = {}, errors = {} }) {
  const input = fieldFactory(values, errors)
  const method = Object.hasOwn(DELIVERY_METHODS,values.deliveryMethod) ? values.deliveryMethod : t.lines.every(l=>l.product.digital)?'email':'standard'
  const allDigital=t.lines.every(l=>l.product.digital), canCollect=t.lines.every(l=>l.product.collect&&scenarioStockFor(l.product,'pickup')!==0)
  const canShip=t.lines.every(l=>scenarioStockFor(l.product,'shipping')!==0), benchmarkCollection=t.lines.some(l=>l.product.benchmarkPickup)
  const radios = (allDigital?['email']:CHECKOUT_DELIVERY_ORDER).map(id => {
    const m = DELIVERY_METHODS[id]
    const disabled = id === 'collect' ? !canCollect : !canShip
    return `<label class="gu-radio gu-ship${disabled ? ' is-disabled' : ''}"><input type="radio" name="deliveryMethod" value="${id}" data-price="${m.price}" ${method === id ? 'checked' : ''} ${disabled ? 'disabled' : ''}><span class="gu-ship-name"><b>${esc(m.name)}</b> <span class="gu-fine">${esc(m.detail)}</span>${disabled ? `<span class="gu-fine gu-unavailable">${id!=='collect'?'Shipping unavailable':preorderInBag?'Not available for pre-order items':'Not available for these items'}</span>` : ''}</span><b class="gu-ship-price">${gbp(m.price)}</b></label>`
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
      ${benchmarkCollection ? '<p class="gu-notice">Click &amp; Collect for this pre-order is available only at GAME London - Sports Direct, Oxford Street.</p>' : preorderInBag ? `<p class="gu-preorder-info">${ICON.info} Your bag contains a pre-order item. Your whole order will be held and dispatched via Express Delivery the day before the launch date (${DISPATCH_TEXT}).</p>` : ''}
      ${radios}
      <div class="gu-field gu-collect-store"><label for="collectStore">Collection store</label><select id="collectStore" name="collectStore" ${!canCollect ? 'disabled' : ''}><option value="">Select a store</option>${COLLECT_STORES.map(s => `<option value="${esc(s)}" ${values.collectStore === s ? 'selected' : ''} ${benchmarkCollection&&s!==BENCHMARK_COLLECT_STORE?'disabled':''}>${esc(s)}${benchmarkCollection&&s!==BENCHMARK_COLLECT_STORE?' — Unavailable':''}</option>`).join('')}</select>${errors.collectStore ? `<span class="gu-error">${esc(errors.collectStore)}</span>` : ''}
      ${benchmarkCollection?`<h3>Pickup person</h3><p class="gu-fine">Name the person authorized to collect this order.</p><div class="gu-2col">${input('pickupFirstName','Pickup first name',{required:true})}${input('pickupLastName','Pickup last name',{required:true})}</div>${input('pickupEmail','Pickup email',{type:'email',required:true})}${input('pickupPhone','Pickup phone',{type:'tel',required:true})}`:''}</div>
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

export function paymentPage({ base, t, delivery, preorderInBag, values = {}, errors = {}, reviewToken = '' }) {
  const input = fieldFactory(values, errors)
  const pm = values.paymentMethod || 'card'
  const m = DELIVERY_METHODS[delivery.deliveryMethod]
  const a = delivery
  // ASSUMPTION: Apple Pay and Frasers Plus are shown (GAME accepts both) but cannot be used here;
  // the research does not say whether Frasers Plus takes pre-orders, so it is marked unavailable.
  return `<div class="gu-checkout">
  <form method="post" action="${base}/checkout/payment" class="gu-co-form" novalidate><input type="hidden" name="review_token" value="${esc(reviewToken)}">
    ${steps(2)}
    <h1>Payment</h1>
    ${errorSummary(errors)}
    <section class="gu-co-section"><h2>How would you like to pay?</h2>
      <div class="gu-paytabs">
        <label class="gu-paytab"><input type="radio" name="paymentMethod" value="card" ${pm === 'card' ? 'checked' : ''}><span><b>Credit/Debit card</b><small>VISA, VISA Debit, Mastercard, Maestro</small></span></label>
        <label class="gu-paytab is-disabled"><input type="radio" name="paymentMethod" value="applepay" disabled><span><b>Apple Pay</b><small>Available in Safari on a supported iPhone, iPad or Mac</small></span></label>
        <label class="gu-paytab is-disabled"><input type="radio" name="paymentMethod" value="frasersplus" disabled><span><b>Frasers Plus</b><small>Buy now, Pay in 3, interest free. Representative APR 29.9% (Variable). Credit subject to status. Not available for this order.</small></span></label>
        <label class="gu-paytab${preorderInBag ? ' is-disabled' : ''}"><input type="radio" name="paymentMethod" value="paypal" ${pm === 'paypal' ? 'checked' : ''} ${preorderInBag ? 'disabled' : ''}><span><b>PayPal</b><small>${preorderInBag ? 'PayPal is not available for pre-orders.' : 'Pay with your PayPal account.'}</small></span></label>
      </div>
      <div class="gu-paypanel" data-panel="card">
        ${input('cardNumber', 'Card number', { extra: 'autocomplete="cc-number" inputmode="numeric" placeholder="0000 0000 0000 0000"', required: true })}
        <div class="gu-2col">${input('expiry', 'Expiry date (MM/YY)', { extra: 'autocomplete="cc-exp" placeholder="MM/YY"', required: true })}${input('cvv', 'Security code (CVV)', { extra: 'autocomplete="cc-csc" inputmode="numeric" maxlength="4"', required: true })}</div>
        ${input('nameOnCard', 'Name on card', { extra: 'autocomplete="cc-name"', required: true })}
        <p class="gu-fine">${ICON.lock} Your payment details are encrypted and sent securely.</p>${publicNotice('<p class="gu-fine">This is not the real GAME website. Use test card details only: no card is charged and no bank authorisation or 3D Secure authentication is performed.</p>')}
      </div>
      <div class="gu-paypanel" data-panel="paypal"><p>Pay with PayPal when you place your order.</p>${publicNotice('<p>This is not the real GAME website: no PayPal sign-in, redirect or payment takes place.</p>')}</div>
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
    <p class="gu-fine">On receipt of your order, an authorisation will be created on your account. This will show on your bank statement as a reservation of funds which allocates the money to your order but will not be taken until your order has been picked and processed.${preorderInBag?' Pre-orders are held and dispatched via Express Delivery the day before the launch date.':''}</p>
    <button class="gu-btn gu-btn-block" type="submit">Pay now</button>
    <p class="gu-fine">By clicking Pay now you agree to GAME's Terms &amp; Conditions and Privacy Policy.${preorderInBag?' It is not possible to amend a pre-order once placed.':''}</p>
  </form>
  <aside class="gu-summary">
    <h2>Order summary</h2>${summaryLines(t)}
    <h3>Delivery address <a class="gu-fine" href="${base}/checkout/delivery">Edit</a></h3>
    <address>${esc([a.title, a.firstName, a.lastName].filter(Boolean).join(' '))}<br>${esc(a.addressLine1)}${a.addressLine2 ? `<br>${esc(a.addressLine2)}` : ''}<br>${esc(a.town)}${a.county ? `, ${esc(a.county)}` : ''}<br>${esc(a.postcode)}<br>United Kingdom<br>${esc(a.mobile)}</address>
    <h3>Delivery method</h3>
    <p>${esc(m.name)} &middot; ${esc(m.eta)}${a.collectStore ? `<br><span class="gu-fine">${esc(a.collectStore)}</span>` : ''}</p>
    ${a.pickupFirstName?`<h3>Pickup person</h3><p>${esc(a.pickupFirstName+' '+a.pickupLastName)}<br>${esc(a.pickupEmail)}<br>${esc(a.pickupPhone)}</p>`:''}
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
      <table class="gu-table"><thead><tr><th>Item</th><th>Qty</th><th>Price</th></tr></thead><tbody>${order.items.map((it,index) => {
        const source = byId(it.sku)
        const chosen = order.meta.options?.[index]
        const p = selectedProduct(source,chosen?.option) || source
        return `<tr><td>${p ? `<div class="gu-brand">${esc(p.brand)}</div>` : ''}${esc(it.title)}${p ? `<div class="gu-fine">${esc(variantLabel(p))}: ${esc(p.swatch)}${p.kind==='game'?' &middot; Size: One Size':''} &middot; Product code: ${esc(p.id)}</div>` : ''}</td><td>${it.qty}</td><td>${gbp(it.unit_price * it.qty)}</td></tr>`
      }).join('')}</tbody></table>
      ${a?`<h2>Delivery address</h2><address>${esc([a.title, a.first_name, a.last_name].filter(Boolean).join(' '))}<br>${esc(a.line1)}${a.line2 ? `<br>${esc(a.line2)}` : ''}<br>${esc(a.city)}${a.state ? `, ${esc(a.state)}` : ''}<br>${esc(a.postal_code)}<br>United Kingdom<br>${esc(a.phone)}</address>`:''}
      ${order.meta.pickup_person?`<h2>Pickup person</h2><p>${esc(order.meta.pickup_person.first_name+' '+order.meta.pickup_person.last_name)}<br>${esc(order.meta.pickup_person.email)}<br>${esc(order.meta.pickup_person.phone)}</p>`:''}
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
      <a class="gu-btn gu-btn-block" href="${base}/">Continue shopping</a><p><a href="${base}/orders/${order.id}">View order details and support</a></p>
    </aside>
  </div>
</div>`
}

export function notFoundPage({ base }) {
  return `<div class="gu-404"><h1>Sorry &ndash; This Page Could Not Be Found</h1><p>You may have entered an incorrect URL or the page you were after no longer exists.</p><p class="gu-404-btns"><a class="gu-btn gu-btn-black" href="${base}/">HOME</a><a class="gu-btn" href="${base}/contact">CONTACT US</a></p></div>`
}

export function simplePage({ title, html }) {
  return `<div class="gu-simple"><h1>${esc(title)}</h1>${html}</div>`
}
