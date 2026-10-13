import { makeGameFixtures, CATALOG_PLATFORMS } from '../../lib/expanded-games.js'
import { hardwareFixtures } from '../gamestop/catalog500-hardware.js'
import { canonicalProducts } from './canonical-products.js'
const platforms={'PlayStation 5':'ps5','Xbox Series X':'xbox','Nintendo Switch':'switch'}
export function expandEB(products) {
  for(const p of products){p.catalogType=p.type==='game'?'game':['console','handheld'].includes(p.type)?'console':p.category==='Gaming Accessories'||['sleeves','binder'].includes(p.type)?'accessory':'other';p.catalogPlatform=platforms[p.platform]||null}
  const existing=[...canonicalProducts.map(p=>p.platform),...products.filter(p=>p.catalogType==='game').map(p=>p.catalogPlatform)]
  const games=makeGameFixtures({count:250-existing.length,existingPlatforms:existing,excludedTitles:products.filter(p=>p.catalogType==='game').map(p=>p.title)})
  products.push(...games.map((p,index)=>({...p,sku:String(391000+index),type:'game',category:'Video Games',brand:p.publisher,platform:p.platformLabel,price:Math.round(p.price*1.5*100)/100,condition:'New',delivery:true,pickup:true,photo:null,rating:4.4,reviews:18,preorder:false,catalogRange:'game-retail-500',specs:{...p.specs,Format:p.catalogPlatform==='xbox'?'Download code in box':p.formatLabel,Region:'Australia'}})))
  const remaining=250-products.filter(p=>p.catalogType!=='game').length
  products.push(...hardwareFixtures.slice(0,remaining).map((p,index)=>({...p,sku:String(392000+index),kind:'other',category:p.catalogType==='console'?'Consoles':'Gaming Accessories',brand:'Atrix',platform:p.catalogPlatform==='pc'?'PC':CATALOG_PLATFORMS.find(platform=>platform.id===p.catalogPlatform)?.label||'All platforms',condition:p.condition==='Refurbished'?'Preowned':p.condition,price:Math.round(p.price*1.5*100)/100,release:'2026-09-01',delivery:true,pickup:true,rating:4.4,reviews:18,preorder:false})))
}
