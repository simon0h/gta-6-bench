import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer, fieldValue } from './helpers.js'
import { browseProducts } from '../stores/eb-games-au/browse.js'
import { getOrder, recordOrder } from '../lib/orders.js'
const B='/eb-games-au', credentials={email:'tester@example.com',password:'Password123!'}
const INFO={method:'ship',first_name:'Alex',last_name:'Tester',phone:'0412345678',address:'1 George St',suburb:'Sydney',state:'NSW',postcode:'2000',shipping_method:'standard'}
const ADDRESS={label:'Home',name:'Alex Tester',phone:'0412345678',line1:'PO Box 51',line2:'Level 2',city:'Sydney',state:'NSW',postal_code:'2000',is_default:'yes'}
const CARD={payment_method:'card',card_number:'4242424242424242',card_expiry:'12/39',card_cvv:'123',card_name:'Alex Tester',accept_deposit:'yes'}
const path=r=>new URL(r.url).pathname
let registration=0
async function register(c,email=`second-eb51-${++registration}@example.com`){return c.post(`${B}/account/sign-up`,{email,password:'Different123!',first_name:'Sam',last_name:'Second',phone:'0412345679',over_16:'yes'})}
async function place(c,{member=true,pickup=false,sku='390014'}={}){await c.post(`${B}/cart/add`,{sku});if(member)await c.post(`${B}/account/login`,credentials);else await c.post(`${B}/checkout/guest`,{guest_email:'guest51@example.com'});const review=await c.post(`${B}/checkout/delivery`,pickup?{...INFO,method:'pickup',store_id:'sydney'}:INFO);const r=await c.post(`${B}/checkout/payment`,{...CARD,review_token:fieldValue(review.text,'review_token')});assert.equal(r.status,200);return (await c.json('/api/orders?store=eb-games-au')).at(-1)}

test('EB World account profile, AU address CRUD, default checkout picker and account-switch reset',async()=>{
 const s=await startServer();try{const c=s.client(),other=s.client()
 const gate=await c.get(`${B}/account/addresses`);assert.match(gate.text,/Sign in to EB World/);assert.doesNotMatch(gate.text,/>Continue as Guest<\/button>/)
 assert.equal(path(await c.post(`${B}/account/login`,credentials)),`${B}/account/addresses`)
 const bad=await c.post(`${B}/account/addresses`,{...ADDRESS,state:'CA',postal_code:'90210'});assert.equal(bad.status,400);assert.match(bad.text,/PO Box 51/)
 const added=await c.post(`${B}/account/addresses`,ADDRESS),id=fieldValue(added.text,'id');assert.ok(id)
 const edited=await c.post(`${B}/account/addresses`,{...ADDRESS,id,line1:'Parcel Locker 51',is_default:''});assert.match(edited.text,/Parcel Locker 51/)
 await c.post(`${B}/account/addresses`,{...ADDRESS,label:'Office',line1:'2 Test St',is_default:''})
 await c.post(`${B}/cart/add`,{sku:'390014'})
 const delivery=await c.get(`${B}/checkout`);assert.match(delivery.text,/value="Parcel Locker 51"/);assert.match(delivery.text,/value="Level 2"/)
 assert.equal((await c.get(`${B}/checkout/delivery?address_id=forged`)).status,400)
 await c.post(`${B}/account/profile`,{first_name:'Alexandra',last_name:'Tester',phone:'0412345678',sms_marketing:'yes'})
 assert.match((await c.get(`${B}/account/profile`)).text,/name="sms_marketing" value="yes" checked/)
 await c.get(`${B}/checkout`);const review=await c.post(`${B}/checkout/delivery`,INFO)
 const account=await register(c);assert.equal(account.status,200);assert.doesNotMatch(account.text,/Parcel Locker 51/)
 assert.equal(path(await c.post(`${B}/checkout/payment`,{...CARD,review_token:fieldValue(review.text,'review_token')})),`${B}/checkout/delivery`)
 assert.doesNotMatch((await c.get(`${B}/account/addresses`)).text,/Parcel Locker 51|2 Test St/)
 assert.equal((await c.post(`${B}/account/addresses/action`,{id,action:'delete'})).status,404)
 await other.post(`${B}/account/login`,credentials);assert.doesNotMatch((await other.get(`${B}/account/addresses`)).text,/Parcel Locker 51/)
 await c.post(`${B}/account/login`,credentials);assert.match((await c.get(`${B}/account/profile`)).text,/value="Alexandra"/)
 await c.post(`${B}/account/addresses/action`,{id,action:'delete'});const rest=await c.get(`${B}/account/addresses`);assert.doesNotMatch(rest.text,/Parcel Locker 51/);assert.match(rest.text,/Office · Default/)
 await c.post(`${B}/account/logout`,{});assert.match((await c.get(`${B}/account/addresses`)).text,/EB World or Guest/)
 }finally{await s.close()}
})

test('EB wishlist sign-in resumption preserves exact variants; save/restore enforces current stock',async()=>{
 const s=await startServer(),p=browseProducts.find(p=>p.sku==='390021'),variant=p.variants.find(v=>v.id==='red'),stock=variant.stock
 try{const c=s.client();await c.get(`${B}/catalog/390021?variant=red`);assert.match((await c.get(`${B}/account/recent`)).text,/variant=red/)
 assert.equal((await c.post(`${B}/ebworld/wishlist/add`,{sku:p.sku,variant_id:'forged'})).status,400)
 assert.equal((await c.post(`${B}/ebworld/wishlist/add`,{sku:p.sku})).status,400)
 const gate=await c.post(`${B}/ebworld/wishlist/add`,{sku:p.sku,variant_id:'red'});assert.match(gate.text,/saved after you sign in/)
 const resumed=await c.post(`${B}/account/login`,credentials);assert.equal(path(resumed),`${B}/ebworld/wishlist`);assert.match(resumed.text,/Red/);assert.match(resumed.text,/A\$44\.95/)
 await c.post(`${B}/account/items`,{kind:'favorites',key:'390021:red',action:'cart'});let cart=await c.get(`${B}/cart`);assert.match(cart.text,/Red/)
 await c.post(`${B}/cart/save`,{key:'390021:red'});assert.match((await c.get(`${B}/cart`)).text,/Your cart is empty/)
 variant.stock=0;const failed=await c.post(`${B}/account/items`,{kind:'savedForLater',key:'390021:red',action:'cart'});assert.equal(failed.status,400);assert.match((await c.get(`${B}/account/saved`)).text,/Red/)
 variant.stock=stock;await c.post(`${B}/account/items`,{kind:'savedForLater',key:'390021:red',action:'cart'});cart=await c.get(`${B}/cart`);assert.match(cart.text,/Red/);assert.doesNotMatch((await c.get(`${B}/account/saved`)).text,/Trading Card Zip Binder/)
 await register(c);assert.doesNotMatch((await c.get(`${B}/ebworld/wishlist`)).text,/Trading Card Zip Binder/)
 await c.post(`${B}/account/login`,credentials);assert.match((await c.get(`${B}/ebworld/wishlist`)).text,/Trading Card Zip Binder/)
 }finally{variant.stock=stock;await s.close()}
})

test('EB preferred store persists per owner, changes PDP/checkout and invalidates payment details',async()=>{
 const s=await startServer();try{const c=s.client();assert.equal((await c.post(`${B}/stores/select`,{store_id:'forged'})).status,400);await c.post(`${B}/account/login`,credentials);await c.post(`${B}/stores/select`,{store_id:'brisbane'});assert.match((await c.get(`${B}/catalog/390014`)).text,/EB Games Brisbane · Available/)
 await c.post(`${B}/cart/add`,{sku:'390014'});const delivery=await c.get(`${B}/checkout`);assert.match(delivery.text,/value="brisbane" selected/)
 await c.post(`${B}/checkout/delivery`,{...INFO,method:'pickup',store_id:'brisbane'});await c.post(`${B}/stores/select`,{store_id:'melbourne'});assert.equal(path(await c.post(`${B}/checkout/payment`,CARD)),`${B}/checkout/delivery`)
 assert.match((await c.get(`${B}/checkout/delivery`)).text,/value="melbourne" selected/)
 await c.post(`${B}/account/logout`,{});assert.doesNotMatch((await c.get(`${B}/catalog/390014`)).text,/Melbourne · Available/)
 }finally{await s.close()}
})

test('EB owned orders require store, session and account; delivery cancellation updates details and receipt without refund',async()=>{
 const s=await startServer();try{const c=s.client(),other=s.client(),o=await place(c);const source=JSON.stringify({items:o.items,payment:o.payment,totals:o.totals})
 await other.post(`${B}/account/login`,credentials);assert.equal((await other.get(`${B}/account/orders/${o.id}`)).status,404);assert.equal((await other.post(`${B}/account/orders/${o.id}/cancel`,{reason:'Wrong item'})).status,404)
 await register(c);assert.equal((await c.get(`${B}/account/orders/${o.id}`)).status,404);assert.equal((await c.get(`${B}/confirmation/${o.order_number}`)).status,404);assert.doesNotMatch((await c.get(`${B}/account/order-history`)).text,new RegExp(o.order_number))
 assert.equal((await c.post(`${B}/help/contact`,{category:'Returns & faults',email:'second@example.com',subject:'Order help',message:'Please help with this order.',order_id:o.id})).status,400)
 await c.post(`${B}/account/login`,credentials);assert.equal((await c.post(`${B}/account/orders/${o.id}/cancel`,{reason:''})).status,400)
 const cancelled=await c.post(`${B}/account/orders/${o.id}/cancel`,{reason:'Ordered by mistake'});assert.match(cancelled.text,/This order is cancelled/);assert.doesNotMatch(cancelled.text,/has not been dispatched/)
 const receipt=await c.get(`${B}/confirmation/${o.order_number}`);assert.match(receipt.text,/No dispatch or collection is pending/);assert.doesNotMatch(receipt.text,/prepared for dispatch|Available products dispatch separately/)
 const after=getOrder(o.id);assert.equal(after.meta.lifecycle.length,1);assert.equal(JSON.stringify({items:after.items,payment:after.payment,totals:after.totals}),source)
 await c.post(`${B}/account/orders/${o.id}/cancel`,{reason:'again'});assert.equal(after.meta.lifecycle.length,1)
 const foreign=recordOrder({...o,store:'jb-hi-fi',order_number:'EB51FOREIGN',session:{id:o.session_id}});assert.equal((await c.get(`${B}/account/orders/${foreign.id}`)).status,404)
 }finally{await s.close()}
})

test('EB collection and ship-from-store cancellation restrictions, guest ownership and local support cases',async()=>{
 const s=await startServer();try{const c=s.client(),o=await place(c,{member:false,pickup:true,sku:'330056'})
 assert.match((await c.get(`${B}/account/orders/${o.id}`)).text,/one business day/);assert.equal((await c.post(`${B}/account/orders/${o.id}/cancel`,{reason:'change'})).status,400)
 assert.equal((await s.client().get(`${B}/account/orders/${o.id}`)).status,404)
 const help=await c.get(`${B}/help?q=damaged`);assert.match(help.text,/Damaged or defective items/);assert.doesNotMatch(help.text,/>Plan a trade-in</)
 const bad=await c.post(`${B}/help/contact`,{category:'Returns & faults',email:'guest51@example.com',subject:'Damaged item',message:'short'});assert.equal(bad.status,400);assert.match(bad.text,/Damaged item/)
 const support=await c.post(`${B}/help/contact`,{category:'Returns & faults',email:'guest51@example.com',subject:'Collection question',message:'Can the store explain my collection options?',order_id:o.id});assert.match(support.text,/Support request saved/);const casePath=path(support);assert.equal((await s.client().get(casePath)).status,404)
 await c.post(`${B}/account/login`,credentials);assert.equal((await c.get(casePath)).status,404);await c.post(`${B}/account/logout`,{});assert.equal((await c.get(casePath)).status,200)
 const delivery=await place(c,{member:false});getOrder(delivery.id).meta.ship_from_store=true;assert.equal((await c.post(`${B}/account/orders/${delivery.id}/cancel`,{reason:'change'})).status,400)
 for(const route of ['/trade-and-save','/reboot','/plus'])assert.equal((await c.get(B+route)).status,200)
 assert.match((await c.get(`${B}/reboot`)).text,/Repair bookings, quotes and shipping labels are not available/)
 }finally{await s.close()}
})
