import { Router } from 'express'
import { referenceRetailStore } from '../reference-retail.js'
import { documentLayout } from './chrome.js'
import { installSite, homePage, searchBody, emptyCart } from './site.js'
import { installJourneys } from './journeys.js'

export const catalogObservations = []
const store = referenceRetailStore({ slug: 'coupang', name: 'Coupang (쿠팡)', country: 'KR', currency: 'KRW', availability: 'unknown',
  chrome({ req, base, title, body }) { return documentLayout(req, base, title, body) },
  observations: catalogObservations, queryKeys: ['q'], searchRoutes: ['/np/search', '/search'],
})

// Coupang-specific pages layered in front of the shared reference router. Purchase
// endpoints (/cart/add, /checkout ...) are not handled here, so they still reach the
// shared read-only guard.
const router = Router()
const baseOf = res => res.locals.base || '/coupang'
function render(req, res, title, body, status = 200) {
  const chromeReq = Object.assign(Object.create(Object.getPrototypeOf(req)), req, { store: { ...req.store, cart: [] } })
  res.status(status).type('html').send(documentLayout(chromeReq, baseOf(res), title, body))
}
router.use((req, res, next) => Object.values(req.query).some(value => typeof value !== 'string') ? store.router.handle(req, res, next) : next())
router.get(['/', '/reference/catalog'], (req, res) => render(req, res, '쿠팡', homePage(baseOf(res))))
router.get(['/np/search', '/search'], (req, res) => render(req, res, '검색 결과', searchBody(baseOf(res), req.query)))
router.get(['/cart', '/cartView.pang'], (req, res) => render(req, res, '장바구니', emptyCart(baseOf(res))))
installJourneys(router, { render, productPage: (req, res) => render(req, res, '상품을 찾을 수 없습니다', '<h1>상품을 찾을 수 없습니다.</h1>', 404) })
installSite(router, { render, reference: true })
router.use(store.router)

export default { ...store, router }
