// Captured retailer listings are the default. The authored 500-row catalogs
// remain available only for explicitly requested historical fixture scenarios.
export const CATALOG_MODE = process.env.CATALOG_MODE || 'reference'
if (!['reference', 'fixtures'].includes(CATALOG_MODE)) {
  throw new Error(`Unsupported CATALOG_MODE: ${CATALOG_MODE}. Use reference or fixtures.`)
}
export const fixtureCatalog = CATALOG_MODE === 'fixtures'

const evidenceByStore = new Map()
export function catalogProductId(store, product) {
  return String((store === 'amazon' ? product.asin
    : store === 'target' ? product.tcin
      : ['argos', 'smyths-toys', 'eb-games-au', 'gmarket'].includes(store) ? product.sku
        : product.id) ?? '')
}

/** Restrict the shared source array, so search, direct URLs and cart lookups agree. */
export function applyCatalogPolicy(store, products, evidence) {
  if (!evidence || typeof evidence !== 'object' || Array.isArray(evidence)) {
    throw new Error(`Missing catalog evidence for ${store}`)
  }
  for (const [id, record] of Object.entries(evidence)) {
    if (!id || !record.source_url?.startsWith('https://') || !record.captured_at || !record.evidence_path) {
      throw new Error(`Incomplete catalog evidence: ${store}/${id}`)
    }
  }
  evidenceByStore.set(store, evidence)
  if (fixtureCatalog) return products
  const selected = products.filter(product => Object.hasOwn(evidence, catalogProductId(store, product)))
  const seen = new Set()
  for (const product of selected) {
    const id = catalogProductId(store, product)
    if (seen.has(id)) throw new Error(`Duplicate reference catalog product: ${store}/${id}`)
    seen.add(id)
    product.catalogEvidence = Object.freeze({ ...evidence[id] })
  }
  products.splice(0, products.length, ...selected)
  return products
}

export function getCatalogEvidence(store) {
  return evidenceByStore.get(store) || {}
}

export function catalogEvidenceSummary(store) {
  const records = Object.entries(getCatalogEvidence(store))
  return {
    mode: CATALOG_MODE,
    scope: fixtureCatalog ? 'authored-fixtures' : 'captured-listings',
    source_listings: records.length,
    simulated_purchase_listings: records.filter(([, record]) => record.purchase === 'simulated').length,
    unverified_purchase_listings: records.filter(([, record]) => record.purchase === 'unverified').length,
  }
}
