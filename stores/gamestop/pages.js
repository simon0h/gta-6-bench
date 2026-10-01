import { esc, money, disclaimer } from '../../lib/html.js'
import { productPath, STATES, SHIPPING_METHODS } from './data.js'

const NAME = 'GameStop'
const NAV = ['Trading Cards', 'Deals', 'Shop My Store', 'Pre-Order', 'Collectibles & More', 'PlayStation', 'Nintendo Switch', 'Xbox', 'Pre-Owned', 'New & Upcoming', 'Only At GameStop', 'Digital Store', 'Retro Gaming', 'GS Pro Credit Card']

export function layout({ base, title, body, cartCount = 0, user = null, bodyClass = '' }) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)} | GameStop</title>
<link rel="stylesheet" href="${base}/static/style.css"></head>
<body class="${esc(bodyClass)}">
<header class="gs-header">
  <div class="gs-header-top">
    <button class="gs-menu" type="button" aria-label="Menu">&#9776; <span>Menu</span></button>
    <a class="gs-logo" href="${base}/" aria-label="GameStop home">Game<span>Stop</span></a>
    <form class="gs-search" action="${base}/search/" method="get" role="search">
      <input type="search" name="q" placeholder="Search games, consoles &amp; more" aria-label="Search games, consoles and more">
      <button type="submit" aria-label="Search">&#128269;</button>
    </form>
    <nav class="gs-utils" aria-label="Account">
      <a href="${base}/trade-in/">&#8644; Trade-In</a>
      ${user ? `<a href="${base}/account/">&#128100; Hi, ${esc(user.first_name || 'there')}</a>` : `<a href="${base}/login/">&#128100; Sign In</a>`}
      <a href="${base}/cart/" class="gs-cart-link" aria-label="Cart, ${cartCount} items">&#128722; Cart${cartCount ? `<span class="gs-badge">${cartCount}</span>` : ''}</a>
    </nav>
  </div>
  <nav class="gs-nav" aria-label="Shop by category">${NAV.map(n => `<a href="${base}/search/?q=${encodeURIComponent(n)}">${esc(n)}</a>`).join('')}</nav>
  <div class="gs-promo">Pre-Order The Newest Trading Cards Before They Sell Out.</div>
</header>
<main class="gs-main">${body}</main>
<footer class="gs-footer">
  <div class="gs-footer-cols">
    <div><h4>GET HELP</h4><a href="#">Help Center</a><a href="#">Order Status</a><a href="#">GameStop Pro Credit Card</a><a href="#">Make a Return</a></div>
    <div><h4>LEGAL &amp; PRIVACY</h4><a href="#">Conditions of Use</a><a href="#">Returns Policy</a><a href="#">Privacy Policy</a><a href="#">GameStop Pro Terms &amp; Conditions</a></div>
    <div><h4>ABOUT US</h4><a href="#">Accessibility</a><a href="#">Careers</a><a href="#">Find a Store</a><a href="#">Investors</a></div>
    <div><h4>SIGN UP</h4><p>Get Exclusive Promotions, Coupons, and the Latest Events</p><form onsubmit="return false"><input type="email" placeholder="Email address" aria-label="Email address"><button type="button">JOIN</button></form></div>
  </div>
  <p class="gs-copy">&copy; 1999-2026 GameStop &nbsp;·&nbsp; Australia &amp; New Zealand &nbsp;·&nbsp; France &nbsp;·&nbsp; Cookie Preferences</p>
  ${disclaimer(NAME)}
</footer>
</body></html>`
}

function tile(base, p) {
  return `<article class="gs-tile">
  <a href="${productPath(base, p)}"><img src="${p.art}" alt="${esc(p.title)}"></a>
  <h3><a href="${productPath(base, p)}">${esc(p.title)}</a></h3>
  <div class="gs-price">${money(p.price)}</div>
  ${p.proPrice ? `<div class="gs-pro-price">${money(p.proPrice)} for Pros</div>` : ''}
  <div class="gs-release">Release Date ${esc(p.release)}</div>
</article>`
}

export function homePage({ base, products }) {
  const game = products.filter(p => p.kind === 'game')
  return `<section class="gs-hero">
  <div><p class="gs-eyebrow">PRE-ORDER NOW</p><h1>Grand Theft Auto VI</h1><p>Return to Leonida. Pre-order to receive the Vintage Vice City Pack. Available November 19, 2026 for PlayStation 5 and Xbox Series X|S.</p>
  <a class="gs-btn" href="${productPath(base, game[0])}">Pre-Order Now</a></div>
  <img src="${game[0].art}" alt="Grand Theft Auto VI cover art">
</section>
<section><h2>New &amp; Upcoming</h2><div class="gs-grid">${products.map(p => tile(base, p)).join('')}</div></section>`
}

export function searchPage({ base, q, products }) {
  const facets = `<aside class="gs-facets"><h3>Filter</h3>
  <details open><summary>Delivery Method</summary><label><input type="checkbox"> Ship to Home</label><label><input type="checkbox"> Same Day Delivery</label><label><input type="checkbox"> Pick Up</label></details>
  <details open><summary>Categories</summary><label><input type="checkbox"> Video Games (${products.filter(p => p.kind === 'game').length})</label><label><input type="checkbox"> Gaming Accessories (${products.filter(p => p.category === 'playstation-5' && p.kind === 'other').length})</label><label><input type="checkbox"> Electronics (${products.filter(p => p.category === 'electronics').length})</label></details>
  <details open><summary>Platform</summary><label><input type="checkbox"> PlayStation 5 (${products.filter(p => p.category === 'playstation-5').length})</label><label><input type="checkbox"> Xbox Series X (${products.filter(p => p.category.startsWith('xbox')).length})</label></details>
  <details><summary>Condition</summary><label><input type="checkbox"> New (${products.length})</label></details>
  <details><summary>More Ways To Shop</summary><label><input type="checkbox"> Shop Pre-Orders (${products.length})</label></details>
  <details><summary>Edition</summary><label><input type="checkbox"> Standard (${products.filter(p => p.kind === 'game').length})</label></details>
  </aside>`
  return `<div class="gs-search-page">
  <div class="gs-search-head"><h1>Search Results for "${esc(q)}"</h1><span>(${products.length} items)</span><span class="gs-sort">Sort: <select aria-label="Sort"><option>Best Matches</option><option>Price Low To High</option><option>Price High To Low</option><option>Release Date</option></select></span></div>
  <div class="gs-search-body">${facets}
  <div class="gs-grid">${products.length ? products.map(p => tile(base, p)).join('') : `<p class="gs-empty">We couldn't find any results for "${esc(q)}". Check your spelling or try a different search term.</p>`}</div></div></div>`
}

export function productPage({ base, p, siblings, added }) {
  const isGame = p.kind === 'game'
  const modal = added ? `<div class="gs-modal-backdrop" id="added-modal">
  <div class="gs-modal" role="dialog" aria-labelledby="added-title">
    <div class="gs-modal-head"><h2 id="added-title">&#10004; Added to the cart</h2><a href="${productPath(base, p)}" class="gs-modal-close" aria-label="Close">&times;</a></div>
    <div class="gs-modal-body"><img src="${added.art}" alt=""><p>Nice! Your "${esc(added.title)}" has been added to cart.</p></div>
    <a class="gs-btn gs-btn-block" href="${base}/cart/">View Cart &amp; Checkout</a>
    <h3>People Also Bought</h3>
    <div class="gs-mini-carousel"><div>Grand Theft Auto V - PlayStation 5<br><b>$18.99</b> <small>$18.04 for Pros</small></div><div>Red Dead Redemption - PlayStation 4<br><b>$29.99</b></div><div>NBA 2K27 - PlayStation 5<br><b>$64.99</b> <small>$61.74 for Pros</small></div></div>
  </div></div>` : ''
  return `${modal}
<nav class="gs-crumbs" aria-label="Breadcrumb"><a href="${base}/">Video Games</a> &rsaquo; <a href="${base}/search/?q=${encodeURIComponent(p.categoryName)}">${esc(p.categoryName)}</a></nav>
<div class="gs-pdp">
  <div class="gs-pdp-gallery"><div class="gs-thumbs">${Array.from({ length: 5 }, () => `<img src="${p.art}" alt="">`).join('')}</div><img class="gs-pdp-hero" src="${p.art}" alt="${esc(p.title)}"></div>
  <div class="gs-buybox">
    <a class="gs-brand" href="${base}/search/?q=${encodeURIComponent(p.brand)}">${esc(p.brand)}</a>
    <h1>${esc(p.title)}</h1>
    ${p.badge ? `<span class="gs-pill">${esc(p.badge)}</span>` : ''}
    <div class="gs-price-row"><span class="gs-price-big">${money(p.price)}</span><span class="gs-release-inline">Release Date: ${esc(p.release)}</span></div>
    ${p.proPrice ? `<div class="gs-pro-price">${money(p.proPrice)} for Pros</div>` : ''}
    <form method="post" action="${base}/cart/add"><input type="hidden" name="pid" value="${p.id}"><button class="gs-btn gs-btn-block" type="submit">Pre-Order</button></form>
    ${isGame ? `<div class="gs-card gs-selector"><div class="gs-card-label">Platform</div>
      ${siblings.map(s => `<a class="gs-option ${s.id === p.id ? 'is-selected' : ''}" href="${productPath(base, s)}" aria-current="${s.id === p.id ? 'true' : 'false'}">${esc(s.selectorLabel)}</a>`).join('')}
    </div>` : ''}
    <div class="gs-card"><div class="gs-card-label">Condition</div><span class="gs-chip is-selected">${esc(p.condition)}</span> <span class="gs-chip-price">${money(p.price)}</span></div>
    <div class="gs-card"><div class="gs-card-label">Delivery: Ship to Home</div>
      <div class="gs-delivery-tiles">
        <div class="gs-delivery-tile is-disabled"><b>Pick up in-store</b><span>Not Available</span></div>
        <div class="gs-delivery-tile is-selected"><b>Ship to Home</b><span>2-3 business days</span></div>
      </div>
      <p class="gs-fine"><b>FREE Shipping on Pre-Orders $59+.</b> Exclusions apply</p>
      <p class="gs-fine">Arrives on or shortly after release day</p>
    </div>
    <div class="gs-cc-banner"><b>Get A FREE Pro Membership ($85+ in savings)</b><br>+ 2% back on all purchases with the GameStop Pro Credit Card. <a href="#">Apply Now</a> · <a href="#">See if You're Pre-Qualified</a></div>
    ${p.esrb ? `<p class="gs-fine">ESRB Rating: ${esc(p.esrb)}</p>` : ''}
    <p class="gs-fine">Billing does not occur until order is processed</p>
    <h3>Features</h3><ul class="gs-features">${p.features.map(f => `<li>${esc(f)}</li>`).join('')}</ul>
    <details class="gs-accordion"><summary>Product Description</summary><div class="gs-pro-block"><b>GameStop Pro Benefits</b><p>Level up to Pro! Pros can gain $60 in annual value for just $25/year. Already a member? <a href="${base}/login/">Sign In</a></p><button type="button" class="gs-btn gs-btn-outline">Join Pro Now</button></div></details>
    <details class="gs-accordion"><summary>Specs</summary><table class="gs-specs"><tr><th>Brand</th><td>${esc(p.brand)}</td></tr><tr><th>Category</th><td>${esc(p.categoryName)}</td></tr><tr><th>Release Date</th><td>${esc(p.release)}</td></tr>${isGame ? `<tr><th>Edition</th><td>Standard</td></tr><tr><th>Format</th><td>Code in Box (no disc)</td></tr>` : ''}</table></details>
  </div>
</div>
<section class="gs-carousel"><h2>People Also Bought</h2><div class="gs-mini-carousel"><div>Grand Theft Auto V - PlayStation 5<br><b>$18.99</b> <small>$18.04 for Pros</small></div><div>NBA 2K27 - PlayStation 5<br><b>$64.99</b></div><div>Sony DualSense Wireless Controller - White<br><b>$74.99</b></div></div></section>
<section><h2>Questions &amp; Answers</h2><p class="gs-fine">Be the first to ask a question about this product.</p></section>`
}

export function cartPage({ base, t, promoError, savedMsg }) {
  if (!t.lines.length) {
    return `<div class="gs-cart-empty"><h1>Your cart is empty</h1><p>Looks like you haven't added anything yet.</p><a class="gs-btn" href="${base}/">Continue Shopping</a></div>`
  }
  const rows = t.lines.map(l => `<div class="gs-line">
  <img src="${l.product.art}" alt="">
  <div class="gs-line-info">
    <a href="${productPath(base, l.product)}"><b>${esc(l.product.title)}</b></a>
    <div class="gs-fine">Condition: ${esc(l.product.condition)}${l.product.kind === 'game' ? ` &nbsp;·&nbsp; Platform: ${esc(l.product.selectorLabel)}` : ''}</div>
    <label class="gs-radio"><input type="radio" checked readonly> <b>FREE Shipping on Pre-Orders $59+.</b> Exclusions apply<br><span class="gs-fine">Arrives on or shortly after release day</span></label>
    <form method="post" action="${base}/cart/update" class="gs-line-actions">
      <input type="hidden" name="line" value="${l.line}">
      <label>Quantity: <select name="qty" onchange="this.form.submit()" aria-label="Quantity">${[1, 2, 3, 4, 5].map(n => `<option value="${n}" ${n === l.qty ? 'selected' : ''}>Qty ${n}</option>`).join('')}</select></label>
      <button type="submit" name="action" value="update" class="gs-link-btn">Update</button>
      <button type="submit" name="action" value="save" class="gs-link-btn">Save for Later</button>
      <button type="submit" name="action" value="remove" class="gs-link-btn">Remove</button>
    </form>
  </div>
  <div class="gs-line-price">${money(l.product.price * l.qty)}</div>
</div>`).join('')
  return `<div class="gs-cart">
  <div class="gs-cart-main">
    <h1 class="visually-hidden">Cart</h1>
    ${savedMsg ? `<p class="gs-notice">${esc(savedMsg)}</p>` : ''}
    <div class="gs-section-bar">&#8962; Ship To Home: ${t.count} Item${t.count === 1 ? '' : 's'}</div>
    ${rows}
    <div class="gs-pro-upsell"><h3>Don't Miss Out</h3><p>Get $60 in value and free shipping on orders $54+* when you join GameStop Pro!</p><p class="gs-fine">Get $5 Monthly Pro Rewards, 5% Extra Off Pre-Owned and Collectibles, and That's Just the Start</p><p>Join today <b>$25/Year</b></p><button type="button" class="gs-btn gs-btn-outline">Join Pro</button><p class="gs-fine">*Exclusions apply.</p></div>
    <p class="gs-fine">Need Help? Call 1-800-883-8895</p>
  </div>
  <aside class="gs-summary">
    <h2>ORDER SUMMARY</h2>
    <div class="gs-row"><span>Subtotal (${t.count} item${t.count === 1 ? '' : 's'})</span><span>${money(t.subtotal)}</span></div>
    <div class="gs-row"><span>Shipping &amp; Handling</span><span>FREE</span></div>
    <div class="gs-row"><span>Estimated Tax &#9432;</span><span>${money(t.tax)}</span></div>
    <div class="gs-row gs-total"><span>Estimated Total</span><span>${money(t.total)}</span></div>
    <form method="post" action="${base}/checkout/express" class="gs-express"><button type="submit" name="method" value="paypal" class="gs-paypal" aria-label="PayPal">Pay<span>Pal</span></button></form>
    <div class="gs-or">OR</div>
    <p class="gs-fine gs-center">zip · or pay in installments</p>
    <form method="post" action="${base}/checkout/start"><button type="submit" class="gs-btn gs-btn-block gs-upper">Proceed to Checkout</button></form>
    <details class="gs-accordion" ${promoError ? 'open' : ''}><summary>ENTER PROMO CODE</summary>
      <form method="post" action="${base}/cart/promo" class="gs-promo-form"><label for="promo">Promo Code</label><input id="promo" name="code" type="text"><button type="submit" class="gs-btn gs-btn-outline">Submit</button>${promoError ? `<p class="gs-error">${esc(promoError)}</p>` : ''}</form>
    </details>
  </aside>
</div>`
}

export function loginPage({ base, checkout, error, email = '' }) {
  const next = checkout ? `${base}/checkout/login/` : `${base}/login/`
  return `<div class="gs-auth">
  <div class="gs-auth-col">
    <h1>Sign In</h1>
    ${error ? `<p class="gs-error" role="alert">${esc(error)}</p>` : ''}
    <form method="post" action="${next}">
      <input type="hidden" name="action" value="signin">
      <label for="email">Email</label><input id="email" name="email" type="email" autocomplete="email" value="${esc(email)}" required>
      <label for="password">Password</label><input id="password" name="password" type="password" autocomplete="current-password" required>
      <label class="gs-check"><input type="checkbox" name="remember" value="1"> Keep me signed in</label>
      <button class="gs-btn gs-btn-block" type="submit">Sign In</button>
      <a class="gs-fine" href="#">Forgot password?</a>
    </form>
  </div>
  <div class="gs-auth-col">
    <h2>New to GameStop?</h2>
    <p>Create an account to track, manage, and return orders, and earn rewards with GameStop Pro.</p>
    <a class="gs-btn gs-btn-outline gs-btn-block" href="${base}/account/create/${checkout ? '?checkout=1' : ''}">Create Account</a>
    ${checkout ? `<div class="gs-guest"><h2>Guest Checkout</h2><p>You can check out as a guest, but creating an account makes it easier to track, manage, and return orders.</p>
    <form method="post" action="${next}"><input type="hidden" name="action" value="guest"><button class="gs-btn gs-btn-outline gs-btn-block" type="submit">Checkout as Guest</button></form></div>` : ''}
  </div>
</div>`
}

export function createAccountPage({ base, values = {}, errors = {}, checkout }) {
  const f = (name, label, type = 'text', extra = '') => `<label for="${name}">${label}</label><input id="${name}" name="${name}" type="${type}" value="${esc(values[name] ?? '')}" ${extra}>${errors[name] ? `<span class="gs-error">${esc(errors[name])}</span>` : ''}`
  return `<div class="gs-auth gs-auth-single"><div class="gs-auth-col">
  <h1>Create Account</h1>
  <form method="post" action="${base}/account/create/${checkout ? '?checkout=1' : ''}">
    ${f('firstName', 'First Name', 'text', 'autocomplete="given-name" required')}
    ${f('lastName', 'Last Name', 'text', 'autocomplete="family-name" required')}
    ${f('email', 'Email', 'email', 'autocomplete="email" required')}
    ${f('phone', 'Phone Number (optional)', 'tel', 'autocomplete="tel"')}
    ${f('password', 'Password', 'password', 'autocomplete="new-password" required')}
    ${f('confirmPassword', 'Confirm Password', 'password', 'autocomplete="new-password" required')}
    <label class="gs-check"><input type="checkbox" name="emails" value="1" checked> Send me GameStop emails with exclusive promotions and the latest events</label>
    <button class="gs-btn gs-btn-block" type="submit">Create Account</button>
    <p class="gs-fine">Already have an account? <a href="${checkout ? `${base}/checkout/login/` : `${base}/login/`}">Sign In</a></p>
  </form></div></div>`
}

export function checkoutPage({ base, user, t, values = {}, errors = {}, shippingMethod = 'premium' }) {
  const v = (n) => esc(values[n] ?? '')
  const err = (n) => errors[n] ? `<span class="gs-error" id="err-${n}">${esc(errors[n])}</span>` : ''
  const input = (name, label, type = 'text', extra = '') => `<div class="gs-field"><label for="${name}">${label}</label><input id="${name}" name="${name}" type="${type}" value="${v(name)}" ${extra} ${errors[name] ? `aria-invalid="true" aria-describedby="err-${name}"` : ''}>${err(name)}</div>`
  const pm = values.paymentMethod || 'card'
  const errorSummary = Object.keys(errors).length ? `<div class="gs-error-summary" role="alert"><b>Please correct the following:</b><ul>${Object.values(errors).map(e => `<li>${esc(e)}</li>`).join('')}</ul></div>` : ''
  return `<div class="gs-checkout">
  <form method="post" action="${base}/checkout/" class="gs-checkout-form" novalidate>
    <h1>Checkout</h1>
    ${errorSummary}
    <section class="gs-co-section"><h2>Contact Information</h2>
      ${user ? `<p>${esc(user.email)} <a href="${base}/logout" class="gs-fine">Not you? Sign out</a></p><input type="hidden" name="email" value="${esc(user.email)}">` : input('email', 'Email', 'email', 'autocomplete="email" required')}
    </section>
    <section class="gs-co-section"><h2>Shipping Address</h2>
      <div class="gs-2col">${input('firstName', 'First Name', 'text', 'autocomplete="given-name" required')}${input('lastName', 'Last Name', 'text', 'autocomplete="family-name" required')}</div>
      ${input('address1', 'Address 1', 'text', 'autocomplete="address-line1" required')}
      ${input('address2', 'Address 2 (optional)', 'text', 'autocomplete="address-line2"')}
      <div class="gs-3col">${input('city', 'City', 'text', 'autocomplete="address-level2" required')}
        <div class="gs-field"><label for="stateCode">State</label><select id="stateCode" name="stateCode" autocomplete="address-level1" required><option value="">Select</option>${STATES.map(s => `<option value="${s}" ${values.stateCode === s ? 'selected' : ''}>${s}</option>`).join('')}</select>${err('stateCode')}</div>
        ${input('postalCode', 'ZIP Code', 'text', 'autocomplete="postal-code" inputmode="numeric" required')}</div>
      ${input('phone', 'Phone Number', 'tel', 'autocomplete="tel" required')}
      <p class="gs-fine">We ship to the continental U.S. only. No freight forwarders, hotels or business addresses.</p>
    </section>
    <section class="gs-co-section"><h2>Shipping Method</h2>
      ${Object.values(SHIPPING_METHODS).map(m => `<label class="gs-radio gs-ship-method"><input type="radio" name="shippingMethod" value="${m.id}" ${shippingMethod === m.id ? 'checked' : ''}> <b>${m.name}</b> <span>${m.price ? money(m.price) : 'FREE'}</span><br><span class="gs-fine">${m.eta}</span></label>`).join('')}
    </section>
    <section class="gs-co-section"><h2>Payment</h2>
      <div class="gs-tabs" role="tablist">
        <label class="gs-tab"><input type="radio" name="paymentMethod" value="card" ${pm === 'card' ? 'checked' : ''}> Credit / Debit Card</label>
        <label class="gs-tab"><input type="radio" name="paymentMethod" value="paypal" ${pm === 'paypal' ? 'checked' : ''}> PayPal</label>
        <label class="gs-tab"><input type="radio" name="paymentMethod" value="bnpl" ${pm === 'bnpl' ? 'checked' : ''}> BUY NOW, PAY LATER</label>
      </div>
      <div class="gs-tab-panel" data-panel="card">
        <p class="gs-fine">We accept Visa, MasterCard, American Express, Discover and the GameStop Pro Credit Card.</p>
        ${input('cardNumber', 'Card Number', 'text', 'autocomplete="cc-number" inputmode="numeric"')}
        <div class="gs-2col">${input('expirationMonthYear', 'Expiration (MM/YY)', 'text', 'autocomplete="cc-exp" placeholder="MM/YY"')}${input('securityCode', 'Security Code', 'text', 'autocomplete="cc-csc" inputmode="numeric" maxlength="4"')}</div>
      </div>
      <div class="gs-tab-panel" data-panel="paypal"><p>You will be redirected to PayPal to complete your purchase. PayPal Pay in 4 is available.</p></div>
      <div class="gs-tab-panel" data-panel="bnpl"><p>Pay in 4 or 8 installments with Zip. Fees are displayed before you confirm.</p></div>
      <h3>Gift Cards &amp; Trade Credit</h3>
      <div class="gs-2col"><div class="gs-field"><label for="giftCardNumber">Gift Card Number</label><input id="giftCardNumber" name="giftCardNumber" type="text" value="${v('giftCardNumber')}"></div><div class="gs-field"><label for="giftCardPin">PIN</label><input id="giftCardPin" name="giftCardPin" type="text" value="${v('giftCardPin')}"></div></div>
      <p class="gs-fine">Up to 2 gift cards per order. Coupons cannot be applied to pre-orders.</p>
    </section>
    <section class="gs-co-section"><h2>Billing Address</h2>
      <label class="gs-check"><input type="checkbox" name="billingSame" value="1" ${values.billingSame === undefined || values.billingSame ? 'checked' : ''} id="billingSame"> Same as shipping address</label>
      <div id="billing-fields">
        <div class="gs-2col">${input('billingFirstName', 'First Name')}${input('billingLastName', 'Last Name')}</div>
        ${input('billingAddress1', 'Address 1')}
        <div class="gs-3col">${input('billingCity', 'City')}
          <div class="gs-field"><label for="billingStateCode">State</label><select id="billingStateCode" name="billingStateCode"><option value="">Select</option>${STATES.map(s => `<option value="${s}" ${values.billingStateCode === s ? 'selected' : ''}>${s}</option>`).join('')}</select>${err('billingStateCode')}</div>
          ${input('billingPostalCode', 'ZIP Code')}</div>
      </div>
    </section>
    <div class="gs-place-mobile"><button class="gs-btn gs-btn-block" type="submit">Place Order</button></div>
  </form>
  <aside class="gs-summary">
    <h2>ORDER SUMMARY</h2>
    ${t.lines.map(l => `<div class="gs-row gs-sum-item"><span>${esc(l.product.title)} × ${l.qty}</span><span>${money(l.product.price * l.qty)}</span></div>`).join('')}
    <div class="gs-row"><span>Subtotal (${t.count} item${t.count === 1 ? '' : 's'})</span><span>${money(t.subtotal)}</span></div>
    <div class="gs-row"><span>Shipping &amp; Handling</span><span>${t.shipping ? money(t.shipping) : 'FREE'}</span></div>
    <div class="gs-row"><span>Estimated Tax &#9432;</span><span>${money(t.tax)}</span></div>
    <div class="gs-row gs-total"><span>Estimated Total</span><span>${money(t.total)}</span></div>
    <button class="gs-btn gs-btn-block" type="submit" form="gs-checkout-form-id">Place Order</button>
    <p class="gs-fine">When you place an order, GameStop places a temporary authorization on your payment method. You are not fully charged until the order ships. Pre-orders are charged about 1 week before the release date.</p>
    <p class="gs-fine">By placing your order you agree to GameStop's Conditions of Use and Privacy Policy.</p>
  </aside>
</div>
<script>
(function(){
  var form=document.querySelector('.gs-checkout-form'); form.id='gs-checkout-form-id';
  var radios=form.querySelectorAll('input[name=paymentMethod]');
  function showPanel(){var val=form.querySelector('input[name=paymentMethod]:checked').value;form.querySelectorAll('.gs-tab-panel').forEach(function(p){p.hidden=p.dataset.panel!==val});}
  radios.forEach(function(r){r.addEventListener('change',showPanel)}); showPanel();
  var same=document.getElementById('billingSame'), bf=document.getElementById('billing-fields');
  function toggleBilling(){bf.hidden=same.checked} same.addEventListener('change',toggleBilling); toggleBilling();
})();
</script>`
}

export function confirmationPage({ base, order }) {
  const ship = order.shipping_address, bill = order.billing_address
  const method = SHIPPING_METHODS[order.fulfillment.option] ?? SHIPPING_METHODS.premium
  const d = new Date(order.created_at)
  const dateText = `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`
  return `<div class="gs-confirm">
  <div class="gs-pro-upsell gs-pro-banner"><h3>Don't Miss Out</h3><p>Get $60 in value when you join GameStop Pro! Join today <b>$25/Year</b></p><button type="button" class="gs-btn gs-btn-outline">JOIN PRO</button></div>
  <h1 class="gs-upper">Thank you for your order!</h1>
  <p>We've sent you a confirmation email.</p>
  <p class="gs-order-meta"><b>Order Number:</b> <span data-order-number>${esc(order.order_number)}</span> &nbsp;&nbsp; <b>Order Date:</b> ${dateText}</p>
  <div class="gs-confirm-grid">
    <div>
      <h2>Shipping Now</h2>
      <table class="gs-confirm-table"><thead><tr><th>Products</th><th>Shipping Details</th></tr></thead><tbody>
      ${order.items.map(it => `<tr><td>${esc(it.title)} × ${it.qty}</td><td><b>Shipping Method</b><br>${method.name} ${money(method.price)}<br><span class="gs-fine">${method.eta}</span></td></tr>`).join('')}
      </tbody></table>
      <h2>SHIPPING</h2><h3>Shipping Address</h3><address>${esc(ship.first_name)} ${esc(ship.last_name)}<br>${esc(ship.line1)}${ship.line2 ? `<br>${esc(ship.line2)}` : ''}<br>${esc(ship.city)}, ${esc(ship.state)} ${esc(ship.postal_code)}<br>${esc(ship.phone ?? '')}</address>
      <h2>PAYMENT</h2><h3>Billing Address</h3><address>${esc(bill.first_name)} ${esc(bill.last_name)}<br>${esc(bill.line1)}<br>${esc(bill.city)}, ${esc(bill.state)} ${esc(bill.postal_code)}<br>${esc(order.customer.email)}</address>
      <h3>Payment Method</h3><p>${order.payment.method === 'card' ? `Credit Card<br>${esc(bill.first_name)} ${esc(bill.last_name)}<br>${esc(order.payment.brand)} ************${esc(order.payment.last4)}<br>Expiration ${esc(order.payment.expiration)}` : order.payment.method === 'paypal' ? `PayPal<br>${esc(order.customer.email)}` : 'Zip (Buy Now, Pay Later)'}<br>Amount: ${money(order.totals.total)}</p>
    </div>
    <aside class="gs-summary">
      <div class="gs-row"><span>Subtotal</span><span>${money(order.totals.subtotal)}</span></div>
      <div class="gs-row"><span>Shipping &amp; Handling</span><span>${order.totals.shipping ? money(order.totals.shipping) : 'FREE'}</span></div>
      <div class="gs-row"><span>Estimated Tax &#9432;</span><span>${money(order.totals.tax)}</span></div>
      <p class="gs-fine">Sales tax is an estimate only, final total is subject to change.</p>
      <div class="gs-row gs-total"><span>Total</span><span>${money(order.totals.total)}</span></div>
      <a class="gs-btn gs-btn-outline gs-btn-block" href="${base}/">Return To Shopping</a>
    </aside>
  </div>
</div>`
}

export function accountPage({ base, user, orders }) {
  return `<div class="gs-account"><h1>Hello, ${esc(user.first_name)}</h1>
  <p>${esc(user.email)} · <a href="${base}/logout">Sign Out</a></p>
  <h2>Order History</h2>
  ${orders.length ? `<table class="gs-confirm-table"><thead><tr><th>Order Number</th><th>Date</th><th>Items</th><th>Total</th></tr></thead><tbody>${orders.map(o => `<tr><td>${esc(o.order_number)}</td><td>${new Date(o.created_at).toLocaleDateString('en-US')}</td><td>${o.items.map(i => esc(i.title)).join('<br>')}</td><td>${money(o.totals.total)}</td></tr>`).join('')}</tbody></table>` : '<p>You have no orders yet.</p>'}
  </div>`
}

export function simplePage({ title, html }) {
  return `<div class="gs-simple"><h1>${esc(title)}</h1>${html}</div>`
}
