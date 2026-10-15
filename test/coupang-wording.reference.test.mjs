import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createApp } from '../app.js'
import { shelf } from '../stores/coupang/shelf.js'

// Agent view (benchmark trial): nothing a shopper reads may say the store is a copy or a test.
const TELL = /synthetic|benchmark|simulat|captur|not verified|unverified|placeholder|fixture|clone|replica|모의|예시|미수집|수집되지|검증되지|미검증|가상|시뮬|테스트|벤치|이 환경|로컬/i
// The HTML placeholder attribute and data-* test hooks (e.g. data-reference-state) are not
// read as text, so they are removed before matching.
const clean = html => html.replace(/\s(?:placeholder|data-[\w-]+)="[^"]*"/g, ' ')

function client(base) {
  let cookie = ''
  const go = async (path, init = {}) => {
    const res = await fetch(base + path, { redirect: 'manual', ...init, headers: { ...(init.headers || {}), cookie } })
    const set = res.headers.getSetCookie?.() || []
    if (set.length) cookie = set.map(c => c.split(';')[0]).join('; ')
    if (res.status >= 300 && res.status < 400 && res.headers.get('location')) {
      const loc = new URL(res.headers.get('location'), base)
      return go(loc.pathname + loc.search)
    }
    return { status: res.status, text: await res.text(), path }
  }
  return {
    get: path => go(path),
    post: (path, body) => go(path, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(body).toString() }),
  }
}

test('coupang agent view carries no giveaway wording on the main shopping pages', async () => {
  const app = await createApp({ persist: false, benchmark: { runId: 'wording', stores: ['coupang'] } })
  const server = await new Promise(resolve => { const s = app.listen(0, () => resolve(s)) })
  try {
    const c = client(`http://127.0.0.1:${server.address().port}`)
    const item = shelf.find(p => p.title.startsWith('제주삼다수'))
    const pages = []
    pages.push(await c.get('/coupang/'))
    pages.push(await c.get('/coupang/np/search?q=gta+6'))
    pages.push(await c.get('/coupang/np/search?q=grand+theft+auto'))
    pages.push(await c.get('/coupang/np/search?q=zzqqxx'))
    pages.push(await c.get('/coupang' + item.path))
    pages.push(await c.get('/coupang/p/bep'))
    pages.push(await c.get('/coupang/np/notices'))
    pages.push(await c.get('/coupang/np/policies/privacy'))
    pages.push(await c.get('/coupang/help/articles/terms-privacy'))
    pages.push(await c.get('/coupang/cart'))
    const blocked = await c.post('/coupang/cart/add', { sku: 'CP-GTA6-PS5', qty: '1' })
    assert.equal(blocked.status, 409)
    assert.match(blocked.text, /구매할 수 없/)
    pages.push(blocked)
    pages.push(await c.post('/coupang/cart/add', { product_id: item.id, sku: item.sku, qty: '1', intent: 'cart' }))
    pages.push(await c.get('/coupang/checkout'))
    pages.push(await c.post('/coupang/register', { email: 'wording@example.com', password: 'Password123!', password_confirm: 'Password123!', first_name: '김쿠팡', phone: '01012345678', agree: 'yes' }))
    const checkout = await c.get('/coupang/checkout')
    assert.match(checkout.text, /결제하기/)
    pages.push(checkout)
    pages.push(await c.post('/coupang/checkout/order', { recipient: '김쿠팡', phone: '010-1234-5678', postcode: '05510', city: '서울특별시', address: '송파대로 570', payment_method: 'card', card_name: 'KIM COUPANG', card_number: '4111111111111111', card_expiry: '12/30', card_cvv: '123', agree: 'yes' }))
    assert.match(pages.at(-1).text, /주문이 완료되었습니다/)
    const missing = await c.get('/coupang/this-page-does-not-exist-anywhere')
    assert.equal(missing.status, 404)
    assert.match(missing.text, /페이지를 찾을 수 없습니다/)
    pages.push(missing)
    for (const p of pages) {
      const text = clean(p.text)
      const hit = text.match(TELL)
      assert.equal(hit && text.slice(Math.max(0, hit.index - 80), hit.index + 80), null, `${p.path} (${p.status})`)
      assert.doesNotMatch(p.text, /관련 없는|Not affiliated|couldn't find|isn't available/i, `${p.path} shows a public-site notice or English fallback in agent view`)
    }
  } finally { server.close() }
})

test('coupang public site keeps the notices that protect real visitors', async () => {
  const app = await createApp({ persist: false })
  const server = await new Promise(resolve => { const s = app.listen(0, () => resolve(s)) })
  try {
    const c = client(`http://127.0.0.1:${server.address().port}`)
    assert.match((await c.get('/coupang/')).text, /실제 주문이나 결제가 이루어지지 않는 모의 쇼핑 환경입니다/)
    assert.match((await c.get('/coupang/np/policies/privacy')).text, /실제 개인정보와 카드정보를 입력하지 마세요/)
  } finally { server.close() }
})
