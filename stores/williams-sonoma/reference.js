import { Router } from 'express'
import { referenceRetailStore, observedProduct, capturedPhrase } from '../reference-retail.js'
import { capturedWilliamsSearch, capturedWilliamsProduct, capturedSearchProducts } from './search-capture.js'
import { siteChrome } from './site-chrome.js'
import { installSite, homepage } from './site-routes.js'
import { installShelf, cartCount } from './shelf-routes.js'

const unique = [...new Map(capturedSearchProducts.map(p => [p.path, p])).values()]
export const catalogObservations = unique.map(p => observedProduct(p, { source: p.source_url,
  evidence: 'research/fidelity-2026-10-06/other-retail.md#williams-sonoma', facts: ['title', 'native_path', 'displayed_price', 'sale_label', 'image'] }))
let site
const store = referenceRetailStore({ slug: 'williams-sonoma', name: 'Williams Sonoma', availability: 'unavailable',
  // The shared reference renderer always passes a zero count; the shelf cart lives in req.store.wsCart.
  chrome: args => siteChrome({ ...args, count: cartCount(args.req.store) }),
  observations: catalogObservations, prepare(req) { req.williamsCapturedSearch = true },
  queryKeys: ['words', 'q'], searchRoutes: ['/search/results.html', '/search'], matches: capturedPhrase, capturedSearch: '/search/results.html?words=gta%206',
  search(req, res, { render, base, query }) { render(req, res, `Search results for ${query}`, capturedWilliamsSearch(base, { ...req.query, words: query })) },
  install(router, context) {
    site = context
    router.get('/products/:slug', (req, res) => {
      const p = unique.find(p => p.id === req.params.slug)
      return p ? context.render(req, res, p.title, capturedWilliamsProduct(context.baseOf(res), p)) : context.coverage(req, res, 'Product has not been captured', 404)
    })
    installSite(router, context)
  },
})

// The shared reference adapter serves its captured-catalog page at '/'. The real
// homepage is rendered first; the captured catalog stays at /reference/catalog.
const router = Router()
router.get('/', (req, res, next) => {
  if (Object.values(req.query).some(value => typeof value !== 'string')) return next()
  site.render(req, res, 'Cookware, Cooking Utensils, Kitchen Decor & Gourmet Foods', homepage(site.baseOf(res)))
})
router.use(installShelf(site))
router.use(store.router)

export default { ...store, router }
