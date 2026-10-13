import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer, fieldValue } from './helpers.js'
import { PRODUCTS, LISTINGS, bySku, totals } from '../stores/rockstar-store/data.js'
const B='/rockstar-store'
const ADDRESS={country:'US',first_name:'Alex',last_name:'Tester',city:'Miami',region:'FL',postal_code:'33139',street_address:'123 Ocean Dr',phone:'3055550123',email:'alex@example.com'}
const CARD={payment_method:'card',card_number:'4242424242424242',expiry:'12/29',cvc:'123',cardholder_name:'Alex Tester'}
const LOGIN={email:'tester@example.com',password:'Password123!'}
async function physicalReview(c){await c.post(`${B}/cart/checkout`);await c.post(`${B}/checkout/guest`);await c.post(`${B}/checkout/shipping-address`,ADDRESS);return c.post(`${B}/checkout/shipping-method`,{shipping_method:'standard'})}
test('rockstar catalog: five hundred catalog entries, finite search intersections, pagination and meaningful hubs',async()=>{
 const srv=await startServer();try{
 const c=srv.client();assert.equal(PRODUCTS.filter(p=>!['gta-vi','gta-plus','gtavi-goodtime-state-vice-city-collection'].includes(p.id)).length,497)
 assert.equal(new Set(PRODUCTS.map(p=>p.id)).size,500);assert.equal(LISTINGS.length,6)
 for(const path of ['/merchandise','/view-all-games','/game-add-ons','/grand-theft-auto-collection','/red-dead-redemption-collection','/rockstar-games-collection']){const r=await c.get(B+path);assert.equal(r.status,200);assert.match(r.text,/class="rs-tile"/)}
 const r=await c.get(B+'/search?query=red&section=Gear&category=collectibles&max=20&sort=price-asc');assert.match(r.text,/Red Dead Redemption Enamel Pins/);assert.doesNotMatch(r.text,/<h3>.*Glass Candle/)
 const a=await c.get(B+'/search'),b=await c.get(B+'/search?page=2');assert.match(a.text,/500 results/);assert.match(b.text,/Page 2 of 42/);assert.notEqual(a.text,b.text)
 assert.match((await c.get(B+'/search?q=zzzz&category=apparel')).text,/No Results/)
 assert.ok((await c.json(B+'/search/suggestions?q=bully')).some(p=>p.title.includes('Bully')))
 }finally{await srv.close()}
})
test('rockstar catalog: physical size variants remain separate, use trusted prices and ordinary delivery',async()=>{
 const srv=await startServer();try{
 const c=srv.client();assert.equal((await c.post(B+'/cart/add',{sku:'BENCH-VC-TEE'})).status,400)
 assert.equal((await c.post(B+'/cart/add',{sku:'BENCH-VC-TEE',variant:'xxl'})).status,400)
 for(const variant of ['s','m'])assert.equal((await c.post(B+'/cart/add',{sku:'BENCH-VC-TEE',variant,price:'0.01',kind:'game'})).status,200)
 const cart=await c.get(B+'/cart');assert.match(cart.text,/BENCH-VC-TEE:s/);assert.match(cart.text,/BENCH-VC-TEE:m/)
 const pay=await physicalReview(c);assert.match(pay.text,/\$85\.58/);assert.doesNotMatch(pay.text,/November 12/)
 const done=await c.post(B+'/checkout/payment',{...CARD,review_token:fieldValue(pay.text,'review_token')});assert.equal(done.status,200)
 const [o]=await c.json('/api/orders?store=rockstar-store');assert.deepEqual(o.items.map(x=>x.kind),['other','other']);assert.deepEqual(o.items.map(x=>x.unit_price),[39.99,39.99]);assert.deepEqual(o.meta.options.map(x=>x.options.Size),['S','M']);assert.doesNotMatch(o.fulfillment.eta,/November/)
 assert.equal((await srv.client().get(done.url)).status,404)
 }finally{await srv.close()}
})
test('rockstar catalog: Launcher checkout requires an account, omits shipping, and records an owned entitlement',async()=>{
 const srv=await startServer();try{
 const c=srv.client();const gate=await c.post(B+'/buy-now',{sku:'331300-US'});assert.match(gate.url,/signin\?return=checkout/)
 assert.match((await c.post(B+'/checkout/guest')).url,/signin/)
 const pay=await c.post(B+'/signin?return=checkout',LOGIN);assert.match(pay.url,/checkout\/payment/);assert.doesNotMatch(pay.text,/<b>Ship to<\/b>/);assert.match(pay.text,/\$16\.04/)
 const done=await c.post(B+'/checkout/payment',{payment_method:'paypal',review_token:fieldValue(pay.text,'review_token')});assert.match(done.text,/PC digital delivery/)
 const [o]=await c.json('/api/orders?store=rockstar-store');assert.equal(o.items[0].kind,'other');assert.equal(o.fulfillment.method,'digital');assert.equal(o.shipping_address,null);assert.equal(o.totals.shipping,0);assert.equal(o.meta.entitlements[0].product_id,'bully-scholarship-edition')
 assert.match((await c.get(B+'/library')).text,/Bully/);assert.equal((await srv.client().get(done.url)).status,404)
 await c.post(B+'/signup',{email:'other@example.com',nickname:'Other',password:'Password123!',country:'US'});assert.equal((await c.get(done.url)).status,404);assert.doesNotMatch((await c.get(B+'/library')).text,/<h2>Bully/)
 }finally{await srv.close()}
})
test('rockstar catalog: exact currency denominations use trusted prices and grant matching entitlements',async()=>{
 const srv=await startServer();try{
 const c=srv.client();await c.post(B+'/signin',LOGIN);const pay=await c.post(B+'/buy-now',{sku:'RS-GOLD-BARS',variant:'150',price:'0.01'})
 assert.match(pay.text,/150 Gold Bars/);assert.match(pay.text,/\$53\.49/)
 await c.post(B+'/checkout/payment',{...CARD,review_token:fieldValue(pay.text,'review_token')});const [o]=await c.json('/api/orders?store=rockstar-store');assert.equal(o.items[0].unit_price,49.99);assert.equal(o.meta.entitlements[0].label,'150 Gold Bars')
 }finally{await srv.close()}
})
test('rockstar catalog: collector shipping exclusion, scalar quantity and prototype method guards',async()=>{
 const srv=await startServer();try{
 const c=srv.client();assert.equal(totals([{sku:'357790-US',qty:1}]).shipping,5.99)
 await c.post(B+'/cart/add',{sku:'355001-US'});assert.equal((await c.post(B+'/cart/update',{sku:'355001-US',qty:'1.5'})).status,400)
 assert.equal((await c.post(B+'/cart/add',new URLSearchParams('sku=355001-US&qty=1&qty=2'))).status,400)
 await physicalReview(c);for(const shipping_method of ['__proto__','constructor','toString'])assert.equal((await c.post(B+'/checkout/shipping-method',{shipping_method})).status,400)
 assert.equal((await c.post(B+'/checkout/payment',{...CARD,payment_method:'constructor'})).status,400)
 assert.equal((await c.json('/api/orders?store=rockstar-store')).length,0)
 }finally{await srv.close()}
})
test('rockstar catalog: changed cart, trusted price, final stock and old review token cannot place an unseen order',async()=>{
 const srv=await startServer();const p=PRODUCTS.find(p=>p.sku==='355001-US'),original=p.price,stock=p.inventory
 try{
 const c=srv.client();await c.post(B+'/cart/add',{sku:p.sku});const pay=await physicalReview(c),token=fieldValue(pay.text,'review_token')
 await c.post(B+'/cart/update',{sku:p.sku,qty:'2'});assert.equal((await c.post(B+'/checkout/payment',{...CARD,review_token:token})).status,409)
 let review=await physicalReview(c);p.price=4.99;assert.equal((await c.post(B+'/checkout/payment',{...CARD,review_token:fieldValue(review.text,'review_token')})).status,409)
 review=await c.get(B+'/checkout/payment');p.inventory=0;assert.equal((await c.post(B+'/checkout/payment',{...CARD,review_token:fieldValue(review.text,'review_token')})).status,409);p.inventory=stock
 const newer=await c.get(B+'/checkout/payment');assert.equal((await c.post(B+'/checkout/payment',{...CARD,review_token:fieldValue(review.text,'review_token')})).status,409)
 assert.equal((await c.json('/api/orders?store=rockstar-store')).length,0)
 }finally{p.price=original;p.inventory=stock;await srv.close()}
})
test('rockstar catalog: account switch invalidates a prior digital review and passwords are never echoed',async()=>{
 const srv=await startServer();try{
 const c=srv.client();await c.post(B+'/signup',{email:'new@example.com',nickname:'New',password:'Password123!'});await c.post(B+'/signin',LOGIN)
 const pay=await c.post(B+'/buy-now',{sku:'331300-US'}),token=fieldValue(pay.text,'review_token')
 await c.post(B+'/signin',{email:'new@example.com',password:'Password123!'})
 const stale=await c.post(B+'/checkout/payment',{...CARD,review_token:token});assert.equal(stale.status,409)
 const confirmed=await c.post(B+'/checkout/payment',{...CARD,review_token:fieldValue(stale.text,'review_token')});assert.equal(confirmed.status,200)
 const [o]=await c.json('/api/orders?store=rockstar-store');assert.equal(o.customer.email,'new@example.com')
 const invalid=await c.post(B+'/signup',{email:'bad',nickname:'New',password:'NeverEchoThisPassword'});assert.equal(invalid.status,400);assert.doesNotMatch(invalid.text,/NeverEchoThisPassword/)
 }finally{await srv.close()}
})
