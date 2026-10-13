import { productImage, productGallery } from '../../lib/product-assets.js'
import { benchmarkDate } from '../../lib/payment.js'
import { physicalPage, shippingFields, shippingReceipt } from './physical.js'
import * as C from './catalog-pages.js'
import { esc, money, disclaimer } from '../../lib/html.js'
import { byId, productPath, conceptPath, games, PROMO_LINE, COMPAT, LEGAL_INFO, LEGAL_TEXT, ULTIMATE_UPGRADE_BULLETS, STATES, PRELOAD, WALLET_BALANCE, RELEASE, RATING_DESCRIPTORS } from './data.js'

const NAME = 'PlayStation Store'
// Sony's account pages live on their own domain (my.account.sony.com); the clone keeps that host in the path.
// ASSUMPTION: the sign-up path; the research only names the sign-in page.
export const SONY_SIGNIN = '/my.account.sony.com/central/signin'
export const SONY_SIGNUP = '/my.account.sony.com/central/signup'
export const signInUrl = (base, redirectUri) => `${base}${SONY_SIGNIN}/?redirect_uri=${encodeURIComponent(redirectUri)}`
const signUpUrl = (base, redirectUri) => `${base}${SONY_SIGNUP}/?redirect_uri=${encodeURIComponent(redirectUri)}`
const STORE_NAV = ['Latest', 'Collections', 'Deals', 'Subscriptions', 'Browse']
const GLOBAL_NAV = [
  ['Store', [['Browse all products','/en-us/pages/browse'],['Latest releases','/en-us/collection/new-games'],['Deals','/en-us/pages/deals'],['PlayStation Plus','/en-us/pages/subscriptions']]],
  ['PS5', [['Explore PS5 games','/en-us/pages/browse?platform=PS5'],['PS5 Pro Enhanced','/en-us/pages/browse?feature=PS5+Pro+Enhanced'],['Game Library','/en-us/library'],['Download guidance','/en-us/support/downloads']]],
  ['Games', [['Browse all games','/en-us/pages/browse'],['PlayStation Studios','/en-us/collection/studios'],['Free-to-play','/en-us/collection/free-to-play'],['Play together','/en-us/collection/together']]],
  ['PS Plus', [['Discover PlayStation Plus','/en-us/pages/subscriptions'],['Game Catalog','/en-us/pages/browse?plus=Extra'],['Manage membership','/en-us/membership'],['Subscription support','/en-us/support/subscriptions']]],
  ['Accessories', [['Consoles','/en-us/pages/browse?content=CONSOLE'],['Physical accessories','/en-us/pages/browse?content=ACCESSORY'],['Physical games','/en-us/pages/browse?content=PHYSICAL+GAME']]],
  ['News', [['New games','/en-us/collection/new-games'],['Coming soon','/en-us/pages/browse?content=PRE-ORDER'],['Autumn Adventures','/en-us/collection/autumn']]],
  ['Support', [['Support home','/en-us/support'],['Games and add-ons','/en-us/support/addons'],['Purchases and refunds','/en-us/support/refunds'],['Contact support','/en-us/support/contact']]],
]
const navigationMenus = base => GLOBAL_NAV.map(([name,links,note])=>`<details class="ps-nav-menu"><summary>${name}<span aria-hidden="true">⌄</span></summary><div class="ps-nav-panel"><p>${name==='Store'?'Explore PlayStation Store':esc(name)}</p><div>${links.map(([label,path])=>`<a href="${base}${path}">${label}<span aria-hidden="true">›</span></a>`).join('')}</div>${note?`<small>${note}</small>`:''}</div></details>`).join('')
const FOOTER_LINKS = [
  ['Support','/en-us/support'], ['Privacy Policy','/en-us/information/privacy'],
  ['Do Not Share My Personal Information','/en-us/information/privacy-choices'], ['Website Terms of Use','/en-us/information/website-terms'],
  ['Sitemap','/en-us/information/sitemap'], ['PlayStation Studios','/en-us/collection/studios'],
  ['Legal','/en-us/information/legal'], ['About SIE','/en-us/information/about'],
  ['PlayStation Terms of Service','/en-us/information/service-terms'], ['PS Store Cancellation Policy','/en-us/support/refunds'],
  ['Health Warnings','/en-us/information/health'], ['About Ratings','/en-us/information/ratings'],
]
const INFORMATION = {
  privacy: ['Privacy Policy','Read the official PlayStation privacy policy for information about Sony’s handling of personal information. This store’s profile preferences do not change a real PlayStation account.','https://www.playstation.com/en-us/legal/privacy-policy/'],
  'privacy-choices': ['Do Not Share My Personal Information','Privacy requests to Sony are handled on the official PlayStation website. No privacy request is submitted by visiting this page.','https://www.playstation.com/en-us/legal/third-party-ads/'],
  'website-terms': ['Website Terms of Use','Official website terms are available from PlayStation. The local storefront records simulated shopping actions only.','https://www.playstation.com/en-us/legal/website-terms-of-use/'],
  legal: ['Legal','Explore official PlayStation legal notices and policies. Product pages list the publisher and the digital licenses included with each local purchase.','https://www.playstation.com/en-us/legal/'],
  about: ['About Sony Interactive Entertainment','Sony Interactive Entertainment is the company behind PlayStation. Visit its official company pages for corporate information.','https://www.playstation.com/en-us/corporate/about-us/'],
  'service-terms': ['PlayStation Terms of Service','A real PlayStation account and its services are governed by the official terms. Local account and membership controls do not activate Sony services.','https://www.playstation.com/en-us/legal/psn-terms-of-service/'],
  health: ['Health Warnings','Read the official PlayStation health and safety information before playing, including guidance for virtual reality. Product pages identify their supported VR features.','https://www.playstation.com/en-us/legal/health-warning/'],
  ratings: ['About Ratings','Age ratings help you choose suitable games. Check the rating and content information on each product page; online interactions and optional purchases can vary.','https://www.playstation.com/en-us/support/account/age-ratings-playstation/'],
}
export function informationPage({base,topic}) {
  if(topic==='sitemap')return {title:'Sitemap',body:`<section class="ps-section ps-support-article"><h1>Sitemap</h1><h2>Discover games</h2><div class="ps-category-grid">${STORE_NAV.map(n=>`<a href="${base}/en-us/pages/${n.toLowerCase()}">${n}</a>`).join('')}</div><h2>Your PlayStation</h2><ul>${[['account','Account overview'],['library','Game Library'],['wishlist','Wishlist'],['transactions','Transaction History'],['membership','PlayStation Plus'],['support','Support']].map(([path,label])=>`<li><a href="${base}/en-us/${path}">${label}</a></li>`).join('')}</ul></section>`}
  if(!Object.hasOwn(INFORMATION,topic))return null
  const [title,copy,url]=INFORMATION[topic]
  return {title,body:`<section class="ps-section ps-support-article"><p>PLAYSTATION INFORMATION</p><h1>${title}</h1><p>${copy}</p><p><a class="ps-link" href="${url}" target="_blank" rel="noopener noreferrer">Read on the official PlayStation website ↗</a></p><div class="ps-support-actions"><a href="${base}/en-us/support">Store support</a><a href="${base}/en-us/account/profile">Profile and preferences</a><a href="${base}/en-us/pages/browse">Browse games</a></div></section>`}
}
const ICON_SEARCH = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21"/></svg>'
const ICON_CART = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 4h2l2.4 11.2a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.8L20 8H6.2"/><circle cx="9.5" cy="20" r="1.3"/><circle cx="17" cy="20" r="1.3"/></svg>'

// ASSUMPTION: the seeded account has no Online ID field, so the PSN Online ID is derived from the name.
export const onlineId = (user) => user?.online_id || `${user?.first_name ?? ''}${user?.last_name ?? ''}`.replace(/\s+/g, '') || 'player'
const initials = (user) => `${(user?.first_name ?? 'P')[0]}${(user?.last_name ?? '')[0] ?? ''}`.toUpperCase()

export function layout({ base, title, body, path = '/', user = null, cartCount = 0, drawer = null, closeHref = null, chrome = 'store' }) {
  const head = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<script src="${base}/static/store.js" defer></script><link rel="stylesheet" href="${base}/static/style.css"><link rel="stylesheet" href="${base}/static/journeys.css"></head>`
  if (chrome === 'sony') {
    // Sony's account sign-in lives on its own domain with its own minimal chrome.
    return `${head}
<body class="ps-sony">
<header class="ps-sony-header"><span class="ps-sony-wordmark">SONY</span><span class="ps-logo-mark" aria-hidden="true">PS</span></header>
<main class="ps-sony-main">${body}</main>
<footer class="ps-sony-footer"><p>&copy; 2026 Sony Interactive Entertainment LLC &nbsp;·&nbsp; <a href="${base}/en-us/support?topic=Privacy">Privacy Policy</a> &nbsp;·&nbsp; <a href="${base}/en-us/support?topic=Terms">Terms of Service</a> &nbsp;·&nbsp; <a href="${base}/en-us/support">Help</a></p>${disclaimer(NAME)}</footer>
</body></html>`
  }
  const signInHref = signInUrl(base, path)
  return `${head}
<body class="${drawer ? 'ps-has-drawer' : ''}">
<a class="ps-skip" href="#main">Skip to main content</a>
<div class="ps-page" ${drawer ? 'inert' : ''}>
<div class="ps-sony-strip">SONY</div>
<header class="ps-header">
  <div class="ps-global">
    <a class="ps-logo" href="${base}/" aria-label="PlayStation"><img class="ps-reference-mark" src="/static/reference/playstation-store/playstation-mark.svg" alt=""></a>
    <details class="ps-mobile-menu"><summary aria-label="Main menu"><span aria-hidden="true">☰</span></summary><nav aria-label="Mobile PlayStation"><a href="${base}/en-us/pages/browse">Browse games</a><a href="${base}/en-us/pages/collections">Collections</a><a href="${base}/en-us/pages/deals">Deals</a><a href="${base}/en-us/pages/subscriptions">PlayStation Plus</a><a href="${base}/en-us/account">Account overview</a><a href="${base}/en-us/library">Game Library</a><a href="${base}/en-us/wishlist">Wishlist</a><a href="${base}/en-us/support">Support</a></nav></details><nav class="ps-global-nav" aria-label="PlayStation">${navigationMenus(base)}</nav>
    <div class="ps-global-right">
      <span class="ps-sony-wordmark">SONY</span>
      ${user
        ? `<details class="ps-account">
        <summary class="ps-avatar" aria-label="Account menu for ${esc(onlineId(user))}">${esc(initials(user))}</summary>
        <div class="ps-account-menu"><p class="ps-account-id">${esc(onlineId(user))}</p><a href="${base}/en-us/account">Account overview</a><a href="${base}/en-us/library">Game Library</a><a href="${base}/en-us/wishlist">Wishlist</a><a href="${base}/en-us/transactions">Transaction History</a><a href="${base}/en-us/membership">Subscriptions</a><a href="${base}/en-us/payment-management">Payment Management</a><a href="${base}/logout">Sign Out</a></div>
      </details>`
        : `<a class="ps-pill ps-pill-blue ps-signin" href="${signInHref}">Sign In</a>`}
      <details class="ps-search">
        <summary aria-label="Search">${ICON_SEARCH}<span>Search</span></summary>
        <form action="${base}/en-us/search" method="get" role="search">
          <input type="search" name="q" placeholder="Search PS Store" list="ps-search-suggestions" aria-label="Search PlayStation Store" required>
          <datalist id="ps-search-suggestions"><option value="ASTRO BOT"><option value="Minecraft"><option value="Pocket Garden"><option value="Grand Theft Auto"><option value="racing"></datalist><button type="submit" aria-label="Search">${ICON_SEARCH}</button>
          <button type="button" class="ps-cancel-search" onclick="this.closest('details').removeAttribute('open')">Cancel search</button>
        </form>
      </details>
      ${user ? `<a class="ps-cart" href="${base}/en-us/checkout?return=${encodeURIComponent(path)}" aria-label="Cart, ${cartCount} item${cartCount === 1 ? '' : 's'}">${ICON_CART}<span>Cart</span>${cartCount ? `<b class="ps-cart-badge">${cartCount}</b>` : ''}</a>` : ''}
    </div>
  </div>
  <div class="ps-store-bar">
    <a class="ps-store-wordmark" href="${base}/en-us/pages/latest" aria-label="PlayStation Store"><img class="ps-reference-bag" src="/static/reference/playstation-store/store-bag.svg" alt=""><img class="ps-reference-wordmark" src="/static/reference/playstation-store/store-wordmark.svg" alt=""></a>
    <nav class="ps-store-nav" aria-label="PlayStation Store">${STORE_NAV.map(n => `<a href="${base}/en-us/pages/${n.toLowerCase()}"${path.split('?')[0].endsWith(`/pages/${n.toLowerCase()}`)||(n==='Latest'&&(path===base+'/'||path==='/'))?' aria-current="page"':''}>${esc(n)}</a>`).join('')}</nav>
  </div>
</header>
<main class="ps-main" id="main">${body}</main>
<footer class="ps-footer">
  <div class="ps-footer-inner">
    <p class="ps-footer-region">Country / Region: <b>United States</b></p>
    <nav class="ps-footer-links" aria-label="Legal">${FOOTER_LINKS.map(([label,path]) => `<a href="${base}${path}">${esc(label)}</a>`).join('')}</nav>
    <p class="ps-footer-copy">&copy; 2026 Sony Interactive Entertainment LLC</p>
    ${disclaimer(NAME)}
  </div>
</footer>
</div>
${drawer ? `<a class="ps-drawer-backdrop" href="${closeHref ?? `${base}/`}" tabindex="-1" aria-hidden="true"></a>
<aside class="ps-drawer" role="dialog" aria-modal="true" aria-label="Checkout" tabindex="-1">
  <a class="ps-drawer-close" href="${closeHref ?? `${base}/`}" aria-label="Close">&times;</a>
  ${drawer}
</aside>` : ''}
</body></html>`
}

// ---- pieces ----
const platformChips = (p) => p.chips.filter(c => c === 'PS5' || c === 'PS4')
const priceText = (p) => p.price == null ? 'Unavailable' : money(p.price)
const esrb = (p) => p.family === 'gta-vi'
  ? `<div class="ps-esrb"><img class="ps-esrb-reference" src="/static/reference/playstation-store/esrb-mature.png" alt="ESRB Mature 17+"><span>${esc(RATING_DESCRIPTORS)}<hr>In-Game Purchases</span></div>`
  : `<div class="ps-esrb"><span class="ps-esrb-badge">${esc(p.rating||'M')}</span><span>${p.rating==='E'?'Everyone':p.rating==='E10+'?'Everyone 10+':'Mature 17+'}</span></div>`

function tile(base, p) {
  return `<a class="ps-tile" href="${productPath(base, p)}">
  <span class="ps-tile-art">${C.art(p)}<span class="ps-chips">${platformChips(p).map(c => `<span class="ps-chip">${esc(c)}</span>`).join('')}</span></span>
  <span class="ps-tile-type">${esc(p.type)}</span>
  <span class="ps-tile-title">${esc(p.title)}</span>
  ${p.plusTag ? `<span class="ps-plus-tag">PS Plus · ${esc(p.plusTag)}</span>` : ''}
  <span class="ps-tile-price">${priceText(p)}</span>
</a>`
}

// `here` is the page the button sits on: sign-in and the drawer return to it (the real redirect_uri is the current URL).
// `owned` holds the SKUs this shopper already bought: a digital licence cannot be bought twice.
// ASSUMPTION: owned content shows a status pill instead of the purchase buttons (the research has no owned-state label).
function ctaBlock(base, p, here, owned, saved = new Set()) {
  if (owned.has(p.id)) return `<span class="ps-pill ps-pill-disabled ps-pill-block" aria-disabled="true">${p.cta === 'preorder' ? 'Pre-Ordered' : 'In Library'}</span>`
  const hidden = `<input type="hidden" name="sku" value="${esc(p.id)}"><input type="hidden" name="returnTo" value="${esc(here)}">`
  const wishlist = `<form method="post" action="${base}/en-us/wishlist" class="ps-cta-form">${hidden}<input type="hidden" name="action" value="${saved.has(p.id)?'remove':'add'}"><button type="submit" class="ps-pill ps-pill-ghost ps-pill-block"><span aria-hidden="true">&#9825;</span> ${saved.has(p.id)?'Remove from Wishlist':'Add to Wishlist'}</button></form>`
  if (p.cta === 'unavailable') return `<span class="ps-pill ps-pill-disabled ps-pill-block" aria-disabled="true">Unavailable</span>${wishlist}`
  const preorder = p.cta === 'preorder'
  return `<form method="post" action="${base}/en-us/${preorder ? 'preorder' : 'cart/add'}" class="ps-cta-form">${hidden}<button type="submit" class="ps-pill ps-pill-orange ps-pill-block">${preorder ? 'Pre-Order' : p.price===0?'Add to Library':'Add to Cart'}</button></form>${wishlist}`
}

// ---- pages ----
export const homePage = C.homePage
export const searchPage = C.searchPage
export const collectionsPage = C.collectionsPage
export const subscriptionsPage = C.subscriptionsPage
export function productPage({ base, p, here, toast = null, owned = new Set(), saved = new Set() }) {
  if (p.physical) return physicalPage({base,p,action:`${base}/en-us/cart/add`,idField:'sku',buttonClass:'ps-pill ps-pill-orange'})
  if (p.family !== 'gta-vi') return C.ordinaryPage({base,p,here,toast,owned,cta:(b,p,h,o)=>ctaBlock(b,p,h,o,saved)})
  const isGta6 = p.family === 'gta-vi'
  const hero = `<section class="ps-hero ps-reference-hero">
  <div class="ps-hero-art" aria-hidden="true"><img src="/static/reference/playstation-store/gta-vi-hero.jpg" alt=""></div>
  <div class="ps-hero-card">
    <h1>${esc(p.title)}</h1>
    <p class="ps-publisher">${esc(p.publisher)}</p>
    <p class="ps-unlock">${esc(p.unlock ?? p.release)}</p>
    <ul class="ps-tags">${p.chips.map(c => `<li>${esc(c)}</li>`).join('')}</ul>
    <p class="ps-price">${priceText(p)}</p>
    ${isGta6 && p.price != null ? `<p class="ps-promo">${esc(PROMO_LINE)}</p>` : ''}
    ${toast ? `<p class="ps-toast" role="status">${esc(toast)}</p>` : ''}
    <div class="ps-cta">${ctaBlock(base, p, here, owned, saved)}</div>
  </div>
  <div class="ps-reference-rating">${esrb(p)}</div>
</section>`
  const compatIcons = ['in-game-purchases', 'online-play', 'person', 'app-remote-play', null, 'trigger-effect-vibration', 'enhanced-graphics']
  const compat = isGta6 ? `<ul class="ps-compat">${COMPAT.map((c, index) => `<li>${compatIcons[index] ? `<img class="ps-compat-icon" src="/static/reference/playstation-store/feature-${compatIcons[index]}.svg" alt="">` : ''}${esc(c)}</li>`).join('')}</ul>` : ''

  const editions = p.kind === 'game' ? `<section class="ps-editions"><h2>Editions:</h2><div class="ps-edition-cards">
  ${games().map(e => `<article class="ps-edition-card${e.id === p.id ? ' is-current' : ''}">
    <a href="${productPath(base, e)}">${C.art(e)}</a>
    <div class="ps-edition-body"><h3><a href="${productPath(base, e)}">${esc(e.editionName)}</a></h3>
    <ul class="ps-bullets">${e.bullets.map(b => `<li>${esc(b)}</li>`).join('')}</ul>
    <p class="ps-price">${money(e.price)}</p><p class="ps-promo">${esc(PROMO_LINE)}</p>
    <div class="ps-cta">${ctaBlock(base, e, here, owned, saved)}</div></div>
  </article>`).join('')}
</div></section>` : ''
  const upgrade = p.kind === 'game' ? `<section class="ps-addons"><h2>Add-Ons</h2><div class="ps-grid ps-grid-6">${tile(base, byId('EP1004-PPSA01547_00-ULTEDTIONUPGRADE'))}</div><a class="ps-pill ps-pill-outline" href="${base}/en-us/search/Grand%20Theft%20Auto?content=ADD-ON+PACK">Show More</a></section>` : ''
  const info = isGta6
    ? `<section class="ps-legal-info"><h2>Game and Legal Info</h2>${LEGAL_INFO.map(t => `<p>${esc(t)}</p>`).join('')}${p.edition === 'ultimate' || p.cta === 'unavailable' ? `<h3>ULTIMATE EDITION UPGRADE</h3><ul class="ps-bullets">${ULTIMATE_UPGRADE_BULLETS.map(b => `<li>${esc(b)}</li>`).join('')}</ul>` : ''}</section>`
    : `<section class="ps-legal-info"><h2>Game and Legal Info</h2><ul class="ps-bullets">${p.bullets.map(b => `<li>${esc(b)}</li>`).join('')}</ul></section>`
  const table = `<section class="ps-game-info"><h2>Game info</h2><dl class="ps-info-table"><div><dt>Platform:</dt><dd>${esc(platformChips(p).join(', '))}</dd></div><div><dt>Release:</dt><dd>${esc(p.release)}</dd></div><div><dt>Publisher:</dt><dd>${esc(p.publisher)}</dd></div><div><dt>Genres:</dt><dd>${esc(p.genres)}</dd></div></dl></section>`
  const legal = `<section class="ps-legal-text">${LEGAL_TEXT.map(t => `<p>${esc(t)}</p>`).join('')}</section>`
  return `${hero}<div class="ps-product-body">${compat}<section id="screenshots">${C.coverViewer(p)}</section>${editions}${upgrade}${info}${table}${legal}</div>`
}

export function fallbackPage({ base }) {
  return `<div class="ps-fallback"><h1>This probably isn't what you're looking for...</h1><p>Back to <a href="${base}/">Store</a> or <a href="${base}/">Home</a>.</p></div>`
}

export function libraryPage({ base, user, orders }) {
  const items = orders.flatMap(o => o.items.filter(it=>!byId(it.sku)?.physical).map(it => ({ ...it, order: o })))
  return `<div class="ps-library"><h1>Game Library</h1><p class="ps-muted">${esc(onlineId(user))} &nbsp;·&nbsp; <a href="${base}/logout">Sign Out</a></p>
  <nav class="ps-library-tabs" aria-label="Library"><span class="is-current" aria-current="page">Purchased</span><a href="${base}/en-us/wishlist">Wishlist</a><a href="${base}/en-us/payment-management">Payment Management</a></nav>
  ${items.length ? `<ul class="ps-library-list">${items.map(it => `<li>${byId(it.sku)?C.art(byId(it.sku)):''}<div><b>${esc(it.title)}</b><br><span class="ps-fine">${it.kind === 'game' ? `Pre-ordered · Releases ${esc(RELEASE)} · Order Number ${esc(it.order.order_number)}` : `Purchased · Order Number ${esc(it.order.order_number)}`}</span></div><a class="ps-pill ps-pill-outline" href="${base}/en-us/support?topic=Downloads">Download options</a></li>`).join('')}</ul>` : '<p>You have not purchased anything yet.</p>'}
  </div>`
}

// ---- Sony sign-in (separate domain in reality; rendered with the 'sony' chrome) ----
export function signInPage({ base, step = 'email', email = '', redirectUri = '', error = null }) {
  const action = `${base}${SONY_SIGNIN}/`
  const hidden = `<input type="hidden" name="redirect_uri" value="${esc(redirectUri)}">`
  const err = error ? `<p class="ps-error ps-error-box" role="alert">${esc(error)}</p>` : ''
  if (step === 'password') {
    return `<div class="ps-sony-card">
  <span class="ps-logo-mark ps-logo-mark-lg" aria-hidden="true">PS</span>
  <h1>Sign In</h1>${err}
  <form method="post" action="${action}" novalidate>
    ${hidden}<input type="hidden" name="step" value="password"><input type="hidden" name="email" value="${esc(email)}">
    <p class="ps-signin-id"><span>${esc(email)}</span> <a class="ps-link" href="${action}?redirect_uri=${encodeURIComponent(redirectUri)}&amp;email=${encodeURIComponent(email)}">Change</a></p>
    <div class="ps-field"><label for="password">Password</label><input id="password" name="password" type="password" autocomplete="current-password" required autofocus></div>
    <button type="submit" class="ps-pill ps-pill-blue ps-pill-block">Sign In</button>
    <p class="ps-center"><a class="ps-link" href="${base}/en-us/support?topic=Sign%20In">Trouble Signing In?</a></p>
  </form></div>`
  }
  return `<div class="ps-sony-card">
  <span class="ps-logo-mark ps-logo-mark-lg" aria-hidden="true">PS</span>
  <h1>Sign In</h1>${err}
  <form method="post" action="${action}" novalidate>
    ${hidden}<input type="hidden" name="step" value="email">
    <div class="ps-field"><label for="email">Sign-In ID (Email Address)</label><input id="email" name="email" type="email" autocomplete="username" value="${esc(email)}" required autofocus></div>
    <button type="submit" class="ps-pill ps-pill-blue ps-pill-block">Next</button>
    <button type="submit" name="passkey" value="1" class="ps-pill ps-pill-outline ps-pill-block">Sign in with Passkey</button>
    <p class="ps-center"><a class="ps-link" href="${base}/en-us/support?topic=Sign%20In">Trouble Signing In?</a></p>
  </form>
  <hr>
  <a class="ps-pill ps-pill-outline ps-pill-block" href="${signUpUrl(base, redirectUri)}">Create New Account</a>
</div>`
}

export function createAccountPage({ base, values = {}, errors = {}, redirectUri = '' }) {
  const v = (n) => esc(values[n] ?? '')
  const err = (n) => errors[n] ? `<span class="ps-error" id="err-${n}">${esc(errors[n])}</span>` : ''
  const input = (name, label, type = 'text', extra = '') => `<div class="ps-field"><label for="${name}">${label}</label><input id="${name}" name="${name}" type="${type}" value="${v(name)}" ${extra}${errors[name] ? ' aria-invalid="true"' : ''}>${err(name)}</div>`
  const select = (name, label, options) => `<div class="ps-field"><label for="${name}">${label}</label><select id="${name}" name="${name}">${options.map(([val, text]) => `<option value="${esc(val)}" ${values[name] === val ? 'selected' : ''}>${esc(text)}</option>`).join('')}</select>${err(name)}</div>`
  return `<div class="ps-sony-card ps-sony-card-wide">
  <h1>Create New Account</h1>
  ${Object.keys(errors).length ? `<p class="ps-error" role="alert">Please correct the highlighted fields.</p>` : ''}
  <form method="post" action="${base}${SONY_SIGNUP}/" novalidate>
    <input type="hidden" name="redirect_uri" value="${esc(redirectUri)}">
    ${input('dob', 'Date of Birth', 'date', 'autocomplete="bday" required')}
    ${select('country', 'Country/Region', [['US', 'United States']])}
    ${select('state', 'State/Province', [['', 'Select a state'], ...STATES.map(s => [s, s])])}
    ${select('language', 'Language', [['en-US', 'English (United States)']])}
    ${input('email', 'Sign-In ID (Email Address)', 'email', 'autocomplete="email" required')}
    ${input('password', 'Password', 'password', 'autocomplete="new-password" required')}
    ${input('onlineId', 'Online ID', 'text', 'autocomplete="username" required')}
    ${input('firstName', 'First Name', 'text', 'autocomplete="given-name" required')}
    ${input('lastName', 'Last Name', 'text', 'autocomplete="family-name" required')}
    <label class="ps-check"><input type="checkbox" name="marketing" value="1" ${values.marketing ? 'checked' : ''}> Send me emails about PlayStation products, services and promotions</label>
    <label class="ps-check"><input type="checkbox" name="terms" value="1" ${values.terms ? 'checked' : ''}> I have read and agree to the PlayStation Terms of Service and User Agreement and Privacy Policy</label>${err('terms')}
    <button type="submit" class="ps-pill ps-pill-blue ps-pill-block">Create Account</button>
    <p class="ps-center"><a class="ps-link" href="${signInUrl(base, redirectUri)}">Already have an account? Sign In</a></p>
  </form></div>`
}

// ---- the checkout drawer (checkout.playstation.com client, rendered server-side) ----
function itemTile(product, { remove = '', dateLine = null } = {}) {
  const pre = product.cta === 'preorder'
  const dates = dateLine ?? (pre ? `<span class="ps-fine">Release Date: ${esc(product.release)}</span><span class="ps-fine">Expected download date: ${esc(PRELOAD)}</span>` : '')
  return `<div class="ps-item">${C.art(product)}<div class="ps-item-info"><b>${esc(product.title)}</b>${product.physical?`<span class="ps-fine">Physical · ${esc(product.formatLabel)} · ${esc(product.shippingLabel)}</span>`:`<span class="ps-esrb-badge ps-esrb-small">${esc(product.rating)}</span>`}${dates}${remove}</div><div class="ps-item-price">${priceText(product)}</div></div>`
}

export function drawerSignIn({ base, returnTo }) {
  return `<div class="ps-drawer-body ps-drawer-login"><h2>Sign In To Proceed</h2><a class="ps-pill ps-pill-blue ps-pill-wide" href="${signInUrl(base, returnTo)}">Sign In</a></div>`
}

export function drawerEmptyCart({ closeHref }) {
  return `<div class="ps-drawer-body ps-drawer-empty"><h2>Your Cart</h2><p>Your cart is empty.</p><a class="ps-pill ps-pill-orange ps-pill-wide" href="${closeHref}">Continue Shopping</a></div>`
}

// What checkout.playstation.com shows when it cannot load a view ("Error | Checkout").
export function drawerError({ closeHref, message = null }) {
  return `<div class="ps-drawer-body ps-drawer-error"><h2>Something went wrong.</h2>${message ? `<p role="alert">${esc(message)}</p>` : ''}<a class="ps-pill ps-pill-blue ps-pill-wide" href="${closeHref}">Close</a></div>`
}

const instrumentLabel = (i) => i.type === 'card' ? `${esc(i.brand)} · Card ending in ${esc(i.last4)}` : 'PayPal'

export function drawerConfirm({ base, mode, t, drawerPath, closeHref, instruments = [], selected = null, error = null, notice = null, reviewToken = '', shippingValues = {} }) {
  const isPreorder = t.lines.some(l => l.product.cta === 'preorder')
  const heading = mode === 'buynow' ? (isPreorder ? 'Confirm Pre-Order' : 'Confirm Purchase') : `Cart (${t.count} Item${t.count === 1 ? '' : 's'})`
  const btn = isPreorder ? 'Pre-Order &amp; Pay' : 'Confirm Purchase'
  const legal = isPreorder
    ? 'You\'ll be charged for your pre-order when you select [Pre-Order & Pay]. If the price drops before the product is released, we\'ll refund you the difference. When you select [Pre-Order & Pay], you agree the purchase is governed by the PlayStation Terms of Service. You also acknowledge that your purchase of any digital content amounts to a license, subject to the PlayStation End User License Agreement.'
    : 'By selecting [Confirm Purchase], you agree to complete the purchase in accordance with the PlayStation Terms of Service before using this content. You also acknowledge that your purchase of any digital content amounts to a license, subject to the PlayStation End User License Agreement.'
  const items = t.lines.map(l => itemTile(l.product, {
    remove: mode === 'cart' ? `<form method="post" action="${base}/en-us/cart/remove"><input type="hidden" name="sku" value="${esc(l.product.id)}"><button type="submit" class="ps-link-btn" aria-label="Remove ${esc(l.product.title)} from cart">Remove</button></form>` : '',
  })).join('')
  return `<div class="ps-drawer-body">
  <h2>${heading}</h2>
  ${notice ? `<p class="ps-notice" role="status">${esc(notice)}</p>` : ''}
  <div class="ps-items">${items}</div>
  <form method="post" action="${drawerPath}" class="ps-confirm-form" novalidate><input type="hidden" name="review_token" value="${esc(reviewToken)}">
    ${t.lines.some(l=>l.product.physical)?shippingFields(shippingValues):''}
    <section class="ps-pay">
      <h3>Payment method</h3>
      <div class="ps-wallet"><span>Wallet Balance</span><b>${money(WALLET_BALANCE)}</b></div>
      <p class="ps-fine">Wallet funds are used first. Any remaining balance is charged to your selected payment method.</p>
      ${error ? `<p class="ps-error ps-error-box" role="alert">${esc(error)}</p>` : t.total===0?'<p class="ps-select-pm">No payment method needed. Add this free digital license to your library.</p>':'<p class="ps-select-pm">Please select a payment method.</p>'}
      ${instruments.map(i => `<label class="ps-instrument"><input type="radio" name="paymentMethod" value="${esc(i.id)}" ${selected === i.id ? 'checked' : ''}><span>${instrumentLabel(i)}</span>${i.default ? '<span class="ps-default-tag">Default</span>' : ''}</label>`).join('')}
      ${t.total>0?`<a class="ps-pill ps-pill-outline" href="${drawerPath}/payment">Add Payment Method</a>`:''}
    </section>
    <dl class="ps-summary">
      <div><dt>Subtotal</dt><dd>${money(t.subtotal)}</dd></div>
      <div><dt>Tax</dt><dd>${money(t.tax)}</dd></div>
      <div class="ps-total"><dt>Total (${t.count} item${t.count === 1 ? '' : 's'})</dt><dd>${money(t.total)}</dd></div>
    </dl>
    <p class="ps-fine"><a class="ps-link" href="${base}/en-us/support?topic=Taxes">Learn more about taxes and fees</a></p>
    <div class="ps-visa-strip">Earn points and get rewarded when you use the PlayStation&reg; Credit Card.</div>
    <p class="ps-legal">${esc(legal)}</p>
    <button type="submit" class="ps-pill ps-pill-orange ps-pill-block">${btn}</button>
    <p class="ps-center"><a class="ps-link" href="${closeHref}">Continue Shopping</a></p>
  </form>
</div>`
}

export function drawerAddPayment({ drawerPath, cardCount = 0 }) {
  return `<div class="ps-drawer-body">
  <h2>Add Payment Method</h2>
  <p class="ps-fine">Add your payment method (maximum 3 credit/debit cards).</p>
  ${cardCount >= 3 ? `<p class="ps-error" role="alert">You have reached the maximum of three credit/debit cards on file.</p>` : `<a class="ps-option-row" href="${drawerPath}/payment/card">Add a Credit/Debit Card <span aria-hidden="true">&#8250;</span></a>`}
  <form method="post" action="${drawerPath}/payment/service"><input type="hidden" name="service" value="paypal"><button type="submit" class="ps-option-row">Add a PayPal Account <span aria-hidden="true">&#8250;</span></button></form>
  <p class="ps-fine">Your default payment method is used to complete your purchase when your wallet doesn't have enough funds.</p>
  <p class="ps-center"><a class="ps-link" href="${drawerPath}">Cancel</a></p>
</div>`
}

const field = (values, errors) => (name, label, type = 'text', extra = '', help = '') => `<div class="ps-field"><label for="${name}">${label}</label><input id="${name}" name="${name}" type="${type}" value="${esc(values[name] ?? '')}" ${extra}${errors[name] ? ` aria-invalid="true" aria-describedby="err-${name}"` : ''}>${help ? `<span class="ps-help">${help}</span>` : ''}${errors[name] ? `<span class="ps-error" id="err-${name}">${esc(errors[name])}</span>` : ''}</div>`

// Card screen of the hosted transact iframe: labels from its en-us string file (research/playstation-store.md step 6).
export function drawerCardForm({ drawerPath, values = {}, errors = {} }) {
  const f = field(values, errors)
  const year = benchmarkDate()?.getUTCFullYear() ?? new Date().getFullYear()
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'))
  const years = Array.from({ length: 16 }, (_, i) => String(year + i))
  const expInvalid = errors.expiry ? ' aria-invalid="true" aria-describedby="err-expiry"' : ''
  const select = (name, label, options, auto) => `<div class="ps-field"><label for="${name}">${label}</label><select id="${name}" name="${name}" autocomplete="${auto}" required${expInvalid}><option value="">${label}</option>${options.map(o => `<option value="${o}" ${String(values[name] ?? '') === o ? 'selected' : ''}>${o}</option>`).join('')}</select></div>`
  return `<div class="ps-drawer-body">
  <h2>Add a Credit/Debit Card</h2>
  <p class="ps-fine">We accept Visa, Mastercard, American Express and Discover.</p>
  <form method="post" action="${drawerPath}/payment/card" novalidate>
    ${f('cardNumber', 'Credit/Debit Card Number', 'text', 'autocomplete="cc-number" inputmode="numeric" required')}
    ${f('cardholderName', 'Cardholder\'s Name', 'text', 'autocomplete="cc-name" required')}
    <fieldset class="ps-fieldset"><legend>Expires On</legend>
      <div class="ps-2col">${select('expMonth', 'Month', months, 'cc-exp-month')}${select('expYear', 'Year', years, 'cc-exp-year')}</div>
      ${errors.expiry ? `<span class="ps-error" id="err-expiry">${esc(errors.expiry)}</span>` : ''}
    </fieldset>
    ${f('cvv', 'CVV', 'text', 'autocomplete="cc-csc" inputmode="numeric" maxlength="4" required', 'This is the 3- or 4-digit code on your credit/debit card.')}
    <button type="submit" class="ps-pill ps-pill-blue ps-pill-block">Next</button>
    <p class="ps-center"><a class="ps-link" href="${drawerPath}/payment">Back</a></p>
  </form>
</div>`
}

export function drawerBillingForm({ drawerPath, card, values = {}, errors = {} }) {
  const f = field(values, errors)
  const err = (n) => errors[n] ? `<span class="ps-error" id="err-${n}">${esc(errors[n])}</span>` : ''
  return `<div class="ps-drawer-body">
  <h2>Billing Information</h2>
  <p class="ps-fine">${esc(card.brand)} · Card ending in ${esc(card.last4)}</p>
  <form method="post" action="${drawerPath}/payment/card/billing" novalidate>
    <div class="ps-2col">${f('firstName', 'First name', 'text', 'autocomplete="given-name" required')}${f('lastName', 'Last name', 'text', 'autocomplete="family-name" required')}</div>
    ${f('address1', 'Street address', 'text', 'autocomplete="address-line1" required')}
    ${f('address2', 'Address 2 (optional)', 'text', 'autocomplete="address-line2"')}
    ${f('city', 'City', 'text', 'autocomplete="address-level2" required')}
    <div class="ps-2col">
      <div class="ps-field"><label for="state">State</label><select id="state" name="state" autocomplete="address-level1" required${errors.state ? ' aria-invalid="true" aria-describedby="err-state"' : ''}><option value="">Select a state</option>${STATES.map(s => `<option value="${s}" ${values.state === s ? 'selected' : ''}>${s}</option>`).join('')}</select>${err('state')}</div>
      ${f('zip', 'ZIP Code', 'text', 'autocomplete="postal-code" inputmode="numeric" required')}
    </div>
    <div class="ps-field"><label for="country">Country or region</label><select id="country" name="country" autocomplete="country"><option value="US" selected>United States</option></select></div>
    ${f('phone', 'Phone number', 'tel', 'autocomplete="tel" required')}
    <label class="ps-check"><input type="checkbox" name="setDefault" value="1" ${values.setDefault === undefined || values.setDefault ? 'checked' : ''}> Set as Default Payment Method</label>
    <button type="submit" class="ps-pill ps-pill-blue ps-pill-block">Save</button>
    <p class="ps-center"><a class="ps-link" href="${drawerPath}/payment/card">Back</a></p>
  </form>
</div>`
}

// The client's /thankyou view. The real screen has no order number (it is only in the receipt email);
// the clone adds a receipt line with it because every clone's confirmation must show one.
export function drawerThankYou({ base, order, closeHref }) {
  const hasPreorder = order.items.some(it => it.kind === 'game')
  const d = new Date(order.created_at)
  const when = `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()} ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
  const items = order.items.map(it => {
    const p = byId(it.sku)
    return `<div class="ps-item">${p?C.art(p):''}<div class="ps-item-info"><b>${esc(it.title)}</b>${it.kind === 'game' ? `<span class="ps-fine">This game will be released on ${esc(RELEASE)}.</span>` : ''}</div><div class="ps-item-price">${money(it.unit_price)}</div></div>`
  }).join('')
  return `<div class="ps-drawer-body ps-thankyou">
  <h2>Thank you for your purchase!</h2>
  <p class="ps-online-id">${esc(order.customer.online_id)}</p>
  <div class="ps-items">${items}</div>
  ${shippingReceipt(order)}
  ${order.meta.entitlements?.length?`<div class="ps-download-hint"><h3>${order.items.some(it=>byId(it.sku)?.contentType!=='consumable')?'Download to Console':'Find your in-game content'}</h3><p>Games and add-ons appear in Game Library. Pre-orders unlock on their release date. In-game currency is available within its compatible game.</p></div>`:''}
  <div class="ps-receipt"><p>Receipt for <b>${esc(order.customer.email)}</b>.</p><p>Order Number: <b data-order-number>${esc(order.order_number)}</b> &nbsp;·&nbsp; ${esc(when)} &nbsp;·&nbsp; Total ${money(order.totals.total)}</p></div>
  ${hasPreorder ? `<p class="ps-fine">Your one month of GTA+: you'll receive a confirmation email with redemption instructions. Your GTA+ subscription is non-transferable, and can only be redeemed on the account used to pre-order the game. Must be redeemed by March 31st 2027.</p>` : ''}
${order.meta.entitlements?.length?`<a class="ps-pill ps-pill-blue ps-pill-block" href="${base}/en-us/library">Download from Library</a>`:`<a class="ps-pill ps-pill-blue ps-pill-block" href="${base}/en-us/transactions">View transaction history</a>`}
  <a class="ps-pill ps-pill-outline ps-pill-block" href="${closeHref}">Continue Shopping</a>
  <p class="ps-legal">${order.shipping_address?'Physical items ship to the address above. Digital licenses, where included, remain separate.':'Purchase grants a license to the digital product subject to the PlayStation Terms of Service and the PlayStation Store Cancellation Policy.'}</p>
</div>`
}
