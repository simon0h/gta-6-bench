import { assertProductGallery } from './product-gallery-assertions.js'
import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer } from './helpers.js'
import { PRODUCTS, byId, selectedProduct, totals, validCart } from '../stores/walmart/data.js'
import { DEPARTMENTS, CAMPAIGNS, RETAIL_PRODUCTS } from '../stores/walmart/catalog.js'

const ADDRESS={firstName:'Alex',lastName:'Tester',address1:'123 Ocean Dr',city:'Miami',state:'FL',zip:'33139',phone:'3055550123'}
const CARD={method:'card',cardNumber:'4242424242424242',expMonth:'12',expYear:'29',cvv:'123',firstName:'Alex',lastName:'Tester',phone:'3055550123',billingSame:'1'}
const milk=RETAIL_PRODUCTS.find(p=>p.family==='milk')
const shirt=RETAIL_PRODUCTS.find(p=>p.family==='tshirt')
const headphones=RETAIL_PRODUCTS.find(p=>p.family==='headphones')
const key=(p,v)=>`${p.id}::${v}`
const tiles=html=>[...html.matchAll(/<h3 class="wm-tile-title"><a href="[^"]*\/(\d+)/g)].map(m=>m[1])
async function signIn(c){await c.post('/walmart/cart/checkout',{});await c.post('/walmart/account/login?state=%2Fcart%3Fcheckout%3Dtrue',{identifier:'tester@example.com'});return c.post('/walmart/account/signin/withpassword',{password:'Password123!'})}
async function payment(c){await c.post('/walmart/checkout/address',ADDRESS);return c.post('/walmart/checkout/payment',CARD)}

test('walmart catalog: all departments/campaigns have merchandise and pagination preserves refinements',async()=>{
 const srv=await startServer();try{
  const c=srv.client()
  assert.equal(PRODUCTS.length,500)
  assert.equal(new Set(RETAIL_PRODUCTS.map(p=>p.family)).size,66)
  assert.equal(new Set(PRODUCTS.map(p=>p.id)).size,500)
  assert.deepEqual(PRODUCTS.filter(p=>p.kind==='game').map(p=>p.id),['20482917228','20459958275'])
  const home=await c.get('/walmart/');assert.equal(home.status,200)
  for(const d of DEPARTMENTS){const page=await c.get(`/walmart/cp/${d.slug}/${d.id}`);assert.equal(page.status,200);assert.ok(tiles(page.text).length>0,d.name)}
  for(const campaign of CAMPAIGNS){assert.ok(home.text.includes(`/walmart/shop/${campaign.slug}`));const page=await c.get(`/walmart/shop/${campaign.slug}`);assert.equal(page.status,200);assert.ok(tiles(page.text).length>0)}
  const one=await c.get('/walmart/search?availability=instock&sort=price_low')
  const two=await c.get('/walmart/search?availability=instock&sort=price_low&page=2')
  assert.equal(tiles(one.text).length,12);assert.equal(tiles(two.text).length,12)
  assert.equal(tiles(one.text).filter(id=>tiles(two.text).includes(id)).length,0)
  assert.match(two.text,/availability=instock&amp;sort=price_low&amp;q=&amp;page=3|availability=instock&amp;sort=price_low&amp;page=3/)
  assert.match(two.text,/13–24 of/)
  const composed=await c.get('/walmart/search?department=electronics&brand=Onn&price=under25&rating=4&availability=instock&seller=everyday-tech&sort=price_high')
  assert.ok(tiles(composed.text).length>0)
  for(const id of tiles(composed.text)){const p=byId(id);assert.equal(p.department,'electronics');assert.equal(p.brand,'Onn');assert.ok(p.price<25);assert.equal(p.sellerId,'everyday-tech')}
  const exact=await c.get('/walmart/search?q=wireless+headphones');assert.deepEqual(tiles(exact.text),[headphones.id])
  const empty=await c.get('/walmart/search?q=milk&fulfillment=pickup')
  assert.match(empty.text,/There were no search results/);assert.match(empty.text,/href="\/walmart\/search\?q=milk"/);assert.match(empty.text,/Browse departments/)
  const rollback=await c.get('/walmart/shop/savings');assert.ok(tiles(rollback.text).every(id=>byId(id).wasPrice))
  for(const route of ['/departments','/services','/cp/pharmacy/5431','/services/auto-care','/services/photo','/services/financial','/store-directory','/plus','/cp/halloween/9516159'])assert.equal((await c.get(`/walmart${route}`)).status,200,route)
 }finally{await srv.close()}
})

test('walmart catalog: ordinary PDP, reviews, gallery, seller and stock use the selected item',async()=>{
 const srv=await startServer();try{
  const c=srv.client()
  const pdp=await c.get(`/walmart/ip/${milk.id}?variant=two-gallons`)
  assert.equal(pdp.status,200);assert.match(pdp.text,/Current price is <\/span>\$6\.72/);assert.match(pdp.text,/Pack: 2 × 1 gallon/)
  assert.doesNotMatch(pdp.text,/<th>Size<\/th><td>1 gallon<\/td>/);assert.match(pdp.text,/Contains milk/);assert.match(pdp.text,/Keep refrigerated/)
  assert.doesNotMatch(pdp.text,/Nov 12|preload|No disc|download codes|Video Game Platform|As low as/)
  const bad=await c.get(`/walmart/ip/${milk.id}?variant=counterfeit`);assert.equal(bad.status,400);assert.match(bad.text,/That option is not available/)
  const gallery=await c.get(`/walmart/ip/${milk.id}/gallery`);assert.equal(gallery.status,200);await assertProductGallery(c,gallery.text,'walmart',milk.id);assert.match(gallery.text,/two-gallons/)
  const reviews=await c.get(`/walmart/reviews/product/${milk.id}?rating=4&sort=lowest`)
  assert.match(reviews.text,/Good everyday value/);assert.doesNotMatch(reviews.text,/A useful dairy find|Ready for preload/)
  const seller=await c.get('/walmart/seller/bright-home');assert.equal(seller.status,200);assert.ok(tiles(seller.text).every(id=>byId(id).sellerId==='bright-home'))
  const out=await c.get(`/walmart/ip/${shirt.id}?variant=xl`);assert.match(out.text,/wm-pill-lg" disabled>Out of stock/)
 }finally{await srv.close()}
})

test('walmart catalog: variants keep trusted prices, quantities and identity through cart and saved items',async()=>{
 const srv=await startServer();try{
  const c=srv.client()
  for(const body of [{pid:shirt.id},{pid:shirt.id,variant:'forged'},{pid:milk.id,variant:'gallon',fulfillment:'pickup'}])assert.equal((await c.post('/walmart/cart/add',body)).status,400)
  assert.equal((await c.post('/walmart/cart/add',{pid:shirt.id,variant:'xl'})).status,409)
  const added=await c.post('/walmart/cart/add',{pid:shirt.id,variant:'large',price:'0.01',kind:'game'})
  assert.match(added.url,/ip=7.98/);assert.match(added.text,/Size: L/)
  assert.match((await c.post('/walmart/cart/add',{pid:shirt.id,variant:'large'})).url,/qt=2/)
  assert.equal((await c.post('/walmart/cart/add',{pid:shirt.id,variant:'large'})).status,409)
  await c.post('/walmart/cart/add',{pid:shirt.id,variant:'small'})
  assert.equal((await c.post('/walmart/cart/update',{pid:shirt.id,action:'inc'})).status,400,'ambiguous product-only updates are rejected')
  let cart=await c.get('/walmart/cart');assert.match(cart.text,/\$22\.94/);assert.match(cart.text,/Size: S/);assert.match(cart.text,/Size: L/)
  await c.post('/walmart/cart/update',{line:key(shirt,'large'),action:'save'})
  cart=await c.get('/walmart/cart');assert.match(cart.text,/Saved for later \(1\)/);assert.match(cart.text,/Size: L.*Qty 2/);assert.match(cart.text,/\?variant=large" class="wm-line-title"/)
  await c.post('/walmart/cart/update',{line:key(shirt,'large'),action:'move'})
  cart=await c.get('/walmart/cart');assert.match(cart.text,/\$22\.94/);assert.doesNotMatch(cart.text,/Saved for later/)
  await c.post('/walmart/cart/update',{line:key(shirt,'large'),action:'dec'})
  await c.post('/walmart/cart/update',{line:key(shirt,'small'),action:'remove'})
  cart=await c.get('/walmart/cart');assert.match(cart.text,/\$7\.98/);assert.doesNotMatch(cart.text,/Size: S/)
  await signIn(c);await payment(c);const receipt=await c.post('/walmart/checkout/place-order',{});assert.equal(receipt.status,200);assert.match(receipt.text,/Size: L/)
  const [o]=await c.json('/api/orders?store=walmart');assert.equal(o.items[0].kind,'other');assert.equal(o.items[0].unit_price,7.98);assert.equal(o.items[0].qty,1)
  assert.deepEqual(o.meta.options[0].options,{Size:'L',Color:'White'});assert.equal(o.meta.options[0].variant_id,'large')
 }finally{await srv.close()}
})

test('walmart catalog: ordinary groceries complete checkout without a GTA delivery date or item kind',async()=>{
 const srv=await startServer();try{
  const c=srv.client()
  await c.post('/walmart/cart/add',{pid:milk.id,variant:'two-gallons',unit_price:'0.01',platform:'ps5',kind:'game'})
  const cart=await c.get('/walmart/cart');assert.match(cart.text,/\$6\.72/);assert.doesNotMatch(cart.text,/Nov 12/)
  const checkout=await signIn(c);assert.match(checkout.text,/tomorrow/);assert.doesNotMatch(checkout.text,/Nov 12/)
  const paid=await payment(c);assert.match(paid.text,/Place order for \$7\.19/)
  const done=await c.post('/walmart/checkout/place-order',{});assert.match(done.text,/Thanks for your order/);assert.doesNotMatch(done.text,/Nov 12|preordered item ships/)
  const [order]=await c.json('/api/orders?store=walmart')
  assert.equal(order.items[0].kind,'other');assert.equal(order.items[0].unit_price,6.72);assert.equal(order.fulfillment.eta,'tomorrow')
  assert.deepEqual(order.totals,{subtotal:6.72,shipping:0,tax:0.47,total:7.19})
  assert.equal(order.meta.options[0].variant_id,'two-gallons');assert.equal(order.meta.options[0].quantity,1)
 }finally{await srv.close()}
})

test('walmart catalog: stock is revalidated before ordering, and invalid stored variants cannot price a cart',async()=>{
 assert.equal(selectedProduct(shirt,'forged'),null)
 assert.equal(validCart({cart:[{pid:shirt.id,variantId:'large',qty:3}]}),false)
 assert.equal(validCart({cart:[{pid:shirt.id,variantId:'large',qty:1.5}]}),false)
 assert.equal(totals({cart:[{pid:shirt.id,variantId:'large',qty:1,price:0.01}]}).subtotal,7.98)
 const srv=await startServer();const original=headphones.variants[0].stock
 try{
  const c=srv.client();await c.post('/walmart/cart/add',{pid:headphones.id,variant:'standard'});await signIn(c);await payment(c)
  headphones.variants[0].stock=0
  const denied=await c.post('/walmart/checkout/place-order',{});assert.equal(denied.status,409);assert.match(denied.text,/no longer available/)
  assert.deepEqual(await c.json('/api/orders?store=walmart'),[])
 }finally{headphones.variants[0].stock=original;await srv.close()}
})
