// Pages for the reference-mode assortment: the Latest (home) page shelves, product pages for
// assortment items, and the PlayStation Direct hardware listings and product pages.
import { esc, money } from '../../lib/html.js'
import { ASSORTMENT, CATALOG, PRODUCTS, productPath, conceptPath, byId, PROMO_LINE, RELEASE } from './data.js'
import { DIRECT_DEPARTMENTS, SHELF_COLLECTIONS } from './shelf.js'
import { shelfImg } from './shelf-art.js'

const STORE_ITEMS = () => ASSORTMENT.filter(p => p.department !== 'hardware')
export const HARDWARE = () => ASSORTMENT.filter(p => p.department === 'hardware')
const gtaArt = p => `<img src="/static/reference/playstation-store/${p.cta === 'unavailable' ? 'gta-vi-upgrade.png' : p.edition === 'ultimate' ? 'gta-vi-ultimate.jpg' : 'gta-vi-standard.jpg'}" alt="${esc(p.title)}">`
const artOf = (p, alt) => p.shelf ? shelfImg(p, alt) : gtaArt(p)
const pct = p => p.originalPrice > p.price && p.price > 0 ? Math.round((1 - p.price / p.originalPrice) * 100) : 0
export const priceHtml = p => p.price === null ? 'Unavailable' : p.price === 0 ? 'Free' : `${pct(p) ? `<s>${money(p.originalPrice)}</s> ` : ''}${money(p.price)}`

export function shelfTile(base, p) {
  const chips = (p.chips || p.platforms).filter(c => ['PS5', 'PS4', 'PS VR2'].includes(c))
  return `<a class="ps-tile" href="${productPath(base, p)}"><span class="ps-tile-art">${artOf(p)}${pct(p) ? `<span class="ps-discount">-${pct(p)}%</span>` : ''}<span class="ps-chips">${chips.map(v => `<span class="ps-chip">${esc(v)}</span>`).join('')}</span></span><span class="ps-tile-type">${esc(p.type)}</span><span class="ps-tile-title">${esc(p.title)}</span>${p.plusTag ? `<span class="ps-plus-tag">PS Plus · ${esc(p.plusTag)}</span>` : ''}<span class="ps-tile-price">${priceHtml(p)}</span></a>`
}
const row = (base, title, items, href, id = '') => items.length ? `<section class="ps-section ps-shelf"${id ? ` id="${id}"` : ''}><div class="ps-section-heading"><h2>${esc(title)}</h2>${href ? `<a href="${href}">View all</a>` : ''}</div><div class="ps-shelf-row">${items.map(p => shelfTile(base, p)).join('')}</div></section>` : ''
const date = p => new Date(p.release).getTime()
const TODAY = Date.parse('2026-10-13')

// ---- Latest (home) ----
const HERO = [
  ['Marvel\'s Wolverine', 'Out now', 'Unleash the fury of Logan in a mature, standalone story from Insomniac Games.', 'Buy now'],
  ['Ghost of Yōtei: Complete Edition', 'New edition', 'Ghost of Yōtei with Ghost of Yōtei Legends and all post-launch content, out now.', 'Buy now'],
  ['GTA', 'Pre-order now', PROMO_LINE, 'Pre-Order'],
  ['EA SPORTS FC 27', 'Out now', 'The World\'s Game. More than 19,000 players, 700 teams and 120 stadiums.', 'Buy now'],
  ['Call of Duty: Modern Warfare 4', 'Pre-order now', 'The next chapter of Modern Warfare arrives October 23, 2026.', 'Pre-order'],
]
function hero(base) {
  const find = t => STORE_ITEMS().find(p => p.title === t)
  const gta = PRODUCTS.find(p => p.family === 'gta-vi' && p.cta === 'preorder')
  const slides = HERO.map(([t, eyebrow, line, cta]) => {
    if (t === 'GTA') return gta ? { title: 'Grand Theft Auto VI', eyebrow, line: `${line}`, sub: `Release date: ${RELEASE} · PS5`, cta, href: conceptPath(base), img: '<img src="/static/reference/playstation-store/gta-vi-hero.jpg" alt="">', thumb: gtaArt(gta) } : null
    const p = find(t)
    return p ? { title: p.title, eyebrow, line, sub: `${p.platforms.join(' / ')} · ${p.cta === 'preorder' ? `Release date: ${p.release}` : priceHtml(p)}`, cta, href: productPath(base, p), img: shelfImg(p, '', 1), thumb: shelfImg(p, p.title), p } : null
  }).filter(Boolean)
  return `<section class="ps-carousel" aria-label="Featured">${slides.map((s, i) => `<input type="radio" name="ps-hero" id="ps-hero-${i}" class="ps-carousel-radio"${i ? '' : ' checked'}>`).join('')}<div class="ps-carousel-slides">${slides.map((s, i) => `<article class="ps-carousel-slide ps-carousel-slide-${i}"><div class="ps-carousel-bg${s.p ? ' is-shelf' : ''}">${s.img}${s.p ? `<span class="ps-carousel-key">${shelfImg(s.p, '')}</span>` : ''}</div><div class="ps-carousel-card"><p class="ps-pdc-eyebrow">${esc(s.eyebrow)}</p>${i ? `<h2>${esc(s.title)}</h2>` : `<h1>${esc(s.title)}</h1>`}<p>${esc(s.line)}</p><p class="ps-home-hero-date">${s.sub}</p><a class="ps-pill ${s.cta.startsWith('Pre') ? 'ps-pill-orange' : 'ps-pill-blue'}" href="${s.href}">${esc(s.cta)}</a></div></article>`).join('')}</div><div class="ps-carousel-thumbs" role="group" aria-label="Choose a featured game">${slides.map((s, i) => `<label for="ps-hero-${i}" class="ps-carousel-thumb ps-carousel-thumb-${i}" title="${esc(s.title)}">${s.thumb}<span class="visually-hidden">${esc(s.title)}</span></label>`).join('')}</div></section>`
}
export function shelfHome(base) {
  const items = STORE_ITEMS()
  const games = items.filter(p => p.contentType === 'base-game' && p.editionName === 'Standard Edition')
  const fresh = games.filter(p => p.cta === 'cart' && date(p) <= TODAY && date(p) >= Date.parse('2026-07-15')).sort((a, b) => date(b) - date(a))
  const gta = PRODUCTS.filter(p => p.family === 'gta-vi')
  const pre = [...gta, ...items.filter(p => p.cta === 'preorder' && p.editionName === 'Standard Edition').sort((a, b) => date(a) - date(b))]
  const free = games.filter(p => p.price === 0)
  const deals = items.filter(p => pct(p) >= 40 && p.contentType === 'base-game').sort((a, b) => a.bestRank - b.bestRank)
  const best = games.filter(p => p.hot && p.price > 0).sort((a, b) => a.bestRank - b.bestRank)
  const extras = items.filter(p => p.contentType === 'add-on' || p.contentType === 'consumable').sort((a, b) => a.downloadRank - b.downloadRank)
  const vr = items.filter(p => p.vr === 'PS VR2 required')
  const plus = items.filter(p => p.plusTag)
  const hw = HARDWARE().filter(p => p.directDepartment !== 'add-ons' && !/Chroma|Sterling|Galactic|Nova|Cosmic|Cobalt|Limited|Stick Module|Charging|PC adapter|Bundle/.test(p.title))
  const promos = [['Collections', 'Find a world that feels like yours.', `${base}/en-us/pages/collections`], ['Deals', 'Offers on games, add-ons and more.', `${base}/en-us/pages/deals`], ['Browse', 'Explore every game by genre, price and platform.', `${base}/en-us/pages/browse`], ['PlayStation Store gift cards', 'Add funds to your wallet.', `${base}/en-us/playstation-gift-cards`]]
  return `${hero(base)}<h2 class="visually-hidden">Latest</h2>
${row(base, 'New releases', fresh.slice(0, 12), `${base}/en-us/collection/new-releases`)}
${row(base, 'Pre-orders', pre.slice(0, 12), `${base}/en-us/collection/pre-orders`, 'pre-orders')}
${row(base, 'Bestselling games', best.slice(0, 12), `${base}/en-us/pages/browse?sort=best-selling`)}
<section class="ps-plus-feature"><div><p>PLAYSTATION PLUS</p><h2>Get more of what you love with PlayStation Plus</h2><p>Monthly games, online multiplayer, exclusive discounts and the Game Catalog.</p><a class="ps-pill ps-pill-blue" href="${base}/en-us/pages/subscriptions">Explore PlayStation Plus</a></div><span aria-hidden="true">✚</span></section>
${row(base, 'Autumn Sale: up to 85% off', deals.slice(0, 12), `${base}/en-us/pages/deals`)}
${row(base, 'Free-to-play games', free.slice(0, 12), `${base}/en-us/collection/free-to-play`)}
${row(base, 'Add-ons and in-game currency', extras.slice(0, 12), `${base}/en-us/collection/add-ons`)}
${row(base, 'Discover the Game Catalog', plus.slice(0, 12), `${base}/en-us/pages/browse?plus=Extra`)}
${row(base, 'PS VR2 games', vr, `${base}/en-us/collection/ps-vr2`)}
${row(base, 'Shop PS5 consoles and accessories', hw.slice(0, 12), `${base}/direct.playstation.com/en-us`)}
<section class="ps-section"><h2>Explore PlayStation Store</h2><div class="ps-category-grid">${promos.map(([t, d, h]) => `<a href="${h}"><b>${esc(t)}</b><small>${esc(d)}</small></a>`).join('')}</div></section>`
}

// ---- product page for assortment items ----
const ESRB = { E: 'Everyone', 'E10+': 'Everyone 10+', T: 'Teen', M: 'Mature 17+', RP: 'Rating Pending' }
export function shelfProductPage({ base, p, here, toast, owned, cta }) {
  if (p.department === 'hardware') return directProductPage({ base, p })
  const sub = p.contentType === 'subscription'
  const family = STORE_ITEMS().filter(e => e.family === p.family && e.contentType === p.contentType && !sub)
  const editions = sub ? STORE_ITEMS().filter(e => e.contentType === 'subscription' && e.tier === p.tier) : family.length > 1 ? family : []
  const baseGame = p.baseId ? byId(p.baseId) : null
  const addons = sub ? [] : STORE_ITEMS().filter(e => e.baseId && (e.baseId === p.id || (p.includedSkus || []).includes(e.baseId)))
  const related = sub ? STORE_ITEMS().filter(e => e.contentType === 'subscription' && e.tier !== p.tier && e.months === p.months) : STORE_ITEMS().filter(e => e.id !== p.id && e.family !== p.family && e.genres === p.genres && e.contentType === 'base-game' && e.editionName === 'Standard Edition').slice(0, 12)
  const compat = sub ? ['PS5 and PS4', 'Auto-renewing membership', 'Online multiplayer included'] : [p.onlineRequired ? 'Online play required' : 'Offline play enabled', p.localPlayers > 1 ? `1 - ${p.localPlayers} players` : '1 player', p.onlinePlayers ? `Online play (${p.onlinePlayers} players)` : null, ...p.features, p.vr !== 'No VR' ? p.vr : null, p.contentType === 'consumable' || p.price === 0 ? 'In-game purchases optional' : null].filter(Boolean)
  const rating = p.ratingCount ? `<a class="ps-rating-link" href="#ratings">★ ${p.score.toFixed(2)} · ${p.ratingCount >= 1000 ? `${(p.ratingCount / 1000).toFixed(1).replace(/\.0$/, '')}K` : p.ratingCount} ratings</a>` : ''
  const info = sub ? [['Membership', `PlayStation Plus ${p.tier}`], ['Term', p.editionName], ['Renewal', 'Renews automatically until cancelled'], ['Platform', 'PS5, PS4']] : [['Platform', p.platforms.join(', ')], ['Release', p.release], ['Publisher', p.publisher], ['Genres', p.genres], ['Content', { 'base-game': 'Full game', 'add-on': 'Add-on', consumable: 'In-game currency' }[p.contentType] || 'Full game'], ['Format', 'Digital license']]
  const shots = sub ? '' : `<section id="screenshots" class="ps-shelf-media" aria-label="Screenshots">${[1, 2, 3].map(v => shelfImg(p, `${p.title} screenshot ${v}`, v)).join('')}</section>`
  return `<section class="ps-hero ps-shelf-hero"><div class="ps-hero-art" aria-hidden="true">${shelfImg(p, '', sub ? 0 : 1)}</div><div class="ps-hero-card"><span class="ps-shelf-cover">${shelfImg(p)}</span><h1>${esc(p.title)}</h1><p class="ps-publisher">${esc(p.publisher)}</p>${p.cta === 'preorder' ? `<p class="ps-unlock">Release date: ${esc(p.release)}</p>` : ''}<ul class="ps-tags">${p.chips.map(v => `<li>${esc(v)}</li>`).join('')}<li>${esc(p.type)}</li></ul><p class="ps-price">${priceHtml(p)}</p>${pct(p) ? `<p class="ps-promo">Save ${pct(p)}% · Autumn Sale ends 10/22/2026 11:59 PM PT</p>` : ''}${p.plusTag ? `<p class="ps-plus-tag">Included with PlayStation Plus ${esc(p.plusTag)}</p>` : ''}${rating}${toast ? `<p role="status" class="ps-toast">${esc(toast)}</p>` : ''}<div class="ps-cta">${cta(base, p, here, owned)}</div>${sub ? '' : `<div class="ps-esrb"><span class="ps-esrb-badge">${esc(p.rating)}</span><span>${ESRB[p.rating] || ''}${p.price === 0 || p.contentType === 'consumable' ? '<hr>In-Game Purchases' : ''}</span></div>`}</div></section>
<nav class="ps-product-nav" aria-label="Product sections"><a href="#about">About</a>${editions.length ? '<a href="#editions">Editions</a>' : ''}${addons.length ? '<a href="#addons">Add-Ons</a>' : ''}${p.ratingCount ? '<a href="#ratings">Ratings</a>' : ''}<a href="#info">Game info</a></nav>
<div class="ps-product-body"><ul class="ps-compat">${compat.map(v => `<li>${esc(v)}</li>`).join('')}</ul>${shots}
${baseGame ? `<section class="ps-requirements"><h2>Base game required</h2><p>This ${p.contentType === 'consumable' ? 'in-game currency' : 'add-on'} requires <a href="${productPath(base, baseGame)}">${esc(baseGame.title)}</a> for ${baseGame.platforms.join(' / ')}. Base game sold separately.</p></section>` : ''}
${editions.length ? `<section id="editions" class="ps-editions"><h2>${sub ? 'Membership terms' : 'Editions'}:</h2><div class="ps-edition-cards">${editions.map(e => `<article class="ps-edition-card${e.id === p.id ? ' is-current' : ''}"><a href="${productPath(base, e)}">${shelfImg(e)}</a><div class="ps-edition-body"><h3><a href="${productPath(base, e)}">${esc(sub ? e.editionName : e.editionName)}</a></h3><ul class="ps-bullets">${(sub ? [e.blurb] : e.bullets).map(b => `<li>${esc(b)}</li>`).join('')}</ul><p class="ps-price">${priceHtml(e)}</p><div class="ps-cta">${cta(base, e, here, owned)}</div></div></article>`).join('')}</div></section>` : ''}
${addons.length ? `<section id="addons" class="ps-addons"><h2>Add-Ons</h2><div class="ps-shelf-row">${addons.map(a => shelfTile(base, a)).join('')}</div></section>` : ''}
<section id="about" class="ps-legal-info"><h2>${sub ? 'About this membership' : 'Game and Legal Info'}</h2><p>${esc(p.blurb)}</p>${p.bullets.length > 1 || sub ? `<h3>${sub ? 'Benefits' : 'Includes'}</h3><ul class="ps-bullets">${p.bullets.map(b => `<li>${esc(b)}</li>`).join('')}</ul>` : ''}</section>
${p.ratingCount ? `<section id="ratings" class="ps-ratings"><h2>Ratings</h2><p><strong>${p.score.toFixed(2)}</strong> <span aria-hidden="true">★★★★★</span> · ${p.ratingCount.toLocaleString('en-US')} ratings</p>${p.distribution.map((v, i) => `<div class="ps-rating-row"><span>${5 - i} ★</span><meter aria-label="${5 - i} star ratings" min="0" max="100" value="${v}">${v}%</meter><span>${v}%</span></div>`).join('')}</section>` : ''}
<section id="info" class="ps-game-info"><h2>${sub ? 'Membership info' : 'Game info'}</h2><dl class="ps-info-table">${info.map(([k, v]) => `<div><dt>${k}:</dt><dd>${esc(v)}</dd></div>`).join('')}</dl></section>
<section class="ps-legal-text"><p>${sub ? 'PlayStation Plus is an ongoing subscription with a recurring fee charged every period at the then-current price until cancelled. Cancel any time in Settings > Users and Accounts > Account > Payment and Subscriptions.' : 'Purchase grants a license to the digital product subject to the Terms of Service and User Agreement and any other applicable terms, and is non-refundable except as described in the PlayStation Store Cancellation Policy.'}</p><p>${esc(p.publisher)}. All trademarks belong to their respective owners.</p></section></div>
${row(base, sub ? 'Other memberships' : 'You may also like', related, sub ? `${base}/en-us/pages/subscriptions` : `${base}/en-us/pages/browse?genre=${encodeURIComponent(p.genres)}`)}`
}

// ---- PlayStation Direct ----
export const DIRECT_SORTS = [['featured', 'Featured'], ['price-asc', 'Price: Low to High'], ['price-desc', 'Price: High to Low'], ['rating', 'Top Rated'], ['name', 'Name: A to Z']]
const PRICE_BANDS = [['under50', 'Under $50'], ['50to100', '$50 – $100'], ['100to300', '$100 – $300'], ['over300', 'Over $300']]
export function directListing(base, path, query = {}, scope) {
  const all = HARDWARE().filter(scope)
  if (!all.length) return null
  const depts = DIRECT_DEPARTMENTS.filter(([d]) => all.some(p => p.directDepartment === d))
  const q = k => typeof query[k] === 'string' ? query[k] : ''
  const category = depts.some(([d]) => d === q('category')) ? q('category') : ''
  const band = PRICE_BANDS.some(([b]) => b === q('price')) ? q('price') : ''
  const sort = DIRECT_SORTS.some(([s]) => s === q('sort')) ? q('sort') : 'featured'
  const inBand = p => !band || (band === 'under50' ? p.price < 50 : band === '50to100' ? p.price >= 50 && p.price <= 100 : band === '100to300' ? p.price > 100 && p.price <= 300 : p.price > 300)
  const list = all.filter(p => (!category || p.directDepartment === category) && inBand(p))
  const sorts = { 'price-asc': (a, b) => a.price - b.price, 'price-desc': (a, b) => b.price - a.price, rating: (a, b) => b.score - a.score, name: (a, b) => a.title.localeCompare(b.title) }
  if (sorts[sort]) list.sort(sorts[sort])
  const radio = (name, value, label, current) => `<label><input type="radio" name="${name}" value="${esc(value)}"${current === value ? ' checked' : ''}> ${esc(label)}</label>`
  return `<div class="ps-pdc-body ps-direct-layout"><aside class="ps-direct-filters" aria-label="Filters"><form method="get" action="${base}${path}"><h2>Filter</h2><fieldset><legend>Category</legend>${radio('category', '', 'All', category)}${depts.map(([d, l]) => radio('category', d, `${l} (${all.filter(p => p.directDepartment === d).length})`, category)).join('')}</fieldset><fieldset><legend>Price</legend>${radio('price', '', 'Any price', band)}${PRICE_BANDS.map(([b, l]) => radio('price', b, l, band)).join('')}</fieldset><label class="ps-direct-sort">Sort by<select name="sort">${DIRECT_SORTS.map(([s, l]) => `<option value="${s}"${s === sort ? ' selected' : ''}>${l}</option>`).join('')}</select></label><button class="ps-pill ps-pill-blue" type="submit">Apply</button> <a href="${base}${path}">Clear all</a></form></aside>
<section class="ps-direct-results"><p class="ps-direct-count">${list.length} result${list.length === 1 ? '' : 's'}</p>${list.length ? `<div class="ps-direct-grid">${list.map(p => directCard(base, p)).join('')}</div>` : `<div class="ps-empty-state"><h2>No products match these filters</h2><p><a href="${base}${path}">Clear all filters</a></p></div>`}</section></div>`
}
const stars = p => `<span class="ps-stars" aria-label="Rated ${p.score.toFixed(1)} out of 5">★ ${p.score.toFixed(1)}</span> <span class="ps-muted">(${p.ratingCount.toLocaleString('en-US')})</span>`
function directCard(base, p) {
  return `<article class="ps-direct-card"><a href="${productPath(base, p)}" class="ps-direct-card-art">${shelfImg(p)}</a><h3><a href="${productPath(base, p)}">${esc(p.title)}</a></h3><p>${stars(p)}</p><p class="ps-direct-price">${priceHtml(p)}</p><p class="ps-direct-stock">In stock · Free standard shipping</p><form method="post" action="${base}/en-us/cart/add"><input type="hidden" name="sku" value="${esc(p.id)}"><input type="hidden" name="returnTo" value="${esc(productPath(base, p))}"><button class="ps-pill ps-pill-blue" type="submit">Add to Cart</button></form></article>`
}
export function directProductPage({ base, p }) {
  const dept = DIRECT_DEPARTMENTS.find(([d]) => d === p.directDepartment)?.[1] || 'Accessories'
  const listPath = p.directDepartment === 'consoles' ? '/direct.playstation.com/en-us/hardware/ps5' : '/direct.playstation.com/en-us/accessories/ps5'
  const related = HARDWARE().filter(e => e.id !== p.id && e.directDepartment === p.directDepartment).slice(0, 6)
  const views = ['Front view', 'Reverse view', 'Detail view', 'In the box']
  return `<div class="ps-direct-bar"><b>PlayStation Direct</b><nav aria-label="PlayStation Direct"><a href="${base}/direct.playstation.com/en-us/hardware/ps5">PS5 consoles</a><a href="${base}/direct.playstation.com/en-us/accessories/ps5">PS5 accessories</a><a href="${base}/direct.playstation.com/en-us/games/catalog">Games &amp; merchandise</a></nav></div>
<div class="ps-pdc-body"><nav class="ps-crumbs" aria-label="Breadcrumb"><a href="${base}/direct.playstation.com/en-us">PlayStation Direct</a> <span aria-hidden="true">›</span> <a href="${base}${listPath}">${esc(dept)}</a> <span aria-hidden="true">›</span> <span>${esc(p.title)}</span></nav>
<section class="ps-direct-product"><div class="ps-direct-gallery" aria-label="Product images">${views.map((v, i) => `<input type="radio" name="ps-view" id="ps-view-${i}"${i ? '' : ' checked'}>`).join('')}<div class="ps-direct-stage">${views.map((v, i) => `<figure class="ps-direct-view ps-direct-view-${i}">${shelfImg(p, `${p.title} – ${v}`, i)}</figure>`).join('')}</div><div class="ps-direct-thumbs">${views.map((v, i) => `<label for="ps-view-${i}" class="ps-direct-thumb-${i}">${shelfImg(p, v, i)}</label>`).join('')}</div></div>
<div class="ps-direct-buy"><p class="ps-pdc-eyebrow">${esc(dept)}</p><h1>${esc(p.title)}</h1><p>${stars(p)}</p><p class="ps-direct-price">${priceHtml(p)}</p>${pct(p) ? `<p class="ps-promo">Save ${money(p.originalPrice - p.price)} · Limited-time offer</p>` : ''}<p class="ps-direct-stock">In stock</p><p>${esc(p.blurb)}</p><form method="post" action="${base}/en-us/cart/add"><input type="hidden" name="sku" value="${esc(p.id)}"><input type="hidden" name="returnTo" value="${esc(productPath(base, p))}"><button class="ps-pill ps-pill-blue ps-pill-block" type="submit">Add to Cart</button></form><ul class="ps-direct-perks"><li><b>Free standard shipping</b> · arrives in 3–5 business days</li><li>Ships to United States addresses only</li><li>Limit 1 per order · Sign in with your account for PlayStation to buy</li><li>Item number ${esc(p.id)}</li></ul></div></section>
<section class="ps-pdc-section"><h2>Specifications</h2><dl class="ps-direct-specs">${Object.entries(p.specs).map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl></section>
<section class="ps-pdc-section" id="reviews"><h2>Reviews</h2><p><strong>${p.score.toFixed(1)} out of 5</strong> · ${p.ratingCount.toLocaleString('en-US')} reviews</p>${p.distribution.map((v, i) => `<div class="ps-rating-row"><span>${5 - i} ★</span><meter aria-label="${5 - i} star reviews" min="0" max="100" value="${v}">${v}%</meter><span>${v}%</span></div>`).join('')}</section>
${related.length ? `<section class="ps-pdc-section"><h2>You might also like</h2><div class="ps-direct-grid">${related.map(e => directCard(base, e)).join('')}</div></section>` : ''}</div>`
}

// ---- collections (reference) ----
export function shelfCollectionsPage(base) {
  const items = [...PRODUCTS, ...STORE_ITEMS()]
  return `<section class="ps-section"><h1>Collections</h1><p>Find a world that feels like yours.</p><div class="ps-category-grid">${SHELF_COLLECTIONS.map(([id, t, d, pred]) => `<a href="${base}/en-us/collection/${id}"><b>${esc(t)}</b><small>${esc(d)} · ${items.filter(pred).length} items</small></a>`).join('')}</div></section>${['horror', 'studios', 'together'].map(id => { const c = SHELF_COLLECTIONS.find(x => x[0] === id); return row(base, c[1], items.filter(c[3]).slice(0, 12), `${base}/en-us/collection/${id}`) }).join('')}`
}
export function shelfSubscriptionRows(base) {
  const subs = STORE_ITEMS().filter(p => p.contentType === 'subscription')
  return `${row(base, 'Buy a PlayStation Plus membership', subs, null, 'memberships')}${row(base, 'Discover the Game Catalog', STORE_ITEMS().filter(p => p.plusTag), `${base}/en-us/pages/browse?plus=Extra`)}`
}
export const browsable = () => CATALOG.filter(p => p.department !== 'hardware')
