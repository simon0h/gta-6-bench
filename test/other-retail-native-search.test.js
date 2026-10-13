import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer } from './helpers.js'

const searches = [
  { store: 'ikea', path: '/us/en/search/', key: 'q', product: 'lamp' },
  { store: 'nike', path: '/w', key: 'q', product: 'running' },
  { store: 'sephora', path: '/search', key: 'keyword', product: 'lip oil' },
  { store: 'chewy', path: '/s', key: 'query', product: 'dog food' },
  { store: 'williams-sonoma', path: '/search/results.html', key: 'words', product: 'coffee' },
]

test('official-format retail searches preserve terms and the unavailable GTA result', async () => {
  const server = await startServer()
  try {
    const client = server.client()
    for (const { store, path, key, product } of searches) {
      for (const query of ['gta 6', 'Grand Theft Auto VI']) {
        const page = await client.get(`/${store}${path}?${key}=${encodeURIComponent(query)}`)
        assert.equal(page.status, 200, store)
        if (store === 'nike' && query === 'gta 6') {
          assert.match(page.text, /gta 6 \(32\)/)
          assert.equal((page.text.match(/data-product-kind="other"/g) || []).length, 32)
          assert.match(page.text, /Nike Infinity Tour 2 GORE-TEX/)
        } else if (store === 'williams-sonoma' && query === 'gta 6') {
          assert.match(page.text, /198 search results for/)
          assert.equal((page.text.match(/data-product-kind="other"/g) || []).length, 198)
          assert.match(page.text, /Breville Barista Express/)
        } else if (store === 'sephora' && query === 'gta 6') {
          assert.match(page.text, /100 Results/)
          assert.equal((page.text.match(/data-product-kind="other"/g) || []).length, 100)
          assert.match(page.text, /Dermalogica/)
        } else if (store === 'ikea') {
          assert.match(page.text, /There are no results for/)
          assert.match(page.text, /We found 0 products and 0 content results/)
        } else {
          assert.match(page.text, /0 results/, `${store} must apply its native query parameter`)
          assert.match(page.text, /No results found/, store)
        }
        assert.ok(page.text.includes(`value="${query}"`), `${store} keeps the submitted term in search`)
      }
      const ordinary = await client.get(`/${store}${path}?${key}=${encodeURIComponent(product)}`)
      assert.equal(ordinary.status, 200, store)
      assert.doesNotMatch(ordinary.text, /<h2>No results found<\/h2>/, store)
      assert.ok(ordinary.text.includes(`action="/${store}${path}"`), `${store} header submits to the official path`)
      const xss = await client.get(`/${store}${path}?${key}=${encodeURIComponent('<script>alert(1)</script>')}`)
      assert.doesNotMatch(xss.text, /<script>alert\(1\)<\/script>/, store)
      assert.match(xss.text, /&lt;script&gt;/, store)
      const repeated = await client.get(`/${store}${path}?${key}=gta&${key}=6`)
      assert.equal(repeated.status, 400, `${store} does not turn repeated terms into an unfiltered catalog`)
    }
    assert.deepEqual(await client.json('/api/orders'), [])
  } finally { await server.close() }
})

test('Korean marketplace native search and item links reach the existing trusted listings', async () => {
  const server = await startServer()
  try {
    const client = server.client()
    const gmarket = await client.get('/gmarket/n/search?keyword=ps5gta6')
    assert.equal(gmarket.status, 200)
    assert.match(gmarket.text, /data-sku="4796016651"/)
    assert.doesNotMatch(gmarket.text, /data-sku="4796017670"/)
    assert.match(gmarket.text, /value="ps5gta6"/)
    assert.match(gmarket.text, /action="\/gmarket\/n\/search"/)
    for (const key of ['goodscode', 'goodsCode']) {
      const item = await client.get(`/gmarket/Item?${key}=4796016651`)
      assert.equal(item.status, 200)
      assert.match(item.text, /89,800원/)
      assert.match(item.text, /name="sku" value="4796016651"/)
    }
    assert.equal((await client.get('/gmarket/Item?goodscode=unknown')).status, 404)
    assert.equal((await client.get('/gmarket/n/search?keyword=gta&keyword=6')).status, 400)
    const coupang = await client.get('/coupang/np/search?q=gta+6')
    assert.equal(coupang.status, 200)
    assert.match(coupang.text, /\/coupang\/vp\/products\/gta6-ps5/)
    assert.match(coupang.text, /action="\/coupang\/np\/search"/)
  } finally { await server.close() }
})
