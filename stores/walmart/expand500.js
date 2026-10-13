import { addedGames, otherFixtures, classify, platformOf, slug } from '../amazon/assortment500.js'
export function expandCatalog(products) {
 for(const p of products){p.catalogType=classify(p);p.catalogPlatform=platformOf(p)}
 const others=products.filter(p=>p.catalogType!=='game').length
 const games=addedGames(products).map(p=>({...p,department:'games',type:'Video Games',category:'Video Games',brand:p.publisher,esrb:p.age,format:p.formatLabel==='Game card'?'cartridge':p.formatLabel==='Download code'?'download':'disc'}))
 const retail=otherFixtures('walmart',250-others).map(p=>({...p,category:p.type,art:`/walmart/static/catalog500/${p.id}.svg`,format:'physical'}))
 products.push(...[...games,...retail].map((p,i)=>({
   ...p,id:String(350000001+i),family:p.id,slug:slug(p.title),kind:'other',catalog500:true,rank:250+i,
   preorder:false,cta:'Add',tileBadge:null,pdpBadges:[],cartBadges:[],wasPrice:null,
   rating:4.2+(i%6)/10,ratings:35+i,reviews:0,reviewEntries:[],fulfillment:['shipping'],sellerId:'walmart',
   arrival:{short:'in 2–3 days',day:'in 2–3 days',full:'in 2–3 days'},shippingText:'Free shipping, arrives in 2–3 days',
   specs:{...p.specs,...(p.catalogType==='game'?{'Original release':p.release}:{}),Brand:p.brand},
   features:[p.description,...Object.entries(p.specs).map(([k,v])=>`${k}: ${v}`)],crumbs:[p.department==='games'?'Video Games':p.department,p.type],
   returnPolicy:'Eligible unopened items may be returned within 90 days. Food and personal-care exceptions apply; contact Customer Care.',
   keywords:`${p.keywords||''} ${p.title} ${p.type} ${p.department} ${p.material||''}`,
 })))
}
