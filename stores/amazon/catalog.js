import { platformOf, CATALOG_PLATFORMS } from './assortment500.js'
// Deterministic local retail fixtures, not claims about live Amazon price or stock.
export const DEPARTMENTS = [
  ['', 'All'], ['videogames', 'Video Games'], ['electronics', 'Electronics'],
  ['home', 'Home & Kitchen'], ['toys-and-games', 'Toys & Games'],
  ['stripbooks', 'Books'], ['music', 'CDs & Vinyl'], ['fashion', 'Clothing, Shoes & Jewelry'],
]
const definitions = [
  ['videogames', 'Video Games', '', 'Games, consoles, and accessories for every way you play.'],
  ['ps5', 'PlayStation 5', 'videogames', 'Discover PS5 games, controllers, and consoles.'],
  ['xbox', 'Xbox', 'videogames', 'Explore Xbox games and accessories.'],
  ['switch', 'Nintendo Switch', 'videogames', 'Family adventures, new worlds, and portable play.'],
  ['gaming-accessories', 'Gaming Accessories', 'videogames', 'Set up for your next session with audio, storage, and controllers.'],
  ['electronics', 'Electronics', '', 'Everyday tech for your desk, commute, and home.'],
  ['audio', 'Headphones & Speakers', 'electronics', 'Make room for your favorite sounds.'],
  ['computers', 'Computers & Accessories', 'electronics', 'Connect, create, and stay productive.'],
  ['smart-home', 'Smart Home', 'electronics', 'Simple connected devices for your daily routine.'],
  ['home', 'Home & Kitchen', '', 'Practical finds for a comfortable home.'],
  ['kitchen', 'Kitchen & Dining', 'home', 'Cookware, appliances, and tools for everyday meals.'],
  ['bedding', 'Bedding & Bath', 'home', 'Soft textures for a restful space.'],
  ['organization', 'Storage & Organization', 'home', 'Bring order to shelves, drawers, and busy rooms.'],
  ['toys-and-games', 'Toys & Games', '', 'Build, imagine, and make time to play.'],
  ['building', 'Building Toys', 'toys-and-games', 'Creative projects, one piece at a time.'],
  ['family-games', 'Board Games & Puzzles', 'toys-and-games', 'Bring everyone around the table.'],
  ['outdoor-toys', 'Outdoor Play', 'toys-and-games', 'Active fun for the backyard and beyond.'],
  ['stripbooks', 'Books', '', 'Find your next favorite story or a new skill.'],
  ['fiction', 'Literature & Fiction', 'stripbooks', 'Stories to get lost in.'],
  ['cookbooks', 'Cookbooks, Food & Wine', 'stripbooks', 'New ideas for your kitchen.'],
  ['creative-books', 'Arts, Travel & Hobbies', 'stripbooks', 'Discover something new.'],
  ['music', 'CDs & Vinyl', '', 'Albums for your collection and your next listening session.'],
  ['vinyl', 'Vinyl Records', 'music', 'Classic sounds and new discoveries on vinyl.'],
  ['soundtracks', 'Soundtracks & CDs', 'music', 'Music that brings the moment back.'],
  ['fashion', 'Clothing, Shoes & Jewelry', '', 'Comfortable everyday essentials and accessories.'],
  ['bags', 'Bags & Travel', 'fashion', 'Pack well for your everyday adventures.'],
  ['accessories', 'Clothing Accessories', 'fashion', 'The finishing touches for every day.'],
]
for (const platform of CATALOG_PLATFORMS) if (!definitions.some(([id])=>id===platform.id)) definitions.push([platform.id,platform.label,'videogames',`Browse playable games for ${platform.label}.`])
export const NODES = definitions.map(([id,title,parent,description]) => ({id,title,parent,description}))
export const nodeById = id => NODES.find(n => n.id === ({468642:'videogames',172282:'electronics',1055398:'home',165793011:'toys-and-games',283155:'stripbooks',5174:'music',7141123011:'fashion'}[id] ?? id))
export const nodePath = (base,id) => `${base}/b?node=${encodeURIComponent(id)}`
export function ancestorNodes(id) {
  const result = []; let n = nodeById(id)
  while (n) { result.unshift(n); n = nodeById(n.parent) }
  return result
}

// id, title, brand, cents, category, art family, feature/specification pairs.
const rows = [
 ['A0VGASTRO1','Astro Bot - PlayStation 5','PlayStation',5999,'ps5','game','Platform:PlayStation 5|Format:Game disc|Players:1|ESRB:Everyone 10+'],
 ['A0VGRDR201','Red Dead Redemption 2 - PlayStation 4','Rockstar Games',1999,'ps5','game','Platform:PlayStation 4 (PS5 compatible)|Format:Game disc|Players:1|ESRB:Mature'],
 ['A0VGHALO01','Halo Infinite - Xbox Series X','Xbox Game Studios',2999,'xbox','game','Platform:Xbox Series X|Format:Game disc|Players:1–24|ESRB:Teen'],
 ['A0VGMARIO1','Super Mario Odyssey - Nintendo Switch','Nintendo',4999,'switch','game','Platform:Nintendo Switch|Format:Game card|Players:1–2|ESRB:Everyone 10+'],
 ['A0VGKART01','Mario Kart 8 Deluxe - Nintendo Switch','Nintendo',5499,'switch','game','Platform:Nintendo Switch|Format:Game card|Players:1–4 locally|ESRB:Everyone'],
 ['A0VGCTRL01','Xbox Wireless Controller - Carbon Black','Xbox',5999,'xbox','controller','Compatibility:Xbox Series X/S and Windows|Connection:Wireless / USB-C|Power:2 AA batteries|Color:Carbon black'],
 ['A0VGHEAD01','Cloudline Wired Gaming Headset with Boom Microphone','Cloudline',3499,'gaming-accessories','headphones','Compatibility:PS5, Xbox, Switch, PC|Connection:3.5 mm|Driver:50 mm|Microphone:Adjustable boom'],
 ['A0VGSTOR01','Northstar 1TB PCIe Gen4 Gaming SSD with Heatsink','Northstar',8999,'gaming-accessories','ssd','Capacity:1 TB|Interface:PCIe Gen4 x4|Read speed:Up to 7,000 MB/s|Compatibility:PS5 and desktop PC'],
 ['A0ELECHP01','Cloudline Quiet Wireless Over-Ear Headphones','Cloudline',7999,'audio','headphones','Battery:Up to 40 hours|Connection:Bluetooth 5.3|Charging:USB-C|Noise control:Active noise cancellation'],
 ['A0ELECBD01','Cloudline Pocket True Wireless Earbuds','Cloudline',2999,'audio','earbuds','Battery:6 hours plus charging case|Water resistance:IPX4|Charging:USB-C|Included:3 ear tip sizes'],
 ['A0ELECSP01','Trailwave Portable Bluetooth Speaker','Trailwave',4499,'audio','speaker','Battery:Up to 16 hours|Water resistance:IP67|Output:12 W|Connection:Bluetooth'],
 ['A0ELECKB01','Northstar Compact Wireless Keyboard','Northstar',3299,'computers','keyboard','Layout:78 keys / US English|Connection:Bluetooth and USB receiver|Compatibility:Windows and macOS|Power:2 AAA batteries'],
 ['A0ELECMS01','Northstar Ergonomic Wireless Mouse','Northstar',2299,'computers','mouse','Sensitivity:800–2,400 DPI|Connection:2.4 GHz USB receiver|Buttons:6|Hand orientation:Right'],
 ['A0ELECWB01','Northstar Full HD Webcam with Privacy Cover','Northstar',3999,'computers','webcam','Resolution:1080p at 30 fps|Microphones:Dual|Connection:USB-A|Mount:Monitor clip and tripod thread'],
 ['A0ELECHB01','Northstar 7-in-1 USB-C Laptop Hub','Northstar',3599,'computers','hub','Ports:HDMI, 2 USB-A, USB-C, SD, microSD|Video:4K at 30 Hz|Power delivery:Up to 100 W pass-through|Cable:Integrated USB-C'],
 ['A0ELECLT01','Brightnest Dimmable LED Desk Lamp','Brightnest',2799,'smart-home','lamp','Color temperatures:3|Brightness levels:5|Power:USB-C|Height:16 inches'],
 ['A0ELECPL01','Brightnest Wi-Fi Smart Plug, 2 Pack','Brightnest',1899,'smart-home','plug','Wireless:2.4 GHz Wi-Fi|Maximum load:15 A|Pack size:2|Use:Indoor'],
 ['A0HOMEKT1','Hearth & Table 1.7L Electric Kettle','Hearth & Table',3299,'kitchen','kettle','Capacity:1.7 liters|Power:1,500 W|Material:Stainless steel|Safety:Automatic shutoff'],
 ['A0HOMEPAN','Hearth & Table 10-inch Stainless Steel Frying Pan','Hearth & Table',2499,'kitchen','pan','Diameter:10 inches|Material:Stainless steel|Surface:Uncoated cooking surface|Compatibility:Gas, electric, induction'],
 ['A0HOMECUP','Hearth & Table Stoneware Mug Set, 4 Pack','Hearth & Table',2199,'kitchen','mugs','Capacity:14 fl oz each|Material:Stoneware|Pack size:4|Care:Dishwasher safe'],
 ['A0HOMEKNF','Hearth & Table Chef Knife with Blade Cover','Hearth & Table',1899,'kitchen','knife','Blade length:8 inches|Blade:Stainless steel|Handle:Textured polymer|Included:Blade cover'],
 ['A0HOMESHT','Linen Harbor Cotton Queen Sheet Set','Linen Harbor',4499,'bedding','bedding','Size:Queen|Material:100% cotton|Includes:Fitted sheet, flat sheet, 2 pillowcases|Pocket depth:16 inches'],
 ['A0HOMETWL','Linen Harbor Cotton Bath Towels, 4 Pack','Linen Harbor',2999,'bedding','towels','Size:27 x 54 inches|Material:100% cotton|Pack size:4|Care:Machine washable'],
 ['A0HOMEBIN','Brightnest Stackable Storage Bins, 3 Pack','Brightnest',2699,'organization','bins','Capacity:12 liters each|Material:Clear polypropylene|Pack size:3|Lids:Snap-on'],
 ['A0HOMEHNG','Brightnest Velvet Clothes Hangers, 30 Pack','Brightnest',1699,'organization','hanger','Pack size:30|Width:17.5 inches|Surface:Non-slip velvet|Hook:360-degree swivel'],
 ['A0TOYBRK1','Build & Explore City Bus Building Set, 320 Pieces','Build & Explore',2499,'building','bricks','Pieces:320|Recommended age:6+ years|Theme:City transport|Includes:2 figures and bus stop'],
 ['A0TOYBRK2','Build & Explore Botanical Garden Set, 540 Pieces','Build & Explore',3499,'building','flowers','Pieces:540|Recommended age:12+ years|Theme:Botanical display|Height:10 inches'],
 ['A0TOYPUZ1','Trailside Mountain Lake Jigsaw Puzzle, 1000 Pieces','Trailside',1499,'family-games','puzzle','Pieces:1,000|Finished size:27 x 20 inches|Recommended age:12+ years|Material:Recycled board'],
 ['A0TOYBRD1','Tabletime Trail Quest Family Board Game','Tabletime',2299,'family-games','boardgame','Players:2–4|Play time:30 minutes|Recommended age:8+ years|Includes:Board, cards, pawns and dice'],
 ['A0TOYSCR1','Trailside Three-Wheel Kick Scooter for Kids','Trailside',4999,'outdoor-toys','scooter','Recommended age:3–7 years|Handlebar:Adjustable|Maximum rider weight:110 lb|Steering:Lean-to-steer'],
 ['A0TOYBL01','Trailside Size 4 Soccer Ball with Pump','Trailside',1799,'outdoor-toys','ball','Size:4|Recommended age:8–12 years|Cover:Synthetic leather|Included:Hand pump'],
 ['A0BOOKNOV','The Lantern Keeper: A Coastal Novel - Paperback','Harbor Press',1299,'fiction','book','Format:Paperback|Pages:304|Language:English|Genre:Contemporary fiction'],
 ['A0BOOKMYS','Midnight at Orchard House: A Mystery - Paperback','Harbor Press',1499,'fiction','book','Format:Paperback|Pages:352|Language:English|Genre:Mystery'],
 ['A0BOOKCK1','Weeknight Table: 80 Simple Seasonal Recipes','Hearth Editions',2299,'cookbooks','book','Format:Hardcover|Pages:224|Recipes:80|Photography:Full color'],
 ['A0BOOKART','Everyday Watercolor: A Practical Sketchbook Guide','Field Notes Press',1899,'creative-books','book','Format:Paperback|Pages:160|Projects:30|Skill level:Beginner'],
 ['A0BOOKTRV','National Parks: A Weekend Explorer’s Guide','Field Notes Press',1999,'creative-books','book','Format:Paperback|Pages:256|Regions:United States|Includes:Maps and trail checklists'],
 ['A0MUSICJZ','Late Night Quartet: Blue Hour Sessions - Vinyl LP','Late Night Quartet',2499,'vinyl','vinyl','Format:Vinyl LP|Speed:33 1/3 RPM|Discs:1|Genre:Jazz'],
 ['A0MUSICSO','Harbor Lights: Sunday Morning - Vinyl LP','Harbor Lights',2699,'vinyl','vinyl','Format:Vinyl LP|Speed:33 1/3 RPM|Discs:1|Genre:Indie folk'],
 ['A0MUSICEL','City Signals: After Midnight - Audio CD','City Signals',1299,'soundtracks','cd','Format:Audio CD|Tracks:12|Discs:1|Genre:Electronic'],
 ['A0MUSICCL','Chamber Classics: Piano and Strings - Audio CD','Chamber Collective',1199,'soundtracks','cd','Format:Audio CD|Tracks:10|Discs:1|Genre:Classical'],
 ['A0FASHBAG','Trailside Everyday 20L Backpack','Trailside',2999,'bags','backpack','Capacity:20 liters|Laptop sleeve:Up to 15 inches|Material:Recycled polyester|Color:Forest green'],
 ['A0FASHTOT','Linen Harbor Canvas Market Tote','Linen Harbor',1499,'bags','tote','Material:Cotton canvas|Size:15 x 16 inches|Closure:Open top|Care:Spot clean'],
 ['A0FASHCAP','Trailside Adjustable Cotton Baseball Cap','Trailside',1299,'accessories','cap','Material:100% cotton|Fit:Adjustable strap|Size:Adult one size|Color:Navy'],
 ['A0FASHSCK','Linen Harbor Cushioned Crew Socks, 6 Pairs','Linen Harbor',1699,'accessories','socks','Pack size:6 pairs|Size:US shoe 6–12|Material:Cotton blend|Care:Machine washable'],
 ['A0FASHWCH','Northstar Everyday Analog Watch','Northstar',3999,'accessories','watch','Case diameter:40 mm|Movement:Quartz|Strap:Woven nylon|Water resistance:30 meters'],
]
export const EXTRA_PRODUCTS = rows.map(([asin,title,brand,cents,node,artFamily,detail],i) => {
  const specs = Object.fromEntries(detail.split('|').map(s => {const j=s.indexOf(':'); return [s.slice(0,j),s.slice(j+1)]}))
  const department = ancestorNodes(node)[0].id
  return { asin, title, brand, price:cents/100, priceCents:cents, node, department, artFamily, kind:'other',
    slug:title.replace(/[^a-zA-Z0-9]+/g,'-').replace(/-$/,''), rank:70+i,
    typeLabel:specs.Format || nodeById(node).title, platformLabel:specs.Platform || (department === 'videogames' ? specs.Compatibility : null),
    esrb:specs.ESRB, format:artFamily === 'game' ? (specs.Format === 'Game card' ? 'cartridge' : 'physical') : 'physical',
    release:null, availability:asin === 'A0ELECPL01' ? 'Currently unavailable' : 'In Stock', stock:asin === 'A0ELECPL01' ? 0 : 20,
    rating:{stars:[4.6,4.4,4.7,4.3,4.8][i%5],count:String(168+i*113)}, bought:`${(i%5+1)*100}+ bought in past month`,
    deal:i%4===0, specs, about:Object.entries(specs).map(([k,v])=>`${k}: ${v}.`),
    keywords:`${nodeById(node).title} ${department} ${Object.values(specs).join(' ')}`,
    addedDate:`2026-${i%3===0?'09':'08'}-${String(i%27+1).padStart(2,'0')}`,
  }
})

export function enrichProduct(p,i) {
  const artFamily = p.artFamily || (p.typeLabel==='Video Game' ? 'game' : p.typeLabel==='Console' ? 'console' : p.department==='music'?'cd':p.department==='stripbooks'?'book': /Grip/.test(p.title)?'grips':/Stand/.test(p.title)?'stand':'controller')
  const platformKey = platformOf(p) || ''
  const node = p.node || (p.department==='videogames' ? p.typeLabel==='Accessory' ? 'gaming-accessories' : platformKey || 'videogames' : p.department==='music'?'soundtracks':'creative-books')
  const nodes = [...new Set([...ancestorNodes(node).map(n=>n.id), ...(platformKey ? [platformKey] : []), ...(p.typeLabel==='Accessory'?['gaming-accessories']:[])])]
  const specs = p.specs || { ...(p.platformLabel?{Platform:p.platformLabel}:{}), Format:p.format==='code-in-box'?'Download code in box':p.typeLabel, Condition:p.condition || 'New', ...(p.kind==='game'?{'Playable date':'November 19, 2026'}:{}) }
  const art = p.catalog500 || p.kind==='game' ? p.art : `/amazon/static/catalog/${p.asin}.svg`
  const photoKey = {
    A0VGCTRL01: 'xbox-controller-black',
    A0ELECHP01:'headphones', A0ELECKB01:'keyboard-white-compact', A0ELECMS01:'mouse',
    A0HOMEKT1:'kettle', A0HOMECUP:'mug-set-cream', A0ELECLT01:'desk-lamp-white', A0HOMEPAN:'frying-pan',
    A0TOYBRK1:'brick-city-bus', A0TOYBRD1:'board-game', A0FASHBAG:'backpack', A0FASHCAP:'cap-navy',
    A0ELECBD01:'earbuds', A0ELECSP01:'speaker', A0ELECWB01:'webcam',
    A0ELECHB01:'usb-hub', A0VGSTOR01:'ssd', A0ELECPL01:'smart-plug',
    A0HOMETWL:'bath-towels', A0HOMEBIN:'storage-bins', A0HOMEHNG:'hangers',
    A0HOMEKNF:'chef-knife', A0FASHTOT:'tote', A0VGHEAD01:'gaming-headset', B0CRPS5SLM:'ps5-console',
    A0TOYSCR1:'scooter-blue',
    A0BOOKNOV:'book-lantern-keeper', A0BOOKMYS:'book-orchard-house', A0BOOKCK1:'book-weeknight-table',
    A0BOOKART:'book-watercolor', A0BOOKTRV:'book-national-parks', A0MUSICJZ:'vinyl-blue-hour',
    A0TOYBRK2:'brick-botanical', A0HOMESHT:'bedding-white', A0FASHWCH:'analog-watch',
  }[p.asin]
  return {...p, photoKey, artFamily, art, gallery:p.catalog500?[art]:[art,`/amazon/static/catalog/${p.asin}-detail.svg`], specs, platformKey,node,nodes,
    priceCents:Math.round(p.price*100), price:Math.round(p.price*100)/100, seller:'Amazon.com', shipper:'Amazon.com',
    stock:p.stock ?? (/Only (\d+)/.exec(p.availability)?.[1] ? Number(/Only (\d+)/.exec(p.availability)[1]) : 20),
    condition:p.condition || 'New', format:p.format || 'physical', deal:p.deal || !!p.dealNote,
    crumbs:ancestorNodes(node).map(n=>n.title), addedDate:p.addedDate || (p.release?'2026-09-23':'2026-06-01'),
    delivery:p.release?(p.kind==='game'?p.delivery:[`FREE delivery ${p.release}`,'Pre-order — ships when released']):['FREE delivery Monday, October 5','Or fastest delivery Tomorrow, October 3'],
  }
}
export const FILTER_KEYS = ['platform','price','delivery','rating','brand','type','condition','seller','availability','min','max','format']
export const values = v => (Array.isArray(v)?v:[v]).map(x=>String(x ?? '')).filter(Boolean)
export function queryString(state, changes={}) {
  const params = new URLSearchParams()
  for (const [key,value] of Object.entries({...state,...changes})) for (const v of values(value)) params.append(key,v)
  return params.toString()
}
