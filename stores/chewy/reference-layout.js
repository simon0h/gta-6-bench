// Reference-mode chrome for the Chewy clone: header, mega menu and footer
// modelled on www.chewy.com (captured 2026-10-13). Fixture mode keeps layout.js.
import { esc, disclaimer } from '../../lib/html.js'
import { TOP_NAV, FOOTER, LEGAL } from './reference-data.js'

export const PHONE = '1-800-672-4399'
const icon = {
  search: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M15.5 15.5 21 21" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
  user: '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><circle cx="12" cy="8" r="4.2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M4 21c.8-4.4 4-6.6 8-6.6s7.2 2.2 8 6.6" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
  cart: '<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path d="M2 3h3l2.6 12.2a1.6 1.6 0 0 0 1.6 1.3h8.7a1.6 1.6 0 0 0 1.6-1.2L21.5 7H6.2" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="9.5" cy="20.5" r="1.5" fill="currentColor"/><circle cx="17.5" cy="20.5" r="1.5" fill="currentColor"/></svg>',
  phone: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M6.6 3.5 9 3l1.6 4.4-2 1.4a12 12 0 0 0 6.6 6.6l1.4-2L21 15l-.5 2.4A2.6 2.6 0 0 1 18 19.5C10.5 19.5 4.5 13.5 4.5 6a2.6 2.6 0 0 1 2.1-2.5Z" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/></svg>',
  chevron: '<svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true"><path d="m2 4 4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
}
export const paw = (size = 54) => `<svg viewBox="0 0 64 64" width="${size}" height="${size}" aria-hidden="true"><g fill="currentColor"><ellipse cx="32" cy="42" rx="13" ry="11"/><ellipse cx="16" cy="28" rx="6" ry="7.5"/><ellipse cx="48" cy="28" rx="6" ry="7.5"/><ellipse cx="25" cy="16" rx="5.5" ry="7.5"/><ellipse cx="39" cy="16" rx="5.5" ry="7.5"/></g></svg>`

function flyout(item, base) {
  if (item.menu) return `<div class="cw-flyout cw-flyout-wide"><div class="cw-flyout-grid">${item.menu.map(group => `<section><h3><a href="${base}${group.path}">${esc(group.label)}</a></h3><ul>${group.items.map(i => `<li><a href="${base}${i.path}">${esc(i.label)}</a></li>`).join('')}</ul></section>`).join('')}${['Dog', 'Cat'].includes(item.label) ? `<section class="cw-flyout-extra"><h3>More for ${esc(item.label.toLowerCase())}s</h3><ul><li><a href="${base}/chewy-egift-card/dp/226306">Gift Cards</a></li><li><a href="${base}/deals/todays-deals-2723">${esc(item.label)} Deals</a></li><li><a href="${base}/b/new-arrivals-14264">New Arrivals</a></li><li><a href="${base}/brands">Popular Brands</a></li></ul></section>` : ''}</div></div>`
  if (item.links) return `<div class="cw-flyout"><ul>${item.links.map(l => `<li><a href="${base}${l.path}">${esc(l.label)}</a>${l.text ? `<small>${esc(l.text)}</small>` : ''}</li>`).join('')}</ul></div>`
  return ''
}

export function chewyReferenceChrome({ req, base, title, body, count = 0 }) {
  const user = req.store?.user
  const q = typeof req.query?.query === 'string' ? req.query.query : typeof req.query?.q === 'string' ? req.query.q : ''
  const account = user
    ? `<a class="cw-account" href="${base}/app/account">${icon.user}<span><small>Hi, ${esc(user.first_name || 'friend')}</small>Account</span></a>`
    : `<a class="cw-account" href="${base}/app/login">${icon.user}<span><small>Account</small>Sign In or Create Account</span></a>`
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)} | Chewy</title><meta name="description" content="Chewy has the best pet supplies and the best customer service."><link rel="stylesheet" href="${base}/static/reference.css"></head><body class="cw">
<a class="cw-skip" href="#search">Skip to search</a><a class="cw-skip" href="#page-content">Skip to main content</a>
<header class="cw-header">
 <div class="cw-masthead">
  <a class="cw-logo" href="${base}/" aria-label="Chewy home">chewy</a>
  <form class="cw-search" action="${base}/s" method="get" role="search"><label class="cw-sr" for="search">Search</label><input id="search" type="search" name="query" value="${esc(q)}" placeholder="Search" autocomplete="off"><button type="submit" aria-label="Search">${icon.search}</button></form>
  <nav class="cw-utility" aria-label="Account and help">
   <a class="cw-app-link" href="${base}/mobile-app">Use App</a>
   <a class="cw-help" href="${base}/customer-care">${icon.phone}<span><small>24/7 Help</small>${PHONE}</span></a>
   ${account}
   <a class="cw-cart" href="${base}/app/cart" aria-label="Cart, ${count} items">${icon.cart}<span class="cw-cart-count">${count}</span><span class="cw-cart-label">Cart</span></a>
  </nav>
 </div>
 <nav class="cw-nav" aria-label="Shop by pet and service"><ul>${TOP_NAV.map(item => `<li class="cw-nav-item${item.menu || item.links ? ' has-menu' : ''}"><a href="${base}${item.path}">${esc(item.label)}${item.menu || item.links ? icon.chevron : ''}</a>${flyout(item, base)}</li>`).join('')}</ul></nav>
</header>
<a class="cw-promo" href="${base}/deals/todays-deals-2723"><strong>Free $25 eGift card</strong> with your $49+ order <span>Shop now</span> <small>New customers only. Exclusions apply.</small></a>
<main id="page-content">${body}</main>
<footer class="cw-footer">
 <section class="cw-app-band"><div><h2>Get the Chewy app</h2><p>Manage Autoship, track orders, refill prescriptions and chat with a vet from your phone.</p></div><a class="cw-btn cw-btn-light" href="${base}/mobile-app">Use App</a></section>
 <section class="cw-help-band"><h2>Get help from our experts 24/7</h2><a href="${base}/customer-care">${icon.phone} ${PHONE}</a><a href="${base}/customer-care#chat">Chat</a></section>
 <div class="cw-footer-cols">${FOOTER.map(col => `<section><h2>${esc(col.heading)}</h2><ul>${col.links.map(([l, p]) => `<li><a href="${base}${p}">${esc(l)}</a></li>`).join('')}</ul></section>`).join('')}</div>
 <div class="cw-legal"><p class="cw-logo cw-logo-small">chewy</p><ul>${LEGAL.map(([l, p]) => `<li><a href="${base}${p}">${esc(l)}</a></li>`).join('')}</ul><p>Copyright © 2026 Chewy, Inc.</p></div>
 ${disclaimer('Chewy').replace('pre-order flow', 'shopping experience')}
</footer></body></html>`
}
