// Coupang shelf pages for the default reference catalog: product cards, the
// filterable result grid, product detail, cart, checkout and confirmation.
// Only shelf items (shelf.js) can be bought here, always as `kind: 'other'` order
// lines. Anything else (stale GTA fixture lines, unknown SKUs) falls through to the
// shared read-only guard in reference-retail.js, which answers 409.
import { randomInt, randomUUID } from 'node:crypto'
import { esc, money } from '../../lib/html.js'
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
function reviewSummary(p) {
  const weights = p.rating >= 5 ? [78, 15, 4, 2, 1] : p.rating >= 4.5 ? [64, 24, 7, 3, 2] : [48, 30, 12, 6, 4]
  return `<div class="cs-review-summary"><div class="cs-review-score"><strong>${p.rating.toFixed(1)}</strong>${stars(p.rating)}<p>${p.reviews.toLocaleString('ko-KR')}개 상품평</p></div><dl>${weights.map((w, i) => `<dt>${['최고', '좋음', '보통', '별로', '나쁨'][i]}</dt><dd><meter min="0" max="100" value="${w}">${w}%</meter> ${w}%</dd>`).join('')}</dl></div><p class="hint">상품평 분포는 표시용 요약입니다. 개별 상품평 본문은 이 모의 환경에 포함되어 있지 않습니다.</p>`
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
<p class="hint">모의 쇼핑 환경의 예시 상품입니다. 가격·재고·도착 예정일은 실제 쿠팡과 다를 수 있습니다.</p></section></div>
<nav class="cs-tabs" aria-label="상품 정보"><a href="#cs-detail">상품상세</a><a href="#cs-reviews">상품평 (${p.reviews.toLocaleString('ko-KR')})</a><a href="#cs-qna">상품문의</a><a href="#cs-policy">배송/교환/반품 안내</a></nav>
<section id="cs-detail" class="cs-section"><h2>상품상세</h2><div class="cs-detail-art">${shelfImg(base, p, '', 2)}</div><h3>필수 표기정보</h3><dl class="spec-table">${Object.entries(specs(p)).map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl></section>
<section id="cs-reviews" class="cs-section"><h2>상품평</h2>${reviewSummary(p)}</section>
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
const field = (name, label, values, type = 'text', ac = '') => `<div class="field"><label for="${name}">${label}</label><input id="${name}" name="${name}" type="${type}" value="${esc(values[name])}"${ac ? ` autocomplete="${ac}"` : ''}></div>`
function checkoutBody(req, base, items, values, errors) {
  req.store.shelfCheckout ||= {}
  req.store.shelfCheckout.token ||= randomUUID()
  const t = totals(items)
  return `<h1>주문/결제</h1>${req.store.buyNow ? '<p class="notice">바로구매 · 선택한 상품만 주문합니다.</p>' : ''}${errorsHTML(errors)}<div class="checkout"><form action="${base}/checkout/order" method="post"><input type="hidden" name="checkout_token" value="${req.store.shelfCheckout.token}"><section class="panel"><h2>구매자정보</h2><p>${esc(req.store.user.email)}</p></section><section class="panel"><h2>받는사람정보</h2>${checkoutAddressLinks(req)}${field('recipient', '받는 사람', values, 'text', 'shipping name')}${field('phone', '휴대폰 번호 / 연락처', values, 'tel', 'shipping tel')}${field('postcode', '우편번호 (5자리)', values, 'text', 'shipping postal-code')}${field('city', '시 / 도', values, 'text', 'shipping address-level1')}${field('address', '도로명 주소', values, 'text', 'shipping address-line1')}${field('address_detail', '상세주소 (선택)', values, 'text', 'shipping address-line2')}${field('delivery_note', '배송 요청사항 (선택)', values)}</section><section class="panel"><h2>배송 상품 (${items.length})</h2>${items.map(i => { const p = shelfBySku(i.sku); return `<article class="checkout-item" data-product-kind="other"><div><strong>${esc(i.title)}</strong><p>${i.qty}개 · ${esc(arrival(p).text)}</p></div><b>${won(i.qty * i.unit_price)}</b></article>` }).join('')}</section><section class="panel"><h2>결제수단</h2><p>신용 / 체크카드 · 일시불</p><input type="hidden" name="payment_method" value="card"><p class="hint">모의 카드 결제입니다. 실제 카드사 인증이나 청구는 진행되지 않습니다.</p>${field('card_name', '카드 명의자', values, 'text', 'cc-name')}${field('card_number', '카드번호', {}, 'text', 'cc-number')}${field('card_expiry', '유효기간 (MM/YY)', values, 'text', 'cc-exp')}${field('card_cvv', '보안코드 (CVV)', {}, 'password', 'cc-csc')}</section><section class="panel"><label class="check" for="agree"><input id="agree" type="checkbox" name="agree" value="yes"${values.agree === 'yes' ? ' checked' : ''}> 주문 내용을 확인하였으며, 구매에 동의합니다.</label><button class="wide">${won(t.total)} 결제하기</button></section></form><aside class="summary"><h2>결제 상세</h2>${amountBox(t, '총 결제금액')}<p>부가세 포함</p></aside></div>`
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
    page(req, res, '주문완료', `<section class="success"><h1>주문이 완료되었습니다.</h1><p>주문번호: <strong>${esc(order.order_number)}</strong></p><p>${esc(order.customer.email)}</p></section><div class="checkout"><section class="panel"><h2>배송 정보</h2><p>${esc(order.customer.first_name)} · ${esc(order.customer.phone)}</p><p>(${esc(order.shipping_address.postal_code)}) ${esc(order.shipping_address.city)} ${esc(order.shipping_address.line1)} ${esc(order.shipping_address.line2 || '')}</p><p>${esc(order.fulfillment.eta)}</p><h2>결제 정보</h2><p>${esc(order.payment.brand)} · 끝 4자리 ${esc(order.payment.last4)}</p><p>결제금액: <strong>${won(order.totals.total)}</strong></p></section><aside class="summary"><h2>주문상품</h2>${order.items.map(i => `<p data-product-kind="other">${esc(i.title)} · ${i.qty}개 · ${won(i.qty * i.unit_price)}</p>`).join('')}</aside></div><div class="actions"><a class="button" href="${base(res)}/account/orders/${order.order_number}">주문 상세 / 배송조회</a><a href="${base(res)}/account/orders">주문목록</a><a href="${base(res)}">쇼핑 계속하기</a></div>`)
  })
}
export { inDept }
