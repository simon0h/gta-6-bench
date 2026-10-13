import { enterScenarioCart, scenarioPayment, scenarioAvailability, registerScenarioAdapter } from '../../lib/benchmark-scenarios.js'
import { fixtureCatalog } from '../../lib/catalog-policy.js'
import referenceStore from './reference.js'
import express from 'express'
import { documentLayout } from './chrome.js'
import { randomInt } from 'node:crypto'
import { products as PRODUCTS, tiles, home, searchPage, categoryPage, categoryById, campaignPage, campaigns, brandsPage, bySku } from './catalog.js'
import { productBody } from './product-detail.js'
import { installSite } from './site.js'
import { installJourneys, needsMember, customerOrder, rememberViewed, productJourneyControls, productQuestions, checkoutAddressValues, checkoutAddressLinks } from './journeys.js'
import { retailState } from '../../lib/retail-state.js'
import { canonicalLine, invalidateCheckout, purchaseLines, checkoutToken, amountFor, deliveryGroups, deliveryEta, deliverySummary, purchaseSummary, cartBody, installCartControls } from './commerce.js'
import { GAME } from '../../lib/catalog.js'
import { esc, money } from '../../lib/html.js'
import { validateCard } from '../../lib/payment.js'
import { recordOrder } from '../../lib/orders.js'

const router = express.Router()
router.use((req, res, next) => {
  enterScenarioCart(req.store)
  const items = [...(req.store.cart || []), ...(req.store.buyNow ? [req.store.buyNow] : []), ...(req.store.gmarketPurchase?.items || [])]
  if ((/checkout/.test(req.path) || req.method === 'GET' && /cart/.test(req.path)) && items.some(item => scenarioAvailability(req.store, item.sku ?? item.pid, 'shipping') === false)) {
    const body = '<h1>Item unavailable</h1><p role="alert">Shipping unavailable. Availability changed after this item was selected. No order was placed.</p>'
    render(req, res, 'Item unavailable', body, 409)
    return
  }
  next()
})

const SLUG = 'coupang'
const NAME = 'Coupang (쿠팡)'
const won = amount => money(amount, 'KRW')
const text = value => typeof value === 'string' ? value.trim() : ''
const pick = (body, keys) => Object.fromEntries(keys.map(key => [key, text(body[key])]))
const quantity = value => /^[1-4]$/.test(text(value)) ? Number(value) : null
// ASSUMPTION: These are synthetic preorder listings, not verified Coupang stock.
// The price, code-in-box format, seller, free shipping and four-copy limit are fixtures.
const field = (name, label, values = {}, type = 'text', autocomplete = '') => `<div class="field"><label for="${name}">${label}</label><input id="${name}" name="${name}" type="${type}" value="${esc(values[name])}"${autocomplete ? ` autocomplete="${autocomplete}"` : ''}></div>`
const errorsHTML = errors => errors.length ? `<div class="errors" role="alert"><strong>입력 내용을 확인해 주세요.</strong><ul>${errors.map(error => `<li>${esc(error)}</li>`).join('')}</ul></div>` : ''
const releaseDate = `${GAME.release_date.slice(0, 4)}년 ${Number(GAME.release_date.slice(5, 7))}월 ${Number(GAME.release_date.slice(8, 10))}일`

function render(req, res, title, body, status = 200) {
  res.status(status).type('html').send(documentLayout(req,res.locals.base,title,body))
}

installJourneys(router, { render, productPage })
installSite(router, { render, knownCategory: id => Boolean(categoryById(id)), knownCampaign: id => campaigns.some(c => c.id === id) })

router.get('/', (req, res) => render(req, res, '쿠팡', home(res.locals.base, req.query)))
router.get(['/np/search', '/search'], (req, res) => render(req, res, '검색 결과', searchPage(res.locals.base, req.query)))
router.get(['/np/categories','/np/categories/:id'], (req,res)=>{
  if(req.params.id&&!categoryById(req.params.id))return render(req,res,'카테고리 없음','<h1>카테고리를 찾을 수 없습니다.</h1>',404)
  render(req,res,categoryById(req.params.id)?.label||'전체 카테고리',categoryPage(res.locals.base,req.params.id,req.query))
})
router.get(['/np/campaigns/:id','/events/:id'], (req,res)=>{
  const campaign=campaigns.find(c=>c.id===req.params.id)
  if(!campaign)return render(req,res,'기획전 없음','<h1>기획전을 찾을 수 없습니다.</h1>',404)
  render(req,res,campaign.title,campaignPage(res.locals.base,campaign,req.query))
})
router.get(['/np/brands','/np/products/brand-shop','/shops/:brand'],(req,res)=>{
  const brand=req.params.brand||text(req.query.brandName)
  if(brand&&!PRODUCTS.some(p=>p.brand===brand))return render(req,res,'브랜드 없음','<h1>브랜드를 찾을 수 없습니다.</h1>',404)
  render(req,res,brand||'브랜드관',brandsPage(res.locals.base,brand,req.query))
})

function productPage(req, res, product, errors = [], values = {}) {
  const query = values.questionTab ? { ...req.query, tab: 'questions' } : req.query
  render(req,res,product.title,productBody(res.locals.base,product,query,errors,values,{save:productJourneyControls(req,product),questions:productQuestions(req,product,[],values.question||'')}),errors.length?400:200)
}
router.get('/vp/products/:id', (req, res) => {
  const canonical = PRODUCTS.find(item => item.id === req.params.id)
  if (!canonical) return render(req, res, '상품을 찾을 수 없습니다', '<h1>상품을 찾을 수 없습니다.</h1>', 404)
  if(req.query.sku!==undefined&&!text(req.query.sku))return productPage(req,res,canonical,['올바른 상품 옵션을 선택해 주세요.'])
  const selected = bySku(text(req.query.sku)||canonical.sku)
  if(!selected||selected.id!==canonical.id)return productPage(req,res,canonical,['선택한 옵션이 이 상품에 해당하지 않습니다.'])
  rememberViewed(req, selected.id)
  productPage(req, res, selected)
})
router.post('/cart/add', (req, res) => {
  const product = bySku(text(req.body.sku))
  if (!product) return render(req, res, '상품 선택', `${errorsHTML(['구매할 상품과 플랫폼을 선택해 주세요.'])}${tiles(res.locals.base)}`, 400)
  if(text(req.body.product_id)&&text(req.body.product_id)!==product.id)return productPage(req,res,product,['선택한 옵션이 이 상품에 해당하지 않습니다.'])
  if(!product.stock)return productPage(req,res,product,['일시품절 상품입니다. 다른 상품을 선택해 주세요.'])
  const qty = quantity(req.body.qty ?? '1')
  const existing = req.store.cart.find(item => item.sku === product.sku)
  const buy = req.body.intent === 'buy'
  if (!qty || qty > product.stock || (!buy && qty + (existing?.qty ?? 0) > Math.min(4,product.stock))) return productPage(req, res, product, ['상품별 수량은 1개부터 최대 4개까지 선택할 수 있습니다.'], { qty: text(req.body.qty) })
  if (buy) req.store.buyNow = canonicalLine(product,qty)
  else {
    if (existing) Object.assign(existing,canonicalLine(product,existing.qty+qty))
    else req.store.cart.push(canonicalLine(product,qty))
    if (Array.isArray(req.store.selectedSkus) && !req.store.selectedSkus.includes(product.sku)) req.store.selectedSkus.push(product.sku)
    delete req.store.buyNow
  }
  invalidateCheckout(req)
  res.redirect(`${res.locals.base}${buy ? '/checkout' : `/vp/products/${product.id}?added=1&sku=${encodeURIComponent(product.sku)}`}`)
})

function cartPage(req, res, errors = [], values = {}) {
  render(req,res,'장바구니',cartBody(req,errors,values),errors.length?400:200)
}
installCartControls(router,{cartPage})
router.get(['/cart','/cartView.pang'], (req,res)=>cartPage(req,res))
router.post('/cart/update',(req,res)=>{
  const item=req.store.cart.find(entry=>entry.sku===text(req.body.sku))
  if(!item)return cartPage(req,res,['장바구니에 없는 상품입니다.'])
  if(req.body.action==='remove'||req.body.action==='save'){
    if(req.body.action==='save'){
      const saved=retailState(req).savedForLater,existing=saved.find(i=>i.sku===item.sku)
      if(existing&&existing.qty+item.qty>4)return cartPage(req,res,['보관한 상품과 합친 수량은 최대 4개까지 가능합니다.'])
      if(!existing&&saved.length>=40)return cartPage(req,res,['보관한 상품을 먼저 삭제해 주세요. 최대 40개 옵션을 보관할 수 있습니다.'])
      if(existing)existing.qty+=item.qty;else saved.push({sku:item.sku,qty:item.qty})
    }
    req.store.cart=req.store.cart.filter(entry=>entry!==item)
    if(Array.isArray(req.store.selectedSkus))req.store.selectedSkus=req.store.selectedSkus.filter(sku=>sku!==item.sku)
  }else if(req.body.action==='update'){
    const qty=quantity(req.body[`qty_${item.sku}`])
    if(!qty||qty>bySku(item.sku).stock)return cartPage(req,res,['수량은 1개부터 4개까지 입력해 주세요.'],{[item.sku]:text(req.body[`qty_${item.sku}`])})
    Object.assign(item,canonicalLine(bySku(item.sku),qty))
  }else return cartPage(req,res,['선택한 작업을 확인해 주세요.'])
  delete req.store.buyNow
  invalidateCheckout(req)
  res.redirect(`${res.locals.base}/cart`)
})
const needsCart=(req,res,next)=>{
  try { if(purchaseLines(req).length)return next() }
  catch(error){return cartPage(req,res,[error.message])}
  res.redirect(`${res.locals.base}/cart`)
}
const DETAILS = ['recipient', 'phone', 'postcode', 'address', 'address_detail', 'city', 'delivery_note', 'card_name', 'card_expiry', 'agree', 'payment_method']

function checkoutPage(req, res, values = { ...checkoutAddressValues(req), ...(text(req.query.address) ? {} : req.store.checkout.details ?? {}) }, errors = [], status = errors.length ? 400 : 200) {
  const base = res.locals.base
  const items = purchaseLines(req)
  // ASSUMPTION: One-page member checkout with manual Korean address entry.
  // Live ISP/issuer authentication is replaced by the shared local test-card validator.
  render(req, res, '주문/결제', `<p class="steps">01 옵션선택 &gt; 02 장바구니 &gt; <strong>03 주문/결제</strong> &gt; 04 주문완료</p><h1>주문/결제</h1>${req.store.buyNow?'<p class="notice">바로구매 · 선택한 상품만 주문합니다.</p>':''}<form method="post" action="${base}/checkout/cancel" class="checkout-back"><button class="link-button">장바구니로 돌아가기</button></form>${errorsHTML(errors)}<div class="checkout"><form action="${base}/checkout/order" method="post"><input type="hidden" name="checkout_token" value="${checkoutToken(req)}"><section class="panel"><h2>구매자정보</h2><p>${esc(req.store.user.email)}</p></section><section class="panel"><h2>받는사람정보</h2>${checkoutAddressLinks(req)}${field('recipient', '받는 사람', values, 'text', 'shipping name')}${field('phone', '휴대폰 번호 / 연락처', values, 'tel', 'shipping tel')}${field('postcode', '우편번호 (5자리)', values, 'text', 'shipping postal-code')}${field('city', '시 / 도', values, 'text', 'shipping address-level1')}${field('address', '도로명 주소', values, 'text', 'shipping address-line1')}${field('address_detail', '상세주소 (선택)', values, 'text', 'shipping address-line2')}${field('delivery_note', '배송 요청사항 (선택)', values)}<p>배송 국가: 대한민국 · 모든 배송 묶음 무료배송</p></section><section class="panel"><h2>배송 상품 (${items.length})</h2>${deliverySummary(base,items)}</section><section class="panel"><h2>결제수단</h2><p>신용 / 체크카드 · 일시불</p><input type="hidden" name="payment_method" value="card"><p class="hint">모의 카드 결제입니다. 실제 카드사 인증이나 청구는 진행되지 않습니다.</p>${field('card_name', '카드 명의자', values, 'text', 'cc-name')}${field('card_number', '카드번호', {}, 'text', 'cc-number')}${field('card_expiry', '유효기간 (MM/YY)', values, 'text', 'cc-exp')}${field('card_cvv', '보안코드 (CVV)', {}, 'password', 'cc-csc')}</section><section class="panel"><label class="check" for="agree"><input id="agree" type="checkbox" name="agree" value="yes"${values.agree === 'yes' ? ' checked' : ''}> 주문 내용${items.some(item=>item.kind!=='other')?' 및 예약판매 조건':''}을 확인하였으며, 구매에 동의합니다.</label><p>${items.some(item=>item.kind!=='other')?`예약상품은 박스 내 다운로드 코드 구성으로 ${releaseDate} 출시 이후 순차 배송됩니다. 일반 상품의 도착 예정은 각 배송 묶음에서 확인해 주세요.`:'상품명과 배송지 및 결제금액을 확인해 주세요.'}</p><button class="wide">${won(amountFor(items).total)} 결제하기</button></section></form>${purchaseSummary(req,items)}</div>`, status)
}
router.get('/checkout', needsCart, needsMember, (req, res) => {
  if (req.query.address !== undefined && !retailState(req).addresses.some(a => a.id === text(req.query.address))) return checkoutPage(req,res,req.store.checkout.details ?? {},['저장된 배송지를 찾을 수 없습니다. 배송지 관리에서 다시 선택해 주세요.'])
  delete req.store.checkoutCompleted
  checkoutPage(req,res)
})
router.post('/checkout/order', (req, res, next) => {
  // A repeat submission after success must not create a second order.
  const completed = req.store.checkoutCompleted
  if (completed && customerOrder(req,completed.number) && (!text(req.body.checkout_token) || text(req.body.checkout_token) === completed.token)) return res.redirect(`${res.locals.base}/confirmation/${completed.number}`)
  next()
}, needsCart, needsMember, (req, res) => {
  const values = pick(req.body, DETAILS)
  const items = purchaseLines(req)
  const errors = []
  if(text(req.body.checkout_token) && text(req.body.checkout_token)!==req.store.checkout.token) errors.push('주문 화면이 변경되었습니다. 현재 상품을 확인하고 다시 결제해 주세요.')
  if (!values.recipient) errors.push('받는 사람 이름을 입력해 주세요.')
  const phone = values.phone.replace(/[\s()-]/g, '').replace(/^\+82/, '0')
  if (!/^0(?:10\d{8}|1[16789]\d{7,8}|2\d{7,8}|[3-6]\d\d{7,8}|70\d{8})$/.test(phone)) errors.push('올바른 대한민국 연락처를 입력해 주세요. 예: 010-1234-5678')
  if (!/^\d{5}$/.test(values.postcode)) errors.push('우편번호를 숫자 5자리로 입력해 주세요.')
  if (!values.city || !values.address) errors.push('시 / 도와 도로명 주소를 입력해 주세요.')
  if (values.payment_method !== 'card') errors.push('신용 / 체크카드 결제를 선택해 주세요.')
  if (!values.card_name) errors.push('카드 명의자를 입력해 주세요.')
  const card = validateCard({ number: text(req.body.card_number), expiry: values.card_expiry, cvv: text(req.body.card_cvv) })
  if (!card.ok) errors.push('카드번호, 유효기간 및 보안코드를 확인해 주세요.')
  if (values.agree !== 'yes') errors.push(items.some(item=>item.kind!=='other')?'주문 내용 및 예약판매 조건에 동의해 주세요.':'주문 내용에 동의해 주세요.')
  // Only allowlisted non-sensitive fields survive a failed submission.
  req.store.checkout.details = values
  if (errors.length) return checkoutPage(req, res, values, errors)
  const rejected = scenarioPayment(req.store, { method: 'card', last4: card.last4 }, items)
  if (rejected) return checkoutPage(req,res,values,[rejected],402)
  const address = { line1: values.address, line2: values.address_detail, city: values.city, state: values.city, postal_code: values.postcode, country: 'KR' }
  // ASSUMPTION: 14-digit order numbers; live confirmation format was not observed.
  const order = recordOrder({ store: SLUG, order_number: `1${randomInt(0, 10000000000000).toString().padStart(13, '0')}`, session: req.session,
    items, customer: { email: req.store.user.email, first_name: values.recipient, last_name: '', phone, account_id: req.store.user.id },
    fulfillment: { method: 'ship', option: deliveryGroups(items).length>1?'grouped_delivery':bySku(items[0].sku).delivery==='seller'?'seller_delivery':bySku(items[0].sku).delivery, eta: deliveryEta(items) }, shipping_address: address, billing_address: address,
    payment: { method: 'card', brand: card.brand, last4: card.last4, name_on_card: values.card_name }, totals: amountFor(items), currency: 'KRW',
    meta: { synthetic_preorder: items.some(item => item.kind !== 'other'), delivery_groups: deliveryGroups(items).map(group=>({delivery:group.delivery,seller:group.seller,skus:group.items.map(item=>item.sku),eta:deliveryEta(group.items)})), delivery_note: values.delivery_note, tax_included: true, recipient_name: values.recipient },
  })
  req.store.last_order = order.order_number
  req.store.checkoutCompleted = {number:order.order_number,token:req.store.checkout.token}
  if(!req.store.buyNow){ const purchased=new Set(items.map(item=>item.sku));req.store.cart=req.store.cart.filter(item=>!purchased.has(item.sku));if(Array.isArray(req.store.selectedSkus))req.store.selectedSkus=req.store.selectedSkus.filter(sku=>!purchased.has(sku)) }
  delete req.store.buyNow
  req.store.checkout = {}
  res.redirect(`${res.locals.base}/confirmation/${order.order_number}`)
})
router.get('/confirmation/:number', (req, res) => {
  const order = customerOrder(req, req.params.number)
  if (!order) return render(req, res, '주문을 찾을 수 없습니다', '<h1>주문을 찾을 수 없습니다.</h1>', 404)
  render(req, res, '주문완료', `<p class="steps">01 옵션선택 &gt; 02 장바구니 &gt; 03 주문/결제 &gt; <strong>04 주문완료</strong></p><section class="success"><h1>주문이 완료되었습니다.</h1><p>주문번호: <strong>${esc(order.order_number)}</strong></p><p>${esc(order.customer.email)}</p></section><div class="checkout"><section class="panel"><h2>배송 정보</h2><p>${esc(order.customer.first_name)} · ${esc(order.customer.phone)}</p><p>(${esc(order.shipping_address.postal_code)}) ${esc(order.shipping_address.city)} ${esc(order.shipping_address.line1)} ${esc(order.shipping_address.line2)}</p><p>무료배송 · ${esc(order.fulfillment.eta)}</p><h2>결제 정보</h2><p>${esc(order.payment.brand)} · 끝 4자리 ${esc(order.payment.last4)}</p><p>결제금액: <strong>${won(order.totals.total)}</strong></p></section><aside class="summary"><h2>주문상품</h2>${deliverySummary(res.locals.base,order.items,true)}</aside></div><div class="actions"><a class="button" href="${res.locals.base}/account/orders/${order.order_number}">주문 상세 / 배송조회</a><a href="${res.locals.base}/account/orders">주문목록</a><a href="${res.locals.base}">쇼핑 계속하기</a></div>`)
})

router.use((req, res) => render(req, res, '페이지를 찾을 수 없습니다', `<h1>페이지를 찾을 수 없습니다.</h1><p>요청하신 페이지가 없거나 주소가 변경되었습니다.</p><a href="${res.locals.base}">쿠팡 홈으로 돌아가기</a>`, 404))

const fixtureStore = { slug: SLUG, name: NAME, country: 'KR', currency: 'KRW', gta6_available: true, description: 'Korean member checkout · seller delivery · simulated credit/debit card', router }

export default fixtureCatalog ? fixtureStore : referenceStore

registerScenarioAdapter('coupang', { seed(store, id, qty) { store.cart = [canonicalLine(bySku(id), qty)] }, lines: store => [...store.cart, ...(store.buyNow ? [store.buyNow] : [])] })
