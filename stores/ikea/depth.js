import { productGallery } from '../../lib/product-assets.js'
import { esc, money } from '../../lib/html.js'
import { productPhoto } from '../../lib/product-photos.js'
import { rememberProduct } from '../../lib/retail-state.js'
import { inches } from './display.js'
import { products, departments, categories, rooms, deals, ideas } from './catalog.js'
import { emptySearch } from './search-empty.js'

const text = value => typeof value === 'string' ? value.trim().slice(0, 200) : ''
const unique = values => [...new Set(values)].sort((a, b) => a.localeCompare(b))
const dimensionsText = dimensions => Object.entries(dimensions || {}).map(([key, value]) => `${key[0].toUpperCase() + key.slice(1)}: ${inches(value)} in`).join(' · ')
const aliases = { couch: 'sofa', couches: 'sofa', workstation: 'desk', bookcases: 'bookcase', shelving: 'shelf', pillows: 'cushion', pillow: 'cushion', cot: 'crib', nightstand: 'bedside', closet: 'wardrobe', trolley: 'cart', tumblers: 'glasses' }
const filterKeys = ['q', 'category', 'department', 'room', 'material', 'color', 'min', 'max', 'price', 'stock', 'rating', 'width', 'depth', 'height', 'sort', 'deal']
const numericKeys = ['min', 'max', 'rating', 'width', 'depth', 'height']
const serviceInfo = {
  delivery: { title: 'Delivery information', intro: 'Bring your home ideas to your door.', paragraphs: ['Standard delivery within the United States is the delivery method available in this shopping experience. Delivery costs $0 and tax is $0; your bag and final checkout show the complete total.', 'Use a five-digit ZIP code to keep your shopping location handy. Inventory is the online availability shown for each chosen product option; it is not live stock at an IKEA store.', 'Scheduled arrival dates, in-home delivery, click and collect, and assembly appointments are not offered here. Placing an order records your purchase and confirmation without dispatching goods.'], link: '/location', action: 'Set your delivery ZIP code' },
  assembly: { title: 'Assembly & product care', intro: 'A little preparation makes putting it together easier.', paragraphs: ['Check the measurements on the product page and make space to unpack all components. The product overview describes whether assembly is needed and if two people are recommended.', 'The assembly overview is a preparation guide. Follow the instruction booklet supplied with your furniture for the exact sequence and hardware. Wall fixings must be suitable for your wall.', 'Assembly booking and replacement-parts dispatch are not available here. Browse the product guides below for material, care and preparation information.'], link: '/search?category=Furniture', action: 'Browse furniture' },
  planning: { title: 'Plan your space', intro: 'Start with a few measurements and a clear idea of how you use the room.', paragraphs: ['Measure the room, doorways and available wall space in inches. Note the position of outlets, windows and radiators. Leave enough space to walk, open doors and pull out chairs.', 'Use maximum width, depth and height filters to narrow furniture choices. Each product page shows its measurements, materials and assembly needs, with option-specific dimensions where they differ.', 'Explore a room below, save products to your favorites and review your choices together. Online 3D scanning, kitchen configuration and live planning appointments are not offered in this experience.'], link: '/favorites', action: 'Open your saved products' },
}

export function ikeaDepth(router, context) {
  const { render, productById, selectedProduct, artwork, stockLimit } = context
  const baseOf = res => res.locals.base
  const crumb = (base, current, previous = '') => `<p class="breadcrumb"><a href="${base}/">Home</a> / ${previous}${esc(current)}</p>`
  const notFound = (req, res, label = 'Page') => render(req, res, `${label} not found`, `<section class="empty"><h1>${label} not found</h1><p>We couldn’t find that page. Explore our products or room ideas to keep going.</p><a class="button" href="${baseOf(res)}/products">Explore products</a></section>`, 404)
  const photo = (key, label, className = '') => productPhoto(key, label, className)
  const choicesFor = product => product.variants?.length ? product.variants.map(variant => ({ product: { ...selectedProduct(product, variant.options), dimensions: variant.dimensions || product.dimensions, colors: variant.options.Color ? [variant.options.Color] : product.colors }, options: variant.options })) : [{ product, options: {} }]
  function productHref(base, product, options = {}) {
    const params = new URLSearchParams(Object.entries(options).map(([label, value]) => [`option_${label}`, value]))
    return `${base}/product/${product.id}${params.size ? `?${esc(params.toString())}` : ''}`
  }
  function cards(base, list) {
    return `<div class="ik-products">${list.map(row => {
      const product = row.product || row, options = row.product ? row.options || {} : {}, href = productHref(base, product, options)
      return `<article class="ik-product" data-product-id="${esc(product.id)}" data-price="${product.price}"><a class="ik-product-image" href="${href}" aria-label="${esc(product.title)}">${artwork(product)}</a>${product.badge ? `<p class="ik-badge">${esc(product.badge)}</p>` : ''}<h3><a href="${href}">${esc(product.title)}</a></h3><p class="ik-descriptor">${esc(product.material)} · ${esc(product.colors.join(', '))}</p><p class="ik-dimensions">${esc(dimensionsText(product.dimensions))}</p><p class="card-price">${money(product.price)}</p><a class="rating" href="${href}#reviews" aria-label="${product.rating} out of 5 from ${product.reviews} ratings">★★★★★ <span>${product.rating} (${product.reviews})</span></a><p class="ik-stock${stockLimit(product) ? '' : ' unavailable'}">${stockLimit(product) ? '● Available for delivery' : '○ Currently out of stock'}</p><div class="ik-card-actions"><a class="ik-round" href="${href}" aria-label="View ${esc(product.title)}">→</a><form action="${base}/favorites" method="post"><input type="hidden" name="id" value="${product.id}">${Object.entries(options).map(([label, value]) => `<input type="hidden" name="option_${label}" value="${esc(value)}">`).join('')}<button class="ik-save" aria-label="Save ${esc(product.title)}">♡</button></form>${Object.keys(product.options || {}).length ? `<a href="${href}">${Object.values(product.options).map(o => o.length).join(" × ")} options</a>` : ''}</div></article>`
    }).join('')}</div>`
  }
  const pick = ids => ids.map(productById).filter(Boolean)
  const shelf = (base, title, description, ids, href) => !ids.length ? '' : `<section class="ik-shelf"><div class="section-heading"><h2>${esc(title)}</h2><a href="${base + href}">Explore more →</a></div><p class="ik-section-intro">${esc(description)}</p>${cards(base, pick(ids))}</section>`
  const roomTiles = (base, list = rooms) => `<div class="ik-room-grid">${list.map(room => `<a href="${base}/rooms/${room.id}">${photo(room.photo, `${room.title} inspiration`)}<h3>${esc(room.title)} →</h3></a>`).join('')}</div>`
  const categoryTiles = (base, list = categories) => `<div class="ik-category-browser" data-category-browser><div class="ik-category-rail" data-category-rail tabindex="0" aria-label="Product categories">${list.map(category => `<a href="${base}/category/${category.id}">${artwork(productById(category.product))}<span>${esc(category.title)}</span></a>`).join('')}</div><div class="ik-rail-controls" hidden><button type="button" data-rail-direction="-1" aria-label="Previous categories">←</button><button type="button" data-rail-direction="1" aria-label="More categories">→</button></div></div>`

  router.get('/', (req, res) => {
    const base = baseOf(res)
    render(req, res, 'Furniture and inspiration for your home', `${categoryTiles(base, categories)}<h1 class="ik-home-title">Welcome to IKEA USA</h1><section class="ik-mosaic"><a class="ik-mosaic-main" href="${base}/rooms/kitchen">${photo('room-kitchen', 'A warm kitchen with wooden cabinets and light countertops')}<div><p class="eyebrow">Make room for everyday life</p><h2>Good company starts at home</h2><p>Little ideas for cooking, gathering and making memories.</p><span class="button">Explore kitchen & dining →</span></div></a><a class="ik-mosaic-small ik-official-tile" href="${base}/category/cookware-utensils"><img src="/static/reference/ikea/kitchen-accessories.jpg" alt="Burgundy cookware on a stovetop while a person stirs vegetables"><div><p class="eyebrow">New</p><h2>New, must-try kitchen accessories</h2><span aria-hidden="true">→</span></div></a><a class="ik-mosaic-small ik-official-tile" href="${base}/services/planning"><img src="/static/reference/ikea/kitchen-planning.jpg" alt="An IKEA co-worker planning a kitchen during a video call"><div><h2>Plan your dream kitchen</h2><span>Planning services →</span></div></a></section>${shelf(base, 'New ways to make everyday easier', 'Practical finds for work, rest and everything in between.', ['desk', 'sofa', 'storage-box', 'laptop-stand'], '/search?sort=new')}<section class="ik-hosting"><div><p class="eyebrow">Everyday gatherings</p><h2>Set the table.<br>Make a little time.</h2><p>Simple, useful pieces for breakfasts, celebrations and everything in between.</p><a class="button secondary" href="${base}/category/kitchen-dining">Explore kitchen & dining</a></div><a href="${base}/category/dining-furniture">${artwork(productById('dining-table'))}<span>Gather around the table →</span></a><a href="${base}/category/cookware-utensils">${artwork(productById('steel-pot'))}<span>A little help in the kitchen →</span></a></section>${shelf(base, 'A table for everyday gatherings', 'Durable, useful pieces you can mix and enjoy every day.', ['dinner-plate', 'serving-bowl', 'drinking-glass', 'flatware'], '/category/tableware')}<section class="ik-room-section"><div class="section-heading"><h2>Every room has possibilities</h2><a href="${base}/rooms">All room inspiration →</a></div><p>Explore ideas and shop the pieces that suit your home. Room images are inspiration; products are sold individually.</p>${roomTiles(base)}</section>${shelf(base, 'A place for everything', 'Small storage that puts your space to work.', ['basket', 'hangers', 'shelf', 'utility-cart'], '/category/storage-organization')}<section class="ik-planning-banner"><div><p class="eyebrow">From an idea to your space</p><h2>Measure. Explore. Make it yours.</h2><p>Find practical planning advice and save products as you go.</p><a class="button" href="${base}/services/planning">Start planning</a></div>${photo('room-office', 'A bright compact home workspace')}</section><section class="ik-service-grid"><a href="${base}/services/delivery"><h3>Delivery information</h3><p>Understand the delivery options for your order.</p></a><a href="${base}/services/assembly"><h3>Assembly & care</h3><p>Prepare your space and look after your furniture.</p></a><a href="${base}/help"><h3>Here to help</h3><p>Find answers about shopping and your account.</p></a></section>`)
  })

  router.get('/products', (req, res) => {
    const base = baseOf(res)
    render(req, res, 'All products', `${crumb(base, 'Products')}<h1>Products for every part of your home</h1><p class="ik-lead">Explore ${products.length} products across ${departments.length} departments, from the furniture you live with to the little things you use every day.</p><div class="ik-department-grid">${departments.map(d => `<a href="${base}/category/${d.id}">${photo(d.photo, d.title)}<h2>${esc(d.title)}</h2><p>${esc(d.intro)}</p><span>${products.filter(p => p.department === d.id).length} products →</span></a>`).join('')}</div><h2>Explore all categories</h2>${categoryTiles(base)}<a class="button" href="${base}/search">Browse all ${products.length} products</a>${shelf(base, 'A few everyday favorites', 'Little comforts and practical helpers.', ['mug', 'bath-towel', 'cushion', 'plush-rabbit'], '/search?sort=rating')}`)
  })

  function searchState(req, fixed = {}) {
    const values = Object.fromEntries(filterKeys.map(key => [key, text(req.query[key])]))
    const errors = []
    if (Object.keys(req.query).some(key => filterKeys.some(filter => key.startsWith(`${filter}[`)))) errors.push('Choose one value for each filter.')
    for (const key of filterKeys) if (req.query[key] !== undefined && typeof req.query[key] !== 'string') errors.push(`Choose one value for ${key}.`)
    for (const key of numericKeys) if (values[key] && (!/^\d+(?:\.\d+)?$/.test(values[key]) || !Number.isFinite(Number(values[key])))) errors.push(`Enter a valid number for ${key}.`)
    if (values.min && values.max && Number(values.min) > Number(values.max)) errors.push('Minimum price must be no more than maximum price.')
    const expanded = values.q.toLowerCase().replace(/\b([a-z]+)\b/g, word => aliases[word] || word)
    const terms = expanded.split(/\s+/).filter(Boolean)
    let results = products.flatMap(product => {
      const searchable = `${product.title} ${product.category} ${product.subcategory.replaceAll('-', ' ')} ${product.keywords || ''} ${product.material} ${product.rooms.join(' ').replaceAll('-', ' ')} ${categories.find(c => c.id === product.subcategory).title} ${departments.find(d => d.id === product.department).title}`.toLowerCase()
      if (!terms.every(term => searchable.includes(term))) return []
      if (fixed.department && product.department !== fixed.department) return []
      if (fixed.category && product.subcategory !== fixed.category) return []
      if (fixed.ids && !fixed.ids.includes(product.id)) return []
      if (values.department && product.department !== values.department) return []
      if (values.category && product.category !== values.category && product.subcategory !== values.category) return []
      if (values.room && !product.rooms.includes(values.room)) return []
      if (values.material && product.material !== values.material) return []
      if (values.rating && product.rating < Number(values.rating)) return []
      if (values.deal && !deals.find(d => d.id === values.deal)?.ids.includes(product.id)) return []
      const matching = choicesFor(product).filter(row => {
        const p = row.product
        if (values.color && !p.colors.includes(values.color)) return false
        if (values.min && p.price < Number(values.min)) return false
        if (values.max && p.price > Number(values.max)) return false
        if (values.price === '50' && p.price >= 50) return false
        if (fixed.max && p.price >= fixed.max) return false
        if (values.stock === 'in' && !stockLimit(p)) return false
        if (values.stock === 'out' && stockLimit(p)) return false
        for (const dimension of ['width', 'depth', 'height']) if (values[dimension] && (!['Furniture', 'Storage'].includes(p.category) || !p.dimensions[dimension] || p.dimensions[dimension] > Number(values[dimension]))) return false
        return true
      })
      if (!matching.length) return []
      // Prefer a purchasable matching option, then the lowest price. One result per family.
      matching.sort((a, b) => Number(Boolean(stockLimit(b.product))) - Number(Boolean(stockLimit(a.product))) || a.product.price - b.product.price)
      return [matching[0]]
    })
    const sorts = {
      'price-asc': (a, b) => a.product.price - b.product.price,
      'price-desc': (a, b) => b.product.price - a.product.price,
      rating: (a, b) => b.product.rating - a.product.rating,
      name: (a, b) => a.product.title.localeCompare(b.product.title),
      new: (a, b) => b.product.newRank - a.product.newRank,
      width: (a, b) => a.product.dimensions.width - b.product.dimensions.width,
    }
    if (Object.hasOwn(sorts, values.sort)) results.sort(sorts[values.sort])
    if (errors.length) results = []
    const pages = Math.max(1, Math.ceil(results.length / 12)), requested = /^\d+$/.test(text(req.query.page)) ? Number(req.query.page) : 1
    const page = Math.max(1, Math.min(pages, Number.isSafeInteger(requested) ? requested : 1))
    return { values, expanded, results, errors, pages, page, visible: results.slice((page - 1) * 12, page * 12) }
  }
  function filterForm(req, values, fixed = {}) {
    const select = (name, label, choices) => `<label>${esc(label)}<select name="${name}"><option value="">${name === 'sort' ? 'Relevance' : 'All'}</option>${choices.map(choice => { const [value, title] = Array.isArray(choice) ? choice : [choice, choice]; return `<option value="${esc(value)}"${values[name] === value ? ' selected' : ''}>${esc(title)}</option>` }).join('')}</select></label>`
    const number = (name, label) => `<label>${label}<input type="number" step="any" min="0" name="${name}" value="${esc(values[name])}"></label>`
    return `<details class="ik-filter-disclosure" data-filter-disclosure open><summary>Filter & sort <span>＋</span></summary><form class="ik-filters" method="get" action="${esc(req.baseUrl + req.path)}"><h2>Filter & sort</h2>${values.q ? `<input type="hidden" name="q" value="${esc(values.q)}">` : ''}${values.price ? `<input type="hidden" name="price" value="${esc(values.price)}">` : ''}${values.deal ? `<input type="hidden" name="deal" value="${esc(values.deal)}">` : ''}${select('sort', 'Sort by', [['price-asc', 'Price: Low to High'], ['price-desc', 'Price: High to Low'], ['rating', 'Top rated'], ['new', 'Newest'], ['name', 'Name'], ['width', 'Width: smallest first']])}<details open><summary>Category & room</summary>${!fixed.department && !fixed.category ? select('department', 'Department', departments.map(d => [d.id, d.title])) : ''}${!fixed.category ? select('category', 'Category', [...categories.filter(c => !fixed.department || c.department === fixed.department).map(c => [c.id, c.title]), ...context.config.categories.map(c => [c, c])]) : ''}${select('room', 'Room', rooms.map(r => [r.id, r.title]))}</details><details open><summary>Price</summary><div class="ik-range">${number('min', 'Minimum ($)')}${number('max', 'Maximum ($)')}</div>${values.price === '50' ? '<p>Showing prices under $50.</p>' : ''}</details><details open><summary>Material & color</summary>${select('material', 'Material', unique(products.map(p => p.material)))}${select('color', 'Color', unique(products.flatMap(p => p.colors)))}</details><details><summary>Furniture dimensions</summary><p>Maximum size in inches. Applies to furniture and storage.</p>${number('width', 'Maximum width (in)')}${number('depth', 'Maximum depth (in)')}${number('height', 'Maximum height (in)')}</details><details open><summary>Availability & rating</summary>${select('stock', 'Availability', [['in', 'Available for delivery'], ['out', 'Out-of-stock options']])}${select('rating', 'Minimum rating', [['4', '4 stars and up'], ['4.5', '4.5 stars and up'], ['4.7', '4.7 stars and up']])}</details><button type="submit">Apply filters</button><a href="${esc(req.baseUrl + req.path)}${values.q ? `?q=${esc(encodeURIComponent(values.q))}` : ''}">Clear all filters</a></form></details>`
  }
  function browse(req, res, { title, intro = '', before = '', fixed = {} } = {}) {
    const base = baseOf(res), state = searchState(req, fixed), { values, results, errors, page, pages, visible } = state
    if (values.q && !title && !results.length && !errors.length && !filterKeys.some(key => !['q', 'sort'].includes(key) && values[key])) {
      req.ikeaEmptySearch = true
      return render(req, res, `Search results for “${values.q}”`, emptySearch(base, values.q))
    }
    const heading = title || (values.q ? `Search results for “${values.q}”` : 'All products')
    const params = new URLSearchParams(Object.entries(values).filter(([, value]) => value))
    const pageLink = n => { const next = new URLSearchParams(params); next.set('page', String(n)); return `${base + req.path}?${esc(next.toString())}` }
    const expandedNote = state.expanded !== values.q.toLowerCase() ? `<p>Showing matches for <strong>${esc(state.expanded)}</strong>.</p>` : ''
    const filters = filterKeys.filter(key => values[key] && !['q', 'sort'].includes(key)).map(key => { const next = new URLSearchParams(params); next.delete(key); return `<a href="${base + req.path}?${esc(next.toString())}">${esc(key)}: ${esc(values[key])} ×<span class="sr-only"> Remove filter</span></a>` }).join('')
    const paging = results.length ? `<nav class="ik-pagination" aria-label="Results pages">${page > 1 ? `<a href="${pageLink(page - 1)}">← Previous</a>` : ''}${Array.from({ length: pages }, (_, i) => `<a href="${pageLink(i + 1)}"${page === i + 1 ? ' aria-current="page"' : ''}>${i + 1}</a>`).join('')}${page < pages ? `<a href="${pageLink(page + 1)}">Next →</a>` : ''}</nav>` : ''
    render(req, res, heading, `${crumb(base, title || 'Search')}<h1>${esc(heading)}</h1>${intro ? `<p class="ik-lead">${esc(intro)}</p>` : ''}${before}${expandedNote}<div class="ik-suggestions"><span>Popular searches:</span>${['desk', 'sofa', 'storage', 'lamp', 'tableware'].map(q => `<a href="${base}/search?q=${q}">${q}</a>`).join('')}</div><div class="ik-browse">${filterForm(req, values, fixed)}<section class="ik-results" aria-label="Product results">${errors.length ? `<div class="error" role="alert">${errors.map(esc).join(' ')}</div>` : ''}<div class="ik-results-summary"><p><strong>${results.length} ${results.length === 1 ? 'result' : 'results'}</strong>${results.length ? ` · Showing ${(page - 1) * 12 + 1}–${Math.min(page * 12, results.length)}` : ''}</p>${results.length ? `<p>Page ${page} of ${pages}</p>` : ''}</div>${filters ? `<div class="ik-active-filters">${filters}</div>` : ''}${results.length ? cards(base, visible) + paging : `<section class="empty"><h2>No results found</h2><p>We couldn’t find any products matching ${values.q ? `“${esc(values.q)}” and ` : ''}these filters. Try a broader search or remove a filter.</p><a class="button" href="${base}/search">Browse all products</a></section><h2>You may also like</h2><p>These suggestions are separate from your search results.</p>${cards(base, pick(['basket', 'mug', 'lamp']))}`}</section></div>`, errors.length ? 400 : 200)
  }
  router.get(['/us/en/search', '/search'], (req, res) => browse(req, res))
  router.get('/category/:slug', (req, res) => {
    const department = departments.find(d => d.id === req.params.slug), category = categories.find(c => c.id === req.params.slug), base = baseOf(res)
    if (!department && !category) return notFound(req, res, 'Category')
    if (department) return browse(req, res, { title: department.title, intro: department.intro, fixed: { department: department.id }, before: `<section class="ik-category-intro">${photo(department.photo, department.title)}<div><h2>Find room for what matters</h2><p>${esc(department.intro)}</p><a href="${base}/rooms">Explore room inspiration →</a></div></section>${categoryTiles(base, categories.filter(c => c.department === department.id))}` })
    const parent = departments.find(d => d.id === category.department)
    browse(req, res, { title: category.title, intro: 'Compare measurements, materials and available options to find the right fit for your home.', fixed: { category: category.id }, before: `<p><a href="${base}/category/${parent.id}">← ${esc(parent.title)}</a></p>` })
  })

  router.get('/rooms', (req, res) => render(req, res, 'Room inspiration', `${crumb(baseOf(res), 'Rooms')}<h1>Every room has possibilities</h1><p class="ik-lead">Find ideas for the way you live. Room photographs offer inspiration; furnishings are sold individually.</p>${roomTiles(baseOf(res))}`))
  router.get('/rooms/:slug', (req, res) => {
    const room = rooms.find(r => r.id === req.params.slug), base = baseOf(res)
    if (!room) return notFound(req, res, 'Room')
    render(req, res, room.title, `${crumb(base, room.title, `<a href="${base}/rooms">Rooms</a> / `)}<section class="ik-room-hero">${photo(room.photo, `${room.title} inspiration`)}<div><p class="eyebrow">${esc(room.title)} ideas</p><h1>${esc(room.headline)}</h1><p>${esc(room.intro)}</p><a class="button" href="${base}/search?room=${room.id}">Shop ${esc(room.title.toLowerCase())}</a></div></section><p class="muted">Room inspiration. Products pictured are styling ideas and are not included as a bundle.</p>${shelf(base, 'Pieces to get you started', 'Choose the options that work for your room.', room.featured, `/search?room=${room.id}`)}<section class="ik-advice"><h2>Small ideas that make a difference</h2><ol>${room.advice.map(a => `<li>${esc(a)}</li>`).join('')}</ol><a class="button secondary" href="${base}/services/planning">Plan your space</a> <a href="${base}/favorites">Review your saved products</a></section>${shelf(base, 'More for this room', 'Useful details, soft layers and practical storage.', products.filter(p => p.rooms.includes(room.id) && !room.featured.includes(p.id)).slice(0, 4).map(p => p.id), `/search?room=${room.id}`)}`)
  })
  router.get('/deals', (req, res) => {
    const base = baseOf(res)
    render(req, res, 'Everyday value', `${crumb(base, 'Deals')}<section class="ik-value-hero"><p class="eyebrow">Everyday value</p><h1>A little goes a long way</h1><p>Useful things for your home at prices you can plan around. Explore our everyday price collections.</p></section><div class="ik-collection-grid">${deals.map(d => `<a href="${base}/deals/${d.id}">${artwork(productById(d.ids[0]))}<h2>${esc(d.title)}</h2><p>${esc(d.intro)}</p><span>Explore ${d.ids.length} products →</span></a>`).join('')}</div><p>These are everyday catalog prices. No membership code or limited-time markdown is required.</p>`)
  })
  router.get('/deals/:slug', (req, res) => { const deal = deals.find(d => d.id === req.params.slug); return deal ? browse(req, res, { title: deal.title, intro: deal.intro, fixed: { ids: deal.ids, max: deal.max } }) : notFound(req, res, 'Collection') })
  router.get('/ideas', (req, res) => {
    const base = baseOf(res)
    render(req, res, 'Design & ideas', `${crumb(base, 'Design & ideas')}<h1>Ideas for your everyday</h1><p class="ik-lead">A few thoughtful changes can make a room work better. Explore practical ideas and the products to bring them home.</p><div class="ik-collection-grid">${ideas.map(idea => `<a href="${base}/ideas/${idea.id}">${photo(rooms.find(r => r.id === idea.room).photo, idea.title)}<h2>${esc(idea.title)}</h2><p>${esc(idea.intro)}</p><span>Explore the idea →</span></a>`).join('')}</div>`)
  })
  router.get('/ideas/:slug', (req, res) => {
    const idea = ideas.find(i => i.id === req.params.slug), base = baseOf(res)
    if (!idea) return notFound(req, res, 'Idea')
    render(req, res, idea.title, `${crumb(base, idea.title, `<a href="${base}/ideas">Design & ideas</a> / `)}<section class="ik-room-hero">${photo(rooms.find(r => r.id === idea.room).photo, idea.title)}<div><p class="eyebrow">Design & ideas</p><h1>${esc(idea.title)}</h1><p>${esc(idea.intro)}</p></div></section><section class="ik-advice"><h2>Try it at home</h2><ol>${idea.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol><a href="${base}/services/planning">Measure and plan your space →</a></section>${shelf(base, 'Shop this idea', 'Choose individual pieces and options to fit your own home.', idea.ids, `/search?room=${idea.room}`)}`)
  })
  router.get('/services', (req, res) => {
    const base = baseOf(res)
    render(req, res, 'Services', `${crumb(base, 'Services')}<h1>A little help with your home</h1><p class="ik-lead">Get ready for your next home project with delivery information, assembly guidance and simple planning advice.</p><div class="ik-service-grid">${Object.entries(serviceInfo).map(([key, service]) => `<a href="${base}/services/${key}"><h2>${esc(service.title)}</h2><p>${esc(service.intro)}</p><span>Find out more →</span></a>`).join('')}</div><section class="ik-advice"><h2>Need help with an order?</h2><p>Your confirmation includes the purchased items, selected options and order number.</p><a class="button" href="${base}/account">Go to your account</a> <a href="${base}/help">Customer service</a></section>`)
  })
  router.get('/services/:slug', (req, res) => {
    const service = serviceInfo[req.params.slug], base = baseOf(res)
    if (!Object.hasOwn(serviceInfo, req.params.slug)) return notFound(req, res, 'Service')
    render(req, res, service.title, `${crumb(base, service.title, `<a href="${base}/services">Services</a> / `)}<section class="ik-service-copy"><h1>${esc(service.title)}</h1><p class="ik-lead">${esc(service.intro)}</p>${service.paragraphs.map(p => `<p>${esc(p)}</p>`).join('')}<a class="button" href="${base + service.link}">${esc(service.action)}</a></section>${req.params.slug === 'planning' ? roomTiles(base) : ''}${req.params.slug === 'assembly' ? `<h2>Product assembly overviews</h2><div class="ik-guide-links">${products.filter(p => p.assembly !== 'No assembly required.').map(p => `<a href="${base}/product/${p.id}/assembly">${esc(p.title)} →</a>`).join('')}</div>` : ''}`)
  })
  router.get('/product/:id/assembly', (req, res) => {
    const product = productById(req.params.id), base = baseOf(res)
    if (!product) return notFound(req, res, 'Product')
    render(req, res, `${product.title}: assembly & care`, `${crumb(base, 'Assembly & care', `<a href="${base}/product/${product.id}">${esc(product.title)}</a> / `)}<section class="ik-service-copy"><h1>${esc(product.title)}</h1><p>Article number ${esc(product.article)}</p><h2>Assembly overview</h2><p>${esc(product.assembly)}</p><p>This overview helps you prepare. Use the instruction booklet supplied with the product for the complete sequence and hardware details.</p><h2>Materials</h2><p>${esc(product.material)}</p><h2>Care instructions</h2><p>${esc(product.care)}</p><a class="button" href="${base}/product/${product.id}">Back to product</a><p><a href="${base}/help/contact?product_id=${product.id}&amp;category=Assembly">Get help with assembly or materials →</a></p></section>`)
  })

  router.get('/product/:id', (req, res) => {
    const product = productById(req.params.id), base = baseOf(res)
    if (!product) return notFound(req, res, 'Product')
    rememberProduct(req, product.id)
    const values = {}, errors = []
    if (Object.keys(req.query).some(key => key.startsWith('option_') && !Object.keys(product.options).some(label => key === `option_${label}`))) errors.push('Choose a valid product option.')
    for (const [label, options] of Object.entries(product.options)) {
      const raw = req.query[`option_${label}`], value = text(raw)
      if (raw !== undefined && (typeof raw !== 'string' || (value && !options.includes(value)))) errors.push(`Choose an available ${label.toLowerCase()}.`)
      values[label] = options.includes(value) ? value : ''
    }
    const complete = Object.values(values).every(Boolean)
    const resolved = complete ? selectedProduct(product, values) : null
    if (complete && !resolved) errors.push('This combination of options is unavailable.')
    const variant = product.variants?.find(v => v.id === resolved?.variantId)
    const display = resolved ? { ...resolved, dimensions: variant?.dimensions || product.dimensions } : product
    const available = Boolean(resolved && stockLimit(resolved))
    const category = categories.find(c => c.id === product.subcategory)
    const related = products.filter(p => p.id !== product.id).sort((a, b) => Number(b.subcategory === product.subcategory) - Number(a.subcategory === product.subcategory) || b.rooms.filter(r => product.rooms.includes(r)).length - a.rooms.filter(r => product.rooms.includes(r)).length).slice(0, 4)
    const saved = (req.store.favorites || []).includes(product.id)
    const optionForm = Object.keys(product.options).length ? `<form class="ik-options" action="${base}/product/${product.id}" method="get" data-option-form><h2>Choose your options</h2>${Object.entries(product.options).map(([label, options]) => `<label for="option-${label}">${esc(label)}</label><select id="option-${label}" name="option_${label}"><option value="">Select ${esc(label.toLowerCase())}</option>${options.map(value => `<option value="${esc(value)}"${values[label] === value ? ' selected' : ''}>${esc(value)}</option>`).join('')}</select>`).join('')}${Object.entries(product.options).map(([label, choices]) => `<div class="ik-option-choices" role="group" aria-label="${esc(label)} choices">${choices.map(value => `<a href="${productHref(base, product, { ...values, [label]: value })}"${values[label] === value ? ' aria-current="true"' : ''}>${esc(value)}</a>`).join('')}</div>`).join('')}<button class="secondary">Update selection</button></form>` : ''
    render(req, res, product.title, `${crumb(base, product.title, `<a href="${base}/category/${category.id}">${esc(category.title)}</a> / `)}${errors.length ? `<div class="error" role="alert">${errors.map(esc).join(' ')}</div>` : ''}<div class="ik-pdp"><section class="ik-gallery">${productGallery('ikea', display, { className: 'ik-gallery-image', view: req.query.view })}<div class="ik-gallery-links"><a href="#measurements">View measurements ↓</a><a href="${base}/rooms/${product.rooms[0]}">See room inspiration →</a></div></section><section class="ik-buy"><p class="ik-badge">${esc(product.badge || category.title)}</p><h1>${esc(product.title)}</h1><p>${esc(product.material)} · ${esc(Object.values(values).filter(Boolean).join(' · ') || product.colors.join(' / '))}</p><p>${esc(dimensionsText(display.dimensions))}</p><p class="price" data-selected-price="${display.price}">${!complete && product.variants?.some(v => v.price !== product.price) ? 'From ' : ''}${money(!complete && product.variants?.length ? Math.min(...product.variants.map(v => v.price)) : display.price)}</p><a class="rating" href="#reviews">★★★★★ ${product.rating} (${product.reviews} ratings)</a><p>${esc(product.description)}</p>${optionForm}<section class="ik-how"><h2>How to get it</h2><p class="ik-stock${complete && !available ? ' unavailable' : ''}" data-selected-stock="${complete ? stockLimit(display) : ''}">${!complete ? 'Choose your options to check availability.' : available ? `● Available for delivery · ${stockLimit(display)} available` : '○ This option is currently out of stock.'}</p><p>Standard delivery: Free</p><p><a href="${base}/location">${req.store.location ? `Deliver to ${esc(req.store.location)}` : 'Set delivery ZIP code'}</a></p><p class="muted">Online stock shown. In-store stock, collection and delivery-date booking are not available.</p></section><form class="ik-add" method="post" action="${base}/cart/add"><input type="hidden" name="id" value="${product.id}">${Object.entries(values).map(([label, value]) => `<input type="hidden" name="option_${label}" value="${esc(value)}">`).join('')}<label>Quantity<input type="number" name="qty" min="1" max="${available ? stockLimit(display) : 1}" value="1" required></label><button${available && !errors.length ? '' : ' disabled'}>${!complete ? 'Choose options above' : available ? 'Add to bag' : 'Out of stock'}</button></form><form action="${base}/favorites" method="post"><input type="hidden" name="id" value="${product.id}">${Object.entries(values).map(([label, value]) => `<input type="hidden" name="option_${label}" value="${esc(value)}">`).join('')}<button class="secondary favorite-button">${saved ? '♥ Saved — remove' : '♡ Save to favorites'}</button></form><p><a href="${base}/lists/add?product_id=${product.id}&amp;${esc(new URLSearchParams(Object.entries(values).map(([label, value]) => [`option_${label}`, value])).toString())}">Save selected options to a shopping list →</a></p><p><a href="${base}/services/planning">Try it in a room project</a> · <a href="${base}/help/contact?product_id=${product.id}&amp;category=Products">Ask about this product</a></p></section></div><section class="ik-product-information"><h2>Good to know</h2><details open><summary>Product details & materials</summary><p>${esc(product.description)}</p><p><strong>Materials:</strong> ${esc(product.material)}</p><p>Article number: ${esc(product.article)}</p>${product.details ? `<ul>${product.details.map(d => `<li>${esc(d)}</li>`).join('')}</ul>` : ''}</details><details open id="measurements"><summary>Measurements</summary><dl class="ik-measurements">${Object.entries(display.dimensions).map(([label, value]) => `<div><dt>${label[0].toUpperCase() + label.slice(1)}</dt><dd>${inches(value)} in</dd></div>`).join('')}</dl><p>Check the complete footprint and leave room for doors, drawers and walking routes.</p></details><details><summary>Assembly & care</summary><h3>Assembly</h3><p>${esc(product.assembly)}</p><h3>Care</h3><p>${esc(product.care)}</p><a href="${base}/product/${product.id}/assembly">Read the assembly and care overview →</a><p><a href="${base}/help/contact?product_id=${product.id}&amp;category=Assembly">Get help with assembly or materials</a></p></details>${product.variants?.length ? `<details><summary>Available options</summary><table class="ik-option-table"><thead><tr><th>Option</th><th>Price</th><th>Online availability</th></tr></thead><tbody>${product.variants.map(v => `<tr><td><a href="${productHref(base, product, v.options)}">${esc(Object.values(v.options).join(' · '))}</a></td><td>${money(v.price)}</td><td>${v.stock ? `${Math.min(v.stock, stockLimit(product))} available` : 'Out of stock'}</td></tr>`).join('')}</tbody></table></details>` : ''}<details><summary>Delivery & returns</summary><p>Standard delivery is free in this shopping experience. Your bag shows the full total.</p><a href="${base}/services/delivery">Delivery information</a> · <a href="${base}/help/articles/returns">Return information</a></details></section><section id="reviews" class="reviews"><h2>Ratings & reviews</h2><p class="rating">★★★★★ ${product.rating} / 5 · ${product.reviews} ratings</p><p>Written customer reviews are not available for this product.</p></section><section class="ik-shelf"><div class="section-heading"><h2>You may also like</h2><a href="${base}/category/${category.id}">More ${esc(category.title.toLowerCase())} →</a></div>${cards(base, related)}</section>`, errors.length ? 400 : 200)
  })
}
