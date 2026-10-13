import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { PRODUCTS as amazon, search as azSearch, productPath as azPath } from '../stores/amazon/data.js'
import { PRODUCTS as walmart, refine as wmRefine, productPath as wmPath } from '../stores/walmart/data.js'
import { PRODUCTS as target, refine as tgRefine, productPath as tgPath } from '../stores/target/data.js'
import { inventory as ai } from '../stores/amazon/inventory.js'
import { inventory as wi } from '../stores/walmart/inventory.js'
import { inventory as ti } from '../stores/target/inventory.js'
import { CATALOG_PLATFORMS } from '../lib/expanded-games.js'
import { pageWindow } from '../stores/amazon/assortment500.js'
import { startServer } from './helpers.js'
import { assertProductGalleryMarkup } from './product-gallery-assertions.js'
const stores=[['amazon',amazon,ai,p=>p.asin,azPath],['walmart',walmart,wi,p=>p.id,wmPath],['target',target,ti,p=>p.tcin,tgPath]]
const escape=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;')
for(const [store,products,inventory,id,path]of stores){
 test(`${store} inventory: 500 base listings, 250 playable games, all nine platforms and preserved gradeable GTA boundary`,()=>{
  assert.equal(inventory.length,500)
  assert.equal(new Set(inventory.map(p=>p.id)).size,500)
  assert.equal(new Set(inventory.map(p=>p.title)).size,500)
  assert.equal(inventory.filter(p=>p.type==='game').length,250)
  assert.equal(inventory.filter(p=>p.type!=='game').length,250)
  assert.equal(products.filter(p=>p.kind==='game').length,2)
  assert.equal(inventory.filter(p=>!p.available).length,1)
  for(const {id:platform}of CATALOG_PLATFORMS){const count=inventory.filter(p=>p.type==='game'&&p.platform===platform).length;assert.ok(count===27||count===28,`${platform}: ${count}`)}
  for(const p of products.filter(p=>p.catalog500)){
   assert.equal(p.kind,'other')
   assert.ok(p.stock>0&&p.price>0)
   const artPath=p.art.startsWith('/static/')?'public/'+p.art.slice(8):`stores/${store}/public/`+p.art.split('/static/')[1]
   assert.ok(existsSync(artPath),artPath)
   assert.ok(readFileSync(artPath,'utf8').includes(escape(p.gameTitle||p.title)),p.title)
  }
  assert.ok(new Set(inventory.filter(p=>p.type!=='game').map(p=>p.category)).size>=7)
  assert.deepEqual(pageWindow(21,42),[1,null,19,20,21,22,23,null,42])
 })
 test(`${store} expanded catalog: every new PDP resolves, exact platform facets work, and final page stays bounded`,async()=>{
  const srv=await startServer()
  try{
   const c=srv.client()
   for(const p of products.filter(p=>p.catalog500)){
    const pdp=await c.get(path('/'+store,p))
    assert.equal(pdp.status,200,p.title)
    assertProductGalleryMarkup(pdp.text,store,id(p))
    assert.doesNotMatch(pdp.text,/undefined|NaN/,p.title)
   }
   for(const {id:platform}of CATALOG_PLATFORMS){
    const hits=store==='amazon'?azSearch('','videogames','',{platform}):store==='walmart'?wmRefine(products,{platform,category:'games'}):tgRefine(products,{platform,type:'Video Games'})
    assert.ok(hits.some(p=>p.catalogType==='game'))
    assert.ok(hits.every(p=>p.catalogPlatform===platform))
    const result=await c.get(store==='amazon'?`/amazon/s?i=videogames&platform=${platform}`:store==='walmart'?`/walmart/search?department=games&category=games&platform=${platform}`:`/target/c/video-games?type=Video+Games&platform=${platform}`)
    assert.equal(result.status,200)
    assert.ok(result.text.includes(hits[0].title.replaceAll('&','&amp;').replaceAll("'",'&#39;')),platform)
   }
   const last=await c.get(store==='amazon'?'/amazon/s?page=42':store==='walmart'?'/walmart/search?page=42':'/target/s?page=42')
   assert.equal(last.status,200)
   assert.match(last.text,store==='amazon'?/493-500 of 500/:store==='walmart'?/493–500 of 500/:/500 results.*Showing 493–500/)
   const pagination=last.text.match(/<nav class="(?:az-pagination|wm-pager|tg-paging)"[^>]*>([\s\S]*?)<\/nav>/)[1]
   assert.ok([...pagination.matchAll(/<a\b/g)].length<=8)
   assert.match(pagination,/42/)
   const middle=await c.get(store==='amazon'?'/amazon/s?platform=ps3&page=2':store==='walmart'?'/walmart/search?platform=ps3&page=2':'/target/s?platform=ps3&page=2')
   assert.match(middle.text,/platform=ps3/)
  }finally{await srv.close()}
 })
 test(`${store} expanded purchases: nine game platforms and ordinary merchandise buy at trusted prices as other`,async()=>{
  const srv=await startServer()
  try{
   const c=srv.client(), chosen=[...CATALOG_PLATFORMS.map(({id:platform})=>products.find(p=>p.catalog500&&p.catalogType==='game'&&p.catalogPlatform===platform)),...['kitchen','toys'].map(section=>products.find(p=>p.catalog500&&p.section===section))]
   for(const p of chosen){
    const body=store==='amazon'?{asin:id(p),quantity:1}:store==='walmart'?{pid:id(p),qty:1}:{tcin:id(p),qty:1}
    assert.equal((await c.post(`/${store}/cart/add`,{...body,price:'0.01',kind:'game',platform:'ps5'})).status,200,p.title)
   }
   if(store==='amazon'){
    await c.post('/amazon/gp/cart/desktop/go-to-checkout.html',{})
    await c.post('/amazon/ax/claim',{email:'tester@example.com'})
    await c.post('/amazon/ap/signin/password',{password:'Password123!'})
    await c.post('/amazon/gp/buy/addressselect',{countryCode:'US',fullName:'Alex Tester',phoneNumber:'3055550123',addressLine1:'123 Ocean Dr',city:'Miami',state:'FL',postalCode:'33139'})
    await c.post('/amazon/gp/buy/payselect',{cardNumber:'4242424242424242',nameOnCard:'Alex Tester',expMonth:'12',expYear:'2029'})
    assert.equal((await c.post('/amazon/gp/buy/spc',{delivery:'standard',action:'place'})).status,200)
   }else if(store==='walmart'){
    await c.post('/walmart/cart/checkout',{})
    await c.post('/walmart/account/login?state=%2Fcart%3Fcheckout%3Dtrue',{identifier:'tester@example.com'})
    await c.post('/walmart/account/signin/withpassword',{password:'Password123!'})
    await c.post('/walmart/checkout/address',{firstName:'Alex',lastName:'Tester',address1:'123 Ocean Dr',city:'Miami',state:'FL',zip:'33139',phone:'3055550123'})
    await c.post('/walmart/checkout/payment',{method:'card',cardNumber:'4242424242424242',expMonth:'12',expYear:'29',cvv:'123',firstName:'Alex',lastName:'Tester',phone:'3055550123',billingSame:'1'})
    assert.equal((await c.post('/walmart/checkout/place-order',{})).status,200)
   }else{
    await c.post('/target/login',{email:'tester@example.com',password:'Password123!',redirect:'/target/checkout'})
    await c.post('/target/checkout/shipping',{firstName:'Alex',lastName:'Tester',address1:'123 Ocean Dr',city:'Miami',state:'FL',zip:'33139',phone:'3055550123'})
    await c.post('/target/checkout/payment',{paymentType:'card',cardNumber:'4242424242424242',expiry:'12/29',cvv:'123',nameOnCard:'Alex Tester',billingSame:'1'})
    assert.equal((await c.post('/target/checkout/place-order')).status,200)
   }
   const [order]=await c.json(`/api/orders?store=${store}`)
   assert.ok(order)
   assert.equal(order.items.length,11)
   assert.ok(order.items.every(item=>item.kind==='other'))
   for(const p of chosen)assert.equal(order.items.find(item=>item.sku===id(p)).unit_price,p.price)
   assert.equal(order.totals.subtotal,Number(chosen.reduce((n,p)=>n+p.price,0).toFixed(2)))
   assert.equal(order.totals.shipping,0)
   assert.equal(order.totals.tax,Number((order.totals.subtotal*(store==='target'?.0975:.07)).toFixed(2)))
  }finally{await srv.close()}
 })
}
