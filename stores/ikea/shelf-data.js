// IKEA US shelf: the everyday assortment shown in the default reference catalog.
// Real IKEA product names, product types and US price points (USD). Rows are grouped
// by the IKEA category slug they live in (site-data.js); `@ shape` sets the artwork
// form for the rows that follow.
//
// Row: NAME|product type|variant (color, size)|price|rating|reviews|deal|article no.
//   deal: L<previous price> = New lower price, F<price> = IKEA Family price, N = New
//   article no.: optional; otherwise a stable 8-digit IKEA-style number is derived.
// This is never GTA 6 evidence: these rows are ordered only as `kind: 'other'` lines.

export const SHELF_SOURCE = `
# bookcases-shelving-units-st002
@ shelf
BILLY|Bookcase|white, 31 1/2x11x79 1/2 "|69.99|4.7|5212||002.638.50
BILLY|Bookcase|black oak effect, 31 1/2x11x79 1/2 "|79.99|4.7|1843||404.042.21
BILLY|Bookcase with height extension unit|white, 31 1/2x11x93 1/4 "|99.99|4.6|862||
BILLY / OXBERG|Bookcase with glass doors|white/glass, 31 1/2x11 3/4x79 1/2 "|249.00|4.6|318||
KALLAX|Shelf unit|white, 30 3/8x57 7/8 "|89.99|4.7|7356||802.758.62
KALLAX|Shelf unit|black-brown, 57 7/8x57 7/8 "|149.99|4.7|3127||
KALLAX|Shelf unit|white stained oak effect, 30 3/8x30 3/8 "|54.99|4.7|1406|N|
KALLAX|Insert with door|white, 13x13 "|20.00|4.6|2214||
HEMNES|Bookcase|white stain, 35 3/8x77 1/2 "|249.00|4.7|941||
IVAR|Shelving unit|pine, 35x11 3/4x70 1/2 "|119.00|4.8|488||
LACK|Wall shelf|white, 74 3/4x10 1/4 "|39.99|4.4|1630||
BROR|Shelving unit|black, 33 1/4x15 3/4x74 3/4 "|134.99|4.7|412||
FJÄLLBO|Shelf unit|black, 39 3/8x53 1/2 "|129.00|4.6|1078||
VITTSJÖ|Shelf unit|black-brown/glass, 39 3/8x68 7/8 "|99.99|4.5|1563|L119.99|
BAGGEBO|Shelf unit|metal/white, 19 3/4x9 7/8x63 "|29.99|4.5|1981||
HYLLIS|Shelf unit|in/outdoor, 23 5/8x10 5/8x55 1/2 "|14.99|4.4|2930||
GERSBY|Bookcase|white, 23 5/8x70 7/8 "|49.99|4.3|1204||
OMAR|1 section shelving unit|galvanized, 36 1/4x14 1/8x71 1/4 "|59.99|4.7|875||
EKET|Wall-mounted shelving unit|dark gray, 13 3/4x13 3/4x13 3/4 "|35.00|4.6|1192||
TROFAST|Storage combination with boxes|white/white, 39x17 3/8x37 "|111.00|4.7|1452||
# dressers-storage-drawers-st004
@ shelf
MALM|6-drawer dresser|white, 63x30 3/4 "|229.99|4.4|4528||104.035.90
MALM|3-drawer chest|white, 31 1/2x30 3/4 "|149.99|4.4|3871|L169.99|
MALM|4-drawer chest|black-brown, 31 1/2x39 3/8 "|179.99|4.4|1672||
HEMNES|8-drawer dresser|white stain, 63x37 3/4 "|399.00|4.7|2110||
HEMNES|3-drawer chest|black-brown, 42 1/2x37 3/4 "|279.00|4.6|1206||
KULLEN|3-drawer chest|white, 27 1/2x28 3/8 "|59.99|4.1|3624||
KULLEN|6-drawer dresser|black-brown, 55 1/2x28 3/8 "|119.99|4.0|1859||
BRIMNES|3-drawer chest|white/frosted glass, 30 3/4x37 3/8 "|139.99|4.4|766||
KOPPANG|6-drawer dresser|white, 67 3/8x32 5/8 "|219.00|4.3|1314||
NORDLI|8-drawer dresser|white, 63x21 1/4 "|379.00|4.5|687||
TARVA|5-drawer chest|pine, 31 1/2x50 "|159.00|4.5|1017||
HAUGA|6-drawer dresser|white, 54x33 1/8 "|249.00|4.6|832|N|
SONGESAND|6-drawer dresser|white, 63x31 7/8 "|279.00|4.4|521||
ALEX|Drawer unit|white, 14 1/8x27 1/2 "|99.99|4.7|5643||
HELMER|Drawer unit on casters|white, 11x27 1/8 "|59.99|4.6|2384||
# armoires-wardrobes-19053
@ shelf
PAX|Wardrobe|white, 39 3/8x23 5/8x79 1/4 "|315.00|4.6|1534||
PAX / FORSAND|Wardrobe combination|white/white, 59x23 5/8x79 1/4 "|575.00|4.6|612||
BRIMNES|Wardrobe with 3 doors|white, 46x74 3/4 "|299.00|4.4|734||
KLEPPSTAD|Wardrobe with 2 doors|white, 31 1/8x69 1/4 "|99.99|3.9|2190||
RAKKESTAD|Wardrobe with 2 doors|black-brown, 31 1/8x69 1/4 "|149.00|4.1|826||
HAUGA|Wardrobe with sliding doors|white, 46 1/2x78 3/8 "|349.00|4.5|402|N|
# tv-media-furniture-10475
@ table
BESTÅ|TV unit with doors|white/Lappviken white, 70 7/8x16 1/2x15 "|260.00|4.6|904||
LACK|TV unit|black-brown, 35 3/8x10 1/4x17 3/4 "|39.99|4.3|2017||
HEMNES|TV unit|white stain, 72 7/8x18 1/2x22 1/2 "|299.00|4.6|742||
BRIMNES|TV unit|white, 70 7/8x16 1/8x20 7/8 "|129.00|4.5|1385||
IDANÄS|TV unit|white, 63 3/4x18 1/2x22 7/8 "|299.00|4.6|233|N|
KALLAX|TV unit|white, 57 7/8x15 3/8 "|79.99|4.6|1288|L89.99|
# display-storage-cabinets-st003
@ shelf
HEMNES|Glass-door cabinet with 3 drawers|white stain, 35 3/8x77 1/2 "|449.00|4.7|503||
RUDSTA|Glass-door cabinet|anthracite, 31 1/2x14 5/8x67 3/8 "|99.99|4.2|651||
FABRIKÖR|Glass-door cabinet|dark gray-green, 22 1/2x59 "|229.00|4.6|387||
MILSBO|Glass-door cabinet|anthracite, 39 7/8x68 7/8 "|229.00|4.5|312||
IDANÄS|Cabinet with bi-folding glass doors|white, 31 7/8x15 3/8x53 7/8 "|299.00|4.7|119|N|
# shoe-cabinets-10456
@ shelf
HEMNES|Shoe cabinet with 2 compartments|white, 35x11x50 "|149.00|4.6|1745||
TRONES|Shoe cabinet/storage|white, 20 1/2x7 1/8x15 3/8 "|39.99|4.2|1336||
BISSA|Shoe cabinet with 2 compartments|white, 19 1/4x11 x36 5/8 "|39.99|4.2|2289||
STÄLL|Shoe cabinet with 3 compartments|white, 31 1/8x11 3/4x58 5/8 "|149.00|4.4|823||
# utility-storage-carts-fu005
@ shelf
RÅSKOG|Utility cart|white, 13 3/4x17 3/4x30 3/4 "|34.99|4.7|6216||
NISSAFORS|Utility cart|black, 19 5/8x11 3/4x32 5/8 "|29.99|4.6|1730||
HORNAVAN|Utility cart|white, 15 3/4x15 3/4x30 3/4 "|49.99|4.5|204|N|
# sideboards-buffets-sofa-tables-30454
@ table
HEMNES|Sideboard|white stain, 61 3/8x18 1/2 "|349.00|4.7|366||
BESTÅ|Storage combination with doors|white/Lappviken white, 47 1/4x16 1/2x29 1/8 "|190.00|4.5|488||
STOCKHOLM 2017|Sideboard|walnut veneer, 63x31 1/2 "|799.00|4.7|91||
# sofas-sectionals-fu003
@ chair
KIVIK|Sofa|Tibbleby beige/gray|899.00|4.4|1528||
EKTORP|Sofa|Hallarp gray|699.00|4.3|2236|L799.00|
VIMLE|Sofa|Gunnared beige|849.00|4.3|1046||
KLIPPAN|Loveseat|Vissle gray|299.00|4.2|1720||
LANDSKRONA|Sofa|Gunnared dark gray/wood|999.00|4.3|703||
UPPLAND|Sofa|Blekinge white|849.00|4.4|568||
GLOSTAD|Loveseat|Knisa dark gray|149.00|3.9|2902||
FÄRLÖV|Sofa|Flodafors white|1199.00|4.5|248||
SÖDERHAMN|3-seat sofa|Tonerud red|899.00|4.4|512||
KIVIK|U-shaped sofa, 6 seat|Tresund light beige|2099.00|4.5|364||
JÄTTEBO|3-seat modular sofa|Samsala gray-beige|1550.00|4.4|143|N|
PÄRUP|Sofa|Vissle gray|599.00|4.2|606|F549.00|
# sleeper-sofas-10663
@ chair
FRIHETEN|Sleeper sectional, 3 seat w/storage|Skiftebo dark gray|799.00|4.2|5126||
HOLMSUND|Sleeper sofa|Nordvalla beige|899.00|4.3|914||
LYCKSELE MURBO|Sleeper sofa|Knisa dark gray|449.00|4.1|803||
BALKARP|Sleeper sofa|Vissle gray|299.00|3.9|1415||
HYLTARP|Sleeper sofa|Gransel natural|899.00|4.4|136|N|
# armchairs-chaises-fu006
@ chair
POÄNG|Armchair|birch veneer/Knisa light beige|129.00|4.7|10744||
POÄNG|Armchair|black-brown/Hillared dark blue|149.00|4.7|3021||
POÄNG|Rocking chair|birch veneer/Skiftebo dark gray|199.00|4.7|1802||
STRANDMON|Wing chair|Nordvalla dark gray|329.00|4.7|3268||
EKERÖ|Armchair|Skiftebo yellow|249.00|4.5|1110||
KOARP|Armchair|Saxemara light blue|299.00|4.6|452||
VEDBO|Armchair|Gunnared light green|349.00|4.4|388||
TULLSTA|Armchair|Nordvalla dark gray|149.00|4.3|920||
PELLO|Armchair|Holmby natural|89.99|4.4|2412||
MUREN|Recliner|Remmarn light gray|329.00|4.2|1048||
LINANÄS|Armchair|Vissle dark gray|119.00|4.0|533|L139.00|
# ottomans-20926
@ chair
POÄNG|Footstool|birch veneer/Knisa light beige|69.00|4.7|2051||
BOSNÄS|Footstool|Idekulla light gray|49.99|4.4|1374||
SANDBACKEN|Pouffe|Frillestad light gray|79.99|4.4|204|N|
# beds-bm003
@ bed
MALM|Bed frame, high|white, Queen|299.00|4.5|6418||
MALM|Bed frame, high, w 4 storage boxes|black-brown, Queen|449.00|4.4|1866||
HEMNES|Bed frame|white stain, Queen|349.00|4.6|3204||
NEIDEN|Bed frame|pine, Full|89.99|4.2|3155||
TARVA|Bed frame|pine, Queen|199.00|4.5|2710||
BRIMNES|Bed frame with storage & headboard|white, Queen|429.00|4.4|1903||
SONGESAND|Bed frame with 2 storage boxes|white, Queen|399.00|4.4|1281||
KLEPPSTAD|Bed frame|white/Vissle beige, Queen|149.00|4.2|1036||
SLATTUM|Upholstered bed frame|Vissle dark gray, Queen|199.00|4.4|4106||
IDANÄS|Upholstered storage bed|Gunnared dark gray, Queen|699.00|4.6|380||
NORDLI|Bed frame with storage|white, Queen|599.00|4.6|1129||
HAUGA|Upholstered bed frame|Vissle gray, Queen|299.00|4.5|902|L349.00|
KURA|Reversible bed|white/pine, Twin|199.00|4.6|1874||
# mattresses-bm002
@ bed
VALEVÅG|Pocket spring mattress|medium firm/light blue, Queen|399.00|4.4|2350||
ÅBYGDA|Foam mattress|firm/white, Queen|199.00|4.1|1622||
ÅKREHAMN|Foam mattress|firm/white, Queen|149.00|4.0|2803||
MATRAND|Memory foam mattress|firm/white, Queen|599.00|4.4|1031||
VESTERÖY|Pocket spring mattress|medium firm/light blue, Queen|299.00|4.3|2410|F269.00|
MORGEDAL|Foam mattress|firm/dark gray, Queen|349.00|4.3|1205||
VALEVÅG|Pocket spring mattress|firm/light blue, Twin|249.00|4.4|612||
# nightstands-20656
@ shelf
MALM|Nightstand|white, 15 3/4x18 7/8 "|69.99|4.4|3012||
HEMNES|Nightstand|white stain, 18 1/8x13 3/4 "|99.99|4.6|1985||
KULLEN|2-drawer chest|white, 13 3/4x15 3/4 "|39.99|4.2|4271||
NORDLI|Nightstand|white, 11 3/4x26 3/8 "|119.00|4.5|604||
TARVA|Nightstand|pine, 15 3/4x15 "|89.99|4.5|1102||
RAST|Chest of 3 drawers|pine, 24 3/8x27 1/2 "|49.99|4.3|2508||
# bedding-tl004
@ textile
NATTJASMIN|Duvet cover and pillowcase(s)|white, Full/Queen|59.99|4.5|1880||
BERGPALM|Duvet cover and pillowcase(s)|gray/stripe, Full/Queen|39.99|4.5|1416||
DVALA|Sheet set|white, Queen|29.99|4.6|3824||
ULLVIDE|Sheet set|white, Queen|49.99|4.6|1012||
ÄNGSLILJA|Duvet cover and pillowcase(s)|gray-green, Full/Queen|39.99|4.6|1503||
SMÅSPORRE|Comforter, light warm|Full/Queen|39.99|4.4|2290||
SÄFFERÖN|Comforter, warmer|Full/Queen|79.99|4.6|780||
KLUBBSPORRE|Ergonomic pillow, side/back sleeper|19 7/8x13 3/4 "|29.99|4.3|2614||
GRÖNAMARANT|Pillow, firm|Queen|19.99|4.2|712|N|
LUDDROS|Mattress protector|Queen|29.99|4.5|1126||
# under-bed-storage-19059
@ basket
SKUBB|Storage case|white, 36 5/8x21 5/8x7 1/2 "|12.99|4.5|3302||
STUK|Storage case|white/gray, 28x20x7 1/2 "|9.99|4.5|1209||
# lamps-light-fixtures-li002
@ lamp
HEKTAR|Floor lamp|dark gray|69.99|4.6|1528||
LAUTERS|Floor lamp|ash/white|79.99|4.6|862||
TERTIAL|Work lamp|dark gray|15.99|4.6|6015||503.554.55
FORSÅ|Work lamp|black|29.99|4.6|2433||
RANARP|Floor/reading lamp|black|69.99|4.6|920||
HOLMÖ|Floor lamp|white|14.99|4.4|3612||
LAMPAN|Table lamp|white, 11 "|7.99|4.4|5301||
TÄRNABY|Table lamp|anthracite, 21 5/8 "|29.99|4.6|1128||
SOLKLINT|Table lamp|brass/gray clear glass, 15 3/8 "|39.99|4.5|540|N|
VINDKAST|Pendant lamp|white, 19 5/8 "|69.99|4.5|612||
NYMÅNE|Floor lamp with 3-spot|anthracite|79.99|4.5|421||
HÅRSLINGA|Floor lamp|clear plastic|29.99|4.2|207|L39.99|
SKAFTET|Floor lamp base, arched|nickel-plated|39.99|4.4|603||
TOKABO|Table lamp|glass opal, 20 1/2 "|29.99|4.5|1312||
VARMBLIXT|Table lamp|orange glass/round, 11 3/4 "|79.99|4.6|488||
# decorative-lighting-14971
@ lamp
STRÅLA|LED lamp shade|star white, 27 1/2 "|14.99|4.6|703||
SNÖYRA|LED string light with 40 lights|battery-operated/silver color|9.99|4.3|1301||
TVÄRSLÅ|LED decorative light|battery-operated/white|12.99|4.4|201|N|
# smart-lighting-36812
@ lamp
TRÅDFRI|LED bulb E26 800 lumen|wireless dimmable white spectrum/globe opal white|12.99|4.4|2730||
KAJPLATS|LED bulb E26 1100 lumen|smart/wireless dimmable/color and white spectrum|19.99|4.5|312|N|
STYRBAR|Remote control|white|9.99|4.4|1503||
# led-bulbs-20514
@ lamp
SOLHETTA|LED bulb E26 800 lumen|globe opal white, 4 pack|9.99|4.6|2190||
SOLHETTA|LED bulb E12 250 lumen|chandelier opal white, 3 pack|5.99|4.5|860||
# outdoor-lighting-17897
@ lamp
SOLVINDEN|LED solar-powered pendant lamp|outdoor globe/white, 11 "|14.99|4.2|1702||
# appliances-ka002
@ appliance
TILLREDA|Microwave oven|white|79.99|4.3|1062||
TILLREDA|Portable induction cooktop|1 zone, white|59.99|4.4|2401||
LAGAN|Dishwasher, built-in|stainless steel, 24 "|449.00|4.1|312||
MEDELNIVÅ|Dishwasher, built-in|stainless steel, 24 "|899.00|4.4|190||
FINSMAK|Gas range with oven|stainless steel, 30 "|999.00|4.2|88||
# kitchen-islands-carts-10471
@ table
FÖRHÖJA|Kitchen cart|birch, 39 3/8x16 7/8 "|99.99|4.5|1603||
BEKVÄM|Kitchen cart|birch, 22 7/8x15 3/4 "|79.99|4.7|1405||
STENSTORP|Kitchen island|white/oak, 49 5/8x31 7/8 "|499.00|4.5|387||
TORNVIKEN|Kitchen island|off-white/oak, 49 5/8x30 3/8 "|499.00|4.6|201||
# kitchen-wall-storage-20676
@ shelf
BEKVÄM|Spice rack|aspen, 15 3/4 "|4.99|4.7|7812||
KUNGSFORS|Rail with 5 hooks|stainless steel, 22 "|19.99|4.7|840||
HULTARP|Rail|black, 23 5/8 "|5.99|4.6|1601||
VARIERA|Shelf insert|white, 12 5/8x5 7/8 "|4.99|4.5|2201||
# kitchen-faucets-10482
@ appliance
ÄLMAREN|Kitchen faucet|stainless steel color|189.00|4.5|512||
LUNDSKÄR|Kitchen faucet|chrome plated|99.99|4.3|388||
# kitchen-sinks-24263
@ bowl
HAVSEN|Apron front sink, 1 bowl|white, 24x19 "|229.00|4.6|443||
# kitchen-countertops-24264
@ table
KARLBY|Countertop|walnut/veneer, 74x1 1/2 "|249.00|4.6|1102||
EKBACKEN|Countertop|white marble effect/laminate, 98x1 1/8 "|119.00|4.4|860||
# cabinet-knobs-handles-pulls-16298
@ utensil
BAGGANÄS|Handle|black, 5 1/16 ", 2 pack|9.99|4.7|1011||
HACKÅS|Handle|anthracite, 6 1/4 ", 2 pack|9.99|4.6|402||
# kitchens-ka003
@ shelf
ENHET|Kitchen|white/oak effect, 70x25 1/8x87 "|1065.00|4.4|212||
KNOXHULT|Kitchen|gray, 72 1/4x24x86 5/8 "|849.00|4.0|602||
SUNNERSTA|Mini-kitchen|47 1/4x22 7/8 "|199.00|4.2|418||
# rugs-10653
@ textile
STOENSE|Rug, low pile|off-white, 6' 7"x9' 10"|199.00|4.6|2010||
LOHALS|Rug, flatwoven|natural, 5' 3"x7' 7"|99.99|4.4|2316||
VINDUM|Rug, high pile|white, 5' 7"x8' 2"|199.00|4.5|1110||
TIPHEDE|Rug, flatwoven|natural/black, 4' 4"x6' 5"|19.99|4.4|4102||
LANGSTED|Rug, low pile|beige, 5' 7"x7' 10"|79.99|4.3|1603||
VONSBÄK|Rug, low pile|light gray, 6' 7"x9' 10"|149.00|4.5|420||
MORUM|Rug flatwoven, in/outdoor|beige, 5' 3"x7' 7"|99.99|4.6|1882||
KORSKÄR|Rug, high pile|light green, 5' 7"x7' 10"|129.00|4.5|86|N|
BRÖNDEN|Rug, low pile|multicolor, 5' 7"x7' 10"|149.00|4.4|170|L169.00|
# decorative-pillows-cushion-covers-10659
@ textile
GURLI|Cushion cover|beige, 20x20 "|4.99|4.5|5603||
SANELA|Cushion cover|dark blue, 20x20 "|14.99|4.7|1902||
FJÄDRAR|Inner cushion|off-white, 20x20 "|8.99|4.6|3211||
SKÖLDBLAD|Cushion cover|white/dark gray, 20x20 "|9.99|4.4|210|N|
INNERSKÄR|Cushion cover|natural/linen, 20x20 "|12.99|4.6|403||
# blankets-throws-20528
@ textile
VITMOSSA|Throw|gray, 47x63 "|4.99|4.5|8701||
GURLI|Throw|beige, 47x71 "|14.99|4.6|2210||
STOENSE|Throw|light beige, 47x71 "|24.99|4.5|302|N|
BRUNKRISSLA|Throw|black/white, 51x67 "|19.99|4.5|770||
# bathroom-textiles-tl003
@ textile
VÅGSJÖN|Bath towel|white, 28x55 "|4.99|4.4|6230||
HIMLEÅN|Bath towel|dark gray/mélange, 28x55 "|12.99|4.6|1702||
FREDRIKSJÖN|Bath towel|white, 28x55 "|7.99|4.5|1204||
TOFTBO|Bath mat|white, 24x35 "|9.99|4.6|3810||
BLÅVINGAD|Bath towel|blue/green, 28x55 "|9.99|4.6|412|N|
# kitchen-textiles-18850
@ textile
RINNIG|Dish towel|white/gray/patterned, 18x24 ", 4 pack|2.99|4.4|3205||
ELLY|Dish towel|white/red, 20x26 ", 4 pack|4.99|4.5|1880||
# dining-furniture-700417
@ table
EKEDALEN|Extendable table|white, 47 1/4/70 7/8x31 1/2 "|299.00|4.6|1604||
MÖRBYLÅNGA|Table|oak veneer brown stained, 86 5/8x39 3/8 "|749.00|4.7|402||
LISABO|Table|ash veneer, 55 1/8x30 3/4 "|229.00|4.6|1308||
MELLTORP|Table|white, 49 5/8x29 1/2 "|79.99|4.4|2306||
SANDSBERG|Table|black, 43 1/4x26 3/8 "|99.99|4.3|1410||
NORDVIKEN|Extendable table|black, 82 5/8/113 3/4x41 3/8 "|399.00|4.5|380||
INGATORP|Extendable table|white, 43 1/4x30 3/4 "|299.00|4.6|1120||
VOXLÖV|Table|light bamboo, 70 7/8x35 3/8 "|599.00|4.6|160|N|
DANDERYD|Dining table|black/ash veneer, 51 1/8x31 1/2 "|249.00|4.5|488|L279.00|
# chairs-700676
@ chair
STEFAN|Chair|brown-black|45.00|4.4|3102||
TOBIAS|Chair|clear/chrome plated|119.00|4.5|1203||
ADDE|Chair|white|15.99|4.2|4507||
TEODORES|Chair|white|25.00|4.4|2210||
INGOLF|Chair|white|85.00|4.6|1650||
LISABO|Chair|ash|119.00|4.5|602||
EKEDALEN|Chair|white/Orrsta light gray|79.99|4.4|904||
NORDVIKEN|Chair|black|99.99|4.5|1013||
KRYLBO|Chair|Tonerud dark beige|79.99|4.6|311|N|
LEIFARNE|Chair|dark yellow/Broringe chrome plated|39.99|4.5|1505||
ODGER|Chair|white/beige|85.00|4.4|720||
TERJE|Folding chair|beech|29.99|4.5|2380||
# stools-22659
@ chair
FROSTA|Stool|birch plywood|12.99|4.5|3720||
MARIUS|Stool|black|5.99|4.4|4610||
KYRRE|Stool|birch|19.99|4.6|1702||
BEKVÄM|Step stool|beech|29.99|4.7|2802||
FRANKLIN|Bar stool with backrest, foldable|white/white, 25 "|49.99|4.3|1503||
STIG|Bar stool with backrest|black/black, 24 3/4 "|29.99|4.2|1180||
# accent-tables-10705
@ table
LACK|Side table|white, 21 5/8x21 5/8 "|12.99|4.4|9032||200.114.08
LACK|Coffee table|black-brown, 46 1/2x30 3/4 "|49.99|4.3|4120||
HEMNES|Coffee table|white stain, 35 3/8x35 3/8 "|179.00|4.6|1310||
VITTSJÖ|Nesting tables, set of 2|black-brown/glass|59.99|4.4|2603||
LISTERBY|Coffee table|white stained oak veneer, 55 1/8x23 5/8 "|229.00|4.6|440||
BORGEBY|Coffee table|black, 27 1/2 "|99.99|4.4|606||
GLADOM|Tray table|black, 17 1/2x20 5/8 "|17.99|4.6|3203||
JÄTTESTA|Coffee table|black, 31 1/2x31 1/2 "|179.00|4.5|80|N|
# kids-tables-18768
@ table
FLISAT|Children's table|23 1/4x18 1/2 "|59.99|4.7|1402||
MAMMUT|Children's table|in/outdoor/white, 30 3/4x21 5/8 "|49.99|4.6|1803||
# high-chairs-45782
@ chair
ANTILOP|Highchair with tray|white/silver color|24.99|4.8|12408||
LANGUR|Junior/highchair|white|79.99|4.5|1020||
# desks-computer-desks-20649
@ table
MICKE|Desk|white, 41 3/8x19 5/8 "|99.99|4.5|5340||
ALEX|Desk|white, 51 1/8x23 5/8 "|149.00|4.6|3012||
LAGKAPTEN / ALEX|Desk|white, 55 1/8x23 5/8 "|209.98|4.6|4108|L229.98|
LINNMON / ADILS|Table|white, 39 3/8x23 5/8 "|54.99|4.5|7602||
TROTTEN|Desk sit/stand|white, 47 1/4x27 1/2 "|299.00|4.4|1406||
MITTZON|Desk sit/stand|electric walnut veneer/black, 55 1/8x31 1/2 "|549.00|4.5|503||
IDÅSEN|Desk sit/stand|black/dark gray, 63x31 1/2 "|699.00|4.4|1180||
HEMNES|Desk|white stain, 61x25 5/8 "|299.00|4.6|902||
MALM|Desk|white, 55 1/2x25 5/8 "|179.99|4.4|1640||
VIHALS|Desk|white, 55 7/8x27 1/2 "|99.99|4.4|208|N|
# desk-chairs-20652
@ chair
MARKUS|Office chair|Vissle dark gray|229.00|4.5|9406||
FLINTAN|Office chair with armrests|black|119.00|4.4|3210||
MILLBERGET|Swivel chair|Murum black|119.00|4.3|2510||
JÄRVFJÄLLET|Office chair with armrests|Gunnared beige/white|299.00|4.5|802||
HATTEFJÄLL|Office chair with armrests|Smidig black/black|349.00|4.6|1204||
ALEFJÄLL|Office chair|Grann beige|329.00|4.6|606||
LÅNGFJÄLL|Office chair|Gunnared dark gray/black|199.00|4.4|1530||
SNILLE|Swivel chair|white|29.99|4.2|2008||
ÖRFJÄLL|Swivel chair|white/Vissle dark gray|59.99|4.3|1903|F49.99|
# gaming-furniture-55002
@ chair
UPPSPEL|Gaming desk|black, 55 1/8x31 1/2 "|449.00|4.6|302||
MATCHSPEL|Gaming chair|Bomstad black|299.00|4.5|512||
HUVUDSPELARE|Gaming chair|black|79.99|4.3|1408||
LÅNESPELARE|Gaming desk|black, 31 1/2x15 3/4 "|99.99|4.4|380||
UTESPELARE|Gaming desk|black, 63x31 1/2 "|179.00|4.5|712||
GRUPPSPEL|Gaming chair|Grann dark gray|199.00|4.5|402|N|
# desk-accessories-10573
@ basket
SKÅDIS|Pegboard|white, 22x22 "|29.99|4.7|2603||
DRÖNJÖNS|Desk organizer|white|7.99|4.6|1302||
TJENA|Magazine file|white, 2 pack|3.99|4.5|2711||
KVISSLE|Letter tray|white|12.99|4.6|860||
SIGFINN|Monitor stand with drawer|bamboo|24.99|4.7|510|N|
# dinnerware-18860
@ plate
FÄRGKLAR|18-piece dinnerware set|matte green|69.99|4.6|1440||
IKEA 365+|Plate|white, 10 3/4 "|3.99|4.6|2905||
OFTAST|Plate|white, 9 1/2 "|0.99|4.4|3610||
DINERA|Plate|beige, 10 1/4 "|3.99|4.6|1240||
GODMIDDAG|Plate|white, 10 5/8 "|4.99|4.5|302|N|
IKEA 365+|Bowl|white, 6 "|2.99|4.6|1802||
OFTAST|Bowl|white, 6 "|0.79|4.4|2905||
# drinkware-18868
@ cup
POKAL|Glass|clear glass, 12 oz|0.99|4.5|3802||
IKEA 365+|Glass|clear glass, 15 oz|1.99|4.6|2104||
STORSINT|Wine glass|clear glass, 12 oz, 6 pack|12.99|4.6|1503||
FÄRGRIK|Mug|white, 9 oz|1.99|4.4|3901||
VARDAGEN|Mug|off-white, 12 oz|3.99|4.6|1102||
# flatware-18865
@ utensil
DRAGON|20-piece flatware set|stainless steel|19.99|4.7|4702||
MOPSIG|16-piece flatware set|stainless steel|9.99|4.3|1801||
ÄTBART|Flatware set, 16 pieces|stainless steel/black|24.99|4.5|203|N|
# cookware-kt003
@ pan
IKEA 365+|Saucepan with lid|stainless steel, 3 qt|24.99|4.6|1503||
VARDAGEN|Frying pan|cast iron, 11 "|24.99|4.6|2402||
KAVALKAD|Frying pan, set of 2|black, 7 "/11 "|9.99|4.3|6310||
OUMBÄRLIG|7-piece cookware set|stainless steel|59.99|4.4|1208||
ANNONS|5-piece cookware set|stainless steel|29.99|4.4|2802||
HEMKOMST|Pot with lid|stainless steel/glass, 5 qt|29.99|4.6|1002||
TAGGHAJ|Frying pan|stainless steel/non-stick coating, 11 "|29.99|4.4|130|N|
MIDDAGSMAT|Pot with lid|glass/stainless steel, 5 qt|34.99|4.5|604||
# food-storage-organizing-15937
@ jar
KORKEN|Jar with lid|clear glass, 34 oz|2.99|4.7|7820||
IKEA 365+|Food container with lid|rectangular glass/plastic, 34 oz|5.99|4.6|3402||
PRUTA|Food container, set of 17|transparent/green|4.99|4.3|6205||
ISTAD|Resealable bag|patterned/green, 60 pack|2.99|4.5|4002||
BURKEN|Jar with lid|clear glass, 13 oz|1.99|4.6|1902||
HÅLLBAR|Bin with lid|light gray, 5 gallon|11.99|4.5|1206||
# knives-chopping-boards-15934
@ utensil
IKEA 365+|Chef's knife|stainless steel, 8 "|19.99|4.6|2102||
VÖRDA|Paring knife|black, 3 1/2 "|7.99|4.5|1501||
LEGITIM|Chopping board|white, 13 3/4x9 1/2 "|1.99|4.4|5602||
PROPPMÄTT|Chopping board|beech, 17 3/4x11 3/4 "|14.99|4.7|2380||
# coffee-tea-16044
@ jar
UPPHETTA|Coffee/tea maker|glass/stainless steel, 34 oz|14.99|4.6|3205||
METALLISK|Espresso maker|stainless steel, 2 cups|24.99|4.4|1402||
# cooking-baking-utensils-kt002
@ utensil
KONCIS|Roasting pan with grill rack|stainless steel, 16x13 "|19.99|4.6|1105||
VARDAGEN|Rolling pin|beech, 17 3/4 "|5.99|4.7|802||
GNARP|3-piece kitchen utensil set|black|7.99|4.4|1903||
# bakeware-20636
@ pan
VARDAGEN|Baking tray|stainless steel, 15x12 1/2 "|9.99|4.5|1004||
DRÖMMAR|Springform pan|gray, 9 "|9.99|4.4|880||
# kids-kitchenware-tableware-18714
@ bowl
KALAS|36-piece set|mixed colors|9.99|4.8|3611||
SMASKA|Bowl|bright green/yellow/turquoise, 4 pack|4.99|4.6|702||
# mirrors-20489
@ mirror
LINDBYN|Mirror|black, 23 5/8x47 1/4 "|79.99|4.6|1803||
NISSEDAL|Mirror|white, 25 5/8x25 5/8 "|29.99|4.5|2402||
HOVET|Mirror|aluminum, 30 3/4x76 3/4 "|199.00|4.6|1108||
STAVE|Mirror|white, 27 1/2x63 "|69.99|4.4|1730||
IKORNNES|Floor mirror|ash, 20 1/2x65 "|149.00|4.5|604||
TOFTBYN|Mirror|white, 20 1/2x55 1/8 "|99.99|4.5|820||
LETTAN|Mirror|31 1/2x37 3/4 "|39.99|4.6|1602||
# wall-decor-10757
@ mirror
RIBBA|Frame|black, 19 3/4x27 1/2 "|17.99|4.6|4505||
FISKBO|Frame|white, 8x10 "|2.99|4.4|5130||
KNOPPÄNG|Frame|black, 12x16 "|6.99|4.5|1204||
LOMVIKEN|Frame|gold color, 8x10 "|6.99|4.6|1102||
BILD|Poster|Boat on the lake, 19 3/4x27 1/2 "|9.99|4.6|302|N|
# plants-flowers-pp003
@ vase
FEJKA|Artificial potted plant|in/outdoor/Monstera, 4 3/4 "|14.99|4.5|2830||
FEJKA|Artificial potted plant|in/outdoor/hanging/ivy, 4 3/4 "|9.99|4.4|1503||
MONSTERA DELICIOSA|Potted plant|Swiss cheese plant, 6 "|19.99|4.4|604||
# flower-pots-stands-pp004
@ vase
SKURAR|Plant pot|in/outdoor off-white, 4 1/2 "|4.99|4.6|2601||
NYPON|Plant pot|in/outdoor/white, 4 3/4 "|1.99|4.5|3502||
MUSKOTNÖT|Plant pot|in/outdoor/dark gray, 9 "|19.99|4.5|302|N|
SATSUMAS|Plant stand|bamboo/white, 30 3/4 "|29.99|4.6|1605||
# candle-holders-candles-10760
@ jar
FENOMEN|Unscented block candle, set of 5|natural|7.99|4.6|2402||
SINNLIG|Scented candle in glass|Sweet vanilla/natural, 40 hr|2.99|4.5|6103||
GLIMMA|Unscented tealight|100 pack|5.99|4.7|7801||
LJUSFRID|Scented candle in glass|Fresh grass/light green, 25 hr|4.99|4.5|204|N|
# vases-bowls-10769
@ vase
VILJESTARK|Vase|clear glass, 6 3/4 "|3.99|4.7|2902||
KONSTFULL|Vase|light beige, 7 "|9.99|4.5|420|N|
TIDVATTEN|Vase|clear glass/bright green, 10 1/4 "|14.99|4.6|230||
BERÄKNA|Vase|clear glass, 7 1/2 "|7.99|4.6|1402||
# clocks-10759
@ clock
TROMMA|Wall clock|low-voltage/white, 9 3/4 "|4.99|4.4|2703||
KLOCKIS|Clock/thermometer/alarm/timer|black|5.99|4.4|3102||
# home-fragrance-42926
@ jar
SINNLIG|Scented sticks|Sweet vanilla/natural, 3 1/2 oz|9.99|4.4|902||
# baby-bc002
@ bed
SUNDVIK|Crib|white, 27 1/2x52 "|199.00|4.6|2104||
GONATT|Crib|white, 28x52 "|149.00|4.5|703||
SNIGLAR|Crib|beech, 27 1/2x52 "|99.99|4.4|2702||
SMÅGÖRA|Crib|white, 27 1/2x52 "|119.00|4.5|1206||
SUNDVIK|Changing table/chest of drawers|white, 31 1/2x49 5/8 "|229.00|4.6|606||
LEN|Fitted sheet for crib|white, 28x52 "|7.99|4.6|1903||
SKÖTSAM|Changing pad|white, 32 1/4x21 5/8 "|14.99|4.7|2002||
# kids-bc003
@ toy
BLÅHAJ|Soft toy|baby shark, 39 "|29.99|4.9|14520||303.735.88
BLÅHAJ|Soft toy|baby shark, 22 "|19.99|4.9|9804||
DJUNGELSKOG|Soft toy|brown bear|19.99|4.8|3402||
DUKTIG|Play kitchen|birch|149.00|4.7|2108||
MÅLA|Easel|softwood/white|34.99|4.7|2603||
FLISAT|Book display|30 3/4x45 5/8 "|49.99|4.7|1404||
MINNEN|Extendable bed frame|white, 38x74 3/4 "|199.00|4.6|1602||
SLÄKT|Bed frame w storage+slatted bedbase|white, Twin|349.00|4.5|560||
LUSTIGT|Doll's house|white|59.99|4.6|302|N|
SAGOSKATT|Soft toy|drawn by children|7.99|4.7|260|N|
# kids-storage-organization-18706
@ basket
TROFAST|Storage box|white, 16 1/2x11 3/4x9 "|5.99|4.7|3102||
KUGGIS|Box with lid|white, 10 1/4x13 3/4x6 "|9.99|4.6|2201||
# storage-boxes-baskets-10550
@ basket
SKUBB|Box, set of 6|white|12.99|4.5|5612||
SAMLA|Box with lid|transparent, 17 gallon|10.99|4.6|6302||
DRÖNA|Box|black, 13x15x13 "|3.99|4.5|5103||
KVARNVIK|Box with lid|gray, 12 1/2x13 3/4x12 1/2 "|14.99|4.5|1102||
FJÄLLA|Storage box with lid|dark gray, 10 1/4x14 1/4x7 7/8 "|14.99|4.5|902||
BRANÄS|Basket|rattan, 12 1/2x13 1/2x12 1/2 "|19.99|4.6|1606||
KNARRBO|Basket|black, 10 1/2x13 3/4x7 7/8 "|9.99|4.4|604||
TJENA|Storage box with lid|black, 7x9 3/4x5 7/8 "|3.99|4.5|3202||
STUK|Organizer with 6 compartments|white, 7x11 3/4x4 "|7.99|4.5|1803||
# clothes-organizers-10452
@ stand
MULIG|Clothes rack|white, 39 3/8x18 1/8 "|9.99|4.4|7202||
BUMERANG|Hanger|natural, 8 pack|5.99|4.6|4302||
SKUBB|Shoe organizer|white, 8 7/8x5 7/8x49 5/8 "|7.99|4.4|1902||
# bathroom-vanities-20719
@ shelf
GODMORGON / TOLKEN|Sink cabinet with 2 drawers|white/white marble effect, 32 3/8x19 1/4 "|599.00|4.5|402||
HEMNES / ODENSVIK|Sink cabinet with 2 drawers|white, 32 5/8x19 1/4x35 3/8 "|449.00|4.6|1004||
ENHET|Sink cabinet with 2 drawers|white, 31 1/2x16 1/2 "|229.00|4.4|310||
# bathroom-mirrors-20490
@ mirror
LILLÅNGEN|Mirror cabinet|white, 15 3/4x8 1/4x25 1/4 "|79.99|4.4|1503||
NYSJÖN|Mirror cabinet|white, 19 5/8x23 5/8 "|69.99|4.3|603||
# bathroom-accessories-10555
@ jar
EKOLN|Soap dispenser|beige|5.99|4.5|2902||
RÅGRUND|Shelving unit|bamboo, 13 3/8x11 3/4x39 3/4 "|49.99|4.7|2403||
TOFTAN|Wastebin|white, 1 gallon|3.99|4.6|3802||
BROGRUND|Toilet roll holder|stainless steel|14.99|4.6|1103||
VOXNAN|Shower curtain rod|chrome effect, 47-79 "|19.99|4.4|1702||
BJÄRSEN|Shower curtain|white, 71x71 "|9.99|4.3|1102||
# outdoor-patio-furniture-od003
@ table
ÄPPLARÖ|Table and 4 armchairs|brown stained/Frösön/Duvholmen beige, outdoor|749.00|4.4|402||
NÄMMARÖ|Table, outdoor|light brown stained, 29 1/8 "|179.00|4.5|160||
TORPARÖ|Table+2 folding chairs, outdoor|white|129.00|4.3|604||
FALHOLMEN|Armchair, outdoor|light brown stained|99.99|4.4|302||
SOLLERÖN|3-seat modular sofa, outdoor|dark gray/Frösön/Duvholmen beige|1150.00|4.5|209||
JÄRPÖN|Armchair, outdoor|white/Duvholmen anthracite|249.00|4.4|120|N|
# umbrellas-gazebos-17887
@ lamp
BETSÖ / LINDÖJA|Umbrella|gray wood effect/beige, 70 7/8 "|99.99|4.3|403||
# outdoor-flooring-21957
@ textile
RUNNEN|Floor decking, outdoor|brown, 9 pack/9.9 sq feet|29.99|4.4|2102||
# curtains-10700
@ curtain
MERETE|Curtains, 1 pair|white, 57x98 "|39.99|4.5|3201||
HILJA|Curtains, 1 pair|white, 57x98 "|19.99|4.4|4103||
RITVA|Curtains with tie-backs, 1 pair|white, 57x98 "|29.99|4.5|2702||
LILL|Sheer curtains, 1 pair|white, 110x98 "|4.99|4.3|6302||
MAJGULL|Room darkening curtains, 1 pair|gray, 57x98 "|34.99|4.4|1602||
SANELA|Room darkening curtains, 1 pair|dark green, 55x98 "|79.99|4.7|1402||
DYTÅG|Curtains, 1 pair|white, 57x98 "|29.99|4.5|402|N|
# blinds-10701
@ curtain
FRIDANS|Block-out roller blind|gray, 34x76 3/4 "|34.99|4.1|1803||
TRIPPEVALS|Block-out roller blind|light gray, 34x76 3/4 "|59.99|4.4|302||
SCHOTTIS|Pleated blind|white, 39x74 3/4 "|5.99|4.0|4602||
# curtain-rods-rails-18891
@ utensil
RÄCKA|Curtain rod|silver color, 47-82 "|12.99|4.5|2502||
HUGAD|Curtain rod|black, 47-82 "|9.99|4.4|2902||
BETYDLIG|Curtain rod holder|black|2.99|4.6|3102||
# watering-cans-20493
@ jar
VATTENKRASSE|Watering can|galvanized/gold color, 30 oz|12.99|4.6|1802||
# plant-stands-movers-20494
@ stand
OLIVBLAD|Plant stand|in/outdoor/black, 13 3/4 "|24.99|4.5|402||
# laundry-baskets-20601
@ basket
TORKIS|Flexible laundry basket|in/outdoor/blue, 9 gallon|5.99|4.5|4103||
FLADIS|Basket|seagrass, 6 3/4 gallon|19.99|4.6|702||
JÄLL|Laundry bag with stand|black, 13 gallon|9.99|4.4|2401||
# drying-racks-20602
@ stand
MULIG|Drying rack|in/outdoor/white|12.99|4.4|3302||
ANTONIUS|Drying rack|white|19.99|4.5|1702||
FROST|Drying rack, 16|galvanized|2.99|4.4|1204||
# cleaning-accessories-20609
@ brush
PEPPRIG|Mop|gray/green|8.99|4.4|2103||
PEPPRIG|Dust pan and brush|gray/green|3.99|4.5|1402||
PEPPRIG|Microfiber cloth|4 pack|2.99|4.6|3701||
# bins-bags-16213
@ basket
SORTERA|Waste sorting bin with lid|white, 9 gallon|14.99|4.6|2802||
HÅLLBAR|Waste sorting solution|light gray, 11 gallon|39.99|4.5|603||
FILUR|Bin with lid|white, 11 gallon|9.99|4.3|1802||
# ironing-boards-20608
@ table
LAGT|Ironing board|21 1/2x11 3/4 "|5.99|4.0|1802||
# meat-25217
@ food
KÖTTBULLAR|Meatballs, frozen|beef and pork, 2 lb|11.99|4.7|4806||
HUVUDROLL|Plant balls, frozen|plant-based, 1 lb|5.99|4.4|2402||
HUVUDROLL|Chicken meatballs, frozen|1 lb 2 oz|7.99|4.5|1205||
# condiments-cheese-jams-25216
@ food
SYLT LINGON|Lingonberry jam, organic|14 oz|5.49|4.8|3602||
SÅS GRÄDDSÅS|Cream sauce mix|1 oz|1.49|4.7|2902||
# snacks-sweets-46192
@ food
CHOKLAD MÖRK|Dark chocolate bar 60%|Rainforest Alliance Certified, 3.5 oz|2.49|4.7|1803||
KAKA MANDEL|Almond cake, frozen|14 oz|6.99|4.8|2203||
DRÖMMAR|Dream cookies|7.8 oz|4.49|4.6|702||
# bread-dairy-25212
@ food
KNÄCKEBRÖD RÅG|Crispbread, rye|7 oz|2.99|4.6|1402||
# fish-seafood-25214
@ food
SJÖRAPPORT|Gravad salmon, frozen|ASC certified, 7 oz|9.99|4.4|302||
# beverages-25211
@ food
PÅTÅR|Coffee, dark roast|organic/UTZ certified/100% Arabica beans, 8.8 oz|5.99|4.6|1901||
DRYCK FLÄDER|Elderflower drink|syrup, 16.9 oz|4.99|4.7|1203||
# speakers-40842
@ speaker
VAPPEBY|Portable bluetooth speaker|black/gen 2|39.99|4.4|1203||
SYMFONISK|Bookshelf speaker with Wi-Fi|black/gen 2|119.00|4.6|1802||
SYMFONISK|Speaker lamp base with WiFi|black|179.00|4.5|902||
NYSKÖLJD|Bluetooth speaker|black|49.99|4.5|160|N|
# cords-chargers-40845
@ cable
LILLHULT|USB-C to USB-C cable|dark gray, 4 '|5.99|4.5|1402||
SJÖSS|USB charger, 1 port, 20W|white|9.99|4.5|1602||
LIVBOJ|Wireless charger|white|19.99|4.3|1803||
# cable-management-accessories-16195
@ basket
SIGNUM|Cable management, horizontal|silver color, 27 1/2 "|14.99|4.6|2302||
UPPDATERA|Box with lid|white, 12 1/2x7 1/8x4 3/4 "|9.99|4.6|602||
# air-quality-products-49081
@ appliance
STARKVIND|Air purifier|white|149.00|4.4|1202||
FÖRNUFTIG|Air purifier|black|79.99|4.4|3102||
UPPÅTVIND|Air purifier|white|69.99|4.5|1102||
VINDSTYRKA|Air quality sensor|smart|39.99|4.3|402||
# smart-light-wireless-switch-36814
@ appliance
DIRIGERA|Hub for smart products|white/smart|69.99|4.2|1503||
VALLHORN|Wireless motion sensor|smart|14.99|4.4|803||
PARASOLL|Door/window sensor|smart white|9.99|4.3|602||
RODRET|Wireless dimmer/power switch|white|7.99|4.4|803||
INSPELNING|Plug with energy monitor|smart|9.99|4.4|302|N|
# smart-air-purifiers-56472
@ appliance
STARKVIND|Air purifier table|black/smart, 21 1/4x21 1/4 "|299.00|4.5|402||
# tools-hardware-16292
@ utensil
FIXA|17-piece tool kit|black|19.99|4.5|3102||
TRIXIG|Bit and screwdriver set, 67 pieces|black|12.99|4.6|1302||
FIXA|Cordless drill/driver|lithium-ion/3.6 V|29.99|4.2|1802||
# safety-products-sp001
@ utensil
PATRULL|Wall anchor|white, 2 pack|3.99|4.5|1102||
PATRULL|Safety lock|white, 2 pack|3.99|4.2|2302||
# moving-supplies-46078
@ basket
FRAKTA|Shopping bag, large|blue, 19 gallon|0.99|4.8|15210||
DIMPA|Storage bag|transparent, 25 1/2x8 3/4x25 1/2 "|4.99|4.4|2101||
# cats-39569
@ pet-house
LURVIG|Cat house on legs|white/black|39.99|4.6|1502||
LURVIG|Scratching pad|beige|9.99|4.5|1102||
UTSÅDD|Pet bed|light gray, 20 7/8 "|19.99|4.6|402|N|
# dogs-39570
@ bowl
LURVIG|Bowl with mat|black/stainless steel|9.99|4.6|1802||
LURVIG|Bed|black, 39 3/8x26 3/8 "|34.99|4.4|803||
# winter-decoration-49149
@ vase
VINTERFINT|Decoration bauble|mixed colors, 12 pack|7.99|4.5|902|N|
VINTERFEST|Decorative figurine|reindeer/natural|9.99|4.6|402|N|
STRÅLA|Lamp shade|star/red, 27 1/2 "|14.99|4.6|1802||
# winter-lights-49150
@ lamp
STRÅLA|LED string light with 24 lights|battery-operated/star, 15 '|9.99|4.4|1203||
# winter-textiles-49152
@ textile
VINTERFINT|Cushion cover|white/red, 20x20 "|9.99|4.6|304|N|
# winter-tableware-49153
@ plate
VINTERFINT|Plate|white/green, 7 3/4 "|2.99|4.6|210|N|
# paper-shop-25227
@ basket
VINTERFINT|Gift wrap roll|Christmas tree pattern/red, 9 '|4.99|4.5|302|N|
`
