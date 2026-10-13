import { assertProductGallery } from './product-gallery-assertions.js'
import { galleryPrimaryImage, galleryImageUrls } from './helpers.js'
import test from 'node:test'
import assert from 'node:assert/strict'
import { products, departments, brands, collections, candidateVariants, filterCatalog, slugify } from '../stores/williams-sonoma/catalog.js'
import { originalProducts } from '../stores/williams-sonoma/original-products.js'
import { inventory } from '../stores/williams-sonoma/inventory.js'
import { PHOTO_KEYS } from '../lib/product-photos.js'
import { startServer, fieldValue } from './helpers.js'

const root = '/williams-sonoma'
const ids = html => [...html.matchAll(/data-product="([^"]+)"/g)].map(m => m[1])
const buyer = { email:'ws-catalog@example.com', first_name:'Alex', last_name:'Tester', address:'12 Kitchen Lane', city:'Austin', state:'TX', postal_code:'78701', card_name:'Alex Tester', card_number:'4242424242424242', card_expiry:'12/39', card_cvv:'123' }
const formOptions = v => Object.fromEntries(Object.entries(v.options).map(([k,value])=>[`option_${k}`,value]))

test('Williams Sonoma 500-listing inventory keeps distinct identities, five brands and non-game availability',()=>{
  assert.equal(inventory.length,500)
  assert.equal(new Set(products.map(p=>p.title.toLowerCase())).size,500)
  assert.equal(products.filter(p=>!p.catalogRange).length,40)
  assert.equal(products.filter(p=>p.catalogRange).length,460)
  assert.deepEqual(new Set(products.map(p=>p.brandSlug)),new Set(brands.map(b=>b.slug)))
  for(const [index,entry] of inventory.entries()){
    const p=products[index]
    assert.equal(entry.id,p.id);assert.equal(entry.type,'other');assert.equal(entry.platform,null)
    assert.equal(entry.available,candidateVariants(p).some(v=>v.stock>0&&v.available))
    assert.doesNotMatch(`${p.id} ${p.title} ${p.description}`,/\bgta\s*[6v]|grand theft auto/i)
    if(p.catalogRange){assert.equal(p.photo,null);assert.match(p.art,/^M/);assert.deepEqual(p.options,{});assert.ok(p.description.length>50)}
  }
  assert.deepEqual(inventory.filter(p=>!p.available).map(p=>p.id),['honing-steel'])
})

test('Williams Sonoma all 500 PDPs resolve; every new department searches by title and all 42 pages cover the catalog',async()=>{
  const srv=await startServer()
  try{
    const c=srv.client()
    for(const p of products){
      const result=await c.get(`${root}/product/${p.id}`)
      assert.equal(result.status,200,p.id)
      assert.match(result.text,/Summary & dimensions/)
      assert.match(result.text,/Use & care/)
      assert.ok(galleryImageUrls(result.text).length >= 3, p.id)
    }
    for(const d of departments){
      const p=products.find(p=>p.catalogRange&&p.category===d.name)
      const query=new URLSearchParams({q:p.title,category:p.category,brand:p.brandSlug,material:p.material,stock:'in-stock'})
      assert.deepEqual(ids((await c.get(`${root}/search?${query}`)).text),[p.id],p.id)
    }
    const all=[]
    for(let page=1;page<=42;page++){
      const result=await c.get(`${root}/search?sort=price-asc&page=${page}`)
      all.push(...ids(result.text))
      assert.match(result.text,new RegExp(`page=${page}" aria-current="page"`))
    }
    assert.equal(all.length,500);assert.equal(new Set(all).size,500)
    assert.deepEqual(all,filterCatalog({sort:'price-asc'}).map(p=>p.id))
    const last=await c.get(`${root}/search?page=999`)
    assert.deepEqual(ids(last.text),products.slice(492).map(p=>p.id));assert.match(last.text,/Showing 493–500/)
  }finally{await srv.close()}
})

test('Williams Sonoma contains 500 distinct families with preserved original products and truthful photography or native art',()=>{
  assert.equal(products.length,500)
  assert.equal(new Set(products.map(p=>p.id)).size,500)
  assert.deepEqual(departments.map(d=>products.filter(p=>p.category===d.name).length),[80,85,50,65,75,80,65])
  for(const original of originalProducts){const p=products.find(p=>p.id===original.id); assert.equal(p.title,original.title);assert.equal(p.price,original.price)}
  assert.deepEqual(products.find(p=>p.id==='skillet').options,{Finish:['Stainless steel','Brushed steel']})
  for(const p of products){
    for(const key of ['material','use','size','includes','care','compatibility','brand','type'])assert.ok(p[key],`${p.id}: ${key}`)
    assert.ok(p.photo ? PHOTO_KEYS.includes(p.photo) : /^M/.test(p.art),`${p.id} truthful image`)
    for(const v of candidateVariants(p)){
      assert.ok(v.price>0&&Number.isInteger(v.stock)&&v.stock>=0)
      assert.ok(v.photo ? PHOTO_KEYS.includes(v.photo) : /^M/.test(v.art),`${p.id} variant image`)
      for(const photo of v.gallery||[])assert.ok(PHOTO_KEYS.includes(photo))
      assert.deepEqual(Object.keys(v.options),Object.keys(p.options))
      assert.ok(Object.entries(v.options).every(([k,value])=>p.options[k].includes(value)))
    }
  }
})

test('Williams Sonoma facet matching intersects price, capacity and availability on the same actual SKU',()=>{
  assert.deepEqual(filterCatalog({category:'Cookware',capacity:'2 qt',price:'90',stock:'out-of-stock'}),[])
  assert.deepEqual(filterCatalog({category:'Cookware',capacity:'2 qt',price:'100',stock:'out-of-stock'}).map(p=>p.id),['saucepan'])
  const available=filterCatalog({category:'Cookware',capacity:'3 qt',price:'110',stock:'in-stock'})
  assert.deepEqual(available.map(p=>p.id),['saucepan','saute-pan'])
  assert.equal(available[0].matchedVariant.options.Finish,'Polished steel')
  assert.equal(available[0].displayPrice,109)
  assert.deepEqual(filterCatalog({category:'Cookware',material:'Enameled cast iron',capacity:'7 qt',price:'200',stock:'in-stock'}),[])
  assert.ok(filterCatalog({q:'frying pans'}).some(p=>p.id==='skillet'))
  assert.deepEqual(filterCatalog({q:'GTA 6'}),[])
  assert.deepEqual(filterCatalog({brand:'unknown'}),[])
  assert.ok(filterCatalog({collection:'sale'}).every(p=>p.displayPrice<=50))
  assert.ok(filterCatalog({category:'Cutlery',size:'7 inch',rating:'4.5'}).every(p=>p.id==='santoku'))
})

test('Williams Sonoma department, subcategory, brand and collection routes are populated; URL refinements page and sort correctly',async()=>{
  const srv=await startServer()
  try{
    const c=srv.client()
    for(const path of new Set(['/',...departments.map(d=>`/category/${d.slug}`),...products.map(p=>`/category/${departments.find(d=>d.name===p.category).slug}/${slugify(p.type)}`),...brands.map(b=>`/brand/${b.slug}`),...collections.map(x=>`/collection/${x.slug}`)])){
      const page=await c.get(root+path)
      assert.equal(page.status,200,path);assert.match(page.text,/ws-wordmark/);assert.ok(ids(page.text).length,path)
    }
    const first=await c.get(root+'/search?sort=price-asc'),second=await c.get(root+'/search?sort=price-asc&page=2')
    assert.equal(ids(first.text).length,12);assert.equal(ids(second.text).length,12)
    assert.equal(new Set([...ids(first.text),...ids(second.text)]).size,24)
    const prices=[...first.text.matchAll(/data-price="([\d.]+)"/g)].map(m=>Number(m[1]))
    assert.deepEqual(prices,[...prices].sort((a,b)=>a-b))
    assert.match(second.text,/Showing 13–24/)
    const filtered=await c.get(root+'/search?category=Cookware&capacity=3+qt&price=110&stock=in-stock')
    assert.deepEqual(ids(filtered.text),['saucepan','saute-pan']);assert.match(filtered.text,/aria-label="Remove Capacity filter"/)
    assert.match(filtered.text,/Stainless steel · 3 qt/);assert.match(filtered.text,/product\/saucepan\?Capacity=3\+qt&amp;Finish=Polished\+steel/)
    assert.match(filtered.text,/category=Cookware&amp;price=110&amp;stock=in-stock/)
    // GTA 6 now has captured kitchen matches; use a separate unknown term to
    // exercise the generic catalog's empty filtered results and filter removal.
    const empty=await c.get(root+'/search?q=unmatched-catalog-term&material=Stainless+steel')
    assert.equal(ids(empty.text).length,0);assert.match(empty.text,/No products match/);assert.match(empty.text,/Remove Material filter/)
    const captured=await c.get(root+'/search/results.html?words=gta+6')
    assert.match(captured.text,/198 search results for/)
    assert.equal((captured.text.match(/data-product-kind="other"/g)||[]).length,198)
    const suggestions=await c.json(root+'/search/suggestions?q=whisk')
    assert.equal(suggestions.suggestions[0].url,root+'/product/whisk')
    for(const path of ['/category/missing','/category/cookware/missing','/brand/missing','/collection/missing'])assert.equal((await c.get(root+path)).status,404)
  } finally{await srv.close()}
})

test('Williams Sonoma PDP option selection, honest gallery, meaningful comparison and unavailable combinations are consistent',async()=>{
  const srv=await startServer()
  try{
    const c=srv.client()
    const brushed=await c.get(root+'/product/skillet?Finish=Brushed+steel')
    await assertProductGallery(c, brushed.text, 'williams-sonoma', 'skillet')
    assert.match(brushed.text,/data-selected-price="64.99"/)
    assert.equal(fieldValue(brushed.text,'option_Finish'),'Brushed steel')
    const unavailable=await c.get(root+'/product/saucepan?Capacity=2+qt&Finish=Brushed+steel')
    assert.match(unavailable.text,/type="submit" disabled>Unavailable/)
    assert.match(unavailable.text,/data-selected-price="95"/)
    const sage=await c.get(root+'/product/dutch-oven?Capacity=7+qt&Color=Sage&view=open')
    const views = await assertProductGallery(c, sage.text, 'williams-sonoma', 'dutch-oven')
    assert.equal(galleryPrimaryImage(sage.text), views[2])
    assert.match(sage.text,/Sage Dutch oven and fitted lid/);assert.match(sage.text,/even-heating 7-quart Dutch oven/);assert.doesNotMatch(sage.text,/even-heating 5-quart Dutch oven/)
    assert.equal(fieldValue(sage.text,'option_Capacity'),'7 qt')
    assert.equal((await c.get(root+'/product/skillet?Finish=Blue')).status,400)
    assert.equal((await c.get(root+'/product/skillet?Finish=Stainless+steel&Finish=Brushed+steel')).status,400)
    assert.equal((await c.post(root+'/cart/add',{id:'saucepan',option_Capacity:'2 qt',option_Finish:'Brushed steel'})).status,400)
    assert.equal((await c.post(root+'/cart/add',{id:'skillet'})).status,400)
    assert.equal((await c.post(root+'/cart/add',{id:'skillet',option_Finish:'Wood'})).status,400)
    const compare=await c.get(root+'/compare?id=skillet&id=dutch-oven')
    assert.equal(compare.status,200);assert.match(compare.text,/Enameled cast iron/);assert.match(compare.text,/Stainless steel/);assert.match(compare.text,/Compatibility/)
    assert.equal((await c.get(root+'/compare?id=skillet&id=missing')).status,400)
    for(const path of ['/brands','/registry','/recipes','/events','/track-order',...departments.map(d=>`/guides/${d.slug}`)])assert.equal((await c.get(root+path)).status,200)
  } finally{await srv.close()}
})

test('Every original Williams Sonoma SKU and each new department sample buys through canonical checkout with trusted prices, zero fees, other kind and no GTA',async()=>{
  const srv=await startServer()
  try{
    let index=0,unavailable=0
    const samples=[...products.filter(p=>!p.catalogRange),...departments.map(d=>products.find(p=>p.catalogRange&&p.category===d.name))]
    for(const p of samples)for(const v of candidateVariants(p)){
      const c=srv.client(),run=`ws-agent88-${index++}`
      await c.get(root+`/?run=${run}`)
      const added=await c.post(root+'/cart/add',{id:p.id,qty:'1',kind:'game',unit_price:'0.01',...formOptions(v)})
      if(!v.stock){assert.equal(added.status,400);unavailable++;continue}
      assert.equal(added.status,200,p.id)
      assert.match(added.text,/ws-wordmark/)
      const review=await c.get(root+'/checkout')
      assert.match(review.text,/ws-wordmark/)
      const purchased=await c.post(root+'/checkout',{...buyer,checkout_token:fieldValue(review.text,'checkout_token')})
      assert.equal(purchased.status,200,p.id);assert.match(purchased.text,/Order confirmed/)
      const [order]=await c.json(`/api/orders?store=williams-sonoma&run=${run}`)
      assert.equal(order.items[0].kind,'other');assert.equal(order.items[0].sku,p.id)
      assert.equal(order.items[0].unit_price,v.price);assert.equal(order.meta.gta6_available,false)
      assert.equal(order.totals.shipping,0);assert.equal(order.totals.tax,0)
      assert.equal(order.totals.total,v.price)
    }
    assert.equal(unavailable,3)
  }finally{await srv.close()}
})

test('Williams Sonoma retains canonical stock, scalar quantity and stale-review boundaries',async()=>{
  const srv=await startServer()
  try{
    const c=srv.client()
    await c.get(root+'/?run=ws-agent88-review')
    assert.equal((await c.post(root+'/cart/add',{id:'saucepan',option_Capacity:'3 qt',option_Finish:'Brushed steel',qty:'4'})).status,400)
    assert.equal((await c.post(root+'/cart/add',new URLSearchParams([['id','whisk'],['qty','1'],['qty','2']]))).status,400)
    assert.equal((await c.post(root+'/cart/add',{id:'skillet',option_Finish:'Stainless steel',qty:'1'})).status,200)
    const review=await c.get(root+'/checkout'),token=fieldValue(review.text,'checkout_token')
    await c.post(root+'/cart/add',{id:'whisk',qty:'1'})
    const stale=await c.post(root+'/checkout',{...buyer,checkout_token:token})
    assert.equal(stale.status,409)
    assert.doesNotMatch(stale.text,/4242424242424242/)
    assert.deepEqual(await c.json('/api/orders?store=williams-sonoma&run=ws-agent88-review'),[])
  }finally{await srv.close()}
})
