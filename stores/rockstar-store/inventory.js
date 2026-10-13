import { PRODUCTS } from './data.js'
import { isPlayable } from './catalog500.js'
export const inventory=PRODUCTS.map(p=>({id:p.id,title:p.title,type:isPlayable(p)?'game':p.catalogType==='console'?'console':p.category==='accessories'?'accessory':'other',platform:isPlayable(p)?p.catalogPlatform||(p.id==='gta-vi'?'ps5':'pc'):null,available:p.catalogEvidence ? (p.catalogEvidence.availability === 'unknown' ? null : ['preorder','in_stock'].includes(p.catalogEvidence.availability)) : p.sale!=='link-out'&&(p.variants?p.variants.some(v=>v.stock>0):p.inventory>0),category:p.category}))
