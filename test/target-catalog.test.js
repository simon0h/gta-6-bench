import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer } from './helpers.js'
import { PRODUCTS, byTcin, productPath, refine, selectedProduct } from '../stores/target/data.js'
import { ORDINARY_PRODUCTS, DEPARTMENTS, CAMPAIGNS } from '../stores/target/catalog.js'
import { PHOTO_KEYS } from '../lib/product-photos.js'

const ADDRESS={firstName:'Alex',lastName:'Tester',address1:'12 Main St',zip:'99501',city:'Anchorage',state:'AK',phone:'9075550123'}
const CARD={paymentType:'card',cardNumber:'4242424242424242',expiry:'12/29',cvv:'123',nameOnCard:'Alex Tester',billingSame:'1'}
const item=family=>ORDINARY_PRODUCTS.find(p=>p.family===family)
const ids=html=>[...html.matchAll(/<article class="tg-tile" data-tcin="(\d+)"/g)].map(m=>m[1])
async function signIn(c){return c.post('/target/login',{email:'tester@example.com',password:'Password123!',redirect:'/target/checkout'})}

test('target catalog: 54 distinct ordinary families have genuine departments, matching art, detailed specs and populated campaigns',async()=>{
  assert.equal(ORDINARY_PRODUCTS.length,54)
  assert.equal(new Set(ORDINARY_PRODUCTS.map(p=>p.family)).size,54)
  assert.equal(PRODUCTS.length,501)
  for(const p of ORDINARY_PRODUCTS){
    assert.equal(p.kind,'other');assert.equal(p.preorder,false)
    assert.ok(DEPARTMENTS.some(d=>d.id===p.department));assert.ok(PHOTO_KEYS.includes(p.photo),p.photo)
    assert.ok(p.specs.length>=6);assert.ok(p.highlights.length>=3);assert.ok(p.eta.includes('business days'))
  }
  const srv=await startServer()
  try{
    const c=srv.client(), home=await c.get('/target/')
    assert.match(home.text,/Hello, cozy season/)
    assert.match(home.text,/\/target\/weekly-ad/)
    for(const department of DEPARTMENTS){
      assert.match(home.text,new RegExp('/target/c/'+department.id))
      const r=await c.get('/target/c/'+department.id)
      assert.equal(r.status,200);assert.ok(ids(r.text).length>0,department.id)
      assert.deepEqual(new Set(ids(r.text)),new Set(PRODUCTS.filter(p=>p.department===department.id&&!p.addon).slice(0,12).map(p=>p.tcin)))
    }
    for(const campaign of CAMPAIGNS){const r=await c.get('/target/c/'+campaign.id);assert.equal(r.status,200);assert.ok(ids(r.text).length>0,campaign.id)}
    assert.equal((await c.get('/target/weekly-ad')).status,200)
    assert.equal((await c.get('/target/b/good-gather')).status,200)
    assert.equal((await c.get('/target/c/missing-category')).status,404)
    for(const p of ORDINARY_PRODUCTS){const r=await c.get(productPath('/target',p));assert.equal(r.status,200);assert.match(r.text,/Sold and shipped by Target/);assert.doesNotMatch(r.text,/Preorder for|Release date:|Vintage Vice City/)}
  }finally{await srv.close()}
})

test('target catalog: combined facets intersect, option stock matters, and empty states recover',async()=>{
  const srv=await startServer()
  try{
    const c=srv.client(), p=item('dutch-oven')
    const r=await c.get('/target/c/kitchen-dining?brand=Threshold&type=Cookware&material=Cast+iron&rating=4&price=50to100&availability=instock&sort=price_high')
    assert.deepEqual(ids(r.text),[p.tcin])
    assert.match(r.text,/Remove material filter/)
    assert.match(r.text,/name="brand"/);assert.match(r.text,/value="Threshold" selected/)
    const browseBack='/target/c/kitchen-dining?brand=Threshold&sort=price_high'
    const pdp=await c.get(productPath('/target',p)+'?variant='+p.variants[1].id+'&returnTo='+encodeURIComponent(browseBack))
    assert.match(pdp.text,/Back to results/);assert.match(pdp.text,/name="returnTo" value="\/target\/c\/kitchen-dining\?brand=Threshold&amp;sort=price_high"/)
    assert.equal(refine(ORDINARY_PRODUCTS,{size:'XL',availability:'instock',type:'Tops'}).some(p=>p.family==='tshirt'),false)
    const selected=refine(ORDINARY_PRODUCTS,{size:'7 qt'})[0]
    assert.equal(selected.price,79.99);assert.equal(selected.variantId,p.variants[1].id)
    const empty=await c.get('/target/c/kitchen-dining?brand=Logitech')
    assert.equal(ids(empty.text).length,0);assert.match(empty.text,/couldn&rsquo;t find a match/);assert.match(empty.text,/Clear all filters/)
    const unavailable=await c.get('/target/c/electronics?availability=outofstock')
    assert.deepEqual(ids(unavailable.text),[item('speaker').tcin])
    assert.equal(ids((await c.get('/target/s?searchTerm=nonexistentthing')).text).length,0)
  }finally{await srv.close()}
})

test('target catalog: real pagination has stable order, accurate counts and preserved refinement return links',async()=>{
  const srv=await startServer()
  try{
    const c=srv.client(), expected=refine(PRODUCTS.filter(p=>!p.addon),{sort:'price_low'})
    const found=[]
    for(let page=1;page<=42;page++){
      const r=await c.get(`/target/s?searchTerm=&sort=price_low&page=${page}`)
      assert.match(r.text,/500 results/);assert.match(r.text,new RegExp(`page ${page} of 42`));found.push(...ids(r.text))
    }
    assert.deepEqual(found,expected.map(p=>p.tcin));assert.equal(new Set(found).size,500)
    const back='/target/c/everyday-essentials?brand=Good+%26+Gather&sort=price_low&page=1'
    const added=await c.post('/target/cart/add',{tcin:item('pasta').tcin,back})
    assert.match(added.url,/brand=Good/);assert.match(added.url,/sort=price_low/);assert.match(added.text,/Added to cart/)
  }finally{await srv.close()}
})

test('target catalog: authoritative variants reject forged IDs, prices, fulfillment, quantity and exhausted options',async()=>{
  const srv=await startServer()
  try{
    const c=srv.client(), p=item('dutch-oven'), variant=p.variants[1]
    for(const body of [
      {tcin:p.tcin},{tcin:p.tcin,variant:'forged'},{tcin:p.tcin,variant:variant.id,qty:'2.5'},
      {tcin:p.tcin,variant:variant.id,qty:'3'},{tcin:p.tcin,variant:variant.id,fulfillment:'pickup'},
      {tcin:p.tcin,variant:variant.id,color:'invented'},{tcin:item('speaker').tcin},
      {tcin:item('tshirt').tcin,variant:item('tshirt').variants[3].id},
    ])assert.equal((await c.post('/target/cart/add',body)).status,400,JSON.stringify(body))
    assert.match((await c.get('/target/cart')).text,/Your cart is empty/)
    const selected=await c.get(productPath('/target',p)+'?variant='+variant.id)
    assert.match(selected.text,/7 quarts/);assert.doesNotMatch(selected.text,/>5 quarts</)
    const added=await c.post('/target/cart/add',{tcin:p.tcin,variant:variant.id,qty:'2',price:'0.01',kind:'game'})
    assert.match(added.text,/Added to cart/);assert.match(added.text,/Size \/ capacity: 7 qt/)
    const cart=await c.get('/target/cart');assert.match(cart.text,/\$159\.98/);assert.match(cart.text,/Size \/ capacity: 7 qt/)
    assert.equal((await c.post('/target/cart/update',{tcin:p.tcin,variant:variant.id,qty:'3'})).status,400)
    await signIn(c)
    assert.equal((await c.post('/target/buy-now',{tcin:p.tcin,variant:variant.id})).status,400)
    assert.deepEqual(await c.json('/api/orders?store=target'),[])
  }finally{await srv.close()}
})

test('target catalog: an ordinary option survives save/restore and buys as other with shipping-specific policy and receipt',async()=>{
  const srv=await startServer()
  try{
    const c=srv.client(), p=item('coffee'), variant=p.variants[1]
    await c.post('/target/cart/add',{tcin:p.tcin,variant:variant.id,qty:2,unit_price:'0.01',kind:'game',platform:'ps5'})
    await c.post('/target/cart/update',{tcin:p.tcin,variant:variant.id,action:'save'})
    const saved=await c.get('/target/cart');assert.match(saved.text,/Move to cart/)
    await c.post('/target/cart/update',{tcin:p.tcin,variant:variant.id,action:'restore'})
    const cart=await c.get('/target/cart');assert.match(cart.text,/24 oz/);assert.match(cart.text,/\$27\.98/)
    await signIn(c)
    const payment=await c.post('/target/checkout/shipping',ADDRESS)
    assert.equal(payment.status,200);assert.match(payment.url,/checkout\/payment$/,'ordinary pantry items may ship to Alaska')
    const review=await c.post('/target/checkout/payment',CARD)
    assert.match(review.text,/24 oz/);assert.doesNotMatch(review.text,/street date|release date|November/)
    const done=await c.post('/target/checkout/place-order')
    assert.match(done.text,/Thanks for your order/);assert.match(done.text,/24 oz/)
    const [order]=await c.json('/api/orders?store=target')
    assert.deepEqual(order.items,[{kind:'other',title:p.title,qty:2,unit_price:13.99,sku:p.tcin}])
    assert.deepEqual(order.totals,{subtotal:27.98,shipping:5.99,tax:2.73,total:36.7})
    assert.equal(order.meta.options[0].variant_id,variant.id)
    assert.deepEqual(order.meta.options[0].options,{'Size / capacity':'24 oz'})
    assert.equal(order.fulfillment.eta,'Arrives in 3–5 business days')
    assert.doesNotMatch(JSON.stringify(order),/4242424242424242|"cvv"/)
  }finally{await srv.close()}
})

test('target catalog: final order boundary rechecks trusted stock and canonical products retain their shipping restriction',async()=>{
  const srv=await startServer(), p=item('mug'), stock=p.stock
  try{
    const c=srv.client()
    await c.post('/target/cart/add',{tcin:p.tcin})
    await signIn(c);await c.post('/target/checkout/shipping',ADDRESS);await c.post('/target/checkout/payment',CARD)
    p.stock=0
    const rejected=await c.post('/target/checkout/place-order')
    assert.equal(rejected.status,400);assert.match(rejected.text,/no longer available/);assert.deepEqual(await c.json('/api/orders?store=target'),[])
    p.stock=stock
    assert.match((await c.post('/target/checkout/place-order')).text,/Thanks for your order/)
    const other=srv.client();await other.post('/target/cart/add',{tcin:'1011529119'});await signIn(other)
    assert.equal((await other.post('/target/checkout/shipping',ADDRESS)).status,400)
    for(const [tcin,platform] of [['1011529119','ps5'],['1011545811','xbox']]){
      const game=byTcin(tcin);assert.equal(game.kind,'game');assert.equal(game.platform,platform);assert.equal(game.price,79.99);assert.equal(game.format,'code-in-box');assert.equal(game.edition,'standard');assert.equal(game.limit,2)
    }
  }finally{p.stock=stock;await srv.close()}
})
