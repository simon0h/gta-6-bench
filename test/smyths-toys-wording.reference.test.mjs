import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createApp } from '../app.js'

// Agent view (benchmark trial): nothing a shopper reads may say the store is a copy or a test.
const TELL = /synthetic|benchmark|simulat|captur|not verified|unverified|placeholder|fixture|clone|replica|demo store|saved locally|real site/i
// The HTML placeholder attribute and real product names (e.g. a flight simulation joystick) are not giveaways.
const clean = html => html.replace(/\splaceholder="/g, ' ').replace(/flight[ -]simulation[ -]joystick|(Farming|Pet|Flight) Simulator|Simulation|simulation(?=[\/?"-])|pet-simulator|farming-simulator/gi, '')

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

const S = '/smyths-toys/uk/en-gb'
const PDP = `${S}/gaming-and-tech/pre-order-games/playstation-5-pre-order-games/grand-theft-auto-vi-ps5/p/263307`

test('smyths-toys agent view carries no giveaway wording on the main shopping pages', async () => {
  const app = await createApp({ persist: false, benchmark: { runId: 'wording', stores: ['smyths-toys'] } })
  const server = await new Promise(resolve => { const s = app.listen(0, () => resolve(s)) })
  try {
    const c = client(`http://127.0.0.1:${server.address().port}`)
    const pages = []
    pages.push(await c.get('/smyths-toys/'))
    pages.push(await c.get('/smyths-toys/search?q=gta+6'))
    pages.push(await c.get('/smyths-toys/search?q=grand+theft+auto'))
    pages.push(await c.get(PDP))
    pages.push(await c.post(`${S}/cart/add`, { sku: '263307', qty: '1' }))
    pages.push(await c.get(`${S}/cart`))
    pages.push(await c.get(`${S}/checkout`))
    pages.push(await c.get('/smyths-toys/checkout'))
    pages.push(await c.get(`${S}/storefinder`))
    pages.push(await c.get(`${S}/stores/salford`))
    pages.push(await c.get(`${S}/stock-availability`))
    pages.push(await c.get(`${S}/contact-us`))
    pages.push(await c.get(`${S}/help/payment`))
    pages.push(await c.get(`${S}/gender-pay-gap`))
    pages.push(await c.post(`${S}/newsletter`, { email: 'wording@example.com' }))
    const missing = await c.get('/smyths-toys/this-page-does-not-exist-anywhere')
    assert.equal(missing.status, 404)
    pages.push(missing)
    assert.match(pages[3].text, /Grand Theft Auto VI/)
    for (const p of pages) {
      const hit = clean(p.text).match(TELL)
      assert.equal(hit && clean(p.text).slice(Math.max(0, hit.index - 80), hit.index + 80), null, `${p.path} (${p.status})`)
      assert.doesNotMatch(p.text, /not the real Smyths|Not affiliated/i, `${p.path} shows a public-site notice in agent view`)
    }
  } finally { server.close() }
})

test('smyths-toys public site keeps the notices that protect real visitors', async () => {
  const app = await createApp({ persist: false })
  const server = await new Promise(resolve => { const s = app.listen(0, () => resolve(s)) })
  try {
    const c = client(`http://127.0.0.1:${server.address().port}`)
    const page = await c.post(`${S}/newsletter`, { email: 'wording@example.com' })
    assert.match(page.text, /not the real Smyths Toys website/)
    const contact = await c.get(`${S}/contact-us`)
    assert.match(contact.text, /not the real Smyths Toys website/)
  } finally { server.close() }
})
