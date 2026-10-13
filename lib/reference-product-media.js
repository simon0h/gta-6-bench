import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'

// Only explicitly matched retailer/SKU pairs use reference photography. Matching
// by a title substring would put PS5 packaging on Xbox offers or on accessories.
const references = new Map()
for (const store of ['amazon', 'target', 'jb-hifi', 'gamestop']) {
  const root = new URL(`../public/reference/${store}/`, import.meta.url)
  const manifest = JSON.parse(readFileSync(new URL('manifest.json', root), 'utf8'))
  for (const product of manifest.products) {
    const images = product.images.map((file, index) => {
      if (!/^[a-z0-9-]+\.(jpg|png)$/.test(file)) throw new Error(`Invalid reference image: ${file}`)
      const source = manifest.assets.find(asset => asset.file === file)
      if (!source?.source_url?.startsWith('https://')) throw new Error(`Missing reference provenance: ${file}`)
      const bytes = readFileSync(new URL(file, root))
      const mime = bytes[0] === 0xff && bytes[1] === 0xd8 ? 'image/jpeg'
        : bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) ? 'image/png' : null
      if (!mime) throw new Error(`Reference asset is not a raster image: ${file}`)
      return {
        localUrl: `/static/reference/${store}/${file}`,
        background: /^#[a-f0-9]{6}$/i.test(product.background) ? product.background : '#ffffff',
        label: index === 0 ? 'Product image' : `Product image ${index + 1}`,
        source: source.source_url,
        hash: createHash('sha256').update(bytes).digest('hex'),
        data: `data:${mime};base64,${bytes.toString('base64')}`,
      }
    })
    for (const id of product.ids) references.set(`${store}:${id}`, images)
  }
}

export function referenceProductMedia(store, product) {
  const id = store === 'amazon' ? product.asin : store === 'target' ? product.tcin : product.id
  return references.get(`${store}:${id}`) || null
}

export function renderReferenceProductImage(image) {
  // Embedded raster keeps the existing offline SVG route contract. The source
  // pixels are unmodified; preserveAspectRatio avoids distorting covers/screens.
  return `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="720" viewBox="0 0 720 720" data-asset-source="official-reference"><title>${image.label}</title><rect width="720" height="720" fill="${image.background}"/><image width="720" height="720" preserveAspectRatio="xMidYMid meet" href="${image.data}"/></svg>`
}
