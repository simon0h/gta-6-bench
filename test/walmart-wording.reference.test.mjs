import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createApp } from '../app.js'

// Agent view (benchmark trial): nothing a shopper reads may say the store is a copy or a test.
const TELL = /synthetic|benchmark|simulat|captur|not verified|unverified|placeholder|fixture|clone|replica|sample store|fictional|this local|in this browser|test account|test card|not connected/i
// Not giveaways, removed before matching: the HTML placeholder attribute, the real product name
// "Mobil 1 Advanced Full Synthetic Motor Oil", the "Textile and synthetic" sneaker material,
// Walmart's own product-information disclaimer ("...and we have not verified it."), and the
// .benchmark-fulfillment / .benchmark-availability class hooks used by benchmark/baselines-us.js.
const clean = html => html
  .replace(/\splaceholder="/g, ' ')
  .replace(/Full[ -]Synthetic|Textile and synthetic/gi, '')
  .replace(/provide what you see here, and we have not verified it\./g, '')
  .replace(/class="benchmark-(fulfillment|availability)"/g, '')

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

async function serve(options) {
  const app = await createApp(options)
  const server = await new Promise(resolve => { const s = app.listen(0, () => resolve(s)) })
  return { server, c: client(`http://127.0.0.1:${server.address().port}`) }
}

test('walmart agent view carries no giveaway wording on the main shopping pages', async () => {
  const { server, c } = await serve({ persist: false, benchmark: { runId: 'wording', stores: ['walmart'] } })
  try {
    const pages = []
    pages.push(await c.get('/walmart/'))
    pages.push(await c.get('/walmart/search?q=gta+6'))
    pages.push(await c.get('/walmart/search?q=grand+theft+auto'))
    pages.push(await c.get('/walmart/search?q=zzqxwv+nothing+matches'))
    const product = await c.get('/walmart/ip/20482917228')
    pages.push(product)
    pages.push(await c.get('/walmart/ip/20482917228/pickup?zip=10001'))
    pages.push(await c.post('/walmart/cart/add', { pid: '20482917228' }))
    const cart = await c.get('/walmart/cart')
    pages.push(cart)
    pages.push(await c.get('/walmart/account/login'))
    pages.push(await c.post('/walmart/cart/checkout', {}))
    pages.push(await c.post('/walmart/account/sign-up', { firstName: 'Alex', lastName: 'Tester', email: 'wording@example.com', phone: '3055550123', password: 'Password123!' }))
    pages.push(await c.post('/walmart/checkout/address', { firstName: 'Alex', lastName: 'Tester', address1: '123 Ocean Dr', city: 'Miami', state: 'FL', zip: '33139', phone: '3055550123' }))
    const payment = await c.get('/walmart/checkout/review-order?edit=payment')
    pages.push(payment)
    const badCard = await c.post('/walmart/checkout/payment', { method: 'card', cardNumber: '1234', expMonth: '12', expYear: '29', cvv: '1', firstName: 'Alex', lastName: 'Tester', phone: '3055550123', billingSame: '1' })
    assert.equal(badCard.status, 400)
    for (const p of [badCard, await c.get('/walmart/account'), await c.get('/walmart/orders'), await c.get('/walmart/help/contact'), await c.get('/walmart/account/preferences'), await c.get('/walmart/account/plus')]) pages.push(p.status === 400 ? { ...p, status: 200 } : p)
    for (const path of ['/help', '/help/article/payments-and-preorders', '/help/article/pickup-and-delivery', '/help/article/track-your-order',
      '/store-finder', '/store-finder?zip=68102', '/store/omaha-central', '/store/directory', '/services', '/plus', '/registries',
      '/cp/auto-services/1087266', '/cp/tax-exemption-program/8480422', '/careers', '/shop/get-it-fast', '/cp/halloween/9516159', '/cp/gift-cards/96894', '/registry'])
      pages.push(await c.get('/walmart' + path))
    const missing = await c.get('/walmart/this-page-does-not-exist-anywhere')
    assert.equal(missing.status, 404)
    pages.push(missing)
    assert.match(product.text, /Grand Theft Auto VI/)
    assert.match(cart.text, /Grand Theft Auto VI/)
    assert.match(payment.text, /Card number/, 'checkout reaches the payment form')
    for (const p of pages) if (p !== missing) assert.ok(p.status < 400, `${p.path} returned ${p.status}`)
    for (const p of pages) {
      const text = clean(p.text), hit = text.match(TELL)
      assert.equal(hit && text.slice(Math.max(0, hit.index - 80), hit.index + 80), null, `${p.path} (${p.status})`)
      assert.doesNotMatch(p.text, /not the real Walmart|Not affiliated/i, `${p.path} shows a public-site notice in agent view`)
    }
  } finally { server.close() }
})

test('walmart public site keeps the notices that protect real visitors', async () => {
  const { server, c } = await serve({ persist: false })
  try {
    const payments = await c.get('/walmart/help/article/payments-and-preorders')
    assert.match(payments.text, /not the real Walmart website: no card is charged/)
    const finder = await c.get('/walmart/store-finder')
    assert.match(finder.text, /not the real Walmart website: store names are fictional/)
  } finally { server.close() }
})
