// Reference-mode Sephora site: chrome (header, department menu, footer) and the non-product
// pages of sephora.com. Product grids only ever show the captured public search cards
// (search-reference.js); everything else reproduces page structure and copy, never stock.
import { esc, disclaimer } from '../../lib/html.js'
import { authenticate, createAccount, publicAccount } from '../../lib/accounts.js'
import { capturedSearchProducts } from './search-reference.js'
import { isCapturedQuery } from './search-capture.js'
import { CATEGORIES, DEPARTMENTS, NAV, FOOTER, LEGAL, HELP_TOPICS, INFO, QUICK_LINKS, FILTERS } from './site-data.js'

export const brandSlug = name => name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
const BRANDS = [...new Set(capturedSearchProducts.map(p => p.brand))].sort((a, b) => a.localeCompare(b)).map(name => ({ name, slug: brandSlug(name) }))
const EXTRA_BRANDS = { 'sephora-collection': 'SEPHORA COLLECTION', kayali: 'KAYALI' }

const icon = name => `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round">${{
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  store: '<path d="M3 10h18M5 10v11h14V10M2 10l3-7h14l3 7M9 21v-7h6v7"/>',
  services: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 2v6m10-6v6M3 11h18m-13 4h2m4 0h2m-8 3h2"/>',
  account: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="9" r="3"/><path d="M5 19c1-6 13-6 14 0"/>',
  bag: '<path d="M3 8h18l-2 13H5L3 8Zm4 0 5-6 5 6M7 12h10m-9 4h8"/>',
  heart: '<path d="M12 21 3 12C-3 5 6-2 12 6c6-8 15-1 9 6Z"/>',
  chat: '<path d="M15 5a9 9 0 1 0 4 14" stroke="#ddc5e8" stroke-width="2"/><path d="m18 2 1.5 4.5L24 8l-4.5 1.5L18 14l-1.5-4.5L12 8l4.5-1.5Z" fill="currentColor" stroke="none"/>',
  phone: '<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M11 18h2"/>',
  card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
  help: '<path d="M4 12a8 8 0 1 1 3 6.2L3 20l1.3-3.6A8 8 0 0 1 4 12Z"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.3 2.4c-.6.2-.8.6-.8 1.1v.5M12 16v.1"/>',
}[name]}</svg>`

const a = (base, path, label, cls = '') => `<a${cls ? ` class="${cls}"` : ''} href="${esc(base + path)}">${esc(label)}</a>`

export function siteChrome({ req, base, title, body }) {
  const user = req.store?.user
  const accountName = user ? `Hi, ${user.first_name || 'Beautiful'}` : 'Sign In'
  const query = req.query?.keyword ?? req.query?.q
  const mega = (label, path, slug) => {
    const dept = slug && DEPARTMENTS[slug]
    if (!dept) return `<div class="sx-dept">${a(base, path, label)}</div>`
    return `<div class="sx-dept">${a(base, path, label)}<div class="sx-mega"><section><h2>${esc(dept.title)}</h2>${a(base, path, `Shop All ${dept.title}`, 'sx-strong')}${dept.subs.map(([l, s]) => a(base, `/shop/${s}`, l)).join('')}</section><section><h3>Discover</h3>${dept.quick.map(qk => a(base, QUICK_LINKS[qk] || path, qk)).join('')}</section><section class="sx-mega-promo"><p>Only at Sephora</p><strong>${esc(dept.title)} favorites</strong>${a(base, path, 'SHOP NOW ▸')}</section></div></div>`
  }
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)} | Sephora</title><link rel="stylesheet" href="/static/unavailable.css"><link rel="stylesheet" href="${base}/static/depth.css"><link rel="stylesheet" href="${base}/static/site.css"><script src="${base}/static/catalog.js" defer></script></head><body class="sephora sp-depth sp-captured-page sx">
  <a class="skip" href="#main">Skip to content</a>
  <div class="sp-promo sx-promo"><strong>Get 5X Points†† on Sephora Collection.</strong> Ends 10/7. ††Terms apply. ${a(base, '/profile/BeautyInsider', 'JOIN BEAUTY INSIDER ›')}</div>
  <header class="sp-header sx-header">
    <a class="sp-logo" href="${base}/" aria-label="Sephora home">SEPHORA</a>
    <form class="sp-search" action="${base}/search" role="search"><label class="sr-only" for="sp-search">Search</label><input id="sp-search" name="keyword" type="search" autocomplete="off" value="${esc(typeof query === 'string' ? query : '')}" placeholder="Search"><button aria-label="Search">${icon('search')}</button></form>
    <a class="sp-ai-chat" href="${base}/beauty/ai-beauty-chat">${icon('chat')}<span>AI Beauty<br>Chat <small>NEW</small></span></a>
    <div class="sp-header-links"><a href="${base}/happening/stores/sephora-near-me">${icon('store')}<span>Shop Store & Delivery<small>${esc(req.store?.location ? `ZIP ${req.store.location}` : 'Choose your store & location')}</small></span></a><a href="${base}/happening/home">${icon('services')}<span>Services & Events</span></a></div>
    <a class="sp-account-link" href="${base}/profile/MyAccount">${icon('account')}<span>${esc(accountName)}<small>for FREE Shipping</small></span></a>
    <a class="sp-love" href="${base}/profile/Lists" aria-label="Lists">${icon('heart')}</a><a class="sp-basket" href="${base}/basket" aria-label="Basket">${icon('bag')}<span class="sr-only">Basket</span></a>
  </header>
  <nav id="sp-shop-nav" class="sx-nav" aria-label="Shop">${NAV.map(([l, p, s]) => mega(l, p, s)).join('')}</nav>
  <nav class="sx-utility" aria-label="Quick links">${a(base, '/', 'Home')}${a(base, '/beauty/beauty-offers', 'Offers')}${a(base, '/happening/stores/sephora-near-me', 'My Store')}${a(base, '/beauty/new-beauty-products', 'New')}${a(base, '/beauty/ai-beauty-chat', 'AI Beauty')}</nav>
  <main id="main">${body}</main>
  <footer class="sx-footer">
    <div class="sx-footer-features">
      <a href="${base}/happening/stores/sephora-near-me">${icon('store')}<span><strong>Find a Store</strong>Choose Your Store</span></a>
      <a href="${base}/beauty/customer-service">${icon('help')}<span><strong>Customer Service</strong>Chat is available</span></a>
      <a href="${base}/beauty/mobile">${icon('phone')}<span><strong>Get the App</strong>Text "APP" to 36681</span></a>
      <a href="${base}/beauty/credit-card">${icon('card')}<span><strong>Sephora Credit Card Program</strong>Want 25% off your Sephora purchase? DETAILS</span></a>
    </div>
    <div class="sx-footer-grid">
      ${FOOTER.map(([h, links]) => `<section><h2>${esc(h)}</h2>${links.map(([l, p]) => a(base, p, l)).join('')}</section>`).join('')}
      <section class="sx-footer-signup"><h2>We Belong to Something Beautiful</h2><form action="${base}/email-signup" method="get"><label for="sx-email">Sign up for Sephora Emails</label><div><input id="sx-email" name="email" type="email" autocomplete="email" placeholder="Enter your email address" required><button>Sign Up</button></div></form><p>Region &amp; Language: United States – English</p></section>
    </div>
    <div class="sx-legal"><p>© 2026 Sephora USA, Inc. All rights reserved.</p><nav aria-label="Legal">${LEGAL.map(([l, p]) => a(base, p, l)).join('')}</nav><p>1-877-SEPHORA (1-877-737-4672)</p></div>
    ${disclaimer('Sephora').replace('pre-order flow', 'shopping experience')}
    <p class="sp-provenance">Page structure and copy follow sephora.com as observed on October 13, 2026. Product cards are limited to the public search results captured on October 6, 2026; stock and purchase options are not verified.</p>
  </footer></body></html>`
}

// ---------- shared fragments ----------
const crumbs = (base, trail) => `<nav class="sx-crumbs" aria-label="Breadcrumb">${trail.map(([l, p], i) => i === trail.length - 1 || !p ? `<span>${esc(l)}</span>` : a(base, p, l)).join('<span aria-hidden="true">›</span>')}</nav>`
const stars = p => p.rating ? `<span class="sx-stars" aria-label="${p.rating} stars"><span style="width:${p.ratingPercent}%"></span></span> <span class="sx-reviews">${esc(p.reviewDisplay)}</span>` : ''
export const card = (base, p) => `<article class="sx-card" data-product-id="${esc(p.id)}" data-purchase-evidence="unverified"><a href="${esc(base + p.path)}"><span class="sx-card-img"><img src="${esc(p.image)}" alt="${esc(p.alt)}" loading="lazy"></span>${p.badge ? `<span class="sx-badge">${esc(p.badge)}</span>` : ''}<strong>${esc(p.brand)}</strong><span class="sx-card-title">${esc(p.title)}</span></a><span class="sx-card-rating">${stars(p)}</span><span class="sx-card-price">${esc(p.priceDisplay)}</span></article>`
const row = (base, title, products, more, attrs = '') => `<section class="sx-row"${attrs}><div class="sx-row-head"><h2>${esc(title)}</h2>${more ? a(base, more[1], more[0]) : ''}</div><div class="sx-carousel">${products.map(p => card(base, p)).join('')}</div></section>`
const notCaptured = (base, what) => `<div class="sx-empty"><p class="sx-count">Product listings not captured</p><p>${esc(what)} products are not part of this replica's captured inventory, so no product grid is shown. This is not a zero-result page from Sephora.</p><p>${a(base, '/search?keyword=gta%206', 'View captured search results', 'sx-btn sx-btn-outline')}</p></div>`
const infoNav = base => `<aside class="sx-side"><h2>${a(base, '/beauty/customer-service', 'Customer Service')}</h2>${HELP_TOPICS.map(([h, items]) => `<h3>${esc(h)}</h3>${items.map(([l, s]) => a(base, `/beauty/${s}`, l)).join('')}`).join('')}</aside>`

// ---------- pages ----------
const SLIDES = [
  ['ONLY AT SEPHORA', 'Just In: KAYALI Body Care', 'Hydrate with body creams and lip balms in marshmallow and pistachio scents.', '/brand/kayali', 'sx-s1'],
  ['ONLY AT SEPHORA', 'New KAYALI Fragrance', 'BOUJEE KITTY CARAMEL MILK, ft. white chocolate and soft musk.', '/brand/kayali', 'sx-s2'],
  ['', 'Top Complexion Picks—Only at Sephora', 'Exclusives hit different.', '/shop/foundation-makeup', 'sx-s3'],
  ['CLEAN AT SEPHORA', 'Oil-Balancing Hydration', 'These blemish-safe moisturizers won’t clog pores.', '/shop/moisturizing-cream-oils-mists', 'sx-s4'],
  ['', 'New K18 Longevity Scalp Serum', 'Retain up to 19,000 more hairs and 70% fewer grays* with this formula. *After 3 months of nightly use.', capturedSearchProducts.find(p => p.id === 'P525639')?.path || '/brand/k18-biomimetic-hairscience', 'sx-s5'],
]
export function homePage(base, req) {
  const user = req.store?.user
  const hour = new Date().getHours()
  const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const ps = capturedSearchProducts
  const tiles = [['Makeup', 'makeup-cosmetics'], ['Skincare', 'skincare'], ['Hair', 'hair-products'], ['Fragrance', 'fragrance'], ['Bath & Body', 'bath-body'], ['Tools & Brushes', 'makeup-tools'], ['Mini Size', 'travel-size-toiletries'], ['Gifts', 'gifts']]
  return `<h1 class="sr-only">Sephora Homepage</h1>
  <section class="sx-greeting"><p><strong>${greet}, ${esc(user?.first_name || 'Beautiful')}. ☀️</strong> ${user ? `You're signed in. ${a(base, '/profile/BeautyInsider', 'View your Beauty Insider benefits ▸')}` : `Join Beauty Insider to earn points with every purchase. ${a(base, '/login', 'Sign In')} ${a(base, '/registration', 'Create Account')}`}</p></section>
  <section class="sx-hero" aria-label="Featured">${SLIDES.map(([tag, h, t, p, cls]) => `<a class="sx-slide ${cls}" href="${esc(base + p)}"><span class="sx-slide-art" aria-hidden="true"></span><span class="sx-slide-copy">${tag ? `<small>${esc(tag)}</small>` : ''}<strong>${esc(h)}</strong><span>${esc(t)}</span><em>SHOP NOW ▸</em></span></a>`).join('')}</section>
  ${row(base, 'Chosen For You', ps.slice(0, 12), ['Show more', '/search?keyword=gta%206'], ' data-reference-state="catalog"')}
  <section class="sx-row"><div class="sx-row-head"><h2>Shop by Category</h2></div><div class="sx-cats">${tiles.map(([l, s], i) => `<a href="${base}/shop/${s}"><span class="sx-cat-dot sx-c${i}" aria-hidden="true"></span>${esc(l)}</a>`).join('')}</div></section>
  ${row(base, 'New Arrivals', ps.filter(p => p.badge === 'NEW').slice(0, 12), ['Show more', '/beauty/new-beauty-products'])}
  <section class="sx-row"><div class="sx-row-head"><h2>Beauty Offers</h2>${a(base, '/beauty/beauty-offers', 'See all')}</div><div class="sx-offers">
    <a href="${base}/beauty/beauty-offers"><small>BEAUTY INSIDER</small><strong>Get 5X Points on Sephora Collection</strong><span>Ends 10/7. Terms apply.</span><em>SHOP NOW ▸</em></a>
    <a href="${base}/rewards"><small>REWARDS BAZAAR</small><strong>Redeem your points</strong><span>Deluxe samples, minis and experiences.</span><em>REDEEM NOW ▸</em></a>
    <a href="${base}/beauty/free-beauty-samples"><small>SAMPLES</small><strong>Free samples with every order</strong><span>Choose two free samples at checkout.</span><em>LEARN MORE ▸</em></a>
    <a href="${base}/sale"><small>SALE</small><strong>Sale</strong><span>Shop limited-time markdowns.</span><em>SHOP NOW ▸</em></a></div></section>
  ${row(base, 'Selling Fast', ps.filter(p => /K$/.test(String(p.reviews))).slice(0, 12), ['Show more', '/beauty/best-selling-beauty'])}
  <section class="sx-promos">
    <a class="sx-bi" href="${base}/profile/BeautyInsider"><small>Beauty Insider</small><strong>Earn points. Get rewards.</strong><span>Join for free and redeem points in the Rewards Bazaar, plus get a birthday gift and free standard shipping.</span><em>JOIN NOW ▸</em></a>
    <a class="sx-cc" href="${base}/beauty/credit-card"><small>Sephora Credit Card</small><strong>Want 25% off your Sephora purchase?</strong><span>Apply for the Sephora Credit Card and get 25% off your first purchase when approved.</span><em>DETAILS ▸</em></a>
    <a class="sx-app" href="${base}/beauty/mobile"><small>Get the App</small><strong>Shop, earn and redeem on the go</strong><span>Scan products in store and track orders in the Sephora app.</span><em>DOWNLOAD NOW ▸</em></a>
  </section>
  <section class="sx-row sx-feature"><div class="sx-row-head"><h2>Featured</h2></div><div class="sx-offers">
    <a href="${base}/happening/home"><small>SERVICES &amp; EVENTS</small><strong>Book a beauty service</strong><span>Makeup, skincare and brow services in store.</span><em>BOOK NOW ▸</em></a>
    <a href="${base}/beauty/quizzes-buying-guides"><small>QUIZ &amp; BUYING GUIDES</small><strong>Find your match</strong><span>Foundation, fragrance and skincare quizzes.</span><em>TAKE THE QUIZ ▸</em></a>
    <a href="${base}/beauty/giftcards"><small>GIFT CARDS</small><strong>Give the gift of beauty</strong><span>Physical and digital gift cards.</span><em>SHOP NOW ▸</em></a>
    <a href="${base}/beauty/clean-beauty"><small>CLEAN AT SEPHORA</small><strong>Clean beauty</strong><span>Formulated without restricted ingredients.</span><em>SHOP NOW ▸</em></a></div></section>`
}

export function categoryPage(base, cat, query) {
  const parent = cat.parent && CATEGORIES[cat.parent]
  const top = cat.top ? cat : parent
  const subs = cat.top ? cat.subs : (parent?.subs || [])
  const trail = [['Home', '/'], ...(cat.slug === 'fragrance' ? [] : [['Shop', null]]), ...(parent ? [[parent.title, `/shop/${parent.slug}`]] : []), [cat.title]]
  const sort = typeof query.sortBy === 'string' ? query.sortBy : ''
  return `${crumbs(base, trail)}<div class="sx-cat-layout"><aside class="sx-side"><h2>${top ? a(base, `/shop/${top.slug}`, top.title) : esc(cat.title)}</h2>${subs.map(([l, s, n]) => s === cat.slug ? `<strong>${esc(l)}</strong>` : a(base, `/shop/${s}`, n ? `${l} (${n})` : l)).join('')}<h3>Filters</h3>${FILTERS.map(f => `<details><summary>${esc(f)}</summary><p>Filter options appear with captured products.</p></details>`).join('')}</aside>
  <div class="sx-cat-main"><h1>${esc(cat.title)}</h1>${cat.intro ? `<p class="sx-intro">${esc(cat.intro)}</p>` : ''}${cat.quick ? `<div class="sx-pills">${cat.quick.map(qk => a(base, QUICK_LINKS[qk] || `/shop/${cat.slug}`, qk)).join('')}</div>` : ''}
  <div class="sx-banner"><small>ONLY AT SEPHORA</small><strong>Discover ${esc(cat.title)}</strong><span>New and bestselling picks, plus Beauty Insider offers.</span></div>
  <div class="sx-toolbar"><p class="sx-count">Product results not captured</p><form action="${base}/shop/${cat.slug}" method="get"><label for="sx-sort">Sort by:</label><select id="sx-sort" name="sortBy">${[['', 'Relevance'], ['BEST_SELLING', 'Bestselling'], ['RATING', 'Top Rated'], ['EXCLUSIVE', 'Exclusive'], ['NEW', 'New'], ['PRICE_LOW_TO_HIGH', 'Price Low to High'], ['PRICE_HIGH_TO_LOW', 'Price High to Low']].map(([v, l]) => `<option value="${v}"${sort === v ? ' selected' : ''}>${l}</option>`).join('')}</select><button class="sx-btn sx-btn-small">Apply</button></form></div>
  <div class="sx-chips">${['In Store', 'Fast Delivery', 'Price Range', 'Brand', 'Rating', 'New', 'Sale'].map(f => `<span>${esc(f)} ⌄</span>`).join('')}</div>
  ${notCaptured(base, cat.title)}
  ${subs.length ? `<section class="sx-browse"><h2>Browse More in ${esc(top?.title || cat.title)}</h2><div class="sx-tiles">${subs.map(([l, s, n]) => `<a href="${base}/shop/${s}"><strong>${esc(l)}</strong>${n ? `<span>${n} products</span>` : ''}</a>`).join('')}</div></section>` : ''}
  ${cat.related?.length ? `<section class="sx-related"><h2>Related Content:</h2>${cat.related.map(([l, s]) => a(base, `/shop/${s}`, l)).join('')}</section>` : ''}</div></div>`
}

export function infoPage(base, slug) {
  const [h1, intro, sections] = INFO[slug]
  return `${crumbs(base, [['Home', '/'], ['Customer Service', '/beauty/customer-service'], [h1]])}<div class="sx-info-layout">${infoNav(base)}<article class="sx-article"><h1>${esc(h1)}</h1><p class="sx-intro">${esc(intro)}</p>${sections.map(([h, t]) => `<section><h2>${esc(h)}</h2><p>${esc(t)}</p></section>`).join('')}<section class="sx-related"><h2>Related Content:</h2>${a(base, '/beauty/order-status', 'Order Status & History')}${a(base, '/beauty/contact-us', 'Contact Customer Service')}${a(base, '/beauty/billing', 'Billing, Canceling & Modifying Orders')}</section></article></div>`
}

export function customerServicePage(base) {
  const popular = [['Billing, Canceling & Modifying Orders', 'billing'], ['Order Status & History', 'order-status'], ['Payment Methods', 'payment-methods'], ['Returns & Exchanges', 'returns-exchanges'], ['Shipping Information', 'shipping-information'], ['Account Registration, Sign In & Password', 'registration-sign-in'], ['Beauty Insider FAQs', 'loyalty-program'], ['Gift Cards & eGift Cards FAQs', 'faqs-gift-cards']]
  return `${crumbs(base, [['Home', '/'], ['Customer Service']])}<h1>Sephora Customer Service</h1><section><h2 class="sr-only">Sephora Customer Service</h2><p class="sx-intro">How can we help? Find answers below or contact a Beauty Advisor.</p></section>
  <section><h2>Popular Topics</h2><div class="sx-tiles">${popular.map(([l, s]) => `<a href="${base}/beauty/${s}"><strong>${esc(l)}</strong></a>`).join('')}</div></section>
  <div class="sx-two"><section class="sx-panel"><h2>Chat with Us</h2><p>Chat with a Beauty Advisor Monday–Friday 5am–9pm PT, Saturday–Sunday 6am–9pm PT.</p>${a(base, '/beauty/contact-us', 'Customer Service', 'sx-btn')}</section><section class="sx-panel"><h2>Call Us</h2><p><a href="tel:1-877-737-4672">1-877-SEPHORA (1-877-737-4672)</a></p><p>TTY: see ${a(base, '/beauty/accessibility', 'Accessibility')}</p></section></div>
  <section><h3>All Topics</h3><div class="sx-topics">${HELP_TOPICS.map(([h, items]) => `<div><h4>${esc(h)}</h4>${items.map(([l, s]) => a(base, `/beauty/${s}`, l)).join('')}</div>`).join('')}</div></section>`
}

export function giftCardsPage(base, notice) {
  const designs = ['Hello, fall', 'Happy Birthday', 'To the Birthday Queen', 'Self-Care Club', "You're the Best", 'Keep Sparkling']
  return `${crumbs(base, [['Home', '/'], ['Gift Cards']])}<h1>Gift Cards</h1><p class="sx-intro">Give the gift of beauty. Sephora gift cards can be used in stores, online and at Sephora at Kohl's, with no fees and no expiration date.</p>
  <div class="sx-pills">${a(base, '/beauty/giftcards#physical', 'Buy Physical Gift Cards ▸')}${a(base, '/beauty/giftcards#digital', 'Buy Digital Gift Cards ▸')}${a(base, '/beauty/giftcards#corporate', 'Corporate Gift Cards ▸')}${a(base, '/beauty/giftcards#balance', 'Check Balance ▸')}</div>
  <section id="digital"><h2>Shop Featured Digital Gift Cards</h2><div class="sx-gc-grid">${designs.slice(0, 4).map((d, i) => `<div class="sx-gc sx-g${i}"><span>SEPHORA</span><strong>${esc(d)}</strong></div>`).join('')}</div><p class="sx-note">Digital gift cards are sold through Sephora's gift card partner; purchase is not available in this replica.</p></section>
  <section><h2>Shop Most Loved Digital Gift Cards</h2><div class="sx-gc-grid">${designs.slice(1, 5).map((d, i) => `<div class="sx-gc sx-g${i + 2}"><span>SEPHORA</span><strong>${esc(d)}</strong></div>`).join('')}</div></section>
  <section id="physical"><h2>Shop Physical Gift Cards</h2><div class="sx-gc-grid">${['Sephora Stripe Gift Card', 'Happy Birthday Gift Card', 'Thank You Gift Card', 'Celebrations Gift Card'].map((d, i) => `<div class="sx-gc sx-g${i}"><span>SEPHORA COLLECTION</span><strong>${esc(d)}</strong></div>`).join('')}</div><p class="sx-note">Physical gift card listings were not captured, so they are shown without purchase options.</p></section>
  <section id="balance" class="sx-panel"><h2>Check Balance &amp; Add to Wallet</h2>${notice ? `<p class="sx-alert" role="status">${esc(notice)}</p>` : ''}<form class="sx-form" action="${base}/beauty/giftcards" method="get"><input type="hidden" name="check" value="1"><label for="gc-number">Gift Card Number</label><input id="gc-number" name="card" inputmode="numeric" autocomplete="off" required><label for="gc-pin">PIN</label><input id="gc-pin" name="pin" inputmode="numeric" autocomplete="off" required><button class="sx-btn">Check Balance</button></form></section>
  <section><h2>Frequently Asked Questions</h2><p>Gift cards have no fees and do not expire. Check a balance with the 16-digit card number and PIN, or call 1-888-860-7897.</p>${a(base, '/beauty/faqs-gift-cards', 'READ OUR FAQS ▸')}</section>
  <section id="corporate"><h2>Corporate Gift Cards</h2><p>Corporate buyers get free shipping, and bulk discounts start at $5,000.</p></section>`
}

export function offersPage(base) {
  const soft = [['Sale', '/sale'], ['Rewards Bazaar', '/rewards'], ['Samples', '/beauty/free-beauty-samples'], ['Value Sets', '/shop/value-sets'], ['Mini Size', '/shop/travel-size-toiletries'], ['Jumbo Size', '/beauty/supersized-beauty-products'], ['Sephora Collection', '/brand/sephora-collection']]
  return `${crumbs(base, [['Home', '/'], ['Beauty Offers']])}<h1>Beauty Offers</h1><div class="sx-pills">${soft.map(([l, p]) => a(base, p, l)).join('')}</div>
  <section class="sx-panel sx-bi-panel"><h2>Get Your Beauty Insider Exclusive Offers 👋</h2><p>Sign in or join Beauty Insider to see offers picked for you, including birthday gifts and point multipliers.</p>${a(base, '/login', 'Sign In', 'sx-btn')} ${a(base, '/registration', 'Create Account', 'sx-btn sx-btn-outline')}</section>
  <section><h2>Explore Value</h2><div class="sx-tiles">${soft.map(([l, p]) => `<a href="${esc(base + p)}"><strong>${esc(l)}</strong></a>`).join('')}</div></section>
  <section class="sx-related"><h2>Related Content:</h2>${a(base, '/beauty/affiliates', 'Beauty Affiliate Program')}${a(base, '/sale', 'Sephora Sale 2026')}${a(base, '/beauty/free-beauty-samples', 'Sephora Promo 2026')}</section>`
}

export function storeLocatorPage(base, zip) {
  return `${crumbs(base, [['Home', '/'], ['Stores']])}<h1>Find a Sephora</h1><form class="sx-form sx-inline" action="${base}/happening/stores/sephora-near-me" method="get"><label for="store-q">City, state or ZIP code</label><input id="store-q" name="location" value="${esc(zip || '')}" autocomplete="postal-code" required><button class="sx-btn">Search</button></form>
  ${zip ? `<div class="sx-empty"><p class="sx-count">Stores near ${esc(zip)}</p><p>Store locations and hours were not captured for this replica, so no store list is shown. This is not a "no stores found" result from Sephora.</p></div>` : '<p class="sx-intro">Enter a location to find Sephora stores, store hours and Buy Online &amp; Pick Up availability.</p>'}
  <section class="sx-panel"><h2>Services and Events at Sephora</h2><p>Book complimentary and paid makeup, skincare and brow services, and join in-store events.</p>${a(base, '/happening/home', 'Explore Services and Events', 'sx-btn')}</section>
  <section><h2>Delivery location</h2><p>Set a ZIP code to see delivery options. ${a(base, '/location', 'Set delivery ZIP code')}</p></section>`
}

export function servicesPage(base, h1, intro) {
  return `${crumbs(base, [['Home', '/'], ['Services & Events', '/happening/home'], [h1]])}<h1>${esc(h1)}</h1><p class="sx-intro">${esc(intro)}</p><div class="sx-tiles">${[['Makeup Services', 'Makeup applications and lessons with a Beauty Advisor.'], ['Skincare Services', 'Skincare consultations and facials.'], ['Brow Services', 'Brow shaping and tinting.'], ['Events', 'Free in-store classes and brand events.']].map(([t, d]) => `<a href="${base}/happening/reservations"><strong>${esc(t)}</strong><span>${esc(d)}</span></a>`).join('')}</div>
  <section class="sx-panel"><h2>Book a Reservation</h2><p>Service availability and reservation times were not captured for this replica. ${a(base, '/happening/stores/sephora-near-me', 'Find a store')} or see the ${a(base, '/beauty/beauty-services-faq', 'Beauty Services FAQ')}.</p></section>`
}

export function basketPage(base, user) {
  return `<h1>Basket</h1><div class="sx-basket"><section class="sx-panel"><h2>Get It Shipped</h2><p class="sx-count">Your basket is currently empty.</p><p>Purchases are not verified for this replica's captured catalog, so items cannot be added to the basket.</p>${a(base, '/beauty/new-beauty-products', 'Shop New Arrivals', 'sx-btn')}</section><aside class="sx-panel">${user ? `<h2>Beauty Insider</h2><p>Signed in as ${esc(user.email)}.</p>` : `<h2>Sign in for FREE Shipping</h2><p>Beauty Insiders get free standard shipping on every order.</p>${a(base, '/login', 'Sign In', 'sx-btn')} ${a(base, '/registration', 'Create Account', 'sx-btn sx-btn-outline')}`}</aside></div>
  ${row(base, 'Chosen For You', capturedSearchProducts.slice(12, 20), null)}`
}

export function loginPage(base, { error, email } = {}) {
  return `<div class="sx-auth"><h1>Sign In</h1><p>Sign in or create an account to enjoy FREE standard shipping on all orders.</p>${error ? `<p class="sx-alert" role="alert">${esc(error)}</p>` : ''}<form class="sx-form" method="post" action="${base}/login"><label for="login-email">Email Address</label><input id="login-email" name="email" type="email" autocomplete="email" value="${esc(email || '')}" required><label for="login-password">Password</label><input id="login-password" name="password" type="password" autocomplete="current-password" required><button class="sx-btn">Sign In</button></form><p>${a(base, '/beauty/registration-sign-in', 'Forgot password?')}</p><hr><h2>New to Sephora?</h2>${a(base, '/registration', 'Create Account', 'sx-btn sx-btn-outline')}</div>`
}

export function registerPage(base, { error, values = {} } = {}) {
  const f = (id, label, type, ac) => `<label for="reg-${id}">${label}</label><input id="reg-${id}" name="${id}" type="${type}" autocomplete="${ac}" value="${type === 'password' ? '' : esc(values[id] || '')}" required>`
  return `<div class="sx-auth"><h1>Create Account</h1><p>Join Beauty Insider for free and start earning points on every purchase.</p>${error ? `<p class="sx-alert" role="alert">${esc(error)}</p>` : ''}<form class="sx-form" method="post" action="${base}/registration">${f('first_name', 'First Name', 'text', 'given-name')}${f('last_name', 'Last Name', 'text', 'family-name')}${f('email', 'Email Address', 'email', 'email')}${f('password', 'Password (6 to 12 characters)', 'password', 'new-password')}<button class="sx-btn">Join Now</button></form><p>Already have an account? ${a(base, '/login', 'Sign In')}</p></div>`
}

const accountNav = base => `<aside class="sx-side"><h2>My Account</h2>${a(base, '/profile/MyAccount', 'Account Settings')}${a(base, '/profile/MyAccount/Orders', 'Orders')}${a(base, '/purchase-history', 'Purchase History')}${a(base, '/profile/Lists', 'Lists')}${a(base, '/profile/BeautyInsider', 'Beauty Insider')}${a(base, '/rewards', 'Rewards Bazaar')}${a(base, '/community/profile', 'Community Profile')}</aside>`
export function accountPage(base, user, h1 = 'My Account', inner = '') {
  const signedOut = `<section class="sx-panel"><h2>Sign In</h2><p>Sign in to view your account, orders and Beauty Insider status.</p>${a(base, '/login', 'Sign In', 'sx-btn')} ${a(base, '/registration', 'Create Account', 'sx-btn sx-btn-outline')}</section>`
  return `${crumbs(base, [['Home', '/'], ['My Account', '/profile/MyAccount'], ...(h1 === 'My Account' ? [] : [[h1]])])}<div class="sx-info-layout">${accountNav(base)}<article class="sx-article"><h1>${esc(h1)}</h1>${inner || (user ? `<section class="sx-panel"><h2>Account Information</h2><dl class="sx-dl"><dt>Name</dt><dd>${esc(`${user.first_name || ''} ${user.last_name || ''}`.trim())}</dd><dt>Email</dt><dd>${esc(user.email)}</dd><dt>Beauty Insider status</dt><dd>Insider</dd></dl><form method="post" action="${base}/logout"><button class="sx-btn sx-btn-outline">Sign Out</button></form></section>` : signedOut)}</article></div>`
}

export function ordersPage(base, user, lookup) {
  const inner = `<section class="sx-panel"><h2>Recent Orders</h2><p>${user ? 'You have no orders in this replica.' : 'Sign in to see your recent orders.'}</p></section>
  <section class="sx-panel"><h2>Guest Order Lookup</h2>${lookup ? `<p class="sx-alert" role="status">No order ${esc(lookup)} was found in this replica. Orders placed on sephora.com are not available here.</p>` : ''}<form class="sx-form" action="${base}/profile/MyAccount/Orders" method="get"><label for="order-number">Order Number</label><input id="order-number" name="orderId" required><label for="order-email">Email Address</label><input id="order-email" name="email" type="email" autocomplete="email" required><button class="sx-btn">View Order</button></form><p>See ${a(base, '/beauty/order-status', 'Order Status & History')} for help.</p></section>`
  return accountPage(base, user, 'Orders', inner)
}

export function beautyInsiderPage(base) {
  const tiers = [['Insider', 'Free to join', ['Earn 1 point per $1 spent', 'Birthday gift', 'Free standard shipping', 'Rewards Bazaar access']], ['VIB', 'Spend $350/year', ['Earn 1 point per $1 + seasonal savings', 'Birthday gift', 'Exclusive events']], ['Rouge', 'Spend $1,000/year', ['Earn 1 point per $1 + biggest savings', 'Free same-day delivery perks', 'First access to launches']]]
  return `${crumbs(base, [['Home', '/'], ['Beauty Insider']])}<section class="sx-bi-hero"><h1>Beauty Insider</h1><p>Our free rewards program. Earn points with every purchase and redeem them in the Rewards Bazaar.</p>${a(base, '/registration', 'Join Now', 'sx-btn')} ${a(base, '/login', 'Sign In', 'sx-btn sx-btn-outline')}</section>
  <section><h2>Choose Your Tier</h2><div class="sx-tiers">${tiers.map(([t, s, b]) => `<div class="sx-tier"><h3>${t}</h3><p>${esc(s)}</p><ul>${b.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>`).join('')}</div></section>
  <section class="sx-panel"><h2>Rewards Bazaar</h2><p>Redeem points for deluxe samples, minis and experiences. ${a(base, '/rewards', 'Explore Rewards Bazaar ▸')}</p></section><p>${a(base, '/beauty/loyalty-program', 'Beauty Insider FAQs')}</p>`
}

export function brandsListPage(base) {
  const groups = {}
  for (const b of BRANDS) (groups[/[a-z]/i.test(b.name[0]) ? b.name[0].toUpperCase() : '#'] ||= []).push(b)
  const letters = Object.keys(groups).sort()
  return `${crumbs(base, [['Home', '/'], ['Brands']])}<h1>Brands A-Z</h1><p class="sx-intro">Brands that appear in this replica's captured search results. The full Sephora brand directory was not captured.</p><nav class="sx-letters" aria-label="Brand letters">${letters.map(l => `<a href="#brand-${l === '#' ? 'num' : l}">${l}</a>`).join('')}</nav><div class="sx-brand-dir">${letters.map(l => `<section id="brand-${l === '#' ? 'num' : l}"><h2>${l}</h2>${groups[l].map(b => a(base, `/brand/${b.slug}`, b.name)).join('')}</section>`).join('')}</div>`
}

export function brandPage(base, slug) {
  const brand = BRANDS.find(b => b.slug === slug)
  const name = brand?.name || EXTRA_BRANDS[slug]
  if (!name) return null
  const items = brand ? capturedSearchProducts.filter(p => p.brand === brand.name) : []
  return `${crumbs(base, [['Home', '/'], ['Brands', '/brands-list'], [name]])}<h1>${esc(name)}</h1>${items.length ? `<p class="sx-count">${items.length} Results</p><p class="sx-note">Products from this brand that appear in the captured Sephora search. Other products from the brand were not captured.</p><div class="sx-grid">${items.map(p => card(base, p)).join('')}</div>` : notCaptured(base, name)}`
}

export function collectionPage(base, h1, intro, items) {
  return `${crumbs(base, [['Home', '/'], [h1]])}<h1>${esc(h1)}</h1><p class="sx-intro">${esc(intro)}</p><div class="sx-pills">${[['Makeup', 'makeup-cosmetics'], ['Skincare', 'skincare'], ['Hair', 'hair-products'], ['Fragrance', 'fragrance'], ['Bath & Body', 'bath-body']].map(([l, s]) => a(base, `/shop/${s}`, l)).join('')}</div>${items?.length ? `<p class="sx-count">${items.length} captured products</p><div class="sx-grid">${items.map(p => card(base, p)).join('')}</div>` : notCaptured(base, h1)}`
}

// Every department, subcategory and non-product section, for the HTML site map and sitemap.xml.
const SECTIONS = [['New', '/beauty/new-beauty-products'], ['Brands', '/brands-list'], ['Sale', '/sale'], ['Beauty Offers', '/beauty/beauty-offers'], ['Gift Cards', '/beauty/giftcards'], ['Beauty Insider', '/profile/BeautyInsider'], ['Rewards Bazaar', '/rewards'], ['Services & Events', '/happening/home'], ['Store Locator', '/happening/stores/sephora-near-me'], ['Customer Service', '/beauty/customer-service'], ['Order Status', '/profile/MyAccount/Orders'], ['Basket', '/basket'], ['Sign In', '/login']]
export function sitemapPage(base) {
  return `${crumbs(base, [['Home', '/'], ['Sitemap']])}<h1>Departments</h1><div class="sx-sitemap">${Object.entries(DEPARTMENTS).map(([slug, d]) => `<section><h2>${a(base, `/shop/${slug}`, d.title)}</h2>${d.subs.map(([l, s]) => a(base, `/shop/${s}`, l)).join('')}</section>`).join('')}<section><h2>Shop &amp; Services</h2>${SECTIONS.map(([l, p]) => a(base, p, l)).join('')}</section><section><h2>Customer Service</h2>${Object.entries(INFO).map(([s, [h]]) => a(base, `/beauty/${s}`, h)).join('')}</section><section><h2>Brands</h2>${BRANDS.map(b => a(base, `/brand/${b.slug}`, b.name)).join('')}</section></div>`
}
export function sitemapXml(origin, base) {
  const paths = ['/', ...SECTIONS.map(s => s[1]), ...Object.keys(CATEGORIES).map(s => `/shop/${s}`), ...Object.keys(INFO).map(s => `/beauty/${s}`), '/beauty/customer-service', '/beauty/giftcards', '/beauty/beauty-offers', '/sitemap/departments', ...BRANDS.map(b => `/brand/${b.slug}`), ...capturedSearchProducts.map(p => p.path)]
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...new Set(paths)].map(p => `  <url><loc>${esc(origin + base + p)}</loc></url>`).join('\n')}\n</urlset>\n`
}

export function productExtras(base, p) {
  const note = 'Not captured for this replica. The captured search card established the title, brand, price, rating and image only.'
  return `<section class="sx-pdp-extra"><div class="sx-panel sx-fulfil"><h2>Get It Shipped</h2><p>Purchase options, stock and delivery for this item have not been verified, so it cannot be added to the basket here.</p>${a(base, `/brand/${brandSlug(p.brand)}`, `Shop all ${p.brand}`)}</div>${['Highlights', 'About the Product', 'Ingredients', 'How to Use', 'About the Brand'].map(h => `<details class="sx-acc"${h === 'Highlights' ? ' open' : ''}><summary><h2>${h}</h2></summary><p>${note}</p></details>`).join('')}</section>`
}

// ---------- routes ----------
const REDIRECTS = { '/beauty-insider': '/profile/BeautyInsider', '/stores': '/happening/stores/sephora-near-me', '/services': '/happening/home', '/account': '/profile/MyAccount', '/account/preferences': '/profile/MyAccount', '/account/replenishment': '/profile/MyAccount', '/favorites': '/profile/Lists', '/cart': '/basket', '/beauty/new': '/beauty/new-beauty-products', '/beauty/under-50': '/beauty/beauty-under-20', '/shop/makeup': '/shop/makeup-cosmetics', '/shop/hair': '/shop/hair-products', '/shop/mini-size': '/shop/travel-size-toiletries', '/shop/sets': '/shop/value-sets', '/gift-cards': '/beauty/giftcards', '/beauty/offers': '/beauty/beauty-offers', '/help': '/beauty/customer-service', '/help/topic/shipping': '/beauty/shipping-information', '/help/topic/returns': '/beauty/returns-exchanges', '/orders': '/profile/MyAccount/Orders', '/recently-viewed': '/profile/Lists', '/sitemap': '/sitemap/departments', '/beauty/best-foundations': '/shop/foundation-makeup', '/BeautyInsider': '/profile/BeautyInsider' }

export function installSite(router, { render, baseOf }) {
  const page = (path, title, fn) => router.get(path, (req, res) => render(req, res, title, fn(baseOf(res), req)))
  for (const [from, to] of Object.entries(REDIRECTS)) router.get(from, (req, res) => res.redirect(301, baseOf(res) + to))
  router.get('/shop/:slug', (req, res, next) => {
    const cat = CATEGORIES[req.params.slug]
    if (!cat) return next()
    render(req, res, cat.title, categoryPage(baseOf(res), cat, req.query))
  })
  router.get('/beauty/:slug', (req, res, next) => {
    if (!INFO[req.params.slug]) return next()
    render(req, res, INFO[req.params.slug][0], infoPage(baseOf(res), req.params.slug))
  })
  page('/beauty/customer-service', 'Customer Service', customerServicePage)
  router.get('/beauty/giftcards', (req, res) => render(req, res, 'Gift Cards', giftCardsPage(baseOf(res), req.query.check ? 'Gift card balances cannot be checked in this replica. Your card number was not stored.' : '')))
  page('/beauty/beauty-offers', 'Beauty Offers', offersPage)
  page('/beauty/new-beauty-products', 'New Beauty Products', base => collectionPage(base, 'New Beauty Products', 'The latest launches across makeup, skincare, hair and fragrance.', capturedSearchProducts.filter(p => p.badge === 'NEW')))
  page('/sale', 'Sale', base => collectionPage(base, 'Sale', 'Limited-time markdowns on makeup, skincare, hair and fragrance.', []))
  page('/beauty/free-beauty-samples', 'Free Beauty Samples', base => collectionPage(base, 'Free Beauty Samples', 'Choose two free samples with every order, plus more in the Rewards Bazaar.', []))
  page('/rewards', 'Rewards Bazaar', base => collectionPage(base, 'Rewards Bazaar', 'Redeem Beauty Insider points for deluxe samples, minis and experiences.', []))
  router.get('/happening/stores/sephora-near-me', (req, res) => render(req, res, 'Find a Sephora', storeLocatorPage(baseOf(res), typeof req.query.location === 'string' ? req.query.location.trim().slice(0, 60) : '')))
  page('/happening/home', 'Services & Events', base => servicesPage(base, 'Services & Events', 'Book makeup, skincare and brow services, and join free in-store events.'))
  page('/happening/events', 'Sephora Events', base => servicesPage(base, 'Sephora Events', 'Free classes, launches and community events at Sephora stores.'))
  page('/happening/reservations', 'Book a Reservation', base => servicesPage(base, 'Book a Reservation', 'Choose a service, a store and a time.'))
  page('/in-store-services', 'Beauty Advisor Recommendations', (base, req) => accountPage(base, req.store.user, 'Beauty Advisor Recommendations', `<section class="sx-panel"><p>Products a Beauty Advisor recommends during an in-store visit appear here.</p><p>${req.store.user ? 'You have no recommendations yet.' : a(base, '/login', 'Sign in to see your recommendations')}</p></section>`))
  page('/community/profile', 'Community Profile', (base, req) => accountPage(base, req.store.user, 'Community Profile', '<section class="sx-panel"><p>Your Beauty Insider Community profile shows your reviews, photos and conversations. The community is a separate Sephora site and is not part of this replica.</p></section>'))
  page('/purchase-history', 'Purchase History', (base, req) => accountPage(base, req.store.user, 'Purchase History', `<section class="sx-panel"><p>${req.store.user ? 'You have no purchases in this replica.' : 'Sign in to see products you bought online and in store.'}</p></section>`))
  page('/profile/Lists', 'Lists', (base, req) => accountPage(base, req.store.user, 'Lists', `<section class="sx-panel"><h2>My Lists</h2><p>${req.store.user ? 'Your lists are empty.' : 'Sign in to save products to your lists.'}</p>${req.store.user ? '' : a(base, '/login', 'Sign In', 'sx-btn')}</section>`))
  page('/profile/MyAccount', 'My Account', (base, req) => accountPage(base, req.store.user))
  router.get('/profile/MyAccount/Orders', (req, res) => render(req, res, 'Orders', ordersPage(baseOf(res), req.store.user, typeof req.query.orderId === 'string' ? req.query.orderId.trim().slice(0, 40) : '')))
  page('/profile/BeautyInsider', 'Beauty Insider', beautyInsiderPage)
  page('/basket', 'Basket', (base, req) => basketPage(base, req.store.user))
  page('/brands-list', 'Brands A-Z', brandsListPage)
  router.get('/brand/:slug', (req, res, next) => { const html = brandPage(baseOf(res), req.params.slug); html ? render(req, res, 'Brand', html) : next() })
  page('/sitemap/departments', 'Sitemap', sitemapPage)
  router.get('/sitemap.xml', (req, res) => res.type('application/xml').send(sitemapXml('', baseOf(res))))
  router.get('/email-signup', (req, res) => render(req, res, 'Email Sign Up', `<div class="sx-auth"><h1>Sign up for Sephora Emails</h1><p>${typeof req.query.email === 'string' && /.+@.+\..+/.test(req.query.email) ? 'Thanks! This replica does not send email, so your address was not saved.' : 'Enter a valid email address.'}</p>${a(baseOf(res), '/', 'Continue Shopping', 'sx-btn')}</div>`))
  router.get('/login', (req, res) => render(req, res, 'Sign In', loginPage(baseOf(res))))
  router.post('/login', (req, res) => {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim() : ''
    const account = authenticate('sephora', email, req.body?.password)
    if (!account) return render(req, res, 'Sign In', loginPage(baseOf(res), { error: 'The email address or password you entered is incorrect.', email }), 401)
    req.store.user = publicAccount(account)
    res.redirect(303, `${baseOf(res)}/profile/MyAccount`)
  })
  router.get('/registration', (req, res) => render(req, res, 'Create Account', registerPage(baseOf(res))))
  router.post('/registration', (req, res) => {
    const values = Object.fromEntries(['first_name', 'last_name', 'email', 'password'].map(k => [k, typeof req.body?.[k] === 'string' ? req.body[k].trim() : '']))
    const fail = error => render(req, res, 'Create Account', registerPage(baseOf(res), { error, values }), 400)
    if (!values.first_name || !values.last_name) return fail('Please enter your first and last name.')
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(values.email)) return fail('Please enter a valid email address.')
    if (values.password.length < 6 || values.password.length > 12) return fail('Password must be 6 to 12 characters.')
    const account = createAccount('sephora', values)
    if (account.error) return fail(account.error)
    req.store.user = publicAccount(account)
    res.redirect(303, `${baseOf(res)}/profile/MyAccount`)
  })
  router.post('/logout', (req, res) => { req.store.user = null; res.redirect(303, `${baseOf(res)}/`) })
}

export { isCapturedQuery }
