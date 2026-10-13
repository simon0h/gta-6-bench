import { makeGameFixtures, CATALOG_PLATFORMS } from '../../lib/expanded-games.js'
import { merchandiseFor, compactPages } from '../bestbuy/expanded-merchandise.js'
import { merchandisingPlatform, otherType } from '../bestbuy/expansion.js'
export { CATALOG_PLATFORMS, merchandisingPlatform, compactPages }
export const isGame=p=>p.catalogType==='game'||p.group==='Games'
const departments={computing:'technology',display:'technology',audio:'technology',mobile:'technology',camera:'technology','smart-home':'technology',appliances:'appliances',gaming:'gaming',toys:'toys',baby:'baby',home:'home-and-furniture',outdoor:'sports-and-outdoors'}
const names={technology:'Technology',appliances:'Appliances',gaming:'Gaming',toys:'Toys',baby:'Baby','home-and-furniture':'Home & furniture','sports-and-outdoors':'Sports & outdoors'}
export function expandArgos(original){
 const games=original.filter(isGame)
 const newGames=makeGameFixtures({count:250-games.length,existingPlatforms:games.map(merchandisingPlatform),excludedTitles:games.map(p=>p.title)}).map((p,i)=>({...p,sku:String(9800001+i),unit_price:p.price,department:'gaming',category:'Gaming',family:'Video games',group:'Games',brand:p.publisher,pegi:null,methods:['ship','pickup'],rating:4.4,reviews:24,included:`One ${p.formatLabel.toLowerCase()} for ${p.platformLabel}.`,guarantee:'See product support for assistance.'}))
 const other=merchandiseFor('argos',250-(original.length-games.length)).map((p,i)=>({...p,sku:String(9810001+i),unit_price:p.price,department:departments[p.section],category:names[departments[p.section]],family:p.type,group:p.type,kind:'other',catalogType:otherType(p),pegi:null,methods:['ship','pickup'],rating:4.5,reviews:24,included:'Product and instructions; additional contents described in specifications.',guarantee:'1 year manufacturer guarantee',art:`/argos/static/catalog500/${p.id}.svg`}))
 return [...newGames,...other]
}
