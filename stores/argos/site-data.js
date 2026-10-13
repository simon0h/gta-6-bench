// Argos.co.uk chrome and information architecture captured on 2026-10-13 (see research/parity/argos.json).
// Paths mirror argos.co.uk / help.argos.co.uk URL paths. Off-site destinations (Sainsbury's corporate,
// careers, partner sites) are local summary pages so agents never leave the sandbox.

// Header utility bar (top right on argos.co.uk)
export const UTILITY = [['Track Order', '/order/tracking'], ['Returns', '/order/tracking?type=returns'], ['Stores', '/stores'], ['Help', '/help']]

// "Shop" mega menu: department → column groups → links (first links of each column on argos.co.uk)
export const MENU = [
  { label: 'Christmas', path: '/events/christmas-gifts', id: 'christmas', groups: [
    { title: 'Christmas', links: [['Christmas Gifts', '/events/christmas-gifts'], ['Christmas Trees', '/browse/home-and-furniture/home-furnishings/christmas-decorations/christmas-trees/c:29817/'], ['Toy Offers', '/events/toys-offers'], ['Kids Gifts', '/browse/toys/gifts-for-kids/c:1100025/']] }] },
  { label: 'Toys', path: '/browse/toys/c:30299/', id: 'toys', dept: 'toys', groups: [
    { title: 'Toy Offers', links: [['Shop all Toy Offers', '/events/toys-offers']] },
    { title: 'Shop by Age', links: [['1 to 2 years', '/sd/1-to-2-years-toys/']] },
    { title: 'Pretend Play', links: [['Playsets & Figures', '/browse/toys/playsets-and-figures/c:30373/']] },
    { title: 'Kids Gifting', links: [['All Kids Gifts', '/browse/toys/gifts-for-kids/c:1100025/']] },
    { title: 'Games & Puzzles', links: [['Board Games', '/browse/toys/family-games/board-games/c:30423/']] },
    { title: 'Art & Creativity', links: [['All Creative Toys', '/browse/toys/art-and-creativity-toys/c:30302/']] },
    { title: 'Dolls & Soft Toys', links: [['All Dolls & Accessories', '/browse/toys/dolls-and-doll-accessories/c:30305/']] },
    { title: 'Cars & Vehicles', links: [['All Toy Vehicles', '/browse/toys/toy-vehicles-and-sets/c:30311/']] }] },
  { label: 'Technology', path: '/browse/technology/c:29949/', id: 'technology', dept: 'technology', groups: [
    { title: 'Televisions', links: [['Televisions', '/browse/technology/televisions-and-accessories/televisions/c:30106/']] },
    { title: 'Home Cinema', links: [['Sound Bars', '/browse/technology/sound-bars/c:30123/']] },
    { title: 'Cameras', links: [['Cameras', '/browse/technology/cameras/c:30168/']] },
    { title: 'Phones & Accessories', links: [['SIM Free Mobile Phones', '/browse/technology/mobile-phones-and-accessories/sim-free-phones/c:30147/']] },
    { title: 'Smart Technology', links: [['Smart Watches', '/browse/jewellery-and-watches/watches/smart-watches/c:786024/']] },
    { title: 'Headphones & Audio', links: [['Wireless Headphones', '/browse/technology/headphones-and-earphones/wireless-headphones/c:815766/']] },
    { title: 'Laptops & PCs', links: [['Laptops & 2-in-1s', '/browse/technology/laptops-and-pcs/laptops/c:30049/']] },
    { title: 'Tablets & iPads', links: [['Tablets', '/browse/technology/tablets-and-ipad/tablets/c:30159/']] }] },
  { label: 'Gaming', path: '/browse/technology/video-games-and-consoles/c:29952/', id: 'gaming', dept: 'gaming', h1: 'Video Games & Gaming Consoles', groups: [
    { title: 'PlayStation', links: [['Shop all PlayStation', '/browse/technology/video-games-and-consoles/playstation/c:812419/'], ['PS5 Consoles', '/browse/technology/video-games-and-consoles/playstation/ps5-consoles/c:812421/'], ['PS5 Games', '/browse/technology/video-games-and-consoles/playstation/ps5-games/c:812420/']], platform: 'ps5' },
    { title: 'XBOX', links: [['Shop all XBOX', '/browse/technology/video-games-and-consoles/xbox/c:812424/'], ['XBOX Series X Consoles', '/browse/technology/video-games-and-consoles/xbox/xbox-series-x-consoles/c:812425/'], ['XBOX Series Games', '/browse/technology/video-games-and-consoles/xbox/xbox-series-games/c:812426/']], platform: 'xbox' },
    { title: 'Nintendo', links: [['Shop all Nintendo', '/browse/technology/video-games-and-consoles/nintendo/c:30291/'], ['Nintendo Switch 2 Consoles', '/browse/technology/video-games-and-consoles/nintendo/nintendo-switch-2-consoles/c:1054684/'], ['Nintendo Switch Games', '/browse/technology/video-games-and-consoles/nintendo/nintendo-switch-games/c:30292/']] },
    { title: 'Pre-order Games', links: [['Pre-order Games', '/browse/technology/video-games-and-consoles/pre-order-games/c:29997/']] },
    { title: 'Digital Downloads', links: [['PlayStation Digital Downloads', '/browse/technology/video-games-and-consoles/playstation/playstation-digital-downloads/c:1012069/']] },
    { title: 'Gaming Accessories', links: [['Gaming Headsets', '/browse/technology/video-games-and-consoles/gaming-headsets/c:29987/']] },
    { title: 'Gaming Inspiration', links: [['Upcoming Games', '/features/gaming']] },
    { title: 'PC Gaming', links: [['Shop all PC Gaming', '/browse/technology/video-games-and-consoles/pc-gaming/c:29986/'], ['Gaming Laptops', '/browse/technology/laptops-and-pcs/gaming-laptops/c:30279/'], ['PC Games', '/browse/technology/video-games-and-consoles/pc-gaming/pc-games/c:30005/']] }] },
  { label: 'Home & Furniture', path: '/browse/home-and-furniture/c:29351/', id: 'home-and-furniture', dept: 'home-and-furniture', groups: [
    { title: 'Bedroom', links: [['Beds', '/browse/home-and-furniture/bedroom-furniture/beds/c:29865/']] },
    { title: 'Living Room', links: [['Sofas', '/browse/home-and-furniture/living-room-furniture/sofas/c:29643/']] },
    { title: 'Furnishings & Accessories', links: [['Rugs & Runners', '/browse/home-and-furniture/home-furnishings/rugs-and-runners/c:1000173/']] },
    { title: 'Kitchen', links: [['Kitchenware & Accessories', '/browse/home-and-furniture/kitchenware/c:29704/']] },
    { title: 'Dining Room', links: [['Dining Table Sets', '/browse/home-and-furniture/dining-room-furniture/dining-table-and-chair-sets/c:29647/']] },
    { title: 'Office', links: [['Desks', '/browse/home-and-furniture/office-furniture/desks/c:29863/']] },
    { title: 'Lighting', links: [['Ceiling Lights', '/browse/home-and-furniture/lighting/ceiling-lights/c:29802/']] },
    { title: 'Storage & Organisation', links: [['Storage Units', '/browse/home-and-furniture/storage-and-organisation/storage-units/c:29590/']] }] },
  { label: 'Health & Beauty', path: '/browse/health-and-beauty/c:29203/', id: 'health-and-beauty', groups: [
    { title: 'Hair Care & Styling', links: [['Hair Stylers', '/browse/health-and-beauty/hair-care/hot-air-stylers-and-brushes/c:29238/']] },
    { title: 'Dental', links: [['Electric Toothbrushes', '/browse/health-and-beauty/electric-toothbrushes/c:29231/']] },
    { title: 'Fragrance', links: [['Perfume', '/browse/health-and-beauty/fragrance/perfume/c:29282/']] },
    { title: 'Makeup', links: [['Makeup Sets', '/browse/health-and-beauty/makeup/makeup-sets/c:29265/']] },
    { title: 'Skincare & Beauty', links: [['Beauty Appliances', '/browse/health-and-beauty/beauty-appliances/c:29259/']] },
    { title: 'Massagers', links: [['Handheld Massagers', '/browse/health-and-beauty/wellness/handheld-massagers/c:29227/']] },
    { title: 'Mens Shaving & Grooming', links: [['Mens Shavers', '/browse/health-and-beauty/mens-shaving-and-grooming/shavers-and-shaving-accessories/mens-electric-shavers/c:29256/']] },
    { title: 'Health', links: [['Blood Pressure Monitors', '/browse/health-and-beauty/health/blood-pressure-monitors/c:29219/']] }] },
  { label: 'Appliances', path: '/browse/appliances/c:787124/', id: 'appliances', dept: 'appliances', groups: [
    { title: 'Vacuum Cleaners & Floorcare', links: [['Vacuum Cleaners', '/browse/appliances/vacuum-cleaners-and-floorcare/vacuum-cleaners/c:29693/']] },
    { title: 'Fridges & Freezers', links: [['Fridge Freezers', '/browse/appliances/fridges-and-freezers/fridge-freezers/c:29617/']] },
    { title: 'Laundry', links: [['Washing Machines', '/browse/appliances/laundry/washing-machines/c:29612/']] },
    { title: 'Cooking', links: [['Freestanding Cookers', '/browse/appliances/cookers-ovens-and-hobs/freestanding-cookers/c:29623/']] },
    { title: 'Dishwashers', links: [['Dishwashers', '/browse/appliances/dishwashers/c:29615/']] },
    { title: 'Kettles, Microwaves & Toasters', links: [['Kettles', '/browse/appliances/kettles/c:29560/']] },
    { title: 'Heating & Cooling', links: [['Heaters', '/browse/appliances/fans-heaters-and-dehumidifiers/heaters-and-radiators/c:29444/']] },
    { title: 'Small Cooking Appliances', links: [['Air Fryers & Fryers', '/browse/appliances/small-cooking-appliances/air-fryers-and-fryers/c:29575/']] }] },
  { label: 'Sports & Leisure', path: '/browse/sports-and-leisure/c:30468/', id: 'sports-and-leisure', dept: 'sports-and-outdoors', groups: [
    { title: 'Weight Training', links: [['Dumbbells', '/browse/sports-and-leisure/weights/dumbbells/c:30630/']] },
    { title: 'Exercise Machines', links: [['Treadmills', '/browse/sports-and-leisure/exercise-machines/treadmills/c:30612/']] },
    { title: 'Fitness & Gym', links: [['Exercise Mats', '/browse/sports-and-leisure/fitness-and-gym-accessories/exercise-and-yoga-mats/c:30622/']] },
    { title: 'Cycling', links: [['Adult Bikes', '/browse/sports-and-leisure/bikes-and-accessories/mens-and-womens-bikes/c:30482/']] },
    { title: 'Sports Equipment', links: [['Football', '/browse/sports-and-leisure/sports/football/c:30531/']] },
    { title: 'Luggage & Travel', links: [['Suitcases', '/browse/sports-and-leisure/bags-luggage-and-travel/suitcases/c:30493/']] },
    { title: 'Camping & Caravanning', links: [['Tents', '/browse/sports-and-leisure/camping-and-caravanning/tents/c:30505/']] },
    { title: 'Fitness Technology', links: [['Fitness Trackers', '/browse/sports-and-leisure/fitness-and-activity-trackers/c:30621/']] }] },
  { label: 'Jewellery & Watches', path: '/browse/jewellery-and-watches/c:29298/', id: 'jewellery-and-watches', groups: [
    { title: 'Watches', links: [['Mens Watches', '/browse/jewellery-and-watches/watches/mens-watches/c:29307/'], ['Womens Watches', '/browse/jewellery-and-watches/watches/womens-watches/c:29306/']] },
    { title: 'Womens Jewellery', links: [['Womens Earrings', '/browse/jewellery-and-watches/womens-jewellery/womens-earrings/c:29315/']] },
    { title: 'Mens Jewellery', links: [['Chains & Necklaces', '/browse/jewellery-and-watches/mens-jewellery/mens-necklaces-and-chains/c:29329/']] },
    { title: 'Kids Jewellery', links: [['Kids Earrings', '/browse/jewellery-and-watches/kids-jewellery/kids-earrings/c:29338/']] },
    { title: 'Rings', links: [['Wedding Rings', '/browse/jewellery-and-watches/wedding-bands/c:1043194/']] },
    { title: 'Metal Type', links: [['Gold Jewellery', '/sd/gold-jewellery/']] },
    { title: 'Jewellery Boxes & Cleaners', links: [['Jewellery Boxes', '/browse/jewellery-and-watches/jewellery-boxes-and-hangers/c:29344/']] }] },
  { label: 'Baby & Nursery', path: '/browse/baby-and-nursery/c:29000/', id: 'baby-and-nursery', dept: 'baby', groups: [
    { title: 'Travel', links: [['Prams & Pushchairs', '/browse/baby-and-nursery/prams-and-pushchairs/c:29042/']] },
    { title: 'Toys', links: [['Early Learning Toys', '/browse/baby-and-nursery/baby-toys/early-learning-toys/c:29101/']] },
    { title: 'Nursery Furniture', links: [['Cots & Cot Beds', '/browse/baby-and-nursery/cots-and-cot-beds/c:29129/']] },
    { title: 'Feeding & Weaning', links: [['Highchairs', '/browse/baby-and-nursery/feeding-and-weaning/highchairs/c:29067/']] },
    { title: 'Bathing & Changing', links: [['Baby Baths', '/browse/baby-and-nursery/bathing-and-changing/baby-baths/c:29089/']] },
    { title: 'Health & Safety', links: [['Baby Monitors', '/browse/baby-and-nursery/health-and-safety/baby-monitors/c:29056/']] },
    { title: 'Sleep Aids', links: [['Nightlights & Projectors', '/browse/baby-and-nursery/baby-sleep-aids/nightlights-projectors-and-clocks/c:29033/']] },
    { title: 'Baby Clothing', links: [['Sleepwear', '/browse/clothing/baby/sleepsuits-and-pyjamas/c:691061/']] }] },
  { label: 'Clothing', path: '/browse/clothing/c:29131/', id: 'clothing', groups: [
    { title: 'Womens Clothing', links: [['Shop All Womens', '/browse/clothing/womens/c:691104/']] },
    { title: 'School Uniform', links: [['Girls Uniform', '/browse/clothing/school-uniforms/girls-school-uniforms/c:812484/']] },
    { title: 'Boys Clothing', links: [['Shop All Boys', '/browse/clothing/boys/c:812621/']] },
    { title: 'Girls Clothing', links: [['Shop All Girls', '/browse/clothing/girls/c:812622/']] },
    { title: 'Mens Clothing', links: [['Shop All Mens', '/browse/clothing/mens/c:691144/']] },
    { title: 'Baby Clothing', links: [['Shop All Baby', '/browse/clothing/baby/all-baby-clothes/c:812374/']] },
    { title: 'Character & Fancy Dress', links: [['Fancy Dress', '/browse/clothing/fancy-dress/c:29137/']] }] },
  { label: 'Garden & DIY', path: '/browse/garden-and-diy/c:797660/', id: 'garden-and-diy', groups: [
    { title: 'Offers', links: [['Shop all Garden & DIY Offers', '/events/garden-diy-offers']] },
    { title: 'Garden Furniture', links: [['Garden Table & Chair Sets', '/browse/garden-and-diy/garden-furniture/patio-sets/c:29391/'], ['Gazebos', '/browse/garden-and-diy/garden-furniture/gazebos-and-awnings/c:29397/']] },
    { title: 'Garden Buildings & Storage', links: [['Sheds', '/browse/garden-and-diy/sheds-and-garden-storage/sheds/c:29492/'], ['Summerhouses', '/browse/garden-and-diy/summer-houses-and-log-cabins/c:29495/'], ['Greenhouses', '/browse/garden-and-diy/greenhouses/greenhouses/c:29490/']] },
    { title: 'BBQs & Outdoor Cooking', links: [['Barbecues', '/browse/garden-and-diy/barbecues/c:29382/']] }] },
]

// Promotional flyout inside the Shop menu (argos.co.uk, 2026-10-13)
export const PROMOS = [['Shop our top 100 deals', '/list/shop-top-100-deals'], ['Shop A-mazing deals', '/amazing-deals'], ['Shop Christmas', '/events/christmas-gifts'], ['Shop Toys 3 for £20', '/list/3-for-20-on-selected-toys']]

export const FOOTER = [
  { title: 'Need help?', links: [['Help & FAQs', '/help'], ['Contact us', '/help/contact'], ['Store finder', '/stores'], ['Account', '/account/login'], ['Advice & inspiration', '/features/advice-and-inspiration']] },
  { title: 'Delivery & returns', links: [['Delivery & collection', '/help/delivery-and-collection-guide'], ['Returns & refunds', '/help/returns-product-support-and-repairs'], ['Track your order', '/order/tracking']] },
  { title: 'Product care', links: [['Argos Care', '/help/argos-care'], ['Product Support', '/help/product-support'], ['Product recall', '/events/safety-product-recalls'], ['Argos Spares', '/help/argos-spares']] },
  { title: 'Payment & services', links: [['Payment types', '/help/payment-types'], ['Gift cards', '/help/gift-cards'], ['Voucher codes', '/events/voucher-discount-codes'], ['eGift Card Rewards', '/features/egift-card-rewards'], ['Argos Pay', '/help/argos-pay'], ['Nectar at Argos', '/help/nectar'], ['Pet Insurance', '/pet-insurance'], ['Furniture Recycling', '/help/furniture-recycling']] },
  { title: 'About Argos', links: [['About us', '/about-us'], ['Argos for Business', '/argos-for-business'], ['Careers', '/careers'], ['Press enquiries', '/press-enquiries'], ['Modern Slavery Statement', '/modern-slavery-statement']] },
]
export const LEGAL = [['Accessibility', '/help/accessibility-statement'], ['Privacy hub', '/privacy-hub'], ['Privacy policy', '/privacy-hub/privacy-policy'], ['Cookies policy', '/privacy-hub/cookie-policy'], ['List of cookies', '/help/cookie-list'], ['Terms & conditions', '/help/terms-and-conditions']]
export const BRAND_HOMES = ['Argos', "Sainsbury's", 'Tu', 'Habitat', 'Nectar']

// Help centre front page (help.argos.co.uk/help)
export const HELP_SECTIONS = [
  { title: 'Check your account', links: [["I haven't received my password reset email", '/help/manage-account'], ['My account has been locked', '/help/manage-account'], ['How do I close my online account?', '/help/manage-account'], ['Manage My Account', '/help/manage-account']] },
  { title: 'Aftersales and returns', links: [['Returns, product support and repairs', '/help/returns-product-support-and-repairs'], ['How do I return a home delivered item, or product I collected in store?', '/help/returns-product-support-and-repairs#how-to-return'], ["In Argos, what's the difference between a large item and a small item?", '/help/delivery-and-collection-guide#big-things'], ['Trusted Seller Returns Policy', '/help/terms-and-conditions#trusted-seller']] },
  { title: 'Ways to pay', links: [['Payment Types', '/help/payment-types'], ['Argos Pay Frequently Asked Questions', '/help/argos-pay#faq'], ["What's PayPal?", '/help/payment-types#paypal'], ['Do we price match with other brands?', '/help/payment-types#price-match'], ['All about Argos Gift Cards/eGift Cards', '/help/gift-cards']] },
  { title: 'Delivery and collection', links: [['Can I amend the delivery address for my order?', '/help/delivery-collection'], ['Can I arrange a Fast Track delivery in-Store?', '/help/delivery-and-collection-guide#small-things'], ['Can I see all your delivery options?', '/help/delivery-and-collection-guide'], ['Can I track my order?', '/order/tracking'], ['Argos Plus', '/help/delivery-and-collection-guide#argos-plus']] },
  { title: 'Insurance and Argos Care', links: [["Can I buy Argos Care after I've bought my item?", '/help/argos-care#further-information'], ['Does Argos Care cover both parts and labour if I make a claim?', '/help/argos-care#electrical'], ['How do I buy Argos Care?', '/help/argos-care#further-information'], ['How do I make an Argos Care claim?', '/help/argos-care#further-information']] },
  { title: 'Product support and information', links: [['Returns, product support and repairs', '/help/returns-product-support-and-repairs'], ['Trusted Sellers', '/help/terms-and-conditions#trusted-seller'], ['Buying Guides', '/features/advice-and-inspiration'], ['Argos Spare Parts', '/help/argos-spares'], ['Where can I find product manuals?', '/help/product-support']] },
]
