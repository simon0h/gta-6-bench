import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createApp } from '../app.js'

// Agent view (benchmark trial): nothing a shopper reads may say the store is a copy or a test.
const TELL = /synthetic|benchmark|simulat|captur|not verified|unverified|placeholder|fixture|clone|replica|authored local|in this shop|saved locally|test card/i
// The HTML placeholder attribute and real product/genre names (Farming Simulator 25, Pet Simulator,
// Simulation games) are not giveaways, so they are removed before matching.
const clean = html => html.replace(/\splaceholder="/g, ' ').replace(/(Farming|Pet|Flight) Simulator|Simulation|simulation(?=[\/?"-])|pet-simulator|farming-simulator/g, '')

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

test('game-uk agent view carries no giveaway wording on the main shopping pages', async () => {
  const app = await createApp({ persist: false, benchmark: { runId: 'wording', stores: ['game-uk'] } })
  const server = await new Promise(resolve => { const s = app.listen(0, () => resolve(s)) })
  try {
    const c = client(`http://127.0.0.1:${server.address().port}`)
    const pages = []
    pages.push(await c.get('/game-uk/'))
    pages.push(await c.get('/game-uk/searchresults?descriptionfilter=gta+6'))
    pages.push(await c.get('/game-uk/searchresults?descriptionfilter=grand+theft+auto'))
    pages.push(await c.get('/game-uk/rockstar-games-grand-theft-auto-vi-756802'))
    pages.push(await c.post('/game-uk/cart/add', { pid: '756802', qty: '1', age_confirmed: '1' }))
    pages.push(await c.get('/game-uk/cart'))
    pages.push(await c.get('/game-uk/checkout'))
    pages.push(await c.post('/game-uk/account/login', { action: 'email', email: 'wording@example.com', returnUrl: '/checkout' }))
    pages.push(await c.post('/game-uk/account/login', { action: 'guest', email: 'wording@example.com', returnUrl: '/checkout' }))
    pages.push(await c.get('/game-uk/checkout/delivery'))
    pages.push(await c.get('/game-uk/stores'))
    pages.push(await c.get('/game-uk/help/categories/legal'))
    pages.push(await c.get('/game-uk/information?topic=Terms'))
    const missing = await c.get('/game-uk/this-page-does-not-exist-anywhere')
    assert.equal(missing.status, 404)
    pages.push(missing)
    assert.match(pages[3].text, /Grand Theft Auto VI/)
    assert.match(pages[9].text, /Delivery method/, 'guest checkout reaches the delivery step')
    for (const p of pages) {
      const hit = clean(p.text).match(TELL)
      assert.equal(hit && clean(p.text).slice(Math.max(0, hit.index - 80), hit.index + 80), null, `${p.path} (${p.status})`)
      assert.doesNotMatch(p.text, /not the real GAME|Not affiliated/i, `${p.path} shows a public-site notice in agent view`)
    }
  } finally { server.close() }
})

test('game-uk public site keeps the notices that protect real visitors', async () => {
  const app = await createApp({ persist: false })
  const server = await new Promise(resolve => { const s = app.listen(0, () => resolve(s)) })
  try {
    const c = client(`http://127.0.0.1:${server.address().port}`)
    const terms = await c.get('/game-uk/information?topic=Terms')
    assert.match(terms.text, /not the real GAME website/)
  } finally { server.close() }
})
