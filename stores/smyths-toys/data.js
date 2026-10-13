import { fixtureCatalog, applyCatalogPolicy } from '../../lib/catalog-policy.js'
import { CATALOG_EVIDENCE } from './catalog-evidence.js'
export const products = [
  { sku: '263307', platform: 'ps5', title: 'Grand Theft Auto VI PS5', path: '/gaming-and-tech/pre-order-games/playstation-5-pre-order-games/grand-theft-auto-vi-ps5/p/263307' },
  { sku: '263308', platform: 'xbox', title: 'Grand Theft Auto VI Xbox Series X', path: '/gaming-and-tech/pre-order-games/xbox-series-x-pre-order-games/grand-theft-auto-vi-xbox-series-x/p/263308' },
].map(p => ({ ...p, kind: 'game', edition: 'standard', format: 'code-in-box', unit_price: 67.99, price:67.99, department:'Gaming & Tech', category:'Pre-order games', family:'pre-order-games', brand:'Rockstar Games', minAge:18, maxAge:99, rating:4.8, reviews:62, stock:4, deliveryStock:4, collectionStock:{beckton:4,salford:4}, keywords:'gta6 gtavi gta 6 gta vi gaming pre order preorder', options:[], variants:[] }))

applyCatalogPolicy('smyths-toys', products, CATALOG_EVIDENCE)
if (!fixtureCatalog) for (const p of products) {
  for (const key of ['stock','deliveryStock','collectionStock','rating','reviews']) delete p[key]
  p.purchaseLimit = 0
  if (p.sku === '263308') { p.price = null; p.unit_price = null }
}
