import { addedGames, otherFixtures, classify, platformOf, slug } from '../amazon/assortment500.js'
export function expandCatalog(products) {
 for(const p of products){p.catalogType=classify(p);p.catalogPlatform=platformOf(p)}
 const others=products.filter(p=>!p.addon&&p.catalogType!=='game').length
 const games=addedGames(products).map(p=>({...p,department:'video-games',type:'Video Games',brand:p.publisher,material:p.formatLabel,format:p.formatLabel==='Game card'?'cartridge':p.formatLabel==='Download code'?'download':'disc'}))
 const retail=otherFixtures('target',250-others).map(p=>({...p,art:`/target/static/catalog500/${p.id}.svg`,format:'physical'}))
 products.push(...[...games,...retail].map((p,i)=>({
   ...p,tcin:String(920000001+i),family:p.id,slug:slug(p.title),kind:'other',catalog500:true,preorder:false,release:null,limit:5,restricted:false,
   rating:{score:(4.2+(i%6)/10).toFixed(1),text:`${(4.2+(i%6)/10).toFixed(1)} out of 5 stars`,count:35+i,loved:'useful details'},
   specs:[['Brand',p.brand],['Product type',p.type],['Material / form',p.material],...Object.entries(p.specs),['Sold and shipped by','Target']],
   highlights:[p.description,...Object.entries(p.specs).map(([k,v])=>`${k}: ${v}`)],description:p.description,
   crumbs:[p.department,p.type],glance:p.type,questions:0,esp:false,seller:'Target',
   shippingNote:'Standard shipping is available. Pickup and same-day delivery are not offered for this item.',
   returns:'Eligible unopened items may be returned within 90 days. Food and personal-care exceptions apply; contact Target Help.',
   eta:'Arrives in 3–5 business days',keywords:`${p.keywords||''} ${p.title} ${p.type} ${p.department} ${p.material}`,isNew:true,
 })))
}
