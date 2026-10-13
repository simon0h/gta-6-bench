// Williams Sonoma site structure captured from https://www.williams-sonoma.com/ on 2026-10-13
// (homepage header/footer, department left navs, sale, store directory). Paths mirror the
// real URL paths, mounted under /williams-sonoma. Off-site and sister-brand links become
// local summary pages. See research/parity/williams-sonoma.json for sources and gaps.

const L = (label, path) => [label, path]

export const brandBar = [
  L('Williams Sonoma', '/'),
  L('Williams Sonoma Home', '/pages/williams-sonoma-home/'),
  L('Williams Sonoma Business to Business', '/pages/williams-sonoma/b2b/overview/'),
  L('Pottery Barn', '/pages/our-family-of-brands/pottery-barn/'),
  L('Pottery Barn Kids', '/pages/our-family-of-brands/pottery-barn-kids/'),
  L('Pottery Barn Teen', '/pages/our-family-of-brands/pottery-barn-teen/'),
  L('West Elm', '/pages/our-family-of-brands/west-elm/'),
  L('Rejuvenation', '/pages/our-family-of-brands/rejuvenation/'),
  L('Mark & Graham', '/pages/our-family-of-brands/mark-and-graham/'),
  L('GreenRow', '/pages/our-family-of-brands/greenrow/'),
  L('Dormify', '/pages/our-family-of-brands/dormify/'),
]

export const eventsServices = {
  Events: [
    L('In-Store Events', '/pages/virtual-events-and-in-store-classes/in-store-events/'),
    L('Skills Series', '/pages/virtual-events-and-in-store-classes/skills-series/'),
    L('Book Tours', '/pages/virtual-events-and-in-store-classes/book-tours/'),
    L('Virtual Events', '/pages/virtual-events-and-in-store-classes/virtual-events/'),
    L('Private Events', '/pages/virtual-events-and-in-store-classes/private-events/'),
  ],
  Services: [
    L('Free Kitchen Design Services', '/pages/williams-sonoma/design-services/'),
    L('Free Registry Services', '/appointments/registry-virtual-choice/'),
    L('Free Trade Services', '/pages/williams-sonoma/b2b/overview/'),
    L('Knife Sharpening: In-Store & Online', '/pages/williams-sonoma/cutlery/3-ways-to-sharpen-knives/'),
  ],
}

export const accountMenu = [
  L('Sign In', '/account/login.html'),
  L('Create an Account', '/account/create.html'),
  L('B2B Member Sign-In', '/trade-signin/login.html'),
  L('Track Order', '/customer-service/order-shipment-tracking/'),
  L('View My Rewards', '/account/keyrewards.html'),
  L('Key Rewards', '/pages/the-key-rewards/'),
  L('Williams Sonoma Credit Card', '/ccvalueprop/'),
  L('Registry', '/registry/'),
  L('Favorites', '/favorites/'),
  L('Recipe Box', '/account/recipe-box/'),
  L('Customer Service', '/customer-service/'),
  L('Find A Store', '/stores/'),
]

export const editorialNav = [
  L('Halloween', '/shop/halloween/all-halloween/'),
  L('Thanksgiving', '/shop/thanksgiving/all-thanksgiving/'),
  L('Christmas', '/shop/christmas/christmas-view-all/'),
  L('Recipes & Menus', '/recipe/'),
  L('Entertaining & Design Inspiration', '/pages/williams-sonoma/the-art-of-entertaining/'),
  L('Brands', '/pages/williams-sonoma/brands-a-to-z/'),
  L('Collaborations', '/pages/williams-sonoma/collaborations/'),
  L('Wedding Registry', '/registry/'),
  L('Williams Sonoma Home', '/pages/williams-sonoma-home/'),
]

const sale = (dept, deals) => ({ title: 'Sale & Clearance', links: deals })

// Department menus (left navigation of each /shop/<dept>/ page).
export const departments = [
  { slug: 'new', label: 'New', title: 'New Arrivals', path: '/shop/new/', tone: '#e9e3d8',
    intro: 'The latest arrivals across cookware, electrics, tabletop and food, plus new collaborations and limited-edition collections.',
    groups: [
      { title: 'New Arrivals', links: [L('New Cookware', '/shop/cookware/cookware-new/'), L("New Cooks' Tools", '/shop/cooks-tools/cooks-tools-new/'), L('New Cutlery', '/shop/cutlery/cutlery-new/'), L('New Electrics', '/shop/electrics/electrics-new/'), L('New Bakeware', '/shop/bakeware/bakeware-new/'), L('New Food', '/shop/food/food-new/'), L('New Tabletop & Bar', '/shop/tabletop-glassware-bar/tabletop-bar-new-arrivals/'), L('New Outdoor', '/shop/outdoor/outdoor-new/')] },
      { title: 'Featured', links: [L('No Kid Hungry®', '/shop/new/new-no-kid-hungry/'), L('Collaborations', '/pages/williams-sonoma/collaborations/'), L('Williams Sonoma Home New Arrivals', '/shop/home-new/home-new-furniture/')] },
    ],
    editorial: [['New Kitchen Arrivals', 'Discover the newest cookware, tools, appliances and pantry favorites as soon as they arrive, including exclusive colors and collaborations available only at Williams Sonoma.']] },
  { slug: 'cookware', label: 'Cookware', title: 'Cookware', path: '/shop/cookware/', tone: '#e6ddd3',
    intro: 'Pots, pans and cookware sets from All-Clad, Le Creuset, Staub, Hestan and our own Williams Sonoma collections.',
    groups: [
      { title: 'Cookware Essentials', links: [L('Cookware Sets', '/shop/cookware/cookware-sets/'), L('Fry Pans & Skillets', '/shop/cookware/fry-pans-skillets/'), L('Dutch Ovens & Braisers', '/shop/cookware/dutch-ovens-braisers/'), L('Saucepans & Sauciers', '/shop/cookware/saucepans-sauciers/'), L('Stockpots & Multipots', '/shop/cookware/stock-soup-multi-pots/'), L('Sauté & Essential Pans', '/shop/cookware/saute-pans/'), L('Casseroles & Baking Dishes', '/shop/bakeware/casseroles/'), L('Roasting Pans', '/shop/cookware/roasters/'), L('All Cookware', '/shop/cookware/stovetop-view-all/')] },
      { title: 'Specialty Cookware', links: [L('Grill Pans & Griddles', '/shop/cookware/grills-griddles/'), L('Omelette, Egg & Crêpe Pans', '/shop/cookware/omelette-egg-pans/'), L('Woks', '/shop/cookware/woks/'), L('Tea Kettles', '/shop/electrics/electrics-teakettles/'), L('Fondue Pots', '/shop/cookware/cookware-fondue-shop/'), L('Outdoor Cookware', '/shop/outdoor/outdoor-cookware/'), L('Cookware Accessories', '/shop/cookware/cookware-accessories/'), L('All Specialty Cookware', '/shop/cookware/international-cookware/')] },
      { title: 'Shop by Material', links: [L('Stainless-Steel', '/shop/cookware/stainless-steel-cookware/'), L('Nonstick', '/shop/cookware/nonstick-cookware/'), L('Ceramic Nonstick', '/shop/cookware/cookware-ceramic-nonstick/'), L('Enameled Cast Iron', '/shop/cookware/cookware-enameled-cast-iron/'), L('Seasoned Cast Iron', '/shop/cookware/cookware-seasoned-cast-iron/'), L('Copper', '/shop/cookware/cookware-copper/'), L('Hybrid', '/shop/cookware/hybrid-cookware/'), L('Induction', '/shop/cookware/cookware-induction/'), L('Carbon Steel', '/shop/cookware/cookware-carbon-steel/')] },
      { title: 'Guides', links: [L('Cookware Buying Guide', '/shop/cookware/buying-guide/'), L('Cookware Use & Care Guide', '/pages/williams-sonoma/cookware/cookware-materials/'), L('Guide to Cast Iron', '/shop/cookware/cookware-guide-to-cast-iron/')] },
      { title: 'Brands', links: [L('Williams Sonoma', '/shop/cookware/cookware-williams-sonoma/'), L('All-Clad', '/shop/cookware/cookware-all-clad/'), L('Cuisinart', '/shop/cookware/cookware-cuisinart/'), L('GreenPan™', '/shop/cookware/cookware-greenpan/'), L('Hestan', '/shop/cookware/cookware-hestan/'), L('Le Creuset', '/shop/cookware/cookware-le-creuset/'), L('Mauviel 1830', '/shop/cookware/cookware-mauviel/'), L('Staub', '/shop/cookware/cookware-staub/'), L('All Brands', '/pages/williams-sonoma/brands-a-to-z/')] },
      { title: 'New Arrivals', links: [L('New Arrivals', '/shop/cookware/cookware-new/')] },
      sale('cookware', [L('All Deals', '/shop/sale-special-offer/premier-cookware/'), L('All-Clad - Up To 30% Off', '/shop/sale-special-offer/offers-all-clad-cookware/'), L('Le Creuset - Up To 40% Off', '/shop/sale-special-offer/offers-le-creuset-cookware/'), L('Staub - Up To 45% Off', '/shop/sale-special-offer/offers-staub-cookware/'), L('Clearance', '/shop/sale-special-offer/sale-cookware/')]),
    ],
    editorial: [['Cooking Pans', 'From everyday fry pans to heirloom Dutch ovens, the right pan makes cooking easier and more enjoyable. Our cookware collection brings together professional-grade pieces for every cooktop.'], ['Types of Pots and Pans', 'Fry pans and skillets sear and sauté; saucepans and sauciers simmer sauces and grains; stockpots handle soups and pasta; Dutch ovens and braisers move from stovetop to oven for slow-cooked dishes.'], ['Different Types of Cookware Materials', 'Stainless steel is durable and responsive, nonstick releases delicate foods easily, enameled cast iron retains heat for braising, and copper offers precise temperature control.'], ['How to Clean Cookware', 'Let pans cool before washing, follow the manufacturer’s care guidance, and use non-abrasive tools on nonstick and enameled surfaces to keep cookware performing for years.']] },
  { slug: 'cooks-tools', label: "Cooks' Tools", title: "Cooks' Tools", path: '/shop/cooks-tools/', tone: '#e3e2d6',
    intro: 'Kitchen utensils, prep tools, gadgets and cookbooks for every recipe.',
    groups: [
      { title: 'Cooking Tools', links: [L('Utensil Sets', '/shop/cooks-tools/tool-sets/'), L('Spatulas & Turners', '/shop/cooks-tools/turner-spatulas/'), L('Spoons, Ladles & Whisks', '/shop/cooks-tools/slotted-spoons-sets/'), L('Tongs & Forks', '/shop/cooks-tools/tongs/'), L('Salt & Pepper Mills', '/shop/cooks-tools/salt-pepper-mills/'), L('Splatter Screens', '/shop/cooks-tools/splatter-screens/'), L('Oil Dispensers', '/shop/cooks-tools/oil-dispeners/'), L('All Cooking Tools', '/shop/cooks-tools/utensils-view-all/')] },
      { title: 'Prep Tools', links: [L('Measuring Cups & Spoons', '/shop/cooks-tools/measuring-cups-spoons/'), L('Mixing Bowls', '/shop/cooks-tools/cooks-mixing-bowls/'), L('Cutting Boards', '/shop/cutlery/cutting-boards-storage/'), L('Colanders & Salad Spinners', '/shop/cooks-tools/colanders-food-skimmers/'), L('Peelers & Choppers', '/shop/cooks-tools/peelers/'), L('Graters & Zesters', '/shop/cooks-tools/graters/'), L('Mandolines & Spiralizers', '/shop/cooks-tools/mandolines-slicers/'), L('Mortars & Pestles', '/shop/cooks-tools/mortars-pestles/')] },
      { title: 'Specialty Tools', links: [L('Fruit & Vegetable Tools', '/shop/cooks-tools/tools-produce/'), L('Pizza Tools', '/shop/cooks-tools/pizza-tools/'), L('Pasta Tools', '/shop/cooks-tools/pasta-tools/'), L('Grill Tools', '/shop/outdoor/outdoor-grill-tools-accessories/'), L('Baking & Pastry Tools', '/shop/cooks-tools/baking-pastry-tools/'), L('Meat & Seafood Tools', '/shop/cooks-tools/tools-meat-poultry/'), L('Breakfast & Egg Tools', '/shop/cooks-tools/egg-tools/'), L('Ice Cream Tools', '/shop/cooks-tools/ice-cream-tools-pops/')] },
      { title: 'Kitchen Gadgets', links: [L('Thermometers & Timers', '/shop/cooks-tools/timer-thermometer-scale/'), L('Kitchen Scales', '/shop/cooks-tools/kitchen-scales/'), L('Can Openers', '/shop/cooks-tools/can-openers/'), L('All Kitchen Gadgets', '/shop/cooks-tools/kitchen-gadgets-view-all/')] },
      { title: 'Cookbooks', links: [L('Cookbooks', '/shop/cooks-tools/cookbooks-all/')] },
      { title: 'New Arrivals', links: [L('New Arrivals', '/shop/cooks-tools/cooks-tools-new/')] },
      { title: 'Seasonal Shops', links: [L('No Kid Hungry®', '/shop/new/new-no-kid-hungry/'), L('Thanksgiving', '/shop/thanksgiving/thanksgiving-tools/'), L('Christmas', '/shop/christmas/christmas-tools/')] },
    ],
    editorial: [['Kitchen Tools', 'Well-made tools make every step of cooking easier, from measuring and mixing to flipping, straining and serving.'], ['Kitchen Utensils & Gadgets', 'Spatulas, tongs, whisks and ladles are the everyday workhorses of the kitchen; thermometers, scales and timers bring precision.'], ['Specialty Kitchen Tools', 'Pasta, pizza, baking and produce tools help home cooks take on new techniques with confidence.'], ['Cookbooks', 'Cookbooks from celebrated chefs and our own test kitchen offer recipes and inspiration for every occasion.']] },
  { slug: 'cutlery', label: 'Cutlery', title: 'Cutlery', path: '/shop/cutlery/', tone: '#dfe0dc',
    intro: 'Kitchen knives, knife sets, cutting boards and sharpeners from Shun, WÜSTHOF, Zwilling, Global and Miyabi.',
    groups: [
      { title: 'Knives', links: [L('Knife Sets', '/shop/cutlery/knife-sets/'), L("Chef's Knives", '/shop/cutlery/cutlery-chef-knives/'), L('Steak Knives', '/shop/cutlery/steak-knives/'), L('Santoku & Nakiri Knives', '/shop/cutlery/cutlery-santoku-knives/'), L('Paring Knives', '/shop/cutlery/paring-knives/'), L('Bread Knives', '/shop/cutlery/bread-knives/'), L('Utility Knives', '/shop/cutlery/utility-knives/'), L('Carving Knives & Slicers', '/shop/cutlery/slicing-carving-knives/'), L('Specialty Knives', '/shop/cutlery/specialty-knives/'), L('All Knives', '/shop/cutlery/all-cutlery/')] },
      { title: 'Cutlery Accessories', links: [L('Cutting Boards', '/shop/cutlery/cutting-boards-storage/'), L('Knife Storage', '/shop/cutlery/knives-blocks-storage/'), L('Knife Sharpeners', '/shop/cutlery/knife-sharpeners-honing/'), L('Kitchen Shears', '/shop/cutlery/kitchen-shears/'), L('All Cutlery Accessories', '/shop/cutlery/cutlery-accessories-view-all/')] },
      { title: 'Brands', links: [L('Williams Sonoma', '/shop/cutlery/cutlery-ws-cutting-boards/'), L('Global', '/shop/cutlery/knives-global/'), L('Miyabi', '/shop/cutlery/miyabi-brand/'), L('Shun', '/shop/cutlery/knives-shun/'), L('WÜSTHOF', '/shop/cutlery/knives-wusthof/'), L('Zwilling', '/shop/cutlery/zwilling-henckels-knives/'), L('All Brands', '/pages/williams-sonoma/brands-a-to-z/')] },
      { title: 'New Arrivals', links: [L('New Arrivals', '/shop/cutlery/cutlery-new/')] },
      sale('cutlery', [L('All Deals', '/shop/sale-special-offer/premier-cutlery/'), L('Zwilling - Up to 45% Off', '/shop/sale-special-offer/offers-zwilling-cutlery-promo/'), L('Shun - Up to 30% Off', '/shop/sale-special-offer/offers-shun-promo/'), L('Global - Up to 35% Off', '/shop/sale-special-offer/offers-global-promo/'), L('Clearance', '/shop/sale-special-offer/sale-cutlery/')]),
      { title: 'Guides', links: [L('Cutlery Buying Guide', '/pages/williams-sonoma/cutlery/cutlery-buying-guide/'), L('Knife Skills Guide', '/pages/williams-sonoma/cutlery/knife-skills-guide/'), L('3 Ways to Sharpen Knives', '/pages/williams-sonoma/cutlery/3-ways-to-sharpen-knives/')] },
    ],
    editorial: [['Kitchen Knives', 'A sharp, well-balanced knife is the most important tool in the kitchen. Start with a chef’s knife, paring knife and serrated bread knife, then add specialty blades as your cooking grows.'], ['European Cutlery', 'German and French knives are known for heavier, full-tang blades that handle tough tasks, while Japanese knives are lighter with thinner, harder edges.'], ['Registry Favorites', 'Knife sets and cutting boards are among the most-requested registry gifts.'], ['Monogrammed Cutlery Shop: Get Personalized & Engraved Knife Sets', 'Select knives and blocks can be personalized with a monogram for a gift to treasure.']] },
  { slug: 'electrics', label: 'Electrics', title: 'Kitchen Appliances', path: '/shop/electrics/', tone: '#e2e4e6',
    intro: 'Espresso machines, coffee makers, blenders, mixers, toasters and specialty appliances from Breville, JURA, SMEG, KitchenAid and Vitamix.',
    groups: [
      { title: 'Coffee, Espresso & Tea', links: [L('Espresso Machines', '/shop/electrics/espresso-makers/'), L('Coffee Makers', '/shop/electrics/coffee-makers/'), L('Coffee Grinders', '/shop/electrics/coffee-grinders/'), L('Tea Kettles', '/shop/electrics/electrics-teakettles/'), L('Milk Frothers', '/shop/electrics/coffee-milk-frothers/'), L('Coffee & Tea Accessories', '/shop/cooks-tools/coffee-accessories/'), L('Coffee Beans & Tea', '/shop/food/food-coffee-tea/'), L('All Coffee, Espresso & Tea', '/shop/electrics/coffee-espresso-view-all/')] },
      { title: 'Kitchen Essentials', links: [L('Toasters & Toaster Ovens', '/shop/electrics/toasters-ovens/'), L('Air Fryers', '/shop/electrics/electrics-fryers/'), L('Mixers & Attachments', '/shop/electrics/mixers-attachments/'), L('Blenders', '/shop/electrics/blenders/'), L('Juicers', '/shop/electrics/electrics-juicers/'), L('Food Processors', '/shop/electrics/food-processors/'), L('Slow Cookers & Rice Cookers', '/shop/electrics/pressure-rice-slow-cookers/'), L('Microwaves', '/shop/electrics/electrics-microwaves/'), L('Electric Grills & Skillets', '/shop/electrics/grills-panini-presses/'), L('All Kitchen Essentials', '/shop/electrics/all-small-appliances/')] },
      { title: 'Specialty Appliances', links: [L('Waffle & Bread Makers', '/shop/electrics/waffle-bread-makers/'), L('Ice Makers', '/shop/electrics/electrics-ice-makers/'), L('Ice Cream & Gelato Makers', '/shop/electrics/electrics-ice-cream-makers/'), L('Pasta Machines', '/shop/electrics/electrics-pasta-machines/'), L('Pizza Ovens', '/shop/electrics/pizza-ovens/'), L('Sous Vide', '/shop/electrics/electrics-sous-vide-machines/'), L('Sparkling Water & Soda Makers', '/shop/electrics/sparkling-water-machines/'), L('Popcorn & Treat Makers', '/shop/electrics/popcorn-makers/'), L('Large Appliances', '/shop/electrics/all-large-appliances/'), L('All Specialty Appliances', '/shop/electrics/specialty-view-all/')] },
      { title: 'Brands', links: [L('Breville', '/shop/electrics/electrics-breville/'), L('Cuisinart', '/shop/electrics/electrics-cuisinart/'), L("De'Longhi", '/shop/electrics/electrics-delonghi/'), L('Fellow', '/shop/electrics/electrics-fellow/'), L('JURA', '/shop/electrics/electrics-jura/'), L('KitchenAid®', '/shop/electrics/electrics-kitchenaid/'), L('SMEG', '/shop/electrics/electrics-smeg/'), L('Vitamix', '/shop/electrics/electrics-vitamix/'), L('All Brands', '/pages/williams-sonoma/brands-a-to-z/')] },
      { title: 'New Arrivals', links: [L('New Arrivals', '/shop/electrics/electrics-new/')] },
      sale('electrics', [L('All Deals', '/shop/sale-special-offer/premier-electrics/'), L('The Coffee & Espresso Savings Event - Up to 25% Off', '/shop/sale-special-offer/coffee-espresso-event/'), L('Breville - Up to 25% Off', '/shop/sale-special-offer/breville-promo/'), L('Vitamix - Up to $50 Off', '/shop/sale-special-offer/vitamix-promo/'), L('Clearance', '/shop/sale-special-offer/sale-electrics/')]),
    ],
    editorial: [['Large & Small Kitchen Appliances Your Home Needs', 'From the morning espresso to weeknight dinners, kitchen electrics save time and expand what you can make at home.'], ['Coffee Makers Are A Must', 'Choose a drip coffee maker for brewing by the pot, a fully automatic espresso machine for café drinks at the touch of a button, or a manual machine for full control.'], ['Other Small Kitchen Appliances', 'Blenders, food processors, stand mixers and toaster ovens handle everyday prep, while juicers, ice cream makers and pasta machines open up new projects.'], ['Shopping for Kitchen Gadgets', 'Consider counter space, capacity and the features you will use most when choosing an appliance.']] },
  { slug: 'bakeware', label: 'Bakeware', title: 'Bakeware', path: '/shop/bakeware/', tone: '#ece2d4',
    intro: 'Sheet pans, cake pans, pie dishes, baking tools and bakeware sets, including our Goldtouch® nonstick collection.',
    groups: [
      { title: 'Bakeware Essentials', links: [L('Bakeware Sets', '/shop/bakeware/bakeware-sets/'), L('Sheet Pans & Cookie Sheets', '/shop/bakeware/sheet-pans-cookie-sheets/'), L('Cake & Bundt Pans', '/shop/bakeware/cake-pans/'), L('Casseroles & Baking Dishes', '/shop/bakeware/casseroles/'), L('Bread & Loaf Pans', '/shop/bakeware/bread-pans-loaf-pans/'), L('Cupcake & Muffin Pans', '/shop/bakeware/cupcake-muffin-pans/'), L('Pie Dishes & Tart Pans', '/shop/bakeware/pie-pans-tart-pans/'), L('Ramekins & Mini Cocottes', '/shop/bakeware/ramekin-mini-cocottes/'), L('All Bakeware Essentials', '/shop/bakeware/view-all-bakeware/')] },
      { title: 'Baking Tools', links: [L('Baking & Pastry Tools', '/shop/cooks-tools/baking-pastry-tools/'), L('Measuring Cups & Spoons', '/shop/cooks-tools/measuring-cups-spoons/'), L('Mixing Bowls', '/shop/cooks-tools/cooks-mixing-bowls/'), L('Baking Mats & Boards', '/shop/bakeware/baking-mats-boards/'), L('Rolling Pins', '/shop/bakeware/bakeware-rolling-pins/'), L('Cookie Cutters & Pancake Molds', '/shop/bakeware/cookie-cutters-pancake-molds/'), L('Bread Tools', '/shop/bakeware/bakeware-bread-tools/'), L('Pizza Stones & Tools', '/shop/cooks-tools/pizza-tools/'), L('All Baking Tools', '/shop/bakeware/view-all-baking-tools/')] },
      { title: 'Brands', links: [L('Williams Sonoma', '/shop/bakeware/bakeware-williams-sonoma/'), L('All-Clad', '/shop/bakeware/bakeware-all-clad/'), L('Emile Henry', '/shop/bakeware/bakeware-emile-henry/'), L('Goldtouch®', '/shop/bakeware/bakeware-goldtouch-shop/'), L('Le Creuset', '/shop/bakeware/le-creuset-bakeware/'), L('Nordic Ware', '/shop/bakeware/bakeware-nordic-ware/'), L('All Brands', '/pages/williams-sonoma/brands-a-to-z/')] },
      { title: 'New Arrivals', links: [L('New Arrivals', '/shop/bakeware/bakeware-new/')] },
      { title: 'Seasonal Shops', links: [L('Fall Baking', '/shop/bakeware/bakeware-fall-baking/'), L('Halloween', '/shop/holidays/halloween/'), L('Thanksgiving', '/shop/thanksgiving/thanksgiving-bakeware/'), L('Christmas', '/shop/christmas/christmas-bakeware/'), L('The Bread Shop', '/shop/bakeware/bakeware-bread-shop/')] },
      { title: 'Shop by Material', links: [L('Nonstick', '/shop/bakeware/bakeware-nonstick/'), L('Stainless-Steel & Uncoated', '/shop/bakeware/bakeware-stainless-steel/'), L('Ceramic Nonstick', '/shop/bakeware/bakeware-ceramic-nonstick/'), L('Stoneware', '/shop/bakeware/bakeware-stoneware/'), L('Cast Iron', '/shop/bakeware/bakeware-cast-iron/')] },
      sale('bakeware', [L('All Deals', '/shop/sale-special-offer/premier-bakeware/'), L('Clearance', '/shop/sale-special-offer/sale-bakeware/')]),
    ],
    editorial: [['Bakeware', 'Professional-quality bakeware heats evenly and releases cleanly, so cookies, cakes and breads bake to golden perfection.'], ['Cake Pans', 'Round, square, Bundt and springform pans cover everything from layer cakes to cheesecakes.'], ['Baking & Pastry Tools', 'Rolling pins, pastry blenders, piping sets and bench scrapers help bakers of every level.'], ['Pie Dishes & Tart Pans', 'Ceramic and metal pie dishes and fluted tart pans produce crisp crusts and beautiful presentation.']] },
  { slug: 'food', label: 'Food', title: 'Specialty Food & Gourmet Food Gifts', path: '/shop/food/', tone: '#ebe1cf',
    intro: 'Bakery treats, prepared meals, pantry staples, coffee and food gifts, many made exclusively for Williams Sonoma.',
    groups: [
      { title: 'Bakery, Sweets & Snacks', links: [L('Croissants, Pastries & Scones', '/shop/food/croissants-bread-pastries/'), L('Cakes, Cupcakes & Pies', '/shop/food/food-desserts-baked-goods/'), L('Cookies, Brownies & Bars', '/shop/food/food-cookies-brownies/'), L('Chocolate & Candy', '/shop/food/all-chocolate-candy/'), L('Snacks & Popcorn', '/shop/food/food-snacks-popcorn/'), L('Fruits & Nuts', '/shop/food/fruits-nuts/'), L('All Bakery, Sweets & Snacks', '/shop/food/all-bakery-sweets-snacks/')] },
      { title: 'Beverages', links: [L('Coffee, Tea & Syrups', '/shop/food/food-coffee-tea/'), L('Cocktail Mixes & Garnish', '/shop/food/food-cocktail-mixes/'), L('Hot Chocolate', '/shop/food/food-hot-chocolate/'), L('Wine Shop', '/pages/wine-club/'), L('All Beverages', '/shop/food/food-all-beverages/')] },
      { title: 'Gourmet Prepared Food', links: [L('Appetizers', '/shop/food/appetizers-hors-doeuvres/'), L('Entrées', '/shop/food/food-entrees/'), L('Sides, Soups & Bread', '/shop/food/food-side-dishes/'), L('Desserts', '/shop/food/food-all-desserts/'), L('All Gourmet Prepared Food', '/shop/food/food-all-prepared/')] },
      { title: 'Meat, Seafood & Cheese', links: [L('Beef, Pork & Poultry', '/shop/food/meat/'), L('Seafood', '/shop/food/seafood-food/'), L('Cheese & Charcuterie', '/shop/food/appetizers-cheese/'), L('All Meat, Seafood & Cheese', '/shop/food/all-meat-seafood-cheese/')] },
      { title: 'Pantry & Ingredients', links: [L('Oils & Vinegars', '/shop/food/food-oils-vinegar/'), L('Spices & Seasonings', '/shop/food/food-spices-seasonings/'), L('Cooking Sauces', '/shop/food/pressure-slow-cooking-sauces/'), L('Condiments', '/shop/food/food-condiments/'), L('Pizza & Pasta', '/shop/food/food-pizza-pasta-sauce/'), L('Breakfast & Bread Mixes', '/shop/food/bread-mixes/'), L('Dessert Mixes & Decorating', '/shop/food/dessert-mixes/')] },
      { title: 'Gifts', links: [L('Top Gifts', '/shop/gifts/top-10-food-gifts/'), L('Gift Sets, Crates & Baskets', '/shop/food/food-sets/'), L('Personalized Wine', '/pages/personalized-wine/'), L('Food Subscriptions', '/shop/food/food-subscription/')] },
      { title: 'Seasonal Shops', links: [L('Flavors of Fall', '/shop/food/flavors-of-fall/'), L('Halloween', '/shop/halloween/halloween-food/'), L('Thanksgiving', '/shop/thanksgiving/all-thanksgiving-food/'), L('Christmas', '/shop/christmas/christmas-food/')] },
    ],
    editorial: [['Breakfast', 'Croissants, pastries and pancake mixes make it easy to serve a special breakfast at home.'], ['Cheese and Appetizers', 'Cheese, charcuterie and ready-to-bake hors d’oeuvres set the stage for entertaining.'], ['Entrées and Sides', 'Heat-and-serve entrées and sides take the work out of holiday and weeknight meals.'], ['Desserts', 'Cakes, pies, cookies and confections from celebrated bakeries round out any menu.']] },
  { slug: 'tabletop-glassware-bar', label: 'Tabletop & Bar', title: 'Dinnerware, Barware & Tableware', path: '/shop/tabletop-glassware-bar/', tone: '#e4e7e2',
    intro: 'Dinnerware, serveware, glassware, bar tools, table linens and flatware for every gathering.',
    groups: [
      { title: 'Dinnerware', links: [L('Dinnerware Sets', '/shop/tabletop-glassware-bar/tabletop-place-settings/'), L('Dinner Plates', '/shop/tabletop-glassware-bar/tabletop-plates/'), L('Salad & Appetizer Plates', '/shop/tabletop-glassware-bar/salad-appetizer-plates/'), L('Bowls', '/shop/tabletop-glassware-bar/tabletop-bowls/'), L('All Dinnerware', '/shop/tabletop-glassware-bar/all-dinnerware/')] },
      { title: 'Serveware', links: [L('Serving Trays & Platters', '/shop/tabletop-glassware-bar/serving-trays-platters-baskets/'), L('Salad & Condiment Bowls', '/shop/tabletop-glassware-bar/salad-serving-bowls/'), L('Cheese Boards & Accessories', '/shop/tabletop-glassware-bar/cheese-boards-accessories/'), L('Cake & Tiered Stands', '/shop/tabletop-glassware-bar/dessert-cake-stands/'), L('Drink Dispensers, Pitchers & Buckets', '/shop/tabletop-glassware-bar/drink-dispensers-pitchers/'), L('Buffet Essentials', '/shop/tabletop-glassware-bar/buffet-essentials/')] },
      { title: 'Drinkware', links: [L('Drinking Glasses', '/shop/tabletop-glassware-bar/bar-glassware-casual/'), L('Wine Glasses', '/shop/tabletop-glassware-bar/bar-wine-glasses/'), L('Bar & Cocktail Glasses', '/shop/tabletop-glassware-bar/bar-glasses/'), L('Coffee Mugs & Teacups', '/shop/tabletop-glassware-bar/tabletop-coffee-mugs-teacups/'), L('Water Bottles & Travel Mugs', '/shop/outdoor/outdoor-water-bottles/')] },
      { title: 'Bar & Wine Essentials', links: [L('Bar Tools & Shakers', '/shop/tabletop-glassware-bar/tabletop-bar-tool/'), L('Coasters & Cocktail Napkins', '/shop/tabletop-glassware-bar/entertaining-coasters-trivets/'), L('Wine Tools & Accessories', '/shop/tabletop-glassware-bar/bar-wine-tool/'), L('Wine & Spirit Decanters', '/shop/tabletop-glassware-bar/bar-glassware-decanters/'), L('Wine Racks & Storage', '/shop/tabletop-glassware-bar/beer-wine-storage/')] },
      { title: 'Table Linens & Décor', links: [L('Tablecloths', '/shop/tabletop-glassware-bar/table-linens-tablecloths/'), L('Napkins', '/shop/tabletop-glassware-bar/table-linens-napkins/'), L('Napkin Rings', '/shop/tabletop-glassware-bar/entertaining-napkin-rings/'), L('Placemats & Chargers', '/shop/tabletop-glassware-bar/table-linens-place-mats/'), L('Table Runners', '/shop/tabletop-glassware-bar/table-linens-runners/'), L('Table Décor & Centerpieces', '/shop/tabletop-glassware-bar/entertaining-accessories-decor/')] },
      { title: 'Flatware', links: [L('Flatware Sets', '/shop/tabletop-glassware-bar/tabletop-flatware-place-settings/'), L('Open Stock Flatware', '/shop/tabletop-glassware-bar/open-stock-flatware/'), L('Serving Utensils', '/shop/tabletop-glassware-bar/tabletop-flatware-serving/'), L('All Flatware', '/shop/tabletop-glassware-bar/all-flatware/')] },
      { title: 'New Arrivals', links: [L('New Arrivals', '/shop/tabletop-glassware-bar/tabletop-bar-new-arrivals/')] },
      { title: 'Featured', links: [L('Table Setting Inspiration', '/shop/tabletop-glassware-bar/everyday-table-settings/'), L('Entertaining At Home', '/pages/williams-sonoma/the-art-of-entertaining/')] },
      { title: 'Seasonal Shops', links: [L('Halloween', '/shop/halloween/halloween-tabletop/'), L('Day Of The Dead', '/shop/holidays/day-of-the-dead/'), L('Thanksgiving', '/shop/thanksgiving/thanksgiving-tabletop-new/'), L('Christmas', '/shop/christmas/christmas-entertaining/')] },
    ],
    editorial: [['Dinnerware', 'Mix and match porcelain, stoneware and earthenware place settings to create a table that reflects your style.'], ['Glassware & Barware', 'Wine glasses, cocktail glasses and bar tools for entertaining at home.'], ['Table Linens', 'Tablecloths, runners, placemats and napkins finish the table for every season.']] },
  { slug: 'home-essentials', label: 'Home Essentials', title: 'Home Essentials', path: '/shop/home-essentials/', tone: '#e8e4dc',
    intro: 'Kitchen linens, cleaning, storage and home décor essentials.',
    groups: [
      { title: 'Kitchen Linens', links: [L('Aprons', '/shop/home-essentials/aprons/'), L('Kitchen Towels', '/shop/home-essentials/kitchen-towels/'), L('Pot Holders & Oven Mitts', '/shop/home-essentials/pot-holders-oven-mitts/')] },
      { title: 'Cleaning & Laundry', links: [L('Hand Soap & Dish Soap', '/shop/home-essentials/hand-dish-soap/'), L('Vacuums & Floor Care', '/shop/home-essentials/vacuums/'), L('Irons & Steamers', '/shop/home-essentials/irons-steamers/')] },
      { title: 'Storage & Organization', links: [L('Pantry Storage', '/shop/home-essentials/pantry-storage/'), L('Food Storage Containers', '/shop/home-essentials/food-storage/'), L('Canisters & Jars', '/shop/home-essentials/canisters/')] },
      { title: 'Home Décor', links: [L('Pillows & Throws', '/shop/home-essentials/pillows-throws/'), L('Candles & Home Fragrance', '/shop/home-essentials/candles-home-fragrance/'), L('Games & Leisure', '/shop/home-essentials/games/'), L('Bath', '/shop/home-bath/home-all-bath/')] },
    ],
    editorial: [['Home Essentials', 'Everyday essentials for a well-kept kitchen and home, from aprons and towels to storage and cleaning.']] },
  { slug: 'outdoor', label: 'Outdoor & Garden', title: 'Outdoor & Garden', path: '/shop/outdoor/', tone: '#e1e6dc',
    intro: 'Grills, outdoor cookware, outdoor furniture, garden décor and outdoor dining.',
    groups: [
      { title: 'Outdoor Cooking', links: [L('Grill Tools & Accessories', '/shop/outdoor/outdoor-grill-tools-accessories/'), L('Grill Prep & Marinade Trays', '/shop/outdoor/outdoor-grill-prep-trays/'), L('Outdoor Cookware', '/shop/outdoor/outdoor-cookware/'), L('Outdoor Grills & Griddles', '/shop/outdoor/outdoor-grills-griddles/'), L('Pizza Ovens', '/shop/electrics/pizza-ovens/'), L('Outdoor Kitchens', '/shop/outdoor/built-in-grills/'), L('All Outdoor Cooking', '/shop/outdoor/outdoor-cookware-all/')] },
      { title: 'Outdoor Furniture', links: [L('Outdoor Lounge Furniture', '/shop/home-outdoor/all-outdoor-lounge-furniture/'), L('Outdoor Dining Furniture', '/shop/home-outdoor/all-outdoor-dining/'), L('Outdoor Umbrellas', '/shop/home-outdoor/home-outdoor-umbrellas/'), L('Outdoor Cushions & Covers', '/shop/home-outdoor/all-od-cushions-covers/'), L('Fire Pits & Heaters', '/shop/home-outdoor/fire-pits-and-tables/'), L('Performance Rugs', '/shop/home-rugs/rugs-outdoor/')] },
      { title: 'Garden & Outdoor Décor', links: [L('Wreaths & Garlands', '/shop/outdoor/wreaths-garlands/'), L('Florals & Centerpieces', '/shop/outdoor/fresh-dried-flowers/'), L('Live & Faux Plants', '/shop/outdoor/plants-trees/'), L('Planter Pots', '/shop/outdoor/planter-pots/'), L('Vases & Vessels', '/shop/outdoor/vases-vessels/'), L('Raised Garden Beds', '/shop/outdoor/raised-garden-beds-planters/')] },
      { title: 'Outdoor Dining', links: [L('Outdoor Tabletop', '/shop/outdoor/outdoor-tabletop-all/'), L('Picnic & Camping', '/shop/outdoor/picnic-and-camping/'), L('Coolers', '/shop/outdoor/outdoor-coolers/'), L('Water Bottles & Travel Mugs', '/shop/outdoor/outdoor-water-bottles/')] },
      { title: 'New Arrivals', links: [L('New Arrivals', '/shop/outdoor/outdoor-new/'), L('In Stock & Ready to Ship', '/shop/outdoor/outdoor-in-stock-link/')] },
    ],
    editorial: [['Outdoor Cooking', 'Gas grills, griddles, smokers and pizza ovens bring the kitchen outside, with tools and cookware made for the heat of the grill.'], ['Outdoor Entertaining', 'Melamine dinnerware, acrylic drinkware and coolers make alfresco dining easy.']] },
  { slug: 'home-furniture', label: 'Furniture', title: 'Furniture', path: '/shop/home-furniture/', tone: '#e7e1d8',
    intro: 'Williams Sonoma Home furniture for the living room, dining room, bedroom and home office.',
    groups: [
      { title: 'Living Room Furniture', links: [L('Sofas', '/shop/home-furniture/sofas-loveseats/'), L('Sectionals', '/shop/home-furniture/all-sectionals/'), L('Sleeper Sofas & Settees', '/shop/home-furniture/sleeper-sofas/'), L('Chairs', '/shop/home-furniture/occasional-chairs/'), L('Ottomans & Benches', '/shop/home-furniture/ottomans-bench-stool/'), L('Coffee Tables', '/shop/home-furniture/coffee-tables/'), L('Side & Accent Tables', '/shop/home-furniture/side-accent-tables/')] },
      { title: 'Dining & Kitchen Furniture', links: [L('Dining & Kitchen Tables', '/shop/home-furniture/dining-kitchen-tables/'), L('Dining Chairs', '/shop/home-furniture/dining-chairs-casual/'), L('Dining Benches & Banquettes', '/shop/home-furniture/dining-benches-banquettes/'), L('Bar & Counter Stools', '/shop/home-furniture/dining-bars-counter-stools/'), L('Console Tables, Sideboards & Buffets', '/shop/home-furniture/sideboard-buffet-table/'), L('Bar Carts & Cabinets', '/shop/home-furniture/bar-carts-cabinets/'), L('Kitchen Islands & Carts', '/shop/home-furniture/kitchen-island-cart/')] },
      { title: 'Bedroom Furniture', links: [L('Beds & Headboards', '/shop/home-furniture/beds-headboards/'), L('Nightstands', '/shop/home-furniture/nightstands-dressers/'), L('Dressers', '/shop/home-furniture/dresser/'), L('Benches', '/shop/home-furniture/benches-bedroom/'), L('Mattresses', '/shop/home-furniture/mattresses/')] },
      { title: 'Home Office', links: [L('Desks & Bookcases', '/shop/home-furniture/desks-bookcases-media/'), L('Home Office Chairs', '/shop/home-furniture/home-office-chairs/'), L('Table Lamps', '/shop/home-lighting/table-lamps/'), L('Floor Lamps', '/shop/home-lighting/floor-lamps/'), L('Desk Accessories', '/shop/home-furniture/desk-accessories/')] },
      { title: 'New Arrivals', links: [L('New Arrivals', '/shop/home-new/home-new-furniture/'), L('In Stock & Ready to Ship Furniture', '/shop/home-furniture/home-furniture-quick-ship-2/')] },
      { title: 'Fabric & Swatches', links: [L('Fabric by the Yard', '/shop/home-furniture/furniture-fabric-by-the-yard/'), L('Wood, Woven & Stone Furniture Swatches', '/shop/home-furniture/furniture-wood-swatches/')] },
      { title: 'Design Resources', links: [L('Contract Grade Furniture', '/shop/home-furniture/wsh-contract-grade-furniture/'), L('Free Design Services', '/shop/home-furniture/interior-design-services/'), L('Sofa Buying Guide', '/pages/ws-home/furniture/sofa-buying-guide/'), L('Dining Table Buying Guide', '/pages/ws-home/furniture/choose-a-dining-table/')] },
    ],
    editorial: [['Create an Elegant Home with Luxury Furniture', 'Williams Sonoma Home furniture is crafted from premium materials with timeless silhouettes and made-to-order upholstery options.'], ['A Look at Luxury Furniture', 'Sofas, sectionals, dining tables and bedroom pieces are designed to work together across every room.'], ['Stylish Lighting Options', 'Table and floor lamps add warmth and finish a room.']] },
  { slug: 'holidays', label: 'Holidays', title: 'Holidays', path: '/shop/holidays/', tone: '#ece0d6',
    intro: 'Seasonal cookware, décor, tabletop and food for every celebration of the year.',
    groups: [
      { title: 'Seasonal Shops', links: [L('Halloween', '/shop/halloween/all-halloween/'), L('Day of the Dead', '/shop/holidays/day-of-the-dead/'), L('Thanksgiving', '/shop/thanksgiving/all-thanksgiving/'), L('Hanukkah', '/shop/holidays/hanukkah/'), L('Christmas', '/shop/christmas/christmas-view-all/'), L('NFL Shop', '/shop/holidays/nfl-shop/')] },
    ],
    editorial: [['Celebrate the Season', 'Find everything you need to cook, bake, decorate and entertain for the holidays.']] },
  { slug: 'gifts', label: 'Gifts', title: 'Gifts', path: '/shop/gifts/', tone: '#efe4dc',
    intro: 'Gift ideas for cooks, bakers, hosts and coffee lovers, plus gift cards and corporate gifting.',
    groups: [
      { title: 'Shop Gifts', links: [L('Top Gifts', '/shop/gifts/top-10-food-gifts/'), L('Gift Sets, Crates & Baskets', '/shop/food/food-sets/'), L('Birthday', '/shop/gifts/gifts-birthday/'), L('Congratulations', '/shop/gifts/gifts-congratulations/'), L('Sympathy', '/shop/gifts/gifts-sympathy/'), L('Get Well', '/shop/gifts/gifts-get-well/')] },
      { title: 'Gift Services', links: [L('Gift Cards', '/customer-service/gift-services/gift-card-landing.html'), L('Corporate Gifting', '/pages/williams-sonoma/b2b/corporate-gifting/'), L('Wedding & Gift Registry', '/registry/')] },
    ],
    editorial: [['Gifts for Everyone', 'Thoughtful gifts for every occasion, from food gifts and subscriptions to cookware and cutlery.']] },
  { slug: 'sale-special-offer', label: 'Sale', title: 'Sale and Special Offers', path: '/shop/sale-special-offer/', tone: '#f1e3e1',
    intro: 'Limited-time deals, clearance, free shipping offers and open-box outlet savings.',
    groups: [
      { title: 'Limited Time Deals', links: [L('All Deals', '/shop/sale-special-offer/premier-view-all/'), L('The Coffee & Espresso Savings Event - Up to 25% Off', '/shop/sale-special-offer/coffee-espresso-event/'), L('Breville - Up to 25% Off', '/shop/sale-special-offer/breville-promo/'), L('Le Creuset - Up To 40% Off', '/shop/sale-special-offer/offers-le-creuset-cookware/'), L('All-Clad - Up To 30% Off', '/shop/sale-special-offer/offers-all-clad-cookware/'), L('Vitamix - Up to $50 Off', '/shop/sale-special-offer/vitamix-promo/')] },
      { title: 'Clearance', links: [L('All Clearance', '/shop/sale-special-offer/view-all-sale/'), L('Cookware', '/shop/sale-special-offer/sale-cookware/'), L("Cooks' Tools", '/shop/sale-special-offer/sale-cooks-tools/'), L('Cutlery', '/shop/sale-special-offer/sale-cutlery/'), L('Electrics', '/shop/sale-special-offer/sale-electrics/'), L('Bakeware', '/shop/sale-special-offer/sale-bakeware/'), L('Food', '/shop/sale-special-offer/sale-food/'), L('Tabletop & Bar', '/shop/sale-special-offer/sale-tabletop-bar/')] },
      { title: 'Free Shipping', links: [L('All Free Shipping', '/shop/sale-special-offer/free-shipping/')] },
      { title: 'Outlet', links: [L('Open Box Outlet Deals', '/shop/sale-special-offer/open-box-deals/')] },
    ],
    editorial: [['Limited Time Offers', 'Savings on top brands for a limited time. Offers and exclusions are described in our Promotional Fine Print.']] },
  // Seasonal shops linked from the editorial menu.
  { slug: 'halloween', label: 'Halloween', title: 'Halloween', path: '/shop/halloween/', hidden: true, tone: '#efe0cf',
    intro: 'Halloween baking, tabletop, décor and treats.',
    groups: [{ title: 'Halloween', links: [L('All Halloween', '/shop/halloween/all-halloween/'), L('Halloween Food', '/shop/halloween/halloween-food/'), L('Halloween Tabletop', '/shop/halloween/halloween-tabletop/'), L('Nightmare Before Christmas', '/shop/halloween/nightmare-before-christmas/'), L('Peanuts', '/shop/halloween/peanuts/'), L('Halloween Clearance', '/shop/halloween/halloween-clearance/')] }],
    editorial: [['Halloween', 'Spooky-season bakeware, serveware and treats for parties and trick-or-treat nights.']] },
  { slug: 'thanksgiving', label: 'Thanksgiving', title: 'Thanksgiving', path: '/shop/thanksgiving/', hidden: true, tone: '#ebdcc9',
    intro: 'Everything for the Thanksgiving feast, from roasters and carving sets to the table.',
    groups: [{ title: 'Thanksgiving', links: [L('All Thanksgiving', '/shop/thanksgiving/all-thanksgiving/'), L('Thanksgiving Food', '/shop/thanksgiving/all-thanksgiving-food/'), L('Thanksgiving Tabletop', '/shop/thanksgiving/thanksgiving-tabletop-new/'), L('Thanksgiving Cutlery', '/shop/thanksgiving/thanksgiving-cutlery/'), L('Thanksgiving Bakeware', '/shop/thanksgiving/thanksgiving-bakeware/'), L('Thanksgiving Tools', '/shop/thanksgiving/thanksgiving-tools/')] }],
    editorial: [['Thanksgiving', 'Plan the menu, set the table and roast the turkey with our Thanksgiving essentials.']] },
  { slug: 'christmas', label: 'Christmas', title: 'Christmas', path: '/shop/christmas/', hidden: true, tone: '#e5e1d6',
    intro: 'Christmas baking, entertaining, décor and gifts.',
    groups: [{ title: 'Christmas', links: [L('All Christmas', '/shop/christmas/christmas-view-all/'), L('Christmas Food', '/shop/christmas/christmas-food/'), L('Christmas Entertaining', '/shop/christmas/christmas-entertaining/'), L('Christmas Bakeware', '/shop/christmas/christmas-bakeware/'), L('Christmas Tools', '/shop/christmas/christmas-tools/')] }],
    editorial: [['Christmas', 'Festive cookware, bakeware, tabletop and food gifts for the holiday season.']] },
]

export const mainDepartments = departments.filter(d => !d.hidden)

// Every subcategory link, keyed by path. The first department that lists a path owns it.
export const subcategories = new Map()
for (const dept of departments) for (const group of dept.groups) for (const [label, path] of group.links) {
  if (!path.startsWith('/shop/') || departments.some(d => d.path === path) || subcategories.has(path)) continue
  subcategories.set(path, { label, path, dept, group: group.title })
}

// Read-only captured observations that belong in a subcategory (matched on captured titles).
export const subcategoryMatchers = {
  '/shop/electrics/espresso-makers/': /espresso machine/i,
  '/shop/electrics/coffee-makers/': /coffee (maker|brewer)|cup-one/i,
  '/shop/electrics/coffee-grinders/': /grinder/i,
  '/shop/electrics/coffee-espresso-view-all/': /espresso|coffee|grinder|milk (cooler|container)|matcha/i,
  '/shop/electrics/blenders/': /blender/i,
  '/shop/electrics/electrics-juicers/': /juic/i,
  '/shop/electrics/food-processors/': /food processor/i,
  '/shop/electrics/toasters-ovens/': /toaster/i,
  '/shop/electrics/pressure-rice-slow-cookers/': /slow cooker|rice cooker/i,
  '/shop/electrics/grills-panini-presses/': /griddler|multi grill|sear & press|gourmet grill|crepe maker/i,
  '/shop/electrics/electrics-ice-makers/': /ice maker/i,
  '/shop/electrics/electrics-ice-cream-makers/': /ice cream/i,
  '/shop/electrics/sparkling-water-machines/': /sparkling water|carbonator/i,
  '/shop/electrics/all-large-appliances/': /range\b|refrigerator|range hood/i,
  '/shop/electrics/electrics-breville/': /^breville/i,
  '/shop/electrics/electrics-cuisinart/': /^cuisinart/i,
  "/shop/electrics/electrics-delonghi/": /^de'longhi/i,
  '/shop/electrics/electrics-fellow/': /^fellow/i,
  '/shop/electrics/electrics-jura/': /^jura/i,
  '/shop/electrics/electrics-smeg/': /smeg/i,
  '/shop/electrics/electrics-vitamix/': /^vitamix/i,
  '/shop/sale-special-offer/coffee-espresso-event/': /espresso|coffee/i,
  '/shop/sale-special-offer/breville-promo/': /^breville/i,
  '/shop/sale-special-offer/vitamix-promo/': /^vitamix/i,
  '/shop/cookware/cookware-sets/': /cookware set/i,
  '/shop/cookware/fry-pans-skillets/': /fry pan|fry, set/i,
  '/shop/cookware/dutch-ovens-braisers/': /dutch oven|rondeau/i,
  '/shop/cookware/saucepans-sauciers/': /saucepan/i,
  '/shop/cookware/stock-soup-multi-pots/': /stockpot/i,
  '/shop/cookware/stainless-steel-cookware/': /stainless-steel/i,
  '/shop/cookware/stovetop-view-all/': /all-clad|mauviel/i,
  '/shop/cookware/cookware-all-clad/': /^all-clad (g5|collective)/i,
  '/shop/cookware/cookware-mauviel/': /^mauviel/i,
  '/shop/cookware/cookware-induction/': /induction (disk|cooker)/i,
  '/shop/cookware/cookware-accessories/': /induction disk/i,
  '/shop/cutlery/knife-sets/': /^global .*(set of|block knives|collection)/i,
  "/shop/cutlery/cutlery-chef-knives/": /chef's knife/i,
  '/shop/cutlery/bread-knives/': /bread knife/i,
  '/shop/cutlery/utility-knives/': /utility knife/i,
  '/shop/cutlery/specialty-knives/': /cleaver|vegetable knife|bbq knife/i,
  '/shop/cutlery/all-cutlery/': /^global/i,
  '/shop/cutlery/knives-global/': /^global/i,
  '/shop/sale-special-offer/offers-global-promo/': /^global/i,
  '/shop/cooks-tools/cookbooks-all/': /:|organized living/i,
  '/shop/food/croissants-bread-pastries/': /croissant|pain au chocolat/i,
  '/shop/food/food-coffee-tea/': /coffee beans|coffee subscription/i,
  '/shop/food/food-subscription/': /subscription/i,
  '/shop/food/appetizers-hors-doeuvres/': /arancini/i,
  '/shop/food/meat/': /porchetta/i,
  '/shop/food/appetizers-cheese/': /cheese/i,
  '/shop/tabletop-glassware-bar/bar-wine-glasses/': /wine glasses/i,
  '/shop/tabletop-glassware-bar/bar-glasses/': /martini|cocktail|coupe|flute|beer glasses/i,
  '/shop/tabletop-glassware-bar/bar-glassware-casual/': /goblets|glassware collection/i,
  '/shop/tabletop-glassware-bar/bar-wine-tool/': /coravin/i,
  '/shop/tabletop-glassware-bar/tabletop-coffee-mugs-teacups/': /mug/i,
  '/shop/tabletop-glassware-bar/tabletop-bar-tool/': /bartesian|flavour blaster/i,
  '/shop/outdoor/outdoor-grills-griddles/': /grill(?! cover)|griddle|smoker/i,
  '/shop/outdoor/outdoor-grill-tools-accessories/': /grill cover/i,
  '/shop/home-furniture/sofas-loveseats/': /sofa/i,
  '/shop/home-furniture/all-sectionals/': /sectional/i,
  '/shop/home-furniture/side-accent-tables/': /accent table/i,
  '/shop/home-essentials/vacuums/': /vacuum|wet cleaner/i,
  '/shop/home-essentials/irons-steamers/': /steam/i,
  '/shop/home-essentials/games/': /chess|dominoes|backgammon/i,
  '/shop/holidays/nfl-shop/': /^nfl/i,
}

export const footerColumns = [
  { title: 'Customer Service', links: [L('Contact Us', '/customer-service/email-us/'), L('Track Your Order', '/customer-service/order-shipment-tracking/'), L('Returns & Exchanges', '/customer-service/return/'), L('Shipping Information', '/customer-service/shipping-info.html'), L('Email Preferences', '/customer-service/manage-email-settings/'), L('Promotional Fine Print', '/customer-service/fine-print.html'), L('Site Feedback', '/customer-service/site-feedback/')] },
  { title: 'Our Company', links: [L('Our Story', '/customer-service/about-us.html'), L('Williams-Sonoma Inc.', '/corporate-information/'), L('Careers', '/customer-service/careers.html'), L('Store Locator', '/stores/')] },
  { title: 'Events & Services', links: [L('Wedding & Gift Registry', '/registry/'), L('Free Design Services', '/pages/ws-home/design-services/'), L('Events', '/pages/virtual-events-and-in-store-classes/in-store-events/'), L('Knife Sharpening', '/pages/williams-sonoma/cutlery/3-ways-to-sharpen-knives/'), L('Gift Cards', '/customer-service/gift-services/gift-card-landing.html')] },
  { title: 'B2B Programs', links: [L('B2B Overview', '/pages/williams-sonoma/b2b/overview/'), L('Contract', '/pages/williams-sonoma/b2b/contract/'), L('Trade', '/pages/williams-sonoma/b2b/trade/'), L('Professional Chefs', '/trade-programs/chefs/landing.html'), L('Corporate Gifting', '/pages/williams-sonoma/b2b/corporate-gifting/')] },
  { title: 'Loyalty Programs', links: [L('Williams Sonoma Credit Card', '/ccvalueprop/'), L('Key Rewards', '/pages/the-key-rewards/')] },
  { title: 'More Williams Sonoma', links: [L('Request a Catalog', '/customer-service/catalog-request/'), L('Williams Sonoma Wine Shop', '/pages/wine-club/'), L('Personalized Wine', '/pages/personalized-wine/')] },
]

export const legalLinks = [
  L('Terms & Conditions', '/customer-service/legal-statement.html#terms'),
  L('Accessibility', '/customer-service/legal-statement.html#access'),
  L('Privacy Policy', '/customer-service/legal-statement.html#privacy'),
  L('Do Not Sell or Share My Personal Information', '/customer-service/legal-statement.html#do-not-sell'),
  L('Safety Recalls', '/customer-service/safety-recalls'),
  L('State Disclosures', '/customer-service/state-disclosures'),
  L('Site Map', '/sitemap.html'),
]

export const customerServiceNav = [
  L('My Account', '/account/'), L('Track Your Order', '/customer-service/order-shipment-tracking/'), L('Returns & Exchanges', '/customer-service/return/'),
  L('Shipping Information', '/customer-service/shipping-info.html'), L('Price Match Policy', '/customer-service/price-matching-policy.html'),
  L('Buy Online Pick Up In Store', '/customer-service/buy-online-pick-up-in-store/'), L('Gift Cards', '/customer-service/gift-services/gift-card-landing.html'),
  L('Email Preferences', '/customer-service/manage-email-settings/'), L('Promotional Fine Print', '/customer-service/fine-print.html'),
  L('Contact Us', '/customer-service/email-us/'), L('Store Locator', '/stores/'),
]

export const recipeCourses = [
  L('Appetizers', '/recipe/appetizers/'), L('Soups', '/recipe/soups/'), L('Salads', '/recipe/salads/'),
  L('Pasta, Rice & Grains', '/recipe/main-courses/pasta-rice-and-grains/'), L('Vegetables', '/recipe/main-courses/vegetables/'),
  L('Seafood', '/recipe/main-courses/seafood/'), L('Chicken & Poultry', '/recipe/main-courses/poultry-and-game/'),
  L('Pork', '/recipe/main-courses/pork/'), L('Beef', '/recipe/main-courses/beef-and-veal/'), L('Desserts', '/recipe/desserts/'),
]

// Store directory captured from https://www.williams-sonoma.com/stores/ (city – center name).
export const storeDirectory = `Alabama: Birmingham – Summit; Mobile – Legacy Village
Arizona: Chandler – Casa Paloma; Phoenix – Biltmore Plaza; Scottsdale – Scottsdale Qtr; Tucson – La Encantada
Arkansas: Rogers – Pinnacle Hills
California: Brea – Brea Mall; Corte Madera – Vllg Corte Madera; Costa Mesa – South Coast Plaza; Fresno – Fig Garden Village; Los Angeles – Farmer's Market; Manhattan Beach – Manhattan Village; Mission Viejo – Mission Viejo; Monterey – Del Monte Center; Newport Coast – Crystal Cove; Palm Desert – Gardens At El Paseo; Palo Alto – Stanford Shopping Center; Pasadena – Pasadena At The Commons; Rancho Cucamonga – Victoria Gardens; Roseville – Galleria At Roseville; Sacramento – Pavilions; San Diego – Fashion Valley; San Diego – University Town Center; San Luis Obispo – Monterey Street; San Mateo – Hillsdale Mall; San Ramon – CC Bishop Ranch; Santa Barbara – La Cumbre Plaza; Santa Clara – Valley Fair Mall; Santa Monica – Santa Monica; Sonoma – Sonoma; Walnut Creek – Walnut Creek; Westlake Village – Westlake
Colorado: Broomfield – Flatiron Crossing; Colorado Springs – Briargate Lifestyle Cntr; Denver – Cherry Creek; Littleton – Aspen Grove; Littleton – Park Meadows
Connecticut: Danbury – Danbury Fair Mall; South Windsor – Promenade At Evergreen Walk; Westport – Bedford Square
Florida: Boca Raton – Town Center; Coral Gables – Merrick Park; Hallandale Beach – Village Gulfstream Park; Miami – The Lincoln; Miramar Beach – Grand Boulevard; Naples – Waterside Shops; Palm Beach Gardens – The Gardens; Sarasota – University Town Center; Tampa – International Plaza; Winter Park – Park Avenue
Georgia: Alpharetta – Avalon; Atlanta – Ponce City Market; Dawsonville – North Georgia Premium Outlets; Marietta – The Avenue At East Cobb
Idaho: Boise – Boise Towne Square
Illinois: Chicago – Lincoln Park; Deer Park – Deer Park Town Center; Geneva – Geneva Commons; Lake Forest – Lake Forest; Oak Brook – Oakbrook Center
Indiana: Indianapolis – Nora Plaza
Iowa: West Des Moines – Jordan Creek Town Center
Kansas: Leawood – Leawood Town Center Plaza
Kentucky: Lexington – Summit Fritz Farm; Louisville – Paddock Shops
Maryland: Annapolis – Annapolis Town Center; Baltimore – Village Square; Bethesda – Bethesda Row
Massachusetts: Dedham – Legacy Place; Hingham – Derby Street Shoppes; Lynnfield – Marketstreet Lynnfield; Mashpee – Mashpee Commons
Michigan: Grand Rapids – Woodland Mall; Lansing – Eastwood Towne Centre; Novi – Twelve Oaks Mall; Rochester Hills – Village Of Rochester Hills; Troy – Somerset Collection
Minnesota: Edina – Edina Galleria; Minnetonka – Ridgedale Center; Roseville – Rosedale Shopping Center
Missouri: St. Louis – Plaza Frontenac
Nebraska: Omaha – Regency Court
Nevada: Henderson – Shops At Green Valley Ranch; Las Vegas – Rampart Commons; Reno – The Summit Reno
New Hampshire: Salem – Tuscan Village
New Jersey: Bridgewater – Bridgewater Commons; Hackensack – Riverside Square; Montclair – Upper Montclair; Montvale – North Market; Princeton – Princeton Market Fair; Short Hills – Mall At Short Hills; Shrewsbury – Grove At Shrewsbury
New Mexico: Albuquerque – Albuquerque Uptown
New York: Bridgehampton – Bridgehampton Commons; Garden City – Roosevelt Field; Huntington Station – Huntington; New York – Chelsea; New York – Shops At Columbus Circle; Riverhead – Tanger Outlets Riverhead; Victor – Eastview Mall; White Plains – The Westchester
North Carolina: Asheville – Asheville; Cary – Fenton; Charlotte – Specialty Shops In The Park; Durham – Southpoint; Greensboro – Friendly Center; Huntersville – Birkdale Village; Wilmington – Mayfaire Town Center
Ohio: Beachwood – Pinecrest; Cincinnati – Kenwood Towne Center
Oklahoma: Oklahoma City – Classen Curve; Tulsa – Utica Square
Oregon: Portland – Brewery Blocks; Tigard – Washington Square
Pennsylvania: Glen Mills – Shoppes At Brinton Lake; Harrisburg – Shops At Susquehanna Marketplace; King of Prussia – King of Prussia; Pittsburgh – Mt Lebanon; Pittsburgh – Ross Park
Puerto Rico: San Juan – Mall of San Juan
Rhode Island: Cranston – Garden City Center
South Carolina: Charleston – King Street
Tennessee: Franklin – Coolsprings Galleria; Knoxville – West Town Mall; Nashville – Hill Center
Texas: Austin – Central Park; Dallas – NorthPark Center; Fort Worth – University Park Village; Houston – Highland Village; Houston – Town And Country Village; Plano – Preston Park; San Antonio – Alamo Quarry; Southlake – Southlake Town Square; The Woodlands – Hughes Landing
Utah: Salt Lake City – Trolley Square
Virginia: Arlington – Market Common At Clarendon; Fairfax – Fair Oaks Mall; Fairfax – Mosaic; Leesburg – Leesburg Premium Outlets; Richmond – Short Pump Town Center; Virginia Beach – Town Center
Washington: Bellevue – Bellevue Square; Seattle – University Village; Spokane – River Park Square
Wisconsin: Wauwatosa – Mayfair Mall`.split('\n').map(line => {
  const [state, rest] = line.split(': ')
  return { state, stores: rest.split('; ').map(s => { const [city, name] = s.split(' – '); return { city, name } }) }
})
