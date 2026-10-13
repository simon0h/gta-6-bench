import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer } from './helpers.js'
import { bySku } from '../stores/gmarket/data.js'

const DETAILS = { recipient: '김민수', phone: '010-1234-5678', postal_code: '06236', city: '서울특별시 강남구', line1: '테헤란로 123', line2: '101호', delivery_note: '문 앞에 놓아 주세요' }
const CARD = { name_on_card: 'Minsu Kim', card_number: '4242424242424242', expiry: '12/99', cvv: '123', terms: '1' }
const route = response => new URL(response.url).pathname
const add = (c, sku = '4796016651', qty = '1', action = 'cart') => c.post('/gmarket/cart/add', { sku, qty, action, age_confirmed: '1' })
async function guest(c, sku = '4796016651') {
  await add(c, sku)
  return c.post('/gmarket/account', { action: 'guest', guest_email: 'guest@example.com' })
}

test('gmarket: Korean search and guest preorder records KRW, Korean address and safe canonical payment', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    for (const q of ['gta 6', 'gta vi', 'grand theft auto', 'grand theft auto vi', 'GTA6', '그랜드 테프트 오토', '그랜드테프트오토', '그랜드 테프트 오토 6', '그랜드 테프트 오토 VI']) {
      const results = await c.get(`/gmarket/search?q=${encodeURIComponent(q)}`)
      assert.match(results.text, /href="\/gmarket\/product\/4796016651"/)
      assert.match(results.text, /href="\/gmarket\/product\/4796017670"/)
    }
    const page = await c.get('/gmarket/product/4796016651')
    assert.match(page.text, /<html lang="ko">/)
    assert.match(page.text, /name="viewport"/)
    assert.match(page.text, /Synthetic benchmark environment/)
    assert.match(page.text, /89,800원/)
    assert.doesNotMatch(page.text, /89,800\.00/)
    assert.match(page.text, /코드 인 박스 \(디스크 미포함\)/)
    assert.equal(route(await add(c, '4796016651', '2')), '/gmarket/cart')
    assert.equal(route(await c.get('/gmarket/checkout')), '/gmarket/account')
    assert.equal(route(await c.post('/gmarket/account', { action: 'guest', guest_email: 'guest@example.com' })), '/gmarket/checkout')
    const done = await c.post('/gmarket/checkout', { ...DETAILS, ...CARD, unit_price: '1', total: '1' })
    assert.equal(done.status, 200)
    assert.match(route(done), /^\/gmarket\/confirmation\/\d{10}$/)
    assert.match(done.text, /주문이 완료되었습니다/)
    assert.match(done.text, /Visa · 끝 4자리 4242/)
    const orders = await c.json('/api/orders?store=gmarket')
    assert.equal(orders.length, 1)
    const [order] = orders
    assert.deepEqual(order.items.map(({ platform, edition, format, qty, unit_price }) => ({ platform, edition, format, qty, unit_price })), [{ platform: 'ps5', edition: 'standard', format: 'code-in-box', qty: 2, unit_price: 89800 }])
    assert.equal(order.customer.email, 'guest@example.com')
    assert.equal(order.customer.guest, true)
    assert.equal(order.customer.first_name, '김민수')
    assert.equal(order.customer.last_name, '')
    assert.equal(order.fulfillment.method, 'ship')
    assert.equal(order.fulfillment.instructions, DETAILS.delivery_note)
    assert.equal(order.shipping_address.postal_code, '06236')
    assert.equal(order.shipping_address.country, 'KR')
    assert.deepEqual(order.payment, { method: 'card', brand: 'Visa', last4: '4242', name_on_card: 'Minsu Kim' })
    assert.deepEqual(order.totals, { subtotal: 179600, shipping: 0, tax: 0, discount: 0, total: 179600 })
    assert.equal(order.currency, 'KRW')
    assert.doesNotMatch(JSON.stringify(order), /4242424242424242|"cvv"/)
    assert.match((await c.get('/gmarket/cart')).text, /장바구니에 담긴 상품이 없습니다/)
    await c.post('/gmarket/checkout', { ...DETAILS, ...CARD })
    assert.equal((await c.json('/api/orders?store=gmarket')).length, 1, 'duplicate submission does not record another order')
  } finally { await srv.close() }
})

test('gmarket: sign-in and buy now preserve Xbox selection and accept international Korean mobile format', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    assert.equal(route(await add(c, '4796017670', '1', 'buy')), '/gmarket/account')
    const bad = await c.post('/gmarket/account', { action: 'signin', email: 'tester@example.com', password: 'wrong' })
    assert.equal(bad.status, 400)
    assert.match(bad.text, /아이디 또는 비밀번호를 확인/)
    assert.match(bad.text, /value="tester@example.com"/)
    assert.doesNotMatch(bad.text, /value="wrong"/)
    await c.post('/gmarket/account', { action: 'signin', email: 'tester@example.com', password: 'Password123!' })
    const done = await c.post('/gmarket/checkout', { ...DETAILS, phone: '+82 10-1234-5678', ...CARD })
    assert.equal(done.status, 200)
    const [order] = await c.json('/api/orders?store=gmarket')
    assert.equal(order.items[0].platform, 'xbox')
    assert.equal(order.items[0].format, 'code-in-box')
    assert.equal(order.customer.guest, false)
    assert.equal(order.customer.account_id, 'gmarket-1')
    assert.equal(order.totals.total, 89800)
    await c.post('/gmarket/account/signout')
    assert.match((await c.get('/gmarket/account')).text, /비회원으로 구매하기/)
  } finally { await srv.close() }
})

test('gmarket: invalid Korean address and card rerender escaped ordinary values without payment secrets', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    await guest(c)
    const badAddress = await c.post('/gmarket/checkout', { ...DETAILS, ...CARD, recipient: '<김민수>', postal_code: '1234', phone: '555-014-2026' })
    assert.equal(badAddress.status, 400)
    assert.match(badAddress.text, /5자리 우편번호/)
    assert.match(badAddress.text, /010으로 시작하는/)
    assert.match(badAddress.text, /value="&lt;김민수&gt;"/)
    assert.doesNotMatch(badAddress.text, /4242424242424242|value="123"/)
    const badCard = await c.post('/gmarket/checkout', { ...DETAILS, ...CARD, card_number: '4111111111111112', cvv: '987', name_on_card: 'Retained Name' })
    assert.equal(badCard.status, 400)
    assert.match(badCard.text, /올바른 카드번호/)
    assert.match(badCard.text, /value="Retained Name"/)
    assert.doesNotMatch(badCard.text, /4111111111111112|value="987"/)
    assert.match(badCard.text, /name="card_number" value=""/)
    const terms = await c.post('/gmarket/checkout', { ...DETAILS, ...CARD, terms: '0' })
    assert.equal(terms.status, 400)
    assert.match(terms.text, /주문내용 및 개인정보 제공에 동의해 주세요/)
    const empty = await c.post('/gmarket/checkout', {})
    assert.equal(empty.status, 400)
    assert.match(empty.text, /받는 사람 이름/)
    assert.equal((await c.json('/api/orders?store=gmarket')).length, 0)
  } finally { await srv.close() }
})

test('gmarket: catalog, age and quantity guards prevent forged orders and support cart edits', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    assert.equal((await c.get('/gmarket/product/forged')).status, 404)
    assert.equal((await c.post('/gmarket/cart/add', { sku: 'forged', qty: '1', action: 'cart', age_confirmed: '1' })).status, 400)
    const age = await c.post('/gmarket/cart/add', { sku: '4796016651', qty: '1', action: 'cart' })
    assert.equal(age.status, 400)
    assert.match(age.text, /만 19세 이상임을 확인해 주세요/)
    for (const count of ['0', '-1', '1.5', '6', '1junk']) assert.equal((await add(c, '4796016651', count)).status, 400)
    await add(c, '4796016651', '4')
    assert.equal((await add(c, '4796016651', '2')).status, 400)
    assert.equal((await c.post('/gmarket/cart/update', { sku: '4796016651', qty: '0', action: 'update' })).status, 400)
    await c.post('/gmarket/cart/update', { sku: '4796016651', qty: '2', action: 'update' })
    assert.match((await c.get('/gmarket/cart')).text, /179,600원/)
    await c.post('/gmarket/cart/update', { sku: '4796016651', action: 'remove' })
    assert.match((await c.get('/gmarket/cart')).text, /장바구니에 담긴 상품이 없습니다/)
    assert.equal(route(await c.post('/gmarket/checkout', { ...DETAILS, ...CARD })), '/gmarket/cart')
    assert.equal((await c.json('/api/orders?store=gmarket')).length, 0)
  } finally { await srv.close() }
})

test('gmarket: sessions isolate carts and confirmations and GTA V is recorded only as a distractor', async () => {
  const srv = await startServer()
  try {
    const a = srv.client(), b = srv.client()
    await guest(a, 'gta5-xbox')
    assert.match((await b.get('/gmarket/cart')).text, /장바구니에 담긴 상품이 없습니다/)
    assert.match((await b.get('/gmarket/search?q=GTA5')).text, /href="\/gmarket\/product\/gta5-xbox"/)
    assert.match((await b.get('/gmarket/search?q=unknown-game')).text, /검색결과가 없습니다/)
    const done = await a.post('/gmarket/checkout', { ...DETAILS, ...CARD })
    assert.equal(done.status, 200)
    assert.equal((await b.get(route(done))).status, 404)
    assert.equal((await a.get('/gmarket/confirmation/unknown')).status, 404)
    const [order] = await a.json('/api/orders?store=gmarket')
    assert.equal(order.items[0].kind, 'other')
    assert.equal(order.items[0].platform, undefined)
    assert.equal(order.items[0].sku, 'gta5-xbox')
    assert.deepEqual(order.totals, { subtotal: 26400, shipping: 3000, tax: 0, discount: 0, total: 29400 })
    assert.equal(order.meta.preorder, false)
    const stores = await a.json('/api/stores')
    const gmarket = stores.find(s => s.slug === 'gmarket')
    assert.equal(gmarket.country, 'KR')
    assert.equal(gmarket.currency, 'KRW')
    assert.equal(gmarket.gta6_available, true)
  } finally { await srv.close() }
})

test('gmarket: categories, seller search and sort compose; household goods do not require the game age gate', async () => {
  const srv=await startServer()
  try {
    const c=srv.client()
    const food=await c.get('/gmarket/search?category=food&sort=price-asc')
    assert.match(food.text,/상품 34개/)
    const prices=[...food.text.matchAll(/<article data-sku="([^"]+)"/g)].map(m=>bySku(m[1]).unit_price)
    assert.equal(prices.length,12)
    assert.ok(prices.every((p,i)=>!i||p>=prices[i-1]))
    assert.doesNotMatch(food.text,/href="\/gmarket\/product\/4796016651"/)
    const seller=await c.get('/gmarket/search?seller='+encodeURIComponent('디지털마트'))
    assert.match(seller.text,/상품 1개/)
    assert.match(seller.text,/href="\/gmarket\/product\/gm-headphones"/)
    assert.match((await c.get('/gmarket/product/4796016651?tab=reviews')).text,/아직 등록된 상품평이 없습니다/)
    const added=await c.post('/gmarket/cart/add',{sku:'gm-milk',qty:'1',action:'cart'})
    assert.equal(added.status,200)
    await c.post('/gmarket/cart/add',{sku:'gm-headphones',qty:'1',action:'cart'})
    await c.post('/gmarket/account',{action:'guest',guest_email:'guest@example.com'})
    await c.post('/gmarket/checkout',{...DETAILS,...CARD})
    const [order]=await c.json('/api/orders?store=gmarket')
    assert.equal(order.totals.shipping,6000)
    assert.equal(order.items.every(p=>p.kind==='other'),true)
    assert.deepEqual(order.meta.sellers,['푸드마켓','디지털마트'])
  } finally {await srv.close()}
})
