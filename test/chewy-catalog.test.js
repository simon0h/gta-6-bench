import test from 'node:test'
import assert from 'node:assert/strict'
import { products, species, categories, brands, collections, slugify } from '../stores/chewy/catalog.js'
import { filterCatalog } from '../stores/chewy/depth.js'
import { PHOTO_KEYS } from '../lib/product-photos.js'
import { startServer, fieldValue } from './helpers.js'
const ids=html=>[...html.matchAll(/data-product-id="([^"]+)"/g)].map(m=>m[1])
const buyer={email:'chewy-catalog@example.com',first_name:'Casey',last_name:'Tester',address:'24 Pet Street',city:'Austin',state:'TX',postal_code:'78701',card_name:'Casey Tester',card_number:'4242424242424242',card_expiry:'12/39',card_cvv:'123'}

test('Chewy catalog is 500 distinct species-aware families with complete trusted variant metadata',()=>{
 assert.equal(products.length,500);assert.equal(new Set(products.map(p=>p.family)).size,500)
 assert.deepEqual(['dog-food','cat-bed','pet-bowl','dog-toy','cat-food','cat-tree','dog-leash','bird-feeder'].map(id=>products.find(p=>p.id===id).price),[34.99,27.99,12.99,8.99,23.99,54.99,15.99,19.99])
 assert.deepEqual(products.find(p=>p.id==='cat-bed').options.Size,['Small','Medium','Large'])
 assert.equal(products.find(p=>p.id==='cat-tree').photo,'cat-tree-two-level')
 assert.equal(products.filter(p=>p.photo).length,44)
 assert.deepEqual(['catnip-mouse','horse-grooming-mitt','chicken-feed'].map(id=>products.find(p=>p.id===id).photo),['catnip-mouse-gray','horse-mitt-blue','chicken-feed-pellets'])
 for(const p of products){assert.ok(p.species.length&&p.material&&p.care&&p.pack,p.id);assert.ok(p.photo?PHOTO_KEYS.includes(p.photo):p.art,p.id);assert.ok(p.species.every(s=>species.includes(s)),p.id);assert.ok(categories.includes(p.type));assert.ok(brands.includes(p.brand));assert.ok(Number.isInteger(p.stock)&&p.stock>=0);if(p.autoship)assert.deepEqual(p.cadenceWeeks,[2,4,6,8]);for(const v of p.variants||[]){assert.deepEqual(Object.keys(v.options),Object.keys(p.options));assert.ok(Object.entries(v.options).every(([k,value])=>p.options[k].includes(value)));assert.ok(v.price>0&&Number.isInteger(v.stock))}}
 assert.match(products.find(p=>p.id==='hamster-habitat').details.join(' '),/not a complete permanent home/)
})

test('Chewy refinements intersect on a single available offer and sort by its trusted price',()=>{
 assert.deepEqual(filterCatalog({species:'Cat',type:'Food',lifeStage:'Adult',foodForm:'Wet Food',flavor:'Chicken',size:'24 × 3 oz',brand:'Paw Meadow',price:'30-60',rating:'4',stock:'in-stock',autoship:'eligible'}).map(p=>[p.id,p.displayPrice]),[['wet-cat-food',34.99]])
 assert.deepEqual(filterCatalog({q:'harness',type:'Walking',size:'Medium',stock:'in-stock'}),[])
 assert.deepEqual(filterCatalog({type:'Walking',size:'Medium',stock:'out-of-stock'}).map(p=>p.id),['dog-harness'])
 assert.deepEqual(filterCatalog({q:'harness',size:'Medium',type:'Walking',price:'under-15'}),[])
 assert.deepEqual(filterCatalog({size:'Large',type:'Beds & Furniture',price:'15-30'}),[])
 assert.deepEqual(filterCatalog({species:'Fish',flavor:'Chicken'}),[])
 assert.deepEqual(filterCatalog({species:'Fish',price:'bogus'}),[])
 const sorted=filterCatalog({sort:'price-asc'}).map(p=>p.displayPrice);assert.deepEqual(sorted,[...sorted].sort((a,b)=>a-b))
 assert.ok(filterCatalog({category:'Other Animals'}).every(p=>p.category==='Other Animals'))
 assert.ok(filterCatalog({category:'Pet supplies'}).every(p=>p.species.length===2))
})

test('Chewy has populated species/category/brand/campaign hubs with 12-product pagination and removable URL facets',async()=>{
 const srv=await startServer();try{const c=srv.client();for(const route of ['',...species.map(s=>'/department/'+slugify(s)),...categories.map(s=>'/category/'+slugify(s)),...brands.map(s=>'/brand/'+slugify(s)),...Object.keys(collections).map(s=>'/collections/'+s)]){const page=await c.get('/chewy'+route);assert.equal(page.status,200,route);assert.match(page.text,/ch-header/);assert.match(page.text,/data-product-id=/,route)}
 const all=[];for(let i=1;i<=42;i++){const page=await c.get('/chewy/search?sort=price-asc&page='+i);const entries=ids(page.text);assert.equal(entries.length,i===42?8:12);all.push(...entries);assert.match(page.text,/sort=price-asc/)}assert.equal(new Set(all).size,500)
 const page=await c.get('/chewy/search?species=Dog&type=Walking&size=Large&stock=in-stock&sort=rating&page=1');assert.match(page.text,/aria-label="Remove Size \/ pack filter" href="\/chewy\/search\?species=Dog&amp;type=Walking&amp;stock=in-stock&amp;sort=rating"/);assert.deepEqual(ids(page.text),['dog-harness']);assert.match(page.text,/product\/dog-harness\?Size=Large/)
 for(const route of ['/department/unknown','/category/unknown','/brand/unknown','/collections/__proto__','/guides/unknown','/services/unknown'])assert.equal((await c.get('/chewy'+route)).status,404)
 for(const route of ['/brands','/guides','/guides/small-pet','/autoship','/services','/services/veterinary','/services/pharmacy','/services/my-pets'])assert.equal((await c.get('/chewy'+route)).status,200)
 }finally{await srv.close()}
})

test('Chewy PDP option price and stock match canonical cart; invalid or unavailable options cannot purchase',async()=>{
 const srv=await startServer();try{const c=srv.client();const pdp=await c.get('/chewy/product/cat-bed?Size=Large');assert.match(pdp.text,/data-selected-price="39.99"/);assert.match(pdp.text,/data-selected-stock="2"/);assert.match(pdp.text,/name="option_Size" value="Large"/);assert.match(pdp.text,/Large: 26 in diameter/)
 const unavailable=await c.get('/chewy/product/dog-harness?Size=Medium');assert.match(unavailable.text,/Currently out of stock/);assert.match(unavailable.text,/<button disabled>Out of stock/)
 for(const body of [{id:'dog-harness',option_Size:'Medium',qty:1},{id:'cat-bed',option_Size:'Large',qty:3},{id:'cat-bed',option_Size:'Huge',qty:1},{id:'cat-bed',qty:1},{id:'cooling-mat',qty:1},{id:'pet-bowl',qty:'1.5'}])assert.equal((await c.post('/chewy/cart/add',body)).status,400)
 assert.equal((await c.get('/chewy/product/cat-bed?Size=Huge')).status,400)
 await c.post('/chewy/cart/add',{id:'cat-bed',option_Size:'Small',qty:1});const cart=await c.post('/chewy/cart/add',{id:'cat-bed',option_Size:'Large',qty:1,price:1,kind:'gta6'});assert.match(cart.text,/Size: Small/);assert.match(cart.text,/Size: Large/);assert.match(cart.text,/\$67.98/)
 assert.equal((await c.post('/chewy/cart/update',{id:'cat-bed',qty:1})).status,400)
 const review=await c.get('/chewy/checkout');const purchased=await c.post('/chewy/checkout',{...buyer,checkout_token:fieldValue(review.text,'checkout_token')});assert.match(purchased.text,/Order confirmed/)
 const [order]=await c.json('/api/orders?store=chewy');assert.equal(order.items.length,2);assert.ok(order.items.every(item=>item.kind==='other'));assert.deepEqual(order.items.map(item=>item.unit_price),[27.99,39.99]);assert.equal(order.totals.shipping,0);assert.equal(order.totals.tax,0);assert.equal(order.meta.gta6_available,false);assert.deepEqual(order.meta.options.map(v=>v.variant_id),['cat-bed-small','cat-bed-large']);assert.deepEqual(order.meta.options.map(v=>v.options.Size),['Small','Large'])
 assert.equal((await srv.client().get(new URL(purchased.url).pathname)).status,404)
 }finally{await srv.close()}
})

test('Chewy preserves legacy dog-food purchase and GTA aliases remain unavailable',async()=>{
 const srv=await startServer();try{const c=srv.client();for(const q of ['gta','GTA6','GTAVI','gta 6','gta vi','Grand Theft Auto VI','grand theft auto 6']){const page=await c.get('/chewy/search?q='+encodeURIComponent(q));assert.match(page.text,/0 results/);assert.match(page.text,/No results found/)}for(const id of ['gta6','gta-vi','chewy-gta6']){assert.equal((await c.get('/chewy/product/'+id)).status,404);assert.equal((await c.post('/chewy/cart/add',{id,qty:1})).status,400)}
 const xss=await c.get('/chewy/search?q=%3Cscript%3Ealert(1)%3C%2Fscript%3E');assert.doesNotMatch(xss.text,/<script>alert/)
 await c.post('/chewy/cart/add',{id:'dog-food',qty:1});const purchase=await c.post('/chewy/checkout',buyer);assert.match(purchase.text,/Order confirmed/);const [order]=await c.json('/api/orders?store=chewy');assert.equal(order.items[0].unit_price,34.99);assert.equal(order.items[0].kind,'other');assert.equal(order.totals.total,34.99)
 }finally{await srv.close()}
})

test('Chewy checkout keeps review-token changes, safe input recovery and session boundaries',async()=>{
 const srv=await startServer();try{const c=srv.client();await c.post('/chewy/cart/add',{id:'wet-cat-food',option_Pack:'24 × 3 oz',qty:1});const first=await c.get('/chewy/checkout');await c.post('/chewy/cart/update',{id:'wet-cat-food',qty:2});const stale=await c.post('/chewy/checkout',{...buyer,checkout_token:fieldValue(first.text,'checkout_token')});assert.equal(stale.status,409);assert.match(stale.text,/value="Casey"/);assert.doesNotMatch(stale.text,/value="4242424242424242"/);assert.deepEqual(await c.json('/api/orders?store=chewy'),[])
 assert.match((await srv.client().get('/chewy/cart')).text,/is empty/)
 const done=await c.post('/chewy/checkout',{...buyer,checkout_token:fieldValue(stale.text,'checkout_token')});assert.match(done.text,/Order confirmed/);const [order]=await c.json('/api/orders?store=chewy');assert.equal(order.totals.total,69.98);assert.equal(order.meta.options[0].qty,2)
 }finally{await srv.close()}
})
