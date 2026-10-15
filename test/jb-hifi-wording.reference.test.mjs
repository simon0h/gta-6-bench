import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createApp } from '../app.js'

// Agent view (benchmark trial): nothing a shopper reads may say the store is a copy or a test.
const TELL = /synthetic|benchmark|simulat|captur|not verified|not been verified|unverified|placeholder|fixture|clone|replica|in this shop|saved locally|test data|unavailable here/i
// The HTML placeholder attribute and real genre names (Simulation games) are not giveaways,
// so they are removed before matching.
const clean = html => html.replace(/\splaceholder="/g, ' ').replace(/Genre[^<]{0,40}Simulation|Simulation(?= games)/g, '')

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

test('jb-hifi agent view carries no giveaway wording on the main shopping pages', async () => {
  const app = await createApp({ persist: false, benchmark: { runId: 'wording', stores: ['jb-hifi'] } })
  const server = await new Promise(resolve => { const s = app.listen(0, () => resolve(s)) })
  try {
    const c = client(`http://127.0.0.1:${server.address().port}`)
    const pages = []
    pages.push(await c.get('/jb-hifi/'))
    pages.push(await c.get('/jb-hifi/search?query=gta+6'))
    pages.push(await c.get('/jb-hifi/search?query=grand+theft+auto'))
    const pdp = await c.get('/jb-hifi/products/playstation-5-grand-theft-auto-vi')
    pages.push(pdp)
    pages.push(await c.get('/jb-hifi/products/playstation-5-grand-theft-auto-vi?availability=my+location'))
    pages.push(await c.post('/jb-hifi/cart/add', { id: '903000' }))
    pages.push(await c.get('/jb-hifi/cart'))
    const checkout = await c.get('/jb-hifi/checkout')
    pages.push(checkout)
    pages.push(await c.get('/jb-hifi/stores'))
    pages.push(await c.get('/jb-hifi/pages/store-finder'))
    pages.push(await c.get('/jb-hifi/pages/perks'))
    pages.push(await c.get('/jb-hifi/pages/privacy-policy'))
    pages.push(await c.get('/jb-hifi/blogs/news-and-reviews'))
    pages.push(await c.get('/jb-hifi/information?topic=Terms'))
    pages.push(await c.get('/jb-hifi/information?topic=Privacy'))
    pages.push(await c.get('/jb-hifi/collections/cameras'))
    const missing = await c.get('/jb-hifi/this-page-does-not-exist-anywhere')
    assert.equal(missing.status, 404)
    pages.push(missing)
    assert.match(pdp.text, /Grand Theft Auto VI/)
    assert.match(checkout.text, /Grand Theft Auto VI/, 'checkout shows the GTA VI line')
    for (const p of pages) {
      const hit = clean(p.text).match(TELL)
      assert.equal(hit && clean(p.text).slice(Math.max(0, hit.index - 80), hit.index + 80), null, `${p.path} (${p.status})`)
      assert.doesNotMatch(p.text, /not the real JB Hi-Fi|Not affiliated/i, `${p.path} shows a public-site notice in agent view`)
    }
  } finally { server.close() }
})

test('jb-hifi public site keeps the notices that protect real visitors', async () => {
  const app = await createApp({ persist: false })
  const server = await new Promise(resolve => { const s = app.listen(0, () => resolve(s)) })
  try {
    const c = client(`http://127.0.0.1:${server.address().port}`)
    const terms = await c.get('/jb-hifi/information?topic=Terms')
    assert.match(terms.text, /not the real JB Hi-Fi website/)
    const privacy = await c.get('/jb-hifi/pages/privacy-policy')
    assert.match(privacy.text, /not the real JB Hi-Fi website/)
  } finally { server.close() }
})
