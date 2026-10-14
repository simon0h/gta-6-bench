import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createApp } from '../app.js'
import { SHELF } from '../stores/chewy/shelf.js'

// Agent view (benchmark trial): nothing a shopper reads may say the store is a copy or a test.
const TELL = /synthetic|benchmark|simulat|captur|not verified|unverified|placeholder|fixture|clone|replica|not the real chewy|not affiliated|summarized from chewy/i
// The HTML placeholder attribute and data-* test hooks (data-reference-state="uncaptured", which
// other tests rely on) are not shopper-readable text, so they are removed before matching.
const clean = html => html.replace(/\splaceholder="/g, ' ').replace(/\sdata-[\w-]+="[^"]*"/g, '')

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

async function withApp(options, fn) {
  const app = await createApp(options)
  const server = await new Promise(resolve => { const s = app.listen(0, () => resolve(s)) })
  try { return await fn(client(`http://127.0.0.1:${server.address().port}`)) } finally { server.close() }
}

test('chewy agent view carries no giveaway wording on the main shopping pages', async () => {
  await withApp({ persist: false, benchmark: { runId: 'wording', stores: ['chewy'] } }, async c => {
    const item = SHELF.find(p => p.id === '52404')
    const pages = []
    pages.push(await c.get('/chewy/'))
    pages.push(await c.get('/chewy/s?query=gta+6'))
    pages.push(await c.get('/chewy/s?query=grand+theft+auto'))
    pages.push(await c.get('/chewy/b/science-backed-formulas-139702'))
    pages.push(await c.get('/chewy/b/horse-tack-and-saddlery-supplies-11439'))
    pages.push(await c.get('/chewy' + item.path))
    pages.push(await c.get('/chewy/chewy-egift-card/dp/226306'))
    pages.push(await c.post('/chewy/app/cart/add', { id: item.id, size: '16-lb bag', purchase: 'buyonce', qty: '1' }))
    pages.push(await c.get('/chewy/app/cart'))
    pages.push(await c.get('/chewy/app/checkout'))
    pages.push(await c.post('/chewy/app/register', { first_name: 'Wren', last_name: 'Ording', email: 'wording@example.com', password: 'Password123!' }))
    const checkout = await c.get('/chewy/app/checkout')
    pages.push(checkout)
    pages.push(await c.post('/chewy/app/checkout', {}))
    pages.push(await c.get('/chewy/app/account'))
    pages.push(await c.get('/chewy/customer-care'))
    pages.push(await c.get('/chewy/vet-care/locations?zip=33324'))
    pages.push(await c.get('/chewy/mobile-app'))
    pages.push(await c.get('/chewy/app/content/careers'))
    pages.push(await c.get('/chewy/location'))
    const missing = await c.get('/chewy/this-page-does-not-exist-anywhere')
    assert.equal(missing.status, 404)
    pages.push(missing)
    assert.match(checkout.text, /Payment Method/, 'signed-in shopper reaches checkout')
    for (const p of pages) {
      const hit = clean(p.text).match(TELL)
      assert.equal(hit && clean(p.text).slice(Math.max(0, hit.index - 80), hit.index + 80), null, `${p.path} (${p.status})`)
    }
  })
})

test('chewy public site keeps the notice that protects real visitors at checkout', async () => {
  await withApp({ persist: false }, async c => {
    const item = SHELF.find(p => p.id === '52404')
    await c.post('/chewy/app/cart/add', { id: item.id, size: '16-lb bag', purchase: 'buyonce', qty: '1' })
    await c.post('/chewy/app/register', { first_name: 'Pat', last_name: 'Public', email: 'public@example.com', password: 'Password123!' })
    const checkout = await c.get('/chewy/app/checkout')
    assert.match(checkout.text, /not the real Chewy website: no card is charged/)
  })
})
