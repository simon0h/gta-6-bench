import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { startServer, fieldValue } from './helpers.js'
import { assertProductGalleryMarkup } from './product-gallery-assertions.js'
import { PRODUCTS as ps, filterProducts as psFilter, productPath as psPath } from '../stores/playstation-store/data.js'
import { PRODUCTS as xb, filterProducts as xbFilter, productPath as xbPath } from '../stores/xbox-store/data.js'
import { inventory as psInventory } from '../stores/playstation-store/inventory.js'
import { inventory as xbInventory } from '../stores/xbox-store/inventory.js'
import { CATALOG_PLATFORMS, platformLabel } from '../stores/playstation-store/physical.js'

const SHIPPING={shipName:'Alex Tester',shipAddress1:'123 Ocean Dr',shipAddress2:'Suite 2',shipCity:'Miami',shipState:'FL',shipZip:'33139',shipCountry:'US'}
const configs=[
 {slug:'playstation-store',products:ps,inventory:psInventory,path:psPath,filter:psFilter,browse:'/en-us/pages/browse',page:21,perPage:24,original:37,unavailable:1,checkout:'/en-us/checkout',library:'/en-us/library',native:'BENCH-POCKET-GARDEN',idField:'sku',add:'/en-us/cart/add',token:'review_token',pay:{paymentMethod:'paypal'},login:async(c,b)=>c.post(`${b}/my.account.sony.com/central/signin/`,{step:'password',email:'tester@example.com',password:'Password123!'}),prepare:async(c,b)=>c.post(`${b}/en-us/checkout/payment/service`,{service:'paypal'})},
 {slug:'xbox-store',products:xb,inventory:xbInventory,path:xbPath,filter:xbFilter,browse:'/en-US/games/browse?type=all',page:20,perPage:25,original:36,unavailable:3,checkout:'/en-US/checkout',library:'/account/library',native:'pocket-garden',idField:'pid',add:'/en-US/cart/add',token:'checkout_token',pay:{pi:'new',payType:'paypal'},login:async(c,b)=>{await c.post(`${b}/login.live.com/oauth20_authorize.srf`,{loginfmt:'tester@example.com'});await c.post(`${b}/login.live.com/password.srf`,{passwd:'Password123!'});await c.post(`${b}/login.live.com/kmsi.srf`,{kmsi:'yes'})},prepare:async(c,b)=>c.get(`${b}/en-US/checkout`)}
]
for(const cfg of configs){
 const {slug,products,inventory}=cfg,b=`/${slug}`
 const physical=products.filter(p=>p.physical),games=products.filter(p=>p.catalogType==='game')
 test(`${slug}: exactly 500 listings, 300 games across nine platforms, 200 typed hardware/add-ons`,()=>{
  assert.equal(products.length,500);assert.equal(inventory.length,500);assert.equal(new Set(products.map(p=>p.id)).size,500)
  assert.equal(games.length,300);assert.equal(inventory.filter(p=>p.type==='console').length,18);assert.equal(inventory.filter(p=>p.type==='accessory').length,182)
  assert.equal(products.filter(p=>p.accessorySubtype==='digital-add-on').length,6);assert.equal(products.filter(p=>p.accessorySubtype==='physical').length,176)
  assert.equal(products.filter(p=>!p.physical).length,cfg.original);assert.equal(inventory.filter(p=>!p.available).length,cfg.unavailable)
  assert.equal(products.filter(p=>p.kind==='game').length,2)
  assert.equal(new Set(physical.map(p=>p.title)).size,physical.length)
  for(const platform of CATALOG_PLATFORMS){const count=games.filter(p=>p.catalogPlatform===platform.id).length;assert.ok(count>=33&&count<=34,`${platform.id}: ${count}`);assert.ok(products.some(p=>p.catalogType==='console'&&p.catalogPlatform===platform.id))}
  for(const p of physical){assert.equal(p.kind,'other');assert.equal(p.format,p.catalogType==='game'?'physical':'hardware');assert.deepEqual(p.entitlements,[]);assert.ok(existsSync(`public/${p.art.replace('/static/','')}`),p.art);assert.ok(!p.photo);assert.ok(p.stock>0);if(p.catalogType==='game'){const age=slug==='playstation-store'?p.rating:p.age;assert.ok(['E','E10+','T','M','M17+'].includes(age),p.id);assert.ok(cfg.filter([p],{age}).includes(p))}}
 })
 test(`${slug}: every PDP renders, all nine platform facets work, search and final catalog page are reachable`,async()=>{
  const srv=await startServer();try{const c=srv.client()
   for(const p of products){const page=await c.get(cfg.path(b,p));assert.equal(page.status,200,p.id);assert.doesNotMatch(page.text,/\bundefined\b|\bNaN\b/,p.id);if(slug==='playstation-store'&&p.family==='gta-vi') {
    assert.match(page.text,/src="\/static\/reference\/playstation-store\/gta-vi-hero\.jpg"/)
    for(let i=1;i<=10;i++)assert.ok(page.text.includes(`/static/reference/playstation-store/gta-vi-screenshot-${i}.jpg`),`Official screenshot ${i} for ${p.id}`)
   } else if(slug==='xbox-store'&&['9p3h4968grsm','9nnzsnhlr63l','9nl3wwnzlzzn'].includes(p.id)) {
    const cover=p.id==='9nnzsnhlr63l'?'gta-vi-ultimate-cover.jpg':'gta-vi-cover.png'
    assert.ok(page.text.includes(`class="xb-cover" src="/static/reference/xbox-store/${cover}"`),`Official cover for ${p.id}`)
    assert.doesNotMatch(page.text,/<section class="pa-gallery[^>]*xb-cover/, 'Official product has a single cover, not a fabricated multiview gallery')
   } else assertProductGalleryMarkup(page.text,slug,p.id);if(p.physical){assert.match(page.text,/Physical store offer/);assert.match(page.text,/does not add a digital license/);assert.doesNotMatch(page.text.match(/<section class="physical-product">[\s\S]*?<\/section>/)[0],/PS Plus required|Game license acquired|PS5 Pro Enhanced|Included with Game Pass/);if(p.catalogType!=='game')assert.match(page.text,/Specifications and compatibility/)}}
   for(const platform of CATALOG_PLATFORMS){const label=platformLabel(platform.id),matching=cfg.filter(products,{platform:label});assert.ok(matching.some(p=>p.catalogPlatform===platform.id));assert.ok(matching.every(p=>p.platforms.includes(label)));const url=b+cfg.browse+(cfg.browse.includes('?')?'&':'?')+'platform='+encodeURIComponent(label);assert.equal((await c.get(url)).status,200)}
   for(const age of new Set(physical.filter(p=>p.catalogType==='game').map(p=>slug==='playstation-store'?p.rating:p.age))){const matches=cfg.filter(products,{age});assert.ok(matches.some(p=>p.physical&&p.catalogType==='game'));const filtered=await c.get(b+cfg.browse+(cfg.browse.includes('?')?'&':'?')+'age='+encodeURIComponent(age));assert.equal(filtered.status,200);assert.ok(filtered.text.includes(matches[0].id))}
   const last=await c.get(b+cfg.browse+(cfg.browse.includes('?')?'&':'?')+`page=${cfg.page}`);assert.equal(last.status,200);assert.match(last.text,/of 500/);assert.ok(last.text.includes(products.at(-1).id));const nav=last.text.match(/<nav class="(?:ps|xb)-pagination"[\s\S]*?<\/nav>/)?.[0];assert.ok(nav);assert.ok((nav.match(/<a /g)||[]).length<=8)
   const p=physical.find(p=>p.catalogType==='console'),search=slug==='playstation-store'?`${b}/en-us/search/${encodeURIComponent(p.title)}`:`${b}/en-US/search/results?type=all&q=${encodeURIComponent(p.title)}`;assert.ok((await c.get(search)).text.includes(p.id))
  }finally{await srv.close()}
 })
 test(`${slug}: physical checkout requires an address, mixed purchases grant only native digital rights`,async()=>{
  const srv=await startServer();try{const c=srv.client();await cfg.login(c,b)
   const selected=[...CATALOG_PLATFORMS.map(platform=>physical.find(p=>p.catalogType==='game'&&p.catalogPlatform===platform.id)),physical.find(p=>p.catalogType==='console'),physical.find(p=>p.catalogType==='accessory'),products.find(p=>p.id===cfg.native)]
   for(const p of selected)assert.equal((await c.post(b+cfg.add,{[cfg.idField]:p.id,kind:'game',price:'0.01'})).status,200)
   let review=await cfg.prepare(c,b);assert.match(review.text,/Shipping address/)
   let bad=await c.post(b+cfg.checkout,{...cfg.pay,[cfg.token]:fieldValue(review.text,cfg.token)});assert.equal(bad.status,400);assert.match(bad.text,/complete United States shipping address/);assert.deepEqual(await c.json(`/api/orders?store=${slug}`),[])
   review=await c.get(b+cfg.checkout);bad=await c.post(b+cfg.checkout,{...cfg.pay,...SHIPPING,shipCountry:'CA',[cfg.token]:fieldValue(review.text,cfg.token)});assert.equal(bad.status,400)
   review=await c.get(b+cfg.checkout);const token=fieldValue(review.text,cfg.token);const done=await c.post(b+cfg.checkout,{...cfg.pay,...SHIPPING,[cfg.token]:token});assert.equal(done.status,200);assert.match(done.text,/Physical delivery/)
   const [order]=await c.json(`/api/orders?store=${slug}`);assert.equal(order.items.length,12);assert.ok(order.items.every(i=>i.kind==='other'));assert.equal(order.fulfillment.method,'shipping');assert.equal(order.shipping_address.line1,SHIPPING.shipAddress1);assert.equal(order.shipping_address.name,SHIPPING.shipName);assert.equal(order.totals.shipping,0)
   assert.equal(order.meta.entitlements.length,1);assert.equal(order.meta.entitlements[0].sku,cfg.native);assert.equal(order.meta.physical_items.length,11)
   assert.equal(order.totals.subtotal,Math.round(selected.reduce((n,p)=>n+p.price,0)*100)/100)
   const library=await c.get(b+cfg.library);assert.ok(library.text.includes(cfg.native));for(const p of selected.filter(p=>p.physical))assert.ok(!library.text.includes(`library/${p.id}`))
   for(const p of selected.filter(p=>p.physical))assert.equal((await c.get(b+cfg.library+'/'+p.id)).status,404)
   const p=selected[0];await c.post(b+cfg.add,{[cfg.idField]:p.id});review=await c.get(b+cfg.checkout);assert.ok(review.text.includes(p.title.replaceAll('&','&amp;')))
   const again=await c.post(b+cfg.checkout,{...cfg.pay,...SHIPPING,[cfg.token]:fieldValue(review.text,cfg.token)});assert.equal(again.status,200);assert.doesNotMatch(again.text,/Download from Library|Game license acquired/)
   const all=await c.json(`/api/orders?store=${slug}`);assert.equal(all.length,2);assert.deepEqual(all[1].meta.entitlements,[])
   const stranger=srv.client();await cfg.login(stranger,b);assert.equal((await stranger.get(done.url)).status,404)
  }finally{await srv.close()}
 })
 test(`${slug}: canonical GTA and hardware keep gradeable digital rights separate`,async()=>{
  const srv=await startServer();try{const c=srv.client();await cfg.login(c,b);const gta=products.find(p=>p.kind==='game'),hardware=physical.find(p=>p.catalogType==='console')
   if(slug==='playstation-store'){
    // Canonical PlayStation pre-orders use buy-now, so preserve their original route.
    const buy=await c.post(`${b}/en-us/preorder`,{sku:gta.id});assert.match(buy.url,/checkout\/buynow/)
    await c.post(buy.url+'/payment/service',{service:'paypal'});const review=await c.get(buy.url);await c.post(buy.url,{paymentMethod:'paypal',review_token:fieldValue(review.text,'review_token')})
    await c.post(b+cfg.add,{sku:hardware.id});const review2=await c.get(b+cfg.checkout);await c.post(b+cfg.checkout,{...cfg.pay,...SHIPPING,review_token:fieldValue(review2.text,'review_token')})
    const orders=await c.json(`/api/orders?store=${slug}`);assert.equal(orders.length,2);assert.equal(orders[0].items[0].kind,'game');assert.equal(orders[0].fulfillment.method,'digital');assert.equal(orders[0].shipping_address,null);assert.equal(orders[1].items[0].kind,'other');assert.deepEqual(orders[1].meta.entitlements,[])
   }else{
    await c.post(b+cfg.add,{pid:gta.id});await c.post(b+cfg.add,{pid:hardware.id});const review=await cfg.prepare(c,b);const done=await c.post(b+cfg.checkout,{...cfg.pay,...SHIPPING,[cfg.token]:fieldValue(review.text,cfg.token)});assert.equal(done.status,200)
    const [order]=await c.json(`/api/orders?store=${slug}`);assert.equal(order.items[0].kind,'game');assert.equal(order.items[0].platform,'xbox');assert.equal(order.items[0].format,'digital');assert.equal(order.items[1].kind,'other');assert.equal(order.meta.entitlements.length,1);assert.equal(order.meta.entitlements[0].sku,gta.id);assert.equal(order.meta.physical_items.length,1);assert.equal(order.meta.charge_timing,'physical items immediately; digital pre-orders about 10 days before release');assert.match(done.text,/Physical items are charged immediately/)
   }
  }finally{await srv.close()}
 })
 test(`${slug}: current physical stock and stale reviews prevent invalid checkout`,async()=>{
  const srv=await startServer();const p=physical.find(p=>p.catalogType==='console'),stock=p.stock,price=p.price;try{const c=srv.client();await cfg.login(c,b);await c.post(b+cfg.add,{[cfg.idField]:p.id});let review=await cfg.prepare(c,b);p.price+=10;let result=await c.post(b+cfg.checkout,{...cfg.pay,...SHIPPING,[cfg.token]:fieldValue(review.text,cfg.token)});assert.equal(result.status,409);p.price=price;review=await c.get(b+cfg.checkout);p.stock=0;result=await c.post(b+cfg.checkout,{...cfg.pay,...SHIPPING,[cfg.token]:fieldValue(review.text,cfg.token)});assert.equal(result.status,409);assert.deepEqual(await c.json(`/api/orders?store=${slug}`),[])
   p.stock=stock;if(slug==='xbox-store'){const fake=await c.post(cfg.path(b,p)+'/buy/confirm',{});assert.match(fake.url,/\/en-US\/cart$/);assert.deepEqual(await c.json(`/api/orders?store=${slug}`),[])}
  }finally{p.stock=stock;p.price=price;await srv.close()}
 })
}

test('PlayStation physical checkout: a fresh account can save a card using billing fields and then enter shipping',async()=>{
 const srv=await startServer();try{const c=srv.client(),b='/playstation-store',checkout=b+'/en-us/checkout',p=ps.find(p=>p.physical&&p.catalogType==='console');await configs[0].login(c,b);await c.post(b+'/en-us/cart/add',{sku:p.id})
 const paymentPicker=await c.get(checkout+'/payment');assert.match(paymentPicker.text,/Add a Credit\/Debit Card/);const cardPage=await c.get(checkout+'/payment/card');
 const emittedForm=(page,suffix,values)=>{const form=[...page.text.matchAll(/<form\b[^>]*action="([^"]+)"[^>]*>([\s\S]*?)<\/form>/g)].find(m=>m[1].endsWith(suffix));assert.ok(form,suffix);const names=new Set([...form[2].matchAll(/(?:input|select)[^>]*name="([^"]+)"/g)].map(m=>m[1]));for(const name of Object.keys(values))assert.ok(names.has(name),name+' must be emitted by form');return {action:form[1],values,html:form[2]}};
 const cardForm=emittedForm(cardPage,'/payment/card',{cardholderName:'Alex Tester',cardNumber:'4242424242424242',expMonth:'12',expYear:String(new Date().getFullYear()+3),cvv:'123'});const card=await c.post(cardForm.action,cardForm.values);assert.equal(card.status,200);assert.match(card.url,/payment\/card\/billing$/)
 const billingForm=emittedForm(card,'/payment/card/billing',{firstName:'Alex',lastName:'Tester',address1:'123 Ocean Dr',city:'Miami',state:'FL',zip:'33139',phone:'3055550101',country:'US'});assert.doesNotMatch(billingForm.html,/name="ship/);const review=await c.post(billingForm.action,billingForm.values);assert.equal(review.status,200);assert.match(review.text,/successfully added/);assert.match(review.text,/Shipping address/)
 const method=fieldValue(review.text,'paymentMethod');assert.ok(method);const done=await c.post(checkout,{paymentMethod:method,review_token:fieldValue(review.text,'review_token'),...SHIPPING});assert.equal(done.status,200);assert.match(done.text,/Physical delivery/)
 const [order]=await c.json('/api/orders?store=playstation-store');assert.equal(order.payment.method,'card');assert.equal(order.payment.last4,'4242');assert.equal(order.billing_address.line1,'123 Ocean Dr');assert.equal(order.shipping_address.line1,SHIPPING.shipAddress1);assert.deepEqual(order.meta.entitlements,[])
 }finally{await srv.close()}
})
