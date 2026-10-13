import { fixtureCatalog } from '../../lib/catalog-policy.js'
import referenceStore from './reference.js'
import { unavailableStore } from '../../lib/unavailable-store.js'
import { products, departments } from './catalog.js'
import { sephoraChrome } from './layout.js'
import { sephoraCatalog } from './depth.js'
import { sephoraJourneys } from './journeys.js'

const fixtureConfig = {
  slug: 'sephora', name: 'Sephora', orderPrefix: 'SP', categories: departments,
  cartLabel: 'Basket', searchPlaceholder: 'Search beauty products', membership: 'Sign In for FREE Shipping',
  catalogDescription: 'Beauty, skincare, hair, fragrance and body care.',
  benefit: 'Beauty Insider', benefitText: 'Discover your next favorite and save the products you love.',
  delivery: 'Free standard shipping for signed-in members. Guests: free at $50; $6.95 below $50.',
  service: 'Beauty Insider · Discover your next beauty favorite', footer: 'Beauty for every version of you',
  products, chrome: sephoraChrome, stylesheet: '/static/depth.css',
  extend(router, context) { sephoraJourneys(router, context); sephoraCatalog(router, context) },
}

export default fixtureCatalog ? unavailableStore(fixtureConfig) : referenceStore
