import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createApp } from '../app.js'
import { products } from '../stores/sephora/shelf.js'
import { capturedSearchProducts } from '../stores/sephora/search-reference.js'

// Agent view (benchmark trial): nothing a shopper reads may say the store is a copy or a test.
const TELL = /synthetic|benchmark|simulat|captur|not verified|unverified|placeholder|fixture|\bclone|replica|illustrat|not affiliated|no real/i
// The HTML placeholder attribute, the shared test-hook data attributes and the real Maison
// Margiela 'REPLICA' line (and HAUS LABS Triclone, hence \bclone) are not giveaways, so they are removed before matching.
const clean = html => html
  .replace(/\splaceholder="/g, ' ')
  .replace(/\sdata-(?:reference-state|purchase-evidence)="[^"]*"/g, '')
  .replace(/'REPLICA'|&#39;REPLICA&#39;|\/product\/replica-[\w-]+/g, '')

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

test('sephora agent view carries no giveaway wording on the main shopping pages', async () => {
  const app = await createApp({ persist: false, benchmark: { runId: 'wording', stores: ['sephora'] } })
  const server = await new Promise(resolve => { const s = app.listen(0, () => resolve(s)) })
  try {
    const c = client(`http://127.0.0.1:${server.address().port}`)
    const item = products[0], searched = capturedSearchProducts[0]
    const pages = []
    pages.push(await c.get('/sephora/'))
    pages.push(await c.get('/sephora/search?keyword=gta%206'))
    pages.push(await c.get('/sephora/search?keyword=grand%20theft%20auto'))
    pages.push(await c.get('/sephora/search?keyword=Grand+Theft+Auto+VI'))
    pages.push(await c.get(`/sephora${searched.path}`))
    pages.push(await c.get(`/sephora${searched.path.split('?')[0]}?skuId=0000000`))
    pages.push(await c.get(`/sephora${item.path}`))
    pages.push(await c.get('/sephora/basket'))
    pages.push(await c.post('/sephora/basket/add', { skuId: item.variants[0].sku, productId: item.id, qty: '1' }))
    pages.push(await c.get('/sephora/checkout'))
    pages.push(await c.post('/sephora/checkout', { email: 'not-an-email' }))
    pages.push(await c.post('/sephora/cart/add', { id: 'gta-6' }))
    pages.push(await c.get('/sephora/login'))
    pages.push(await c.get('/sephora/profile/MyAccount'))
    pages.push(await c.get('/sephora/profile/MyAccount/Orders?orderId=12345'))
    pages.push(await c.get('/sephora/happening/stores/sephora-near-me?location=94010'))
    pages.push(await c.get('/sephora/happening/home'))
    pages.push(await c.get('/sephora/beauty/giftcards?check=1&card=1&pin=1'))
    pages.push(await c.get('/sephora/beauty/ai-beauty-chat'))
    pages.push(await c.get('/sephora/rewards'))
    pages.push(await c.get('/sephora/beauty/free-beauty-samples'))
    pages.push(await c.get('/sephora/happening/reservations'))
    pages.push(await c.get('/sephora/happening/stores/sephora-near-me'))
    pages.push(await c.get('/sephora/happening/stores/sephora-near-me?location=10001'))
    pages.push(await c.get('/sephora/community/profile'))
    pages.push(await c.get('/sephora/email-signup?email=wording%40example.com'))
    pages.push(await c.get('/sephora/beauty/customer-service'))
    const missing = await c.get('/sephora/this-page-does-not-exist-anywhere')
    assert.equal(missing.status, 404)
    pages.push(missing)
    assert.equal((pages[1].text.match(/data-product-kind="other"/g) || []).length, 100, 'gta 6 search keeps its 100 results')
    assert.match(pages[4].text, /Highlights/)
    assert.match(pages[9].text, /Place Order/, 'checkout opens with an item in the basket')
    for (const p of pages) {
      const text = clean(p.text), hit = text.match(TELL)
      assert.equal(hit && text.slice(Math.max(0, hit.index - 80), hit.index + 80), null, `${p.path} (${p.status})`)
      assert.doesNotMatch(p.text, /not sephora\.com|does not send email/i, `${p.path} shows a public-site notice in agent view`)
    }
  } finally { server.close() }
})

test('sephora public site keeps the notices that protect real visitors', async () => {
  const app = await createApp({ persist: false })
  const server = await new Promise(resolve => { const s = app.listen(0, () => resolve(s)) })
  try {
    const c = client(`http://127.0.0.1:${server.address().port}`)
    const home = await c.get('/sephora/')
    assert.match(home.text, /not sephora\.com and is not affiliated with Sephora/)
    assert.match(home.text, /no card is charged/)
    const signup = await c.get('/sephora/email-signup?email=wording%40example.com')
    assert.match(signup.text, /does not send email/)
  } finally { server.close() }
})
