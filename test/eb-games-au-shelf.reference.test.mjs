// EB Games Australia shop assortment in reference mode: the store looks stocked like the real
// site, while GTA VI keeps its evidence-backed listings, deposit rules and purchase guards.
import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer, fieldValue } from './helpers.js'
import { SHELF } from '../stores/eb-games-au/shelf.js'
import { browseProducts } from '../stores/eb-games-au/browse.js'
import { inventory } from '../stores/eb-games-au/inventory.js'

const B = '/eb-games-au'
const enabled = (process.env.CATALOG_MODE || 'reference') === 'reference'
const INFO = { method: 'ship', first_name: 'Alex', last_name: 'Tester', phone: '0412345678', address: '1 George St', suburb: 'Sydney', state: 'NSW', postcode: '2000', shipping_method: 'standard' }
const CARD = { payment_method: 'card', card_number: '4242424242424242', card_expiry: '12/39', card_cvv: '123', card_name: 'Alex Tester', accept_deposit: 'yes' }
const tileIds = html => [...html.matchAll(/class="browse-tile" data-product-id="(\d+)"/g)].map(m => m[1])

test('assortment stays separate from the evidence-backed GTA VI inventory', { skip: !enabled }, () => {
  assert.ok(SHELF.length >= 150 && SHELF.length <= 400, `${SHELF.length} assortment items`)
  assert.equal(browseProducts.length, 0)
  assert.deepEqual(inventory.map(p => p.id).sort(), ['330056', '330060'])
  assert.ok(SHELF.every(p => !/grand theft auto vi\b|gta ?(6|vi)\b/i.test(p.title)), 'no assortment item claims to be GTA VI')
  assert.equal(new Set(SHELF.map(p => p.sku)).size, SHELF.length)
})

test('homepage, departments and search show the assortment; GTA VI still leads its searches', { skip: !enabled }, async () => {
  const s = await startServer()
  try {
    const c = s.client()
    const home = await c.get(B)
    const byId = new Map(SHELF.map(p => [p.sku, p]))
    const ids = tileIds(home.text), departments = new Set(ids.map(id => byId.get(id)?.category).filter(Boolean))
    assert.ok(departments.size >= 4, `homepage departments: ${[...departments]}`)
    assert.ok(ids.includes('330056') && ids.includes('330060'), 'GTA VI preorders sit in the Preorder Now row')
    assert.ok(ids.filter(id => byId.has(id)).length >= 20)

    const games = await c.get(`${B}/search?category=gaming&subcategory=gaming-video-game&attributes=platform%3Aplaystation-5`)
    assert.match(games.text, /\d{2,} products/)
    assert.ok(tileIds(games.text).every(id => !byId.has(id) || byId.get(id).platform === 'PlayStation 5'))

    const pop = await c.get(`${B}/search?q=pop+vinyl&sort=price-asc`)
    const popIds = tileIds(pop.text)
    assert.ok(popIds.length >= 10 && popIds.every(id => byId.get(id)?.brand === 'Funko'))

    for (const q of ['gta 6', 'grand theft auto', 'gta vi']) {
      const r = await c.get(`${B}/search?q=${encodeURIComponent(q)}`)
      assert.deepEqual(tileIds(r.text).slice(0, 2).sort(), ['330056', '330060'], q)
    }
    const p = SHELF.find(x => x.sku === '340201')
    const page = await c.get(B + p.path)
    assert.equal(page.status, 200)
    assert.match(page.text, /DualSense Wireless Controller - Midnight Black/)
    assert.match(page.text, /data-product-gallery/)
    assert.equal((await c.get(`${B}/shelf-art/340201/0.svg`)).headers.get('content-type'), 'image/svg+xml; charset=utf-8')
  } finally { await s.close() }
})

test('assortment items are bought in full as kind other; GTA VI purchase guards are unchanged', { skip: !enabled }, async () => {
  const s = await startServer()
  try {
    const c = s.client()
    assert.equal((await c.post(`${B}/cart/add`, { sku: '343410', qty: '2' })).status, 200)
    await c.get(`${B}/checkout`)
    await c.post(`${B}/checkout/guest`, { guest_email: 'shelf@example.com' })
    const review = await c.post(`${B}/checkout/delivery`, INFO)
    assert.equal(review.status, 200)
    const done = await c.post(`${B}/checkout/payment`, { ...CARD, review_token: fieldValue(review.text, 'review_token') })
    assert.equal(done.status, 200)
    assert.match(done.text, /Thank you for your order/)
    const [order] = await c.json('/api/orders?store=eb-games-au')
    assert.deepEqual(order.items, [{ kind: 'other', qty: 2, unit_price: 79, title: 'Pokemon - Charizard Super Sized 10" Pop! Vinyl Figure', sku: '343410' }])
    assert.equal(order.meta.deposit_paid, 0)
    assert.equal(order.meta.balance_due, 0)
    // Store pickup for GTA VI stays unverified in reference mode.
    const g = s.client()
    await g.post(`${B}/cart/add`, { sku: '330056', qty: '1' })
    await g.post(`${B}/checkout/guest`, { guest_email: 'gta@example.com' })
    const pickup = await g.post(`${B}/checkout/delivery`, { ...INFO, method: 'pickup', store_id: 'sydney' })
    assert.equal(pickup.status, 400)
  } finally { await s.close() }
})
