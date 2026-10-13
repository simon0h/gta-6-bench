import { makeGameFixtures, CATALOG_PLATFORMS } from '../../lib/expanded-games.js'
import { merchandiseFor, compactPages } from '../bestbuy/expanded-merchandise.js'
import { merchandisingPlatform, otherType } from '../bestbuy/expansion.js'
export { CATALOG_PLATFORMS, merchandisingPlatform, compactPages }
export const isGame=p=>p.catalogType==='game'||p.kind==='game'||p.category==='Released games'
const departments={gaming:'Gaming & Tech',toys:'Toys',baby:'Baby Room',outdoor:'Outdoor'}
export function expandSmyths(original,canonical){
 const games=[...original,...canonical].filter(isGame)
 const base=(p,i)=>({...p,sku:String(270001+i),kind:'other',unit_price:p.price,deliveryStock:p.stock,collectionStock:{beckton:p.stock?4:0,salford:p.stock?3:0},rating:4.4,reviews:24,path:`/catalog/${270001+i}`,options:[],variants:[],maxAge:99})
 const newGames=makeGameFixtures({count:250-games.length,existingPlatforms:games.map(merchandisingPlatform),excludedTitles:games.map(p=>p.title)}).map((p,i)=>({...base(p,i),department:'Gaming & Tech',category:'Released games',family:'released-games',brand:p.publisher,minAge:p.age==='T'?13:p.age==='E10+'?10:6,features:Object.entries(p.specs).map(([key,value])=>`${key}: ${value}`),dimensions:`${p.formatLabel}; ${p.players}; ${p.platformLabel}`}))
 const other=merchandiseFor('smyths',250-(original.length+canonical.length-games.length)).map((p,i)=>({...base(p,300+i),catalogType:otherType(p),department:departments[p.section],category:p.type,family:p.family,minAge:p.minAge,features:Object.entries(p.specs).map(([key,value])=>`${key}: ${value}`),dimensions:p.specs.Design,art:`/smyths-toys/static/catalog500/${p.id}.svg`}))
 return [...newGames,...other]
}
