import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { readProductAssetCatalog, createProductAssetIndex } from '../lib/product-asset-catalog.js'
import { productAssetViewCount } from '../lib/product-assets.js'
import { describeProductAsset, renderProductAsset } from '../lib/product-asset-art.js'

const digest = text => createHash('sha256').update(text).digest('hex')
// Ignore names, descriptive copy, IDs and data attributes when comparing the
// actual illustrations. Merely renaming one SVG cannot satisfy uniqueness.
export function visualMarkup(svg) {
  return svg.replace(/<(?:text|title|desc|metadata)\b[^>]*>[\s\S]*?<\/(?:text|title|desc|metadata)>/g, '')
    .replace(/\s(?:id|data-[\w-]+|aria-[\w-]+)="[^"]*"/g, '')
    .replace(/url\(#[^)]+\)/g, 'url(#reference)')
    .replace(/\s(?:xlink:)?href="#[^"]*"/g, ' href="#reference"')
    .replace(/<!--[^]*?-->/g, '')
    .replace(/>\s+</g, '><')
}

export function mainObjectMarkup(svg, context) {
  const start = svg.search(/<g\b[^>]*\bdata-asset-object(?:="[^"]*")?[^>]*>/)
  assert.notEqual(start, -1, `${context}: missing isolated product artwork`)
  let depth = 0
  for (const match of svg.slice(start).matchAll(/<\/?g\b[^>]*>/g)) {
    if (match[0].startsWith('</')) depth--
    else if (!match[0].endsWith('/>')) depth++
    if (!depth) {
      const artwork = visualMarkup(svg.slice(start, start + match.index + match[0].length))
      assert.match(artwork, /<(?:path|rect|circle|ellipse|polygon|line)\b/, `${context}: empty product artwork`)
      return artwork
    }
  }
  assert.fail(`${context}: unclosed product artwork group`)
}

function assertWellFormedSvg(svg, context) {
  assert.match(svg, /^\s*(?:<\?xml[^?]*\?>\s*)?<svg\b/, context)
  assert.match(svg, /xmlns="http:\/\/www\.w3\.org\/2000\/svg"/, context)
  assert.match(svg, /<(?:path|rect|circle|ellipse|polygon|line)\b/, context)
  assert.doesNotMatch(svg, /(?:NaN|Infinity|undefined|null)(?:["\s<>])/, context)
  assert.doesNotMatch(svg, /<script\b|\bon\w+\s*=|(?:href|src)="https?:/i, context)
  assert.doesNotMatch(svg, /&(?!amp;|lt;|gt;|quot;|apos;|#\d+;|#x[0-9a-f]+;)/i, context)
  const stack = []
  for (const match of svg.matchAll(/<\/?([a-zA-Z][\w:.-]*)\b[^>]*>/g)) {
    const token = match[0], name = match[1]
    if (token.startsWith('</')) assert.equal(stack.pop(), name, `${context}: unbalanced ${name}`)
    else if (!token.endsWith('/>')) stack.push(name)
  }
  assert.deepEqual(stack, [], `${context}: unterminated SVG elements`)
}

export function catalogAssetViewCounts(catalog) {
  const counts = new Map()
  for (const listing of catalog) {
    for (const descriptor of [listing, ...listing.variants]) {
      counts.set(descriptor.assetKey, Math.max(counts.get(descriptor.assetKey) || 0, productAssetViewCount(descriptor.raw)))
    }
  }
  return counts
}

export async function auditProductAssets() {
  const catalog = await readProductAssetCatalog()
  const index = createProductAssetIndex(catalog)
  const viewCounts = catalogAssetViewCounts(catalog)
  const svgs = new Map(), visuals = new Map(), objects = new Map()
  const families = {}
  let count = 0
  for (const descriptor of index.byAssetKey.values()) {
    const subject = describeProductAsset(descriptor)
    assert.equal(subject.supported, true, `${descriptor.store}/${descriptor.id}: missing ${subject.kind} renderer`)
    families[subject.kind] = (families[subject.kind] || 0) + 1
    const views = viewCounts.get(descriptor.assetKey)
    assert.ok(views >= 3, descriptor.assetKey)
    const itemVisuals = new Set()
    for (let view = 0; view < views; view++) {
      const context = `${descriptor.store}/${descriptor.id}/${descriptor.variant?.id || 'base'}/${view}`
      const svg = renderProductAsset(descriptor, view)
      assertWellFormedSvg(svg, context)
      const svgHash = digest(svg), visualHash = digest(visualMarkup(svg)), objectHash = digest(mainObjectMarkup(svg, context))
      assert.equal(svgs.has(svgHash), false, `${context} duplicates ${svgs.get(svgHash)}`)
      assert.equal(visuals.has(visualHash), false, `${context} reuses the illustration from ${visuals.get(visualHash)}`)
      assert.equal(objects.has(objectHash), false, `${context} reuses the main product geometry from ${objects.get(objectHash)}`)
      svgs.set(svgHash, context)
      visuals.set(visualHash, context)
      objects.set(objectHash, context)
      itemVisuals.add(visualHash)
      count++
    }
    assert.equal(itemVisuals.size, views, descriptor.assetKey)
  }
  assert.ok(index.byAssetKey.size > 7000)
  assert.ok(count >= index.byAssetKey.size * 3)
  return {
    verifiedAt: new Date().toISOString(), baseListings: catalog.length,
    uniqueBaseItems: new Set(catalog.map(product => product.assetKey)).size,
    variantConfigurations: catalog.reduce((total, product) => total + product.variants.length, 0),
    uniqueItemsIncludingConfigurations: index.byAssetKey.size,
    implementedImageFamilies: Object.keys(families).length, identitiesByImageFamily: families,
    assets: count, uniqueSVGs: svgs.size, uniqueNonTextVisuals: visuals.size, uniqueMainObjectVisuals: objects.size,
    servingMode: 'dynamically rendered local SVG responses', generatedLocally: true,
    viewCountPolicy: 'Maximum requested views across every retailer listing and selected configuration sharing an item identity',
    minimumViewsPerItem: 3, additionalViews: count - index.byAssetKey.size * 3,
    missingAssets: 0, invalidMarkup: 0, svgCollisions: 0, visualCollisions: 0, mainObjectCollisions: 0,
    notes: 'Asset counts describe distinct SVG response bodies generated on demand, not image files stored on disk. Visual comparisons exclude names, descriptive copy, IDs and metadata. Main-object comparisons additionally exclude backgrounds, shadows and shared definitions. Item identity keeps platform, edition, format and selected configuration.',
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const report = await auditProductAssets()
  const destination = new URL('../research/product-assets/asset-coverage.json', import.meta.url)
  await mkdir(path.dirname(fileURLToPath(destination)), { recursive: true })
  await writeFile(destination, JSON.stringify(report, null, 2) + '\n')
  console.log(JSON.stringify(report, null, 2))
}
