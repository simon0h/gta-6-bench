import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer } from './helpers.js'
import { unavailableStore } from '../lib/unavailable-store.js'
import { storeState } from '../lib/session.js'
import { saveAddress } from '../lib/retail-state.js'

test('negative-store bag product links reopen the selected configuration', async () => {
  const server = await startServer()
  try {
    const selections = [
      ['ikea', 'desk', { Color: 'Oak effect' }, /name="option_Color"[\s\S]*?value="Oak effect" selected/],
      ['nike', 'running-shoes', { Size: 'US 10' }, /name="option_Size" value="US 10"[^>]*checked/],
      ['sephora', 'lip-color', { Shade: 'Berry' }, /name="option_Shade" value="Berry"/],
      ['chewy', 'cat-bed', { Size: 'Large' }, /name="option_Size" value="Large"/],
      ['williams-sonoma', 'skillet', { Finish: 'Brushed steel' }, /name="option_Finish" value="Brushed steel"/],
    ]
    for (const [slug, id, options, selectedMarkup] of selections) {
      const client = server.client()
      const bag = await client.post(`/${slug}/cart/add`, { id, qty: 1, ...Object.fromEntries(Object.entries(options).map(([label, value]) => [`option_${label}`, value])) })
      assert.equal(bag.status, 200, slug)
      const href = bag.text.match(/<article class="cart-item"><a href="([^"]+)"/)[1].replaceAll('&amp;', '&')
      const product = await client.get(href)
      assert.equal(product.status, 200, slug)
      assert.match(product.text, selectedMarkup, `${slug} bag link must retain the selected option`)
    }
  } finally { await server.close() }
})

test('negative-store carts reject unexpected and structured options without changing existing selections', async () => {
  const server = await startServer()
  try {
    for (const [slug, id, label, value] of [
      ['ikea', 'desk', 'Color', 'White'],
      ['nike', 'running-shoes', 'Size', 'US 10'],
      ['sephora', 'lip-color', 'Shade', 'Berry'],
      ['chewy', 'cat-bed', 'Size', 'Large'],
      ['williams-sonoma', 'skillet', 'Finish', 'Brushed steel'],
    ]) {
      const client = server.client(), base = `/${slug}`
      const selection = [['id', id], ['qty', '1'], [`option_${label}`, value]]
      assert.equal((await client.post(`${base}/cart/add`, new URLSearchParams(selection))).status, 200)
      for (const extra of [
        [['option_Forged', 'Other']],
        [['option_Forged[]', 'Other']],
        [[`option_${label}`, value]],
        [[`option_${label}[nested]`, value]],
      ]) {
        const result = await client.post(`${base}/cart/add`, new URLSearchParams([...selection, ...extra]))
        assert.equal(result.status, 400, `${slug}: ${extra[0][0]}`)
      }
      const cart = await client.get(`${base}/cart`)
      assert.equal((cart.text.match(/<article class="cart-item">/g) || []).length, 1, slug)
      assert.match(cart.text, /name="qty"[^>]*value="1"/, slug)
      assert.match(cart.text, new RegExp(`${label}: ${value}`), slug)
    }
  } finally { await server.close() }
})

test('negative-store cart rejects structured quantities and ambiguous update actions without changing the bag', async () => {
  const server = await startServer()
  try {
    const client = server.client(), base = '/ikea'
    for (const fields of [
      [['id', 'lamp'], ['qty[]', '2']],
      [['id', 'lamp'], ['qty', '0x2']],
      [['id', 'lamp'], ['qty', '1'], ['qty', '1']],
    ]) assert.equal((await client.post(`${base}/cart/add`, new URLSearchParams(fields))).status, 400)
    assert.match((await client.get(`${base}/cart`)).text, /is empty/)
    await client.post(`${base}/cart/add`, { id: 'lamp', qty: 1 })
    for (const fields of [
      [['id', 'lamp'], ['qty[]', '2']],
      [['id', 'lamp'], ['qty', '2'], ['action', 'update'], ['action', 'remove']],
      [['id', 'lamp'], ['qty', '2'], ['action', 'unknown']],
    ]) assert.equal((await client.post(`${base}/cart/update`, new URLSearchParams(fields))).status, 400)
    const cart = await client.get(`${base}/cart`)
    assert.match(cart.text, /name="qty"[^>]*value="1"/)
    assert.equal((await client.get(`${base}/checkout?address_id[]=anything`)).status, 400)
  } finally { await server.close() }
})

test('store-owned layout and route extensions retain canonical stock and variant boundaries', async () => {
  const server = await startServer()
  try {
    let fixtureProducts
    const fixture = unavailableStore({
      slug: 'depth-stock-fixture', name: 'Local Fixture', categories: ['Home'], nav: ['Home'], cartLabel: 'Bag', orderPrefix: 'TEST',
      products: [
        { id: 'lamp', title: 'Reading lamp', category: 'Home', price: 20, stock: 2, options: { Color: ['White', 'Black'] }, photo: 'lamp', variants: [
          { id: 'white', options: { Color: 'White' }, stock: 2, photo: null, color: '#ffffff', art: 'M20 20h60v60H20Z' },
          { id: 'black', options: { Color: 'Black' }, stock: 2, photo: null, color: '#222222', art: 'M20 20h60v60H20Z' },
        ] },
        { id: 'chair', title: 'Armchair', category: 'Home', price: 100, stock: 0, options: {}, photo: 'armchair' },
        { id: 'mug', title: 'Ceramic mug', category: 'Home', price: 10, available: false, options: {}, photo: 'mug' },
        { id: 'food', title: 'Pet food', category: 'Home', price: 10, stock: 5, options: { Size: ['Small', 'Large'], Flavor: ['Chicken', 'Fish'] }, photo: 'dog-food', variants: [
          { id: 'small-chicken', options: { Size: 'Small', Flavor: 'Chicken' }, price: 10, stock: 1 },
          { id: 'large-chicken', options: { Size: 'Large', Flavor: 'Chicken' }, price: 20, stock: 2 },
        ] },
      ],
      chrome: ({ body, count }) => `<!doctype html><html lang="en"><title>Fixture layout</title><body><header>Saved bag count ${count}</header>${body}</body></html>`,
      extend(router, { render, products, artwork }) {
        fixtureProducts = products
        router.get('/department', (req, res) => render(req, res, 'Home', `<h1>Home department</h1>${artwork(products[0])}`))
        router.post('/test-address', (req, res) => {
          req.store.user = { id: 'fixture-member', email: 'fixture@example.com', first_name: 'Alex', last_name: 'Shopper' }
          res.json(saveAddress(req, { label: 'Home', name: 'Alex Shopper', line1: '25 Oak St', line2: 'Unit 2', city: 'Seattle', state: 'WA', postal_code: '98101', is_default: 'yes' }, { country: 'US' }))
        })
      },
    })
    const base = '/depth-stock-fixture'
    server.app.use(base, (req, res, next) => {
      req.storeSlug = fixture.slug
      req.store = storeState(req.session, fixture.slug)
      res.locals.base = base
      next()
    }, fixture.router)
    const client = server.client()
    let response = await client.get(`${base}/department`)
    assert.equal(response.status, 200)
    assert.match(response.text, /Fixture layout/)
    assert.match(response.text, /\/product-assets\/depth-stock-fixture\/lamp\/0\.svg/)
    response = await client.get(`${base}/product/chair`)
    assert.match(response.text, /Currently out of stock/)
    assert.match(response.text, /disabled>Out of stock/)
    for (const id of ['chair', 'mug', 'forged-gta']) assert.equal((await client.post(`${base}/cart/add`, { id, qty: 1, price: '0', stock: '99' })).status, 400)
    assert.equal((await client.post(`${base}/cart/add`, { id: 'lamp', qty: 1, option_Color: 'White' })).status, 200)
    assert.equal((await client.post(`${base}/cart/add`, { id: 'lamp', qty: 1, option_Color: 'Black' })).status, 200)
    assert.equal((await client.post(`${base}/cart/update`, { id: 'lamp', action: 'remove' })).status, 400)
    assert.equal((await client.post(`${base}/cart/add`, { id: 'lamp', qty: 1, option_Color: 'White' })).status, 400)
    assert.equal((await client.post(`${base}/cart/update`, { id: 'lamp', key: 'lamp:White', qty: 2, action: 'update' })).status, 400)
    response = await client.get(`${base}/cart`)
    assert.match(response.text, /Saved bag count 2/)
    assert.match(response.text, /Color: White/)
    assert.match(response.text, /Color: Black/)
    assert.match(response.text, /\/product-assets\/depth-stock-fixture\/lamp\/0\.svg\?variant=white/)
    assert.match(response.text, /\/product-assets\/depth-stock-fixture\/lamp\/0\.svg\?variant=black/)
    assert.doesNotMatch(response.text, /products-home\.png/)
    assert.match(response.text, /\$40\.00/)
    assert.equal((await server.client().get(`${base}/cart`)).text.includes('Saved bag count 0'), true)
    fixtureProducts[0].stock = 1
    response = await client.post(`${base}/checkout`, {})
    assert.equal(response.status, 400)
    assert.match(response.text, /exceeds the available stock/)
    fixtureProducts[0].stock = 2
    const saved = JSON.parse((await client.post(`${base}/test-address`)).text).address
    response = await client.get(`${base}/checkout`)
    assert.match(response.text, /Use a saved address/)
    assert.match(response.text, /value="25 Oak St, Unit 2"/)
    assert.match(response.text, /value="98101"/)
    const foreign = JSON.parse((await server.client().post(`${base}/test-address`)).text).address
    assert.equal((await client.get(`${base}/checkout?address_id=${foreign.id}`)).status, 400)
    assert.equal((await client.get(`${base}/checkout?address_id=${saved.id}`)).status, 200)
    const variantClient = server.client()
    assert.equal((await variantClient.post(`${base}/cart/add`, { id: 'food', qty: 1, option_Size: 'Small', option_Flavor: 'Fish' })).status, 400)
    assert.equal((await variantClient.post(`${base}/cart/add`, { id: 'food', qty: 1, option_Size: 'Small', option_Flavor: 'Chicken', price: 0 })).status, 200)
    assert.equal((await variantClient.post(`${base}/cart/add`, { id: 'food', qty: 1, option_Size: 'Small', option_Flavor: 'Chicken' })).status, 400)
    response = await variantClient.post(`${base}/cart/add`, { id: 'food', qty: 2, option_Size: 'Large', option_Flavor: 'Chicken', price: 0 })
    assert.equal(response.status, 200)
    assert.match(response.text, /\$50\.00/)
    assert.equal((await variantClient.post(`${base}/cart/update`, { id: 'food', key: 'food:Large|Chicken', qty: 3 })).status, 400)
    response = await variantClient.post(`${base}/checkout`, {
      email: 'fixture@example.com', first_name: 'Alex', last_name: 'Shopper', address: '1 Main St', city: 'Seattle', state: 'WA', postal_code: '98101',
      card_name: 'Alex Shopper', card_number: '4242424242424242', card_expiry: '12/30', card_cvv: '123', price: '0', total: '0', kind: 'game',
    })
    assert.equal(response.status, 200)
    const variantOrders = await variantClient.json('/api/orders?store=depth-stock-fixture')
    const variantOrder = variantOrders.at(-1)
    assert.equal(variantOrder.totals.total, 50)
    assert.deepEqual(variantOrder.items.map(item => [item.kind, item.qty, item.unit_price]), [['other', 1, 10], ['other', 2, 20]])
  } finally { await server.close() }
})

test('negative-store confirmation remains private after switching accounts in the same browser', async () => {
  const server = await startServer()
  try {
    const client = server.client()
    await client.post('/ikea/account', { email: 'tester@example.com', password: 'Password123!' })
    await client.post('/ikea/cart/add', { id: 'lamp', qty: 1 })
    const placed = await client.post('/ikea/checkout', {
      email: 'tester@example.com', first_name: 'Alex', last_name: 'Tester', address: '1 Main St', city: 'Seattle', state: 'WA', postal_code: '98101',
      card_name: 'Alex Tester', card_number: '4242424242424242', card_expiry: '12/30', card_cvv: '123',
    })
    assert.equal(placed.status, 200)
    assert.match(placed.url, /\/ikea\/order\//)
    const confirmation = new URL(placed.url).pathname
    await client.post('/ikea/logout')
    assert.equal((await client.get(confirmation)).status, 404)
    await client.post('/ikea/account', { mode: 'register', email: 'other-depth@example.com', password: 'Different123!', first_name: 'Other', last_name: 'Shopper' })
    assert.equal((await client.get(confirmation)).status, 404)
    await client.post('/ikea/logout')
    await client.post('/ikea/account', { email: 'tester@example.com', password: 'Password123!' })
    assert.equal((await client.get(confirmation)).status, 200)
    assert.equal((await server.client().get(confirmation)).status, 404)
  } finally { await server.close() }
})

test('negative-store browser checkout rejects changed quantities, trusted prices, owners and replayed reviews', async () => {
  const server = await startServer()
  try {
    const products = [{ id: 'lamp', title: 'Reading lamp', category: 'Home', price: 20, stock: 5, options: {}, photo: 'lamp' }]
    const store = unavailableStore({ slug: 'review-fixture', name: 'Review fixture', categories: ['Home'], nav: ['Home'], cartLabel: 'Bag', orderPrefix: 'REVIEW', products })
    const base = '/review-fixture'
    server.app.use(base, (req, res, next) => {
      req.storeSlug = store.slug
      req.store = storeState(req.session, store.slug)
      res.locals.base = base
      next()
    }, store.router)
    const client = server.client()
    const buyer = { email: 'review@example.com', first_name: 'Alex', last_name: 'Shopper', address: '1 Main St', city: 'Seattle', state: 'WA', postal_code: '98101', card_name: 'Alex Shopper', card_number: '4242424242424242', card_expiry: '12/39', card_cvv: '123' }
    const token = page => page.text.match(/name="checkout_token" value="([a-f0-9]+)"/)[1]
    await client.post(`${base}/cart/add`, { id: 'lamp', qty: 1 })
    let review = await client.get(`${base}/checkout`)
    const oldToken = token(review)
    await client.post(`${base}/cart/update`, { id: 'lamp', qty: 2 })
    let result = await client.post(`${base}/checkout`, { ...buyer, checkout_token: oldToken })
    assert.equal(result.status, 409)
    assert.match(result.text, /Review the updated items and total/)
    assert.match(result.text, /value="1 Main St"/)
    assert.doesNotMatch(result.text, /4242424242424242|value="123"/)
    assert.deepEqual(await client.json('/api/orders?store=review-fixture'), [])
    assert.notEqual(token(result), oldToken)
    assert.equal((await client.post(`${base}/checkout`, { ...buyer, checkout_token: oldToken })).status, 409, 'a refreshed tab must not make the old tab valid')
    review = await client.get(`${base}/checkout`)
    products[0].price = 25
    result = await client.post(`${base}/checkout`, { ...buyer, checkout_token: token(review) })
    assert.equal(result.status, 409)
    assert.match(result.text, /\$50\.00/)
    review = await client.get(`${base}/checkout`)
    await client.post(`${base}/account`, { mode: 'register', email: 'review-member@example.com', password: 'Different123!', first_name: 'Member', last_name: 'Shopper' })
    result = await client.post(`${base}/checkout`, { ...buyer, checkout_token: token(review) })
    assert.equal(result.status, 409)
    const freshToken = token(result)
    result = await client.post(`${base}/checkout`, { ...buyer, checkout_token: freshToken })
    assert.equal(result.status, 200)
    assert.match(result.url, /\/order\//)
    let orders = await client.json('/api/orders?store=review-fixture')
    assert.equal(orders.length, 1)
    assert.equal(orders[0].totals.total, 50)
    await client.post(`${base}/cart/add`, { id: 'lamp', qty: 1 })
    assert.equal((await client.post(`${base}/checkout`, { ...buyer, checkout_token: freshToken })).status, 409)
    orders = await client.json('/api/orders?store=review-fixture')
    assert.equal(orders.length, 1)
    await client.post(`${base}/cart/update`, { id: 'lamp', qty: 2 })
    assert.equal((await client.post(`${base}/checkout`, buyer)).status, 409, 'tokenless compatibility cannot bypass a changed rendered review')
  } finally { await server.close() }
})
