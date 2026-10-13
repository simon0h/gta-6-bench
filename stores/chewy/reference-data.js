// Site structure of www.chewy.com captured with WebFetch on 2026-10-13
// (header mega menu, homepage sections, footer, category page layouts).
// Paths mirror the real site so agents meet the same URLs. No product
// inventory lives here: category pages render structure only.
// See research/parity/chewy.json for the checklist and sources.

const g = (label, path, items = [], extra = {}) => ({ label, path, items: items.map(([l, p, h1]) => ({ label: l, path: p, ...(h1 ? { h1 } : {}) })), ...extra })

export const DOG_MENU = [
  g('Food', '/b/food-332', [['Dry Food', '/b/dry-food-294', 'Dry Dog Food'], ['Wet Food', '/b/wet-food-293', 'Wet Dog Food'], ['Fresh Food & Toppers', '/b/fresh-dog-food-8321', 'Fresh Dog Food & Toppers'], ['Veterinary Diets', '/b/vet-diet-dog-food-459', 'Veterinary Diet Dog Food'], ['Shop by Health Condition', '/b/science-backed-formulas-139702', 'Dog Food by Health Condition'], ['Puppy Food', '/b/puppy-food-2284']], { h1: 'Dog Food' }),
  g('Treats', '/b/treats-335', [['Bones, Bully Sticks & Naturals', '/b/bones-bully-sticks-chews-1540'], ['Soft & Chewy Treats', '/b/soft-dog-treats-1538', 'Soft & Chewy Dog Treats'], ['Dental Treats', '/b/dental-dog-treats-1539', 'Dental Dog Treats'], ['Biscuits & Cookies', '/b/dog-cookies-and-biscuits-1537', 'Dog Biscuits & Cookies'], ['Long-Lasting Chews', '/b/long-lasting-dog-chews-9938', 'Long-Lasting Dog Chews'], ['Jerky Treats', '/b/jerky-treats-for-dogs-1546', 'Jerky Dog Treats'], ['Freeze-Dried & Dehydrated', '/b/freeze-dried-dehydrated-treats-1547', 'Freeze-Dried & Dehydrated Dog Treats'], ['Lickable Treats', '/b/lickable-dog-treats-11556', 'Lickable Dog Treats']], { h1: 'Dog Treats' }),
  g('Health & Pharmacy', '/b/health-pharmacy-372', [['Flea & Tick', '/b/flea-tick-381', 'Dog Flea & Tick'], ['Vitamins & Supplements', '/b/vitamins-supplements-374', 'Dog Vitamins & Supplements'], ['Probiotics & Digestive Health', '/b/digestive-health-probiotics-1565', 'Dog Probiotics & Digestive Health'], ['Allergy & Itch Relief', '/b/dog-allergy-relief-129950', 'Dog Allergy & Itch Relief'], ['Heartworm & Dewormers', '/b/heartworm-prevention-dewormers-for-dogs-2652', 'Dog Heartworm & Dewormers'], ['Pharmacy & Prescriptions', '/b/prescription-medicine-for-dogs-11561', 'Dog Pharmacy & Prescriptions'], ['Anxiety & Calming Care', '/b/dog-calming-aids-379', 'Dog Anxiety & Calming Care'], ['Test Kits', '/b/health-dna-test-kits-3431438', 'Dog Test Kits']], { h1: 'Dog Health & Pharmacy' }),
  g('Supplies', '/b/dog-288', [['Crates, Pens & Gates', '/b/dog-enclosures-and-barriers-364', 'Dog Crates, Pens & Gates'], ['Beds', '/b/dog-beds-365', 'Dog Beds'], ['Tech & Smart Home', '/b/dog-technology-products-1897', 'Dog Tech & Smart Home'], ['Leashes, Collars & Harnesses', '/b/dog-leashes-and-collars-344', 'Dog Leashes, Collars & Harnesses'], ['Bowls & Feeders', '/b/dog-feeding-supplies-and-accessories-338', 'Dog Bowls & Feeders'], ['Clothing & Accessories', '/b/clothing-accessories-1470', 'Dog Clothing & Accessories'], ['Carriers & Travel', '/b/dog-travel-accessories-and-gear-371', 'Dog Carriers & Travel'], ['Training & Behavior', '/b/dog-training-supplies-and-tools-1449', 'Dog Training & Behavior'], ['Shop all Dog', '/b/dog-288']]),
  g('Toys', '/b/toys-315', [['Plush Toys', '/b/dog-plush-toy-320', 'Plush Dog Toys'], ['Chew Toys', '/b/chew-toys-316', 'Dog Chew Toys'], ['Fetch Toys', '/b/dog-fetch-toys-317', 'Dog Fetch Toys'], ['Treat Dispensing Toys', '/b/treat-toys-dispensers-2336', 'Treat Dispensing Dog Toys'], ['Puzzle Toys', '/b/puzzle-toys-games-2335', 'Dog Puzzle Toys'], ['Rope & Tug Toys', '/b/dog-rope-and-tug-toys-321', 'Dog Rope & Tug Toys']], { h1: 'Dog Toys' }),
  g('Cleaning & Potty', '/b/dog-potty-cleaning-and-training-supplies-351', [['Pee Pads & Diapers', '/b/pee-pads-diapers-360', 'Dog Pee Pads & Diapers'], ['Poop Bags & Scoopers', '/b/dog-poop-supplies-and-gear-354', 'Dog Poop Bags & Scoopers'], ['Cleaners & Stain Removers', '/b/dog-stain-remover-353', 'Dog Cleaners & Stain Removers'], ['Vacuums & Steam Cleaners', '/b/vacuums-steam-cleaners-1985', 'Vacuums & Steam Cleaners']], { h1: 'Dog Cleaning & Potty' }),
  g('Grooming', '/b/dog-grooming-supplies-and-tools-355', [['Brushes & Combs', '/b/dog-brush-356', 'Dog Brushes & Combs'], ['Shampoos & Conditioners', '/b/dog-shampoo-and-conditioner-358', 'Dog Shampoos & Conditioners'], ['Grooming Tools', '/b/dog-grooming-tools-359', 'Dog Grooming Tools'], ['Paw & Nail Care', '/b/dog-paw-and-nail-care-2397', 'Dog Paw & Nail Care'], ['Ear Care', '/b/dog-ear-care-361', 'Dog Ear Care'], ['Skin Care', '/b/skin-care-1433', 'Dog Skin Care']], { h1: 'Dog Grooming' }),
]

export const CAT_MENU = [
  g('Food', '/b/food-387', [['Wet Food', '/b/wet-food-389', 'Wet Cat Food'], ['Dry Food', '/b/dry-food-388', 'Dry Cat Food'], ['Shop by Health Consideration', '/b/science-backed-formulas-141910', 'Cat Food by Health Consideration'], ['Veterinary Diets', '/b/veterinary-diets-460', 'Veterinary Diet Cat Food'], ['Highest Quality Food', '/b/highest-quality-cat-food-11741', 'Highest Quality Cat Food'], ['Food Toppers', '/b/cat-food-toppers-392', 'Cat Food Toppers'], ['Kitten Food', '/b/kitten-food-2293']], { h1: 'Cat Food' }),
  g('Litter', '/b/litter-411', [['Clumping', '/b/clumping-cat-litter-10658', 'Clumping Cat Litter'], ['Scented', '/b/scented-cat-litter-10660', 'Scented Cat Litter'], ['Unscented', '/b/unscented-cat-litter-10661', 'Unscented Cat Litter'], ['Natural', '/b/natural-cat-litter-10664', 'Natural Cat Litter'], ['Lightweight', '/b/lightweight-10662', 'Lightweight Cat Litter'], ['Crystal', '/b/crystal-cat-litter-167878', 'Crystal Cat Litter']], { h1: 'Cat Litter' }),
  g('Treats', '/b/treats-391', [['Crunchy Treats', '/b/crunchy-cat-treats-1552', 'Crunchy Cat Treats'], ['Lickable Treats', '/b/lickable-cat-treats-2275', 'Lickable Cat Treats'], ['Soft & Chewy Treats', '/b/soft-cat-treats-1553', 'Soft & Chewy Cat Treats'], ['Dental Treats', '/b/dental-treats-12803', 'Dental Cat Treats'], ['Catnip', '/b/catnip-1555'], ['Cat Grass', '/b/cat-grass-167950']], { h1: 'Cat Treats' }),
  g('Supplies', '/b/cat-325', [['Litter Boxes & Accessories', '/b/cat-litter-boxes-and-supplies-410', 'Cat Litter Boxes & Accessories'], ['Tech & Smart Home', '/b/technology-products-for-cats-8311', 'Cat Tech & Smart Home'], ['Beds', '/b/beds-425', 'Cat Beds'], ['Carriers & Travel', '/b/cat-travel-accessories-and-carriers-454', 'Cat Carriers & Travel'], ['Bowls & Feeders', '/b/cat-feeding-and-water-supplies-394', 'Cat Bowls & Feeders'], ['Grooming', '/b/cat-grooming-supplies-and-accessories-432', 'Cat Grooming'], ['Collars, Leashes & Harnesses', '/b/cat-leashes-and-harnesses-400', 'Cat Collars, Leashes & Harnesses'], ['Shop all Cat', '/b/cat-325']]),
  g('Health & Pharmacy', '/b/health-pharmacy-415', [['Flea & Tick', '/b/flea-tick-404', 'Cat Flea & Tick'], ['Vitamins & Supplements', '/b/vitamins-supplements-417', 'Cat Vitamins & Supplements'], ['Probiotics & Digestive Health', '/b/digestive-health-probiotics-1577', 'Cat Probiotics & Digestive Health'], ['Allergy & Itch Relief', '/b/cat-allergy-relief-129902', 'Cat Allergy & Itch Relief'], ['Pharmacy & Prescriptions', '/b/prescription-medicine-for-cats-11589', 'Cat Pharmacy & Prescriptions'], ['Anxiety & Calming Care', '/b/anxiety-calming-care-422', 'Cat Anxiety & Calming Care'], ['Urinary Tract & Kidneys', '/b/cat-urinary-tract-kidney-care-129942', 'Cat Urinary Tract & Kidney Care'], ['Test Kits', '/b/cat-health-tests-2690', 'Cat Test Kits']], { h1: 'Cat Health & Pharmacy' }),
  g('Trees & Scratchers', '/b/cat-furniture-456', [['Trees & Condos', '/b/trees-condos-1482', 'Cat Trees & Condos'], ['Scratchers & Scratching Posts', '/b/cat-scratching-post-1484', 'Cat Scratchers & Scratching Posts'], ['Wall Shelves', '/b/cat-shelves-9028', 'Cat Wall Shelves'], ['Window Perches', '/b/window-perches-2327', 'Cat Window Perches']], { h1: 'Cat Trees & Scratchers' }),
  g('Toys', '/b/toys-326', [['Interactive & Electronic Toys', '/b/interactive-electronic-toys-327', 'Interactive & Electronic Cat Toys'], ['Scratchers', '/b/scratchers-393', 'Cat Scratcher Toys'], ['Teasers & Wands', '/b/cat-toy-wands-1421', 'Cat Teasers & Wands'], ['Balls & Chasers', '/b/balls-chasers-329', 'Cat Balls & Chasers'], ['Catnip Toys', '/b/catnip-toys-11130'], ['Plush & Mice Toys', '/b/plush-mice-toys-328', 'Plush & Mice Cat Toys']], { h1: 'Cat Toys' }),
]

export const OTHER_ANIMALS_MENU = [
  g('Horse', '/b/horse-supplies-and-accessories-1663', [['Feed', '/b/horse-feed-2744', 'Horse Feed'], ['Treats', '/b/horse-treats-2745', 'Horse Treats'], ['Blankets and Sheets', '/b/horse-blankets-sheets-and-masks-11452', 'Horse Blankets and Sheets'], ['Tack', '/b/horse-tack-and-saddlery-supplies-11439', 'Horse Tack'], ['Health and Wellness', '/b/horse-health-products-1691', 'Horse Health and Wellness'], ['Dewormers', '/b/horse-dewormers-10437', 'Horse Dewormers'], ['Vitamins and Supplements', '/b/horse-vitamins-and-supplements-1692', 'Horse Vitamins and Supplements']], { h1: 'Horse Supplies' }),
  g('Chicken', '/b/chicken-supplies-and-accessories-12992', [['Feed', '/b/chicken-feed-951', 'Chicken Feed'], ['Treats', '/b/chicken-treats-12995', 'Chicken Treats'], ['Feeders, Waterers and Deicers', '/b/chicken-feeders-and-waterers-13023', 'Chicken Feeders, Waterers and Deicers'], ['Chick Starter Feed', '/b/chick-starter-feed-128950'], ['Nesting and Egg Supplies', '/b/chicken-nesting-supplies-13024', 'Chicken Nesting and Egg Supplies'], ['Coops and Accessories', '/b/chicken-coop-accessories-16621', 'Chicken Coops and Accessories'], ['Vitamins and Healthcare', '/b/chicken-vitamins-and-healthcare-13025', 'Chicken Vitamins and Healthcare']], { h1: 'Chicken Supplies' }),
  g('Livestock', '/b/farm-and-livestock-supplies-8403', [['Cattle', '/b/cattle-supplies-and-accessories-12725', 'Cattle Supplies'], ['Goat', '/b/goat-supplies-and-accessories-12732', 'Goat Supplies'], ['Pig', '/b/pig-supplies-and-accessories-12736', 'Pig Supplies'], ['Sheep', '/b/sheep-supplies-and-accessories-12740', 'Sheep Supplies'], ['Llama and Alpaca', '/b/llama-and-alpaca-supplies-12745', 'Llama and Alpaca Supplies'], ['Livestock Feed', '/b/animal-and-livestock-feed-8405'], ['Livestock Supplements', '/b/livestock-supplements-9923']], { h1: 'Livestock Supplies' }),
  g('Wild Bird & Wildlife', '/b/wildlife-supplies-139606', [['Wild Bird', '/b/wild-bird-supplies-12931', 'Wild Bird Supplies'], ['Wild Bird Food', '/b/wild-bird-food-950'], ['Wild Bird Seed', '/b/wild-bird-seed-11893'], ['Wild Bird Suet', '/b/wild-bird-suet-11896'], ['Wild Bird Feeders', '/b/wild-bird-feeders-1744'], ['Hummingbird Supplies', '/b/hummingbird-supplies-and-accessories-139902'], ['Duck and Waterfowl', '/b/duck-supplies-139622', 'Duck and Waterfowl Supplies']], { h1: 'Wild Bird & Wildlife Supplies' }),
  g('Small Animal', '/b/small-animal-supplies-and-accessories-977', [['Rabbit', '/b/rabbit-supplies-and-accessories-10850', 'Rabbit Supplies'], ['Guinea Pig', '/b/guinea-pig-supplies-and-accessories-10851', 'Guinea Pig Supplies'], ['Hamster', '/b/hamster-supplies-and-accessories-10853', 'Hamster Supplies'], ['Ferret', '/b/ferret-supplies-and-accessories-10852', 'Ferret Supplies'], ['Rat', '/b/rat-supplies-and-accessories-10854', 'Rat Supplies'], ['Enclosures & Habitat Accessories', '/b/small-animal-enclosures-and-habitat-accessories-989', 'Small Animal Enclosures & Habitat Accessories'], ['Toys', '/b/small-animal-toys-1066', 'Small Animal Toys']], { h1: 'Small Animal Supplies' }),
  g('Pet Bird', '/b/bird-supplies-and-accessories-941', [['Parrot', '/b/parrot-supplies-and-accessories-12964', 'Parrot Supplies'], ['Parakeet', '/b/parakeet-supplies-and-accessories-12934', 'Parakeet Supplies'], ['Cockatiel', '/b/cockatiel-supplies-and-accessories-12943', 'Cockatiel Supplies'], ['Toys', '/b/bird-toys-970', 'Bird Toys'], ['Cages and Accessories', '/b/bird-cages-and-accessories-953', 'Bird Cages and Accessories'], ['Food', '/b/bird-food-942', 'Bird Food'], ['Perches', '/b/bird-perches-968', 'Bird Perches']], { h1: 'Bird Supplies' }),
  g('Fish', '/b/fish-and-aquarium-supplies-885', [['Freshwater Fish Supplies', '/b/freshwater-fish-supplies-115950'], ['Saltwater Fish Supplies', '/b/saltwater-aquarium-supplies-115958'], ['Koi and Pond Supplies', '/b/fish-pond-supplies-and-accessories-13939'], ['Fish Food', '/b/fish-food-886'], ['Aquariums and Fish Tanks', '/b/aquariums-and-fish-tanks-1735'], ['Fish Tank Filters and Media', '/b/aquarium-and-fish-tank-filters-and-media-924'], ['Aquarium Decorations', '/b/aquarium-and-fish-tank-decorations-1737']], { h1: 'Fish & Aquarium Supplies' }),
  g('Reptile & Amphibian', '/b/reptile-supplies-and-accessories-1025', [['Bearded Dragon', '/b/bearded-dragon-13997', 'Bearded Dragon Supplies'], ['Snake', '/b/snake-supplies-and-accessories-14018', 'Snake Supplies'], ['Aquatic Turtle', '/b/turtle-14011', 'Aquatic Turtle Supplies'], ['Live Feeder Insects', '/b/live-feeder-bugs-and-insects-129078'], ['Food & Treats', '/b/reptile-food-1026', 'Reptile Food & Treats'], ['Tanks & Terrariums', '/b/reptile-tank-and-enclosures-1036', 'Reptile Tanks & Terrariums'], ['Heating & Lighting', '/b/reptile-heat-lamps-heaters-and-lighting-1047', 'Reptile Heating & Lighting']], { h1: 'Reptile Supplies' }),
]

export const PHARMACY_MENU = [
  g('Pharmacy', '/b/pharmacy-2515', [['How it works', '/b/pharmacy-15697', 'How Chewy Pharmacy Works'], ['Chewy Vet Care', '/vet-care'], ['Connect with a Vet', '/b/connect-vet-16616'], ['CarePlus', '/pet-insurance'], ['Compounded Medications', '/b/pet-compounding-pharmacy-11718'], ['Learn about compounding', '/b/learn-about-compounding-169822', 'Learn About Compounding']], { h1: 'Pet Pharmacy' }),
  g('Dog', '/b/prescription-medicine-for-dogs-11561', [['Prescription Flea & Tick', '/b/prescription-flea-tick-prevention-11563', 'Prescription Flea & Tick for Dogs'], ['Heartworm Prevention', '/b/heartworm-prevention-dewormers-11562', 'Dog Heartworm Prevention'], ['Pain Relief & Arthritis', '/b/pain-relief-arthritis-11566', 'Dog Pain Relief & Arthritis'], ['Antibiotics & Antifungals', '/b/dog-antibiotics-11574', 'Dog Antibiotics & Antifungals'], ['Allergy Relief', '/b/allergy-immune-support-11568', 'Dog Allergy Relief'], ['Anxiety & Calming', '/b/behavioral-support-anxiety-11580', 'Dog Anxiety & Calming Medication'], ['Ear & Skin Conditions', '/b/ear-skin-conditions-11571', 'Dog Ear & Skin Conditions'], ['Eye Drops & Ointments', '/b/eye-medicine-for-dogs-11570', 'Dog Eye Drops & Ointments'], ['Urinary & Kidney', '/b/urinary-tract-medicine-for-dogs-11588', 'Dog Urinary & Kidney Medication'], ['Diabetes Care & Insulin', '/b/diabetes-care-and-insulin-for-dogs-11576', 'Dog Diabetes Care & Insulin']], { h1: 'Dog Pharmacy & Prescriptions' }),
  g('Cat', '/b/prescription-medicine-for-cats-11589', [['Prescription Flea & Tick', '/b/prescription-flea-tick-prevention-11591', 'Prescription Flea & Tick for Cats'], ['Dewormers & Parasiticides', '/b/worm-medicine-for-cats-11609', 'Cat Dewormers & Parasiticides'], ['Eye Drops & Ointments', '/b/cat-eye-medicine-11598', 'Cat Eye Drops & Ointments'], ['Antibiotics & Antifungals', '/b/cat-antibiotics-11602', 'Cat Antibiotics & Antifungals'], ['Allergy Relief', '/b/cat-allergy-medicine-11596', 'Cat Allergy Relief'], ['Anxiety & Calming', '/b/cat-anxiety-medication-11608', 'Cat Anxiety & Calming Medication'], ['Urinary & Kidney', '/b/cat-uti-medicine-11616', 'Cat Urinary & Kidney Medication'], ['Thyroid & Hormone', '/b/thyroid-medication-for-cats-11615', 'Cat Thyroid & Hormone Medication'], ['Pain Relief & Arthritis', '/b/pain-relief-medicine-for-cats-11594', 'Cat Pain Relief & Arthritis'], ['Diabetes Care & Insulin', '/b/diabetes-care-insulin-11604', 'Cat Diabetes Care & Insulin']], { h1: 'Cat Pharmacy & Prescriptions' }),
  g('Horse', '/b/horse-health-products-1691', [['Joint and Anti-Inflammatory', '/b/anti-inflammatory-musculoskelatal-136036', 'Horse Joint and Anti-Inflammatory'], ['Metabolic and Endocrine', '/b/metabolic-medicine-for-horses-11638', 'Horse Metabolic and Endocrine'], ['Calming and Behavioral Support', '/b/calming-medication-for-horses-11631', 'Horse Calming and Behavioral Support'], ['Pain Medicine', '/b/pain-medicine-for-horses-136044', 'Horse Pain Medicine'], ['Antibiotics', '/b/horse-antibiotics-11625', 'Horse Antibiotics'], ['Allergy and Immune', '/b/allergy-medicine-for-horses-11619', 'Horse Allergy and Immune'], ['Vitamins and Electrolytes', '/b/horse-electrolytes-11633', 'Horse Vitamins and Electrolytes']]),
]

export const SERVICES_MENU = [
  { label: 'Chewy Vet Care', path: '/vet-care', text: 'Routine and urgent care from Chewy veterinary teams at local clinics.' },
  { label: 'Connect with a Vet', path: '/b/connect-vet-16616', text: 'Chat for free with a licensed vet tech.' },
  { label: 'CarePlus Pet Insurance & Wellness Plans', path: '/pet-insurance', text: 'Give your pet the best possible health coverage with pet insurance and wellness plans.' },
  { label: 'Pharmacy', path: '/b/pharmacy-2515', text: 'Prescription meds, delivered fast.' },
]

export const EDUCATION_MENU = [
  ['Dog', '/education/dog'], ['Cat', '/education/cat'], ['Horse', '/education/horse'], ['Fish', '/education/fish'],
  ['Dog Breeds', '/education/dog-breeds'], ['Cat Breeds', '/education/cat-breeds'], ['Bird', '/education/bird'],
  ['Farm Animal', '/education/farm-animal'], ['Ferret', '/education/small-pet/ferret'], ['Guinea Pig', '/education/small-pet/guinea-pig'],
  ['Hamster', '/education/small-pet/hamster'], ['Rabbit', '/education/small-pet/rabbit'], ['Rats & Mice', '/education/small-pet/rat-and-mouse'],
  ['Reptile', '/education/reptile-and-amphibian'], ['Sugar Glider', '/education/small-pet/sugar-glider'], ['Small Pet', '/education/small-pet'],
  ['Wildlife', '/education/wildlife'], ['All Pets', '/education'],
].map(([label, path]) => ({ label, path }))

export const PICKS_MENU = [
  ['Best Dog Supplies', '/best/dog-supplies_s100968'], ['Best Cat Supplies', '/best/cat-supplies_s112080'], ['Best Horse Supplies', '/best/horse-supplies_s123854'],
  ['Best Fish Supplies', '/best/fish-aquarium-supplies_s121446'], ['Best Reptile Supplies', '/best/reptile-supplies_s122326'], ['Best Bird Supplies', '/best/bird-supplies_s122318'],
  ['Best Small Animal Supplies', '/best/small-animal-supplies_s121454'],
].map(([label, path]) => ({ label, path }))

export const GIVE_BACK_MENU = [
  { label: 'How We Give Back', path: '/g/give-back', h1: 'Helping More People Bring Love Home', sections: ["It's Never Been Easier To Give Back", 'Give Essentials to Rescues in Need', 'Adoptable Pets in Need of Loving Homes', 'You Give Hope, We Give Back', 'Shelters and Rescues Near You', 'Are You Part of a Shelter or Rescue?'] },
  { label: 'Donate to a Rescue', path: '/g/animal-shelters-and-rescues', h1: 'Donate to Animal Shelters & Rescues', sections: ['Find a shelter or rescue near you', 'Shop a rescue Wish List', 'How donations reach the rescue'] },
  { label: 'Find Pets to Adopt', path: '/g/search-adoptable-pets', h1: 'Find Adoptable Pets Near You', sections: ['Search adoptable pets', 'Dogs for adoption', 'Cats for adoption', 'Getting ready to adopt'] },
  { label: 'Join Our Network', path: '/g/shelter-partners', h1: 'Join the Chewy Shelter & Rescue Network', sections: ['Who can join', 'Network benefits', 'How to apply'] },
]

export const BRANDS = [
  { label: 'Made by Chewy', path: '/brands/made-by-chewy', text: 'Chewy’s own brands, including Frisco, American Journey, Tylee’s and Vibeful.' },
  { label: 'Purina Pro Plan', path: '/brands/purina-pro-plan', text: 'Science-backed nutrition for dogs and cats.' },
  { label: "Hill's", path: '/brands/hills', text: 'Hill’s Science Diet and Hill’s Prescription Diet formulas.' },
  { label: 'Blue Buffalo', path: '/brands/blue-buffalo', text: 'Natural pet food made with real meat first.' },
  { label: 'Royal Canin', path: '/brands/royal-canin', text: 'Tailored nutrition by size, breed and life stage.' },
  { label: 'Bark', path: '/brands/bark', text: 'Themed toys and treats for dogs.' },
  { label: "Hill's Prescription Diet", path: '/brands/hills-prescription-diet-6879', text: 'Therapeutic nutrition available with your veterinarian’s authorization.' },
]

// Shop all pets, friends & more (homepage + department tiles) — real slugs.
export const PET_TILES = [
  ['Dog', '/b/dog-288'], ['Cat', '/b/cat-325'], ['Horse', '/b/horse-1663'], ['Pet Parent', '/b/pet-parents-15439'],
  ['Wild Bird', '/b/wild-bird-12931'], ['Small Pet', '/b/small-pet-977'], ['Pet Bird', '/b/bird-941'], ['Fish', '/b/fish-885'],
  ['Reptile', '/b/reptile-1025'], ['Chicken', '/b/chicken-12992'], ['Livestock', '/b/farm-animal-8403'],
].map(([label, path]) => ({ label, path }))

export const POPULAR_CATEGORIES = [
  ['Dog Food', '/b/food-332'], ['Dog Flea & Tick', '/b/flea-tick-381'], ['Dog Treats', '/b/treats-335'],
  ['Cat Food', '/b/food-387'], ['Cat Litter', '/b/litter-411'], ['Deals', '/deals/todays-deals-2723'],
].map(([label, path]) => ({ label, path }))

export const SORTS = ['Relevance', 'Newest', 'Bestselling', 'Price: Low to High', 'Price: High to Low', 'Avg. Customer Review', 'Most Reviewed']

// Department landing pages with the tiles, filters and FAQ the real pages show.
export const DEPARTMENTS = {
  288: { animal: 'Dog', h1: 'Dog Supplies', banner: 'Get your dog all set for fall', tiles: [['Food', '/b/food-332'], ['Treats', '/b/treats-335'], ['Toys', '/b/toys-315'], ['Collars & Harnesses', '/b/dog-leashes-and-collars-344'], ['Flea & Tick', '/b/flea-tick-381'], ['Beds', '/b/dog-beds-365'], ['Crates & Kennels', '/b/dog-enclosures-and-barriers-364'], ['Vitamins & Supplements', '/b/vitamins-supplements-374'], ['Grooming', '/b/dog-grooming-supplies-and-tools-355']], filters: ['Autoship', 'Brand', 'Breed Size', 'Product Category', 'Lifestage', 'Price', 'Customer Rating'], faq: [['What essential dog supplies do I need before bringing home a new dog?', 'Start with food and bowls, a collar or harness with ID tags, a leash, a crate or bed, chew toys, poop bags and basic grooming tools. Your veterinarian can recommend preventatives such as flea, tick and heartworm medication.']] },
  325: { animal: 'Cat', h1: 'Cat Supplies', banner: 'Get your cat all set for fall', tiles: [['Wet Food', '/b/wet-food-389'], ['Dry Food', '/b/dry-food-388'], ['Litter', '/b/litter-411'], ['Trees, Condos & Scratchers', '/b/cat-furniture-456'], ['Toys', '/b/toys-326'], ['Treats', '/b/treats-391'], ['Litter Boxes & Accessories', '/b/cat-litter-boxes-and-supplies-410'], ['Beds', '/b/beds-425'], ['Health & Pharmacy', '/b/health-pharmacy-415']], filters: ['Autoship', 'Brand', 'Price', 'Customer Rating'], faq: [['What essential cat supplies do I need before bringing home a new cat?', 'Plan for food and water bowls, a litter box with litter and a scoop, a scratcher, a carrier, a bed and a few toys. A first veterinary visit helps you choose the right food and preventatives.']] },
  2515: { animal: 'Pet', h1: 'Pet Pharmacy', banner: 'Top pharmacy deals', tiles: [['Dog Pharmacy', '/b/prescription-medicine-for-dogs-11561'], ['Cat Pharmacy', '/b/prescription-medicine-for-cats-11589'], ['Horse Pharmacy', '/b/horse-health-products-1691'], ['Compounded Medications', '/b/pet-compounding-pharmacy-11718'], ['Flea & Tick', '/b/prescription-flea-tick-prevention-11563'], ['Heartworm', '/b/heartworm-prevention-dewormers-11562'], ['Pain & Arthritis', '/b/pain-relief-arthritis-11566'], ['Allergy', '/b/allergy-immune-support-11568']], filters: ['Pet', 'Health Condition', 'Drug Type', 'Brand', 'Breed Size', 'Product Form', 'Medication Type', 'Deals & Savings', 'Price', 'Customer Rating'], pharmacy: true, faq: [['Are online pet pharmacies safe?', 'Choose a licensed pharmacy that requires a valid prescription. Chewy Pharmacy is staffed by licensed pharmacists who verify every prescription with your veterinarian.'], ['Where do you fill pet prescriptions?', 'You can fill prescriptions at your vet’s office or with an online pet pharmacy such as Chewy Pharmacy, which contacts your vet for approval before shipping.'], ['How do you get a pet prescription online?', 'Your pet needs a veterinary exam first. Add the medication to your cart, enter your pet’s and vet’s details at checkout and Chewy contacts your vet.']] },
}

export const SPECIAL_PAGES = {
  15439: { h1: 'Pet Parent Supplies', parent: null, tiles: [['Home & Cleaning', '/b/dog-potty-cleaning-and-training-supplies-351'], ['Gift Cards', '/chewy-egift-card/dp/226306'], ['New Arrivals', '/b/new-arrivals-14264']] },
  14264: { h1: 'New Arrivals', banner: 'Explore the latest drops', filters: ['Category', 'Product Category', 'Product Type', 'Bowl & Storage Feature', 'Litter Box Type', 'Food Form', 'Brand', 'Lifestage', 'Breed Size', 'Price', 'Customer Rating'] },
  15682: { h1: 'Autoship & Save', banner: 'Save 35% on your first Autoship order', tiles: [['Dog Food', '/b/food-332'], ['Cat Food', '/b/food-387'], ['Cat Litter', '/b/litter-411'], ['Pharmacy', '/b/pharmacy-2515']] },
  2040: { h1: 'Seasonal Treats', banner: 'Dig up some tasty seasonal treats', tiles: [['Dog Treats', '/b/treats-335'], ['Cat Treats', '/b/treats-391']] },
  15520: { h1: 'Football Shop', banner: 'Gear up for game day fun', tiles: [['Dog Clothing & Accessories', '/b/clothing-accessories-1470'], ['Dog Toys', '/b/toys-315']] },
  159246: { h1: 'Refresh Your Nest', banner: 'Get cozy with fall snuggle essentials', tiles: [['Dog Beds', '/b/dog-beds-365'], ['Cat Beds', '/b/beds-425']] },
  2026: { h1: 'Halloween Shop', banner: 'Shop Halloween costumes, toys & more', tiles: [['Dog Toys', '/b/toys-315'], ['Cat Toys', '/b/toys-326'], ['Dog Clothing & Accessories', '/b/clothing-accessories-1470'], ['Dog Treats', '/b/treats-335']] },
}

export const DEALS = {
  'todays-deals-2723': { h1: "Today's Deals", banner: 'Buy 3, get the 4th free top-rated toys', tiles: ['Dog deals', 'Cat deals', 'Horse deals', 'Pet parent deals', 'Small pet deals', 'Pet bird deals', 'Wild bird deals', 'Fish deals', 'Reptile deals', 'Chicken deals', 'Livestock deals'] },
  '50-off-your-first-autoship-order-3448422': { h1: '50% Off Your First Pharmacy Autoship Order', banner: '50% off your first Autoship order of prescription medication', tiles: ['Dog deals', 'Cat deals', 'Horse deals'] },
  'buy-3-get-4th-free-2685446': { h1: 'Buy 3, Get 4th Free', banner: 'Buy 3, Get 4th FREE: Toys & Costumes', tiles: ['Dog deals', 'Cat deals'] },
}

export const DEAL_TILE_PATH = label => {
  const map = { 'Dog deals': '/b/dog-288', 'Cat deals': '/b/cat-325', 'Horse deals': '/b/horse-1663', 'Pet parent deals': '/b/pet-parents-15439', 'Small pet deals': '/b/small-pet-977', 'Pet bird deals': '/b/bird-941', 'Wild bird deals': '/b/wild-bird-12931', 'Fish deals': '/b/fish-885', 'Reptile deals': '/b/reptile-1025', 'Chicken deals': '/b/chicken-12992', 'Livestock deals': '/b/farm-animal-8403' }
  return map[label] || '/deals/todays-deals-2723'
}

export const TOP_NAV = [
  { label: 'Dog', path: '/b/dog-288', menu: DOG_MENU },
  { label: 'Cat', path: '/b/cat-325', menu: CAT_MENU },
  { label: 'Other Animals', path: '/other-animals', menu: OTHER_ANIMALS_MENU },
  { label: 'Pharmacy', path: '/b/pharmacy-2515', menu: PHARMACY_MENU },
  { label: 'Expert Health Tips', path: '/expert-health-tips', links: [{ label: 'PetMD', path: '/expert-health-tips' }, { label: 'Connect with a Vet', path: '/b/connect-vet-16616' }] },
  { label: 'Services', path: '/services', links: SERVICES_MENU },
  { label: 'Education', path: '/education', links: EDUCATION_MENU },
  { label: 'Chewy Picks', path: '/best', links: PICKS_MENU },
  { label: 'Give Back', path: '/g/give-back', links: GIVE_BACK_MENU },
  { label: 'Popular Brands', path: '/brands', links: BRANDS.slice(0, 6) },
  { label: 'New Arrivals', path: '/b/new-arrivals-14264' },
  { label: 'Deals', path: '/deals/todays-deals-2723' },
]

// Footer links captured from the www.chewy.com/vet-care footer (homepage footer is
// rendered client-side and was not returned by WebFetch). Off-site corporate
// destinations are local summary pages.
export const FOOTER = [
  { heading: 'Chewy', links: [['About', '/app/content/about-us'], ['Investor Relations', '/app/content/investor-relations'], ['Affiliates', '/app/content/affiliate'], ['Jobs', '/app/content/careers'], ['Sell on Chewy', '/app/content/sell-on-chewy']] },
  { heading: 'Customer Care', links: [['FAQs', '/app/content/faq'], ['24/7 Help', '/customer-care'], ['Track Order', '/app/account/orderhistory'], ['Shipping Info', '/app/content/shipping-info'], ['Returns', '/app/content/return-policy']] },
  { heading: 'Explore', links: [['Learn', '/education'], ['Give Back', '/g/give-back'], ['Gift Cards', '/chewy-egift-card/dp/226306'], ['Autoship', '/app/content/autoship'], ['Chewy Vet Care', '/vet-care']] },
]
export const LEGAL = [['Terms of Use', '/app/content/terms-of-use'], ['Privacy Policy', '/app/content/privacy'], ['Interest-Based Ads', '/app/content/interest-based-ads'], ['Accessibility', '/app/content/accessibility'], ['California Supply Chains Act', '/app/content/california-supply-chains-act'], ['Vendor Compliance', '/app/content/vendor-compliance'], ['Site Map', '/app/site-map']]

// Build the /b/<slug>-<id> index from the menus, keyed by trailing numeric id
// (Chewy resolves category pages by that id).
export const idOf = path => (/-(\d+)$/.exec(path) || [])[1]
export const CATEGORIES = new Map()
function add(id, entry) { if (id && !CATEGORIES.has(id)) CATEGORIES.set(id, entry) }
for (const [id, d] of Object.entries(DEPARTMENTS)) add(id, { ...d, kind: 'department', crumbs: [] })
for (const [id, d] of Object.entries(SPECIAL_PAGES)) add(id, { ...d, kind: 'landing', crumbs: [] })
for (const [animal, menu, dept] of [['Dog', DOG_MENU, ['Dog Supplies', '/b/dog-288']], ['Cat', CAT_MENU, ['Cat Supplies', '/b/cat-325']], ['Pet', PHARMACY_MENU, ['Pet Pharmacy', '/b/pharmacy-2515']], ['Other', OTHER_ANIMALS_MENU, null]]) {
  for (const group of menu) {
    const h1 = group.h1 || `${group.label} ${animal === 'Pet' ? 'Pharmacy' : ''}`.trim()
    const crumbs = dept ? [dept] : []
    const tiles = group.items.filter(i => i.path.startsWith('/b/') && i.path !== group.path).map(i => [i.label, i.path])
    const existing = CATEGORIES.get(idOf(group.path))
    if (existing && !existing.tiles?.length) existing.tiles = tiles
    add(idOf(group.path), { kind: 'category', h1, animal, crumbs, tiles })
    for (const item of group.items) add(idOf(item.path), { kind: 'category', h1: item.h1 || item.label, animal, crumbs: [...crumbs, [h1, group.path]], tiles: [] })
  }
}
// Homepage "Shop all pets" aliases share ids with Other Animals departments.
for (const t of PET_TILES) if (!CATEGORIES.has(idOf(t.path))) add(idOf(t.path), { kind: 'landing', h1: `${t.label} Supplies`, crumbs: [], tiles: [] })
