import { products } from './data.js'
import { gamePlatform } from './catalog500.js'
export const inventory=products.map(p=>({id:p.sku,title:p.title,type:p.leaf==='games'?'game':p.leaf==='consoles'?'console':p.leaf==='gaming-accessories'?'accessory':'other',platform:p.leaf==='games'?gamePlatform(p):null,available:p.variants?p.variants.some(v=>v.stock>0):p.stock>0,category:p.leaf}))
