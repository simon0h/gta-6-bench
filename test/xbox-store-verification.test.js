import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer, fieldValue } from './helpers.js'
import { byId, productPath } from '../stores/xbox-store/data.js'

const B='/xbox-store', path=id=>productPath(B,byId(id))
async function login(c){
  await c.post(B+'/login.live.com/oauth20_authorize.srf',{loginfmt:'tester@example.com'})
  await c.post(B+'/login.live.com/password.srf',{passwd:'Password123!'})
  await c.post(B+'/login.live.com/kmsi.srf',{kmsi:'yes'})
}
async function reviewPurchase(c,id){
  const form=await c.get(path(id)+'/buy')
  const review=await c.post(path(id)+'/buy',{pi:'new',payType:'paypal',payment_token:fieldValue(form.text,'payment_token')})
  assert.match(review.url,/\/buy\/confirm$/)
  return review
}

test('Xbox verification: changed digital entitlement quantity or devices invalidates direct and cart reviews',async()=>{
  const srv=await startServer(),p=byId('minecraft-minecoins'),quantity=p.quantity,platforms=p.platforms
  try{
    const c=srv.client();await login(c)
    const review=await reviewPurchase(c,p.id)
    p.quantity=800
    assert.equal((await c.post(path(p.id)+'/buy/confirm',{confirm_token:fieldValue(review.text,'confirm_token')})).status,409)
    assert.deepEqual(await c.json('/api/orders?store=xbox-store'),[])
    p.quantity=quantity
    await c.post(B+'/en-US/cart/add',{pid:p.id})
    const checkout=await c.get(B+'/en-US/checkout')
    p.platforms=['PC']
    assert.equal((await c.post(B+'/en-US/checkout',{pi:'new',payType:'paypal',action:'place',checkout_token:fieldValue(checkout.text,'checkout_token')})).status,409)
    assert.deepEqual(await c.json('/api/orders?store=xbox-store'),[])
    p.platforms=platforms
    const refreshed=await c.get(B+'/en-US/checkout')
    const done=await c.post(B+'/en-US/checkout',{pi:'new',payType:'paypal',action:'place',checkout_token:fieldValue(refreshed.text,'checkout_token'),quantity:'999999',entitlement:'game'})
    assert.equal(done.status,200)
    const [order]=await c.json('/api/orders?store=xbox-store')
    assert.equal(order.meta.entitlements[0].quantity,1600)
    assert.equal(order.meta.entitlements[0].type,'consumable')
    assert.deepEqual(order.meta.entitlements[0].platforms,platforms)
  }finally{p.quantity=quantity;p.platforms=platforms;await srv.close()}
})

test('Xbox verification: Deluxe covers the standard Minecraft license while included currency remains repeatable',async()=>{
  const srv=await startServer()
  try{
    const c=srv.client();await login(c)
    const review=await reviewPurchase(c,'minecraft-deluxe')
    assert.equal((await c.post(path('minecraft-deluxe')+'/buy/confirm',{confirm_token:fieldValue(review.text,'confirm_token')})).status,200)
    assert.match((await c.get(path('9mvxmvt8zkwc'))).text,/YOU OWN THIS/)
    assert.equal((await c.post(path('9mvxmvt8zkwc')+'/preorder')).status,409)
    assert.equal((await c.post(B+'/en-US/cart/add',{pid:'9mvxmvt8zkwc'})).status,409)
    assert.equal((await c.get(path('minecraft-minecoins')+'/buy')).status,200)
    const orders=await c.json('/api/orders?store=xbox-store')
    assert.equal(orders.length,1);assert.equal(orders[0].items[0].kind,'other')
  }finally{await srv.close()}
})

test('Xbox verification: subscription library includes eligible campaign DLC without claiming permanent ownership',async()=>{
  const srv=await startServer()
  try{
    const c=srv.client();await login(c)
    const plan=await c.get(B+'/account/services/join?plan=Ultimate')
    const active=await c.post(B+'/account/services/join',{plan:'Ultimate',service_token:fieldValue(plan.text,'service_token')})
    const library=await c.get(B+'/account/library?type=subscription&q=Halo')
    assert.match(library.text,/<h2>Halo Infinite \(Campaign\)<\/h2>/)
    assert.match(library.text,/Game Pass Ultimate access through/)
    assert.doesNotMatch((await c.get(path('halo-campaign'))).text,/YOU OWN THIS/)
    const off=await c.post(B+'/account/services/renewal',{action:'off',service_token:fieldValue(active.text,'service_token')})
    assert.match(off.text,/Recurring billing off/)
    assert.match((await c.get(B+'/account/library?type=subscription&q=Halo')).text,/<h2>Halo Infinite \(Campaign\)<\/h2>/)
    assert.deepEqual(await c.json('/api/orders?store=xbox-store'),[])
  }finally{await srv.close()}
})
