import { assertProductGallery } from './product-gallery-assertions.js'
import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer, fieldValue } from './helpers.js'
import { PRODUCTS, byId, search, selectedProduct } from '../stores/game-uk/data.js'
import { DEPARTMENTS, CAMPAIGNS, categorySlug } from '../stores/game-uk/catalog.js'
import { PHOTO_KEYS } from '../lib/product-photos.js'
const ADDRESS={firstName:'Jamie',lastName:'Example',addressLine1:'10 Test Road',town:'London',postcode:'SW1A 2AA',mobile:'07700900123',country:'GB',deliveryMethod:'standard'}
const CARD={paymentMethod:'card',cardNumber:'4242424242424242',expiry:'12/29',cvv:'123',nameOnCard:'Jamie Example',billingSame:'1'}
const guest=async c=>c.post('/game-uk/account/login',{action:'guest',email:'game-catalog@example.com',returnUrl:'/checkout'})

test('GAME catalogue has broad families, populated hubs/categories/campaigns/brands and local illustrations',async()=>{
 assert.ok(new Set(PRODUCTS.filter(p=>p.kind==='other').map(p=>p.family)).size>=24)
 assert.equal(PRODUCTS.filter(p=>p.kind==='game').length,2)
 for(const p of PRODUCTS){assert.ok(p.specs&&Object.keys(p.specs).length>=2,p.id);if(p.photo)assert.ok(PHOTO_KEYS.includes(p.photo),p.photo)}
 const srv=await startServer();try{const c=srv.client()
 for(const d of DEPARTMENTS){assert.ok(search('',{department:d.id}).length);const hub=await c.get('/game-uk/'+d.id);assert.equal(hub.status,200);assert.ok(hub.text.includes(d.title.replaceAll('&','&amp;')))
 for(const category of d.categories){assert.ok(search('',{department:d.id,category}).length,`${d.id}/${category}`);assert.equal((await c.get(`/game-uk/${d.id}/${categorySlug(category)}`)).status,200)}}
 for(const campaign of CAMPAIGNS){assert.ok(search('',{campaign:campaign.id}).length);assert.equal((await c.get('/game-uk/campaign/'+campaign.id)).status,200)}
 for(const brand of new Set(PRODUCTS.map(p=>p.brand)))assert.equal((await c.get('/game-uk/brands/'+categorySlug(brand))).status,200)
 }finally{await srv.close()}
})

test('GAME filters compose, sort and page state persists, empty results recover, and curated GTA search is unchanged',async()=>{
 const srv=await startServer();try{const c=srv.client()
 const f=await c.get('/game-uk/gaming?platform=PS5&brand=Northstar&age=PEGI+12&category=Video+Games&style=Action+%2F+Adventure&price=%C2%A320+to+%C2%A350&availability=In+stock&sort=price-desc')
 assert.match(f.text,/We found 1 product/);assert.match(f.text,/Starfall Expedition/);assert.doesNotMatch(f.text,/gu-tile-name[^>]*>Grand Theft/)
 assert.match(f.text,/Remove brand filter/);assert.match(f.text,/brand=Northstar[^\"]*sort=price-desc/)
 const a=await c.get('/game-uk/searchresults?sort=price-asc'),b=await c.get('/game-uk/searchresults?sort=price-asc&page=2')
 assert.equal((a.text.match(/<article class="gu-tile"/g)||[]).length,12);assert.equal((b.text.match(/<article class="gu-tile"/g)||[]).length,12)
 assert.match(a.text,/£4\.99/);assert.match(b.text,/Page 2 of 42</);assert.notEqual(a.text.match(/gu-tile-name[^>]+>([^<]+)/)[1],b.text.match(/gu-tile-name[^>]+>([^<]+)/)[1])
 const none=await c.get('/game-uk/lego?brand=Meta');assert.match(none.text,/We found 0 products/);assert.match(none.text,/clear your filters/)
 assert.equal(search('gta 6').length,8)
 }finally{await srv.close()}
})

test('GAME ordinary PDP has matching art/specs/options and age-appropriate copy',async()=>{
 const srv=await startServer();try{const c=srv.client()
 for(const id of ['991202','991203','992005','992010','992023']){const p=byId(id),r=await c.get('/game-uk/'+p.slug);assert.equal(r.status,200);assert.match(r.text,/gu-specs/);await assertProductGallery(c,r.text,'game-uk',id);assert.doesNotMatch(r.text,/gu-thumbs|This item is currently on pre-order|Suitable for people aged 18 and over/);if(p.options)assert.match(r.text,/name="option" required/)}
 const red=await c.get('/game-uk/'+byId('992023').slug+'?option=red');assert.match(red.text,/value="red" selected/)
 const redImages=await assertProductGallery(c,red.text,'game-uk','992023','red')
 const otherOption=byId('992023').options.find(option=>option.id!=='red').id
 const other=await c.get('/game-uk/'+byId('992023').slug+'?option='+otherOption),otherImages=await assertProductGallery(c,other.text,'game-uk','992023',otherOption)
 assert.notEqual((await c.get(redImages[0])).text,(await c.get(otherImages[0])).text,'Selected colour changes the product illustration')
 const lowAge=await c.post('/game-uk/cart/add',{pid:'992001',qty:'1'});assert.match(lowAge.url,/added=1/);assert.doesNotMatch(lowAge.text,/Age Verification/)
 }finally{await srv.close()}
})

test('GAME rejects forged options, fractional/structured quantities and stock overflow; records trusted ordinary option price',async()=>{
 const srv=await startServer();try{const c=srv.client()
 for(const qty of ['1.5','-1','0','2junk','100']) assert.equal((await c.post('/game-uk/cart/add',{pid:'992010',qty,option:'tactile'})).status,400)
 for(const option of ['','forged','__proto__'])assert.equal((await c.post('/game-uk/cart/add',{pid:'992010',qty:'1',option})).status,400)
 assert.equal((await c.post('/game-uk/cart/add',{pid:'992022',qty:'1'})).status,400)
 const duplicate=new URLSearchParams([['pid','992010'],['qty','1'],['qty','1'],['option','tactile']]);assert.equal((await c.post('/game-uk/cart/add',duplicate)).status,400)
 await c.post('/game-uk/cart/add',{pid:'992010',qty:'2',option:'tactile',price:'0.01',kind:'game'});assert.equal((await c.post('/game-uk/cart/add',{pid:'992010',qty:'1',option:'tactile'})).status,400)
 const cart=await c.get('/game-uk/cart');assert.match(cart.text,/Tactile switches/);assert.match(cart.text,/£129\.98/)
 await guest(c);for(const deliveryMethod of ['__proto__','constructor','email'])assert.equal((await c.post('/game-uk/checkout/delivery',{...ADDRESS,deliveryMethod})).status,400)
 const payment=await c.post('/game-uk/checkout/delivery',ADDRESS);const token=fieldValue(payment.text,'review_token');assert.ok(token)
 const duplicateCard=new URLSearchParams({...CARD,review_token:token});duplicateCard.append('cardNumber','4242');assert.equal((await c.post('/game-uk/checkout/payment',duplicateCard)).status,400)
 const done=await c.post('/game-uk/checkout/payment',{...CARD,review_token:token});assert.match(done.text,/Thank you for your order/);assert.match(done.text,/Tactile switches/)
 const [o]=await c.json('/api/orders?store=game-uk');assert.equal(o.items[0].kind,'other');assert.equal(o.items[0].unit_price,64.99);assert.equal(o.items[0].qty,2);assert.equal(o.meta.options[0].option,'tactile');assert.equal(o.totals.total,134.97)
 assert.equal((await srv.client().get(new URL(done.url).pathname+new URL(done.url).search)).status,404)
 }finally{await srv.close()}
})

test('GAME review rejects bag and trusted price changes, old tabs and stock loss before ordering',async()=>{
 const srv=await startServer();const p=byId('992019'),price=p.price,stock=p.stock
 try{const c=srv.client();await c.post('/game-uk/cart/add',{pid:p.id,qty:'1'});await guest(c)
 let payment=await c.post('/game-uk/checkout/delivery',ADDRESS),token=fieldValue(payment.text,'review_token')
 await c.post('/game-uk/cart/update',{line:'1',action:'inc'})
 const stale=await c.post('/game-uk/checkout/payment',{...CARD,review_token:token});assert.equal(stale.status,409);assert.match(stale.text,/changed/);assert.doesNotMatch(stale.text,/4242424242424242/)
 assert.equal((await c.json('/api/orders?store=game-uk')).length,0)
 payment=await c.get('/game-uk/checkout/payment');token=fieldValue(payment.text,'review_token');p.price+=1
 assert.equal((await c.post('/game-uk/checkout/payment',CARD)).status,409)
 p.price=price;payment=await c.get('/game-uk/checkout/payment');token=fieldValue(payment.text,'review_token');await c.get('/game-uk/checkout/payment')
 assert.equal((await c.post('/game-uk/checkout/payment',{...CARD,review_token:token})).status,409)
 p.stock=0;assert.equal((await c.post('/game-uk/checkout/payment',CARD)).status,409)
 assert.equal((await c.json('/api/orders?store=game-uk')).length,0)
 }finally{p.price=price;p.stock=stock;await srv.close()}
})

test('GAME digital-only checkout uses free email delivery and rejects collection; ordinary goods never gain GTA metadata',async()=>{
 const srv=await startServer();try{const c=srv.client();await c.post('/game-uk/cart/add',{pid:'992025',qty:'1'});await guest(c)
 assert.equal((await c.post('/game-uk/checkout/delivery',{...ADDRESS,deliveryMethod:'collect',collectStore:'forged'})).status,400)
 const payment=await c.post('/game-uk/checkout/delivery',{...ADDRESS,deliveryMethod:'email'});assert.match(payment.text,/Email Delivery/);assert.doesNotMatch(payment.text,/Pre-orders are held and dispatched/)
 const done=await c.post('/game-uk/checkout/payment',{...CARD,review_token:fieldValue(payment.text,'review_token')});assert.match(done.text,/Thank you/)
 const [o]=await c.json('/api/orders?store=game-uk');assert.equal(o.fulfillment.method,'digital');assert.equal(o.totals.shipping,0);assert.equal(o.items[0].kind,'other');assert.equal(o.meta.preorder,false)
 }finally{await srv.close()}
})

test('GAME preserves two selected colours of the same SKU independently through receipt',async()=>{
 const srv=await startServer();try{const c=srv.client()
 for(const option of ['black','red'])await c.post('/game-uk/cart/add',{pid:'992023',qty:'1',option})
 await guest(c);const payment=await c.post('/game-uk/checkout/delivery',ADDRESS)
 const done=await c.post('/game-uk/checkout/payment',{...CARD,review_token:fieldValue(payment.text,'review_token')})
 assert.match(done.text,/Colour: Black/);assert.match(done.text,/Colour: Red/)
 const [o]=await c.json('/api/orders?store=game-uk');assert.deepEqual(o.meta.options.map(x=>x.option),['black','red']);assert.equal(o.items.length,2)
 }finally{await srv.close()}
})
