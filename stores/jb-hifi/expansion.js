import { makeGameFixtures, CATALOG_PLATFORMS } from '../../lib/expanded-games.js'
import { merchandiseFor, compactPages } from '../bestbuy/expanded-merchandise.js'
import { merchandisingPlatform, otherType } from '../bestbuy/expansion.js'
export { CATALOG_PLATFORMS, merchandisingPlatform, compactPages }
export const isGame=p=>p.catalogType==='game'||p.kind==='game'||/ games$/i.test(p.type)
const departments={computing:'Computers & Tablets',display:'TVs & Home Theatre',audio:'Headphones & Audio',mobile:'Mobile Phones',camera:'Cameras','smart-home':'Smart Home',appliances:'Home Appliances',gaming:'Gaming'}
export function expandJB(original){
 const games=original.filter(isGame)
 const base=(p,i)=>({...p,id:String(992000+i),slug:p.id,kind:'other',deliveryFrom:4.99,badges:[],cta:p.stock?'Add to cart':'Out of stock',orderable:p.stock>0,release:null,releaseLong:null,rating:null,stars:'4.4',reviews:24,notice:[],attributes:{},campaigns:[],description:[p.description],specs:Object.entries(p.specs)})
 const newGames=makeGameFixtures({count:250-games.length,existingPlatforms:games.map(merchandisingPlatform),excludedTitles:games.map(p=>p.title)}).map((p,i)=>({...base(p,i),title:p.gameTitle,subtitle:p.platformLabel,crumbs:['Gaming',`${p.platformLabel} games`],type:`${p.platformLabel} games`,family:'released-games',brand:p.publisher,platformName:p.platformLabel,price:Math.round(p.price*1.5*100)/100}))
 const other=merchandiseFor('jb',250-(original.length-games.length)).map((p,i)=>({...base(p,300+i),catalogType:otherType(p),subtitle:p.type,crumbs:[p.section==='mobile'&&p.type==='Wearables'?'Wearables':departments[p.section],p.type],type:p.type,family:p.family,brand:p.brand,price:Math.round(p.price*1.5*100)/100,art:`/jb-hifi/static/catalog500/${p.id}.svg`,attributes:{Colour:p.specs.Colour},campaigns:[]}))
 return [...newGames,...other]
}
