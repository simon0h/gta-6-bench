import test from 'node:test'
import assert from 'node:assert/strict'
import {startServer,fieldValue} from './helpers.js'
import {getOrder} from '../lib/orders.js'
import {byId} from '../stores/jb-hifi/data.js'
const B='/jb-hifi'
const path=r=>new URL(r.url).pathname+new URL(r.url).search
const details={email:'tester@example.com',delivery_method:'delivery',country:'AU',first_name:'Alex',last_name:'Tester',address1:'1 George St',suburb:'Sydney',state:'NSW',postcode:'2000',phone:'0412 345 678'}
const card={payment_method:'card',card_number:'4242 4242 4242 4242',card_expiry:'12/29',card_cvv:'123',card_name:'Alex Tester',billing:'same'}
const address={label:'Home',name:'Alex Tester',phone:'0412 345 678',line1:'55 Journey St',line2:'Unit 2',city:'Sydney',state:'NSW',postal_code:'2000',is_default:'yes'}
const login=c=>c.post(B+'/account/login',{email:'tester@example.com',password:'Password123!'})
let registered=0
const register=(c,email=`second${++registered}@example.com`)=>c.post(B+'/account/register',{email,password:'Password123!',first_name:'Second',last_name:'Shopper',phone:'0412 345 678'})
async function review(c){await c.post(B+'/cart/add',{id:'991104'});const info=await c.get(B+'/checkout'),shipping=await c.post(path(info),details);return c.post(path(shipping),{shipping_method:'standard'})}
async function buy(c){const p=await review(c),done=await c.post(path(p),{...card,review_token:fieldValue(p.text,'review_token')});assert.equal(done.status,200);const orders=await c.json('/api/orders?store=jb-hifi');return {o:orders.at(-1),done,p}}

test('jb journeys: registration resumes exact-option wishlist; profile preferences and saved data remain account scoped',async()=>{
 const srv=await startServer();try{
  const c=srv.client();await c.get(B+'/products/sandisk-portable-usb-c-ssd?variant=2tb')
  const gate=await c.get(B+'/wishlist/add?id=991117&variant=2tb');assert.match(gate.text,/one step away/)
  const bad=await c.post(B+'/account/register',{email:'bad',password:'secret123',first_name:'Jamie',last_name:''});assert.equal(bad.status,400);assert.match(bad.text,/value="Jamie"/);assert.doesNotMatch(bad.text,/secret123/)
  const resumed=await register(c,'first@example.com');assert.equal(path(resumed),B+'/wishlist');assert.match(resumed.text,/2TB/);assert.doesNotMatch(resumed.text,/1TB/)
  await c.post(B+'/account/profile',{first_name:'Jamie',last_name:'Changed',phone:'0412 345 678',offers:'yes'})
  await c.get(B+'/account/logout');await login(c);assert.match((await c.get(B+'/wishlist')).text,/wishlist is empty/);assert.doesNotMatch((await c.get(B+'/account/profile')).text,/value="Jamie"/)
  await c.post(B+'/account/login',{email:'first@example.com',password:'Password123!'});assert.match((await c.get(B+'/account/profile')).text,/value="Jamie"/);assert.match((await c.get(B+'/account/profile')).text,/name="offers" value="yes" checked/)
  await c.post(B+'/wishlist/remove',{line_key:'991117:2tb'});assert.match((await c.get(B+'/wishlist')).text,/wishlist is empty/)
  assert.equal((await c.get(B+'/wishlist/add?id=991117&variant=forged')).status,404)
  const escaped=await c.post(B+'/account/login',{email:'first@example.com',password:'Password123!',return_to:'/jb-hifi/../amazon/account'});assert.equal(path(escaped),B+'/account')
  assert.equal((await c.post(B+'/account/login',new URLSearchParams([['email','first@example.com'],['password','Password123!'],['password','Password123!']]))).status,401)
 }finally{await srv.close()}
})

test('jb journeys: AU address CRUD/default and checkout selection reject forged owners and stale payment',async()=>{
 const srv=await startServer();try{
  const c=srv.client();assert.match(path(await c.get(B+'/account/addresses')),/account\/login/);await login(c)
  const invalid=await c.post(B+'/account/addresses',{...address,postal_code:'3000'});assert.equal(invalid.status,400);assert.match(invalid.text,/55 Journey St/)
  let result=await c.post(B+'/account/addresses',address);const id=/name="id" value="(address-[^"]+)"/.exec(result.text)[1]
  await c.post(B+'/account/addresses',{...address,label:'Office',line1:'2 Work St',is_default:''});result=await c.get(B+'/account/addresses');const ids=[...result.text.matchAll(/name="id" value="(address-[^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,2)
  await c.post(B+'/account/addresses',{...address,id,line1:'56 Journey St'});assert.match((await c.get(B+'/account/addresses?edit='+id)).text,/value="56 Journey St"/)
  await c.post(B+'/account/addresses/action',{id:ids[1],action:'default'})
  await c.post(B+'/cart/add',{id:'991104'});let info=await c.get(B+'/checkout');assert.match(info.text,/value="2 Work St"/)
  assert.match(info.text,/<form id="jb-saved-address-form" method="get"/);assert.match(info.text,/<select form="jb-saved-address-form" id="address_id"/);assert.ok(info.text.indexOf('jb-saved-address-picker')>info.text.indexOf('<h2>Shipping address</h2>'),'owned picker is inside delivery address panel with an independent form')
  info=await c.get(path(info)+'?address_id='+id);assert.match(info.text,/value="56 Journey St"/)
  const shipping=await c.post(path(info).split('?')[0],{...details,address1:'77 Checkout St',save_info:'1'}),pay=await c.post(path(shipping),{shipping_method:'standard'}),token=fieldValue(pay.text,'review_token')
  await c.get(path(info).split('?')[0]+'?address_id='+ids[1]);assert.doesNotMatch((await c.post(path(pay),{...card,review_token:token})).text,/Thank you/)
  assert.equal((await c.get(path(info).split('?')[0]+'?address_id=address-forged')).status,400);assert.match((await c.get(B+'/account/addresses')).text,/77 Checkout St/)
  await c.post(B+'/account/addresses/action',{id:ids[1],action:'delete'});assert.match((await c.get(B+'/account/addresses')).text,/Home · Default/)
  await register(c);assert.doesNotMatch((await c.get(B+'/account/addresses')).text,/56 Journey St/);assert.equal((await c.post(B+'/account/addresses',{...address,id})).status,400);assert.equal((await c.post(B+'/account/addresses/action',{id,action:'delete'})).status,404)
 }finally{await srv.close()}
})

test('jb journeys: exact saved lines and recent options restore only when stock is valid',async()=>{
 const srv=await startServer();try{
  const c=srv.client();await login(c)
  await c.get(B+'/products/sandisk-portable-usb-c-ssd?variant=1tb');await c.get(B+'/products/sandisk-portable-usb-c-ssd?variant=2tb');const recent=await c.get(B+'/recently-viewed');assert.match(recent.text,/variant=1tb/);assert.match(recent.text,/variant=2tb/)
  await c.post(B+'/cart/add',{id:'991117',variant:'1tb'});await c.post(B+'/cart/add',{id:'991117',variant:'2tb',qty:'2'})
  await c.post(B+'/cart/save',{line_key:'991117:2tb'});let cart=await c.get(B+'/cart');assert.match(cart.text,/Saved for later/);assert.match(cart.text,/name="qty" value="2"/)
  const p=byId('991117'),v=p.variants.find(v=>v.id==='2tb'),stock=v.stock;v.stock=0
  try{const failed=await c.post(B+'/saved-items/restore',{line_key:'991117:2tb'});assert.equal(failed.status,409);assert.match(failed.text,/Currently unavailable/)}finally{v.stock=stock}
  await c.post(B+'/saved-items/restore',{line_key:'991117:2tb'});cart=await c.get(B+'/cart');assert.match(cart.text,/\$477\.00/);assert.match(cart.text,/no items saved for later/)
  await c.post(B+'/cart/save',{line_key:'991117:2tb'});await register(c);assert.match((await c.get(B+'/cart')).text,/no items saved for later/);assert.doesNotMatch((await c.get(B+'/recently-viewed')).text,/variant=2tb/)
 }finally{await srv.close()}
})

test('jb journeys: order detail/history/tracking/receipt/actions and linked cases require session plus account ownership',async()=>{
 const srv=await startServer();try{
  const c=srv.client();await login(c);const {o,done}=await buy(c),detail=B+'/account/orders/'+o.order_number
  assert.match((await c.get(detail)).text,/Status: Processing/);assert.doesNotMatch((await c.get(detail)).text,/Pre-order confirmed/)
  assert.equal((await c.post(detail+'/action',{action:'return',reason:'Changed my mind'})).status,400)
  const foreign=srv.client();await login(foreign);assert.doesNotMatch((await foreign.get(B+'/account')).text,new RegExp(o.order_number));assert.equal((await foreign.get(detail)).status,404)
  assert.equal((await foreign.post(B+'/account/orders',{order_number:o.order_number,email:o.customer.email})).status,404);assert.equal((await foreign.post(detail+'/action',{action:'cancel',reason:'Cancel please'})).status,404)
  await register(c);for(const url of [detail,path(done)])assert.equal((await c.get(url)).status,404)
  assert.equal((await c.post(B+'/account/orders',{order_number:o.order_number,email:o.customer.email})).status,404)
  assert.equal((await c.post(B+'/help/contact',{category:'orders',subject:'Question',message:'Please check this order.',email:'second@example.com',order_id:o.order_number})).status,400)
  await c.get(B+'/account/logout');assert.equal((await c.post(B+'/account/orders',{order_number:o.order_number,phone:o.customer.phone})).status,404)
  await login(c);assert.equal(path(await c.post(B+'/account/orders',{order_number:o.order_number,phone:'+61 412 345 678'})),detail)
  const cancelled=await c.post(detail+'/action',{action:'cancel',reason:'Ordered the wrong item'});assert.match(cancelled.text,/Status: Cancelled/);assert.doesNotMatch(cancelled.text,/Your order is being processed/)
  assert.match((await c.get(path(done))).text,/is cancelled/);assert.doesNotMatch((await c.get(path(done))).text,/send you an email and SMS|shipping and delivery updates/)
  await c.post(detail+'/action',{action:'cancel',reason:'Duplicate click'});const orders=await c.json('/api/orders?store=jb-hifi');assert.equal(orders.at(-1).meta.lifecycle.length,1);assert.equal(orders.at(-1).items[0].kind,'other')
 }finally{await srv.close()}
})

test('jb journeys: guest lookup is session-bound; searchable help cases and preferred store have real state',async()=>{
 const srv=await startServer();try{
  const c=srv.client(),{o}=await buy(c)
  assert.equal((await c.post(B+'/account/orders',{order_number:o.order_number,email:o.customer.email})).status,200)
  assert.equal((await srv.client().post(B+'/account/orders',{order_number:o.order_number,email:o.customer.email})).status,404)
  assert.match((await c.get(B+'/help?q=address')).text,/Update saved addresses/);assert.match((await c.get(B+'/help?q=noresultzz')).text,/0 help results/)
  const bad=await c.post(B+'/help/contact',{category:'wrong',email:'bad',subject:'Keep this',message:'short'});assert.equal(bad.status,400);assert.match(bad.text,/value="Keep this"/)
  const done=await c.post(B+'/help/contact',{category:'orders',email:'guest@example.com',subject:'Delivery question',message:'Please confirm my delivery options.',order_id:o.order_number});assert.match(done.text,/Request received/);assert.match(done.text,/No email has been sent/)
  assert.equal((await srv.client().get(path(done))).status,404);await login(c);assert.equal((await c.get(path(done))).status,404);await c.get(B+'/account/logout');assert.equal((await c.get(path(done))).status,200)
  await c.post(B+'/stores/select',{store_id:'sydney-city'});assert.match((await c.get(B+'/stores/sydney-city')).text,/Your preferred store/)
  await login(c);await c.post(B+'/stores/select',{store_id:'brisbane-city'});await c.post(B+'/cart/add',{id:'991104'});const info=await c.get(B+'/checkout');assert.match(info.text,/value="brisbane-city" checked/)
 }finally{await srv.close()}
})

test('jb journeys: duplicate checkout scalar fields cannot place orders',async()=>{
 const srv=await startServer();try{
  const c=srv.client();await c.post(B+'/cart/add',{id:'991104'});const info=await c.get(B+'/checkout'),duplicateInfo=new URLSearchParams(details);duplicateInfo.append('delivery_method','pickup');assert.equal((await c.post(path(info),duplicateInfo)).status,400)
  const ship=await c.post(path(info),details),duplicateShip=new URLSearchParams({shipping_method:'standard'});duplicateShip.append('shipping_method','express');assert.equal((await c.post(path(ship),duplicateShip)).status,400)
  const pay=await c.post(path(ship),{shipping_method:'standard'}),duplicatePay=new URLSearchParams(card);duplicatePay.append('card_number','4242');assert.equal((await c.post(path(pay),duplicatePay)).status,400);assert.equal((await c.json('/api/orders?store=jb-hifi')).length,0)
 }finally{await srv.close()}
})


test('jb journeys: delivered fixture alone permits a return request without rewriting payment',async()=>{
 const srv=await startServer();try{
  const c=srv.client(),{o,done}=await buy(c),trusted=getOrder(o.id),payment=JSON.stringify(trusted.payment)
  trusted.meta.lifecycle=[{status:'delivered',created_at:new Date().toISOString()}]
  const detail=B+'/account/orders/'+o.order_number
  assert.match((await c.get(detail)).text,/Request a return/)
  const result=await c.post(detail+'/action',{action:'return',reason:'The item arrived damaged'})
  assert.match(result.text,/Status: Return requested/);assert.doesNotMatch(result.text,/being processed|Cancel order/)
  assert.equal(JSON.stringify(trusted.payment),payment);assert.equal(trusted.meta.lifecycle.at(-1).status,'return_requested');assert.match((await c.get(path(done))).text,/Return requested/);assert.doesNotMatch((await c.get(path(done))).text,/being processed|shipping and delivery updates/)
 }finally{await srv.close()}
})
