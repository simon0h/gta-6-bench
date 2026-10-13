import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { startEnvironment } from '../benchmark/environment.js'
import { getTask } from '../benchmark/tasks.js'
import { client, fieldValue } from './helpers.js'

const LONDON='GAME London - Sports Direct, Oxford Street'
const PICKUP={pickupFirstName:'Morgan',pickupLastName:'Rivera',pickupEmail:'morgan.rivera@example.com',pickupPhone:'07700900178'}
async function environment(t,family) {
  const original=getTask('game-uk-purchase-ps5')
  const task={...original,id:'game-uk-native-'+family,scenario:{type:family,product_id:'756802',...(family==='cart_recovery'?{alternate_product_id:'400064'}:{})}}
  const directory=await mkdtemp(path.join(tmpdir(),'gta-game-scenario-'))
  const env=await startEnvironment({task,directory})
  t.after(async()=>{await env.close();await rm(directory,{recursive:true,force:true})})
  return {env,task,c:client(env.baseUrl)}
}
async function add(c,pid='756802',qty='1') {return c.post('/game-uk/cart/add',{pid,qty,age_confirmed:'1'})}
async function guest(c,task) {
  return c.post('/game-uk/account/login',{action:'guest',email:task.request.customer.email,returnUrl:'/checkout'})
}
function delivery(task,method='standard') {
  const {customer:p,shipping_address:a}=task.request
  return {firstName:p.first_name,lastName:p.last_name,addressLine1:a.line1,addressLine2:a.line2||'',town:a.city,county:a.state,postcode:a.postal_code,country:'GB',mobile:p.phone,deliveryMethod:method,...(method==='collect'?{collectStore:LONDON,...PICKUP}:{})}
}
async function paymentPage(c,task,method='standard') {
  assert.equal((await guest(c,task)).status,200)
  return c.post('/game-uk/checkout/delivery',delivery(task,method))
}
async function pay(c,task,page,number='4242424242424242') {
  return c.post('/game-uk/checkout/payment',{paymentMethod:'card',review_token:fieldValue(page.text,'review_token'),cardNumber:number,expiry:'12/99',cvv:'123',nameOnCard:task.request.payment.name,billingSame:'1'})
}

for(const family of ['payment_recovery','payment_decline']) test(`GAME ${family}: provider rejection is persistent and valid backup remains usable`,async t=>{
  const {env,task,c}=await environment(t,family)
  await add(c)
  let page=await paymentPage(c,task)
  page=await pay(c,task,page,'123')
  assert.equal(page.status,400)
  assert.deepEqual((await env.snapshot()).scenarioEvents,[])
  page=await pay(c,task,page)
  assert.equal(page.status,402)
  assert.match(page.text,/card was declined/)
  assert.doesNotMatch(page.text,/4242424242424242/)
  page=await c.get('/game-uk/checkout/payment')
  page=await pay(c,task,page)
  assert.equal(page.status,402)
  assert.deepEqual((await env.snapshot()).orders,[])
  if(family==='payment_recovery') {
    page=await pay(c,task,page,'5555555555554444')
    assert.equal(page.status,200)
    assert.match(page.text,/Thank you for your order/)
  }
  const state=await env.snapshot()
  assert.deepEqual(state.errors,[])
  assert.equal(state.orders.length,family==='payment_recovery'?1:0)
  if(state.orders.length) assert.equal(state.orders[0].payment.last4,'4444')
  assert.equal(state.scenarioEvents.filter(e=>e.type==='payment_rejected').length,2)
})

test('GAME availability loss cannot be bypassed by direct checkout, re-adding or a fresh shopper',async t=>{
  const {env,task,c}=await environment(t,'availability_loss')
  await add(c)
  const cart=await c.get('/game-uk/cart')
  assert.match(cart.text,/Shipping unavailable/)
  assert.match(cart.text,/cannot be purchased for shipping or pickup/)
  assert.equal((await guest(c,task)).status,409)
  await c.post('/game-uk/cart/update',{line:'1',action:'remove'})
  assert.equal((await add(c)).status,400)
  assert.equal((await add(client(env.baseUrl))).status,400)
  const state=await env.snapshot()
  assert.equal(state.orders.length,0)
  assert.equal(state.scenarioEvents.filter(e=>e.type==='availability_changed').length,1)
})

for(const family of ['availability_fallback','pickup_required']) test(`GAME ${family}: collection requires verified location and named recipient`,async t=>{
  const {env,task,c}=await environment(t,family)
  await add(c)
  let page=await guest(c,task)
  assert.equal(page.status,200)
  assert.match(page.text,/authored local simulation/)
  if(family==='availability_fallback') {
    assert.match(page.text,/Shipping unavailable/)
    assert.equal((await c.post('/game-uk/checkout/delivery',delivery(task))).status,400)
  }
  page=await c.post('/game-uk/checkout/delivery',{...delivery(task,'collect'),collectStore:'GAME Birmingham - Sports Direct, Bullring'})
  assert.equal(page.status,400)
  assert.match(page.text,/Collection is unavailable at that store/)
  page=await c.post('/game-uk/checkout/delivery',{...delivery(task,'collect'),pickupFirstName:''})
  assert.equal(page.status,400)
  page=await c.post('/game-uk/checkout/delivery',delivery(task,'collect'))
  assert.equal(page.status,200)
  page=await pay(c,task,page)
  assert.equal(page.status,200)
  assert.match(page.text,/Thank you for your order/)
  const state=await env.snapshot()
  assert.deepEqual(state.errors,[])
  assert.equal(state.orders.length,1)
  const order=state.orders[0]
  assert.equal(order.fulfillment.method,'pickup')
  assert.equal(order.shipping_address,null)
  assert.equal(order.meta.pickup_store_id,'oxford-street')
  assert.deepEqual(order.meta.pickup_person,{first_name:'Morgan',last_name:'Rivera',email:'morgan.rivera@example.com',phone:'07700900178'})
  assert.equal(order.meta.benchmark_pickup_simulation,true)
  assert.deepEqual(order.meta.items_fulfillment,[{sku:'756802',fulfillment:'pickup',qty:1}])
})

test('GAME seeded cart mistakes are removable through native controls without re-seeding',async t=>{
  const {env,task,c}=await environment(t,'cart_recovery')
  let page=await c.get('/game-uk/cart')
  assert.match(page.text,/Colour: XBS/)
  await c.post('/game-uk/cart/update',{line:'1',action:'remove'})
  await add(c,'756802','2')
  await c.post('/game-uk/cart/update',{line:'2',action:'dec'})
  page=await paymentPage(c,task)
  assert.equal((await pay(c,task,page)).status,200)
  const state=await env.snapshot()
  assert.equal(state.orders.length,1)
  assert.equal(state.orders[0].items.length,1)
  assert.equal(state.orders[0].items[0].platform,'ps5')
  assert.equal(state.orders[0].items[0].qty,1)
  assert.equal(state.scenarioEvents.filter(e=>e.type==='cart_seeded').length,1)
})
