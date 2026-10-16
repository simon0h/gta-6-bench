// More of the Williams Sonoma assortment, in the same block format as shelf.js:
//   Brand | Title | prices | was | rating | reviews | flags | colors
// These rows fill the menu categories (furniture, outdoor, home, specialty tools and
// appliances, seasonal shops) so every department link opens a full product grid.
// Like the rest of the shelf they are everyday goods only and never touch GTA 6 listings.
// Mixed blocks (seasonal shops, accessories) hold different kinds of things, so the
// illustration family follows the product title first and the block second.
const shape = (category, type, s) => ({ category, type, shape: s })
const TITLE_ART = [
  [/cooler\b|picnic basket/i, shape('Outdoor', 'Cooler', 'bag')],
  [/umbrella base/i, shape('Outdoor', 'Umbrella', 'stand')],
  [/umbrella/i, shape('Outdoor', 'Umbrella', 'lamp')],
  [/fire pit|fire table/i, shape('Outdoor', 'Fire Pit', 'bowl')],
  [/topiary|tree\b|fig\b|stems\b|bouquet|amaryllis|centerpiece|hurricane|menorah/i, shape('Home', 'Plants', 'vase')],
  [/backgammon|chess|mahjong|cribbage/i, shape('Home', 'Games', 'toy')],
  [/\bgrill\b(?! (?:tool|brush|basket|wok|prep|plancha))|griddle$|culinary griddle/i, shape('Outdoor', 'Grill', 'appliance')],
  [/ottoman|banquette/i, shape('Furniture', 'chair', 'chair')],
  [/sofa cover/i, shape('Home', 'textile', 'textile')],
  [/wine rack|wine cabinet|bar cabinet|bookcase|media console|sideboard|buffet,|nightstand|dresser|tall chest/i, shape('Furniture', 'cabinet', 'shelf')],
  [/letter tray|pantry baskets/i, shape('Home', 'Baskets', 'basket')],
  [/desk blotter/i, shape('Home', 'textile', 'textile')],
  [/bookends/i, shape('Home', 'Books', 'book')],
  [/soap & lotion|bath accessories/i, shape('Home', 'Hand Soap', 'beauty')],
  [/steam iron|handheld steamer/i, shape('Home', 'Irons', 'appliance')],
  [/kettle|french press|coffee scale|digital scale/i, shape('Electrics', 'Kettles', 'appliance')],
  [/mixing bowls/i, shape('Tools', 'Mixing Bowls', 'bowl')],
  [/\bmugs?\b/i, { category: 'Tabletop', type: 'Mugs' }],
  [/(?:pint|wine|highball|old fashioned) glasses|\btumblers?\b/i, { category: 'Tabletop', type: 'Glassware' }],
  [/cutting (?:& carving )?board|serving board/i, { category: 'Tools', type: 'Cutting Boards' }],
  [/\bapron\b|towels?\b|napkins\b|placemats|table runner|tablecloth|blanket|\bthrow\b|pillow|cushion|\brobe\b|oven mitt|pot holders|fabric by the yard|fabric swatch/i, { category: 'Linens', type: 'linens' }],
  [/skillet|\bwok\b|griddle|fry pan|frying pan|stir fry pan|plancha|grill basket|poacher pan/i, { category: 'Cookware', type: 'Fry Pans' }],
  [/cutters?\b|\bstamps\b|spatula|\bturner\b|\bscoop\b|\btongs\b|pizza peel|pizza wheel|\bbrush\b|\blame\b|separator|pitter|stripper|avocado tool|egg topper|corkscrew|shaker|tool set|servers\b|serving spoons|skimmer|utensils\b|utensil set/i, { category: 'Tools', type: 'Utensils' }],
  [/candles?\b|menorah|hurricane/i, { category: 'Home', type: 'Candles' }],
  [/hand soap|lotion|cleaner$/i, { category: 'Home', type: 'Hand Soap' }],
  [/\bplates\b/i, { category: 'Tabletop', type: 'Dinner Plates' }],
  [/platter|chip & dip|cake stand/i, { category: 'Tabletop', type: 'Platters' }],
  [/canisters?\b|\bjars?\b|storage tubs|containers?\b|salt cellar|herb keeper|cheese dome/i, { category: 'Home', type: 'food storage' }],
  [/\bvases?\b|planter|pitcher vase/i, shape('Home', 'Vases', 'vase')],
  [/sprinkles|cookies|marshmallows|gelt|latke mix|pancake mix|\bpopcorn(?:,|$)|decorating kit/i, { category: 'Food', type: 'pantry' }],
]
const titleArt = title => TITLE_ART.find(([re]) => re.test(title))?.[1]
const sub = (dept, key, art, rows, about) => ({ dept, key, art, rows, about, artFor: titleArt })

export const moreBlocks = [
  // ---------------------------------------------------------------- Cookware
  sub('cookware', 'cookware-accessories', { category: 'Cookware', type: 'Lids' }, `
All-Clad|All-Clad Stainless-Steel Universal Lid|8"=39.95;10"=49.95;12"=59.95||4.6|612|F +stainless-steel-cookware|
Le Creuset|Le Creuset Silicone Pot Holders, Set of 2|29.95||4.7|488||Flame,Marseille,Sage,Oyster
Williams Sonoma|Williams Sonoma Stainless-Steel Steamer Insert|39.95||4.6|302|E|
Williams Sonoma|Williams Sonoma Pan Protectors, Set of 3|19.95||4.5|706|E|
Staub|Staub Cast Iron Trivet|49.95||4.7|141||Graphite Grey,Cherry
Williams Sonoma|Williams Sonoma Copper & Stainless Polish|14.95||4.6|1210|E +cookware-copper|`,
  'Lids, inserts, trivets and care essentials that keep your cookware working hard.'),
  sub('cookware', 'cookware-carbon-steel', { category: 'Cookware', type: 'Fry Pans' }, `
Made In|Made In Blue Carbon Steel Frying Pan|10"=79.00;12"=99.00||4.6|512||
Matfer Bourgeat|Matfer Bourgeat Black Steel Fry Pan|9 1/2"=54.95;11"=64.95||4.7|388||`,
  'Lighter than cast iron and just as good at searing; seasons to a slick, natural nonstick.'),
  sub('cookware', 'hybrid-cookware', { category: 'Cookware', type: 'Fry Pans' }, `
HexClad|HexClad Hybrid Fry Pan|8"=99.99;10"=129.99;12"=149.99||4.5|2204|F|
HexClad|HexClad Hybrid 12-Piece Cookware Set|699.99|999.99|4.6|1180|F +cookware-sets|
Hestan|Hestan TITUM® Nonstick Skillet|10"=129.95;12 1/2"=169.95||4.6|244|F +nonstick-cookware|`,
  'Stainless-steel strength with nonstick ease, from the brands that pioneered hybrid cookware.'),
  sub('cookware', 'cookware-seasoned-cast-iron', { category: 'Cookware', type: 'Skillets' }, `
Field Company|Field Company No. 8 Cast Iron Skillet|175.00||4.8|402||
Lodge|Lodge Cast Iron Double Dutch Oven, 5-Qt.|59.95||4.7|1820|+dutch-ovens-braisers|
Smithey|Smithey No. 10 Cast Iron Chef Skillet|200.00||4.8|188||`,
  'Pre-seasoned cast iron that only gets better with every meal.'),

  // ---------------------------------------------------------------- Cooks' Tools
  sub('cooks-tools', 'splatter-screens', { category: 'Tools', type: 'Splatter Screens' }, `
Frieling|Frieling Splatter Screen, 13"|29.95||4.5|402||
Williams Sonoma|Williams Sonoma Silicone Splatter Guard|24.95||4.4|218|E|
OXO|OXO Good Grips Splatter Screen with Folding Handle|19.99||4.5|812||`,
  'Keep the stovetop clean while you fry, sear and sauté.'),
  sub('cooks-tools', 'egg-tools', { category: 'Tools', type: 'Egg Tools' }, `
Williams Sonoma|Williams Sonoma Nonstick Egg Rings, Set of 4|19.95||4.4|512|E|
OXO|OXO Good Grips Egg Separator|9.99||4.5|1102||
Williams Sonoma|Williams Sonoma Stainless-Steel Egg Poacher Pan|69.95||4.6|388|E +omelette-egg-pans|
Rösle|Rösle Egg Topper|19.95||4.7|244||
Dash|Dash Rapid Egg Cooker|24.99||4.6|3102||Black,Red,White`,
  'Breakfast tools for perfectly poached, boiled and fried eggs.'),
  sub('cooks-tools', 'tools-produce', { category: 'Tools', type: 'Produce Tools' }, `
Williams Sonoma|Williams Sonoma Herb Keeper|24.95||4.5|602|E|
OXO|OXO Good Grips Cherry & Olive Pitter|14.99||4.6|1405||
Chef'n|Chef'n Corn Stripper|12.95||4.3|388||
Williams Sonoma|Williams Sonoma Avocado Tool|12.95||4.4|212|E|
Microplane|Microplane Herb Stripper|14.95||4.6|402||`,
  'Pitters, strippers, spinners and keepers for fresh fruit and vegetables.'),
  sub('cooks-tools', 'ice-cream-tools-pops', { category: 'Tools', type: 'Ice Cream Scoops' }, `
Zeroll|Zeroll Original Ice Cream Scoop|24.95||4.8|2210||
Williams Sonoma|Williams Sonoma Ice Pop Molds, Set of 10|29.95||4.5|318|E|
Williams Sonoma|Williams Sonoma Ice Cream Storage Tubs, Set of 2|24.95||4.6|612|E|
Midnight Scoop|Midnight Scoop Ice Cream Scoop|39.95||4.7|188|N|Gold,Silver`,
  'Scoops, molds and storage for homemade ice cream and frozen treats.'),
  sub('cooks-tools', 'coffee-accessories', { category: 'Tools', type: 'Coffee Accessories' }, `
Fellow|Fellow Stagg EKG Pro Electric Kettle|195.00||4.8|1802|F +electrics-teakettles +electrics-fellow|Matte Black,Matte White
Hario|Hario V60 Ceramic Coffee Dripper|29.95||4.7|902||White,Black
Bodum|Bodum Chambord French Press, 8-Cup|44.95||4.6|3401||Chrome,Copper
Fellow|Fellow Atmos Vacuum Coffee Canister|36.00||4.6|512|N|Matte Black,Matte White
Williams Sonoma|Williams Sonoma Tea Infuser|14.95||4.5|302|E|`,
  'Pour-over, press and storage tools for better coffee and tea at home.'),
  sub('cooks-tools', 'oil-dispeners', { category: 'Tools', type: 'Oil Dispensers' }, `
Le Creuset|Le Creuset Stoneware Oil Cruet|39.95||4.6|212||Flame,Marseille,White
OXO|OXO Good Grips Precision Pour Glass Dispenser|17.99||4.5|1102||`,
  'Cruets and pourers for oils and vinegars.'),
  sub('cooks-tools', 'can-openers', { category: 'Tools', type: 'Can Openers' }, `
Zyliss|Zyliss Lock N' Lift Can Opener|17.95||4.4|2602||`,
  'Openers that work every time.'),
  sub('cooks-tools', 'kitchen-scales', { category: 'Tools', type: 'Kitchen Scales' }, `
Escali|Escali Primo Digital Scale|29.95||4.6|1802||Black,White,Red
Acaia|Acaia Pearl Coffee Scale|170.00||4.7|302|F|Black,White`,
  'Digital scales for baking by weight and dialing in coffee.'),
  sub('cooks-tools', 'mortars-pestles', { category: 'Tools', type: 'Mortars' }, `
Williams Sonoma|Williams Sonoma Volcanic Stone Molcajete|49.95||4.5|188||`,
  'Grind spices, pastes and pesto by hand.'),
  sub('cooks-tools', 'peelers', { category: 'Tools', type: 'Peelers' }, `
OXO|OXO Good Grips Swivel Peeler|10.99||4.6|5102||
Zyliss|Zyliss Easy Pull Food Chopper|29.95||4.5|1402||`,
  'Peelers and choppers for fast, even prep.'),
  sub('cooks-tools', 'pasta-tools', { category: 'Tools', type: 'Pasta Tools' }, `
Williams Sonoma|Williams Sonoma Ravioli Stamps, Set of 2|24.95||4.5|212|E|
Williams Sonoma|Williams Sonoma Beechwood Pasta Drying Rack|39.95||4.6|402|E|
Marcato|Marcato Atlas Pasta Cutter Attachment|64.95||4.7|188||Silver`,
  'Machines, cutters and racks for fresh pasta at home.'),

  // ---------------------------------------------------------------- Cutlery
  sub('cutlery', 'knives-global', { category: 'Cutlery', type: 'Chef Knives' }, `
Global|Global Classic Chef's Knife|8"=139.95;10"=169.95|189.95|4.7|802|F +cutlery-chef-knives +offers-global-promo +premier-cutlery|
Global|Global Classic 3-Piece Knife Set|249.95|349.95|4.8|402|F +knife-sets +offers-global-promo|
Global|Global Classic Santoku Knife, 7"|139.95|179.95|4.7|388|F +cutlery-santoku-knives +offers-global-promo|
Global|Global Classic Paring Knife, 3 1/2"|74.95||4.6|212|F +paring-knives|
Global|Global Classic Bread Knife, 8 3/4"|134.95|164.95|4.6|141|F +bread-knives +offers-global-promo|
Global|Global Ceramic Water Sharpener|79.95||4.5|302|F +knife-sharpeners-honing|`,
  'One-piece stainless-steel Japanese knives with the famous dimpled handle.'),
  sub('cutlery', 'utility-knives', { category: 'Cutlery', type: 'Utility Knives' }, `
Wüsthof|Wüsthof Classic Serrated Utility Knife, 5"|99.95||4.7|388|F|
Zwilling|Zwilling Pro Utility Knife, 5 1/2"|99.95|134.00|4.6|141|F +zwilling-henckels-knives|`,
  'The in-between knife: slicing sandwiches, trimming vegetables, cutting cheese.'),
  sub('cutlery', 'specialty-knives', { category: 'Cutlery', type: 'Specialty Knives' }, `
Wüsthof|Wüsthof Classic Cleaver, 6"|179.95||4.7|244|F|
Miyabi|Miyabi Kaizen II Nakiri Knife, 6 1/2"|179.95|224.95|4.8|141|F N +miyabi-brand|
Wüsthof|Wüsthof Classic Fillet Knife, 7"|149.95||4.7|188|F|`,
  'Nakiri, cleavers, fillet and boning knives for specific jobs.'),

  // ---------------------------------------------------------------- Electrics
  sub('electrics', 'electrics-jura', { category: 'Electrics', type: 'Espresso Machines' }, `
JURA|JURA J8 Twin Automatic Coffee Machine, Diamond Black|2799.95||4.6|512|F +espresso-makers|Piano Black,Chrome
JURA|JURA ENA 8 Fully Automatic Coffee Machine|1499.95||4.5|402|F +espresso-makers|Full Metropolitan Black,Sunset Copper
JURA|JURA S8 Fully Automatic Espresso Machine|2499.95||4.6|212|F +espresso-makers|Moonlight Silver
JURA|JURA Z10 Fully Automatic Hot & Cold Brew Espresso Machine|4199.95||4.7|188|F +espresso-makers|Aluminum
JURA|JURA Cool Control Milk Cooler, 1-Liter|399.95||4.6|141|F +coffee-milk-frothers|`,
  'Swiss-made fully automatic machines that grind, tamp and brew at the touch of a button.'),
  sub('electrics', 'grills-panini-presses', { category: 'Electrics', type: 'Electric Grills' }, `
Breville|Breville the Smart Grill™|299.95||4.6|602|F +electrics-breville|Brushed Stainless Steel
Cuisinart|Cuisinart Griddler® Elite|199.95|249.95|4.5|1802|F +electrics-cuisinart|
All-Clad|All-Clad Electric Indoor Grill with Auto Sensing|229.95||4.4|402|F|
Zojirushi|Zojirushi Indoor Electric Grill|119.95||4.5|512||`,
  'Indoor grills, griddles and panini presses for year-round grilling.'),
  sub('electrics', 'electrics-ice-makers', { category: 'Electrics', type: 'Ice Makers' }, `
GE Profile|GE Profile Opal™ 2.0 Nugget Ice Maker with Side Tank|579.00||4.5|2802|F|Stainless Steel,Black Stainless
GE Profile|GE Profile Opal™ 2.0 Ultra Nugget Ice Maker|629.00||4.6|402|F|Stainless Steel
Frigidaire|Frigidaire Countertop Clear Ice Maker|229.95||4.3|388|F|Stainless Steel`,
  'Countertop ice makers for chewable nugget ice and crystal-clear cubes.'),
  sub('electrics', 'popcorn-makers', { category: 'Electrics', type: 'Popcorn Makers' }, `
Nostalgia|Nostalgia Vintage Popcorn Cart|149.95||4.4|602||Red
Williams Sonoma|Williams Sonoma Stovetop Popcorn Popper|59.95||4.6|402|E|
Dash|Dash Hot Air Popcorn Maker|29.99||4.4|2204||Red,Aqua,White
Nordic Ware|Nordic Ware Microwave Popcorn Popper|19.95||4.5|1202||`,
  'Popcorn poppers and treat makers for movie night.'),
  sub('electrics', 'sparkling-water-machines', { category: 'Electrics', type: 'Sparkling Water Makers' }, `
SodaStream|SodaStream Art Sparkling Water Maker|159.99||4.6|1802|F|Black,White,Mist Blue
SodaStream|SodaStream E-TERRA Sparkling Water Maker|129.99||4.5|904|F|Black,White
Aarke|Aarke Carbonator 3 Sparkling Water Maker|249.95||4.6|402|F|Steel,Matte Black,Brass
SodaStream|SodaStream Fizzi One Touch|149.99|169.99|4.4|612|F|Black`,
  'Sparkling water and soda makers that cut down on bottles.'),
  sub('electrics', 'all-large-appliances', { category: 'Electrics', type: 'Ranges' }, `
La Cornue|La Cornue CornuFé 110 Dual Fuel Range|14205.00||4.8|41||Matte Black,Stainless Steel,Royal Blue
SMEG|SMEG 50's Style Retro Refrigerator|2199.95||4.5|212||Cream,Black,Red,Pastel Blue
SMEG|SMEG 36" Portofino Dual Fuel Range|6999.00||4.6|58||Red,Black,Cream
Wolf|Wolf 30" Built-In Single Convection Oven|5995.00||4.8|41||`,
  'Statement ranges, ovens and refrigerators from the world’s great appliance makers.'),
  sub('electrics', 'electrics-microwaves', { category: 'Electrics', type: 'Microwaves' }, `
SMEG|SMEG Microwave Oven|399.95||4.4|188|F +electrics-smeg|Cream,Black`,
  'Countertop microwaves, including combination air-fry and convection models.'),
  sub('electrics', 'electrics-pasta-machines', { category: 'Electrics', type: 'Pasta Machines' }, `
Philips|Philips 7000 Series Pasta Maker|299.95||4.4|612|F|
KitchenAid|KitchenAid Pasta Roller & Cutter Set|249.99||4.7|1802|F +mixers-attachments +electrics-kitchenaid|`,
  'Electric pasta makers and stand mixer attachments for fresh pasta.'),
  sub('electrics', 'coffee-grinders', { category: 'Electrics', type: 'Coffee Grinders' }, `
Baratza|Baratza Encore ESP Coffee Grinder|199.95||4.6|1202|F|Black,White
Baratza|Baratza Virtuoso+ Coffee Grinder|249.95||4.6|802|F|Black`,
  'Burr grinders for every brew method.'),
  sub('electrics', 'electrics-juicers', { category: 'Electrics', type: 'Juicers' }, `
Hurom|Hurom H400 Easy Clean Slow Juicer|449.95|499.95|4.6|602|F|White,Rose Gold
Nama|Nama J2 Cold Press Juicer|549.00||4.7|802|F|White,Black`,
  'Cold-press and centrifugal juicers.'),

  // ---------------------------------------------------------------- Bakeware
  sub('bakeware', 'bakeware-ceramic-nonstick', { category: 'Bakeware', type: 'Sheet Pans' }, `
GreenPan™|GreenPan™ Premiere Ceramic Nonstick Half Sheet Pan|39.95||4.5|402|F N|
GreenPan™|GreenPan™ Premiere Ceramic Nonstick 9" Round Cake Pans, Set of 2|44.95||4.4|188|F +cake-pans|
GreenPan™|GreenPan™ Premiere Ceramic Nonstick Loaf Pan|29.95||4.4|212|F +bread-pans-loaf-pans|
Caraway|Caraway Ceramic Nonstick Bakeware Set, 11-Piece|395.00||4.6|602|F N +bakeware-sets|Cream,Sage,Navy
Williams Sonoma|Williams Sonoma Ceramic Nonstick Muffin Pan, 12-Well|39.95||4.5|141|E +cupcake-muffin-pans|`,
  'PFAS-free ceramic nonstick bakeware for easy release and cleanup.'),
  sub('bakeware', 'bakeware-sets', { category: 'Bakeware', type: 'Bakeware Sets' }, `
Nordic Ware|Nordic Ware Naturals® 3-Piece Baker's Delight Set|39.95||4.7|1802||`,
  'The pans every baker needs, in one set.'),
  sub('bakeware', 'baking-mats-boards', { category: 'Bakeware', type: 'Baking Mats' }, `
Williams Sonoma|Williams Sonoma Marble Pastry Board|79.95||4.7|212|E|White Marble
Williams Sonoma|Williams Sonoma Silicone Pastry Mat|24.95||4.5|402|E|`,
  'Mats and boards for rolling dough and baking cookies.'),
  sub('bakeware', 'bakeware-rolling-pins', { category: 'Tools', type: 'Rolling Pins' }, `
Williams Sonoma|Williams Sonoma Marble Rolling Pin with Stand|49.95||4.6|212|E|White Marble`,
  'French, tapered and handled rolling pins.'),
  sub('bakeware', 'bakeware-bread-tools', { category: 'Tools', type: 'Bread Tools' }, `
Williams Sonoma|Williams Sonoma Bread Proofing Basket, Round|29.95||4.6|402|E +bakeware-bread-shop|
Williams Sonoma|Williams Sonoma Bread Lame|19.95||4.5|212|E +bakeware-bread-shop|
Brød & Taylor|Brød & Taylor Folding Proofer & Slow Cooker|199.95||4.7|602|F +bakeware-bread-shop|`,
  'Proofing baskets, lames and proofers for bakery-style loaves.'),
  sub('bakeware', 'bakeware-all-clad', { category: 'Bakeware', type: 'Sheet Pans' }, `
All-Clad|All-Clad Pro-Release Nonstick Muffin Pan, 12-Well|49.95||4.5|141|F +cupcake-muffin-pans|
All-Clad|All-Clad Stainless-Steel Lasagna Pan|149.95|199.95|4.7|212|F +casseroles|`,
  'All-Clad bakeware: heavy-gauge steel with reliable release.'),
  sub('bakeware', 'halloween', { category: 'Bakeware', type: 'Cake Pans' }, `
Nordic Ware|Nordic Ware Spooky Cakelet Pan|44.95||4.7|302|+all-halloween|Gold
Williams Sonoma|Williams Sonoma Goldtouch® Pro Nonstick Pumpkin Muffin Pan|49.95||4.6|212|E +all-halloween +cupcake-muffin-pans|
Williams Sonoma|Williams Sonoma Jack-o'-Lantern Cookie Stamps, Set of 3|24.95||4.5|141|E +all-halloween +cookie-cutters-pancake-molds|`,
  'Cakelet pans, molds and stamps for spooky baking.'),

  // ---------------------------------------------------------------- Food
  sub('food', 'food-condiments', { category: 'Food', type: 'pantry' }, `
Williams Sonoma|Williams Sonoma Dijon Mustard, Set of 2|24.95||4.6|212|E|
Williams Sonoma|Williams Sonoma Truffle Ketchup|16.95||4.5|402|E|
Mike's Hot Honey|Mike's Hot Honey, 12-oz.|12.95||4.8|1202||
Williams Sonoma|Williams Sonoma Fig & Olive Spread|14.95||4.6|302|E +appetizers-cheese|
Williams Sonoma|Williams Sonoma Cranberry Chutney|14.95||4.7|388|E +all-thanksgiving-food|`,
  'Mustards, spreads, chutneys and sauces to finish any dish.'),
  sub('food', 'seafood-food', { category: 'Food', type: 'pantry' }, `
Williams Sonoma|Williams Sonoma Maine Lobster Tails, Set of 4|179.95||4.7|402|E|
Williams Sonoma|Williams Sonoma Jumbo Lump Crab Cakes, Set of 8|99.95||4.6|612|E +appetizers-hors-doeuvres|
Williams Sonoma|Williams Sonoma Wild Alaskan King Salmon Fillets, Set of 4|129.95||4.6|212|E|
Williams Sonoma|Williams Sonoma New England Clam Chowder, Set of 2|44.95||4.6|302|E +food-side-dishes|`,
  'Lobster, crab and wild salmon shipped frozen to your door.'),
  sub('food', 'appetizers-cheese', { category: 'Food', type: 'pantry' }, `
Murray's|Murray's Cheese Greatest Hits Cheese Collection|119.95||4.7|402||
Williams Sonoma|Williams Sonoma Charcuterie Board Collection|89.95||4.6|302|E +food-sets|
Williams Sonoma|Williams Sonoma Truffle Brie, 2-lb.|69.95||4.7|188|E|
Olli|Olli Salumeria Salami Sampler|39.95||4.5|212||`,
  'Cheese collections, salumi and everything for the board.'),
  sub('food', 'food-all-desserts', { category: 'Food', type: 'pantry' }, `
Williams Sonoma|Williams Sonoma Chocolate Lava Cakes, Set of 6|59.95||4.7|802|E N|
Williams Sonoma|Williams Sonoma Apple Crostata|59.95||4.6|302|E +flavors-of-fall|
Williams Sonoma|Williams Sonoma New York Cheesecake|69.95||4.7|402|E|
Williams Sonoma|Williams Sonoma Pecan Pie|49.95||4.6|612|E +all-thanksgiving-food|`,
  'Cakes, pies and tarts ready to thaw and serve.'),
  sub('food', 'food-subscription', { category: 'Food', type: 'pantry' }, `
Williams Sonoma|Williams Sonoma Cheese of the Month Club, 3 Months|189.95||4.6|141|E|
Williams Sonoma|Williams Sonoma Bakery of the Month Club, 3 Months|169.95||4.7|212|E|
Williams Sonoma|Williams Sonoma Steak of the Month Club, 3 Months|299.95||4.6|88|E|
Williams Sonoma|Williams Sonoma Coffee of the Month Club, 6 Months|179.95||4.5|102|E|`,
  'Monthly deliveries of cheese, baked goods, steaks and coffee.'),
  sub('food', 'meat', { category: 'Food', type: 'pantry' }, `
Snake River Farms|Snake River Farms American Wagyu Ribeye Steaks, Set of 2|139.95||4.8|402||
Williams Sonoma|Williams Sonoma Spiral-Cut Honey Ham|149.95||4.7|612|E +christmas-food|
Williams Sonoma|Williams Sonoma Filet Mignon Steaks, Set of 4|149.95||4.7|802|E|`,
  'Steaks, roasts and holiday hams.'),
  sub('food', 'food-snacks-popcorn', { category: 'Food', type: 'pantry' }, `
Williams Sonoma|Williams Sonoma Truffle Popcorn, Set of 3|29.95||4.6|302|E N|
Williams Sonoma|Williams Sonoma Caramel Corn Tin|29.95||4.5|402|E|`,
  'Popcorn, pretzels and savory snacks.'),
  sub('food', 'fruits-nuts', { category: 'Food', type: 'pantry' }, `
Williams Sonoma|Williams Sonoma Rosemary Spiced Nuts|24.95||4.7|402|E|
Williams Sonoma|Williams Sonoma Comice Pears Gift Box|49.95||4.6|1802||`,
  'Spiced nuts, dried fruit and fresh fruit gifts.'),

  // ---------------------------------------------------------------- Tabletop & Bar
  sub('tabletop-glassware-bar', 'beer-wine-storage', { category: 'Tabletop', type: 'Wine Racks' }, `
Williams Sonoma|Williams Sonoma Wine Rack, 12-Bottle|149.95||4.5|212|E|Black,Natural
Williams Sonoma Home|Williams Sonoma Home Wine Cabinet|2495.00||4.6|41|E|Ebonized Oak,Natural Oak
Williams Sonoma|Williams Sonoma Brass Wine Rack, 6-Bottle|99.95||4.4|141|E|Brass
Coravin|Coravin Timeless Three+ Wine Preservation System|249.95||4.6|604|F +bar-wine-tool|Black,Silver`,
  'Racks, cabinets and preservation systems for your collection.'),
  sub('tabletop-glassware-bar', 'open-stock-flatware', { category: 'Tabletop', type: 'flatware' }, `
Williams Sonoma|Williams Sonoma Brasserie Flatware Dinner Fork|12.95||4.6|212|E|
Williams Sonoma|Williams Sonoma Brasserie Flatware Dinner Knife|14.95||4.6|188|E|
Williams Sonoma|Williams Sonoma Brasserie Flatware Soup Spoon|12.95||4.5|141|E|
Mepra|Mepra Due Ghiaccio Dinner Fork|19.95||4.6|88||Gold,Black,Silver`,
  'Add to your set piece by piece.'),
  sub('tabletop-glassware-bar', 'buffet-essentials', { category: 'Tabletop', type: 'Platters' }, `
Williams Sonoma|Williams Sonoma Stainless-Steel Chafing Dish|199.95||4.6|302|E|
Williams Sonoma|Williams Sonoma Warming Tray|149.95||4.4|212|E|
Williams Sonoma|Williams Sonoma Pillivuyt Porcelain Tiered Server|89.95||4.7|141|E +dessert-cake-stands|
Williams Sonoma|Williams Sonoma Gravy Boat with Saucer|49.95||4.7|402|E +all-thanksgiving|`,
  'Chafing dishes, warmers and servers for a crowd.'),
  sub('tabletop-glassware-bar', 'entertaining-napkin-rings', { category: 'Tabletop', type: 'Napkin Rings' }, `
Williams Sonoma|Williams Sonoma Brass Napkin Rings, Set of 4|39.95||4.6|212|E N|Brass
Williams Sonoma|Williams Sonoma Beaded Napkin Rings, Set of 4|39.95||4.5|141|E N|Gold,Silver
Williams Sonoma|Williams Sonoma Pumpkin Napkin Rings, Set of 4|39.95||4.7|302|E +thanksgiving-tabletop-new|Gold`,
  'The finishing touch for every place setting.'),
  sub('tabletop-glassware-bar', 'entertaining-accessories-decor', { category: 'Home', type: 'Candles' }, `
Williams Sonoma|Williams Sonoma Brass Taper Candle Holders, Set of 3|69.95||4.6|212|E|Brass
Williams Sonoma|Williams Sonoma Unscented Taper Candles, Set of 12|29.95||4.7|604|E|Ivory,Green,Burgundy
Williams Sonoma|Williams Sonoma Faux Pumpkin Centerpiece|59.95||4.5|141|E +thanksgiving-tabletop-new|
Williams Sonoma|Williams Sonoma Glass Hurricane|49.95||4.6|302|E|`,
  'Candles, holders and centerpieces for the table.'),
  sub('tabletop-glassware-bar', 'bar-glassware-decanters', { category: 'Tabletop', type: 'Decanters' }, `
Riedel|Riedel Swan Decanter|395.00||4.7|141|F|
Schott Zwiesel|Schott Zwiesel Pure Decanter|79.95||4.6|212||`,
  'Decanters and carafes for wine and spirits.'),
  sub('tabletop-glassware-bar', 'tabletop-flatware-serving', { category: 'Tabletop', type: 'flatware' }, `
Williams Sonoma|Williams Sonoma Brasserie Serving Set, 5-Piece|79.95||4.7|212|E|
Williams Sonoma|Williams Sonoma Hammered Serving Spoons, Set of 2|39.95||4.6|141|E|Gold,Silver`,
  'Serving spoons, forks and salad servers.'),
  sub('tabletop-glassware-bar', 'salad-serving-bowls', { category: 'Tabletop', type: 'Bowls' }, `
Williams Sonoma|Williams Sonoma Olivewood Salad Bowl|129.95||4.7|302|E|
Le Creuset|Le Creuset Stoneware Serving Bowl|59.95||4.6|141||Flame,Marseille,White`,
  'Bowls for salads, sides and condiments.'),
  sub('tabletop-glassware-bar', 'drink-dispensers-pitchers', { category: 'Tabletop', type: 'Pitchers' }, `
Williams Sonoma|Williams Sonoma Glass Drink Dispenser|79.95||4.5|212|E|
Williams Sonoma|Williams Sonoma Hammered Copper Ice Bucket|99.95||4.6|141|E|Copper`,
  'Pitchers, dispensers and ice buckets.'),
  sub('tabletop-glassware-bar', 'entertaining-coasters-trivets', { category: 'Tabletop', type: 'Coasters' }, `
Williams Sonoma|Williams Sonoma Cocktail Napkins, Set of 20|9.95||4.5|212|E|`,
  'Coasters, trivets and cocktail napkins.'),
  sub('tabletop-glassware-bar', 'table-linens-napkins', { category: 'Linens', type: 'napkins' }, `
Williams Sonoma|Williams Sonoma Classic Linen Napkins, Set of 4|49.95||4.7|602|E|White,Flax,Sage,Navy
Williams Sonoma|Williams Sonoma Harvest Plaid Napkins, Set of 4|39.95||4.6|212|E +thanksgiving-tabletop-new|Rust`,
  'Linen and cotton napkins in seasonal and classic colors.'),
  sub('tabletop-glassware-bar', 'table-linens-place-mats', { category: 'Linens', type: 'linens' }, `
Williams Sonoma|Williams Sonoma Woven Rattan Charger, Set of 4|79.95||4.6|212|E|Natural
Williams Sonoma|Williams Sonoma Classic Linen Placemats, Set of 4|49.95||4.6|302|E|White,Flax,Sage`,
  'Placemats and chargers for everyday and special occasions.'),
  sub('tabletop-glassware-bar', 'table-linens-runners', { category: 'Linens', type: 'linens' }, `
Williams Sonoma|Williams Sonoma Classic Linen Table Runner|108"=49.95;144"=59.95||4.6|212|E|White,Flax,Sage
Williams Sonoma|Williams Sonoma Harvest Jacquard Table Runner|59.95||4.5|141|E +thanksgiving-tabletop-new|`,
  'Runners that set the tone for the table.'),
  sub('tabletop-glassware-bar', 'tabletop-bar-tool', { category: 'Tools', type: 'Bar Tools' }, `
Williams Sonoma|Williams Sonoma Signature Cocktail Shaker|49.95||4.6|402|E|Silver,Gold
Williams Sonoma|Williams Sonoma Bar Tool Set, 5-Piece|79.95||4.5|212|E|Silver,Gold`,
  'Shakers, jiggers, strainers and bar spoons.'),
  sub('tabletop-glassware-bar', 'bar-wine-tool', { category: 'Tools', type: 'Corkscrews' }, `
Laguiole|Laguiole en Aubrac Sommelier Corkscrew|149.95||4.8|141||Olivewood,Ebony
Rabbit|Rabbit Electric Wine Opener|49.95||4.4|802||Black`,
  'Corkscrews, openers and stoppers.'),

  // ---------------------------------------------------------------- Home Essentials
  sub('home-essentials', 'vacuums', { category: 'Home', type: 'Vacuums' }, `
Dyson|Dyson V15 Detect Cordless Vacuum|749.99||4.6|1802|F|Nickel
Dyson|Dyson Gen5detect Cordless Vacuum|949.99||4.6|402|F|Purple
Shark|Shark Stratos Cordless Vacuum|429.99|479.99|4.5|612|F|
iRobot|iRobot Roomba Combo j9+ Robot Vacuum & Mop|1399.99|1499.99|4.4|402|F|
Dyson|Dyson V8 Cordless Vacuum|469.99||4.5|2402|F|`,
  'Cordless and robot vacuums for floors, rugs and upholstery.'),
  sub('home-essentials', 'irons-steamers', { category: 'Home', type: 'Irons' }, `
Rowenta|Rowenta Pro Master Steam Iron|129.95||4.5|1202||
Laurastar|Laurastar Lift Plus Steam Iron|599.00||4.6|212|F|Pure White,Ultimate Red
Steamery|Steamery Cirrus No. 2 Handheld Steamer|149.00||4.5|402||Black,Pink,White`,
  'Irons and steamers for crisp linens and clothes.'),
  sub('home-essentials', 'home-all-bath', { category: 'Home', type: 'Towels' }, `
Williams Sonoma|Williams Sonoma Signature Turkish Bath Towels, Set of 3|89.95||4.7|402|E|White,Fog,Sage
Williams Sonoma|Williams Sonoma Waffle Weave Bath Robe|89.95||4.6|212|E|White,Sea Salt
Williams Sonoma|Williams Sonoma Essential Hand Soap & Lotion Set|39.95||4.6|302|E +hand-dish-soap|
Williams Sonoma|Williams Sonoma Marble Bath Accessories Set, 4-Piece|129.95||4.5|141|E|White Marble`,
  'Towels, robes and bath accessories.'),
  sub('home-essentials', 'games', { category: 'Home', type: 'Games' }, `
Williams Sonoma|Williams Sonoma Classic Backgammon Set|149.95||4.6|141|E|
Williams Sonoma|Williams Sonoma Wood Chess & Checkers Set|99.95||4.5|212|E|
Williams Sonoma|Williams Sonoma Lucite Mahjong Set|295.00||4.7|88|E|
Williams Sonoma|Williams Sonoma Cribbage Board|49.95||4.6|102|E|`,
  'Heirloom games for family nights.'),
  sub('home-essentials', 'aprons', { category: 'Linens', type: 'linens' }, `
Williams Sonoma|Williams Sonoma Classic Solid Apron|29.95||4.6|1202|E|Navy,Black,White,Sage
Hedley & Bennett|Hedley & Bennett Essential Apron|65.00||4.7|402||Black,Navy
Williams Sonoma|Williams Sonoma Kids' Apron|24.95||4.6|302|E|Red,Navy`,
  'Aprons for cooks of every age.'),
  sub('home-essentials', 'pot-holders-oven-mitts', { category: 'Linens', type: 'heat protection' }, `
Williams Sonoma|Williams Sonoma Silicone Grip Pot Holders, Set of 2|24.95||4.6|402|E|Black,Red`,
  'Oven mitts and pot holders.'),
  sub('home-essentials', 'canisters', { category: 'Home', type: 'food storage' }, `
Le Creuset|Le Creuset Stoneware Canister, 2-Qt.|49.95||4.6|212||Flame,Marseille,Sage,White`,
  'Canisters and jars for flour, sugar, coffee and more.'),
  sub('home-essentials', 'food-storage', { category: 'Home', type: 'food storage' }, `
Glasslock|Glasslock Oven-Safe Glass Containers, 18-Piece Set|59.95||4.5|802||
Stasher|Stasher Reusable Silicone Bags, Set of 4|59.99||4.4|1202||Clear`,
  'Containers and bags that keep food fresh.'),
  sub('home-essentials', 'pantry-storage', { category: 'Home', type: 'food storage' }, `
Williams Sonoma|Williams Sonoma Lazy Susan Turntable|39.95||4.6|302|E|
Williams Sonoma|Williams Sonoma Woven Pantry Baskets, Set of 2|59.95||4.5|212|E|Natural`,
  'Bins, turntables and baskets for an organized pantry.'),
  sub('home-essentials', 'pillows-throws', { category: 'Home', type: 'textile' }, `
Williams Sonoma Home|Williams Sonoma Home Cashmere Throw|395.00||4.8|141|E|Oatmeal,Fog,Charcoal
Williams Sonoma Home|Williams Sonoma Home Linen Pillow Cover|79.95||4.6|212|E|Flax,White,Sage
Williams Sonoma Home|Williams Sonoma Home Plaid Wool Throw|195.00||4.7|102|E|Rust,Navy`,
  'Throws and pillow covers in cashmere, wool and linen.'),
  sub('home-essentials', 'candles-home-fragrance', { category: 'Home', type: 'Candles' }, `
Williams Sonoma|Williams Sonoma Spiced Chestnut Candle|39.95||4.7|402|E +flavors-of-fall|
Williams Sonoma|Williams Sonoma Fresh Pine Candle|39.95||4.7|612|E +christmas-entertaining|`,
  'Candles and diffusers in our signature seasonal scents.'),
  sub('home-essentials', 'kitchen-towels', { category: 'Linens', type: 'linens' }, `
Williams Sonoma|Williams Sonoma Waffle Weave Dish Towels, Set of 4|29.95||4.6|1402|E|White,Sage,Navy
Williams Sonoma|Williams Sonoma Harvest Pumpkin Dish Towels, Set of 2|24.95||4.7|212|E +all-thanksgiving|`,
  'Absorbent kitchen towels in classic and seasonal patterns.'),
  sub('home-essentials', 'hand-dish-soap', { category: 'Home', type: 'Hand Soap' }, `
Williams Sonoma|Williams Sonoma Fresh Pine Hand Soap|16.95||4.7|402|E +christmas-entertaining|`,
  'Hand and dish soaps in our signature scents.'),

  // ---------------------------------------------------------------- Outdoor
  sub('outdoor', 'built-in-grills', { category: 'Outdoor', type: 'Grill' }, `
Lynx|Lynx Professional 36" Built-In Gas Grill|7999.00||4.8|41||
Hestan|Hestan 36" Built-In Gas Grill|8499.00||4.7|58||
Blaze|Blaze Premium LTE 32" Built-In Gas Grill|2299.00||4.6|141||
Kalamazoo|Kalamazoo Hybrid Fire Built-In Grill|19995.00||4.9|12||`,
  'Built-in grills for the outdoor kitchen of your dreams.'),
  sub('outdoor', 'outdoor-grill-prep-trays', { category: 'Tools', type: 'Grill Tools' }, `
Williams Sonoma|Williams Sonoma Grill Prep Trays, Set of 2|39.95||4.6|302|E|
Williams Sonoma|Williams Sonoma Marinade Container|24.95||4.5|212|E|
OXO|OXO Good Grips Grilling Prep & Carry System|39.99||4.6|602||`,
  'Trays and containers for prepping and carrying to the grill.'),
  sub('outdoor', 'outdoor-tabletop-all', { category: 'Tabletop', type: 'Dinnerware' }, `
Williams Sonoma|Williams Sonoma Outdoor Melamine Dinner Plates, Set of 4|49.95||4.6|402|E|White,Blue
Williams Sonoma|Williams Sonoma Outdoor Acrylic Wine Glasses, Set of 4|49.95||4.5|302|E|
Williams Sonoma|Williams Sonoma Outdoor Melamine Serving Platter|39.95||4.6|212|E|
Williams Sonoma|Williams Sonoma Outdoor Acrylic Tumblers, Set of 4|39.95||4.5|141|E|`,
  'Shatterproof dinnerware and drinkware for the patio.'),
  sub('outdoor', 'picnic-and-camping', { category: 'Outdoor', type: 'Picnic Basket' }, `
Williams Sonoma|Williams Sonoma Picnic Basket for Four|149.95||4.6|141|E|
YETI|YETI Hopper Flip 12 Soft Cooler|249.99||4.7|402|F +outdoor-coolers|Navy,Charcoal
Williams Sonoma|Williams Sonoma Outdoor Picnic Blanket|79.95||4.5|212|E|Navy,Rust
Snow Peak|Snow Peak Titanium Single Wall Mug|39.95||4.7|141||`,
  'Baskets, blankets and coolers for meals outdoors.'),
  sub('outdoor', 'outdoor-coolers', { category: 'Outdoor', type: 'Cooler' }, `
YETI|YETI Roadie 24 Hard Cooler|250.00||4.7|802|F|Navy,White,Charcoal
YETI|YETI Hopper M30 Soft Cooler|325.00|375.00|4.6|302|F|Navy,Charcoal`,
  'Hard and soft coolers for picnics and tailgates.'),
  sub('outdoor', 'outdoor-grills-griddles', { category: 'Outdoor', type: 'Grill' }, `
Blackstone|Blackstone 36" Culinary Griddle|499.95|599.95|4.5|1202|F|
Big Green Egg|Big Green Egg Large Ceramic Grill|1199.95||4.8|802|F|`,
  'Gas, pellet and charcoal grills and outdoor griddles.'),
  sub('outdoor', 'fresh-dried-flowers', { category: 'Home', type: 'Flowers' }, `
Williams Sonoma|Williams Sonoma Fresh Dahlia Bouquet|89.95||4.5|141|E|
Williams Sonoma|Williams Sonoma Dried Fall Harvest Bouquet|79.95||4.6|212|E +flavors-of-fall|
Williams Sonoma|Williams Sonoma Faux Magnolia Stems, Set of 3|59.95||4.6|302|E|
Williams Sonoma|Williams Sonoma Potted Amaryllis|49.95||4.7|402|E +christmas-entertaining|`,
  'Fresh, dried and faux florals and centerpieces.'),
  sub('outdoor', 'plants-trees', { category: 'Home', type: 'Plants' }, `
Williams Sonoma|Williams Sonoma Live Rosemary Topiary|59.95||4.5|212|E|
Williams Sonoma|Williams Sonoma Faux Olive Tree, 6'|395.00||4.6|141|E N|
Williams Sonoma|Williams Sonoma Live Meyer Lemon Tree|129.95||4.4|302|E|
Williams Sonoma|Williams Sonoma Faux Fiddle Leaf Fig, 5'|295.00||4.5|102|E|`,
  'Live herbs and citrus, plus faux trees that stay green.'),
  sub('outdoor', 'planter-pots', { category: 'Home', type: 'Planters' }, `
Williams Sonoma|Williams Sonoma Terracotta Planter|Small=39.95;Medium=59.95;Large=89.95||4.6|212|E|
Williams Sonoma|Williams Sonoma Glazed Ceramic Planter|79.95||4.5|141|E|White,Sage,Blue
Williams Sonoma|Williams Sonoma Herb Garden Planter Box|69.95||4.6|302|E|`,
  'Terracotta, ceramic and stone planters for herbs and greenery.'),
  sub('outdoor', 'vases-vessels', { category: 'Home', type: 'Vases' }, `
Williams Sonoma|Williams Sonoma Recycled Glass Vase|49.95||4.6|212|E|Clear,Green
Williams Sonoma|Williams Sonoma Ceramic Pitcher Vase|59.95||4.5|141|E|White
Williams Sonoma|Williams Sonoma Brass Bud Vases, Set of 3|49.95||4.6|102|E|Brass`,
  'Vases and vessels for fresh flowers and branches.'),
  sub('outdoor', 'raised-garden-beds-planters', { category: 'Home', type: 'Planters' }, `
Williams Sonoma|Williams Sonoma Elevated Cedar Garden Bed|299.95||4.6|212|E|
Williams Sonoma|Williams Sonoma Galvanized Raised Garden Bed|249.95||4.5|141|E|
Williams Sonoma|Williams Sonoma Self-Watering Raised Bed|179.95||4.4|302||`,
  'Raised beds and elevated planters for a kitchen garden.'),
  sub('outdoor', 'all-outdoor-dining', { category: 'Furniture', type: 'table' }, `
Williams Sonoma Home|Larnaca Outdoor Teak Rectangular Dining Table, 84"|3295.00||4.7|58|E|Natural
Williams Sonoma Home|Larnaca Outdoor Teak Dining Armchair|895.00||4.6|41|E|Natural
Williams Sonoma Home|Porto Outdoor Metal Round Dining Table, 48"|1595.00||4.5|36|E|Black
Williams Sonoma Home|Malibu Outdoor Woven Dining Chair|695.00||4.6|44|E|Natural,Black`,
  'Teak, metal and woven outdoor dining tables and chairs.'),
  sub('outdoor', 'all-outdoor-lounge-furniture', { category: 'Furniture', type: 'sofa' }, `
Williams Sonoma Home|Larnaca Outdoor Teak Sofa|4495.00||4.7|41|E|Natural
Williams Sonoma Home|Malibu Outdoor Woven Lounge Chair|1495.00||4.6|52|E N|Natural,Black
Williams Sonoma Home|Larnaca Outdoor Teak Coffee Table|1295.00||4.6|36|E|Natural
Williams Sonoma Home|Porto Outdoor Metal Chaise Lounge|1495.00||4.5|28|E|Black`,
  'Outdoor sofas, lounge chairs and chaises.'),
  sub('outdoor', 'home-outdoor-umbrellas', { category: 'Outdoor', type: 'Umbrella' }, `
Williams Sonoma Home|Market Umbrella, 9'|695.00||4.5|58|E|White,Navy,Flax
Williams Sonoma Home|Cantilever Umbrella, 11'|1595.00||4.6|36|E|White,Flax
Williams Sonoma Home|Umbrella Base, 75-lb.|295.00||4.4|41|E|Black`,
  'Market and cantilever umbrellas with weighted bases.'),
  sub('outdoor', 'all-od-cushions-covers', { category: 'Home', type: 'textile' }, `
Williams Sonoma Home|Outdoor Performance Lumbar Pillow|89.95||4.6|141|E|Navy,White,Rust
Williams Sonoma Home|Outdoor Dining Chair Cushion|99.95||4.5|102|E|Natural,Navy
Williams Sonoma Home|Outdoor Sofa Cover|249.00||4.4|58|E|Charcoal`,
  'Cushions, pillows and covers made for the outdoors.'),
  sub('outdoor', 'fire-pits-and-tables', { category: 'Outdoor', type: 'Fire Pit' }, `
Solo Stove|Solo Stove Bonfire 2.0 Fire Pit|299.99||4.7|2402|F N|Stainless Steel
Breeo|Breeo X Series 24 Smokeless Fire Pit|649.00||4.7|302|F|
Williams Sonoma Home|Concrete Gas Fire Table, Round|2495.00||4.5|36|E|Fog`,
  'Fire pits, fire tables and heaters for cool evenings.'),
  sub('outdoor', 'rugs-outdoor', { category: 'Home', type: 'textile' }, `
Williams Sonoma Home|Performance Woven Stripe Indoor/Outdoor Rug|5' x 8'=495.00;8' x 10'=895.00||4.5|58|E|Navy,Natural
Williams Sonoma Home|Performance Solid Indoor/Outdoor Rug|5' x 8'=395.00;8' x 10'=695.00||4.6|41|E|Fog,Natural`,
  'Durable rugs for patios and high-traffic rooms.'),

  // ---------------------------------------------------------------- Furniture (Williams Sonoma Home)
  sub('home-furniture', 'sofas-loveseats', { category: 'Furniture', type: 'sofa' }, `
Williams Sonoma Home|Marin Upholstered Sofa, 84"|3995.00||4.7|88|E|Performance Linen Oatmeal,Performance Linen Fog
Williams Sonoma Home|Larkspur Upholstered Sofa, 90"|4495.00||4.6|52|E N|Performance Velvet Navy,Performance Velvet Oatmeal
Williams Sonoma Home|Belmont Leather Sofa, 86"|5495.00||4.7|41|E|Saddle,Black
Williams Sonoma Home|Marin Upholstered Loveseat, 64"|3495.00||4.6|36|E|Performance Linen Oatmeal
Williams Sonoma Home|Ashby Slipcovered Sofa, 88"|3795.00||4.5|58|E|White,Flax`,
  'Upholstered and leather sofas, built to order in performance fabrics.'),
  sub('home-furniture', 'all-sectionals', { category: 'Furniture', type: 'sofa' }, `
Williams Sonoma Home|Marin 3-Piece L-Shaped Sectional|7995.00||4.7|41|E|Performance Linen Oatmeal
Williams Sonoma Home|Larkspur 2-Piece Chaise Sectional|6495.00||4.6|36|E|Performance Velvet Navy
Williams Sonoma Home|Belmont Leather 3-Piece Sectional|9995.00||4.7|28|E|Saddle`,
  'Sectionals configured to fit your room.'),
  sub('home-furniture', 'sleeper-sofas', { category: 'Furniture', type: 'sofa' }, `
Williams Sonoma Home|Marin Queen Sleeper Sofa|4995.00||4.5|36|E|Performance Linen Oatmeal
Williams Sonoma Home|Ashby Slipcovered Full Sleeper Sofa|4495.00||4.4|28|E|White
Williams Sonoma Home|Rhodes Upholstered Settee, 60"|2495.00||4.6|41|E|Performance Velvet Olive`,
  'Sleeper sofas and settees for guests and smaller spaces.'),
  sub('home-furniture', 'occasional-chairs', { category: 'Furniture', type: 'chair' }, `
Williams Sonoma Home|Jackson Leather Armchair|2495.00||4.7|58|E|Saddle,Black
Williams Sonoma Home|Belmont Swivel Chair|1995.00||4.6|41|E|Performance Linen Oatmeal
Williams Sonoma Home|Rhodes Wingback Chair|2295.00||4.6|36|E|Performance Velvet Navy
Williams Sonoma Home|Malibu Woven Accent Chair|1295.00||4.5|44|E N|Natural`,
  'Armchairs, swivel chairs and accent chairs.'),
  sub('home-furniture', 'ottomans-bench-stool', { category: 'Furniture', type: 'ottoman' }, `
Williams Sonoma Home|Belmont Leather Ottoman|1195.00||4.6|41|E|Saddle,Black
Williams Sonoma Home|Marin Upholstered Cocktail Ottoman|1495.00||4.5|28|E|Performance Linen Oatmeal
Williams Sonoma Home|Rhodes Upholstered Bench, 60"|1095.00||4.6|36|E|Performance Velvet Navy`,
  'Ottomans, benches and stools for extra seating.'),
  sub('home-furniture', 'coffee-tables', { category: 'Furniture', type: 'table' }, `
Williams Sonoma Home|Ortho Rectangular Coffee Table, 54"|1995.00||4.6|52|E|Natural Oak,Black
Williams Sonoma Home|Marble Round Coffee Table, 42"|2495.00||4.7|36|E|White Marble
Williams Sonoma Home|Larkspur Travertine Coffee Table|2995.00||4.6|28|E N|Natural
Williams Sonoma Home|Belmont Trunk Coffee Table|1795.00||4.5|41|E|Saddle`,
  'Wood, marble and stone coffee tables.'),
  sub('home-furniture', 'side-accent-tables', { category: 'Furniture', type: 'table' }, `
Williams Sonoma Home|Ortho Round Side Table|895.00||4.6|41|E|Natural Oak,Black
Williams Sonoma Home|Marble Drum Side Table|995.00||4.5|36|E|White Marble
Williams Sonoma Home|Brass C-Shaped Side Table|695.00||4.6|58|E|Brass`,
  'Side tables, end tables and accent tables.'),
  sub('home-furniture', 'sideboard-buffet-table', { category: 'Furniture', type: 'cabinet' }, `
Williams Sonoma Home|Ortho Sideboard, 72"|3495.00||4.7|41|E|Natural Oak,Black
Williams Sonoma Home|Belmont Buffet, 68"|2995.00||4.6|36|E|Ebonized Oak
Williams Sonoma Home|Larkspur Console Table, 60"|1795.00||4.5|52|E|Natural Oak`,
  'Sideboards, buffets and consoles for dining and entry.'),
  sub('home-furniture', 'dining-benches-banquettes', { category: 'Furniture', type: 'bench' }, `
Williams Sonoma Home|Belmont Dining Bench, 72"|1295.00||4.6|36|E|Natural Oak,Ebonized Oak
Williams Sonoma Home|Rhodes Upholstered Banquette, 72"|2995.00||4.5|28|E|Performance Linen Oatmeal
Williams Sonoma Home|Ortho Backless Dining Bench, 60"|995.00||4.6|41|E|Natural Oak`,
  'Dining benches and built-in style banquettes.'),
  sub('home-furniture', 'dining-chairs-casual', { category: 'Furniture', type: 'chair' }, `
Williams Sonoma Home|Malibu Woven Dining Chair|595.00||4.5|58|E|Natural,Black
Williams Sonoma Home|Rhodes Upholstered Dining Side Chair|795.00||4.6|41|E|Performance Linen Oatmeal`,
  'Upholstered, wood and leather dining chairs.'),
  sub('home-furniture', 'dining-bars-counter-stools', { category: 'Furniture', type: 'stool' }, `
Williams Sonoma Home|Belmont Leather Counter Stool|795.00||4.6|52|E|Saddle,Black
Williams Sonoma Home|Malibu Woven Bar Stool|695.00||4.5|41|E|Natural`,
  'Bar and counter stools.'),
  sub('home-furniture', 'dining-kitchen-tables', { category: 'Furniture', type: 'table' }, `
Williams Sonoma Home|Ortho Round Pedestal Dining Table, 54"|2995.00||4.6|41|E|Natural Oak,Black
Williams Sonoma Home|Marble Oval Dining Table, 84"|5995.00||4.7|28|E N|White Marble`,
  'Dining and kitchen tables.'),
  sub('home-furniture', 'bar-carts-cabinets', { category: 'Furniture', type: 'cabinet' }, `
Williams Sonoma Home|Belmont Bar Cabinet|2995.00||4.7|36|E|Ebonized Oak
Williams Sonoma Home|Brass & Glass Bar Cart|895.00||4.5|58|E|Brass`,
  'Bar carts and cabinets for entertaining.'),
  sub('home-furniture', 'kitchen-island-cart', { category: 'Furniture', type: 'table' }, `
Williams Sonoma Home|Ortho Kitchen Island, 60"|2495.00||4.6|36|E|Natural Oak,Black
John Boos|John Boos Walnut Butcher Block Island|1895.00||4.7|58||`,
  'Islands and carts that add prep space.'),
  sub('home-furniture', 'beds-headboards', { category: 'Furniture', type: 'bed' }, `
Williams Sonoma Home|Belmont Upholstered Bed|Queen=2995.00;King=3295.00||4.7|41|E|Performance Linen Oatmeal,Performance Velvet Navy
Williams Sonoma Home|Ortho Wood Platform Bed|Queen=2495.00;King=2795.00||4.6|36|E|Natural Oak,Black
Williams Sonoma Home|Larkspur Upholstered Headboard|Queen=1295.00;King=1495.00||4.5|52|E|Performance Linen Oatmeal`,
  'Upholstered and wood beds and headboards.'),
  sub('home-furniture', 'nightstands-dressers', { category: 'Furniture', type: 'cabinet' }, `
Williams Sonoma Home|Ortho Nightstand|1195.00||4.6|41|E|Natural Oak,Black
Williams Sonoma Home|Belmont 2-Drawer Nightstand|1295.00||4.6|36|E|Ebonized Oak
Williams Sonoma Home|Larkspur Open Nightstand|895.00||4.5|28|E|Natural Oak`,
  'Nightstands with drawers, shelves and storage.'),
  sub('home-furniture', 'dresser', { category: 'Furniture', type: 'cabinet' }, `
Williams Sonoma Home|Ortho 6-Drawer Dresser|3495.00||4.7|36|E|Natural Oak,Black
Williams Sonoma Home|Belmont 9-Drawer Dresser|3995.00||4.6|28|E|Ebonized Oak
Williams Sonoma Home|Larkspur Tall Chest|2995.00||4.5|22|E|Natural Oak`,
  'Dressers and chests in solid wood.'),
  sub('home-furniture', 'benches-bedroom', { category: 'Furniture', type: 'bench' }, `
Williams Sonoma Home|Belmont Upholstered Bed Bench|1095.00||4.6|36|E|Performance Linen Oatmeal
Williams Sonoma Home|Ortho Wood Bed Bench|895.00||4.5|28|E|Natural Oak`,
  'Benches for the end of the bed.'),
  sub('home-furniture', 'mattresses', { category: 'Furniture', type: 'mattress' }, `
Williams Sonoma Home|Williams Sonoma Home Luxe Hybrid Mattress|Queen=2495.00;King=2995.00||4.6|58|E|
Williams Sonoma Home|Williams Sonoma Home Organic Latex Mattress|Queen=2995.00;King=3495.00||4.7|36|E|`,
  'Hybrid and latex mattresses.'),
  sub('home-furniture', 'desks-bookcases-media', { category: 'Furniture', type: 'table' }, `
Williams Sonoma Home|Ortho Writing Desk, 54"|1995.00||4.6|41|E|Natural Oak,Black
Williams Sonoma Home|Belmont Bookcase|2495.00||4.6|36|E|Ebonized Oak
Williams Sonoma Home|Larkspur Media Console, 72"|2795.00||4.5|28|E|Natural Oak`,
  'Desks, bookcases and media consoles.'),
  sub('home-furniture', 'home-office-chairs', { category: 'Furniture', type: 'chair' }, `
Williams Sonoma Home|Jackson Leather Swivel Desk Chair|1295.00||4.6|52|E|Saddle,Black
Williams Sonoma Home|Belmont Upholstered Office Chair|995.00||4.5|36|E|Performance Linen Oatmeal`,
  'Desk chairs that look as good as they feel.'),
  sub('home-furniture', 'desk-accessories', { category: 'Home', type: 'Desk Accessories' }, `
Williams Sonoma Home|Leather Desk Blotter|149.95||4.6|58|E|Saddle,Black
Williams Sonoma Home|Leather Letter Tray|79.95||4.5|41|E|Saddle
Williams Sonoma Home|Marble Bookends, Set of 2|99.95||4.6|36|E|White Marble`,
  'Leather and marble desk accessories.'),
  sub('home-furniture', 'table-lamps', { category: 'Home', type: 'lamp' }, `
Williams Sonoma Home|Ceramic Table Lamp|395.00||4.6|58|E|White,Sage
Williams Sonoma Home|Brass Table Lamp|495.00||4.7|41|E|Brass
Williams Sonoma Home|Marble Base Table Lamp|595.00||4.5|36|E|White Marble`,
  'Table lamps in ceramic, brass and marble.'),
  sub('home-furniture', 'floor-lamps', { category: 'Home', type: 'lamp' }, `
Williams Sonoma Home|Brass Arc Floor Lamp|895.00||4.6|36|E N|Brass
Williams Sonoma Home|Wood Tripod Floor Lamp|695.00||4.5|28|E|Natural Oak
Williams Sonoma Home|Adjustable Reading Floor Lamp|595.00||4.6|41|E|Black,Brass`,
  'Floor lamps for reading corners and living rooms.'),
  sub('home-furniture', 'furniture-fabric-by-the-yard', { category: 'Home', type: 'textile' }, `
Williams Sonoma Home|Performance Linen Fabric by the Yard|89.00||4.6|28|E|Oatmeal,Fog,Flax
Williams Sonoma Home|Performance Velvet Fabric by the Yard|99.00||4.5|22|E|Navy,Oatmeal,Olive
Williams Sonoma Home|Performance Boucle Fabric by the Yard|109.00||4.6|18|E|Ivory,Bone`,
  'Our upholstery fabrics by the yard.'),
  sub('home-furniture', 'furniture-wood-swatches', { category: 'Home', type: 'textile' }, `
Williams Sonoma Home|Upholstery Fabric Swatch|0.95||4.7|212|E|Oatmeal,Fog,Navy,Olive
Williams Sonoma Home|Wood Finish Swatch|0.95||4.6|141|E|Natural Oak,Ebonized Oak,Black
Williams Sonoma Home|Stone Sample|0.95||4.5|58|E|White Marble,Natural`,
  'Free swatches and finish samples, so you can see and feel before you order.'),
  sub('home-furniture', 'wsh-contract-grade-furniture', { category: 'Furniture', type: 'chair' }, `
Williams Sonoma Home|Belmont Contract Grade Dining Chair|895.00||4.6|28|E|Saddle,Black
Williams Sonoma Home|Ortho Contract Grade Counter Stool|695.00||4.5|22|E|Natural Oak
Williams Sonoma Home|Larkspur Contract Grade Lounge Chair|1795.00||4.6|18|E|Performance Linen Oatmeal`,
  'Commercial-grade furniture for hospitality and office projects.'),

  // ---------------------------------------------------------------- Seasonal shops
  sub('christmas', 'christmas-tools', { category: 'Tools', type: 'Cookie Cutters' }, `
Williams Sonoma|Williams Sonoma Snowflake Cookie Stamps, Set of 3|24.95||4.6|402|E +christmas-bakeware|
Williams Sonoma|Williams Sonoma Gingerbread House Cutter Set|24.95||4.5|612|E +christmas-bakeware|
Williams Sonoma|Williams Sonoma Holiday Tree Spatula|14.95||4.6|212|E +turner-spatulas|
Williams Sonoma|Williams Sonoma Christmas Sprinkles, Set of 4|19.95||4.7|802|E +christmas-food|
Nordic Ware|Nordic Ware Gingerbread Village Cakelet Pan|44.95||4.7|302|+christmas-bakeware|Gold`,
  'Cutters, stamps and decorating tools for holiday baking.'),
  sub('holidays', 'hanukkah', { category: 'Tabletop', type: 'Platters' }, `
Williams Sonoma|Williams Sonoma Hanukkah Cookie Cutters, Set of 4|19.95||4.7|212|E|
Williams Sonoma|Williams Sonoma Hanukkah Platter|49.95||4.6|141|E|
Williams Sonoma|Williams Sonoma Brass Menorah|129.95||4.8|102|E|Brass
Williams Sonoma|Williams Sonoma Potato Latke Mix|14.95||4.5|302|E|
Williams Sonoma|Williams Sonoma Chocolate Gelt|16.95||4.6|212|E|
Williams Sonoma|Williams Sonoma Hanukkah Kitchen Towels, Set of 2|24.95||4.6|141|E|`,
  'Menorahs, serveware and treats for the Festival of Lights.'),
  sub('holidays', 'nfl-shop', { category: 'Tabletop', type: 'Platters' }, `
Williams Sonoma|NFL™ Cutting & Carving Board|79.95||4.7|402|E|
Williams Sonoma|NFL™ Pint Glasses, Set of 2|39.95||4.6|302|E|
Williams Sonoma|NFL™ Chip & Dip Platter|59.95||4.5|141|E|
Williams Sonoma|NFL™ Apron|34.95||4.6|212|E|
Williams Sonoma|NFL™ Grill Tool Set, 3-Piece|69.95||4.5|102|E|
Williams Sonoma|NFL™ Cast Iron Skillet, 12"|79.95||4.6|88|E|`,
  'Game-day boards, glasses and grill gear for all 32 teams.'),
  sub('holidays', 'day-of-the-dead', { category: 'Tabletop', type: 'Plates' }, `
Williams Sonoma|Williams Sonoma Day of the Dead Salad Plates, Set of 4|49.95||4.7|141|E N|
Williams Sonoma|Williams Sonoma Day of the Dead Cookie Cutters|19.95||4.6|88|E|
Williams Sonoma|Williams Sonoma Day of the Dead Platter|59.95||4.7|102|E N|`,
  'Colorful serveware to celebrate Día de los Muertos.'),
  sub('halloween', 'halloween-food', { category: 'Food', type: 'pantry' }, `
Williams Sonoma|Williams Sonoma Halloween Sugar Cookies, Set of 12|39.95||4.6|302|E +food-cookies-brownies|
Williams Sonoma|Williams Sonoma Jack-o'-Lantern Cookie Decorating Kit|29.95||4.5|212|E|
Williams Sonoma|Williams Sonoma Pumpkin Spice Popcorn|19.95||4.6|141|E +food-snacks-popcorn|
Williams Sonoma|Williams Sonoma Ghost Marshmallows|14.95||4.4|102|E|`,
  'Treats, cookies and kits for Halloween.'),
  sub('halloween', 'halloween-clearance', { category: 'Tabletop', type: 'Plates' }, `
Williams Sonoma|Williams Sonoma Haunted House Dinner Plates, Set of 4|29.95|59.95|4.6|212|E C +halloween-tabletop|
Williams Sonoma|Williams Sonoma Halloween Bat Cocktail Napkins, Set of 20|4.95|9.95|4.4|88|E C|
Williams Sonoma|Williams Sonoma Skull Cake Stand|39.95|79.95|4.5|58|E C +dessert-cake-stands|
Williams Sonoma|Williams Sonoma Halloween Dish Towels, Set of 2|12.95|24.95|4.5|102|E C +kitchen-towels|`,
  'Halloween favorites, now marked down.'),
  sub('halloween', 'nightmare-before-christmas', { category: 'Tabletop', type: 'Plates' }, `
Williams Sonoma|Williams Sonoma Nightmare Before Christmas Salad Plates, Set of 4|59.95||4.8|212|E +halloween-tabletop|
Williams Sonoma|Williams Sonoma Nightmare Before Christmas Cookie Cutters|24.95||4.7|141|E|
Williams Sonoma|Williams Sonoma Nightmare Before Christmas Dish Towels, Set of 2|24.95||4.6|88|E|`,
  'Jack Skellington and friends for the table and kitchen.'),
  sub('halloween', 'peanuts', { category: 'Tabletop', type: 'Plates' }, `
Williams Sonoma|Williams Sonoma Peanuts™ Great Pumpkin Salad Plates, Set of 4|49.95||4.8|302|E +halloween-tabletop|
Williams Sonoma|Williams Sonoma Peanuts™ Halloween Cookie Cutters|24.95||4.7|141|E|
Williams Sonoma|Williams Sonoma Peanuts™ Great Pumpkin Dish Towels, Set of 2|24.95||4.6|102|E|`,
  'It’s the Great Pumpkin, Charlie Brown, on plates, mugs and towels.'),
  sub('new', 'new-no-kid-hungry', { category: 'Tools', type: 'Spatulas' }, `
Williams Sonoma|Williams Sonoma No Kid Hungry® Spatula|14.95||4.7|402|E N +turner-spatulas|
Williams Sonoma|Williams Sonoma No Kid Hungry® Apron|34.95||4.6|212|E N +aprons|
Williams Sonoma|Williams Sonoma No Kid Hungry® Pancake Mix|14.95||4.6|302|E N +bread-mixes|
Williams Sonoma|Williams Sonoma No Kid Hungry® Dish Towels, Set of 2|24.95||4.7|141|E N +kitchen-towels|`,
  'Shop to help end childhood hunger: a portion of every purchase goes to No Kid Hungry.'),

  // ---------------------------------------------------------------- Outlet
  sub('sale-special-offer', 'open-box-deals', { category: 'Electrics', type: 'Espresso Machines' }, `
Breville|Open Box: Breville Barista Express® Espresso Machine|449.95|699.95|4.4|141|F C|Brushed Stainless Steel
Breville|Open Box: Breville the Smart Oven® Air Fryer Pro|279.95|399.95|4.5|102|F C|Brushed Stainless Steel
KitchenAid|Open Box: KitchenAid Artisan Tilt-Head Stand Mixer, 5-Qt.|339.95|499.99|4.6|212|F C|Empire Red,Onyx Black
Vitamix|Open Box: Vitamix A3500 Ascent Blender|449.95|649.95|4.5|88|F C|Brushed Stainless
Le Creuset|Open Box: Le Creuset Signature Enameled Cast Iron Round Dutch Oven, 5 1/2-Qt.|299.95|434.95|4.7|141|F C|Flame,Marseille
Ninja|Open Box: Ninja CREAMi Deluxe 11-in-1 Ice Cream Maker|159.95|249.99|4.4|58|F C|`,
  'Like-new, inspected returns at outlet prices. Quantities are limited.'),

  // ---------------------------------------------------------------- Clearance across departments
  sub('cooks-tools', 'utensils-view-all', { category: 'Tools', type: 'Utensils' }, `
Williams Sonoma|Williams Sonoma Silicone Turner|9.95|16.95|4.5|212|E C +turner-spatulas|`,
  'Spoons, spatulas, tongs and utensil sets.'),
  sub('cooks-tools', 'kitchen-gadgets-view-all', { category: 'Tools', type: 'Thermometers' }, `
ThermoWorks|ThermoWorks ChefAlarm Cooking Thermometer & Timer|65.00||4.8|1202|+timer-thermometer-scale|Black,Red,White
Williams Sonoma|Williams Sonoma Digital Kitchen Timer|14.95|24.95|4.4|141|E C +timer-thermometer-scale|
OXO|OXO Good Grips Adjustable Measuring Cup|12.99||4.6|1802|+measuring-cups-spoons|
Microplane|Microplane Premium Classic Zester|16.95||4.8|5102|+graters|Black,Red`,
  'Gadgets that make prep faster.'),
  sub('cutlery', 'cutlery-accessories-view-all', { category: 'Cutlery', type: 'Knife Blocks' }, `
Wüsthof|Wüsthof Classic 2-Piece Prep Set|99.95|149.95|4.6|141|F C +cutlery-chef-knives +paring-knives|
Williams Sonoma|Williams Sonoma Magnetic Knife Strip, 18"|59.95|89.95|4.5|212|E C +knives-blocks-storage|
Shun|Shun Classic Kitchen Shears|59.95||4.6|402|+kitchen-shears|`,
  'Knife storage, shears and sharpening.'),
  sub('electrics', 'specialty-view-all', { category: 'Electrics', type: 'Slow Cookers' }, `
Instant Pot|Instant Pot Pro Plus Multi-Cooker, 6-Qt.|149.95|199.95|4.5|602|F C +pressure-rice-slow-cookers|
Cuisinart|Cuisinart 3-in-1 Cook Central Multi-Cooker|129.95|179.95|4.4|802|F C +pressure-rice-slow-cookers +electrics-cuisinart|
KitchenAid|KitchenAid Cordless 7-Speed Hand Mixer|99.99|129.99|4.5|402|F C +electrics-kitchenaid|Empire Red,Onyx Black
Breville|Breville the Hot Wok™|149.95|199.95|4.4|302|F C +electrics-breville|Brushed Stainless Steel`,
  'Specialty appliances for the curious cook.'),
  sub('bakeware', 'view-all-bakeware', { category: 'Bakeware', type: 'Cake Pans' }, `
Emile Henry|Emile Henry Ruffled Pie Dish|39.95|59.95|4.7|302|C +pie-pans-tart-pans +bakeware-emile-henry|Burgundy,Flour
Staub|Staub Ceramic Ramekins, Set of 4|39.95|60.00|4.6|212|C +ramekin-mini-cocottes|White,Cherry`,
  'Every pan for baking, from sheet pans to springforms.'),
  sub('food', 'food-all-prepared', { category: 'Food', type: 'pantry' }, `
Williams Sonoma|Williams Sonoma Tomato Soup, Set of 2|19.95|29.95|4.5|212|E C +food-side-dishes|
Williams Sonoma|Williams Sonoma Mac & Cheese, Serves 4-6|29.95|44.95|4.6|302|E C +food-side-dishes|`,
  'Entrées, sides and soups, ready to heat and serve.'),
  sub('tabletop-glassware-bar', 'all-dinnerware', { category: 'Tabletop', type: 'Dinner Plates' }, `
Williams Sonoma|Williams Sonoma Open Kitchen Dinner Plates, Set of 4|29.95|49.95|4.6|802|E C +tabletop-plates|
Williams Sonoma|Williams Sonoma Open Kitchen Cereal Bowls, Set of 4|24.95|39.95|4.6|612|E C +tabletop-bowls|
Williams Sonoma|Williams Sonoma Open Kitchen Salad Plates, Set of 4|24.95|39.95|4.5|402|E C +salad-appetizer-plates|
Schott Zwiesel|Schott Zwiesel Tritan Pure Highball Glasses, Set of 6|44.95|69.95|4.6|302|C +bar-glassware-casual|
Schott Zwiesel|Schott Zwiesel Tritan Old Fashioned Glasses, Set of 6|44.95|69.95|4.6|212|C +bar-glasses|`,
  'Dinnerware and drinkware for every day.'),

  // ---------------------------------------------------------------- Deeper shelves for smaller categories
  sub('cookware', 'woks', { category: 'Cookware', type: 'Woks' }, `
Joyce Chen|Joyce Chen Carbon Steel Wok, 14"|49.95||4.5|1202|+cookware-carbon-steel|
All-Clad|All-Clad D3® Stainless-Steel Stir Fry Pan, 12"|159.95|199.95|4.7|402|F +cookware-all-clad +stainless-steel-cookware|`,
  'Woks and stir-fry pans for high-heat cooking.'),
  sub('cookware', 'cookware-fondue-shop', { category: 'Cookware', type: 'Fondue' }, `
Swissmar|Swissmar Lugano Cheese Fondue Set|89.95||4.5|302||Red,Black
Cuisinart|Cuisinart Electric Fondue Set|79.95||4.4|612|+electrics-cuisinart|`,
  'Fondue sets for cheese, chocolate and broth.'),
  sub('cookware', 'cookware-cuisinart', { category: 'Cookware', type: 'Fry Pans' }, `
Cuisinart|Cuisinart Chef's Classic Nonstick Skillet, 10"|39.95||4.5|2102|+nonstick-cookware +fry-pans-skillets|
Cuisinart|Cuisinart Multiclad Pro Stainless-Steel Saucepan, 3-Qt.|79.95||4.6|902|+saucepans-sauciers +stainless-steel-cookware|
Cuisinart|Cuisinart Chef's Classic Enameled Cast Iron Casserole, 5-Qt.|99.95|139.95|4.5|402|+cookware-enameled-cast-iron|Cardinal Red,Provencal Blue`,
  'Cuisinart cookware for everyday cooking.'),
  sub('outdoor', 'outdoor-cookware', { category: 'Cookware', type: 'Grill Pans' }, `
Williams Sonoma|Williams Sonoma Outdoor Cast Iron Griddle|69.95||4.6|302|E +outdoor-cookware-all|
Williams Sonoma|Williams Sonoma Stainless-Steel Grill Wok|39.95||4.5|212|E +outdoor-cookware-all|
Emile Henry|Emile Henry Flame® BBQ Grill Plancha|99.95||4.6|141|+outdoor-cookware-all|Charcoal`,
  'Grill baskets, planchas and woks made for the grill.'),
  sub('cooks-tools', 'tool-sets', { category: 'Tools', type: 'Utensils' }, `
OXO|OXO Good Grips 15-Piece Everyday Kitchen Utensil Set|79.99||4.6|1802||
Williams Sonoma|Williams Sonoma Silicone Utensil Set with Crock, 6-Piece|59.95||4.5|402|E|Black,White`,
  'Utensil sets that cover the basics.'),
  sub('cooks-tools', 'tongs', { category: 'Tools', type: 'Tongs' }, `
Rösle|Rösle Locking Tongs, 12"|29.95||4.7|402||
Williams Sonoma|Williams Sonoma Silicone-Tipped Tongs, Set of 2|24.95||4.5|302|E|`,
  'Tongs and forks for turning, serving and grilling.'),
  sub('cooks-tools', 'cooks-mixing-bowls', { category: 'Tools', type: 'Mixing Bowls' }, `
OXO|OXO Good Grips Glass Mixing Bowls, Set of 3|39.99||4.7|1202||
Williams Sonoma|Williams Sonoma Melamine Nesting Mixing Bowls, Set of 4|49.95||4.6|402|E|White,Sage`,
  'Mixing bowls in glass, stainless steel and ceramic.'),
  sub('cooks-tools', 'colanders-food-skimmers', { category: 'Tools', type: 'Colanders' }, `
Williams Sonoma|Williams Sonoma Over-the-Sink Colander|29.95||4.5|402|E|
Rösle|Rösle Stainless-Steel Skimmer|29.95||4.6|141||`,
  'Colanders, strainers, skimmers and salad spinners.'),
  sub('cooks-tools', 'mandolines-slicers', { category: 'Tools', type: 'Mandolines' }, `
OXO|OXO Good Grips 3-Blade Tabletop Spiralizer|39.99||4.4|802||`,
  'Mandolines and spiralizers for paper-thin slices.'),
  sub('cooks-tools', 'mortars-pestles', { category: 'Tools', type: 'Mortars' }, `
Le Creuset|Le Creuset Stoneware Mortar & Pestle|49.95||4.6|141||Flame,White`,
  'Grind spices, pastes and pesto by hand.'),
  sub('cooks-tools', 'pizza-tools', { category: 'Tools', type: 'Pizza Tools' }, `
OXO|OXO Good Grips Pizza Wheel|14.99||4.6|1802||
Ooni|Ooni Perforated Pizza Peel, 14"|59.99||4.7|402||`,
  'Stones, peels and cutters for homemade pizza.'),
  sub('outdoor', 'outdoor-grill-tools-accessories', { category: 'Tools', type: 'Grill Tools' }, `
Williams Sonoma|Williams Sonoma Grill Brush|29.95||4.5|402|E|
MEATER|MEATER Plus Wireless Smart Meat Thermometer|99.95||4.5|2402||`,
  'Grill tools, brushes and thermometers.'),
  sub('cooks-tools', 'baking-pastry-tools', { category: 'Tools', type: 'Pastry Tools' }, `
Ateco|Ateco Offset Spatula, 9"|9.95||4.8|1202||
Williams Sonoma|Williams Sonoma Pastry Bag & Tip Set, 14-Piece|29.95||4.5|402|E|`,
  'Brushes, scrapers, spatulas and piping sets for pastry work.'),
  sub('cooks-tools', 'can-openers', { category: 'Tools', type: 'Can Openers' }, `
Kuhn Rikon|Kuhn Rikon Auto Safety Master Can Opener|29.95||4.4|1402||Red,Black`,
  'Openers that work every time.'),
  sub('cutlery', 'slicing-carving-knives', { category: 'Cutlery', type: 'Carving Sets' }, `
Shun|Shun Classic Hollow-Ground Slicing Knife, 9"|189.95||4.8|141|F +knives-shun +thanksgiving-cutlery|
Wüsthof|Wüsthof Classic 2-Piece Carving Set|199.95|249.95|4.7|402|F +knives-wusthof +thanksgiving-cutlery|`,
  'Carving sets and slicers for roasts and holiday birds.'),
  sub('cutlery', 'knives-shun', { category: 'Cutlery', type: 'Chef Knives' }, `
Shun|Shun Classic Western Chef's Knife, 8"|159.95|199.95|4.7|212|F +cutlery-chef-knives +offers-shun-promo|
Shun|Shun Premier Santoku Knife, 7"|169.95|219.95|4.8|302|F +cutlery-santoku-knives +offers-shun-promo|`,
  'Handcrafted Japanese knives from Seki City.'),
  sub('electrics', 'electrics-sous-vide-machines', { category: 'Electrics', type: 'Sous Vide' }, `
Anova|Anova Precision® Oven 2.0|699.95||4.4|402|F|`,
  'Sous vide circulators and steam ovens for precise cooking.'),
  sub('electrics', 'electrics-delonghi', { category: 'Electrics', type: 'Espresso Machines' }, `
De'Longhi|De'Longhi Eletta Explore Fully Automatic Espresso Machine|1799.95||4.5|302|F +espresso-makers|Titanium
De'Longhi|De'Longhi Dedica Duo Espresso Machine|299.95|349.95|4.4|612|F +espresso-makers +coffee-espresso-event|Silver,Black`,
  'De’Longhi espresso machines and kettles.'),
  sub('electrics', 'electrics-vitamix', { category: 'Electrics', type: 'Blenders' }, `
Vitamix|Vitamix Propel 750 Blender|499.95|549.95|4.6|402|F +blenders|Black
Vitamix|Vitamix Immersion Blender|149.95||4.5|302|F +blenders|`,
  'Professional-grade Vitamix blenders.'),
  sub('bakeware', 'bakeware-rolling-pins', { category: 'Tools', type: 'Rolling Pins' }, `
Williams Sonoma|Williams Sonoma Adjustable Rolling Pin|29.95||4.5|302|E|`,
  'French, tapered and handled rolling pins.'),
  sub('thanksgiving', 'thanksgiving-bakeware', { category: 'Bakeware', type: 'Pie Dishes' }, `
Williams Sonoma|Williams Sonoma Goldtouch® Pro Nonstick Leaf Pie Crust Cutters|24.95||4.6|302|E +cookie-cutters-pancake-molds|
Nordic Ware|Nordic Ware Harvest Leaves Bundt® Pan|49.95||4.8|402|+bakeware-nordic-ware +cake-pans|Gold`,
  'Pie dishes, Bundt pans and cutters for the feast.'),
  sub('bakeware', 'bakeware-stainless-steel', { category: 'Bakeware', type: 'Sheet Pans' }, `
Williams Sonoma|Williams Sonoma Stainless-Steel Half Sheet Pan with Rack|59.95||4.6|212|E +sheet-pans-cookie-sheets|`,
  'Uncoated aluminum and stainless-steel bakeware.'),
  sub('bakeware', 'bakeware-cast-iron', { category: 'Bakeware', type: 'Baking Dishes' }, `
Staub|Staub Cast Iron Rectangular Baking Dish|129.95|199.00|4.7|212|+casseroles|Graphite Grey,Cherry`,
  'Cast iron for even baking and beautiful serving.'),
  sub('food', 'food-cocktail-mixes', { category: 'Food', type: 'pantry' }, `
Williams Sonoma|Williams Sonoma Margarita Mix|19.95||4.5|302|E|
Williams Sonoma|Williams Sonoma Old Fashioned Cocktail Syrup|19.95||4.6|212|E|`,
  'Mixes, syrups and garnishes for cocktails and mocktails.'),
  sub('food', 'food-hot-chocolate', { category: 'Food', type: 'pantry' }, `
Williams Sonoma|Williams Sonoma Salted Caramel Hot Chocolate, 12-oz.|24.95||4.6|402|E|
Williams Sonoma|Williams Sonoma Hot Chocolate Bombs, Set of 6|29.95||4.4|302|E|`,
  'Our signature hot chocolate and toppings.'),
  sub('food', 'food-entrees', { category: 'Food', type: 'pantry' }, `
Williams Sonoma|Williams Sonoma Beef Wellington, Serves 4-6|179.95||4.6|212|E +christmas-food|
Williams Sonoma|Williams Sonoma Chicken Enchiladas, Serves 4|59.95||4.5|141|E|`,
  'Chef-made entrées, delivered frozen.'),
  sub('food', 'food-spices-seasonings', { category: 'Food', type: 'pantry' }, `
Williams Sonoma|Williams Sonoma Steak Rub|14.95||4.7|402|E|
Diamond Crystal|Diamond Crystal Kosher Salt, 3-lb.|9.95||4.8|1202||`,
  'Rubs, salts and spice blends.'),
  sub('food', 'pressure-slow-cooking-sauces', { category: 'Food', type: 'pantry' }, `
Williams Sonoma|Williams Sonoma Coq au Vin Simmering Sauce|14.95||4.5|302|E|
Williams Sonoma|Williams Sonoma Tikka Masala Simmering Sauce|14.95||4.6|402|E|`,
  'Simmering sauces for slow cookers and Dutch ovens.'),
  sub('food', 'food-pizza-pasta-sauce', { category: 'Food', type: 'pantry' }, `
Rao's|Rao's Homemade Marinara Sauce, Set of 2|19.95||4.8|1202||
Williams Sonoma|Williams Sonoma Pizza Dough Kit|19.95||4.5|212|E|`,
  'Pastas, sauces and pizza kits.'),
  sub('tabletop-glassware-bar', 'serving-trays-platters-baskets', { category: 'Tabletop', type: 'Platters' }, `
Williams Sonoma|Williams Sonoma Olivewood Serving Board|79.95||4.7|402|E +cheese-boards-accessories|
Williams Sonoma|Williams Sonoma Rattan Serving Tray|69.95||4.5|212|E|`,
  'Platters, trays and boards for serving.'),
  sub('tabletop-glassware-bar', 'cheese-boards-accessories', { category: 'Tabletop', type: 'Cheese Boards' }, `
Williams Sonoma|Williams Sonoma Marble Cheese Dome|69.95||4.6|141|E|White Marble`,
  'Cheese boards, domes and knives.'),
  sub('outdoor', 'outdoor-water-bottles', { category: 'Outdoor', type: 'Tumbler' }, `
Hydro Flask|Hydro Flask 32-oz. Wide Mouth Bottle|44.95||4.7|1202||Black,White,Pacific
Stanley|Stanley Classic Legendary Bottle, 1.5-Qt.|45.00||4.7|802||Hammertone Green`,
  'Insulated tumblers and bottles.'),
  sub('tabletop-glassware-bar', 'entertaining-coasters-trivets', { category: 'Tabletop', type: 'Coasters' }, `
Williams Sonoma|Williams Sonoma Cork Trivets, Set of 2|19.95||4.5|302|E|`,
  'Coasters, trivets and cocktail napkins.'),
  sub('tabletop-glassware-bar', 'table-linens-tablecloths', { category: 'Linens', type: 'linens' }, `
Williams Sonoma|Williams Sonoma Harvest Jacquard Tablecloth|70" x 108"=129.95;70" x 126"=149.95||4.6|141|E +thanksgiving-tabletop-new|
Williams Sonoma|Williams Sonoma Classic Linen Tablecloth|70" x 90"=99.95;70" x 108"=119.95||4.6|302|E|White,Flax,Sage`,
  'Tablecloths in linen, cotton and seasonal jacquards.'),
  sub('home-essentials', 'pot-holders-oven-mitts', { category: 'Linens', type: 'heat protection' }, `
Le Creuset|Le Creuset Heat-Resistant Oven Mitt|29.95||4.6|402||Flame,Marseille,Sage`,
  'Oven mitts and pot holders.'),
  sub('home-essentials', 'canisters', { category: 'Home', type: 'food storage' }, `
Williams Sonoma|Williams Sonoma Marble Salt Cellar|29.95||4.7|302|E|White Marble`,
  'Canisters and jars for flour, sugar, coffee and more.'),
  sub('outdoor', 'rugs-outdoor', { category: 'Home', type: 'textile' }, `
Williams Sonoma Home|Performance Chenille Jute Rug|5' x 8'=595.00;8' x 10'=995.00||4.5|36|E|Natural`,
  'Durable rugs for patios and high-traffic rooms.'),
  sub('outdoor', 'wreaths-garlands', { category: 'Home', type: 'Wreath' }, `
Williams Sonoma|Williams Sonoma Faux Eucalyptus Garland, 6'|79.95||4.5|212|E|
Williams Sonoma|Williams Sonoma Fresh Noble Fir Wreath, 24"|99.95||4.7|402|E +christmas-entertaining|`,
  'Fresh and faux wreaths and garlands for the season.'),
  sub('home-furniture', 'benches-bedroom', { category: 'Furniture', type: 'bench' }, `
Williams Sonoma Home|Larkspur Leather Bed Bench|1295.00||4.6|22|E|Saddle`,
  'Benches for the end of the bed.'),
  sub('home-furniture', 'mattresses', { category: 'Furniture', type: 'mattress' }, `
Williams Sonoma Home|Williams Sonoma Home Classic Innerspring Mattress|Queen=1795.00;King=2195.00||4.5|41|E|`,
  'Hybrid, latex and innerspring mattresses.'),
  sub('home-furniture', 'home-office-chairs', { category: 'Furniture', type: 'chair' }, `
Williams Sonoma Home|Ortho Wood Desk Chair|695.00||4.5|28|E|Natural Oak,Black`,
  'Desk chairs that look as good as they feel.'),
]
