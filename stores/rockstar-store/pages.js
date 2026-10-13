import { fixtureCatalog } from '../../lib/catalog-policy.js'
import { productImage, productGallery } from '../../lib/product-assets.js'
import * as D from './depth-pages.js'
import { NAV, FOOTER, referenceHome, digitalHref } from './parity-pages.js'
import { orderStatus } from '../../lib/retail-state.js'
import { itemDelivery } from './journeys.js'
import { esc, money, disclaimer } from '../../lib/html.js'
import { GAME, PLATFORM_OPTIONS, listing, SHIPPING_METHODS, COUNTRIES, MAX_QTY, FREE_SHIPPING_OVER, SORTS, shippingCost, deliveryEta } from './data.js'

const NAME = 'Rockstar Store'

// Header menubar and footer links from the real store (research/parity/rockstar-store.json).
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
  const navLinks = NAV.map((n,i) => `<li class="rs-menu-item">${n.items ? `<details class="rs-desktop-menu"><summary aria-controls="rs-menu-${i}">${esc(n.label)} <span aria-hidden="true">⌄</span></summary><ul class="rs-dropdown" id="rs-menu-${i}">${n.items.map(([l,h])=>`<li><a href="${base}${h}">${esc(l)}</a></li>`).join('')}</ul></details>` : `<a href="${base}${n.href}">${esc(n.label)}</a>`}</li>`).join('')
  const drawerLinks = NAV.map(n => `<li><a href="${base}${n.href}">${esc(n.label)}</a>${n.items ? `<ul>${n.items.map(([l, h]) => `<li><a href="${base}${h}">${esc(l)}</a></li>`).join('')}</ul>` : ''}</li>`).join('')
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)} | Rockstar Store</title>
<link rel="stylesheet" href="${base}/static/style.css"><script src="${base}/static/storefront.js" defer></script></head>
<body class="${esc(bodyClass)}">
<a class="rs-skip" href="#top">Skip to content</a>
<header class="rs-header">
  <details class="rs-drawer"><summary aria-label="Open menu">&#9776;</summary><nav aria-label="Menu"><ul>${drawerLinks}</ul></nav></details>
  <a class="rs-logo" href="${base}/" aria-label="Rockstar Store Home"><span class="rs-logo-mark">R<span>*</span></span><span class="rs-logo-word">Store</span></a>
  <nav class="rs-menubar" aria-label="Main"><ul>${navLinks}</ul></nav>
  <form class="rs-search" action="${base}/search" method="get" role="search">
    <label for="rs-q" class="visually-hidden">Search</label>
    <input id="rs-q" type="search" name="q" placeholder="Search" value="${esc(searchQ)}" list="rs-suggestions"><datalist id="rs-suggestions"><option value="Grand Theft Auto"><option value="Red Dead Redemption"><option value="Bully"><option value="apparel"><option value="Gold Bars"><option value="Rockstar cap"></datalist>
    <button type="submit" aria-label="Search">${ICON.search}</button>
  </form>
  ${user ? `<details class="rs-user-menu"><summary class="rs-user" aria-label="Account">${ICON.user}<span>${esc(user.nickname || user.first_name || 'Account')}</span></summary><div class="rs-user-drop"><p>Welcome, ${esc(user.nickname || user.first_name || user.email)}</p><a href="${base}/wishlist">Wishlist</a><a href="${base}/signout">Sign Out</a><a href="${base}/account">Your Account</a><a href="${base}/account/orders">Orders</a><a href="${base}/library">PC Library</a><a href="${base}/recently-viewed">Recently viewed</a></div></details>` : `<a class="rs-user" href="${base}/signin" aria-label="Sign In">${ICON.user}<span>Sign In</span></a>`}
  <a class="rs-cart-link" href="${base}/cart" aria-label="cart${cartCount ? `, ${cartCount} items` : ''}">${ICON.cart}${cartCount ? `<span class="rs-cart-badge">${cartCount}</span>` : ''}</a>
</header>
<main class="rs-main" id="top">${body}</main>
<footer class="rs-footer">
  <a class="rs-footer-logo" href="${base}/rockstar-games" aria-label="Rockstar Games"><span>R<b>*</b></span></a>
  <ul class="rs-footer-links">${FOOTER.map(([l,h])=>`<li><a href="${base}${h}">${esc(l)}</a></li>`).join('')}</ul>
  <p class="rs-legal">Rockstar Games, Inc. &copy; 2026. All other marks and trademarks are properties of their respective owners.</p>
  <div class="rs-footer-tools"><details class="rs-language"><summary>English ▾</summary><p>Region: United States<br>Currency: USD</p></details><a href="#top" class="rs-backtop">Back to top</a></div>
  ${disclaimer(NAME)}
</footer>
${cookieBanner ? `<div class="rs-cookie" role="dialog" aria-label="Cookie preferences">
  <p>We use cookies to improve your experience. See our <a href="${base}/cookie-policy">Cookie Policy</a>.</p>
  <form method="post" action="${base}/cookies"><input type="hidden" name="return" value="${esc(returnTo)}">
    <button type="submit" name="choice" value="accept">ACCEPT ALL COOKIES</button>
    <button type="submit" name="choice" value="reject">REJECT ALL</button>
    <button type="submit" name="choice" value="settings">COOKIE SETTINGS</button>
    <button type="submit" name="choice" value="close" class="rs-cookie-close" aria-label="Close">&times;</button>
  </form></div>` : ''}
</body></html>`
}

// ---------- tiles ----------
function tile(base,p) { return D.tile(base,p) }

const grid = (base, products, opts) => `<div class="rs-grid">${products.map(p => tile(base, p, opts)).join('')}</div>`
const carousel = (base, heading, products) => D.shelf(base,heading,products,`/search?collection=${encodeURIComponent(({'New Arrivals':'new-arrivals','Games':'games','Best Sellers':'best-sellers','Grand Theft Auto Collection':'gta','Red Dead Redemption Essentials Collection':'rdr'})[heading]||heading)}`)

// ---------- home ----------
export function homePage({ base, products }) {
  if (!fixtureCatalog) return referenceHome(base)
  const by = (c) => {
    const selected=products.filter(p=>p.collections?.includes(c))
    if(c==='new-arrivals')return [...selected].sort((a,b)=>Boolean(b.photo)-Boolean(a.photo)).slice(0,10)
    if(c==='best-sellers')return selected.filter(p=>!['gta-vi','gta-plus'].includes(p.id)).sort((a,b)=>(b.section==='Gear')-(a.section==='Gear'))
    return selected
  }
  const collection = products.find(p => p.id === 'gtavi-goodtime-state-vice-city-collection')
  const candle=products.find(p=>p.id==='red-dead-candle'), tray=products.find(p=>p.id==='vintage-glass-tray'), gold=products.find(p=>p.id==='gold-bars')
  return `<section class="rs-hero-carousel" aria-label="Featured campaigns" data-hero>
  <div class="rs-hero-track" id="rs-featured-track">
    <article class="rs-hero rs-hero-collection" id="slide-1" aria-label="1 of 2">
      <div class="rs-hero-media">${D.art(collection)}</div>
      <div class="rs-hero-text"><span class="rs-badge">COMING SOON</span><h2>${esc(collection.title)}</h2><p>${esc(collection.blurb)}</p><a class="rs-btn rs-btn-pill" href="${base}${collection.path}">Pre-Order Now</a></div>
    </article>
    <article class="rs-hero rs-hero-gtavi" id="slide-2" aria-label="2 of 2">
      <div class="rs-hero-media">${productImage('rockstar-store',GAME)}</div>
      <div class="rs-hero-text"><span class="rs-badge">COMING SOON</span><h2>Grand Theft Auto VI</h2><p>Reserve today to unlock exclusive benefits and be ready to play at launch.</p><a class="rs-btn rs-btn-pill" href="${base}${GAME.path}">Pre-Order Now</a></div>
    </article>
  </div>
  <div class="rs-hero-controls"><button class="rs-round" data-hero-step="-1" aria-label="Previous campaign" aria-controls="rs-featured-track">‹</button><div class="rs-hero-dots"><button data-hero-index="0" aria-label="Go to slide 1" aria-current="true"></button><button data-hero-index="1" aria-label="Go to slide 2"></button></div><button class="rs-round" data-hero-step="1" aria-label="Next campaign" aria-controls="rs-featured-track">›</button><span class="visually-hidden" data-hero-status aria-live="polite">Campaign 1 of 2</span></div>
</section>
${carousel(base, 'New Arrivals', by('new-arrivals'))}
${carousel(base, 'Games', by('games'))}
${carousel(base, 'Best Sellers', by('best-sellers'))}
<section class="rs-wide-promo rs-red-promo"><div class="rs-promo-copy"><p class="rs-eyebrow">RED DEAD REDEMPTION</p><h2>Essentials for the collection.</h2><p>Discover collectibles, accessories and stories from the frontier.</p><a class="rs-btn rs-btn-pill" href="${base}/red-dead-redemption-collection">Shop Now</a></div><div class="rs-promo-products">${D.art(candle)}${D.art(tray)}</div></section>
${carousel(base, 'Grand Theft Auto Collection', by('gta'))}
<section class="rs-wide-promo rs-gold-promo"><div class="rs-promo-copy"><p class="rs-eyebrow">RED DEAD ONLINE</p><h2>Buy Gold Bars for PC</h2><p>Choose your Gold Bar bundle for Red Dead Online on the Rockstar Games Launcher.</p><a class="rs-btn rs-btn-pill" href="${base}${gold.path}">Shop Now</a><p class="rs-fine">Base game and Rockstar Games account required.</p></div><div class="rs-promo-currency">${D.art(gold)}</div></section>
${carousel(base, 'Red Dead Redemption Essentials Collection', by('rdr'))}`
}

// ---------- search / listing ----------
export const searchPage = D.searchPage
export const hubPage = D.hubPage

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
  <div class="rs-added-body">${D.art(item)}<div><b>${esc(item.title)}</b><div>${money(item.price)}</div></div></div>
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

const referenceRoot = '/static/reference/rockstar-store/'
const screenshotFiles = [['01_-_Vice_City_01.jpg','Vice City sign with plane flying over'],['02_-_Jason_Duval_01.jpg','Green motorcycle with Jason standing to the right'],['03_-_Lucia_Caminos_01.jpg','Lucia in a punching stance'],['04_-_Leonida_Keys_01.jpg','Leonida Keys'],['05_-_Boobie_Ike_02.jpg','Boobie Ike'],['06_-_Cal_Hampton_03.jpg','Cal Hampton'],['07_-_Brian_Heder_03.jpg','Brian Heder'],['08_-_Grassrivers_03.jpg','Grassrivers']]

export function gtaviPage({ base, platform = null, error = null, modal = '' }) {
  const opt = PLATFORM_OPTIONS.find(o => o.id === platform) ?? null
  const cib = platform ? listing(platform, 'standard', 'code-in-box') : null
  const linkOut = (edition) => platform ? digitalHref(base, platform, edition) : '#select-platform'
  const newTab = fixtureCatalog ? 'target="_blank" rel="noopener"' : ''
  const upgradeLink = platform ? digitalHref(base, platform, 'upgrade') : '#select-platform'
  const selfHref = `${base}${GAME.path}${platform ? `?platform=${platform}` : ''}`
  const card = (edition, name) => `<article class="rs-edition">
    <img class="rs-edition-reference" src="${referenceRoot}${edition === 'ultimate' ? 'UltimateEdition_07_en_us_R04_Deliv.jpg' : 'GTAVI_PreOrderWebstore_CompareEditionsThumbnail_Standard_1280x720_R01.jpg'}" alt="Grand Theft Auto VI ${name}" loading="lazy"><p class="rs-kicker">Grand Theft Auto VI</p><h3>${name}</h3>
    <ul class="rs-edition-list">${EDITION_CONTENT.map(i => `<li class="${edition === 'ultimate' || STANDARD_INCLUDES.has(i) ? 'is-in' : 'is-out'}">${esc(i)}</li>`).join('')}</ul>
    <p class="rs-preload">${ICON.clock} Pre-load begins November 12, 2026</p>
    <a class="rs-btn rs-btn-pill rs-btn-block" href="${esc(linkOut(edition))}" ${platform ? newTab : 'title="Select a platform first"'}>${platformGlyph(platform)}Pre-Order Now</a>
  </article>`
  return `${modal}
<section class="rs-game-hero rs-reference-hero ${opt ? `is-${opt.id}` : ''}">
  <div class="rs-game-hero-text">
    <span class="rs-badge">COMING SOON</span>
    <h1>Grand Theft Auto VI</h1>
    <div class="rs-platform" id="select-platform"><span class="rs-platform-label">Select Platform</span>
      <div class="rs-platform-btns">${PLATFORM_OPTIONS.map(o => `<a class="rs-platform-btn ${o.id === platform ? 'is-selected' : ''}" href="${base}${GAME.path}?drm=${o.drm}" role="button" aria-pressed="${o.id === platform ? 'true' : 'false'}">${platformGlyph(o.id)}${esc(o.label)}</a>`).join('')}</div>
      ${error ? `<p class="rs-error" role="alert">${esc(error)}</p>` : ''}
    </div>
    <a class="rs-btn rs-btn-pill rs-btn-lg" href="#compare-editions">${platformGlyph(platform)}Pre-Order Now</a>
    <p class="rs-bonus">${ICON.clock} Order before November 20 to get the Vintage Vice City Pack at no additional cost*</p>
    <span class="rs-esrb"><b aria-label="Mature 17+">M</b><span>Blood and Gore, Intense Violence, Mature Humor, Nudity, Strong Language, Strong Sexual Content, Use of Drugs and Alcohol<hr>In-Game Purchases</span></span>
  </div>
  <img class="rs-game-hero-art" src="${referenceRoot}GTAVI_PreOrderWebstore_GamesGrid_FOB_1212x1497_R01.jpg" alt="Grand Theft Auto VI">
</section>
<nav class="rs-subnav" aria-label="Page sections"><a href="#game-details">Game Details</a><a href="#trailers">Trailers</a><a href="#screenshots">Screenshots</a><a href="#compare-editions">Compare Editions</a><a href="#faq">FAQ</a><a class="rs-btn rs-btn-pill rs-btn-sm" href="#compare-editions">Pre-Order Now</a></nav>
<div class="rs-game-body">
<section id="game-details" class="rs-section"><h2>Game Details</h2>
  <p>Jason and Lucia have always known the deck is stacked against them. But when an easy score goes wrong, they find themselves on the darkest side of the sunniest place in America, in the middle of a criminal conspiracy stretching across the state of Leonida &mdash; forced to rely on each other more than ever if they want to make it out alive.</p>
  <dl class="rs-meta"><div><dt>Release Date</dt><dd>November 19, 2026</dd></div><div><dt>Developer</dt><dd>Rockstar Games</dd></div><div><dt>Publisher</dt><dd>Rockstar Games</dd></div></dl>
</section>
<section id="trailers" class="rs-section"><h2>Trailers</h2><div class="rs-thumbs">${['Trailer 2', 'Trailer 1'].map(t => `<div class="rs-thumb rs-thumb-video"><span>${ICON.play}</span><b>${t}</b></div>`).join('')}</div></section>
<section id="screenshots" class="rs-section"><div class="rs-section-head"><h2>Screenshots</h2><a href="#screenshots">View All</a></div><div class="rs-thumbs rs-thumbs-8">${screenshotFiles.map(([file,alt],i)=>`<a class="rs-thumb rs-thumb-shot" href="#rs-shot-${i}"><img src="${referenceRoot}${file}" alt="${esc(alt)}" loading="lazy"></a><div class="rs-shot-lightbox" id="rs-shot-${i}" role="dialog" aria-modal="true" aria-label="${esc(alt)}"><a href="#screenshots" aria-label="Close screenshot">×</a><img src="${referenceRoot}${file}" alt="${esc(alt)}" loading="lazy"></div>`).join('')}</div></section>
<section id="compare-editions" class="rs-section"><h2>Compare Editions</h2>
  ${platform ? '' : '<p class="rs-fine">Select a platform above to pre-order a digital edition on its platform store.</p>'}
  <div class="rs-editions">${card('ultimate', 'Ultimate Edition')}${card('standard', 'Standard Edition')}</div>
</section>
<section id="code-in-box" class="rs-section rs-cib">
  <img src="${referenceRoot}${platform === 'xbox' ? 'GTAVI_PreOrderWebstore_GamesGrid_FOB_1212x1497_R01.jpg' : 'GTAVI_PreOrderWebstore_CodeInABox_Flat_NR_SONY_300x374_R04.jpg'}" alt="Grand Theft Auto VI ${platform === 'xbox' ? 'cover' : 'PlayStation 5 code-in-box'}">
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
<section class="rs-section rs-upgrade"><div><h2>Upgrade to the Ultimate Edition</h2><p>Purchased the game? Upgrade to the Ultimate Edition on ${esc(opt ? opt.storeName : 'PlayStation Store')} at any time.</p></div><a class="rs-btn rs-btn-pill" href="${esc(upgradeLink)}" ${platform ? newTab : ''}>Upgrade Now ${ICON.ext}</a></section>
<section id="faq" class="rs-section"><h2>FAQ</h2>${FAQ.map(([q, a]) => `<details class="rs-faq"><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</section>
<section class="rs-section"><h2>Supported Languages</h2><p class="rs-fine">English, French, Italian, German, Russian, Japanese, Polish, Korean, Simplified Chinese, Traditional Chinese, Spanish (Mexico), Spanish (Spain), Portuguese (Brazil)</p></section>
<section class="rs-section"><h2>Trademarks and Copyrights</h2><p class="rs-fine">Rockstar Games, Inc. &copy; 2026. Grand Theft Auto is a trademark of Take-Two Interactive Software, Inc. "PlayStation" and "PS5" are registered trademarks of Sony Interactive Entertainment Inc. Xbox is a trademark of the Microsoft group of companies.</p></section>
<section class="rs-section"><h2>Legal Disclosure</h2><p class="rs-fine">Purchase grants a license to the digital product subject to the Terms of Service. The physical box contains a download code only. The Rockstar Store's fulfillment partner Xsolla is the merchant of record for physical items.</p></section>
</div>`
}

// ---------- other product pages (merchandise and other games) ----------
export const otherProductPage = D.otherProductPage

// ---------- cart (merchandise only: the GTA VI code-in-box never lands here) ----------
export function cartPage({ base, t, modal = '' }) {
  const empty = !t.lines.length
  const toFree = Math.max(0, Math.round((FREE_SHIPPING_OVER - t.physicalSubtotal) * 100) / 100)
  const rows = t.lines.map(l => `<li class="rs-line">
    ${D.art(l.item)}
    <div class="rs-line-info">
      <a href="${base}${l.item.product.path}">${esc(l.item.title)}</a>
      <div class="rs-price">${money(l.item.price)}</div><p class="rs-fine">${esc(Object.values(l.item.options||{}).join(" · "))}${l.item.product.delivery==='digital'?' · PC digital delivery':''}</p>
      <form method="post" action="${base}/cart/update" class="rs-line-actions">
        <input type="hidden" name="sku" value="${esc(l.sku)}">
        <label>Qty: <select name="qty" aria-label="Quantity" onchange="this.form.submit()">${Array.from({ length: Math.min(MAX_QTY,l.item.stock??MAX_QTY) }, (_, i) => i + 1).map(n => `<option value="${n}" ${n === l.qty ? 'selected' : ''}>${n}</option>`).join('')}</select></label><noscript><button type="submit" name="action" value="update" class="rs-link-btn">Update</button></noscript>
        <span class="rs-stock">${esc(l.item.product.stock ?? 'In stock')}</span>
        <button type="submit" name="action" value="remove" class="rs-link-btn">Remove</button>
      </form>
    </div>
  </li>`).join('')
  return `${modal}
<div class="rs-cart">
  <div class="rs-cart-main"><h1>My Cart</h1><a class="rs-continue-shopping" href="${base}/merchandise">Continue shopping →</a>
    ${empty ? `<p class="rs-cart-empty">Your cart is empty</p><a class="rs-btn rs-btn-pill" href="${base}/merchandise">Explore Merchandise</a>` : `<ul class="rs-lines">${rows}</ul><p class="rs-subtotal">Subtotal (${t.count} item${t.count === 1 ? '' : 's'}): ${money(t.subtotal)}</p>`}
  </div>
  <aside class="rs-summary">
    <h2>Order Summary</h2>
    <div class="rs-row"><span>Total for Items</span><span>${money(t.subtotal)}</span></div>
    <div class="rs-row"><span>Subtotal (${t.count} item${t.count === 1 ? '' : 's'})</span><span>${empty ? '0.00' : money(t.subtotal)}</span></div>
    <p class="rs-fine">${t.digitalOnly ? 'PC digital delivery. No shipping required.' : !t.shippingEligible ? 'This order contains a collector box excluded from free shipping.' : empty ? `Get FREE shipping with orders over ${money(FREE_SHIPPING_OVER)}` : toFree > 0 ? `Add ${money(toFree)} to this order to qualify for FREE standard shipping.` : 'Your order qualifies for FREE standard shipping.'}</p>
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
  <p class="rs-fine"><a href="${base}/support?topic=Sign%20In">Forgot your password?</a> &nbsp;&middot;&nbsp; New here? <a href="${base}/signup${returnTo ? `?return=${encodeURIComponent(returnTo)}` : ''}">Create a Rockstar Games Account</a></p>
</div>`
}

export function signUpPage({ base, returnTo = '', values = {}, errors = {} }) {
  const f = (name, label, type = 'text', extra = '') => `<label for="${name}">${label}</label><input id="${name}" name="${name}" type="${type}" value="${esc(type==='password'?'':values[name] ?? '')}" ${extra}>${errors[name] ? `<span class="rs-error">${esc(errors[name])}</span>` : ''}`
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
  <div class="xs-footer"><p>Xsolla is an authorized video game software distributor providing clients with advanced technical tools for their games.</p><p>&copy; 2006-2026 Xsolla &nbsp;&middot;&nbsp; <span class="xs-secure">${ICON.lock} Secure Connection</span> &nbsp;&middot;&nbsp; <a href="/rockstar-store/support?topic=Privacy%20Policy">Privacy Policy</a> | <a href="/rockstar-store/support?topic=EULA">EULA</a> | <a href="/rockstar-store/support?topic=Refund%20Policy">Refund Policy</a> | <a href="/rockstar-store/support?topic=Legal%20Agreements">Legal Agreements</a></p></div>
</div></div>`
}

function addressBlock(a) {
  return `<address class="xs-address">${esc(a.first_name)} ${esc(a.last_name)}<br>${esc(a.line1)}${a.line2 ? `, ${esc(a.line2)}` : ''}<br>${esc(a.city)}, ${esc(a.state)} ${esc(a.postal_code)}<br>${esc(COUNTRIES.find(c => c[0] === a.country)?.[1] ?? a.country)}<br>${[a.phone, a.email].filter(Boolean).map(esc).join(' &middot; ')}</address>`
}

// "You cannot change your shipping address once you submit your pre-order." (GTA VI); the merchandise flow says "...your order."
const lockNote = (preorder) => `You cannot change your shipping address once you submit your ${preorder ? 'pre-order' : 'order'}.`
const FLAG_US = '<svg width="18" height="12" viewBox="0 0 18 12" aria-hidden="true"><rect width="18" height="12" fill="#fff"/><path d="M0 0h18v1.3H0zM0 2.7h18V4H0zM0 5.3h18v1.4H0zM0 8h18v1.3H0zM0 10.7h18V12H0z" fill="#b22234"/><rect width="8" height="6.5" fill="#3c3b6e"/></svg>'

export function shippingAddressStep({ base, values = {}, errors = {}, addresses = [], selectedAddress = '', preorder = true, closeHref }) {
  // Observed validation: every invalid field gets a red left bar, the first one is focused and only the focused field
  // shows the red "Required" tooltip (CSS :focus-within); Apartment gets a green check.
  const failed = Object.keys(errors).length > 0
  const firstInvalid = ['country', 'first_name', 'last_name', 'city', 'region', 'postal_code', 'street_address', 'phone', 'email'].find(k => errors[k])
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
  ${addresses.length?`<form method="get" action="${base}/checkout/shipping-address" class="rs-address-picker"><label for="saved-address">Saved address</label><select id="saved-address" name="address_id">${addresses.map(a=>`<option value="${a.id}" ${a.id===selectedAddress?'selected':''}>${esc(a.label||a.name)} · ${esc(a.line1)}${a.is_default?' (Default)':''}</option>`).join('')}</select><button type="submit" class="xs-btn xs-btn-sm">Use saved address</button><a href="${base}/account/addresses">Manage addresses</a></form>`:''}
  <div class="xs-info">${lockNote(preorder)}</div>
  <form method="post" action="${base}/checkout/shipping-address" class="xs-form xs-address-form" novalidate>
    <div class="xs-field xs-field-country ${state('country')}"><label for="country">Country</label><select class="xs-input xs-country" id="country" name="country" autocomplete="country" ${aria('country')}>${errors.country?'<option value="" selected>Choose a country</option>':''}${COUNTRIES.map(([c, n]) => `<option value="${c}" ${(values.country ?? 'US') === c ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select>${tip('country')}</div>
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

export function shippingMethodStep({ base, address, method = 'standard', subtotal, shippingEligible = true, error = null, preorder = true, closeHref, pickupOptions = null, pickup = {}, shippingAvailable = true, pickupAvailable = true }) {
  const pickupField = (key, label, type = 'text') => `<div class="xs-field"><label for="pickup_${key}">${label}</label><input class="xs-input" type="${type}" id="pickup_${key}" name="pickup_${key}" value="${esc(pickup.person?.[key] || '')}"></div>`
  const inner = `<h1 class="xs-title">Shipping Method</h1>
  <div class="xs-locked"><div class="xs-locked-head"><b>Shipping Address</b><span>${ICON.lock} Locked</span></div>${addressBlock(address)}<p class="xs-fine">${lockNote(preorder)}</p></div>
  ${!shippingAvailable ? '<p class="rs-error" role="alert">Shipping unavailable. Availability changed after this item was selected.</p>' : ''}
  <form method="post" action="${base}/checkout/shipping-method" class="xs-form" novalidate>
    ${Object.values(SHIPPING_METHODS).map(m => { const cost = shippingCost(m.id, subtotal, shippingEligible); return `<label class="xs-option"><input type="radio" name="shipping_method" value="${m.id}" ${method === m.id ? 'checked' : ''} ${shippingAvailable ? '' : 'disabled'}><span class="xs-option-body"><b>${esc(m.name)}</b><span class="xs-fine">${esc(deliveryEta(m.id,preorder))}</span></span><span class="xs-option-price">${cost ? money(cost) : 'FREE'}</span></label>` }).join('')}
    ${pickupOptions ? `<label class="xs-option"><input type="radio" name="shipping_method" value="pickup" ${method === 'pickup' ? 'checked' : ''} ${pickupAvailable ? '' : 'disabled'}><span class="xs-option-body"><b>Pickup</b><span class="xs-fine">Collect from the selected location with photo ID.</span></span><span class="xs-option-price">FREE</span></label>
    <fieldset class="xs-pickup-details"><legend>Pickup details</legend><div class="xs-field"><label for="pickup_store">Pickup location</label><select class="xs-input" id="pickup_store" name="pickup_store"><option value="">Choose a pickup location</option>${pickupOptions.map(p => `<option value="${esc(p.id)}" ${p.id === pickup.store_id ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}</select></div>
    <div class="xs-2col">${pickupField('first_name', 'Pickup first name')}${pickupField('last_name', 'Pickup last name')}</div>${pickupField('email', 'Pickup email', 'email')}${pickupField('phone', 'Pickup phone', 'tel')}</fieldset>` : ''}
    ${error ? `<span class="xs-tooltip" role="alert">${esc(error)}</span>` : ''}
    <div class="xs-actions"><button class="xs-btn" type="submit">CONTINUE</button></div>
  </form>${pickupOptions ? `<script>(function(){var f=document.querySelector('form[action$="/checkout/shipping-method"]');function update(){f.querySelector('.xs-pickup-details').hidden=f.querySelector('[name="shipping_method"]:checked')?.value!=='pickup'}f.querySelectorAll('[name="shipping_method"]').forEach(function(r){r.addEventListener('change',update)});update()})();</script>` : ''}`
  return checkoutShell({ closeHref, inner })
}

export function paymentStep({ base, t, address, method, values = {}, errors = {}, user = null, preorder = true, closeHref, reviewToken = '', reviewError = '', pickup = null }) {
  const pm = values.payment_method === 'paypal' ? 'paypal' : 'card'
  const m = SHIPPING_METHODS[method] || { name: method === 'pickup' ? 'Pickup' : 'Digital delivery' }
  const field = (name, label, extra = '', value = values[name] ?? '') => `<div class="xs-field ${errors[name] ? 'is-invalid' : ''}"><label for="${name}">${label}</label><input class="xs-input" id="${name}" name="${name}" type="text" value="${esc(value)}" ${extra} ${errors[name] ? `aria-invalid="true" aria-describedby="err-${name}"` : ''}>${errors[name] ? `<span class="xs-tooltip" id="err-${name}" role="alert">${esc(errors[name])}</span>` : ''}</div>`
  const inner = `<div class="xs-pay">
  <aside class="xs-order">
    <h2>Order information</h2>
    ${t.lines.map(l => `<div class="xs-order-item">${D.art(l.item)}<div><b>${esc(l.item.title)}</b><span class="xs-fine">Qty ${l.qty} ${esc(Object.values(l.item.options||{}).join(" · "))}${l.item.product.delivery==='digital'?' · PC digital':''}</span></div><span>${money(l.item.price * l.qty)}</span></div>`).join('')}
    <div class="xs-row"><span>Subtotal</span><span>${money(t.subtotal)}</span></div>
    <div class="xs-row"><span>${t.digitalOnly?'Digital delivery':method === 'pickup' ? 'Pickup' : `Shipping (${esc(m.name)})`}</span><span>${t.shipping ? money(t.shipping) : 'FREE'}</span></div>
    <div class="xs-row"><span>Tax</span><span>${money(t.tax)}</span></div>
    <div class="xs-row xs-total"><span>Total</span><span>${money(t.total)}</span></div>
    ${t.digitalOnly?`<p>PC digital delivery to <b>${esc(user?.email)}</b>. Rockstar Games Launcher access is bound to this account.</p>`:`<div class="xs-locked"><div class="xs-locked-head"><b>${method === 'pickup' ? 'Billing address' : 'Ship to'}</b><span>${ICON.lock} Locked</span></div>${addressBlock(address)}</div>`}
    ${method === 'pickup' && pickup ? `<div class="xs-pickup-review"><h3>Pickup at ${esc(pickup.store_name)}</h3><p>${esc(pickup.person.first_name)} ${esc(pickup.person.last_name)}<br>${esc(pickup.person.email)}<br>${esc(pickup.person.phone)}</p><a href="${base}/checkout/shipping-method">Change pickup details</a></div>` : ''}
  </aside>
  <form method="post" action="${base}/checkout/payment" class="xs-form xs-pay-form" novalidate>
    <input type="hidden" name="review_token" value="${esc(reviewToken)}">${reviewError?`<p role="alert" class="rs-error">${esc(reviewError)}</p>`:''}<h1 class="xs-title">Payment method</h1>
    <div class="xs-methods">
      <label class="xs-method"><input type="radio" name="payment_method" value="card" ${pm === 'card' ? 'checked' : ''}> <span>Payment via card</span><span class="xs-brands">Visa &middot; Mastercard &middot; Amex &middot; Discover</span></label>
      <label class="xs-method"><input type="radio" name="payment_method" value="paypal" ${pm === 'paypal' ? 'checked' : ''}> <span>PayPal</span></label>
    </div>
    <div class="xs-method-panel" data-panel="card">
      ${field('card_number', 'Card number', 'autocomplete="cc-number" inputmode="numeric"', '')}
      <div class="xs-2col">${field('expiry', 'MM/YY', 'autocomplete="cc-exp" placeholder="MM/YY"')}${field('cvc', 'CVC', 'autocomplete="cc-csc" inputmode="numeric" maxlength="4"', '')}</div>
      ${field('cardholder_name', 'Cardholder name', 'autocomplete="cc-name"')}
      <p class="xs-fine">Payment details are used for this order only.</p>
    </div>
    <div class="xs-method-panel" data-panel="paypal"><p class="xs-fine">Continue with PayPal for this local order. No external account is charged.</p></div>
    <div class="xs-actions"><button class="xs-btn xs-btn-pay" type="submit">Pay ${money(t.total)}</button></div>
    ${preorder ? '<p class="xs-fine">Your payment method will not be charged until the physical pre-order is ready to be shipped. You will receive a notification email about two weeks before your payment method is charged.</p>' : ''}
  </form></div>
<script>(function(){var f=document.querySelector('.xs-pay-form');function s(){var v=f.querySelector('input[name=payment_method]:checked').value;f.querySelectorAll('.xs-method-panel').forEach(function(p){p.hidden=p.dataset.panel!==v})}f.querySelectorAll('input[name=payment_method]').forEach(function(r){r.addEventListener('change',s)});s()})();</script>`
  return checkoutShell({ closeHref, wide: true, inner })
}

export function statusPage({ base, order }) {
  const a = order.shipping_address
  const m = order.fulfillment.method==='digital'?{name:'Digital delivery'}:order.fulfillment.method === 'pickup' ? { name: 'Pickup' } : SHIPPING_METHODS[order.fulfillment.option] ?? SHIPPING_METHODS.standard
  const preorder = order.meta.preorder !== false
  const status=orderStatus(order),cancelled=status==='cancelled'
  const inner = `<div class="xs-status">
  <div class="xs-status-icon" aria-hidden="true">${ICON.check}</div>
  <h1 class="xs-title">${cancelled?'Order cancelled':'Thank you for your purchase!'}</h1>
  <p>${cancelled?'Your order has been cancelled. No bank refund is confirmed.':`Your ${preorder ? 'pre-order' : 'order'} has been placed. Your receipt is saved here for`} ${cancelled?'':`<b>${esc(order.customer.email)}</b>.`}</p>
  <p class="xs-txn">Transaction ID: <b data-order-number>${esc(order.order_number)}</b></p>
  <div class="xs-receipt">
    ${order.items.map(it => `<div class="xs-row"><span>${esc(it.title)} &times; ${it.qty}${Object.values(order.meta.options?.find(v=>v.sku===it.sku)?.options||{}).length?` · ${esc(Object.values(order.meta.options.find(v=>v.sku===it.sku).options).join(" · "))}`:''}<small class="xs-fine">${esc(itemDelivery(order,it))}</small></span><span>${money(it.unit_price * it.qty)}</span></div>`).join('')}
    <div class="xs-row"><span>${order.fulfillment.method==='digital'?'Digital delivery':order.fulfillment.method === 'pickup' ? 'Pickup' : `Shipping (${esc(m.name)})`}</span><span>${order.totals.shipping ? money(order.totals.shipping) : 'FREE'}</span></div>
    <div class="xs-row"><span>Tax</span><span>${money(order.totals.tax)}</span></div>
    <div class="xs-row xs-total"><span>Total</span><span>${money(order.totals.total)}</span></div>
    <div class="xs-row"><span>Payment</span><span>${order.payment.method === 'card' ? `${esc(order.payment.brand)} ending in ${esc(order.payment.last4)}` : 'PayPal'}</span></div>
  </div>
  ${order.fulfillment.method==='digital'?`<p>PC digital delivery · ${cancelled?'Cancelled · access unavailable':'Assigned'} to ${esc(order.customer.email)}</p><a href="${base}/library">Open PC library</a>`:order.fulfillment.method === 'pickup' ? `<div class="xs-pickup-review"><h3>Pickup at ${esc(order.fulfillment.store_location)}</h3><p>${esc(order.meta.pickup_person.first_name)} ${esc(order.meta.pickup_person.last_name)}<br>${esc(order.meta.pickup_person.email)}<br>${esc(order.meta.pickup_person.phone)}</p></div>`:`<div class="xs-locked"><div class="xs-locked-head"><b>Ship to</b></div>${addressBlock({ ...a, email: order.customer.email })}</div>`}
  <p class="xs-fine">${cancelled?'This order will not dispatch. Its original receipt totals remain for your records.':order.fulfillment.method==='digital'?'Your purchase is recorded in your PC library. No physical shipment is required.':order.fulfillment.method === 'pickup' ? 'Bring photo ID matching the named pickup person when the order is ready for collection.' : 'Your order has not dispatched. Tracking becomes available after shipment. No confirmation or tracking email is sent by this local store.'}</p>
  <p><a href="${base}/orders/${order.id}">Order details and support</a></p><div class="xs-actions xs-actions-center"><a class="xs-btn" href="${base}/">Back to Store</a></div>
</div>`
  return checkoutShell({ closeHref: `${base}/`, inner })
}

// Placeholder covers for the other games (no real artwork): the title on a colored gradient, tile-shaped (208x257).
const COVER_COLORS = { 'gta-v': ['#0f3d2e', '#3fa66b'], 'red-dead-redemption-2': ['#3a0b0b', '#c0392b'], 'red-dead-redemption': ['#3b2208', '#d98c2b'], 'bully-scholarship-edition': ['#0b2340', '#3d7bd9'], 'gta-plus': ['#3a0f33', '#e0529c'] }
export function coverSvg(p) {
  if (p.shape) return D.merchSvg(p)
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
