import { addedGames, otherFixtures, classify, platformOf, slug } from './assortment500.js'
import { enrichProduct } from './catalog.js'
export function expandCatalog(products) {
 for(const p of products){p.catalogType=classify(p);p.catalogPlatform=platformOf(p)}
 const others=products.filter(p=>p.catalogType!=='game').length
 const extra=[...addedGames(products).map((p,i)=>({
   ...p,asin:`A5G${String(i+1).padStart(7,'0')}`,slug:slug(p.title),brand:p.publisher,department:'videogames',node:p.catalogPlatform,artFamily:'game',typeLabel:'Video Game',
   format:p.formatLabel==='Game card'?'cartridge':p.formatLabel==='Download code'?'download':'physical',release:null,releasedDate:p.release,availability:'In Stock',
   catalog500:true,about:[p.description,...Object.entries(p.specs).map(([k,v])=>`${k}: ${v}`)],rating:{stars:4.2+(i%6)/10,count:String(30+i)},esrb:p.age,
 })),...otherFixtures('amazon',250-others).map((p,i)=>({
   ...p,asin:`A5R${String(i+1).padStart(7,'0')}`,slug:slug(p.title),kind:'other',artFamily:p.shape,typeLabel:p.type,
   art:`/amazon/static/catalog500/${p.id}.svg`,format:'physical',release:null,availability:'In Stock',
   about:[p.description,...Object.entries(p.specs).map(([k,v])=>`${k}: ${v}`)],rating:{stars:4.2+(i%6)/10,count:String(40+i)},
 }))].map((p,i)=>enrichProduct({...p,rank:150+i,addedDate:'2026-10-02'},products.length+i))
 products.push(...extra)
}
