import { esc, money, disclaimer } from '../../lib/html.js'
import { productPath, byId, STATES, ESRB, RELEASE } from './data.js'

const NAME = 'Xbox Store'
const NAV = [['Game Pass', '/en-US/xbox-game-pass', true], ['Games', '/en-US/games/all-games/console', true], ['Devices', '/en-US/consoles', true], ['Play', '/en-US/play', false], ['More', '/en-US/more', true]]

export const signinUrl = (base, ru = '') => `${base}/login.live.com/oauth20_authorize.srf?prompt=select_account${ru ? `&ru=${encodeURIComponent(ru)}` : ''}`

const price = (p) => p.price === null ? esc(p.cta || 'View game') : `${money(p.price)}${p.iap ? '<sup>+</sup>' : ''}`
const buyWord = (p) => p.ribbon === 'PRE-ORDER' ? 'Pre-order' : 'Buy'
const tileLabel = (p) => p.price === null ? p.title : p.listPrice ? `${p.title}, Original price ${money(p.listPrice)}, on sale for ${money(p.price)}` : `${p.title}, ${money(p.price)}`

const head = (base, title) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<link rel="stylesheet" href="${base}/static/style.css"></head>`

export function layout({ base, title, body, cartCount = 0, user = null, theme = 'light', path = '' }) {
  return `${head(base, `${title} | XBOX`)}
<body class="xb-${esc(theme)}">
<header class="xb-header">
  <div class="xb-header-inner">
    <a class="xb-ms" href="${base}/" aria-label="Microsoft"><span class="xb-ms-logo" aria-hidden="true"><i></i><i></i><i></i><i></i></span>Microsoft</a>
    <span class="xb-divider" aria-hidden="true"></span>
    <a class="xb-logo" href="${base}/" aria-label="Xbox home"><span class="xb-sphere" aria-hidden="true">&#10005;</span>XBOX</a>
    <nav class="xb-nav" aria-label="Primary">${NAV.map(([n, href, dd]) => `<a href="${base}${href}">${esc(n)}${dd ? ' <span aria-hidden="true">&#9662;</span>' : ''}</a>`).join('')}</nav>
    <div class="xb-utils">
      <a class="xb-allms" href="${base}/en-US/more">All Microsoft <span aria-hidden="true">&#9662;</span></a>
      <details class="xb-search xb-menu-host">
        <summary class="xb-search-toggle" role="button" aria-expanded="false" aria-label="Search Xbox.com"><span aria-hidden="true">&#9906;</span></summary>
        <form class="xb-search-box" action="${base}/en-US/search/results" method="get" role="search">
          <input type="search" name="q" placeholder="Search Xbox.com" aria-label="Search Xbox.com">
          <button type="submit" class="xb-btn xb-btn-buy">Search</button>
          <button type="button" class="xb-btn xb-btn-grey" data-close>Cancel</button>
        </form>
      </details>
      <a class="xb-cart" href="${base}/en-US/cart" aria-label="Cart, ${cartCount} item${cartCount === 1 ? '' : 's'}">&#128722;${cartCount ? `<span class="xb-badge">${cartCount}</span>` : ''}</a>
      ${user
        ? `<a class="xb-me" href="${base}/account/billing/orders" aria-label="Account manager for ${esc(user.first_name || user.email)}"><span class="xb-avatar" aria-hidden="true">${esc((user.first_name || user.email || '?').slice(0, 1).toUpperCase())}</span><span>${esc(user.first_name || 'Account')}</span></a><a class="xb-signout" href="${base}/signout">Sign out</a>`
        : `<a class="xb-me" href="${signinUrl(base, path)}" aria-label="Sign in"><span class="xb-avatar" aria-hidden="true">ME</span><span>Sign in</span></a>`}
    </div>
  </div>
</header>
<main class="xb-main">${body}</main>
<footer class="xb-footer">
  <div class="xb-footer-cols">
    <div><h4>Browse</h4><a href="${base}/en-US/games/all-games/console">Games</a><a href="${base}/en-US/xbox-game-pass">Xbox Game Pass</a><a href="${base}/en-US/consoles">Consoles</a><a href="${base}/en-US/consoles">Accessories</a></div>
    <div><h4>Resources</h4><a href="${base}/en-US/support">Support</a><a href="${base}/en-US/more">Community</a><a href="${base}/en-US/more">News</a><a href="${base}/en-US/redeem">Redeem Code</a></div>
    <div><h4>Microsoft Store</h4><a href="${base}/account/billing/orders">Order history</a><a href="${base}/en-US/cart">Cart</a><a href="${base}/en-US/support">Returns</a><a href="${base}/en-US/more">Sales &amp; Specials</a></div>
    <div><h4>Rewards</h4><a href="${base}/en-US/more">Microsoft Rewards</a><a href="${base}/en-US/more">Xbox Game Pass Ultimate perks</a></div>
    <div><h4>For Developers</h4><a href="${base}/en-US/more">ID@Xbox</a><a href="${base}/en-US/more">Xbox Developer Program</a></div>
  </div>
  <p class="xb-footer-legal">English (United States) &nbsp;·&nbsp; Your Privacy Choices &nbsp;·&nbsp; Consumer Health Privacy &nbsp;·&nbsp; Sitemap &nbsp;·&nbsp; Contact Microsoft &nbsp;·&nbsp; Privacy &nbsp;·&nbsp; Terms of use &nbsp;·&nbsp; &copy; Microsoft 2026</p>
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
  if (e.key === 'Escape') document.querySelectorAll('details.xb-menu-host[open]').forEach(function (d) { d.open = false })
  if (e.key === 'Enter' && e.target.dataset && e.target.dataset.enter) { e.preventDefault(); document.getElementById(e.target.dataset.enter).click() }
})
document.addEventListener('toggle', function (e) {
  var d = e.target, s = d.querySelector && d.querySelector(':scope > summary[role=button]')
  if (!s) return
  s.setAttribute('aria-expanded', String(d.open))
  var q = d.open && d.querySelector('input[type=search]'); if (q) q.focus()
}, true)`

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
  <span class="xb-logo xb-logo-small"><span class="xb-sphere" aria-hidden="true">&#10005;</span>XBOX</span>
  <a href="${base}/en-US/support">Help and feedback</a><a href="${base}/en-US/more">Terms of use</a><a href="${base}/en-US/more">Privacy and cookies</a>
  <span>Use private browsing if this is not your device. <a href="${base}/en-US/support">Learn more</a></span>
  ${disclaimer(NAME)}
</footer>
</body></html>`
}

// ---- shared bits ----
// Text-only placeholder cover for listings without shared box art (no real artwork or logos).
export function coverArt(p) {
  const words = `${p.type === 'add-on' ? 'GTA VI ' : ''}${p.shortTitle}`.toUpperCase().split(' ')
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
<text x="150" y="23" font-family="Arial,Helvetica,sans-serif" font-size="14" font-weight="700" fill="#fff" text-anchor="middle">${p.type === 'add-on' ? 'ADD-ON' : 'XBOX SERIES X|S'}</text>
${lines.map((l, i) => `<text x="150" y="${y0 + i * 38}" font-family="Impact,Arial Black,sans-serif" font-size="32" fill="#fff" text-anchor="middle">${esc(l)}</text>`).join('\n')}
<text x="150" y="350" font-family="Arial,Helvetica,sans-serif" font-size="12" fill="#ddd" text-anchor="middle">${esc(p.publisher.toUpperCase())}</text>
</svg>`
}

export function tile(base, p) {
  return `<a class="xb-tile" href="${productPath(base, p)}" aria-label="${esc(tileLabel(p))}">
  <img src="${p.art}" alt="">
  <span class="xb-tile-title">${esc(p.title)}</span>
  <span class="xb-tile-price">${p.listPrice ? `<s>${money(p.listPrice)}</s> ` : ''}${price(p)}${p.discount ? ` <b class="xb-discount">${esc(p.discount)}</b>` : ''}</span>
  ${p.ribbon ? `<span class="xb-ribbon">${esc(p.ribbon)}</span>` : ''}
</a>`
}

const esrbMini = () => `<span class="xb-esrb-icon" aria-hidden="true">RP</span> <a class="xb-pill" href="#" rel="noopener">${ESRB.short}</a> <span class="xb-fine">${ESRB.note}</span>`

const chatBubble = () => `<details class="xb-chat xb-menu-host"><summary role="button" aria-expanded="false">Need help? Let's chat</summary>
<div class="xb-chat-panel"><b>Can we help you?</b><p>Store Assistant is available 24/7.</p><button type="button" class="xb-btn xb-btn-buy">Chat now</button> <button type="button" class="xb-btn xb-btn-grey" data-close>No thanks</button></div></details>`

const monthOptions = (sel) => Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map(m => `<option value="${m}" ${sel === m ? 'selected' : ''}>${m}</option>`).join('')
const yearOptions = (sel) => { const y0 = new Date().getFullYear(); return Array.from({ length: 16 }, (_, i) => String(y0 + i)).map(y => `<option value="${y}" ${sel === y ? 'selected' : ''}>${y}</option>`).join('') }

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
    <p class="xb-fine">Visa, Mastercard, American Express and Discover are accepted, including prepaid cards. PayPal and Venmo take you to the provider's site to sign in.</p>
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
    <p class="xb-fine">New cards are verified with a temporary $0 authorization. Applicable taxes are added based on your billing address.</p>
    </div>
  </fieldset></div>`
}

const totalsRows = (t) => `<div class="xb-rows"><div class="xb-row"><span>Subtotal</span><span>${money(t.subtotal)}</span></div><div class="xb-row"><span>Estimated tax</span><span>${money(t.tax)}</span></div><div class="xb-row xb-total"><span>Total</span><span>${money(t.total)}</span></div></div>`

const errorSummary = (errors) => Object.keys(errors).length ? `<div class="xb-error-summary" role="alert"><b>Check the highlighted fields.</b><ul>${Object.values(errors).map(e => `<li>${esc(e)}</li>`).join('')}</ul></div>` : ''

const paymentLine = (payment) => payment.method === 'card' ? `${esc(payment.brand)} &bull;&bull;&bull;&bull; ${esc(payment.last4)}` : payment.method === 'paypal' ? 'PayPal' : payment.method === 'venmo' ? 'Venmo' : esc(payment.method)
const addressLine = (b) => b ? `${esc(b.line1)}${b.line2 ? `, ${esc(b.line2)}` : ''}, ${esc(b.city)}, ${esc(b.state)} ${esc(b.postal_code)}` : ''

// ---- pages ----
export function homePage({ base, products }) {
  const std = products.find(p => p.id === '9p3h4968grsm')
  const preorders = products.filter(p => p.ribbon === 'PRE-ORDER' && p.type === 'game')
  const others = products.filter(p => p.purchasable && p.kind === 'other' && p.type === 'game')
  return `<section class="xb-home-hero">
  <img src="${std.art}" alt="Grand Theft Auto VI cover art">
  <div><p class="xb-eyebrow">PRE-ORDER NOW</p><h1>Grand Theft Auto VI</h1>
  <p>Purchase prior to 19 November 2026 to receive the Vintage Vice City Pack and one month of GTA+. Optimized for Xbox Series X|S. Release date ${RELEASE}.</p>
  <a class="xb-btn xb-btn-buy" href="${productPath(base, std)}">PRE-ORDER NOW</a> <a class="xb-btn xb-btn-grey" href="${productPath(base, std)}#compare">COMPARE EDITIONS</a></div>
</section>
<section class="xb-gp-strip"><div><b>Xbox Game Pass</b> &nbsp; Essential $9.99/mo &nbsp;·&nbsp; Premium $14.99/mo &nbsp;·&nbsp; Ultimate $22.99/mo. Play hundreds of high-quality games on console, PC and cloud.</div><a class="xb-btn xb-btn-outline" href="${base}/en-US/xbox-game-pass">JOIN NOW</a></section>
<section class="xb-light-section"><h2>Pre-order now</h2><div class="xb-grid">${preorders.map(p => tile(base, p)).join('')}</div></section>
<section class="xb-light-section"><h2>Popular games</h2><div class="xb-grid">${others.map(p => tile(base, p)).join('')}</div></section>`
}

export function searchPage({ base, q, type, results, counts }) {
  const tab = (label, t) => `<a class="xb-tab ${type === t ? 'is-active' : ''}" href="${base}/en-US/search/results?q=${encodeURIComponent(q)}&type=${t}" ${type === t ? 'aria-current="page"' : ''}>${label}</a>`
  const filters = ['Play with', 'Accessibility', 'Prices', 'Genre', 'Subscriptions', 'Age Rating', 'Multiplayer', 'Technical Features', 'Handheld compatibility', 'Supported Language']
  return `<div class="xb-search-page">
  <h1>Search results for: ${esc(q)}</h1>
  <nav class="xb-tabs" aria-label="Result type">${tab(`Games (${counts.games})`, 'games')}${tab(`Add-Ons (${counts.addons})`, 'add-ons')}${tab('Subscriptions', 'subscriptions')}${tab('Hardware', 'hardware')}${tab('Support', 'support')}${tab('General', 'general')}</nav>
  <div class="xb-search-body">
    <aside class="xb-rail">
      <label for="sort">Sort by</label> <select id="sort" aria-label="Sort by"><option>Relevance</option><option>Release date</option><option>Price: low to high</option><option>Price: high to low</option></select>
      <h3>Filters</h3>
      ${filters.map(f => `<details><summary>${esc(f)}</summary><p class="xb-fine">No filters available.</p></details>`).join('')}
    </aside>
    <div>
      ${results.length ? `<div class="xb-grid xb-grid-3">${results.map(p => tile(base, p)).join('')}</div><div class="xb-center"><button type="button" class="xb-btn xb-btn-outline-dark">Load more</button></div>`
        : `<p class="xb-empty">We couldn't find any ${esc(type === 'add-ons' ? 'add-ons' : type)} for "${esc(q)}". Try another search term.</p>`}
    </div>
  </div>
</div>`
}

export function gridPage({ base, title, intro, products }) {
  return `<div class="xb-search-page"><h1>${esc(title)}</h1>${intro ? `<p>${esc(intro)}</p>` : ''}<div class="xb-grid xb-grid-4">${products.map(p => tile(base, p)).join('')}</div></div>`
}

export function productPage({ base, p, editions, related, inCart, menuOpen = false }) {
  const path = productPath(base, p)
  const isGame = p.kind === 'game'
  const buy = p.purchasable
    ? `<form method="post" action="${path}/preorder"><button type="submit" class="xb-btn xb-btn-buy xb-btn-two" aria-label="${esc(buyWord(p) === 'Pre-order' ? 'Preorder' : 'Buy')} ${esc(p.title)}. ${money(p.price)}"><span>${buyWord(p).toUpperCase()}</span><span class="xb-btn-sub">${price(p)}</span></button></form>`
    : `<p class="xb-not-sold">${esc(p.cta === 'View add-on' ? 'Included with your pre-order. Not sold separately.' : 'Not sold separately. See the editions below.')}</p>`
  // The edition rows are plain links: picking the other edition navigates to its own product page.
  const editionPicker = isGame ? `<details class="xb-edition xb-menu-host"><summary class="xb-btn xb-btn-grey xb-btn-two" role="button" aria-expanded="false" aria-label="CHOOSE EDITION"><span>CHOOSE EDITION</span><span class="xb-btn-sub">${esc(p.shortTitle)} <span aria-hidden="true">&#9662;</span></span></summary>
    <div class="xb-edition-panel">${editions.map(e => `<a class="xb-edition-row ${e.id === p.id ? 'is-current' : ''}" href="${productPath(base, e)}" aria-label="${esc(tileLabel(e))}+" ${e.id === p.id ? 'aria-current="page"' : ''}><img src="${e.art}" alt=""><span class="xb-edition-title">${esc(e.title)}</span><span class="xb-edition-price">${price(e)}</span></a>`).join('')}</div>
  </details>` : ''
  // menuOpen: right after a silent "Add to cart" the menu stays open and its entry now reads "Open cart".
  const overflow = p.purchasable ? `<details class="xb-overflow xb-menu-host" ${menuOpen ? 'open' : ''}><summary class="xb-btn xb-btn-grey" role="button" aria-expanded="${menuOpen}" aria-label="Overflow, press for more options">&hellip;</summary>
    <div class="xb-menu">
      <a href="${path}#" class="xb-menu-item">&#9825; Add to wishlist</a>
      ${inCart ? `<a href="${base}/en-US/cart" class="xb-menu-item">&#128722; Open cart</a>` : `<form method="post" action="${base}/en-US/cart/add"><input type="hidden" name="pid" value="${p.id}"><button type="submit" class="xb-menu-item" aria-label="Add ${esc(p.title)} to cart">&#128722; Add to cart</button></form>`}
      <a href="${base}/en-US/redeem" class="xb-menu-item">&#9638; Redeem a code</a>
    </div></details>` : ''
  const rail = (title, items, id) => items.length ? `<section class="xb-section" ${id ? `id="${id}"` : ''}><h2>${esc(title)}</h2><div class="xb-rail-tiles">${items.map(r => `<a class="xb-mini-tile" href="${productPath(base, r)}" aria-label="${esc(tileLabel(r))}${r.ribbon ? `, ${esc(r.ribbon)}` : ''}"><img src="${r.art}" alt=""><span>${esc(r.title)}</span><b>${price(r)}</b>${r.ribbon ? `<em class="xb-ribbon-inline">${esc(r.ribbon)}</em>` : ''}</a>`).join('')}</div></section>` : ''
  const desc = p.description
  const shown = desc.slice(0, 5), more = desc.slice(5)
  const compare = isGame ? `<section class="xb-section" id="compare"><h2>Compare editions</h2><div class="xb-compare">
    ${editions.map(e => `<div class="xb-compare-card ${e.id === p.id ? 'is-this' : ''}">
      ${e.id === p.id ? '<span class="xb-tag">THIS EDITION</span>' : ''}
      <img src="${e.art}" alt=""><h3>${esc(e.title)}</h3><p class="xb-compare-price">${price(e)}</p>
      <h4>Games included</h4><ul>${e.gamesIncluded.map(g => `<li>${esc(g)}</li>`).join('')}</ul>
      <h4>Add-ons included</h4><ul>${e.addonsIncluded.map(a => `<li>${esc(a)}</li>`).join('')}</ul>
      ${e.id === p.id ? `<a class="xb-btn xb-btn-grey" href="#buybox">RETURN TO TOP</a>` : `<a class="xb-btn xb-btn-buy" href="${productPath(base, e)}">GO TO GAME</a>`}
    </div>`).join('')}
  </div></section>` : ''
  return `<div class="xb-hero" id="top">
  <div class="xb-hero-inner">
    <img class="xb-cover" src="${p.art}" alt="${esc(p.title)} cover art">
    <div class="xb-hero-info">
      <h1>${esc(p.title)}</h1>
      <p class="xb-meta">${esc(p.publisher)} &bull; ${esc(p.genre)}${p.rating ? ` &bull; <span class="xb-stars" role="img" aria-label="Rating of ${esc(p.rating)} stars">&#9733;&#9733;&#9733;&#9733;&#9733;</span> ${esc(p.ratingCount)}` : ''}</p>
      <ul class="xb-badges"><li>&#9635; Optimized for XBOX Series X|S</li>${p.ribbon ? '<li>&#128197; Pre-order</li>' : ''}<li>&#127760; ${p.languages} Supported languages</li></ul>
      <div class="xb-buybox" id="buybox">${buy}${editionPicker}${overflow}</div>
    </div>
  </div>
</div>
<div class="xb-esrb-strip"><div class="xb-esrb-left">${esrbMini()}</div>
  <div class="xb-esrb-right"><p>Publishers of games you launch receive access to your XBOX profile information and associated data while you play. <a href="${base}/en-US/support">Learn more</a></p>${p.iap ? '<p>+Offers in-app purchases.</p>' : ''}<p>Parental control information. <a href="${base}/en-US/support">Learn more</a></p></div></div>
<nav class="xb-pdp-tabs" aria-label="Product sections"><a href="${path}#details" class="is-active" aria-current="page">DETAILS</a><a href="${path}#reviews">REVIEWS</a><a href="${path}#more">MORE</a></nav>
<section class="xb-section" id="details"><h2>Gallery</h2><div class="xb-gallery">${Array.from({ length: 4 }, () => '<div class="xb-locked">&#128274; This content is locked</div>').join('')}</div></section>
${rail('In this bundle', related.bundle)}
${rail('Included in', related.includedIn)}
<section class="xb-section xb-desc-grid"><div><h2>Description</h2>${shown.map(t => `<p>${esc(t)}</p>`).join('')}
  ${p.upgradeItems ? `<h3>ULTIMATE EDITION UPGRADE</h3><ul class="xb-caps">${p.upgradeItems.map(i => `<li>${esc(i)}</li>`).join('')}</ul><h3>Special Destinations Only Open for Business with the Ultimate Edition</h3><ul class="xb-caps">${p.destinations.map(i => `<li>${esc(i)}</li>`).join('')}</ul>` : ''}
  ${more.length ? `<details class="xb-more"><summary>Show more</summary>${more.map(t => `<p>${esc(t)}</p>`).join('')}</details>` : ''}</div>
  <aside><h2>Details</h2><dl class="xb-facts"><dt>Published by</dt><dd>${esc(p.publisher)}</dd><dt>Developed by</dt><dd>${esc(p.developer)}</dd><dt>Release date</dt><dd>${esc(p.release)}</dd><dt>Play with</dt><dd>XBOX Series X|S</dd><dt>Capabilities</dt><dd>Single player<br>Optimized for Xbox Series X|S</dd></dl></aside></section>
${compare}
${rail('Add-ons for this game', related.addons)}
<section class="xb-section" id="reviews"><h2>Reviews</h2><p class="xb-fine">Ratings and reviews are available after sign-in.</p></section>
${gamePassPromo(base)}
${chatBubble()}`
}

// ASSUMPTION: the research saw no Game Pass block on this page (Game Pass does not change the GTA VI price), but the
// brief and research/COMPARISON.md count Xbox Game Pass among the upsells in the way, so a plain xbox.com-style
// promo with the April 2026 plan prices closes the page. It is the target of the MORE tab.
const gamePassPromo = (base) => `<section class="xb-section" id="more"><div class="xb-gp-card">
  <div><p class="xb-eyebrow">XBOX GAME PASS</p><h2>Discover your next favorite game</h2>
  <p>Play hundreds of high-quality games on console, PC and cloud. Essential $9.99/mo &nbsp;·&nbsp; Premium $14.99/mo &nbsp;·&nbsp; Ultimate $22.99/mo.</p></div>
  <a class="xb-btn xb-btn-outline" href="${base}/en-US/xbox-game-pass">JOIN NOW</a>
</div></section>`

// The Microsoft Store purchase dialog, rendered over the (inert) product page.
export function dialogOver({ pageBody, dialog }) {
  return `<div class="xb-under" aria-hidden="true" inert>${pageBody}</div><div class="xb-overlay"><div class="xb-dialog" role="dialog" aria-modal="true" aria-labelledby="dlg-title">${dialog}</div></div>`
}

const dialogItem = (p, extra = '') => `<div class="xb-dialog-item"><img src="${p.art}" alt=""><div><b>${esc(p.title)}</b><span>Digital &nbsp;·&nbsp; Release date: ${esc(p.release)}</span><span class="xb-dialog-price">${money(p.price)}</span>${extra}</div></div>`

// ASSUMPTION: the dialog was never observed. Research (JSON steps) and the brief give it two screens that both end
// in the purchase button: "Choose a way to pay" (payment method, order summary with tax, "Pre-order"), then the
// confirmation screen where "Pre-order" is pressed again ("On the confirmation screen, select Buy again").
export function payDialog({ base, p, t, values = {}, errors = {}, saved = [] }) {
  const path = productPath(base, p)
  return `<div class="xb-dialog-head"><span class="xb-ms-mini">Microsoft Store</span><a class="xb-dialog-close" href="${path}" aria-label="Close">&times;</a></div>
  ${dialogItem(p)}
  <h2 id="dlg-title">Choose a way to pay</h2>
  ${errorSummary(errors)}
  <form method="post" action="${path}/buy" novalidate>
    ${paymentFields({ values, errors, saved })}
    <h3 class="xb-dialog-sub">Order summary</h3>
    ${totalsRows(t)}
    <div class="xb-dialog-actions"><button type="submit" class="xb-btn xb-btn-buy">${buyWord(p)}</button><a class="xb-btn xb-btn-grey" href="${path}">Cancel</a></div>
  </form>`
}

export function confirmDialog({ base, p, payment, billing, t }) {
  const path = productPath(base, p)
  const word = buyWord(p)
  return `<div class="xb-dialog-head"><span class="xb-ms-mini">Microsoft Store</span><a class="xb-dialog-close" href="${path}" aria-label="Close">&times;</a></div>
  ${dialogItem(p)}
  <h2 id="dlg-title">Confirm payment</h2>
  <dl class="xb-pay-summary"><dt>Payment method</dt><dd>${paymentLine(payment)} <a href="${path}/buy">Change</a></dd>${billing ? `<dt>Billing address</dt><dd>${addressLine(billing)}</dd>` : ''}</dl>
  ${totalsRows(t)}
  ${word === 'Pre-order' ? `<p class="xb-fine">Your ${payment.method === 'card' ? 'card' : 'payment method'} won't be charged until about 10 days before the release date. If you pay with your Microsoft account balance, you're charged right away. You can cancel this pre-order from Order history up to 10 days before release.</p>` : ''}
  <p class="xb-fine">By selecting ${word}, you agree to the Microsoft Store Terms of Sale and acknowledge the Privacy Statement. All purchases of digital products are final and non-refundable.</p>
  <form method="post" action="${path}/buy/confirm"><div class="xb-dialog-actions"><button type="submit" class="xb-btn xb-btn-buy">${word}</button><a class="xb-btn xb-btn-grey" href="${path}">Cancel</a></div></form>`
}

export function thanksCard({ base, order, p }) {
  const it = order.items[0]
  const preorder = order.meta.preorder
  return `<div class="xb-dialog-head"><span class="xb-ms-mini">Microsoft Store</span>${p ? `<a class="xb-dialog-close" href="${productPath(base, p)}" aria-label="Close">&times;</a>` : ''}</div>
  <h2 id="dlg-title" class="xb-thanks-title">&#10004; Thanks for your purchase</h2>
  <p class="xb-order-number">Order #<span data-order-number>${esc(order.order_number)}</span></p>
  ${order.items.map(i => `<div class="xb-dialog-item"><img src="${byId(i.sku)?.art ?? '/static/art/game-generic.svg'}" alt=""><div><b>${esc(i.title)}</b><span>Digital &nbsp;·&nbsp; Quantity: ${i.qty}</span><span class="xb-dialog-price">${money(i.unit_price)}</span></div></div>`).join('')}
  <dl class="xb-pay-summary"><dt>Payment method</dt><dd>${paymentLine(order.payment)}</dd><dt>Total</dt><dd>${money(order.totals.total)} (includes ${money(order.totals.tax)} tax)</dd><dt>Email</dt><dd>${esc(order.customer.email)}</dd></dl>
  <p class="xb-fine">We sent a confirmation email with the subject "Microsoft Store - Order Confirmation (Order #${esc(order.order_number)})".</p>
  ${preorder ? `<p class="xb-fine">Your pre-order will pre-download to your console before release and unlock on ${esc(RELEASE)}. Look for it under My games &amp; apps. ${order.payment.method === 'card' ? 'Your card will be charged about 10 days before the release date.' : 'You will be charged about 10 days before the release date.'} You can cancel from Order history up to 10 days before release.</p>` : `<p class="xb-fine">Your game is ready to install from My games &amp; apps on your console.</p>`}
  <div class="xb-dialog-actions"><a class="xb-btn xb-btn-buy" href="${base}/account/billing/orders">Order history</a><a class="xb-btn xb-btn-grey" href="${p ? productPath(base, p) : `${base}/`}">Close</a></div>
  <p class="xb-fine">${it && it.kind === 'other' ? 'Add-on items require the base game.' : 'Manage your pre-order any time from Payment &amp; billing &gt; Order history.'}</p>`
}

export function cartPage({ base, t, saved = [], cartId }) {
  if (!t.lines.length && !saved.length) {
    return `<div class="xb-cart-page"><div class="xb-cart-head"><h1>Cart</h1><a href="${base}/en-US/games/all-games/console">Keep shopping</a></div>
    <div class="xb-cart-empty"><p>Your cart is empty.</p><a class="xb-btn xb-btn-buy" href="${base}/en-US/games/all-games/console">Keep shopping</a></div>
    <p class="xb-fine">Need help? <a href="${base}/en-US/support">Contact support</a> &nbsp;·&nbsp; Cart: ${esc(cartId)}</p></div>`
  }
  const line = (l, savedRow) => `<div class="xb-line">
    <img src="${l.product.art}" alt="">
    <div class="xb-line-info">
      <a class="xb-line-title" href="${productPath(base, l.product)}">${esc(l.product.title)}</a>
      <div>Release date: ${esc(l.product.release)}</div>
      <div class="xb-esrb-mini">${esrbMini()}</div>
      <div>Digital</div>
      <div class="xb-line-price">${money(l.product.price)}</div>
      <div>Quantity: 1</div>
      <form method="post" action="${base}/en-US/cart/update" class="xb-line-actions"><input type="hidden" name="pid" value="${l.product.id}">
        ${savedRow ? `<button type="submit" name="action" value="move" class="xb-link-btn">Move to cart</button>` : `<button type="submit" name="action" value="remove" class="xb-link-btn">Remove</button> | <button type="submit" name="action" value="save" class="xb-link-btn">Save for later</button>`}
      </form>
      <div class="xb-fine">Buying or purchasing this digital item is a license. <a href="${base}/en-US/support">Learn more</a></div>
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
      <aside class="xb-cart-info">&#128197; Pay over time options may be available for qualified customers at checkout for eligible purchases when checking out with a Microsoft account.</aside>
    </div>
  </div>
  <p class="xb-fine">Need help? <a href="${base}/en-US/support">Contact support</a> &nbsp;·&nbsp; Cart: ${esc(cartId)}</p>
</div>`
}

// Research: the order summary holds Subtotal / Estimated tax / Total, "Add a promo code" and "Place order". Its
// controls belong to the checkout form through form="co-form". "Place order" comes first in the markup so it is the
// form's default button (Enter in any field places the order); CSS shows the promo box above it.
export function checkoutPage({ base, user, t, values = {}, errors = {}, saved = [], promoError }) {
  return `<div class="xb-checkout">
  <h1>Checkout</h1>
  <div class="xb-co-grid">
    <form id="co-form" method="post" action="${base}/en-US/checkout" class="xb-co-form" novalidate>
      ${errorSummary(errors)}
      <section class="xb-co-section"><h2>Step 1: Shipping</h2>
        <p>${esc(user.email)}</p>
        <p class="xb-fine">No shipping needed: everything in your cart is digital and will be added to your Microsoft account.</p>
      </section>
      <section class="xb-co-section"><h2>Step 2: Payment</h2>${paymentFields({ values, errors, saved })}</section>
    </form>
    <aside class="xb-summary" aria-labelledby="sum-title">
      <h2 id="sum-title">Order summary</h2>
      ${t.lines.map(l => `<div class="xb-row xb-sum-item"><span>${esc(l.product.title)}<br><small>Digital &nbsp;·&nbsp; Release date: ${esc(l.product.release)}</small></span><span>${money(l.product.price)}</span></div>`).join('')}
      ${totalsRows(t)}
      <button type="submit" form="co-form" name="action" value="place" class="xb-btn xb-btn-buy xb-btn-wide xb-place">Place order</button>
      <details class="xb-promo" ${promoError ? 'open' : ''}><summary role="button" aria-expanded="${!!promoError}">Add a promo code</summary>
        <div class="xb-promo-row"><div><label for="promo">Promo code</label><input id="promo" name="promo" type="text" form="co-form" data-enter="promo-apply" value="${esc(values.promo ?? '')}"></div><button type="submit" form="co-form" id="promo-apply" name="action" value="promo" class="xb-btn xb-btn-grey">Apply code</button></div>
        ${promoError ? `<span class="xb-error" role="alert">${esc(promoError)}</span>` : ''}</details>
      <div class="xb-co-terms">
        <p class="xb-fine">Pre-ordered items: if you use money in your Microsoft account, we'll charge you right away. If you use any other payment option, we may charge you up to 10 days before the release date.</p>
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

export function ordersPage({ base, user, orders }) {
  return `<div class="xb-orders"><h1>Order history</h1>
  <p>${esc(user.email)} &nbsp;·&nbsp; Payment &amp; billing &gt; Order history</p>
  <div class="xb-chips"><span>In progress</span><span>Returned/Refunded</span><span class="is-active">Digital</span><span>Physical</span></div>
  ${orders.length ? `<table class="xb-table"><thead><tr><th>Order #</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th></tr></thead><tbody>${orders.map(o => `<tr><td>${esc(o.order_number)}</td><td>${new Date(o.created_at).toLocaleDateString('en-US')}</td><td>${o.items.map(i => esc(i.title)).join('<br>')}<details><summary>Details</summary><span class="xb-fine">Release date: ${esc(RELEASE)} &nbsp;·&nbsp; ${paymentLine(o.payment)}</span></details></td><td>${money(o.totals.total)}</td><td>Completed</td></tr>`).join('')}</tbody></table>
  <p class="xb-fine">Pre-orders can be cancelled here up to 10 days before release. After billing, a cancellation is processed as a refund.</p>` : '<p>You have no orders yet.</p>'}
  </div>`
}

export function simplePage({ title, html }) {
  return `<div class="xb-simple"><h1>${esc(title)}</h1>${html}</div>`
}
