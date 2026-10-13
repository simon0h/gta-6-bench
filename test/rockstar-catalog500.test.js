import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer,fieldValue } from './helpers.js'
import { PRODUCTS,filterProducts,search } from '../stores/rockstar-store/data.js'
import { inventory } from '../stores/rockstar-store/inventory.js'
import { CATALOG_PLATFORMS } from '../lib/expanded-games.js'
const B='/rockstar-store'
const ADDRESS={country:'US',first_name:'Alex',last_name:'Tester',city:'Miami',region:'FL',postal_code:'33139',street_address:'123 Ocean Dr',phone:'3055550123',email:'alex@example.com'}
test('rockstar 500: all catalog pages, artwork, platform filters and pagination resolve',async()=>{
 assert.equal(inventory.length,500);assert.equal(inventory.filter(p=>p.type==='game').length,250)
 assert.equal(new Set(inventory.map(p=>p.title)).size,500)
 const srv=await startServer();try{const c=srv.client()
  for(const p of PRODUCTS){const r=await c.get(B+p.path);assert.equal(r.status,200,p.id);if(p.art)assert.equal((await c.get(p.art)).status,200,p.art)}
  const seen=[];for(let n=1;n<=42;n++){const r=await c.get(B+'/search?page='+n);const block=r.text.split('<div class="rs-results">')[1].split('<nav class="rs-pages"')[0];const paths=[...block.matchAll(/class="rs-tile-visual" href="([^"]+)"/g)].map(m=>m[1]);seen.push(...paths);const nav=r.text.match(/<nav class="rs-pages"[^>]*>(.*?)<\/nav>/)[1];assert.ok((nav.match(/<a /g)||[]).length<=7)}
  assert.equal(seen.length,500);assert.equal(new Set(seen).size,500)
  for(const platform of CATALOG_PLATFORMS){const results=filterProducts(PRODUCTS,{platform:platform.label});assert.ok(results.some(p=>p.catalogType==='game'));assert.ok(results.every(p=>p.chips.includes(platform.label)))}
  const last=PRODUCTS.at(-1);assert.equal(search(last.title)[0].id,last.id)
 }finally{await srv.close()}
})
test('rockstar 500: added games and hardware use physical checkout without Launcher entitlements',async()=>{
 const srv=await startServer();try{
  const samples=[...CATALOG_PLATFORMS.map(p=>PRODUCTS.find(g=>g.catalogType==='game'&&g.catalogPlatform===p.id)),PRODUCTS.find(p=>p.catalogType==='console'),PRODUCTS.find(p=>p.catalogType==='accessory'),PRODUCTS.at(-1)]
  for(const p of samples){const c=srv.client();await c.post(B+'/cart/add',{sku:p.sku,qty:'1',price:'0.01',kind:'game',platform:'ps5'});await c.post(B+'/cart/checkout');await c.post(B+'/checkout/guest');await c.post(B+'/checkout/shipping-address',ADDRESS);const review=await c.post(B+'/checkout/shipping-method',{shipping_method:'standard'});assert.match(review.text,/<b>Ship to<\/b>/)
   const done=await c.post(B+'/checkout/payment',{payment_method:'paypal',review_token:fieldValue(review.text,'review_token')});assert.equal(done.status,200,p.id)
   const order=(await c.json('/api/orders?store=rockstar-store')).at(-1);assert.equal(order.items[0].sku,p.sku);assert.equal(order.items[0].unit_price,p.price);assert.equal(order.items[0].kind,'other');assert.equal(order.items[0].platform,undefined);assert.equal(order.fulfillment.method,'ship');assert.equal(order.meta.entitlements.length,0);assert.equal(order.meta.preorder,false)
  }
 }finally{await srv.close()}
})
