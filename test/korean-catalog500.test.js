import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer } from './helpers.js'
import { assertProductGalleryMarkup } from './product-gallery-assertions.js'
import { CATALOG_PLATFORMS } from '../lib/expanded-games.js'
import { products as cp } from '../stores/coupang/catalog-data.js'
import { search as gmSearch, products as gm } from '../stores/gmarket/data.js'
import { inventory as ci } from '../stores/coupang/inventory.js'
import { inventory as gi } from '../stores/gmarket/inventory.js'
const cpForm={recipient:'김민수',phone:'010-1234-5678',postcode:'04524',city:'서울특별시',address:'중구 세종대로 110',payment_method:'card',card_name:'Minsu Kim',card_number:'4242 4242 4242 4242',card_expiry:'12/39',card_cvv:'123',agree:'yes'}
const gmForm={recipient:'김민수',phone:'010-1234-5678',postal_code:'06236',city:'서울특별시 강남구',line1:'테헤란로 123',line2:'101호',name_on_card:'Minsu Kim',card_number:'4242424242424242',expiry:'12/99',cvv:'123',terms:'1'}
for(const [slug,products,inventory]of[['coupang',cp,ci],['gmarket',gm,gi]]) {
 test(`${slug} 500: balanced catalog, nine platforms, all product pages and artwork resolve`,async()=>{
  assert.equal(inventory.length,500);assert.equal(new Set(inventory.map(p=>p.id)).size,500);assert.equal(new Set(inventory.map(p=>p.title)).size,500)
  const games=inventory.filter(p=>p.type==='game');assert.equal(games.length,250)
  const counts=CATALOG_PLATFORMS.map(p=>games.filter(g=>g.platform===p.id).length)
  assert.ok(counts.every(n=>n===27||n===28),counts.join(','))
  if(slug==='gmarket')assert.ok(gmSearch('PS5').some(p=>p.catalogType==='game'&&p.catalogPlatform==='ps5'))
  const srv=await startServer();try {const c=srv.client();for(const p of products){const id=slug==='coupang'?p.id:p.sku
   const page=await c.get(`/${slug}/${slug==='coupang'?'vp/products':'product'}/${id}`);assert.equal(page.status,200,id)
   assert.ok(page.text.includes(p.sku),id)
   const images=assertProductGalleryMarkup(page.text,slug,id)
   const image=await c.get(images[0]);assert.equal(image.status,200,id);assert.match(image.headers.get('content-type'),/^image\/svg\+xml/)
  }
  const seen=[];for(let page=1;page<=42;page++){const response=await c.get(slug==='coupang'?`/coupang/np/search?page=${page}`:`/gmarket/search?page=${page}`)
   const rows=[...response.text.matchAll(slug==='coupang'?/data-product="([^"]+)"/g:/<article data-sku="([^"]+)"/g)].map(m=>m[1]);seen.push(...rows)
   const pagination=response.text.match(/<nav class="pagination"[^>]*>(.*?)<\/nav>/)?.[1]||''
   assert.ok((pagination.match(/<a /g)||[]).length<=9)
  }assert.equal(seen.length,500);assert.equal(new Set(seen).size,500)
  }finally{await srv.close()}
 })
 test(`${slug} 500: every added game platform and a household item buy as ordinary KRW merchandise`,async()=>{
  const srv=await startServer();try{
   const chosen=[...CATALOG_PLATFORMS.map(f=>products.find(p=>p.catalogType==='game'&&p.catalogPlatform===f.id)),products.find(p=>p.catalogType==='other')]
   for(const p of chosen){const c=srv.client();await c.post(`/${slug}/cart/add`,{sku:p.sku,qty:'1',action:'cart',kind:'game',platform:'ps5',unit_price:'1'})
    if(slug==='coupang')await c.post('/coupang/login',{email:'tester@example.com',password:'Password123!'})
    else await c.post('/gmarket/account',{action:'guest',guest_email:'catalog500@example.com'})
    const done=await c.post(slug==='coupang'?'/coupang/checkout/order':'/gmarket/checkout',slug==='coupang'?cpForm:gmForm);assert.equal(done.status,200,p.sku)
    const order=(await c.json('/api/orders?store='+slug)).at(-1);assert.equal(order.items[0].sku,p.sku);assert.equal(order.items[0].kind,'other');assert.equal(order.items[0].platform,undefined);assert.equal(order.items[0].unit_price,p.unit_price||p.price);assert.equal(order.currency,'KRW')
   }
  }finally{await srv.close()}
 })
}
