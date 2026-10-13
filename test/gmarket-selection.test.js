import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer } from './helpers.js'
import { bySku, products } from '../stores/gmarket/data.js'

const path=r=>new URL(r.url).pathname
const DETAILS={recipient:'김민수',phone:'010-1234-5678',postal_code:'06236',city:'서울특별시 강남구',line1:'테헤란로 123',line2:'101호',name_on_card:'Minsu Kim',card_number:'4242424242424242',expiry:'12/99',cvv:'123',terms:'1'}
const login=c=>c.post('/gmarket/account',{action:'signin',email:'tester@example.com',password:'Password123!'})
const add=(c,sku,qty='1',variant='',action='cart')=>c.post('/gmarket/cart/add',{sku,qty,variant,action,age_confirmed:'1'})
const select=(c,keys,action='checkout')=>{const form=new URLSearchParams({action});keys.forEach(key=>form.append('line_key',key));return c.post('/gmarket/cart/select',form)}
const cartKeys=html=>[...html.matchAll(/data-cart-line="([^"]+)"/g)].map(m=>m[1])
const register=(c,email,extra={})=>c.post('/gmarket/account/register',{email,first_name:'새 회원',phone:'010-1234-5678',password:'SecurePass123!',password_confirm:'SecurePass123!',terms:'1',...extra})

test('gmarket selection: coupon threshold, seller shipping and order use the same selected lines; remaining variants survive',async()=>{
 const srv=await startServer()
 try{
  const c=srv.client();await login(c);await c.post('/gmarket/benefits/claim',{coupon_id:'pantry10'})
  await add(c,'gm-milk');await add(c,'gm-ramen');await add(c,'gm-controller','1','white');await add(c,'gm-controller','1','black');await add(c,'4796016651')
  assert.equal((await select(c,['gm-milk'])).status,200)
  assert.equal((await c.post('/gmarket/checkout/coupon',{coupon_id:'pantry10',discount:'99999'})).status,400,'Unselected ramen cannot meet the minimum')
  await select(c,['gm-milk','gm-ramen'])
  const quote=await c.post('/gmarket/checkout/coupon',{coupon_id:'pantry10'});assert.match(quote.text,/37,800원 결제하기/);assert.doesNotMatch(quote.text,/예약상품은 출시 일정에 맞춰 발송됩니다/);assert.doesNotMatch(quote.text,/듀얼센스|GTA6/)
  assert.equal((await c.post('/gmarket/checkout',{...DETAILS,card_number:'1'})).status,400)
  assert.doesNotMatch((await c.get('/gmarket/account/coupons')).text,/사용완료/)
  await c.post('/gmarket/checkout',{...DETAILS,total:'1',shipping:'0'})
  const [order]=await c.json('/api/orders?store=gmarket')
  assert.deepEqual(order.items.map(p=>p.sku),['gm-milk','gm-ramen']);assert.deepEqual(order.totals,{subtotal:37800,shipping:3000,tax:0,discount:3000,total:37800});assert.equal(order.meta.preorder,false)
  assert.deepEqual(cartKeys((await c.get('/gmarket/cart')).text),['gm-controller--white','gm-controller--black','4796016651'])
  assert.match((await c.get('/gmarket/account/coupons')).text,/사용완료/)
  assert.equal(path(await c.post('/gmarket/checkout',DETAILS)),'/gmarket/cart');assert.equal((await c.json('/api/orders?store=gmarket')).length,1,'Payment replay must not purchase the remaining basket')
 }finally{await srv.close()}
})

test('gmarket selection: buy-now excludes basket goods and preserves an identical basket line after coupon purchase',async()=>{
 const srv=await startServer()
 try{
  const c=srv.client();await login(c);await c.post('/gmarket/benefits/claim',{coupon_id:'pantry10'})
  await add(c,'gm-milk','5');await add(c,'4796017670')
  const buy=await add(c,'gm-milk','2','','buy');assert.equal(buy.status,200);assert.match(buy.text,/43,800원/);assert.doesNotMatch(buy.text,/Xbox Series X\|S GTA6/)
  await c.post('/gmarket/checkout/coupon',{coupon_id:'pantry10'});await c.post('/gmarket/checkout',DETAILS)
  const [order]=await c.json('/api/orders?store=gmarket');assert.equal(order.items.length,1);assert.equal(order.items[0].sku,'gm-milk');assert.equal(order.items[0].qty,2);assert.equal(order.totals.total,43800)
  const basket=(await c.get('/gmarket/cart')).text;assert.deepEqual(cartKeys(basket),['gm-milk','4796017670']);assert.match(basket,/id="qty-gm-milk"[^>]*value="5"/)
  await add(c,'4796016651','1','','buy');const preview=await c.get('/gmarket/checkout');assert.match(preview.text,/89,800원 결제하기/);assert.doesNotMatch(preview.text,/고소한 멸균우유 1L 10팩/)
  assert.deepEqual(cartKeys((await c.get('/gmarket/cart')).text),['gm-milk','4796017670'],'Abandoning buy-now does not mutate the basket')
  await select(c,['4796017670']);await c.post('/gmarket/checkout',DETAILS)
  const orders=await c.json('/api/orders?store=gmarket');assert.equal(orders[1].items[0].platform,'xbox');assert.equal(orders[1].items[0].kind,'game');assert.deepEqual(cartKeys((await c.get('/gmarket/cart')).text),['gm-milk'])
 }finally{await srv.close()}
})

test('gmarket cart services and options: filtering is truthful; changing, saving and restoring retains exact identity and stock rules',async()=>{
 const srv=await startServer()
 try{
  const c=srv.client(),other=srv.client();await login(c)
  const star=products.find(p=>p.delivery==='star'&&!p.variants),today=products.find(p=>p.delivery==='today'&&!p.variants)
  await add(c,star.sku);await add(c,today.sku);await add(c,'gm-controller','1','white');await add(c,'gm-controller','1','black')
  assert.deepEqual(cartKeys((await c.get('/gmarket/cart?service=star')).text),[star.sku]);assert.deepEqual(cartKeys((await c.get('/gmarket/cart?service=today')).text),[today.sku])
  const emart=await c.get('/gmarket/cart?service=emart'),sameday=await c.get('/gmarket/cart?service=sameday');assert.deepEqual(cartKeys(emart.text),[]);assert.match(emart.text,/이마트몰 전용 상품이 없습니다/);assert.deepEqual(cartKeys(sameday.text),[]);assert.match(sameday.text,/당일 도착을 보장하는 상품은 없습니다/)
  await select(c,['gm-controller--white'],'review');assert.equal((await select(c,['forged'])).status,400);assert.equal((await select(c,[])).status,400)
  assert.equal((await c.post('/gmarket/cart/update',{line_key:'gm-controller--white',action:'option',variant:'pink'})).status,400)
  assert.equal((await c.post('/gmarket/cart/update',{line_key:'gm-controller--white',action:'option',variant:'forged'})).status,400)
  await c.post('/gmarket/cart/update',{line_key:'gm-controller--white',action:'option',variant:'black',unit_price:'1'})
  let basket=await c.get('/gmarket/cart');assert.ok(!cartKeys(basket.text).includes('gm-controller--white'));assert.match(basket.text,/id="qty-gm-controller--black"[^>]*value="2"/)
  const checkout=await c.get('/gmarket/checkout');assert.match(checkout.text,/172,600원 결제하기/);assert.doesNotMatch(checkout.text,new RegExp(bySku(star.sku).title))
  await c.post('/gmarket/cart/update',{line_key:'gm-controller--black',action:'save'});basket=await c.get('/gmarket/cart');assert.ok(!cartKeys(basket.text).includes('gm-controller--black'));assert.match(basket.text,/장바구니로 이동/)
  assert.equal((await other.post('/gmarket/cart/saved',{line_key:'gm-controller--black',action:'restore'})).status,400)
  await c.post('/gmarket/cart/saved',{line_key:'gm-controller--black',action:'restore'});assert.match((await c.get('/gmarket/cart')).text,/id="qty-gm-controller--black"[^>]*value="2"/)
  await c.post('/gmarket/cart/update',{line_key:'gm-controller--black',action:'save'});await add(c,'gm-controller','4','black')
  assert.equal((await c.post('/gmarket/cart/saved',{line_key:'gm-controller--black',action:'restore'})).status,400)
  assert.match((await c.get('/gmarket/cart')).text,/장바구니로 이동/,'Failed restore leaves the saved entry intact')
 }finally{await srv.close()}
})

test('gmarket registration: safe validation, guest saved items and favorite/follow intents resume without cross-account leakage',async()=>{
 const srv=await startServer()
 try{
  const c=srv.client(),follow=srv.client(),other=srv.client()
  await add(c,'gm-controller','1','white');await c.post('/gmarket/cart/update',{line_key:'gm-controller--white',action:'save'})
  await c.post('/gmarket/product/gm-milk/favorite');const bad=await register(c,'new-gm-a@example.com',{first_name:'<새 회원>',password_confirm:'wrong'})
  assert.equal(bad.status,400);assert.match(bad.text,/&lt;새 회원&gt;/);assert.doesNotMatch(bad.text,/SecurePass123!|value="wrong"/)
  const joined=await register(c,'new-gm-a@example.com');assert.equal(path(joined),'/gmarket/product/gm-milk');assert.match((await c.get('/gmarket/account/wishlist')).text,/href="\/gmarket\/product\/gm-milk"/);assert.match((await c.get('/gmarket/cart')).text,/장바구니로 이동/)
  await c.post('/gmarket/cart/saved',{line_key:'gm-controller--white',action:'restore'});const memberCheckout=await c.get('/gmarket/checkout');assert.match(memberCheckout.text,/id="phone"[^>]*value="010-1234-5678"/);await c.post('/gmarket/cart/update',{line_key:'gm-controller--white',action:'save'});await c.post('/gmarket/account/signout');await c.post('/gmarket/account',{action:'signin',email:'tester@example.com',password:'Password123!'});assert.doesNotMatch((await c.get('/gmarket/account/wishlist')).text,/href="\/gmarket\/product\/gm-milk"/);assert.doesNotMatch((await c.get('/gmarket/cart')).text,/장바구니로 이동/)
  assert.equal((await register(other,'NEW-GM-A@example.com')).status,400);assert.match((await other.get('/gmarket/account?mode=guest')).text,/name="guest_email"/)
  await follow.post('/gmarket/seller/h2/follow');assert.equal(path(await register(follow,'new-gm-b@example.com')),'/gmarket/seller/h2');assert.match((await follow.get('/gmarket/account/followed-stores')).text,/h2몰/)
  await other.get('/gmarket/account/register?next='+encodeURIComponent('/gmarket/%2e%2e/amazon/cart'));assert.equal(path(await register(other,'new-gm-c@example.com')),'/gmarket/account/overview')
 }finally{await srv.close()}
})
