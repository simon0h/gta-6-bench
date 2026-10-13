import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { startServer, fieldValue } from './helpers.js'
import { CATALOG_PLATFORMS } from '../lib/expanded-games.js'
import { PRODUCTS as gs, productPath as gsPath } from '../stores/gamestop/data.js'
import { PRODUCTS as uk, productPath as ukPath } from '../stores/game-uk/data.js'
import { browseProducts as eb } from '../stores/eb-games-au/browse.js'
import { canonicalProducts } from '../stores/eb-games-au/canonical-products.js'
import { inventory as gsInventory } from '../stores/gamestop/inventory.js'
import { inventory as ukInventory } from '../stores/game-uk/inventory.js'
import { inventory as ebInventory } from '../stores/eb-games-au/inventory.js'

const stores=[
 {slug:'gamestop',products:gs,inventory:gsInventory,old:41,path:p=>gsPath('/gamestop',p),search:'/gamestop/search',filter:p=>new URLSearchParams({platform:p.catalogPlatform,category:'video-games'}),query:p=>new URLSearchParams({q:p.title}),id:p=>p.id},
 {slug:'game-uk',products:uk,inventory:ukInventory,old:42,path:p=>ukPath('/game-uk',p),search:'/game-uk/searchresults',filter:p=>new URLSearchParams({platform:p.platformFacet,category:'Video Games'}),query:p=>new URLSearchParams({descriptionfilter:p.title}),id:p=>p.id},
 {slug:'eb-games-au',products:eb,inventory:ebInventory,old:31,path:p=>`/eb-games-au/catalog/${p.sku}`,search:'/eb-games-au/search',filter:p=>new URLSearchParams({platform:p.platform,type:'game'}),query:p=>new URLSearchParams({q:p.title}),id:p=>p.sku},
]
const ids=html=>[...html.matchAll(/data-product-id="([^"]+)"/g)].map(m=>m[1])
const samples=store=>[...CATALOG_PLATFORMS.map(platform=>store.products.find(p=>p.catalogRange&&p.catalogType==='game'&&p.catalogPlatform===platform.id)),...['console','accessory'].map(type=>store.products.find(p=>p.catalogRange&&p.catalogType===type))]

test('Game retailers contain exactly 500 base listings, split 250 games/250 other, preserving all nine platforms and original fixtures',()=>{
 for(const store of stores){
  const inventory=store.inventory
  assert.equal(inventory.length,500,store.slug)
  assert.equal(new Set(inventory.map(p=>p.id)).size,500,store.slug)
  assert.equal(inventory.filter(p=>p.type==='game').length,250,store.slug)
  assert.equal(inventory.filter(p=>p.type!=='game').length,250,store.slug)
  assert.equal(store.products.filter(p=>!p.catalogRange).length,store.old)
  for(const platform of CATALOG_PLATFORMS)assert.ok(inventory.filter(p=>p.type==='game'&&p.platform===platform.id).length>=26,`${store.slug} ${platform.id}`)
  for(const p of store.products){
   assert.ok(p.specs&&Object.keys(p.specs).length>=2,store.id(p))
   assert.ok(Number.isFinite(p.price)&&p.price>0,store.id(p))
   assert.ok(Number.isInteger(p.stock)&&p.stock>=0,store.id(p))
   if(p.catalogRange){
    assert.equal(p.kind,'other',store.id(p))
    assert.ok(p.art,store.id(p))
    const relative=p.art.startsWith('/static/')?`public/${p.art.slice('/static/'.length)}`:`stores/gamestop/public/${p.art.slice('/gamestop/static/'.length)}`
    assert.ok(existsSync(new URL(`../${relative}`,import.meta.url)),`${store.slug} ${relative}`)
   }
  }
 }
 assert.deepEqual(gs.filter(p=>p.kind==='game').map(p=>p.id),['448295','448297'])
 assert.deepEqual(uk.filter(p=>p.kind==='game').map(p=>p.id),['756802','400064'])
 assert.deepEqual(canonicalProducts.map(p=>p.sku),['330056','330060'])
 assert.ok(gsInventory.some(p=>p.type==='game'&&p.platform==='retro'))
 assert.ok(ukInventory.some(p=>p.type==='game'&&p.platform==='pc'))
})

test('All 1500 game-retailer PDPs resolve and each 42-page catalog exposes every item exactly once',async()=>{
 const srv=await startServer()
 try{
  const c=srv.client(),artUrls=new Set()
  for(const store of stores){
   for(const p of store.products){
    const page=await c.get(store.path(p));assert.equal(page.status,200,`${store.slug} ${store.id(p)}`)
    assert.match(page.text,/Add to (?:Cart|Bag)|Pre-Order|Preorder|Sold out|Out of stock|OUT OF STOCK|Add To Bag/,store.id(p))
    if(p.catalogRange)artUrls.add(p.art)
   }
   const all=[]
   for(let page=1;page<=42;page++){
    const result=await c.get(`${store.search}?page=${page}`)
    const pageIds=ids(result.text)
    assert.equal(pageIds.length,page===42?8:12,`${store.slug} page ${page}`)
    all.push(...pageIds)
   }
   assert.equal(all.length,500)
   assert.deepEqual(new Set(all),new Set(store.inventory.map(p=>p.id)),store.slug)
   assert.deepEqual(ids((await c.get(`${store.search}?page=999`)).text),all.slice(492),store.slug)
  }
  for(const p of canonicalProducts)assert.equal((await c.get(`/eb-games-au${p.path}`)).status,200)
  for(const url of artUrls)assert.equal((await c.get(url)).status,200,url)
  const ebHome=await c.get('/eb-games-au')
  assert.ok(ids(ebHome.text).length<30,'EB home shelves stay bounded')
 }finally{await srv.close()}
})

test('Every requested game platform and representative new hardware are reachable through native searches',async()=>{
 const srv=await startServer()
 try{
  const c=srv.client()
  for(const store of stores){
   for(const p of samples(store)){
    const found=await c.get(`${store.search}?${store.query(p)}`)
    assert.ok(ids(found.text).includes(store.id(p)),`${store.slug} ${p.title}`)
    if(p.catalogType==='game'){
     const filtered=ids((await c.get(`${store.search}?${store.filter(p)}`)).text)
     assert.ok(filtered.length,`${store.slug} ${p.catalogPlatform}`)
     for(const id of filtered){const entry=store.inventory.find(p=>p.id===id);assert.equal(entry.type,'game');assert.equal(entry.platform,p.catalogPlatform)}
    }
   }
  }
 }finally{await srv.close()}
})

test('Nine new games and hardware buy through each native checkout as other; EB takes full ordinary payment and no GTA deposit',async()=>{
 const srv=await startServer()
 try{
  for(const store of stores){
   const c=srv.client(),selection=samples(store)
   const root=`/${store.slug}`
   for(const p of selection){
    const body=store.slug==='eb-games-au'?{sku:p.sku,qty:'1'}:{pid:p.id,qty:'1'}
    const added=await c.post(`${root}/cart/add`,{...body,kind:'game',unit_price:'0.01'})
    assert.equal(added.status,200,`${store.slug} ${p.title}`)
   }
   let done
   if(store.slug==='gamestop'){
    const review=await c.post(`${root}/checkout/login`,{action:'guest'})
    done=await c.post(`${root}/checkout`,{firstName:'Alex',lastName:'Tester',address1:'123 Ocean Dr',city:'Miami',stateCode:'FL',postalCode:'33139',phone:'3055550123',email:'catalog500@example.com',shippingMethod:'premium',paymentMethod:'paypal',billingSame:'1',reviewToken:fieldValue(review.text,'reviewToken')})
   }else if(store.slug==='game-uk'){
    await c.post(`${root}/account/login`,{action:'guest',email:'catalog500@example.com',returnUrl:'/checkout'})
    const review=await c.post(`${root}/checkout/delivery`,{firstName:'Jamie',lastName:'Example',addressLine1:'10 Test Road',town:'London',postcode:'SW1A 2AA',mobile:'07700900123',country:'GB',deliveryMethod:'standard'})
    done=await c.post(`${root}/checkout/payment`,{paymentMethod:'card',cardNumber:'4242424242424242',expiry:'12/39',cvv:'123',nameOnCard:'Jamie Example',billingSame:'1',review_token:fieldValue(review.text,'review_token')})
   }else{
    await c.post(`${root}/checkout/guest`,{guest_email:'catalog500@example.com'})
    const review=await c.post(`${root}/checkout/delivery`,{method:'ship',first_name:'Alex',last_name:'Tester',phone:'0412345678',address:'10 Example St',suburb:'Sydney',state:'NSW',postcode:'2000',shipping_method:'standard'})
    done=await c.post(`${root}/checkout/payment`,{payment_method:'card',card_number:'4242424242424242',card_expiry:'12/39',card_cvv:'123',card_name:'Alex Tester',accept_deposit:'yes',review_token:fieldValue(review.text,'review_token')})
   }
   assert.equal(done.status,200,store.slug);assert.match(done.text,/Thank you for your order/)
   const [order]=await c.json(`/api/orders?store=${store.slug}`)
   assert.equal(order.items.length,selection.length)
   for(const item of order.items){
    assert.equal(item.kind,'other',item.sku)
    assert.equal(item.platform,undefined,item.sku)
    assert.equal(item.unit_price,selection.find(p=>store.id(p)===item.sku).price,item.sku)
   }
   if(store.slug==='eb-games-au'){assert.equal(order.meta.deposit_paid,0);assert.equal(order.meta.balance_due,0);assert.equal(order.meta.paid_today,order.totals.total)}
  }
 }finally{await srv.close()}
})
