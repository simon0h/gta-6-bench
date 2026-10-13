import { assertProductGallery } from './product-gallery-assertions.js'
import { galleryPrimaryImage, galleryImageUrls } from './helpers.js'
import test from 'node:test'
import assert from 'node:assert/strict'
import { products, filterCatalog } from '../stores/sephora/catalog.js'
import { inventory } from '../stores/sephora/inventory.js'
import { eligibleForReplenishment } from '../stores/sephora/journeys.js'
import { startServer, fieldValue } from './helpers.js'
const ids = html => [...html.matchAll(/data-product="([^"]+)"/g)].map(m=>m[1])

test('Sephora 500-listing inventory has broad authored departments and nongame semantics', () => {
  assert.equal(inventory.length, 500)
  assert.equal(new Set(inventory.map(p=>p.id)).size, 500)
  assert.equal(new Set(inventory.map(p=>p.title.toLowerCase())).size, 500)
  assert.ok(inventory.every(p=>p.type==='other' && p.platform===null && p.available))
  assert.ok(inventory.every(p=>!/(gta|grand theft auto)/i.test(p.title)))
  assert.deepEqual(Object.fromEntries(['Makeup','Skincare','Hair','Fragrance','Bath & Body','Sets'].map(category=>[category,products.filter(p=>p.category===category).length])), {Makeup:100,Skincare:100,Hair:90,Fragrance:80,'Bath & Body':80,Sets:50})
  assert.ok(new Set(products.map(p=>p.type)).size>=45)
  for(const p of products.slice(40)) {
    assert.ok(p.photo===null && p.art && p.material && p.use, p.id)
    assert.ok(!/\d+$/.test(p.id), p.id)
    assert.equal(p.options.Size, undefined, 'formats are base formulas, not split size variants')
    assert.ok(p.price>0 && Number.isInteger(Math.round(p.price*100)), p.id)
    if(p.preferences.includes('Fragrance-free')) assert.match(p.description,/fragrance-free/i)
  }
  assert.ok(products.filter(p=>p.category==='Skincare'&&p.preferences.includes('Fragrance-free')).length>=90)
})

test('Sephora expanded filters, all 42 pages, final PDP and new refill plan remain connected', async () => {
  const srv=await startServer()
  try {
    const c=srv.client(),seen=[]
    for(let page=1;page<=42;page++) {
      const result=await c.get('/sephora/search?sort=price-asc&page='+page)
      assert.equal(result.status,200)
      assert.match(result.text,/500 results/)
      assert.equal(ids(result.text).length,page===42?8:12)
      seen.push(...ids(result.text))
      if(page===42) assert.match(result.text,/Showing 493–500/)
    }
    assert.equal(new Set(seen).size,500)
    const skin=filterCatalog({category:'Skincare',type:'Serum',skin:'Dry',preference:'Fragrance-free',q:'oat'})
    assert.deepEqual(skin.map(p=>p.id),['oat-facial-serum'])
    const hair=filterCatalog({category:'Hair',type:'Styling Cream',hair:'Curly',q:'argan'})
    assert.deepEqual(hair.map(p=>p.id),['argan-curl-styling-cream'])
    const scent=filterCatalog({category:'Fragrance',formulation:'Balm',scent:'Woody'})
    assert.equal(scent.length,4)
    const result=await c.get('/sephora/search?category=Skincare&type=Serum&skin=Dry&preference=Fragrance-free&q=oat')
    assert.deepEqual(ids(result.text),['oat-facial-serum'])
    const pdp=await c.get('/sephora/product/oat-facial-serum')
    await assertProductGallery(c, pdp.text, 'sephora', 'oat-facial-serum')
    assert.match(pdp.text,/data-selected-price="32"/)
    assert.match(pdp.text,/Plan a refill reminder/)
    assert.ok(eligibleForReplenishment(skin[0]))
    assert.ok(!eligibleForReplenishment(scent[0]))
    await c.post('/sephora/account',{email:'tester@example.com',password:'Password123!'})
    const saved=await c.post('/sephora/account/replenishment',{product:'oat-facial-serum',qty:1,cadence:60,next_date:new Date(Date.now()+60*86400000).toISOString().slice(0,10)})
    assert.equal(saved.status,200)
    assert.match(saved.text,/Oat facial serum/)
    assert.deepEqual(await c.json('/api/orders?store=sephora'),[])
    await c.post('/sephora/cart/add',{id:'oat-facial-serum',qty:1})
    assert.ok(fieldValue((await c.get('/sephora/checkout')).text,'checkout_token'))
  } finally { await srv.close() }
})
