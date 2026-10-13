// Reference-mode chrome and pages for the Gmarket clone.
// Layout follows the www.gmarket.co.kr PC site captured 2026-10-13. Product areas show the
// everyday shelf assortment (shelf.js) next to the captured read-only GTA 6 observations,
// which keep their own "purchase unverified" cards and detail pages.
import { esc, money, disclaimer } from '../../lib/html.js'
import { authenticate, createAccount, publicAccount } from '../../lib/accounts.js'
import { departments, departmentByCode, menuTabs, exhibitions, services, homeShopping, superdealTabs, starCategories,
  emartCategories, emartPromotions, policies, faqTopics, notices, mySections, company } from './site-data.js'
import { shelf, inDept, best } from './shelf.js'
import { shelfRow, mixedBest, resultsBlock, sortLabels } from './shelf-pages.js'

const won = n => money(n, 'KRW')
const icon = {
  my: '<svg viewBox="0 0 32 32" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="16" cy="10" r="5.5"/><path d="M5 28c1-7 6-10 11-10s10 3 11 10"/></svg>',
  recent: '<svg viewBox="0 0 32 32" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="16" cy="16" r="11"/><path d="M16 9v7l5 3"/></svg>',
  cart: '<svg viewBox="0 0 32 32" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M3 5h4l3.5 15h14L28 9H8.5"/><circle cx="12" cy="26" r="2"/><circle cx="23" cy="26" r="2"/></svg>',
  search: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><circle cx="10.5" cy="10.5" r="7"/><path d="m16 16 5.5 5.5"/></svg>',
}
const logo = '<span class="gm-logo-mark" aria-hidden="true"><b>G</b>market</span>'

export function layout(base, title, user, body, query = {}, count = 0) {
  const keyword = typeof (query.keyword ?? query.q) === 'string' ? (query.keyword ?? query.q) : ''
  const drawer = departments.map(d => `<li><a class="dep" href="${base}/n/list?category=${d.code}"><span aria-hidden="true">${d.icon}</span>${esc(d.name)}</a><ul>${d.subs.map((s, i) => `<li><a href="${base}/n/list?category=${d.code}&amp;sub=${i + 1}">${esc(s)}</a></li>`).join('')}</ul></li>`).join('')
  const footerLinks = [['회사소개', '/company'], ['채용정보', '/company/careers'], ['구매회원 약관', '/terms-policy/buyer-use'], ['판매회원 약관', '/terms-policy/seller-use'], ['개인정보 처리방침', '/terms-policy/privacy', 'strong'], ['알기쉬운 개인정보 처리방침', '/terms-policy/easy-privacy'], ['청소년보호 정책', '/terms-policy/youth'], ['납세관리 정책', '/terms-policy/tax-management'], ['전자금융거래 약관', '/terms-policy/electronic-finance'], ['판매자센터', '/seller-center'], ['광고센터', '/ad-center'], ['제휴서비스', '/partnership'], ['사이트맵', '/sitemap']]
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>G마켓 - ${esc(title)}</title><link rel="stylesheet" href="${base}/static/site.css"></head><body class="gm">
<div class="gm-skip"><strong class="sr-only">스킵 네비게이션</strong><a href="#skip-navigation-search">검색창 바로가기</a><a href="#button__category-all">전체카테고리 바로가기</a><a href="#container">본문 바로가기</a></div>
<header class="gm-header">
 <div class="gm-util"><div class="gm-wrap">${user ? `<span class="gm-hello">${esc(user.first_name || user.email)}님</span><form method="post" action="${base}/LogIn/LogOut"><button class="gm-linkbtn">로그아웃</button></form>` : `<a href="${base}/LogIn/LogIn">로그인</a><a href="${base}/signup">회원가입</a>`}<a href="${base}/help">고객센터</a></div></div>
 <div class="gm-wrap gm-gnb">
  <a class="gm-logo" href="${base}/" aria-label="G마켓 홈">${logo}</a>
  <form class="gm-search" id="skip-navigation-search" action="${base}/n/search" method="get" role="search"><label class="sr-only" for="gm-keyword">검색어 입력</label><input id="gm-keyword" name="keyword" type="search" value="${esc(keyword)}" placeholder="검색어를 입력해 주세요" autocomplete="off"><button aria-label="검색">${icon.search}</button></form>
  <nav class="gm-my" aria-label="나의 쇼핑 메뉴"><a href="${base}/myg">${icon.my}<span>마이페이지</span></a><a href="${base}/myg/recent">${icon.recent}<span>최근본상품</span></a><a href="${base}/cart" class="gm-cart-link">${icon.cart}<span>장바구니</span>${count ? `<b class="gm-cart-count" aria-label="담은 상품 ${count}개">${count}</b>` : ''}</a></nav>
 </div>
 <div class="gm-lnb"><div class="gm-wrap">
  <details class="gm-allcat" id="button__category-all"><summary><span class="burger" aria-hidden="true"></span>전체카테고리</summary><div class="gm-drawer"><ul>${drawer}</ul><a class="gm-drawer-all" href="${base}/n/category">전체카테고리 한눈에 보기 ›</a></div></details>
  <nav class="gm-tabs" aria-label="주요 서비스">${menuTabs.map(([l, p]) => `<a href="${base}${p}">${esc(l)}</a>`).join('')}</nav>
 </div></div>
</header>
<main id="container" class="gm-wrap gm-main">${body}</main>
<footer class="gm-footer">
 <div class="gm-footer-links"><div class="gm-wrap">${footerLinks.map(([l, p, s]) => `<a href="${base}${p}">${s ? `<strong>${l}</strong>` : l}</a>`).join('')}</div></div>
 <div class="gm-wrap gm-footer-body">
  <div class="gm-corp"><a class="gm-logo small" href="${base}/" aria-label="G마켓 홈">${logo}</a>
   <p><strong>${company.name}</strong></p>
   <p>대표이사: ${company.ceo} <span>|</span> 서울특별시 강남구 테헤란로 152 (역삼동, 강남파이낸스센터)</p>
   <p>사업자등록번호: ${company.bizNo} <a class="gm-chip" href="${base}/business-info">사업자정보확인</a> <span>|</span> 통신판매업 신고: ${company.mailOrder}</p>
   <p>이메일: ${company.email}</p>
  </div>
  <div class="gm-cs"><p class="gm-cs-title">고객센터</p><p class="gm-cs-phone">${company.phone}</p><p>${company.hours}</p><p>꼭 멤버십 전용 ${company.membershipPhone} (365일 09:00 ~ 18:00, 유료)</p>
   <p class="gm-cs-links"><a href="${base}/help">고객센터 바로가기</a><a href="${base}/help/inquiry">1:1 문의하기</a><a href="${base}/help/notice">공지사항</a><a href="${base}/help/accessibility">웹접근성 신고센터</a></p></div>
 </div>
 <div class="gm-wrap gm-legal"><p>${company.name}는 통신판매중개자로서 거래당사자가 아니며, 판매자가 등록한 상품정보 및 거래에 대해 책임을 지지 않습니다. 단, ${company.name}가 판매자로 등록 판매한 상품은 판매자로서 책임을 부담합니다.</p><p>구매안전서비스: 고객님은 안전거래를 위해 현금 등으로 결제 시 저희 쇼핑몰에서 가입한 구매안전서비스를 이용하실 수 있습니다.</p><p>Copyright Gmarket Inc. All rights reserved.</p>${disclaimer('Gmarket (G마켓)')}</div>
</footer></body></html>`
}

// --- shared bits ---------------------------------------------------------
const crumbs = (base, list) => `<nav class="gm-crumbs" aria-label="현재 위치"><a href="${base}/">홈</a>${list.map(([l, p]) => p ? ` <span>›</span> <a href="${esc(base + p)}">${esc(l)}</a>` : ` <span>›</span> <strong>${esc(l)}</strong>`).join('')}</nav>`
const tabs = (base, list, current, label = '카테고리') => `<nav class="gm-pill-tabs" aria-label="${label}">${list.map(([l, p]) => `<a href="${base}${p}"${p === current ? ' aria-current="page"' : ''}>${esc(l)}</a>`).join('')}</nav>`
const pending = (text = '이 영역의 상품 목록은 수집되지 않았습니다.') => `<div class="gm-pending" data-reference-coverage="not-captured"><p class="gm-pending-icon" aria-hidden="true">🛍️</p><p><strong>${esc(text)}</strong></p><p>실제 G마켓의 상품 수, 가격, 재고를 의미하지 않습니다. 확인된 상품은 <a href="BASE/n/search?keyword=ps5gta6">수집된 검색결과</a>에서 볼 수 있습니다.</p></div>`
const empty = (base, text) => pending(text).replace('BASE', base)
const sectionHead = (title, more, base, moreLabel = '전체보기') => `<div class="gm-sec-head"><h2>${title}</h2>${more ? `<a href="${base}${more}">${moreLabel} ›</a>` : ''}</div>`
const art = p => `<div class="gm-thumb" aria-hidden="true"><span>${p.platform === 'xbox' ? 'Xbox Series X|S' : 'PS5'}</span><small>이미지 미수집</small></div>`
export function card(base, p) {
  return `<article class="gm-card" data-reference-product="${esc(p.id)}" data-purchase-evidence="unverified"><a href="${base}${esc(p.path)}">${art(p)}<h3>${esc(p.title)}</h3></a><p class="gm-seller">${esc(p.seller)}</p><p class="gm-price"><strong>${won(p.price).replace('원', '')}</strong>원</p><p class="gm-note">구매 가능 여부 미확인</p></article>`
}
const cards = (base, list) => `<div class="gm-cards">${list.map(p => card(base, p)).join('')}</div>`
const sidebarPage = (base, title, nav, current, body) => `<div class="gm-side-layout"><aside class="gm-side"><p class="gm-side-title">${title}</p><ul>${nav.map(([l, p]) => `<li><a href="${base}${p}"${p === current ? ' aria-current="page"' : ''}>${esc(l)}</a></li>`).join('')}</ul></aside><div class="gm-side-body">${body}</div></div>`
const sorts = ['G마켓 랭크순', '판매인기순', '낮은가격순', '높은가격순', '상품평 많은순', '신규상품순']

// --- product groupings ------------------------------------------------------
// [dept code, sub indexes (empty = all)] pairs used by the service pages' menus.
const pick = pairs => shelf.filter(p => pairs.some(([d, subs]) => p.dept === d && (!subs.length || subs.includes(p.sub))))
const F = '100000006', P = '100000005', H = '100000007', L = '100001001', FA = '100000001', B = '100000003', D = '100001007', HO = '100001004', S = '100001002', T = '100001003', BK = '100001009', EC = '100001011', TR = '100001005'
const grocery = () => pick([[F, []], [P, []]])
const superdealGroups = { '400000135': [[FA, [1, 2, 3]]], '400000136': [[FA, [4, 5, 6]]], '400000137': [[B, []]], '400000138': [[H, [3, 4, 5, 6]]], '400000139': [[F, []], [P, []]], '400000140': [[H, [1, 2]], [L, []]], '400000141': [[HO, []]], '400000143': [[L, []], [S, [5]]], '400000146': [[S, []]], '400000151': [[T, [1, 2]], [BK, []]], '400000148': [[D, [2, 5, 6, 7]]], '400000149': [[D, [1, 3, 4]]], '400000152': [[TR, []]], '400000153': [[EC, []]] }
const starGroups = { '100003006': [[P, [2]]], '100004012': [[P, [1]]], '100004014': [[F, []]], '100004013': [[P, [5]]], '100004011': [[P, [3]]], '100003008': [[P, [6]]], '100003001': [[L, []]], '100004001': [[D, []]], '100003005': [[HO, []]], '100004007': [[S, []]], '100004003': [[FA, [1, 2, 3]]], '100003003': [[B, []]], '100004004': [[FA, [4, 5, 6]]], '100003009': [[H, [3, 4, 5, 6]]], '100003004': [[T, [4]]], '100004010': [[T, [1]]], '100004008': [[H, [6]], [T, [2]]], '100004006': [[T, [5]]], '100004009': [[T, [6]], [L, [5]]], '100004002': [[S, [5]]], '100006001': [[BK, [1]]], '100005001': [[BK, [2]]], '100000003': [[H, [1, 2]]] }
const emartGroups = { '100001000': [[F, [1]]], '100001001': [[F, [2]]], '100001002': [[F, [3]]], '100001003': [[F, [4]]], '100001004': [[F, [5]]], '100001009': [[F, [6]]], '100001011': [[P, [1]]], '100001012': [[F, [2]]], '100001013': [[P, [3]]], '100001014': [[P, [3]]], '100001015': [[P, [4]]], '100001016': [[P, [5]]], '100001017': [[P, [2]]], '100001018': [[P, [2]]], '100001019': [[P, [6]]], '100001020': [[H, [1]]], '100001021': [[H, [2]]], '100001022': [[L, [2]]], '100001023': [[L, [1, 6]]], '100001024': [[L, [5]]], '100001025': [[T, [4]]], '100001026': [[B, []]], '100001027': [[H, [3, 4, 5, 6]]], '100001028': [[FA, [3]]], '100001029': [[FA, [4, 5, 6]]], '100001030': [[S, []], [T, [5]]], '100001031': [[D, []]], '100001040': [[T, [1, 2]], [BK, []]] }
const newest = n => [...shelf].sort((a, b) => Number(b.code) - Number(a.code)).slice(0, n)
const exhibitGroups = { 267301: () => pick([[P, [1, 4]]]), 275223: () => pick([[FA, []], [S, [6]]]), 46199: () => pick([[BK, []]]), 46705: () => grocery().filter(p => p.price >= 20000), 247323: () => shelf.filter(p => p.star), 247329: () => [...shelf].sort((a, b) => b.discount - a.discount).slice(0, 40), 247325: () => newest(40), 256447: () => pick([[B, []]]).filter(p => p.star), 254245: () => newest(24), 56191: () => pick([[P, [3]]]), 271282: () => pick([[F, []]]), 271159: () => grocery().filter(p => p.discount >= 20), 248149: () => pick([[P, [6]], [S, [5]]]) }
const deals = list => [...list].filter(p => p.deal || p.discount >= 20).sort((a, b) => (b.deal - a.deal) || (b.discount - a.discount))
const spread = (list, n) => { const seen = new Set(); return list.filter(p => !seen.has(p.dept) && seen.add(p.dept)).slice(0, n) }
const productRow = (base, list, opts) => list.length ? shelfRow(base, list, opts) : ''

// --- homepage -------------------------------------------------------------
export function home(base, observations) {
  const groups = [['전체', ''], ...departments.filter(d => d.code !== '100001005').map(d => [d.name, d.code])]
  const games = best(inDept(D, 1).filter(p => p.game))
  const gameRow = [...games.slice(0, 2), ...observations, ...games.slice(2, 10 - observations.length)]
  return `<h1 class="sr-only">G마켓 - 지금부터의 마켓</h1>
<section class="gm-hero" aria-label="기획전 배너"><div class="gm-hero-slide"><p class="gm-eyebrow">지금부터의 마켓</p><p class="gm-hero-title">오늘 주문하면 내일 도착<br>스타배송 도착보장</p><p>꼭 멤버십은 무료반품까지</p><a class="gm-btn" href="${base}/n/stardelivery">스타배송 바로가기</a></div><div class="gm-hero-side"><a href="${base}/n/superdeal"><strong>슈퍼딜</strong><span>오늘의 특가 모음</span></a><a href="${base}/n/smilehome"><strong>쿠폰/출첵</strong><span>매일 출석하고 캐시받기</span></a><a href="${base}/n/emartmall"><strong>이마트몰</strong><span>신선한 장보기</span></a></div></section>
<section class="gm-home-sec" aria-labelledby="h-allcat"><h2 id="h-allcat" class="gm-sub-title">전체카테고리</h2><div class="gm-cat-icons">${departments.map(d => `<a href="${base}/n/list?category=${d.code}"><span aria-hidden="true">${d.icon}</span>${esc(d.name)}</a>`).join('')}</div></section>
<section class="gm-home-sec" data-home-row="best">${sectionHead('지금 제일 잘 나가는 상품', '/n/best', base)}${tabs(base, groups.map(([l, c]) => [l, c ? `/n/best?groupCode=${c}` : '/n/best']), '/n/best', '베스트 카테고리')}${productRow(base, mixedBest(shelf, 10), { ranked: true })}<p class="gm-more"><a href="${base}/n/best">베스트 상품 더보기 ›</a></p></section>
<section class="gm-home-sec" data-home-row="superdeal">${sectionHead('슈퍼딜 <em class="gm-onair">오늘의 특가</em>', '/n/superdeal', base)}${productRow(base, spread(deals(shelf.filter(p => !mixedBest(shelf, 10).includes(p))), 5))}</section>
<section class="gm-home-sec gm-band emart" data-home-row="emart">${sectionHead('지금부터의 신선마켓, 이마트몰', '/n/emartmall', base, '바로가기')}<nav class="gm-pill-tabs">${Object.entries(emartPromotions).filter(([k]) => k !== '5').map(([k, l]) => `<a href="${base}/n/emartmall/sale?promotionCode=${k}">${l}</a>`).join('')}</nav><h3 class="gm-sub-title" id="오반장">오반장 상품</h3>${productRow(base, [...shelf.filter(p => p.emart), ...best(grocery()).filter(p => !p.emart)].slice(0, 5))}<p class="gm-more"><a href="${base}/n/emartmall/sale?promotionCode=3">오반장 상품 더보기 ›</a></p></section>
<section class="gm-home-sec gm-band star" data-home-row="star">${sectionHead('오늘 주문 내일 도착보장, 스타배송', '/n/stardelivery', base, '바로가기')}<div class="gm-exhibits">${[267301, 275223, 46199, 46705, 247323, 247329, 247325].map(id => `<a href="${base}/rpp?exhib=${id}"><span>${esc(exhibitions[id])}</span></a>`).join('')}</div>
 <div id="best"><h3 class="gm-sub-title">베스트 상품</h3>${productRow(base, mixedBest(shelf.filter(p => p.star), 5))}<p class="gm-more"><a href="${base}/n/stardelivery/best">베스트 상품 더보기 ›</a></p></div><div id="freedelivery"><h3 class="gm-sub-title">무료배송 상품</h3>${productRow(base, mixedBest(shelf.filter(p => p.free && !p.star && p.dept !== EC), 5))}<p class="gm-more"><a href="${base}/n/stardelivery/category?categoryCode=100000003">무료배송 상품 더보기 ›</a></p></div></section>
<section class="gm-home-sec" data-home-row="digital">${sectionHead('디지털/가전 베스트', '/n/best?groupCode=100001007', base)}${productRow(base, mixedBest(pick([[D, [2, 3, 4, 5, 6, 7]]]), 5, p => p.sub))}</section>
<section class="gm-home-sec" data-reference-state="catalog" aria-labelledby="h-games" data-home-row="games">${sectionHead('<span id="h-games">게임 · 콘솔 인기상품</span>', '/n/list?category=100001007&sub=1', base)}<p class="gm-muted">신작 예약판매와 인기 게임기를 모았습니다. 예약판매 일부 상품은 구매 가능 여부가 확인되지 않아 상품정보만 제공됩니다.</p>${shelfRow(base, gameRow.slice(0, 10), { observed: p => card(base, p) })}</section>
<section class="gm-home-sec" data-home-row="fashion-beauty">${sectionHead('패션 · 뷰티 가을 신상 특가', '/n/best?groupCode=100000001', base)}${productRow(base, mixedBest(pick([[FA, []], [B, []]]), 5))}</section>
<section class="gm-home-sec">${sectionHead('G마켓 서비스', '', base)}<div class="gm-services">${services.map(([l, p, i]) => `<a href="${base}${p}"><span aria-hidden="true">${i}</span>${esc(l)}</a>`).join('')}</div></section>
<section class="gm-home-sec">${sectionHead('홈쇼핑 모아보기 <em class="gm-onair">on air</em>', '/homeshopping', base)}<div class="gm-shops">${homeShopping.map(([id, l]) => `<a href="${base}/homeshopping#${id}"><strong>${l}</strong><span>방송 상품 보기</span></a>`).join('')}</div></section>`
}

// --- pages ---------------------------------------------------------------
const deptPage = (base, d, sub, query) => {
  const subName = sub ? d.subs[sub - 1] : ''
  const observed = d.code === D && (!sub || sub === 1) ? query.observations : []
  const params = { category: d.code, ...(sub ? { sub } : {}) }
  return `${crumbs(base, [[d.name, subName ? `/n/list?category=${d.code}` : ''], ...(subName ? [[subName]] : [])])}<h1 class="gm-page-title">${esc(subName || d.name)}</h1>
<div class="gm-subcats">${d.subs.map((s, i) => `<a href="${base}/n/list?category=${d.code}&amp;sub=${i + 1}"${sub === i + 1 ? ' aria-current="page"' : ''}>${esc(s)} <small>${inDept(d.code, i + 1).length + (d.code === D && i === 0 ? query.observations.length : 0)}</small></a>`).join('')}</div>
${resultsBlock(base, { path: '/n/list', params, list: best(inDept(d.code, sub)), observations: observed, query: query.raw, observedCard: p => card(base, p), emptyText: `${subName || d.name} 카테고리에 조건에 맞는 상품이 없습니다.` })}`
}

// A ranked or filtered collection page with the shared filter/sort/pagination block.
const collection = (base, path, params, list, query, extra = {}) => resultsBlock(base, { path, params, list, query, observedCard: p => card(base, p), ...extra })

const sitemapPage = base => `${crumbs(base, [['사이트맵']])}<h1 class="gm-page-title">사이트맵</h1><div class="gm-sitemap">
<section><h2>전체카테고리</h2><ul>${departments.map(d => `<li><a href="${base}/n/list?category=${d.code}">${esc(d.name)}</a><ul>${d.subs.map((s, i) => `<li><a href="${base}/n/list?category=${d.code}&amp;sub=${i + 1}">${esc(s)}</a></li>`).join('')}</ul></li>`).join('')}</ul></section>
<section><h2>쇼핑 서비스</h2><ul>${[['G마켓 베스트', '/n/best'], ['슈퍼딜', '/n/superdeal'], ['이마트몰', '/n/emartmall'], ['스타배송', '/n/stardelivery'], ['스마일홈', '/n/smilehome'], ['꼭 멤버십', '/n/showroom/membership'], ['꼭 현대카드', '/n/showroom/ggokcard'], ['트레이더스', '/n/expressshop/home'], ['e쿠폰', '/n/ecoupon'], ['여행/항공', '/travel'], ['홈쇼핑 모아보기', '/homeshopping']].map(([l, p]) => `<li><a href="${base}${p}">${l}</a></li>`).join('')}</ul></section>
<section><h2>나의 쇼핑</h2><ul><li><a href="${base}/LogIn/LogIn">로그인</a></li><li><a href="${base}/signup">회원가입</a></li><li><a href="${base}/cart">장바구니</a></li><li><a href="${base}/myg">나의 G마켓</a></li>${mySections.map(([id, l]) => `<li><a href="${base}/myg/${id}">${l}</a></li>`).join('')}</ul></section>
<section><h2>고객센터</h2><ul><li><a href="${base}/help">고객센터</a></li>${faqTopics.map(([id, l]) => `<li><a href="${base}/help/faq/${id}">${l} 자주 묻는 질문</a></li>`).join('')}<li><a href="${base}/help/notice">공지사항</a></li><li><a href="${base}/help/inquiry">1:1 문의하기</a></li><li><a href="${base}/help/accessibility">웹접근성 신고센터</a></li></ul></section>
<section><h2>약관 및 정책</h2><ul>${policies.map(([id, l]) => `<li><a href="${base}/terms-policy/${id}">${l}</a></li>`).join('')}</ul></section>
<section><h2>회사 정보</h2><ul>${[['회사소개', '/company'], ['채용정보', '/company/careers'], ['판매자센터', '/seller-center'], ['광고센터', '/ad-center'], ['제휴서비스', '/partnership'], ['사업자정보확인', '/business-info']].map(([l, p]) => `<li><a href="${base}${p}">${l}</a></li>`).join('')}</ul></section></div>`

const sitemapXml = base => {
  const paths = ['/', '/n/category', '/n/best', '/n/superdeal', '/n/emartmall', '/n/emartmall/best', '/n/stardelivery', '/n/stardelivery/best', '/n/smilehome', '/n/showroom/membership', '/n/showroom/ggokcard', '/n/expressshop/home', '/n/ecoupon', '/travel', '/homeshopping', '/n/search?keyword=ps5gta6', '/Item?goodscode=4796016651', '/Item?goodscode=4796017670', '/cart', '/LogIn/LogIn', '/signup', '/myg', ...mySections.map(([id]) => `/myg/${id}`), '/help', ...faqTopics.map(([id]) => `/help/faq/${id}`), '/help/notice', '/help/inquiry', '/help/accessibility', ...policies.map(([id]) => `/terms-policy/${id}`), '/company', '/company/careers', '/seller-center', '/ad-center', '/partnership', '/business-info', '/sitemap', ...departments.map(d => `/n/list?category=${d.code}`)]
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths.map(p => `  <url><loc>${esc(base + p)}</loc></url>`).join('\n')}\n</urlset>\n`
}

const policyBody = {
  'buyer-use': `<h2>제1장 총칙</h2><h3>제1조 (목적)</h3><p>이 약관은 ${company.name}가 운영하는 G마켓 사이트에서 제공하는 전자상거래 관련 서비스와 기타 서비스를 이용하는 구매회원과 회사의 권리·의무 및 책임사항을 정하는 것을 목적으로 합니다.</p><h3>제2조(약관의 명시, 효력과 개정)</h3><p>회사는 약관의 내용을 회원이 쉽게 알 수 있도록 서비스 화면에 게시하며, 관련 법령을 위배하지 않는 범위에서 약관을 개정할 수 있습니다. 개정 시 적용일자와 개정사유를 사전에 공지합니다.</p><h3>제3조 (용어의 정의)</h3><p>구매회원, 판매회원, 아이디, 비밀번호, 스마일캐시 등 약관에서 사용하는 용어의 뜻을 정의합니다.</p><h3>제4조 (서비스의 종류)</h3><p>회사가 제공하는 서비스는 전자상거래 중개 서비스와 부가 서비스(쿠폰, 이벤트, 멤버십 등)로 구분됩니다.</p><h3>제5조 (대리행위의 부인)</h3><p>회사는 통신판매중개자로서 회원 상호간의 거래를 위한 시스템을 제공할 뿐, 판매자 또는 구매자를 대리하지 않습니다.</p>`,
  privacy: '<h2>개인정보 처리방침</h2><p>G마켓은 서비스 제공에 필요한 최소한의 개인정보를 수집하며, 수집 목적, 보유 기간, 제3자 제공 및 처리 위탁 현황, 이용자의 권리 행사 방법을 이 방침에 따라 안내합니다.</p><h3>수집하는 개인정보 항목</h3><p>회원가입, 주문·배송, 고객상담 시 이름, 아이디, 연락처, 배송지 등의 정보를 수집합니다.</p><h3>개인정보의 보유 및 이용기간</h3><p>회원 탈퇴 시 지체 없이 파기하되, 관련 법령에 따라 보관이 필요한 정보는 정해진 기간 동안 보관합니다.</p>',
  'easy-privacy': '<h2>알기쉬운 개인정보 처리방침</h2><p>개인정보 처리방침의 주요 내용을 그림과 요약으로 쉽게 정리한 안내입니다. 자세한 내용은 개인정보 처리방침 전문을 확인해 주세요.</p>',
  youth: '<h2>청소년보호 정책</h2><p>G마켓은 청소년이 유해정보에 노출되지 않도록 성인인증이 필요한 상품에 대해 별도의 인증 절차를 두고, 청소년보호책임자를 지정해 관련 업무를 처리합니다.</p>',
  'tax-management': '<h2>납세관리 정책</h2><p>판매회원의 부가가치세 신고에 필요한 매출 자료 제공 등 납세 관리와 관련된 기준을 안내합니다.</p>',
  'seller-use': '<h2>판매회원 약관</h2><p>G마켓에 상품을 등록·판매하는 판매회원과 회사 간의 권리, 의무, 수수료 및 정산 기준 등을 정합니다.</p>',
  'electronic-finance': '<h2>전자금융거래 약관</h2><p>스마일페이 등 회사가 제공하는 전자금융거래 서비스의 이용 조건, 오류 정정, 손해배상 등에 관한 사항을 정합니다.</p>',
}

const infoPages = {
  company: ['회사소개', `<p>${company.name}는 국내 대표 오픈마켓 G마켓과 옥션을 운영하는 전자상거래 기업입니다. G마켓은 2000년 서비스를 시작해 판매자와 구매자를 연결하는 통신판매중개 플랫폼으로 성장했으며, 현재 신세계 그룹 계열사입니다.</p><h2>주요 서비스</h2><ul><li>오픈마켓 G마켓·옥션</li><li>스타배송 도착보장 및 꼭 멤버십</li><li>판매자 통합 관리 솔루션 ESM PLUS</li></ul><h2>회사 정보</h2><p>${company.address} · 대표이사 ${company.ceo}</p>`],
  'company/careers': ['채용정보', '<p>G마켓은 커머스 플랫폼을 함께 만들어 갈 개발, 데이터, 상품기획(MD), 마케팅, 디자인 직군의 인재를 채용합니다. 채용 공고와 전형 절차는 지마켓 채용 사이트에서 안내합니다.</p><h2>채용 절차</h2><ol><li>서류전형</li><li>직무 인터뷰</li><li>종합 인터뷰</li><li>처우 협의 및 입사</li></ol>'],
  'seller-center': ['판매자센터', '<p>G마켓 판매회원은 ESM PLUS(이베이 셀링 매니저 플러스)에서 G마켓과 옥션 상품을 한 번에 등록하고 주문, 배송, 정산을 관리합니다.</p><h2>판매자 지원</h2><ul><li>판매자 전용 상담(ESM PLUS)</li><li>판매자 고객센터</li><li>상품등록 및 광고 안내</li></ul>'],
  'ad-center': ['광고센터', '<p>G마켓 광고센터에서는 검색 키워드 광고, 전시 광고, 기획전 광고 등 판매자를 위한 광고 상품을 안내하고 집행 결과를 확인할 수 있습니다.</p>'],
  partnership: ['제휴서비스', '<p>G마켓과 마케팅·서비스 제휴를 원하는 기업은 제휴 제안을 통해 문의할 수 있습니다. 카드사 제휴(꼭 현대카드), 멤버십 제휴, 콘텐츠 제휴 등을 운영합니다.</p>'],
  'business-info': ['사업자정보확인', `<p>공정거래위원회에 등록된 통신판매업자 정보입니다.</p><dl class="gm-dl"><dt>상호</dt><dd>${company.name}</dd><dt>대표자</dt><dd>${company.ceo}</dd><dt>사업자등록번호</dt><dd>${company.bizNo}</dd><dt>통신판매업 신고번호</dt><dd>${company.mailOrder}</dd><dt>주소</dt><dd>${company.address}</dd></dl>`],
}

function cartPage(base) {
  return `<div class="gm-cart-head"><h1 class="gm-page-title">장바구니</h1><ol class="gm-steps"><li aria-current="step"><span>01</span>장바구니</li><li><span>02</span>주문/결제</li><li><span>03</span>주문완료</li></ol></div>
<nav class="gm-pill-tabs" aria-label="장바구니 구분"><a href="${base}/cart" aria-current="page">전체 0</a><a href="${base}/cart?type=star">스타배송 0</a><a href="${base}/cart?type=emart">이마트몰 0</a></nav>
<div class="gm-cart-grid"><section class="gm-panel gm-cart-empty"><p class="gm-pending-icon" aria-hidden="true">🛒</p><p><strong>장바구니에 담긴 상품이 없습니다.</strong></p><p class="gm-muted">이 사이트의 수집된 상품은 구매 가능 여부가 확인되지 않아 장바구니에 담을 수 없습니다.</p><a class="gm-btn outline" href="${base}/">쇼핑 계속하기</a></section>
<aside class="gm-panel gm-summary"><h2>결제 예정 금액</h2><dl><dt>상품금액</dt><dd>0원</dd><dt>배송비</dt><dd>0원</dd><dt>할인금액</dt><dd>0원</dd><dt class="total">총 결제금액</dt><dd class="total">0원</dd></dl><button class="gm-btn wide" disabled>주문하기</button></aside></div>`
}

function loginPage(base, { tab = 'member', email = '', messages = [] } = {}) {
  const guest = tab === 'guest'
  return `<section class="gm-auth"><p class="gm-auth-logo"><a class="gm-logo" href="${base}/" aria-label="G마켓 홈">${logo}</a></p><h1>로그인</h1>
<nav class="gm-auth-tabs" aria-label="로그인 구분"><a href="${base}/LogIn/LogIn"${!guest ? ' aria-current="page"' : ''}>회원</a><a href="${base}/LogIn/LogIn?tab=guest"${guest ? ' aria-current="page"' : ''}>비회원</a></nav>
${messages.length ? `<div class="gm-alert" role="alert">${messages.map(m => `<p>${esc(m)}</p>`).join('')}</div>` : ''}
${guest ? `<form method="get" action="${base}/myg/orders" class="gm-auth-form"><p class="gm-auth-caption"><strong>비회원 정보 입력</strong></p><label for="g-name">주문자 이름</label><input id="g-name" name="name" autocomplete="name" placeholder="주문자 이름을 입력해주세요." required><label for="g-phone">휴대폰 번호</label><input id="g-phone" name="phone" inputmode="tel" autocomplete="tel" placeholder="휴대폰 번호를 입력해주세요." required><label for="g-cart">장바구니 번호</label><input id="g-cart" name="cartNo" inputmode="numeric" placeholder="장바구니 번호를 입력해주세요." required><button class="gm-btn wide">주문내역 조회</button></form><p class="gm-auth-links"><a href="${base}/help/faq/order">주문 비밀번호를 잊으셨나요?</a></p>`
  : `<form method="post" action="${base}/LogIn/LogIn" class="gm-auth-form"><p class="gm-auth-caption"><strong>회원 정보 입력</strong></p><label class="sr-only" for="m-id">아이디</label><input id="m-id" name="id" value="${esc(email)}" autocomplete="username" placeholder="아이디를 입력해주세요." required><label class="sr-only" for="m-pw">비밀번호</label><input id="m-pw" name="password" type="password" autocomplete="current-password" placeholder="비밀번호를 입력해주세요." required><label class="gm-check"><input type="checkbox" name="saveId" value="1"> 아이디 저장</label><button class="gm-btn wide">로그인</button></form>
<p class="gm-auth-links"><a href="${base}/help/faq/member">아이디 찾기</a><a href="${base}/help/faq/member">비밀번호 재설정</a><a href="${base}/signup">회원가입</a></p><div class="gm-auth-alt"><p>간편 로그인은 이 환경에서 제공되지 않습니다.</p><a class="gm-btn outline wide" href="${base}/LogIn/LogIn?tab=guest">비회원으로 구매하기</a></div>`}</section>`
}

function signupPage(base, values = {}, messages = []) {
  return `<section class="gm-auth"><p class="gm-auth-logo"><a class="gm-logo" href="${base}/" aria-label="G마켓 홈">${logo}</a></p><h1>회원가입</h1><p class="gm-muted">간편 가입하고 쇼핑하기</p>${messages.length ? `<div class="gm-alert" role="alert">${messages.map(m => `<p>${esc(m)}</p>`).join('')}</div>` : ''}
<form method="post" action="${base}/signup" class="gm-auth-form"><label for="s-email">아이디 (이메일)</label><input id="s-email" name="email" type="email" autocomplete="email" value="${esc(values.email || '')}" required><label for="s-pw">비밀번호</label><input id="s-pw" name="password" type="password" autocomplete="new-password" required><label for="s-name">이름</label><input id="s-name" name="first_name" autocomplete="name" value="${esc(values.first_name || '')}" required><label for="s-phone">휴대폰 번호</label><input id="s-phone" name="phone" inputmode="tel" autocomplete="tel" value="${esc(values.phone || '')}" placeholder="010-0000-0000" required><label class="gm-check"><input type="checkbox" name="terms" value="1"${values.terms === '1' ? ' checked' : ''}> [필수] 구매회원 약관 및 개인정보 수집·이용에 동의합니다.</label><button class="gm-btn wide">동의하고 가입하기</button></form><p class="gm-auth-links"><a href="${base}/LogIn/LogIn">이미 회원이신가요? 로그인</a></p></section>`
}

function mygPage(base, user, section = '') {
  const nav = [['나의 G마켓', '/myg'], ...mySections.map(([id, l]) => [l, `/myg/${id}`])]
  const label = mySections.find(([id]) => id === section)?.[1] || '나의 G마켓'
  const gate = user ? '' : `<div class="gm-panel gm-gate"><p><strong>로그인이 필요한 서비스입니다.</strong></p><p class="gm-muted">로그인하시면 주문/배송조회, 쿠폰, 스마일캐시 등 나의 쇼핑 정보를 확인할 수 있습니다.</p><a class="gm-btn" href="${base}/LogIn/LogIn">로그인</a> <a class="gm-btn outline" href="${base}/LogIn/LogIn?tab=guest">비회원 주문조회</a></div>`
  let body
  if (!section) body = `<h1 class="gm-page-title">나의 G마켓</h1>${user ? `<p class="gm-hello-big"><strong>${esc(user.first_name || user.email)}</strong>님, 반갑습니다.</p>` : gate}<div class="gm-my-summary">${[['주문/배송조회', 'orders'], ['취소/반품/교환', 'claims'], ['쿠폰', 'coupons'], ['스마일캐시', 'cash']].map(([l, id]) => `<a class="gm-panel" href="${base}/myg/${id}"><span>${l}</span><strong>0</strong></a>`).join('')}</div><h2 class="gm-sub-title">최근 주문 내역</h2><p class="gm-muted gm-panel">최근 주문 내역이 없습니다.</p>`
  else if (section === 'orders') body = `<h1 class="gm-page-title">주문/배송조회</h1>${user ? '<p class="gm-panel gm-muted">조회 기간 내 주문 내역이 없습니다.</p>' : `<div class="gm-panel"><h2>비회원 주문조회</h2><form method="get" action="${base}/myg/orders" class="gm-inline-form"><label for="o-name">주문자 이름</label><input id="o-name" name="name" autocomplete="name"><label for="o-phone">휴대폰 번호</label><input id="o-phone" name="phone" inputmode="tel" autocomplete="tel"><label for="o-cart">장바구니 번호</label><input id="o-cart" name="cartNo" inputmode="numeric"><button class="gm-btn">주문내역 조회</button></form></div>${gate}`}`
  else body = `<h1 class="gm-page-title">${esc(label)}</h1>${user ? `<p class="gm-panel gm-muted">${esc(label)} 내역이 없습니다.</p>` : gate}`
  return `${crumbs(base, [['나의 G마켓', section ? '/myg' : ''], ...(section ? [[label]] : [])])}${sidebarPage(base, '나의 쇼핑정보', nav, section ? `/myg/${section}` : '/myg', body)}`
}

function helpMain(base) {
  return `<section class="gm-help-hero"><h1>G마켓이 도와드릴게요!</h1><form method="get" action="${base}/help/search" class="gm-help-search"><h2 class="sr-only">질문검색</h2><label class="sr-only" for="help-q">궁금한 내용을 입력해 주세요</label><input id="help-q" name="q" placeholder="궁금한 내용을 입력해 주세요"><button class="gm-btn">검색</button></form></section>
<section class="gm-home-sec">${sectionHead('자주 묻는 질문을 확인하세요', '/help/faq/member', base, '질문 전체보기')}<nav class="gm-pill-tabs">${faqTopics.map(([id, l]) => `<a href="${base}/help/faq/${id}">${l}</a>`).join('')}</nav><p class="gm-muted">'회원' 관련 가장 자주 묻는 질문입니다</p><ol class="gm-faq-list">${faqTopics[0][2].map(q => `<li><a href="${base}/help/faq/member">${esc(q)}</a></li>`).join('')}</ol></section>
<section class="gm-home-sec"><h2>간편하게 해결하세요</h2><div class="gm-quick">${[['나의 문의내역', '/myg/inquiries'], ['내 회원정보수정', '/myg/info'], ['아이디/비밀번호찾기', '/help/faq/member'], ['주문/배송조회', '/myg/orders'], ['취소/반품/교환', '/help/faq/returns'], ['[리콜ㆍ상품안전 정보]', '/help/notice/3']].map(([l, p]) => `<a class="gm-panel" href="${base}${p}">${l}</a>`).join('')}</div></section>
<div class="gm-two"><section class="gm-panel"><h2>상담이 필요하신가요?</h2><p class="gm-cs-phone">${company.phone}</p><p>${company.hours}</p><p><a class="gm-btn" href="${base}/help/inquiry">문의글 작성</a></p><h3>고객센터 이용안내</h3><p class="gm-muted">고객센터 통화 요금은 발신 고객에게 과금됩니다. 회원 확인 후 1번 주문/배송, 2번 반품/교환, 3번 이벤트/기타 문의를 선택할 수 있습니다. 꼭 멤버십 회원은 전용 상담(${company.membershipPhone}, 365일 09:00 ~ 18:00)을 이용할 수 있습니다.</p></section>
<section class="gm-panel"><h2>판매 상담이 필요하신가요?</h2><p><a href="${base}/seller-center">판매자 전용 상담(ESM PLUS)</a></p><p><a href="${base}/seller-center">판매자 고객센터</a></p><h3>원격지원</h3><p class="gm-muted">상담원이 고객님의 화면을 함께 보며 문제를 해결해 드립니다.</p><h3>웹접근성 신고센터</h3><p><a href="${base}/help/accessibility">웹접근성 신고센터</a></p></section></div>
<section class="gm-home-sec">${sectionHead('공지사항', '/help/notice', base)}<ul class="gm-notice-list">${notices.map(([id, t, d]) => `<li><a href="${base}/help/notice/${id}">${esc(t)}</a><span>${d}</span></li>`).join('')}</ul></section>`
}
const helpNav = [['고객센터 홈', '/help'], ...faqTopics.map(([id, l]) => [l, `/help/faq/${id}`]), ['공지사항', '/help/notice'], ['1:1 문의하기', '/help/inquiry']]

// --- install -------------------------------------------------------------
export function installSite(router, { render, coverage, baseOf, observations }) {
  const page = (path, title, body) => router.get(path, (req, res) => render(req, res, title, typeof body === 'function' ? body(baseOf(res), req) : body))
  const simple = (base, list, title, inner) => `${crumbs(base, list)}<h1 class="gm-page-title">${esc(title)}</h1>${inner}`

  // Legacy fixture-mode routes stay reachable.
  router.get('/account', (req, res) => res.redirect(`${baseOf(res)}${req.store.user ? '/myg' : '/LogIn/LogIn'}`))
  router.get('/account/register', (req, res) => res.redirect(`${baseOf(res)}/signup`))
  router.get('/account/:section', (req, res) => res.redirect(`${baseOf(res)}/myg`))
  router.get('/category/:department{/:leaf}', (req, res) => res.redirect(`${baseOf(res)}/n/category`))
  router.get('/best', (req, res) => res.redirect(`${baseOf(res)}/n/best`))
  router.get('/superdeal', (req, res) => res.redirect(`${baseOf(res)}/n/superdeal`))
  router.get('/benefits', (req, res) => res.redirect(`${baseOf(res)}/n/smilehome`))

  page('/n/category', '전체카테고리', base => simple(base, [['전체카테고리']], '전체카테고리', `<div class="gm-allcat-page">${departments.map(d => `<section class="gm-panel"><h2><a href="${base}/n/list?category=${d.code}"><span aria-hidden="true">${d.icon}</span> ${esc(d.name)}</a></h2><ul>${d.subs.map((s, i) => `<li><a href="${base}/n/list?category=${d.code}&amp;sub=${i + 1}">${esc(s)}</a></li>`).join('')}</ul></section>`).join('')}</div>`))
  router.get('/n/list', (req, res) => {
    const d = departmentByCode(req.query.category), sub = Number(req.query.sub || 0)
    if (!d || !Number.isInteger(sub) || sub < 0 || sub > d.subs.length) return coverage(req, res, 'Page not captured', 404)
    render(req, res, sub ? d.subs[sub - 1] : d.name, deptPage(baseOf(res), d, sub, { raw: req.query, observations }))
  })

  const groups = [['전체', ''], ...departments.map(d => [d.name, d.code])]
  page('/n/best', 'G마켓 베스트', (base, req) => {
    const code = groups.some(([, c]) => c && c === req.query.groupCode) ? req.query.groupCode : ''
    const list = code ? best(inDept(code)) : mixedBest(shelf, 100)
    return simple(base, [['베스트']], 'G마켓 베스트', `${tabs(base, groups.map(([l, c]) => [l, c ? `/n/best?groupCode=${c}` : '/n/best']), code ? `/n/best?groupCode=${code}` : '/n/best', '베스트 카테고리')}<p class="gm-muted">베스트 선정 기준: 최근 판매량, 상품평, 구매만족도를 반영해 실시간으로 집계되는 순위입니다.</p><section data-best-group="${code || 'all'}">${shelfRow(base, list.slice(0, 100), { ranked: true })}</section>`)
  })
  page('/n/superdeal', '슈퍼딜', (base, req) => {
    const code = superdealTabs.some(([, c]) => c && c === req.query.categoryCode) ? req.query.categoryCode : ''
    const list = code ? deals(pick(superdealGroups[code])) : mixedBest(deals(shelf), 60)
    return simple(base, [['슈퍼딜']], '슈퍼딜', `<div class="gm-icon-tabs">${superdealTabs.map(([l, c]) => `<a href="${base}/n/superdeal${c ? `?categoryCode=${c}` : ''}"${c === code ? ' aria-current="page"' : ''}><span aria-hidden="true">${l.slice(0, 1)}</span><strong>${l}</strong></a>`).join('')}</div><p class="gm-muted">매일 오전 10시에 새로운 특가 상품이 열립니다. 한정 수량으로 조기 종료될 수 있습니다.</p>${list.length ? shelfRow(base, list) : '<div class="gm-noresult"><p><strong>지금 진행 중인 슈퍼딜이 없습니다.</strong></p></div>'}`)
  })
  page('/n/stardelivery', '스타배송', base => `${crumbs(base, [['스타배송']])}<section class="gm-star-hero"><h1>스타배송</h1><p class="gm-hero-title">주말까지 매일매일 빠른배송</p><p>오늘 주문, 내일 도착 보장</p><a class="gm-btn outline" href="${base}/n/stardelivery/guide">스타배송 알아보기</a></section>
<nav class="gm-pill-tabs" aria-label="스타배송 기획전">${[['한가위빅세일', '/rpp?exhib=271159'], ['생필품 쟁이기', '/n/stardelivery/category?categoryCode=100000003'], ['이달의발견', '/rpp?exhib=247325'], ['단독상품관', '/rpp?exhib=247323'], ['창고대방출', '/rpp?exhib=247329'], ['LIVE 다시보기', '/rpp?exhib=275223'], ['대용량알뜰관', '/rpp?exhib=46705'], ['베스트 100', '/n/stardelivery/best'], ['이마트몰', '/n/emartmall']].map(([l, p]) => `<a href="${base}${p}">${l}</a>`).join('')}</nav>
<section class="gm-home-sec">${sectionHead('실시간 BEST 순위🏆', '/n/stardelivery/best', base)}${shelfRow(base, mixedBest(shelf.filter(p => p.star), 10), { ranked: true })}</section>
<section class="gm-home-sec"><h2>슈퍼딜</h2>${shelfRow(base, deals(shelf.filter(p => p.star)).slice(0, 5))}</section>
<section class="gm-home-sec"><h2>Star Delivery 카테고리</h2><div class="gm-subcats">${starCategories.map(([l, c]) => `<a href="${base}/n/stardelivery/category?categoryCode=${c}">${esc(l)}</a>`).join('')}</div></section>`)
  page('/n/stardelivery/best', '스타배송 베스트', base => simple(base, [['스타배송', '/n/stardelivery'], ['베스트']], '스타배송 베스트 100', shelfRow(base, mixedBest(shelf.filter(p => p.star), 100), { ranked: true })))
  page('/n/stardelivery/guide', '스타배송 알아보기', base => simple(base, [['스타배송', '/n/stardelivery'], ['스타배송 알아보기']], '스타배송 알아보기', '<div class="gm-panel"><h2>오늘 주문, 내일 도착 보장</h2><p>스타배송 상품은 마감 시간 전에 주문하면 다음 날 도착을 보장합니다. 도착보장 상품이 약속한 날짜에 도착하지 않으면 보상 혜택을 제공합니다.</p><h2>도착보장! 꼭 멤버십은 무료반품</h2><p>꼭 멤버십 회원은 스타배송 상품 무료반품 혜택을 받을 수 있습니다. 세부 조건은 멤버십 안내를 확인해 주세요.</p></div>'))
  router.get('/n/stardelivery/category', (req, res) => {
    const c = starCategories.find(([, code]) => code === req.query.categoryCode)
    if (!c) return coverage(req, res, 'Page not captured', 404)
    const base = baseOf(res), list = pick(starGroups[c[1]] || [])
    const star = best(list.filter(p => p.star)), other = best(list.filter(p => !p.star))
    render(req, res, c[0], simple(base, [['스타배송', '/n/stardelivery'], [c[0]]], `스타배송 ${c[0]}`, `<div class="gm-subcats">${starCategories.map(([l, code]) => `<a href="${base}/n/stardelivery/category?categoryCode=${code}"${code === c[1] ? ' aria-current="page"' : ''}>${esc(l)}</a>`).join('')}</div>
${star.length ? shelfRow(base, star) : `<div class="gm-noresult"><p><strong>${esc(c[0])} 스타배송 상품을 준비 중입니다.</strong></p></div>`}${other.length ? `<h2 class="gm-sub-title">${esc(c[0])} 일반배송 인기상품</h2>${shelfRow(base, other.slice(0, 10))}` : ''}`))
  })
  router.get('/n/stardelivery/search', (req, res) => res.redirect(`${baseOf(res)}/n/search?keyword=${encodeURIComponent(typeof req.query.keyword === 'string' ? req.query.keyword : '')}&star=1`))

  const emartNav = base => tabs(base, [['홈', '/n/emartmall'], ['브랜드', '/n/emartmall/brand'], ['베스트', '/n/emartmall/best'], ['행사중', '/n/emartmall/sale?promotionCode=1'], ['자주구매', '/n/emartmall/frequent']], '', '이마트몰 메뉴')
  const emartPromo = code => { const g = best(grocery()); return code === '3' ? [...shelf.filter(p => p.emart), ...g.filter(p => !p.emart)].slice(0, 15) : g.filter((p, i) => i % 4 === (Number(code) || 1) % 4) }
  const emartTabs = [['All', []], ['정육/계란', [[F, [4]]]], ['과일', [[F, [1]]]], ['냉동/간편식', [[P, [1]]]], ['쌀/잡곡', [[F, [3]]]], ['채소/두부', [[F, [2]]]], ['라면/즉석식품', [[P, [4]]]], ['생수/음료', [[P, [3]]]]]
  page('/n/emartmall', '이마트몰', base => `${crumbs(base, [['이마트몰']])}<h1 class="gm-page-title emart">이마트몰</h1>${emartNav(base)}<div class="gm-subcats">${emartCategories.map(([l, c]) => `<a href="${base}/n/emartmall/category?categoryCode=${c}">${esc(l)}</a>`).join('')}</div>
${[['지금 잘 나가는 신선식품 베스트는?', '/n/emartmall/best', () => best(pick([[F, []]]))], ["'하나 더' 인기 상품", '/n/emartmall/sale?promotionCode=1', () => emartPromo('1')], ["대한민국 장보기 국민반장 '오반장'", '/n/emartmall/sale?promotionCode=3', () => emartPromo('3')], ['새로운 별미, SSG ONLY', '/n/emartmall/sale?promotionCode=5', () => emartPromo('5')], ['믿고 장보는 공식 브랜드', '/n/emartmall/brand', () => best(grocery().filter(p => p.brand))], ['이마트몰 BEST', '/n/emartmall/best', () => best(grocery())]].map(([t, p, list]) => `<section class="gm-home-sec">${sectionHead(esc(t), p, base)}${shelfRow(base, list().slice(0, 5))}</section>`).join('')}<section class="gm-panel"><h3>다양한 혜택받고 이마트몰로 장보기!</h3><p class="gm-muted">이마트몰 상품은 G마켓에서 신선식품과 생필품을 함께 주문할 수 있는 장보기 서비스입니다.</p></section>`)
  page('/n/emartmall/best', '이마트몰 BEST', (base, req) => {
    const tab = emartTabs[Number(req.query.tab)] ? Number(req.query.tab) : 0
    const list = tab ? best(pick(emartTabs[tab][1])) : best(grocery())
    return simple(base, [['이마트몰', '/n/emartmall'], ['베스트']], '이마트몰 BEST', `${emartNav(base)}${tabs(base, emartTabs.map(([l], i) => [l, `/n/emartmall/best${i ? `?tab=${i}` : ''}`]), `/n/emartmall/best${tab ? `?tab=${tab}` : ''}`)}${shelfRow(base, list, { ranked: true })}`)
  })
  page('/n/emartmall/brand', '이마트몰 브랜드', base => simple(base, [['이마트몰', '/n/emartmall'], ['브랜드']], '믿고 장보는 공식 브랜드', `${emartNav(base)}<div class="gm-subcats">${[...new Set(best(grocery()).map(p => p.brand).filter(Boolean))].slice(0, 16).map(b => `<a href="${base}/n/search?keyword=${encodeURIComponent(b)}">${esc(b)}</a>`).join('')}</div>${shelfRow(base, best(grocery().filter(p => p.brand)).slice(0, 20))}`))
  page('/n/emartmall/frequent', '자주구매', base => simple(base, [['이마트몰', '/n/emartmall'], ['자주구매']], '자주구매', `${emartNav(base)}<p class="gm-panel gm-muted">로그인하면 자주 구매한 이마트몰 상품을 모아볼 수 있습니다. <a href="${base}/LogIn/LogIn">로그인</a></p>`))
  router.get('/n/emartmall/sale', (req, res) => {
    const label = emartPromotions[req.query.promotionCode] || '행사중', base = baseOf(res)
    render(req, res, label, simple(base, [['이마트몰', '/n/emartmall'], [label]], `이마트몰 ${label}`, `${emartNav(base)}${tabs(base, Object.entries(emartPromotions).map(([k, l]) => [l, `/n/emartmall/sale?promotionCode=${k}`]), `/n/emartmall/sale?promotionCode=${req.query.promotionCode}`)}${shelfRow(base, emartPromo(req.query.promotionCode))}`))
  })
  router.get('/n/emartmall/category', (req, res) => {
    const c = emartCategories.find(([, code]) => code === req.query.categoryCode)
    if (!c) return coverage(req, res, 'Page not captured', 404)
    const base = baseOf(res)
    render(req, res, c[0], simple(base, [['이마트몰', '/n/emartmall'], [c[0]]], c[0], `${emartNav(base)}${collection(base, '/n/emartmall/category', { categoryCode: c[1] }, best(pick(emartGroups[c[1]] || [])), req.query, { emptyText: `이마트몰 ${c[0]} 상품이 없습니다.` })}`))
  })

  page('/n/smilehome', '쿠폰/출첵', base => {
    const days = ['일', '월', '화', '수', '목', '금', '토'], now = new Date(Date.now() + 9 * 3600e3)
    const week = Array.from({ length: 7 }, (_, i) => new Date(now.getTime() + (i - 1) * 864e5))
    return `${crumbs(base, [['쿠폰/출첵']])}<h1 class="gm-page-title">스마일홈</h1><div class="gm-two"><section class="gm-panel"><h2>출석체크</h2><a class="gm-link-small" href="${base}/n/smilehome#calendar">달력보기</a><ol class="gm-week" id="calendar">${week.map((d, i) => `<li${i === 1 ? ' aria-current="date"' : ''}><span>${d.getUTCMonth() + 1}/${d.getUTCDate()}</span>${days[d.getUTCDay()]}</li>`).join('')}</ol><form method="get" action="${base}/LogIn/LogIn"><button class="gm-btn wide">출첵하고캐시받기</button></form></section>
<section class="gm-panel"><h2>나의 캐시</h2><p class="gm-muted">로그인하고 더 많은 혜택 받아가세요!</p><p><a class="gm-btn outline" href="${base}/myg/coupons">내 쿠폰함</a> <a class="gm-btn outline" href="${base}/myg/cash">스마일캐시</a></p></section></div>
<section class="gm-home-sec">${sectionHead('쿠폰팩 모음', '/myg/coupons', base, '쿠폰 더보기')}<div class="gm-coupons">${['디지털/가전 할인 쿠폰', '신선마켓 장보기 쿠폰', '맞춤별 건강식품 쿠폰'].map(t => `<div class="gm-coupon"><strong>${t}</strong><span>할인 조건은 쿠폰 받기 화면에서 확인</span><a href="${base}/LogIn/LogIn">쿠폰 받기</a></div>`).join('')}</div><p class="gm-more"><a href="${base}/myg/coupons">쿠폰 더보기 ›</a></p></section>`
  })
  page('/n/showroom/membership', '꼭 멤버십', base => simple(base, [['꼭 멤버십']], '꼭 멤버십', `<section class="gm-member-hero"><p class="gm-hero-title">도착보장! 꼭 멤버십은 무료반품</p><p>스타배송 도착보장 상품을 부담 없이 주문하세요.</p></section><div class="gm-quick">${[['무료반품', '스타배송 상품 무료반품'], ['전용 쿠폰', '멤버십 회원 전용 할인 쿠폰'], ['전용 상담', `멤버십 전용 고객센터 ${company.membershipPhone}`]].map(([t, d]) => `<div class="gm-panel"><h2>${t}</h2><p class="gm-muted">${d}</p></div>`).join('')}</div><p class="gm-muted">요금, 가입 조건 및 혜택 세부 내용은 수집되지 않았습니다.</p>`))
  page('/n/showroom/ggokcard', '꼭 현대카드', base => simple(base, [['꼭 현대카드']], '꼭 현대카드', '<div class="gm-panel"><p>G마켓 제휴 신용카드 꼭 현대카드 안내 페이지입니다. 적립률, 연회비, 이벤트 조건은 수집되지 않았습니다.</p></div>'))
  page('/n/expressshop/home', '트레이더스', base => simple(base, [['트레이더스']], '트레이더스', `<p class="gm-muted">대용량 장보기, 트레이더스 홀세일 클럽 상품을 G마켓에서 만나보세요.</p>${shelfRow(base, best(grocery().filter(p => p.price >= 20000)).slice(0, 20))}`))
  page('/n/ecoupon', 'e쿠폰', base => {
    const d = departmentByCode(EC)
    return simple(base, [['e쿠폰']], 'e쿠폰', `<p class="gm-muted">커피, 외식, 편의점, 영화, 상품권 등 모바일 교환권을 카카오톡·문자로 받아 바로 사용할 수 있습니다.</p><div class="gm-subcats">${d.subs.map((s, i) => `<a href="${base}/n/list?category=${d.code}&amp;sub=${i + 1}">${esc(s)}</a>`).join('')}</div>${shelfRow(base, best(inDept(EC)), { ranked: true })}`)
  })
  page('/travel', '여행/항공', base => simple(base, [['여행/항공']], '여행/항공', `<div class="gm-quick">${['항공권', '해외숙소', '국내숙소', '해외여행', '레저/티켓'].map((l, i) => `<a class="gm-panel" href="${base}/n/list?category=100001005&amp;sub=${[3, 2, 1, 4, 5][i]}">${l}</a>`).join('')}</div><h2 class="gm-sub-title">레저/티켓 인기상품</h2>${shelfRow(base, best(inDept(TR)))}`))
  page('/homeshopping', '홈쇼핑 모아보기', base => simple(base, [['홈쇼핑 모아보기']], '홈쇼핑 모아보기', `${homeShopping.map(([id, l]) => `<section class="gm-panel" id="${id}"><h2>${l}</h2><p class="gm-muted">방송 편성표와 방송 상품은 각 홈쇼핑 채널에서 확인할 수 있습니다.</p></section>`).join('')}<h2 class="gm-sub-title">홈쇼핑 인기상품</h2>${shelfRow(base, best(shelf.filter(p => /홈쇼핑/.test(p.title) || p.homeshopping)))}`))
  router.get('/rpp', (req, res) => {
    const title = exhibitions[req.query.exhib]
    if (!title) return coverage(req, res, 'Page not captured', 404)
    const list = best(exhibitGroups[req.query.exhib]?.() || [])
    render(req, res, title, simple(baseOf(res), [['기획전'], [title]], title, `<section class="gm-exhibit-hero"><p class="gm-hero-title">${esc(title)}</p><p>기획전 상품 ${list.length}개</p></section>${shelfRow(baseOf(res), list)}`))
  })

  page('/cart', '장바구니', base => cartPage(base))
  router.get('/LogIn/LogIn', (req, res) => render(req, res, '로그인', loginPage(baseOf(res), { tab: req.query.tab === 'guest' ? 'guest' : 'member' })))
  router.post('/LogIn/LogIn', (req, res) => {
    const id = typeof req.body?.id === 'string' ? req.body.id.trim().toLowerCase() : ''
    const user = id && authenticate(req.storeSlug, id, req.body?.password)
    if (!user) return render(req, res, '로그인', loginPage(baseOf(res), { email: id, messages: ['아이디 또는 비밀번호를 확인해 주세요.'] }), 400)
    req.store.user = publicAccount(user)
    res.redirect(`${baseOf(res)}/myg`)
  })
  router.post('/LogIn/LogOut', (req, res) => { req.store.user = null; res.redirect(`${baseOf(res)}/`) })
  page('/signup', '회원가입', base => signupPage(base))
  router.post('/signup', (req, res) => {
    const v = Object.fromEntries(['email', 'first_name', 'phone', 'terms'].map(k => [k, typeof req.body?.[k] === 'string' ? req.body[k].trim() : '']))
    v.email = v.email.toLowerCase()
    const password = typeof req.body?.password === 'string' ? req.body.password : '', messages = []
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) messages.push('올바른 이메일 주소를 입력해 주세요.')
    if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/\d/.test(password)) messages.push('비밀번호는 영문과 숫자를 포함해 8자 이상 입력해 주세요.')
    if (!v.first_name) messages.push('이름을 입력해 주세요.')
    if (!/^01[016789]-?\d{3,4}-?\d{4}$/.test(v.phone)) messages.push('올바른 휴대폰 번호를 입력해 주세요.')
    if (v.terms !== '1') messages.push('필수 약관에 동의해 주세요.')
    if (messages.length) return render(req, res, '회원가입', signupPage(baseOf(res), v, messages), 400)
    const user = createAccount(req.storeSlug, { email: v.email, password, first_name: v.first_name, phone: v.phone })
    if (user?.error) return render(req, res, '회원가입', signupPage(baseOf(res), v, ['이미 가입된 아이디입니다. 로그인해 주세요.']), 400)
    req.store.user = publicAccount(user)
    res.redirect(`${baseOf(res)}/myg`)
  })
  router.get('/myg', (req, res) => render(req, res, '나의 G마켓', mygPage(baseOf(res), req.store.user)))
  router.get('/myg/:section', (req, res) => {
    if (!mySections.some(([id]) => id === req.params.section)) return coverage(req, res, 'Page not captured', 404)
    const label = mySections.find(([id]) => id === req.params.section)[1]
    let body = mygPage(baseOf(res), req.store.user, req.params.section)
    if (req.params.section === 'orders' && typeof req.query.cartNo === 'string' && req.query.cartNo.trim()) body = body.replace('<h1 class="gm-page-title">주문/배송조회</h1>', `<h1 class="gm-page-title">주문/배송조회</h1><div class="gm-alert" role="status"><p>입력하신 장바구니 번호 ${esc(req.query.cartNo.trim())}의 주문 내역을 찾을 수 없습니다. 주문자 이름, 휴대폰 번호, 장바구니 번호를 다시 확인해 주세요.</p></div>`)
    render(req, res, label, body)
  })

  page('/help', '고객센터', base => helpMain(base))
  router.get('/help/faq/:topic', (req, res) => {
    const t = faqTopics.find(([id]) => id === req.params.topic)
    if (!t) return coverage(req, res, 'Page not captured', 404)
    const base = baseOf(res)
    render(req, res, `${t[1]} 자주 묻는 질문`, `${crumbs(base, [['고객센터', '/help'], [t[1]]])}${sidebarPage(base, '고객센터', helpNav, `/help/faq/${t[0]}`, `<h1 class="gm-page-title">${t[1]}</h1><h2 class="gm-sub-title">자주 묻는 질문</h2><div class="gm-faq">${t[2].map(q => `<details class="gm-panel"><summary>Q. ${esc(q)}</summary><p>답변 원문은 수집되지 않았습니다. 자세한 안내는 고객센터(${company.phone}, ${company.hours})로 문의해 주세요.</p></details>`).join('')}</div>`)}`)
  })
  router.get('/help/search', (req, res) => coverage(req, res, 'Search has not been captured'))
  page('/help/notice', '공지사항', base => `${crumbs(base, [['고객센터', '/help'], ['공지사항']])}${sidebarPage(base, '고객센터', helpNav, '/help/notice', `<h1 class="gm-page-title">공지사항</h1><ul class="gm-notice-list">${notices.map(([id, t, d]) => `<li><a href="${base}/help/notice/${id}">${esc(t)}</a><span>${d}</span></li>`).join('')}</ul>`)}`)
  router.get('/help/notice/:id', (req, res) => {
    const n = notices.find(([id]) => id === req.params.id)
    if (!n) return coverage(req, res, 'Page not captured', 404)
    const base = baseOf(res)
    render(req, res, n[1], `${crumbs(base, [['고객센터', '/help'], ['공지사항', '/help/notice'], [n[1]]])}<article class="gm-panel"><h1 class="gm-page-title">${esc(n[1])}</h1><p class="gm-muted">${n[2]}</p><p>${esc(n[3])}</p><p><a href="${base}/help/notice">목록</a></p></article>`)
  })
  page('/help/inquiry', '1:1 문의하기', base => `${crumbs(base, [['고객센터', '/help'], ['1:1 문의하기']])}${sidebarPage(base, '고객센터', helpNav, '/help/inquiry', `<h1 class="gm-page-title">1:1 문의하기</h1><div class="gm-panel"><p>문의글 작성은 로그인 후 이용할 수 있습니다. 주문 관련 문의는 주문/배송조회에서 해당 주문을 선택해 접수해 주세요.</p><p><a class="gm-btn" href="${base}/LogIn/LogIn">로그인</a> <a class="gm-btn outline" href="${base}/myg/inquiries">나의 문의내역</a></p></div>`)}`)
  page('/help/accessibility', '웹접근성 신고센터', base => simple(base, [['고객센터', '/help'], ['웹접근성 신고센터']], '웹접근성 신고센터', '<div class="gm-panel"><p>G마켓 이용 중 화면낭독기, 키보드 이용 등 웹 접근성과 관련한 불편 사항을 신고할 수 있습니다. 접수된 내용은 확인 후 개선에 반영합니다.</p></div>'))

  router.get('/terms-policy/:slug', (req, res) => {
    const p = policies.find(([id]) => id === req.params.slug)
    if (!p) return coverage(req, res, 'Page not captured', 404)
    const base = baseOf(res)
    render(req, res, p[1], `${crumbs(base, [['약관 및 정책'], [p[1]]])}${sidebarPage(base, 'Policy', policies.map(([id, l]) => [l, `/terms-policy/${id}`]), `/terms-policy/${p[0]}`, `<h1 class="gm-page-title">${p[1]}</h1><div class="gm-policy">${policyBody[p[0]]}<p class="gm-muted">이 페이지는 실제 약관의 구조를 요약한 것이며 전문이 아닙니다.</p></div>`)}`)
  })
  for (const [path, [title, inner]] of Object.entries(infoPages)) page(`/${path}`, title, base => simple(base, [[title]], title, `<div class="gm-panel gm-policy">${inner}</div>`))
  page('/sitemap', '사이트맵', base => sitemapPage(base))
  router.get('/sitemap.xml', (req, res) => res.type('application/xml').send(sitemapXml(baseOf(res))))
}

// Search results mix the shelf with the captured observations by relevance
// (searchShelf ranks GTA queries' observations first). `hits` is that ranked list.
export function searchPage(base, query, hits, raw = {}) {
  const shelfHits = hits.filter(p => p.purchase !== 'unverified'), observed = hits.filter(p => p.purchase === 'unverified')
  const obsAt = observed.length && hits.indexOf(observed[0]) === 0 ? 0 : 4
  return `${crumbs(base, [['검색결과']])}<h1 class="gm-page-title"><strong class="gm-green">‘${esc(query)}’</strong> 검색 결과</h1>
<nav class="gm-pill-tabs" aria-label="검색 구분"><a href="${base}/n/search?keyword=${encodeURIComponent(query)}"${raw.star !== '1' ? ' aria-current="page"' : ''}>전체</a><a href="${base}/n/search?keyword=${encodeURIComponent(query)}&amp;star=1"${raw.star === '1' ? ' aria-current="page"' : ''}>스타배송</a></nav>
<h2 class="sr-only">검색된 상품</h2>${resultsBlock(base, { path: '/n/search', params: { keyword: query }, list: shelfHits, observations: observed, query: { ...raw, obsAt }, observedCard: p => card(base, p), emptyText: `‘${query}’에 대한 검색결과가 없습니다.` })}`
}

export function productPage(base, p) {
  return `${crumbs(base, [['디지털/가전', '/n/list?category=100001007'], ['게임', '/n/list?category=100001007&sub=1']])}<section class="gm-item" data-purchase-evidence="unverified"><div class="gm-item-art">${art(p)}</div><div class="gm-item-info"><p class="gm-seller-line"><a href="${base}/n/search?keyword=ps5gta6">${esc(p.seller)}</a></p><h1>${esc(p.title)}</h1><p class="gm-price big"><strong>${won(p.price).replace('원', '')}</strong>원</p><dl class="gm-dl"><dt>상품번호</dt><dd>${esc(p.id)}</dd><dt>판매자</dt><dd>${esc(p.seller)}</dd><dt>배송</dt><dd>확인되지 않음</dd></dl><div class="gm-alert"><p>공개 검색에서 확인한 상품 정보입니다. 성인 본인인증 이후 상품 페이지, 재고, 에디션, 상품 구성 및 결제 과정은 확인되지 않았습니다.</p></div><p><a class="gm-btn outline" href="${base}/n/search?keyword=ps5gta6">검색으로 돌아가기</a></p></div></section>
<nav class="gm-item-tabs" aria-label="상품 상세"><a href="#info">상품정보</a><a href="#review">상품평</a><a href="#qna">상품문의</a><a href="#policy">배송/교환/반품 안내</a></nav><section class="gm-panel" id="info"><h2>상품정보</h2><p class="gm-muted">상세 설명은 수집되지 않았습니다.</p></section><section class="gm-panel" id="review"><h2>상품평</h2><p class="gm-muted">상품평은 수집되지 않았습니다.</p></section><section class="gm-panel" id="qna"><h2>상품문의</h2><p class="gm-muted">상품문의는 수집되지 않았습니다.</p></section><section class="gm-panel" id="policy"><h2>배송/교환/반품 안내</h2><p><a href="${base}/help/faq/delivery">배송 자주 묻는 질문</a> · <a href="${base}/help/faq/returns">취소/반품/교환 자주 묻는 질문</a></p></section>`
}
