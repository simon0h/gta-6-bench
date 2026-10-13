import { CATALOG_PLATFORMS } from './expanded-games.js'
// Authored physical hardware fixtures. Merchandising families do not imply physical fit;
// accessories are never playable games and are not digital account entitlements.
const home=[
 ['controller','Wired precision controller',39.99,'USB connection; two analog sticks and configurable rear buttons','controller'],
 ['arcade','Arcade fight stick',89.99,'Eight-button arcade layout with table grip feet','arcade'],
 ['wheel','Racing wheel and pedal set',119.99,'Desk clamp, steering wheel, accelerator and brake pedals','wheel'],
 ['charging','Controller charging station',24.99,'Two fitted controller cradles; wall power adapter included','dock'],
 ['headset','Wired gaming headset',34.99,'Over-ear cups, boom microphone and model-specific audio connector','headset'],
 ['stand','Console display stand',19.99,'Model-shaped base and non-slip feet; passive support only','stand'],
 ['travel','Padded console travel case',44.99,'Separate compartments for the console, cables and two controllers','case'],
 ['controller-case','Hard controller carrying case',16.99,'Molded controller compartment with cable pocket','case'],
 ['sleeve','Controller silicone grip sleeve',12.99,'Model-cut openings for buttons and ports; one fitted sleeve','grip'],
 ['caps','Textured analog-stick cap kit',9.99,'Three grip heights; designed for the listed controller geometry','grip'],
 ['trigger','Clip-on trigger extension kit',11.99,'Two removable extensions; tool-free controller-specific fitting','grip'],
 ['dust-cover','Console storage dust cover',14.99,'Fitted fabric cover for powered-off storage; remove before use','cover'],
 ['wall-bracket','Console wall mounting bracket',29.99,'Steel cradle, mounting template and anchor kit','stand'],
 ['controller-mount','Dual controller wall holder',17.99,'Two shaped controller hooks and screw mounting kit','stand'],
 ['media-tower','Game case storage tower',22.99,'Twenty-four slots sized for this platform’s retail game cases','shelf'],
 ['media-wallet','Disc protection wallet',13.99,'Twenty soft disc sleeves with separate booklet pocket','case'],
 ['media-display','Game cover display easel',15.99,'Angled easel fitted to a retail game case','stand'],
 ['cleaning','Console and controller cleaning kit',10.99,'Dry microfiber cloth, soft brush and port dust brush; no solvent','cleaning'],
 ['cable','Replacement display cable',14.99,'Display cable with connectors specified for the listed console','cable'],
 ['power','Replacement power lead',12.99,'Region-appropriate AC lead for this hardware revision; supply brick excluded','cable'],
 ['desk-shelf','Console desk organizer shelf',32.99,'Vented shelf, controller rest and cable-routing channel','shelf'],
 ['flight-case','Hard-shell console transport trunk',79.99,'Model-shaped foam insert, locking clasps and reinforced handle','case'],
]
const handheld=[
 ['travel','Hard-shell handheld travel case',24.99,'Molded handheld recess, zipped cable pocket and soft lining','case'],
 ['grip','Ergonomic handheld grip',19.99,'Snap-on grip shaped for this device with port cutouts','grip'],
 ['screen','Tempered glass screen protector kit',12.99,'Device-sized protectors, alignment frame and cleaning cloth','screen'],
 ['storage','Game card storage case',14.99,'Twenty-four molded slots for this platform’s game cards','case'],
 ['stand','Adjustable tabletop play stand',17.99,'Three viewing angles and model-sized support cradle','stand'],
 ['sleeve','Felt handheld sleeve',16.99,'Device-fitted sleeve with flap closure and soft internal lining','cover'],
 ['strap','Handheld safety wrist strap',8.99,'Soft wrist loop and connector suited to this handheld’s attachment point','cable'],
 ['charging','Desktop handheld charging cradle',24.99,'Console-shaped charging cradle and the device-specific charging lead','dock'],
 ['charger','Travel charging adapter',19.99,'Wall adapter and model-specific charging connector','cable'],
 ['car-charger','In-car handheld charging cable',16.99,'12V vehicle adapter and console-compatible charging connector','cable'],
 ['headphones','Wired stereo headphones',22.99,'Lightweight folding design with 3.5 mm audio connection','headset'],
 ['pouch','Game card zip pouch',10.99,'Eight fitted card sleeves with a soft closing flap','case'],
 ['display','Handheld collection display base',21.99,'Angled passive display base; does not charge the console','stand'],
 ['dust-cover','Fitted handheld storage cover',13.99,'Device-shaped protective fabric cover; remove before use','cover'],
 ['cleaning','Handheld care brush kit',9.99,'Dry screen cloth, soft brush and cleaning instructions','cleaning'],
 ['car-mount','Seatback handheld viewing mount',27.99,'Padded device cradle with adjustable passenger-seat straps','stand'],
 ['travel-organizer','Console and cable travel organizer',29.99,'Separate fitted handheld compartment and accessory pockets','case'],
 ['desk-shelf','Handheld game shelf',24.99,'Console support and twelve platform-sized retail case slots','shelf'],
 ['screen-cloth','Screen cleaning cloth wallet',7.99,'Reusable dry microfiber cloth in a compact device-themed wallet','cleaning'],
 ['cover-display','Retail game box display frame',15.99,'Frame sized for this platform’s game packaging; wall or desk display','stand'],
 ['foam-insert','Protective transport foam insert',18.99,'Device-shaped insert for a standard travel trunk','grip'],
 ['collection-trunk','Handheld collection transport trunk',59.99,'Locking hard shell with fitted console recess and game storage','case'],
]
const models={xbox:['Xbox Series X 1 TB','Xbox Series S 512 GB'],'xbox-one':['Xbox One S 1 TB','Xbox One X 1 TB'],'xbox-360':['Xbox 360 S 250 GB','Xbox 360 E 4 GB'],ps5:['PlayStation 5 Disc Edition','PlayStation 5 Digital Edition'],ps4:['PlayStation 4 Slim 1 TB','PlayStation 4 Pro 1 TB'],ps3:['PlayStation 3 Slim 160 GB','PlayStation 3 Super Slim 500 GB'],'switch-2':['Nintendo Switch 2 Console','Nintendo Switch 2 Travel Starter Bundle'],switch:['Nintendo Switch OLED Console','Nintendo Switch Lite Console'],'nintendo-ds':['Nintendo DS Lite Console','Nintendo DSi Console']}
// Exact fit targets are separate from catalogPlatform, which only controls browsing.
const fits={
 xbox:{model:'Xbox Series X 1 TB (2020 tower)',controller:'Xbox Wireless Controller for Series X|S (standard, not Elite)',exclude:'Xbox Series S and Xbox One bodies'},
 'xbox-one':{model:'Xbox One S 1 TB',controller:'Xbox One S Wireless Controller (standard, not Elite)',exclude:'Xbox One original and Xbox One X bodies'},
 'xbox-360':{model:'Xbox 360 S 250 GB',controller:'Xbox 360 Wireless Controller',exclude:'Xbox 360 original and Xbox 360 E bodies'},
 ps5:{model:'PlayStation 5 Disc Edition (CFI-1000 model group)',controller:'DualSense wireless controller (standard, not Edge)',exclude:'PS5 Digital Edition, CFI-2000 Slim and CFI-7000 Pro bodies'},
 ps4:{model:'PlayStation 4 Slim 1 TB',controller:'DUALSHOCK 4 wireless controller supplied with PS4 Slim',exclude:'PS4 original and PS4 Pro bodies'},
 ps3:{model:'PlayStation 3 Slim 160 GB',controller:'DUALSHOCK 3 wireless controller',exclude:'PS3 original and PS3 Super Slim bodies'},
 'switch-2':{model:'Nintendo Switch 2 with Joy-Con 2 attached',exclude:'Nintendo Switch, Switch OLED and Switch Lite bodies',adapter:'Nintendo Switch 2 AC adapter NGN-01 (US plug) and BEE-011 USB-C cable',connector:'USB-C to USB-C using Nintendo BEE-011 cable',input:'AC 100–240 V; US plug'},
 switch:{model:'Nintendo Switch OLED (HEG-001) with Joy-Con attached',exclude:'Nintendo Switch original, Switch Lite and Switch 2 bodies',adapter:'Nintendo Switch AC adapter HAC-002 (US plug)',connector:'Captive USB-C charging plug on Nintendo HAC-002',input:'AC 100–240 V; US plug'},
 'nintendo-ds':{model:'Nintendo DS Lite (USG-001)',exclude:'Nintendo DS original, DSi and DSi XL bodies',adapter:'Nintendo DS Lite AC adapter USG-002 (USA)',connector:'Nintendo DS Lite proprietary plug to 5.2V IN; not the DSi connector',input:'AC 120 V; US plug'},
}
const controllerFit=new Set(['charging','controller-case','sleeve','caps','trigger','controller-mount'])
function accessory(p,row,index,portable){
 let [suffix,title,price,description,shape]=row
 const fit=fits[p.id],specs={Compatibility:fit.model,'Fit exclusions':fit.exclude,Connection:'None — passive accessory'}
 let fitScope='model',target=fit.model
 if(!portable&&controllerFit.has(suffix)){
  target=fit.controller;specs.Compatibility=target;specs['Fit exclusions']='Other controller shell designs; console body fit is not relevant'
 }
 if(!portable&&['controller','arcade','wheel'].includes(suffix)){
  // These are authored wired devices with platform-specific input electronics,
  // not a claim that a generic USB peripheral works on every console.
  specs.Connection='Wired USB Type-A plug to console USB Type-A host port'
  specs.Protocol=`Dedicated ${p.label} input electronics; not a universal PC-only USB device`
  description+=`; dedicated ${p.label} version with a fixed USB Type-A lead`
 }
 if(!portable&&suffix==='charging'){
  title='Dual controller desktop rest';shape='controller-rest'
  description='Two fitted controller cradles with separate cable-routing channels; passive desk support, with no charging contacts, battery pack, power supply or cables'
 }
 if(!portable&&suffix==='power'){
  title='Console power-cable organizer kit';shape='cable-wrap'
  description='Split woven cable sleeve, six reusable cable ties and adhesive routing clips; all parts are passive and no electrical lead or power supply is included'
  target=`${p.label} cable-management collection`;fitScope='universal'
  specs.Compatibility='Universal external cable bundles up to 20 mm diameter';delete specs['Fit exclusions']
 }
 if(!portable&&suffix==='cable'){
  title='1080p HDMI display cable';shape='hdmi-cable';fitScope='universal';target=`${p.label} display setup`
  description='Two-metre High Speed HDMI cable for up to 1080p at 60 Hz; connects a console HDMI output to a TV or monitor HDMI input'
  specs.Compatibility='Universal HDMI Type-A sockets; not an analogue AV cable';delete specs['Fit exclusions']
  specs.Connection='HDMI Type-A male to HDMI Type-A male; 2 m'
 }
 if(!portable&&suffix==='headset'){
  title='Wired stereo monitoring headphones';shape='headphones';fitScope='universal';target=`${p.label} display setup`
  description='Over-ear stereo headphones for a TV or monitor headphone output; no microphone, wireless link or console USB-audio connection'
  specs.Compatibility='Universal 3.5 mm stereo headphone output on a TV or monitor';delete specs['Fit exclusions']
  specs.Connection='3.5 mm TRS stereo plug; audio output only'
 }
 if(suffix==='cleaning'||suffix==='screen-cloth'){
  fitScope='universal';target=`${p.label} care collection`
  specs.Compatibility='Universal dry exterior-surface care; no electrical connection';delete specs['Fit exclusions']
 }
 if(!portable&&suffix==='media-wallet'){
  fitScope='universal';target=`${p.label} disc collection`
  specs.Compatibility='Universal 12 cm optical discs; not game cards';delete specs['Fit exclusions']
 }
 if(['media-tower','media-display','cover-display','desk-shelf'].includes(suffix))specs['Media fit']=`${p.label} retail game cases; console-sized supports use the listed console model`
 if(portable&&suffix==='screen'){
  if(p.id==='nintendo-ds'){
   title='Dual-screen protective film kit';shape='dual-screen-protectors'
   description='Two flexible clear films cut for the DS Lite upper and lower screens; includes alignment tabs and dry cloth; lower film remains touch and stylus compatible'
  }else description='One tempered-glass screen protector cut for the listed model; alignment frame and dry cleaning cloth'
 }
 if(portable&&suffix==='strap'){
  title='Handheld carry-case wrist tether';shape='strap';fitScope='universal';target=`${p.label} travel collection`
  description='Soft wrist loop with a swivel clip for a carrying-case D-ring; attach to the case, not to a console port or controller rail'
  specs.Compatibility='Universal carrying-case D-ring or fabric loop; case not included';delete specs['Fit exclusions']
 }
 if(portable&&suffix==='charging'){
  title='Handheld charging-cable support stand';shape='stand'
  description=`Fitted tabletop stand with a channel for the original charging lead; no electrical contacts or electronics. Supply your own ${fit.adapter}`
  specs.Connection=`Passive stand; routes the existing ${fit.connector}`
  specs['Power supply']='Not included; this stand does not convert or supply power'
 }
 if(portable&&suffix==='charger'){
  title='Travel AC charging kit';shape='adapter'
  description=`${fit.adapter}, supplied with a separate padded travel pouch; charges the listed handheld using the named Nintendo adapter`
  specs.Connection=fit.connector;specs['AC input']=fit.input;specs['Adapter model']=fit.adapter
 }
 if(portable&&suffix==='car-charger'){
  title='Passenger-seat charging-cable keeper';shape='cable-wrap'
  description='Seatback strap with three soft cable loops and a zipped adapter pocket; passive passenger-area storage, with no vehicle adapter, charging cable or electrical components'
  specs.Connection='None — passive cable and adapter storage';specs['Power supply']='Not included; does not connect to a vehicle socket'
 }
 if(portable&&suffix==='headphones'){
  specs.Connection='3.5 mm TRS stereo plug to handheld headphone socket';shape='headphones'
  description='Lightweight folding stereo headphones with a 3.5 mm TRS plug; listening only, with no microphone'
 }
 return {id:`hardware-${p.id}-${suffix}`,title:`${title} for ${target}`,catalogType:'accessory',catalogPlatform:p.id,fitScope,price,shape,
  description:`${description}. ${fitScope==='model'?`Designed for ${specs.Compatibility}. ${specs['Fit exclusions']?`Excludes ${specs['Fit exclusions']}.`:''}`:`${specs.Compatibility}.`} Console and games are not included.`,
  specs:{...specs,Includes:description,Condition:'New',Brand:'Circuit Workshop'},stock:8+index%11,color:p.color}
}
const slug=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')
export const HARDWARE_SEEDS=CATALOG_PLATFORMS.flatMap(p=>{
 const portable=['switch-2','switch','nintendo-ds'].includes(p.id),legacy=['xbox-one','xbox-360','ps4','ps3','nintendo-ds'].includes(p.id)
 const consoles=models[p.id].map((title,i)=>{
  const travelBundle=p.id==='switch-2'&&i===1
  const includes=(portable?'Console, power supply':'Console, controller, power supply')+(travelBundle?', fitted hard-shell travel case, twelve-slot game-card wallet, screen protector and cable-organizer pouch':'')
  return {id:`hardware-${slug(title)}`,title:`${title}${legacy?' — Refurbished':''}`,catalogType:'console',catalogPlatform:p.id,price:legacy?129.99+i*40:299.99+i*80,
   shape:p.id==='nintendo-ds'?'dual-screen':travelBundle?'handheld-travel-bundle':portable?'handheld':'console',
   description:`${title}. ${legacy?'Inspected refurbished hardware with cosmetic wear.':'New console hardware.'} Includes: ${includes}. Games are sold separately.`,
   specs:{Platform:p.label,Model:p.id==='ps5'?`${title} (CFI-1000 model group)`:travelBundle?'Nintendo Switch 2':title,Condition:legacy?'Refurbished':'New',Includes:includes},stock:5+i,color:p.color}
 })
 return [...consoles,...(portable?handheld:home).map((row,i)=>accessory(p,row,i,portable))]
}).map(p=>({...p,kind:'other',brand:p.catalogType==='console'?(p.catalogPlatform.startsWith('xbox')?'Microsoft':p.catalogPlatform.startsWith('ps')?'Sony':'Nintendo'):'Circuit Workshop',art:`/static/art/catalog500/hardware/${p.id}.svg`}))
export function makeHardwareFixtures({count,platformIds=CATALOG_PLATFORMS.map(p=>p.id)}={}){
 const byPlatform=platformIds.map(id=>HARDWARE_SEEDS.filter(p=>p.catalogPlatform===id))
 const pool=Array.from({length:24},(_,i)=>byPlatform.map(ps=>ps[i]).filter(Boolean)).flat()
 if(!Number.isInteger(count)||count<0||count>pool.length)throw new Error(`Unsupported hardware count ${count}; ${pool.length} fixtures for requested platforms`)
 return pool.slice(0,count).map(p=>({...p,specs:{...p.specs}}))
}
