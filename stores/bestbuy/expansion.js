import { makeGameFixtures, CATALOG_PLATFORMS } from '../../lib/expanded-games.js'
import { merchandiseFor } from './expanded-merchandise.js'
export { CATALOG_PLATFORMS }
export const merchandisingPlatform = p => p.catalogPlatform || p.platform || (/playstation 5|\bps5\b/i.test(`${p.title} ${p.type}`) ? 'ps5' : /xbox series/i.test(p.title) ? 'xbox' : /switch 2/i.test(p.title) ? 'switch-2' : /switch/i.test(p.title) ? 'switch' : null)
export const isGame = p => p.catalogType === 'game' || p.kind === 'game' || p.category === 'Physical Video Games'
export const otherType = p => [p.category,p.type,p.family].some(value=>/^(?:gaming )?consoles?$/i.test(value||'')) ? 'console' : /controller|headset|charging|gaming accessor|game-card|racing wheel|joystick|console carry|vr headset/i.test(p.title) ? 'accessory' : 'other'
const department={computing:'computers-tablets',display:'tv-home-theater',audio:'headphones-audio',mobile:'phones-wearables',camera:'cameras','smart-home':'smart-home',appliances:'appliances',gaming:'gaming'}
export function expandBestbuy(original){
 const games=original.filter(isGame)
 const newGames=makeGameFixtures({count:250-games.length,existingPlatforms:games.map(merchandisingPlatform),excludedTitles:games.map(p=>p.title)}).map((p,i)=>({...p,id:`BBYC500G${i+1}`,sku:String(7800001+i),slug:p.id,pageTitle:p.title,family:'catalog-games',department:'gaming',category:'Physical Video Games',brand:p.publisher,model:`GAME-${p.id}`,rank:100+i,esrb:p.age,softwareFormat:p.formatLabel,preorder:false,finalSale:false,condition:'New',methodStock:{pickup:4,shipping:p.stock},rating:{stars:4.4,count:24},about:[p.description],features:Object.entries(p.specs).map(([name,text])=>({name,text})),returnPolicy:'See help for standard product returns.'}))
 const other=merchandiseFor('bestbuy',250-(original.length-games.length)).map((p,i)=>({...p,id:`BBYC500M${i+1}`,sku:String(7900001+i),slug:p.id,pageTitle:p.title,kind:'other',catalogType:otherType(p),department:department[p.section],category:p.type,model:`DESIGN-${p.id}`,rank:400+i,art:`/bestbuy/static/catalog500/${p.id}.svg`,preorder:false,finalSale:false,condition:'New',methodStock:{pickup:p.stock?4:0,shipping:p.stock},rating:{stars:4.4,count:20+i},about:[p.description],features:Object.entries(p.specs).map(([name,text])=>({name,text})),returnPolicy:'See help for standard product returns.'}))
 return [...newGames,...other]
}
