import { assertProductGallery } from './product-gallery-assertions.js'
import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer, fieldValue } from './helpers.js'
import { PRODUCTS, DEPARTMENTS, CAMPAIGNS, BRANDS, slug, search, selectedProduct } from '../stores/argos/data.js'
const DETAILS={first_name:'Alex',last_name:'Tester',phone:'07700 900123',line1:'10 High Street',city:'London',postcode:'SW1A 1AA',method:'ship'}
const CARD={name_on_card:'Alex Tester',card_number:'4242424242424242',expiry:'12/99',cvv:'123',billing_same:'1',terms:'1'}
const main=html=>html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)[1]
const cardSkus=html=>[...main(html).matchAll(/<article class="product-card"><a href="\/argos\/product\/(\d+)/g)].map(m=>m[1])
const path=r=>new URL(r.url).pathname
async function add(c,sku,variant='',qty='1'){
  await c.post(`/argos/product/${sku}/stock`,{postcode:'SW1A 1AA',variant})
  return c.post('/argos/trolley/add',{sku,variant,qty,age_confirmed:'1',unit_price:'0',kind:'game',platform:'xbox'})
}
async function payment(c,details=DETAILS){
  await c.post('/argos/account',{action:'guest',email:'catalog@example.com'})
  return c.post('/argos/checkout/details',details)
}

test('argos catalog: 500 products, complete hubs and scoped leaf/brand/campaign destinations',async()=>{
  const srv=await startServer()
  try{
    const c=srv.client(), ordinary=PRODUCTS.filter(p=>p.kind==='other')
    assert.equal(PRODUCTS.length,500)
    assert.equal(new Set(PRODUCTS.slice(0,52).filter(p=>p.kind==='other').map(p=>p.family)).size,50)
    const home=main((await c.get('/argos/')).text)
    assert.match(home,/home-campaign.png/)
    assert.match(home,/<a href="\/argos\/events\/home-refresh"><img src="\/static\/art\/depth\/home-campaign.png"[^>]*><div><h2>Make room for what you love/)
    for(const d of DEPARTMENTS){
      const hub=await c.get(`/argos/browse/${d.id}`)
      assert.equal(hub.status,200)
      assert.match(main(hub.text),/Choosing /)
      for(const family of new Set(PRODUCTS.filter(p=>p.department===d.id).map(p=>p.family))){
        const leaf=await c.get(`/argos/browse/${d.id}/${slug(family)}`)
        assert.equal(leaf.status,200)
        const found=cardSkus(leaf.text)
        assert.ok(found.length)
        assert.ok(found.every(s=>PRODUCTS.find(p=>p.sku===s).family===family))
      }
    }
    for(const brand of BRANDS){
      const r=await c.get(`/argos/brands/${slug(brand)}`)
      assert.equal(r.status,200)
      assert.ok(cardSkus(r.text).every(s=>PRODUCTS.find(p=>p.sku===s).brand===brand))
    }
    for(const event of CAMPAIGNS){
      const r=await c.get(`/argos/events/${event.id}`)
      assert.equal(r.status,200)
      assert.ok(cardSkus(r.text).length)
      assert.ok(cardSkus(r.text).every(s=>event.deal ? PRODUCTS.find(p=>p.sku===s).deal : event.departments.includes(PRODUCTS.find(p=>p.sku===s).department)))
    }
    assert.equal((await c.get('/argos/browse/missing')).status,404)
    assert.equal((await c.get('/argos/browse/toys/kettles')).status,404)
    assert.equal((await c.get('/argos/brands/missing')).status,404)
  }finally{await srv.close()}
})

test('argos catalog: composed facets, OR brands, sorting before pagination, preserved links and empty recovery',async()=>{
  const srv=await startServer()
  try{
    const c=srv.client()
    const url='/argos/search?category=Appliances&brand=Russell+Hobbs&brand=Cookworks&min=20&max=40&rating=4&method=pickup&sort=price-desc'
    const r=await c.get(url), skus=cardSkus(r.text)
    assert.deepEqual(skus,['9901304','9901005','9901303','9901301'])
    assert.match(main(r.text),/Applied filters/)
    assert.match(main(r.text),/value="Russell Hobbs" checked/)
    const all=search('',{sort:'price-asc'})
    const first=await c.get('/argos/search?sort=price-asc'),second=await c.get('/argos/search?sort=price-asc&page=2')
    assert.deepEqual(cardSkus(first.text),all.slice(0,12).map(p=>p.sku))
    assert.deepEqual(cardSkus(second.text),all.slice(12,24).map(p=>p.sku))
    assert.match(main(second.text),/sort=price-asc&amp;page=3/)
    const kettle=await c.get('/argos/search?category=Appliances&capacity=1.7+litres')
    assert.deepEqual(cardSkus(kettle.text),['9901005'])
    assert.deepEqual(cardSkus((await c.get('/argos/search?q=9901103')).text),['9901103'])
    assert.match(main((await c.get('/argos/search?q=impossible&category=Toys')).text),/0 products/)
    assert.match(main((await c.get('/argos/search?q=impossible&category=Toys')).text),/Clear search and filters/)
    assert.match(first.text,/list="search-suggestions"/)
    assert.ok(search('',{rating:'4.8'}).every(p=>p.rating>=4.8))
  }finally{await srv.close()}
})

test('argos catalog: contextual variants, truthful artwork and stock gate reject invalid and sold-out options',async()=>{
  const srv=await startServer()
  try{
    const c=srv.client()
    let r=await c.get('/argos/product/9901005?variant=steel')
    assert.match(main(r.text),/Brushed Steel/)
    assert.match(main(r.text),/£34\.99/)
    await assertProductGallery(c,r.text,'argos','9901005','steel')
    assert.match(main(r.text),/Stainless steel/)
    assert.doesNotMatch(main(r.text),/pre-order|No disc included|name="age_confirmed"/)
    assert.equal((await c.get('/argos/product/9901005?variant=free')).status,400)
    r=await c.post('/argos/trolley/add',{sku:'9901005',variant:'steel',qty:'1'})
    assert.equal(r.status,400)
    assert.match(main(r.text),/Check stock using your postcode/)
    await c.post('/argos/product/9901005/stock',{postcode:'SW1A 1AA',variant:'steel'})
    assert.equal((await c.post('/argos/trolley/add',{sku:'9901005',variant:'fake',qty:'1'})).status,400)
    assert.equal((await c.post('/argos/trolley/add',{sku:'9901103',variant:'256gb',qty:'1'})).status,400)
    assert.match(main((await c.get('/argos/product/9901103?variant=256gb')).text),/<button disabled>Out of stock/)
    r=await add(c,'9901005','steel','2')
    assert.match(main(r.text),/£69\.98/)
    assert.match(main(r.text),/href="\/argos\/product\/9901005\?variant=steel"/)
    assert.equal((await add(c,'9901005','steel')).status,400)
    assert.equal((await add(c,'9901005','black','4')).status,400,'aggregate quantity cannot exceed five across variants')
    assert.equal((await add(c,'9901005','black','3')).status,200)
    assert.equal((await c.post('/argos/trolley/update',{sku:'9901005',qty:'1',action:'update'})).status,400,'ambiguous SKU requires exact line key')
    assert.equal((await c.post('/argos/trolley/update',{sku:'9901005',line_key:'9901005:steel',qty:'1.5',action:'update'})).status,400)
    assert.equal((await c.post('/argos/trolley/update',{sku:'9901005',line_key:'9901005:steel',qty:'3',action:'update'})).status,400)
    assert.equal((await c.post('/argos/trolley/update',{sku:'9901005',line_key:'9901005:steel',qty:'1',action:'update'})).status,200)
    const review=await payment(c), token=fieldValue(review.text,'review_token')
    const done=await c.post('/argos/checkout/payment',{...CARD,review_token:token})
    assert.equal(done.status,200)
    const [order]=await c.json('/api/orders?store=argos')
    assert.equal(order.meta.preorder,false)
    assert.deepEqual(order.items.map(i=>[i.kind,i.unit_price,i.qty]),[['other',34.99,1],['other',29.99,3]])
    assert.deepEqual(order.meta.options.map(v=>v.variant_id),['steel','black'])
    assert.equal(order.fulfillment.eta,'Within 3–5 working days')
    assert.doesNotMatch(main(done.text),/pre-order|November|undefined/)
  }finally{await srv.close()}
})

test('argos catalog: all ordinary catalog listings really purchase and remain kind other',async()=>{
  const srv=await startServer()
  try{
    for(const p of PRODUCTS.filter(p=>p.kind==='other')){
      const c=srv.client()
      assert.equal((await add(c,p.sku)).status,200,p.title)
      const review=await payment(c)
      assert.equal(path(review),'/argos/checkout/payment',p.title)
      assert.doesNotMatch(main(review.text),/pre-order|Grand Theft Auto VI/,p.title)
      const done=await c.post('/argos/checkout/payment',{...CARD,review_token:fieldValue(review.text,'review_token')})
      assert.match(path(done),/\/argos\/checkout\/confirmation\/\d+$/,p.title)
    }
    const orders=await srv.client().json('/api/orders?store=argos')
    assert.equal(orders.length,PRODUCTS.filter(p=>p.kind==='other').length)
    assert.ok(orders.every(o=>o.items.length===1&&o.items[0].kind==='other'&&!o.meta.preorder))
    assert.equal(new Set(orders.map(o=>o.items[0].sku)).size,PRODUCTS.filter(p=>p.kind==='other').length)
  }finally{await srv.close()}
})

test('argos catalog: bulky collection rejected, trolley mutations and old review tokens cannot place stale orders',async()=>{
  const srv=await startServer()
  try{
    const c=srv.client()
    await add(c,'9901004')
    const bad=await payment(c,{...DETAILS,method:'pickup',collection_point:'London Central Argos'})
    assert.equal(bad.status,400)
    assert.match(main(bad.text),/not available for Click &amp; Collect/)
    let review=await c.post('/argos/checkout/details',DETAILS), oldToken=fieldValue(review.text,'review_token')
    assert.match(main(review.text),/7–14 days/)
    await c.post('/argos/trolley/update',{sku:'9901004',qty:'2',action:'update'})
    assert.equal(path(await c.post('/argos/checkout/payment',{...CARD,review_token:oldToken})),'/argos/checkout/details')
    review=await c.post('/argos/checkout/details',DETAILS)
    assert.notEqual(fieldValue(review.text,'review_token'),oldToken)
    assert.equal((await c.post('/argos/checkout/payment',{...CARD,review_token:oldToken})).status,409)
    await add(c,'9901005')
    assert.equal(path(await c.post('/argos/checkout/payment',CARD)),'/argos/checkout/details')
    await c.post('/argos/checkout/details',DETAILS)
    await c.post('/argos/trolley/update',{sku:'9901005',action:'remove'})
    assert.equal(path(await c.post('/argos/checkout/payment',CARD)),'/argos/checkout/details')
    assert.equal((await c.json('/api/orders?store=argos')).length,0)
  }finally{await srv.close()}
})

test('argos catalog: current trusted stock, variant price and fulfillment are revalidated at final payment',async()=>{
  const srv=await startServer(), kettle=PRODUCTS.find(p=>p.sku==='9901005'), sofa=PRODUCTS.find(p=>p.sku==='9901004')
  const stock=kettle.variants[1].stock, price=kettle.variants[1].unit_price, methods=sofa.methods
  try{
    const c=srv.client()
    await add(c,'9901005','steel'); await payment(c)
    kettle.variants[1].stock=0
    assert.equal((await c.post('/argos/checkout/payment',CARD)).status,400)
    kettle.variants[1].stock=stock;kettle.variants[1].unit_price=99
    assert.equal((await c.post('/argos/checkout/payment',CARD)).status,400)
    kettle.variants[1].unit_price=price
    const d=srv.client();await add(d,'9901004');await payment(d)
    sofa.methods=[]
    assert.equal((await d.post('/argos/checkout/payment',CARD)).status,400)
    assert.equal((await c.json('/api/orders?store=argos')).length,0)
  }finally{kettle.variants[1].stock=stock;kettle.variants[1].unit_price=price;sofa.methods=methods;await srv.close()}
})
