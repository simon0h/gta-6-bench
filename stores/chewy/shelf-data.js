// Chewy storefront assortment (reference mode). Real brands and product lines
// sold on www.chewy.com, grouped by the real /b/ category ids from
// reference-data.js. Prices are typical USD shelf prices, not captured quotes.
// Rows: [brand, full title, price, flags, art, sizes]
//   flags: space-separated — rx (prescription), new, halloween, football, parent
//   art:   override for the category's default packaging illustration
//   sizes: [[label, price], ...] when the listing offers size choices
// Nothing here is a video game: Chewy sells pet supplies only.

const C = (cat, art, rows) => rows.map(([brand, title, price, flags = '', artOverride = null, sizes = null]) => ({ cat, brand, title, price, flags, art: artOverride || art, sizes }))

export const SHELF_ROWS = [
  // ── Dog food ───────────────────────────────────────────────────────────
  ...C(294, 'bag', [
    ['Purina Pro Plan', 'Purina Pro Plan Adult Sensitive Skin & Stomach Salmon & Rice Formula Dry Dog Food, 30-lb bag', 78.98, '', null, [['4-lb bag', 22.98], ['16-lb bag', 54.48], ['30-lb bag', 78.98]]],
    ['Blue Buffalo', 'Blue Buffalo Life Protection Formula Adult Chicken & Brown Rice Recipe Dry Dog Food, 30-lb bag', 69.98, '', null, [['6-lb bag', 19.98], ['15-lb bag', 44.98], ['30-lb bag', 69.98]]],
    ["Hill's Science Diet", "Hill's Science Diet Adult Large Breed Chicken & Barley Recipe Dry Dog Food, 35-lb bag", 92.99, '', null, [['15-lb bag', 54.99], ['35-lb bag', 92.99]]],
    ['Royal Canin', 'Royal Canin Size Health Nutrition Medium Adult Dry Dog Food, 30-lb bag', 87.99, '', null, [['6-lb bag', 26.99], ['17-lb bag', 59.99], ['30-lb bag', 87.99]]],
    ['Purina ONE', 'Purina ONE +Plus Adult Lamb & Rice Formula Dry Dog Food, 31.1-lb bag', 49.98],
    ['American Journey', 'American Journey Active Life Formula Chicken, Brown Rice & Vegetables Recipe Dry Dog Food, 28-lb bag', 42.99],
    ['Taste of the Wild', 'Taste of the Wild High Prairie Grain-Free Dry Dog Food, 28-lb bag', 59.99, '', null, [['5-lb bag', 19.99], ['14-lb bag', 39.99], ['28-lb bag', 59.99]]],
    ['Wellness CORE', 'Wellness CORE Grain-Free Original Recipe Dry Dog Food, 26-lb bag', 82.99],
    ['Nutro', 'Nutro Natural Choice Adult Chicken & Brown Rice Recipe Dry Dog Food, 30-lb bag', 64.99],
    ['Pedigree', 'Pedigree Complete Nutrition Grilled Steak & Vegetable Flavor Adult Dry Dog Food, 44-lb bag', 39.98],
    ['Merrick', 'Merrick Grain-Free Texas Beef & Sweet Potato Recipe Dry Dog Food, 22-lb bag', 72.98],
    ['Instinct', 'Instinct Raw Boost Grain-Free Recipe with Real Chicken Dry Dog Food, 20-lb bag', 74.99],
    ['Diamond Naturals', 'Diamond Naturals Adult Lamb Meal & Rice Formula Dry Dog Food, 40-lb bag', 52.99],
    ['Iams', 'Iams Adult MiniChunks Small Kibble High Protein Dry Dog Food, 30-lb bag', 44.98],
    ['Purina Pro Plan', 'Purina Pro Plan Sport Performance 30/20 Salmon & Rice Formula Dry Dog Food, 37.5-lb bag', 84.98],
    ['Rachael Ray Nutrish', 'Rachael Ray Nutrish Real Chicken & Veggies Recipe Dry Dog Food, 40-lb bag', 41.98],
    ['Purina Pro Plan', 'Purina Pro Plan Adult Small Breed Chicken & Rice Formula Dry Dog Food, 18-lb bag', 52.98, 'new'],
  ]),
  ...C(2284, 'bag', [
    ['Purina Pro Plan', 'Purina Pro Plan Puppy Chicken & Rice Formula Dry Dog Food, 34-lb bag', 79.98, '', null, [['6-lb bag', 21.98], ['18-lb bag', 52.98], ['34-lb bag', 79.98]]],
    ["Hill's Science Diet", "Hill's Science Diet Puppy Small Bites Chicken Meal & Barley Recipe Dry Dog Food, 15.5-lb bag", 51.99],
    ['Royal Canin', 'Royal Canin Size Health Nutrition Small Puppy Dry Dog Food, 13-lb bag', 46.99],
    ['Blue Buffalo', 'Blue Buffalo Life Protection Formula Puppy Chicken & Brown Rice Recipe Dry Dog Food, 30-lb bag', 71.98],
    ['Purina Puppy Chow', 'Purina Puppy Chow High Protein Chicken Dry Puppy Food, 32-lb bag', 36.48],
  ]),
  ...C(293, 'can', [
    ['Purina Pro Plan', 'Purina Pro Plan Adult Chicken & Rice Entree Classic Canned Dog Food, 13-oz, case of 12', 31.08],
    ['Blue Buffalo', 'Blue Buffalo Homestyle Recipe Chicken Dinner with Garden Vegetables Canned Dog Food, 12.5-oz, case of 12', 29.88],
    ["Hill's Science Diet", "Hill's Science Diet Adult Chicken & Barley Entree Canned Dog Food, 13-oz, case of 12", 42.99],
    ['Cesar', 'Cesar Classic Loaf in Sauce Variety Pack Small Breed Wet Dog Food Trays, 3.5-oz, case of 24', 25.98, '', 'tray'],
    ['Pedigree', 'Pedigree Chopped Ground Dinner Variety Pack Canned Dog Food, 13.2-oz, case of 12', 17.98],
    ['Purina Beneful', 'Purina Beneful Prepared Meals Variety Pack Wet Dog Food, 10-oz tubs, case of 6', 14.48, '', 'tray'],
    ['Wellness CORE', 'Wellness CORE Grain-Free Hearty Cuts in Gravy Shredded Chicken & Turkey Canned Dog Food, 12.5-oz, case of 12', 44.28],
    ['Merrick', "Merrick Grain-Free Wet Dog Food Cowboy Cookout Recipe, 12.7-oz, case of 12", 41.88],
  ]),
  ...C(8321, 'pouch', [
    ["Tylee's", "Tylee's Human-Grade Chicken Recipe Frozen Dog Food, 12-oz pouch, case of 6", 29.99, 'new'],
    ["Stella & Chewy's", "Stella & Chewy's Chewy's Chicken Meal Mixers Freeze-Dried Raw Dog Food Topper, 18-oz bag", 34.99],
    ['Freshpet', 'Freshpet Select Fresh From The Kitchen Home Cooked Chicken Recipe Fresh Dog Food, 1.75-lb bag', 17.49],
    ['Instinct', 'Instinct Raw Boost Mixers Chicken Recipe Grain-Free Freeze-Dried Dog Food Topper, 14-oz bag', 29.99],
  ]),
  ...C(459, 'bag', [
    ["Hill's Prescription Diet", "Hill's Prescription Diet i/d Digestive Care Chicken Flavor Dry Dog Food, 27.5-lb bag", 109.99, 'rx'],
    ['Royal Canin Veterinary Diet', 'Royal Canin Veterinary Diet Adult Gastrointestinal Low Fat Dry Dog Food, 28.6-lb bag', 124.99, 'rx'],
    ['Purina Pro Plan Veterinary Diets', 'Purina Pro Plan Veterinary Diets EN Gastroenteric Formula Dry Dog Food, 32-lb bag', 112.99, 'rx'],
    ["Hill's Prescription Diet", "Hill's Prescription Diet k/d Kidney Care Chicken Flavor Dry Dog Food, 17.6-lb bag", 92.99, 'rx'],
    ["Hill's Prescription Diet", "Hill's Prescription Diet z/d Skin/Food Sensitivities Original Flavor Dry Dog Food, 25-lb bag", 129.99, 'rx'],
  ]),
  // ── Dog treats ─────────────────────────────────────────────────────────
  ...C(1540, 'chew', [
    ['Best Bully Sticks', 'Best Bully Sticks 6-inch Odor-Free Bully Sticks Dog Treats, 18 count', 44.99],
    ['Nature Gnaws', 'Nature Gnaws Small Bully Sticks 5 - 6-inch Dog Treats, 20 count', 29.99],
    ['Pawstruck', 'Pawstruck Natural 12-inch Braided Bully Sticks Dog Treats, 10 count', 59.99],
    ['Redbarn', 'Redbarn Peanut Butter Filled Bones Dog Treats, Large, 3 count', 12.49, '', 'bone'],
    ['Barkworthies', 'Barkworthies Odor-Free Pig Ears Natural Dog Chews, 12 count', 23.99, '', 'pouch'],
  ]),
  ...C(1538, 'pouch', [
    ['Milk-Bone', 'Milk-Bone Soft & Chewy Beef & Filet Mignon Recipe Dog Treats, 25-oz tub', 13.98, '', 'tub'],
    ['Blue Buffalo', 'Blue Buffalo Blue Bits Tender Beef Recipe Soft-Moist Training Dog Treats, 11-oz bag', 10.98],
    ["Zuke's", "Zuke's Mini Naturals Chicken Recipe Training Dog Treats, 16-oz bag", 15.99],
    ['Pup-Peroni', 'Pup-Peroni Original Beef Flavor Dog Treats, 22.5-oz bag', 12.48],
    ['Wellness', 'Wellness Soft Puppy Bites Lamb & Salmon Recipe Grain-Free Dog Treats, 3-oz bag', 6.99],
  ]),
  ...C(1539, 'pouch', [
    ['Greenies', 'Greenies Original Regular Natural Dental Dog Treats, 36 count', 37.48, '', null, [['Petite, 60 count', 37.48], ['Regular, 36 count', 37.48], ['Large, 24 count', 37.48]]],
    ['Purina DentaLife', 'Purina DentaLife Daily Oral Care Small/Medium Dental Dog Treats, 40 count', 16.98],
    ['Pedigree', 'Pedigree Dentastix Fresh Large Dog Treats, 32 count', 15.98],
    ['Whimzees', 'Whimzees Natural Grain-Free Daily Dental Dog Treats, Medium, 30 count', 22.99],
    ['Milk-Bone', 'Milk-Bone Brushing Chews Daily Dental Dog Treats, Mini, 37 count', 15.48],
    ['Greenies', 'Greenies Pumpkin Spice Flavor Regular Dental Dog Treats, 12 count', 12.99, 'new halloween'],
  ]),
  ...C(1537, 'box', [
    ['Milk-Bone', 'Milk-Bone Original Medium Biscuit Dog Treats, 10-lb box', 19.98],
    ['Old Mother Hubbard', 'Old Mother Hubbard Classic Crunchy P-Nuttier Mini Biscuits Dog Treats, 20-oz bag', 8.99, '', 'pouch'],
    ['Blue Buffalo', 'Blue Buffalo Health Bars Baked with Pumpkin & Cinnamon Dog Treats, 16-oz bag', 7.98, 'halloween', 'pouch'],
    ['American Journey', 'American Journey Peanut Butter Recipe Grain-Free Oven Baked Crunchy Biscuit Dog Treats, 16-oz bag', 7.49, '', 'pouch'],
  ]),
  ...C(9938, 'chew', [
    ['Himalayan Dog Chew', 'Himalayan Dog Chew Original Yak Cheese Dog Chews, Large, 3 count', 22.99],
    ['Earth Animal', 'Earth Animal No-Hide Chicken Stix Dog Chews, 10 count', 24.99],
    ['Nylabone', 'Nylabone Healthy Edibles Natural Long-Lasting Bacon Flavor Dog Chew Treats, Regular, 8 count', 9.99, '', 'bone'],
  ]),
  ...C(1546, 'pouch', [
    ["Purina Waggin' Train", "Purina Waggin' Train Limited Ingredient Chicken Jerky Tenders Dog Treats, 36-oz bag", 32.98],
    ["Milo's Kitchen", "Milo's Kitchen Chicken Grillers Recipe Dog Treats, 18-oz bag", 15.98],
    ['Smokehouse', 'Smokehouse USA Made Chicken Chips Natural Dog Treats, 16-oz bag', 21.99],
  ]),
  ...C(1547, 'tub', [
    ['PureBites', 'PureBites Chicken Breast Freeze-Dried Raw Dog Treats, 16.6-oz tub', 32.99],
    ["Stella & Chewy's", "Stella & Chewy's Wild Weenies Chicken Recipe Freeze-Dried Raw Dog Treats, 3.25-oz bag", 9.99, '', 'pouch'],
    ['Vital Essentials', 'Vital Essentials Beef Liver Freeze-Dried Raw Dog Treats, 2.1-oz bag', 9.99, '', 'pouch'],
  ]),
  ...C(11556, 'tube', [
    ['Inaba', 'Inaba Churu Chicken Recipe Lickable Puree Dog Treats, 0.7-oz tube, 20 count', 21.98, 'new'],
  ]),
  // ── Dog toys ───────────────────────────────────────────────────────────
  ...C(320, 'plush', [
    ['Frisco', 'Frisco Plush Squeaking Fox Dog Toy, Medium', 7.98],
    ['KONG', 'KONG Wild Knots Bear Dog Toy, Medium/Large', 9.99],
    ['ZippyPaws', 'ZippyPaws Skinny Peltz No Stuffing Squeaky Plush Dog Toy, 3 count', 12.99],
    ['Frisco', 'Frisco Halloween Ghost Plush Squeaky Dog Toy', 6.98, 'new halloween'],
    ['Frisco', 'Frisco Pumpkin Spice Latte Plush Squeaky Dog Toy', 7.98, 'new halloween'],
    ['BARK', 'BARK Super Chewer Spooky Spaghetti Monster Dog Toy', 16.00, 'halloween'],
    ['Fetch for Pets', 'Fetch for Pets NFL Green Bay Packers Plush Football Dog Toy', 14.99, 'football'],
  ]),
  ...C(316, 'ring', [
    ['Nylabone', 'Nylabone Power Chew Textured Ring Dog Chew Toy, Large', 10.99],
    ['Benebone', 'Benebone Wishbone Bacon Flavor Tough Dog Chew Toy, Large', 17.99, '', 'bone'],
    ['Goughnuts', 'Goughnuts MAXX 50 Ring Dog Chew Toy, Large', 34.95],
    ['West Paw', 'West Paw Zogoflex Hurley Tough Dog Chew Toy, Large', 19.95, '', 'bone'],
  ]),
  ...C(317, 'ball', [
    ['Chuckit!', 'Chuckit! Ultra Ball Dog Toy, Medium, 2 pack', 7.99],
    ['Chuckit!', 'Chuckit! Classic Launcher Dog Toy, 26-in', 13.99, '', 'launcher'],
    ['Hartz', 'Hartz Dura Play Ball Squeaky Latex Dog Toy, Medium', 4.98],
    ['iFetch', 'iFetch Too Automatic Ball Launcher Dog Toy', 199.99, '', 'device'],
  ]),
  ...C(2336, 'kong', [
    ['KONG', 'KONG Classic Dog Toy, Large', 14.99, '', null, [['Small', 9.99], ['Medium', 12.99], ['Large', 14.99], ['X-Large', 19.99]]],
    ['KONG', 'KONG Extreme Dog Toy, Black, Large', 17.99],
    ['Starmark', 'Starmark Bob-A-Lot Interactive Dog Toy, Large', 19.99],
  ]),
  ...C(2335, 'puzzle', [
    ['Outward Hound', 'Outward Hound Nina Ottosson Dog Brick Interactive Treat Puzzle Dog Toy', 14.99],
    ['Outward Hound', 'Outward Hound Hide-A-Squirrel Puzzle Plush Squeaky Dog Toy, Large', 15.99, '', 'plush'],
    ['Frisco', 'Frisco Hide & Seek Plush Volcano Puzzle Dog Toy', 13.98, '', 'plush'],
  ]),
  ...C(321, 'rope', [
    ['Mammoth', 'Mammoth Flossy Chews Cottonblend 3-Knot Rope Dog Toy, Large', 9.99],
    ['Frisco', 'Frisco Rope Tug Dog Toy, 3 count', 12.98],
  ]),
  // ── Dog supplies ───────────────────────────────────────────────────────
  ...C(364, 'crate', [
    ['MidWest', 'MidWest iCrate Double Door Collapsible Wire Dog Crate, 42-in', 79.99, '', null, [['24-in', 42.99], ['30-in', 54.99], ['36-in', 66.99], ['42-in', 79.99], ['48-in', 99.99]]],
    ['Frisco', 'Frisco Fold & Carry Double Door Collapsible Wire Dog Crate, 36-in', 54.99],
    ['Carlson', 'Carlson Extra Wide Walk-Through Pet Gate with Small Pet Door', 49.99, '', 'gate'],
    ['Diggs', 'Diggs Revol Collapsible Dog Crate, Medium', 349.00],
  ]),
  ...C(365, 'bed', [
    ['Frisco', 'Frisco Sherpa Bolster Cat & Dog Bed, Large', 34.99],
    ['Big Barker', 'Big Barker 7-inch Pillow Top Orthopedic Dog Bed, Large', 279.95, '', 'mattress'],
    ['Best Friends by Sheri', 'Best Friends by Sheri The Original Calming Shag Vegan Fur Donut Cat & Dog Bed, Medium', 54.99],
    ['FurHaven', 'FurHaven Plush & Suede Orthopedic Sofa Cat & Dog Bed, Jumbo', 69.99, '', 'mattress'],
    ['K&H Pet Products', 'K&H Pet Products Original Elevated Pet Cot, Large', 39.99, '', 'cot'],
  ]),
  ...C(1897, 'device', [
    ['Furbo', 'Furbo 360° Dog Camera with Treat Tossing & Barking Alerts', 139.00, 'new'],
    ['Fi', 'Fi Series 3+ Smart GPS Dog Collar', 149.00, '', 'collar'],
    ['PetSafe', 'PetSafe Stay & Play Compact Wireless Pet Fence', 299.95],
    ['Petcube', 'Petcube Bites 2 Lite Wi-Fi Pet Camera & Treat Dispenser', 99.00],
  ]),
  ...C(344, 'leash', [
    ['Frisco', 'Frisco Solid Nylon Dog Collar, Medium', 6.98, '', 'collar'],
    ['PetSafe', 'PetSafe Easy Walk No-Pull Dog Harness, Medium', 24.95, '', 'harness'],
    ['Ruffwear', 'Ruffwear Front Range Dog Harness, Medium', 49.95, '', 'harness'],
    ['Flexi', 'Flexi New Classic Retractable Tape Dog Leash, 16-ft, Medium', 19.99],
    ['Frisco', 'Frisco Solid Nylon Dog Leash, 6-ft', 8.98],
    ['Pets First', 'Pets First NFL Dallas Cowboys Dog Collar, Medium', 15.99, 'football', 'collar'],
  ]),
  ...C(338, 'bowl', [
    ['Frisco', 'Frisco Stainless Steel Dog Bowl, 4-cup, 2 count', 9.98],
    ['Outward Hound', 'Outward Hound Fun Feeder Slo Bowl Slow Feeder Dog Bowl, Large', 13.99],
    ['PetSafe', 'PetSafe Drinkwell 360 Stainless Steel Pet Fountain, 128-oz', 69.95, '', 'fountain'],
    ['Neater Pets', 'Neater Pets Neater Feeder Deluxe Elevated Dog Bowls, Large', 54.99],
  ]),
  ...C(1470, 'shirt', [
    ['Pets First', 'Pets First NFL Kansas City Chiefs Dog & Cat Jersey, Medium', 24.99, 'football'],
    ['Frisco', 'Frisco Hot Dog Dog & Cat Costume, Medium', 14.98, 'halloween'],
    ["Rubie's Costume Company", "Rubie's Costume Company Pumpkin Dog Costume, Medium", 19.99, 'halloween'],
    ['Frisco', 'Frisco Fleece-Lined Insulated Dog Parka, Medium', 29.98, 'new'],
  ]),
  ...C(371, 'carrier', [
    ['Sherpa', 'Sherpa Original Deluxe Airline-Approved Dog & Cat Carrier Bag, Medium', 54.99],
    ['Kurgo', 'Kurgo Wander Dog Car Hammock Seat Cover', 59.99, '', 'mat'],
  ]),
  ...C(1449, 'harness', [
    ['PetSafe', 'PetSafe Gentle Leader Quick Release Dog Headcollar, Medium', 18.95],
    ['PetSafe', 'PetSafe Treat Pouch Sport Dog Training Bag', 14.95, '', 'pouch'],
  ]),
  // ── Dog cleaning & potty ───────────────────────────────────────────────
  ...C(360, 'box', [
    ['Frisco', 'Frisco Dog Training & Potty Pads, Extra Large, 28 x 34-in, 50 count', 27.98],
    ['Wee-Wee', 'Four Paws Wee-Wee Puppy Training Pee Pads, 22 x 23-in, 100 count', 31.99],
    ['Pet Parents', 'Pet Parents Pawtect Washable Dog Diapers, Medium, 3 pack', 29.99, '', 'pouch'],
  ]),
  ...C(354, 'box', [
    ['Earth Rated', 'Earth Rated Lavender Scented Dog Poop Bags, 315 count', 14.99],
    ['Frisco', 'Frisco Unscented Refill Dog Poop Bags, 900 count', 22.98],
    ['Arm & Hammer', 'Arm & Hammer Swivel Bin & Rake Pooper Scooper', 24.99, '', 'scooper'],
  ]),
  ...C(353, 'spray', [
    ["Nature's Miracle", "Nature's Miracle Advanced Stain & Odor Eliminator Spray, 32-oz", 9.99, 'parent'],
    ['Rocco & Roxie', 'Rocco & Roxie Professional Strength Stain & Odor Eliminator, 32-oz', 19.97, 'parent'],
    ['Simple Solution', 'Simple Solution Extreme Pet Stain & Odor Remover, 32-oz', 10.99, 'parent'],
  ]),
  ...C(1985, 'vacuum', [
    ['Bissell', 'Bissell Little Green ProHeat Pet Deluxe Portable Carpet Cleaner', 139.99, 'parent'],
    ['Bissell', 'Bissell Pet Hair Eraser Turbo Plus Lightweight Upright Vacuum', 199.99, 'parent'],
    ['Bissell', 'Bissell ICONpet Pro Cordless Stick Vacuum', 349.99, 'parent new'],
  ]),
  // ── Dog grooming ───────────────────────────────────────────────────────
  ...C(356, 'brush', [
    ['Hertzko', 'Hertzko Self-Cleaning Slicker Dog & Cat Brush', 15.99],
    ['Safari', 'Safari Dual-Sided Pin & Bristle Dog Brush', 8.99],
  ]),
  ...C(358, 'bottle', [
    ['Earthbath', 'Earthbath Oatmeal & Aloe Dog & Cat Shampoo, 16-oz bottle', 10.49],
    ["Burt's Bees", "Burt's Bees for Pets Oatmeal Shampoo with Colloidal Oat Flour & Honey for Dogs, 16-oz bottle", 9.99],
    ['TropiClean', 'TropiClean Fresh Lavender & Coconut Dog Shampoo, 20-oz bottle', 13.99],
    ["Vet's Best", "Vet's Best Hypo-Allergenic Dog Shampoo, 16-oz bottle", 8.99],
  ]),
  ...C(359, 'brush', [
    ['FURminator', 'FURminator Undercoat deShedding Tool for Large Dogs, Long Hair', 39.99],
    ['Andis', 'Andis ProClip 2-Speed Detachable Blade Dog Clipper', 189.99, '', 'clipper'],
    ['Wahl', 'Wahl Pro Series Cordless Pet Clipper Kit', 49.99, '', 'clipper'],
  ]),
  ...C(2397, 'clipper', [
    ['Dremel', 'Dremel 7350-PET 4V Cordless Pet Nail Grooming Kit', 39.99],
    ["Musher's Secret", "Musher's Secret Dog Paw Protection Wax, 2.1-oz", 12.99, '', 'tub'],
    ['Safari', 'Safari Professional Large Nail Trimmer for Dogs', 11.99],
  ]),
  ...C(361, 'bottle', [
    ['Virbac', 'Virbac Epi-Otic Advanced Ear Cleaner for Dogs & Cats, 4-oz bottle', 14.99],
    ['Zymox', 'Zymox Otic Enzymatic Ear Solution with 1% Hydrocortisone, 1.25-oz bottle', 22.99],
  ]),
  ...C(1433, 'tub', [
    ['Natural Dog Company', 'Natural Dog Company Skin Soother Healing Balm Stick, 2-oz', 12.99],
  ]),
  // ── Dog health ─────────────────────────────────────────────────────────
  ...C(381, 'box', [
    ['Frontline', 'Frontline Plus Flea & Tick Spot Treatment for Dogs, 45-88 lbs, 6 Doses', 69.99],
    ['K9 Advantix II', 'K9 Advantix II Flea & Tick Spot Treatment for Large Dogs, 21-55 lbs, 6 Doses', 69.99],
    ['Seresto', 'Seresto Flea & Tick Collar for Large Dogs, over 18 lbs', 59.98, '', 'collar'],
    ['Capstar', 'Capstar Fast-Acting Oral Flea Treatment for Dogs, 25.1-125 lbs, 6 Tablets', 34.99],
    ['Adams', 'Adams Plus Flea & Tick Shampoo with Precor for Dogs, 12-oz bottle', 9.99, '', 'bottle'],
  ]),
  ...C(374, 'jar', [
    ['Zesty Paws', 'Zesty Paws 8-in-1 Multifunctional Bites Chicken Flavored Soft Chews Multivitamin for Dogs, 90 count', 26.97],
    ['Nutramax', 'Nutramax Cosequin Maximum Strength Joint Health Plus MSM Chewable Tablets for Dogs, 132 count', 44.99],
    ['Nutramax', 'Nutramax Dasuquin Advanced Soft Chews Joint Supplement for Large Dogs, 84 count', 74.99],
    ['Grizzly', 'Grizzly Salmon Plus Omega-3 Oil Dog & Cat Supplement, 32-oz bottle', 32.99, '', 'bottle'],
  ]),
  ...C(1565, 'box', [
    ['Purina Pro Plan Veterinary Diets', 'Purina Pro Plan Veterinary Diets FortiFlora Powder Probiotic Supplement for Dogs, 30 count', 32.99],
    ['Nutramax', 'Nutramax Proviable-DC Capsules Digestive Supplement for Cats & Dogs, 30 count', 29.99],
  ]),
  ...C(129950, 'jar', [
    ['Zesty Paws', 'Zesty Paws Allergy Immune Bites Lamb Flavored Soft Chews Allergy Supplement for Dogs, 90 count', 26.97],
    ['Vetericyn', 'Vetericyn Plus Antimicrobial Pet Hot Spot Spray, 3-oz', 14.99, '', 'spray'],
  ]),
  ...C(2652, 'box', [
    ['Elanco', 'Elanco Quad Dewormer Chewable Tablets for Medium & Large Dogs, 4 count', 39.99],
  ]),
  ...C(379, 'jar', [
    ['ThunderShirt', 'ThunderShirt Classic Dog Anxiety Jacket, Heather Gray, Medium', 44.95, '', 'shirt'],
    ['Zesty Paws', 'Zesty Paws Calming Bites Turkey Flavored Soft Chews Calming Supplement for Dogs, 90 count', 26.97],
    ['Adaptil', 'Adaptil Calm Dog Calming Pheromone Diffuser Starter Kit', 27.99, '', 'box'],
  ]),
  ...C(3431438, 'box', [
    ['Embark', 'Embark Breed + Health Dog DNA Test Kit', 199.00],
    ['Wisdom Panel', 'Wisdom Panel Essential Dog DNA Test Kit', 99.99],
  ]),
  // ── Dog pharmacy (prescription) ────────────────────────────────────────
  ...C(11563, 'rxbox', [
    ['NexGard', 'NexGard PLUS Chew for Dogs, 17.6-33 lbs, 6 Chews (6-mos. supply)', 179.99, 'rx'],
    ['Simparica Trio', 'Simparica Trio Chewable Tablet for Dogs, 22.1-44 lbs, 6 Chewable Tablets (6-mos. supply)', 204.99, 'rx'],
    ['Bravecto', 'Bravecto Chew for Dogs, 22-44 lbs, 1 Chew (3-mos. supply)', 69.99, 'rx'],
  ]),
  ...C(11562, 'rxbox', [
    ['Heartgard Plus', 'Heartgard Plus Chew for Dogs, 26-50 lbs, 6 Chews (6-mos. supply)', 59.99, 'rx'],
    ['Interceptor Plus', 'Interceptor Plus Chew for Dogs, 25.1-50 lbs, 6 Chews (6-mos. supply)', 89.99, 'rx'],
  ]),
  ...C(11566, 'rxbottle', [
    ['Carprofen', 'Carprofen (Generic) Caplets, 75-mg, 60 Caplets', 39.99, 'rx'],
    ['Galliprant', 'Galliprant Tablets for Dogs, 60-mg, 30 Tablets', 89.99, 'rx'],
  ]),
  ...C(11568, 'rxbottle', [
    ['Apoquel', 'Apoquel Tablets for Dogs, 16-mg, 30 Tablets', 109.99, 'rx'],
  ]),
  ...C(11580, 'rxbottle', [
    ['Trazodone', 'Trazodone (Generic) Tablets, 50-mg, 30 Tablets', 13.99, 'rx'],
  ]),
  // ── Cat food ───────────────────────────────────────────────────────────
  ...C(388, 'bag', [
    ['Purina Pro Plan', 'Purina Pro Plan Adult Sensitive Skin & Stomach Lamb & Rice Formula Dry Cat Food, 16-lb bag', 54.98, '', null, [['3.5-lb bag', 19.98], ['7-lb bag', 32.98], ['16-lb bag', 54.98]]],
    ["Hill's Science Diet", "Hill's Science Diet Adult Indoor Chicken Recipe Dry Cat Food, 15.5-lb bag", 62.99, '', null, [['3.5-lb bag', 23.99], ['7-lb bag', 39.99], ['15.5-lb bag', 62.99]]],
    ['Blue Buffalo', 'Blue Buffalo Indoor Health Natural Adult Chicken & Brown Rice Recipe Dry Cat Food, 15-lb bag', 49.98],
    ['Royal Canin', 'Royal Canin Feline Health Nutrition Indoor Adult Dry Cat Food, 15-lb bag', 66.99],
    ['Purina Cat Chow', 'Purina Cat Chow Complete Chicken Dry Cat Food, 15-lb bag', 21.48],
    ['Iams', 'Iams ProActive Health Adult Indoor Weight & Hairball Care Dry Cat Food, 16-lb bag', 34.98],
    ['Meow Mix', 'Meow Mix Original Choice Dry Cat Food, 16-lb bag', 18.98],
    ['Purina ONE', 'Purina ONE Tender Selects Blend with Real Salmon Dry Cat Food, 16-lb bag', 33.98],
    ['American Journey', 'American Journey Indoor Formula Salmon & Brown Rice Recipe Dry Cat Food, 12-lb bag', 31.99],
    ['Instinct', 'Instinct Original Grain-Free Recipe with Real Chicken Freeze-Dried Raw Coated Dry Cat Food, 11-lb bag', 54.99],
    ['Purina Pro Plan', 'Purina Pro Plan Senior Adult 7+ Chicken & Rice Formula Dry Cat Food, 7-lb bag', 32.98, 'new'],
  ]),
  ...C(389, 'can', [
    ['Fancy Feast', 'Fancy Feast Gravy Lovers Poultry & Beef Feast Variety Pack Canned Cat Food, 3-oz, case of 24', 22.56],
    ['Friskies', 'Friskies Pate Variety Pack Canned Cat Food, 5.5-oz, case of 32', 30.88],
    ['Purina Pro Plan', 'Purina Pro Plan Adult Salmon & Rice Entree Classic Canned Cat Food, 3-oz, case of 24', 34.08],
    ["Hill's Science Diet", "Hill's Science Diet Adult Savory Chicken Entree Canned Cat Food, 5.5-oz, case of 24", 49.99],
    ['Tiki Cat', 'Tiki Cat After Dark Variety Pack Grain-Free Canned Cat Food, 2.8-oz, case of 12', 22.99],
    ['Weruva', 'Weruva Cats in the Kitchen Pumpkin Jack Splash Grain-Free Canned Cat Food, 3.2-oz, case of 24', 34.99, 'halloween'],
    ['Sheba', 'Sheba Perfect Portions Cuts in Gravy Variety Pack Wet Cat Food Trays, 2.6-oz twin-pack, case of 24', 22.98, '', 'tray'],
    ['Wellness', 'Wellness Complete Health Pate Chicken Entree Grain-Free Canned Cat Food, 5.5-oz, case of 24', 46.08],
    ['Royal Canin', 'Royal Canin Feline Care Nutrition Digest Sensitive Thin Slices in Gravy Canned Cat Food, 3-oz, case of 24', 49.99],
  ]),
  ...C(392, 'pouch', [
    ['Fancy Feast', 'Fancy Feast Classic Broths with Chicken Cat Food Topper, 1.4-oz pouch, case of 16', 14.24],
    ["Stella & Chewy's", "Stella & Chewy's Chick, Chick, Chicken Meal Mixers Freeze-Dried Raw Cat Food Topper, 3.5-oz bag", 13.99],
  ]),
  ...C(2293, 'bag', [
    ['Purina Pro Plan', 'Purina Pro Plan Kitten Chicken & Rice Formula Dry Cat Food, 7-lb bag', 32.98],
    ["Hill's Science Diet", "Hill's Science Diet Kitten Chicken Recipe Dry Cat Food, 7-lb bag", 37.99],
    ['Royal Canin', 'Royal Canin Feline Health Nutrition Kitten Dry Cat Food, 7-lb bag', 41.99],
    ['Blue Buffalo', 'Blue Buffalo Healthy Growth Kitten Chicken & Brown Rice Recipe Dry Cat Food, 7-lb bag', 32.98],
  ]),
  ...C(11741, 'can', [
    ['Ziwi Peak', 'Ziwi Peak Mackerel & Lamb Recipe Canned Cat Food, 3-oz, case of 24', 69.99],
    ['Open Farm', 'Open Farm Wild-Caught Salmon Grain-Free Dry Cat Food, 8-lb bag', 59.99, '', 'bag'],
  ]),
  ...C(460, 'bag', [
    ["Hill's Prescription Diet", "Hill's Prescription Diet c/d Multicare Urinary Care Chicken Flavor Dry Cat Food, 8.5-lb bag", 64.99, 'rx'],
    ['Royal Canin Veterinary Diet', 'Royal Canin Veterinary Diet Adult Urinary SO Dry Cat Food, 7.7-lb bag', 62.99, 'rx'],
    ['Purina Pro Plan Veterinary Diets', 'Purina Pro Plan Veterinary Diets UR Urinary St/Ox Dry Cat Food, 8-lb bag', 51.99, 'rx'],
    ["Hill's Prescription Diet", "Hill's Prescription Diet k/d Kidney Care with Chicken Dry Cat Food, 8.5-lb bag", 66.99, 'rx'],
  ]),
  // ── Cat litter ─────────────────────────────────────────────────────────
  ...C(10658, 'jug', [
    ['Tidy Cats', 'Tidy Cats 24/7 Performance Scented Clumping Clay Cat Litter, 35-lb pail', 24.48],
    ['Arm & Hammer', 'Arm & Hammer Clump & Seal Platinum Multi-Cat Scented Clumping Clay Cat Litter, 40-lb box', 31.99, '', 'litterbox-pack'],
    ['Frisco', 'Frisco Multi-Cat Unscented Clumping Clay Cat Litter, 40-lb bag', 17.98, '', 'bag'],
    ['Boxiecat', 'Boxiecat Premium Unscented Clumping Clay Cat Litter, 28-lb bag', 23.99, '', 'bag'],
  ]),
  ...C(10660, 'litterbox-pack', [
    ['Fresh Step', 'Fresh Step Clean Paws Multi-Cat Scented Clumping Clay Cat Litter, 22.5-lb box', 24.99],
  ]),
  ...C(10661, 'bag', [
    ["Dr. Elsey's", "Dr. Elsey's Precious Cat Ultra Unscented Clumping Clay Cat Litter, 40-lb bag", 23.99],
  ]),
  ...C(10664, 'bag', [
    ["World's Best Cat Litter", "World's Best Cat Litter Multiple Cat Clumping Corn Cat Litter, 28-lb bag", 39.99],
    ['sWheat Scoop', 'sWheat Scoop Multi-Cat Unscented Clumping Wheat Cat Litter, 25-lb bag', 29.99],
    ['Feline Pine', 'Feline Pine Original Unscented Non-Clumping Wood Cat Litter, 40-lb bag', 26.99],
  ]),
  ...C(10662, 'jug', [
    ['Tidy Cats', 'Tidy Cats Free & Clean Lightweight Unscented Clumping Clay Cat Litter, 17-lb jug', 21.98],
    ['Fresh Step', 'Fresh Step Lightweight Extreme Scented Clumping Clay Cat Litter, 15.4-lb jug', 17.98],
  ]),
  ...C(167878, 'bag', [
    ['PrettyLitter', 'PrettyLitter Health Monitoring Crystal Cat Litter, 8-lb bag', 29.99],
    ['Fresh Step', 'Fresh Step Crystals Premium Unscented Cat Litter, 8-lb bag', 17.99],
  ]),
  // ── Cat supplies ───────────────────────────────────────────────────────
  ...C(410, 'litterbox', [
    ['Frisco', 'Frisco High Sided Cat Litter Box, Extra Large, 24-in', 21.98],
    ['Petmate', 'Petmate Top Entry Cat Litter Box with Lid', 29.99],
    ['Frisco', 'Frisco Honeycomb Cat Litter Mat, Large', 15.98, '', 'mat'],
    ['Litter Genie', 'Litter Genie Plus Cat Litter Disposal System', 21.99, '', 'pail'],
  ]),
  ...C(8311, 'device', [
    ['Whisker', 'Litter-Robot 4 by Whisker Self-Cleaning Cat Litter Box', 699.00, 'new', 'robot'],
    ['PetSafe', 'PetSafe ScoopFree Ultra Self-Cleaning Cat Litter Box', 189.95, '', 'litterbox'],
    ['PETLIBRO', 'PETLIBRO Granary Automatic Cat & Dog Feeder, 5-L', 59.99],
    ['Catit', 'Catit Pixi Smart Cat Fountain, 2.5-L', 59.99, '', 'fountain'],
  ]),
  ...C(425, 'bed', [
    ['Frisco', 'Frisco Felt Cat Cave Bed, Gray', 29.98, '', 'cave'],
    ['K&H Pet Products', 'K&H Pet Products Thermo-Kitty Heated Cat Bed', 44.99],
    ['Frisco', 'Frisco Plush Bolster Cat & Dog Bed, Small', 19.98],
  ]),
  ...C(454, 'carrier', [
    ['Frisco', 'Frisco Two Door Top Load Kennel Cat & Dog Carrier, 19-in', 27.98, '', 'kennel'],
    ['Sleepypod', 'Sleepypod Air In-Cabin Pet Carrier, Jet Black', 179.95],
  ]),
  ...C(394, 'bowl', [
    ['Catit', 'Catit Flower Fountain Cat Water Fountain, 3-L', 29.99, '', 'fountain'],
    ['Frisco', 'Frisco Ceramic Cat Bowl, 1-cup, 2 count', 8.98],
    ["Dr. Catsby's", "Dr. Catsby's Bowl for Whisker Relief Stainless Steel Cat Bowl", 22.99],
  ]),
  ...C(432, 'brush', [
    ['FURminator', 'FURminator Undercoat deShedding Tool for Cats, Short Hair', 29.99],
    ['Hertzko', 'Hertzko Self-Cleaning Slicker Brush for Cats', 13.99],
  ]),
  ...C(400, 'collar', [
    ['Frisco', 'Frisco Breakaway Nylon Cat Collar with Bell, 2 count', 7.98],
    ['PetSafe', 'PetSafe Come With Me Kitty Harness & Bungee Leash, Medium', 19.95, '', 'harness'],
  ]),
  // ── Cat health ─────────────────────────────────────────────────────────
  ...C(404, 'box', [
    ['Frontline', 'Frontline Plus Flea & Tick Spot Treatment for Cats, over 1.5 lbs, 6 Doses', 64.99],
    ['Advantage II', 'Advantage II Flea Spot Treatment for Large Cats, over 9 lbs, 6 Doses', 64.99],
    ['Seresto', 'Seresto Flea & Tick Collar for Cats', 59.98, '', 'collar'],
    ['Capstar', 'Capstar Fast-Acting Oral Flea Treatment for Cats, 2-25 lbs, 6 Tablets', 31.99],
  ]),
  ...C(417, 'box', [
    ['Nutramax', 'Nutramax Cosequin Sprinkle Capsules Joint Health Supplement for Cats, 80 count', 23.99],
  ]),
  ...C(1577, 'box', [
    ['Purina Pro Plan Veterinary Diets', 'Purina Pro Plan Veterinary Diets FortiFlora Powder Probiotic Supplement for Cats, 30 count', 32.99],
  ]),
  ...C(422, 'box', [
    ['Feliway', 'Feliway Classic Cat Calming Pheromone Diffuser Starter Kit', 29.99],
    ['VetriScience', 'VetriScience Composure Calming Chews for Cats, Chicken Liver Flavor, 30 count', 14.99, '', 'pouch'],
  ]),
  ...C(11591, 'rxbox', [
    ['Revolution Plus', 'Revolution Plus Topical Solution for Cats, 5.6-11 lbs, 6 Treatments (6-mos. supply)', 139.99, 'rx'],
    ['Bravecto', 'Bravecto Topical Solution for Cats, 6.2-13.8 lbs, 1 Treatment (3-mos. supply)', 59.99, 'rx'],
  ]),
  ...C(11609, 'rxbox', [
    ['Profender', 'Profender Topical Solution for Cats, 5.5-11 lbs, 2 Treatments', 34.99, 'rx'],
  ]),
  ...C(11615, 'rxbottle', [
    ['Methimazole', 'Methimazole (Generic) Tablets, 5-mg, 30 Tablets', 9.99, 'rx'],
  ]),
  ...C(11608, 'rxbottle', [
    ['Gabapentin', 'Gabapentin (Generic) Capsules, 100-mg, 30 Capsules', 11.99, 'rx'],
  ]),
  // ── Cat treats ─────────────────────────────────────────────────────────
  ...C(1552, 'tub', [
    ['Temptations', 'Temptations Classic Tasty Chicken Flavor Soft & Crunchy Cat Treats, 16-oz tub', 9.98],
    ['Temptations', 'Temptations MixUps Catnip Fever Flavor Soft & Crunchy Cat Treats, 16-oz tub', 9.98],
    ['Temptations', 'Temptations Pumpkin Spice Latte Flavor Cat Treats, 3-oz pouch', 3.49, 'new halloween', 'pouch'],
    ['Friskies', 'Friskies Party Mix Original Crunch Cat Treats, 20-oz canister', 9.48],
  ]),
  ...C(2275, 'tube', [
    ['Inaba', 'Inaba Churu Tuna Recipe Lickable Puree Cat Treats, 0.5-oz tube, 50 count', 29.98],
    ['Hartz', 'Hartz Delectables Squeeze Up Variety Pack Lickable Cat Treats, 0.5-oz, 32 count', 15.99],
  ]),
  ...C(1553, 'pouch', [
    ['Blue Buffalo', 'Blue Buffalo Bursts Chicken Liver Flavor Crunchy & Soft Cat Treats, 12-oz tub', 8.99, '', 'tub'],
  ]),
  ...C(12803, 'pouch', [
    ['Greenies', 'Greenies Feline Oven Roasted Chicken Flavor Adult Dental Cat Treats, 21-oz tub', 22.48, '', 'tub'],
  ]),
  ...C(1555, 'pouch', [
    ['SmartyKat', 'SmartyKat Organic Catnip, 1-oz', 4.29],
    ['Meowijuana', 'Meowijuana Get Baked Catnip Bud Cat Treat, 1-oz jar', 7.99, '', 'jar'],
  ]),
  ...C(167950, 'tub', [
    ['Pet Greens', 'Pet Greens Garden Self-Grow Cat Grass, 3-oz', 6.49],
  ]),
  // ── Cat trees, scratchers & toys ───────────────────────────────────────
  ...C(1482, 'tree', [
    ['Frisco', 'Frisco 72-in Faux Fur Cat Tree & Condo, Gray', 89.99, '', null, [['34-in', 39.99], ['53-in', 64.99], ['72-in', 89.99]]],
    ['Go Pet Club', 'Go Pet Club 62-in Cat Tree & Condo, Beige', 69.99],
    ['Frisco', 'Frisco 34-in Cat Tree with Hammock, Gray', 39.99],
  ]),
  ...C(1484, 'post', [
    ['Frisco', 'Frisco Sisal Cat Scratching Post, 32-in', 24.98],
    ['Pioneer Pet', 'Pioneer Pet SmartCat The Ultimate Scratching Post, 32-in', 59.99],
  ]),
  ...C(393, 'scratcher', [
    ['PetFusion', 'PetFusion Ultimate Cat Scratcher Lounge, Large', 37.99],
    ['Frisco', 'Frisco Cardboard Cat Scratcher with Catnip, 2 count', 11.98],
  ]),
  ...C(2327, 'perch', [
    ['K&H Pet Products', 'K&H Pet Products EZ Mount Window Cat Bed Perch, Large', 29.99],
  ]),
  ...C(9028, 'perch', [
    ['Frisco', 'Frisco Wall-Mounted Cat Shelf Ladder, 3-Step', 44.99, 'new'],
  ]),
  ...C(327, 'device', [
    ['PetSafe', 'PetSafe Bolt Interactive Laser Cat Toy', 29.95],
    ['SmartyKat', 'SmartyKat Hot Pursuit Electronic Concealed Motion Cat Toy', 21.99],
  ]),
  ...C(1421, 'wand', [
    ['Go Cat', 'Go Cat Da Bird Feather Teaser Wand Cat Toy', 9.95],
    ['Frisco', 'Frisco Feather Teaser Wand Cat Toy with Refills, 2 count', 5.98],
  ]),
  ...C(11130, 'fish', [
    ['Yeowww!', 'Yeowww! Catnip Banana Cat Toy', 7.99],
    ['Frisco', 'Frisco Halloween Pumpkin Plush Catnip Cat Toy, 3 count', 6.98, 'new halloween', 'plush'],
  ]),
  ...C(328, 'mouse', [
    ['SmartyKat', 'SmartyKat Skitter Critters Catnip Mice Cat Toy, 3 count', 2.99],
    ['Frisco', 'Frisco Plush Mice with Catnip Cat Toy, 12 count', 9.98],
  ]),
  ...C(329, 'ball', [
    ['Petstages', 'Petstages Tower of Tracks Interactive 3-Tier Cat Toy', 13.99, '', 'tracks'],
    ['Frisco', 'Frisco Sparkle Ball Cat Toy, 10 count', 4.98],
  ]),
  // ── Horse ──────────────────────────────────────────────────────────────
  ...C(2744, 'sack', [
    ['Purina', 'Purina Equine Senior Horse Feed, 50-lb bag', 34.99],
    ['Triple Crown', 'Triple Crown Senior Horse Feed, 50-lb bag', 36.99],
  ]),
  ...C(2745, 'pouch', [
    ['Manna Pro', 'Manna Pro Bite-Size Nuggets Apple Flavor Horse Treats, 4-lb bag', 12.99],
  ]),
  ...C(11452, 'blanket', [
    ['WeatherBeeta', 'WeatherBeeta ComFiTec Classic Standard Neck Medium Horse Turnout Blanket, 75-in', 159.99],
  ]),
  ...C(1691, 'bottle', [
    ['Absorbine', 'Absorbine Veterinary Liniment Gel for Horses, 12-oz', 19.99],
    ['Farnam', 'Farnam Vetrolin Liniment for Horses, 32-oz', 24.99],
  ]),
  ...C(10437, 'tube', [
    ['Zoetis', 'Zoetis Quest Gel Equine Dewormer, 0.5-oz', 14.99],
  ]),
  ...C(1692, 'pail', [
    ['Farnam', "Farnam Horseshoer's Secret Hoof Supplement Pellets, 3.75-lb", 39.99],
    ['Cosequin', 'Cosequin ASU Joint Health Supplement Pellets for Horses, 1,050-g', 99.99],
  ]),
  // ── Chicken & livestock ────────────────────────────────────────────────
  ...C(951, 'sack', [
    ['Purina', 'Purina Layena Pellets Chicken Feed, 50-lb bag', 24.99],
    ['Kalmbach Feeds', 'Kalmbach Feeds 16% Layer Pellets Chicken Feed, 50-lb bag', 23.99],
  ]),
  ...C(12995, 'pouch', [
    ['Happy Hen Treats', 'Happy Hen Treats Mealworm Frenzy Chicken Treats, 10-oz', 9.99],
  ]),
  ...C(13023, 'waterer', [
    ['Harris Farms', 'Harris Farms Plastic Poultry Drinker, 1-gal', 10.99],
    ['RentACoop', 'RentACoop Covered Chicken Feeder, 20-lb', 39.99],
  ]),
  ...C(128950, 'sack', [
    ['Purina', 'Purina Start & Grow Medicated Chick Starter Feed, 25-lb bag', 21.99],
  ]),
  ...C(16621, 'coop', [
    ['Ware', 'Ware Premium Chick-N-Hutch Chicken Coop', 279.99],
  ]),
  ...C(8405, 'sack', [
    ['Purina', 'Purina Goat Chow Goat Feed, 50-lb bag', 25.99],
  ]),
  ...C(9923, 'pail', [
    ['Manna Pro', 'Manna Pro Goat Mineral Supplement, 8-lb', 17.99],
  ]),
  // ── Wild bird ──────────────────────────────────────────────────────────
  ...C(11893, 'sack', [
    ["Wagner's", "Wagner's Eastern Regional Blend Wild Bird Food, 20-lb bag", 21.99],
    ['Kaytee', 'Kaytee Waste Free Wild Bird Food, 20-lb bag', 32.99],
    ['Lyric', 'Lyric Supreme Wild Bird Mix, 20-lb bag', 34.99],
  ]),
  ...C(11896, 'box', [
    ['C&S', 'C&S Hi-Energy Suet Dough Wild Bird Food, 11.75-oz, 12 count', 18.99],
  ]),
  ...C(1744, 'birdfeeder', [
    ['Perky-Pet', 'Perky-Pet Squirrel-Be-Gone Wild Bird Feeder', 39.99],
    ['Brome', 'Brome Squirrel Buster Plus Wild Bird Feeder', 109.99],
  ]),
  ...C(139902, 'hummer', [
    ['More Birds', 'More Birds Health Plus Glass Hummingbird Feeder, 30-oz', 22.99],
    ['Perky-Pet', 'Perky-Pet Instant Red Hummingbird Nectar, 2-lb', 9.99, '', 'jar'],
  ]),
  // ── Small animal ───────────────────────────────────────────────────────
  ...C(10850, 'bag', [
    ['Oxbow', 'Oxbow Essentials Adult Rabbit Food, 10-lb bag', 22.99],
    ['Small Pet Select', 'Small Pet Select 2nd Cutting Perfect Blend Timothy Hay, 10-lb box', 39.99, '', 'box'],
  ]),
  ...C(10851, 'bag', [
    ['Oxbow', 'Oxbow Essentials Adult Guinea Pig Food, 10-lb bag', 24.99],
    ['Oxbow', 'Oxbow Western Timothy Hay, 90-oz bag', 19.99],
  ]),
  ...C(10853, 'bag', [
    ['Kaytee', 'Kaytee Forti-Diet Pro Health Hamster Food, 3-lb bag', 8.99],
    ['Niteangel', 'Niteangel Super-Silent Hamster Exercise Wheel, 9-in', 22.99, '', 'wheel'],
  ]),
  ...C(10852, 'bag', [
    ['Marshall', 'Marshall Premium Ferret Diet, 4-lb bag', 17.99],
  ]),
  ...C(989, 'cage', [
    ['Kaytee', 'Kaytee Clean & Cozy Natural Small Animal Bedding, 85-L', 21.99, '', 'bag'],
    ['MidWest', 'MidWest Guinea Habitat Plus Guinea Pig Cage', 64.99, '', 'habitat'],
  ]),
  ...C(1066, 'chew', [
    ['Kaytee', 'Kaytee Apple Orchard Sticks Small Animal Chew Treats, 1.7-oz', 3.99, '', 'pouch'],
  ]),
  // ── Pet bird ───────────────────────────────────────────────────────────
  ...C(942, 'bag', [
    ['Kaytee', 'Kaytee Forti-Diet Pro Health Parakeet Food, 5-lb bag', 11.99],
    ['ZuPreem', 'ZuPreem FruitBlend Flavor with Natural Fruit Flavors Medium Bird Food, 2-lb bag', 14.99],
    ["Lafeber's", "Lafeber's Classic Avi-Cakes Macaw & Cockatoo Food, 1-lb", 14.99, '', 'box'],
  ]),
  ...C(953, 'cage', [
    ['Prevue Pet Products', 'Prevue Pet Products Wrought Iron Flight Bird Cage, Hammertone Black', 169.99],
  ]),
  ...C(968, 'perch', [
    ['JW Pet', 'JW Pet Comfy Perch for Birds, Medium, 24-in', 10.99, '', 'rope'],
  ]),
  // ── Fish ───────────────────────────────────────────────────────────────
  ...C(886, 'canister', [
    ['TetraMin', 'TetraMin Tropical Flakes Fish Food, 2.2-oz', 8.49],
    ['Omega One', 'Omega One Freshwater Flakes Fish Food, 2.2-oz', 8.99],
  ]),
  ...C(13939, 'bag', [
    ['Hikari', 'Hikari Gold Koi & Pond Fish Food, Medium Pellet, 4.4-lb bag', 49.99],
  ]),
  ...C(1735, 'tank', [
    ['Aqueon', 'Aqueon LED Aquarium Starter Kit, 20-gal', 129.99],
    ['Fluval', 'Fluval Flex Aquarium Kit, 15-gal, Black', 199.99],
    ['Marineland', 'Marineland Portrait Glass LED Aquarium Kit, 5-gal', 89.99],
  ]),
  ...C(924, 'filter', [
    ['Fluval', 'Fluval 307 Performance Canister Aquarium Filter', 169.99],
    ['AquaClear', 'AquaClear Power Aquarium Filter, 50-gal', 49.99],
    ['Tetra', 'Tetra Whisper EX Power Aquarium Filter, 30-gal', 21.99],
  ]),
  ...C(115950, 'bottle', [
    ['API', 'API Freshwater Master Aquarium Water Test Kit', 34.99, '', 'box'],
    ['Seachem', 'Seachem Prime Fresh & Saltwater Conditioner, 250-mL', 13.99],
  ]),
  ...C(115958, 'pail', [
    ['Instant Ocean', 'Instant Ocean Sea Salt for Marine Aquariums, 50-gal mix', 21.99],
  ]),
  ...C(1737, 'decor', [
    ['Penn-Plax', 'Penn-Plax Sunken Shipwreck Aquarium Ornament, Large', 14.99],
  ]),
  // ── Reptile ────────────────────────────────────────────────────────────
  ...C(1026, 'canister', [
    ['Zoo Med', 'Zoo Med Natural Bearded Dragon Food Adult Formula, 10-oz', 13.99],
    ['Tetrafauna', 'Tetrafauna ReptoMin Floating Food Sticks, 3.7-oz', 9.49],
    ["Fluker's", "Fluker's Dried Mealworms Reptile Food, 6-oz", 12.99],
  ]),
  ...C(1036, 'tank', [
    ['Zoo Med', 'Zoo Med ReptiHabitat Bearded Dragon Terrarium Kit, 40-gal', 229.99],
    ['Exo Terra', 'Exo Terra Glass Terrarium, 18 x 18 x 24-in', 189.99],
  ]),
  ...C(1047, 'lamp', [
    ['Zoo Med', 'Zoo Med ReptiSun T5 HO Terrarium UVB Lamp, 24-in', 59.99],
    ['Zoo Med', 'Zoo Med ReptiTherm Under Tank Reptile Heater, Medium', 24.99, '', 'box'],
  ]),
  ...C(129078, 'box', [
    ["Josh's Frogs", "Josh's Frogs Live Dubia Roaches Reptile Food, Medium, 50 count", 24.99],
  ]),
  ...C(14018, 'bag', [
    ['Zoo Med', 'Zoo Med Aspen Snake Bedding, 24-qt bag', 17.99],
  ]),
]

// Packaging colours for brand-labelled illustrations (approximate brand palettes).
export const BRAND_COLORS = {
  'Purina Pro Plan': '#1b2a4a', 'Purina ONE': '#c8102e', 'Purina Puppy Chow': '#d71920', 'Purina Cat Chow': '#d71920', 'Purina Beneful': '#e35205',
  'Purina Pro Plan Veterinary Diets': '#1b2a4a', 'Purina DentaLife': '#00857c', "Purina Waggin' Train": '#7a2a1d', Purina: '#c8102e',
  'Blue Buffalo': '#1e4c9a', "Hill's Science Diet": '#0067b1', "Hill's Prescription Diet": '#5b2c83', 'Royal Canin': '#e2001a', 'Royal Canin Veterinary Diet': '#e2001a',
  'American Journey': '#2e5e4e', 'Taste of the Wild': '#4b3a2a', 'Wellness CORE': '#3d2a1f', Wellness: '#4f7a35', Nutro: '#00703c', Pedigree: '#f6c400',
  Merrick: '#6b1f2a', Instinct: '#1a1a1a', 'Diamond Naturals': '#2a5a2a', Iams: '#2a6db0', 'Rachael Ray Nutrish': '#e47b10', Cesar: '#b4001e',
  "Tylee's": '#f1a33a', "Stella & Chewy's": '#7a1f2b', Freshpet: '#00843d', Greenies: '#3aa935', 'Milk-Bone': '#c8102e', "Zuke's": '#ef7c00',
  Frisco: '#1c49c2', KONG: '#d6001c', Chuckit: '#f47b20', 'Chuckit!': '#f47b20', Nylabone: '#00a3e0', Benebone: '#3b2a20', 'Fancy Feast': '#6c2a7a', Friskies: '#e4002b',
  'Tiki Cat': '#00808a', Weruva: '#f58025', Sheba: '#5e1a3c', Temptations: '#6a1d84', 'Tidy Cats': '#00843d', 'Fresh Step': '#2fa84f', 'Arm & Hammer': '#e4002b',
  "Dr. Elsey's": '#003a70', "World's Best Cat Litter": '#4a7c2c', 'sWheat Scoop': '#d38b1d', 'Feline Pine': '#2f6b3a', PrettyLitter: '#7b61ff', Boxiecat: '#ff6b6b',
  Seresto: '#00548c', Frontline: '#e05206', 'K9 Advantix II': '#00843d', 'Advantage II': '#6c2d91', Capstar: '#0057a6', 'Zesty Paws': '#00a19a', Nutramax: '#00447c',
  NexGard: '#f39200', 'Simparica Trio': '#00558c', Bravecto: '#00a1c9', 'Heartgard Plus': '#c8102e', 'Interceptor Plus': '#00609c', Apoquel: '#0076a8', Galliprant: '#00788a',
  Oxbow: '#5a7d2a', Kaytee: '#e0182d', ZuPreem: '#e4572e', TetraMin: '#d7262d', Tetra: '#d7262d', Tetrafauna: '#d7262d', Fluval: '#0091d0', Aqueon: '#005eb8',
  'Zoo Med': '#0d6b3a', "Wagner's": '#1d6f42', Lyric: '#3a2a6b', 'Manna Pro': '#00703c', Inaba: '#e83828', Hartz: '#003da5', 'Earth Rated': '#2b8a3e',
  "Nature's Miracle": '#5b2d8e', 'Rocco & Roxie': '#00a3ad', Bissell: '#4b2a85', FURminator: '#00a14b', TropiClean: '#00a3ad', Earthbath: '#7a9a3a',
  Embark: '#2a2d6e', 'Wisdom Panel': '#00a99d', Feliway: '#6a2c91', Adaptil: '#00843d', ThunderShirt: '#5b6670', PetSafe: '#00a3e0', Whisker: '#222',
}
