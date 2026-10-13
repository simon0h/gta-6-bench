// Walmart.com department and site-section tree, captured 2026-10-13 from
// https://www.walmart.com/all-departments (first eight subcategory links per department),
// the global "Departments" / "Services" menus and the homepage header/footer.
// Paths mirror the real walmart.com paths (tracking query strings such as ?povid= dropped). Where the
// real numeric category id was not captured (Services drawer, Restaurants, Resold) the path is /cp/<slug> only.
// These are navigation pages only: they never add products to the catalog.

// [name, path, subcategories[]]; each subcategory is [name, path].
export const ALL_DEPARTMENTS = [
  ['Savings & Featured Shops', '/shop/savings', [
    ['Shop All Savings', '/shop/savings'], ['Clearance', '/shop/deals/clearance'], ['Flash Deals', '/shop/deals/flash-deals'],
    ['Best Sellers', '/shop/best-sellers'], ['New & Trending', '/cp/new-trending/7689165'], ['Tailgating', '/cp/tailgating/6338015'],
    ['Brand Shop Directory', '/brand/branddirectory'], ['Pride Always', '/cp/pride/9552002']]],
  ['Grocery', '/cp/food/976759', [
    ['Shop all Grocery', '/cp/food/976759'], ['EBT/SNAP eligible food', '/cp/snap-online/1465096'], ['Exclusively online', '/cp/shop-more-than-your-store/7485418'],
    ['Everyday meals', '/cp/dinner-tonight/5681029'], ['Recipes', '/i/recipe-library'], ['Fresh Produce', '/cp/fresh-produce/976793'],
    ['Meat & Seafood', '/cp/meat-seafood/9569500'], ['Deli', '/cp/deli/976789']]],
  ['Home, Furniture & Appliances', '/cp/home/4044', [
    ['Shop All Home', '/cp/home/4044'], ['Furniture', '/cp/furniture/103150'], ['Mattresses & Accessories', '/cp/mattresses-accessories/539386'],
    ['Kitchen & Dining', '/cp/kitchen-dining/623679'], ['Storage & Organization', '/cp/storage-organization/90828'], ['Luggage & Travel', '/cp/luggage/7333633'],
    ['Appliances', '/cp/appliances/90548'], ['Vacuums, Steamers & Floorcare', '/cp/vacuums-steamers-floor-care/4047']]],
  ['Patio & Garden', '/cp/patio-garden/5428', [
    ['Shop All Patio & Garden', '/cp/patio-garden/5428'], ['Patio Furniture', '/cp/patio-furniture/91416'], ['Patio Sets', '/browse/patio-furniture/patio-sets/5428_91416_3013177'],
    ['Conversation Sets', '/browse/patio-garden/patio-conversation-sets/5428_91416_3013177_1225084'], ['Outdoor Cooking', '/cp/grills-outdoor-cooking/4089'],
    ['Gas Grills', '/browse/patio-garden/gas-grills/5428_4089_7375787_7991811'], ['Charcoal', '/browse/patio-garden/lump-charcoal-briquettes/5428_4089_9732116_5377022'],
    ['Outdoor Decor', '/cp/patio-outdoor-decor/1102183']]],
  ['Home Improvement', '/cp/home-improvement/1072864', [
    ['Shop All Home Improvement', '/cp/home-improvement/1072864'], ['Heaters', '/browse/home-improvement/space-heaters/1072864_133032_1161932_1085403'],
    ['Humidifiers', '/browse/home-improvement/humidifiers/1072864_133032_1231459_133042'], ['Air Quality', '/browse/home-improvement/air-quality/1072864_133032_1231459'],
    ['Water Purification', '/browse/home-improvement/water-filters/1072864_6610571_1231153'], ['Tools', '/cp/tools/1031899'],
    ['Fasteners', '/browse/home-improvement/fasteners/1072864_1067612_1067614'], ['Building Materials', '/browse/home-improvement/building-materials/1072864_1172176']]],
  ['Clothing, Shoes & Accessories', '/cp/clothing/5438', [
    ['Shop All Clothing', '/cp/clothing/5438'], ['Premium Fashion', '/cp/premium-fashion/7056862'], ['New Arrivals', '/shop/clothing-and-accessories/new-arrivals'],
    ["Editors' Picks", '/shop/clothing-and-accessories/editors-picks'], ['Now Trending', '/cp/trending/5289731'], ['Women', '/cp/womens-clothing/133162'],
    ["Women's Plus", '/cp/womens-plus/133195'], ['Men', '/cp/mens-clothing/133197']]],
  ['Toys', '/cp/toys/4171', [
    ['Shop All Toys', '/cp/toys/4171'], ['Action Figures', '/cp/action-figures/4172'], ['Dolls & Dollhouses', '/cp/dolls-dollhouses/4187'],
    ['Learning Toys', '/cp/learning-toys/56125'], ['Dart Blasters', '/browse/toys/nerf-blaster-toys/4171_14521_936979'], ['Games & Puzzles', '/cp/games-puzzles/4191'],
    ['Collectibles', '/cp/collectibles/5967908'], ['Cars, Drones & RC', '/browse/remote-control-play-vehicles/4171_1111647']]],
  ['Baby & Kids', '/cp/baby-products/5427', [
    ['All Baby', '/cp/baby-products/5427'], ['Baby Days', '/shop/deals/baby'], ['Diapers & Wipes', '/cp/diapering/486190'],
    ['Baby Registry', '/cp/baby-registry/1229485'], ['Baby Clothing', '/browse/5438_7712430_8775031_4648145'], ['Toddler Clothing', '/browse/5438_7712430_2700757_2676407'],
    ['Kids Clothing', '/cp/kids-clothing/7712430']]],
  ['Video Games', '/cp/video-games/2636', [
    ['Shop all Video Games', '/cp/video-games/2636'], ['Xbox', '/cp/xbox-series-x/9206773'], ['PlayStation', '/cp/playstation-5/3475115'],
    ['Nintendo', '/cp/nintendo-switch/4646529'], ['Video Game Accessories', '/browse/video-games/video-game-accessories/2636_1229019'],
    ['Virtual Reality', '/browse/video-games/virtual-reality/2636_5454301'], ['Video Game Savings', '/shop/deals/video-games-and-media']]],
  ['Electronics', '/cp/electronics/3944', [
    ['Shop All Electronics', '/cp/electronics/3944'], ['TV & Video', '/cp/tv-video/1060825'], ['Home Audio & Theater', '/browse/home-audio-theater/3944_77622'],
    ['Smart Home', '/cp/smart-home/1229875'], ['Tablets & Accessories', '/cp/ipad-tablets/1078524'], ['Computers', '/cp/computers/3951'],
    ['Cell Phones', '/cp/cell-phones/1105910'], ['Wearable Tech', '/cp/wearable-technology/1229723']]],
  ['Pharmacy, Health & Wellness', '/cp/health/976760', [
    ['All Health & Wellness', '/cp/the-wellness-hub/5523094'], ['Pharmacy', '/cp/pharmacy/5431'], ['Allergy & Sinus', '/cp/allergy-sinus/3771182'],
    ['Vitamins & Supplements', '/cp/vitamins-supplements/1005863'], ['Caregiver Hub', '/cp/caregiver/2915579'],
    ['Protein, Fitness, & Weight Management', '/cp/protein-fitness/1166769'], ["Women's Wellness", '/cp/1767021'], ['Pain Management', '/cp/pain-management/6972993']]],
  ['Personal Care', '/cp/personal-care/1005862', [
    ['Shop All Personal Care', '/cp/personal-care/1005862'], ['Multipacks', '/browse/seasonal/personal-care-stock-up/1085632_9267270_7332448'], ['Bath & Body', '/cp/bath-body/1071969'],
    ['Oral Care', '/cp/oral-care/1007221'], ['Feminine Care', '/browse/personal-care/feminine-care/1005862_1091866'], ['Incontinence', '/browse/personal-care/incontinence/1005862_1225655'],
    ['Sexual Wellness', '/cp/sexual-wellness/1414629'], ['Shaving', '/cp/shaving/1007220']]],
  ['Beauty', '/cp/beauty/1085666', [
    ['All Beauty', '/cp/beauty/1085666'], ['Premium Beauty', '/cp/premium-beauty/7924299'], ['Makeup', '/cp/makeup/1007040'],
    ['Haircare', '/cp/hair-care/1007219'], ['Skincare', '/cp/skin-care/1007039'], ['Fragrance', '/cp/fragrances/133225'],
    ['Nail Care', '/cp/nailcare/3592123'], ['Suncare & Tanning', '/browse/beauty/facial-sunscreen/1085666_1007039_4046177']]],
  ['Auto & Tires', '/cp/auto-tires/91083', [
    ['Shop All Auto & Tires', '/cp/auto-tires/91083'], ['Tires', '/cp/tires-accessories/1077064'], ['Batteries & Accessories', '/cp/batteries-accessories/1104292'],
    ['Auto Care Center', '/cp/auto-services/1087266'], ['Oils and Fluids', '/cp/oils-fluids/1104294'], ['Replacement Auto Parts', '/cp/automotive-replacement-parts/1074765'],
    ['Auto Electronics', '/cp/auto-electronics/3947'], ['Exterior Car Parts & Accessories', '/cp/exterior-car-parts-accessories/1074784']]],
  ['Household Essentials', '/cp/household-essentials/1115193', [
    ['All Household Essentials', '/cp/household-essentials/1115193'], ['Delivery Subscriptions', '/browse/household-essentials/household-essentials-subscription/1115193_7023530'],
    ['Cleaning Supplies', '/browse/household-essentials/cleaning-supplies/1115193_1071966'], ['Laundry', '/browse/household-essentials/laundry/1115193_1071967'],
    ['Bathroom', '/browse/household-essentials/bathroom/1115193_1071965'], ['Kitchen', '/browse/household-essentials/kitchen/1115193_1071968'],
    ['Paper & Plastic', '/browse/household-essentials/paper-plastic/1115193_1073264'], ['Air Fresheners', '/browse/household-essentials/air-fresheners/1115193_1025739']]],
  ['Sports & Outdoors', '/cp/sports-and-outdoors/4125', [
    ['Shop All Sports & Outdoors', '/cp/sports-and-outdoors/4125'], ['Sports', '/cp/sports/4161'], ['Basketball', '/browse/sports-outdoors/basketball/4125_4161_4165'],
    ['Football', '/browse/sports-outdoors/football-gear-equipment/4125_4161_434036'], ['Golf', '/browse/sports-outdoors/golf-equipment/4125_4161_4152'],
    ['Pickleball', '/browse/sports-outdoors/pickleball/4125_4161_6675878'], ['Soccer', '/browse/sports-outdoors/soccer/4125_4161_432196'], ['Fitness', '/cp/exercise-fitness/4134']]],
  ['Pets', '/cp/pet-supplies/5440', [
    ['Pet Profiles', '/account/pet-hub'], ['The Pet Event', '/cp/the-pet-event/6286537'], ['Pet Prescriptions', '/cp/8328098'],
    ['Dog Supplies', '/cp/dogs/202072'], ['Dog Food', '/browse/pets/dog-food-and-treats/5440_202072_6432755'], ['Dog Toys', '/browse/pets/all-dog-toys/5440_202072_2243339_202086'],
    ['Cat Supplies', '/cp/cats/202073'], ['Cat Food', '/browse/pets/cat-food/5440_202073_1749780']]],
  ['School & Office Supplies', '/cp/office-supplies/1229749', [
    ['Shop All School & Office', '/cp/office-supplies/1229749'], ['School Supplies', '/cp/school-supplies/1086045'], ["Teacher's Classroom Shop", '/cp/teaching-classroom-supplies/3462603'],
    ['Bulk Teaching Supplies', '/browse/teaching-and-classroom-supplies/teachers-supplies-in-bulk/1229749_1086045_3462603_1889202'],
    ['School Arts and Crafts', '/browse/office-supplies/school-arts-crafts/1229749_1086045_1718345'], ['Shipping & Moving', '/cp/shipping-moving/2696828'],
    ['Safes & Lockboxes', '/browse/home-safety/safes-lockboxes/1072864_1068865_1231016'], ['Walmart for Business', '/cp/about-walmart-business/6136230']]],
  ['Arts, Crafts, Sewing & Party Supplies', '/cp/arts-crafts-sewing/1334134', [
    ['Shop All Arts & Crafts', '/cp/arts-crafts-sewing/1334134'], ['Sewing Machines & Accessories', '/cp/sewing/1094704'], ['Die Cutting', '/browse/arts-crafts-sewing/die-cutting/1334134_3123463'],
    ['Fabric', '/cp/fabric/4232946'], ['Arts & Crafts Furniture and Storage', '/browse/arts-crafts-sewing/arts-crafts-furniture-and-storage/1334134_6355365'],
    ['Craft Supplies', '/cp/crafting/6172404'], ['Art Supplies', '/cp/art-supplies/5899871'], ['Knitting & Crochet', '/browse/arts-crafts-sewing/knitting-crochet/1334134_4880989']]],
  ['Movies & TV', '/cp/movies-tv/4096', [
    ['Shop All Movies & TV', '/cp/movies-tv/4096'], ['4K Ultra HD Movies', '/browse/4k-ultra-hd-movies/4096_3315790'], ['Blu-ray Movies', '/browse/movies-tv-shows/blu-ray-movies/4096_616859'],
    ['DVD Movies', '/browse/movies-tv-shows/dvd-movies/4096_8073310_7001804'], ['4K Ultra HD TV Shows', '/browse/movies-tv-shows/tv-shows-4k-ultra-hd/4096_6003122_2378322'],
    ['Blu-ray TV Shows', '/browse/movies-tv-shows/tv-shows-blu-ray/4096_6003122_8068379'], ['DVD TV Shows', '/browse/movies-tv-shows/tv-shows-dvd/4096_6003122_3476135']]],
  ['Music & Vinyl', '/cp/music/4104', [
    ['Shop All Music', '/cp/music/4104'], ['Turntables', '/browse/musical-instruments/turntables-record-players/7796869_1097690_6268144_2152355_49600'],
    ['Musical instruments', '/browse/musical-instruments/7796869'], ['Rap & hip-hop', '/browse/music/rap-hip-hop-on-cds-vinyl/4104_4117'], ['Rock', '/browse/music/rock-music/4104_4118'],
    ['Pop', '/browse/music/pop-music/4104_4115'], ['Country', '/browse/music/country-music/4104_4109'], ['Classical', '/browse/music/classical-music-on-cd-or-vinyl/4104_4108']]],
  ['Books', '/cp/books/3920', [
    ['Shop all books', '/cp/books/3920'], ['Kobo eReaders', '/browse/books/kobo-ereader-devices-accessories/3920_3252253'], ["Children's books", '/browse/childrens-kids-books/3920_582053'],
    ['Textbooks', '/browse/textbooks/3920_582377'], ['Teen & Young Adult books', '/browse/books/teen-young-adult-books/3920_1068785'], ['Magazines', '/browse/books/magazines/3920_3298715'],
    ['Biographies & Memoirs', '/browse/books/biographies-memoirs/3920_5196470']]],
  ['Seasonal & Celebrations', '/cp/party-occasions/2637', [
    ['Shop All Party & Occasions', '/cp/party-occasions/2637'], ['Baby Shower', '/browse/party-occasions/baby-shower-party-supplies/2637_1042319_4687421'],
    ['Balloons', '/browse/party-occasions/balloons/2637_1042319_1212898_3956207'], ['Balloon Arches', '/browse/party-occasions/balloon-arch/2637_1042319_1212898_3956207_2139180_4860386'],
    ['Balloons by Color', '/browse/party-occasions/balloons-by-color/2637_1042319_1212898_3956207_6986611'], ['Birthday Party Supplies', '/browse/party-occasions/birthday-party-supplies/2637_8972913_8516046'],
    ['Gender Reveal', '/browse/party-occasions/gender-reveal-party-supplies/2637_9103747'], ['Helium Tanks', '/browse/party-occasions/helium-tanks/2637_1042319_1212898_4114382']]],
  ['Gift Cards', '/cp/gift-cards/96894', [
    ['Shop all Gift Cards', '/cp/gift-cards/96894'], ['Gaming Gift Cards', '/browse/gifts-registry/gaming-gift-cards/1094765_96894_8922996_9379468'],
    ['Restaurant Gift Cards', '/browse/gifts-registry/restaurant-gift-cards/1094765_96894_8922996_8305131'], ['Retail Gift Cards', '/browse/gifts-registry/retail-gift-cards/1094765_96894_8922996_3374424'],
    ['Prepaid Gift Cards', '/browse/cell-phones/phone-data-plans/1105910_4960552'], ['Entertainment Gift Cards', '/browse/gifts-registry/entertainment-gift-cards/1094765_96894_8922996_2765943'],
    ['Travel Gift Cards', '/browse/gifts-registry/travel-gift-cards/1094765_96894_8922996_9617007'], ['Lifestyle Gift Cards', '/browse/gifts-registry/lifestyle-gift-cards/1094765_96894_8922996_7573523']]],
]

// The global header "Departments" drawer (headings as shown on walmart.com, seasonal "Halloween" omitted).
export const DEPARTMENT_MENU = [
  ['Rollbacks & More', '/shop/savings'], ['Grocery', '/cp/food/976759'], ['Clothing, Shoes & Accessories', '/cp/clothing/5438'],
  ['Baby', '/cp/baby-products/5427'], ['Pharmacy, Health & Wellness', '/cp/health/976760'], ['Home, Garden & Tools', '/cp/home/4044'],
  ['Electronics', '/cp/electronics/3944'], ['Gaming & Movies', '/cp/video-games/2636'], ['Auto & Tires', '/cp/auto-tires/91083'],
  ['Personal Care', '/cp/personal-care/1005862'], ['Beauty', '/cp/beauty/1085666'], ['Toys & Outdoor Play', '/cp/toys/4171'],
  ['Household Essentials', '/cp/household-essentials/1115193'], ['Pet Supplies', '/cp/pet-supplies/5440'],
  ['School, Office & Art Supplies', '/cp/office-supplies/1229749'], ['Sports & Outdoors', '/cp/sports-and-outdoors/4125'],
  ['Collectibles', '/cp/collectibles/5967908'], ['Books', '/cp/books/3920'], ['Music', '/cp/music/4104'],
  ['Party Supplies', '/cp/party-occasions/2637'], ['Resold', '/cp/resold'],
]

// The global header "Services" drawer.
export const SERVICE_MENU = [
  ['Auto Care Services', '/cp/auto-services/1087266'], ['Pharmacy', '/cp/pharmacy/5431'], ['Health Services', '/cp/health-services'],
  ['Vaccines', '/cp/vaccines'], ['Vision Center', '/cp/vision-center'], ['Benefit Programs', '/cp/benefit-programs'],
  ['Insurance Services', '/cp/insurance-services'], ['Lists', '/lists'], ['Registries', '/my-registries'], ['Gift Cards', '/cp/gift-cards/96894'],
  ['Spark Good', '/cp/spark-good'], ['Custom Cakes', '/cp/custom-cakes'], ['Photo Services', '/cp/photo-services'],
  ['Protection Services', '/cp/protection-services'], ['Home & Tech Services', '/cp/home-tech-services'],
  ['Subscriptions', '/cp/subscriptions/4191733'], ['Walmart Business', '/cp/about-walmart-business/6136230'],
]

// Secondary nav bar links in the white row under the blue header.
export const NAV_BAR = [
  ['Rollbacks & More', '/shop/savings'], ['Restaurants', '/cp/restaurants'], ['Get it Fast', '/shop/get-it-fast'],
  ['Pharmacy', '/cp/pharmacy/5431'], ['Walmart+', '/plus'], ['More', '/all-departments'],
]

// Footer, in the order shown on walmart.com. Off-site destinations are local info pages.
export const FOOTER_LINKS = [
  ['All Departments', '/all-departments'], ['Store Directory', '/store/directory'], ['Careers', '/careers'], ['Our Company', '/our-company'],
  ['Sell on Walmart.com', '/sell-on-walmart'], ['Help', '/help'], ['Product Recalls', '/product-recalls'],
  ['Accessibility', '/help/article/responsible-disclosure-and-accessibility-policies/0f173dab8bd942da84b1cd7ab5ffc3cb'],
  ['Tax Exempt Program', '/cp/tax-exemption-program/8480422'], ['Get the Walmart App', '/cp/walmart-mobile-app/1087865'],
  ['Safety Data Sheet', '/safety-data-sheet'], ['Terms of Use', '/help/article/walmart-com-terms-of-use/3b75080af40340d6bbd596f116fae5a0'],
  ['Privacy Notice', '/privacy-notice'], ['California Supply Chain Act', '/california-transparency'], ['Your Privacy Choices', '/privacyrequest'],
  ['Notice at Collection', '/notice-at-collection'], ['AdChoices', '/adchoices'], ['Consumer Health Data Privacy Notices', '/consumer-health-data-privacy-notices'],
  ['Learn about Spark Driver', '/spark-driver'], ['Brand Shop Directory', '/brand/branddirectory'], ['Walmart Business', '/cp/about-walmart-business/6136230'],
  ['#IYWYK', '/cp/walmart-in-the-know/7781927'], ['Delete Account', '/account/delete-account'],
]
