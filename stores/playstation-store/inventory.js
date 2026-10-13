import { PRODUCTS } from './data.js'
export const inventory=PRODUCTS.map(p=>({id:p.id,title:p.title,type:p.catalogType,platform:p.catalogPlatform,available:p.available&&Number.isFinite(p.price)&&(!p.physical||p.stock>0),category:p.catalogType==='game'?p.genres:p.accessorySubtype==='digital-add-on'?'Digital add-ons':p.catalogType==='console'?'Consoles':'Physical accessories'}))
