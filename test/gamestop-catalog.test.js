import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer, fieldValue } from './helpers.js'
import { PRODUCTS, byId, refine, selectedProduct, cartError, DEPARTMENTS, collection } from '../stores/gamestop/data.js'

const ADDRESS = { firstName:'Alex',lastName:'Tester',address1:'123 Ocean Dr',city:'Miami',stateCode:'FL',postalCode:'33139',phone:'3055550123' }
const ORDER = { ...ADDRESS,email:'alex@example.com',shippingMethod:'premium',paymentMethod:'paypal',billingSame:'1' }
const ids = html => [...html.matchAll(/data-product-id="([^"]+)"/g)].map(m=>m[1])
const token = html=>fieldValue(html,'reviewToken')

test('gamestop catalog: broad explicit family data and compatible variant refinements',()=>{
  const ordinary=PRODUCTS.filter(p=>p.kind==='other')
  assert.equal(PRODUCTS.length,500)
  assert.equal(new Set(ordinary.filter(p=>!p.catalogRange).map(p=>p.family)).size,34)
  for(const p of PRODUCTS){assert.ok(p.department);assert.ok(p.family);assert.ok(Number.isInteger(p.stock));assert.ok(p.features.length);assert.ok(p.specs);assert.deepEqual(p.fulfillment,['shipping'])}
  assert.deepEqual(refine(PRODUCTS,{size:['XL'],availability:['instock']}),[])
  const refined=refine(PRODUCTS,{condition:['Pre-Owned'],brand:['Sony Interactive Entertainment'],price:['50to100']})
  assert.equal(refined.length,1);assert.equal(refined[0].price,54.99);assert.equal(refined[0].variant,'preowned')
  assert.equal(selectedProduct(byId('gs-binder'),'red').price,27.99)
  assert.ok(refine(collection('pre-owned').products).every(p=>['Pre-Owned','Refurbished'].includes(p.condition)))
  assert.equal(selectedProduct(byId('gs-ssd'),'2tb').wasPrice,null)
  assert.equal(selectedProduct(byId('gs-binder'),'forged'),null)
  assert.match(cartError([{pid:'gs-graded-card',qty:1},{pid:'gs-graded-card',qty:1}]),/stock/)
})

test('gamestop catalog: every department, specialist hub and brand is a real destination',async()=>{
  const srv=await startServer()
  try{const c=srv.client();const home=await c.get('/gamestop/')
    assert.match((await c.get("/gamestop/static/style.css")).text,/gaming-campaign.png/);assert.match(home.text,/Level up your PC setup/)
    for(const path of [...DEPARTMENTS.map(d=>d.id),'deals','pre-owned','retro','graded-trading-cards','new-and-upcoming','only-at-gamestop','playstation','xbox','nintendo-switch','gaming-accessories/controllers','brands/Atrix']){
      const result=await c.get('/gamestop/'+path);assert.equal(result.status,200,path);assert.ok(ids(result.text).length,path)
    }
    const digital=await c.get('/gamestop/digital-store');assert.equal(digital.status,200);assert.match(digital.text,/not offered online/)
    const out=await c.get('/gamestop/products/gs-console-stand');assert.match(out.text,/disabled>Out of stock/)
    const mug=await c.get('/gamestop/products/gs-mug');assert.match(mug.text,/Glazed ceramic/);assert.doesNotMatch(mug.text,/ESRB|Release Date:|Arrives on.*release/)
  }finally{await srv.close()}
})

test('gamestop catalog: filters compose with OR within a facet, retain sorting and pagination',async()=>{
  const srv=await startServer()
  try{const c=srv.client();const r=await c.get('/gamestop/search?brand=Atrix&brand=CoreTech&availability=instock&sort=price_low')
    const first=ids(r.text);assert.equal(first.length,12)
    const prices=first.map(id=>byId(id).price);assert.deepEqual(prices,[...prices].sort((a,b)=>a-b))
    const secondLink=[...r.text.matchAll(/href="([^"]+)"/g)].map(m=>m[1].replaceAll('&amp;','&')).find(x=>x.includes('page=2'))
    assert.match(secondLink,/brand=Atrix/);assert.match(secondLink,/brand=CoreTech/);assert.match(secondLink,/sort=price_low/)
    const second=ids((await c.get(secondLink)).text);assert.ok(second.length);assert.ok(second.every(id=>!first.includes(id)))
    const combined=await c.get('/gamestop/gaming-accessories?platform=ps5&brand=Atrix&sort=price_low')
    assert.ok(ids(combined.text).length);for(const id of ids(combined.text)){assert.equal(byId(id).brand,'Atrix');assert.ok(byId(id).platforms.includes('ps5'))}
    const empty=await c.get('/gamestop/pc-gaming?brand=NoSuchBrand');assert.match(empty.text,/couldn't find any results/);assert.match(empty.text,/Clear all filters/)
  }finally{await srv.close()}
})

test('gamestop catalog: selected option and trusted prices persist through ordinary checkout',async()=>{
  const srv=await startServer()
  try{const c=srv.client()
    const pdp=await c.get('/gamestop/products/gs-binder?variant=red');assert.match(pdp.text,/\$27.99/);assert.match(pdp.text,/Color: Red/)
    await c.post('/gamestop/cart/add',{pid:'gs-binder',variant:'red',qty:'2',price:'0.01',kind:'game'})
    await c.post('/gamestop/cart/add',{pid:'gs-dualsense-white',variant:'preowned',qty:'1'})
    const cart=await c.get('/gamestop/cart');assert.match(cart.text,/Color: Red/);assert.match(cart.text,/Pre-Owned/);assert.match(cart.text,/\$110.97/)
    const checkout=await c.post('/gamestop/checkout/login',{action:'guest'})
    const done=await c.post('/gamestop/checkout',{...ORDER,reviewToken:token(checkout.text)})
    assert.equal(done.status,200);assert.match(done.text,/Thank you for your order/);assert.match(done.text,/Color: Red/)
    const [order]=await c.json('/api/orders?store=gamestop');assert.ok(order.items.every(i=>i.kind==='other'))
    assert.deepEqual(order.items.map(i=>i.unit_price),[27.99,54.99]);assert.equal(order.totals.subtotal,110.97)
    assert.deepEqual(order.meta.items.map(i=>i.options),[{Color:'Red'},{Condition:'Pre-Owned'}]);assert.doesNotMatch(order.fulfillment.eta,/Arrives on/)
  }finally{await srv.close()}
})

test('gamestop catalog: reject malformed quantity/options and enforce duplicate-line stock',async()=>{
  const srv=await startServer()
  try{const c=srv.client()
    for(const qty of ['0','-1','1.5','6','Infinity','abc'])assert.equal((await c.post('/gamestop/cart/add',{pid:'gs-binder',variant:'red',qty})).status,400,qty)
    assert.equal((await c.post('/gamestop/cart/add',{pid:'gs-binder',variant:'unknown'})).status,400)
    assert.equal((await c.post('/gamestop/cart/add',{pid:'gs-mug',variant:'fake'})).status,400)
    assert.equal((await c.post('/gamestop/cart/add',{pid:'gs-tshirt',variant:'xl'})).status,400)
    assert.equal((await c.post('/gamestop/cart/add',{pid:'gs-binder',optionColor:'Injected'})).status,400)
    await c.post('/gamestop/cart/add',{pid:'gs-binder',variant:'red'})
    await c.post('/gamestop/cart/add',{pid:'gs-binder',variant:'red'})
    const cart=await c.get('/gamestop/cart');assert.equal((cart.text.match(/name="line"/g)||[]).length,2)
    assert.equal((await c.post('/gamestop/cart/add',{pid:'gs-binder',variant:'red'})).status,400)
    const line=fieldValue(cart.text,'line')
    for(const qty of ['1.5','0','-2','6','2'])assert.equal((await c.post('/gamestop/cart/update',{line,qty})).status,400,qty)
    assert.equal((await c.post('/gamestop/cart/update',{line:'9999',qty:'1'})).status,400)
  }finally{await srv.close()}
})

test('gamestop catalog: stale review and final stock/fulfillment/address checks block purchase',async()=>{
  const srv=await startServer();const p=byId('gs-mug'),oldStock=p.stock
  try{const c=srv.client();await c.post('/gamestop/cart/add',{pid:p.id})
    const checkout=await c.post('/gamestop/checkout/login',{action:'guest'})
    await c.post('/gamestop/cart/add',{pid:'gs-plush'})
    const stale=await c.post('/gamestop/checkout',{...ORDER,reviewToken:token(checkout.text)});assert.equal(stale.status,400);assert.match(stale.text,/cart changed/)
    assert.deepEqual(await c.json('/api/orders?store=gamestop'),[])
    let page=await c.get('/gamestop/checkout');p.stock=0
    const soldout=await c.post('/gamestop/checkout',{...ORDER,reviewToken:token(page.text)});assert.equal(soldout.status,400);assert.match(soldout.text,/stock/)
    p.stock=oldStock
    for(const extra of [{shippingMethod:'forged'},{shippingMethod:'__proto__'},{shippingMethod:'constructor'},{shippingMethod:'toString'},{paymentMethod:'forged'},{fulfillment:'pickup'},{stateCode:'HI'},{giftCardNumber:'999999'}]){
      page=await c.get('/gamestop/checkout');const invalid=await c.post('/gamestop/checkout',{...ORDER,...extra,reviewToken:token(page.text)});assert.equal(invalid.status,400)
    }
    assert.deepEqual(await c.json('/api/orders?store=gamestop'),[])
  }finally{p.stock=oldStock;await srv.close()}
})

test('gamestop catalog: every stocked ordinary fixture purchases as other',async()=>{
  const srv=await startServer()
  try{const c=srv.client();const ordinary=PRODUCTS.filter(p=>p.kind==='other'&&p.stock>0)
    for(const p of ordinary){const response=await c.post('/gamestop/cart/add',{pid:p.id});assert.equal(response.status,200,p.id)}
    const checkout=await c.post('/gamestop/checkout/login',{action:'guest'})
    const result=await c.post('/gamestop/checkout',{...ORDER,reviewToken:token(checkout.text)});assert.match(result.text,/Thank you/)
    const [order]=await c.json('/api/orders?store=gamestop');assert.equal(order.items.length,ordinary.length)
    for(const item of order.items){assert.equal(item.kind,'other');assert.equal(item.unit_price,selectedProduct(byId(item.sku)).price)}
  }finally{await srv.close()}
})


test('gamestop verification: duplicate checkout fields reject safely and direct account switch invalidates review', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    await c.post('/gamestop/login', { email: 'tester@example.com', password: 'Password123!' })
    await c.post('/gamestop/cart/add', { pid: 'gs-mug' })
    let page = await c.get('/gamestop/checkout')
    const duplicate = new URLSearchParams({ ...ORDER, reviewToken: token(page.text) })
    duplicate.append('firstName', 'Injected duplicate')
    let response = await c.post('/gamestop/checkout', duplicate)
    assert.equal(response.status, 400)
    assert.match(response.text, /value="123 Ocean Dr"/)
    assert.deepEqual(await c.json('/api/orders?store=gamestop'), [])
    page = await c.get('/gamestop/checkout')
    const reviewToken = token(page.text)
    await c.post('/gamestop/account/create', { firstName:'Second',lastName:'Account',email:'verification-switch@example.com',password:'Password123!',confirmPassword:'Password123!' })
    response = await c.post('/gamestop/checkout', { ...ORDER, reviewToken })
    assert.equal(response.status, 400)
    assert.match(response.text, /cart changed/)
    assert.deepEqual(await c.json('/api/orders?store=gamestop'), [])
  } finally { await srv.close() }
})
