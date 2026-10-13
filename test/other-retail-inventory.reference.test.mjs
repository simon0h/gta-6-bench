import test from 'node:test'
import assert from 'node:assert/strict'

const slugs = ['coupang', 'gmarket', 'ikea', 'nike', 'sephora', 'chewy', 'williams-sonoma']
const stores = Object.fromEntries(await Promise.all(slugs.map(async slug => [slug, (await import(`../stores/${slug}/index.js`)).default])))
const baseCatalogs = Object.fromEntries(await Promise.all(slugs.map(async slug => [slug, (await import(`../stores/${slug}/${slug === 'coupang' ? 'catalog-data' : slug === 'gmarket' ? 'data' : 'catalog'}.js`)).products])))

// Unit-dispatch the router without creating an HTTP server or binding a port.
function dispatch(slug, path, { method = 'GET', body = {}, state = {} } = {}) {
  const url = new URL(path, 'https://reference.local'), query = {}
  for (const [key, value] of url.searchParams) query[key] = query[key] === undefined ? value : [].concat(query[key], value)
  const req = { method, url: path, originalUrl: path, path: url.pathname, query, params: {}, body, headers: {},
    store: { cart: [], checkout: {}, ...state }, storeSlug: slug, session: { id: 'reference-unit-test' } }
  return new Promise((resolve, reject) => {
    const res = { locals: { base: `/${slug}` }, statusCode: 200,
      status(value) { this.statusCode = value; return this }, type() { return this },
      send(text) { resolve({ status: this.statusCode, text, req }) },
      redirect(path) { resolve({ status: 302, path, text: '', req }) },
    }
    stores[slug].router.handle(req, res, error => error ? reject(error) : reject(new Error('No reference handler')))
  })
}

test('other-retail reference catalog preserves provenance without inferred inventory', () => {
  const counts = { coupang: 0, gmarket: 2, ikea: 0, nike: 74, sephora: 100, chewy: 0, 'williams-sonoma': 192 }
  for (const slug of slugs) {
    assert.equal(baseCatalogs[slug].length, 0, `${slug} excludes all authored legacy inventory`)
    const observations = stores[slug].catalog_observations
    assert.equal(observations.length, counts[slug], slug)
    assert.equal(new Set(observations.map(p => p.path)).size, observations.length, slug)
    for (const p of observations) {
      assert.match(p.source_url, /^https:\/\//)
      assert.equal(p.captured_at, '2026-10-06')
      assert.ok(p.evidence_path && p.facts.length)
      assert.equal(p.purchase, 'unverified')
      assert.equal(p.availability, 'unknown')
      assert.equal(p.stock, undefined)
      assert.equal(p.variants, undefined)
    }
  }
  for (const slug of ['coupang', 'chewy']) {
    assert.equal(stores[slug].gta6_available, null)
    assert.equal(stores[slug].availability_status, 'unknown')
  }
  assert.equal(stores.gmarket.gta6_available, null)
  assert.equal(stores.gmarket.availability_status, 'listing_only')
  for (const p of stores.gmarket.catalog_observations) {
    assert.equal(p.edition, undefined)
    assert.equal(p.format, undefined)
  }
  assert.equal(stores.nike.catalog_observations.filter(p => p.price === null).length, 42)
})

test('reference retail routes keep captured search and detail states, not artificial zero results', async () => {
  for (const slug of slugs) {
    const home = await dispatch(slug, '/')
    assert.equal(home.status, 200, slug)
    assert.match(home.text, /data-reference-state="catalog"/)
    assert.doesNotMatch(home.text, /data-reference-product="(?:desk|running-shoes|gm-milk|gta6-ps5)"/)
  }
  const searches = [
    ['nike', '/w?q=gta%206', 32], ['sephora', '/search?keyword=gta%206', 100],
    ['williams-sonoma', '/search/results.html?words=gta%206', 198],
  ]
  for (const [slug, path, count] of searches) {
    const result = await dispatch(slug, path)
    assert.equal(result.status, 200, slug)
    assert.equal((result.text.match(/data-product-kind="other"/g) || []).length, count)
    for (const product of stores[slug].catalog_observations) {
      const detail = await dispatch(slug, product.path)
      assert.equal(detail.status, 200, `${slug} ${product.path}`)
      assert.doesNotMatch(detail.text, /action="[^\"]*\/(?:cart|checkout)/)
    }
  }
  // Williams Sonoma searches its kitchen assortment (shelf.js) for terms other than the captured "gta 6".
  const wsCoffee = await dispatch('williams-sonoma', '/search/results.html?words=coffee')
  assert.equal(wsCoffee.status, 200)
  assert.match(wsCoffee.text, /data-product-kind="other"/)
  assert.doesNotMatch(wsCoffee.text, /data-reference-state="uncaptured"/)
  const ikea = await dispatch('ikea', '/us/en/search/?q=gta%206')
  assert.match(ikea.text, /We found 0 products and 0 content results/)
  for (const [slug, path] of [['nike', '/w?q=GTA6'], ['ikea', '/us/en/search/?q=grand%20theft%20auto'], ['chewy', '/s?query=gta%206'], ['coupang', '/np/search?q=gta%206'], ['sephora', '/search?keyword=Grand+Theft+Auto+VI']]) {
    const result = await dispatch(slug, path)
    assert.equal(result.status, 200)
    assert.match(result.text, /data-reference-state="uncaptured"/)
    assert.doesNotMatch(result.text, /No results found|There are no results|We found 0 products/)
  }
  for (const p of stores.gmarket.catalog_observations) assert.equal((await dispatch('gmarket', p.path)).status, 200)
  const repeated = await dispatch('nike', '/w?q=gta&q=6')
  assert.equal(repeated.status, 400)
  const escaped = await dispatch('chewy', '/s?query=%3Cscript%3E')
  assert.match(escaped.text, /&lt;script&gt;/)
  const forgedVariant = await dispatch('sephora', stores.sephora.catalog_observations[0].path.replace(/skuId=\d+/, 'skuId=unknown'))
  assert.equal(forgedVariant.status, 404)
})

test('source-only retail rejects legacy and captured purchase submissions without changing state', async () => {
  for (const slug of slugs) {
    const cart = [{ sku: 'CP-GTA6-PS5', pid: 'running-shoes', qty: 1 }]
    for (const path of ['/cart/add', '/checkout', '/checkout/order', '/checkout/place', '/cart/update']) {
      const result = await dispatch(slug, path, { method: 'POST', body: { sku: 'CP-GTA6-PS5', pid: 'running-shoes', qty: '1' }, state: { cart } })
      assert.equal(result.status, 409, `${slug} ${path}`)
      assert.match(result.text, /Purchase is not verified/)
      assert.deepEqual(result.req.store.cart, cart)
      assert.deepEqual(result.req.store.checkout, {})
    }
  }
})
