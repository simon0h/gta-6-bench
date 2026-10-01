import { esc, money, disclaimer } from '../../lib/html.js'
import { productPath, signinPath, byAsin, games, STATES, DELIVERY, SORTS, DEPARTMENTS, CART_RECS } from './data.js'
import { GAME } from '../../lib/catalog.js'

const NAME = 'Amazon'
const NAV = ['Early Prime Deals', 'Groceries', 'Prime', 'Coupons', 'Pharmacy', 'Amazon Home', 'Automotive', 'Music', 'Registry', 'Whole Foods', 'Audible', 'Video Games', 'New Releases', 'Baby', 'Fashion', 'Smart Home', 'Sports & Outdoors', 'Toys & Games', 'Custom Products', 'Works with Alexa', 'Gift Shop', 'Subscribe & Save', 'Best Sellers', 'Amazon Haul', 'Kindle Books', 'Books', 'Luxury', 'TV & Video', 'Handmade', 'Gift Cards']
const SUBNAV = ['PS5', 'Xbox Series X|S', 'Switch', 'Nex Playground', 'PS4', 'PC', 'Arcade Gaming', 'Accessories', 'VR', 'Trade-In', 'Deals', 'Best Sellers', 'New Releases', 'Digital Games']

const plural = (n, word = 'item') => `${n} ${word}${n === 1 ? '' : 's'}`

// Amazon renders "$79.99" as "$79" with superscript cents; the plain string stays for screen readers.
function price(n, cls = 'az-price') {
  const [d, c] = money(n).slice(1).split('.')
  return `<span class="${cls}"><span class="a-offscreen">${money(n)}</span><span aria-hidden="true"><span class="az-price-sym">$</span>${d}<sup>${c}</sup></span></span>`
}

function logo() {
  return `<span class="az-logo-word">amazon</span><svg class="az-smile" viewBox="0 0 60 16" width="60" height="16" aria-hidden="true"><path d="M3 4c14 12 36 12 52 2" fill="none" stroke="#FF9900" stroke-width="3" stroke-linecap="round"/><path d="M49 2l7 3-3 6" fill="none" stroke="#FF9900" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`
}

// Outline cart icon (white in the header belt, dark in the right-rail panel).
function cartSvg(color = '#fff') {
  return `<svg class="az-cart-svg" viewBox="0 0 38 28" width="38" height="28" aria-hidden="true"><path d="M1 3h6l5 15h19l4-11H10" fill="none" stroke="${color}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/><circle cx="14" cy="24" r="2.4" fill="${color}"/><circle cx="28" cy="24" r="2.4" fill="${color}"/></svg>`
}

function stars(r) {
  if (!r) return ''
  const full = Math.round(r.stars)
  return `<div class="az-stars"><span class="az-star-icons" aria-hidden="true">${'★'.repeat(full)}${'☆'.repeat(5 - full)}</span> <span class="a-offscreen">${esc(r.stars)} out of 5 stars</span><a href="#" class="az-review-count">${esc(r.count)}</a></div>`
}

const TRASH = `<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M3 4h10M6.5 4V2.5h3V4M4.5 4l.7 9.5h5.6l.7-9.5" fill="none" stroke="#0F1111" stroke-width="1.5" stroke-linejoin="round"/></svg>`

// Quantity stepper of the cart and the right-rail panel (research: trash icon at 1, "-" above 1, "+"; max 5).
function stepper(base, l, ret) {
  const atOne = l.qty <= 1
  return `<form method="post" action="${base}/cart/update" class="az-stepper">
    <input type="hidden" name="asin" value="${esc(l.asin)}"><input type="hidden" name="ret" value="${esc(ret)}">
    <button type="submit" name="action" value="${atOne ? 'delete' : 'dec'}" aria-label="${atOne ? `Delete ${esc(l.product.title)}` : 'Decrease quantity by one'}">${atOne ? TRASH : '&minus;'}</button>
    <span class="az-stepper-qty" aria-label="Quantity is ${l.qty}">${l.qty}</span>
    <button type="submit" name="action" value="inc" aria-label="Increase quantity by one"${l.qty >= 5 ? ' disabled' : ''}>+</button>
  </form>`
}

// Amazon's fixed right-rail "everywhere cart" on search and product pages (research, verified live): "N item(s)",
// Subtotal, the FREE-delivery note, a white "Go to Cart" pill and the items with a quantity stepper.
// ASSUMPTION: right after an add, the panel also shows "Added to cart" and a yellow "Proceed to checkout" (the
// research's first-pass "Added to cart" confirmation); on later page views it offers only "Go to Cart".
function ewcPanel(base, ewc) {
  const count = ewc.lines.reduce((n, l) => n + l.qty, 0)
  if (!count) return `<aside class="az-ewc az-ewc-empty" aria-label="Cart, 0 items">${cartSvg('#0F1111')}<span class="az-ewc-count">0</span></aside>`
  const subtotal = ewc.lines.reduce((n, l) => n + l.qty * l.product.price, 0)
  return `<aside class="az-ewc" aria-label="Cart, ${plural(count)}">
  ${ewc.added ? `<div class="az-ewc-added" role="status">&#10004; Added to cart</div>` : ''}
  <div class="az-ewc-count">${plural(count)}</div>
  <div class="az-ewc-sub">Subtotal</div>
  <div class="az-ewc-price">${money(subtotal)}</div>
  <p class="az-ewc-free">Your order qualifies for FREE delivery. Choose this option at checkout.</p>
  ${ewc.added ? `<a class="az-btn az-btn-block" href="${base}/gp/cart/desktop/go-to-checkout.html?ref_=ewc_ptc">Proceed to checkout (${plural(count)})</a>` : ''}
  <a class="az-btn az-btn-outline az-btn-block" href="${base}/cart?ref_=ox_ewc_ret_gtc_dsk_us">Go to Cart</a>
  <ul class="az-ewc-items">${ewc.lines.map(l => `<li><a href="${productPath(base, l.product)}"><img src="${l.product.art}" alt="${esc(l.product.title)}"></a><div class="az-ewc-item-price">${money(l.product.price)}</div>${stepper(base, l, ewc.ret)}</li>`).join('')}</ul>
</aside>`
}

export function layout({ base, title, body, cartCount = 0, user = null, chrome = 'full', ewc = null, subnav = false, q = '', checkoutCount = 0, here = '/' }) {
  // The `js` class hides the no-JS fallback buttons ("Go", "Update") only when scripts actually run.
  const head = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<script>document.documentElement.classList.add('js')</script>
<link rel="stylesheet" href="${base}/static/style.css"></head>`
  if (chrome === 'auth') {
    return `${head}
<body class="az-body-auth">
<div class="az-auth-wrap"><a class="az-logo az-logo-dark" href="${base}/" aria-label="Amazon home">${logo()}</a>${body}</div>
<footer class="az-auth-footer"><nav><a href="#">Conditions of Use</a><a href="#">Privacy Notice</a><a href="#">Help</a></nav><p>&copy; 1996-2026, Amazon.com, Inc. or its affiliates</p>${disclaimer(NAME)}</footer>
</body></html>`
  }
  if (chrome === 'checkout') {
    return `${head}
<body class="az-body-checkout">
<header class="az-co-header"><a class="az-logo az-logo-dark" href="${base}/" aria-label="Amazon home">${logo()}</a><span class="az-co-title">Checkout (${plural(checkoutCount)})</span><span class="az-lock" role="img" aria-label="Secure checkout"><svg viewBox="0 0 16 20" width="16" height="20" aria-hidden="true"><rect x="1" y="8" width="14" height="11" rx="2" fill="#8C9091"/><path d="M4 8V5.5a4 4 0 0 1 8 0V8" fill="none" stroke="#8C9091" stroke-width="2"/></svg></span></header>
<main class="az-co-main">${body}</main>
<footer class="az-co-footer"><nav><a href="#">Conditions of Use</a><a href="#">Privacy Notice</a><a href="#">Help</a></nav><p>&copy; 1996-2026, Amazon.com, Inc. or its affiliates</p>${disclaimer(NAME)}</footer>
</body></html>`
  }
  return `${head}
<body class="${ewc ? 'az-has-ewc' : ''}">
<a id="top"></a>
<header class="az-header">
  <div class="az-belt">
    <a class="az-logo" href="${base}/" aria-label="Amazon home">${logo()}</a>
    <a class="az-nav-item az-deliver" href="#"><span class="az-nav-line1">${user ? `Deliver to ${esc(user.first_name || 'you')}` : 'Delivering to San Jose 95112'}</span><span class="az-nav-line2">&#128205; ${user ? 'San Jose 95112' : 'Update location'}</span></a>
    <form class="az-search" action="${base}/s" method="get" role="search">
      <label for="searchDropdownBox" class="a-offscreen">Search in</label>
      <select id="searchDropdownBox" name="i" class="az-search-dept">${DEPARTMENTS.map(([v, l]) => `<option value="${v}">${esc(l)}</option>`).join('')}</select>
      <label for="twotabsearchtextbox" class="a-offscreen">Search Amazon</label>
      <input id="twotabsearchtextbox" type="text" name="k" placeholder="Search Amazon" value="${esc(q)}" autocomplete="off">
      <button type="submit" class="az-search-go" aria-label="Go"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><circle cx="10" cy="10" r="6.5" fill="none" stroke="#0F1111" stroke-width="2.4"/><path d="M15 15l6 6" stroke="#0F1111" stroke-width="2.6" stroke-linecap="round"/></svg></button>
    </form>
    <a class="az-nav-item az-lang" href="#"><span class="az-flag" aria-hidden="true"></span><span class="az-nav-line2">EN &#9662;</span></a>
    <a class="az-nav-item" href="${user ? `${base}/gp/css/order-history` : esc(base + signinPath(here))}"><span class="az-nav-line1">Hello, ${user ? esc(user.first_name || 'there') : 'sign in'}</span><span class="az-nav-line2">Account &amp; Lists &#9662;</span></a>
    <a class="az-nav-item az-nav-orders" href="${base}/gp/css/order-history"><span class="az-nav-line1">Returns</span><span class="az-nav-line2">&amp; Orders</span></a>
    <a class="az-nav-cart" href="${base}/cart?ref_=nav_cart" aria-label="${plural(cartCount)} in cart"><span class="az-cart-count">${cartCount}</span>${cartSvg()}<span class="az-nav-line2">Cart</span></a>
  </div>
  <nav class="az-nav-main" aria-label="Shop by department"><a class="az-nav-all" href="#">&#9776; All</a>${NAV.map(n => `<a href="${base}/s?k=${encodeURIComponent(n)}">${esc(n)}</a>`).join('')}<a class="az-nav-promo" href="#">Prime Big Deal Days is October 6-7</a></nav>
  ${subnav ? `<nav class="az-subnav" aria-label="Video Games"><a class="az-subnav-title" href="${base}/s?k=Video+Games">Video Games</a>${SUBNAV.map(n => `<a href="${base}/s?k=${encodeURIComponent(n)}">${esc(n)}</a>`).join('')}</nav>` : ''}
</header>
${ewc ? ewcPanel(base, ewc) : ''}
<main class="az-main">${body}</main>
<footer class="az-footer">
  <a class="az-back-top" href="#top">Back to top</a>
  <div class="az-footer-cols">
    <div><h4>Get to Know Us</h4><a href="#">Careers</a><a href="#">Amazon Newsletter</a><a href="#">About Amazon</a><a href="#">Accessibility</a><a href="#">Sustainability</a><a href="#">Press Center</a><a href="#">Investor Relations</a><a href="#">Amazon Devices</a><a href="#">Amazon Science</a></div>
    <div><h4>Make Money with Us</h4><a href="#">Sell on Amazon</a><a href="#">Sell apps on Amazon</a><a href="#">Supply to Amazon</a><a href="#">Protect &amp; Build Your Brand</a><a href="#">Become an Affiliate</a><a href="#">Become a Delivery Driver</a><a href="#">Start a Package Delivery Business</a><a href="#">Advertise Your Products</a><a href="#">Self-Publish with Us</a><a href="#">Host an Amazon Hub</a></div>
    <div><h4>Amazon Payment Products</h4><a href="#">Amazon Visa</a><a href="#">Amazon Store Card</a><a href="#">Amazon Secured Card</a><a href="#">Amazon Business Card</a><a href="#">Shop with Points</a><a href="#">Credit Card Marketplace</a><a href="#">Reload Your Balance</a><a href="#">Gift Cards</a><a href="#">Amazon Currency Converter</a></div>
    <div><h4>Let Us Help You</h4><a href="${base}/gp/css/order-history">Your Account</a><a href="${base}/gp/css/order-history">Your Orders</a><a href="#">Shipping Rates &amp; Policies</a><a href="#">Amazon Prime</a><a href="#">Returns &amp; Replacements</a><a href="#">Manage Your Content and Devices</a><a href="#">Recalls and Product Safety Alerts</a><a href="#">Registry &amp; Gift List</a><a href="#">Help</a></div>
  </div>
  <div class="az-footer-mid"><a class="az-logo" href="${base}/" aria-label="Amazon home">${logo()}</a><span class="az-footer-select">&#127760; English</span><span class="az-footer-select">$ USD - U.S. Dollar</span><span class="az-footer-select">United States</span></div>
  <div class="az-footer-legal"><nav><a href="#">Conditions of Use</a><a href="#">Privacy Notice</a><a href="#">Consumer Health Data Privacy Disclosure</a><a href="#">Your Ads Privacy Choices</a></nav><p>&copy; 1996-2026, Amazon.com, Inc. or its affiliates</p>${disclaimer(NAME)}</div>
</footer>
</body></html>`
}

// ---------------------------------------------------------------- home
export function homePage({ base }) {
  const [ps5] = games()
  const card = (title, img, text, href, cta) => `<div class="az-card"><h2>${esc(title)}</h2><a href="${href}"><img src="${img}" alt=""></a><p>${esc(text)}</p><a class="az-card-link" href="${href}">${esc(cta)}</a></div>`
  return `<div class="az-home">
  <div class="az-hero"><div><p class="az-hero-kicker">Pre-order now &middot; Delivers 11/12/26 &middot; Playable 11/19/26</p><h1>Grand Theft Auto VI</h1><p>Code in Box for PlayStation 5 and Xbox Series X|S. Pre-order Price Guarantee. Pre-order to receive the Vintage Vice City Pack.</p><a class="az-btn az-btn-orange" href="${productPath(base, ps5)}">Shop Grand Theft Auto VI</a></div><img src="${ps5.art}" alt="Grand Theft Auto VI cover art"></div>
  <div class="az-card-grid">
    ${card('Pre-order Grand Theft Auto VI', ps5.art, 'Delivers 11/12/26, playable 11/19/26. Pre-order Price Guarantee.', `${base}/s?k=grand+theft+auto+vi`, 'Shop now')}
    ${card('Gaming accessories', '/static/art/accessory.svg', 'Controllers, headsets, charging stations and more.', `${base}/s?k=controller`, 'Shop accessories')}
    ${card('Top deals in Video Games', '/static/art/game-generic.svg', 'Save on PS5, Xbox and Switch games.', `${base}/s?k=grand+theft+auto`, 'See all deals')}
    <div class="az-card az-card-signin"><h2>Sign in for the best experience</h2><a class="az-btn az-btn-block" href="${esc(base + signinPath('/'))}">Sign in securely</a></div>
    ${card('Music: CDs & Vinyl', '/static/art/vinyl.svg', 'New releases and pre-orders on vinyl.', `${base}/s?k=grand+theft+auto+vi+album`, 'Shop music')}
    ${card('Shop Video Games', ps5.art, 'PS5, Xbox Series X|S, Nintendo Switch, PC and more.', `${base}/s?k=video+games`, 'Shop now')}
  </div>
</div>`
}

// ---------------------------------------------------------------- search
function addToCartForm(base, p, ret, inCart) {
  return `<form method="post" action="${base}/cart/add" class="az-atc"><input type="hidden" name="asin" value="${esc(p.asin)}"><input type="hidden" name="quantity" value="1"><input type="hidden" name="ret" value="${esc(ret)}"><button class="az-btn az-btn-sm" type="submit" name="submit.addToCart" value="1">Add to cart</button>${inCart ? `<span class="az-in-cart">${inCart} in cart</span>` : ''}</form>`
}

function gameTile(base, list, ret, inCart) {
  const first = list[0]
  return `<div class="az-result az-result-game" data-asin="${esc(first.asin)}">
  <a class="az-result-img" href="${productPath(base, first)}"><img src="${first.art}" alt="${esc(first.title)}"></a>
  <div class="az-result-body">
    <h2 class="az-result-title"><a href="${productPath(base, first)}">${esc(first.title)}</a></h2>
    <div class="az-result-meta">ESRB Rating: ${esc(first.esrb)} | Nov 12, 2026 | by ${esc(first.brand)}</div>
    <div class="az-variants">${list.map(g => `<div class="az-variant">
      <a class="az-variant-name" href="${productPath(base, g)}">${esc(g.swatchLabel)}</a>
      <div class="az-bought">${esc(g.bought)}</div>
      ${price(g.price, 'az-price az-price-lg')}
      <div class="az-fine">${esc(g.priceNote)}</div>
      <div class="az-delivery">${esc(g.delivery[0])}</div><div class="az-delivery">${esc(g.delivery[1])}</div>
      <div class="az-avail">${esc(g.availability)}</div>
      ${addToCartForm(base, g, ret, inCart[g.asin])}
    </div>`).join('')}</div>
  </div>
</div>`
}

function tile(base, p, ret, inCart) {
  return `<div class="az-result" data-asin="${esc(p.asin)}">
  <a class="az-result-img" href="${productPath(base, p)}"><img src="${p.art}" alt="${esc(p.title)}"></a>
  <div class="az-result-body">
    ${p.sponsored ? `<div class="az-sponsored">Sponsored <span aria-hidden="true">&#9432;</span></div>` : ''}
    ${p.badge ? `<span class="az-badge-best">${esc(p.badge)}</span>` : ''}
    <h2 class="az-result-title"><a href="${productPath(base, p)}">${esc(p.title)}</a></h2>
    <div class="az-result-meta">${p.esrb ? `ESRB Rating: ${esc(p.esrb)} | ` : ''}${p.release ? `${esc(p.release)} | ` : ''}by ${esc(p.brand)}</div>
    ${stars(p.rating)}
    ${p.bought ? `<div class="az-bought">${esc(p.bought)}</div>` : ''}
    ${p.formatsLine ? `<div class="az-fine">${esc(p.formatsLine)}</div>` : `<div class="az-fine">${esc(p.typeLabel)}${p.platformLabel ? ` &middot; ${esc(p.platformLabel)}` : ''}</div>`}
    ${price(p.price, 'az-price az-price-lg')}
    ${p.priceNote ? `<div class="az-fine">${esc(p.priceNote)}</div>` : `<div class="az-fine">Join Prime to get FREE delivery ${esc(p.delivery[1].replace('Or fastest delivery ', ''))}</div>`}
    <div class="az-delivery">${esc(p.delivery[0])}</div><div class="az-delivery">${esc(p.delivery[1])}</div>
    <div class="az-avail">${esc(p.availability)}</div>
    ${p.condition ? '' : `<div class="az-fine">More Buying Choices <a href="#">${money(Math.round(p.price * 0.9 * 100) / 100)} (4 new offers)</a></div>`}
    ${addToCartForm(base, p, ret, inCart[p.asin])}
  </div>
</div>`
}

export function searchPage({ base, q, dept = '', sort = '', results, inCart = {} }) {
  const ret = `/s?k=${encodeURIComponent(q).replaceAll('%20', '+')}${dept ? `&i=${encodeURIComponent(dept)}` : ''}${sort ? `&s=${encodeURIComponent(sort)}` : ''}`
  const gameList = results.filter(p => p.kind === 'game')
  const tiles = []
  let gameDone = false
  for (const p of results) {
    if (p.kind === 'game') { if (!gameDone) { tiles.push(gameTile(base, gameList, ret, inCart)); gameDone = true } }
    else tiles.push(tile(base, p, ret, inCart))
  }
  const facets = `<aside class="az-facets" aria-label="Filters">
  <div class="az-facet"><h3>Eligible for Free Shipping</h3><label><input type="checkbox"> Free Shipping by Amazon</label></div>
  <div class="az-facet"><h3>Delivery Day</h3><label><input type="checkbox"> Get It by Tomorrow</label></div>
  <div class="az-facet"><h3>Condition</h3><a href="#">New</a><a href="#">Used</a></div>
  <div class="az-facet"><h3>Customer Reviews</h3><a href="#"><span aria-hidden="true">★★★★☆</span> &amp; Up</a></div>
  <div class="az-facet"><h3>Price</h3><a href="#">$10 - $275+</a><a href="#">Under $25</a><a href="#">$25 to $50</a><a href="#">$50 to $100</a></div>
  <div class="az-facet"><h3>Deals &amp; Discounts</h3><a href="#">All Discounts</a><a href="#">Today's Deals</a></div>
  <div class="az-facet"><h3>Brands</h3><label><input type="checkbox"> Rockstar Games</label><label><input type="checkbox"> Nintendo</label><label><input type="checkbox"> 2K</label></div>
  <div class="az-facet"><h3>Seller</h3><label><input type="checkbox"> Amazon.com</label></div>
  <div class="az-facet"><h3>Video Game Digital Download</h3><a href="#">Digital Download</a><a href="#">Physical Copy</a></div>
  <div class="az-facet"><h3>Video Game Genre</h3><a href="#">Action</a><a href="#">Adventure</a><a href="#">Racing</a></div>
  <div class="az-facet"><h3>ESRB Rating</h3><a href="#">Rating Pending</a><a href="#">Mature</a><a href="#">Teen</a></div>
  <div class="az-facet"><h3>Department</h3><a href="${base}/s?k=${encodeURIComponent(q)}&i=videogames">Video Games</a><a href="#">PlayStation 5 Games</a><a href="#">Xbox Series X &amp; S Games</a><a href="${base}/s?k=${encodeURIComponent(q)}&i=music">CDs &amp; Vinyl</a></div>
  </aside>`
  if (!results.length) {
    return `<div class="az-search-page"><div class="az-results-head"><h1 class="az-no-results">No results for <span class="az-q">${esc(q)}</span>.</h1><p>Try checking your spelling or use more general terms</p></div></div>`
  }
  return `<div class="az-search-page">
  <div class="az-results-head">
    <h1 class="az-results-count">1-${tiles.length} of ${tiles.length} ${tiles.length === 1 ? 'result' : 'results'} for <span class="az-q">"${esc(q)}"</span></h1>
    <form class="az-sort" action="${base}/s" method="get"><input type="hidden" name="k" value="${esc(q)}">${dept ? `<input type="hidden" name="i" value="${esc(dept)}">` : ''}<label for="s-result-sort-select">Sort by:</label><select id="s-result-sort-select" name="s" onchange="this.form.submit()">${SORTS.map(([v, l]) => `<option value="${v}" ${sort === v ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select><button type="submit" class="az-link-btn az-nojs">Go</button></form>
  </div>
  <div class="az-search-body">${facets}
  <div class="az-results">
    <p class="az-results-note">Check each product page for other buying options.</p>
    <h2 class="az-results-label">Results</h2>
    ${tiles.join('')}
    <nav class="az-pagination" aria-label="Pagination"><span class="az-page-disabled">&#8249; Previous</span><span class="az-page-current">1</span><a href="#">2</a><a href="#">3</a><span>&hellip;</span><a href="#">20</a><a href="#">Next &#8250;</a></nav>
  </div></div>
</div>`
}

// ---------------------------------------------------------------- product page
export function productPage({ base, p, inCart = {}, listAdded = false, bundle = [] }) {
  const isGame = p.kind === 'game'
  const preorder = !!p.release
  const pdp = productPath(base, p)
  const ret = pdp.slice(base.length)
  const crumbs = p.crumbs.map((c, i) => `<a href="${i === 0 ? `${base}/s?k=Video+Games` : `${base}/s?k=${encodeURIComponent(c)}`}">${esc(c)}</a>`).join(' &rsaquo; ')
  const buyForm = preorder
    ? `<form id="addToCart" method="post" action="${base}/gp/product/handle-buy-box">
      <input type="hidden" name="ASIN" value="${esc(p.asin)}">
      <div class="az-qty"><label for="quantity">Quantity:</label><select id="quantity" name="quantity">${[1, 2, 3, 4, 5].map(n => `<option value="${n}">${n}</option>`).join('')}</select></div>
      <button class="az-btn az-btn-orange az-btn-block" type="submit" id="buy-now-button" name="submit.buy-now" value="1" title="Buy Now" aria-labelledby="submit.buy-now-announce"><span id="submit.buy-now-announce">Pre-order now</span></button>
    </form>
    <p class="az-fine az-charge-note">Pre-order Price Guarantee. You're not charged until your order enters the shipping process.</p>`
    : `<form id="addToCart" method="post" action="${base}/gp/product/handle-buy-box">
      <input type="hidden" name="ASIN" value="${esc(p.asin)}"><input type="hidden" name="ret" value="${esc(ret)}">
      <div class="az-qty"><label for="quantity">Quantity:</label><select id="quantity" name="quantity">${[1, 2, 3, 4, 5].map(n => `<option value="${n}">${n}</option>`).join('')}</select></div>
      <button class="az-btn az-btn-block" type="submit" id="add-to-cart-button" name="submit.add-to-cart" value="1">Add to Cart</button>
      <button class="az-btn az-btn-orange az-btn-block" type="submit" id="buy-now-button" name="submit.buy-now" value="1" title="Buy Now">Buy Now</button>
    </form>`
  const bundleItems = [p, ...bundle]
  return `<nav class="az-crumbs" aria-label="Breadcrumb">${crumbs}</nav>
<div class="az-sponsored-strip"><span class="az-sponsored">Sponsored</span> Amazon Visa: Get $50 off instantly upon approval. <a href="#">Learn more</a></div>
${listAdded ? `<div class="az-notice" role="status">&#10004; 1 item added to Your List</div>` : ''}
<div class="az-pdp">
  <div class="az-gallery">
    <ul class="az-thumbs">${Array.from({ length: 5 }, () => `<li><img src="${p.art}" alt=""></li>`).join('')}</ul>
    <figure><img class="az-hero-img" src="${p.art}" alt="${esc(p.title)}"><figcaption>Click to see full view</figcaption></figure>
  </div>
  <div class="az-center">
    <h1 class="az-title" id="productTitle">${esc(p.title)}</h1>
    <a class="az-brand-link" href="${base}/s?k=${encodeURIComponent(p.brand)}">Visit the ${esc(p.brand)} Store</a>
    ${p.platformLabel ? `<div class="az-meta">Platform : ${esc(p.platformLabel)}${p.esrb ? ` | Rated: ${esc(p.esrb)}` : ''}</div>` : ''}
    ${stars(p.rating)}
    ${p.bought ? `<div class="az-bought">${esc(p.bought)}</div>` : ''}
    <div class="az-price-block">${price(p.price, 'az-price az-price-xl')}</div>
    <div class="az-visa-line">Get $50 off instantly: Pay ${money(Math.max(0, Math.round((p.price - 50) * 100) / 100))} upon approval for Amazon Visa.</div>
    <details class="az-returns"><summary>FREE Returns</summary><ul><li><b>Quick refund</b> — Usually issued within 24 hours.</li><li><b>FREE return</b> — At least one free return option available.</li><li><b>Convenient dropoff</b> — At any of our 50,000 US locations.</li></ul><a href="#">See return policy</a></details>
    ${p.priceNote ? `<div class="az-savings"><span class="az-savings-tag">Savings</span> ${esc(p.priceNote)} <a href="#">Terms</a></div>` : ''}
    ${isGame ? `<div class="az-swatches"><div class="az-swatch-label">Platform For Display: <b>${esc(p.swatchLabel)}</b></div>
      ${games().slice().reverse().map(g => `<a class="az-swatch ${g.asin === p.asin ? 'is-selected' : ''}" href="${productPath(base, g)}?th=1" aria-current="${g.asin === p.asin ? 'true' : 'false'}">${esc(g.swatchLabel)}</a>`).join('')}
    </div>
    <div class="az-swatches"><div class="az-swatch-label">Edition: <b>Standard</b></div><a class="az-swatch is-selected" href="${pdp}" aria-current="true">Standard</a></div>` : ''}
    <h2 class="az-h2">About this item</h2>
    <ul class="az-about">${p.about.map(a => `<li>${esc(a)}</li>`).join('')}</ul>
    <a class="az-fine-link" href="#">Report an issue with this product or seller</a>
  </div>
  <div class="az-buybox">
    ${price(p.price, 'az-price az-price-lg')}
    <details class="az-price-details"><summary>Details</summary><p class="az-fine">Shipping cost, delivery date, and order total (including tax) shown at checkout.</p></details>
    ${preorder ? `<div class="az-bb-delivery"><b>${esc(DELIVERY.standard.name)} ${esc(DELIVERY.standard.date)}</b></div>
    <div class="az-bb-delivery">Or fastest Release Day delivery <b>${esc(DELIVERY['release-date'].date)}</b></div>`
      : `<div class="az-bb-delivery"><b>${esc(p.delivery[0])}</b></div><div class="az-bb-delivery">${esc(p.delivery[1])}</div>`}
    <div class="az-bb-location">&#128205; Delivering to San Jose 95112 - <a href="#">Update location</a></div>
    <div class="az-avail az-avail-lg">${esc(p.availability)}</div>
    ${preorder ? `<div class="az-avail az-avail-lg">Pre-order now.</div>` : ''}
    ${buyForm}
    <table class="az-bb-table"><tr><th>Shipper / Seller</th><td>Amazon.com</td></tr><tr><th>Returns</th><td>${p.platform === 'xbox' ? '30-day refund / replacement' : 'FREE 30-day refund/replacement'}</td></tr><tr><th>Payment</th><td>Secure transaction</td></tr></table>
    <a class="az-fine-link" href="#">See more</a>
    <a class="az-btn az-btn-outline az-btn-green az-btn-block" href="${base}/tradein">Trade-In and save</a>
    <form method="post" action="${base}/hz/wishlist/add"><input type="hidden" name="asin" value="${esc(p.asin)}"><button class="az-btn az-btn-outline az-btn-block" type="submit">Add to List</button></form>
  </div>
</div>
${bundle.length ? `<section class="az-fbt"><h2 class="az-h2">Frequently bought together</h2>
  <div class="az-fbt-row">${bundleItems.map((b, i) => `${i ? '<span class="az-fbt-plus">+</span>' : ''}<a href="${productPath(base, b)}"><img src="${b.art}" alt="${esc(b.title)}"></a>`).join('')}
    <form method="post" action="${base}/cart/add" class="az-fbt-form">${bundleItems.map(b => `<input type="hidden" name="asin" value="${esc(b.asin)}">`).join('')}<input type="hidden" name="ret" value="${esc(ret)}"><p class="az-fine">To see our price, add these items to your cart.</p><button class="az-btn" type="submit">Add all 3 to Cart</button></form>
  </div>
  <ul class="az-fbt-list">${bundleItems.map((b, i) => `<li><label><input type="checkbox" checked> ${i === 0 ? '<b>This item:</b> ' : ''}${esc(b.title)}</label></li>`).join('')}</ul>
  <p class="az-fine">Some of these items ship sooner than the others. <a href="#">Show details</a></p>
</section>` : ''}
<section class="az-carousel"><h2 class="az-h2">Customers who bought this item also bought</h2><div class="az-carousel-row">
  <div><b>Call of Duty: Modern Warfare 4 - PlayStation 5</b><span>$69.00</span></div>
  <div><span class="az-badge-choice">Amazon's Choice</span><b>Marvel's Wolverine - PlayStation 5</b><span>$69.00</span></div>
  <div><span class="az-badge-best">#1 Best Seller</span><b>The Legend of Zelda: Ocarina of Time</b><span>$69.99</span></div>
  <div><a href="${base}/Grand-Theft-Auto-V-PlayStation-5/dp/B0BGTAV5P5"><b>Grand Theft Auto V - PlayStation 5</b></a><span>$24.34</span></div>
  <div><b>EA SPORTS FC 27 - PlayStation 5</b><span>$69.00</span></div>
  <div><b>SILENT HILL: townfall - PlayStation 5</b><span>$49.94</span></div>
</div></section>
<section class="az-carousel"><h2 class="az-h2">Products related to this item <span class="az-sponsored">Sponsored</span></h2><div class="az-carousel-row">
  <div><b>PS5 Controller Charging Station</b><span>$19.99</span></div><div><b>Gaming Headset with Noise Cancelling Mic</b><span>$34.99</span></div><div><b>PS5 Vertical Stand with Cooling Fan</b><span>$37.04</span></div><div><b>Joystick Grip Caps (4 Pack)</b><span>$9.99</span></div>
</div></section>
<section class="az-prodinfo"><h2 class="az-h2">Product information</h2>
  <table class="az-info-table">
    <tr><th>ASIN</th><td>${esc(p.asin)}</td></tr>
    ${p.release ? `<tr><th>Release date</th><td>${esc(p.release)}</td></tr>` : ''}
    ${p.bestSellersRank ? `<tr><th>Best Sellers Rank</th><td>${esc(p.bestSellersRank)}</td></tr>` : ''}
    ${isGame ? `<tr><th>Package Dimensions</th><td>6.69 x 5.31 x 0.51 inches; 2.82 ounces</td></tr>` : ''}
    <tr><th>Type of item</th><td>${esc(p.typeLabel)}</td></tr>
    <tr><th>Language</th><td>English</td></tr>
    ${p.esrb ? `<tr><th>Rated</th><td>${esc(p.esrb)}</td></tr>` : ''}
    <tr><th>Manufacturer</th><td>${esc(p.brand)}</td></tr>
    ${isGame ? `<tr><th>Date First Available</th><td>June 23, 2026</td></tr>` : ''}
  </table>
  <h3>Warranty &amp; Support</h3><p class="az-fine"><a href="#">Product Warranty:</a> For warranty information about this product, please <a href="#">click here</a>.</p>
  <p class="az-fine"><a href="#">Would you like to tell us about a lower price?</a></p>
</section>
${isGame ? `<section class="az-description"><h2 class="az-h2">Product Description</h2><p>Vice City, USA. Jason and Lucia have always known the deck is stacked against them. ${esc(GAME.description)}</p></section>` : ''}
<section class="az-reviews"><h2 class="az-h2">Customer reviews</h2>
  ${p.rating ? `<div class="az-stars"><span aria-hidden="true">${'★'.repeat(Math.round(p.rating.stars))}${'☆'.repeat(5 - Math.round(p.rating.stars))}</span> ${esc(p.rating.stars)} out of 5 &middot; ${esc(p.rating.count)} global ratings</div>`
    : `<div class="az-review-bars">${[5, 4, 3, 2, 1].map(n => `<div><span>${n} star</span><span class="az-bar"></span><span>0%</span></div>`).join('')}</div><p><a href="${esc(base + signinPath(ret))}">Sign in to see customer reviews.</a></p>`}
</section>`
}

// ---------------------------------------------------------------- cart
export function cartPage({ base, t, saved = [], user }) {
  if (!t.lines.length && !saved.length) {
    return `<div class="az-cart-page"><div class="az-cart-box az-cart-empty">
  <img src="/static/art/game-generic.svg" alt="" class="az-cart-empty-img">
  <div><h1>Your Amazon Cart is empty</h1><p><a href="${base}/">Shop today's deals</a></p>
  ${user ? '' : `<a class="az-btn" href="${esc(base + signinPath('/cart'))}">Sign in to your account</a> <a class="az-btn az-btn-outline" href="${base}/ap/register?openid.return_to=%2Fcart">Sign up now</a>`}</div>
</div>
<p class="az-fine">The price and availability of items at Amazon.com are subject to change. The Cart is a temporary place to store a list of your items and reflects each item's most recent price. <a href="#">Learn more</a></p>
<p class="az-fine">Do you have a gift card or promotional code? We'll ask you to enter your claim code when it's time to pay.</p></div>`
  }
  const line = (l) => `<div class="az-cart-line" data-asin="${esc(l.asin)}">
  <a href="${productPath(base, l.product)}" class="az-cart-img"><img src="${l.product.art}" alt="${esc(l.product.title)}"></a>
  <div class="az-cart-info">
    <a class="az-cart-title" href="${productPath(base, l.product)}">${esc(l.product.title)}</a>
    <div class="az-fine">by ${esc(l.product.brand)}</div>
    <div class="az-fine">${esc(l.product.typeLabel)}</div>
    <div class="az-avail">${esc(l.product.availability)}</div>
    <div class="az-fine">${esc(l.product.delivery[0].replace(' on $35 of items shipped by Amazon', ''))} available at checkout</div>
    <a class="az-fine-link" href="#">FREE Returns</a>
    <label class="az-check az-fine"><input type="checkbox" name="gift-${esc(l.asin)}"> This is a gift <a href="#">Learn more</a></label>
    ${l.product.kind === 'game' ? `<div class="az-fine"><b>Platform For Display:</b> ${esc(l.product.swatchLabel)} &nbsp; <b>Edition:</b> Standard</div>` : ''}
    <div class="az-cart-actions">
      ${stepper(base, l, '/cart')}
      <form method="post" action="${base}/cart/update" class="az-cart-links">
        <input type="hidden" name="asin" value="${esc(l.asin)}">
        <button type="submit" name="action" value="delete" class="az-link-btn">Delete</button>
        <button type="submit" name="action" value="save" class="az-link-btn">Save for later</button>
        <a class="az-link-btn" href="#">Compare with similar items</a>
        <a class="az-link-btn" href="#">Share</a>
      </form>
    </div>
  </div>
  <div class="az-cart-price">${price(l.product.price * l.qty)}</div>
</div>`
  const savedRows = saved.map(l => `<div class="az-cart-line" data-asin="${esc(l.asin)}">
  <a href="${productPath(base, l.product)}" class="az-cart-img"><img src="${l.product.art}" alt="${esc(l.product.title)}"></a>
  <div class="az-cart-info"><a class="az-cart-title" href="${productPath(base, l.product)}">${esc(l.product.title)}</a><div class="az-avail">${esc(l.product.availability)}</div>
    <form method="post" action="${base}/cart/update" class="az-cart-actions"><input type="hidden" name="asin" value="${esc(l.asin)}"><button type="submit" name="action" value="move" class="az-btn az-btn-outline az-btn-sm">Move to cart</button><button type="submit" name="action" value="delete-saved" class="az-link-btn">Delete</button></form>
  </div>
  <div class="az-cart-price">${price(l.product.price)}</div>
</div>`).join('')
  const subtotalLine = `Subtotal (${plural(t.count)}): <b>${money(t.subtotal)}</b>`
  const afterSavings = Math.max(0, Math.round((t.subtotal - 50) * 100) / 100)
  return `<div class="az-cart-page">
  <div class="az-cart-main">
    <div class="az-visa-banner"><div><b>$50 instant gift card</b><br>Get a $50 Amazon Gift Card instantly upon approval for Amazon Visa</div>
      <table><tr><td>Current Total</td><td>${money(t.subtotal)}</td></tr><tr><td>Savings</td><td>- $50.00</td></tr><tr><td>Cost After Savings</td><td>${money(afterSavings)}</td></tr></table><a class="az-btn az-btn-outline az-btn-sm" href="#">Learn more</a></div>
    <div class="az-cart-box">
      <div class="az-cart-head"><h1>Shopping Cart</h1><span class="az-cart-col">Price</span></div>
      ${t.lines.length ? t.lines.map(line).join('') : `<p class="az-cart-empty-inline">Your Amazon Cart is empty.</p>`}
      ${t.lines.length ? `<div class="az-cart-subtotal">${subtotalLine}</div>` : ''}
    </div>
    <p class="az-fine">The price and availability of items at Amazon.com are subject to change. The Cart is a temporary place to store a list of your items and reflects each item's most recent price. <a href="#">Learn more</a></p>
    <p class="az-fine">Do you have a gift card or promotional code? We'll ask you to enter your claim code when it's time to pay.</p>
    ${saved.length ? `<div class="az-cart-box"><h2>Saved for later (${plural(saved.length)})</h2>${savedRows}</div>` : ''}
    ${t.lines.length ? `<section class="az-carousel"><h2 class="az-h2">Customers who bought ${esc(t.lines[0].product.title)} also bought these items from other categories:</h2><div class="az-carousel-row">
      ${CART_RECS.map(byAsin).filter(p => !t.lines.some(l => l.asin === p.asin)).map(p => `<div><a href="${productPath(base, p)}"><b>${esc(p.title)}</b></a><span>${money(p.price)}</span>${p.availability === 'In Stock' ? '' : `<em>${esc(p.availability)}</em>`}${p.dealNote ? `<em>${esc(p.dealNote)}</em>` : ''}${addToCartForm(base, p, '/cart', 0)}</div>`).join('')}
    </div></section>` : ''}
  </div>
  <aside class="az-cart-summary">
    ${t.lines.length ? `<div class="az-free-note"><span class="az-check-green">&#10004;</span> Your order qualifies for FREE delivery. Choose this option at checkout. <a href="#">See details</a></div>
    <div class="az-cart-subtotal">${subtotalLine}</div>
    <form method="post" action="${base}/gp/cart/desktop/go-to-checkout.html">
      <label class="az-check"><input type="checkbox" name="gift" value="1"> This order contains a gift</label>
      <button class="az-btn az-btn-block" type="submit" name="proceedToRetailCheckout" value="Proceed to checkout">Proceed to checkout (${plural(t.count)})</button>
    </form>` : `<p>Your cart is empty. Items saved for later are listed below your cart.</p>`}
  </aside>
</div>`
}

// ---------------------------------------------------------------- sign in / register
const authError = (msg) => msg ? `<div class="az-alert" role="alert"><b>There was a problem</b><p>${esc(msg)}</p></div>` : ''

export function signinEmailPage({ base, email = '', error = '' }) {
  return `<div class="az-auth-card">
  ${authError(error)}
  <h1>Sign in or create account</h1>
  <form method="post" action="${base}/ax/claim" novalidate>
    <label for="ap_email_login">Enter mobile number or email</label>
    <input id="ap_email_login" name="email" type="text" autocomplete="username" value="${esc(email)}" ${error ? 'aria-invalid="true"' : ''}>
    <button class="az-btn az-btn-block" type="submit" id="continue">Continue</button>
  </form>
  <p class="az-fine">By continuing, you agree to Amazon's <a href="#">Conditions of Use</a> and <a href="#">Privacy Notice</a>.</p>
  <details class="az-auth-help"><summary>Need help?</summary><a href="#">Forgot your password?</a><a href="#">Other issues with Sign-In</a></details>
  <hr>
  <p class="az-fine"><b>Buying for work?</b><br><a href="#">Create a free business account</a></p>
</div>`
}

export function signinPasswordPage({ base, email, changePath = signinPath(), error = '' }) {
  return `<div class="az-auth-card">
  ${authError(error)}
  <h1>Sign in</h1>
  <p class="az-auth-email">${esc(email)} <a href="${esc(base + changePath)}">Change</a></p>
  <form method="post" action="${base}/ap/signin/password" novalidate>
    <div class="az-label-row"><label for="ap_password">Password</label><a href="#">Forgot your password?</a></div>
    <input id="ap_password" name="password" type="password" autocomplete="current-password" ${error ? 'aria-invalid="true"' : ''}>
    <button class="az-btn az-btn-block" type="submit" id="signInSubmit">Sign in</button>
    <label class="az-check"><input type="checkbox" name="rememberMe" value="true"> Keep me signed in. <a href="#">Details</a></label>
  </form>
</div>`
}

export function registerPage({ base, values = {}, errors = {}, signinPath: signinHref = signinPath() }) {
  const err = (n) => errors[n] ? `<div class="az-field-error" id="err-${n}"><span aria-hidden="true">&#9888;</span> ${esc(errors[n])}</div>` : ''
  const inv = (n) => errors[n] ? `aria-invalid="true" aria-describedby="err-${n}"` : ''
  return `<div class="az-auth-card">
  ${Object.keys(errors).length ? authError('Please correct the fields below.') : ''}
  <h1>Create account</h1>
  <form method="post" action="${base}/ap/register" novalidate>
    <label for="ap_customer_name">Your name</label>
    <input id="ap_customer_name" name="customerName" type="text" autocomplete="name" placeholder="First and last name" value="${esc(values.customerName ?? '')}" ${inv('customerName')}>${err('customerName')}
    <label for="ap_email">Mobile number or email</label>
    <input id="ap_email" name="email" type="text" autocomplete="username" value="${esc(values.email ?? '')}" ${inv('email')}>${err('email')}
    <label for="ap_password">Password</label>
    <input id="ap_password" name="password" type="password" autocomplete="new-password" placeholder="At least 6 characters" ${inv('password')}>${err('password')}
    <div class="az-hint"><span aria-hidden="true">&#9432;</span> Passwords must be at least 6 characters.</div>
    <label for="ap_password_check">Re-enter password</label>
    <input id="ap_password_check" name="passwordCheck" type="password" autocomplete="new-password" ${inv('passwordCheck')}>${err('passwordCheck')}
    <button class="az-btn az-btn-block" type="submit" id="continue">Create your Amazon account</button>
  </form>
  <p class="az-fine">By creating an account, you agree to Amazon's <a href="#">Conditions of Use</a> and <a href="#">Privacy Notice</a>.</p>
  <hr>
  <p class="az-fine">Already have an account? <a href="${esc(base + signinHref)}">Sign in &rsaquo;</a></p>
</div>`
}

// ---------------------------------------------------------------- checkout
function summaryRail({ t, ready, delivery = 'standard', top = '' }) {
  const dash = (v) => ready ? money(v) : '--'
  return `<aside class="az-co-summary">
  ${top}
  <h2>Order Summary</h2>
  <div class="az-row"><span>Items (${t.count}):</span><span>${money(t.subtotal)}</span></div>
  <div class="az-row"><span>Shipping &amp; handling:</span><span>${dash(t.shipping)}</span></div>
  <div class="az-row az-row-line"><span>Total before tax:</span><span>${dash(t.subtotal + t.shipping)}</span></div>
  <div class="az-row"><span>Estimated tax to be collected:</span><span>${dash(t.tax)}</span></div>
  <div class="az-row az-order-total"><span>Order total:</span><span>${dash(t.total)}</span></div>
  ${ready ? `<a class="az-fine-link" href="#">How are shipping costs calculated?</a>` : `<p class="az-fine">Choose a shipping address and payment method to calculate shipping, handling, and tax.</p>`}
</aside>`
}

const fieldError = (errors, n) => errors[n] ? `<div class="az-field-error" id="err-${n}"><span aria-hidden="true">&#9888;</span> ${esc(errors[n])}</div>` : ''
const errorBox = (errors) => Object.keys(errors).length ? `<div class="az-alert" role="alert"><b>There was a problem</b><ul>${Object.values(errors).map(e => `<li>${esc(e)}</li>`).join('')}</ul></div>` : ''

export function addressPage({ base, t, values = {}, errors = {} }) {
  const v = (n) => esc(values[n] ?? '')
  const inv = (n) => errors[n] ? `aria-invalid="true" aria-describedby="err-${n}"` : ''
  return `<div class="az-co">
  <div class="az-co-col">
    <h1>Select a delivery address</h1>
    ${errorBox(errors)}
    <div class="az-co-box">
      <h2>Add a new address</h2>
      <div class="az-autofill"><span>&#9432;</span> Save time. Autofill your current location. <button type="button" class="az-btn az-btn-outline az-btn-sm">Autofill</button></div>
      <form method="post" action="${base}/gp/buy/addressselect" novalidate class="az-address-form">
        <label for="countryCode">Country/Region</label>
        <select id="countryCode" name="countryCode" autocomplete="country"><option value="US" selected>United States</option></select>
        <label for="fullName">Full name (First and Last name)</label>
        <input id="fullName" name="fullName" type="text" autocomplete="name" value="${v('fullName')}" ${inv('fullName')}>${fieldError(errors, 'fullName')}
        <label for="phoneNumber">Phone number</label>
        <input id="phoneNumber" name="phoneNumber" type="tel" autocomplete="tel" value="${v('phoneNumber')}" ${inv('phoneNumber')}>${fieldError(errors, 'phoneNumber')}
        <div class="az-hint">May be used to assist delivery</div>
        <label for="addressLine1">Address</label>
        <input id="addressLine1" name="addressLine1" type="text" autocomplete="address-line1" placeholder="Street address or P.O. Box" value="${v('addressLine1')}" ${inv('addressLine1')}>${fieldError(errors, 'addressLine1')}
        <label for="addressLine2" class="a-offscreen">Apt, suite, unit, building, floor, etc.</label>
        <input id="addressLine2" name="addressLine2" type="text" autocomplete="address-line2" placeholder="Apt, suite, unit, building, floor, etc." value="${v('addressLine2')}">
        <div class="az-3col">
          <div><label for="city">City</label><input id="city" name="city" type="text" autocomplete="address-level2" value="${v('city')}" ${inv('city')}>${fieldError(errors, 'city')}</div>
          <div><label for="state">State</label><select id="state" name="state" autocomplete="address-level1" ${inv('state')}><option value="">Select</option>${STATES.map(s => `<option value="${s}" ${values.state === s ? 'selected' : ''}>${s}</option>`).join('')}</select>${fieldError(errors, 'state')}</div>
          <div><label for="postalCode">ZIP Code</label><input id="postalCode" name="postalCode" type="text" inputmode="numeric" autocomplete="postal-code" value="${v('postalCode')}" ${inv('postalCode')}>${fieldError(errors, 'postalCode')}</div>
        </div>
        <label for="deliveryInstructions">Delivery instructions (optional)</label>
        <input id="deliveryInstructions" name="deliveryInstructions" type="text" placeholder="Add preferences, notes, access codes and more" value="${v('deliveryInstructions')}">
        <label class="az-check"><input type="checkbox" name="isDefault" value="1" ${values.isDefault ? 'checked' : ''}> Make this my default address</label>
        <button class="az-btn" type="submit" id="address-ui-widgets-form-submit-button">Use this address</button>
      </form>
    </div>
    <p class="az-fine"><a href="#">Find a pickup location near you</a> &middot; <a href="#">Deliver to multiple addresses</a></p>
  </div>
  ${summaryRail({ t, ready: false })}
</div>`
}

const MONTHS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
export function paymentPage({ base, t, address, values = {}, errors = {}, promoError = '' }) {
  const v = (n) => esc(values[n] ?? '')
  const inv = (n) => errors[n] ? `aria-invalid="true" aria-describedby="err-${n}"` : ''
  const years = Array.from({ length: 20 }, (_, i) => String(2026 + i))
  return `<div class="az-co">
  <div class="az-co-col">
    <h1>Select a payment method</h1>
    ${errorBox(errors)}
    <div class="az-co-box">
      <h2>Your credit and debit cards</h2>
      <table class="az-cards-table"><thead><tr><th></th><th>Name on card</th><th>Expires on</th></tr></thead><tbody><tr><td colspan="3" class="az-fine">You have no saved cards.</td></tr></tbody></table>
      <h3 class="az-add-card">+ Add a credit or debit card <span class="az-fine">Amazon accepts all major credit cards.</span></h3>
      <div class="az-card-logos"><span>VISA</span><span>Mastercard</span><span>AMEX</span><span>Discover</span><span>Amazon Store Card</span></div>
      <form method="post" action="${base}/gp/buy/payselect" novalidate class="az-card-form">
        <label for="addCreditCardNumber">Card number</label>
        <input id="addCreditCardNumber" name="cardNumber" type="text" inputmode="numeric" autocomplete="cc-number" value="" ${inv('cardNumber')}>${fieldError(errors, 'cardNumber')}
        <label for="nameOnCard">Name on card</label>
        <input id="nameOnCard" name="nameOnCard" type="text" autocomplete="cc-name" value="${v('nameOnCard')}" ${inv('nameOnCard')}>${fieldError(errors, 'nameOnCard')}
        <fieldset class="az-exp"><legend>Expiration date</legend>
          <label for="expMonth" class="a-offscreen">Month</label><select id="expMonth" name="expMonth" autocomplete="cc-exp-month" ${inv('expiration')}>${MONTHS.map(m => `<option value="${m}" ${values.expMonth === m ? 'selected' : ''}>${m}</option>`).join('')}</select>
          <label for="expYear" class="a-offscreen">Year</label><select id="expYear" name="expYear" autocomplete="cc-exp-year">${years.map(y => `<option value="${y}" ${values.expYear === y ? 'selected' : ''}>${y}</option>`).join('')}</select>
        </fieldset>${fieldError(errors, 'expiration')}
        <p class="az-fine"><b>Billing address:</b> same as delivery address — ${esc(address.full_name)}, ${esc(address.line1)}, ${esc(address.city)}, ${esc(address.state)} ${esc(address.postal_code)} <a href="${base}/gp/buy/addressselect">Change</a></p>
        <button class="az-btn" type="submit" id="pp-use-this-payment-method">Use this payment method</button>
      </form>
      <h2>Your available balance</h2>
      <form method="post" action="${base}/gp/buy/payselect/promo" class="az-promo-form">
        <label for="pp-gift-card-code">Enter a gift card, voucher or promotional code</label>
        <div class="az-inline"><input id="pp-gift-card-code" name="code" type="text" placeholder="Enter Code" value=""><button class="az-btn az-btn-outline" type="submit">Apply</button></div>
        ${promoError ? `<div class="az-field-error"><span aria-hidden="true">&#9888;</span> ${esc(promoError)}</div>` : ''}
      </form>
      <h2>Other payment methods</h2>
      <p>+ Add a personal checking account <span class="az-fine">Use your US based personal checking account.</span></p>
      <div class="az-visa-offer"><b>Get $50 off instantly</b> upon approval for Amazon Visa. <a href="#">Learn more</a></div>
    </div>
  </div>
  ${summaryRail({ t, ready: false })}
</div>`
}

export function reviewPage({ base, t, address, payment, delivery = 'standard' }) {
  const opt = DELIVERY[delivery] ?? DELIVERY.standard
  // "Place your order" sits at the top of the right rail and again under the items (research); both submit spc-form.
  const placeBtn = (id) => `<button class="az-btn az-btn-block" type="submit" form="spc-form" name="action" value="place" id="${id}">Place your order</button>
  <p class="az-fine az-agree">By placing your order, you agree to Amazon's <a href="#">privacy notice</a> and <a href="#">conditions of use</a>.</p>`
  return `<div class="az-co">
  <div class="az-co-col">
    <h1>Review your order</h1>
    <section class="az-co-box az-co-step"><div class="az-step-num">1</div><div class="az-step-body"><h2>Shipping address</h2>
      <address>${esc(address.full_name)}<br>${esc(address.line1)}${address.line2 ? `<br>${esc(address.line2)}` : ''}<br>${esc(address.city).toUpperCase()}, ${esc(address.state)} ${esc(address.postal_code)}<br>United States<br>Phone: ${esc(address.phone)}</address>
      ${address.instructions ? `<p class="az-fine">Delivery instructions: ${esc(address.instructions)}</p>` : ''}</div>
      <div class="az-step-links"><a href="${base}/gp/buy/addressselect">Change</a><a href="#">Edit delivery preferences</a></div></section>
    <section class="az-co-box az-co-step"><div class="az-step-num">2</div><div class="az-step-body"><h2>Payment method</h2>
      <p>Paying with ${esc(payment.brand)} ending in ${esc(payment.last4)}</p>
      <p class="az-fine">Billing address: same as shipping address</p>
      <p class="az-fine">Add a promotional code <a href="${base}/gp/buy/payselect">Enter code</a></p></div>
      <div class="az-step-links"><a href="${base}/gp/buy/payselect">Change</a></div></section>
    <section class="az-co-box az-co-step"><div class="az-step-num">3</div><div class="az-step-body az-step-items"><h2>Review items and shipping</h2>
      <form id="spc-form" method="post" action="${base}/gp/buy/spc">
        <h3 class="az-arriving">Arriving ${esc(opt.date)}</h3>
        ${t.lines.map(l => `<div class="az-spc-item">
          <img src="${l.product.art}" alt="${esc(l.product.title)}">
          <div class="az-spc-item-info">
            <b>${esc(l.product.title)}</b>
            <div class="az-price-red">${money(l.product.price)}</div>
            <div class="az-fine">Sold by: Amazon.com</div>
            <div class="az-avail">${esc(l.product.availability)}</div>
            ${l.product.priceNote ? `<div class="az-fine">${esc(l.product.priceNote)}</div>` : ''}
            <label class="az-qty-pill">Qty: <select name="quantity_${esc(l.asin)}" onchange="this.form.submit()" aria-label="Quantity">${[1, 2, 3, 4, 5].map(n => `<option value="${n}" ${n === l.qty ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
            <a class="az-fine-link" href="#">Add gift options</a>
          </div>
        </div>`).join('')}
        <div class="az-spc-delivery"><b>Choose your delivery option:</b>
          ${Object.values(DELIVERY).map(d => `<label class="az-radio"><input type="radio" name="delivery" value="${d.id}" ${delivery === d.id ? 'checked' : ''} onchange="this.form.submit()"> <b>${esc(d.name)}: ${esc(d.date)}</b><br><span class="az-fine">${d.price ? `${money(d.price)} - Shipping &middot; ` : ''}${esc(d.detail)}</span></label>`).join('')}
        </div>
        <button type="submit" class="az-link-btn az-nojs">Update</button>
      </form>
    </div></section>
    <div class="az-co-box az-spc-bottom">${placeBtn('bottomSubmitOrderButtonId')}<div class="az-spc-bottom-total">Order total: <b>${money(t.total)}</b></div></div>
    <div class="az-co-notes">
      <p>*Why has sales tax been applied? <a href="#">See tax and seller information.</a></p>
      <p>Need help? Check our <a href="#">Help pages</a> or <a href="#">contact us</a></p>
      <p>For an item sold by Amazon.com: When you click the "Place your order" button, we'll send you an email message acknowledging receipt of your order. Your contract to purchase an item will not be complete until we send you an email notifying you that the item has been shipped.</p>
      <p>You're not charged until your order enters the shipping process. Pre-order Price Guarantee: the price we charge when we ship it to you will be the lowest price offered by Amazon.com between the time you placed your order and the end of the day of the release date.</p>
      <p>You may return new, unopened merchandise in original condition within 30 days of delivery. <a href="#">See Amazon.com's Returns Policy.</a></p>
      <p>Need to add more items to your order? <a href="${base}/">Continue shopping on the Amazon.com homepage.</a></p>
    </div>
  </div>
  ${summaryRail({ t, ready: true, delivery, top: placeBtn('placeYourOrder') })}
</div>`
}

export function thankYouPage({ base, order }) {
  const a = order.shipping_address
  const opt = DELIVERY[order.fulfillment.option] ?? DELIVERY.standard
  return `<div class="az-thanks">
  <div class="az-co-box az-thanks-box">
    <div class="az-thanks-head"><span class="az-check-green az-check-big" aria-hidden="true">&#10004;</span><div>
      <h1>Order placed, thanks!</h1>
      <p>Confirmation will be sent to <b>${esc(order.customer.email)}</b>.</p>
      <p><b>Delivering to ${esc(a.first_name)} ${esc(a.last_name)}, ${esc(a.city)}, ${esc(a.state)} ${esc(a.postal_code)}</b> &middot; Arriving ${esc(opt.short)}${order.fulfillment.option === 'release-date' ? ' (Release-Date Delivery)' : ''}</p>
      <p class="az-order-number">Order number: <span data-order-number>${esc(order.order_number)}</span> &nbsp; <a href="${base}/gp/css/order-history">Review or edit your recent orders &rsaquo;</a></p>
      <p class="az-fine">You're not charged until your order enters the shipping process. Under the Pre-order Price Guarantee, the price we charge when we ship is the lowest price offered by Amazon.com between the time you placed your order and the end of the day of the release date. You can cancel any time before it ships from Your Orders.</p>
      <a class="az-btn az-btn-outline" href="${base}/">Continue shopping</a>
    </div></div>
  </div>
  <div class="az-thanks-grid">
    <div class="az-co-box">
      <h2>Order details</h2>
      ${order.items.map(it => `<div class="az-thanks-item"><span>${esc(it.title)} &times; ${it.qty}</span><span>${money(it.unit_price * it.qty)}</span></div>`).join('')}
      <p class="az-fine">${esc(opt.name)}: ${esc(opt.date)} &middot; Paying with ${esc(order.payment.brand)} ending in ${esc(order.payment.last4)}</p>
    </div>
    <aside class="az-co-summary">
      <h2>Order Summary</h2>
      <div class="az-row"><span>Items (${order.items.reduce((n, i) => n + i.qty, 0)}):</span><span>${money(order.totals.subtotal)}</span></div>
      <div class="az-row"><span>Shipping &amp; handling:</span><span>${money(order.totals.shipping)}</span></div>
      <div class="az-row az-row-line"><span>Total before tax:</span><span>${money(order.totals.subtotal + order.totals.shipping)}</span></div>
      <div class="az-row"><span>Estimated tax to be collected:</span><span>${money(order.totals.tax)}</span></div>
      <div class="az-row az-order-total"><span>Order total:</span><span>${money(order.totals.total)}</span></div>
    </aside>
  </div>
  <section class="az-carousel"><h2 class="az-h2">Customers who bought items in your order also bought</h2><div class="az-carousel-row">
    <div><b>PS5 Controller Charging Station</b><span>$19.99</span></div><div><b>Gaming Headset with Noise Cancelling Mic</b><span>$34.99</span></div><div><b>Grand Theft Auto V - PlayStation 5</b><span>$24.34</span></div><div><b>Joystick Grip Caps (4 Pack)</b><span>$9.99</span></div>
  </div></section>
  <div class="az-prime-offer"><b>Try Prime FREE for 30 days</b> — get FREE Release-Date Delivery on pre-orders like this one. <a href="#">Start your free trial</a></div>
</div>`
}

export function ordersPage({ base, user, orders }) {
  return `<div class="az-orders">
  <nav class="az-crumbs"><a href="${base}/gp/css/order-history">Your Account</a> &rsaquo; Your Orders</nav>
  <h1>Your Orders</h1>
  <p class="az-fine">Hello, ${esc(user.first_name)} (${esc(user.email)}) &middot; <a href="${base}/gp/flex/sign-out.html">Sign out</a></p>
  ${orders.length ? orders.map(o => `<div class="az-order-card">
    <div class="az-order-card-head"><div><span>ORDER PLACED</span><b>${new Date(o.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</b></div><div><span>TOTAL</span><b>${money(o.totals.total)}</b></div><div><span>SHIP TO</span><b>${esc(o.shipping_address?.first_name)} ${esc(o.shipping_address?.last_name)}</b></div><div class="az-order-card-num"><span>ORDER # ${esc(o.order_number)}</span><a href="#">View order details</a></div></div>
    <div class="az-order-card-body"><h3>Not yet shipped &middot; Arriving ${esc((DELIVERY[o.fulfillment.option] ?? DELIVERY.standard).short)}</h3>${o.items.map(i => `<p>${esc(i.title)} &times; ${i.qty}</p>`).join('')}<a class="az-btn az-btn-outline az-btn-sm" href="#">Cancel items</a></div>
  </div>`).join('') : `<div class="az-co-box"><p>Looks like you haven't placed an order yet.</p></div>`}
</div>`
}

export function simplePage({ title, html }) {
  return `<div class="az-simple"><h1>${esc(title)}</h1>${html}</div>`
}
