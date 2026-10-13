import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer, fieldValue } from './helpers.js'
import { browseProducts, matching, resolveProduct, hubs } from '../stores/eb-games-au/browse.js'
const B='/eb-games-au'
const INFO={method:'ship',first_name:'Alex',last_name:'Tester',phone:'0412345678',address:'PO Box 11',suburb:'Sydney',state:'NSW',postcode:'2000',shipping_method:'standard'}
const CARD={payment_method:'card',card_number:'4242424242424242',card_expiry:'12/39',card_cvv:'123',card_name:'Alex Tester',accept_deposit:'yes'}
async function review(c,items){for(const item of items) assert.equal((await c.post(`${B}/cart/add`,item)).status,200);await c.post(`${B}/checkout/guest`,{guest_email:'ordinary@example.com'});return c.post(`${B}/checkout/delivery`,INFO)}

test('EB catalog depth: populated hubs, composed facets, pagination, suggestions and truthful options',async()=>{
 assert.equal(browseProducts.length,498)
 assert.equal(browseProducts.filter(p=>p.stock>0).length,497)
 assert.ok(browseProducts.every(p=>p.specs&&p.type&&p.brand))
 const filtered=matching({category:'Gaming Accessories',brand:'Atrix',min:'30',max:'100',availability:'in-stock',sort:'price-desc'})
 assert.ok(filtered.length>=3);assert.ok(filtered.every(p=>p.category==='Gaming Accessories'&&p.price>=30&&p.price<=100))
 assert.deepEqual(filtered.map(p=>p.price),filtered.map(p=>p.price).sort((a,b)=>b-a))
 const s=await startServer();try{const c=s.client()
 assert.ok((await c.json('/api/stores')).some(p=>p.slug==='eb-games-au'))
 for(const [route] of hubs){const page=await c.get(B+route);assert.equal(page.status,200);assert.match(page.text,/class="browse-tile"/)}
 const page1=await c.get(`${B}/search`),page2=await c.get(`${B}/search?page=2&sort=price-asc`)
 assert.match(page1.text,/500 products/);assert.match(page2.text,/Page 2 of 42/)
 assert.match(page2.text,/sort=price-asc(?:&amp;|&)page=3|page=3(?:&amp;|&)sort=price-asc/)
 assert.equal((await c.json(`${B}/search/suggestions?q=controller`)).length,6)
 const p=await c.get(`${B}/catalog/390021?variant=red`);assert.match(p.text,/A\$44\.95/);assert.match(p.text,/href="[^"]*variant=red" aria-current="true"/);assert.match(p.text,/name="variant_id" value="red"/);assert.doesNotMatch(p.text,/id="variant-preview"/)
 assert.equal((await c.get(`${B}/catalog/390021?variant=forged`)).status,400)
 assert.match((await c.get(`${B}/search?brand=missing`)).text,/No products found/)
 }finally{await s.close()}
})

test('EB ordinary checkout: trusted option and full AU payment, no GTA/deposit classification',async()=>{
 const s=await startServer();try{const c=s.client()
 const r=await review(c,[{sku:'390021',variant_id:'red',qty:'2',unit_price:'0.01',kind:'game',platform:'ps5'}])
 assert.doesNotMatch(r.text,/value="zip"/);assert.match(r.text,/A\$97\.85/)
 const bad=await c.post(`${B}/checkout/payment`,{...CARD,card_cvv:'bad-secret',review_token:fieldValue(r.text,'review_token')});assert.equal(bad.status,400);assert.doesNotMatch(bad.text,/bad-secret|4242424242424242/)
 const done=await c.post(`${B}/checkout/payment`,{...CARD,review_token:fieldValue(bad.text,'review_token')});assert.equal(done.status,200);assert.match(done.text,/Thank you for your order/);assert.doesNotMatch(done.text,/Deposit paid|Standard Edition|Code in Box/)
 const [o]=await c.json('/api/orders?store=eb-games-au');assert.deepEqual(o.items,[{kind:'other',qty:2,unit_price:44.95,title:'Trading Card Zip Binder',sku:'390021'}]);assert.equal(o.meta.deposit_paid,0);assert.equal(o.meta.balance_due,0);assert.equal(o.meta.paid_today,97.85);assert.equal(o.shipping_address.country,'AU');assert.deepEqual(o.meta.options,[{sku:'390021',variant_id:'red',options:{Colour:'Red'},quantity:2}])
 assert.equal((await s.client().get(new URL(done.url).pathname)).status,404)
 }finally{await s.close()}
})

test('EB mixed checkout: only GTA contributes deposit and later balance',async()=>{
 const s=await startServer();try{const c=s.client();await review(c,[{sku:'330056',qty:'1'},{sku:'390014',qty:'2'}]);const done=await c.post(`${B}/checkout/payment`,CARD);assert.equal(done.status,200);const [o]=await c.json('/api/orders?store=eb-games-au');assert.equal(o.items[0].kind,'game');assert.equal(o.items[0].format,'code-in-box');assert.equal(o.items[1].kind,'other');assert.equal(o.meta.deposit_paid,10);assert.equal(o.meta.paid_today,87.85);assert.equal(o.meta.balance_due,119.95);assert.equal(o.totals.total,207.8)
 }finally{await s.close()}
})

test('EB validation: variant, aggregate stock, integer quantities and ambiguous update are enforced',async()=>{
 const s=await startServer();try{const c=s.client()
 for(const item of [{sku:'390002'},{sku:'390002',variant_id:'forged'},{sku:'390026',variant_id:'xl'},{sku:'390021',variant_id:'red',qty:'3'},{sku:'385339'},{sku:'390014',qty:'1.5'},{sku:'390014',qty:'0'},{sku:'390014',qty:'2e0'},{sku:'330056',variant_id:'forged'}]) assert.equal((await c.post(`${B}/cart/add`,item)).status,400)
 await c.post(`${B}/cart/add`,{sku:'390002',variant_id:'white',qty:'4'});await c.post(`${B}/cart/add`,{sku:'390002',variant_id:'black',qty:'2'})
 assert.equal((await c.post(`${B}/cart/add`,{sku:'390002',variant_id:'black',qty:'1'})).status,400,'aggregate limit6')
 assert.equal((await c.post(`${B}/cart/update`,{sku:'390002',qty_390002:'1',action:'update'})).status,400,'ambiguous variant')
 assert.equal((await c.post(`${B}/cart/update`,{sku:'390002',key:'390002:black',qty_390002:'3',action:'update'})).status,400)
 assert.equal((await c.post(`${B}/cart/update`,{sku:'390002',key:'390002:white',qty_390002:'3',action:'update'})).status,200)
 assert.equal((await c.post(`${B}/cart/update`,{sku:'390002',key:'390002:black',qty_390002:'3',action:'update'})).status,200)
 }finally{await s.close()}
})

test('EB payment review: rejects old token, trusted price changes and final stock changes',async()=>{
 const s=await startServer();const p=browseProducts.find(p=>p.sku==='390014');const original={price:p.price,stock:p.stock}
 try{const c=s.client();const first=await review(c,[{sku:p.sku,qty:'1'}]);const old=fieldValue(first.text,'review_token')
 p.price=39.95
 const changed=await c.post(`${B}/checkout/payment`,{...CARD,review_token:old});assert.equal(changed.status,409);assert.match(changed.text,/A\$47\.90/);assert.doesNotMatch(changed.text,/4242424242424242/)
 assert.equal((await c.post(`${B}/checkout/payment`,{...CARD,review_token:old})).status,409)
 p.stock=0;assert.equal((await c.post(`${B}/checkout/payment`,CARD)).status,409)
 p.stock=original.stock
 const current=await c.get(`${B}/checkout/payment`);assert.equal((await c.post(`${B}/checkout/payment`,{...CARD,review_token:fieldValue(current.text,'review_token')})).status,200)
 assert.equal((await c.json('/api/orders?store=eb-games-au'))[0].items[0].unit_price,39.95)
 }finally{Object.assign(p,original);await s.close()}
})

test('EB review invalidates on cart/address/account changes and rejects duplicate scalars',async()=>{
 const s=await startServer();try{const c=s.client();const r=await review(c,[{sku:'390014'}]);const token=fieldValue(r.text,'review_token')
 await c.post(`${B}/cart/update`,{sku:'390014',qty_390014:'2',action:'update'});assert.equal(new URL((await c.post(`${B}/checkout/payment`,{...CARD,review_token:token})).url).pathname,`${B}/checkout`)
 await c.post(`${B}/checkout/guest`,{guest_email:'ordinary@example.com'});await c.post(`${B}/checkout/delivery`,{...INFO,address:'2 George St'})
 assert.equal((await c.post(`${B}/checkout/payment`,{...CARD,review_token:token})).status,409)
 const duplicate=new URLSearchParams(INFO);duplicate.append('first_name','Second');assert.equal((await c.post(`${B}/checkout/delivery`,duplicate)).status,400)
 assert.equal((await c.post(`${B}/checkout/delivery`,{...INFO,shipping_method:'__proto__'})).status,400)
 }finally{await s.close()}
})
