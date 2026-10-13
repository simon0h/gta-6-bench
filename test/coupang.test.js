import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer } from './helpers.js'

const BASE = '/coupang'
const LOGIN = { email: 'tester@example.com', password: 'Password123!' }
const ORDER = { recipient: '김민수', phone: '010-1234-5678', postcode: '04524', city: '서울특별시', address: '중구 세종대로 110', address_detail: '101호', delivery_note: '문 앞', payment_method: 'card', card_name: 'Minsu Kim', card_number: '4242 4242 4242 4242', card_expiry: '12/39', card_cvv: '123', agree: 'yes' }
const path = response => new URL(response.url).pathname
async function prepare(client, sku = 'CP-GTA6-PS5') {
  await client.post(`${BASE}/cart/add`, { sku, qty: '1' })
  return client.post(`${BASE}/login`, LOGIN)
}

test('coupang: Korean search, member gate, PS5 cart and no-JavaScript card checkout record a KRW order', async () => {
  const server = await startServer()
  try {
    const client = server.client()
    const stores = await client.json('/api/stores')
    assert.deepEqual(stores.filter(store => store.slug === 'coupang').map(({ country, currency, gta6_available }) => ({ country, currency, gta6_available })), [{ country: 'KR', currency: 'KRW', gta6_available: true }])
    for (const query of ['gta 6', 'gta vi', 'grand theft auto', 'grand theft auto vi', 'GTA6', '그랜드 테프트 오토']) {
      const found = await client.get(`${BASE}/np/search?q=${encodeURIComponent(query)}`)
      assert.match(found.text, /lang="ko"/)
      assert.match(found.text, /name="viewport"/)
      assert.match(found.text, /Synthetic benchmark environment/)
      assert.match(found.text, /href="\/coupang\/vp\/products\/gta6-ps5"/)
      assert.match(found.text, /href="\/coupang\/vp\/products\/gta6-xbox"/)
    }
    assert.match((await client.get(`${BASE}/np/search?q=unlikely`)).text, /검색 결과가 없습니다/)
    const product = await client.get(`${BASE}/vp/products/gta6-ps5?run=coupang-korean`)
    assert.match(product.text, /89,800원/)
    assert.doesNotMatch(product.text, /89,800\.00/)
    assert.match(product.text, /박스 내 다운로드 코드 · 디스크 미포함/)
    const added = await client.post(`${BASE}/cart/add`, { sku: 'CP-GTA6-PS5', qty: '2' })
    assert.match(added.text, /상품을 장바구니에 담았습니다/)
    assert.match((await client.get(`${BASE}/cart`)).text, /179,600원/)
    assert.equal(path(await client.get(`${BASE}/checkout`)), `${BASE}/login`)
    const checkout = await client.post(`${BASE}/login`, LOGIN)
    assert.equal(path(checkout), `${BASE}/checkout`)
    assert.match(checkout.text, /받는사람정보/)
    assert.match(checkout.text, /우편번호 \(5자리\)/)
    const done = await client.post(`${BASE}/checkout/order`, ORDER)
    assert.match(path(done), /\/confirmation\/\d{14}$/)
    assert.match(done.text, /주문이 완료되었습니다/)
    assert.match(done.text, /179,600원/)
    assert.match(done.text, /Visa · 끝 4자리 4242/)
    assert.doesNotMatch(done.text, /4242 4242 4242 4242/)
    const orders = await client.json('/api/orders?store=coupang')
    assert.equal(orders.length, 1)
    const [order] = orders
    assert.deepEqual(order.items, [{ kind: 'game', platform: 'ps5', edition: 'standard', format: 'code-in-box', qty: 2, unit_price: 89800, title: 'Grand Theft Auto VI', sku: 'CP-GTA6-PS5' }])
    assert.equal(order.run_id, 'coupang-korean')
    assert.equal(order.customer.email, LOGIN.email)
    assert.equal(order.customer.first_name, '김민수')
    assert.equal(order.customer.last_name, '')
    assert.equal(order.customer.phone, '01012345678')
    assert.equal(order.shipping_address.postal_code, '04524')
    assert.equal(order.shipping_address.country, 'KR')
    assert.equal(order.fulfillment.method, 'ship')
    assert.equal(order.currency, 'KRW')
    assert.deepEqual(order.totals, { subtotal: 179600, shipping: 0, tax: 0, discount: 0, total: 179600 })
    assert.deepEqual(order.payment, { method: 'card', brand: 'Visa', last4: '4242', name_on_card: 'Minsu Kim' })
    assert.match((await client.get(`${BASE}/cart`)).text, /장바구니에 담은 상품이 없습니다/)
    assert.equal(path(await client.post(`${BASE}/checkout/order`, ORDER)), path(done))
    assert.equal((await client.json('/api/orders?store=coupang')).length, 1)
    assert.equal((await server.client().get(path(done))).status, 404)
  } finally { await server.close() }
})

test('coupang: invalid Korean contact/address and card details preserve safe values without placing an order', async () => {
  const server = await startServer()
  try {
    const client = server.client()
    await prepare(client)
    const invalid = await client.post(`${BASE}/checkout/order`, { ...ORDER, phone: '555-014-2026', postcode: '1234', card_number: '1111 1111 1111 1111', card_cvv: '999', agree: '' })
    assert.equal(invalid.status, 400)
    assert.match(invalid.text, /올바른 대한민국 연락처/)
    assert.match(invalid.text, /숫자 5자리/)
    assert.match(invalid.text, /카드번호, 유효기간 및 보안코드/)
    assert.match(invalid.text, /예약판매 조건에 동의/)
    assert.match(invalid.text, /name="recipient"[^>]*value="김민수"/)
    assert.match(invalid.text, /name="postcode"[^>]*value="1234"/)
    assert.match(invalid.text, /name="phone"[^>]*value="555-014-2026"/)
    assert.match(invalid.text, /name="card_number"[^>]*value=""/)
    assert.match(invalid.text, /name="card_cvv"[^>]*value=""/)
    assert.doesNotMatch(invalid.text, /1111 1111 1111 1111|value="999"/)
    assert.deepEqual(await client.json('/api/orders?store=coupang'), [])
    const revisit = await client.get(`${BASE}/checkout`)
    assert.match(revisit.text, /name="recipient"[^>]*value="김민수"/)
    assert.doesNotMatch(revisit.text, /1111 1111 1111 1111/)
    const done = await client.post(`${BASE}/checkout/order`, { ...ORDER, phone: '+82 10-1234-5678' })
    assert.match(done.text, /주문이 완료되었습니다/)
    assert.equal((await client.json('/api/orders?store=coupang'))[0].customer.phone, '01012345678')
  } finally { await server.close() }
})

test('coupang: direct checkout stays member-gated, wrong password and unsupported payment do not place orders', async () => {
  const server = await startServer()
  try {
    const client = server.client()
    await client.post(`${BASE}/cart/add`, { sku: 'CP-GTA6-PS5', qty: '1' })
    assert.equal(path(await client.post(`${BASE}/checkout/order`, ORDER)), `${BASE}/login`)
    const denied = await client.post(`${BASE}/login`, { ...LOGIN, password: 'incorrect-password' })
    assert.equal(denied.status, 400)
    assert.match(denied.text, /아이디 또는 비밀번호/)
    assert.doesNotMatch(denied.text, /incorrect-password/)
    await client.post(`${BASE}/login`, LOGIN)
    const unsupported = await client.post(`${BASE}/checkout/order`, { ...ORDER, payment_method: 'coupay' })
    assert.equal(unsupported.status, 400)
    assert.match(unsupported.text, /신용 \/ 체크카드 결제를 선택/)
    assert.deepEqual(await client.json('/api/orders?store=coupang'), [])
    assert.match((await server.client().get(`${BASE}/cart`)).text, /장바구니에 담은 상품이 없습니다/)
  } finally { await server.close() }
})

test('coupang: Xbox direct purchase, bounded quantities and cart removal use canonical items', async () => {
  const server = await startServer()
  try {
    const client = server.client()
    assert.equal((await client.get(`${BASE}/vp/products/unknown`)).status, 404)
    assert.equal((await client.post(`${BASE}/cart/add`, { sku: 'FAKE', qty: '1' })).status, 400)
    assert.equal((await client.post(`${BASE}/cart/add`, { sku: 'CP-GTA6-XBOX', qty: '1.5' })).status, 400)
    assert.equal(path(await client.post(`${BASE}/cart/add`, { sku: 'CP-GTA6-XBOX', qty: '1', intent: 'buy' })), `${BASE}/login`)
    assert.match((await client.get(`${BASE}/cart`)).text, /장바구니에 담은 상품이 없습니다/)
    await client.post(`${BASE}/cart/add`, { sku: 'CP-GTA6-XBOX', qty: '1' })
    const invalid = await client.post(`${BASE}/cart/update`, { sku: 'CP-GTA6-XBOX', 'qty_CP-GTA6-XBOX': '0', action: 'update' })
    assert.equal(invalid.status, 400)
    assert.match(invalid.text, /수량은 1개부터 4개/)
    await client.post(`${BASE}/cart/update`, { sku: 'CP-GTA6-XBOX', 'qty_CP-GTA6-XBOX': '4', action: 'update' })
    assert.equal((await client.post(`${BASE}/cart/add`, { sku: 'CP-GTA6-XBOX', qty: '1' })).status, 400)
    await client.post(`${BASE}/cart/update`, { sku: 'CP-GTA6-XBOX', action: 'remove' })
    assert.match((await client.get(`${BASE}/cart`)).text, /장바구니에 담은 상품이 없습니다/)
    await prepare(client, 'CP-GTA6-XBOX')
    const done = await client.post(`${BASE}/checkout/order`, { ...ORDER, phone: '02-1234-5678' })
    assert.match(done.text, /Xbox Series X\|S/)
    const [order] = await client.json('/api/orders?store=coupang')
    assert.equal(order.items[0].platform, 'xbox')
    assert.equal(order.items[0].format, 'code-in-box')
    assert.equal(order.items[0].unit_price, 89800)
    assert.equal(order.totals.total, 89800)
  } finally { await server.close() }
})

test('coupang: marketplace categories, filters and product tabs work and non-game purchases stay distractors', async () => {
  const server = await startServer()
  try {
    const client=server.client()
    const home=await client.get(BASE)
    assert.match(home.text,/오늘의 발견/)
    assert.match(home.text,/href="\/coupang\/vp\/products\/milk-10"/)
    const food=await client.get(`${BASE}/np/search?category=food&sort=price-asc&size=48`)
    assert.match(food.text,/46개의 상품/)
    assert.ok(food.text.indexOf('data-product="bananas"')<food.text.indexOf('data-product="water-24"'))
    assert.doesNotMatch(food.text,/href="\/coupang\/vp\/products\/gta6-ps5"/)
    const filtered=await client.get(`${BASE}/np/search?q=gta6&delivery=rocket`)
    assert.match(filtered.text,/검색 결과가 없습니다/)
    assert.match((await client.get(`${BASE}/vp/products/gta6-ps5?tab=reviews`)).text,/아직 등록된 상품평이 없습니다/)
    assert.match((await client.get(`${BASE}/vp/products/gta6-ps5?tab=shipping`)).text,/코드 사용/)
    await client.post(`${BASE}/cart/add`,{sku:'CP-MILK-10',qty:'1'})
    await client.post(`${BASE}/login`,LOGIN)
    await client.post(`${BASE}/checkout/order`,ORDER)
    const [order]=await client.json('/api/orders?store=coupang')
    assert.equal(order.items[0].kind,'other')
    assert.equal(order.items[0].unit_price,21900)
    assert.equal(order.items[0].platform,undefined)
    assert.equal(order.meta.synthetic_preorder,false)
    assert.match(order.fulfillment.eta,/1–3일/)
  } finally {await server.close()}
})
