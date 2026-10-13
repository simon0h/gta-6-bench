import { scenarioStockFor } from '../../lib/benchmark-scenarios.js'
import { esc, money, disclaimer } from '../../lib/html.js'
import { productPath, STATES, SHIPPING_METHODS, shippingEta, DEPARTMENTS } from './data.js'
import { artwork } from './catalog-pages.js'
import { orderStatus } from '../../lib/retail-state.js'
import { checkoutShell } from './checkout-reference.js'
import { megaNav, drawerMenu, footerHtml } from './site.js'
export { homePage, searchPage, productPage } from './catalog-pages.js'

export const escapeText = esc
const NAME = 'GameStop'
const capturedIcons = { pro: 'gamestop-pro.svg', search: 'material-search.svg', cart: 'material-shopping-cart.svg', trade: 'material-repeat.svg' }
const icon = name => capturedIcons[name] ? `<img class="gs-icon" src="/static/reference/gamestop/${capturedIcons[name]}" alt="">` : `<svg class="gs-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">${{search:'<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>',user:'<circle cx="12" cy="7" r="4"/><path d="M4 22v-3c0-7 16-7 16 0v3z"/>',cart:'<path d="M2 3h3l3 12h11l3-9H6"/><circle cx="9" cy="20" r="1"/><circle cx="19" cy="20" r="1"/>',trade:'<path d="M3 7h17l-4-4M21 17H4l4 4M3 7v5M21 17v-5"/>',pro:'<path d="m12 2 4 6 6 4-6 4-4 6-4-6-6-4 6-4z" fill="currentColor"/>',store:'<path d="M3 9h18l-2-6H5zM4 10v11h16V10M9 21v-7h6v7"/>'}[name]}</svg>`

// NAV kept for reference: the live header now comes from site.js MENU.
const NAV = [['Trading Cards','toys-games/trading-cards'],['Deals','deals'],['Pre-Order','pre-order'],['Collectibles','collectibles'],['PlayStation','playstation'],['Nintendo Switch','nintendo-switch'],['Xbox','xbox'],['Pre-Owned','pre-owned'],['New & Upcoming','new-and-upcoming'],['Only at GameStop','only-at-gamestop'],['Digital Store','digital-store'],['Retro Gaming','retro']]

export function layout({ base, title, body, cartCount = 0, user = null, bodyClass = '', q = '', selectedStore = '' }) {
  if (body.includes('gs-native-checkout')) return checkoutShell({ base, title, body })
  const capturedProduct = body.includes('gs-game-pdp')
  const capturedCart = body.includes('gs-captured-cart-page')
  const capturedChrome = capturedProduct || capturedCart
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)} | GameStop</title>
<link rel="stylesheet" href="${base}/static/style.css"><link rel="stylesheet" href="${base}/static/site.css"><script src="${base}/static/storefront.js" defer></script></head>
<body class="${esc(bodyClass)}${capturedChrome ? ' gs-captured-product' : ''}${capturedCart ? ' gs-captured-cart' : ''}">
<a class="gs-skip" href="#main-content">Skip to main content</a>
<header class="gs-header">
  <div class="gs-header-top">
    <details class="gs-native-menu"><summary class="gs-menu" aria-label="Menu"><img class="gs-menu-bars" src="/static/reference/gamestop/material-menu.svg" alt=""><span>Menu</span></summary><div class="gs-menu-panel">${drawerMenu(base)}</div></details>
    <a class="gs-logo" href="${base}/" aria-label="GameStop home"><img src="/static/reference/gamestop/gamestop-logo.svg" alt="GameStop" width="160" height="38"></a>
    <form class="gs-search" action="${base}/search/" method="get" role="search">
      <button type="submit" aria-label="Search">${icon('search')}</button><input type="search" name="q" value="${esc(q)}" list="gs-search-suggestions" placeholder="Search games, consoles &amp; more" aria-label="Search games, consoles and more">
      <datalist id="gs-search-suggestions"><option value="controller"><option value="trading card"><option value="pre-owned"><option value="PC gaming"><option value="Grand Theft Auto VI"></datalist>
    </form>
    <nav class="gs-utils" aria-label="Account">
      <a class="gs-desktop-action" href="${base}/trade-in">${icon('trade')}<span>Trade-In</span></a><a class="gs-desktop-action" href="${base}/pro">${icon('pro')}<span>GameStop Pro</span></a>
      <details class="gs-account-menu"><summary>${icon('user')}<span>${user ? `Hi, ${esc(user.first_name || 'there')}` : 'Sign In'}</span></summary><div><b>${user?'Your account':'Sign in for the best experience'}</b><a class="gs-btn gs-btn-block" href="${base}/${user?'account':'login'}">${user?'My Account':'Sign In'}</a><a href="${base}/account/orders">Orders</a><a href="${base}/account/saved">Saved &amp; recently viewed</a><a href="${base}/account/addresses">Address book</a>${user?`<a href="${base}/logout">Sign Out</a>`:`<a href="${base}/account/create">Create Account</a>`}</div></details>
      <a href="${base}/cart" class="gs-cart-link" aria-label="Cart, ${cartCount} items">${icon('cart')}<span>Cart${cartCount ? `<span class="gs-badge">${cartCount}</span>` : ''}</span></a>
    </nav>
  </div>
  <div class="gs-nav-row"><button class="gs-rail-arrow" data-nav-scroll="-1" aria-label="Previous categories" hidden>‹</button><nav class="gs-nav" id="gs-category-nav" aria-label="Shop by category">${megaNav(base)}</nav><button class="gs-rail-arrow" data-nav-scroll="1" aria-label="More categories" hidden>›</button><nav class="gs-location-nav" aria-label="Shopping services"><a href="${base}/order/search">Track Order</a><a href="${base}/stores">${icon('store')}${esc(selectedStore || 'Find a Store')}</a></nav></div>
  <div class="gs-promo"><a href="${base}/toys-games/trading-cards">Pre-Order The Newest Trading Cards Before They Sell Out.</a></div>
</header>
<main class="gs-main" id="main-content">${body}</main>
${footerHtml(base, disclaimer(NAME))}
</body></html>`
}

export function cartPage({ base, t, promoError, savedMsg }) {
  const unavailable=t.lines.some(l=>scenarioStockFor(l.product,'shipping')===0)
  const availabilityNotice=t.lines.some(l=>l.product.kind==='game') ? `<p class="benchmark-fulfillment" role="status">This local storefront supports shipping only; pickup checkout is unavailable.</p>${unavailable?'<p class="benchmark-availability" role="alert">Shipping unavailable. This item can no longer be purchased. No order has been placed.</p>':''}` : ''
  if (!t.lines.length) {
    return `<div class="gs-cart-empty"><h1>Your cart is empty</h1><p>Looks like you haven't added anything yet.</p><a class="gs-btn" href="${base}/">Continue Shopping</a></div>`
  }
  const rows = t.lines.map(l => `<div class="gs-line">
  ${artwork(l.product)}
  <div class="gs-line-info"><a href="${productPath(base,l.product)}${l.product.variant?'?variant='+encodeURIComponent(l.product.variant):''}"><b>${esc(l.product.title)}</b></a><div class="gs-fine">Condition: ${esc(l.product.condition)}${l.product.selectedOptions ? Object.entries(l.product.selectedOptions).filter(([k])=>k!=="Condition").map(([k,v])=>`<br>${esc(k)}: ${esc(v)}`).join('') : ''}${l.product.kind === 'game' ? `<br>Platform: ${esc(l.product.selectorLabel)}` : ''}</div></div>
  <div class="gs-cart-fulfillment"><span aria-hidden="true" class="gs-cart-selected">●</span><p><b>${l.product.preorder === false ? 'Ship to Home' : 'FREE Shipping on Pre-Orders $59+.'}<br>Exclusions apply</b><br>${esc(shippingEta(l.product))}</p></div><div class="gs-line-price">${money(l.product.price*l.qty)}</div>
  <form method="post" action="${base}/cart/update" class="gs-line-actions"><input type="hidden" name="line" value="${l.line}"><label>Quantity:<select name="qty" onchange="this.form.submit()" aria-label="Quantity">${[1,2,3,4,5].map(n=>`<option value="${n}" ${n===l.qty?'selected':''}>Qty ${n}</option>`).join('')}</select></label><noscript><button name="action" value="update" class="gs-link-btn">Update</button></noscript><button type="submit" name="action" value="save" class="gs-link-btn">Save for Later</button><button type="submit" name="action" value="remove" class="gs-link-btn">Remove</button></form></div>`).join('')
  return `<div class="gs-cart gs-captured-cart-page"><div class="gs-cart-main"><h1 class="visually-hidden">My Cart (${t.count} item${t.count===1?'':'s'})</h1>${availabilityNotice}${savedMsg?`<p class="gs-notice">${esc(savedMsg)}</p>`:''}<div class="gs-section-bar"><span aria-hidden="true">⌂</span> Ship To Home: ${t.count} Item${t.count===1?'':'s'}</div>${rows}<section class="gs-cart-pro"><h2>Don't Miss Out</h2><div class="gs-pro-upsell"><div class="gs-cart-pro-mark"><img src="/static/reference/gamestop/gamestop-logo.svg" alt="GameStop"><strong>PRO</strong></div><div><h3>Get $60 in value and free shipping on orders $54+* when you join GameStop Pro!</h3><p>Get $5 Monthly Pro Rewards, 5% Extra Off Pre-Owned and Collectibles, and That's Just the Start</p><div class="gs-cart-pro-price"><p>Join today<br><b>$29.99</b>/Year</p><a class="gs-btn gs-btn-outline" href="${base}/pro/">Join Pro</a></div><p class="gs-fine">*Exclusions apply. Visit our terms at <a href="${base}/help/articles/pro">https://www.gamestop.com/TermsConditions.html</a> for more information.</p></div></div></section><p class="gs-cart-help">Need Help? Call <a href="tel:18008838895">1-800-883-8895</a></p></div><aside class="gs-summary"><h2>ORDER SUMMARY</h2><div class="gs-row"><span><b>Subtotal</b> (${t.count} item${t.count===1?'':'s'})</span><span><b>${money(t.subtotal)}</b></span></div><div class="gs-row"><span>Shipping &amp; Handling</span><span class="gs-cart-free">${t.shipping?money(t.shipping):'FREE'}</span></div><div class="gs-row"><span>Estimated Tax &#9432;</span><span>${money(t.tax)}</span></div><div class="gs-row gs-total"><span>Estimated Total</span><span>${money(t.total)}</span></div><div class="gs-or">OR</div><p class="gs-cart-zip"><b>zip</b> or pay in installments as low</p><form method="post" action="${base}/checkout/start"><button type="submit" class="gs-btn gs-btn-block gs-upper" ${unavailable?'disabled':''}>Proceed to Checkout</button></form><form method="post" action="${base}/checkout/express" class="gs-express"><button type="submit" name="method" value="paypal" class="gs-paypal" ${unavailable?'disabled':''} aria-label="PayPal">Pay<span>Pal</span><small> Checkout</small></button></form><details class="gs-accordion" ${promoError?'open':''}><summary>ENTER PROMO CODE</summary><form method="post" action="${base}/cart/promo" class="gs-promo-form"><label for="promo">Promo Code</label><input id="promo" name="code" type="text"><button type="submit" class="gs-btn gs-btn-outline">Submit</button>${promoError?`<p class="gs-error">${esc(promoError)}</p>`:''}</form></details></aside></div>`
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
      <p class="gs-fine">Your sign-in stays in this browser session until you sign out.</p>
      <button class="gs-btn gs-btn-block" type="submit">Sign In</button>
      <span class="gs-static">Forgot password?</span>
    </form>
  </div>
  <div class="gs-auth-col">
    <h2>New to GameStop?</h2>
    <p>Create an account to track orders, save favorites and manage shipping addresses.</p>
    <a class="gs-btn gs-btn-outline gs-btn-block" href="${base}/account/create/${checkout ? '?checkout=1' : ''}">Create Account</a>
    ${checkout ? `<div class="gs-guest"><h2>Guest Checkout</h2><p>You can check out as a guest, but creating an account makes it easier to track, manage, and return orders.</p>
    <form method="post" action="${next}"><input type="hidden" name="action" value="guest"><button class="gs-btn gs-btn-outline gs-btn-block" type="submit">Checkout as Guest</button></form></div>` : ''}
  </div>
</div>`
}

export function createAccountPage({ base, values = {}, errors = {}, checkout }) {
  const f = (name, label, type = 'text', extra = '') => `<label for="${name}">${label}</label><input id="${name}" name="${name}" type="${type}" value="${esc(type === 'password' ? '' : values[name] ?? '')}" ${extra}>${errors[name] ? `<span class="gs-error">${esc(errors[name])}</span>` : ''}`
  return `<div class="gs-auth gs-auth-single"><div class="gs-auth-col">
  <h1>Create Account</h1>
  <form method="post" action="${base}/account/create/${checkout ? '?checkout=1' : ''}">
    ${f('firstName', 'First Name', 'text', 'autocomplete="given-name" required')}
    ${f('lastName', 'Last Name', 'text', 'autocomplete="family-name" required')}
    ${f('email', 'Email', 'email', 'autocomplete="email" required')}
    ${f('phone', 'Phone Number (optional)', 'tel', 'autocomplete="tel"')}
    ${f('password', 'Password', 'password', 'autocomplete="new-password" required')}
    ${f('confirmPassword', 'Confirm Password', 'password', 'autocomplete="new-password" required')}
    <label class="gs-check"><input type="checkbox" name="emails" value="1" ${values.emails === '1' ? 'checked' : ''}> Interested in promotions and events</label>
    <button class="gs-btn gs-btn-block" type="submit">Create Account</button>
    <p class="gs-fine">This preference is saved in your account. No emails are sent.</p>
    <p class="gs-fine">Already have an account? <a href="${checkout ? `${base}/checkout/login/` : `${base}/login/`}">Sign In</a></p>
  </form></div></div>`
}

export function checkoutPage({ base, user, t, values = {}, errors = {}, shippingMethod = 'premium', reviewToken = '', addressPicker = '' }) {
  const v = (n) => esc(['cardNumber','securityCode','giftCardNumber','giftCardPin'].includes(n) ? '' : values[n] ?? '')
  const err = (n) => errors[n] ? `<span class="gs-error" id="err-${n}">${esc(errors[n])}</span>` : ''
  const input = (name, label, type = 'text', extra = '') => `<div class="gs-field"><label for="${name}">${label}</label><input id="${name}" name="${name}" type="${type}" value="${v(name)}" ${extra} ${errors[name] ? `aria-invalid="true" aria-describedby="err-${name}"` : ''}>${err(name)}</div>`
  const pm = values.paymentMethod || 'card'
  const errorSummary = Object.keys(errors).length ? `<div class="gs-error-summary" role="alert"><b>Please correct the following:</b><ul>${Object.values(errors).map(e => `<li>${esc(e)}</li>`).join('')}</ul></div>` : ''
  return `${addressPicker}<div class="gs-checkout">
  <form method="post" action="${base}/checkout/" class="gs-checkout-form" id="gs-checkout-form-id" novalidate>
    <input type="hidden" name="reviewToken" value="${esc(reviewToken)}"><h1>Checkout</h1>
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
      <p class="gs-fine">We ship to the continental U.S. only. Shipping to Alaska, Hawaii, and international addresses is unavailable.</p>
    </section>
    <section class="gs-co-section"><h2>Shipping Method</h2>
      ${Object.values(SHIPPING_METHODS).map(m => `<label class="gs-radio gs-ship-method"><input type="radio" name="shippingMethod" value="${m.id}" ${shippingMethod === m.id ? 'checked' : ''}> <b>${m.name}</b> <span>${m.price ? money(m.price) : 'FREE'}</span><br><span class="gs-fine">${t.lines.every(l=>l.product.preorder) ? m.eta : (m.id === "rush" ? "Expedited handling after order processing" : "Ships after order processing")+(t.lines.some(l=>l.product.preorder)?"; preorders follow their release date":"")}</span></label>`).join('')}
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
      <div class="gs-tab-panel" data-panel="paypal"><p>PayPal is a local payment selection here. No external sign-in or payment is initiated.</p></div>
      <div class="gs-tab-panel" data-panel="bnpl"><p>Zip is a local payment selection here. No credit application or installment agreement is created.</p></div>
      <h3>Gift Cards &amp; Trade Credit</h3>
      <div class="gs-2col"><div class="gs-field"><label for="giftCardNumber">Gift Card Number</label><input id="giftCardNumber" name="giftCardNumber" type="text" value="${v('giftCardNumber')}"></div><div class="gs-field"><label for="giftCardPin">PIN</label><input id="giftCardPin" name="giftCardPin" type="text" value="${v('giftCardPin')}"></div></div>
      <p class="gs-fine">Gift-card redemption is unavailable. Choose a supported payment method above. Coupons cannot be applied to pre-orders.</p>
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
    ${t.lines.map(l => `<div class="gs-row gs-sum-item"><span>${esc(l.product.title)}${l.product.selectedOptions ? ` (${Object.values(l.product.selectedOptions).map(esc).join(" / ")})` : ""} × ${l.qty}</span><span>${money(l.product.price * l.qty)}</span></div>`).join('')}
    <div class="gs-row"><span>Subtotal (${t.count} item${t.count === 1 ? '' : 's'})</span><span>${money(t.subtotal)}</span></div>
    <div class="gs-row"><span>Shipping &amp; Handling</span><span id="gs-shipping-total">${t.shipping ? money(t.shipping) : 'FREE'}</span></div>
    <div class="gs-row"><span>Estimated Tax &#9432;</span><span>${money(t.tax)}</span></div>
    <div class="gs-row gs-total"><span>Estimated Total</span><span id="gs-grand-total">${money(t.total)}</span></div>
    <button class="gs-btn gs-btn-block" type="submit" form="gs-checkout-form-id">Place Order</button>
    <p class="gs-fine">When you place an order, GameStop places a temporary authorization on your payment method. You are not fully charged until the order ships. Pre-orders are charged about 1 week before the release date.</p>
    <p class="gs-fine">By placing your order you agree to GameStop's Conditions of Use and Privacy Policy.</p>
  </aside>
</div>
<script>
(function(){
  var form=document.querySelector('.gs-checkout-form'); form.id='gs-checkout-form-id';
  var radios=form.querySelectorAll('input[name=paymentMethod]');
  var shippingPrices=${JSON.stringify(Object.fromEntries(Object.values(SHIPPING_METHODS).map(m=>[m.id,m.price])))};
  form.querySelectorAll('input[name=shippingMethod]').forEach(function(r){r.addEventListener('change',function(){var charge=shippingPrices[r.value];document.getElementById('gs-shipping-total').textContent=charge?'$'+charge.toFixed(2):'FREE';document.getElementById('gs-grand-total').textContent='$'+(${t.subtotal+t.tax}+charge).toFixed(2)})});
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
  <div class="gs-pro-upsell gs-pro-banner"><h3>Explore GameStop Pro</h3><p>Learn about member rewards and eligible merchandise benefits.</p><a class="gs-btn gs-btn-outline" href="${base}/pro/">Explore Pro benefits</a></div>
  <h1 class="gs-upper">Thank you for your order!</h1>
  <p>Your order has been received. Keep this order number for your records.</p>
  <p class="gs-order-meta"><b>Order Number:</b> <span data-order-number>${esc(order.order_number)}</span> &nbsp;&nbsp; <b>Order Date:</b> ${dateText}</p>
  <div class="gs-confirm-grid">
    <div>
      <h2>${esc(({processing:'Order processing',cancelled:'Order cancelled',return_requested:'Return requested',delivered:'Order delivered'})[orderStatus(order)] || 'Order processing')}</h2><p><a href="${base}/order/details/${order.id}">Track or manage this order</a></p>
      <table class="gs-confirm-table"><thead><tr><th>Products</th><th>Shipping Details</th></tr></thead><tbody>
      ${order.items.map((it,index) => `<tr><td>${esc(it.title)} × ${it.qty}${order.meta.items?.[index]?.options ? `<p class="gs-fine">${Object.entries(order.meta.items[index].options).map(([k,v])=>`${esc(k)}: ${esc(v)}`).join(" · ")}</p>` : ""}</td><td><b>Shipping Method</b><br>${method.name} ${money(method.price)}<br><span class="gs-fine">${esc(orderStatus(order) === 'processing' ? (order.meta.items?.[index]?.eta || order.fulfillment.eta) : orderStatus(order) === 'cancelled' ? 'Cancelled before shipment.' : orderStatus(order) === 'return_requested' ? 'Return request received.' : 'Delivery recorded.')}</span></td></tr>`).join('')}
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

export function simplePage({ title, html }) {
  return `<div class="gs-simple"><h1>${esc(title)}</h1>${html}</div>`
}
