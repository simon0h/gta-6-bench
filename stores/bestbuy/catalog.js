// Deterministic local merchandise fixtures. Names, prices and inventory are not live offers.
export const DEPARTMENTS = [
  ['tv-home-theater', 'TV & Home Theater', 'Movie nights, live sports and everything in between.'],
  ['computers-tablets', 'Computers & Tablets', 'Build a workspace for your next big idea.'],
  ['headphones-audio', 'Headphones & Audio', 'Listen your way, at home or on the go.'],
  ['phones-wearables', 'Cell Phones & Wearables', 'Stay connected with unlocked phones and everyday wearables.'],
  ['smart-home', 'Smart Home & Security', 'Useful upgrades for a more connected home.'],
  ['appliances', 'Appliances & Floor Care', 'Make everyday routines a little easier.'],
  ['cameras', 'Cameras & Camcorders', 'Capture the moments that matter.'],
  ['gaming', 'Video Games & Gaming', 'Consoles, accessories and your next adventure.'],
].map(([id, name, description]) => ({ id, name, description }))
// Family, department, category, brand, model/title, price, photo, specifications.
const rows = [
 ['tv','tv-home-theater','TVs','Insignia','55-inch 4K Smart TV',299.99,null,{'Screen Size':'55 inches','Resolution':'3840 × 2160','Refresh Rate':'60 Hz','Inputs':'3 HDMI ports','VESA Mount':'200 × 200 mm'}],
 ['soundbar','tv-home-theater','Sound Bars','Insignia','2.0-channel Sound Bar - Black',149.99,null,{'Channels':'2.0','Connections':'HDMI ARC, optical, Bluetooth','Subwoofer':'Not included','Width':'35 inches'}],
 ['streaming-device','tv-home-theater','Streaming Media Players','Roku','4K Streaming Player',39.99,null,{'Video Output':'4K HDR at 60 fps','Connections':'HDMI, Wi-Fi','Included':'Voice remote, power adapter','Requirements':'TV with HDMI; internet required'}],
 ['hdmi-cable','tv-home-theater','HDMI Cables','Insignia','6-foot Ultra High Speed HDMI Cable',19.99,null,{'Length':'6 feet','Connector':'HDMI Type A','Bandwidth':'48 Gbps','Supported Output':'Up to 8K at 60 Hz'}],
 ['laptop','computers-tablets','Laptops','Lenovo','Idea Notebook 15.6-inch Laptop',649.99,null,{'Screen Size':'15.6 inches','Processor':'AMD Ryzen 5','Memory':'16 GB','Storage':'512 GB SSD','Operating System':'Windows 11 Home','Weight':'3.8 pounds'}],
 ['laptop','computers-tablets','Laptops','HP','Everyday 14-inch Laptop',449.99,null,{'Screen Size':'14 inches','Processor':'Intel Core i3','Memory':'8 GB','Storage':'256 GB SSD','Operating System':'Windows 11 Home','Weight':'3.2 pounds'}],
 ['laptop','computers-tablets','Laptops','ASUS','Creator 16-inch Laptop',999.99,null,{'Screen Size':'16 inches','Processor':'Intel Core i7','Memory':'16 GB','Storage':'1 TB SSD','Operating System':'Windows 11 Home','Weight':'4.2 pounds'}],
 ['tablet','computers-tablets','Tablets','Samsung','Galaxy 11-inch Wi-Fi Tablet',279.99,null,{'Screen Size':'11 inches','Storage':'128 GB','Connectivity':'Wi-Fi only','Operating System':'Android','Included':'USB-C cable; charger sold separately'}],
 ['monitor','computers-tablets','Monitors','Dell','27-inch QHD IPS Monitor',229.99,'monitor',{'Screen Size':'27 inches','Resolution':'2560 × 1440','Refresh Rate':'100 Hz','Panel':'IPS','Inputs':'HDMI, DisplayPort'}],
 ['keyboard','computers-tablets','Keyboards','Logitech','Full-size Wireless Keyboard - Black',49.99,'keyboard',{'Layout':'US English with number pad','Connectivity':'2.4 GHz USB receiver','Power':'2 AAA batteries','Compatibility':'Windows, ChromeOS'}],
 ['mouse','computers-tablets','Mice','Logitech','Wireless Optical Mouse - Black',24.99,null,{'Sensor':'Optical','Connectivity':'2.4 GHz USB receiver','Buttons':'3','Power':'1 AA battery'}],
 ['webcam','computers-tablets','Webcams','Logitech','Full HD USB Webcam - Black',59.99,'webcam',{'Video Resolution':'1080p at 30 fps','Microphone':'Stereo','Connection':'USB-A','Mount':'Monitor clip / tripod thread'}],
 ['ssd','computers-tablets','Internal SSDs','Samsung','NVMe Internal Solid State Drive',89.99,'ssd',{'Capacity':'1 TB','Interface':'PCIe 4.0 NVMe','Form Factor':'M.2 2280','Compatibility':'Desktop / laptop M.2 slot','Installation':'Installation required; backup existing data'}],
 ['headphones','headphones-audio','Over-Ear Headphones','Sony','Wireless Noise Canceling Headphones - Black',199.99,'headphones',{'Fit':'Over-ear','Noise Cancellation':'Active','Connection':'Bluetooth / 3.5 mm','Battery Life':'Up to 30 hours','Color':'Black'}],
 ['headphones','headphones-audio','Over-Ear Headphones','JBL','Everyday Wireless Headphones - Black',79.99,'headphones',{'Fit':'Over-ear','Noise Cancellation':'Passive isolation','Connection':'Bluetooth','Battery Life':'Up to 40 hours','Color':'Black'}],
 ['earbuds','headphones-audio','True Wireless Earbuds','JBL','True Wireless Earbuds with Charging Case - White',69.99,'earbuds',{'Fit':'In-ear','Connection':'Bluetooth','Battery Life':'Up to 24 hours with case','Water Resistance':'IPX4','Color':'White'}],
 ['speaker','headphones-audio','Bluetooth Speakers','JBL','Portable Bluetooth Speaker - Black',99.99,'speaker',{'Connection':'Bluetooth','Battery Life':'Up to 12 hours','Water Resistance':'IP67','Charging':'USB-C','Color':'Black'}],
 ['phone','phones-wearables','Unlocked Cell Phones','Samsung','Galaxy Unlocked Smartphone - Black',499.99,'smartphone',{'Display':'6.5-inch OLED','Storage':'128 GB','Network':'Unlocked 5G; carrier compatibility required','Operating System':'Android','Color':'Black'}],
 ['phone-case','phones-wearables','Cell Phone Cases','Insignia','Protective Case for Galaxy 6.5-inch Fixture Phone',19.99,null,{'Compatibility':'Galaxy Unlocked Smartphone fixture only','Material':'TPU / polycarbonate','Color':'Clear','Included':'Case only; phone sold separately'}],
 ['smartwatch','phones-wearables','Smartwatches','Samsung','40mm Fitness Smartwatch - Black',179.99,null,{'Case Size':'40 mm','Connectivity':'Bluetooth / Wi-Fi; no cellular','Features':'Heart rate, sleep and activity tracking','Compatibility':'Android phone required','Battery Life':'Up to 40 hours'}],
 ['security-camera','smart-home','Security Cameras','Blink','Outdoor Wireless Security Camera - White',89.99,null,{'Video Resolution':'1080p','Power':'2 AA lithium batteries','Connectivity':'2.4 GHz Wi-Fi','Usage':'Indoor / outdoor','Storage':'Cloud subscription sold separately'}],
 ['doorbell','smart-home','Video Doorbells','Ring','Wired HD Video Doorbell - Silver/Black',59.99,null,{'Video Resolution':'1080p','Power':'Existing 16–24V AC doorbell wiring required','Connectivity':'2.4 GHz Wi-Fi','Installation':'Wired installation required','Storage':'Cloud subscription sold separately'}],
 ['thermostat','smart-home','Smart Thermostats','Google','Wi-Fi Smart Thermostat - White',129.99,null,{'Compatibility':'Select 24V HVAC systems','Power':'C-wire may be required','Control':'App / on-device','Connectivity':'Wi-Fi','Installation':'Check wiring compatibility before purchase'}],
 ['microwave','appliances','Microwaves','Insignia','0.9 cu. ft. Countertop Microwave - Stainless Steel',89.99,null,{'Capacity':'0.9 cubic feet','Power':'900 watts','Dimensions':'19 × 11 × 15 inches','Installation':'Countertop only','Electrical':'120V grounded US outlet'}],
 ['coffee-maker','appliances','Coffee Makers','DeLonghi','Compact Espresso Machine - Stainless Steel',179.99,'espresso-machine',{'Type':'Espresso','Water Tank':'34 ounces','Milk Frother':'Steam wand','Included':'Portafilter and two baskets','Electrical':'120V US outlet'}],
 ['stand-mixer','appliances','Stand Mixers','KitchenAid','5-quart Tilt-Head Stand Mixer - Red',329.99,'stand-mixer',{'Bowl Capacity':'5 quarts','Speeds':'10','Included':'Bowl, beater, dough hook, wire whip','Color':'Red','Electrical':'120V US outlet'}],
 ['toaster','appliances','Toasters','Insignia','2-slice Wide-Slot Toaster - Cream',29.99,'toaster',{'Slices':'2','Controls':'Toast, bagel, cancel','Crumb Tray':'Removable','Color':'Cream','Electrical':'120V US outlet'}],
 ['vacuum','appliances','Vacuum Cleaners','Shark','Cordless Stick Vacuum - Blue',199.99,null,{'Type':'Cordless stick / handheld','Runtime':'Up to 40 minutes','Floor Types':'Hard floor and low-pile carpet','Included':'Crevice tool and charger','Dust Bin':'0.5 liter'}],
 ['air-purifier','appliances','Air Purifiers','Levoit','HEPA Room Air Purifier - White',99.99,null,{'Recommended Room':'Up to 219 square feet','Filter':'HEPA and activated carbon','Fan Speeds':'3','Replacement Filter':'Sold separately','Electrical':'120V US outlet'}],
 ['mirrorless-camera','cameras','Mirrorless Cameras','Canon','Mirrorless Camera Kit with 18–45mm Lens',699.99,null,{'Sensor':'24 MP APS-C','Video':'4K at 30 fps','Lens Mount':'RF mount','Included Lens':'18–45mm kit zoom','Storage':'SD card sold separately'}],
 ['action-camera','cameras','Action Cameras','GoPro','4K Waterproof Action Camera - Black',249.99,null,{'Video':'4K at 60 fps','Stabilization':'Electronic','Water Resistance':'10 meters without housing','Included':'Mounting buckle and USB cable','Storage':'microSD sold separately'}],
 ['console','gaming','Gaming Consoles','Sony','PlayStation 5 Digital Console - White',449.99,'ps5-digital-console',{'Platform':'PlayStation 5','Storage':'1 TB','Disc Drive':'Not included','Included':'Console, controller, HDMI cable, power cord','Internet':'Required for setup and downloads'}],
 ['controller','gaming','Gaming Controllers','Sony','Wireless Controller for PS5 - Black',69.99,'controller-black',{'Platform':'PS5, compatible Windows games','Connection':'Bluetooth / USB-C','Features':'Haptic feedback, adaptive triggers','Color':'Black','Included':'Controller only; USB cable sold separately'}],
 ['headset','gaming','Gaming Headsets','HyperX','Wired Gaming Headset - Black',49.99,'gaming-headset',{'Platform':'PC, PS5, Xbox controllers with 3.5mm','Connection':'3.5 mm wired','Microphone':'Boom microphone','Color':'Black','Audio':'Stereo'}],
]
const photos={tv:'television',soundbar:'soundbar','streaming-device':'streaming-player','hdmi-cable':'hdmi-cable',laptop:'laptop',tablet:'tablet',mouse:'mouse-black',smartwatch:'smartwatch-black','security-camera':'security-camera-white',doorbell:'video-doorbell',thermostat:'thermostat',microwave:'microwave',vacuum:'stick-vacuum-blue','air-purifier':'air-purifier','mirrorless-camera':'mirrorless-camera','action-camera':'action-camera',earbuds:'earbuds-white'}
export const ORDINARY = rows.map(([family,department,category,brand,name,price,photo,specs], i) => ({
  id:`BBYDEPTH${String(i+1).padStart(3,'0')}`, sku:String(7701001+i), kind:'other', family, department, category,
  slug:`${brand}-${name}`.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/-$/,''), title:`${brand} - ${name}`, pageTitle:`${brand} ${name}`,
  brand, model:`LOCAL-${family.toUpperCase()}-${i+1}`, price, listPrice: Math.round((price + (i%3===0 ? 30 : 10))*100)/100,
  rank:i+10, photo:photos[family]||photo, art:(photos[family]||photo) ? null : `/bestbuy/static/products/${family}.svg`, specs,
  preorder:false, finalSale:false, stock: i===30 ? 0 : 9, methodStock:{pickup:i===28 ? 0 : 4,shipping:i===30 ? 0 : 9}, condition:'New',
  rating:{stars:[4.6,4.4,4.7,4.2,4.8][i%5],count:41+i*17}, deal:i%3===0, gift:i%2===0, daily:i===13,
  keywords:`${family.replaceAll('-',' ')} ${department.replaceAll('-',' ')} ${category} ${brand} ${Object.values(specs).join(' ')}`,
  about:[`${name} brings ${category.toLowerCase()} to your everyday setup. Compare the specifications and included accessories below before choosing.`, `Sold and shipped by Best Buy. ${specs.Requirements || specs.Compatibility || specs.Installation || 'See the product specifications for compatibility and power requirements.'}`],
  features:Object.entries(specs).slice(0,3).map(([name,text])=>({name,text})),
  returnPolicy:'Most new unopened items can be requested for return within 15 days of delivery; condition and category exclusions apply.',
}))
// Options retain the same appearance; only capacity/condition changes. No client-supplied prices are accepted.
const variants = (family, values) => { const p=ORDINARY.find(p=>p.family===family); p.variants=values; p.stock=values.reduce((n,v)=>n+v.stock,0) }
variants('laptop',[
 {id:'16gb-512gb',label:'16 GB memory / 512 GB SSD',price:649.99,stock:6,methodStock:{pickup:3,shipping:6},specs:{Memory:'16 GB',Storage:'512 GB SSD'}},
 {id:'16gb-1tb',label:'16 GB memory / 1 TB SSD',price:749.99,stock:3,methodStock:{pickup:0,shipping:3},specs:{Memory:'16 GB',Storage:'1 TB SSD'}},
 {id:'32gb-1tb',label:'32 GB memory / 1 TB SSD',price:849.99,stock:0,methodStock:{pickup:0,shipping:0},specs:{Memory:'32 GB',Storage:'1 TB SSD'}},
])
variants('ssd',[
 {id:'1tb',label:'1 TB',price:89.99,stock:5,methodStock:{pickup:3,shipping:5},specs:{Capacity:'1 TB'}},
 {id:'2tb',label:'2 TB',price:149.99,stock:2,methodStock:{pickup:0,shipping:2},specs:{Capacity:'2 TB'}},
])
variants('headphones',[
 {id:'new',label:'New',price:199.99,stock:5,methodStock:{pickup:3,shipping:5},condition:'New'},
 {id:'open-box',label:'Open-box · Excellent',price:159.99,stock:1,methodStock:{pickup:1,shipping:0},condition:'Open-box',offerNote:'Inspected return. Original accessories included; packaging may show wear.'},
])
