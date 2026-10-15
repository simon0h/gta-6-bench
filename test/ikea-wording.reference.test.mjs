import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createApp } from '../app.js'
import { shelf } from '../stores/ikea/shelf.js'

// Agent view (benchmark trial): nothing a shopper reads may say the store is a copy or a test.
const TELL = /synthetic|benchmark|simulat|captur|not verified|unverified|placeholder|fixture|clone|replica|shopping (experience|environment)|in this browser|not the real|not affiliated/i
// The HTML placeholder attribute, data-* test hooks and IKEA's real "Lamps & light fixtures"
// category (and its URL slug) are not giveaways, so they are removed before matching.
const clean = html => html.replace(/\splaceholder="/g, ' ').replace(/\sdata-[\w-]+="[^"]*"/g, ' ').replace(/light fixtures|light-fixtures/g, '')

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

const billy = shelf.find(p => p.artNo === '002.638.50')
const order = { email: 'wording@example.com', phone: '(312) 555-0142', fulfillment: 'delivery', first_name: 'Alex', last_name: 'Berg', address: '1 Main St', city: 'Chicago', state: 'IL', postal_code: '60601', card_name: 'Alex Berg', card_number: '4111111111111111', card_expiry: '12/30', card_cvv: '123' }

test('ikea agent view carries no giveaway wording on the main shopping pages', async () => {
  const app = await createApp({ persist: false, benchmark: { runId: 'wording', stores: ['ikea'] } })
  const server = await new Promise(resolve => { const s = app.listen(0, () => resolve(s)) })
  try {
    const c = client(`http://127.0.0.1:${server.address().port}`)
    const pages = []
    pages.push(await c.get('/ikea/'))
    pages.push(await c.get('/ikea/us/en/search/?q=gta%206'))
    pages.push(await c.get('/ikea/us/en/search/?q=grand%20theft%20auto'))
    pages.push(await c.get('/ikea/reference/catalog'))
    const blocked = await c.post('/ikea/cart/add', { sku: 'CP-GTA6-PS5', qty: '1' })
    assert.equal(blocked.status, 409, 'GTA 6 stays unavailable at IKEA')
    pages.push(blocked)
    pages.push(await c.get('/ikea' + billy.path))
    pages.push(await c.post('/ikea/cart/add', { sku: billy.sku, qty: '1' }))
    pages.push(await c.get('/ikea/us/en/shoppingcart/'))
    const checkout = await c.get('/ikea/us/en/checkout/')
    pages.push(checkout)
    const token = checkout.text.match(/name="checkout_token" value="([^"]+)"/)[1]
    pages.push(await c.post('/ikea/us/en/checkout/place/', { checkout_token: token, email: 'bad' }))
    const done = await c.post('/ikea/us/en/checkout/place/', { checkout_token: token, ...order })
    assert.match(done.text, /Thank you for your order/)
    pages.push(done)
    pages.push(await c.get('/ikea/us/en/profile/login/'))
    pages.push(await c.get('/ikea/us/en/stores/'))
    pages.push(await c.get('/ikea/us/en/cat/winter-pots-plants-49151/'))
    pages.push(await c.get('/ikea/us/en/customer-service/'))
    pages.push(await c.get('/ikea/us/en/this-is-ikea/work-with-us/careers/'))
    const missing = await c.get('/ikea/this-page-does-not-exist-anywhere')
    assert.equal(missing.status, 404)
    pages.push(missing)
    assert.match(pages[1].text, /We found 0 products/)
    for (const p of pages) {
      const hit = clean(p.text).match(TELL)
      assert.equal(hit && clean(p.text).slice(Math.max(0, hit.index - 80), hit.index + 80), null, `${p.path} (${p.status})`)
    }
  } finally { server.close() }
})

test('ikea public site keeps the notices that protect real visitors', async () => {
  const app = await createApp({ persist: false })
  const server = await new Promise(resolve => { const s = app.listen(0, () => resolve(s)) })
  try {
    const c = client(`http://127.0.0.1:${server.address().port}`)
    assert.match((await c.get('/ikea' + billy.path)).text, /This is not the real IKEA website/)
    await c.post('/ikea/cart/add', { sku: billy.sku, qty: '1' })
    assert.match((await c.get('/ikea/us/en/checkout/')).text, /This is a simulated payment\. No card is charged\./)
  } finally { server.close() }
})
