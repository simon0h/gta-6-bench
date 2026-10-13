import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer, fieldValue } from './helpers.js'
import { products } from '../stores/williams-sonoma/catalog.js'
import { getOrder } from '../lib/orders.js'

const base='/williams-sonoma'
const login=c=>c.post(base+'/account',{email:'tester@example.com',password:'Password123!'})
const buyer={email:'verification@example.com',first_name:'Alex',last_name:'Cook',address:'18 Kitchen Lane',city:'Austin',state:'TX',postal_code:'78701',card_name:'Alex Cook',card_number:'4242424242424242',card_expiry:'12/39',card_cvv:'123'}
const pathOf=r=>new URL(r.url).pathname
async function registry(c){await login(c);return pathOf(await c.post(base+'/account/registries',{name:'Verification kitchen',event:'Housewarming',notes:'Private owner note'}))}

test('Williams Sonoma registry validation escapes rejected quantities and leaves saved selections unchanged',async()=>{
 const srv=await startServer()
 try{
  const c=srv.client(),path=await registry(c)
  let r=await c.post(path+'/items',{product:'skillet',option_Finish:'Brushed steel',qty:'2',notes:'Original private note'})
  const item=r.text.match(/data-registry-item="([^"]+)"/)[1]
  const payload='<img src=x onerror="alert(1)">'
  r=await c.post(path+'/items/'+item,{qty:payload,notes:'Retain my corrected note'})
  assert.equal(r.status,400)
  assert.doesNotMatch(r.text,/<img src=x/)
  assert.match(r.text,/Desired quantity: &lt;img src=x onerror=&quot;alert\(1\)&quot;&gt;/)
  assert.match(r.text,/>Retain my corrected note<\/textarea>/)
  r=await c.get(path)
  assert.match(r.text,/Desired quantity: 2/)
  assert.match(r.text,/Original private note/)
  assert.doesNotMatch(r.text,/Retain my corrected note/)
  const malformed=new URLSearchParams([['product','skillet'],['qty','1'],['option_Finish','Stainless steel'],['option_Finish','Brushed steel']])
  assert.equal((await c.post(path+'/items',malformed)).status,400)
  assert.equal(((await c.get(path)).text.match(/data-registry-item=/g)||[]).length,1)
  const preview=await c.get(path+'/preview')
  assert.match(preview.text,/Desired quantity: 2/)
  assert.doesNotMatch(preview.text,/Original private note|Private owner note|tester@example.com/)
 }finally{await srv.close()}
})

test('Williams Sonoma registry selections use current trusted prices and stock; checkout revalidates without partial purchase',async()=>{
 const srv=await startServer(),p=products.find(p=>p.id==='skillet'),variant=p.variants.find(v=>v.options.Finish==='Brushed steel'),saved={price:variant.price,stock:variant.stock}
 try{
  const c=srv.client(),path=await registry(c)
  await c.post(path+'/items',{product:p.id,option_Finish:'Brushed steel',qty:'10',notes:'Quantity is a plan'})
  await c.post(base+'/cart/add',{id:p.id,option_Finish:'Brushed steel',qty:'2'})
  let review=await c.get(base+'/checkout')
  variant.price=67.49
  assert.match((await c.get(path+'/preview')).text,/\$67\.49 each/)
  let rejected=await c.post(base+'/checkout',{...buyer,checkout_token:fieldValue(review.text,'checkout_token')})
  assert.equal(rejected.status,409)
  assert.equal(fieldValue(rejected.text,'email'),buyer.email)
  assert.equal(fieldValue(rejected.text,'card_number'),'')
  assert.equal(fieldValue(rejected.text,'card_cvv'),'')
  assert.match((await c.get(base+'/account/orders')).text,/No orders here yet/)
  variant.stock=0
  assert.match((await c.get(path+'/preview')).text,/Currently unavailable/)
  const second=pathOf(await c.post(base+'/account/registries',{name:'Second kitchen',event:'Wedding'}))
  assert.equal((await c.post(second+'/items',{product:p.id,option_Finish:'Brushed steel',qty:'1'})).status,400)
  assert.doesNotMatch((await c.get(second)).text,/data-registry-item=/)
  assert.equal((await c.post(base+'/cart/add',{id:p.id,option_Finish:'Brushed steel',qty:'1'})).status,400)
  rejected=await c.post(base+'/checkout',buyer)
  assert.equal(rejected.status,400)
  assert.match((await c.get(base+'/account/orders')).text,/No orders here yet/)
  variant.stock=saved.stock
  review=await c.get(base+'/checkout')
  const receipt=await c.post(base+'/checkout',{...buyer,checkout_token:fieldValue(review.text,'checkout_token')})
  assert.equal(receipt.status,200)
  const order=getOrder(pathOf(receipt).split('/').at(-1))
  assert.equal(order.items[0].qty,2)
  assert.equal(order.items[0].unit_price,67.49)
  assert.equal(order.totals.total,134.98)
  assert.equal(order.items[0].kind,'other')
  assert.equal(order.totals.shipping,0);assert.equal(order.totals.tax,0)
  const snapshot=JSON.stringify({items:order.items,options:order.meta.options,payment:order.payment,totals:order.totals})
  variant.price=saved.price
  const details=await c.get(base+'/account/orders/'+order.id)
  assert.match(details.text,/\$67\.49 each/)
  await c.post(base+'/account/orders/'+order.id+'/action',{action:'cancel',reason:'Verification complete'})
  assert.equal(JSON.stringify({items:order.items,options:order.meta.options,payment:order.payment,totals:order.totals}),snapshot)
 }finally{Object.assign(variant,saved);await srv.close()}
})
