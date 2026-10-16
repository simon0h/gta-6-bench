import { esc } from '../../lib/html.js'
import { authenticate, findAccount, createAccount } from '../../lib/accounts.js'
import { MENUS, FOOTER, LEGAL, HELP_MENU, FILTERS } from './site-data.js'
import { HELP_TOPICS, HELP_ARTICLES, INFO_PAGES, HUB_COPY, STORES } from './site-content.js'
import { capturedSearchProducts } from './search-reference.js'
import { jordanMark, swoosh } from './official-marks.js'
import { shelf, listingItems, HUB_ITEMS, artUrl } from './shelf.js'

// Site pages for reference mode. They reproduce nike.com's navigation, layout
// and service pages without adding products: category listings show their
// real structure; product grids come from the shelf (shelf.js).

const img = n => `/static/reference/nike/search-product-${n}.jpg`
const pick = n => capturedSearchProducts[n - 1]

// ---------- listing registry (/w/<slug>) ----------
const possessive = { Men: "Men's", Women: "Women's", Kids: "Kids'" }
function listingTitle(menu, group, label) {
  const bare = label.replace(/^All /, '').replace(/^Shop All Sale$/, 'Sale')
  if (possessive[menu.label]) {
    const p = possessive[menu.label]
    if (/Kids|Baby/.test(label)) return `${label} ${group.label}`
    if (group.label === 'Shoes' && !/Shoes/.test(bare)) return `${p} ${bare} Shoes`
    if (group.label === 'Shop by Color') return `${p} ${bare}`
    if (group.label === 'Shop By Sport') return `${p} ${bare}`
    return `${p} ${bare}`
  }
  if (menu.label === 'Jordan') {
    if (possessive[group.label]) return label === 'Shop All' ? `${possessive[group.label]} Jordan` : label === 'AJ1' ? `${possessive[group.label]} Air Jordan 1 Shoes` : `${possessive[group.label]} Jordan ${label}`
    return /Jordan/.test(bare) ? bare : `Jordan ${bare}`
  }
  if (menu.label === 'NikeSKIMS') return /NikeSKIMS/.test(bare) ? bare : `NikeSKIMS ${bare}`
  if (['Basketball', 'Soccer', 'Golf'].includes(group.label)) return `${group.label} ${bare}`
  if (group.label === 'Running' && label !== 'Running Shoe Finder') return `${bare} Running`
  return bare
}
export const LISTINGS = new Map()
const OVERRIDES = {
  'mens-shoes-nik1zy7ok': "Men's Shoes & Sneakers", 'womens-shoes-5e1x6zy7ok': "Women's Shoes & Sneakers", 'kids-shoes-v4dhzy7ok': "Kids' Shoes & Sneakers",
  'sunglasses-arlyp': 'Sunglasses', 'gymnastics-dance-inspired-2obuy': 'Gymnastics', 'nikeskims-b2asd': 'NikeSKIMS Clothing',
  'jordan-accessories-equipment-37eefzawwpw': 'Jordan Accessories', 'mens-sale-3yaepznik1': "Men's Sale", 'womens-sale-3yaepz5e1x6': "Women's Sale", 'kids-sale-3yaepzv4dh': "Kids' Sale",
}
for (const menu of MENUS) for (const group of menu.groups) {
  const siblings = group.links.filter(([, p]) => p.startsWith('/w/'))
  const entries = [...group.links, [group.label, group.path]]
  for (const [label, path] of entries) {
    if (!path.startsWith('/w/')) continue
    const slug = path.slice(3)
    if (LISTINGS.has(slug)) continue
    const title = OVERRIDES[slug] || listingTitle(menu, group, label)
    LISTINGS.set(slug, { title, dept: menu, group: group.label, siblings })
  }
}
const sale = [['Shoes', '/w/sale-shoes-3yaepzy7ok'], ['Jordan', '/w/sale-jordan-37eefz3yaep'], ['Hoodies and Pullovers', '/w/sale-hoodies-pullovers-3yaepz6rive'], ['Pants and Tights', '/w/sale-pants-tights-2kq19z3yaep'], ['Jackets & Vests', '/w/sale-jackets-vests-3yaepz50r7y'], ['Tops and T-Shirts', '/w/sale-tops-t-shirts-3yaepz9om13'], ['Shorts', '/w/sale-shorts-38fphz3yaep'], ['Sports Bras', '/w/sale-sports-bras-3yaepz40qgm']]
LISTINGS.set('sale-3yaep', { title: 'Shop All Sale', group: 'Sale', siblings: sale })
for (const [label, path] of sale) if (!LISTINGS.has(path.slice(3))) LISTINGS.set(path.slice(3), { title: `Sale ${label}`, group: 'Sale', siblings: sale })
LISTINGS.set('converse-akmjx', { title: 'Converse', group: 'Converse', siblings: [] })
const shoeSubcats = [['Jordan', '/w/mens-jordan-shoes-37eefznik1zy7ok'], ['Lifestyle', '/w/mens-lifestyle-shoes-13jrmznik1zy7ok'], ['Running', '/w/mens-running-shoes-37v7jznik1zy7ok'], ['Basketball', '/w/mens-basketball-shoes-3glsmznik1zy7ok'], ['Training & Gym', '/w/mens-training-gym-shoes-58jtoznik1zy7ok'], ['Soccer', '/w/soccer-shoes-1gdj0zy7ok'], ['Golf', '/w/golf-shoes-23q9wzy7ok'], ['Tennis', '/w/tennis-shoes-ed1qzy7ok'], ['Track & Field', '/w/track-field-shoes-7nem3zy7ok'], ['Nike By You', '/w/mens-nike-by-you-shoes-6ealhznik1zy7ok']]
LISTINGS.get('mens-shoes-nik1zy7ok').siblings = shoeSubcats

// ---------- small building blocks ----------
const A = (base, path, label, cls = '') => `<a${cls ? ` class="${cls}"` : ''} href="${base}${path}">${esc(label)}</a>`
const pills = (base, links) => `<div class="nkx-pills">${links.map(([l, p]) => A(base, p, l)).join('')}</div>`
const tile = (base, path, label, opts = {}) => `<a class="nkx-tile${opts.tone ? ` nkx-tone-${opts.tone}` : ''}" href="${base}${path}">${opts.image ? `<img${opts.product || opts.image.endsWith('.svg') ? ' class="nkx-tile-product"' : ''} src="${opts.image}" alt="">` : `<span class="nkx-tile-art" aria-hidden="true">${esc(opts.mark || label)}</span>`}<span class="nkx-tile-label">${esc(label)}</span>${opts.cta ? `<span class="nkx-tile-cta">${esc(opts.cta)}</span>` : ''}</a>`
// Tile pictures come from the shelf: the best-reviewed style in the tile's own
// listing or hub, skipping styles another tile on the page already shows.
function tileArt(base, path, used, prefer = () => true) {
  const items = path.startsWith('/w/') ? listingItems(path.slice(3)) : HUB_ITEMS[path] ? shelf.filter(HUB_ITEMS[path]) : []
  const ranked = [...items].sort((a, b) => b.reviews - a.reviews)
  const p = ranked.find(x => !used.has(x.id) && prefer(x)) || ranked.find(x => !used.has(x.id))
  if (!p) return undefined
  used.add(p.id)
  // Category tiles show a colourway other than plain black where one exists,
  // so a row of tiles does not read as the same black shoe four times.
  const bright = p.colorways.filter(c => !/^(Black|Anthracite|Dark Smoke)/i.test(c.color || c.name || ''))
  const pick = bright.length ? bright[used.size % bright.length] : p.colorways[0]
  return artUrl(base, pick.style)
}
const sectionHead = (title, extra = '') => `<div class="nkx-section-head"><h2>${esc(title)}</h2>${extra}</div>`

// shots: product photos (search-product-N.jpg) lined up on a studio backdrop,
// standing in for campaign photography. headline: a text-only story block, the
// way nike.com sets a headline and links under its imagery. mark: a large brand
// mark for colour panels without a photo.
function hero(base, { eyebrow, title, text, tone, image, links, tall, shots, headline, mark }) {
  const ctas = links ? `<div class="nkx-hero-ctas">${links.map(([l, p]) => A(base, p, l, 'nkx-btn')).join('')}</div>` : ''
  if (headline) return `<section class="nkx-headline">${eyebrow ? `<p class="nkx-eyebrow">${esc(eyebrow)}</p>` : ''}<h2 class="nkx-display">${esc(title)}</h2>${text ? `<p>${esc(text)}</p>` : ''}${ctas}</section>`
  if (shots?.length) tone = 'studio'
  const lineup = shots?.length ? `<div class="nkx-hero-shots nkx-shots-${shots.length}" aria-hidden="true">${shots.map(n => `<img src="${img(n)}" alt="">`).join('')}</div>` : ''
  const art = mark ? `<span class="nkx-hero-mark" aria-hidden="true">${mark}</span>` : ''
  return `<section class="nkx-hero nkx-tone-${tone}${tall ? ' nkx-hero-tall' : ''}${lineup ? ' nkx-hero-lineup' : ''}">${image ? `<img class="nkx-hero-image" src="${image}" alt="">` : ''}${lineup}${art}<div class="nkx-hero-copy">${eyebrow ? `<p class="nkx-eyebrow">${esc(eyebrow)}</p>` : ''}<h2 class="nkx-display">${esc(title)}</h2>${text ? `<p>${esc(text)}</p>` : ''}${links ? `<div class="nkx-hero-ctas">${links.map(([l, p]) => A(base, p, l, 'nkx-btn')).join('')}</div>` : ''}</div></section>`
}

// ---------- homepage ----------
// rows: product rows from the shelf (shelf-pages.js), placed where nike.com's
// homepage carries its product carousels.
export function homePage(base, rows = {}) {
  return `<div class="nkx-home" data-reference-state="catalog"><h1 class="sr-only">Nike. Just Do It</h1>
${hero(base, { eyebrow: 'Nike GORE-TEX', title: 'WEATHER, HANDLED', text: 'Waterproof running, trail and everyday shoes, built for wet-weather miles.', tall: true, shots: [21, 24, 32], links: [['Shop Running', '/running'], ['Shop ACG', '/acg']] })}
${hero(base, { eyebrow: 'Jayden Reed, Wide Receiver', title: 'FULLY INVESTED', text: 'Built for the season ahead. Shop football cleats, gloves and training gear.', headline: true, links: [['Shop Football', '/us-football'], ['Shop Cleats', '/w/soccer-shoes-1gdj0zy7ok']] })}
<div class="nkx-split">
${hero(base, { eyebrow: 'Jordan', title: 'AIR JORDAN 1 HIGH OG "ROYAL"', text: 'A classic colorway returns.', tone: 'royal', mark: jordanMark, links: [['Shop', '/w/mens-jordan-1-shoes-4fokyznik1zy7ok']] })}
${hero(base, { eyebrow: 'Nike Hybrid RN', title: 'Train Everything', text: 'One shoe for running, lifting and everything between.', tone: 'stone', image: img(12), links: [['Shop', '/training/hybrid']] })}
</div>
${rows.top || ''}
${hero(base, { eyebrow: 'Brice Turang, Second Baseman', title: 'CROWN THE SEASON', text: 'Baseball gear built for October.', headline: true, links: [['Shop Baseball', '/baseball']] })}
<div class="nkx-split">
${hero(base, { eyebrow: "A'ja Wilson", title: 'Last Word', text: "A'Two, A'ja Wilson's signature shoe.", tone: 'berry', image: img(18), links: [['Shop Basketball', '/basketball']] })}
${hero(base, { eyebrow: 'ACG', title: 'OUTSIDE, ON YOUR TERMS', text: 'Trail shoes with GORE-TEX protection for every season.', tone: 'stone', image: img(27), links: [['Shop ACG', '/acg']] })}
</div>
${hero(base, { eyebrow: 'NikeSKIMS', title: 'BODY OBSESSED', text: 'Sculpting fabrics for training and every day.', headline: true, links: [['Shop NikeSKIMS', '/nikeskims']] })}
${hero(base, { eyebrow: 'Running', title: 'EVERY. DAY. SPEED.', text: 'Daily trainers with race-day energy.', tone: 'sky', image: img(28), links: [['Shop Running', '/running'], ['Running Shoe Finder', '/running-shoe-finder']] })}
${hero(base, { eyebrow: 'Soccer', title: 'BRIGHT LIGHTS PACK', text: 'Boots made to be seen under the lights.', tone: 'volt', image: img(7), links: [['Shop Soccer', '/soccer']] })}
${rows.mid || ''}
<section class="nkx-section">${sectionHead('TRENDING')}<div class="nkx-tiles nkx-tiles-3">${tile(base, '/w/new-mens-3n82yznik1', 'New Arrivals', { image: img(8), cta: 'Shop' })}${tile(base, '/w/mens-best-76m50znik1', 'Best Sellers', { image: img(15), cta: 'Shop' })}${tile(base, '/w/sale-3yaep', 'Shop All Sale', { image: img(19), cta: 'Shop' })}</div></section>
<section class="nkx-section">${sectionHead('Shop by Sport')}<div class="nkx-tiles nkx-tiles-4">${tile(base, '/running', 'Running', { image: img(21) })}${tile(base, '/basketball', 'Basketball', { image: img(4) })}${tile(base, '/soccer', 'Soccer', { image: img(7) })}${tile(base, '/golf', 'Golf', { image: img(1) })}</div></section>
${rows.end || ''}
<section class="nkx-join">${'<h2 class="nkx-display">BECOME A MEMBER</h2>'}<p>Sign up for free. Join the community.</p><div class="nkx-hero-ctas">${A(base, '/membership', 'Join Us', 'nkx-btn nkx-btn-dark')}${A(base, '/register', 'Sign In', 'nkx-btn nkx-btn-outline')}</div></section>
</div>`
}

// ---------- department landing ----------
const DEPT_FEATURES = {
  Men: { trending: 'Merciless Play. All-Out Style.', p: 'mens', code: 'nik1', shots: [29, 8, 15] },
  Women: { trending: 'Not Today, Sun.', p: 'womens', code: '5e1x6', shots: [26, 31, 24] },
  Kids: { trending: 'Ready for Anything', p: 'kids', code: 'v4dh', shots: [20, 25] },
}
export function departmentPage(base, menu) {
  const p = possessive[menu.label]
  const [newF, shoes, clothing, acc] = menu.groups
  const sub = [['Shop All', newF.path], ['Shoes', shoes.path], ['Clothing', clothing.path], ['Accessories', acc.path], ['Sale', newF.links.find(([l]) => l === 'Shop All Sale')[1]]]
  const shoeLinks = shoes.links.map(([l, path]) => [l === 'Sportswear' ? 'Lifestyle' : l, path])
  return `<div class="nkx-dept-page"><div class="nkx-dept-bar"><h1>${esc(menu.label)}</h1><nav aria-label="${esc(menu.label)}">${sub.map(([l, path]) => A(base, path, l)).join('')}</nav></div>
${hero(base, { eyebrow: `${p} New Arrivals`, title: DEPT_FEATURES[menu.label].trending, text: 'New styles for the season, on and off the field.', shots: DEPT_FEATURES[menu.label].shots, tall: true, links: [['Shop New Arrivals', newF.path], ['Shop Best Sellers', newF.links[1][1]]] })}
<section class="nkx-section">${sectionHead('Featured')}<div class="nkx-tiles nkx-tiles-3">${newF.links.slice(0, 3).map(([l, path], i) => tile(base, path, l, { image: img([8, 15, 32][i]), cta: 'Shop' })).join('')}</div></section>
<section class="nkx-section">${sectionHead('Featured Footwear')}${pills(base, shoeLinks)}<div class="nkx-tiles nkx-tiles-4">${tile(base, shoes.links[1][1], 'Basketball', { image: img(3) })}${tile(base, shoes.links[3][1], 'Running', { image: img(26) })}${tile(base, shoes.links[2][1], 'Jordan', { image: tileArt(base, shoes.links[2][1], new Set(), x => /Jordan 1/.test(x.title)) })}${tile(base, shoes.links[4][1], 'Lifestyle', { image: img(19) })}</div></section>
<section class="nkx-section">${sectionHead('Latest in Clothing')}${pills(base, clothing.links)}</section>
<section class="nkx-section">${sectionHead('Shop by Sport')}<div class="nkx-tiles nkx-tiles-4">${tile(base, '/running', 'Running', { image: img(28) })}${tile(base, '/basketball', 'Basketball', { image: img(4) })}${tile(base, '/soccer', 'Soccer', { image: img(7) })}${tile(base, '/training', 'Training', { image: tileArt(base, '/training', new Set(), x => /Metcon/.test(x.title)) })}</div></section>
<section class="nkx-section">${sectionHead('Shop By Category')}<div class="nkx-tiles nkx-tiles-3">${tile(base, clothing.path, 'Clothing', { image: tileArt(base, clothing.path, new Set(), x => x.type === 'hoodies') })}${tile(base, shoes.path, 'Shoes', { image: img(21) })}${tile(base, acc.path, 'Accessories', { image: tileArt(base, acc.path, new Set(), x => x.type === 'bags') })}</div></section>
<section class="nkx-section nkx-linkcols">${[[`${p} Shoes`, shoes], [`${p} Clothing`, clothing], [`${p} Gear`, acc], ['Featured', newF]].map(([h, gr]) => `<div><h2>${esc(h)}</h2>${gr.links.map(([l, path]) => A(base, path, l)).join('')}</div>`).join('')}</section></div>`
}

// Jordan, NikeSKIMS, Sport, Sportswear and sport hubs.
const HUB_SHOTS = { '/basketball': [3, 10, 17], '/kobe': [4, 9], '/running': [28, 21, 31], '/soccer': [7], '/golf': [1, 22], '/acg': [16, 23, 27], '/gear-up': [28, 4, 7], '/sportswear': [8, 15, 19], '/air-force-1': [19, 32], '/air-max': [12, 24], '/training': [12], '/training/hybrid': [12], '/LockerRoom': [5, 18] }
export function hubPage(base, path, title, groups) {
  const tones = ['night', 'royal', 'stone', 'clay', 'sky', 'berry', 'sand', 'volt']
  return `<div class="nkx-dept-page"><div class="nkx-dept-bar"><h1>${esc(title)}</h1>${groups.length ? `<nav aria-label="${esc(title)}">${groups.slice(0, 6).map(g => A(base, g.path, g.label)).join('')}</nav>` : ''}</div>
${hero(base, { eyebrow: path === '/jordan' ? 'Jordan Brand' : /^(Nike|ACG)/.test(title) ? 'Nike' : `Nike ${title}`, title: title.toUpperCase(), text: HUB_COPY[path] || '', tone: tones[title.length % tones.length], tall: !!HUB_SHOTS[path], shots: HUB_SHOTS[path], mark: HUB_SHOTS[path] ? '' : path === '/jordan' ? jordanMark : swoosh, links: groups.slice(0, 2).map(g => [`Shop ${g.label}`, g.path]) })}
${groups.length ? `<section class="nkx-section">${sectionHead('Shop by Category')}<div class="nkx-tiles nkx-tiles-4">${(used => (groups.length > 1 ? groups.map(g => [g.label, g.path]) : groups[0].links.filter(([, p]) => p.startsWith('/w/'))).slice(0, 8).map(([label, path], i) => { const image = tileArt(base, path, used, x => x.cat === 'shoes'); return tile(base, path, label, image ? { image, product: true } : { tone: tones[i % tones.length], mark: label }) }).join(''))(new Set())}</div></section>
<section class="nkx-section nkx-linkcols">${groups.map(g => `<div><h2>${A(base, g.path, g.label)}</h2>${g.links.map(([l, p]) => A(base, p, l)).join('')}</div>`).join('')}</section>` : ''}</div>`
}

// ---------- category listing ----------
export function listingPage(base, slug, info, query) {
  const selected = (key, o) => query[key] === o
  const facets = `<form action="${base}/w/${slug}" method="get" class="nkx-filter-form">${query.sort ? `<input type="hidden" name="sort" value="${esc(query.sort)}">` : ''}${FILTERS.map(([name, options], i) => { const key = name.toLowerCase().replace(/[^a-z]+/g, '-'); return `<details${i < 3 ? ' open' : ''}><summary>${esc(name)}</summary>${options.map((o, j) => `<label class="nkx-check" for="f-${key}-${j}"><input id="f-${key}-${j}" type="radio" name="${key}" value="${esc(o)}"${selected(key, o) ? ' checked' : ''}> ${esc(o)}</label>`).join('')}</details>` }).join('')}<button class="nkx-btn nkx-btn-outline">Apply Filters</button></form>`
  const crumbs = info.dept ? `<nav class="nkx-crumbs" aria-label="Breadcrumb">${A(base, info.dept.path, info.dept.label)}<span aria-hidden="true">/</span><span>${esc(info.group)}</span></nav>` : ''
  return `<section class="nk-captured-search nkx-listing" data-reference-state="category-structure"><div class="nk-captured-toolbar"><div>${crumbs}<h1>${esc(info.title)}</h1></div><div class="nk-captured-actions"><form action="${base}/w/${slug}" method="get"><label class="sr-only" for="nkx-sort">Sort By</label><select id="nkx-sort" name="sort" data-reference-sort><option value="">Sort By</option>${['Featured', 'Newest', 'Price: High-Low', 'Price: Low-High'].map(o => `<option${query.sort === o ? ' selected' : ''}>${o}</option>`).join('')}</select><noscript><button class="nk-reference-sort-apply">Apply</button></noscript></form></div></div>${info.siblings?.length ? `<nav class="nkx-subcats" aria-label="Subcategories">${info.siblings.filter(([, p]) => p !== `/w/${slug}`).map(([l, p]) => A(base, p, l)).join('')}</nav>` : ''}<div class="nk-captured-browse"><aside class="nk-captured-filters" aria-label="Filter products"><a class="nk-captured-pickup" href="${base}/retail">Pick Up Today <span aria-hidden="true"></span></a>${facets}</aside><div class="nkx-empty"><svg viewBox="0 0 24 24" aria-hidden="true" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="10.5" cy="10.5" r="7.5"/><path d="m16 16 5 5"/></svg><h2>We couldn’t find any products in ${esc(info.title)} right now.</h2><p>New styles drop all the time. Check back soon, or explore what’s new.</p><div class="nkx-hero-ctas">${A(base, '/w/new-mens-3n82yznik1', 'Shop New Arrivals', 'nkx-btn nkx-btn-dark')}${info.dept ? A(base, info.dept.path, `Shop ${info.dept.label}`, 'nkx-btn nkx-btn-outline') : A(base, '/', 'Back to Home', 'nkx-btn nkx-btn-outline')}</div></div></div></section>`
}

// ---------- help ----------
const contactBlock = base => `<section class="nkx-contact" id="contact"><h2>Contact Us</h2><div class="nkx-contact-grid"><div><svg viewBox="0 0 24 24" aria-hidden="true" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 5h16v11H9l-5 4z"/></svg><h3>Chat with Us</h3><p>Products &amp; Orders</p><p>4 am - 11 pm PT<br>7 days a week</p></div><div><svg viewBox="0 0 24 24" aria-hidden="true" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 3h4l2 5-3 2a11 11 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 4 5a2 2 0 0 1 2-2z"/></svg><h3>Call Us</h3><p>1-800-806-6453</p><p>4 am - 11 pm PT<br>7 days a week</p></div><div><svg viewBox="0 0 24 24" aria-hidden="true" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/></svg><h3>Find a Store</h3>${A(base, '/retail', 'Find a Store')}</div></div></section>`
const helpSearch = (base, q = '') => `<form class="nkx-help-search" action="${base}/help" method="get" role="search"><label class="sr-only" for="nkx-help-q">What can we help you with?</label><input id="nkx-help-q" name="q" type="search" value="${esc(q)}" placeholder="What can we help you with?"><button type="submit" aria-label="Search help">Search</button></form>`

export function helpPage(base, q = '') {
  const term = q.trim().toLowerCase()
  const matches = term ? Object.entries(HELP_ARTICLES).filter(([, a]) => a.q.toLowerCase().includes(term) || a.sections.some(([, ps]) => ps.some(p => p.toLowerCase().includes(term)))) : []
  return `<div class="nkx-help-page"><h1 class="nkx-display nkx-center">GET HELP</h1>${helpSearch(base, q)}${term ? `<section class="nkx-section"><h2>Results for “${esc(q)}”</h2>${matches.length ? `<ul class="nkx-list">${matches.map(([slug, a]) => `<li>${A(base, `/help/a/${slug}`, a.q)}</li>`).join('')}</ul>` : '<p>We couldn\'t find a help article for that. Try another term or contact us below.</p>'}</section>` : ''}<section class="nkx-section"><h2 class="nkx-center">Quick Assists</h2><p class="nkx-center nkx-muted">Answers to our most frequently asked questions are just one click away.</p><div class="nkx-assists">${HELP_TOPICS.map(t => `<div><h3>${esc(t.heading)}</h3>${t.articles.map(s => A(base, `/help/a/${s}`, HELP_ARTICLES[s].q)).join('')}${A(base, `/help/a/${t.id}`, 'View all', 'nkx-viewall')}</div>`).join('')}</div></section><section class="nkx-section nkx-personal"><h2>Get a personalized experience.</h2><p>Sign in to track orders, start returns and get help faster.</p>${A(base, '/register', 'Sign In', 'nkx-btn nkx-btn-dark')}</section>${contactBlock(base)}</div>`
}

export function helpArticle(base, slug) {
  const topic = HELP_TOPICS.find(t => t.id === slug)
  if (topic) return { title: topic.heading, html: `<div class="nkx-help-page"><p class="nkx-display nkx-center nkx-display-sm">GET HELP</p>${helpSearch(base)}<article class="nkx-article"><h1>${esc(topic.heading)}</h1><ul class="nkx-list">${topic.articles.map(s => `<li>${A(base, `/help/a/${s}`, HELP_ARTICLES[s].q)}</li>`).join('')}</ul></article>${contactBlock(base)}</div>` }
  const a = HELP_ARTICLES[slug]
  if (!a) return null
  const topicOf = HELP_TOPICS.find(t => t.articles.includes(slug))
  const related = (topicOf ? topicOf.articles.filter(s => s !== slug) : ['returns-policy', 'shipping-delivery', 'payment-options']).map(s => [HELP_ARTICLES[s].q, `/help/a/${s}`])
  const table = a.table ? `<div class="nk-table-scroll"><table><caption class="sr-only">Shipping costs</caption><thead><tr><th scope="col">Shipping Option</th><th scope="col">Nike Members</th><th scope="col">Guests</th></tr></thead><tbody><tr><td>Standard Shipping</td><td>Free on orders of $50+; $5 under $50</td><td>Free on orders of $75+; $8 under $75</td></tr><tr><td>Faster Shipping</td><td>$15</td><td>$20</td></tr><tr><td>Fastest Shipping</td><td>$25</td><td>$30</td></tr><tr><td>Nike Store Pickup</td><td>Free</td><td>Free</td></tr><tr><td>Ship to a Pickup Location</td><td>Standard fees apply</td><td>Standard fees apply</td></tr></tbody></table></div>` : ''
  return { title: a.q, html: `<div class="nkx-help-page"><h1 class="nkx-display nkx-center nkx-display-sm">GET HELP</h1>${helpSearch(base)}<article class="nkx-article"><h2 class="nkx-article-q">${esc(a.q)}</h2>${a.sections.map(([h, ps], i) => `${h ? `<h3>${esc(h)}</h3>` : ''}${ps.map(p => `<p>${esc(p)}</p>`).join('')}${i === 0 ? table : ''}`).join('')}<h2>FAQs</h2><ul class="nkx-list">${related.map(([l, p]) => `<li>${A(base, p, l)}</li>`).join('')}</ul><h3>Related</h3><ul class="nkx-list">${A(base, '/help', 'Get Help')} · ${A(base, '/orders/details', 'Order Status')} · ${A(base, '/help/a/returns-policy', 'Returns')}</ul><p class="nkx-helpful">Was this answer helpful? ${A(base, '/site-feedback', 'Yes')} ${A(base, '/site-feedback', 'No')}</p></article><h2 class="nkx-center">Need more help? Contact us.</h2>${contactBlock(base)}</div>` }
}

// ---------- info pages ----------
export function infoPage(base, page) {
  const faq = page.faq ? page.faq.map(([q, a]) => `<h2>${esc(q)}</h2><p>${esc(a)}</p>`).join('') : ''
  const form = page.form ? `<form method="get" action="${base}/guest/settings/do-not-share-my-data" class="nkx-form"><fieldset><legend>Share my data for targeted advertising</legend><label><input type="radio" name="share" value="no"${page.choice === 'no' ? ' checked' : ''}> Do not share my data</label><label><input type="radio" name="share" value="yes"${page.choice === 'yes' ? ' checked' : ''}> Share my data</label></fieldset><button class="nkx-btn nkx-btn-dark">Save</button>${page.choice ? '<p role="status">Your choice was saved for this browser session.</p>' : ''}</form>` : ''
  const feedback = page.feedback ? `<form method="get" action="${base}/site-feedback" class="nkx-form"><label for="nkx-fb">Your feedback</label><textarea id="nkx-fb" name="feedback" rows="4" maxlength="1000"></textarea><button class="nkx-btn nkx-btn-dark">Submit</button>${page.sent ? '<p role="status">Thanks for your feedback.</p>' : ''}</form>` : ''
  return `<article class="nkx-info"><h1 class="nkx-display">${esc(page.h1)}</h1>${(page.paragraphs || []).map(p => `<p>${esc(p)}</p>`).join('')}${faq}${form}${feedback}${page.links ? `<div class="nkx-pills">${page.links.map(([l, p]) => A(base, p, l)).join('')}</div>` : ''}</article>`
}

// ---------- membership, gift cards, stores ----------
export function membershipPage(base) {
  return `<div class="nkx-membership"><h1 class="sr-only">Nike Membership</h1>${hero(base, { eyebrow: 'Nike Membership', title: "IT'S BETTER AS A MEMBER", text: 'Move, shop, customize and celebrate with the best of Nike. Explore your benefits below.', tone: 'night', tall: true, links: [['Sign Up', '/register']] })}
<section class="nkx-section">${sectionHead('Member Benefits')}<div class="nkx-tiles nkx-tiles-3">${[['SNKRS', 'Your Ultimate Sneaker Community', 'Explore', '/launch', 'royal'], ['Nike By You', 'Your Customization Service', 'Celebrate', '/w/mens-nike-by-you-shoes-6ealhznik1zy7ok', 'clay'], ['Nike Run Club', "Let's Run Together", 'Explore', '/running', 'sky']].map(([t, s, c, p, tone]) => `<a class="nkx-tile nkx-tone-${tone}" href="${base}${p}"><span class="nkx-tile-art" aria-hidden="true">${esc(t)}</span><span class="nkx-tile-label">${esc(s)}</span><span class="nkx-tile-cta">${c}</span></a>`).join('')}</div></section>
<section class="nkx-section">${sectionHead('Members Also Get')}<ul class="nkx-perks"><li><strong>Free Shipping</strong>On orders of $50 or more.</li><li><strong>60-Day Wear Test</strong>Excluding Nike Clearance stores.</li><li><strong>Receipt-Free Returns</strong>Your orders are saved to your profile.</li><li><strong>Member-Only Events</strong>Live experiences in Nike stores and cities.</li><li><strong>Expert Advice</strong>Sport and style help from Nike Experts.</li></ul></section>
<section class="nkx-section">${sectionHead('Connect Through Membership')}<div class="nkx-tiles nkx-tiles-4">${[['Nike App', 'Daily news and picks tailored to you.', '/'], ['Nike Run Club', 'Running in the app.', '/running'], ['Nike Training Club', 'Workouts in the app.', '/training'], ['SNKRS', 'Find new sneaker releases.', '/launch']].map(([t, s, p], i) => `<a class="nkx-tile nkx-tone-${['stone', 'sky', 'sand', 'royal'][i]}" href="${base}${p}"><span class="nkx-tile-art" aria-hidden="true">${esc(t)}</span><span class="nkx-tile-label">${esc(t)}</span><span class="nkx-muted">${esc(s)}</span><span class="nkx-tile-cta">Explore</span></a>`).join('')}</div></section>
<section class="nkx-section nkx-faq">${sectionHead('Frequently Asked Questions')}${[['What is Nike Membership?', 'Membership gives you access to Nike apps, exclusive products and member events, plus free shipping, the 60-day Wear Test and easy returns.'], ['Am I a Nike Member?', "If you've ever signed in to a Nike app, you're likely already a Member."], ['Is Nike Membership free?', "Yes. There's no cost to join or to use the benefits."]].map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)} ${A(base, '/register', 'Sign Up')}</p></details>`).join('')}</section></div>`
}

export function giftCardsPage(base) {
  const designs = ['Swoosh', 'Just Do It', 'Air Max', 'Jordan', 'Celebrate']
  return `<div class="nkx-giftcards"><section class="nkx-gc-hero"><div><p class="nkx-eyebrow">Gift Card</p><h1 class="nkx-display">Nike Gift Cards</h1><h2>GIFT THE GAME</h2><p>A Nike gift card is the perfect gift for every athlete. Send one by email, or mail a physical card in a mini shoebox.</p><div class="nkx-hero-ctas">${A(base, '/gift-cards/email', 'Email a Gift Card', 'nkx-btn nkx-btn-dark')}${A(base, '/gift-cards/mail', 'Mail a Gift Card', 'nkx-btn nkx-btn-outline')}</div><p>${A(base, '/orders/gift-card-lookup', 'Check Your Balance')} · ${A(base, '/gift-cards/terms', 'Terms and Conditions')}</p></div><div class="nkx-gc-card" aria-hidden="true"><span class="nkx-gc-mark">${swoosh}</span><span class="nkx-gc-value">$100</span></div></section>
<section class="nkx-section">${sectionHead('Card Designs')}<p class="nkx-muted">A design for every occasion, from birthdays to game day.</p><div class="nkx-tiles nkx-tiles-5">${designs.map((d, i) => `<div class="nkx-gc-design nkx-tone-${['night', 'volt', 'sky', 'royal', 'berry'][i]}"><span class="nkx-gc-mark" aria-hidden="true">${d === 'Jordan' ? jordanMark : d === 'Just Do It' ? '<b>JUST DO IT.</b>' : d === 'Air Max' ? '<b>AIR MAX</b>' : swoosh}</span><span>${esc(d)}</span></div>`).join('')}</div></section>
<section class="nkx-section nkx-center"><h2>LOOKING FOR A CORPORATE GIFT CARD OPTION?</h2><p>For bulk or business orders, email giftcards@nike.com or visit ${A(base, '/corporate-sales', 'Corporate Sales')}.</p></section></div>`
}

export function giftCardOptionPage(base, kind) {
  const title = kind === 'email' ? 'Email a Gift Card' : kind === 'mail' ? 'Mail a Gift Card' : 'Gift Card Terms and Conditions'
  const copy = kind === 'terms' ? 'Nike gift cards can be used on Nike.com, in the Nike App and at Nike stores in the United States. They do not expire, carry no fees and cannot be redeemed for cash except where required by law. Up to 10 gift cards can be used on one order.'
    : kind === 'email' ? 'Digital gift cards are delivered by email in amounts from $25 to $500 and can be scheduled for a future date.'
    : 'Physical gift cards ship free in a mini Nike shoebox, in amounts from $25 to $500.'
  return { title, html: `<article class="nkx-info"><p class="nkx-eyebrow">${A(base, '/gift-cards', 'Nike Gift Cards')}</p><h1>${esc(title)}</h1><p>${esc(copy)}</p>${kind === 'terms' ? '' : '<p class="nkx-notice">Gift cards can’t be purchased online right now. Please check back soon, or pick one up at a Nike store.</p>'}${A(base, '/orders/gift-card-lookup', 'Check Your Balance', 'nkx-btn nkx-btn-outline')}</article>` }
}

const STATE_NAMES = { NY: 'new york', NJ: 'new jersey', OR: 'oregon', CA: 'california', IL: 'illinois', MA: 'massachusetts', FL: 'florida', NV: 'nevada', TX: 'texas', WA: 'washington', GA: 'georgia' }
const PIN_SPOTS = [[178, 214], [214, 150], [196, 188], [246, 92], [292, 262], [262, 70], [120, 330], [96, 262], [150, 96], [338, 214], [372, 250], [210, 30], [60, 200], [320, 140]]
export function storesPage(base, q = '') {
  const term = q.trim().toLowerCase()
  const hay = ([n, street, city, st, zip]) => `${n} ${street} ${city} ${st} ${zip} ${STATE_NAMES[st] || ''}`.toLowerCase()
  const list = term ? STORES.filter(s => hay(s).includes(term)) : STORES.filter(s => s[6] > 0).sort((a, b) => a[6] - b[6])
  const pins = list.slice(0, PIN_SPOTS.length).map((_, i) => { const [x, y] = PIN_SPOTS[i]; return `<g transform="translate(${x} ${y}) scale(.55)"><path d="M0 0c-9-12-14-19-14-26a14 14 0 0 1 28 0c0 7-5 14-14 26z" fill="#111" stroke="#fff" stroke-width="2"/><text x="0" y="-22" text-anchor="middle" font-size="12" font-family="Helvetica, Arial, sans-serif" font-weight="700" fill="#fff">${i + 1}</text></g>` }).join('')
  const streets = Array.from({ length: 32 }, (_, i) => `<path d="M${-200 + i * 20} -40 L${-40 + i * 20} 460" stroke="#fff" stroke-width="${i % 4 === 0 ? 3 : 1.4}"/>`).join('') + Array.from({ length: 28 }, (_, i) => `<path d="M-40 ${i * 17} L460 ${i * 17 - 120}" stroke="#fff" stroke-width="${i % 3 === 0 ? 3 : 1.4}"/>`).join('')
  const map = `<svg viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice"><rect width="400" height="400" fill="#ecebe7"/>${streets}<path d="M200 120l40-62 28 16-40 62z" fill="#cfe3c4"/><path d="M0 0h70c-10 80 10 160-20 240-14 40-16 100-30 160H0z" fill="#c5dbe6"/><path d="M330 0h70v400h-110c20-60 60-90 50-160-8-60 10-150-10-240z" fill="#c5dbe6"/><path d="M60 400c40-40 120-50 180-40l-10 40z" fill="#c5dbe6"/>${pins}</svg>`
  const item = ([n, street, city, st, zip, closes, mi], i) => `<li><span class="nkx-store-num" aria-hidden="true">${i + 1}</span><div><h3>${esc(n)}</h3><p>${esc(street)}<br>${esc(city)}, ${esc(st)}, ${esc(zip)}, US</p><p class="nkx-store-open"><strong>Open</strong> · Closes ${esc(closes)}</p>${mi ? `<p class="nkx-muted">${mi.toFixed(1)} mi</p>` : ''}</div></li>`
  return `<div class="nkx-stores"><div class="nkx-stores-side"><h1>Find a Nike Store</h1><form action="${base}/retail" method="get" role="search"><label for="nkx-store-q">Search Location</label><div class="nkx-inline"><input id="nkx-store-q" name="q" type="search" value="${esc(q)}" placeholder="City, state or ZIP code" autocomplete="postal-code"><button class="nkx-btn nkx-btn-dark">Search</button></div></form><div class="nkx-store-filter"><details><summary>Filter</summary><p>Nike Store · Nike Factory Store · Nike Unite · Nike Well Collective</p></details></div><h2>${term ? `${list.length} ${list.length === 1 ? 'Store' : 'Stores'} near “${esc(q)}”` : 'Stores Near You'}</h2>${term ? '' : '<p class="nkx-store-near">Based on New York, NY 10001</p>'}<ol class="nkx-store-list">${list.map(item).join('') || `<li><p>We couldn’t find any Nike stores near “${esc(q)}”. Try a city, state or ZIP code.</p></li>`}</ol></div><div class="nkx-map" aria-hidden="true">${map}</div></div>`
}

// ---------- bag, favorites, account ----------
export function bagPage(base) {
  return `<div class="nkx-bag"><div><h1>Bag</h1><p class="nkx-bag-empty">There are no items in your bag.</p><section class="nkx-bag-favs"><h2>Favorites</h2><p>Want to view your favorites? ${A(base, '/membership', 'Join us')} or ${A(base, '/register', 'Sign-in')}</p></section></div><aside class="nkx-summary" aria-labelledby="nkx-summary-h"><h2 id="nkx-summary-h">Summary</h2><details><summary>Do you have a Promo Code?</summary><form action="${base}/cart" method="get"><label class="sr-only" for="nkx-promo-code">Promo Code</label><input id="nkx-promo-code" name="promo"><button class="nkx-btn nkx-btn-outline">Apply</button></form></details><table><caption class="sr-only">Order summary</caption><thead class="sr-only"><tr><th>Item</th><th>Amount</th></tr></thead><tbody><tr><th scope="row">Subtotal</th><td>—</td></tr><tr><th scope="row">Estimated Shipping &amp; Handling</th><td>—</td></tr><tr><th scope="row">Estimated Tax</th><td>—</td></tr><tr class="nkx-total"><th scope="row">Total</th><td>—</td></tr></tbody></table><p class="nkx-muted nkx-small">Add $50.00 more to qualify for Free Shipping as a Member! ${A(base, '/membership', 'Learn More')}</p><button class="nkx-btn nkx-btn-dark nkx-wide" disabled>Checkout</button></aside></div>`
}

export function favoritesPage(base, user) {
  return `<div class="nkx-favs"><h1>Favorites</h1>${user ? '<p>Items added to your Favorites will be saved here.</p>' : `<p>Items added to your Favorites will be saved here. ${A(base, '/membership', 'Join Us')} or ${A(base, '/register', 'Sign In')} to see them on any device.</p>`}<div class="nkx-hero-ctas">${A(base, '/w/new-mens-3n82yznik1', 'Shop New Arrivals', 'nkx-btn nkx-btn-dark')}</div></div>`
}

const memberNav = (base, current) => `<nav class="nkx-member-nav" aria-label="Account">${[['Profile', '/member/profile'], ['Orders', '/member/orders'], ['Favorites', '/favorites'], ['Settings', '/member/settings']].map(([l, p]) => `<a href="${base}${p}"${p === current ? ' aria-current="page"' : ''}>${l}</a>`).join('')}</nav>`
export function memberPage(base, user, section) {
  const h = { '/member/profile': 'Profile', '/member/orders': 'Orders', '/member/settings': 'Settings' }[section]
  if (!user) return `<div class="nkx-member">${memberNav(base, section)}<h1>${h}</h1><p>Sign in to view your ${h.toLowerCase()}.</p>${A(base, `/register?next=${encodeURIComponent(section)}`, 'Sign In', 'nkx-btn nkx-btn-dark')} ${A(base, '/membership', 'Join Us', 'nkx-btn nkx-btn-outline')}</div>`
  const name = [user.first_name, user.last_name].filter(Boolean).join(' ')
  const body = section === '/member/orders' ? `<p>You haven't placed any orders yet.</p>${A(base, '/orders/details', 'Look up a guest order', '')}`
    : section === '/member/settings' ? `<dl class="nkx-dl"><dt>Email</dt><dd>${esc(user.email)}</dd><dt>Password</dt><dd>••••••••</dd><dt>Country/Region</dt><dd>United States</dd></dl>`
    : `<div class="nkx-profile"><span class="nkx-avatar" aria-hidden="true">${esc((user.first_name || user.email || '?')[0].toUpperCase())}</span><div><h2>${esc(name || user.email)}</h2><p class="nkx-muted">Nike Member Since 2026</p></div></div>`
  return `<div class="nkx-member">${memberNav(base, section)}<h1>${h}</h1>${body}<form method="post" action="${base}/member/sign-out"><button class="nkx-btn nkx-btn-outline">Log Out</button></form></div>`
}

// Two-step sign in like nike.com: email first, then password or join form.
export function registerPage(base, { step = 'email', email = '', error = '', next = '' } = {}) {
  const hidden = `<input type="hidden" name="email" value="${esc(email)}"><input type="hidden" name="next" value="${esc(next)}">`
  const err = error ? `<p class="nkx-error" role="alert">${esc(error)}</p>` : ''
  const legal = `<p class="nkx-small nkx-muted">By continuing, I agree to Nike's ${A(base, '/privacy-policy', 'Privacy Policy')} and ${A(base, '/terms-of-use', 'Terms of Use')}.</p>`
  const inner = step === 'password'
    ? `<h1>What's your password?</h1><p>${esc(email)} ${A(base, '/register', 'Edit')}</p><form method="post" action="${base}/register/password">${hidden}${err}<label for="nkx-password">Password</label><input id="nkx-password" name="password" type="password" autocomplete="current-password" required><p class="nkx-small">${A(base, '/help/a/member-benefits', 'Forgot password?')}</p><button class="nkx-btn nkx-btn-dark">Sign In</button></form>`
    : step === 'join'
    ? `<h1>Now let's make you a Nike Member.</h1><p>We've sent a code to ${esc(email)} ${A(base, '/register', 'Edit')}</p><form method="post" action="${base}/register/join">${hidden}${err}<label for="nkx-first">First Name</label><input id="nkx-first" name="first_name" autocomplete="given-name" required><label for="nkx-last">Last Name</label><input id="nkx-last" name="last_name" autocomplete="family-name" required><label for="nkx-newpass">Password</label><input id="nkx-newpass" name="password" type="password" autocomplete="new-password" minlength="8" required><p class="nkx-small nkx-muted">Minimum of 8 characters. Uppercase, lowercase letters and one number.</p>${legal}<button class="nkx-btn nkx-btn-dark">Create Account</button></form>`
    : `<h1>Enter your email to join us or sign in.</h1><p>United States ${A(base, '/help', 'Change')}</p><form method="post" action="${base}/register">${err}<input type="hidden" name="next" value="${esc(next)}"><label for="nkx-email">Email</label><input id="nkx-email" name="email" type="email" autocomplete="email" value="${esc(email)}" required>${legal}<button class="nkx-btn nkx-btn-dark">Continue</button></form>`
  return `<div class="nkx-auth"><div class="nkx-auth-marks" aria-hidden="true"><span class="nkx-swoosh-big"></span></div>${inner}</div>`
}

// ---------- order lookup & gift card balance ----------
export function orderStatusPage(base, q) {
  const searched = q.orderNumber !== undefined || q.email !== undefined
  const errors = []
  if (searched && !String(q.orderNumber || '').trim()) errors.push('Please enter your order number.')
  if (searched && !/^\S+@\S+\.\S+$/.test(String(q.email || '').trim())) errors.push('Please enter a valid email address.')
  const result = searched ? (errors.length ? `<div class="nkx-error" role="alert">${errors.map(esc).join('<br>')}</div>` : `<div class="nkx-notice" role="status"><h2>We couldn't find that order.</h2><p>No order matching ${esc(q.orderNumber)} and ${esc(q.email)} was found. Check the order number in your confirmation email and try again.</p></div>`) : ''
  return `<div class="nkx-lookup"><h1>Order Status</h1><p>Members can track orders in their profile. ${A(base, '/register?next=%2Fmember%2Forders', 'Sign In')}</p><h2>Guest Order Lookup</h2><p>Enter the order number and email address from your order confirmation.</p>${result}<form method="get" action="${base}/orders/details" class="nkx-form"><label for="nkx-order">Order Number</label><input id="nkx-order" name="orderNumber" value="${esc(q.orderNumber || '')}" required><label for="nkx-order-email">Email</label><input id="nkx-order-email" name="email" type="email" autocomplete="email" value="${esc(q.email || '')}" required><button class="nkx-btn nkx-btn-dark">Submit</button></form><p class="nkx-small">${A(base, '/help/a/order-tracking', 'Where is my Nike order?')} · ${A(base, '/help/a/change-cancel-order', 'Order Cancellation')}</p></div>`
}

export function giftCardLookupPage(base, q) {
  const searched = q.number !== undefined
  const valid = /^\d{16,19}$/.test(String(q.number || '').replace(/\s/g, '')) && /^\d{4,8}$/.test(String(q.pin || ''))
  const result = !searched ? '' : valid ? `<div class="nkx-notice" role="status"><h2>We can't show this balance right now.</h2><p>Please try again later, or call us at 1-800-806-6453 for help with your gift card.</p></div>` : '<div class="nkx-error" role="alert">Please enter a valid 16–19 digit card number and PIN.</div>'
  return `<div class="nkx-lookup"><h1>Gift Card Balance</h1><p>Enter your gift card number and PIN to check your balance.</p>${result}<form method="get" action="${base}/orders/gift-card-lookup" class="nkx-form"><label for="nkx-gc-number">Card Number</label><input id="nkx-gc-number" name="number" inputmode="numeric" autocomplete="off" value="${esc(searched && !valid ? q.number : '')}" required><label for="nkx-gc-pin">PIN</label><input id="nkx-gc-pin" name="pin" inputmode="numeric" autocomplete="off" required><button class="nkx-btn nkx-btn-dark">Check Balance</button></form><p class="nkx-small">${A(base, '/gift-cards', 'Nike Gift Cards')}</p></div>`
}

// ---------- SNKRS launch ----------
export function launchPage(base) {
  const items = capturedSearchProducts.slice(0, 6)
  return `<div class="nkx-launch"><div class="nkx-dept-bar"><h1>SNKRS Launch Calendar</h1><nav aria-label="SNKRS">${A(base, '/launch', 'Feed')}${A(base, '/launch?s=in-stock', 'In Stock')}${A(base, '/launch?s=upcoming', 'Upcoming')}</nav></div><p class="nkx-muted">The latest drops and what’s coming next. Turn on notifications in the SNKRS app so you never miss a launch.</p><div class="nkx-tiles nkx-tiles-3">${items.map((p, i) => `<a class="nkx-product" href="${base}${esc(p.path)}"><img src="${p.image}" alt="${esc(p.alt)}" loading="lazy"><span class="nkx-launch-meta"><span class="nkx-launch-date"><small>Oct</small>${[17, 18, 21, 23, 24, 30][i]}</span><span><span class="nkx-muted">${i < 2 ? 'Available 10:00 AM' : 'Launching'}</span><span class="nkx-product-title">${esc(p.title)}</span></span></span></a>`).join('')}</div></div>`
}

// ---------- sitemap ----------
const EXTRA_SECTIONS = [['SNKRS Launch Calendar', '/launch'], ['Shop All Sale', '/w/sale-3yaep'], ['Get Help', '/help'], ['Membership', '/membership'], ['Gift Cards', '/gift-cards'], ['Find a Store', '/retail'], ['Order Status', '/orders/details'], ['Bag', '/cart'], ['Favorites', '/favorites'], ['Sign In', '/register']]
export function sitemapPage(base) {
  return `<div class="nkx-sitemap"><h1>Site Map</h1>${MENUS.map(m => `<section><h2>${A(base, m.path, m.label)}</h2><div class="nkx-sitemap-cols">${m.groups.map(g => `<div><h3>${A(base, g.path, g.label)}</h3><ul>${g.links.map(([l, p]) => `<li>${A(base, p, l)}</li>`).join('')}</ul></div>`).join('')}</div></section>`).join('')}<section><h2>Shop &amp; Services</h2><ul class="nkx-sitemap-flat">${EXTRA_SECTIONS.map(([l, p]) => `<li>${A(base, p, l)}</li>`).join('')}</ul></section><section><h2>Help</h2><ul class="nkx-sitemap-flat">${HELP_TOPICS.map(t => `<li>${A(base, `/help/a/${t.id}`, t.heading)}</li>`).join('')}${HELP_MENU.map(([l, p]) => `<li>${A(base, p, l)}</li>`).join('')}</ul></section>${FOOTER.filter(c => c.heading !== 'Help').map(c => `<section><h2>${esc(c.heading)}</h2><ul class="nkx-sitemap-flat">${c.links.map(([l, p]) => `<li>${A(base, p, l)}</li>`).join('')}</ul></section>`).join('')}<section><h2>Legal</h2><ul class="nkx-sitemap-flat">${LEGAL.map(([l, p]) => `<li>${A(base, p, l)}</li>`).join('')}</ul></section></div>`
}

export function sitemapPaths() {
  const paths = new Set(['/', '/sitemap', '/w?q=gta%206'])
  for (const m of MENUS) { paths.add(m.path); for (const g of m.groups) { paths.add(g.path); for (const [, p] of g.links) paths.add(p) } }
  for (const [, p] of EXTRA_SECTIONS) paths.add(p)
  for (const c of FOOTER) for (const [, p] of c.links) paths.add(p.split('#')[0])
  for (const [, p] of LEGAL) paths.add(p)
  for (const t of HELP_TOPICS) { paths.add(`/help/a/${t.id}`); for (const s of t.articles) paths.add(`/help/a/${s}`) }
  for (const s of Object.keys(HELP_ARTICLES)) paths.add(`/help/a/${s}`)
  for (const p of Object.keys(INFO_PAGES)) paths.add(p)
  for (const p of capturedSearchProducts) paths.add(p.path)
  return [...paths]
}
