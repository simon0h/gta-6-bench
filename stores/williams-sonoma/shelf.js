// Williams Sonoma reference-mode assortment ("the shelf"): the cookware, electrics,
// cutlery, tools, bakeware, food, tabletop and home goods a shopper sees on
// williams-sonoma.com. These rows are separate from the captured "gta 6" search
// observations (search-reference.js) and from the fixture catalog (catalog.js):
// they never enter applyCatalogPolicy, the reference inventory reports, or any
// GTA 6 evidence. Williams Sonoma does not sell video games, so the shelf has none.
//
// Block line format:  Brand | Title | prices | was | rating | reviews | flags | colors
//   prices  "149.95" or "8\"=79.95;10\"=119.95" (size=price; first size is the default)
//   was     suggested price of the first size, blank when not on sale
//   flags   N new · E exclusive · B best seller · F free shipping · L limited-time deal ·
//           C clearance · +key extra subcategory (last path segment of a /shop/ link)
//   colors  comma-separated color names
import { subcategories } from './site-data.js'

const sub = (dept, key, art, rows, about) => ({ dept, key, art, rows, about })
const blocks = [
  // ---------------------------------------------------------------- Cookware
  sub('cookware', 'cookware-sets', { category: 'Cookware', type: 'Cookware Sets' }, `
All-Clad|All-Clad D3® Tri-Ply Stainless-Steel 10-Piece Cookware Set|899.95|1229.95|4.7|1184|F B L +stainless-steel-cookware +cookware-induction|
All-Clad|All-Clad D5® Brushed Stainless-Steel 10-Piece Cookware Set|1199.95|1629.95|4.6|412|F +stainless-steel-cookware +cookware-induction|
All-Clad|All-Clad HA1 Hard Anodized Nonstick 13-Piece Cookware Set|499.95|699.95|4.5|2034|F L +nonstick-cookware|
Le Creuset|Le Creuset Signature Enameled Cast Iron 7-Piece Cookware Set|1045.95|1475.95|4.8|96|F E +cookware-enameled-cast-iron|Flame,Marseille,Sage,Oyster
Staub|Staub Enameled Cast Iron 4-Piece Cookware Set|399.95|697.00|4.7|154|F L +cookware-enameled-cast-iron|Graphite Grey,Cherry,Dark Blue,White Truffle
Hestan|Hestan ProBond® Professional Clad Stainless-Steel 10-Piece Cookware Set|1199.95||4.8|88|F E +stainless-steel-cookware +cookware-induction|
GreenPan™|GreenPan™ Stanley Tucci™ Ceramic Nonstick 11-Piece Cookware Set|599.95||4.5|210|F E N +cookware-ceramic-nonstick|Espresso,Venetian Blue,Sage
Williams Sonoma|Williams Sonoma Signature Thermo-Clad™ Stainless-Steel 10-Piece Cookware Set|799.95|1149.95|4.7|562|F E L +stainless-steel-cookware +hybrid-cookware|
Williams Sonoma|Williams Sonoma Thermo-Clad™ Nonstick 10-Piece Cookware Set|699.95|999.95|4.6|318|F E +nonstick-cookware|
Mauviel 1830|Mauviel M'Heritage M150S Copper 10-Piece Cookware Set|1999.95||4.8|41|F +cookware-copper|
SCANPAN®|SCANPAN® HaptIQ 10-Piece Cookware Set|649.95|899.95|4.6|133|F C +nonstick-cookware +cookware-induction|
Cuisinart|Cuisinart Multiclad Pro Triple-Ply Stainless-Steel 12-Piece Cookware Set|349.95|500.00|4.6|1630|F +stainless-steel-cookware|`,
  'A complete kitchen in one box: the core pans and pots you reach for every day, with matching lids.'),
  sub('cookware', 'fry-pans-skillets', { category: 'Cookware', type: 'Fry Pans' }, `
All-Clad|All-Clad D3® Tri-Ply Stainless-Steel Fry Pan|8"=79.95;10"=119.95;12"=149.95||4.8|3105|F B +stainless-steel-cookware +cookware-induction|
All-Clad|All-Clad HA1 Hard Anodized Nonstick Fry Pan, Set of 2|8" & 10"=79.95|109.95|4.6|5210|F L +nonstick-cookware|
Le Creuset|Le Creuset Signature Enameled Cast Iron Skillet|9"=154.95;10 1/4"=179.95;11 3/4"=219.95||4.7|402|F +cookware-enameled-cast-iron|Flame,Cerise,Marseille,Sage,Oyster
Staub|Staub Cast Iron Traditional Deep Skillet|11"=149.95|299.00|4.6|187|F L +cookware-enameled-cast-iron|Graphite Grey,Cherry,Black Matte
Smithey|Smithey No. 12 Cast Iron Skillet|240.00||4.9|381|F +cookware-seasoned-cast-iron|
Lodge|Lodge Seasoned Cast Iron Skillet|10 1/4"=29.95;12"=44.95||4.8|2207|+cookware-seasoned-cast-iron|
GreenPan™|GreenPan™ Venice Pro Ceramic Nonstick Fry Pan, Set of 2|99.95|149.95|4.4|642|F +cookware-ceramic-nonstick|
Hestan|Hestan NanoBond® Titanium Stainless-Steel Skillet|8 1/2"=159.95;11"=219.95;12 1/2"=259.95||4.7|318|F E +stainless-steel-cookware +cookware-induction|
de Buyer|de Buyer Mineral B Carbon Steel Fry Pan|8"=59.95;10 1/4"=79.95;12 1/2"=99.95||4.6|274|+cookware-carbon-steel|
Williams Sonoma|Williams Sonoma Thermo-Clad™ Nonstick Fry Pan|8"=69.95;10"=99.95;12"=119.95||4.5|705|F E +nonstick-cookware|
SCANPAN®|SCANPAN® Classic Fry Pan|8"=79.95;10 1/4"=99.95;12 1/2"=129.95||4.5|228|F +nonstick-cookware|`,
  'Sloped sides for easy flipping and quick evaporation, for searing, sautéing and frying.'),
  sub('cookware', 'dutch-ovens-braisers', { category: 'Cookware', type: 'Dutch Ovens' }, `
Le Creuset|Le Creuset Signature Enameled Cast Iron Round Dutch Oven|3 1/2-Qt.=339.95;4 1/2-Qt.=384.95;5 1/2-Qt.=434.95;7 1/4-Qt.=484.95;9-Qt.=564.95||4.9|6912|F B +cookware-enameled-cast-iron +top-10-food-gifts|Flame,Cerise,Marseille,Sage,Oyster,White,Shallot,Nectar,Artichaut,Indigo
Le Creuset|Le Creuset Signature Enameled Cast Iron Oval Dutch Oven|5-Qt.=399.95;6 3/4-Qt.=459.95||4.8|1240|F +cookware-enameled-cast-iron|Flame,Cerise,Marseille,Oyster
Le Creuset|Le Creuset Signature Cast Iron Round Wide Dutch Oven, 3-Qt.|199.95|324.95|4.8|512|F L +cookware-enameled-cast-iron|Flame,Sage,Shallot,Oyster
Le Creuset|Le Creuset Signature Enameled Cast Iron Braiser|3 1/2-Qt.=359.95;5-Qt.=419.95||4.8|987|F +cookware-enameled-cast-iron|Flame,Cerise,Marseille,Sage,Oyster
Staub|Staub Cast Iron Round Cocotte|2 3/4-Qt.=179.95;4-Qt.=199.95;5 1/2-Qt.=249.95;7-Qt.=299.95|359.00|4.8|2318|F L B +cookware-enameled-cast-iron|Graphite Grey,Black Matte,Cherry,Dark Blue,White Truffle,Basil
Staub|Staub Cast Iron Pumpkin Cocotte, 3 1/2-Qt.|199.95|380.00|4.9|212|F L N +cookware-enameled-cast-iron +all-thanksgiving +all-halloween|Burnt Orange,Graphite Grey,White Truffle
Staub|Staub Cast Iron Braiser with Glass Lid, 3 1/2-Qt.|179.95|351.00|4.7|604|F L +cookware-enameled-cast-iron|Graphite Grey,Cherry,Dark Blue
Williams Sonoma|Williams Sonoma Signature Thermo-Clad™ Stainless-Steel Dutch Oven, 6-Qt.|229.95|329.95|4.6|188|F E +stainless-steel-cookware|
Mauviel 1830|Mauviel M'Cook Stainless-Steel Braiser, 3.6-Qt.|249.95||4.6|57|F +stainless-steel-cookware|`,
  'Heavy, lidded and oven-safe: made for low, slow braises, stews, soups and no-knead bread.'),
  sub('cookware', 'saucepans-sauciers', { category: 'Cookware', type: 'Saucepans' }, `
All-Clad|All-Clad D3® Tri-Ply Stainless-Steel Saucepan|2-Qt.=139.95;3-Qt.=169.95;4-Qt.=199.95||4.8|1406|F +stainless-steel-cookware +cookware-induction|
All-Clad|All-Clad Copper Core® Saucier, 3-Qt.|299.95|399.95|4.7|143|F +cookware-copper|
Mauviel 1830|Mauviel M'250C Copper Saucepan with Lid|1.9-Qt.=399.95;2.7-Qt.=479.95||4.8|66|F +cookware-copper|
Le Creuset|Le Creuset Signature Enameled Cast Iron Saucier, 2-Qt.|259.95||4.7|219|F +cookware-enameled-cast-iron|Flame,Marseille,Sage
Williams Sonoma|Williams Sonoma Signature Thermo-Clad™ Stainless-Steel Saucier, 3-Qt.|149.95|219.95|4.7|402|F E L +stainless-steel-cookware|
Hestan|Hestan ProBond® Professional Clad Stainless-Steel Saucepan, 3-Qt.|199.95||4.7|112|F +stainless-steel-cookware|`,
  'For sauces, grains, custards and reheating — straight or rounded sides with a tight lid.'),
  sub('cookware', 'stock-soup-multi-pots', { category: 'Cookware', type: 'Stockpots' }, `
All-Clad|All-Clad D3® Tri-Ply Stainless-Steel Stockpot, 12-Qt.|299.95|429.95|4.8|655|F L +stainless-steel-cookware|
All-Clad|All-Clad Stainless-Steel Multipot with Pasta Insert & Steamer, 8-Qt.|249.95||4.7|1820|F B +stainless-steel-cookware|
Le Creuset|Le Creuset Enameled Steel Stockpot|8-Qt.=129.95;12-Qt.=169.95||4.6|340|F|Flame,Cerise,Marseille
Williams Sonoma|Williams Sonoma Thermo-Clad™ Stainless-Steel Stockpot, 8-Qt.|199.95||4.6|97|F E +stainless-steel-cookware|
Staub|Staub Cast Iron Tall Cocotte, 5-Qt.|229.95|390.00|4.7|74|F L +cookware-enameled-cast-iron|Graphite Grey,Cherry`,
  'Tall, generous pots for stocks, soups, pasta, shellfish and big-batch cooking.'),
  sub('cookware', 'saute-pans', { category: 'Cookware', type: 'Saute Pans' }, `
All-Clad|All-Clad D3® Tri-Ply Stainless-Steel Sauté Pan with Lid|3-Qt.=179.95;4-Qt.=229.95;6-Qt.=279.95||4.8|902|F +stainless-steel-cookware +cookware-induction|
Le Creuset|Le Creuset Signature Enameled Cast Iron Everyday Pan, 3-Qt.|249.95||4.7|311|F +cookware-enameled-cast-iron|Flame,Sage,Oyster,Nectar
Hestan|Hestan CopperBond® Induction Copper Sauté Pan, 3 1/2-Qt.|399.95||4.8|61|F +cookware-copper +cookware-induction|
Williams Sonoma|Williams Sonoma Thermo-Clad™ Nonstick Essential Pan, 5-Qt.|149.95|199.95|4.6|268|F E +nonstick-cookware|
GreenPan™|GreenPan™ GP5 Ceramic Nonstick Everyday Pan, 4-Qt.|149.95||4.5|133|F N +cookware-ceramic-nonstick|Cream,Black`,
  'Straight sides and a wide base for shallow frying, braising and one-pan dinners.'),
  sub('cookware', 'roasters', { category: 'Cookware', type: 'Roasting Pans' }, `
All-Clad|All-Clad Stainless-Steel Flared Roaster with Rack, 16"|199.95|279.95|4.8|1503|F L B +all-thanksgiving +stainless-steel-cookware|
Williams Sonoma|Williams Sonoma Signature Thermo-Clad™ Stainless-Steel Ultimate Roaster with Rack|299.95||4.8|402|F E +all-thanksgiving +stainless-steel-cookware|
Mauviel 1830|Mauviel M'Cook Stainless-Steel Roasting Pan with Rack|249.95||4.7|83|F +all-thanksgiving|
Le Creuset|Le Creuset Signature Enameled Cast Iron Rectangular Roaster, 5 1/4-Qt.|329.95||4.7|76|F +cookware-enameled-cast-iron|Flame,Marseille`,
  'Roasting pans with rack and sturdy handles, sized for a holiday turkey or a weeknight chicken.'),
  sub('cookware', 'grills-griddles', { category: 'Cookware', type: 'Grill Pans' }, `
Le Creuset|Le Creuset Signature Enameled Cast Iron Square Skillet Grill, 10 1/4"|189.95||4.6|287|F +cookware-enameled-cast-iron|Flame,Marseille
Staub|Staub Cast Iron Square Grill Pan, 12"|149.95|293.00|4.6|201|F L +cookware-enameled-cast-iron|Graphite Grey,Black Matte
All-Clad|All-Clad HA1 Hard Anodized Nonstick Double Burner Griddle|99.95||4.5|916|F +nonstick-cookware|`,
  'Ridged grill pans and flat griddles for char marks and big breakfasts indoors.'),
  sub('cookware', 'omelette-egg-pans', { category: 'Cookware', type: 'Crepe Pans' }, `
de Buyer|de Buyer Mineral B Carbon Steel Crêpe Pan, 9 1/2"|59.95||4.6|212|+cookware-carbon-steel|
Le Creuset|Le Creuset Toughened Nonstick PRO Crêpe Pan, 11"|99.95||4.5|133|F +nonstick-cookware|`,
  'Low, flat pans for omelettes, crêpes and fried eggs.'),
  sub('cookware', 'woks', { category: 'Cookware', type: 'Woks' }, `
Staub|Staub Cast Iron Wok with Glass Lid, 4 1/2-Qt.|249.95|404.00|4.6|92|F L +cookware-enameled-cast-iron|Graphite Grey,Black Matte
Williams Sonoma|Williams Sonoma Signature Thermo-Clad™ Stainless-Steel Wok, 14"|199.95||4.5|64|F E +stainless-steel-cookware|`,
  'Deep, flared woks for stir-frying, steaming and deep-frying.'),
  sub('cookware', 'cookware-fondue-shop', { category: 'Cookware', type: 'Fondue' }, `
Staub|Staub Cast Iron Fondue Set|179.95|315.00|4.7|58|F L|Graphite Grey,Cherry
Le Creuset|Le Creuset Signature Enameled Cast Iron Fondue Set, 2-Qt.|239.95||4.6|71|F|Flame,Marseille`,
  'Cheese and chocolate fondue sets with forks and burner.'),
  // ---------------------------------------------------------------- Electrics
  sub('electrics', 'espresso-makers', { category: 'Electrics', type: 'Espresso Machines' }, `
Breville|Breville Barista Pro Espresso Machine|849.95||4.7|2120|F B +coffee-espresso-event|Brushed Stainless Steel,Black Truffle,Sea Salt
Breville|Breville Barista Touch™ Impress Espresso Machine|1499.95||4.6|388|F|Brushed Stainless Steel,Black Truffle
Breville|Breville Oracle® Jet Espresso Machine|1999.95||4.7|176|F N|Brushed Stainless Steel,Black Truffle
Breville|Breville the Bambino® Plus Espresso Machine|399.95|499.95|4.6|3410|F L +coffee-espresso-event|Brushed Stainless Steel,Black Truffle,Sea Salt
De'Longhi|De'Longhi Dinamica Plus Fully Automatic Espresso Machine with LatteCrema|1499.95|1799.95|4.4|612|F L +coffee-espresso-event|
De'Longhi|De'Longhi La Specialista Arte Evo Espresso Machine with Cold Brew|649.95||4.5|248|F|Stainless Steel
Nespresso|Nespresso Vertuo Next Coffee & Espresso Maker by Breville|169.95||4.3|1855|F|Matte Black,Light Grey,Cherry Red
Nespresso|Nespresso Creatista Pro Espresso Machine by Breville|899.95||4.5|402|F|Brushed Stainless Steel
Rancilio|Rancilio Silvia Pro X Espresso Machine|2295.00||4.8|61|F|`,
  'Pull café-quality shots at home, from compact semi-automatics to bean-to-cup machines.'),
  sub('electrics', 'coffee-makers', { category: 'Electrics', type: 'Coffee Makers' }, `
Breville|Breville Precision Brewer® Thermal Coffee Maker, 12-Cup|349.95||4.5|705|F|Brushed Stainless Steel
Fellow|Fellow Aiden Precision Coffee Maker|365.00||4.5|188|F N|Matte Black,Matte White
Cuisinart|Cuisinart PerfecTemp® Programmable Coffee Maker, 14-Cup|119.95||4.4|2860|F|
SMEG|SMEG 50's Style Retro Drip Coffee Maker, 10-Cup|229.95||4.4|517|F|Pastel Green,Cream,Black,Red,Pastel Blue
Chemex|Chemex Classic Pour-Over Glass Coffeemaker, 8-Cup|49.95||4.8|1210||`,
  'Drip, pour-over and thermal brewers for a reliable morning cup.'),
  sub('electrics', 'coffee-grinders', { category: 'Electrics', type: 'Coffee Grinders' }, `
Breville|Breville the Smart Grinder™ Pro|199.95||4.6|3022|F B|Brushed Stainless Steel,Black Truffle
Fellow|Fellow Opus Conical Burr Grinder|195.00||4.4|260|F|Matte Black`,
  'Burr grinders with precise settings from espresso to cold brew.'),
  sub('electrics', 'electrics-teakettles', { category: 'Electrics', type: 'Kettles' }, `
Fellow|Fellow Stagg EKG Pro Electric Pour-Over Kettle|195.00||4.7|612|F|Matte Black,Polished Steel,Matte White
SMEG|SMEG 50's Style Retro Electric Kettle|189.95||4.6|1440|F|Pastel Green,Cream,Black,Red,Pastel Blue,White
Breville|Breville the Smart Kettle Luxe™|199.95||4.6|204|F|Brushed Stainless Steel
Le Creuset|Le Creuset Classic Whistling Tea Kettle, 1.7-Qt.|119.95||4.7|2390|F|Flame,Cerise,Marseille,Sage,Oyster`,
  'Electric and stovetop kettles, including variable-temperature models for tea and pour-over.'),
  sub('electrics', 'coffee-milk-frothers', { category: 'Electrics', type: 'Milk Frothers' }, `
Breville|Breville the Milk Café™ Milk Frother|149.95||4.5|1288|F|Brushed Stainless Steel
Nespresso|Nespresso Aeroccino4 Milk Frother|129.00||4.6|706|F|Black`,
  'Hot and cold milk foam for lattes, cappuccinos and hot chocolate.'),
  sub('electrics', 'toasters-ovens', { category: 'Electrics', type: 'Toaster Ovens' }, `
Breville|Breville the Smart Oven® Air Fryer Pro|399.95|469.95|4.7|4120|F B L +electrics-fryers|Brushed Stainless Steel,Black Truffle,Sea Salt
Breville|Breville the Joule® Oven Air Fryer Pro|499.95||4.6|322|F +electrics-fryers|Brushed Stainless Steel
SMEG|SMEG 50's Style Retro 2-Slice Toaster|199.95||4.5|1630|F|Pastel Green,Cream,Black,Red,Pastel Blue,White
Breville|Breville the Die-Cast 2-Slice Smart Toaster|179.95||4.5|902|F|Brushed Stainless Steel
BALMUDA|BALMUDA The Toaster Steam Oven|349.00||4.6|255|F|Black,White,Beige`,
  'Toasters and countertop ovens that bake, roast, broil and air fry.'),
  sub('electrics', 'electrics-fryers', { category: 'Electrics', type: 'Air Fryers' }, `
Philips|Philips Premium Airfryer XXL|349.95|399.95|4.5|1120|F L|Black
Cuisinart|Cuisinart Air Fryer Toaster Oven with Grill|229.95||4.4|2040|F|Stainless Steel`,
  'Crisp, golden results with a fraction of the oil.'),
  sub('electrics', 'mixers-attachments', { category: 'Electrics', type: 'Stand Mixers' }, `
KitchenAid®|KitchenAid® Artisan Tilt-Head Stand Mixer, 5-Qt.|449.95|499.95|4.8|12048|F B L +top-10-food-gifts|Empire Red,Onyx Black,White,Pistachio,Ice Blue,Matte Black,Contour Silver,Blue Velvet
KitchenAid®|KitchenAid® Pro 600 Bowl-Lift Stand Mixer, 6-Qt.|549.95||4.7|3210|F|Empire Red,Onyx Black,White,Contour Silver
KitchenAid®|KitchenAid® Artisan Mini Tilt-Head Stand Mixer, 3 1/2-Qt.|379.95||4.6|1802|F|Matte Black,Hibiscus,Twilight Blue,Pistachio
KitchenAid®|KitchenAid® 7-Speed Digital Hand Mixer|99.95||4.6|870|F|Empire Red,Onyx Black,White
KitchenAid®|KitchenAid® Pasta Roller & Cutter Attachment Set, 3-Piece|219.95||4.7|2933|F +electrics-pasta-machines|
KitchenAid®|KitchenAid® Ice Cream Maker Attachment|99.95||4.4|1730|F +electrics-ice-cream-makers|
SMEG|SMEG 50's Style Retro Stand Mixer|549.95||4.5|488|F|Pastel Green,Cream,Black,Red,Pastel Blue`,
  'Stand mixers, hand mixers and the attachments that make them do more.'),
  sub('electrics', 'blenders', { category: 'Electrics', type: 'Blenders' }, `
Vitamix|Vitamix A3500 Ascent Series Smart System Blender|549.95|649.95|4.8|1920|F L +vitamix-promo|Brushed Stainless,Black Stainless,Graphite
Vitamix|Vitamix 5200 Blender|449.95||4.8|6021|F B +vitamix-promo|Black,White,Red
KitchenAid®|KitchenAid® K400 Variable Speed Blender|229.95||4.6|1201|F|Empire Red,Matte Black,Pistachio,Contour Silver
Breville|Breville the Control Grip™ Immersion Blender|129.95||4.5|2203|F|Brushed Stainless Steel`,
  'High-performance blenders for smoothies, soups, nut butters and frozen drinks.'),
  sub('electrics', 'electrics-juicers', { category: 'Electrics', type: 'Juicers' }, `
Breville|Breville the Juice Fountain® Plus|199.95||4.5|1340|F|Brushed Stainless Steel
Breville|Breville the 3X Bluicer™ Pro Blender & Juicer|349.95||4.4|188|F|Brushed Stainless Steel,Black Truffle`,
  'Centrifugal and slow juicers for fresh juice at home.'),
  sub('electrics', 'food-processors', { category: 'Electrics', type: 'Food Processors' }, `
Breville|Breville the Sous Chef® 16 Pro Food Processor|499.95||4.7|930|F|Brushed Stainless Steel
Cuisinart|Cuisinart Custom 14-Cup Food Processor|249.95||4.7|4410|F B|Brushed Stainless,White
KitchenAid®|KitchenAid® 9-Cup Food Processor|199.95||4.5|655|F|Empire Red,Onyx Black,Contour Silver`,
  'Slice, shred, chop and knead in seconds.'),
  sub('electrics', 'pressure-rice-slow-cookers', { category: 'Electrics', type: 'Slow Cookers' }, `
Breville|Breville the Fast Slow Pro™ Multi Cooker, 6-Qt.|279.95||4.6|1490|F|Brushed Stainless Steel
Zojirushi|Zojirushi Neuro Fuzzy® Rice Cooker, 5 1/2-Cup|224.95||4.8|2110|F|White
All-Clad|All-Clad Slow Cooker with Cast-Aluminum Insert, 7-Qt.|279.95|349.95|4.5|980|F L|Stainless Steel
Instant Pot|Instant Pot® Pro Plus 10-in-1 Pressure Cooker, 6-Qt.|199.95||4.5|720|F|Black`,
  'Set-and-forget cookers for rice, stews, beans and braises.'),
  sub('electrics', 'waffle-bread-makers', { category: 'Electrics', type: 'Waffle Makers' }, `
Breville|Breville the No-Mess Waffle™ Maker|159.95||4.6|1430|F|Brushed Stainless Steel
All-Clad|All-Clad Belgian Waffle Maker|199.95||4.7|2350|F B|Stainless Steel
Zojirushi|Zojirushi Home Bakery Virtuoso Plus Breadmaker|399.95||4.7|540|F|Black`,
  'Belgian waffles and homemade loaves, made easy.'),
  sub('electrics', 'electrics-ice-cream-makers', { category: 'Electrics', type: 'Ice Cream Makers' }, `
Breville|Breville the Smart Scoop™ Ice Cream Maker|499.95||4.7|802|F|Brushed Stainless Steel
Ninja|Ninja CREAMi® Deluxe 11-in-1 Ice Cream Maker|249.95||4.6|1180|F N|Silver`,
  'Ice cream, gelato, sorbet and frozen yogurt at home.'),
  sub('electrics', 'pizza-ovens', { category: 'Electrics', type: 'Pizza Ovens' }, `
Breville|Breville the Smart Oven® Pizzaiolo|999.95||4.7|402|F|Brushed Stainless Steel
Ooni|Ooni Koda 16 Gas Pizza Oven|599.00||4.8|1310|F +outdoor-cookware-all|Black
Gozney|Gozney Dome Dual-Fuel Pizza Oven|1999.00||4.8|244|F|Bone,Olive`,
  'Indoor and outdoor ovens that reach Neapolitan temperatures.'),
  sub('electrics', 'electrics-sous-vide-machines', { category: 'Electrics', type: 'Sous Vide' }, `
Breville|Breville Joule® Turbo Sous Vide|249.95||4.6|510|F|White
Anova|Anova Precision® Cooker 3.0|199.00||4.5|420|F|Black`,
  'Precise water-bath cooking for perfect steaks, eggs and vegetables.'),
  sub('electrics', 'electrics-microwaves', { category: 'Electrics', type: 'Microwaves' }, `
Breville|Breville the Combi Wave™ 3-in-1 Microwave|499.95||4.5|333|F|Brushed Stainless Steel`,
  'Microwaves that also air fry and convection bake.'),
  // ---------------------------------------------------------------- Cutlery
  sub('cutlery', 'knife-sets', { category: 'Cutlery', type: 'Knife Sets' }, `
Shun|Shun Classic 7-Piece Knife Block Set|599.95|899.95|4.8|1350|F B L +offers-shun-promo|
Zwilling|Zwilling Pro 7-Piece Knife Block Set|449.95|870.00|4.8|920|F L +offers-zwilling-cutlery-promo|
WÜSTHOF|WÜSTHOF Classic 8-Piece Knife Block Set|549.95|1050.00|4.8|770|F L|
Miyabi|Miyabi Kaizen II 7-Piece Knife Block Set|699.95||4.8|188|F|
Shun|Shun Premier Grey 6-Piece Knife Block Set|849.95||4.9|96|F E +offers-shun-promo|`,
  'Everything you need in one block, from paring to chef’s knife.'),
  sub('cutlery', 'cutlery-chef-knives', { category: 'Cutlery', type: 'Chef Knives' }, `
Shun|Shun Classic Chef's Knife, 8"|179.95||4.8|2410|F B|
Zwilling|Zwilling Pro Chef's Knife|8"=129.95;10"=149.95|194.00|4.8|1320|F L +offers-zwilling-cutlery-promo|
WÜSTHOF|WÜSTHOF Classic Chef's Knife|6"=119.95;8"=169.95;10"=189.95||4.8|3010|F|
Miyabi|Miyabi Birchwood SG2 Chef's Knife, 8"|349.95||4.9|402|F|
Shun|Shun Premier Chef's Knife, 8"|209.95||4.8|611|F|
Shun|Shun Tomi Chef's Knife, 8"|199.95||4.8|52|F E N|
MAC|MAC Professional Hollow Edge Chef's Knife, 8"|184.95||4.9|340|F|`,
  'The everyday workhorse for chopping, slicing, dicing and mincing.'),
  sub('cutlery', 'steak-knives', { category: 'Cutlery', type: 'Steak Knives' }, `
Zwilling|Zwilling Porterhouse Steak Knives, Set of 8|99.95|200.00|4.7|840|F L|
WÜSTHOF|WÜSTHOF Gourmet Steak Knives, Set of 4|119.95||4.6|260|F|
Shun|Shun Classic Steak Knives, Set of 4|329.95||4.9|141|F|`,
  'Sharp, balanced steak knives for the table.'),
  sub('cutlery', 'cutlery-santoku-knives', { category: 'Cutlery', type: 'Santoku Knives' }, `
Shun|Shun Classic Nakiri Knife, 6 1/2"|159.95||4.8|512|F|
Zwilling|Zwilling Pro Hollow Edge Santoku Knife, 7"|119.95|160.00|4.8|630|F L|
Miyabi|Miyabi Kaizen II Santoku Knife, 7"|179.95||4.8|204|F|`,
  'Japanese-style blades for thin, precise slicing of vegetables, fish and meat.'),
  sub('cutlery', 'paring-knives', { category: 'Cutlery', type: 'Paring Knives' }, `
WÜSTHOF|WÜSTHOF Classic Paring Knife, 3 1/2"|79.95||4.8|1100|F|
Shun|Shun Classic Paring Knife, 4"|99.95||4.8|708|F|`,
  'Small blades for peeling, trimming and detail work.'),
  sub('cutlery', 'bread-knives', { category: 'Cutlery', type: 'Bread Knives' }, `
Shun|Shun Classic Bread Knife, 9"|169.95||4.8|402|F|
WÜSTHOF|WÜSTHOF Classic Double-Serrated Bread Knife, 9"|149.95||4.7|388|F|`,
  'Serrated blades that saw through crusty loaves without crushing the crumb.'),
  sub('cutlery', 'utility-knives', { category: 'Cutlery', type: 'Utility Knives' }, `
Shun|Shun Classic Utility Knife, 6"|129.95||4.7|240|F|`,
  'A mid-size knife for sandwiches, fruit and smaller produce.'),
  sub('cutlery', 'slicing-carving-knives', { category: 'Cutlery', type: 'Carving Sets' }, `
Zwilling|Zwilling Pro 2-Piece Carving Set|179.95|260.00|4.8|210|F L +thanksgiving-cutlery|
WÜSTHOF|WÜSTHOF Classic Hollow Edge Brisket Knife, 12"|189.95||4.8|132|F +thanksgiving-cutlery|`,
  'Long, thin slicers and carving forks for roasts, hams and the holiday bird.'),
  sub('cutlery', 'specialty-knives', { category: 'Cutlery', type: 'Boning Knives' }, `
Shun|Shun Classic Boning & Fillet Knife, 6"|149.95||4.8|164|F|`,
  'Specialty blades for boning, filleting and butchery.'),
  sub('cutlery', 'cutting-boards-storage', { category: 'Tools', type: 'Cutting Boards' }, `
John Boos|John Boos Maple Edge-Grain Reversible Cutting Board|18" x 12"=94.95;20" x 15"=124.95;24" x 18"=164.95||4.8|2210|B|
Williams Sonoma|Williams Sonoma Walnut End-Grain Cutting Board|16" x 12"=159.95;20" x 15"=219.95||4.8|388|E +cutlery-ws-cutting-boards|
Williams Sonoma|Williams Sonoma Olivewood Rustic Cutting Board|59.95||4.7|420|E +cutlery-ws-cutting-boards|
Epicurean|Epicurean Kitchen Series Cutting Board|24.95||4.6|840||`,
  'Knife-friendly boards in hardwood and composite.'),
  sub('cutlery', 'knives-blocks-storage', { category: 'Cutlery', type: 'Knife Blocks' }, `
Shun|Shun Bamboo 11-Slot Knife Block|99.95||4.7|240||
Williams Sonoma|Williams Sonoma Magnetic Walnut Knife Strip, 18"|69.95||4.6|132|E +cutlery-ws-cutting-boards|`,
  'Blocks and magnetic strips that protect your edges.'),
  sub('cutlery', 'knife-sharpeners-honing', { category: 'Cutlery', type: 'Sharpeners' }, `
Chef'sChoice|Chef'sChoice Trizor XV® EdgeSelect® Electric Knife Sharpener|179.95||4.6|980|F|
Shun|Shun Combination Whetstone, 1000/6000 Grit|89.95||4.7|402||
WÜSTHOF|WÜSTHOF Honing Steel, 10"|49.95||4.6|512||`,
  'Electric sharpeners, whetstones and honing steels to keep edges keen.'),
  sub('cutlery', 'kitchen-shears', { category: 'Cutlery', type: 'Kitchen Shears' }, `
Shun|Shun Multi-Purpose Kitchen Shears|59.95||4.7|602||
Zwilling|Zwilling TWIN® Kitchen Shears|39.95||4.7|1210||`,
  'Heavy-duty shears for herbs, poultry and packaging.'),
  // ---------------------------------------------------------------- Cooks' Tools
  sub('cooks-tools', 'tool-sets', { category: 'Tools', type: 'Utensils' }, `
Williams Sonoma|Williams Sonoma Olivewood Utensils, Set of 4|59.95||4.7|604|E|
Le Creuset|Le Creuset Craft Series 5-Piece Utensil Set with Crock|89.95||4.7|388||Flame,Sage,Marseille`,
  'Coordinated utensils to keep by the stove.'),
  sub('cooks-tools', 'turner-spatulas', { category: 'Tools', type: 'Spatulas' }, `
GIR|GIR Ultimate Spatula|17.95||4.8|2280|B|Black,Studio White,Teal,Red
Williams Sonoma|Williams Sonoma Silicone Spatulas, Set of 3|29.95||4.6|512|E|
OXO|OXO Good Grips Stainless-Steel Fish Turner|14.99||4.7|860||`,
  'Turners and spatulas for flipping, folding and scraping.'),
  sub('cooks-tools', 'slotted-spoons-sets', { category: 'Tools', type: 'Spoons' }, `
All-Clad|All-Clad Stainless-Steel Ladle|34.95||4.7|240||
Rösle|Rösle Balloon Whisk, 10 1/2"|29.95||4.8|330||
Williams Sonoma|Williams Sonoma Olivewood Spoon, 12"|19.95||4.7|402|E|`,
  'Spoons, ladles and whisks for stirring, serving and whipping.'),
  sub('cooks-tools', 'tongs', { category: 'Tools', type: 'Tongs' }, `
OXO|OXO Good Grips 12" Locking Tongs|17.95||4.7|1940||
Williams Sonoma|Williams Sonoma Stainless-Steel Tongs|9"=12.95;12"=14.95||4.6|720|E|`,
  'Locking tongs and forks for grilling, tossing and serving.'),
  sub('cooks-tools', 'salt-pepper-mills', { category: 'Tools', type: 'Pepper Mills' }, `
Peugeot|Peugeot Paris u'Select Pepper Mill|7"=59.95;9"=69.95;12"=89.95||4.7|802||Natural,Chocolate,Black
Cole & Mason|Cole & Mason Derwent Salt & Pepper Mill Set|79.95||4.5|540||
Le Creuset|Le Creuset Pepper Mill|49.95||4.4|260||Flame,Marseille,Oyster`,
  'Adjustable mills for freshly ground salt and pepper.'),
  sub('cooks-tools', 'oil-dispeners', { category: 'Tools', type: 'Oil Dispensers' }, `
Williams Sonoma|Williams Sonoma Glass Olive Oil Mister|24.95||4.3|388|E|`,
  'Cruets, misters and pourers for oils and vinegars.'),
  sub('cooks-tools', 'measuring-cups-spoons', { category: 'Tools', type: 'Measuring Cups' }, `
All-Clad|All-Clad Stainless-Steel Measuring Cups, Set of 4|49.95||4.8|620||
Williams Sonoma|Williams Sonoma Stainless-Steel Measuring Spoons, Set of 5|19.95||4.7|802|E|`,
  'Accurate measures for baking and cooking.'),
  sub('cooks-tools', 'cooks-mixing-bowls', { category: 'Tools', type: 'Mixing Bowls' }, `
Williams Sonoma|Williams Sonoma Stainless-Steel Restaurant Mixing Bowls, Set of 3|49.95||4.7|1102|E B|
Mason Cash|Mason Cash Cane Mixing Bowl, 4-Qt.|39.95||4.8|402||Cream`,
  'Nesting bowls for mixing, marinating and serving.'),
  sub('cooks-tools', 'colanders-food-skimmers', { category: 'Tools', type: 'Colanders' }, `
OXO|OXO Good Grips Salad Spinner|34.95||4.8|3820||
All-Clad|All-Clad Stainless-Steel Colander, 5-Qt.|79.95||4.7|210||`,
  'Colanders, strainers and spinners for washing and draining.'),
  sub('cooks-tools', 'peelers', { category: 'Tools', type: 'Peelers' }, `
Kuhn Rikon|Kuhn Rikon Original Swiss Peeler, Set of 3|12.95||4.8|2600||Red,Yellow,Green`,
  'Peelers, choppers and prep helpers.'),
  sub('cooks-tools', 'graters', { category: 'Tools', type: 'Graters' }, `
Microplane|Microplane Premium Classic Zester/Grater|17.95||4.8|3150|B|Black,Red,Blue
Microplane|Microplane 4-Sided Box Grater|39.95||4.6|412||`,
  'Rasps, zesters and box graters for cheese, citrus and spices.'),
  sub('cooks-tools', 'mandolines-slicers', { category: 'Tools', type: 'Mandolines' }, `
Benriner|Benriner Japanese Mandoline Slicer|39.95||4.7|1204||
OXO|OXO Good Grips Chef's Mandoline Slicer 2.0|99.95||4.5|402||`,
  'Even slices, julienne and waffle cuts in seconds.'),
  sub('cooks-tools', 'mortars-pestles', { category: 'Tools', type: 'Mortars' }, `
Williams Sonoma|Williams Sonoma Marble Mortar & Pestle|39.95||4.7|540|E|White Marble`,
  'For pesto, curry pastes and freshly crushed spices.'),
  sub('cooks-tools', 'pizza-tools', { category: 'Tools', type: 'Pizza Tools' }, `
Emile Henry|Emile Henry Flame® Pizza Stone, 14 1/2"|69.95||4.7|712||Charcoal,Burgundy
Williams Sonoma|Williams Sonoma Aluminum Pizza Peel|39.95||4.6|302|E|`,
  'Stones, peels and wheels for homemade pizza.'),
  sub('cooks-tools', 'pasta-tools', { category: 'Tools', type: 'Pasta Machines' }, `
Marcato|Marcato Atlas 150 Pasta Machine|99.95||4.8|1530||Chrome,Red,Blue,Black`,
  'Rollers, cutters and drying racks for fresh pasta.'),
  sub('cooks-tools', 'baking-pastry-tools', { category: 'Tools', type: 'Pastry Tools' }, `
OXO|OXO Good Grips Stainless-Steel Bench Scraper|11.99||4.8|1720||
Williams Sonoma|Williams Sonoma Silicone Pastry Brush|12.95||4.5|240|E|`,
  'Scrapers, brushes, cutters and decorating tools.'),
  sub('cooks-tools', 'tools-meat-poultry', { category: 'Tools', type: 'Meat Tools' }, `
OXO|OXO Good Grips Fat Separator, 4-Cup|24.95||4.6|830|+thanksgiving-tools|
Williams Sonoma|Williams Sonoma Stainless-Steel Turkey Baster|19.95||4.5|302|E +thanksgiving-tools|
Williams Sonoma|Williams Sonoma Turkey Lifters, Set of 2|24.95||4.6|402|E +thanksgiving-tools|`,
  'Basters, lifters, separators and lacers for the perfect roast.'),
  sub('cooks-tools', 'timer-thermometer-scale', { category: 'Tools', type: 'Thermometers' }, `
ThermoWorks|ThermoWorks Thermapen® ONE Instant-Read Thermometer|109.00||4.9|3940|B +thanksgiving-tools|Red,Blue,Black,Green,White
MEATER|MEATER Pro Wireless Smart Meat Thermometer|129.95||4.5|720|N|`,
  'Instant-read and wireless thermometers for perfectly cooked results.'),
  sub('cooks-tools', 'kitchen-scales', { category: 'Tools', type: 'Kitchen Scales' }, `
OXO|OXO Good Grips 11-lb Food Scale with Pull-Out Display|59.95||4.7|2210||`,
  'Digital scales for precise baking and portioning.'),
  sub('cooks-tools', 'can-openers', { category: 'Tools', type: 'Can Openers' }, `
OXO|OXO Good Grips Smooth Edge Can Opener|24.95||4.4|1802||`,
  'Openers that leave smooth, safe edges.'),
  sub('cooks-tools', 'cookbooks-all', { category: 'Books', type: 'Books' }, `
Clarkson Potter|Ina Garten: Go-To Dinners|35.00||4.9|1220||
Simon & Schuster|Samin Nosrat: Salt, Fat, Acid, Heat|35.00||4.9|2602||
Clarkson Potter|Molly Baz: More Is More|35.00||4.8|402|N|
Weldon Owen|Williams Sonoma Complete Thanksgiving Cookbook|29.95||4.7|188|E +thanksgiving-tools|`,
  'Cookbooks from our favorite chefs and the Williams Sonoma test kitchen.'),
  // ---------------------------------------------------------------- Bakeware
  sub('bakeware', 'bakeware-sets', { category: 'Bakeware', type: 'Bakeware Sets' }, `
Williams Sonoma|Williams Sonoma Goldtouch® Pro Nonstick 6-Piece Bakeware Set|229.95|299.95|4.8|1206|E B L +bakeware-nonstick +bakeware-goldtouch-shop|`,
  'The essential pans for cookies, cakes, muffins and loaves.'),
  sub('bakeware', 'sheet-pans-cookie-sheets', { category: 'Bakeware', type: 'Sheet Pans' }, `
Williams Sonoma|Williams Sonoma Goldtouch® Pro Nonstick Half Sheet Pan|44.95||4.8|3302|E B +bakeware-nonstick +bakeware-goldtouch-shop|
Nordic Ware|Nordic Ware Naturals® Aluminum Half Sheet Pans, Set of 2|29.95||4.7|2120|+bakeware-stainless-steel|
All-Clad|All-Clad Pro-Release Nonstick Half Sheet Pan|39.95||4.6|402|+bakeware-nonstick|
Williams Sonoma|Williams Sonoma Traditionaltouch™ Aluminized Steel Quarter Sheet Pan|22.95||4.6|512|E +bakeware-stainless-steel|`,
  'Rimmed pans for cookies, roasted vegetables and sheet-pan suppers.'),
  sub('bakeware', 'cake-pans', { category: 'Bakeware', type: 'Cake Pans' }, `
Nordic Ware|Nordic Ware Anniversary Bundt® Pan, 10-Cup|44.95||4.8|1820|B|Gold,Graphite,Copper
Nordic Ware|Nordic Ware Heritage Bundt® Pan, 10-Cup|49.95||4.8|902||Gold,Graphite
Williams Sonoma|Williams Sonoma Goldtouch® Pro Nonstick Round Cake Pan|8"=24.95;9"=27.95||4.7|840|E +bakeware-nonstick +bakeware-goldtouch-shop|
Williams Sonoma|Williams Sonoma Goldtouch® Pro Nonstick Springform Pan, 9"|39.95||4.6|602|E +bakeware-nonstick +bakeware-goldtouch-shop|
Nordic Ware|Nordic Ware Holiday Tree Cakelet Pan|44.95||4.7|210|N +christmas-bakeware|Gold`,
  'Bundts, rounds, springforms and shaped pans for every celebration.'),
  sub('bakeware', 'casseroles', { category: 'Bakeware', type: 'Baking Dishes' }, `
Le Creuset|Le Creuset Stoneware Heritage Rectangular Baking Dish|2 1/2-Qt.=79.95;4-Qt.=99.95||4.8|1502|B +bakeware-stoneware +le-creuset-bakeware|Flame,Cerise,Marseille,Sage,White
Emile Henry|Emile Henry Modern Classics Rectangular Baker|2.4-Qt.=59.95;4.2-Qt.=79.95||4.8|803|+bakeware-stoneware +bakeware-emile-henry|Flour,Burgundy,Blue Flame
Staub|Staub Ceramic Rectangular Baking Dishes, Set of 2|59.95|128.00|4.7|660|L +bakeware-stoneware|Graphite Grey,Cherry,White
Le Creuset|Le Creuset Signature Enameled Cast Iron Oval Casserole, 2 3/4-Qt.|249.95||4.7|204|+bakeware-cast-iron +le-creuset-bakeware|Flame,Marseille`,
  'Oven-to-table dishes for gratins, lasagna, cobblers and casseroles.'),
  sub('bakeware', 'bread-pans-loaf-pans', { category: 'Bakeware', type: 'Loaf Pans' }, `
Williams Sonoma|Williams Sonoma Goldtouch® Pro Nonstick Loaf Pan|1-lb.=27.95;1 1/2-lb.=29.95||4.8|1204|E +bakeware-nonstick +bakeware-goldtouch-shop +bakeware-fall-baking|
Emile Henry|Emile Henry Bread Cloche|149.95||4.8|512|+bakeware-bread-shop +bakeware-emile-henry +bakeware-stoneware|Charcoal,Burgundy
Le Creuset|Le Creuset Signature Enameled Cast Iron Bread Oven|299.95||4.8|388|+bakeware-bread-shop +le-creuset-bakeware +bakeware-cast-iron|Flame,Oyster,White`,
  'Pans and cloches for sandwich loaves, quick breads and crusty boules.'),
  sub('bakeware', 'cupcake-muffin-pans', { category: 'Bakeware', type: 'Muffin Pans' }, `
Williams Sonoma|Williams Sonoma Goldtouch® Pro Nonstick 12-Well Muffin Pan|39.95||4.8|1402|E +bakeware-nonstick +bakeware-goldtouch-shop|
Nordic Ware|Nordic Ware Haunted Skull Cakelet Pan|44.95||4.7|402|+all-halloween|Gold
Williams Sonoma|Williams Sonoma Goldtouch® Pro Nonstick Pumpkin Mini Loaf Pan|39.95||4.7|188|E N +bakeware-fall-baking +bakeware-goldtouch-shop|`,
  'Muffins, cupcakes and mini cakes in classic and seasonal shapes.'),
  sub('bakeware', 'pie-pans-tart-pans', { category: 'Bakeware', type: 'Pie Dishes' }, `
Emile Henry|Emile Henry Modern Classics Pie Dish, 9"|49.95||4.8|1120|+bakeware-fall-baking +thanksgiving-bakeware +bakeware-emile-henry +bakeware-stoneware|Flour,Burgundy,Blue Flame
Williams Sonoma|Williams Sonoma Nonstick Fluted Tart Pan with Removable Bottom, 9 1/2"|24.95||4.6|512|E|
Le Creuset|Le Creuset Stoneware Heritage Pie Dish, 9"|49.95||4.7|602|+thanksgiving-bakeware +le-creuset-bakeware|Flame,Marseille,White`,
  'Pie dishes and tart pans for flaky crusts and holiday desserts.'),
  sub('bakeware', 'ramekin-mini-cocottes', { category: 'Bakeware', type: 'Ramekins' }, `
Le Creuset|Le Creuset Stoneware Ramekins, Set of 4|59.95||4.8|980|+le-creuset-bakeware +bakeware-stoneware|Flame,Cerise,Marseille,Sage,White
Staub|Staub Ceramic Mini Round Cocottes, Set of 3|49.95|99.00|4.7|402|L|Graphite Grey,Cherry,White`,
  'Individual dishes for soufflés, crème brûlée and pot pies.'),
  sub('bakeware', 'baking-mats-boards', { category: 'Bakeware', type: 'Baking Mats' }, `
Silpat|Silpat Nonstick Baking Mat|Half Sheet=29.95;Quarter Sheet=22.95||4.8|2810|B|`,
  'Reusable nonstick mats and pastry boards.'),
  sub('bakeware', 'bakeware-rolling-pins', { category: 'Tools', type: 'Rolling Pins' }, `
J.K. Adams|J.K. Adams French Rolling Pin|22.95||4.8|902||Maple`,
  'Rolling pins for pastry, cookies and pasta.'),
  sub('bakeware', 'cookie-cutters-pancake-molds', { category: 'Tools', type: 'Cookie Cutters' }, `
Williams Sonoma|Williams Sonoma Halloween Cookie Cutters, Set of 6|19.95||4.6|302|E +all-halloween|
Williams Sonoma|Williams Sonoma Holiday Cookie Cutters, Set of 8|24.95||4.7|604|E +christmas-bakeware|`,
  'Seasonal and classic cutters for decorated cookies.'),
  sub('bakeware', 'bakeware-bread-tools', { category: 'Tools', type: 'Bread Tools' }, `
Williams Sonoma|Williams Sonoma Round Bread Proofing Basket|29.95||4.6|212|E +bakeware-bread-shop|`,
  'Bannetons, lames and tools for homemade bread.'),
  // ---------------------------------------------------------------- Food
  sub('food', 'croissants-bread-pastries', { category: 'Food', type: 'pantry' }, `
Williams Sonoma|Williams Sonoma Mini Croissants, Set of 36|49.95||4.7|1602|E B|
Williams Sonoma|Williams Sonoma Almond Croissants, Set of 6|39.95||4.6|402|E|
Williams Sonoma|Williams Sonoma Cinnamon Rolls, Set of 6|44.95||4.7|540|E|`,
  'Ready-to-bake pastries delivered frozen. Proof overnight and bake in the morning.'),
  sub('food', 'food-desserts-baked-goods', { category: 'Food', type: 'pantry' }, `
Williams Sonoma|Williams Sonoma Bourbon Pecan Pie|54.95||4.6|302|E +all-thanksgiving-food|
Williams Sonoma|Williams Sonoma Pumpkin Pie|44.95||4.5|240|E +all-thanksgiving-food +flavors-of-fall|
Williams Sonoma|Williams Sonoma Bûche de Noël|79.95||4.7|188|E +christmas-food|`,
  'Bakery cakes and pies for the holidays and every celebration in between.'),
  sub('food', 'food-cookies-brownies', { category: 'Food', type: 'pantry' }, `
Fat Witch Bakery|Fat Witch Bakery Brownies, Set of 12|44.95||4.6|402||
Williams Sonoma|Williams Sonoma Pumpkin Whoopie Pies, Set of 8|34.95||4.5|132|E +flavors-of-fall|`,
  'Cookies, brownies and bars for gifting or snacking.'),
  sub('food', 'all-chocolate-candy', { category: 'Food', type: 'pantry' }, `
Williams Sonoma|Williams Sonoma Peppermint Bark|1-lb. Tin=39.95;2-lb. Tin=64.95||4.8|5210|E B +christmas-food +top-10-food-gifts|
Williams Sonoma|Williams Sonoma Dark Chocolate Peppermint Bark, 1-lb. Tin|39.95||4.8|1402|E +christmas-food|
Williams Sonoma|Williams Sonoma Gourmet Caramel Apples, Set of 4|49.95||4.5|402|E +all-halloween +flavors-of-fall|`,
  'Chocolate bark, truffles and confections, packed for gifting.'),
  sub('food', 'food-snacks-popcorn', { category: 'Food', type: 'pantry' }, `
Williams Sonoma|Williams Sonoma Toffee Caramel Corn Tin|34.95||4.6|388|E|`,
  'Popcorn, snack mixes and savory bites.'),
  sub('food', 'fruits-nuts', { category: 'Food', type: 'pantry' }, `
Williams Sonoma|Williams Sonoma Spiced Pecans, 1-lb.|24.95||4.6|212|E|`,
  'Seasoned nuts and dried fruit for snacking and cheese boards.'),
  sub('food', 'food-coffee-tea', { category: 'Food', type: 'coffee' }, `
Williams Sonoma|Williams Sonoma Pumpkin Spice Coffee, 12-oz.|19.95||4.4|402|E +flavors-of-fall|
illy|illy Classico Whole-Bean Coffee, 8.8-oz.|19.95||4.7|604||
Mariage Frères|Mariage Frères Marco Polo Tea Tin, 3.5-oz.|32.00||4.8|240||`,
  'Coffee beans, loose-leaf teas and syrups.'),
  sub('food', 'food-cocktail-mixes', { category: 'Food', type: 'pantry' }, `
Williams Sonoma|Williams Sonoma Bloody Mary Mix|19.95||4.6|302|E|
Williams Sonoma|Williams Sonoma Spiced Cider Mulling Syrup|19.95||4.5|188|E N +flavors-of-fall|`,
  'Cocktail mixers, bitters and garnishes.'),
  sub('food', 'food-hot-chocolate', { category: 'Food', type: 'pantry' }, `
Williams Sonoma|Williams Sonoma Hot Chocolate|12-oz.=24.95;24-oz.=39.95||4.8|2102|E B +christmas-food|
Williams Sonoma|Williams Sonoma Peppermint Hot Chocolate, 12-oz.|24.95||4.7|802|E +christmas-food|`,
  'Shaved chocolate for rich, creamy hot chocolate.'),
  sub('food', 'appetizers-hors-doeuvres', { category: 'Food', type: 'pantry' }, `
Williams Sonoma|Williams Sonoma Mini Crab Cakes, Set of 24|79.95||4.5|302|E|
Williams Sonoma|Williams Sonoma Beef Wellington Bites, Set of 24|89.95||4.6|204|E N|`,
  'Frozen hors d’oeuvres, ready to bake and serve.'),
  sub('food', 'food-entrees', { category: 'Food', type: 'pantry' }, `
Williams Sonoma|Williams Sonoma Lasagna Bolognese, Serves 6-8|99.95||4.6|212|E|
Williams Sonoma|Williams Sonoma Chicken Pot Pie, Serves 4|69.95||4.5|188|E|`,
  'Chef-prepared entrées delivered frozen.'),
  sub('food', 'food-side-dishes', { category: 'Food', type: 'pantry' }, `
Williams Sonoma|Williams Sonoma Potatoes au Gratin, Serves 8|59.95||4.5|140|E +all-thanksgiving-food|
Williams Sonoma|Williams Sonoma Lobster Bisque, Set of 2|49.95||4.6|204|E|`,
  'Sides, soups and breads to round out the meal.'),
  sub('food', 'meat', { category: 'Food', type: 'pantry' }, `
Diestel|Diestel Fully Cooked Heirloom Turkey Breast, 4-lbs.|149.95||4.4|88|+all-thanksgiving-food|
Snake River Farms|Snake River Farms American Wagyu Steak Sampler|199.95||4.8|132||`,
  'Heritage turkeys, roasts and steaks shipped frozen.'),
  sub('food', 'food-oils-vinegar', { category: 'Food', type: 'pantry' }, `
Williams Sonoma|Williams Sonoma Extra-Virgin Olive Oil, 500 ml|24.95||4.7|402|E|
Frantoi Cutrera|Frantoi Cutrera Primo DOP Extra-Virgin Olive Oil, 500 ml|34.95||4.8|212||
Williams Sonoma|Williams Sonoma Black Truffle Oil, 250 ml|29.95||4.5|188|E|`,
  'Finishing oils and aged vinegars for dressing, dipping and drizzling.'),
  sub('food', 'food-spices-seasonings', { category: 'Food', type: 'pantry' }, `
Williams Sonoma|Williams Sonoma Turkey Brine, Set of 2|39.95||4.8|2602|E B +all-thanksgiving-food|
Williams Sonoma|Williams Sonoma Pumpkin Pie Spice|12.95||4.7|240|E +flavors-of-fall|`,
  'Brines, rubs, salts and spice blends.'),
  sub('food', 'pressure-slow-cooking-sauces', { category: 'Food', type: 'pantry' }, `
Williams Sonoma|Williams Sonoma Beef Bourguignon Simmering Sauce|14.95||4.5|330|E|
Williams Sonoma|Williams Sonoma Turkey Gravy Base|16.95||4.8|1820|E B +all-thanksgiving-food|`,
  'Simmering sauces and gravy bases for easy, flavorful meals.'),
  sub('food', 'food-pizza-pasta-sauce', { category: 'Food', type: 'pantry' }, `
Williams Sonoma|Williams Sonoma Marinara Sauce|12.95||4.6|402|E|
Rustichella d'Abruzzo|Rustichella d'Abruzzo Pappardelle, 1.1-lbs.|9.95||4.7|188||`,
  'Pasta sauces, artisan pasta and pizza essentials.'),
  sub('food', 'bread-mixes', { category: 'Food', type: 'pantry' }, `
Williams Sonoma|Williams Sonoma Pumpkin Bread & Muffin Mix|16.95||4.8|3540|E B +flavors-of-fall +dessert-mixes|
Williams Sonoma|Williams Sonoma Buttermilk Pancake & Waffle Mix|14.95||4.7|1102|E|`,
  'Breakfast and quick-bread mixes from our test kitchen.'),
  sub('food', 'dessert-mixes', { category: 'Food', type: 'pantry' }, `
Williams Sonoma|Williams Sonoma Brownie Mix|16.95||4.7|802|E|
Williams Sonoma|Williams Sonoma Halloween Sprinkles, Set of 4|19.95||4.6|212|E +all-halloween|`,
  'Cake, cookie and brownie mixes plus decorating sprinkles.'),
  sub('food', 'food-sets', { category: 'Food', type: 'pantry' }, `
Williams Sonoma|Williams Sonoma Peppermint Bark Gift Crate|89.95||4.7|240|E +christmas-food +top-10-food-gifts|
Williams Sonoma|Williams Sonoma Breakfast Gift Crate|79.95||4.6|132|E +top-10-food-gifts|`,
  'Gift crates and baskets, ready to send.'),
  // ---------------------------------------------------------------- Tabletop & Bar
  sub('tabletop-glassware-bar', 'tabletop-place-settings', { category: 'Tabletop', type: 'Dinnerware' }, `
Williams Sonoma|Williams Sonoma Brasserie All-White Porcelain 16-Piece Dinnerware Set|199.95|279.95|4.7|902|E B L|
Apilco|Apilco Tradition Porcelain 16-Piece Dinnerware Set|299.95||4.8|402||White
Le Creuset|Le Creuset Stoneware 16-Piece Dinnerware Set|299.95||4.6|188||Flame,Sage,Oyster,White`,
  'Complete place settings for four, ready for every day and every occasion.'),
  sub('tabletop-glassware-bar', 'tabletop-plates', { category: 'Tabletop', type: 'Dinner Plates' }, `
Apilco|Apilco Tradition Porcelain Dinner Plates, Set of 4|89.95||4.8|512||White
Williams Sonoma|Williams Sonoma Pantry Dinner Plates, Set of 4|59.95||4.7|1520|E B|
MacKenzie-Childs|MacKenzie-Childs Courtly Check Dinner Plate|58.00||4.8|302||
Williams Sonoma|Williams Sonoma 'Twas the Night Before Christmas Dinner Plates, Set of 4|79.95||4.9|2410|E +christmas-entertaining|
Williams Sonoma|Williams Sonoma Day of the Dead Dinner Plates, Set of 4|59.95||4.7|212|E N +day-of-the-dead|
Williams Sonoma|Williams Sonoma Plymouth Turkey Dinner Plates, Set of 4|79.95||4.8|402|E +thanksgiving-tabletop-new|`,
  'Dinner plates in porcelain and stoneware, from classic white to seasonal favorites.'),
  sub('tabletop-glassware-bar', 'salad-appetizer-plates', { category: 'Tabletop', type: 'Plates' }, `
Williams Sonoma|Williams Sonoma Brasserie Salad Plates, Set of 4|44.95||4.7|402|E|
Williams Sonoma|Williams Sonoma Pumpkin Patch Salad Plates, Set of 4|49.95||4.6|188|E N +thanksgiving-tabletop-new|`,
  'Salad, dessert and appetizer plates.'),
  sub('tabletop-glassware-bar', 'tabletop-bowls', { category: 'Tabletop', type: 'Bowls' }, `
Williams Sonoma|Williams Sonoma Pantry Pasta Bowls, Set of 4|59.95||4.7|802|E|
Le Creuset|Le Creuset Stoneware Cereal Bowls, Set of 4|79.95||4.6|302||Flame,Marseille,Sage`,
  'Pasta, cereal and soup bowls.'),
  sub('tabletop-glassware-bar', 'serving-trays-platters-baskets', { category: 'Tabletop', type: 'Platters' }, `
Williams Sonoma|Williams Sonoma Plymouth Turkey Platter|99.95||4.9|1120|E +thanksgiving-tabletop-new|
Williams Sonoma|Williams Sonoma Pantry Oval Platter|39.95||4.7|402|E|`,
  'Platters and trays for serving a crowd.'),
  sub('tabletop-glassware-bar', 'salad-serving-bowls', { category: 'Tabletop', type: 'Bowls' }, `
Williams Sonoma|Williams Sonoma Olivewood Salad Bowl, Large|119.95||4.8|302|E|`,
  'Serving bowls for salads, pasta and sides.'),
  sub('tabletop-glassware-bar', 'cheese-boards-accessories', { category: 'Tabletop', type: 'Cheese Boards' }, `
Williams Sonoma|Williams Sonoma Marble & Acacia Cheese Board|69.95||4.7|604|E|
Laguiole|Laguiole Jean Dubost Cheese Knives, Set of 3|49.95||4.6|212||Olivewood`,
  'Boards, knives and accessories for cheese and charcuterie.'),
  sub('tabletop-glassware-bar', 'dessert-cake-stands', { category: 'Tabletop', type: 'Cake Stands' }, `
Williams Sonoma|Williams Sonoma Footed Glass Cake Stand with Dome|79.95||4.7|402|E|`,
  'Cake stands and tiered servers.'),
  sub('tabletop-glassware-bar', 'drink-dispensers-pitchers', { category: 'Tabletop', type: 'Pitchers' }, `
Williams Sonoma|Williams Sonoma Glass Beverage Dispenser, 2-Gal.|79.95||4.5|302|E|`,
  'Dispensers, pitchers and ice buckets for entertaining.'),
  sub('tabletop-glassware-bar', 'bar-glassware-casual', { category: 'Tabletop', type: 'Glassware' }, `
Williams Sonoma|Williams Sonoma Dorset Highball Glasses, Set of 4|49.95||4.7|402|E|
Schott Zwiesel|Schott Zwiesel Tritan® Pure Tumblers, Set of 6|69.95||4.7|212||`,
  'Everyday tumblers, highballs and water glasses.'),
  sub('tabletop-glassware-bar', 'bar-wine-glasses', { category: 'Tabletop', type: 'Glassware' }, `
Riedel|Riedel Veritas Cabernet/Merlot Wine Glasses, Set of 2|69.95||4.8|402||
Schott Zwiesel|Schott Zwiesel Tritan® Pure Bordeaux Wine Glasses, Set of 6|119.95||4.8|512||
Zalto|Zalto Denk'Art Universal Wine Glass|69.00||4.9|188||`,
  'Stemware shaped for reds, whites and sparkling wine.'),
  sub('tabletop-glassware-bar', 'bar-glasses', { category: 'Tabletop', type: 'Glassware' }, `
Williams Sonoma|Williams Sonoma Dorset Double Old-Fashioned Glasses, Set of 4|49.95||4.8|604|E|
Riedel|Riedel Bar Rocks Glasses, Set of 2|39.95||4.6|120||`,
  'Rocks, coupe and cocktail glasses.'),
  sub('tabletop-glassware-bar', 'tabletop-coffee-mugs-teacups', { category: 'Tabletop', type: 'Mugs' }, `
Williams Sonoma|Williams Sonoma Brasserie Mugs, Set of 4|44.95||4.7|802|E|
Le Creuset|Le Creuset Stoneware Mug, 14-oz.|24.95||4.7|1102||Flame,Cerise,Marseille,Sage,Oyster
Williams Sonoma|Williams Sonoma Nightmare Before Christmas Mug|19.95||4.8|302|E +nightmare-before-christmas +halloween-tabletop|
Williams Sonoma|Williams Sonoma Peanuts™ Great Pumpkin Mug|19.95||4.8|402|E +peanuts +halloween-tabletop|`,
  'Mugs and teacups for coffee, tea and cocoa.'),
  sub('tabletop-glassware-bar', 'tabletop-bar-tool', { category: 'Tools', type: 'Bar Tools' }, `
Williams Sonoma|Williams Sonoma Cobbler Cocktail Shaker|29.95||4.6|402|E|
Williams Sonoma|Williams Sonoma Stainless-Steel Bar Tool Set, 5-Piece|79.95||4.6|188|E|`,
  'Shakers, jiggers, strainers and bar spoons.'),
  sub('tabletop-glassware-bar', 'entertaining-coasters-trivets', { category: 'Tabletop', type: 'Coasters' }, `
Williams Sonoma|Williams Sonoma Marble Coasters, Set of 4|29.95||4.7|302|E|White Marble`,
  'Coasters, trivets and cocktail napkins.'),
  sub('tabletop-glassware-bar', 'bar-wine-tool', { category: 'Tools', type: 'Corkscrews' }, `
Le Creuset|Le Creuset Lever Corkscrew LM-350|149.95||4.7|402||Black,Silver`,
  'Corkscrews, aerators, stoppers and preservation tools.'),
  sub('tabletop-glassware-bar', 'bar-glassware-decanters', { category: 'Tabletop', type: 'Pitchers' }, `
Riedel|Riedel Ultra Decanter|89.95||4.7|212||`,
  'Decanters and carafes for wine and spirits.'),
  sub('tabletop-glassware-bar', 'table-linens-tablecloths', { category: 'Linens', type: 'linens' }, `
Williams Sonoma|Williams Sonoma Washed Linen Tablecloth|70" x 90"=99.95;70" x 108"=119.95;70" x 126"=139.95||4.6|402|E +thanksgiving-tabletop-new|White,Flax,Sage,Navy
Williams Sonoma|Williams Sonoma Tartan Tablecloth|70" x 108"=129.95||4.7|212|E +christmas-entertaining|Red`,
  'Tablecloths in linen and cotton, sized for every table.'),
  sub('tabletop-glassware-bar', 'table-linens-napkins', { category: 'Tabletop', type: 'napkins' }, `
Williams Sonoma|Williams Sonoma Hemstitch Linen Napkins, Set of 4|49.95||4.7|802|E B|White,Flax,Sage,Navy,Rust`,
  'Linen and cotton napkins for everyday and holiday tables.'),
  sub('tabletop-glassware-bar', 'table-linens-place-mats', { category: 'Linens', type: 'linens' }, `
Williams Sonoma|Williams Sonoma Rattan Chargers, Set of 4|79.95||4.6|302|E|Natural`,
  'Placemats and chargers to frame each setting.'),
  sub('tabletop-glassware-bar', 'table-linens-runners', { category: 'Linens', type: 'linens' }, `
Williams Sonoma|Williams Sonoma Washed Linen Table Runner, 108"|59.95||4.6|212|E|White,Flax,Sage`,
  'Table runners in linen and seasonal prints.'),
  sub('tabletop-glassware-bar', 'tabletop-flatware-place-settings', { category: 'Tabletop', type: 'flatware' }, `
Fortessa|Fortessa Arezzo Brushed Flatware, 20-Piece Set|179.95||4.7|302||
Sabre|Sabre Bistrot Flatware, 5-Piece Place Setting|89.00||4.8|402||Ivory,Black,Navy,Pistachio
Williams Sonoma|Williams Sonoma Bistro Flatware, 20-Piece Set|99.95|149.95|4.6|604|E L|`,
  'Flatware sets and place settings.'),
  sub('tabletop-glassware-bar', 'tabletop-flatware-serving', { category: 'Tabletop', type: 'flatware' }, `
Williams Sonoma|Williams Sonoma Olivewood Salad Servers|29.95||4.7|402|E|`,
  'Serving spoons, forks and servers.'),
  // ---------------------------------------------------------------- Home Essentials
  sub('home-essentials', 'aprons', { category: 'Linens', type: 'linens' }, `
Williams Sonoma|Williams Sonoma Classic Solid Adult Apron|29.95||4.7|1102|E|Navy,Black,Red,Sage,White`,
  'Aprons in durable cotton twill, monogrammable.'),
  sub('home-essentials', 'kitchen-towels', { category: 'Linens', type: 'linens' }, `
Williams Sonoma|Williams Sonoma Classic Striped Towels, Set of 4|29.95||4.7|2602|E B|Navy,Red,Sage,Black
Williams Sonoma|Williams Sonoma Waffle Weave Towels, Set of 2|24.95||4.6|804|E|White,Flax,Sage`,
  'Absorbent kitchen towels for drying, wiping and serving.'),
  sub('home-essentials', 'pot-holders-oven-mitts', { category: 'Linens', type: 'heat protection' }, `
Williams Sonoma|Williams Sonoma Classic Oven Mitt|19.95||4.6|802|E|Navy,Black,Red,White`,
  'Quilted mitts and pot holders.'),
  sub('home-essentials', 'hand-dish-soap', { category: 'Home', type: 'Hand Soap' }, `
Williams Sonoma|Williams Sonoma Essential Oils Hand Soap, Lemon|16.95||4.8|3102|E B|
Williams Sonoma|Williams Sonoma Essential Oils Dish Soap, Lemon|14.95||4.7|1102|E|`,
  'Hand soaps and dish soaps made with essential oils.'),
  sub('home-essentials', 'pantry-storage', { category: 'Home', type: 'food storage' }, `
OXO|OXO Good Grips POP Container 10-Piece Set|169.95||4.7|1602||`,
  'Airtight canisters and pantry organizers.'),
  sub('home-essentials', 'food-storage', { category: 'Home', type: 'food storage' }, `
Williams Sonoma|Williams Sonoma Glass Food Storage Containers, 10-Piece Set|59.95||4.5|402|E|`,
  'Containers for leftovers, meal prep and lunches.'),
  sub('home-essentials', 'canisters', { category: 'Home', type: 'food storage' }, `
Williams Sonoma|Williams Sonoma Glass Canisters with Wood Lids, Set of 3|69.95||4.6|302|E|`,
  'Canisters and jars for flour, sugar, coffee and more.'),
  sub('home-essentials', 'candles-home-fragrance', { category: 'Home', type: 'Candles' }, `
Williams Sonoma|Williams Sonoma Fireside Candle|39.95||4.6|402|E|
Williams Sonoma|Williams Sonoma Spiced Pumpkin Candle|39.95||4.7|302|E N|`,
  'Candles and room sprays in seasonal scents.'),
  sub('home-essentials', 'pillows-throws', { category: 'Home', type: 'textile' }, `
Williams Sonoma Home|Cashmere Throw|395.00||4.8|188|E|Ivory,Oatmeal,Charcoal`,
  'Soft throws and decorative pillows.'),
  // ---------------------------------------------------------------- Outdoor
  sub('outdoor', 'outdoor-grill-tools-accessories', { category: 'Tools', type: 'Grill Tools' }, `
Williams Sonoma|Williams Sonoma Stainless-Steel BBQ Tool Set, 3-Piece|79.95||4.6|402|E|
Weber|Weber Rapidfire Chimney Starter|29.99||4.8|1102||`,
  'Tongs, spatulas, brushes and starters for the grill.'),
  sub('outdoor', 'outdoor-grills-griddles', { category: 'Outdoor', type: 'Grill' }, `
Big Green Egg|Big Green Egg Large|1179.00||4.9|802|F|
Traeger|Traeger Ironwood XL Pellet Grill|1799.95||4.7|402|F|`,
  'Kamado, pellet and gas grills.'),
  sub('outdoor', 'outdoor-cookware', { category: 'Cookware', type: 'Grill Pans' }, `
Williams Sonoma|Williams Sonoma Nonstick Outdoor Grill Basket|39.95||4.5|302|E|`,
  'Grill baskets, planks and pans made for the grill.'),
  sub('outdoor', 'outdoor-coolers', { category: 'Outdoor', type: 'Cooler' }, `
YETI|YETI Tundra 45 Hard Cooler|325.00||4.8|1802|F|Navy,White,Tan,Charcoal`,
  'Hard and soft coolers for picnics and tailgates.'),
  sub('outdoor', 'outdoor-water-bottles', { category: 'Outdoor', type: 'Tumbler' }, `
Stanley|Stanley Quencher H2.0 FlowState™ Tumbler, 40-oz.|45.00||4.7|3102||Cream,Charcoal,Rose Quartz,Fog
YETI|YETI Rambler 20-oz. Tumbler with MagSlider™ Lid|35.00||4.8|2210||Navy,White,Black,Seafoam`,
  'Insulated tumblers and bottles.'),
  sub('outdoor', 'wreaths-garlands', { category: 'Home', type: 'Wreath' }, `
Williams Sonoma|Williams Sonoma Fresh Magnolia Wreath, 24"|149.95||4.7|402|E|
Williams Sonoma|Williams Sonoma Harvest Bittersweet Wreath, 22"|129.95||4.6|188|E N|`,
  'Fresh and faux wreaths and garlands for the season.'),
  // ---------------------------------------------------------------- Furniture (Williams Sonoma Home)
  sub('home-furniture', 'dining-chairs-casual', { category: 'Furniture', type: 'chair' }, `
Williams Sonoma Home|Ortho Dining Chair|695.00||4.6|88|E|Natural Oak,Black
Williams Sonoma Home|Belmont Leather Dining Chair|995.00||4.7|64|E|Saddle,Black`,
  'Upholstered, wood and leather dining chairs.'),
  sub('home-furniture', 'dining-bars-counter-stools', { category: 'Furniture', type: 'stool' }, `
Williams Sonoma Home|Lyon Counter Stool|595.00||4.6|72|E|Black,Natural`,
  'Bar and counter stools.'),
  sub('home-furniture', 'dining-kitchen-tables', { category: 'Furniture', type: 'table' }, `
Williams Sonoma Home|Belmont Rectangular Dining Table, 84"|3495.00||4.7|41|E|Natural Oak,Ebonized Oak`,
  'Dining and kitchen tables.'),
  sub('home-furniture', 'bar-carts-cabinets', { category: 'Furniture', type: 'table' }, `
Williams Sonoma Home|Galvin Bar Cart|1095.00||4.6|58|E|Brass,Black`,
  'Bar carts and cabinets for entertaining.'),
  sub('home-furniture', 'kitchen-island-cart', { category: 'Furniture', type: 'table' }, `
John Boos|John Boos Maple Top Kitchen Cart|895.00||4.7|102||`,
  'Islands and carts that add prep space.'),
]

const slugify = value => value.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[®™]/g, '').replace(/['’]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const hash = s => { let n = 2166136261; for (const c of String(s)) n = Math.imul(n ^ c.codePointAt(0), 16777619); return n >>> 0 }
const round95 = n => Math.max(0.95, Math.round(n) - 0.05)
const subByKey = new Map()
for (const [path, s] of subcategories) {
  const key = path.split('/').filter(Boolean).at(-1)
  subByKey.set(key, subByKey.has(key) && subByKey.get(key).path !== path ? null : s)
}
const subPath = key => {
  const s = subByKey.get(key)
  if (!s) throw new Error(`williams-sonoma shelf: unknown or ambiguous subcategory "${key}"`)
  return s.path
}

const usedItems = new Set()
const itemNumber = seed => { let n = 1000000 + hash(seed) % 9000000; while (usedItems.has(n)) n++; usedItems.add(n); return String(n) }

export const shelf = []
for (const block of blocks) {
  for (const line of block.rows.trim().split('\n')) {
    const [brand, title, priceSpec, wasText, rating, reviews, flagText = '', colorText = ''] = line.split('|').map(s => s.trim())
    const flags = flagText.split(/\s+/).filter(Boolean)
    const sizePairs = priceSpec.includes('=') ? priceSpec.split(';').map(pair => { const i = pair.lastIndexOf('='); return [pair.slice(0, i), Number(pair.slice(i + 1))] }) : [[null, Number(priceSpec)]]
    const was = wasText ? Number(wasText) : null
    const ratio = was ? was / sizePairs[0][1] : null
    const id = slugify(title.replace(/,\s*(?:\d[^,]*|Set of \d+|Serves [\d-]+)$/i, ''))
    const item = itemNumber(id)
    const sizes = sizePairs.map(([label, price], i) => ({ label, price, was: ratio ? (i === 0 ? was : round95(price * ratio)) : null, sku: i === 0 ? item : itemNumber(`${id}:${label}`) }))
    const colors = colorText ? colorText.split(',').map(s => s.trim()).filter(Boolean) : []
    const primary = subPath(block.key)
    shelf.push(Object.freeze({
      id, item, brand, title, dept: block.dept, type: subcategories.get(primary).label, art: block.art, about: block.about,
      path: `/products/${id}/`, primary,
      subs: Object.freeze([primary, ...flags.filter(f => f.startsWith('+')).map(f => subPath(f.slice(1)))]),
      price: sizes[0].price, was: sizes[0].was, sizes: Object.freeze(sizes), colors: Object.freeze(colors),
      rating: Number(rating), reviews: Number(reviews),
      isNew: flags.includes('N'), exclusive: flags.includes('E'), bestSeller: flags.includes('B'), freeShipping: flags.includes('F'),
      limitedDeal: flags.includes('L'), clearance: flags.includes('C'),
      order: shelf.length,
    }))
  }
}
const seen = new Set()
for (const p of shelf) { if (seen.has(p.id)) throw new Error(`williams-sonoma shelf: duplicate product id ${p.id}`); seen.add(p.id) }
export const shelfById = new Map(shelf.map(p => [p.id, p]))
export const shelfBySku = new Map(shelf.flatMap(p => p.sizes.map(s => [s.sku, p])))
