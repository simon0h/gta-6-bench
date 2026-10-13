import { browseProducts } from './browse.js'
import { canonicalProducts } from './canonical-products.js'
export const inventory=[
  ...canonicalProducts.map(p=>({id:p.sku,title:`Grand Theft Auto VI - ${p.label}`,type:'game',platform:p.platform,available:true,category:'Video Games'})),
  ...browseProducts.map(p=>({id:p.sku,title:p.title,type:p.catalogType,platform:p.catalogType==='game'?p.catalogPlatform:null,available:p.stock>0&&(!p.variants?.length||p.variants.some(v=>v.stock>0)),category:p.category})),
]
