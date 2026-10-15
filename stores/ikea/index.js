import { fixtureCatalog } from '../../lib/catalog-policy.js'
import referenceStore from './reference.js'
import { unavailableStore } from '../../lib/unavailable-store.js'
import { products } from './catalog.js'
import { ikeaChrome } from './layout.js'
import { ikeaDepth } from './depth.js'
import { ikeaJourneys } from './journeys.js'
import { ikeaSite } from './site.js'

const fixtureConfig = {
  slug: 'ikea', name: 'IKEA', orderPrefix: 'IK', productOptionQueryPrefix: 'option_',
  categories: ['Furniture', 'Storage', 'Lighting', 'Textiles', 'Decoration', 'Kitchen', 'Bathroom', 'Children', 'Accessories'],
  service: 'United States · English', cartLabel: 'Bag', searchPlaceholder: 'What are you looking for?',
  kicker: 'Make room for everyday life', headline: 'Small changes. A fresh start.',
  intro: 'Smart storage, comfortable corners and everyday essentials for a home that feels like you.',
  featuredLabel: 'Ideas for your space', footer: 'Furniture, lighting and home accessories',
  catalogDescription: 'Furniture and home accessories.', products,
  membership: 'Hej! Log in or sign up', heroAlt: 'A sunny living room with a sofa, shelving and home accessories',
  benefit: 'Make yourself at home', benefitText: 'Save your favorites and keep all your home ideas in one place.',
  delivery: 'Free standard delivery on online orders.',
  nav: ['Products', 'Rooms', 'Deals', 'Design & ideas', 'Services'],
  stylesheet: '/static/depth.css', chrome: ikeaChrome, extend(router, context) { ikeaJourneys(router, context); ikeaDepth(router, context); router.use(ikeaSite({ render: context.render, fixture: true })) },
}

export default fixtureCatalog ? unavailableStore(fixtureConfig) : referenceStore
