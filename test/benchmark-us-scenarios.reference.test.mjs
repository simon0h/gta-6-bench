import test from 'node:test'
import assert from 'node:assert/strict'
import {mkdtemp,rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import path from 'node:path'
import {chromium} from 'playwright'
import {startEnvironment} from '../benchmark/environment.js'
import {tasks,publicTask,getTask} from '../benchmark/tasks.js'
import {gradeTask} from '../benchmark/grader.js'
import {runUS} from '../benchmark/baselines-us.js'
import {client,fieldValue} from './helpers.js'
const stores=['amazon','gamestop','target','walmart']
const paths={amazon:{add:'/amazon/cart/add',body:id=>({asin:id,quantity:'1'}),checkout:'/amazon/gp/buy/addressselect'},gamestop:{add:'/gamestop/cart/add',body:id=>({pid:id,qty:'1'}),checkout:'/gamestop/mrt/checkout'},target:{add:'/target/cart/add',body:id=>({tcin:id,qty:'1'}),checkout:'/target/checkout'},walmart:{add:'/walmart/cart/add',body:id=>({pid:id,qty:'1'}),checkout:'/walmart/checkout/review-order'}}
for(const store of stores)test(`${store}: lost availability blocks direct checkout and new-session re-add`,async t=>{
 const task=getTask(`${store}-availability_loss-ps5`),directory=await mkdtemp(path.join(tmpdir(),'gta-us-stock-'))
 const env=await startEnvironment({task,directory});t.after(async()=>{await env.close();await rm(directory,{recursive:true,force:true})})
 const c=client(env.baseUrl),p=paths[store]
 await c.post(p.add,p.body(task.scenario.product_id))
 const blocked=await c.get(p.checkout)
 assert.equal(blocked.status,409)
 assert.match(blocked.text,/Shipping unavailable/)
 assert.equal((await client(env.baseUrl).post(p.add,p.body(task.scenario.product_id))).status,409)
 const state=await env.snapshot()
 assert.deepEqual(state.errors,[])
 assert.deepEqual(state.orders,[])
 assert.equal(state.scenarioEvents.filter(e=>e.type==='availability_changed').length,1)
})

// Saving an instrument is not a purchase attempt. Decline evidence must only
// appear at the order placement boundary, and replaying it cannot clear it.
for(const store of ['amazon','target','walmart'])test(`${store}: provider rejection occurs on placement and persists across replay`,async t=>{
 const task=getTask(`${store}-payment_recovery-ps5`),directory=await mkdtemp(path.join(tmpdir(),'gta-us-payment-'))
 const env=await startEnvironment({task,directory});t.after(async()=>{await env.close();await rm(directory,{recursive:true,force:true})})
 const c=client(env.baseUrl),a={firstName:'Alex',lastName:'Tester',address1:'120 Benchmark Avenue',address2:'',city:'Los Angeles',state:'CA',zip:'90001',phone:'2025550142'}
 await c.post(paths[store].add,paths[store].body(task.scenario.product_id))
 let save,place
 if(store==='amazon') {
  await c.post('/amazon/ax/claim',{email:'tester@example.com'})
  await c.post('/amazon/ap/signin/password',{password:'Password123!'})
  await c.post('/amazon/gp/buy/addressselect',{countryCode:'US',fullName:'Alex Tester',phoneNumber:a.phone,addressLine1:a.address1,city:a.city,state:a.state,postalCode:a.zip})
  save=number=>c.post('/amazon/gp/buy/payselect',{cardNumber:number,nameOnCard:'Alex Tester',expMonth:'12',expYear:'2035'})
  place=()=>c.post('/amazon/gp/buy/spc',{action:'place'})
 }else if(store==='target') {
  await c.post('/target/login',{email:'tester@example.com',password:'Password123!'})
  await c.post('/target/checkout/shipping',a)
  save=number=>c.post('/target/checkout/payment',{paymentType:'card',cardNumber:number,expiry:'12/35',cvv:'123',nameOnCard:'Alex Tester',billingSame:'1'})
  place=()=>c.post('/target/checkout/place-order',{})
 }else {
  await c.post('/walmart/account/login',{identifier:'tester@example.com'})
  await c.post('/walmart/account/signin/withpassword',{password:'Password123!'})
  await c.post('/walmart/checkout/address',a)
  save=number=>c.post('/walmart/checkout/payment',{method:'card',cardNumber:number,expMonth:'12',expYear:'35',cvv:'123',firstName:a.firstName,lastName:a.lastName,phone:a.phone,billingSame:'1'})
  place=async()=>{const review=await c.get('/walmart/checkout/review-order');return c.post('/walmart/checkout/place-order',{review_token:fieldValue(review.text,'review_token')})}
 }
 assert.equal((await save('4242424242424242')).status,200)
 assert.deepEqual((await env.snapshot()).scenarioEvents,[])
 for(let attempt=0;attempt<2;attempt++) {
  const declined=await place()
  assert.equal(declined.status,402)
  assert.match(declined.text,/card was declined/)
  assert.deepEqual((await env.snapshot()).orders,[])
 }
 assert.equal((await save('5555555555554444')).status,200)
 assert.equal((await place()).status,200)
 const state=await env.snapshot()
 assert.deepEqual(state.errors,[])
 assert.equal(state.orders.length,1)
 assert.equal(state.orders[0].payment.last4,'4444')
 assert.equal(state.scenarioEvents.filter(e=>e.type==='payment_rejected').length,2)
 assert.doesNotMatch(JSON.stringify(state),/4242424242424242|5555555555554444/)
})

test('Amazon Buy Now cannot bypass a stock transition with an empty cart',async t=>{
 const task=getTask('amazon-availability_loss-ps5'),directory=await mkdtemp(path.join(tmpdir(),'gta-amazon-buynow-'))
 const env=await startEnvironment({task,directory});t.after(async()=>{await env.close();await rm(directory,{recursive:true,force:true})})
 const c=client(env.baseUrl)
 await c.get(`/amazon/checkout/entry/buynow?ASIN=${task.scenario.product_id}&quantity=1`)
 const blocked=await c.get('/amazon/gp/buy/addressselect')
 assert.equal(blocked.status,409)
 assert.match(blocked.text,/Shipping unavailable/)
 assert.deepEqual((await env.snapshot()).orders,[])
})

test('Amazon unrelated Buy Now payment cannot create rejection evidence for a target left in the cart',async t=>{
 const task=getTask('amazon-payment_decline-ps5'),directory=await mkdtemp(path.join(tmpdir(),'gta-amazon-unrelated-payment-'))
 const env=await startEnvironment({task,directory});t.after(async()=>{await env.close();await rm(directory,{recursive:true,force:true})})
 const c=client(env.baseUrl),unrelated='B0H6K49W6Y'
 await c.post('/amazon/cart/add',{asin:task.scenario.product_id,quantity:'1'})
 await c.get(`/amazon/checkout/entry/buynow?ASIN=${unrelated}&quantity=1`)
 await c.post('/amazon/ax/claim',{email:'tester@example.com'})
 await c.post('/amazon/ap/signin/password',{password:'Password123!'})
 await c.post('/amazon/gp/buy/addressselect',{countryCode:'US',fullName:'Alex Tester',phoneNumber:'2025550142',addressLine1:'120 Benchmark Avenue',city:'Los Angeles',state:'CA',postalCode:'90001'})
 await c.post('/amazon/gp/buy/payselect',{cardNumber:'4242424242424242',nameOnCard:'Alex Tester',expMonth:'12',expYear:'2035'})
 assert.equal((await c.post('/amazon/gp/buy/spc',{action:'place'})).status,200)
 const state=await env.snapshot()
 assert.deepEqual(state.errors,[])
 assert.equal(state.orders.length,1)
 assert.equal(state.orders[0].items[0].sku,unrelated)
 assert.deepEqual(state.scenarioEvents,[])
})

for(const correctCart of [false,true])test(`Amazon Buy Now cart recovery requires removal of seeded merchandise: ${correctCart?'corrected':'untouched'}`,async t=>{
 const task=getTask('amazon-cart_recovery-ps5'),directory=await mkdtemp(path.join(tmpdir(),'gta-amazon-cart-recovery-'))
 const env=await startEnvironment({task,directory});t.after(async()=>{await env.close();await rm(directory,{recursive:true,force:true})})
 const c=client(env.baseUrl),r=task.request,a=r.shipping_address,p=r.payment,customer=r.customer
 await c.get('/amazon/cart')
 if(correctCart)await c.post('/amazon/cart/update',{asin:task.scenario.alternate_product_id,action:'delete'})
 await c.get(`/amazon/checkout/entry/buynow?ASIN=${task.scenario.product_id}&quantity=1`)
 await c.post('/amazon/ax/claim',{email:customer.email})
 await c.post('/amazon/ap/register',{customerName:`${customer.first_name} ${customer.last_name}`,email:customer.email,password:r.account.password,passwordCheck:r.account.password})
 await c.post('/amazon/gp/buy/addressselect',{countryCode:a.country,fullName:`${customer.first_name} ${customer.last_name}`,phoneNumber:customer.phone,addressLine1:a.line1,addressLine2:a.line2||'',city:a.city,state:a.state,postalCode:a.postal_code})
 const [month,year]=p.expiry.split('/')
 await c.post('/amazon/gp/buy/payselect',{cardNumber:p.number,nameOnCard:p.name,expMonth:month,expYear:`20${year}`})
 assert.equal((await c.post('/amazon/gp/buy/spc',{action:'place'})).status,200)
 const state=await env.snapshot()
 assert.deepEqual(state.errors,[])
 assert.equal(state.orders.length,1)
 assert.equal(state.orders[0].items[0].sku,task.scenario.product_id)
 assert.equal(state.scenarioEvents.filter(event=>event.type==='cart_seeded').length,1)
 assert.equal(state.scenarioEvents.filter(event=>event.type==='cart_corrected').length,correctCart?1:0)
 const grade=gradeTask(task,{...state,finalResponse:{outcome:'purchased',message:'Purchased the requested item using Buy Now.'}})
 if(correctCart)assert.equal(grade.status,'passed',JSON.stringify(grade.reasons))
 else {
  assert.equal(grade.status,'failed')
  assert.ok(grade.reasons.some(reason=>reason.code==='missing_scenario_event'&&reason.message.includes('cart_corrected')),JSON.stringify(grade.reasons))
 }
})

test('US native reference journeys complete every applicable obstacle through rendered forms',{skip:process.env.RUN_BROWSER_TESTS!=='1',timeout:1_200_000},async t=>{
 const directory=await mkdtemp(path.join(tmpdir(),'gta-us-browser-')),browser=await chromium.launch({headless:true})
 try {
  const selected=tasks.filter(task=>stores.includes(task.store)&&task.scenario&&(!process.env.US_SCENARIO_FILTER||task.id.includes(process.env.US_SCENARIO_FILTER)))
  assert.ok(selected.length)
  for(const task of selected)await t.test(task.id,{timeout:60_000},async()=>{
   const env=await startEnvironment({task,directory:path.join(directory,task.id)}),context=await browser.newContext()
   try {
    const page=await context.newPage(),actions=[],requests=[]
    page.setDefaultTimeout(8_000)
    page.on('request',req=>requests.push(new URL(req.url()).pathname))
    await page.goto(env.startUrl)
    const finalResponse=await runUS({task:publicTask(task),page,recordAction:async action=>actions.push(action)})
    const state=await env.snapshot(true)
    assert.deepEqual(state.errors,[])
    assert.equal(requests.some(p=>p.startsWith('/api/')),false)
    const grade=gradeTask(task,{orders:state.orders,scenarioEvents:state.scenarioEvents,finalResponse})
    assert.equal(grade.status,'passed',JSON.stringify(grade.reasons))
    if(task.family.startsWith('payment_')) {
     const declined=actions.findIndex(a=>a.type==='payment_declined')
     assert.ok(declined>actions.findIndex(a=>a.type==='payment'))
     assert.equal(actions.filter(a=>a.type==='payment').length,task.request.backup_payment?2:1)
     if(task.request.backup_payment)assert.ok(actions.findLastIndex(a=>a.type==='payment')>declined)
    }
   }finally{await context.close();await env.close()}
  })
 }finally{await browser.close();await rm(directory,{recursive:true,force:true})}
})
