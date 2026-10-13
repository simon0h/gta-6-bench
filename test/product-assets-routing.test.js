import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer, galleryPrimaryImage } from './helpers.js'
import { productAssetUrl, productGallery } from '../lib/product-assets.js'
import { assertProductGallery } from './product-gallery-assertions.js'

test('product images share only canonical identities and preserve variant selections', async () => {
 const srv = await startServer()
 try {
  const c=srv.client(), catalog=srv.app.locals.productAssetCatalog
  const target=catalog.find(p=>p.store==='target'&&p.canonicalTitle==='Grand Theft Auto V'&&p.platform==='ps5')
  const gamestop=catalog.find(p=>p.store==='gamestop'&&p.canonicalTitle==='Grand Theft Auto V'&&p.platform==='ps5')
  assert.equal(target.assetKey,gamestop.assetKey)
  for(let view=0;view<3;view++){
   const a=await c.get(productAssetUrl(target.store,target.raw,view)), b=await c.get(productAssetUrl(gamestop.store,gamestop.raw,view))
   assert.equal(a.status,200);assert.equal(a.text,b.text);assert.equal(a.headers.get('etag'),b.headers.get('etag'))
  }
  const products=catalog.filter(p=>p.store==='ikea'&&p.variants.length===0).slice(0,2)
  const sets=[]
  for(const p of products)sets.push(await assertProductGallery(c,productGallery(p.store,p.raw),p.store,p.id))
  for(let view=0;view<3;view++)assert.notEqual((await c.get(sets[0][view])).text,(await c.get(sets[1][view])).text)
  const white=await c.get('/nike/product/cushion-runner?Color=White&Size=US%208')
  const black=await c.get('/nike/product/cushion-runner?Color=Black&Size=US%208')
  assert.notEqual((await c.get(galleryPrimaryImage(white.text))).text,(await c.get(galleryPrimaryImage(black.text))).text)
  for(const pathname of ['/product-assets/unknown/item/0.svg','/product-assets/ikea/unknown/0.svg','/product-assets/ikea/desk/4.svg','/product-assets/ikea/desk/-1.svg'])assert.equal((await c.get(pathname)).status,404)
 } finally { await srv.close() }
})
