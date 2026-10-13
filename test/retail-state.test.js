import test from 'node:test'
import assert from 'node:assert/strict'
import { configureOrders, recordOrder, getOrder, appendOrderEvent } from '../lib/orders.js'
import { retailState, saveAddress, deleteAddress, defaultAddress, rememberProduct, toggleFavorite, ownedOrders, ownedOrder, requestOrderAction, orderStatus, createSupportCase, addProductQuestion } from '../lib/retail-state.js'

const shopper = (session = 'one', slug = 'demo', user = { id:'demo-1',email:'tester@example.com',first_name:'Alex' }) => ({ storeSlug:slug,session:{id:session,run_id:'depth'},store:{ user } })
function purchase(req) {
 return recordOrder({store:req.storeSlug,session:req.session,order_number:'DEMO-001',items:[{kind:'other',title:'Local fixture',qty:1,unit_price:20,sku:'FIXTURE'}],customer:{email:'tester@example.com'},fulfillment:{method:'ship'},payment:{method:'card',last4:'4242'},totals:{subtotal:20,shipping:0,tax:0,total:20},currency:'USD'})
}

test('completed orders snapshot mutable checkout and catalog data while retaining explicit lifecycle updates',()=>{
 configureOrders({file:null})
 const req=shopper(), address={line1:'1 Original Street',city:'Austin',state:'TX',postal_code:'78701',country:'US'}
 const customer={email:'tester@example.com',first_name:'Alex'}, payment={method:'card',last4:'4242'}, totals={subtotal:20,shipping:0,tax:0,total:20}
 const fulfillment={method:'ship',option:'standard'}, rights={includedSkus:['BASE','ADDON'],platforms:['PC']}
 const order=recordOrder({store:'demo',session:req.session,order_number:'SNAPSHOT-001',items:[{kind:'other',title:'Game bundle',qty:1,unit_price:20,sku:'BUNDLE'}],customer,fulfillment,shipping_address:address,billing_address:address,payment,totals,currency:'USD',meta:{entitlements:[rights],options:[{sku:'BUNDLE',options:{Edition:'Deluxe'}}]}})
 const before=structuredClone(order)
 address.line1='2 Replacement Street';customer.email='replacement@example.com';payment.last4='9999';totals.total=1;fulfillment.option='express'
 rights.includedSkus.pop();rights.platforms.push('Unpurchased platform')
 assert.deepEqual(getOrder(order.id),before)
 appendOrderEvent(order.id,{store:'demo',session_id:req.session.id,action:'cancel',status:'cancelled',reason:'Changed mind'})
 assert.equal(getOrder(order.id).meta.lifecycle[0].status,'cancelled')
 assert.deepEqual(getOrder(order.id).meta.entitlements,before.meta.entitlements)
 assert.deepEqual(getOrder(order.id).shipping_address,before.shipping_address)
})

test('retail state keeps history, favorites and private addresses isolated by local account and session',()=>{
 const a=shopper(), b=shopper('two')
 rememberProduct(a,'a');rememberProduct(a,'b');rememberProduct(a,'a')
 assert.deepEqual(retailState(a).recent,['a','b'])
 assert.equal(toggleFavorite(a,'a'),true);assert.equal(toggleFavorite(a,'a'),false)
 toggleFavorite(a,'a')
 assert.deepEqual(retailState(b).favorites,[])
 const address=saveAddress(a,{name:'Alex',line1:'123 Main St',city:'Austin',state:'TX',postal_code:'78701'},{country:'US'}).address
 assert.ok(address.id)
 a.store.user={id:'demo-2',email:'other@example.com'}
 assert.deepEqual(retailState(a).addresses,[])
 a.store.user={id:'demo-1',email:'tester@example.com'}
 assert.equal(defaultAddress(a).id,address.id)
 a.store.user=null
 assert.deepEqual(retailState(a).addresses,[])
})

test('address book validates countries, edits only owned entries and maintains one default',()=>{
 const req=shopper()
 assert.ok(saveAddress(req,{name:'Alex',line1:'Street',city:'Seoul',postal_code:'x'},{country:'KR'}).errors)
 const first=saveAddress(req,{name:'Alex',line1:'123 Main St',city:'Austin',postal_code:'78701'}).address
 const second=saveAddress(req,{name:'Alex',line1:'456 Main St',city:'Austin',postal_code:'78702',is_default:'yes'}).address
 assert.equal(defaultAddress(req).id,second.id)
 assert.equal(retailState(req).addresses.filter(a=>a.is_default).length,1)
 assert.ok(saveAddress(shopper('other'),{id:first.id,name:'Alex',line1:'Street',city:'Austin',postal_code:'78701'}).errors)
 const edited=saveAddress(req,{id:first.id,name:'Alex',line1:'Updated street',city:'Austin',postal_code:'78703'}).address
 assert.equal(edited.id,first.id)
 assert.equal(retailState(req).addresses.length,2)
 assert.equal(deleteAddress(req,second.id),true)
 assert.equal(defaultAddress(req).id,first.id)
 assert.equal(deleteAddress(req,'forged'),false)
})

test('UK address validation accepts the special GIR postcode without weakening other countries',()=>{
 for(const country of ['UK','GB']) {
  for(const postal_code of ['GIR 0AA','gir0aa','SW1A 1AA','M1 1AE']) {
   const result=saveAddress(shopper(),{name:'Alex',line1:'1 High Street',city:'London',postal_code},{country})
   assert.ok(result.address,`${country}: ${postal_code}`)
  }
  for(const postal_code of ['GIR 0AB','GIRA 0AA','GIR 00AA','BAD','12345']) {
   assert.ok(saveAddress(shopper(),{name:'Alex',line1:'1 High Street',city:'London',postal_code},{country}).errors)
  }
 }
 for(const country of ['US','KR','AU']) assert.ok(saveAddress(shopper(),{name:'Alex',line1:'1 High Street',city:'London',postal_code:'GIR 0AA'},{country}).errors)
})

test('order actions enforce ownership, preserve grading data and are idempotent',()=>{
 configureOrders({file:null})
 const req=shopper(), other=shopper('other'), order=purchase(req), original=JSON.stringify({items:order.items,payment:order.payment,totals:order.totals})
 assert.equal(ownedOrders(req).length,1)
 assert.equal(ownedOrders(other).length,0)
 assert.equal(ownedOrder(shopper('one','another-store'),order.id),null)
 assert.equal(requestOrderAction(other,order.id,'cancel','Changed mind').status,404)
 assert.throws(()=>appendOrderEvent(order.id,{store:'demo',session_id:'forged',action:'cancel',status:'cancelled',reason:'bad'}))
 assert.equal(requestOrderAction(req,order.id,'return','Changed mind').status,400)
 assert.equal(requestOrderAction(req,order.id,'cancel','').status,400)
 assert.equal(requestOrderAction(req,order.id,'cancel','Changed mind').order.id,order.id)
 assert.equal(orderStatus(getOrder(order.id)),'cancelled')
 assert.equal(requestOrderAction(req,order.id,'cancel','Again').already,true)
 assert.equal(order.meta.lifecycle.length,1)
 assert.equal(JSON.stringify({items:order.items,payment:order.payment,totals:order.totals}),original)
})

test('support cases validate fields/order ownership and questions remain pending locally',()=>{
 configureOrders({file:null})
 const req=shopper(), order=purchase(req)
 assert.ok(createSupportCase(req,{category:'delivery',subject:'Help',message:'short'}).errors)
 const fields={category:'delivery',subject:'Delivery question',message:'Please confirm the local delivery address.',order_id:order.id}
 assert.ok(createSupportCase(shopper('other'),fields).errors)
 const result=createSupportCase(req,fields)
 assert.equal(result.supportCase.status,'received')
 assert.equal(retailState(req).cases.length,1)
 assert.equal(retailState(shopper('other')).cases.length,0)
 assert.ok(addProductQuestion(req,'fixture',{message:''}).error)
 assert.equal(addProductQuestion(req,'fixture',{message:'Which size should I select?'}).question.status,'pending')
 assert.equal(retailState(req).questions.fixture.length,1)
})
