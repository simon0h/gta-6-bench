import { PRODUCTS, selectedProduct } from './data.js'
import { isGame, merchandisingPlatform } from './expansion.js'
import { otherType } from '../bestbuy/expansion.js'
export const inventory=PRODUCTS.map(p=>({id:p.sku,title:p.title,type:isGame(p)?'game':p.catalogType||otherType(p),platform:isGame(p)?merchandisingPlatform(p):null,available:p.catalogEvidence ? (p.catalogEvidence.availability === 'unknown' ? null : ['preorder','in_stock'].includes(p.catalogEvidence.availability)) : (p.variants?.length?p.variants.map(v=>selectedProduct(p,v.id)):[p]).some(v=>v.stock>0&&v.methods.length>0),category:p.category}))
