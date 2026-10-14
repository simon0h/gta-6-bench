import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { fixtureCatalog } from '../lib/catalog-policy.js'
import { startServer } from './helpers.js'

const cases = [
  {store:'amazon',ids:['B0H6K928WL','B0H6K49W6Y'],lookup:'byAsin',excluded:['B0H7QK3M2P','B0H7DS6GTA','B0H4ZELDOT','A5G0000001'],cart:{asin:'B0H7QK3M2P'},path:'/dp/B0H7QK3M2P'},
  {store:'walmart',ids:['20482917228','20459958275'],lookup:'byId',excluded:['20486211904','20489120336','55461783','350000001'],cart:{pid:'20489120336'},path:'/ip/20489120336'},
  {store:'target',ids:['1011529119','1011545811','1013468584'],lookup:'byTcin',excluded:['81960427','84233912','82900531','89027781','920000001'],cart:{tcin:'89027781'},path:'/p/-/-/A-89027781'},
  {store:'bestbuy',ids:['JXHY5RW2JZ','JXHY5RKPCY'],lookup:'byId',excluded:['JXHZ2Q4V8N','6685012','BBYC500G1','7800001'],cart:{pid:'6685012'},path:'/product/album/JXHZ2Q4V8N/sku/6685012'},
  {store:'gamestop',ids:['448295','448297'],lookup:'byId',excluded:['448310','448312','gs-gta-v-preowned','gs-dualsense-white'],cart:{pid:'448310'},path:'/products/448310'},
]

test('US reference catalogs contain only eleven source-backed native offers',async()=>{
  assert.equal(fixtureCatalog,false,'Run this suite with CATALOG_MODE=reference or unset')
  for(const c of cases) {
    const data=await import(`../stores/${c.store}/data.js`)
    const {inventory}=await import(`../stores/${c.store}/inventory.js`)
    assert.deepEqual(inventory.map(item=>item.id),c.ids,c.store)
    for(const id of c.excluded) assert.equal(data[c.lookup](id),null,`${c.store}/${id}`)
    for(const p of data.PRODUCTS) {
      assert.ok(p.catalogEvidence.source_url.startsWith('https://'))
      assert.equal(p.catalogEvidence.availability,'preorder')
      assert.equal(p.catalogEvidence.purchase,'simulated')
      assert.equal(p.simulatedStock,true)
    }
  }
  const walmart=await import('../stores/walmart/data.js')
  assert.ok(walmart.PRODUCTS.every(p=>p.reviewEntries.length===0),'Authored customer reviews are not evidence')
  const target=await import('../stores/target/data.js')
  assert.equal(target.protectionPlan().readOnly,true)
  assert.equal(target.protectionPlan().tcin,undefined)
  const gamestop=(await import('../stores/gamestop/index.js')).default
  assert.equal(gamestop.catalog_observations.length,15)
  assert.ok(gamestop.catalog_observations.every(p=>p.purchasable===false&&p.purchase==='unverified'))
})

test('Historical US inventory is accessible only through explicit fixture startup mode',()=>{
  const code=`const out={};for(const store of ['amazon','walmart','target','bestbuy','gamestop']){const {inventory}=await import('./stores/'+store+'/inventory.js');out[store]=inventory.length}console.log(JSON.stringify(out))`
  const result=JSON.parse(execFileSync(process.execPath,['--input-type=module','-e',code],{cwd:new URL('..',import.meta.url),env:{...process.env,CATALOG_MODE:'fixtures'},encoding:'utf8'}))
  assert.deepEqual(result,Object.fromEntries(cases.map(c=>[c.store,500])))
})

test('US reference fulfillment uses captured regional states without invented stock counts',async()=>{
  const bestbuy=await import('../stores/bestbuy/data.js')
  const {localProduct}=await import('../stores/bestbuy/location.js')
  const bbPages=await import('../stores/bestbuy/pages.js')
  const p=bestbuy.PRODUCTS[0]
  assert.equal(p.methodStock,undefined)
  assert.equal(bestbuy.stockFor(localProduct(p,{pickupStoreId:'compton'}),'pickup'),3,'Internal per-order cap, not an observed stock count')
  const burbank=localProduct(p,{pickupStoreId:'burbank'})
  assert.equal(bestbuy.stockFor(burbank,'pickup'),0)
  assert.equal(bestbuy.stockFor(burbank,'shipping'),3)
  assert.match(bestbuy.cartIssue({cart:[{pid:p.sku,qty:1,fulfillment:'pickup'}],pickupStoreId:'burbank'}),/availability is unverified/)
  assert.equal(bestbuy.cartIssue({cart:[{pid:p.sku,qty:1,fulfillment:'shipping'}],pickupStoreId:'burbank'}),null)
  const bbHtml=bbPages.productPage({base:'/bestbuy',p:burbank,accessories:[],storeName:'Burbank'})
  assert.match(bbHtml,/Availability unverified at this store/)
  assert.doesNotMatch(bbHtml,/Order now for pickup on Release Date at <b>Burbank/)
  const target=await import('../stores/target/data.js'), targetPages=await import('../stores/target/pages.js')
  const targetHtml=targetPages.productPage({base:'/target',p:target.PRODUCTS[0],siblings:target.games(),plan:target.protectionPlan(),recs:[],fulfillment:'pickup',storeLocation:'Watsonville'})
  assert.match(targetHtml,/Availability unverified at this store/)
  assert.doesNotMatch(targetHtml,/Not available at Watsonville/)
})

test('US default public pages reject fabricated product and cart identities',async()=>{
  const server=await startServer()
  try {
    for(const c of cases) {
      const client=server.client(), base=`/${c.store}`
      const home=await client.get(base+'/')
      assert.equal(home.status,200,c.store+' home')
      for(const excluded of c.excluded) assert.ok(!home.text.includes(excluded),c.store+' leaks '+excluded)
      assert.equal((await client.get(base+c.path)).status,404,c.store+' invented PDP')
      assert.ok((await client.post(base+'/cart/add',c.cart)).status>=400,c.store+' invented add')
      const data=await import(`../stores/${c.store}/data.js`)
      for(const p of data.PRODUCTS) assert.equal((await client.get(data.productPath(base,p))).status,200,c.store+' canonical PDP')
      assert.deepEqual(await client.json('/api/orders?store='+c.store),[])
    }
    const target=server.client()
    const addon=await target.post('/target/cart/add',{tcin:'1011529119',addon:'89027781'})
    assert.ok(addon.status>=400,'Invented addon cannot be posted with a valid game')
    assert.match((await target.get('/target/cart')).text,/Your cart is empty|cart is empty|cart’s empty|cart is currently empty/i)
    const ps5=await target.get('/target/p/grand-theft-auto-vi-playstation-5/-/A-1011529119')
    assert.match(ps5.text,/Allstate/)
    assert.doesNotMatch(ps5.text,/name="addon"|89027781/)
    const walmart=server.client()
    for (const zip of ['68116','10001']) {
      const nearby=await walmart.get('/walmart/ip/20482917228/pickup?zip='+zip)
      assert.equal(nearby.status,200)
      assert.match(nearby.text,/Pickup availability varies by store/)
      assert.doesNotMatch(nearby.text,/<b>Pickup not available<\/b>/)
    }
    const bestbuy=server.client()
    await bestbuy.post('/bestbuy/stores/select',{store_id:'burbank'})
    const unknownPickup=await bestbuy.post('/bestbuy/cart/add',{pid:'6684968',fulfillment:'pickup'})
    assert.equal(unknownPickup.status,400)
    assert.match(unknownPickup.text,/availability is unverified/)
    assert.ok((await bestbuy.post('/bestbuy/cart/add',{pid:'6684968',fulfillment:'shipping'})).status<400)
  } finally { await server.close() }
})
