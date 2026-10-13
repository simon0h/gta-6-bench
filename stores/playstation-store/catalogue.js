import { CATALOG_PLATFORMS, GAME_SEEDS } from '../../lib/expanded-games.js'
import { fixtureCatalog } from '../../lib/catalog-policy.js'
import { SHELF_COLLECTIONS } from './shelf.js'
// Local catalogue snapshot: authored prices, ranks and ratings; public compatibility sources
// are recorded in research/depth/playstation-store-catalog.md. Fiction has matching original art.
const rows = [
 ['fortnite','Fortnite',0,'Epic Games','7/21/2017','Shooter','T',['PS5','PS4'],2,100,false],
 ['roblox','Roblox',0,'Roblox Corporation','10/10/2023','Adventure','T',['PS5','PS4'],1,30,false],
 ['apex-legends','Apex Legends',0,'Electronic Arts','3/29/2022','Shooter','T',['PS5'],1,60,false],
 ['warframe','Warframe',0,'Digital Extremes','11/26/2020','Action','M',['PS5','PS4'],1,4,false],
 ['marvel-rivals','Marvel Rivals',0,'NetEase Games','12/6/2024','Shooter','T',['PS5'],1,12,false],
 ['genshin-impact','Genshin Impact',0,'HoYoverse','4/28/2021','Role Playing Games','T',['PS5'],1,4,false],
 ['rainbow-six-siege','Tom Clancy’s Rainbow Six Siege',0,'Ubisoft','6/10/2025','Shooter','M',['PS5'],1,10,true],
 ['efootball','eFootball',0,'KONAMI','9/30/2021','Sport','E',['PS5','PS4'],4,6,false],
 ['minecraft','Minecraft',19.99,'Mojang','10/22/2024','Adventure','E10+',['PS5'],4,8,true],
 ['diablo-iv','Diablo IV',49.99,'Blizzard Entertainment','6/6/2023','Role Playing Games','M',['PS5','PS4'],2,4,true],
 ['baldurs-gate-3','Baldur’s Gate 3',48.99,'Larian Studios','9/6/2023','Role Playing Games','M',['PS5'],2,4,true],
 ['borderlands-4','Borderlands 4',69.99,'2K','9/12/2025','Shooter','M',['PS5'],2,4,true],
 ['dragon-ball-sparking-zero','DRAGON BALL: Sparking! ZERO',49.99,'Bandai Namco Entertainment','10/10/2024','Fighting','T',['PS5'],2,2,true],
 ['wwe-2k26','WWE 2K26',69.99,'2K','3/13/2026','Sport','T',['PS5'],4,8,true],
 ['mlb-the-show-26','MLB The Show 26',69.99,'Sony Interactive Entertainment','3/17/2026','Sport','E',['PS5'],4,8,true],
 ['starfall-expedition','Starfall Expedition',29.99,'Northstar Interactive','9/18/2026','Adventure','T',['PS5'],1,0,false],
 ['apex-rally','Apex Rally',24.99,'Summit Circuit','8/14/2026','Driving/Racing','E',['PS5','PS4'],2,8,true],
 ['pocket-garden','Pocket Garden',14.99,'Little Orchard','9/25/2026','Simulation','E',['PS5','PS4'],2,0,false],
 ['lanterns-of-aster','Lanterns of Aster',34.99,'Aster House','7/10/2026','Role Playing Games','T',['PS5'],1,0,false],
 ['neon-circuit','Neon Circuit',19.99,'Nightline Games','6/12/2026','Driving/Racing','E10+',['PS5'],4,8,true],
 ['harbor-builder','Harbor Builder',24.99,'Tidepool Studio','9/4/2026','Strategy','E',['PS5','PS4'],1,0,false],
]
const copy = {
 fortnite:'Play community experiences and squad up for Battle Royale. An Epic account and internet connection are required.',
 roblox:'Explore a library of community-created experiences. Experience availability and content ratings vary; a Roblox account is required.',
 'apex-legends':'Choose your legend and compete in team-based battle royale matches.', warframe:'Build your arsenal and explore a science-fiction system with a cooperative squad.',
 'marvel-rivals':'Assemble a team of Marvel heroes and villains for competitive team battles.', 'genshin-impact':'Explore Teyvat, meet new companions and build an elemental team.',
 'rainbow-six-siege':'Free access includes selected modes. Ranked access and additional content may require an upgrade. Ubisoft account required.',
 efootball:'Build your football team and play exhibition or online matches.', minecraft:'Create, explore and survive in a world made of blocks. Online play supports up to eight players.',
 'diablo-iv':'Build your hero and explore Sanctuary. Internet and Battle.net account required, including for solo play.',
 'baldurs-gate-3':'Gather a party and shape a story through turn-based combat, exploration and choices.',
 'borderlands-4':'Explore Kairos as a Vault Hunter, collecting weapons and joining friends in cooperative action.',
 'dragon-ball-sparking-zero':'Fight cinematic arena battles and explore branching Dragon Ball stories.',
 'wwe-2k26':'Take your favorite Superstars into the ring in local and online matches.', 'mlb-the-show-26':'Build a baseball career, manage a team and take the field with friends.',
 'starfall-expedition':'Chart an alien valley, recover lost survey stations and discover the story of a vanished expedition.',
 'apex-rally':'Master forest gravel and mountain stages in solo time trials or split-screen racing.',
 'pocket-garden':'Plant a cottage garden, meet woodland visitors and decorate a peaceful home with a friend.',
 'lanterns-of-aster':'Follow glowing lanterns through an enchanted forest, solving puzzles and shaping your own journey.',
 'neon-circuit':'Race across elevated neon tracks in a fast arcade championship for up to four local players.',
 'harbor-builder':'Design a thriving coastal town, connect trade routes and balance the needs of a growing harbor.',
}
export const EXTRA_PRODUCTS = rows.map(([family,title,price,publisher,release,genres,rating,platforms,localPlayers,onlinePlayers,plusRequired],i) => {
 const fictional=i>=15
 return {id:`BENCH-${family.toUpperCase()}`,family,ordinary:true,fictional,kind:'other',format:'digital',title,price,publisher,release,genres,rating,platforms,localPlayers,onlinePlayers,plusRequired,onlineRequired:price===0&&family!=='efootball'||family==='diablo-iv',type:'FULL GAME',contentType:'base-game',cta:'cart',chips:platforms,editionName:'Standard Edition',bullets:[copy[family]],keywords:`${family.replaceAll('-',' ')} ${genres} ${fictional?'autumn indie':''}`,art:`/playstation-store/static/covers/${family}.svg`,photo:fictional?`digital-${family}`:null,features:[...(localPlayers>1?['Local Multiplayer']:[]),...(onlinePlayers>0?['Online Multiplayer']:[]),...(['minecraft','dragon-ball-sparking-zero','wwe-2k26'].includes(family)||fictional?['Remote Play']:[])],accessibility:fictional?Object.fromEntries(platforms.map(platform=>[platform,platform==='PS5'?['Subtitles and text size','Controller remapping','Separate volume controls','Adjustable difficulty']:['Subtitles','Separate volume controls']])):family==='minecraft'?{PS5:['Clear Text','Volume Controls','Screen Reader (Basic)','Controller Remapping (Basic)','Manual Saving']}:{},...(family==='baldurs-gate-3'?{originalPrice:69.99}:{}),...(fictional&&i%2===0?{originalPrice:price+10}:{}),...(fictional&&i%2===1?{plusTag:'Extra',plusAdded:'2026-09-15'}:{})}
})
export function enrichCatalogue(baseline) {
 const out=[...baseline,...EXTRA_PRODUCTS]
 for(const [i,p] of out.entries()) {
  p.family ??= p.id.includes('GTAVI')||p.id.includes('ULTEDTION')?'gta-vi':p.id.includes('GTAVCASH')?'gta-online':p.id.includes('GTAVSTORY')||p.id.includes('GTAOSTAND')?'gta-online':p.id.includes('GTAVSTAND')?'gta-v':p.id.includes('TRILOGY')?'gta-trilogy':p.id==='BENCH-ASTRO-BOT'?'astro-bot':p.title==='Gran Turismo 7'?'gran-turismo-7':'helldivers-2'
  if(['astro-bot','gran-turismo-7','helldivers-2','minecraft','fortnite','roblox'].includes(p.family))p.photo=`digital-${p.family}`
  if(p.family==='gta-v')p.photo='digital-rockstar-gta-v'
  p.ordinary ??= i>=10
  p.platforms ??= p.chips.filter(v=>['PS5','PS4'].includes(v))
  p.contentType ??= p.type==='VIRTUAL CURRENCY'?'consumable':p.type==='ADD-ON PACK'||p.cta==='unavailable'?'add-on':'base-game'
  p.rating ??= 'M'
  p.localPlayers ??= p.family==='gran-turismo-7'?2:1
  p.onlinePlayers ??= p.family==='helldivers-2'?4:p.family==='gran-turismo-7'?20:['gta-online','gta-v'].includes(p.family)?30:0
  p.plusRequired ??= p.onlinePlayers>0
  p.onlineRequired ??= ['helldivers-2','gta-online'].includes(p.family)
  p.features ??= p.family==='gta-vi'?['Remote Play','PS5 Pro Enhanced']:p.family==='gran-turismo-7'?['Local Multiplayer','Online Multiplayer','Remote Play']:p.family==='helldivers-2'?['Online Multiplayer']:p.family==='astro-bot'?['Game Help']:[]
  p.vr ??= p.family==='gran-turismo-7'?'PS VR2 optional':'No VR'
  p.editionName ??= 'Standard Edition'
  p.entitlements ??= p.platforms.map(v=>`${v} digital license`)
  p.accessibility ??= {}
  p.originalPrice ??= p.price
  p.bestRank=i+1; p.downloadRank=p.price===0?i:i+40
  p.ratingCount=120+i*73
  p.distribution=[55+i%12,24-i%12,12,6,3]
  p.score=Number((p.distribution.reduce((n,v,j)=>n+v*(5-j),0)/100).toFixed(1))
  p.available=p.cta!=='unavailable'&&p.price!==null
  if(p.contentType!=='base-game')p.baseId=p.family==='gta-vi'?'EP1004-PPSA01547_00-GTAVISTANDARD001':'UP1004-PPSA03420_00-GTAOSTANDALONE01'
 }
 const garden=out.find(p=>p.family==='pocket-garden')
 out.push({...garden,id:'BENCH-POCKET-GARDEN-DELUXE',title:'Pocket Garden Deluxe Edition',editionName:'Deluxe Edition',price:24.99,originalPrice:34.99,plusTag:null,plusAdded:null,entitlements:[...garden.entitlements,'Autumn Greenhouse add-on'],includedSkus:['BENCH-POCKET-GARDEN','BENCH-POCKET-GARDEN-GREENHOUSE'],bullets:['Pocket Garden base game','Autumn Greenhouse expansion with new plants and decoration'],contentType:'base-game'})
 out.push({...garden,id:'BENCH-POCKET-GARDEN-GREENHOUSE',title:'Pocket Garden: Autumn Greenhouse',editionName:'Autumn Greenhouse',price:9.99,originalPrice:9.99,type:'ADD-ON PACK',contentType:'add-on',baseId:garden.id,entitlements:['Autumn Greenhouse add-on for PS5 and PS4'],bullets:['Requires Pocket Garden, sold separately.','A new greenhouse, seasonal plants and decorative items.'],plusTag:null})
 const minecraft=out.find(p=>p.family==='minecraft')
 out.push({...minecraft,id:'BENCH-MINECRAFT-PS4',title:'Minecraft – PS4 Edition',editionName:'PS4 Standard Edition',platforms:['PS4'],chips:['PS4'],entitlements:['PS4 digital license'],release:'9/4/2014',accessibility:{}})
 return out
}
// Reference mode lists only facets the PlayStation Store assortment actually has.
const REFERENCE_FILTERS = [
 ['price','Price',[['free','Free'],['under20','Under $20'],['20to40','$20–$40'],['over40','Over $40'],['sale','On sale']]],
 ['genre','Genre',['Action','Adventure','Driving/Racing','Family','Fighting','Horror','Music/Rhythm','Party','Puzzle','Role Playing Games','Shooter','Simulation','Sport','Strategy'].map(v=>[v,v])],
 ['platform','Platform',[['PS5','PS5'],['PS4','PS4']]],
 ['feature','Supported Features',['PS5 Pro Enhanced','Remote Play','Game Help','Local Multiplayer','Online Multiplayer'].map(v=>[v,v])],
 ['release','Release Date',[['recent','Last 90 days'],['2026','Released in 2026'],['older','Before 2026'],['upcoming','Coming soon']]],
 ['vr','VR',[['PS VR2 required','PS VR2 required'],['PS VR2 optional','PS VR2 optional'],['No VR','No VR required']]],
 ['age','Age Rating',[['E','Everyone'],['E10+','Everyone 10+'],['T','Teen'],['M','Mature']]],
 ['content','Content Type',['FULL GAME','PRE-ORDER','FREE','PREMIUM EDITION','GAME BUNDLE','ADD-ON','SEASON PASS','VIRTUAL CURRENCY','SUBSCRIPTION'].map(v=>[v,v])],
 ['plus','PS Plus',[['Extra','Game Catalog – Extra'],['Premium','Classics Catalog – Premium']]],
]
const FIXTURE_FILTERS = [
 ['price','Price',[['free','Free'],['under20','Under $20'],['20to40','$20–$40'],['over40','Over $40'],['sale','On sale']]],
 ['genre','Genre',[...new Set(['Action','Adventure','Shooter','Driving/Racing','Role Playing Games','Sport','Fighting','Simulation','Strategy',...GAME_SEEDS.map(p=>p.genre)])].map(v=>[v,v])],
 ['platform','Platform',CATALOG_PLATFORMS.map(p=>[p.short,p.short])],
 ['feature','Supported Features',['PS5 Pro Enhanced','Remote Play','Game Help','Local Multiplayer','Online Multiplayer'].map(v=>[v,v])],
 ['release','Release Date',[['recent','Last 90 days'],['2026','Released in 2026'],['older','Before 2026'],['upcoming','Coming soon']]],
 ['vr','VR',[['PS VR2 optional','PS VR2 optional'],['No VR','No VR required']]],
 ['age','Age Rating',[['E','Everyone'],['E10+','Everyone 10+'],['T','Teen'],['M','Mature'],['RP','Rating Pending']]],
 ['content','Content Type',['FULL GAME','PRE-ORDER','ADD-ON PACK','GAME BUNDLE','VIRTUAL CURRENCY','PHYSICAL GAME','CONSOLE','ACCESSORY'].map(v=>[v,v])],
 ['plus','PS Plus Discovery',[['Extra','Game Catalog – Extra'],['Premium','Premium']]],
]
export const FILTERS = fixtureCatalog ? FIXTURE_FILTERS : REFERENCE_FILTERS
export const SORTS=[['relevance','Relevance'],['best-selling','Best Selling'],['most-downloaded','Most Downloaded'],['name','Name: A–Z'],['name-desc','Name: Z–A'],['release-desc','Release Date: New–Old'],['release-asc','Release Date: Old–New'],['plus-recent','Recently Added to PS Plus'],['price-asc','Price: low to high'],['price-desc','Price: high to low']]
export function cleanOptions(options={}) {
 const clean={}
 for(const [key,,values] of FILTERS)if(typeof options[key]==='string'&&values.some(([v])=>v===options[key]))clean[key]=options[key]
 if(SORTS.some(([v])=>v===options.sort))clean.sort=options.sort
 clean.page=typeof options.page==='string'&&/^\d{1,5}$/.test(options.page)?Math.max(1,Number(options.page)):1
 return clean
}
const NOW = Date.parse(fixtureCatalog ? '2026-10-02' : '2026-10-13')
export function refineProducts(products,raw={}) {
 const o=cleanOptions(raw)
 const release=p=>new Date(p.release).getTime()
 let found=products.filter(p=>(!o.platform||p.platforms.includes(o.platform))&&(!o.content||p.type===o.content)&&(!o.genre||p.genres===o.genre)&&(!o.age||p.rating===o.age)&&(!o.feature||p.features.includes(o.feature))&&(!o.vr||p.vr===o.vr)&&(!o.plus||p.plusTag===o.plus)&&(!o.price||(o.price==='free'?p.price===0:o.price==='sale'?p.originalPrice>p.price:o.price==='under20'?p.price!==null&&p.price<20:o.price==='20to40'?p.price>=20&&p.price<=40:p.price>40))&&(!o.release||(o.release==='upcoming'?release(p)>NOW:o.release==='recent'?release(p)>=NOW - 90 * 864e5&&release(p)<=NOW:o.release==='2026'?release(p)>=Date.parse('2026-01-01')&&release(p)<=NOW:release(p)<Date.parse('2026-01-01'))))
 const sorts={'best-selling':(a,b)=>a.bestRank-b.bestRank,'most-downloaded':(a,b)=>a.downloadRank-b.downloadRank,name:(a,b)=>a.title.localeCompare(b.title),'name-desc':(a,b)=>b.title.localeCompare(a.title),'release-desc':(a,b)=>release(b)-release(a),'release-asc':(a,b)=>release(a)-release(b),'plus-recent':(a,b)=>(b.plusAdded||'').localeCompare(a.plusAdded||''),'price-asc':(a,b)=>(a.price??Infinity)-(b.price??Infinity),'price-desc':(a,b)=>(b.price??-1)-(a.price??-1)}
 if(Object.hasOwn(sorts,o.sort))found.sort(sorts[o.sort])
 return found
}
const FIXTURE_COLLECTIONS=[
 ['autumn','Autumn Adventures','Head outdoors, discover new worlds and make room for a little wonder.',p=>p.fictional],
 ['studios','PlayStation Studios','Distinctive adventures and competition from PlayStation Studios.',p=>p.publisher==='Sony Interactive Entertainment'],
 ['together','Play together','Share a sofa or connect with friends online.',p=>p.ordinary&&p.localPlayers>1&&p.contentType==='base-game'],
 ['free-to-play','Free to play','Add a free game to your library. Optional purchases may be available in-game.',p=>p.price===0],
 ['racing','Racing games','From the circuit to the forest stage.',p=>p.genres==='Driving/Racing'],
 ['rpg','Role-playing adventures','Build a party and follow your own story.',p=>p.genres==='Role Playing Games'],
 ['new-games','New games','Explore recent releases.',p=>p.ordinary&&new Date(p.release)>=new Date('2026-07-01')&&p.contentType==='base-game'],
 ['add-ons','Add-ons by game','Expand a game you already play. Check the required base game and platform.',p=>p.contentType==='add-on'||p.contentType==='consumable'],
]
export const COLLECTIONS = fixtureCatalog ? FIXTURE_COLLECTIONS : SHELF_COLLECTIONS
