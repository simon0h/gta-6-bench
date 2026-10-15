import { Router } from 'express'
import { esc } from '../../lib/html.js'
import { referenceRetailStore, capturedPhrase } from '../reference-retail.js'
import { ikeaChrome } from './layout.js'
import { emptySearch } from './search-empty.js'
import { ikeaSite } from './site.js'
import { searchShelf } from './shelf.js'
import { installShelf, bagCount, listing } from './shelf-pages.js'

// IKEA does not sell GTA 6: the captured catalog has no observations, and the captured
// "gta 6" search is IKEA's own no-results page.
export const catalogObservations = []
const store = referenceRetailStore({ slug: 'ikea', name: 'IKEA', availability: 'unavailable', chrome: ikeaChrome,
  observations: catalogObservations, queryKeys: ['q'], searchRoutes: ['/us/en/search/', '/search'], matches: capturedPhrase, capturedSearch: '/us/en/search/?q=gta%206',
  search(req, res, { render, base, query }) { req.ikeaEmptySearch = true; render(req, res, `Search results for ${query}`, emptySearch(base, query)) },
})

// Real-site pages (home, categories, help, policies, store locator, sign-in...) and the
// IKEA shelf (shelf.js: product pages, bag, checkout for `kind: 'other'` items) run ahead
// of the shared reference router, which keeps the GTA searches, /location, the captured
// catalog view (/reference/catalog) and its terminal purchase guard (409).
function render(req, res, title, body, status = 200) {
  const count = bagCount(req)
  const chromeReq = Object.assign(Object.create(Object.getPrototypeOf(req)), req, { store: { ...req.store, cart: [] } })
  res.status(status).type('html').send(ikeaChrome({ req: chromeReq, base: res.locals.base || '/ikea', title, body, count, accountLabel: req.store?.user ? 'Your profile' : 'Log in or sign up' }))
}
const router = Router()
// Repeated query fields keep the shared reference 400 response, except the multi-select filters.
const MULTI = new Set(['color', 'price', 'category'])
const badQuery = query => Object.entries(query).some(([key, value]) => typeof value !== 'string' && !(MULTI.has(key) && Array.isArray(value) && value.every(v => typeof v === 'string')))
router.use((req, res, next) => badQuery(req.query) ? store.router(req, res, next) : next())
const GTA = /\bgta\b|gta\s*[56v]|grand\s*theft|rockstar/i
router.get(['/us/en/search/', '/search'], (req, res, next) => {
  const q = typeof req.query.q === 'string' ? req.query.q.trim() : ''
  if (!q || GTA.test(q) || capturedPhrase(q)) return next()
  const base = res.locals.base || '/ikea', results = searchShelf(q)
  if (!results.length) { req.ikeaEmptySearch = true; return render(req, res, `Search results for ${q}`, emptySearch(base, q)) }
  render(req, res, `Search results for ${q}`, `<div class="ik-page-head iks-search-head"><h1>Results for “${esc(q)}”</h1></div><nav class="iks-tabs" aria-label="Search result types"><span aria-current="page">Products <small>${results.length}</small></span><a href="${base}/us/en/rooms/">Rooms</a><a href="${base}/us/en/ideas/">Inspiration</a></nav>${listing(base, `${base}/us/en/search/`, req.query, results, { hidden: { q }, keepOrder: true })}`)
})
installShelf(router, { render })
router.use(ikeaSite({ render }))
router.use(store.router)
export default { ...store, router }
