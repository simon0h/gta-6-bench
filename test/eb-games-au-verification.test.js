import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer, fieldValue } from './helpers.js'
const B='/eb-games-au'
const INFO={method:'ship',first_name:'Alex',last_name:'Tester',phone:'0412345678',address:'PO Box 57',suburb:'Sydney',state:'NSW',postcode:'2000',shipping_method:'standard'}
const CARD={payment_method:'card',card_number:'4242424242424242',card_expiry:'12/39',card_cvv:'123',card_name:'Alex Tester',accept_deposit:'yes'}
const ADDRESS={label:'Home',name:'Alex Tester',phone:'0412345678',line1:'PO Box 57',city:'Sydney',state:'NSW',postal_code:'2000',is_default:'yes'}
const duplicate=(body,key,value)=>{const form=new URLSearchParams(body);form.append(key,value);return form}

test('EB verification: repeated optional product, cart and checkout fields reject without changing selection or placing an order',async()=>{
 const s=await startServer();try{const c=s.client()
 assert.equal((await c.post(`${B}/cart/add`,duplicate({sku:'330056',variant_id:'forged'},'variant_id','other'))).status,400)
 assert.match((await c.get(`${B}/cart`)).text,/Your cart is empty/)
 await c.post(`${B}/cart/add`,{sku:'390021',variant_id:'red'})
 assert.equal((await c.post(`${B}/cart/update`,duplicate({sku:'390021',key:'390021:red',qty_390021:'2',action:'update'},'key','forged'))).status,400)
 assert.match((await c.get(`${B}/cart`)).text,/name="qty_390021"[^>]*value="1"/)
 await c.post(`${B}/checkout/guest`,{guest_email:'verify57@example.com'})
 const delivery=await c.post(`${B}/checkout/delivery`,duplicate({...INFO,address_line2:'Level 2'},'address_line2','Level 3'))
 assert.equal(delivery.status,400);assert.match(delivery.text,/value="PO Box 57"/)
 const review=await c.post(`${B}/checkout/delivery`,INFO)
 const invalid=await c.post(`${B}/checkout/payment`,duplicate({...CARD,promo_code:'NOT-VALID',review_token:fieldValue(review.text,'review_token')},'promo_code','SECOND'))
 assert.equal(invalid.status,400);assert.match(invalid.text,/value="Alex Tester"/);assert.doesNotMatch(invalid.text,/4242424242424242|value="123"/)
 assert.equal((await c.json('/api/orders?store=eb-games-au')).length,0)
 assert.equal((await c.post(`${B}/checkout/payment`,{...CARD,review_token:fieldValue(invalid.text,'review_token')})).status,200)
 const [order]=await c.json('/api/orders?store=eb-games-au');assert.equal(order.items[0].kind,'other');assert.equal(order.meta.paid_today,52.9);assert.equal(order.meta.balance_due,0);assert.doesNotMatch(JSON.stringify(order),/4242424242424242|card_cvv|card_number/)
 }finally{await s.close()}
})

test('EB verification: repeated address IDs and store selections cannot silently create or clear owner state',async()=>{
 const s=await startServer();try{const c=s.client();await c.post(`${B}/account/login`,{email:'tester@example.com',password:'Password123!'})
 const saved=await c.post(`${B}/account/addresses`,ADDRESS),id=fieldValue(saved.text,'id');assert.ok(id)
 const bad=await c.post(`${B}/account/addresses`,duplicate({...ADDRESS,id,line1:'Changed address'},'id','foreign-id'))
 assert.equal(bad.status,400);assert.match(bad.text,/value="Changed address"/)
 const addresses=await c.get(`${B}/account/addresses`);assert.equal((addresses.text.match(/>Edit address<\/a>/g)||[]).length,1);assert.doesNotMatch(addresses.text,/Changed address/)
 await c.post(`${B}/stores/select`,{store_id:'brisbane'})
 assert.equal((await c.post(`${B}/stores/select`,duplicate({store_id:'brisbane'},'store_id','forged'))).status,400)
 assert.match((await c.get(`${B}/catalog/390014`)).text,/EB Games Brisbane · Available/)
 }finally{await s.close()}
})

test('EB verification: mixed collection rejects Zip and pays ordinary items plus only the GTA deposit',async()=>{
 const s=await startServer();try{const c=s.client()
 await c.post(`${B}/cart/add`,{sku:'330060',qty:'2'})
 await c.post(`${B}/cart/add`,{sku:'390021',variant_id:'red'})
 await c.post(`${B}/checkout/guest`,{guest_email:'mixed57@example.com'})
 const review=await c.post(`${B}/checkout/delivery`,{...INFO,method:'pickup',store_id:'melbourne'})
 assert.doesNotMatch(review.text,/value="zip"/)
 const zip=await c.post(`${B}/checkout/payment`,{payment_method:'zip',zip_authorized:'yes',accept_deposit:'yes',review_token:fieldValue(review.text,'review_token')})
 assert.equal(zip.status,400);assert.equal((await c.json('/api/orders?store=eb-games-au')).length,0)
 assert.equal((await c.post(`${B}/checkout/payment`,{...CARD,review_token:fieldValue(zip.text,'review_token')})).status,200)
 const [order]=await c.json('/api/orders?store=eb-games-au')
 assert.deepEqual(order.items.map(i=>i.kind),['game','other']);assert.equal(order.items[0].platform,'xbox');assert.equal(order.items[0].qty,2)
 assert.equal(order.fulfillment.store_id,'melbourne');assert.equal(order.totals.shipping,0);assert.equal(order.meta.deposit_paid,20);assert.equal(order.meta.paid_today,64.95);assert.equal(order.meta.balance_due,239.9)
 assert.equal((await c.post(`${B}/account/orders/${order.id}/cancel`,{reason:'Testing collection boundary'})).status,400)
 assert.match((await c.get(`${B}/account/orders/${order.id}`)).text,/one business day/)
 }finally{await s.close()}
})
