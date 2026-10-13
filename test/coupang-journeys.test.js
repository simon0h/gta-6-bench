import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer, fieldValue } from './helpers.js'
import { safeReturn } from '../stores/coupang/journeys.js'

const BASE='/coupang'
const LOGIN={email:'tester@example.com',password:'Password123!'}
const ORDER={recipient:'김민수',phone:'010-1234-5678',postcode:'04524',city:'서울특별시',address:'중구 세종대로 110',address_detail:'501호',payment_method:'card',card_name:'Minsu Kim',card_number:'4242 4242 4242 4242',card_expiry:'12/39',card_cvv:'123',agree:'yes'}
const ADDRESS={label:'우리집',name:'김민수',phone:'010-1234-5678',postal_code:'04524',city:'서울특별시',line1:'중구 세종대로 110',line2:'501호',is_default:'yes'}
const path=response=>new URL(response.url).pathname
const signup=(email)=>({email,password:'Journey123!',password_confirm:'Journey123!',first_name:'박지민',phone:'010-9876-5432',agree:'yes'})
const ids=html=>[...html.matchAll(/data-product="([^"]+)"/g)].map(m=>m[1])
async function purchase(client,sku='CP-GTA6-PS5',qty='1') {
 await client.post(`${BASE}/login`,LOGIN)
 await client.post(`${BASE}/cart/add`,{sku,qty})
 const done=await client.post(`${BASE}/checkout/order`,ORDER)
 assert.equal(done.status,200)
 return {done,order:(await client.json('/api/orders?store=coupang')).at(-1)}
}

test('coupang journeys: safe login destinations retain account intent and never redirect externally or replay forms',async()=>{
 for(const input of ['https://evil.example/x','//evil.example','/coupang/../amazon/account','/coupang/login','/coupang/account/orders/123/action','/coupang/\\evil','/coupang/checkout/order','/coupang/%2e%2e/amazon/account'])assert.equal(safeReturn(input),`${BASE}/account`,input)
 assert.equal(safeReturn(`${BASE}/vp/products/milk-10?sku=CP-MILK-10-24&tab=questions#my-questions`),`${BASE}/vp/products/milk-10?sku=CP-MILK-10-24&tab=questions#my-questions`)
 const server=await startServer()
 try {
  const client=server.client()
  const gate=await client.get(`${BASE}/account/addresses/new?returnTo=%2Fcoupang%2Fcheckout`)
  assert.equal(path(gate),`${BASE}/login`)
  assert.match(gate.text,/name="returnTo" value="\/coupang\/account\/addresses\/new/)
  const fail=await client.post(`${BASE}/login`,{email:LOGIN.email,password:'NeverEcho123',returnTo:`${BASE}/account/addresses`})
  assert.equal(fail.status,400);assert.doesNotMatch(fail.text,/NeverEcho123/)
  assert.equal(fieldValue(fail.text,'returnTo'),`${BASE}/account/addresses`)
  const success=await client.post(`${BASE}/login`,{...LOGIN,returnTo:fieldValue(fail.text,'returnTo')})
  assert.equal(path(success),`${BASE}/account/addresses`)
  await client.post(`${BASE}/logout`)
  const external=await client.post(`${BASE}/login`,{...LOGIN,returnTo:'https://evil.example'})
  assert.equal(path(external),`${BASE}/account`)
  assert.match(external.text,/진행 중 주문/)
  await client.post(`${BASE}/logout`)
  assert.equal(path(await client.get(`${BASE}/account`)),`${BASE}/login`)
 } finally {await server.close()}
})

test('coupang journeys: registration validates safe fields, keeps pending saves, and account-owned saved lists survive signout',async()=>{
 const server=await startServer()
 try {
  const client=server.client(), other=server.client()
  const product=`${BASE}/vp/products/milk-10?sku=CP-MILK-10-24`
  await client.get(product)
  assert.deepEqual(ids((await client.get(`${BASE}/account/recent`)).text),['milk-10'])
  const saveGate=await client.post(`${BASE}/account/wishlist/toggle`,{product_id:'milk-10',returnTo:product})
  assert.equal(path(saveGate),`${BASE}/login`)
  const invalid=await client.post(`${BASE}/register`,{...signup('journey-save@example.com'),phone:'555-014-2026',password_confirm:'NoMatch',returnTo:product})
  assert.equal(invalid.status,400);assert.match(invalid.text,/비밀번호 확인/);assert.match(invalid.text,/올바른 대한민국 연락처/)
  assert.equal(fieldValue(invalid.text,'email'),'journey-save@example.com')
  assert.doesNotMatch(invalid.text,/value="(?:Journey123!|NoMatch)"/)
  const registered=await client.post(`${BASE}/register`,{...signup('journey-save@example.com'),returnTo:product})
  assert.equal(path(registered),`${BASE}/vp/products/milk-10`)
  assert.match(registered.text,/aria-pressed="true"/)
  assert.match((await client.get(`${BASE}/account/wishlist`)).text,/총 1개의 상품/)
  assert.equal((await client.post(`${BASE}/account/wishlist/toggle`,{product_id:'FAKE'})).status,404)
  await client.get(`${BASE}/vp/products/gta6-xbox`)
  await client.get(product)
  assert.deepEqual(ids((await client.get(`${BASE}/account/recent`)).text),['milk-10','gta6-xbox'])
  await client.post(`${BASE}/account/preferences`,{shopping_news:'yes'})
  assert.match((await client.get(`${BASE}/account/preferences`)).text,/name="shopping_news" value="yes" checked/)
  await client.post(`${BASE}/logout`)
  await client.post(`${BASE}/login`,LOGIN)
  assert.match((await client.get(`${BASE}/account/wishlist`)).text,/찜한 상품이 없습니다/)
  assert.deepEqual(ids((await client.get(`${BASE}/account/recent`)).text),[])
  await client.post(`${BASE}/logout`)
  await client.post(`${BASE}/login`,{email:'journey-save@example.com',password:'Journey123!'})
  assert.match((await client.get(`${BASE}/account/wishlist`)).text,/총 1개의 상품/)
  await client.post(`${BASE}/account/wishlist/toggle`,{product_id:'milk-10'})
  assert.match((await client.get(`${BASE}/account/wishlist`)).text,/찜한 상품이 없습니다/)
  await client.post(`${BASE}/account/recent/clear`)
  assert.deepEqual(ids((await client.get(`${BASE}/account/recent`)).text),[])
  const duplicate=await other.post(`${BASE}/register`,signup('journey-save@example.com'))
  assert.equal(duplicate.status,400);assert.match(duplicate.text,/이미 가입된 이메일/)
  await other.post(`${BASE}/login`,{email:'journey-save@example.com',password:'Journey123!'})
  assert.deepEqual(ids((await other.get(`${BASE}/account/recent`)).text),[])
 }finally{await server.close()}
})

test('coupang journeys: Korean address create/edit/default/delete feed checkout and reject foreign addresses and owners',async()=>{
 const server=await startServer()
 try {
  const client=server.client(),stranger=server.client()
  await client.post(`${BASE}/login`,LOGIN)
  const invalid=await client.post(`${BASE}/account/addresses`,{...ADDRESS,postal_code:'1234',line1:'',country:'US'})
  assert.equal(invalid.status,400);assert.match(invalid.text,/숫자 5자리/);assert.equal(fieldValue(invalid.text,'label'),'우리집')
  await client.post(`${BASE}/account/addresses`,ADDRESS)
  let addresses=await client.get(`${BASE}/account/addresses`)
  const first=/data-address="([^"]+)"/.exec(addresses.text)[1]
  assert.match(addresses.text,/기본 배송지/)
  await client.post(`${BASE}/cart/add`,{sku:'CP-MILK-10-24',qty:'1'})
  let checkout=await client.get(`${BASE}/checkout`)
  for(const [key,value] of [['recipient','김민수'],['postcode','04524'],['phone','01012345678'],['address_detail','501호']])assert.equal(fieldValue(checkout.text,key),value)
  await client.post(`${BASE}/account/addresses`,{...ADDRESS,id:first,label:'집',line2:'502호',is_default:''})
  await client.post(`${BASE}/account/addresses`,{...ADDRESS,label:'회사',line1:'강남구 테헤란로 1',line2:'8층',is_default:''})
  addresses=await client.get(`${BASE}/account/addresses`)
  const second=[...addresses.text.matchAll(/data-address="([^"]+)"/g)][1][1]
  await client.post(`${BASE}/account/addresses/${second}/default`)
  checkout=await client.get(`${BASE}/checkout`)
  assert.equal(fieldValue(checkout.text,'address'),'강남구 테헤란로 1')
  checkout=await client.get(`${BASE}/checkout?address=${first}`)
  assert.equal(fieldValue(checkout.text,'address_detail'),'502호')
  assert.equal((await client.get(`${BASE}/checkout?address=forged`)).status,400)
  assert.equal((await client.post(`${BASE}/account/addresses`,{...ADDRESS,id:'forged'})).status,400)
  await stranger.post(`${BASE}/login`,LOGIN)
  assert.equal((await stranger.get(`${BASE}/account/addresses/${first}/edit`)).status,404)
  assert.equal((await stranger.post(`${BASE}/account/addresses/${first}/delete`)).status,404)
  await client.post(`${BASE}/account/addresses/${second}/delete`)
  checkout=await client.get(`${BASE}/checkout`)
  assert.equal(fieldValue(checkout.text,'address_detail'),'502호')
  const posted={...ORDER,recipient:fieldValue(checkout.text,'recipient'),phone:fieldValue(checkout.text,'phone'),postcode:fieldValue(checkout.text,'postcode'),city:fieldValue(checkout.text,'city'),address:fieldValue(checkout.text,'address'),address_detail:fieldValue(checkout.text,'address_detail')}
  const done=await client.post(`${BASE}/checkout/order`,posted)
  assert.match(done.text,/주문이 완료되었습니다/)
  const [order]=await client.json('/api/orders?store=coupang')
  assert.equal(order.shipping_address.country,'KR');assert.equal(order.shipping_address.line2,'502호');assert.equal(order.items[0].kind,'other')
 }finally{await server.close()}
})

test('coupang journeys: session and account owned orders, honest tracking and idempotent cancellation keep canonical transaction',async()=>{
 const server=await startServer()
 try {
  const client=server.client(),stranger=server.client()
  const {done,order}=await purchase(client)
  const route=`${BASE}/account/orders/${order.order_number}`
  assert.match(done.text,new RegExp(`href="${route}"`))
  assert.match((await client.get(`${BASE}/account/orders?q=Grand`)).text,new RegExp(order.order_number))
  assert.match((await client.get(route)).text,/Visa · 끝 4자리 4242/)
  const tracking=await client.get(`${route}/tracking`)
  assert.match(tracking.text,/주문 접수/);assert.match(tracking.text,/택배사와 운송장 번호는 아직 없습니다/)
  assert.match(tracking.text,/출시|이후 순차 배송/)
  assert.equal((await client.post(`${route}/action`,{action:'return',reason:'아직 배송되지 않은 주문 반품 시도'})).status,400)
  assert.equal((await client.post(`${route}/action`,{action:'ship',reason:'invent shipping'})).status,400)
  assert.equal((await client.post(`${route}/action`,{action:'cancel',reason:''})).status,400)
  const original=structuredClone(order)
  await client.post(`${route}/action`,{action:'cancel',reason:'플랫폼을 잘못 선택했습니다.'})
  await client.post(`${route}/action`,{action:'cancel',reason:'중복 요청'})
  const [cancelled]=await client.json('/api/orders?store=coupang')
  assert.equal(cancelled.meta.lifecycle.length,1);assert.equal(cancelled.meta.lifecycle[0].status,'cancelled')
  assert.deepEqual(cancelled.items,original.items);assert.deepEqual(cancelled.totals,original.totals);assert.deepEqual(cancelled.payment,original.payment)
  assert.match((await client.get(`${BASE}/account/returns`)).text,/취소 완료/)
  const cancelledTracking=await client.get(`${route}/tracking`)
  assert.match(cancelledTracking.text,/취소된 주문으로 배송이 진행되지 않습니다/)
  assert.doesNotMatch(cancelledTracking.text,/이후 순차 배송|결제 후 [1-3]–[1-3]일/)
  assert.doesNotMatch((await client.get(route)).text,/이후 순차 배송|결제 후 [1-3]–[1-3]일/)
  await stranger.post(`${BASE}/login`,LOGIN)
  assert.doesNotMatch((await stranger.get(`${BASE}/account/orders`)).text,new RegExp(order.order_number))
  for(const target of [route,`${route}/tracking`,path(done)])assert.equal((await stranger.get(target)).status,404)
  for(const action of ['action','reorder'])assert.equal((await stranger.post(`${route}/${action}`,{action:'cancel',reason:'forged'})).status,404)
  await client.post(`${BASE}/logout`)
  assert.equal((await client.get(path(done))).status,404)
  await client.post(`${BASE}/register`,signup('journey-other-owner@example.com'))
  assert.equal((await client.get(route)).status,404)
  assert.doesNotMatch((await client.get(`${BASE}/account/orders`)).text,new RegExp(order.order_number))
  await client.post(`${BASE}/logout`)
  await client.post(`${BASE}/login`,LOGIN)
  assert.match((await client.get(route)).text,/취소 완료/)
 }finally{await server.close()}
})

test('coupang journeys: reorder validates all lines atomically, uses trusted variants and requires a new checkout',async()=>{
 const server=await startServer()
 try {
  const client=server.client()
  await client.post(`${BASE}/login`,LOGIN)
  await client.post(`${BASE}/cart/add`,{sku:'CP-MILK-10-24',qty:'2'})
  await client.post(`${BASE}/cart/add`,{sku:'CP-GTA6-XBOX',qty:'1'})
  await client.post(`${BASE}/checkout/order`,ORDER)
  const [order]=await client.json('/api/orders?store=coupang')
  const route=`${BASE}/account/orders/${order.order_number}/reorder`
  await client.post(`${BASE}/cart/add`,{sku:'CP-GTA6-XBOX',qty:'4'})
  const over=await client.post(route,{sku:'CP-PIANO-ALBUM',unit_price:'1'})
  assert.equal(over.status,400);assert.match(over.text,/최대 4개/)
  assert.doesNotMatch((await client.get(`${BASE}/cart`)).text,/name="sku" value="CP-MILK-10-24"/)
  await client.post(`${BASE}/cart/update`,{sku:'CP-GTA6-XBOX',action:'remove'})
  const reordered=await client.post(route,{sku:'CP-PIANO-ALBUM',unit_price:'1',kind:'other',qty:'99'})
  assert.equal(path(reordered),`${BASE}/cart`);assert.match(reordered.text,/123,600원/);assert.match(reordered.text,/200ml \/ 24팩/)
  assert.equal((await client.json('/api/orders?store=coupang')).length,1)
  await client.post(`${BASE}/checkout/order`,ORDER)
  const orders=await client.json('/api/orders?store=coupang')
  assert.equal(orders.length,2);assert.deepEqual(orders[1].items,order.items)
  assert.equal(orders[1].currency,'KRW');assert.equal(orders[1].items[0].kind,'other');assert.equal(orders[1].items[1].kind,'game')
 }finally{await server.close()}
})

test('coupang journeys: Korean help search, private inquiries and product questions persist without invented responses',async()=>{
 const server=await startServer()
 try {
  const client=server.client(),stranger=server.client()
  const help=await client.get(`${BASE}/help?q=${encodeURIComponent('비밀번호')}&category=${encodeURIComponent('회원정보')}`)
  assert.match(help.text,/아이디나 비밀번호를 잊어버렸어요/)
  assert.match((await client.get(`${BASE}/help?q=not-a-topic`)).text,/검색 결과가 없습니다/)
  assert.equal((await client.get(`${BASE}/help/articles/unknown`)).status,404)
  assert.doesNotMatch((await client.get(`${BASE}/help/articles/password`)).text,/tester@example\.com|Password123!/)
  assert.doesNotMatch((await client.get(`${BASE}/register`)).text,/로컬 회원정보 저장 및 모의 쇼핑 이용/)
  for(const id of ['delivery','cancel','returns','address','payment','damaged','preorder','account','password','wishlist','fresh','options','terms-privacy'])assert.equal((await client.get(`${BASE}/help/articles/${id}`)).status,200,id)
  const {order}=await purchase(client,'CP-MILK-10-24')
  const form={category:'배송',subject:'배송 요청 내용을 확인하고 싶습니다.',message:'문 앞 배송 요청사항이 잘 저장되었는지 확인하고 싶습니다.',email:LOGIN.email,order_id:order.order_number}
  const invalid=await client.post(`${BASE}/help/inquiries`,{...form,message:'짧음'})
  assert.equal(invalid.status,400);assert.match(invalid.text,/10자 이상/);assert.equal(fieldValue(invalid.text,'subject'),form.subject)
  assert.equal((await client.post(`${BASE}/help/inquiries`,{...form,category:'forged'})).status,400)
  assert.equal((await client.post(`${BASE}/help/inquiries`,{...form,order_id:'forged'})).status,400)
  const created=await client.post(`${BASE}/help/inquiries`,{...form,message:form.message+' <script>alert(1)</script>'})
  assert.match(created.text,/문의가 접수되었습니다/);assert.match(created.text,/답변 대기/);assert.doesNotMatch(created.text,/<script>alert\(1\)<\/script>/)
  assert.match((await client.get(`${BASE}/help/inquiries`)).text,/배송 요청 내용을 확인/)
  await stranger.post(`${BASE}/login`,LOGIN)
  assert.equal((await stranger.get(path(created))).status,404)
  assert.equal((await stranger.post(`${BASE}/help/inquiries`,form)).status,400)
  const question=await client.post(`${BASE}/vp/products/milk-10/questions`,{sku:'CP-MILK-10-24',message:'개봉 전에는 실온에 보관해도 되나요?'})
  assert.match(question.text,/답변 대기/);assert.match(question.text,/개봉 전에는 실온에 보관해도 되나요/)
  assert.equal((await client.post(`${BASE}/vp/products/milk-10/questions`,{sku:'CP-GTA6-PS5',message:'잘못된 옵션 문의입니다.'})).status,400)
  const short=await client.post(`${BASE}/vp/products/milk-10/questions`,{sku:'CP-MILK-10-24',message:'안녕'})
  assert.equal(short.status,400);assert.match(short.text,/>안녕<\/textarea>/)
  assert.doesNotMatch((await stranger.get(`${BASE}/vp/products/milk-10?tab=questions`)).text,/개봉 전에는 실온에 보관해도 되나요/)
  await client.post(`${BASE}/logout`)
  await client.post(`${BASE}/register`,signup('journey-case-owner@example.com'))
  assert.equal((await client.get(path(created))).status,404)
 }finally{await server.close()}
})
