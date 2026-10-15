import { browseProducts, shelf } from './browse.js'
// Reference-mode shop floor (shelf.js), kept apart from the evidence-backed `inventory` below.
// Ordinary merchandise only: purchasable locally as kind 'other', never a GTA VI line.
export const assortment = shelf.map(p => ({ id: p.sku, title: p.title, brand: p.brand, department: p.department, category: p.category, price: p.price, path: p.path, purchase: 'simulated', type: p.catalogType || 'other' }))
import { products } from './data.js'
import { isGame, merchandisingPlatform } from './expansion.js'
import { otherType } from '../bestbuy/expansion.js'
export const catalog=[...browseProducts,...products]
export const inventory=catalog.map(p=>({id:p.sku,title:p.title,type:isGame(p)?'game':p.catalogType||otherType(p),platform:isGame(p)?merchandisingPlatform(p):null,available:p.catalogEvidence ? (p.catalogEvidence.availability === 'unknown' ? null : ['preorder','in_stock'].includes(p.catalogEvidence.availability)) : p.stock>0&&(p.variants.length?p.variants:[p]).some(v=>v.stock>0&&(v.deliveryStock>0||Object.values(v.collectionStock||{}).some(n=>n>0))),category:p.category}))
