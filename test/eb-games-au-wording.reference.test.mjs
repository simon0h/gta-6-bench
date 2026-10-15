import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createApp } from '../app.js'
import { fieldValue } from './helpers.js'

// Agent view (benchmark trial): nothing a shopper reads may say the store is a copy or a test.
const TELL = /synthetic|benchmark|simulat|captur|not verified|unverified|not been verified|placeholder|fixture|clone|replica|saved locally|received locally|this local|test account|not connected|in this store|live EB Games/i
// The HTML placeholder attribute and real product, category and genre names (Racing & Simulation,
// Life simulation, the Elgato HD60 X capture card, the Replicas collectibles department) are not
// giveaways, so they are removed before matching.
const clean = html => html
  .replace(/\splaceholder="/g, ' ')
  .replace(/Racing &amp; Simulation|Racing & Simulation|gaming-simulation|[Ll]ife simulation|simulation gear|racing wheel simulation/g, '')
  .replace(/External Capture Card|capture-card|Capture 1080p60/g, '')
  .replace(/>Replicas<|collectibles-replicas|Replica\b|replica/g, '')

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

const B = '/eb-games-au'
const INFO = { method: 'ship', first_name: 'Alex', last_name: 'Tester', phone: '0412345678', address: '1 George St', suburb: 'Sydney', state: 'NSW', postcode: '2000', shipping_method: 'standard' }
const CARD = { payment_method: 'card', card_number: '4242424242424242', card_expiry: '12/39', card_cvv: '123', card_name: 'Alex Tester', accept_deposit: 'yes' }

test('eb-games-au agent view carries no giveaway wording on the main shopping pages', async () => {
  const app = await createApp({ persist: false, benchmark: { runId: 'wording', stores: ['eb-games-au'] } })
  const server = await new Promise(resolve => { const s = app.listen(0, () => resolve(s)) })
  try {
    const c = client(`http://127.0.0.1:${server.address().port}`)
    const pages = []
    pages.push(await c.get(`${B}/`))
    pages.push(await c.get(`${B}/search?q=gta+6`))
    pages.push(await c.get(`${B}/search?q=grand+theft+auto`))
    const product = await c.get(`${B}/product/ps5/330056-grand-theft-auto-vi`)
    assert.match(product.text, /Grand Theft Auto VI/)
    pages.push(product)
    pages.push(await c.post(`${B}/cart/add`, { sku: '330056', qty: '1' }))
    pages.push(await c.get(`${B}/cart`))
    pages.push(await c.get(`${B}/checkout`))
    pages.push(await c.post(`${B}/checkout/guest`, { guest_email: 'wording@example.com' }))
    pages.push(await c.get(`${B}/checkout/delivery`))
    const pickup = await c.post(`${B}/checkout/delivery`, { ...INFO, method: 'pickup', store_id: 'sydney' })
    assert.equal(pickup.status, 400, 'GTA VI store pickup stays blocked')
    pages.push(pickup)
    const review = await c.post(`${B}/checkout/delivery`, INFO)
    assert.equal(review.status, 200)
    pages.push(review)
    const done = await c.post(`${B}/checkout/payment`, { ...CARD, review_token: fieldValue(review.text, 'review_token') })
    assert.match(done.text, /Thank you for your (pre)?order/)
    pages.push(done)
    pages.push(await c.get(`${B}/account/order-history`))
    const support = await c.post(`${B}/help/contact`, { category: 'Returns & faults', email: 'wording@example.com', subject: 'Preorder question', message: 'When will my preorder ship?' })
    assert.match(support.text, /Support request received/)
    pages.push(support)
    pages.push(await c.get(`${B}/help/cases`))
    pages.push(await c.get(`${B}/stores`))
    pages.push(await c.get(`${B}/stores?near=1`))
    pages.push(await c.get(`${B}/account`))
    pages.push(await c.get(`${B}/account/forgotten-password?email=wording@example.com`))
    pages.push(await c.get(`${B}/giftcards/balance?card_number=6280000000000000&pin=1234`))
    pages.push(await c.get(`${B}/plus`))
    pages.push(await c.get(`${B}/reboot`))
    pages.push(await c.get(`${B}/trade-and-save`))
    pages.push(await c.get(`${B}/marketplace`))
    const missing = await c.get(`${B}/this-page-does-not-exist-anywhere`)
    assert.equal(missing.status, 404)
    pages.push(missing)
    for (const p of pages) {
      const text = clean(p.text)
      const hit = text.match(TELL)
      assert.equal(hit && text.slice(Math.max(0, hit.index - 80), hit.index + 80), null, `${p.path} (${p.status})`)
      assert.doesNotMatch(p.text, /not the real EB Games|Not affiliated/i, `${p.path} shows a public-site notice in agent view`)
    }
  } finally { server.close() }
})

test('eb-games-au public site keeps the notices that protect real visitors', async () => {
  const app = await createApp({ persist: false })
  const server = await new Promise(resolve => { const s = app.listen(0, () => resolve(s)) })
  try {
    const c = client(`http://127.0.0.1:${server.address().port}`)
    const contact = await c.get(`${B}/help/contact`)
    assert.match(contact.text, /not the real EB Games website/)
    const plus = await c.get(`${B}/plus`)
    assert.match(plus.text, /not the real EB Games website: no membership is activated or charged/)
  } finally { server.close() }
})
