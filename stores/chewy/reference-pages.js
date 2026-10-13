// Reference-mode pages for the Chewy clone. These reproduce www.chewy.com's
// navigation, landing pages, help/policy content and account entry points
// (captured 2026-10-13). Listing areas show the Chewy assortment from
// shelf.js (real brands, typical prices) so the store reads like chewy.com;
// it is kept apart from the evidence-backed catalog, and every purchase is
// recorded as a kind:'other' order line. Chewy sells no video games.
import { Router } from 'express'
import { esc } from '../../lib/html.js'
import { authenticate, createAccount, publicAccount } from '../../lib/accounts.js'
import { chewyReferenceChrome, PHONE, paw } from './reference-layout.js'
import {
  TOP_NAV, DOG_MENU, CAT_MENU, OTHER_ANIMALS_MENU, PHARMACY_MENU, SERVICES_MENU, EDUCATION_MENU, PICKS_MENU,
  GIVE_BACK_MENU, BRANDS, PET_TILES, POPULAR_CATEGORIES, SORTS, CATEGORIES, DEALS, DEAL_TILE_PATH, FOOTER, LEGAL, idOf,
} from './reference-data.js'
import { SHELF, SHELF_BY_ID, categoryProducts, dealProducts, brandProducts, pickProducts, searchShelf } from './shelf.js'
import { productCard, productRow, listingFilters, listingResults, productPage, cartPage, cartCount, addToCart, updateLine, checkoutPage, placeOrder, confirmationPage, orderHistory, shelfArt } from './shelf-pages.js'

const str = v => (typeof v === 'string' ? v.trim() : '')
const slugify = s => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const crumbs = (base, list) => `<nav class="cw-crumbs" aria-label="Breadcrumb"><ol><li><a href="${base}/">Chewy</a></li>${list.map(([l, p], i) => i === list.length - 1 && !p ? `<li aria-current="page">${esc(l)}</li>` : `<li><a href="${base}${p}">${esc(l)}</a></li>`).join('')}</ol></nav>`
const tile = (base, label, path, cls = '') => `<a class="cw-tile ${cls}" href="${base}${path}"><span class="cw-tile-art cw-art-${slugify(label).split('-')[0]}">${paw(46)}</span><span>${esc(label)}</span></a>`
const tiles = (base, list, cls) => `<div class="cw-tiles">${list.map(([l, p]) => tile(base, l, p, cls)).join('')}</div>`
const faq = list => `<div class="cw-faq">${list.map(([q, a]) => `<details><summary><h3>${esc(q)}</h3></summary><p>${esc(a)}</p></details>`).join('')}</div>`
const sections = list => list.map(([h, ...ps]) => `<section class="cw-copy-section"><h2>${esc(h)}</h2>${ps.map(p => Array.isArray(p) ? `<ul>${p.map(li => `<li>${li}</li>`).join('')}</ul>` : `<p>${p}</p>`).join('')}</section>`).join('')
const notCaptured = (base, what = 'this category') => `<div class="cw-empty" data-catalog-state="listings-not-captured"><span class="cw-empty-art">${paw(64)}</span><h2>Product listings aren’t available in this replica</h2><p>This page reproduces Chewy’s layout, navigation and filters for ${esc(what)}. Chewy’s product inventory was not captured for this benchmark store, so no items, prices or ratings are shown. This is not Chewy reporting that ${esc(what)} has no products.</p><p><a class="cw-btn" href="${base}/deals/todays-deals-2723">Shop Today's Deals</a> <a class="cw-btn cw-btn-outline" href="${base}/app/site-map">Browse the site map</a></p></div>`

const FILTER_OPTIONS = {
  Autoship: ['Autoship eligible'], Brand: BRANDS.slice(0, 6).map(b => b.label), 'Breed Size': ['Extra Small', 'Small', 'Medium', 'Large', 'Extra Large'],
  Price: ['Under $10', '$10 - $25', '$25 - $50', '$50 - $100', '$100 & Above'], 'Customer Rating': ['4 Stars & Up', '3 Stars & Up', '2 Stars & Up', '1 Star & Up'],
  'Deals & Savings': ['Deals', 'Autoship deals'], Pet: ['Dog', 'Cat', 'Horse', 'Small Pet', 'Bird'], 'Food Form': ['Dry', 'Wet', 'Fresh', 'Freeze-Dried'],
}
function filterPanel(base, path, req, groups, entry) {
  const lifestage = entry.animal === 'Cat' ? ['Kitten', 'Adult', 'Senior'] : ['Puppy', 'Adult', 'Senior']
  const options = name => name === 'Lifestage' ? lifestage : (name === 'Category' || name === 'Product Category') ? (entry.tiles || []).map(t => t[0]).slice(0, 8) : FILTER_OPTIONS[name] || []
  return `<form class="cw-filters" id="cw-filters" method="get" action="${base}${path}"><h2>Filter</h2>${groups.map(name => {
    const key = `f_${slugify(name)}`, chosen = str(req.query[key]), opts = options(name)
    return `<details class="cw-filter"${chosen ? ' open' : ''}><summary>${esc(name)}</summary>${opts.length ? `<fieldset><legend class="cw-sr">${esc(name)}</legend>${opts.map((o, i) => `<label><input type="radio" name="${key}" value="${esc(o)}"${chosen === o ? ' checked' : ''}> ${esc(o)}</label>`).join('')}</fieldset>` : '<p class="cw-muted">Filter values for this group were not captured.</p>'}</details>`
  }).join('')}<button class="cw-btn" type="submit">Apply filters</button> <a href="${base}${path}">Clear all</a></form>`
}
function resultsBar(base, path, req) {
  const sort = SORTS.includes(str(req.query.sort)) ? str(req.query.sort) : 'Relevance'
  const chosen = Object.entries(req.query).filter(([k, v]) => k.startsWith('f_') && str(v))
  return `<div class="cw-results-bar"><p class="cw-results-count">Listings not captured</p><label for="cw-sort">Sort By</label><select id="cw-sort" name="sort" form="cw-filters">${SORTS.map(s => `<option${s === sort ? ' selected' : ''}>${esc(s)}</option>`).join('')}</select><button class="cw-btn cw-btn-outline" form="cw-filters" type="submit">Sort</button></div>${chosen.length ? `<p class="cw-chips">${chosen.map(([, v]) => `<span>${esc(v)}</span>`).join('')} <a href="${base}${path}">Clear all</a></p>` : ''}`
}

function categoryPage(base, path, req, entry, products = null) {
  const groups = entry.filters || (entry.animal === 'Dog' ? ['Autoship', 'Brand', 'Breed Size', 'Product Category', 'Lifestage', 'Price', 'Customer Rating'] : entry.animal === 'Cat' ? ['Autoship', 'Brand', 'Product Category', 'Lifestage', 'Price', 'Customer Rating'] : ['Brand', 'Product Category', 'Price', 'Customer Rating'])
  const banner = entry.banner ? `<section class="cw-banner"><div><p class="cw-eyebrow">Chewy</p><h2>${esc(entry.banner)}</h2><a class="cw-btn" href="${base}/deals/todays-deals-2723">Shop now</a></div>${paw(120)}</section>` : ''
  const related = (entry.tiles || []).slice(0, 6)
  const pharmacy = entry.pharmacy ? `<section class="cw-steps"><h2>Filling their prescription is simple</h2><ol><li><h3>1) Check their meds</h3><p>Add your pet’s prescriptions to your cart and tell us about your pet and your vet at checkout.</p></li><li><h3>2) Checkout</h3><p>Choose Autoship or Buy once. Chewy contacts your vet to approve the prescription.</p></li><li><h3>3) Review & delivery</h3><p>Licensed pharmacists review the order and it ships once approved, typically within 3–5 days.</p></li></ol></section><section class="cw-callout"><h2>Any questions?</h2><p>Licensed pharmacists are available 24/7 at <a href="${base}/customer-care">${PHONE}</a>. Learn <a href="${base}/b/pharmacy-15697">how Chewy Pharmacy works</a> or <a href="${base}/app/content/pharmacy">ordering prescription and veterinary diet items</a>.</p></section>` : ''
  return `${crumbs(base, [...(entry.crumbs || []), [entry.h1]])}<h1 class="cw-page-title">${esc(entry.h1)}</h1>${entry.tiles?.length ? tiles(base, entry.tiles) : ''}${banner}${pharmacy}<div class="cw-plp">${products?.length ? `${listingFilters(base, path, req, groups, products, entry)}${listingResults(base, path, req, products, entry.h1)}` : `${filterPanel(base, path, req, groups, entry)}<section class="cw-results" aria-label="${esc(entry.h1)} results">${resultsBar(base, path, req)}${notCaptured(base, entry.h1)}</section>`}</div>${related.length ? `<section class="cw-related"><h2>Related Searches</h2><p>${related.map(([l, p]) => `<a href="${base}${p}">${esc(l)}</a>`).join('')}</p></section>` : ''}<section class="cw-seo"><h2>${esc(entry.h1)}</h2><p>Shop ${esc(entry.h1.toLowerCase())} at Chewy with fast shipping, free shipping on orders of $49+ and Autoship savings on eligible items. Customer service experts are available 24/7 at ${PHONE}.</p>${entry.faq ? `<h2>Frequently Asked Questions about ${esc(entry.h1)}</h2>${faq(entry.faq)}` : ''}</section>`
}

const INFO_B = {
  16616: { title: 'Connect with a Vet', body: base => `${crumbs(base, [['Pharmacy', '/b/pharmacy-2515'], ['Connect with a Vet']])}<section class="cw-hero-band"><div><p class="cw-eyebrow">Chewy Health</p><h1>Connect with a Vet</h1><p>Chat for free with a licensed veterinary technician about your dog or cat, 6 a.m. to midnight ET, 365 days a year.</p><a class="cw-btn" href="${base}/customer-care#chat">Chat with a licensed veterinary technician</a></div>${paw(150)}</section><div class="cw-feature-grid">${[['Peace of mind from home', 'Get answers about health, behavior and nutrition without leaving home.'], ['Experienced professionals', 'Licensed vet techs and veterinarians with years of clinical experience.'], ['Personalized advice', 'Guidance based on your pet’s profile and history.'], ['Get care 365 days a year', 'Free chat is open daily from 6 a.m. to midnight ET.'], ['All-in-one solution', 'Connect advice with Chewy Pharmacy and your Chewy account.']].map(([h, p]) => `<section><h2>${h}</h2><p>${p}</p></section>`).join('')}</div>${sections([['Chat with a licensed veterinary technician', 'Free chat is available for dogs and cats. Paid virtual visits with a licensed veterinarian ($49.99) are available in select states and can include prescriptions where permitted.'], ['Highly rated & trusted by pet parents', 'Pet parents rate Connect with a Vet highly for fast, friendly answers.'], ['Explore some of the ways we can help', ['Skin and allergy questions', 'Digestive upset', 'Behavior and training', 'Nutrition and weight', 'Medication questions']]])}<h2>Frequently asked questions</h2>${faq([['What is Connect with a Vet?', 'Chewy’s telehealth service for chatting with licensed vet techs and, in select states, veterinarians.'], ['When is the vet team available on Connect with a Vet?', 'Every day from 6 a.m. to midnight ET.'], ['Can Chewy online vets prescribe medication?', 'Veterinarians can prescribe during paid virtual visits in select states where a vet–client–patient relationship can be established.'], ['How much does Connect with a Vet cost?', 'Chatting with a vet tech is free. Virtual visits with a veterinarian cost $49.99.']])}` },
  15697: { title: 'How Chewy Pharmacy Works', body: base => `${crumbs(base, [['Pet Pharmacy', '/b/pharmacy-2515'], ['How it works']])}<h1 class="cw-page-title">How Chewy Pharmacy Works</h1>${sections([['1) Check their meds', 'Find your pet’s prescription medication or veterinary diet and add it to your cart.'], ['2) Checkout', 'Enter your pet’s information and your veterinarian’s contact details. Choose Autoship to save 50% on your first pharmacy Autoship order ($30 max, exclusions apply).'], ['3) Review & delivery', 'Chewy contacts your vet for approval. Licensed pharmacists review the order before it ships.'], ['Any questions?', `Pharmacists are available 24/7 at ${PHONE}.`]])}<p><a class="cw-btn" href="${base}/b/pharmacy-2515">Shop Pet Pharmacy</a></p>` },
  11718: { title: 'Compounded Medications', body: base => `${crumbs(base, [['Pet Pharmacy', '/b/pharmacy-2515'], ['Compounded Medications']])}<h1 class="cw-page-title">Compounded Medications</h1><p class="cw-lede">Custom medications prepared by Chewy’s compounding pharmacy in flavors, forms and strengths your vet prescribes.</p>${sections([['Why compounding?', 'Compounding can make medication easier to give, for example as a flavored chew or liquid, or in a strength not commercially available.'], ['How to order', 'Your veterinarian sends the prescription; Chewy pharmacists prepare it and ship it to you.']])}${notCaptured(base, 'compounded medications')}<p><a href="${base}/b/learn-about-compounding-169822">Learn about compounding</a></p>` },
  169822: { title: 'Learn About Compounding', body: base => `${crumbs(base, [['Pet Pharmacy', '/b/pharmacy-2515'], ['Learn About Compounding']])}<h1 class="cw-page-title">Learn About Compounding</h1>${sections([['What is pet medication compounding?', 'Compounding is the preparation of a custom medication by a licensed pharmacist from a veterinarian’s prescription.'], ['Forms available', ['Flavored chews and treats', 'Oral liquids and suspensions', 'Transdermal gels', 'Capsules in custom strengths']], ['Is compounding safe?', 'Compounded medications are prepared by licensed pharmacists following state pharmacy regulations and your vet’s directions.']])}<p><a class="cw-btn" href="${base}/b/pet-compounding-pharmacy-11718">Shop Compounded Medications</a></p>` },
}

const CONTENT = {
  faq: ['FAQs', [['Orders', 'Track an order from <a href="{base}/app/account/orderhistory">Your Orders</a>. Most orders ship within 1–2 business days.'], ['Shipping', 'Free shipping on orders of $49 or more. See <a href="{base}/app/content/shipping-info">Shipping Info</a>.'], ['Returns', 'Start a return in your account or the Chewy app. Return shipping is free. See <a href="{base}/app/content/return-policy">How to Start a Return</a>.'], ['Autoship', 'Save on your first Autoship order and 5% on future eligible orders. See <a href="{base}/app/content/autoship">Autoship & Save</a>.'], ['Pharmacy', 'Learn about <a href="{base}/app/content/pharmacy">ordering prescription and veterinary diet items</a>.'], ['Gift Cards', 'Read the <a href="{base}/app/content/gift-card-terms">Chewy Gift Card Terms & Conditions</a>.'], ['Still need help?', `Our customer service experts are available 24/7 at ${PHONE}.`]]],
  'shipping-info': ['Shipping Info', [['Free shipping on orders $49+', 'Orders of $49 or more ship free with standard shipping in the contiguous U.S. Orders under $49 have a flat shipping fee shown at checkout.'], ['Shipping times', 'Most orders arrive in 1–3 business days. Heavy items, prescription medication awaiting vet approval and some special-order items can take longer.'], ['Where we ship', 'Chewy ships to all 50 U.S. states and APO/FPO addresses, with restrictions for some items such as live animals and certain medications.'], ['Track your order', 'Track shipments from <a href="{base}/app/account/orderhistory">Your Orders</a> or the Chewy app.']]],
  'return-policy': ['How to Start a Return', [['Start a return in the app or online', 'Open <a href="{base}/app/account/orderhistory">Your Orders</a>, choose the item and select Start a Return. Return shipping is free.'], ['Return shipping is free', 'Chewy emails a prepaid return label, or Customer Care can help you by phone or chat.'], ['Items that need Customer Care', 'Prescription items, opened food or litter and other special items may need a call to Customer Care to review options.'], ['Need help?', `Customer Care is available 24/7 at ${PHONE}.`]]],
  'ans-terms': ['Autoship Terms', [['Autoship pricing', 'The Autoship discount applies to eligible items. The first-order promotion is 35% off up to $20, with exclusions. Ongoing savings are 5% on select brands.'], ['Changing or canceling', 'You can change frequency, skip, ship now or cancel at any time. Order date changes are allowed up to 48 hours before the next scheduled order.'], ['Price changes', 'Prices may change between shipments; you are charged the price at the time each order is processed.']]],
  pharmacy: ['Ordering Prescription and Veterinary Diet Items', [['What you need', 'A valid prescription from your veterinarian and your pet’s and vet’s information at checkout.'], ['Vet approval', 'Chewy contacts your veterinarian to verify every prescription before it ships.'], ['Autoship for prescriptions', 'Save 50% on your first pharmacy Autoship order ($30 max). Exclusions apply.']]],
  'gift-card-terms': ['Chewy Gift Card Terms & Conditions', [['No expiration', 'There’s no expiration date or hidden fees on Chewy Gift Cards.'], ['Restrictions', ['Chewy Gift Cards are not returnable, refundable or redeemable for cash except as required by law.', 'Chewy Gift Cards cannot be purchased with coupons, promotional offers or Chewy Gift Cards.', 'Chewy Gift Cards are not redeemable at Chewy Vet Care clinics.']], ['Using gift cards', 'Signed-in customers can apply multiple gift cards to one order; guest checkout is limited to one card per order.']]],
  'about-us': ['About Chewy', [['Our mission', 'To be the most trusted and convenient destination for pet parents and partners everywhere.'], ['Who we are', 'Chewy, Inc. is an online retailer of pet food, supplies and pet health products headquartered in Plantation, Florida, founded in 2011.'], ['Here for pets 24/7', `Customer service experts answer calls and chats around the clock at ${PHONE}.`]]],
  'investor-relations': ['Investor Relations', [['Chewy, Inc. (NYSE: CHWY)', 'Chewy’s investor relations site publishes quarterly results, SEC filings, governance documents and event webcasts. This replica summarizes it locally rather than linking out.'], ['Financial information', ['Quarterly results', 'Annual reports and proxy statements', 'SEC filings']], ['Governance', 'Board of directors, committee charters and governance documents.']]],
  affiliate: ['Chewy Affiliate Program', [['Earn by sharing Chewy', 'Content creators and publishers can earn commission on qualifying purchases made through their Chewy links.'], ['How it works', ['Apply to join the program', 'Share links to products and categories', 'Earn commission on qualifying sales']]]],
  careers: ['Careers at Chewy', [['Join our pack', 'Chewy hires across customer service, fulfillment, pharmacy, veterinary care, technology and corporate teams. Its careers site lists open roles; this replica summarizes it locally.'], ['Teams', ['Customer Service', 'Fulfillment & Logistics', 'Pharmacy', 'Chewy Vet Care', 'Technology', 'Corporate']]]],
  'sell-on-chewy': ['Sell on Chewy', [['Partner with Chewy', 'Brands and vendors can apply to sell to Chewy’s pet parents. Chewy reviews applications for product fit, quality and compliance.'], ['Before you apply', ['Pet-focused products', 'Product liability insurance', 'Ability to meet Chewy’s vendor compliance standards']], ['Vendor resources', 'See <a href="{base}/app/content/vendor-compliance">Vendor Compliance</a>.']]],
  'terms-of-use': ['Terms of Use', [['Agreement', 'By using Chewy websites and apps you agree to these Terms of Use and the Privacy Policy.'], ['Orders and pricing', 'Orders are subject to acceptance and availability. Prices and promotions may change without notice.'], ['Accounts', 'You are responsible for activity on your account and for keeping your password confidential.']]],
  privacy: ['Privacy Policy', [['Information we collect', 'Account, order, pet profile, device and usage information.'], ['How we use it', 'To fulfill orders, provide services such as Autoship and pharmacy, personalize your experience and communicate with you.'], ['Your choices', 'Manage marketing preferences in your account, and see <a href="{base}/app/content/interest-based-ads">Interest-Based Ads</a> for advertising choices.']]],
  'interest-based-ads': ['Interest-Based Ads', [['About interest-based advertising', 'Chewy and its partners may use cookies and similar technologies to show ads based on your browsing activity.'], ['Your choices', 'You can opt out of interest-based ads through browser settings and industry opt-out tools.']]],
  accessibility: ['Accessibility', [['Our commitment', 'Chewy is committed to making its websites and apps accessible to everyone, including people with disabilities.'], ['Need assistance?', `Customer service experts can help 24/7 at ${PHONE}.`]]],
  'california-supply-chains-act': ['California Transparency in Supply Chains Act', [['Disclosure', 'Chewy expects vendors to comply with laws on slavery and human trafficking and may verify, audit and certify vendor compliance.'], ['Vendor expectations', ['Compliance with applicable labor laws', 'Internal accountability standards', 'Training for employees with supply chain responsibilities']]]],
  'vendor-compliance': ['Vendor Compliance', [['Requirements for vendors', 'Vendors must meet Chewy’s routing, labeling, packaging and product data requirements.'], ['Resources', ['Routing guide', 'Packaging and labeling standards', 'Product content requirements']]]],
}

const HOME_HERO = [
  { h: 'Free $25 eGift card', sub: 'With your $49+ order.', fine: 'New customers only. Exclusions apply.', path: '/deals/todays-deals-2723', cls: 'cw-hero-blue' },
  { h: 'Promotes skin regeneration', sub: "With Omega 3 & 6 fatty acids, from Hill's Prescription Diet.", fine: '', path: '/brands/hills-prescription-diet-6879', cls: 'cw-hero-cream' },
  { h: 'Pharmacy RX 50% off your first order with Autoship', sub: 'Including flea & tick meds.', fine: 'Exclusions apply, $50 max.', path: '/deals/50-off-your-first-autoship-order-3448422', cls: 'cw-hero-teal' },
  { h: 'Frightfully good fall treats', sub: 'From Temptations, Greenies & more.', fine: '', path: '/b/halloween-shop-2026', cls: 'cw-hero-orange' },
]
function homePage(base, req) {
  const user = req.store?.user
  return `<h1 class="cw-sr">Welcome to Chewy</h1><section class="cw-hero" aria-label="Featured offers"><a class="cw-hero-main ${HOME_HERO[0].cls}" href="${base}${HOME_HERO[0].path}"><div><h2>${HOME_HERO[0].h}</h2><p>${HOME_HERO[0].sub}</p><span class="cw-btn">Shop now</span><small>${HOME_HERO[0].fine}</small></div><span class="cw-hero-art">${paw(220)}</span></a><div class="cw-hero-side">${HOME_HERO.slice(1).map(s => `<a class="${s.cls}" href="${base}${s.path}"><h2>${esc(s.h)}</h2><p>${esc(s.sub)}</p><span class="cw-link">Shop now</span>${s.fine ? `<small>${esc(s.fine)}</small>` : ''}</a>`).join('')}</div></section>
<section class="cw-welcome"><h2>Welcome to Chewy</h2><div class="cw-welcome-grid"><div class="cw-welcome-card"><h3>${user ? `Hey, ${esc(user.first_name || 'friend')}!` : 'Hey, friend!'}</h3><p>${user ? 'Manage Autoship, orders and pet profiles from your account.' : 'Sign in for a personalized experience, Autoship and order tracking.'}</p><a class="cw-btn" href="${base}${user ? '/app/account' : '/app/login'}">${user ? 'Your Account' : 'Sign in'}</a></div><div class="cw-welcome-card cw-offer"><p class="cw-eyebrow">Pharmacy</p><h3>Save 50% on first Pharmacy order</h3><a class="cw-btn cw-btn-outline" href="${base}/deals/50-off-your-first-autoship-order-3448422">Set up a prescription Autoship</a></div><div class="cw-welcome-card cw-offer"><p class="cw-eyebrow">Autoship</p><h3>Save 35% on first order</h3><a class="cw-btn cw-btn-outline" href="${base}/b/autoship-save-15682">Set up an Autoship</a></div></div></section>
<div class="cw-home-rows" data-reference-state="catalog">${productRow(base, 'Deals for you', SHELF.filter(p => p.list).sort((a, b) => b.reviews - a.reviews).slice(0, 14), '/deals/todays-deals-2723')}</div>
<section class="cw-section"><h2>Shop all pets, friends & more</h2><div class="cw-tiles cw-tiles-round">${PET_TILES.map(t => tile(base, t.label, t.path)).join('')}</div></section>
<section class="cw-section"><h2>Explore popular categories</h2><div class="cw-cat-cards">${POPULAR_CATEGORIES.map(c => `<a href="${base}${c.path}"><span class="cw-tile-art">${paw(40)}</span>${esc(c.label)}</a>`).join('')}</div></section>
${productRow(base, 'Bestselling dog food', categoryProducts('332').filter(p => !p.rx).sort((a, b) => b.reviews - a.reviews).slice(0, 14), '/b/food-332')}
${productRow(base, 'Cat food & litter favorites', [...categoryProducts('387'), ...categoryProducts('411')].filter(p => !p.rx).sort((a, b) => b.reviews - a.reviews).slice(0, 14), '/b/food-387')}
<section class="cw-pharmacy-band"><div><p class="cw-eyebrow">Chewy Pharmacy</p><h2>50% off your first Autoship order of prescription medication</h2><p>Chewy Pharmacy has the pet meds you trust at low prices every day. Our licensed pharmacists work with your vet to get the prescription approved, then ship it fast.</p><a class="cw-btn" href="${base}/deals/50-off-your-first-autoship-order-3448422">Shop now</a></div>${paw(160)}</section>
${productRow(base, 'Treats they’ll love', [...categoryProducts('335'), ...categoryProducts('391')].sort((a, b) => b.rating * b.reviews - a.rating * a.reviews).slice(0, 14), '/b/treats-335')}
${productRow(base, 'Toys to keep them busy', [...categoryProducts('315'), ...categoryProducts('326')].sort((a, b) => b.reviews - a.reviews).slice(0, 14), '/b/toys-315')}
<section class="cw-section"><h2>Pet parenting made easy</h2><div class="cw-easy">${[['Award-winning 24/7 customer care', '/customer-care'], ['Chat free with our licensed vet team', '/b/connect-vet-16616'], ['Prescription meds, delivered fast', '/b/pharmacy-2515'], ['Discover pet insurance', '/pet-insurance']].map(([l, p]) => `<a href="${base}${p}"><span class="cw-tile-art">${paw(36)}</span><strong>${l}</strong></a>`).join('')}</div></section>
<section class="cw-section"><h2>Get your pet all set for fall</h2><div class="cw-season">${[['Shop Halloween costumes, toys & more', '/b/halloween-shop-2026'], ['Buy 3, Get 4th FREE: Toys & Costumes', '/deals/buy-3-get-4th-free-2685446'], ['Dig up some tasty seasonal treats', '/b/treats-2040'], ['Gear up for game day fun', '/b/football-shop-15520'], ['Get cozy with fall snuggle essentials', '/b/refresh-your-nest-159246']].map(([l, p], i) => `<a class="cw-season-${i}" href="${base}${p}"><span>${esc(l)}</span></a>`).join('')}</div><a class="cw-wide-banner" href="${base}/b/halloween-shop-2026">Frightfully good fall treats from Temptations, Greenies, & more. <strong>Shop more</strong></a></section>
${productRow(base, 'Halloween shop', categoryProducts('2026'), '/b/halloween-shop-2026')}
${productRow(base, 'Flea, tick & health essentials', [...categoryProducts('372'), ...categoryProducts('415')].filter(p => !p.rx).sort((a, b) => b.reviews - a.reviews).slice(0, 14), '/b/health-pharmacy-372')}
${productRow(base, 'New arrivals', categoryProducts('14264').slice(0, 14), '/b/new-arrivals-14264')}
${productRow(base, 'For horses, birds, fish & more', SHELF.filter(p => !['Dog', 'Cat'].includes(p.pet)).sort((a, b) => b.reviews - a.reviews).slice(0, 14), '/other-animals')}`
}

function giftCardPage(base) {
  const designs = ['Cat Joy', 'Spring Into Happy', 'Chewy Pet Lovers', 'Special Delivery Dog', 'Treat Yourself', 'Pets Bring Us Together', 'Congrats New Bestie Dog', 'Congrats New Bestie Cat', 'Purr-fect Gift', 'Birthday Bear', 'Yay B-Day', 'Small Pets Big Hearts', "World's Best Cat Dad", "Dad's Day", 'Number One Dad', 'Summer Fun & Sun']
  return `${crumbs(base, [['Pet Parent Supplies', '/b/pet-parents-15439'], ['Gift Cards']])}<div class="cw-pdp"><div class="cw-gc-preview"><div class="cw-gc-card"><span class="cw-logo">chewy</span><span>eGift Card</span>${paw(90)}</div><p class="cw-muted">Design shown: Chewy Pet Lovers</p></div><div class="cw-pdp-buy"><p class="cw-muted">By Chewy</p><h1>Chewy eGift Card, Chewy Pet Lovers</h1><form class="cw-gc-form" action="${base}/chewy-egift-card/dp/226306" method="get"><fieldset disabled aria-describedby="gc-note"><h2>Select Design</h2><div class="cw-swatches">${designs.map((d, i) => `<label class="cw-swatch cw-swatch-${i % 6}"><input type="radio" name="design" value="${esc(d)}"${d === 'Chewy Pet Lovers' ? ' checked' : ''}><span>${esc(d)}</span></label>`).join('')}</div><h2>Select Amount:</h2><div class="cw-amounts">${[25, 50, 75, 100, 150, 200, 500].map(a => `<label><input type="radio" name="amount" value="${a}"${a === 50 ? ' checked' : ''}><span>$${a}</span></label>`).join('')}</div><h2>Email Delivery Details</h2><label for="gc-to">To: Recipient Email (Required) *</label><input id="gc-to" name="to" type="email" autocomplete="off"><label for="gc-from">From: Your Name (Optional)</label><input id="gc-from" name="from" autocomplete="name"><label for="gc-msg">Gift Message</label><textarea id="gc-msg" name="message" maxlength="222">Enjoy your Chewy eGift Card!</textarea><p class="cw-muted">(222 characters remaining)</p></fieldset><p id="gc-note" class="cw-notice">eGift Card purchase isn’t available in this replica. Chewy’s gift card checkout was not captured, so there is no Add to Cart button.</p></form></div></div>${sections([['About This Item', ['If you send an eGift Card today, it will be emailed to your recipient typically within 90 minutes after ordering.', 'Your eGift Card amount will be charged when you place your order.', 'There’s no expiration date or hidden fees on Chewy Gift Cards.']], ['Details', 'Chewy Gift Cards are not returnable, refundable or redeemable for cash except as required by law, cannot be purchased with coupons, promotional offers or Chewy Gift Cards, and are not redeemable at Chewy Vet Care clinics.'], ['FAQ', 'Signed-in customers can apply multiple gift cards to one order; guest checkout is limited to one card per order. See the <a href="' + base + '/app/content/gift-card-terms">Chewy Gift Card Terms & Conditions</a>.'], ['Reviews', 'Customer reviews were not captured for this replica.']])}`
}

const ACCOUNT_LINKS = [['Orders', '/app/account/orderhistory', 'Track, return or buy things again'], ['Autoship', '/app/subs', 'Manage your Autoship orders'], ['Pet Profiles', '/app/account/pets', 'Your pets’ info and prescriptions'], ['Favorites', '/app/account/favorites', 'Items you’ve saved'], ['Prescriptions', '/b/pharmacy-2515', 'Refill and track pet meds'], ['Account Settings', '/app/account/settings', 'Name, email, password, addresses and payment methods']]
const accountNav = (base, current) => `<nav class="cw-account-nav" aria-label="Account">${ACCOUNT_LINKS.map(([l, p]) => `<a href="${base}${p}"${p === current ? ' aria-current="page"' : ''}>${l}</a>`).join('')}</nav>`
const signInPrompt = (base, what) => `<div class="cw-notice"><p>Sign in to ${what}.</p><p><a class="cw-btn" href="${base}/app/login">Sign In</a> <a class="cw-btn cw-btn-outline" href="${base}/app/register">Create an Account</a></p></div>`

const safeNext = v => (typeof v === 'string' && /^\/app\/(checkout|cart|account)(\/[\w-]*)*$/.test(v) ? v : '')
function loginPage(base, { email = '', error = '', next = '', notice = '' } = {}) {
  return `<section class="cw-auth"><span class="cw-logo cw-logo-blue">chewy</span><h1>Sign In</h1>${notice ? `<p class="cw-notice">${esc(notice)}</p>` : ''}${error ? `<p class="cw-error" role="alert">${esc(error)}</p>` : ''}<form method="post" action="${base}/app/login" class="cw-form">${next ? `<input type="hidden" name="next" value="${esc(next)}">` : ''}<label for="login-email">Email Address</label><input id="login-email" name="email" type="email" autocomplete="email" value="${esc(email)}" required><label for="login-password">Password</label><input id="login-password" name="password" type="password" autocomplete="current-password" required><p><a href="${base}/customer-care">Forgot Password?</a></p><button class="cw-btn cw-btn-block" type="submit">Sign In</button></form><p class="cw-or">New to Chewy?</p><a class="cw-btn cw-btn-outline cw-btn-block" href="${base}/app/register${next ? `?next=${encodeURIComponent(next)}` : ''}">Create an Account</a><p class="cw-muted">By continuing, you agree to Chewy’s <a href="${base}/app/content/terms-of-use">Terms of Use</a> and <a href="${base}/app/content/privacy">Privacy Policy</a>.</p></section>`
}
function registerPage(base, { values = {}, error = '', next = '' } = {}) {
  const f = (id, label, type, ac) => `<label for="reg-${id}">${label}</label><input id="reg-${id}" name="${id}" type="${type}" autocomplete="${ac}" value="${type === 'password' ? '' : esc(values[id] || '')}" required>`
  return `<section class="cw-auth"><span class="cw-logo cw-logo-blue">chewy</span><h1>Create an Account</h1>${error ? `<p class="cw-error" role="alert">${esc(error)}</p>` : ''}<form method="post" action="${base}/app/register" class="cw-form">${next ? `<input type="hidden" name="next" value="${esc(next)}">` : ''}${f('first_name', 'First Name', 'text', 'given-name')}${f('last_name', 'Last Name', 'text', 'family-name')}${f('email', 'Email Address', 'email', 'email')}${f('password', 'Password', 'password', 'new-password')}<p class="cw-muted">Passwords must be at least 8 characters.</p><button class="cw-btn cw-btn-block" type="submit">Create Account</button></form><p class="cw-or">Already have an account? <a href="${base}/app/login">Sign In</a></p></section>`
}

function infoPage(base, { title, crumb, eyebrow, lede, list, cta }) {
  return `${crumbs(base, crumb || [[title]])}<section class="cw-hero-band"><div>${eyebrow ? `<p class="cw-eyebrow">${esc(eyebrow)}</p>` : ''}<h1>${esc(title)}</h1>${lede ? `<p>${lede}</p>` : ''}${cta ? `<a class="cw-btn" href="${base}${cta[1]}">${esc(cta[0])}</a>` : ''}</div>${paw(150)}</section>${sections(list || [])}`
}

export function installChewyReferencePages(inner) {
  const router = Router()
  const baseOf = res => res.locals.base || '/chewy'
  const render = (req, res, title, body, status = 200) => res.status(status).type('html').send(chewyReferenceChrome({ req, base: baseOf(res), title, body, count: cartCount(req) }))
  // Repeated query keys keep the shared reference router's 400 response.
  router.use((req, res, next) => Object.values(req.query).some(v => typeof v !== 'string') ? inner(req, res, next) : next())

  router.get('/', (req, res) => render(req, res, 'Pet Food, Products, Supplies at Low Prices - Free Shipping', homePage(baseOf(res), req)))
  router.get('/b/:slug', (req, res, next) => {
    const base = baseOf(res), id = idOf(req.params.slug)
    if (INFO_B[id]) return render(req, res, INFO_B[id].title, INFO_B[id].body(base))
    const entry = CATEGORIES.get(id)
    if (!entry) return next()
    render(req, res, entry.h1, categoryPage(base, `/b/${req.params.slug}`, req, entry, categoryProducts(id)))
  })
  router.get('/deals/:slug', (req, res, next) => {
    const d = DEALS[req.params.slug]; if (!d) return next()
    const base = baseOf(res)
    render(req, res, d.h1, categoryPage(base, `/deals/${req.params.slug}`, req, { h1: d.h1, banner: d.banner, tiles: d.tiles.map(t => [t, DEAL_TILE_PATH(t)]), filters: ['Category', 'Product Category', 'Brand', 'Lifestage', 'Breed Size', 'Price', 'Customer Rating'], crumbs: [] }, dealProducts(req.params.slug)))
  })
  router.get('/other-animals', (req, res) => {
    const base = baseOf(res)
    render(req, res, 'Other Animals', `${crumbs(base, [['Other Animals']])}<h1 class="cw-page-title">Other Animals</h1>${OTHER_ANIMALS_MENU.map(g => `<section class="cw-section"><h2><a href="${base}${g.path}">${esc(g.h1)}</a></h2>${tiles(base, g.items.map(i => [i.label, i.path]))}</section>`).join('')}`)
  })
  router.get('/chewy-egift-card/dp/226306', (req, res) => render(req, res, 'Chewy eGift Card', giftCardPage(baseOf(res))))
  router.get('/gift-cards', (req, res) => res.redirect(`${baseOf(res)}/chewy-egift-card/dp/226306`))

  // Cart and account entry points (no purchasable inventory in reference mode).
  router.get('/app/cart', (req, res) => {
    const base = baseOf(res)
    const full = cartPage(base, req)
    if (full) return render(req, res, 'Cart', full)
    render(req, res, 'Cart', `<section class="cw-cart-empty"><span class="cw-empty-art">${paw(80)}</span><h1>Your cart is empty.</h1>${req.store.user ? '<p>Items you add will show up here.</p>' : `<p>Something missing? Sign in to see items you may have added from another computer or device.</p><a class="cw-btn" href="${base}/app/login">Sign In or Create an Account</a>`} <a class="cw-btn cw-btn-outline" href="${base}/deals/todays-deals-2723">Shop Today's Deals</a></section>`)
  })
  router.get('/app/login', (req, res) => { const next = safeNext(req.query.next); render(req, res, 'Sign In', loginPage(baseOf(res), { next, notice: next === '/app/checkout' ? 'Sign in or create an account to check out.' : '' })) })
  router.post('/app/login', (req, res) => {
    const base = baseOf(res), email = str(req.body?.email), password = typeof req.body?.password === 'string' ? req.body.password : '', next = safeNext(req.body?.next)
    if (!email || !password) return render(req, res, 'Sign In', loginPage(base, { email, next, error: 'Please enter your email address and password.' }), 400)
    const acct = authenticate('chewy', email, password)
    if (!acct) return render(req, res, 'Sign In', loginPage(base, { email, next, error: 'The email or password you entered is incorrect. Please try again.' }), 401)
    req.store.user = publicAccount(acct)
    res.redirect(`${base}${next || '/app/account'}`)
  })
  router.get('/app/register', (req, res) => render(req, res, 'Create an Account', registerPage(baseOf(res), { next: safeNext(req.query.next) })))
  router.post('/app/register', (req, res) => {
    const base = baseOf(res), values = Object.fromEntries(['first_name', 'last_name', 'email'].map(k => [k, str(req.body?.[k])]))
    const password = typeof req.body?.password === 'string' ? req.body.password : ''
    let error = ''
    if (!values.first_name || !values.last_name) error = 'Please enter your first and last name.'
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(values.email)) error = 'Please enter a valid email address.'
    else if (password.length < 8) error = 'Passwords must be at least 8 characters.'
    const acct = error ? null : createAccount('chewy', { ...values, password })
    if (acct?.error) error = acct.error
    if (error) return render(req, res, 'Create an Account', registerPage(base, { values, error, next: safeNext(req.body?.next) }), 400)
    req.store.user = publicAccount(acct)
    res.redirect(`${base}${safeNext(req.body?.next) || '/app/account'}`)
  })
  router.post('/app/logout', (req, res) => { req.store.user = null; res.redirect(`${baseOf(res)}/`) })
  router.get('/app/account', (req, res) => {
    const base = baseOf(res), user = req.store.user
    render(req, res, 'Account', `${crumbs(base, [['Account']])}<h1 class="cw-page-title">${user ? `Hi, ${esc(user.first_name || 'friend')}!` : 'Account'}</h1>${user ? '' : signInPrompt(base, 'manage your orders, Autoship, pet profiles and prescriptions')}<div class="cw-account-grid">${ACCOUNT_LINKS.map(([l, p, t]) => `<a class="cw-account-tile" href="${base}${p}"><h2>${l}</h2><p>${t}</p></a>`).join('')}</div>${user ? `<form method="post" action="${base}/app/logout"><button class="cw-btn cw-btn-outline" type="submit">Sign Out</button></form>` : ''}`)
  })
  const accountSub = (path, title, signedOutWhat, signedIn) => router.get(path, (req, res) => {
    const base = baseOf(res)
    render(req, res, title, `${crumbs(base, [['Account', '/app/account'], [title]])}<h1 class="cw-page-title">${esc(title)}</h1>${accountNav(base, path)}${req.store.user ? signedIn(base, req) : signInPrompt(base, signedOutWhat)}`)
  })
  accountSub('/app/account/orderhistory', 'Your Orders', 'view your orders, track packages and start returns', (base, req) => orderHistory(base, req) || `<div class="cw-empty"><h2>You haven’t placed any orders yet.</h2><p>Track orders and start returns here once you’ve ordered.</p><a class="cw-btn" href="${base}/deals/todays-deals-2723">Shop Today's Deals</a></div>`)
  accountSub('/app/subs', 'Manage Autoship', 'manage your Autoship orders', base => `<div class="cw-empty"><h2>You don’t have any Autoship orders yet.</h2><p>Save 35% on your first Autoship order. <a href="${base}/app/content/autoship">Learn about Autoship</a></p></div>`)
  accountSub('/app/account/pets', 'Pet Profiles', 'add and manage pet profiles', () => '<div class="cw-empty"><h2>No pet profiles yet.</h2><p>Pet profiles help personalize recommendations and pharmacy orders.</p></div>')
  accountSub('/app/account/favorites', 'Favorites', 'see your favorites', base => `<div class="cw-empty"><h2>You have no favorites yet.</h2><p><a href="${base}/b/new-arrivals-14264">Browse New Arrivals</a></p></div>`)
  accountSub('/app/account/settings', 'Account Settings', 'manage your account settings', () => '<div class="cw-notice"><p>Name, email, password, addresses and payment methods are managed here on chewy.com. Editing them is not part of this replica.</p></div>')
  // Order status lookup from the footer "Track Order" link.
  router.get('/app/account/orderhistory/track', (req, res) => res.redirect(`${baseOf(res)}/app/account/orderhistory`))

  // Help and policy pages.
  router.get('/customer-care', (req, res) => {
    const base = baseOf(res)
    const topics = [['Track an order', '/app/account/orderhistory'], ['Shipping info', '/app/content/shipping-info'], ['Start a return', '/app/content/return-policy'], ['Autoship', '/app/content/autoship'], ['Pharmacy & prescriptions', '/app/content/pharmacy'], ['Account & sign in', '/app/account'], ['Gift cards', '/app/content/gift-card-terms'], ['Chewy Vet Care', '/vet-care'], ['FAQs', '/app/content/faq']]
    render(req, res, 'Chewy Help', `<section class="cw-hero-band"><div><p class="cw-eyebrow">24/7 Help</p><h1>Chewy Help</h1><h2>Get help from our experts 24/7</h2><p>Award-winning customer service, any time of day.</p></div>${paw(150)}</section><div class="cw-contact-grid"><section><h2>Call us</h2><p><a href="tel:+18006724399">${PHONE}</a></p><p>Available 24/7</p></section><section id="chat"><h2>Chat</h2><p>Chat with a customer service expert in the Chewy app or on chewy.com.</p><p class="cw-muted">Live chat is not connected in this replica.</p></section><section><h2>Connect with a Vet</h2><p>Chat for free with a licensed vet tech.</p><p><a href="${base}/b/connect-vet-16616">Connect with a Vet</a></p></section></div><section class="cw-section"><h2>How can we help?</h2><div class="cw-topic-grid">${topics.map(([l, p]) => `<a href="${base}${p}">${l}</a>`).join('')}</div></section>`)
  })
  router.get('/app/content/autoship', (req, res) => {
    const base = baseOf(res)
    render(req, res, 'Autoship & Save', `${crumbs(base, [['Autoship & Save']])}<section class="cw-hero-band"><div><p class="cw-eyebrow">Autoship</p><h1>Autoship & Save</h1><p>Save 35% on your first Autoship order (up to $20) and 5% on future orders of select brands. Free shipping on orders $49+.</p><a class="cw-btn" href="${base}/b/autoship-save-15682">Shop Autoship</a></div>${paw(150)}</section><section class="cw-section"><h2>Why You'll Love Autoship</h2><div class="cw-feature-grid">${[['Save on every delivery', 'Get 35% off your first Autoship order and 5% off select brands after that.'], ['Total flexibility', 'Change, skip or cancel anytime. Adjust order dates up to 48 hours before the next scheduled order.'], ['Never run out', 'Pet essentials arrive on your schedule.']].map(([h, p]) => `<section><h3>${h}</h3><p>${p}</p></section>`).join('')}</div></section><h2>Frequently Asked Questions</h2>${faq([['How much can I save?', 'The 35% first-order promotion applies to Autoship-eligible items, up to $20, with exclusions. Ongoing savings are 5% on select brands.'], ['Can I change or cancel Autoship?', 'Yes, anytime. Order date changes are allowed up to 48 hours before the next scheduled order.'], ['Can I Autoship prescriptions?', 'Yes. See ordering prescription and veterinary diet items.']])}<p><a href="${base}/app/content/ans-terms">Autoship Terms</a> · <a href="${base}/app/subs">Manage Autoship</a> · <a href="${base}/app/content/pharmacy">Ordering prescription and veterinary diet items</a></p>`)
  })
  router.get('/app/content/:slug', (req, res, next) => {
    const c = CONTENT[req.params.slug]; if (!c) return next()
    const base = baseOf(res), [title, list] = c
    const body = sections(list).replaceAll('{base}', base)
    render(req, res, title, `${crumbs(base, [['Help', '/customer-care'], [title]])}<article class="cw-article"><h1>${esc(title)}</h1>${body}<p class="cw-muted">Summarized from chewy.com for this replica. Questions? Call ${PHONE}, 24/7.</p></article>`)
  })

  // Services, vet care, insurance and "store locator" (Chewy has no retail stores).
  router.get('/services', (req, res) => {
    const base = baseOf(res)
    render(req, res, 'Services', `${crumbs(base, [['Services']])}<h1 class="cw-page-title">Health Services</h1><div class="cw-feature-grid">${SERVICES_MENU.map(s => `<a class="cw-card" href="${base}${s.path}"><h2>${esc(s.label)}</h2><p>${esc(s.text)}</p></a>`).join('')}<a class="cw-card" href="${base}/app/content/autoship"><h2>Autoship</h2><p>Save on repeat deliveries of pet essentials.</p></a></div>`)
  })
  router.get('/vet-care', (req, res) => render(req, res, 'Chewy Vet Care', infoPage(baseOf(res), { title: 'Chewy Vet Care', eyebrow: 'Health Services', lede: 'In-person routine and urgent care from Chewy’s veterinary teams, with records and prescriptions connected to your Chewy account.', cta: ['Find a clinic', '/vet-care/locations'], list: [['Care for every stage', ['Wellness exams and vaccines', 'Sick visits and urgent care', 'Dental care', 'Spay, neuter and surgery']], ['Connect with a Vet', `Not sure you need a visit? <a href="${baseOf(res)}/b/connect-vet-16616">Chat for free with a licensed vet tech</a>.`], ['CarePlus', `Pair visits with <a href="${baseOf(res)}/pet-insurance">CarePlus pet insurance and wellness plans</a>.`], ['Get the Chewy app', 'Book appointments and manage your pet’s records in the Chewy app.']] })))
  router.get('/vet-care/locations', (req, res) => {
    const base = baseOf(res), zip = str(req.query.zip)
    const valid = /^\d{5}$/.test(zip)
    render(req, res, 'Find a Chewy Vet Care Clinic', `${crumbs(base, [['Chewy Vet Care', '/vet-care'], ['Locations']])}<h1 class="cw-page-title">Chewy Vet Care Locations</h1><p class="cw-lede">Chewy doesn’t operate retail stores. Chewy Vet Care clinics offer in-person veterinary care in select U.S. markets.</p><form class="cw-form cw-inline-form" method="get" action="${base}/vet-care/locations"><label for="clinic-zip">Find a clinic near you (ZIP code)</label><input id="clinic-zip" name="zip" inputmode="numeric" autocomplete="postal-code" value="${esc(zip)}"><button class="cw-btn" type="submit">Find a clinic</button></form>${zip ? valid ? `<div class="cw-empty"><h2>Clinic results for ${esc(zip)}</h2><p>Chewy Vet Care clinic addresses and appointment availability were not captured for this replica, so no clinics are listed. This is not a statement that no clinic is nearby.</p><p><a href="${base}/b/connect-vet-16616">Chat with a vet tech instead</a></p></div>` : '<p class="cw-error" role="alert">Please enter a valid 5-digit ZIP code.</p>' : ''}`)
  })
  router.get('/pet-insurance', (req, res) => render(req, res, 'CarePlus Pet Insurance & Wellness', infoPage(baseOf(res), { title: 'CarePlus Pet Insurance & Wellness Plans', eyebrow: 'Chewy Health', lede: 'Give your pet the best possible health coverage with Pet Insurance and Wellness plans from CarePlus by Chewy.', cta: ['Get a quote', '/customer-care'], list: [['Pet Insurance', 'Accident and illness coverage that helps with unexpected vet bills, from any licensed vet.'], ['Wellness plans', 'Help budget for routine care such as exams, vaccines and preventatives.'], ['Why CarePlus?', ['Use any licensed veterinarian', 'Manage claims in the Chewy app', 'Available for dogs and cats']]] })))
  router.get('/expert-health-tips', (req, res) => render(req, res, 'Expert Health Tips', infoPage(baseOf(res), { title: 'Expert Health Tips', eyebrow: 'PetMD', lede: 'Chewy’s Expert Health Tips menu links to PetMD, Chewy’s veterinarian-reviewed pet health library. This replica summarizes it locally instead of linking off-site.', cta: ['Connect with a Vet', '/b/connect-vet-16616'], list: [['PetMD', 'Vet-reviewed articles on symptoms, conditions, medications, nutrition and behavior for dogs, cats and other pets.'], ['Learn more on Chewy', `<a href="${baseOf(res)}/education">Chewy Education: All About Pets</a>`]] })))
  router.get('/mobile-app', (req, res) => render(req, res, 'Get the Chewy app', infoPage(baseOf(res), { title: 'Get the Chewy app', eyebrow: 'Use App', lede: 'Manage Autoship, track orders, refill prescriptions and chat with a vet. The real “Use App” link goes to app stores; this replica keeps you on-site.', list: [['In the app', ['Manage Autoship and orders', 'Start returns', 'Refill prescriptions', 'Connect with a Vet', 'Book Chewy Vet Care appointments']]] })))

  // Education, Chewy Picks, Give Back and brands.
  router.get('/education', (req, res) => {
    const base = baseOf(res)
    const pets = [['Dog', '/education/dog'], ['Cat', '/education/cat'], ['Horse', '/education/horse'], ['Small Pet', '/education/small-pet'], ['Bird', '/education/bird'], ['Fish', '/education/fish'], ['Reptile and Amphibian', '/education/reptile-and-amphibian'], ['Wildlife', '/education/wildlife'], ['Farm Animal', '/education/farm-animal']]
    render(req, res, 'All About Pets', `${crumbs(base, [['Education']])}<h1 class="cw-page-title">All About Pets</h1><section class="cw-banner"><div><h2>Halloween Fun, Unleashed</h2><p>Carve a pet-inspired pumpkin, bake a festive treat, and help your bestie feel safer around spooky decorations.</p><a class="cw-btn" href="${base}/education/cat">Is Your Cat Feeling Spooked?</a></div>${paw(120)}</section>${tiles(base, pets)}${pets.map(([l, p]) => `<section class="cw-edu-row"><h2><a href="${base}${p}">${esc(l)}</a></h2><p>Care guides, health and nutrition tips, and training advice for ${esc(l.toLowerCase())} parents.</p></section>`).join('')}<section class="cw-copy-section"><h2>About Chewy Education</h2><p>Chewy’s education library is written and reviewed by pet experts, including veterinarians and behaviorists, to help pet parents care for every kind of pet. See also <a href="${base}/education/dog-breeds">Dog Breeds</a> and <a href="${base}/education/cat-breeds">Cat Breeds</a>.</p></section>`)
  })
  const eduPage = (req, res, next) => {
    const base = baseOf(res), slug = req.params.sub ? `small-pet/${req.params.sub}` : req.params.slug
    const item = EDUCATION_MENU.find(e => e.path === `/education/${slug}`)
    if (!item) return next()
    const name = item.label
    render(req, res, `${name} Education`, `${crumbs(base, [['Education', '/education'], [name]])}<h1 class="cw-page-title">${esc(name)}${/Breeds/.test(name) ? '' : ' Care & Education'}</h1>${sections([[`${name} Health`, 'Vet-reviewed guidance on symptoms, preventative care and when to call your veterinarian.'], [`${name} Nutrition`, 'How to choose food and treats for each life stage.'], [`${name} Behavior & Training`, 'Practical tips for everyday care, enrichment and training.']])}<p><a href="${base}/education">All Pets</a> · <a href="${base}/b/connect-vet-16616">Connect with a Vet</a></p>`)
  }
  router.get('/education/small-pet/:sub', eduPage)
  router.get('/education/:slug', eduPage)
  router.get('/best', (req, res) => {
    const base = baseOf(res)
    render(req, res, 'Chewy Picks', `${crumbs(base, [['Chewy Picks']])}<h1 class="cw-page-title">Chewy Picks</h1><p class="cw-lede">Top-rated favorites chosen with input from pet parents and Chewy experts.</p>${tiles(base, PICKS_MENU.map(p => [p.label, p.path]))}`)
  })
  router.get('/best/:slug', (req, res, next) => {
    const pick = PICKS_MENU.find(p => p.path === `/best/${req.params.slug}`); if (!pick) return next()
    const base = baseOf(res)
    render(req, res, pick.label, `${crumbs(base, [['Chewy Picks', '/best'], [pick.label]])}<h1 class="cw-page-title">${esc(pick.label)}</h1><p class="cw-lede">Chewy Picks highlight top-rated products across categories, based on customer ratings and expert input.</p>${(() => { const list = pickProducts(req.params.slug); return list.length ? `<div class="cw-grid">${list.slice(0, 36).map(p => productCard(base, p)).join('')}</div>` : notCaptured(base, pick.label.toLowerCase()) })()}`)
  })
  router.get('/g/:slug', (req, res, next) => {
    const p = GIVE_BACK_MENU.find(x => x.path === `/g/${req.params.slug}`); if (!p) return next()
    const base = baseOf(res)
    render(req, res, p.label, `${crumbs(base, [['Give Back', '/g/give-back'], [p.label]])}<section class="cw-hero-band"><div><p class="cw-eyebrow">Give Back</p><h1>${esc(p.h1)}</h1><p>Chewy has donated more than $183 million in products to shelters and rescues since 2012.</p></div>${paw(150)}</section>${sections(p.sections.map(h => [h, h === 'Are You Part of a Shelter or Rescue?' ? `Join Chewy’s network to receive donations and Wish List support. <a href="${base}/g/shelter-partners">Join Our Network</a>` : 'Support local shelters and rescues by donating from their Wish Lists or adopting a pet in need.']))}<nav class="cw-subnav" aria-label="Give Back">${GIVE_BACK_MENU.map(x => `<a href="${base}${x.path}">${esc(x.label)}</a>`).join('')}</nav>`)
  })
  router.get('/brands', (req, res) => {
    const base = baseOf(res)
    render(req, res, 'Popular Brands', `${crumbs(base, [['Popular Brands']])}<h1 class="cw-page-title">Popular Brands</h1><div class="cw-brand-grid">${BRANDS.map(b => `<a href="${base}${b.path}"><strong>${esc(b.label)}</strong><span>${esc(b.text)}</span></a>`).join('')}</div>`)
  })
  router.get('/brands/:slug', (req, res, next) => {
    const b = BRANDS.find(x => x.path === `/brands/${req.params.slug}`); if (!b) return next()
    const base = baseOf(res)
    render(req, res, b.label, `${crumbs(base, [['Popular Brands', '/brands'], [b.label]])}<section class="cw-hero-band"><div><p class="cw-eyebrow">Brand</p><h1>${esc(b.label)}</h1><p>${esc(b.text)}</p></div>${paw(130)}</section>${(() => { const list = brandProducts(b.path); return list.length ? `<div class="cw-plp">${listingFilters(base, b.path, req, [], list, null)}${listingResults(base, b.path, req, list, b.label)}</div>` : notCaptured(base, b.label) })()}`)
  })

  // Site map (HTML) and sitemap.xml.
  router.get('/app/site-map', (req, res) => {
    const base = baseOf(res), link = (l, p) => `<li><a href="${base}${p}">${esc(l)}</a></li>`
    const col = (h, list) => `<section><h2>${esc(h)}</h2><ul>${list.map(([l, p]) => link(l, p)).join('')}</ul></section>`
    const menuCols = (h, menu) => `<section class="cw-sitemap-wide"><h2>${esc(h)}</h2>${menu.map(g => `<h3><a href="${base}${g.path}">${esc(g.h1 || g.label)}</a></h3><ul>${g.items.map(i => link(i.h1 || i.label, i.path)).join('')}</ul>`).join('')}</section>`
    render(req, res, 'Site Map', `${crumbs(base, [['Site Map']])}<h1 class="cw-page-title">Site Map</h1><div class="cw-sitemap">${col('Shop by Pet', PET_TILES.map(t => [t.label, t.path]))}${menuCols('Dog', DOG_MENU)}${menuCols('Cat', CAT_MENU)}${menuCols('Other Animals', OTHER_ANIMALS_MENU)}${menuCols('Pharmacy', PHARMACY_MENU.map(g => g.label === 'Pharmacy' ? { ...g, h1: 'Pet Pharmacy' } : { ...g, h1: `${g.label} Pharmacy` }))}${col('Deals & More', [["Today's Deals", '/deals/todays-deals-2723'], ['New Arrivals', '/b/new-arrivals-14264'], ['Autoship', '/app/content/autoship'], ['Gift Cards', '/chewy-egift-card/dp/226306'], ['Popular Brands', '/brands'], ['Chewy Picks', '/best'], ['Other Animals', '/other-animals']])}${col('Services', [['Chewy Vet Care', '/vet-care'], ['Chewy Vet Care Locations', '/vet-care/locations'], ['Connect with a Vet', '/b/connect-vet-16616'], ['CarePlus', '/pet-insurance'], ['Expert Health Tips', '/expert-health-tips'], ['Health Services', '/services']])}${col('Education', [['Education', '/education'], ...EDUCATION_MENU.map(e => [e.label, e.path])])}${col('Give Back', [['How We Give Back', '/g/give-back'], ...GIVE_BACK_MENU.slice(1).map(g => [g.label, g.path])])}${col('Customer Care', [['Customer Care', '/customer-care'], ['Track Order', '/app/account/orderhistory'], ['Shipping Info', '/app/content/shipping-info'], ['Returns', '/app/content/return-policy'], ['FAQs', '/app/content/faq'], ['Autoship Terms', '/app/content/ans-terms'], ['Gift Card Terms', '/app/content/gift-card-terms']])}${col('Your Account', [['Sign In', '/app/login'], ['Create an Account', '/app/register'], ['Account', '/app/account'], ['Manage Autoship', '/app/subs'], ['Cart', '/app/cart'], ['Use App', '/mobile-app']])}${col('Company', [...FOOTER[0].links, ...LEGAL.filter(([l]) => l !== 'Site Map')])}</div>`)
  })
  router.get('/sitemap', (req, res) => res.redirect(`${baseOf(res)}/app/site-map`))
  router.get('/sitemap.xml', (req, res) => {
    const base = baseOf(res), origin = `${req.protocol}://${req.get('host')}`
    const paths = new Set(['/', '/app/site-map', '/app/cart', '/app/login', '/app/register', '/app/account', '/app/account/orderhistory', '/app/subs', '/customer-care', '/services', '/vet-care', '/vet-care/locations', '/pet-insurance', '/expert-health-tips', '/mobile-app', '/education', '/best', '/brands', '/other-animals', '/chewy-egift-card/dp/226306', '/app/content/autoship'])
    for (const t of TOP_NAV) paths.add(t.path)
    for (const g of [...DOG_MENU, ...CAT_MENU, ...OTHER_ANIMALS_MENU, ...PHARMACY_MENU]) { paths.add(g.path); for (const i of g.items) paths.add(i.path) }
    for (const t of PET_TILES) paths.add(t.path)
    for (const s of Object.keys(DEALS)) paths.add(`/deals/${s}`)
    for (const s of Object.keys(CONTENT)) paths.add(`/app/content/${s}`)
    for (const x of [...EDUCATION_MENU, ...PICKS_MENU, ...GIVE_BACK_MENU, ...BRANDS]) paths.add(x.path)
    res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...paths].map(p => `  <url><loc>${esc(origin + base + p)}</loc></url>`).join('\n')}\n</urlset>\n`)
  })

  // Earlier clone URLs keep working by redirecting to the real-site paths.
  const legacy = { '/help': '/customer-care', '/account': '/app/account', '/cart': '/app/cart', '/autoship': '/app/content/autoship', '/account/autoship': '/app/subs', '/account/orders': '/app/account/orderhistory', '/account/pets': '/app/account/pets', '/favorites': '/app/account/favorites', '/guides': '/education', '/help/topics/returns': '/app/content/return-policy', '/services/veterinary': '/vet-care', '/services/pharmacy': '/b/pharmacy-2515', '/services/insurance': '/pet-insurance', '/login': '/app/login', '/signin': '/app/login', '/department/dog': '/b/dog-288', '/department/cat': '/b/cat-325', '/deals': '/deals/todays-deals-2723', '/pharmacy': '/b/pharmacy-2515' }
  for (const [from, to] of Object.entries(legacy)) router.get(from, (req, res) => res.redirect(`${baseOf(res)}${to}`))
  router.get('/department/:slug', (req, res) => res.redirect(`${baseOf(res)}/other-animals`))
  router.get('/collections/:slug', (req, res) => res.redirect(`${baseOf(res)}/deals/todays-deals-2723`))

  // ── Assortment: search, product pages, images, cart and checkout ──────
  const search = (req, res, next) => {
    const raw = typeof req.query.query === 'string' ? req.query.query : typeof req.query.q === 'string' ? req.query.q : ''
    const found = searchShelf(raw)
    // Queries with no assortment match (for example "gta 6": Chewy sells no
    // video games) keep the shared reference router's coverage state.
    if (!found.length) return next()
    const base = baseOf(res), path = req.path, query = raw.trim()
    const hidden = { [typeof req.query.query === 'string' ? 'query' : 'q']: query }
    render(req, res, `${query} - Search Results`, `${crumbs(base, [[`Results for “${query}”`]])}<h1 class="cw-page-title">Results for “${esc(query)}”</h1><div class="cw-plp">${listingFilters(base, path, req, ['Autoship', 'Brand', 'Lifestage', 'Breed Size', 'Food Form', 'Price', 'Customer Rating', 'Deals & Savings'], found, null, hidden)}${listingResults(base, path, req, found, `Search: ${query}`, hidden)}</div>`)
  }
  router.get(['/s', '/search'], search)
  router.get('/product-images/:id/:view.svg', (req, res, next) => {
    const p = SHELF_BY_ID.get(req.params.id), view = Number(req.params.view)
    if (!p || ![0, 1, 2].includes(view)) return next()
    res.set('Cache-Control', 'public, max-age=86400').type('image/svg+xml').send(shelfArt(p, view))
  })
  router.get('/:slug/dp/:id', (req, res, next) => {
    const p = SHELF_BY_ID.get(req.params.id); if (!p) return next()
    const base = baseOf(res)
    if (req.params.slug !== p.slug) return res.redirect(301, `${base}${p.path}`)
    render(req, res, p.title, productPage(base, req, p))
  })
  router.post('/app/cart/add', (req, res, next) => {
    const result = addToCart(req, req.body)
    if (result.error === 'unknown') return next()
    const base = baseOf(res)
    if (result.error) return render(req, res, result.p.title, productPage(base, req, result.p, { error: result.error }), 400)
    res.redirect(`${base}/app/cart`)
  })
  router.post('/app/cart/update', (req, res, next) => updateLine(req, req.body) ? res.redirect(`${baseOf(res)}/app/cart`) : next())
  router.post('/app/cart/remove', (req, res, next) => updateLine(req, req.body, true) ? res.redirect(`${baseOf(res)}/app/cart`) : next())
  router.get('/app/checkout', (req, res) => {
    const base = baseOf(res)
    if (!cartCount(req)) return res.redirect(`${base}/app/cart`)
    if (!req.store.user) return res.redirect(`${base}/app/login?next=${encodeURIComponent('/app/checkout')}`)
    render(req, res, 'Checkout', checkoutPage(base, req))
  })
  router.post('/app/checkout', (req, res) => {
    const base = baseOf(res)
    if (!cartCount(req)) return res.redirect(`${base}/app/cart`)
    if (!req.store.user) return res.redirect(`${base}/app/login?next=${encodeURIComponent('/app/checkout')}`)
    const result = placeOrder(req, req.body)
    if (result.empty) return res.redirect(`${base}/app/cart`)
    if (result.order_number) return res.redirect(`${base}/app/checkout/confirmation/${result.order_number}`)
    render(req, res, 'Checkout', checkoutPage(base, req, result), 400)
  })
  router.get('/app/checkout/confirmation/:number', (req, res, next) => {
    const o = (req.store.chewyOrders || []).find(x => x.order_number === req.params.number); if (!o) return next()
    render(req, res, 'Order Confirmation', confirmationPage(baseOf(res), o))
  })

  router.use(inner)
  return router
}
