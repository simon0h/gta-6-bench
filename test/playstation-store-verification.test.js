import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer, fieldValue } from './helpers.js'
import { byId } from '../stores/playstation-store/data.js'
const S='/playstation-store', C=`${S}/en-us/checkout`
const login=c=>c.post(`${S}/my.account.sony.com/central/signin/`,{step:'password',email:'tester@example.com',password:'Password123!'})
const add=(c,sku)=>c.post(`${S}/en-us/cart/add`,{sku})

test('PlayStation verification: edition inclusion changes invalidate review and receipts retain purchased rights',async()=>{
 const srv=await startServer(),p=byId('BENCH-POCKET-GARDEN-DELUXE'),original=[...p.includedSkus]
 try {
  const c=srv.client();await login(c);await add(c,p.id)
  const review=await c.post(`${C}/payment/service`,{service:'paypal'})
  p.includedSkus.pop()
  assert.equal((await c.post(C,{paymentMethod:'paypal',review_token:fieldValue(review.text,'review_token')})).status,409)
  assert.deepEqual(await c.json('/api/orders?store=playstation-store'),[])
  p.includedSkus.splice(0,p.includedSkus.length,...original)
  const fresh=await c.get(C);await c.post(C,{paymentMethod:'paypal',review_token:fieldValue(fresh.text,'review_token')})
  const [before]=await c.json('/api/orders?store=playstation-store')
  p.includedSkus.pop();p.platforms.push('unreviewed-platform');p.entitlements.push('unreviewed-license')
  const [after]=await c.json('/api/orders?store=playstation-store')
  assert.deepEqual(after,before)
 } finally {p.includedSkus.splice(0,p.includedSkus.length,...original);if(p.platforms.at(-1)==='unreviewed-platform')p.platforms.pop();if(p.entitlements.at(-1)==='unreviewed-license')p.entitlements.pop();await srv.close()}
})

test('PlayStation verification: ambiguous cardholder and billing fields cannot save a payment method',async()=>{
 const srv=await startServer()
 try {
  const c=srv.client();await login(c);await add(c,'BENCH-POCKET-GARDEN')
  const card={cardNumber:'4242424242424242',cardholderName:'Taylor Player',expMonth:'12',expYear:String(new Date().getFullYear()+2),cvv:'123'}
  const repeated=new URLSearchParams(card);repeated.append('cardholderName','Another Player')
  assert.equal((await c.post(`${C}/payment/card`,repeated)).status,400)
  await c.post(`${C}/payment/card`,card)
  const billing={firstName:'Taylor',lastName:'Player',address1:'1 Garden Lane',address2:'',city:'Miami',state:'FL',zip:'33139',phone:'3055551234',country:'US'}
  const duplicate=new URLSearchParams(billing);duplicate.append('firstName','Another')
  const bad=await c.post(`${C}/payment/card/billing`,duplicate)
  assert.equal(bad.status,400);assert.match(bad.text,/1 Garden Lane/)
  assert.match((await c.get(`${S}/en-us/payment-management`)).text,/No saved payment methods/)
  await c.post(`${C}/payment/card`,{...card,cardNumber:'invalid'})
  assert.match((await c.get(`${C}/payment/card/billing`)).url,/\/payment\/card$/)
  assert.deepEqual(await c.json('/api/orders?store=playstation-store'),[])
 } finally {await srv.close()}
})

test('PlayStation verification: Deluxe edition does not inherit base-only Plus inclusion',async()=>{
 const srv=await startServer()
 try {
  const c=srv.client(),p=byId('BENCH-POCKET-GARDEN-DELUXE')
  assert.equal(p.plusTag,null)
  const plus=await c.get(`${S}/en-us/pages/browse?plus=Extra`)
  assert.doesNotMatch(plus.text,/href="[^" ]*\/product\/BENCH-POCKET-GARDEN-DELUXE"/)
  const page=await c.get(`${S}/en-us/product/${p.id}`)
  assert.doesNotMatch(page.text,/Also discover this title with PlayStation Plus/)
 } finally {await srv.close()}
})
