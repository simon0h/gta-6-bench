import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer, fieldValue } from './helpers.js'
import { ORDINARY_PRODUCTS } from '../stores/target/catalog.js'

const mug = ORDINARY_PRODUCTS.find(p => p.family === 'mug')
const pasta = ORDINARY_PRODUCTS.find(p => p.family === 'pasta')
const ADDRESS = { firstName:'Alex',lastName:'Tester',address1:'123 Ocean Dr',zip:'33139',city:'Miami',state:'FL',phone:'3055550123' }
const CARD = { paymentType:'card',cardNumber:'4242424242424242',expiry:'12/29',cvv:'123',nameOnCard:'Alex Tester',billingSame:'1' }
async function review(c, address = ADDRESS) {
  await c.post('/target/checkout/shipping',address)
  const page = await c.post('/target/checkout/payment',CARD)
  assert.match(page.url,/checkout\/review$/)
}

test('target verification: cart changes invalidate stale final checkout and retain safe address fields', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    await c.post('/target/login',{email:'tester@example.com',password:'Password123!'})
    await c.post('/target/cart/add',{tcin:mug.tcin})
    await c.post('/target/list/add',{tcin:pasta.tcin})
    const changes = [
      ['/target/cart/add',{tcin:mug.tcin}],
      ['/target/cart/update',{tcin:mug.tcin,qty:'3'}],
      ['/target/cart/from-list',{tcin:pasta.tcin}],
      ['/target/cart/update',{tcin:pasta.tcin,action:'save'}],
      ['/target/cart/update',{tcin:pasta.tcin,action:'restore'}],
      ['/target/cart/update',{tcin:pasta.tcin,action:'remove'}],
      ['/target/buy-now',{tcin:pasta.tcin}],
    ]
    for (const [path,body] of changes) {
      await review(c)
      assert.equal((await c.post(path,body)).status,200)
      const stale = await c.post('/target/checkout/place-order')
      assert.match(stale.url,/checkout\/shipping$/,path+' must require shipping review')
      assert.equal(fieldValue(stale.text,'address1'),ADDRESS.address1)
      assert.equal((await c.json('/api/orders?store=target')).length,0)
      assert.match((await c.post('/target/checkout/shipping',ADDRESS)).url,/checkout\/payment$/)
    }
    await review(c)
    assert.match((await c.post('/target/checkout/place-order')).url,/order-confirmation/)
    assert.equal((await c.json('/api/orders?store=target')).length,1)
  } finally { await srv.close() }
})

test('target verification: adding a restricted item after Alaska review cannot reuse prior shipping approval', async () => {
  const srv = await startServer()
  try {
    const c = srv.client(), alaska = {...ADDRESS,city:'Juneau',state:'AK',zip:'99801'}
    await c.post('/target/login',{email:'tester@example.com',password:'Password123!'})
    await c.post('/target/cart/add',{tcin:pasta.tcin})
    await review(c,alaska)
    await c.post('/target/cart/add',{tcin:'1011529119'})
    assert.match((await c.post('/target/checkout/place-order')).url,/checkout\/shipping$/)
    const rejected = await c.post('/target/checkout/shipping',alaska)
    assert.equal(rejected.status,400)
    assert.match(rejected.text,/Can’t ship to your address/)
    assert.equal((await c.json('/api/orders?store=target')).length,0)
  } finally { await srv.close() }
})
