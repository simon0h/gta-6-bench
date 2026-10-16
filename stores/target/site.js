// Target.com site chrome, department landing pages, help/policy/information pages, site map.
// Structure and headings follow target.com as captured on 2026-10-13 (see
// research/parity/target.json). Product grids show the store's own catalog (the GTA VI rows plus shelf.js);
// everything else here is navigation, editorial copy and information pages.
import { esc } from '../../lib/html.js'
import { productPhoto } from '../../lib/product-photos.js'
import { fixtureCatalog } from '../../lib/catalog-policy.js'
import * as D from './site-data.js'
import { targetIcon } from './media.js'

const nodeId = path => (/\/(N-[0-9a-z]+)$/i.exec(path) || [])[1] || null
const a = (base, path, label, cls = '') => `<a${cls ? ` class="${cls}"` : ''} href="${base}${path}">${esc(label)}</a>`

// ---------- category index ----------
// Every category node the clone renders, keyed by Target's N- id.
export const NODES = new Map()
const reg = (label, path) => { const id = nodeId(path); if (id && path.startsWith('/c/') && !NODES.has(id)) NODES.set(id, { label, path }) }
for (const [l, p] of D.MENU) reg(l, p)
for (const [, links] of D.SHOP_ALL) for (const [l, p] of links) reg(l, p)
for (const [, links] of D.FOOTER) for (const [l, p] of links) reg(l, p)

const GIFT_CARD_TILES = [
  ['Target GiftCards', D.node('target-giftcards-gift-cards', 'N-5xsxt')],
  ['Entertainment & Movie Gift Cards', D.node('entertainment-movie-gift-cards', 'N-4skcx')],
  ['Food, Restaurant & Grocery Gift Cards', D.node('restaurant-gift-cards-specialty', 'N-26m0u')],
  ['Gaming Gift Cards', D.node('gaming-gift-cards', 'N-5xtfh')],
  ['Hotels, Travel & Rideshare Gift Cards', D.node('hotels-travel-rideshare-gift-cards', 'N-4skcw')],
  ['Specialty & Lifestyle Cards', D.node('specialty-lifestyle-cards-gift', 'N-iwbiv')],
  ['Visa, Mastercard & Amex Gift Cards', D.node('visa-mastercard-amex-gift-cards', 'N-x7n3r')],
  ['Corporate & Bulk Gift Cards', D.node('corporate-bulk-gift-cards', 'N-4sro1')],
  ['One4all Gift Cards', D.node('one4all-gift-cards', 'N-pxrlv')],
  ['Prepaid Phone Gift Cards', D.node('airtime-gift-cards-specialty', 'N-ay28t')],
  ['Retail Gift Cards', D.node('retail-gift-cards', 'N-tde9b')],
]
for (const [l, p] of GIFT_CARD_TILES) reg(l, p)

const groupOf = path => D.SHOP_ALL.find(([, links]) => links.some(([, p]) => nodeId(p) === nodeId(path)))
const search = term => `/s?searchTerm=${encodeURIComponent(term).replace(/%20/g, '+')}`
const LABELS = new Map()
for (const [l, p] of [...D.MENU, ...D.SHOP_ALL.flatMap(([, links]) => links), ...D.FOOTER.flatMap(([, links]) => links)]) if (!LABELS.has(l)) LABELS.set(l, p)
const byLabel = label => { const p = LABELS.get(label); if (!p) throw new Error(`target site: unknown category label ${label}`); return p }

// ---------- tile art ----------
const PHOTO_WORDS = [
  [/video game|gaming|playstation|xbox|nintendo|retro|nex/i, 'controller'], [/pc gam|computer/i, 'laptop'], [/headphone|audio|speaker/i, 'headphones'],
  [/tv|home theater/i, 'television'], [/phone|cell/i, 'smartphone'], [/wearable/i, 'smartwatch-black'], [/smart home|wi-fi|network/i, 'smart-plug'],
  [/tablet|e-reader/i, 'tablet'], [/camera/i, 'mirrorless-camera'], [/virtual reality/i, 'vr-headset-white'], [/accessor/i, 'controller-black'],
  [/electronic|\btech\b/i, 'headphones-cream'], [/gift card|giftcard|cards$/i, 'card-binder-red'], [/women/i, 'hoodie'], [/men/i, 'tshirt'], [/young adult/i, 'cap'], [/kids|toddler/i, 'sneakers'],
  [/baby|diaper|nursery|stroller|car seat|gear & activity/i, 'baby-bottle'], [/kitchen|dining/i, 'dutch-oven'], [/furniture/i, 'armchair'], [/bath/i, 'bath-towels'],
  [/storage|organization/i, 'storage-bins'], [/outdoor|patio|garden|camping/i, 'tent-green'], [/home/i, 'lamp'], [/school|office|desk|learning|college/i, 'notebooks'],
  [/toy|character|doll|stuffed|vehicle|games/i, 'building-bricks'], [/fitness|exercise|sports|pool|bike/i, 'dumbbells-purple'], [/movie|tv show|music/i, 'vinyl-blue-hour'],
  [/book/i, 'book-orchard-house'], [/makeup|beauty|studio/i, 'lipstick'], [/hair/i, 'shampoo'], [/skin/i, 'serum'], [/personal care/i, 'moisturizer'],
  [/vitamin|medicine|health|first aid|nutrition|wellness|pharmacy|clinic/i, 'sunscreen'], [/laundry/i, 'laundry-detergent'], [/paper towel|household/i, 'paper-towels'],
  [/toilet/i, 'toilet-paper'], [/cleaning/i, 'cleaning-wipes'], [/dog|pet/i, 'dog-food'], [/cat/i, 'cat-food'], [/small animal/i, 'timothy-hay-bag'], [/bird/i, 'bird-seed'],
  [/fish/i, 'fish-flakes-jar'], [/produce|grocery/i, 'apples'], [/meat|seafood/i, 'canned-tuna'], [/dairy/i, 'milk'], [/frozen/i, 'greek-yogurt'], [/snack/i, 'cookies'],
  [/party|celebrat|gift idea|christmas|halloween|easter|mother/i, 'mug-set-cream'], [/deal|clearance|black friday|cyber|circle week|weekly/i, 'tote'], [/optical/i, 'analog-watch'],
  [/assembly|install|parent services/i, 'desk'], [/new arrival|what/i, 'canvas-sneakers'], [/community/i, 'basket'],
]
const PHOTO_EXACT = {
  'Video Game Deals': 'controller-black', 'Video Game New Releases': 'game-starfall-expedition', 'Nintendo Switch 2': 'handheld-console', 'Nintendo Switch': 'handheld-case-black',
  'PlayStation 5': 'ps5-console', 'XBOX Series X|S': 'xbox-console', 'Nex Playground': 'game-pocket-garden', 'Video Game Accessories': 'controller-dock-white',
  'Video Game Pre-Orders': 'game-apex-rally', 'PlayStation 4': 'controller', 'PC Games & Accessories': 'keyboard-mouse-bundle', 'PC Gaming': 'gaming-chair',
  'Retro Gaming': 'disc-wallet-black', 'Video Game Collectibles': 'figure', 'Super Mario': 'handheld-console', 'Pokémon': 'mythic-skybound-booster',
  'Minecraft': 'digital-minecraft', 'Call of Duty': 'gaming-headset', 'Fortnite': 'digital-fortnite', 'Final Fantasy': 'mythic-ember-deck',
  'Gift Ideas': 'mug-set-cream', 'Party Supplies': 'glassware', 'Halloween': 'lantern-cream', 'Christmas': 'cushion', 'Easter': 'plush-rabbit', 'Mother’s Day': 'perfume',
  'Clearance': 'tote', 'Deals': 'stand-mixer', 'Weekly Ad': 'notebooks', 'Black Friday': 'television', 'Cyber Monday': 'laptop', 'Circle Week': 'basket',
  'Electronics Deals': 'television', 'Electronics & Tech': 'headphones-cream', 'Sports & Outdoors': 'dumbbells-purple', 'Target Beauty Studio': 'perfume', 'Wellness': 'yoga-mat-lavender',
}
export function tileArt(label) {
  const key = PHOTO_EXACT[label] || PHOTO_WORDS.find(([re]) => re.test(label))?.[1] || 'basket'
  return productPhoto(key, '', 'tg-cat-photo') || '<span class="tg-cat-photo"></span>'
}
const circles = (base, tiles, label = 'Shop by category') => `<nav class="tg-cat-circles" aria-label="${esc(label)}">${tiles.map(([l, p]) => `<a href="${base}${p}"><span class="tg-cat-art">${tileArt(l)}</span><b>${esc(l)}</b></a>`).join('')}</nav>`
const section = (title, inner, cls = '') => `<section class="tg-section tg-site-section ${cls}"><h2>${esc(title)}</h2>${inner}</section>`

// ---------- header pieces ----------
const MENU_SUBS = {
  'Clothing, Shoes & Accessories': 'Clothing, Shoes & Accessories', 'Home & Decor': 'Home & Patio', 'Baby': 'Baby', 'Beauty': 'Beauty & Personal Care',
  'Health': 'Health', 'School & Office Supplies': 'School & Office', 'Toys & Games': 'Toys', 'Electronics & Tech': 'Electronics', 'Books, Music & Movies': 'Entertainment',
  'Sports & Outdoors': 'Sports, Fitness & Outdoors', 'Household Essentials': 'Household Essentials', 'Pets': 'Pets', 'Grocery': 'Grocery', 'Gift Ideas': 'Celebrations & more',
}
export function menuDrawer(base) {
  const item = ([label, path]) => {
    const group = D.SHOP_ALL.find(([g]) => g === MENU_SUBS[label])
    if (!group) return `<a class="tg-menu-link" href="${base}${path}">${esc(label)}</a>`
    const subs = group[1].filter(([, p]) => nodeId(p) !== nodeId(path))
    return `<details name="departments"><summary>${esc(label)}</summary><div class="tg-menu-panel"><a href="${base}${path}"><b>Shop all ${esc(label)}</b></a>${subs.map(([l, p]) => `<a href="${base}${p}">${esc(l)}</a>`).join('')}</div></details>`
  }
  return `<details class="tg-native-menu"><summary>Categories</summary><div class="tg-menu-body"><a href="${base}${D.SHOP_ALL_PATH}"><b>Shop all categories</b></a>${D.MENU_GROUPS.map(([h, from, to]) => `<p class="tg-menu-group">${esc(h)}</p>${D.MENU.slice(from, to).map(item).join('')}`).join('')}</div></details>`
}
export const UTILITY = D.UTILITY
export const PATHS = { deals: D.DEALS_PATH, pickup: D.PICKUP_PATH, stores: D.FIND_STORES_PATH }

export function signupBand(base) {
  return `<section class="tg-signup" aria-labelledby="tg-signup-title"><div class="tg-wrap"><div><h2 id="tg-signup-title">Get top deals, latest trends, and more.</h2><p class="tg-fine">By clicking ‘Sign up’ you agree to Target’s ${a(base, '/c/target-privacy-policy/-/N-4sr7p', 'Privacy policy')} and ${a(base, '/c/terms-conditions/-/N-4sr7l', 'Terms')}.</p></div><form method="post" action="${base}/newsletter" class="tg-signup-form"><label class="visually-hidden" for="signup-email">Email address</label><input id="signup-email" name="email" type="email" autocomplete="email" placeholder="Email address" required><button class="tg-btn tg-btn-dark">Sign up</button></form></div></section>`
}
export function footerColumns(base) {
  return `<div class="tg-wrap tg-footer-cols tg-footer-cols4">${D.FOOTER.map(([h, links]) => `<div><h3>${esc(h)}</h3>${links.map(([l, p]) => `<a href="${base}${p}">${esc(l)}</a>`).join('')}</div>`).join('')}</div>
  <div class="tg-wrap tg-legal"><a class="tg-logo-sm" href="${base}/" aria-label="Target home footer"><span class="tg-bullseye tg-bullseye-sm" aria-hidden="true"></span></a><nav aria-label="Legal">${D.LEGAL.map(([l, p]) => `<a href="${base}${p}">${esc(l)}</a>`).join('')}</nav></div>`
}

// ---------- homepage ----------
const offer = (base, path, big, small, note = '') => `<a class="tg-offer" href="${base}${path}"><span class="tg-offer-big">${big}</span><span class="tg-offer-small">${esc(small)}</span>${note ? `<span class="tg-fine">${esc(note)}</span>` : ''}</a>`
const H = p => byLabel(p)
export function homePage({ base, catalog, rows = {} }) {
  const halloween = D.node('halloween', 'N-5xt2o')
  return `<h1 class="visually-hidden">Homepage</h1>
  <section class="tg-home-hero" style="background-image:url('/static/art/depth/target-fall-home-campaign.png')"><div><p class="tg-eyebrow">New arrivals</p><h2>What's in for fall</h2><p>Cozy layers, warm accents and new-season finds, all in one place.</p><a class="tg-btn" href="${base}${H('Target New Arrivals')}">Shop new arrivals</a></div></section>
  ${section('Save on Halloween must-haves', `<div class="tg-offers">${offer(base, halloween, 'Up to 50% off', 'Halloween costumes, decorations & more*', 'Online only.')}${offer(base, halloween, 'BOGO 25% off', 'trick-or-treat candy*')}${offer(base, halloween, '30% off', 'select Halloween outdoor decor*')}${offer(base, D.DEALS_PATH, 'Shop all', 'Halloween Deals')}</div><p class="tg-fine">*Offers valid through 10/31/2026 on select items while supplies last. Prices shown on product pages; see the Weekly Ad for details.</p>${rows.halloween || ''}`, 'tg-band-orange')}
  ${section('Deals for your fall routine', `<div class="tg-offers">${offer(base, H('Home'), 'Up to 50% off', 'rugs*', 'Online only.')}${offer(base, H('Kitchen & Dining'), 'Up to 30% off', 'kitchen items*')}${offer(base, H('Household Essentials'), 'Up to 35% off', 'floor care items*')}${offer(base, H('Toys & Games'), 'Buy 2, get 1 Free', 'games & puzzles*')}${offer(base, H('Toys'), 'Up to 40% off', 'dolls, puppets & figures*', 'Online only.')}</div>`)}
  ${catalog}
  ${section('Now trending in deals', circles(base, [['Grocery Deals', H('Grocery')], ['Home Deals', H('Home')], ['Beauty & Personal Care Deals', H('Beauty')], ['Household Essentials Deals', H('Household Essentials')], ['Toy Deals', H('Toys')], ['Electronics Deals', H('Electronics')], ['Video Games Deals', D.VIDEO_GAMES_PATH], ['Clearance', H('Clearance')]], 'Trending deals'))}
  ${rows.deals || ''}
  ${section('Next-level fall newness', (rows.newness || '') + circles(base, [['Women’s', H('Women’s')], ['Men’s', H('Men’s')], ['Kids’', H('Kids’')], ['Home', H('Home')], ['Beauty', H('Beauty')], ['Target New Arrivals', H('Target New Arrivals')]], 'Fall newness'))}
  ${section('Ready for every celebration', circles(base, [['Gift Ideas', H('Gift Ideas')], ['Party Supplies', H('Party Supplies')], ['Halloween', halloween], ['Christmas', H('Christmas')], ['Gift Cards', D.GIFT_CARDS_PATH]], 'Celebrations'))}
  <section class="tg-home-promo" style="background-image:url('/static/art/depth/toys-campaign.png')"><div><h2>Discover the joy of the holiday kids' catalog</h2><p>Toys, games and gifts to spark big imaginations.</p><a class="tg-btn" href="${base}${H('Toys')}">Explore toys</a></div></section>
  <section class="tg-circle-promos" aria-label="Target Circle">${[['Target Circle™', 'Join free to save even more', 'Deals, a birthday gift and more with free membership.', D.CIRCLE_PATH], ['Target Circle™ Card', 'Save 5% every day', 'Instant extra 5% off at checkout with any Target Circle card.', '/circlecard'], ['Target Circle 360™', 'Free, fast shipping & same-day delivery', 'Annual membership $99 a year or $10.99 a month.', D.CIRCLE_360_PATH]].map(([t, h, p, href]) => `<a href="${base}${href}" class="tg-circle-card"><span class="tg-bullseye tg-bullseye-sm" aria-hidden="true"></span><b>${esc(t)}</b><h3>${esc(h)}</h3><p>${esc(p)}</p></a>`).join('')}</section>
  ${section('Featured categories', circles(base, D.MENU.filter(([, , s]) => !s).slice(3, 27).map(([l, p]) => [l, p]), 'Featured categories'))}`
}

// ---------- department / category landing pages ----------
const TRENDING = ['gta 6', 'nintendo switch 2', 'ps5', 'pokemon cards', 'airpods', 'halloween costumes', 'stanley cup', 'legos']
const trending = base => section('Trending Searches', `<div class="tg-suggestion-links">${TRENDING.map(t => a(base, search(t), t)).join('')}</div>`, 'tg-trending')
const SPECIAL = {
  'N-5xtg5': base => {
    const subs = [['Video Game Deals', D.DEALS_PATH], ['Video Game New Releases', search('video game new releases')], ['Nintendo Switch 2', search('nintendo switch 2')], ['Nintendo Switch', search('nintendo switch')], ['PlayStation 5', search('playstation 5')], ['XBOX Series X|S', search('xbox series x')], ['Nex Playground', search('nex playground')], ['Virtual Reality', search('virtual reality')], ['Video Game Accessories', search('video game accessories')], ['Video Game Pre-Orders', search('video game pre-orders')], ['PlayStation 4', search('playstation 4')], ['Target Refurbished & Pre-Owned Video Games & Consoles', D.node('pre-owned-refurbished-electronics', 'N-4rtuu')], ['Gaming Gift Cards', D.node('gaming-gift-cards', 'N-5xtfh')], ['PC Games & Accessories', search('pc games')], ['PC Gaming', search('pc gaming')], ['Retro Gaming', search('retro gaming')], ['Video Game Collectibles', search('video game collectibles')]]
    return { title: 'Video Games', subtitle: 'Consoles, Games & Accessories', hero: ['New & trending picks to level up your play', 'Shop the latest releases, pre-orders and gear for every platform.', 'gaming-campaign'], top: circles(base, subs, 'Video game categories') + section('Shop favorite franchises', circles(base, ['Super Mario', 'Pokémon', 'Minecraft', 'Call of Duty', 'Fortnite', 'Final Fantasy'].map(f => [f, search(f)]), 'Franchises')), scope: p => p.department === 'video-games' }
  },
  'N-5xtg6': base => {
    const subs = [['Apple', search('apple')], ['Computers & Tablets', byLabel('Computers & Office')], ['Headphones', byLabel('Headphones')], ['TVs & Home Theater', byLabel('TV & Home Theater')], ['Video Games', D.VIDEO_GAMES_PATH], ['Wearable Technology', byLabel('Wearable Tech')], ['Cameras & Photography', byLabel('Cameras & Camcorders')], ['Smart Home', byLabel('Smart Home')], ['Tablets & E-Readers', byLabel('Tablets & E-readers')], ['Tech Accessories', search('tech accessories')], ['Kids\' Electronics', byLabel('Kids’ Electronics')], ['Home Audio & Speakers', byLabel('Speakers & Audio Systems')], ['Printers & Scanners', search('printers')], ['Target Refurbished & Pre-Owned', byLabel('Pre-owned & Refurbished Electronics')], ['Batteries', search('batteries')], ['Cell Phones', byLabel('Cell Phones')], ['Drones', search('drones')], ['Wi-Fi & Networking', byLabel('Wi-Fi & Networking')]]
    return { title: 'Electronics & Tech', hero: ['New & featured', 'The latest tech for work, play and everything in between.', 'electronics-campaign'], top: circles(base, subs, 'Electronics categories') + section('Best-selling tech deals', `<div class="tg-offers">${offer(base, D.DEALS_PATH, 'Electronics Deals', 'See all current tech offers')}${offer(base, D.VIDEO_GAMES_PATH, 'Video Games', 'Consoles, games & accessories')}${offer(base, search('tech gifts'), 'Tech Gift HQ', 'Gifts for every techie')}</div>`), bottom: section('Benefits of getting tech at Target', `<div class="tg-benefits">${[['Price Match Guarantee', 'We’ll match the price if you find it lower at select competitors.', '/help/articles/policies-guidelines/price-match-guarantee'], ['Free 2-Day Shipping', 'On orders of $35 or more, or with Target Circle 360™ or a Target Circle™ Card.', D.node('free-2-day-shipping', 'N-49cz6')], ['Easy returns', 'Most electronics can be returned within 30 days.', '/returns'], ['Easy Install by HelloTech', 'Book in-home setup for TVs, smart home and more.', D.node('easy-install', 'N-raym1')]].map(([h, p, href]) => `<a href="${base}${href}"><b>${esc(h)}</b><span>${esc(p)}</span></a>`).join('')}</div>`), scope: p => ['electronics', 'video-games'].includes(p.department) }
  },
  'N-4xw74': base => ({ title: 'Deals', hero: null, top: section('Shop by category', circles(base, [['All Deals', D.DEALS_PATH], ['Halloween Deals', D.node('halloween', 'N-5xt2o')], ['Grocery Deals', byLabel('Grocery')], ['Home Deals', byLabel('Home')], ['Beauty & Personal Care Deals', byLabel('Beauty')], ['Household Essentials Deals', byLabel('Household Essentials')], ['Toy Deals', byLabel('Toys')], ['Baby Deals', byLabel('Baby')], ['Clothing, Shoes & Accessories Deals', byLabel('Clothing, Shoes & Accessories')], ['Electronics Deals', byLabel('Electronics')], ['Weekly Ad', '/weekly-ad'], ['Clearance', byLabel('Clearance')]], 'Deal categories'))
      + section('Deals on bestsellers', circles(base, [['Toys', byLabel('Toys')], ['Halloween', D.node('halloween', 'N-5xt2o')], ['Grocery', byLabel('Grocery')], ['Beauty & Personal Care', byLabel('Beauty')], ['Electronics', byLabel('Electronics')], ['Kitchen Appliances', byLabel('Kitchen & Dining')]], 'Bestseller deals'))
      + section('Featured deals', `<div class="tg-offers">${offer(base, D.node('halloween', 'N-5xt2o'), 'BOGO 25% off', 'trick-or-treat candy*')}${offer(base, D.node('halloween', 'N-5xt2o'), '30% off', 'select Halloween outdoor decor*')}${offer(base, byLabel('Toys & Games'), 'Buy 2, get 1 Free', 'games & puzzles*')}${offer(base, byLabel('Home'), 'Up to 50% off', 'rugs*', 'Online only.')}${offer(base, byLabel('Kitchen & Dining'), 'Up to 30% off', 'kitchen items*')}${offer(base, '/circlecard', 'Get $50 in rewards', 'when you’re approved for a credit card & spend $50.*', '*Terms apply.')}</div><p class="tg-fine">*Offers valid on select items while supplies last. Sale prices are shown on product pages. Exclusions apply.</p>`)
      + section('Shop more deals', circles(base, [['Health Deals', byLabel('Health')], ['Pet Deals', byLabel('Pets')], ['Kitchen & Dining Deals', byLabel('Kitchen & Dining')], ['Outdoor Living & Garden Deals', byLabel('Outdoor Living & Garden')], ['Video Games Deals', D.VIDEO_GAMES_PATH], ['Entertainment Deals', byLabel('Books, Music & Movies')]], 'More deals')), scope: p => !!p.deal }),
  'N-ng0a0': base => ({ title: 'Order Pickup', hero: ['Pick up & keep going', 'Order ahead & we’ll have it waiting for you in store. Or switch to Drive Up in the app.', 'home-campaign'], top: circles(base, ['Beauty', 'Grocery', 'Household Essentials', 'Personal Care', 'Pets'].map(l => [`Shop all ${l}`, byLabel(l)]), 'My Categories') + section('Top sellers', `<p>Order Pickup top sellers vary by store. Choose your store to see what’s ready for pickup near you. ${a(base, D.node('drive-up', 'N-9d42z'), 'Learn how Drive Up works')}</p>`), scope: () => false }),
  'N-5xsxu': base => ({ title: 'Gift Cards', hero: null, top: `<div class="tg-gc-help"><section><h2>Target GiftCards Help</h2>${a(base, '/guest/gift-card-balance', 'Check your GiftCard balance')}${a(base, '/help/articles/gift-cards/target-giftcards', 'FAQs')}${a(base, '/security', 'Fraud prevention info')}</section><section><h2>How would you like it delivered?</h2><div class="tg-gc-delivery">${[['E-mail', 'Send it digitally in a jiffy.'], ['Mail', 'Send it to their doorstep.'], ['Text', 'Send an SMS to their inbox.']].map(([h, p]) => `<a href="${base}${D.node('target-giftcards-gift-cards', 'N-5xsxt')}"><b>${h}</b><span>${p}</span></a>`).join('')}</div></section></div>` + circles(base, GIFT_CARD_TILES, 'Gift card categories'), scope: () => false }),
}
const NO_HEAD = ['Clothing, Shoes & Accessories', 'Entertainment', 'Celebrations & more', 'Deals & more', 'Services']
export function categoryView(base, path) {
  const id = nodeId(path), entry = NODES.get(id)
  if (!entry) return null
  const special = SPECIAL[id]?.(base)
  const group = groupOf(path)
  const title = special?.title || entry.label
  const siblings = group ? group[1].filter(([, p]) => nodeId(p) !== id) : []
  const isHead = group && !NO_HEAD.includes(group[0]) && nodeId(group[1][0][1]) === id
  const menuGroup = !group && D.SHOP_ALL.find(([g]) => g === MENU_SUBS[entry.label])
  const map = { 'N-hz89j': 'kitchen-dining', 'N-5xtvd': 'home-decor', 'N-rdihz': 'clothing', 'N-55r1x': 'beauty', 'N-5xtzq': 'beauty', 'N-5xt44': 'pets', 'N-5xtb0': 'toys', 'N-5xt1a': 'grocery', 'N-5xsz1': 'household', 'N-5xteg': 'electronics' }
  const fixtureScope = special?.scope || (map[id] ? p => p.department === map[id] && (id !== 'N-5xteg' || p.type === 'Headphones') : () => false)
  // Everyday assortment items (shelf.js) list the Target category nodes they belong to.
  const scope = p => p.shelf ? p.nodes.includes(id) : fixtureScope(p)
  const hero = special?.hero
  const intro = `<nav class="tg-crumbs" aria-label="Breadcrumb"><a href="${base}/">Target</a>${group && !isHead ? ` › <a href="${base}${group[1][0][1]}">${esc(group[1][0][0])}</a>` : ''} › <span aria-current="page">${esc(title)}</span></nav>
  <div class="tg-cat-head"><h1>${esc(title)}</h1>${special?.subtitle ? `<p class="tg-fine">${esc(special.subtitle)}</p>` : ''}</div>
  ${hero ? `<section class="tg-cat-hero" style="background-image:url('/static/art/depth/${hero[2]}.png')"><div><h2>${esc(hero[0])}</h2><p>${esc(hero[1])}</p></div></section>` : ''}
  ${special ? special.top : isHead && siblings.length ? circles(base, siblings, `Shop ${title}`) : menuGroup ? circles(base, menuGroup[1], `Shop ${title}`) : ''}`
  const outro = `${special?.bottom || ''}${!isHead && siblings.length ? section('Related categories', `<div class="tg-suggestion-links">${siblings.map(([l, p]) => a(base, p, l)).join('')}</div>`) : ''}${trending(base)}`
  return { title, intro, outro, scope }
}
export function shopAllPage(base) {
  return `<nav class="tg-crumbs" aria-label="Breadcrumb"><a href="${base}/">Target</a> › <span aria-current="page">Shop All Categories</span></nav><div class="tg-shop-all"><h1>Shop All Categories</h1>${D.SHOP_ALL.map(([h, links]) => `<section><h2>${esc(h)}</h2>${circles(base, links, h)}</section>`).join('')}</div>`
}

// ---------- information pages ----------
// [h1, intro, [[h2, text]], links?]; text is plain, links are [label, path].
const P = (h1, intro, sections, extra = {}) => ({ h1, intro, sections, ...extra })
const CORP = 'Find more on Target’s corporate site at corporate.target.com.'
export const INFO = {
  '/corporate/about': P('About Target', 'Target Corporation is a general merchandise retailer headquartered in Minneapolis, Minnesota, with nearly 2,000 stores across all 50 states and Target.com.', [['Our history', 'Target’s roots go back to the Dayton Dry Goods Company, founded in Minneapolis in 1902. The first Target store opened in Roseville, Minnesota, in 1962.'], ['Our purpose', 'To help all families discover the joy of everyday life.'], ['Learn more', CORP]], { links: [['Careers', '/corporate/careers'], ['News & Blog', '/corporate/news-features'], ['Investors', '/corporate/investors']] }),
  '/corporate/careers': P('Careers', 'Target hires team members for stores, supply chain, distribution and headquarters roles.', [['Working at Target', 'Roles range from store team member and fulfillment expert to technology, merchandising and corporate positions. Benefits and pay are described on Target’s careers site.'], ['Apply', 'Search open roles and apply on Target’s careers site at corporate.target.com/careers.']], { links: [['Team Member Services', D.node('team-member-services', 'N-4srq9')]] }),
  '/corporate/news-features': P('News & Blog', 'Stories about Target’s products, team, partnerships and communities from Target’s corporate newsroom.', [['Latest stories', 'The newsroom publishes product launches, seasonal campaigns, company announcements and community stories.'], ['Press', CORP]], { links: [['Press Center', '/corporate/press']] }),
  '/corporate/target-brands': P('Target Brands', 'Target’s owned brands are designed and sold only at Target.', [['Our owned brands', 'Examples include Good & Gather, up&up, Threshold, Cat & Jack, Universal Thread, Goodfellow & Co, Room Essentials, Favorite Day, Brightroom, All in Motion, Wondershop and Hyde & EEK! Boutique.'], ['Returns', 'Most Target Owned Brand items can be returned within one year with a receipt.']], { links: [['Return policy', '/returns']] }),
  '/bullseye-shop': P('Bullseye Shop', 'Bullseye Shop is Target’s branded merchandise store, with apparel and gifts featuring Bullseye, Target’s dog mascot.', [['About the shop', 'Bullseye Shop merchandise is sold on its own website, bullseyeshop.com, and ships separately from Target.com orders.']]),
  '/corporate/sustainability-governance': P('Sustainability & Governance', 'Target reports on its sustainability strategy, corporate responsibility and governance practices.', [['Target Forward', 'Target’s sustainability strategy covers products, operations and communities.'], ['Governance', 'Board, committee and policy information is published for investors and guests. ' + CORP]]),
  '/corporate/press': P('Press Center', 'Resources for journalists covering Target, including press releases, media contacts and image assets.', [['Media resources', CORP]], { links: [['News & Blog', '/corporate/news-features']] }),
  '/advertise-with-us': P('Advertise with Us', 'Roundel is Target’s media company. It helps brands reach Target guests across Target.com, the Target app and partner channels.', [['About Roundel', 'Learn about Roundel’s advertising solutions and contact the team at roundel.com.']]),
  '/corporate/investors': P('Investors', 'Target Corporation is traded on the New York Stock Exchange under the ticker TGT.', [['Investor information', 'Quarterly results, annual reports, SEC filings, events and shareholder information are published on Target’s investor relations site. ' + CORP]]),
  '/partners': P('Affiliates & Partners', 'The Target Partners program lets publishers and creators earn commission when they refer guests to Target.com.', [['How it works', 'Partners apply, share links to Target products and earn commission on qualifying purchases. The program runs on its own website.']]),
  '/corporate/suppliers': P('Suppliers', 'Information for companies that supply products and services to Target.', [['Partner with Target', 'Target describes its supplier requirements, diversity programs and onboarding on its corporate site. ' + CORP]]),
  '/targetplus': P('TargetPlus', 'Target Plus is Target’s invite-only marketplace that lets select third-party sellers list products on Target.com.', [['Target Plus Partners', 'Items from Target Plus Partners are sold and shipped by the partner. Orders that mix Target and Target Plus items are split into separate order numbers.'], ['Payment', 'PayPal is not available for Target Plus items.']]),
  '/security': P('Security & Fraud', 'How to recognise scams that use Target’s name and how to report suspicious activity.', [['Protect yourself', 'Target will never ask you to pay with gift cards to settle a debt or claim a prize. Be cautious of unexpected texts, emails or calls asking for account details.'], ['Gift card scams', 'Only give Target GiftCard numbers to people you know and trust.'], ['Report a concern', 'Use Contact Us to report a suspicious message or account activity.']], { links: [['Contact Us', '/help/contact-us'], ['Gift card balance', '/guest/gift-card-balance']] }),
  '/guest-privacy': P('Your Privacy Choices', 'Manage how Target uses your personal information.', [['Choices you can make', 'You can opt out of the sale or sharing of personal information for targeted advertising, manage marketing emails and texts, and request access to or deletion of your data.'], ['Make a request', 'Sign in to your Target account to manage your choices, or contact Target Guest Relations for help with a privacy request.']], { links: [['Privacy Policy', D.node('target-privacy-policy', 'N-4sr7p')], ['Interest Based Ads', D.node('interest-based-advertising-privacy-policy', 'N-ztavm')]] }),
  '/guest-privacy/legal-privacy': P('Legal & Privacy', 'Find Target’s legal terms and privacy policies in one place.', [['Policies', 'Read the Terms & Conditions, Privacy Policy, health privacy policy, California privacy rights and interest-based advertising notice.']], { links: D.LEGAL }),
  '/feedback': null,
  '/help/articles/news-safety/product-recalls': P('Product recalls', 'Our guests, your safety, is our highest priority. Find Target’s most recent recalls or search recalls by category below.', [['Recent recalls', 'There are no new recalls for items sold at Target this week. Check back for updates.'], ['General merchandise', 'Recalls for toys, home, electronics and other general merchandise.'], ['Grocery/OTC', 'Recalls for food and over-the-counter health products.'], ['Looking for a recall?', 'Search for recalls by keyword, manufacturer, or model/item number on target.com, or contact Target.']], { links: [['Contact Us', '/help/contact-us']] }),
  '/help/articles/compliances/accessibility': P('Accessibility', 'Target is committed to making its website, apps and stores accessible to all guests, including guests with disabilities.', [['Digital accessibility', 'Target designs and tests its digital experiences against the Web Content Accessibility Guidelines (WCAG).'], ['Need help?', 'If you have trouble using any part of the site, contact Target for help.']], { links: [['Contact Us', '/help/contact-us']] }),
  '/help/articles/compliances/ca-transparency-in-supply-chains-act': P('California Transparency in Supply Chains Act', 'Target’s disclosure about efforts to eradicate slavery and human trafficking from its direct supply chain.', [['Verification and audits', 'Target evaluates and audits vendor factories against its standards of vendor engagement.'], ['Certification and training', 'Vendors certify compliance with laws, and Target trains team members responsible for supply chain management.']]),
  '/help/articles/policies-guidelines/price-match-guarantee': P('Price Match Guarantee', 'If you find a lower price on an identical item, Target will match it at select competitors and on Target.com.', [['How it works', 'Price matches can be requested at the time of purchase or within 14 days after purchase. The item must be identical and in stock at the competitor.'], ['Exclusions', 'Some items and offers, such as clearance, membership-only prices and marketplace sellers, are not eligible.']]),
  '/help/articles/gift-cards/target-giftcards': P('Target GiftCards', 'Answers to common questions about Target GiftCards and eGiftCards.', [['Using a GiftCard', 'Target GiftCards can be used in store, on Target.com and in the Target app. They never expire and have no fees.'], ['Check a balance', 'You need the card number and access number to check a balance online.']], { links: [['Check a gift card balance', '/guest/gift-card-balance'], ['Gift Cards', D.GIFT_CARDS_PATH]] }),
  '/returns': P('Target Return Policy', '', [['Free & convenient returns', 'Target brand items have 365 days with a receipt, most other items sold by Target have 90 days, and most items have 30 days. Get an extra 30 days when you have a membership or pay with a Target Circle Card. Some items, including electronics and limited time offer collections, have their own return policies. Certain items can’t be returned, including gift cards, trading cards, digital downloads and open breast pumps.'], ['Free returns, no matter how you do it', 'Drive Up: Save time by making a return without leaving your car — you start in the Target app. In-store and mail-in returns are also free, and the app lets you use your Wallet barcode for in-store returns without a paper receipt.'], ['Special Items', 'Some large or heavy items, such as furniture and electronics, may be eligible for return pickup. Most registry items can be returned within one year of the event date. Recalled items and the steps to take are listed on a separate page.'], ['Frequently asked questions', 'Start a return from your purchase history. Online orders can be returned once they’ve been delivered.']], { links: [['Track Orders', '/orders'], ['Product recalls', '/help/articles/news-safety/product-recalls'], ['Target Help', '/help']] }),
  '/circle/deals': P('Target Circle Deals', 'Save on the things you love with deals for Target Circle members.', [['How Circle Deals work', 'Members add deals in the Target app or on Target.com, then save when they shop in store or online.'], ['More ways to save', 'Browse current sale prices across every department on the Deals page and in the Weekly Ad.']], { links: [['Deals', D.DEALS_PATH], ['Target Circle™', D.CIRCLE_PATH]] }),
  [D.CIRCLE_PATH]: P('Your membership', 'Target Circle™ · Target Circle™ Card · Target Circle 360™', [['Join free to save even more', 'Target Circle is Target’s free loyalty program: hundreds of deals, a birthday gift, and earnings on eligible purchases. Sign in or create account to get started.'], ['Unlock added value', 'Add a Target Circle Card for 5% off every day, or Target Circle 360 for free, fast shipping and same-day delivery.']], { links: [['Sign in or create account', '/login'], ['Target Circle™ Card', '/circlecard'], ['Target Circle 360™', D.CIRCLE_360_PATH]], kind: 'promo' }),
  '/circlecard': P('Target Circle card', 'Instant extra 5% off at checkout with any Target Circle card.', [['Different cards, same great benefits', 'Credit card: Flexible spending with no monthly or annual fees. Debit card: No bills, no credit check, just shopping.'], ['Get more as a Target Circle card holder', 'Save 5% everyday, in-store & online · Free 2-day shipping on hundreds of thousands of items · No monthly or annual fees · 50% off Target Circle 360™ · No rush returns: an extra 30 days · Stack your savings with Target Circle deals · 5% off at Starbucks · 5% off specialty gift cards.'], ['Ready to start saving?', 'Apply in minutes online, in the Target app or at any Target checkout lane. Credit card subject to approval.'], ['Target Circle Card benefits & program rules', 'Benefits and program rules are set by Target and the card issuer.']], { kind: 'promo' }),
  [D.CIRCLE_360_PATH]: P('Target Circle 360™', 'Save over 50% on same-day delivery — members save over $300 a year.', [['Free, fast shipping', 'Free 2-day shipping on hundreds of thousands of items.'], ['Same-day delivery', 'Unlimited same-day delivery on orders over $35.'], ['Monthly freebies', 'Free items each month for members.'], ['Early access to big sales', 'Shop select sales before everyone else.'], ['No rush returns', 'An extra 30 days to return most items.'], ['Membership', 'Annual membership $99 a year ($8.25/month). Monthly membership $10.99 a month. Or choose a free 14-day trial with limited benefits. Join in the Target app.']], { kind: 'promo' }),
  '/l/target-circle-week/-/N-7196o': P('Target Circle Week', 'Target Circle Week is Target’s members-only sales event with deals across the store.', [['Event details', 'Dates and deals are announced before each event. Check back soon for the next Target Circle Week.']], { links: [['Deals', D.DEALS_PATH]] }),
}
const CP = (h1, intro, sections, extra) => P(h1, intro, sections, extra)
Object.assign(INFO, {
  'N-q6m3b': CP('Club Target', 'Club Target is Target’s creator program: members share their Target finds, complete themed challenges and earn points to move up through tiers.', [['Turn your content into rewards', 'Higher tiers unlock perks such as gift cards, commissions and a chance to be featured on Target’s social channels.'], ['Club Target is looking for someone who is', 'Passionate about Target, creative and ready to share.'], ['Start creating in 3 easy steps', 'Apply, complete challenges and earn points.'], ['Got questions? Check out our FAQs', 'Find answers about eligibility, points and tiers in the Club Target FAQs.']]),
  'N-4srq9': CP('Target Team Member Services Hub', 'Resources for current team members, such as Workday, pay and benefits information, the Bullseye Shop and Collection186 apparel.', [['Team Member Resources', 'Links for current and former team members.'], ['W-2 Tax Statements', 'Current and former team members can access, download or replace their annual W-2 forms (paper or electronic delivery, and replacement or prior-year W-2s).'], ['Who to Contact for Help', 'Contact the HR service center or talk with your leader for help with pay, benefits and scheduling.']]),
  'N-54x94': CP('Clinic', 'Clinics inside select Target stores offer care for common illnesses, vaccinations and health screenings, operated by CVS Health’s MinuteClinic.', [['Services', 'Walk in or schedule a visit for minor illnesses, vaccines and physicals.'], ['Find a location', 'Clinic availability varies by store.']], { links: [['Find a Store', D.FIND_STORES_PATH]] }),
  'N-54y52': CP('Pharmacy', 'CVS Pharmacy locations inside Target stores fill prescriptions and offer vaccines.', [['Prescriptions', 'Transfer or refill prescriptions at a CVS Pharmacy inside Target.'], ['Health privacy', 'See the Health Privacy Policy for how health information is handled.']], { links: [['Health Privacy Policy', D.node('health-policy', 'N-4gc0k')], ['Find a Store', D.FIND_STORES_PATH]] }),
  'N-4y8o9': CP('Target Optical', 'Eye exams, glasses and contact lenses at Target Optical locations in select stores.', [['Eye care', 'Book an eye exam with an independent doctor of optometry and shop frames and lenses.'], ['Find a location', 'Target Optical is available in select stores.']], { links: [['Find a Store', D.FIND_STORES_PATH], ['Services', D.node('services', 'N-oq1wk')]] }),
  'N-oq1wk': CP('Services', 'Get more done in your day with services in store and online.', [['Get more done in your day', 'Target Circle Card: save an extra 5% when you pay with a Target Circle Card. Pay over time with Affirm, PayPal Pay Later or Cash App Pay. Find an ATM with the ATM Locator.'], ['Health & Personal Care Services', 'Target Optical, Warby Parker at Target, CVS Pharmacy and Clinic. One-on-one expert advice, just for you.'], ['FAQs', 'Service availability varies by store.']], { links: [['Target Optical', D.node('optical', 'N-4y8o9')], ['Pharmacy', D.node('pharmacy-health', 'N-54y52')], ['Clinic', D.node('clinic', 'N-54x94')], ['Target Circle™ Card', '/circlecard']] }),
  'N-4th2r': CP('Target App', 'Get more Target in one place.', [['The easiest way to shop and save', 'Get your favorite items with just a few taps.'], ['Download the Target app', 'Available on the Apple App Store and Google Play Store.'], ['Use the Buy Again tab for easy, personalized shopping', 'Reorder favorites in a tap.'], ['All the ways to save, all in one place.', 'Target Circle Deals, the Weekly Ad and a Wallet barcode that combines deals, gift cards and Target Circle Card savings at checkout.'], ['Fast & easy shopping, wherever you are.', 'Drive Up, shopping lists, aisle finder and in-store stock checks. Get unlimited same-day delivery on orders over $35 with a Target Circle 360™ membership, or pay $9.99 per delivery.']], { kind: 'promo' }),
  'N-bswkz': CP('Same Day Delivery', 'Subscribe to get free, fast delivery & monthly freebies, or pay $9.99 per delivery.', [['How same-day delivery works', 'Pick your delivery time: Place an order & choose a slot that works best for you. Hand-picked for you: A Shipt shopper will select your items & text you if they have any questions. Delivered right to your door: Get your order on time, just as planned.'], ['Check eligibility', 'Same Day Delivery availability depends on your address and the item. Look for delivery options on the product page and in your cart.']], { links: [['Target Circle 360™', D.CIRCLE_360_PATH], ['Shipping & Delivery', D.node('shipping-order-services', 'N-551st')]], kind: 'promo' }),
  'N-9d42z': CP('Drive Up', 'Exclusively in the Target app. Drive Up is free curbside pickup at a nearby Target store.', [['Fast, easy & always free', 'Order ahead and we’ll bring it out to your car.'], ['Download the Target app', 'Apps are available on the Apple App Store and Google Play Store.'], ['How it works', 'Find items, choose your store & shop. Switch to Drive Up & tell us you’re coming. Tell us you’re here & wait in your vehicle — staff bring your order to your car.'], ['Enjoy Starbucks with Drive Up', 'Add a Starbucks treat to your Drive Up order. Restrictions apply.'], ['Use Drive Up for returns', 'Start your return in the Target app, fill in the details, then bring it back & we’ll handle the rest.']], { kind: 'promo' }),
  'N-49cz6': CP('Free 2-Day Shipping', 'Hundreds of thousands of items qualify for 2-day shipping.', [['When will my order arrive?', 'Order placed before cutoff: arrives in 2 days. Order placed after cutoff: arrives in 3 days. Cutoff time may vary by zip code & item.'], ['Which items can I get delivered in 2 days?', 'Eligibility depends on where the item ships from and your ZIP code. Look for 2-day shipping on the product page.'], ['Always easy, every day', 'Free shipping applies with a $35 spend, a Target Circle 360 membership, or payment with a Target Circle Card.']], { kind: 'promo' }),
  'N-551st': CP('Drive Up, Pickup & Delivery', 'Order pickup or drive up: your choice.', [['Pick up & keep going', 'Order ahead & we’ll have it waiting for you in store. Have your order brought to your car by switching to Drive Up on the app.'], ['Same-day delivery, easier than ever', 'Order today, get it today. Start a free 14-day trial or pay $9.99 for same-day delivery of all your faves.'], ['Your order, shipped home', 'Free shipping as soon as tomorrow on hundreds of thousands of items on orders above $35. Check the product page, cart or checkout to find delivery eligibility & order-by times.'], ['Returns made easy', 'Get 90 days for returns, and up to one year for returns on Target-owned brand items. Return with Drive Up, in store or by mail. Free returns for online purchases.'], ['Frequently Asked Questions', 'Drive up & order pickup · Same-day delivery · Ship to home · Circle 360']], { links: [['Order Pickup', D.PICKUP_PATH], ['Drive Up', D.node('drive-up', 'N-9d42z')], ['Same Day Delivery', D.node('same-day-delivery', 'N-bswkz')], ['Free 2-Day Shipping', D.node('free-2-day-shipping', 'N-49cz6')], ['Returns', '/returns']], kind: 'promo' }),
  'N-4sr7l': CP('Terms & Conditions', 'These Terms & Conditions govern use of Target’s website, apps and related services. By using the site you agree to them.', [['Introduction', 'If you do not accept these terms, stop using the site.'], ['Content', 'Site content belongs to Target or its licensors.'], ['License and Access', 'Content is for personal, noncommercial use only. Scraping, commercial reuse and unauthorized automated access are prohibited.'], ['Agentic Commerce and Delegated Access', 'Only Target-approved agents may act on your account, and you remain responsible for their activity.'], ['Your Account', 'You are responsible for keeping your account secure.'], ['Target Circle Loyalty Program', 'Target can change, suspend or end Target Circle and Target Circle 360.'], ['Order Pickup and Drive Up', 'Orders must be picked up within the stated window.'], ['Limitations on Quantity', 'Target may limit quantities.'], ['Availability, Errors & Inaccuracies', 'Prices and availability may change and errors may be corrected.'], ['Returns', 'Returns follow Target’s return policy.'], ['Gift Cards & Certificates', 'Gift cards are subject to their own terms.'], ['Video, Movie, TV Program & Computer Game Ratings', 'Ratings are provided by third-party rating boards.']], { links: [['Return policy', '/returns'], ['Privacy Policy', D.node('target-privacy-policy', 'N-4sr7p')]] }),
  'N-4sr7p': CP('Target Privacy Policy', 'How Target collects, uses, shares and protects personal information.', [['1. Categories of Information Collected:', 'Contact, payment, purchase, device and location information, among others.'], ['2. How Is Your Information Collected?', 'Directly from you, automatically when you use Target services, and from other sources.'], ['3. How Is Your Information Used?', 'To fulfil orders, personalise your experience, provide services and protect guests.'], ['4. How Is Your Information Shared?', 'With service providers, partners and as required by law.'], ['5. What Choices Do You Have?', 'Manage marketing, cookies and advertising preferences.'], ['6. Loyalty & Financial Incentive Program', 'Details of Target Circle.'], ['7. State-Specific Privacy Information', 'Additional rights for residents of certain states.'], ['8. How Do You Access and Update Your Personal Information?', 'Through your account or by contacting Target.'], ['9. How is Your Personal Information Protected?', 'Security safeguards appropriate to the information.'], ['10. How Is Your Personal Information Retained?', 'Only as long as needed.'], ['12. How Do You Contact Target?', 'Use Contact Us.'], ['13. Target Privacy Policy Scope', 'Applies to Target’s US sites, apps and stores.']], { links: [['Your Privacy Choices', '/guest-privacy'], ['Contact Us', '/help/contact-us']] }),
  'N-m2wjt': CP('Your California Privacy Rights', 'California residents have additional rights about their personal information.', [['Your rights', 'Request to know, delete or correct personal information, and opt out of the sale or sharing of personal information.'], ['How to make a request', 'Use Your Privacy Choices or contact Target.']], { links: [['Your Privacy Choices', '/guest-privacy']] }),
  'N-ztavm': CP('Interest-Based Advertising', 'How Target and its partners use information to show ads that may interest you.', [['About interest-based ads', 'Ads may be based on browsing and purchase activity across sites and apps.'], ['Opting out', 'Opt out through Your Privacy Choices and industry opt-out tools.']], { links: [['Your Privacy Choices', '/guest-privacy']] }),
  'N-4gc0k': CP('Health Privacy Policy', 'How Target handles consumer health data collected through its sites, apps and services.', [['Health data we collect', 'Information such as health-related purchases and searches.'], ['Your rights', 'Access, delete and withdraw consent where applicable.']], { links: [['Privacy Policy', D.node('target-privacy-policy', 'N-4sr7p')]] }),
})
for (const [k, v] of Object.entries(INFO)) if (v && k.startsWith('N-')) { const path = [...NODES.values()].find(n => nodeId(n.path) === k)?.path; if (path) v.canonical = path }

export function infoFor(path) {
  const id = nodeId(path)
  return (path.startsWith('/c/') && id && INFO[id]) || INFO[path] || null
}
export function infoPage(base, info) {
  const links = info.links?.length ? `<nav class="tg-info-links" aria-label="Related links">${info.links.map(([l, p]) => `<a class="tg-btn tg-btn-outline tg-btn-sm" href="${base}${p}">${esc(l)}</a>`).join('')}</nav>` : ''
  return `<article class="tg-info ${info.kind === 'promo' ? 'tg-info-promo' : ''}"><nav class="tg-crumbs" aria-label="Breadcrumb"><a href="${base}/">Target</a> › <span aria-current="page">${esc(info.h1)}</span></nav>
  <header class="tg-info-head"><h1>${esc(info.h1)}</h1>${info.intro ? `<p>${esc(info.intro)}</p>` : ''}</header>
  <div class="tg-info-grid">${info.sections.map(([h, t]) => `<section><h2>${esc(h)}</h2><p>${esc(t)}</p></section>`).join('')}</div>${links}</article>`
}

// ---------- help ----------
export const HELP_TOPICS = [
  ['Track my order', 'How to check your order status', '/orders'], ['Manage my account', 'Settings, preferences', '/account'],
  ['Returns & receipts', 'Start a return or find a receipt', '/returns'], ['Price Match guarantee', 'Determine if you are Price Match eligible', '/help/articles/policies-guidelines/price-match-guarantee'],
  ['Check my gift card balance', 'Use our self-service experience', '/guest/gift-card-balance'], ['View current promotions', 'See current special offers and deals', D.DEALS_PATH],
  ['Create or manage a registry', 'Access your registries and/or wish lists', '/gift-registry'], ['Manage Target Circle™ Card', 'Pay and manage', '/circlecard'],
  ['Product recalls', 'Search or view recent recalls', '/help/articles/news-safety/product-recalls'],
]
export const helpTopicsHtml = base => `<section class="tg-help-topics"><h2>What would you like help with?</h2><div class="tg-help-grid">${HELP_TOPICS.map(([t, d, p]) => `<a href="${base}${p}"><b>${esc(t)}</b><span>${esc(d)}</span></a>`).join('')}</div></section>`
export const helpContactHtml = base => `<section class="tg-help-contact"><h2>Didn't find what you need? Contact us for help</h2><a class="tg-btn" href="${base}/help/contact-us">Contact us</a></section>`
export const CONTACT_TOPICS = ['Target.com order experience', 'Store experience', 'Registries & lists', 'Target Circle™', 'Target Circle™ Card', 'Target Circle 360™', 'Target GiftCard', 'Pharmacy & clinic', 'Product safety & quality', 'Corporate information', 'Accessibility & belonging', 'Security concerns']
const CONTACT_LINKS = { 'Target.com order experience': '/help/contact', 'Store experience': D.FIND_STORES_PATH, 'Registries & lists': '/gift-registry', 'Target Circle™': D.CIRCLE_PATH, 'Target Circle™ Card': '/circlecard', 'Target Circle 360™': D.CIRCLE_360_PATH, 'Target GiftCard': '/help/articles/gift-cards/target-giftcards', 'Pharmacy & clinic': D.node('pharmacy-health', 'N-54y52'), 'Product safety & quality': '/help/articles/news-safety/product-recalls', 'Corporate information': '/corporate/about', 'Accessibility & belonging': '/help/articles/compliances/accessibility', 'Security concerns': '/security' }
export function contactUsPage(base) {
  return `<div class="tg-journey"><nav class="tg-crumbs" aria-label="Breadcrumb"><a href="${base}/help">Help</a> › <span aria-current="page">Contact Us</span></nav><h1>Contact Us</h1>
  <div class="tg-help-intro"><h2>Have a question?</h2><form class="tg-help-search" action="${base}/help"><label class="visually-hidden" for="cu-search">Search help</label><input id="cu-search" name="q" placeholder="Search help"><button class="tg-btn">Search</button></form></div>
  <section class="tg-help-topics"><h2>Let us know how we can help</h2><div class="tg-help-grid">${CONTACT_TOPICS.map(t => `<a href="${base}${CONTACT_LINKS[t]}"><b>${esc(t)}</b><span>${t === 'Target.com order experience' ? 'Save a help request about an order (sign in required)' : 'Get help with this topic'}</span></a>`).join('')}</div></section>
  <p class="tg-fine">This local store does not offer phone or chat support. Help requests are saved locally and never sent to Target.</p></div>`
}

// ---------- site map ----------
export function sitemapPage(base) {
  return `<div class="tg-journey tg-sitemap"><nav class="tg-crumbs" aria-label="Breadcrumb"><a href="${base}/">Target</a> › <span aria-current="page">Site map</span></nav><h1>Site map</h1>
  <div class="tg-sitemap-grid">${D.SHOP_ALL.map(([h, links]) => `<section><h2>${esc(h)}</h2><ul>${links.map(([l, p]) => `<li>${a(base, p, l)}</li>`).join('')}</ul></section>`).join('')}
  <section><h2>Shop &amp; save</h2><ul>${D.MENU.filter(([, p]) => !D.SHOP_ALL.some(([, ls]) => ls.some(([, q]) => q === p))).map(([l, p]) => `<li>${a(base, p, l)}</li>`).join('')}</ul></section>
  <section><h2>Services &amp; account</h2><ul>${D.SITE_SECTIONS.map(([l, p]) => `<li>${a(base, p, l)}</li>`).join('')}</ul></section>
  ${D.FOOTER.map(([h, links]) => `<section><h2>${esc(h)}</h2><ul>${links.map(([l, p]) => `<li>${a(base, p, l)}</li>`).join('')}</ul></section>`).join('')}
  <section><h2>Legal</h2><ul>${D.LEGAL.map(([l, p]) => `<li>${a(base, p, l)}</li>`).join('')}</ul></section></div></div>`
}
export function sitemapPaths() {
  const set = new Set(['/', '/c', '/cart', '/login', '/account/create', '/help', '/weekly-ad', '/stores', '/sitemap', '/guest/gift-card-balance', '/gift-registry', '/help/contact-us'])
  for (const [, p] of D.MENU) set.add(p)
  for (const [, links] of D.SHOP_ALL) for (const [, p] of links) set.add(p)
  for (const [, links] of D.FOOTER) for (const [, p] of links) set.add(p)
  for (const [, p] of D.LEGAL) set.add(p)
  for (const [, p] of D.SITE_SECTIONS) set.add(p)
  for (const [, p] of GIFT_CARD_TILES) set.add(p)
  return [...set].filter(p => !['/account', '/orders'].includes(p))
}
export { fixtureCatalog }
