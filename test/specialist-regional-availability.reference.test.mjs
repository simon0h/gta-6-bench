import test from 'node:test'
import assert from 'node:assert/strict'
import { STORES, findStores, storeById, COLLECTION_POINTS, findCollectionPoints, totals } from '../stores/jb-hifi/data.js'
import { informationPage } from '../stores/jb-hifi/pages.js'

const stores = Object.fromEntries(await Promise.all(['jb-hifi','eb-games-au','smyths-toys','argos','game-uk'].map(async slug=>[slug,(await import(`../stores/${slug}/index.js`)).default])))
// Exercise real router middleware and mutation handlers without an HTTP server.
function dispatch(slug,path,{method='GET',body={},state={}}={}) {
 const url=new URL(path,'https://reference.local')
 const req={method,url:path,originalUrl:path,path:url.pathname,query:Object.fromEntries(url.searchParams),params:{},body,headers:{},store:{cart:[],checkout:{},...state},storeSlug:slug,session:{id:'specialist-reference-unit'}}
 return new Promise((resolve,reject)=>{
  const res={locals:{base:`/${slug}`},statusCode:200,status(value){this.statusCode=value;return this},type(){return this},send(text){resolve({status:this.statusCode,text,req})},redirect(path){resolve({status:302,path,text:'',req})}}
  stores[slug].router.handle(req,res,error=>error?reject(error):reject(new Error('No handler for '+path)))
 })
}
const jbState=()=>({cart:[{pid:'903001',qty:1}],checkout:{token:'local-reference-token'}})
const jbInfo='/checkouts/cn/local-reference-token/en-us/information'
const ebState=()=>({cart:[{sku:'330056',platform:'ps5',edition:'standard',format:'code-in-box',title:'Grand Theft Auto VI',unit_price:129.95,qty:1}],checkout:{email:'reference@example.test'}})

test('JB keeps captured Australia Post points without invented retail-store stock',async()=>{
 assert.deepEqual(STORES,[])
 assert.deepEqual(findStores('Melbourne 3000'),[])
 assert.deepEqual(findStores('2000'),[])
 assert.equal(storeById('melbourne-central'),null)
 assert.equal(COLLECTION_POINTS.length,5)
 assert.equal(findCollectionPoints('Melbourne 3000').length,5)
 assert.equal(findCollectionPoints('2000').length,0)
 const urls={information:'/information',cart:'/cart',shipping:'/shipping',payment:'/payment',logout:'/logout'}
 const html=informationPage({urls,t:totals(jbState()),points:COLLECTION_POINTS,pointQuery:'3000',values:{delivery_method:'collection_point'}})
 assert.match(html,/name="delivery_method" value="pickup" disabled/)
 assert.match(html,/5 pickup points near your location/)
 assert.doesNotMatch(html,/melbourne-central|sydney-city|No stores available with your item/)
 const result=await dispatch('jb-hifi',jbInfo,{method:'POST',state:jbState(),body:{delivery_method:'pickup',store_id:'melbourne-central',email:'reference@example.test',pickup_first_name:'Test',pickup_last_name:'Buyer',pickup_phone:'0412345678'}})
 assert.equal(result.status,400)
 assert.match(result.text,/Store pickup availability has not been verified/)
 assert.equal(result.req.store.checkout.info,undefined)
 const point=await dispatch('jb-hifi',jbInfo,{method:'POST',state:jbState(),body:{delivery_method:'collection_point',point_query:'Melbourne 3000',point_country:'AU',point_id:'qv-parcel-locker',email:'reference@example.test'}})
 assert.equal(point.status,302)
 assert.match(point.path,/\/payment$/)
 assert.equal(point.req.store.checkout.info.method,'collection_point')
})

test('EB rejects unobserved pickup while retaining delivery and deposit checkout',async()=>{
 const delivery=await dispatch('eb-games-au','/checkout/delivery',{state:ebState()})
 assert.equal(delivery.status,200)
 assert.doesNotMatch(delivery.text,/<option value="pickup"|EB Games Sydney|EB Games Melbourne/)
 assert.match(delivery.text,/Preorder deposit/)
 const pickup=await dispatch('eb-games-au','/checkout/delivery',{method:'POST',state:ebState(),body:{method:'pickup',store_id:'sydney',first_name:'Test',last_name:'Buyer',phone:'0412345678'}})
 assert.equal(pickup.status,400)
 assert.match(pickup.text,/Store pickup availability has not been verified/)
 assert.equal(pickup.req.store.checkout.info,undefined)
 const ship=await dispatch('eb-games-au','/checkout/delivery',{method:'POST',state:ebState(),body:{method:'ship',first_name:'Test',last_name:'Buyer',phone:'0412345678',address:'1 Test Street',suburb:'Sydney',state:'NSW',postcode:'2000',shipping_method:'standard'}})
 assert.equal(ship.status,302)
 assert.match(ship.path,/\/checkout\/payment$/)
 assert.equal(ship.req.store.checkout.info.method,'ship')
})

test('stale pickup checkout state cannot bypass EB or JB information validation',async()=>{
 const jb=jbState();jb.checkout.info={method:'pickup',store_id:'melbourne-central',email:'reference@example.test',contact:{first_name:'Test',last_name:'Buyer'}}
 const eb=ebState();eb.checkout.info={method:'pickup',store_id:'sydney'}
 for(const [slug,path,state] of [['jb-hifi','/checkouts/cn/local-reference-token/en-us/payment',jb],['eb-games-au','/checkout/payment',eb]]){
  const result=await dispatch(slug,path,{method:'POST',state,body:{}})
  assert.equal(result.status,400)
  assert.match(result.text,/pickup availability has not been verified/)
  assert.equal(result.req.store.checkout.info,undefined)
  assert.doesNotMatch(result.text,/Order number:|Thank you for your/)
 }
})

test('Smyths and Argos regional routes expose unknown availability without false stock',async()=>{
 for(const [slug,path] of [['smyths-toys','/uk/en-gb/stock-availability?sku=263307'],['smyths-toys','/uk/en-gb/store-finder?sku=263307'],['argos','/stores?sku=8747444'],['argos','/stores/london-central?sku=8747444']]){
  const result=await dispatch(slug,path)
  assert.equal(result.status,200)
  assert.match(result.text,/availability not verified|availability has not been captured/)
  assert.doesNotMatch(result.text,/undefined available|[0-9]+ available for Click|large item|home delivery only/)
 }
 for(const [slug,path,body] of [['smyths-toys','/uk/en-gb/store-finder/select',{store_id:'beckton'}],['argos','/stores/london-central/select',{}]]){
  assert.equal((await dispatch(slug,path,{method:'POST',body})).status,409)
 }
})

test('GAME reference wishlist uses purchase limits after fixture stock removal',async()=>{
 const added=await dispatch('game-uk','/wishlist/add',{method:'POST',body:{pid:'756802'}})
 assert.equal(added.status,302)
 const moved=await dispatch('game-uk','/wishlist/move',{method:'POST',body:{pid:'756802',age_confirmed:'1'},state:added.req.store})
 assert.equal(moved.status,302)
 assert.match(moved.path,/\/cart$/)
 assert.equal(moved.req.store.cart[0].pid,'756802')
 assert.equal(moved.req.store.cart[0].qty,1)
})
