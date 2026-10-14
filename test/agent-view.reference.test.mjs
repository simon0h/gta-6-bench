import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createApp } from '../app.js'

async function home(app, slug) {
  const server = await new Promise(resolve => { const s = app.listen(0, () => resolve(s)) })
  try {
    const res = await fetch(`http://127.0.0.1:${server.address().port}/${slug}/`)
    return await res.text()
  } finally { server.close() }
}

test('benchmark trials hide the public-site notice; the public site keeps it', async () => {
  const trial = await createApp({ persist: false, benchmark: { runId: 'agent-view', stores: ['bestbuy'] } })
  assert.doesNotMatch(await home(trial, 'bestbuy'), /Synthetic benchmark environment|Not affiliated/)
  const pub = await createApp({ persist: false })
  assert.match(await home(pub, 'bestbuy'), /Synthetic benchmark environment/)
})
