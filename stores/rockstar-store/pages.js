import { esc, money, disclaimer } from '../../lib/html.js'
import { GAME, PLATFORM_OPTIONS, listing, SHIPPING_METHODS, COUNTRIES, MAX_QTY, FREE_SHIPPING_OVER, SORTS } from './data.js'

const NAME = 'Rockstar Store'

// Header menubar from the research: GAMES / GAME ADD-ONS / GTA+ / MERCHANDISE / FEATURED with dropdown groups.
const NAV = [
  { label: 'Games', href: '/view-all-games', items: [['View All Games', '/view-all-games'], ['Grand Theft Auto VI', '/game/buy-gta-vi'], ['Grand Theft Auto V', '/game/buy-gta-v'], ['Red Dead Redemption 2', '/game/buy-red-dead-redemption-2'], ['Red Dead Redemption', '/game/buy-red-dead-redemption'], ['Bully: Scholarship Edition', '/game/buy-bully-scholarship-edition']] },
  { label: 'Game Add-Ons', href: '/search?q=add-ons', items: [['Grand Theft Auto Online: Shark Cash Cards', '/search?q=shark+cash+cards'], ['Red Dead Online: Gold Bars', '/search?q=gold+bars']] },
  { label: 'GTA+', href: '/game/gta-plus' },
  { label: 'Merchandise', href: '/merchandise', items: [['View All Merchandise', '/merchandise'], ['Apparel', '/search?q=apparel'], ['Accessories', '/search?q=accessories'], ['Collectibles', '/search?q=collectibles']] },
  { label: 'Featured', href: '/search?q=new+arrivals', items: [['New Arrivals', '/search?q=new+arrivals'], ['Shop by Grand Theft Auto', '/search?q=grand+theft+auto'], ['Shop by Red Dead Redemption', '/search?q=red+dead+redemption'], ['Shop by Rockstar Games', '/search?q=rockstar+games']] },
]

const ICON = {
  search: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  user: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>',
  cart: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 4h2l2.5 11h11l2-8H6.5"/><circle cx="9" cy="20" r="1.5"/><circle cx="17" cy="20" r="1.5"/></svg>',
  clock: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  ext: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6"/></svg>',
  lock: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
  check: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><path d="m5 12 5 5 9-10"/></svg>',
  play: '<svg width="36" height="36" viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>',
}

// The glyph letters come from CSS (::before) so they stay out of the page text, like the real SVG icons.
const platformGlyph = (platform) => platform ? `<span class="rs-glyph rs-glyph-${esc(platform)}" aria-hidden="true"></span>` : ''

export function layout({ base, title, body, cartCount = 0, user = null, cookieBanner = false, returnTo = '/', bodyClass = '', searchQ = '' }) {
  const navLinks = NAV.map(n => `<li class="rs-menu-item"><a href="${base}${n.href}" ${n.items ? 'aria-haspopup="true"' : ''}>${esc(n.label)}${n.items ? ' <span aria-hidden="true">&#9662;</span>' : ''}</a>${n.items ? `<ul class="rs-dropdown">${n.items.map(([l, h]) => `<li><a href="${base}${h}">${esc(l)}</a></li>`).join('')}</ul>` : ''}</li>`).join('')
  const drawerLinks = NAV.map(n => `<li><a href="${base}${n.href}">${esc(n.label)}</a>${n.items ? `<ul>${n.items.map(([l, h]) => `<li><a href="${base}${h}">${esc(l)}</a></li>`).join('')}</ul>` : ''}</li>`).join('')
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)} | Rockstar Store</title>
<link rel="stylesheet" href="${base}/static/style.css"></head>
<body class="${esc(bodyClass)}">
<header class="rs-header">
  <details class="rs-drawer"><summary aria-label="Open menu">&#9776;</summary><nav aria-label="Menu"><ul>${drawerLinks}</ul></nav></details>
  <a class="rs-logo" href="${base}/" aria-label="Rockstar Store Home"><span class="rs-logo-mark">R<span>*</span></span><span class="rs-logo-word">Store</span></a>
  <nav class="rs-menubar" aria-label="Main"><ul>${navLinks}</ul></nav>
  <form class="rs-search" action="${base}/search" method="get" role="search">
    <label for="rs-q" class="visually-hidden">Search</label>
    <input id="rs-q" type="search" name="q" placeholder="Search" value="${esc(searchQ)}">
    <button type="submit" aria-label="Search">${ICON.search}</button>
  </form>
  ${user ? `<details class="rs-user-menu"><summary class="rs-user" aria-label="Account">${ICON.user}<span>${esc(user.nickname || user.first_name || 'Account')}</span></summary><div class="rs-user-drop"><p>Welcome, ${esc(user.nickname || user.first_name || user.email)}</p><a href="${base}/signout">Sign Out</a></div></details>` : `<a class="rs-user" href="${base}/signin" aria-label="Sign In">${ICON.user}<span>Sign In</span></a>`}
  <a class="rs-cart-link" href="${base}/cart" aria-label="cart${cartCount ? `, ${cartCount} items` : ''}">${ICON.cart}${cartCount ? `<span class="rs-cart-badge">${cartCount}</span>` : ''}</a>
</header>
<main class="rs-main" id="top">${body}</main>
<footer class="rs-footer">
  <div class="rs-footer-logo" aria-label="Rockstar Games"><span>R<b>*</b></span></div>
  <ul class="rs-footer-links"><li><a href="#">Rockstar Support</a></li><li><a href="#">Privacy Policy</a></li><li><a href="#">Cookie Policy</a></li><li><a href="#">Terms of Service</a></li><li><a href="#">Do Not Sell or Share My Personal Information</a></li><li><a href="#">Refunds</a></li><li><a href="#">Cookie Settings</a></li></ul>
  <p class="rs-legal">Rockstar Games, Inc. &copy; 2026. All other marks and trademarks are properties of their respective owners.</p>
  <div class="rs-footer-tools"><button type="button" class="rs-lang">English</button><a href="#top" class="rs-backtop">Back to top</a></div>
  ${disclaimer(NAME)}
</footer>
${cookieBanner ? `<div class="rs-cookie" role="dialog" aria-label="Cookie preferences">
  <p>We use cookies to improve your experience. See our <a href="#">Cookie Policy</a>.</p>
  <form method="post" action="${base}/cookies"><input type="hidden" name="return" value="${esc(returnTo)}">
    <button type="submit" name="choice" value="accept">ACCEPT ALL COOKIES</button>
    <button type="submit" name="choice" value="reject">REJECT ALL</button>
    <button type="submit" name="choice" value="settings">COOKIE SETTINGS</button>
    <button type="submit" name="choice" value="close" class="rs-cookie-close" aria-label="Close">&times;</button>
  </form></div>` : ''}
</body></html>`
}

// ---------- tiles ----------
function tile(base, p, { chips = false } = {}) {
  return `<article class="rs-tile">
  <a href="${base}${p.path}"><img src="${esc(p.art)}" alt="${esc(p.title)}"></a>
  <h3><a href="${base}${p.path}">${esc(p.title)}</a></h3>
  ${p.badge ? `<span class="rs-badge">${esc(p.badge)}</span>` : ''}
  <div class="rs-price">${money(p.price)}${p.priceSuffix ? esc(p.priceSuffix) : ''}</div>
  ${chips && p.chips ? `<div class="rs-chips">${p.chips.map(c => `<span>${esc(c)}</span>`).join('')}</div>` : ''}
</article>`
}

const grid = (base, products, opts) => `<div class="rs-grid">${products.map(p => tile(base, p, opts)).join('')}</div>`
const carousel = (base, heading, products, opts) => `<section class="rs-carousel"><div class="rs-section-head"><h2>${esc(heading)}</h2><a href="${base}/search?q=${encodeURIComponent(heading)}">See all</a></div>${grid(base, products, opts)}</section>`

// ---------- home ----------
export function homePage({ base, products }) {
  const by = (c) => products.filter(p => p.collections?.includes(c))
  const collection = products.find(p => p.id === 'gtavi-goodtime-state-vice-city-collection')
  return `<section class="rs-hero-carousel" aria-label="Featured">
  <div class="rs-hero-track">
    <div class="rs-hero rs-hero-collection" id="slide-1">
      <div class="rs-hero-text"><span class="rs-badge">COMING SOON</span><h2>${esc(collection.title)}</h2><p>${esc(collection.blurb)}</p><a class="rs-btn rs-btn-primary" href="${base}${collection.path}">Pre-Order Now</a></div>
      <img src="${esc(collection.art)}" alt="">
    </div>
    <div class="rs-hero rs-hero-gtavi" id="slide-2">
      <div class="rs-hero-text"><span class="rs-badge">COMING SOON</span><h2>Grand Theft Auto VI</h2><p>Reserve today to unlock exclusive benefits and be ready to play at launch.</p><a class="rs-btn rs-btn-pill" href="${base}${GAME.path}">Pre-Order Now</a></div>
      <img src="${esc(GAME.art)}" alt="">
    </div>
  </div>
  <a class="rs-hero-arrow rs-hero-prev" href="#slide-1" aria-label="Previous">&#8249;</a><a class="rs-hero-arrow rs-hero-next" href="#slide-2" aria-label="Next">&#8250;</a>
  <div class="rs-hero-dots"><a href="#slide-1" aria-label="Go to slide 1"></a><a href="#slide-2" aria-label="Go to slide 2"></a></div>
</section>
${carousel(base, 'New Arrivals', by('new-arrivals'))}
${carousel(base, 'Games', by('games'), { chips: true })}
${carousel(base, 'Best Sellers', by('best-sellers'))}
<section class="rs-promos"><a class="rs-promo" href="${base}/search?q=essentials+collection"><b>Essentials Collection Now Available</b><span>SHOP NOW</span></a><a class="rs-promo" href="${base}/search?q=gold+bars"><b>Buy Gold Bars for PC</b><span>SHOP NOW</span></a></section>
${carousel(base, 'Grand Theft Auto Collection', by('gta'))}
${carousel(base, 'Red Dead Redemption Essentials Collection', by('rdr'))}`
}

// ---------- search / listing ----------
export function searchPage({ base, q, sort = 'relevance', products }) {
  const games = products.filter(p => p.section === 'Games'), gear = products.filter(p => p.section === 'Gear')
  const facet = (title, items) => `<details open><summary>${title}</summary>${items.map(i => `<label><input type="checkbox"> ${esc(i)}</label>`).join('')}</details>`
  // Real string table: "<0>Search for: {{query}}</0> <1>{{count}} results</1>" and the six search-sort-* labels.
  return `<div class="rs-search-page">
  <div class="rs-search-head"><h1>Search for: ${esc(q)}</h1><span class="rs-count">${products.length} result${products.length === 1 ? '' : 's'}</span>
    <form class="rs-sort" method="get" action="${base}/search"><input type="hidden" name="q" value="${esc(q)}"><label for="rs-sort">Sort by...</label> <select id="rs-sort" name="sort" onchange="this.form.submit()">${SORTS.map(([v, l]) => `<option value="${v}" ${v === sort ? 'selected' : ''}>${l}</option>`).join('')}</select><noscript><button type="submit" class="rs-btn rs-btn-outline rs-btn-sm">Sort</button></noscript></form>
    <button type="button" class="rs-btn rs-btn-outline rs-btn-sm">Filters</button></div>
  <div class="rs-search-body">
    <aside class="rs-facets">${facet('CATEGORIES', ['Bundle', 'Console Game', 'Full Digital Game', 'Gear'])}${facet('GAME COLLECTIONS', ['Bully', 'Grand Theft Auto', 'L.A. Noire', 'More'])}${facet('PLATFORM', ['apple store', 'google play', 'Nintendo Switch', 'More'])}${facet('GEAR', ['Game', 'Accessories', 'Apparel', 'Collectibles'])}</aside>
    <div class="rs-results">
      ${products.length ? '' : '<p class="rs-empty">No Results. Please try another search.</p>'}
      ${games.length ? `<h2>Games</h2>${grid(base, games)}` : ''}
      ${gear.length ? `<h2>Gear</h2>${grid(base, gear)}` : ''}
    </div>
  </div></div>`
}

export function gridPage({ base, title, products }) {
  return `<div class="rs-listing"><h1>${esc(title)}</h1>${grid(base, products, { chips: true })}</div>`
}

// ---------- modals ----------
export function ageGateModal({ base, closeHref, values = {}, error }) {
  const now = new Date().getFullYear()
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const sel = (name, label, opts) => `<label for="dob-${name}" class="visually-hidden">${label}</label><select id="dob-${name}" name="${name}" required><option value="">${label}</option>${opts.map(([v, t]) => `<option value="${v}" ${String(values[name]) === String(v) ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select>`
  return `<div class="rs-lightbox-backdrop"><div class="rs-lightbox rs-agegate" role="dialog" aria-modal="true" aria-labelledby="agegate-title">
  <a class="rs-lightbox-close" href="${esc(closeHref)}" aria-label="Close">&times;</a>
  <h2 id="agegate-title">Verify your age</h2>
  <p>Enter your date of birth</p>
  <form method="post" action="${base}/verify-age" id="agegate-form" novalidate>
    <div class="rs-dob">${sel('month', 'Month', months.map((m, i) => [i + 1, m]))}${sel('day', 'Day', Array.from({ length: 31 }, (_, i) => [i + 1, i + 1]))}${sel('year', 'Year', Array.from({ length: 110 }, (_, i) => [now - i, now - i]))}</div>
    ${error ? `<p class="rs-error" role="alert">${esc(error)}</p>` : ''}
    <button class="rs-btn rs-btn-primary" type="submit" id="agegate-ok">OK</button>
  </form>
</div></div>
<script>(function(){var f=document.getElementById('agegate-form'),b=document.getElementById('agegate-ok'),s=f.querySelectorAll('select');function u(){var ok=true;s.forEach(function(x){if(!x.value)ok=false});b.disabled=!ok}s.forEach(function(x){x.addEventListener('change',u)});u()})();</script>`
}

export function checkoutGateModal({ base, closeHref }) {
  return `<div class="rs-lightbox-backdrop"><div class="rs-lightbox rs-gate" role="dialog" aria-modal="true" aria-labelledby="gate-title">
  <a class="rs-lightbox-close" href="${esc(closeHref)}" aria-label="Close">&times;</a>
  <h2 id="gate-title">Sign In or Continue as Guest</h2>
  <p class="rs-gate-sub">Choose to sign in or checkout as guest</p>
  <div class="rs-gate-cols">
    <div><h4>Sign In</h4><p>Sign in to keep track of your previous purchases and payment information.</p><a class="rs-btn rs-btn-primary rs-btn-block" href="${base}/signin?return=checkout">SIGN IN</a></div>
    <div><h4>Continue as Guest</h4><p>A valid email and shipping address are required for your order.</p><form method="post" action="${base}/checkout/guest"><button class="rs-btn rs-btn-outline rs-btn-block" type="submit">CONTINUE AS GUEST</button></form></div>
  </div>
</div></div>`
}

export function addedPopover({ base, item, closeHref }) {
  return `<div class="rs-added" role="dialog" aria-labelledby="added-title">
  <div class="rs-added-head"><h3 id="added-title">Added to Cart</h3><a href="${esc(closeHref)}" class="rs-added-close" aria-label="Close">&times;</a></div>
  <div class="rs-added-body"><img src="${esc(item.art)}" alt=""><div><b>${esc(item.title)}</b><div>${money(item.price)}</div></div></div>
  <a class="rs-btn rs-btn-primary rs-btn-block" href="${base}/cart">Go To Cart</a>
</div>`
}

// ---------- GTA VI product page ----------
const EDITION_CONTENT = ['Digital Standard Edition', '’95 Grotti Cheetah', 'Hawk and Little Morgan Revolvers', 'Personalized Weapon Variants', 'Vice City Styles', 'Jason’s Safehouse Vehicles', 'Ganado Retro Build', 'Rideout Customs Mod Shop', 'Sara’s Unisex Salon', 'Shitzu Squalo', 'Stock 305 Clothing Store', '’67 Vapid Dominator Buggy', 'Electric Fang Tattoo Parlor', 'One-Eyed Willie’s Mod Shop', 'Goodtime Gear', 'PTT Youngin$ Compound', 'Classic Car Collection', 'Vintage Vice City Pack Pre-Order Bonuses', '’55 Vapid Stanier Sedan and Garage', 'Outfits and Hairstyles', 'Exclusive Weapon Pattern', 'Digital Store Pre-Order Bonus', 'Free Month of GTA+']
// ASSUMPTION: the research says both edition cards carry the same list; the Standard card here ticks only the items that are not Ultimate-only.
const STANDARD_INCLUDES = new Set(['Digital Standard Edition', 'Vintage Vice City Pack Pre-Order Bonuses', '’55 Vapid Stanier Sedan and Garage', 'Outfits and Hairstyles', 'Exclusive Weapon Pattern', 'Digital Store Pre-Order Bonus', 'Free Month of GTA+'])

const FAQ = [
  ['What is a code-in-box?', 'The physical box contains a download code only; there is no disc. An internet connection and platform account are required to download the game. PlayStation codes are region-locked: codes shipped to the US or Canada only work on US or Canadian PlayStation accounts.'],
  ['When does the code-in-box ship?', 'Shipping will be available starting November 12, 2026. After game launch, physical orders will ship in an estimated 1–7 days, depending on shipping selection.'],
  // ASSUMPTION: the next answer was not captured in the research.
  ['How can I track the shipping status of my physical purchase?', 'You will receive a shipping-confirmation email with a tracking link when your order ships (one tracking number per box).'],
  ['How do I cancel a pre-order on the Rockstar Store?', 'To cancel a pre-order from the Rockstar Store, please contact our fulfillment partner, Xsolla, directly to cancel your pre-order using the physical item form. Please note that you will need your order number and the email from which you ordered.'],
  // ASSUMPTION: not captured in the research.
  ['What bonuses come with the Ultimate Edition Upgrade and how do I get them?', 'The Ultimate Edition content listed under Compare Editions is delivered through the platform store after you upgrade on PlayStation Store or Microsoft Store.'],
  ['What regions does the Rockstar Store ship to?', 'Austria, Belgium, Canada, Czechia, Denmark, Finland, France, Germany, Ireland, Italy, Luxembourg, Netherlands, Norway, Poland, Portugal, Spain, Sweden, Switzerland, United Kingdom, United States. Costs of shipping for your order will be presented at checkout.'],
  // ASSUMPTION: not captured in the research.
  ['How do I redeem my free month of GTA+?', 'The free month of GTA+ is a digital-store pre-order bonus redeemed through PlayStation Store or Microsoft Store on the account that owns the game.'],
  ['Where can I find the Rockstar Store refund policy?', 'See the Refund and Return Policy linked in the footer. Xsolla is the merchant of record for physical items.'],
  ['Where can I find the receipt for my order?', 'Receipts for all purchases are sent to the email address associated with your Rockstar Games account or specified during Guest checkout.'],
]

export function gtaviPage({ base, platform = null, error = null, modal = '' }) {
  const opt = PLATFORM_OPTIONS.find(o => o.id === platform) ?? null
  const cib = platform ? listing(platform, 'standard', 'code-in-box') : null
  const linkOut = (edition) => platform ? listing(platform, edition, 'digital').linkOut : '#select-platform'
  const selfHref = `${base}${GAME.path}${platform ? `?platform=${platform}` : ''}`
  const card = (edition, name) => `<article class="rs-edition">
    <p class="rs-kicker">Grand Theft Auto VI</p><h3>${name}</h3>
    <ul class="rs-edition-list">${EDITION_CONTENT.map(i => `<li class="${edition === 'ultimate' || STANDARD_INCLUDES.has(i) ? 'is-in' : 'is-out'}">${esc(i)}</li>`).join('')}</ul>
    <p class="rs-preload">${ICON.clock} Pre-load begins November 12, 2026</p>
    <a class="rs-btn rs-btn-pill rs-btn-block" href="${esc(linkOut(edition))}" ${platform ? 'target="_blank" rel="noopener"' : 'title="Select a platform first"'}>${platformGlyph(platform)}Pre-Order Now</a>
  </article>`
  return `${modal}
<section class="rs-game-hero ${opt ? `is-${opt.id}` : ''}">
  <div class="rs-game-hero-text">
    <div class="rs-game-logo" aria-hidden="true">GRAND THEFT AUTO <span>VI</span></div>
    <span class="rs-badge">COMING SOON</span>
    <h1>Grand Theft Auto VI</h1>
    <div class="rs-platform" id="select-platform"><span class="rs-platform-label">Select Platform</span>
      <div class="rs-platform-btns">${PLATFORM_OPTIONS.map(o => `<a class="rs-platform-btn ${o.id === platform ? 'is-selected' : ''}" href="${base}${GAME.path}?platform=${o.id}" role="button" aria-pressed="${o.id === platform ? 'true' : 'false'}">${platformGlyph(o.id)}${esc(o.label)}</a>`).join('')}</div>
      ${error ? `<p class="rs-error" role="alert">${esc(error)}</p>` : ''}
    </div>
    <a class="rs-btn rs-btn-pill rs-btn-lg" href="#compare-editions">${platformGlyph(platform)}Pre-Order Now</a>
    <p class="rs-bonus">${ICON.clock} Order before November 20 to get the Vintage Vice City Pack at no additional cost*</p>
    <span class="rs-esrb"><b>RP</b> Rating Pending<br>Likely Mature 17+</span>
  </div>
  <img class="rs-game-hero-art" src="${platform === 'xbox' ? '/static/art/xbox-standard.svg' : '/static/art/ps5-standard.svg'}" alt="Grand Theft Auto VI box art">
</section>
<nav class="rs-subnav" aria-label="Page sections"><a href="#game-details">Game Details</a><a href="#trailers">Trailers</a><a href="#screenshots">Screenshots</a><a href="#compare-editions">Compare Editions</a><a href="#faq">FAQ</a><a class="rs-btn rs-btn-pill rs-btn-sm" href="#compare-editions">Pre-Order Now</a></nav>
<div class="rs-game-body">
<section id="game-details" class="rs-section"><h2>Game Details</h2>
  <p>Jason and Lucia have always known the deck is stacked against them. But when an easy score goes wrong, they find themselves on the darkest side of the sunniest place in America, in the middle of a criminal conspiracy stretching across the state of Leonida &mdash; forced to rely on each other more than ever if they want to make it out alive.</p>
  <dl class="rs-meta"><div><dt>Release Date</dt><dd>November 19, 2026</dd></div><div><dt>Developer</dt><dd>Rockstar Games</dd></div><div><dt>Publisher</dt><dd>Rockstar Games</dd></div></dl>
</section>
<section id="trailers" class="rs-section"><h2>Trailers</h2><div class="rs-thumbs">${['Trailer 2', 'Trailer 1'].map(t => `<div class="rs-thumb rs-thumb-video"><span>${ICON.play}</span><b>${t}</b></div>`).join('')}</div></section>
<section id="screenshots" class="rs-section"><div class="rs-section-head"><h2>Screenshots</h2><a href="#screenshots">View All</a></div><div class="rs-thumbs rs-thumbs-8">${Array.from({ length: 8 }, (_, i) => `<div class="rs-thumb rs-thumb-shot" style="--i:${i}"></div>`).join('')}</div></section>
<section id="compare-editions" class="rs-section"><h2>Compare Editions</h2>
  ${platform ? '' : '<p class="rs-fine">Select a platform above to pre-order a digital edition on its platform store.</p>'}
  <div class="rs-editions">${card('ultimate', 'Ultimate Edition')}${card('standard', 'Standard Edition')}</div>
</section>
<section id="code-in-box" class="rs-section rs-cib">
  <img src="${cib ? esc(cib.art) : '/static/art/ps5-standard.svg'}" alt="${cib ? esc(cib.title) : 'Grand Theft Auto VI box'}">
  <div>
    <h2>Physical (Code-in-Box) Version Available</h2>
    <p>Physical versions will only contain a download code inside the box to support pre-load on November 12. A disc will not be included in the box.</p>
    <p class="rs-fine">*While supplies last, further details <a href="#faq">below</a>.</p>
    <form method="post" action="${base}${GAME.path}/preorder" class="rs-cib-form">
      <input type="hidden" name="platform" value="${esc(platform ?? '')}">
      <button class="rs-btn rs-btn-pill rs-btn-lg rs-btn-stack" type="submit" aria-label="Pre-Order Now ${money(GAME.price)}">${platformGlyph(platform)}<span>Pre-Order Now</span><small>${money(GAME.price)}</small></button>
    </form>
    <p class="rs-fine">Taxes and shipping will be calculated in the checkout window.</p>
  </div>
</section>
<section class="rs-section rs-upgrade"><div><h2>Upgrade to the Ultimate Edition</h2><p>Purchased the game? Upgrade to the Ultimate Edition on ${esc(opt ? opt.storeName : 'PlayStation Store')} at any time.</p></div><a class="rs-btn rs-btn-pill" href="${esc(linkOut('ultimate'))}" ${platform ? 'target="_blank" rel="noopener"' : ''}>Upgrade Now ${ICON.ext}</a></section>
<section id="faq" class="rs-section"><h2>FAQ</h2>${FAQ.map(([q, a]) => `<details class="rs-faq"><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</section>
<section class="rs-section"><h2>Supported Languages</h2><p class="rs-fine">English, French, Italian, German, Russian, Japanese, Polish, Korean, Simplified Chinese, Traditional Chinese, Spanish (Mexico), Spanish (Spain), Portuguese (Brazil)</p></section>
<section class="rs-section"><h2>Trademarks and Copyrights</h2><p class="rs-fine">Rockstar Games, Inc. &copy; 2026. Grand Theft Auto is a trademark of Take-Two Interactive Software, Inc. "PlayStation" and "PS5" are registered trademarks of Sony Interactive Entertainment Inc. Xbox is a trademark of the Microsoft group of companies.</p></section>
<section class="rs-section"><h2>Legal Disclosure</h2><p class="rs-fine">Purchase grants a license to the digital product subject to the Terms of Service. The physical box contains a download code only. The Rockstar Store's fulfillment partner Xsolla is the merchant of record for physical items.</p></section>
</div>`
}

// ---------- other product pages (merchandise and other games) ----------
export function otherProductPage({ base, p, popover = '', modal = '' }) {
  const direct = p.sale === 'direct'
  const buy = direct
    ? `<div class="rs-buy-btns">
      <form method="post" action="${base}/buy-now"><input type="hidden" name="sku" value="${esc(p.sku)}"><button class="rs-btn rs-btn-primary" type="submit">${p.badge === 'COMING SOON' ? 'Pre-Order Now' : 'Buy Now'}</button></form>
      <form method="post" action="${base}/cart/add"><input type="hidden" name="sku" value="${esc(p.sku)}"><button class="rs-btn rs-btn-outline" type="submit">Add to Cart</button></form>
      <a class="rs-btn rs-btn-text" href="${base}/signin">Add to Wishlist</a></div>`
    // ASSUMPTION: other games and GTA+ are not sold directly here; like the GTA VI digital editions they link out to the platform stores.
    : `<div class="rs-buy-btns"><a class="rs-btn rs-btn-primary" href="/playstation-store/">Buy on PlayStation Store ${ICON.ext}</a><a class="rs-btn rs-btn-outline" href="/xbox-store/">Buy on Microsoft Store ${ICON.ext}</a></div>`
  return `${modal}${popover}
<div class="rs-pdp">
  <img class="rs-pdp-art" src="${esc(p.art)}" alt="${esc(p.title)}">
  <div class="rs-pdp-info">
    ${p.badge ? `<span class="rs-badge">${esc(p.badge)}</span>` : ''}
    <h1>${esc(p.title)}</h1>
    <div class="rs-price rs-price-lg">${money(p.price)}${p.priceSuffix ? esc(p.priceSuffix) : ''}</div>
    ${p.chips ? `<div class="rs-chips">${p.chips.map(c => `<span>${esc(c)}</span>`).join('')}</div>` : ''}
    ${p.stock ? `<p class="rs-stock">${esc(p.stock)}</p>` : ''}
    ${buy}
    <p>${esc(p.blurb ?? '')}</p>
    ${p.note ? `<p class="rs-fine">${esc(p.note)}</p>` : ''}
    ${direct ? '<p class="rs-fine">Taxes and shipping will be calculated in the checkout window.</p>' : ''}
  </div>
</div>`
}

// ---------- cart (merchandise only: the GTA VI code-in-box never lands here) ----------
export function cartPage({ base, t, modal = '' }) {
  const empty = !t.lines.length
  const toFree = Math.max(0, Math.round((FREE_SHIPPING_OVER - t.subtotal) * 100) / 100)
  const rows = t.lines.map(l => `<li class="rs-line">
    <img src="${esc(l.item.art)}" alt="">
    <div class="rs-line-info">
      <a href="${base}${l.item.product.path}">${esc(l.item.title)}</a>
      <div class="rs-price">${money(l.item.price)}</div>
      <form method="post" action="${base}/cart/update" class="rs-line-actions">
        <input type="hidden" name="sku" value="${esc(l.sku)}">
        <label>Qty: <select name="qty" aria-label="Quantity" onchange="this.form.submit()">${Array.from({ length: MAX_QTY }, (_, i) => i + 1).map(n => `<option value="${n}" ${n === l.qty ? 'selected' : ''}>${n}</option>`).join('')}</select></label><noscript><button type="submit" name="action" value="update" class="rs-link-btn">Update</button></noscript>
        <span class="rs-stock">${esc(l.item.product.stock ?? 'In stock')}</span>
        <button type="submit" name="action" value="remove" class="rs-link-btn">Remove</button>
      </form>
    </div>
  </li>`).join('')
  return `${modal}
<div class="rs-cart">
  <div class="rs-cart-main"><h1>My Cart</h1>
    ${empty ? '<p class="rs-cart-empty">Your cart is empty</p>' : `<ul class="rs-lines">${rows}</ul><p class="rs-subtotal">Subtotal (${t.count} item${t.count === 1 ? '' : 's'}): ${money(t.subtotal)}</p>`}
  </div>
  <aside class="rs-summary">
    <h2>Order Summary</h2>
    <div class="rs-row"><span>Total for Items</span><span>${money(t.subtotal)}</span></div>
    <div class="rs-row"><span>Subtotal (${t.count} item${t.count === 1 ? '' : 's'})</span><span>${empty ? '0.00' : money(t.subtotal)}</span></div>
    <p class="rs-fine">${empty ? `Get FREE shipping with orders over ${money(FREE_SHIPPING_OVER)}` : toFree > 0 ? `Add ${money(toFree)} to this order to qualify for FREE standard shipping.` : 'Your order qualifies for FREE standard shipping.'}</p>
    <form method="post" action="${base}/cart/checkout"><button class="rs-btn rs-btn-primary rs-btn-block" type="submit" ${empty ? 'disabled' : ''}>PROCEED TO CHECKOUT</button></form>
    <p class="rs-fine">Taxes and shipping will be calculated in the checkout window.</p>
  </aside>
</div>`
}

// ---------- Rockstar Games Account (Social Club) sign-in ----------
export function signInPage({ base, returnTo = '', email = '', error = null }) {
  return `<div class="rs-auth">
  <div class="rs-auth-brand"><span class="rs-logo-mark">R<span>*</span></span><span>Rockstar Games Social Club</span></div>
  <h1>Sign In</h1>
  <p class="rs-fine">Sign in with your Rockstar Games Account to continue to the Rockstar Store.</p>
  ${error ? `<p class="rs-error" role="alert">${esc(error)}</p>` : ''}
  <form method="post" action="${base}/signin${returnTo ? `?return=${encodeURIComponent(returnTo)}` : ''}" novalidate>
    <label for="email">Email / Nickname</label><input id="email" name="email" type="text" autocomplete="username" value="${esc(email)}" required>
    <label for="password">Password</label><input id="password" name="password" type="password" autocomplete="current-password" required>
    <button class="rs-btn rs-btn-primary rs-btn-block" type="submit">SIGN IN</button>
  </form>
  <p class="rs-fine"><a href="#">Forgot your password?</a> &nbsp;&middot;&nbsp; New here? <a href="${base}/signup${returnTo ? `?return=${encodeURIComponent(returnTo)}` : ''}">Create a Rockstar Games Account</a></p>
</div>`
}

export function signUpPage({ base, returnTo = '', values = {}, errors = {} }) {
  const f = (name, label, type = 'text', extra = '') => `<label for="${name}">${label}</label><input id="${name}" name="${name}" type="${type}" value="${esc(values[name] ?? '')}" ${extra}>${errors[name] ? `<span class="rs-error">${esc(errors[name])}</span>` : ''}`
  return `<div class="rs-auth">
  <div class="rs-auth-brand"><span class="rs-logo-mark">R<span>*</span></span><span>Rockstar Games Social Club</span></div>
  <h1>Create a Rockstar Games Account</h1>
  <form method="post" action="${base}/signup${returnTo ? `?return=${encodeURIComponent(returnTo)}` : ''}" novalidate>
    ${f('email', 'Email', 'email', 'autocomplete="email" required')}
    ${f('nickname', 'Nickname', 'text', 'autocomplete="nickname" required')}
    ${f('password', 'Password', 'password', 'autocomplete="new-password" required')}
    <label for="country">Country</label><select id="country" name="country">${COUNTRIES.map(([c, n]) => `<option value="${c}" ${(values.country ?? 'US') === c ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select>
    <button class="rs-btn rs-btn-primary rs-btn-block" type="submit">CREATE ACCOUNT</button>
  </form>
  <p class="rs-fine">Already have an account? <a href="${base}/signin${returnTo ? `?return=${encodeURIComponent(returnTo)}` : ''}">Sign In</a></p>
</div>`
}

// ---------- Xsolla Pay Station lightbox (the checkout) ----------
// The lightbox (close X) around Xsolla's page. The research saw no step indicator or merchant bar in it, and
// "Secure Connection" sits in Xsolla's footer.
export function checkoutShell({ closeHref, wide = false, inner }) {
  return `<div class="xs-backdrop"><p class="xs-placeholder">Entering checkout window</p>
<div class="xs-panel ${wide ? 'xs-wide' : ''}" role="dialog" aria-modal="true" aria-label="Checkout">
  <a class="xs-close" href="${esc(closeHref)}" aria-label="Close">&times;</a>
  ${inner}
  <div class="xs-footer"><p>Xsolla is an authorized video game software distributor providing clients with advanced technical tools for their games.</p><p>&copy; 2006-2026 Xsolla &nbsp;&middot;&nbsp; <span class="xs-secure">${ICON.lock} Secure Connection</span> &nbsp;&middot;&nbsp; <a href="#">Privacy Policy</a> | <a href="#">EULA</a> | <a href="#">Refund Policy</a> | <a href="#">Legal Agreements</a></p></div>
</div></div>`
}

function addressBlock(a) {
  return `<address class="xs-address">${esc(a.first_name)} ${esc(a.last_name)}<br>${esc(a.line1)}${a.line2 ? `, ${esc(a.line2)}` : ''}<br>${esc(a.city)}, ${esc(a.state)} ${esc(a.postal_code)}<br>${esc(COUNTRIES.find(c => c[0] === a.country)?.[1] ?? a.country)}<br>${[a.phone, a.email].filter(Boolean).map(esc).join(' &middot; ')}</address>`
}

// "You cannot change your shipping address once you submit your pre-order." (GTA VI); the merchandise flow says "...your order."
const lockNote = (preorder) => `You cannot change your shipping address once you submit your ${preorder ? 'pre-order' : 'order'}.`
const FLAG_US = '<svg width="18" height="12" viewBox="0 0 18 12" aria-hidden="true"><rect width="18" height="12" fill="#fff"/><path d="M0 0h18v1.3H0zM0 2.7h18V4H0zM0 5.3h18v1.4H0zM0 8h18v1.3H0zM0 10.7h18V12H0z" fill="#b22234"/><rect width="8" height="6.5" fill="#3c3b6e"/></svg>'

export function shippingAddressStep({ base, values = {}, errors = {}, preorder = true, closeHref }) {
  // Observed validation: every invalid field gets a red left bar, the first one is focused and only the focused field
  // shows the red "Required" tooltip (CSS :focus-within); Apartment gets a green check.
  const failed = Object.keys(errors).length > 0
  const firstInvalid = ['first_name', 'last_name', 'city', 'region', 'postal_code', 'street_address', 'phone', 'email'].find(k => errors[k])
  const state = (name) => errors[name] ? 'is-invalid' : failed ? 'is-valid' : ''
  const aria = (name) => errors[name] ? `aria-invalid="true" aria-describedby="err-${name}"${name === firstInvalid ? ' autofocus' : ''}` : ''
  const tip = (name) => errors[name] ? `<span class="xs-tooltip" id="err-${name}" role="alert">${esc(errors[name])}</span>` : ''
  const field = (name, label, type = 'text', extra = '') => `<div class="xs-field ${state(name)}">
    <label for="${name}">${label}</label>
    <input class="xs-input" id="${name}" name="${name}" type="${type}" value="${esc(values[name] ?? '')}" ${extra} ${aria(name)}>
    ${tip(name)}</div>`
  // Xsolla's consent bar covers the CONTINUE button until it is dismissed. The X and "Agree to all" are labels for a
  // hidden checkbox, so dismissing works without JavaScript. It is only shown on the first visit to the step.
  const consent = failed ? '' : `<input type="checkbox" id="xs-consent-dismiss" class="visually-hidden" tabindex="-1" aria-hidden="true">
      <div class="xs-consent" role="region" aria-label="Xsolla consent"><label><input type="checkbox"> I give my consent for Xsolla to use my personal data to offer and/or market customized services to me.</label><label><input type="checkbox"> I consent to enable all cookies listed within the Cookie Policy.</label><div class="xs-consent-actions"><label for="xs-consent-dismiss" class="xs-btn xs-btn-sm">Agree to all</label><label for="xs-consent-dismiss" class="xs-consent-close" aria-label="Close">&times;</label></div></div>`
  const inner = `<h1 class="xs-title">Shipping Address</h1>
  <h2 class="xs-subtitle">Recipient Shipping Address</h2>
  <div class="xs-info">${lockNote(preorder)}</div>
  <form method="post" action="${base}/checkout/shipping-address" class="xs-form xs-address-form" novalidate>
    <div class="xs-field xs-field-country"><label for="country">Country</label><select class="xs-input xs-country" id="country" name="country" autocomplete="country">${COUNTRIES.map(([c, n]) => `<option value="${c}" ${(values.country ?? 'US') === c ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select></div>
    <div class="xs-2col">${field('first_name', 'First Name', 'text', 'autocomplete="given-name" required')}${field('last_name', 'Last Name', 'text', 'autocomplete="family-name" required')}</div>
    ${field('city', 'City', 'text', 'autocomplete="address-level2" required')}
    <div class="xs-2col">${field('region', 'Region/State', 'text', 'autocomplete="address-level1" required')}${field('postal_code', 'Postal Code', 'text', 'autocomplete="postal-code" required')}</div>
    ${field('street_address', 'Street Address', 'text', 'autocomplete="address-line1" required')}
    ${field('apartment', 'Apartment', 'text', 'autocomplete="address-line2"')}
    <div class="xs-field xs-field-phone ${state('phone')}"><label for="phone">Phone</label><div class="xs-phone"><span class="xs-prefix" title="United States">${FLAG_US} +1</span><input class="xs-input" id="phone" name="phone" type="tel" autocomplete="tel-national" value="${esc(values.phone ?? '')}" required ${aria('phone')}></div>${tip('phone')}</div>
    ${field('email', 'Email', 'email', 'autocomplete="email" required')}
    <div class="xs-actions xs-actions-consent"><button class="xs-btn" type="submit">CONTINUE</button>${consent}</div>
  </form>`
  return checkoutShell({ closeHref, inner })
}

export function shippingMethodStep({ base, address, method = 'standard', subtotal, error = null, preorder = true, closeHref }) {
  const inner = `<h1 class="xs-title">Shipping Method</h1>
  <div class="xs-locked"><div class="xs-locked-head"><b>Shipping Address</b><span>${ICON.lock} Locked</span></div>${addressBlock(address)}<p class="xs-fine">${lockNote(preorder)}</p></div>
  <form method="post" action="${base}/checkout/shipping-method" class="xs-form" novalidate>
    ${Object.values(SHIPPING_METHODS).map(m => { const cost = m.freeOver !== null && subtotal >= m.freeOver ? 0 : m.price; return `<label class="xs-option"><input type="radio" name="shipping_method" value="${m.id}" ${method === m.id ? 'checked' : ''}><span class="xs-option-body"><b>${esc(m.name)}</b><span class="xs-fine">${esc(m.eta)}</span></span><span class="xs-option-price">${cost ? money(cost) : 'FREE'}</span></label>` }).join('')}
    ${error ? `<span class="xs-tooltip" role="alert">${esc(error)}</span>` : ''}
    <div class="xs-actions"><button class="xs-btn" type="submit">CONTINUE</button></div>
  </form>`
  return checkoutShell({ closeHref, inner })
}

export function paymentStep({ base, t, address, method, values = {}, errors = {}, user = null, preorder = true, closeHref }) {
  const pm = values.payment_method === 'paypal' ? 'paypal' : 'card'
  const m = SHIPPING_METHODS[method]
  const field = (name, label, extra = '', value = values[name] ?? '') => `<div class="xs-field ${errors[name] ? 'is-invalid' : ''}"><label for="${name}">${label}</label><input class="xs-input" id="${name}" name="${name}" type="text" value="${esc(value)}" ${extra} ${errors[name] ? `aria-invalid="true" aria-describedby="err-${name}"` : ''}>${errors[name] ? `<span class="xs-tooltip" id="err-${name}" role="alert">${esc(errors[name])}</span>` : ''}</div>`
  const inner = `<div class="xs-pay">
  <aside class="xs-order">
    <h2>Order information</h2>
    ${t.lines.map(l => `<div class="xs-order-item"><img src="${esc(l.item.art)}" alt=""><div><b>${esc(l.item.title)}</b><span class="xs-fine">Qty ${l.qty}</span></div><span>${money(l.item.price * l.qty)}</span></div>`).join('')}
    <div class="xs-row"><span>Subtotal</span><span>${money(t.subtotal)}</span></div>
    <div class="xs-row"><span>Shipping (${esc(m.name)})</span><span>${t.shipping ? money(t.shipping) : 'FREE'}</span></div>
    <div class="xs-row"><span>Tax</span><span>${money(t.tax)}</span></div>
    <div class="xs-row xs-total"><span>Total</span><span>${money(t.total)}</span></div>
    <div class="xs-locked"><div class="xs-locked-head"><b>Ship to</b><span>${ICON.lock} Locked</span></div>${addressBlock(address)}</div>
  </aside>
  <form method="post" action="${base}/checkout/payment" class="xs-form xs-pay-form" novalidate>
    <h1 class="xs-title">Payment method</h1>
    <div class="xs-methods">
      <label class="xs-method"><input type="radio" name="payment_method" value="card" ${pm === 'card' ? 'checked' : ''}> <span>Payment via card</span><span class="xs-brands">Visa &middot; Mastercard &middot; Amex &middot; Discover</span></label>
      <label class="xs-method"><input type="radio" name="payment_method" value="paypal" ${pm === 'paypal' ? 'checked' : ''}> <span>PayPal</span></label>
    </div>
    <div class="xs-method-panel" data-panel="card">
      ${field('card_number', 'Card number', 'autocomplete="cc-number" inputmode="numeric"', '')}
      <div class="xs-2col">${field('expiry', 'MM/YY', 'autocomplete="cc-exp" placeholder="MM/YY"')}${field('cvc', 'CVC', 'autocomplete="cc-csc" inputmode="numeric" maxlength="4"', '')}</div>
      ${field('cardholder_name', 'Cardholder name', 'autocomplete="cc-name"')}
      <label class="xs-check"><input type="checkbox" name="save_payment" value="1" ${user ? '' : 'disabled'}> Save payment account${user ? '' : ' <span class="xs-fine">(not available for guest checkout)</span>'}</label>
    </div>
    <div class="xs-method-panel" data-panel="paypal"><p class="xs-fine">You will be redirected to PayPal to complete your purchase.</p></div>
    <div class="xs-actions"><button class="xs-btn xs-btn-pay" type="submit">Pay ${money(t.total)}</button></div>
    ${preorder ? '<p class="xs-fine">Your payment method will not be charged until the physical pre-order is ready to be shipped. You will receive a notification email about two weeks before your payment method is charged.</p>' : ''}
  </form></div>
<script>(function(){var f=document.querySelector('.xs-pay-form');function s(){var v=f.querySelector('input[name=payment_method]:checked').value;f.querySelectorAll('.xs-method-panel').forEach(function(p){p.hidden=p.dataset.panel!==v})}f.querySelectorAll('input[name=payment_method]').forEach(function(r){r.addEventListener('change',s)});s()})();</script>`
  return checkoutShell({ closeHref, wide: true, inner })
}

export function statusPage({ base, order }) {
  const a = order.shipping_address
  const m = SHIPPING_METHODS[order.fulfillment.option] ?? SHIPPING_METHODS.standard
  const preorder = order.meta.preorder !== false
  // Heading and email line are real Rockstar Store strings ("Thank you for your purchase!", "Your order confirmation email is on the way.").
  const inner = `<div class="xs-status">
  <div class="xs-status-icon" aria-hidden="true">${ICON.check}</div>
  <h1 class="xs-title">Thank you for your purchase!</h1>
  <p>Your ${preorder ? 'pre-order' : 'order'} has been placed. Your order confirmation email is on the way to <b>${esc(order.customer.email)}</b>.</p>
  <p class="xs-txn">Transaction ID: <b data-order-number>${esc(order.order_number)}</b></p>
  <div class="xs-receipt">
    ${order.items.map(it => `<div class="xs-row"><span>${esc(it.title)} &times; ${it.qty}</span><span>${money(it.unit_price * it.qty)}</span></div>`).join('')}
    <div class="xs-row"><span>Shipping (${esc(m.name)})</span><span>${order.totals.shipping ? money(order.totals.shipping) : 'FREE'}</span></div>
    <div class="xs-row"><span>Tax</span><span>${money(order.totals.tax)}</span></div>
    <div class="xs-row xs-total"><span>Total</span><span>${money(order.totals.total)}</span></div>
    <div class="xs-row"><span>Payment</span><span>${order.payment.method === 'card' ? `${esc(order.payment.brand)} ending in ${esc(order.payment.last4)}` : 'PayPal'}</span></div>
  </div>
  <div class="xs-locked"><div class="xs-locked-head"><b>Ship to</b></div>${addressBlock({ ...a, email: order.customer.email })}</div>
  <p class="xs-fine">${preorder ? 'Your payment method will not be charged until the physical pre-order is ready to be shipped. We will email you about two weeks before the charge, and again with a tracking link when your pre-order ships. Keep your Transaction ID and email handy if you need to cancel through Xsolla.' : 'We will email you a tracking link when your order ships.'}</p>
  <div class="xs-actions xs-actions-center"><a class="xs-btn" href="${base}/">Back to Store</a></div>
</div>`
  return checkoutShell({ closeHref: `${base}/`, inner })
}

// Placeholder covers for the other games (no real artwork): the title on a colored gradient, tile-shaped (208x257).
const COVER_COLORS = { 'gta-v': ['#0f3d2e', '#3fa66b'], 'red-dead-redemption-2': ['#3a0b0b', '#c0392b'], 'red-dead-redemption': ['#3b2208', '#d98c2b'], 'bully-scholarship-edition': ['#0b2340', '#3d7bd9'], 'gta-plus': ['#3a0f33', '#e0529c'] }
export function coverSvg(p) {
  const [c1, c2] = COVER_COLORS[p.id] ?? ['#222', '#555']
  const lines = []
  for (const w of p.title.toUpperCase().split(' ')) {
    const last = lines[lines.length - 1]
    if (last && `${last} ${w}`.length <= 12) lines[lines.length - 1] = `${last} ${w}`
    else lines.push(w)
  }
  const y0 = 128 - (lines.length - 1) * 14
  return `<svg xmlns="http://www.w3.org/2000/svg" width="208" height="257" viewBox="0 0 208 257" role="img" aria-label="${esc(p.title)} cover art placeholder"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><rect width="208" height="257" fill="url(#g)"/>${lines.map((l, i) => `<text x="104" y="${y0 + i * 28}" font-family="Impact,Arial Black,sans-serif" font-size="24" fill="#fff" text-anchor="middle">${esc(l)}</text>`).join('')}<text x="104" y="240" font-family="Arial,sans-serif" font-size="10" fill="#fff" text-anchor="middle" opacity=".8">ROCKSTAR GAMES</text></svg>`
}

export function simplePage({ title, html }) {
  return `<div class="rs-simple"><h1>${esc(title)}</h1>${html}</div>`
}
