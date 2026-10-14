import { merchandisingPlatform } from './expansion.js'
// Deterministic AU retail fixtures. Specifications/prices are illustrative, not live SKU claims.
export const slugify = value => String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
export const DEPARTMENT_DEFS = [
 ['headphones-audio','Headphones & Audio','Sound for every day','headphones'],
 ['tvs-home-theatre','TVs & Home Theatre','Make movie night bigger','television'],
 ['computers-tablets','Computers & Tablets','Work, create and stay connected','laptop'],
 ['mobile-phones','Mobile Phones','Your everyday connection','smartphone'],
 ['wearables','Wearables','Keep moving, keep connected','smartwatch-black'],
 ['cameras','Cameras','Shoot your next adventure','mirrorless-camera'],
 ['smart-home','Smart Home','A more connected home','security-camera-white'],
 ['home-appliances','Home Appliances','Little upgrades, big difference','espresso-machine'],
 ['gaming','Gaming','Consoles, games and accessories','handheld-console'],
 ['music','Music','Discover your next favourite record','vinyl-blue-hour'],
 ['movies-tv','Movies & TV','Build your movie collection',null],
 ['collectibles-merchandise','Collectibles & Merchandise','Find your next build','building-bricks'],
].map(([slug,title,description,photo])=>({slug,title,description,photo}))
export const CAMPAIGNS = [
 {slug:'new',title:'New at JB',description:'Fresh arrivals across tech, entertainment and home.'},
 {slug:'deals',title:'Deals & Catalogues',description:'Great value picks for work, play and home.'},
 {slug:'clearance',title:'Clearance',description:'Last-chance prices on selected products, while stock lasts.'},
 {slug:'work-study',title:'Work & Study',description:'Set up your desk with computers and everyday accessories.'},
 {slug:'movie-night',title:'Movie Night',description:'Bring the big screen home with TVs, sound and movies.'},
 {slug:'kitchen-upgrades',title:'Kitchen Upgrades',description:'Coffee, cooking and everyday essentials.'},
]
const rows = [
 ['991107','JBL Wireless In-Ear Earbuds','Headphones & Audio','Earbuds','JBL','earbuds-white',89,{Colour:'White',Connectivity:'Bluetooth',Style:'In-ear','Battery life':'24 hours with case'},'Compact wireless earbuds with a pocket charging case and touch controls.'],
 ['991108','JBL Portable Bluetooth Speaker','Headphones & Audio','Portable speakers','JBL','speaker-green',129,{Colour:'Green',Connectivity:'Bluetooth',Protection:'IP67','Battery life':'12 hours'},'Portable speaker with a carry loop for listening around the home or outdoors.'],
 ['991109','Samsung 2.1 Channel Soundbar','TVs & Home Theatre','Soundbars','Samsung','soundbar',249,{Colour:'Black',Channels:'2.1',Connectivity:'HDMI ARC / Bluetooth',Compatibility:'TVs with HDMI ARC'},'A compact soundbar for clearer dialogue and bigger movie sound.'],
 ['991110','Laser 4K Streaming Media Player','TVs & Home Theatre','Streaming players','Laser','streaming-player',79,{Colour:'Black',Resolution:'4K',Connectivity:'HDMI / Wi-Fi','Power supply':'AU adapter included'},'A compact streaming box with remote. Internet and separate subscriptions may be required.'],
 ['991111','Samsung 11-inch Wi-Fi Tablet','Computers & Tablets','Tablets','Samsung','tablet',349,{Colour:'Graphite','Display size':'11 inch',Storage:'128GB',RAM:'6GB',Connectivity:'Wi-Fi'},'A lightweight tablet for entertainment, notes and everyday browsing.'],
 ['991112','AOC 27-inch Full HD Monitor','Computers & Tablets','Monitors','AOC','monitor',179,{Colour:'Black','Display size':'27 inch',Resolution:'1920 × 1080','Refresh rate':'100Hz',Connectivity:'HDMI'},'A spacious Full HD display for your home office or study setup.'],
 ['991113','Logitech Compact Wireless Keyboard','Computers & Tablets','Keyboards','Logitech','keyboard-white-compact',69,{Colour:'White',Connectivity:'Bluetooth',Layout:'Compact',Compatibility:'Windows / macOS'},'Compact wireless keyboard designed to free up desk space.'],
 ['991114','Logitech Wireless Optical Mouse','Computers & Tablets','Mice','Logitech','mouse-black',29,{Colour:'Black',Connectivity:'USB receiver',Sensor:'Optical',Compatibility:'Windows / macOS'},'A comfortable everyday mouse with wireless USB connectivity.'],
 ['991115','TP-Link Dual Band Wi-Fi Router','Computers & Tablets','Networking','TP-Link','router',119,{Colour:'Black',Connectivity:'Wi-Fi 6','Ethernet ports':'4 LAN',Bands:'2.4GHz / 5GHz'},'Dual-band wireless networking for a connected home. Requires a compatible internet service.'],
 ['991116','Canon All-in-One Inkjet Printer','Computers & Tablets','Printers','Canon','printer',129,{Colour:'Black',Functions:'Print / scan / copy',Connectivity:'Wi-Fi / USB','Paper size':'A4'},'Print documents and family photos, scan paperwork and copy from one compact device.'],
 ['991117','SanDisk Portable USB-C SSD','Computers & Tablets','Storage','SanDisk','portable-ssd',119,{Colour:'Black',Storage:'1TB',Connectivity:'USB-C',Type:'External SSD'},'Pocket-sized external storage for documents, photos and backups.'],
 ['991118','Logitech Full HD USB Webcam','Computers & Tablets','Webcams','Logitech','webcam',79,{Colour:'Black',Resolution:'1080p',Connectivity:'USB',Microphone:'Built-in'},'A clip-on webcam for clearer video calls and online meetings.'],
 ['991119','Samsung 5G Unlocked Smartphone','Mobile Phones','Unlocked phones','Samsung','smartphone',499,{Colour:'Black',Storage:'128GB',Connectivity:'5G','Display size':'6.5 inch',SIM:'Nano SIM'},'An unlocked smartphone for compatible Australian networks. SIM and mobile plan sold separately.'],
 ['991120','Amazfit Round Smartwatch','Wearables','Smartwatches','Amazfit','smartwatch-black',159,{Colour:'Black',Connectivity:'Bluetooth','Case shape':'Round',Compatibility:'Android / iOS'},'Track daily activity and view phone notifications with a round colour display.'],
 ['991121','Canon Mirrorless Camera with Kit Lens','Cameras','Mirrorless cameras','Canon','mirrorless-camera',899,{Colour:'Black',Sensor:'APS-C','Video resolution':'4K',Lens:'18–45mm kit zoom'},'An interchangeable-lens camera kit for everyday photography and creative video.'],
 ['991122','GoPro Compact Action Camera','Cameras','Action cameras','GoPro','action-camera',299,{Colour:'Black','Video resolution':'4K',Connectivity:'Wi-Fi / Bluetooth',Mount:'Action camera mount'},'A compact camera to take on your next ride or outdoor adventure.'],
 ['991123','TP-Link Indoor Wi-Fi Security Camera','Smart Home','Security cameras','TP-Link','security-camera-white',59,{Colour:'White',Resolution:'1080p',Connectivity:'Wi-Fi',Power:'Wired AU adapter'},'Check in on indoor spaces with app access and two-way audio. Internet required.'],
 ['991124','Panasonic 25L Microwave','Home Appliances','Microwaves','Panasonic','microwave',169,{Colour:'Silver',Capacity:'25L',Power:'900W','Power supply':'Australian 240V'},'An easy-to-use microwave with defrost and everyday cooking settings.'],
 ['991125','Breville Espresso Coffee Machine','Home Appliances','Coffee machines','Breville','espresso-machine',449,{Colour:'Stainless steel',Type:'Manual espresso','Water capacity':'1.5L','Power supply':'Australian 240V'},'Make espresso at home with a steam wand for textured milk.'],
 ['991126','Dyson Cordless Stick Vacuum','Home Appliances','Vacuum cleaners','Dyson','stick-vacuum-blue',499,{Colour:'Blue',Type:'Cordless stick',Runtime:'Up to 40 minutes','Dust bin':'0.5L'},'A cordless vacuum for everyday floor cleaning. Runtime varies by mode and floor type.'],
 ['991127','Philips Air Purifier','Home Appliances','Air purifiers','Philips','air-purifier',199,{Colour:'White',Filter:'HEPA','Room coverage':'Up to 30m²','Power supply':'Australian 240V'},'Compact air filtration with selectable fan speeds and a replaceable filter.'],
 ['991128','Blue Hour Sessions (Vinyl)','Music','Vinyl','Blue Hour','vinyl-blue-hour',39.99,{Format:'Vinyl',Discs:'1 LP',Genre:'Electronic',Speed:'33⅓ rpm'},'An atmospheric instrumental album on black vinyl, with an illustrated sleeve.'],
 ['991129','Coastal Journeys (Blu-ray)','Movies & TV','Blu-ray','JB Entertainment',null,24.99,{Format:'Blu-ray',Genre:'Documentary',Rating:'G',Region:'B',Runtime:'92 minutes'},'Explore coastal landscapes in this original travel documentary. Blu-ray player required.'],
 ['991130','Laser USB-C 6-Port Hub','Computers & Tablets','USB hubs','Laser','usb-hub',49,{Colour:'Grey',Connectivity:'USB-C',Ports:'HDMI / USB-A / USB-C / SD',Compatibility:'USB-C computers'},'Connect everyday peripherals through one compact desk hub. Host feature support varies.'],
 ['991131','JB Essentials 2m HDMI Cable','TVs & Home Theatre','Cables','JB Essentials','hdmi-cable',19,{Colour:'Black',Length:'2m',Connector:'HDMI',Resolution:'Up to 4K'},'Connect compatible TVs, monitors, consoles and media players.'],
 ['991132','Laser 10000mAh Power Bank','Mobile Phones','Power banks','Laser','powerbank-black',39,{Colour:'Black',Capacity:'10000mAh',Connectivity:'USB-C / USB-A',Type:'Portable charger'},'Portable backup power for compatible phones and accessories.'],
 ['991133','Logitech Racing Wheel & Pedals','Gaming','Racing wheels','Logitech','racing-wheel-pedals',329,{Colour:'Black',Compatibility:'PC',Controls:'Wheel and two pedals',Connectivity:'USB'},'A wheel-and-pedal set for compatible PC racing games. Games sold separately.'],
 ['991134','Nintendo Handheld Carry Case','Gaming','Carry cases','Nintendo','handheld-case-black',29,{Colour:'Black',Type:'Zip carry case',Compatibility:'Handheld consoles up to 28cm'},'A protective case for a handheld console. Console and games sold separately.'],
]
export const EXTRA_PRODUCTS = rows.map(([id,title,category,type,brand,photo,price,attributes,description],i)=>({
 id,kind:'other',slug:slugify(title),title,subtitle:type,crumbs:[category,type],brand,type,family:slugify(type),photo,price,attributes,
 art:'/jb-hifi/static/catalog-bluray.svg',stock:i===26?0:5,orderable:i!==26,cta:i===26?'Out of stock':'Add to cart',
 badges:i%5===0?['HOT DEAL']:[],release:null,releaseLong:null,rating:null,notice:[],description:[description],
 specs:[['Brand',brand],...Object.entries(attributes)],stars:String(4+(i%9)/10),reviews:12+i*7,
 keywords:`${title} ${category} ${type} ${brand} ${Object.values(attributes).join(' ')}`,
 campaigns:[...(i%4===0?['new']:[]),...(i%5===0?['deals']:[]),...(i%9===0?['clearance']:[]),...(category==='Computers & Tablets'?['work-study']:[]),...(['TVs & Home Theatre','Movies & TV'].includes(category)?['movie-night']:[]),...(['Microwaves','Coffee machines'].includes(type)?['kitchen-upgrades']:[])],
}))
export function enrichProducts(products) {
 const existing = {
 '991101':['Headphones','headphones',{Colour:'Black',Connectivity:'Bluetooth',Style:'Over-ear','Noise cancelling':'Yes','Battery life':'30 hours'}],
 '991102':['Televisions','television',{Colour:'Black','Display size':'55 inch',Resolution:'4K',Connectivity:'HDMI / Wi-Fi'}],
 '991103':['Laptops','laptop',{Colour:'Grey','Display size':'14 inch',Processor:'Intel Core i5',RAM:'8GB',Storage:'256GB SSD'}],
 '991104':['Kettles','kettle',{Colour:'Stainless steel',Capacity:'1.7L','Power supply':'Australian 240V','Auto shut-off':'Yes'}],
 '991105':['Building sets','building-bricks',{'Recommended age':'4+',Material:'Plastic',Type:'Creative bricks'}],
 '991106':['Consoles','handheld-console',{Colour:'Blue / red',Storage:'256GB',Connectivity:'Wi-Fi',Compatibility:'Nintendo Switch 2 games'}],
 }
 products.push(...EXTRA_PRODUCTS)
 for (const p of products) {
  const update=existing[p.id]
  if(update){p.type=update[0];p.family=slugify(p.type);p.photo=update[1];p.attributes=update[2];p.crumbs=[p.crumbs[0],p.type];p.specs=[p.specs[0],...Object.entries(p.attributes)];p.stars='4.5';p.reviews=38}
  p.brand??=p.specs.find(([k])=>['Brand','Game publisher'].includes(k))?.[1] || (p.crumbs[0]==='Music'?'Rockstar Games':'Sony')
  p.type??=p.crumbs.at(-1)
  p.family??=p.kind==='game'?'gta-vi':/soundtrack/i.test(p.title)?'gta-soundtrack':/controller/i.test(p.title)?'controllers':/charging station/i.test(p.title)?'controller-docks':/PS5 games/.test(p.type)?'released-games':'collectors-merchandise'
  p.attributes??={}
  p.stock??=p.orderable?5:0
  p.campaigns??=p.id==='991103'?['new','work-study']:p.id==='991104'?['deals','kitchen-upgrades']:p.id==='991102'?['deals','movie-night']:[]
 }
 // Matching black product illustrations: shared router/printer photos depict white casings.
 for (const [id,art] of [['991115','router'],['991116','printer']]) { const p=products.find(p=>p.id===id);p.photo=null;p.art=`/jb-hifi/static/catalog-${art}-black.svg` }
 const headphones=products.find(p=>p.id==='991101')
 headphones.variants=[{id:'black',label:'Black',price:149,stock:3,attributes:{Colour:'Black'},photo:'headphones'},{id:'cream',label:'Cream',price:159,stock:2,attributes:{Colour:'Cream'},photo:'headphones-cream'}]
 const ssd=products.find(p=>p.id==='991117')
 ssd.variants=[{id:'1tb',label:'1TB',price:119,stock:4,attributes:{Storage:'1TB'}},{id:'2tb',label:'2TB',price:179,stock:2,attributes:{Storage:'2TB'}},{id:'4tb',label:'4TB',price:279,stock:0,attributes:{Storage:'4TB'}}]
 products.find(p=>p.id==='650334').photo='controller-dock-white'
 products.find(p=>p.id==='650334').photoCaption='Controllers shown for demonstration; controllers sold separately.'
 for(const id of ['650331','903005']) products.find(p=>p.id===id).photo='controller'
 products.find(p=>p.id==='903020').art='/jb-hifi/static/catalog-cd.svg'
}
export function selectedProduct(p, variantId) {
 if(!p) return null
 if(!p.variants) return variantId ? null : p
 const variant=p.variants.find(v=>v.id===variantId)
 if(!variant) return null
 return {...p,price:variant.price,stock:Math.min(p.stock,variant.stock),orderable:p.orderable&&variant.stock>0,cta:variant.stock>0?p.cta:'Out of stock',photo:variant.photo??p.photo,attributes:{...p.attributes,...variant.attributes},specs:p.specs.map(([k,v])=>[k,variant.attributes[k]??v]),variantId:variant.id,variantLabel:variant.label}
}
export const lineKey=(id,variant='')=>`${id}${variant?':'+variant:''}`
export const stockLimit=p=>Math.min(5,p?.purchaseLimit??p?.stock??0)
export const FILTER_KEYS=['category','type','brand','platform','price','rating','availability','colour','connectivity','storage','campaign','sort','page','per_page']
export function filterCatalog(products,q,filters={}) {
 const norm=s=>String(s??'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()
 const terms=norm(q).split(' ').filter(Boolean)
 const priceMatches=p=>!filters.price||(filters.price==='under50'?p.price<50:filters.price==='50to150'?p.price>=50&&p.price<=150:filters.price==='over150'?p.price>150:true)
 const availabilityMatches=p=>!filters.availability||(filters.availability==='in-stock'?p.orderable&&p.stock>0:filters.availability==='preorder'?p.cta==='Pre-order':!p.orderable||p.stock===0)
 const attributesMatch=p=>['colour','connectivity','storage'].every(k=>!filters[k]||p.attributes[{colour:'Colour',connectivity:'Connectivity',storage:'Storage'}[k]]===filters[k])
 const found=products.flatMap(p=>{
  const hay=norm(`${p.title} ${p.subtitle} ${p.keywords} ${p.crumbs.join(' ')}`)
  if(!terms.every(t=>hay.includes(t))||(filters.category&&p.crumbs[0]!==filters.category)||(filters.type&&p.type!==filters.type)||(filters.brand&&p.brand!==filters.brand)||(filters.platform&&merchandisingPlatform(p)!==filters.platform)||(filters.rating&&Number(p.stars||0)<Number(filters.rating))||(filters.campaign&&!p.campaigns.includes(filters.campaign)))return []
  const resolve=p.variants&&['colour','connectivity','storage','price','availability'].some(k=>filters[k])
  const candidates=resolve?p.variants.map(v=>selectedProduct(p,v.id)):[p]
  const match=candidates.find(c=>attributesMatch(c)&&priceMatches(c)&&availabilityMatches(c))
  return match?[match]:[]
 })
 const comparators={'price-asc':(a,b)=>a.price-b.price,'price-desc':(a,b)=>b.price-a.price,'name-asc':(a,b)=>a.title.localeCompare(b.title),'name-desc':(a,b)=>b.title.localeCompare(a.title),rating:(a,b)=>Number(b.stars||0)-Number(a.stars||0),newest:(a,b)=>b.id.localeCompare(a.id)}
 if(Object.hasOwn(comparators,filters.sort))found.sort((a,b)=>comparators[filters.sort](a,b)||a.id.localeCompare(b.id))
 return found
}
