import { fixtureCatalog } from '../../lib/catalog-policy.js'
import referenceStore from './reference.js'
import { unavailableStore } from '../../lib/unavailable-store.js'
import { products } from './catalog.js'
import { nikeChrome } from './layout.js'
import { nikeCatalog } from './depth.js'
import { nikeJourneys } from './journeys.js'

// Public structure: research/depth/nike-blueprint.md. Catalog and prices are
// deterministic original fixtures, not representations of live Nike inventory.
const fixtureConfig = {
  slug: 'nike', name: 'Nike', orderPrefix: 'NK', categories: ['Shoes', 'Clothing', 'Accessories'],
  cartLabel: 'Bag', searchPlaceholder: 'Search', membership: 'Join Us / Sign In',
  catalogDescription: 'Athletic footwear and clothing.',
  benefit: 'More to your membership', benefitText: 'Save your favorites and enjoy member shipping on qualifying orders.',
  delivery: 'Guests: free standard shipping at $75. Members: free at $50.',
  service: 'Find your next favorite. New styles for every day.',
  footer: 'Footwear, sportswear and accessories', products,
  stylesheet: '/static/depth.css', chrome: nikeChrome, extend(router, helpers) { nikeJourneys(router, helpers); nikeCatalog(router, helpers) },
}

export default fixtureCatalog ? unavailableStore(fixtureConfig) : referenceStore
