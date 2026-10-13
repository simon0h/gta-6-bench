import { makeGameFixtures } from '../../lib/expanded-games.js'
import { koreanRetailFixtures } from '../../lib/expanded-korean-retail.js'
export const gamePlatform=p=>p.catalogPlatform||p.platform||({'gta5-xbox':'xbox','gm-astro':'ps5','gm-racing':'ps5','gm-horizon':'ps5','gm-minecraft':'xbox'}[p.sku])||null
const departments={pantry:['food','pantry','grocery','한들장터'],snacks:['food','pantry','grocery','한들장터'],tableware:['home','kitchen','living','리빙셀렉트'],cookware:['home','kitchen','living','리빙셀렉트'],cleaning:['home','living','living','리빙셀렉트'],bedding:['home','living','living','리빙셀렉트'],bags:['fashion-beauty','bags','fashion','스타일에디트'],skincare:['fashion-beauty','skincare','beauty','뷰티앤포켓'],bodycare:['fashion-beauty','skincare','beauty','뷰티앤포켓'],fitness:['sports','fitness','outdoor','아웃앤무브'],outdoor:['sports','camping','outdoor','아웃앤무브'],office:['home','stationery','stationery','페이퍼스튜디오'],building:['kids','toys','kids','리틀플레이'],petcare:['home','pets','pet','펫데이'],caraccessories:['auto','car','tools','로드앤툴']}
const metrics=i=>({rating:4+(i%10)/10,reviews:15+i*2,sales:200+i,recommended:300+i,added:200+i,stock:8+i%12,condition:'new',imported:false,delivery:i%3?'star':'standard',shippingFee:i%3?0:3000,deal:i%7===0,color:['#658eae','#8b9a78','#a89880'][i%3]})
export function expandCatalog(original) {
 const games=original.filter(p=>p.leaf==='games')
 const newGames=makeGameFixtures({count:250-games.length,existingPlatforms:games.map(gamePlatform)}).map((g,i)=>({
  ...g,...metrics(i),sku:`gm-${g.id}`,title:g.titleKo,unit_price:Math.round(g.price*1300/100)*100,
  department:'digital',leaf:'games',category:'games',brand:g.publisher,sellerId:'games',seller:'게임셀렉트',
  illustration:'game',catalogArt:g.art,specs:[['플랫폼',g.platformLabel],['장르',g.genreKo],['구성',g.formatLabel],['제작사',g.publisher],['언어','영어'],['출시일',g.release]],
 }))
 const others=koreanRetailFixtures(250-(original.length-games.length)).map((p,i)=>{
  const [department,leaf,sellerId,seller]=departments[p.category]
  return {...p,...metrics(i),sku:`gm-${p.id}`,kind:'other',catalogType:'other',unit_price:p.price,department,leaf,
   category:department,brand:p.brand,sellerId,seller,illustration:p.art,catalogArt:`/static/art/catalog500/retail/${p.id}.svg`,specs:[['브랜드',p.brand],...Object.entries(p.specs)]}
 })
 return [...newGames,...others]
}
