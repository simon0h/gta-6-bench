import { products, candidates } from './catalog.js'
export const inventory = products.map(product => ({
  id: product.id, title: product.title, type: 'other', platform: null,
  available: candidates(product).some(variant => product.available !== false && variant.available !== false && variant.stock > 0),
  category: product.category,
}))
