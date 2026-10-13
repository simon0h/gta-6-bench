import test from 'node:test'
import assert from 'node:assert/strict'
import {startServer,fieldValue} from './helpers.js'
import {PRODUCTS,byId,filterProducts} from '../stores/playstation-store/data.js'
import {COLLECTIONS,FILTERS} from '../stores/playstation-store/catalogue.js'
const S='/playstation-store',C=`${S}/en-us/checkout`,SIGNIN=`${S}/my.account.sony.com/central/signin/`
const signIn=(c,email='tester@example.com',password='Password123!')=>c.post(SIGNIN,{step:'password',email,password})
const add=(c,sku)=>c.post(`${S}/en-us/cart/add`,{sku})
const ids=html=>[...html.matchAll(/class="ps-tile" href="[^\"]+\/([^/\"]+)"/g)].map(m=>m[1])
test('PlayStation catalogue: finite family counts, combined facets, numbered pagination and populated hubs',async()=>{
 assert.equal(PRODUCTS.length,500)
 assert.equal(new Set(PRODUCTS.filter(p=>p.ordinary&&!p.physical&&p.contentType==='base-game').map(p=>p.family)).size,24)
 assert.equal(PRODUCTS.filter(p=>p.kind==='game').length,2)
 const srv=await startServer();try{
  const c=srv.client(),first=await c.get(`${S}/en-us/pages/browse`),second=await c.get(`${S}/en-us/pages/browse?page=2`)
  assert.equal(ids(first.text).length,24);assert.equal(ids(second.text).length,24)
  assert.equal(new Set([...ids(first.text),...ids(second.text)]).size,48)
  assert.match(first.text,/1 - 24 of 500/);assert.match(second.text,/25 - 48 of 500/)
  for(const [,label] of FILTERS)assert.ok(first.text.includes(label))
  const query='platform=PS4&feature=Local+Multiplayer&age=E&sort=price-asc'
  const filtered=await c.get(`${S}/en-us/pages/browse?${query}`)
  assert.deepEqual(ids(filtered.text),filterProducts(PRODUCTS,Object.fromEntries(new URLSearchParams(query))).map(p=>p.id))
  assert.match(filtered.text,/3 active filters/);assert.match(filtered.text,/Remove Platform filter/)
  for(const [id] of COLLECTIONS){const r=await c.get(`${S}/en-us/collection/${id}`);assert.equal(r.status,200);assert.ok(ids(r.text).length,id)}
  const deals=await c.get(`${S}/en-us/pages/deals`);assert.ok(ids(deals.text).every(id=>byId(id).originalPrice>byId(id).price))
  const empty=await c.get(`${S}/en-us/search/nonexistentxyz?genre=Sport`);assert.match(empty.text,/0 results/);assert.match(empty.text,/Clear filters/);assert.match(empty.text,/Explore more/)
  assert.equal((await c.get(`${S}/en-us/pages/browse?platform=__proto__&page=-2&sort=__proto__`)).status,200)
 }finally{await srv.close()}
})
test('PlayStation catalogue: typed DLC, edition entitlements, ordinary paid purchase and owned receipts',async()=>{
 const srv=await startServer();try{
 const c=srv.client();await signIn(c)
 const detail=await c.get(`${S}/en-us/product/BENCH-POCKET-GARDEN`)
 for(const text of ['Editions and platforms','PS4 digital license','Accessibility features','Ratings and reviews','Autumn Greenhouse'])assert.ok(detail.text.includes(text))
 assert.doesNotMatch(detail.text,/Rockstar|GTA\+|Screenshot 1/)
 const dlc=await c.get(`${S}/en-us/product/BENCH-POCKET-GARDEN-GREENHOUSE`);assert.match(dlc.text,/Base game required/)
 await add(c,'BENCH-POCKET-GARDEN')
 const review=await c.post(`${C}/payment/service`,{service:'paypal'})
 const done=await c.post(C,{paymentMethod:'paypal',review_token:fieldValue(review.text,'review_token'),price:'0.01',kind:'game'})
 assert.match(done.text,/Thank you for your purchase/)
 const [order]=await c.json('/api/orders?store=playstation-store')
 assert.equal(order.items[0].kind,'other');assert.equal(order.items[0].unit_price,14.99)
 assert.equal(order.totals.total,16.04);assert.equal(order.fulfillment.method,'digital');assert.equal(order.shipping_address,null)
 assert.equal(order.meta.account_id,order.customer.account_id)
 assert.deepEqual(order.meta.entitlements[0].platforms,['PS5','PS4'])
 const other=srv.client();await signIn(other);assert.equal((await other.get(done.url)).status,404)
 assert.equal((await add(c,'BENCH-POCKET-GARDEN')).url,`${srv.base}${S}/en-us/product/BENCH-POCKET-GARDEN`)
 await c.get(`${S}/logout`);assert.equal((await c.get(done.url)).status,404)
 }finally{await srv.close()}
})
test('PlayStation catalogue: free acquisition needs no payment; forged SKU/options/unavailable entry reject',async()=>{
 const srv=await startServer();try{
 const c=srv.client();await signIn(c)
 for(const body of [{sku:'__proto__'},{sku:['BENCH-FORTNITE','BENCH-ROBLOX']},{sku:'BENCH-FORTNITE',platform:'Xbox'},{sku:'BENCH-FORTNITE',qty:'2'},{sku:'EP1004-PPSA01547_00-ULTEDTIONUPGRADE'}])assert.equal((await c.post(`${S}/en-us/cart/add`,body)).status,400)
 const review=await add(c,'BENCH-FORTNITE');assert.match(review.text,/No payment method needed/)
 const token=fieldValue(review.text,'review_token');assert.ok(token)
 const done=await c.post(C,{review_token:token});assert.match(done.text,/Thank you for your purchase/)
 const [order]=await c.json('/api/orders?store=playstation-store');assert.equal(order.totals.total,0);assert.equal(order.items[0].kind,'other');assert.equal(order.payment.method,'wallet')
 assert.equal((await c.post(C,{review_token:token})).status,409);assert.equal((await c.json('/api/orders?store=playstation-store')).length,1)
 }finally{await srv.close()}
})
test('PlayStation checkout: rendered account/cart/price review rejects stale tabs and replay',async()=>{
 const srv=await startServer();try{
 const c=srv.client();await signIn(c)
 await add(c,'BENCH-POCKET-GARDEN')
 const old=await c.post(`${C}/payment/service`,{service:'paypal'}),oldToken=fieldValue(old.text,'review_token')
 await add(c,'BENCH-STARFALL-EXPEDITION')
 const stale=await c.post(C,{paymentMethod:'paypal',review_token:oldToken});assert.equal(stale.status,409)
 assert.deepEqual(await c.json('/api/orders?store=playstation-store'),[])
 const current=await c.get(C),product=byId('BENCH-STARFALL-EXPEDITION'),original=product.price
 product.price=original+1
 try{assert.equal((await c.post(C,{paymentMethod:'paypal'})).status,409)}finally{product.price=original}
 const finalReview=await c.get(C),token=fieldValue(finalReview.text,'review_token')
 await c.post(C,{paymentMethod:'paypal',review_token:token})
 await c.post(C,{paymentMethod:'paypal',review_token:token})
 assert.equal((await c.json('/api/orders?store=playstation-store')).length,1)
 const currency='UP1004-CUSA00419_00-GTAVCASHPACK0004'
 await add(c,currency);const currencyReview=await c.get(C)
 await c.post(C,{paymentMethod:'paypal',review_token:fieldValue(currencyReview.text,'review_token')})
 await add(c,currency)
 assert.equal((await c.post(C,{paymentMethod:'paypal',review_token:fieldValue(currencyReview.text,'review_token')})).status,409)
 assert.equal((await c.json('/api/orders?store=playstation-store')).length,2)
 await c.post(`${S}/my.account.sony.com/central/signup/`,{dob:'1990-01-01',state:'FL',email:'ps61@example.com',password:'Secret123',onlineId:'Player61',firstName:'New',lastName:'Player',terms:'1'})
 await add(c,'BENCH-ROBLOX')
 assert.equal((await c.post(C,{review_token:token})).status,409)
 assert.equal((await c.json('/api/orders?store=playstation-store')).length,2)
 }finally{await srv.close()}
})
