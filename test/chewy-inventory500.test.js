import test from 'node:test'
import assert from 'node:assert/strict'
import { products, species, brands, categories } from '../stores/chewy/catalog.js'
import { inventory } from '../stores/chewy/inventory.js'
import { filterCatalog } from '../stores/chewy/depth.js'
import { startServer } from './helpers.js'
const ids=html=>[...html.matchAll(/data-product-id="([^"]+)"/g)].map(m=>m[1])

test('Chewy 500-listing inventory spans species and functions with truthful recurring eligibility',()=>{
 assert.equal(inventory.length,500)
 assert.equal(new Set(inventory.map(p=>p.id)).size,500)
 assert.equal(new Set(inventory.map(p=>p.title.toLowerCase())).size,500)
 assert.ok(inventory.every(p=>p.type==='other'&&p.platform===null&&!/(gta|grand theft auto)/i.test(p.title)))
 assert.deepEqual(inventory.filter(p=>!p.available).map(p=>p.id),['cooling-mat'])
 assert.deepEqual(species.map(s=>products.filter(p=>p.species.includes(s)).length),[107,105,54,54,60,48,41,36])
 assert.ok(brands.every(b=>products.filter(p=>p.brand===b).length>=30))
 assert.ok(categories.every(type=>products.filter(p=>p.type===type).length>=5))
 for(const p of products.slice(44)) {
   assert.ok(p.art&&p.photo===null&&p.material&&p.care&&p.pack,p.id)
   assert.ok(!/\d+$/.test(p.id),p.id)
   assert.equal(Object.keys(p.options).length,0,'sizes remain descriptive pack metadata')
   assert.equal(p.price,Number(p.price.toFixed(2)))
   if(p.autoship) assert.ok(['Food','Treats','Bedding','Aquarium Care'].includes(p.type),p.id)
   if(['Food','Treats'].includes(p.type)) assert.ok(p.animal&&p.foodForm!=='Not Food'&&p.flavor!=='Not Flavored',p.id)
 }
})

test('Chewy expanded food forms, species filtering, last-page PDP and Autoship enrollment work',async()=>{
 const srv=await startServer()
 try {
  const c=srv.client()
  const query={species:'Reptile',foodForm:'Powder',type:'Food',autoship:'eligible'}
  const matches=filterCatalog(query)
  assert.deepEqual(matches.map(p=>p.id),['crested-gecko-fruit-insect-mix-with-water-meal-powder'])
  const page=await c.get('/chewy/search?'+new URLSearchParams(query))
  assert.deepEqual(ids(page.text),matches.map(p=>p.id))
  assert.match(page.text,/<option value="Powder" selected>/)
  assert.ok(filterCatalog({species:'Small Pet',q:'guinea pig',type:'Food'}).every(p=>p.animal==='Guinea pig'))
  const last=await c.get('/chewy/search?sort=price-asc&page=42')
  assert.match(last.text,/500 results · Showing 493–500/)
  assert.equal(ids(last.text).length,8)
  assert.match(last.text,/page=41/)
  for(const id of ids(last.text)) assert.equal((await c.get('/chewy/product/'+id)).status,200)
  const item=products.find(p=>p.id==='dog-chicken-brown-rice-dry-kibble')
  const pdp=await c.get('/chewy/product/'+item.id)
  assert.match(pdp.text,/Start an Autoship schedule/)
  assert.doesNotMatch((await c.get('/chewy/product/dog-rubber-treat-ball')).text,/Start an Autoship schedule/)
  await c.post('/chewy/account',{email:'tester@example.com',password:'Password123!'})
  const address=await c.post('/chewy/account/addresses',{name:'Casey Tester',line1:'100 Test Lane',city:'Austin',state:'TX',postal_code:'78701',is_default:'yes'})
  const address_id=address.text.match(/\/account\/addresses\/(address-[a-f0-9]+)"/)[1]
  const created=await c.post('/chewy/account/autoship',{name:'Expanded food routine',product_id:item.id,qty:1,cadence:4,next_date:'2092-04-12',address_id})
  assert.equal(created.status,200)
  assert.match(created.text,/Dog chicken &amp; brown rice dry kibble/)
  assert.deepEqual(await c.json('/api/orders?store=chewy'),[])
  const planPath=new URL(created.url).pathname
  const cart=await c.post(planPath+'/action',{action:'order-now'})
  assert.match(cart.text,/Dog chicken &amp; brown rice dry kibble/)
  assert.match(cart.text,/\$32\.99/)
 }finally{await srv.close()}
})
