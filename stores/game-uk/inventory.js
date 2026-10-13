import { PRODUCTS, ASSORTMENT } from './data.js'
export const inventory=PRODUCTS.map(p=>({id:p.id,title:p.title,type:p.catalogType,platform:p.catalogType==='game'?p.catalogPlatform:null,available:p.catalogEvidence ? (p.catalogEvidence.availability === 'unknown' ? null : ['preorder','in_stock'].includes(p.catalogEvidence.availability)) : p.stock>0&&(!p.options?.length||p.options.some(v=>v.stock>0)),category:p.browseCategory||p.category}))
// Reference-mode shop floor (shelf.js), kept apart from the evidence-backed `inventory` above.
// Ordinary merchandise only: purchasable locally as kind 'other', never a GTA VI line.
export const assortment=ASSORTMENT.map(p=>({id:p.id,title:p.title,brand:p.brand,department:p.departments[0],category:p.category,price:p.price,path:'/'+p.slug,purchase:'simulated',type:p.catalogType||'other'}))
