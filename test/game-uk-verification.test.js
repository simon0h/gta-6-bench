import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer, fieldValue } from './helpers.js'

const ADDRESS = { firstName:'Jamie', lastName:'Example', addressLine1:'10 Test Road', town:'London', postcode:'SW1A 2AA', mobile:'07700900123', country:'GB', deliveryMethod:'standard' }
const CARD = { paymentMethod:'card', cardNumber:'4242424242424242', expiry:'12/29', cvv:'123', nameOnCard:'Jamie Example', billingSame:'1' }
const guest = c => c.post('/game-uk/account/login', {action:'guest', email:'verification@example.com', returnUrl:'/checkout'})
const login = c => c.post('/game-uk/account/login', {action:'signin', email:'tester@example.com', password:'Password123!', returnUrl:'/account'})
async function review(c) {
  await c.post('/game-uk/cart/add', {pid:'992019', qty:'1'})
  await guest(c)
  return fieldValue((await c.post('/game-uk/checkout/delivery', ADDRESS)).text, 'review_token')
}

test('GAME old payment forms cannot approve a changed delivery submission before its redirected review loads', async () => {
  const s = await startServer()
  try {
    for (const withToken of [true, false]) {
      const c=s.client(), token=await review(c)
      const changed=await c.post('/game-uk/checkout/delivery', {...ADDRESS,addressLine1:'20 Changed Road'}, {follow:false})
      assert.equal(changed.status,302)
      const stale=await c.post('/game-uk/checkout/payment', {...CARD,...(withToken?{review_token:token}:{})})
      assert.equal(stale.status,409)
      assert.match(stale.text,/20 Changed Road/)
      assert.doesNotMatch(stale.text,/4242424242424242|value="123"/)
      assert.equal((await c.json('/api/orders?store=game-uk')).length,0)
    }
  } finally { await s.close() }
})

test('GAME a review token from the prior identity cannot authorize a freshly entered checkout', async () => {
  const s=await startServer()
  try {
    const c=s.client(), token=await review(c)
    await login(c)
    await c.post('/game-uk/checkout/delivery', ADDRESS, {follow:false})
    assert.equal((await c.post('/game-uk/checkout/payment',{...CARD,review_token:token})).status,409)
    assert.equal((await c.json('/api/orders?store=game-uk')).length,0)
    const fresh=await c.get('/game-uk/checkout/payment')
    assert.match((await c.post('/game-uk/checkout/payment',{...CARD,review_token:fieldValue(fresh.text,'review_token')})).text,/Thank you for your order/)
  } finally { await s.close() }
})

test('GAME distinct billing addresses validate UK postcodes and retain the unchecked choice after a stale review', async () => {
  const s=await startServer()
  try {
    const c=s.client(),token=await review(c)
    const {billingSame,...cardWithoutSame}=CARD
    const different={...cardWithoutSame,billingFirstName:'Billing',billingLastName:'Example',billingAddressLine1:'30 Billing Road',billingTown:'London',billingPostcode:'not a postcode'}
    const invalid=await c.post('/game-uk/checkout/payment',{...different,review_token:token})
    assert.equal(invalid.status,400)
    assert.match(invalid.text,/Enter a valid UK billing postcode/)
    assert.match(invalid.text,/value="30 Billing Road"/)
    await c.post('/game-uk/cart/update',{line:'1',action:'inc'})
    const stale=await c.post('/game-uk/checkout/payment',{...different,billingPostcode:'GIR 0AA',review_token:token})
    assert.equal(stale.status,409)
    assert.doesNotMatch(stale.text, /name="billingSame"[^>]*checked/)
    assert.match(stale.text,/value="GIR 0AA"/)
    const done=await c.post('/game-uk/checkout/payment',{...different,billingPostcode:'GIR 0AA',review_token:fieldValue(stale.text,'review_token')})
    assert.match(done.text,/Thank you for your order/)
    const [order]=await c.json('/api/orders?store=game-uk')
    assert.equal(order.billing_address.postal_code,'GIR 0AA')
    assert.doesNotMatch(JSON.stringify(order),/4242424242424242|"cvv"|"password"/)
  } finally { await s.close() }
})

test('GAME duplicate delivery and identity fields reject safely, while protected aliases cannot skip CAPTCHA', async () => {
  const s=await startServer()
  try {
    const c=s.client();await review(c)
    const duplicateAddress=new URLSearchParams(ADDRESS);duplicateAddress.append('firstName','Second')
    const response=await c.post('/game-uk/checkout/delivery',duplicateAddress)
    assert.equal(response.status,400);assert.match(response.text,/submit each field once/)
    const duplicateLogin=new URLSearchParams({action:'signin',email:'tester@example.com',password:'Password123!'});duplicateLogin.append('password','secret-that-must-not-echo')
    const rejected=await c.post('/game-uk/account/login',duplicateLogin)
    assert.equal(rejected.status,400);assert.doesNotMatch(rejected.text,/Password123!|secret-that-must-not-echo/)
    assert.equal((await c.json('/api/orders?store=game-uk')).length,0)
  } finally {await s.close()}
  const protectedServer=await startServer({captcha:{mode:'on',stores:['game-uk']}})
  try {
    const c=protectedServer.client()
    for(const route of ['/login','/account/login','/checkout','/checkout/delivery','/checkout/payment']) assert.match((await c.get('/game-uk'+route)).text,/Security check/)
    for(const route of ['/register','/account/register']) assert.equal((await c.post('/game-uk'+route,{email:'bypass@example.com',password:'Password123!'})).status,404)
  } finally {await protectedServer.close()}
})

test('GAME guest number lookup, option detail, receipt and support remain session and identity private', async () => {
  const s=await startServer()
  try {
    const c=s.client()
    for(const option of ['black','red']) await c.post('/game-uk/cart/add',{pid:'992023',qty:'1',option})
    await guest(c)
    const payment=await c.post('/game-uk/checkout/delivery',ADDRESS)
    const receipt=await c.post('/game-uk/checkout/payment',{...CARD,review_token:fieldValue(payment.text,'review_token')})
    const [order]=await c.json('/api/orders?store=game-uk'), receiptPath=new URL(receipt.url).pathname+new URL(receipt.url).search
    const detailPath='/game-uk/orders/'+order.order_number
    const details=await c.get(detailPath)
    assert.match(details.text,/Colour: Black/);assert.match(details.text,/Colour: Red/)
    const request=await c.post('/game-uk/orders/'+order.id+'/request',{message:'Please check cancellation eligibility for this ordinary order.'})
    const requestPath=new URL(request.url).pathname
    assert.match(request.text,/No cancellation, return or refund has been approved/)
    const stranger=s.client()
    for(const path of [detailPath,receiptPath,requestPath])assert.equal((await stranger.get(path)).status,404)
    assert.equal((await c.get(receiptPath.replace(/token=[^&]+/,'token=forged'))).status,404)
    await login(c)
    for(const path of [detailPath,receiptPath,requestPath])assert.equal((await c.get(path)).status,404)
    assert.doesNotMatch((await c.get('/game-uk/account/orders')).text,new RegExp(order.order_number))
    await c.get('/game-uk/logout')
    for(const path of [detailPath,receiptPath,requestPath])assert.equal((await c.get(path)).status,200)
    const [unchanged]=await c.json('/api/orders?store=game-uk')
    assert.equal(unchanged.meta.lifecycle,undefined)
    assert.deepEqual(unchanged.items,order.items)
  } finally { await s.close() }
})
