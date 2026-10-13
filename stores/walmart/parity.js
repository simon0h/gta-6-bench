// Walmart.com site chrome and non-product pages reproduced for website parity: the department
// tree, all-departments, site map, store directory, gift cards, deals, registry, policy articles
// and local stand-ins for off-site footer destinations. None of these pages add inventory:
// category landing pages only list products the store's catalog already supports.
import { fixtureCatalog } from '../../lib/catalog-policy.js'
import { productPhoto } from '../../lib/product-photos.js'
import { esc } from '../../lib/html.js'
import { PRODUCTS, productPath } from './data.js'
import { DEPARTMENTS } from './catalog.js'
import * as B from './browse.js'
import { ALL_DEPARTMENTS, DEPARTMENT_MENU, SERVICE_MENU, NAV_BAR, FOOTER_LINKS } from './sitetree.js'

// ---- tree index ----
export const TREE = new Map()
for (const [name, path, subs] of ALL_DEPARTMENTS) {
  const dept = { name, path, dept: null, children: [] }
  dept.dept = dept
  TREE.set(path, dept)
  for (const [sub, sp] of subs) {
    if (sp === path) continue
    const node = TREE.get(sp) ?? { name: sub, path: sp, dept, children: [] }
    dept.children.push(node)
    if (!TREE.has(sp)) TREE.set(sp, node)
  }
}
const deptByPath = path => ALL_DEPARTMENTS.find(d => d[1] === path)

const PHOTO = { 'Grocery': 'apples', 'Home, Furniture & Appliances': 'armchair', 'Patio & Garden': 'camping-chair-khaki', 'Home Improvement': 'floor-mop', 'Clothing, Shoes & Accessories': 'hoodie', 'Toys': 'building-bricks', 'Baby & Kids': 'stroller-gray', 'Video Games': 'controller', 'Electronics': 'television', 'Pharmacy, Health & Wellness': 'sunscreen', 'Personal Care': 'citrus-bodywash', 'Beauty': 'lipstick', 'Household Essentials': 'laundry-detergent', 'Sports & Outdoors': 'basketball-orange', 'Pets': 'dog-food', 'School & Office Supplies': 'notebooks', 'Arts, Crafts, Sewing & Party Supplies': 'crayons', 'Movies & TV': 'streaming-player', 'Music & Vinyl': 'vinyl-blue-hour', 'Books': 'book-orchard-house', 'Seasonal & Celebrations': 'cookies' }
const initials = name => name.replace(/[^A-Za-z0-9 ]/g, ' ').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('')
export const roundThumb = name => PHOTO[name] ? productPhoto(PHOTO[name], name) : `<span class="wm-mono" aria-hidden="true">${esc(initials(name))}</span>`

// "Shop by category" tiles as walmart.com shows them on its department pages.
const SHOP_BY = {
  '/cp/electronics/3944': [['TVs & home theater', '/cp/tv-video/1060825', 'television'], ['Home speakers', '/browse/home-audio-theater/3944_77622', 'speaker'], ['Smart home', '/cp/smart-home/1229875', 'smart-plug'], ['Computing & Office', '/cp/computers/3951', 'laptop'], ['PC gaming', '/search?q=pc+gaming', 'gaming-headset'], ['Video games', '/cp/video-games/2636', 'controller'], ['Headphones', '/search?q=headphones', 'headphones'], ['Cell phones', '/cp/cell-phones/1105910', 'smartphone'], ['Cell phone cases', '/search?q=cell+phone+cases', null], ['Wearable tech', '/cp/wearable-technology/1229723', 'smartwatch-black'], ['iPads & tablets', '/cp/ipad-tablets/1078524', 'tablet'], ['Cameras & drones', '/search?q=cameras+and+drones', 'mirrorless-camera']],
  '/cp/video-games/2636': [['PlayStation', '/cp/playstation-5/3475115', 'ps5-console'], ['Xbox', '/cp/xbox-series-x/9206773', 'xbox-console'], ['Nintendo', '/cp/nintendo-switch/4646529', 'handheld-console'], ['Accessories', '/browse/video-games/video-game-accessories/2636_1229019', 'gaming-headset'], ['Virtual Reality', '/browse/video-games/virtual-reality/2636_5454301', 'vr-headset-white'], ['Savings', '/shop/deals/video-games-and-media', null], ['Grand Theft Auto VI', '/search?q=grand+theft+auto+vi', null]],
}
export function shopByCategory(base, path) {
  const list = SHOP_BY[path] ?? (TREE.get(path)?.dept?.children ?? []).filter(n => n.path !== path).map(n => [n.name, n.path, null])
  if (!list.length) return ''
  return `<section class="wm-shop-by"><h2>Shop by category</h2><nav class="wm-cat-tiles" aria-label="Shop by category">${list.map(([name, p, photo]) => `<a href="${base}${p}">${photo ? productPhoto(photo, name) : `<span class="wm-mono" aria-hidden="true">${esc(initials(name))}</span>`}<span>${esc(name)}</span></a>`).join('')}</nav></section>`
}

const crumbs = (base, items) => `<nav class="wm-crumbs" aria-label="Breadcrumb"><a href="${base}/">Home</a>${items.map(([n, p]) => p ? ` / <a href="${base}${p}">${esc(n)}</a>` : ` / <span aria-current="page">${esc(n)}</span>`).join('')}</nav>`

// Products the existing catalog supports for a tree node (often none in reference mode).
function nodeProducts(node) {
  const n = node.name.toLowerCase()
  if (node.dept?.name === 'Video Games') {
    if (n === 'playstation') return PRODUCTS.filter(p => p.kind === 'game' && p.platform === 'ps5')
    if (n === 'xbox') return PRODUCTS.filter(p => p.kind === 'game' && p.platform === 'xbox')
    if (n.includes('accessor')) return PRODUCTS.filter(p => p.department === 'games' && p.kind !== 'game')
    return []
  }
  return PRODUCTS.filter(p => String(p.category).toLowerCase() === n)
}
const emptyCategory = (base, name) => `<section class="wm-empty wm-empty-cat"><svg viewBox="0 0 64 64" aria-hidden="true" width="64" height="64"><circle cx="28" cy="28" r="17" fill="none" stroke="#0053E2" stroke-width="5"/><line x1="41" y1="41" x2="56" y2="56" stroke="#0053E2" stroke-width="6" stroke-linecap="round"/></svg><h2>No items to show in ${esc(name)} right now</h2><p>This simulated store only carries a small assortment, so this Walmart.com category page shows its layout, filters and links without products. ${fixtureCatalog ? '' : 'Product listings here are limited to items with captured source evidence.'}</p><a class="wm-pill" href="${base}/all-departments">Browse all departments</a> <a href="${base}/search?q=grand+theft+auto+vi">Shop Grand Theft Auto VI</a></section>`

export function landingPage({ base, node, query, tile }) {
  const dept = node.dept, isDept = dept === node
  const filters = B.filtersFrom(query)
  const d = isDept ? DEPARTMENTS.find(x => node.path.endsWith(`/${x.id}`)) : null
  const shop = shopByCategory(base, node.path)
  if (d) return B.departmentPage({ base, department: d, filters, page: query.page, tile, crumbs: crumbs(base, [[node.name]]), shopBy: shop, heading: node.name, route: `${base}${node.path}`, empty: emptyCategory(base, node.name) })
  const source = nodeProducts(node)
  const intro = isDept ? `Shop ${node.name.toLowerCase()} at Walmart.com. Explore popular categories below and use filters to narrow your results.` : `Explore ${node.name} in ${dept.name}. Use the filters and sort to narrow your results.`
  return `<div class="wm-landing">${crumbs(base, isDept ? [[node.name]] : [[dept.name, dept.path], [node.name]])}<section class="wm-landing-hero"><div><h1>${esc(node.name)}</h1><p>${esc(intro)}</p></div>${isDept ? roundThumb(node.name) : ''}</section>${shop}${B.listingPage({ base, source, filters, page: query.page, route: `${base}${node.path}`, title: `Shop all ${node.name}`, level: 2, empty: emptyCategory(base, node.name), tile })}</div>`
}

// ---- All Departments ----
export function allDepartmentsPage(base) {
  return `<section class="wm-all-depts"><h1>All Departments</h1><div class="wm-all-depts-grid">${ALL_DEPARTMENTS.map(([name, path, subs]) => `<section><h2><a href="${base}${path}">${esc(name)}</a></h2><ul>${subs.map(([s, p]) => `<li><a href="${base}${p}">${esc(s)}</a></li>`).join('')}</ul></section>`).join('')}</div></section>`
}

// ---- Info pages (services drawer, footer destinations that leave walmart.com, misc) ----
const NOTE = 'This page is a short local summary inside the simulated store; nothing is booked, submitted or sent.'
export const INFO = {
  '/careers': ['Careers at Walmart', 'Careers', ['Walmart hires for roles in stores and clubs, supply chain and distribution, transportation and driving, healthcare, technology and corporate offices.', 'On the real site, job search and applications live on careers.walmart.com, where candidates filter openings by location and job area and track applications.'], [['Our Company', '/our-company'], ['Help', '/help']]],
  '/our-company': ['Our Company', 'About Walmart', ['Walmart Inc. is headquartered in Bentonville, Arkansas. Sam Walton opened the first Walmart store in Rogers, Arkansas, in 1962.', 'The company operates retail stores, clubs and eCommerce sites in many countries, with Walmart U.S., Walmart International and Sam\'s Club as its main segments. Its stated purpose is to help people save money and live better.', 'Corporate news, purpose and sustainability reports, and investor information are published on corporate.walmart.com.'], [['Careers', '/careers'], ['Product Recalls', '/product-recalls'], ['California Supply Chain Act', '/california-transparency']]],
  '/sell-on-walmart': ['Sell on Walmart.com', 'Walmart Marketplace', ['Walmart Marketplace lets approved third-party sellers list items on Walmart.com. Sellers apply, set up a seller profile and manage listings, pricing and orders in Seller Center.', 'Sellers can fulfill orders themselves or use Walmart Fulfillment Services (WFS). Walmart charges a referral fee on each sale that varies by category.'], [['Marketplace help', '/help/article/marketplace-and-services'], ['Brand Shop Directory', '/brand/branddirectory']]],
  '/product-recalls': ['Product Recalls', 'Product safety', ['Walmart publishes product recall notices with the item name, the dates it was sold and what customers should do.', 'Customers can usually return a recalled item to any Walmart store for a refund, or follow the manufacturer\'s instructions in the notice.'], [['Returns & Refunds', '/help/article/walmart-standard-return-policy/adc0dfb692954e67a4de206fb8d9e03a'], ['Safety Data Sheet', '/safety-data-sheet']]],
  '/safety-data-sheet': ['Safety Data Sheet', 'Product safety', ['Safety Data Sheets (SDS) describe the hazards, handling, storage and first-aid measures for chemical products such as cleaners, automotive fluids and pool supplies.', 'On the real site, SDS documents are looked up by product name or item number on Walmart\'s SDS search site.'], [['Product Recalls', '/product-recalls']]],
  '/privacy-notice': ['Walmart Privacy Notice', 'Privacy & security', ['The Walmart Privacy Notice explains what personal information Walmart collects (for example contact details, purchase history, device and location data), how it is used and shared, and the choices customers have.', 'It also describes how to access, correct or delete information and how to contact Walmart about privacy.'], [['Your Privacy Choices', '/privacyrequest'], ['Notice at Collection', '/notice-at-collection'], ['AdChoices', '/adchoices']]],
  '/california-transparency': ['California Transparency in Supply Chains Act', 'Responsible sourcing', ['This disclosure describes Walmart\'s efforts to address forced labor and human trafficking in its supply chain, including supplier standards, audits, certification, internal accountability and training.'], [['Our Company', '/our-company']]],
  '/privacyrequest': ['Your Privacy Choices', 'Privacy & security', ['Customers can ask Walmart to access or delete personal information, and can opt out of the sale or sharing of personal information and of targeted advertising, depending on where they live.', 'Requests are verified before they are processed.'], [['Privacy Notice', '/privacy-notice'], ['Delete Account', '/account/delete-account']]],
  '/notice-at-collection': ['Notice at Collection', 'Privacy & security', ['For California residents, this notice lists the categories of personal information Walmart collects, the purposes it is used for, whether it is sold or shared, and how long it is kept.'], [['Privacy Notice', '/privacy-notice'], ['Your Privacy Choices', '/privacyrequest']]],
  '/adchoices': ['AdChoices', 'Interest-based advertising', ['Walmart and its partners use information about browsing and purchases to show interest-based ads. The AdChoices section of the privacy notice explains how to opt out of interest-based advertising in browsers and apps.'], [['Privacy Notice', '/privacy-notice'], ['Your Privacy Choices', '/privacyrequest']]],
  '/consumer-health-data-privacy-notices': ['Consumer Health Data Privacy Notices', 'Privacy & security', ['These notices explain how Walmart handles consumer health data under state laws such as Washington\'s My Health My Data Act and Nevada\'s consumer health data law, and how to exercise related rights.'], [['Privacy Notice', '/privacy-notice']]],
  '/spark-driver': ['Learn about Spark Driver', 'Deliver with Spark', ['The Spark Driver app lets independent contractors pick up and deliver Walmart orders in their area and earn money on their own schedule.', 'Drivers sign up in the app, which shows available delivery offers and earnings.'], [['Pickup and Delivery', '/help/article/pickup-and-delivery/d0d02a5f54e54592930f110aaf6a2f50']]],
  '/brand/branddirectory': ['Brand Shop Directory', 'Shop by brand', ['The Brand Shop Directory lists brand storefronts on Walmart.com from A to Z. Each brand shop collects that brand\'s items, featured collections and deals.', 'This simulated store does not carry brand inventory; use search to find the items it does list.'], [['All Departments', '/all-departments'], ['Search Grand Theft Auto VI', '/search?q=grand+theft+auto+vi']]],
  '/cp/about-walmart-business/6136230': ['Walmart Business', 'Buying for work?', ['Walmart Business is a purchasing site for organizations such as small businesses, nonprofits, schools and churches, with business accounts, multiple users, tax-exempt purchasing and a Walmart Business+ membership.'], [['Tax Exempt Program', '/cp/tax-exemption-program/8480422'], ['Create an account', '/account/sign-up']]],
  '/cp/walmart-in-the-know/7781927': ['#IYWYK', 'If you know, you know', ['#IYWYK ("If You Know You Know") is Walmart\'s editorial shop of trending fashion, beauty and home finds picked by creators.'], [['Clothing, Shoes & Accessories', '/cp/clothing/5438'], ['Beauty', '/cp/beauty/1085666']]],
  '/cp/tax-exemption-program/8480422': ['Tax Exempt Program', 'Shop tax free', ['Qualifying tax-exempt organizations can enroll their Walmart.com account in the Tax Exempt Program by submitting their exemption certificate. Once approved, eligible online purchases are made without sales tax.', 'This simulated store does not process exemption certificates; checkout always shows estimated tax.'], [['Walmart Business', '/cp/about-walmart-business/6136230'], ['Account & Payments help', '/help/article/payments-and-preorders']]],
  '/cp/walmart-mobile-app/1087865': ['Get the Walmart App', 'It\'s easier in the app', ['The Walmart app lets customers shop, reorder, check in for pickup, track orders, use Walmart Pay and Scan & Go in stores.', 'This simulated store is browser-only; there is no app to download here.'], [['Walmart+', '/plus'], ['Track my order', '/orders']]],
  '/account/delete-account': ['Delete Account', 'Account settings', ['On walmart.com, signed-in customers can request deletion of their Walmart account from account settings. Deletion removes access to purchase history, saved payment methods, lists and registries.', 'This simulated store does not delete accounts. Sign in to manage your local account details.'], [['Sign in or create account', '/account/login'], ['Your Privacy Choices', '/privacyrequest']]],
  '/account/pet-hub': ['Pet Profiles', 'Pets', ['Pet Profiles let signed-in customers save details about their pets to get tailored food, treat and care recommendations.', 'Pet profiles are not stored in this simulated store.'], [['Pets', '/cp/pet-supplies/5440'], ['Sign in or create account', '/account/login']]],
  '/cp/subscriptions/4191733': ['Subscriptions', 'Subscribe and save time', ['Walmart subscriptions schedule recurring deliveries of eligible everyday essentials. Customers choose how often items arrive and manage, skip or cancel deliveries from their account.', 'Subscriptions cannot be created in this simulated store.'], [['Household Essentials', '/cp/household-essentials/1115193'], ['Walmart+', '/plus']]],
  '/cp/restaurants': ['Restaurants', 'Order from restaurants', ['Walmart.com offers ordering from participating restaurants for delivery in eligible areas, with Walmart+ member savings on some partners.', 'Restaurant ordering is not available in this simulated store.'], [['Walmart+', '/plus']]],
  '/cp/resold': ['Resold at Walmart', 'Pre-owned & refurbished', ['Resold at Walmart collects pre-owned, refurbished and open-box items, each with a condition grade and its own return terms.'], [['Electronics', '/cp/electronics/3944'], ['All Departments', '/all-departments']]],
  '/cp/auto-services/1087266': ['Auto Care Center', 'Auto Care Services', ['Walmart Auto Care Centers offer services such as tire installation and rotation, oil changes and battery testing and installation at select stores.', 'Appointments cannot be booked in this simulated store.'], [['Auto & Tires', '/cp/auto-tires/91083'], ['Store Directory', '/store/directory']]],
  '/cp/health-services': ['Health Services', 'Services', ['Walmart offers health services such as immunizations, health screenings and pharmacy consultations at select locations.'], [['Pharmacy', '/cp/pharmacy/5431'], ['Vaccines', '/cp/vaccines']]],
  '/cp/vaccines': ['Vaccines', 'Services', ['Walmart pharmacies offer vaccines such as flu, COVID-19, shingles and others, with online scheduling on walmart.com. Eligibility and availability vary by state and store.'], [['Pharmacy', '/cp/pharmacy/5431']]],
  '/cp/vision-center': ['Vision Center', 'Services', ['Walmart Vision Centers offer eye exams by independent doctors of optometry at many locations, plus eyeglasses and contact lenses.'], [['Store Directory', '/store/directory']]],
  '/cp/benefit-programs': ['Benefit Programs', 'Services', ['Walmart accepts many benefit programs, including EBT/SNAP for eligible groceries online and in stores, and some health plan benefits.'], [['EBT/SNAP eligible food', '/cp/snap-online/1465096']]],
  '/cp/insurance-services': ['Insurance Services', 'Services', ['Walmart provides information on insurance options such as Medicare plans and other coverage through partner services.'], [['Health Services', '/cp/health-services']]],
  '/cp/spark-good': ['Spark Good', 'Give back', ['Spark Good lets customers support local nonprofits and schools, for example through Round Up donations at checkout and community Registry lists.'], [['Gift Registry', '/registry']]],
  '/cp/custom-cakes': ['Custom Cakes', 'Bakery services', ['Walmart bakeries take orders for custom cakes and cupcakes for pickup at select stores, with designs chosen online.'], [['Grocery', '/cp/food/976759']]],
  '/cp/photo-services': ['Photo Services', 'Walmart Photo', ['Walmart Photo offers prints, photo gifts, canvas and same-day pickup on select products.'], [['Services', '/services']]],
  '/cp/protection-services': ['Protection Services', 'Protection plans', ['Protection plans can be added to eligible electronics, appliances and other items to cover repairs or replacement after the manufacturer warranty.'], [['Electronics', '/cp/electronics/3944']]],
  '/cp/home-tech-services': ['Home & Tech Services', 'Services', ['Walmart offers assembly, installation and tech setup services from partner providers for eligible purchases in many areas.'], [['Services', '/services']]],
}
export function infoPage(base, path) {
  const [title, eyebrow, paras, links] = INFO[path]
  return `<section class="wm-info-page">${crumbs(base, [[title]])}<div class="wm-service-hero"><p>${esc(eyebrow)}</p><h1>${esc(title)}</h1></div><div class="wm-info-body"><article>${paras.map(p => `<p>${esc(p)}</p>`).join('')}<p class="wm-fine">${NOTE}</p></article><aside><h2>Related</h2>${links.map(([l, p]) => `<a href="${base}${p}">${esc(l)}</a>`).join('')}<a href="${base}/help">Help &amp; customer support</a></aside></div></section>`
}

// ---- help articles with walmart.com ids ----
export const HELP_ARTICLES = {
  'walmart-standard-return-policy/adc0dfb692954e67a4de206fb8d9e03a': ['Walmart Standard Return Policy', 'Returns & Refunds', [
    ['Walmart Standard Return Policy', 'Most products Walmart sells can be returned. Your Walmart.com Purchase History shows the latest date an item is eligible for a return or replacement.'],
    ['Returning items purchased on Walmart.com', 'Most items bought on Walmart.com can be returned within 90 days. Items sold and shipped by Marketplace sellers usually have a 30-day window. Start a return from Purchase History.'],
    ['In store purchases', 'In-store purchases also usually have a 90-day window, but most consumer electronics must be returned within 30 days and wireless phones within 14 days. Bring your receipt.'],
    ['Extended holiday returns', 'Most items bought in stores or online between October 1 and December 31 can be returned until January 31. Marketplace seller participation varies.'],
    ['Damaged or defective items', 'Damaged or defective items may qualify for a refund or replacement when you start the return in the app or Purchase History. Items bought from outside dealers or resellers are not eligible.'],
    ['Walmart Financial Services', 'Prepaid cards, money transfers and other financial services follow their own terms and are generally not returnable.'],
  ]],
  'pickup-and-delivery/d0d02a5f54e54592930f110aaf6a2f50': ['Pickup and Delivery', 'Your Order', [
    ['Pickup Orders', 'Order online, choose a pickup time and store associates gather your items. Check in with the app or the link in your email or text, park in a Curbside Pickup spot and an associate brings your order out.'],
    ['Delayed or Canceled Pickup Orders', 'If a pickup order is delayed or canceled you are notified by email or in the app and are not charged for items you do not receive.'],
    ['Delivery Orders', 'Confirm your address is eligible, choose a delivery window and pay. Local drivers deliver from your store; some deliveries need a four-digit PIN.'],
    ['Delivery of Your Order', 'Deliveries are made by local third-party drivers and can take up to two hours within the chosen window.'],
    ['Delayed or Canceled Delivery Orders', 'Delayed or canceled delivery and InHome orders can be rescheduled, switched to pickup, or canceled without a charge. In this simulated store only shipping is available.'],
  ]],
  'walmart-com-terms-of-use/3b75080af40340d6bbd596f116fae5a0': ['Walmart.com Terms of Use', 'Terms of Use', [
    ['1. Introduction', 'These terms govern use of Walmart.com, the Walmart apps and related services ("Walmart Sites"). Using the sites means you accept the terms.'],
    ['2. Your Use of the Walmart Sites', 'The sites are for personal, non-commercial use. You must not misuse the sites, interfere with their operation or access them by automated means without permission.'],
    ['3. Content and Ideas', 'Reviews, questions and other content you submit must be accurate and lawful; Walmart may use content you submit.'],
    ['4. Monitoring by Walmart', 'Walmart may monitor and remove content and activity that breaks the terms.'],
    ['5. Materials Available on the Walmart Sites', 'Site content is owned by Walmart or its licensors and is protected by intellectual property laws.'],
    ['6. Merchandise', 'Product descriptions, prices and availability can change, and Walmart may limit quantities.'],
    ['7. Third Party Sites', 'Links to other sites are provided for convenience; Walmart is not responsible for their content.'],
    ['8. Placing an Order', 'An order is an offer to buy; Walmart may accept, cancel or limit orders. Preorder items are charged when they ship, with the Preorder Price Guarantee.'],
  ]],
  'responsible-disclosure-and-accessibility-policies/0f173dab8bd942da84b1cd7ab5ffc3cb': ['Responsible Disclosure and Accessibility Policies', 'Policies', [
    ['Accessibility', 'Walmart aims to make its websites and apps accessible to everyone, including people who use assistive technology, and follows recognized accessibility guidelines.'],
    ['Need help?', 'Customers who have trouble using the site can contact Customer Care for help placing an order.'],
    ['Responsible Disclosure', 'Security researchers can report potential vulnerabilities in Walmart sites through Walmart\'s responsible disclosure program.'],
  ]],
}
export function helpArticlePage(base, key) {
  const [title, topic, sections] = HELP_ARTICLES[key]
  return `<div class="wm-help-article">${crumbs(base, [['Help', '/help'], [topic]])}<p class="wm-help-kicker">Help &amp; customer support</p><article class="wm-card"><h1>${esc(title)}</h1>${sections.map(([h, p], i) => (i === 0 && h === title ? '' : `<h2>${esc(h)}</h2>`) + `<p>${esc(p)}</p>`).join('')}</article><section class="wm-card"><h2>Was this article helpful?</h2><p><a href="${base}/help/contact">Give feedback</a></p></section><section><h2>Related help topics</h2><nav class="wm-help-related">${Object.entries(HELP_ARTICLES).filter(([k]) => k !== key).map(([k, [t]]) => `<a href="${base}/help/article/${k}">${esc(t)}</a>`).join('')}</nav></section></div>`
}

// ---- store directory ----
export const US_STATES = [['AL', 'Alabama'], ['AK', 'Alaska'], ['AZ', 'Arizona'], ['AR', 'Arkansas'], ['CA', 'California'], ['CO', 'Colorado'], ['CT', 'Connecticut'], ['DE', 'Delaware'], ['DC', 'District of Columbia'], ['FL', 'Florida'], ['GA', 'Georgia'], ['HI', 'Hawaii'], ['ID', 'Idaho'], ['IL', 'Illinois'], ['IN', 'Indiana'], ['IA', 'Iowa'], ['KS', 'Kansas'], ['KY', 'Kentucky'], ['LA', 'Louisiana'], ['ME', 'Maine'], ['MD', 'Maryland'], ['MA', 'Massachusetts'], ['MI', 'Michigan'], ['MN', 'Minnesota'], ['MS', 'Mississippi'], ['MO', 'Missouri'], ['MT', 'Montana'], ['NE', 'Nebraska'], ['NV', 'Nevada'], ['NH', 'New Hampshire'], ['NJ', 'New Jersey'], ['NM', 'New Mexico'], ['NY', 'New York'], ['NC', 'North Carolina'], ['ND', 'North Dakota'], ['OH', 'Ohio'], ['OK', 'Oklahoma'], ['OR', 'Oregon'], ['PA', 'Pennsylvania'], ['RI', 'Rhode Island'], ['SC', 'South Carolina'], ['SD', 'South Dakota'], ['TN', 'Tennessee'], ['TX', 'Texas'], ['UT', 'Utah'], ['VT', 'Vermont'], ['VA', 'Virginia'], ['WA', 'Washington'], ['WV', 'West Virginia'], ['WI', 'Wisconsin'], ['WY', 'Wyoming']]
export function storeDirectoryPage(base) {
  return `<section class="wm-store-dir">${crumbs(base, [['Store Directory']])}<h1>Walmart Store Directory</h1><h2>Walmart Stores in U.S.</h2><ul class="wm-state-list">${US_STATES.map(([c, n]) => `<li><a href="${base}/store-directory/${c.toLowerCase()}">${n}</a></li>`).join('')}</ul><p><a class="wm-pill" href="${base}/store-finder">Find a store near you</a></p></section>`
}
export function statePage(base, code) {
  const s = US_STATES.find(([c]) => c.toLowerCase() === code); if (!s) return null
  return `<section class="wm-store-dir">${crumbs(base, [['Store Directory', '/store/directory'], [s[1]]])}<h1>Walmart Stores in ${esc(s[1])}</h1><p>Real store addresses, hours and services are not captured in this simulated store. Search by ZIP code to choose one of the sample stores used for browsing.</p><form class="wm-card wm-inline-form" action="${base}/store-finder" method="get"><label for="state-zip">ZIP code</label><input id="state-zip" name="zip" inputmode="numeric" pattern="[0-9]{5}" maxlength="5" autocomplete="postal-code" required><button class="wm-pill">Find stores</button></form><a href="${base}/store/directory">All states</a></section>`
}

// ---- gift cards ----
export function giftCardsPage(base) {
  const cats = TREE.get('/cp/gift-cards/96894').children
  const faq = [['How do I use a Walmart gift card online?', 'Choose Gift card as the payment method at checkout and enter the card number and PIN. Gift cards cannot be used in this simulated store.'], ['How do I check my Walmart gift card balance?', 'Use Check your gift card balance on this page, the Walmart app, or the receipt from your last purchase.'], ['Where can I find the PIN on a plastic Walmart gift card?', 'Scratch off the coating on the back of the card to reveal the PIN.'], ['What happens if my Walmart gift card is lost or stolen?', 'Treat gift cards like cash. Contact Customer Care with your purchase receipt; balances on lost cards may not be recoverable.'], ['How can I help protect my Walmart.com account?', 'Never share gift card numbers or PINs with anyone asking for payment by gift card. Walmart will never ask you to pay with a gift card over the phone.']]
  return `<div class="wm-giftcards">${crumbs(base, [['Gift Cards']])}<section class="wm-gc-hero"><div><p class="wm-eyebrow">Gift Cards</p><h1>Shop Walmart Gift Cards: Physical &amp; eGift Options</h1><p>Send by email, deliver to their door or pick them up in store.</p><a class="wm-pill wm-pill-white" href="${base}/account/giftcards/balance">Check card balance</a></div><div class="wm-gc-card" aria-hidden="true">${'<span></span>'.repeat(1)}<b>Walmart</b></div></section>
  <section class="wm-shop-by"><h2>Shop by category</h2><nav class="wm-cat-tiles">${cats.map(n => `<a href="${base}${n.path}"><span class="wm-mono wm-mono-gc" aria-hidden="true">${esc(initials(n.name))}</span><span>${esc(n.name)}</span></a>`).join('')}</nav></section>
  <section class="wm-gc-row"><h2>Shop by ocassion</h2><nav class="wm-chip-row">${[['Birthday', 'birthday gift cards'], ['Thank you', 'thank you gift cards'], ['Congratulations', 'congratulations gift cards'], ['Holiday', 'holiday gift cards']].map(([l, q]) => `<a class="wm-chip" href="${base}/search?q=${encodeURIComponent(q)}">${l}</a>`).join('')}</nav></section>
  <section class="wm-gc-grid"><article><h2>Gifting made easy</h2><h3>For hosting, celebrating &amp; beyond.</h3><a href="${base}/browse/gifts-registry/restaurant-gift-cards/1094765_96894_8922996_8305131">Restaurant gift cards</a></article><article><h2>Where will you go next?</h2><h3>Options for every adventure.</h3><a href="${base}/browse/gifts-registry/travel-gift-cards/1094765_96894_8922996_9617007">Travel gift cards</a></article><article><h2>Check your gift card balance</h2><p>Enter the card number and PIN to see what's left to spend.</p><a class="wm-pill" href="${base}/account/giftcards/balance">Check balance</a></article><article><h2>Buy gift cards in bulk</h2><p>Corporate and bulk gift card orders are handled by Walmart's corporate gift card program.</p><a href="${base}/cp/about-walmart-business/6136230">Walmart Business</a></article></section>
  <section><h2>Brand favorites</h2><nav class="wm-chip-row">${cats.slice(0, 6).map(n => `<a class="wm-chip" href="${base}${n.path}">${esc(n.name)}</a>`).join('')}</nav></section>
  <section class="wm-gc-ways"><h2>Gift cards your way</h2><div><article><h3>Send by email</h3><p>eGift cards arrive by email, often within minutes.</p></article><article><h3>Deliver to their door</h3><p>Plastic gift cards ship free to the recipient.</p></article><article><h3>Get 'em from the store</h3><p>Pick up gift cards at the register in any Walmart store.</p></article></div></section>
  <section class="wm-faq"><h2>Using Walmart gift cards</h2>${faq.map(([q, a]) => `<details><summary><h3>${esc(q)}</h3></summary><p>${esc(a)}</p></details>`).join('')}</section>
  <section><h2>Gift card help &amp; info</h2><nav class="wm-help-related"><a href="${base}/account/giftcards/balance">Check card balance</a><a href="${base}/help/article/walmart-com-terms-of-use/3b75080af40340d6bbd596f116fae5a0">Terms &amp; conditions</a><a href="${base}/privacy-notice">Fraud protection</a><a href="${base}/plus">Walmart+ member rewards</a></nav></section>
  <section class="wm-about"><h2>About Shop Walmart Gift Cards: Physical &amp; eGift Options - Walmart.com</h2><p>Walmart gift cards and eGift cards can be used on Walmart.com, in the Walmart app and in Walmart and Sam's Club stores. Third-party brand gift cards for restaurants, travel, gaming and entertainment are also sold. This simulated store lists no gift cards for sale.</p></section></div>`
}
export function balancePage(base, { values = {}, error = '', result = '' } = {}) {
  return `<section class="wm-simple wm-balance">${crumbs(base, [['Gift Cards', '/cp/gift-cards/96894'], ['Check balance']])}<h1>Check your gift card balance</h1>${error ? `<p class="wm-error-summary" role="alert">${esc(error)}</p>` : ''}${result ? `<p class="wm-card" role="status">${esc(result)}</p>` : ''}<form class="wm-card" method="post" action="${base}/account/giftcards/balance"><div class="wm-field"><label for="gc-number">Gift card number</label><input id="gc-number" name="number" inputmode="numeric" autocomplete="off" maxlength="19" value="${esc(values.number ?? '')}" required></div><div class="wm-field"><label for="gc-pin">PIN</label><input id="gc-pin" name="pin" inputmode="numeric" autocomplete="off" maxlength="8" required></div><button class="wm-pill" type="submit">Check balance</button></form><p class="wm-fine">Find the PIN by scratching off the coating on the back of a plastic card. eGift card numbers and PINs are in the email you received.</p></section>`
}

// ---- deals ----
export function dealsPage(base) {
  const chips = [['Rollbacks & More', '/shop/savings'], ['Clearance', '/shop/deals/clearance'], ['Flash Deals', '/shop/deals/flash-deals'], ['Grocery', '/cp/food/976759'], ['Electronics', '/cp/electronics/3944'], ['Beauty', '/cp/beauty/1085666'], ['Home', '/cp/home/4044'], ['Fashion', '/cp/clothing/5438'], ['Patio & Garden', '/cp/patio-garden/5428'], ['Household Essentials', '/cp/household-essentials/1115193'], ['Toys', '/cp/toys/4171'], ['Sports & Outdoors', '/cp/sports-and-outdoors/4125'], ['Baby', '/cp/baby-products/5427'], ['Pets', '/cp/pet-supplies/5440'], ['Home Improvement', '/cp/home-improvement/1072864'], ['Health & Wellness', '/cp/health/976760'], ['Auto & Tires', '/cp/auto-tires/91083'], ['Video Games', '/shop/deals/video-games-and-media']]
  const tiles = [['Flash Deals', '/shop/deals/flash-deals', 'Up to 65% off'], ['Rollbacks & More', '/shop/savings', 'Lower prices on everyday favorites'], ['Clearance', '/shop/deals/clearance', 'Final markdowns'], ['Best Sellers', '/shop/best-sellers', 'What everyone is buying']]
  return `<div class="wm-deals">${crumbs(base, [['Deals']])}<section class="wm-deals-hero"><p class="wm-eyebrow">Shop Deals &amp; More</p><h1>Deals</h1><p>Rollbacks, clearance and Flash Deals across every department.</p></section><nav class="wm-chip-row wm-deal-chips" aria-label="Deal categories">${chips.map(([l, p]) => `<a class="wm-chip" href="${base}${p}">${esc(l)}</a>`).join('')}</nav>
  <section><div class="wm-section-head"><h2>Must-haves for less</h2></div><div class="wm-deal-tiles">${tiles.map(([l, p, s]) => `<a href="${base}${p}"><span class="wm-deal-flag">Deal</span><h3>${esc(l)}</h3><p>${esc(s)}</p><span class="wm-text-cta">Shop now</span></a>`).join('')}</div></section>
  <section class="wm-deals-split"><article><h2>Shopping, simplified</h2><p>Save items to a list, set your pickup or shipping preference and check Purchase History for order updates.</p><a href="${base}/lists">Lists</a> · <a href="${base}/orders">Purchase History</a></article><article><h2>Get inspired</h2><p>Browse departments for seasonal ideas and everyday low prices.</p><a href="${base}/all-departments">All Departments</a></article></section>
  <section class="wm-about"><h2>How to plan your Fall Deals shopping</h2><p>Make a list of what you need, compare prices across Rollbacks and Clearance, and check Flash Deals often because they are limited-time offers while supplies last.</p><h2>Choosing between online, in-store, and app-exclusive options</h2><p>Some deals are online only, some are in stores only, and some are available in the Walmart app. Each item page shows how you can get it. This simulated store shows deal categories but has no discounted inventory.</p></section></div>`
}

// ---- registry ----
export function registryPage(base) {
  return `<div class="wm-registry">${crumbs(base, [['Registry']])}<section class="wm-reg-hero"><div><p class="wm-eyebrow">Walmart Registry</p><h1>Gift Registry | Walmart.com</h1><h2>Gifts for life’s big moments</h2><p>Ready, set, celebrate! Create a registry for a wedding, baby, birthday or any occasion.</p></div></section>
  <section class="wm-gc-grid"><article><h2>Create your registry</h2><p>Sign in, choose an event type and add items you love.</p><a class="wm-pill" href="${base}/account/login?state=%2Fregistries">Create registry</a></article><article><h2>Manage your registry</h2><p>Update items, see what was purchased and share your registry.</p><a class="wm-pill wm-pill-white" href="${base}/my-registries">Manage registry</a></article><article><h2>Find a registry</h2><form action="${base}/registry" method="get"><label for="reg-name">Registrant name</label><input id="reg-name" name="name" autocomplete="name"><button class="wm-pill wm-pill-sm">Find</button></form></article></section>
  <section><h2>Your registry benefits</h2><ul class="wm-benefits"><li>Universal registry: add items from other stores</li><li>Free shipping on eligible registry items</li><li>Easy returns on gifts</li><li>Completion discount on remaining items</li></ul></section>
  <section><h2>Spark Good when you shop</h2><p>Two ways to support favorite causes: add a charity to your registry, or round up purchases for a local nonprofit. <a href="${base}/cp/spark-good">Learn about Spark Good</a></p></section>
  <section class="wm-faq"><h2>Registry FAQs</h2><details><summary><h3>How do I know a gift has been purchased?</h3></summary><p>Purchased items are marked on your registry and listed in your registry activity.</p></details><details><summary><h3>I purchased the gift from another retailer, how do I change the item to purchased on the registry?</h3></summary><p>Open the item on the registry and mark it as purchased.</p></details><details><summary><h3>I am purchasing items in-store, how do I checkout so my gift is marked as purchased on the registry?</h3></summary><p>Print or show the registry item list at the register so the items are scanned against the registry.</p></details></section>
  <p class="wm-fine">Public registries are not connected in this simulated store; use a private list to collect gift ideas.</p></div>`
}

// ---- site map ----
export function sitemapPage(base) {
  const block = (title, links) => `<section><h2>${esc(title)}</h2><ul>${links.map(([l, p]) => `<li><a href="${base}${p}">${esc(l)}</a></li>`).join('')}</ul></section>`
  const services = SERVICE_MENU
  const customer = [['Help', '/help'], ['Purchase History', '/orders'], ['Store Directory', '/store/directory'], ['Store finder', '/store-finder'], ['Gift Cards', '/cp/gift-cards/96894'], ['Check gift card balance', '/account/giftcards/balance'], ['Gift Registry', '/registry'], ['Walmart+', '/plus'], ['Deals', '/shop/deals'], ['Lists', '/lists'], ['My Items', '/my-items'], ['Services', '/services'], ['Account', '/account'], ['Cart', '/cart']]
  return `<section class="wm-sitemap"><h1>Site Map</h1><p>Every department, service and customer page on this store.</p><h2>Departments</h2><div class="wm-all-depts-grid">${ALL_DEPARTMENTS.map(([name, path, subs]) => `<section><h3><a href="${base}${path}">${esc(name)}</a></h3><ul>${subs.filter(([, p]) => p !== path).map(([s, p]) => `<li><a href="${base}${p}">${esc(s)}</a></li>`).join('')}</ul></section>`).join('')}</div><div class="wm-sitemap-cols">${block('Customer service & shopping', customer)}${block('Services', services)}${block('About Walmart & policies', FOOTER_LINKS.filter(([, p]) => !['/all-departments', '/help', '/store/directory'].includes(p)))}${block('Help articles', Object.entries(HELP_ARTICLES).map(([k, [t]]) => [t, `/help/article/${k}`]))}</div></section>`
}
export function sitemapXml(base) {
  const paths = new Set(['/', '/all-departments', '/sitemap', '/search?q=grand+theft+auto+vi', ...PRODUCTS.map(p => productPath('', p)), ...TREE.keys(), ...Object.keys(INFO), ...SERVICE_MENU.map(s => s[1]), ...NAV_BAR.map(s => s[1]), ...DEPARTMENT_MENU.map(s => s[1]), ...FOOTER_LINKS.map(s => s[1]), ...Object.keys(HELP_ARTICLES).map(k => `/help/article/${k}`), '/help', '/store/directory', '/store-finder', '/cp/gift-cards/96894', '/account/giftcards/balance', '/shop/deals', '/registry', '/plus', '/services', '/cart', '/account/login', '/orders', '/lists', '/my-items'])
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...paths].map(p => `<url><loc>${esc(base + p)}</loc></url>`).join('\n')}\n</urlset>\n`
}

// ---- routes ----
export function installParity(router, { render, tile }) {
  const page = (req, res, title, body) => render(req, res, { title: `${title} - Walmart.com`, body })
  router.get('/all-departments', (req, res) => page(req, res, 'All Departments', allDepartmentsPage(res.locals.base)))
  router.get('/sitemap', (req, res) => page(req, res, 'Site Map', sitemapPage(res.locals.base)))
  router.get('/sitemap.xml', (req, res) => res.type('application/xml').send(sitemapXml(res.locals.base)))
  router.get('/store/directory', (req, res) => page(req, res, 'Walmart Store Directory', storeDirectoryPage(res.locals.base)))
  router.get('/store-directory/:state', (req, res, next) => { const body = statePage(res.locals.base, String(req.params.state).toLowerCase()); if (!body) return next(); page(req, res, 'Walmart Store Directory', body) })
  router.get('/cp/gift-cards/96894', (req, res) => page(req, res, 'Shop Walmart Gift Cards: Physical & eGift Options', giftCardsPage(res.locals.base)))
  router.get('/account/giftcards/balance', (req, res) => page(req, res, 'Check gift card balance', balancePage(res.locals.base)))
  router.post('/account/giftcards/balance', (req, res) => {
    const number = String(req.body?.number ?? '').replace(/\s/g, ''), pin = String(req.body?.pin ?? '').trim()
    const error = !/^\d{16}$/.test(number) ? 'Enter a valid 16-digit gift card number.' : !/^\d{4,8}$/.test(pin) ? 'Enter the PIN from the back of your card.' : ''
    // Never echo the full card number.
    const result = error ? '' : `Gift card ending in ${number.slice(-4)}: balances are not connected in this simulated store, so no balance can be shown.`
    render(req, res, { title: 'Check gift card balance - Walmart.com', status: error ? 400 : 200, body: balancePage(res.locals.base, { values: error ? { number: '' } : {}, error, result }) })
  })
  router.get('/shop/deals', (req, res) => page(req, res, 'Shop Deals & More', dealsPage(res.locals.base)))
  router.get('/registry', (req, res) => page(req, res, 'Gift Registry', registryPage(res.locals.base)))
  router.get('/my-registries', (req, res) => res.redirect(`${res.locals.base}/registries`))
  router.get('/help/article/:slug/:id', (req, res, next) => { const key = `${req.params.slug}/${req.params.id}`; if (!Object.hasOwn(HELP_ARTICLES, key)) return next(); page(req, res, HELP_ARTICLES[key][0], helpArticlePage(res.locals.base, key)) })
  for (const path of Object.keys(INFO)) router.get(path, (req, res) => page(req, res, INFO[path][0], infoPage(res.locals.base, path)))
  // Department / category landing pages from the walmart.com tree.
  const SKIP = new Set(['/shop/savings', '/cp/pharmacy/5431', '/plus'])
  router.use((req, res, next) => {
    if (req.method !== 'GET' || SKIP.has(req.path)) return next()
    const node = TREE.get(req.path); if (!node) return next()
    page(req, res, node.name, landingPage({ base: res.locals.base, node, query: req.query, tile }))
  })
}
