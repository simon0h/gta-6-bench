import { productImage, productGallery } from '../../lib/product-assets.js'
import { fixtureCatalog } from '../../lib/catalog-policy.js'
import { benchmarkDate } from '../../lib/payment.js'
import { physicalPage, shippingFields, shippingReceipt } from '../playstation-store/physical.js'
import { esc, money, disclaimer } from '../../lib/html.js'
import { productPath, byId, STATES, ESRB, RELEASE, isBuyable, PRODUCTS } from './data.js'
import * as discovery from './discovery.js'
import { megaNav, footerCols, homeHero, shopStrip, followXbox } from './site.js'

const NAME = 'Xbox Store'
const referenceCover = p => p.id === '9nnzsnhlr63l' ? 'gta-vi-ultimate-cover.jpg' : ['9p3h4968grsm','9nl3wwnzlzzn'].includes(p.id) ? 'gta-vi-cover.png' : null
export const artwork = (p,cls='') => referenceCover(p) ? `<img class="${esc(cls)}" src="/static/reference/xbox-store/${referenceCover(p)}" alt="${esc(p.title)}">` : productImage('xbox-store',p,{className:cls})
const utilityIcon = name => name === 'search' ? '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10" cy="10" r="6.5"/><path d="m15 15 6 6"/></svg>' : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 3h3l2 12h12l3-9H6"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/></svg>'
const xboxMark = '<svg class="xb-mark" viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="15" fill="currentColor"/><path d="M5 7q5-3 11 3q6-6 11-3q-5 1-8 6q7 8 8 13q-6-6-11-10q-6 4-11 10q1-6 8-13Q10 8 5 7" fill="white"/></svg>'


export const signinUrl = (base, ru = '') => `${base}/login.live.com/oauth20_authorize.srf?prompt=select_account${ru ? `&ru=${encodeURIComponent(ru)}` : ''}`

const price = (p) => p.price === null ? esc(p.cta || 'View game') : p.price === 0 ? 'Free<sup>+</sup>' : `${money(p.price)}${p.iap ? '<sup>+</sup>' : ''}`
const buyWord = (p) => p.price === 0 ? 'Get' : p.ribbon === 'PRE-ORDER' ? 'Pre-order' : 'Buy'
const tileLabel = (p) => p.price === null ? p.title : p.listPrice ? `${p.title}, Original price ${money(p.listPrice)}, on sale for ${money(p.price)}` : `${p.title}, ${money(p.price)}`

const head = (base, title) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<link rel="stylesheet" href="${base}/static/style.css"><link rel="stylesheet" href="${base}/static/site.css"></head>`

export function layout({ base, title, body, cartCount = 0, user = null, theme = 'light', path = '' }) {
  return `${head(base, `${title} | XBOX`)}
<body class="xb-${esc(theme)}">
<a class="xb-skip" href="#main-content">Skip to main content</a>
<header class="xb-header">
  <div class="xb-header-inner">
    <a class="xb-ms" href="${base}/en-US/all-microsoft" aria-label="Microsoft"><img class="xb-brand-ms" src="/static/reference/xbox-store/microsoft-logo.png" alt="Microsoft"></a>
    <span class="xb-divider" aria-hidden="true"></span>
    <a class="xb-logo" href="${base}/" aria-label="Xbox home"><img class="xb-brand-xbox" src="/static/reference/xbox-store/xbox-logo.png" alt="Xbox"></a>
    <nav class="xb-nav" aria-label="Primary">${megaNav(base)}</nav>
    <div class="xb-utils">
      <a class="xb-allms" href="${base}/en-US/all-microsoft">All Microsoft <span aria-hidden="true">⌄</span></a>
      <details class="xb-search xb-menu-host">
        <summary class="xb-search-toggle" role="button" aria-expanded="false" aria-label="Search Xbox.com">${utilityIcon('search')}</summary>
        <form class="xb-search-box" action="${base}/en-US/search/results" method="get" role="search">
          <input type="search" name="q" placeholder="Search Xbox.com" aria-label="Search Xbox.com" list="xb-header-suggestions"><datalist id="xb-header-suggestions">${PRODUCTS.filter(p=>p.type==='game'&&isBuyable(p)).slice(0,12).map(p=>`<option value="${esc(p.title)}"></option>`).join('')}</datalist>
          <button type="submit" class="xb-btn xb-btn-buy">Search</button>
          <button type="button" class="xb-btn xb-btn-grey" data-close>Cancel</button>
        </form>
      </details>
      <a class="xb-cart" href="${base}/en-US/cart" aria-label="Cart, ${cartCount} item${cartCount === 1 ? '' : 's'}">${utilityIcon('cart')}${cartCount ? `<span class="xb-badge">${cartCount}</span>` : ''}</a>
      ${user
        ? `<a class="xb-me" href="${base}/account" aria-label="Account manager for ${esc(user.first_name || user.email)}"><span class="xb-avatar" aria-hidden="true">${esc((user.first_name || user.email || '?').slice(0, 1).toUpperCase())}</span><span>${esc(user.first_name || 'Account')}</span></a><a class="xb-signout" href="${base}/signout">Sign out</a>`
        : `<a class="xb-me" href="${signinUrl(base, path === base || path === `${base}/` ? "" : path)}" aria-label="Sign in"><span class="xb-avatar" aria-hidden="true">ME</span><span>Sign in</span></a>`}
    </div>
  </div>
</header>
<main class="xb-main" id="main-content">${body}</main>
<footer class="xb-footer">
  ${footerCols(base)}
  ${disclaimer(NAME)}
</footer>
<script>${MENU_JS}</script>
</body></html>`
}

// Optional polish for the <details> menus (search box, CHOOSE EDITION, "...", chat): close on outside click or
// Escape, keep aria-expanded in sync, focus the search box, and let Enter in the promo box apply the code.
// Everything still works without it.
const MENU_JS = `
document.addEventListener('click', function (e) {
  document.querySelectorAll('details.xb-menu-host[open]').forEach(function (d) { if (!d.contains(e.target)) d.open = false })
  var c = e.target.closest('[data-close]'); if (c) c.closest('details').open = false
})
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') document.querySelectorAll('details.xb-menu-host[open]').forEach(function (d) { d.open = false; d.querySelector('summary').focus() })
  if (e.key === 'Enter' && e.target.dataset && e.target.dataset.enter) { e.preventDefault(); document.getElementById(e.target.dataset.enter).click() }
})
document.addEventListener('toggle', function (e) {
  var d = e.target, s = d.querySelector && d.querySelector(':scope > summary[role=button]')
  if (!s) return
  s.setAttribute('aria-expanded', String(d.open))
  if (d.open) document.querySelectorAll('details.xb-menu-host[open]').forEach(function (other) { if (other !== d && !other.contains(d) && !d.contains(other)) other.open = false })
  var q = d.open && d.querySelector('input[type=search]'); if (q) q.focus()
}, true)
if (window.matchMedia('(max-width: 900px)').matches) document.querySelectorAll('.xb-filter-panel').forEach(function (d) { d.open = false })`

// Microsoft-account pages (login.live.com look): no store header, dark card on a gradient.
export function authLayout({ base, title, body }) {
  return `${head(base, title)}
<body class="xb-auth-body">
<main class="xb-auth-main">
  <div class="xb-auth-card">
    <div class="xb-ms xb-ms-big"><span class="xb-ms-logo" aria-hidden="true"><i></i><i></i><i></i><i></i></span>Microsoft</div>
    ${body}
  </div>
</main>
<footer class="xb-auth-footer">
  <span class="xb-logo xb-logo-small">${xboxMark}XBOX</span>
  <a href="${base}/en-US/support">Help and feedback</a><a href="${base}/en-US/terms">Terms of use</a><a href="${base}/en-US/privacy">Privacy and cookies</a>
  <span>Use private browsing if this is not your device. <a href="${base}/en-US/support">Learn more</a></span>
  ${disclaimer(NAME)}
</footer>
</body></html>`
}

// ---- shared bits ----
// Text-only placeholder cover for listings without shared box art (no real artwork or logos).
export function coverArt(p) {
  const words = `${p.family === 'gta-vi' && p.type === 'add-on' ? 'GTA VI ' : ''}${p.shortTitle}`.toUpperCase().split(' ')
  const lines = []
  for (const w of words) {
    const last = lines.length ? lines[lines.length - 1] : null
    if (last !== null && `${last} ${w}`.length <= 12) lines[lines.length - 1] = `${last} ${w}`
    else lines.push(w)
  }
  const y0 = 200 - (lines.length - 1) * 19
  return `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="380" viewBox="0 0 300 380" role="img" aria-label="${esc(p.title)} placeholder art">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3a2a5c"/><stop offset="1" stop-color="#101114"/></linearGradient></defs>
<rect width="300" height="380" fill="url(#g)"/><rect width="300" height="34" fill="#107c10"/>
<text x="150" y="23" font-family="Arial,Helvetica,sans-serif" font-size="14" font-weight="700" fill="#fff" text-anchor="middle">${p.type === 'add-on' ? 'ADD-ON' : 'DIGITAL GAME'}</text>
${lines.map((l, i) => `<text x="150" y="${y0 + i * 38}" font-family="Impact,Arial Black,sans-serif" font-size="32" fill="#fff" text-anchor="middle">${esc(l)}</text>`).join('\n')}
<text x="150" y="350" font-family="Arial,Helvetica,sans-serif" font-size="12" fill="#ddd" text-anchor="middle">${esc(p.publisher.toUpperCase())}</text>
</svg>`
}

export function tile(base, p) {
  return `<a class="xb-tile" href="${productPath(base, p)}" aria-label="${esc(tileLabel(p))}">
  ${artwork(p)}
  <span class="xb-tile-title">${esc(p.title)}</span>${p.physical?`<span class="xb-tile-format">Physical · ${esc(p.formatLabel)}</span>`:''}
  <span class="xb-tile-price">${p.listPrice ? `<s>${money(p.listPrice)}</s> ` : ''}${price(p)}${p.discount ? ` <b class="xb-discount">${esc(p.discount)}</b>` : ''}</span>
  ${p.subscriptions?.length ? `<span class="xb-included">Included with Game Pass</span>` : ''}${p.ribbon ? `<span class="xb-ribbon">${esc(p.ribbon)}</span>` : ''}
</a>`
}

const esrbMini = (base,p) => `${p.family === 'gta-vi' ? '<img class="xb-rating-image" src="/static/reference/xbox-store/esrb-mature.png" alt="ESRB Mature 17+">' : `<span class="xb-esrb-icon" aria-hidden="true">${esc(p.age)}</span>`}<div class="xb-rating-copy"><a class="xb-pill" href="${base}/en-US/support">${esc(p.ageNote)}</a>${p.contentDescriptors?` <div class="xb-rating-descriptors">${esc(p.contentDescriptors)}${p.iap?'<hr>In-Game Purchases':''}</div>`:''}</div>`

const chatBubble = (base) => `<details class="xb-chat xb-menu-host"><summary role="button" aria-expanded="false">Need help? Let's chat</summary>
<div class="xb-chat-panel"><b>Can we help you?</b><p>Find answers about pre-orders, payments and your orders.</p><a class="xb-btn xb-btn-buy" href="${base}/en-US/support">Get help</a> <button type="button" class="xb-btn xb-btn-grey" data-close>No thanks</button></div></details>`

const monthOptions = (sel) => Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map(m => `<option value="${m}" ${sel === m ? 'selected' : ''}>${m}</option>`).join('')
const yearOptions = (sel) => { const y0 = benchmarkDate()?.getUTCFullYear() ?? new Date().getFullYear(); return Array.from({ length: 16 }, (_, i) => String(y0 + i)).map(y => `<option value="${y}" ${sel === y ? 'selected' : ''}>${y}</option>`).join('') }

// A radio inside its label, also tied by for/id so tools that only read for/id still see the label text.
const radio = (name, value, label, current) => `<label class="xb-radio" for="${name}-${value}"><input type="radio" id="${name}-${value}" name="${name}" value="${esc(value)}" ${current === value ? 'checked' : ''}> ${esc(label)}</label>`

// Payment picker used by the purchase dialog and the cart checkout page.
// Fields per Xbox Support: card number, cardholder name, billing address, expiration date, CVV.
export function paymentFields({ values = {}, errors = {}, saved = [] }) {
  const v = (n) => esc(values[n] ?? '')
  const err = (n) => errors[n] ? `<span class="xb-error" id="err-${n}">${esc(errors[n])}</span>` : ''
  const input = (name, label, extra = '', cls = '') => `<div class="xb-field ${cls}"><label for="${name}">${label}</label><input id="${name}" name="${name}" type="text" value="${v(name)}" ${extra} ${errors[name] ? `aria-invalid="true" aria-describedby="err-${name}"` : ''}>${err(name)}</div>`
  const pi = values.pi ?? (saved.length ? '0' : 'new')
  const payType = values.payType ?? 'card'
  // .xb-pay lets CSS hide the new-card form while a saved method is picked, and the card fields while PayPal/Venmo is.
  return `<div class="xb-pay">${saved.length ? `<fieldset class="xb-saved"><legend>Saved payment methods</legend>
    ${saved.map((s, i) => radio('pi', String(i), s.label, pi)).join('')}
    ${radio('pi', 'new', 'Add a new payment method', pi)}
  </fieldset>` : '<input type="hidden" name="pi" value="new">'}
  <fieldset class="xb-newpay"><legend>Add a new payment method</legend>
    <div class="xb-paytypes">${radio('payType', 'card', 'Credit or debit card', payType)}${radio('payType', 'paypal', 'PayPal', payType)}${radio('payType', 'venmo', 'Venmo', payType)}</div>
    <p class="xb-fine">Visa, Mastercard, American Express and Discover are accepted, including prepaid cards. PayPal and Venmo are recorded locally; no provider sign-in or authorization occurs here.</p>
    <div class="xb-cardfields">
    ${input('cardNumber', 'Card number', 'autocomplete="cc-number" inputmode="numeric"')}
    <div class="xb-3col">
      <div class="xb-field"><label for="expMonth">Expiration month</label><select id="expMonth" name="expMonth" autocomplete="cc-exp-month" ${errors.expMonth ? 'aria-invalid="true" aria-describedby="err-expMonth"' : ''}><option value="">MM</option>${monthOptions(values.expMonth)}</select>${err('expMonth')}</div>
      <div class="xb-field"><label for="expYear">Expiration year</label><select id="expYear" name="expYear" autocomplete="cc-exp-year"><option value="">YYYY</option>${yearOptions(values.expYear)}</select></div>
      ${input('cvv', 'CVV', 'autocomplete="cc-csc" inputmode="numeric" maxlength="4"')}
    </div>
    ${input('nameOnCard', 'Name on card', 'autocomplete="cc-name"')}
    ${input('address1', 'Address line 1', 'autocomplete="address-line1"')}
    ${input('address2', 'Address line 2 (optional)', 'autocomplete="address-line2"')}
    <div class="xb-3col">
      ${input('city', 'City', 'autocomplete="address-level2"')}
      <div class="xb-field"><label for="state">State</label><select id="state" name="state" aria-label="State" autocomplete="address-level1" ${errors.state ? 'aria-invalid="true" aria-describedby="err-state"' : ''}><option value="">Select</option>${STATES.map(s => `<option value="${s}" ${values.state === s ? 'selected' : ''}>${s}</option>`).join('')}</select>${err('state')}</div>
      ${input('zip', 'ZIP code', 'autocomplete="postal-code" inputmode="numeric"')}
    </div>
    <div class="xb-field"><label for="country">Country/region</label><select id="country" name="country" aria-label="Country/region" autocomplete="country"><option value="US" selected>United States</option></select></div>
    <p class="xb-fine">Only the card brand and last four digits are saved. This store uses a 7% estimated digital tax; no bank authorization is performed.</p>
    </div>
  </fieldset></div>`
}

const totalsRows = (t) => `<div class="xb-rows"><div class="xb-row"><span>Subtotal</span><span>${money(t.subtotal)}</span></div><div class="xb-row"><span>Estimated tax</span><span>${money(t.tax)}</span></div><div class="xb-row xb-total"><span>Total</span><span>${money(t.total)}</span></div></div>`

const errorSummary = (errors) => Object.keys(errors).length ? `<div class="xb-error-summary" role="alert"><b>Check the highlighted fields.</b><ul>${Object.values(errors).map(e => `<li>${esc(e)}</li>`).join('')}</ul></div>` : ''

const paymentLine = (payment) => payment.method === 'card' ? `${esc(payment.brand)} &bull;&bull;&bull;&bull; ${esc(payment.last4)}` : payment.method === 'paypal' ? 'PayPal' : payment.method === 'venmo' ? 'Venmo' : payment.method === 'free' ? 'No payment required' : esc(payment.method)
const addressLine = (b) => b ? `${esc(b.line1)}${b.line2 ? `, ${esc(b.line2)}` : ''}, ${esc(b.city)}, ${esc(b.state)} ${esc(b.postal_code)}` : ''

// ---- pages ----
export const homePage = props => (fixtureHome(props) ? '' : homeHero(props.base)) + discovery.home({...props,tile}) + shopStrip(props.base, props.user) + followXbox(props.base)
const fixtureHome = () => fixtureCatalog
export const searchPage = props => discovery.searchPage({...props,tile})
export const gamePassPage = props => discovery.gamePass({...props,tile})
export const hubPage = props => discovery.hubs(props)

export function gridPage({ base, title, intro, products }) {
  return `<div class="xb-search-page"><h1>${esc(title)}</h1>${intro ? `<p>${esc(intro)}</p>` : ''}<div class="xb-grid xb-grid-4">${products.map(p => tile(base, p)).join('')}</div></div>`
}

export function productPage({ base, p, editions, related, inCart, owned = false, wishlistToken, menuOpen = false }) {
  if(p.physical)return physicalPage({base,p,action:`${base}/en-US/cart/add`,idField:'pid',buttonClass:'xb-btn xb-btn-buy',inCart,cartPath:`${base}/en-US/cart`})
  const path = productPath(base, p)
  const authentic = p.family === 'gta-vi'
  const isGame = p.type === 'game' && editions.length > 1
  const buy = owned ? `<a class="xb-btn xb-btn-buy" href="${base}/account/library">YOU OWN THIS · VIEW LIBRARY</a>` : isBuyable(p)
    ? `<form method="post" action="${path}/preorder"><button type="submit" class="xb-btn xb-btn-buy xb-btn-two" aria-label="${esc(buyWord(p) === 'Pre-order' ? 'Preorder' : buyWord(p))} ${esc(p.title)}. ${money(p.price)}"><span>${buyWord(p).toUpperCase()}</span><span class="xb-btn-sub">${price(p)}</span></button></form>`
    : `<p class="xb-not-sold">${esc(p.cta === 'View add-on' ? 'Included with your pre-order. Not sold separately.' : 'Not sold separately. See the included editions below.')}</p>`
  // The edition rows are plain links: picking the other edition navigates to its own product page.
  const editionPicker = isGame ? `<details class="xb-edition xb-menu-host"><summary class="xb-btn xb-btn-grey xb-btn-two" role="button" aria-expanded="false" aria-label="CHOOSE EDITION"><span>CHOOSE EDITION</span><span class="xb-btn-sub">${esc(p.title)} <img class="xb-chevron" src="/static/reference/xbox-store/chevron-down.svg" alt=""></span></summary>
    <div class="xb-edition-panel">${editions.map(e => `<a class="xb-edition-row ${e.id === p.id ? 'is-current' : ''}" href="${productPath(base, e)}" aria-label="${esc(tileLabel(e))}+" ${e.id === p.id ? 'aria-current="page"' : ''}>${artwork(e)}<span class="xb-edition-title">${esc(e.title)}</span><span class="xb-edition-price">${price(e)}</span></a>`).join('')}</div>
  </details>` : ''
  // menuOpen: right after a silent "Add to cart" the menu stays open and its entry now reads "Open cart".
  const overflow = isBuyable(p) ? `<details class="xb-overflow xb-menu-host" ${menuOpen ? 'open' : ''}><summary class="xb-btn xb-btn-grey" role="button" aria-expanded="${menuOpen}" aria-label="Overflow, press for more options">&hellip;</summary>
    <div class="xb-menu">
      <form method="post" action="${base}/en-US/wishlist"><input type="hidden" name="pid" value="${p.id}">${wishlistToken?`<input type="hidden" name="service_token" value="${wishlistToken}">`:""}<button class="xb-menu-item">&#9825; Add to wishlist</button></form>
      ${owned ? `<a href="${base}/account/library" class="xb-menu-item">View owned item</a>` : inCart ? `<a href="${base}/en-US/cart" class="xb-menu-item">&#128722; Open cart</a>` : `<form method="post" action="${base}/en-US/cart/add"><input type="hidden" name="pid" value="${p.id}"><button type="submit" class="xb-menu-item" aria-label="Add ${esc(p.title)} to cart">&#128722; Add to cart</button></form>`}
      <a href="${base}/en-US/redeem" class="xb-menu-item">&#9638; Redeem a code</a>
    </div></details>` : ''
  const rail = (title, items, id) => items.length ? `<section class="xb-section" ${id ? `id="${id}"` : ''}><h2>${esc(title)}</h2><div class="xb-rail-tiles">${items.map(r => `<a class="xb-mini-tile" href="${productPath(base, r)}" aria-label="${esc(tileLabel(r))}${r.ribbon ? `, ${esc(r.ribbon)}` : ''}">${artwork(r)}<span>${esc(r.title)}</span><b>${price(r)}</b>${r.ribbon ? `<em class="xb-ribbon-inline">${esc(r.ribbon)}</em>` : ''}</a>`).join('')}</div></section>` : ''
  const desc = p.description
  const shown = desc.slice(0, 5), more = desc.slice(5)
  const compare = isGame ? `<section class="xb-section" id="compare"><h2>Compare editions</h2><div class="xb-compare">
    ${editions.map(e => `<div class="xb-compare-card ${e.id === p.id ? 'is-this' : ''}">
      ${e.id === p.id ? '<span class="xb-tag">THIS EDITION</span>' : ''}
      ${artwork(e)}<h3>${esc(e.title)}</h3><p class="xb-compare-price">${price(e)}</p>
      <h4>Games included</h4><ul>${e.gamesIncluded.map(g => `<li>${esc(g)}</li>`).join('')}</ul>
      <h4>Add-ons included</h4><ul>${e.addonsIncluded.map(a => `<li>${esc(a)}</li>`).join('')}</ul>
      ${e.id === p.id ? `<a class="xb-btn xb-btn-grey" href="#buybox">RETURN TO TOP</a>` : `<a class="xb-btn xb-btn-buy" href="${productPath(base, e)}">GO TO GAME</a>`}
    </div>`).join('')}
  </div></section>` : ''
  const wishlist = `<form method="post" action="${base}/en-US/wishlist"><input type="hidden" name="pid" value="${p.id}">${wishlistToken?`<input type="hidden" name="service_token" value="${wishlistToken}">`:""}<button class="xb-btn xb-btn-grey xb-wishlist" aria-label="Add to wishlist"><img src="/static/reference/xbox-store/wishlist-icon.svg" alt=""></button></form>`
  const actions = `<div class="xb-buybox" id="buybox">${!owned&&p.type==='game'&&p.subscriptions.length?`<a class="xb-btn xb-btn-buy xb-btn-two" href="${base}/en-US/xbox-game-pass"><span>GET GAME PASS</span><span class="xb-btn-sub">Included in ${esc(p.subscriptions.includes('Premium')?'Premium':p.subscriptions[0])}</span></a><span class="xb-buy-or">OR</span>`:''}${buy}${editionPicker}${authentic ? wishlist : ''}${overflow}</div>`
  return `<div class="xb-hero${authentic ? ' xb-gta-hero' : ''}" id="top"><div class="xb-hero-backdrop" aria-hidden="true">${authentic ? '<img src="/static/reference/xbox-store/gta-vi-background.jpg" alt="">' : artwork(p)}</div>
  <div class="xb-hero-inner">
    ${referenceCover(p) ? artwork(p,'xb-cover') : productGallery('xbox-store',p,{className:'xb-cover'})}
    <div class="xb-hero-info">
      ${p.subscriptions.length ? '<p class="xb-pdp-pass">XBOX GAME PASS</p>' : ''}<h1>${esc(p.title)}</h1>
      <p class="xb-fine">Digital license · Delivered to your Xbox account library</p>
      <p class="xb-meta">${esc(p.publisher)} &bull; ${esc(p.genre)}${p.rating ? ` &bull; <span class="xb-stars" role="img" aria-label="Rating of ${esc(p.rating)} stars">&#9733;&#9733;&#9733;&#9733;&#9733;</span> ${esc(p.ratingCount)}` : ''}</p>
      <ul class="xb-badges">${p.capabilities.map(c=>`<li>${esc(c)}</li>`).join('')}${p.ribbon ? '<li><img class="xb-badge-icon" src="/static/reference/xbox-store/preorder-icon.svg" alt="">Pre-order</li>' : ''}<li><img class="xb-badge-icon" src="/static/reference/xbox-store/languages-icon.svg" alt="">${p.languages} Supported languages</li></ul>${authentic ? '' : `<p class="xb-entitlement">${esc(p.productType==='currency'?'Consumable currency':p.productType==='dlc'?'Game add-on':p.productType==='bundle'?'Game bundle':p.productType==='base-listing'?'Base game listing':'Digital game')}</p>`}
      ${authentic ? '' : actions}
    </div>
  </div>
  ${authentic ? actions : ''}
</div>
<div class="xb-esrb-strip"><div class="xb-esrb-left">${esrbMini(base,p)}</div>
  <div class="xb-esrb-right"><p>Publishers of games you launch receive access to your XBOX profile information and associated data while you play. <a href="${base}/en-US/support">Learn more</a></p>${p.iap ? '<p>+Offers in-app purchases.</p>' : ''}<p>Parental control information. <a href="${base}/en-US/support">Learn more</a></p></div></div>
<nav class="xb-pdp-tabs" aria-label="Product sections"><a href="${path}#details" class="is-active" aria-current="page">DETAILS</a><a href="${path}#reviews">REVIEWS</a><a href="${path}#more">MORE</a></nav>
${p.family === 'gta-vi' ? '<div id="details"></div>' : `<section class="xb-section" id="details"><h2>Game artwork</h2><details class="xb-art-viewer"><summary role="button" aria-expanded="false" aria-label="View cover art"><span class="xb-art-thumbnail">${artwork(p)}<span>Expand cover art ↗</span></span></summary><div class="xb-art-expanded">${artwork(p)}<p>${esc(p.title)}</p></div></details><p class="xb-fine">Original illustrative cover. This image is not a gameplay screenshot.</p></section>`}
${p.requires ? `<section class="xb-section xb-required"><h2>Requires a game</h2><p>This ${p.productType==='currency'?'currency pack':'add-on'} requires <a href="${productPath(base,byId(p.requires))}">${esc(byId(p.requires).title)}</a>. The base game is sold separately. You may purchase this item before acquiring the base game.</p>${p.repeatable?'<p>Consumable content may be purchased again; it is not a standalone playable game.</p>':''}</section>` : ''}
${rail('In this bundle', related.bundle)}
${rail('Included in', related.includedIn)}
<section class="xb-section xb-desc-grid"><div><h2>Description</h2>${shown.map(t => `<p>${esc(t)}</p>`).join('')}
  ${p.upgradeItems ? `<h3>ULTIMATE EDITION UPGRADE</h3><ul class="xb-caps">${p.upgradeItems.map(i => `<li>${esc(i)}</li>`).join('')}</ul><h3>Special Destinations Only Open for Business with the Ultimate Edition</h3><ul class="xb-caps">${p.destinations.map(i => `<li>${esc(i)}</li>`).join('')}</ul>` : ''}
  ${more.length ? `<details class="xb-more"><summary>Show more</summary>${more.map(t => `<p>${esc(t)}</p>`).join('')}</details>` : ''}</div>
  <aside><h2>Details</h2><dl class="xb-facts"><dt>Published by</dt><dd>${esc(p.publisher)}</dd><dt>Developed by</dt><dd>${esc(p.developer)}</dd><dt>Release date</dt><dd>${esc(p.release)}</dd><dt>${p.type==='add-on'?'Works with':'Play with'}</dt><dd>${p.platforms.map(esc).join('<br>')}</dd><dt>Players</dt><dd>${esc(p.players)}</dd><dt>Capabilities</dt><dd>${[...p.modes,...p.capabilities].map(esc).join('<br>')}</dd><dt>Accessibility</dt><dd>${p.accessibility.length?p.accessibility.map(esc).join(', '):'No features listed'}</dd><dt>Languages listed</dt><dd>${p.languageList.map(esc).join(', ')}</dd><dt>Game Pass</dt><dd>${p.subscriptions.length?p.subscriptions.map(plan=>`<a href="${base}/en-US/games/collection/game-pass?subscription=${plan}">${esc(plan)}</a>`).join(', '):'Not included'}</dd></dl></aside></section>
${p.family === 'gta-vi' ? '<div id="more"></div>' : ''}${compare}
${rail('Add-ons for this game', related.addons)}
${rail('You may also like', related.recommendations || [])}
<section class="xb-section" id="reviews"><h2>Reviews</h2><p class="xb-fine">${p.rating?`Community rating: ${esc(p.rating)} out of 5 from ${esc(p.ratingCount)} ratings.`:'No community ratings yet.'} Written reviews are not available in this store.</p></section>
${p.family === 'gta-vi' ? '' : gamePassPromo(base)}
${chatBubble(base)}`
}

// ASSUMPTION: the research saw no Game Pass block on this page (Game Pass does not change the GTA VI price), but the
// brief and research/COMPARISON.md count Xbox Game Pass among the upsells in the way, so a plain xbox.com-style
// promo with the April 2026 plan prices closes the page. It is the target of the MORE tab.
const gamePassPromo = (base) => `<section class="xb-section" id="more"><div class="xb-gp-card">
  <div><p class="xb-eyebrow">XBOX GAME PASS</p><h2>Discover your next favorite game</h2>
  <p>Explore included games for console, PC and cloud, and choose a plan for the way you play.</p></div>
  <a class="xb-btn xb-btn-outline" href="${base}/en-US/xbox-game-pass">JOIN NOW</a>
</div></section>`

// The Microsoft Store purchase dialog, rendered over the (inert) product page.
export function dialogOver({ pageBody, dialog }) {
  return `<div class="xb-under" aria-hidden="true" inert>${pageBody}</div><div class="xb-overlay"><div class="xb-dialog" role="dialog" aria-modal="true" aria-labelledby="dlg-title">${dialog}</div></div>`
}

const dialogItem = (p, extra = '') => `<div class="xb-dialog-item">${artwork(p)}<div><b>${esc(p.title)}</b><span>Digital &nbsp;·&nbsp; Release date: ${esc(p.release)}</span><span class="xb-dialog-price">${money(p.price)}</span>${extra}</div></div>`

// ASSUMPTION: the dialog was never observed. Research (JSON steps) and the brief give it two screens that both end
// in the purchase button: "Choose a way to pay" (payment method, order summary with tax, "Pre-order"), then the
// confirmation screen where "Pre-order" is pressed again ("On the confirmation screen, select Buy again").
export function payDialog({ base, p, t, values = {}, errors = {}, saved = [], paymentToken }) {
  const path = productPath(base, p)
  return `<div class="xb-dialog-head"><span class="xb-ms-mini">Microsoft Store</span><a class="xb-dialog-close" href="${path}" aria-label="Close">&times;</a></div>
  ${dialogItem(p)}
  <h2 id="dlg-title">${p.price===0?'Get this game':'Choose a way to pay'}</h2>
  ${errorSummary(errors)}
  <form method="post" action="${path}/buy" novalidate>
    ${paymentToken?`<input type="hidden" name="payment_token" value="${paymentToken}">`:''}
    ${p.price===0?'<p>No payment method is needed. Confirm to add the digital license to your account at no charge.</p>':paymentFields({ values, errors, saved })}
    <h3 class="xb-dialog-sub">Order summary</h3>
    ${totalsRows(t)}
    <div class="xb-dialog-actions"><button type="submit" class="xb-btn xb-btn-buy">${buyWord(p)}</button><a class="xb-btn xb-btn-grey" href="${path}">Cancel</a></div>
  </form>`
}

export function confirmDialog({ base, p, payment, billing, t, confirmToken, error }) {
  const path = productPath(base, p)
  const word = buyWord(p)
  return `<div class="xb-dialog-head"><span class="xb-ms-mini">Microsoft Store</span><a class="xb-dialog-close" href="${path}" aria-label="Close">&times;</a></div>
  ${dialogItem(p)}
  <h2 id="dlg-title">${p.price===0?'Confirm acquisition':'Confirm payment'}</h2>
  ${error ? errorSummary({payment:error}) : ''}
  <dl class="xb-pay-summary"><dt>Payment method</dt><dd>${paymentLine(payment)} <a href="${path}/buy">Change</a></dd>${billing ? `<dt>Billing address</dt><dd>${addressLine(billing)}</dd>` : ''}</dl>
  ${totalsRows(t)}
  ${word === 'Pre-order' ? `<p class="xb-fine">Your ${payment.method === 'card' ? 'card' : 'payment method'} won't be charged until about 10 days before the release date. If you pay with your Microsoft account balance, you're charged right away. You can cancel this pre-order from Order history up to 10 days before release.</p>` : ''}
  <p class="xb-fine">By selecting ${word}, you agree to the Microsoft Store Terms of Sale and acknowledge the Privacy Statement. Digital purchases are subject to the applicable cancellation and refund terms. See Xbox Support for help.</p>
  <form method="post" action="${path}/buy/confirm">${confirmToken?`<input type="hidden" name="confirm_token" value="${confirmToken}">`:''}<div class="xb-dialog-actions"><button type="submit" class="xb-btn xb-btn-buy">${word}</button><a class="xb-btn xb-btn-grey" href="${path}">Cancel</a></div></form>`
}

export function thanksCard({ base, order, p }) {
  const descriptions=order.meta.entitlements||[]
  const content=order.items.map(i=>{
    const product=byId(i.sku), entitlement=descriptions.find(e=>e.sku===i.sku), type=entitlement?.type||product?.entitlement
    const detail=product?.physical?'Physical item. Standard shipping in 3–5 business days. No digital license is granted.':entitlement?.preorder ? `Pre-order license. Unlocks on ${entitlement.release}.` : type==='consumable' ? `${entitlement?.quantity||product?.quantity} currency units added to your local entitlement record. Requires ${byId(entitlement?.requires||product?.requires)?.title||'the base game'}.` : type==='dlc' ? `Add-on license acquired. Requires ${byId(entitlement?.requires||product?.requires)?.title||'the base game'}, sold separately.` : type==='bundle' ? 'Game bundle license acquired. Included games and add-ons are listed on the product page.' : 'Game license acquired. Manage installation from My games & apps on a supported device.'
    return `<div class="xb-dialog-item">${product?artwork(product):''}<div><b>${esc(i.title)}</b><span>${product?.physical?'Physical':'Digital'} &nbsp;·&nbsp; Quantity: ${i.qty}</span><span class="xb-dialog-price">${money(i.unit_price)}</span><span>${esc(detail)}</span></div></div>`
  }).join('')
  return `<div class="xb-dialog-head"><span class="xb-ms-mini">Microsoft Store</span>${p ? `<a class="xb-dialog-close" href="${productPath(base,p)}" aria-label="Close">&times;</a>` : ''}</div>
  <h2 id="dlg-title" class="xb-thanks-title">&#10004; Thanks for your purchase</h2><p class="xb-order-number">Order #<span data-order-number>${esc(order.order_number)}</span></p>${content}${shippingReceipt(order)}
  <dl class="xb-pay-summary"><dt>Payment method</dt><dd>${paymentLine(order.payment)}</dd><dt>Total</dt><dd>${money(order.totals.total)} (includes ${money(order.totals.tax)} tax)</dd><dt>Email</dt><dd>${esc(order.customer.email)}</dd></dl>
  <p class="xb-fine">Confirmation: Microsoft Store - Order Confirmation (Order #${esc(order.order_number)}). This receipt is available in your local order history.</p>
  ${order.meta.preorder?`<p class="xb-fine">Pre-orders unlock on the release date listed above. ${order.payment.method==='free'?'No charge is due.':order.shipping_address?'Physical items are charged immediately. Digital pre-orders are charged about 10 days before their release date.':'Your payment method will be charged about 10 days before the release date.'} Manage your pre-order from Payment &amp; billing &gt; Order history.</p>`:''}
  <div class="xb-dialog-actions">${order.meta.entitlements?.length?`<a class="xb-btn xb-btn-buy" href="${base}/account/library">My library</a>`:''}<a class="xb-btn xb-btn-grey" href="${base}/account/billing/orders">Order history</a><a class="xb-btn xb-btn-grey" href="${p?productPath(base,p):`${base}/`}">Close</a></div>`
}

export function cartPage({ base, t, saved = [], cartId }) {
  if (!t.lines.length && !saved.length) {
    return `<div class="xb-cart-page"><div class="xb-cart-head"><h1>Cart</h1><a href="${base}/en-US/games/all-games/console">Keep shopping</a></div>
    <div class="xb-cart-empty"><p>Your cart is empty.</p><a class="xb-btn xb-btn-buy" href="${base}/en-US/games/all-games/console">Keep shopping</a></div>
    <p class="xb-fine">Need help? <a href="${base}/en-US/support">Contact support</a> &nbsp;·&nbsp; Cart: ${esc(cartId)}</p></div>`
  }
  const line = (l, savedRow) => `<div class="xb-line">
    ${artwork(l.product)}
    <div class="xb-line-info">
      <a class="xb-line-title" href="${productPath(base, l.product)}">${esc(l.product.title)}</a>
      ${l.product.physical?`<div>Physical · ${esc(l.product.formatLabel)} · ${esc(l.product.platforms.join(' / '))}</div><div>${esc(l.product.shippingLabel)}</div>`:`<div>Release date: ${esc(l.product.release)}</div><div class="xb-esrb-mini">${esrbMini(base,l.product)}</div><div>Digital</div>`}
      <div class="xb-line-price">${money(l.product.price)}</div>
      <div>Quantity: 1</div>
      <form method="post" action="${base}/en-US/cart/update" class="xb-line-actions"><input type="hidden" name="pid" value="${l.product.id}">
        ${savedRow ? `<button type="submit" name="action" value="move" class="xb-link-btn">Move to cart</button>` : `<button type="submit" name="action" value="remove" class="xb-link-btn">Remove</button> | <button type="submit" name="action" value="save" class="xb-link-btn">Save for later</button>`}
      </form>
      <div class="xb-fine">${l.product.physical?'Physical purchase; delivery address required at checkout.':'Buying or purchasing this digital item is a license.'} <a href="${base}/en-US/support">Learn more</a></div>
      ${l.product.iap ? '<div class="xb-fine">&dagger;Contains in-app purchases</div>' : ''}
    </div></div>`
  return `<div class="xb-cart-page">
  <div class="xb-cart-head"><h1>Cart</h1><a href="${base}/en-US/games/all-games/console">Keep shopping</a></div>
  <div class="xb-cart-grid">
    <div>${t.lines.length ? t.lines.map(l => line(l, false)).join('') : '<p>Your cart is empty.</p>'}
      ${saved.length ? `<h2 class="xb-saved-head">Saved for later</h2>${saved.map(l => line(l, true)).join('')}` : ''}</div>
    <div>
      <aside class="xb-cart-summary">
        <div class="xb-row"><span>Subtotal (${t.count} item${t.count === 1 ? '' : 's'})</span><span>${money(t.subtotal)}</span></div>
        <p class="xb-fine">Before applicable taxes</p>
        <form method="post" action="${base}/en-US/cart/checkout"><button type="submit" class="xb-btn xb-btn-checkout" ${t.lines.length ? '' : 'disabled'}>Checkout</button></form>
      </aside>
      <aside class="xb-cart-info"><b>Purchase and delivery</b><p>Physical products ship to your delivery address. Digital licenses appear in your library after checkout. Check each product’s supported devices.</p><a href="${base}/en-US/support/installation">How to find your games and add-ons</a></aside>
    </div>
  </div>
  <p class="xb-fine">Need help? <a href="${base}/en-US/support">Contact support</a> &nbsp;·&nbsp; Cart: ${esc(cartId)}</p>
</div>`
}

// Research: the order summary holds Subtotal / Estimated tax / Total, "Add a promo code" and "Place order". Its
// controls belong to the checkout form through form="co-form". "Place order" comes first in the markup so it is the
// form's default button (Enter in any field places the order); CSS shows the promo box above it.
export function checkoutPage({ base, user, t, values = {}, errors = {}, saved = [], promoError, checkoutToken }) {
  return `<div class="xb-checkout">
  <h1>Checkout</h1>
  <div class="xb-co-grid">
    <form id="co-form" method="post" action="${base}/en-US/checkout" class="xb-co-form" novalidate>
      ${checkoutToken?`<input type="hidden" name="checkout_token" value="${checkoutToken}">`:''}
      ${errorSummary(errors)}
      <section class="xb-co-section"><h2>Step 1: Account</h2>
        <p>${esc(user.email)}</p>
        <p class="xb-fine">${t.lines.some(l=>l.product.physical)?'Your cart contains physical items. Enter a shipping address below. Digital purchases remain separate.':'No shipping needed: everything in your cart is digital and will be added to your Microsoft account.'}</p>
      </section>
      ${t.lines.some(l=>l.product.physical)?shippingFields(values):''}
      <section class="xb-co-section"><h2>Step 2: Payment</h2>${t.total===0?'<p>No payment method needed. Your total is $0.00.</p>':paymentFields({ values, errors, saved })}</section>
    </form>
    <aside class="xb-summary" aria-labelledby="sum-title">
      <h2 id="sum-title">Order summary</h2>
      ${t.lines.map(l => `<div class="xb-row xb-sum-item"><span>${esc(l.product.title)}<br><small>${l.product.physical?`Physical · ${esc(l.product.formatLabel)} · Free standard shipping`:`Digital &nbsp;·&nbsp; Release date: ${esc(l.product.release)}`}</small></span><span>${money(l.product.price)}</span></div>`).join('')}
      ${totalsRows(t)}
      <button type="submit" form="co-form" name="action" value="place" class="xb-btn xb-btn-buy xb-btn-wide xb-place">Place order</button>
      <details class="xb-promo" ${promoError ? 'open' : ''}><summary role="button" aria-expanded="${!!promoError}">Add a promo code</summary>
        <div class="xb-promo-row"><div><label for="promo">Promo code</label><input id="promo" name="promo" type="text" form="co-form" data-enter="promo-apply" value="${esc(values.promo ?? '')}"></div><button type="submit" form="co-form" id="promo-apply" name="action" value="promo" class="xb-btn xb-btn-grey">Apply code</button></div>
        ${promoError ? `<span class="xb-error" role="alert">${esc(promoError)}</span>` : ''}</details>
      <div class="xb-co-terms">
        ${t.lines.some(l=>l.product.ribbon==='PRE-ORDER')?`<p class="xb-fine">${t.lines.some(l=>l.product.physical)?'Physical items are charged immediately. ':''}Pre-ordered items: if you use money in your Microsoft account, we'll charge you right away. If you use any other payment option, we may charge you up to 10 days before the release date.</p>`:''}
        <p class="xb-fine">By selecting Place order, you agree to the Microsoft Store Terms of Sale. The Terms of Sale in force at the time you place your order serve as the purchase contract between us.</p>
      </div>
    </aside>
  </div>
</div>`
}

export function thanksPage({ base, order, p }) {
  return `<div class="xb-thanks-page"><div class="xb-dialog xb-dialog-static">${thanksCard({ base, order, p })}</div></div>`
}

// ---- Microsoft account (login.live.com) screens ----
export function signinEmailPage({ base, error, email = '' }) {
  return `<h1>Sign in</h1><p class="xb-auth-sub">Use your Microsoft account.</p>
  ${error ? `<p class="xb-error" role="alert">${esc(error)}</p>` : ''}
  <form method="post" action="${base}/login.live.com/oauth20_authorize.srf">
    <label for="loginfmt">Email or phone number</label><input id="loginfmt" name="loginfmt" type="email" autocomplete="username" value="${esc(email)}" required>
    <a class="xb-auth-link" href="${base}/en-US/support">Forgot your username?</a>
    <div class="xb-auth-actions"><button type="submit" class="xb-btn xb-btn-buy">Next</button></div>
  </form>
  <p class="xb-auth-alt">New to Microsoft? <a href="${base}/signup.live.com/signup">Create an account</a></p>`
}

export function signinPasswordPage({ base, email, error }) {
  return `<div class="xb-auth-identity"><a href="${base}/login.live.com/oauth20_authorize.srf?username=${encodeURIComponent(email)}" aria-label="Back">&#8592;</a> <span>${esc(email)}</span></div>
  <h1>Enter password</h1>
  ${error ? `<p class="xb-error" role="alert">${esc(error)}</p>` : ''}
  <form method="post" action="${base}/login.live.com/password.srf">
    <label for="passwd">Password</label><input id="passwd" name="passwd" type="password" autocomplete="current-password" required>
    <a class="xb-auth-link" href="${base}/en-US/support">Forgot password?</a> <a class="xb-auth-link" href="${base}/en-US/support">Other ways to sign in</a>
    <div class="xb-auth-actions"><button type="submit" class="xb-btn xb-btn-buy">Sign in</button></div>
  </form>`
}

export function kmsiPage({ base }) {
  return `<h1>Stay signed in?</h1><p class="xb-auth-sub">Do this to reduce the number of times you are asked to sign in.</p>
  <form method="post" action="${base}/login.live.com/kmsi.srf">
    <label class="xb-check" for="dontshow"><input type="checkbox" id="dontshow" name="dontshow" value="1"> Don't show this again</label>
    <div class="xb-auth-actions"><button type="submit" name="kmsi" value="no" class="xb-btn xb-btn-grey">No</button><button type="submit" name="kmsi" value="yes" class="xb-btn xb-btn-buy">Yes</button></div>
  </form>`
}

export function signupPage({ base, values = {}, errors = {} }) {
  const v = (n) => esc(values[n] ?? '')
  const f = (name, label, type = 'text', extra = '') => `<label for="${name}">${label}</label><input id="${name}" name="${name}" type="${type}" value="${v(name)}" ${extra}>${errors[name] ? `<span class="xb-error">${esc(errors[name])}</span>` : ''}`
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const y0 = new Date().getFullYear()
  return `<h1>Create account</h1>
  <form method="post" action="${base}/signup.live.com/signup">
    ${f('email', 'Email', 'email', 'autocomplete="email" placeholder="someone@example.com"')}
    <p class="xb-fine"><a href="${base}/signup.live.com/signup">Get a new email address</a> &nbsp;·&nbsp; <a href="${base}/signup.live.com/signup">Use a phone number instead</a></p>
    ${f('password', 'Password', 'password', 'autocomplete="new-password"')}
    <div class="xb-2col"><div>${f('firstName', 'First name', 'text', 'autocomplete="given-name"')}</div><div>${f('lastName', 'Last name', 'text', 'autocomplete="family-name"')}</div></div>
    <label for="country">Country/region</label><select id="country" name="country" autocomplete="country"><option value="US" selected>United States</option></select>
    <fieldset class="xb-birth"><legend>Birthdate</legend><div class="xb-3col">
      <div><label for="birthMonth">Month</label><select id="birthMonth" name="birthMonth" autocomplete="bday-month"><option value="">Month</option>${months.map((m, i) => `<option value="${i + 1}" ${String(values.birthMonth) === String(i + 1) ? 'selected' : ''}>${m}</option>`).join('')}</select></div>
      <div><label for="birthDay">Day</label><select id="birthDay" name="birthDay" autocomplete="bday-day"><option value="">Day</option>${Array.from({ length: 31 }, (_, i) => `<option value="${i + 1}" ${String(values.birthDay) === String(i + 1) ? 'selected' : ''}>${i + 1}</option>`).join('')}</select></div>
      <div><label for="birthYear">Year</label><select id="birthYear" name="birthYear" autocomplete="bday-year"><option value="">Year</option>${Array.from({ length: 100 }, (_, i) => `<option value="${y0 - i}" ${String(values.birthYear) === String(y0 - i) ? 'selected' : ''}>${y0 - i}</option>`).join('')}</select></div>
    </div>${errors.birthdate ? `<span class="xb-error">${esc(errors.birthdate)}</span>` : ''}</fieldset>
    <p class="xb-fine">Choosing Next means that you agree to the Microsoft Services Agreement and privacy and cookies statement.</p>
    <div class="xb-auth-actions"><button type="submit" class="xb-btn xb-btn-buy">Next</button></div>
  </form>
  <p class="xb-auth-alt">Already have an account? <a href="${base}/login.live.com/oauth20_authorize.srf">Sign in</a></p>`
}

export function simplePage({ title, html }) {
  return `<div class="xb-simple"><h1>${esc(title)}</h1>${html}</div>`
}
