import { referenceRetailStore } from '../reference-retail.js'
import { chewyReferenceChrome } from './reference-layout.js'
import { installChewyReferencePages } from './reference-pages.js'

export const catalogObservations = []
const store = referenceRetailStore({ slug: 'chewy', name: 'Chewy', availability: 'unknown', chrome: chewyReferenceChrome,
  observations: catalogObservations, queryKeys: ['query', 'q'], searchRoutes: ['/s', '/search'],
})
// Chewy's real-site pages (homepage, /b/ category pages, help, account entry
// points, site map) run in front of the shared reference router, which still
// owns search coverage, /location, the purchase guard and the 404 fallback.
export default { ...store, router: installChewyReferencePages(store.router) }
