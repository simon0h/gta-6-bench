import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer, fieldValue } from './helpers.js'
import { PRODUCTS } from '../stores/argos/data.js'
import { getOrder } from '../lib/orders.js'
const main = html => html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)[1]
const path = r => new URL(r.url).pathname
const ADDRESS = { label:'Home', name:'Alex Tester', phone:'07700 900123', line1:'10 High Street', line2:'Flat 2', city:'London', postal_code:'SW1A 1AA', is_default:'yes' }
const DETAILS = { first_name:'Alex', last_name:'Tester', phone:'07700 900123', line1:'10 High Street', city:'London', postcode:'SW1A 1AA', method:'ship' }
const CARD = { name_on_card:'Alex Tester', card_number:'4242424242424242', expiry:'12/99', cvv:'123', billing_same:'1', terms:'1' }
const signIn = c => c.post('/argos/account',{action:'signin',email:'tester@example.com',password:'Password123!'})
async function add(c, sku='9901005', variant='steel', qty='1') {
  await c.post(`/argos/product/${sku}/stock`,{postcode:'SW1A 1AA',variant})
  return c.post('/argos/trolley/add',{sku,variant,qty,age_confirmed:'1'})
}
async function order(c, member=true) {
  await add(c)
  if(member) await signIn(c)
  else await c.post('/argos/account',{action:'guest',email:'guest@example.com'})
  const review=await c.post('/argos/checkout/details',DETAILS)
  const done=await c.post('/argos/checkout/payment',{...CARD,review_token:fieldValue(review.text,'review_token')})
  assert.match(path(done),/\/checkout\/confirmation\/\d+$/)
  return path(done).split('/').at(-1)
}
const addressId = html => /\/account\/addresses\/(address-[a-f\d]+)\/edit/.exec(html)?.[1]

test('argos journeys: exact-option wishlist and recent views isolate accounts and sessions',async()=>{
  const srv=await startServer()
  try{
    const c=srv.client(), outsider=srv.client()
    await c.get('/argos/product/9901005?variant=steel')
    await c.get('/argos/product/9901005?variant=black')
    const recent=main((await c.get('/argos/recently-viewed')).text)
    assert.match(recent,/variant=steel/);assert.match(recent,/variant=black/)
    assert.ok(recent.indexOf('variant=black')<recent.indexOf('variant=steel'))
    await c.post('/argos/wishlist/toggle',{sku:'9901005',variant:'steel'})
    let wish=main((await c.get('/argos/wishlist')).text)
    assert.match(wish,/£34\.99/);assert.match(wish,/variant=steel/)
    assert.equal((await c.post('/argos/wishlist/toggle',{sku:'9901005',variant:'forged'})).status,404)
    assert.doesNotMatch(main((await outsider.get('/argos/wishlist')).text),/variant=steel/)
    await signIn(c)
    assert.doesNotMatch(main((await c.get('/argos/wishlist')).text),/variant=steel/)
    await c.post('/argos/wishlist/toggle',{sku:'9901005',variant:'black'})
    await c.post('/argos/account/signout')
    wish=main((await c.get('/argos/wishlist')).text)
    assert.match(wish,/variant=steel/);assert.doesNotMatch(wish,/variant=black/)
    await c.post('/argos/wishlist/toggle',{sku:'9901005',variant:'steel',destination:'wishlist'})
    assert.match(main((await c.get('/argos/wishlist')).text),/wishlist is empty/)
    await c.post('/argos/recently-viewed/clear')
    assert.doesNotMatch(main((await c.get('/argos/recently-viewed')).text),/variant=/)
  }finally{await srv.close()}
})

test('argos journeys: save and restore preserves exact variant and qty; rejects sold-out restore without losing item and invalidates review',async()=>{
  const srv=await startServer(), kettle=PRODUCTS.find(p=>p.sku==='9901005'), variant=kettle.variants.find(v=>v.id==='steel'), stock=variant.stock
  try{
    const c=srv.client()
    await add(c,'9901005','steel','2')
    await c.post('/argos/account',{action:'guest',email:'save@example.com'})
    let review=await c.post('/argos/checkout/details',DETAILS), token=fieldValue(review.text,'review_token')
    assert.equal((await c.post('/argos/trolley/save',{sku:'9901005',line_key:'9901005:forged'})).status,400)
    await c.post('/argos/trolley/save',{line_key:'9901005:steel',qty:'5',variant:'black',unit_price:'0'})
    let trolley=main((await c.get('/argos/trolley')).text)
    assert.match(trolley,/trolley is empty/);assert.match(trolley,/Quantity 2/);assert.match(trolley,/variant=steel/)
    variant.stock=0
    assert.equal((await c.post('/argos/trolley/restore',{line_key:'9901005:steel'})).status,400)
    assert.match(main((await c.get('/argos/trolley')).text),/Saved for later \(1\)/)
    variant.stock=stock
    assert.equal((await c.post('/argos/trolley/restore',{line_key:'9901005:steel',variant:'black',qty:'1',unit_price:'0'})).status,200)
    trolley=main((await c.get('/argos/trolley')).text)
    assert.match(trolley,/£69\.98/);assert.match(trolley,/Saved for later \(0\)/)
    assert.equal(path(await c.post('/argos/checkout/payment',{...CARD,review_token:token})),'/argos/checkout/details')
    // Restoration into another ordinary cart must also remove its completed review.
    await c.post('/argos/trolley/save',{line_key:'9901005:steel'})
    await add(c,'9901006','','1')
    review=await c.post('/argos/checkout/details',DETAILS);token=fieldValue(review.text,'review_token')
    await c.post('/argos/trolley/restore',{line_key:'9901005:steel'})
    assert.equal(path(await c.post('/argos/checkout/payment',{...CARD,review_token:token})),'/argos/checkout/details')
    assert.equal((await c.json('/api/orders?store=argos')).length,0)
  }finally{variant.stock=stock;await srv.close()}
})

test('argos journeys: UK address CRUD, defaults, checkout picker, private account state and profile preferences',async()=>{
  const srv=await startServer()
  try{
    const c=srv.client(), outsider=srv.client()
    assert.equal(path(await c.get('/argos/account/addresses')),'/argos/account')
    await signIn(c)
    let r=await c.post('/argos/account/addresses',{...ADDRESS,postal_code:'bad'})
    assert.equal(r.status,400);assert.equal(fieldValue(r.text,'line1'),ADDRESS.line1)
    r=await c.post('/argos/account/addresses',ADDRESS)
    const home=addressId(r.text);assert.ok(home)
    r=await c.post('/argos/account/addresses',{...ADDRESS,label:'Work',line1:'20 Market Street',city:'Manchester',postal_code:'M1 1AA',is_default:''})
    const work=[...r.text.matchAll(/\/account\/addresses\/(address-[a-f\d]+)\/edit/g)].map(m=>m[1]).find(id=>id!==home)
    await c.post(`/argos/account/addresses/${work}/default`)
    await add(c)
    r=await c.get('/argos/checkout/details')
    assert.equal(fieldValue(r.text,'line1'),'20 Market Street');assert.match(r.text,new RegExp(`value="${work}" selected`))
    r=await c.get(`/argos/checkout/details?address_id=${home}`)
    assert.equal(fieldValue(r.text,'line1'),ADDRESS.line1)
    await signIn(outsider)
    assert.equal((await outsider.get(`/argos/account/addresses/${home}/edit`)).status,404)
    await add(outsider)
    assert.equal((await outsider.get(`/argos/checkout/details?address_id=${home}`)).status,404)
    assert.equal((await c.post('/argos/account/addresses',{...ADDRESS,id:'address-forged'})).status,400)
    await c.post('/argos/account/addresses',{...ADDRESS,id:home,line1:'12 High Street'})
    r=await c.get(`/argos/account/addresses/${home}/edit`)
    assert.equal(fieldValue(r.text,'line1'),'12 High Street')
    let review=await c.post('/argos/checkout/details',DETAILS)
    await c.post(`/argos/account/addresses/${home}/delete`)
    assert.equal(path(await c.post('/argos/checkout/payment',{...CARD,review_token:fieldValue(review.text,'review_token')})),'/argos/checkout/details')
    assert.equal((await c.get(`/argos/account/addresses/${home}/edit`)).status,404)
    r=await c.post('/argos/account/profile',{first_name:'Sam',last_name:'Shopper',phone:'07700 900456',password:'DoNotSaveMe'})
    assert.equal(r.status,200);assert.doesNotMatch(r.text,/DoNotSaveMe/)
    assert.equal((await c.post('/argos/account/preferences',{shopping_method:'teleport'})).status,400)
    await c.post('/argos/account/preferences',{shopping_method:'pickup',offers:'yes'})
    await c.post('/argos/account/signout')
    await signIn(c)
    assert.match(main((await c.get('/argos/account')).text),/Hello Sam/)
    assert.match(main((await c.get('/argos/account/preferences')).text),/name="offers" value="yes" checked/)
    await c.post('/argos/account/register',{first_name:'Second',last_name:'Owner',email:'argos-journeys-second@example.com',password:'SafeTest123!'})
    assert.doesNotMatch(main((await c.get('/argos/account/addresses')).text),/20 Market Street/)
    assert.equal((await c.get(`/argos/checkout/details?address_id=${work}`)).status,404)
    assert.equal(path(await c.post('/argos/checkout/payment',CARD)),'/argos/checkout/details')
  }finally{await srv.close()}
})

test('argos journeys: orders require originating session and account, tracking details match, cancellation updates every estimate',async()=>{
  const srv=await startServer()
  try{
    const c=srv.client(), other=srv.client(), number=await order(c)
    const record=getOrder(number), original=JSON.stringify({items:record.items,payment:record.payment})
    assert.match(main((await c.get('/argos/account/orders')).text),new RegExp(number))
    assert.equal((await c.post('/argos/order/tracking',{order_number:number,email:'wrong@example.com',last_name:'Tester',postcode:'SW1A 1AA'})).status,404)
    assert.equal(path(await c.post('/argos/order/tracking',{order_number:number,email:'tester@example.com',last_name:'Tester',postcode:'sw1a1aa'})),`/argos/orders/${number}`)
    assert.equal((await c.post(`/argos/orders/${number}/action`,{action:'return',reason:'Changed mind'})).status,400)
    await signIn(other)
    assert.equal((await other.get(`/argos/orders/${number}`)).status,404)
    assert.equal((await other.post(`/argos/orders/${number}/action`,{action:'cancel',reason:'No'})).status,404)
    assert.doesNotMatch(main((await other.get('/argos/account/orders')).text),new RegExp(number))
    await c.post('/argos/account/register',{first_name:'Other',last_name:'Member',email:'argos-order-other@example.com',password:'SafeTest123!'})
    assert.equal((await c.get(`/argos/orders/${number}`)).status,404)
    assert.equal((await c.get(`/argos/checkout/confirmation/${number}`)).status,404)
    assert.equal((await c.post(`/argos/orders/${number}/action`,{action:'cancel',reason:'No'})).status,404)
    assert.equal((await c.post('/argos/help/contact',{category:'Orders and returns',subject:'My order',message:'Please help with this order.',email:'other@example.com',order_id:number})).status,400)
    await signIn(c)
    const cancelled=await c.post(`/argos/orders/${number}/action`,{action:'cancel',reason:'Changed my mind'})
    assert.match(main(cancelled.text),/Cancelled/)
    assert.doesNotMatch(main(cancelled.text),/Within 3–5|being prepared|not ready to collect/)
    assert.doesNotMatch(main((await c.get(`/argos/checkout/confirmation/${number}`)).text),/Within 3–5/)
    await c.post(`/argos/orders/${number}/action`,{action:'cancel',reason:'Repeat'})
    assert.equal(record.meta.lifecycle.length,1)
    assert.equal(JSON.stringify({items:record.items,payment:record.payment}),original)
  }finally{await srv.close()}
})

test('argos journeys: eligible delivered fixture can request a return once, guest order remains session-private',async()=>{
  const srv=await startServer()
  try{
    const c=srv.client(), number=await order(c,false), record=getOrder(number)
    const snapshot=JSON.stringify(record.items)
    // Only a trusted test fixture simulates delivery; no customer route can set this status.
    record.meta.lifecycle=[{status:'delivered',created_at:new Date().toISOString()}]
    let r=await c.get(`/argos/orders/${number}`)
    assert.match(main(r.text),/Request a return/)
    assert.equal((await c.post(`/argos/orders/${number}/action`,{action:'cancel',reason:'Cancel'})).status,400)
    r=await c.post(`/argos/orders/${number}/action`,{action:'return',reason:'Item arrived damaged'})
    assert.match(main(r.text),/Return requested/)
    assert.doesNotMatch(main(r.text),/Within 3–5/)
    assert.doesNotMatch(main((await c.get(`/argos/checkout/confirmation/${number}`)).text),/Within 3–5/)
    await c.post(`/argos/orders/${number}/action`,{action:'return',reason:'Again'})
    assert.equal(record.meta.lifecycle.length,2);assert.equal(JSON.stringify(record.items),snapshot)
    const other=srv.client()
    await other.post('/argos/account',{action:'guest',email:'guest@example.com'})
    assert.equal((await other.get(`/argos/orders/${number}`)).status,404)
  }finally{await srv.close()}
})

test('argos journeys: searchable articles, validated owned-order help cases, retained values and case isolation',async()=>{
  const srv=await startServer()
  try{
    const c=srv.client(), other=srv.client(), number=await order(c)
    let r=await c.get('/argos/help?q=collection')
    assert.match(main(r.text),/delivery-collection/)
    assert.match(main((await c.get('/argos/help?q=notanarticle')).text),/No matching articles/)
    for(const id of ['delivery-collection','returns-cancellations','manage-account','payments','product-support','nectar-services']) assert.equal((await c.get(`/argos/help/${id}`)).status,200)
    r=await c.post('/argos/help/contact',{category:'fake',subject:'Saved subject',message:'Help please',email:'tester@example.com'})
    assert.equal(r.status,400);assert.equal(fieldValue(r.text,'subject'),'Saved subject')
    const values={category:'Orders and returns',subject:'Kettle question',message:'Please help with this kettle <script>unsafe()</script>.',email:'tester@example.com',order_id:number}
    r=await c.post('/argos/help/contact',{...values,message:'short'})
    assert.equal(r.status,400);assert.equal(fieldValue(r.text,'subject'),'Kettle question')
    r=await c.post('/argos/help/contact',values)
    const casePath=path(r)
    assert.match(casePath,/\/help\/cases\/case-/);assert.match(main(r.text),/has been received/)
    assert.doesNotMatch(main(r.text),/<script>/);assert.match(main(r.text),/&lt;script&gt;/)
    await signIn(other)
    assert.equal((await other.get(casePath)).status,404)
    assert.equal((await other.post('/argos/help/contact',values)).status,400)
    await c.post('/argos/account/signout')
    assert.equal((await c.get(casePath)).status,404)
    await signIn(c)
    assert.equal((await c.get(casePath)).status,200)
  }finally{await srv.close()}
})

test('argos journeys: contextual store choice and account preference prefill checkout without bypassing bulky eligibility',async()=>{
  const srv=await startServer()
  try{
    const c=srv.client()
    let r=await c.get('/argos/stores?q=Manchester&sku=9901005')
    assert.match(main(r.text),/manchester-city-centre/);assert.doesNotMatch(main(r.text),/london-central/)
    assert.match(main((await c.get('/argos/stores?q=SW1A%201AA')).text),/london-central/)
    assert.match(main((await c.get('/argos/stores?q=no-such-town')).text),/No stores match/)
    assert.match(main((await c.get('/argos/stores?sku=9901004')).text),/home delivery only/)
    await signIn(c)
    await c.post('/argos/account/preferences',{shopping_method:'pickup'})
    await c.post('/argos/stores/manchester-city-centre/select')
    await add(c)
    r=await c.get('/argos/checkout/details')
    assert.match(main(r.text),/value="pickup" checked/)
    assert.match(main(r.text),/<option selected>Manchester City Centre Argos/)
    let review=await c.post('/argos/checkout/details',DETAILS)
    await c.post('/argos/stores/london-central/select')
    assert.equal(path(await c.post('/argos/checkout/payment',{...CARD,review_token:fieldValue(review.text,'review_token')})),'/argos/checkout/details')
    await add(c,'9901004','')
    r=await c.get('/argos/checkout/details')
    assert.doesNotMatch(main(r.text),/value="pickup" checked/)
    assert.equal((await c.post('/argos/checkout/details',{...DETAILS,method:'pickup',collection_point:'London Central Argos'})).status,400)
  }finally{await srv.close()}
})
