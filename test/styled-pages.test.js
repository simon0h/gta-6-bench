import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer } from './helpers.js'

// Every HTML page a store sends must carry the store's stylesheet; otherwise the
// browser shows a bare white page in its default serif font.
const styled = html => /<link rel="stylesheet" href="\/[a-z0-9-]+\/static\/[^"]+\.css">/.test(html)

test('every store answers a missing page, an empty form post and a broken request with a styled page', async () => {
  const srv = await startServer()
  try {
    for (const { slug } of srv.app.locals.stores) {
      const missing = await fetch(`${srv.base}/${slug}/this-page-does-not-exist/at-all`)
      assert.equal(missing.status, 404, `${slug} missing page`)
      assert.ok(styled(await missing.text()), `${slug} missing page must use the store stylesheet`)

      const broken = await fetch(`${srv.base}/${slug}/cart`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{oops' })
      assert.equal(broken.status, 400, `${slug} malformed request`)
      const page = await broken.text()
      assert.ok(styled(page), `${slug} error page must use the store stylesheet`)
      assert.doesNotMatch(page, /<pre>|SyntaxError|benchmark|synthetic/i)
    }
    // Forms posted without any fields used to crash these routes into Express's bare error page.
    for (const path of ['/walmart/account/login', '/rockstar-store/signin', '/gamestop/newsletter', '/smyths-toys/uk/en-gb/contact-us', '/amazon/ax/claim', '/eb-games-au/account/login']) {
      const res = await fetch(srv.base + path, { method: 'POST' })
      assert.ok(res.status < 500, `${path} answered ${res.status}`)
      assert.ok(styled(await res.text()), `${path} must render a styled page`)
    }
  } finally { await srv.close() }
})
