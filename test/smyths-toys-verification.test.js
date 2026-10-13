import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer, fieldValue } from './helpers.js'
import { browseProducts, resolveProduct } from '../stores/smyths-toys/browse.js'

const B='/smyths-toys/uk/en-gb'
const DETAILS={first_name:'Alex',last_name:'Tester',email:'verify46@example.com',phone:'07700 900123',line1:'10 Test Street',city:'London',postal_code:'E6 1AA',country:'GB',delivery_option:'standard'}
const CARD={payment_method:'card',card_number:'4242424242424242',expiry:'12/39',cvv:'123',name_on_card:'Alex Tester',billing_same:'1'}
const params=(data,key,entries)=>{const result=new URLSearchParams(data);result.delete(key);for(const [name,value] of entries)result.append(name,value);return result}
async function ready(c,sku='261023') {
 await c.post(B+'/cart/add',{sku,qty:'1'})
 await c.post(B+'/checkout',{action:'guest',email:DETAILS.email})
 await c.post(B+'/checkout/method',{method:'ship'})
 await c.post(B+'/checkout/details',DETAILS)
}

test('smyths verification: malformed and duplicate scalar fields fail without coercion, leaks or side effects',async()=>{
 const srv=await startServer()
 try{
  const c=srv.client()
  for(const password of [[['password[toString]','x']],[['password[]','Password123!']],[['password','Password123!'],['password','ignored']]]) {
   const r=await c.post(B+'/login',params({email:'tester@example.com'},'password',password))
   assert.equal(r.status,401);assert.doesNotMatch(r.text,/Password123!/)
  }
  for(const sku of ['261023','263307'])for(const qty of [[['qty[toString]','x']],[['qty[]','1']],[['qty','1'],['qty','1']]]) {
   assert.equal((await c.post(B+'/cart/add',params({sku},'qty',qty))).status,400)
  }
  for(const data of [
   'sku=261001&qty=1&option_Box=Small+box&option_Box=Large+box',
   'sku=261001&qty=1&option_Box%5B%5D=Large+box',
   'sku=261023&sku=263307&qty=1',
   'sku=263307&option_Forged=x&qty%5BtoString%5D=x',
  ])assert.equal((await c.post(B+'/cart/add',new URLSearchParams(data))).status,400)
  assert.match((await c.get(B+'/cart')).text,/Your basket is empty/)
  await ready(c)
  assert.equal((await c.post(B+'/checkout',params({action:'signin',email:'tester@example.com'},'password',[['password[toString]','x']]))).status,401)
  for(const qty of [[['qty-261023:base[toString]','x']],[['qty-261023:base[]','2']],[['qty-261023:base','2'],['qty-261023:base','2']]]){
   assert.equal((await c.post(B+'/cart/update',params({sku:'261023',key:'261023:base',action:'update'},'qty',qty))).status,400)
  }
  for(const key of ['first_name','phone','postal_code','delivery_option']){
   const r=await c.post(B+'/checkout/details',params(DETAILS,key,[[key,DETAILS[key]],[key,DETAILS[key]]]))
   assert.equal(r.status,400);assert.match(r.text,/value="10 Test Street"/)
  }
  assert.equal((await c.post(B+'/checkout/method',{method:'__proto__'})).status,400)
  await c.post(B+'/checkout/details',DETAILS)
  for(const [key,entries] of [
   ['card_number',[['card_number[toString]','private-marker']]],
   ['card_number',[['card_number','42424242'],['card_number','42424242']]],
   ['card_number',[['card_number[]',CARD.card_number]]],
   ['cvv',[['cvv[toString]','private-marker']]],
   ['cvv',[['cvv[]','123']]],
   ['payment_method',[['payment_method','card'],['payment_method','paypal']]],
   ['expiry',[['expiry','12/39'],['expiry','12/39']]],
  ]) {
   const r=await c.post(B+'/checkout/payment',params(CARD,key,entries))
   assert.equal(r.status,400);assert.match(r.text,/value="Alex Tester"/)
   assert.doesNotMatch(r.text,/4242424242424242|private-marker|value="123"/)
   assert.match((await c.get(B+'/checkout/review')).url,/checkout\/payment$/)
  }
  assert.deepEqual(await c.json('/api/orders?store=smyths-toys'),[])
  const review=await c.post(B+'/checkout/payment',CARD)
  assert.match(review.text,/Visa ending 4242/)
 }finally{await srv.close()}
})

test('smyths verification: old review, trusted price change and replay cannot place unintended orders; cancellation has no active ETA',async()=>{
 const srv=await startServer(),bottle=browseProducts.find(p=>p.sku==='261023'),price=bottle.unit_price
 try{
  const c=srv.client()
  await ready(c)
  const first=await c.post(B+'/checkout/payment',CARD),old=fieldValue(first.text,'token')
  const second=await c.post(B+'/checkout/payment',{payment_method:'paypal',billing_same:'1'}),current=fieldValue(second.text,'token')
  assert.notEqual(old,current)
  assert.equal((await c.post(B+'/checkout/place-order',{token:old,terms:'1'})).status,400)
  assert.deepEqual(await c.json('/api/orders?store=smyths-toys'),[])
  bottle.unit_price=price+1
  assert.equal((await c.post(B+'/checkout/place-order',{token:current,terms:'1'})).status,400)
  assert.deepEqual(await c.json('/api/orders?store=smyths-toys'),[])
  bottle.unit_price=price
  await c.post(B+'/cart/update',{sku:'261023',key:'261023:base',action:'remove'})
  await ready(c,'263307')
  const review=await c.post(B+'/checkout/payment',CARD),token=fieldValue(review.text,'token')
  const done=await c.post(B+'/checkout/place-order',{token,terms:'1'})
  const order=/data-order-number>(ST\d+)/.exec(done.text)[1]
  await c.post(B+'/checkout/place-order',{token,terms:'1'})
  assert.equal((await c.json('/api/orders?store=smyths-toys')).length,1)
  assert.equal((await c.post(B+`/orders/${order}/cancel`,new URLSearchParams('reason=first&reason=second'))).status,400)
  const cancelled=await c.post(B+`/orders/${order}/cancel`,{reason:'Verification cancellation'})
  assert.match(cancelled.text,/No dispatch or collection is scheduled/)
  assert.doesNotMatch(cancelled.text,/will be charged|Awaiting processing|Pre-order availability|12 November 2026|2–7 days/)
  assert.match((await c.get(B+`/checkout/confirmation?order=${order}`)).text,/No dispatch or collection is scheduled/)
 }finally{bottle.unit_price=price;await srv.close()}
})

test('smyths verification: every ordinary family is purchasable with trusted options or has an enforced stock state',async()=>{
 const srv=await startServer()
 try{
  assert.equal(browseProducts.length,498)
  assert.equal(new Set(browseProducts.slice(0,36).map(p=>p.family)).size,36)
  for(const p of browseProducts){
   const c=srv.client(),variant=p.variants.find(v=>v.stock>0),options=variant?.options||{},selected=resolveProduct(p,options)
   const input={sku:p.sku,qty:'1',unit_price:'0.01',kind:'game',...Object.fromEntries(Object.entries(options).map(([k,v])=>[`option_${k}`,v]))}
   const added=await c.post(B+'/cart/add',input)
   if(!selected?.stock){assert.equal(added.status,400,p.title);assert.match((await c.get(B+'/cart')).text,/Your basket is empty/);continue}
   assert.equal(added.status,200,p.title)
   await c.post(B+'/checkout',{action:'guest',email:DETAILS.email})
   const method=selected.deliveryStock?'ship':'pickup',store_id=Object.entries(selected.collectionStock).find(([,n])=>n>0)?.[0]
   assert.equal((await c.post(B+'/checkout/method',{method,store_id:store_id||''})).status,200,p.title)
   await c.post(B+'/checkout/details',DETAILS)
   const review=await c.post(B+'/checkout/payment',{payment_method:'paypal',billing_same:'1'})
   const done=await c.post(B+'/checkout/place-order',{token:fieldValue(review.text,'token'),terms:'1'})
   assert.match(done.text,/Thank you for your order/,p.title)
   assert.doesNotMatch(done.text,/Download code in a box|Playable from 19 November|Pre-authorisation occurs/,p.title)
   const order=(await c.json('/api/orders?store=smyths-toys')).find(o=>o.session_id && o.items[0].sku===p.sku)
   assert.ok(order,p.title);assert.equal(order.items[0].kind,'other');assert.equal(order.items[0].unit_price,selected.unit_price)
   assert.deepEqual(order.meta.options[0].options,options)
   assert.equal(order.totals.shipping,method==='ship'&&selected.unit_price<20?2.99:0)
   assert.equal(order.meta.availability_date,undefined)
  }
 }finally{await srv.close()}
})
