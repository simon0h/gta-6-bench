import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer } from './helpers.js'
import { createAccount } from '../lib/accounts.js'
import { localNext } from '../stores/gmarket/journeys.js'

const path=r=>new URL(r.url).pathname
const DETAILS={recipient:'김민수',phone:'010-1234-5678',postal_code:'06236',city:'서울특별시 강남구',line1:'테헤란로 123',line2:'101호',name_on_card:'Minsu Kim',card_number:'4242424242424242',expiry:'12/99',cvv:'123',terms:'1'}
const ADDRESS={label:'우리 집',name:'김민수',phone:'010-1234-5678',postal_code:'06236',city:'서울특별시 강남구',line1:'테헤란로 123',line2:'101호'}
const login=(c,email='tester@example.com')=>c.post('/gmarket/account',{action:'signin',email,password:'Password123!'})
const add=(c,sku='gm-milk',qty='1')=>c.post('/gmarket/cart/add',{sku,qty,action:'cart',age_confirmed:'1'})
const addressId=html=>html.match(/addresses\?edit=(address-[a-f0-9]+)/)?.[1]

test('gmarket journeys: return targets normalize before validation and protected navigation returns to address book',async()=>{
 for(const target of ['https://evil.example','//evil.example','/gmarket/../amazon/cart','/gmarket/%2e%2e/amazon/cart','/gmarket/\\evil','/coupang/cart'])assert.equal(localNext('/gmarket',target),'')
 assert.equal(localNext('/gmarket','/gmarket/product/gm-milk?tab=questions'),'/gmarket/product/gm-milk?tab=questions')
 const srv=await startServer()
 try{
  const c=srv.client();assert.equal(path(await c.get('/gmarket/account/addresses')),'/gmarket/account');assert.equal(path(await login(c)),'/gmarket/account/addresses')
  await c.post('/gmarket/account/signout');await c.get('/gmarket/account?next='+encodeURIComponent('/gmarket/%2e%2e/amazon/cart'));assert.equal(path(await login(c)),'/gmarket/account/overview')
  await c.post('/gmarket/account/signout');assert.equal(path(await c.post('/gmarket/product/gm-milk/favorite')),'/gmarket/account');assert.equal(path(await login(c)),'/gmarket/product/gm-milk');assert.match((await c.get('/gmarket/account/wishlist')).text,/product\/gm-milk/)
  await c.post('/gmarket/account/signout');await c.post('/gmarket/seller/h2/follow');assert.equal(path(await login(c)),'/gmarket/seller/h2');assert.match((await c.get('/gmarket/account/followed-stores')).text,/h2몰/)
 }finally{await srv.close()}
})

test('gmarket journeys: saved products, recent history, shops and questions are useful and account/session isolated',async()=>{
 const srv=await startServer()
 try{
  const c=srv.client(),other=srv.client();await login(c);await login(other)
  await c.get('/gmarket/product/gm-milk');await c.get('/gmarket/product/gm-ramen');await c.get('/gmarket/product/gm-milk')
  const recent=await c.get('/gmarket/account/recent');assert.match(recent.text,/2개 · 최근 조회/);assert.ok(recent.text.indexOf('product/gm-milk')<recent.text.indexOf('product/gm-ramen'))
  await c.post('/gmarket/product/gm-controller/favorite');await c.post('/gmarket/seller/h2/follow')
  assert.match((await c.get('/gmarket/account/wishlist')).text,/옵션 확인 \/ 구매/);assert.match((await c.get('/gmarket/account/followed-stores')).text,/h2몰/)
  assert.match((await other.get('/gmarket/account/wishlist')).text,/관심상품이 없습니다/);assert.match((await other.get('/gmarket/account/followed-stores')).text,/등록한 관심매장이 없습니다/)
  assert.equal((await c.post('/gmarket/product/forged/favorite')).status,404);assert.equal((await c.post('/gmarket/seller/forged/follow')).status,404)
  const question=await c.post('/gmarket/product/gm-milk/question',{message:'<b>우유 보관 방법 문의입니다</b>'});assert.match(question.text,/&lt;b&gt;우유 보관 방법 문의입니다&lt;\/b&gt;/);assert.match(question.text,/접수완료 · 답변대기/);assert.doesNotMatch((await other.get('/gmarket/product/gm-milk?tab=questions')).text,/우유 보관 방법 문의입니다/)
  await c.post('/gmarket/account/signout');assert.match((await c.get('/gmarket/account/recent')).text,/최근 본 상품이 없습니다/)
  createAccount('gmarket',{email:'other@example.com',password:'Password123!',first_name:'다른 회원'});await login(c,'other@example.com');assert.match((await c.get('/gmarket/account/wishlist')).text,/관심상품이 없습니다/)
  await c.post('/gmarket/account/signout');await login(c);assert.match((await c.get('/gmarket/account/wishlist')).text,/gm-controller/)
  await c.post('/gmarket/account/wishlist/remove',{sku:'gm-controller'});assert.match((await c.get('/gmarket/account/wishlist')).text,/관심상품이 없습니다/)
  await c.post('/gmarket/account/recent/remove',{sku:'gm-milk'});assert.doesNotMatch((await c.get('/gmarket/account/recent')).text,/href="\/gmarket\/product\/gm-milk"/)
  await c.post('/gmarket/account/recent/clear');assert.match((await c.get('/gmarket/account/recent')).text,/최근 본 상품이 없습니다/)
 }finally{await srv.close()}
})

test('gmarket journeys: address validation, editing, default selection and checkout use preserve isolation',async()=>{
 const srv=await startServer()
 try{
  const c=srv.client(),other=srv.client();await login(c);await login(other)
  const invalid=await c.post('/gmarket/account/addresses',{...ADDRESS,name:'<김민수>',postal_code:'1234'});assert.equal(invalid.status,400);assert.match(invalid.text,/5자리 우편번호/);assert.match(invalid.text,/value="&lt;김민수&gt;"/)
  assert.equal((await c.post('/gmarket/account/addresses',{...ADDRESS,phone:'555-014-2026'})).status,400)
  const first=await c.post('/gmarket/account/addresses',ADDRESS),id=addressId(first.text);assert.ok(id)
  const second=await c.post('/gmarket/account/addresses',{...ADDRESS,label:'회사',line2:'회사 301호'}),ids=[...second.text.matchAll(/addresses\?edit=(address-[a-f0-9]+)/g)].map(m=>m[1]);assert.equal(ids.length,2)
  assert.equal((await other.get('/gmarket/account/addresses?edit='+id)).status,404);assert.equal((await other.post(`/gmarket/account/addresses/${id}/use`)).status,404)
  await c.post('/gmarket/account/addresses',{...ADDRESS,id,line2:'수정 202호'});await c.post(`/gmarket/account/addresses/${ids[1]}/default`)
  await add(c);assert.match((await c.get('/gmarket/checkout')).text,/value="회사 301호"/)
  assert.match((await c.post(`/gmarket/account/addresses/${id}/use`)).text,/value="수정 202호"/)
  await c.post(`/gmarket/account/addresses/${ids[1]}/delete`);const remaining=await c.get('/gmarket/account/addresses');assert.match(remaining.text,/기본배송지/);assert.doesNotMatch(remaining.text,/회사 301호/)
 }finally{await srv.close()}
})

test('gmarket journeys: member order details/actions require both session and owning account; cancellation preserves canonical data',async()=>{
 const srv=await startServer()
 try{
  const c=srv.client(),other=srv.client();await login(c);await login(other);await add(c,'4796016651');const done=await c.post('/gmarket/checkout',DETAILS),number=path(done).split('/').at(-1),url='/gmarket/orders/'+number
  const [before]=await c.json('/api/orders?store=gmarket');assert.match((await c.get('/gmarket/account/orders')).text,new RegExp(number));assert.equal((await other.get(url)).status,404);assert.equal((await other.post(url+'/action',{action:'cancel',reason:'다른 세션'})).status,404)
  assert.equal((await c.post(url+'/action',{action:'return',reason:'단순변심'})).status,400);assert.equal((await c.post(url+'/action',{action:'cancel',reason:''})).status,400)
  await c.post('/gmarket/account/signout');assert.equal((await c.get(url)).status,404);assert.equal((await c.get(path(done))).status,404)
  createAccount('gmarket',{email:'second@example.com',password:'Password123!',first_name:'다른 회원'});await login(c,'second@example.com');assert.doesNotMatch((await c.get('/gmarket/account/orders')).text,new RegExp(number));assert.equal((await c.get(url)).status,404);assert.equal((await c.post(url+'/action',{action:'cancel',reason:'다른 계정'})).status,404)
  assert.equal((await c.post('/gmarket/help/inquiries',{category:'orders',subject:'다른 회원 주문',message:'다른 회원 주문은 문의할 수 없습니다.',email:'second@example.com',order_id:number})).status,400)
  await c.post('/gmarket/account/signout');await login(c);const cancelled=await c.post(url+'/action',{action:'cancel',reason:'<계획 변경>'});assert.match(cancelled.text,/취소완료/);assert.match(cancelled.text,/&lt;계획 변경&gt;/)
  await c.post(url+'/action',{action:'cancel',reason:'중복 요청'});const [after]=await c.json('/api/orders?store=gmarket');assert.deepEqual(after.items,before.items);assert.deepEqual(after.totals,before.totals);assert.deepEqual(after.payment,before.payment);assert.equal(after.meta.lifecycle.length,1);assert.equal(after.meta.preorder,true)
  assert.match((await c.get('/gmarket/account/orders?status=cancelled')).text,new RegExp(number));assert.doesNotMatch((await c.get('/gmarket/account/orders?status=processing')).text,new RegExp(number))
 }finally{await srv.close()}
})

test('gmarket journeys: Korean searchable help and local cases retain safe values and enforce case/order ownership',async()=>{
 const srv=await startServer()
 try{
  const c=srv.client(),other=srv.client();await add(c);await c.post('/gmarket/account',{action:'guest',guest_email:'guest@example.com'});const done=await c.post('/gmarket/checkout',DETAILS),number=path(done).split('/').at(-1)
  assert.match((await c.get('/gmarket/account/guest-orders')).text,new RegExp(number));assert.doesNotMatch((await other.get('/gmarket/account/guest-orders')).text,new RegExp(number))
  const search=await c.get('/gmarket/help/search?q='+encodeURIComponent('우편번호'));assert.match(search.text,/배송지를 저장하거나/);assert.doesNotMatch(search.text,/href="\/gmarket\/help\/article\/payment"/)
  assert.match((await c.get('/gmarket/help/search?q=zxunknown')).text,/검색결과가 없습니다/)
  for(const url of ['/help/topic/shipping','/help/article/cancel','/help/notices/local-services'])assert.equal((await c.get('/gmarket'+url)).status,200)
  assert.equal((await c.get('/gmarket/help/article/forged')).status,404)
  const values={category:'shipping',subject:'<배송 문의>',message:'배송 예정일과 상품 구성을 확인하고 싶어요.',email:'guest@example.com',order_id:number}
  const invalid=await c.post('/gmarket/help/inquiries',{...values,message:'짧음'});assert.equal(invalid.status,400);assert.match(invalid.text,/10자 이상/);assert.match(invalid.text,/value="&lt;배송 문의&gt;"/)
  assert.equal((await other.post('/gmarket/help/inquiries',values)).status,400)
  const inquiry=await c.post('/gmarket/help/inquiries',values);assert.match(inquiry.text,/접수완료 · 답변대기/);assert.match(inquiry.text,/실제 고객센터나 판매자에게 전송되지 않았습니다/);assert.equal((await other.get(path(inquiry))).status,404)
  assert.match((await c.get('/gmarket/help/inquiries')).text,/&lt;배송 문의&gt;/)
 }finally{await srv.close()}
})

test('gmarket journeys: coupon claims/check-in are idempotent, eligibility authoritative and redemption happens only after payment',async()=>{
 const srv=await startServer()
 try{
  const c=srv.client(),other=srv.client();await login(c);await login(other)
  assert.equal((await c.post('/gmarket/benefits/claim',{coupon_id:'forged'})).status,400);assert.equal((await c.post('/gmarket/benefits/claim',{coupon_id:'checkin1000',checked:'yes'})).status,400)
  await c.post('/gmarket/benefits/check-in',{day:'2099-01-01'});const again=await c.post('/gmarket/benefits/check-in');assert.match(again.text,/누적 1일 출석/)
  await c.post('/gmarket/benefits/claim',{coupon_id:'checkin1000'});await c.post('/gmarket/benefits/claim',{coupon_id:'checkin1000'});let wallet=await c.get('/gmarket/account/coupons');assert.equal((wallet.text.match(/class="coupon-card"/g)||[]).length,1)
  await c.post('/gmarket/benefits/claim',{coupon_id:'pantry10'});assert.match((await other.get('/gmarket/account/coupons')).text,/보유한 쿠폰이 없습니다/)
  await add(c,'4796016651');assert.equal((await c.post('/gmarket/checkout/coupon',{coupon_id:'checkin1000',amount:'1',discount:'89800'})).status,400)
  await c.post('/gmarket/cart/update',{sku:'4796016651',action:'remove'});await add(c,'gm-milk','2')
  assert.equal((await c.post('/gmarket/checkout/coupon',{coupon_id:'digital5000'})).status,400)
  const applied=await c.post('/gmarket/checkout/coupon',{coupon_id:'pantry10',discount:'99999'});assert.match(applied.text,/3,000원 할인/);assert.match(applied.text,/43,800원 결제하기/)
  const failed=await c.post('/gmarket/checkout',{...DETAILS,card_number:'1'});assert.equal(failed.status,400);assert.doesNotMatch((await c.get('/gmarket/account/coupons')).text,/사용완료/)
  const done=await c.post('/gmarket/checkout',{...DETAILS,discount:'99999',total:'1'});assert.equal(done.status,200);const [order]=await c.json('/api/orders?store=gmarket');assert.deepEqual(order.totals,{subtotal:43800,shipping:3000,tax:0,discount:3000,total:43800});assert.ok(order.items.every(p=>p.kind==='other'));assert.equal(order.meta.coupon.id,'pantry10');assert.doesNotMatch(JSON.stringify(order),/4242424242424242|"cvv"/)
  wallet=await c.get('/gmarket/account/coupons');assert.match(wallet.text,/사용완료/);await add(c,'gm-milk','2');assert.equal((await c.post('/gmarket/checkout/coupon',{coupon_id:'pantry10'})).status,400)
  await c.post('/gmarket/benefits/claim',{coupon_id:'pantry10'});assert.equal((await c.post('/gmarket/checkout/coupon',{coupon_id:'pantry10'})).status,400)
 }finally{await srv.close()}
})
