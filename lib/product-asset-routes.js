import { createHash } from 'node:crypto'
import { readProductAssetCatalog, createProductAssetIndex } from './product-asset-catalog.js'
import { renderProductAsset } from './product-asset-art.js'
import { referenceProductMedia, renderReferenceProductImage } from './reference-product-media.js'

export async function mountProductAssetRoutes(app) {
  const catalog = await readProductAssetCatalog()
  const index = createProductAssetIndex(catalog)
  const cache = new Map()
  app.locals.productAssetCatalog = catalog
  app.locals.productAssetIndex = index
  app.get('/product-assets/:store/:id/:view.svg', (req, res) => {
    if (!/^(?:0|[1-9]\d?)$/.test(req.params.view)) return res.status(404).type('text').send('Product image not found')
    const selection = Object.fromEntries(['variant', 'sku', 'color'].flatMap(key => typeof req.query[key] === 'string' ? [[key, req.query[key]]] : []))
    const product = index.get(req.params.store, req.params.id, selection)
    if (!product) return res.status(404).type('text').send('Product image not found')
    const references = referenceProductMedia(product.store, product.raw)
    const view = Number(req.params.view)
    if (references ? view >= references.length : view > 3) return res.status(404).type('text').send('Product image not found')
    // The same exact item always uses the same render descriptor, including
    // when retailers use different product titles or languages for that item.
    const canonical = index.byAssetKey.get(product.assetKey) || product
    const key = references ? `reference:${references[view].hash}` : canonical.assetKey + ':' + req.params.view
    let image = cache.get(key)
    if (!image) {
      const svg = references ? renderReferenceProductImage(references[view]) : renderProductAsset(canonical, view)
      image = { svg, etag: '"' + createHash('sha256').update(svg).digest('hex') + '"' }
      if (cache.size >= 512) cache.delete(cache.keys().next().value)
      cache.set(key, image)
    }
    res.set('Cache-Control', 'public, max-age=3600').set('ETag', image.etag).set('X-Content-Type-Options', 'nosniff').set('X-Product-Asset-Key', canonical.assetKey)
    res.set('X-Product-Asset-Provenance', references ? 'official-reference' : 'synthetic-illustration')
    if (req.get('If-None-Match') === image.etag) return res.status(304).end()
    res.type('image/svg+xml').send(image.svg)
  })
}
