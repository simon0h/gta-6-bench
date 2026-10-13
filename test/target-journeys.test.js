import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer, fieldValue } from './helpers.js'
import { ORDINARY_PRODUCTS } from '../stores/target/catalog.js'
import { productPath } from '../stores/target/data.js'
import { getOrder } from '../lib/orders.js'

const ADDRESS={firstName:'Alex',lastName:'Tester',address1:'123 Ocean Dr',address2:'Apt 4',zip:'33139',city:'Miami',state:'FL',phone:'3055550123'}
const SAVED={label:'Beach home',name:'Alex Tester',line1:'123 Ocean Dr',line2:'Apt 4',postal_code:'33139',city:'Miami',state:'FL',phone:'3055550123',is_default:'yes'}
const CARD={paymentType:'card',cardNumber:'4242424242424242',expiry:'12/29',cvv:'123',nameOnCard:'Alex Tester',billingSame:'1'}
const item=family=>ORDINARY_PRODUCTS.find(p=>p.family===family)
const signin=(c,email='tester@example.com',redirect='/target/account')=>c.post('/target/login',{email,password:'Password123!',redirect})
const addressIds=html=>[...new Set([...html.matchAll(/name="id" value="(address-[a-f0-9]+)"/g)].map(m=>m[1]))]
async function createOther(c){return c.post('/target/account/create',{email:'other@example.com',firstName:'Other',lastName:'Shopper',password:'Password123!'})}
async function purchase(c,{tcin='1011529119',variant}={}){
  await signin(c);await c.post('/target/cart/add',{tcin,...(variant?{variant}:{})});await c.post('/target/checkout/shipping',ADDRESS);await c.post('/target/checkout/payment',CARD)
  const confirmation=await c.post('/target/checkout/place-order')
  assert.equal(confirmation.status,200);assert.match(confirmation.text,/Thanks for your order/)
  const orderId=/data-order-number>(\d+)</.exec(confirmation.text)[1]
  return {orderId,confirmation,order:getOrder(orderId)}
}

test('target journeys: exact options persist in list and recent history; transfers validate stock and remain isolated',async()=>{
  const srv=await startServer()
  try{
    const c=srv.client(),other=srv.client(),p=item('coffee'),a=p.variants[0],b=p.variants[1]
    const gate=await c.post('/target/list/add',{tcin:p.tcin,variant:b.id});assert.match(gate.url,/\/login\?/);assert.match(gate.text,/variant/)
    await signin(c)
    await c.get(productPath('/target',p)+'?variant='+b.id)
    await c.post('/target/list/add',{tcin:p.tcin,variant:b.id,price:0.01})
    await c.post('/target/list/add',{tcin:p.tcin,variant:b.id})
    await c.post('/target/list/add',{tcin:p.tcin,variant:a.id})
    const list=await c.get('/target/lists')
    assert.equal((list.text.match(/data-list-key=/g)||[]).length,2)
    assert.match(list.text,/24 oz/);assert.match(list.text,/12 oz/);assert.match(list.text,/\$13.99/)
    assert.match((await c.get('/target/recent')).text,/24 oz/)
    assert.equal((await c.post('/target/list/add',{tcin:p.tcin,variant:'forged'})).status,400)
    assert.equal((await c.post('/target/cart/from-list',{tcin:p.tcin,variant:'forged'})).status,400)
    const cart=await c.post('/target/cart/from-list',{tcin:p.tcin,variant:b.id,unit_price:0.01})
    assert.match(cart.text,/24 oz/);assert.match(cart.text,/\$13.99/)
    await signin(other)
    assert.doesNotMatch((await other.get('/target/lists')).text,/data-list-key=/)
    assert.equal((await other.post('/target/cart/from-list',{tcin:p.tcin,variant:b.id})).status,400)
    await createOther(other);await signin(c,'other@example.com')
    assert.doesNotMatch((await c.get('/target/lists')).text,/data-list-key=/)
    assert.doesNotMatch((await c.get('/target/recent')).text,/data-list-key=/)
    await signin(c)
    await c.post('/target/list/remove',{tcin:p.tcin,variant:b.id})
    assert.doesNotMatch((await c.get('/target/lists')).text,/24 oz/)
    assert.match((await c.get('/target/lists')).text,/12 oz/)
    await c.post('/target/recent/clear')
    assert.doesNotMatch((await c.get('/target/recent')).text,/data-list-key=/)
    const noStock=item('speaker');await c.post('/target/list/add',{tcin:noStock.tcin})
    assert.equal((await c.post('/target/cart/from-list',{tcin:noStock.tcin})).status,400)
    assert.match((await c.get('/target/lists')).text,/Out of stock/)
  }finally{await srv.close()}
})

test('target journeys: address CRUD, default choice and checkout picker validate ownership and clear payment',async()=>{
  const srv=await startServer()
  try{
    const c=srv.client(),other=srv.client()
    await signin(c)
    const bad=await c.post('/target/account/addresses',{...SAVED,state:'XX',postal_code:'bad'})
    assert.equal(bad.status,400);assert.match(bad.text,/value="123 Ocean Dr"/)
    const saved=await c.post('/target/account/addresses',SAVED),[first]=addressIds(saved.text)
    assert.ok(first)
    const second=await c.post('/target/account/addresses',{...SAVED,label:'Office',line1:'456 Market St',is_default:''})
    const secondId=addressIds(second.text).find(id=>id!==first)
    assert.ok(secondId)
    await c.post('/target/account/addresses',{...SAVED,id:secondId,label:'Work',line1:'789 Market St',is_default:''})
    await c.post('/target/account/addresses/default',{id:secondId})
    await c.post('/target/cart/add',{tcin:item('mug').tcin})
    const shipping=await c.get('/target/checkout/shipping')
    assert.match(shipping.text,/value="789 Market St"/);assert.match(shipping.text,/Choose a saved address/)
    assert.equal(fieldValue(shipping.text,'address_id'),secondId)
    await c.post('/target/checkout/shipping',{...ADDRESS,address1:'789 Market St',address_id:secondId})
    await c.post('/target/checkout/payment',CARD)
    const changed=await c.get('/target/checkout/shipping?address_id='+first)
    assert.match(changed.text,/value="123 Ocean Dr"/)
    assert.match((await c.get('/target/checkout/review')).url,/\/shipping$/)
    await c.post('/target/checkout/shipping',{...ADDRESS,address_id:first})
    assert.match((await c.get('/target/checkout/review')).url,/\/payment$/)
    await signin(other);await other.post('/target/cart/add',{tcin:item('mug').tcin})
    assert.doesNotMatch((await other.get('/target/account/addresses')).text,/123 Ocean Dr|789 Market St/)
    for(const path of ['/target/account/addresses/delete','/target/account/addresses/default'])assert.equal((await other.post(path,{id:first})).status,404)
    assert.equal((await other.get('/target/checkout/shipping?address_id='+first)).status,404)
    assert.equal((await other.post('/target/checkout/shipping',{...ADDRESS,address_id:first})).status,404)
    await c.post('/target/account/addresses/delete',{id:secondId})
    assert.match((await c.get('/target/account/addresses')).text,/Beach home · Default/)
    await c.post('/target/account/addresses/delete',{id:first})
    assert.doesNotMatch((await c.get('/target/account/addresses')).text,/123 Ocean Dr|789 Market St/)
    await c.post('/target/checkout/shipping',{...ADDRESS,defaultAddress:'1'})
    assert.match((await c.get('/target/account/addresses')).text,/123 Ocean Dr/)
  }finally{await srv.close()}
})

test('target journeys: private orders require the original session and recorded account, including confirmation token',async()=>{
  const srv=await startServer()
  try{
    const c=srv.client(),sameEmail=srv.client(),other=srv.client(),{orderId,confirmation}=await purchase(c)
    const confirmPath=new URL(confirmation.url).pathname+new URL(confirmation.url).search
    await signin(sameEmail)
    assert.doesNotMatch((await sameEmail.get('/target/orders')).text,new RegExp(orderId))
    for(const path of ['/target/orders/'+orderId,'/target/orders/'+orderId+'/tracking',confirmPath])assert.equal((await sameEmail.get(path)).status,404,path)
    assert.equal((await sameEmail.post('/target/orders/'+orderId+'/cancel',{reason:'Not mine'})).status,404)
    assert.equal((await c.get(confirmPath.replace(/token=[a-f0-9]+/,'token=forged'))).status,404)
    await createOther(other);await signin(c,'other@example.com')
    for(const path of ['/target/orders/'+orderId,confirmPath])assert.equal((await c.get(path)).status,404)
    assert.doesNotMatch((await c.get('/target/account')).text,new RegExp(orderId))
    assert.equal((await c.post('/target/orders/'+orderId+'/cancel',{reason:'Wrong account'})).status,404)
    await signin(c)
    assert.equal((await c.get(confirmPath)).status,200)
    assert.match((await c.get('/target/orders')).text,new RegExp(orderId))
    await c.get('/target/logout')
    assert.equal((await c.get(confirmPath)).status,404)
  }finally{await srv.close()}
})

test('target journeys: tracking is honest, cancellation is idempotent, and returns require delivery',async()=>{
  const srv=await startServer()
  try{
    const c=srv.client(),{orderId,confirmation,order}=await purchase(c)
    const before=JSON.parse(JSON.stringify({items:order.items,payment:order.payment,options:order.meta.options,totals:order.totals}))
    const tracking=await c.get('/target/orders/'+orderId+'/tracking')
    assert.match(tracking.text,/Processing/);assert.match(tracking.text,/No carrier or tracking number/)
    assert.equal((await c.post('/target/orders/'+orderId+'/return',{reason:'Changed mind'})).status,400)
    const invalid=await c.post('/target/orders/'+orderId+'/cancel')
    assert.equal(invalid.status,400);assert.match(invalid.text,/Choose or enter a reason/)
    const cancelled=await c.post('/target/orders/'+orderId+'/cancel',{reason:'Ordered the wrong platform'})
    assert.match(cancelled.text,/Cancellation saved/);assert.match(cancelled.text,/this item will not ship/)
    assert.doesNotMatch(cancelled.text,/Delivers Thu|Shipping arrives|Release date/)
    await c.post('/target/orders/'+orderId+'/cancel',{reason:'Again'})
    assert.equal(order.meta.lifecycle.length,1)
    assert.deepEqual({items:order.items,payment:order.payment,options:order.meta.options,totals:order.totals},before)
    assert.match((await c.get(confirmation.url)).text,/Cancellation saved/)
    assert.match((await c.get('/target/orders/'+orderId+'/tracking')).text,/Tracking is closed/)
    assert.equal((await c.post('/target/orders/'+orderId+'/return',{reason:'Not delivered'})).status,400)
    const delivered=await purchase(c,{tcin:item('mug').tcin})
    // Only the test fixture supplies a delivered event; customer routes cannot invent delivery.
    delivered.order.meta.lifecycle=[{status:'delivered',reason:'Test delivery fixture'}]
    const eligible=await c.post('/target/orders/'+delivered.orderId+'/return',{reason:'Damaged item'})
    assert.match(eligible.text,/Your return request is saved/);assert.equal(delivered.order.meta.lifecycle.at(-1).status,'return_requested')
  }finally{await srv.close()}
})

test('target journeys: direct account switches clear checkout address and payment; saved cart and preferences remain owner-scoped',async()=>{
  const srv=await startServer()
  try{
    const c=srv.client(),other=srv.client(),p=item('mug')
    await signin(c);await createOther(other)
    await c.post('/target/account/preferences',{department:'Kitchen & Dining',offers:'yes',orderUpdates:'yes'})
    await c.post('/target/cart/add',{tcin:p.tcin});await c.post('/target/cart/update',{tcin:p.tcin,action:'save'})
    await c.post('/target/cart/add',{tcin:item('lamp').tcin})
    await c.post('/target/checkout/shipping',ADDRESS);await c.post('/target/checkout/payment',CARD)
    const same=await signin(c,'tester@example.com','/target/checkout')
    assert.match(same.url,/\/review$/)
    const switched=await signin(c,'other@example.com','/target/checkout')
    assert.match(switched.url,/\/shipping$/);assert.doesNotMatch(switched.text,/123 Ocean Dr|4242|Alex Tester/)
    assert.doesNotMatch((await c.get('/target/cart')).text,/Move to cart/)
    const preferences=await c.get('/target/account/preferences')
    assert.doesNotMatch(preferences.text,/name="offers" value="yes" checked/)
    await signin(c)
    assert.match((await c.get('/target/cart')).text,/Move to cart/)
    assert.match((await c.get('/target/account/preferences')).text,/name="offers" value="yes" checked/)
    assert.match((await c.get('/target/account/preferences')).text,/<option selected>Kitchen &amp; Dining/)
    assert.equal((await c.post('/target/account/preferences',{department:'Forged'})).status,400)
  }finally{await srv.close()}
})

test('target journeys: help searches, article links and local cases validate and isolate associated orders',async()=>{
  const srv=await startServer()
  try{
    const c=srv.client(),other=srv.client(),{orderId}=await purchase(c)
    const search=await c.get('/target/help?q=tracking')
    assert.match(search.text,/help\/articles\/track-order/)
    const article=await c.get('/target/help/articles/track-order');assert.equal(article.status,200);assert.match(article.text,/Purchase history/)
    assert.match((await c.get('/target/help?q=zzunknownzz')).text,/No articles match/)
    const bad=await c.post('/target/help/contact',{category:'Orders & purchases',subject:'Where is my order?',message:'short',email:'tester@example.com',order_id:orderId})
    assert.equal(bad.status,400);assert.match(bad.text,/value="Where is my order\?"/);assert.match(bad.text,/>short<\/textarea>/)
    const good=await c.post('/target/help/contact',{category:'Orders & purchases',subject:'Tracking question',message:'Please explain this preorder timeline. <script>alert(1)</script>',email:'tester@example.com',order_id:orderId})
    assert.match(good.text,/Request received/);assert.match(good.text,/No message has been sent/);assert.match(good.text,/&lt;script&gt;/);assert.doesNotMatch(good.text,/<script>alert/)
    const casePath=new URL(good.url).pathname
    assert.match((await c.get('/target/help/cases')).text,/Tracking question/)
    await signin(other)
    assert.equal((await other.get(casePath)).status,404)
    assert.equal((await other.post('/target/help/contact',{category:'Orders & purchases',subject:'Other order',message:'Please link this order to my case.',order_id:orderId})).status,400)
    await createOther(other);await signin(c,'other@example.com')
    assert.equal((await c.get(casePath)).status,404)
    assert.equal((await c.post('/target/help/contact',{category:'Orders & purchases',subject:'Old account',message:'Please link this old account order.',order_id:orderId})).status,400)
    await signin(c);assert.equal((await c.get(casePath)).status,200)
  }finally{await srv.close()}
})

test('target journeys: store selection is useful and isolated while service destinations stay honest',async()=>{
  const srv=await startServer()
  try{
    const c=srv.client(),other=srv.client()
    const stores=await c.get('/target/stores?q=33139');assert.match(stores.text,/Miami Beach/);assert.doesNotMatch(stores.text,/270 Mount Hermon/)
    const selection=await c.post('/target/stores/select',{store_id:'miami-beach'})
    assert.equal(selection.status,200);assert.match(selection.text,/Target Miami Beach/)
    assert.match((await c.get('/target/')).text,/<\/svg> Miami Beach<\/a>/)
    assert.match((await other.get('/target/')).text,/<\/svg> Scotts Valley<\/a>/)
    assert.equal((await c.post('/target/stores/select',{store_id:'fake'})).status,404)
    const services=await c.get('/target/services/pickup-delivery');assert.match(services.text,/not eligible for Order Pickup/)
    assert.match((await c.get('/target/circle')).text,/membership enrollment and live rewards are unavailable/)
  }finally{await srv.close()}
})

test('target journeys: commerce and identity mutations still challenge, including wish-list transfer',async()=>{
  const srv=await startServer({captcha:{mode:'on',stores:['target']}})
  try{
    const c=srv.client()
    for(const path of ['/target/cart/from-list','/target/cart/add','/target/buy-now','/target/checkout/shipping','/target/checkout/place-order','/target/login','/target/account/create']){
      const result=await c.post(path,{tcin:item('mug').tcin,email:'tester@example.com',password:'Password123!'})
      assert.ok(fieldValue(result.text,'challenge_id'),path)
    }
    assert.ok(fieldValue((await c.get(productPath('/target',item('mug')))).text,'challenge_id'))
    assert.equal(fieldValue((await c.get('/target/help')).text,'challenge_id'),null)
    assert.deepEqual(await c.json('/api/orders?store=target'),[])
  }finally{await srv.close()}
})

test('target journeys: guest PayPal intent survives sign-in without restoring another account’s payment',async()=>{
  const srv=await startServer()
  try{
    const c=srv.client()
    await c.post('/target/cart/add',{tcin:item('mug').tcin})
    assert.match((await c.post('/target/cart/paypal')).url,/\/login\?/)
    await signin(c,'tester@example.com','/target/checkout')
    const payment=await c.post('/target/checkout/shipping',ADDRESS)
    assert.match(payment.text,/name="paymentType" value="paypal" checked/)
    await c.post('/target/checkout/payment',{paymentType:'paypal'})
    const done=await c.post('/target/checkout/place-order')
    assert.match(done.text,/Thanks for your order/)
    const [order]=await c.json('/api/orders?store=target')
    assert.deepEqual(order.payment,{method:'paypal'})
  }finally{await srv.close()}
})
