import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer, fieldValue } from './helpers.js'
import { getOrder } from '../lib/orders.js'
const DETAILS = {first_name:'Alex',last_name:'Tester',phone:'07700 900123',line1:'10 High Street',city:'London',postcode:'SW1A 1AA',method:'ship'}
const CARD = {name_on_card:'Alex Tester',card_number:'4242424242424242',expiry:'12/99',cvv:'123',billing_same:'1',terms:'1'}
const main = html => html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)[1]
async function ready(c, sku='9901005', variant='steel') {
  await c.post(`/argos/product/${sku}/stock`, {postcode:'SW1A 1AA',variant})
  await c.post('/argos/trolley/add',{sku,variant,qty:'1',age_confirmed:'1'})
  await c.post('/argos/account',{action:'guest',email:'verify@example.com'})
}
test('argos verification: duplicated and nested scalar fields reject without substituting options, crashing or mutating checkout', async()=>{
  const s=await startServer()
  try {
    const c=s.client()
    assert.equal((await fetch(`${s.base}/argos/trolley/add`,{method:'POST'})).status,400)
    await c.post('/argos/product/9901005/stock',{postcode:'SW1A 1AA',variant:'steel'})
    for(const body of ['sku=9901005&variant=steel&variant=forged&qty=1','sku[toString]=bad&qty=1','sku=9901005&variant[id]=steel&qty=1','sku=9901005&variant=__proto__&qty=1']) {
      assert.equal((await c.post('/argos/trolley/add',new URLSearchParams(body))).status,400)
    }
    assert.match(main((await c.get('/argos/trolley')).text),/trolley is empty/)
    for(const query of ['variant=steel&variant=black','variant[id]=steel']) assert.equal((await c.get(`/argos/product/9901005?${query}`)).status,400)
    await ready(c)
    const review=await c.post('/argos/checkout/details',DETAILS), token=fieldValue(review.text,'review_token')
    const duplicateDetails=new URLSearchParams(DETAILS);duplicateDetails.append('first_name','Second')
    assert.equal((await c.post('/argos/checkout/details',duplicateDetails)).status,400)
    assert.equal((await c.post('/argos/checkout/details',{...DETAILS,method:'__proto__'})).status,400)
    const duplicatePayment=new URLSearchParams({...CARD,review_token:token});duplicatePayment.append('review_token',token)
    const rejected=await c.post('/argos/checkout/payment',duplicatePayment)
    assert.equal(rejected.status,400);assert.doesNotMatch(rejected.text,/4242424242424242|value="123"/)
    assert.equal((await c.json('/api/orders?store=argos')).length,0)
    const done=await c.post('/argos/checkout/payment',{...CARD,review_token:token})
    assert.match(done.url,/confirmation\/\d+$/)
    const [order]=await c.json('/api/orders?store=argos')
    assert.equal(order.items[0].kind,'other');assert.equal(order.items[0].unit_price,34.99)
  } finally {await s.close()}
})
test('argos verification: cancelled delivery and collection receipts show historical payment and no pending fulfillment',async()=>{
  const s=await startServer()
  try {
    for(const method of ['ship','pickup']) {
      const c=s.client();await ready(c,method==='ship'?'9901004':'8747444','')
      const review=await c.post('/argos/checkout/details',{...DETAILS,method,collection_point:'London Central Argos'})
      const done=await c.post('/argos/checkout/payment',{...CARD,review_token:fieldValue(review.text,'review_token')})
      const number=done.url.split('/').at(-1), record=getOrder(number), original=JSON.stringify({items:record.items,payment:record.payment,totals:record.totals})
      if(method==='pickup') assert.deepEqual(record.items.map(({kind,platform,edition,format,unit_price})=>({kind,platform,edition,format,unit_price})),[{kind:'game',platform:'ps5',edition:'standard',format:'code-in-box',unit_price:67.99}])
      await c.post(`/argos/orders/${number}/action`,{action:'cancel',reason:'Changed my mind'})
      const receipt=main((await c.get(new URL(done.url).pathname)).text)
      assert.match(receipt,/Your order was cancelled/);assert.match(receipt,/Original payment recorded with Visa ending 4242/)
      assert.match(receipt,/Original order summary/);assert.match(receipt,/No refund has been processed/)
      assert.doesNotMatch(receipt,/Within 7–14|Pre-orders from|Wait for your collection|Collect from|Paid in full with|<dt>Delivery \/ collection<\/dt>/)
      assert.equal(JSON.stringify({items:record.items,payment:record.payment,totals:record.totals}),original)
    }
    const c=s.client(), sofa=main((await c.get('/argos/product/9901004')).text)
    assert.doesNotMatch(sofa,/slot arranged after order/)
    assert.match(main((await c.get('/argos/help/delivery-collection')).text),/no collection codes are sent and no real delivery slots are booked/)
  } finally {await s.close()}
})
