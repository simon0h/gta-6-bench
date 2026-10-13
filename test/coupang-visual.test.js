import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer, fieldValue } from './helpers.js'
import { products, bySku } from '../stores/coupang/catalog.js'
const B='/coupang'
const LOGIN={email:'tester@example.com',password:'Password123!'}
const ORDER={recipient:'김민수',phone:'01012345678',postcode:'04524',city:'서울특별시',address:'중구 세종대로 110',address_detail:'101호',payment_method:'card',card_name:'Minsu Kim',card_number:'4242424242424242',card_expiry:'12/39',card_cvv:'123',agree:'yes'}
const path=r=>new URL(r.url).pathname
const selection=(skus,action='checkout')=>new URLSearchParams([['action',action],...skus.map(sku=>['selected',sku])])
const skus=html=>[...html.matchAll(/data-cart-sku="([^"]+)"/g)].map(m=>m[1])
async function add(c,sku,qty=1,intent='cart'){return c.post(B+'/cart/add',{sku,qty:String(qty),intent})}

test('coupang visual: selected mixed-delivery checkout keeps unselected basket, recomputes canonical totals and retries once',async()=>{
 const server=await startServer()
 try{
  const c=server.client(),rocket=bySku('CP-MILK-10'),fresh=products.find(p=>p.delivery==='fresh'),seller=products.find(p=>p.delivery==='seller'&&p.kind)
  await add(c,rocket.sku,2);await add(c,fresh.sku);await add(c,seller.sku);await add(c,'CP-GTA6-PS5')
  const cart=await c.get(B+'/cart')
  assert.match(cart.text,/cart-group rocket/);assert.match(cart.text,/cart-group fresh/);assert.match(cart.text,/cart-group seller/)
  assert.equal((await c.post(B+'/cart/selection',selection([]))).status,400)
  assert.equal((await c.post(B+'/cart/selection',selection(['CP-NOT-IN-CART']))).status,400)
  assert.equal(path(await c.post(B+'/cart/selection',selection([fresh.sku,'CP-GTA6-PS5']))),B+'/login')
  const checkout=await c.post(B+'/login',LOGIN)
  assert.equal(path(checkout),B+'/checkout')
  assert.match(checkout.text,/냉장 포장 · 결제 후 1–2일/)
  assert.match(checkout.text,/이후 순차 배송/)
  assert.doesNotMatch(checkout.text,new RegExp(rocket.title.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')))
  const token=fieldValue(checkout.text,'checkout_token')
  const done=await c.post(B+'/checkout/order',{...ORDER,checkout_token:token,price:'1',total:'1',selected:rocket.sku})
  assert.match(path(done),/confirmation/)
  const [order]=await c.json('/api/orders?store=coupang')
  assert.deepEqual(order.items.map(i=>i.sku),[fresh.sku,'CP-GTA6-PS5'])
  assert.equal(order.items[0].kind,'other');assert.equal(order.items[0].platform,undefined)
  assert.equal(order.items[1].kind,'game');assert.equal(order.items[1].unit_price,89800)
  assert.equal(order.totals.total,fresh.price+89800)
  assert.equal(order.fulfillment.option,'grouped_delivery')
  assert.deepEqual(order.meta.delivery_groups.map(g=>g.delivery),['fresh','seller'])
  assert.deepEqual(skus((await c.get(B+'/cart')).text),[rocket.sku,seller.sku])
  assert.equal(path(await c.post(B+'/checkout/order',{...ORDER,checkout_token:token})),path(done))
  assert.equal((await c.json('/api/orders?store=coupang')).length,1)
  assert.equal((await server.client().get(path(done))).status,404)
 }finally{await server.close()}
})

test('coupang visual: buy-now isolates same SKU and unrelated basket through login, errors, completion and cancellation',async()=>{
 const server=await startServer()
 try{
  const c=server.client()
  await add(c,'CP-MILK-10',2);await add(c,'CP-GTA6-XBOX',4)
  assert.equal(path(await add(c,'CP-GTA6-XBOX',1,'buy')),B+'/login')
  const checkout=await c.post(B+'/login',LOGIN)
  assert.match(checkout.text,/바로구매 상품 \(1개\)/)
  assert.doesNotMatch(checkout.text,/목장일기/)
  const token=fieldValue(checkout.text,'checkout_token')
  const bad=await c.post(B+'/checkout/order',{...ORDER,card_number:'1111111111111111',checkout_token:token})
  assert.equal(bad.status,400);assert.doesNotMatch(bad.text,/1111111111111111/)
  assert.deepEqual(skus((await c.get(B+'/cart')).text),['CP-MILK-10','CP-GTA6-XBOX'])
  const done=await c.post(B+'/checkout/order',{...ORDER,checkout_token:token})
  const [order]=await c.json('/api/orders?store=coupang')
  assert.equal(order.totals.total,89800);assert.equal(order.items.length,1);assert.equal(order.items[0].qty,1)
  const basket=await c.get(B+'/cart')
  assert.match(basket.text,/name="qty_CP-GTA6-XBOX"[^>]+value="4"/)
  assert.match(basket.text,/name="qty_CP-MILK-10"[^>]+value="2"/)
  assert.equal(path(await c.post(B+'/checkout/order',{...ORDER,checkout_token:token})),path(done))
  await add(c,'CP-MILK-10-24',1,'buy')
  assert.equal(path(await c.post(B+'/checkout/cancel',{})),B+'/cart')
  assert.deepEqual(skus((await c.get(B+'/cart')).text),['CP-MILK-10','CP-GTA6-XBOX'])
  assert.equal((await c.json('/api/orders?store=coupang')).length,1)
 }finally{await server.close()}
})

test('coupang visual: cart option editing merges atomically, rejects cross-product and honors current trusted prices',async()=>{
 const server=await startServer()
 try{
  const c=server.client()
  await add(c,'CP-MILK-10',2);await add(c,'CP-MILK-10-24',2)
  assert.equal((await c.post(B+'/cart/option',{sku:'CP-MILK-10',new_sku:'CP-GTA6-PS5'})).status,400)
  assert.deepEqual(skus((await c.get(B+'/cart')).text),['CP-MILK-10','CP-MILK-10-24'])
  await c.post(B+'/cart/selection',selection(['CP-MILK-10'],'save-selection'))
  const merged=await c.post(B+'/cart/option',{sku:'CP-MILK-10',new_sku:'CP-MILK-10-24',price:'1',kind:'game'})
  assert.deepEqual(skus(merged.text),['CP-MILK-10-24'])
  assert.match(merged.text,/name="qty_CP-MILK-10-24"[^>]+value="4"/)
  assert.match(merged.text,/value="CP-MILK-10-24"[^>]+ checked/)
  await add(c,'CP-MILK-10',1)
  assert.equal((await c.post(B+'/cart/option',{sku:'CP-MILK-10',new_sku:'CP-MILK-10-24'})).status,400)
  assert.equal(skus((await c.get(B+'/cart')).text).length,2)
  await c.post(B+'/cart/selection',selection(['CP-MILK-10-24']))
  await c.post(B+'/login',LOGIN)
  await c.post(B+'/checkout/order',ORDER)
  const [order]=await c.json('/api/orders?store=coupang')
  assert.equal(order.items[0].kind,'other');assert.equal(order.items[0].qty,4)
  assert.equal(order.totals.total,4*16900)
  assert.deepEqual(skus((await c.get(B+'/cart')).text),['CP-MILK-10'])
 }finally{await server.close()}
})

test('coupang visual: saved-for-later keeps SKU and quantity, validates restore caps and isolates members and sessions',async()=>{
 const server=await startServer()
 try{
  const c=server.client()
  await c.post(B+'/login',LOGIN);await add(c,'CP-MILK-10-24',2)
  const saved=await c.post(B+'/cart/update',{sku:'CP-MILK-10-24',action:'save'})
  assert.deepEqual(skus(saved.text),[]);assert.match(saved.text,/나중에 구매할 상품 \(1\)/)
  await add(c,'CP-MILK-10-24',3)
  assert.equal((await c.post(B+'/cart/saved',{sku:'CP-MILK-10-24',action:'restore'})).status,400)
  assert.match((await c.get(B+'/cart')).text,/나중에 구매할 상품 \(1\)/)
  await c.post(B+'/cart/update',{sku:'CP-MILK-10-24',action:'remove'})
  await c.post(B+'/logout',{})
  assert.doesNotMatch((await c.get(B+'/cart')).text,/나중에 구매할 상품 \(1\)/)
  assert.equal((await c.post(B+'/cart/saved',{sku:'CP-MILK-10-24',action:'restore'})).status,400)
  assert.doesNotMatch((await server.client().get(B+'/cart')).text,/나중에 구매할 상품 \(1\)/)
  await c.post(B+'/login',LOGIN)
  const restored=await c.post(B+'/cart/saved',{sku:'CP-MILK-10-24',action:'restore',qty:'4',price:'1'})
  assert.match(restored.text,/name="qty_CP-MILK-10-24"[^>]+value="2"/)
  assert.doesNotMatch(restored.text,/나중에 구매할 상품 \(1\)/)
  await c.get(B+'/checkout');await c.post(B+'/checkout/order',ORDER)
  assert.equal((await c.json('/api/orders?store=coupang'))[0].totals.total,33800)
 }finally{await server.close()}
})

test('coupang visual: stale checkout forms cannot purchase a changed selection and standalone chrome links are real',async()=>{
 const server=await startServer()
 try{
  const c=server.client()
  const home=await c.get(B)
  assert.match(home.text,/groceries-campaign.png/);assert.match(home.text,/recent-rail/)
  const category=await c.get(B+'/np/categories/electronics')
  assert.match(category.text,/category-photo-hero/);assert.match(category.text,/electronics-campaign.png/)
  const login=await c.get(B+'/login')
  assert.match(login.text,/auth-page/);assert.doesNotMatch(login.text,/class="search"|class="main-nav"/)
  const cart=await c.get(B+'/cart')
  assert.match(cart.text,/commerce-header/);assert.doesNotMatch(cart.text,/class="search"|class="main-nav"/)
  await c.post(B+'/login',LOGIN);await add(c,'CP-GTA6-PS5');await add(c,'CP-MILK-10')
  const a=await c.post(B+'/cart/selection',selection(['CP-GTA6-PS5']))
  const token=fieldValue(a.text,'checkout_token')
  await c.post(B+'/cart/selection',selection(['CP-MILK-10']))
  const stale=await c.post(B+'/checkout/order',{...ORDER,checkout_token:token})
  assert.equal(stale.status,400);assert.match(stale.text,/주문 화면이 변경/)
  assert.deepEqual(await c.json('/api/orders?store=coupang'),[])
  const fresh=fieldValue(stale.text,'checkout_token')
  await c.post(B+'/checkout/order',{...ORDER,checkout_token:fresh})
  assert.deepEqual((await c.json('/api/orders?store=coupang'))[0].items.map(i=>i.sku),['CP-MILK-10'])
  assert.deepEqual(skus((await c.get(B+'/cart')).text),['CP-GTA6-PS5'])
 }finally{await server.close()}
})
