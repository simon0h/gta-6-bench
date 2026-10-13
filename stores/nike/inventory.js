import { products } from './catalog.js'

// Canonical base listings; option rows are never separate inventory records.
export const inventory = products.map(product => ({
  id: product.id,
  title: product.title,
  type: 'other',
  platform: null,
  available: product.available !== false && product.stock > 0 && (!product.variants?.length || product.variants.some(variant => variant.available !== false && variant.stock > 0)),
  category: product.category,
}))
