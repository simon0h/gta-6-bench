import { Router } from 'express'
import { esc, publicNotice } from '../../lib/html.js'
import { authenticate, createAccount, publicAccount } from '../../lib/accounts.js'
import { listOrders } from '../../lib/orders.js'
import { departments, categoryIndex, menuDepartments, rooms, roomCategories, footerColumns, legalBar, P } from './site-data.js'
import { infoPages } from './site-pages.js'
import { searchImages } from './search-reference.js'
import { shelf, inCategory, deals, newArrivals } from './shelf.js'
import { listing, carousel, imgUrl } from './shelf-pages.js'

// Real-site pages for the IKEA US clone (paths mirror https://www.ikea.com/us/en/...).
// In the default reference catalog, product grids and carousels show the IKEA shelf
// (shelf.js), an everyday assortment kept separate from the GTA 6 evidence (IKEA has
// no GTA 6 listing). Categories with no shelf rows keep the empty-listing state.

const imageByTitle = Object.fromEntries(searchImages.slice(12).map(i => [i.title, i.src]))
const inspiration = searchImages.slice(0, 12)
export const imageFor = cat => imageByTitle[cat.image || cat.title] || null
const RI = '/static/reference/ikea'

const crumbs = (base, items) => `<nav class="ik-crumbs" aria-label="Breadcrumb"><ol>${items.map(([label, href], i) => `<li>${i < items.length - 1 && href ? `<a href="${base}${P}${href}">${esc(label)}</a>` : `<span aria-current="page">${esc(label)}</span>`}</li>`).join('')}</ol></nav>`
const GENERIC = new Set(['lighting', 'storage', 'accessories', 'furniture', 'solutions', 'supplies', 'systems', 'organizers', 'organization', 'outdoor', 'kitchen', 'white'])
// Category tiles: the category photo, else its best-selling product (as on ikea.com),
// else the department photo.
const tileImage = cat => {
  const photo = imageFor(cat)
  if (photo) return { src: photo, cls: '' }
  const top = byPopularity(inCategory(cat.slug))[0]
  if (top) return { src: imgUrl('', top), cls: ' ik-tile-product' }
  const words = cat.title.toLowerCase().split(/[^a-z]+/).filter(w => w.length > 4 && !GENERIC.has(w))
  const scenes = inspiration.filter(i => words.some(w => new RegExp(`\\b${w}`, 'i').test(i.alt)))
  const scene = scenes[[...cat.slug].reduce((h, c) => h + c.charCodeAt(0), 0) % (scenes.length || 1)]
  if (scene) return { src: scene.src, cls: '' }
  const parent = cat.parent || categoryIndex.get(cat.slug)?.parent
  const fallback = parent && imageFor(parent)
  return fallback ? { src: fallback, cls: '' } : null
}
const tile = (base, cat, extra = '') => {
  const img = tileImage(cat)
  const src = img && (img.cls ? base + img.src : img.src)
  return `<a class="ik-tile${img ? img.cls : ' no-img'}" href="${base}${P}/cat/${cat.slug}/"${extra}>${img ? `<img src="${esc(src)}" alt="" loading="lazy">` : `<span class="ik-tile-ph" aria-hidden="true">${esc(cat.title.slice(0, 1))}</span>`}<span>${esc(cat.title)}</span></a>`
}
const serviceBlocks = base => `<section class="ik-service-blocks" aria-label="Services"><a href="${base}${P}/customer-service/services/product-reservation/"><strong>Click and collect</strong><span>Order online and pick up at your local store.</span></a><a href="${base}${P}/customer-service/services/planning-consultation/"><strong>Planning and consultation</strong><span>Get help planning your space.</span></a><a href="${base}${P}/customer-service/services/delivery/"><strong>Delivery</strong><span>Get your purchases delivered to your door.</span></a><a href="${base}${P}/customer-service/services/assembly/"><strong>Taskrabbit Assembly</strong><span>Book a Tasker to assemble your furniture.</span></a><a href="${base}${P}/customer-service/services/finance-options/"><strong>Financing options</strong><span>Pay over time with IKEA financing.</span></a><a href="${base}${P}/planners/"><strong>Planning tools</strong><span>Design your space in 3D.</span></a></section>`
const emptyResults = (base, what) => `<div class="ik-results-empty" data-reference-state="empty-listing"><h3>No products to show</h3><p>There are currently no products available in ${esc(what)}. Please check back soon or explore our other products.</p><a class="ik-btn ik-btn-secondary" href="${base}${P}/cat/products-products/">Explore all products</a></div>`
const filterBar = (base, action, count = 0) => {
  const pill = (label, name, values) => `<details class="ik-pill"><summary>${label}</summary><div>${values.map(v => `<label><input type="radio" name="${name}" value="${esc(v)}"> ${esc(v)}</label>`).join('')}<button class="ik-btn">Apply</button></div></details>`
  return `<section class="ik-sortfilter" aria-label="Sort and Filter"><h2 class="sr-only">Sort and Filter</h2><form action="${action}" method="get">${pill('Sort', 'sort', ['Best match', 'Price: low to high', 'Price: high to low', 'Newest', 'Customer rating', 'Name'])}${pill('Price', 'price', ['$0 - 49', '$50 - 99', '$100 - 199', '$200+'])}${pill('Color', 'color', ['White', 'Black', 'Gray', 'Beige', 'Brown', 'Green', 'Blue'])}${pill('Material', 'material', ['Wood', 'Metal', 'Fabric', 'Glass', 'Plastic'])}${pill('Category', 'category', ['All'])}<a class="ik-pill-link" href="${action}">All filters</a></form><p class="ik-count"><strong>${count} items</strong></p></section><h2 class="sr-only">Results list</h2>`
}
const head = (base, items, h1, lead) => `${items.length ? crumbs(base, items) : ''}<div class="ik-page-head"><h1>${esc(h1)}</h1>${lead ? `<p class="ik-lead">${lead}</p>` : ''}</div>`
const helpBox = base => `<section class="ik-help-box"><h2>How can we help you?</h2><p>Find answers in our FAQ or contact customer service.</p><a class="ik-btn ik-btn-secondary" href="${base}${P}/customer-service/faq/">Read more</a> <a class="ik-btn ik-btn-secondary" href="${base}${P}/customer-service/support/">Contact us</a></section>`

const featuredDepts = ['storage-organization-st001', 'sofas-armchairs-700640', 'beds-mattresses-bm001', 'kitchen-appliances-ka001', 'tables-chairs-fu002', 'home-textiles-tl001', 'home-decor-de001', 'baby-kids-bc001', 'ikea-food-restaurant-fb001', 'home-electronics-he001', 'smart-home-hs001', 'pet-accessories-pt001'].map(s => categoryIndex.get(s))

const byPopularity = items => [...items].sort((a, b) => b.popularity - a.popularity)
const topIn = (cats, n) => byPopularity(shelf.filter(p => cats.includes(p.cat))).slice(0, n)
// One best seller per department first, so the row spans the store.
function topSellers() {
  const out = [], seen = new Set()
  for (const p of byPopularity(shelf)) if (!seen.has(p.dept) && out.length < 12) { seen.add(p.dept); out.push(p) }
  return out
}
const topDeals = () => byPopularity(deals()).slice(0, 12)

export function homePage(base) {
  const promo = (cls, img, eyebrow, title, text, href, cta) => `<a class="ik-promo ${cls}" href="${base}${href}">${img ? `<img src="${img}" alt="" loading="lazy">` : ''}<div><p class="ik-eyebrow">${eyebrow}</p><h2>${title}</h2><p>${text}</p><span class="ik-btn ik-btn-small">${cta}</span></div></a>`
  return `<div class="ik-home" data-reference-state="catalog">
  <h1 class="sr-only">Welcome to IKEA USA</h1>
  <section class="ik-catnav" aria-label="Product categories"><a class="sr-only" href="#ik-home-hero">Skip product categories list</a><div class="ik-catrail">${featuredDepts.map(d => tile(base, d)).join('')}<a class="ik-tile no-img" href="${base}${P}/cat/products-products/"><span class="ik-tile-ph" aria-hidden="true">→</span><span>All products</span></a></div></section>
  ${carousel(base, 'New lower price', topDeals(), `${base}${P}/offers/`)}
  <section id="ik-home-hero" class="ik-hero"><img src="${RI}/kitchen-planning.jpg" alt="A light kitchen with wood fronts, open shelves and a dining table"><div class="ik-hero-card ik-family-yellow"><p class="ik-eyebrow">IKEA Family price</p><h2>IKEA Family price</h2><p>Members save 10% on SEKTION kitchens. Join IKEA Family for free and get member prices on selected products.</p><a class="ik-btn" href="${base}${P}/ikea-family/">Join or log in</a> <a class="ik-btn ik-btn-secondary" href="${base}${P}/offers/">See all offers</a></div></section>
  <section class="ik-sec"><h2>Holiday hosting?</h2><div class="ik-promos">${promo('wide', `${RI}/kitchen-accessories.jpg`, 'Kitchen &amp; tableware', 'Thanksgiving prep starts now', 'Serveware, cookware and table linens for every gathering.', `${P}/cat/cookware-tableware-kt001/`, 'Shop kitchenware')}${promo('', inspiration[8].src, 'New', 'Fall in love with our newest designs', 'Warm colors and soft textures for the new season.', `${P}/new/new-products/`, 'Shop new arrivals')}</div></section>
  ${carousel(base, 'Top sellers', topSellers(), `${base}${P}/cat/products-products/`)}
  <section class="ik-sec ik-food"><div><p class="ik-eyebrow">IKEA Food</p><h2>Delicious deals on your favorite foods</h2><p>Stock up at the Swedish Food Market and enjoy restaurant offers for IKEA Family members.</p><a class="ik-btn ik-btn-secondary" href="${base}${P}/cat/ikea-food-restaurant-fb001/">Shop Swedish food</a></div><img src="${imageByTitle['IKEA Food & Swedish restaurant']}" alt="" loading="lazy"></section>
  <section class="ik-sec"><h2>IKEA Family offers</h2><p>Members save more every day, every visit. Enjoy member-only offers, 90-day price protection, free coffee and tea and more.</p><div class="ik-chips"><a href="${base}${P}/ikea-family/">IKEA Family benefits</a><a href="${base}${P}/offers/">All offers</a><a href="${base}${P}/profile/login/">Join or log in</a></div></section>
  <section class="ik-sec"><h2>Right now at IKEA</h2><div class="ik-grid4">${[['Deals', `${P}/offers/`, 'Save online and in-store.'], ['Shop new arrivals', `${P}/new/new-products/`, 'See what’s new this season.'], ['Winter holiday shop', `${P}/cat/winter-holidays-wt001/`, 'Holiday decor, lights and treats.'], ['IKEA Live shopping', `${P}/ideas/`, 'Get inspired by our experts.']].map(([t, h, d]) => `<a class="ik-card" href="${base}${h}"><h3>${t}</h3><p>${d}</p></a>`).join('')}</div></section>
  ${carousel(base, 'New arrivals', newArrivals().sort((a, b) => b.popularity - a.popularity).slice(0, 12), `${base}${P}/new/new-products/`)}
  ${carousel(base, 'Bestsellers for the bedroom', topIn(['beds-bm003', 'mattresses-bm002', 'bedding-tl004', 'nightstands-20656', 'dressers-storage-drawers-st004'], 10), `${base}${P}/cat/beds-mattresses-bm001/`)}
  ${carousel(base, 'Organize your home office', topIn(['desks-computer-desks-20649', 'desk-chairs-20652', 'desk-accessories-10573', 'gaming-furniture-55002', 'lamps-light-fixtures-li002'], 10), `${base}${P}/cat/workspace-desks-chairs-fu004/`)}
  <section class="ik-sec"><h2>Shop accessories for every room</h2><p>Small changes with big impact: textiles, lighting, plants and decor to refresh any space.</p><h3>Inspiration for every room</h3><div class="ik-rooms">${rooms.slice(0, 8).map((r, i) => `<a href="${base}${P}/rooms/${r.slug}/"><img src="${inspiration[i].src}" alt=""><span>${esc(r.title)}</span></a>`).join('')}</div></section>
  <section class="ik-sec"><h2>As seen on Instagram</h2><p>Real homes, real ideas. Share yours with #IKEAUSA.</p><div class="ik-insta">${inspiration.slice(4, 10).map(i => `<a href="${base}${P}/ideas/"><img src="${i.src}" alt="${esc(i.alt)}"></a>`).join('')}</div></section>
  <section class="ik-sec"><h2>Discover how convenient shopping at IKEA can be!</h2><div class="ik-grid4"><a class="ik-card" href="${base}${P}/customer-service/services/product-reservation/"><h3>Need it fast? Try Click &amp; collect!</h3><p>Order online and pick up at your local IKEA store.</p></a><a class="ik-card" href="${base}${P}/customer-service/services/delivery/"><h3>Delivery</h3><p>Small order shipping and large item delivery options.</p></a><a class="ik-card" href="${base}${P}/customer-service/services/assembly/"><h3>Assembly by Taskrabbit</h3><p>Let a Tasker put it together.</p></a><a class="ik-card" href="${base}${P}/customer-service/mobile-apps/"><h3>The IKEA app</h3><p>Shop, scan and save on the go.</p></a></div></section>
  <section class="ik-sec ik-band"><div><h2>Buyback &amp; Resell</h2><p>Bring back IKEA furniture you no longer need and get store credit. We give it a second life in the As-is section.</p><a class="ik-btn ik-btn-secondary" href="${base}${P}/circular/buy-back/">Learn more</a></div></section>
  <section class="ik-sec"><h2>Services and support</h2><div class="ik-chips">${[['Customer service', '/customer-service/'], ['Track & Manage My Order', '/customer-service/track-manage-order/'], ['Return Policy', '/customer-service/returns-claims/'], ['Services', '/customer-service/services/'], ['Find a Location', '/stores/'], ['Gift Cards', '/customer-service/gift-cards-pub3d1efe50/']].map(([t, h]) => `<a href="${base}${P}${h}">${esc(t)}</a>`).join('')}</div></section>
  <section class="ik-sec"><h2>Tips and ideas for a more sustainable home</h2><p>Save energy and water, reduce food waste and give furniture a longer life with simple everyday changes.</p><a class="ik-link" href="${base}${P}/this-is-ikea/climate-environment/">Read more</a></section>
  <section class="ik-sec"><h2>Product recalls</h2><p>Your safety is our top priority. See the latest product recall information.</p><a class="ik-link" href="${base}${P}/customer-service/product-support/recalls/">See product recalls</a></section>
  <section class="ik-sec ik-seo"><h2>Design inspiration and modern home ideas</h2><p>At IKEA, our vision is to create a better everyday life for the many people. Explore affordable furniture, smart storage and home accessories for every room, from the <a href="${base}${P}/rooms/living-room/">living room</a> and <a href="${base}${P}/rooms/bedroom/">bedroom</a> to the <a href="${base}${P}/rooms/kitchen/">kitchen</a> and <a href="${base}${P}/rooms/home-office/">home office</a>. Get ideas, plan your space with our <a href="${base}${P}/planners/">planning tools</a> and find your nearest <a href="${base}${P}/stores/">IKEA store</a>.</p></section>
  </div>`
}

function productsPage(base) {
  return `${head(base, [], 'Products')}${carousel(base, 'Top sellers', topSellers())}<div class="ik-alldepts">${menuDepartments.map(slug => categoryIndex.get(slug)).map(d => `<section><h2><a href="${base}${P}/cat/${d.slug}/">${esc(d.title)}</a></h2><div class="ik-subrail">${tile(base, { ...d, title: 'Shop all', image: d.title })}${d.subs.map(s => tile(base, { ...s, parent: d })).join('')}</div></section>`).join('')}</div>`
}

function categoryPage(base, cat, query = {}) {
  const trail = [['Products', '/cat/products-products/']]
  if (cat.parent) trail.push([cat.parent.title, `/cat/${cat.parent.slug}/`])
  trail.push([cat.title])
  const siblings = cat.parent ? cat.parent.subs.filter(s => s.slug !== cat.slug) : []
  const anchor = /storage|shelv|dresser|wardrobe|cabinet|kids/i.test(cat.slug)
  return `${head(base, trail, cat.title, `Discover ${esc(cat.title.toLowerCase())} at IKEA — well-designed, functional and affordable, with options for every style and space.`)}
  ${cat.subs.length ? `<section class="ik-subrail" aria-label="Categories">${cat.subs.map(s => tile(base, { ...s, parent: cat })).join('')}</section>` : ''}
  ${inCategory(cat.slug).length ? listing(base, `${base}${P}/cat/${cat.slug}/`, query, inCategory(cat.slug)) : `${filterBar(base, `${base}${P}/cat/${cat.slug}/`)}${emptyResults(base, cat.title)}`}
  ${anchor ? `<section class="ik-sec ik-band"><div><h2>Remember to anchor furniture to the wall</h2><p>Tip-over accidents can be prevented. Secure chests, dressers and bookcases to the wall with the included restraint.</p><a class="ik-link" href="${base}${P}/safety-at-home/">Safety at Home</a></div></section>` : ''}
  <section class="ik-sec"><h2>Business owner? Join IKEA Business Network today</h2><p>Get member offers and planning help for your business.</p><a class="ik-link" href="${base}${P}/ikea-business/network/">See more</a></section>
  ${siblings.length ? `<section class="ik-sec"><h2>Related categories</h2><div class="ik-chips">${siblings.map(s => `<a href="${base}${P}/cat/${s.slug}/">${esc(s.title)}</a>`).join('')}</div></section>` : ''}
  ${serviceBlocks(base)}`
}

function roomsPage(base) {
  return `${head(base, [], 'IKEA Rooms', 'Find inspiration and products for every room in your home.')}<div class="ik-rooms big">${rooms.map((r, i) => `<a href="${base}${P}/rooms/${r.slug}/"><img src="${inspiration[i % 12].src}" alt="" loading="lazy"><span>${esc(r.title)}</span></a>`).join('')}<a href="${base}${P}/ikea-business/"><span class="ik-tile-ph" aria-hidden="true">B</span><span>IKEA for Business</span></a></div>`
}
function roomPage(base, room, i) {
  const cats = (roomCategories[room.slug] || []).map(s => categoryIndex.get(s)).filter(Boolean)
  return `${head(base, [['Rooms', '/rooms/'], [room.title]], room.title, `Ideas, inspiration and furniture for your ${esc(room.title.toLowerCase())}.`)}<section class="ik-hero small"><img src="${inspiration[i % 12].src}" alt="" ><div class="ik-hero-card"><h2>${esc(room.title)} inspiration</h2><p>Make the most of your space with smart solutions and everyday comfort.</p><a class="ik-btn" href="${base}${P}/ideas/">Get inspired</a></div></section><section class="ik-sec"><h2>Shop by category</h2><div class="ik-subrail">${cats.map(c => tile(base, c)).join('')}</div></section>${carousel(base, `Popular in ${room.title.toLowerCase()}`, byPopularity(cats.flatMap(c => inCategory(c.slug)).filter((p, i, all) => all.indexOf(p) === i)).slice(0, 12))}<section class="ik-sec"><h2>Plan your ${esc(room.title.toLowerCase())}</h2><p>Use our planning tools or book a planning appointment with an IKEA expert.</p><a class="ik-link" href="${base}${P}/customer-service/services/planning-consultation/">Planning services</a></section>`
}

function offersPage(base, query = {}) {
  const offerDepts = ['sofas-armchairs-700640', 'bathroom-ba001', 'baby-kids-bc001', 'beds-mattresses-bm001', 'storage-organization-st001', 'kitchen-appliances-ka001'].map(s => categoryIndex.get(s))
  return `${head(base, [], 'IKEA Offers, Sales and Deals', 'Save online and in-store. <a href="#terms">See full Terms and Conditions</a>')}
  <section class="ik-hero small"><img src="${RI}/kitchen-planning.jpg" alt=""><div class="ik-hero-card ik-family-yellow"><h2>IKEA Family members: Make your dream kitchen a reality</h2><p>Members save on SEKTION kitchens during the offer period.</p><a class="ik-btn" href="${base}${P}/ikea-family/">Join or log in</a></div></section>
  <section class="ik-sec"><h2>Make room for fall. Save online and in-store.</h2><p>Discover lower prices across the store, from storage to sofas.</p></section>
  <section class="ik-sec"><h2>Get more savings in-store</h2><p>Visit the As-is section and find in-store-only offers at your local IKEA.</p><a class="ik-link" href="${base}${P}/stores/">Find a Location</a></section>
  <section class="ik-sec"><h2>Explore offers</h2><div class="ik-chips"><a href="${base}${P}/offers/">All offers</a>${offerDepts.map(d => `<a href="${base}${P}/cat/${d.slug}/">${esc(d.title)}</a>`).join('')}</div></section>
  <section class="ik-sec"><h2>All offers</h2><p>New lower prices and IKEA Family member prices across the store.</p></section>
  ${listing(base, `${base}${P}/offers/`, query, byPopularity(deals()), { keepOrder: true })}
  <section class="ik-sec"><h2>Shop by offer</h2><div class="ik-subrail">${offerDepts.map(d => tile(base, d)).join('')}</div></section>
  <section class="ik-sec" id="terms"><h3>Terms and Conditions</h3><p>Offers are valid for a limited time, while supplies last, and may vary by store and online. IKEA Family offers require a valid IKEA Family membership.</p></section>`
}

function ideasPage(base) {
  return `${head(base, [], 'Home ideas and design inspiration', 'Get inspired with ideas, tips and how-to guides for every room.')}
  <section class="ik-sec"><h2>How-to guide</h2><div class="ik-insta">${inspiration.slice(0, 6).map(i => `<a href="${base}${P}/rooms/"><img src="${i.src}" alt="${esc(i.alt)}" loading="lazy"></a>`).join('')}</div></section>
  <section class="ik-sec"><h2>IKEA + you</h2><p>Real stories from real homes, like a clutter-free garage transformation.</p></section>
  <section class="ik-sec"><h2>Dream the possibilities with the new 2026 IKEA Style Guide</h2><p>Find your style and the products that bring it to life.</p></section>
  <section class="ik-sec"><h2>Inspiration by room</h2><div class="ik-chips">${[['Bedroom', 'bedroom'], ['Kitchens', 'kitchen'], ['Living rooms', 'living-room'], ['Dining rooms', 'dining'], ["Children's rooms", 'childrens-room'], ['Entry', 'hallway'], ['Workspaces', 'home-office'], ['Bathrooms', 'bathroom']].map(([t, s]) => `<a href="${base}${P}/rooms/${s}/">${esc(t)}</a>`).join('')}</div></section>
  <section class="ik-sec"><h2>Tips from our experts</h2><p>Small spaces, family life, affordability, sleep and sustainable living.</p></section>
  <section class="ik-sec"><h2>Need an interior designer for your home?</h2><a class="ik-link" href="${base}${P}/customer-service/services/interior-design-services-for-every-budget-pub21dbc3d0/">Interior design services</a></section>
  <section class="ik-sec"><h2>Plan your space in 3D</h2><a class="ik-link" href="${base}${P}/planners/">Start designing</a></section>
  <section class="ik-sec"><h2>IKEA for Business</h2><a class="ik-link" href="${base}${P}/ikea-business/">IKEA for Business</a></section>`
}

const services = [['Shipping and Delivery service', '/customer-service/services/delivery/'], ['Assembly by Taskrabbit', '/customer-service/services/assembly/'], ['Pick-up locations', '/customer-service/services/pickup-locations-pub71efcf80/'],
  ['Planning services', '/customer-service/services/planning-consultation/'], ['Interior Design Services', '/customer-service/services/interior-design-services-for-every-budget-pub21dbc3d0/'], ['Kitchen services', '/customer-service/services/kitchen-services-pub8f131f81/'],
  ['IKEA Buyback & Resell Service', '/circular/buy-back/'], ['Removal Services', '/customer-service/services/removal/'], ['Expert shopping assistance', '/customer-service/shopping-at-ikea/remote-shopping/'], ['Explore flexible financing options at IKEA', '/customer-service/services/finance-options/']]
function servicesPage(base) {
  return `${head(base, [['Customer service', '/customer-service/'], ['Services']], 'Services', 'DIY the IKEA way — or let us help. From delivery and assembly to planning and financing.')}<section class="ik-sec"><h2>DIY the IKEA way</h2><p>Pick, pay, transport and assemble yourself to save — or choose the services that suit you.</p></section><div class="ik-grid3">${services.map(([t, h]) => `<a class="ik-card" href="${base}${P}${h}"><h2>${esc(t)}</h2><span class="ik-arrow" aria-hidden="true">→</span></a>`).join('')}</div>${helpBox(base)}`
}
function customerServicePage(base) {
  const quick = [['Track & Manage My Order', '/customer-service/track-manage-order/'], ['Services', '/customer-service/services/'], ['Product information', '/customer-service/product-information-pub43d0a640/'], ['How to shop at IKEA', '/customer-service/shopping-at-ikea/'], ['Expert shopping assistance', '/customer-service/shopping-at-ikea/expert-shopping-assistance-pub93e7b470/'], ['FAQ', '/customer-service/faq/'], ['Privacy & Security', '/customer-service/privacy-security/'], ['IKEA apps', '/customer-service/mobile-apps/']]
  return `${head(base, [], 'Customer service')}<nav class="ik-chips" aria-label="Customer service topics">${quick.map(([t, h]) => `<a href="${base}${P}${h}">${esc(t)}</a>`).join('')}</nav>
  <div class="ik-grid4">${[['Planning Tools', '/planners/', 'Plan your space in 3D with our free planners.'], ['Return or change products', '/customer-service/returns-claims/', 'It’s OK to change your mind.'], ['Taskrabbit Assembly', '/customer-service/services/assembly/', 'Book help to assemble your furniture.'], ['Need an extra part?', '/customer-service/spare-parts/', 'Many spare parts are free of charge.']].map(([t, h, d]) => `<a class="ik-card" href="${base}${P}${h}"><h2>${esc(t)}</h2><p>${d}</p><span class="ik-link">Learn more</span></a>`).join('')}</div>
  <section class="ik-sec"><h2>How can we help you?</h2><details class="ik-faq"><summary>Q: What do I do if I need to cancel or reschedule my online order?</summary><p>While your order is still being prepared you can cancel it or change the delivery date from <a href="${base}${P}/customer-service/track-manage-order/">Track &amp; Manage My Order</a>.</p></details><details class="ik-faq"><summary>Q: Is Click &amp; Collect available for all IKEA stores?</summary><p>Click &amp; Collect is available at most stores. See the <a href="${base}${P}/customer-service/services/product-reservation/">Click &amp; Collect page</a>.</p></details><details class="ik-faq"><summary>Q: How long do I have to pick up my Click &amp; Collect Order?</summary><p>Your order is held for a limited number of days after you are notified that it is ready.</p></details><a class="ik-link" href="${base}${P}/customer-service/faq/">Read more</a></section>
  <section class="ik-sec ik-band"><div><h2>Contact us</h2><p>Contact us today via phone, email or chat.</p><a class="ik-btn" href="${base}${P}/customer-service/support/">Contact us</a></div></section>
  <section class="ik-sec"><h2>Find an IKEA near you</h2><a class="ik-btn ik-btn-secondary" href="${base}${P}/stores/">Find your IKEA</a></section>`
}

const storeList = [['Huntsville', 'AL'], ['Phoenix', 'AZ'], ['Tempe', 'AZ'], ['Scottsdale', 'AZ'], ['Colma', 'CA'], ['East Palo Alto', 'CA'], ['Emeryville', 'CA'], ['Manteca', 'CA'], ['Pleasanton', 'CA'], ['San Francisco', 'CA'], ['West Sacramento', 'CA'], ['Arcadia', 'CA'], ['Burbank', 'CA'], ['Carson', 'CA'], ['Covina', 'CA'], ['Costa Mesa', 'CA'], ['Culver City', 'CA'], ['Ontario', 'CA'], ['Thousand Oaks', 'CA'], ['Escondido', 'CA'], ['San Diego', 'CA'], ['South Bay', 'CA'], ['Centennial', 'CO'], ['Colorado Springs', 'CO'], ['New Haven', 'CT'], ['in Best Buy, Boynton Beach', 'FL'], ['Miami', 'FL'], ['Sunrise', 'FL'], ['Orlando', 'FL'], ['Tampa', 'FL']]
function storesPage(base, req) {
  const st = typeof req.query.state === 'string' ? req.query.state.trim().toUpperCase() : ''
  const list = st ? storeList.filter(s => s[1] === st) : storeList
  const states = [...new Set(storeList.map(s => s[1]))]
  return `${head(base, [], 'Find an IKEA location near you')}<form class="ik-form inline" action="${base}${P}/stores/" method="get"><label for="store-state">Filter by state</label><select id="store-state" name="state"><option value="">All states</option>${states.map(s => `<option${s === st ? ' selected' : ''}>${s}</option>`).join('')}</select><button class="ik-btn">Search</button></form>
  <section class="ik-sec"><h2>IKEA locations</h2>${list.length ? `<ul class="ik-stores">${list.map(([c, s]) => `<li><h3>IKEA ${esc(c)}, ${s}</h3><p>Open today 10 a.m.–9 p.m.</p></li>`).join('')}</ul>` : `<p>There are no IKEA stores in ${esc(st)}.</p>`}</section>
  <section class="ik-sec"><h2>IKEA in Best Buy: A new way to plan and order</h2><p>Plan and order IKEA kitchens and more with an IKEA co-worker at selected Best Buy stores.</p></section>
  <section class="ik-sec"><h2>Pick-up locations (furniture/large orders)</h2><p>Collect your order at a pick-up location near you.</p><a class="ik-link" href="${base}${P}/customer-service/services/pickup-locations-pub71efcf80/">Pick-up locations</a></section>`
}

function trackPage(base, { order = '', email = '', error = '', result = '' } = {}) {
  const steps = ['Preparing order', 'Picking order', 'Preparing delivery', 'On its way', 'Delivered']
  return `${head(base, [['Customer service', '/customer-service/'], ['Track and manage your order']], 'Track and manage your order', 'Track online orders and delivery status, view order details, download receipts and reschedule delivery.')}
  <section class="ik-sec"><h2>Manage your order</h2><p>You need your order number and the email or phone number used at checkout. IKEA Family members can see all orders when logged in.</p>${error ? `<p class="ik-error" role="alert">${esc(error)}</p>` : ''}${result}
  <form class="ik-form" action="${base}${P}/customer-service/track-manage-order/lookup/" method="get"><label for="track-order">Order number</label><input id="track-order" name="order" value="${esc(order)}" required><label for="track-email">Email or phone number</label><input id="track-email" name="email" value="${esc(email)}" autocomplete="email" required><button class="ik-btn">See your order</button></form></section>
  <section class="ik-sec"><h2>Understand your order status</h2><ol class="ik-steps">${steps.map(s => `<li><h3>${s}</h3><p>${{ 'Preparing order': 'You can still cancel the order or change the delivery date.', 'Picking order': 'The order can no longer be canceled, but items can be returned after you receive them.', 'Preparing delivery': 'Your order is being packed and handed to the carrier.', 'On its way': 'Your order is out for delivery or ready for pick-up.', Delivered: 'Your order has been delivered or collected.' }[s]}</p></li>`).join('')}</ol></section>${helpBox(base)}`
}

function newPage(base, query = {}) {
  return `${head(base, [['Products', '/cat/products-products/'], ['New arrivals']], 'Shop new arrivals', 'New products, colors and collections — arriving all the time.')}${listing(base, `${base}${P}/new/new-products/`, query, byPopularity(newArrivals()), { keepOrder: true })}<section class="ik-sec"><h2>Explore categories</h2><div class="ik-subrail">${featuredDepts.slice(0, 8).map(d => tile(base, d)).join('')}</div></section>`
}

function loginPage(base, { error = '', email = '' } = {}) {
  return `<div class="ik-login"><aside><p class="ik-eyebrow">Hej!</p><h1>Log in to your IKEA account</h1><p>Get a more personal experience where you don’t need to fill in your information every time.</p></aside><div>${error ? `<p class="ik-error" role="alert">${esc(error)}</p>` : ''}<form class="ik-form" action="${base}${P}/profile/login/" method="post"><label for="login-email">Email or phone number</label><input id="login-email" name="email" type="email" autocomplete="email" value="${esc(email)}" required><label for="login-password">Password</label><input id="login-password" name="password" type="password" autocomplete="current-password" required><button class="ik-btn">Log in</button></form><p><a class="ik-link" href="${base}${P}/customer-service/support/">Forgot your password?</a></p><hr><h2>Create an IKEA account</h2><p>Join IKEA Family for free and enjoy member offers and benefits.</p><details><summary class="ik-btn ik-btn-secondary">Create a profile</summary><form class="ik-form" action="${base}${P}/profile/login/" method="post"><input type="hidden" name="mode" value="register"><label for="reg-first">First name</label><input id="reg-first" name="first_name" autocomplete="given-name" required><label for="reg-last">Last name</label><input id="reg-last" name="last_name" autocomplete="family-name" required><label for="reg-email">Email</label><input id="reg-email" name="email" type="email" autocomplete="email" required><label for="reg-password">Password</label><input id="reg-password" name="password" type="password" minlength="8" autocomplete="new-password" required><button class="ik-btn">Create profile</button></form></details></div></div>`
}
function profilePage(base, user) {
  const links = [['Purchases', '/customer-service/track-manage-order/'], ['Favorites', '/favorites/'], ['IKEA Family', '/ikea-family/'], ['Gift Cards', '/customer-service/gift-cards-pub3d1efe50/'], ['Privacy & Security', '/customer-service/privacy-security/']]
  return `${head(base, [], user ? `Hej ${user.first_name || ''}!` : 'Hej!', user ? esc(user.email) : 'Log in to see your purchases, favorites and IKEA Family benefits.')}<div class="ik-grid3">${links.map(([t, h]) => `<a class="ik-card" href="${base}${P}${h}"><h2>${esc(t)}</h2><span class="ik-arrow" aria-hidden="true">→</span></a>`).join('')}</div>${user ? `<form action="${base}${P}/profile/logout/" method="post"><button class="ik-btn ik-btn-secondary">Log out</button></form>` : `<p><a class="ik-btn" href="${base}${P}/profile/login/">Log in or sign up</a></p>`}`
}

function infoPage(base, entry) {
  const trail = entry.crumb.length ? [...entry.crumb, [entry.h1]] : []
  return `${head(base, trail, entry.h1, entry.lead)}<div class="ik-article">${entry.sections.map(([h, html]) => `<section><h2>${h}</h2>${html.replaceAll('{base}', base)}</section>`).join('')}</div>${helpBox(base)}`
}

// Sitemap: every department, subcategory, room and main section.
export function sitemapSections() {
  const main = [['Products', '/cat/products-products/'], ['Rooms', '/rooms/'], ['Deals', '/offers/'], ['Design & ideas', '/ideas/'], ['Services', '/customer-service/services/'], ['Shop new arrivals', '/new/new-products/'],
    ['Customer service', '/customer-service/'], ['Track and manage your order', '/customer-service/track-manage-order/'], ['Find a Location', '/stores/'], ['IKEA Family', '/ikea-family/'], ['Gift Cards', '/customer-service/gift-cards-pub3d1efe50/'],
    ['Return Policy', '/customer-service/returns-claims/'], ['Shipping and Delivery service', '/customer-service/services/delivery/'], ['Log in or sign up', '/profile/login/'], ['Shopping bag', '/shoppingcart/'], ['Favorites', '/favorites/']]
  return { main, info: Object.entries(infoPages).map(([path, e]) => [e.h1, path]) }
}
function sitemapPage(base) {
  const { main, info } = sitemapSections()
  const list = items => `<ul class="ik-sitemap-list">${items.map(([t, h]) => `<li><a href="${base}${P}${h}">${esc(t)}</a></li>`).join('')}</ul>`
  return `${head(base, [], 'Site map')}<section class="ik-sec"><h2>Shop</h2>${list(main)}</section><section class="ik-sec"><h2>Products</h2><div class="ik-sitemap-cols">${menuDepartments.map(s => categoryIndex.get(s)).map(d => `<div><h3><a href="${base}${P}/cat/${d.slug}/">${esc(d.title)}</a></h3>${list(d.subs.map(x => [x.title, `/cat/${x.slug}/`]))}</div>`).join('')}</div></section><section class="ik-sec"><h2>Rooms</h2>${list(rooms.map(r => [r.title, `/rooms/${r.slug}/`]))}</section><section class="ik-sec"><h2>Help &amp; information</h2>${list(info)}</section>`
}
export function sitemapPaths() {
  const { main, info } = sitemapSections()
  return ['/', ...main.map(m => P + m[1]), ...[...categoryIndex.keys()].map(s => `${P}/cat/${s}/`), ...rooms.map(r => `${P}/rooms/${r.slug}/`), ...info.map(i => P + i[1]), `${P}/sitemap/`]
}

// Fixture mode keeps the authored catalog routes as the browse/purchase surface.
const fixtureCategory = { 'storage-organization-st001': 'shelving', 'bookcases-shelving-units-st002': 'shelving', 'sofas-armchairs-700640': 'sofas-armchairs', 'sofas-sectionals-fu003': 'sofas-armchairs', 'armchairs-chaises-fu006': 'sofas-armchairs',
  'workspace-desks-chairs-fu004': 'desks-office-chairs', 'desks-computer-desks-20649': 'desks-office-chairs', 'desk-chairs-20652': 'desks-office-chairs', 'gaming-furniture-55002': 'desks-office-chairs', 'lighting-li001': 'work-lights-accessories', 'lamps-light-fixtures-li002': 'work-lights-accessories',
  'tables-chairs-fu002': 'dining-furniture', 'dining-furniture-700417': 'dining-furniture', 'chairs-700676': 'dining-furniture', 'tables-700675': 'dining-furniture', 'cookware-tableware-kt001': 'tableware', 'dinnerware-18860': 'tableware', 'cookware-kt003': 'cookware-utensils',
  'kitchen-appliances-ka001': 'cookware-utensils', 'beds-mattresses-bm001': 'beds-bedside', 'beds-bm003': 'beds-bedside', 'nightstands-20656': 'beds-bedside', 'bedding-tl004': 'bed-linen-curtains', 'curtains-10700': 'bed-linen-curtains', 'window-treatments-tl002': 'bed-linen-curtains',
  'home-textiles-tl001': 'rugs-cushions', 'rugs-10653': 'rugs-cushions', 'decorative-pillows-cushion-covers-10659': 'rugs-cushions', 'home-decor-de001': 'decoration', 'plants-planters-pp001': 'decoration', 'storage-containers-st007': 'small-storage', 'storage-boxes-baskets-10550': 'small-storage',
  'armoires-wardrobes-19053': 'wardrobes-dressers', 'dressers-storage-drawers-st004': 'wardrobes-dressers', 'shoe-cabinets-10456': 'hallway-storage', 'utility-storage-carts-fu005': 'hallway-storage', 'bathroom-ba001': 'bath-textiles', 'bathroom-textiles-tl003': 'bath-textiles', 'baby-kids-bc001': 'children', 'accent-tables-10705': 'living-tables' }
const fixtureRoom = { 'living-room': 'living-room', bedroom: 'bedroom', kitchen: 'kitchen', dining: 'kitchen', 'home-office': 'home-office', 'childrens-room': 'children', bathroom: 'bathroom' }

export function ikeaSite({ render, fixture = false }) {
  const router = Router()
  const base = res => res.locals.base
  const page = (title, fn) => (req, res) => render(req, res, title, fn(base(res), req))
  const go = to => (req, res) => res.redirect(base(res) + to)

  router.get(`${P}`, go('/'))
  router.get(`${P}/`, go('/'))
  if (fixture) {
    router.get(`${P}/cat/products-products/`, go('/products'))
    router.get(`${P}/cat/:slug/`, (req, res, next) => categoryIndex.has(req.params.slug) ? res.redirect(`${base(res)}${fixtureCategory[req.params.slug] ? `/category/${fixtureCategory[req.params.slug]}` : '/products'}`) : next())
    router.get(`${P}/rooms/`, go('/rooms'))
    router.get(`${P}/rooms/:slug/`, (req, res) => res.redirect(`${base(res)}/rooms${fixtureRoom[req.params.slug] ? `/${fixtureRoom[req.params.slug]}` : ''}`))
    router.get(`${P}/offers/`, go('/deals'))
    router.get(`${P}/ideas/`, go('/ideas'))
    router.get(`${P}/new/new-products/`, go('/search?sort=new'))
    router.get(`${P}/customer-service/services/`, go('/services'))
    router.get(`${P}/shoppingcart/`, go('/cart'))
    router.get([`${P}/profile/`, `${P}/profile/login/`], go('/account'))
    router.get(`${P}/favorites/`, go('/favorites'))
  } else {
    router.get('/', page('Furniture, Home Furnishings, Decor & Accessories', b => homePage(b)))
    router.get(`${P}/cat/products-products/`, page('Products', b => productsPage(b)))
    router.get(`${P}/cat/:slug/`, (req, res, next) => {
      const cat = categoryIndex.get(req.params.slug)
      if (!cat) return next()
      render(req, res, cat.title, categoryPage(base(res), cat, req.query))
    })
    router.get(`${P}/rooms/`, page('IKEA Rooms', b => roomsPage(b)))
    router.get(`${P}/rooms/:slug/`, (req, res, next) => {
      const i = rooms.findIndex(r => r.slug === req.params.slug)
      if (i < 0) return next()
      render(req, res, rooms[i].title, roomPage(base(res), rooms[i], i))
    })
    router.get(`${P}/offers/`, page('IKEA Offers, Sales and Deals', (b, req) => offersPage(b, req.query)))
    router.get(`${P}/ideas/`, page('Home ideas and design inspiration', b => ideasPage(b)))
    router.get(`${P}/new/new-products/`, page('Shop new arrivals', (b, req) => newPage(b, req.query)))
    router.get(`${P}/customer-service/services/`, page('Services', b => servicesPage(b)))
    router.get(`${P}/shoppingcart/`, page('Shopping bag', b => `${head(b, [], 'Shopping bag')}<section class="ik-empty-bag"><h2>Your bag is empty</h2><p>When you add products to your shopping bag, they will appear here.</p><a class="ik-btn" href="${b}${P}/cat/products-products/">Continue shopping</a> <a class="ik-btn ik-btn-secondary" href="${b}${P}/profile/login/">Log in or sign up</a></section>`))
    router.get(`${P}/favorites/`, page('Favorites', b => `${head(b, [], 'Favorites')}<section class="ik-empty-bag"><h2>Your list is empty</h2><p>Save the products you love by selecting the heart. Log in to keep your favorites across devices.</p><a class="ik-btn" href="${b}${P}/profile/login/">Log in or sign up</a></section>`))
    router.get(`${P}/profile/`, (req, res) => render(req, res, 'My profile', profilePage(base(res), req.store.user)))
    router.get(`${P}/profile/login/`, page('Log in', b => loginPage(b)))
    router.post(`${P}/profile/login/`, (req, res) => {
      const body = req.body || {}, text = v => typeof v === 'string' ? v.trim() : ''
      const fail = msg => render(req, res, 'Log in', loginPage(base(res), { error: msg, email: text(body.email) }), 400)
      let account
      if (body.mode === 'register') {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text(body.email)) || text(body.password).length < 8 || !text(body.first_name) || !text(body.last_name)) return fail('Enter your name, a valid email and a password of at least 8 characters.')
        account = createAccount('ikea', { email: text(body.email), password: text(body.password), first_name: text(body.first_name), last_name: text(body.last_name) })
        if (account.error) return fail(account.error)
      } else account = authenticate('ikea', body.email, body.password)
      if (!account) return fail('The email or password you entered is incorrect. Please try again.')
      req.store.user = publicAccount(account)
      res.redirect(`${base(res)}${P}/profile/`)
    })
    router.post(`${P}/profile/logout/`, (req, res) => { req.store.user = null; res.redirect(`${base(res)}/`) })
    // Legacy fixture-mode paths stay reachable in reference mode.
    for (const [from, to] of [['/products', '/cat/products-products/'], ['/rooms', '/rooms/'], ['/deals', '/offers/'], ['/ideas', '/ideas/'], ['/services', '/customer-service/services/'], ['/help', '/customer-service/'],
      ['/cart', '/shoppingcart/'], ['/account', '/profile/login/'], ['/favorites', '/favorites/'], ['/lists', '/favorites/'], ['/orders', '/customer-service/track-manage-order/']]) router.get(from, go(P + to))
    router.get('/category/:id', go(`${P}/cat/products-products/`))
    router.get('/rooms/:id', (req, res) => res.redirect(`${base(res)}${P}/rooms/${rooms.some(r => r.slug === req.params.id) ? `${req.params.id}/` : ''}`))
  }
  router.get(`${P}/customer-service/`, page('Customer service', b => customerServicePage(b)))
  router.get(`${P}/stores/`, (req, res) => render(req, res, 'Find an IKEA location near you', storesPage(base(res), req)))
  router.get(`${P}/customer-service/track-manage-order/`, page('Track and manage your order', b => trackPage(b)))
  router.get(`${P}/customer-service/track-manage-order/lookup/`, (req, res) => {
    const order = typeof req.query.order === 'string' ? req.query.order.trim() : '', email = typeof req.query.email === 'string' ? req.query.email.trim() : ''
    const error = !order || !email ? 'Enter your order number and the email or phone number used for the order.' : ''
    const found = !error && listOrders({ store: 'ikea' }).find(o => o.order_number === order && String(o.customer?.email || '').toLowerCase() === email.toLowerCase())
    const result = error ? '' : found ? `<div class="ik-results-empty" role="status" data-order-status="preparing"><h3>Order ${esc(found.order_number)}: Preparing order</h3><p>${found.items.map(i => `${esc(i.title)} × ${i.qty}`).join('<br>')}</p><p>Total $${found.totals.total.toFixed(2)} · ${found.fulfillment.method === 'pickup' ? `Click &amp; Collect at ${esc(found.fulfillment.store_location)}` : 'Delivery'}</p></div>` : `<div class="ik-results-empty" role="status"><h3>We couldn’t find your order</h3><p>No order matching <strong>${esc(order)}</strong> was found for this email or phone number. Check the details and try again.</p></div>`
    render(req, res, 'Track and manage your order', trackPage(base(res), { order, email, error, result }), error ? 400 : 200)
  })
  router.get(`${P}/customer-service/gift-cards-pub3d1efe50/balance/`, (req, res) => {
    const card = typeof req.query.card === 'string' ? req.query.card.replace(/\s+/g, '') : ''
    const msg = /^\d{12,19}$/.test(card) ? `We couldn’t verify a balance for the card ending in ${esc(card.slice(-4))}. Please check the number or visit any IKEA store.` : 'Enter a valid gift card number.'
    render(req, res, 'Gift card balance', `${head(base(res), [['Customer service', '/customer-service/'], ['Gift cards', '/customer-service/gift-cards-pub3d1efe50/'], ['Balance']], 'Gift card balance')}<p class="ik-error" role="status">${msg}</p><p><a class="ik-link" href="${base(res)}${P}/customer-service/gift-cards-pub3d1efe50/">Back to Gift cards</a></p>`, /^\d{12,19}$/.test(card) ? 200 : 400)
  })
  router.get(`${P}/sitemap/`, page('Site map', b => sitemapPage(b)))
  router.get('/sitemap.xml', (req, res) => {
    const urls = sitemapPaths().map(p => `<url><loc>${esc(base(res) + p)}</loc></url>`).join('')
    res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`)
  })
  router.get(`${P}/{*rest}`, (req, res, next) => {
    let path = req.path.slice(P.length)
    if (!path.endsWith('/')) path += '/'
    const entry = infoPages[path]
    if (!entry) return next()
    render(req, res, entry.title || entry.h1, infoPage(base(res), entry))
  })
  return router
}
