import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer, fieldValue } from './helpers.js'
import { PRODUCTS } from '../stores/rockstar-store/data.js'
import { recordOrder } from '../lib/orders.js'

const B = '/rockstar-store'
const LOGIN = { email:'tester@example.com', password:'Password123!' }
const ADDRESS = { country:'US', first_name:'Alex', last_name:'Tester', city:'Miami', region:'FL', postal_code:'33139', street_address:'123 Ocean Dr', phone:'3055550123', email:LOGIN.email }

test('rockstar verification: malformed calendar dates cannot satisfy the age gate', async () => {
  const s = await startServer()
  try {
    const c = s.client()
    await c.post(B + '/game/buy-gta-vi/preorder', { platform:'ps5' })
    for (const dob of [
      {month:'2',day:'31',year:'1990'}, {month:'2',day:'29',year:'1900'},
      {month:'4',day:'31',year:'1990'}, {month:'1.5',day:'1',year:'1990'},
      {month:'1',day:'1.5',year:'1990'}, {month:'1',day:'1',year:'1990.5'},
      {month:'1',day:'1',year:'Infinity'}, {month:'1',day:'1',year:'2999'},
    ]) {
      assert.equal((await c.post(B + '/verify-age', dob)).status, 400, JSON.stringify(dob))
      assert.match((await c.post(B + '/checkout/guest')).url, /modal=verify-age/)
    }
    assert.match((await c.post(B + '/verify-age', {month:'2',day:'29',year:'2000'})).url, /modal=checkout-gate/)
    assert.match((await c.post(B + '/checkout/guest')).url, /checkout\/shipping-address/)
  } finally { await s.close() }
})

test('rockstar verification: unsupported shipping countries reject without silently changing the address', async () => {
  const s = await startServer()
  try {
    const c = s.client()
    await c.post(B + '/buy-now', {sku:'355001-US'})
    await c.post(B + '/checkout/guest')
    for (const country of ['ZZ','constructor','']) {
      const result = await c.post(B + '/checkout/shipping-address', {...ADDRESS,country})
      assert.equal(result.status,400)
      assert.match(result.text,/Choose a supported country/)
      assert.match(result.text,/value="123 Ocean Dr"/)
      assert.match((await c.get(B + '/checkout/payment')).url,/shipping-address/)
    }
    assert.match((await c.post(B + '/checkout/shipping-address',ADDRESS)).url,/shipping-method/)
  } finally { await s.close() }
})

test('rockstar verification: reviewed digital denomination rights and completed snapshots remain bound', async () => {
  const s = await startServer(), p = PRODUCTS.find(p => p.id==='gold-bars'), v = p.variants.find(v=>v.id==='55'), label=v.label
  try {
    const c = s.client()
    await c.post(B + '/signin',LOGIN)
    const pay = await c.post(B + '/buy-now',{sku:p.sku,variant:v.id})
    const oldToken = fieldValue(pay.text,'review_token')
    v.label = 'Changed denomination rights'
    const stale = await c.post(B + '/checkout/payment',{payment_method:'paypal',review_token:oldToken})
    assert.equal(stale.status,409)
    assert.equal((await c.json('/api/orders?store=rockstar-store')).length,0)
    v.label = label
    const review = await c.get(B + '/checkout/payment')
    const receipt = await c.post(B + '/checkout/payment',{payment_method:'paypal',review_token:fieldValue(review.text,'review_token')})
    assert.equal(receipt.status,200)
    const [order] = await c.json('/api/orders?store=rockstar-store')
    v.label = 'Post-purchase catalogue change'
    const [snapshot] = await c.json('/api/orders?store=rockstar-store')
    assert.equal(snapshot.meta.entitlements[0].label,label)
    assert.equal(snapshot.meta.options[0].options['Gold Bars'],label)
    assert.match((await c.get(B + '/library')).text,/55 Gold Bars/)
    await c.post(B + '/checkout/payment',{payment_method:'paypal',review_token:oldToken})
    assert.equal((await c.json('/api/orders?store=rockstar-store')).length,1)
    const stranger = s.client(); await stranger.post(B+'/signin',LOGIN)
    assert.equal((await stranger.get(receipt.url)).status,404)
    assert.equal((await stranger.get(B+'/library/'+order.id+'/gold-bars?sku=RS-GOLD-BARS%3A55')).status,404)

    // Same session/account identifiers are insufficient when the store differs.
    const foreign = recordOrder({...order,store:'xbox-store',order_number:'RS77-foreign',session:{id:order.session_id},meta:{...order.meta,token:'foreign-token'}})
    for (const url of [B+'/orders/'+foreign.id,B+'/support/contact?order_id='+foreign.id,B+'/library/'+foreign.id+'/gold-bars',B+'/checkout/status?transaction_id='+foreign.order_number+'&token=foreign-token']) assert.equal((await c.get(url)).status,404)
    assert.equal((await c.post(B+'/orders/'+foreign.id+'/action',{action:'cancel',reason:'Wrong store'})).status,404)
  } finally { v.label=label; await s.close() }
})
