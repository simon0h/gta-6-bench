// Walmart.com everyday assortment for the default (reference) catalog.
//
// The GTA VI listings in data.js stay the only evidence-backed rows (PRODUCTS, inventory.js,
// applyCatalogPolicy). This shelf is a separate array so the store looks and browses like the
// real walmart.com: Grocery and household staples, home, electronics, toys, fashion, beauty, pets,
// baby and seasonal departments, with video games as one slice among many. Titles follow
// walmart.com's "Brand Product, Size" naming; prices are typical walmart.com shelf prices for
// October 2026 (video game rows come from the real Video Games landing page fetched 2026-10-13).
// Ratings, review counts and item ids are simulated. Items are sold and shipped by Walmart.com and
// are recorded as kind: 'other' order lines; they never count as GTA VI purchases.
import { createHash } from 'node:crypto'
import { esc } from '../../lib/html.js'
import { photoStyle, productPhoto } from '../../lib/product-photos.js'

// Department key, walmart.com department name and its tree path (sitetree.js). Keys that match
// catalog.js DEPARTMENTS (groceries, home, electronics, fashion, beauty, pets, toys, games) reuse
// those department pages; the rest are served by the department tree landing pages.
export const SHELF_DEPARTMENTS = [
  { key: 'groceries', name: 'Grocery', path: '/cp/food/976759' },
  { key: 'household', name: 'Household Essentials', path: '/cp/household-essentials/1115193' },
  { key: 'home', name: 'Home, Furniture & Appliances', path: '/cp/home/4044' },
  { key: 'electronics', name: 'Electronics', path: '/cp/electronics/3944' },
  { key: 'games', name: 'Video Games', path: '/cp/video-games/2636' },
  { key: 'toys', name: 'Toys', path: '/cp/toys/4171' },
  { key: 'fashion', name: 'Clothing, Shoes & Accessories', path: '/cp/clothing/5438' },
  { key: 'beauty', name: 'Beauty', path: '/cp/beauty/1085666' },
  { key: 'personal-care', name: 'Personal Care', path: '/cp/personal-care/1005862' },
  { key: 'health', name: 'Pharmacy, Health & Wellness', path: '/cp/health/976760' },
  { key: 'baby', name: 'Baby & Kids', path: '/cp/baby-products/5427' },
  { key: 'pets', name: 'Pets', path: '/cp/pet-supplies/5440' },
  { key: 'sports', name: 'Sports & Outdoors', path: '/cp/sports-and-outdoors/4125' },
  { key: 'patio', name: 'Patio & Garden', path: '/cp/patio-garden/5428' },
  { key: 'home-improvement', name: 'Home Improvement', path: '/cp/home-improvement/1072864' },
  { key: 'auto', name: 'Auto & Tires', path: '/cp/auto-tires/91083' },
  { key: 'office', name: 'School & Office Supplies', path: '/cp/office-supplies/1229749' },
  { key: 'arts', name: 'Arts, Crafts, Sewing & Party Supplies', path: '/cp/arts-crafts-sewing/1334134' },
  { key: 'movies', name: 'Movies & TV', path: '/cp/movies-tv/4096' },
  { key: 'music', name: 'Music & Vinyl', path: '/cp/music/4104' },
  { key: 'books', name: 'Books', path: '/cp/books/3920' },
  { key: 'party', name: 'Seasonal & Celebrations', path: '/cp/party-occasions/2637' },
  { key: 'gifts', name: 'Gift Cards', path: '/cp/gift-cards/96894' },
]
export const shelfDepartment = key => SHELF_DEPARTMENTS.find(d => d.key === key) ?? null

// Subcategory: [category label, walmart.com tree path or null when the tree has no node for it].
const SUB = {
  produce: ['Fresh Produce', '/cp/fresh-produce/976793'], meat: ['Meat & Seafood', '/cp/meat-seafood/9569500'], deli: ['Deli', '/cp/deli/976789'],
  dairy: ['Dairy & Eggs', null], bakery: ['Bakery & Bread', null], pantry: ['Pantry', null], snacks: ['Snacks, Cookies & Chips', null],
  breakfast: ['Breakfast & Cereal', null], beverages: ['Beverages', null], coffee: ['Coffee', null], frozen: ['Frozen', null],
  cleaning: ['Cleaning Supplies', '/browse/household-essentials/cleaning-supplies/1115193_1071966'], laundry: ['Laundry', '/browse/household-essentials/laundry/1115193_1071967'],
  paper: ['Paper & Plastic', '/browse/household-essentials/paper-plastic/1115193_1073264'], bathroom: ['Bathroom', '/browse/household-essentials/bathroom/1115193_1071965'],
  fresheners: ['Air Fresheners', '/browse/household-essentials/air-fresheners/1115193_1025739'], hhkitchen: ['Kitchen', '/browse/household-essentials/kitchen/1115193_1071968'],
  furniture: ['Furniture', '/cp/furniture/103150'], mattresses: ['Mattresses & Accessories', '/cp/mattresses-accessories/539386'], kitchen: ['Kitchen & Dining', '/cp/kitchen-dining/623679'],
  storage: ['Storage & Organization', '/cp/storage-organization/90828'], appliances: ['Appliances', '/cp/appliances/90548'], vacuums: ['Vacuums, Steamers & Floorcare', '/cp/vacuums-steamers-floor-care/4047'],
  bedding: ['Bedding', null], decor: ['Home Decor', null], bath: ['Bath', null], luggage: ['Luggage & Travel', '/cp/luggage/7333633'],
  tv: ['TV & Video', '/cp/tv-video/1060825'], audio: ['Home Audio & Theater', '/browse/home-audio-theater/3944_77622'], smarthome: ['Smart Home', '/cp/smart-home/1229875'],
  tablets: ['Tablets & Accessories', '/cp/ipad-tablets/1078524'], computers: ['Computers', '/cp/computers/3951'], phones: ['Cell Phones', '/cp/cell-phones/1105910'],
  wearables: ['Wearable Tech', '/cp/wearable-technology/1229723'], headphones: ['Headphones', null], cameras: ['Cameras & Drones', null], printers: ['Printers & Ink', null],
  ps: ['PlayStation', '/cp/playstation-5/3475115'], xbox: ['Xbox', '/cp/xbox-series-x/9206773'], nintendo: ['Nintendo', '/cp/nintendo-switch/4646529'],
  gameacc: ['Video Game Accessories', '/browse/video-games/video-game-accessories/2636_1229019'], vr: ['Virtual Reality', '/browse/video-games/virtual-reality/2636_5454301'],
  giftcards: ['Gaming Gift Cards', '/browse/gifts-registry/gaming-gift-cards/1094765_96894_8922996_9379468'],
  figures: ['Action Figures', '/cp/action-figures/4172'], dolls: ['Dolls & Dollhouses', '/cp/dolls-dollhouses/4187'], learning: ['Learning Toys', '/cp/learning-toys/56125'],
  blasters: ['Dart Blasters', '/browse/toys/nerf-blaster-toys/4171_14521_936979'], puzzles: ['Games & Puzzles', '/cp/games-puzzles/4191'], collectibles: ['Collectibles', '/cp/collectibles/5967908'],
  rc: ['Cars, Drones & RC', '/browse/remote-control-play-vehicles/4171_1111647'], building: ['Building Sets & Blocks', null], plush: ['Stuffed Animals & Plush', null], ride: ['Bikes & Ride-Ons', null],
  women: ['Women', '/cp/womens-clothing/133162'], men: ['Men', '/cp/mens-clothing/133197'], kidsclothes: ['Kids Clothing', '/cp/kids-clothing/7712430'], shoes: ['Shoes', null], accessories: ['Bags & Accessories', null],
  makeup: ['Makeup', '/cp/makeup/1007040'], hair: ['Haircare', '/cp/hair-care/1007219'], skin: ['Skincare', '/cp/skin-care/1007039'], fragrance: ['Fragrance', '/cp/fragrances/133225'],
  nails: ['Nail Care', '/cp/nailcare/3592123'], suncare: ['Suncare & Tanning', '/browse/beauty/facial-sunscreen/1085666_1007039_4046177'],
  bathbody: ['Bath & Body', '/cp/bath-body/1071969'], oral: ['Oral Care', '/cp/oral-care/1007221'], shaving: ['Shaving', '/cp/shaving/1007220'], deodorant: ['Deodorant', null],
  allergy: ['Allergy & Sinus', '/cp/allergy-sinus/3771182'], vitamins: ['Vitamins & Supplements', '/cp/vitamins-supplements/1005863'], pain: ['Pain Management', '/cp/pain-management/6972993'],
  protein: ['Protein, Fitness, & Weight Management', '/cp/protein-fitness/1166769'], firstaid: ['First Aid', null],
  diapers: ['Diapers & Wipes', '/cp/diapering/486190'], feeding: ['Feeding', null], gear: ['Strollers & Car Seats', null], nursery: ['Nursery', null],
  dogfood: ['Dog Food', '/browse/pets/dog-food-and-treats/5440_202072_6432755'], dogtoys: ['Dog Toys', '/browse/pets/all-dog-toys/5440_202072_2243339_202086'], dogs: ['Dog Supplies', '/cp/dogs/202072'],
  catfood: ['Cat Food', '/browse/pets/cat-food/5440_202073_1749780'], cats: ['Cat Supplies', '/cp/cats/202073'], fish: ['Fish & Aquatics', null],
  fitness: ['Fitness', '/cp/exercise-fitness/4134'], basketball: ['Basketball', '/browse/sports-outdoors/basketball/4125_4161_4165'], football: ['Football', '/browse/sports-outdoors/football-gear-equipment/4125_4161_434036'],
  soccer: ['Soccer', '/browse/sports-outdoors/soccer/4125_4161_432196'], pickleball: ['Pickleball', '/browse/sports-outdoors/pickleball/4125_4161_6675878'], golf: ['Golf', '/browse/sports-outdoors/golf-equipment/4125_4161_4152'],
  camping: ['Camping', null], bikes: ['Bikes', null],
  patiofurn: ['Patio Furniture', '/cp/patio-furniture/91416'], grills: ['Gas Grills', '/browse/patio-garden/gas-grills/5428_4089_7375787_7991811'], charcoal: ['Charcoal', '/browse/patio-garden/lump-charcoal-briquettes/5428_4089_9732116_5377022'],
  outdoorcook: ['Outdoor Cooking', '/cp/grills-outdoor-cooking/4089'], outdoordecor: ['Outdoor Decor', '/cp/patio-outdoor-decor/1102183'],
  heaters: ['Heaters', '/browse/home-improvement/space-heaters/1072864_133032_1161932_1085403'], humidifiers: ['Humidifiers', '/browse/home-improvement/humidifiers/1072864_133032_1231459_133042'],
  airquality: ['Air Quality', '/browse/home-improvement/air-quality/1072864_133032_1231459'], water: ['Water Purification', '/browse/home-improvement/water-filters/1072864_6610571_1231153'], tools: ['Tools', '/cp/tools/1031899'],
  batteries: ['Batteries & Accessories', '/cp/batteries-accessories/1104292'], oils: ['Oils and Fluids', '/cp/oils-fluids/1104294'], autoelec: ['Auto Electronics', '/cp/auto-electronics/3947'], tires: ['Tires', '/cp/tires-accessories/1077064'],
  school: ['School Supplies', '/cp/school-supplies/1086045'], officesup: ['Office Supplies', null],
  sewing: ['Sewing Machines & Accessories', '/cp/sewing/1094704'], diecut: ['Die Cutting', '/browse/arts-crafts-sewing/die-cutting/1334134_3123463'], fabric: ['Fabric', '/cp/fabric/4232946'],
  craftstorage: ['Arts & Crafts Furniture and Storage', '/browse/arts-crafts-sewing/arts-crafts-furniture-and-storage/1334134_6355365'], crafting: ['Craft Supplies', '/cp/crafting/6172404'],
  artsup: ['Art Supplies', '/cp/art-supplies/5899871'], knitting: ['Knitting & Crochet', '/browse/arts-crafts-sewing/knitting-crochet/1334134_4880989'],
  movies4k: ['4K Ultra HD Movies', '/browse/4k-ultra-hd-movies/4096_3315790'], bluray: ['Blu-ray Movies', '/browse/movies-tv-shows/blu-ray-movies/4096_616859'], dvd: ['DVD Movies', '/browse/movies-tv-shows/dvd-movies/4096_8073310_7001804'],
  tv4k: ['4K Ultra HD TV Shows', '/browse/movies-tv-shows/tv-shows-4k-ultra-hd/4096_6003122_2378322'], tvbluray: ['Blu-ray TV Shows', '/browse/movies-tv-shows/tv-shows-blu-ray/4096_6003122_8068379'], tvdvd: ['DVD TV Shows', '/browse/movies-tv-shows/tv-shows-dvd/4096_6003122_3476135'],
  turntables: ['Turntables', '/browse/musical-instruments/turntables-record-players/7796869_1097690_6268144_2152355_49600'], instruments: ['Musical Instruments', '/browse/musical-instruments/7796869'],
  rap: ['Rap & Hip-Hop', '/browse/music/rap-hip-hop-on-cds-vinyl/4104_4117'], rock: ['Rock', '/browse/music/rock-music/4104_4118'], pop: ['Pop', '/browse/music/pop-music/4104_4115'],
  country: ['Country', '/browse/music/country-music/4104_4109'], classical: ['Classical', '/browse/music/classical-music-on-cd-or-vinyl/4104_4108'],
  kobo: ['Kobo eReaders', '/browse/books/kobo-ereader-devices-accessories/3920_3252253'], kidsbooks: ["Children's Books", '/browse/childrens-kids-books/3920_582053'], textbooks: ['Textbooks', '/browse/textbooks/3920_582377'],
  teen: ['Teen & Young Adult Books', '/browse/books/teen-young-adult-books/3920_1068785'], magazines: ['Magazines', '/browse/books/magazines/3920_3298715'], bios: ['Biographies & Memoirs', '/browse/books/biographies-memoirs/3920_5196470'],
  babyshower: ['Baby Shower', '/browse/party-occasions/baby-shower-party-supplies/2637_1042319_4687421'], balloons: ['Balloons', '/browse/party-occasions/balloons/2637_1042319_1212898_3956207'],
  balloonarch: ['Balloon Arches', '/browse/party-occasions/balloon-arch/2637_1042319_1212898_3956207_2139180_4860386'], balloonscolor: ['Balloons by Color', '/browse/party-occasions/balloons-by-color/2637_1042319_1212898_3956207_6986611'],
  birthday: ['Birthday Party Supplies', '/browse/party-occasions/birthday-party-supplies/2637_8972913_8516046'], genderreveal: ['Gender Reveal', '/browse/party-occasions/gender-reveal-party-supplies/2637_9103747'],
  helium: ['Helium Tanks', '/browse/party-occasions/helium-tanks/2637_1042319_1212898_4114382'],
  gcrestaurant: ['Restaurant Gift Cards', '/browse/gifts-registry/restaurant-gift-cards/1094765_96894_8922996_8305131'], gcretail: ['Retail Gift Cards', '/browse/gifts-registry/retail-gift-cards/1094765_96894_8922996_3374424'],
  gcprepaid: ['Prepaid Gift Cards', '/browse/cell-phones/phone-data-plans/1105910_4960552'], gcentertainment: ['Entertainment Gift Cards', '/browse/gifts-registry/entertainment-gift-cards/1094765_96894_8922996_2765943'],
  gctravel: ['Travel Gift Cards', '/browse/gifts-registry/travel-gift-cards/1094765_96894_8922996_9617007'], gclifestyle: ['Lifestyle Gift Cards', '/browse/gifts-registry/lifestyle-gift-cards/1094765_96894_8922996_7573523'],
}

// [subcategory, title, brand, price, was price, rating, rating count, photo key or ~shape, badge]
// "~shape" draws a packaged-goods illustration when no product photograph fits the item.
const ROWS = {
  groceries: [
    ['produce', 'Fresh Banana Fruit, Each', 'Fresh Produce', 0.27, null, 4.4, 61207, 'bananas', 'Best seller'],
    ['produce', 'Fresh Gala Apples, 3 lb Bag', 'Fresh Produce', 4.47, null, 4.3, 8840, 'apples', null],
    ['produce', 'Marketside Fresh Spring Mix Salad, 5 oz Clamshell', 'Marketside', 3.28, null, 4.2, 5214, 'salad-greens', null],
    ['produce', 'Fresh Hass Avocados, Each', 'Fresh Produce', 0.78, null, 4.1, 12093, '~bag', null],
    ['produce', 'Fresh Whole Russet Potatoes, 5 lb Bag', 'Fresh Produce', 3.47, null, 4.5, 9311, '~bag', null],
    ['meat', 'Great Value All Natural 93% Lean/7% Fat Ground Beef, 1 lb Tray', 'Great Value', 6.47, null, 4.4, 4120, '~tray', null],
    ['meat', "Freshness Guaranteed Boneless Skinless Chicken Breasts, 4.7-6.1 lb Tray", 'Freshness Guaranteed', 12.98, null, 4.3, 3702, '~tray', null],
    ['deli', 'Oscar Mayer Deli Fresh Oven Roasted Turkey Breast Sliced Lunch Meat, 9 oz Package', 'Oscar Mayer', 4.48, null, 4.6, 2213, '~tray', null],
    ['dairy', 'Great Value Whole Vitamin D Milk, Gallon, 128 fl oz', 'Great Value', 3.46, null, 4.6, 29804, 'milk', 'Best seller'],
    ['dairy', 'Great Value Large White Eggs, 18 Count', 'Great Value', 4.12, null, 4.5, 17290, 'eggs', null],
    ['dairy', 'Chobani Plain Whole Milk Greek Yogurt, 32 oz Tub', 'Chobani', 5.97, null, 4.7, 1905, 'greek-yogurt', null],
    ['dairy', 'Kraft Singles American Cheese Slices, 24 ct Pack', 'Kraft', 4.28, 4.98, 4.7, 3318, '~box', null],
    ['dairy', 'Land O Lakes Salted Butter, 4 Sticks, 16 oz', 'Land O Lakes', 5.47, null, 4.8, 6408, '~box', null],
    ['bakery', 'Nature\'s Own Honey Wheat Sandwich Bread Loaf, 20 oz', "Nature's Own", 3.28, null, 4.6, 7322, 'bread', null],
    ['bakery', 'Freshness Guaranteed Chocolate Chip Cookies, 14 oz, 10 Count', 'Freshness Guaranteed', 3.98, null, 4.5, 2210, 'cookies', null],
    ['pantry', 'Barilla Classic Spaghetti Pasta, 16 oz Box', 'Barilla', 1.78, null, 4.8, 11024, 'pasta', null],
    ['pantry', 'Great Value Long Grain Enriched Rice, 5 lb Bag', 'Great Value', 3.48, null, 4.7, 8932, 'rice', null],
    ['pantry', 'Jif Creamy Peanut Butter, 40 oz Jar', 'Jif', 6.48, 7.24, 4.8, 15402, 'peanut-butter', null],
    ['pantry', 'Pompeian Robust Extra Virgin Olive Oil, 24 fl oz', 'Pompeian', 8.97, null, 4.7, 2504, 'olive-oil', null],
    ['pantry', 'StarKist Chunk Light Tuna in Water, 5 oz Can, 4 Pack', 'StarKist', 4.68, null, 4.7, 6390, 'canned-tuna', null],
    ['pantry', 'Prego Traditional Pasta Sauce, 24 oz Jar', 'Prego', 2.12, null, 4.8, 9011, '~jar', null],
    ['pantry', "Campbell's Condensed Chicken Noodle Soup, 10.75 oz Can", "Campbell's", 1.24, null, 4.7, 7802, '~can', null],
    ['snacks', 'Lay\'s Classic Potato Chips, Party Size, 13 oz Bag', "Lay's", 5.98, null, 4.7, 4630, '~bag', 'Popular pick'],
    ['snacks', 'Doritos Nacho Cheese Flavored Tortilla Chips, Party Size, 14.5 oz', 'Doritos', 5.98, null, 4.8, 6022, '~bag', null],
    ['snacks', "Oreo Chocolate Sandwich Cookies, Family Size, 18.12 oz", 'Oreo', 4.98, null, 4.8, 9930, '~box', null],
    ['snacks', 'Goldfish Cheddar Cheese Crackers, 30 oz Carton', 'Goldfish', 9.97, 11.48, 4.8, 5577, '~box', null],
    ['snacks', 'Great Value Lightly Salted Mixed Nuts, 30 oz', 'Great Value', 9.68, null, 4.6, 3304, '~jar', null],
    ['breakfast', 'Kellogg\'s Frosted Flakes Original Breakfast Cereal, Family Size, 24 oz', "Kellogg's", 4.98, 5.48, 4.8, 7708, 'cereal', null],
    ['breakfast', 'Cheerios Heart Healthy Cereal, Gluten Free, Large Size, 12 oz', 'Cheerios', 3.98, null, 4.8, 8420, 'cereal', null],
    ['breakfast', 'Quaker Old Fashioned Rolled Oats, 42 oz Canister', 'Quaker', 5.98, null, 4.8, 6120, 'oatmeal', null],
    ['breakfast', 'Eggo Homestyle Frozen Waffles, 24 Count, 29.6 oz', 'Eggo', 5.67, null, 4.7, 2933, '~box', null],
    ['beverages', 'Pure Life Purified Water, 16.9 fl oz, 24 Pack Bottles', 'Pure Life', 4.98, null, 4.7, 18702, 'water', 'Best seller'],
    ['beverages', 'Coca-Cola Soda Pop, 12 fl oz, 12 Pack Cans', 'Coca-Cola', 7.48, null, 4.8, 12044, '~box', null],
    ['beverages', 'Gatorade Thirst Quencher Variety Pack, 12 fl oz, 18 Count', 'Gatorade', 12.98, 14.48, 4.8, 4108, '~box', null],
    ['beverages', 'Tropicana Pure Premium No Pulp 100% Orange Juice, 52 fl oz', 'Tropicana', 4.97, null, 4.6, 3317, '~bottle', null],
    ['coffee', 'Folgers Classic Roast Ground Coffee, Medium Roast, 25.9 oz Canister', 'Folgers', 11.97, 13.98, 4.7, 10205, 'coffee', 'Rollback'],
    ['coffee', 'Starbucks Pike Place Roast K-Cup Coffee Pods, Medium Roast, 22 Count', 'Starbucks', 15.98, null, 4.7, 7011, '~box', null],
    ['coffee', 'Great Value Classic Roast Medium Ground Coffee, 30.5 oz', 'Great Value', 9.48, null, 4.4, 4410, 'coffee', null],
    ['coffee', 'Coffee mate Pumpkin Spice Liquid Coffee Creamer, 32 fl oz', 'Coffee mate', 4.98, null, 4.7, 2902, '~bottle', null],
    ['frozen', "DiGiorno Original Rising Crust Pepperoni Frozen Pizza, 27.5 oz", 'DiGiorno', 7.48, null, 4.6, 3881, '~box', null],
    ['frozen', 'Great Value Frozen Steamable Broccoli Florets, 12 oz', 'Great Value', 1.47, null, 4.6, 2017, '~bag', null],
    ['frozen', "Ben & Jerry's Chocolate Fudge Brownie Ice Cream Pint, 16 oz", "Ben & Jerry's", 4.98, null, 4.8, 2290, '~can', null],
    ['snacks', "Hershey's Milk Chocolate Snack Size Candy Bars, Bulk Halloween Bag, 32.9 oz", "Hershey's", 11.98, 13.48, 4.8, 2650, '~bag', 'Halloween'],
    ['snacks', "Reese's Peanut Butter Cups Snack Size Halloween Candy, 32.9 oz Bag", "Reese's", 11.98, null, 4.8, 3102, '~bag', null],
  ],
  household: [
    ['paper', 'Bounty Select-A-Size Paper Towels, 12 Double Rolls', 'Bounty', 24.97, 27.94, 4.8, 21934, 'paper-towels', 'Best seller'],
    ['paper', 'Charmin Ultra Soft Toilet Paper, 18 Mega Rolls', 'Charmin', 24.94, null, 4.8, 30115, 'toilet-paper', 'Best seller'],
    ['paper', 'Great Value Ultra Strong Toilet Paper, 12 Mega Rolls', 'Great Value', 11.97, null, 4.5, 14002, 'toilet-paper', null],
    ['paper', 'Glad ForceFlex Tall Kitchen Drawstring Trash Bags, 13 Gallon, 90 Count', 'Glad', 16.48, null, 4.8, 12308, 'trash-bags', null],
    ['paper', 'Great Value Everyday Napkins, 500 Count', 'Great Value', 3.98, null, 4.6, 5022, 'napkins', null],
    ['paper', 'Kleenex Ultra Soft Facial Tissues, 4 Cube Boxes, 65 Tissues per Box', 'Kleenex', 7.97, null, 4.8, 8840, '~box', null],
    ['laundry', 'Tide Original Liquid Laundry Detergent, 92 fl oz, 64 Loads', 'Tide', 13.97, null, 4.8, 18822, 'laundry-detergent', null],
    ['laundry', 'Tide PODS Original Laundry Detergent Pacs, 81 Count', 'Tide', 21.97, 24.97, 4.8, 15290, '~jar', 'Rollback'],
    ['laundry', 'Gain Original Scent Liquid Laundry Detergent, 88 fl oz', 'Gain', 12.97, null, 4.8, 9214, 'laundry-detergent', null],
    ['laundry', 'Downy Ultra April Fresh Liquid Fabric Softener, 140 fl oz', 'Downy', 11.97, null, 4.8, 6003, '~bottle', null],
    ['laundry', 'Bounce Outdoor Fresh Dryer Sheets, 240 Count', 'Bounce', 9.47, null, 4.8, 8302, '~box', null],
    ['cleaning', 'Clorox Disinfecting Wipes, Fresh Scent and Lemon, 3 Pack, 225 Wipes', 'Clorox', 12.97, null, 4.8, 19305, 'cleaning-wipes', null],
    ['cleaning', 'Lysol Disinfectant Spray, Crisp Linen, 19 oz', 'Lysol', 6.97, null, 4.8, 11222, '~can', null],
    ['cleaning', 'Swiffer Sweeper Dry + Wet Floor Mopping and Cleaning Starter Kit', 'Swiffer', 14.97, null, 4.6, 7406, 'floor-mop', null],
    ['cleaning', 'Mr. Clean Magic Eraser Original Cleaning Pads, 9 Count', 'Mr. Clean', 9.98, null, 4.8, 9019, '~box', null],
    ['hhkitchen', 'Dawn Platinum Dishwashing Liquid Dish Soap, Fresh Rain, 24.4 fl oz', 'Dawn', 4.97, null, 4.8, 10144, 'dish-soap', null],
    ['hhkitchen', 'Cascade Platinum Plus ActionPacs Dishwasher Detergent, Fresh, 62 Count', 'Cascade', 19.97, 22.97, 4.8, 8411, '~jar', null],
    ['hhkitchen', 'Reynolds Wrap Standard Aluminum Foil, 200 Square Feet', 'Reynolds Wrap', 12.98, null, 4.8, 4402, '~box', null],
    ['fresheners', 'Febreze Air Effects Air Freshener Spray, Gain Original Scent, 8.8 oz', 'Febreze', 4.27, null, 4.7, 5021, '~can', null],
    ['bathroom', 'Scrubbing Bubbles Bathroom Grime Fighter Aerosol, 20 oz', 'Scrubbing Bubbles', 4.48, null, 4.7, 3307, '~can', null],
    ['fresheners', 'Glade PlugIns Scented Oil Refills, Cashmere Woods, 5 Count', 'Glade', 12.97, null, 4.7, 4011, '~box', null],
  ],
  home: [
    ['furniture', 'Mainstays 3-Seater Sofa with Removable Cushions, Gray Fabric', 'Mainstays', 248.00, 299.00, 4.2, 3110, 'sofa-gray-three-seat', 'Rollback'],
    ['furniture', 'Better Homes & Gardens Juliet Accent Chair, Ivory Boucle', 'Better Homes & Gardens', 168.00, null, 4.5, 1288, 'armchair', null],
    ['furniture', 'Mainstays Parsons Coffee Table, Natural Oak Finish', 'Mainstays', 39.97, null, 4.3, 5240, 'coffee-table-oak', null],
    ['furniture', 'Mainstays 5-Shelf Bookcase, Blackwood Oak', 'Mainstays', 44.98, null, 4.3, 22051, 'bookcase-oak', 'Best seller'],
    ['furniture', 'Mainstays Classic 6-Drawer Dresser, White', 'Mainstays', 159.00, null, 4.1, 2207, 'chest-drawers-white', null],
    ['furniture', 'Better Homes & Gardens Modern Farmhouse Dining Table, Natural', 'Better Homes & Gardens', 229.00, 279.00, 4.4, 802, 'dining-table-oak', null],
    ['furniture', 'Mainstays Mid-Back Mesh Office Chair, Black', 'Mainstays', 49.00, null, 4.1, 9608, 'office-chair-black', null],
    ['furniture', 'Mainstays Writing Desk with Drawer, Rustic Oak', 'Mainstays', 59.00, null, 4.2, 6512, 'desk', null],
    ['mattresses', 'Zinus 12" Green Tea Memory Foam Mattress, Queen', 'Zinus', 249.00, 319.00, 4.5, 41022, '~mattress', 'Popular pick'],
    ['mattresses', 'Mainstays Upholstered Queen Platform Bed Frame, Gray', 'Mainstays', 129.00, null, 4.4, 7012, 'bed', null],
    ['bedding', 'Mainstays Microfiber 6-Piece Bed Sheet Set, Queen, White', 'Mainstays', 14.97, null, 4.5, 12704, 'bedding-white', null],
    ['bedding', 'Better Homes & Gardens Oversized Faux Fur Throw Pillow, 20" x 20"', 'Better Homes & Gardens', 12.97, null, 4.7, 2140, 'cushion', null],
    ['decor', 'Better Homes & Gardens Ceramic Table Lamp with Linen Shade, 21"', 'Better Homes & Gardens', 34.97, null, 4.6, 1112, 'ceramic-lamp', null],
    ['decor', 'Mainstays Washable 5\' x 7\' Area Rug, Ivory', 'Mainstays', 39.00, 49.00, 4.3, 2806, 'rug-ivory', null],
    ['decor', 'Mainstays Light-Filtering Linen Curtain Panel Pair, 52" x 84", Natural', 'Mainstays', 19.97, null, 4.4, 4930, 'curtains-beige-pair', null],
    ['bath', 'Mainstays Performance Solid 6-Piece Bath Towel Set, White', 'Mainstays', 16.97, null, 4.5, 8214, 'bath-towels', null],
    ['bath', 'Better Homes & Gardens Memory Foam Bath Mat, 20" x 32", White', 'Better Homes & Gardens', 12.97, null, 4.6, 3510, 'bath-mat-white', null],
    ['storage', 'Sterilite 66 Qt. Clear Latching Storage Box, 6 Pack', 'Sterilite', 54.88, null, 4.7, 9006, 'storage-bins', null],
    ['storage', 'Mainstays Non-Slip Velvet Clothing Hangers, 50 Pack, Black', 'Mainstays', 14.84, null, 4.7, 15308, 'hangers', null],
    ['storage', 'Better Homes & Gardens Fabric Storage Cube Bin, 13", Gray', 'Better Homes & Gardens', 7.97, null, 4.6, 6021, 'fabric-basket-gray', null],
    ['kitchen', 'Lodge Cast Iron 5.5 Quart Enameled Dutch Oven, Sage', 'Lodge', 59.90, 74.90, 4.8, 3211, 'dutch-oven-sage', 'Rollback'],
    ['kitchen', 'T-fal Ultimate Hard Anodized Nonstick 12" Fry Pan', 'T-fal', 29.97, null, 4.7, 8840, 'frying-pan', null],
    ['kitchen', 'The Pioneer Woman 12-Piece Dinnerware Set, Vintage Floral', 'The Pioneer Woman', 49.00, null, 4.7, 4806, 'dinner-plates-white', null],
    ['kitchen', 'Mainstays 16-Piece Stoneware Dinnerware Set, White', 'Mainstays', 24.88, null, 4.4, 7110, 'dinner-plates-white', null],
    ['kitchen', 'Libbey Classic 16-Piece Drinking Glass Set', 'Libbey', 21.97, null, 4.7, 3002, 'glassware', null],
    ['kitchen', 'Mainstays 20-Piece Stainless Steel Flatware Set', 'Mainstays', 9.88, null, 4.5, 9412, 'flatware', null],
    ['kitchen', 'Rubbermaid Brilliance 10-Piece Glass Food Storage Container Set', 'Rubbermaid', 29.97, 36.98, 4.8, 13804, '~box', null],
    ['kitchen', 'Henckels Statement 15-Piece Knife Block Set', 'Henckels', 99.99, 149.99, 4.7, 2840, 'chef-knife', 'Rollback'],
    ['appliances', 'Ninja Professional Plus Blender with Auto-iQ, 72 oz, BN701', 'Ninja', 89.00, 119.00, 4.8, 11304, 'blender', 'Rollback'],
    ['appliances', 'KitchenAid Artisan Series 5 Quart Tilt-Head Stand Mixer, KSM150PS', 'KitchenAid', 329.00, 449.99, 4.8, 9810, 'stand-mixer', 'Rollback'],
    ['appliances', 'Keurig K-Express Single Serve K-Cup Pod Coffee Maker, Black', 'Keurig', 59.00, 79.00, 4.5, 14022, 'drip-coffee-maker', null],
    ['appliances', 'Ninja Air Fryer, 4 Quart, Black, AF101', 'Ninja', 69.00, 89.99, 4.8, 30214, '~appliance', 'Best seller'],
    ['appliances', 'Instant Pot Duo 7-in-1 Electric Pressure Cooker, 6 Quart', 'Instant Pot', 79.00, 99.95, 4.7, 41210, '~appliance', 'Popular pick'],
    ['appliances', 'Hamilton Beach 1.1 cu ft 1000W Countertop Microwave, Stainless Steel', 'Hamilton Beach', 89.00, null, 4.4, 6602, 'microwave', null],
    ['appliances', 'Mainstays 1.7 Liter Electric Kettle, Black', 'Mainstays', 12.97, null, 4.4, 5014, 'kettle-black-plastic', null],
    ['appliances', 'Breville Bambino Plus Espresso Machine, Brushed Stainless Steel', 'Breville', 399.95, 499.95, 4.7, 1880, 'espresso-machine', null],
    ['appliances', 'Mainstays 2-Slice Toaster with Extra-Wide Slots, Black', 'Mainstays', 12.97, null, 4.3, 4120, 'toaster', null],
    ['vacuums', 'Shark Navigator Lift-Away Upright Vacuum, NV352', 'Shark', 159.00, 199.99, 4.7, 52012, '~vacuum', 'Best seller'],
    ['vacuums', 'Dyson V8 Cordless Stick Vacuum, Silver/Nickel', 'Dyson', 349.99, 469.99, 4.6, 8804, 'stick-vacuum-blue', 'Rollback'],
    ['vacuums', 'iRobot Roomba Combo Essential Robot Vacuum & Mop', 'iRobot', 179.00, 249.99, 4.2, 3611, 'robot-vacuum-white', null],
    ['vacuums', 'BISSELL Little Green Portable Carpet Cleaner, 3400V', 'BISSELL', 99.00, 123.59, 4.7, 30115, '~vacuum', null],
    ['luggage', 'Protege 20" Hardside Carry-On Spinner Luggage, Black', 'Protege', 39.97, null, 4.5, 5802, '~luggage', null],
  ],
  electronics: [
    ['tv', 'Samsung 65" Class DU7200 Crystal UHD 4K Smart Tizen TV, UN65DU7200', 'Samsung', 397.99, 479.99, 4.6, 6204, 'television', 'Rollback'],
    ['tv', 'LG 55" Class 4K UHD Smart webOS TV with AI ThinQ, 55UT7570PUB', 'LG', 298.00, null, 4.5, 3110, 'television', null],
    ['tv', 'onn. 50" Class 4K UHD (2160P) LED Roku Smart TV, 100012585', 'onn.', 198.00, 228.00, 4.4, 24109, 'television', 'Best seller'],
    ['tv', 'TCL 75" Class Q-Class 4K QLED HDR Smart TV with Google TV, 75Q651G', 'TCL', 548.00, 699.99, 4.5, 2104, 'television', null],
    ['tv', 'Hisense 43" Class A4 Series FHD 1080p Smart Roku TV, 43A4N', 'Hisense', 158.00, null, 4.4, 5601, 'television', null],
    ['tv', 'VIZIO 32" Class HD 720p LED Smart TV, VHD32M-08', 'VIZIO', 118.00, null, 4.3, 8820, 'television', null],
    ['tv', 'Roku Streaming Stick 4K, HDR & Dolby Vision Streaming Device', 'Roku', 34.00, 49.99, 4.7, 18806, 'streaming-player', null],
    ['tv', 'onn. 4K Streaming Box with Google TV, 2025 Model', 'onn.', 19.88, null, 4.5, 9104, 'streaming-player', null],
    ['audio', 'Samsung HW-B550 2.1 Channel 410W Soundbar with Wireless Subwoofer', 'Samsung', 147.99, 199.99, 4.6, 2403, 'soundbar', 'Rollback'],
    ['audio', 'JBL Flip 6 Portable Waterproof Bluetooth Speaker, Black', 'JBL', 89.95, 129.95, 4.8, 7809, 'speaker', null],
    ['audio', 'Sonos Era 100 Wireless Smart Speaker, Black', 'Sonos', 199.00, null, 4.6, 1004, 'speaker-green', null],
    ['headphones', 'Apple AirPods Pro 2 Wireless Earbuds with USB-C Charging Case', 'Apple', 189.00, 249.00, 4.7, 30210, 'earbuds-white', 'Popular pick'],
    ['headphones', 'Apple AirPods 4 Wireless Earbuds, Bluetooth Headphones', 'Apple', 119.00, 129.00, 4.6, 8022, 'earbuds-white', null],
    ['headphones', 'Beats Studio Pro Wireless Noise Cancelling Headphones, Black', 'Beats', 169.95, 349.99, 4.6, 6610, 'headphones', 'Rollback'],
    ['headphones', 'Sony WH-1000XM5 Wireless Noise Canceling Headphones, Black', 'Sony', 298.00, 399.99, 4.6, 4411, 'headphones', null],
    ['headphones', 'onn. Wireless Bluetooth Earbuds with Charging Case, Black', 'onn.', 14.88, null, 4.1, 12007, 'earbuds', null],
    ['headphones', 'JLab Go Air Pop True Wireless Earbuds, Black', 'JLab', 14.88, 19.99, 4.3, 17806, 'earbuds', null],
    ['phones', 'Straight Talk Apple iPhone 16e, 128GB, Black - Prepaid Smartphone', 'Straight Talk', 449.00, 599.00, 4.5, 2810, 'smartphone', null],
    ['phones', 'Samsung Galaxy A16 5G, 128GB, Black - Unlocked', 'Samsung', 179.00, 199.99, 4.4, 3604, 'smartphone', null],
    ['phones', 'Total by Verizon Motorola moto g 2025, 128GB, Sapphire Blue - Prepaid Smartphone', 'Total by Verizon', 49.88, 149.88, 4.2, 1806, 'smartphone', 'Rollback'],
    ['phones', 'onn. 20W USB-C Power Delivery Wall Charger, White', 'onn.', 12.88, null, 4.6, 6612, 'charging-dock-black', null],
    ['phones', 'Anker 10,000mAh Portable Charger Power Bank with USB-C', 'Anker', 21.99, 29.99, 4.6, 8106, 'powerbank-black', null],
    ['tablets', 'Apple iPad 11-inch (A16), Wi-Fi, 128GB, Blue', 'Apple', 299.00, 349.00, 4.8, 5106, 'tablet', 'Rollback'],
    ['tablets', 'Samsung Galaxy Tab A9+ 11" 64GB Wi-Fi Tablet, Graphite', 'Samsung', 149.00, 219.99, 4.6, 7012, 'tablet', null],
    ['tablets', 'onn. 11" Tablet Pro, 128GB, Android 15', 'onn.', 139.00, null, 4.3, 4308, 'tablet', null],
    ['computers', 'Apple MacBook Air 13.3 inch Laptop, M1 Chip, 8GB RAM, 256GB SSD, Space Gray', 'Apple', 599.00, 699.00, 4.8, 22014, 'laptop', 'Best seller'],
    ['computers', 'HP 15.6" Touchscreen Laptop, Intel Core i5-1334U, 16GB RAM, 512GB SSD, Silver', 'HP', 449.00, 579.00, 4.4, 2306, 'laptop', 'Rollback'],
    ['computers', 'Lenovo IdeaPad Slim 3 15.6" Laptop, AMD Ryzen 7, 16GB RAM, 512GB SSD', 'Lenovo', 479.00, null, 4.5, 1802, 'laptop', null],
    ['computers', 'ASUS Chromebook Plus CX34 14" FHD, Intel Core i3, 8GB RAM, 128GB', 'ASUS', 299.00, 399.00, 4.5, 1406, 'laptop', null],
    ['computers', 'Acer Nitro V 15.6" Gaming Laptop, Intel Core i5, NVIDIA GeForce RTX 4050, 8GB, 512GB SSD', 'Acer', 649.00, 849.99, 4.5, 3301, 'laptop', null],
    ['computers', 'Sceptre 27" Curved 1080p 165Hz Gaming Monitor, C275B', 'Sceptre', 119.97, 149.97, 4.5, 9106, 'monitor', null],
    ['computers', 'Logitech MK270 Wireless Keyboard and Mouse Combo', 'Logitech', 22.99, 27.99, 4.6, 40210, 'keyboard-mouse-bundle', null],
    ['computers', 'SanDisk 1TB Extreme Portable SSD, USB-C, SDSSDE61-1T00', 'SanDisk', 89.99, 129.99, 4.7, 6803, 'portable-ssd', null],
    ['printers', 'HP DeskJet 2855e Wireless All-in-One Color Inkjet Printer', 'HP', 49.00, 69.99, 4.1, 7002, 'printer', null],
    ['printers', 'TP-Link Archer AX1800 Dual Band Wi-Fi 6 Router', 'TP-Link', 59.99, 79.99, 4.6, 4110, 'router', null],
    ['smarthome', 'Ring Battery Doorbell, Satin Nickel', 'Ring', 69.99, 99.99, 4.5, 11023, 'video-doorbell', null],
    ['smarthome', 'Google Nest Thermostat, Smart Programmable Wi-Fi Thermostat, Snow', 'Google', 99.00, 129.99, 4.6, 6102, 'thermostat', null],
    ['smarthome', 'Wyze Cam v4 2.5K Indoor/Outdoor Wi-Fi Security Camera', 'Wyze', 29.98, 35.98, 4.4, 5210, 'security-camera-white', null],
    ['smarthome', 'Kasa Smart Wi-Fi Plug Mini by TP-Link, 4 Pack, EP10P4', 'TP-Link', 24.99, null, 4.7, 12406, 'smart-plug', null],
    ['wearables', 'Apple Watch SE (2nd Gen) GPS 40mm Midnight Aluminum Case with Sport Band', 'Apple', 169.00, 249.00, 4.7, 9906, 'smartwatch-black', 'Rollback'],
    ['wearables', 'Fitbit Charge 6 Fitness Tracker, Obsidian/Black', 'Fitbit', 99.95, 159.95, 4.3, 3604, 'smartwatch-black', null],
    ['cameras', 'GoPro HERO13 Black Action Camera', 'GoPro', 329.00, 399.99, 4.6, 1205, 'action-camera', null],
    ['cameras', 'Canon EOS R100 Mirrorless Camera with RF-S 18-45mm Lens', 'Canon', 479.00, 599.00, 4.6, 806, 'mirrorless-camera', null],
  ],
  games: [
    ['ps', 'Sony PlayStation 5 Slim Console, Disc Edition, 1TB', 'Sony', 499.00, null, 4.8, 15204, 'ps5-console', 'Best seller', { platform: 'ps5', type: 'console' }],
    ['ps', 'Sony PlayStation 5 Slim Console, Digital Edition, 825GB', 'Sony', 449.00, null, 4.7, 6104, 'ps5-digital-console', null, { platform: 'ps5', type: 'console' }],
    ['ps', 'PlayStation 5 Slim Disc 1TB SSD ASTRO BOT Bundle', 'Sony', 839.99, null, 4.8, 512, 'ps5-console', null, { platform: 'ps5', type: 'console' }],
    ['ps', 'Sony PS5 DualSense Wireless Controller - Starlight Blue', 'Sony', 74.88, null, 4.7, 8802, 'controller', null, { platform: 'ps5', type: 'accessory' }],
    ['ps', 'PlayStation Sony PS5 DualSense Edge Wireless Controller - Midnight Black', 'Sony', 199.00, null, 4.6, 1604, 'controller-black', null, { platform: 'ps5', type: 'accessory' }],
    ['ps', 'PlayStation 5 Disc Drive For PS5/PS5 Pro Digital Slim Console', 'Sony', 79.00, null, 4.6, 2210, '~device', null, { platform: 'ps5', type: 'accessory' }],
    ['ps', 'EA Sports College Football 27, PlayStation 5', 'Electronic Arts', 69.00, null, 4.4, 702, '~game', null, { platform: 'ps5', type: 'game', esrb: 'Everyone' }],
    ['ps', 'NBA 2K27, PlayStation 5', '2K', 69.00, null, 4.1, 488, '~game', null, { platform: 'ps5', type: 'game', esrb: 'Everyone' }],
    ['ps', 'Hogwarts Legacy - PlayStation 5', 'Warner Bros. Games', 29.83, 59.99, 4.8, 6102, '~game', 'Rollback', { platform: 'ps5', type: 'game', esrb: 'Teen' }],
    ['ps', 'Astro Bot, PlayStation 5', 'Sony Interactive Entertainment', 49.88, 59.99, 4.9, 2310, 'digital-astro-bot', null, { platform: 'ps5', type: 'game', esrb: 'Everyone 10+' }],
    ['ps', 'Gran Turismo 7 Standard Edition, PlayStation 5', 'Sony Interactive Entertainment', 39.88, 69.99, 4.7, 3205, 'digital-gran-turismo-7', null, { platform: 'ps5', type: 'game', esrb: 'Everyone' }],
    ['ps', 'Assassin\'s Creed Black Flag Resynced, PlayStation 5', 'Ubisoft', 59.99, null, 4.3, 210, '~game', null, { platform: 'ps5', type: 'game', esrb: 'Mature 17+' }],
    ['ps', 'Grand Theft Auto V Premium Edition, PlayStation 4', 'Rockstar Games', 19.88, 29.99, 4.8, 21044, 'digital-rockstar-gta-v', null, { platform: 'ps4', type: 'game', esrb: 'Mature 17+' }],
    ['ps', 'Red Dead Redemption 2, PlayStation 4', 'Rockstar Games', 19.88, 39.99, 4.9, 12503, 'digital-rockstar-rdr2', null, { platform: 'ps4', type: 'game', esrb: 'Mature 17+' }],
    ['xbox', 'Xbox Series X 1TB Console, Carbon Black', 'Microsoft', 599.99, null, 4.8, 9803, 'xbox-console', null, { platform: 'xbox', type: 'console' }],
    ['xbox', 'Xbox Series S 512GB All-Digital Console, Robot White', 'Microsoft', 379.99, null, 4.7, 11204, 'xbox-console', null, { platform: 'xbox', type: 'console' }],
    ['xbox', 'XBOX Wireless Controller - Carbon Black', 'Microsoft', 49.49, 64.00, 4.7, 30115, 'xbox-controller-black', 'Rollback', { platform: 'xbox', type: 'accessory' }],
    ['xbox', 'Seagate 2TB NVMe Storage Expansion Card for Xbox Series X|S', 'Seagate', 299.00, null, 4.8, 2803, '~device', null, { platform: 'xbox', type: 'accessory' }],
    ['xbox', 'EA Sports Madden NFL 27, Xbox Series X', 'Electronic Arts', 69.00, null, 4.0, 412, '~game', null, { platform: 'xbox', type: 'game', esrb: 'Everyone' }],
    ['xbox', 'Halo: Campaign Evolved, Xbox Series X', 'Xbox Game Studios', 49.94, null, 4.4, 266, '~game', null, { platform: 'xbox', type: 'game', esrb: 'Mature 17+' }],
    ['xbox', 'Forza Horizon 5 Standard Edition, Xbox Series X|S', 'Xbox Game Studios', 29.88, 59.99, 4.8, 4012, 'digital-forza-horizon-5', null, { platform: 'xbox', type: 'game', esrb: 'Everyone' }],
    ['xbox', 'Hell Let Loose: Vietnam, Xbox Series X', 'Team17', 39.99, null, 4.1, 98, '~game', null, { platform: 'xbox', type: 'game', esrb: 'Mature 17+' }],
    ['nintendo', 'Nintendo Switch 2: Choose Your Game Bundle', 'Nintendo', 569.00, null, 4.8, 5102, 'handheld-console', 'Popular pick', { platform: 'switch-2', type: 'console' }],
    ['nintendo', 'Nintendo Switch 2 Console', 'Nintendo', 449.00, null, 4.8, 8806, 'handheld-console', null, { platform: 'switch-2', type: 'console' }],
    ['nintendo', 'Nintendo Switch 2 Pro Controller', 'Nintendo', 89.00, null, 4.7, 1903, 'controller-black', null, { platform: 'switch-2', type: 'accessory' }],
    ['nintendo', 'Mario Kart World, Nintendo Switch 2', 'Nintendo', 79.00, null, 4.8, 4406, '~game', null, { platform: 'switch-2', type: 'game', esrb: 'Everyone' }],
    ['nintendo', 'Donkey Kong Bananza - Nintendo Switch 2', 'Nintendo', 69.00, null, 4.8, 1907, '~game', null, { platform: 'switch-2', type: 'game', esrb: 'Everyone 10+' }],
    ['nintendo', 'Splatoon Raiders, Nintendo Switch 2', 'Nintendo', 59.98, null, 4.5, 154, '~game', null, { platform: 'switch-2', type: 'game', esrb: 'Everyone 10+' }],
    ['nintendo', 'Super Mario Bros. Wonder - Nintendo Switch', 'Nintendo', 46.95, 59.99, 4.9, 9011, '~game', 'Rollback', { platform: 'switch', type: 'game', esrb: 'Everyone' }],
    ['nintendo', 'Minecraft - Nintendo Switch', 'Mojang', 29.83, null, 4.9, 30208, 'digital-minecraft', 'Best seller', { platform: 'switch', type: 'game', esrb: 'Everyone 10+' }],
    ['nintendo', 'onn. MicroSDXC Express Card, 512GB', 'onn.', 84.77, null, 4.5, 702, '~device', null, { platform: 'switch-2', type: 'accessory' }],
    ['gameacc', 'Turtle Beach Recon 50 Wired Gaming Headset, Black', 'Turtle Beach', 27.88, 29.95, 4.4, 14209, 'gaming-headset', null, { type: 'accessory' }],
    ['gameacc', 'XBOX Wireless Headset', 'Microsoft', 89.99, 119.99, 4.5, 3102, 'gaming-headset', 'Rollback', { platform: 'xbox', type: 'accessory' }],
    ['gameacc', 'Seagate Game Drive for Xbox 2TB External Hard Drive', 'Seagate', 129.00, null, 4.7, 5210, '~device', null, { platform: 'xbox', type: 'accessory' }],
    ['gameacc', 'Logitech G920 Driving Force Racing Wheel and Floor Pedals', 'Logitech G', 199.99, 299.99, 4.6, 6604, 'racing-wheel-pedals', null, { type: 'accessory' }],
    ['vr', 'Meta Quest 3S 128GB All-in-One VR Headset', 'Meta', 299.00, null, 4.6, 3407, 'vr-headset-white', null, { type: 'console' }],
    ['giftcards', 'XBOX Game Pass Ultimate - 1 Month Membership [Digital]', 'Microsoft', 22.99, null, 4.6, 6104, '~card', null, { type: 'giftcard' }],
    ['giftcards', 'Nintendo eShop $20 eGift Card [Digital]', 'Nintendo', 20.00, null, 4.8, 4206, '~card', null, { type: 'giftcard' }],
    ['giftcards', 'Roblox Digital Gift Code $25', 'Roblox', 25.00, null, 4.7, 9902, '~card', null, { type: 'giftcard' }],
  ],
  toys: [
    ['building', 'LEGO Icons Botanicals Orchid Building Set, 10311', 'LEGO', 39.99, 49.99, 4.9, 6604, 'brick-botanical', 'Rollback'],
    ['building', 'LEGO City Holiday Adventure Bus Building Toy Set, 60426', 'LEGO', 34.97, null, 4.8, 704, 'brick-city-bus', null],
    ['building', 'LEGO Classic Large Creative Brick Box, 790 Pieces, 10698', 'LEGO', 39.97, 59.99, 4.9, 22014, 'building-bricks', 'Best seller'],
    ['dolls', 'Barbie Dreamhouse 2023 Pool Party Doll House with 75+ Pieces', 'Barbie', 179.00, 199.00, 4.7, 4410, '~toybox', null],
    ['dolls', 'Barbie Fashionistas Doll with Pink Dress and Accessories', 'Barbie', 9.97, null, 4.8, 3102, 'doll-pink', null],
    ['figures', 'Marvel Legends Series Spider-Man 6-Inch Action Figure', 'Hasbro', 24.97, null, 4.8, 1408, 'figure', null],
    ['figures', 'Jurassic World Dino Trackers Strike Attack Tyrannosaurus Rex Figure', 'Mattel', 19.97, 24.88, 4.7, 2302, 'dinosaur-green', null],
    ['blasters', 'Nerf N Series Strikeback Blaster with 18 Nerf N1 Darts', 'Nerf', 19.97, 29.99, 4.6, 2806, '~toybox', null],
    ['puzzles', 'Monopoly Classic Board Game for Families and Kids Ages 8+', 'Hasbro Gaming', 19.88, 21.99, 4.8, 12407, 'board-game', null],
    ['puzzles', 'UNO Card Game for Kids, Adults and Family Night', 'Mattel Games', 5.97, null, 4.9, 30112, '~box', 'Best seller'],
    ['puzzles', 'Ravensburger 1000 Piece Jigsaw Puzzle, Disney Collector\'s Edition', 'Ravensburger', 19.99, null, 4.8, 3102, '~box', null],
    ['learning', 'Melissa & Doug Wooden Shape Sorting Cube Classic Toy', 'Melissa & Doug', 21.99, null, 4.8, 6206, '~toybox', null],
    ['plush', 'Squishmallows Original 16-Inch Cam the Cat Plush', 'Squishmallows', 19.97, null, 4.9, 8102, 'plush-rabbit', 'Popular pick'],
    ['plush', 'Spark. Create. Imagine. 14" Teddy Bear Plush, Brown', 'Spark. Create. Imagine.', 9.97, null, 4.7, 2012, 'teddy', null],
    ['rc', 'Hot Wheels RC Rodger Dodger Remote-Control Car, 1:16 Scale', 'Hot Wheels', 39.97, 49.99, 4.5, 1607, 'rc-car-red', null],
    ['rc', 'Hot Wheels Monster Trucks 5-Pack Die-Cast Vehicles', 'Hot Wheels', 12.97, null, 4.8, 2510, '~toybox', null],
    ['collectibles', 'Pokemon TCG: Scarlet & Violet Prismatic Evolutions Booster Bundle', 'Pokemon', 32.94, null, 4.8, 3807, '~card', null],
    ['ride', 'Huffy 20" Kids Bike, Rock It, Boys, Ages 5+, Blue', 'Huffy', 98.00, 128.00, 4.6, 5804, 'bicycle', null],
    ['ride', 'Razor A Kick Scooter, Classic Folding Design, Blue', 'Razor', 39.97, null, 4.7, 12020, 'scooter-blue', null],
    ['learning', 'Crayola Washable Crayons, 24 Count', 'Crayola', 1.97, null, 4.9, 15006, 'crayons', null],
    ['learning', 'Thomas & Friends Wooden Railway Figure 8 Track Set', 'Thomas & Friends', 49.97, null, 4.7, 1106, 'toy-train', null],
  ],
  fashion: [
    ['women', 'Time and Tru Women\'s Crewneck Pullover Sweater, Sizes XS-XXXL', 'Time and Tru', 14.98, null, 4.5, 4210, 'hoodie', null, { sizes: true }],
    ['women', 'Free Assembly Women\'s Mid Rise Wide Leg Jeans', 'Free Assembly', 24.98, null, 4.4, 2904, 'jeans', null, { sizes: true }],
    ['women', 'Avia Women\'s Active High Rise Leggings, 28" Inseam', 'Avia', 12.98, null, 4.6, 9012, 'leggings-black', null, { sizes: true }],
    ['women', 'Time and Tru Women\'s Short Sleeve Crewneck T-Shirt', 'Time and Tru', 5.98, null, 4.5, 13204, 'tshirt', 'Best seller', { sizes: true }],
    ['men', 'George Men\'s Fleece Pullover Hoodie', 'George', 12.98, null, 4.6, 8805, 'hoodie', null, { sizes: true }],
    ['men', 'Wrangler Men\'s Regular Fit Jeans', 'Wrangler', 21.98, null, 4.5, 15302, 'jeans', null, { sizes: true }],
    ['men', 'Hanes Men\'s ComfortSoft Short Sleeve Crew T-Shirts, 6-Pack', 'Hanes', 18.00, null, 4.6, 20114, 'tshirt', null, { sizes: true }],
    ['men', 'Athletic Works Men\'s Fleece Jogger Sweatpants', 'Athletic Works', 11.98, null, 4.5, 7006, 'joggers-gray', null, { sizes: true }],
    ['men', 'Swiss Tech Men\'s Water-Resistant Windbreaker Jacket', 'Swiss Tech', 19.98, 24.98, 4.4, 2104, 'windbreaker-blue', null, { sizes: true }],
    ['kidsclothes', 'Wonder Nation Boys Graphic Fleece Hoodie, Sizes 4-18', 'Wonder Nation', 9.98, null, 4.6, 3201, 'hoodie', null, { sizes: true }],
    ['shoes', 'Nike Men\'s Revolution 7 Running Shoes, Black/White', 'Nike', 65.00, null, 4.6, 3102, 'running-shoes-black', null, { shoeSizes: true }],
    ['shoes', 'Athletic Works Women\'s Knit Slip-On Sneakers', 'Athletic Works', 14.98, null, 4.4, 6012, 'sneakers', null, { shoeSizes: true }],
    ['shoes', 'Crocs Unisex Classic Clog, Black', 'Crocs', 49.99, null, 4.8, 22106, 'slides', 'Popular pick', { shoeSizes: true }],
    ['shoes', 'Skechers Men\'s Summits Slip-On Athletic Sneakers', 'Skechers', 59.99, 69.99, 4.6, 4410, 'cushion-runner-black', null, { shoeSizes: true }],
    ['shoes', 'Converse Unisex Chuck Taylor All Star Low Top Sneakers, White', 'Converse', 65.00, null, 4.7, 5801, 'canvas-sneakers', null, { shoeSizes: true }],
    ['accessories', 'JanSport Cross Town Backpack, Black', 'JanSport', 37.00, 45.00, 4.8, 7302, 'backpack', null],
    ['accessories', 'Fruit of the Loom Men\'s Cushioned Crew Socks, 12-Pack', 'Fruit of the Loom', 14.97, null, 4.6, 10110, 'socks', null],
    ['accessories', 'Armitron Men\'s Analog Dress Watch with Leather Strap', 'Armitron', 29.88, null, 4.5, 1208, 'analog-watch', null],
    ['accessories', 'Champion Unisex Adjustable Baseball Cap, Navy', 'Champion', 14.98, null, 4.6, 1802, 'cap-navy', null],
  ],
  beauty: [
    ['makeup', 'Maybelline Lash Sensational Sky High Washable Mascara, Very Black', 'Maybelline', 9.98, 12.49, 4.6, 34012, 'mascara', 'Best seller'],
    ['makeup', 'L\'Oreal Paris Infallible 32H Fresh Wear Foundation, 1 fl oz', "L'Oreal Paris", 13.97, null, 4.4, 6604, 'foundation', null],
    ['makeup', 'e.l.f. Halo Glow Liquid Filter, Complexion Booster, 1.06 fl oz', 'e.l.f.', 14.00, null, 4.6, 8102, 'foundation-light-neutral', null],
    ['makeup', 'Revlon Super Lustrous Lipstick, Cream Finish, Rosewine', 'Revlon', 7.97, null, 4.6, 5301, 'lipstick-rosewood', null],
    ['makeup', 'NYX Professional Makeup Butter Gloss, Non-Sticky Lip Gloss', 'NYX Professional Makeup', 5.97, null, 4.6, 9902, 'lip-gloss', null],
    ['makeup', 'e.l.f. Stay All Night Micro-Fine Setting Mist, 2.7 fl oz', 'e.l.f.', 8.00, null, 4.5, 2107, 'setting-spray-clear', null],
    ['skin', 'CeraVe Moisturizing Cream for Normal to Dry Skin, 16 oz', 'CeraVe', 17.97, 19.99, 4.8, 20113, 'moisturizer', 'Popular pick'],
    ['skin', 'CeraVe Hydrating Facial Cleanser for Normal to Dry Skin, 16 fl oz', 'CeraVe', 15.97, null, 4.8, 15209, 'cleanser', null],
    ['skin', 'The Ordinary Niacinamide 10% + Zinc 1% Serum, 1 fl oz', 'The Ordinary', 6.00, null, 4.4, 6002, 'serum', null],
    ['skin', 'Neutrogena Hydro Boost Hyaluronic Acid Water Gel, 1.7 oz', 'Neutrogena', 19.97, 23.49, 4.6, 12802, 'eye-cream-white', null],
    ['suncare', 'Banana Boat Sport Ultra SPF 50 Sunscreen Lotion, 8 oz', 'Banana Boat', 8.97, null, 4.7, 7101, 'sunscreen', null],
    ['hair', 'Pantene Pro-V Daily Moisture Renewal Shampoo, 27.7 oz', 'Pantene', 8.97, null, 4.7, 9106, 'shampoo', null],
    ['hair', 'OGX Nourishing + Coconut Milk Conditioner, 13 fl oz', 'OGX', 6.97, null, 4.7, 7204, 'conditioner-lavender', null],
    ['hair', 'REVLON One-Step Volumizer PLUS Hair Dryer and Hot Air Brush', 'Revlon', 39.88, 59.99, 4.6, 52011, 'hairdryer', 'Rollback'],
    ['fragrance', 'Ariana Grande Cloud Eau de Parfum, Perfume for Women, 1 oz', 'Ariana Grande', 39.97, 45.00, 4.7, 4204, 'perfume', null],
    ['fragrance', 'Calvin Klein Eternity Eau de Parfum, Perfume for Women, 3.4 oz', 'Calvin Klein', 49.97, 89.00, 4.7, 3301, 'perfume-woody-amber', null],
    ['nails', 'Sally Hansen Insta-Dri Nail Polish, Rapid Red, 0.31 fl oz', 'Sally Hansen', 4.97, null, 4.6, 4108, 'nail-polish-rose', null],
    ['makeup', 'Real Techniques Everyday Essentials Makeup Brush Set, 5 Piece', 'Real Techniques', 19.99, null, 4.8, 9203, 'makeup-brush-set', null],
  ],
  'personal-care': [
    ['oral', 'Crest 3D White Brilliance Teeth Whitening Toothpaste, 3.8 oz, 3 Pack', 'Crest', 13.97, null, 4.7, 7304, '~box', null],
    ['oral', 'Oral-B Pro 1000 Rechargeable Electric Toothbrush, Black', 'Oral-B', 49.94, 59.99, 4.7, 30112, '~device', 'Rollback'],
    ['oral', 'Listerine Cool Mint Antiseptic Mouthwash, 1.5 L', 'Listerine', 8.97, null, 4.8, 9601, '~bottle', null],
    ['bathbody', 'Dove Deep Moisture Body Wash for Dry Skin, 20 fl oz', 'Dove', 7.97, null, 4.8, 15206, 'citrus-bodywash', null],
    ['bathbody', 'Aveeno Daily Moisturizing Body Lotion, 18 fl oz', 'Aveeno', 9.97, 11.47, 4.8, 12020, 'body-lotion-cream', null],
    ['bathbody', 'Dr Teal\'s Pure Epsom Salt Soak, Soothe & Sleep with Lavender, 3 lb', "Dr Teal's", 5.47, null, 4.8, 18104, '~bag', null],
    ['shaving', 'Gillette Fusion5 Men\'s Razor Handle + 2 Blade Refills', 'Gillette', 11.97, null, 4.7, 8803, '~device', null],
    ['shaving', 'Venus Comfortglide Women\'s Razor + 2 Refills', 'Venus', 10.97, null, 4.6, 3302, '~device', null],
    ['deodorant', 'Old Spice Men\'s Antiperspirant Deodorant, Swagger, 2.6 oz, Twin Pack', 'Old Spice', 9.97, null, 4.8, 13405, '~bottle', null],
    ['deodorant', 'Secret Clinical Strength Antiperspirant, Completely Clean, 1.6 oz', 'Secret', 10.97, null, 4.7, 4202, '~bottle', null],
    ['bathbody', 'Equate Foaming Hand Soap, Fresh Scent, 3 Pack', 'Equate', 4.97, null, 4.6, 2011, 'foaming-cleanser', null],
  ],
  health: [
    ['allergy', 'Claritin 24 Hour Non-Drowsy Allergy Relief Tablets, 10 mg, 70 Count', 'Claritin', 34.97, null, 4.8, 6804, '~box', null],
    ['allergy', 'Equate Allergy Relief Cetirizine Tablets, 10 mg, 365 Count', 'Equate', 16.88, null, 4.8, 12006, '~jar', 'Best seller'],
    ['allergy', 'Flonase Allergy Relief Nasal Spray, 144 Sprays', 'Flonase', 27.97, null, 4.7, 5302, '~bottle', null],
    ['pain', 'Advil Pain Reliever and Fever Reducer Ibuprofen Tablets, 200 mg, 200 Count', 'Advil', 19.97, null, 4.8, 9605, '~jar', null],
    ['pain', 'Tylenol Extra Strength Caplets, 500 mg Acetaminophen, 225 Count', 'Tylenol', 17.97, null, 4.8, 8204, '~jar', null],
    ['vitamins', 'Nature Made Vitamin D3 2000 IU (50 mcg) Softgels, 250 Count', 'Nature Made', 11.97, null, 4.8, 14302, '~jar', null],
    ['vitamins', 'Centrum Adult Multivitamin Tablets, 200 Count', 'Centrum', 17.97, 21.98, 4.7, 10211, '~jar', null],
    ['vitamins', 'Olly Sleep Melatonin Gummy Supplement, Blackberry Zen, 50 Count', 'OLLY', 12.97, null, 4.6, 6008, '~jar', null],
    ['protein', 'Premier Protein Shake, Chocolate, 30g Protein, 11 fl oz, 12 Pack', 'Premier Protein', 22.98, 25.98, 4.7, 30210, '~box', 'Popular pick'],
    ['protein', 'Optimum Nutrition Gold Standard 100% Whey Protein Powder, Double Rich Chocolate, 2 lb', 'Optimum Nutrition', 37.98, null, 4.8, 8806, '~jar', null],
    ['firstaid', 'Band-Aid Brand Flexible Fabric Adhesive Bandages, Assorted, 100 Count', 'Band-Aid', 8.97, null, 4.8, 7303, '~box', null],
    ['firstaid', 'Vicks VapoRub Chest Rub Ointment, 3.53 oz', 'Vicks', 8.48, null, 4.8, 9102, '~jar', null],
  ],
  baby: [
    ['diapers', 'Pampers Swaddlers Diapers, Size 1, 198 Count', 'Pampers', 54.97, null, 4.8, 22104, 'diaper-pants', 'Best seller'],
    ['diapers', 'Huggies Little Snugglers Baby Diapers, Size 2, 168 Count', 'Huggies', 51.97, null, 4.8, 12802, 'diaper-pants', null],
    ['diapers', 'Parent\'s Choice Fragrance-Free Baby Wipes, 800 Count', "Parent's Choice", 15.47, null, 4.7, 30104, 'baby-wipes', null],
    ['diapers', 'Pampers Sensitive Water-Based Baby Wipes, 12 Pack, 1008 Count', 'Pampers', 32.97, 35.97, 4.8, 17206, 'baby-wipes', 'Rollback'],
    ['feeding', 'Similac 360 Total Care Infant Formula Powder, 30.8 oz', 'Similac', 49.97, null, 4.7, 4106, '~can', null],
    ['feeding', 'Philips Avent Anti-colic Baby Bottle with AirFree Vent, 9 oz, 3 Pack', 'Philips Avent', 22.99, null, 4.6, 6704, 'baby-bottle', null],
    ['feeding', 'Gerber 1st Foods Baby Food Variety Pack, 4 oz, 12 Tubs', 'Gerber', 12.48, null, 4.7, 2306, '~box', null],
    ['feeding', 'Munchkin Splash Toddler Divided Plates, 4 Pack', 'Munchkin', 9.99, null, 4.8, 3302, 'feeding-plate-peach', null],
    ['gear', 'Graco Modes Pramette Travel System, Stroller and Infant Car Seat', 'Graco', 299.99, 379.99, 4.7, 2806, 'stroller-gray', null],
    ['nursery', 'Delta Children Emery 4-in-1 Convertible Crib, Natural', 'Delta Children', 159.00, 199.99, 4.6, 1602, 'crib-wood', null],
  ],
  pets: [
    ['dogfood', 'Purina Dog Chow Complete Adult Dry Dog Food Kibble with Chicken, 44 lb Bag', 'Purina Dog Chow', 34.98, null, 4.8, 18304, 'dog-food', 'Best seller'],
    ['dogfood', 'Pedigree Complete Nutrition Adult Dry Dog Food, Roasted Chicken, 30 lb Bag', 'Pedigree', 24.98, null, 4.7, 21006, 'dog-food', null],
    ['dogfood', 'Blue Buffalo Life Protection Formula Adult Chicken & Brown Rice Dry Dog Food, 30 lb', 'Blue Buffalo', 64.98, 69.98, 4.7, 9102, 'dog-food', null],
    ['dogfood', 'Purina Pro Plan Adult Shredded Blend Chicken & Rice Dry Dog Food, 35 lb', 'Purina Pro Plan', 76.98, null, 4.8, 7203, 'dog-food', null],
    ['dogfood', 'Milk-Bone Original Dog Treats Biscuits for Medium Dogs, 10 lb', 'Milk-Bone', 14.98, null, 4.8, 12108, 'dog-treats', null],
    ['dogtoys', 'Vibrant Life Tug & Toss Rope Dog Toy, Multicolor', 'Vibrant Life', 3.97, null, 4.5, 3301, 'rope-toy', null],
    ['dogtoys', 'KONG Classic Dog Toy, Medium, Red', 'KONG', 13.99, null, 4.8, 9806, 'pet-ball', null],
    ['dogs', 'Vibrant Life Ultra-Absorbent Dog Training Pads, 100 Count', 'Vibrant Life', 17.97, null, 4.6, 11203, 'training-pads-blue', null],
    ['dogs', 'Vibrant Life Double-Door Folding Dog Crate, 36"', 'Vibrant Life', 49.98, null, 4.6, 4008, 'dog-crate-black', null],
    ['dogs', 'Vibrant Life Orthopedic Bolster Dog Bed, Large, Gray', 'Vibrant Life', 29.97, null, 4.5, 3602, 'pet-bed', null],
    ['catfood', 'Purina Friskies Seafood Sensations Adult Dry Cat Food, 16 lb Bag', 'Friskies', 18.98, null, 4.8, 8105, 'cat-food', null],
    ['catfood', 'Fancy Feast Gravy Lovers Poultry & Beef Wet Cat Food Variety Pack, 24 Cans', 'Fancy Feast', 22.98, null, 4.8, 12007, 'wet-cat-food', 'Popular pick'],
    ['catfood', 'Meow Mix Original Choice Dry Cat Food, 22 lb Bag', 'Meow Mix', 21.98, null, 4.8, 9403, 'cat-food', null],
    ['cats', 'Tidy Cats Clumping Cat Litter, Free & Clean Unscented, 35 lb', 'Tidy Cats', 17.98, null, 4.7, 14202, 'cat-litter', null],
    ['cats', 'Fresh Step Clumping Cat Litter with Febreze, 25 lb', 'Fresh Step', 16.97, null, 4.6, 6106, 'cat-litter', null],
    ['cats', 'Vibrant Life 2-Level Cat Tree with Scratching Post, 34"', 'Vibrant Life', 34.97, null, 4.5, 2201, 'cat-tree-two-level', null],
    ['fish', 'Tetra Tetramin Tropical Flakes Fish Food, 7.06 oz', 'Tetra', 13.27, null, 4.7, 2302, 'fish-flakes-jar', null],
  ],
  sports: [
    ['fitness', 'CAP Barbell Neoprene Dumbbell Pair, 10 lb', 'CAP Barbell', 19.88, null, 4.8, 9102, 'dumbbells-purple', null],
    ['fitness', 'Gaiam Essentials Thick Yoga Mat, 10 mm, 72" x 24"', 'Gaiam', 21.98, null, 4.7, 7206, 'yoga-mat-blue', null],
    ['fitness', 'Athletic Works Resistance Bands Set, 5 Piece', 'Athletic Works', 9.97, null, 4.5, 4103, 'resistance-bands', null],
    ['basketball', 'Spalding NBA Street Outdoor Basketball, Size 7, 29.5"', 'Spalding', 14.97, null, 4.7, 5104, 'basketball-orange', null],
    ['basketball', 'Lifetime 50" Shatterproof Portable Basketball Hoop', 'Lifetime', 249.00, 299.00, 4.6, 1806, '~device', null],
    ['football', 'Wilson NFL Super Grip Composite Football, Official Size', 'Wilson', 19.97, null, 4.7, 3007, '~ball', null],
    ['soccer', 'Franklin Sports Competition 100 Soccer Ball, Size 5', 'Franklin Sports', 12.97, null, 4.6, 2804, 'soccer-ball', null],
    ['pickleball', 'Franklin Sports Pickleball Paddle and Ball Set, 4 Paddles', 'Franklin Sports', 49.97, 59.99, 4.6, 3402, '~device', null],
    ['camping', 'Ozark Trail 6-Person Instant Cabin Tent with LED Lighted Hub', 'Ozark Trail', 109.00, 129.00, 4.4, 6105, 'tent-green', null],
    ['camping', 'Ozark Trail Basic Mesh Folding Camp Chair, Khaki', 'Ozark Trail', 8.97, null, 4.5, 30206, 'camping-chair-khaki', 'Best seller'],
    ['camping', 'Ozark Trail 26 oz Stainless Steel Tumbler, Black', 'Ozark Trail', 9.97, null, 4.7, 8805, 'sport-bottle-black', null],
    ['camping', 'Ozark Trail 1500 Lumen LED Camping Lantern', 'Ozark Trail', 14.97, null, 4.5, 2203, 'lantern-cream', null],
    ['bikes', 'Hyper Bicycles 26" Men\'s Havoc Mountain Bike, Black', 'Hyper Bicycles', 148.00, 198.00, 4.3, 4102, 'bicycle', null],
    ['golf', 'Callaway Supersoft Golf Balls, White, 12 Pack', 'Callaway', 24.99, null, 4.8, 3305, '~ball', null],
  ],
  patio: [
    ['grills', 'Expert Grill 4-Burner Propane Gas Grill, Black', 'Expert Grill', 198.00, 249.00, 4.4, 4206, '~grill', null],
    ['grills', 'Blackstone 28" Omnivore Griddle with Hard Cover, 2-Burner', 'Blackstone', 197.00, 247.00, 4.7, 6702, '~grill', 'Rollback'],
    ['charcoal', 'Kingsford Original Charcoal Briquettes, 2 Pack, 16 lb Bags', 'Kingsford', 19.97, null, 4.8, 9003, '~bag', null],
    ['patiofurn', 'Mainstays Wesley Creek 4-Piece Outdoor Conversation Set, Gray', 'Mainstays', 248.00, 298.00, 4.3, 1802, '~patio', null],
    ['patiofurn', 'Mainstays Heritage Park Steel Folding Chair, Black', 'Mainstays', 22.97, null, 4.4, 3104, 'camping-chair-khaki', null],
    ['outdoordecor', 'Better Homes & Gardens Solar Powered LED String Lights, 25 ft', 'Better Homes & Gardens', 14.97, null, 4.4, 2810, '~device', null],
    ['outdoordecor', 'Expert Gardener 10" Round Ceramic Planter, White', 'Expert Gardener', 9.97, null, 4.6, 1203, 'planter-stoneware-white', null],
  ],
  'home-improvement': [
    ['heaters', 'Lasko 1500W Ceramic Tower Space Heater with Remote, 5160', 'Lasko', 49.98, 59.98, 4.6, 12306, '~heater', 'Popular pick'],
    ['heaters', 'Mainstays 1500W Electric Ceramic Space Heater, Black', 'Mainstays', 19.97, null, 4.4, 8102, '~heater', null],
    ['humidifiers', 'Vicks Filter-Free Cool Mist Humidifier, 1.2 Gallon', 'Vicks', 39.97, null, 4.5, 4603, '~appliance', null],
    ['airquality', 'LEVOIT Core 300 True HEPA Air Purifier', 'LEVOIT', 89.99, 99.99, 4.7, 9806, 'air-purifier', null],
    ['water', 'Brita Large 10 Cup Water Filter Pitcher with 1 Standard Filter', 'Brita', 27.97, null, 4.7, 11203, '~bottle', null],
    ['tools', 'Hyper Tough 20V Max Cordless Drill with 1.5Ah Battery and Charger', 'Hyper Tough', 29.97, null, 4.6, 17205, '~drill', 'Best seller'],
    ['tools', 'Hyper Tough 116-Piece Household Tool Set', 'Hyper Tough', 19.88, null, 4.6, 6401, '~toolbox', null],
    ['tools', 'DEWALT 20V MAX Cordless Drill/Driver Kit, DCD771C2', 'DEWALT', 99.00, 159.00, 4.8, 9302, '~drill', 'Rollback'],
    ['tools', 'Stanley 25 ft PowerLock Tape Measure', 'Stanley', 11.98, null, 4.8, 5106, '~device', null],
  ],
  auto: [
    ['oils', 'Mobil 1 Advanced Full Synthetic Motor Oil 5W-30, 5 Quart', 'Mobil 1', 28.97, null, 4.8, 6802, '~bottle', null],
    ['oils', 'Rain-X 2-in-1 Glass Cleaner & Rain Repellent Washer Fluid, 1 Gallon', 'Rain-X', 3.97, null, 4.7, 3106, '~bottle', null],
    ['batteries', 'EverStart Maxx Lead Acid Automotive Battery, Group Size 24F', 'EverStart', 159.94, null, 4.4, 2103, '~battery', null],
    ['autoelec', 'onn. Magnetic Car Phone Mount for Air Vents, Black', 'onn.', 9.88, null, 4.4, 4108, 'charging-dock-black', null],
    ['tires', 'Goodyear Assurance All-Season 215/55R17 94V Tire', 'Goodyear', 128.00, null, 4.6, 1806, '~tire', null],
    ['autoelec', 'Armor All Car Interior Cleaning Wipes, 30 Count', 'Armor All', 4.47, null, 4.7, 5304, 'cleaning-wipes', null],
  ],
  office: [
    ['school', 'Five Star 1 Subject Wide Ruled Spiral Notebooks, 4 Pack', 'Five Star', 9.97, null, 4.8, 6105, 'notebooks', null],
    ['school', 'Pen+Gear Retractable Gel Pens, Assorted Colors, 12 Count', 'Pen+Gear', 3.97, null, 4.6, 4302, 'gel-pens', null],
    ['school', 'Ticonderoga #2 HB Wood-Cased Pencils, Pre-Sharpened, 30 Count', 'Ticonderoga', 6.47, null, 4.8, 9104, '~box', null],
    ['school', 'Elmer\'s Disappearing Purple School Glue Sticks, 12 Count', "Elmer's", 4.97, null, 4.8, 7006, '~box', null],
    ['officesup', 'Pen+Gear Copy Paper, 8.5" x 11", 92 Bright, 500 Sheets', 'Pen+Gear', 5.97, null, 4.7, 8201, '~box', null],
    ['officesup', 'Scotch Heavy Duty Shipping Packaging Tape with Dispenser, 6 Rolls', 'Scotch', 15.97, null, 4.8, 3402, '~box', null],
    ['officesup', 'Sharpie Permanent Markers, Fine Point, Black, 12 Count', 'Sharpie', 8.97, null, 4.8, 12006, '~box', null],
  ],
  arts: [
    ['sewing', 'Brother XM2701 Lightweight Sewing Machine with 27 Stitches', 'Brother', 129.00, 159.99, 4.5, 21508, '~sewing', 'Best seller'],
    ['sewing', 'SINGER Simple 3232 Sewing Machine with 32 Built-in Stitches', 'SINGER', 149.00, null, 4.4, 9806, '~sewing', null],
    ['sewing', 'SINGER Sewing Basics Kit, 130 Pieces', 'SINGER', 9.97, null, 4.6, 3102, '~box', null],
    ['diecut', 'Cricut Joy Xtra Smart Cutting Machine', 'Cricut', 179.00, 199.00, 4.7, 4210, '~cutter', null],
    ['diecut', 'Cricut Maker 3 Smart Cutting Machine', 'Cricut', 299.00, 349.00, 4.8, 8302, '~cutter', null],
    ['fabric', 'Waverly Inspirations 100% Cotton 44" Floral Fabric by the Yard, Blue', 'Waverly Inspirations', 7.97, null, 4.6, 812, '~fabric', null],
    ['fabric', 'Waverly Inspirations Cotton Precut Fat Quarters, 6 Pack, Assorted Prints', 'Waverly Inspirations', 9.97, null, 4.7, 1206, '~fabric', null],
    ['craftstorage', 'Mainstays 10 Drawer Rolling Storage Cart, Multicolor', 'Mainstays', 34.97, null, 4.6, 6408, '~drawers', null],
    ['craftstorage', 'Sterilite 3 Drawer Wide Cart, White', 'Sterilite', 22.97, null, 4.7, 15206, '~drawers', null],
    ['crafting', 'Mod Podge Waterbase Sealer, Glue and Finish, Matte, 16 fl oz', 'Mod Podge', 8.97, null, 4.8, 7402, '~jar', null],
    ['crafting', 'Gorilla Dual Temp Mini Hot Glue Gun Kit with 30 Glue Sticks', 'Gorilla', 12.97, null, 4.7, 9806, '~gluegun', null],
    ['artsup', 'Crayola Crayons, 64 Count', 'Crayola', 3.97, null, 4.8, 25104, 'crayons', 'Best seller'],
    ['artsup', 'Apple Barrel Acrylic Paint Set, 18 Colors, 2 fl oz Bottles', 'Apple Barrel', 12.97, null, 4.7, 5403, '~paint', null],
    ['artsup', 'Pen+Gear Sketch Book, 9" x 12", 70 Sheets', 'Pen+Gear', 4.97, null, 4.6, 2208, '~book', null],
    ['knitting', 'Red Heart Super Saver Yarn, Black, 7 oz', 'Red Heart', 4.97, null, 4.8, 12305, '~yarn', null],
    ['knitting', 'Lion Brand Pound of Love Yarn, Antique White, 16 oz', 'Lion Brand', 12.97, null, 4.7, 3502, '~yarn', null],
    ['knitting', 'Boye Ergonomic Crochet Hook Set, 9 Sizes', 'Boye', 14.97, null, 4.6, 2104, '~box', null],
  ],
  movies: [
    ['movies4k', 'Dune: Part Two (4K Ultra HD + Blu-ray + Digital Copy)', 'Warner Bros.', 24.96, 29.96, 4.8, 1852, '~movie', null],
    ['movies4k', 'Oppenheimer (4K Ultra HD + Blu-ray + Digital Copy)', 'Universal', 26.96, null, 4.8, 3104, '~movie', null],
    ['movies4k', 'Wicked (4K Ultra HD + Blu-ray + Digital Copy)', 'Universal', 29.96, null, 4.8, 2406, '~movie', 'Popular pick'],
    ['bluray', 'Inside Out 2 (Blu-ray + DVD + Digital Copy)', 'Disney', 24.96, null, 4.9, 2903, '~movie', null],
    ['bluray', 'Moana 2 (Blu-ray + DVD + Digital Copy)', 'Disney', 24.96, null, 4.8, 2108, '~movie', null],
    ['bluray', 'Top Gun: Maverick (Blu-ray + DVD + Digital Copy)', 'Paramount', 14.96, 19.96, 4.9, 9802, '~movie', null],
    ['dvd', 'The Wild Robot (DVD)', 'Universal', 14.96, null, 4.9, 1504, '~movie', null],
    ['dvd', 'Twisters (DVD)', 'Universal', 12.96, null, 4.7, 1102, '~movie', null],
    ['dvd', 'Elf (DVD)', 'Warner Bros.', 7.96, null, 4.9, 6205, '~movie', null],
    ['tv4k', 'Game of Thrones: The Complete Series (4K Ultra HD + Digital Copy)', 'HBO', 249.96, null, 4.8, 902, '~movie', null],
    ['tv4k', 'The Mandalorian: The Complete First Season (4K Ultra HD Steelbook)', 'Disney', 59.96, null, 4.8, 1306, '~movie', null],
    ['tvbluray', 'The Office: The Complete Series (Blu-ray)', 'Universal', 99.96, null, 4.9, 7204, '~movie', null],
    ['tvbluray', 'Yellowstone: Season 5, Part 1 (Blu-ray)', 'Paramount', 29.96, null, 4.7, 1408, '~movie', null],
    ['tvdvd', 'Friends: The Complete Series (DVD)', 'Warner Bros.', 59.96, null, 4.9, 12006, '~movie', 'Best seller'],
    ['tvdvd', 'Yellowstone: Season 1 (DVD)', 'Paramount', 14.96, null, 4.8, 5102, '~movie', null],
  ],
  music: [
    ['turntables', 'Victrola Journey+ Bluetooth Suitcase Record Player, Black', 'Victrola', 49.00, 59.99, 4.3, 8204, '~turntable', null],
    ['turntables', 'Crosley Cruiser Plus Vintage 3-Speed Bluetooth Suitcase Turntable, Black', 'Crosley', 79.00, null, 4.4, 6008, '~turntable', null],
    ['turntables', 'Audio-Technica AT-LP60X Fully Automatic Belt-Drive Stereo Turntable, Black', 'Audio-Technica', 149.00, null, 4.6, 4306, '~turntable', null],
    ['instruments', 'Fender FA-115 Dreadnought Acoustic Guitar Pack, Natural', 'Fender', 179.99, null, 4.7, 1306, '~guitar', null],
    ['instruments', 'Yamaha PSR-E383 61-Key Portable Keyboard', 'Yamaha', 189.99, null, 4.7, 904, '~keyboard', null],
    ['rap', 'Kendrick Lamar - GNX - Vinyl', 'Interscope', 29.98, null, 4.8, 822, '~vinyl', null],
    ['rap', 'Eminem - Curtain Call: The Hits - Vinyl', 'Interscope', 34.98, null, 4.9, 2106, '~vinyl', null],
    ['rock', 'Fleetwood Mac - Rumours - Vinyl', 'Rhino', 24.98, null, 4.9, 6104, '~vinyl', 'Best seller'],
    ['rock', 'Nirvana - Nevermind - Vinyl', 'Geffen', 24.98, null, 4.8, 3205, '~vinyl', null],
    ['pop', 'Taylor Swift - The Tortured Poets Department - Vinyl', 'Republic', 32.98, null, 4.8, 4803, '~vinyl', null],
    ["pop", "Sabrina Carpenter - Short n' Sweet - Vinyl", 'Island', 29.98, null, 4.8, 2108, '~vinyl', null],
    ['pop', 'Billie Eilish - Hit Me Hard and Soft - CD', 'Interscope', 13.98, null, 4.8, 1204, '~vinyl', null],
    ['country', 'Chris Stapleton - Traveller - Vinyl', 'Mercury Nashville', 24.98, null, 4.9, 1806, '~vinyl', null],
    ['country', 'Morgan Wallen - Dangerous: The Double Album - CD', 'Big Loud', 14.98, null, 4.8, 3402, '~vinyl', null],
    ['classical', 'Yo-Yo Ma - Six Evolutions: Bach Cello Suites - CD', 'Sony Classical', 17.98, null, 4.8, 402, '~vinyl', null],
    ['classical', 'Andrea Bocelli - Si - CD', 'Decca', 11.98, null, 4.8, 1105, '~vinyl', null],
  ],
  books: [
    ['kobo', 'Kobo Clara BW 6" eReader, Black', 'Kobo', 129.99, null, 4.5, 904, '~ereader', null],
    ['kobo', 'Kobo Libra Colour 7" eReader, Black', 'Kobo', 219.99, null, 4.6, 652, '~ereader', null],
    ['kidsbooks', 'The Very Hungry Caterpillar (Board Book)', 'Eric Carle', 5.98, null, 4.9, 30206, '~book', 'Best seller'],
    ['kidsbooks', 'Dog Man: Big Jim Begins (Hardcover)', 'Dav Pilkey', 8.48, null, 4.9, 3104, '~book', null],
    ['kidsbooks', 'Diary of a Wimpy Kid #18: No Brainer (Hardcover)', 'Jeff Kinney', 9.98, null, 4.8, 4502, '~book', null],
    ['textbooks', 'Campbell Biology, 12th Edition (Hardcover)', 'Lisa A. Urry', 199.99, null, 4.6, 402, '~book', null],
    ['textbooks', 'Princeton Review SAT Premium Prep, 2026 (Paperback)', 'The Princeton Review', 29.99, null, 4.6, 806, '~book', null],
    ['teen', 'Sunrise on the Reaping: A Hunger Games Novel (Hardcover)', 'Suzanne Collins', 17.98, null, 4.8, 6208, '~book', null],
    ["teen", "A Good Girl's Guide to Murder (Paperback)", 'Holly Jackson', 9.98, null, 4.7, 5104, '~book', null],
    ['magazines', 'Better Homes & Gardens Magazine, 1 Year Subscription', 'Better Homes & Gardens', 5.00, null, 4.5, 2306, '~book', null],
    ['magazines', 'Taste of Home Magazine, 1 Year Subscription', 'Taste of Home', 10.00, null, 4.6, 1802, '~book', null],
    ["bios", "I'm Glad My Mom Died (Hardcover)", 'Jennette McCurdy', 15.98, null, 4.8, 4306, '~book', null],
    ['bios', 'Educated: A Memoir (Paperback)', 'Tara Westover', 11.98, null, 4.8, 9204, '~book', null],
  ],
  party: [
    ['babyshower', 'Way to Celebrate Oh Baby Paper Plates, Blue, 9 in, 24 Count', 'Way to Celebrate', 3.97, null, 4.6, 304, '~plates', null],
    ['babyshower', 'Way to Celebrate Baby Shower Balloon Banner Kit, Sage Green', 'Way to Celebrate', 9.97, null, 4.5, 208, '~balloon', null],
    ['balloons', 'Way to Celebrate 12" Latex Balloons, Assorted Colors, 72 Count', 'Way to Celebrate', 5.97, null, 4.5, 2104, '~balloon', 'Best seller'],
    ['balloons', 'Way to Celebrate Happy Birthday Foil Balloon, 18 in', 'Way to Celebrate', 1.00, null, 4.6, 902, '~balloon', null],
    ['balloonarch', 'Way to Celebrate Balloon Arch Kit, Gold & White, 100 Pieces', 'Way to Celebrate', 12.97, null, 4.4, 606, '~balloon', null],
    ['balloonscolor', 'Way to Celebrate 12" Latex Balloons, Pink, 15 Count', 'Way to Celebrate', 1.97, null, 4.5, 702, '~balloon', null],
    ['balloonscolor', 'Way to Celebrate 12" Latex Balloons, Navy Blue, 15 Count', 'Way to Celebrate', 1.97, null, 4.5, 504, '~balloon', null],
    ['birthday', 'Way to Celebrate Happy Birthday Paper Plates, Multicolor, 9 in, 24 Count', 'Way to Celebrate', 3.47, null, 4.6, 1206, '~plates', null],
    ['birthday', 'Way to Celebrate Happy Birthday Banner, Gold, 7 ft', 'Way to Celebrate', 2.97, null, 4.6, 1508, '~box', null],
    ['genderreveal', 'Way to Celebrate Gender Reveal Balloon Kit, Pink and Blue, 60 Pieces', 'Way to Celebrate', 14.97, null, 4.5, 402, '~balloon', null],
    ['genderreveal', 'Way to Celebrate Gender Reveal Paper Plates, Pink and Blue, 9 in, 16 Count', 'Way to Celebrate', 2.97, null, 4.5, 206, '~plates', null],
    ['helium', 'Balloon Time Standard Helium Tank, 8.9 cu ft, Fills up to 30 Balloons', 'Balloon Time', 34.97, null, 4.4, 12004, '~tank', null],
    ['helium', 'Balloon Time Jumbo Helium Tank, 14.9 cu ft, Fills up to 50 Balloons', 'Balloon Time', 54.97, null, 4.4, 8206, '~tank', null],
  ],
  gifts: [
    ['gcrestaurant', 'Olive Garden $50 Gift Card', 'Olive Garden', 50.00, null, 4.8, 2104, '~card', null, { type: 'giftcard' }],
    ['gcrestaurant', 'Starbucks $25 Gift Card', 'Starbucks', 25.00, null, 4.9, 6205, '~card', null, { type: 'giftcard' }],
    ['gcrestaurant', 'Texas Roadhouse $50 Gift Card', 'Texas Roadhouse', 50.00, null, 4.9, 1806, '~card', null, { type: 'giftcard' }],
    ['gcretail', 'Sephora $50 Gift Card', 'Sephora', 50.00, null, 4.8, 1402, '~card', null, { type: 'giftcard' }],
    ['gcretail', 'The Home Depot $100 Gift Card', 'The Home Depot', 100.00, null, 4.8, 1104, '~card', null, { type: 'giftcard' }],
    ['gcprepaid', 'Visa $50 Gift Card (plus $4.88 Purchase Fee)', 'Visa', 54.88, null, 4.5, 9804, '~card', null, { type: 'giftcard' }],
    ['gcprepaid', 'Mastercard $100 Gift Card (plus $6.95 Purchase Fee)', 'Mastercard', 106.95, null, 4.5, 4206, '~card', null, { type: 'giftcard' }],
    ['gcentertainment', 'Netflix $30 Gift Card', 'Netflix', 30.00, null, 4.8, 5302, '~card', null, { type: 'giftcard' }],
    ['gcentertainment', 'AMC Theatres $25 Gift Card', 'AMC Theatres', 25.00, null, 4.8, 2106, '~card', null, { type: 'giftcard' }],
    ['gctravel', 'Southwest Airlines $100 eGift Card', 'Southwest Airlines', 100.00, null, 4.7, 802, '~card', null, { type: 'giftcard' }],
    ['gctravel', 'Airbnb $100 Gift Card', 'Airbnb', 100.00, null, 4.7, 604, '~card', null, { type: 'giftcard' }],
    ['gclifestyle', 'DoorDash $50 Gift Card', 'DoorDash', 50.00, null, 4.7, 3206, '~card', null, { type: 'giftcard' }],
    ['gclifestyle', 'Uber $50 Gift Card', 'Uber', 50.00, null, 4.7, 2408, '~card', null, { type: 'giftcard' }],
  ],
}

// What the item page says, by department: [lead sentence, care/usage line].
const ABOUT = {
  groceries: ['Fresh groceries and pantry staples for everyday meals.', 'Product packaging and size may vary. Refrigerate perishable items promptly after delivery.'],
  household: ['Household essentials to keep every room clean and stocked.', 'Packaging may vary. See the label for full use and safety information.'],
  home: ['Home, furniture and kitchen essentials for everyday living.', 'See the manufacturer instructions for assembly, use and care.'],
  electronics: ['Everyday tech from the brands you know.', 'Includes the manufacturer warranty. Remove personal data before returning devices.'],
  games: ['Games, consoles and accessories for every player.', 'Check platform compatibility before purchase. Digital codes are delivered by email and are non-returnable once redeemed.'],
  toys: ['Toys and games for hours of play.', 'Check the age grade on the package. Small parts may not be suitable for children under 3.'],
  fashion: ['Everyday clothing, shoes and accessories at low prices.', 'Check the size chart before ordering. Machine wash cold unless the label says otherwise.'],
  beauty: ['Makeup, skin care and hair care for your daily routine.', 'For external use only. Patch test before first use.'],
  'personal-care': ['Personal care essentials for the whole family.', 'Use only as directed on the label.'],
  health: ['Health and wellness essentials.', 'Read and follow the label. Consult a health care professional before use if you have a medical condition.'],
  baby: ['Baby essentials for feeding, changing and on-the-go.', 'Always follow the manufacturer safety instructions.'],
  pets: ['Food, treats and supplies for your pets.', 'Transition to a new food gradually and keep fresh water available.'],
  sports: ['Gear for sports, fitness and the outdoors.', 'Use with appropriate safety equipment.'],
  patio: ['Outdoor living, grilling and garden essentials.', 'Use outdoors only, following the manufacturer instructions.'],
  'home-improvement': ['Tools and home improvement essentials.', 'Read all safety warnings and instructions before use.'],
  auto: ['Auto care essentials for your vehicle.', 'Check your owner manual for the right fit and specification.'],
  office: ['School and office supplies for work and class.', 'Colors and packaging may vary.'],
  arts: ['Craft, sewing and art supplies for every project.', 'Colors may vary slightly from the picture.'],
  movies: ['Movies and TV shows to watch at home.', 'Digital copy codes may expire; see the insert for details.'],
  music: ['Records, CDs, turntables and instruments for every music lover.', 'Opened CDs and vinyl can only be exchanged for the same title.'],
  books: ['Bestsellers, kids books and more for every reader.', 'Cover art may vary.'],
  party: ['Party supplies and decorations for every celebration.', 'Balloons are a choking hazard for children under 8. Adult supervision required.'],
  gifts: ['A gift card is the easy gift that always fits.', 'Gift cards are not returnable and cannot be redeemed for cash except where required by law.'],
}

// The first "Key item features" bullet, in the voice of a Walmart listing, by subcategory.
const FEATURE = {
  produce: 'Fresh and ready to enjoy; great for snacking, lunches and recipes', meat: 'Fresh, never frozen; keep refrigerated and cook to a safe internal temperature', deli: 'Sliced fresh and ready for sandwiches, wraps and snack trays',
  dairy: 'Good source of calcium and protein; keep refrigerated', bakery: 'Baked fresh, soft texture, perfect for sandwiches and toast', pantry: 'A pantry staple for quick, easy everyday meals', snacks: 'Great for lunchboxes, parties and on-the-go snacking',
  breakfast: 'A quick and tasty start to your morning', beverages: 'Refreshing taste, great chilled or over ice', coffee: 'Rich, full-bodied flavor for your morning cup', frozen: 'Keep frozen; ready in minutes for an easy meal or snack',
  cleaning: 'Cleans and freshens surfaces throughout your home', laundry: 'Powerful clean that removes tough stains and odors', paper: 'Strong and absorbent for everyday spills and cleanups', bathroom: 'Soft and strong for everyday comfort',
  fresheners: 'Eliminates odors and leaves a long-lasting fresh scent', hhkitchen: 'Everyday kitchen essentials for cooking and cleanup',
  furniture: 'Sturdy construction with a clean, modern look for any room', mattresses: 'Supportive comfort for a better night\'s sleep', kitchen: 'Durable everyday kitchenware that is easy to clean', storage: 'Keeps your space organized and clutter-free',
  appliances: 'Saves time in the kitchen with simple, easy-to-use controls', vacuums: 'Strong suction for carpets and hard floors', bedding: 'Soft, breathable fabric for a cozy night\'s sleep', decor: 'Adds a warm, finishing touch to any room', bath: 'Soft, absorbent and quick drying',
  luggage: 'Lightweight and durable for weekend trips and travel', tv: 'Stream your favorite shows and movies in stunning picture quality', audio: 'Rich, room-filling sound for music, movies and games', smarthome: 'Smart devices that make your home more convenient and secure',
  tablets: 'Portable entertainment for streaming, reading and browsing', computers: 'Fast, reliable performance for work, school and play', phones: 'Stay connected and charged up wherever you go', wearables: 'Track your activity, sleep and notifications from your wrist',
  headphones: 'Clear sound with a comfortable, secure fit', cameras: 'Capture sharp photos and smooth video', printers: 'Print, copy and scan at home with easy wireless setup',
  ps: 'Built for PlayStation gaming', xbox: 'Built for Xbox gaming', nintendo: 'Play at home or on the go with Nintendo Switch', gameacc: 'Level up your setup with gear made for gamers', vr: 'Immersive virtual reality gaming and entertainment',
  giftcards: 'Digital code delivered by email; redeem online or in the console store', figures: 'Highly detailed figure for play and display', dolls: 'Encourages imaginative, creative play', learning: 'Builds early learning skills through hands-on play',
  blasters: 'Fast-firing fun for indoor and outdoor battles', puzzles: 'Fun for the whole family on game night', collectibles: 'Collect them all and trade with friends', rc: 'Easy-to-use remote control for fast, fun driving',
  building: 'Build, rebuild and spark creativity', plush: 'Super soft and huggable', ride: 'Sturdy and easy to ride for hours of outdoor fun',
  women: 'Comfortable fit for everyday wear', men: 'Classic fit and comfortable fabric for everyday wear', kidsclothes: 'Soft, durable and made for play', shoes: 'Cushioned comfort with a durable outsole', accessories: 'Practical style for every day',
  makeup: 'Long-wearing color with a smooth finish', hair: 'Helps nourish and strengthen hair', skin: 'Dermatologist-tested formula for daily use', fragrance: 'A signature scent for day or night', nails: 'Salon-quality color and shine at home', suncare: 'Broad spectrum protection for sun-filled days',
  bathbody: 'Gentle cleansing that leaves skin soft and refreshed', oral: 'Helps fight cavities and freshen breath', shaving: 'Smooth, comfortable shave with less irritation', deodorant: 'Long-lasting odor protection',
  allergy: 'Relief from sneezing, runny nose and itchy, watery eyes', vitamins: 'Daily support for overall health', pain: 'Temporary relief of minor aches and pains', protein: 'Supports muscle recovery and an active lifestyle', firstaid: 'Must-have first aid for home, car and travel',
  diapers: 'Gentle on baby\'s skin with leak protection you can trust', feeding: 'Mealtime essentials for babies and toddlers', gear: 'Smooth, easy handling for everyday outings', nursery: 'Safe, cozy essentials for baby\'s room',
  dogfood: 'Complete and balanced nutrition for adult dogs', dogtoys: 'Durable fun for playtime and chewing', dogs: 'Everyday essentials for happy, healthy dogs', catfood: 'Complete and balanced nutrition cats love', cats: 'Everyday essentials for happy, healthy cats', fish: 'Keeps your aquarium clean and healthy',
  fitness: 'Great for home workouts and the gym', basketball: 'Great grip and feel for indoor and outdoor play', football: 'Built for practice and game day', soccer: 'Durable construction for training and matches', pickleball: 'Lightweight and easy to control', golf: 'Built for distance and control on the course',
  camping: 'Ready for campsites, tailgates and the backyard', bikes: 'Smooth, comfortable ride for neighborhood trips', patiofurn: 'Weather-resistant comfort for your patio or deck', grills: 'Even heat for burgers, steaks and veggies', charcoal: 'Lights easily and burns evenly for a classic grilled flavor',
  outdoorcook: 'Makes outdoor cooking easy for family and friends', outdoordecor: 'Brightens up your patio, porch or garden',
  heaters: 'Fast, efficient warmth for any room', humidifiers: 'Adds moisture to dry indoor air', airquality: 'Helps remove dust, pollen and odors from the air', water: 'Reduces chlorine taste and odor for cleaner-tasting water', tools: 'Durable, reliable performance for projects around the house',
  batteries: 'Dependable starting power in all seasons', oils: 'Helps keep your vehicle running smoothly mile after mile', autoelec: 'Handy car accessories for a cleaner, more convenient drive', tires: 'All-season traction with a smooth, quiet ride',
  school: 'Classroom essentials for the school year', officesup: 'Reliable supplies for home and office',
  sewing: 'Easy to thread and set up for beginners and experienced sewists', diecut: 'Cuts vinyl, iron-on, cardstock and more with the free Design Space app', fabric: 'Soft, easy-to-sew cotton for quilting, apparel and crafts',
  craftstorage: 'Keeps craft supplies sorted and easy to reach', crafting: 'A craft room essential for DIY projects', artsup: 'Bright, bold colors for kids and artists', knitting: 'Soft, easy-care yarn and tools for knitting and crochet',
  movies4k: 'Watch in stunning 4K Ultra HD with HDR', bluray: 'Includes Blu-ray, DVD and a digital copy', dvd: 'Plays on any DVD player', tv4k: 'Every episode in 4K Ultra HD', tvbluray: 'Every episode in high definition on Blu-ray', tvdvd: 'Binge every episode at home',
  turntables: 'Plays 33 1/3, 45 and 78 RPM records with built-in speakers', instruments: 'Everything you need to start playing', rap: 'Pressed on standard black vinyl', rock: 'Pressed on standard black vinyl', pop: 'Includes the full album with lyrics', country: 'Includes the full album with lyrics', classical: 'Studio recording with full liner notes',
  kobo: 'Glare-free screen that reads like paper, even in sunlight', kidsbooks: 'A family favorite for read-aloud time', textbooks: 'The latest edition for your course', teen: 'A bestselling page-turner for teen readers', magazines: 'Delivered to your door every issue', bios: 'The bestselling memoir',
  babyshower: 'Coordinating decor for a sweet baby shower', balloons: 'Fill with air or helium', balloonarch: 'Everything you need to build a balloon garland', balloonscolor: 'Fill with air or helium', birthday: 'Bright, festive decor for birthday parties', genderreveal: 'Pink and blue decor for the big reveal', helium: 'Disposable tank with easy-to-use nozzle; ribbon included',
  gcrestaurant: 'Treat them to a meal out', gcretail: 'Lets them pick out exactly what they want', gcprepaid: 'Use anywhere the card brand is accepted in the U.S.', gcentertainment: 'For movies, shows and more', gctravel: 'For trips, stays and getaways', gclifestyle: 'For rides, meals and everyday treats',
}
const NO_CARE = new Set(['paper', 'bathroom', 'bedding', 'decor', 'bath', 'storage', 'fabric', 'kidsbooks', 'textbooks', 'teen', 'bios', 'magazines', 'birthday', 'babyshower'])

const APPAREL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const SHOE_SIZES = ['7', '8', '9', '10', '11', '12']
const itemId = title => String(1000000000 + parseInt(createHash('sha256').update(title).digest('hex').slice(0, 12), 16) % 8999999999)
export const walmartSlug = title => title.replace(/["'’]/g, '').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '')

function specsFor(dept, sub, title, brand, extra) {
  const specs = { Brand: brand }
  const size = title.match(/(\d[\d.,]*\s?(?:fl oz|oz|lb|Quart|qt|Count|ct|Pack|Gallon|L|GB|TB|"|-inch| inch|mm|ft|Sheets|(?:Double |Mega |Triple )?Rolls)(?![A-Za-z]))/i)
  if (size) specs['Size'] = size[1].trim()
  if (extra.platform) specs['Video Game Platform'] = { ps5: 'PlayStation 5', ps4: 'PlayStation 4', xbox: 'Xbox Series X|S', 'switch-2': 'Nintendo Switch 2', switch: 'Nintendo Switch' }[extra.platform]
  if (extra.esrb) specs['ESRB Rating'] = extra.esrb
  if (extra.type === 'game') specs['Video Game Format'] = 'Physical'
  const model = title.match(/,\s*([A-Z0-9]{2,}[A-Z0-9-]{3,})$/)
  if (model && /\d/.test(model[1])) specs['Model'] = model[1]
  specs['Category'] = SUB[sub][0]
  specs['Sold and shipped by'] = 'Walmart.com'
  return specs
}

// Sample written reviews (Walmart shows a few under the rating summary); simulated like the counts.
const REVIEWERS = ['Jessica', 'Mike', 'Tanya', 'Robert', 'Ashley', 'Daniel', 'Maria', 'Chris', 'Brittany', 'Kevin', 'Linda', 'James']
const REVIEW_TEXT = {
  groceries: [['Always fresh', 'Arrived on time and well packed. Same quality I get in store.'], ['Good value', 'Price is better than the other stores near me.'], ['Pantry staple', 'We go through this every week. Delivery makes it so easy to keep stocked.'], ['Will buy again', 'Tastes great and the date was good. No complaints.']],
  games: [['Great purchase', 'Shipped fast and works as expected. My kids love it.'], ['Worth it', 'Good price compared to other retailers. No issues so far.'], ['Son loves it', 'Got this for my son and he has played it every day since it arrived.'], ['Fast shipping', 'Came in two days, sealed and in perfect condition.']],
  electronics: [['Works great', 'Easy to set up and works exactly as described.'], ['Good for the price', 'Does what I need. Battery and build quality are fine for the money.'], ['Very happy', 'Setup took about ten minutes. Better than I expected for the price.'], ['Great deal', 'Bought it on Rollback and it has been working perfectly.']],
  household: [['Stock up item', 'I buy this every month. Cheaper here than at the grocery store.'], ['Works well', 'Does the job and lasts a long time. Good value for the size.'], ['Great price', 'Same product I always buy, just cheaper. Arrived fast.'], ['Love it', 'My go-to brand. Box was a little dented but everything inside was fine.']],
  beauty: [['Holy grail', 'I have repurchased this so many times. Works as well as pricier brands.'], ['Nice product', 'Exactly as pictured and works great. Price is better than the drugstore.'], ['Recommend', 'Exactly what I use every day. Arrived quickly and well sealed.'], ['Good value', 'Great size for the price. Will order again.']],
  pets: [['Pets love it', 'Good quality and my pets love it. Great price for the size.'], ['Good value', 'Heavy bag delivered right to my door. Much easier than carrying it from the store.'], ['No complaints', 'Works as described. No issues at all.'], ['Will reorder', 'Same quality as the pet store for less.']],
  baby: [['Mom approved', 'Works great for us. We go through a lot of these!'], ['Great price', 'Cheaper than buying at the store and arrives in two days.'], ['Great for baby', 'Exactly what we needed for our little one.'], ['Must have', 'Bought this for our second baby too. Works great.']],
  toys: [['Big hit', 'My kids played with it all weekend. Great gift idea.'], ['Fun for all ages', 'Easy to put together and lots of fun.'], ['Birthday gift', 'Bought as a birthday gift and it was a favorite.'], ['Good quality', 'Sturdier than I expected for the price.']],
  movies: [['Family movie night', 'Watched it the day it arrived. Picture quality is great and the digital code worked.'], ['Great movie', 'One of my favorites. Case arrived sealed and in perfect shape.'], ['Must own', 'Cheaper than the other stores and shipped fast.'], ['Love it', 'Bought it as a gift and they loved it.']],
  music: [['Sounds great', 'Arrived well packed and sounds amazing.'], ['Classic', 'A must have for any collection. Shipped fast with no damage.'], ['Great gift', 'Bought this for my daughter and she loves it.'], ['Love it', 'Exactly as described. Great price compared to the record store.']],
  books: [['Could not put it down', 'Read it in two days. Arrived in great condition.'], ['Great read', 'Highly recommend. Cheaper here than at the bookstore.'], ['Gift for my son', 'He loves this series and reads it every night.'], ['Five stars', 'Exactly what I ordered and it arrived quickly.']],
  arts: [['Perfect for crafting', 'Great quality for the price. Using it for all my projects.'], ['Love it', 'Easy to use and arrived quickly.'], ['Great for beginners', 'I am new to this and it was simple to get started.'], ['Good value', 'Much cheaper than the craft store.']],
  party: [['Party was a hit', 'Looked great at my daughter\'s party. Good quality for the price.'], ['Great value', 'Everything we needed and it arrived in time for the party.'], ['Cute', 'Colors are just like the picture.'], ['Will buy again', 'Easy to set up and lasted the whole party.']],
  gifts: [['Easy gift', 'Arrived quickly and the recipient loved it.'], ['Perfect gift', 'Great last minute gift. Easy to send.'], ['Worked great', 'Card activated with no problems.'], ['Always a hit', 'I give these every year for birthdays.']],
  home: [['Looks great', 'Looks even better in person and was easy to set up.'], ['Good quality', 'Sturdy and well made for the price.'], ['Love it', 'Exactly what I needed for our new apartment.'], ['Nice', 'Arrived quickly and well packaged. Easy to clean.']],
}
const GENERIC_REVIEWS = [['Exactly as described', 'Arrived quickly and matches the description. Would buy again.'], ['Good value', 'Good quality for the price. Packaging was fine.'], ['Will reorder', 'This is my second time buying it. Same quality as last time and it came a day early.'], ['Does the job', 'No complaints. It is exactly what I expected for the price.'], ['Love it', 'Better than I expected. Already recommended it to my sister.'], ['Fast delivery', 'Ordered on Monday and had it Wednesday. Item was well packed and in great shape.'], ['Pretty good', 'Works well overall. The box was a little dented but the item itself was fine.'], ['Great buy', 'Cheaper than the store near me and just as good.']]
function reviewsFor(title, department, rating, n) {
  const pool = REVIEW_TEXT[department] ?? GENERIC_REVIEWS
  const pick = k => pool[(n + k) % pool.length]
  const day = (month, k, max) => `2026-${month}-${String(1 + (n * 7 + k * 11) % max).padStart(2, '0')}`
  return [
    { id: 'r1', stars: 5, name: REVIEWERS[n % 12], title: pick(0)[0], body: pick(0)[1], date: day('10', 0, 14) },
    { id: 'r2', stars: rating >= 4.5 ? 5 : 4, name: REVIEWERS[(n + 5) % 12], title: pick(1)[0], body: pick(1)[1], date: day('09', 1, 28) },
    { id: 'r3', stars: rating >= 4.6 ? 5 : rating >= 4.2 ? 4 : 3, name: REVIEWERS[(n + 9) % 12], title: pick(2)[0], body: pick(2)[1], date: day('08', 2, 28) },
  ]
}
let rank = 100
export const SHELF = Object.entries(ROWS).flatMap(([department, rows]) => rows.map(([sub, title, brand, price, was, rating, ratings, art, badge, extra = {}]) => {
  const [category, nodePath] = SUB[sub]
  const dept = shelfDepartment(department)
  const id = itemId(title)
  const specs = specsFor(department, sub, title, brand, extra)
  const [lead, care] = ABOUT[department]
  const grocery = department === 'groceries'
  const p = {
    id, slug: walmartSlug(title), title, brand, department, category, kind: 'other', shelf: true, rank: rank++,
    deptPath: dept.path, nodePath, deptName: dept.name,
    photo: art.startsWith('~') ? null : art, shape: art.startsWith('~') ? art.slice(1) : null,
    price, wasPrice: was, preorder: false, cta: 'Add', stock: 12,
    tileBadge: badge ?? (was ? 'Rollback' : null), pdpBadges: [...(badge && badge !== 'Rollback' ? [badge] : []), ...(was ? ['Rollback'] : [])], cartBadges: badge === 'Best seller' ? ['Best seller'] : [],
    rating, ratings, reviews: Math.max(1, Math.round(ratings * 0.31)), esrb: extra.esrb ?? null,
    arrival: grocery ? { short: 'tomorrow', day: 'tomorrow', full: 'tomorrow' } : { short: 'in 2 days', day: 'in 2 days', full: 'in 2 days' },
    shippingText: grocery || price >= 35 ? `Free shipping, arrives ${grocery ? 'tomorrow' : 'in 2 days'}` : 'Shipping, arrives in 2 days',
    fulfillment: ['shipping'], sellerId: 'walmart',
    specs, features: [FEATURE[sub] ? `${FEATURE[sub]}.` : lead, ...Object.entries(specs).filter(([k]) => !['Sold and shipped by', 'Category'].includes(k)).map(([k, v]) => `${k}: ${v}`), ...(NO_CARE.has(sub) ? [] : [care])],
    crumbs: [dept.name, category], crumbPaths: [dept.path, nodePath],
    returnPolicy: grocery ? 'Grocery items are not returnable. Contact Customer Care within 7 days if an item arrives damaged.' : extra.type === 'giftcard' ? 'Gift cards and digital codes are not returnable.' : 'Free 90-day returns on most items sold by Walmart.com. Electronics have a 30-day return window.',
    keywords: `${title} ${brand} ${category} ${dept.name} ${extra.platform ?? ''} ${extra.type ?? ''}`,
    reviewEntries: reviewsFor(title, department, rating, rank),
    shelfType: extra.type ?? 'other',
  }
  if (extra.platform) { p.catalogPlatform = extra.platform; p.platform = extra.platform }
  if (extra.type === 'game') { p.catalogType = 'game'; p.format = 'disc' }
  if (extra.sizes || extra.shoeSizes) {
    const sizes = extra.sizes ? APPAREL_SIZES : SHOE_SIZES
    p.variants = sizes.map((s, i) => ({ id: `size-${s.toLowerCase()}`, options: { Size: s }, price: extra.sizes && i >= 5 ? Math.round((price + 2) * 100) / 100 : price, stock: 8 }))
    p.cta = 'Options'
  }
  return p
}))
{
  const seen = new Set()
  for (const p of SHELF) { if (seen.has(p.id)) throw new Error(`Duplicate shelf item id ${p.id}`); seen.add(p.id) }
}

// ---- artwork: product photographs where one fits, otherwise a packaged-goods illustration ----
const TONES = { groceries: ['#2a8703', '#eaf6e3'], household: ['#0071dc', '#e6f1fc'], home: ['#a4683a', '#f6ede4'], electronics: ['#1b2a4a', '#e8ecf3'], games: ['#3a1f6b', '#efe9f8'], toys: ['#e4572e', '#fdeee7'], fashion: ['#6b4f9e', '#f0ecf7'], beauty: ['#c2477a', '#fbe9f1'], 'personal-care': ['#00849a', '#e3f4f6'], health: ['#00845a', '#e2f4ec'], baby: ['#5aa4d6', '#eaf4fb'], pets: ['#b5651d', '#f8eee3'], sports: ['#c0392b', '#f9e9e7'], patio: ['#3d7a3a', '#e9f3e8'], 'home-improvement': ['#e67e22', '#fdf0e3'], auto: ['#2c3e50', '#e9edf1'], office: ['#2563a6', '#e7eff8'], arts: ['#c2477a', '#fbe9f1'], movies: ['#1b2a4a', '#e8ecf3'], music: ['#3a1f6b', '#efe9f8'], books: ['#7a4b2a', '#f6ede4'], party: ['#e4572e', '#fdeee7'], gifts: ['#0053e2', '#e6f1fc'] }
const PLATFORM_BAND = { ps5: ['#0070d1', 'PS5'], ps4: ['#003791', 'PS4'], xbox: ['#107c10', 'XBOX SERIES X'], 'switch-2': ['#e60012', 'NINTENDO SWITCH 2'], switch: ['#e60012', 'NINTENDO SWITCH'] }
const wrap = (s, n) => { const out = []; let line = ''; for (const w of s.split(/\s+/)) { if ((line + ' ' + w).trim().length > n && line) { out.push(line); line = w } else line = (line + ' ' + w).trim() } if (line) out.push(line); return out }
const label = (p, x, y, width, n, size, color, lines = 3) => wrap(p.title.replace(new RegExp('^' + p.brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*'), '').split(',')[0], n).slice(0, lines).map((l, i) => `<text x="${x}" y="${y + i * (size + 4)}" font-family="Arial,Helvetica,sans-serif" font-weight="600" font-size="${size}" fill="${color}" text-anchor="middle">${esc(l)}</text>`).join('')
// Brand mark on the pack: as large as the panel allows, shrunk so long names still fit inside it.
const brandText = (p, x, y, size, color, maxWidth = 150) => { const name = p.brand.toUpperCase().slice(0, 18); const fit = Math.max(9, Math.min(size, Math.floor(maxWidth / (name.length * 0.72)))); return `<text x="${x}" y="${y}" font-family="Arial Black,Arial,Helvetica,sans-serif" font-weight="700" font-size="${fit}" fill="${color}" text-anchor="middle">${esc(name)}</text>` }
// Item-specific drawings where the generic shape would read as the wrong product.
function titleShape(p) {
  const t = p.title
  if (/Air Fryer/i.test(t)) return `<rect x="130" y="55" width="140" height="215" rx="34" fill="#2b2d31"/><rect x="150" y="72" width="100" height="44" rx="10" fill="#3d4046"/><text x="200" y="100" font-family="Arial,Helvetica,sans-serif" font-size="14" font-weight="700" fill="#e74c3c" text-anchor="middle">400°F</text><rect x="140" y="138" width="120" height="118" rx="22" fill="#222428"/><rect x="168" y="178" width="64" height="18" rx="9" fill="#111"/><rect x="155" y="240" width="90" height="6" rx="3" fill="#3d4046"/>`
  if (/Pressure Cooker/i.test(t)) return `<rect x="104" y="118" width="192" height="150" rx="26" fill="#c3c8ce"/><rect x="104" y="118" width="40" height="150" rx="20" fill="#d9dde1"/><rect x="250" y="118" width="46" height="150" rx="20" fill="#aab0b7"/><rect x="160" y="180" width="80" height="54" rx="10" fill="#222"/><rect x="172" y="190" width="56" height="18" rx="3" fill="#4fc3f7"/><circle cx="200" cy="222" r="5" fill="#888"/><ellipse cx="200" cy="118" rx="104" ry="28" fill="#2b2d31"/><ellipse cx="200" cy="112" rx="80" ry="18" fill="#3a3d42"/><rect x="182" y="82" width="36" height="20" rx="8" fill="#444"/><rect x="88" y="150" width="20" height="16" rx="5" fill="#2b2d31"/><rect x="292" y="150" width="20" height="16" rx="5" fill="#2b2d31"/>`
  if (/Upright Vacuum/i.test(t)) return `<rect x="182" y="20" width="44" height="22" rx="11" fill="none" stroke="#444" stroke-width="7"/><rect x="198" y="38" width="12" height="70" fill="#777"/><rect x="178" y="100" width="52" height="96" rx="22" fill="#cfd8e6" stroke="#7d8ea8" stroke-width="4"/><rect x="186" y="150" width="36" height="38" rx="12" fill="#a9b7cc"/><rect x="170" y="190" width="68" height="44" rx="12" fill="#5b4b8a"/><rect x="128" y="232" width="152" height="32" rx="12" fill="#2f3033"/><circle cx="150" cy="268" r="10" fill="#111"/><circle cx="258" cy="268" r="10" fill="#111"/>`
  if (/Toothbrush/i.test(t)) return `<ellipse cx="200" cy="270" rx="54" ry="12" fill="#2f3033"/><rect x="184" y="98" width="32" height="170" rx="16" fill="#222"/><circle cx="200" cy="160" r="7" fill="#4fc3f7"/><rect x="193" y="46" width="14" height="58" rx="7" fill="#f2f2f2" stroke="#ccc"/><rect x="188" y="24" width="24" height="32" rx="10" fill="#f2f2f2" stroke="#ccc"/><rect x="193" y="28" width="14" height="22" rx="4" fill="#4fc3f7"/>`
  if (/Razor/i.test(t)) { const c = /Venus/.test(t) ? '#d9578a' : '#1f3b73'; return `<g transform="rotate(-24 200 160)"><rect x="150" y="40" width="100" height="34" rx="12" fill="#e3e6ea" stroke="#9aa1a9" stroke-width="3"/>${[0, 1, 2, 3, 4].map(i => `<rect x="160" y="${48 + i * 4}" width="80" height="2" fill="#7c848c"/>`).join('')}<rect x="190" y="74" width="20" height="24" fill="#9aa1a9"/><rect x="186" y="96" width="28" height="170" rx="12" fill="${c}"/><rect x="192" y="140" width="16" height="70" rx="6" fill="#2f3033"/></g><rect x="268" y="200" width="60" height="22" rx="8" fill="#e3e6ea" stroke="#9aa1a9" stroke-width="3"/><rect x="268" y="232" width="60" height="22" rx="8" fill="#e3e6ea" stroke="#9aa1a9" stroke-width="3"/>` }
  if (/Basketball Hoop/i.test(t)) return `<rect x="150" y="34" width="110" height="78" rx="4" fill="#eef2f6" stroke="#2f3033" stroke-width="4"/><rect x="185" y="68" width="40" height="30" fill="none" stroke="#c0392b" stroke-width="3"/><ellipse cx="205" cy="114" rx="22" ry="6" fill="none" stroke="#e67e22" stroke-width="4"/>${[0, 1, 2, 3].map(i => `<line x1="${187 + i * 12}" y1="116" x2="${193 + i * 8}" y2="140" stroke="#ccc" stroke-width="2"/>`).join('')}<rect x="200" y="112" width="10" height="140" fill="#444"/><rect x="150" y="244" width="110" height="36" rx="10" fill="#222"/>`
  if (/Pickleball/i.test(t)) return `<g transform="rotate(-18 175 150)"><rect x="120" y="50" width="110" height="130" rx="48" fill="#2e86de"/><rect x="162" y="176" width="26" height="74" rx="8" fill="#222"/></g><g transform="rotate(16 250 150)"><rect x="200" y="62" width="110" height="130" rx="48" fill="#e74c3c"/><rect x="242" y="188" width="26" height="74" rx="8" fill="#222"/></g><circle cx="318" cy="246" r="22" fill="#f4d03f"/><circle cx="310" cy="240" r="3" fill="#c9a920"/><circle cx="324" cy="250" r="3" fill="#c9a920"/><circle cx="318" cy="232" r="3" fill="#c9a920"/>`
  if (/Tape Measure/i.test(t)) return `<rect x="120" y="92" width="150" height="140" rx="34" fill="#f1c40f" stroke="#222" stroke-width="6"/><circle cx="195" cy="162" r="36" fill="#2f3033"/><text x="195" y="168" font-family="Arial Black,Arial,sans-serif" font-size="13" font-weight="700" fill="#f1c40f" text-anchor="middle">STANLEY</text><rect x="262" y="210" width="96" height="20" fill="#f7dc6f" stroke="#b7950b"/>${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<line x1="${270 + i * 11}" y1="210" x2="${270 + i * 11}" y2="${i % 2 ? 216 : 222}" stroke="#222" stroke-width="2"/>`).join('')}<rect x="252" y="204" width="14" height="32" rx="3" fill="#222"/>`
  if (/Humidifier/i.test(t)) return `<path d="M200 40 C150 90 136 130 136 170 C136 210 166 236 200 236 C234 236 264 210 264 170 C264 130 250 90 200 40 Z" fill="#d6eaf8" stroke="#5dade2" stroke-width="4"/><rect x="126" y="206" width="148" height="60" rx="22" fill="#f4f6f7" stroke="#aab4bd" stroke-width="3"/><circle cx="200" cy="236" r="12" fill="#5dade2"/><path d="M186 38 Q176 22 190 12 M212 36 Q224 22 210 10" fill="none" stroke="#cfe8f7" stroke-width="5" stroke-linecap="round"/>`
  return null
}
// Brand colors for gift card art.
const GC_BRAND = { 'Olive Garden': '#55652d', Starbucks: '#00704a', 'Texas Roadhouse': '#7a1f1f', Sephora: '#111111', 'The Home Depot': '#f96302', Visa: '#1a1f71', Mastercard: '#2b2b2b', Netflix: '#141414', 'AMC Theatres': '#c8102e', 'Southwest Airlines': '#304cb2', Airbnb: '#ff5a5f', DoorDash: '#eb1700', Uber: '#000000' }
const hueOf = t => parseInt(createHash('md5').update(t).digest('hex').slice(0, 4), 16) % 360
const coverText = (text, x, y, n, size, color, lines = 3, weight = 700) => wrap(text, n).slice(0, lines).map((l, i) => `<text x="${x}" y="${y + i * (size + 4)}" font-family="Georgia,'Times New Roman',serif" font-weight="${weight}" font-size="${size}" fill="${color}" text-anchor="middle">${esc(l)}</text>`).join('')
// Media and party items: a movie case, an album sleeve, a book cover and so on.
function mediaShape(p, s) {
  const t = p.title, hue = hueOf(t)
  if (s === 'movie') {
    const [band, fmt] = /4K/.test(t) ? ['#111', '4K ULTRA HD'] : /Blu-ray/.test(t) ? ['#0a5bc4', 'BLU-RAY'] : ['#111', 'DVD']
    const name = t.replace(/\s*\(.*$/, '').replace(/:\s*(The Complete|Season).*$/, '')
    return `<rect x="108" y="20" width="184" height="262" rx="6" fill="${band}"/><text x="200" y="40" font-family="Arial,Helvetica,sans-serif" font-weight="700" font-size="13" fill="#fff" text-anchor="middle" letter-spacing="1">${fmt}</text><defs><linearGradient id="mv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(${hue},45%,42%)"/><stop offset="1" stop-color="hsl(${(hue + 30) % 360},55%,14%)"/></linearGradient></defs><rect x="116" y="48" width="168" height="226" fill="url(#mv)"/>${[`<circle cx="${150 + hue % 90}" cy="118" r="30" fill="hsl(${(hue + 40) % 360},85%,68%)" opacity=".85"/><path d="M116 150 L150 126 L178 142 L214 112 L250 138 L284 122 V172 H116 Z" fill="#000" opacity=".45"/>`, `<path d="M116 172 L200 70 L284 172 Z" fill="#000" opacity=".3"/><circle cx="200" cy="112" r="16" fill="#fff" opacity=".8"/>`, `${[0, 1, 2, 3].map(i => `<rect x="116" y="${64 + i * 26}" width="168" height="12" fill="hsl(${(hue + 60 + i * 20) % 360},70%,60%)" opacity=".5"/>`).join('')}`, `<circle cx="160" cy="120" r="44" fill="#000" opacity=".35"/><circle cx="240" cy="110" r="34" fill="hsl(${(hue + 200) % 360},70%,65%)" opacity=".6"/>`][hue % 4]}${coverText(name.toUpperCase(), 200, 200, 13, 19, '#fff', 3)}<text x="200" y="262" font-family="Arial,Helvetica,sans-serif" font-size="10" fill="#ddd" text-anchor="middle">${esc(p.brand.toUpperCase())}</text>`
  }
  if (s === 'vinyl') {
    const [artist, album = ''] = t.split(' - ')
    const cd = / - CD$/.test(t)
    return `${cd ? '' : `<circle cx="262" cy="150" r="96" fill="#111"/><circle cx="262" cy="150" r="70" fill="none" stroke="#2a2a2a" stroke-width="2"/><circle cx="262" cy="150" r="28" fill="hsl(${(hue + 40) % 360},55%,55%)"/><circle cx="262" cy="150" r="4" fill="#fff"/>`}<rect x="${cd ? 95 : 70}" y="${cd ? 45 : 50}" width="${cd ? 210 : 200}" height="${cd ? 210 : 200}" fill="hsl(${hue},40%,${cd ? 35 : 45}%)"/><rect x="${cd ? 95 : 70}" y="${cd ? 45 : 50}" width="${cd ? 210 : 200}" height="${cd ? 210 : 200}" fill="none" stroke="#00000033" stroke-width="2"/><rect x="${cd ? 95 : 70}" y="${cd ? 85 : 90}" width="${cd ? 210 : 200}" height="70" fill="hsl(${(hue + 160) % 360},60%,62%)"/><rect x="${cd ? 95 : 70}" y="${cd ? 155 : 160}" width="${cd ? 210 : 200}" height="6" fill="#fff" opacity=".6"/>${coverText(album, cd ? 200 : 170, cd ? 200 : 202, 16, 17, '#fff', 2)}<text x="${cd ? 200 : 170}" y="${cd ? 238 : 238}" font-family="Arial,Helvetica,sans-serif" font-weight="700" font-size="12" fill="#fff" text-anchor="middle" letter-spacing="1">${esc(artist.toUpperCase())}</text>`
  }
  if (s === 'book') {
    const name = t.replace(/\s*\(.*$/, '').replace(/,\s*\d.*$/, '')
    const mag = /Magazine/.test(t)
    return `<rect x="122" y="26" width="166" height="252" rx="3" fill="#00000022"/><rect x="116" y="20" width="166" height="252" rx="3" fill="hsl(${hue},${mag ? 70 : 45}%,${mag ? 48 : 36}%)"/><rect x="116" y="20" width="12" height="252" fill="#00000033"/>${mag ? `<rect x="134" y="34" width="134" height="34" fill="#fff"/><text x="201" y="58" font-family="Arial Black,Arial,sans-serif" font-weight="700" font-size="${Math.min(18, Math.floor(170 / Math.max(8, p.brand.length)))}" fill="hsl(${hue},70%,35%)" text-anchor="middle">${esc(p.brand.toUpperCase())}</text><rect x="134" y="80" width="134" height="150" fill="hsl(${(hue + 30) % 360},55%,75%)"/><circle cx="201" cy="150" r="36" fill="hsl(${(hue + 200) % 360},60%,60%)"/><rect x="134" y="238" width="96" height="8" fill="#fff"/><rect x="134" y="252" width="70" height="8" fill="#fff" opacity=".8"/>` : `<rect x="134" y="44" width="134" height="2" fill="#ffffffaa"/>${coverText(name, 201, 100, 14, 20, '#fff', 4)}<rect x="166" y="200" width="70" height="2" fill="#ffffffaa"/><rect x="190" y="194" width="22" height="14" fill="hsl(${(hue + 150) % 360},70%,72%)"/><text x="201" y="252" font-family="Arial,Helvetica,sans-serif" font-size="12" font-weight="700" fill="#fff" text-anchor="middle">${esc(p.brand.toUpperCase())}</text>`}`
  }
  if (s === 'balloon') {
    const cols = /Pink and Blue/.test(t) ? ['#f4a6c1', '#9cc9f0', '#f4a6c1'] : /Pink/.test(t) ? ['#f06292', '#f48fb1', '#ec407a'] : /Navy/.test(t) ? ['#1f2f6b', '#2c3e8c', '#16245a'] : /Gold/.test(t) ? ['#d4af37', '#f5f5f5', '#e8c766'] : /Sage/.test(t) ? ['#9caf88', '#f5f1e6', '#b9c9a7'] : /Foil/.test(t) ? ['#c0c7d1', '#c0c7d1', '#c0c7d1'] : ['#e53935', '#1e88e5', '#fdd835']
    const b = (cx, cy, c, r) => `<line x1="${cx}" y1="${cy + r * 1.2}" x2="200" y2="285" stroke="#999" stroke-width="2"/><ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${r * 1.2}" fill="${c}"/><ellipse cx="${cx - r * 0.35}" cy="${cy - r * 0.45}" rx="${r * 0.18}" ry="${r * 0.3}" fill="#fff" opacity=".45"/><path d="M${cx - 6} ${cy + r * 1.2 + 6} L${cx} ${cy + r * 1.2 - 2} L${cx + 6} ${cy + r * 1.2 + 6} Z" fill="${c}"/>`
    return /Foil/.test(t) ? `${b(200, 120, '#c0c7d1', 80)}<text x="200" y="112" font-family="Georgia,serif" font-style="italic" font-weight="700" font-size="22" fill="#d81b60" text-anchor="middle">Happy</text><text x="200" y="140" font-family="Georgia,serif" font-style="italic" font-weight="700" font-size="22" fill="#1e88e5" text-anchor="middle">Birthday</text>` : `${b(140, 110, cols[0], 46)}${b(260, 105, cols[2], 46)}${b(200, 80, cols[1], 52)}`
  }
  if (s === 'plates') {
    const c = /Blue/.test(t) ? '#7fb3e6' : /Pink/.test(t) ? '#f4a6c1' : `hsl(${hue},70%,60%)`
    const word = /Birthday/.test(t) ? 'Happy Birthday' : /Reveal/.test(t) ? 'He or She?' : 'Oh Baby'
    return `<ellipse cx="200" cy="232" rx="150" ry="40" fill="#e3e3e3"/><ellipse cx="200" cy="222" rx="150" ry="40" fill="#f2f2f2"/><circle cx="200" cy="150" r="120" fill="#fff" stroke="${c}" stroke-width="16"/><circle cx="200" cy="150" r="92" fill="#fff" stroke="#eee" stroke-width="2"/><text x="200" y="160" font-family="Georgia,serif" font-style="italic" font-weight="700" font-size="28" fill="${c}" text-anchor="middle">${word}</text>`
  }
  if (s === 'yarn') {
    const c = /Black/.test(t) ? '#2b2b2b' : /White/.test(t) ? '#efe9dc' : `hsl(${hue},50%,50%)`
    const line = /Black/.test(t) ? '#444' : '#d8d0bf'
    return `<ellipse cx="200" cy="160" rx="120" ry="92" fill="${c}"/>${Array.from({ length: 9 }, (_, i) => `<path d="M${96 + i * 24} ${90 + Math.abs(4 - i) * 6} Q${110 + i * 22} 160 ${96 + i * 24} ${230 - Math.abs(4 - i) * 6}" fill="none" stroke="${line}" stroke-width="3"/>`).join('')}<rect x="150" y="98" width="100" height="124" fill="#d62828"/><rect x="150" y="98" width="100" height="26" fill="#fff"/>${brandText(p, 200, 117, 13, '#d62828', 92)}<text x="200" y="168" font-family="Arial,Helvetica,sans-serif" font-weight="700" font-size="12" fill="#fff" text-anchor="middle">${/16 oz/.test(t) ? '1 LB' : '7 OZ'}</text>`
  }
  if (s === 'turntable') {
    const c = /Audio-Technica/.test(t) ? '#1e1e1e' : /Crosley/.test(t) ? '#2b2b2b' : '#3a2a20'
    return `<rect x="50" y="110" width="300" height="150" rx="14" fill="${c}"/><rect x="62" y="118" width="276" height="120" rx="8" fill="#555"/><circle cx="175" cy="178" r="56" fill="#111"/><circle cx="175" cy="178" r="16" fill="hsl(${hue},60%,50%)"/><circle cx="175" cy="178" r="3" fill="#ddd"/><circle cx="300" cy="138" r="10" fill="#bbb"/><path d="M300 138 L290 222 L262 236" fill="none" stroke="#ccc" stroke-width="5" stroke-linecap="round"/>${/Suitcase/.test(t) ? `<rect x="168" y="94" width="64" height="18" rx="8" fill="none" stroke="#c8a165" stroke-width="7"/><circle cx="80" cy="250" r="8" fill="#c8a165"/><circle cx="320" cy="250" r="8" fill="#c8a165"/>` : ''}`
  }
  if (s === 'guitar') return `<g transform="rotate(-35 200 160)"><rect x="191" y="-10" width="18" height="160" fill="#5d3a1a"/>${[0, 1, 2, 3, 4].map(i => `<rect x="191" y="${10 + i * 24}" width="18" height="2" fill="#ccc"/>`).join('')}<rect x="186" y="-34" width="28" height="30" rx="5" fill="#3b2410"/><circle cx="200" cy="190" r="50" fill="#d9a35b"/><circle cx="200" cy="262" r="64" fill="#d9a35b"/><ellipse cx="200" cy="218" rx="30" ry="32" fill="#d9a35b"/><circle cx="200" cy="200" r="20" fill="#2b1a0b"/><rect x="180" y="270" width="40" height="8" fill="#3b2410"/></g>`
  if (s === 'keyboard') return `<rect x="30" y="110" width="340" height="110" rx="8" fill="#222"/><rect x="40" y="120" width="320" height="30" rx="4" fill="#333"/><rect x="170" y="126" width="60" height="16" fill="#4fc3f7"/>${Array.from({ length: 22 }, (_, i) => `<rect x="${42 + i * 14.4}" y="158" width="13" height="56" fill="#fff"/>`).join('')}${Array.from({ length: 21 }, (_, i) => [0, 1, 3, 4, 5].includes(i % 7) ? `<rect x="${51 + i * 14.4}" y="158" width="9" height="34" fill="#111"/>` : '').join('')}`
  if (s === 'sewing') return `<rect x="70" y="240" width="270" height="34" rx="8" fill="#e9ecef" stroke="#adb5bd" stroke-width="2"/><path d="M90 240 V110 Q90 80 120 80 H320 Q340 80 340 100 V170 H300 V140 H140 V240 Z" fill="#f8f9fa" stroke="#adb5bd" stroke-width="3"/><rect x="290" y="170" width="16" height="50" fill="#adb5bd"/><rect x="295" y="220" width="6" height="20" fill="#666"/><rect x="150" y="96" width="100" height="30" rx="4" fill="${/SINGER/.test(t) ? '#c1121f' : '#0b5394'}"/>${brandText(p, 200, 117, 15, '#fff', 90)}<circle cx="110" cy="180" r="14" fill="#ced4da"/><rect x="170" y="74" width="10" height="16" fill="#e63946"/>`
  if (s === 'tank') return `<rect x="150" y="70" width="100" height="210" rx="40" fill="#7fb3e6"/><rect x="150" y="150" width="100" height="70" fill="#fff"/>${brandText(p, 200, 180, 13, '#0b5394', 92)}<text x="200" y="202" font-family="Arial,Helvetica,sans-serif" font-weight="700" font-size="11" fill="#e63946" text-anchor="middle">HELIUM</text><rect x="186" y="46" width="28" height="26" rx="4" fill="#444"/><rect x="210" y="52" width="26" height="8" fill="#666"/><ellipse cx="300" cy="80" rx="34" ry="42" fill="#e53935"/><line x1="300" y1="122" x2="280" y2="270" stroke="#999" stroke-width="2"/>`
  if (s === 'ereader') return `<rect x="125" y="20" width="160" height="250" rx="16" fill="#1f1f1f"/><rect x="137" y="36" width="136" height="208" rx="3" fill="${/Colour/.test(t) ? '#f3efe6' : '#e9e7e2'}"/>${Array.from({ length: 12 }, (_, i) => `<rect x="148" y="${52 + i * 15}" width="${i % 4 === 3 ? 70 : 114}" height="5" rx="2" fill="#9a9a9a"/>`).join('')}${/Colour/.test(t) ? `<rect x="148" y="52" width="50" height="60" fill="#e76f51"/>` : ''}<text x="205" y="260" font-family="Arial,Helvetica,sans-serif" font-size="10" fill="#bbb" text-anchor="middle">kobo</text>`
  if (s === 'fabric') { const c = /Blue/.test(t) ? '#3d6fb6' : `hsl(${hue},50%,55%)`; return `${[0, 1, 2].map(i => `<rect x="${90 + i * 8}" y="${190 - i * 50}" width="220" height="48" rx="6" fill="${i === 1 ? '#f2c4ce' : c}" stroke="#00000022"/>${Array.from({ length: 7 }, (_, k) => `<circle cx="${112 + i * 8 + k * 30}" cy="${214 - i * 50}" r="7" fill="#fff" opacity=".7"/>`).join('')}`).join('')}` }
  if (s === 'paint') return `${['#e63946', '#f4a261', '#e9c46a', '#2a9d8f', '#457b9d', '#6a4c93'].map((c, i) => `<rect x="${78 + i * 42}" y="110" width="34" height="130" rx="6" fill="#fff" stroke="#ccc"/><rect x="${78 + i * 42}" y="150" width="34" height="80" fill="${c}"/><rect x="${84 + i * 42}" y="94" width="22" height="18" rx="3" fill="#fff" stroke="#ccc"/>`).join('')}<text x="200" y="270" font-family="Arial,Helvetica,sans-serif" font-weight="700" font-size="14" fill="#333" text-anchor="middle">APPLE BARREL</text>`
  if (s === 'cutter') return `<rect x="50" y="140" width="300" height="80" rx="30" fill="#f4f4f4" stroke="#ccc" stroke-width="3"/><rect x="70" y="150" width="260" height="10" rx="5" fill="#d0d0d0"/><rect x="180" y="128" width="40" height="40" rx="8" fill="${/Joy/.test(t) ? '#b6e3d4' : '#9fc5e8'}"/><rect x="30" y="214" width="340" height="16" fill="${/Joy/.test(t) ? '#b6e3d4' : '#9fc5e8'}" opacity=".8"/><text x="200" y="200" font-family="Arial,Helvetica,sans-serif" font-weight="700" font-size="16" fill="#555" text-anchor="middle">cricut</text>`
  if (s === 'gluegun') return `<path d="M100 110 H260 Q280 110 280 130 V150 Q280 170 260 170 H210 L222 262 H170 L160 170 H100 Z" fill="#2e7d32"/><rect x="280" y="132" width="50" height="14" fill="#999"/><path d="M330 132 L352 139 L330 146 Z" fill="#666"/><rect x="40" y="132" width="60" height="14" rx="6" fill="#f1f1f1" stroke="#ccc"/><rect x="186" y="186" width="18" height="44" rx="6" fill="#1b5e20"/>`
  if (s === 'drawers') { const ten = /10 Drawer/.test(t); const cols = ['#e63946', '#f4a261', '#e9c46a', '#2a9d8f', '#457b9d', '#6a4c93', '#e76f51', '#90be6d', '#43aa8b', '#577590']; return `<rect x="130" y="20" width="140" height="${ten ? 250 : 230}" rx="6" fill="#f5f5f5" stroke="#bbb" stroke-width="3"/>${Array.from({ length: ten ? 10 : 3 }, (_, i) => `<rect x="138" y="${28 + i * (ten ? 24 : 72)}" width="124" height="${ten ? 20 : 64}" rx="3" fill="${ten ? cols[i] : '#ececec'}" stroke="#ccc"/><rect x="186" y="${(ten ? 34 : 54) + i * (ten ? 24 : 72)}" width="28" height="6" rx="3" fill="#999"/>`).join('')}<circle cx="146" cy="${ten ? 280 : 260}" r="8" fill="#333"/><circle cx="254" cy="${ten ? 280 : 260}" r="8" fill="#333"/>` }
  return null
}
function shapeSvg(p) {
  const [ink, paper] = TONES[p.department] ?? ['#0071dc', '#eef4fb']
  const s = p.shape
  let body = titleShape(p) ?? mediaShape(p, s)
  if (body) {}
  else if (s === 'game') {
    const hue = parseInt(createHash('md5').update(p.title).digest('hex').slice(0, 4), 16) % 360
    const ink = `hsl(${hue},48%,32%)`
    const [band, name] = PLATFORM_BAND[p.platform] ?? ['#333', 'GAME']
    body = `<rect x="95" y="20" width="210" height="260" rx="6" fill="#1d1f24"/><rect x="95" y="20" width="210" height="30" rx="6" fill="${band}"/><text x="200" y="41" font-family="Arial,Helvetica,sans-serif" font-weight="700" font-size="13" fill="#fff" text-anchor="middle">${name}</text><rect x="107" y="60" width="186" height="180" fill="${ink}"/><circle cx="200" cy="120" r="44" fill="${paper}" opacity=".18"/>${label(p, 200, 166, 186, 15, 17, '#fff')}<rect x="107" y="248" width="24" height="26" fill="#fff"/><text x="119" y="267" font-family="Arial" font-weight="700" font-size="13" fill="#000" text-anchor="middle">${(p.esrb ?? 'E')[0]}</text>${brandText(p, 225, 266, 10, '#fff', 140)}`
  } else if (s === 'tv') body = `<rect x="40" y="50" width="320" height="190" rx="6" fill="#111"/><rect x="48" y="58" width="304" height="174" fill="#2d4f8b"/><rect x="170" y="240" width="60" height="10" fill="#333"/><rect x="130" y="250" width="140" height="8" rx="4" fill="#333"/>`
  else if (s === 'bottle') body = `<rect x="170" y="30" width="60" height="30" rx="6" fill="${ink}"/><path d="M150 70 Q150 60 170 60 H230 Q250 60 250 70 V270 Q250 285 235 285 H165 Q150 285 150 270 Z" fill="${paper}" stroke="${ink}" stroke-width="4"/><rect x="152" y="130" width="96" height="100" fill="${ink}"/>${brandText(p, 200, 154, 15, '#fff', 90)}${label(p, 200, 176, 96, 11, 13, '#fff')}`
  else if (s === 'can') body = `<ellipse cx="200" cy="70" rx="70" ry="16" fill="#c9ccd1"/><rect x="130" y="70" width="140" height="190" fill="${ink}"/><ellipse cx="200" cy="260" rx="70" ry="16" fill="${ink}"/><rect x="130" y="120" width="140" height="80" fill="${paper}"/>${brandText(p, 200, 147, 17, ink, 132)}${label(p, 200, 168, 130, 15, 14, '#333', 2)}`
  else if (s === 'jar') body = `<rect x="140" y="50" width="120" height="34" rx="6" fill="${ink}"/><rect x="128" y="84" width="144" height="196" rx="20" fill="${paper}" stroke="${ink}" stroke-width="4"/><rect x="128" y="130" width="144" height="96" fill="${ink}"/>${brandText(p, 200, 157, 18, '#fff', 136)}${label(p, 200, 182, 140, 15, 15, '#fff', 2)}`
  else if (s === 'bag' || s === 'tray') body = s === 'tray'
    ? `<rect x="70" y="120" width="260" height="130" rx="14" fill="#eceae4" stroke="#bbb" stroke-width="3"/><rect x="88" y="135" width="224" height="100" rx="10" fill="${paper}"/><rect x="100" y="150" width="200" height="34" fill="${ink}"/>${brandText(p, 200, 174, 18, '#fff', 192)}${label(p, 200, 207, 200, 24, 14, '#333', 2)}`
    : `<path d="M120 50 H280 L300 280 H100 Z" fill="${ink}"/><rect x="120" y="40" width="160" height="18" fill="${paper}"/><rect x="118" y="110" width="164" height="110" rx="8" fill="${paper}"/>${brandText(p, 200, 142, 20, ink, 156)}${label(p, 200, 168, 160, 17, 15, '#333')}`
  else if (s === 'card') body = `<rect x="80" y="70" width="240" height="152" rx="14" fill="${GC_BRAND[p.brand] ?? ink}"/><rect x="80" y="110" width="240" height="30" fill="#ffffff22"/>${brandText(p, 200, 102, 24, '#fff', 220)}${label(p, 200, 176, 220, 22, 16, '#fff', 2)}`
  else if (['appliance', 'heater', 'vacuum', 'drill', 'device', 'battery', 'toolbox', 'grill', 'patio', 'luggage', 'mattress', 'tire', 'ball', 'toybox'].includes(s)) {
    const shapes = {
      appliance: `<rect x="120" y="60" width="160" height="200" rx="40" fill="#2b2d31"/><rect x="140" y="90" width="120" height="70" rx="12" fill="#55585e"/><circle cx="200" cy="205" r="22" fill="${ink}"/>`,
      heater: `<rect x="155" y="40" width="90" height="230" rx="20" fill="#e9e9e9" stroke="#999" stroke-width="3"/>${Array.from({ length: 9 }, (_, i) => `<rect x="170" y="${70 + i * 18}" width="60" height="8" rx="4" fill="#d35400" opacity=".75"/>`).join('')}<rect x="150" y="268" width="100" height="12" rx="6" fill="#555"/>`,
      vacuum: `<rect x="185" y="30" width="18" height="190" rx="8" fill="#555"/><rect x="160" y="110" width="68" height="110" rx="22" fill="${ink}"/><rect x="120" y="240" width="150" height="34" rx="14" fill="#333"/>`,
      drill: `<path d="M110 110 H250 Q270 110 270 130 V150 Q270 170 250 170 H200 L215 270 H160 L150 170 H110 Z" fill="#f2b705"/><rect x="270" y="130" width="60" height="16" fill="#777"/><rect x="150" y="250" width="70" height="30" rx="6" fill="#222"/>`,
      device: `<rect x="110" y="60" width="180" height="200" rx="18" fill="#2b2d31"/><rect x="128" y="80" width="144" height="120" rx="8" fill="${ink}"/>${brandText(p, 200, 238, 12, '#fff')}`,
      battery: `<rect x="90" y="100" width="220" height="160" rx="10" fill="#222"/><rect x="120" y="80" width="30" height="20" fill="#c0392b"/><rect x="250" y="80" width="30" height="20" fill="#444"/>${brandText(p, 200, 190, 16, '#f1c40f')}`,
      toolbox: `<rect x="80" y="110" width="240" height="150" rx="10" fill="#c0392b"/><rect x="160" y="80" width="80" height="30" rx="8" fill="none" stroke="#333" stroke-width="10"/>${brandText(p, 200, 196, 14, '#fff')}`,
      grill: `<rect x="90" y="90" width="220" height="90" rx="40" fill="#222"/><rect x="80" y="170" width="240" height="20" fill="#333"/><rect x="110" y="190" width="10" height="90" fill="#333"/><rect x="280" y="190" width="10" height="90" fill="#333"/>`,
      patio: `<rect x="60" y="150" width="120" height="70" rx="10" fill="#7f8c8d"/><rect x="220" y="150" width="120" height="70" rx="10" fill="#7f8c8d"/><rect x="150" y="230" width="100" height="12" fill="#5d4037"/><rect x="70" y="130" width="100" height="24" rx="8" fill="#ecf0f1"/><rect x="230" y="130" width="100" height="24" rx="8" fill="#ecf0f1"/>`,
      luggage: `<rect x="130" y="70" width="140" height="200" rx="16" fill="${ink}"/><rect x="175" y="40" width="50" height="30" rx="6" fill="none" stroke="#333" stroke-width="8"/>${[160, 200, 240].map(x => `<rect x="${x - 2}" y="80" width="4" height="180" fill="#ffffff44"/>`).join('')}<circle cx="150" cy="276" r="8" fill="#222"/><circle cx="250" cy="276" r="8" fill="#222"/>`,
      mattress: `<path d="M60 170 L200 120 L340 170 L200 220 Z" fill="#f5f5f5" stroke="#bbb" stroke-width="3"/><path d="M60 170 V210 L200 260 V220 Z" fill="#7fb77e"/><path d="M340 170 V210 L200 260 V220 Z" fill="#6aa56a"/>`,
      tire: `<circle cx="200" cy="160" r="110" fill="#222"/><circle cx="200" cy="160" r="60" fill="#bfc4ca"/><circle cx="200" cy="160" r="18" fill="#777"/>`,
      ball: `<ellipse cx="200" cy="160" rx="110" ry="70" fill="${p.title.includes('Golf') ? '#f4f4f4' : '#7b3f1d'}" stroke="#333" stroke-width="3"/><rect x="150" y="155" width="100" height="8" fill="#fff"/>`,
      toybox: `<rect x="90" y="70" width="220" height="200" rx="8" fill="${ink}"/><rect x="110" y="95" width="180" height="120" rx="6" fill="${paper}"/>${brandText(p, 200, 250, 20, '#fff', 200)}${label(p, 200, 138, 170, 15, 17, '#333')}`,
    }
    body = shapes[s]
  } else body = `<rect x="110" y="50" width="180" height="230" rx="8" fill="${ink}"/><rect x="110" y="50" width="180" height="40" rx="8" fill="${paper}"/>${brandText(p, 200, 79, 21, ink, 170)}<rect x="126" y="110" width="148" height="110" rx="6" fill="${paper}"/>${label(p, 200, 142, 140, 13, 17, '#333')}`
  // Upright packs are framed close, so the pack (and its label) fills the tile the way a product photo does.
  const tight = !s || ['box', 'game', 'bag', 'toybox', 'jar', 'can', 'bottle', 'card', 'device', 'heater', 'vacuum', 'appliance', 'luggage', 'movie', 'book', 'ereader', 'tank', 'drawers'].includes(s)
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${tight ? '75 12 250 278' : '0 0 400 300'}" width="400" height="300"><rect x="-200" y="-200" width="800" height="700" fill="#fff"/>${body}</svg>`
}
const svgUri = svg => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
export function shelfImage(p, { alt = p.title, className = '' } = {}) {
  if (p.photo && photoStyle(p.photo)) return productPhoto(p.photo, alt, className)
  return `<img class="wm-shelf-art ${esc(className)}" src="${svgUri(shapeSvg(p))}" alt="${esc(alt)}" width="400" height="300">`
}
export function shelfGallery(p) {
  const views = ['Product view', 'Alternate view', 'Close-up']
  return `<section class="pa-gallery wm-shelf-gallery" data-product-id="${esc(p.id)}" aria-label="Product images"><div class="wm-shelf-stage">${shelfImage(p, { alt: p.title })}</div><div class="wm-shelf-thumbs" aria-label="Image thumbnails">${views.map((v, i) => `<span class="wm-shelf-thumb${i === 0 ? ' is-active' : ''}">${shelfImage(p, { alt: v })}</span>`).join('')}</div></section>`
}
