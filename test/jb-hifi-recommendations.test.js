import test from 'node:test'
import assert from 'node:assert/strict'
import { byId, totals } from '../stores/jb-hifi/data.js'
import { cartPage, layout } from '../stores/jb-hifi/pages.js'
import { recommendationsFor, recommendationCarousel, recommendationBySlug, recommendationPreview } from '../stores/jb-hifi/reference-recommendations.js'

const expected = ['829262', '840499', '896438', '896402']
const skus = html => [...html.matchAll(/data-reference-sku="(\d+)"/g)].map(match => match[1])

test('JB Xbox added/cart recommendations preserve their separate observed product order', () => {
  assert.deepEqual(recommendationsFor('added').map(p => p.id), [...expected, '899532', '903000'])
  assert.deepEqual(recommendationsFor('cart').map(p => p.id), [...expected, '903000', '482005'])
  const cart = cartPage({ base: '/jb-hifi', t: totals({ cart: [{ pid: '903001', qty: 1 }] }) })
  assert.deepEqual(skus(cart), [...expected, '903000', '482005'])
  const drawer = layout({ base: '/jb-hifi', body: '', title: 'test', added: byId('903001'), closeHref: '/jb-hifi/products/xbox-series-x-grand-theft-auto-vi' })
  assert.deepEqual(skus(drawer), [...expected, '899532', '903000'])
  assert.match(drawer, /Logitech G Astro A20X PLAYSYNC Wireless Headset \(White\)/)
  assert.match(drawer, /<s>\$1699<\/s>/)
  assert.match(drawer, /\$400 <small>OFF\^/)
  // A captured Xbox selection must not silently become a claimed PS5 capture.
  const ps5 = cartPage({ base: '/jb-hifi', t: totals({ cart: [{ pid: '903000', qty: 1 }] }) })
  assert.deepEqual(skus(ps5), [])
})

test('JB recommendation cards keep verified GTA purchase behavior without inventing ancillary stock', () => {
  const html = recommendationCarousel('/jb-hifi', 'cart', '/jb-hifi/cart')
  assert.equal([...html.matchAll(/<form method="post" action="\/jb-hifi\/cart\/add"/g)].length, 1)
  assert.match(html, /name="id" value="903000"/)
  assert.equal([...html.matchAll(/disabled aria-label="[^"]+currently unavailable online/g)].length, 5)
  assert.match(html, /href="\/jb-hifi\/products\/xbox-rechargeable-battery-usb-c-cable"/)
  const p = recommendationBySlug('xbox-rechargeable-battery-usb-c-cable')
  const preview = recommendationPreview('/jb-hifi', p)
  assert.match(preview, /Xbox Rechargeable Battery \+ USB-C Cable/)
  assert.match(preview, /not currently available to buy online/)
  assert.doesNotMatch(preview, /captured|not been verified/)
  assert.doesNotMatch(preview, /<form|In stock|Out of stock/)
  assert.equal(recommendationBySlug('playstation-5-grand-theft-auto-vi'), null)
})
