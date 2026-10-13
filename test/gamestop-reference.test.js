import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { capturedRecommendations } from '../stores/gamestop/recommendation-reference.js'
import { productPage } from '../stores/gamestop/catalog-pages.js'
import { PRODUCTS, byId } from '../stores/gamestop/data.js'
import { layout } from '../stores/gamestop/pages.js'
import { startServer } from './helpers.js'
import { contactPage, checkoutShell } from '../stores/gamestop/checkout-reference.js'
import { totals } from '../stores/gamestop/data.js'

test('GameStop reference source preserves captured inline marks and recommendation identities', async () => {
  const manifest = JSON.parse(await readFile(new URL('../public/reference/gamestop/chrome-manifest.json', import.meta.url)))
  for (const asset of manifest.assets) {
    const bytes = await readFile(new URL(`../public/reference/gamestop/${asset.file}`, import.meta.url))
    assert.equal(createHash('sha256').update(bytes).digest('hex'), asset.sha256)
    assert.equal(bytes.length, asset.bytes)
    assert.match(bytes.toString(), /xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)
    assert.ok(asset.source_inline_id)
  }
  assert.equal(capturedRecommendations.length, 15)
  assert.equal(new Set(capturedRecommendations.map(product => product.id)).size, 15)
  assert.equal(capturedRecommendations[0].id, '342264')
  assert.equal(capturedRecommendations[0].price, 18.99)
  assert.equal(capturedRecommendations[0].proPrice, 18.04)
  assert.ok(capturedRecommendations.every(product => product.kind === 'other' && product.sourceUrl.startsWith('https://www.gamestop.com/')))
  for (const product of capturedRecommendations) {
    const image = await readFile(new URL(`../public${product.image.replace(/^\/static/, '')}`, import.meta.url))
    assert.ok(image.length > 100, product.image)
  }
  const css = await readFile(new URL('../stores/gamestop/public/style.css', import.meta.url), 'utf8')
  for (const file of ['open-sans-400.ttf', 'open-sans-600.ttf', 'open-sans-700.ttf', 'poppins-400.ttf', 'poppins-600.ttf', 'poppins-700.ttf', 'poppins-900.ttf']) {
    assert.ok(css.includes(`/static/reference/gamestop/${file}`))
    assert.ok((await readFile(new URL(`../public/reference/gamestop/${file}`, import.meta.url))).length > 1000)
  }
  assert.equal(PRODUCTS.length, 500)
})

test('GameStop source hierarchy puts features under gallery and preserves native cart entry', () => {
  const p = byId('448295'), body = productPage({ base: '/gamestop', p, siblings: PRODUCTS.filter(p => p.kind === 'game'), added: p })
  assert.ok(body.indexOf('gs-game-information') < body.indexOf('<div class="gs-buybox">'))
  assert.match(body, /name="pid" value="448295"/)
  assert.match(body, /name="qty" value="1"/)
  assert.doesNotMatch(body, /<select name="qty"/)
  assert.match(body, /aria-modal="true"/)
  assert.equal((body.match(/data-reference-product=/g) || []).length, 15)
  for (const product of capturedRecommendations) assert.ok(body.includes(`href="/gamestop${product.path}"`))
  const html = layout({ base: '/gamestop', body, title: p.title })
  assert.match(html, /gamestop-logo\.svg/)
  assert.match(html, /Pre-Order The Newest Trading Cards Before They Sell Out\./)
})

test('GameStop captured recommendation links resolve without inventing GTA purchase SKUs', async () => {
  const server = await startServer()
  try {
    const client = server.client()
    for (const product of capturedRecommendations) {
      const detail = await client.get(`/gamestop${product.path}`)
      assert.equal(detail.status, 200, product.title)
      if (!byId(product.id)) {
        assert.match(detail.text, /Back to recommendations/)
        assert.doesNotMatch(detail.text, /action="\/gamestop\/cart\/add"/)
        assert.equal((await client.post('/gamestop/cart/add', { pid: product.id, qty: 1 })).status, 400)
      }
    }
    assert.deepEqual(await client.json('/api/orders?store=gamestop'), [])
  } finally { await server.close() }
})

test('GameStop source contact step keeps shipping and payment closed before identity is saved', () => {
  const t=totals({cart:[{pid:'448295',qty:1}]})
  const body=contactPage({base:'/gamestop',t,reviewToken:'fixture'})
  for(const field of ['email','customerName','c_phone']) assert.ok(body.includes(`name="${field}"`))
  assert.match(body,/action="\/gamestop\/mrt\/checkout\/contact"/)
  assert.match(body,/Confirm &amp; Pay<\/button>/)
  assert.match(body,/gs-native-confirm" disabled/)
  assert.doesNotMatch(body,/name="cardNumber"|name="address1"/)
  const html=checkoutShell({base:'/gamestop',title:'Checkout',body})
  assert.match(html,/gs-checkout-header/)
  assert.doesNotMatch(html,/gs-nav-row|gs-search/)
})

test('GameStop native guest entry validates contact without creating orders and retains trusted continuation',async()=>{
  const server=await startServer()
  try {
    const client=server.client()
    assert.match((await client.get('/gamestop/mrt/checkout')).url,/\/cart\/$/)
    await client.post('/gamestop/cart/add',{pid:'448295',qty:1})
    const entry=await client.post('/gamestop/checkout/start')
    assert.match(entry.url,/\/mrt\/checkout$/)
    const invalid=await client.post('/gamestop/mrt/checkout/contact',{email:'wrong',customerName:'',c_phone:'123'})
    assert.equal(invalid.status,400)
    assert.match(invalid.text,/Enter a valid email address|Enter your full name|10-digit phone/)
    const duplicateFields=new URLSearchParams({email:'first@example.com',customerName:'Test Player',c_phone:'3055550123'})
    duplicateFields.append('email','other@example.com')
    const repeated=await client.post('/gamestop/mrt/checkout/contact',duplicateFields)
    assert.equal(repeated.status,400)
    const contact=await client.post('/gamestop/mrt/checkout/contact',{email:'test@example.com',customerName:'Test Player',c_phone:'3055550123'})
    assert.match(contact.text,/value="Test"/)
    assert.match(contact.text,/value="Player"/)
    assert.match(contact.text,/action="\/gamestop\/checkout\/"/)
    assert.match(contact.text,/name="reviewToken"/)
    assert.deepEqual(await client.json('/api/orders?store=gamestop'),[])
    assert.match((await client.get('/gamestop/mrt/checkout?edit=contact')).text,/value="Test Player"/)
  } finally { await server.close() }
})
