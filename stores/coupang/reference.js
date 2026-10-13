import { referenceRetailStore } from '../reference-retail.js'
import { documentLayout } from './chrome.js'

export const catalogObservations = []
export default referenceRetailStore({ slug: 'coupang', name: 'Coupang (쿠팡)', country: 'KR', currency: 'KRW', availability: 'unknown',
  chrome({ req, base, title, body }) { return documentLayout(req, base, title, body) },
  observations: catalogObservations, queryKeys: ['q'], searchRoutes: ['/np/search', '/search'],
})
