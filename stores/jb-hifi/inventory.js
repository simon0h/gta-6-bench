import { PRODUCTS } from './data.js'
import { isGame, merchandisingPlatform } from './expansion.js'
import { otherType } from '../bestbuy/expansion.js'
export const inventory=PRODUCTS.map(p=>({id:p.id,title:p.title,type:isGame(p)?'game':p.catalogType||otherType(p),platform:isGame(p)?merchandisingPlatform(p):null,available:p.catalogEvidence ? (p.catalogEvidence.availability === 'unknown' ? null : ['preorder','in_stock'].includes(p.catalogEvidence.availability)) : p.orderable&&p.stock>0&&(!p.variants?.length||p.variants.some(v=>v.stock>0)),category:p.crumbs[0]}))
