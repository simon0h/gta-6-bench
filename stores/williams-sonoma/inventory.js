import { products, candidateVariants } from './catalog.js'

export const inventory = products.map(product => ({
  id: product.id,
  title: product.title,
  type: 'other',
  platform: null,
  available: candidateVariants(product).some(variant => variant.available !== false && variant.stock > 0),
  category: product.category,
}))
