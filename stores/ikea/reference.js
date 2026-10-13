import { referenceRetailStore, capturedPhrase } from '../reference-retail.js'
import { ikeaChrome } from './layout.js'
import { emptySearch } from './search-empty.js'

export const catalogObservations = []
export default referenceRetailStore({ slug: 'ikea', name: 'IKEA', availability: 'unavailable', chrome: ikeaChrome,
  observations: catalogObservations, queryKeys: ['q'], searchRoutes: ['/us/en/search/', '/search'], matches: capturedPhrase, capturedSearch: '/us/en/search/?q=gta%206',
  search(req, res, { render, base, query }) { req.ikeaEmptySearch = true; render(req, res, `Search results for ${query}`, emptySearch(base, query)) },
})
