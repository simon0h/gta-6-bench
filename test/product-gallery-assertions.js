import assert from 'node:assert/strict'

// Check the actual gallery controls rather than repeated main/thumbnail copies.
export function assertProductGalleryMarkup(html, store, id, variant) {
  const gallery = /<section class="pa-gallery\b[^>]*data-product-gallery[\s\S]*?<\/section>/.exec(html)?.[0]
  assert.ok(gallery, `Product gallery missing for ${store}/${id}`)
  assert.match(gallery, /data-pa-enlarge/)
  assert.match(gallery, /data-pa-close/)
  assert.match(gallery, /aria-live="polite"/)
  const urls = [...gallery.matchAll(/data-pa-src="([^"]+)"/g)].map(match => match[1].replaceAll('&amp;', '&'))
  assert.ok(urls.length >= 3, `At least three views for ${store}/${id}`)
  assert.equal(new Set(urls).size, urls.length, 'Every gallery control selects a different asset')
  for (const url of urls) {
    const image = new URL(url, 'http://local')
    assert.ok(image.pathname.startsWith(`/product-assets/${store}/${encodeURIComponent(id)}/`), 'All views belong to the selected item')
    if (variant !== undefined) assert.equal(image.searchParams.get('variant'), variant, 'Gallery preserves selected variant')
  }
  return urls
}

export async function assertProductGallery(client, html, store, id, variant) {
  const urls = assertProductGalleryMarkup(html, store, id, variant)
  const bodies = []
  for (const url of urls) {
    const response = await client.get(url)
    assert.equal(response.status, 200, url)
    assert.match(response.headers.get('content-type'), /^image\/svg\+xml/)
    assert.match(response.text, /<svg\b/)
    bodies.push(response.text)
  }
  assert.equal(new Set(bodies).size, bodies.length, 'Views have distinct image contents')
  return urls
}
