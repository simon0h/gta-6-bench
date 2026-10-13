import { PRODUCTS, isBuyable } from './data.js'
export const inventory=PRODUCTS.map(p=>({id:p.id,title:p.title,type:p.catalogType,platform:p.catalogPlatform,available:isBuyable(p),category:p.catalogType==='game'?p.genre:p.accessorySubtype==='digital-add-on'?'Digital add-ons':p.catalogType==='console'?'Consoles':'Physical accessories'}))
