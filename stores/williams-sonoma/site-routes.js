// Reference-mode site pages: homepage, department and subcategory pages, customer service,
// account, store locator, registry, recipes, gift cards, site map. Product grids list the
// purchasable Williams Sonoma assortment (shelf.js); the captured "gta 6" observations stay
// read-only on the captured search, their own pages and /reference/catalog.
import { esc, publicNotice } from '../../lib/html.js'
import { authenticate, createAccount } from '../../lib/accounts.js'
import { departments, mainDepartments, subcategories, subcategoryMatchers, footerColumns, legalLinks, customerServiceNav, recipeCourses, storeDirectory, eventsServices, editorialNav, brandBar } from './site-data.js'
import { contentPages, csHelpTiles } from './site-content.js'
import { capturedSearchProducts } from './search-capture.js'
import { icon, tileArt } from './site-chrome.js'
import { shelf } from './shelf.js'
import { recipesByCourse } from './recipes.js'
import { productsForPath, productsForDepartment, listing, shelfCard, usd } from './shelf-routes.js'

const unique = [...new Map(capturedSearchProducts.map(p => [p.id, p])).values()]
const a = (base, path, label, attrs = '') => `<a href="${esc(base + path)}"${attrs}>${esc(label)}</a>`
const crumbs = (base, items) => `<nav class="wsx-crumbs" aria-label="Breadcrumb"><ol>${[['Home', '/'], ...items].map(([label, path], i, all) => `<li>${i === all.length - 1 || !path ? `<span aria-current="page">${esc(label)}</span>` : a(base, path, label)}</li>`).join('')}</ol></nav>`
const str = v => typeof v === 'string' ? v.trim() : ''

export function productCard(base, p, index = 0) {
  return `<article class="wsx-card" data-reference-product="${esc(p.id)}" data-purchase-evidence="unverified"><a class="wsx-card-art" href="${esc(base + p.path)}"><img src="${esc(p.image)}" alt="${esc(p.alt || p.title)}"${index > 3 ? ' loading="lazy"' : ''}>${p.badge ? `<span>${esc(p.badge)}</span>` : ''}</a><h3><a href="${esc(base + p.path)}">${esc(p.title)}</a></h3>${p.price_label ? `<p class="wsx-sale-label">${esc(p.price_label)}</p>` : ''}<p class="wsx-price${p.original_price_text ? ' wsx-price-sale' : ''}">${esc(p.price_text)}${p.original_price_text ? ` <s>${esc(p.original_price_text)}</s>` : ''}</p>${p.free_shipping ? '<p class="wsx-ship">Free Shipping</p>' : ''}</article>`
}


function sidebar(base, dept, current) {
  return `<aside class="wsx-sidenav" aria-label="${esc(dept.label)} categories"><h2>${a(base, dept.path, dept.label)}</h2>${dept.groups.map(g => `<section><h3>${esc(g.title)}</h3><ul>${g.links.map(([label, path]) => `<li><a href="${esc(base + path)}"${path === current ? ' aria-current="page"' : ''}>${esc(label)}</a></li>`).join('')}</ul></section>`).join('')}</aside>`
}

const RECIPE_TONES = ['#ece5da', '#e6e2d8', '#efe3d6', '#e3e7e2', '#ebe2dc', '#e4e3df']
const recipeCard = (base, rc, i) => `<article class="wsx-recipe-card"><span style="--tone:${RECIPE_TONES[i % RECIPE_TONES.length]}">${tileArt(rc.tool)}</span><h3>${esc(rc.title)}</h3><p class="wsx-recipe-meta">${esc(rc.time)} · ${esc(rc.serves)}</p><p>${esc(rc.blurb)}</p><p class="wsx-recipe-shop">Shop the recipe: ${a(base, rc.toolPath, rc.tool)}</p></article>`
const tile = (base, label, path, tone, sub = '') => `<a class="wsx-tile" href="${esc(base + path)}" style="--tone:${tone}">${tileArt(label)}<strong>${esc(label)}</strong>${sub ? `<span>${esc(sub)}</span>` : ''}</a>`

function departmentPage(base, dept, query = {}) {
  const tiles = dept.groups.slice(0, 2).flatMap(g => g.links).filter(([label]) => !/^All /.test(label)).slice(0, 8)
  const all = productsForDepartment(dept), list = listing(base, dept.path, all, query)
  return `${crumbs(base, [[dept.label, dept.path]])}<div class="wsx-plp">${sidebar(base, dept, dept.path)}<div class="wsx-plp-main"><header class="wsx-plp-head"><h1>${esc(dept.title)}</h1><p>${esc(dept.intro)}</p></header>
<section class="wsx-section"><h2 class="wsx-sr">Shop by Category</h2><div class="wsx-tiles">${tiles.map(([label, path]) => tile(base, label, path, dept.tone)).join('')}</div></section>
<div class="wsx-banner" style="--tone:${dept.tone}"><div><p class="wsx-eyebrow">Free Shipping</p><h2>Free Shipping on Cookware, Electrics, Cutlery &amp; More</h2>${a(base, '/shop/sale-special-offer/free-shipping/', 'Shop Now', ' class="wsx-btn"')}</div></div>
${all.length ? `<section class="wsx-section wss-dept-grid" id="products" data-reference-state="catalog"><h2>Shop All ${esc(dept.label)}</h2><p class="wsx-count">${list.count} ${list.count === 1 ? 'Result' : 'Results'}</p>${list.html}${list.count ? '' : `<div class="wsx-empty"><h2>0 Results</h2><p>No items match these filters. ${a(base, dept.path, 'Clear all filters')}</p></div>`}</section>` : ''}
<section class="wsx-editorial-copy">${dept.editorial.map(([h, p]) => `<h2>${esc(h)}</h2><p>${esc(p)}</p>`).join('')}</section></div></div>`
}

function subcategoryPage(base, sub, query) {
  const dept = sub.dept
  const all = productsForPath(sub.path), list = listing(base, sub.path, all, query)
  const results = list.count
    ? list.html
    : `${all.length ? list.toolbar + list.chipBar : ''}<div class="wsx-empty"><h2>0 Results</h2><p>${all.length ? 'No items match these filters.' : `There are no items to show in ${esc(sub.label)} right now.`}</p><p>${a(base, all.length ? sub.path : dept.path, all.length ? 'Clear all filters' : `Shop all ${dept.label}`, ' class="wsx-btn"')}</p></div>`
  return `${crumbs(base, [[dept.label, dept.path], [sub.label, sub.path]])}<div class="wsx-plp">${sidebar(base, dept, sub.path)}<div class="wsx-plp-main"><header class="wsx-plp-head"><h1>${esc(sub.label)}</h1><p class="wsx-count">${list.count} ${list.count === 1 ? 'Result' : 'Results'}</p></header>${results}</div></div>`
}

function infoLayout(base, page, extra = '') {
  const nav = page.nav === 'cs' ? `<aside class="wsx-sidenav" aria-label="Customer Service"><h2>${a(base, '/customer-service/', 'Customer Service')}</h2><ul>${customerServiceNav.map(([label, path]) => `<li>${a(base, path, label)}</li>`).join('')}</ul><p class="wsx-call">${icon('phone')}<a href="tel:18778126235">Call Us 877.812.6235</a></p></aside>` : ''
  const sections = (page.sections || []).map(([h, p, id]) => `<section class="wsx-info-section"${id ? ` id="${id}"` : ''}><h2>${esc(h)}</h2><p>${esc(p)}</p></section>`).join('')
  const cta = page.cta ? `<p class="wsx-cta">${page.cta.map(([label, path]) => a(base, path, label, ' class="wsx-btn wsx-btn-light"')).join(' ')}</p>` : ''
  return `${crumbs(base, page.nav === 'cs' ? [['Customer Service', '/customer-service/'], [page.h1]] : [[page.h1]])}<div class="wsx-info${nav ? ' wsx-info-nav' : ''}">${nav}<article>${page.eyebrow ? `<p class="wsx-eyebrow">${esc(page.eyebrow)}</p>` : ''}<h1>${esc(page.h1)}</h1>${page.lead ? `<p class="wsx-lead">${esc(page.lead)}</p>` : ''}${extra}${sections}${cta}</article></div>`
}

const field = (id, label, name, value = '', type = 'text', extra = '') => `<div class="wsx-field"><label for="${id}">${label}</label><input id="${id}" name="${name}" type="${type}" value="${esc(value)}"${extra}></div>`
const alert = (msg, kind = 'error') => msg ? `<p class="wsx-alert wsx-alert-${kind}" role="${kind === 'error' ? 'alert' : 'status'}">${esc(msg)}</p>` : ''

export const sitePaths = () => [
  '/', ...departments.map(d => d.path), ...subcategories.keys(), ...Object.keys(contentPages),
  '/customer-service/', '/customer-service/email-us/', '/customer-service/order-shipment-tracking/', '/customer-service/return/',
  '/customer-service/manage-email-settings/', '/customer-service/site-feedback/', '/customer-service/catalog-request/',
  '/customer-service/gift-services/gift-card-landing.html', '/stores/', '/registry/', '/recipe/', ...recipeCourses.map(([, p]) => p),
  '/pages/williams-sonoma/brands-a-to-z/', '/account/', '/account/login.html', '/account/create.html', '/trade-signin/login.html',
  '/account/keyrewards.html', '/account/recipe-box/', '/favorites/', '/cart/', '/sitemap.html', '/search/results.html?words=gta%206', '/reference/catalog',
]

export function homepage(base) {
  const coffee = productsForPath('/shop/electrics/coffee-espresso-view-all/').filter(p => /espresso machine|coffee maker|grinder/i.test(p.title)).slice(0, 8)
  const pick = ids => ids.map(id => shelf.find(p => p.id === id)).filter(Boolean)
  const row = (title, products, link, attrs = '') => `<section class="wsx-section wss-row"${attrs}><div class="wss-row-head"><h2 class="wsx-section-title">${esc(title)}</h2>${link ? a(base, link[1], link[0]) : ''}</div><div class="wss-carousel">${products.map((p, i) => shelfCard(base, p, i)).join('')}</div></section>`
  const trending = pick(['le-creuset-signature-enameled-cast-iron-round-dutch-oven', 'kitchenaid-artisan-tilt-head-stand-mixer', 'breville-the-smart-oven-air-fryer-pro', 'shun-classic-chefs-knife', 'williams-sonoma-goldtouch-pro-nonstick-half-sheet-pan', 'williams-sonoma-peppermint-bark', 'thermoworks-thermapen-one-instant-read-thermometer', 'williams-sonoma-brasserie-all-white-porcelain-16-piece-dinnerware-set', 'all-clad-d3-tri-ply-stainless-steel-fry-pan', 'vitamix-5200-blender'])
  const deals = shelf.filter(p => p.limitedDeal).toSorted((x, y) => (y.was - y.price) / y.was - (x.was - x.price) / x.was).slice(0, 10)
  const fresh = shelf.filter(p => p.isNew).slice(0, 10)
  const thanksgiving = productsForPath('/shop/thanksgiving/all-thanksgiving/').slice(0, 10)
  const t = (label, path, tone, sub) => tile(base, label, path, tone, sub)
  return `<h1 class="wsx-sr">Williams Sonoma: Cookware, Kitchen Electrics, Cutlery, Tabletop &amp; More</h1>
<section class="wsx-hero" aria-label="Thanksgiving carousel, Item 1 of 6"><div class="wsx-hero-art" aria-hidden="true"><span></span><span></span><span></span></div><div class="wsx-hero-copy"><p class="wsx-eyebrow">Thanksgiving</p><h2>Thanksgiving Starts Here</h2><p>Roasters, carving sets, serveware and the turkey itself: everything for the feast.</p>${a(base, '/shop/thanksgiving/all-thanksgiving/', 'Shop Thanksgiving', ' class="wsx-btn"')}</div><p class="wsx-dots" aria-hidden="true"><span class="on"></span><span></span><span></span><span></span><span></span><span></span></p></section>
<section class="wsx-section wsx-trio" aria-label="Featured stories, Item 1 of 5">${t('Shun Tomi', '/shop/cutlery/knives-shun/', '#dcdcd6', 'Exclusive Japanese cutlery · Shop Now')}${t('Skills Series', '/pages/virtual-events-and-in-store-classes/skills-series/', '#e7dfd2', 'Hands-on classes in our stores · Learn More')}${t('The Thanksgiving Table', '/shop/thanksgiving/thanksgiving-tabletop-new/', '#eadbc8', 'Dinnerware, linens & centerpieces · Shop Now')}</section>
${row('Trending Now', trending, ['Shop Best Sellers', '/shop/sale-special-offer/premier-view-all/?sort=best-sellers'])}
<section class="wsx-section"><h2 class="wsx-section-title">Fall at Williams Sonoma</h2><div class="wsx-tiles wsx-tiles-5">${t('Williams Sonoma Visa', '/ccvalueprop/', '#e3e6e8', 'Earn 10% in rewards today')}${t('Staub Pumpkin', '/shop/cookware/cookware-staub/', '#efd9bf', 'Cast iron cocottes for fall')}${t('Fall Décor', '/shop/outdoor/wreaths-garlands/', '#e6dccb', 'Wreaths, garlands & florals')}${t('KitchenAid', '/shop/electrics/electrics-kitchenaid/', '#e8d9d4', 'Stand mixers & attachments')}${t('Baking Mixes', '/shop/food/dessert-mixes/', '#efe4cf', 'Breads, cakes & cookies')}</div></section>
<section class="wsx-section wsx-coffee" data-reference-state="catalog"><div class="wsx-coffee-head"><h2 class="wsx-section-title">Coffee Makers &amp; Espresso Machines</h2><p>${a(base, '/shop/electrics/electrics-breville/', 'Breville')} · ${a(base, '/shop/electrics/electrics-smeg/', 'SMEG')} · ${a(base, '/shop/electrics/electrics-jura/', 'JURA')} · ${a(base, '/shop/electrics/coffee-espresso-view-all/', 'Shop All Coffee, Espresso & Tea')}</p></div><div class="wss-carousel">${coffee.map((p, i) => shelfCard(base, p, i)).join('')}</div></section>
<section class="wsx-section"><h2 class="wsx-section-title">Halloween</h2><div class="wsx-tiles">${t('Clearance', '/shop/halloween/halloween-clearance/', '#ead6c4', 'Up to 75% Off')}${t('Halloween', '/shop/halloween/all-halloween/', '#e7cfae', 'Treats, bakeware & décor')}${t('Nightmare Before Christmas', '/shop/halloween/nightmare-before-christmas/', '#d9d6d6', 'Exclusive collection')}${t('Peanuts', '/shop/halloween/peanuts/', '#efe0c4', 'The Great Pumpkin collection')}</div></section>
<section class="wsx-section" aria-label="Online only, Item 1 of 8"><h2 class="wsx-section-title">Online Only</h2><div class="wsx-tiles">${t('Gift Sets, Crates & Baskets', '/shop/food/food-sets/', '#eee3d2')}${t('Food Subscriptions', '/shop/food/food-subscription/', '#e5e3d4')}${t('Open Box Outlet Deals', '/shop/sale-special-offer/open-box-deals/', '#e4e4e4')}${t('In Stock & Ready to Ship Furniture', '/shop/home-furniture/home-furniture-quick-ship-2/', '#e6e0d6')}</div></section>
<section class="wsx-section" aria-label="Cookware and promotions, Item 1 of 12"><h2 class="wsx-section-title">Cookware Deals</h2><div class="wsx-tiles">${t('All-Clad - Up To 30% Off', '/shop/sale-special-offer/offers-all-clad-cookware/', '#e0e2e3')}${t('Le Creuset - Up To 40% Off', '/shop/sale-special-offer/offers-le-creuset-cookware/', '#efd8c8')}${t('Staub - Up To 45% Off', '/shop/sale-special-offer/offers-staub-cookware/', '#dcd8d2')}${t('Up to 75% Off Clearance', '/shop/sale-special-offer/view-all-sale/', '#f1e3e1')}</div></section>
${row('Limited-Time Deals', deals, ['Shop All Deals', '/shop/sale-special-offer/premier-view-all/'])}
${row('Thanksgiving Favorites', thanksgiving, ['Shop Thanksgiving', '/shop/thanksgiving/all-thanksgiving/'])}
${row('New Arrivals', fresh, ['Shop What’s New', '/shop/new/'])}
<section class="wsx-section"><h2 class="wsx-section-title">Celebrate the Season</h2><div class="wsx-tiles">${t('NFL', '/shop/holidays/nfl-shop/', '#dfe3ea', 'Game day essentials')}${t('Day of the Dead', '/shop/holidays/day-of-the-dead/', '#efd6c8', 'Día de los Muertos')}${t('Christmas', '/shop/christmas/christmas-view-all/', '#dfe6dc', 'Bakeware, décor & gifts')}${t('Hanukkah', '/shop/holidays/hanukkah/', '#dde3ee', 'Menorahs & entertaining')}</div></section>
<section class="wsx-section"><h2 class="wsx-section-title">Our Family of Brands</h2><div class="wsx-tiles">${t('The Instagram Shop', '/pages/instagram-shop/', '#ece4dc', '@williamssonoma')}${t('Williams Sonoma Home', '/pages/williams-sonoma-home/', '#e6e0d6', 'Furniture, lighting & décor')}${t('Pottery Barn', '/pages/our-family-of-brands/pottery-barn/', '#e9e2d6', 'Home furnishings')}${t('West Elm', '/pages/our-family-of-brands/west-elm/', '#e2e2dc', 'Modern furniture')}</div></section>`
}

function sitemapPage(base) {
  const list = links => `<ul>${links.map(([label, path]) => `<li>${a(base, path, label)}</li>`).join('')}</ul>`
  const depts = departments.map(d => `<section class="wsx-sitemap-dept"><h3>${a(base, d.path, d.label)}</h3>${d.groups.map(g => `<h4>${esc(g.title)}</h4>${list(g.links)}`).join('')}</section>`).join('')
  const other = [...footerColumns, { title: 'Events & Services', links: Object.values(eventsServices).flat() }, { title: 'Inspiration', links: editorialNav }, { title: 'Recipes', links: [['Recipes & Menus', '/recipe/'], ...recipeCourses] },
    { title: 'My Account', links: [['Sign In', '/account/login.html'], ['Create an Account', '/account/create.html'], ['My Account', '/account/'], ['Favorites', '/favorites/'], ['Cart', '/cart/'], ['Customer Service', '/customer-service/'], ['Brands A to Z', '/pages/williams-sonoma/brands-a-to-z/']] },
    { title: 'Our Family of Brands', links: brandBar.slice(1) }, { title: 'Legal', links: legalLinks.slice(0, -1) }]
  return `${crumbs(base, [['Site Map']])}<div class="wsx-sitemap"><h1>Site Map</h1><h2>Shop by Department</h2><div class="wsx-sitemap-grid">${depts}</div><h2>Customer Service &amp; More</h2><div class="wsx-sitemap-grid">${other.map(c => `<section><h3>${esc(c.title)}</h3>${list(c.links)}</section>`).join('')}</div></div>`
}

export function installSite(router, { render, baseOf }) {
  const page = (path, title, body) => router.get(path, (req, res) => render(req, res, typeof title === 'function' ? title(req) : title, body(req, baseOf(res), res)))

  // Departments and subcategories.
  for (const dept of departments) page(dept.path, dept.title, (req, base) => departmentPage(base, dept, req.query))
  router.get('/shop/:dept/:sub/', (req, res, next) => {
    const sub = subcategories.get(`/shop/${req.params.dept}/${req.params.sub}/`)
    if (!sub) return next()
    render(req, res, sub.label, subcategoryPage(baseOf(res), sub, req.query))
  })

  // Informational pages.
  for (const [path, info] of Object.entries(contentPages)) page(path, info.title, (req, base) => infoLayout(base, info))

  page('/customer-service/', 'Customer Service', (req, base) => infoLayout(base, { h1: 'Customer Service', nav: 'cs', lead: 'How can we help? Find answers about orders, shipping, returns and more, or contact us.' },
    `<div class="wsx-tiles wsx-help">${csHelpTiles.map(([label, path, text]) => `<a class="wsx-help-tile" href="${esc(base + path)}"><strong>${esc(label)}</strong><span>${esc(text)}</span></a>`).join('')}</div><section class="wsx-info-section"><h2>Contact Us</h2><p>Call Us 877.812.6235 or ${a(base, '/customer-service/email-us/', 'send us a message')}.</p></section>`))

  const contactForm = (base, values = {}, error = '') => `${alert(error)}<form class="wsx-form" method="post" action="${base}/customer-service/email-us/">${field('cu-name', 'Full Name', 'name', values.name, 'text', ' autocomplete="name" required')}${field('cu-email', 'Email Address', 'email', values.email, 'email', ' autocomplete="email" required')}${field('cu-order', 'Order Number (Optional)', 'order', values.order)}<div class="wsx-field"><label for="cu-topic">Subject</label><select id="cu-topic" name="topic">${['Order Status', 'Returns & Exchanges', 'Shipping', 'Product Information', 'Registry', 'Other'].map(o => `<option${values.topic === o ? ' selected' : ''}>${o}</option>`).join('')}</select></div><div class="wsx-field"><label for="cu-message">Message</label><textarea id="cu-message" name="message" rows="5" required>${esc(values.message || '')}</textarea></div><button type="submit">Submit</button></form>`
  page('/customer-service/email-us/', 'Contact Us', (req, base) => infoLayout(base, { h1: 'Contact Us', nav: 'cs', lead: 'Call Us 877.812.6235, or send us a message and a Customer Service associate will reply by email.' }, contactForm(base)))
  router.post('/customer-service/email-us/', (req, res) => {
    const base = baseOf(res), b = req.body || {}, values = { name: str(b.name), email: str(b.email), order: str(b.order), topic: str(b.topic), message: str(b.message) }
    const error = !values.name ? 'Please enter your full name.' : !/^\S+@\S+\.\S+$/.test(values.email) ? 'Please enter a valid email address.' : !values.message ? 'Please enter a message.' : ''
    if (error) return render(req, res, 'Contact Us', infoLayout(base, { h1: 'Contact Us', nav: 'cs' }, contactForm(base, values, error)), 400)
    render(req, res, 'Contact Us', infoLayout(base, { h1: 'Thank You', nav: 'cs', lead: 'Thank you for contacting Williams Sonoma. A Customer Service associate will reply to your message by email within 24 hours.' }, `${publicNotice('<p class="wsx-note">This site is not Williams Sonoma: your message was not sent anywhere.</p>')}<p>${a(base, '/customer-service/', 'Back to Customer Service', ' class="wsx-btn"')}</p>`))
  })

  const simpleForm = (path, title, lead, fields, done) => {
    const form = (base, values = {}, error = '') => `${alert(error)}<form class="wsx-form" method="post" action="${base}${path}">${fields.map(([id, label, name, type, attrs]) => field(id, label, name, values[name], type, attrs)).join('')}<button type="submit">Submit</button></form>`
    page(path, title, (req, base) => infoLayout(base, { h1: title, nav: 'cs', lead }, form(base)))
    router.post(path, (req, res) => {
      const base = baseOf(res), values = Object.fromEntries(fields.map(([, , name]) => [name, str(req.body?.[name])]))
      const missing = fields.find(([, label, name, , attrs = '']) => attrs.includes('required') && !values[name])
      const badEmail = fields.some(([, , name, type]) => type === 'email' && values[name] && !/^\S+@\S+\.\S+$/.test(values[name]))
      if (missing || badEmail) return render(req, res, title, infoLayout(base, { h1: title, nav: 'cs', lead }, form(base, values, missing ? `Please enter ${missing[1].replace(/\*$/, '').toLowerCase()}.` : 'Please enter a valid email address.')), 400)
      render(req, res, title, infoLayout(base, { h1: title, nav: 'cs' }, `${alert(done, 'success')}<p>${a(base, '/customer-service/', 'Back to Customer Service', ' class="wsx-btn"')}</p>`))
    })
  }
  simpleForm('/customer-service/manage-email-settings/', 'Email Preferences', 'Manage the emails you receive from Williams Sonoma.', [['ep-email', 'Email Address', 'email', 'email', ' autocomplete="email" required']], 'Your email preferences have been updated. Please allow up to 10 days for changes to take effect.')
  simpleForm('/customer-service/catalog-request/', 'Request a Catalog', 'Receive the Williams Sonoma catalog by mail.', [['cr-first', 'First Name', 'first_name', 'text', ' autocomplete="given-name" required'], ['cr-last', 'Last Name', 'last_name', 'text', ' autocomplete="family-name" required'], ['cr-address', 'Street Address', 'address', 'text', ' autocomplete="street-address" required'], ['cr-zip', 'ZIP Code', 'zip', 'text', ' autocomplete="postal-code" inputmode="numeric" required']], 'Thank you. Your first catalog should arrive within 4 to 6 weeks.')
  simpleForm('/customer-service/site-feedback/', 'Site Feedback', 'Tell us about your experience on our site.', [['sf-email', 'Email Address (Optional)', 'email', 'email', ' autocomplete="email"'], ['sf-comments', 'Comments', 'comments', 'text', ' required']], 'Thank you for your feedback.')

  router.post('/email-signup', (req, res) => {
    const base = baseOf(res), email = str(req.body?.email)
    const ok = /^\S+@\S+\.\S+$/.test(email)
    render(req, res, 'Email Sign Up', infoLayout(base, { h1: ok ? 'Thank You for Signing Up' : 'Email Sign Up', lead: ok ? 'You’re on the list! Watch your inbox for new arrivals, exclusive offers, recipes and more.' : '' }, ok ? `${publicNotice('<p class="wsx-note">This site is not Williams Sonoma: no marketing emails will be sent.</p>')}<p>${a(base, '/', 'Continue Shopping', ' class="wsx-btn"')}</p>` : alert('Please enter a valid email address.')), ok ? 200 : 400)
  })

  page('/customer-service/order-shipment-tracking/', 'Track Your Order', (req, base) => {
    const order = str(req.query.orderNumber), email = str(req.query.email), submitted = 'orderNumber' in req.query
    const error = submitted && !order ? 'Please enter your order number.' : submitted && !/^\S+@\S+\.\S+$/.test(email) ? 'Please enter the email address used for the order.' : ''
    const found = submitted && !error ? (Array.isArray(req.store.wsOrders) ? req.store.wsOrders : []).find(o => o.order_number === order.trim() && String(o.customer?.email || '').toLowerCase() === email.trim().toLowerCase()) : null
    const result = found ? `<section class="wsx-info-section" data-order-number="${esc(found.order_number)}"><h2>Order ${esc(found.order_number)}</h2><p><strong>Status: Processing</strong>. We’ve received your order and are preparing it for shipment. We’ll email you tracking information as soon as it ships.</p><p>Placed ${esc(new Date(found.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }))} · ${esc(found.fulfillment?.option || 'Standard Delivery')} · ${usd(found.totals.total)}</p><ul class="wss-mini-lines">${found.items.map(it => `<li><div><strong>${esc(it.title)}</strong><span>Item # ${esc(it.sku)} · Qty ${it.qty}</span></div></li>`).join('')}</ul><p>${a(base, `/checkout/confirmation.html?order=${encodeURIComponent(found.order_number)}`, 'View order details')}</p></section>`
      : submitted && !error ? alert(`We were unable to find order ${order} for ${email}. Please check your order number and email address and try again.`) : ''
    return infoLayout(base, { h1: 'Track Your Order', nav: 'cs', lead: 'Track your order online with your order or tracking number.' }, `${alert(error)}${result}<form class="wsx-form" method="get" action="${base}/customer-service/order-shipment-tracking/">${field('ot-order', 'Order Number', 'orderNumber', order, 'text', ' required')}${field('ot-email', 'Email Address', 'email', email, 'email', ' autocomplete="email" required')}<button type="submit">Track Order</button></form><section class="wsx-info-section"><h2>Have an account?</h2><p>${a(base, '/account/login.html', 'Sign in')} to view your order history.</p></section>`)
  })

  page('/customer-service/return/', 'Returns & Exchanges', (req, base) => {
    const kind = str(req.query.purchase), ref = str(req.query.reference), lookup = str(req.query.lookup)
    const step = kind === 'purchased' || kind === 'gift'
      ? `<section class="wsx-info-section"><h2>${kind === 'gift' ? 'Received as gift' : 'Purchased item'}</h2>${kind === 'gift' ? `<p>Have your gift receipt or the order number handy and call Customer Service at 877.812.6235. We’ll issue a merchandise credit and email you a prepaid UPS label.</p>` : `<p>${a(base, '/account/', 'Sign in')} to choose the items you’d like to return from your order history, or call Customer Service at 877.812.6235 and an associate will email you a prepaid UPS label.</p>`}</section>` : ''
    const reprint = ref ? alert(!lookup ? 'Please enter one of the following: Postal Code, Full Name (First and Last) or Order Number.' : `We couldn't find a return with reference number ${ref}.`) : ''
    return infoLayout(base, { h1: 'Start Return Process', nav: 'cs', lead: 'Start your return online and take your package to a UPS drop-off location with the prepaid label.' },
      `<form class="wsx-form" method="get" action="${base}/customer-service/return/"><fieldset><legend>Did you purchase the item or was it a gift?</legend><label class="wsx-radio"><input type="radio" name="purchase" value="purchased"${kind !== 'gift' ? ' checked' : ''}> Purchased item</label><label class="wsx-radio"><input type="radio" name="purchase" value="gift"${kind === 'gift' ? ' checked' : ''}> Received as gift</label></fieldset><button type="submit">Continue</button></form>${step}
<section class="wsx-info-section"><h2>Return Policy</h2><ul><li>Returns start online, and you receive a UPS shipping label to take to a UPS drop-off location.</li><li>Pack items in the original manufacturer's box with enough padding to prevent damage in transit.</li><li>Depending on the reason for the return, you may be responsible for return shipping costs.</li><li>Only items originally shipped to the United States, including US territories and APO/FPO addresses, are eligible.</li></ul></section>
<section class="wsx-info-section"><h2>Re-print Shipping Label</h2><p>Labels for returns processed online can be reprinted within 7 days.</p>${reprint}<form class="wsx-form" method="get" action="${base}/customer-service/return/">${field('rt-ref', 'Return Reference Number', 'reference', ref, 'text', ' required')}${field('rt-lookup', 'Enter one of the following: Postal Code, Full Name (First and Last) or Order Number', 'lookup', lookup)}<button type="submit">Search</button></form></section>`)
  })

  page('/customer-service/gift-services/gift-card-landing.html', 'Gift Cards', (req, base) => {
    const number = str(req.query.cardNumber), submitted = 'cardNumber' in req.query
    const result = submitted ? alert(!/^\d{12,19}$/.test(number.replace(/\s/g, '')) ? 'Please enter a valid gift card number.' : 'We were unable to find a balance for this gift card. Please check the card number and PIN.') : ''
    return infoLayout(base, { h1: 'Online Gift Cards, eGift Cards & Gift Card', lead: 'Give exactly what the recipient wants or needs with a Williams Sonoma gift card.' },
      `<div class="wsx-tiles">${tile(base, 'Gift Cards', '/customer-service/gift-services/gift-card-landing.html#gift-cards', '#e9e2d6', 'Mailed in a gift box')}${tile(base, 'eGift Cards', '/customer-service/gift-services/gift-card-landing.html#egift-cards', '#e2e6e9', 'Delivered by email')}${tile(base, 'Corporate Gifting', '/pages/williams-sonoma/b2b/corporate-gifting/', '#ece4dc', 'Bulk gift card orders')}</div>
<section class="wsx-info-section" id="gift-cards"><h2>Gift Cards</h2><p>Physical gift cards arrive in a signature gift box and are redeemable in Williams Sonoma stores and online. Gift cards can be purchased in any Williams Sonoma store or by calling 877.812.6235.</p></section><section class="wsx-info-section" id="egift-cards"><h2>eGift Cards</h2><p>eGift cards are delivered by email with a personal message and can be redeemed online.</p></section>
<section class="wsx-info-section" id="balance"><h2>Check Your Gift Card Balance</h2>${result}<form class="wsx-form" method="get" action="${base}/customer-service/gift-services/gift-card-landing.html">${field('gc-number', 'Gift Card Number', 'cardNumber', number, 'text', ' inputmode="numeric" required')}${field('gc-pin', 'PIN', 'pin', '', 'password', ' inputmode="numeric"')}<button type="submit">Check Balance</button></form></section>`)
  })

  page('/stores/', 'Store Locator', (req, base) => {
    const location = str(req.query.location), distance = ['25', '50', '100'].includes(str(req.query.distance)) ? str(req.query.distance) : '25'
    const needle = location.toLowerCase()
    const matches = needle ? storeDirectory.map(s => ({ ...s, stores: s.state.toLowerCase().includes(needle) ? s.stores : s.stores.filter(st => `${st.city} ${st.name}`.toLowerCase().includes(needle)) })).filter(s => s.stores.length) : storeDirectory
    const directory = matches.map(s => `<section><h3>${esc(s.state)}</h3><ul>${s.stores.map(st => `<li><strong>${esc(st.city)}</strong><span>${esc(st.name)}</span></li>`).join('')}</ul></section>`).join('')
    return `${crumbs(base, [['Store Locator', '/stores/']])}<div class="wsx-stores"><h1>Williams Sonoma Store Locations</h1><form class="wsx-store-form" method="get" action="${base}/stores/"><div class="wsx-field"><label for="sl-location">LOCATION</label><input id="sl-location" name="location" value="${esc(location)}" placeholder="City, State or ZIP Code"></div><div class="wsx-field"><label for="sl-distance">DISTANCE</label><select id="sl-distance" name="distance">${['25', '50', '100'].map(d => `<option value="${d}"${d === distance ? ' selected' : ''}>Within ${d} Miles</option>`).join('')}</select></div><button type="submit">Search</button></form>${needle ? `<p class="wsx-count">${matches.reduce((n, s) => n + s.stores.length, 0)} stores matching “${esc(location)}”. Distance search uses the store directory only.</p>` : ''}${needle && !matches.length ? alert(`We couldn't find any stores matching “${location}”.`) : ''}<h2>United States</h2><div class="wsx-store-grid">${directory}</div><section class="wsx-info-section"><h2>Events &amp; Services</h2><p>${Object.values(eventsServices).flat().slice(0, 6).map(([l, p]) => a(base, p, l)).join(' · ')}</p></section></div>`
  })

  page('/registry/', 'Wedding Registry', (req, base) => {
    const first = str(req.query.firstName), last = str(req.query.lastName), submitted = 'lastName' in req.query
    const result = submitted ? (!last ? alert('Please enter the registrant’s last name.') : alert(`No registries were found for ${[first, last].filter(Boolean).join(' ')}. Check the spelling or try another name.`, 'status')) : ''
    return `${crumbs(base, [['Registry', '/registry/']])}<section class="wsx-registry-hero"><div><p class="wsx-eyebrow">Wedding &amp; Gift Registry</p><h1>Wedding Registry</h1><p>Your Dream Registry Starts Here! Save 10%, Plus So Many More Perks.</p><p>${a(base, '/registry/create/', 'Create a Registry', ' class="wsx-btn"')} ${a(base, '/appointments/registry-virtual-choice/', 'Book a Free Appointment', ' class="wsx-btn wsx-btn-light"')}</p></div></section>
<section class="wsx-section wsx-registry-find" id="find"><h2>find a wedding registry</h2>${result}<form class="wsx-form wsx-form-inline" method="get" action="${base}/registry/">${field('rg-first', 'First Name', 'firstName', first)}${field('rg-last', 'Last Name', 'lastName', last, 'text', ' required')}<button type="submit">Find a Registry</button></form></section>
<section class="wsx-section"><h2 class="wsx-section-title">Registry Perks</h2><div class="wsx-tiles">${tile(base, 'Completion Discount', '/registry/#find', '#ece4dc', 'Save 10% after your event')}${tile(base, 'Free Registry Services', '/appointments/registry-virtual-choice/', '#e3e6e8', 'In store or virtual')}${tile(base, 'Registry Favorites', '/shop/cookware/cookware-sets/', '#e6ddd3', 'Cookware sets & more')}${tile(base, 'Key Rewards', '/pages/the-key-rewards/', '#e9e3d8', 'Earn on every gift')}</div></section>`
  })
  page('/registry/create/', 'Create a Registry', (req, base) => infoLayout(base, { h1: 'Create a Registry', lead: req.store.user ? 'Registries are created with one of our registry specialists. Book a free in-store or virtual appointment and we’ll set up your registry together.' : 'Sign in or create an account to start your registry.', cta: req.store.user ? [['Book a Free Appointment', '/appointments/registry-virtual-choice/'], ['Back to Registry', '/registry/']] : [['Sign In', '/account/login.html'], ['Create an Account', '/account/create.html']] }))

  page('/recipe/', 'Recipes', (req, base) => `${crumbs(base, [['Recipes', '/recipe/']])}<div class="wsx-plp"><aside class="wsx-sidenav" aria-label="Recipes"><h2>Recipes</h2><section><h3>Recipes by Course</h3><ul>${recipeCourses.map(([l, p]) => `<li>${a(base, p, l)}</li>`).join('')}</ul></section></aside><div class="wsx-plp-main"><header class="wsx-plp-head"><h1>Healthy Recipes, Quick &amp; Easy Recipes, Dinner Ideas</h1><p>Recipes and menus from the Williams Sonoma test kitchen, chefs and cookbook authors.</p></header>
<section class="wsx-section"><h2 class="wsx-section-title">Recipes by Course</h2><div class="wsx-tiles">${recipeCourses.slice(0, 8).map(([l, p]) => tile(base, l, p, '#ece5da')).join('')}</div></section>
<section class="wsx-section"><h2 class="wsx-section-title">Fall Favorites from Our Test Kitchen</h2><div class="wsx-recipe-grid">${[['/recipe/main-courses/poultry-and-game/', 0], ['/recipe/soups/', 0], ['/recipe/main-courses/beef-and-veal/', 0], ['/recipe/desserts/', 0], ['/recipe/salads/', 0], ['/recipe/appetizers/', 0], ['/recipe/main-courses/pork/', 0], ['/recipe/desserts/', 1]].map(([p, n], i) => recipeCard(base, recipesByCourse[p][n], i)).join('')}</div></section>
<section class="wsx-section"><h2 class="wsx-section-title">Chefs &amp; Celebrities</h2><div class="wsx-trio">${[['Book Tours', '/pages/virtual-events-and-in-store-classes/book-tours/', 'Meet chefs & cookbook authors in our stores'], ['Entertaining & Design Inspiration', '/pages/williams-sonoma/the-art-of-entertaining/', 'Set the table, plan the menu'], ['Recipe Box', '/account/recipe-box/', 'Save the recipes you love']].map(([l, p, s], i) => tile(base, l, p, RECIPE_TONES[i % RECIPE_TONES.length], s)).join('')}</div></section>
<section class="wsx-section"><h2 class="wsx-section-title">This Season</h2><div class="wsx-trio">${[['Flavors of Fall', '/shop/food/flavors-of-fall/', 'Pumpkin, apple & spice'], ['Fall Baking', '/shop/bakeware/bakeware-fall-baking/', 'Pies, tarts & Bundts'], ['Thanksgiving Mains', '/recipe/main-courses/poultry-and-game/', 'Turkey, roast chicken & more']].map(([l, p, s], i) => tile(base, l, p, RECIPE_TONES[(i + 3) % RECIPE_TONES.length], s)).join('')}</div></section>
<section class="wsx-section"><h2 class="wsx-section-title">Holiday Guides</h2><div class="wsx-trio">${[['Halloween', '/shop/halloween/all-halloween/', 'Treats & spooky bakeware'], ['Thanksgiving', '/shop/thanksgiving/all-thanksgiving/', 'Plan the feast'], ['Christmas', '/shop/christmas/christmas-view-all/', 'Holiday baking & entertaining']].map(([l, p, s], i) => tile(base, l, p, RECIPE_TONES[(i + 1) % RECIPE_TONES.length], s)).join('')}</div></section></div></div>`)
  for (const [label, path] of recipeCourses) page(path, `${label} Recipes`, (req, base) => `${crumbs(base, [['Recipes', '/recipe/'], [label, path]])}<div class="wsx-plp"><aside class="wsx-sidenav" aria-label="Recipes"><h2>${a(base, '/recipe/', 'Recipes')}</h2><section><h3>Recipes by Course</h3><ul>${recipeCourses.map(([l, p]) => `<li><a href="${esc(base + p)}"${p === path ? ' aria-current="page"' : ''}>${esc(l)}</a></li>`).join('')}</ul></section></aside><div class="wsx-plp-main"><header class="wsx-plp-head"><h1>${esc(label)} Recipes</h1><p class="wsx-count">${(recipesByCourse[path] || []).length} Recipes</p></header>${(recipesByCourse[path] || []).length ? `<div class="wsx-recipe-grid">${recipesByCourse[path].map((rc, i) => recipeCard(base, rc, i)).join('')}</div>` : `<div class="wsx-empty"><h2>New recipes coming soon</h2><p>Explore more dishes from our test kitchen.</p></div>`}<p class="wsx-recipe-more">${a(base, '/recipe/', 'All Recipes', ' class="wsx-btn wsx-btn-light"')}</p></div></div>`)

  page('/pages/williams-sonoma/brands-a-to-z/', 'Brands A to Z', (req, base) => {
    const brands = new Map()
    for (const d of departments) for (const g of d.groups) if (g.title === 'Brands') for (const [label, path] of g.links) if (label !== 'All Brands' && !brands.has(label)) brands.set(label, path)
    for (const p of shelf) if (!brands.has(p.brand)) brands.set(p.brand, `/search/results.html?words=${encodeURIComponent(p.brand)}`)
    for (const p of unique) if (!brands.has(p.brand)) brands.set(p.brand, `/search/results.html?words=gta%206&brand=${encodeURIComponent(p.brand)}`)
    const sorted = [...brands].sort((x, y) => x[0].localeCompare(y[0]))
    const letters = [...new Set(sorted.map(([n]) => n[0].toUpperCase()))]
    return `${crumbs(base, [['Brands A to Z']])}<div class="wsx-info"><article><h1>Brands A to Z</h1><p class="wsx-lead">Shop the cookware, cutlery, electrics and tabletop brands we carry.</p><p class="wsx-letters">${letters.map(l => `<a href="#brand-${l}">${l}</a>`).join('')}</p>${letters.map(l => `<section class="wsx-info-section" id="brand-${l}"><h2>${l}</h2><ul class="wsx-columns">${sorted.filter(([n]) => n[0].toUpperCase() === l).map(([n, p]) => `<li>${a(base, p, n)}</li>`).join('')}</ul></section>`).join('')}</article></div>`
  })

  // Account, favorites and cart.
  const signInForm = (base, values = {}, error = '') => `${alert(error)}<form class="wsx-form" method="post" action="${base}/account/login.html">${field('si-email', 'Email Address', 'email', values.email, 'email', ' autocomplete="email" required')}${field('si-password', 'Password', 'password', '', 'password', ' autocomplete="current-password" required')}<button type="submit">Sign In</button></form><p><a href="${base}/customer-service/email-us/">Forgot Password?</a></p>`
  const accountPage = (base, inner) => `${crumbs(base, [['My Account', '/account/']])}<div class="wsx-account-page">${inner}</div>`
  const signInPage = (base, values, error) => accountPage(base, `<section><h1>Sign In</h1><p>Sign in to track orders, manage your registry and view your rewards.</p>${signInForm(base, values, error)}</section><section><h2>Create an Account</h2><p>Save favorites, check out faster and join The Key Rewards.</p><p>${a(base, '/account/create.html', 'Create an Account', ' class="wsx-btn wsx-btn-light"')}</p></section>`)
  page('/account/login.html', 'Sign In', (req, base) => signInPage(base))
  router.post('/account/login.html', (req, res) => {
    const base = baseOf(res), email = str(req.body?.email), user = authenticate('williams-sonoma', email, req.body?.password)
    if (!user) return render(req, res, 'Sign In', signInPage(base, { email }, 'The email address or password you entered is incorrect. Please try again.'), 401)
    req.store.user = { email: user.email, first_name: user.first_name, last_name: user.last_name }
    res.redirect(`${base}/account/`)
  })
  const createPage = (base, values = {}, error = '') => accountPage(base, `<section><h1>Create an Account</h1>${alert(error)}<form class="wsx-form" method="post" action="${base}/account/create.html">${field('ca-first', 'First Name', 'first_name', values.first_name, 'text', ' autocomplete="given-name" required')}${field('ca-last', 'Last Name', 'last_name', values.last_name, 'text', ' autocomplete="family-name" required')}${field('ca-email', 'Email Address', 'email', values.email, 'email', ' autocomplete="email" required')}${field('ca-password', 'Password', 'password', '', 'password', ' autocomplete="new-password" minlength="8" required')}<button type="submit">Create Account</button></form></section><section><h2>Already have an account?</h2><p>${a(base, '/account/login.html', 'Sign In', ' class="wsx-btn wsx-btn-light"')}</p></section>`)
  page('/account/create.html', 'Create an Account', (req, base) => createPage(base))
  router.post('/account/create.html', (req, res) => {
    const base = baseOf(res), b = req.body || {}, values = { first_name: str(b.first_name), last_name: str(b.last_name), email: str(b.email) }
    const password = typeof b.password === 'string' ? b.password : ''
    let error = !values.first_name || !values.last_name ? 'Please enter your first and last name.' : !/^\S+@\S+\.\S+$/.test(values.email) ? 'Please enter a valid email address.' : password.length < 8 ? 'Your password must be at least 8 characters.' : ''
    if (!error) { const acct = createAccount('williams-sonoma', { ...values, password }); if (acct.error) error = acct.error; else req.store.user = { email: acct.email, first_name: acct.first_name, last_name: acct.last_name } }
    if (error) return render(req, res, 'Create an Account', createPage(base, values, error), 400)
    res.redirect(`${base}/account/`)
  })
  page('/trade-signin/login.html', 'B2B Member Sign-In', (req, base) => accountPage(base, `<section><h1>B2B Member Sign-In</h1><p>Trade, contract and professional chef members sign in here.</p>${signInForm(base)}</section><section><h2>Not a member?</h2><p>${a(base, '/pages/williams-sonoma/b2b/overview/', 'Learn about B2B Programs', ' class="wsx-btn wsx-btn-light"')}</p></section>`))
  router.get('/account/logout', (req, res) => { req.store.user = null; res.redirect(`${baseOf(res)}/`) })
  const orderHistory = (req, base) => {
    const orders = Array.isArray(req.store.wsOrders) ? req.store.wsOrders : []
    return orders.length ? `<ul class="wss-history">${orders.toReversed().map(o => `<li>${a(base, `/checkout/confirmation.html?order=${encodeURIComponent(o.order_number)}`, `Order ${o.order_number}`)} · ${esc(new Date(o.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }))} · ${o.items.reduce((n, it) => n + it.qty, 0)} item(s) · ${usd(o.totals.total)}</li>`).join('')}</ul>` : '<p>You have no orders on this account.</p>'
  }
  const requireUser = (title, inner) => (req, base) => req.store.user ? accountPage(base, inner(req, base)) : signInPage(base, {}, `Please sign in to view ${title}.`)
  const accountNav = base => `<nav class="wsx-account-nav" aria-label="My Account">${[['Account Overview', '/account/'], ['Order History', '/account/'], ['View My Rewards', '/account/keyrewards.html'], ['Recipe Box', '/account/recipe-box/'], ['Favorites', '/favorites/'], ['Registry', '/registry/'], ['Email Preferences', '/customer-service/manage-email-settings/'], ['Sign Out', '/account/logout']].map(([l, p]) => a(base, p, l)).join('')}</nav>`
  page('/account/', 'My Account', (req, base) => req.store.user ? accountPage(base, `${accountNav(base)}<section><h1>My Account</h1><p>Welcome back, ${esc(req.store.user.first_name || req.store.user.email)}.</p><h2>Order History</h2>${orderHistory(req, base)}<h2>The Key Rewards</h2><p>${a(base, '/account/keyrewards.html', 'View My Rewards')}</p></section>`) : signInPage(base))
  page('/account/keyrewards.html', 'View My Rewards', requireUser('your rewards', (req, base) => `${accountNav(base)}<section><h1>View My Rewards</h1><p>Available rewards: $0.00</p><p>${a(base, '/pages/the-key-rewards/', 'About The Key Rewards')}</p></section>`))
  page('/account/recipe-box/', 'Recipe Box', requireUser('your recipe box', (req, base) => `${accountNav(base)}<section><h1>Recipe Box</h1><p>You haven’t saved any recipes yet.</p><p>${a(base, '/recipe/', 'Explore Recipes', ' class="wsx-btn"')}</p></section>`))
  page('/favorites/', 'Favorites', (req, base) => `${crumbs(base, [['Favorites', '/favorites/']])}<div class="wsx-info"><article><h1>Favorites</h1><p class="wsx-lead">You have no favorites yet.</p><p>Save items you love by selecting the heart on any product.</p><p>${req.store.user ? a(base, '/', 'Start Shopping', ' class="wsx-btn"') : `${a(base, '/account/login.html', 'Sign In', ' class="wsx-btn"')} ${a(base, '/', 'Start Shopping', ' class="wsx-btn wsx-btn-light"')}`}</p></article></div>`)
  page('/cart/', 'Shopping Cart', (req, base) => `${crumbs(base, [['Cart', '/cart/']])}<div class="wsx-cart"><h1>Your cart is empty.</h1>${req.store.user ? '' : `<p>Already have an account? Sign in to pick up where you left off.</p>`}<p>${a(base, '/', 'Start Shopping', ' class="wsx-btn"')}${req.store.user ? '' : ` ${a(base, '/account/login.html', 'Sign In', ' class="wsx-btn wsx-btn-light"')}`}</p></div>`)

  // Site map (HTML and XML).
  page('/sitemap.html', 'Site Map', (req, base) => sitemapPage(base))
  router.get('/sitemap.xml', (req, res) => {
    const base = baseOf(res)
    res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...new Set(sitePaths())].map(p => `  <url><loc>${esc(base + p)}</loc></url>`).join('\n')}\n</urlset>\n`)
  })

  // Earlier local routes from the bare clone keep working as redirects.
  const legacyCategory = { cookware: '/shop/cookware/', tools: '/shop/cooks-tools/', cutlery: '/shop/cutlery/', electrics: '/shop/electrics/', bakeware: '/shop/bakeware/', 'food-home': '/shop/food/', tabletop: '/shop/tabletop-glassware-bar/' }
  const legacyCollection = { new: '/shop/new/', sale: '/shop/sale-special-offer/', gathering: '/shop/thanksgiving/all-thanksgiving/', 'fall-baking': '/shop/bakeware/bakeware-fall-baking/' }
  const go = path => (req, res) => res.redirect(301, baseOf(res) + path)
  for (const [from, to] of [['/help', '/customer-service/'], ['/help/shipping', '/customer-service/shipping-info.html'], ['/help/returns', '/customer-service/return/'], ['/events', '/pages/virtual-events-and-in-store-classes/in-store-events/'], ['/track-order', '/customer-service/order-shipment-tracking/'], ['/recipes', '/recipe/'], ['/brands', '/pages/williams-sonoma/brands-a-to-z/'], ['/sitemap', '/sitemap.html'], ['/account/orders', '/account/'], ['/account/registries', '/registry/']]) router.get(from, go(to))
  router.get('/category/:slug', (req, res) => res.redirect(301, baseOf(res) + (legacyCategory[req.params.slug] || '/sitemap.html')))
  router.get('/category/:slug/:type', (req, res) => res.redirect(301, baseOf(res) + (legacyCategory[req.params.slug] || '/sitemap.html')))
  router.get('/collection/:slug', (req, res) => res.redirect(301, baseOf(res) + (legacyCollection[req.params.slug] || '/shop/new/')))
  router.get('/guides/:slug', (req, res) => res.redirect(301, baseOf(res) + (req.params.slug === 'cutlery' ? '/pages/williams-sonoma/cutlery/cutlery-buying-guide/' : '/pages/williams-sonoma/cookware/cookware-materials/')))
}
