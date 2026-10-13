import { fixtureCatalog } from '../../lib/catalog-policy.js'
import { expandGameUK } from './catalog500.js'
// Deterministic surrounding retail fixtures. Photos are original illustrative packshots.
export const DEPARTMENTS = [
  { id:'gaming', title:'Consoles & Video Games', intro:'Find your next adventure, choose a console and complete your setup.', photo:'ps5-console', categories:['Consoles','Video Games','Controllers','Headsets','Racing Wheels','Charging Docks','Carry Cases'] },
  { id:'digital', title:'Digital Gift Cards', intro:'Top up your account or choose a new digital adventure. Check the platform and UK region before buying.', photo:'game-pocket-garden', categories:['Digital Downloads','Gift Cards'] },
  { id:'pc-gaming', title:'PC Gaming', intro:'Build a comfortable PC setup with keyboards, mice, displays and audio.', photo:'keyboard', categories:['Keyboards','Mice','PC Bundles','Monitors','Laptops','Headsets',...(fixtureCatalog?[]:['Gaming Chairs'])] },
  { id:'tech', title:'Tech', intro:'Everyday audio, storage and accessories for connected play.', photo:'headphones', categories:['Headphones',...(fixtureCatalog?[]:['Speakers','Smart Lighting']),'Storage','Cables','Webcams','Vinyl'] },
  { id:'lego', title:'LEGO', intro:'Creative bricks, city builds and colourful display sets for imaginative builders.', photo:'building-bricks', categories:['Building Sets'] },
  { id:'toys', title:'Toys & Games', intro:'Make room for family game nights, imaginative play and favourite collectibles.', photo:'rc-car-red', categories:['Soft Toys','Board Games','Action Figures','RC Vehicles','Wooden Toys','Building Sets'] },
  { id:'toys/trading-cards', title:'Trading Cards', intro:'Ready-to-play decks, booster packs and storage for your collection.', photo:'card-binder-black', categories:['Trading Cards','Card Storage'] },
]
export const CAMPAIGNS = [
  {id:'coming-soon',title:'Coming Soon',intro:'Reserve upcoming games and collectibles.',photo:'ps5-console'},
  {id:'gifts-for-gamers',title:'Gifts for Gamers',intro:'Accessories, games and collectibles for every player.',photo:'gaming-headset'},
  {id:'under-30',title:'Great finds under £30',intro:'Games, toys and useful upgrades for less.',photo:'board-game'},
  {id:'pc-setup',title:'Level up your PC setup',intro:'Discover keyboards, mice, monitors and desktop accessories.',photo:'keyboard'},
]
export const categorySlug = value => value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')

export function extendCatalog(products) {
  const enrich = (id, fields) => Object.assign(products.find(p=>p.id===id), fields)
  for (const p of products) {
    Object.assign(p,{family:p.title.replace(/ \([^)]*\)/g,''),stock:p.kind==='game'?99:12, age:p.pegi?`PEGI ${p.pegi}`:'All ages', departments:['gaming'], specs:{'Product type':p.category,'Brand':p.brand,'Contents':p.digital?'One UK redemption code':'One item'}, collect:!p.preorder&&!p.digital})
  }
  enrich('756802',{family:'GTA VI',specs:{Platform:'PlayStation 5',Edition:'Standard',Format:'Download code in box',Region:'United Kingdom',Release:'19 November 2026'}})
  enrich('400064',{family:'GTA VI',specs:{Platform:'Xbox Series X|S',Edition:'Standard',Format:'Download code in box',Region:'United Kingdom',Release:'19 November 2026'}})
  for(const id of ['271604','271605']) enrich(id,{family:'GTA V',specs:{Format:'Disc',Platform:id==='271604'?'PlayStation 5':'Xbox Series X',Contents:'Game disc and case'}})
  for(const id of ['905117','905118']) enrich(id,{family:'GTA Online currency',departments:['digital'],specs:{Region:'United Kingdom',Delivery:'Email code',Requirements:'Matching console account and GTA Online'}})
  enrich('813570',{family:'Controller',photo:'controller',specs:{Compatibility:'PlayStation 5 and compatible PC',Colour:'White',Contents:'Controller; game not included'}})
  enrich('813571',{family:'Vinyl soundtrack',browseCategory:'Vinyl',departments:['tech'],specs:{Format:'2 × LP',Colour:'Black vinyl',Contents:'Two records and gatefold sleeve'}})
  enrich('991201',{family:'Football game',age:'PEGI 3',pegi:3,specs:{Platform:'PlayStation 5',Format:'Disc',Genre:'Sports',Players:'Local multiplayer and solo'}})
  enrich('991202',{family:'Nintendo console',photo:'handheld-console',specs:{Type:'Hybrid console',Colour:'Black',Contents:'Console, controllers, dock and power adapter'},stock:6})
  enrich('991203',{family:'Creative building bricks',category:'Building Sets',departments:['lego','toys'],photo:'building-bricks',age:'4+',specs:{Material:'Plastic bricks',Age:'4 years and over',Contents:'Assorted building bricks',Play:'Open-ended creative building'}})
  enrich('991204',{family:'Trading card deck',departments:['toys/trading-cards'],age:'6+',specs:{Type:'Ready-to-play deck',Players:'2',Age:'6 years and over',Contents:'Deck and play guide'}})
  enrich('991205',{family:'Keyboard and mouse bundle',category:'PC Bundles',departments:['pc-gaming'],photo:'keyboard-mouse-bundle',specs:{Connection:'Wired USB-A',Layout:'UK QWERTY',Contents:'Keyboard and mouse'},stock:9})
  enrich('991206',{family:'Controller',category:'Controllers',photo:'xbox-controller-black',specs:{Compatibility:'Xbox Series X|S and Windows PC',Colour:'Carbon Black',Connection:'Wireless and USB-C'},swatch:'Carbon Black'})
  enrich('991207',{family:'Plush toy',category:'Soft Toys',departments:['toys'],photo:'plush-rabbit',age:'3+',specs:{Character:'Rabbit',Material:'Soft fabric',Care:'Surface clean',Age:'3 years and over'}})
  enrich('991208',{family:'Gaming monitor',category:'Monitors',departments:['pc-gaming','tech'],photo:'monitor',specs:{Screen:'27 inches',Resolution:'1920 × 1080',Connection:'HDMI',Contents:'Monitor, stand and HDMI cable'},collect:false})
  const add = (id,title,brand,price,category,departments,photo,specs,extra={}) => products.push({id:String(id),colcode:`${id}99`,kind:'other',slug:`${categorySlug(title)}-${id}`,title,brand,price,ticketPrice:price,swatch:extra.swatch||'Standard',platformFacet:null,category,style:extra.style||category,badges:[],preorder:false,release:null,pegi:null,carrier:'Evri',crumbs:[DEPARTMENTS.find(d=>d.id===departments[0]).title,category],art:'/game-uk/static/catalog-game.svg',artAlt:title,description:[extra.description||`${title}. ${Object.entries(specs).map(([k,v])=>`${k}: ${v}`).join('. ')}.`],keywords:`${title} ${brand} ${category}`,family:title,stock:8,age:'All ages',collect:true,departments,photo,specs,...extra})
  add(992001,'Starfall Expedition','Northstar',34.99,'Video Games',['gaming'],'game-starfall-expedition',{Genre:'Exploration adventure',Platform:'PlayStation 5',Format:'Disc',Players:'Single player'},{platformFacet:'PS5',swatch:'PS5',age:'PEGI 12',pegi:12,style:'Action / Adventure'})
  add(992002,'Apex Rally','Northstar',29.99,'Video Games',['gaming'],'game-apex-rally',{Genre:'Racing',Platform:'Xbox Series X',Format:'Disc',Players:'1–2'},{platformFacet:'Xbox',swatch:'XBS',age:'PEGI 3',pegi:3,style:'Racing'})
  add(992003,'PlayStation 5 Console','Sony',479.99,'Consoles',['gaming'],'ps5-console',{Storage:'1 TB',Format:'Disc drive console',Contents:'Console, one controller, HDMI cable, UK power lead'},{platformFacet:'PS5',stock:5})
  add(992004,'Xbox Series X Console','Xbox',449.99,'Consoles',['gaming'],'xbox-console',{Storage:'1 TB',Format:'Disc drive console',Contents:'Console, one controller, HDMI cable, UK power lead'},{platformFacet:'Xbox',stock:4})
  add(992005,'Meta Quest 3S VR Headset','Meta',289.99,'Consoles',['gaming'],null,{Type:'Standalone VR headset',Contents:'Headset, two controllers, charging cable',Age:'13 years and over'},{family:'VR headset',photo:'vr-headset-white',age:'13+',optionLabel:'Storage',options:[{id:'128gb',label:'128 GB',price:289.99,stock:4},{id:'256gb',label:'256 GB',price:379.99,stock:2}],stock:6})
  add(992006,'Racing Wheel and Pedals','Raceworks',129.99,'Racing Wheels',['gaming'],null,{Connection:'USB',Compatibility:'PC and PlayStation 5',Contents:'Wheel, desk clamp and two-pedal set'},{family:'Racing wheel',photo:'racing-wheel-pedals',platformFacet:'PS5',collect:false})
  add(992007,'Wired Gaming Headset','GameLab',34.99,'Headsets',['gaming','pc-gaming'],'gaming-headset',{Connection:'3.5 mm',Microphone:'Boom microphone',Compatibility:'Controllers and PCs with 3.5 mm headset socket'},{family:'Gaming headset',swatch:'Black'})
  add(992008,'Dual Controller Charging Dock','GameLab',22.99,'Charging Docks',['gaming'],null,{Compatibility:'DualSense controllers',Colour:'White',Contents:'Charging dock; controllers not included'},{family:'Controller dock',photo:'controller-dock-white',swatch:'White'})
  add(992009,'Console Carrying Case','GameLab',19.99,'Carry Cases',['gaming'],null,{Compatibility:'Nintendo Switch 2',Colour:'Black',Contents:'Protective zip case',Material:'Fabric shell'},{family:'Console carrying case',photo:'handheld-case-black'})
  add(992010,'Mechanical Gaming Keyboard','GameLab',59.99,'Keyboards',['pc-gaming'],'keyboard',{Connection:'Wired USB',Layout:'UK QWERTY',Lighting:'RGB',Contents:'Keyboard and cable'},{family:'Keyboard',optionLabel:'Switch type',options:[{id:'linear',label:'Linear switches',price:59.99,stock:6},{id:'tactile',label:'Tactile switches',price:64.99,stock:2}]})
  add(992011,'Wired Gaming Mouse','GameLab',24.99,'Mice',['pc-gaming'],'mouse-black',{Connection:'USB',Colour:'Black',Buttons:'6',Sensor:'Optical'},{family:'Mouse',swatch:'Black'})
  add(992012,'15-inch Gaming Laptop','GameLab',749.99,'Laptops',['pc-gaming'],'laptop',{Screen:'15.6 inches',Memory:'16 GB RAM',Storage:'512 GB SSD',Layout:'UK QWERTY',Contents:'Laptop and UK power adapter'},{family:'Gaming laptop',stock:3,collect:false})
  add(992013,'Wireless Over-ear Headphones','Soundline',49.99,'Headphones',['tech'],'headphones',{Connection:'Bluetooth',Colour:'Black',Contents:'Headphones and charging cable'},{family:'Headphones',swatch:'Black'})
  add(992014,'Portable USB-C SSD 1 TB','StoreTech',79.99,'Storage',['tech','pc-gaming'],'portable-ssd',{Capacity:'1 TB',Connection:'USB-C',Contents:'External drive and USB-C cable'},{family:'External storage'})
  add(992015,'HDMI Cable 2 Metres','GameLab',9.99,'Cables',['tech','gaming'],'hdmi-cable',{Length:'2 metres',Connection:'HDMI to HDMI',Contents:'One cable'},{family:'HDMI cable',stock:20})
  add(992016,'Full HD USB Webcam','GameLab',29.99,'Webcams',['tech','pc-gaming'],'webcam',{Resolution:'1080p',Connection:'USB-A',Mount:'Monitor clip',Contents:'Webcam and integrated cable'},{family:'Webcam'})
  add(992017,'City Bus Building Set','LEGO',34.99,'Building Sets',['lego','toys'],'brick-city-bus',{Theme:'City transport',Age:'6 years and over',Contents:'Bus building pieces and instructions'},{family:'City building set',age:'6+'})
  add(992018,'Botanical Flower Building Set','LEGO',44.99,'Building Sets',['lego'],'brick-botanical',{Theme:'Flowers',Age:'14 years and over',Contents:'Flower building pieces and instructions'},{family:'Botanical building set',age:'14+'})
  add(992019,'Family Strategy Board Game','Playroom',19.99,'Board Games',['toys'],'board-game',{Players:'2–4',Age:'8 years and over',Duration:'30–45 minutes',Contents:'Board, counters, cards and rules'},{family:'Board game',age:'8+'})
  add(992020,'Space Explorer Action Figure','Playroom',14.99,'Action Figures',['toys'],'figure',{Age:'4 years and over',Material:'Plastic',Contents:'One articulated figure'},{family:'Action figure',age:'4+'})
  add(992021,'Remote Control Racing Car','Playroom',24.99,'RC Vehicles',['toys'],'rc-car-red',{Colour:'Red',Age:'6 years and over',Contents:'Car and remote control',Power:'Batteries sold separately'},{family:'RC car',age:'6+',swatch:'Red'})
  add(992022,'Wooden Play Kitchen','Playroom',89.99,'Wooden Toys',['toys'],null,{Material:'Wood',Age:'3 years and over',Assembly:'Adult assembly required',Contents:'Kitchen unit and utensils'},{family:'Wooden play kitchen',art:'/game-uk/static/play-kitchen.svg',age:'3+',collect:false,stock:0,badges:['OUT OF STOCK']})
  add(992023,'Nine-pocket Trading Card Binder','GameLab',17.99,'Card Storage',['toys/trading-cards'],'card-binder-black',{Capacity:'360 cards',Pockets:'9 per page',Contents:'Binder; cards not included'},{family:'Card binder',optionLabel:'Colour',options:[{id:'black',label:'Black',price:17.99,stock:6,photo:'card-binder-black'},{id:'red',label:'Red',price:17.99,stock:4,photo:'card-binder-red'}],stock:10})
  add(992024,'Mythic Skybound Booster Pack','Mythic',4.99,'Trading Cards',['toys/trading-cards'],'mythic-skybound-booster',{Type:'Sealed booster pack',Age:'6 years and over',Contents:'Randomised trading cards'},{family:'Trading card booster',age:'6+',stock:24})
  add(992025,'Pocket Garden Digital Download','Northstar',14.99,'Digital Downloads',['digital'],'game-pocket-garden',{Platform:'PC',Region:'United Kingdom',Format:'Digital code',Genre:'Relaxed gardening'},{family:'Gardening game',digital:true,carrier:'email',collect:false,platformFacet:'PC',style:'Simulation'})
  add(992026,'PlayStation Store £25 Gift Card','PlayStation',25,'Gift Cards',['digital'],null,{Value:'£25',Region:'United Kingdom',Platform:'PlayStation Network',Delivery:'Email code'},{family:'Platform gift card',digital:true,carrier:'email',collect:false,platformFacet:'PS5',art:'/game-uk/static/gift-card.svg'})
  if (fixtureCatalog) expandGameUK(products)
  for(const p of products) p.campaigns=[...(p.preorder?['coming-soon']:[]),...(p.price<30&&!p.preorder?['under-30']:[]),...(p.departments.includes('pc-gaming')?['pc-setup']:[]),...(!p.preorder&&p.price>=10&&p.price<=80?['gifts-for-gamers']:[])]
}
