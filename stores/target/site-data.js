// Site chrome and navigation captured from https://www.target.com/ on 2026-10-13
// (WebFetch of the homepage, Shop All Categories, Help, Deals, Gift Cards, Video Games and
// Electronics pages). Paths mirror Target's own URL paths; off-site links (corporate.target.com,
// roundel.com, partners.target.com, security.target.com, plus.target.com, bullseyeshop.com)
// become short local information pages. No product inventory lives here.
export const node = (slug, n) => `/c/${slug}/-/${n}`

export const SHOP_ALL_PATH = node('shop-all-categories', 'N-5xsxf')
export const DEALS_PATH = node('top-deals', 'N-4xw74')
export const PICKUP_PATH = node('order-pickup', 'N-ng0a0')
export const GIFT_CARDS_PATH = node('gift-cards', 'N-5xsxu')
export const VIDEO_GAMES_PATH = node('video-games', 'N-5xtg5')
export const CIRCLE_PATH = '/l/target-circle/-/N-pzno9'
export const CIRCLE_360_PATH = '/l/target-circle-360/-/N-2rguk'
export const FIND_STORES_PATH = '/store-locator/find-stores'

export const UTILITY = [
  ['Target Circle™', CIRCLE_PATH],
  ['Target Circle™ Card', '/circlecard'],
  ['Target Circle 360™', CIRCLE_360_PATH],
  ['Registry & Wish List', '/gift-registry'],
  ['Weekly Ad', '/weekly-ad'],
  ['Find Stores', FIND_STORES_PATH],
]

// Main "Categories" menu, in Target's order. `seasonal` entries are one-off promos.
export const MENU = [
  ['Target New Arrivals', node('what-s-new', 'N-o9rnh')],
  ['Halloween', node('halloween', 'N-5xt2o'), 'seasonal'],
  ['Christmas', node('christmas', 'N-5xt30'), 'seasonal'],
  ['Gift Ideas', node('gift-ideas', 'N-96d2i')],
  ['Clothing, Shoes & Accessories', node('clothing-shoes-accessories', 'N-rdihz')],
  ['Home & Decor', node('home', 'N-5xtvd')],
  ['Kitchen & Dining', node('kitchen-dining', 'N-hz89j')],
  ['Patio, Lawn & Garden', node('patio-lawn-garden', 'N-5xtq9')],
  ['Grocery', node('grocery', 'N-5xt1a')],
  ['Household Essentials', node('household-essentials', 'N-5xsz1')],
  ['Baby', node('baby', 'N-5xtly')],
  ['Beauty', node('beauty', 'N-55r1x')],
  ['Target Beauty Studio', node('target-beauty-studio', 'N-0cb2f')],
  ['Personal Care', node('personal-care', 'N-5xtzq')],
  ['Sports & Outdoors', node('sports-outdoors', 'N-5xt85')],
  ['Pets', node('pets', 'N-5xt44')],
  ['Health', node('health', 'N-5xu1n')],
  ['Wellness', node('health-wellbeing', 'N-sw90d')],
  ['School & Office Supplies', node('school-office-supplies', 'N-5xsxr')],
  ['Toys & Games', node('toys-games', 'N-5xtb0')],
  ['Electronics & Tech', node('electronics', 'N-5xtg6')],
  ['Video Games', VIDEO_GAMES_PATH],
  ['Books, Music & Movies', node('movies-music-books', 'N-5xsxe')],
  ['Party Supplies', node('party-supplies', 'N-5xt3c')],
  ['Gift Cards', GIFT_CARDS_PATH],
  ['Shop by Community', node('shop-by-community', 'N-2qkae')],
  ['Target Optical', node('target-optical', 'N-4y8o9')],
  ['Deals', DEALS_PATH],
  ['Clearance', node('clearance', 'N-5q0ga')],
  ['New Arrivals', node('what-s-new', 'N-o9rnh')],
  ['Back to School', node('kids-back-to-school', 'N-5xtyp'), 'seasonal'],
  ['College', node('on-to-college', 'N-5q0g0'), 'seasonal'],
  ['Top Deals', DEALS_PATH],
  ['Target Circle Deals', '/circle/deals'],
  ['Weekly Ad', '/weekly-ad'],
  ['Shop Order Pickup', PICKUP_PATH],
  ['Shop Same Day Delivery', node('same-day-delivery', 'N-bswkz')],
  ['Registry', '/gift-registry'],
  ['RedCard', '/redcard'],
  ['Target Circle', CIRCLE_PATH],
  ['Find Stores', FIND_STORES_PATH],
]
// The menu is split into groups the way Target's drawer separates departments from shortcuts.
export const MENU_GROUPS = [['Shop by category', 0, 27], ['Deals & more', 27, 34], ['Ways to shop', 34, MENU.length]]

export const FOOTER = [
  ['About Us', [
    ['About Target', '/corporate/about'],
    ['Careers', '/corporate/careers'],
    ['News & Blog', '/corporate/news-features'],
    ['Target Brands', '/corporate/target-brands'],
    ['Bullseye Shop', '/bullseye-shop'],
    ['Sustainability & Governance', '/corporate/sustainability-governance'],
    ['Press Center', '/corporate/press'],
    ['Advertise with Us', '/advertise-with-us'],
    ['Investors', '/corporate/investors'],
    ['Affiliates & Partners', '/partners'],
    ['Club Target', node('club-target', 'N-q6m3b')],
    ['Suppliers', '/corporate/suppliers'],
    ['TargetPlus', '/targetplus'],
  ]],
  ['Help', [
    ['Target Help', '/help'],
    ['Returns', '/returns'],
    ['Track Orders', '/orders'],
    ['Recalls', '/help/articles/news-safety/product-recalls'],
    ['Contact Us', '/help/contact-us'],
    ['Feedback', '/feedback'],
    ['Accessibility', '/help/articles/compliances/accessibility'],
    ['Security & Fraud', '/security'],
    ['Team Member Services', node('team-member-services', 'N-4srq9')],
    ['Legal & Privacy', '/guest-privacy/legal-privacy'],
  ]],
  ['Stores', [
    ['Find a Store', FIND_STORES_PATH],
    ['Clinic', node('clinic', 'N-54x94')],
    ['Pharmacy', node('pharmacy-health', 'N-54y52')],
    ['Target Optical', node('optical', 'N-4y8o9')],
    ['More In-Store Services', node('services', 'N-oq1wk')],
  ]],
  ['Services', [
    ['Target Circle™', CIRCLE_PATH],
    ['Target Circle™ Card', '/circlecard'],
    ['Target Circle 360™', CIRCLE_360_PATH],
    ['Target App', node('target-app', 'N-4th2r')],
    ['Registry', '/gift-registry'],
    ['Same Day Delivery', node('same-day-delivery', 'N-bswkz')],
    ['Order Pickup', PICKUP_PATH],
    ['Drive Up', node('drive-up', 'N-9d42z')],
    ['Free 2-Day Shipping', node('free-2-day-shipping', 'N-49cz6')],
    ['Shipping & Delivery', node('shipping-order-services', 'N-551st')],
    ['More Services', node('services', 'N-oq1wk')],
  ]],
]
export const LEGAL = [
  ['Terms', node('terms-conditions', 'N-4sr7l')],
  ['CA Supply Chain', '/help/articles/compliances/ca-transparency-in-supply-chains-act'],
  ['Privacy Policy', node('target-privacy-policy', 'N-4sr7p')],
  ['Your CA Privacy Rights', '/c/your-ca-privacy-rights-/N-m2wjt'],
  ['Your Privacy Choices', '/guest-privacy'],
  ['Interest Based Ads', node('interest-based-advertising-privacy-policy', 'N-ztavm')],
  ['Health Privacy Policy', node('health-policy', 'N-4gc0k')],
]

// "Shop All Categories" (https://www.target.com/c/shop-all-categories/-/N-5xsxf), verbatim.
export const SHOP_ALL = [
  ['Clothing, Shoes & Accessories', [['Women’s', node('women', 'N-5xtd3')], ['Men’s', node('men', 'N-18y1l')], ['Young Adult', node('young-adult', 'N-qh1tf')], ['Kids’', node('kids', 'N-xcoz4')], ['Toddler', node('toddler-clothing-kids', 'N-23cj2')], ['Baby', node('baby-clothing-kids', 'N-564pl')]]],
  ['Home & Patio', [['Home', node('home', 'N-5xtvd')], ['Outdoor Living & Garden', node('patio-garden', 'N-5xtq9')], ['Kitchen & Dining', node('kitchen-dining', 'N-hz89j')], ['Storage & Organization', node('storage-organization-home', 'N-5xto8')], ['Furniture', node('furniture', 'N-5xtnr')], ['Bath', node('bath-home', 'N-5xtvc')]]],
  ['Baby', [['Baby', node('baby', 'N-5xtly')], ['Car Seats', node('car-seats-baby', 'N-5xtlx')], ['Strollers', node('strollers-baby', 'N-5xtk7')], ['Diapering', node('diapering-baby', 'N-5xtlp')], ['Nursery', node('nursery-baby', 'N-54v3g')], ['Gear & Activity', node('gear-activity-baby', 'N-5xtjv')]]],
  ['Electronics', [['Electronics', node('electronics', 'N-5xtg6')], ['Video Games', VIDEO_GAMES_PATH], ['TV & Home Theater', node('tvs-home-theater-electronics', 'N-5xtdw')], ['Cell Phones', node('cell-phones-electronics', 'N-5xte8')], ['Wearable Tech', node('wearable-technology-electronics', 'N-551ss')], ['Computers & Office', node('computers-office-electronics', 'N-5xtfc')], ['Wi-Fi & Networking', node('wi-fi-networking-electronics', 'N-5s7dv')], ['Smart Home', node('smart-home-electronics', 'N-556xa')], ['Tablets & E-readers', node('tablets-e-readers-electronics', 'N-5xtf0')], ['Headphones', node('headphones-electronics', 'N-5xteg')], ['Speakers & Audio Systems', node('speakers-audio-systems-electronics', 'N-5xte2')], ['Cameras & Camcorders', node('cameras-camcorders-electronics', 'N-5xtez')], ['Kids’ Electronics', node('kids-electronics-toys', 'N-5xt9q')], ['Pre-owned & Refurbished Electronics', node('pre-owned-refurbished-electronics', 'N-4rtuu')]]],
  ['School & Office', [['School & Office', node('school-office-supplies', 'N-5xsxr')], ['Desk Organization', node('desk-organization-school-office-supplies', 'N-5xtnz')], ['Ready for School', node('kids-back-to-school', 'N-5xtyp')], ['All College', node('on-to-college', 'N-5q0g0')], ['At-Home Learning', node('at-home-learning', 'N-wiae5')], ['Home Office Solutions', node('home-office-ideas', 'N-4sm54')]]],
  ['Toys', [['Toys', node('toys', 'N-5xtb0')], ['Character Shop', node('character-shop', 'N-5oux8')], ['Stuffed Animals', node('stuffed-animals-plush-toys', 'N-5xtat')], ['Dolls & Dollhouses', node('dolls-toys', 'N-5xt90')], ['Outdoor Toys', node('outdoor-toys', 'N-5xtai')], ['Vehicles & Remote Control', node('vehicles-remote-control-toys', 'N-5xtaz')]]],
  ['Sports, Fitness & Outdoors', [['Sports & Outdoors', node('sports-outdoors', 'N-5xt85')], ['Exercise & Fitness', node('exercise-fitness-sports-outdoors', 'N-5xt7d')], ['Sports Equipment', node('sports-equipment-outdoors', 'N-5xt52')], ['Pools & Accessories', node('swimming-pools-camping-outdoor-recreation-sports-outdoors', 'N-5xt5e')], ['Bikes', node('bikes-sports-outdoors', 'N-5xt83')], ['Camping Gear', node('camping-outdoors-sports', 'N-5xt6e')]]],
  ['Entertainment', [['Movies', node('movies-music-books', 'N-5xsx0')], ['TV Shows', node('tv-shows-movies-music-books', 'N-5xswt')], ['Music', node('music-movies-books', 'N-5xswr')], ['Books', node('books-movies-music', 'N-5xsxd')]]],
  ['Beauty & Personal Care', [['Target Beauty Studio', node('target-beauty-studio', 'N-0cb2f')], ['Beauty', node('beauty', 'N-55r1x')], ['Personal Care', node('personal-care', 'N-5xtzq')], ['Makeup', node('makeup-beauty', 'N-5xu1e')], ['Hair Care', node('hair-care-beauty', 'N-5xu0k')], ['Skincare', node('skin-care-beauty', 'N-5xtzj')]]],
  ['Health', [['Health', node('health', 'N-5xu1n')], ['Vitamins & Supplements', node('vitamins-supplements-health', 'N-5xu07')], ['Medicines & Treatments', node('medicines-treatments-health', 'N-5xu09')], ['Nutrition & Weight Loss', node('nutrition-weight-loss-health', 'N-5xu0d')], ['First Aid', node('first-aid-health', 'N-5xu0c')], ['Home Health Care', node('home-health-care', 'N-5xu0a')]]],
  ['Household Essentials', [['Household Essentials', node('household-essentials', 'N-5xsz1')], ['Laundry Care', node('laundry-care-household-essentials', 'N-5xsyr')], ['Paper Towels', node('paper-towels-household-essentials', 'N-4y1o4')], ['Toilet Paper', node('tissue-toilet-paper-household-essentials', 'N-5xsyk')], ['Cleaning Supplies', node('cleaning-supplies-household-essentials', 'N-5xsyy')]]],
  ['Pets', [['Pets', node('pets', 'N-5xt44')], ['Dog Supplies', node('dog-supplies-pets', 'N-5xt3t')], ['Cat Supplies', node('cat-supplies-pets', 'N-5xt42')], ['Small Animal Supplies', node('small-animal-supplies-pets', 'N-5xt3d')], ['Bird Supplies', node('bird-supplies-pets', 'N-5xt43')], ['Fish Supplies', node('fish-supplies-pets', 'N-5xt3e')]]],
  ['Grocery', [['Grocery', node('grocery', 'N-5xt1a')], ['Produce', node('produce-grocery', 'N-u7fty')], ['Meat & Seafood', node('meat-seafood-grocery', 'N-5xsyh')], ['Dairy', node('dairy-grocery', 'N-5xszm')], ['Frozen Foods', node('frozen-foods-grocery', 'N-5xszd')], ['Snacks', node('snacks-grocery', 'N-5xsy9')]]],
  ['Celebrations & more', [['Gift Ideas', node('gift-ideas', 'N-96d2i')], ['Party Supplies', node('party-supplies', 'N-5xt3c')], ['Halloween', node('halloween', 'N-5xt2o')], ['Christmas', node('christmas', 'N-5xt30')], ['Easter', node('easter', 'N-5xt1n')], ['Mother’s Day', node('gift-ideas-for-mothers', 'N-fh5dt')]]],
  ['Deals & more', [['Deals', DEALS_PATH], ['Clearance', node('clearance', 'N-5q0ga')], ['Gift Cards', GIFT_CARDS_PATH], ['Black Friday', node('target-black-friday', 'N-5q0f2')], ['Cyber Monday', node('cyber-monday', 'N-5q0f1')], ['Circle Week', '/l/target-circle-week/-/N-7196o']]],
  ['Services', [['Furniture Assembly by Handy', node('furniture-assembly-powered-by-handy', 'N-xluim')], ['Target Optical', node('optical', 'N-4y8o9')], ['Easy Install by HelloTech', node('easy-install', 'N-raym1')], ['New Parent Services by Tot Squad', node('new-parent-services-by-tot-squad', 'N-vorfo')]]],
]

// Main non-product sections listed on the site map page.
export const SITE_SECTIONS = [
  ['Target Help', '/help'], ['Weekly Ad', '/weekly-ad'], ['Registry & Wish List', '/gift-registry'],
  ['Find a Store', FIND_STORES_PATH], ['Target Circle™', CIRCLE_PATH], ['Target Circle™ Card', '/circlecard'],
  ['Target Circle 360™', CIRCLE_360_PATH], ['Target Circle Deals', '/circle/deals'], ['Gift card balance', '/guest/gift-card-balance'],
  ['Returns', '/returns'], ['Track Orders', '/orders'], ['Contact Us', '/help/contact-us'], ['Account', '/account'], ['Cart', '/cart'],
]
