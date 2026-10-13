import { makeGameFixtures } from '../../lib/expanded-games.js'
import { hardwareFixtures } from './catalog500-hardware.js'

export function expandGameStop(products) {
  for(const p of products) {
    p.catalogType=p.department==='video-games'?'game':p.department==='consoles-hardware'?'console':['gaming-accessories','pc-gaming'].includes(p.department)?'accessory':'other'
    p.catalogPlatform=p.platforms?.[0] || (p.catalogType==='game'?'retro':null)
  }
  const games=products.filter(p=>p.catalogType==='game')
  const gameAdditions=makeGameFixtures({count:250-games.length,existingPlatforms:games.map(p=>p.catalogPlatform),excludedTitles:games.map(p=>p.title)})
  products.push(...gameAdditions.map(p=>({...p,id:`gs-${p.id}`,slug:p.id,department:'video-games',family:'physical-game',category:'video-games',categoryName:'Video Games',brand:p.publisher,platforms:[p.catalogPlatform],format:p.catalogPlatform==='xbox'?'code-in-box':p.formatLabel==='Game card'?'cartridge':'disc',photo:null,
    specs:{...p.specs,Format:p.catalogPlatform==='xbox'?'Download code in box':p.formatLabel,Region:'United States'},features:[p.description,...Object.entries(p.specs).map(([k,v])=>`${k}: ${v}.`)],preorder:false,condition:'New',fulfillment:['shipping'],rating:4.4,reviews:24,catalogRange:'game-retail-500'})))
  const remaining=250-products.filter(p=>p.catalogType!=='game').length
  products.push(...hardwareFixtures.slice(0,remaining).map(p=>({...p,id:`gs-${p.id}`,kind:'other',slug:p.id,department:p.catalogType==='console'?'consoles-hardware':p.catalogPlatform&&p.catalogPlatform!=='pc'?'gaming-accessories':'pc-gaming',family:p.type,category:p.category,categoryName:p.category,platforms:p.catalogPlatform?[p.catalogPlatform]:[],brand:p.category==='Consoles'?'Retro Circuit':'CoreTech',features:Object.entries(p.specs).map(([k,v])=>`${k}: ${v}.`),preorder:false,fulfillment:['shipping'],rating:4.4,reviews:18})))
}
