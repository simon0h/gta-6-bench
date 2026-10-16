// Reference-mode rendering and purchase flow for the Gmarket shelf (stores/gmarket/shelf.js).
// Shelf items are ordinary merchandise recorded as `kind: 'other'` order lines. The evidenced
// GTA 6 observations (reference.js) are never added to this cart: their goodscodes are not
// shelf codes, so every purchase POST for them falls through to the adapter's 409 guard.
import { randomInt } from 'node:crypto'
import { esc, money } from '../../lib/html.js'
import { renderProductAsset } from '../../lib/product-asset-art.js'
import { recordOrder, getOrder } from '../../lib/orders.js'
import { validateCard } from '../../lib/payment.js'
import { shelf, shelfByCode, best, brandsOf } from './shelf.js'
import { departments, departmentByCode } from './site-data.js'

const won = n => money(n, 'KRW')
const digits = n => won(n).replace('원', '')
const str = v => typeof v === 'string' ? v.trim() : ''
export const sortLabels = ['G마켓 랭크순', '판매인기순', '낮은가격순', '높은가격순', '상품평 많은순', '신규상품순']
const PAGE = 40

// --- art -------------------------------------------------------------------
// Locally rendered product illustrations (no external images). The hint picks a
// category-appropriate drawing; games and consoles use the platform renderer. Drinks and
// milk are drawn as bottles rather than the generic food pouch.
const artTitle = { loafers: 'leather shoes', toothpaste: 'compact powder', brushes: 'tooth brush set', vitamin: 'vitamin bottle', 'lego set': 'building blocks toy', drill: '드릴', appliance: 'kettle', 'coffee machine': 'espresso machine', desktop: 'mini pc', media: 'vinyl record', tire: '공구 세트', pens: 'eyeliner pencil', 'cushion compact': 'blush', 'hair dryer': 'hair dryer', 'bottled water': 'water bottle', beverages: 'soda bottle', milk: 'plastic bottle' }
const artCache = new Map()
export function shelfArt(p, view = 0) {
  const key = `${p.code}:${view}`
  if (artCache.has(key)) return artCache.get(key)
  const g = p.game
  const hint = artTitle[p.art] || p.art
  const descriptor = g && (g.type === 'game' || g.type === 'console')
    ? { type: g.type, platform: g.platform, title: g.name || p.title, raw: { title: g.name || p.title, catalogType: g.type, platform: g.platform }, assetKey: `gmarket-shelf-${p.code}` }
    : { title: hint, raw: { title: hint, type: p.art === 'pantry' ? p.art : p.art === 'hair dryer' ? 'hair dryer' : undefined, category: p.art === 'hair dryer' ? 'Beauty' : undefined }, assetKey: `gmarket-shelf-${p.code}` }
  // Drop the English view caption; the page labels views in Korean.
  const svg = renderProductAsset(descriptor, view).replace(/<text[^>]*>(?:Product view|Reverse or interior view|Construction and material detail|Component and alternate views|Cover artwork|Rear packaging and illustrated scenes|Illustrated game world|Case and media)<\/text>/g, '')
  if (artCache.size > 600) artCache.delete(artCache.keys().next().value)
  artCache.set(key, svg)
  return svg
}
const img = (base, p, view = 0, cls = '') => `<img class="gm-shelf-img ${cls}" src="${base}/shelf-art/${p.code}/${view}.svg" alt="${esc(p.title)}" width="300" height="300" decoding="async">`

// --- delivery copy ---------------------------------------------------------
const DAYS = ['일', '월', '화', '수', '목', '금', '토']
function arrival(offset) {
  const d = new Date(Date.now() + 9 * 3600e3 + offset * 864e5)
  return `${d.getUTCMonth() + 1}/${d.getUTCDate()}(${DAYS[d.getUTCDay()]})`
}
const shipFee = p => p.free ? 0 : 3000
const deliveryLine = p => p.star ? `<span class="gm-star-badge">스타배송</span> 내일(${arrival(1).replace(/^.*\(/, '').replace(')', '')}) 도착보장` : `${p.free ? '무료배송' : '배송비 3,000원'}${p.today ? ' · 오늘출발' : ''}`

// --- cards -----------------------------------------------------------------
export function shelfCard(base, p, { rank } = {}) {
  return `<article class="gm-card gm-shelf-card" data-shelf-product="${p.code}" data-product-kind="other"><a href="${base}${p.path}"><div class="gm-card-img">${rank ? `<span class="gm-rank">${rank}</span>` : ''}${img(base, p)}</div><h3>${esc(p.title)}</h3></a>
<p class="gm-price-line">${p.discount ? `<em class="gm-rate">${p.discount}%</em>` : ''}<strong>${digits(p.price)}</strong>원${p.discount ? ` <del>${won(p.list)}</del>` : ''}</p>
<p class="gm-delivery">${deliveryLine(p)}</p>${p.reviews ? `<p class="gm-score"><span class="gm-stars" aria-hidden="true">★</span> 만족도 ${p.sat}% · 상품평 ${p.reviews.toLocaleString('en-US')}${p.sold ? ` · 구매 ${p.sold.toLocaleString('en-US')}` : ''}</p>` : p.sold ? `<p class="gm-score">구매 ${p.sold.toLocaleString('en-US')}</p>` : ''}</article>`
}
export const shelfRow = (base, list, opts = {}) => `<div class="gm-cards gm-shelf-row${opts.scroll ? ' scroll' : ''}">${list.map((p, i) => opts.observed && p.purchase === 'unverified' ? opts.observed(p) : shelfCard(base, p, { rank: opts.ranked ? i + 1 : 0 })).join('')}</div>`

// Round-robin across departments so the 전체 best list reads like the real mix.
export function mixedBest(list = shelf, limit = 100, key = p => p.dept) {
  const groups = new Map()
  for (const p of best(list)) { const k = key(p); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(p) }
  const byDept = [...groups.values()]
  const out = []
  for (let i = 0; out.length < limit && byDept.some(l => l[i]); i++) for (const l of byDept) if (l[i] && out.length < limit) out.push(l[i])
  return out
}

// --- listing (department, search, collections) ------------------------------
export function filterSort(list, q, { observations = [] } = {}) {
  const sort = sortLabels.includes(q.sort) ? q.sort : sortLabels[0]
  const min = Number(str(q.minPrice).replace(/[^\d]/g, '')) || 0, max = Number(str(q.maxPrice).replace(/[^\d]/g, '')) || 0
  const brand = str(q.brand), sat = Number(q.sat) || 0
  const keep = p => (!min || p.price >= min) && (!max || p.price <= max)
  let items = list.filter(p => keep(p) && (!brand || p.brand === brand) && (q.star !== '1' || p.star) && (q.free !== '1' || p.free) && (q.today !== '1' || p.today) && (!sat || (p.sat || 0) >= sat))
  const narrowed = brand || q.star === '1' || q.free === '1' || q.today === '1' || sat
  const obs = narrowed ? [] : observations.filter(keep)
  const by = {
    'G마켓 랭크순': null, '판매인기순': (a, b) => b.sold - a.sold, '낮은가격순': (a, b) => a.price - b.price,
    '높은가격순': (a, b) => b.price - a.price, '상품평 많은순': (a, b) => b.reviews - a.reviews, '신규상품순': (a, b) => Number(b.code) - Number(a.code),
  }[sort]
  if (by) items = [...items].sort(by)
  if (obs.length) {
    if (sort === '낮은가격순' || sort === '높은가격순') items = [...items, ...obs].sort(by)
    else items = [...items.slice(0, q.obsAt ?? 4), ...obs, ...items.slice(q.obsAt ?? 4)]
  }
  return { items, sort }
}

const qs = (params, patch = {}) => {
  const all = { ...params, ...patch }
  const s = new URLSearchParams(Object.entries(all).filter(([, v]) => v !== undefined && v !== '' && v !== null && v !== 0).map(([k, v]) => [k, String(v)])).toString()
  return s ? `?${s.replace(/&/g, '&amp;')}` : ''
}

// One results component shared by category, search, best and collection pages.
export function resultsBlock(base, { path, params, list, observations = [], query, observedCard, title, emptyText }) {
  const { items, sort } = filterSort(list, query, { observations })
  const pages = Math.max(1, Math.ceil(items.length / PAGE)), page = Math.min(pages, Math.max(1, Number.parseInt(query.page, 10) || 1))
  const shown = items.slice((page - 1) * PAGE, page * PAGE)
  const keepParams = { ...params, sort: query.sort, brand: str(query.brand), minPrice: str(query.minPrice), maxPrice: str(query.maxPrice), star: query.star === '1' ? '1' : '', free: query.free === '1' ? '1' : '', today: query.today === '1' ? '1' : '', sat: str(query.sat) }
  const brands = brandsOf(list)
  const hidden = Object.entries(params).map(([k, v]) => `<input type="hidden" name="${esc(k)}" value="${esc(v)}">`).join('') + (query.sort ? `<input type="hidden" name="sort" value="${esc(query.sort)}">` : '')
  const filters = `<aside class="gm-filters" aria-label="상세검색"><p class="gm-side-title">상세검색</p><form method="get" action="${base}${path}">${hidden}
<fieldset><legend>배송/혜택</legend><label><input type="checkbox" name="star" value="1"${query.star === '1' ? ' checked' : ''}> 스타배송</label><label><input type="checkbox" name="free" value="1"${query.free === '1' ? ' checked' : ''}> 무료배송</label><label><input type="checkbox" name="today" value="1"${query.today === '1' ? ' checked' : ''}> 오늘출발</label></fieldset>
${brands.length ? `<fieldset class="gm-brand-filter"><legend>브랜드</legend><label><input type="radio" name="brand" value=""${!str(query.brand) ? ' checked' : ''}> 전체</label>${brands.slice(0, 14).map(b => `<label><input type="radio" name="brand" value="${esc(b)}"${str(query.brand) === b ? ' checked' : ''}> ${esc(b)} <small>(${list.filter(p => p.brand === b).length})</small></label>`).join('')}</fieldset>` : ''}
<fieldset><legend>가격</legend><div class="gm-range"><label class="sr-only" for="minp">최저가</label><input id="minp" name="minPrice" inputmode="numeric" placeholder="최저가" value="${esc(str(query.minPrice))}"><span>~</span><label class="sr-only" for="maxp">최고가</label><input id="maxp" name="maxPrice" inputmode="numeric" placeholder="최고가" value="${esc(str(query.maxPrice))}"></div></fieldset>
<fieldset><legend>만족도</legend>${[['', '전체'], ['95', '95% 이상'], ['90', '90% 이상']].map(([v, l]) => `<label><input type="radio" name="sat" value="${v}"${str(query.sat) === v ? ' checked' : ''}> ${l}</label>`).join('')}</fieldset>
<button class="gm-btn small">적용</button> <a class="gm-reset" href="${base}${path}${qs(params)}">초기화</a></form></aside>`
  const sortNav = `<nav aria-label="정렬">${sortLabels.map(s => `<a href="${base}${path}${qs(keepParams, { sort: s === sortLabels[0] ? '' : s, page: '' })}"${s === sort ? ' aria-current="true"' : ''}>${s}</a>`).join('')}</nav>`
  const pager = pages > 1 ? `<nav class="gm-pager" aria-label="페이지">${page > 1 ? `<a href="${base}${path}${qs(keepParams, { page: page - 1 })}" rel="prev">‹ 이전</a>` : ''}${Array.from({ length: pages }, (_, i) => i + 1).map(n => n === page ? `<strong aria-current="page">${n}</strong>` : `<a href="${base}${path}${qs(keepParams, { page: n })}">${n}</a>`).join('')}${page < pages ? `<a href="${base}${path}${qs(keepParams, { page: page + 1 })}" rel="next">다음 ›</a>` : ''}</nav>` : ''
  const cards = shown.map(p => p.purchase === 'unverified' ? observedCard(p) : shelfCard(base, p)).join('')
  return `<div class="gm-list-layout">${filters}<section class="gm-results" data-result-count="${items.length}">${title || ''}<div class="gm-sortbar"><p>상품 <strong>${items.length.toLocaleString('en-US')}</strong>개</p>${sortNav}</div>
${items.length ? `<div class="gm-cards">${cards}</div>${pager}` : `<div class="gm-noresult"><p class="gm-pending-icon" aria-hidden="true">🔍</p><p><strong>${esc(emptyText || '조건에 맞는 상품이 없습니다.')}</strong></p><p class="gm-muted">필터를 변경하거나 다른 검색어를 입력해 보세요.</p></div>`}</section></div>`
}

// --- search ----------------------------------------------------------------
const compact = s => String(s).toLowerCase().normalize('NFKC').replace(/[\s()\[\]/|·,._:-]+/g, '')
const deptNames = Object.fromEntries(departments.map(d => [d.code, `${d.name} ${d.subs.join(' ')}`]))
export const isGtaQuery = q => /gta|grand\s*theft|그랜드\s*테프트|그랜드\s*세프트|지티에이/i.test(q)
export function searchShelf(query, observations = []) {
  const q = compact(query), tokens = String(query).toLowerCase().normalize('NFKC').split(/\s+/).map(compact).filter(Boolean)
  if (!q) return []
  const score = p => {
    const title = compact(p.title), brand = compact(p.brand || ''), cat = compact(p.dept ? `${deptNames[p.dept]} ${departmentByCode(p.dept).subs[p.sub - 1] || ''}` : '게임 디지털/가전')
    let s = 0
    if (title.includes(q)) s += 100
    if (brand && (brand === q || q.includes(brand))) s += 60
    let all = true
    for (const t of tokens) {
      if (title.includes(t)) s += 20; else if (brand.includes(t)) s += 15; else if (cat.includes(t)) s += 4; else all = false
    }
    if (!all && s < 100) return 0
    return s
  }
  const gta = isGtaQuery(query)
  const hits = [
    ...observations.map(p => ({ p, s: score(p) + (gta ? 1000 : 0) })),
    ...shelf.map(p => ({ p, s: score(p) })),
  ].filter(h => h.s > 0)
  const rank = new Map(best().map((p, i) => [p.code, i]))
  return hits.sort((a, b) => b.s - a.s || (rank.get(a.p.code) ?? -1) - (rank.get(b.p.code) ?? -1)).map(h => h.p)
}

// --- product detail ----------------------------------------------------------
const viewLabels = ['상품 전체', '다른 각도', '확대 보기', '추가 이미지']
export function shelfProduct(base, p, { view = 0, values = {}, messages = [] } = {}) {
  const d = departmentByCode(p.dept), sub = d.subs[p.sub - 1]
  const related = best(shelf.filter(x => x.dept === p.dept && x.sub === p.sub && x.code !== p.code)).slice(0, 5)
  const v = Math.min(3, Math.max(0, view))
  const bars = p.reviews ? [5, 4, 3, 2, 1].map((star, i) => { const pct = [p.sat - 8, 10, 4, 2, 1][i]; return [star, Math.max(1, Math.min(96, pct))] }) : []
  const opt = p.options
  return `<nav class="gm-crumbs" aria-label="현재 위치"><a href="${base}/">홈</a> <span>›</span> <a href="${base}/n/list?category=${d.code}">${esc(d.name)}</a> <span>›</span> <a href="${base}/n/list?category=${d.code}&amp;sub=${p.sub}">${esc(sub)}</a></nav>
<section class="gm-item" data-shelf-item="${p.code}" data-product-kind="other"><div class="gm-item-art"><div class="gm-gallery-main">${img(base, p, v, 'main')}</div><p class="gm-muted gm-gallery-cap">${viewLabels[v]} · ${v + 1} / 4</p><div class="gm-gallery-thumbs">${[0, 1, 2, 3].map(i => `<a href="${base}${p.path}&amp;view=${i}"${i === v ? ' aria-current="true"' : ''} aria-label="${viewLabels[i]}">${img(base, p, i)}</a>`).join('')}</div></div>
<div class="gm-item-info"><p class="gm-seller-line"><a href="${base}/n/search?keyword=${encodeURIComponent(p.brand || p.seller)}">${esc(p.seller)}</a></p><h1>${esc(p.title)}</h1>
${p.reviews ? `<p class="gm-score big"><span class="gm-stars" aria-hidden="true">★★★★★</span> 만족도 <strong>${p.sat}%</strong> · <a href="#review">상품평 ${p.reviews.toLocaleString('en-US')}건</a>${p.sold ? ` · 구매 ${p.sold.toLocaleString('en-US')}건` : ''}</p>` : p.sold ? `<p class="gm-score big">구매 ${p.sold.toLocaleString('en-US')}건</p>` : ''}
<div class="gm-price-box">${p.discount ? `<p class="gm-list-price"><del>${won(p.list)}</del></p>` : ''}<p class="gm-price big">${p.discount ? `<em class="gm-rate">${p.discount}%</em> ` : ''}<strong>${digits(p.price)}</strong>원</p><p class="gm-muted">스마일캐시 최대 ${digits(Math.floor(p.price * 0.01))}원 적립 · 카드 무이자 할부 가능</p></div>
<dl class="gm-dl gm-ship"><dt>배송</dt><dd>${p.star ? `<span class="gm-star-badge">스타배송</span> <strong>내일 ${arrival(1)} 도착보장</strong><br><span class="gm-muted">오늘 20시 전 주문 시 · 꼭 멤버십 무료반품</span>` : `${p.free ? '무료배송' : '배송비 3,000원'} · 택배<br><span class="gm-muted">${p.today ? '오늘출발 · ' : ''}${p.preorder ? '예약판매 상품은 출시일에 맞춰 순차 발송됩니다.' : `${arrival(2)}~${arrival(3)} 도착 예정`}</span>`}</dd><dt>판매자</dt><dd>${esc(p.seller)}</dd><dt>상품번호</dt><dd>${p.code}</dd></dl>
${messages.length ? `<div class="gm-alert" role="alert">${messages.map(m => `<p>${esc(m)}</p>`).join('')}</div>` : ''}
<form method="post" action="${base}/cart/add" class="gm-buy"><input type="hidden" name="sku" value="${p.code}">
${opt ? `<label for="opt">${esc(opt[0])} 선택</label><select id="opt" name="option" required><option value="">${esc(opt[0])}을(를) 선택해 주세요</option>${opt[1].map(o => `<option${values.option === o ? ' selected' : ''}>${esc(o)}</option>`).join('')}</select>` : ''}
<label for="qty">수량</label><input id="qty" name="qty" type="number" min="1" max="10" value="${esc(values.qty || '1')}" inputmode="numeric">
<div class="gm-buy-btns"><button class="gm-btn outline" name="action" value="cart">장바구니</button><button class="gm-btn" name="action" value="buy">구매하기</button></div></form></div></section>
<nav class="gm-item-tabs" aria-label="상품 상세"><a href="#info">상품정보</a><a href="#review">상품평 ${p.reviews ? p.reviews.toLocaleString('en-US') : 0}</a><a href="#qna">상품문의</a><a href="#policy">배송/교환/반품 안내</a></nav>
<section class="gm-panel gm-left" id="info"><h2>상품정보</h2><table class="gm-spec"><tbody><tr><th scope="row">상품번호</th><td>${p.code}</td></tr><tr><th scope="row">상품명</th><td>${esc(p.title)}</td></tr>${p.brand ? `<tr><th scope="row">브랜드</th><td>${esc(p.brand)}</td></tr>` : ''}<tr><th scope="row">카테고리</th><td>${esc(d.name)} &gt; ${esc(sub)}</td></tr>${opt ? `<tr><th scope="row">옵션</th><td>${esc(opt[0])}: ${opt[1].map(esc).join(', ')}</td></tr>` : ''}<tr><th scope="row">배송방법</th><td>${p.star ? '스타배송 (도착보장)' : '택배'}</td></tr><tr><th scope="row">배송비</th><td>${p.free ? '무료' : '3,000원'}</td></tr><tr><th scope="row">A/S 안내</th><td>판매자 문의</td></tr></tbody></table><p class="gm-muted">상품정보제공고시 상세 항목(제조자, 원산지, 품질보증기준 등)은 판매자가 등록한 상세설명을 따릅니다.</p></section>
<section class="gm-panel gm-left" id="review"><h2>상품평</h2>${p.reviews ? `<div class="gm-review-sum"><p class="gm-review-score"><strong>${p.sat}%</strong><span>구매자 만족도</span></p><ul class="gm-bars">${bars.map(([s, pct]) => `<li><span>${s}점</span><span class="bar"><i style="width:${pct}%"></i></span><span>${pct}%</span></li>`).join('')}</ul><p class="gm-muted">일반 상품평 ${p.reviews.toLocaleString('en-US')}건</p></div>` : '<p class="gm-muted">아직 작성된 상품평이 없습니다.</p>'}</section>
<section class="gm-panel gm-left" id="qna"><h2>상품문의</h2><p class="gm-muted">상품에 대해 궁금한 점은 판매자에게 문의해 주세요. 문의는 로그인 후 작성할 수 있습니다.</p><a class="gm-btn outline small" href="${base}/help/inquiry">문의하기</a></section>
<section class="gm-panel gm-left" id="policy"><h2>배송/교환/반품 안내</h2><p>${p.star ? '스타배송 상품은 오늘 주문 시 내일 도착을 보장합니다.' : '결제 완료 후 평균 2~3일 이내에 발송됩니다.'} 단순 변심에 의한 반품은 수령 후 7일 이내 신청할 수 있으며 왕복 배송비가 부과될 수 있습니다.</p><p><a href="${base}/help/faq/delivery">배송 자주 묻는 질문</a> · <a href="${base}/help/faq/returns">취소/반품/교환 자주 묻는 질문</a></p></section>
${related.length ? `<section class="gm-home-sec"><div class="gm-sec-head"><h2>이 카테고리 인기 상품</h2><a href="${base}/n/list?category=${d.code}&amp;sub=${p.sub}">더보기 ›</a></div>${shelfRow(base, related)}</section>` : ''}`
}

// --- cart / checkout ----------------------------------------------------------
export const shelfState = req => (req.store.gmShelf ||= { cart: [], buyNow: null })
const lineKey = l => `${l.sku}:${l.option || ''}`
const lineTotal = l => l.unit_price * l.qty
function totalsOf(lines) {
  const subtotal = lines.reduce((s, l) => s + lineTotal(l), 0)
  const shipping = lines.reduce((s, l) => s + l.ship_fee, 0)
  const discount = lines.reduce((s, l) => s + (l.list_price - l.unit_price) * l.qty, 0)
  return { subtotal, shipping, tax: 0, discount: 0, total: subtotal + shipping, list_savings: discount }
}
const lineView = (base, l, controls) => `<li class="gm-line" data-line="${esc(lineKey(l))}"><a href="${base}/Item?goodscode=${l.sku}" class="gm-line-img">${img(base, shelfByCode.get(l.sku))}</a><div class="gm-line-info"><p class="gm-seller">${esc(l.seller)}</p><a href="${base}/Item?goodscode=${l.sku}">${esc(l.title)}</a>${l.option ? `<p class="gm-muted">${esc(l.option_label)}: ${esc(l.option)}</p>` : ''}<p class="gm-muted">${l.ship_fee ? '배송비 3,000원' : '무료배송'}${l.star ? ' · 스타배송' : ''}</p>${controls || `<p class="gm-muted">수량 ${l.qty}개</p>`}</div><p class="gm-line-price"><strong>${won(lineTotal(l))}</strong></p></li>`

export function cartView(base, lines, messages = []) {
  const t = totalsOf(lines), count = lines.reduce((s, l) => s + l.qty, 0)
  const star = lines.filter(l => l.star).length
  return `<div class="gm-cart-head"><h1 class="gm-page-title">장바구니</h1><ol class="gm-steps"><li aria-current="step"><span>01</span>장바구니</li><li><span>02</span>주문/결제</li><li><span>03</span>주문완료</li></ol></div>
<nav class="gm-pill-tabs" aria-label="장바구니 구분"><a href="${base}/cart" aria-current="page">전체 ${lines.length}</a><a href="${base}/cart?type=star">스타배송 ${star}</a><a href="${base}/cart?type=emart">이마트몰 ${lines.filter(l => l.seller === '이마트몰').length}</a></nav>
${messages.length ? `<div class="gm-alert" role="alert">${messages.map(m => `<p>${esc(m)}</p>`).join('')}</div>` : ''}
<div class="gm-cart-grid">${lines.length ? `<section class="gm-panel gm-left"><h2 class="sr-only">담은 상품</h2><ul class="gm-lines">${lines.map(l => lineView(base, l, `<div class="gm-line-ctrl"><form method="post" action="${base}/cart/update"><input type="hidden" name="line" value="${esc(lineKey(l))}"><label class="sr-only" for="q-${esc(lineKey(l))}">수량</label><input id="q-${esc(lineKey(l))}" name="qty" type="number" min="1" max="10" value="${l.qty}" inputmode="numeric"><button class="gm-btn outline small" name="action" value="update">변경</button><button class="gm-linkbtn" name="action" value="remove">삭제</button></form></div>`)).join('')}</ul></section>`
    : `<section class="gm-panel gm-cart-empty"><p class="gm-pending-icon" aria-hidden="true">🛒</p><p><strong>장바구니에 담긴 상품이 없습니다.</strong></p><p class="gm-muted">원하는 상품을 장바구니에 담아보세요.</p><a class="gm-btn outline" href="${base}/">쇼핑 계속하기</a></section>`}
<aside class="gm-panel gm-summary gm-left"><h2>결제 예정 금액</h2><dl><dt>상품금액 (${count}개)</dt><dd>${won(t.subtotal + t.list_savings)}</dd><dt>할인금액</dt><dd class="gm-minus">-${won(t.list_savings)}</dd><dt>배송비</dt><dd>${t.shipping ? `+${won(t.shipping)}` : won(0)}</dd><dt class="total">총 결제금액</dt><dd class="total">${won(t.total)}</dd></dl>${lines.length ? `<a class="gm-btn wide" href="${base}/checkout?mode=cart">주문하기 (${lines.length})</a>` : '<button class="gm-btn wide" disabled>주문하기</button>'}</aside></div>`
}

export function checkoutView(base, { lines, user, values = {}, messages = [] }) {
  const t = totalsOf(lines), f = (id, label, attrs = '') => `<label for="co-${id}">${label}</label><input id="co-${id}" name="${id}" value="${esc(values[id] || '')}" ${attrs}>`
  return `<div class="gm-cart-head"><h1 class="gm-page-title">주문/결제</h1><ol class="gm-steps"><li><span>01</span>장바구니</li><li aria-current="step"><span>02</span>주문/결제</li><li><span>03</span>주문완료</li></ol></div>
${messages.length ? `<div class="gm-alert" role="alert">${messages.map(m => `<p>${esc(m)}</p>`).join('')}</div>` : ''}
<form method="post" action="${base}/checkout" class="gm-cart-grid gm-checkout"><div>
<section class="gm-panel gm-left"><h2>주문자 정보</h2>${user ? `<p><strong>${esc(user.first_name || '')}</strong> ${esc(user.email)}</p>` : `<p class="gm-muted">비회원으로 주문합니다. <a href="${base}/LogIn/LogIn">로그인</a>하면 스마일캐시 적립과 쿠폰을 사용할 수 있습니다.</p>${f('email', '주문자 이메일', 'type="email" autocomplete="email" required')}`}</section>
<section class="gm-panel gm-left"><h2>배송지 정보</h2><div class="gm-form-grid">${f('recipient', '받는 분', 'autocomplete="name" required')}${f('phone', '휴대폰 번호', 'inputmode="tel" autocomplete="tel" placeholder="010-0000-0000" required')}${f('postal_code', '우편번호', 'inputmode="numeric" autocomplete="postal-code" placeholder="5자리" required')}${f('city', '시/도', 'autocomplete="address-level1" placeholder="서울특별시" required')}${f('line1', '도로명 주소', 'autocomplete="address-line1" required')}${f('line2', '상세 주소', 'autocomplete="address-line2"')}</div><label for="co-note">배송 요청사항</label><input id="co-note" name="delivery_note" maxlength="200" value="${esc(values.delivery_note || '')}" placeholder="예: 문 앞에 놓아주세요"></section>
<section class="gm-panel gm-left"><h2>주문 상품 (${lines.length})</h2><ul class="gm-lines">${lines.map(l => lineView(base, l)).join('')}</ul></section>
<section class="gm-panel gm-left"><h2>결제수단</h2><p><label class="gm-check"><input type="radio" name="method" value="card" checked> 신용/체크카드</label></p><div class="gm-form-grid">${f('name_on_card', '카드 소유자 이름', 'autocomplete="cc-name" required')}<label for="co-card">카드번호</label><input id="co-card" name="card_number" inputmode="numeric" autocomplete="cc-number" required><label for="co-exp">유효기간 (MM/YY)</label><input id="co-exp" name="expiry" value="${esc(values.expiry || '')}" placeholder="MM/YY" autocomplete="cc-exp" required><label for="co-cvv">CVC</label><input id="co-cvv" name="cvv" inputmode="numeric" autocomplete="cc-csc" required></div></section>
<label class="gm-check gm-terms"><input type="checkbox" name="terms" value="1"${values.terms === '1' ? ' checked' : ''}> [필수] 주문 상품정보 및 결제대행 서비스 이용약관, 개인정보 제3자 제공에 동의합니다.</label></div>
<aside class="gm-panel gm-summary gm-left"><h2>최종 결제금액</h2><dl><dt>상품금액</dt><dd>${won(t.subtotal + t.list_savings)}</dd><dt>할인금액</dt><dd class="gm-minus">-${won(t.list_savings)}</dd><dt>배송비</dt><dd>${t.shipping ? `+${won(t.shipping)}` : won(0)}</dd><dt class="total">총 결제금액</dt><dd class="total">${won(t.total)}</dd></dl><button class="gm-btn wide">${won(t.total)} 결제하기</button></aside></form>`
}

export function confirmationView(base, order) {
  const a = order.shipping_address
  return `<div class="gm-cart-head"><h1 class="gm-page-title">주문완료</h1><ol class="gm-steps"><li><span>01</span>장바구니</li><li><span>02</span>주문/결제</li><li aria-current="step"><span>03</span>주문완료</li></ol></div>
<section class="gm-panel gm-complete" data-order-number="${esc(order.order_number)}"><p class="gm-pending-icon" aria-hidden="true">✅</p><h2>주문이 완료되었습니다.</h2><p>주문번호 <strong>${esc(order.order_number)}</strong></p><p class="gm-muted">주문 내역은 나의 G마켓 &gt; 주문/배송조회에서 확인할 수 있습니다. 확인 메일을 ${esc(order.customer.email)}(으)로 보냈습니다.</p></section>
<section class="gm-panel gm-left"><h2>주문 상품</h2><ul class="gm-lines">${order.items.map(i => `<li class="gm-line">${shelfByCode.get(i.sku) ? `<a href="${base}/Item?goodscode=${esc(i.sku)}" class="gm-line-img">${img(base, shelfByCode.get(i.sku))}</a>` : '<span></span>'}<div class="gm-line-info"><a href="${base}/Item?goodscode=${esc(i.sku)}">${esc(i.title)}</a><p class="gm-muted">수량 ${i.qty}개</p></div><p class="gm-line-price"><strong>${won(i.unit_price * i.qty)}</strong></p></li>`).join('')}</ul></section>
<section class="gm-panel gm-left"><h2>배송지</h2><p>${esc(order.customer.first_name)} · ${esc(order.customer.phone || '')}</p><p>(${esc(a.postal_code)}) ${esc(a.city)} ${esc(a.line1)} ${esc(a.line2 || '')}</p></section>
<section class="gm-panel gm-left"><h2>결제 정보</h2><dl class="gm-dl"><dt>결제수단</dt><dd>신용카드 (${esc(order.payment.brand || '')} ****${esc(order.payment.last4)})</dd><dt>상품금액</dt><dd>${won(order.totals.subtotal)}</dd><dt>배송비</dt><dd>${won(order.totals.shipping)}</dd><dt>총 결제금액</dt><dd><strong>${won(order.totals.total)}</strong></dd></dl></section>
<p><a class="gm-btn" href="${base}/">쇼핑 계속하기</a> <a class="gm-btn outline" href="${base}/myg/orders">주문/배송조회</a></p>`
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^01[016789]-?\d{3,4}-?\d{4}$/

// --- routes ------------------------------------------------------------------
// Registered ahead of the site pages. Anything that is not a shelf item calls
// next(), so the adapter's 404/409 coverage handlers keep guarding observations.
export function installShelf(router, { render, baseOf }) {
  router.get('/shelf-art/:code/:view.svg', (req, res, next) => {
    const p = shelfByCode.get(req.params.code)
    if (!p || !/^[0-3]$/.test(req.params.view)) return next()
    res.set('Cache-Control', 'public, max-age=3600').type('image/svg+xml').send(shelfArt(p, Number(req.params.view)))
  })
  router.get(['/Item', '/product/:sku'], (req, res, next) => {
    const id = req.params.sku || req.query.goodscode || req.query.goodsCode
    const p = shelfByCode.get(id)
    if (!p) return next()
    render(req, res, p.title, shelfProduct(baseOf(res), p, { view: Number.parseInt(req.query.view, 10) || 0 }))
  })
  const productError = (req, res, p, messages) => render(req, res, p.title, shelfProduct(baseOf(res), p, { values: { qty: str(req.body?.qty), option: str(req.body?.option) }, messages }), 400)
  router.post('/cart/add', (req, res, next) => {
    const p = shelfByCode.get(str(req.body?.sku))
    if (!p) return next()
    const qty = Number(str(req.body.qty) || '1'), option = str(req.body.option), action = str(req.body.action) || 'cart'
    const messages = []
    if (!Number.isInteger(qty) || qty < 1 || qty > 10) messages.push('수량은 1개부터 10개까지 선택할 수 있습니다.')
    if (p.options && !p.options[1].includes(option)) messages.push(`${p.options[0]}을(를) 선택해 주세요.`)
    if (!['cart', 'buy'].includes(action)) messages.push('장바구니 또는 구매하기를 선택해 주세요.')
    if (messages.length) return productError(req, res, p, messages)
    const line = { kind: 'other', sku: p.code, title: p.options ? `${p.title} (${p.options[0]}: ${option})` : p.title, option: p.options ? option : '', option_label: p.options?.[0] || '', qty, unit_price: p.price, list_price: p.list, ship_fee: shipFee(p), seller: p.seller, star: p.star }
    const state = shelfState(req)
    if (action === 'buy') { state.buyNow = line; return res.redirect(`${baseOf(res)}/checkout`) }
    const existing = state.cart.find(l => lineKey(l) === lineKey(line))
    if (existing && existing.qty + qty > 10) return productError(req, res, p, ['장바구니에 담긴 수량과 합쳐 10개까지 주문할 수 있습니다.'])
    if (existing) existing.qty += qty; else state.cart.push(line)
    state.buyNow = null
    res.redirect(`${baseOf(res)}/cart`)
  })
  router.get('/cart', (req, res) => {
    const lines = shelfState(req).cart
    const shown = req.query.type === 'star' ? lines.filter(l => l.star) : req.query.type === 'emart' ? lines.filter(l => l.seller === '이마트몰') : lines
    render(req, res, '장바구니', cartView(baseOf(res), shown))
  })
  router.post('/cart/update', (req, res, next) => {
    const state = shelfState(req), line = state.cart.find(l => lineKey(l) === str(req.body?.line))
    if (!line) return next()
    if (req.body.action === 'remove') state.cart = state.cart.filter(l => l !== line)
    else {
      const qty = Number(str(req.body.qty))
      if (!Number.isInteger(qty) || qty < 1 || qty > 10) return render(req, res, '장바구니', cartView(baseOf(res), state.cart, ['수량은 1개부터 10개까지 선택할 수 있습니다.']), 400)
      line.qty = qty
    }
    res.redirect(`${baseOf(res)}/cart`)
  })
  const checkoutLines = req => { const s = shelfState(req); return s.buyNow ? [s.buyNow] : s.cart }
  router.get('/checkout', (req, res) => {
    const state = shelfState(req)
    if (req.query.mode === 'cart') state.buyNow = null
    const lines = checkoutLines(req)
    if (!lines.length) return res.redirect(`${baseOf(res)}/cart`)
    const user = req.store.user
    render(req, res, '주문/결제', checkoutView(baseOf(res), { lines, user, values: { recipient: user?.first_name || '', phone: user?.phone || '' } }))
  })
  router.post('/checkout', (req, res, next) => {
    const lines = checkoutLines(req)
    if (!lines.length) return next()
    const user = req.store.user, b = req.body || {}
    const values = Object.fromEntries(['email', 'recipient', 'phone', 'postal_code', 'city', 'line1', 'line2', 'delivery_note', 'name_on_card', 'expiry', 'terms'].map(k => [k, str(b[k])]))
    const email = user ? user.email : values.email.toLowerCase()
    const messages = []
    if (!EMAIL_RE.test(email)) messages.push('올바른 이메일 주소를 입력해 주세요.')
    if (!values.recipient) messages.push('받는 분 이름을 입력해 주세요.')
    if (!PHONE_RE.test(values.phone)) messages.push('010으로 시작하는 올바른 휴대폰 번호를 입력해 주세요.')
    if (!/^\d{5}$/.test(values.postal_code)) messages.push('5자리 우편번호를 입력해 주세요.')
    if (!values.city || !values.line1) messages.push('시/도 및 도로명 주소를 입력해 주세요.')
    if (values.delivery_note.length > 200) messages.push('배송 요청사항은 200자 이내로 입력해 주세요.')
    if (!values.name_on_card) messages.push('카드 소유자 이름을 입력해 주세요.')
    const card = validateCard({ number: str(b.card_number).replace(/[\s-]/g, ''), expiry: values.expiry, cvv: str(b.cvv) })
    if (!card.ok) {
      if (card.errors.number) messages.push('올바른 카드번호를 입력해 주세요.')
      if (card.errors.expiry) messages.push('유효한 카드 유효기간을 MM/YY 형식으로 입력해 주세요.')
      if (card.errors.cvv) messages.push('3자리 또는 4자리 CVC를 입력해 주세요.')
    }
    if (values.terms !== '1') messages.push('주문 내용 확인 및 결제 진행에 동의해 주세요.')
    if (messages.length) return render(req, res, '주문/결제', checkoutView(baseOf(res), { lines, user, values, messages }), 400)
    const t = totalsOf(lines)
    const address = { first_name: values.recipient, last_name: '', line1: values.line1, line2: values.line2, city: values.city, state: '', postal_code: values.postal_code, country: 'KR' }
    const order = recordOrder({
      store: req.storeSlug || 'gmarket', session: req.session, order_number: String(randomInt(1000000000, 10000000000)),
      items: lines.map(l => ({ kind: 'other', sku: l.sku, title: l.title, qty: l.qty, unit_price: l.unit_price })),
      customer: { email, first_name: values.recipient, last_name: '', phone: values.phone, guest: !user, account_id: user?.id ?? null },
      fulfillment: { method: 'ship', option: lines.some(l => l.star) ? 'star-delivery' : 'seller-delivery', eta: lines.every(l => l.star) ? '내일 도착보장' : '결제 후 2~3일 이내 발송', instructions: values.delivery_note },
      shipping_address: address, billing_address: address,
      payment: { method: 'card', brand: card.brand, last4: card.last4, name_on_card: values.name_on_card },
      totals: { subtotal: t.subtotal, shipping: t.shipping, tax: 0, discount: 0, total: t.total }, currency: 'KRW',
      meta: { shelf: true, sellers: [...new Set(lines.map(l => l.seller))], options: lines.filter(l => l.option).map(l => ({ sku: l.sku, option: l.option })), vat_included: true, synthetic_checkout: true },
    })
    const state = shelfState(req)
    if (state.buyNow) state.buyNow = null
    else state.cart = []
    state.orders = [...(state.orders || []), order.order_number]
    res.redirect(`${baseOf(res)}/confirmation/${order.order_number}`)
  })
  router.get('/confirmation/:number', (req, res, next) => {
    const order = getOrder(req.params.number)
    if (!order || order.store !== (req.storeSlug || 'gmarket') || !shelfState(req).orders?.includes(order.order_number)) return next()
    render(req, res, '주문완료', confirmationView(baseOf(res), order))
  })
}
