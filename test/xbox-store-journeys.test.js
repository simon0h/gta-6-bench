import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer, fieldValue } from './helpers.js'
import { byId, productPath } from '../stores/xbox-store/data.js'
import { listOrders, recordOrder } from '../lib/orders.js'

const B='/xbox-store',path=id=>productPath(B,byId(id)),st=p=>fieldValue(p.text,'service_token')
async function login(c,email='tester@example.com') {await c.post(B+'/login.live.com/oauth20_authorize.srf',{loginfmt:email});await c.post(B+'/login.live.com/password.srf',{passwd:'Password123!'});return c.post(B+'/login.live.com/kmsi.srf',{kmsi:'yes'})}
let accountNumber=0
async function otherAccount(c){return c.post(B+'/signup.live.com/signup',{email:`journey69-${++accountNumber}@example.com`,password:'Password123!',firstName:'Other',lastName:'Shopper',birthMonth:'1',birthDay:'2',birthYear:'1990'})}
async function buy(c,id){const pay=await c.get(path(id)+'/buy');const conf=await c.post(path(id)+'/buy',{payment_token:fieldValue(pay.text,'payment_token'),pi:'new',payType:'paypal'});assert.equal(conf.status,200);const done=await c.post(path(id)+'/buy/confirm',{confirm_token:fieldValue(conf.text,'confirm_token')});assert.equal(done.status,200);return done}
async function action(c,id,name,reason){const route=B+'/account/billing/orders/'+id+'/'+name;const form=await c.get(route);assert.equal(form.status,200);const review=await c.post(route,{reason,service_token:st(form)});assert.equal(review.status,200);const result=await c.post(route+'/confirm',{service_token:st(review)});return {result,route,review}}

test('Xbox journeys: wishlist resumes through identity and profile/preferences stay account and session owned',async()=>{
 const srv=await startServer();try{
  const c=srv.client();const wall=await c.post(B+'/en-US/wishlist',{pid:'cuphead'});assert.match(wall.url,/login.live/)
  const resumed=await login(c);assert.match(resumed.url,/en-US\/wishlist$/);assert.match(resumed.text,/<h2>Cuphead<\/h2>/)
  let p=await c.get(B+'/account/profile')
  const saved=await c.post(B+'/account/profile',{service_token:st(p),first_name:'Jamie',last_name:'Player',language:'Spanish',notifications:'on'})
  assert.match(saved.text,/changes have been saved/);assert.match(saved.text,/value="Jamie"/)
  p=await c.get(B+'/account/profile');const oldWish=await c.get(B+'/en-US/wishlist');await otherAccount(c)
  assert.equal((await c.post(B+'/en-US/wishlist',{pid:'cuphead',action:'remove',service_token:st(oldWish)})).status,409)
  assert.match((await c.get(B+'/en-US/wishlist')).text,/wish list is empty/)
  assert.equal((await c.post(B+'/account/profile',{service_token:st(p),first_name:'Injected',last_name:'User',language:'English',notifications:'off'})).status,409)
  assert.doesNotMatch((await c.get(B+'/account/profile')).text,/value="Jamie"/)
  await c.get(B+'/signout');await login(c)
  assert.match((await c.get(B+'/account/profile')).text,/value="Jamie"/)
  assert.match((await c.get(B+'/en-US/wishlist')).text,/<h2>Cuphead<\/h2>/)
  const second=srv.client();await login(second);assert.match((await second.get(B+'/en-US/wishlist')).text,/wish list is empty/)
  const wishlist=await c.get(B+'/en-US/wishlist');const removed=await c.post(B+'/en-US/wishlist',{pid:'cuphead',action:'remove',service_token:st(wishlist)});assert.match(removed.text,/wish list is empty/)
  assert.equal((await c.post(B+'/en-US/wishlist',{pid:'forged'})).status,400)
 }finally{await srv.close()}
})

test('Xbox journeys: typed library uses trusted records, permanent licenses reject duplicates, currency repeats',async()=>{
 const srv=await startServer();try{
  const c=srv.client();await login(c);await buy(c,'cuphead');await buy(c,'cuphead-last-course');await buy(c,'minecraft-minecoins');await buy(c,'minecraft-minecoins')
  assert.match((await c.get(path('cuphead'))).text,/YOU OWN THIS/)
  assert.equal((await c.post(path('cuphead')+'/preorder')).status,409)
  assert.equal((await c.post(B+'/en-US/cart/add',{pid:'cuphead'})).status,409)
  assert.equal((await c.post(path('cuphead')+'/buy/confirm')).status,409)
  const dlc=await c.get(B+'/account/library?type=dlc');assert.match(dlc.text,/Add-on license/);assert.doesNotMatch(dlc.text,/class="xb-license-status">Owned game/)
  const currency=await c.get(B+'/account/library/minecraft-minecoins');assert.match(currency.text,/3200 currency units purchased across 2 transactions/)
  const other=srv.client();await login(other);assert.equal((await other.get(B+'/account/library/cuphead')).status,404)
  await otherAccount(c);assert.equal((await c.get(B+'/account/library/cuphead')).status,404)
  assert.equal((await c.json('/api/orders?store=xbox-store')).length,4)
 }finally{await srv.close()}
})

test('Xbox journeys: private transaction details, reviewed refunds and replay guards retain immutable totals',async()=>{
 const srv=await startServer();try{
  const c=srv.client();await login(c);const receipt=await buy(c,'cuphead');const [o]=listOrders({store:'xbox-store'}),snapshot=JSON.stringify({items:o.items,payment:o.payment,totals:o.totals})
  const outsider=srv.client();await login(outsider);const route=B+'/account/billing/orders/'+o.order_number
  const foreign=recordOrder({...o,store:'another-store',order_number:'FOREIGN69',session:{id:o.session_id},meta:{...o.meta}})
  assert.equal((await c.get(B+'/account/billing/orders/'+foreign.order_number)).status,404)
  assert.equal((await outsider.get(route)).status,404);assert.equal((await outsider.get(receipt.url)).status,404)
  assert.equal((await outsider.post(route+'/refund/confirm',{service_token:'forged'})).status,404)
  const denied=await c.post(route+'/refund/confirm',{service_token:'forged'});assert.equal(denied.status,409)
  const {result,review}=await action(c,o.order_number,'refund','Technical issue');assert.match(result.text,/Refund requested — pending review/);assert.match(result.text,/No refund has been issued/)
  assert.equal((await c.post(route+'/refund/confirm',{service_token:st(review)})).status,409)
  assert.equal(o.meta.lifecycle.length,1);assert.equal(JSON.stringify({items:o.items,payment:o.payment,totals:o.totals}),snapshot)
  assert.match((await c.get(B+'/account/library')).text,/<h2>Cuphead<\/h2>/)
  assert.match((await c.get(receipt.url)).text,/Refund requested — pending review/)
  await otherAccount(c);assert.equal((await c.get(route)).status,404)
 }finally{await srv.close()}
})

test('Xbox journeys: preorder cancellation removes reserved access, receipt copy follows state, consumed/free actions excluded',async()=>{
 const srv=await startServer();try{
  const c=srv.client();await login(c);const receipt=await buy(c,'9p3h4968grsm');const [o]=listOrders({store:'xbox-store'})
  assert.match((await c.get(B+'/account/library?type=preorder')).text,/unlocks 11\/18\/2026/)
  const {result}=await action(c,o.order_number,'cancel','Changed my mind');assert.match(result.text,/Pre-order cancelled/)
  assert.equal((await c.get(B+'/account/library/9p3h4968grsm')).status,404)
  const amended=await c.get(receipt.url);assert.match(amended.text,/reserved licenses are removed/);assert.doesNotMatch(amended.text,/Pre-order unlock dates/)
  assert.equal(o.items[0].kind,'game');assert.equal(o.totals.total,85.59)
  await buy(c,'minecraft-minecoins');await buy(c,'roblox')
  for(const denied of listOrders({store:'xbox-store'}).slice(1))assert.equal((await c.get(B+'/account/billing/orders/'+denied.order_number+'/refund')).status,409)
 }finally{await srv.close()}
})

test('Xbox journeys: Game Pass plan and renewal actions preserve access, reject forged plans and switched-account tokens',async()=>{
 const srv=await startServer();try{
  const c=srv.client();let wall=await c.get(B+'/account/services/join?plan=Ultimate');assert.match(wall.url,/login.live/);const resumed=await login(c);assert.match(resumed.text,/Review Game Pass plan/)
  assert.equal((await c.post(B+'/account/services/join',{plan:'__proto__',service_token:st(resumed)})).status,400)
  let active=await c.post(B+'/account/services/join',{plan:'Ultimate',service_token:st(resumed)});assert.match(active.text,/Recurring billing on/)
  assert.equal((await c.post(B+'/account/services/join',{plan:'Ultimate',service_token:st(resumed)})).status,409)
  const off=await c.post(B+'/account/services/renewal',{action:'off',service_token:st(active)});assert.match(off.text,/Recurring billing off/)
  assert.match((await c.get(B+'/account/library?type=subscription')).text,/Game Pass Ultimate access through/)
  const before=st(off);await otherAccount(c)
  assert.equal((await c.post(B+'/account/services/renewal',{action:'on',service_token:before})).status,409)
  assert.match((await c.get(B+'/account/services')).text,/no active Game Pass subscription/)
  assert.deepEqual(await c.json('/api/orders?store=xbox-store'),[])
 }finally{await srv.close()}
})

test('Xbox journeys: searchable support, private cases and redemption guidance validate inputs without code redemption',async()=>{
 const srv=await startServer();try{
  const c=srv.client();const results=await c.get(B+'/en-US/support?q=refund');assert.match(results.text,/Purchases, pre-orders and refunds/);assert.doesNotMatch(results.text,/<h2>Accessibility/)
  assert.match((await c.get(B+'/en-US/support?q=zxnotopic')).text,/No articles found/)
  await login(c);const form=await c.get(B+'/en-US/support/contact')
  const bad=await c.post(B+'/en-US/support/contact',{category:'installation',subject:'Install issue',message:'Please help me install the game',order_id:'forged',service_token:st(form)});assert.equal(bad.status,400);assert.match(bad.text,/Please help me install/)
  const secret=await c.post(B+'/en-US/support/contact',{category:'installation',subject:'Install issue',message:'Card number: 4242424242424242',service_token:st(bad)});assert.equal(secret.status,400);assert.doesNotMatch(secret.text,/4242424242424242/)
  const password=await c.post(B+'/en-US/support/contact',{category:'forged',subject:'Help',message:'Password123!',service_token:st(secret)});assert.equal(password.status,400);assert.doesNotMatch(password.text,/Password123!/)
  const done=await c.post(B+'/en-US/support/contact',{category:'installation',subject:'Install issue',message:'Please help me find my add-on',service_token:st(password)});assert.match(done.text,/Case received — pending review/)
  assert.equal((await c.post(B+'/en-US/support/contact',{category:'installation',subject:'Replay',message:'Replay request',service_token:st(password)})).status,409)
  const other=srv.client();await login(other);assert.equal((await other.get(done.url)).status,404)
  await otherAccount(c);assert.equal((await c.get(done.url)).status,404)
  assert.equal((await c.post(B+'/en-US/redeem',{code:'BAD'})).status,400)
  const code='AAAAA-BBBBB-CCCCC-DDDDD-EEEEE';const checked=await c.post(B+'/en-US/redeem',{code});assert.match(checked.text,/No balance or license has been added/);assert.doesNotMatch(checked.text,new RegExp(code))
  for(const p of ['privacy','terms'])assert.equal((await c.get(B+'/en-US/'+p)).status,200)
 }finally{await srv.close()}
})
