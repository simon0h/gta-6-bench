import { PRODUCTS, stockLimit } from './data.js'
export const inventory=PRODUCTS.filter(p=>!p.addon).map(p=>({id:p.tcin,title:p.title,type:p.catalogType,platform:p.catalogType==='game'?p.catalogPlatform:null,available:stockLimit(p)>0&&(!p.variants?.length||p.variants.some(v=>v.stock>0)),category:p.department}))
