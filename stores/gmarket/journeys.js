import { checkoutItems } from './cart-state.js'
import { retailState, rememberProduct, toggleFavorite, saveAddress, deleteAddress, ownedOrders, ownedOrder, requestOrderAction, createSupportCase, addProductQuestion } from '../../lib/retail-state.js'
import { bySku, sellerById, validPhone } from './data.js'
import { journeyState, couponById, couponQuote, koreaDay, articles, notices, topics } from './journey-data.js'
import * as J from './journey-pages.js'

const str=v=>typeof v==='string'?v.trim():''
export function localNext(base,value) {
 if(typeof value!=='string'||!value.startsWith(base+'/')||/[\\\r\n]/.test(value))return ''
 try {const url=new URL(value,'https://gmarket.local');return url.origin==='https://gmarket.local'&&url.pathname.startsWith(base+'/')?url.pathname+url.search+url.hash:''}catch{return ''}
}
const memberOwns=(req,order)=>!!req.store.user&&!order.customer.guest&&(order.customer.account_id?order.customer.account_id===req.store.user.id:order.customer.email===req.store.user.email)
export const customerOrders=req=>ownedOrders(req).filter(o=>req.store.user?memberOwns(req,o):o.customer.guest)
export const customerOrder=(req,id)=>{const order=ownedOrder(req,id);return order&&(order.customer.guest||memberOwns(req,order))?order:null}

export function requireMember(req,res,next=req.originalUrl) {
 if(req.store.user)return true
 req.store.accountReturn=localNext(res.locals.base,next)||`${res.locals.base}/account/overview`
 res.redirect(`${res.locals.base}/account`)
 return false
}
export function resumeCustomerIntent(req) {
 const intent=req.store.customerIntent
 delete req.store.customerIntent
 if(!req.store.user||!intent)return
 const state=journeyState(req)
 if(intent.type==='favorite'&&bySku(intent.sku)&&!state.favorites.includes(intent.sku))toggleFavorite(req,intent.sku)
 if(intent.type==='follow'&&sellerById(intent.id)&&!state.followedStores.includes(intent.id))state.followedStores.push(intent.id)
}
export function customerProductState(req,p) {
 const state=journeyState(req)
 return {favorite:state.favorites.includes(p.sku),questions:state.questions[p.sku]||[],member:!!req.store.user}
}
export function accountDashboard(req,res,render) {
 return render(req,res,'나의 G마켓',J.dashboard(res.locals.base,req,customerOrders(req).slice().reverse()))
}
const addressErrors={
 'Enter a recipient name.':'받는 사람 이름을 입력해 주세요.', 'Enter a street address.':'도로명 주소를 입력해 주세요.', 'Enter a city.':'시/도 및 시/군/구를 입력해 주세요.', 'Enter a valid postal code.':'5자리 우편번호를 입력해 주세요.', 'Enter a contact phone number.':'휴대폰 번호를 입력해 주세요.', 'Enter a valid phone number.':'올바른 휴대폰 번호를 입력해 주세요.', 'Address not found.':'배송지를 찾을 수 없습니다.', 'Remove an address before saving another.':'배송지는 최대 12개까지 저장할 수 있습니다.',
}
const caseErrors={
 'Choose a topic.':'문의유형을 선택해 주세요.', 'Enter a subject.':'제목을 입력해 주세요.', 'Enter a message of at least 10 characters.':'문의 내용을 10자 이상 입력해 주세요.', 'Enter a valid email address.':'올바른 이메일 주소를 입력해 주세요.', 'Order not found in this session.':'현재 브라우저에서 접수한 주문을 선택해 주세요.', 'You have reached the maximum number of saved requests.':'저장 가능한 문의 수를 초과했습니다.',
}
export function registerJourneys(router,{render,notFound}) {
 router.get('/account/overview',(req,res)=>{if(requireMember(req,res))accountDashboard(req,res,render)})
 router.get('/account/wishlist',(req,res)=>{if(requireMember(req,res))render(req,res,'관심상품',J.saved(res.locals.base,retailState(req).favorites,'wishlist'))})
 router.post('/product/:sku/favorite',(req,res)=>{
  const p=bySku(req.params.sku);if(!p)return notFound(req,res)
  if(!req.store.user)req.store.customerIntent={type:'favorite',sku:p.sku}
  if(!requireMember(req,res,`${res.locals.base}/product/${p.sku}`))return
  toggleFavorite(req,p.sku)
  res.redirect(`${res.locals.base}/product/${p.sku}`)
 })
 router.post('/account/wishlist/remove',(req,res)=>{
  if(!requireMember(req,res,`${res.locals.base}/account/wishlist`))return
  const p=bySku(str(req.body.sku)),state=retailState(req)
  if(!p||!state.favorites.includes(p.sku))return notFound(req,res)
  state.favorites=state.favorites.filter(id=>id!==p.sku)
  res.redirect(`${res.locals.base}/account/wishlist`)
 })
 router.get('/account/recent',(req,res)=>render(req,res,'최근 본 상품',J.saved(res.locals.base,retailState(req).recent,'recent')))
 router.post('/account/recent/remove',(req,res)=>{
  const state=retailState(req),id=str(req.body.sku)
  if(!state.recent.includes(id))return notFound(req,res)
  state.recent=state.recent.filter(s=>s!==id)
  res.redirect(`${res.locals.base}/account/recent`)
 })
 router.post('/account/recent/clear',(req,res)=>{retailState(req).recent=[];res.redirect(`${res.locals.base}/account/recent`)})
 router.get('/account/followed-stores',(req,res)=>{if(requireMember(req,res))render(req,res,'관심매장',J.followed(res.locals.base,journeyState(req).followedStores))})
 router.post('/seller/:id/follow',(req,res)=>{
  const seller=sellerById(req.params.id);if(!seller)return notFound(req,res)
  if(!req.store.user)req.store.customerIntent={type:'follow',id:seller.id}
  if(!requireMember(req,res,`${res.locals.base}/seller/${seller.id}`))return
  const state=journeyState(req)
  state.followedStores=state.followedStores.includes(seller.id)?state.followedStores.filter(id=>id!==seller.id):[...state.followedStores,seller.id]
  res.redirect(req.body.return_to==='followed-stores'?`${res.locals.base}/account/followed-stores`:`${res.locals.base}/seller/${seller.id}`)
 })
 router.get('/account/addresses',(req,res)=>{
  if(!requireMember(req,res))return
  const items=retailState(req).addresses,editing=str(req.query.edit),values=items.find(a=>a.id===editing)
  if(editing&&!values)return notFound(req,res)
  render(req,res,'배송지 관리',J.addresses(res.locals.base,items,values))
 })
 router.post('/account/addresses',(req,res)=>{
  if(!requireMember(req,res,`${res.locals.base}/account/addresses`))return
  const state=retailState(req),input=Object.fromEntries(['id','label','name','phone','postal_code','city','line1','line2','is_default'].map(k=>[k,str(req.body[k])]))
  if(input.id&&!state.addresses.some(a=>a.id===input.id))return notFound(req,res)
  if(!validPhone(input.phone))return render(req,res,'배송지 관리',J.addresses(res.locals.base,state.addresses,input,['010으로 시작하는 올바른 휴대폰 번호를 입력해 주세요.']),400)
  const result=saveAddress(req,input,{country:'KR',requirePhone:true})
  if(result.errors)return render(req,res,'배송지 관리',J.addresses(res.locals.base,state.addresses,{...result.values,id:input.id,is_default:input.is_default==='yes'},result.errors.map(e=>addressErrors[e]||'배송지 정보를 확인해 주세요.')),400)
  res.redirect(`${res.locals.base}/account/addresses`)
 })
 router.post('/account/addresses/:id/:action',(req,res)=>{
  if(!requireMember(req,res,`${res.locals.base}/account/addresses`))return
  const state=retailState(req),a=state.addresses.find(a=>a.id===req.params.id),action=req.params.action
  if(!a||!['default','delete','use'].includes(action))return notFound(req,res)
  if(action==='delete')deleteAddress(req,a.id)
  if(action==='default')state.addresses.forEach(v=>{v.is_default=v.id===a.id})
  if(action==='use'){
   req.store.checkout.details={...(req.store.checkout.details||{}),recipient:a.name,phone:a.phone,postal_code:a.postal_code,city:a.city,line1:a.line1,line2:a.line2}
   return res.redirect(`${res.locals.base}/checkout`)
  }
  res.redirect(`${res.locals.base}/account/addresses`)
 })
 for(const route of ['orders','guest-orders'])router.get(`/account/${route}`,(req,res)=>{
  const status=str(req.query.status),filter=['processing','cancelled','return_requested'].includes(status)?status:''
  const orders=(route==='guest-orders'?ownedOrders(req).filter(o=>o.customer.guest):customerOrders(req)).slice().reverse()
  render(req,res,'주문/배송조회',J.ordersPage(res.locals.base,orders,filter,route==='guest-orders'))
 })
 router.get('/orders/:number',(req,res)=>{
  const order=customerOrder(req,req.params.number);if(!order)return notFound(req,res)
  render(req,res,'주문 상세조회',J.orderDetail(res.locals.base,order))
 })
 router.post('/orders/:number/action',(req,res)=>{
  const order=customerOrder(req,req.params.number);if(!order)return notFound(req,res)
  const result=requestOrderAction(req,order.id,str(req.body.action),str(req.body.reason))
  if(result.error){const text=!str(req.body.reason)?'요청 사유를 입력해 주세요.':req.body.action==='return'?'반품은 배송완료 후 접수할 수 있습니다. 주문접수 상태에서는 취소를 이용해 주세요.':'현재 주문 상태에서 선택한 요청을 처리할 수 없습니다.';return render(req,res,'주문 상세조회',J.orderDetail(res.locals.base,order,[text],{reason:str(req.body.reason)}),result.status)}
  res.redirect(`${res.locals.base}/orders/${order.order_number}`)
 })
 router.get('/benefits',(req,res)=>render(req,res,'쇼핑 혜택',J.benefits(res.locals.base,req)))
 router.get('/account/coupons',(req,res)=>{if(requireMember(req,res))render(req,res,'쿠폰함',J.benefits(res.locals.base,req,true))})
 router.post('/benefits/check-in',(req,res)=>{
  if(!requireMember(req,res,`${res.locals.base}/benefits`))return
  const state=journeyState(req),day=koreaDay()
  if(!state.checkins.includes(day))state.checkins.push(day)
  render(req,res,'쇼핑 혜택',J.benefits(res.locals.base,req,false,'오늘의 출석체크가 완료되었습니다. 출석 쿠폰을 받아 보세요.'))
 })
 router.post('/benefits/claim',(req,res)=>{
  if(!requireMember(req,res,`${res.locals.base}/benefits`))return
  const state=journeyState(req),coupon=couponById(str(req.body.coupon_id))
  if(!coupon)return render(req,res,'쇼핑 혜택',J.benefits(res.locals.base,req,false,'받을 수 있는 쿠폰을 선택해 주세요.'),400)
  if(coupon.checkin&&!state.checkins.includes(koreaDay()))return render(req,res,'쇼핑 혜택',J.benefits(res.locals.base,req,false,'오늘 출석체크를 먼저 완료해 주세요.'),400)
  if(!state.coupons.some(c=>c.id===coupon.id))state.coupons.push({id:coupon.id,claimed_at:new Date().toISOString()})
  res.redirect(`${res.locals.base}/account/coupons`)
 })
 router.post('/checkout/coupon',(req,res)=>{
  if(!requireMember(req,res,`${res.locals.base}/checkout`))return
  const id=str(req.body.coupon_id),quote=couponQuote(req,checkoutItems(req),id)
  if(quote.error)return render(req,res,'쿠폰함',J.benefits(res.locals.base,req,true,quote.error),400)
  req.store.checkout.coupon_id=id
  res.redirect(`${res.locals.base}/checkout`)
 })
 router.get('/help',(req,res)=>render(req,res,'고객센터',J.help(res.locals.base)))
 router.get('/help/search',(req,res)=>render(req,res,'도움말 검색',J.help(res.locals.base,{query:str(req.query.q).slice(0,200),searching:true})))
 router.get('/help/topic/:id',(req,res)=>{if(!topics.some(([id])=>id===req.params.id))return notFound(req,res);render(req,res,'도움말',J.help(res.locals.base,{topic:req.params.id}))})
 router.get('/help/article/:id',(req,res)=>{const a=articles.find(a=>a.id===req.params.id);if(!a)return notFound(req,res);render(req,res,a.title,J.article(res.locals.base,a))})
 router.get('/help/notices/:id',(req,res)=>{const n=notices.find(n=>n.id===req.params.id);if(!n)return notFound(req,res);render(req,res,n.title,J.article(res.locals.base,n,true))})
 router.get('/help/inquiries',(req,res)=>render(req,res,'나의 문의내역',J.inquiries(res.locals.base,retailState(req).cases)))
 router.get('/help/inquiries/new',(req,res)=>{
  const order=str(req.query.order)
  if(order&&!customerOrder(req,order))return notFound(req,res)
  render(req,res,'1:1 문의',J.inquiryForm(res.locals.base,customerOrders(req),{email:req.store.user?.email||req.store.checkout.email||'',order_id:order}))
 })
 router.post('/help/inquiries',(req,res)=>{
  const orders=customerOrders(req),values=Object.fromEntries(['category','subject','message','email','order_id'].map(k=>[k,str(req.body[k])]))
  if(!topics.some(([id])=>id===values.category))return render(req,res,'1:1 문의',J.inquiryForm(res.locals.base,orders,values,['문의유형을 선택해 주세요.']),400)
  if(values.order_id&&!customerOrder(req,values.order_id))return render(req,res,'1:1 문의',J.inquiryForm(res.locals.base,orders,values,['현재 이용자가 접수한 주문을 선택해 주세요.']),400)
  const result=createSupportCase(req,values)
  if(result.errors)return render(req,res,'1:1 문의',J.inquiryForm(res.locals.base,orders,result.values,result.errors.map(e=>caseErrors[e]||'문의 내용을 확인해 주세요.')),400)
  res.redirect(`${res.locals.base}/help/inquiries/${result.supportCase.id}`)
 })
 router.get('/help/inquiries/:id',(req,res)=>{
  const inquiry=retailState(req).cases.find(c=>c.id===req.params.id)
  if(!inquiry)return notFound(req,res)
  render(req,res,'문의 접수내역',J.inquiryDetail(res.locals.base,inquiry))
 })
 router.post('/product/:sku/question',(req,res)=>{
  const p=bySku(req.params.sku);if(!p)return notFound(req,res)
  if(!requireMember(req,res,`${res.locals.base}/product/${p.sku}?tab=questions`))return
  const result=addProductQuestion(req,p.sku,{message:str(req.body.message)})
  if(result.error)return render(req,res,'상품문의',J.frame(res.locals.base,'상품문의',`${J.errors(['문의는 5자 이상 입력해 주세요. 상품당 최대 20건까지 접수할 수 있습니다.'])}<form method="post" action="${res.locals.base}/product/${p.sku}/question"><label for="retry-question">문의 내용</label><textarea id="retry-question" name="message" minlength="5" maxlength="1500">${String(str(req.body.message)).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')}</textarea><button>문의 접수</button></form>`),400)
  res.redirect(`${res.locals.base}/product/${p.sku}?tab=questions`)
 })
 // A validated PDP visit records history for the current guest/member only.
 router.get('/product/:sku',(req,res,next)=>{if(bySku(req.params.sku))rememberProduct(req,req.params.sku);next()})
}
