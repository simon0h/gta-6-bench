import test from 'node:test'
import assert from 'node:assert/strict'
import { access } from 'node:fs/promises'
import { startServer } from './helpers.js'
import { products, departments, categoryTree, campaigns, categoryPath, inCategory, bySku } from '../stores/coupang/catalog-data.js'
import { results, pageResults, queryLink } from '../stores/coupang/catalog.js'
const ids=html=>[...html.matchAll(/data-product="([^"]+)"/g)].map(m=>m[1])
const base='/coupang'
const login={email:'tester@example.com',password:'Password123!'}
const orderForm={recipient:'김민수',phone:'010-1234-5678',postcode:'04524',city:'서울특별시',address:'중구 세종대로 110',payment_method:'card',card_name:'Minsu Kim',card_number:'4242 4242 4242 4242',card_expiry:'12/39',card_cvv:'123',agree:'yes'}

test('coupang catalog: distinct products populate every department and leaf, trusted variants and artwork are complete',async()=>{
 assert.equal(products.length,500)
 assert.equal(new Set(products.map(p=>p.id)).size,500)
 assert.equal(departments.length,15)
 assert.equal(categoryTree.length,55)
 for(const c of categoryTree)assert.ok(products.some(p=>inCategory(p,c.id)),c.id)
 assert.equal(results({category:'food'}).length,46)
 assert.equal(results({category:'electronics'}).length,272)
 assert.equal(products.filter(p=>!p.kind).length,2)
 const skus=[]
 for(const p of products){
  assert.ok(categoryPath(p.category).length>=2)
  for(const v of p.variants||[p]){skus.push(v.sku);assert.equal(bySku(v.sku).id,p.id);if(p.kind)assert.equal(bySku(v.sku).kind,'other')}
  if(p.kind)await access(new URL(p.catalogArt?`../public/${p.catalogArt.slice('/static/'.length)}`:`../stores/coupang/public/catalog/${p.id}.svg`,import.meta.url))
 }
 assert.equal(new Set(skus).size,skus.length)
 assert.equal(bySku('CP-MILK-10-24').price,16900)
 assert.equal(bySku('CP-MILK-10-24').label,'200ml / 24팩')
 assert.match(bySku('CP-MILK-10-24').title,/200ml \/ 24팩/)
 assert.equal(bySku('CP-MILK-10-FAKE'),undefined)
})

test('coupang catalog: combined facets, all sort modes and stable page boundaries use full server catalog',()=>{
 const found=results({q:'우유',category:'food',brand:'목장일기',delivery:'seller',min:'10000',max:'20000',rating:'4'})
 assert.deepEqual(found.map(p=>p.id),['lowfat-milk'])
 assert.equal(results({q:'gta6',delivery:'rocket'}).length,0)
 assert.equal(results({category:'games',platform:'switch'}).length,29)
 assert.equal(results({condition:'open-box'}).length,3)
 assert.deepEqual(results({availability:'out-of-stock'}).map(p=>p.id),['piano-album'])
 assert.equal(results({min:'50000',max:'1000'}).length,0)
 for(const [sort,key,sign] of [['price-asc','price',1],['price-desc','price',-1],['sales','sales',-1],['newest','newness',-1],['rating','rating',-1]]){
  const rows=results({sort});assert.ok(rows.every((p,i)=>!i||(p[key]-rows[i-1][key])*sign>=0),sort)
 }
 const pages=[1,2,3].map(page=>pageResults({q:'장보기',page:String(page),sort:'price-asc'}))
 assert.equal(pages[0].total,27);assert.equal(pages[2].items.length,3)
 assert.equal(new Set(pages.flatMap(p=>p.items.map(p=>p.id))).size,27)
 assert.equal(pageResults({page:'999'}).page,42)
 assert.equal(pageResults({page:'-1'}).page,1)
 assert.equal(pageResults({size:'1000000'}).size,12)
 const url=queryLink('/coupang/np/search',{q:'우유',brand:['목장일기','하루농장'],rating:'4.5',page:'2'},{sort:'price-asc',page:undefined})
 assert.equal(new URL(url,'http://local').searchParams.getAll('brand').length,2)
 assert.equal(new URL(url,'http://local').searchParams.has('page'),false)
})

test('coupang catalog: department, numeric aliases, brand and campaign routes have real context and unknown routes are branded404',async()=>{
 const server=await startServer()
 try{
  const client=server.client()
  for(const c of categoryTree){const response=await client.get(`${base}/np/categories/${c.id}`);assert.equal(response.status,200,c.id);assert.ok(ids(response.text).length,c.id);assert.match(response.text,new RegExp(`<h1>${c.label.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}</h1>`))}
  assert.match((await client.get(`${base}/np/categories/178255`)).text,/272개의 상품/)
  assert.match((await client.get(`${base}/np/categories/395267`)).text,/게임 \/ 게임기/)
  for(const c of campaigns){const response=await client.get(`${base}/np/campaigns/${c.id}`);assert.equal(response.status,200,c.id);assert.ok(ids(response.text).length,c.id)}
  const sortedNew=await client.get(`${base}/np/campaigns/new-arrivals?sort=price-asc`)
  const sortedPrices=ids(sortedNew.text).map(id=>products.find(p=>p.id===id).price)
  assert.ok(sortedPrices.every((price,i)=>!i||price>=sortedPrices[i-1]))
  const fresh=await client.get(`${base}/np/campaigns/rocket-fresh?delivery=seller`)
  assert.equal(ids(fresh.text).length,5)
  assert.ok(ids(fresh.text).every(id=>products.find(p=>p.id===id).delivery==='fresh'))
  const sony=await client.get(`${base}/np/products/brand-shop?brandName=Sony`)
  assert.equal(ids(sony.text).length,3)
  assert.ok(ids(sony.text).every(id=>products.find(p=>p.id===id).brand==='Sony'))
  const brand=await client.get(`${base}/shops/${encodeURIComponent('목장일기')}?sort=price-asc&brand=Sony`)
  assert.equal(ids(brand.text).length,4)
  assert.ok(ids(brand.text).every(id=>products.find(p=>p.id===id).brand==='목장일기'))
  const campaign2=await client.get(`${base}/?campaign=pantry&deals=2`)
  assert.match(campaign2.text,/<h1>오늘도 든든한 한 끼<\/h1>/)
  assert.match(campaign2.text,/groceries-campaign\.png/)
  for(const route of ['/np/categories/no-such-category','/np/campaigns/no-such-event','/np/products/brand-shop?brandName=unknown','/shops/unknown']){const response=await client.get(base+route);assert.equal(response.status,404);assert.match(response.text,/lang="ko"/)}
  assert.equal((await client.get(`${base}/cartView.pang`)).status,200)
 }finally{await server.close()}
})

test('coupang catalog: GET filter controls preserve state, pagination and recovery preserve the query',async()=>{
 const server=await startServer()
 try{
  const client=server.client()
  const filtered=await client.get(`${base}/np/search?q=${encodeURIComponent('우유')}&category=food&brand=${encodeURIComponent('목장일기')}&delivery=seller&min=10000&max=20000&rating=4&sort=price-asc`)
  assert.deepEqual(ids(filtered.text),['lowfat-milk'])
  assert.match(filtered.text,/name="brand" value="목장일기" checked/)
  assert.match(filtered.text,/name="delivery" value="seller" checked/)
  assert.match(filtered.text,/name="min"[^>]*value="10000"/)
  assert.match(filtered.text,/1개의 상품/)
  const all=[]
  for(const page of [1,2,3]){const response=await client.get(`${base}/np/search?q=${encodeURIComponent('장보기')}&sort=price-asc&page=${page}`);all.push(...ids(response.text));assert.match(response.text,/27개의 상품/)}
  assert.equal(new Set(all).size,27)
  const q=encodeURIComponent('장보기')
  const empty=await client.get(`${base}/np/search?q=${q}&min=1000000`)
  assert.equal(ids(empty.text).length,0)
  assert.match(empty.text,/검색어를 유지하고 필터 해제/)
  assert.match(empty.text,new RegExp(`href="/coupang/np/search\\?q=${q}"`))
  const escape=await client.get(`${base}/np/search?q=%3Cscript%3Ealert(1)%3C%2Fscript%3E`)
  assert.doesNotMatch(escape.text,/<script>alert\(1\)<\/script>/)
 }finally{await server.close()}
})

test('coupang catalog: selected pack variants survive cart and checkout, forged state is ignored and invalid options fail',async()=>{
 const server=await startServer()
 try{
  const client=server.client()
  const variant=await client.get(`${base}/vp/products/milk-10?sku=CP-MILK-10-24`)
  assert.equal(variant.status,200)
  assert.match(variant.text,/16,900원/)
  assert.match(variant.text,/200ml \/ 24팩/)
  assert.match(variant.text,/100ml당 352원/)
  assert.match(variant.text,/name="sku" value="CP-MILK-10-24"/)
  assert.equal((await client.get(`${base}/vp/products/milk-10?sku=CP-GTA6-PS5`)).status,400)
  assert.equal((await client.get(`${base}/vp/products/milk-10?sku=invalid`)).status,400)
  assert.equal((await client.post(`${base}/cart/add`,{sku:'CP-GTA6-PS5',product_id:'milk-10',qty:1})).status,400)
  assert.equal((await client.post(`${base}/cart/add`,{sku:'CP-PIANO-ALBUM',qty:1})).status,400)
  await client.post(`${base}/cart/add`,{sku:'CP-MILK-10-24',qty:'2',unit_price:'1',kind:'game',platform:'ps5'})
  await client.post(`${base}/cart/add`,{sku:'CP-MILK-10-6',qty:'1'})
  const cart=await client.get(`${base}/cart`)
  assert.match(cart.text,/48,700원/)
  assert.match(cart.text,/200ml \/ 24팩/)
  assert.match(cart.text,/1L \/ 6팩/)
  await client.post(`${base}/login`,login)
  const done=await client.post(`${base}/checkout/order`,orderForm)
  assert.equal(done.status,200)
  const [order]=await client.json('/api/orders?store=coupang')
  assert.deepEqual(order.items.map(i=>[i.sku,i.qty,i.unit_price,i.kind]),[['CP-MILK-10-24',2,16900,'other'],['CP-MILK-10-6',1,14900,'other']])
  assert.equal(order.totals.total,48700)
  assert.equal(order.meta.synthetic_preorder,false)
  assert.ok(order.items.every(i=>i.platform===undefined))
  const reviews=await client.get(`${base}/vp/products/milk-10?sku=CP-MILK-10-24&tab=reviews&reviewSort=lowest&reviewPage=2`)
  assert.match(reviews.text,/상품평 페이지/)
  assert.match(reviews.text,/reviewPage=3/)
  assert.match((await client.get(`${base}/vp/products/gta6-ps5?tab=reviews`)).text,/아직 등록된 상품평이 없습니다/)
  assert.match((await client.get(`${base}/vp/products/fresh-milk?tab=questions`)).text,/냉장 보관/)
  for(const asset of ['/static/art/depth/electronics-campaign.png','/static/art/depth/products-electronics.png',`${base}/static/catalog/diapers.svg`])assert.equal((await client.get(asset)).status,200,asset)
 }finally{await server.close()}
})
