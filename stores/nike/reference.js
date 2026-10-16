import { Router } from 'express'
import { referenceRetailStore, observedProduct, capturedPhrase } from '../reference-retail.js'
import { authenticate, findAccount, createAccount, publicAccount } from '../../lib/accounts.js'
import { nikeSiteChrome } from './site-chrome.js'
import { capturedNikeSearch, capturedNikeProduct, capturedProductAt, capturedSearchProducts } from './search-capture.js'
import { capturedColorways } from './search-colorways.js'
import { MENUS } from './site-data.js'
import { INFO_PAGES } from './site-content.js'
import * as site from './site-pages.js'
import { shelf, searchShelf, listingItems, HUB_ITEMS } from './shelf.js'
import { installShelf, bagCount, row, listingGrid, searchGrid } from './shelf-pages.js'

const mainPaths = new Set(capturedSearchProducts.map(p => p.path))
export const catalogObservations = [...capturedSearchProducts, ...Object.values(capturedColorways).flat().filter(p => !mainPaths.has(p.path)).map(p => ({ ...p, kind: 'other', price: null, image_source_url: p.source_url }))]
  .map(p => observedProduct(p, { source: `https://www.nike.com${p.path}`, evidence: 'research/fidelity-2026-10-06/other-retail.md#nike', facts: ['title', 'style', 'native_path', 'image', ...(Number.isFinite(p.price) ? ['displayed_price'] : [])] }))

const str = v => typeof v === 'string' ? v.trim() : ''
let helpers

function installSite(router, { render, coverage, baseOf }) {
  helpers = { render, coverage, baseOf }
  const page = (paths, title, html) => router.get(paths, (req, res) => render(req, res, typeof title === 'function' ? title(req) : title, html(baseOf(res), req)))

  router.get(['/t/:slug/:style', '/launch/r/:style'], (req, res) => {
    const p = capturedProductAt(req.path)
    return p ? render(req, res, p.title, capturedNikeProduct(baseOf(res), p)) : coverage(req, res, "We can't find the page you are looking for", 404)
  })

  // Departments and hubs.
  for (const menu of MENUS) {
    if (['Men', 'Women', 'Kids'].includes(menu.label)) page(menu.path, `${menu.label}'s Shoes, Clothing & Accessories`.replace("Kids's", "Kids'"), base => site.departmentPage(base, menu))
    else page(menu.path, menu.label, base => site.hubPage(base, menu.path, menu.label, menu.groups))
  }
  const sport = MENUS.find(m => m.label === 'Sport')
  for (const g of sport.groups) if (!g.path.startsWith('/w/') && !MENUS.some(m => m.path === g.path)) page(g.path, g.label, base => site.hubPage(base, g.path, g.label, [g]))
  for (const [path, label] of [['/baseball', 'Baseball'], ['/us-football', 'Football']]) page(path, label, base => site.hubPage(base, path, label, []))
  page('/launch', 'SNKRS Launch Calendar', base => site.launchPage(base))

  // Category listings.
  router.get('/w/:slug', (req, res) => {
    const info = site.LISTINGS.get(req.params.slug)
    if (!info) return coverage(req, res, "We can't find the page you are looking for", 404)
    render(req, res, info.title, site.listingPage(baseOf(res), req.params.slug, info, req.query))
  })

  // Help, info and service pages.
  page('/help', 'Get Help', (base, req) => site.helpPage(base, str(req.query.q)))
  router.get('/help/a/:slug', (req, res) => {
    const a = site.helpArticle(baseOf(res), req.params.slug)
    return a ? render(req, res, a.title, a.html) : coverage(req, res, "We can't find the page you are looking for", 404)
  })
  for (const [path, info] of Object.entries(INFO_PAGES)) page(path, info.title, (base, req) => site.infoPage(base, { ...info, choice: ['yes', 'no'].includes(req.query.share) ? req.query.share : '', sent: !!str(req.query.feedback) }))
  page('/membership', 'Nike Membership', base => site.membershipPage(base))
  page('/gift-cards', 'Nike Gift Cards', base => site.giftCardsPage(base))
  router.get('/gift-cards/:kind', (req, res, next) => {
    if (!['email', 'mail', 'terms'].includes(req.params.kind)) return next()
    const p = site.giftCardOptionPage(baseOf(res), req.params.kind)
    render(req, res, p.title, p.html)
  })
  page('/retail', 'Find a Nike Store', (base, req) => site.storesPage(base, str(req.query.q)))
  page('/cart', 'Bag', base => site.bagPage(base))
  page('/favorites', 'Favorites', (base, req) => site.favoritesPage(base, req.store.user))
  for (const section of ['/member/profile', '/member/orders', '/member/settings']) page(section, 'Member Profile', (base, req) => site.memberPage(base, req.store.user, section))
  page(['/orders/details', '/orders/details/'], 'Order Status', (base, req) => site.orderStatusPage(base, req.query))
  page('/orders/gift-card-lookup', 'Gift Card Balance', (base, req) => site.giftCardLookupPage(base, req.query))
  page('/sitemap', 'Site Map', base => site.sitemapPage(base))
  router.get('/sitemap.xml', (req, res) => {
    const base = baseOf(res)
    const host = ""
    const xmlEsc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')
    res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${site.sitemapPaths().map(p => `<url><loc>${xmlEsc(host + base + p)}</loc></url>`).join('\n')}\n</urlset>\n`)
  })

  // Sign in / join (two steps, works without JavaScript).
  const nextOf = v => /^\/[a-z/-]*$/i.test(str(v)) ? str(v) : '/member/profile'
  page('/register', 'Login', (base, req) => site.registerPage(base, { next: str(req.query.next) }))
  router.post('/register', (req, res) => {
    const email = str(req.body?.email).slice(0, 240), next = str(req.body?.next)
    if (!/^\S+@\S+\.\S+$/.test(email)) return render(req, res, 'Login', site.registerPage(baseOf(res), { email, next, error: 'Please enter a valid email address.' }), 400)
    render(req, res, 'Login', site.registerPage(baseOf(res), { step: findAccount('nike', email) ? 'password' : 'join', email, next }))
  })
  router.post('/register/password', (req, res) => {
    const email = str(req.body?.email), next = str(req.body?.next)
    const acct = authenticate('nike', email, typeof req.body?.password === 'string' ? req.body.password : '')
    if (!acct) return render(req, res, 'Login', site.registerPage(baseOf(res), { step: 'password', email, next, error: 'Your password is incorrect.' }), 401)
    req.store.user = publicAccount(acct)
    res.redirect(303, baseOf(res) + nextOf(next))
  })
  router.post('/register/join', (req, res) => {
    const email = str(req.body?.email), next = str(req.body?.next)
    const first_name = str(req.body?.first_name).slice(0, 80), last_name = str(req.body?.last_name).slice(0, 80)
    const password = typeof req.body?.password === 'string' ? req.body.password : ''
    const again = error => render(req, res, 'Login', site.registerPage(baseOf(res), { step: 'join', email, next, error }), 400)
    if (!/^\S+@\S+\.\S+$/.test(email)) return render(req, res, 'Login', site.registerPage(baseOf(res), { error: 'Please enter a valid email address.' }), 400)
    if (!first_name || !last_name) return again('Please enter your first and last name.')
    if (password.length < 8 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) return again('Password must be at least 8 characters with uppercase, lowercase letters and one number.')
    const acct = createAccount('nike', { email, password, first_name, last_name })
    if (acct.error) return again(acct.error)
    req.store.user = publicAccount(acct)
    res.redirect(303, baseOf(res) + nextOf(next))
  })
  router.post('/member/sign-out', (req, res) => { req.store.user = null; res.redirect(303, `${baseOf(res)}/`) })

  // Earlier clone paths stay reachable.
  for (const [from, to] of [['/stores', '/retail'], ['/account', '/member/profile'], ['/orders', '/orders/details'], ['/new', '/w/new-mens-3n82yznik1'], ['/recent', '/favorites'], ['/help/shipping', '/help/a/shipping-delivery'], ['/help/returns', '/help/a/returns-policy'], ['/help/contact', '/help#contact'], ['/collection/sportswear', '/sportswear'], ['/sport', '/gear-up'], ['/sport/running', '/running'], ['/sport/training', '/training'], ['/sport/basketball', '/basketball'], ['/sport/soccer', '/soccer']]) {
    router.get(from, (req, res) => res.redirect(301, baseOf(res) + to))
  }
}

const store = referenceRetailStore({ slug: 'nike', name: 'Nike', availability: 'unavailable', chrome: args => nikeSiteChrome({ ...args, count: bagCount(args.req) }),
  observations: catalogObservations, prepare(req) { req.nikeCapturedSearch = true },
  queryKeys: ['q'], searchRoutes: ['/w', '/search'], matches: capturedPhrase, capturedSearch: '/w?q=gta%206',
  search(req, res, { render, base, query }) { render(req, res, `Search results for ${query}`, capturedNikeSearch(base, { ...req.query, q: query })) },
  install: installSite,
})

// nike.com pages layered in front of the shared reference router. The shelf
// (shelf.js) is the nike.com assortment: homepage rows, category grids, search,
// product pages, Bag and checkout for `kind: 'other'` items. It is kept apart
// from the captured "gta 6" search observations above, which stay unverified and
// cannot be bought; Nike does not sell GTA 6. Purchase requests naming anything
// that is not a shelf style still reach the shared guard (409).
const router = Router()
const render = (...args) => helpers.render(...args)
const baseOf = res => helpers.baseOf(res)
router.use((req, res, next) => Object.values(req.query).some(v => typeof v !== 'string') ? store.router.handle(req, res, next) : next())

const top = (items, n, key = p => p.reviews) => [...items].sort((a, b) => key(b) - key(a)).slice(0, n)
const pickIds = ids => ids.map(id => shelf.find(p => p.id === id)).filter(Boolean)
function homeRows(base) {
  const popular = pickIds(['CW2288-111', 'FB7921-010', 'FD2722-002', 'DD1391-100', 'DQ5860-010', '553558-161', 'BV2654-010', 'DQ6015-010', 'CN8490-100', 'DH2920-111', 'SX6897-100', 'DC4244-010'])
  const fresh = top(shelf.filter(p => p.badge === 'Just In'), 12, p => p.newness)
  const fleece = top(shelf.filter(p => p.tags.includes('fleece') && p.g !== 'kids'), 12)
  const running = top(shelf.filter(p => p.cat === 'shoes' && p.sport === 'running' && p.g !== 'kids'), 12)
  const sale = top(shelf.filter(p => p.sale), 12, p => p.discount * 1000 + p.reviews / 100)
  const kids = top(shelf.filter(p => p.g === 'kids'), 12)
  const gear = top(shelf.filter(p => p.cat === 'accessories'), 12)
  return {
    top: row(base, 'Popular Right Now', popular, ['Shop Best Sellers', '/w/mens-best-76m50znik1']) + row(base, 'New Arrivals', fresh, ['Shop All New', '/w/new-mens-3n82yznik1']),
    mid: row(base, 'Fleece Season', fleece, ['Shop Fleece', '/w/mens-fleece-4xh6qznik1']) + row(base, 'Run in Comfort', running, ['Shop Running', '/w/mens-running-shoes-37v7jznik1zy7ok']) + row(base, 'Sale: Up to 30% Off', sale, ['Shop All Sale', '/w/sale-3yaep']),
    end: row(base, "Kids' Favorites", kids, ['Shop Kids', '/kids']) + row(base, 'Gear Up', gear, ['Shop Accessories', '/w/mens-accessories-equipment-awwpwznik1']),
  }
}
router.get('/', (req, res) => render(req, res, 'Nike. Just Do It', site.homePage(baseOf(res), homeRows(baseOf(res)))))

// Departments and sport hubs carry product rows under the hero.
const withRows = (html, rows) => { const at = html.indexOf('<section class="nkx-section">'); return at < 0 ? html.replace(/<\/div>$/, rows + '</div>') : html.slice(0, at) + rows + html.slice(at) }
for (const menu of MENUS) {
  const pick = HUB_ITEMS[menu.path]
  if (!pick) continue
  const dept = ['Men', 'Women', 'Kids'].includes(menu.label)
  const title = dept ? `${menu.label}'s Shoes, Clothing & Accessories`.replace("Kids's", "Kids'") : menu.label
  router.get(menu.path, (req, res) => {
    const base = baseOf(res), items = shelf.filter(pick)
    const rows = row(base, dept ? 'Trending Now' : `Shop ${menu.label}`, top(dept ? items.filter(p => p.brand !== 'Converse' && p.type !== 'socks') : items, 12)) + (dept ? row(base, 'Just In', top(items, 12, p => p.newness)) : '')
    render(req, res, title, withRows(dept ? site.departmentPage(base, menu) : site.hubPage(base, menu.path, menu.label, menu.groups), rows))
  })
}
const sport = MENUS.find(m => m.label === 'Sport')
for (const [path, label, groups] of [...sport.groups.map(g => [g.path, g.label, [g]]), ['/baseball', 'Baseball', []], ['/us-football', 'Football', []]]) {
  const pick = HUB_ITEMS[path]
  if (!pick || MENUS.some(m => m.path === path)) continue
  router.get(path, (req, res) => {
    const base = baseOf(res)
    render(req, res, label, withRows(site.hubPage(base, path, label, groups), row(base, `Shop ${label}`, top(shelf.filter(pick), 12))))
  })
}

// Category listings with shelf products; listings the shelf does not cover keep
// the captured category structure.
router.get('/w/:slug', (req, res, next) => {
  const info = site.LISTINGS.get(req.params.slug)
  const items = info ? listingItems(req.params.slug) : []
  if (!items.length) return next()
  render(req, res, info.title, listingGrid(baseOf(res), req.params.slug, info, items, req.query))
})

// Search: "gta 6" keeps the captured nike.com result (no GTA 6 product exists on
// nike.com); other queries search the shelf, and queries without shelf matches
// stay marked uncaptured.
router.get(['/w', '/search'], (req, res, next) => {
  const q = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 100) : ''
  if (!q || capturedPhrase(q)) return next()
  const items = searchShelf(q)
  if (!items.length) return next()
  render(req, res, `Search results for ${q}`, searchGrid(baseOf(res), q, items, req.query))
})

// Guide and story pages close with the products they talk about, as on nike.com.
const GUIDE_ROWS = {
  '/air': ['Shop Nike Air', p => /\bAir\b/.test(p.title) && p.cat === 'shoes'],
  '/air-force-1': ['Shop Air Force 1', p => /Force 1/.test(p.title)],
  '/air-max': ['Shop Air Max', p => /Air Max/.test(p.title)],
  '/flyease': ['Shop Easy On and Off Shoes', p => /EasyOn|FlyEase|Slide|Calm|Victori|Benassi/.test(p.title) || p.type === 'sandals'],
  '/flyknit': ['Shop Lightweight Running', p => p.sport === 'running' && ['race', 'road'].includes(p.type)],
  '/free': ['Shop Nike Free', p => /Free|Flex Runner|Metcon/.test(p.title)],
  '/react': ['Shop Cushioned Running', p => p.cat === 'shoes' && p.sport === 'running' && p.type === 'road'],
  '/running/vaporfly': ['Shop Racing Shoes', p => p.type === 'race' || p.type === 'track'],
  '/zoomx': ['Shop ZoomX', p => /Vaporfly|Alphafly|Invincible|Vomero|Zoom Fly|Streakfly|Dragonfly|Victory/.test(p.title)],
  '/space-hippie': ['Shop Sustainable Materials', p => p.tags.split(' ').includes('sustainable') || /Next Nature/.test(p.title)],
  '/sustainability': ['Shop Sustainable Materials', p => p.tags.split(' ').includes('sustainable') || /Next Nature/.test(p.title)],
  '/teens': ['Shop Big Kids', p => p.age === 'big'],
  '/running-shoe-finder': ['Shop Running Shoes', p => p.cat === 'shoes' && (p.sport === 'running' || p.sport === 'trail') && p.g !== 'kids'],
  '/product-news': ['Just In', p => p.badge === 'Just In' || p.badge === 'Coming Soon'],
  '/nikeskims-lookbook': ['Shop NikeSKIMS', p => p.brand === 'NikeSKIMS'],
  '/nikeskims-bra-guide': ['Shop NikeSKIMS Bras', p => p.brand === 'NikeSKIMS' && p.type === 'bras'],
  '/nikeskims-collection-guide': ['Shop NikeSKIMS', p => p.brand === 'NikeSKIMS'],
}
for (const [path, [heading, pick]] of Object.entries(GUIDE_ROWS)) {
  const info = INFO_PAGES[path]
  if (!info || HUB_ITEMS[path]) continue
  router.get(path, (req, res) => {
    const base = baseOf(res), items = top(shelf.filter(pick), 12)
    render(req, res, info.title, site.infoPage(base, info) + (items.length ? `<div class="nkx-info-shop">${row(base, heading, items)}</div>` : ''))
  })
}

installShelf(router, { render, baseOf })
router.use(store.router)

export default { ...store, router }
