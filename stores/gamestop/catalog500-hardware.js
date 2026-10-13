// Authored local hardware fixtures shared only by the three game retailers.
// Kits have different included equipment; construction ranges have functional
// material/interface differences. None are color or numbered-size clones.
const slug = value => value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')
const read = text => text.trim().split('\n').map(line=>line.split('|'))
export const hardwareFixtures = []
const add=(title,category,type,price,specs,platform=null,condition='New')=>hardwareFixtures.push({
  id:`gear-${slug(title)}`,title,category,type,catalogType:category==='Consoles'?'console':'accessory',catalogPlatform:platform,
  price,stock:6+hardwareFixtures.length%5,condition,specs,brand:'CoreTech',
  art:`/gamestop/static/catalog500/${type}.svg`,photo:null,
  description:`${title}. ${Object.entries(specs).map(([k,v])=>`${k}: ${v}`).join('. ')}.`,
  keywords:`${title} ${category} ${Object.values(specs).join(' ')}`,catalogRange:'game-retail-500',
})
// Platform-specific cases, mounts and protection have different physical fit;
// the console kits include restored hardware and clearly listed peripherals.
for(const [platform,label,model,storage,medium,portable,basePrice] of read(`
xbox|Xbox Series X|Series X tower|1 TB SSD|Disc and downloads|no|379
xbox-one|Xbox One|One S console|1 TB hard drive|Disc and downloads|no|179
xbox-360|Xbox 360|360 S console|250 GB hard drive|Disc|no|119
ps5|PlayStation 5|PS5 disc console|1 TB SSD|Disc and downloads|no|389
ps4|PlayStation 4|PS4 Slim console|1 TB hard drive|Disc and downloads|no|189
ps3|PlayStation 3|PS3 Slim console|320 GB hard drive|Disc|no|129
switch-2|Nintendo Switch 2|Switch 2 hybrid console|256 GB internal|Game card and downloads|yes|349
switch|Nintendo Switch|Switch hybrid console|32 GB internal|Game card and downloads|yes|199
nintendo-ds|Nintendo DS|DS Lite handheld|Game-card storage|DS game card|yes|89`)) {
 const handheld=portable==='yes', isDS=platform==='nintendo-ds'
 add(`Restored ${label} starter console kit`,'Consoles',isDS?'dual-screen':handheld?'handheld':'console',Number(basePrice),{System:model,Storage:storage,Media:medium,Includes:isDS?'Handheld, stylus and matching charger':handheld?'Hybrid console, detachable controllers, dock and matching power supply':'Console, one compatible controller, HDMI cable and power supply',Condition:'Tested restored hardware; cosmetic wear may be present',Games:'Sold separately'},platform,'Refurbished')
 add(`Restored ${label} shared-play console kit`,'Consoles',isDS?'dual-screen':handheld?'handheld':'console',Number(basePrice)+(isDS?79:49),{System:model,Storage:storage,Media:medium,Includes:isDS?'Two DS Lite handhelds, two styluses and two matching chargers':handheld?'Hybrid console, dock, power supply and one extra compatible gamepad':'Console, two compatible controllers, HDMI cable and power supply',Condition:'Tested restored hardware; cosmetic wear may be present',Games:'Sold separately; multiplayer requirements depend on the game'},platform,'Refurbished')
 add(`${label} fitted travel organizer`,'Carry Cases','case',handheld?24.99:49.99,{Compatibility:model,Construction:'Padded EVA shell with molded device recess',Storage:handheld?'Device, game cards and charging lead':'Console, one controller and cables',Includes:'One carrying case; hardware not included'},platform)
 add(`${label} ventilated display cradle`,'Console Stands','stand',19.99,{Compatibility:model,Construction:'Powder-coated steel with silicone contact pads',Placement:handheld?'Angled tabletop rest':'Stable tabletop console support',Ventilation:'Open sides; keep all device vents clear'},platform)
 add(`${label} dust-protection storage cover`,'Console Protection','cover',14.99,{Compatibility:model,Material:'Washable woven polyester with soft lining',Use:'Cover the powered-off device during storage',Caution:'Remove completely before operating or charging'},platform)
 add(`${label} fitted accessory transit pouch`,'Carry Cases','case',16.99,{Compatibility:isDS?'DS Lite stylus, game cards and matching charging lead':`${label} controller and charging lead`,Construction:'Water-resistant textile shell with padded dividers',Closure:'Full-length zipper',Includes:'Pouch only'},platform)
 add(`${label} media archive case`,'Game Storage','case',18.99,{Compatibility:medium.startsWith('Disc')?'Standard optical game discs':isDS?'Nintendo DS game cards':`${label} game cards`,Capacity:medium.startsWith('Disc')?'24 disc sleeves':'24 molded game-card slots',Construction:'Rigid polypropylene case with indexed spaces',Includes:'Storage case; games not included'},platform)
}
const ranges = [
 ['Controllers','controller',[
  ['USB direct-input','USB controller','Wired USB-A; Windows PC','A direct USB connection needs no charging.'],
  ['Bluetooth rechargeable','Wireless controller','Bluetooth; Windows PC','An internal rechargeable battery supports cable-free play; USB charging lead included.'],
 ],read(`
symmetrical gamepad|39|Two analogue sticks and four face buttons
offset-stick gamepad|39|Offset analogue sticks and textured grips
leverless arcade controller|89|Directional buttons and eight action keys
eight-button arcade stick|79|Ball-top joystick and replaceable action buttons
compact flight stick|69|Twist rudder control and throttle slider
dual-throttle control panel|89|Two independent throttle levers and mode switches
one-hand game controller|59|Thumb joystick and reachable finger buttons
retro directional pad|29|Four-way directional pad and six action buttons
programmable macro pad|39|Twelve individually assignable mechanical buttons
steering control yoke|99|A rotating yoke and thumb-operated action buttons`) ],
 ['Headsets','headphones',[
  ['Studio wired','Wired audio','3.5 mm stereo plug','Passive analogue audio needs no battery.'],
  ['Low-latency radio','Wireless audio','USB radio transmitter; Windows PC','A supplied USB transmitter carries audio; headset charges over USB-C.'],
 ],read(`
closed-back gaming headset|49|Over-ear cups and a detachable boom microphone
open-back gaming headset|59|Vented ear cups and an adjustable boom microphone
on-ear communication headset|39|Lightweight pads and a flip-to-mute microphone
single-ear chat headset|29|One earcup leaves the other ear open to the room
in-ear gaming earphones|29|Silicone tips and an inline speech microphone
folding travel headset|49|Hinged ear cups and a fitted storage pouch
dual-driver listening headset|69|Separate low and high frequency drivers
broadcast monitoring headphones|79|Closed over-ear cups without a microphone
neckband communication headset|39|Behind-neck support with adjustable microphone
desk speaker pair|59|Two powered near-field speakers with a volume dial`) ],
 ['PC Peripherals','keyboard',[
  ['USB desktop','Wired input','USB-A host connection','A detachable USB cable connects directly to the computer.'],
  ['Dual-mode portable','Wireless input','Bluetooth or USB radio; Windows PC','A rechargeable design supports two wireless connection modes.'],
 ],read(`
full-size mechanical keyboard|69|Separate number pad and replaceable mechanical key switches
tenkeyless mechanical keyboard|59|Dedicated navigation keys without a number pad
compact split keyboard|79|Two angled halves support a separated typing position
low-profile keyboard|59|Shallow mechanical keys and folding rear supports
ortholinear keyboard|69|Keys arranged in aligned rows and columns
programmable number pad|29|A standalone numeric keypad with two macro keys
media editing keypad|49|A rotary dial and twelve shortcut keys
ambidextrous optical mouse|29|Symmetrical shell and two side buttons per side
ergonomic vertical mouse|39|Upright grip and adjustable optical sensitivity
thumb-operated trackball|49|Stationary base with a thumb-operated tracking ball`) ],
 ['Storage','ssd',[
  ['USB 10Gbps','USB storage','USB 3.2 Gen 2, up to 10 Gbps','A 10 Gbps interface connects to compatible USB hosts.'],
  ['USB4 40Gbps','USB4 storage','USB4, up to 40 Gbps','A USB4 interface needs a compatible host and cable for full link speed.'],
 ],read(`
portable solid-state drive|79|1 TB flash storage in a pocket enclosure
desktop solid-state drive|129|2 TB flash storage with an external power adapter
dual-drive backup enclosure|69|Two drive bays; drives sold separately
tool-free NVMe enclosure|39|One M.2 2280 NVMe bay; drive sold separately
dual-NVMe editing enclosure|89|Two M.2 NVMe bays with independent drive access
storage docking station|79|One NVMe bay plus two USB accessory ports
rugged field storage drive|119|1 TB flash storage inside a shock-buffered shell
encrypted portable drive|149|1 TB storage with local PIN keypad access
desktop archive drive|159|4 TB solid-state storage with a fixed desktop stand
compact scratch drive|59|512 GB flash storage for temporary working files`) ],
 ['Mounts','stand',[
  ['Folded steel','Steel mounting hardware','Powder-coated steel','Folded steel plates form a rigid bolted frame.'],
  ['Extruded aluminium','Aluminium mounting hardware','Anodised aluminium','Extruded rails allow sliding position adjustment.'],
 ],read(`
single monitor riser|29|A raised 24 by 10 inch platform; maximum load 10 kg
dual monitor shelf|49|A 40 inch desk shelf; maximum combined load 15 kg
desktop microphone arm|49|A clamped articulated arm with standard microphone thread
headphone hanging bracket|19|An under-desk hook with a broad padded contact surface
camera desktop mount|29|An adjustable post with a quarter-inch camera screw
controller display rack|24|Two separate controller cradles with padded contacts
racing pedal mounting plate|49|A drilled mounting plate for compatible pedal bases
flight-stick desk clamp|49|A lowered support plate with adjustable desk clamp
under-desk computer tray|59|An adjustable tray for a tower up to 15 kg
tablet broadcast stand|29|An adjustable clamp for tablets 7 to 11 inches wide`) ],
 ['Carry Cases','case',[
  ['Molded EVA','EVA protective case','EVA foam and woven nylon','A molded shock-buffering shell surrounds a fitted interior.'],
  ['Rigid polycarbonate','Rigid protective case','Polycarbonate and foam','A hard case uses replaceable foam inserts and two latches.'],
 ],read(`
full-size keyboard case|39|Interior designed for a 44 by 15 cm keyboard
split-keyboard travel case|39|Two padded compartments hold separate keyboard halves
mouse and cable case|19|Divided space for a mouse and coiled cable
headset transit case|29|Deep over-ear cup recesses and a cable pocket
arcade-stick carry case|49|Interior designed for a 40 by 25 cm arcade controller
flight-stick transport case|49|Tall fitted interior protects a joystick grip
portable-drive organizer|24|Six separate pockets for small drives and leads
camera-and-mic case|49|Adjustable dividers protect a compact streaming kit
charging-kit organizer|24|Separate compartments keep power adapters apart
trading-card travel vault|39|Rigid card boxes fit inside two padded compartments`) ],
 ['Cables','cable',[
  ['Direct connection','Direct cable','Single continuous cable','A flexible insulated cable links matching host and peripheral ports.'],
  ['Panel-mount extension','Panel cable','Fixed panel socket and extension lead','A screw-mounted socket moves the connection to a desk or equipment panel.'],
 ],read(`
USB-C data lead|14|USB-C to USB-C; 10 Gbps data and up to 60 W power with compatible devices
USB-A peripheral lead|12|USB-A to USB-B; USB 2.0 data for compatible peripherals
USB-C monitor lead|19|USB-C display connection; requires DisplayPort Alt Mode at the host
HDMI display lead|19|HDMI to HDMI; compatible display ports required
DisplayPort display lead|19|DisplayPort to DisplayPort; locking plug connection
optical audio lead|14|TOSLINK optical audio between compatible sockets
stereo headset extension|12|3.5 mm four-pole TRRS; preserves microphone contacts
balanced microphone lead|19|Three-pin XLR balanced microphone connection
Ethernet network lead|14|RJ45 Cat6 connection for a wired local network
USB Micro-B charging lead|12|USB-A to Micro-B; USB 2.0 data and 5 V power`) ],
 ['Desk Accessories','desk',[
  ['Laminated bamboo','Bamboo desk accessory','Laminated bamboo','A rigid laminated surface is finished with a protective clear coating.'],
  ['Recycled polymer','Polymer desk accessory','Recycled polypropylene','A molded wipe-clean shell resists occasional splashes.'],
 ],read(`
desk cable channel|19|An open 50 cm trough routes loose leads below the desk
monitor-side storage shelf|24|A clamp-on 20 by 15 cm surface holds small tools
controller resting tray|19|A raised-edge tray holds two controllers without charging them
keyboard wrist support|19|A smooth low support sits in front of a full-size keyboard
desktop pen organizer|14|Four upright compartments separate writing tools
streaming note stand|19|An angled panel and bottom lip hold cue cards
game-case bookends|24|Two weighted end supports keep boxed games upright
portable-console rest|19|An angled open stand supports a handheld without obstructing vents
under-desk accessory drawer|29|A shallow slide-out drawer stores small peripherals
headphone display pedestal|24|A curved top supports a headphone headband without clamping`) ],
]
for(const [category,type,constructions,designs] of ranges) for(const [name,cost,feature] of designs) for(const [label,build,interfaceSpec,detail] of constructions) {
 const illustratedType=type==='keyboard'&&/mouse|trackball/.test(name)?'mouse':name==='desk speaker pair'?'speakers':/arcade/.test(name)&&type==='controller'?'arcade':name==='compact flight stick'?'joystick':name==='dual-throttle control panel'?'throttle':name==='steering control yoke'?'yoke':/pad|keypad/.test(name)&&/programmable|media/.test(name)?'keypad':name==='in-ear gaming earphones'?'earphones':type
 add(`${label} ${name}`,category,illustratedType,Number(cost),{Construction:build,Interface:interfaceSpec,Features:feature,Details:detail,Includes:'One listed accessory and the connection or mounting parts described',Use:'Check device ports, dimensions and requirements before connecting'},category==='Carry Cases'?null:'pc')
}
