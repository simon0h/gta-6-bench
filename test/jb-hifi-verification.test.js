import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer, fieldValue } from './helpers.js'
import { byId, PRODUCTS } from '../stores/jb-hifi/data.js'
import { getOrder } from '../lib/orders.js'

const B='/jb-hifi'
const path=r=>new URL(r.url).pathname+new URL(r.url).search
const details={email:'tester@example.com',delivery_method:'delivery',country:'AU',first_name:'Alex',last_name:'Verifier',address1:'1 George St',suburb:'Sydney',state:'NSW',postcode:'2000',phone:'0412 345 678'}
const card={payment_method:'card',card_number:'4242 4242 4242 4242',card_expiry:'12/29',card_cvv:'123',card_name:'Alex Verifier',billing:'same'}
async function review(c){await c.post(B+'/cart/add',{id:'991104'});const info=await c.get(B+'/checkout');const shipping=await c.post(path(info),details);return c.post(path(shipping),{shipping_method:'standard'})}

// Optional fields must not disappear through scalar sanitization and change intent.
test('jb verification: repeated optional cart fields and unknown billing choices reject without mutation',async()=>{
 const srv=await startServer();try{
  const c=srv.client()
  for(const field of ['variant','return']){
   const body=new URLSearchParams({id:'991104'});body.append(field,'');body.append(field,'forged')
   assert.equal((await c.post(B+'/cart/add',body)).status,400,field)
  }
  for(const variant of [null,{},['','forged']]){
   const rejected=await fetch(srv.base+B+'/cart/add',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({id:'991104',variant})})
   assert.equal(rejected.status,400)
  }
  assert.match((await c.get(B+'/cart')).text,/Your cart is empty/)
  const payment=await review(c)
  const duplicateAction=new URLSearchParams({id:'991104',qty:'2'});duplicateAction.append('action','remove');duplicateAction.append('action','update')
  assert.equal((await c.post(B+'/cart/update',duplicateAction)).status,400)
  for(const billing of ['__proto__','constructor','forged'])assert.equal((await c.post(path(payment),{...card,billing,review_token:fieldValue(payment.text,'review_token')})).status,400,billing)
  const duplicate=new URLSearchParams(card);duplicate.append('billing_company','first');duplicate.append('billing_company','second')
  assert.equal((await c.post(path(payment),duplicate)).status,400)
  assert.equal((await c.json('/api/orders?store=jb-hifi')).length,0)
 }finally{await srv.close()}
})

test('jb verification: foreign store and conflicting account metadata cannot expose or alter an order',async()=>{
 const srv=await startServer();try{
  const c=srv.client();await c.post(B+'/account/login',{email:'tester@example.com',password:'Password123!'})
  const pay=await review(c),done=await c.post(path(pay),{...card,review_token:fieldValue(pay.text,'review_token')}),[order]=await c.json('/api/orders?store=jb-hifi'),trusted=getOrder(order.id)
  const detail=B+'/account/orders/'+order.order_number
  for(const change of [{store:'eb-games-au'},{meta:{...trusted.meta,account_id:'different-account'}}]){
   const original={store:trusted.store,meta:trusted.meta};Object.assign(trusted,change)
   try{
    for(const route of [detail,path(done)])assert.equal((await c.get(route)).status,404)
    for(const route of [B+'/account',B+'/account/orders'])assert.doesNotMatch((await c.get(route)).text,new RegExp(order.order_number))
    assert.equal((await c.post(B+'/account/orders',{order_number:order.order_number,phone:details.phone})).status,404)
    assert.equal((await c.post(detail+'/action',{action:'cancel',reason:'Forbidden cancellation'})).status,404)
    assert.equal((await c.post(B+'/help/contact',{category:'orders',email:details.email,subject:'Order question',message:'Check this order please.',order_id:order.order_number})).status,400)
    assert.equal(trusted.meta.lifecycle,undefined)
   }finally{Object.assign(trusted,original)}
  }
  assert.equal((await c.get(detail)).status,200)
 }finally{await srv.close()}
})

test('jb verification: delivery mutations without following redirects reject old-token and tokenless reviews',async()=>{
 const srv=await startServer();try{
  for(const tokenless of [false,true]){
   const c=srv.client(),pay=await review(c),token=fieldValue(pay.text,'review_token'),info=path(pay).replace(/payment$/,'information'),shipping=path(pay).replace(/payment$/,'shipping')
   assert.equal((await c.post(info,{...details,address1:'22 Changed St'},{follow:false})).status,302)
   assert.equal((await c.post(shipping,{shipping_method:'express'},{follow:false})).status,302)
   const stale=await c.post(path(pay),{...card,...(tokenless?{}:{review_token:token})})
   assert.equal(stale.status,409);assert.match(stale.text,/22 Changed St/);assert.match(stale.text,/value="Alex Verifier"/);assert.doesNotMatch(stale.text,/value="4242 4242|value="123"/)
   assert.equal((await c.json('/api/orders?store=jb-hifi')).length,0)
   const done=await c.post(path(pay),{...card,review_token:fieldValue(stale.text,'review_token')})
   assert.match(done.text,/Thank you/);const orders=await c.json('/api/orders?store=jb-hifi');const order=orders.at(-1)
   assert.equal(order.shipping_address.line1,'22 Changed St');assert.equal(order.fulfillment.option,'express');assert.equal(order.items[0].kind,'other');assert.equal(order.currency,'AUD')
   assert.doesNotMatch(JSON.stringify(order),/4242 4242|card_cvv|card_number|card_expiry/)
   await c.post(path(pay),card);assert.equal((await c.json('/api/orders?store=jb-hifi')).length,orders.length)
   srv.reset()
  }
 }finally{await srv.close()}
})

test('jb verification: cart restore, price and pickup eligibility are rechecked after review',async()=>{
 const srv=await startServer();try{
  const c=srv.client();let pay=await review(c),token=fieldValue(pay.text,'review_token')
  await c.post(B+'/cart/save',{line_key:'991104'});await c.post(B+'/saved-items/restore',{line_key:'991104'})
  assert.equal((await c.post(path(pay),{...card,review_token:token})).status,409)
  pay=await c.get(path(pay));const price=byId('991104').price;byId('991104').price=price+3
  try{assert.equal((await c.post(path(pay),card)).status,409)}finally{byId('991104').price=price}
  const info=path(pay).replace(/payment$/,'information')
  pay=await c.post(info,{email:details.email,delivery_method:'pickup',store_id:'sydney-city',pickup_first_name:'Alex',pickup_last_name:'Verifier',pickup_phone:details.phone})
  await c.post(B+'/cart/add',{id:'903005'});const forbidden=await c.post(path(pay),{...card,review_token:fieldValue(pay.text,'review_token')})
  assert.equal(forbidden.status,409);assert.match(forbidden.text,/online-only item cannot be collected/)
  assert.equal((await c.json('/api/orders?store=jb-hifi')).length,0)
  assert.equal(PRODUCTS.length,500);assert.equal(PRODUCTS.slice(0,46).filter(p=>p.kind==='other').length,44);assert.equal(PRODUCTS.slice(0,46).filter(p=>p.kind==='other'&&p.orderable&&p.stock>0).length,42)
 }finally{await srv.close()}
})
