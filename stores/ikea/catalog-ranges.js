// Authored local product ranges. Each row is a functional design, offered in three
// materially different constructions; finish/size options are not separate listings.
// Native silhouettes show the product form without impersonating an exact model photo.
const silhouettes = {
  seat: 'M33 48H127V91H33Z M43 26H117V70H43Z M39 93H47V106H39Z M113 93H121V106H113Z',
  sofa: 'M19 49H141V91H19Z M30 30H130V72H30Z M78 34H82V72H78Z M28 92H36V105H28Z M124 92H132V105H124Z',
  table: 'M18 39H142V49H18Z M27 49H35V107H27Z M125 49H133V107H125Z',
  shelf: 'M30 16H39V109H30Z M121 16H130V109H121Z M39 18H121V25H39Z M39 57H121V64H39Z M39 99H121V106H39Z',
  cabinet: 'M31 15H129V104H31Z M78 20H82V99H78Z M65 54H70V69H65Z M90 54H95V69H90Z',
  box: 'M30 40H130V103H30Z M27 29H133V40H27Z M64 54H96V60H64Z',
  basket: 'M30 42H130L117 104H43Z M54 43V23H106V43 M47 60H115 M50 78H111',
  bed: 'M21 24H139V105H131V78H29V105H21Z M30 45H130V70H30Z M36 49H73V63H36Z M87 49H124V63H87Z',
  rug: 'M25 22H123L143 101H43Z M42 36H112L125 87H54Z',
  textile: 'M29 24H131V106H29Z M37 32H123V98H37Z M42 43H118 M42 57H118 M42 71H118',
  curtain: 'M20 18H140V23H20Z M28 24H74V108L62 99L51 108L39 99L28 108Z M86 24H132V108L121 99L110 108L98 99L86 108Z',
  vase: 'M63 21H97V43Q121 59 119 84Q118 106 80 107Q42 106 41 84Q39 59 63 43Z',
  pot: 'M40 42H120L110 106H50Z M36 34H124V44H36Z',
  mirror: 'M39 13H121V111H39Z M47 22H113V102H47Z',
  frame: 'M20 27H140V102H20Z M30 37H130V92H30Z',
  lamp: 'M49 25H111L130 69H30Z M76 69H84V103H76Z M55 103H105V110H55Z',
  bowl: 'M25 46Q80 27 135 46Q124 99 80 99Q36 99 25 46Z M29 46Q80 66 131 46',
  plate: 'M22 62a58 38 0 1 0 116 0a58 38 0 1 0 -116 0 M36 62a44 26 0 1 0 88 0a44 26 0 1 0 -88 0',
  mug: 'M39 31H107V90Q73 111 39 90Z M107 43H130V75H107 M43 31Q73 42 103 31',
  jug: 'M48 24H104V101H43V37Z M104 42H128V81H104 M48 24L34 19V31',
  spoon: 'M64 17Q80 7 96 17Q105 40 85 53V110H75V53Q55 40 64 17Z',
  turner: 'M49 15H111L96 64H85V109H75V64H64Z M70 27V49 M80 27V49 M90 27V49',
  tray: 'M22 44H138L129 92H31Z M34 52H126L120 82H40Z',
  house: 'M23 50L80 10L137 50V111H23Z M64 75H96V111 M40 57H60V77H40Z',
}
const woodCare = 'Wipe with a lightly damp cloth and dry. Protect from standing water and hot objects.'
const fabricCare = 'Follow the sewn-in care label. Wash gently at 86°F with similar fabrics and air dry.'
const rows = source => source.trim().split('\n').map(line => line.split('|'))
const constructions = {
  timber: [
    ['Solid pine', 'Pine', 'Natural pine', '#c8a877', 'Solid pine boards with visible grain and screwed joints.', 1],
    ['Bamboo panel', 'Bamboo', 'Natural bamboo', '#c6b07b', 'Laminated bamboo panels give a dense, smooth working surface.', 1.2],
    ['Oak veneer', 'Oak veneer', 'Natural oak', '#af916d', 'Oak veneer over a stable fiberboard core with protected edges.', 1.35],
  ],
  seating: [
    ['Pocket-spring cotton', 'Cotton and pocket springs', 'Natural', '#c3b49a', 'Individually wrapped seat springs and a removable cotton cover support everyday sitting.', 1],
    ['Wool felt', 'Wool felt and foam', 'Stone', '#a8a297', 'A wool-felt cover over a molded foam cushion provides a firm, supportive seat.', 1.2],
    ['Woven rattan', 'Rattan and beech', 'Natural rattan', '#ba9664', 'A handwoven rattan seat and back on a solid beech frame create an airy structure.', 1.1],
  ],
  tables: [
    ['Pine trestle', 'Pine', 'Natural pine', '#c5a47a', 'A solid pine top rests on two broad trestle supports.', 1],
    ['Bamboo steel-frame', 'Bamboo and steel', 'Natural bamboo', '#c5b079', 'A laminated bamboo top is supported by a welded steel frame.', 1.15],
    ['Tempered-glass', 'Tempered glass and steel', 'Clear', '#bcc6c9', 'A tempered-glass top sits on a tubular steel base.', 1.25],
  ],
  woven: [
    ['Cotton flatweave', 'Cotton', 'Natural', '#d4c9b4', 'A tightly woven cotton construction feels smooth and folds for storage.', 1],
    ['Wool herringbone', 'Wool', 'Stone', '#ada597', 'A herringbone wool weave adds texture and insulation.', 1.6],
    ['Recycled-polyester knit', 'Recycled polyester', 'Oatmeal', '#c6beaa', 'A resilient knitted polyester construction gives a springy textured surface.', 1.1],
  ],
  decorative: [
    ['Glazed stoneware', 'Stoneware', 'Sand', '#c8b598', 'A molded stoneware body with a smooth glazed surface.', 1.1],
    ['Brushed steel', 'Steel', 'Silver', '#a8afb1', 'A formed steel body with a brushed protective finish.', 1],
    ['Turned bamboo', 'Bamboo', 'Natural bamboo', '#c1a46f', 'A shaped bamboo body with a clear protective finish.', 1.2],
  ],
  containers: [
    ['Woven seagrass', 'Seagrass', 'Natural', '#ba9e6b', 'A woven seagrass shell with reinforced edges.', 1],
    ['Felt-lined bamboo', 'Bamboo and felt', 'Natural bamboo', '#bcab83', 'A rigid bamboo shell has a removable felt liner to protect contents.', 1.25],
    ['Recycled plastic', 'Recycled polypropylene', 'Stone', '#b8bcb8', 'A lightweight molded shell wipes clean and tolerates occasional splashes.', 0.85],
  ],
  linen: [
    ['Cotton percale', 'Cotton', 'Natural', '#dfd7c4', 'A breathable plain-woven cotton percale fabric with a crisp hand.', 1],
    ['Washed linen', 'Linen', 'Flax', '#bcae96', 'A prewashed linen weave drapes softly and has a naturally textured surface.', 1.65],
    ['Lyocell twill', 'Lyocell', 'Pearl', '#cbc9bf', 'A smooth lyocell twill fabric with fluid drape.', 1.3],
  ],
  tabletop: [
    ['Glazed stoneware', 'Stoneware', 'Sand', '#ccbba0', 'Thick-walled glazed stoneware retains warmth at the table.', 1],
    ['Porcelain', 'Porcelain', 'Ivory', '#eee8dc', 'Fine vitrified porcelain gives a light, smooth everyday vessel.', 1.2],
    ['Tempered-glass', 'Tempered glass', 'Clear', '#b4c7cd', 'A transparent tempered-glass body lets you see the contents.', 0.95],
  ],
  utensils: [
    ['Carved bamboo', 'Bamboo', 'Natural bamboo', '#c0a47b', 'Carved bamboo is gentle on cookware. Hand wash, dry promptly and never soak.', 1],
    ['Stainless steel', 'Stainless steel', 'Silver', '#a6afb3', 'Formed stainless steel suits uncoated cookware. Avoid scraping nonstick finishes.', 1.15],
    ['Silicone-core', 'Silicone and steel', 'Stone', '#b2b7b2', 'A flexible silicone head covers a rigid steel core. Keep away from direct flame.', 1.2],
  ],
  bath: [
    ['Cotton terry', 'Cotton', 'Natural', '#d8d0bc', 'Looped cotton terry provides an absorbent everyday surface.', 1],
    ['Linen waffle', 'Linen', 'Flax', '#bdb09a', 'An open waffle-weave linen structure dries readily between uses.', 1.4],
    ['Bamboo-viscose blend', 'Viscose and cotton', 'Pearl', '#cac9bb', 'A soft viscose-and-cotton blend combines a smooth face with an absorbent backing.', 1.25],
  ],
}
// name | width,depth,height (in) | functional detail | price | silhouette
const ranges = [
  ['sofas-armchairs','Furniture',['living-room','bedroom'],'seating',rows(`
reading armchair|30,32,34|Upright back and broad arms for a reading corner.|179|seat
two-seat settee|57,29,32|Two places on a compact frame for a small sitting room.|269|sofa
armless lounge chair|27,34,30|An open-sided seat lets you approach from either side.|159|seat
conversation bench|48,23,30|A shared seat with a supportive low back.|189|sofa
corner lounge unit|36,36,31|An L-shaped back makes a freestanding corner seat.|219|seat
chaise longue|31,62,31|An extended seat supports your legs while reading.|259|seat
low lounge stool|27,24,17|A broad backless seat also serves as a footrest.|79|seat
high-back rest chair|29,34,42|A tall back supports relaxed upright sitting.|239|seat
window-seat bench|60,22,26|A low profile keeps the view above the seat open.|229|sofa`) ],
  ['living-tables','Furniture',['living-room'],'tables',rows(`
nesting table pair|24,24,20|Two independent tables tuck together; smaller table is 18 by 18 by 16 inches.|79|table
round coffee table|32,32,17|A circular top leaves no sharp corners in a seating group.|99|table
sofa console table|55,13,29|A narrow top provides a surface behind a sofa.|109|table
sliding sofa side table|18,14,25|An open-sided base reaches over the edge of a seat.|49|table
magazine side table|21,18,22|An angled lower rack holds magazines below the tabletop.|59|table
two-tier tea table|30,22,20|A full lower shelf keeps serving accessories close.|79|table
oval gathering table|45,24,17|An oval top provides a long shared surface.|129|table
corner accent table|24,24,24|A triangular top fits a room corner.|59|table
tray-top occasional table|22,22,23|A removable raised-edge tray sits on a folding support.|69|tray`) ],
  ['rugs-cushions','Textiles',['living-room','bedroom'],'woven',rows(`
hall runner|28,94,0.25|A narrow floor textile for an entry passage; use a non-slip underlay.|49|rug
bedside rug|24,48,0.25|A small floor textile softens the landing beside a bed; use a non-slip underlay.|29|rug
round reading rug|55,55,0.3|A circular floor textile anchors a chair; use a non-slip underlay.|69|rug
lumbar cushion|24,12,5|A filled rectangular cushion supports the lower back.|19|textile
floor cushion|26,26,6|A thick filled cushion provides occasional floor seating.|39|textile
bolster cushion|8,30,8|A filled cylindrical cushion supports an arm or neck.|24|textile
sofa throw|51,67,0.2|A fringed throw adds a light layer for a sofa.|24|textile
lap blanket|39,51,0.2|A bound-edge blanket covers the lap without dragging.|19|textile
quilted seat pad|16,16,1.5|A filled square pad has corner ties for a dining chair.|12|textile`) ],
  ['decoration','Decoration',['living-room','bedroom'],'decorative',rows(`
bud vase|3,3,7|A narrow-neck vase holds a few stems; use a removable glass liner for water.|12|vase
indoor cachepot|8,8,8|A decorative outer pot holds a nursery pot up to 7 inches; use a waterproof inner liner.|19|pot
pillar candle stand|5,5,6|A recessed holder supports a flameless LED pillar candle, sold separately.|9|pot
table mirror|10,6,15|A glass mirror sits within a rigid frame on a stable base.|24|mirror
jewelry tray|9,6,1|A shallow divided tray separates small accessories.|12|tray
portrait frame|10,1,12|A protective clear panel displays one 8 by 10 inch print.|14|frame
decorative bowl|11,11,4|An open bowl holds dry decorative objects; not intended for food.|19|bowl
table lamp base|7,7,13|An E26 socket accepts an LED bulb up to 8 W; shade and bulb sold separately.|29|lamp
LED lantern housing|7,7,12|A handle and open-sided enclosure hold a battery LED candle; no flame use.|24|lamp`) ],
  ['shelving','Storage',['living-room','home-office'],'timber',rows(`
ladder bookcase|25,15,70|Five graduated shelves lean within a fixed angled frame; secure to the wall.|99|shelf
cube display unit|30,15,30|Four open compartments organize books and boxes.|69|shelf
corner shelving tower|20,20,63|Five triangular shelves use an unused room corner.|79|shelf
low media shelf|55,15,21|Three open bays keep media equipment ventilated.|89|shelf
wall display ledge|32,5,3|A raised front lip supports framed pictures; wall fixings selected for your wall.|19|shelf
arch-top bookcase|30,13,72|An arched upper frame and four shelves display books.|129|shelf
room-divider shelf|58,15,58|Open compartments divide a room while letting light through; anchor securely.|149|shelf
record storage console|32,17,32|Deep upright compartments accommodate record sleeves.|109|shelf
wall cubby shelf|24,10,24|Four wall-mounted cubbies store small objects; choose suitable wall fixings.|49|shelf`) ],
  ['wardrobes-dressers','Storage',['bedroom'],'timber',rows(`
sliding-door wardrobe|60,24,79|Two sliding doors open onto a clothes rail and adjustable shelves.|299|cabinet
open garment wardrobe|39,20,70|An open hanging rail stands above two shoe shelves.|149|cabinet
six-drawer dresser|55,18,32|Six independently opening drawers organize folded clothing.|229|cabinet
lingerie chest|22,16,48|Five shallow drawers keep small garments separate.|149|cabinet
blanket chest|40,18,22|A hinged top and ventilated back hold folded bedding; use the supplied lid stay.|129|box
wardrobe shelf tower|20,22,75|Five adjustable shelves hold folded clothes behind one door.|179|cabinet
double hanging wardrobe|47,24,79|Two rails provide separate upper and lower hanging sections.|249|cabinet
vanity drawer cabinet|28,18,29|Three drawers sit below an open grooming shelf.|139|cabinet
linen cupboard|32,18,67|Double doors enclose four adjustable shelves for household linens.|219|cabinet`) ],
  ['small-storage','Storage',['living-room','bedroom','home-office'],'containers',rows(`
under-bed storage box|30,20,7|A low lidded container stores seasonal linens beneath a bed.|24|box
desktop letter organizer|13,10,7|Three upright sections separate letters and notebooks.|14|box
divided sock organizer|12,12,5|Nine internal cells separate small garments.|9|box
handled knitting basket|15,12,12|An open top and carrying handles keep a craft project portable.|19|basket
stacking pantry bin|14,10,8|An open front keeps packaged food accessible when bins stack.|14|box
cable storage box|16,7,6|Side openings route unplugged loose cables; do not enclose powered equipment.|12|box
magazine file|4,10,12|An upright sloped opening holds papers and magazines.|7|box
compartment craft caddy|14,10,10|A central handle and six compartments separate craft tools.|19|basket
lidded keepsake box|12,9,5|A lift-off lid protects letters and small mementos.|12|box`) ],
  ['hallway-storage','Storage',['living-room','bedroom'],'timber',rows(`
entry shoe bench|39,14,18|Two open shelves below the seat hold everyday shoes.|69|shelf
coat stand|22,22,69|A freestanding central post supports six coat hooks.|49|shelf
wall hook rail|32,4,5|Six fixed hooks keep coats off the floor; wall fixings sold separately.|19|shelf
umbrella stand|10,10,24|A tall ventilated holder includes a removable drip tray.|29|box
tilt-out shoe cupboard|32,10,42|Two pivoting compartments hold shoes vertically; secure to the wall.|99|cabinet
entry mirror cabinet|24,8,32|A mirrored door conceals shallow shelves for entry essentials.|89|mirror
boot storage rack|30,16,29|A tall lower bay stores boots below a shoe shelf.|59|shelf
rolling entry trolley|25,15,31|Two shelves and a top tray move on four locking casters.|69|shelf
hall tree bench|40,17,70|A coat rail and overhead shelf stand above a sitting bench; anchor to the wall.|149|shelf`) ],
  ['beds-bedside','Furniture',['bedroom'],'timber',rows(`
platform bed frame|63,83,13|A low slatted frame fits a 60 by 80 inch mattress; mattress sold separately.|199|bed
canopy bed frame|65,85,80|Four posts support an open canopy frame for a 60 by 80 inch mattress.|349|bed
storage daybed frame|42,80,31|Three lower drawers sit under a frame for a 38 by 75 inch mattress.|279|bed
trundle bed frame|42,80,24|A pull-out lower frame provides a second 38 by 75 inch sleeping space.|299|bed
headboard storage unit|66,8,43|Side cubbies flank a headboard designed for a 60 inch bed.|129|shelf
floating bedside shelf|18,13,10|A drawer and top ledge mount beside a bed; choose suitable wall fixings.|49|shelf
bedside drawer chest|20,16,25|Two drawers conceal nighttime essentials.|79|cabinet
bedroom dressing bench|43,16,18|A broad seat stands at the foot of the bed.|69|seat
open bedside table|18,15,24|A raised-edge top and lower shelf keep essentials close.|49|table`) ],
  ['bed-linen-curtains','Textiles',['bedroom'],'linen',rows(`
duvet cover set|90,90,0.2|One queen duvet cover and two 20 by 30 inch pillowcases; duvet not included.|39|textile
fitted sheet|60,80,15|An elasticated queen sheet fits a mattress up to 15 inches deep.|24|textile
flat sheet|90,102,0.1|A hemmed queen top sheet layers beneath a blanket.|24|textile
envelope pillowcase pair|20,30,0.1|Two pillowcases have envelope closures; pillows not included.|12|textile
bed valance|60,80,16|A fitted platform panel has a 16 inch drop around three sides.|29|textile
quilted bedspread|96,100,0.4|A lightly filled quilt covers a queen bed.|59|textile
tab-top curtain pair|57,98,0.1|Two curtain panels have sewn tabs for a curtain rod; rod sold separately.|39|curtain
privacy cafe curtain pair|28,36,0.1|Two short rod-pocket panels cover the lower portion of a window.|19|curtain
tie-top canopy panel|55,118,0.1|One lightweight panel ties to an adult bed canopy frame; keep clear of lamps.|29|curtain`) ],
  ['desks-office-chairs','Furniture',['home-office'],'timber',rows(`
writing desk with drawer|44,22,30|A shallow drawer keeps stationery beneath the working surface.|129|table
corner workstation|55,55,30|An L-shaped top uses a corner with working space on both sides.|179|table
wall-mounted fold-down desk|32,22,30|A hinged desktop folds against a wall cabinet when closed.|99|table
standing-height desk|47,24,42|A fixed-height work surface supports standing tasks; measure your working height.|139|table
trestle drawing desk|55,28,30|A broad fixed top leaves room for paper and drawing tools.|159|table
secretary desk|34,20,43|A drop-front writing surface opens below letter cubbies.|179|cabinet
mobile laptop desk|28,18,30|A compact working surface rolls on four locking casters.|79|table
double work table|79,24,30|A long top provides two adjacent work positions.|199|table
back-supported work stool|17,18,34|A contoured seat and short back suit occasional seated tasks.|69|seat`) ],
  ['work-lights-accessories','Accessories',['home-office'],'timber',rows(`
monitor riser|24,10,5|A raised platform leaves storage space beneath a monitor.|19|shelf
laptop incline stand|13,11,6|An angled open stand lifts a laptop screen; use a separate keyboard.|19|shelf
desktop pen cup|4,4,5|A deep open container keeps writing tools upright.|5|pot
stacking letter tray|13,10,3|A shallow tray holds letter-size paper; stack up to three.|9|tray
bookend pair|6,6,8|Two L-shaped supports keep a short row of books upright.|12|shelf
desktop organizer shelf|20,8,12|A raised shelf and three lower compartments organize supplies.|24|shelf
under-desk cable tray|24,5,4|An open tray supports loose cables below a desk; mount with supplied brackets.|14|tray
tablet reading stand|9,8,11|An angled panel and retaining lip support a tablet or book.|12|shelf
headphone desk stand|6,6,11|A broad curved hook supports over-ear headphones.|9|shelf`) ],
  ['dining-furniture','Furniture',['kitchen'],'timber',rows(`
drop-leaf dining table|48,30,30|Two hinged leaves reduce the top to 24 inches wide when folded.|149|table
round pedestal dining table|42,42,30|A central pedestal leaves space for four chairs.|199|table
extendable dining table|71,35,30|A stored insert extends the top from 55 to 71 inches.|279|table
kitchen island table|47,28,36|A preparation-height top stands over two open shelves.|219|table
counter-height stool|16,16,26|A backless seat and footrest fit many 36 inch counters.|49|seat
dining bench|55,15,18|An open bench seats two along a dining table.|79|seat
slat-back dining chair|18,21,33|A curved slatted back supports an upright dining position.|59|seat
folding breakfast table|31,28,30|A hinged base folds for storage after a small meal.|99|table
kitchen serving trolley|31,18,34|A top serving surface and two shelves move on locking casters.|99|shelf`) ],
  ['tableware','Kitchen',['kitchen'],'tabletop',rows(`
pasta bowl|10,10,2|A wide shallow bowl leaves room for pasta and sauce.|8|bowl
breakfast cereal bowl|6,6,3|A deep bowl holds up to 20 fluid ounces.|5|bowl
side plate|8,8,0.8|A small flat plate serves bread, fruit or dessert.|4|plate
oval serving platter|15,10,1.5|A broad oval platter holds shared cold or warm dishes.|12|plate
espresso cup|3,2.5,2.5|A handled cup holds 3 fluid ounces.|3|mug
tea cup and saucer|6,6,3|An 8 fluid ounce cup rests on a matching saucer.|7|mug
water pitcher|7,5,9|A handled pouring vessel holds 40 fluid ounces; use for cool drinks.|14|jug
covered butter dish|8,4,3|A base and lift-off cover hold one standard butter stick.|9|box
small condiment bowl set|3,3,1.5|Four 2 fluid ounce bowls separate dips and condiments.|8|bowl`) ],
  ['cookware-utensils','Kitchen',['kitchen'],'utensils',rows(`
mixing spoon|2.5,13,0.8|A solid oval head stirs sauces and mixtures.|5|spoon
slotted serving spoon|2.5,13,0.8|Openings in the head drain liquids while serving.|6|spoon
angled pan turner|3,12,0.8|A broad angled edge lifts vegetables and pancakes.|6|turner
pasta serving fork|3,12,1|Spaced tines lift and portion cooked pasta.|7|turner
salad server pair|3,11,1|A paired spoon and fork toss and serve salad.|9|spoon
rice paddle|3,9,1|A broad rounded head portions cooked rice.|5|turner
jam stirring spoon|1.5,14,0.6|A long narrow head reaches into preserving pots.|5|spoon
crepe spreader|7,7,0.6|A T-shaped head spreads batter across a flat pan.|5|turner
serving ladle|3.5,13,2.5|A deep bowl transfers soups and sauces.|8|spoon`) ],
  ['bath-textiles','Bathroom',['bathroom'],'bath',rows(`
guest towel pair|12,20,0.2|Two small towels sit beside a guest basin.|9|textile
hand towel|20,28,0.2|A hanging loop keeps a hand towel within reach.|7|textile
oversized bath sheet|39,71,0.2|A generous towel wraps around after bathing.|19|textile
washcloth set|12,12,0.2|Four small cloths separate daily washing routines.|7|textile
shower wrap|57,32,0.2|An adjustable fastening holds a body wrap in place.|19|textile
hair wrap|25,10,0.2|A tapered wrap secures damp hair with a loop fastening.|9|textile
wash mitt pair|6,9,0.3|Two pocket-shaped mitts slip over the hand for washing.|7|textile
pedestal bath mat|24,24,0.3|A contoured mat fits around a basin pedestal; use an underlay.|12|rug
reversible shower mat|20,32,0.3|A double-sided mat provides soft footing; use a non-slip underlay.|14|rug`) ],
  ['children','Children',['children'],'timber',rows(`
play activity table|28,20,20|A low table leaves space for drawing and supervised crafts; ages 3 and up.|49|table
slat-back child chair|12,14,23|An 11 inch seat height fits a child-sized table; ages 3 and up.|24|seat
toy storage bench|30,14,20|Open lower cubbies keep toys visible beneath a low seat; ages 3 and up.|59|shelf
face-out book rack|26,12,28|Three front-facing tiers display book covers; secure to the wall.|39|shelf
tabletop puppet theater|24,8,27|An open stage frame encourages storytelling; ages 3 and up.|39|frame
doll bed|22,12,10|A small bed supports dolls up to 18 inches; a toy, never for an infant.|24|bed
open-front dollhouse|24,12,30|Three open levels make space for pretend rooms; ages 3 and up.|59|house
pretend play kitchen|28,14,39|A toy sink and turning knobs support pretend cooking; no water or heat.|79|cabinet
two-step child stool|15,17,13|Two broad treads help children reach a basin under adult supervision.|29|shelf`) ],
]

export function buildIkeaRanges(item) {
  return ranges.flatMap(([subcategory, category, rooms, construction, designs]) =>
    designs.flatMap(([name, measurements, purpose, basePrice, shape]) =>
      constructions[construction].map(([label, material, finish, color, structure, factor], index) => {
        const title = `${label} ${name}`
        const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
        const [width, depth, height] = measurements.split(',').map(Number)
        const furnishing = ['Furniture', 'Storage', 'Children'].includes(category)
        const description = `${purpose} ${structure}`
        const care = ['woven', 'linen', 'bath'].includes(construction) ? fabricCare : construction === 'utensils' ? `${structure} Wash with mild soap after use and dry.` : construction === 'tabletop' ? 'Hand wash with mild soap and dry. Avoid sudden temperature changes. Not for stovetop or oven use.' : woodCare
        return item(id, title, category, subcategory, Math.round(Number(basePrice) * factor * 100) / 100, null, material, [finish], { width, depth, height }, description, {
          rooms, art: silhouettes[shape], color, care, stock: 5 + index * 2,
          assembly: furnishing ? 'Assembly or mounting may be required. Follow the supplied booklet; use wall fixings suitable for your wall where indicated. Two adults recommended for large pieces.' : 'No structural assembly required. Read the included care and use information before first use.',
          imageNote: 'Product-form illustration; materials, construction and inch measurements are specified in the description.',
          keywords: `${name} ${material} ${purpose}`, rating: Number((4.2 + index * 0.2).toFixed(1)), reviews: 18 + index * 17,
          badge: index === 0 ? 'New' : '', catalogRange: 'home-500',
        })
      })))
}
