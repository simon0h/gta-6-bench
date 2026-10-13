import test from 'node:test'
import assert from 'node:assert/strict'
import {startServer,fieldValue} from './helpers.js'
import {PRODUCTS,byId} from '../stores/jb-hifi/data.js'
import {DEPARTMENT_DEFS,CAMPAIGNS,slugify} from '../stores/jb-hifi/catalog.js'
const details={email:'catalog@example.com',delivery_method:'delivery',country:'AU',first_name:'Alex',last_name:'Tester',address1:'1 George St',suburb:'Sydney',state:'NSW',postcode:'2000',phone:'0412 345 678'}
const card={payment_method:'card',card_number:'4242 4242 4242 4242',card_expiry:'12/29',card_cvv:'123',card_name:'Alex Tester',billing:'same'}
const path=r=>new URL(r.url).pathname+new URL(r.url).search
const add=(c,id,extra={})=>c.post('/jb-hifi/cart/add',{id,...extra})
async function review(c){const info=await c.get('/jb-hifi/checkout');const shipping=await c.post(path(info),details);return c.post(path(shipping),{shipping_method:'standard'})}
const cards=html=>[...html.matchAll(/<h3><a href="([^"]+)"/g)].map(m=>m[1])

test('jb catalog: registered, broad populated departments/brands/campaigns and scoped pagination',async()=>{
 const srv=await startServer();try{
  const c=srv.client();assert.ok((await c.json('/api/stores')).some(s=>s.slug==='jb-hifi'))
  assert.equal(PRODUCTS.length,500);assert.ok(new Set(PRODUCTS.filter(p=>p.id.startsWith('991')).map(p=>p.family)).size>=28)
  for(const d of DEPARTMENT_DEFS){const r=await c.get('/jb-hifi/collections/'+d.slug);assert.equal(r.status,200);assert.ok(cards(r.text).length>0,d.slug);for(const type of new Set(PRODUCTS.filter(p=>p.crumbs[0]===d.title).map(p=>p.type)))assert.equal((await c.get(`/jb-hifi/collections/${d.slug}/${slugify(type)}`)).status,200)}
  for(const campaign of CAMPAIGNS){const r=await c.get('/jb-hifi/collections/'+campaign.slug);assert.ok(cards(r.text).length>0,campaign.slug)}
  const samsung=await c.get('/jb-hifi/brands/samsung');assert.ok(cards(samsung.text).every(p=>p.includes('samsung')))
  const page1=await c.get('/jb-hifi/collections/computers-tablets?sort=price-asc&per_page=8')
  const page2=await c.get('/jb-hifi/collections/computers-tablets?sort=price-asc&per_page=8&page=2')
  assert.equal(cards(page1.text).length,8);assert.equal(cards(page2.text).length,8);assert.ok(!cards(page2.text).some(p=>cards(page1.text).includes(p)))
  assert.match(page2.text,new RegExp('Showing 9–16 of '+PRODUCTS.filter(p=>p.crumbs[0]==='Computers & Tablets').length+' results'))
  const refined=await c.get('/jb-hifi/collections/computers-tablets?brand=Logitech&price=50to150&rating=4.5&connectivity=Bluetooth')
  assert.deepEqual(cards(refined.text),['/jb-hifi/products/logitech-compact-wireless-keyboard'])
  assert.doesNotMatch(refined.text,/filter-platform/)
  const optionFiltered=await c.get('/jb-hifi/collections/computers-tablets?storage=2TB&price=over150&availability=in-stock');assert.deepEqual(cards(optionFiltered.text),['/jb-hifi/products/sandisk-portable-usb-c-ssd?variant=2tb']);assert.match(optionFiltered.text,/>\$179</)
  const unavailable=await c.get('/jb-hifi/collections/computers-tablets?storage=4TB&availability=in-stock');assert.equal(cards(unavailable.text).length,0)
  const empty=await c.get('/jb-hifi/search?query=unfindablezz');assert.match(empty.text,/0 results/);assert.match(empty.text,/Popular searches/)
 }finally{await srv.close()}
})

test('jb catalog: hardware, appliance and media purchase uses trusted prices, options, AUD and other kind',async()=>{
 const srv=await startServer();try{
  const c=srv.client();await add(c,'991117',{variant:'2tb',qty:'2',price:'0.01',kind:'game'});await add(c,'991104');await add(c,'991129')
  const cart=await c.get('/jb-hifi/cart');assert.match(cart.text,/2TB/);assert.match(cart.text,/\$431\.99/)
  const payment=await review(c);assert.doesNotMatch(payment.text,/Pre-orders are paid in full/)
  const done=await c.post(path(payment),{...card,review_token:fieldValue(payment.text,'review_token')})
  assert.match(done.text,/being processed/);assert.doesNotMatch(done.text,/Your pre-order/);assert.match(done.text,/2TB/)
  const [o]=await c.json('/api/orders?store=jb-hifi');assert.equal(o.currency,'AUD');assert.ok(o.items.every(i=>i.kind==='other'))
  assert.deepEqual(o.items.map(i=>[i.sku,i.qty,i.unit_price]),[['991117',2,179],['991104',1,49],['991129',1,24.99]])
  assert.equal(o.totals.total,436.98);assert.equal(o.totals.tax,0);assert.deepEqual(o.meta.options[0].options,{Storage:'2TB'});assert.equal(o.meta.preorder,false)
  assert.doesNotMatch(JSON.stringify(o),/4242 4242|card_cvv/)
  assert.equal((await srv.client().get(path(done))).status,404)
 }finally{await srv.close()}
})

test('jb catalog: missing, forged and unavailable options, quantities and ambiguous variants reject',async()=>{
 const srv=await startServer();try{
  const c=srv.client()
  for(const extra of [{},{variant:'forged'},{variant:['black','cream']}])assert.equal((await add(c,'991101',extra)).status,400)
  assert.equal((await add(c,'991117',{variant:'4tb'})).status,409)
  assert.equal((await add(c,'903002')).status,409)
  assert.equal((await add(c,'991133')).status,409)
  for(const qty of ['1.5','0','-1','6','NaN'])assert.equal((await add(c,'991104',{qty})).status,400)
  assert.equal((await add(c,'991101',{variant:'black',qty:'3'})).status,200)
  assert.equal((await add(c,'991101',{variant:'black'})).status,409)
  await add(c,'991101',{variant:'cream',qty:'2'})
  assert.equal((await c.post('/jb-hifi/cart/update',{id:'991101',action:'remove'})).status,400)
  assert.equal((await c.post('/jb-hifi/cart/update',{id:'991101',line_key:'991101:cream',qty:'1.5'})).status,400)
  await c.post('/jb-hifi/cart/update',{id:'991101',line_key:'991101:cream',action:'remove'})
  const before=byId('991117').stock;byId('991117').stock=3
  try{await add(c,'991117',{variant:'1tb',qty:'3'});assert.equal((await add(c,'991117',{variant:'2tb'})).status,409)}finally{byId('991117').stock=before}
  assert.equal((await c.json('/api/orders?store=jb-hifi')).length,0)
 }finally{await srv.close()}
})

test('jb catalog: changed cart, trusted price, old token and final stock block stale payment',async()=>{
 const srv=await startServer();try{
  const c=srv.client();await add(c,'991104');let payment=await review(c);const oldToken=fieldValue(payment.text,'review_token')
  await c.post('/jb-hifi/cart/update',{id:'991104',qty:'2'})
  let rejected=await c.post(path(payment),{...card,review_token:oldToken});assert.equal(rejected.status,409);assert.match(rejected.text,/details changed/);assert.doesNotMatch(rejected.text,/4242 4242/);assert.match(rejected.text,/value="Alex Tester"/)
  assert.equal((await c.post(path(payment),{...card,review_token:oldToken})).status,409)
  payment=await c.get(path(payment));const price=byId('991104').price;byId('991104').price=price+1
  try{assert.equal((await c.post(path(payment),card)).status,409)}finally{byId('991104').price=price}
  payment=await c.get(path(payment));const stock=byId('991104').stock;byId('991104').stock=1
  try{rejected=await c.post(path(payment),{...card,review_token:fieldValue(payment.text,'review_token')});assert.equal(rejected.status,409)}finally{byId('991104').stock=stock}
  assert.equal((await c.json('/api/orders?store=jb-hifi')).length,0)
  payment=await c.get(path(payment));const done=await c.post(path(payment),{...card,review_token:fieldValue(payment.text,'review_token')});assert.match(done.text,/Thank you/)
  await c.post(path(payment),card);assert.equal((await c.json('/api/orders?store=jb-hifi')).length,1)
 }finally{await srv.close()}
})

test('jb catalog: changed address/shipping/account invalidates review and fulfillment constraints enforce server-side',async()=>{
 const srv=await startServer();try{
  const c=srv.client();await add(c,'991104');let payment=await review(c);const old=fieldValue(payment.text,'review_token'),infoPath=path(payment).replace(/payment$/,'information'),shippingPath=path(payment).replace(/payment$/,'shipping')
  await c.post(infoPath,{...details,address1:'2 George St'});await c.post(shippingPath,{shipping_method:'express'})
  assert.equal((await c.post(path(payment),{...card,review_token:old})).status,409)
  assert.equal((await c.post(shippingPath,{shipping_method:'__proto__'})).status,400)
  assert.equal((await c.post(infoPath,{...details,country:'US'})).status,400)
  payment=await c.get(path(payment));await c.post('/jb-hifi/account/login',{email:'tester@example.com',password:'Password123!'})
  const stopped=await c.post(path(payment),{...card,review_token:fieldValue(payment.text,'review_token')});assert.match(path(stopped),/information$/)
  const online=srv.client();await add(online,'903005');const info=await online.get('/jb-hifi/checkout');const pickup=await online.post(path(info),{email:'catalog@example.com',delivery_method:'pickup',store_id:'sydney-city',pickup_first_name:'Alex',pickup_last_name:'Tester',pickup_phone:'0412 345 678'})
  assert.equal(pickup.status,400);assert.match(pickup.text,/online-only/)
  assert.equal((await c.json('/api/orders?store=jb-hifi')).length,0)
 }finally{await srv.close()}
})

test('jb catalog: global CAPTCHA configuration preserves the existing JB profile absence',async()=>{
 const srv=await startServer({captcha:{mode:'on'}});try{
  const c=srv.client();assert.equal((await c.json('/api/stores')).find(s=>s.slug==='jb-hifi').captcha,null)
  for(const route of ['/jb-hifi/account/login','/jb-hifi/account/register','/jb-hifi/collections/home-appliances'])assert.equal((await c.get(route)).status,200)
 }finally{await srv.close()}
})

test('jb catalog: every available ordinary fixture completes the common delivery path as other',async()=>{
 const srv=await startServer();try{
  const c=srv.client(),ordinary=PRODUCTS.filter(p=>p.kind==='other'&&p.orderable&&p.stock>0)
  for(const p of ordinary){const r=await add(c,p.id,p.variants?{variant:p.variants.find(v=>v.stock>0).id}:{});assert.equal(r.status,200,p.title)}
  const payment=await review(c),done=await c.post(path(payment),{...card,review_token:fieldValue(payment.text,'review_token')})
  assert.match(done.text,/Thank you/)
  const [order]=await c.json('/api/orders?store=jb-hifi');assert.equal(order.items.length,ordinary.length);assert.ok(order.items.every(i=>i.kind==='other'))
 }finally{await srv.close()}
})
