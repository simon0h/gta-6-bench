import { assertProductGallery } from './product-gallery-assertions.js'
import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer } from './helpers.js'

const details={recipient:'김민수',phone:'010-1234-5678',postal_code:'06236',city:'서울특별시 강남구',line1:'테헤란로 123',line2:'101호',name_on_card:'Minsu Kim',card_number:'4242424242424242',expiry:'12/99',cvv:'123',terms:'1'}

test('gmarket verification: non-default options retain truthful names, prices and review navigation through saved cart and receipt',async()=>{
 const srv=await startServer()
 try{
  const c=srv.client()
  const pdp=await c.get('/gmarket/product/gm-controller?variant=black')
  await assertProductGallery(c,pdp.text,'gmarket','gm-controller','black')
  assert.match(pdp.text,/class="review-line" href="\/gmarket\/product\/gm-controller\?variant=black&amp;tab=reviews"/)
  for(const [sku,variant,title] of [['gm-controller','black','소니 PS5 듀얼센스 무선 컨트롤러 [미드나이트 블랙]'],['gm-towels','ten','코튼 호텔수건 선택형 세트 [혼합색상 10장]']]){
   const key=sku+'--'+variant
   await c.post('/gmarket/cart/add',{sku,variant,qty:'1',action:'cart'})
   await c.post('/gmarket/cart/update',{line_key:key,action:'save'})
   const saved=await c.get('/gmarket/cart');assert.ok(saved.text.includes(title))
   await c.post('/gmarket/cart/saved',{line_key:key,action:'restore'})
  }
  await c.post('/gmarket/account',{action:'guest',guest_email:'variants@example.com'})
  const checkout=await c.get('/gmarket/checkout')
  assert.match(checkout.text, /data-product-asset src="\/product-assets\/gmarket\/gm-controller\/0\.svg\?variant=black"/)
  const black=await c.get('/product-assets/gmarket/gm-controller/0.svg?variant=black')
  const white=await c.get('/product-assets/gmarket/gm-controller/0.svg?variant=white')
  assert.equal(black.status,200);assert.equal(white.status,200);assert.notEqual(black.text,white.text)
  assert.doesNotMatch(checkout.text,/화이트 \[미드나이트 블랙\]|5장 혼합색상 \[혼합색상 10장\]/)
  const done=await c.post('/gmarket/checkout',details);assert.equal(done.status,200)
  const [order]=await c.json('/api/orders?store=gmarket')
  assert.deepEqual(order.items.map(p=>[p.title,p.unit_price,p.kind]),[['소니 PS5 듀얼센스 무선 컨트롤러 [미드나이트 블랙]',84800,'other'],['코튼 호텔수건 선택형 세트 [혼합색상 10장]',35900,'other']])
  assert.equal(order.totals.total,126700)
 }finally{await srv.close()}
})
