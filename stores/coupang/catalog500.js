import { makeGameFixtures } from '../../lib/expanded-games.js'
import { koreanRetailFixtures } from '../../lib/expanded-korean-retail.js'
export function expandCatalog(original) {
 const games=original.filter(p=>p.category==='software')
 const newGames=makeGameFixtures({count:250-games.length,existingPlatforms:games.map(p=>p.platform)}).map((g,i)=>({
  ...g,id:`cp-${g.id}`,sku:`CP-${g.id.toUpperCase()}`,title:g.titleKo,price:Math.round(g.price*1300/100)*100,
  category:'software',brand:g.publisher,art:'game',catalogArt:g.art,label:`${g.platformLabel} · ${g.formatLabel}`,
  aliases:`${g.keywords} 게임 ${g.genreKo}`,delivery:'seller',seller:'게임셀렉트',rating:4+(i%10)/10,reviews:18+i*3,
  condition:'new',sales:120+i,newness:140+i,shipping:0,maxQty:4,
  description:`${g.genreKo} 게임. ${g.platformLabel} 전용 ${g.formatLabel}. ${g.description}`,
  specs:{'플랫폼':g.platformLabel,'장르':g.genreKo,'구성':g.formatLabel,'제작사':g.publisher,'언어':'영어','출시일':g.release}
 }))
 const others=koreanRetailFixtures(250-(original.length-games.length)).map((p,i)=>({
  ...p,id:`cp-${p.id}`,sku:`CP-${p.id.toUpperCase()}`,kind:'other',catalogType:'other',platform:'',
  catalogArt:`/static/art/catalog500/retail/${p.id}.svg`,label:p.title,aliases:`${p.brand} ${p.title}`,
  delivery:i%3?'rocket':'seller',seller:p.brand,rating:4+(i%10)/10,reviews:25+i*2,condition:'new',
  sales:90+i,newness:130+i,listPrice:Math.ceil(p.price*1.15/100)*100,shipping:0,maxQty:4,
 }))
 return [...newGames,...others]
}
