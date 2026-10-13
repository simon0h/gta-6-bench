import { referenceRetailStore, observedProduct, capturedPhrase } from '../reference-retail.js'
import { williamsChrome } from './layout.js'
import { capturedWilliamsSearch, capturedWilliamsProduct, capturedSearchProducts } from './search-capture.js'

const unique = [...new Map(capturedSearchProducts.map(p => [p.path, p])).values()]
export const catalogObservations = unique.map(p => observedProduct(p, { source: p.source_url,
  evidence: 'research/fidelity-2026-10-06/other-retail.md#williams-sonoma', facts: ['title', 'native_path', 'displayed_price', 'sale_label', 'image'] }))
export default referenceRetailStore({ slug: 'williams-sonoma', name: 'Williams Sonoma', availability: 'unavailable', chrome: williamsChrome,
  observations: catalogObservations, prepare(req) { req.williamsCapturedSearch = true },
  queryKeys: ['words', 'q'], searchRoutes: ['/search/results.html', '/search'], matches: capturedPhrase, capturedSearch: '/search/results.html?words=gta%206',
  search(req, res, { render, base, query }) { render(req, res, `Search results for ${query}`, capturedWilliamsSearch(base, { ...req.query, words: query })) },
  install(router, { render, coverage, baseOf }) {
    router.get('/products/:slug', (req, res) => {
      const p = unique.find(p => p.id === req.params.slug)
      return p ? render(req, res, p.title, capturedWilliamsProduct(baseOf(res), p)) : coverage(req, res, 'Product has not been captured', 404)
    })
  },
})
