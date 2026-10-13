import { enterScenarioCart, scenarioPayment, scenarioAvailability, registerScenarioAdapter } from '../../lib/benchmark-scenarios.js'
import { fixtureCatalog } from '../../lib/catalog-policy.js'
import referenceStore from './reference.js'
import { Router } from 'express'
import { randomInt } from 'node:crypto'
import { authenticate, publicAccount, createAccount } from '../../lib/accounts.js'
import { recordOrder } from '../../lib/orders.js'
import { validateCard } from '../../lib/payment.js'
import { defaultAddress } from '../../lib/retail-state.js'
import { registerJourneys, accountDashboard, localNext, customerProductState, customerOrder, resumeCustomerIntent } from './journeys.js'
import { checkoutItems, lineKey, selectCart, forgetCartLine, resolveSaved } from './cart-state.js'
import { journeyState, couponQuote } from './journey-data.js'
import { checkoutBenefits } from './journey-pages.js'
import { name, bySku, search, release, EMAIL_RE, POSTCODE_RE, validPhone, departmentById, sellerById, campaigns, selectedOffer, cleanOptions } from './data.js'
import * as P from './pages.js'

const router = Router()
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

const str = value => typeof value === 'string' ? value.trim() : ''
const qty = value => /^[1-5]$/.test(str(value)) ? Number(value) : null
function render(req, res, title, body, status = 200) {
  res.status(status).type('html').send(P.layout(res.locals.base, title, req.store.cart, req.store.user, body, req.query))
}
function notFound(req, res) {
  render(req, res, '페이지를 찾을 수 없습니다', `<h1>페이지를 찾을 수 없습니다.</h1><a href="${res.locals.base}/">홈으로 이동</a>`, 404)
}
function guard(req, res) {
  if (!checkoutItems(req).length) { res.redirect(`${res.locals.base}/cart`); return false }
  if (!req.store.checkout.email && req.store.user) req.store.checkout.email = req.store.user.email
  if (!req.store.checkout.email) { res.redirect(`${res.locals.base}/account`); return false }
  return true
}

registerJourneys(router,{render,notFound})
const cartPage=(req,res,messages=[],status=200)=>render(req,res,'장바구니',P.cart(res.locals.base,req.store.cart,messages,{service:req.query.service||req.body?.service,selected:req.store.gmarketPurchase?.mode==='cart'?req.store.gmarketPurchase.keys:null,saved:journeyState(req).savedForLater}),status)

router.get('/', (req, res) => render(req, res, '지금부터의 마켓', P.home(res.locals.base, /^\d$/.test(str(req.query.slide))?Number(req.query.slide):0)))
router.get('/category/:department{/:leaf}', (req,res)=>{
 const department=departmentById(req.params.department)
 if(!department||req.params.leaf&&!department.leaves.some(([id])=>id===req.params.leaf))return notFound(req,res)
 render(req,res,department.name,P.department(res.locals.base,department,req.params.leaf,cleanOptions(req.query)))
})
router.get('/best',(req,res)=>render(req,res,'G마켓 베스트',P.collection(res.locals.base,'best',{...cleanOptions(req.query),sort:str(req.query.sort)||'sales'})))
router.get('/superdeal',(req,res)=>render(req,res,'슈퍼딜',P.collection(res.locals.base,'superdeal',cleanOptions(req.query))))
router.get('/campaign/:id',(req,res)=>{
 const campaign=campaigns.find(c=>c.id===req.params.id)
 if(!campaign)return notFound(req,res)
 render(req,res,campaign.title,P.campaign(res.locals.base,campaign,cleanOptions(req.query)))
})
router.get('/seller/:id{/:section}',(req,res)=>{
 const seller=sellerById(req.params.id),section=req.params.section||'home'
 if(!seller||!['home','products','about'].includes(section))return notFound(req,res)
 render(req,res,seller.name+' 미니샵',P.seller(res.locals.base,seller,section,cleanOptions(req.query),journeyState(req).followedStores.includes(seller.id)))
})
router.get(['/n/search', '/search'], (req, res) => {
  if (req.query.keyword !== undefined && typeof req.query.keyword !== 'string') return render(req, res, '검색어 확인', '<section class="empty"><h1>검색어를 확인해 주세요.</h1><p>검색어는 하나만 입력해 주세요.</p></section>', 400)
  const query = str(req.query.keyword ?? req.query.q)
  render(req, res, '검색결과', P.listings(res.locals.base, search(query, req.query), query, {...req.query, q:query, searching:true}))
})
function productPage(req, res, sku) {
  const p = bySku(sku)
  if (!p) return notFound(req, res)
  render(req, res, p.title, P.product(res.locals.base, p, {variant:str(req.query.variant)}, [], str(req.query.tab), req.query.image==='1'?1:0,customerProductState(req,p)))
}
router.get('/product/:sku', (req, res) => productPage(req, res, req.params.sku))
router.get('/Item', (req, res) => productPage(req, res, str(req.query.goodscode ?? req.query.goodsCode)))
router.get('/cart', (req,res)=>cartPage(req,res))
router.post('/cart/select',(req,res)=>{
 const keys=Array.isArray(req.body.line_key)?req.body.line_key:typeof req.body.line_key==='string'?[req.body.line_key]:[]
 if(!keys.length||keys.some(key=>!req.store.cart.some(p=>lineKey(p)===key)))return cartPage(req,res,['주문할 장바구니 상품을 선택해 주세요.'],400)
 if(!['checkout','review'].includes(req.body.action))return cartPage(req,res,['선택 금액 확인 또는 주문하기를 선택해 주세요.'],400)
 selectCart(req,keys)
 res.redirect(req.body.action==='checkout'?`${res.locals.base}/checkout`:`${res.locals.base}/cart?service=${encodeURIComponent(str(req.body.service))}`)
})
router.post('/cart/saved',(req,res)=>{
 const saved=journeyState(req).savedForLater,key=str(req.body.line_key),line=saved.find(p=>lineKey(p)===key)
 if(!line||!['restore','remove'].includes(req.body.action))return cartPage(req,res,['보관한 상품을 선택해 주세요.'],400)
 if(req.body.action==='restore'){
  const offer=resolveSaved(line)
  if(offer.error)return cartPage(req,res,[offer.error],400)
  const item=offer.item,existing=req.store.cart.find(p=>lineKey(p)===key),total=(existing?.qty||0)+item.qty
  if(total>5||total>item.stock)return cartPage(req,res,['장바구니 수량과 합하면 주문 가능 수량을 초과합니다. 먼저 장바구니 수량을 변경해 주세요.'],400)
  if(existing)existing.qty=total;else req.store.cart.push(item)
 }
 journeyState(req).savedForLater=saved.filter(p=>p!==line)
 res.redirect(`${res.locals.base}/cart`)
})
router.post('/cart/add', (req, res) => {
  const p = bySku(req.body.sku)
  if (!p) return render(req, res, '장바구니', P.cart(res.locals.base, req.store.cart, ['올바른 상품을 선택해 주세요.']), 400)
  const count = qty(req.body.qty)
  const offer = selectedOffer(p, str(req.body.variant))
  const item = offer.item
  const existing = req.body.action !== 'buy' && item && req.store.cart.find(line => (line.line_key || line.sku) === item.line_key)
  const messages = []
  if (offer.error) messages.push(offer.error)
  if (item && count && (existing?.qty ?? 0) + count > item.stock) messages.push('선택한 옵션의 주문 가능 수량을 초과했습니다.')
  if (!count || (existing?.qty ?? 0) + count > 5) messages.push('수량은 상품당 1개부터 5개까지 선택할 수 있습니다.')
  // ASSUMPTION: a local checkbox substitutes for Gmarket's observed adult identity gate.
  if ((!p.kind || p.adult) && req.body.age_confirmed !== '1') messages.push('만 19세 이상임을 확인해 주세요.')
  if (!['cart', 'buy'].includes(req.body.action)) messages.push('장바구니 또는 구매하기를 선택해 주세요.')
  if (messages.length) return render(req, res, p.title, P.product(res.locals.base, p, { qty: str(req.body.qty), age_confirmed: str(req.body.age_confirmed), variant: str(req.body.variant) }, messages), 400)
  if(req.body.action==='buy') { req.store.gmarketPurchase={mode:'buy',items:[{...item,qty:count}]};delete req.store.checkout.coupon_id }
  else {
    if (existing) existing.qty += count
    else req.store.cart.push({ ...item, qty: count })
    delete req.store.gmarketPurchase
    delete req.store.checkout.coupon_id
  }
  res.redirect(`${res.locals.base}/${req.body.action === 'buy' ? 'checkout' : 'cart'}`)
})
router.post('/cart/update', (req,res)=>{
 const key=str(req.body.line_key)||str(req.body.sku),p=req.store.cart.find(line=>lineKey(line)===key),action=str(req.body.action)
 if(!p||!['update','remove','save','option'].includes(action))return cartPage(req,res,['장바구니 상품과 변경할 내용을 선택해 주세요.'],400)
 if(action==='remove'||action==='save'){
  if(action==='save'){
   const saved=journeyState(req).savedForLater
   if(saved.some(line=>lineKey(line)===key))return cartPage(req,res,['같은 옵션이 이미 나중에 구매 목록에 있습니다. 먼저 보관 상품을 장바구니로 옮겨 주세요.'],400)
   if(saved.length>=40)return cartPage(req,res,['보관 상품은 최대 40개입니다. 보관 목록을 정리해 주세요.'],400)
   saved.push({...p})
  }
  req.store.cart=req.store.cart.filter(line=>line!==p)
  forgetCartLine(req,key)
 } else if(action==='option'){
  const offer=selectedOffer(bySku(p.sku),str(req.body.variant))
  if(offer.error)return cartPage(req,res,[offer.error],400)
  const item=offer.item,nextKey=lineKey(item),existing=req.store.cart.find(line=>line!==p&&lineKey(line)===nextKey),quantity=p.qty+(existing?.qty||0)
  if(quantity>5||quantity>item.stock)return cartPage(req,res,['옵션 변경 후 합산 수량이 주문 가능 수량을 초과합니다.'],400)
  req.store.cart=req.store.cart.filter(line=>line!==p&&line!==existing)
  req.store.cart.push({...item,qty:quantity})
  forgetCartLine(req,key,nextKey)
 } else {
  const quantity=qty(req.body.qty)
  if(!quantity||quantity>p.stock)return cartPage(req,res,['수량은 재고 범위 내에서 1개부터 5개까지 선택할 수 있습니다.'],400)
  p.qty=quantity
 }
 res.redirect(`${res.locals.base}/cart`)
})
router.get('/account/register',(req,res)=>{
 if(req.store.user)return res.redirect(`${res.locals.base}/account/overview`)
 if(req.query.next)req.store.accountReturn=localNext(res.locals.base,req.query.next)
 render(req,res,'회원가입',P.registration(res.locals.base))
})
router.post('/account/register',(req,res)=>{
 const values=Object.fromEntries(['email','first_name','phone','terms'].map(k=>[k,str(req.body[k])]))
 values.email=values.email.toLowerCase()
 const messages=[]
 if(!EMAIL_RE.test(values.email)||values.email.length>254)messages.push('올바른 이메일 주소를 입력해 주세요.')
 if(!values.first_name||values.first_name.length>80)messages.push('이름을 80자 이내로 입력해 주세요.')
 if(!validPhone(values.phone))messages.push('010으로 시작하는 올바른 휴대폰 번호를 입력해 주세요.')
 const password=typeof req.body.password==='string'?req.body.password:''
 if(password.length<8||password.length>128||!/[a-zA-Z]/.test(password)||!/[0-9]/.test(password))messages.push('비밀번호는 영문과 숫자를 포함해 8~128자로 입력해 주세요.')
 if(password!==req.body.password_confirm)messages.push('비밀번호 확인이 일치하지 않습니다.')
 if(values.terms!=='1')messages.push('필수 이용조건에 동의해 주세요.')
 if(messages.length)return render(req,res,'회원가입',P.registration(res.locals.base,values,messages),400)
 const user=createAccount(req.storeSlug,{email:values.email,password,first_name:values.first_name,phone:values.phone})
 if(user.error)return render(req,res,'회원가입',P.registration(res.locals.base,values,['이미 가입된 이메일입니다. 로그인해 주세요.']),400)
 // Copy only this guest's saved cart lines. Never copy another member's state.
 const guestSaved=!req.store.user?journeyState(req).savedForLater.map(p=>({...p})):[]
 req.store.user=publicAccount(user);req.store.checkout={email:user.email}
 journeyState(req).savedForLater=guestSaved
 resumeCustomerIntent(req)
 const next=localNext(res.locals.base,req.store.accountReturn)
 delete req.store.accountReturn
 res.redirect(next||`${res.locals.base}/${checkoutItems(req).length?'checkout':'account/overview'}`)
})
router.get('/account', (req, res) => {
  if (req.store.user) return accountDashboard(req,res,render)
  if(req.query.next) req.store.accountReturn=localNext(res.locals.base,req.query.next)
  render(req, res, '로그인', P.account(res.locals.base,{mode:req.query.mode==='guest'?'guest':'signin'}))
})
router.post('/account', (req, res) => {
  const email = str(req.body.action === 'guest' ? req.body.guest_email : req.body.email).toLowerCase()
  const messages = []
  if (!EMAIL_RE.test(email)) messages.push('올바른 이메일 주소를 입력해 주세요.')
  if (!['guest', 'signin'].includes(req.body.action)) messages.push('회원 또는 비회원 구매를 선택해 주세요.')
  let user = null
  if (!messages.length && req.body.action === 'signin') {
    user = authenticate(req.storeSlug, email, req.body.password)
    if (!user) messages.push('아이디 또는 비밀번호를 확인해 주세요.')
  }
  if (messages.length) return render(req, res, '로그인', P.account(res.locals.base, { email,mode:req.body.action }, messages), 400)
  req.store.user = publicAccount(user)
  req.store.checkout = { email }
  resumeCustomerIntent(req)
  const next=user?localNext(res.locals.base,req.store.accountReturn):''
  delete req.store.accountReturn
  res.redirect(next||`${res.locals.base}/${checkoutItems(req).length ? 'checkout' : user?'account/overview':''}`)
})
router.post('/account/signout', (req, res) => {
  req.store.user = null
  req.store.checkout = {}
  delete req.store.gmarketPurchase
  delete req.store.customerIntent
  delete req.store.accountReturn
  res.redirect(`${res.locals.base}/`)
})

// ASSUMPTION: public login/help establish member and guest purchase plus 주문/결제.
// Exact authenticated fields, one-page layout and domestic card simulation are inferred.
router.get('/checkout', (req, res) => {
  if (!guard(req, res)) return
  const items=checkoutItems(req)
  const a=req.store.user?defaultAddress(req):null
  const values = req.store.checkout.details ?? (a?{recipient:a.name,phone:a.phone,postal_code:a.postal_code,city:a.city,line1:a.line1,line2:a.line2}:{ recipient: req.store.user ? `${req.store.user.first_name} ${req.store.user.last_name}`.trim() : '',phone:validPhone(req.store.user?.phone||'')?req.store.user.phone:'' })
  render(req, res, '주문/결제', P.checkout(res.locals.base, items, req.store.checkout.email, values,[],checkoutBenefits(res.locals.base,req,items)))
})
router.post('/checkout', (req, res) => {
  if (!guard(req, res)) return
  const items=checkoutItems(req)
  // Whitelist display-safe data; never echo or retain card number, CVV or passwords.
  const values = Object.fromEntries(['recipient', 'phone', 'postal_code', 'city', 'line1', 'line2', 'delivery_note', 'name_on_card', 'expiry', 'terms'].map(key => [key, str(req.body[key])]))
  const messages = []
  if (!values.recipient) messages.push('받는 사람 이름을 입력해 주세요.')
  if (!validPhone(values.phone)) messages.push('010으로 시작하는 올바른 휴대폰 번호를 입력해 주세요.')
  if (!POSTCODE_RE.test(values.postal_code)) messages.push('5자리 우편번호를 입력해 주세요.')
  if (!values.city || !values.line1) messages.push('시/도 및 도로명 주소를 입력해 주세요.')
  if (values.delivery_note.length > 200) messages.push('배송 요청사항은 200자 이내로 입력해 주세요.')
  if (!values.name_on_card) messages.push('카드 소유자 이름을 입력해 주세요.')
  const card = validateCard({ number: str(req.body.card_number), expiry: values.expiry, cvv: str(req.body.cvv) })
  if (!card.ok) {
    if (card.errors.number) messages.push('올바른 카드번호를 입력해 주세요.')
    if (card.errors.expiry) messages.push('유효한 카드 유효기간을 MM/YY 형식으로 입력해 주세요.')
    if (card.errors.cvv) messages.push('3자리 또는 4자리 보안코드를 입력해 주세요.')
  }
  if (values.terms !== '1') messages.push('주문내용 및 개인정보 제공에 동의해 주세요.')
  const quote=couponQuote(req,items,req.store.checkout.coupon_id||'')
  if(quote.error) messages.push(quote.error)
  if (messages.length) return render(req, res, '주문/결제', P.checkout(res.locals.base, items, req.store.checkout.email, values, messages,checkoutBenefits(res.locals.base,req,items)), 400)
  const rejected = scenarioPayment(req.store, { method: 'card', last4: card.last4 }, items)
  if (rejected) return render(req,res,'주문/결제',P.checkout(res.locals.base,items,req.store.checkout.email,values,[rejected],checkoutBenefits(res.locals.base,req,items)),402)
  const address = { first_name: values.recipient, last_name: '', line1: values.line1, line2: values.line2, city: values.city, state: '', postal_code: values.postal_code, country: 'KR' }
  // ASSUMPTION: illustrative ten-digit cart reference; no real order was submitted.
  const order = recordOrder({
    store: req.storeSlug, session: req.session, order_number: String(randomInt(1000000000, 10000000000)),
    items: items.map(p => ({ ...p })),
    customer: { email: req.store.checkout.email, first_name: values.recipient, last_name: '', phone: values.phone, guest: !req.store.user, account_id: req.store.user?.id ?? null },
    fulfillment: { method: 'ship', option: 'seller-delivery', eta: items.some(p => !p.kind) ? `${release} 출시 일정에 맞춰 발송` : '결제 후 2~3일 이내 발송', instructions: values.delivery_note },
    shipping_address: address, billing_address: address,
    payment: { method: 'card', brand: card.brand, last4: card.last4, name_on_card: values.name_on_card },
    totals: quote.totals, currency: 'KRW',
    meta: { ...(quote.coupon?{coupon:{id:quote.coupon.id,title:quote.coupon.title,discount:quote.discount}}:{}), options: items.filter(p=>p.variant_id).map(p=>({sku:p.sku,variant_id:p.variant_id,variant_label:p.variant_label,qty:p.qty,unit_price:p.unit_price})), preorder: items.some(p => !p.kind), sellers: [...new Set(items.map(p=>p.seller))], vat_included: true, synthetic_inventory: true, synthetic_checkout: true, synthetic_age_check: true },
  })
  if(quote.claim)quote.claim.used_order=order.order_number
  if(req.store.gmarketPurchase?.mode!=='buy'){const purchased=new Set(items.map(lineKey));req.store.cart=req.store.cart.filter(p=>!purchased.has(lineKey(p)))}
  req.store.gmarketPurchase={mode:'complete'}
  req.store.checkout = {}
  res.redirect(`${res.locals.base}/confirmation/${order.order_number}`)
})
router.get('/confirmation/:number', (req, res) => {
  const order = customerOrder(req,req.params.number)
  if (!order) return notFound(req, res)
  render(req, res, '주문완료', P.complete(res.locals.base, order))
})
router.use(notFound)

const fixtureStore = { slug: 'gmarket', name, country: 'KR', currency: 'KRW', gta6_available: true, description: 'Korean marketplace with h2몰 seller listings, guest or member checkout, and domestic won payments.', router }

export default fixtureCatalog ? fixtureStore : referenceStore

registerScenarioAdapter('gmarket', { seed(store, id, qty) { store.cart = [{ ...selectedOffer(bySku(id), '').item, qty }] }, lines: store => [...store.cart, ...(store.gmarketPurchase?.items || [])] })
