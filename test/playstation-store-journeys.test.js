import test from 'node:test'
import assert from 'node:assert/strict'
import {startServer,fieldValue} from './helpers.js'
import {PRODUCTS} from '../stores/playstation-store/data.js'
const S='/playstation-store',C=`${S}/en-us/checkout`,SIGNIN=`${S}/my.account.sony.com/central/signin/`,SIGNUP=`${S}/my.account.sony.com/central/signup/`
const login=(c,extra={})=>c.post(SIGNIN,{step:'password',email:'tester@example.com',password:'Password123!',...extra})
let accountSequence=0
const signup=(c,email=`journeys65-${++accountSequence}@example.com`)=>c.post(SIGNUP,{dob:'1990-01-01',state:'FL',email,password:'Secret123',onlineId:'JourneyPlayer',firstName:'Second',lastName:'Player',terms:'1'})
const buy=async(c,sku,preorder=false)=>{
 const route=preorder?`${C}/buynow/${sku}`:C
 await c.post(`${S}/en-us/${preorder?'preorder':'cart/add'}`,{sku})
 const review=await c.post(`${route}/payment/service`,{service:'paypal'})
 return c.post(route,{paymentMethod:'paypal',review_token:fieldValue(review.text,'review_token')})
}
const request={downloaded:'no',launched:'not-applicable',faulty:'no',reason:'I would like to cancel this purchase.',ack:'yes'}
test('PlayStation account: wishlist auth resumes once and state isolates account switches and sessions',async()=>{
 const srv=await startServer();try{
 const c=srv.client(),sku='BENCH-POCKET-GARDEN',target=`${S}/en-us/product/${sku}`
 const wall=await c.post(`${S}/en-us/wishlist`,{sku,returnTo:target});assert.match(wall.text,/<h1>Sign In<\/h1>/)
 const signed=await login(c,{redirect_uri:fieldValue(wall.text,'redirect_uri')});assert.match(signed.text,/Remove from Wishlist/)
 assert.match((await c.get(`${S}/en-us/wishlist`)).text,/1 saved item/)
 await c.post(`${S}/en-us/wishlist`,{sku});assert.match((await c.get(`${S}/en-us/wishlist`)).text,/1 saved item/)
 const profile=await c.post(`${S}/en-us/account/profile`,{first_name:'Taylor',last_name:'Player',console:'PS4',activity:'private',offers:'no'})
 assert.match(profile.text,/Your preferences have been saved/);assert.match(profile.text,/value="Taylor"/)
 await signup(c)
 assert.match((await c.get(`${S}/en-us/wishlist`)).text,/0 saved items/)
 assert.doesNotMatch((await c.get(`${S}/en-us/account/profile`)).text,/value="Taylor"/)
 await login(c);assert.match((await c.get(`${S}/en-us/account/profile`)).text,/value="Taylor"/)
 await c.get(`${S}/logout`);await login(c);assert.match((await c.get(`${S}/en-us/wishlist`)).text,/1 saved item/)
 const other=srv.client();await login(other);assert.match((await other.get(`${S}/en-us/wishlist`)).text,/0 saved items/)
 await c.post(`${S}/en-us/wishlist`,{sku,action:'remove'});assert.match((await c.get(`${S}/en-us/wishlist`)).text,/0 saved items/)
 assert.equal((await c.post(`${S}/en-us/wishlist`,{sku:'__proto__'})).status,400)
 const repeated=new URLSearchParams({first_name:'Safe',last_name:'Player',activity:'private',offers:'no'});repeated.append('console','PS4');repeated.append('console','PS5')
 const bad=await c.post(`${S}/en-us/account/profile`,repeated);assert.equal(bad.status,400);assert.match(bad.text,/value="Safe"/)
 assert.match((await c.get(`${S}/en-us/account`)).headers.get('cache-control'),/no-store/)
 }finally{await srv.close()}
})
test('PlayStation library: digital rights distinguish base, bundled DLC, currency and release-locked preorder',async()=>{
 const srv=await startServer();try{
 const c=srv.client();await login(c)
 await buy(c,'BENCH-POCKET-GARDEN-DELUXE');await buy(c,'UP1004-CUSA00419_00-GTAVCASHPACK0004');await buy(c,'EP1004-PPSA01547_00-GTAVISTANDARD001',true)
 const library=await c.get(`${S}/en-us/library`);assert.match(library.text,/5 items/)
 const dlc=await c.get(`${S}/en-us/library/BENCH-POCKET-GARDEN-GREENHOUSE`);assert.match(dlc.text,/Included in edition/);assert.match(dlc.text,/compatible digital base license is present/)
 const currency=await c.get(`${S}/en-us/library/UP1004-CUSA00419_00-GTAVCASHPACK0004`);assert.match(currency.text,/service entitlement, not a downloadable game file/);assert.match(currency.text,/No compatible digital base license/)
 const pre=await c.get(`${S}/en-us/library/EP1004-PPSA01547_00-GTAVISTANDARD001`);assert.match(pre.text,/remains locked until 11\/18\/2026/);assert.match(pre.text,/No download or preload has started/)
 const filtered=await c.get(`${S}/en-us/library?platform=PS4&kind=add-on&q=greenhouse`);assert.match(filtered.text,/1 item/);assert.match(filtered.text,/Autumn Greenhouse/)
 assert.equal((await c.get(`${S}/en-us/library/BENCH-MINECRAFT`)).status,404)
 const stranger=srv.client();await login(stranger);assert.equal((await stranger.get(`${S}/en-us/library/BENCH-POCKET-GARDEN-DELUXE`)).status,404)
 await signup(c);assert.equal((await c.get(`${S}/en-us/library/BENCH-POCKET-GARDEN-DELUXE`)).status,404)
 }finally{await srv.close()}
})
test('PlayStation transactions: private details, date filters, pending refund and idempotent requests preserve payment',async()=>{
 const srv=await startServer();try{
 const c=srv.client();await login(c);const done=await buy(c,'BENCH-POCKET-GARDEN')
 const [o]=await c.json('/api/orders?store=playstation-store'),route=`${S}/en-us/transactions/${o.id}`
 const detail=await c.get(route);assert.match(detail.text,/\$16\.04/);assert.match(detail.text,/PayPal/)
 assert.match((await c.get(`${S}/en-us/transactions?from=2000-01-01&to=2001-01-01`)).text,/No transactions/)
 assert.equal((await c.get(`${S}/en-us/transactions?from=2026-02-30&to=2026-03-01`)).status,400)
 const bad=await c.post(`${route}/request`,{...request,sku:'wrong',reason:'Keep this safe reason'});assert.equal(bad.status,400);assert.match(bad.text,/Keep this safe reason/)
 const sent=await c.post(`${route}/request`,{...request,sku:'BENCH-POCKET-GARDEN'});assert.match(sent.text,/Pending eligibility review/);assert.match(sent.text,/no bank refund has been issued/)
 const repeated=await c.post(`${route}/request`,{...request,sku:'BENCH-POCKET-GARDEN'});assert.equal(repeated.url,sent.url)
 assert.deepEqual(await c.json('/api/orders?store=playstation-store'),[o])
 assert.equal((await c.get(done.url)).status,200)
 const stranger=srv.client();await login(stranger);assert.equal((await stranger.get(route)).status,404);assert.equal((await stranger.post(`${route}/request`,{...request,sku:'BENCH-POCKET-GARDEN'})).status,404);assert.equal((await stranger.get(sent.url)).status,404)
 await signup(c);assert.equal((await c.get(route)).status,404);assert.equal((await c.get(sent.url)).status,404)
 }finally{await srv.close()}
})
test('PlayStation refund: preorder cancellation remains pending; consumed currency needs review',async()=>{
 const srv=await startServer();try{
 const c=srv.client();await login(c);const sku='EP1004-PPSA01547_00-GTAVISTANDARD001';await buy(c,sku,true)
 const [o]=await c.json('/api/orders?store=playstation-store')
 const sent=await c.post(`${S}/en-us/transactions/${o.id}/request`,{...request,sku});assert.match(sent.text,/Pre-order cancellation request/);assert.match(sent.text,/Pending eligibility review/)
 assert.match((await c.get(`${S}/en-us/library/${sku}`)).text,/Your entitlement has not been revoked/)
 const currency='UP1004-CUSA00419_00-GTAVCASHPACK0004';await buy(c,currency)
 const orders=await c.json('/api/orders?store=playstation-store'),co=orders[1]
 assert.equal((await c.post(`${S}/en-us/transactions/${co.id}/request`,{...request,sku:currency})).status,400)
 const consumed=await c.post(`${S}/en-us/transactions/${co.id}/request`,{...request,sku:currency,launched:'yes'});assert.match(consumed.text,/Needs support review/)
 assert.deepEqual((await c.json('/api/orders?store=playstation-store'))[0],o)
 }finally{await srv.close()}
})
test('PlayStation support: searchable articles, safe validation, private cases and follow-up',async()=>{
 const srv=await startServer();try{
 const c=srv.client(),search=await c.get(`${S}/en-us/support?q=currency`);assert.match(search.text,/Add-ons and in-game currency/)
 assert.match((await c.get(`${S}/en-us/support?q=nonexistentxyz`)).text,/No articles found/)
 await login(c)
 const bad=await c.post(`${S}/en-us/support/contact`,{category:'Downloads and licenses',subject:'Missing game',message:'Help find my purchase.',order_id:'another-order'})
 assert.equal(bad.status,400);assert.match(bad.text,/Help find my purchase/)
 const sent=await c.post(`${S}/en-us/support/contact`,{category:'Downloads and licenses',subject:'Missing game',message:'My console cannot find my purchased game.'})
 assert.match(sent.text,/Received — pending support review/);assert.match(sent.text,/No message has been sent to PlayStation/)
 const follow=await c.post(sent.url,{message:'I checked the account on my PS5 console.'});assert.match(follow.text,/checked the account/)
 const stranger=srv.client();await login(stranger);assert.equal((await stranger.get(sent.url)).status,404);assert.equal((await stranger.post(sent.url,{message:'I should not add this note.'})).status,404)
 await signup(c);assert.equal((await c.get(sent.url)).status,404)
 }finally{await srv.close()}
})
test('PlayStation Plus: renewal cancellation retains period, tier access is temporary, purchase rights stay separate',async()=>{
 const srv=await startServer();try{
 const c=srv.client();await login(c)
 assert.match((await c.get(`${S}/en-us/membership`)).text,/No active membership/)
 assert.equal((await c.post(`${S}/en-us/membership`,{tier:'__proto__',ack:'yes'})).status,400)
 const game=PRODUCTS.find(p=>p.fictional&&p.plusTag==='Extra')
 assert.equal((await c.post(`${S}/en-us/membership/claim`,{sku:game.id})).status,400)
 const start=await c.post(`${S}/en-us/membership`,{tier:'Extra'});assert.match(start.text,/Extra · Active/)
 const added=await c.post(`${S}/en-us/membership/claim`,{sku:game.id});assert.match(added.text,/Subscription access/)
 assert.equal((await c.post(`${S}/en-us/membership/claim`,{sku:'EP1004-PPSA01547_00-GTAVISTANDARD001'})).status,400)
 const cancelled=await c.post(`${S}/en-us/membership/renewal`,{action:'cancel'});assert.match(cancelled.text,/Access continues until the current period ends/)
 assert.match((await c.get(`${S}/en-us/library/${game.id}`)).text,/Subscription access<\/p>/)
 assert.match((await c.post(`${S}/en-us/membership/renewal`,{action:'reactivate'})).text,/Renewal preference<\/dt><dd>On/)
 await c.post(`${S}/en-us/membership`,{tier:'Essential'})
 assert.match((await c.get(`${S}/en-us/library/${game.id}`)).text,/Subscription access ended/)
 assert.deepEqual(await c.json('/api/orders?store=playstation-store'),[])
 await buy(c,game.id);const purchased=await c.get(`${S}/en-us/library/${game.id}`);assert.match(purchased.text,/<h2>Purchased<\/h2>/);assert.doesNotMatch(purchased.text,/Subscription access ended/)
 const other=srv.client();await login(other);assert.match((await other.get(`${S}/en-us/membership`)).text,/No active membership/)
 await signup(c);assert.match((await c.get(`${S}/en-us/membership`)).text,/No active membership/)
 }finally{await srv.close()}
})

test('PlayStation account actions: safe return paths and removal of a payment method invalidate checkout',async()=>{
 const srv=await startServer();try{
 const c=srv.client()
 const redirected=await c.post(SIGNIN,{step:'password',email:'tester@example.com',password:'Password123!',redirect_uri:`${S}/../amazon/`})
 assert.equal(redirected.url,`${srv.base}${S}/`)
 await c.post(`${S}/en-us/cart/add`,{sku:'BENCH-POCKET-GARDEN'})
 const review=await c.post(`${C}/payment/service`,{service:'paypal'}),token=fieldValue(review.text,'review_token')
 assert.match((await c.get(`${S}/en-us/payment-management`)).text,/PayPal/)
 assert.equal((await c.post(`${S}/en-us/payment-management/remove`,{id:'foreign-card'})).status,404)
 const removed=await c.post(`${S}/en-us/payment-management/remove`,{id:'paypal'});assert.match(removed.text,/No saved payment methods/)
 assert.equal((await c.post(C,{paymentMethod:'paypal',review_token:token})).status,409)
 assert.deepEqual(await c.json('/api/orders?store=playstation-store'),[])
 }finally{await srv.close()}
})
