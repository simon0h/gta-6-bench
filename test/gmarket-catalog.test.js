import { assertProductGallery } from './product-gallery-assertions.js'
import test from 'node:test'
import assert from 'node:assert/strict'
import { products, departments, sellers, search, sorts, bySku, totals } from '../stores/gmarket/data.js'
import { startServer } from './helpers.js'
const ids=html=>[...html.matchAll(/<article data-sku="([^"]+)"/g)].map(m=>m[1])
const DETAILS={recipient:'김민수',phone:'010-1234-5678',postal_code:'06236',city:'서울특별시 강남구',line1:'테헤란로 123',line2:'101호',name_on_card:'Minsu Kim',card_number:'4242424242424242',expiry:'12/99',cvv:'123',terms:'1'}

test('gmarket depth: every department/leaf and seller has distinct purchasable merchandise',()=>{
 assert.equal(products.length,500)
 assert.equal(new Set(products.map(p=>p.sku)).size,500)
 assert.equal(departments.length,9)
 for(const d of departments){
  assert.ok(products.filter(p=>p.department===d.id).length>=6)
  for(const [leaf] of d.leaves)assert.ok(products.some(p=>p.department===d.id&&p.leaf===leaf),leaf)
 }
 assert.equal(products.filter(p=>!p.kind).length,2)
 for(const p of products){assert.ok(p.specs.length>=4,p.sku);assert.ok(p.gallery.length>=2);assert.ok(p.unit_price>0);assert.ok(sellers.some(s=>s.id===p.sellerId));if(!['4796016651','4796017670'].includes(p.sku))assert.equal(p.kind,'other')}
 const signatures=sorts.map(([sort])=>search('',{sort}).map(p=>p.sku).join(','))
 assert.equal(new Set(signatures).size,6,'six sorts have genuinely different fixture ordering')
 for(const q of ['PS5 GTA VI','ps5gta6','PS5 grand theft auto vi'])assert.deepEqual(search(q).map(p=>p.sku),['4796016651'])
 assert.deepEqual(search('Xbox GTA VI').map(p=>p.sku),['4796017670'])
})

test('gmarket depth: scoped hubs, shops and campaigns render and unknown branches reject',async()=>{
 const srv=await startServer()
 try{
  const c=srv.client()
  for(const d of departments){
   const hub=await c.get('/gmarket/category/'+d.id);assert.equal(hub.status,200);assert.match(hub.text,new RegExp(d.name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')))
   for(const [leaf] of d.leaves){const page=await c.get(`/gmarket/category/${d.id}/${leaf}`);assert.equal(page.status,200);assert.ok(ids(page.text).length);assert.ok(ids(page.text).every(id=>bySku(id).leaf===leaf),leaf)}
  }
  for(const bad of ['/gmarket/category/digital/fresh','/gmarket/category/missing','/gmarket/seller/missing','/gmarket/seller/h2/unknown','/gmarket/campaign/missing'])assert.equal((await c.get(bad)).status,404)
  const shop=await c.get('/gmarket/seller/h2/products?q=PS5');assert.deepEqual(ids(shop.text),['4796016651'])
  const empty=await c.get('/gmarket/seller/h2/products?q=우유&seller=foodmarket');assert.deepEqual(ids(empty.text),[])
  const about=await c.get('/gmarket/seller/h2/about');assert.match(about.text,/판매자 정보/);assert.match(about.text,/상담시간/)
  const best=await c.get('/gmarket/best');assert.deepEqual(ids(best.text),search('',{sort:'sales'}).slice(0,12).map(p=>p.sku))
  const deal=await c.get('/gmarket/superdeal');assert.ok(ids(deal.text).every(id=>bySku(id).deal))
  const campaign=await c.get('/gmarket/campaign/pantry-days?category=digital');assert.ok(ids(campaign.text).every(id=>bySku(id).department==='food'))
  assert.match((await c.get('/gmarket/')).text,/home-campaign\.png/)
 }finally{await srv.close()}
})

test('gmarket depth: composable facets, list/gallery parity and pagination preserve result state',async()=>{
 const srv=await startServer()
 try{
  const c=srv.client()
  const filtered='/gmarket/search?category=home&brand='+encodeURIComponent('키친하루')+'&delivery=free&within='+encodeURIComponent('주방용품')+'&min=10000&max=50000&rating=4.5&sort=price-desc'
  const expected=search('',{category:'home',brand:'키친하루',delivery:'free',within:'주방용품',min:'10000',max:'50000',rating:'4.5',sort:'price-desc'}).map(p=>p.sku)
  assert.ok(expected.length,'fixture has actual composable matching data')
  assert.deepEqual(ids((await c.get(filtered)).text),expected)
  const list=await c.get('/gmarket/search?category=digital&sort=price-asc&view=list&page=2')
  const gallery=await c.get('/gmarket/search?category=digital&sort=price-asc&view=gallery&page=2')
  assert.deepEqual(ids(list.text),ids(gallery.text));assert.deepEqual(ids(list.text),search('',{category:'digital',sort:'price-asc'}).slice(12,24).map(p=>p.sku))
  assert.match(list.text,/category=digital&amp;sort=price-asc&amp;view=gallery&amp;page=2/)
  const overflow=await c.get('/gmarket/search?category=food&page=99999');assert.match(overflow.text,/3 \/ 3 페이지/)
  const chipHref=[...gallery.text.matchAll(/href="([^"]+)" aria-label="카테고리 필터 해제"/g)][0][1].replaceAll('&amp;','&')
  const chip=new URL(chipHref,'http://local');assert.equal(chip.searchParams.get('category'),null);assert.equal(chip.searchParams.get('sort'),'price-asc');assert.equal(chip.searchParams.get('view'),'gallery')
  const seller=await c.get('/gmarket/search?seller=h2&brand=Rockstar%20Games');assert.match(seller.text,/<input type="hidden" name="seller" value="h2">/)
  const none=await c.get('/gmarket/search?category=food&brand=소니');assert.match(none.text,/상품 0개/);assert.deepEqual(ids(none.text),[])
 }finally{await srv.close()}
})

test('gmarket depth: product type content, specs and gallery have usable distinct views',async()=>{
 const srv=await startServer()
 try{
  const c=srv.client()
  for(const sku of ['gm-milk','gm-drill','gm-sneakers','gm-catfood','gm-cookbook']){
   const page=await c.get('/gmarket/product/'+sku);assert.match(page.text,/상품 주요 규격/);assert.match(page.text,/함께 살펴볼 상품/);assert.doesNotMatch(page.text,/name="age_confirmed"/)
   const q=await c.get('/gmarket/product/'+sku+'?tab=questions');const body=q.text.split('<section class="panel product-info">')[1].split('</section>')[0];assert.doesNotMatch(body,/예약판매|플랫폼|출시 일정|코드 등록/)
   const gallery=await c.get('/gmarket/product/'+sku+'?image=1')
   await assertProductGallery(c,gallery.text,'gmarket',sku)
   assert.match(gallery.text,/data-pa-select="1"[^>]*aria-pressed="true"/)
  }
  const xbox=await c.get('/gmarket/product/4796017670');assert.match(xbox.text,/<td>Xbox Series X\|S<\/td>/)
 }finally{await srv.close()}
})

test('gmarket depth: missing/sold-out/forged variants reject; separate choices purchase as other at canonical KRW prices',async()=>{
 const srv=await startServer()
 try{
  const c=srv.client(),other=srv.client()
  for(const variant of ['', 'pink','forged'])assert.equal((await c.post('/gmarket/cart/add',{sku:'gm-controller',qty:'1',action:'cart',variant})).status,400)
  assert.equal((await c.post('/gmarket/cart/add',{sku:'gm-water',qty:'1',action:'cart',variant:'forged'})).status,400)
  await c.post('/gmarket/cart/add',{sku:'gm-controller',qty:'1',action:'cart',variant:'white',unit_price:'1',kind:'game'})
  await c.post('/gmarket/cart/add',{sku:'gm-controller',qty:'2',action:'cart',variant:'black'})
  let cart=await c.get('/gmarket/cart');assert.match(cart.text,/미드나이트 블랙/);assert.match(cart.text,/name="line_key" value="gm-controller--white"/);assert.match(cart.text,/name="line_key" value="gm-controller--black"/)
  await c.post('/gmarket/cart/update',{sku:'gm-controller',line_key:'gm-controller--black',qty:'1',action:'update'})
  assert.match((await other.get('/gmarket/cart')).text,/장바구니에 담긴 상품이 없습니다/)
  await c.post('/gmarket/account',{action:'guest',guest_email:'catalog@example.com'})
  const done=await c.post('/gmarket/checkout',DETAILS);assert.equal(done.status,200)
  const [order]=await c.json('/api/orders?store=gmarket');assert.equal(order.currency,'KRW');assert.equal(order.meta.preorder,false);assert.equal(order.items.length,2);assert.ok(order.items.every(p=>p.kind==='other'));assert.deepEqual(order.items.map(p=>p.unit_price),[79800,84800]);assert.equal(order.totals.total,167600);assert.equal(order.meta.options.length,2);assert.doesNotMatch(JSON.stringify(order),/4242424242424242|"cvv"/)
  assert.equal((await other.get(new URL(done.url).pathname)).status,404)
  const free=products.find(p=>p.shippingFee===0&&p.kind==='other');const paid={...bySku('gm-water'),seller:free.seller,qty:1};assert.equal(totals([{...free,qty:1},paid]).shipping,3000,'free offer does not waive another paid line')
 }finally{await srv.close()}
})

test('gmarket depth: newly added drill stays other alongside the original GTA preorder',async()=>{
 const srv=await startServer()
 try{
  const c=srv.client()
  await c.post('/gmarket/cart/add',{sku:'4796016651',qty:'1',action:'cart',age_confirmed:'1'})
  await c.post('/gmarket/cart/add',{sku:'gm-drill',qty:'1',action:'cart',kind:'game',platform:'xbox',unit_price:'1'})
  await c.post('/gmarket/account',{action:'guest',guest_email:'mixed@example.com'})
  const done=await c.post('/gmarket/checkout',DETAILS);assert.equal(done.status,200)
  const [order]=await c.json('/api/orders?store=gmarket')
  assert.deepEqual(order.items.map(p=>[p.sku,p.kind,p.unit_price]),[['4796016651','game',89800],['gm-drill','other',69900]])
  assert.equal(order.items[0].platform,'ps5');assert.equal(order.items[1].platform,undefined)
  assert.deepEqual(order.totals,{subtotal:159700,shipping:3000,tax:0,discount:0,total:162700})
  assert.equal(order.currency,'KRW');assert.equal(order.meta.preorder,true)
 }finally{await srv.close()}
})
