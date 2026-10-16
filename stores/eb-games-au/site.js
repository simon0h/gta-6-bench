// Real-site chrome (header, department menu, footer), homepage sections, landing pages,
// information pages, help centre, order tracking, gift cards and site map for EB Games Australia.
// Content summarised from the real site on 2026-10-13 (research/parity/eb-games-au.json).
// Product rows use the store's own catalog: the GTA VI listings plus the shop assortment (shelf.js).
import { esc, publicNotice } from '../../lib/html.js'
import { fixtureCatalog } from '../../lib/catalog-policy.js'
import { MENU, SHOPPING_INFO, LEGAL, PAYMENTS, CATEGORY_SLUGS, GAMING_SUBCATEGORIES, LANDINGS, HUB_TILES, HELP_CATEGORIES, POPULAR_ANSWERS, INFO_PAGES, PLUS_BENEFITS } from './site-data.js'

const ICONS = { 'Trading Cards':'cards', 'Clothing & Lifestyle':'shirt', Preowned:'console', 'Consoles & Hardware':'handheld', 'Video Games':'game', 'Gaming Accessories':'controller', 'Digital Currency, Content & Gift Cards':'sleeves', 'PC Gaming':'keyboard', Homewares:'mug', Collectibles:'figure', 'Board Games':'board', 'Toys & Games':'plush', 'Books & Comics':'binder', 'Movies & TV':'ssd', 'Console Trade Deals':'dock', 'EB World PLUS':'lamp', Sale:'cap' }
const icon = (label, b) => ICONS[label] ? `<img src="${b}/static/catalog-${ICONS[label]}.svg" alt="">` : ''
const a = (b, href, label, cls = '') => `<a${cls ? ` class="${cls}"` : ''} href="${b}${esc(href)}">${esc(label)}</a>`

export function header(req, b, { cartCount, storeName, user }) {
  const dept = ([label, href, kids]) => `<li class="eb-dept${kids.length ? ' has-kids' : ''}"><a class="eb-dept-link" href="${b}${esc(href)}">${esc(label)}</a>${kids.length ? `<div class="eb-flyout"><p class="eb-flyout-title">${esc(label)}</p><ul>${kids.map(([l, h]) => `<li>${a(b, h, l)}</li>`).join('')}</ul></div>` : ''}</li>`
  return `<a class="skip-link" href="#content">Skip to content</a>
  <header class="eb-header"><div class="eb-header-row">
   <details class="mega-menu"><summary aria-label="Shop all departments">☰</summary><div><h2>Shop By Category</h2>${MENU.map(([label, href, kids]) => `<details class="eb-mobile-dept"><summary>${esc(label)}</summary>${a(b, href, `Shop all ${label}`)}${kids.map(([l, h]) => a(b, h, l)).join('')}</details>`).join('')}<h2>Shopping Information</h2>${SHOPPING_INFO.map(([l, h]) => a(b, h, l)).join('')}</div></details>
   <a class="brand" href="${b}" aria-label="EB Games home">EB <span>GAMES</span></a><span class="zing" aria-hidden="true">ZiNG!</span>
   <form class="search" method="get" action="${b}/search" role="search"><label for="site-search">Search</label><input id="site-search" type="search" name="q" value="${req.path === '/search' ? esc(req.query.q) : ''}" placeholder="Search" autocomplete="off" list="eb-suggestions"><datalist id="eb-suggestions"></datalist><button aria-label="Search">Search</button></form>
   <a class="store-choice eb-hdr-icon" href="${b}/stores"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg><span>${esc(storeName || 'Find a Store')}<small>${storeName ? 'Find a Store' : 'Choose a store'}</small></span></a>
   <a class="header-account eb-hdr-icon" href="${b}/account"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7z"/></svg><span>${user ? `Hi, ${esc(user.first_name)}<small>EB World</small>` : 'Sign in or sign up<small>EB World</small>'}</span></a>
   <a class="header-track eb-hdr-icon" href="${b}/order-history"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h11v9H3zM14 9h4l3 3v3h-7zM6 18a2 2 0 1 0 0-.1zM17 18a2 2 0 1 0 0-.1z"/></svg><span>Track Order</span></a>
   <a class="header-wishlist eb-hdr-icon" href="${b}/ebworld/wishlist"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-8-5.3-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.7-8 11-8 11z"/></svg><span>Wishlist</span></a>
   <div class="eb-cart-wrap"><a class="header-cart eb-hdr-icon" href="${b}/cart"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6h15l-2 8H8zM6 6 5 3H2M9 20a1.5 1.5 0 1 0 0-.1zM18 20a1.5 1.5 0 1 0 0-.1z"/></svg><span>Cart (${cartCount})</span></a><a class="eb-checkout-now" href="${b}/shopping-cart/start-checkout">Checkout Now</a></div>
  </div>
  <nav class="eb-dept-bar" aria-label="Shop by department"><ul>${MENU.map(dept).join('')}</ul></nav></header>`
}

export function footer(b, disclaimerHTML) {
  return `<footer class="eb-footer">
  <div class="footer-services"><a href="${b}/clickandcollect"><strong>Click &amp; Collect</strong><span>Your next game, closer to home</span></a><a href="${b}/trade-and-save"><strong>Trade &amp; Save</strong><span>Bring in your games and devices</span></a><a href="${b}/reboot"><strong>Reboot Repairs</strong><span>Get your gear back in the game</span></a></div>
  <div class="eb-footer-cols">
   <section><h2>Shop By Category</h2><ul class="eb-two-col">${MENU.map(([l, h]) => `<li>${a(b, h, l)}</li>`).join('')}</ul></section>
   <section><h2>Shopping Information</h2><ul>${SHOPPING_INFO.map(([l, h]) => `<li>${a(b, h, l)}</li>`).join('')}<li>${a(b, '/order-history', 'Track Order')}</li><li>${a(b, '/sitemap', 'Site Map')}</li></ul></section>
   <section><h2>Legal</h2><ul>${LEGAL.map(([l, h]) => `<li>${a(b, h, l)}</li>`).join('')}</ul><h2>We accept</h2><ul class="eb-payments">${PAYMENTS.map(p => `<li>${esc(p)}</li>`).join('')}</ul></section>
  </div>
  <div class="eb-legal-bar"><p>© 2026 Electronics Boutique Australia Pty Ltd, Trading as EB Games.</p><p>ABN 50 077 681 442</p></div>
  ${disclaimerHTML}</footer>`
}

// ---------- Search slug mapping ----------
const REFERENCE_SHELF = !fixtureCatalog
const PLAT = fixtureCatalog
  ? { 'playstation-5': 'PlayStation 5', 'xbox-series-x': 'Xbox Series X', 'nintendo-switch': 'Nintendo Switch', 'nintendo-switch-2': 'Nintendo Switch 2', pc: 'PC' }
  : { 'playstation-5': 'PlayStation 5', 'playstation-4': 'PlayStation 4', 'playstation-3': 'PlayStation 3', 'playstation-2': 'PlayStation 2', 'playstation-vr2': 'PlayStation 5', 'xbox-series-x': 'Xbox Series X', 'xbox-one': 'Xbox One', 'xbox-360': 'Xbox 360', 'nintendo-switch': 'Nintendo Switch', 'nintendo-switch-lite': 'Nintendo Switch', 'nintendo-switch-2': 'Nintendo Switch 2', 'nintendo-3ds': 'Nintendo 3DS', pc: 'PC' }
const MENU_LINKS =MENU.flatMap(([dept, href, kids]) => [[dept, href, dept], ...kids.map(([l, h]) => [l, h, dept])])
export function mapSearch(url, query) {
  const exact = MENU_LINKS.find(([, h]) => h === url)
  const out = {}, s = v => typeof v === 'string' ? v : ''
  const category = s(query.category), sub = s(query.subcategory), condition = s(query.condition), promo = s(query.promotions)
  let title = '', dept = exact?.[2] || ''
  if (category === 'gaming') Object.assign(out, { category: '' }, sub === 'gaming-accessories' ? { category: 'Gaming Accessories' } : GAMING_SUBCATEGORIES[sub] || (sub ? { type: `subcategory:${sub}` } : {}))
  else if (CATEGORY_SLUGS[category]) { out.category = CATEGORY_SLUGS[category]; if (sub) out.type = `subcategory:${sub}`; else if (query.attributes && !REFERENCE_SHELF) out.type = 'subcategory:attributes' }
  else if (MENU_LINKS.some(([, h]) => h.includes(`category=${category}&`) || h.endsWith(`category=${category}`))) out.category = `none:${category}` // real departments this store has no products for
  const attrs = [].concat(query.attributes || []).filter(x => typeof x === 'string')
  const platforms = attrs.filter(x => x.startsWith('platform:')), others = attrs.filter(x => !x.startsWith('platform:'))
  if (REFERENCE_SHELF) {
    // Real attribute filters: platforms (any of), plus other attributes such as board-game-type or format (any of).
    const labels = [...new Set(platforms.map(x => PLAT[x.slice(9)]).filter(Boolean))]
    if (platforms.length) out.platform = labels.length ? labels.join('|') : `attributes:${platforms.length}`
    if (others.length) out.attrs = others.join('|')
  } else if (category === 'gaming' && attrs.length) {
    out.platform = attrs.length === 1 && PLAT[attrs[0].replace(/^platform:/, '')] && attrs[0].startsWith('platform:') ? PLAT[attrs[0].slice(9)] : `attributes:${attrs.length}`
  }
  if (condition === 'preowned') out.condition = 'Preowned'
  else if (condition === 'new') out.condition = 'New'
  else if (condition === 'preorder') { out.availability = 'preorder'; out.condition = '' }
  if (promo) { out.promotion = 'sale'; if (promo !== 'all') out.type = `promotion:${promo}`; title = promo === 'all' ? 'Sale' : promo; dept = 'Sale' }
  if (s(query.sort) === 'releasedate') out.sort = 'release'
  if (exact) title = exact[0] === exact[2] ? exact[0] : `${exact[0]}`
  if (!title && condition === 'preorder') title = 'Preorder Now'
  if (!title && condition === 'new') title = 'New Releases'
  if (!title && category) title = MENU.find(([, h]) => h === `/search?category=${category}`)?.[0] || CATEGORY_SLUGS[category] || ''
  const deptEntry = MENU.find(([l]) => l === dept)
  return { title, filters: out, dept: deptEntry ? [deptEntry[0], deptEntry[1]] : null, kids: deptEntry && (exact?.[0] === dept || promo) ? deptEntry[2] : [] }
}

// Sub-department tiles carry a small product picture, like the real site's category tiles.
const TILE_ICONS = [[/^trading card home$|^we buy tcg$/i, 'cards'], [/controller/i, 'controller'], [/nintendo|3ds|handheld/i, 'handheld'], [/playstation|xbox|console|retro|arcade|virtual/i, 'console'], [/pc games|video games|new release/i, 'game'], [/lego/i, 'bricks'], [/plush|toys|nerf|beyblade|tamagotchi/i, 'plush'], [/classic games|tabletop|party|dungeons|puzzle|board/i, 'board'], [/drinkware|dining|kitchen/i, 'mug'], [/lighting|candle|smart home/i, 'lamp'], [/stationery|books|manga|poster/i, 'binder'], [/keyboard|desktop|laptop/i, 'keyboard'], [/mice/i, 'mouse'], [/headset|audio|microphone|streaming/i, 'headphones'], [/t-shirt|hoodie|sleepwear|socks|costume/i, 'shirt'], [/hats|beanie/i, 'cap'], [/bags|wallet|cases/i, 'case'], [/pop vinyl|pop mart|figure|statue|replica|black series|limited release/i, 'figure'], [/storage|memory/i, 'ssd'], [/racing/i, 'wheel'], [/charger|cable/i, 'cable']]
// Platform tiles carry a platform badge (brand colour, model name) the way the real tiles show platform logos.
const platformBadge = l => {
  const m = /^(PlayStation|Xbox|Nintendo)(?: (\d|Series X|One|360|Switch 2|Switch|3DS|Store|Trade Deals))?$/.exec(l); if (!m) return ''
  const [, brand, model = ''] = m, cls = { PlayStation: 'ps', Xbox: 'xbox', Nintendo: 'nin' }[brand]
  const word = brand === 'Xbox' ? 'XBOX' : brand
  if (!model) return `<span class="eb-plat-mark eb-plat-${cls} eb-plat-word" aria-hidden="true"><b>${esc(word)}</b></span>`
  const big = brand === 'PlayStation' && /^\d$/.test(model) ? `PS${model}` : model === 'Trade Deals' ? 'Trade' : model
  return `<span class="eb-plat-mark eb-plat-${cls}" aria-hidden="true"><small>${esc(word)}</small><b>${esc(big)}</b></span>`
}
const tileMark = (b, l) => { const badge = platformBadge(l); if (badge) return badge; const icon = TILE_ICONS.find(([re]) => re.test(l))?.[1]; return icon ? `<span class="eb-sub-mark eb-sub-icon" aria-hidden="true"><img src="${b}/static/catalog-${icon}.svg" alt=""></span>` : `<span class="eb-sub-mark eb-mark-${[...l].reduce((n, c) => n + c.charCodeAt(0), 0) % 6}" aria-hidden="true">${esc(monogram(l))}</span>` }
// Franchise monogram: first letters of the name's main words (Magic: The Gathering -> MG, Yu-Gi-Oh! -> YGO).
const monogram = l => l.normalize('NFKD').replace(/[^A-Za-z0-9 -]/g, '').split(/[\s-]+/).filter(w => w && !/^(the|and|of|trading|card|cards|game|games|home|all|see)$/i.test(w)).map(w => w[0].toUpperCase()).join('').slice(0, 3) || l.slice(0, 2).toUpperCase()
export const tileRow = (b, tiles, heading = '') => tiles.length ? `${heading ? `<h2 class="eb-row-title">${esc(heading)}</h2>` : ''}<div class="eb-sub-tiles">${tiles.map(([l, h]) => `<a href="${b}${esc(h)}">${tileMark(b, l)}<strong>${esc(l)}</strong></a>`).join('')}</div>` : ''

export function hubIntro(b, path) {
  const hub = HUB_TILES[path]; if (!hub) return ''
  return `<div class="eb-dept-banner"><span>EB GAMES</span><strong>${esc(hub.banner)}</strong></div>${tileRow(b, hub.tiles)}${(hub.anchors || []).map(([id, l]) => `<h2 class="eb-row-title" id="${id}">${esc(l)}</h2>`).join('')}`
}
// Reference mode fills the real hub rows from the store's assortment (rows with no matching products are left out).
const TCG = { category: 'Trading Cards' }, PRE = { condition: 'Preowned' }
const ROW_QUERIES = {
  'New Release Trading Cards': { ...TCG, sort: 'release' }, 'Shop the Latest Pokemon TCG!': { ...TCG, q: 'pokemon' }, 'Shop Magic: the Gathering!': { ...TCG, q: 'magic' },
  'Yu-Gi-Oh TCG!': { ...TCG, q: 'yugioh' }, 'League of Legends TCG!': { ...TCG, q: 'riftbound' }, 'Disney Lorcana!': { ...TCG, q: 'lorcana' },
  'Pop Culture Favourites!': { ...TCG, type: 'subcategory:trading-cards-pop-culture' }, 'Sports Trading Cards!': { ...TCG, q: 'sports' },
  'Shop Preowned Consoles!': { ...PRE, category: 'Consoles' }, 'Shop Premium Preowned Consoles': { ...PRE, category: 'Consoles', sort: 'price-desc' },
  'Best Selling Preowned Titles!': { ...PRE, category: 'Video Games' }, 'Shop Preowned PlayStation Consoles': { ...PRE, category: 'Consoles', platform: 'PlayStation 5|PlayStation 4' },
  'Best Selling PlayStation Games': { ...PRE, category: 'Video Games', platform: 'PlayStation 5|PlayStation 4|PlayStation 3|PlayStation 2' },
  'Shop Preowned Nintendo Consoles': { ...PRE, category: 'Consoles', q: 'nintendo' }, 'Best Selling Switch Games': { ...PRE, category: 'Video Games', platform: 'Nintendo Switch|Nintendo 3DS' },
  'Preowned Xbox Consoles': { ...PRE, category: 'Consoles', platform: 'Xbox One|Xbox Series X' }, 'Best Selling Preowned Xbox Games': { ...PRE, category: 'Video Games', platform: 'Xbox One|Xbox 360' },
}
export function hubRows(b, path, shelf = null) {
  const hub = HUB_TILES[path]; if (!hub?.rows) return ''
  if (shelf) return `<section class="eb-hub-rows">${hub.rows.map(r => { const q = ROW_QUERIES[r], list = q ? shelf.matching(q).slice(0, 12) : []; return list.length ? `<div class="eb-hub-row"><div class="section-heading"><h2>${esc(r)}</h2><a class="eb-shop-all" href="${b}/search?${esc(new URLSearchParams(q).toString())}">SHOP ALL</a></div>${shelf.carousel(b, list)}</div>` : '' }).join('')}</section>`
  return `<section class="eb-hub-rows">${hub.rows.map(r => `<div class="eb-hub-row"><h2>${esc(r)}</h2><p><a href="${b}/search?q=${encodeURIComponent(r.replace(/[!.]/g, ''))}">Search this range</a></p></div>`).join('')}</section>`
}

// ---------- Homepage ----------
export function homePage(b, { preorderTiles, newReleases }) {
  const franchises = ['Pokemon', 'Harry Potter', 'Star Wars', 'Marvel', 'Disney', 'DC Comics', 'Anime', 'Minecraft']
  const shopAll = href => `<a class="eb-shop-all" href="${b}${href}">SHOP ALL</a>`
  return `<h1 class="eb-visually-hidden">EB Games Australia - Video Games, Consoles, Trading Cards &amp; Pop Culture</h1>
  <section class="eb-hero" aria-label="Featured">
   <a class="eb-slide eb-slide-main" href="${b}/search?category=collectibles"><span>LIMITED TIME</span><strong>Treat Yourself This Halloween</strong><b>Shop now ›</b></a>
   <a class="eb-slide eb-slide-mtg" href="${b}/featured/magic-the-gathering"><span>NEW SET</span><strong>Magic: The Gathering</strong><b>Shop now ›</b></a>
   <a class="eb-slide eb-slide-fan" href="${b}/search?category=collectibles"><span>EB WORLD</span><strong>Pop Culture Fan Club</strong><b>Find out more ›</b></a>
   <a class="eb-slide eb-slide-poke" href="${b}/featured/pokemon-trading-card-game"><span>CELEBRATE</span><strong>Pokemon 30th</strong><b>Shop the range ›</b></a>
  </section>
  <section class="eb-franchises" aria-label="Shop by franchise">${franchises.map(f => `<a href="${b}/search?q=${encodeURIComponent(f.toLowerCase())}"><span aria-hidden="true">${esc(f.split(' ').map(w => w[0]).join(''))}</span>${esc(f)}</a>`).join('')}</section>
  <section class="eb-banner-trio" aria-label="Trading cards">
   <a class="eb-tcg-mtg" href="${b}/featured/magic-the-gathering"><strong>Magic: The Gathering</strong><span>Play boosters, bundles &amp; Commander decks</span></a>
   <a class="eb-tcg-poke" href="${b}/featured/pokemon-trading-card-game"><strong>Pokémon TCG</strong><span>The latest expansions, ETBs &amp; collections</span></a>
   <a class="eb-tcg-sell" href="${b}/sell-your-tcg-singles"><strong>Sell Your TCG Singles</strong><span>Get a valuation at your nearest store</span></a>
  </section>
  <section class="eb-banner-duo" aria-label="Memberships and board games">
   <a class="eb-plus-banner" href="${b}/plus"><strong>EB World PLUS</strong><span>12 months of member perks for $49.00</span></a>
   <a class="eb-board-banner" href="${b}/featured/board-games"><strong>Board Games</strong><span>Bring everyone around the table</span></a>
  </section>
  <section class="eb-banner-trio eb-trade-trio" aria-label="Trade, preowned and repairs">
   <a href="${b}/trade-and-save"><strong>We Buy Consoles, Games &amp; More for Cash or Credit</strong><span>Trade &amp; Save ›</span></a>
   <a href="${b}/featured/preowned"><strong>Preowned Consoles, Games &amp; More</strong><span>Same great games. Better value. ›</span></a>
   <a href="${b}/reboot"><strong>Reboot Repairs</strong><span>Fixed price console &amp; controller repairs ›</span></a>
  </section>
  <section class="eb-row"><div class="section-heading"><h2 class="eb-row-heading">New Releases</h2>${shopAll('/search?condition=new&sort=releasedate&order=desc')}</div>${newReleases || `<div class="eb-empty-row"><p>Check back soon for the latest releases.</p>${shopAll('/search?condition=new&sort=releasedate&order=desc')}</div>`}</section>
  <section class="eb-row"><div class="section-heading"><h2 class="eb-row-heading">Preorder Now</h2>${shopAll('/search?condition=preorder')}</div>${preorderTiles}</section>
  <section class="eb-row"><h2 class="eb-row-heading">Shop Your Favourite Categories!</h2><div class="eb-fav-cats">${MENU.map(([l, h]) => `<a href="${b}${esc(h)}">${icon(l, b)}<strong>${esc(l)}</strong></a>`).join('')}</div></section>
  <section class="eb-plus-panel"><div><span class="world-mark">EB WORLD PLUS</span><h2>Unlock the power of PLUS and gain access to amazing benefits!</h2><p>Your membership will include:</p><ul>${PLUS_BENEFITS.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div><div class="eb-plus-price"><b>Best Value</b><span>12 Months</span><strong>$49.00</strong><p>To join PLUS sign in to your EB World account and select your membership.</p><a class="button" href="${b}/account">Sign In</a> <a class="eb-link" href="${b}/plus">Learn more</a></div></section>
  <section class="eb-store-strip"><h2>Find your local store to view product availability</h2><form method="get" action="${b}/stores"><label for="home-store-q">Please enter suburb or postcode</label><input id="home-store-q" name="q" autocomplete="postal-code"><button>Search</button></form><a href="${b}/stores">Find stores near me</a></section>`
}

// ---------- Information page shell ----------
export const infoPage = (b, title, lead, sections, extra = '') => `<p class="breadcrumb"><a href="${b}">Home</a> › ${esc(title)}</p><div class="eb-info-hero"><h1>${esc(title)}</h1>${lead ? `<p>${esc(lead)}</p>` : ''}</div><div class="eb-info">${sections.map(([h, ps]) => `<section class="panel"><h2>${esc(h)}</h2>${ps.map(p => `<p>${esc(p)}</p>`).join('')}</section>`).join('')}${extra}</div>`

export function installSite(router, { render, catalogPage, searchProducts, fixtureCatalog, retailOrders }) {
  const B = res => res.locals.base
  const help = b => `<section class="panel eb-cta"><h2>Need more help?</h2><p><a class="button" href="${b}/stores">Find a Store</a> <a href="${b}/help">Help &amp; Support</a></p></section>`
  for (const [path, title, lead, sections] of INFO_PAGES) {
    router.get(path, (req, res) => {
      const b = B(res)
      const tail = path === '/trade-and-save' ? `<p class="eb-note">Trade values are confirmed in store. <a href="${b}/help/contact?category=${encodeURIComponent('Trade & Save')}">Ask a question</a></p>`
        : path === '/reboot' ? `<p class="eb-note"><a href="${b}/help/contact?category=${encodeURIComponent('Reboot Repairs')}">Ask a question</a></p>` : ''
      render(req, res, title, infoPage(b, title, lead, sections, tail + help(b)))
    })
  }
  router.get('/plus', (req, res) => {
    const b = B(res)
    render(req, res, 'EB World PLUS', `<p class="breadcrumb"><a href="${b}">Home</a> › EB World PLUS</p><div class="eb-info-hero eb-plus-hero"><h1>EB World PLUS</h1><p>Our premium membership: A$49 for 12 months of extra member deals, bonus trade value and Double Carrots.</p></div>
    <section class="eb-plus-panel"><div><h2>Unlock the power of PLUS and gain access to amazing benefits!</h2><p>Your membership will include:</p><ul>${PLUS_BENEFITS.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div><div class="eb-plus-price"><b>Best Value</b><span>12 Months</span><strong>$49.00</strong><p>To join PLUS sign in to your EB World account and select your membership.</p><a class="button" href="${b}/account">Sign In</a></div></section>
    <section class="panel"><h2>Exclusive EB World PLUS Deals.</h2><p>PLUS members get monthly member-only offers. Sign in to EB World to see this month's deals.</p></section>
    <section class="panel"><h2>Monthly EB World PLUS Deals!</h2><p>Deals change every month. Visit your local store for this month's offers.</p></section>
    <section class="panel"><h2>Shop Digital Content</h2><p>PLUS members save 5% on digital currencies and content.</p><a href="${b}/featured/egift-cards">Shop digital currency &amp; gift cards ›</a></section>
    <section class="panel service-detail"><ol><li>PLUS is distinct from your free EB World account.</li><li>Join or renew PLUS in store.</li></ol>${publicNotice('<p>This is not the real EB Games website: no membership is activated or charged.</p>')}<a class="button" href="${b}/stores">Find a store</a> <a href="${b}/help/contact?category=${encodeURIComponent('EB World PLUS')}">Ask a question</a></section>`)
  })
  for (const [path, title, intro, filters] of LANDINGS) {
    router.get(path, (req, res) => render(req, res, title, `<p class="breadcrumb"><a href="${B(res)}">Home</a> › ${esc(title)}</p>` + hubIntro(B(res), path) + catalogPage(B(res), title, { ...req.query, ...filters }, searchProducts(), intro).replace(`<p class="breadcrumb"><a href="${B(res)}">Home</a> › Shop</p>`, '')))
  }
  router.get('/featured/egift-cards', (req, res) => {
    const b = B(res)
    const groups = [['Gift Cards for EB Games', 'EB Games eGift Cards are emailed after checkout - the perfect last-minute gift.', '/giftcards/balance', 'Check Gift Card Balance'], ['PlayStation Gift Cards', 'PlayStation Store vouchers in a range of values.', MENU[8][2][1][1], 'Shop PlayStation Store'], ['Xbox Gift Cards', 'Xbox gift cards and Game Pass memberships.', MENU[8][2][3][1], 'Shop Xbox'], ['Switch Gift Cards', 'Nintendo eShop cards and Nintendo Switch Online memberships.', MENU[8][2][2][1], 'Shop Nintendo'], ['More Gift Cards!', 'Roblox, Fortnite, Riot Games and Meta Quest vouchers.', MENU[8][2][4][1], 'Shop more digital currency']]
    render(req, res, 'EB Games eGift Cards', `<p class="breadcrumb"><a href="${b}">Home</a> › Digital Currency, Content &amp; Gift Cards</p><div class="eb-info-hero"><h1>EB Games eGift Cards – The Perfect Last-Minute Gift</h1><p>Digital gift cards are emailed after checkout. eGift Cards are currently unavailable online.</p></div><div class="eb-gift-grid">${groups.map(([h, p, href, l]) => `<section class="panel"><div class="eb-giftcard" aria-hidden="true">EB<span>GIFT CARD</span></div><h2>${esc(h)}</h2><p>${esc(p)}</p><a href="${b}${esc(href)}">${esc(l)} ›</a></section>`).join('')}</div>`)
  })
  router.get('/giftcards/balance', (req, res) => {
    const b = B(res), s = v => typeof v === 'string' ? v.trim() : ''
    const number = s(req.query.number), pin = s(req.query.pin), asked = 'number' in req.query || 'pin' in req.query
    const errors = asked ? [!/^\d{19}$/.test(number.replace(/\s/g, '')) && 'Enter the 19-digit gift card number from the back of your card.', !/^\d{4}$/.test(pin) && 'Enter the 4-digit PIN from the scratch panel.'].filter(Boolean) : []
    const result = asked && !errors.length ? '<div class="notice" role="status">We cannot check gift card balances right now. Please try again later.</div>' : ''
    render(req, res, 'Gift Card Balance', `<p class="breadcrumb"><a href="${b}">Home</a> › Gift Card Balance</p><h1>Gift Card Balance</h1>${errors.length ? `<div class="errors" role="alert"><ul>${errors.map(e => `<li>${esc(e)}</li>`).join('')}</ul></div>` : ''}${result}<form class="panel eb-narrow-form" method="get" action="${b}/giftcards/balance"><div class="field"><label for="gc-number">Gift Card Number</label><input id="gc-number" name="number" inputmode="numeric" value="${esc(number)}"><small>The 19-digit number on the back of your card.</small></div><div class="field"><label for="gc-pin">Gift Card PIN (4 digits)</label><input id="gc-pin" name="pin" inputmode="numeric" maxlength="4" value="${esc(pin)}"><small>Scratch the panel on the back of your card to reveal the PIN.</small></div><button>Check Value</button></form>`, errors.length ? 400 : 200)
  })
  router.get('/shopping-cart', (req, res) => res.redirect(`${B(res)}/cart`))
  router.get('/shopping-cart/start-checkout', (req, res) => res.redirect(`${B(res)}/checkout`))
  router.get('/order-history', (req, res) => {
    const b = B(res), s = v => typeof v === 'string' ? v.trim() : ''
    const mode = s(req.query.mode) === 'guest' ? 'guest' : 'member', number = s(req.query.order_number), email = s(req.query.email).toLowerCase()
    let result = ''
    if (mode === 'guest' && ('order_number' in req.query)) {
      const o = (retailOrders(req) || []).find(o => o.order_number === number && String(o.customer?.email || '').toLowerCase() === email)
      result = o ? `<div class="notice" role="status">Order found. <a href="${b}/account/orders/${esc(o.order_number)}">View order ${esc(o.order_number)}</a></div>` : `<div class="errors" role="alert"><p>We couldn't find an order matching those details. Check your order number and email address.</p></div>`
    }
    const tabs = `<div class="eb-tabs" role="tablist"><a role="tab" aria-selected="${mode === 'member'}" class="${mode === 'member' ? 'active' : ''}" href="${b}/order-history">EB World</a><a role="tab" aria-selected="${mode === 'guest'}" class="${mode === 'guest' ? 'active' : ''}" href="${b}/order-history?mode=guest">Guest</a></div>`
    const body = mode === 'member'
      ? (req.store.user ? `<section class="panel"><h2>EB World</h2><p>You're signed in as ${esc(req.store.user.email)}.</p><a class="button" href="${b}/account/order-history">View My Orders</a></section>` : `<section class="panel"><h2>EB World</h2><p>Sign in to your EB World account to view orders you placed while signed in.</p><a class="button" href="${b}/account">Sign In</a> <a href="${b}/account/sign-up">Create an account</a></section>`)
      : `${result}<form class="panel eb-narrow-form" method="get" action="${b}/order-history"><input type="hidden" name="mode" value="guest"><h2>Guest</h2><p>Use the order number from your confirmation email.</p><div class="field"><label for="track-order">Order number</label><input id="track-order" name="order_number" value="${esc(number)}"></div><div class="field"><label for="track-email">Email address</label><input id="track-email" name="email" type="email" autocomplete="email" value="${esc(email)}"></div><button>Track Order</button></form>`
    render(req, res, 'Track Order', `<p class="breadcrumb"><a href="${b}">Home</a> › Track Order</p><h1>Track Order</h1><p>Choose whether you are an EB World member or a Guest. The login you choose depends on whether you were signed in to EB World when you created your order.</p>${tabs}${body}<p><a href="${b}/help/orders-preorders">How do I track my order?</a></p>`)
  })
  router.get('/account/forgotten-password', (req, res) => {
    const b = B(res), email = typeof req.query.email === 'string' ? req.query.email.trim() : ''
    render(req, res, 'Reset password', `<h1>Reset password</h1>${email ? '<div class="notice" role="status">Password reset is currently unavailable. Please try again later or create a new EB World account.</div>' : ''}<form class="panel eb-narrow-form" method="get" action="${b}/account/forgotten-password"><div class="field"><label for="reset-email">Email</label><input id="reset-email" name="email" type="email" autocomplete="email" value="${esc(email)}"></div><button>Reset password</button> <a href="${b}/account">CANCEL</a></form>`)
  })
  for (const [slug, title, articles] of HELP_CATEGORIES) {
    router.get(`/help/${slug}`, (req, res) => {
      const b = B(res)
      render(req, res, `${title} - Help & Support`, `<p class="breadcrumb"><a href="${b}">Home</a> › <a href="${b}/help">Help &amp; Support</a> › ${esc(title)}</p><h1>${esc(title)}</h1><div class="eb-help-articles">${articles.map(([q, ans]) => `<details class="panel"><summary>${esc(q)}</summary><p>${esc(ans)}</p></details>`).join('')}</div><p><a href="${b}/help/contact">Submit a request</a></p>`)
    })
  }
  router.get('/sitemap', (req, res) => {
    const b = B(res)
    const info = [['Help & Support', '/help'], ['Find a Store', '/stores'], ['Track Order', '/order-history'], ['Cart', '/cart'], ['EB World Sign In', '/account'], ['Gift Card Balance', '/giftcards/balance'], ...SHOPPING_INFO.filter(([l]) => !['Help & Support', 'Find a Store'].includes(l)), ...LEGAL, ...HELP_CATEGORIES.map(([s, t]) => [`Help: ${t}`, `/help/${s}`])]
    render(req, res, 'Site Map', `<p class="breadcrumb"><a href="${b}">Home</a> › Site Map</p><h1>Site Map</h1><div class="eb-sitemap">${MENU.map(([l, h, kids]) => `<section><h2>${a(b, h, l)}</h2><ul>${kids.map(([kl, kh]) => `<li>${a(b, kh, kl)}</li>`).join('')}</ul></section>`).join('')}<section><h2>Shopping Information</h2><ul>${info.map(([l, h]) => `<li>${a(b, h, l)}</li>`).join('')}</ul></section></div>`)
  })
  router.get('/sitemap.xml', (req, res) => {
    const paths = new Set(['/', '/search', '/cart', '/account', '/stores', '/order-history', '/help', '/sitemap', '/plus', '/featured/egift-cards', '/giftcards/balance', ...MENU.flatMap(([, h, k]) => [h, ...k.map(x => x[1])]).filter(h => !h.includes('#')), ...SHOPPING_INFO.map(x => x[1]), ...LEGAL.map(x => x[1]), ...HELP_CATEGORIES.map(([s]) => `/help/${s}`)])
    const xml = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')
    res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...paths].map(p => `<url><loc>${xml(B(res) + p)}</loc></url>`).join('\n')}\n</urlset>`)
  })
}

export function helpHome(b, q, topicsHTML, field) {
  return `<div class="eb-help-hero"><p class="eb-kicker">EB Games Australia</p><h2>Frequently Asked Questions</h2><form action="${b}/help">${field('q', 'Search', { q })}<button>Search help</button></form></div>
  ${topicsHTML}
  <h2>Categories</h2><div class="eb-help-cats">${HELP_CATEGORIES.map(([s, t]) => `<a href="${b}/help/${s}">${esc(t)}</a>`).join('')}</div>
  <h2>Most Popular Answers</h2><ul class="eb-popular">${POPULAR_ANSWERS.map(t => { const cat = HELP_CATEGORIES.find(([, , arts]) => arts.some(([q]) => q === t || q.startsWith(t.slice(0, 20)))); return `<li><a href="${b}/help/${cat ? cat[0] : 'orders-preorders'}">${esc(t)}</a></li>` }).join('')}</ul>`
}
