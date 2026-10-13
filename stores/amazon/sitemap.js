// Amazon.com (US) site structure: header navigation, footer, department tree (the real
// /gp/site-directory) and the non-product sections. Paths mirror amazon.com URL shapes; every
// off-site destination (corporate, careers, seller and partner sites) is a local summary page.
// Department and subcategory landings reproduce structure only: products are listed only when
// the store catalog already carries them.

export const VIDEO_GAMES_PATH = '/computer-video-games-hardware-accessories/b?node=468642'
export const GIFT_CARDS_PATH = '/gift-cards/b?node=2238192011'
export const HELP_PATH = '/gp/help/customer/display.html'
export const helpNode = id => `${HELP_PATH}?nodeId=${id}`
export const SITE_DIRECTORY = '/gp/site-directory'

// [label, slug, node, tagline, photo key, [ [sub label, node, photo key], ... ]]
const TREE = [
  ['Amazon Devices', 'amazon-devices', '2102313011', 'Echo smart speakers, Fire TV, Kindle, Ring and Blink devices designed by Amazon.', 'speaker-green', [['Echo & Alexa', '9818047011', 'speaker'], ['Fire TV', '8521791011', 'streaming-player'], ['Fire Tablets', '6669703011', 'tablet'], ['Kindle E-readers', '6669702011', 'tablet'], ['Ring', '14335814011', 'video-doorbell'], ['Blink', '18021383011', 'security-camera-white']]],
  ['Electronics', 'electronics', '172282', 'TVs, headphones, cameras, cell phones and the accessories that connect them.', 'headphones', [['TV & Video', '1266092011', 'television'], ['Headphones', '172541', 'headphones-cream'], ['Cell Phones & Accessories', '2335752011', 'smartphone'], ['Camera & Photo', '502394', 'mirrorless-camera'], ['Home Audio', '667846011', 'soundbar'], ['Wearable Technology', '10048700011', 'smartwatch-black'], ['Portable Audio & Video', '172623', 'earbuds']]],
  ['Computers', 'computers-and-accessories', '541966', 'Laptops, desktops, monitors, tablets, networking and computer accessories.', 'laptop', [['Laptops', '565108', 'laptop'], ['Desktops', '565098', 'monitor'], ['Monitors', '1292115011', 'monitor'], ['Tablets', '1232597011', 'tablet'], ['Computer Accessories & Peripherals', '172456', 'keyboard'], ['Networking Products', '172504', 'router'], ['Data Storage', '1292110011', 'ssd'], ['Printers', '172635', 'printer']]],
  ['Smart Home', 'smart-home', '6563140011', 'Smart lighting, plugs, security cameras, thermostats and voice-controlled devices.', 'smart-plug', [['Smart Lighting', '6291358011', 'desk-lamp-white'], ['Smart Plugs & Outlets', '6291359011', 'smart-plug'], ['Security Cameras & Systems', '6291365011', 'security-camera-white'], ['Thermostats', '6291364011', 'thermostat'], ['Video Doorbells', '6291362011', 'video-doorbell']]],
  ['Arts & Crafts', 'arts-crafts-sewing', '2617941011', 'Painting, drawing, sewing, knitting, scrapbooking and craft supplies.', 'crayons', [['Painting, Drawing & Art Supplies', '2747968011', 'crayons'], ['Sewing', '12899091', 'tote'], ['Knitting & Crochet', '262592011', 'cushion'], ['Scrapbooking & Stamping', '12898451', 'notebooks']]],
  ['Automotive', 'automotive', '15684181', 'Replacement parts, tools, car care, interior and exterior accessories.', 'action-camera', [['Car Care', '15718271', 'cleaning-wipes'], ['Car Electronics & Accessories', '2230642011', 'action-camera'], ['Interior Accessories', '15857511', 'cushion'], ['Tools & Equipment', '15706941', 'storage-bins'], ['Replacement Parts', '15719731', 'usb-hub']]],
  ['Baby', 'baby', '165796011', 'Diapers, feeding, strollers, car seats, nursery furniture and baby care.', 'stroller-gray', [['Diapering', '166764011', 'diaper-pants'], ['Feeding', '166777011', 'baby-bottle'], ['Strollers & Accessories', '8446318011', 'stroller-gray'], ['Nursery', '695338011', 'crib-wood'], ['Baby Care', '17720255011', 'baby-wipes']]],
  ['Beauty & Personal Care', 'beauty', '3760911', 'Makeup, skin care, hair care, fragrance, tools and personal care.', 'serum', [['Makeup', '11058281', 'lipstick'], ['Skin Care', '11060451', 'moisturizer'], ['Hair Care', '11057241', 'shampoo'], ['Fragrance', '11056591', 'perfume'], ['Tools & Accessories', '11062741', 'hairdryer'], ['Personal Care', '3777891', 'foaming-cleanser']]],
  ["Women's Fashion", 'womens-fashion', '7147440011', "Clothing, shoes, jewelry, watches and handbags for women.", 'tote', [['Clothing', '1040660', 'hoodie'], ['Shoes', '679337011', 'canvas-sneakers'], ['Jewelry', '7192394011', 'analog-watch'], ['Watches', '6358543011', 'smartwatch-black'], ['Handbags', '15743631', 'crossbody-black']]],
  ["Men's Fashion", 'mens-fashion', '7147441011', "Clothing, shoes, watches and accessories for men.", 'jeans', [['Clothing', '1040658', 'tshirt'], ['Shoes', '679255011', 'sneakers'], ['Watches', '6358539011', 'analog-watch'], ['Accessories', '2474937011', 'cap']]],
  ["Girls' Fashion", 'girls-fashion', '7147442011', "Clothing, shoes, jewelry and school uniforms for girls.", 'doll-pink', [['Clothing', '1040664', 'tshirt'], ['Shoes', '679217011', 'kids-trainers-blue'], ['Jewelry', '3880961', 'analog-watch'], ['School Uniforms', '1046612', 'backpack']]],
  ["Boys' Fashion", 'boys-fashion', '7147443011', "Clothing, shoes, watches and school uniforms for boys.", 'kids-tracksuit-blue', [['Clothing', '1040666', 'kids-tracksuit-blue'], ['Shoes', '679182011', 'kids-trainers-blue'], ['Watches', '6358551011', 'smartwatch-black'], ['School Uniforms', '1046614', 'backpack']]],
  ['Health & Household', 'health-household', '3760901', 'Vitamins, household supplies, medical supplies, wellness and baby & child care.', 'paper-towels', [['Household Supplies', '15342811', 'laundry-detergent'], ['Vitamins, Minerals & Supplements', '3764441', 'oatmeal'], ['Health Care', '10079992011', 'body-lotion-cream'], ['Medical Supplies & Equipment', '3775161', 'digital-scale-dark'], ['Sports Nutrition', '6973663011', 'sport-bottle-black']]],
  ['Home & Kitchen', 'home-garden-kitchen-furniture-bedding', '1055398', 'Kitchen & dining, furniture, bedding, bath, home décor, storage and vacuums.', 'armchair', [['Kitchen & Dining', '284507', 'dutch-oven'], ['Bedding', '1063252', 'bedding-white'], ['Bath', '1063236', 'bath-towels'], ['Furniture', '1063306', 'sofa-gray-three-seat'], ['Home Décor', '1063278', 'planter-stoneware-white'], ['Storage & Organization', '3610841', 'storage-bins'], ['Vacuums & Floor Care', '510106', 'stick-vacuum-blue'], ['Wall Art', '3736081', 'floor-mirror-oak']]],
  ['Industrial & Scientific', 'industrial-scientific', '16310091', 'Lab, janitorial, safety, test and measurement and professional supplies.', 'probe-thermometer', [['Janitorial & Sanitation Supplies', '317970011', 'floor-mop'], ['Lab & Scientific Products', '317971011', 'probe-thermometer'], ['Occupational Health & Safety Products', '318135011', 'headband-white'], ['Test, Measure & Inspect', '256346011', 'digital-scale-white']]],
  ['Luggage', 'luggage-travel-gear', '9479199011', 'Suitcases, travel backpacks, duffels, travel accessories and totes.', 'duffel-black', [['Suitcases', '15743251', 'duffel-black'], ['Backpacks', '360832011', 'backpack'], ['Travel Duffels', '15743271', 'duffel-black'], ['Travel Accessories', '15743161', 'crossbody-black']]],
  ['Movies & Television', 'movies-tv', '2625373011', 'Blu-ray, 4K Ultra HD, DVD and TV series to own.', 'television', [['Blu-ray', '2901953011', 'disc-wallet-black'], ['4K Ultra HD', '13012391', 'television'], ['DVD', '2649512011', 'disc-wallet-black'], ['TV Shows', '2649513011', 'streaming-player']]],
  ['Pet Supplies', 'pet-supplies', '2619533011', 'Food, treats, toys, beds and supplies for dogs, cats, fish, birds and small animals.', 'dog-food', [['Dogs', '2975312011', 'dog-food'], ['Cats', '2975241011', 'cat-food'], ['Fish & Aquatic Pets', '2975446011', 'aquarium-black'], ['Birds', '2975221011', 'bird-feeder-green'], ['Small Animals', '2975504011', 'small-pet-habitat']]],
  ['Software', 'software', '229534', 'Antivirus & security, business & office, education, photography and utilities.', 'laptop', [['Antivirus & Security', '229677', 'laptop'], ['Business & Office', '229535', 'printer'], ['Education & Reference', '229548', 'notebooks'], ['Photography & Graphic Design', '229614', 'mirrorless-camera']]],
  ['Sports & Outdoors', 'sports-outdoors', '3375251', 'Exercise & fitness, outdoor recreation, sports equipment and fan shop.', 'tent-green', [['Exercise & Fitness', '3407731', 'dumbbells-purple'], ['Outdoor Recreation', '706814011', 'tent-green'], ['Team Sports', '3394801', 'basketball-orange'], ['Fan Shop', '3386071', 'sport-cap-white'], ['Cycling', '3403201', 'bicycle']]],
  ['Tools & Home Improvement', 'Tools-and-Home-Improvement', '228013', 'Power & hand tools, lighting, hardware, kitchen & bath fixtures and electrical.', 'storage-bins', [['Power & Hand Tools', '328182011', 'storage-bins'], ['Lighting & Ceiling Fans', '495224', 'ceramic-lamp'], ['Kitchen & Bath Fixtures', '3754161', 'steel-pot'], ['Hardware', '511228', 'hangers'], ['Electrical', '495266', 'hdmi-cable']]],
  ['Toys & Games', 'toys', '165793011', 'Building toys, dolls, games & puzzles, learning toys, outdoor play and more.', 'building-bricks', [['Building Toys', '166092011', 'building-bricks'], ['Dolls & Accessories', '166118011', 'doll-pink'], ['Games & Accessories', '166220011', 'board-game'], ['Learning & Education', '166269011', 'crayons'], ['Sports & Outdoor Play', '166420011', 'scooter-blue'], ['Stuffed Animals & Plush Toys', '166461011', 'teddy']]],
  ['Video Games', 'computer-video-games-hardware-accessories', '468642', 'Games, consoles and accessories for PlayStation, Xbox, Nintendo Switch and PC.', 'ps5-console', [['PlayStation 5', '20972781011', 'ps5-console'], ['PlayStation 4', '6427814011', 'controller-black'], ['Xbox Series X & S', '20972814011', 'xbox-console'], ['Xbox One', '6469269011', 'xbox-controller-black'], ['Nintendo Switch 2', '13895900011', 'handheld-console'], ['Nintendo Switch', '16227128011', 'handheld-case-black'], ['PC', '229575', 'keyboard-mouse-bundle'], ['Virtual Reality', '14205185011', 'vr-headset-white'], ['Gaming Accessories', '19201981011', 'gaming-headset'], ['Digital Games', '979455011', 'digital-astro-bot']]],
  ['Books', 'books-used-books-textbooks', '283155', 'Bestsellers, new releases, textbooks and every genre in print.', 'book-lantern-keeper', [['Literature & Fiction', '17', 'book-lantern-keeper'], ['Mystery, Thriller & Suspense', '18', 'book-orchard-house'], ["Children's Books", '4', 'book-watercolor'], ['Cookbooks, Food & Wine', '6', 'book-weeknight-table'], ['Biographies & Memoirs', '2', 'book-national-parks'], ['Textbooks', '465600', 'notebooks']]],
  ['Kindle Books', 'Kindle-eBooks', '154606011', 'Kindle eBooks, Kindle Unlimited, Prime Reading and Kindle Vella.', 'tablet', [['Kindle Unlimited', '9630682011', 'tablet'], ['Prime Reading', '12021009011', 'tablet'], ['Kindle Deals', '11552285011', 'book-orchard-house']]],
  ['CDs & Vinyl', 'music-rock-classical-pop-jazz', '5174', 'CDs, vinyl records and box sets across every genre.', 'vinyl-blue-hour', [['Vinyl', '372373011', 'vinyl-blue-hour'], ['Pop', '37', 'vinyl-blue-hour'], ['Rock', '40', 'vinyl-blue-hour'], ['Soundtracks', '42', 'vinyl-blue-hour']]],
  ['Grocery & Gourmet Food', 'grocery', '16310101', 'Pantry staples, snacks, beverages, breakfast foods and gourmet gifts.', 'coffee', [['Beverages', '16310231', 'coffee'], ['Snacks', '16322721', 'cookies'], ['Pantry Staples', '18787303011', 'pasta'], ['Breakfast Foods', '16310251', 'cereal']]],
  ['Handmade', 'handmade', '11260432011', 'Unique, handcrafted goods from artisans: jewelry, home décor, kitchen and more.', 'mug-set-cream', [['Handmade Jewelry', '11260433011', 'analog-watch'], ['Handmade Home & Kitchen', '11260442011', 'mug-set-cream'], ['Handmade Clothing, Shoes & Accessories', '11260437011', 'tote']]],
  ['Musical Instruments', 'musical-instruments', '11091801', 'Guitars, keyboards, drums, studio recording and DJ equipment.', 'speaker', [['Guitars', '11971241', 'speaker'], ['Keyboards & MIDI', '11970041', 'keyboard-white-compact'], ['Studio Recording Equipment', '11974521', 'gaming-headset']]],
  ['Office Products', 'office-products', '1064954', 'Office supplies, school supplies, office electronics and furniture.', 'gel-pens', [['Office & School Supplies', '1069242', 'gel-pens'], ['Office Electronics', '172574', 'printer'], ['Office Furniture & Lighting', '1069102', 'office-chair-black']]],
  ['Patio, Lawn & Garden', 'lawn-garden', '2972638011', 'Outdoor furniture, gardening, grills, mowers and outdoor décor.', 'planter-stoneware-white', [['Patio Furniture & Accessories', '553760', 'camping-chair-khaki'], ['Gardening & Lawn Care', '3238155011', 'planter-stoneware-white'], ['Grills & Outdoor Cooking', '553788', 'grill-pan-black']]],
]

export const DEPARTMENTS = TREE.map(([label, slug, node, tagline, photo, subs]) => ({
  label, slug, node, tagline, photo,
  path: `/${slug}/b?node=${node}`,
  subs: subs.map(([sub, subNode, subPhoto]) => ({ label: sub, node: subNode, photo: subPhoto, path: `/b?node=${subNode}` })),
}))
export const departmentByNode = node => DEPARTMENTS.find(d => d.node === String(node))
export function subcategoryByNode(node) {
  for (const d of DEPARTMENTS) { const s = d.subs.find(x => x.node === String(node)); if (s) return { dept: d, sub: s } }
  return null
}
export const deptPath = label => DEPARTMENTS.find(d => d.label === label)?.path

// Second header row ("All" plus the persistent text links), as on amazon.com.
export const HEADER_NAV = [
  ["Today's Deals", '/gp/goldbox'],
  ['Prime Video', '/gp/video/storefront'],
  ['Registry', '/registries'],
  ['Customer Service', HELP_PATH],
  ['Gift Cards', GIFT_CARDS_PATH],
  ['Sell', '/b?node=12766669011'],
  ['Best Sellers', '/gp/bestsellers'],
  ['New Releases', '/gp/new-releases'],
  ['Amazon Basics', '/amazonbasics'],
  ['Prime', '/amazonprime'],
  ['Music', '/music/player'],
  ['Books', deptPath('Books')],
  ['Amazon Home', deptPath('Home & Kitchen')],
  ['Groceries', '/fresh'],
  ['Pharmacy', '/pharmacy'],
  ['Fashion', '/amazon-fashion/b?node=7141123011'],
  ['Toys & Games', deptPath('Toys & Games')],
  ['Electronics', deptPath('Electronics')],
  ['Computers', deptPath('Computers')],
  ['Beauty & Personal Care', deptPath('Beauty & Personal Care')],
  ['Home Improvement', deptPath('Tools & Home Improvement')],
  ['Smart Home', deptPath('Smart Home')],
  ['Video Games', VIDEO_GAMES_PATH],
  ['Automotive', deptPath('Automotive')],
  ['Kindle Books', deptPath('Kindle Books')],
  ['Pet Supplies', deptPath('Pet Supplies')],
  ['Health & Household', deptPath('Health & Household')],
  ['Sports & Outdoors', deptPath('Sports & Outdoors')],
  ['Handmade', deptPath('Handmade')],
  ['Coupons', '/coupons'],
  ['Same-Day Delivery', '/same-day-delivery'],
]

export const FOOTER = [
  ['Get to Know Us', [['Careers', '/careers'], ['Amazon Newsletter', '/newsletter'], ['About Amazon', '/about'], ['Accessibility', '/accessibility'], ['Sustainability', '/sustainability'], ['Press Center', '/pr'], ['Investor Relations', '/ir'], ['Amazon Devices', deptPath('Amazon Devices')], ['Amazon Science', '/science']]],
  ['Make Money with Us', [['Sell on Amazon', '/b?node=12766669011'], ['Sell apps on Amazon', '/sell-apps'], ['Supply to Amazon', '/supply'], ['Protect & Build Your Brand', '/brand-registry'], ['Become an Affiliate', '/associates'], ['Become a Delivery Driver', '/delivery-driver'], ['Start a Package Delivery Business', '/dsp'], ['Advertise Your Products', '/advertising'], ['Self-Publish with Us', '/kdp'], ['Become an Amazon Hub Partner', '/hub'], ['See More Ways to Make Money', '/make-money']]],
  ['Amazon Payment Products', [['Amazon Visa', '/amazon-visa'], ['Amazon Store Card', '/amazon-store-card'], ['Amazon Secured Card', '/amazon-secured-card'], ['Amazon Business Card', '/amazon-business-card'], ['Shop with Points', '/shop-with-points'], ['Credit Card Marketplace', '/credit-card-marketplace'], ['Reload Your Balance', '/reload-your-balance'], ['Gift Cards', GIFT_CARDS_PATH], ['Amazon Currency Converter', '/currency-converter']]],
  ['Let Us Help You', [['Your Account', '/gp/css/homepage.html'], ['Your Orders', '/gp/css/order-history'], ['Shipping Rates & Policies', helpNode('468520')], ['Amazon Prime', '/amazonprime'], ['Returns & Replacements', '/gp/css/returns/homepage.html'], ['Manage Your Content and Devices', '/hz/mycd/myx'], ['Recalls and Product Safety Alerts', '/your-product-safety-alerts'], ['Registry & Gift List', '/registries'], ['Help', HELP_PATH]]],
]
export const LEGAL = [['Conditions of Use', helpNode('508088')], ['Privacy Notice', helpNode('468496')], ['Consumer Health Data Privacy Disclosure', helpNode('TnACMrGftqtXpwyOQ0')], ['Your Ads Privacy Choices', '/adprefs']]

// Non-product sections listed on the site directory ("Programs & Features" and friends).
export const PROGRAMS = [
  ["Today's Deals", '/gp/goldbox'], ['Best Sellers', '/gp/bestsellers'], ['New Releases', '/gp/new-releases'], ['Movers & Shakers', '/gp/movers-and-shakers'],
  ['Gift Cards', GIFT_CARDS_PATH], ['Registry & Gift List', '/registries'], ['Amazon Prime', '/amazonprime'], ['Prime Video', '/gp/video/storefront'], ['Amazon Music', '/music/player'],
  ['Amazon Fresh', '/fresh'], ['Amazon Pharmacy', '/pharmacy'], ['Amazon Basics', '/amazonbasics'], ['Coupons', '/coupons'], ['Same-Day Delivery', '/same-day-delivery'],
  ['Amazon Pickup Locations', '/ulp/view'], ['Customer Service', HELP_PATH], ['Your Account', '/gp/css/homepage.html'], ['Your Orders', '/gp/css/order-history'],
]
