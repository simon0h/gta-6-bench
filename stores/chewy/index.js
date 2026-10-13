import { fixtureCatalog } from '../../lib/catalog-policy.js'
import referenceStore from './reference.js'
import { unavailableStore } from '../../lib/unavailable-store.js'
import { products } from './catalog.js'
import { chewyChrome } from './layout.js'
import { chewyDepth } from './depth.js'
import { chewyJourneys } from './journeys.js'

const fixtureConfig = {
  products, chrome: chewyChrome, extend(router, context) { chewyJourneys(router, context); chewyDepth(router, context) },

  "slug": "chewy",
  "name": "Chewy",
  "orderPrefix": "CH",
  "categories": [
    "Dog",
    "Cat",
    "Pet supplies",
    "Other Animals"
  ],
  "service": "Everything for the pets you love \u00b7 Here for you 24/7",
  "cartLabel": "Cart",
  "searchPlaceholder": "Search pet food and supplies",
  "kicker": "Happy pets. Happy days.",
  "headline": "Good things for your best friend.",
  "intro": "From favorite meals to cozy naps, find everyday essentials for your pets.",
  "featuredLabel": "Pet parent favorites",
  "footer": "Pet food, toys and supplies",
  "catalogDescription": "Pet food and supplies.",
  "membership": "Sign In or Create Account",
  "heroAlt": "A golden retriever and cat curled up beside pet toys",
  "benefit": "Their favorites, all in one place",
  "benefitText": "Food, cozy beds, toys and the little things that make tails wag.",
  "delivery": "Standard shipping is free for these items.",
  "nav": [
    "Dog",
    "Cat",
    "Other Animals",
    "Pet supplies",
    "Today\u2019s favorites"
  ],
  "stylesheet": "/static/depth.css"

}

export default fixtureCatalog ? unavailableStore(fixtureConfig) : referenceStore
