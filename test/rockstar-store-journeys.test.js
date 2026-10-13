import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer, fieldValue } from './helpers.js'
const B='/rockstar-store'
const LOGIN={email:'tester@example.com',password:'Password123!'}
const ADDRESS={label:'Home',name:'Alex Tester',line1:'123 Ocean Dr',line2:'Apt 4',city:'Miami',state:'FL',postal_code:'33139',phone:'3055550123',is_default:'yes'}
const SHIP={country:'US',first_name:'Alex',last_name:'Tester',street_address:'123 Ocean Dr',apartment:'Apt 4',city:'Miami',region:'FL',postal_code:'33139',phone:'3055550123',email:'tester@example.com'}
const profile={nickname:'Ocean Player',first_name:'Jordan',last_name:'Tester',phone:'3055550123'}
const addressIds=html=>[...html.matchAll(/addresses\/(address-[a-f0-9]+)\/default/g)].map(m=>m[1])
async function purchase(c,{digital=false,guest=false}={}) {
 if(!guest)await c.post(B+'/signin',LOGIN)
 await c.post(B+'/buy-now',{sku:digital?'331300-US':'355001-US'})
 if(!digital){if(guest)await c.post(B+'/checkout/guest');await c.post(B+'/checkout/shipping-address',SHIP);await c.post(B+'/checkout/shipping-method',{shipping_method:'standard'})}
 const pay=await c.get(B+'/checkout/payment')
 const receipt=await c.post(B+'/checkout/payment',{payment_method:'paypal',review_token:fieldValue(pay.text,'review_token')})
 assert.equal(receipt.status,200)
 const [order]=await c.json('/api/orders?store=rockstar-store')
 return {order,receipt}
}
test('rockstar journeys: intended wishlist resumes after protected auth, profile/preferences persist per account and recent clears',async()=>{
 const s=await startServer();try{const c=s.client()
 const gate=await c.post(B+'/wishlist',{sku:'BENCH-VC-TEE'});assert.match(gate.url,/signin\?return=/)
 const saved=await c.post(B+'/signin?return=%2Frockstar-store%2Fwishlist',LOGIN);assert.match(saved.url,/\/wishlist$/);assert.match(saved.text,/Vice City Screenshot Tee/)
 await c.post(B+'/account/profile',profile);await c.post(B+'/account/preferences',{collection:'rdr',news:'yes'});await c.get(B+'/game/buy-bully-scholarship-edition')
 assert.match((await c.get(B+'/recently-viewed')).text,/<h2>Bully/)
 await c.post(B+'/recently-viewed/clear');assert.doesNotMatch((await c.get(B+'/recently-viewed')).text,/<h2>Bully/)
 await c.post(B+'/signup',{email:'other@example.com',nickname:'Other',password:'Password123!'})
 assert.doesNotMatch((await c.get(B+'/wishlist')).text,/<h2>.*Vice City Screenshot/)
 assert.doesNotMatch((await c.get(B+'/account/profile')).text,/value="Ocean Player"/)
 await c.post(B+'/signin',LOGIN);assert.match((await c.get(B+'/account')).text,/<h2>Ocean Player/)
 assert.match((await c.get(B+'/account/preferences')).text,/value="rdr" selected/)
 await c.post(B+'/wishlist',{sku:'BENCH-VC-TEE'});assert.match((await c.get(B+'/wishlist')).text,/wishlist is empty/)
 await c.post(B+'/signout');assert.match((await c.get(B+'/account')).url,/signin\?return=/)
 }finally{await s.close()}
})
test('rockstar journeys: unsafe auth return targets, duplicate fields and unsupported preferences reject before state change',async()=>{
 const s=await startServer();try{const c=s.client()
 for(const ret of ['https://outside.example','//outside.example','/rockstar-store/../other','/rockstar-store/account%2f..','/rockstar-store/account?next=https://outside.example'])for(const method of ['get','post'])assert.equal((await c[method](B+'/signin?return='+encodeURIComponent(ret),LOGIN)).status,400)
 assert.equal((await c.get(B+'/signup?return=checkout&return=/rockstar-store/account')).status,400)
 assert.equal((await c.post(B+'/signin',new URLSearchParams('email=tester%40example.com&email=other%40example.com&password=Password123!'))).status,400)
 await c.post(B+'/signin',LOGIN);assert.equal((await c.post(B+'/account/preferences',{collection:'constructor'})).status,400)
 assert.equal((await c.post(B+'/account/profile',new URLSearchParams('nickname=A&nickname=B&first_name=A&last_name=B'))).status,400)
 const bad=await c.post(B+'/signup',{email:'bad',nickname:'N',password:'VerySecret123!'});assert.doesNotMatch(bad.text,/VerySecret123!/)
 }finally{await s.close()}
})
test('rockstar journeys: saved address ownership, default checkout prefill, selector review invalidation and immutable completed address',async()=>{
 const s=await startServer();try{const c=s.client();await c.post(B+'/signin',LOGIN)
 const bad=await c.post(B+'/account/addresses',{...ADDRESS,postal_code:'abc'});assert.equal(bad.status,400);assert.match(bad.text,/123 Ocean Dr/)
 let list=await c.post(B+'/account/addresses',ADDRESS);const first=addressIds(list.text)[0]
 list=await c.post(B+'/account/addresses',{...ADDRESS,label:'Work',line1:'456 Palm Ave',is_default:''});const second=addressIds(list.text)[1]
 const start=await c.post(B+'/buy-now',{sku:'355001-US'});assert.match(start.text,/value="123 Ocean Dr"/);assert.match(start.text,/Saved address/)
 await c.post(B+'/checkout/shipping-address',SHIP);let pay=await c.post(B+'/checkout/shipping-method',{shipping_method:'standard'});const old=fieldValue(pay.text,'review_token')
 assert.equal((await c.get(B+'/checkout/shipping-address?address_id='+first+'&address_id='+second)).status,400)
 assert.equal((await c.get(B+'/checkout/shipping-address?address_id=address-unknown')).status,400)
 const change=await c.get(B+'/checkout/shipping-address?address_id='+second);assert.match(change.text,/value="456 Palm Ave"/)
 await c.post(B+'/checkout/shipping-address',{...SHIP,street_address:'456 Palm Ave'});pay=await c.post(B+'/checkout/shipping-method',{shipping_method:'standard'})
 const stale=await c.post(B+'/checkout/payment',{payment_method:'paypal',review_token:old});assert.equal(stale.status,409)
 await c.post(B+'/checkout/payment',{payment_method:'paypal',review_token:fieldValue(stale.text,'review_token')});const [o]=await c.json('/api/orders?store=rockstar-store');assert.equal(o.shipping_address.line1,'456 Palm Ave')
 await c.post(B+'/account/addresses',{...ADDRESS,id:second,line1:'789 New St'});assert.equal((await c.json('/api/orders?store=rockstar-store'))[0].shipping_address.line1,'456 Palm Ave')
 await c.post(B+'/account/addresses/'+first+'/default');await c.post(B+'/account/addresses/'+second+'/delete')
 await c.post(B+'/signup',{email:'second-1@example.com',nickname:'Second',password:'Password123!'})
 assert.doesNotMatch((await c.get(B+'/account/addresses')).text,/123 Ocean Dr/)
 assert.equal((await c.post(B+'/account/addresses/'+first+'/delete')).status,404)
 const other=await c.post(B+'/buy-now',{sku:'355001-US'});assert.doesNotMatch(other.text,/value="123 Ocean Dr"/)
 assert.equal((await c.get(B+'/checkout/shipping-address?address_id='+first)).status,400)
 }finally{await s.close()}
})
test('rockstar journeys: account/session order privacy, cancellation lifecycle and cancelled receipt fulfillment are consistent',async()=>{
 const s=await startServer();try{const c=s.client(),{order:o,receipt}=await purchase(c)
 assert.match((await c.get(B+'/account/orders')).text,new RegExp(o.order_number))
 const detail=await c.get(B+'/orders/'+o.id);assert.match(detail.text,/not dispatched/);assert.match(detail.text,/Cancel entire order/)
 assert.equal((await c.post(B+'/orders/'+o.id+'/action',{action:'return',reason:'Unwanted'})).status,400)
 const stranger=s.client();await stranger.post(B+'/signin',LOGIN);assert.equal((await stranger.get(B+'/orders/'+o.id)).status,404);assert.equal((await stranger.get(receipt.url)).status,404)
 await c.post(B+'/signup',{email:'second-2@example.com',nickname:'Second',password:'Password123!'})
 for(const url of [B+'/orders/'+o.id,receipt.url,B+'/support/contact?order_id='+o.id])assert.equal((await c.get(url)).status,404)
 assert.equal((await c.post(B+'/orders/'+o.id+'/action',{action:'cancel',reason:'Changed plans'})).status,404)
 await c.post(B+'/signin',LOGIN)
 const cancel=await c.post(B+'/orders/'+o.id+'/action',{action:'cancel',reason:'Changed plans'});assert.match(cancel.text,/Cancelled · no shipment/);assert.match(cancel.text,/no bank refund is confirmed/)
 const cancelledReceipt=await c.get(receipt.url);assert.match(cancelledReceipt.text,/Order cancelled/);assert.doesNotMatch(cancelledReceipt.text,/tracking becomes available|will email|not dispatched|awaiting release/i)
 const [kept]=await c.json('/api/orders?store=rockstar-store');assert.equal(kept.items[0].kind,'other');assert.equal(kept.meta.lifecycle[0].status,'cancelled');assert.deepEqual(kept.payment,{method:'paypal'})
 await c.post(B+'/signout');assert.equal((await c.get(receipt.url)).status,404)
 }finally{await s.close()}
})
test('rockstar journeys: PC library access instructions and pending refund support preserve entitlement and account isolation',async()=>{
 const s=await startServer();try{const c=s.client(),{order:o}=await purchase(c,{digital:true})
 const library=await c.get(B+'/library');assert.match(library.text,/Access details/)
 const details=B+'/library/'+o.id+'/bully-scholarship-edition';assert.match((await c.get(details)).text,/Locate the game in your Launcher library/)
 assert.equal((await c.post(B+'/orders/'+o.id+'/action',{action:'cancel',reason:'Changed mind'})).status,400)
 const invalid=await c.post(B+'/support/contact',{category:'Refund review',subject:'Bully refund',message:'Please review the game purchase.',email:LOGIN.email});assert.equal(invalid.status,400)
 const saved=await c.post(B+'/support/contact',{category:'Refund review',order_id:o.id,subject:'Bully refund',message:'Please review the game purchase.',email:LOGIN.email,card_number:'4242424242424242',password:'DoNotStoreThis'})
 assert.match(saved.text,/Request received/);assert.match(saved.text,/No response or refund has been issued/);assert.doesNotMatch(saved.text,/4242424242424242|DoNotStoreThis/)
 assert.match((await c.get(B+'/orders/'+o.id)).text,/Request received; review pending/);assert.match((await c.get(B+'/library')).text,/Assigned to this account/)
 const [kept]=await c.json('/api/orders?store=rockstar-store');assert.equal(kept.meta.entitlements.length,1);assert.equal(kept.meta.lifecycle,undefined);assert.equal(kept.shipping_address,null)
 await c.post(B+'/signup',{email:'second-3@example.com',nickname:'Second',password:'Password123!'})
 assert.equal((await c.get(saved.url)).status,404);assert.equal((await c.get(details)).status,404);assert.doesNotMatch((await c.get(B+'/support/cases')).text,/Bully refund/)
 }finally{await s.close()}
})
test('rockstar journeys: guest orders stay session-owned and help search/contact validation works',async()=>{
 const s=await startServer();try{const c=s.client(),{order:o,receipt}=await purchase(c,{guest:true})
 const search=await c.get(B+'/support?q=tracking');assert.match(search.text,/Track a physical order/);assert.match((await c.get(B+'/support?q=zzzzz')).text,/No articles matched/)
 assert.equal((await c.get(B+'/support?q=order&q=PC')).status,400)
 assert.equal((await c.get(B+'/support/articles/refunds')).status,200)
 const bad=await c.post(B+'/support/contact',{category:'Product question',subject:'My question',message:'short',email:'bad'});assert.equal(bad.status,400);assert.match(bad.text,/value="My question"/)
 assert.equal((await c.post(B+'/support/contact',{category:'constructor',subject:'My question',message:'Long enough message',email:'a@example.com'})).status,400)
 const saved=await c.post(B+'/support/contact',{category:'Order and delivery',order_id:o.id,subject:'Delivery question',message:'When will my order dispatch?',email:'a@example.com'});assert.match(saved.text,/Request received/)
 const outsider=s.client();assert.equal((await outsider.get(receipt.url)).status,404);assert.equal((await outsider.get(saved.url)).status,404)
 await c.post(B+'/signin',LOGIN);assert.equal((await c.get(receipt.url)).status,200);assert.equal((await c.get(saved.url)).status,404)
 await c.post(B+'/signout');assert.equal((await c.get(saved.url)).status,200)
 }finally{await s.close()}
})
test('rockstar journeys: mixed orders retain digital entitlements while physical items need shipment and support review',async()=>{
 const s=await startServer();try{const c=s.client();await c.post(B+'/signin',LOGIN)
 await c.post(B+'/cart/add',{sku:'331300-US'});await c.post(B+'/cart/add',{sku:'BENCH-VC-TEE',variant:'m'})
 await c.post(B+'/cart/checkout');await c.post(B+'/checkout/shipping-address',SHIP);const pay=await c.post(B+'/checkout/shipping-method',{shipping_method:'standard'})
 await c.post(B+'/checkout/payment',{payment_method:'paypal',review_token:fieldValue(pay.text,'review_token')});const [o]=await c.json('/api/orders?store=rockstar-store')
 assert.equal(o.fulfillment.method,'ship');assert.equal(o.meta.entitlements.length,1);assert.deepEqual(o.items.map(i=>i.kind),['other','other']);assert.equal(o.totals.shipping,5.99)
 const detail=await c.get(B+'/orders/'+o.id);assert.match(detail.text,/PC game · Rockstar Games Launcher/);assert.match(detail.text,/Processing · tracking available after dispatch/);assert.doesNotMatch(detail.text,/Cancel entire order/)
 assert.equal((await c.post(B+'/orders/'+o.id+'/action',{action:'cancel',reason:'Wrong size'})).status,400)
 assert.match((await c.get(B+'/library')).text,/<h2>Bully/)
 }finally{await s.close()}
})
test('rockstar journeys: fresh canonical preorders never show dispatch and cancellation preserves canonical receipt data',async()=>{
 const s=await startServer();try{const c=s.client();await c.post(B+'/game/buy-gta-vi/preorder',{platform:'ps5'});await c.post(B+'/verify-age',{month:'5',day:'14',year:'1990'});await c.post(B+'/checkout/guest');await c.post(B+'/checkout/shipping-address',SHIP);const pay=await c.post(B+'/checkout/shipping-method',{shipping_method:'standard'})
 const done=await c.post(B+'/checkout/payment',{payment_method:'paypal',review_token:fieldValue(pay.text,'review_token')});const [o]=await c.json('/api/orders?store=rockstar-store')
 assert.match((await c.get(B+'/orders/'+o.id)).text,/Pre-order · awaiting release/);assert.match(done.text,/Pre-order · not dispatched/)
 await c.post(B+'/orders/'+o.id+'/action',{action:'cancel',reason:'No longer needed'})
 const receipt=await c.get(done.url);assert.match(receipt.text,/Cancelled · no shipment/);assert.doesNotMatch(receipt.text,/will be shipped|awaiting release|not dispatched|Ships from/)
 const [kept]=await c.json('/api/orders?store=rockstar-store');assert.equal(kept.items[0].sku,'357725-US');assert.equal(kept.items[0].kind,'game');assert.equal(kept.items[0].format,'code-in-box');assert.equal(kept.meta.xsolla_project,'100851');assert.equal(kept.totals.tax,5.6)
 }finally{await s.close()}
})
test('rockstar journeys: library access details distinguish two currency denominations in one owned order',async()=>{
 const s=await startServer();try{const c=s.client();await c.post(B+'/signin',LOGIN)
 for(const variant of ['25','150'])await c.post(B+'/cart/add',{sku:'RS-GOLD-BARS',variant})
 const pay=await c.post(B+'/cart/checkout');await c.post(B+'/checkout/payment',{payment_method:'paypal',review_token:fieldValue(pay.text,'review_token')})
 const [o]=await c.json('/api/orders?store=rockstar-store'),path=B+'/library/'+o.id+'/'+o.meta.entitlements[0].product_id
 assert.equal(o.meta.entitlements.length,2)
 const library=await c.get(B+'/library');assert.match(library.text,/sku=RS-GOLD-BARS%3A25/);assert.match(library.text,/sku=RS-GOLD-BARS%3A150/)
 assert.equal((await c.get(path)).status,404)
 const second=await c.get(path+'?sku=RS-GOLD-BARS%3A150');assert.equal(second.status,200);assert.match(second.text,/PC · 150 Gold Bars/)
 assert.equal((await c.get(path+'?sku=RS-GOLD-BARS%3A150&sku=RS-GOLD-BARS%3A25')).status,404)
 }finally{await s.close()}
})
