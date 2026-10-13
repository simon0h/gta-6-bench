import { referenceRetailStore } from '../reference-retail.js'
import { chewyChrome } from './layout.js'

export const catalogObservations = []
export default referenceRetailStore({ slug: 'chewy', name: 'Chewy', availability: 'unknown', chrome: chewyChrome,
  observations: catalogObservations, queryKeys: ['query', 'q'], searchRoutes: ['/s', '/search'],
})
