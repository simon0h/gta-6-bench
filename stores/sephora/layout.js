import { fixtureCatalog } from '../../lib/catalog-policy.js'
import { capturedSearchProducts } from './search-reference.js'
import { esc, disclaimer } from '../../lib/html.js'
import { departments, categorySlug, products, brands } from './catalog.js'
import { productPhoto } from '../../lib/product-photos.js'
import { retailState } from '../../lib/retail-state.js'
import { isCapturedQuery } from './search-capture.js'

const icon = name => `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round">${{
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  store: '<path d="M3 10h18M5 10v11h14V10M2 10l3-7h14l3 7M9 21v-7h6v7"/>',
  services: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 2v6m10-6v6M3 11h18m-13 4h2m4 0h2m-8 3h2"/>',
  account: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="9" r="3"/><path d="M5 19c1-6 13-6 14 0"/>',
  bag: '<path d="M3 8h18l-2 13H5L3 8Zm4 0 5-6 5 6M7 12h10m-9 4h8"/>',
  heart: '<path d="M12 21 3 12C-3 5 6-2 12 6c6-8 15-1 9 6Z"/>',
  menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
  chat: '<path d="M15 5a9 9 0 1 0 4 14" stroke="#ddc5e8" stroke-width="2"/><path d="m18 2 1.5 4.5L24 8l-4.5 1.5L18 14l-1.5-4.5L12 8l4.5-1.5Z" fill="currentColor" stroke="none"/>',
}[name]}</svg>`

export function sephoraChrome({ req, base, title, body, count }) {
  const captured = req.sephoraReferenceCatalog || isCapturedQuery(req.query.keyword ?? req.query.q) || body.includes('sp-captured-detail') || req.path === '/beauty/ai-beauty-chat'
  const navigationDepartments = captured ? ['Makeup', 'Skincare', 'Fragrance', 'Hair', 'Bath & Body'] : departments.filter(category => category !== 'Sets')
  const menuBrands = fixtureCatalog ? brands : [...new Set(capturedSearchProducts.map(p => p.brand))].sort().map(name => ({ name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-') }))
  const link = (path, label) => `<a href="${base}${path}">${esc(label)}</a>`
  const selectedStore = retailState(req).preferredStore
  const stores = { 'beauty-square': 'Beauty Square', 'garden-walk': 'Garden Walk', 'coast-center': 'Coast Center' }
  const accountName = req.store.user ? `Hi, ${retailState(req).profile?.first_name || req.store.user.first_name || 'Member'}` : 'Sign In'
  const categoryMenu = category => {
    const items = products.filter(product => product.category === category)
    const types = [...new Set(items.map(product => product.type))]
    const hasMini = items.some(product => product.mini || product.variants?.some(variant => variant.options.Size?.startsWith('Mini')))
    const feature = items.find(product => product.photo)
    return `<details class="sp-menu"><summary>${esc(category)}</summary><div class="sp-menu-panel"><section class="sp-menu-types"><h2>${esc(category)}</h2>${link(`/shop/${categorySlug(category)}`, `Shop All ${category}`)}<div>${types.map(type => link(`/search?category=${encodeURIComponent(category)}&type=${encodeURIComponent(type)}`, type)).join('')}</div></section><section><h3>Discover</h3>${link(`/search?category=${encodeURIComponent(category)}&collection=new`, 'New arrivals')}${link(`/search?category=${encodeURIComponent(category)}&sort=rating`, 'Top rated')}${hasMini ? link(`/search?category=${encodeURIComponent(category)}&size=Mini`, 'Mini sizes') : ''}${link(`/search?category=${encodeURIComponent(category)}&price=50`, 'Under $50')}${link('/account/preferences', 'Your Beauty Preferences')}</section>${feature ? `<a class="sp-menu-feature" href="${base}/product/${feature.id}">${productPhoto(feature.photo, feature.title)}<strong>${esc(feature.brand)}</strong><span>${esc(feature.title)} →</span></a>` : ''}</div></details>`
  }
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)} | Sephora</title><link rel="stylesheet" href="/static/unavailable.css"><link rel="stylesheet" href="${base}/static/depth.css"><script src="${base}/static/catalog.js" defer></script></head><body class="sephora sp-depth${captured ? ' sp-captured-page' : ''}">
  <a class="skip" href="#main">Skip to content</a>
  <div class="sp-promo">${captured ? `<strong>Get 5X Points†† on Sephora Collection.</strong> Ends 10/7. ††Terms apply. ${link('/beauty-insider', 'JOIN BEAUTY INSIDER ›')}` : `<strong>Beauty for every version of you.</strong> Free standard shipping for signed-in members. ${link('/beauty-insider', 'Explore Beauty Insider →')}`}</div>
  <header class="sp-header">
    <button class="sp-shop-toggle" type="button" aria-controls="sp-shop-nav" aria-expanded="false" aria-label="Open shopping menu">${icon('menu')}</button>
    <a class="sp-logo" href="${base}/" aria-label="Sephora home">SEPHORA</a>
    <form class="sp-search" action="${base}/search" role="search"><label class="sr-only" for="sp-search">Search beauty products</label><input id="sp-search" name="keyword" type="search" autocomplete="off" value="${esc(typeof (req.query.keyword ?? req.query.q) === 'string' ? (req.query.keyword ?? req.query.q) : '')}" placeholder="Search" aria-controls="sp-suggestions" aria-expanded="false"><button aria-label="Search">${icon('search')}</button><div id="sp-suggestions" class="sp-suggestions"><strong>Popular searches</strong>${['lip oil', 'face wash', 'mini', 'fragrance'].map(q => link(`/search?q=${encodeURIComponent(q)}`, q)).join('')}</div></form>
    ${captured ? `<a class="sp-ai-chat" href="${base}/beauty/ai-beauty-chat">${icon('chat')}<span>AI Beauty<br>Chat <small>NEW</small></span></a>` : ''}
    <div class="sp-header-links"><a href="${base}/stores">${icon('store')}<span>${captured ? 'Shop Store & Delivery' : 'Stores & Delivery'}<small>${esc(stores[selectedStore] || (req.store.location ? `ZIP ${req.store.location}` : captured ? 'BURLINGAME · 94010' : 'Choose a store'))}</small></span></a><a href="${base}/services">${icon('services')}<span>Services<br>& Events</span></a></div>
    <a class="sp-account-link" href="${base}/account" aria-label="${esc(accountName)}">${icon('account')}<span>${esc(accountName)}<small>for FREE Shipping</small></span></a>
    <a class="sp-love" href="${base}/favorites" aria-label="Loves">${icon('heart')}</a><a class="sp-basket" href="${base}/cart" aria-label="Basket (${count})">${icon('bag')}<span${captured ? ' class="sr-only"' : ''}>Basket <strong>(${count})</strong></span></a>
  </header>
  <nav id="sp-shop-nav" class="sp-nav" aria-label="Shop categories">
    ${link('/beauty/new', 'New')}${link('/beauty/under-50', 'Must Haves Under $50')}${navigationDepartments.map(categoryMenu).join('')}${link('/shop/mini-size', 'Mini Size')}
    <details class="sp-menu"><summary>Brands</summary><div class="sp-menu-panel sp-brands-menu"><section><h2>Brands A–Z</h2>${link('/brands-list', 'Explore all brands')}</section><section>${menuBrands.map(brand => link(`/brand/${brand.slug}`, brand.name)).join('')}</section></div></details>
    ${link('/shop/gifts', 'Gifts & Value Sets')}${link('/gift-cards', 'Gift Cards')}${link('/beauty/offers', 'Sale & Offers')}
    <div class="sp-mobile-utilities">${link('/account', accountName)}${link('/stores', 'Stores & Delivery')}${link('/services', 'Services & Events')}${link('/beauty-insider', 'Beauty Insider')}${link('/help', 'Customer Service')}</div>
  </nav>
  <main id="main">${body}</main>
  <section class="sp-footer-promo"><strong>Find your next favorite.</strong><span>Beauty discovery starts here.</span>${link('/search', 'Explore all beauty →')}</section>
  <footer class="sp-footer"><div class="sp-footer-grid"><section><h2>About Sephora</h2>${link('/brands-list', 'Our beauty collections')}${link('/services', 'Services & Events')}${link('/stores', 'Stores & Delivery')}${link('/gift-cards', 'Gift Cards')}</section><section><h2>My Sephora</h2>${link('/account', 'Sign In / My Account')}${link('/favorites', 'Loves')}${link('/recently-viewed', 'Recently Viewed')}${link('/account/preferences', 'Beauty Preferences')}${link('/orders', 'My Orders')}${link('/account/replenishment', 'Auto-Replenish')}${link('/beauty-insider', 'Beauty Insider')}${link('/cart', 'Basket')}</section><section><h2>Help & Information</h2>${link('/help', 'Customer Service')}${link('/help/topic/shipping', 'Shipping Information')}${link('/help/topic/returns', 'Returns & Exchanges')}${link('/location', 'Delivery ZIP Code')}</section><section><h2>Shop Beauty</h2>${departments.map(category => link(`/shop/${categorySlug(category)}`, category)).join('')}</section></div><p>United States · English · USD</p>${disclaimer('Sephora').replace('pre-order flow', 'shopping experience')}<p class="sp-provenance">${captured ? 'Search results and product photography were captured from the public Sephora website on October 6, 2026. Product-detail and inventory coverage is limited to the captured search information.' : 'Product names, beauty collections and inventory are original examples. Product images illustrate formats and are not official branded packaging.'}</p></footer></body></html>`
}
