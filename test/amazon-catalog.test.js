import { assertProductGallery } from './product-gallery-assertions.js'
import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { startServer } from './helpers.js'
import { PRODUCTS, search, deliveryOptions } from '../stores/amazon/data.js'
import { NODES, DEPARTMENTS } from '../stores/amazon/catalog.js'

const asinList = html => [...html.matchAll(/class="az-result(?: az-result-game)?" data-asin="([^"]+)"/g)].map(m=>m[1])
const decode = value => value.replaceAll('&amp;','&')

test('amazon catalog: seven populated departments, distinct purchasable products, reachable hubs and assets', async()=>{
 assert.equal(PRODUCTS.length,500)
 const mixedOptions=deliveryOptions(['B0H6K928WL','B0H7QK3M2P'].map(asin=>({product:PRODUCTS.find(p=>p.asin===asin)})))
 assert.equal(mixedOptions.standard.date,'November 19, 2026')
 assert.equal(mixedOptions['release-date'],undefined)
 assert.equal(PRODUCTS.filter(p=>p.stock>0).length,499)
 assert.equal(new Set(PRODUCTS.map(p=>p.asin)).size,500)
 assert.equal(PRODUCTS.filter(p=>p.kind==='game').length,2)
 assert.ok(DEPARTMENTS.filter(([id])=>id).every(([id])=>PRODUCTS.filter(p=>p.department===id&&p.stock>0).length>=5))
 for(const p of PRODUCTS) {
   assert.equal(p.price,p.priceCents/100)
   assert.equal(p.priceCents,Math.round(p.price*100))
   assert.ok(p.specs&&Object.keys(p.specs).length>=2)
   for(const image of p.gallery) assert.ok(existsSync(image.startsWith('/amazon/static/')?`stores/amazon/public/${image.slice(15)}`:`public/${image.slice(8)}`),image)
 }
 const srv=await startServer()
 try {
   const c=srv.client()
   for(const n of NODES) {
     assert.ok(search('','','',{},n.id).length>0,n.id)
     const page=await c.get(`/amazon/b?node=${n.id}`)
     assert.equal(page.status,200,n.id)
     assert.ok(asinList(page.text).length>0,n.id)
   }
   const home=await c.get('/amazon/')
   for(const href of new Set([...home.text.matchAll(/href="([^"]+)"/g)].map(m=>decode(m[1])).filter(h=>/^\/amazon\/(b\?|s\?|gp\/goldbox|gp\/bestsellers|gp\/new-releases)/.test(h)))) {
     const r=await c.get(href)
     assert.equal(r.status,200,href)
     assert.ok(asinList(r.text).length>0,href)
   }
   assert.equal((await c.get('/amazon/help')).status,200)
   assert.equal((await c.get('/amazon/b?node=unknown')).status,404)
   assert.equal((await c.get('/amazon/computer-video-games-hardware-accessories/b/?node=468642')).status,200)
 } finally { await srv.close() }
})

test('amazon catalog: multiple refinements, stable sort, real pages and removal retain the remaining state',async()=>{
 const srv=await startServer()
 try {
  const c=srv.client()
  const q='/amazon/s?availability=in-stock&condition=New&min=10&max=100&s=price-asc-rank'
  const first=await c.get(q),second=await c.get(q+'&page=2')
  assert.equal(asinList(first.text).length,12)
  assert.equal(asinList(second.text).length,12)
  assert.ok(asinList(first.text).every(id=>!asinList(second.text).includes(id)))
  assert.match(second.text,/name="availability" value="in-stock"/)
  assert.match(second.text,/value="price-asc-rank" selected/)
  assert.match(second.text,/aria-current="page">2/)
  const next=decode(/href="([^"]+)" aria-label="Page 3"/.exec(second.text)[1])
  assert.equal(new URL(next,'http://test').searchParams.get('condition'),'New')
  assert.equal(new URL(next,'http://test').searchParams.get('min'),'10')
  const remove=decode(/href="([^"]+)" aria-label="Remove min: 10"/.exec(second.text)[1])
  const params=new URL(remove,'http://test').searchParams
  assert.equal(params.has('min'),false)
  assert.equal(params.has('page'),false)
  assert.equal(params.get('max'),'100')
  assert.equal(params.get('availability'),'in-stock')
  const multi=await c.get('/amazon/b?node=electronics&brand=Northstar&brand=Cloudline&min=20&max=80&s=price-desc-rank')
  const ids=asinList(multi.text),products=ids.map(id=>PRODUCTS.find(p=>p.asin===id))
  assert.ok(products.length>=5)
  assert.ok(products.every(p=>['Northstar','Cloudline'].includes(p.brand)&&p.department==='electronics'))
  assert.deepEqual(products.map(p=>p.price),products.map(p=>p.price).sort((a,b)=>b-a))
  assert.match(multi.text,/name="brand" value="Northstar" checked/)
  assert.match(multi.text,/name="brand" value="Cloudline" checked/)
  const no=await c.get('/amazon/s?i=home&min=5000')
  assert.match(no.text,/No results for/)
  assert.match(no.text,/Clear all filters/)
 } finally {await srv.close()}
})

test('amazon catalog: product-specific information, galleries, linked recommendations, and scoped brand browsing',async()=>{
 const srv=await startServer()
 try {
  const c=srv.client(),pdp=await c.get('/amazon/dp/A0HOMEKT1')
  assert.match(pdp.text,/1.7 liters/)
  assert.match(pdp.text,/1,500 W/)
  await assertProductGallery(c,pdp.text,'amazon','A0HOMEKT1')
  assert.doesNotMatch(pdp.text,/Platform For Display|Edition:|Code in Box|Delivers 11\/12/)
  assert.match(pdp.text,/Monday, October 5/)
  assert.match(pdp.text,/Customers also considered/)
  const brand=await c.get('/amazon/stores/RockstarGames')
  assert.equal(brand.status,200)
  assert.match(brand.text,/Grand Theft Auto/)
  assert.match(brand.text,/Red Dead Redemption/)
  const unavailable=await c.get('/amazon/dp/A0ELECPL01')
  assert.match(unavailable.text,/Currently unavailable/)
  assert.doesNotMatch(unavailable.text,/id="add-to-cart-button"|id="buy-now-button"/)
 } finally {await srv.close()}
})

test('amazon catalog: only selected bundle items added; unavailable, unknown and invalid quantities rejected atomically',async()=>{
 const srv=await startServer()
 try {
   const c=srv.client(),pdp=await c.get('/amazon/dp/B0H6K928WL')
   const bundle=/<form[^>]*id="az-bundle"[^>]*>([\s\S]*?)<\/form>/.exec(pdp.text)[1]
   assert.equal((bundle.match(/type="checkbox" name="asin"/g)||[]).length,3)
   assert.doesNotMatch(bundle,/type="hidden" name="asin"/)
   const form=new URLSearchParams([['asin','B0H6K928WL'],['asin','B0H4ZELDOT'],['ret','/cart']])
   const added=await c.post('/amazon/cart/add',form)
   const lines=[...added.text.matchAll(/class="az-cart-line" data-asin="([^"]+)"/g)].map(m=>m[1])
   assert.deepEqual(lines,['B0H6K928WL','B0H4ZELDOT'])
   for(const body of [{asin:'A0ELECPL01',quantity:1},{asin:'INVALID',quantity:1},{asin:'A0HOMEKT1',quantity:'1.5'},{asin:'A0HOMEKT1',quantity:8}]) assert.equal((await c.post('/amazon/cart/add',body)).status,400)
   assert.equal((await c.post('/amazon/cart/add',new URLSearchParams([['asin','A0HOMEKT1'],['asin','INVALID']]))).status,400)
   const after=await c.get('/amazon/cart')
   assert.doesNotMatch(after.text,/class="az-cart-line" data-asin="A0HOMEKT1"/)
   assert.equal((await c.get('/amazon/checkout/entry/buynow?ASIN=A0ELECPL01&quantity=1')).status,400)
 } finally {await srv.close()}
})

test('amazon catalog: household purchase uses authoritative price and other kind, stock delivery and existing account checkout',async()=>{
 const srv=await startServer()
 try {
  const c=srv.client()
  await c.post('/amazon/cart/add',{asin:'A0HOMEKT1',quantity:2,price:'0.01',kind:'game',platform:'ps5'})
  await c.post('/amazon/gp/cart/desktop/go-to-checkout.html',{})
  await c.post('/amazon/ax/claim',{email:'tester@example.com'})
  await c.post('/amazon/ap/signin/password',{password:'Password123!'})
  await c.post('/amazon/gp/buy/addressselect',{countryCode:'US',fullName:'Alex Tester',phoneNumber:'3055550123',addressLine1:'123 Ocean Dr',city:'Miami',state:'FL',postalCode:'33139'})
  const review=await c.post('/amazon/gp/buy/payselect',{cardNumber:'4242424242424242',nameOnCard:'Alex Tester',expMonth:'12',expYear:'2029'})
  assert.match(review.text,/Arriving Monday, October 5/)
  assert.doesNotMatch(review.text,/Release-Date Delivery|Pre-order Price Guarantee|November/)
  assert.equal((await c.post('/amazon/gp/buy/spc',{delivery:'release-date',action:'place'})).status,400)
  const done=await c.post('/amazon/gp/buy/spc',{delivery:'standard',action:'place'})
  assert.match(done.text,/Arriving Oct 5/)
  const [order]=await c.json('/api/orders?store=amazon')
  assert.deepEqual(order.items,[{kind:'other',qty:2,unit_price:32.99,title:'Hearth & Table 1.7L Electric Kettle',sku:'A0HOMEKT1'}])
  assert.deepEqual(order.totals,{subtotal:65.98,shipping:0,tax:4.62,total:70.6})
  assert.equal(order.fulfillment.eta,'Monday, October 5')
  assert.doesNotMatch(JSON.stringify(order),/4242424242424242/)
 } finally {await srv.close()}
})
