import { Router } from 'express'
import { referenceRetailStore, observedProduct } from '../reference-retail.js'
import { esc } from '../../lib/html.js'
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

// The shared adapter's fallback pages (unknown page, refused purchase, bad input) are written
// in English. Re-voice them in Gmarket Korean; status codes and markers stay as they are.
const fallbackCopy = (base, title, body) => {
  const query = /<strong>([^<]*)<\/strong>/.exec(body)?.[1]
  const pick = title.startsWith('No results for')
    ? ['검색결과가 없습니다', `${query ? `‘${query}’에 대한 ` : ''}검색결과가 없습니다.`, '단어의 철자가 정확한지 확인하거나, 검색어의 단어 수를 줄이거나 보다 일반적인 검색어로 다시 검색해 보세요.']
    : title === "This item isn't available to buy online right now"
      ? ['구매할 수 없는 상품입니다', '현재 구매할 수 없는 상품입니다.', '판매자 사정으로 지금은 주문할 수 없습니다. 다른 상품을 둘러보세요.']
      : title === 'Choose one value for each query field' || title === 'Enter a valid ZIP code'
        ? ['요청을 처리할 수 없습니다', title === 'Enter a valid ZIP code' ? '우편번호 5자리를 정확히 입력해 주세요.' : '요청을 처리할 수 없습니다.', '입력하신 내용을 다시 확인해 주세요.']
        : ['페이지를 찾을 수 없습니다', '요청하신 페이지를 찾을 수 없습니다.', '방문하시려는 페이지의 주소가 잘못 입력되었거나, 페이지가 변경 또는 삭제되어 찾을 수 없습니다. 입력하신 주소가 정확한지 다시 한번 확인해 주세요.']
  return { title: pick[0], body: `<section class="empty reference-coverage gm-notfound" data-reference-state="uncaptured"><p class="gm-pending-icon" aria-hidden="true">🔍</p><h1>${pick[1]}</h1><p>${pick[2]}</p><p><a class="gm-btn" href="${base}/">G마켓 홈으로</a> <a class="gm-btn outline" href="${base}/help">고객센터</a></p></section>` }
}
const localize = (base, title, body) => body.includes('data-reference-state="uncaptured"') && /^<section class="empty reference-coverage"/.test(body) ? fallbackCopy(base, title, body) : { title, body }

let renderPage
const store = referenceRetailStore({ slug: 'gmarket', name: 'Gmarket (G마켓)', country: 'KR', currency: 'KRW', availability: 'listing_only',
  chrome({ req, base, title, body }) { const page = localize(base, title, body); return layout(base, page.title, req.store.user, page.body, req.query, cartCount(req)) },
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
    // Same form (action, field name) as the shared delivery-location page, in Korean.
    router.get('/location', (req, res) => render(req, res, '배송지 설정', `<section class="gm-panel gm-location"><h1 class="gm-page-title">배송지 설정</h1><p class="gm-muted">우편번호를 입력하면 배송 가능 여부와 도착 예정일을 안내해 드립니다.</p><form method="post" action="${baseOf(res)}/location"><label for="postal-code">우편번호</label><input id="postal-code" name="postal_code" value="${esc(req.store.location || '')}" inputmode="numeric" placeholder="5자리" required><button class="gm-btn">저장</button></form></section>`))
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
