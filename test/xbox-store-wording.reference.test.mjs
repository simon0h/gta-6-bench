import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createApp } from '../app.js'

// Agent view (benchmark trial): nothing a shopper reads may say the store is a copy or a test.
const TELL = /synthetic|benchmark|simulat|captur|not verified|unverified|placeholder|fixture|clone|replica|illustrative|locally|local storefront|in this store|does not connect/i
// The HTML placeholder attribute and real product/genre names (Microsoft Flight Simulator, PowerWash
// Simulator, Farming Simulator, the Simulation genre) are not giveaways, so they are removed before matching.
const clean = html => html.replace(/\splaceholder="/g, ' ').replace(/(Flight|Farming|PowerWash) Simulator|Simulation|simulation(?=[\/?"-])|(flight|farming|powerwash)-simulator/gi, '')

function client(base) {
  let cookie = ''
  const jar = new Map()
  const go = async (path, init = {}) => {
    const res = await fetch(base + path, { redirect: 'manual', ...init, headers: { ...(init.headers || {}), cookie } })
    for (const c of res.headers.getSetCookie?.() || []) { const [kv] = c.split(';'); const i = kv.indexOf('='); jar.set(kv.slice(0, i), kv.slice(i + 1)) }
    cookie = [...jar].map(([k, v]) => `${k}=${v}`).join('; ')
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

const STD = '/xbox-store/en-US/games/store/grand-theft-auto-vi/9p3h4968grsm'

test('xbox-store agent view carries no giveaway wording on the main shopping pages', async () => {
  const app = await createApp({ persist: false, benchmark: { runId: 'wording', stores: ['xbox-store'] } })
  const server = await new Promise(resolve => { const s = app.listen(0, () => resolve(s)) })
  try {
    const c = client(`http://127.0.0.1:${server.address().port}`)
    const pages = []
    pages.push(await c.get('/xbox-store/'))
    pages.push(await c.get('/xbox-store/en-US/search/results?q=gta+6'))
    pages.push(await c.get('/xbox-store/en-US/search/results?q=grand+theft+auto'))
    const product = await c.get(STD)
    pages.push(product)
    pages.push(await c.post('/xbox-store/en-US/cart/add', { pid: '9p3h4968grsm' }))
    pages.push(await c.get('/xbox-store/en-US/cart'))
    pages.push(await c.post('/xbox-store/en-US/cart/checkout'))
    pages.push(await c.get('/xbox-store/signup.live.com/signup'))
    const signedUp = await c.post('/xbox-store/signup.live.com/signup', { email: 'wording@example.com', password: 'Wording123', firstName: 'Sam', lastName: 'Word', birthMonth: '5', birthDay: '9', birthYear: '1990' })
    pages.push(signedUp)
    pages.push(await c.get('/xbox-store/en-US/checkout'))
    pages.push(await c.get(`${STD}/buy`))
    pages.push(await c.post(`${STD}/buy`, { pi: 'new', payType: 'card', cardNumber: '1234567890123456', zip: '' }))
    for (const p of ['/account', '/account/library', '/account/services', '/account/billing/orders', '/en-US/support', '/en-US/redeem', '/en-US/privacy', '/en-US/terms', '/en-US/games/backward-compatibility', '/en-US/accessories']) pages.push(await c.get('/xbox-store' + p))
    pages.push(await c.post('/xbox-store/en-US/redeem', { code: 'AAAAA-BBBBB-CCCCC-DDDDD-EEEEE' }))
    pages.push(await c.get('/xbox-store/en-US/games/store/red-dead-redemption-2/9p5l3l5n52c4'))
    assert.equal(pages.at(-1).status, 200)
    const missing = await c.get('/xbox-store/this-page-does-not-exist-anywhere')
    assert.equal(missing.status, 404)
    pages.push(missing)
    assert.match(product.text, /Grand Theft Auto VI/)
    assert.match(signedUp.text, /Choose a way to pay|Checkout|Step 1/, 'the new account reaches checkout')
    for (const p of pages) {
      const text = clean(p.text)
      const hit = text.match(TELL)
      assert.equal(hit && text.slice(Math.max(0, hit.index - 80), hit.index + 80), null, `${p.path} (${p.status})`)
      assert.doesNotMatch(p.text, /not the real (Xbox|Microsoft)|Not affiliated|No bank refund/i, `${p.path} shows a public-site notice in agent view`)
    }
  } finally { server.close() }
})

test('xbox-store public site keeps the notices that protect real visitors', async () => {
  const app = await createApp({ persist: false })
  const server = await new Promise(resolve => { const s = app.listen(0, () => resolve(s)) })
  try {
    const c = client(`http://127.0.0.1:${server.address().port}`)
    const terms = await c.get('/xbox-store/en-US/terms')
    assert.match(terms.text, /not the real Microsoft Store/)
    assert.match(terms.text, /no card is charged/)
    const privacy = await c.get('/xbox-store/en-US/privacy')
    assert.match(privacy.text, /not affiliated with Microsoft/)
  } finally { server.close() }
})
