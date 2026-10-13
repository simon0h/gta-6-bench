import { referenceRetailStore, observedProduct, capturedPhrase } from '../reference-retail.js'
import { sephoraChrome } from './layout.js'
import { capturedSephoraSearch, capturedSephoraProduct, capturedSearchProducts } from './search-capture.js'

export const catalogObservations = capturedSearchProducts.map(p => observedProduct(p, {
  source: p.sourceUrl, evidence: 'research/fidelity-2026-10-06/sephora-search.md',
  facts: ['title', 'brand', 'native_path', 'displayed_price', 'rating', 'review_count', 'image'],
}))
export default referenceRetailStore({ slug: 'sephora', name: 'Sephora', availability: 'unavailable', chrome: sephoraChrome,
  observations: catalogObservations, prepare(req) { req.sephoraReferenceCatalog = true },
  queryKeys: ['keyword', 'q'], searchRoutes: ['/search'], matches: capturedPhrase, capturedSearch: '/search?keyword=gta%206',
  search(req, res, { render, base, query }) { render(req, res, `Search results for ${query}`, capturedSephoraSearch(base, { ...req.query, q: query })) },
  install(router, { render, coverage, baseOf }) {
    router.get('/product/:id', (req, res) => {
      const p = capturedSearchProducts.find(p => p.path.split('?')[0] === req.path)
      // An unobserved SKU parameter is not evidence of the captured variant.
      if (!p || (req.query.skuId !== undefined && req.query.skuId !== p.sku)) return coverage(req, res, 'Product variant has not been captured', 404)
      render(req, res, p.title, capturedSephoraProduct(baseOf(res), p))
    })
  },
})
