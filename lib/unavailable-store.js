import express from 'express'
import { randomBytes } from 'node:crypto'
import { esc, money, disclaimer } from './html.js'
import { validateCard } from './payment.js'
import { getOrder, recordOrder } from './orders.js'
import { authenticate, createAccount, publicAccount } from './accounts.js'
import { productImage, productGallery } from './product-assets.js'
import { retailState, defaultAddress } from './retail-state.js'
import { AsyncLocalStorage } from 'node:async_hooks'
import { scenarioActive, scenarioProduct, enterScenarioCart, scenarioPayment } from './benchmark-scenarios.js'

const text = value => typeof value === 'string' ? value.trim() : ''
const quantity = value => typeof value === 'number' ? value : typeof value === 'string' && /^\d+$/.test(value.trim()) ? Number(value) : NaN
const round = value => Math.round(value * 100) / 100
const maxQty = 10

// Brand-specific merchandising is configured per retailer. Checkout, review data,
// stock and product options are deterministic fixtures; see research/FIDELITY_AUDIT.md.
// Only catalog products can be ordered and every order line remains kind: other.
export function unavailableStore(config) {
  const { slug, name, categories, products } = config
  const router = express.Router()
  const requestStore = new AsyncLocalStorage()
  router.use((req, res, next) => requestStore.run(req.store, () => {
    if (/^\/(cart|checkout)(?:\/|$)/.test(req.path)) enterScenarioCart(req.store)
    next()
  }))
  const productById = id => scenarioProduct(requestStore.getStore(), products.find(product => product.id === text(id)))
  const stockLimit = product => product.available === false ? 0 : Math.min(maxQty, Number.isInteger(product.stock) ? Math.max(0, product.stock) : maxQty)
  const selectedProduct = (product, options = {}) => {
    if (!product.variants?.length) return product
    const variant = product.variants.find(item => Object.keys(product.options || {}).every(label => item.options[label] === options[label]))
    if (!variant) return null
    return { ...product, price: variant.price ?? product.price, stock: Math.min(stockLimit(product), stockLimit(variant)), available: product.available !== false && variant.available !== false, variantId: variant.id,
      photo: Object.hasOwn(variant, 'photo') ? variant.photo : product.photo, color: variant.color ?? product.color, art: variant.art ?? product.art }
  }
  const lines = state => state.cart.flatMap(line => {
    const original = productById(line.pid)
    const product = original && scenarioProduct(state, selectedProduct(original, line.options))
    return product ? [{ product, qty: line.qty, options: line.options || {}, key: line.key || product.id }] : []
  })
  const totals = state => {
    const subtotal = round(lines(state).reduce((sum, line) => sum + line.product.price * line.qty, 0))
    // Nike and Sephora thresholds reflect researched US policies. Other delivery
    // fees and tax remain deterministic scenario assumptions, not live quotes.
    let shipping = 0
    if (slug === 'nike') shipping = subtotal >= (state.user ? 50 : 75) ? 0 : (state.user ? 5 : 8)
    if (slug === 'sephora') shipping = state.user || subtotal >= 50 ? 0 : 6.95
    return { subtotal, shipping, tax: 0, total: round(subtotal + shipping) }
  }
  const checkoutFingerprint = state => JSON.stringify({
    owner: state.user?.id || null,
    location: state.location || '',
    items: lines(state).map(({ product, qty, options, key }) => ({ key, sku: product.id, variant: product.variantId || null, options, qty, price: product.price })),
    totals: totals(state),
  })
  const alert = error => error ? `<div class="error" role="alert">${esc(error)}</div>` : ''
  const optionText = options => Object.entries(options).map(([key, value]) => `${key}: ${value}`).join(' · ')
  const deliveryPrice = amount => amount.shipping ? money(amount.shipping) : 'Free'
  function artwork(product) {
    return productImage(slug, product, { className: 'product-art' })
  }

  function cards(base, list) {
    return `<div class="products">${list.map(product => `<article class="product-card" data-price="${product.price}"><a href="${base}/product/${product.id}">${artwork(product)}${product.badge ? `<span class="badge">${esc(product.badge)}</span>` : ''}<p class="eyebrow">${esc(product.category)}</p><h3>${esc(product.title)}</h3></a><p class="rating" aria-label="${product.rating} out of 5 stars">★★★★☆ <span>(${product.reviews})</span></p><p class="card-price">${money(product.price)}</p>${Object.keys(product.options || {}).length ? '<p class="muted">More options available</p>' : ''}</article>`).join('')}</div>`
  }
  function categoryUrl(base, category) { return `${base}/search?category=${encodeURIComponent(category)}` }
  function navigation(base) {
    return config.nav.map(label => {
      if (categories.includes(label)) return `<a href="${categoryUrl(base, label)}">${esc(label)}</a>`
      if (label === 'Cooks’ Tools') return `<a href="${categoryUrl(base, 'Tools')}">${esc(label)}</a>`
      if (label === 'Tabletop & Bar') return `<a href="${categoryUrl(base, 'Tabletop')}">${esc(label)}</a>`
      if (label === 'Must Haves Under $50') return `<a href="${base}/search?price=50">${esc(label)}</a>`
      if (['New', 'New & Featured', 'Today’s favorites'].includes(label)) return `<a href="${base}/search?sort=new">${esc(label)}</a>`
      if (['Men', 'Women', 'Kids', 'Sport'].includes(label)) return `<a href="${base}/search?q=${label.toLowerCase()}">${esc(label)}</a>`
      if (label === 'Rooms') return `<details class="nav-menu"><summary>Rooms</summary><div><a href="${base}/search?q=living+room">Living room</a><a href="${base}/search?q=office">Home office</a><a href="${base}/search?q=dining">Dining room</a></div></details>`
      if (label === 'Deals') return `<a href="${base}/search?price=50">Under $50</a>`
      if (label === 'Services') return `<a href="${base}/help">Services</a>`
      return `<details class="nav-menu"><summary>${esc(label)}</summary><div>${categories.map(category => `<a href="${categoryUrl(base, category)}">${esc(category)}</a>`).join('')}</div></details>`
    }).join('')
  }
  function render(req, res, title, body, status = 200) {
    const base = res.locals.base
    if (scenarioActive(req.store)) body = `<p class="delivery-policy">Store pickup isn\u2019t available for this order. Choose shipping instead.</p>` + body
    const count = lines(req.store).reduce((sum, line) => sum + line.qty, 0)
    const accountLabel = req.store.user ? `Hi, ${req.store.user.first_name || 'Member'}` : config.membership
    if (config.chrome) return res.status(status).type('html').send(config.chrome({ req, base, title, body, count, accountLabel, artwork, cards }))
    const location = `<a href="${base}/location">⌖ ${req.store.location ? `Deliver to ${esc(req.store.location)}` : 'Choose your location'}</a>`
    const utility = `<div class="utility"><span>${esc(config.service)}</span><div>${location}<a href="${base}/help">Help</a><a href="${base}/account">${esc(accountLabel)}</a></div></div>`
    const brand = `<a class="brand" aria-label="${esc(name)} home" href="${base}/">${esc(name)}</a>`
    const search = `<form class="search" action="${base}/search" method="get"><label class="sr-only" for="search-query">Search ${esc(name)}</label><input id="search-query" name="q" type="search" value="${esc(req.query.q)}" placeholder="${esc(config.searchPlaceholder)}"><button type="submit" aria-label="Search">⌕</button></form>`
    const links = `<a class="favorite-link" href="${base}/favorites" aria-label="${slug === 'sephora' ? 'Loves' : 'Favorites'}">♡</a><a class="cart-link" href="${base}/cart">${esc(config.cartLabel)} (${count})</a>`
    res.status(status).type('html').send(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)} | ${esc(name)}</title><link rel="stylesheet" href="/static/unavailable.css">${config.stylesheet ? `<link rel="stylesheet" href="${esc(base + config.stylesheet)}">` : ''}</head>
<body class="${esc(slug)}"><a class="skip" href="#main">Skip to content</a>${utility}<header>${brand}${search}${links}</header><nav aria-label="Shop categories">${navigation(base)}</nav><main id="main">${body}</main><footer><div class="footer-columns"><section><h2>${esc(config.benefit)}</h2><p>${esc(config.benefitText)}</p><a href="${base}/account">${esc(config.membership)}</a></section><section><h3>Customer service</h3><a href="${base}/help">Shipping & delivery</a><a href="${base}/help#returns">Returns & exchanges</a><a href="${base}/location">Delivery location</a></section><section><h3>Shop with us</h3>${categories.map(category => `<a href="${categoryUrl(base, category)}">${esc(category)}</a>`).join('')}</section></div><p>${esc(name)} · ${esc(config.footer)}</p>${disclaimer(name).replace('pre-order flow', 'shopping experience')}</footer></body></html>`)
  }
  function productHref(base, product, options = {}) {
    const query = new URLSearchParams(Object.entries(options).map(([label, value]) => [`${config.productOptionQueryPrefix || ''}${label}`, value]))
    return esc(`${base}/product/${encodeURIComponent(product.id)}${query.size ? `?${query}` : ''}`)
  }
  function cartPage(req, res, error, status = 200) {
    enterScenarioCart(req.store)
    const base = res.locals.base, cart = lines(req.store), amount = totals(req.store)
    if (!error && cart.some(({ product, qty }) => qty > stockLimit(product))) error = 'An item in your cart is unavailable. Shipping is unavailable for this item. No order can be placed.'
    render(req, res, config.cartLabel, `<h1>Your ${esc(config.cartLabel.toLowerCase())}</h1>${alert(error)}${cart.length ? `<div class="checkout-grid"><div>${cart.map(({ product, qty, options, key }) => `<article class="cart-item"><a href="${productHref(base, product, options)}" aria-label="${esc(product.title)}">${artwork(product)}</a><div><h2><a href="${productHref(base, product, options)}">${esc(product.title)}</a></h2><p class="muted">${esc(optionText(options))}</p><p>${money(product.price)} each</p><form action="${base}/cart/update" method="post"><input type="hidden" name="id" value="${product.id}"><input type="hidden" name="key" value="${esc(key)}"><label for="qty-${encodeURIComponent(key)}">Quantity</label><input id="qty-${encodeURIComponent(key)}" name="qty" type="number" min="1" max="${maxQty}" value="${qty}"><button name="action" value="update">Update</button><button class="secondary" name="action" value="remove">Remove</button></form></div></article>`).join('')}</div><aside class="summary"><h2>Order summary</h2><p>Subtotal <strong>${money(amount.subtotal)}</strong></p><p>Delivery <strong>${deliveryPrice(amount)}</strong></p><p>Total <strong>${money(amount.total)}</strong></p><a class="button" href="${base}/checkout">Continue to checkout</a></aside></div>` : `<section class="empty"><h2>Your ${esc(config.cartLabel.toLowerCase())} is empty</h2><p>Find something you love from our collection.</p><a class="button" href="${base}/">Continue shopping</a></section>`}`, status)
  }
  const customerFields = [
    ['email', 'Email address', 'email', 'email'],
    ['first_name', 'First name', 'text', 'given-name'],
    ['last_name', 'Last name', 'text', 'family-name'],
    ['address', 'Street address', 'text', 'address-line1'],
    ['city', 'City', 'text', 'address-level2'],
    ['state', 'State (two-letter code)', 'text', 'address-level1'],
    ['postal_code', 'ZIP code', 'text', 'postal-code'],
  ]
  function checkoutPage(req, res, values = {}, error, status = 200) {
    enterScenarioCart(req.store)
    if (lines(req.store).some(({ product, qty }) => qty > stockLimit(product))) return cartPage(req, res, 'An item in your cart is unavailable. Shipping is unavailable for this item. No order can be placed.', 409)
    const base = res.locals.base, amount = totals(req.store)
    const fingerprint = checkoutFingerprint(req.store)
    if (req.store.checkout.retailReview?.fingerprint !== fingerprint) req.store.checkout.retailReview = { fingerprint, token: randomBytes(18).toString('hex') }
    const reviewToken = req.store.checkout.retailReview.token
    const input = (key, label, type, autocomplete, value = '') => `<label for="${key}">${label}</label><input id="${key}" name="${key}" type="${type}" autocomplete="${autocomplete}" value="${esc(value)}" required>`
    const addresses = req.store.user ? retailState(req).addresses : []
    const addressPicker = addresses.length ? `<section class="saved-address-picker"><h2>Use a saved address</h2><form action="${base}/checkout" method="get"><label for="saved-address">Delivery address</label><select id="saved-address" name="address_id">${addresses.map(address => `<option value="${esc(address.id)}"${address.id === values.address_id ? ' selected' : ''}>${esc(address.label || address.name)} — ${esc(address.line1)}, ${esc(address.city)} ${esc(address.postal_code)}</option>`).join('')}</select><button>Use this address</button></form><p>You can edit the delivery fields below before placing your order.</p></section>` : ''
    render(req, res, 'Checkout', `<p><a href="${base}/cart">Back to ${esc(config.cartLabel.toLowerCase())}</a></p><h1>Checkout</h1>${alert(error)}${addressPicker}<div class="checkout-grid"><form class="checkout-form" action="${base}/checkout" method="post"><input type="hidden" name="checkout_token" value="${reviewToken}"><fieldset><legend>Contact and delivery</legend>${customerFields.map(([key, label, type, autocomplete]) => input(key, label, type, autocomplete, values[key])).join('')}<p>Delivery within the United States · Standard shipping ${deliveryPrice(amount)}</p></fieldset><fieldset><legend>Payment</legend>${input('card_name', 'Name on card', 'text', 'cc-name', values.card_name)}${input('card_number', 'Card number', 'text', 'cc-number')}${input('card_expiry', 'Expiration date (MM/YY)', 'text', 'cc-exp', values.card_expiry)}${input('card_cvv', 'Security code', 'password', 'cc-csc')}<p>Billing address is the same as the delivery address.</p></fieldset><button type="submit">Place order · ${money(amount.total)}</button></form><aside class="summary"><h2>Order summary</h2>${lines(req.store).map(({ product, qty, options }) => `<p>${esc(product.title)} ${esc(optionText(options))} × ${qty}<strong>${money(product.price * qty)}</strong></p>`).join('')}<p>Delivery <strong>${deliveryPrice(amount)}</strong></p><p>Total <strong>${money(amount.total)}</strong></p></aside></div>`, status)
  }
  function notFound(req, res) {
    render(req, res, 'Product not found', `<section class="empty"><h1>Product not found</h1><p>This item is not available from ${esc(name)}.</p><a class="button" href="${res.locals.base}/">Continue shopping</a></section>`, 404)
  }
  // Store-owned extensions can register deeper pages using the existing chrome.
  config.extend?.(router, { render, products, productById, selectedProduct, artwork, cards, totals, lines, stockLimit, cartPage, checkoutPage, config })
  router.get('/', (req, res) => {
    const base = res.locals.base
    const categoriesHtml = `<section class="category-section"><h2>${slug === 'chewy' ? 'Shop for your pet' : 'Shop by category'}</h2><div class="category-tiles">${categories.map(category => { const p = products.find(item => item.category === category); return `<a href="${categoryUrl(base, category)}">${artwork(p)}<strong>${esc(category)}</strong></a>` }).join('')}</div></section>`
    const hero = `<section class="hero"><img class="hero-image" src="/static/art/retail/${slug}.png" alt="${esc(config.heroAlt)}"><div class="hero-copy"><p class="eyebrow">${esc(config.kicker)}</p><h1>${esc(config.headline)}</h1><p>${esc(config.intro)}</p><a class="button" href="${base}/search">Shop now</a></div></section>`
    render(req, res, 'Shop', `${slug === 'ikea' ? categoriesHtml : ''}${hero}${slug !== 'ikea' ? categoriesHtml : ''}<section class="featured"><div class="section-heading"><h2>${esc(config.featuredLabel)}</h2><a href="${base}/search">Shop all →</a></div>${cards(base, products.slice(0, 4))}</section><section class="membership-banner"><div><h2>${esc(config.benefit)}</h2><p>${esc(config.benefitText)}</p></div><a class="button" href="${base}/account">Explore benefits</a></section><section><h2>${slug === 'chewy' ? 'More ways to make their day' : 'Discover something new'}</h2>${cards(base, products.slice(4))}</section>`)
  })
  router.get('/search', (req, res) => {
    const base = res.locals.base, query = text(req.query.q), category = text(req.query.category), sort = text(req.query.sort)
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
    let results = products.filter(product => terms.every(term => `${product.title} ${product.category} ${product.keywords}`.toLowerCase().includes(term)))
    if (category) results = results.filter(product => product.category === category)
    if (req.query.price === '50') results = results.filter(product => product.price < 50)
    if (sort === 'price-asc') results.sort((a, b) => a.price - b.price)
    if (sort === 'price-desc') results.sort((a, b) => b.price - a.price)
    if (sort === 'rating') results.sort((a, b) => b.rating - a.rating)
    if (sort === 'new') results.sort((a, b) => Number(b.badge === 'New') - Number(a.badge === 'New'))
    const select = (name, label, values, current) => `<label>${label}<select name="${name}">${values.map(([v, l]) => `<option value="${v}"${v === current ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select></label>`
    render(req, res, query ? `Search: ${query}` : category || 'All products', `<p class="breadcrumb"><a href="${base}/">Home</a> / ${esc(category || 'Shop')}</p><h1>${query ? `Search results for “${esc(query)}”` : esc(category || 'All products')}</h1><form class="filters" action="${base}/search"><input type="hidden" name="q" value="${esc(query)}">${select('category', 'Category', [['', 'All categories'], ...categories.map(c => [c, c])], category)}${select('price', 'Price', [['', 'All prices'], ['50', 'Under $50']], text(req.query.price))}${select('sort', 'Sort by', [['', 'Featured'], ['new', 'New arrivals'], ['price-asc', 'Price: Low to High'], ['price-desc', 'Price: High to Low'], ['rating', 'Top rated']], sort)}<button>Apply filters</button><a href="${base}/search">Clear all</a></form><p>${results.length} ${results.length === 1 ? 'result' : 'results'}</p>${results.length ? cards(base, results) : `<section class="empty"><h2>No results found</h2><p>We couldn't find any products matching “${esc(query || category)}”. Try another search or browse our categories.</p><a class="button" href="${base}/search">Browse all products</a></section><h2>You may also like</h2>${cards(base, products.slice(0, 4))}`}`)
  })
  router.get('/product/:id', (req, res) => {
    const product = productById(req.params.id), base = res.locals.base
    if (!product) return notFound(req, res)
    const saved = (req.store.favorites || []).includes(product.id)
    render(req, res, product.title, `<p class="breadcrumb"><a href="${base}/">Home</a> / <a href="${categoryUrl(base, product.category)}">${esc(product.category)}</a></p><div class="product-detail">${productGallery(slug, product)}<section><p class="eyebrow">${esc(product.category)}</p><h1>${esc(product.title)}</h1><a class="rating" href="#reviews">★★★★☆ ${product.rating} (${product.reviews} reviews)</a><p class="price">${money(product.price)}</p><p>${esc(product.description)}</p><p class="stock">${stockLimit(product) ? "● In stock" : "Currently out of stock"}</p><p>${esc(config.delivery)} <a href="${base}/location">${req.store.location ? `Deliver to ${esc(req.store.location)}` : 'Set delivery ZIP code'}</a></p><form class="buy-form" method="post" action="${base}/cart/add"><input type="hidden" name="id" value="${product.id}">${Object.entries(product.options || {}).map(([label, options]) => `<label>${esc(label)}<select name="option_${esc(label)}" required><option value="">Select ${esc(label.toLowerCase())}</option>${options.map(value => `<option>${esc(value)}</option>`).join('')}</select></label>`).join('')}<label for="quantity">Quantity</label><input id="quantity" name="qty" type="number" min="1" max="${maxQty}" value="1"><button type="submit"${stockLimit(product) ? "" : " disabled"}>${stockLimit(product) ? `Add to ${esc(config.cartLabel.toLowerCase())}` : "Out of stock"}</button></form><form action="${base}/favorites" method="post"><input type="hidden" name="id" value="${product.id}"><button class="secondary favorite-button">${saved ? '♥ Saved — remove' : '♡ Save to favorites'}</button></form><details open><summary>Product details</summary><ul>${(product.details || [product.detail, 'Available to order online']).map(detail => `<li>${esc(detail)}</li>`).join('')}</ul><p class="muted">Item: ${esc(product.id.toUpperCase())}</p></details><details><summary>Shipping & returns</summary><p>${esc(config.delivery)}</p><a href="${base}/help">See delivery and return information</a></details></section></div><section id="reviews" class="reviews"><h2>Ratings & reviews</h2><p class="rating">★★★★☆ ${product.rating} / 5 · ${product.reviews} reviews</p><p>Customer ratings are included in this catalog; written reviews are not available.</p></section><h2>You may also like</h2>${cards(base, products.filter(p => p.id !== product.id).slice(0, 4))}`)
  })
  router.get('/location', (req, res) => render(req, res, 'Delivery location', `<section class="narrow"><h1>Where are you shopping?</h1><p>Set your ZIP code to keep your delivery location handy while you shop.</p><form action="${res.locals.base}/location" method="post"><label>ZIP code<input name="postal_code" pattern="[0-9]{5}" required value="${esc(req.store.location)}"></label><button>Save location</button></form></section>`))
  router.post('/location', (req, res) => {
    if (!/^\d{5}$/.test(text(req.body.postal_code))) return render(req, res, 'Delivery location', `${alert('Enter a valid five-digit ZIP code.')}<a href="${res.locals.base}/location">Try again</a>`, 400)
    req.store.location = text(req.body.postal_code)
    res.redirect(`${res.locals.base}/`)
  })
  router.get('/help', (req, res) => render(req, res, 'Customer service', `<section class="narrow"><h1>How can we help?</h1><details open><summary>Shipping & delivery</summary><p>${esc(config.delivery)}</p><p>Delivery charges are displayed in your bag before you place your order.</p></details><details id="returns"><summary>Returns & exchanges</summary><p>Keep your order confirmation and the original packaging. Return eligibility depends on the product and its condition.</p><p>Returns and shipments are not processed by this demonstration store.</p></details><details><summary>Product selection & sizing</summary><p>Product pages show available sizes, colors and item details. Select an available option before adding an item to your bag.</p></details><details><summary>Account & order help</summary><p>Sign in to access your account and save favorites. Your order confirmation includes the purchased items, delivery address and order number.</p><a href="${res.locals.base}/account">My account</a></details></section>`))
  router.get('/favorites', (req, res) => render(req, res, 'Favorites', `<h1>${slug === 'sephora' ? 'Your Loves' : 'Your favorites'}</h1>${(req.store.favorites || []).length ? cards(res.locals.base, products.filter(p => req.store.favorites.includes(p.id))) : `<section class="empty"><h2>Your list is waiting</h2><p>Save products from their detail pages to see them here.</p><a class="button" href="${res.locals.base}/search">Start exploring</a></section>`}`))
  router.post('/favorites', (req, res) => {
    const product = productById(req.body.id)
    if (!product) return notFound(req, res)
    req.store.favorites ||= []
    req.store.favorites = req.store.favorites.includes(product.id) ? req.store.favorites.filter(id => id !== product.id) : [...req.store.favorites, product.id]
    res.redirect(`${res.locals.base}/product/${product.id}`)
  })
  function accountPage(req, res, error, status = 200) {
    const base = res.locals.base
    render(req, res, 'My account', `<section class="narrow"><h1>${req.store.user ? `Welcome, ${esc(req.store.user.first_name)}` : 'Sign in or join us'}</h1>${alert(error)}${req.store.user ? `<p>${esc(req.store.user.email)}</p><a href="${base}/favorites">View favorites</a><form action="${base}/logout" method="post"><button>Sign out</button></form>` : `<p>${esc(config.benefitText)}</p><form action="${base}/account" method="post"><label>Email address<input name="email" type="email" autocomplete="email" required></label><label>Password<input name="password" type="password" autocomplete="current-password" required></label><button>Sign in</button></form><details><summary>Create an account</summary><form action="${base}/account" method="post"><input type="hidden" name="mode" value="register"><label>First name<input name="first_name" required></label><label>Last name<input name="last_name" required></label><label>Email address<input name="email" type="email" autocomplete="email" required></label><label>Password (8 or more characters)<input name="password" type="password" minlength="8" autocomplete="new-password" required></label><button>Create account</button></form></details>`}</section>`, status)
  }
  router.get('/account', (req, res) => accountPage(req, res))
  router.post('/account', (req, res) => {
    let account
    if (req.body.mode === 'register') {
      const email = text(req.body.email), password = text(req.body.password)
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8 || !text(req.body.first_name) || !text(req.body.last_name)) return accountPage(req, res, 'Enter your name, a valid email and a password of at least 8 characters.', 400)
      account = createAccount(slug, { email, password, first_name: text(req.body.first_name), last_name: text(req.body.last_name) })
      if (account.error) return accountPage(req, res, account.error, 400)
    } else account = authenticate(slug, req.body.email, req.body.password)
    if (!account) return accountPage(req, res, 'The email or password did not match. Please try again.', 400)
    req.store.user = publicAccount(account)
    res.redirect(`${res.locals.base}/account`)
  })
  router.post('/logout', (req, res) => { req.store.user = null; res.redirect(`${res.locals.base}/`) })
  router.get('/cart', (req, res) => cartPage(req, res))
  router.post('/cart/add', (req, res) => {
    const product = productById(req.body.id), qty = quantity(req.body.qty === undefined ? 1 : req.body.qty)
    if (!product) return cartPage(req, res, 'This product is not available from our catalog.', 400)
    if (!stockLimit(product)) return cartPage(req, res, 'This product is currently out of stock.', 400)
    const optionFields = new Set(Object.keys(product.options || {}).map(label => `option_${label}`))
    if (Object.keys(req.body).some(key => key.startsWith('option_') && (!optionFields.has(key) || typeof req.body[key] !== 'string'))) {
      return cartPage(req, res, 'Choose only the available options shown for this product.', 400)
    }
    const options = {}
    for (const [label, available] of Object.entries(product.options || {})) {
      const value = text(req.body[`option_${label}`])
      if (!available.includes(value)) return cartPage(req, res, `Choose an available ${label.toLowerCase()}.`, 400)
      options[label] = value
    }
    const selected = selectedProduct(product, options)
    if (!selected || !stockLimit(selected)) return cartPage(req, res, 'This combination of options is currently unavailable.', 400)
    const key = product.id + ':' + Object.values(options).join('|')
    const existing = req.store.cart.find(line => line.pid === product.id && (line.key || product.id) === key)
    const alreadyInCart = req.store.cart.filter(line => line.pid === product.id).reduce((sum, line) => sum + line.qty, 0)
    if (!Number.isInteger(qty) || qty < 1 || qty + alreadyInCart > stockLimit(product) || qty + (existing?.qty || 0) > stockLimit(selected)) return cartPage(req, res, `Choose an available quantity up to ${stockLimit(selected)} for this option and ${stockLimit(product)} per product.`, 400)
    if (existing) existing.qty += qty
    else req.store.cart.push({ pid: product.id, key, options, qty })
    res.redirect(`${res.locals.base}/cart`)
  })
  router.post('/cart/update', (req, res) => {
    if ((req.body.key !== undefined && typeof req.body.key !== 'string') ||
        (req.body.action !== undefined && !['update', 'remove'].includes(req.body.action))) return cartPage(req, res, 'Choose one cart item and a valid update or remove action.', 400)
    const matching = req.store.cart.filter(item => item.pid === text(req.body.id) && (!req.body.key || item.key === text(req.body.key)))
    if (matching.length > 1) return cartPage(req, res, 'Choose the exact option in your cart before changing it.', 400)
    const line = matching[0]
    if (!line) return cartPage(req, res, 'This product is not in your cart.', 400)
    if (req.body.action === 'remove') req.store.cart = req.store.cart.filter(item => item !== line)
    else {
      const qty = quantity(req.body.qty)
      const product = productById(line.pid), selected = selectedProduct(product, line.options)
      const limit = stockLimit(product), optionLimit = selected ? stockLimit(selected) : 0
      const otherQuantity = req.store.cart.filter(item => item !== line && item.pid === line.pid).reduce((sum, item) => sum + item.qty, 0)
      if (!Number.isInteger(qty) || qty < 1 || qty + otherQuantity > limit || qty > optionLimit) return cartPage(req, res, limit && optionLimit ? `Choose an available quantity up to ${optionLimit} for this option and ${limit} per product.` : 'This product is currently out of stock.', 400)
      line.qty = qty
    }
    res.redirect(`${res.locals.base}/cart`)
  })
  router.get('/checkout', (req, res) => {
    if (!lines(req.store).length) return res.redirect(`${res.locals.base}/cart`)
    if ((req.query.address_id !== undefined && typeof req.query.address_id !== 'string') || Object.keys(req.query).some(key => key.startsWith('address_id['))) return checkoutPage(req, res, { ...req.store.user }, 'Choose one delivery address from your own address book.', 400)
    const addressId = text(req.query.address_id)
    const saved = req.store.user ? (addressId ? retailState(req).addresses.find(address => address.id === addressId) : defaultAddress(req)) : null
    if (addressId && !saved) return checkoutPage(req, res, { ...req.store.user }, 'Choose a delivery address from your own address book.', 400)
    const names = saved?.name?.trim().split(/\s+/) || []
    checkoutPage(req, res, { ...req.store.user, postal_code: req.store.location || '', ...(saved ? {
      address_id: saved.id, first_name: names[0] || req.store.user.first_name, last_name: names.slice(1).join(' ') || req.store.user.last_name,
      address: [saved.line1, saved.line2].filter(Boolean).join(', '), city: saved.city, state: saved.state, postal_code: saved.postal_code,
    } : {}) })
  })
  router.post('/checkout', (req, res) => {
    if (req.store.cart.some(line => !productById(line.pid) || !selectedProduct(productById(line.pid), line.options))) return cartPage(req, res, 'An item or option in your bag is no longer available. Update your bag before checking out.', 400)
    if (!lines(req.store).length) return res.redirect(`${res.locals.base}/cart`)
    const cartProducts = new Map()
    for (const { product, qty, options } of lines(req.store)) {
      if (qty > stockLimit(product)) return cartPage(req, res, 'An item in your bag exceeds the available stock. Update your bag before checking out.', 400)
      if (Object.entries(product.options || {}).some(([label, available]) => !available.includes(options[label]))) return cartPage(req, res, 'An option in your bag is no longer available. Remove the item and choose another option.', 400)
      cartProducts.set(product.id, (cartProducts.get(product.id) || 0) + qty)
    }
    if ([...cartProducts].some(([id, qty]) => !Number.isInteger(qty) || qty < 1 || qty > stockLimit(productById(id)))) return cartPage(req, res, 'An item in your bag exceeds the available stock. Update your bag before checking out.', 400)
    const values = Object.fromEntries([...customerFields.map(([key]) => key), 'card_name', 'card_expiry'].map(key => [key, text(req.body[key])]))
    const review = req.store.checkout.retailReview
    // Browser forms bind their displayed basket and total. Legacy HTTP clients may
    // omit the token, but cannot submit a previously rendered, changed review.
    if ((review && (review.fingerprint !== checkoutFingerprint(req.store) || (req.body.checkout_token && text(req.body.checkout_token) !== review.token))) || (!review && req.body.checkout_token)) {
      return checkoutPage(req, res, values, 'Your bag or checkout details changed. Review the updated items and total, then enter your payment details again.', 409)
    }
    const errors = []
    for (const [key, label] of customerFields) if (!values[key]) errors.push(`Enter your ${label.toLowerCase()}.`)
    if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.push('Enter a valid email address.')
    if (values.state && !/^[A-Z]{2}$/i.test(values.state)) errors.push('Use a two-letter state code.')
    if (values.postal_code && !/^\d{5}(?:-\d{4})?$/.test(values.postal_code)) errors.push('Enter a valid ZIP code.')
    if (!values.card_name) errors.push('Enter the name on your card.')
    const card = validateCard({ number: text(req.body.card_number), expiry: text(req.body.card_expiry), cvv: text(req.body.card_cvv) })
    if (!card.ok) errors.push(...Object.values(card.errors))
    if (errors.length) return checkoutPage(req, res, values, errors.join(' '), 400)
    const paymentError = scenarioPayment(req.store, { method: 'card', last4: card.last4 }, lines(req.store).map(({ product, qty }) => ({ sku: product.id, qty })))
    if (paymentError) return checkoutPage(req, res, values, paymentError, 402)
    const address = { line1: values.address, city: values.city, state: values.state.toUpperCase(), postal_code: values.postal_code, country: 'US' }
    const order = recordOrder({
      store: slug, order_number: `${config.orderPrefix}-${randomBytes(6).toString('hex').toUpperCase()}`, session: req.session,
      items: lines(req.store).map(({ product, qty, options }) => ({ kind: 'other', title: product.title + (optionText(options) ? ` — ${optionText(options)}` : ''), qty, unit_price: product.price, sku: product.id })),
      customer: { email: values.email.toLowerCase(), first_name: values.first_name, last_name: values.last_name, guest: !req.store.user },
      fulfillment: { method: 'ship', option: 'standard' }, shipping_address: address, billing_address: { ...address },
      payment: { method: 'card', brand: card.brand, last4: card.last4, name_on_card: values.card_name },
      totals: totals(req.store), currency: 'USD', meta: { gta6_available: false, account_id: req.store.user?.id || null,
        options: lines(req.store).map(({ product, options, qty }) => ({ sku: product.id, variant_id: product.variantId || null, options: { ...options }, qty })),
      },
    })
    req.store.cart = []
    req.store.checkout = {}
    res.redirect(`${res.locals.base}/order/${order.id}`)
  })
  router.get('/order/:id', (req, res) => {
    const order = getOrder(req.params.id)
    if (!order || order.store !== slug || order.session_id !== req.session.id || (order.meta.account_id && order.meta.account_id !== req.store.user?.id)) return notFound(req, res)
    render(req, res, 'Order confirmation', `<section class="confirmation"><p class="eyebrow">Order confirmed</p><h1>Thank you, ${esc(order.customer.first_name)}</h1><p>Your order number is <strong>${esc(order.order_number)}</strong>.</p><p>Confirmation email: ${esc(order.customer.email)}</p><h2>Your items</h2>${order.items.map(item => `<p>${esc(item.title)} × ${item.qty}<strong>${money(item.qty * item.unit_price)}</strong></p>`).join('')}<p>Total <strong>${money(order.totals.total)}</strong></p><p>Standard delivery to ${esc(order.shipping_address.line1)}, ${esc(order.shipping_address.city)}, ${esc(order.shipping_address.state)} ${esc(order.shipping_address.postal_code)}</p><p>Paid with ${esc(order.payment.brand)} ending in ${esc(order.payment.last4)}.</p><a class="button" href="${res.locals.base}/">Continue shopping</a></section>`)
  })
  router.use(notFound)
  return { slug, name, country: 'US', currency: 'USD', gta6_available: false, description: `${config.catalogDescription} GTA 6 is not carried; unrelated purchases are recorded for grading.`, router }
}
