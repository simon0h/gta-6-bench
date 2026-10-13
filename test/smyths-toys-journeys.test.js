import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer, fieldValue } from './helpers.js'
import { browseProducts } from '../stores/smyths-toys/browse.js'
import { getOrder } from '../lib/orders.js'

const B='/smyths-toys/uk/en-gb'
const ACCOUNT={email:'tester@example.com',password:'Password123!'}
const ADDRESS={name:'Alex Tester',label:'Home',phone:'07700 900123',line1:'10 Test Street',city:'London',postal_code:'GIR 0AA'}
const DETAILS={first_name:'Alex',last_name:'Tester',email:'tester@example.com',phone:'07700 900123',line1:'10 Test Street',city:'London',postal_code:'GIR 0AA',country:'GB',delivery_option:'standard'}
const PAY={payment_method:'paypal',billing_same:'1'}
const addressIds=html=>[...html.matchAll(/name="id" type="hidden" value="(address-[^"]+)"/g)].map(m=>m[1]).filter((v,i,a)=>a.indexOf(v)===i)
async function purchase(c,{guest=false,sku='261023'}={}) {
 await c.post(B+'/cart/add',{sku,qty:'1'})
 if(guest)await c.post(B+'/checkout',{action:'guest',email:DETAILS.email})
 else await c.get(B+'/checkout')
 await c.post(B+'/checkout/method',{method:'ship'})
 await c.post(B+'/checkout/details',DETAILS)
 const review=await c.post(B+'/checkout/payment',PAY)
 assert.match(review.text,/Review &amp; place order/)
 const done=await c.post(B+'/checkout/place-order',{terms:'1',token:fieldValue(review.text,'token')})
 assert.equal(done.status,200)
 return /data-order-number>(ST\d+)/.exec(done.text)[1]
}

test('smyths journeys: resumed account registration, safe redirects, address CRUD/default picker and account isolation',async()=>{
 const srv=await startServer()
 try{
  const c=srv.client(),stranger=srv.client()
  assert.match((await c.get(B+'/my-account/addresses')).url,/login\?next=%2Fmy-account%2Faddresses/)
  const bad=await c.post(B+'/register',{first_name:'Ada',last_name:'',email:'invalid',password:'DoNotEchoMe123',next:'/my-account/addresses'})
  assert.equal(bad.status,400);assert.match(bad.text,/value="Ada"/);assert.doesNotMatch(bad.text,/DoNotEchoMe123/)
  const registered=await c.post(B+'/register',{first_name:'Ada',last_name:'Reader',email:'ada39@example.com',password:'Password123!',next:'/my-account/addresses'})
  assert.match(registered.text,/<h1>Address book/)
  assert.equal((await c.post(B+'/my-account/addresses',{...ADDRESS,postal_code:'12345'})).status,400)
  let r=await c.post(B+'/my-account/addresses',ADDRESS),[first]=addressIds(r.text)
  assert.ok(first);assert.match(r.text,/GIR 0AA/)
  r=await c.post(B+'/my-account/addresses',{...ADDRESS,label:'Office',line1:'12 Office Road',postal_code:'SW1A 2AA'})
  const second=addressIds(r.text).find(x=>x!==first);assert.ok(second)
  await c.post(B+'/my-account/addresses/default',{id:second})
  r=await c.post(B+'/my-account/addresses',{...ADDRESS,id:second,label:'Office',line1:'14 Office Road',postal_code:'SW1A 2AA'})
  assert.match(r.text,/Office — Default/)
  await c.post(B+'/cart/add',{sku:'261023',qty:'1'});await c.get(B+'/checkout');await c.post(B+'/checkout/method',{method:'ship'})
  r=await c.get(B+'/checkout/details');assert.match(r.text,/value="14 Office Road"/)
  r=await c.get(B+'/checkout/details?address_id='+first);assert.match(r.text,/value="10 Test Street"/)
  assert.equal((await c.get(B+'/checkout/details?address_id=address-forged')).status,404)
  assert.equal((await c.post(B+'/my-account/addresses',{...ADDRESS,id:'address-forged'})).status,400)
  await c.post(B+'/my-account/addresses/delete',{id:second});assert.match((await c.get(B+'/my-account/addresses')).text,/Home — Default/)
  await c.post(B+'/my-account/profile',{first_name:'Ada',last_name:'Updated',phone:'07700 900123'})
  await c.post(B+'/my-account/preferences',{news:'yes',interest:'Baby Room'})
  assert.equal((await c.post(B+'/my-account/preferences',{interest:'Forged'})).status,400)
  await c.post(B+'/login',{...ACCOUNT,next:'//evil.example/path'})
  assert.match((await c.get(B+'/my-account')).url,/\/my-account$/)
  assert.doesNotMatch((await c.get(B+'/my-account/addresses')).text,/10 Test Street/)
  assert.equal((await c.post(B+'/my-account/addresses/delete',{id:first})).status,404)
  await c.post(B+'/login',{email:'ada39@example.com',password:'Password123!',next:'/my-account/profile'})
  assert.match((await c.get(B+'/my-account/profile')).text,/value="Updated"/)
  assert.match((await c.get(B+'/my-account/preferences')).text,/value="yes" checked/)
  await stranger.post(B+'/login',{email:'ada39@example.com',password:'Password123!'})
  assert.doesNotMatch((await stranger.get(B+'/my-account/addresses')).text,/10 Test Street/)
  await c.post(B+'/logout',{});assert.match((await c.get(B+'/my-account')).url,/login/)
 }finally{await srv.close()}
})

test('smyths journeys: options survive wishlist and saved basket restore with stock and owner checks',async()=>{
 const srv=await startServer(),p=browseProducts.find(p=>p.sku==='261001'),stock=p.variants[1].stock
 try{
  const c=srv.client(),stranger=srv.client()
  await c.get(B+'/catalog/261001?option_Box=Large+box')
  assert.match((await c.get(B+'/recently-viewed')).text,/LEGO Classic/)
  assert.equal((await c.post(B+'/wishlist/save',{sku:'261001'})).status,400)
  assert.equal((await c.post(B+'/wishlist/save',{sku:'261001',option_Box:'Large box',option_Forged:'x'})).status,400)
  let r=await c.post(B+'/wishlist/save',{sku:'261001',option_Box:'Large box',unit_price:'.01'})
  assert.match(r.text,/Box: Large box/);assert.match(r.text,/£39\.99/)
  assert.doesNotMatch((await stranger.get(B+'/wishlist')).text,/Box: Large box/)
  await c.post(B+'/cart/add',{sku:'261001',qty:'2',option_Box:'Large box'})
  r=await c.post(B+'/saved-for-later/save',{key:'261001:large'})
  assert.match(r.text,/Quantity 2/);assert.match((await c.get(B+'/cart')).text,/Your basket is empty/)
  p.variants[1].stock=0
  assert.equal((await c.post(B+'/saved-for-later/restore',{key:'261001:large'})).status,400)
  assert.match((await c.get(B+'/saved-for-later')).text,/Quantity 2/)
  p.variants[1].stock=stock
  await c.post(B+'/cart/add',{sku:'261001',qty:'2',option_Box:'Large box'})
  assert.equal((await c.post(B+'/saved-for-later/restore',{key:'261001:large'})).status,400,'aggregate option stock')
  await c.post(B+'/cart/update',{sku:'261001',key:'261001:large',action:'remove'})
  r=await c.post(B+'/saved-for-later/restore',{key:'261001:large',qty:'99',option_Box:'Small box',unit_price:'.01'})
  assert.match(r.text,/Box: Large box/);assert.match(r.text,/£79\.98/)
  assert.doesNotMatch((await c.get(B+'/saved-for-later')).text,/Quantity 2/)
  assert.equal((await stranger.post(B+'/saved-for-later/restore',{key:'261001:large'})).status,404)
  await c.post(B+'/login',ACCOUNT);assert.doesNotMatch((await c.get(B+'/wishlist')).text,/Box: Large box/)
  await c.post(B+'/logout',{});assert.match((await c.get(B+'/wishlist')).text,/Box: Large box/)
  await c.post(B+'/recently-viewed',{});assert.doesNotMatch((await c.get(B+'/recently-viewed')).text,/LEGO Classic/)
 }finally{p.variants[1].stock=stock;await srv.close()}
})

test('smyths journeys: guest/member orders require session and identity, actions are eligible and idempotent',async()=>{
 const srv=await startServer()
 try{
  const c=srv.client(),other=srv.client()
  const guest=await purchase(c,{guest:true})
  assert.equal((await other.post(B+'/guest-lookup',{email:DETAILS.email,order_number:guest})).status,404)
  assert.equal((await c.post(B+'/guest-lookup',{email:'wrong@example.com',order_number:guest})).status,404)
  assert.equal((await c.post(B+'/guest-lookup',{email:DETAILS.email,order_number:guest})).status,200)
  assert.equal((await c.post(B+`/orders/${guest}/return`,{reason:'Not wanted'})).status,400)
  await c.post(B+'/login',ACCOUNT)
  assert.equal((await c.get(B+`/orders/${guest}`)).status,404)
  const member=await purchase(c)
  assert.match((await c.get(B+'/my-account/orders')).text,new RegExp(member))
  await other.post(B+'/login',ACCOUNT)
  for(const path of [`/orders/${member}`,`/my-account/orders/${member}`,`/checkout/confirmation?order=${member}`,`/contact-us?order=${member}`])assert.equal((await other.get(B+path)).status,404,path)
  assert.equal((await other.post(B+`/orders/${member}/cancel`,{reason:'Forged'})).status,404)
  await c.post(B+'/register',{first_name:'Other',last_name:'Owner',email:'other39@example.com',password:'Password123!'})
  assert.equal((await c.get(B+`/checkout/confirmation?order=${member}`)).status,404)
  assert.equal((await c.get(B+`/orders/${member}`)).status,404)
  assert.doesNotMatch((await c.get(B+'/my-account/orders')).text,new RegExp(member))
  await c.post(B+'/login',ACCOUNT)
  assert.equal((await c.post(B+`/orders/${member}/cancel`,{reason:''})).status,400)
  let r=await c.post(B+`/orders/${member}/cancel`,{reason:'Ordered by mistake'})
  assert.match(r.text,/This order is cancelled/);assert.doesNotMatch(r.text,/Awaiting processing|No tracking number|ready-for-collection notice/)
  await c.post(B+`/orders/${member}/cancel`,{reason:'Again'})
  assert.equal(getOrder(member).meta.lifecycle.length,1)
  r=await c.get(B+`/checkout/confirmation?order=${member}`);assert.match(r.text,/This order is cancelled/)
  assert.equal((await c.post(B+`/orders/${member}/return`,{reason:'No longer wanted'})).status,400)
  const delivered=await purchase(c)
  getOrder(delivered).meta.lifecycle=[{status:'delivered',reason:'Test-only delivery event'}]
  r=await c.get(B+`/orders/${delivered}`);assert.match(r.text,/Request a postal return review/)
  await c.post(B+`/orders/${delivered}/return`,{reason:'Unopened item'})
  await c.post(B+`/orders/${delivered}/return`,{reason:'Again'})
  assert.equal(getOrder(delivered).meta.lifecycle.length,2)
  assert.equal(getOrder(delivered).meta.lifecycle[1].status,'return_requested')
 }finally{await srv.close()}
})

test('smyths journeys: searchable help and order-linked cases retain values and deny account/session leaks',async()=>{
 const srv=await startServer()
 try{
  const c=srv.client(),other=srv.client()
  assert.match((await c.get(B+'/help?q=refund')).text,/Returns &amp; refunds|Returns & refunds/)
  assert.match((await c.get(B+'/help?q=not-a-topic')).text,/No help topics found/)
  assert.equal((await c.get(B+'/help/forged')).status,404)
  await c.post(B+'/login',ACCOUNT);const order=await purchase(c)
  const input={name:'Alex Tester',email:DETAILS.email,confirm_email:DETAILS.email,category:'Delivery',order_id:order,subject:'Where is my order?',message:'Please check the delivery details.'}
  let r=await c.post(B+'/contact-us',{...input,confirm_email:'wrong@example.com'});assert.equal(r.status,400);assert.match(r.text,/Where is my order\?/)
  r=await c.post(B+'/contact-us',input);assert.match(r.text,/Enquiry received/)
  const casePath=new URL(r.url).pathname
  assert.equal((await other.get(casePath)).status,404)
  await other.post(B+'/login',ACCOUNT)
  assert.equal((await other.post(B+'/contact-us',input)).status,400)
  assert.equal((await other.get(casePath)).status,404)
  await c.post(B+'/register',{first_name:'Other',last_name:'Owner',email:'case39@example.com',password:'Password123!'})
  assert.equal((await c.get(casePath)).status,404)
  assert.equal((await c.post(B+'/contact-us',input)).status,400)
  assert.doesNotMatch((await c.get(B+'/contact-us/cases')).text,/Where is my order\?/)
  await c.post(B+'/login',ACCOUNT);assert.equal((await c.get(casePath)).status,200)
  assert.equal((await c.post(B+'/contact-us',{...input,category:'Forged'})).status,400)
 }finally{await srv.close()}
})

test('smyths journeys: branch stock is option-aware and selected branch or account changes invalidate reviews',async()=>{
 const srv=await startServer()
 try{
  const c=srv.client()
  let r=await c.get(B+'/store-finder?sku=261006&option_Wheel+size=12+inch')
  assert.match(r.text,/2 available for Click &amp; Collect/);assert.match(r.text,/0 available for Click &amp; Collect/)
  assert.equal((await c.post(B+'/store-finder/select',{store_id:'forged'})).status,400)
  await c.post(B+'/store-finder/select',{store_id:'beckton'})
  await c.post(B+'/cart/add',{sku:'261023',qty:'1'});await c.post(B+'/checkout',{action:'guest',email:DETAILS.email})
  r=await c.get(B+'/checkout/method');assert.match(r.text,/value="beckton" checked/)
  await c.post(B+'/checkout/method',{method:'ship'});await c.post(B+'/checkout/details',DETAILS)
  r=await c.post(B+'/checkout/payment',PAY);const token=fieldValue(r.text,'token')
  await c.post(B+'/store-finder/select',{store_id:'salford'})
  assert.match((await c.post(B+'/checkout/place-order',{token,terms:'1'})).url,/checkout$/)
  assert.deepEqual(await c.json('/api/orders?store=smyths-toys'),[])
  await c.post(B+'/checkout',{action:'guest',email:DETAILS.email});await c.post(B+'/checkout/method',{method:'ship'});await c.post(B+'/checkout/details',DETAILS)
  r=await c.post(B+'/checkout/payment',PAY)
  await c.post(B+'/login',ACCOUNT)
  assert.match((await c.post(B+'/checkout/place-order',{token:fieldValue(r.text,'token'),terms:'1'})).url,/checkout\/method$/)
  assert.deepEqual(await c.json('/api/orders?store=smyths-toys'),[])
  assert.equal((await c.get(B+'/stores/forged')).status,404)
  assert.match((await c.get(B+'/store-finder?q=E6+1AA')).text,/Smyths Toys Beckton/)
 }finally{await srv.close()}
})
