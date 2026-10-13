import { Router } from 'express'
import { referenceRetailStore, capturedPhrase } from '../reference-retail.js'
import { ikeaChrome } from './layout.js'
import { emptySearch } from './search-empty.js'
import { ikeaSite } from './site.js'

export const catalogObservations = []
const store = referenceRetailStore({ slug: 'ikea', name: 'IKEA', availability: 'unavailable', chrome: ikeaChrome,
  observations: catalogObservations, queryKeys: ['q'], searchRoutes: ['/us/en/search/', '/search'], matches: capturedPhrase, capturedSearch: '/us/en/search/?q=gta%206',
  search(req, res, { render, base, query }) { req.ikeaEmptySearch = true; render(req, res, `Search results for ${query}`, emptySearch(base, query)) },
})

// Real-site pages (home, categories, help, policies, store locator, sign-in...) run
// ahead of the shared reference router, which keeps search, /location, the captured
// catalog view (/reference/catalog) and its terminal purchase guard.
function render(req, res, title, body, status = 200) {
  const chromeReq = Object.assign(Object.create(Object.getPrototypeOf(req)), req, { store: { ...req.store, cart: [] } })
  res.status(status).type('html').send(ikeaChrome({ req: chromeReq, base: res.locals.base || '/ikea', title, body, count: 0, accountLabel: req.store?.user ? 'Your profile' : 'Log in or sign up' }))
}
const router = Router()
// Repeated query fields keep the shared reference 400 response.
router.use((req, res, next) => Object.values(req.query).some(value => typeof value !== 'string') ? store.router(req, res, next) : next())
router.use(ikeaSite({ render }))
router.use(store.router)
export default { ...store, router }
