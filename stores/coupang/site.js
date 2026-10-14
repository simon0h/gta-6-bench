// Site-wide Coupang pages that do not depend on product inventory: department and
// subcategory landing pages, quick-menu landings (로켓배송, 골드박스 ...), customer service,
// policies, company pages that replace off-site links, the HTML site map and /sitemap.xml.
// In the default reference catalog the grids show the Coupang shelf (shelf.js), a
// general-merchandise assortment kept separate from GTA 6 evidence. Pages that have
// no shelf rows keep Coupang's empty-result layout.
import { esc, publicNotice } from '../../lib/html.js'
import { DEPARTMENTS, FRESH, deptById, GNB, PARTNER_MENU, HELP_MENU, MY_MENU, FOOTER_LINKS } from './site-data.js'
import { shelf, inDept, searchShelf } from './shelf.js'
import { grid, row } from './shelf-pages.js'

const text = v => typeof v === 'string' ? v.trim() : ''
const crumb = (base, parts) => `<p class="crumb cp-crumb"><a href="${base}">쿠팡 홈</a>${parts.map(([label, href]) => ` &gt; ${href ? `<a href="${base}${href}">${esc(label)}</a>` : esc(label)}`).join('')}</p>`

export const SORTS = [['scoreDesc', '쿠팡 랭킹순'], ['salePriceAsc', '낮은가격순'], ['salePriceDesc', '높은가격순'], ['saleCountDesc', '판매량순'], ['latestAsc', '최신순']]
const DELIVERY = [['rocket', '로켓배송'], ['fresh', '로켓프레시'], ['global', '로켓직구'], ['seller-rocket', '판매자로켓'], ['free', '무료배송']]
const PRICE = [['0-10000', '1만원 이하'], ['10000-30000', '1만원~3만원'], ['30000-100000', '3만원~10만원'], ['100000-', '10만원 이상']]
const RATING = [['4', '★★★★ 4점 이상'], ['3', '★★★ 3점 이상']]

// Filter sidebar + sort bar + empty product area. GET form so it works without JS.
function listing(base, action, query, { heading, emptyTitle, emptyCopy, hidden = {}, items, keepOrder } = {}) {
  if (items && items.length) return grid(base, action, query, items, { heading, hidden, keepOrder })
  const sort = SORTS.some(([v]) => v === query.sorter) ? query.sorter : 'scoreDesc'
  const checked = (k, v) => [].concat(query[k] || []).includes(v) ? ' checked' : ''
  const keep = Object.entries(hidden).map(([k, v]) => `<input type="hidden" name="${esc(k)}" value="${esc(v)}">`).join('')
  const sortLink = v => { const p = new URLSearchParams(); for (const [k, val] of Object.entries({ ...hidden, ...query })) if (typeof val === 'string' && k !== 'sorter') p.set(k, val); p.set('sorter', v); return esc(`${action}?${p}`) }
  return `<div class="cp-listing"><form class="cp-filters" method="get" action="${esc(action)}" aria-label="검색 필터">${keep}<h2>필터</h2>
<fieldset><legend>배송</legend>${DELIVERY.map(([v, l]) => `<label><input type="checkbox" name="deliveryType" value="${v}"${checked('deliveryType', v)}> ${l}</label>`).join('')}</fieldset>
<fieldset><legend>가격</legend>${PRICE.map(([v, l]) => `<label><input type="radio" name="price" value="${v}"${checked('price', v)}> ${l}</label>`).join('')}</fieldset>
<fieldset><legend>상품평</legend>${RATING.map(([v, l]) => `<label><input type="radio" name="rating" value="${v}"${checked('rating', v)}> ${l}</label>`).join('')}</fieldset>
<input type="hidden" name="sorter" value="${sort}"><button>필터 적용</button></form>
<section class="cp-results">${heading || ''}<div class="cp-sortbar" role="navigation" aria-label="정렬">${SORTS.map(([v, l]) => `<a href="${sortLink(v)}"${v === sort ? ' aria-current="true"' : ''}>${l}</a>`).join('')}<span class="cp-view">60개씩 보기</span></div>
<div class="cp-empty" data-catalog-state="no-listings"><div class="cp-empty-icon" aria-hidden="true">🔍</div><h2>${esc(emptyTitle || '이 목록에 표시할 상품이 없습니다.')}</h2><p>${esc(emptyCopy || '선택하신 조건에 맞는 상품이 없습니다. 다른 카테고리를 둘러보거나 검색어를 바꿔 보세요.')}</p><a class="cp-btn-outline" href="${base}/np/categories">전체 카테고리 보기</a></div></section></div>`
}

const deptTile = (base, d) => `<a class="cp-dept-tile" href="${base}/np/categories/${d.id}"><span class="cp-dept-icon" aria-hidden="true">${esc(d.label.slice(0, 1))}</span><span>${esc(d.label)}</span></a>`

export function departmentMenu(base) {
  return `<div class="cp-dept-menu"><p class="cp-menu-tabs"><strong>쇼핑</strong><a href="${base}/np/travel">티켓</a><a href="${base}/p/bep">테마관</a></p><ul>${DEPARTMENTS.map(d => `<li><a href="${base}/np/categories/${d.id}">${esc(d.label)}</a><div class="cp-flyout"><strong>${esc(d.label)}</strong>${d.subs.map(s => `<a href="${base}/np/categories/${d.id}/${s.slug}">${esc(s.label)}</a>`).join('')}</div></li>`).join('')}<li><a href="${base}/np/categories/${FRESH.id}">${FRESH.label}</a></li></ul><a class="cp-menu-all" href="${base}/np/categories">전체 카테고리 보기 ›</a><a class="cp-menu-cta" href="${base}/np/partners/vendor-signup">입점/판매 신청</a></div>`
}

function categoryIndex(base) {
  return `${crumb(base, [['전체 카테고리']])}<h1>전체 카테고리</h1><div class="cp-dept-directory">${[...DEPARTMENTS, FRESH].map(d => `<section><h2><a href="${base}/np/categories/${d.id}">${esc(d.label)}</a></h2><ul>${d.subs.map(s => `<li><a href="${base}/np/categories/${d.id}/${s.slug}">${esc(s.label)}</a></li>`).join('')}</ul></section>`).join('')}</div>`
}

function categoryPage(base, dept, sub, query, reference = false) {
  const title = sub ? sub.label : dept.label
  const action = `${base}/np/categories/${dept.id}${sub ? `/${sub.slug}` : ''}`
  const side = `<aside class="cp-cat-side"><h2><a href="${base}/np/categories/${dept.id}">${esc(dept.label)}</a></h2><ul>${dept.subs.map(s => `<li><a href="${base}/np/categories/${dept.id}/${s.slug}"${sub?.slug === s.slug ? ' aria-current="page"' : ''}>${esc(s.label)}</a></li>`).join('')}</ul></aside>`
  const hero = `<section class="cp-cat-hero${dept.id === FRESH.id ? ' cp-fresh' : ''}"><div><p>${sub ? esc(dept.label) : dept.id === FRESH.id ? '새벽배송 · 신선식품' : '카테고리'}</p><h1>${esc(title)}</h1><p>${dept.id === FRESH.id ? '로켓프레시 상품은 지역별 배송 가능 여부와 도착 시간을 주문 화면에서 확인할 수 있습니다.' : `${esc(dept.label)} 카테고리의 하위 분류와 필터, 정렬을 확인해 보세요.`}</p></div></section>`
  const tiles = sub ? '' : `<div class="cp-subtiles">${dept.subs.map(s => `<a href="${base}/np/categories/${dept.id}/${s.slug}"><span aria-hidden="true">${esc(s.label.slice(0, 2))}</span>${esc(s.label)}</a>`).join('')}</div>`
  return `${crumb(base, sub ? [[dept.label, `/np/categories/${dept.id}`], [sub.label]] : [[dept.label]])}<div class="cp-cat-layout">${side}<div>${hero}${tiles}${listing(base, action, query, { heading: `<h2 class="cp-results-title">${esc(title)} 전체 상품</h2>`, emptyTitle: `현재 ${title} 카테고리에 표시할 상품이 없습니다.`, items: reference ? inDept(dept.id, sub?.slug) : undefined })}</div></div>`
}

// Quick-menu landings. Copy summarises what each real section is; product rows stay empty.
export const LANDINGS = {
  '/np/campaigns/82': { title: '로켓배송', kicker: '쿠팡이 직접 배송', copy: '로켓배송 상품은 쿠팡이 직접 매입하고 배송합니다. 주문 시점과 지역에 따라 당일·새벽·익일 도착 예정일이 상품마다 표시됩니다.', points: ['도착 보장 표시는 상품별 주문 화면에서 확인', '와우회원은 로켓배송 상품 무료배송', '일반회원은 로켓배송 상품 19,800원 이상 구매 시 무료배송'], color: '#e8f3fd' },
  '/np/campaigns/83': { title: '와우회원할인', kicker: '로켓와우 멤버십', copy: '와우회원만 받을 수 있는 할인가와 쿠폰을 모아 보여주는 전용관입니다. 할인가는 로그인한 와우회원에게만 적용됩니다.', points: ['와우 전용 할인가 상품', '로켓배송 무료배송 · 무료반품', '쿠팡플레이 · 쿠팡이츠 무료배달 혜택'], color: '#eef3ff' },
  '/np/goldbox': { title: '골드박스', kicker: '오늘의 특가', copy: '골드박스는 한정 기간 동안 할인된 가격으로 판매하는 오늘의 특가 상품 모음입니다. 특가는 수량 한정 또는 시간 한정으로 조기 종료될 수 있습니다.', points: ['매일 새로운 특가', '로켓배송 · 판매자 특가 상품 포함', '할인율과 남은 시간은 상품 카드에 표시'], color: '#fff6db' },
  '/np/omp': { title: '판매자특가', kicker: '마켓플레이스', copy: '쿠팡 마켓플레이스 판매자가 직접 등록한 할인 상품을 모아 보는 페이지입니다. 판매자 배송 상품은 배송·교환·반품 조건이 판매자마다 다릅니다.', points: ['판매자별 할인 상품', '판매자 배송 · 판매자로켓 상품 포함', '상품 상세에서 판매자 정보 확인'], color: '#f6efe6' },
  '/np/fbi': { title: '다시 구매', kicker: '자주 산 상품', copy: '로그인하면 이전에 구매한 상품과 자주 산 상품을 모아 다시 장바구니에 담을 수 있습니다.', points: ['최근 구매한 상품', '자주 산 상품', '재구매 추천 상품'], color: '#eef7ee', login: true },
  '/np/coupangglobal': { title: '로켓직구', kicker: '해외 직구', copy: '로켓직구는 해외 상품을 쿠팡에서 주문하고 국내까지 빠르게 받아볼 수 있는 해외 직구 서비스입니다. 해외 구매 상품은 개인통관고유부호 입력이 필요합니다.', points: ['미국 · 중국 · 홍콩 · 일본 등 해외 상품', '개인통관고유부호 필요', '관부가세 및 반품 조건은 상품 상세 참고'], color: '#eef0fb' },
  '/p/136938': { title: '이달의신상', kicker: '신상품', copy: '이번 달 쿠팡에 새로 입점한 브랜드와 신상품을 카테고리별로 모아 보여주는 기획관입니다.', points: ['카테고리별 신상품', '신규 입점 브랜드', '런칭 기념 할인'], color: '#f2eefb' },
  '/p/54908': { title: '반품마켓', kicker: '리퍼 · 반품 상품', copy: '고객이 반품한 상품을 검수하여 상태 등급에 따라 할인된 가격으로 판매하는 전용관입니다. 상품마다 외관 상태와 구성품이 다를 수 있습니다.', points: ['검수 후 상태 등급 표시', '정상가 대비 할인', '반품·교환 조건은 상품 상세 확인'], color: '#eceff3' },
  '/p/63240': { title: '착한상점', kicker: '소상공인 · 사회적 가치', copy: '지역 소상공인, 사회적 기업 등 착한 판매자의 상품을 소개하는 기획관입니다.', points: ['지역 특산물 · 소상공인 상품', '사회적 기업 상품', '판매자 이야기'], color: '#edf6ea' },
  '/p/bep': { title: '기획전', kicker: '테마관', copy: '시즌과 테마별로 상품을 모아 보여주는 쿠팡의 기획전 목록입니다.', points: ['시즌 기획전', '브랜드 기획전', '카테고리 테마관'], color: '#fdeef0' },
}
// Old fixture-era campaign ids route to the real quick-menu landings in reference mode.
export const LEGACY_CAMPAIGNS = { rocket: '/np/campaigns/82', 'rocket-fresh': '/np/categories/393760', 'gold-box': '/np/goldbox', 'seller-deals': '/np/omp', returned: '/p/54908', 'new-arrivals': '/p/136938' }

// Shelf rows behind each quick-menu landing (reference catalog only).
const byDiscount = items => [...items].sort((a, b) => b.discount - a.discount || b.sales - a.sales)
export const LANDING_ITEMS = {
  '/np/campaigns/82': () => shelf.filter(p => p.delivery === 'rocket'),
  '/np/campaigns/83': () => byDiscount(shelf.filter(p => p.wow && p.discount >= 10)),
  '/np/goldbox': () => byDiscount(shelf.filter(p => p.discount >= 20)),
  '/np/omp': () => byDiscount(shelf.filter(p => p.delivery === 'seller' || p.delivery === 'seller-rocket' || (p.discount >= 25 && p.delivery !== 'fresh'))),
  '/np/coupangglobal': () => shelf.filter(p => p.delivery === 'global'),
  '/p/136938': () => [...shelf].sort((a, b) => b.newness - a.newness).slice(0, 72),
}
function landingPage(base, path, l, query, user, reference = false) {
  const tabs = `<nav class="cp-landing-tabs" aria-label="카테고리">${DEPARTMENTS.slice(0, 10).map(d => `<a href="${base}${path}?category=${d.id}"${query.category === d.id ? ' aria-current="true"' : ''}>${esc(d.label)}</a>`).join('')}</nav>`
  const hero = `<section class="cp-landing-hero" style="background:${l.color}"><div><p class="cp-kicker">${esc(l.kicker)}</p><h1>${esc(l.title)}</h1><p>${esc(l.copy)}</p></div><ul>${l.points.map(p => `<li>${esc(p)}</li>`).join('')}</ul></section>`
  if (l.login && !user) return `${crumb(base, [[l.title]])}${hero}<div class="cp-empty"><h2>로그인하고 자주 산 상품을 확인하세요.</h2><p>구매 이력은 로그인한 회원에게만 표시됩니다.</p><a class="cp-btn" href="${base}/login">로그인</a></div>`
  const all = reference && LANDING_ITEMS[path] ? LANDING_ITEMS[path]() : null
  const items = all && (query.category ? all.filter(p => p.dept === query.category) : all)
  const keepOrder = path === '/np/goldbox' || path === '/np/campaigns/83' || path === '/np/omp'
  return `${crumb(base, [[l.title]])}${hero}${tabs}${listing(base, base + path, query, { emptyTitle: `${l.title} 상품을 준비 중입니다.`, emptyCopy: '특가와 상품 구성은 수시로 바뀝니다. 잠시 후 다시 확인하시거나 카테고리를 선택해 둘러보세요.', hidden: query.category ? { category: query.category } : {}, items: items || undefined, keepOrder })}`
}

// Customer service and company pages. Off-site links on coupang.com become these local pages.
const S = (h, ...ps) => ({ h, ps })
export const INFO = {
  '/returnPolicy.pang': { title: '취소 / 반품 / 교환 안내', group: '고객센터', sections: [
    S('주문 취소', '결제 완료 후 상품이 출고되기 전에는 마이쿠팡 > 주문목록에서 바로 주문을 취소할 수 있습니다.', '이미 출고된 상품은 취소 대신 반품을 신청해 주세요.'),
    S('반품 신청', '마이쿠팡 > 주문목록에서 반품할 상품을 선택하고 반품 사유와 회수 방법을 선택해 신청합니다.', '전자상거래법에 따라 상품을 받은 날부터 7일 이내에 청약철회(반품)를 신청할 수 있습니다. 상품이 표시·광고 내용과 다르거나 계약 내용과 다르게 이행된 경우에는 상품을 받은 날부터 3개월 이내, 그 사실을 안 날부터 30일 이내에 신청할 수 있습니다.'),
    S('교환 신청', '같은 상품의 다른 옵션 또는 같은 옵션으로 교환할 수 있습니다. 교환 가능 여부는 상품과 판매자에 따라 다릅니다.'),
    S('반품·교환이 제한되는 경우', '다음의 경우에는 반품·교환이 제한될 수 있습니다.', '고객의 책임 있는 사유로 상품이 멸실·훼손된 경우', '포장을 개봉하여 상품 가치가 현저히 감소한 경우 (예: 다운로드 코드, 소프트웨어, 신선식품)', '시간이 지나 재판매가 곤란할 정도로 상품 가치가 감소한 경우', '주문 제작 상품 등 청약철회 시 판매자에게 회복할 수 없는 피해가 예상되는 경우'),
    S('반품 배송비', '단순 변심에 의한 반품은 고객이 반품 배송비를 부담합니다. 상품 불량·오배송은 판매자가 부담합니다. 와우회원은 로켓배송 상품을 무료로 반품할 수 있습니다.'),
  ], links: [['주문목록', '/ssr/desktop/order/list'], ['취소/반품 내역', '/ssr/desktop/cancel-return-exchange/list'], ['자주묻는 질문', '/ssr/desktop/contact/faq']] },
  '/ssr/desktop/contact/inquiry': { title: '1:1 채팅문의', group: '고객센터', sections: [
    S('문의하기 전에', '주문·배송·취소·반품에 관한 대부분의 질문은 자주묻는 질문에서 바로 확인할 수 있습니다.'),
    S('1:1 문의 남기기', '로그인한 회원은 주문을 선택하고 문의 내용을 남길 수 있습니다. 남기신 문의와 답변은 마이쿠팡 > 문의내역에서 확인할 수 있습니다.'),
    S('365 고객센터', '전화 1577-7011 (유료) · 연중무휴. 상담 연결이 많은 시간에는 대기 시간이 길어질 수 있습니다.'),
  ], links: [['문의 남기기', '/help/inquiries/new'], ['문의내역', '/help/inquiries'], ['자주묻는 질문', '/ssr/desktop/contact/faq']] },
  '/ssr/desktop/contact/voc': { title: '고객의 소리', group: '고객센터', sections: [
    S('쿠팡에 의견을 들려주세요', '서비스 이용 중 불편했던 점이나 개선 제안, 칭찬하고 싶은 점을 남길 수 있는 창구입니다.'),
    S('접수 방법', '로그인 후 문의 유형에서 의견을 선택하고 내용을 작성해 주세요. 주문과 관련된 의견은 해당 주문을 함께 선택하면 더 빠르게 확인할 수 있습니다.'),
  ], links: [['의견 남기기', '/help/inquiries/new'], ['공지사항', '/np/notices']] },
  '/np/notices': { title: '공지사항', group: '고객센터', sections: [
    S('공지사항 안내', '쿠팡 서비스 변경, 약관 개정, 시스템 점검과 개인정보 처리방침 변경 등의 소식이 공지사항 게시판에 게시됩니다.'),
    S('게시판 목록', '현재 등록된 공지사항이 없습니다. 약관과 정책은 아래 링크에서 확인할 수 있습니다.'),
  ], links: [['이용약관', '/np/policies/terms'], ['개인정보 처리방침', '/np/policies/privacy'], ['고객센터', '/ssr/desktop/contact/faq']] },
  '/np/company': { title: '회사소개', group: '회사', sections: [
    S('커머스의 미래를 만들어 갑니다', '쿠팡은 2010년 설립되어 고객이 앱을 여는 순간부터 상품을 받는 순간까지 "와우"하는 경험을 만드는 것을 목표로 합니다. 빠른 배송, 폭넓은 상품 구색, 낮은 가격을 핵심 가치로 삼습니다.'),
    S('주요 서비스', '쿠팡은 쇼핑을 넘어 생활 전반의 서비스를 제공합니다.', '로켓배송 — 당일·새벽·익일 직접 배송', '로켓프레시 — 자정까지 주문하면 새벽 도착하는 신선식품', '로켓직구 — 해외 직구 무료배송', '쿠팡이츠 — 음식 배달', '쿠팡플레이 — 동영상 스트리밍', '쿠팡페이 — 간편결제', 'CPLB — 쿠팡 자체 브랜드'),
  ], links: [['Investor Relations', '/np/investor-relations'], ['인재채용', '/np/careers']] },
  '/np/investor-relations': { title: 'Investor Relations', group: '회사', sections: [
    S('Coupang, Inc. (NYSE: CPNG)', '쿠팡의 모회사 Coupang, Inc.는 뉴욕증권거래소에 CPNG 티커로 상장되어 있습니다. 리테일, 음식 배달(Eats), 동영상 스트리밍(Play), 핀테크 서비스를 제공하는 기술 기업으로 소개됩니다.'),
    S('IR 사이트 구성', 'Overview · Latest Quarter (실적 발표, 프레젠테이션, 웹캐스트) · News & Events · Stock Info · Financials (분기 실적, 연차보고서, SEC 공시) · Governance · Resources'),
    S('IR 문의', '주가 정보와 공시 원문은 Coupang, Inc. IR 사이트(ir.aboutcoupang.com)에서 확인할 수 있습니다.'),
  ], links: [['회사소개', '/np/company']] },
  '/np/careers': { title: '인재채용', group: '회사', sections: [
    S('쿠팡은 커머스의 미래를 만들어 가고 있습니다', '쿠팡 채용 사이트는 직무 검색, 팀 소개, 근무지, 채용 절차(How We Hire), 쿠팡에서의 생활을 소개합니다.'),
    S('주요 직군', '운영 · 고객서비스, 프로덕트 매니지먼트, 가격·판매자 운영, 기술 지원, 인사(HR), 엔지니어링, 물류(CLS)'),
    S('공정한 기회', '쿠팡은 모두에게 공평한 기회를 제공합니다.'),
    S('지원 방법', '채용 공고 확인과 지원서 접수는 쿠팡 채용 사이트(coupang.jobs)에서 할 수 있습니다.'),
  ], links: [['회사소개', '/np/company']] },
  '/np/partnership': { title: '입점 / 제휴문의', group: '회사', sections: [
    S('쿠팡과 함께하는 방법', '쿠팡은 판매 방식과 사업 형태에 따라 여러 입점·제휴 프로그램을 운영합니다. 아래에서 알맞은 프로그램을 선택하세요.'),
  ], links: PARTNER_MENU.concat([['판매자 가입', '/np/partners/vendor-signup']]) },
  '/np/partners/vendor-signup': { title: '판매자 가입', group: '입점신청', sections: [S('쿠팡 Wing 판매자 가입', '오픈마켓 판매자는 쿠팡 Wing에서 사업자 정보를 등록하고 상품을 직접 판매할 수 있습니다. 가입 신청은 쿠팡 Wing(wing.coupang.com)에서 진행해 주세요.')], links: PARTNER_MENU },
  '/np/partners/marketplace': { title: '오픈마켓', group: '입점신청', sections: [S('마켓플레이스 판매', '판매자가 상품을 직접 등록하고 배송하는 방식입니다. 판매 수수료와 정산 주기는 카테고리에 따라 다릅니다.')], links: PARTNER_MENU },
  '/np/partners/travel': { title: '여행·티켓', group: '입점신청', sections: [S('여행·티켓 파트너', '숙박, 여행 상품, 공연·전시 티켓 판매사를 위한 입점 프로그램입니다.')], links: PARTNER_MENU },
  '/np/partners/rocket-supplier': { title: '로켓배송 공급사', group: '입점신청', sections: [S('로켓배송 입점', '공급사가 쿠팡에 상품을 납품하면 쿠팡이 직접 매입하여 로켓배송으로 판매하는 방식입니다.')], links: PARTNER_MENU },
  '/np/partners/affiliate': { title: '제휴마케팅', group: '입점신청', sections: [S('쿠팡 파트너스', '블로그, SNS 등에 쿠팡 상품 링크를 공유하고 구매가 발생하면 수수료를 받는 제휴 마케팅 프로그램입니다.')], links: PARTNER_MENU },
  '/np/partners/rocket-growth': { title: '로켓그로스', group: '입점신청', sections: [S('로켓그로스', '판매자가 상품을 쿠팡 물류센터에 입고하면 보관, 포장, 로켓배송, 반품까지 쿠팡이 처리하는 풀필먼트 서비스입니다.')], links: PARTNER_MENU },
  '/np/policies/terms': { title: '이용약관', group: '약관 및 정책', sections: [
    S('제1조 (목적)', '이 약관은 쿠팡 주식회사가 운영하는 사이버몰에서 제공하는 서비스를 이용함에 있어 회사와 회원의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.'),
    S('주요 내용', '회원가입과 탈퇴, 구매 신청과 계약 성립, 결제, 배송, 청약철회, 마켓플레이스(통신판매중개) 이용, 회원의 의무, 분쟁 해결'),
    S('통신판매중개', '마켓플레이스 상품은 개별 판매자가 판매하며, 쿠팡은 통신판매중개자로서 해당 거래의 당사자가 아닙니다.'),
    S('안내', '위 내용은 이용약관의 주요 내용을 요약한 것입니다. 자세한 사항은 이용약관 전문을 확인해 주세요.'),
  ] },
  '/np/policies/privacy': { title: '개인정보 처리방침', group: '약관 및 정책', sections: [
    S('개인정보 처리방침 목차', '쿠팡 개인정보 처리방침은 다음 항목으로 구성됩니다.', '개인정보 수집 이용 보유 파기', '개인정보의 제3자 제공', '개인정보의 처리업무 위탁', '개인정보의 파기절차 및 방법', '이용자의 권리와 그 행사 방법', '이용자 맞춤형 광고 개인정보보호 원칙', '개인정보 자동 수집 설치/운영 및 거부에 관한 사항', '스마트폰 앱 관리', '개인정보 보호책임자 및 담당자의 연락처', '회사의 정보보호 노력', '고지의 의무'),
    { ...S('이 사이트에서의 처리', '쿠팡(주)과 관련 없는 모의 쇼핑 사이트입니다. 입력한 계정과 배송지 정보는 서버 실행 동안만 보관됩니다. 실제 개인정보와 카드정보를 입력하지 마세요.'), publicOnly: true },
    S('안내', '위 목차는 쿠팡 개인정보 처리방침(Ver. 7.8)의 구성입니다. 자세한 내용은 개인정보 처리방침 전문을 확인해 주세요.'),
  ] },
  '/np/policies/coupay': { title: '쿠팡페이 이용약관', group: '약관 및 정책', sections: [S('전자금융거래 이용약관', '쿠페이 간편결제, 쿠팡캐시 등 쿠팡페이가 제공하는 전자금융거래 서비스의 이용 조건을 정합니다.')] },
  '/np/policies/location': { title: '위치기반서비스 이용약관', group: '약관 및 정책', sections: [S('위치정보 이용', '배송지 확인, 주변 매장 안내 등 위치기반서비스 제공을 위한 위치정보의 수집과 이용 조건을 정합니다.')] },
  '/np/policies/youth': { title: '청소년보호정책', group: '약관 및 정책', sections: [S('청소년 보호', '쿠팡은 청소년에게 유해한 정보와 상품으로부터 청소년을 보호하기 위해 청소년 유해 상품 판매 시 성인 인증을 요구하고 청소년보호책임자를 지정하고 있습니다.')] },
  '/np/policies/seller': { title: '판매자 이용약관', group: '약관 및 정책', sections: [S('마켓플레이스 판매자 약관', '쿠팡 마켓플레이스에 상품을 등록·판매하는 판매자와 쿠팡 사이의 권리와 의무, 수수료와 정산, 상품 등록 기준을 정합니다.')] },
  '/np/business-info': { title: '사업자정보 확인', group: '회사', sections: [S('사업자 정보', '전자상거래법에 따라 공개하는 사업자 정보입니다.', '상호명: 쿠팡(주)', '주소: 서울시 송파구 송파대로 570', '사업자등록번호: 120-88-00767', '통신판매업신고: 2017-서울송파-0680', '이메일: help@coupang.com')] },
  '/np/coupangplay': { title: '쿠팡플레이', group: '쿠팡 서비스', sections: [S('쿠팡플레이', '쿠팡플레이는 영화, 드라마, 예능, 스포츠 중계를 제공하는 쿠팡의 동영상 스트리밍 서비스입니다. 와우회원은 추가 비용 없이 이용할 수 있습니다.'), S('이용 안내', '쿠팡플레이는 쿠팡플레이 앱 또는 웹사이트(coupangplay.com)에서 쿠팡 계정으로 로그인해 이용할 수 있습니다.')] },
  '/np/coupangbiz': { title: '쿠팡비즈', group: '쿠팡 서비스', sections: [S('사업자 회원 전용 구매', '쿠팡비즈는 사업자 회원을 위한 구매 서비스로 사업자 전용가, 세금계산서 발행, 대량 구매를 지원합니다.'), S('가입', '사업자 회원 가입은 사업자등록번호 인증 후 이용할 수 있습니다.')] },
  '/np/travel': { title: '쿠팡트래블', group: '쿠팡 서비스', sections: [S('여행 · 티켓', '쿠팡트래블에서는 호텔·펜션 등 국내 숙소, 해외여행 상품, 항공권, 공연·전시 티켓을 예약할 수 있습니다.'), S('안내', '현재 여행 상품 예약 서비스를 이용할 수 없습니다. 잠시 후 다시 시도해 주세요.')] },
}

function infoPage(base, path, p) {
  const related = p.links ? `<aside class="cp-related"><h2>관련 메뉴</h2>${p.links.map(([l, h]) => `<a href="${base}${h}">${esc(l)}</a>`).join('')}</aside>` : ''
  const side = p.group === '고객센터' ? `<nav class="cp-info-nav" aria-label="고객센터 메뉴"><strong>고객센터</strong>${HELP_MENU.concat([['공지사항', '/np/notices']]).map(([l, h]) => `<a href="${base}${h}"${h === path ? ' aria-current="page"' : ''}>${esc(l)}</a>`).join('')}</nav>`
    : p.group === '약관 및 정책' ? `<nav class="cp-info-nav" aria-label="약관 및 정책"><strong>약관 및 정책</strong>${FOOTER_LINKS.filter(([, h]) => h.startsWith('/np/policies')).map(([l, h]) => `<a href="${base}${h}"${h === path ? ' aria-current="page"' : ''}>${esc(l)}</a>`).join('')}</nav>` : ''
  return `${crumb(base, [[p.group], [p.title]])}<div class="cp-info${side ? ' cp-info-with-nav' : ''}">${side}<article><h1>${esc(p.title)}</h1>${p.sections.map(s => { const html = `<section><h2>${esc(s.h)}</h2>${s.ps.length > 2 ? `<p>${esc(s.ps[0])}</p><ul>${s.ps.slice(1).map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : s.ps.map(x => `<p>${esc(x)}</p>`).join('')}</section>`; return s.publicOnly ? publicNotice(html) : html }).join('')}${related}</article></div>`
}

export function sitemapPage(base) {
  const group = (title, links) => `<section><h2>${esc(title)}</h2><ul>${links.map(([l, h]) => `<li><a href="${base}${h}">${esc(l)}</a></li>`).join('')}</ul></section>`
  return `${crumb(base, [['사이트맵']])}<h1>사이트맵</h1><p class="cp-lead">쿠팡의 카테고리와 서비스, 고객센터 페이지를 한눈에 볼 수 있습니다.</p><div class="cp-sitemap-depts">${[...DEPARTMENTS, FRESH].map(d => `<section><h2><a href="${base}/np/categories/${d.id}">${esc(d.label)}</a></h2><ul>${d.subs.map(s => `<li><a href="${base}/np/categories/${d.id}/${s.slug}">${esc(s.label)}</a></li>`).join('')}</ul></section>`).join('')}</div><div class="cp-sitemap-groups">${group('쇼핑 서비스', [['전체 카테고리', '/np/categories'], ['상품 검색', '/np/search'], ...GNB])}${group('고객센터', [['고객센터', '/ssr/desktop/contact/faq'], ...HELP_MENU, ['공지사항', '/np/notices']])}${group('마이쿠팡', [['마이쿠팡', '/ssr/desktop/order/list'], ...MY_MENU, ['장바구니', '/cart'], ['로그인', '/login'], ['회원가입', '/register']])}${group('입점 / 제휴', [['입점 / 제휴문의', '/np/partnership'], ['판매자 가입', '/np/partners/vendor-signup'], ...PARTNER_MENU])}${group('회사 · 약관', [...FOOTER_LINKS, ['사업자정보 확인', '/np/business-info']])}</div>`
}

export function sitemapPaths() {
  return ['/', '/np/categories', '/np/search', '/np/sitemap', '/cart', '/login', '/register',
    ...[...DEPARTMENTS, FRESH].flatMap(d => [`/np/categories/${d.id}`, ...d.subs.map(s => `/np/categories/${d.id}/${s.slug}`)]),
    ...Object.keys(LANDINGS), ...Object.keys(INFO), '/ssr/desktop/contact/faq']
}

// Homepage for reference mode. Sections follow the desktop home: rotating main banner,
// quick shortcuts, 오늘의 발견, 골드박스, category rows and the WOW membership promo.
const ICONS = { 쿠팡플레이: '▶', 로켓배송: '배송', 로켓프레시: '프레시', '다시 구매': '재구매', 쿠팡비즈: 'Biz', 로켓직구: '직구', 골드박스: '특가', 이달의신상: 'NEW', 판매자특가: '판매자', 와우회원할인: 'WOW', 반품마켓: '반품', 착한상점: '착한', 기획전: '기획', 쿠팡트래블: '여행' }
export function homePage(base) {
  const banners = [['로켓배송', '/np/campaigns/82', '오늘 주문하면 내일 도착', '#dff0ff'], ['로켓프레시', '/np/categories/393760', '자정까지 주문하면 아침 7시 전 도착', '#e4f6e3'], ['골드박스', '/np/goldbox', '하루 한정 특가', '#fff3cf'], ['로켓직구', '/np/coupangglobal', '해외 상품도 로켓처럼', '#ece9fb'], ['와우회원할인', '/np/campaigns/83', '와우회원만을 위한 할인', '#e9efff']]
  const hero = `<section class="cp-hero" aria-label="메인 배너"><a class="cp-hero-main" href="${base}${banners[0][1]}" style="background:${banners[0][3]}"><span class="cp-kicker">쿠팡 로켓배송</span><strong>${banners[0][2]}</strong><span>생활필수품부터 가전까지, 도착 예정일을 주문 전에 확인하세요.</span><span class="cp-btn">바로가기 ›</span></a><ol class="cp-hero-list">${banners.map(([t, h, c], i) => `<li><a href="${base}${h}"${i === 0 ? ' aria-current="true"' : ''}><b>${t}</b><small>${c}</small></a></li>`).join('')}</ol></section>`
  const shortcuts = `<section class="cp-shortcuts" aria-label="바로가기"><h2 class="cp-sr">바로가기</h2>${GNB.filter(([l]) => l !== '입점신청').map(([l, h]) => `<a href="${base}${h}"><span aria-hidden="true">${ICONS[l] || esc(l.slice(0, 2))}</span>${esc(l)}</a>`).join('')}</section>`
  const discovery = `<section class="cp-home-section"><div class="cp-section-head"><h2>오늘의 발견</h2><span>오늘 쿠팡이 엄선한 가장 HOT한 상품</span></div><div class="cp-discovery"><a class="cp-disc-big" href="${base}/p/136938"><span class="cp-kicker">오늘의 쇼핑제안</span><strong>이달의신상</strong><small>새로 입점한 브랜드와 신상품</small></a><a href="${base}/np/categories/194276"><strong>식품</strong><small>신선 · 간편식 · 생수</small></a><a href="${base}/np/categories/178255"><strong>가전디지털</strong><small>TV · 노트북 · 게임</small></a><a href="${base}/np/categories/115673"><strong>생활용품</strong><small>세제 · 화장지 · 욕실</small></a><a href="${base}/np/categories/176422"><strong>뷰티</strong><small>스킨케어 · 메이크업</small></a></div></section>`
  const deals = []
  for (const p of [...shelf].sort((a, b) => b.discount - a.discount || b.sales - a.sales)) if (p.discount >= 20 && deals.filter(x => x.dept === p.dept).length < 1 && deals.length < 6) deals.push(p)
  const goldbox = `<section class="cp-home-section cp-goldbox"><div class="cp-section-head"><h2>골드박스</h2><span>오늘의 특가</span><a href="${base}/np/goldbox">더보기 ›</a></div>${row(base, deals)}</section>`
  const fresh = `<section class="cp-home-section"><div class="cp-section-head"><h2>로켓프레시</h2><span>오늘 밤 12시 전 주문 시 내일 아침 7시 전 도착</span><a href="${base}/np/categories/393760">더보기 ›</a></div>${row(base, inDept('393760').slice(0, 6))}</section>`
  const ranking = `<section class="cp-home-section"><div class="cp-section-head"><h2>지금 많이 찾는 상품</h2><span>최근 판매량 기준 쿠팡 랭킹</span><a href="${base}/np/campaigns/82">로켓배송 전체 ›</a></div>${row(base, [...shelf].filter(p => p.delivery === 'rocket').sort((a, b) => b.sales - a.sales).slice(0, 6), { ranked: true })}</section>`
  const top = (id, n) => [...inDept(id)].sort((a, b) => b.sales * b.rating - a.sales * a.rating).slice(0, n)
  const rows = `<section class="cp-home-section"><div class="cp-section-head"><h2>카테고리별 추천상품</h2><a href="${base}/np/categories">전체 카테고리 ›</a></div><div class="cs-cat-blocks">${DEPARTMENTS.filter(d => inDept(d.id).length).map(d => `<article class="cs-cat-block"><header><h3><a href="${base}/np/categories/${d.id}">${esc(d.label)}</a></h3><p>${d.subs.slice(0, 5).map(s => `<a href="${base}/np/categories/${d.id}/${s.slug}">${esc(s.label)}</a>`).join('')}</p><a class="cs-more" href="${base}/np/categories/${d.id}">더보기 ›</a></header>${row(base, top(d.id, 6))}</article>`).join('')}</div></section>`
  const wow = `<section class="cp-wow"><div><p class="cp-kicker">로켓와우</p><h2>와우회원이라면 누리는 혜택</h2><ul><li>로켓배송 상품 무료배송</li><li>로켓배송 상품 30일 무료반품</li><li>쿠팡플레이 무료 시청</li><li>쿠팡이츠 무료배달</li></ul></div><a class="cp-btn" href="${base}/np/campaigns/83">와우회원할인 보기</a></section>`
  const note = `<section class="cp-catalog-note" data-reference-state="catalog"><h2>상품 정보 안내</h2><p>표시된 가격과 할인율, 도착 예정일은 주문 시점과 배송지에 따라 달라질 수 있습니다. 최종 결제 금액과 도착 예정일은 주문/결제 화면에서 확인해 주세요.</p>${publicNotice('<p>표시된 상품 정보는 모의 쇼핑 환경을 위한 예시이며, 실제 쿠팡의 판매 정보와 관련이 없습니다.</p>')}</section>`
  return `<h1 class="cp-sr">쿠팡</h1>${hero}${shortcuts}${discovery}${goldbox}${ranking}${fresh}${rows}${wow}${note}`
}

export function searchBody(base, query) {
  const q = text(typeof query.q === 'string' ? query.q : '')
  const head = `${crumb(base, [['검색']])}<h1 class="cp-search-title">${q ? `‘${esc(q)}’ 검색결과` : '상품 검색'}</h1><form class="cp-inline-search" method="get" action="${base}/np/search"><label for="cp-q">검색어</label><input id="cp-q" name="q" type="search" value="${esc(q)}" placeholder="찾고 싶은 상품을 검색해보세요!"><button>검색</button></form>`
  if (!q) return `${head}${listing(base, `${base}/np/search`, query, { emptyTitle: '검색어를 입력해 주세요.', emptyCopy: '상품명, 브랜드 또는 카테고리로 검색할 수 있습니다.' })}`
  const dept = typeof query.category === 'string' && deptById(query.category)
  const results = searchShelf(q).filter(p => !dept || p.dept === dept.id)
  const hidden = { q, ...(dept ? { category: query.category } : {}) }
  // GTA 6 has no captured Coupang listing: say so, then show what the shelf matches.
  if (/gta|grand\s*theft|그랜드\s*테프트|지티에이/i.test(q)) {
    const notice = `<section class="reference-coverage cs-coverage" data-reference-state="uncaptured"><h2>‘${esc(q)}’ 예약판매 상품이 없습니다.</h2><p>현재 판매 중인 Grand Theft Auto VI 상품이 없습니다. 아래는 검색어와 관련된 다른 상품입니다.</p></section>`
    return `${head}${notice}${results.length ? listing(base, `${base}/np/search`, query, { hidden, items: results, keepOrder: true }) : ''}`
  }
  if (results.length) return `${head}${listing(base, `${base}/np/search`, query, { hidden, items: results, keepOrder: true })}`
  // Uncaptured query: identify missing coverage rather than fabricate an empty result set.
  return `${head}<div class="cp-listing"><div class="cp-filters" aria-hidden="true"><h2>필터</h2><p>배송 · 가격 · 상품평</p></div><section class="cp-results"><div class="cp-sortbar">${SORTS.map(([, l], i) => `<span${i === 0 ? ' aria-current="true"' : ''}>${l}</span>`).join('')}</div><section class="empty reference-coverage cp-empty" data-reference-state="uncaptured"><h2>‘<strong>${esc(q)}</strong>’에 대한 검색결과가 없습니다.</h2><ul><li>단어의 철자가 정확한지 확인해 보세요.</li><li>검색어의 단어 수를 줄이거나, 보다 일반적인 검색어로 다시 검색해 보세요.</li><li>두 단어 이상의 검색어인 경우, 띄어쓰기를 확인해 보세요.</li></ul><a href="${base}/np/categories">전체 카테고리 보기</a></section></section></div>`
}

export function emptyCart(base) {
  return `<h1>장바구니</h1><div class="cp-cart-tabs"><span aria-current="true">일반구매 (0)</span><span>정기배송 (0)</span></div><div class="cp-empty cp-cart-empty"><div class="cp-empty-icon" aria-hidden="true">🛒</div><h2>장바구니에 담은 상품이 없습니다.</h2><p>원하는 상품을 장바구니에 담아보세요!</p><a class="cp-btn" href="${base}">쇼핑 계속하기</a></div>`
}

// Routes. In fixture mode the authored catalog keeps its own categories and campaigns.
export function installSite(router, { render, reference = false, knownCategory = () => false, knownCampaign = () => false }) {
  const base = res => res.locals.base
  router.get('/np/categories', (req, res, next) => reference ? render(req, res, '전체 카테고리', categoryIndex(base(res))) : next())
  router.get('/np/categories/:id', (req, res, next) => {
    if (!reference && knownCategory(req.params.id)) return next()
    const d = deptById(req.params.id)
    if (!d) return reference ? render(req, res, '카테고리 없음', `<h1>카테고리를 찾을 수 없습니다.</h1><p><a href="${base(res)}/np/categories">전체 카테고리 보기</a></p>`, 404) : next()
    render(req, res, d.label, categoryPage(base(res), d, null, req.query, reference))
  })
  router.get('/np/categories/:id/:sub', (req, res, next) => {
    const d = deptById(req.params.id), s = d?.subs.find(x => x.slug === req.params.sub)
    if (!s) return next()
    render(req, res, s.label, categoryPage(base(res), d, s, req.query, reference))
  })
  for (const [path, l] of Object.entries(LANDINGS)) router.get(path, (req, res, next) => {
    if (!reference && knownCampaign(path.split('/').pop())) return next()
    render(req, res, l.title, landingPage(base(res), path, l, req.query, req.store.user, reference))
  })
  if (reference) router.get(['/np/campaigns/:id', '/events/:id'], (req, res, next) => LEGACY_CAMPAIGNS[req.params.id] ? res.redirect(base(res) + LEGACY_CAMPAIGNS[req.params.id]) : next())
  for (const [path, p] of Object.entries(INFO)) router.get(path, (req, res) => render(req, res, p.title, infoPage(base(res), path, p)))
  router.get(['/np/sitemap', '/sitemap'], (req, res) => render(req, res, '사이트맵', sitemapPage(base(res))))
  router.get('/sitemap.xml', (req, res) => {
    const urls = sitemapPaths().map(p => `<url><loc>${esc(base(res) + (p === '/' ? '' : p))}</loc></url>`).join('')
    res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`)
  })
  router.get('/login/memberJoinFrm.pang', (req, res) => res.redirect(`${base(res)}/register`))
  router.get('/ssr/desktop/cancel-return-exchange/list', (req, res) => res.redirect(`${base(res)}/account/returns`))
  router.get('/wishInitView.pang', (req, res) => res.redirect(`${base(res)}/account/wishlist`))
}
