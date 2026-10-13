import { Router } from 'express'
import { referenceRetailStore, observedProduct, capturedPhrase } from '../reference-retail.js'
import { authenticate, findAccount, createAccount, publicAccount } from '../../lib/accounts.js'
import { nikeSiteChrome } from './site-chrome.js'
import { capturedNikeSearch, capturedNikeProduct, capturedProductAt, capturedSearchProducts } from './search-capture.js'
import { capturedColorways } from './search-colorways.js'
import { MENUS } from './site-data.js'
import { INFO_PAGES } from './site-content.js'
import * as site from './site-pages.js'

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
    return p ? render(req, res, p.title, capturedNikeProduct(baseOf(res), p)) : coverage(req, res, 'Product has not been captured', 404)
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
    if (!info) return coverage(req, res, 'Category has not been captured', 404)
    render(req, res, info.title, site.listingPage(baseOf(res), req.params.slug, info, req.query))
  })

  // Help, info and service pages.
  page('/help', 'Get Help', (base, req) => site.helpPage(base, str(req.query.q)))
  router.get('/help/a/:slug', (req, res) => {
    const a = site.helpArticle(baseOf(res), req.params.slug)
    return a ? render(req, res, a.title, a.html) : coverage(req, res, 'Help article has not been captured', 404)
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

const store = referenceRetailStore({ slug: 'nike', name: 'Nike', availability: 'unavailable', chrome: nikeSiteChrome,
  observations: catalogObservations, prepare(req) { req.nikeCapturedSearch = true },
  queryKeys: ['q'], searchRoutes: ['/w', '/search'], matches: capturedPhrase, capturedSearch: '/w?q=gta%206',
  search(req, res, { render, base, query }) { render(req, res, `Search results for ${query}`, capturedNikeSearch(base, { ...req.query, q: query })) },
  install: installSite,
})

// The shared reference router serves its captured-catalog list at "/"; nike.com's
// homepage (with the captured listings as one section) is served first instead.
const router = Router()
router.get('/', (req, res, next) => {
  if (Object.values(req.query).some(v => typeof v !== 'string')) return next()
  helpers.render(req, res, 'Nike. Just Do It', site.homePage(helpers.baseOf(res)))
})
router.use(store.router)

export default { ...store, router }
