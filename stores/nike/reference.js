import { referenceRetailStore, observedProduct, capturedPhrase } from '../reference-retail.js'
import { nikeChrome } from './layout.js'
import { capturedNikeSearch, capturedNikeProduct, capturedProductAt, capturedSearchProducts } from './search-capture.js'
import { capturedColorways } from './search-colorways.js'

const mainPaths = new Set(capturedSearchProducts.map(p => p.path))
export const catalogObservations = [...capturedSearchProducts, ...Object.values(capturedColorways).flat().filter(p => !mainPaths.has(p.path)).map(p => ({ ...p, kind: 'other', price: null, image_source_url: p.source_url }))]
  .map(p => observedProduct(p, { source: `https://www.nike.com${p.path}`, evidence: 'research/fidelity-2026-10-06/other-retail.md#nike', facts: ['title', 'style', 'native_path', 'image', ...(Number.isFinite(p.price) ? ['displayed_price'] : [])] }))
export default referenceRetailStore({ slug: 'nike', name: 'Nike', availability: 'unavailable', chrome: nikeChrome,
  observations: catalogObservations, prepare(req) { req.nikeCapturedSearch = true },
  queryKeys: ['q'], searchRoutes: ['/w', '/search'], matches: capturedPhrase, capturedSearch: '/w?q=gta%206',
  search(req, res, { render, base, query }) { render(req, res, `Search results for ${query}`, capturedNikeSearch(base, { ...req.query, q: query })) },
  install(router, { render, coverage, baseOf }) {
    router.get(['/t/:slug/:style', '/launch/r/:style'], (req, res) => {
      const p = capturedProductAt(req.path)
      return p ? render(req, res, p.title, capturedNikeProduct(baseOf(res), p)) : coverage(req, res, 'Product has not been captured', 404)
    })
  },
})
