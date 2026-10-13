import { PRODUCTS } from './data.js'
export const inventory=PRODUCTS.map(p=>({id:p.id,title:p.title,type:p.catalogType,platform:p.catalogType==='game'?p.catalogPlatform:null,available:p.stock>0&&(!p.variants?.length||p.variants.some(v=>v.stock>0)),category:p.department}))
