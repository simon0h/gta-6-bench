import { Router } from 'express'
import { referenceRetailStore, observedProduct, capturedPhrase } from '../reference-retail.js'
import { capturedSephoraSearch, capturedSephoraProduct, capturedSearchProducts } from './search-capture.js'
import { siteChrome, installSite, homePage, productExtras } from './site.js'

export const catalogObservations = capturedSearchProducts.map(p => observedProduct(p, {
  source: p.sourceUrl, evidence: 'research/fidelity-2026-10-06/sephora-search.md',
  facts: ['title', 'brand', 'native_path', 'displayed_price', 'rating', 'review_count', 'image'],
}))
const store = referenceRetailStore({ slug: 'sephora', name: 'Sephora', availability: 'unavailable', chrome: siteChrome,
  observations: catalogObservations, prepare(req) { req.sephoraReferenceCatalog = true },
  queryKeys: ['keyword', 'q'], searchRoutes: ['/search'], matches: capturedPhrase, capturedSearch: '/search?keyword=gta%206',
  search(req, res, { render, base, query }) { render(req, res, `Search results for ${query}`, capturedSephoraSearch(base, { ...req.query, q: query })) },
  install(router, context) {
    const { render, coverage, baseOf } = context
    router.get('/product/:id', (req, res) => {
      const p = capturedSearchProducts.find(p => p.path.split('?')[0] === req.path)
      // An unobserved SKU parameter is not evidence of the captured variant.
      if (!p || (req.query.skuId !== undefined && req.query.skuId !== p.sku)) return coverage(req, res, 'Product variant has not been captured', 404)
      render(req, res, p.title, capturedSephoraProduct(baseOf(res), p) + productExtras(baseOf(res), p))
    })
    installSite(router, context)
  },
})

// The shared reference adapter serves its captured-catalog listing at "/"; Sephora's homepage
// replaces it (the listing stays at /reference/catalog). The homepage's "Chosen For You" row is
// the captured catalog, so it keeps data-reference-state="catalog".
const router = Router()
router.get('/', (req, res, next) => {
  if (Object.values(req.query).some(value => typeof value !== 'string')) return next()
  const base = res.locals.base || '/sephora'
  const chromeReq = Object.assign(Object.create(Object.getPrototypeOf(req)), req, { store: { ...req.store, cart: [] } })
  res.status(200).type('html').send(siteChrome({ req: chromeReq, base, title: 'Sephora: Beauty, Makeup, Skincare, Hair & Fragrance', body: homePage(base, req) }))
})
router.use(store.router)
export default { ...store, router }
