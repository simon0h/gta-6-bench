import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createApp } from '../app.js'

// Agent view (benchmark trial): nothing a shopper reads may say the store is a copy or a test.
const TELL = /synthetic|benchmark|simulat|captur|not verified|unverified|not been verified|placeholder|fixture|clone|replica|illustrative|in this shop|this benchmark|test card/i
// The HTML placeholder attribute and real product/genre names (Flight simulation joystick,
// Simulation games) are not giveaways, so they are removed before matching.
const clean = html => html.replace(/\splaceholder="/g, ' ').replace(/Flight simulation joystick|flight-simulation-joystick|Genre Simulation|Simulation games?/gi, '')

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

const NOTICE = /not the real Argos|Not affiliated/i

test('argos agent view carries no giveaway wording on the main shopping pages', async () => {
  const app = await createApp({ persist: false, benchmark: { runId: 'wording', stores: ['argos'] } })
  const server = await new Promise(resolve => { const s = app.listen(0, () => resolve(s)) })
  try {
    const c = client(`http://127.0.0.1:${server.address().port}`)
    const pages = []
    pages.push(await c.get('/argos/'))
    pages.push(await c.get('/argos/search?q=gta+6'))
    pages.push(await c.get('/argos/search?q=grand+theft+auto'))
    const product = await c.get('/argos/product/8747444')
    pages.push(product)
    const blocked = await c.post('/argos/trolley/add', { sku: '8747444', qty: '1', age_confirmed: '1' })
    assert.equal(blocked.status, 409, 'GTA VI stays unpurchasable')
    pages.push(blocked)
    pages.push(await c.get('/argos/trolley'))
    pages.push(await c.get('/argos/checkout'))
    pages.push(await c.get('/argos/account/login'))
    pages.push(await c.get('/argos/stores'))
    pages.push(await c.get('/argos/stores/london-central'))
    pages.push(await c.get('/argos/help'))
    pages.push(await c.get('/argos/help/contact'))
    pages.push(await c.get('/argos/help/payments'))
    pages.push(await c.get('/argos/help/delivery-collection'))
    pages.push(await c.get('/argos/help/gift-cards'))
    pages.push(await c.get('/argos/help/argos-pay'))
    pages.push(await c.get('/argos/privacy-hub/privacy-policy'))
    pages.push(await c.get('/argos/help/cookie-list'))
    const missing = await c.get('/argos/this-page-does-not-exist-anywhere')
    assert.equal(missing.status, 404)
    pages.push(missing)
    assert.match(product.text, /Grand Theft Auto VI/)
    for (const p of pages) {
      const hit = clean(p.text).match(TELL)
      assert.equal(hit && clean(p.text).slice(Math.max(0, hit.index - 80), hit.index + 80), null, `${p.path} (${p.status})`)
      assert.doesNotMatch(p.text, NOTICE, `${p.path} shows a public-site notice in agent view`)
    }
  } finally { server.close() }
})

test('argos public site keeps the notices that protect real visitors', async () => {
  const app = await createApp({ persist: false })
  const server = await new Promise(resolve => { const s = app.listen(0, () => resolve(s)) })
  try {
    const c = client(`http://127.0.0.1:${server.address().port}`)
    for (const path of ['/argos/help/payments', '/argos/help/contact', '/argos/help/gift-cards', '/argos/help/argos-pay']) {
      assert.match((await c.get(path)).text, /not the real Argos website/, path)
    }
  } finally { server.close() }
})
