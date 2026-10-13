import { fixtureCatalog } from '../../lib/catalog-policy.js'
import referenceStore from './reference.js'
import { unavailableStore } from '../../lib/unavailable-store.js'
import { products, departments } from './catalog.js'
import { williamsChrome } from './layout.js'
import { williamsCatalog } from './depth.js'
import { williamsJourneys } from './journeys.js'

const fixtureConfig = {
  slug: 'williams-sonoma', name: 'Williams Sonoma', orderPrefix: 'WS',
  products, categories: departments.map(d => d.name), nav: departments.map(d => d.label),
  cartLabel: 'Cart', membership: 'My Account', searchPlaceholder: 'Search kitchen essentials',
  catalogDescription: 'Cookware, kitchen tools, cutlery, electrics, bakeware, tabletop and pantry essentials.',
  service: 'Williams Sonoma · Williams Sonoma Home', footer: 'For the love of cooking',
  benefit: 'The gathering starts here', benefitText: 'Thoughtful cookware and table settings for meals worth sharing.',
  delivery: 'Free standard shipping on these items.',
  chrome: williamsChrome, stylesheet: '/static/depth.css',
  extend(router, context) { williamsJourneys(router, context); williamsCatalog(router, context) },
}

export default fixtureCatalog ? unavailableStore(fixtureConfig) : referenceStore
