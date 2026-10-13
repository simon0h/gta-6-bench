import { CATALOG_MODE, fixtureCatalog, getCatalogEvidence } from './catalog-policy.js'

// Actual catalog adapters, not a second set of product data. The fixed counts
// describe only the historical fixtures; reference catalogs have evidence-led sizes.
export const STORE_CATALOG_RULES=[
 ['amazon','Amazon',250],['walmart','Walmart',250],['target','Target',250],['bestbuy','Best Buy',250],
 ['gamestop','GameStop',250],['game-uk','GAME',250],['argos','Argos',250],['smyths-toys','Smyths Toys',250],
 ['eb-games-au','EB Games Australia',250],['jb-hifi','JB Hi-Fi',250],['coupang','Coupang',250],['gmarket','Gmarket',250],
 ['rockstar-store','Rockstar Store',250],['playstation-store','PlayStation Store',300],['xbox-store','Xbox Store',300],
 ['ikea','IKEA',0],['nike','Nike',0],['sephora','Sephora',0],['chewy','Chewy',0],['williams-sonoma','Williams Sonoma',0],
].map(([slug,name,games])=>({slug,name,total:fixtureCatalog?500:null,games:fixtureCatalog?games:null,other:fixtureCatalog?500-games:null}))
export async function readStoreInventories(){return Promise.all(STORE_CATALOG_RULES.map(async rule=>{
 const {inventory}=await import(`../stores/${rule.slug}/inventory.js`)
 if(fixtureCatalog)return {...rule,mode:CATALOG_MODE,inventory}
 const evidence=getCatalogEvidence(rule.slug)
 const rows=inventory.map(product=>{
  const record=evidence[String(product.id)]
  if(!record)throw new Error(`Reference inventory has no source evidence: ${rule.slug}/${product.id}`)
  return {...product,available:['preorder','in_stock'].includes(record.availability)?true:record.availability==='out_of_stock'?false:null,
   availability:record.availability||'unknown',purchase:record.purchase||'unverified',stock_quantity:null,evidence:record}
 })
 return {...rule,mode:CATALOG_MODE,total:rows.length,games:rows.filter(p=>p.type==='game').length,other:rows.filter(p=>p.type!=='game').length,inventory:rows}
}))}
