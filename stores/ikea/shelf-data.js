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
VINTERFINT|Gift bag|red/white, 13 3/4x4 3/4x15 "|1.99|4.6|418|N|
VINTERFINT|Gift box|set of 3, gold color|5.99|4.5|236|N|
VINTERFINT|Ribbon|red, 33 '|1.99|4.4|151|N|
# winter-lights-49150
@ lamp
STRÅLA|Table lamp|star/brass color, 13 3/4 "|24.99|4.6|507|N|
VINTERFINT|LED string light with 40 lights|battery-operated/white, 13 '|12.99|4.5|388|N|
STRÅLA|LED decorative light|battery-operated/star, 14 1/2 "|14.99|4.6|902||
VINTERFINT|LED decorative lighting|battery-operated/Christmas tree, 9 "|9.99|4.4|214|N|
# winter-textiles-49152
@ textile
VINTERFINT|Table runner|white/red, 14x51 "|9.99|4.5|188|N|
VINTERFINT|Throw|red/white, 47x67 "|19.99|4.7|261|N|
VINTERFINT|Dish towel|red/white, 20x26 ", 2 pack|3.99|4.6|143|N|
# winter-tableware-49153
@ plate
VINTERFINT|Mug|white/red, 10 oz|3.99|4.6|322|N|
VINTERFINT|Serving plate|white/red, 12 1/2 "|9.99|4.5|117|N|
VINTERFINT|Napkin|red, 13x13 ", 30 pack|1.99|4.4|408|N|
# winter-pots-plants-49151
@ vase
EUPHORBIA PULCHERRIMA|Potted plant|poinsettia, red, 4 3/4 "|9.99|4.3|612|N|
PICEA GLAUCA|Potted plant|white spruce, 6 "|14.99|4.4|286|N|
VINTERFINT|Plant pot|in/outdoor/red, 4 3/4 "|5.99|4.5|197|N|
SMYCKA|Artificial plant|in/outdoor/Christmas tree, 59 "|79.99|4.4|724|L99.99|
FEJKA|Artificial potted plant|in/outdoor/amaryllis, 4 3/4 "|12.99|4.5|318||
# holiday-foods-49227
@ food
PEPPARKAKOR|Ginger thins|5.3 oz|2.49|4.8|3104||
GLÖGG|Non-alcoholic mulled wine|25.4 oz|6.99|4.7|1402||
SAFFRANSBULLAR|Saffron buns, frozen|7.1 oz|4.99|4.5|206|N|
JULSKUM|Christmas marshmallows|3.5 oz|1.99|4.6|318|N|
SILL MATJES|Matjes herring|8 oz|4.49|4.5|402||
KNÄCK|Swedish toffee|5.3 oz|3.99|4.6|151|N|
# winter-cooking-baking-49154
@ utensil
VINTERFINT|Cookie cutter|set of 4, stainless steel|4.99|4.6|402|N|
VARDAGEN|Rolling pin|beech|7.99|4.7|1602||
VINTERFINT|Baking mat|silicone/red, 11 3/4x15 3/4 "|5.99|4.4|188|N|
UPPFYLLD|Baking spatula|silicone, 2 pack|3.99|4.6|1007||
# storage-solution-systems-46052
@ shelf
BOAXEL|4 sections|white, 65 3/4x15 3/4x79 1/2 "|169.00|4.7|1206|L199.00|
PLATSA|Wardrobe with 2 doors|white/Fonnes white, 31 1/2x22 3/4x47 1/4 "|175.00|4.5|402||
ELVARLI|2 sections|white, 49 1/4x20x87 3/4-137 3/4 "|274.00|4.7|611||
JONAXEL|Storage combination|white, 39 3/4x20x41 3/4 "|59.99|4.5|1103||
PAX / FORSAND|Wardrobe combination|white/white, 59x23 5/8x79 1/4 "|540.00|4.6|1984||
# garage-storage-700440
@ shelf
BROR|Shelving unit with cabinets|black, 33 1/4x15 3/4x74 3/4 "|334.00|4.7|318||
BROR|Workbench|black/pine plywood, 43 1/4x21 5/8 "|169.00|4.7|402||
BROR|Cabinet|black, 33 1/4x15 3/4 "|149.00|4.6|207||
HEJNE|1 section|softwood, 30 3/4x19 5/8x67 3/8 "|50.00|4.6|1802|F45.00|
SKÅDIS|Pegboard combination|white, 30x22 "|42.99|4.7|904|F37.99|
# outdoor-organizing-21958
@ shelf
TOSTERÖ|Storage box, outdoor|black, 50 3/8x31 1/2x37 3/4 "|229.00|4.3|412||
TJUSIG|Shoe rack|in/outdoor/white, 31 1/8x23 5/8 "|29.99|4.6|1102||
HYLLIS|Shelving unit with cover|transparent, 23 5/8x10 5/8x55 1/2 "|24.99|4.3|703||
TOSTERÖ|Cover for outdoor furniture|black, 48 3/8x46 1/2 "|49.99|4.4|206||
# room-dividers-46080
@ shelf
RISÖR|Room divider|white, 35 7/8x63 "|49.99|4.3|306||
TYSSEDAL|Room divider|white/glass, 35 7/8x63 "|249.00|4.6|88||
KALLAX|Shelf unit with 4 inserts|white, 57 7/8x57 7/8 "|229.00|4.7|612||
VITTSJÖ|Shelf unit|white/glass, 39 3/8x68 7/8 "|99.99|4.5|902||
# hallway-furniture-sets-700411
@ shelf
HEMNES|Coat rack with 4 hooks|white stain, 33 1/2 "|59.99|4.6|1103||
TJUSIG|Bench with shoe storage|black, 31 7/8x19 5/8 "|79.99|4.6|1402||
STÄLL|Shoe cabinet with 4 compartments|white, 37 3/8x11 3/4x50 3/8 "|159.00|4.4|3002|L179.00|
BISSA|Shoe cabinet with 2 compartments|white, 19 1/4x11x36 5/8 "|29.99|4.3|4206||
MACKAPÄR|Coat rack with shoe storage unit|white, 30 3/4x13 3/4x76 3/8 "|99.99|4.5|1802||
# storage-cabinets-10385
@ shelf
ALEX|Drawer unit on casters|white, 26 3/8x18 7/8 "|119.00|4.6|1802|L139.00|
ERIK|File cabinet|white, 16 1/8x25 5/8 "|149.00|4.5|402||
GALANT|Drawer unit|white, 17 3/4x31 1/2 "|249.00|4.4|103||
HELMER|Drawer unit on casters|white, 11x27 1/8 "|69.99|4.6|2701||
IDÅSEN|Cabinet with doors and drawers|beige, 16 1/2x46 1/2 "|299.00|4.6|306||
# chaise-lounges-57527
@ chair
EKTORP|Chaise|Hallarp gray|499.00|4.4|206||
FRIHETEN|Sleeper sectional, 3 seat w/storage|Hyllie dark gray|899.00|4.4|3102|L999.00|
VIMLE|Chaise|Hallarp beige|449.00|4.5|402||
KIVIK|Chaise|Tresund light beige|649.00|4.6|318|L699.00|
LIDHULT|Chaise|Gassebol light beige|1099.00|4.5|112||
# sofa-cushions-57536
@ textile
SÖDERHAMN|Back cushion|Tonerud gray, 39 3/8x6 1/4 "|50.00|4.5|186||
VIMLE|Headrest|Hallarp beige|40.00|4.4|206||
KIVIK|Back cushion|Tresund light beige|45.00|4.4|98||
LANDSKRONA|Seat cushion|Gunnared dark gray|75.00|4.3|64||
# sofa-legs-31785
@ table
NOLMYRA|Leg|birch veneer, 4 pack|25.00|4.5|113||
BJÖRKBACKA|Leg|birch, 4 3/8 ", 4 pack|20.00|4.6|412||
STOCKSUND|Leg|black/wood, 4 pack|30.00|4.4|87||
VIMLE|Leg|light brown, 4 pack|25.00|4.5|208||
# sofa-covers-10664
@ textile
EKTORP|Cover for sofa|Hallarp gray|149.00|4.4|1903|F129.00|
KLIPPAN|Cover for loveseat|Vissle gray|59.99|4.3|1206||
KIVIK|Cover for sofa|Tibbleby beige/gray|199.00|4.5|402||
VIMLE|Cover for 3-seat sofa|Gunnared beige|199.00|4.4|318||
POÄNG|Armchair cushion|Knisa light beige|49.99|4.5|2307|L59.99|
# sofa-modules-31786
@ chair
VIMLE|Seat section|Hallarp beige|299.00|4.5|402||
SÖDERHAMN|Seat section|Tonerud gray|250.00|4.4|706||
JÄTTEBO|1-seat module with armrest|Samsala dark yellow-green|399.00|4.6|138|N|
KIVIK|Corner section|Tresund light beige|449.00|4.5|206||
FRIHETEN|Corner sofa-bed with storage|Skiftebo dark gray|999.00|4.4|1803||
# bedroom-furniture-sets-54992
@ bed
HEMNES|Bedroom furniture, set of 4|white stain, Full|1124.00|4.6|106||
MALM|Bedroom furniture, set of 3|white, Queen|588.99|4.5|212||
BRIMNES|Bedroom furniture, set of 3|white, Full|478.00|4.4|88||
SONGESAND|Bedroom furniture, set of 4|white, Queen|826.00|4.4|76||
# beds-with-mattresses-included-700513
@ bed
MALM|Bed frame with mattress|white/Åbygda firm, Queen|478.00|4.4|412|L528.00|
NEIDEN|Bed frame with mattress|pine/Åbygda firm, Twin|188.00|4.5|604||
TARVA|Bed frame with mattress|pine/Valevåg firm, Full|478.00|4.5|208||
SLATTUM|Upholstered bed frame with mattress|Vissle dark gray/Åbygda firm, Queen|328.00|4.4|302||
# headboards-19064
@ bed
GLADSTAD|Headboard|Kabusa gray, Queen|99.00|4.4|204||
SAGESUND|Headboard|black, Queen|99.00|4.5|112||
TUFJORD|Headboard|Tallmyra white/black, Queen|149.00|4.5|76|N|
VADHEIM|Headboard|dark gray, Queen|79.99|4.3|188||
# bed-slats-24827
@ bed
LURÖY|Slatted bed base|Queen|44.99|4.4|3803||
LÖNSET|Slatted bed base|Queen|99.00|4.5|1206||
LINDBÅDEN|Slatted bed base|Full|69.99|4.4|302||
# mattress-bases-24825
@ bed
LYNGÖR|Slatted mattress base with legs|Queen|299.00|4.5|604||
ESPEVÄR|Slatted mattress base|white, Queen|249.00|4.5|402||
LÖNSET|Slatted bed base|Twin|79.99|4.5|406||
# bed-headboard-covers-57280
@ textile
SLATTUM|Cover for headboard|Vissle dark gray, Queen|49.99|4.4|112||
GLADSTAD|Cover for upholstered bed frame|Kabusa gray, Queen|79.99|4.2|64||
HAUGA|Cover for upholstered bed frame|Vissle gray, Queen|69.99|4.3|86||
# bed-legs-24822
@ table
SULTAN|Legs|birch, 7 7/8 "|20.00|4.6|602||
BURFJORD|Leg|black, 7 7/8 ", 4 pack|25.00|4.5|208||
FLOKENES|Legs|birch, 7 7/8 "|15.00|4.4|117||
# integrated-lighting-16280
@ lamp
MITTLED|LED kitchen countertop lighting strip|dimmable white, 15 3/4 "|14.99|4.4|1803|F12.99|
SKYDRAG|LED kitchen countertop/cabinet light strip|smart dimmable/white spectrum, 15 3/4 "|24.99|4.5|902||
STÖTTA|LED cabinet lighting strip with sensor|battery-operated white, 12 1/2 "|12.99|4.2|2103||
OMLOPP|LED countertop light|aluminum color, 15 3/4 "|29.99|4.4|204||
# bathroom-lighting-10736
@ lamp
STORJORM|Mirror with integrated lighting|white, 23 5/8x31 1/2 "|179.00|4.4|302||
TÄLLBYN|Wall lamp with outlet|bronze color/opal white glass|59.99|4.6|408|L69.99|
VARNEBY|Wall lamp|smoked glass|69.99|4.7|102||
SVALLIS|Ceiling lamp|white|19.99|4.4|604||
# ceiling-fans-700600
@ lamp
SÅRLI|Ceiling fan with lights|white, 50 "|119.00|4.3|206|L139.00|
SKAFTVIND|Ceiling fan with light|white, 50 "|99.99|4.2|318||
# kitchen-cabinets-700292
@ shelf
METOD|Base cabinet frame|white, 24x24x30 "|64.00|4.6|1206||
METOD|Wall cabinet frame|white, 30x15x30 "|55.00|4.6|1103||
SEKTION|High cabinet frame|white, 24x24x90 "|175.00|4.6|604||
ENHET|Base cabinet with shelf|white, 23 5/8x24 3/4x29 1/2 "|80.00|4.4|318||
KNOXHULT|Base cabinet with doors and drawer|white, 47 1/4 "|199.00|4.2|1603||
# kitchen-doors-drawer-fronts-700293
@ shelf
VOXTORP|Door|matte white, 15x30 "|35.00|4.6|412||
AXSTAD|Door|matte white, 18x30 "|30.00|4.5|604||
UPPLÖV|Door|matte anthracite, 18x30 "|45.00|4.6|206||
BODARP|Door|gray-green, 15x30 "|35.00|4.6|318||
STENSUND|Drawer front|beige, 30x10 "|35.00|4.5|112||
# interior-fittings-24255
@ basket
MAXIMERA|Drawer divider for drawer|transparent|5.00|4.4|604||
VARIERA|Shelf insert|white, 12 5/8x5 7/8 "|4.99|4.6|3102||
UPPDATERA|Utensil tray|bamboo light, 12 5/8x19 3/4 "|14.99|4.6|402||
AVSKILJA|Drawer divider|bamboo, 12 5/8 "|9.99|4.5|188||
# kitchen-pantry-storage-16200
@ shelf
HEJNE|2 sections/shelves|softwood, 30 3/4x19 5/8x67 3/8 "|80.00|4.6|904||
OMAR|1 section shelving unit|galvanized, 36 1/4x18 1/8x71 1/4 "|69.99|4.7|502||
JOSTEIN|Shelving unit|in/outdoor/wire white, 24x16 1/8x35 3/8 "|44.99|4.4|206||
BROR|Shelving unit|black, 33 1/4x21 5/8x74 3/4 "|149.00|4.7|318||
# modular-kitchens-22957
@ shelf
KNOXHULT|Kitchen|white, 72x24 3/4x86 5/8 "|654.00|4.1|318|L704.00|
SUNNERSTA|Mini-kitchen|42 1/2x22 7/8x54 3/4 "|229.00|4.3|604||
ENHET|Kitchen|white, 76 3/8x24 3/4x87 "|1155.00|4.4|112||
# kitchen-lighting-16282
@ lamp
MITTLED|LED kitchen countertop lighting strip|dimmable white, 23 5/8 "|19.99|4.4|908||
NYMÅNE|Pendant lamp|anthracite, 15 "|39.99|4.5|1203||
RANARP|Pendant lamp|black, 9 "|49.99|4.6|1802||
# sektion-cabinet-shelves-and-drawers-49117
@ basket
MAXIMERA|Drawer, low|white, 24x24 "|30.00|4.6|1206||
MAXIMERA|Drawer, high|white, 30x24 "|50.00|4.6|904||
UTRUSTA|Shelf|white, 15x24 "|10.00|4.6|1603||
UTRUSTA|Pull-out interior fittings|24 "|80.00|4.4|118||
# table-linen-20538
@ textile
TISTELBLOMMA|Tablecloth|light beige, 57x94 "|19.99|4.5|302||
ÄNGSKLOCKA|Table runner|white/beige, 14x51 "|9.99|4.4|186||
VÅRELD|Tablecloth|white, 57x94 "|24.99|4.6|204||
FULLTALIG|Placemat|black, 14 1/8x14 1/8 "|1.99|4.4|604||
TOLKNING|Place mat|handmade palm leaf, 14 1/8 "|4.99|4.6|1802||
# kids-textiles-18730
@ textile
BARNDRÖM|Duvet cover and pillowcase|green/white, Twin|19.99|4.6|402||
VÄNKRETS|Duvet cover and pillowcase|animal pattern/multicolor, Twin|19.99|4.7|318||
BUSENKEL|Rug|cat pattern/multicolor, 39x59 "|29.99|4.6|112||
LURVIG|Throw|blue/white, 47x63 "|9.99|4.5|206||
# outdoor-cushions-17893
@ textile
FRÖSÖN/DUVHOLMEN|Seat/back cushion, outdoor|beige, 24 3/8x46 1/8 "|50.00|4.4|1203||
FRÖSÖN|Cover for seat/back cushion|outdoor beige, 24 3/8x46 1/8 "|20.00|4.4|408||
KUDDARNA|Chair cushion, outdoor|gray, 17 3/8 "|12.99|4.3|904||
HÅLLÖ|Outdoor storage bag|black, 31 1/2x22 7/8x34 5/8 "|29.99|4.5|302||
# chair-pads-20542
@ textile
JUSTINA|Chair pad|natural, 17/13x15x3 "|7.99|4.4|3802|F5.99|
ORRHAGE|Chair pad|light gray, 15x15 "|5.99|4.4|1203||
MALINDA|Chair cushion|light gray, 15 3/4/13 3/4x15 1/4x2 3/4 "|11.99|4.5|1102||
HEDVIG|Chair pad|black/white, 15 "|4.99|4.3|604||
# clothing-accessories-42925
@ textile
BLÅHAJ|Socks, 2 pairs|blue/white, S/M|9.99|4.7|402||
OBEGRÄNSAD|Tote bag|black/white, 13x16 "|9.99|4.6|206||
DRÖMSÄCK|Cap|black|9.99|4.4|88|N|
EFTERTRÄDA|T-shirt|white/print, M|9.99|4.5|146|N|
# baby-textiles-18690
@ textile
LEN|Fitted sheet for crib|white, 28x52 "|7.99|4.6|1802||
VÄNKRETS|Baby blanket|light gray, 31x39 "|14.99|4.7|402||
LENAST|Crib bumper|white, 23 5/8x66 7/8 "|19.99|4.4|302||
PLUTTIG|Muslin cloth|white, 3 pack|5.99|4.6|1206||
# fabrics-sewing-10655
@ textile
TOVAHANNA|Fabric by the yard|beige, 59 "|7.99|4.4|206||
SÅNGLÄRKA|Fabric by the yard|white/flower, 59 "|8.99|4.6|102||
SY|Sewing thread|10 pack|4.99|4.5|604||
SY|Pins and pincushion|multicolor|2.99|4.4|302||
# lumbar-support-700528
@ textile
SKÖNSTA|Lumbar cushion|dark gray|19.99|4.5|208||
GURLI|Cushion cover|beige, 26x16 "|7.99|4.6|1603||
ROSENSKÄRM|Lumbar pillow|ergonomic/gray|29.99|4.3|86||
# tables-700675
@ table
LISABO|Table|ash veneer, 55 1/8x30 3/4 "|219.00|4.6|1206||
MÖRBYLÅNGA|Table|oak veneer brown stained, 86 5/8x39 3/8 "|1199.00|4.6|302||
INGATORP|Extendable table|white, 59/84 5/8x31 1/2 "|349.00|4.6|904|L399.00|
EKEDALEN|Extendable table|white, 47 1/4/70 7/8x31 1/2 "|279.00|4.6|1802||
LACK|Side table|black-brown, 21 5/8x21 5/8 "|12.99|4.4|9604||
# benches-700319
@ table
TÄRENDÖ|Bench|black, 43 1/4 "|39.99|4.4|604||
MELLTORP|Bench|white, 43 1/4 "|59.99|4.5|302||
INGOLF|Bench|white, 42 1/2 "|149.00|4.6|204||
NORRÅKER|Bench|white birch, 40 1/8 "|99.00|4.7|302||
# bar-furniture-16244
@ chair
INGOLF|Bar stool with backrest|white, 24 3/4 "|99.99|4.5|1206|F89.99|
FRANKLIN|Bar stool with backrest, foldable|black/black, 24 3/4 "|44.99|4.3|1802||
STIG|Bar stool with backrest|black/black, 24 "|29.99|4.2|2303||
NORRÅKER|Bar table|white birch, 29 1/8 "|179.00|4.6|102||
JANINGE|Bar stool|white, 29 7/8 "|69.99|4.5|604||
# cafe-furniture-19141
@ chair
JANINGE|Chair|white|79.99|4.6|402||
TOMMARYD|Table|white, 51 1/8x27 1/2 "|179.00|4.5|112||
BERNHARD|Chair|chrome plated/Kavat white|129.00|4.4|302||
NORRARYD|Chair|black|79.99|4.4|206||
# step-stools-step-ladders-20611
@ chair
BOLMEN|Step stool|white|9.99|4.5|3804||
MÄSTERBY|Step stool|white|19.99|4.6|2802||
FORSEBY|Step stool|white|29.99|4.6|402||
TJUSIG|Step ladder, 3 steps|white|69.99|4.5|302||
BEKVÄM|Step stool|birch|39.99|4.7|2303||
# dressing-table-chairs-stools-59250
@ chair
TOSSBERG|Chair|metal black/gray|59.99|4.4|112||
DALFRED|Bar stool|black, 24-32 "|39.99|4.4|1802||
SKOGSTA|Stool|acacia, 17 3/4 "|59.99|4.6|402||
# childrens-chairs-bc004
@ chair
MAMMUT|Children's chair|in/outdoor/blue|19.99|4.6|1803||
FLISAT|Children's stool|white|19.99|4.6|1203||
STRANDMON|Children's armchair|Vibberbo black/beige|99.99|4.7|604||
SANDSBERG|Children's chair|black|14.99|4.4|206||
# mittzon-conference-meeting-tables-54173
@ table
MITTZON|Conference table|birch veneer/black, 55 1/8x42 1/8x29 1/2 "|499.00|4.6|46||
MITTZON|Conference table|walnut veneer/white, 94 1/2x47 1/4 "|899.00|4.5|22||
MITTZON|Table, round|oak veneer/white, 47 1/4 "|369.00|4.6|31||
# conference-table-chair-sets-700424
@ table
MITTZON / MÅNHULT|Table and 4 chairs|birch veneer/black, 55 1/8 "|1015.00|4.5|18||
TOMMARYD / KRYLBO|Table and 4 chairs|white/Tonerud gray, 51 1/8 "|779.00|4.4|26||
# desk-chair-sets-53249
@ table
MICKE / MILLBERGET|Desk and chair|white/Murum black|248.98|4.4|402|L278.98|
LINNMON / ADILS|Table and swivel chair|white/black|128.98|4.3|318||
LAGKAPTEN / FLINTAN|Desk and chair|white/black|229.98|4.4|206||
ALEX / ALEFJÄLL|Desk and chair|white/Glose black|418.99|4.5|112||
# conference-chairs-47068
@ chair
MÅNHULT|Conference chair|Hakebo dark gray|149.00|4.5|86||
TOSSBERG|Conference chair|metal black/gray|99.99|4.4|112||
FLINTAN|Conference chair|black|79.99|4.4|302||
# serveware-16043
@ plate
UPPLAGA|Serving platter|light gray, 12 1/4 "|9.99|4.6|402||
VARDAGEN|Serving bowl|off-white, 9 1/2 "|12.99|4.7|604|F9.99|
PROPPMÄTT|Chopping board|beech, 17 3/4x11 3/4 "|14.99|4.7|2303||
OMBONAD|Serving dish|white, 10 5/8 "|7.99|4.5|188||
BLANDA BLANK|Serving bowl|stainless steel, 8 1/4 "|5.99|4.7|3104||
# dishwashing-accessories-15938
@ brush
RINNIG|Dish drainer|white|9.99|4.4|2103||
VÄLVÅRDAD|Dish-washing brush|black|1.99|4.4|1402||
PLASTIS|Ice cube tray|turquoise|0.99|4.6|2702||
SKÄMTSAM|Sponge|gray, 6 pack|2.99|4.3|604||
ÄLMAREN|Kitchen faucet|stainless steel color|79.99|4.4|1802||
# napkins-napkin-holders-20560
@ plate
FANTASTISK|Paper napkin|white, 15 3/4x15 3/4 ", 50 pack|1.99|4.6|2302||
FANTASTISK|Paper napkin|dark gray, 50 pack|1.99|4.6|1206||
GLAD|Paper napkin|multicolor, 50 pack|2.99|4.5|302||
ENFALDIG|Napkin holder|black|4.99|4.4|206||
# picnic-outdoor-recreation-42924
@ basket
FRAKTA|Cooler bag|blue, 6 gallon|9.99|4.5|1206||
SOMMARLIV|Thermos|black, 17 oz|9.99|4.4|302||
STAMBORRE|Picnic blanket|white/green, 57x87 "|19.99|4.4|118|N|
BLÅHAJ|Water bottle|blue, 17 oz|4.99|4.6|402||
# nursing-feeding-eating-31772
@ bowl
SMÅGLI|Plate/bowl|mixed colors, 4 pack|3.99|4.6|1802||
KALAS|Mug|mixed colors, 6 pack|3.99|4.7|3104||
MATA|Bib|multicolor, 2 pack|5.99|4.5|604||
SMASKA|Bowl|mixed colors, 6 pack|4.99|4.6|1206||
# noticeboards-10574
@ mirror
SKÅDIS|Pegboard|white, 22x22 "|17.99|4.7|2804||
SVENSÅS|Memo board with pins|light gray, 17 3/4x19 3/4 "|14.99|4.5|602||
LOMMARP|Bulletin board|dark blue-green, 23 5/8x31 1/2 "|29.99|4.6|204||
DIALOG|Whiteboard/notice board|white, 15x23 5/8 "|19.99|4.4|302||
# decorative-accessories-24924
@ vase
SOMMARFLOX|Decoration|natural/shell, 4 3/4 "|5.99|4.4|112||
VILLKORLIG|Plant pot|silver color, 4 3/4 "|4.99|4.5|302||
BERÄKNA|Vase|clear glass, 6 1/4 "|5.99|4.7|902||
SKURAR|Lantern for tealight|white, 12 1/4 "|9.99|4.6|1204||
HOLMSJÖ|Decoration|gold color, 9 "|12.99|4.4|86||
# paper-media-organizers-10551
@ basket
DRÖNJÖNS|Desk organizer|white|7.99|4.5|1802||
KVISSLE|Letter tray|white|12.99|4.6|1404||
MAGNARP|Paper box|white, 9 3/4x12 5/8x4 "|7.99|4.4|402||
TJENA|Box with compartments|white, 9 3/4x13 3/4x3 7/8 "|7.99|4.6|1206||
# recycling-bins-34470
@ basket
SORTERA|Waste sorting bin with lid|white, 10 gallon|17.99|4.6|1802||
HÅLLBAR|Bin with lid|light gray, 5 gallon|9.99|4.6|402||
FÖRSAMLA|Bin|white, 2 gallon|4.99|4.4|302||
DIMPA|Waste sorting bag|transparent|4.99|4.4|2304||
# wall-shelves-hooks-st006
@ shelf
BERGSHULT / PERSHULT|Wall shelf|brown-black/white, 31 1/2x11 3/4 "|24.99|4.6|402||
MOSSLANDA|Picture ledge|white, 21 5/8 "|9.99|4.7|4604||
ÖVERSÄTT|Wall shelf|black, 31 1/2x7 7/8 "|19.99|4.4|206||
BILLY|Wall cabinet|white, 31 1/2x11x23 1/2 "|139.00|4.6|112||
KUBBIS|Rack with 7 hooks|white, 41 3/8 "|9.99|4.5|1206||
# bags-16248
@ basket
FRAKTA|Carrier bag|blue/yellow, 14 1/2 gallon|1.99|4.7|2302||
DRÖMSÄCK|Backpack|black, 4 gallon|24.99|4.5|206||
VÄRLDENS|Weekend bag|black, 8 gallon|19.99|4.4|302||
KNALLA|Shopping bag|blue/white|2.99|4.5|604||
# bathroom-systems-700450
@ shelf
ÄNGSJÖN|Wash-stand with drawers|oak effect, 32 1/4x19 1/4x31 1/2 "|459.00|4.6|112||
TÄNNFORSEN|Sink cabinet with doors|light gray-green, 32 1/4x16 7/8x24 3/4 "|469.00|4.5|86||
GODMORGON|High cabinet|white, 15 3/4x12 1/4x75 5/8 "|209.00|4.6|302||
HEMNES|High cabinet with mirror door|white, 19 1/4x12 1/4x78 3/8 "|299.00|4.7|402||
# bathroom-shelving-units-20804
@ shelf
RÅGRUND|Shelving unit|bamboo, 13 3/8x11 3/4x39 3/4 "|49.99|4.7|2403||
HEMNES|Shelf unit|white, 16 1/2x67 3/8 "|149.00|4.7|402||
BAGGEBO|Shelf unit|metal/white, 13 3/4x9 7/8x45 5/8 "|24.99|4.5|1206||
FRIHULT|Shelving unit|black, 13 3/8x11 3/4x46 1/2 "|39.99|4.4|302||
# bathroom-wall-cabinets-20808
@ mirror
HEMNES|Mirror cabinet with 1 door|white, 24 3/4x6 1/4x38 5/8 "|149.00|4.6|604|L169.00|
GODMORGON|Mirror cabinet with 2 doors|31 1/2x5 1/2x37 3/4 "|229.00|4.5|302||
FAXÄLVEN|Wall cabinet with door|white, 15 3/4x7 1/2x25 5/8 "|79.99|4.4|86||
HEMNES|Wall cabinet with glass door|white, 16 1/2x7 1/2x35 3/8 "|119.00|4.7|204||
# bathroom-faucets-20724
@ appliance
BROGRUND|Bath faucet with strainer|chrome plated|99.99|4.5|604||
DALSKÄR|Bath faucet with strainer|chrome plated|79.99|4.4|1203||
PILKÅN|Bath faucet with strainer|chrome plated|29.99|4.2|1802||
GLYPEN|Bath faucet with strainer|chrome plated|129.00|4.6|112||
# bathroom-boxes-baskets-16233
@ basket
BILLINGEN|Basket|bamboo, 13 3/4x9 7/8 "|9.99|4.6|302||
GODMORGON|Box with lid|smoked, 12 1/4x5 1/2 "|12.99|4.5|604||
NORDRANA|Basket|gray, set of 2|9.99|4.4|302||
SKUBB|Box with compartments|white|7.99|4.5|1803||
# bathroom-carts-20858
@ shelf
RÅSKOG|Utility cart|white, 13 3/4x17 3/4x30 3/4 "|39.99|4.6|9204||
BROR|Utility cart|black, 33 1/2x21 5/8 "|149.00|4.6|302||
NISSAFORS|Utility cart|black, 19 3/4x11 3/4x32 5/8 "|29.99|4.5|2102||
# bathroom-stools-benches-20859
@ chair
RÅGRUND|Chair|bamboo|39.99|4.6|402||
ASKHOLMEN|Stool, outdoor|dark brown|24.99|4.4|204||
BOLMEN|Step stool|black|9.99|4.5|1206||
# bathroom-laundry-ba003
@ basket
SLIBB|Laundry bag|white, 18 1/2 gallon|1.99|4.4|3802||
FLÄCKIG|Laundry basket with lid|gray, 21 gallon|29.99|4.5|302||
MULIG|Clothes rack|white, 39 3/8x18 1/8 "|9.99|4.4|7202||
# bathroom-sinks-20723
@ bowl
TÖRNVIKEN|Countertop wash-basin|white, 17 3/4 "|99.99|4.5|302||
TOLKEN|Countertop|white marble effect, 32 3/8x19 1/4 "|159.00|4.5|604||
ORRSJÖN|Single wash-basin|white, 24 3/8x19 1/4 "|149.00|4.6|112||
# bathroom-shelves-20615
@ shelf
BROGRUND|Wall shelf|stainless steel, 23 5/8x4 3/4 "|29.99|4.5|302||
BÄLINGEN|Wall shelf|white, 23 5/8x6 "|19.99|4.4|112||
LILLÅNGEN|Wall shelf|white, 11 3/8x10 1/4 "|29.99|4.3|86||
TISKEN|Corner shelf with suction cup|white|7.99|4.2|1402||
# bathroom-countertops-30565
@ table
TOLKEN|Countertop|bamboo, 40 1/8x19 1/4 "|149.00|4.6|302||
KASKER|Custom made countertop|white marble effect/quartz, per sq. ft|39.00|4.4|88||
# showers-40690
@ appliance
VOXNAN|Shower set with thermostatic mixer|chrome plated|249.00|4.5|402||
BROGRUND|Shower set with thermostatic mixer|chrome plated|349.00|4.6|112||
DALSKÄR|Shower head|chrome plated|19.99|4.3|604||
GLYPEN|Shower set|chrome plated|149.00|4.4|86||
# outdoor-kitchens-700349
@ shelf
GRILLSKÄR|Charcoal grill, outdoor|stainless steel|249.00|4.4|204||
GRILLSKÄR|Kitchen sink unit, outdoor|stainless steel, 33 7/8x24 "|349.00|4.5|86||
GRILLSKÄR|Side unit, outdoor|stainless steel, 33 7/8x24 "|149.00|4.5|112||
# outdoor-accessories-34203
@ textile
UTANÖ|Cushion, in/outdoor|light gray, 17 3/4 "|14.99|4.5|302||
HÄMÖ|Tablecloth, outdoor|white, 57 "|14.99|4.3|86||
TOSTERÖ|Cover for outdoor furniture|black, 57 1/8x36 5/8 "|39.99|4.4|302||
SOLVINDEN|LED solar-powered pendant lamp|outdoor/globe white, 8 "|12.99|4.4|1802||
# outdoor-pots-plants-31787
@ vase
SKURUSUNDET|Plant pot, outdoor|black, 11 3/4 "|24.99|4.5|204||
BOYSENBÄR|Plant pot|in/outdoor/light gray, 9 "|9.99|4.5|604||
SOCKER|Greenhouse|white, 17 3/4x8 5/8x13 3/4 "|29.99|4.6|1802||
TAGGSIMPA|Plant pot, outdoor|5 3/4 "|4.99|4.4|302||
# outdoor-rugs-34204
@ textile
ÖRSTED|Rug flatwoven, in/outdoor|dark gray, 6 '7"x9 '10"|99.99|4.4|302|L119.00|
FÖRSLEV|Rug flatwoven, in/outdoor|beige, 5 '3"x7 '7"|79.99|4.5|204|F69.99|
HYLLEHOLT|Rug, low pile|in/outdoor/black-beige, 6 '7"x9 '10"|119.00|4.3|112||
# sewing-accessories-14350
@ utensil
SY|Sewing kit|multicolor|4.99|4.5|1206||
TILLFÄLLE|Sewing machine|white|99.99|4.3|602||
SY|Scissors|white|3.99|4.6|402||
# window-films-accessories-700628
@ curtain
LILLEGERD|Window film|white, 18 1/8x39 3/8 "|6.99|4.3|302||
RIKTIG|Curtain hook with clip|white, 10 pack|2.99|4.5|3804||
SINGLAR|Curtain ring with clip and hook|white, 10 pack|3.99|4.5|1206||
FÄLTMAL|Curtain weight tape|white|3.99|4.4|112||
# plant-supplies-accessories-24887
@ jar
GRÖNSKA|Plant soil|8.8 lb|5.99|4.4|302||
CHIAFRÖN|Plant saucer|white, 4 3/4 "|1.99|4.4|604||
HIMALAYAMOS|Plant mister|transparent|4.99|4.3|402||
OLIVBLAD|Plant stand|in/outdoor/black, 13 3/4 "|24.99|4.5|402||
# spray-bottles-misters-700778
@ jar
HIMALAYAMOS|Plant mister|transparent|4.99|4.3|402||
TOMAT|Spray bottle|white, 17 oz|0.99|4.4|6204||
SKURNA|Plant mister|gray-blue, 10 oz|5.99|4.5|118||
# laundry-cabinets-shelving-48925
@ shelf
BOAXEL|3 sections laundry combination|white, 74 3/8x15 3/4x79 1/2 "|219.00|4.6|302||
ENHET|Wall storage combination|white, 31 1/2x11 3/4x29 1/2 "|134.00|4.5|206||
BROR|Shelving unit|black, 33 1/4x21 5/8x74 3/4 "|149.00|4.7|318||
# laundry-accessories-55004
@ stand
MULIG|Drying rack|in/outdoor/white|12.99|4.4|3302||
PRESSA|Hanging dryer with 16 clothes pegs|turquoise|3.99|4.5|5204||
JÄLL|Laundry bag|white, 13 gallon|4.99|4.4|902||
SLIBB|Laundry bag|white, 18 1/2 gallon|1.99|4.4|3802||
# side-dishes-sauces-49147
@ food
SÅS GRÄDDSÅS|Cream sauce mix|1 oz|1.49|4.7|2902||
POTATISMOS|Potato mash mix|7 oz|2.49|4.5|904||
SYLT LINGON|Lingonberry jam, organic|14 oz|5.49|4.8|3602||
SENAP|Mustard, sweet|organic, 8.8 oz|2.99|4.6|302||
# pastries-desserts-cookies-25215
@ food
KAKA CHOKLADKROKANT|Chocolate cake with almond caramel, frozen|14 oz|7.99|4.8|1802||
KANELBULLE|Cinnamon bun, frozen|8 pack|6.99|4.6|904||
KAFFEBRÖD|Swedish coffee bread, frozen|17.6 oz|5.99|4.4|302||
HAVREFLARN|Oat crisps|5.3 oz|2.49|4.7|1206||
# vegetarian-plant-based-25213
@ food
HUVUDROLL|Plant balls, frozen|plant-based, 1 lb|5.99|4.4|2402||
GRÖNSAKSBULLAR|Vegetable balls, frozen|35 oz|8.99|4.3|604||
HUVUDROLL|Plant-based hot dog|frozen, 5 pack|4.99|4.2|302||
# summer-food-53254
@ food
SILL ÖRTER|Herring in herbs and spices|8 oz|4.49|4.4|302||
DRYCK JORDGUBB|Strawberry drink|syrup, 16.9 oz|4.99|4.6|402||
LÅNGTRÄSKET|Elderflower sparkling drink|11.2 oz|1.49|4.5|204||
# mobile-tablet-accessories-40843
@ cable
UPPFRISKA|Tablet stand|birch|9.99|4.6|302||
MÖRKGRÅ|Laptop bag|dark gray, 15 "|19.99|4.4|118||
BERGENES|Holder for mobile phone/tablet|bamboo|2.99|4.5|4604||
VIVALLA|Laptop stand|in/outdoor, 13 7/8x10 3/8 "|14.99|4.4|206||
# skytta-sliding-door-system-55984
@ shelf
SKYTTA|Sliding door frame|white, 59x25 1/4 "|250.00|4.4|86||
SKYTTA / HOKKSUND|Sliding door combination|white/high-gloss light gray, 59x95 1/4 "|880.00|4.5|42||
SKYTTA / MEHAMN|Sliding door combination|white/double sided white stained oak effect, 77 1/2x92 1/8 "|1030.00|4.6|28||
# taps-700718
@ appliance
LUNDSKÄR|Kitchen faucet|chrome plated|79.99|4.4|604||
GLITTRAN|Kitchen faucet with pull-out spout|stainless steel color|119.00|4.5|402|L139.00|
ÄLMAREN|Kitchen faucet|stainless steel color|79.99|4.4|1802||
DALSKÄR|Bath faucet with strainer|chrome plated|79.99|4.4|1203||
# oils-stains-product-care-42948
@ jar
BEHANDLA|Wood treatment oil, indoor use|1/6 gallon|9.99|4.5|1802||
VÅRDA|Wood stain|brown|11.99|4.3|204||
FÖRBÄTTRA|Wood glue|2 pack|3.99|4.5|302||
# acoustic-panels-46077
@ mirror
BETSAGEN|Sound absorbing panel|felt/gray, 23 5/8x23 5/8 "|29.99|4.5|118|N|
TYTTVÄDER|Sound absorbing panel|dark gray, 15 3/4x31 1/2 "|39.99|4.4|86||
SOLBLEKT|Sound absorbing panel|beige, 23 5/8 "|24.99|4.3|46||
# outdoor-lighting-17897
@ lamp
SOLVINDEN|LED solar-powered decorative lighting chain|outdoor/globe multicolor, 24 lights|19.99|4.4|1206||
SOLVINDEN|LED solar-powered table lamp|outdoor/white, 9 "|14.99|4.5|402||
STRÅLA|LED string light with 12 lights|battery-operated/outdoor black|9.99|4.3|604||
# umbrellas-gazebos-17887
@ lamp
SVARTÖ|Umbrella|dark gray, 9 3/4 '|149.00|4.4|302||
HÖGÖN|Umbrella base|dark gray|29.99|4.4|604||
LINDÖJA|Umbrella canopy|beige, 70 7/8 "|39.99|4.3|112||
# outdoor-flooring-21957
@ textile
RUNNEN|Floor decking, outdoor|gray, 9 pack/9.9 sq feet|29.99|4.4|1102||
RUNNEN|Floor decking, outdoor|artificial grass, 9 pack/9.9 sq feet|34.99|4.3|604||
# plant-stands-movers-20494
@ stand
SATSUMAS|Plant stand with 5 plant pots|bamboo/white, 49 1/4 "|39.99|4.5|1603||
LÅNGPELARGON|Plant stand|white, 30 3/4 "|29.99|4.4|302||
ACEROLA|Plant stand|bamboo, 13 3/4 "|14.99|4.5|208||
# watering-cans-20493
@ jar
PS 2002|Watering can|white, 1/2 gallon|7.99|4.5|2804||
FÖRENLIG|Watering can|in/outdoor/green, 1/2 gallon|9.99|4.4|402||
# fish-seafood-25214
@ food
SJÖRAPPORT|Salmon fillet, frozen|ASC certified, 1 lb|11.99|4.5|604||
SILL MATJES|Matjes herring|8 oz|4.49|4.5|402||
# bread-dairy-25212
@ food
KNÄCKEBRÖD FLERKORN|Crispbread, multigrain|7 oz|2.99|4.6|802||
OST GRÄDDOST|Cream cheese, aged|ca 9 oz|7.99|4.6|302||
# ironing-boards-20608
@ table
SVÄNGA|Ironing board|white|29.99|4.4|604||
SVINNGE|Ironing board cover|gray|9.99|4.3|402||
# home-fragrance-42926
@ jar
LUGNARE|Scented candle in glass|jasmine/pink, 50 hr|7.99|4.6|1206||
SINNLIG|Scented candle in glass|sweet vanilla/natural, 50 hr|4.99|4.6|3102||
ADLAD|Scented candle in glass|Scandinavian woods/white, 25 hr|2.99|4.5|2304||
# kitchen-sinks-24263
@ bowl
NORRSJÖN|Inset sink, 1 bowl|stainless steel, 21 5/8x18 1/2 "|99.99|4.5|302||
BOHOLMEN|Inset sink, 1 bowl with drainboard|stainless steel, 30 3/4x19 1/4 "|69.99|4.4|604||
# smart-air-purifiers-56472
@ appliance
STARKVIND|Air purifier|white/smart|149.00|4.4|1202||
`
