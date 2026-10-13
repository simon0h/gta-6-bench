import { PRODUCTS } from './data.js'
export const inventory=PRODUCTS.map(p=>({id:p.asin,title:p.title,type:p.catalogType,platform:p.catalogType==='game'?p.catalogPlatform:null,available:p.stock>0,category:p.department}))
