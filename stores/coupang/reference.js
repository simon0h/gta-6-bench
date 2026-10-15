import { Router } from 'express'
import { referenceRetailStore } from '../reference-retail.js'
import { documentLayout } from './chrome.js'
import { installSite, homePage, searchBody } from './site.js'
import { installJourneys } from './journeys.js'
import { installShelf } from './shelf-pages.js'
import { isShelfSku } from './shelf.js'

export const catalogObservations = []
const store = referenceRetailStore({ slug: 'coupang', name: 'Coupang (쿠팡)', country: 'KR', currency: 'KRW', availability: 'unknown',
  chrome({ req, base, title, body }) { return documentLayout(req, base, title, body) },
  observations: catalogObservations, queryKeys: ['q'], searchRoutes: ['/np/search', '/search'],
})

// Coupang-specific pages layered in front of the shared reference router. The shelf
// (shelf.js) has its own product pages, cart and checkout for `kind: 'other'` items;
// any purchase request naming something else (GTA fixture SKUs, stale carts, unknown
// IDs) still reaches the shared read-only guard, which answers 409.
const router = Router()
const baseOf = res => res.locals.base || '/coupang'
function render(req, res, title, body, status = 200) {
  const chromeReq = Object.assign(Object.create(Object.getPrototypeOf(req)), req, { store: { ...req.store, cart: (req.store.cart || []).filter(line => isShelfSku(line?.sku)) } })
  res.status(status).type('html').send(documentLayout(chromeReq, baseOf(res), title, body))
}
const fallback = (req, res, title, copy, status) => render(req, res, title, `<section class="empty reference-coverage cp-empty" data-reference-state="uncaptured"><h1>${title}</h1><p>${copy}</p><a class="cp-btn" href="${baseOf(res)}/">쿠팡 홈으로 돌아가기</a></section>`, status)
// Repeated values are allowed only for the multi-select shelf facets.
const MULTI = new Set(['brand', 'deliveryType'])
const badQuery = query => Object.entries(query).some(([key, value]) => typeof value !== 'string' && !(MULTI.has(key) && Array.isArray(value) && value.every(v => typeof v === 'string')))
router.use((req, res, next) => badQuery(req.query) ? fallback(req, res, '잘못된 요청입니다', '검색 조건을 다시 선택해 주세요.', 400) : next())
router.get(['/', '/reference/catalog'], (req, res) => render(req, res, '쿠팡', homePage(baseOf(res))))
router.get(['/np/search', '/search'], (req, res) => render(req, res, '검색 결과', searchBody(baseOf(res), req.query)))
installShelf(router, { render })
installJourneys(router, { render, productPage: (req, res) => render(req, res, '상품을 찾을 수 없습니다', '<h1>상품을 찾을 수 없습니다.</h1>', 404) })
installSite(router, { render, reference: true })
// Korean versions of the shared reference router's fallbacks: unknown pages answer 404 and
// any purchase request that reached here (GTA fixture SKUs, stale carts) the read-only 409.
router.use((req, res) => req.method === 'GET'
  ? fallback(req, res, '페이지를 찾을 수 없습니다', '요청하신 페이지가 없거나 주소가 변경되었습니다.', 404)
  : fallback(req, res, '현재 구매할 수 없는 상품입니다', '판매가 종료되었거나 일시적으로 구매할 수 없는 상품입니다. 장바구니와 주문 내역은 변경되지 않았습니다.', 409))

export default { ...store, router }
