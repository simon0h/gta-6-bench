import { Router } from 'express'
import { referenceRetailStore, observedProduct, capturedPhrase } from '../reference-retail.js'
import { capturedSephoraSearch, capturedSephoraProduct, capturedSearchProducts } from './search-capture.js'
import { siteChrome, installSite, homePage, productExtras } from './site.js'
import { findByPathId, searchProducts, categoryProducts } from './shelf.js'
import { productPage, searchPage, installShelf } from './shelf-pages.js'
import { CATEGORIES } from './site-data.js'

export const catalogObservations = capturedSearchProducts.map(p => observedProduct(p, {
  source: p.sourceUrl, evidence: 'research/fidelity-2026-10-06/sephora-search.md',
  facts: ['title', 'brand', 'native_path', 'displayed_price', 'rating', 'review_count', 'image'],
}))
const store = referenceRetailStore({ slug: 'sephora', name: 'Sephora', availability: 'unavailable', chrome: siteChrome,
  observations: catalogObservations, prepare(req) { req.sephoraReferenceCatalog = true },
  queryKeys: ['keyword', 'q'], searchRoutes: ['/search'], matches: capturedPhrase, capturedSearch: '/search?keyword=gta%206',
  search(req, res, { render, base, query }) { render(req, res, `Search results for ${query}`, capturedSephoraSearch(base, { ...req.query, q: query })) },
  install(router, context) {
    const { render, coverage, baseOf } = context
    router.get('/product/:id', (req, res) => {
      const p = capturedSearchProducts.find(p => p.path.split('?')[0] === req.path)
      if (!p) {
        // Assortment product pages: /product/<name>-P123456?skuId=1234567
        const item = findByPathId(req.params.id)
        if (item && req.params.id === `${item.slug}-${item.id}` && (req.query.skuId === undefined || item.variants.some(v => v.sku === req.query.skuId))) {
          return render(req, res, `${item.brand} ${item.name}`, productPage(baseOf(res), item, req.query.skuId))
        }
      }
      // An unobserved SKU parameter is not evidence of the captured variant.
      if (!p || (req.query.skuId !== undefined && req.query.skuId !== p.sku)) return coverage(req, res, 'Product variant has not been captured', 404)
      render(req, res, p.title, capturedSephoraProduct(baseOf(res), p) + productExtras(baseOf(res), p))
    })
    installShelf(router, context)
    installSite(router, context)
  },
})

// The shared reference adapter serves its captured-catalog listing at "/"; Sephora's homepage
// replaces it (the listing stays at /reference/catalog). The homepage's "Chosen For You" row is
// the captured catalog, so it keeps data-reference-state="catalog".
const router = Router()
router.get('/', (req, res, next) => {
  if (Object.values(req.query).some(value => typeof value !== 'string')) return next()
  const base = res.locals.base || '/sephora'
  const chromeReq = Object.assign(Object.create(Object.getPrototypeOf(req)), req, { store: { ...req.store, cart: [] } })
  res.status(200).type('html').send(siteChrome({ req: chromeReq, base, title: 'Sephora: Beauty, Makeup, Skincare, Hair & Fragrance', body: homePage(base, req) }))
})
// Search for anything other than the captured "gta 6" phrase uses the assortment. Queries with
// no assortment match (for example GTA 6 spelled any other way) keep the reference store's
// uncaptured-search page.
const CATEGORY_PARAM = { Skincare: 'skincare', Makeup: 'makeup-cosmetics', Hair: 'hair-products', Fragrance: 'fragrance', Men: 'men', Gifts: 'gifts', 'Mini Size': 'travel-size-toiletries', 'Luxury Beauty': 'luxury-beauty', 'Bath & Body': 'bath-body', 'Tools & Brushes': 'makeup-tools', 'Clean at Sephora': 'clean-skin-care' }
router.get('/search', (req, res, next) => {
  if (Object.values(req.query).some(value => typeof value !== 'string')) return next()
  const keyword = [req.query.keyword, req.query.q].find(v => v !== undefined) ?? ''
  if (capturedPhrase(keyword)) return next()
  const slug = CATEGORY_PARAM[req.query.category]
  let list = keyword.trim() ? searchProducts(keyword) : slug ? categoryProducts(slug) : []
  if (keyword.trim() && slug) list = list.filter(p => categoryProducts(slug).includes(p))
  if (!list.length) return next()
  const base = res.locals.base || '/sephora'
  const label = keyword.trim() || CATEGORIES[slug]?.title || req.query.category
  const query = { ...req.query, keyword: keyword.trim() }
  res.status(200).type('html').send(siteChrome({ req, base, title: `Search results for ${label}`, body: searchPage(base, query, list, label) }))
})
router.use(store.router)
export default { ...store, router }
