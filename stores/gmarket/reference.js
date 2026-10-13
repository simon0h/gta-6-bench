import { referenceRetailStore, observedProduct } from '../reference-retail.js'
import { esc, money } from '../../lib/html.js'
import { layout } from './catalog-pages.js'

export const catalogObservations = [
  { id: '4796016651', title: 'PS5 GTA6 Grand Theft Auto VI 한글판 예약판매', platform: 'ps5' },
  { id: '4796017670', title: 'Xbox Series X|S GTA6 Grand Theft Auto VI 한글판 예약판매', platform: 'xbox' },
].map(p => observedProduct({ ...p, kind: 'game', seller: 'h2몰', price: 89800, price_text: '89,800원', path: `/Item?goodscode=${p.id}` }, {
  source: `https://item.gmarket.co.kr/Item?goodscode=${p.id}`, evidence: 'research/fidelity-2026-10-06/other-retail.md#gmarket',
  facts: ['title', 'native_id', 'platform', 'seller', 'displayed_price'],
}))
const cards = base => `<div class="products">${catalogObservations.map(p => `<article data-reference-product="${p.id}" data-purchase-evidence="unverified"><h2><a href="${base}${p.path}">${esc(p.title)}</a></h2><p>${esc(p.seller)}</p><strong>${money(p.price, 'KRW')}</strong></article>`).join('')}</div>`
export default referenceRetailStore({ slug: 'gmarket', name: 'Gmarket (G마켓)', country: 'KR', currency: 'KRW', availability: 'listing_only',
  chrome({ req, base, title, body }) { return layout(base, title, [], req.store.user, body, req.query) },
  observations: catalogObservations, queryKeys: ['keyword', 'q'], searchRoutes: ['/n/search', '/search'],
  matches: query => typeof query === 'string' && query.trim().toLowerCase() === 'ps5gta6', capturedSearch: '/n/search?keyword=ps5gta6',
  search(req, res, { render, base }) { render(req, res, '관찰된 상품', `<h1>관찰된 상품</h1><p>공개 검색에서 확인한 상품입니다. 전체 검색 결과, 재고, 상품 구성 및 구매 가능 여부는 확인되지 않았습니다.</p>${cards(base)}`) },
  install(router, { render, coverage, baseOf }) {
    router.get(['/Item', '/product/:sku'], (req, res) => {
      const id = req.params.sku || req.query.goodscode || req.query.goodsCode
      const p = catalogObservations.find(p => p.id === id)
      if (!p) return coverage(req, res, 'Product has not been captured', 404)
      render(req, res, p.title, `<section data-purchase-evidence="unverified"><h1>${esc(p.title)}</h1><p>${esc(p.seller)}</p><strong>${money(p.price, 'KRW')}</strong><p>공개 검색에서 확인한 상품 정보입니다. 성인 본인인증 이후 상품 페이지, 재고, 에디션, 상품 구성 및 결제 과정은 확인되지 않았습니다.</p><a href="${baseOf(res)}/n/search?keyword=ps5gta6">검색으로 돌아가기</a></section>`)
    })
  },
})
