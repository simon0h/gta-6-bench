import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer, fieldValue } from './helpers.js'
import { products, bySku, photoKey, media } from '../stores/coupang/catalog.js'
const B='/coupang', LOGIN={email:'tester@example.com',password:'Password123!'}
const ORDER={recipient:'김민수',phone:'01012345678',postcode:'04524',city:'서울특별시',address:'중구 세종대로 110',address_detail:'101호',payment_method:'card',card_name:'Minsu Kim',card_number:'4242424242424242',card_expiry:'12/39',card_cvv:'123',agree:'yes'}
const selection=(skus,action='save-selection')=>new URLSearchParams([['action',action],...skus.map(sku=>['selected',sku])])
const path=r=>new URL(r.url).pathname
const selected=html=>[...html.matchAll(/name="selected" value="([^"]+)"[^>]* checked/g)].map(m=>m[1])
const add=(c,sku,qty='1')=>c.post(B+'/cart/add',{sku,qty})

test('coupang verification: empty selection persists through quantity/option edits and reorder selects only reordered lines',async()=>{
 const server=await startServer()
 try {
  const c=server.client();await c.post(B+'/login',LOGIN)
  await add(c,'CP-MILK-10-24');await c.post(B+'/checkout/order',ORDER)
  const [order]=await c.json('/api/orders?store=coupang')
  await add(c,'CP-GTA6-PS5');await add(c,'CP-MILK-10')
  await c.post(B+'/cart/selection',selection([]))
  assert.deepEqual(selected((await c.post(B+'/cart/update',{sku:'CP-GTA6-PS5',action:'update','qty_CP-GTA6-PS5':'2'})).text),[])
  assert.deepEqual(selected((await c.post(B+'/cart/option',{sku:'CP-MILK-10',new_sku:'CP-MILK-10-6'})).text),[])
  assert.equal(path(await c.get(B+'/checkout')),B+'/cart')
  assert.equal(path(await c.post(B+'/checkout/order',ORDER)),B+'/cart')
  assert.equal((await c.json('/api/orders?store=coupang')).length,1)
  const reordered=await c.post(`${B}/account/orders/${order.order_number}/reorder`,{qty:'99',price:'1'})
  assert.deepEqual(selected(reordered.text),['CP-MILK-10-24'])
  const checkout=await c.get(B+'/checkout'),token=fieldValue(checkout.text,'checkout_token')
  await c.post(B+'/cart/update',{sku:'CP-MILK-10-24',action:'save'})
  assert.equal(path(await c.post(B+'/checkout/order',{...ORDER,checkout_token:token})),B+'/cart')
  assert.equal((await c.json('/api/orders?store=coupang')).length,1)
  assert.deepEqual(selected((await c.post(B+'/cart/saved',{sku:'CP-MILK-10-24',action:'restore'})).text),['CP-MILK-10-24'])
 }finally{await server.close()}
})

test('coupang verification: saved SKU restoration and stale checkout are isolated after account switch',async()=>{
 const server=await startServer()
 try {
  const c=server.client();await c.post(B+'/login',LOGIN);await add(c,'CP-MILK-10-24','2')
  const firstToken=fieldValue((await c.get(B+'/checkout')).text,'checkout_token')
  await c.post(B+'/cart/update',{sku:'CP-MILK-10-24',action:'save'})
  await c.post(B+'/logout')
  await c.post(B+'/register',{email:'verification-other@example.com',password:'Other123!',password_confirm:'Other123!',first_name:'박지민',phone:'01098765432',agree:'yes'})
  for(const action of ['restore','remove'])assert.equal((await c.post(B+'/cart/saved',{sku:'CP-MILK-10-24',action})).status,400)
  await add(c,'CP-WATER-24');await c.get(B+'/checkout')
  const stale=await c.post(B+'/checkout/order',{...ORDER,checkout_token:firstToken})
  assert.equal(stale.status,400);assert.match(stale.text,/주문 화면이 변경/)
  assert.deepEqual(await c.json('/api/orders?store=coupang'),[])
  await c.post(B+'/logout');await c.post(B+'/login',LOGIN)
  const restored=await c.post(B+'/cart/saved',{sku:'CP-MILK-10-24',action:'restore',qty:'4',unit_price:'1'})
  assert.match(restored.text,/name="qty_CP-MILK-10-24"[^>]*value="2"/)
  assert.doesNotMatch(restored.text,/나중에 구매할 상품 \(1\)/)
 }finally{await server.close()}
})

test('coupang verification: mixed Fresh, ordinary hardware and preorder preserve delivery truth and trusted item identity',async()=>{
 const server=await startServer()
 try {
  const c=server.client();await c.post(B+'/login',LOGIN)
  assert.equal((await c.post(B+'/cart/add',{product_id:'milk-10',sku:'CP-GTA6-PS5',qty:'1',price:'1'})).status,400)
  assert.doesNotMatch((await c.get(B+'/cart')).text,/data-cart-sku=/)
  for(const sku of ['CP-FRESH-MILK','CP-PS5-CONSOLE','CP-GTA6-XBOX'])await c.post(B+'/cart/add',{sku,qty:'1',kind:'game',platform:'ps5',unit_price:'1',price:'1'})
  const checkout=await c.get(B+'/checkout')
  assert.match(checkout.text,/냉장 포장 · 결제 후 1–2일/)
  assert.match(checkout.text,/결제 후 1–3일/)
  assert.match(checkout.text,/예약상품은 박스 내 다운로드 코드 구성/)
  assert.match(checkout.text,/일반 상품의 도착 예정은 각 배송 묶음/)
  const done=await c.post(B+'/checkout/order',{...ORDER,checkout_token:fieldValue(checkout.text,'checkout_token'),total:'1',sku:'CP-MILK-10',kind:'other'})
  const [order]=await c.json('/api/orders?store=coupang')
  assert.deepEqual(order.items.map(i=>i.kind),['other','other','game'])
  assert.equal(order.items[1].platform,undefined);assert.equal(order.items[2].platform,'xbox')
  assert.equal(order.totals.total,['CP-FRESH-MILK','CP-PS5-CONSOLE','CP-GTA6-XBOX'].reduce((sum,s)=>sum+bySku(s).price,0))
  assert.equal(order.items[2].unit_price,89800);assert.equal(order.items[2].format,'code-in-box')
  assert.match(done.text,/냉장 포장 · 결제 후 1–2일/);assert.match(done.text,/이후 순차 배송/)
  assert.equal((await c.get(`${B}/account/orders/${order.order_number}/tracking`)).status,200)
 }finally{await server.close()}
})

test('coupang verification: product photography uses matching families and avoids known incompatible color/type packshots',()=>{
 const product=id=>products.find(p=>p.id===id)
 for(const [id,key] of [['dog-toy','rope-toy'],['face-cleanser','foaming-cleanser'],['body-wash','citrus-bodywash'],['desk-fan','desk-fan-white'],['soup-pot','steel-pot'],['storage-basket','fabric-basket-gray'],['portable-ssd','portable-ssd'],['wireless-earbuds','earbuds-white'],['bluetooth-speaker','speaker-green'],['desk-lamp','desk-lamp-white'],['canvas-tote','tote'],['usb-hub','usb-hub'],['gaming-headset','gaming-headset'],['ps5-console','ps5-console'],['xbox-console','xbox-console']])assert.equal(photoKey(product(id)),key)
 for(const [id,key] of [['xbox-controller','xbox-controller-black'],['switch-case','handheld-case-navy'],['mechanical-keyboard','keyboard-tkl-white'],['wireless-mouse','mouse-gray'],['digital-scale','digital-scale-white'],['baby-bowl','feeding-plate-mint']])assert.equal(photoKey(product(id)),key)
 assert.ok(!photoKey(product('linen-shirt')))
 assert.equal(photoKey(bySku('CP-YOGA-MAT')),'yoga-mat-lavender')
 assert.equal(photoKey(bySku('CP-YOGA-MAT-BLUE')),'yoga-mat-blue')
 assert.ok(!photoKey(bySku('CP-YOGA-MAT-THICK')))
 for(const sku of ['CP-PAD-WHITE-BLACK','CP-PAD-WHITE-BLUE','CP-COTTON-SHIRT-NAVY'])assert.ok(!photoKey(bySku(sku)),sku)
 assert.equal(photoKey(bySku('CP-AUDIO-01-CREAM')),'headphones-cream')
 assert.match(media(B,product('canvas-tote')),/data-product-asset src="\/product-assets\/coupang\/canvas-tote\/0\.svg/)
 assert.match(media(B,product('portable-ssd')),/data-product-asset src="\/product-assets\/coupang\/portable-ssd\/0\.svg/)
})
