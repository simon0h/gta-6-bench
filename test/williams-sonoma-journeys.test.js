import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer, fieldValue } from './helpers.js'
import { getOrder } from '../lib/orders.js'
import { products, candidateVariants } from '../stores/williams-sonoma/catalog.js'
import { recipes } from '../stores/williams-sonoma/journey-content.js'

const base='/williams-sonoma'
const login=c=>c.post(base+'/account',{email:'tester@example.com',password:'Password123!'})
const register=(c,email)=>c.post(base+'/account',{mode:'register',email,password:'OtherPass123!',first_name:'Other',last_name:'Cook'})
const address={label:'Kitchen home',name:'Alex Cook',line1:'18 Market Street',line2:'Unit 2',city:'Austin',state:'TX',postal_code:'78701',phone:'555-111-2222',is_default:'yes'}
const buyer={email:'buyer@example.com',first_name:'Alex',last_name:'Cook',address:'18 Market Street',city:'Austin',state:'TX',postal_code:'78701',card_name:'Alex Cook',card_number:'4242424242424242',card_expiry:'12/39',card_cvv:'123'}
const formOptions=v=>Object.fromEntries(Object.entries(v.options).map(([k,x])=>[`option_${k}`,x]))
const pathOf=page=>new URL(page.url).pathname
async function registry(c){const r=await c.post(base+'/account/registries',{name:'Autumn gathering',event:'Wedding',event_date:'2027-10-12',notes:'Private registry secret'});assert.equal(r.status,200);return pathOf(r)}
async function buy(c){await c.post(base+'/cart/add',{id:'skillet',qty:'2',option_Finish:'Brushed steel'});const review=await c.get(base+'/checkout');const result=await c.post(base+'/checkout',{...buyer,checkout_token:fieldValue(review.text,'checkout_token')});assert.equal(result.status,200);return getOrder(pathOf(result).split('/').at(-1))}

// These are boundary and end-to-end checks, not snapshots of implementation markup.
test('Williams Sonoma recipes contain original instructions and real available tool selections',async()=>{
  assert.equal(recipes.length,6)
  for(const r of recipes){assert.ok(r.ingredients.length>=4);assert.ok(r.steps.length>=3);assert.ok(r.servings>0&&r.prep>0&&r.cook>0);for(const id of r.tools){const p=products.find(p=>p.id===id);assert.ok(p,`${r.id}: ${id}`);assert.ok(candidateVariants(p).some(v=>v.available&&v.stock>0))}}
  const srv=await startServer();try{const c=srv.client();for(const r of recipes){const p=await c.get(base+'/recipes/'+r.id);assert.equal(p.status,200);assert.match(p.text,/Tools for this recipe/);for(const id of r.tools)assert.ok(p.text.includes('/product/'+id))}assert.match((await c.get(base+'/recipes?course=Drinks')).text,/1 recipes/);assert.match((await c.get(base+'/recipes?q=not-a-recipe')).text,/0 recipes/)}finally{await srv.close()}
})

test('Williams Sonoma profile, preferences and address CRUD survive relogin and isolate switched accounts',async()=>{
 const srv=await startServer();try{const c=srv.client();await login(c)
  let r=await c.post(base+'/account/profile',{first_name:'<script>cook</script>',last_name:'',phone:'bad'});assert.equal(r.status,400);assert.match(r.text,/&lt;script&gt;cook&lt;\/script&gt;/);assert.doesNotMatch(r.text,/<script>cook/)
  await c.post(base+'/account/profile',{first_name:'KitchenAlex',last_name:'Cook',phone:'555-111-2222'});assert.match((await c.get(base+'/account')).text,/Welcome, KitchenAlex/)
  assert.equal((await c.post(base+'/account/preferences',{cooking:'forged',skill:'Confident home cook',email:'Yes'})).status,400)
  await c.post(base+'/account/preferences',{cooking:'Baking',skill:'Confident home cook',email:'No'})
  r=await c.post(base+'/account/addresses',{...address,postal_code:'bad'});assert.equal(r.status,400);assert.match(r.text,/value="18 Market Street"/)
  r=await c.post(base+'/account/addresses',address);const id=r.text.match(/data-address="([^"]+)"/)[1]
  await c.post(base+'/account/addresses',{...address,id,line1:'27 Hearth Avenue'});assert.match((await c.get(base+'/account/addresses')).text,/27 Hearth Avenue/)
  r=await c.post(base+'/account/addresses',{...address,label:'Second home',line1:'32 Grove Lane',is_default:''});const ids=[...r.text.matchAll(/data-address="([^"]+)"/g)].map(m=>m[1]);const second=ids.find(x=>x!==id)
  await c.post(base+`/account/addresses/${second}/default`,{});await c.post(base+'/cart/add',{id:'skillet',qty:'1',option_Finish:'Stainless steel'});r=await c.get(base+'/checkout');assert.equal(fieldValue(r.text,'address'),'32 Grove Lane, Unit 2');assert.ok(fieldValue(r.text,'checkout_token'))
  await c.post(base+'/logout',{});await register(c,'other-address@example.com');assert.doesNotMatch((await c.get(base+'/account/addresses')).text,/27 Hearth|32 Grove/);assert.equal((await c.get(base+'/account/addresses?edit='+id)).status,404);assert.equal((await c.post(base+`/account/addresses/${id}/delete`,{})).status,404);assert.equal((await c.get(base+'/checkout?address_id='+id)).status,400)
  await c.post(base+'/logout',{});await login(c);assert.match((await c.get(base+'/account')).text,/Welcome, KitchenAlex/);assert.match((await c.get(base+'/account/preferences')).text,/value="Baking" selected/);await c.post(base+`/account/addresses/${second}/delete`,{});r=await c.get(base+'/checkout');assert.equal(fieldValue(r.text,'address'),'27 Hearth Avenue, Unit 2')
 }finally{await srv.close()}
})

test('Williams Sonoma recipe box, favorites and recent views are owner-aware; recipe tool purchases stay canonical',async()=>{
 const srv=await startServer();try{const c=srv.client();await c.get(base+'/product/whisk');await c.post(base+'/favorites',{id:'whisk'});await login(c);assert.doesNotMatch((await c.get(base+'/favorites')).text,/data-product="whisk"/)
  await c.post(base+'/recipes/lemon-white-bean-skillet/save',{});assert.match((await c.get(base+'/account/recipe-box')).text,/Lemon &amp; White Bean Skillet/)
  await c.get(base+'/product/skillet?Finish=Brushed+steel');await c.post(base+'/favorites',{id:'skillet'});assert.match((await c.get(base+'/favorites')).text,/data-product="skillet"/);assert.match((await c.get(base+'/recently-viewed')).text,/data-product="skillet"/)
  const order=await buy(c);assert.equal(order.items[0].kind,'other');assert.equal(order.items[0].qty,2);assert.equal(order.items[0].unit_price,64.99);assert.equal(order.meta.options[0].options.Finish,'Brushed steel');assert.equal(order.totals.shipping,0);assert.equal(order.totals.tax,0);assert.equal(order.meta.gta6_available,false)
  await c.post(base+'/logout',{});await register(c,'other-recipes@example.com');assert.doesNotMatch((await c.get(base+'/account/recipe-box')).text,/Make this recipe/);assert.doesNotMatch((await c.get(base+'/recently-viewed')).text,/data-product="skillet"/)
  await c.post(base+'/logout',{});await login(c);await c.post(base+'/recipes/lemon-white-bean-skillet/save',{});assert.match((await c.get(base+'/account/recipe-box')).text,/No recipes saved/);await c.post(base+'/recently-viewed/clear',{});assert.doesNotMatch((await c.get(base+'/recently-viewed')).text,/data-product=/)
 }finally{await srv.close()}
})

test('Williams Sonoma private registries validate selected SKUs, quantities and notes, support edit/removal, and protect previews',async()=>{
 const srv=await startServer();try{const c=srv.client();await login(c);let r=await c.post(base+'/account/registries',{name:'Keep this title',event:'Wedding',event_date:'2026-02-30',notes:'notes'});assert.equal(r.status,400);assert.match(r.text,/value="Keep this title"/)
  const path=await registry(c)
  for(const body of [{product:'skillet',qty:'1'},{product:'skillet',qty:'1',option_Finish:'fake'},{product:'skillet',qty:'1.5',option_Finish:'Brushed steel'},{product:'skillet',qty:'11',option_Finish:'Brushed steel'},{product:'skillet',qty:'1',option_Finish:'Brushed steel',option_Unknown:'bad'},{product:'skillet',qty:['1','2'],option_Finish:'Brushed steel'},{product:'skillet',qty:'1',option_Finish:'Brushed steel',notes:'x'.repeat(1001)}])assert.equal((await c.post(path+'/items',body)).status,400)
  const unavailable=products.flatMap(p=>candidateVariants(p).filter(v=>!v.available||!v.stock).map(v=>({p,v})))[0];assert.equal((await c.post(path+'/items',{product:unavailable.p.id,qty:'1',...formOptions(unavailable.v)})).status,400)
  r=await c.post(path+'/items',{product:'skillet',qty:'2',option_Finish:'Brushed steel',notes:'Secret gift notes'});assert.match(r.text,/Desired quantity: 2/);assert.match(r.text,/Brushed steel/);const item=r.text.match(/data-registry-item="([^"]+)"/)[1]
  assert.equal((await c.post(path+'/items',{product:'skillet',qty:'1',option_Finish:'Brushed steel'})).status,400)
  r=await c.get(path+'/preview');assert.equal(r.status,200);assert.match(r.text,/Brushed steel/);assert.doesNotMatch(r.text,/Secret gift notes|Private registry secret|tester@example.com|555-/)
  r=await c.post(path+'/items/'+item,{qty:'3',notes:'Updated note'});assert.match(r.text,/Desired quantity: 3/)
  await c.post(path,{name:'New name',event:'Housewarming',event_date:'2027-11-20',notes:'Private changed'});assert.match((await c.get(path)).text,/<h1>New name<\/h1>/)
  const other=srv.client();await login(other);assert.equal((await other.get(path)).status,404);assert.equal((await other.get(path+'/preview')).status,404)
  await c.post(base+'/logout',{});await register(c,'registry-intruder@example.com');for(const suffix of ['', '/preview','/add'])assert.equal((await c.get(path+suffix)).status,404);assert.equal((await c.post(path+'/items/'+item+'/delete',{})).status,404)
  await c.post(base+'/logout',{});await login(c);assert.equal((await c.post(path+'/items/forged',{qty:'1',notes:''})).status,404);await c.post(path+'/items/'+item+'/delete',{});assert.doesNotMatch((await c.get(path)).text,/data-registry-item=/);await c.post(path+'/delete',{});assert.equal((await c.get(path+'/preview')).status,404)
 }finally{await srv.close()}
})

test('Williams Sonoma order ownership requires session, store and account; actions retain immutable payment and items',async()=>{
 const srv=await startServer();try{const c=srv.client();await login(c);const o=await buy(c),path=base+'/account/orders/'+o.id,original=JSON.stringify({items:o.items,payment:o.payment,totals:o.totals});assert.match((await c.get(path)).text,/Processing/);assert.match((await c.get(path)).text,/product\/skillet\?Finish=Brushed\+steel/)
  assert.equal((await c.post(path+'/action',{action:'return',reason:'Does not fit'})).status,400);assert.equal((await c.post(path+'/action',{action:'cancel',reason:''})).status,400)
  const other=srv.client();await login(other);assert.equal((await other.get(path)).status,404);assert.equal((await other.post(path+'/action',{action:'cancel',reason:'forged'})).status,404)
  await c.post(base+'/logout',{});await register(c,'order-intruder@example.com');assert.equal((await c.get(path)).status,404);assert.equal((await c.get(base+'/order/'+o.id)).status,404);assert.doesNotMatch((await c.get(base+'/account/orders')).text,new RegExp(o.order_number));assert.equal((await c.post(path+'/action',{action:'cancel',reason:'forged'})).status,404)
  await c.post(base+'/logout',{});await login(c);assert.match((await c.post(path+'/action',{action:'cancel',reason:'Ordered twice'})).text,/Cancellation recorded locally/);assert.equal(JSON.stringify({items:o.items,payment:o.payment,totals:o.totals}),original);assert.equal(o.meta.lifecycle.length,1);await c.post(path+'/action',{action:'cancel',reason:'Duplicate'});assert.equal(o.meta.lifecycle.length,1)
  const delivered=await buy(c);delivered.meta.lifecycle=[{status:'delivered',reason:'Test-only delivered fixture',created_at:new Date().toISOString()}];assert.match((await c.post(base+'/account/orders/'+delivered.id+'/action',{action:'return',reason:'Not suitable'})).text,/Return request recorded locally/);assert.equal(delivered.meta.lifecycle.at(-1).status,'return_requested')
 }finally{await srv.close()}
})

test('Williams Sonoma guest lookup requires exact order number, postal code and originating guest session',async()=>{
 const srv=await startServer();try{const c=srv.client(),o=await buy(c);let r=await c.post(base+'/track-order',{order_number:o.order_number,postal_code:'78701'});assert.equal(r.status,200);assert.match(r.text,new RegExp(o.order_number));assert.equal((await c.post(base+'/track-order',{order_number:o.id,postal_code:'78701'})).status,404);assert.equal((await c.post(base+'/track-order',{order_number:o.order_number,postal_code:'99999'})).status,404);assert.equal((await srv.client().post(base+'/track-order',{order_number:o.order_number,postal_code:'78701'})).status,404);await login(c);assert.equal((await c.get(base+'/account/orders/'+o.id)).status,404);assert.equal((await c.post(base+'/track-order',{order_number:o.order_number,postal_code:'78701'})).status,404);await c.post(base+'/logout',{});assert.equal((await c.get(base+'/account/orders/'+o.id)).status,200)
 }finally{await srv.close()}
})

test('Williams Sonoma help cases reject other-owner orders, retain invalid fields and remain private',async()=>{
 const srv=await startServer();try{const c=srv.client();assert.match((await c.get(base+'/help?q=registry')).text,/Private gift registries/);assert.match((await c.get(base+'/help?q=xyzxyz')).text,/0 help topics/);await login(c);const o=await buy(c)
  let r=await c.post(base+'/help/contact',{category:'care',subject:'Care for my pan',email:'invalid',message:'short'});assert.equal(r.status,400);assert.match(r.text,/value="Care for my pan"/);assert.match(r.text,/>short<\/textarea>/)
  r=await c.post(base+'/help/contact',{category:'care',subject:'Care for my pan',email:'cook@example.com',message:'My private support message',order_id:o.id});assert.equal(r.status,200);const casePath=pathOf(r);assert.match(r.text,/Received locally/);assert.match(r.text,/No email was sent/)
  const other=srv.client();await login(other);assert.equal((await other.get(casePath)).status,404)
  await c.post(base+'/logout',{});await register(c,'case-intruder@example.com');assert.equal((await c.get(casePath)).status,404);r=await c.post(base+'/help/contact',{category:'returns',subject:'Order question',email:'cook@example.com',message:'Request for another owner order',order_id:o.id});assert.equal(r.status,400);assert.doesNotMatch(r.text,new RegExp(o.order_number))
 }finally{await srv.close()}
})

test('Williams Sonoma preferred sample stores and editable interest drafts are validated and account-isolated',async()=>{
 const srv=await startServer();try{const c=srv.client();await login(c);assert.equal((await c.post(base+'/stores/preferred',{store:'fake'})).status,400);await c.post(base+'/stores/preferred',{store:'harbor-walk'});assert.match((await c.get(base+'/account/event-interests')).text,/value="harbor-walk" selected/)
  let r=await c.post(base+'/account/event-interests',{event:'bread-basics',store:'harbor-walk',notes:'Private baking idea'});const id=r.text.match(/data-interest="([^"]+)"/)[1];r=await c.post(base+'/account/event-interests',{id,event:'coffee-workshop',store:'market-square',notes:'Changed private idea'});assert.match(r.text,/Changed private idea/);assert.match(r.text,/Better coffee at home/)
  assert.equal((await c.post(base+'/account/event-interests',{id,event:'fake',store:'market-square',notes:'Retain this idea'})).status,400)
  await c.post(base+'/logout',{});await register(c,'event-intruder@example.com');assert.equal((await c.get(base+'/account/event-interests?edit='+id)).status,404);assert.equal((await c.post(base+'/account/event-interests/'+id+'/delete',{})).status,404)
  await c.post(base+'/logout',{});await login(c);await c.post(base+'/account/event-interests/'+id+'/delete',{});assert.doesNotMatch((await c.get(base+'/account/event-interests')).text,/data-interest=/)
 }finally{await srv.close()}
})
