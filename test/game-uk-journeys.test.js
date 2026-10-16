import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer, fieldValue } from './helpers.js'
import { byId } from '../stores/game-uk/data.js'
const ADDRESS={label:'Home',name:'Jamie Example',phone:'07700900123',line1:'10 Test Road',city:'London',postal_code:'SW1A 2AA'}
const DELIVERY={firstName:'Jamie',lastName:'Example',addressLine1:'10 Test Road',town:'London',postcode:'SW1A 2AA',mobile:'07700900123',country:'GB',deliveryMethod:'standard'}
const CARD={paymentMethod:'card',cardNumber:'4242424242424242',expiry:'12/29',cvv:'123',nameOnCard:'Jamie Example',billingSame:'1'}
const login=c=>c.post('/game-uk/account/login',{action:'signin',email:'tester@example.com',password:'Password123!',returnUrl:'/account'})
let accountSequence=0
const register=(c,email=`second-${++accountSequence}@example.com`,returnUrl='/account')=>c.post('/game-uk/account/login',{action:'register',email,password:'Password123!',firstName:'Second',lastName:'Shopper',returnUrl})
const ids=html=>[...new Set([...html.matchAll(/\/account\/addresses\/(address-[a-f0-9]+)\/edit/g)].map(m=>m[1]))]
const order=async(c,pid='756802',option='')=>{await c.post('/game-uk/cart/add',{pid,option,qty:'1',age_confirmed:'1'});const p=await c.post('/game-uk/checkout/delivery',DELIVERY);await c.post('/game-uk/checkout/payment',{...CARD,review_token:fieldValue(p.text,'review_token')});return (await c.json('/api/orders?store=game-uk')).at(-1)}

test('GAME account details/preferences persist for their owner and checkout clears on account changes',async()=>{
 const s=await startServer();try{const c=s.client();assert.match((await c.get('/game-uk/account/addresses')).url,/account\/login/);await login(c)
 assert.equal((await c.post('/game-uk/account/details',{first_name:'Jamie',last_name:'Example',phone:'bad'})).status,400)
 await c.post('/game-uk/account/details',{first_name:'Jamie',last_name:'Example',phone:'07700900123',email:'forged@example.com'});await c.post('/game-uk/account/preferences',{email:'yes'})
 assert.match((await c.get('/game-uk/account/details')).text,/tester@example.com/);assert.match((await c.get('/game-uk/account/preferences')).text,/name="email" value="yes" checked/)
 await c.post('/game-uk/cart/add',{pid:'992019',qty:'1'});const pay=await c.post('/game-uk/checkout/delivery',DELIVERY);assert.match(pay.text,/review_token/)
 await register(c);const cleared=await c.get('/game-uk/checkout/payment');assert.match(cleared.url,/checkout\/delivery/);assert.doesNotMatch(cleared.text,/10 Test Road/);assert.doesNotMatch((await c.get('/game-uk/account/preferences')).text,/value="yes" checked/)
 await login(c);assert.match((await c.get('/game-uk/account/details')).text,/value="Jamie"/);assert.match((await c.get('/game-uk/account/preferences')).text,/name="email" value="yes" checked/)
 const escaped=await c.post('/game-uk/account/login',{action:'signin',email:'tester@example.com',password:'Password123!',returnUrl:'/game-uk/../../amazon/'});assert.equal(new URL(escaped.url).pathname,'/game-uk/account')
 }finally{await s.close()}
})

test('GAME UK address CRUD, default and checkout picker reject foreign addresses and preserve validation fields',async()=>{
 const s=await startServer();try{const c=s.client();await login(c);const bad=await c.post('/game-uk/account/addresses',{...ADDRESS,postal_code:'00000'});assert.equal(bad.status,400);assert.match(bad.text,/value="10 Test Road"/)
 const first=await c.post('/game-uk/account/addresses',ADDRESS),a=ids(first.text)[0];assert.ok(a)
 const second=await c.post('/game-uk/account/addresses',{...ADDRESS,label:'Office',line1:'20 Office Road',postal_code:'GIR 0AA'}),b=ids(second.text)[1];assert.ok(b)
 await c.post(`/game-uk/account/addresses/${b}/default`);await c.post('/game-uk/cart/add',{pid:'992019',qty:'1'});let d=await c.get('/game-uk/checkout/delivery');assert.match(d.text,/value="20 Office Road"/);assert.match(d.text,/value="GIR 0AA"/)
 d=await c.get(`/game-uk/checkout/delivery?address_id=${a}`);assert.match(d.text,/value="10 Test Road"/);assert.equal((await c.get('/game-uk/checkout/delivery?address_id=forged')).status,404)
 await c.post('/game-uk/account/addresses',{...ADDRESS,id:a,line1:'Updated Road'});assert.match((await c.get(`/game-uk/account/addresses/${a}/edit`)).text,/Updated Road/)
 await register(c);assert.equal((await c.get(`/game-uk/account/addresses/${a}/edit`)).status,404);assert.equal((await c.post(`/game-uk/account/addresses/${a}/delete`)).status,404);assert.equal((await c.get(`/game-uk/checkout/delivery?address_id=${a}`)).status,404)
 await login(c);await c.post(`/game-uk/account/addresses/${b}/delete`);const remaining=await c.get('/game-uk/account/addresses');assert.match(remaining.text,/Home · Default/);assert.doesNotMatch(remaining.text,/20 Office Road/)
 }finally{await s.close()}
})

test('GAME wish list preserves exact choices and quantity, restores only valid stock, and resumes through registration',async()=>{
 const s=await startServer();const p=byId('992023'),stock=p.stock
 try{const c=s.client();await c.get('/game-uk/'+p.slug);for(const option of ['black','red'])await c.post('/game-uk/wishlist/add',{pid:p.id,option})
 assert.equal((await c.post('/game-uk/wishlist/remove',{pid:p.id})).status,404)
 await c.post('/game-uk/wishlist/remove',{pid:p.id,option:'black'});let w=await c.get('/game-uk/wishlist');assert.match(w.text,/Colour: Red/);assert.doesNotMatch(w.text,/Colour: Black/)
 await register(c,'wishes@example.com','/wishlist');w=await c.get('/game-uk/wishlist');assert.match(w.text,/Colour: Red/)
 p.stock=0;assert.equal((await c.post('/game-uk/wishlist/move',{pid:p.id,option:'red'})).status,400);assert.match((await c.get('/game-uk/wishlist')).text,/Colour: Red/);p.stock=stock
 let bag=await c.post('/game-uk/wishlist/move',{pid:p.id,option:'red'});assert.match(bag.text,/Colour: Red/);assert.match((await c.get('/game-uk/wishlist')).text,/wish list is empty/)
 await c.post('/game-uk/cart/update',{line:'1',action:'inc'});await c.post('/game-uk/cart/update',{line:'1',action:'wishlist'});w=await c.get('/game-uk/wishlist');assert.match(w.text,/Quantity 2/);bag=await c.post('/game-uk/wishlist/move',{pid:p.id,option:'red'});assert.match(bag.text,/£35\.98/)
 await c.post('/game-uk/wishlist/add',{pid:'756802'});assert.equal((await c.post('/game-uk/wishlist/move',{pid:'756802'})).status,400)
 await c.get('/game-uk/'+p.slug);assert.match((await c.get('/game-uk/recently-viewed')).text,/Trading Card Binder/);await c.post('/game-uk/recently-viewed');assert.doesNotMatch((await c.get('/game-uk/recently-viewed')).text,/class="gu-saved-item"/)
 await login(c);assert.doesNotMatch((await c.get('/game-uk/wishlist')).text,/class="gu-saved-item"/)
 }finally{p.stock=stock;await s.close()}
})

test('GAME owned order details and cancellation enquiries keep preorder intact and reject cross-session/account access',async()=>{
 const s=await startServer();try{const c=s.client();await login(c);const o=await order(c)
 const detail=await c.get('/game-uk/orders/'+o.id);assert.match(detail.text,/Pre-order received/);assert.match(detail.text,/Request pre-order cancellation/);assert.match((await c.get('/game-uk/accountinformation/orderhistorysummary')).text,new RegExp(o.order_number))
 const short=await c.post(`/game-uk/orders/${o.id}/request`,{message:'Too short'});assert.equal(short.status,400);assert.match(short.text,/Too short/)
 const saved=await c.post(`/game-uk/orders/${o.id}/request`,{message:'Please enquire about cancelling this pre-order.'});assert.match(saved.text,/No cancellation, return or refund has been approved/);const casePath=new URL(saved.url).pathname
 const referenced=await c.post('/game-uk/contact',{category:'Order enquiry',subject:'Order number reference',message:'Please check this locally owned order reference.',order_id:o.order_number});assert.match(referenced.text,new RegExp('/orders/'+o.id));assert.match((await c.get('/game-uk/orders/'+o.id)).text,/Order number reference/);
 const after=(await c.json('/api/orders?store=game-uk')).at(-1);assert.deepEqual(after.items,o.items);assert.equal(after.meta.lifecycle,undefined)
 const other=s.client();await login(other);assert.equal((await other.get('/game-uk/orders/'+o.id)).status,404);assert.doesNotMatch((await other.get('/game-uk/account/orders')).text,new RegExp(o.order_number));assert.equal((await other.get(casePath)).status,404)
 await register(c);assert.equal((await c.get('/game-uk/orders/'+o.id)).status,404);assert.equal((await c.post(`/game-uk/orders/${o.id}/request`,{message:'Forged request should never work.'})).status,404);assert.equal((await c.get(casePath)).status,404)
 const forged=await c.post('/game-uk/contact',{category:'Order enquiry',subject:'Test',message:'This should not bind a different account order.',order_id:o.id});assert.equal(forged.status,400)
 await c.get('/game-uk/logout');assert.equal((await c.get('/game-uk/orders/'+o.id)).status,404)
 }finally{await s.close()}
})

test('GAME help search, category/article and local case validation/ownership work; closed services stay informational',async()=>{
 const s=await startServer();try{const c=s.client();assert.match((await c.get('/game-uk/help?q=pre-order')).text,/preorder-cancellation/);assert.match((await c.get('/game-uk/help?q=zzzxqq')).text,/No articles found/)
 for(const route of ['help/categories/account','help/articles/reward-elite','frasersplus'])assert.equal((await c.get('/game-uk/'+route)).status,200)
 assert.match((await c.get('/game-uk/help/articles/reward-elite')).text,/31 July 2024/)
 const invalid=await c.post('/game-uk/contact',{category:'forged',email:'guest@example.com',subject:'Keep this subject',message:'A helpful detailed message.'});assert.equal(invalid.status,400);assert.match(invalid.text,/Keep this subject/)
 const ok=await c.post('/game-uk/contact',{category:'Store feedback',email:'guest@example.com',subject:'Store visit',message:'Please note this local store visit feedback.'});assert.match(ok.text,/we have received your request/);assert.doesNotMatch(ok.text,/saved locally/);const path=new URL(ok.url).pathname;assert.equal((await s.client().get(path)).status,404)
 await login(c);assert.equal((await c.get(path)).status,404);assert.doesNotMatch((await c.get('/game-uk/contact/requests')).text,/Store visit/)
 }finally{await s.close()}
})

test('GAME town/postcode/area store finder selection prefills an eligible collection order',async()=>{
 const s=await startServer();try{const c=s.client();await login(c);assert.match((await c.get('/game-uk/stores?q=London')).text,/1 store found/);assert.match((await c.get('/game-uk/stores?q=W1D+1BS')).text,/1 store found/);assert.match((await c.get('/game-uk/stores?area=Scotland')).text,/1 store found/);assert.match((await c.get('/game-uk/stores?q=Atlantis')).text,/No stores match/)
 assert.equal((await c.post('/game-uk/stores/forged/select')).status,404);assert.match((await c.get('/game-uk/stores/london')).text,/Opening hours/);await c.post('/game-uk/stores/london/select');await c.post('/game-uk/cart/add',{pid:'992019',qty:'1'})
 assert.match((await c.get('/game-uk/checkout/delivery')).text,/value="GAME London[^\"]*" selected/)
 await register(c);assert.doesNotMatch((await c.get('/game-uk/stores')).text,/Your preferred store/)
 }finally{await s.close()}
})

test('GAME registration stays under the configured CAPTCHA boundary',async()=>{
 const s=await startServer({captcha:{mode:'on',stores:['game-uk']}});try{const c=s.client();const r=await c.post('/game-uk/account/login',{action:'register',email:'boundary@example.com',password:'Password123!',firstName:'Check',lastName:'Boundary'});assert.match(r.text,/Security check/);assert.equal((await c.get('/game-uk/account/register')).status,404)}finally{await s.close()}
})
