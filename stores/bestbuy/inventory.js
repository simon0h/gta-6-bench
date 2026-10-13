import { PRODUCTS, stockFor, selectedProduct } from './data.js'
import { isGame, merchandisingPlatform, otherType } from './expansion.js'
export const inventory=PRODUCTS.map(p=>({id:p.id,title:p.title,type:isGame(p)?'game':p.catalogType||otherType(p),platform:isGame(p)?merchandisingPlatform(p):null,available:(p.variants?.length?p.variants.map(v=>selectedProduct(p,v.id)):[p]).some(v=>v.stock>0&&(stockFor(v,'pickup')>0||stockFor(v,'shipping')>0)),category:p.category}))
