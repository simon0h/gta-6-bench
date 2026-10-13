// Deterministic authored assortments for the local store, not live manufacturer SKUs.
// Construction ranges differ in material, heat behavior or manufacturing method.
// Native product-form illustrations deliberately avoid claiming exact-model photography.
const read = text => text.trim().split('\n').map(line => line.split('|'))
const slug = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const art = {
  pan: 'M25 50Q75 32 124 50L112 89Q75 104 38 89Z M122 51L149 27L154 33L125 61Z',
  pot: 'M38 40H122V98Q80 111 38 98Z M33 40Q80 20 127 40Z M69 25H91V31H69Z M25 51H36V76H25Z M124 51H135V76H124Z',
  roast: 'M24 43H136L126 98H34Z M35 52H125L117 88H43Z M14 50H25V75H14Z M135 50H146V75H135Z',
  spoon: 'M66 16Q80 8 94 16Q104 40 85 53V111H75V53Q56 40 66 16Z',
  spatula: 'M49 15H111L99 64H85V111H75V64H61Z M69 28V49 M80 28V49 M91 28V49',
  board: 'M25 25H135V102H25Z M36 35H124V92H36Z',
  whisk: 'M71 17H89V52Q127 103 80 109Q33 103 71 52Z M78 52Q55 103 80 106Q104 104 83 52',
  knife: 'M17 45H103V76L35 68Z M105 45H149V66H105Z',
  bread: 'M15 45H104V76L95 70L86 76L77 70L68 76L59 70L50 76L41 70L32 76L23 70L15 76Z M106 45H150V68H106Z',
  sheet: 'M22 34H138L128 103H32Z M33 45H127L119 92H41Z',
  loaf: 'M30 38H131L116 99H44Z M42 47H118L108 85H51Z',
  muffin: 'M22 28H138L129 105H31Z M42 42a10 7 0 1 0 1 0 M73 42a10 7 0 1 0 1 0 M104 42a10 7 0 1 0 1 0 M45 78a10 7 0 1 0 1 0 M75 78a10 7 0 1 0 1 0 M105 78a10 7 0 1 0 1 0',
  round: 'M23 43Q80 17 137 43L124 94Q80 112 36 94Z M31 43Q80 71 129 43',
  bowl: 'M23 46Q80 22 137 46Q123 103 80 103Q37 103 23 46Z M31 46Q80 70 129 46',
  plate: 'M19 65a61 40 0 1 0 122 0a61 40 0 1 0 -122 0 M34 65a46 28 0 1 0 92 0a46 28 0 1 0 -92 0',
  cup: 'M37 28H107V91Q71 109 37 91Z M107 43H132V76H107 M41 28Q73 40 103 28',
  jug: 'M49 18H104V103H41V33Z M104 37H130V82H104 M49 18L32 17V29',
  glass: 'M48 20H112L102 107H58Z M52 26H108',
  appliance: 'M33 21H127V106H33Z M44 35H116V82H44Z M45 91H54V98H45Z M103 91H114V98H103Z',
  blender: 'M51 15H109L100 71H60Z M58 73H102L112 107H48Z M71 88H90V97H71Z M110 25H126V54H105',
  kettle: 'M49 30H108L122 95Q80 113 38 95Z M61 18H97V30H61Z M109 44H135V81H118 M40 57L24 42L30 75Z',
  mixer: 'M44 21H118V45H76V62H67V45H44Z M112 45H121V101H107V96H45V104H34V87H107V46Z M38 63H91L81 85H49Z',
  press: 'M50 14H110V27H102V92H117V105H43V92H58V27H50Z M67 38H93V83H67Z',
  bottle: 'M67 12H93V36L106 48V108H54V48L67 36Z M66 65H94V91H66Z',
  jar: 'M46 29H114V108H46Z M42 18H118V30H42Z M58 56H102V84H58Z',
  bag: 'M45 16H115L109 36L122 107H38L51 36Z M45 18H115 M56 58H104V88H56Z',
  linen: 'M28 25H122V87H28Z M36 89H132V99H36Z M45 101H139V109H45Z M39 36H110 M39 47H110 M39 71H110',
}
const additions = []
function add(title, category, price, type, material, use, size, capacity, brand, includes, description, care, compatibility, shape) {
  const id = slug(title)
  additions.push({ id, title, category, price, type, material, use, size, capacity, brand, brandSlug: slug(brand), includes, description, detail: description,
    care, compatibility, photo: null, art: art[shape], color: /iron|carbon/i.test(material) ? '#5d5a53' : /wood|bamboo|maple|linen|stoneware/i.test(material) ? '#bba383' : '#a9b6b9',
    stock: 6 + additions.length % 5, available: true, options: {}, rating: Number((4.2 + (additions.length % 4) * 0.2).toFixed(1)), reviews: 18 + additions.length % 65,
    badge: additions.length % 9 === 0 ? 'New' : '', ordinal: 40 + additions.length,
    keywords: `${type} ${material} ${use} ${brand} ${description}`, details: [`Size: ${size}`, ...(capacity ? [`Capacity: ${capacity}`] : []), `Material: ${material}`, `Includes: ${includes}`], catalogRange: 'kitchen-500',
  })
}
const metalCare = 'Cool before washing. Hand wash with mild soap, rinse and dry. Avoid abrasive cleaners.'
const knifeCare = 'Hand wash and dry immediately. Store with the blade protected; use a wood or plastic board. Not for frozen food or bones.'
const cookerMaterials = [
  ['Tri-ply stainless', 'Stainless steel and aluminum', 'Open Kitchen', 1.2, 'An aluminum core between steel layers spreads heat through the base and sides.', metalCare, 'Gas, electric, ceramic and induction; oven safe to 450°F.'],
  ['Enameled cast-iron', 'Enameled cast iron', 'Heritage Kitchen', 1.45, 'A heavy cast-iron body retains heat beneath a nonreactive enamel surface.', 'Hand wash after cooling; avoid metal tools, abrasive cleaners and sudden temperature changes.', 'Gas, electric, ceramic and induction; oven safe to 425°F.'],
  ['Seasoned carbon-steel', 'Carbon steel', 'Williams Sonoma', 1, 'A pressed carbon-steel body responds quickly to heat and develops a seasoned cooking surface.', 'Hand wash, dry immediately over low heat and rub with cooking oil. Restore seasoning when needed.', 'Gas, electric, ceramic and induction; oven safe to 450°F. Avoid long acidic simmering.'],
]
// name | product type | size | capacity | intended task | price | form
for (const [name,type,size,capacity,use,price,shape] of read(`
rounded saucier|Saucepans|9 inch|2.5 qt|Whisking sauces|69|pot
shallow braiser|Braising pans|12 inch|3.5 qt|Braising vegetables|99|pot
wide rondeau|Braising pans|13 inch|4.5 qt|Batch browning|119|pot
individual cocotte|Casseroles|5 inch|0.75 qt|Individual casseroles|39|pot
oval poultry roaster|Roasting pans|15 × 10 inch|5.5 qt|Roasting poultry|109|roast
rolled-edge omelet pan|Skillets|8.5 inch||Folding omelets|49|pan
low-rim crepe pan|Griddles|11.5 inch||Cooking thin crepes|49|pan
deep sauteuse|Sauté pans|11 inch|3.75 qt|Tossing vegetables|89|pan
sloped chef pan|Sauté pans|12.5 inch|4.25 qt|Reducing sauces|89|pan
covered rice pot|Rice pots|8 inch|2.75 qt|Cooking rice|69|pot
spouted butter warmer|Saucepans|4.5 inch|0.5 qt|Melting butter|29|pot
table fondue pot|Fondue pots|8 inch|2.25 qt|Preparing cheese fondue|69|pot
rectangular breakfast griddle|Griddles|18 × 10 inch||Cooking breakfast|79|roast
round paella pan|Paella pans|14 inch|3.25 qt|Cooking shallow rice dishes|89|pan
oval fish pan|Fish pans|15 × 8 inch||Searing whole fish|79|pan
deep chicken fryer|Skillets|10.5 inch|3.25 qt|Shallow frying|79|pot
divided egg pan|Egg pans|10 inch|4 wells|Separating eggs during cooking|59|pan
handled tapas dish|Casseroles|7 inch|1.25 qt|Serving hot tapas|39|round
covered soup casserole|Casseroles|10.5 inch|4.75 qt|Simmering soups|89|pot
flat tortilla comal|Griddles|12 inch||Toasting tortillas|49|pan
two-handle roasting skillet|Skillets|13.5 inch||Oven finishing|89|pan
square sandwich griddle|Griddles|11 × 11 inch||Toasting sandwiches|59|roast
mini sauce server|Saucepans|5.5 inch|0.875 qt|Warming serving sauces|39|pot
tall noodle pot|Stockpots|9.5 inch|6.5 qt|Boiling noodles|99|pot`)) {
  for (const [label,material,brand,multiplier,construction,care,compatibility] of cookerMaterials) {
    const includes = /covered|cocotte|casserole|rice pot|noodle pot|rondeau|braiser/.test(name) ? 'One cooking vessel and fitted lid' : 'One cooking vessel'
    add(`${label} ${name}`, 'Cookware', Math.round(Number(price)*multiplier), type, material, use, size, capacity, brand, includes, `${construction} The ${size} form is designed for ${use.toLowerCase()}.`, care, compatibility, shape)
  }
}
const toolMaterials = {
  utensil: [
    ['Beechwood', 'Beech wood', 'Heritage Kitchen', 'A smoothly carved head protects cookware surfaces.', 'Hand wash and dry promptly; do not soak or use in a dishwasher.'],
    ['Stainless steel', 'Stainless steel', 'Williams Sonoma', 'A rigid formed steel head offers firm control.', metalCare],
    ['Silicone-core', 'Silicone and steel', 'Open Kitchen', 'A flexible silicone head covers a rigid steel core.', 'Wash with mild soap and dry. Keep away from direct flame.'],
  ],
  board: [
    ['End-grain maple', 'Maple', 'Heritage Kitchen', 'End-grain blocks create a substantial working surface.', 'Hand wash and dry upright; condition with food-safe mineral oil.'],
    ['Laminated bamboo', 'Bamboo', 'Open Kitchen', 'Laminated strips give a firm lightweight working surface.', 'Hand wash; do not soak. Dry upright before storing.'],
    ['Food-prep polymer', 'Polypropylene', 'Williams Sonoma', 'A nonporous molded surface wipes clean between tasks.', 'Wash with mild soap or on the dishwasher top rack.'],
  ],
  pastry: [
    ['Flexible silicone', 'Silicone', 'Open Kitchen', 'A flexible molded working edge releases sticky mixtures.', 'Wash with mild soap; air dry fully before storage.'],
    ['Stainless pastry', 'Stainless steel', 'Williams Sonoma', 'A firm steel working edge gives precise control.', metalCare],
    ['Nylon pastry', 'Nylon', 'Heritage Kitchen', 'A lightweight shaped edge handles delicate mixtures.', 'Hand wash with mild soap. Keep away from direct heat.'],
  ],
}
for (const [name,type,size,use,price,shape,group] of read(`
corner mixing spoon|Utensils|13 inch|Reaching pan corners|18|spoon|utensil
slotted pasta spoon|Utensils|12 inch|Lifting pasta|18|spoon|utensil
wide fish turner|Turners|12 inch|Lifting delicate fillets|22|spatula|utensil
angled wok spatula|Turners|14 inch|Stir-frying|22|spatula|utensil
risotto paddle|Utensils|13 inch|Stirring grains|19|spatula|utensil
deep soup ladle|Ladles|12 inch|Serving soup|24|spoon|utensil
slotted draining ladle|Ladles|13 inch|Lifting poached food|24|spoon|utensil
salad serving pair|Serving utensils|11 inch|Tossing salad|28|spoon|utensil
flat scraping spoon|Utensils|12 inch|Scraping pan bases|19|spatula|utensil
slender jar spoon|Utensils|10 inch|Reaching into jars|14|spoon|utensil
grooved carving board|Cutting boards|18 × 13 inch|Carving roasts|69|board|board
bread crumb board|Cutting boards|16 × 10 inch|Slicing crusty bread|49|board|board
handled cheese board|Serving boards|15 × 8 inch|Serving cheese|39|board|board
pastry preparation board|Pastry boards|24 × 18 inch|Rolling dough|79|board|board
reversible chopping board|Cutting boards|14 × 11 inch|Separating prep tasks|39|board|board
counter-edge kneading board|Pastry boards|20 × 16 inch|Kneading bread|69|board|board
channelled citrus board|Cutting boards|10 × 8 inch|Cutting juicy fruit|29|board|board
fish preparation board|Cutting boards|22 × 9 inch|Preparing whole fish|59|board|board
straight dough scraper|Pastry tools|6 inch|Portioning bread dough|16|spatula|pastry
curved bowl scraper|Pastry tools|5 inch|Clearing mixing bowls|12|spatula|pastry
offset icing spatula|Pastry tools|9 inch|Spreading frosting|18|spatula|pastry
wide cake lifter|Pastry tools|10 inch|Moving cake layers|24|spatula|pastry
chocolate comb|Pastry tools|6 inch|Texturing chocolate|14|spatula|pastry
flexible pastry spatula|Pastry tools|11 inch|Folding batter|16|spatula|pastry
bench dough cutter|Pastry tools|7 inch|Dividing pastry|18|spatula|pastry
cake-edge smoother|Pastry tools|8 inch|Smoothing frosting|16|spatula|pastry`)) {
  for (const [label,material,brand,construction,care] of toolMaterials[group]) {
    const compatibility = group === 'board' ? 'For countertop preparation; not for ovens or direct heat.' : material === 'Stainless steel' ? 'Use with uncoated cookware or on a preparation surface; avoid scraping nonstick finishes.' : group === 'utensil' ? 'For hand preparation and serving. Do not leave resting in a hot pan.' : 'For hand pastry preparation; not for direct heat.'
    add(`${label} ${name}`, 'Tools', Number(price), type, material, use, size, '', brand, /pair/.test(name) ? 'Two complementary serving tools' : 'One preparation tool', `${construction} Designed for ${use.toLowerCase()}.`, care, compatibility, shape)
  }
}
const knifeConstructions = [
  ['Forged full-tang', 'Forged stainless steel and acetal', 'Williams Sonoma', 1.3, 'A forged blade continues through a riveted acetal handle for balanced control.'],
  ['Laminated steel', 'Laminated stainless steel and pakkawood', 'Heritage Kitchen', 1.6, 'A hard steel cutting core is supported by outer steel layers and a shaped pakkawood handle.'],
  ['Stamped bolsterless', 'Stamped stainless steel and polypropylene', 'Open Kitchen', 1, 'A thin stamped blade and molded handle make a light, maneuverable tool.'],
]
for (const [name,type,size,use,price,shape] of read(`
French chef knife|Chef’s knives|9 inch|Rocking through vegetables|79|knife
petty utility knife|Utility knives|5 inch|Small preparation tasks|49|knife
nakiri vegetable knife|Vegetable knives|6.5 inch|Straight vegetable chopping|69|knife
boning knife|Boning knives|6 inch|Trimming boneless cuts|59|knife
flexible fillet knife|Fillet knives|7.5 inch|Filleting fish|59|knife
long carving knife|Carving knives|10 inch|Carving cooked roasts|79|knife
scalloped tomato knife|Serrated knives|5.5 inch|Slicing ripe tomatoes|39|bread
bird-beak peeling knife|Paring knives|2.75 inch|Curved peeling cuts|29|knife
straight peeling knife|Paring knives|3 inch|Detail preparation|29|knife
offset sandwich knife|Serrated knives|8.5 inch|Slicing sandwiches|49|bread
soft-cheese knife|Cheese knives|5 inch|Portioning soft cheese|39|knife
steak knife pair|Steak knives|4.5 inch|Table slicing|59|knife
long pastry knife|Serrated knives|11 inch|Dividing sponge cakes|69|bread
thin slicing knife|Slicing knives|12 inch|Thin roast slices|89|knife
broad vegetable cleaver|Vegetable knives|7.25 inch|Scooping chopped vegetables|79|knife`)) {
  for (const [label,material,brand,multiplier,construction] of knifeConstructions) {
    add(`${label} ${name}`, 'Cutlery', Math.round(Number(price)*multiplier), type, material, use, size, '', brand, name.includes('pair') ? 'Two knives and protective sleeves' : 'One knife and protective sleeve', `${construction} The ${size} cutting edge is intended for ${use.toLowerCase()}.`, knifeCare, shape === 'bread' ? 'Serrated edge; do not use a straight-edge honing steel.' : 'Straight edge; maintain with a suitable fine sharpening stone.', shape)
  }
}
// Distinct appliances with task-specific capacities and included working parts.
for (const [name,type,size,capacity,use,price,includes,feature,shape] of read(`
Conical burr coffee grinder|Coffee grinders|13 inch tall|8 oz hopper|Grinding coffee|149|Grinder and removable grounds cup|A stepped burr adjustment sets grind coarseness.|blender
Flat-burr espresso grinder|Coffee grinders|16 inch tall|12 oz hopper|Grinding espresso|279|Grinder and portafilter cradle|A fine adjustment dial controls espresso grind size.|blender
Blade spice mill|Spice grinders|7 inch tall|3 oz bowl|Grinding dry spices|39|Motor base and removable steel bowl|Short pulse control breaks down dry spices.|blender
Milk frother with heating jug|Milk frothers|8 inch tall|10 oz jug|Frothing milk|89|Powered jug and two whisks|Separate stirring and frothing inserts prepare warm drinks.|kettle
Immersion stick blender|Immersion blenders|16 inch long|20 oz beaker|Blending soups|79|Motor handle, blending shaft and beaker|A removable steel shaft blends in a deep vessel.|blender
Personal smoothie blender|Blenders|14 inch tall|20 oz cup|Making smoothies|69|Motor base, blade cup and travel lid|The blending vessel converts to a drinking cup.|blender
Vacuum countertop blender|Blenders|18 inch tall|1.8 L jug|Blending fruit drinks|249|Motor base, jug and vacuum lid|A vacuum lid removes air before the blending cycle.|blender
Heated soup blender|Blenders|18 inch tall|1.6 L jug|Cooking blended soup|199|Heated base, jug and lid|A timed heating cycle alternates cooking and blending.|blender
Mini food chopper|Food processors|9 inch tall|3 cups|Chopping herbs|49|Base, bowl, lid and chopping blade|A pulse button provides short chopping bursts.|blender
Vegetable spiralizer motor|Food processors|12 inch tall|5 cups|Making vegetable ribbons|79|Motor, feed chute and three cutter cones|Interchangeable cones produce ribbons and noodles.|appliance
Wide-chute food processor|Food processors|17 inch tall|14 cups|Batch vegetable preparation|249|Base, bowl, chopping blade and three discs|A wide feed chute accepts larger vegetable pieces.|blender
Hand mixer with storage case|Hand mixers|8 inch wide|5 speeds|Mixing cake batter|59|Hand mixer, beaters, hooks and case|Five speed settings and a resting heel support hand mixing.|mixer
Planetary bowl-lift mixer|Stand mixers|17 inch tall|7 qt|Kneading large dough batches|449|Mixer, bowl, paddle, hook and whisk|A bowl-lift frame leaves the motor head fixed during use.|mixer
Compact bread maker|Bread makers|12 inch tall|1.5 lb loaf|Mixing and baking bread|149|Machine, removable pan and kneading blade|A timed program mixes, proofs and bakes a loaf.|appliance
Pasta kneading extruder|Pasta makers|13 inch tall|1 lb dough|Making fresh pasta|229|Machine, mixing chamber and four dies|An auger pushes mixed dough through shaped dies.|appliance
Electric grain mill|Grain mills|15 inch tall|2 lb hopper|Milling dry grains|279|Mill, hopper and flour bowl|Adjustable milling plates set flour texture.|blender
Electric citrus press|Juicers|12 inch tall|24 oz jug|Juicing citrus|89|Motor base, reamer, strainer and jug|A pressure-activated reamer separates juice from pulp.|press
Slow masticating juicer|Juicers|17 inch tall|32 oz jug|Juicing produce|249|Juicer, auger, strainer and two pitchers|A slow auger presses produce through a fine strainer.|blender
Centrifugal juice extractor|Juicers|16 inch tall|40 oz jug|Juicing firm produce|149|Base, feed chute, sieve and juice jug|A spinning sieve separates juice from fibrous pulp.|blender
Electric can opener|Can openers|10 inch tall|Standard cans|Opening food cans|39|Countertop opener and removable cutting assembly|A guided cutter opens standard round food cans.|appliance
Vacuum bag sealer|Food sealers|15 inch wide|12 inch seal bar|Sealing storage bags|119|Sealer, starter bags and roll|Separate vacuum and heat-seal controls close compatible bags.|appliance
Chamber food sealer|Food sealers|16 inch wide|10 inch seal bar|Sealing moist ingredients|399|Chamber machine and starter pouches|A closed chamber supports compatible liquid-filled pouches.|appliance
Six-tray food dehydrator|Dehydrators|14 inch tall|6 trays|Drying fruit|149|Heated base, six trays and mesh liner|Circulating warm air dries thin food slices.|appliance
Compressor ice-cream maker|Ice-cream makers|15 inch wide|1.5 qt bowl|Churning frozen desserts|279|Machine, bowl and mixing paddle|A built-in compressor chills the bowl during churning.|appliance
Frozen-bowl dessert maker|Ice-cream makers|12 inch tall|2 qt bowl|Churning ice cream|89|Motor top, freeze-ahead bowl and paddle|A pre-frozen bowl chills the mixture as the paddle turns.|appliance
Automatic yogurt maker|Yogurt makers|7 inch tall|7 jars|Culturing yogurt|69|Warming base and seven lidded glass jars|Gentle timed warming maintains the selected program.|appliance
Countertop rice cooker|Rice cookers|10 inch tall|6 cups cooked|Cooking rice|79|Cooker, inner pot, measure and paddle|A covered pot switches from cooking to warm mode.|pot
Induction rice cooker|Rice cookers|11 inch tall|10 cups cooked|Cooking mixed grains|199|Induction base, inner pot and paddle|Induction heating surrounds a removable grain pot.|pot
Programmable slow cooker|Slow cookers|13 inch wide|6 qt crock|Slow cooking|99|Heated base, ceramic crock and glass lid|A programmable timer switches to a warm setting.|pot
Pressure multicooker|Multicookers|14 inch tall|6 qt pot|Pressure cooking|149|Cooker, steel inner pot, rack and lid|A locking lid and preset controls support pressure programs.|pot
Countertop steam cooker|Steamers|16 inch tall|3 baskets|Steaming vegetables|89|Water base, three baskets and lid|Stacked baskets cook over an electric steam reservoir.|appliance
Sous-vide immersion circulator|Sous-vide cookers|13 inch long|20 L bath|Water-bath cooking|129|Circulator and adjustable vessel clamp|A pump circulates water around the heating element.|blender
Portable induction hob|Induction burners|14 × 11 inch|1800 W|Extra cooking zone|99|Single-zone hob|A flat induction zone offers timed power control.|sheet
Double ceramic hotplate|Electric burners|20 × 12 inch|1500 W total|Extra cooking zones|79|Two-zone hotplate|Two separately controlled ceramic zones share the total power.|sheet
Clamshell contact grill|Indoor grills|14 inch wide|60 sq inch plates|Grilling sandwiches|99|Grill and removable drip tray|A floating hinge adjusts to the food thickness.|appliance
Reversible electric griddle|Griddles|20 × 12 inch|180 sq inch plate|Cooking breakfast|99|Base, reversible plate and drip tray|Smooth and ridged cooking faces support different meals.|roast
Deep Belgian waffle maker|Waffle makers|10 inch wide|4 waffles|Baking waffles|89|Waffle maker|Deep pockets hold batter for four square waffles.|appliance
Rotating round waffle maker|Waffle makers|15 inch wide|1 round waffle|Baking round waffles|79|Rotating cooker and drip plate|A turning cradle spreads batter across the round plates.|appliance
Thin-waffle cone maker|Waffle makers|10 inch wide|7 inch cone sheet|Making dessert cones|59|Cooker and cone roller|Shallow patterned plates bake a thin sheet for rolling.|appliance
Electric crepe maker|Crepe makers|13 inch wide|12 inch plate|Cooking crepes|59|Heated plate, spreader and spatula|A low-rim round plate leaves space for a batter spreader.|pan
Filled-pocket sandwich maker|Sandwich makers|10 inch wide|2 sandwiches|Toasting sealed sandwiches|49|Sandwich maker|Divided plates seal the edges of two filled sandwiches.|appliance
Digital countertop convection oven|Countertop ovens|19 inch wide|0.8 cu ft|Convection baking|229|Oven, rack, tray and crumb pan|A circulating fan supports even countertop baking.|appliance
Steam countertop oven|Countertop ovens|21 inch wide|0.9 cu ft|Steam-assisted baking|399|Oven, rack, pan and water tank|A refillable reservoir adds steam during selected programs.|appliance
Basket air fryer|Air fryers|14 inch tall|5 qt basket|Air frying|119|Base, basket and crisper plate|A perforated plate lifts food into circulating hot air.|appliance
Dual-drawer air fryer|Air fryers|16 inch wide|8 qt total|Cooking two dishes|199|Base and two removable drawers|Separate controls time two cooking compartments.|appliance
Compact electric deep fryer|Deep fryers|12 inch wide|2 L oil|Deep frying|79|Heated vessel, basket and lid|A thermostat controls a removable oil vessel.|pot
Electric hot-water dispenser|Water dispensers|14 inch tall|3 L tank|Keeping water hot|99|Dispenser and drip tray|A pump serves heated water from an insulated reservoir.|kettle
Variable-temperature gooseneck kettle|Kettles|10 inch tall|0.9 L|Pour-over coffee|109|Kettle and control base|A slender curved spout offers controlled pouring.|kettle
Glass tea infuser kettle|Kettles|11 inch tall|1.5 L|Brewing loose tea|99|Kettle, removable infuser and base|A lift-out basket separates tea leaves after brewing.|kettle
Single-serve filter brewer|Coffee makers|12 inch tall|14 oz cup|Brewing one cup|69|Brewer and reusable filter|A small filter basket brews into your own mug.|appliance
Thermal-carafe coffee brewer|Coffee makers|16 inch tall|8 cups|Keeping brewed coffee warm|149|Brewer, thermal carafe and filter basket|An insulated carafe keeps coffee warm without a hotplate.|appliance
Electric moka coffee pot|Coffee makers|10 inch tall|6 espresso cups|Brewing moka coffee|69|Heated base, pot and funnel filter|A powered base heats the lower water chamber.|kettle
Automatic bean-to-cup machine|Espresso machines|16 inch tall|1.8 L tank|Preparing espresso drinks|599|Machine, brew unit and milk tube|An integrated grinder feeds an automatic brewing unit.|appliance
Lever espresso press with heater|Espresso machines|18 inch tall|0.8 L tank|Manual espresso extraction|349|Heated press, portafilter and basket|A hand lever controls extraction through a heated brew head.|press
Countertop warming tray|Warming trays|20 × 12 inch|160 W|Keeping dishes warm|69|Heated serving tray|A low-profile heated surface supports heat-safe serving dishes.|sheet
Electric knife sharpener|Knife sharpeners|10 inch wide|2 stages|Sharpening straight knives|89|Sharpening base|Two guided slots sharpen and finish straight steel edges.|appliance
Digital kitchen scale with bowl|Kitchen scales|9 inch wide|11 lb maximum|Weighing ingredients|39|Scale and removable steel bowl|A tare button resets the display between ingredients.|bowl
Rechargeable hand frother|Milk frothers|10 inch long|2 whisk heads|Foaming cold milk|29|Frother, whisk heads and charging cable|A compact rechargeable motor turns a removable whisk.|whisk`)) {
  add(name, 'Electrics', Number(price), type, 'Steel and food-contact polymer', use, size, capacity, 'Countertop Studio', includes, `${feature} ${capacity} working specification.`, 'Unplug and cool before cleaning. Wash removable food-contact parts by hand; wipe the motor or heated base without immersing it.', name.startsWith('Rechargeable') ? 'Charge with the supplied USB cable; use away from running water.' : name.startsWith('Digital kitchen scale') ? 'Powered by two AAA batteries, included. Keep the display and battery compartment dry.' : '120 V US household outlet. Operate on a stable surface with ventilation; follow the supplied appliance instructions.', shape)
}
const bakingMaterials = {
  metal: [
    ['Natural aluminum', 'Aluminum', 'Open Kitchen', 'An uncoated aluminum body conducts heat quickly.', 'Oven safe to 450°F; grease or line before use. No direct stovetop heat.'],
    ['Nonstick carbon-steel', 'Coated carbon steel', 'Williams Sonoma', 'A carbon-steel body has a smooth nonstick release coating.', 'Oven safe to 425°F; use silicone or wood tools and avoid aerosol cooking spray.'],
  ],
  dish: [
    ['Glazed stoneware', 'Stoneware', 'Heritage Kitchen', 'A glazed ceramic body retains warmth for oven-to-table serving.', 'Oven safe to 425°F; no direct heat. Avoid sudden temperature changes.'],
    ['Borosilicate glass', 'Borosilicate glass', 'Open Kitchen', 'A transparent glass body lets you inspect browning at the sides.', 'Oven safe to 400°F; no broiler or direct heat. Never add cold liquid to a hot dish.'],
  ],
}
for (const [name,type,size,capacity,use,price,shape,group] of read(`
quarter-sheet baker|Sheet pans|13 × 9 inch||Roasting small batches|19|sheet|metal
full-rim jelly-roll pan|Sheet pans|15 × 10 inch||Baking rolled sponge|24|sheet|metal
perforated pizza tray|Pizza pans|14 inch||Baking pizza bases|24|round|metal
deep-dish pizza pan|Pizza pans|12 inch|2 inch deep|Baking deep pizza|29|round|metal
loose-base tart pan|Tart pans|10 inch||Releasing pastry tarts|24|round|metal
rectangular fluted tart pan|Tart pans|14 × 5 inch||Baking long fruit tarts|29|loaf|metal
mini tartlet tray|Tart pans|12 × 9 inch|6 wells|Baking individual tarts|29|muffin|metal
springform cheesecake pan|Cake pans|9 inch|3 inch deep|Releasing cheesecake|29|round|metal
angel-food tube pan|Cake pans|10 inch|12 cups|Baking airy sponge|34|round|metal
fluted ring cake pan|Cake pans|10 inch|10 cups|Baking ring cakes|39|round|metal
square brownie pan|Cake pans|9 × 9 inch||Baking brownies|24|sheet|metal
rectangular layer-cake pan|Cake pans|13 × 9 inch||Baking sheet cakes|29|sheet|metal
hemisphere cake mold|Cake pans|8 inch|6 cups|Baking dome cakes|29|bowl|metal
pullman loaf pan|Loaf pans|13 × 4 inch|Lidded|Baking square sandwich loaves|39|loaf|metal
baguette baking cradle|Bread pans|16 × 9 inch|3 channels|Baking baguettes|34|loaf|metal
mini loaf tray|Loaf pans|14 × 10 inch|8 wells|Baking gift loaves|34|muffin|metal
hamburger bun tray|Bread pans|14 × 10 inch|6 wells|Baking burger buns|29|muffin|metal
hot-dog roll pan|Bread pans|15 × 9 inch|8 channels|Baking joined rolls|29|loaf|metal
popover tray|Muffin pans|15 × 9 inch|6 deep wells|Baking popovers|34|muffin|metal
madeleine tray|Cookie pans|15 × 8 inch|12 shells|Baking shell cakes|29|muffin|metal
financier tray|Cookie pans|12 × 8 inch|8 bars|Baking almond cakes|29|muffin|metal
baked doughnut tray|Doughnut pans|13 × 9 inch|6 rings|Baking doughnuts|24|muffin|metal
mini muffin tray|Muffin pans|15 × 10 inch|24 wells|Baking bite-sized muffins|29|muffin|metal
insulated cookie sheet|Cookie sheets|16 × 14 inch||Baking delicate cookies|29|sheet|metal
individual pie tin set|Pie dishes|5 inch|4 pieces|Baking hand-sized pies|29|round|metal
oval gratin baker|Baking dishes|12 × 8 inch|2.5 qt|Browning gratins|39|roast|dish
deep lasagna baker|Baking dishes|14 × 10 inch|4 qt|Layering lasagna|49|roast|dish
round casserole baker|Baking dishes|10 inch|3.5 qt|Baking casseroles|44|round|dish
covered terrine mold|Terrines|11 × 4 inch|1.5 qt|Baking terrines|49|loaf|dish
souffle dish|Ramekins|8 inch|2 qt|Baking souffles|29|round|dish
creme-brulee ramekin set|Ramekins|5 inch|4 shallow dishes|Baking custards|34|round|dish
mini cocotte pair|Baking dishes|4 inch|8 oz each|Baking individual portions|29|pot|dish
deep fruit pie baker|Pie dishes|10 inch|2 inch deep|Baking fruit pies|34|round|dish
square cobbler dish|Baking dishes|8 × 8 inch|1.75 qt|Baking fruit cobblers|29|sheet|dish
covered garlic roaster|Specialty bakers|5 inch|1 bulb|Roasting whole garlic|24|pot|dish`)) {
  for (const [label,material,brand,construction,compatibility] of bakingMaterials[group]) {
    add(`${label} ${name}`, 'Bakeware', Number(price), type, material, use, size, capacity, brand, name.includes('set') ? 'One set in the listed piece count' : name.includes('pair') ? 'Two matching dishes' : 'One baking vessel; lid included where stated', `${construction} Designed for ${use.toLowerCase()}.`, metalCare, compatibility, shape)
  }
}
const tableMaterials = [
  ['Fine porcelain', 'Porcelain', 'Williams Sonoma', 1.2, 'A fine vitrified body gives a smooth, lightweight serving piece.'],
  ['Hand-glazed stoneware', 'Stoneware', 'Heritage Kitchen', 1, 'A substantial glazed body provides a textured tabletop presence.'],
  ['Pressed glass', 'Glass', 'Pantry & Table', 0.9, 'A transparent molded body reveals food and drink within.'],
]
for (const [name,type,size,capacity,use,price,shape] of read(`
coupe dinner plate set|Dinnerware|10.75 inch|4 plates|Everyday dining|49|plate
rimmed salad plate set|Dinnerware|8.5 inch|4 plates|Serving salad|39|plate
dessert plate set|Dinnerware|7 inch|4 plates|Serving dessert|34|plate
bread-and-butter plate set|Dinnerware|6 inch|4 plates|Serving bread|29|plate
rectangular sushi platter|Serving platters|14 × 6 inch||Serving sushi|29|plate
oval roast platter|Serving platters|18 × 12 inch||Serving roasts|49|plate
footed cake plate|Cake stands|12 inch|4 inch tall|Displaying cakes|49|plate
wide pasta bowl set|Bowls|10.5 inch|4 bowls|Serving pasta|49|bowl
deep cereal bowl set|Bowls|6.5 inch|4 bowls|Serving breakfast|39|bowl
handled soup bowl pair|Bowls|5.5 inch|18 oz each|Serving soup|29|bowl
noodle bowl pair|Bowls|8 inch|32 oz each|Serving noodle dishes|34|bowl
rice bowl set|Bowls|4.5 inch|4 bowls|Serving rice|29|bowl
individual dip bowl set|Bowls|3 inch|6 bowls|Serving condiments|24|bowl
wide fruit bowl|Serving bowls|13 inch|4 qt|Displaying fruit|49|bowl
low salad serving bowl|Serving bowls|12 inch|3 qt|Sharing salads|39|bowl
footed dessert bowl pair|Dessert dishes|5 inch|10 oz each|Serving desserts|29|bowl
covered sugar bowl|Coffee service|4 inch|8 oz|Serving sugar|19|pot
cream pouring jug|Coffee service|4.5 inch tall|10 oz|Serving cream|19|jug
breakfast mug pair|Mugs|4.5 inch tall|16 oz each|Morning drinks|29|cup
espresso cup set|Coffee service|2.5 inch tall|4 cups of 3 oz|Serving espresso|24|cup
tea cup and saucer pair|Tea service|6 inch saucer|2 cups of 8 oz|Serving tea|34|cup
covered tea pot|Tea service|7 inch tall|32 oz|Steeping tea|49|pot
bedside water carafe|Drinkware|9 inch tall|28 oz|Serving water|29|jug
handled lemonade pitcher|Pitchers|10 inch tall|64 oz|Serving cool drinks|39|jug
stemless juice tumbler set|Drinkware|4 inch tall|4 glasses of 10 oz|Serving juice|29|glass`)) {
  for (const [label,material,brand,multiplier,construction] of tableMaterials) {
    add(`${label} ${name}`, 'Tabletop', Math.round(Number(price)*multiplier), type, material, use, size, capacity, brand, /set|pair/.test(name) ? `Set containing ${capacity}` : 'One serving piece', `${construction} Intended for ${use.toLowerCase()}.`, 'Hand wash with mild soap and dry. Avoid sudden temperature changes.', 'For tabletop serving; not for stovetop, oven or broiler use.', shape)
  }
}
// Food and household goods are individual recipes/materials, not flavor-number fillers.
// Ingredients are local catalog descriptions and appear in the product specifications.
for (const [name,type,size,use,price,ingredients,shape] of read(`
Toasted sesame finishing oil|Pantry|250 mL|Finishing stir-fries|18|Sesame oil; contains sesame.|bottle
Cold-pressed walnut oil|Pantry|250 mL|Dressing salads|22|Walnut oil; contains walnuts.|bottle
Avocado cooking oil|Pantry|500 mL|Everyday cooking|24|Avocado oil.|bottle
Aged red-wine vinegar|Pantry|250 mL|Making vinaigrette|16|Red-wine vinegar.|bottle
White balsamic condiment|Pantry|250 mL|Dressing light salads|19|White-wine vinegar and grape must.|bottle
Sherry cooking vinegar|Pantry|250 mL|Finishing soups|18|Sherry vinegar.|bottle
Unfiltered apple cider vinegar|Pantry|500 mL|Making dressings|14|Apple cider vinegar.|bottle
Smoked sea-salt flakes|Seasonings|4 oz|Finishing grilled vegetables|14|Sea salt and natural wood smoke.|jar
Coarse pink cooking salt|Seasonings|12 oz|Seasoning cooking water|12|Rock salt.|jar
Whole rainbow peppercorns|Seasonings|3 oz|Fresh pepper grinding|14|Black, white and green peppercorns; pink pepper berries.|jar
Herbes de Provence blend|Seasonings|1.5 oz|Seasoning roasted vegetables|12|Thyme, rosemary, savory, oregano and lavender.|jar
Smoky barbecue dry rub|Seasonings|4 oz|Seasoning grilled food|14|Paprika, brown sugar, salt, garlic and black pepper.|jar
Salt-free lemon herb blend|Seasonings|2 oz|Seasoning vegetables|12|Lemon peel, parsley, dill, onion and garlic.|jar
Ground Ceylon cinnamon|Baking ingredients|2 oz|Seasoning sweet bakes|14|Ground cinnamon.|jar
Whole nutmeg jar|Baking ingredients|1.5 oz|Fresh grating|12|Whole nutmeg.|jar
Pure vanilla extract|Baking ingredients|4 fl oz|Flavoring desserts|24|Vanilla bean extractives, water and alcohol.|bottle
Dutch-process cocoa|Baking ingredients|8 oz|Baking chocolate cakes|16|Cocoa processed with alkali.|jar
Bittersweet baking wafers|Baking ingredients|12 oz|Melting chocolate|19|Cocoa mass, sugar, cocoa butter and sunflower lecithin.|bag
Almond baking flour|Baking ingredients|16 oz|Baking almond pastries|18|Ground blanched almonds; contains almonds.|bag
Stone-ground cornmeal|Baking ingredients|24 oz|Baking cornbread|12|Ground yellow corn.|bag
Semolina pasta flour|Baking ingredients|24 oz|Making fresh pasta|12|Durum wheat semolina; contains wheat.|bag
Arborio risotto rice|Grains|24 oz|Cooking risotto|14|Arborio rice.|bag
Pearled farro|Grains|16 oz|Cooking grain salads|12|Pearled farro wheat; contains wheat.|bag
French green lentils|Grains|16 oz|Simmering lentil dishes|12|Green lentils.|bag
Bronze-cut rigatoni|Pasta|16 oz|Cooking pasta bakes|10|Durum wheat semolina and water; contains wheat.|bag
Egg pappardelle nests|Pasta|12 oz|Serving rich sauces|12|Durum wheat semolina and egg; contains wheat and egg.|bag
Porcini mushroom risotto mix|Meal starters|12 oz|Making risotto|16|Arborio rice, dried porcini mushrooms, onion and parsley.|bag
Roasted tomato pasta sauce|Meal starters|24 oz|Saucing pasta|14|Tomatoes, olive oil, onion, garlic, basil and salt.|jar
Genovese basil pesto|Meal starters|6 oz|Finishing pasta|14|Basil, olive oil, Parmesan cheese, pine nuts and salt; contains milk and pine nuts.|jar
Artichoke bruschetta spread|Meal starters|8 oz|Topping toast|14|Artichokes, olive oil, lemon juice, garlic and salt.|jar
Orange blossom honey|Preserves|12 oz|Sweetening tea|18|Orange blossom honey.|jar
Dark amber maple syrup|Preserves|12 fl oz|Serving breakfast|22|Pure maple syrup.|bottle
Seville orange marmalade|Preserves|10 oz|Spreading on toast|14|Oranges, sugar, lemon juice and fruit pectin.|jar
Fig and lemon preserve|Preserves|10 oz|Serving with cheese|14|Figs, sugar, lemon juice and fruit pectin.|jar
Coarse-grain Dijon mustard|Condiments|8 oz|Making dressings|12|Mustard seeds, vinegar, water and salt; contains mustard.|jar
Roasted almond butter|Condiments|12 oz|Spreading breakfast toast|18|Roasted almonds and sea salt; contains almonds.|jar
Decaffeinated whole-bean coffee|Coffee|12 oz|Brewing decaf coffee|19|Roasted decaffeinated coffee beans.|bag
Dark espresso whole-bean blend|Coffee|12 oz|Brewing espresso|19|Roasted coffee beans.|bag
Loose-leaf Earl Grey tea|Tea|3 oz|Brewing black tea|16|Black tea and bergamot oil.|jar
Roasted barley tea bags|Tea|20 sachets|Brewing grain tea|12|Roasted barley; contains barley.|bag`)) {
  add(name, 'Food & Home', Number(price), type, 'Food ingredients', use, size, '', 'Pantry & Table', `One sealed ${size} package`, `${size} pantry package. ${ingredients} Intended for ${use.toLowerCase()}.`, 'Store sealed in a cool, dry place. Refrigerate opened sauces and preserves and follow the package storage label.', `Ingredients: ${ingredients} Read the package label before use.`, shape)
}
for (const [name,type,material,size,use,price,includes,feature,shape] of read(`
Linen cross-back kitchen apron|Kitchen linens|Linen|34 inch long|Protecting clothing|49|One adjustable apron|Cross-back straps distribute the apron without a neck tie.|linen
Cotton canvas chef apron|Kitchen linens|Cotton canvas|32 inch long|Protecting clothing|39|One bib apron|A sturdy front pocket holds a towel or recipe card.|linen
Quilted cotton oven mitt pair|Heat protection|Cotton and insulation|13 inch long|Handling warm ovenware|24|Two oven mitts|Quilted insulation covers the hand and wrist; follow the heat-use label.|linen
Silicone grip oven mitt pair|Heat protection|Silicone and cotton|14 inch long|Gripping ovenware|29|Two oven mitts|A textured silicone surface improves grip on dry handles.|linen
Linen bread storage bag|Food storage|Linen|14 × 18 inch|Keeping bread covered|19|One drawstring bag|A breathable fabric shell keeps crumbs contained.|bag
Cotton proofing-cloth set|Kitchen linens|Cotton|24 × 30 inch|Covering rising dough|24|Two proofing cloths|Smooth cloth covers bowls and shaped dough during preparation.|linen
Beeswax cotton food-wrap set|Food storage|Cotton and beeswax|3 mixed sheets|Wrapping cool food|24|Three reusable wraps|Hand warmth softens the waxed cloth around a bowl.|linen
Silicone stretch-lid set|Food storage|Silicone|6 mixed lids|Covering bowls|24|Six flexible lids|Elastic rims stretch over compatible smooth bowl edges.|round
Borosilicate pantry canister trio|Food storage|Glass and bamboo|3 canisters|Organizing dry food|49|Three canisters and fitted lids|Transparent bodies show dry pantry contents.|jar
Steel compost caddy|Kitchen storage|Stainless steel|1.3 gal|Collecting food scraps|39|Caddy and removable liner|A handled inner liner lifts out for emptying.|pot
Bamboo countertop bread box|Kitchen storage|Bamboo|16 × 10 inch|Storing bread|49|One ventilated box|A sliding front keeps bread accessible on the counter.|board
Cotton dish-drying mat|Kitchen linens|Cotton|18 × 24 inch|Drying washed dishes|19|One quilted mat|An absorbent folded layer cushions dishes while drying.|linen
Cellulose sponge-cloth set|Cleaning tools|Cellulose and cotton|8 × 7 inch|Wiping counters|14|Four cloths|Flexible absorbent sheets wipe spills and rinse clean.|linen
Beech dish-brush set|Cleaning tools|Beech and plant fiber|10 inch long|Washing dishes|19|Handle and two brush heads|Replaceable fiber heads attach to a reusable wooden handle.|spoon
Cast-iron chainmail scrubber|Cleaning tools|Stainless steel|7 × 7 inch|Cleaning uncoated iron|19|One ring-mesh scrubber|Interlinked rings lift residue without a detergent pad.|board
Microfiber glass-polishing cloths|Kitchen linens|Polyester and polyamide|20 × 24 inch|Polishing glassware|19|Three cloths|Fine fibers remove water marks from dry glass.|linen
Stoneware sink-side dispenser|Sink accessories|Stoneware and steel|12 fl oz|Dispensing hand soap|24|One refillable pump bottle|A removable pump gives access for cleaning and refilling.|bottle
Glass countertop spray bottle|Cleaning tools|Glass and polypropylene|16 fl oz|Dispensing household cleaner|14|One empty spray bottle|An adjustable trigger offers spray or stream dispensing.|bottle
Steel sink sponge tray|Sink accessories|Stainless steel|8 × 4 inch|Drying cleaning tools|19|One perforated tray|Raised feet let water drain beneath the holder.|sheet
Cedar pantry sachet set|Home accessories|Cedar wood and cotton|4 sachets|Freshening storage spaces|16|Four closed sachets|Small fabric bags contain dry cedar shavings; keep away from food.|bag
Unscented beeswax taper pair|Home accessories|Beeswax|10 inch long|Setting a dinner table|18|Two taper candles|Cotton wicks sit in simple beeswax tapers; use stable holders.|bottle
Felt pan-protector set|Kitchen storage|Recycled polyester felt|3 mixed sizes|Separating stacked pans|14|Three flexible protectors|Star-shaped pads separate cooled pan surfaces in storage.|linen`)) {
  add(name, 'Food & Home', Number(price), type, material, use, size, '', 'Pantry & Table', includes, `${feature} Designed for ${use.toLowerCase()}.`, /Linen|Cotton|cotton|Microfiber|Cellulose/.test(name) ? 'Follow the care label. Wash gently and dry fully before storage.' : 'Wipe or hand wash as appropriate, then dry fully. Follow the supplied material-care label.', name.includes('taper') ? 'Never leave a burning candle unattended. Keep clear of fabric and drafts.' : name.includes('wrap') ? 'For cool food storage; keep away from ovens, microwaves and raw meat.' : 'For the described household task. Keep away from direct flame and follow the included use label.', shape)
}
export const kitchenRangeProducts = additions
