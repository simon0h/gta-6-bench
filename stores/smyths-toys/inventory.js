import { browseProducts } from './browse.js'
import { products } from './data.js'
import { isGame, merchandisingPlatform } from './expansion.js'
import { otherType } from '../bestbuy/expansion.js'
export const catalog=[...browseProducts,...products]
export const inventory=catalog.map(p=>({id:p.sku,title:p.title,type:isGame(p)?'game':p.catalogType||otherType(p),platform:isGame(p)?merchandisingPlatform(p):null,available:p.catalogEvidence ? (p.catalogEvidence.availability === 'unknown' ? null : ['preorder','in_stock'].includes(p.catalogEvidence.availability)) : p.stock>0&&(p.variants.length?p.variants:[p]).some(v=>v.stock>0&&(v.deliveryStock>0||Object.values(v.collectionStock||{}).some(n=>n>0))),category:p.category}))
