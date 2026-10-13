import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { startServer } from './helpers.js'
import { referenceProductMedia } from '../lib/reference-product-media.js'
import { productGallery } from '../lib/product-assets.js'

test('official galleries preserve retailer, platform, source pixels and complete captured image order', async () => {
  const srv = await startServer()
  try {
    const client = srv.client()
    for (const [store, field, id, count, image] of [
      ['amazon', 'asin', 'B0H6K928WL', 11, 'gta-vi-ps5-1.jpg'],
      ['amazon', 'asin', 'B0H6K49W6Y', 11, 'gta-vi-xbox-1.jpg'],
      ['target', 'tcin', '1011529119', 5, 'gta-vi-ps5-1.jpg'],
      ['target', 'tcin', '1011545811', 5, 'gta-vi-xbox-1.jpg'],
      ['jb-hifi', 'id', '903000', 11, 'gta-vi-ps5-1.jpg'],
      ['jb-hifi', 'id', '903001', 11, 'gta-vi-xbox-1.jpg'],
      ['gamestop', 'id', '448295', 12, 'gta-vi-ps5-1.png'],
      ['gamestop', 'id', '448297', 12, 'gta-vi-xbox-1.png'],
    ]) {
      const product = { [field]: id, title: 'Grand Theft Auto VI' }
      const media = referenceProductMedia(store, product)
      assert.equal(media.length, count)
      assert.equal(new Set(media.map(view => view.hash)).size, count)
      const page = productGallery(store, product)
      assert.equal([...page.matchAll(/data-pa-select=/g)].length, count)
      assert.doesNotMatch(page, /undefined|Alternate view|Close-up/)
      const response = await client.get(`/product-assets/${store}/${id}/0.svg`)
      assert.equal(response.status, 200)
      assert.equal(response.headers.get('x-product-asset-provenance'), 'official-reference')
      const encoded = /href="data:image\/(?:jpeg|png);base64,([^"]+)"/.exec(response.text)?.[1]
      assert.ok(encoded)
      assert.deepEqual(Buffer.from(encoded, 'base64'), readFileSync(new URL(`../public/reference/${store}/${image}`, import.meta.url)))
      assert.doesNotMatch(response.text, /(?:href|src)="https?:/)
      assert.equal((await client.get(`/product-assets/${store}/${id}/${count - 1}.svg`)).status, 200)
      for (const view of [count, -1, '01', '1.5', 100]) {
        assert.equal((await client.get(`/product-assets/${store}/${id}/${view}.svg`)).status, 404)
      }
    }
    assert.notEqual(referenceProductMedia('target', { tcin: '1011529119' })[0].hash,
      referenceProductMedia('target', { tcin: '1011545811' })[0].hash)
    assert.notEqual(referenceProductMedia('jb-hifi', { id: '903000' })[0].hash,
      referenceProductMedia('jb-hifi', { id: '903001' })[0].hash)
    assert.equal(referenceProductMedia('target', { tcin: 'unlisted', title: 'Grand Theft Auto VI' }), null)
    assert.equal(referenceProductMedia('gamestop', { id: '1011529119' }), null)
    assert.equal((await client.get('/product-assets/ikea/desk/4.svg')).status, 404)
  } finally { await srv.close() }
})
