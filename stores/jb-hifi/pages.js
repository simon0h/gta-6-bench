import { fixtureCatalog } from '../../lib/catalog-policy.js'
import { recommendationCarousel } from './reference-recommendations.js'
import { productImage, productGallery } from '../../lib/product-assets.js'
import { orderStatus } from '../../lib/retail-state.js'
import { DEPARTMENT_DEFS, slugify, selectedProduct, lineKey, stockLimit } from './catalog.js'
import { catalogHome, catalogListing, collectionFor } from './browsing.js'
import { siteHeader, siteFooter, siteHome } from './site.js'
import { LISTED } from './data.js'
import { shelfImage, shelfGallery } from './shelf-art.js'
import { DEPARTMENTS as SITE_DEPARTMENTS } from './site-data.js'
import { esc, money, disclaimer } from '../../lib/html.js'
import { byId, productPath, STATES, SHIPPING_METHODS, COURIER_METHOD, PREORDER_BONUS } from './data.js'

const NAME = 'JB Hi-Fi'
const nativeProduct = p => ['903000', '903001'].includes(p?.id)
const nativeCart = t => t.lines.length > 0 && t.lines.every(line => nativeProduct(line.product))

function informationHref(base, label) {
 const text = label.replaceAll('&amp;', '&')
 const routes = {"Mobile Phones":"/collections/mobile-phones","TVs":"/collections/tvs-home-theatre","Computers":"/collections/computers-tablets","Music & Movies":"/collections/music","JB Perks":"/pages/perks","Gift Cards":"/pages/gift-cards","Help Centre":"/pages/help-and-support","Contact us":"/pages/contact-us","Contact":"/pages/contact-us","Live chat":"/pages/contact-us","Call 13 52 44":"/pages/contact-us","Delivery & Collection":"/pages/help-and-support/delivery-and-collection","Returns & Refunds":"/pages/help-and-support/how-do-i-return-faulty-goods","Refund policy":"/pages/help-and-support/how-do-i-return-faulty-goods","Shipping policy":"/pages/help-and-support/what-are-the-delivery-options-for-online-purchases","Privacy policy":"/pages/privacy-policy","Terms of service":"/pages/terms-and-conditions","afterpay":"/pages/help-and-support/afterpay","zip":"/pages/help-and-support/zip","PayPal":"/pages/help-and-support/paypal-pay-in-4"}
 return base + (routes[text] || '/information?topic=' + encodeURIComponent(text))
}
export function supportInformationPage(base, topic = 'Shopping information') {
 const title = String(topic).slice(0,100)
 const q = title.toLowerCase()
 let content
 if (/password|signing in/.test(q)) content = '<p>Password recovery is unavailable in this shop. Sign in using an existing account or continue shopping as a guest where offered.</p>'
 else if (/afterpay|zip|paypal|frasers|gift cards/.test(q)) content = '<p>The payment methods currently available for an order are listed at checkout. Financing applications and new gift-card purchases are unavailable in this shop.</p>'
 else if (/cookie|privacy/.test(q)) content = '<p>This synthetic shop uses a session cookie to keep your basket, account and checkout together. Orders are recorded for the benchmark. Real retailer advertising and tracking services are not connected.</p>'
 else if (/return|refund|cancel/.test(q)) content = '<p>Review the item, format, delivery choice and total before placing your order. Digital redemption codes may have different return conditions from physical products. Post-order returns, refunds and cancellation requests are unavailable in this shop.</p>'
 else if (/delivery|shipping|collection/.test(q)) content = '<p>Product pages show available fulfilment choices. Confirm your address or collection store at checkout to see the order-specific delivery estimate and charges. Pre-orders are fulfilled when available; wait for collection confirmation before visiting a store.</p>'
 else if (/terms/.test(q)) content = '<p>Check product compatibility, quantity, fulfilment and payment details before confirming. This is a synthetic shopping environment: local orders record your selected items without charging a real payment method.</p>'
 else if (/read more/.test(q)) content = '<p>PEGI 18 identifies games intended for adults. You must confirm you are 18 or over before adding this age-rated game to your bag.</p>'
 else if (/edit/.test(q)) content = '<p>Prices are in Australian dollars and include GST.</p>'
 else if (/mobile phones/.test(q)) content = '<p>Mobile phones are not included in this shop’s current catalogue. Browse the available technology and gaming departments instead.</p>'
 else if (/contact|chat|call|help/.test(q)) content = '<p>For order details, use your account or the order confirmation. Live chat and telephone support are unavailable in this shop. Product availability and delivery options are shown on the product page and at checkout.</p>'
 else content = '<p>This service is unavailable in this shop. You can browse products, check availability and complete the supported shopping flows.</p>'
 return `<section><h1>${esc(title)}</h1>${content}<p><a href="${base}/">Continue shopping</a> · <a href="${base}/account/orders">Your account and orders</a></p></section>`
}
// JB prints AUD prices with a plain "$" ("$129.00"); only the checkout total carries an "AUD" prefix.
const aud = (n) => money(n, 'AUD').replace('A$', '$')
// JB's yellow price tag shows whole dollars ("$129"); cents only when there are some ("$36.99").
const tagPrice = (n) => aud(n).replace(/\.00$/, '')

// ---- layout ----
export function layout({ base, title, body, cartCount = 0, user = null, added = null, closeHref = '', checkout = null }) {
  const referenceCheckout = body.includes('jb-reference-checkout')
  const referenceCart = body.includes('jb-reference-cart')
  const reference = body.includes('class="jb-pdp jb-reference-pdp"') || referenceCart
  const header = checkout ? checkoutHeader(base, checkout, referenceCheckout) : siteHeader(base, cartCount, user, reference)
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<link rel="stylesheet" href="${base}/static/style.css"><link rel="stylesheet" href="${base}/static/site.css">${referenceCheckout ? `<link rel="stylesheet" href="${base}/static/checkout-reference.css">` : ''}<script src="${base}/static/site.js" defer></script></head>
<body class="${checkout ? `jb-checkout-body${referenceCheckout ? ' jb-reference-checkout-body' : ''}` : reference ? `jb-reference-page${referenceCart ? ' jb-reference-cart-body' : ''}` : ''}">
${added ? addedModal(base, added, closeHref) : ''}
${header}
<a class="jb-skip" href="#main-content">Skip to content</a><main id="main-content" class="jb-main">${body}</main>
<footer class="jb-footer">
  ${checkout ? `<p class="jb-footer-links"><a href="${informationHref(base, 'Refund policy')}">Refund policy</a> <a href="${informationHref(base, 'Shipping policy')}">Shipping policy</a> <a href="${informationHref(base, 'Privacy policy')}">Privacy policy</a> <a href="${informationHref(base, 'Terms of service')}">Terms of service</a> <a href="${informationHref(base, 'Contact')}">Contact</a></p>` : siteFooter(base)}
  ${disclaimer(NAME)}
</footer>
<a class="jb-chat" href="${base}/pages/contact-us">Chat</a>
</body></html>`
}

function icon(name) {
 const paths={track:'<path d="M4 7h16v13H4zM4 7l8-4 8 4M12 3v8M4 7l8 4 8-4"/>',store:'<path d="M3 9h18l-2-5H5zM5 9v11h14V9M9 20v-7h6v7M2 20h20"/>',user:'<circle cx="12" cy="7" r="4"/><path d="M4 21v-2a8 8 0 0116 0v2z"/>',cart:'<path d="M2 3h3l3 13h11l3-9H6"/><circle cx="9" cy="21" r="1"/><circle cx="18" cy="21" r="1"/>',heart:'<path d="M12 21L3 12C-3 5 6-1 12 6c6-7 15-1 9 6z"/>'}
 return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`
}
function checkoutHeader(base, { steps = [], current }, reference = false) {
  return `<header class="jb-header jb-header-checkout">
  <div class="jb-bar jb-bar-centered"><a class="jb-logo" href="${base}/" aria-label="JB Hi-Fi home">${reference ? '<img class="jb-reference-logo" src="/static/reference/jb-hifi/checkout-logo.png" alt="">' : '<span class="jb-wordmark">JB HI-FI</span><span class="jb-tagline">ALWAYS CHEAP PRICES</span>'}</a></div>
  ${steps.length ? `<nav class="jb-steps" aria-label="Breadcrumb"><ol>${steps.map(s => `<li ${s.id === current ? 'aria-current="step" class="is-current"' : ''}>${s.href && s.id !== current ? `<a href="${s.href}">${esc(s.label)}</a>` : esc(s.label)}</li>`).join('<li class="jb-sep" aria-hidden="true">&rsaquo;</li>')}</ol></nav>` : ''}
</header>`
}

// Full-screen "Item added to your cart!" panel (the ?added= fallback keeps it working without JavaScript).
function addedModal(base, p, closeHref) {
  const actions = `<div class="jb-modal-actions"><a class="jb-btn jb-btn-black" href="${base}/cart">Review cart</a><a class="jb-btn" href="${base}/checkout">Checkout</a></div>`
  if (nativeProduct(p)) return `<div class="jb-modal-backdrop jb-reference-added"><div class="jb-modal" role="dialog" aria-modal="true" aria-labelledby="added-title"><a class="jb-modal-close" href="${closeHref}" aria-label="Close">&times;</a><div class="jb-added-confirmation"><h2 id="added-title"><span aria-hidden="true">●</span> Item added to your cart!</h2><div class="jb-modal-item">${artwork(p)}<div class="jb-modal-name">${esc(p.title)}</div>${actions}</div></div><section class="jb-added-enhance"><h3 class="jb-display">Enhance your product</h3>${p.id === '903001' ? recommendationCarousel(base, 'added', closeHref) : `<div class="jb-carousel">${related(p).map(u => tile(base, u, closeHref)).join('')}</div>`}</section>${actions}</div></div>`
  return `<div class="jb-modal-backdrop"><div class="jb-modal" role="dialog" aria-modal="true" aria-labelledby="added-title">
  <a class="jb-modal-close" href="${closeHref}" aria-label="Close">&times;</a>
  <div class="jb-modal-top"><span class="jb-check" aria-hidden="true">&#10003;</span><h2 id="added-title">Item added to your cart!</h2></div>
  <div class="jb-modal-item">${artwork(p)}<div class="jb-modal-name"><b>${esc(p.title)}</b><div class="jb-subtitle">${esc(p.subtitle)}</div>${optionText(p)}<strong>${aud(p.price)}</strong></div>${actions}</div>
  <h3 class="jb-display">Enhance your product</h3>
  <div class="jb-carousel">${related(p).map(u => tile(base, u, closeHref)).join('')}</div>
  ${actions}
</div></div>`
}

// ---- shared bits ----
function badges(p) { return p.badges.length ? `<div class="jb-badges">${p.badges.map(b => `<span class="jb-badge-tag is-${b.toLowerCase().replace(/[^a-z]+/g, '-')}">${esc(b)}</span>`).join('')}</div>` : '' }
function stars(p) { return p.stars ? `<div class="jb-stars" aria-label="Rated ${p.stars} out of 5 from ${p.reviews} reviews">&#9733;&#9733;&#9733;&#9733;&#9733; <span>${p.stars} (${p.reviews})</span></div>` : '' }
function priceTag(p, big = false) { return `<div class="jb-tag ${big ? 'jb-tag-big' : ''}"><span>${tagPrice(p.price)}</span></div>` }
export function artwork(p,className='') { return p.shelf ? shelfImage(p,{className}) : productImage('jb-hifi',p,{className}) }
const optionText = p => p.variantId ? `<div class="jb-fine">${esc(p.variantLabel)}</div>` : ''
function related(p) {
 if(fixtureCatalog) return LISTED.filter(u=>u.id!==p.id&&u.crumbs[0]===p.crumbs[0]).slice(0,6)
 const pool=LISTED.filter(u=>u.id!==p.id&&u.crumbs[0]===p.crumbs[0]&&u.orderable!==false)
 return [...pool.filter(u=>u.type===p.type),...pool.filter(u=>u.type!==p.type)].slice(0,6)
}
// Department and category links for a product's breadcrumb (all departments in the Products menu).
function crumbHref(base,p,i) {
 const dept=collectionFor(p.crumbs[0])
 if(dept)return `${base}/collections/${dept.slug}${i?'/'+slugify(p.type):''}`
 const site=SITE_DEPARTMENTS.find(d=>d.title===p.crumbs[0])
 return `${base}/collections/${site?.slug||'all'}`
}
const wasPrice=p=>p.ticket&&p.ticket>p.price?`<div class="jb-was"><span class="jb-save">SAVE ${tagPrice(p.ticket-p.price)}</span> <s>${tagPrice(p.ticket)}</s></div>`:''
function ctaForm(base, p, returnTo, block = true) {
  if (p.variants && !p.variantId) return `<a class="jb-btn ${block?'jb-btn-block':''}" href="${productPath(base,p)}">Choose options</a>`
  if (!p.orderable || p.stock === 0) return `<span class="jb-btn jb-btn-grey ${block ? 'jb-btn-block' : ''}" aria-disabled="true">${esc(p.cta)}</span>`
  return `<form method="post" action="${base}/cart/add" class="jb-add-form"><input type="hidden" name="id" value="${p.id}">${p.variantId?`<input type="hidden" name="variant" value="${p.variantId}">`:""}<input type="hidden" name="return" value="${esc(returnTo)}"><button class="jb-btn ${block ? 'jb-btn-block' : ''}" type="submit">${esc(p.cta)}</button></form>`
}

export function tile(base, p, returnTo) {
  const detail=productPath(base,p)+(p.variantId?'?variant='+p.variantId:'')
  return `<article class="jb-tile">
  ${badges(p)}
  <a class="jb-heart" href="${base}/wishlist/add?id=${p.id}${p.variantId?'&variant='+encodeURIComponent(p.variantId):p.variants?'&variant='+encodeURIComponent(p.variants[0].id):''}" aria-label="Add ${esc(p.title)} to wishlist">&#9825;</a>
  <a class="jb-tile-art" href="${detail}">${artwork(p)}</a>
  <h3><a href="${detail}">${esc(p.title)}</a></h3>
  <div class="jb-subtitle">${esc(p.subtitle)}</div>${optionText(p)}
  ${stars(p)}
  ${priceTag(p)}${wasPrice(p)}
  ${p.deliveryFrom ? `<div class="jb-delivery-from">+ DELIVERY FROM ${tagPrice(p.deliveryFrom)}</div>` : ''}
  ${ctaForm(base, p, returnTo)}
</article>`
}

// ---- store pages ----
export function homePage(args) { return siteHome({ base: args.base, tile, artwork, catalogHome: fixtureCatalog ? catalogHome({...args,tile}) : '' }) }
export function searchPage(args) { return catalogListing({...args,tile}) }

export function productPage({ base, p, siblings, availability, stores = [], perks = false, error = '' }) {
  const isGame = p.kind === 'game'
  const reference = ['903000', '903001'].includes(p.id)
  const self = productPath(base, p)+(p.variantId?'?variant='+p.variantId:'')
  const inStore = p.orderable && !p.badges.includes('ONLINE ONLY')
  const preorder = p.cta === 'Pre-order'
  const availPanel = availability && !fixtureCatalog ? `<div class="jb-store-panel"><p>Store pickup availability has not been verified.</p></div>` : availability ? `<div class="jb-store-panel"><div class="jb-store-panel-head"><b>Your store</b> &nbsp;·&nbsp; Click &amp; Collect &nbsp;·&nbsp; Check store availability</div>
    ${inStore ? `<p>Stores near <b>${esc(availability === 'my location' ? 'your location' : availability)}</b>:</p><ul class="jb-store-list">${stores.map(s => `<li><a href="${base}/stores/${s.id}"><b>${esc(s.name)}</b></a><br><span class="jb-fine">${esc(s.address)}</span><br><span class="jb-avail-ok">&#10003; Click &amp; Collect${preorder ? ` — pre-order now, collect from ${esc(p.preloadFrom ?? p.releaseLong)}` : ''}</span></li>`).join('')}</ul>` : `<p class="jb-error">Sorry, there are no in-store options available for this product.</p>`}
    <a class="jb-fine" href="${self}">Close</a></div>` : ''
  const deliveryText = !p.orderable ? (p.cta==='Coming soon'?'Coming soon':'Out of stock') : preorder ? `Available to pre-order${p.preloadFrom ? ` — delivery starts ${esc(p.preloadFrom)}` : ''}` : 'Available for delivery'
  // First product-page visit only: JB Perks popup in the lower left (research step 2). X closes it; it does not come back.
  const perksPopup = perks ? `<aside class="jb-perks" aria-label="JB Perks offer">
  <a class="jb-perks-close" href="${self}" aria-label="Close" onclick="this.parentNode.remove();return false">&times;</a>
  <p class="jb-perks-title">WANT A $10 WELCOME COUPON*?</p>
  <p class="jb-perks-sub">JOIN FOR FREE MEMBER BENEFITS!</p>
  <p class="jb-fine">Valid for 28 days from issue. T&amp;Cs apply.</p>
  <a class="jb-btn jb-btn-block" href="${base}/perks">Explore JB Perks</a><p class="jb-fine">Real coupons are not issued in this shop.</p>
</aside>` : ''
  const referenceDlc = reference ? `<section class="jb-dlc jb-reference-dlc"><h2 class="jb-display">${esc(PREORDER_BONUS.heading)}</h2><img src="/static/reference/jb-hifi/preorder-dlc.jpg" alt="Pre-Order DLC!"><div><h3>${esc(PREORDER_BONUS.title)}</h3><p>${esc(PREORDER_BONUS.text)}</p><p class="jb-fine">${esc(PREORDER_BONUS.ends)}</p></div></section>` : ''
  const variants = siblings.map(s => `<a class="jb-variant ${s.id === p.id ? 'is-selected' : ''}" href="${productPath(base, s)}" aria-current="${s.id === p.id ? 'true' : 'false'}"><b>${esc(s.variantLabel)}</b><span>${tagPrice(s.price)}</span></a>`).join('')
  const crumbs = [`<a href="${base}/">Home</a>`, ...p.crumbs.map((c,i) => `<a href="${crumbHref(base,p,i)}">${esc(c)}</a>`), esc(p.title)].join(' &rsaquo; ')
  // Assortment games list the same title on its other consoles, like JB's "Primary Format - Games" buttons.
  const formats = p.shelf && p.platformName && / games$/.test(p.type) ? LISTED.filter(u=>u.shelf&&u.title===p.title&&/ games$/.test(u.type)) : []
  return `<nav class="jb-crumbs" aria-label="Breadcrumb">${crumbs}</nav>
<div class="jb-pdp${reference ? ' jb-reference-pdp' : ''}">
  <div class="jb-gallery">
    <div class="jb-gallery-top">${isGame ? '<span class="jb-badge-tag is-pre-order-dlc">PRE-ORDER DLC</span>' : ''}<a href="${base}/search?query=${encodeURIComponent(p.title)}" class="jb-fine">Similar items &rsaquo;</a></div>
    ${p.shelf ? shelfGallery(p) : productGallery('jb-hifi',p)}
    ${p.variants?`<div class="jb-gallery-options" aria-label="Product image options">${p.variants.map(v=>`<a href="${productPath(base,p)}?variant=${v.id}" ${v.id===p.variantId?'aria-current="true"':''}>${artwork(selectedProduct(p,v.id))}<span>${esc(v.label)}</span></a>`).join('')}</div>`:''}
    ${referenceDlc}
  </div>
  <div class="jb-buybox">
    ${badges(reference ? { ...p, badges: ['PRE-ORDER'] } : p)}
    ${isGame ? `<div class="jb-platform-logo">${reference ? `<img src="/static/reference/jb-hifi/${p.platform === 'ps5' ? 'ps5' : 'xbox'}-mark.png" alt="${esc(p.platformName)}">` : esc(p.platformName)}</div>` : ''}
    ${reference ? '' : `<a class="jb-brand-label" href="${base}/brands/${slugify(p.brand)}">${esc(p.brand)}</a>`}<h1>${esc(p.title)}</h1>${optionText(p)}${stars(p)}
    <div class="jb-ids">MODEL: ${esc(p.model ?? p.id)} &nbsp; SKU: ${esc(p.id)}${reference ? '' : ` &nbsp; PLU: ${esc(p.model ?? p.id)}`}</div>
    ${reference ? `<div class="jb-tag jb-tag-big"><span><i class="jb-reference-currency">$</i><b class="jb-reference-amount">${esc(tagPrice(p.price).slice(1))}</b></span></div>` : priceTag(p, true)+wasPrice(p)}
    <div class="jb-bnpl"><a href="${informationHref(base, 'afterpay')}" class="jb-bnpl-afterpay">${reference ? '<img src="/static/reference/jb-hifi/bnpl-afterpay.svg" alt="afterpay">' : 'afterpay'}</a><a href="${informationHref(base, 'zip')}" class="jb-bnpl-zip">${reference ? '<img src="/static/reference/jb-hifi/bnpl-zip.svg" alt="zip">' : 'zip'}</a><a href="${informationHref(base, 'PayPal')}" class="jb-bnpl-paypal">${reference ? '<img src="/static/reference/jb-hifi/bnpl-paypal.svg" alt="PayPal">' : 'PayPal'}</a></div>
    <div class="jb-coupon-row">${reference ? '<img class="jb-coupon-smile" src="/static/reference/jb-hifi/coupon-smile.svg" alt="">' : '&#127991;'} <div><a href="${base}/account/login?return_to=${encodeURIComponent(self)}">Log in</a> to see if you have coupons.</div></div>
    ${isGame ? `<div class="jb-variants"><div class="jb-label">Primary Format - Games</div><div class="jb-variant-row">${reference ? '' : `<a class="jb-variant" href="${base}/products/grand-theft-auto-vi-the-goodtime-state-vice-city-collection"><b>The Goodtime State - Vice City Collection</b><span>${tagPrice(699)}</span></a>`}${variants}</div></div>` : ''}
    ${formats.length>1?`<div class="jb-variants"><div class="jb-label">Primary Format - Games</div><div class="jb-variant-row">${formats.map(u=>`<a class="jb-variant ${u.id===p.id?'is-selected':''}" href="${productPath(base,u)}" aria-current="${u.id===p.id}"><b>${esc(u.platformName)}</b><span>${tagPrice(u.price)}</span></a>`).join('')}</div></div>`:''}
    ${p.variants?`<form method="get" action="${productPath(base,p)}" class="jb-option-form"><label for="product-variant">Choose ${Object.keys(p.variants[0].attributes).join(' / ')}<select id="product-variant" name="variant">${p.variants.map(v=>`<option value="${v.id}" ${v.id===p.variantId?'selected':''}>${esc(v.label)} — ${tagPrice(v.price)}${v.stock===0?' · Out of stock':''}</option>`).join('')}</select></label><button class="jb-btn jb-btn-black">Update option</button></form>`:''}
    ${error?`<p class="jb-error" role="alert">${esc(error)}</p>`:''}${reference ? '' : `<p class="jb-fine">Sold by JB Hi-Fi · ${p.orderable&&p.stock>0?'Available to order':'Not currently available'}</p>`}
    <div class="jb-cta-row">${ctaForm(base, p, self, false)}<a class="jb-heart-btn" href="${base}/wishlist/add?id=${p.id}${p.variantId?'&variant='+encodeURIComponent(p.variantId):p.variants?'&variant='+encodeURIComponent(p.variants[0].id):''}" aria-label="Add to wishlist">&#9825;</a></div>
    ${p.notice.length ? `<div class="jb-notice"><span class="jb-notice-icon" aria-hidden="true">!</span><ul>${p.notice.map(n => `<li>${esc(n)}</li>`).join('')}</ul></div>` : ''}
    ${reference ? '<h2 class="jb-display">Description</h2>' : `<h2 class="jb-display">Key features</h2><ul>${p.specs.slice(0,4).map(([k,v])=>`<li>${esc(k)}: ${esc(v)}</li>`).join('')}</ul>`}
    ${p.rating ? `<p class="jb-fine">Rating: <b>${esc(p.rating)}</b> &nbsp; Consumer Advice: <b>${esc(p.rating)}</b></p>` : ''}
    ${p.release ? `<div class="jb-kv"><span>Release date</span><b>${esc(p.release)}</b></div>` : ''}
    ${isGame ? `<div class="jb-kv jb-kv-stack"><span>Pre-order price guarantee</span><span class="jb-fine">If the price of your pre-order drops before release day, we'll refund you the difference shortly after release.</span></div>` : ''}
    <a class="jb-fine" href="#overview">&darr; Product overview</a>
    <h2 class="jb-display">Availability</h2>
    ${reference ? '' : `<div class="jb-avail-rows">
      <div class="jb-avail-row"><span class="jb-avail-ico" aria-hidden="true">&#128666;</span><div><b>Delivery</b><div class="jb-fine">${deliveryText}</div></div></div>
      <div class="jb-avail-row"><span class="jb-avail-ico" aria-hidden="true">&#127978;</span><div><b>Click &amp; Collect</b><div class="jb-fine">${inStore ? 'Check store availability' : 'Not available for this product'}</div></div></div>
    </div>`}
    <form method="get" action="${productPath(base,p)}" class="jb-avail-form">${p.variantId?`<input type="hidden" name="variant" value="${p.variantId}">`:""}<label for="availability" class="visually-hidden">Enter postcode or suburb</label><input id="availability" name="availability" type="text" placeholder="Enter postcode or suburb" value="${esc(availability && availability !== 'my location' ? availability : '')}"><button type="submit" class="jb-btn jb-btn-black jb-btn-small">Check</button><a href="${productPath(base,p)}?${p.variantId?'variant='+p.variantId+'&':''}availability=my+location">Use my location</a></form>
    ${availPanel}
    <div class="jb-deal-box"><b>SEEN IT CHEAPER? ASK FOR A JB DEAL!</b><div>INSTORE | ONLINE</div><div class="jb-fine">Excludes JB Hi-Fi Marketplace products</div><div class="jb-deal-actions"><a class="jb-btn jb-btn-black jb-btn-small" href="${informationHref(base, 'Live chat')}">Live chat</a><a class="jb-btn jb-btn-black jb-btn-small" href="${informationHref(base, 'Call 13 52 44')}">Call 13 52 44</a></div><div class="jb-fine">9am – 8pm AEST</div></div>
  </div>
</div>
${isGame && !reference ? `<section class="jb-dlc"><div class="jb-dlc-art">PRE-ORDER BONUS</div><div><div class="jb-display">${esc(PREORDER_BONUS.heading)}</div><h2>${esc(PREORDER_BONUS.title)}</h2><p>${esc(PREORDER_BONUS.text)}</p><p class="jb-fine">${esc(PREORDER_BONUS.ends)}</p></div></section>` : ''}

<nav class="jb-product-nav" aria-label="Product information"><a href="#overview">Description</a><a href="#specifications">Specifications</a><a href="#recommendations">Recommended for you</a></nav><section id="overview" class="jb-overview"><h2 class="jb-display">Description</h2>${p.description.map(d => `<p>${esc(d)}</p>`).join('')}
  <h2 id="specifications" class="jb-display">Specifications</h2><table class="jb-specs">${p.specs.map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`).join('')}</table></section>
<section id="recommendations"><h2 class="jb-display">Recommended for you</h2><div class="jb-carousel">${related(p).map(u => tile(base, u, self)).join('')}</div></section>
${perksPopup}`
}

export function cartPage({ base, t, couponError }) {
  if (nativeCart(t)) return referenceCartPage({ base, t, couponError })
  if (!t.lines.length) {
    return `<div class="jb-cart-empty"><h1>My Cart</h1><p>Your cart is empty</p><p class="jb-fine">Includes GST. Shipping calculated at checkout.</p><a class="jb-btn" href="${base}/">Continue shopping</a></div>`
  }
  const rows = t.lines.map(l => `<div class="jb-line">
  ${artwork(l.product)}
  <div class="jb-line-info">
    <a href="${productPath(base, l.product)}${l.product.variantId?'?variant='+l.product.variantId:''}"><b>${esc(l.product.title)}</b></a>
    <div class="jb-fine">${esc(l.product.subtitle)}</div>${optionText(l.product)}
    ${l.product.release && l.product.cta === 'Pre-order' ? `<div class="jb-fine">&#9432; Pre-order release date ${esc(l.product.releaseLong)}</div>` : ''}
  </div>
  <form method="post" action="${base}/cart/update" class="jb-line-actions">
    <input type="hidden" name="id" value="${l.product.id}"><input type="hidden" name="line_key" value="${lineKey(l.product.id,l.variant)}">
    <label for="qty-${lineKey(l.product.id,l.variant)}">Quantity <select id="qty-${lineKey(l.product.id,l.variant)}" name="qty" onchange="this.form.submit()">${Array.from({length:stockLimit(l.product)},(_,i)=>i+1).map(n => `<option value="${n}" ${n === l.qty ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
    <button type="submit" name="action" value="update" class="jb-link-btn">Update</button>
    <span class="jb-line-price">${aud(l.product.price * l.qty)}</span>
    <button type="submit" name="action" value="remove" class="jb-link-btn">&#128465; Remove</button><button type="submit" formaction="${base}/cart/save" class="jb-link-btn">Save for later</button>
  </form>
</div>`).join('')
  return `<div class="jb-cart-head"><h1>My Cart</h1><a href="${base}/">&#128722; Continue shopping</a></div>
<div class="jb-cart">
  <div class="jb-cart-main">${rows}</div>
  <aside class="jb-summary">
    <form method="post" action="${base}/cart/coupon" class="jb-inline-form"><label for="coupon">Coupon code</label><div><input id="coupon" name="code" type="text"><button type="submit" class="jb-btn jb-btn-black jb-btn-small">Apply</button></div>${couponError ? `<p class="jb-error" role="alert">${esc(couponError)}</p>` : ''}</form>
    <form class="jb-inline-form" method="get" action="${base}/stores"><label for="cart-availability">Find a collection store</label><div><input id="cart-availability" name="q" type="text" placeholder="Enter postcode or suburb"><button class="jb-btn jb-btn-black jb-btn-small">Find stores</button></div></form>
    <div class="jb-row jb-total"><span>Subtotal</span><span>${aud(t.subtotal)}</span></div>
    <p class="jb-fine">Includes GST. Shipping calculated at checkout.</p>
    <form method="post" action="${base}/checkout"><button type="submit" class="jb-btn jb-btn-block">Checkout</button></form>
  </aside>
</div>
<section><h2 class="jb-display">Don’t forget these</h2><div class="jb-carousel">${related(t.lines[0].product).map(u => tile(base, u, `${base}/cart`)).join('')}</div></section>`
}

function referenceCartPage({ base, t, couponError }) {
  return `<section class="jb-reference-cart"><div class="jb-cart-head"><h1>My Cart</h1><a href="${base}/">${icon('cart')} Continue shopping</a></div><div class="jb-cart"><div class="jb-cart-main">${t.lines.map(l => `<article class="jb-line">${artwork(l.product)}<div class="jb-line-info"><a href="${productPath(base,l.product)}">${esc(l.product.title)}</a><p class="jb-cart-preorder">ⓘ Pre-order release date ${esc(l.product.releaseLong)}</p></div><form method="post" action="${base}/cart/update" class="jb-line-actions"><input type="hidden" name="id" value="${l.product.id}"><input type="hidden" name="line_key" value="${lineKey(l.product.id,l.variant)}"><label class="visually-hidden" for="qty-${lineKey(l.product.id,l.variant)}">Quantity</label><select id="qty-${lineKey(l.product.id,l.variant)}" name="qty" onchange="this.form.submit()">${Array.from({length:stockLimit(l.product)},(_,i)=>`<option value="${i+1}"${i+1===l.qty?' selected':''}>${i+1}</option>`).join('')}</select><span class="jb-line-price">${aud(l.product.price*l.qty)}</span><button type="submit" name="action" value="remove" class="jb-link-btn">Remove</button><noscript><button type="submit" name="action" value="update">Update quantity</button></noscript></form></article>`).join('')}</div><aside class="jb-summary"><form method="post" action="${base}/cart/coupon" class="jb-cart-coupon"><label class="visually-hidden" for="coupon">Coupon code</label><input id="coupon" name="code" placeholder="Coupon code"><button class="jb-btn jb-btn-black">Apply</button></form>${couponError?`<p class="jb-error" role="alert">${esc(couponError)}</p>`:''}<form method="get" action="${base}/stores" class="jb-cart-availability"><label for="cart-availability">Availability</label><input id="cart-availability" name="q" placeholder="Enter postcode or suburb"><a href="${base}/stores?q=my+location">Use my location</a><button class="visually-hidden" type="submit">Check availability</button></form><div class="jb-row jb-total"><span>Subtotal</span><span>${aud(t.subtotal)}</span></div><p class="jb-fine">Includes GST. Shipping calculated at checkout.</p><form method="post" action="${base}/checkout"><button class="jb-btn jb-btn-block">Checkout</button></form></aside></div><section class="jb-cart-recommendations"><h2>Don’t forget these</h2>${t.lines.every(line => line.product.id === '903001') ? recommendationCarousel(base, 'cart', `${base}/cart`) : `<div class="jb-carousel">${related(t.lines[0].product).map(u=>tile(base,u,`${base}/cart`)).join('')}</div>`}</section></section>`
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
    <p class="jb-fine"><a href="${informationHref(base, 'Forgot your password?')}">Forgot your password?</a></p>
  </form>
  <p>Don't have an account? <a href="${base}/account/register?return_to=${encodeURIComponent(returnTo)}">Create account</a></p>
</div>`
}

export function registerPage({ base, values = {}, errors = {}, returnTo = '' }) {
  const f = (name, label, type = 'text', extra = '') => `<div class="jb-field"><label for="${name}">${label}</label><input id="${name}" name="${name}" type="${type}" value="${esc(values[name] ?? '')}" placeholder=" " ${extra}>${errors[name] ? `<span class="jb-error">${esc(errors[name])}</span>` : ''}</div>`
  return `<div class="jb-auth"><h1>Create account</h1>
  <form method="post" action="${base}/account/register"><input type="hidden" name="return_to" value="${esc(returnTo)}">${errors.form?`<p class="jb-error">${esc(errors.form)}</p>`:''}
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
  ${user ? `<h1>Added to your wishlist</h1><p>${esc(p.title)} is in your wishlist.</p><a class="jb-btn" href="${productPath(base, p)+(p.variantId?'?variant='+encodeURIComponent(p.variantId):'')}">Back to product</a>`
    : `<h1>You're one step away from having this in your wishlist!</h1><p>Create a free JB Hi-Fi account to save ${esc(p.title)} in your wishlist. Real Perks coupons are not issued here.</p>
  <div class="jb-modal-actions"><a class="jb-btn" href="${base}/account/register">Create account</a><a class="jb-btn jb-btn-black" href="${base}/account/login?return_to=${encodeURIComponent(productPath(base, p)+(p.variantId?'?variant='+encodeURIComponent(p.variantId):''))}">Log in</a></div>
  <p><a href="${productPath(base, p)+(p.variantId?'?variant='+encodeURIComponent(p.variantId):'')}">Back to product</a></p>`}
</div>`
}

export function simplePage({ title, html }) { return `<div class="jb-simple"><h1>${esc(title)}</h1>${html}</div>` }

export function storesPage({ base, query, stores }) {
  if (!fixtureCatalog) return `<div class="jb-simple"><h1>Find a store</h1><p>Retail-store pickup availability has not been verified. This is not a no-stock result.</p></div>`
  return `<nav class="jb-crumbs" aria-label="Breadcrumb"><a href="${base}/">Home</a> &rsaquo; Stores</nav>
<div class="jb-simple"><h1>Find a store</h1>
  <form method="get" action="${base}/stores" class="jb-avail-form"><label for="store-q" class="visually-hidden">Enter postcode or suburb</label><input id="store-q" name="q" type="text" placeholder="Enter postcode or suburb" value="${esc(query)}"><button type="submit" class="jb-btn jb-btn-black jb-btn-small">Search</button></form>
  <ul class="jb-store-list">${stores.map(s => `<li><a href="${base}/stores/${s.id}"><b>${esc(s.name)}</b></a><br><span class="jb-fine">${esc(s.address)}</span><br><span class="jb-avail-ok">Click &amp; Collect available</span></li>`).join('')}</ul>
</div>`
}

export function trackOrderPage({ base, values = {}, error = null, order = null }) {
  const result = order ? `<div class="jb-notice jb-notice-ok" role="status"><ul>
    <li><b>Order #${esc(order.order_number)}</b> — placed ${esc(new Date(order.created_at).toLocaleDateString('en-AU'))}</li>
    ${order.items.map(i => `<li>${esc(i.title)}${byId(i.sku) ? ` (${esc(byId(i.sku).subtitle)})` : ''} × ${i.qty}</li>`).join('')}
    <li>Status: ${order.meta.preorder?'Pre-order confirmed':'Processing'}, paid in full. ${order.fulfillment.method === 'pickup' ? `Click &amp; Collect from ${esc(order.fulfillment.store_location)}.` : `We'll email you when it ships.`}</li></ul></div>` : ''
  return `<div class="jb-auth"><h1>Track your order</h1>
  ${result}${error ? `<p class="jb-error" role="alert">${esc(error)}</p>` : ''}
  <form method="post" action="${base}/account/orders">
    <div class="jb-field"><label for="order_number">Order number</label><input id="order_number" name="order_number" type="text" inputmode="numeric" value="${esc(values.order_number ?? '')}"></div>
    <div class="jb-field"><label for="track_phone">Mobile number</label><input id="track_phone" name="phone" type="tel" value="${esc(values.phone||'')}"></div><p class="jb-fine">Use the browser where you placed this order. You can also use the order email below.</p>
    <div class="jb-field"><label for="track_email">Email (alternative)</label><input id="track_email" name="email" type="email" autocomplete="email" value="${esc(values.email ?? '')}"></div>
    <button class="jb-btn jb-btn-block" type="submit">Track order</button>
  </form>
  <p class="jb-fine">Have an account? <a href="${base}/account/login?return_to=${encodeURIComponent(`${base}/account`)}">Log in</a> to see all your orders.</p>
</div>`
}

// ---- checkout (Shopify-style, three pages + thank you) ----
// The discount box belongs to the step's own form (form="…"), so "Apply" keeps whatever the shopper has typed.
function orderSummary({ t, shipping, pickup, discountError, formId, code = '' }) {
  const reference = formId === 'jb-information-form' && nativeCart(t)
  const shipText = pickup ? 'Free' : shipping ? aud(shipping.price) : 'Calculated at next step'
  return `<aside class="jb-co-summary" aria-label="Order summary" ${reference ? `data-information-summary data-subtotal="${t.subtotal}" data-collection-price="4.99"` : ''}>
  ${t.lines.map(l => `<div class="jb-co-item"><span class="jb-co-thumb">${artwork(l.product)}<span class="jb-qty-badge">${l.qty}</span></span><span class="jb-co-item-title">${esc(l.product.title)}${reference ? '' : `<small>${esc(l.product.subtitle)}${l.product.variantId?' · '+esc(l.product.variantLabel):''}</small>`}</span><span>${aud(l.product.price * l.qty)}</span></div>`).join('')}
  <div class="jb-co-discount"><label for="summary-discount" class="visually-hidden">${reference ? 'Coupon code' : 'Discount code or gift card'}</label><input id="summary-discount" type="text" placeholder="${reference ? 'Coupon code' : 'Discount code or gift card'}" form="${formId}" name="discount_code" value="${esc(code)}"><button type="submit" form="${formId}" name="apply_discount" value="1" class="jb-btn ${reference ? '' : 'jb-btn-grey'} jb-btn-small">Apply</button></div>
  ${reference ? `<div class="jb-co-gift-card"><label class="visually-hidden" for="summary-gift-card">Gift card number</label><input id="summary-gift-card" name="gift_card_number" placeholder="Gift card number" form="${formId}"><label class="visually-hidden" for="summary-gift-pin">PIN</label><input id="summary-gift-pin" name="gift_card_pin" placeholder="PIN" form="${formId}"><button type="submit" form="${formId}" name="apply_discount" value="1" class="jb-btn jb-btn-small">Apply</button></div>` : ''}
  ${discountError ? `<p class="jb-error" role="alert">${esc(discountError)}</p>` : ''}
  <div class="jb-row"><span>Subtotal</span><span>${aud(t.subtotal)}</span></div>
  <div class="jb-row"><span>Shipping</span><span ${reference ? 'data-information-shipping' : ''}>${shipText}</span></div>
  <div class="jb-row jb-total"><span>Total</span><span ${reference ? 'data-information-total' : ''}><small>AUD</small> ${aud(t.subtotal + (pickup ? 0 : shipping?.price ?? 0))}</span></div>
  <p class="${reference ? 'jb-co-gst' : 'jb-fine'}" ${reference && !shipping ? 'hidden' : ''}>${reference && shipping ? `Includes ${aud((t.subtotal + shipping.price) / 11)} GST` : 'Includes GST.'}</p>
</aside>`
}

function coField(name, label, values, errors, { type = 'text', extra = '' } = {}) {
  return `<div class="jb-field ${errors[name] ? 'has-error' : ''}"><label for="${name}">${label}</label><input id="${name}" name="${name}" type="${type}" value="${esc(values[name] ?? '')}" ${/\bplaceholder=/.test(extra) ? '' : 'placeholder=" "'} ${extra} ${errors[name] ? `aria-invalid="true" aria-describedby="err-${name}"` : ''}>${errors[name] ? `<span class="jb-error" id="err-${name}">${esc(errors[name])}</span>` : ''}</div>`
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

export function informationPage({ urls, t, values = {}, errors = {}, stores = null, storeQuery = '', pointQuery = null, points = [], user, discountError, savedAddresses = '' }) {
  const reference = nativeCart(t)
  const method = values.delivery_method || 'delivery'
  const pointId = values.point_id || points[0]?.id
  const radio = (id, label, icon) => `<label class="jb-method ${method === id ? 'is-selected' : ''}" for="delivery_method_${id}"><input type="radio" id="delivery_method_${id}" name="delivery_method" value="${id}" ${!fixtureCatalog && id === 'pickup' ? 'disabled' : ''} ${method === id ? 'checked' : ''}><span class="jb-method-icon" aria-hidden="true">${reference ? `<img src="/static/reference/jb-hifi/checkout-${id === 'collection_point' ? 'collection' : id}.svg" alt="">` : icon}</span><span>${label}</span>${id === 'delivery' ? '<span class="jb-method-cost">Calculated at next step</span>' : id === 'pickup' ? (fixtureCatalog ? '<span class="jb-method-cost">Free</span>' : '<span class="jb-method-cost">Not verified</span>') : ''}</label>`
  const storeList = !fixtureCatalog ? `<div class="jb-notice">Retail-store pickup availability has not been verified.</div>` : stores ? (stores.length ? `<div class="jb-store-results" role="radiogroup" aria-label="Pickup locations">${stores.map(s => `<label class="jb-store-option ${values.store_id === s.id ? 'is-selected' : ''}" for="store_${s.id}"><input type="radio" id="store_${s.id}" name="store_id" value="${s.id}" ${values.store_id === s.id ? 'checked' : ''}><span><b>${esc(s.name)}</b><br><span class="jb-fine">${esc(s.address)}</span><br><span class="jb-fine">${esc(collectNote(t))} Bring your confirmation email/SMS and photo ID.</span></span><span class="jb-store-cost">Free</span></label>`).join('')}</div>`
    : `<div class="jb-error-box">No stores available with your item<br><span class="jb-fine">Ship your items or search elsewhere.</span></div>`) : ''
  return `<form id="jb-saved-address-form" method="get" action="${urls.information}"></form><div class="jb-co${reference ? ' jb-reference-checkout' : ''}">
  <form method="post" action="${urls.information}" class="jb-co-form" novalidate id="jb-information-form">
    ${errorBanner(errors)}
    ${reference && !user ? `<div class="jb-checkout-login"><img src="/static/reference/jb-hifi/checkout-cart.png" alt=""><b>Checkout faster</b><a class="jb-btn jb-btn-black" href="${urls.cart.replace(/\/cart$/, '')}/account/login?return_to=${encodeURIComponent(urls.information)}">Log in</a></div>` : ''}
    <section class="jb-co-section"><div class="jb-express"><span>Express checkout</span><div class="jb-express-btns"><button type="button" class="jb-express-btn jb-express-paypal" disabled>PayPal</button>${reference ? '' : '<button type="button" class="jb-express-btn jb-express-gpay" disabled>G Pay</button>'}</div><div class="jb-or">OR</div></div></section>
    <section class="jb-co-section"><h2>Your details</h2>
      ${user ? `<p class="jb-fine">Logged in as ${esc(user.email)} · <a href="${urls.logout}">Log out</a></p>` : ''}
      ${coField('email', 'Email', values, errors, { type: 'email', extra: 'autocomplete="email"' })}
      <p class="jb-fine">Used for your order confirmation and cart reminders</p>
      <label class="jb-check" for="newsletter"><input type="checkbox" id="newsletter" name="newsletter" value="1" ${values.newsletter ? 'checked' : ''}> Keep me in the loop on hot news and offers!</label>
    </section>
    <section class="jb-co-section"><h2>Delivery method</h2><p class="jb-fine">Choose a delivery method</p>
      <div class="jb-methods">${radio('delivery', 'Delivery', '&#128666;')}${radio('pickup', 'Click &amp; Collect', '&#127978;')}${radio('collection_point', 'Ship to collection point', '&#128205;')}</div>
      ${errors.delivery_method ? `<span class="jb-error">${esc(errors.delivery_method)}</span>` : ''}
      <div class="jb-panel jb-panel-delivery"><h2>Shipping address</h2>${savedAddresses}
        ${addressFields('', values, errors)}
        ${coField('phone', 'Mobile phone', values, errors, { type: 'tel', extra: 'autocomplete="tel"' })}
        ${user?`<label class="jb-check" for="save_info"><input type="checkbox" id="save_info" name="save_info" value="1" ${values.save_info ? 'checked' : ''}> Save this address to my address book</label>`:''}
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
        <details class="jb-point-finder" ${points.length ? '' : 'open'}><summary>${points.length ? 'Change location' : 'Find a collection point'}</summary>
        <div class="jb-finder"><button type="submit" name="use_location_point" value="1" class="jb-btn jb-btn-black jb-btn-small">Use my location</button><span class="jb-or-inline">or</span>
          <div class="jb-field"><label for="point_country">Country/region</label><select id="point_country" name="point_country"><option value="AU" selected>Australia</option></select></div>
          <div class="jb-field"><label for="point_query">Address, suburb or postcode</label><input id="point_query" name="point_query" type="text" placeholder=" " value="${esc(pointQuery ?? values.point_query ?? '')}"></div>
          <button type="submit" name="find_points" value="1" class="jb-btn jb-btn-grey jb-btn-small">Search</button></div></details>
        ${points.length ? `<div class="jb-point-results"><p class="jb-point-results-head">${points.length} pickup points near your location</p><p class="jb-fine jb-point-count">Showing 1 - ${points.length} of ${points.length} points</p><div role="radiogroup" aria-label="Collection points">${points.map(point => `<label class="jb-point-option" for="point_${esc(point.id)}"><input type="radio" id="point_${esc(point.id)}" name="point_id" value="${esc(point.id)}" ${point.id === pointId ? 'checked' : ''}><span><b>${esc(point.name)}</b><span class="jb-point-meta">${esc(point.address)}</span><span class="jb-point-meta"><img src="/static/reference/jb-hifi/carrier-australia-post.png" alt="">${esc(point.carrier || 'Australia Post')}</span></span><span class="jb-point-price">${aud(point.price ?? 4.99)}</span></label>`).join('')}</div><p class="jb-fine jb-point-pagination">1 - ${points.length} of ${points.length} points</p></div>` : pointQuery !== null ? `<div class="jb-error-box">No collection points available with your item<br><span class="jb-fine">Choose Delivery or Click &amp; Collect instead.</span></div>` : ''}
        ${errors.point_id || errors.collection_point ? `<span class="jb-error">${esc(errors.point_id || errors.collection_point)}</span>` : ''}
      </div>
    </section>
    <div class="jb-co-actions"><a href="${urls.cart}">&lsaquo; Return to cart</a><button class="jb-btn" type="submit" data-information-continue>Continue to ${method === 'pickup' || (method === 'collection_point' && points.length) ? 'payment' : 'shipping'}</button></div>
  </form>
  ${orderSummary({ t, pickup: method === 'pickup', shipping: method === 'collection_point' && points.length ? { price: points.find(point => point.id === pointId)?.price ?? 4.99 } : null, discountError, formId: 'jb-information-form', code: values.discount_code })}
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
        <label class="jb-ship-method is-disabled" for="shipping_method_${COURIER_METHOD.id}"><input type="radio" id="shipping_method_${COURIER_METHOD.id}" name="shipping_method" value="${COURIER_METHOD.id}" disabled><span><b>${esc(COURIER_METHOD.name)}</b> (${esc(COURIER_METHOD.eta)})<br><span class="jb-fine">${t.lines.some(l=>l.product.cta==='Pre-order')?esc(COURIER_METHOD.note):'Not available for this destination'}</span></span><span class="jb-ship-price">—</span></label>
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

export function paymentPage({ urls, t, info, shipping, pickupStore, collectionPoint, values = {}, errors = {}, discountError, reviewToken }) {
  const pm = values.payment_method || 'card'
  const billing = values.billing || 'same'
  const pickup = !!pickupStore
  const collection = !!collectionPoint
  const methodRow = pickup
    ? ['Pickup', `${esc(pickupStore.name)} — Free`, urls.information]
    : collection ? ['Method', `${esc(shipping.name)} · ${aud(shipping.price)}`, urls.information]
    : ['Method', `${esc(shipping.name)} (${esc(shipping.eta)}) · ${aud(shipping.price)}`, urls.shipping]
  const pmOption = (id, label, panel) => `<div class="jb-pay-option ${pm === id ? 'is-selected' : ''}"><label class="jb-pay-head" for="payment_method_${id}"><input type="radio" id="payment_method_${id}" name="payment_method" value="${id}" ${pm === id ? 'checked' : ''}> ${label}</label><div class="jb-pay-panel">${panel}</div></div>`
  const redirectNote = (name) => `<p class="jb-fine">${name} is recorded as your payment choice here. External authorisation and finance applications are not connected; no real payment is taken.</p>`
  return `<div class="jb-co">
  <form method="post" action="${urls.payment}" class="jb-co-form" novalidate id="jb-payment-form"><input type="hidden" name="review_token" value="${esc(reviewToken)}">
    ${errorBanner(errors)}
    ${coSummaryRows([['Contact', esc(info.email), urls.information], pickup ? ['Pick up at', esc(pickupStore.address), urls.information] : collection ? ['Collection point', `${esc(collectionPoint.name)}, ${esc(collectionPoint.address)}`, urls.information] : ['Ship to', formatAddress(info.address), urls.information], methodRow])}
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
      ${pickup || collection ? `<p class="jb-fine">Enter the address that matches your card or payment method.</p><div class="jb-panel-billing-always">${addressFields('billing', values, errors)}</div>`
      : `<div class="jb-methods jb-billing-choice">
        <label class="jb-method ${billing === 'same' ? 'is-selected' : ''}" for="billing_same"><input type="radio" id="billing_same" name="billing" value="same" ${billing === 'same' ? 'checked' : ''}><span>Same as shipping address</span></label>
        <label class="jb-method ${billing === 'different' ? 'is-selected' : ''}" for="billing_different"><input type="radio" id="billing_different" name="billing" value="different" ${billing === 'different' ? 'checked' : ''}><span>Use a different billing address</span></label>
      </div>
      <div class="jb-panel jb-panel-billing">${addressFields('billing', values, errors)}</div>`}
    </section>
    ${t.lines.some(l=>l.product.cta==='Pre-order')?`<p class="jb-fine">Pre-orders are paid in full when placed. Pre-order price guarantee: if the price drops before release day, we'll refund you the difference shortly after release.</p>`:''}
    <div class="jb-co-actions"><a href="${pickup || collection ? urls.information : urls.shipping}">&lsaquo; Return to ${pickup || collection ? 'information' : 'shipping'}</a><button class="jb-btn" type="submit" name="pay" value="1">Pay now</button></div>
  </form>
  ${orderSummary({ t, shipping, pickup, discountError, formId: 'jb-payment-form', code: values.discount_code })}
</div>`
}

const PAY_NAMES = { paypal: 'PayPal', afterpay: 'Afterpay', zip: 'Zip', latitude: 'Latitude Interest Free' }

// ASSUMPTION: not observed. Shopify's thank-you page ("Thank you, <name>!" / "Your order is confirmed") with JB's
// email + SMS updates from the help pages.
export function thankYouPage({ base, order }) {
  const f = order.fulfillment, pickup = f.method === 'pickup', collection = f.option === 'collection_point', pay = order.payment
  const payText = `${pay.method === 'card' ? `${esc(pay.brand)} ending with ${esc(pay.last4)}` : esc(PAY_NAMES[pay.method] ?? pay.method)} — ${aud(order.totals.total)}`
  const preload = order.meta.preload_from
  const lifecycle=orderStatus(order)
  if(lifecycle==='return_requested'||lifecycle==='delivered')return `<section class="jb-journey"><h1>Order #${esc(order.order_number)} — ${lifecycle==='delivered'?'Delivered':'Return requested'}</h1><p>${lifecycle==='delivered'?'Your order is marked delivered.':'Your return request is recorded. No collection or real refund has been arranged.'}</p><a href="${base}/account/orders/${order.order_number}">View order details</a></section>`
  if(lifecycle==='cancelled')return `<section class="jb-journey"><h1>Order #${esc(order.order_number)} is cancelled</h1><p>Collection and dispatch are no longer scheduled. No real refund is processed.</p><a href="${base}/account/orders/${order.order_number}">View order details</a></section>`
  return `<div class="jb-co jb-thanks">
  <div class="jb-co-form">
    <div class="jb-thanks-head"><span class="jb-check-ring" aria-hidden="true">&#10003;</span><div><p class="jb-fine">Order <span data-order-number>#${esc(order.order_number)}</span></p><h1>Thank you, ${esc(order.customer.first_name)}!</h1></div></div>
    <section class="jb-co-section"><h2>Your order is confirmed</h2>
      <p>You'll receive a confirmation email with your order number shortly.</p>
      ${order.meta.preorder?`<p class="jb-fine">Your pre-order has been paid in full. Pre-order price guarantee: if the price drops before release day, we'll refund you the difference shortly after release.</p>`:'<p class="jb-fine">Your order has been paid in full and is being processed.</p>'}
    </section>
    <section class="jb-co-section"><h2>Order updates</h2><p class="jb-fine">No email or SMS is sent in this shop. Check your order status here.</p><p><a href="${base}/account/orders/${order.order_number}">View order details and status</a></p>
      ${pickup
        ? `<p>We'll send you an email and SMS when your order is ready to collect from <b>${esc(f.store_location)}</b>${f.ready_from ? ` (from ${esc(f.ready_from)})` : ''}. Show the order number or barcode from that email or SMS, with photo ID, when you collect.</p>`
        : `<p>You'll get shipping and delivery updates by email and SMS.${preload ? ` Delivery and pickup starts ${esc(preload)}, so you can preload before release on ${esc(order.meta.release)}.` : ''}</p>`}
    </section>
    <section class="jb-co-section"><h2>Customer information</h2>
      <div class="jb-2col">
        <div><h3>Contact information</h3><p>${esc(order.customer.email)}<br>${esc(order.customer.phone ?? '')}</p></div>
        <div><h3>Payment method</h3><p>${payText}</p></div>
        <div><h3>${pickup ? 'Pickup location' : collection ? 'Collection point' : 'Shipping address'}</h3><p>${pickup ? `${esc(f.store_location)}<br>${esc(f.store_address)}` : collection ? `${esc(f.collection_point_name)}<br>${esc(f.collection_point_address)}` : formatAddress(order.shipping_address)}</p></div>
        <div><h3>Billing address</h3><p>${formatAddress(order.billing_address)}</p></div>
        <div><h3>${pickup ? 'Pickup method' : 'Shipping method'}</h3><p>${pickup ? 'Click &amp; Collect — Free' : `${esc(f.option_name)}${f.eta ? ` (${esc(f.eta)})` : ''} · ${aud(order.totals.shipping)}`}</p></div>
      </div>
    </section>
    <div class="jb-co-actions"><span class="jb-fine">Need help? <a href="${informationHref(base, 'Contact us')}">Contact us</a></span><a class="jb-btn" href="${base}/">Continue shopping</a></div>
  </div>
  <aside class="jb-co-summary" aria-label="Order summary">
    ${order.items.map(it => { const p = selectedProduct(byId(it.sku), order.meta.options?.find(o=>o.sku===it.sku&&o.unit_price===it.unit_price)?.variant_id||''); return `<div class="jb-co-item"><span class="jb-co-thumb">${p?artwork(p):''}<span class="jb-qty-badge">${it.qty}</span></span><span class="jb-co-item-title">${esc(it.title)}${p ? `<small>${esc(p.subtitle)}${p.variantId?' · '+esc(p.variantLabel):''}</small>` : ''}</span><span>${aud(it.unit_price * it.qty)}</span></div>` }).join('')}
    <div class="jb-row"><span>Subtotal</span><span>${aud(order.totals.subtotal)}</span></div>
    <div class="jb-row"><span>Shipping</span><span>${order.totals.shipping ? aud(order.totals.shipping) : 'Free'}</span></div>
    <div class="jb-row jb-total"><span>Total</span><span><small>AUD</small> ${aud(order.totals.total)}</span></div>
    <p class="jb-fine">Includes GST. Paid in full.</p>
  </aside>
</div>`
}
