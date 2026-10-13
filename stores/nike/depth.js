import { productGallery } from '../../lib/product-assets.js'
import { esc, money } from '../../lib/html.js'
import { productPhoto } from '../../lib/product-photos.js'
import { products, sports, collections, palette } from './catalog.js'
import { isCapturedQuery, capturedNikeSearch, capturedNikeProduct, capturedProductAt } from './search-capture.js'

export const clean = value => typeof value === 'string' ? value.trim().slice(0, 180) : ''
const params = query => Object.fromEntries(Object.entries(query).filter(([, v]) => typeof v === 'string').map(([k, v]) => [k, clean(v)]))
const searchHref = (base, query = {}) => `${base}/search?${esc(new URLSearchParams(Object.entries(query).filter(([, v]) => v)).toString())}`
const normalize = value => String(value).toLowerCase().replace(/[’']/g, '').replace(/\bwomens?\b/g, 'women').replace(/\bmens?\b/g, 'men').replace(/\bchildren\b/g, 'kids').replace(/\b(sneakers?|trainers?)\b/g, 'shoes').replace(/\bfootball\b/g, 'soccer').replace(/\b(jogging|jog)\b/g, 'running').replace(/\bgym\b/g, 'training').replace(/[^a-z0-9]+/g, ' ').trim()
const noGames = q => /\bgta\s*(?:6|vi)?\b|grand\s*theft\s*auto|\bgtavi\b/i.test(q)
const priceMatch = (price, filter) => !filter || (filter === '50' && price < 50) || (filter === '50-100' && price >= 50 && price < 100) || (filter === '100+' && price >= 100)
export function catalogCandidates(product) {
  const variants = product.variants?.length ? product.variants : [{ id: product.id, options: {}, price: product.price, stock: product.stock }]
  return variants.map(v => ({ ...v, price: v.price ?? product.price, stock: product.available === false || v.available === false ? 0 : Math.min(product.stock, v.stock, 10), colorName: v.options.Color || product.colorName }))
}
const searchTokens = new WeakMap()
function tokensFor(p) {
  if (!searchTokens.has(p)) searchTokens.set(p, normalize([p.title, p.keywords, p.description, ...(p.colors || [p.colorName])].join(' ')).split(' '))
  return searchTokens.get(p)
}
function matchingCandidates(p, q) {
  return catalogCandidates(p).filter(v => (!q.age || (v.ages || p.ages).includes(q.age)) && (!q.size || v.options.Size === q.size) && (!q.color || v.colorName === q.color) && priceMatch(v.price, q.price) && (!q.stock || (q.stock === 'in-stock' && v.stock > 0) || (q.stock === 'out-of-stock' && v.stock === 0)))
}
export function filterCatalog(query = {}) {
  const q = params(query), words = normalize(q.q || '').split(' ').filter(Boolean)
  if (noGames(q.q || '')) return []
  let result = products.flatMap(p => {
    const tokens = tokensFor(p)
    if (!words.every(word => tokens.some(part => part === word || (part.endsWith('s') && part.slice(0, -1) === word)))) return []
    if ((q.category && q.category !== p.category) || (q.type && q.type !== p.type) || (q.sport && !p.sports.includes(q.sport)) || (q.gender && !p.gender.includes(q.gender)) || (q.age && !p.ages.includes(q.age)) || (q.collection && q.collection !== p.collection) || (q.new && q.new !== 'yes') || (q.new === 'yes' && !p.newness)) return []
    const matching = matchingCandidates(p, q)
    if (!matching.length) return []
    const prices = matching.map(v => v.price), minimum = Math.min(...prices)
    const representative = matching.find(v => v.price === minimum && v.stock > 0) || matching.find(v => v.price === minimum)
    return [{ ...p, displayPrice: minimum, highPrice: Math.max(...prices), matchedOptions: representative.options, linkOptions: { ...(p.options.Color ? { Color: representative.options.Color } : {}), ...(q.size ? { Size: q.size } : {}) }, matchedColor: representative.colorName, matchedStock: matching.some(v => v.stock > 0) }]
  })
  const sort = q.sort || ''
  if (sort === 'price-asc') result.sort((a, b) => a.displayPrice - b.displayPrice || a.id.localeCompare(b.id))
  if (sort === 'price-desc') result.sort((a, b) => b.displayPrice - a.displayPrice || a.id.localeCompare(b.id))
  if (sort === 'new') result.sort((a, b) => b.newness - a.newness || a.id.localeCompare(b.id))
  if (sort === 'rating') result.sort((a, b) => b.rating - a.rating || a.id.localeCompare(b.id))
  return result
}
// Count each family once per facet value, using offers that satisfy every other
// active filter. Work scales with products/variants rather than facet options.
export function facetCounts(query, key) {
  const without = { ...params(query), [key]: '', sort: '' }, counts = new Map()
  for (const p of filterCatalog(without)) {
    const offers = matchingCandidates(p, without)
    let values
    if (key === 'size') values = offers.map(v => v.options.Size).filter(Boolean)
    else if (key === 'color') values = offers.map(v => v.colorName)
    else if (key === 'age') values = offers.flatMap(v => v.ages || p.ages)
    else if (key === 'price') values = offers.map(v => v.price < 50 ? '50' : v.price < 100 ? '50-100' : '100+')
    else if (key === 'stock') values = offers.map(v => v.stock > 0 ? 'in-stock' : 'out-of-stock')
    else if (key === 'sport') values = p.sports
    else if (key === 'gender') values = p.gender
    else if (key === 'new') values = p.newness ? ['yes'] : []
    else values = [p[key]]
    for (const value of new Set(values)) counts.set(value, (counts.get(value) || 0) + 1)
  }
  return counts
}
export function nikeCatalog(router, ctx) {
  const { render, selectedProduct, artwork, productById, stockLimit } = ctx
  const picture = (p, css = '') => `<div class="nk-picture ${css}">${artwork(p)}</div>`
  const imageFor = p => {
    if (!p.matchedOptions) return p
    return selectedProduct(p, p.matchedOptions) || p
  }
  const cards = (base, list, css = '') => `<div class="nk-products ${css}">${list.map(p => {
    const url = `${base}/product/${p.id}${p.linkOptions && Object.keys(p.linkOptions).length ? '?' + esc(new URLSearchParams(p.linkOptions).toString()) : ''}`
    const candidatePrices = catalogCandidates(p).map(v => v.price)
    const low = p.displayPrice ?? Math.min(...candidatePrices), high = p.highPrice ?? Math.max(...candidatePrices)
    return `<article class="nk-product-card" data-product-id="${p.id}" data-price="${low}"><a href="${url}">${picture(imageFor(p))}<div class="nk-card-copy">${p.badge ? `<p class="nk-badge">${esc(p.badge)}</p>` : ''}<h3>${esc(p.title)}</h3><p class="nk-subtitle">${esc(p.gender.length === 1 ? p.gender[0] : 'Unisex')} · ${esc(p.type)}</p><p class="nk-muted">${p.colors?.length || 1} ${p.colors?.length > 1 ? 'Colors' : 'Color'}${(p.matchedStock ?? p.stock > 0) ? '' : ' · Out of stock'}</p><p class="nk-card-price">${low !== high ? 'From ' : ''}${money(low)}</p></div></a></article>`
  }).join('')}</div>`
  const shelf = (base, title, query, limit = 4) => !filterCatalog(query).length ? '' : `<section class="nk-shelf"><div class="nk-section-heading"><h2>${esc(title)}</h2><a href="${searchHref(base, query)}">Shop All</a></div>${cards(base, filterCatalog(query).slice(0, limit))}</section>`
  const categoryLinks = (base, query = {}) => `<div class="nk-pills">${['Shoes', 'Clothing', 'Accessories'].filter(category => filterCatalog({ ...query, category }).length).map(category => `<a href="${searchHref(base, { ...query, category })}">${category}</a>`).join('')}</div>`
  function hub(req, res, title, eyebrow, description, query, heroIds) {
    const base = res.locals.base, relevant = filterCatalog(query)
    render(req, res, title, `<section class="nk-hub-heading"><p class="eyebrow">${esc(eyebrow)}</p><h1>${esc(title)}</h1><p>${esc(description)}</p><a class="button" href="${searchHref(base, query)}">Shop All ${esc(title)}</a>${categoryLinks(base, query)}</section><section class="nk-hub-hero">${heroIds.map(id => productById(id)).filter(Boolean).map(p => `<a href="${base}/product/${p.id}">${picture(p)}<span>${esc(p.title)}</span></a>`).join('')}</section>${shelf(base, 'New & Noteworthy', { ...query, new: 'yes', sort: 'new' })}${shelf(base, 'Made for Your Everyday', query)}<section class="nk-shelf"><h2>Find Your Next Favorite</h2><div class="nk-pills">${[...new Set(relevant.map(p => p.type))].map(type => `<a href="${searchHref(base, { ...query, type })}">${esc(type)}</a>`).join('')}</div></section>`, 200)
  }
  router.get('/', (req, res) => {
    const base = res.locals.base
    render(req, res, 'Just Do It', `<section class="nk-home-hero"><img src="/static/art/retail/nike.png" alt="A runner moving along a sunlit outdoor track"><div class="nk-campaign-copy"><p>Everyday Running</p><h1>MAKE EVERY<br>MILE YOURS.</h1><p>Find your rhythm in shoes and layers made for the daily run.</p><div class="nk-pills"><a class="button" href="${base}/sport/running">Shop Running</a><a class="button secondary" href="${base}/new">Explore New Arrivals</a></div></div></section>${shelf(base, 'New & Noteworthy', { new: 'yes', sort: 'new' })}<section class="nk-shelf"><h2>Find Your Sport</h2><div class="nk-sport-tiles">${[['running', 'running-shoes', 'Your next mile'], ['training', 'sports-bra', 'Your kind of strong'], ['basketball', 'basketball-shoes', 'Bring your game']].map(([sport, id, tagline]) => `<a href="${base}/sport/${sport}">${picture(productById(id))}<span>${esc(tagline)}</span><strong>${sport[0].toUpperCase() + sport.slice(1)}</strong></a>`).join('')}</div></section><section class="nk-editorial"><div>${picture(productById('fleece-hoodie'))}</div><div><p>Club Fleece</p><h2>YOUR EVERYDAY<br>STARTS HERE.</h2><p>Soft fleece. Familiar comfort. The layers you’ll reach for again and again.</p><a class="button" href="${base}/collection/club-fleece">Shop Club Fleece</a></div></section>${shelf(base, 'Shoes That Go With You', { category: 'Shoes', stock: 'in-stock' })}<section class="nk-shelf"><h2>For Every Athlete</h2><div class="nk-sport-tiles">${[['men', 'Men', 'gym-trainer'], ['women', 'Women', 'leggings'], ['kids', 'Kids', 'kids-tracksuit']].map(([slug, label, id]) => `<a href="${base}/${slug}">${picture(productById(id))}<strong>Shop ${label}</strong></a>`).join('')}</div></section>${shelf(base, 'Small Essentials. Big Difference.', { category: 'Accessories' })}<section class="nk-membership"><p>Nike Membership</p><h2>MORE OF WHAT<br>MOVES YOU.</h2><p>Save your favorites and enjoy free standard shipping on member orders $50+.</p><a class="button" href="${base}/membership">Join Us</a></section>`)
  })
  router.get('/men', (req, res) => hub(req, res, 'Men', 'Move in Your Own Way', 'Footwear, everyday layers and training essentials for wherever you go next.', { gender: 'Men' }, ['running-shoes', 'fleece-hoodie', 'basketball-shoes']))
  router.get('/women', (req, res) => hub(req, res, 'Women', 'Your Movement. Your Way.', 'From the studio to your everyday routine, find your next favorite fit.', { gender: 'Women' }, ['sports-bra', 'leggings', 'tennis-skirt']))
  router.get('/kids', (req, res) => {
    const base = res.locals.base
    render(req, res, 'Kids', `<section class="nk-hub-heading"><p class="eyebrow">Made for Play</p><h1>BIG DAYS.<br>LITTLE ATHLETES.</h1><p>Easy-on shoes, matching layers and gear that keeps up.</p><a class="button" href="${searchHref(base, { gender: 'Kids' })}">Shop All Kids</a>${categoryLinks(base, { gender: 'Kids' })}</section><section class="nk-hub-hero">${['kids-trainers', 'kids-tracksuit', 'basketball'].map(id => `<a href="${base}/product/${id}">${picture(productById(id))}<span>${esc(productById(id).title)}</span></a>`).join('')}</section><section class="nk-shelf"><h2>Find Their Fit</h2><div class="nk-age-tiles">${[['Little Kids', 'Ages 4–7', 'Strap-fastened shoes and soft layers.'], ['Big Kids', 'Ages 8–12', 'Matching sets and equipment for play.'], ['Teens', 'Ages 13+', 'Everyday bags, caps and sports gear.']].map(([age, title, detail]) => `<a href="${searchHref(base, { gender: 'Kids', age })}"><h3>${age}</h3><p>${title}</p><p>${detail}</p><span>Shop ${age} →</span></a>`).join('')}</div><p class="nk-muted">Age ranges are a guide. Use the measurements on each product page for the right fit.</p></section>${shelf(base, 'Ready, Set, Play', { gender: 'Kids' }, 8)}`)
  })
  router.get('/new', (req, res) => hub(req, res, 'New & Featured', 'Fresh Starts', 'Explore the latest arrivals across running, sportswear and everyday movement.', { new: 'yes', sort: 'new' }, ['cushion-runner', 'windbreaker', 'kids-tracksuit']))
  router.get('/sport', (req, res) => {
    const base = res.locals.base
    render(req, res, 'Find Your Sport', `<section class="nk-hub-heading"><p class="eyebrow">Sport Is for Everyone</p><h1>FIND YOUR SPORT.</h1><p>Different ways to move. One place to start.</p></section><div class="nk-sport-tiles">${sports.map(sport => [sport, products.find(p => p.sports.includes(sport)).id]).map(([sport, id]) => `<a href="${base}/sport/${sport.toLowerCase()}">${picture(productById(id))}<strong>${sport}</strong><span>${filterCatalog({ sport }).length} styles to explore</span></a>`).join('')}</div>`)
  })
  router.get('/sport/:sport', (req, res, next) => {
    const sport = sports.find(s => s.toLowerCase() === req.params.sport)
    if (!sport) return next()
    const relevant = filterCatalog({ sport })
    hub(req, res, sport, 'Find Your Movement', `Discover ${sport.toLowerCase()} shoes, clothing and essentials for your next session.`, { sport }, relevant.slice(0, 3).map(p => p.id))
  })
  router.get('/collection/:collection', (req, res, next) => {
    const collection = Object.hasOwn(collections, req.params.collection) ? collections[req.params.collection] : null
    if (!collection) return next()
    const relevant = filterCatalog({ collection: req.params.collection })
    hub(req, res, collection.title, 'Explore the Collection', collection.description, { collection: req.params.collection }, relevant.slice(0, 3).map(p => p.id))
  })
  router.get('/category/:category', (req, res, next) => {
    const category = ['Shoes', 'Clothing', 'Accessories'].find(c => c.toLowerCase() === req.params.category)
    if (!category) return next()
    const relevant = filterCatalog({ category })
    hub(req, res, category, 'Find Your Favorite', `Explore ${category.toLowerCase()} across sport and everyday movement.`, { category }, relevant.slice(0, 3).map(p => p.id))
  })

  const facets = [
    ['category', 'Category', ['Shoes', 'Clothing', 'Accessories']],
    ['gender', 'Gender / Audience', ['Men', 'Women', 'Kids']],
    ['type', 'Product Type', [...new Set(products.map(p => p.type))].sort()],
    ['sport', 'Sport', sports],
    ['age', 'Age', ['Adults', 'Little Kids', 'Big Kids', 'Teens']],
    ['size', 'Size', [...new Set(products.flatMap(p => p.options.Size || []))]],
    ['color', 'Color', [...new Set(products.flatMap(p => p.colors || [p.colorName]))].sort()],
    ['price', 'Price', [['50', 'Under $50'], ['50-100', '$50 – $99.99'], ['100+', '$100 and up']]],
    ['stock', 'Availability', [['in-stock', 'In Stock'], ['out-of-stock', 'Out of Stock']]],
    ['collection', 'Collection', Object.entries(collections).map(([key, c]) => [key, c.title])],
    ['new', 'New Arrivals', [['yes', 'New Arrivals']]],
  ]
  router.get('/suggest', (req, res) => {
    if (req.query.q !== undefined && typeof req.query.q !== 'string') return res.status(400).json({ products: [] })
    const q = clean(req.query.q)
    const words = normalize(q).split(' ').filter(Boolean)
    const matches = q.length >= 2 && !noGames(q) ? products.filter(p => words.every(word => tokensFor(p).some(token => token.startsWith(word)))).slice(0, 6) : []
    res.json({ products: matches.map(p => ({ id: p.id, title: p.title, type: p.type, href: `${res.locals.base}/product/${p.id}` })) })
  })
  // Nike's public search links use /w?q=...; retain the benchmark's older URL.
  router.get(['/t/:slug/:style', '/launch/r/:style'], (req, res, next) => {
    const product = capturedProductAt(req.path)
    if (!product) return next()
    req.nikeCapturedSearch = true
    return render(req, res, product.title, capturedNikeProduct(res.locals.base, product))
  })
  router.get(['/w', '/search'], (req, res) => {
    if (Object.values(req.query).some(value => typeof value !== 'string')) return render(req, res, 'Check Your Filters', '<section class="empty"><h1>Check your filters</h1><p>Choose one value for each search filter.</p><a class="button" href="' + res.locals.base + '/search">Browse products</a></section>', 400)
    const base = res.locals.base, query = params(req.query)
    if (isCapturedQuery(query.q)) {
      req.nikeCapturedSearch = true
      return render(req, res, `Search results for “${query.q}”`, capturedNikeSearch(base, query))
    }
    const result = filterCatalog(query)
    const pageCount = Math.max(1, Math.ceil(result.length / 12)), requested = /^\d+$/.test(query.page || '') ? Number(query.page) : 1, page = Math.min(pageCount, Math.max(1, requested)), start = (page - 1) * 12
    const pages = [...new Set([1, pageCount, ...Array.from({ length: 5 }, (_, i) => page + i - 2).filter(value => value > 0 && value <= pageCount)])].sort((a, b) => a - b)
    const pageLink = (value, label, rel = '') => `<a href="${searchHref(base, { ...query, page: String(value) })}"${rel ? ` rel="${rel}"` : ''}${page === value ? ' aria-current="page"' : ''}>${label}</a>`
    const pagination = `${page > 1 ? pageLink(page - 1, 'Previous', 'prev') : ''}${pages.map((value, i) => `${i && value - pages[i - 1] > 1 ? '<span aria-hidden="true">…</span>' : ''}${pageLink(value, value)}`).join('')}${page < pageCount ? pageLink(page + 1, 'Next', 'next') : ''}<span class="nk-page-position">Page ${page} of ${pageCount}</span>`
    const title = query.q ? `Search results for “${query.q}”` : [query.gender, query.sport, query.category || 'All Products'].filter(Boolean).join(' ')
    const select = ([key, label, options]) => {
      const counts = facetCounts(query, key)
      const values = options.map(v => Array.isArray(v) ? v : [v, v])
      if (query[key] && !values.some(([value]) => value === query[key])) values.push([query[key], query[key]])
      return `<details class="nk-facet"${query[key] || ['category', 'gender'].includes(key) ? ' open' : ''}><summary>${label}${query[key] ? ' <span>1 selected</span>' : ''}</summary><label class="sr-only" for="nike-facet-${key}">${label}</label><select id="nike-facet-${key}" name="${key}"><option value="">${({ category: 'All Categories', gender: 'All Audiences', type: 'All Product Types', sport: 'All Sports', age: 'All Ages', size: 'All Sizes', color: 'All Colors', collection: 'All Collections', new: 'Any Arrival Date' })[key] || 'All Options'}</option>${values.map(([value, name]) => `<option value="${esc(value)}"${query[key] === value ? ' selected' : ''}>${esc(name)} (${counts.get(value) || 0})</option>`).join('')}</select></details>`
    }
    const sortSelect = `<label>Sort By<select name="sort">${[['', 'Featured'], ['new', 'Newest'], ['price-desc', 'Price: High to Low'], ['price-asc', 'Price: Low to High'], ['rating', 'Top Rated']].map(([v, label]) => `<option value="${v}"${query.sort === v ? ' selected' : ''}>${label}</option>`).join('')}</select></label>`
    const sortForm = `<form class="nk-sort" action="${base}/search" method="get" data-nike-sort>${Object.entries(query).filter(([key]) => !['sort', 'page'].includes(key)).map(([key, value]) => `<input type="hidden" name="${esc(key)}" value="${esc(value)}">`).join('')}${sortSelect}<button type="submit">Sort</button></form>`
    const chips = [['q', 'Search'], ...facets.map(([key, label]) => [key, label])].filter(([key]) => query[key]).map(([key, label]) => `<a class="nk-chip" aria-label="Remove ${esc(label)} filter" href="${searchHref(base, { ...query, [key]: '', page: '' })}">${esc(label)}: ${esc(query[key] === 'yes' ? 'New' : query[key])} ×</a>`).join('')
    render(req, res, title, `<div class="nk-list-heading"><div>${query.q ? '<p class="nk-search-eyebrow">Search results for</p>' : ''}<h1>${esc(query.q || title)} <span>(${result.length})</span></h1></div><div class="nk-list-tools"><button type="button" class="secondary nk-filter-toggle" data-filter-toggle aria-expanded="true" aria-controls="nike-filters">Hide Filters</button>${sortForm}</div></div>${chips ? `<div class="nk-chips">${chips}<a href="${base}/search">Clear all</a></div>` : ''}<div class="nk-list-layout"><aside id="nike-filters" class="nk-filter-rail"><form action="${base}/search" method="get"><input type="hidden" name="q" value="${esc(query.q)}">${facets.map(select).join('')}<input type="hidden" name="sort" value="${esc(query.sort || '')}"><div class="nk-filter-actions"><button>Apply Filters</button><a class="nk-reset" href="${base}/search">Reset all filters</a></div></form></aside><section class="nk-list-results" aria-label="Product results"><p class="nk-result-count">${result.length} ${result.length === 1 ? 'result' : 'results'}${result.length ? ` · Showing ${start + 1}–${Math.min(start + 12, result.length)}` : ''}</p>${result.length ? cards(base, result.slice(start, start + 12), 'nk-results-grid') : `<section class="empty"><h2>No results found</h2><p>We couldn't find any products matching ${query.q ? `“${esc(query.q)}”` : 'these filters'}. Try a different search or clear your filters.</p><a class="button" href="${base}/search">Browse all products</a></section>`}${result.length ? `<nav class="nk-pagination" aria-label="Product pages">${pagination}</nav>` : ''}<section class="nk-related"><h2>Try These Searches</h2><div class="nk-pills">${['Running', 'Kids', 'Club Fleece', 'Training', 'Hiking', 'Yoga', 'Cycling', 'Swim'].map(q => `<a href="${searchHref(base, { q })}">${q}</a>`).join('')}</div></section></section></div>${result.length ? '' : `<section class="nk-shelf"><h2>You may also like</h2><p>Explore other products from Nike.</p>${cards(base, products.filter(p => p.stock > 0).slice(0, 4))}</section>`}`)
  })
  router.get('/product/:id', (req, res, next) => {
    const p = productById(req.params.id), base = res.locals.base
    if (!p) return next()
    const colors = p.options.Color || [p.colorName], color = clean(req.query.Color) || colors[0], size = clean(req.query.Size)
    if (['Color', 'Size', 'view'].some(key => req.query[key] !== undefined && typeof req.query[key] !== 'string') || !colors.includes(color) || (size && !p.options.Size?.includes(size))) return render(req, res, 'Choose an Available Option', `<section class="empty"><h1>Choose an available option</h1><p>The selected color or size is not part of this product.</p><a class="button" href="${base}/product/${p.id}">View available options</a></section>`, 400)
    const optionsFor = value => ({ ...(p.options.Color ? { Color: color } : {}), ...(p.options.Size ? { Size: value } : {}) })
    const candidates = catalogCandidates(p).filter(v => v.colorName === color)
    const previewSize = size || candidates.find(v => v.stock > 0)?.options.Size || candidates[0]?.options.Size
    const preview = selectedProduct(p, optionsFor(previewSize)) || p
    const stock = stockLimit(preview), saved = (req.store.favorites || []).includes(p.id)
    const viewIndex = Math.max(0, Number.parseInt(clean(req.query.view), 10) || 0)
    const recommendations = products.filter(other => other.id !== p.id && other.stock > 0 && other.gender.some(gender => p.gender.includes(gender)) && other.ages.some(age => p.ages.includes(age))).sort((a, b) => (Number(b.collection === p.collection) * 2 + Number(b.sports.some(s => p.sports.includes(s)))) - (Number(a.collection === p.collection) * 2 + Number(a.sports.some(s => p.sports.includes(s))))).slice(0, 4)
    render(req, res, p.title, `<p class="breadcrumb"><a href="${base}/">Nike</a> / <a href="${base}/category/${p.category.toLowerCase()}">${p.category}</a> / ${esc(p.type)}</p><div class="nk-pdp"><section class="nk-gallery" aria-label="Product images">${productGallery('nike', {...preview,colorName:color}, { className: 'nk-main-image', view: viewIndex })}<p class="nk-image-caption">${esc(color)} · Product illustration</p></section><section class="nk-pdp-info">${p.badge ? `<p class="nk-badge">${esc(p.badge)}</p>` : ''}<h1>${esc(p.title)}</h1><p>${esc(p.gender.length === 1 ? p.gender[0] : 'Unisex')} ${esc(p.type)}</p><p class="nk-pdp-price">${money(preview.price)}</p><p>${esc(p.description)}</p><div class="nk-color-heading">Color: <strong>${esc(color)}</strong></div><div class="nk-color-options">${colors.map(c => {
      const colorVariant = p.variants?.find(v => (v.options.Color || p.colorName) === c)
      const artProduct = colorVariant ? selectedProduct(p, colorVariant.options) : p
      return `<a href="${base}/product/${p.id}?${esc(new URLSearchParams({ Color: c, ...(size ? { Size: size } : {}) }).toString())}" aria-label="Color ${esc(c)}"${color === c ? ' aria-current="true"' : ''}>${picture(artProduct)}<span>${esc(c)}</span></a>`
    }).join('')}</div><form class="nk-buy-form" action="${base}/cart/add" method="post" data-nike-buy><input type="hidden" name="id" value="${p.id}">${p.options.Color ? `<input type="hidden" name="option_Color" value="${esc(color)}">` : ''}${p.options.Size ? `<div class="nk-size-heading"><span>Select Size</span><a href="#size-guide">Size Guide</a></div><p class="nk-muted">${esc(p.sizeSystem)}</p><fieldset class="nk-size-grid"><legend class="sr-only">Size</legend>${p.options.Size.map(s => {
      const option = selectedProduct(p, optionsFor(s)), limit = option ? stockLimit(option) : 0
      return `<label class="nk-size${limit ? '' : ' nk-unavailable'}"><input type="radio" name="option_Size" value="${esc(s)}" data-stock="${limit}"${size === s && limit ? ' checked' : ''}${limit ? ' required' : ' disabled'}><span>${esc(s)}${limit ? '' : '<small>Out of stock</small>'}</span></label>`
    }).join('')}</fieldset>` : ''}<p class="nk-option-stock" data-option-stock aria-live="polite">${!p.stock ? 'Currently out of stock' : p.options.Size && !size ? 'Choose a size to see availability.' : stock ? `${stock} available for this option` : 'This combination is out of stock'}</p><label class="nk-quantity">Quantity<input name="qty" type="number" min="1" max="${stock || 1}" value="1"></label><button type="submit"${p.stock && (!size || stock) ? '' : ' disabled'}>Add to Bag</button></form><form action="${base}/favorites" method="post"><input type="hidden" name="id" value="${p.id}"><input type="hidden" name="Color" value="${esc(color)}"><input type="hidden" name="Size" value="${esc(size)}"><input type="hidden" name="view" value="${viewIndex}"><button class="secondary nk-favorite">${saved ? 'Saved — Remove ♡' : 'Favorite ♡'}</button></form><section class="nk-delivery"><h2>Shipping</h2><p>Guests: free standard shipping at $75. Members: free at $50.</p><p>Standard shipping below the threshold: $8 for guests, $5 for members.</p><a href="${base}/location">${req.store.location ? `Deliver to ${esc(req.store.location)}` : 'Set a delivery ZIP code'}</a></section><details open><summary>Product Details</summary><ul>${p.details.map(detail => `<li>${esc(detail)}</li>`).join('')}</ul><p>Color shown: ${esc(color)}</p><p>Style: ${esc(p.id.toUpperCase())}</p></details><details id="size-guide"><summary>Size & Fit</summary><p>${esc(p.fit)}</p><p>${esc(p.measurement)}</p><p>Measurements are approximate guides for this style.</p></details><details><summary>Material & Care</summary><p>${esc(p.material)}</p><p>${esc(p.care)}</p></details><details><summary>Shipping & Returns</summary><p>Standard US shipping is available. Charges appear in your bag.</p><a href="${base}/help/returns">Read about returns</a></details>${p.variants?.length ? `<details><summary>Size & Color Availability</summary><div class="nk-table-scroll"><table><thead><tr><th>Color</th><th>Size</th><th>Price</th><th>Available</th></tr></thead><tbody>${catalogCandidates(p).map(v => `<tr><td>${esc(v.colorName)}</td><td>${esc(v.options.Size || 'One size')}</td><td>${money(v.price)}</td><td>${v.stock || 'Out of stock'}</td></tr>`).join('')}</tbody></table></div></details>` : ''}<details id="reviews"><summary>Reviews (${p.reviews}) · ${p.rating}/5</summary><p>Average rating: ${p.rating} out of 5 from ${p.reviews} ratings.</p><p>Written reviews are not available for this style.</p></details></section></div><section class="nk-shelf"><h2>You Might Also Like</h2>${cards(base, recommendations)}</section>`)
  })
}
