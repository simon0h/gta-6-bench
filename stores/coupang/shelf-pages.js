// Coupang shelf pages for the default reference catalog: product cards, the
// filterable result grid, product detail, cart, checkout and confirmation.
// Only shelf items (shelf.js) can be bought here, always as `kind: 'other'` order
// lines. Anything else (stale GTA fixture lines, unknown SKUs) falls through to the
// shared read-only guard in reference-retail.js, which answers 409.
import { randomInt, randomUUID } from 'node:crypto'
import { esc, money, publicNotice } from '../../lib/html.js'
import { validateCard } from '../../lib/payment.js'
import { recordOrder } from '../../lib/orders.js'
import { shelf, shelfById, shelfBySku, isShelfSku, shelfArt, SHELF_VIEWS, filterShelf, sortShelf, PRICE_BANDS, DELIVERY_LABEL, inDept } from './shelf.js'
import { deptById } from './site-data.js'
import { needsMember, customerOrder, rememberViewed, checkoutAddressValues, checkoutAddressLinks } from './journeys.js'

const won = n => money(n, 'KRW')
const text = v => typeof v === 'string' ? v.trim() : ''
const many = v => (Array.isArray(v) ? v : [v]).filter(x => typeof x === 'string' && x)
export const PER_PAGE = 36
export const MAX_QTY = 10
const FREE_SHIPPING = 19800, SHIPPING_FEE = 3000

// ── Arrival promises (KST) ────────────────────────────────────────────────
const DAYS = ['일', '월', '화', '수', '목', '금', '토']
function kstDate(offsetDays) {
  const d = new Date(Date.now() + 9 * 3600e3 + offsetDays * 86400e3)
  return { md: `${d.getUTCMonth() + 1}/${d.getUTCDate()}`, day: DAYS[d.getUTCDay()] }
}
export function arrival(p) {
  if (p.delivery === 'fresh') return { text: `내일(${kstDate(1).day}) 새벽 7시 전 도착 보장`, cls: 'cs-arrive-fresh' }
  if (p.delivery === 'rocket') return { text: `내일(${kstDate(1).day}) 도착 보장`, cls: 'cs-arrive-rocket' }
  if (p.delivery === 'seller-rocket') return { text: `모레(${kstDate(2).day}) 도착 보장`, cls: 'cs-arrive-rocket' }
  if (p.delivery === 'global') { const d = kstDate(6); return { text: `${d.md}(${d.day}) 도착 예정`, cls: 'cs-arrive-global' } }
  const d = kstDate(3); return { text: `${d.md}(${d.day}) 도착 예정`, cls: 'cs-arrive-seller' }
}
const BADGE = { rocket: '로켓배송', fresh: '로켓프레시', global: '로켓직구', 'seller-rocket': '판매자로켓' }
const badge = p => BADGE[p.delivery] ? `<span class="cs-badge cs-badge-${p.delivery}">${BADGE[p.delivery]}</span>` : ''
const stars = r => `<span class="cs-stars" style="--r:${(r / 5) * 100}%" role="img" aria-label="5점 만점에 ${r}점"></span>`
export const imgUrl = (base, p, view = 0) => `${base}/image/vp/${p.id}/${view}.svg`
export const shelfImg = (base, p, cls = '', view = 0, lazy = true) => `<img class="cs-img ${cls}" src="${esc(imgUrl(base, p, view))}" alt="${esc(p.title)}" width="230" height="230"${lazy ? ' loading="lazy"' : ''} decoding="async">`
export const productHref = (base, p) => base + p.path

// ── Cards and grids ───────────────────────────────────────────────────────
export function card(base, p, { rank } = {}) {
  const a = arrival(p)
  return `<li class="cs-card" data-product-kind="other" data-shelf-product="${p.id}"><a href="${esc(productHref(base, p))}">${rank ? `<span class="cs-rank">${rank}</span>` : ''}<span class="cs-thumb">${shelfImg(base, p)}</span><span class="cs-name">${esc(p.title)}</span><span class="cs-price-area">${p.discount ? `<span class="cs-base"><b>${p.discount}%</b> <del>${won(p.listPrice)}</del></span>` : ''}<span class="cs-sale"><strong>${won(p.price)}</strong>${badge(p)}</span>${p.unit ? `<span class="cs-unit">(${esc(p.unit)})</span>` : ''}</span><span class="cs-arrive ${a.cls}">${esc(a.text)}</span><span class="cs-rating">${stars(p.rating)}<span>(${p.reviews.toLocaleString('ko-KR')})</span></span></a></li>`
}
export const row = (base, items, opts) => `<ul class="cs-row">${items.map((p, i) => card(base, p, opts?.ranked ? { rank: i + 1 } : {})).join('')}</ul>`

const DELIVERY_FACET = [['rocket', '로켓배송'], ['fresh', '로켓프레시'], ['global', '로켓직구'], ['seller-rocket', '판매자로켓'], ['free', '무료배송']]
const RATING_FACET = [['4', '★★★★ 4점 이상'], ['3', '★★★ 3점 이상']]
export const SORTS = [['scoreDesc', '쿠팡 랭킹순'], ['salePriceAsc', '낮은가격순'], ['salePriceDesc', '높은가격순'], ['saleCountDesc', '판매량순'], ['latestAsc', '최신순']]

function link(action, hidden, query, patch) {
  const p = new URLSearchParams()
  for (const [k, v] of Object.entries(hidden)) if (typeof v === 'string' && v) p.set(k, v)
  for (const [k, v] of Object.entries({ ...query, ...patch })) {
    if (k in hidden || v === undefined || v === null || v === '') continue
    for (const x of many(v)) p.append(k, x)
  }
  const s = p.toString()
  return esc(s ? `${action}?${s}` : action)
}

// Full listing: filter sidebar, sort bar, product grid and pagination (GET, no JS).
export function grid(base, action, query, items, { heading = '', hidden = {}, keepOrder = false, emptyTitle } = {}) {
  const sort = SORTS.some(([v]) => v === query.sorter) ? query.sorter : 'scoreDesc'
  const filtered = sortShelf(filterShelf(items, query), sort, keepOrder)
  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const page = Math.min(pages, Math.max(1, Number.parseInt(query.page, 10) || 1))
  const shown = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const checked = (k, v) => many(query[k]).includes(v) ? ' checked' : ''
  const keep = Object.entries(hidden).map(([k, v]) => `<input type="hidden" name="${esc(k)}" value="${esc(v)}">`).join('')
  const brandCounts = new Map()
  for (const p of filterShelf(items, { ...query, brand: undefined })) brandCounts.set(p.brand, (brandCounts.get(p.brand) || 0) + 1)
  const brands = [...brandCounts].sort((a, b) => b[1] - a[1]).slice(0, 12)
  for (const b of many(query.brand)) if (!brands.some(([x]) => x === b) && brandCounts.has(b)) brands.push([b, brandCounts.get(b)])
  const filters = `<form class="cp-filters" method="get" action="${esc(action)}" aria-label="검색 필터">${keep}<h2>필터</h2>
<fieldset><legend>배송</legend>${DELIVERY_FACET.map(([v, l]) => `<label><input type="checkbox" name="deliveryType" value="${v}"${checked('deliveryType', v)}> ${l}</label>`).join('')}</fieldset>
${brands.length ? `<fieldset><legend>브랜드</legend>${brands.map(([b, n]) => `<label><input type="checkbox" name="brand" value="${esc(b)}"${checked('brand', b)}> ${esc(b)} <small>(${n})</small></label>`).join('')}</fieldset>` : ''}
<fieldset><legend>가격</legend>${PRICE_BANDS.map(([v, l]) => `<label><input type="radio" name="price" value="${v}"${checked('price', v)}> ${l}</label>`).join('')}</fieldset>
<fieldset><legend>상품평</legend>${RATING_FACET.map(([v, l]) => `<label><input type="radio" name="rating" value="${v}"${checked('rating', v)}> ${l}</label>`).join('')}</fieldset>
<input type="hidden" name="sorter" value="${sort}"><button>필터 적용</button>${['deliveryType', 'brand', 'price', 'rating'].some(k => many(query[k]).length) ? ` <a class="cs-reset" href="${link(action, hidden, {}, { sorter: sort === 'scoreDesc' ? undefined : sort })}">초기화</a>` : ''}</form>`
  const sortbar = `<div class="cp-sortbar" role="navigation" aria-label="정렬">${SORTS.map(([v, l]) => `<a href="${link(action, hidden, query, { sorter: v, page: undefined })}"${v === sort ? ' aria-current="true"' : ''}>${l}</a>`).join('')}<span class="cp-view">${PER_PAGE}개씩 보기</span></div>`
  const pager = pages > 1 ? `<nav class="cs-pager" aria-label="페이지">${page > 1 ? `<a href="${link(action, hidden, query, { page: String(page - 1) })}" rel="prev">‹ 이전</a>` : ''}${Array.from({ length: pages }, (_, i) => i + 1).map(n => n === page ? `<strong aria-current="page">${n}</strong>` : `<a href="${link(action, hidden, query, { page: String(n) })}">${n}</a>`).join('')}${page < pages ? `<a href="${link(action, hidden, query, { page: String(page + 1) })}" rel="next">다음 ›</a>` : ''}</nav>` : ''
  const body = shown.length ? `<ul class="cs-grid" data-result-count="${filtered.length}">${shown.map(p => card(base, p)).join('')}</ul>${pager}`
    : `<div class="cp-empty" data-catalog-state="no-match"><div class="cp-empty-icon" aria-hidden="true">🔍</div><h2>${esc(emptyTitle || '선택한 조건에 맞는 상품이 없습니다.')}</h2><p>필터를 해제하거나 다른 조건을 선택해 보세요.</p><a class="cp-btn-outline" href="${link(action, hidden, {}, {})}">필터 초기화</a></div>`
  return `<div class="cp-listing">${filters}<section class="cp-results">${heading}${sortbar}<p class="cs-count">전체 <b>${filtered.length.toLocaleString('ko-KR')}</b>개 상품</p>${body}</section></div>`
}

// ── Product detail ────────────────────────────────────────────────────────
// Star distribution varies per item (seeded by product id) and the score shown is the
// mean of that distribution, so the bars and the number always agree.
function reviewWeights(p) {
  const h = [...p.id].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7)
  const top = p.rating >= 5 ? 77 + h % 8 : p.rating >= 4.5 ? 66 + h % 9 : 50 + h % 9
  const second = p.rating >= 5 ? 11 + (h >> 4) % 5 : p.rating >= 4.5 ? 19 + (h >> 4) % 6 : 26 + (h >> 4) % 6
  const rest = 100 - top - second, third = Math.ceil(rest * 0.5), fourth = Math.ceil((rest - third) * 0.55)
  return [top, second, third, fourth, rest - third - fourth]
}
function reviewSummary(p) {
  const weights = reviewWeights(p), mean = weights.reduce((s, w, i) => s + w * (5 - i), 0) / 100
  return `<div class="cs-review-summary"><div class="cs-review-score"><strong>${mean.toFixed(1)}</strong>${stars(Math.round(mean * 2) / 2)}<p>${p.reviews.toLocaleString('ko-KR')}개 상품평</p></div><dl>${weights.map((w, i) => `<dt>${['최고', '좋음', '보통', '별로', '나쁨'][i]}</dt><dd><meter min="0" max="100" value="${w}">${w}%</meter> ${w}%</dd>`).join('')}</dl></div><p class="hint">동일한 상품에 대해 작성된 상품평으로, 판매자는 다르지만 같은 상품을 구매한 고객의 상품평입니다.</p>`
}
// A few written reviews per item, chosen by product id from department-appropriate lines.
const REVIEW_LINES = {
  '194276': ['로켓배송으로 다음날 바로 받았어요. 유통기한도 넉넉하고 포장도 꼼꼼했습니다.', '항상 먹는 제품이라 재구매했어요. 마트보다 저렴해서 쿠팡에서 삽니다.', '대용량이라 쟁여두기 좋아요. 가족들이 다 좋아해요.', '맛은 늘 먹던 그 맛이에요. 할인할 때 사두면 이득입니다.', '박스 찌그러짐 없이 잘 왔어요. 다음에도 구매할게요.'],
  '393760': ['새벽에 문 앞에 와 있어서 아침에 바로 먹었어요. 신선도 좋습니다.', '프레시백에 아이스팩까지 잘 들어 있어서 시원하게 받았어요.', '상태 좋고 양도 넉넉해요. 재구매 의사 있습니다.', '소비기한 넉넉하게 왔고 맛도 좋아요.'],
  '115673': ['쓰던 제품이라 믿고 샀어요. 다음날 바로 와서 편하네요.', '대용량이라 한동안 걱정 없겠어요. 가격도 괜찮습니다.', '향이 은은하고 좋아요. 가족들도 만족합니다.', '부피가 큰데 문 앞까지 배송해줘서 너무 편해요.', '할인할 때 넉넉하게 쟁였어요.'],
  '178255': ['배송 빠르고 정품 맞습니다. 설정도 어렵지 않았어요.', '생각보다 크기가 적당하고 디자인이 깔끔해요.', '한 달 정도 사용했는데 문제없이 잘 쓰고 있습니다.', '가격 대비 성능 좋아요. 부모님 댁에도 하나 더 샀어요.', '포장이 튼튼하게 와서 안심했어요.'],
  '176422': ['순하고 자극 없어서 민감한 피부에도 잘 맞아요.', '흡수가 빠르고 끈적임이 없어요. 벌써 두 번째 구매입니다.', '용량 대비 가격이 착해요. 유통기한도 넉넉합니다.', '향이 강하지 않아서 좋아요. 꾸준히 쓰려고요.'],
  '219079': ['아기 피부에 순해서 계속 이것만 써요.', '두께감 있고 촉촉해요. 대용량이라 든든합니다.', '로켓배송이라 급할 때 바로 받을 수 있어서 좋아요.', '사이즈 잘 맞고 새는 것 없이 잘 쓰고 있어요.'],
  '115674': ['우리 아이가 너무 잘 먹어요. 기호성 좋습니다.', '무거운 걸 집 앞까지 가져다줘서 편해요.', '냄새 잡는 것도 괜찮고 만족합니다.', '정기적으로 구매하는 제품이에요. 배송 늘 빨라요.'],
  '305798': ['꾸준히 먹고 있어요. 알약 크기가 적당해서 삼키기 편해요.', '부모님 드리려고 샀는데 좋아하세요.', '유통기한 넉넉하고 포장도 꼼꼼해요.', '개별 포장이라 들고 다니기 좋아요.'],
  '185669': ['튼튼하고 마감이 좋아요. 세척도 쉬워요.', '사이즈가 딱 적당해서 매일 쓰고 있어요.', '가격 대비 품질이 좋습니다.', '디자인이 깔끔해서 주방이 정돈돼 보여요.'],
  default: ['배송 빠르고 상품 상태 좋습니다.', '가격 대비 만족스러워요. 재구매 의사 있어요.', '사진이랑 똑같고 품질도 괜찮아요.', '포장 꼼꼼하게 잘 왔어요. 잘 쓸게요.', '생각했던 것보다 더 좋아요. 추천합니다.'],
}
const SURNAMES = '김이박최정강조윤장임한오서신권황안송류홍', GIVEN = '민진현수영희준우은아호연지서'
function reviewList(p) {
  const lines = REVIEW_LINES[p.dept] || REVIEW_LINES.default
  let h = [...p.id].reduce((a, c) => (a * 33 + c.charCodeAt(0)) >>> 0, 11)
  const next = n => { h = (h * 1103515245 + 12345) >>> 0; return (h >>> 8) % n }
  const start = next(lines.length), stars4 = next(4)
  let day = Date.UTC(2026, 9, 15) - next(3) * 86400000
  const items = Array.from({ length: 4 }, (_, i) => {
    const r = i === stars4 ? 4 : 5, d = new Date(day)
    day -= (1 + next(9)) * 86400000
    return `<li class="cs-review"><p class="cs-reviewer"><b>${SURNAMES[next(SURNAMES.length)]}*${GIVEN[next(GIVEN.length)]}</b></p><p class="cs-review-meta">${stars(r)} <span>${d.getUTCFullYear()}.${String(d.getUTCMonth() + 1).padStart(2, '0')}.${String(d.getUTCDate()).padStart(2, '0')}</span></p><p class="cs-review-option">${esc(p.title)}</p><p class="cs-review-text">${esc(lines[(start + i) % lines.length])}</p><p class="cs-review-help">${3 + next(58)}명에게 도움 됨</p></li>`
  })
  return `<div class="cs-review-sort"><b>베스트순</b><span>최신순</span></div><ul class="cs-review-list">${items.join('')}</ul>`
}
function specs(p) {
  const d = deptById(p.dept)
  return { '품명 및 모델명': p.title.split(',')[0], '브랜드': p.brand, '카테고리': `${d.label} > ${p.subLabel}`, '판매자': p.seller, '배송': DELIVERY_LABEL[p.delivery], '쿠팡상품번호': `${p.id} - ${p.itemId}`, ...(p.unit ? { '단위가격': p.unit } : {}), '제조국': '상품 상세 참조', 'A/S 안내': '상품 상세 참조 / 쿠팡 고객센터 1577-7011' }
}
export function productBody(base, p, query = {}, errors = []) {
  const d = deptById(p.dept), a = arrival(p)
  const view = Math.min(SHELF_VIEWS - 1, Math.max(0, Number.parseInt(query.view, 10) || 0))
  const href = productHref(base, p)
  const related = shelf.filter(x => x.id !== p.id && x.dept === p.dept && x.sub === p.sub).concat(shelf.filter(x => x.id !== p.id && x.dept === p.dept && x.sub !== p.sub)).slice(0, 6)
  const qty = text(query.qty) || '1'
  const shipping = p.delivery === 'seller' ? '무료배송 (판매자 배송)' : p.delivery === 'global' ? '무료배송 · 해외 배송 (개인통관고유부호 필요)' : `무료배송 (${won(FREE_SHIPPING)} 이상 구매 시) · 와우회원 무료배송`
  return `${errors.length ? `<div class="errors" role="alert"><strong>입력 내용을 확인해 주세요.</strong><ul>${errors.map(e => `<li>${esc(e)}</li>`).join('')}</ul></div>` : ''}${query.added ? `<div class="notice" role="status">상품이 장바구니에 담겼습니다. <a href="${base}/cart">장바구니 바로가기 ›</a></div>` : ''}
<p class="crumb cp-crumb"><a href="${base}">쿠팡 홈</a> &gt; <a href="${base}/np/categories/${d.id}">${esc(d.label)}</a> &gt; <a href="${base}/np/categories/${d.id}/${p.sub}">${esc(p.subLabel)}</a></p>
<div class="cs-product" data-product-kind="other" data-shelf-product="${p.id}">
<section class="cs-gallery" aria-label="상품 이미지"><div class="cs-gallery-main">${shelfImg(base, p, 'cs-main-img', view, false)}</div><div class="cs-thumbs">${Array.from({ length: SHELF_VIEWS }, (_, i) => `<a href="${esc(`${href}&view=${i}`)}"${i === view ? ' aria-current="true"' : ''} aria-label="이미지 ${i + 1}">${shelfImg(base, p, '', i)}</a>`).join('')}</div></section>
<section class="cs-buybox"><a class="cs-brand" href="${base}/np/search?q=${encodeURIComponent(p.brand)}">${esc(p.brand)} 브랜드 상품 더보기 ›</a><h1 class="cs-title">${esc(p.title)}</h1>
<a class="cs-rating-link" href="#cs-reviews">${stars(p.rating)} <span>${p.reviews.toLocaleString('ko-KR')}개 상품평</span></a>
<div class="cs-pricebox">${p.discount ? `<p class="cs-base"><b>${p.discount}%</b> <del>${won(p.listPrice)}</del></p>` : ''}<p class="cs-sale"><strong>${won(p.price)}</strong>${badge(p)}</p>${p.unit ? `<p class="cs-unit">(${esc(p.unit)})</p>` : ''}${p.wow ? '<p class="cs-wow">와우회원 무료배송 · 무료반품</p>' : ''}</div>
<dl class="cs-ship"><dt>배송</dt><dd>${esc(shipping)}</dd><dt>도착</dt><dd class="cs-arrive ${a.cls}"><strong>${esc(a.text)}</strong></dd><dt>판매자</dt><dd>${esc(p.seller)}</dd></dl>
<form class="cs-buy" method="post" action="${base}/cart/add"><input type="hidden" name="product_id" value="${p.id}"><input type="hidden" name="sku" value="${p.sku}"><label for="cs-qty">수량</label><select id="cs-qty" name="qty">${Array.from({ length: MAX_QTY }, (_, i) => String(i + 1)).map(n => `<option value="${n}"${n === qty ? ' selected' : ''}>${n}</option>`).join('')}</select><div class="cs-buy-actions"><button class="cs-cart-btn" name="intent" value="cart">장바구니 담기</button><button class="cs-now-btn" name="intent" value="buy">바로구매 ›</button></div></form>
${publicNotice('<p class="hint">모의 쇼핑 환경의 예시 상품입니다. 가격·재고·도착 예정일은 실제 쿠팡과 다를 수 있습니다.</p>')}</section></div>
<nav class="cs-tabs" aria-label="상품 정보"><a href="#cs-detail">상품상세</a><a href="#cs-reviews">상품평 (${p.reviews.toLocaleString('ko-KR')})</a><a href="#cs-qna">상품문의</a><a href="#cs-policy">배송/교환/반품 안내</a></nav>
<section id="cs-detail" class="cs-section"><h2>상품상세</h2><div class="cs-detail-art">${shelfImg(base, p, '', 2)}</div><h3>필수 표기정보</h3><dl class="spec-table">${Object.entries(specs(p)).map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl></section>
<section id="cs-reviews" class="cs-section"><h2>상품평</h2>${reviewSummary(p)}${reviewList(p)}</section>
<section id="cs-qna" class="cs-section"><h2>상품문의</h2><p>구매한 상품의 취소/반품은 마이쿠팡 구매내역에서 신청 가능합니다. 상품문의 및 상품평을 통해 취소나 환불, 반품 등은 처리되지 않습니다.</p><a class="cp-btn-outline" href="${base}/ssr/desktop/contact/inquiry">문의하기</a></section>
<section id="cs-policy" class="cs-section"><h2>배송/교환/반품 안내</h2><dl class="spec-table"><dt>배송방법</dt><dd>${esc(DELIVERY_LABEL[p.delivery])}</dd><dt>배송비</dt><dd>${esc(shipping)}</dd><dt>교환/반품 기간</dt><dd>상품 수령 후 7일 이내 (단순 변심)</dd><dt>교환/반품 안내</dt><dd><a href="${base}/returnPolicy.pang">취소 / 반품 / 교환 안내</a></dd></dl></section>
${related.length ? `<section class="cs-section"><h2>다른 고객이 함께 본 상품</h2>${row(base, related)}</section>` : ''}`
}

// ── Cart and checkout (shelf items only) ──────────────────────────────────
const shelfLines = req => (req.store.cart || []).filter(l => isShelfSku(l.sku))
const foreignLines = req => (req.store.cart || []).some(l => !isShelfSku(l.sku)) || (req.store.buyNow && !isShelfSku(req.store.buyNow.sku))
const line = (p, qty) => ({ kind: 'other', sku: p.sku, title: p.title, qty, unit_price: p.price })
const validQty = v => /^(?:[1-9]|10)$/.test(text(v)) ? Number(text(v)) : null
export const cartCount = req => shelfLines(req).reduce((s, l) => s + l.qty, 0)
export function totals(items) {
  const subtotal = items.reduce((s, i) => s + i.qty * i.unit_price, 0)
  const rocket = items.filter(i => shelfBySku(i.sku)?.delivery !== 'seller').reduce((s, i) => s + i.qty * i.unit_price, 0)
  const shipping = rocket > 0 && rocket < FREE_SHIPPING ? SHIPPING_FEE : 0
  return { subtotal, shipping, tax: 0, discount: 0, total: subtotal + shipping }
}
function purchaseLines(req) {
  const source = req.store.buyNow ? [req.store.buyNow] : shelfLines(req)
  return source.map(l => { const p = shelfBySku(l.sku), qty = validQty(String(l.qty)); if (!p || !qty) throw new Error('상품 정보가 변경되었습니다.'); return line(p, qty) })
}
const errorsHTML = errors => errors.length ? `<div class="errors" role="alert"><strong>입력 내용을 확인해 주세요.</strong><ul>${errors.map(e => `<li>${esc(e)}</li>`).join('')}</ul></div>` : ''
function amountBox(t, label = '총 주문금액') {
  return `<dl class="cs-amount"><dt>총 상품가격</dt><dd>${won(t.subtotal)}</dd><dt>총 배송비</dt><dd>${t.shipping ? won(t.shipping) : '무료'}</dd><dt class="cs-total">${label}</dt><dd class="cs-total"><strong>${won(t.total)}</strong></dd></dl>`
}
export function cartBody(req, base, errors = [], values = {}) {
  const lines = shelfLines(req)
  if (!lines.length) return `<h1>장바구니</h1><div class="cp-cart-tabs"><span aria-current="true">일반구매 (0)</span><span>정기배송 (0)</span></div>${errorsHTML(errors)}<div class="cp-empty cp-cart-empty"><div class="cp-empty-icon" aria-hidden="true">🛒</div><h2>장바구니에 담은 상품이 없습니다.</h2><p>원하는 상품을 장바구니에 담아보세요!</p><a class="cp-btn" href="${base}">쇼핑 계속하기</a></div>`
  const items = lines.map(l => line(shelfBySku(l.sku), l.qty)), t = totals(items)
  const groups = [['rocket', '로켓배송 상품', items.filter(i => shelfBySku(i.sku).delivery !== 'seller')], ['seller', '판매자배송 상품', items.filter(i => shelfBySku(i.sku).delivery === 'seller')]].filter(g => g[2].length)
  return `<h1>장바구니</h1><div class="cp-cart-tabs"><span aria-current="true">일반구매 (${lines.length})</span><span>정기배송 (0)</span></div>${errorsHTML(errors)}
<div class="cs-cart">${groups.map(([key, label, gi]) => `<section class="cs-cart-group"><h2>${label}${key === 'rocket' ? ` <small>${won(FREE_SHIPPING)} 이상 구매 시 무료배송</small>` : ' <small>무료배송</small>'}</h2>${gi.map(i => { const p = shelfBySku(i.sku), a = arrival(p); return `<article class="cs-cart-line" data-cart-sku="${p.sku}" data-product-kind="other"><a class="cs-cart-thumb" href="${esc(productHref(base, p))}">${shelfImg(base, p)}</a><div class="cs-cart-info"><a href="${esc(productHref(base, p))}">${esc(p.title)}</a><p class="cs-arrive ${a.cls}">${esc(a.text)}</p><p>${badge(p)} 판매자: ${esc(p.seller)}</p><form method="post" action="${base}/cart/update" class="cs-cart-qty"><input type="hidden" name="sku" value="${p.sku}"><label for="qty_${p.sku}">수량</label><input id="qty_${p.sku}" name="qty" type="number" min="1" max="${MAX_QTY}" value="${esc(values[p.sku] ?? i.qty)}"><button name="action" value="update" class="secondary">변경</button><button name="action" value="remove" class="link-button">삭제</button></form></div><strong class="cs-cart-price">${won(i.qty * i.unit_price)}<small>${won(i.unit_price)} × ${i.qty}</small></strong></article>` }).join('')}</section>`).join('')}
<aside class="cs-cart-summary">${amountBox(t, '총 주문금액')}<a class="cs-order-btn" href="${base}/checkout">구매하기</a><a class="cp-btn-outline" href="${base}">계속 쇼핑하기</a></aside></div>`
}
const field = (name, label, values, type = 'text', ac = '', extra = '') => `<div class="field"><label for="${name}">${label}</label><input id="${name}" name="${name}" type="${type}" value="${esc(values[name])}"${ac ? ` autocomplete="${ac}"` : ''}${extra}></div>`
export const phoneText = v => {
  const d = String(v || '').replace(/\D/g, '')
  if (/^02\d{7,8}$/.test(d)) return d.replace(/^(02)(\d{3,4})(\d{4})$/, '$1-$2-$3')
  if (/^0\d{9,10}$/.test(d)) return d.replace(/^(0\d{2})(\d{3,4})(\d{4})$/, '$1-$2-$3')
  return String(v || '')
}
function checkoutBody(req, base, items, values, errors) {
  req.store.shelfCheckout ||= {}
  req.store.shelfCheckout.token ||= randomUUID()
  const t = totals(items), user = req.store.user
  const shipments = [...new Map(items.map(i => [arrival(shelfBySku(i.sku)).text, []])).keys()].map(when => ({ when, lines: items.filter(i => arrival(shelfBySku(i.sku)).text === when) }))
  const buyer = `<section class="panel cp-order-sec"><h2>구매자정보</h2><dl class="cp-order-table"><dt>이름</dt><dd>${esc(user.first_name || user.email.split('@')[0])}</dd><dt>이메일</dt><dd>${esc(user.email)}</dd><dt>휴대폰 번호</dt><dd>${esc(phoneText(user.phone)) || '<span class="hint">등록된 번호가 없습니다.</span>'}</dd></dl></section>`
  const receiver = `<section class="panel cp-order-sec"><h2>받는사람정보</h2>${checkoutAddressLinks(req)}<div class="cp-order-form">${field('recipient', '이름', values, 'text', 'shipping name')}${field('phone', '연락처', values, 'tel', 'shipping tel', ' placeholder="010-0000-0000"')}${field('postcode', '우편번호', values, 'text', 'shipping postal-code', ' inputmode="numeric" maxlength="5"')}${field('city', '시 / 도', values, 'text', 'shipping address-level1')}${field('address', '도로명 주소', values, 'text', 'shipping address-line1')}${field('address_detail', '상세주소', values, 'text', 'shipping address-line2')}${field('delivery_note', '배송 요청사항', values, 'text', '', ' placeholder="예: 문 앞에 놓아주세요"')}</div></section>`
  const shipping = shipments.map((g, n) => `<section class="panel cp-order-sec cp-ship-sec"><h2>배송 ${shipments.length}건 중 ${n + 1}</h2><p class="cp-ship-when">${esc(g.when)}</p>${g.lines.map(i => { const p = shelfBySku(i.sku); return `<article class="checkout-item cp-order-line" data-product-kind="other"><span class="checkout-photo">${shelfImg(base, p, '', 0, false)}</span><div><strong>${esc(i.title)}</strong><p>수량 ${i.qty}개 · ${p.delivery === 'seller' || t.shipping === 0 ? '무료배송' : '배송비 별도'}</p></div><b>${won(i.qty * i.unit_price)}</b></article>` }).join('')}</section>`).join('')
  const payment = `<section class="panel cp-order-sec"><h2>결제정보</h2><dl class="cp-order-table"><dt>총상품가격</dt><dd>${won(t.subtotal)}</dd><dt>할인쿠폰</dt><dd>0원 <span class="hint">적용 가능한 할인쿠폰이 없습니다.</span></dd><dt>배송비</dt><dd>${t.shipping ? won(t.shipping) : '0원'}</dd><dt>총결제금액</dt><dd><strong class="cp-pay-total">${won(t.total)}</strong></dd><dt>결제방법</dt><dd><input type="hidden" name="payment_method" value="card"><div class="cp-pay-methods"><span class="cp-pay-method is-on">신용/체크카드</span></div><p class="hint">할부기간: 일시불</p></dd></dl>${publicNotice('<p class="hint">모의 카드 결제입니다. 실제 카드사 인증이나 청구는 진행되지 않습니다.</p>')}<div class="cp-order-form cp-card-form">${field('card_name', '카드 명의자', values, 'text', 'cc-name')}${field('card_number', '카드번호', {}, 'text', 'cc-number', ' inputmode="numeric" placeholder="카드번호 16자리"')}${field('card_expiry', '유효기간', values, 'text', 'cc-exp', ' placeholder="MM/YY"')}${field('card_cvv', '보안코드(CVC)', {}, 'password', 'cc-csc', ' inputmode="numeric" maxlength="4" placeholder="카드 뒷면 3자리"')}</div></section>`
  const agree = `<section class="cp-order-agree"><label class="check" for="agree"><input id="agree" type="checkbox" name="agree" value="yes"${values.agree === 'yes' ? ' checked' : ''}> 주문 내용을 확인하였으며, 구매에 동의합니다.</label><p class="hint">구매조건 확인 및 결제대행 서비스 약관 동의 · 개인정보 제3자 제공 동의</p><button class="wide cp-pay-btn">${won(t.total)} 결제하기</button></section>`
  return `<h1>주문/결제</h1>${req.store.buyNow ? '<p class="notice">바로구매 · 선택한 상품만 주문합니다.</p>' : ''}${errorsHTML(errors)}<div class="checkout"><form action="${base}/checkout/order" method="post"><input type="hidden" name="checkout_token" value="${req.store.shelfCheckout.token}">${buyer}${receiver}${shipping}${payment}${agree}</form><aside class="summary"><h2>최종 결제금액</h2>${amountBox(t, '총 결제금액')}<p>부가세 포함 · 로켓배송 ${won(FREE_SHIPPING)} 이상 무료배송</p></aside></div>`
}
const DETAILS = ['recipient', 'phone', 'postcode', 'address', 'address_detail', 'city', 'delivery_note', 'card_name', 'card_expiry', 'agree', 'payment_method']

export function installShelf(router, { render, chromeRender }) {
  const base = res => res.locals.base || '/coupang'
  const page = chromeRender || render
  router.get('/image/vp/:id/:view.svg', (req, res, next) => {
    const p = shelfById(req.params.id), view = Number(req.params.view)
    if (!p || !/^[0-9]$/.test(req.params.view) || view >= SHELF_VIEWS) return res.status(404).type('text').send('Not found')
    res.set('Cache-Control', 'public, max-age=3600').type('image/svg+xml').send(shelfArt(p, view))
  })
  router.get('/vp/products/:id', (req, res, next) => {
    const p = shelfById(req.params.id)
    if (!p) return next()
    rememberViewed(req, p.id)
    page(req, res, p.title, productBody(base(res), p, req.query))
  })
  router.post('/cart/add', (req, res, next) => {
    const p = shelfBySku(text(req.body?.sku))
    // Unknown SKUs (including GTA fixture SKUs) reach the shared read-only guard.
    if (!p || foreignLines(req)) return next()
    if (text(req.body.product_id) && text(req.body.product_id) !== p.id) return next()
    const qty = validQty(req.body.qty ?? '1')
    const existing = req.store.cart.find(l => l.sku === p.sku)
    const buy = req.body.intent === 'buy'
    if (!qty || (!buy && qty + (existing?.qty || 0) > MAX_QTY)) return page(req, res, p.title, productBody(base(res), p, req.query, [`상품별 수량은 1개부터 최대 ${MAX_QTY}개까지 선택할 수 있습니다.`]), 400)
    if (buy) req.store.buyNow = line(p, qty)
    else {
      if (existing) existing.qty += qty
      else req.store.cart.push(line(p, qty))
      delete req.store.buyNow
    }
    delete req.store.shelfCheckout
    res.redirect(buy ? `${base(res)}/checkout` : `${base(res)}${p.path}&added=1`)
  })
  router.get(['/cart', '/cartView.pang'], (req, res) => { delete req.store.buyNow; page(req, res, '장바구니', cartBody(req, base(res))) })
  router.post('/cart/update', (req, res, next) => {
    if (foreignLines(req)) return next()
    const l = req.store.cart.find(x => x.sku === text(req.body?.sku))
    if (!l) return next()
    if (req.body.action === 'remove') req.store.cart = req.store.cart.filter(x => x !== l)
    else if (req.body.action === 'update') {
      const qty = validQty(req.body.qty)
      if (!qty) return page(req, res, '장바구니', cartBody(req, base(res), [`수량은 1개부터 ${MAX_QTY}개까지 입력해 주세요.`], { [l.sku]: text(req.body.qty) }), 400)
      l.qty = qty
    } else return page(req, res, '장바구니', cartBody(req, base(res), ['선택한 작업을 확인해 주세요.']), 400)
    delete req.store.shelfCheckout
    res.redirect(`${base(res)}/cart`)
  })
  const shelfOnly = (req, res, next) => foreignLines(req) ? next('route') : (req.store.buyNow || shelfLines(req).length) ? next() : res.redirect(`${base(res)}/cart`)
  router.get('/checkout', shelfOnly, needsMember, (req, res) => {
    const values = { ...checkoutAddressValues(req), ...(text(req.query.address) ? {} : req.store.shelfCheckout?.details || {}) }
    page(req, res, '주문/결제', checkoutBody(req, base(res), purchaseLines(req), values, []))
  })
  router.post('/checkout/order', (req, res, next) => {
    const done = req.store.shelfCompleted
    if (done && customerOrder(req, done.number) && text(req.body?.checkout_token) === done.token) return res.redirect(`${base(res)}/confirmation/${done.number}`)
    next()
  }, shelfOnly, needsMember, (req, res) => {
    const values = Object.fromEntries(DETAILS.map(k => [k, text(req.body[k])]))
    const items = purchaseLines(req), errors = []
    req.store.shelfCheckout ||= {}
    if (text(req.body.checkout_token) && text(req.body.checkout_token) !== req.store.shelfCheckout.token) errors.push('주문 화면이 변경되었습니다. 현재 상품을 확인하고 다시 결제해 주세요.')
    if (!values.recipient) errors.push('받는 사람 이름을 입력해 주세요.')
    const phone = values.phone.replace(/[\s()-]/g, '').replace(/^\+82/, '0')
    if (!/^0(?:10\d{8}|1[16789]\d{7,8}|2\d{7,8}|[3-6]\d\d{7,8}|70\d{8})$/.test(phone)) errors.push('올바른 대한민국 연락처를 입력해 주세요. 예: 010-1234-5678')
    if (!/^\d{5}$/.test(values.postcode)) errors.push('우편번호를 숫자 5자리로 입력해 주세요.')
    if (!values.city || !values.address) errors.push('시 / 도와 도로명 주소를 입력해 주세요.')
    if (!values.card_name) errors.push('카드 명의자를 입력해 주세요.')
    const card = validateCard({ number: text(req.body.card_number), expiry: values.card_expiry, cvv: text(req.body.card_cvv) })
    if (!card.ok) errors.push('카드번호, 유효기간 및 보안코드를 확인해 주세요.')
    if (values.agree !== 'yes') errors.push('주문 내용에 동의해 주세요.')
    req.store.shelfCheckout.details = { ...values, agree: '' }
    if (errors.length) return page(req, res, '주문/결제', checkoutBody(req, base(res), items, values, errors), 400)
    const address = { line1: values.address, line2: values.address_detail, city: values.city, state: values.city, postal_code: values.postcode, country: 'KR' }
    const order = recordOrder({ store: 'coupang', order_number: `1${randomInt(0, 10000000000000).toString().padStart(13, '0')}`, session: req.session, items,
      customer: { email: req.store.user.email, first_name: values.recipient, last_name: '', phone, account_id: req.store.user.id },
      fulfillment: { method: 'ship', option: items.some(i => shelfBySku(i.sku).delivery === 'seller') ? 'seller_delivery' : 'rocket', eta: [...new Set(items.map(i => arrival(shelfBySku(i.sku)).text))].join(' / ') },
      shipping_address: address, billing_address: address, payment: { method: 'card', brand: card.brand, last4: card.last4, name_on_card: values.card_name },
      totals: totals(items), currency: 'KRW', meta: { catalog: 'coupang-shelf', delivery_note: values.delivery_note, tax_included: true, recipient_name: values.recipient } })
    req.store.shelfCompleted = { number: order.order_number, token: req.store.shelfCheckout.token }
    if (!req.store.buyNow) { const bought = new Set(items.map(i => i.sku)); req.store.cart = req.store.cart.filter(l => !bought.has(l.sku)) }
    delete req.store.buyNow
    delete req.store.shelfCheckout
    res.redirect(`${base(res)}/confirmation/${order.order_number}`)
  })
  router.get('/confirmation/:number', (req, res, next) => {
    const order = customerOrder(req, req.params.number)
    if (!order) return next()
    const a = order.shipping_address, paid = new Date(order.created_at || Date.now())
    const when = new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).format(paid)
    page(req, res, '주문완료', `<section class="success cp-done"><h1>주문이 완료되었습니다.</h1><p class="cp-done-eta">${esc(order.fulfillment.eta)}</p><p>주문번호 <strong>${esc(order.order_number)}</strong> · 주문일시 ${esc(when)}</p><p class="hint">주문 내역은 ${esc(order.customer.email)} 계정의 마이쿠팡 주문목록에서 확인할 수 있습니다.</p></section><div class="checkout"><section class="panel cp-order-sec"><h2>받는사람 정보</h2><dl class="cp-order-table"><dt>받는사람</dt><dd>${esc(order.customer.first_name)}</dd><dt>연락처</dt><dd>${esc(phoneText(order.customer.phone))}</dd><dt>받는주소</dt><dd>(${esc(a.postal_code)}) ${esc(a.city)} ${esc(a.line1)} ${esc(a.line2 || '')}</dd><dt>배송 요청사항</dt><dd>${esc(order.meta?.delivery_note || '없음')}</dd></dl><h2>결제 정보</h2><dl class="cp-order-table"><dt>결제수단</dt><dd>신용/체크카드 · ${esc(order.payment.brand)} · 끝 4자리 ${esc(order.payment.last4)} · 일시불</dd><dt>총상품가격</dt><dd>${won(order.totals.subtotal)}</dd><dt>배송비</dt><dd>${order.totals.shipping ? won(order.totals.shipping) : '0원'}</dd><dt>결제금액</dt><dd><strong class="cp-pay-total">${won(order.totals.total)}</strong></dd></dl></section><aside class="summary"><h2>주문상품</h2>${order.items.map(i => { const p = shelfBySku(i.sku); return `<article class="checkout-item cp-order-line" data-product-kind="other">${p ? `<span class="checkout-photo">${shelfImg(base(res), p, '', 0, false)}</span>` : ''}<div><strong>${esc(i.title)}</strong><p>${i.qty}개 · ${won(i.qty * i.unit_price)}</p></div></article>` }).join('')}</aside></div><div class="actions cp-done-actions"><a class="button" href="${base(res)}/account/orders/${order.order_number}">주문 상세 / 배송조회</a><a class="cp-btn-outline" href="${base(res)}/account/orders">주문목록</a><a class="cp-btn-outline" href="${base(res)}">쇼핑 계속하기</a></div>`)
  })
}
export { inDept }
