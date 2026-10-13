import { products } from './catalog-data.js'
export const inventory=products.map(p=>({id:p.id,title:p.title,type:p.category==='software'?'game':p.category==='consoles'?'console':p.category==='accessories'?'accessory':'other',platform:p.category==='software'?p.platform:null,available:p.variants?p.variants.some(v=>v.stock>0):p.stock>0,category:p.category}))
