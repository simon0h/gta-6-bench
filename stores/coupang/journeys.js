import { authenticate, createAccount, publicAccount } from '../../lib/accounts.js'
import { esc, money } from '../../lib/html.js'
import { itemEta, invalidateCheckout } from './commerce.js'
import { GAME } from '../../lib/catalog.js'
import { retailState, rememberProduct, toggleFavorite, saveAddress, deleteAddress, defaultAddress, ownedOrders, ownedOrder, orderStatus, requestOrderAction, createSupportCase, addProductQuestion } from '../../lib/retail-state.js'
import { products, bySku, media, tiles } from './catalog.js'

const BASE = '/coupang'
const text = value => typeof value === 'string' ? value.trim() : ''
const won = amount => money(amount, 'KRW')
const date = value => new Date(value).toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul', year: 'numeric', month: 'long', day: 'numeric' })
const statusName = order => ({ processing: '주문 접수', cancelled: '취소 완료', delivered: '배송 완료', return_requested: '반품 접수' }[orderStatus(order)] || '상태 확인 필요')
const notice = message => message ? `<p class="notice" role="status">${esc(message)}</p>` : ''
const errorsHTML = errors => errors.length ? `<div class="errors" role="alert"><strong>입력 내용을 확인해 주세요.</strong><ul>${errors.map(error => `<li>${esc(error)}</li>`).join('')}</ul></div>` : ''
const field = (name, label, values = {}, type = 'text', autocomplete = '') => `<div class="field"><label for="${name}">${label}</label><input id="${name}" name="${name}" type="${type}" value="${esc(values[name])}"${autocomplete ? ` autocomplete="${autocomplete}"` : ''}></div>`
const phoneValue = value => text(value).replace(/[\s()-]/g, '').replace(/^\+82/, '0')
const validPhone = value => /^0(?:10\d{8}|1[16789]\d{7,8}|2\d{7,8}|[3-6]\d\d{7,8}|70\d{8})$/.test(phoneValue(value))
const hidden = (name, value) => `<input type="hidden" name="${name}" value="${esc(value)}">`

// Only allow same-store GET destinations. Do not replay mutating requests after login.
export function safeReturn(value, fallback = `${BASE}/account`) {
  const raw = text(value)
  if (!raw.startsWith(`${BASE}/`) || /[\\\r\n]/.test(raw)) return fallback
  try {
    const url = new URL(raw, 'http://local')
    if (url.origin !== 'http://local' || !/^\/coupang\/(?:account(?:\/(?:orders(?:\/[a-zA-Z0-9-]+(?:\/tracking)?)?|returns|addresses(?:\/[a-zA-Z0-9-]+\/edit|\/new)?|wishlist|recent|preferences))?|checkout|cart|vp\/products\/[a-zA-Z0-9-]+|help(?:\/inquiries(?:\/[a-zA-Z0-9-]+)?|\/articles\/[a-zA-Z0-9-]+)?)$/.test(url.pathname)) return fallback
    return `${url.pathname}${url.search}${url.hash}`
  } catch { return fallback }
}
export function needsMember(req, res, next) {
  if (req.store.user) return next()
  const readTarget = req.originalUrl === `${BASE}/checkout/order` ? `${BASE}/checkout` : req.originalUrl.replace(/\/(?:action|reorder|delete|default)$/, '')
  req.store.authReturn = safeReturn(req.method === 'GET' ? req.originalUrl : readTarget, `${BASE}/account`)
  res.redirect(`${BASE}/login`)
}
export function customerOrders(req) {
  return req.store.user ? ownedOrders(req, 'coupang').filter(order => order.customer.account_id === req.store.user.id).reverse() : []
}
export function customerOrder(req, id) {
  const order = ownedOrder(req, id, 'coupang')
  return req.store.user && order?.customer.account_id === req.store.user.id ? order : null
}
export function rememberViewed(req, id) { rememberProduct(req, id) }
export function checkoutAddressValues(req) {
  const saved = text(req.query.address) ? retailState(req).addresses.find(a => a.id === text(req.query.address)) : defaultAddress(req)
  if (!saved) return {}
  return { recipient: saved.name, phone: saved.phone, postcode: saved.postal_code, city: saved.city, address: saved.line1, address_detail: saved.line2 }
}
export function checkoutAddressLinks(req) {
  const addresses = retailState(req).addresses
  return `<div class="checkout-addresses"><p><a href="${BASE}/account/addresses/new?returnTo=${encodeURIComponent(`${BASE}/checkout`)}">새 배송지 저장</a> · <a href="${BASE}/account/addresses">배송지 관리</a></p>${addresses.length ? `<p class="hint">배송지를 선택하면 받는사람정보에 불러옵니다.</p><div>${addresses.map(a => `<a href="${BASE}/checkout?address=${encodeURIComponent(a.id)}">${esc(a.label || a.name)}${a.is_default ? ' (기본)' : ''}</a>`).join('')}</div>` : '<p class="hint">저장된 배송지가 없습니다. 아래에 직접 입력할 수 있습니다.</p>'}</div>`
}
export function productJourneyControls(req, product) {
  const saved = retailState(req).favorites.includes(product.id)
  const target = `${BASE}/vp/products/${product.id}?sku=${encodeURIComponent(product.sku)}`
  return `<div class="product-save"><form method="post" action="${BASE}/account/wishlist/toggle">${hidden('product_id', product.id)}${hidden('returnTo', target)}<button class="secondary" aria-pressed="${saved}">${saved ? '♥ 찜한 상품 해제' : '♡ 찜하기'}</button></form><a href="${BASE}/account/wishlist">찜한 상품</a><a href="${BASE}/account/recent">최근 본 상품</a></div>`
}
export function productQuestions(req, product, errors = [], value = '') {
  const questions = retailState(req).questions[product.id] || []
  const target = `${BASE}/vp/products/${product.id}?sku=${encodeURIComponent(product.sku)}&tab=questions#my-questions`
  return `<section id="my-questions" class="my-questions"><h3>내 상품문의</h3><p class="hint">연락처, 주소, 결제정보는 남기지 마세요. 등록한 문의는 이 계정의 문의함에 보관되며 판매자에게 전송되지 않습니다.</p>${errorsHTML(errors)}${req.store.user ? `<form method="post" action="${BASE}/vp/products/${product.id}/questions">${hidden('sku', product.sku)}<div class="field"><label for="product-question">문의 내용 (5–1,500자)</label><textarea id="product-question" name="message" rows="4" maxlength="1500">${esc(value)}</textarea></div><button>상품문의 등록</button></form>` : `<a class="button secondary" href="${BASE}/login?returnTo=${encodeURIComponent(target)}">로그인하고 문의하기</a>`}${questions.length ? questions.map(q => `<article class="question-row"><strong>답변 대기</strong><time>${date(q.created_at)}</time><p>${esc(q.message)}</p></article>`).join('') : '<p>등록한 상품문의가 없습니다.</p>'}</section>`
}

const accountLinks = [['', '마이쿠팡 홈'], ['/orders', '주문목록 / 배송조회'], ['/returns', '취소 / 반품 내역'], ['/wishlist', '찜한 상품'], ['/recent', '최근 본 상품'], ['/addresses', '배송지 관리'], ['/preferences', '회원정보 / 알림 설정']]
function accountPage(req, title, content, active = '') {
  return `<p class="crumb"><a href="${BASE}">홈</a> &gt; <a href="${BASE}/account">마이쿠팡</a> &gt; ${esc(title)}</p><div class="my-coupang"><aside class="my-sidebar"><a class="my-title" href="${BASE}/account">MY 쿠팡</a><nav aria-label="마이쿠팡 메뉴">${accountLinks.map(([path,label])=>`<a href="${BASE}/account${path}"${active === path ? ' aria-current="page"' : ''}>${label}</a>`).join('')}<a href="${BASE}/help/inquiries">문의내역</a><a href="${BASE}/help">고객센터</a></nav>${req.store.user ? `<form action="${BASE}/logout" method="post"><button class="link-button">로그아웃</button></form>` : `<a href="${BASE}/login?returnTo=${encodeURIComponent(`${BASE}/account${active}`)}">로그인</a>`}</aside><section class="my-content"><h1>${esc(title)}</h1>${content}</section></div>`
}
function orderLines(order) {
  return order.items.map(item => { const product = bySku(item.sku); return `<article class="order-line">${product ? `<a href="${BASE}/vp/products/${product.id}?sku=${encodeURIComponent(product.sku)}" class="order-photo">${media(BASE, product)}</a>` : ''}<div><a href="${product ? `${BASE}/vp/products/${product.id}?sku=${encodeURIComponent(product.sku)}` : `${BASE}/account/orders`}">${esc(item.title)}</a><p>${esc(product?.label || item.sku)} · ${item.qty}개</p>${product?`<p class="item-eta">${orderStatus(order)==='cancelled'?'취소된 상품 · 배송이 진행되지 않습니다.':itemEta(item)}</p>`:''}<strong>${won(item.unit_price * item.qty)}</strong></div></article>` }).join('')
}
function orderCard(order) {
  return `<article class="order-card"><div class="order-heading"><strong>${date(order.created_at)} 주문</strong><span>주문번호 ${esc(order.order_number)}</span><a href="${BASE}/account/orders/${order.order_number}">주문 상세보기 ›</a></div><div class="order-card-body"><h3>${statusName(order)}</h3><p class="hint">${orderStatus(order) === 'cancelled' ? '주문 취소가 기록되었습니다.' : esc(order.fulfillment.eta)}</p>${orderLines(order)}<div class="actions"><a class="button secondary" href="${BASE}/account/orders/${order.order_number}/tracking">배송조회</a><a href="${BASE}/account/orders/${order.order_number}">취소 / 다시 구매</a></div></div></article>`
}
const emptyOrders = `<div class="my-empty"><h2>주문한 상품이 없습니다.</h2><p>이 계정으로 이 브라우저에서 주문한 상품을 확인할 수 있습니다.</p><a class="button" href="${BASE}/np/campaigns/gold-box">오늘의 상품 둘러보기</a></div>`

const articles = [
  { id: 'delivery', category: '배송', title: '주문한 상품의 배송 상태는 어디서 확인하나요?', body: ['마이쿠팡의 주문목록에서 상품을 선택한 뒤 배송조회를 눌러 주세요.', '예약상품은 상품에 표시된 출시일 이후 순차 배송됩니다. 로켓배송, 로켓프레시, 판매자 배송 상품은 도착 예정이 다를 수 있습니다.', '이 환경에서는 택배사와 연결되지 않습니다. 주문 접수 이후 실제 출고나 배송 완료 상태가 자동으로 생성되지는 않습니다.'], link: '/account/orders', label: '주문목록 / 배송조회' },
  { id: 'cancel', category: '취소 / 반품', title: '주문한 상품을 취소하고 싶어요.', body: ['주문 상세에서 주문 취소를 선택하고 사유를 입력해 주세요. 주문 접수 상태에서 전체 주문을 취소할 수 있습니다.', '이미 취소한 주문은 다시 취소해도 중복 처리되지 않습니다. 실제 카드 청구나 환불은 발생하지 않습니다.'], link: '/account/orders', label: '취소할 주문 찾기' },
  { id: 'returns', category: '취소 / 반품', title: '반품 신청은 언제 할 수 있나요?', body: ['배송이 완료된 주문에서 반품을 신청할 수 있습니다. 아직 주문 접수 상태라면 주문 취소를 이용해 주세요.', '다운로드 코드를 사용했거나 상품을 개봉한 경우, 식품의 포장을 훼손한 경우 등에는 반품이 제한될 수 있습니다. 상품 상세의 조건을 먼저 확인해 주세요.', '이 환경은 실제 배송을 진행하지 않아 새 주문은 배송 완료로 전환되지 않습니다. 수거 예약과 실제 환불은 지원하지 않습니다.'], link: '/account/returns', label: '취소 / 반품 내역' },
  { id: 'address', category: '배송', title: '배송지를 저장하거나 변경하고 싶어요.', body: ['마이쿠팡의 배송지 관리에서 받는 사람, 연락처와 대한민국 주소를 저장할 수 있습니다. 기본 배송지는 다음 결제에 자동으로 불러옵니다.', '결제 화면에서는 다른 저장 배송지를 선택하거나 직접 수정할 수 있습니다. 주문 완료 후 주소 변경은 지원하지 않으므로 주문 접수 상태에서 취소하고 다시 주문해 주세요.'], link: '/account/addresses', label: '배송지 관리' },
  { id: 'payment', category: '결제', title: '사용할 수 있는 결제수단과 결제금액이 궁금해요.', body: ['신용 / 체크카드로 결제할 수 있으며 표시된 가격은 부가세가 포함된 원화 금액입니다. 현재 상품의 배송비는 무료입니다.', '쿠페이, 무통장입금, 할부, 카드사 인증, 현금영수증 발급은 연결되지 않습니다. 쿠폰이 없는 상품에는 표시된 판매가가 적용됩니다.'], link: '/cart', label: '장바구니 확인' },
  { id: 'damaged', category: '상품', title: '상품이 파손되거나 다른 상품이 도착했어요.', body: ['주문한 상품명과 옵션을 확인하고 상품과 포장 상태를 보관해 주세요. 주문번호를 선택하여 문의를 남길 수 있습니다.', '문의는 내 문의내역에 접수 상태로 저장됩니다. 실제 고객센터나 판매자에게 전송되지 않으며 수거 기사 배정과 실시간 상담은 지원하지 않습니다.'], link: '/help/inquiries/new', label: '문의 남기기' },
  { id: 'preorder', category: '상품', title: '예약판매 게임은 어떤 구성이고 언제 배송되나요?', body: [`GTA VI의 두 플랫폼 상품은 모의 예약판매 상품이며 ${GAME.release_date} 출시일 이후 순차 배송으로 표시됩니다. 실제 판매나 재고를 보장하지 않습니다.`, '선택한 플랫폼용 다운로드 코드가 담긴 박스 구성으로 디스크는 포함되지 않습니다. 구매 전에 플랫폼과 구성 정보를 확인해 주세요.'], link: '/np/categories/games', label: '게임 / 게임기 둘러보기' },
  { id: 'account', category: '회원정보', title: '회원가입과 로그인은 어떻게 하나요?', body: ['이메일과 비밀번호로 가입하고 로그인할 수 있습니다. 회원정보와 배송지, 찜 목록은 이 브라우저의 계정별로 구분됩니다.', '휴대폰 인증, QR 로그인, 패스키와 외부 계정 연결은 제공하지 않습니다. 실제 쿠팡 계정과 연결되지 않습니다.'], link: '/register', label: '회원가입' },
  { id: 'password', category: '회원정보', title: '아이디나 비밀번호를 잊어버렸어요.', body: ['가입할 때 사용한 이메일 주소로 로그인해 주세요. 저장된 로그인 정보가 있다면 입력한 이메일을 먼저 확인해 주세요.', '직접 만든 계정의 이메일이나 비밀번호를 찾는 문자 / 이메일 인증은 연결되어 있지 않습니다. 새 로컬 계정을 만들 수 있지만 기존 계정의 주문과 저장 정보는 이전되지 않습니다.'], link: '/login', label: '로그인으로 이동' },
  { id: 'wishlist', category: '회원정보', title: '찜한 상품과 최근 본 상품을 다시 보고 싶어요.', body: ['상품 상세에서 찜하기를 선택하면 마이쿠팡의 찜한 상품 목록에 저장됩니다. 찜 목록에서는 삭제하거나 상품 옵션을 다시 선택할 수 있습니다.', '최근 본 상품은 최대 24개까지 최신순으로 보관됩니다. 로그인 전 목록과 계정별 목록은 각각 보관되며 목록을 비울 수도 있습니다.'], link: '/account/wishlist', label: '찜한 상품 보기' },
  { id: 'fresh', category: '배송', title: '로켓프레시 상품은 어떻게 보관하나요?', body: ['냉장 상품은 수령한 뒤 포장을 열어 바로 냉장 보관하고 포장의 소비기한과 보관방법을 확인해 주세요.', '모의 상품 상세에는 1–2일 도착 예정으로 안내됩니다. 실제 배송 시간을 지정하거나 문 앞 사진을 조회하는 기능은 지원하지 않습니다.'], link: '/np/campaigns/rocket-fresh', label: '로켓프레시 상품 보기' },
  { id: 'options', category: '상품', title: '선택한 용량이나 색상 옵션을 확인하고 싶어요.', body: ['상품 상세의 구성 / 옵션에서 원하는 수량, 용량, 색상 또는 사이즈를 고른 다음 옵션 선택을 눌러 주세요.', '선택한 옵션과 가격은 장바구니와 주문 상세에 표시됩니다. 이미 담은 옵션을 바꾸려면 장바구니에서 삭제하고 원하는 옵션을 다시 담아 주세요.'], link: '/cart', label: '장바구니 확인' },
]
articles.push({ id: 'terms-privacy', category: '회원정보', title: '이용약관 및 개인정보 처리 안내', body: ['회원가입 시 이메일, 이름과 연락처를 입력합니다. 배송지와 문의내역은 해당 계정의 화면에서 확인할 수 있습니다.', '이 사이트는 모의 쇼핑 환경이며 실제 쿠팡과 연결되지 않습니다. 주문은 실제 구매 계약이나 카드 결제를 발생시키지 않습니다.', '계정 정보와 저장 목록은 서버 실행 및 브라우저 세션 범위에서만 유지됩니다. 주소는 배송지 관리에서, 최근 본 상품은 해당 목록에서 삭제할 수 있습니다. 실제 개인정보와 카드정보는 입력하지 마세요.'], link: '/register', label: '회원가입으로 돌아가기' })
const topics = [...new Set(articles.map(a => a.category))]
function helpNav() { return `<nav class="help-tabs"><a href="${BASE}/help">자주 묻는 질문</a><a href="${BASE}/help/inquiries/new">문의하기</a><a href="${BASE}/help/inquiries">문의내역</a><a href="${BASE}/account/orders">주문 / 배송 확인</a></nav>` }
const translateAddress = errors => errors.map(error => ({ 'Enter a recipient name.': '받는 사람 이름을 입력해 주세요.', 'Enter a street address.': '도로명 주소를 입력해 주세요.', 'Enter a city.': '시 / 도를 입력해 주세요.', 'Enter a valid postal code.': '우편번호를 숫자 5자리로 입력해 주세요.', 'Enter a contact phone number.': '연락처를 입력해 주세요.', 'Enter a valid phone number.': '올바른 대한민국 연락처를 입력해 주세요.', 'Address not found.': '배송지를 찾을 수 없습니다.', 'Remove an address before saving another.': '배송지는 최대 12개까지 저장할 수 있습니다.' }[error] || '배송지 정보를 확인해 주세요.'))

export function installJourneys(router, { render, productPage }) {
  const missing = (req, res, kind = '주문') => render(req, res, `${kind} 없음`, `<h1>요청하신 ${kind} 정보를 찾을 수 없습니다.</h1><a href="${BASE}/account">마이쿠팡으로 이동</a>`, 404)
  function resumeFavorite(req) {
    const id = req.store.pendingFavorite
    if (products.some(p => p.id === id) && !retailState(req).favorites.includes(id)) toggleFavorite(req, id)
    delete req.store.pendingFavorite
  }
  function loginPage(req, res, values = {}, errors = []) {
    const target = safeReturn(values.returnTo || req.query.returnTo || req.store.authReturn, (req.store.cart.length || req.store.buyNow) ? `${BASE}/checkout` : `${BASE}/account`)
    render(req, res, '로그인', `<section class="login panel"><h1>로그인</h1><p>쿠팡 계정으로 로그인해 주세요.</p><div class="auth-method"><strong>이메일 로그인</strong><a href="#other-login-methods">휴대폰 / QR 안내</a></div>${errorsHTML(errors)}<form method="post" action="${BASE}/login">${hidden('returnTo', target)}${field('email', '아이디 (이메일)', values, 'email', 'username')}${field('password', '비밀번호', {}, 'password', 'current-password')}<button type="button" class="password-toggle link-button" hidden aria-pressed="false">비밀번호 표시</button><button class="wide">로그인</button></form><div class="login-links"><a href="${BASE}/help/articles/password">아이디 / 비밀번호 찾기</a><a href="${BASE}/register?returnTo=${encodeURIComponent(target)}">회원가입</a></div><details id="other-login-methods"><summary>다른 로그인 방법 안내</summary><p>휴대폰 인증, QR 로그인과 패스키는 연결되어 있지 않습니다. 이메일로 로그인해 주세요.</p></details></section>`, errors.length ? 400 : 200)
  }
  router.get(['/login', '/login/login.pang'], (req, res) => req.store.user ? res.redirect(safeReturn(req.query.returnTo)) : loginPage(req, res))
  router.post('/login', (req, res) => {
    const values = { email: text(req.body.email), returnTo: safeReturn(req.body.returnTo || req.store.authReturn, (req.store.cart.length || req.store.buyNow) ? `${BASE}/checkout` : `${BASE}/account`) }
    const user = authenticate('coupang', values.email, req.body.password)
    if (!user) return loginPage(req, res, values, ['아이디 또는 비밀번호가 일치하지 않습니다.'])
    req.store.user = publicAccount(user)
    resumeFavorite(req)
    req.store.checkout = {}
    req.store.last_order = null
    delete req.store.authReturn
    res.redirect(values.returnTo)
  })
  function registerPage(req, res, values = {}, errors = []) {
    const target = safeReturn(values.returnTo || req.query.returnTo || req.store.authReturn)
    render(req, res, '회원가입', `<section class="login panel"><h1>회원가입</h1><p>회원정보를 입력해 주세요.</p>${errorsHTML(errors)}<form method="post" action="${BASE}/register">${hidden('returnTo', target)}${field('email', '아이디 (이메일)', values, 'email', 'username')}${field('password', '비밀번호 (영문과 숫자를 포함해 8자 이상)', {}, 'password', 'new-password')}${field('password_confirm', '비밀번호 확인', {}, 'password', 'new-password')}${field('first_name', '이름', values, 'text', 'name')}${field('phone', '휴대폰 번호 / 연락처', values, 'tel', 'tel')}<label class="check"><input type="checkbox" name="agree" value="yes"${values.agree === 'yes' ? ' checked' : ''}> 이용약관 및 개인정보 수집·이용에 동의합니다.</label><p><a href="${BASE}/help/articles/terms-privacy">이용약관 및 개인정보 처리 안내 보기</a></p><button class="wide">동의하고 가입하기</button></form><p><a href="${BASE}/login?returnTo=${encodeURIComponent(target)}">이미 가입하셨나요? 로그인</a></p></section>`, errors.length ? 400 : 200)
  }
  router.get('/register', (req, res) => req.store.user ? res.redirect(`${BASE}/account`) : registerPage(req, res))
  router.post('/register', (req, res) => {
    const values = Object.fromEntries(['email', 'first_name', 'phone', 'agree', 'returnTo'].map(key => [key, text(req.body[key]).slice(0, 254)]))
    const password = typeof req.body.password === 'string' ? req.body.password : ''
    const errors = []
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.push('올바른 이메일 주소를 입력해 주세요.')
    if (password.length < 8 || password.length > 128 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) errors.push('비밀번호는 영문과 숫자를 포함해 8–128자로 입력해 주세요.')
    if (password !== req.body.password_confirm) errors.push('비밀번호 확인이 일치하지 않습니다.')
    if (!values.first_name) errors.push('이름을 입력해 주세요.')
    if (!validPhone(values.phone)) errors.push('올바른 대한민국 연락처를 입력해 주세요.')
    if (values.agree !== 'yes') errors.push('회원가입 이용에 동의해 주세요.')
    if (errors.length) return registerPage(req, res, values, errors)
    const user = createAccount('coupang', { email: values.email, password, first_name: values.first_name, phone: phoneValue(values.phone) })
    if (user.error) return registerPage(req, res, values, ['이미 가입된 이메일입니다. 로그인해 주세요.'])
    req.store.user = publicAccount(user)
    resumeFavorite(req)
    req.store.checkout = {}
    req.store.last_order = null
    delete req.store.authReturn
    res.redirect(safeReturn(values.returnTo))
  })
  router.post('/logout', (req, res) => {
    delete req.store.buyNow
    delete req.store.selectedSkus
    delete req.store.checkoutCompleted
    req.store.user = null
    delete req.store.pendingFavorite
    req.store.checkout = {}
    req.store.last_order = null
    delete req.store.authReturn
    res.redirect(BASE)
  })
  router.get(['/account', '/mc'], needsMember, (req, res) => {
    const state = retailState(req), orders = customerOrders(req), active = orders.filter(o => orderStatus(o) === 'processing')
    render(req, res, '마이쿠팡', accountPage(req, '마이쿠팡', `<div class="my-welcome"><div><h2>${esc(req.store.user.first_name || '고객')}님, 안녕하세요.</h2><p>${esc(req.store.user.email)}</p></div><a href="${BASE}/account/preferences">회원정보 확인 ›</a></div><div class="my-counts"><a href="${BASE}/account/orders"><strong>${active.length}</strong>진행 중 주문</a><a href="${BASE}/account/wishlist"><strong>${state.favorites.length}</strong>찜한 상품</a><a href="${BASE}/account/addresses"><strong>${state.addresses.length}</strong>배송지</a><a href="${BASE}/help/inquiries"><strong>${state.cases.length}</strong>문의내역</a></div><div class="section-title"><h2>최근 주문</h2><a href="${BASE}/account/orders">전체보기 ›</a></div>${orders.length ? orders.slice(0, 2).map(orderCard).join('') : emptyOrders}<div class="section-title"><h2>최근 본 상품</h2><a href="${BASE}/account/recent">전체보기 ›</a></div>${state.recent.length ? tiles(BASE, state.recent.map(id => products.find(p => p.id === id)).filter(Boolean).slice(0, 4)) : `<p>상품을 둘러보면 여기에 표시됩니다. <a href="${BASE}">쇼핑하러 가기</a></p>`}`))
  })
  router.get('/account/preferences', needsMember, (req, res) => {
    const prefs = retailState(req).preferences
    render(req, res, '회원정보 / 알림 설정', accountPage(req, '회원정보 / 알림 설정', `${req.query.saved === '1' ? notice('알림 설정을 저장했습니다.') : ''}<section class="panel"><h2>회원정보</h2><dl class="spec-table"><dt>이메일</dt><dd>${esc(req.store.user.email)}</dd><dt>이름</dt><dd>${esc(req.store.user.first_name)}</dd><dt>연락처</dt><dd>${esc(req.store.user.phone)}</dd></dl><p>이메일 / 비밀번호 변경과 본인인증은 연결되어 있지 않습니다.</p></section><section class="panel"><h2>관심 소식 설정</h2><form method="post" action="${BASE}/account/preferences"><label class="check"><input type="checkbox" name="shopping_news" value="yes"${prefs.shopping_news ? ' checked' : ''}> 할인 및 추천 상품 소식 받기</label><p class="hint">선택한 알림 설정을 저장합니다. 현재 이메일 / 문자 알림 발송 서비스는 제공하지 않습니다.</p><button>설정 저장</button></form></section>`, '/preferences'))
  })
  router.post('/account/preferences', needsMember, (req, res) => { retailState(req).preferences.shopping_news = req.body.shopping_news === 'yes'; res.redirect(`${BASE}/account/preferences?saved=1`) })

  router.get('/account/wishlist', needsMember, (req, res) => {
    const saved = retailState(req).favorites.map(id => products.find(p => p.id === id)).filter(Boolean)
    render(req, res, '찜한 상품', accountPage(req, '찜한 상품', saved.length ? `<p>총 ${saved.length}개의 상품</p><div class="saved-products">${saved.map(p => `<article><a class="saved-photo" href="${BASE}/vp/products/${p.id}">${media(BASE, p)}</a><div><a href="${BASE}/vp/products/${p.id}">${esc(p.title)}</a><p><strong>${won(p.price)}</strong> · ${p.stock ? '상품 옵션을 확인하고 구매하세요.' : '일시품절'}</p><div class="actions"><a class="button secondary" href="${BASE}/vp/products/${p.id}">옵션 / 상품 보기</a><form method="post" action="${BASE}/account/wishlist/toggle">${hidden('product_id',p.id)}${hidden('returnTo',`${BASE}/account/wishlist`)}<button class="link-button">삭제</button></form></div></div></article>`).join('')}</div>` : `<div class="my-empty"><h2>찜한 상품이 없습니다.</h2><p>마음에 드는 상품 상세에서 찜하기를 눌러 주세요.</p><a href="${BASE}">상품 둘러보기</a></div>`, '/wishlist'))
  })
  router.post('/account/wishlist/toggle', (req, res, next) => {
    if (!products.some(p => p.id === text(req.body.product_id))) return missing(req, res, '상품')
    if (!req.store.user) { req.store.pendingFavorite = text(req.body.product_id); req.store.authReturn = safeReturn(req.body.returnTo, `${BASE}/account/wishlist`); return res.redirect(`${BASE}/login`) }
    next()
  }, (req, res) => { toggleFavorite(req, text(req.body.product_id)); res.redirect(safeReturn(req.body.returnTo, `${BASE}/account/wishlist`)) })
  router.get('/account/recent', (req, res) => {
    const viewed = retailState(req).recent.map(id => products.find(p => p.id === id)).filter(Boolean)
    render(req, res, '최근 본 상품', accountPage(req, '최근 본 상품', `<p>최근 본 상품을 최대 24개까지 표시합니다.</p>${viewed.length ? `<form method="post" action="${BASE}/account/recent/clear"><button class="secondary">전체 삭제</button></form>${tiles(BASE, viewed)}` : `<div class="my-empty"><h2>최근 본 상품이 없습니다.</h2><a href="${BASE}">쇼핑 계속하기</a></div>`}`, '/recent'))
  })
  router.post('/account/recent/clear', (req, res) => { retailState(req).recent = []; res.redirect(`${BASE}/account/recent`) })

  function addressForm(req, res, values = {}, errors = []) {
    const target = safeReturn(values.returnTo || req.query.returnTo, `${BASE}/account/addresses?saved=1`)
    render(req, res, values.id ? '배송지 수정' : '배송지 추가', accountPage(req, values.id ? '배송지 수정' : '배송지 추가', `${errorsHTML(errors)}<form class="panel address-form" method="post" action="${BASE}/account/addresses">${hidden('id',values.id || '')}${hidden('returnTo',target)}${field('label','배송지 이름 (선택)',values)}${field('name','받는 사람',values,'text','shipping name')}${field('phone','휴대폰 번호 / 연락처',values,'tel','shipping tel')}${field('postal_code','우편번호 (5자리)',values,'text','shipping postal-code')}${field('city','시 / 도',values,'text','shipping address-level1')}${field('line1','도로명 주소',values,'text','shipping address-line1')}${field('line2','상세주소 (선택)',values,'text','shipping address-line2')}<label class="check"><input type="checkbox" name="is_default" value="yes"${values.is_default ? ' checked' : ''}> 기본 배송지로 설정</label><p class="hint">주소 검색 서비스는 연결되어 있지 않습니다. 대한민국 주소를 직접 입력해 주세요.</p><div class="actions"><button>배송지 저장</button><a href="${BASE}/account/addresses">취소</a></div></form>`, '/addresses'), errors.length ? 400 : 200)
  }
  router.get('/account/addresses', needsMember, (req, res) => {
    const addresses = retailState(req).addresses
    render(req, res, '배송지 관리', accountPage(req, '배송지 관리', `${req.query.saved === '1' ? notice('배송지를 저장했습니다.') : ''}<p><a class="button" href="${BASE}/account/addresses/new">배송지 추가</a></p>${addresses.length ? addresses.map(a => `<article class="address-card" data-address="${esc(a.id)}"><h2>${esc(a.label || a.name)} ${a.is_default ? '<span class="address-default">기본 배송지</span>' : ''}</h2><strong>${esc(a.name)}</strong><p>${esc(a.phone)}<br>(${esc(a.postal_code)}) ${esc(a.city)} ${esc(a.line1)} ${esc(a.line2)}</p><div class="actions"><a class="button secondary" href="${BASE}/account/addresses/${a.id}/edit">수정</a>${!a.is_default ? `<form method="post" action="${BASE}/account/addresses/${a.id}/default"><button class="secondary">기본 배송지로 설정</button></form>` : ''}<form method="post" action="${BASE}/account/addresses/${a.id}/delete"><button class="link-button">삭제</button></form></div></article>`).join('') : '<div class="my-empty"><h2>저장된 배송지가 없습니다.</h2><p>자주 받는 배송지를 미리 저장해 보세요.</p></div>'}`, '/addresses'))
  })
  router.get('/account/addresses/new', needsMember, (req, res) => addressForm(req,res,{ name: req.store.user.first_name, phone: validPhone(req.store.user.phone) ? req.store.user.phone : '' }))
  router.get('/account/addresses/:id/edit', needsMember, (req, res) => {
    const address = retailState(req).addresses.find(a => a.id === req.params.id)
    if (!address) return missing(req,res,'배송지')
    addressForm(req,res,address)
  })
  router.post('/account/addresses', needsMember, (req, res) => {
    const values = Object.fromEntries(['id','label','name','phone','postal_code','city','line1','line2','is_default','returnTo'].map(key => [key,text(req.body[key])]))
    if (!validPhone(values.phone)) return addressForm(req,res,values,['올바른 대한민국 연락처를 입력해 주세요. 예: 010-1234-5678'])
    const result = saveAddress(req,{...values,phone:phoneValue(values.phone),state:values.city},{country:'KR',requirePhone:true})
    if (result.errors) return addressForm(req,res,values,translateAddress(result.errors))
    req.store.checkout = {}
    res.redirect(safeReturn(values.returnTo,`${BASE}/account/addresses?saved=1`))
  })
  router.post('/account/addresses/:id/default', needsMember, (req, res) => {
    const address = retailState(req).addresses.find(a=>a.id===req.params.id)
    if (!address) return missing(req,res,'배송지')
    saveAddress(req,{...address,is_default:'yes'},{country:'KR',requirePhone:true})
    req.store.checkout = {}
    res.redirect(`${BASE}/account/addresses`)
  })
  router.post('/account/addresses/:id/delete', needsMember, (req, res) => {
    if (!deleteAddress(req,req.params.id)) return missing(req,res,'배송지')
    req.store.checkout = {}
    res.redirect(`${BASE}/account/addresses`)
  })

  router.get(['/account/orders','/ssr/desktop/order/list'], needsMember, (req, res) => {
    const query=text(req.query.q).slice(0,160), state=['processing','cancelled','return_requested'].includes(req.query.status)?req.query.status:''
    const orders=customerOrders(req).filter(o=>(!state||orderStatus(o)===state)&&(!query||`${o.order_number} ${o.items.map(i=>i.title+' '+bySku(i.sku)?.title).join(' ')}`.toLowerCase().includes(query.toLowerCase())))
    render(req,res,'주문목록 / 배송조회',accountPage(req,'주문목록 / 배송조회',`<form class="order-search" method="get" action="${BASE}/account/orders"><label for="order-query">주문번호 또는 상품명</label><input id="order-query" name="q" value="${esc(query)}"><select name="status" aria-label="주문 상태">${[['','전체 상태'],['processing','주문 접수'],['cancelled','취소 완료'],['return_requested','반품 접수']].map(([v,l])=>`<option value="${v}"${v===state?' selected':''}>${l}</option>`).join('')}</select><button>조회</button></form>${orders.length?orders.map(orderCard).join(''):query||state?`<div class="my-empty"><p>조건에 맞는 주문이 없습니다.</p><a href="${BASE}/account/orders">전체 주문 보기</a></div>`:emptyOrders}`,'/orders'))
  })
  router.get('/account/returns',needsMember,(req,res)=>{
    const orders=customerOrders(req).filter(o=>['cancelled','return_requested'].includes(orderStatus(o)))
    render(req,res,'취소 / 반품 내역',accountPage(req,'취소 / 반품 내역',`${orders.length?orders.map(orderCard).join(''):'<div class="my-empty"><h2>취소 / 반품 내역이 없습니다.</h2><p>주문 접수 상태에서는 주문 상세에서 취소할 수 있습니다.</p></div>'}<a href="${BASE}/help/articles/returns">반품 신청 조건 확인</a>`,'/returns'))
  })
  function orderDetail(req,res,order,errors=[],values={}) {
    const state=orderStatus(order), address=order.shipping_address
    render(req,res,'주문 상세',accountPage(req,'주문 상세',`${errorsHTML(errors)}${req.query.updated==='1'?notice('주문 요청을 처리했습니다.'):''}<p class="order-number">${date(order.created_at)} · 주문번호 ${esc(order.order_number)}</p><section class="panel"><h2>${statusName(order)}</h2>${orderLines(order)}<p><a href="${BASE}/account/orders/${order.order_number}/tracking">배송조회 ›</a></p></section><section class="panel"><h2>받는사람정보</h2><p>${esc(order.customer.first_name)} · ${esc(order.customer.phone)}</p><p>(${esc(address.postal_code)}) ${esc(address.city)} ${esc(address.line1)} ${esc(address.line2)}</p><p>배송 요청사항: ${esc(order.meta.delivery_note || '없음')}</p></section><section class="panel"><h2>결제 정보</h2><dl class="spec-table"><dt>총 상품가격</dt><dd>${won(order.totals.subtotal)}</dd><dt>배송비</dt><dd>${won(order.totals.shipping)}</dd><dt>결제금액</dt><dd><strong>${won(order.totals.total)}</strong></dd><dt>결제수단</dt><dd>${esc(order.payment.brand)} · 끝 4자리 ${esc(order.payment.last4)}</dd></dl></section><section class="panel"><h2>주문 관리</h2>${state==='processing'||state==='delivered'?`<form method="post" action="${BASE}/account/orders/${order.order_number}/action"><input type="hidden" name="action" value="${state==='processing'?'cancel':'return'}"><div class="field"><label for="reason">${state==='processing'?'취소':'반품'} 사유</label><textarea id="reason" name="reason" rows="3" maxlength="1000">${esc(values.reason)}</textarea></div><p class="hint">${state==='processing'?'주문 전체를 취소합니다. 일부 상품만 취소하는 기능은 제공하지 않습니다.':'상품의 상태와 반품 조건을 확인해 주세요. 실제 수거와 환불은 진행되지 않습니다.'}</p><button class="secondary">${state==='processing'?'주문 취소':'반품 신청'}</button></form>`:state==='cancelled'?'<p>취소 완료된 주문입니다. 실제 결제 취소나 환불은 발생하지 않습니다.</p>':'<p>반품 신청이 접수되었습니다.</p>'}${state==='processing'?`<p>반품은 배송 완료 후 신청할 수 있습니다. <a href="${BASE}/help/articles/returns">반품 안내</a></p>`:''}<hr><form method="post" action="${BASE}/account/orders/${order.order_number}/reorder"><p>현재 판매 옵션과 가격으로 장바구니에 다시 담습니다. 상품별 최대 4개까지 가능합니다.</p><button>다시 장바구니에 담기</button></form><p><a href="${BASE}/help/inquiries/new?order_id=${order.order_number}">이 주문 문의하기</a></p></section>${order.meta.lifecycle?.length?`<section class="panel"><h2>처리 내역</h2>${order.meta.lifecycle.map(event=>`<p>${date(event.created_at)} · ${event.status==='cancelled'?'취소 완료':'반품 접수'}<br>${esc(event.reason)}</p>`).join('')}</section>`:''}`,'/orders'),errors.length?400:200)
  }
  router.get('/account/orders/:id',needsMember,(req,res)=>{const order=customerOrder(req,req.params.id);if(!order)return missing(req,res);orderDetail(req,res,order)})
  router.get('/account/orders/:id/tracking',needsMember,(req,res)=>{
    const order=customerOrder(req,req.params.id);if(!order)return missing(req,res)
    const state=orderStatus(order)
    render(req,res,'배송조회',accountPage(req,'배송조회',`<p>주문번호 ${esc(order.order_number)}</p><section class="panel"><h2>${statusName(order)}</h2><ol class="delivery-progress"><li class="current">주문 접수</li><li${state==='cancelled'?' class="current"':''}>${state==='cancelled'?'취소 완료':'출고 전'}</li>${state!=='cancelled'?'<li>배송 중</li><li>배송 완료</li>':''}</ol><p>${state==='cancelled'?'취소된 주문으로 배송이 진행되지 않습니다.':esc(order.fulfillment.eta)}</p><p>택배사와 운송장 번호는 아직 없습니다. 실제 배송 조회에 연결되지 않으며 출고 / 배송 완료 상태가 자동 생성되지 않습니다.</p>${orderLines(order)}</section><a href="${BASE}/account/orders/${order.order_number}">주문 상세로 돌아가기</a>`,'/orders'))
  })
  router.post('/account/orders/:id/action',needsMember,(req,res)=>{
    const order=customerOrder(req,req.params.id);if(!order)return missing(req,res)
    const action=text(req.body.action),reason=text(req.body.reason)
    const result=requestOrderAction(req,order.id,action,reason,'coupang')
    if(result.error)return orderDetail(req,res,order,[!['cancel','return'].includes(action)?'지원하는 주문 요청을 선택해 주세요.':!reason?'요청 사유를 입력해 주세요.':action==='return'?'배송 완료된 주문에서만 반품을 신청할 수 있습니다. 주문 접수 상태에서는 취소를 이용해 주세요.':'이미 출고된 주문은 취소할 수 없습니다.'],{reason})
    res.redirect(`${BASE}/account/orders/${order.order_number}?updated=1`)
  })
  router.post('/account/orders/:id/reorder',needsMember,(req,res)=>{
    const order=customerOrder(req,req.params.id);if(!order)return missing(req,res)
    const items=order.items.map(i=>({product:bySku(i.sku),qty:i.qty})), errors=[]
    for(const {product,qty} of items) {
      if(!product||!product.stock){errors.push('현재 구매할 수 없는 상품이 있어 다시 담지 못했습니다. 상품 페이지에서 다른 옵션을 선택해 주세요.');continue}
      const existing=req.store.cart.find(i=>i.sku===product.sku)
      if(!Number.isInteger(qty)||qty<1||qty+(existing?.qty||0)>4)errors.push(`${product.title}: 장바구니에 담긴 수량을 합해 최대 4개까지 구매할 수 있습니다.`)
    }
    if(errors.length)return orderDetail(req,res,order,[...new Set(errors)])
    for(const {product:p,qty} of items){const existing=req.store.cart.find(i=>i.sku===p.sku);if(existing)existing.qty+=qty;else req.store.cart.push(p.kind?{kind:'other',qty,unit_price:p.price,title:p.title,sku:p.sku}:{platform:p.platform,edition:'standard',format:'code-in-box',qty,unit_price:89800,title:GAME.title,sku:p.sku})}
    if(Array.isArray(req.store.selectedSkus))req.store.selectedSkus=[...new Set([...req.store.selectedSkus,...items.map(i=>i.product.sku)])]
    delete req.store.buyNow
    invalidateCheckout(req)
    res.redirect(`${BASE}/cart`)
  })

  router.get(['/help','/ssr/desktop/contact/faq'],(req,res)=>{
    const q=text(req.query.q).slice(0,160),category=topics.includes(req.query.category)?req.query.category:''
    const found=articles.filter(a=>(!category||a.category===category)&&(!q||`${a.title} ${a.body.join(' ')}`.toLowerCase().includes(q.toLowerCase())))
    render(req,res,'고객센터',`<h1>고객센터</h1>${helpNav()}<section class="help-search"><h2>무엇을 도와드릴까요?</h2><form method="get" action="${BASE}/help"><label for="help-q">궁금한 내용을 검색해 주세요</label><input id="help-q" name="q" value="${esc(q)}" placeholder="배송, 취소, 반품, 비밀번호">${hidden('category',category)}<button>검색</button></form></section><div class="help-categories"><a href="${BASE}/help?${new URLSearchParams({q})}"${!category?' aria-current="page"':''}>전체</a>${topics.map(topic=>`<a href="${BASE}/help?${esc(new URLSearchParams({q,category:topic}).toString())}"${category===topic?' aria-current="page"':''}>${topic}</a>`).join('')}</div><h2>${q?'검색 결과':'자주 묻는 질문'} <small>${found.length}개</small></h2><div class="faq-list">${found.length?found.map(a=>`<a href="${BASE}/help/articles/${a.id}"><span>${a.category}</span><strong>${a.title}</strong><span>›</span></a>`).join(''):`<div class="my-empty"><p>검색 결과가 없습니다. 짧은 단어로 다시 검색해 주세요.</p><a href="${BASE}/help/inquiries/new">문의 남기기</a></div>`}</div><section class="help-contact"><h2>도움이 더 필요하신가요?</h2><p>문의 내용을 저장하고 문의내역에서 다시 확인할 수 있습니다.</p><a class="button" href="${BASE}/help/inquiries/new">문의하기</a><p class="hint">실시간 채팅, 전화 상담 및 외부 고객센터 연결은 제공하지 않습니다.</p></section>`)
  })
  router.get('/help/articles/:id',(req,res)=>{
    const article=articles.find(a=>a.id===req.params.id);if(!article)return missing(req,res,'도움말')
    render(req,res,article.title,`<h1>고객센터</h1>${helpNav()}<article class="help-article"><p class="crumb"><a href="${BASE}/help">자주 묻는 질문</a> &gt; ${article.category}</p><h2>${article.title}</h2>${article.body.map(p=>`<p>${esc(p)}</p>`).join('')}<a class="button secondary" href="${BASE}${article.link}">${article.label}</a></article><p><a href="${BASE}/help">목록으로 돌아가기</a></p>`)
  })
  function inquiryForm(req,res,values={},errors=[]) {
    const orders=customerOrders(req)
    render(req,res,'문의하기',`<h1>고객센터</h1>${helpNav()}<section class="inquiry-form panel"><h2>문의하기</h2><p>연락처, 주소, 비밀번호, 카드정보를 문의 내용에 입력하지 마세요. 문의는 이 계정의 문의내역에 저장되며 외부로 전송되지 않습니다.</p>${errorsHTML(errors)}<form method="post" action="${BASE}/help/inquiries"><div class="field"><label for="inquiry-category">문의 유형</label><select id="inquiry-category" name="category"><option value="">선택해 주세요</option>${topics.map(c=>`<option value="${c}"${values.category===c?' selected':''}>${c}</option>`).join('')}</select></div><div class="field"><label for="inquiry-order">관련 주문 (선택)</label><select id="inquiry-order" name="order_id"><option value="">주문과 관련 없는 문의</option>${orders.map(o=>`<option value="${o.order_number}"${values.order_id===o.order_number||values.order_id===o.id?' selected':''}>${o.order_number} · ${esc(o.items[0].title)}</option>`).join('')}</select></div>${field('email','이메일',values,'email')}${field('subject','제목',values)}<div class="field"><label for="inquiry-message">문의 내용 (10–3,000자)</label><textarea id="inquiry-message" name="message" rows="7" maxlength="3000">${esc(values.message)}</textarea></div><button>문의 등록</button></form></section>`,errors.length?400:200)
  }
  router.get('/help/inquiries/new',needsMember,(req,res)=>inquiryForm(req,res,{email:req.store.user.email,order_id:customerOrder(req,text(req.query.order_id))?.order_number||''}))
  router.get('/help/inquiries',needsMember,(req,res)=>{
    const cases=retailState(req).cases
    render(req,res,'문의내역',accountPage(req,'문의내역',`<p><a class="button" href="${BASE}/help/inquiries/new">문의하기</a></p>${cases.length?`<div class="inquiry-list">${cases.map(c=>`<a href="${BASE}/help/inquiries/${c.id}"><span class="case-status">접수 완료 · 답변 대기</span><strong>${esc(c.subject)}</strong><span>${esc(c.category)} · ${date(c.created_at)}</span></a>`).join('')}</div>`:'<div class="my-empty"><h2>등록한 문의가 없습니다.</h2><p>자주 묻는 질문에서 먼저 확인해 보세요.</p></div>'}<a href="${BASE}/help">자주 묻는 질문 보기</a>`))
  })
  router.post('/help/inquiries',needsMember,(req,res)=>{
    const values=Object.fromEntries(['category','subject','message','email','order_id'].map(key=>[key,text(req.body[key])]))
    if(!topics.includes(values.category))return inquiryForm(req,res,values,['문의 유형을 선택해 주세요.'])
    if(values.order_id&&!customerOrder(req,values.order_id))return inquiryForm(req,res,values,['이 계정에서 확인할 수 없는 주문입니다.'])
    const result=createSupportCase(req,values,'coupang')
    if(result.errors)return inquiryForm(req,res,result.values,result.errors.map(e=>({'Choose a topic.':'문의 유형을 선택해 주세요.','Enter a subject.':'제목을 입력해 주세요.','Enter a message of at least 10 characters.':'문의 내용을 10자 이상 입력해 주세요.','Enter a valid email address.':'올바른 이메일 주소를 입력해 주세요.','Order not found in this session.':'이 브라우저에서 확인할 수 없는 주문입니다.','You have reached the maximum number of saved requests.':'문의는 최대 50개까지 저장할 수 있습니다.'}[e]||'문의 내용을 확인해 주세요.')))
    res.redirect(`${BASE}/help/inquiries/${result.supportCase.id}?created=1`)
  })
  router.get('/help/inquiries/:id',needsMember,(req,res)=>{
    const supportCase=retailState(req).cases.find(c=>c.id===req.params.id);if(!supportCase)return missing(req,res,'문의')
    render(req,res,'문의 상세',accountPage(req,'문의 상세',`${req.query.created==='1'?notice('문의가 접수되었습니다.'):''}<article class="panel"><p class="case-status">접수 완료 · 답변 대기</p><h2>${esc(supportCase.subject)}</h2><p>${esc(supportCase.category)} · ${date(supportCase.created_at)} · 문의번호 ${supportCase.id}</p><p>이메일: ${esc(supportCase.email)}</p>${supportCase.order_id?`<p><a href="${BASE}/account/orders/${esc(supportCase.order_id)}">관련 주문 보기</a></p>`:''}<p class="preserve-lines">${esc(supportCase.message)}</p><hr><h3>답변</h3><p>아직 등록된 답변이 없습니다. 이 문의는 로컬에 보관되며 실제 고객센터에 전송되지 않습니다.</p></article><a href="${BASE}/help/inquiries">문의내역으로 돌아가기</a>`))
  })
  router.post('/vp/products/:id/questions',(req,res)=>{
    const canonical=products.find(p=>p.id===req.params.id),product=bySku(text(req.body.sku)||canonical?.sku)
    if(!canonical)return missing(req,res,'상품')
    if(!product||product.id!==canonical.id)return render(req,res,'상품 옵션 오류','<h1>선택한 옵션이 이 상품에 해당하지 않습니다.</h1>',400)
    const target=`${BASE}/vp/products/${product.id}?sku=${encodeURIComponent(product.sku)}&tab=questions#my-questions`
    if(!req.store.user){req.store.authReturn=target;return res.redirect(`${BASE}/login`)}
    const result=addProductQuestion(req,product.id,{message:text(req.body.message)})
    if(result.error)return productPage(req,res,product,[result.error.includes('limit')?'이 상품의 문의는 최대 20개까지 등록할 수 있습니다.':'문의 내용을 5자 이상 입력해 주세요.'],{question:text(req.body.message),questionTab:true})
    res.redirect(target)
  })
}
