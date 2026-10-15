import { Router } from 'express'
import { referenceRetailStore, observedProduct } from '../reference-retail.js'
import { layout, home, installSite, searchPage, productPage } from './site.js'
import { installShelf, searchShelf } from './shelf-pages.js'

export const catalogObservations = [
  { id: '4796016651', title: 'PS5 GTA6 Grand Theft Auto VI 한글판 예약판매', platform: 'ps5' },
  { id: '4796017670', title: 'Xbox Series X|S GTA6 Grand Theft Auto VI 한글판 예약판매', platform: 'xbox' },
].map(p => observedProduct({ ...p, kind: 'game', seller: 'h2몰', price: 89800, price_text: '89,800원', path: `/Item?goodscode=${p.id}` }, {
  source: `https://item.gmarket.co.kr/Item?goodscode=${p.id}`, evidence: 'research/fidelity-2026-10-06/other-retail.md#gmarket',
  facts: ['title', 'native_id', 'platform', 'seller', 'displayed_price'],
}))

const cartCount = req => (req.store.gmShelf?.cart || []).reduce((sum, line) => sum + line.qty, 0)

let renderPage
const store = referenceRetailStore({ slug: 'gmarket', name: 'Gmarket (G마켓)', country: 'KR', currency: 'KRW', availability: 'listing_only',
  chrome({ req, base, title, body }) { return layout(base, title, req.store.user, body, req.query, cartCount(req)) },
  observations: catalogObservations, queryKeys: ['keyword', 'q'], searchRoutes: ['/n/search', '/search'],
  // Every non-empty keyword searches the shelf plus the captured GTA 6 observations.
  matches: query => typeof query === 'string' && query.trim().length > 0 && query.trim().length <= 100, capturedSearch: '/n/search?keyword=ps5gta6',
  search(req, res, { render, base, query }) {
    const q = query.trim()
    render(req, res, `${q} 검색결과`, searchPage(base, q, searchShelf(q, catalogObservations), req.query))
  },
  install(router, { render, coverage, baseOf }) {
    renderPage = render
    // Shelf routes come first; non-shelf IDs fall through to the observation and
    // coverage handlers, so GTA 6 purchase attempts still reach the 409 guard.
    installShelf(router, { render, coverage, baseOf })
    router.get(['/Item', '/product/:sku'], (req, res) => {
      const id = req.params.sku || req.query.goodscode || req.query.goodsCode
      const p = catalogObservations.find(p => p.id === id)
      if (!p) return coverage(req, res, 'Product has not been captured', 404)
      render(req, res, p.title, productPage(baseOf(res), p))
    })
    installSite(router, { render, coverage, baseOf, observations: catalogObservations })
  },
})

// The shared adapter registers its own captured-catalog homepage first; serve the
// Gmarket homepage layout ahead of it while keeping every other route in the adapter.
const router = Router()
router.get('/', (req, res, next) => {
  if (Object.values(req.query).some(value => typeof value !== 'string')) return next()
  renderPage(req, res, '지금부터의 마켓', home(res.locals.base || '/gmarket', catalogObservations))
})
router.use(store.router)

export default { ...store, router }
