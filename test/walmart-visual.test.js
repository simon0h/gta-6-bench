import { assertProductGallery } from './product-gallery-assertions.js'
import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer } from './helpers.js'
import { RETAIL_PRODUCTS } from '../stores/walmart/catalog.js'

// Image and gallery navigation must never silently reset a chosen pack/price.
test('walmart visual navigation preserves selected product options through zoom and gallery', async () => {
 const server=await startServer()
 try {
  const client=server.client(), milk=RETAIL_PRODUCTS.find(p=>p.family==='milk')
  const pdp=await client.get(`/walmart/ip/${milk.id}?variant=two-gallons`)
  await assertProductGallery(client,pdp.text,'walmart',milk.id,'two-gallons')
  assert.match(pdp.text,new RegExp(`/ip/${milk.id}/gallery\\?variant=two-gallons`))
  const gallery=await client.get(`/walmart/ip/${milk.id}/gallery?variant=two-gallons`)
  assert.equal(gallery.status,200)
  await assertProductGallery(client,gallery.text,'walmart',milk.id,'two-gallons')
  assert.match(gallery.text,/\?variant=two-gallons">Back to item/)
  assert.match(gallery.text,/2 × 1 gallon/)
  assert.doesNotMatch(gallery.text,/<li>Size: 1 gallon<\/li>/)
  const invalid=await client.get(`/walmart/ip/${milk.id}/gallery?variant=forged`)
  assert.equal(invalid.status,400)
  assert.match(invalid.text,/That option is not available/)
 } finally { await server.close() }
})
