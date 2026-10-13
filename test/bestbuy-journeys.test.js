import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer } from './helpers.js'
import { ORDINARY } from '../stores/bestbuy/catalog.js'
import { productPath } from '../stores/bestbuy/data.js'
import { getOrder } from '../lib/orders.js'
const item=family=>ORDINARY.find(p=>p.family===family)
const address={label:'Home',name:'Alex Tester',line1:'123 Ocean Drive',line2:'Suite 4',city:'Miami',state:'FL',postal_code:'33139',phone:'3055550123',is_default:'yes'}
const shipping={firstName:'Alex',lastName:'Tester',addressLine1:'123 Ocean Drive',city:'Miami',state:'FL',postalCode:'33139',useAsBilling:'1'}
const billing={billingFirstName:'Alex',billingLastName:'Tester',billingAddressLine1:'123 Ocean Drive',billingCity:'Miami',billingState:'FL',billingPostalCode:'33139'}
const card={paymentMethod:'card',number:'4242424242424242',expirationDate:'12/29',cvv:'123'}
const signin=(c,email='tester@example.com')=>c.post('/bestbuy/identity/global/signin',{email,password:'Password123!',action:'signin'})
const register=(c,email)=>c.post('/bestbuy/identity/newAccount',{firstName:'Morgan',lastName:'Jones',email,password:'Password123!',phone:'3055550189'})
const active=html=>/<section class="bb-step is-active" id="step-(\w+)"/.exec(html)?.[1]
const addressIds=html=>[...html.matchAll(/data-address-id="([^"]+)"/g)].map(m=>m[1])
async function buy(c,{sku=item('controller').sku,method='shipping',guest=false,email='guest@example.com'}={}) {
 await c.post('/bestbuy/cart/add',{pid:sku,fulfillment:method})
 await c.post('/bestbuy/checkout/r/fast-track')
 if(guest)await c.post('/bestbuy/identity/signin',{action:'guest'})
 await c.post('/bestbuy/checkout/contact',{emailAddress:email,phoneNumber:'3055550123'})
 if(method==='shipping'){
  await c.post('/bestbuy/checkout/shipping-address',shipping)
  await c.post('/bestbuy/checkout/shipping-details',{levelOfService:'standard'})
 }else await c.post('/bestbuy/checkout/pickup',{action:'continue'})
 const done=await c.post('/bestbuy/checkout/payment',{...card,...billing})
 assert.match(done.text,/Thanks for your order!/)
 const all=await c.json('/api/orders?store=bestbuy')
 return {order:all.at(-1),receipt:new URL(done.url).pathname+new URL(done.url).search}
}

test('Best Buy journeys: Save resumes through sign-in/registration, trusted variants, recent and account-scoped saved cart',async()=>{
 const srv=await startServer()
 try{
  const c=srv.client(),d=srv.client(),ssd=item('ssd')
  await c.get(`${productPath('/bestbuy',ssd)}?variant=2tb`)
  assert.match((await c.get('/bestbuy/recent')).text,/Samsung/)
  const gate=await c.get(`/bestbuy/save/${ssd.sku}?variant=2tb`)
  assert.match(gate.url,/identity\/global\/signin/)
  const saved=await signin(c)
  assert.match(saved.url,/account\/saved/)
  assert.match(saved.text,/2 TB/)
  assert.match(saved.text,/\$149\.99/)
  assert.doesNotMatch((await c.get('/bestbuy/recent')).text,/bb-saved-product/,'guest recent stays separate')
  await c.get(productPath('/bestbuy',item('controller')))
  assert.match((await c.get('/bestbuy/recent')).text,/bb-saved-product/)
  await c.post('/bestbuy/recent/clear')
  assert.match((await c.get('/bestbuy/recent')).text,/No recently viewed/)
  await c.post('/bestbuy/cart/add',{pid:ssd.sku,variant:'2tb',fulfillment:'shipping'})
  const cart=await c.get('/bestbuy/cart'),line=/name="line" value="(\d+)"/.exec(cart.text)[1]
  await c.post('/bestbuy/cart/update',{line,action:'save'})
  assert.match((await c.get('/bestbuy/account/saved')).text,/Saved from your cart \(1\)/)
  await signin(d)
  assert.match((await d.get('/bestbuy/account/saved')).text,/No saved products yet/)
  await register(c,'bestbuy-save-switch@example.com')
  assert.match((await c.get('/bestbuy/account/saved')).text,/No saved products yet/)
  assert.match((await c.get('/bestbuy/cart')).text,/Your cart is empty/)
  assert.doesNotMatch((await c.get('/bestbuy/cart')).text,/Move to cart/)
  await signin(c)
  assert.match((await c.get('/bestbuy/account/saved')).text,/Saved from your cart \(1\)/)
  await c.post('/bestbuy/account/saved/remove',{key:`${ssd.sku}:2tb`})
  assert.match((await c.get('/bestbuy/account/saved')).text,/No saved products yet/)
  assert.equal((await c.get(`/bestbuy/save/${ssd.sku}?variant=forged`)).status,404)
  await d.get('/bestbuy/logout')
  await d.get(`/bestbuy/save/${ssd.sku}?variant=1tb`)
  assert.match((await register(d,'bestbuy-save-register@example.com')).url,/account\/saved/)
 }finally{await srv.close()}
})

test('Best Buy journeys: address CRUD, validation/default picker, checkout profile saving and private preferences',async()=>{
 const srv=await startServer()
 try{
  const c=srv.client(),d=srv.client()
  assert.match((await c.get('/bestbuy/account/addresses')).url,/signin/)
  await signin(c)
  const invalid=await c.post('/bestbuy/account/addresses',{...address,postal_code:'bad'})
  assert.equal(invalid.status,400);assert.match(invalid.text,/value="123 Ocean Drive"/)
  let page=await c.post('/bestbuy/account/addresses',address),[first]=addressIds(page.text)
  assert.ok(first)
  page=await c.post('/bestbuy/account/addresses',{...address,label:'Work',line1:'456 Sunset Road',is_default:''})
  const second=addressIds(page.text)[1]
  assert.ok(second)
  await c.post('/bestbuy/account/addresses/action',{id:second,action:'default'})
  page=await c.post('/bestbuy/account/addresses',{...address,id:second,label:'Office',line1:'789 Work Lane',is_default:''})
  assert.match(page.text,/Office · Default/)
  await c.post('/bestbuy/cart/add',{pid:item('controller').sku,fulfillment:'shipping'})
  await c.post('/bestbuy/checkout/r/fast-track')
  page=await c.post('/bestbuy/checkout/contact',{phoneNumber:'3055550123'})
  assert.equal(active(page.text),'address');assert.match(page.text,/value="789 Work Lane"/)
  page=await c.get(`/bestbuy/checkout/c/standard?address_id=${first}`)
  assert.match(page.text,/value="123 Ocean Drive"/)
  assert.equal((await c.get('/bestbuy/checkout/c/standard?address_id=foreign')).status,404)
  await c.post('/bestbuy/checkout/shipping-address',{...shipping,addressLine1:'987 Saved Avenue',saveToProfile:'1',defaultAddress:'1'})
  page=await c.get('/bestbuy/account/addresses');assert.match(page.text,/987 Saved Avenue/)
  await c.post('/bestbuy/account/addresses/action',{id:second,action:'delete'})
  assert.doesNotMatch((await c.get('/bestbuy/account/addresses')).text,/789 Work Lane/)
  await signin(d)
  assert.equal((await d.get(`/bestbuy/account/addresses?edit=${first}`)).status,404)
  assert.equal((await d.post('/bestbuy/account/addresses/action',{id:first,action:'delete'})).status,404)
  assert.match((await c.post('/bestbuy/account/preferences',{deals:'yes',orderUpdates:'yes',fulfillment:'shipping'})).text,/Preferences saved/)
  page=await c.get(productPath('/bestbuy',item('controller')))
  assert.match(page.text,/name="fulfillment" value="shipping" checked/)
  assert.doesNotMatch((await d.get('/bestbuy/account/preferences')).text,/name="deals" value="yes" checked/)
  assert.equal((await c.post('/bestbuy/account/preferences',{fulfillment:'drone'})).status,400)
 }finally{await srv.close()}
})

test('Best Buy journeys: private order history/detail/receipt/actions require originating session and account; lifecycle stays truthful',async()=>{
 const srv=await startServer()
 try{
  const a=srv.client(),b=srv.client()
  await signin(a);await signin(b)
  const {order:o,receipt}=await buy(a)
  assert.match((await a.get('/bestbuy/account/orders')).text,new RegExp(o.order_number))
  assert.doesNotMatch((await b.get('/bestbuy/account')).text,new RegExp(o.order_number))
  for(const url of [receipt,`/bestbuy/account/orders/${o.id}`,`/bestbuy/account/orders/${o.id}/tracking`])assert.equal((await b.get(url)).status,404)
  assert.equal((await b.post(`/bestbuy/account/orders/${o.id}/action`,{action:'cancel',reason:'No longer needed'})).status,404)
  assert.equal((await b.post('/bestbuy/checkout/r/create-account',{order:o.order_number,token:o.meta.token,save:'1',password:'Password123!'})).status,404)
  const track=await a.get(`/bestbuy/account/orders/${o.id}/tracking`)
  assert.match(track.text,/No carrier tracking number/);assert.match(track.text,/Status: <b>processing/)
  assert.equal((await a.post(`/bestbuy/account/orders/${o.id}/action`,{action:'return',reason:'Changed mind'})).status,400)
  const before=structuredClone(o)
  await register(a,'bestbuy-orders-switch@example.com')
  assert.equal((await a.get(receipt)).status,404)
  assert.equal((await a.post(`/bestbuy/account/orders/${o.id}/action`,{action:'cancel',reason:'Changed mind'})).status,404)
  await signin(a)
  assert.equal((await a.post(`/bestbuy/account/orders/${o.id}/action`,{action:'cancel',reason:''})).status,400)
  assert.match((await a.post(`/bestbuy/account/orders/${o.id}/action`,{action:'cancel',reason:'Changed mind'})).text,/Status: <b>cancelled/)
  assert.match((await a.post(`/bestbuy/account/orders/${o.id}/action`,{action:'cancel',reason:'Changed mind'})).text,/already recorded/)
  const cancelled=await a.get(receipt)
  assert.match(cancelled.text,/Order status: <b>cancelled/)
  assert.doesNotMatch(cancelled.text,/Estimated delivery is shown|ready for pickup on Release Date/)
  const saved=getOrder(o.id)
  assert.equal(saved.meta.lifecycle.length,1)
  assert.deepEqual(saved.items,before.items);assert.deepEqual(saved.payment,before.payment)
  // A delivered fixture is test setup only; public routes never advance processing orders.
  const delivered=await buy(a)
  getOrder(delivered.order.id).meta.lifecycle=[{status:'delivered',created_at:new Date().toISOString()}]
  assert.match((await a.post(`/bestbuy/account/orders/${delivered.order.id}/action`,{action:'return',reason:'Does not fit'})).text,/Status: <b>return requested/)
  const expired=await buy(a)
  getOrder(expired.order.id).meta.lifecycle=[{status:'delivered',created_at:new Date(Date.now()-16*86400000).toISOString()}]
  assert.equal((await a.post(`/bestbuy/account/orders/${expired.order.id}/action`,{action:'return',reason:'Changed mind'})).status,400)
  const finalSale=await buy(a,{sku:'6684968'})
  getOrder(finalSale.order.id).meta.lifecycle=[{status:'delivered',created_at:new Date().toISOString()}]
  assert.equal((await a.post(`/bestbuy/account/orders/${finalSale.order.id}/action`,{action:'return',reason:'Changed mind'})).status,400)
 }finally{await srv.close()}
})

test('Best Buy journeys: guest receipt signup is session-bound and claims only that receipt',async()=>{
 const srv=await startServer()
 try{
  const a=srv.client(),b=srv.client(),{order:o,receipt}=await buy(a,{guest:true,email:'bestbuy-receipt@example.com'})
  assert.equal((await b.get(receipt)).status,404)
  const body={order:o.order_number,token:o.meta.token,save:'1',password:'Password123!'}
  assert.equal((await b.post('/bestbuy/checkout/r/create-account',body)).status,404)
  assert.match((await a.post('/bestbuy/checkout/r/create-account',body)).text,/Welcome to the Club/)
  assert.match((await a.get('/bestbuy/account/orders')).text,new RegExp(o.order_number))
  await a.get('/bestbuy/logout')
  assert.equal((await a.get(receipt)).status,404)
  await signin(a,'bestbuy-receipt@example.com')
  const ownReceipt=await a.get(receipt)
  assert.equal(ownReceipt.status,200)
  assert.doesNotMatch(ownReceipt.text,/action="\/bestbuy\/checkout\/r\/create-account"/)
  await signin(b,'bestbuy-receipt@example.com')
  assert.equal((await b.get(receipt)).status,404)
 }finally{await srv.close()}
})

test('Best Buy journeys: direct account switch discards contact, shipping, billing, PayPal and alternate pickup state',async()=>{
 const srv=await startServer()
 try{
  const c=srv.client()
  await signin(c)
  await c.post('/bestbuy/cart/add',{pid:'6684968',fulfillment:'shipping'})
  await c.post('/bestbuy/cart/add',{pid:item('controller').sku,fulfillment:'pickup'})
  await c.post('/bestbuy/checkout/r/fast-track')
  await c.post('/bestbuy/checkout/contact',{phoneNumber:'3055550123'})
  await c.post('/bestbuy/checkout/shipping-address',shipping)
  await c.post('/bestbuy/checkout/shipping-details',{levelOfService:'standard'})
  const person={firstName:'Private',lastName:'Pickup',emailAddress:'privatepickup@example.com',phoneNumber:'3055550139'}
  await c.post('/bestbuy/checkout/pickup',{action:'confirmPerson',...person})
  await c.post('/bestbuy/checkout/pickup',{action:'continue',...person})
  await c.post('/bestbuy/checkout/payment',{...card,...billing,billingAddressLine1:'999 Private Billing',number:'invalid'})
  await c.post('/bestbuy/checkout/payment',{action:'paypal'})
  await register(c,'bestbuy-checkout-switch@example.com')
  let co=await c.get('/bestbuy/checkout/c/standard')
  assert.equal(active(co.text),'contact')
  assert.doesNotMatch(co.text,/123 Ocean Drive|999 Private Billing|privatepickup@example.com|PayPal is your payment method|3055550123/)
  co=await c.post('/bestbuy/checkout/contact',{phoneNumber:'3055550189'})
  assert.equal(active(co.text),'address');assert.doesNotMatch(co.text,/123 Ocean Drive|Private Pickup/)
  await c.post('/bestbuy/checkout/shipping-address',{...shipping,firstName:'Morgan',lastName:'Jones',addressLine1:'222 New Street'})
  await c.post('/bestbuy/checkout/shipping-details',{levelOfService:'standard'})
  co=await c.post('/bestbuy/checkout/pickup',{action:'continue'})
  assert.doesNotMatch(co.text,/Private Pickup|privatepickup@example.com|999 Private Billing/)
  const unsupported=await c.post('/bestbuy/checkout/payment',{...card,paymentMethod:'crypto'})
  assert.equal(unsupported.status,400);assert.match(unsupported.text,/Other payment methods are not supported/)
  const blocked=await c.post('/bestbuy/checkout/payment',{paymentMethod:'paypal'})
  assert.equal(blocked.status,400,'previous owner PayPal selection does not carry over')
 }finally{await srv.close()}
})

test('Best Buy journeys: searchable help and local cases validate topics/owned orders and isolate account/session contents',async()=>{
 const srv=await startServer()
 try{
  const a=srv.client(),b=srv.client();await signin(a);await signin(b)
  assert.match((await a.get('/bestbuy/support?q=pickup')).text,/href="\/bestbuy\/support\/pickup"/)
  assert.match((await a.get('/bestbuy/support?q=unfindable-help-term')).text,/No help topics matched/)
  for(const topic of ['orders','pickup','shipping','returns','account','payment','membership'])assert.equal((await a.get(`/bestbuy/support/${topic}`)).status,200)
  const {order:o}=await buy(a)
  const body={category:'orders',email:'tester@example.com',subject:'Private case subject',message:'Please review this local order request.',order_id:o.id}
  const invalid=await a.post('/bestbuy/contact-us',{...body,message:'short'})
  assert.equal(invalid.status,400);assert.match(invalid.text,/value="Private case subject"/)
  assert.equal((await b.post('/bestbuy/contact-us',body)).status,400)
  const done=await a.post('/bestbuy/contact-us',body)
  assert.match(done.text,/Status: <b>received/)
  assert.match(done.text,/No outbound message was sent/)
  const path=new URL(done.url).pathname
  assert.equal((await b.get(path)).status,404)
  await register(a,'bestbuy-case-switch@example.com')
  assert.equal((await a.get(path)).status,404)
  assert.equal((await a.post('/bestbuy/contact-us',body)).status,400)
  assert.equal((await a.post('/bestbuy/contact-us',{...body,category:'invented',order_id:''})).status,400)
  await signin(a)
  assert.match((await a.get('/bestbuy/support/cases')).text,/Private case subject/)
 }finally{await srv.close()}
})

test('Best Buy journeys: trusted location/ZIP affect PDP, search, cart, current stock and recorded pickup store',async()=>{
 const srv=await startServer()
 try{
  const c=srv.client(),d=srv.client(),micro=item('microwave'),controller=item('controller')
  assert.equal((await c.post('/bestbuy/stores/select',{store_id:'forged',name:'Invented Store'})).status,400)
  assert.match((await c.get('/bestbuy/site/store-locator?q=Burbank')).text,/Best Buy Burbank/)
  await c.post('/bestbuy/cart/add',{pid:micro.sku,fulfillment:'pickup'})
  const switchResult=await c.post('/bestbuy/stores/select',{store_id:'burbank'})
  assert.match(switchResult.text,/this quantity or fulfillment option is unavailable/)
  const pdp=await c.get(productPath('/bestbuy',micro))
  assert.match(pdp.text,/Pickup at Burbank/);assert.match(pdp.text,/name="fulfillment" value="pickup" disabled/)
  assert.doesNotMatch((await c.get('/bestbuy/site/searchpage.jsp?category=Microwaves&fulfillment=pickup')).text,new RegExp(`data-sku="${micro.sku}"`))
  assert.equal((await c.get('/bestbuy/checkout/r/fast-track')).status,400)
  assert.equal((await c.post('/bestbuy/cart/add',{pid:micro.sku,fulfillment:'pickup'})).status,400)
  const cart=await c.get('/bestbuy/cart'),line=/name="line" value="(\d+)"/.exec(cart.text)[1]
  await c.post('/bestbuy/cart/update',{line,action:'remove'})
  assert.equal((await c.post('/bestbuy/stores/zip',{postal_code:'abc'})).status,400)
  await c.post('/bestbuy/stores/zip',{postal_code:'33139'})
  assert.match((await c.get(productPath('/bestbuy',controller))).text,/FREE shipping to 33139/)
  assert.match((await d.get('/bestbuy/')).text,/Your Store: <b>Compton/)
  await signin(c)
  const {order:o,receipt}=await buy(c,{method:'pickup'})
  assert.equal(o.fulfillment.store_location,'Burbank')
  assert.equal(o.meta.pickup_store_id,'burbank')
  assert.deepEqual(o.meta.items_fulfillment,[{sku:controller.sku,fulfillment:'pickup'}])
  await c.post('/bestbuy/stores/select',{store_id:'culver-city'})
  assert.match((await c.get(receipt)).text,/processing at <b>Burbank/,'receipt uses ordered location, not current browse location')
  assert.equal((await c.post('/bestbuy/cart/add',{pid:item('laptop').sku,qty:'2',fulfillment:'pickup'})).status,400)
 }finally{await srv.close()}
})
