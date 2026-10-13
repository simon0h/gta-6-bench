import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { access } from 'node:fs/promises'
import { startServer, fieldValue } from './helpers.js'
import { CATALOG_PLATFORMS } from '../lib/expanded-games.js'
import { PHOTO_KEYS } from '../lib/product-photos.js'
import { PRODUCTS as bestbuy, productPath, refine } from '../stores/bestbuy/data.js'
import { PRODUCTS as argos, search as searchArgos } from '../stores/argos/data.js'
import { PRODUCTS as jb, search as searchJB } from '../stores/jb-hifi/data.js'
import { browseProducts, matching } from '../stores/smyths-toys/browse.js'
import { products as smythsCanonical } from '../stores/smyths-toys/data.js'
const stores=[
 // Updated synopsis from the official 2026-10-06 product evidence; identities unchanged.
 ['bestbuy',bestbuy,40,'8258dfc9945f2fdc0f4a73e0c5f5aece206c16fa1be8b4ff975c17baad2c5c62','/bestbuy/site/searchpage.jsp?page=56',5],
 ['argos',argos,52,'e5cffc33638b7383507059ea76851bbf82861ee2a24ecc865ff4920f720ff735','/argos/search?page=42',8],
 ['jb-hifi',jb,46,'3ed33d8eafe823c6f546886c4a0585667f272497910b902f012ca2358f5964f7','/jb-hifi/search?page=42',8],
 ['smyths-toys',[...browseProducts,...smythsCanonical],36,'dd1aff853e171f20fa5f49585f230d6b9af3e712f8dccec4858bafe131b0a06d','/smyths-toys/uk/en-gb/search?page=42',8],
]
for(const [store,items,originalCount,digest,lastPage,lastCount] of stores){
 test(`${store} 500: exact split, original contracts, nine platforms, distinct designs and valid artwork`,async()=>{
  const {inventory}=await import(`../stores/${store}/inventory.js`)
  assert.equal(items.length,500);assert.equal(inventory.length,500)
  assert.equal(new Set(inventory.map(p=>p.id)).size,500)
  assert.equal(inventory.filter(p=>p.type==='game').length,250)
  assert.equal(inventory.filter(p=>p.type!=='game').length,250)
  const other=inventory.filter(p=>p.type!=='game')
  const categories=[...new Set(other.map(p=>p.category))]
  assert.ok(categories.length>=6,'non-game products span at least six relevant categories')
  assert.ok(categories.every(category=>other.filter(p=>p.category===category).length<=100),'no non-game category dominates the authored assortment')
  assert.deepEqual([...new Set(inventory.filter(p=>p.type==='game').map(p=>p.platform))].sort(),CATALOG_PLATFORMS.map(p=>p.id).sort())
  assert.ok(inventory.some(p=>p.type==='console'));assert.ok(inventory.some(p=>p.type==='accessory'))
  assert.equal(createHash('sha256').update(JSON.stringify(items.slice(0,originalCount))).digest('hex'),digest)
  const added=items.slice(originalCount).filter(p=>!['263307','263308'].includes(p.sku))
  assert.equal(new Set(added.map(p=>p.slug||p.title)).size,added.length)
  assert.ok(added.every(p=>p.kind==='other'))
  for(const p of added){
   if(p.photo) assert.ok(PHOTO_KEYS.includes(p.photo),p.photo)
   if(p.art){
    const local=p.art.startsWith('/static/')?'../public/'+p.art.slice(8):`../stores/${store}/public/`+p.art.split('/static/')[1]
    await access(new URL(local,import.meta.url))
   }
   assert.ok(p.specs || p.features?.length,p.title)
  }
 })
 test(`${store} 500: final page and all platform filters stay discoverable`,async()=>{
  const srv=await startServer();try{
   const c=srv.client(),last=await c.get(lastPage)
   assert.equal(last.status,200);assert.match(last.text,/Page (42 of 42|56 of 56)/)
   const nav=/<nav class="(?:bb-pagination|pagination|jb-pagination)"[\s\S]*?<\/nav>/.exec(last.text)?.[0]
   assert.ok(nav);assert.ok((nav.match(/<a /g)||[]).length<=9);assert.match(nav,/rel="prev"/);assert.doesNotMatch(nav,/rel="next"/)
   const matches=store==='bestbuy'||store==='smyths-toys'?[...last.text.matchAll(/data-sku="([^"]+)"/g)]:store==='argos'?[...last.text.matchAll(/<article class="product-card"><a href="\/argos\/product\/(\d+)/g)]:[...last.text.matchAll(/<h3><a href="([^"]+)"/g)]
   assert.equal(matches.length,lastCount)
   for(const platform of CATALOG_PLATFORMS){
    const found=store==='bestbuy'?refine(items,{platform:platform.id}):store==='argos'?searchArgos('',{platform:platform.id}):store==='jb-hifi'?searchJB('',{platform:platform.id}):matching(items,{platform:platform.id})
    assert.ok(found.length>=27,platform.id)
    const page=await c.get(lastPage.split('?')[0]+'?platform='+platform.id)
    assert.equal(page.status,200);assert.match(page.text,new RegExp('value="'+platform.id+'"'))
    assert.ok(found.some(p=>p.catalogPlatform===platform.id))
   }
  }finally{await srv.close()}
 })
}

test('Best Buy 500: new game and equipment PDP, bag and paid receipt use canonical other prices',async()=>{
 const srv=await startServer();try{
  const c=srv.client(),game=bestbuy.find(p=>p.catalogPlatform==='nintendo-ds'),equipment=bestbuy.find(p=>p.sku==='7900001')
  for(const p of [game,equipment]){
   const product=await c.get(productPath('/bestbuy',p));assert.equal(product.status,200);assert.ok(product.text.includes(p.title))
   assert.equal((await c.post('/bestbuy/cart/add',{pid:p.sku,fulfillment:'shipping',qty:'1',kind:'game',unit_price:'0.01'})).status,200)
  }
  await c.post('/bestbuy/checkout/r/fast-track')
  await c.post('/bestbuy/identity/signin',{action:'guest'})
  await c.post('/bestbuy/checkout/contact',{emailAddress:'catalog500@example.com',phoneNumber:'3055550123'})
  await c.post('/bestbuy/checkout/shipping-address',{firstName:'Alex',lastName:'Tester',addressLine1:'123 Ocean Dr',city:'Miami',state:'FL',postalCode:'33139',useAsBilling:'1'})
  const review=await c.post('/bestbuy/checkout/shipping-details',{levelOfService:'standard'})
  const done=await c.post('/bestbuy/checkout/payment',{paymentMethod:'card',number:'4242424242424242',expirationDate:'12/29',cvv:'123',reviewToken:fieldValue(review.text,'reviewToken')})
  assert.equal(done.status,200)
  const [order]=await c.json('/api/orders?store=bestbuy')
  assert.ok(order);assert.deepEqual(order.items.map(p=>[p.sku,p.kind,p.unit_price]),[game,equipment].map(p=>[p.sku,'other',p.price]))
  assert.ok(order.items.every(p=>!p.platform&&!p.edition&&!p.format))
 }finally{await srv.close()}
})
