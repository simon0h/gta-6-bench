import test from 'node:test'
import assert from 'node:assert/strict'
import { getCatalogEvidence } from '../lib/catalog-policy.js'

const counts = {'playstation-store':3,'xbox-store':5,'rockstar-store':1,'game-uk':2,'jb-hifi':2,'smyths-toys':2,'eb-games-au':2,'argos':2}
const data = async store => import(`../stores/${store}/${store==='eb-games-au'?'canonical-products':'data'}.js`)
const products = m => m.PRODUCTS || m.products || m.canonicalProducts

test('specialist reference inventories contain only allowlisted source identities', async () => {
 for (const [store,count] of Object.entries(counts)) {
  const rows=products(await data(store)), {inventory}=await import(`../stores/${store}/inventory.js`)
  assert.equal(rows.length,count,store)
  assert.equal(inventory.length,count,store)
  assert.deepEqual(inventory.map(p=>p.id).sort(),Object.keys(getCatalogEvidence(store)).sort(),store)
  for(const p of rows) {
   assert.ok(p.catalogEvidence.source_url.startsWith('https://'))
   assert.equal(p.catalogEvidence.reviewed_at,'2026-10-06')
   assert.equal(p.stock,undefined,`${store}: retailer stock cannot be inferred from a simulation cap`)
   assert.equal(p.inventory,undefined)
   assert.ok(!p.physical,`${store}: no invented physical platform-store offers`)
  }
 }
})


test('specialist reference mode separates unknown availability from quantity limits', async () => {
 const game=await data('game-uk'), jb=await data('jb-hifi'), jbCatalog=await import('../stores/jb-hifi/catalog.js')
 assert.equal(game.quantityLimit(game.PRODUCTS[0]),99)
 assert.equal(jbCatalog.stockLimit(jb.PRODUCTS[0]),5)
 for (const store of ['smyths-toys','argos']) {
  const {default:mod}=await import(`../stores/${store}/index.js`)
  assert.equal(mod.gta6_available,null)
  assert.equal(mod.availability_status,'listing_only')
  const {inventory}=await import(`../stores/${store}/inventory.js`)
  for (const p of inventory) assert.equal(p.available,null)
  for (const p of products(await data(store))) {
   assert.equal(p.catalogEvidence.purchase,'unverified')
   assert.equal(p.purchaseLimit,0)
  }
 }
 const argos=await data('argos')
 assert.ok(argos.validateCart([{...argos.PRODUCTS[0],qty:1}]).messages.length)
 const smyths=await data('smyths-toys')
 assert.equal(smyths.products.find(p=>p.platform==='xbox').price,null)
})

test('specialist reference home rendering does not advertise removed fixture products', async () => {
 for (const store of ['playstation-store','xbox-store','rockstar-store','game-uk','jb-hifi']) {
  const m=await data(store),p=await import(`../stores/${store}/pages.js`)
  const html=p.homePage({base:`/${store}`,products:products(m)})
  assert.match(html,/Grand Theft Auto VI/)
  assert.doesNotMatch(html,/Pocket Garden|Autumn Adventures|Top 10 games|Gifts for Gamers|undefined|NaN/)
 }
 const smyths=await import('../stores/smyths-toys/browse.js'), argos=await import('../stores/argos/catalog.js')
 assert.doesNotMatch(smyths.homeContent('/smyths-toys'),/4\.8|62\)|£0\.00|undefined|NaN/)
 assert.doesNotMatch(argos.home('/argos'),/9901301|Currently out of stock|undefined|NaN/)
})

test('removed specialist IDs are unavailable to direct product and cart lookups', async () => {
 const ps=await data('playstation-store'),xbox=await data('xbox-store'),rs=await data('rockstar-store'),game=await data('game-uk'),jb=await data('jb-hifi'),argos=await data('argos')
 assert.equal(ps.byId('BENCH-ASTRO-BOT'),null)
 assert.equal(xbox.byId('pocket-garden'),null)
 assert.equal(rs.bySku('RS-CAP-NAVY'),null)
 assert.equal(game.byId('991202'),null)
 assert.equal(jb.byId('991106'),null)
 assert.equal(argos.bySku('9901201'),undefined)
 for (const store of ['smyths-toys','eb-games-au']) assert.equal((await import(`../stores/${store}/browse.js`)).browseProducts.length,0)
})

test('JB ancillary observations preserve captured identities without expanding purchase inventory', async () => {
 const { default: store } = await import('../stores/jb-hifi/index.js')
 const { byId } = await data('jb-hifi')
 const { recommendationById } = await import('../stores/jb-hifi/reference-recommendations.js')
 const records = store.catalog_observations
 assert.deepEqual(records.map(p=>p.id), ['829262','840499','896438','896402','482005','899532'])
 for (const p of records) {
  assert.equal(p.purchasable,false)
  assert.equal(p.purchase,'unverified')
  assert.equal(p.availability,'unknown')
  assert.match(p.source_url,/^https:\/\/www\.jbhifi\.com\.au\//)
  assert.equal(p.captured_at,'2026-10-06')
  assert.ok(p.evidence_path)
  assert.ok(p.evidence_screenshots.length)
  assert.equal(byId(p.id),null)
  assert.equal(recommendationById(p.id).title,p.title)
 }
 const cod=records.find(p=>p.id==='899532')
 assert.equal(cod.native_path,null)
 assert.equal(cod.path,'/reference-products/899532')
 assert.equal(cod.source_url,'https://www.jbhifi.com.au/products/xbox-series-x-grand-theft-auto-vi')
 assert.deepEqual(cod.observed_on,['https://www.jbhifi.com.au/products/xbox-series-x-grand-theft-auto-vi'])
 assert.deepEqual(records.find(p=>p.id==='482005').observed_on,['https://www.jbhifi.com.au/cart'])
 assert.equal(records.some(p=>p.id==='903000'),false)
})
