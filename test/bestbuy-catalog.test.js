import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer } from './helpers.js'
import { photoStyle } from '../lib/product-photos.js'
import { ORDINARY, DEPARTMENTS } from '../stores/bestbuy/catalog.js'
import { PRODUCTS, productPath, refine } from '../stores/bestbuy/data.js'

const item=family=>ORDINARY.find(p=>p.family===family)
const address={firstName:'Alex',lastName:'Tester',addressLine1:'123 Ocean Dr',city:'Miami',state:'FL',postalCode:'33139',useAsBilling:'1'}
const card={paymentMethod:'card',number:'4242424242424242',expirationDate:'12/29',cvv:'123'}
const skus=html=>[...html.matchAll(/data-sku="([^"]+)"/g)].map(m=>m[1])
async function readyShipping(client) {
 await client.post('/bestbuy/checkout/r/fast-track')
 await client.post('/bestbuy/identity/signin',{action:'guest'})
 await client.post('/bestbuy/checkout/contact',{emailAddress:'ordinary@example.com',phoneNumber:'3055550123'})
 await client.post('/bestbuy/checkout/shipping-address',address)
 return client.post('/bestbuy/checkout/shipping-details',{levelOfService:'standard'})
}

test('Best Buy catalog: 31 ordinary families, eight populated hubs, real deal and brand destinations and all family assets',async()=>{
 assert.equal(ORDINARY.length,34)
 assert.equal(new Set(ORDINARY.map(p=>p.family)).size,31)
 assert.ok(ORDINARY.every(p=>p.kind==='other'&&p.specs&&p.stock>=0))
 const srv=await startServer()
 try {
  const c=srv.client()
  const home=await c.get('/bestbuy/')
  assert.match(home.text,/Big possibilities/)
  for(const title of ['Shop by department','Top deals worth a closer look','Your next workday upgrade','Make yourself at home']) assert.ok(home.text.includes(title))
  assert.equal((await c.get('/bestbuy/departments')).status,200)
  for(const d of DEPARTMENTS) {
   const hub=await c.get(`/bestbuy/departments/${d.id}`)
   assert.equal(hub.status,200)
   assert.ok(skus(hub.text).length>0,d.id)
   const result=await c.get(`/bestbuy/site/searchpage.jsp?department=${d.id}`)
   assert.ok(skus(result.text).every(sku=>PRODUCTS.find(p=>p.sku===sku).department===d.id))
  }
  for(const path of ['/top-deals','/deal-of-the-day','/outlet','/gift-ideas']) {
   const r=await c.get(`/bestbuy${path}`)
   assert.equal(r.status,200)
   assert.ok(skus(r.text).length>0,path)
  }
  assert.match((await c.get('/bestbuy/outlet')).text,/\$159\.99/)
  const unavailableOutlet=await c.get('/bestbuy/site/searchpage.jsp?offer=outlet&fulfillment=shipping')
  assert.equal(skus(unavailableOutlet.text).length,0,'open-box offer is pickup only')
  assert.equal((await c.get('/bestbuy/brands')).status,200)
  for(const p of ORDINARY) {
   const pdp=await c.get(productPath('/bestbuy',p))
   assert.equal(pdp.status,200,p.sku)
   assert.match(pdp.text,/Specifications/)
   if(p.art) assert.equal((await c.get(p.art)).status,200,p.art)
  }
  const sheets=[...new Set(ORDINARY.filter(p=>p.photo).map(p=>/url\('([^']+)'\)/.exec(photoStyle(p.photo))?.[1]))]
  for(const sheet of sheets) {assert.ok(sheet);assert.equal((await c.get(sheet)).status,200,sheet)}
  for(const path of ['/services','/membership','/financing','/trade-in','/business','/gift-cards']) assert.equal((await c.get(`/bestbuy${path}`)).status,200)
  assert.equal((await c.get('/bestbuy/departments/unknown')).status,404)
 }finally{await srv.close()}
})

test('Best Buy catalog: composed filters, price/rating sorts, retained pagination, removable chips and suggestions',async()=>{
 const srv=await startServer()
 try {
  const c=srv.client(),filters={price:'100to500',rating:'4',availability:'instock',sort:'price_low'}
  const expected=refine([...PRODUCTS],filters).map(p=>p.sku)
  assert.ok(expected.length>9)
  const query=new URLSearchParams(filters).toString()
  const first=await c.get(`/bestbuy/site/searchpage.jsp?${query}`)
  assert.deepEqual(skus(first.text),expected.slice(0,9))
  const next=/rel="next" href="([^"]+)"/.exec(first.text)?.[1]
  assert.ok(next.includes('rating=4')&&next.includes('availability=instock')&&next.includes('sort=price_low'))
  const second=await c.get(next)
  assert.deepEqual(skus(second.text),expected.slice(9,18))
  assert.match(first.text,/aria-label="Remove rating filter"/)
  assert.equal(skus((await c.get(`/bestbuy/site/searchpage.jsp?${query}&page=-3`)).text)[0],expected[0])
  const rating=await c.get('/bestbuy/site/searchpage.jsp?department=computers-tablets&sort=rating')
  assert.deepEqual(skus(rating.text),refine(PRODUCTS,{department:'computers-tablets',sort:'rating'}).slice(0,9).map(p=>p.sku))
  const empty=await c.get('/bestbuy/site/searchpage.jsp?st=nonexistent-camera-dinosaur&brand=Sony')
  assert.match(empty.text,/didn't find any results/)
  assert.match(empty.text,/Reset filters/)
  const suggestions=await c.json('/bestbuy/search/suggestions?q=laptop')
  assert.equal(suggestions.filter(s=>s.title.includes('Laptop')).length,3)
  assert.ok(suggestions.every(s=>s.url.includes('/product/')))
 }finally{await srv.close()}
})

test('Best Buy catalog: type-specific specs, variants, condition disclosures and comparable computer details',async()=>{
 const srv=await startServer()
 try {
  const c=srv.client(),ssd=item('ssd'),laptop=item('laptop')
  const pdp=await c.get(`${productPath('/bestbuy',ssd)}?variant=2tb`)
  assert.match(pdp.text,/\$149\.99/)
  assert.match(pdp.text,/<th>Capacity<\/th><td>2 TB<\/td>/)
  assert.match(pdp.text,/value="2tb" selected/)
  assert.match(pdp.text,/value="pickup" disabled/)
  assert.match(pdp.text,/value="shipping" checked/)
  const condition=await c.get(`${productPath('/bestbuy',item('headphones'))}?variant=open-box`)
  assert.match(condition.text,/Inspected return/)
  assert.match(condition.text,/\$159\.99/)
  assert.equal((await c.get(`${productPath('/bestbuy',ssd)}?variant=999tb`)).status,400)
  const compare=await c.get(`/bestbuy/compare?sku=${laptop.sku}&sku=${ORDINARY.find(p=>p.brand==='HP').sku}`)
  assert.match(compare.text,/<th>Memory<\/th>/)
  assert.match(compare.text,/<td>16 GB<\/td>/)
  assert.match(compare.text,/<td>8 GB<\/td>/)
 }finally{await srv.close()}
})

test('Best Buy catalog: ordinary mixed purchase uses trusted prices/options and ordinary ETAs',async()=>{
 const srv=await startServer()
 try {
  const c=srv.client(),ssd=item('ssd'),controller=item('controller')
  const added=await c.post('/bestbuy/cart/add',{pid:ssd.sku,variant:'2tb',fulfillment:'shipping',price:'0.01',kind:'game'})
  assert.equal(added.status,200)
  assert.match(added.text,/\$149\.99/)
  await c.post('/bestbuy/cart/add',{pid:controller.sku,fulfillment:'pickup'})
  const pickup=await readyShipping(c)
  assert.match(pickup.text,/5<\/span> Payment method/)
  assert.doesNotMatch(pickup.text,/Release Date|Code in Box|Final sale/)
  await c.post('/bestbuy/checkout/pickup',{action:'continue'})
  const done=await c.post('/bestbuy/checkout/payment',card)
  assert.match(done.text,/Thanks for your order!/)
  assert.match(done.text,/Estimated delivery in 2–4 business days/)
  assert.match(done.text,/Estimated pickup in 1–2 days/)
  assert.doesNotMatch(done.text,/Release Date|Code in Box|Final sale|4242424242424242/)
  const [order]=await c.json('/api/orders?store=bestbuy')
  assert.deepEqual(order.items.map(i=>[i.kind,i.unit_price]),[['other',149.99],['other',69.99]])
  assert.equal(order.meta.product_details[0].variant,'2tb')
  assert.equal(order.meta.product_details[0].option,'2 TB')
  assert.equal(order.fulfillment.method,'mixed')
  assert.doesNotMatch(order.fulfillment.eta,/Release/)
  assert.equal(order.totals.subtotal,219.98)
 }finally{await srv.close()}
})

test('Best Buy catalog: rejects forged options, methods and quantities and retains unavailable saved items',async()=>{
 const srv=await startServer(),ssd=item('ssd'),offer=ssd.variants[1],originalStock=offer.stock
 try {
  const c=srv.client()
  for(const body of [
   {pid:'missing'}, {pid:ssd.sku,variant:'invented'}, {pid:ssd.sku,variant:'2tb',fulfillment:'pickup'},
   {pid:ssd.sku,variant:'2tb',fulfillment:'drone'}, ...['0','-1','1.5','4','NaN'].map(qty=>({pid:ssd.sku,qty})),
   {pid:item('action-camera').sku},
  ]) assert.equal((await c.post('/bestbuy/cart/add',body)).status,400,JSON.stringify(body))
  assert.match((await c.get('/bestbuy/cart')).text,/Your cart is empty/)
  await c.post('/bestbuy/cart/add',{pid:ssd.sku,variant:'2tb',fulfillment:'shipping'})
  const cart=await c.get('/bestbuy/cart'),line=/name="line" value="(\d+)"/.exec(cart.text)[1]
  assert.equal((await c.post('/bestbuy/cart/update',{line,qty:'3'})).status,400)
  assert.equal((await c.post('/bestbuy/cart/update',{line,qty:'1.2'})).status,400)
  assert.equal((await c.post('/bestbuy/cart/update',{line,'availability-selection':'pickup'})).status,400)
  await c.post('/bestbuy/cart/update',{line,action:'save'})
  offer.stock=0
  const restore=await c.post('/bestbuy/cart/saved',{pid:ssd.sku,variant:'2tb',action:'move'})
  assert.equal(restore.status,400)
  assert.match(restore.text,/Move to cart/)
  assert.match(restore.text,/Your cart is empty/)
  offer.stock=originalStock
  assert.equal((await c.post('/bestbuy/cart/saved',{pid:ssd.sku,variant:'2tb',action:'move'})).status,200)
  assert.deepEqual(await c.json('/api/orders?store=bestbuy'),[])
 }finally{offer.stock=originalStock;await srv.close()}
})

test('Best Buy catalog: stock is revalidated on checkout entry and final card or PayPal order',async()=>{
 const srv=await startServer(),ssd=item('ssd'),offer=ssd.variants[1],originalStock=offer.stock
 try {
  for(const method of ['card','paypal']) {
   const c=srv.client()
   await c.post('/bestbuy/cart/add',{pid:ssd.sku,variant:'2tb',fulfillment:'shipping'})
   offer.stock=0
   const entry=await c.get('/bestbuy/checkout/r/fast-track')
   assert.equal(entry.status,400)
   assert.match(entry.text,/unavailable/)
   offer.stock=originalStock
   await readyShipping(c)
   if(method==='paypal') await c.post('/bestbuy/checkout/payment',{action:'paypal'})
   offer.stock=0
   const blocked=await c.post('/bestbuy/checkout/payment',method==='card'?card:{paymentMethod:'paypal'})
   assert.equal(blocked.status,400)
   assert.match(blocked.text,/unavailable/)
   assert.doesNotMatch(blocked.text,/4242424242424242/)
   assert.deepEqual(await c.json('/api/orders?store=bestbuy'),[])
   offer.stock=originalStock
  }
 }finally{offer.stock=originalStock;await srv.close()}
})
