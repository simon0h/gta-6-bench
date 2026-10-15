import { productImage } from '../../lib/product-assets.js'
import { shelfImage } from './shelf.js'
// Assortment items (shelf.js) are drawn by the store's own image route; the evidence-backed
// GTA 6 rows keep the shared product-asset images.
export function productArt(p, className='') { return p.shelf ? shelfImage(p,{className}) : productImage('amazon',p,{className}) }
