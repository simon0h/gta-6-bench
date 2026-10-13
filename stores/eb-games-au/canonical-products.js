import { fixtureCatalog, applyCatalogPolicy } from '../../lib/catalog-policy.js'
import { CATALOG_EVIDENCE } from './catalog-evidence.js'
// The two canonical preorder identities are shared with inventory without
// importing the router or putting ordinary games into GTA deposit logic.
export const canonicalProducts = [
  { sku: '330056', platform: 'ps5', label: 'PlayStation 5', path: '/product/ps5/330056-grand-theft-auto-vi' },
  { sku: '330060', platform: 'xbox', label: 'Xbox Series X', path: '/product/xbox-series-x/330060-grand-theft-auto-vi' },
]

applyCatalogPolicy('eb-games-au', canonicalProducts, CATALOG_EVIDENCE)
if (!fixtureCatalog) for (const p of canonicalProducts) p.purchaseLimit = 10
