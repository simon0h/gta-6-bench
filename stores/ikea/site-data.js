// Site structure captured 2026-10-13 from https://www.ikea.com/us/en/ (header, footer,
// /cat/products-products/, /rooms/, /customer-service/). Paths mirror the real US site.
// This is navigation and editorial structure only; it adds no purchasable inventory.

const tree = `
Winter holiday shop|winter-holidays-wt001
  Holiday decor|winter-decoration-49149
  Christmas lights|winter-lights-49150
  Holiday textiles|winter-textiles-49152
  Holiday tableware|winter-tableware-49153
  Winter plants|winter-pots-plants-49151
  Holiday food|holiday-foods-49227
  Wrapping paper and bags|paper-shop-25227
  Holiday baking tools|winter-cooking-baking-49154
Storage & organization|storage-organization-st001
  Dressers & storage drawers|dressers-storage-drawers-st004
  Shelving furniture|bookcases-shelving-units-st002
  Storage solution systems|storage-solution-systems-46052
  Display & storage cabinets|display-storage-cabinets-st003
  Armoires & wardrobes|armoires-wardrobes-19053
  TV & media furniture|tv-media-furniture-10475
  Living room & entryway tables|sideboards-buffets-sofa-tables-30454
  Rolling utility & storage carts|utility-storage-carts-fu005
  Garage storage solutions|garage-storage-700440
  Outdoor storage: shelves, cabinets & boxes|outdoor-organizing-21958
  Room dividers|room-dividers-46080
  Hallway furniture sets|hallway-furniture-sets-700411
  Filing cabinets|storage-cabinets-10385
  Shoe cabinets|shoe-cabinets-10456
  Kids storage & organization|kids-storage-organization-18706
Sofas & armchairs|sofas-armchairs-700640
  Sofas & sectionals|sofas-sectionals-fu003
  Sleeper sofas & sofa beds|sleeper-sofas-10663
  Armchairs & accent chairs|armchairs-chaises-fu006
  Ottomans, footstools & poufs|ottomans-20926
  Chaise lounges|chaise-lounges-57527
  Sofa & armchair cushions & headrests|sofa-cushions-57536
  Sofa legs|sofa-legs-31785
  Sofa & armchairs covers|sofa-covers-10664
  Modular sofas|sofa-modules-31786
Beds & mattresses|beds-mattresses-bm001
  Beds|beds-bm003
  Mattresses|mattresses-bm002
  Bedding & bedding sets|bedding-tl004
  Nightstands|nightstands-20656
  Underbed storage bags & bins|under-bed-storage-19059
  Bedroom furniture sets|bedroom-furniture-sets-54992
  Mattresses with bed frame included|beds-with-mattresses-included-700513
  Headboards|headboards-19064
  Bed slats|bed-slats-24827
  Mattress foundations & bases|mattress-bases-24825
  Bed frame & headboard covers|bed-headboard-covers-57280
  Bed legs|bed-legs-24822
Lighting|lighting-li001
  Lamps & light fixtures|lamps-light-fixtures-li002
  Decorative lighting|decorative-lighting-14971
  Smart lighting|smart-lighting-36812
  Integrated lighting|integrated-lighting-16280
  LED light bulbs|led-bulbs-20514
  Bathroom lighting|bathroom-lighting-10736
  Outdoor lighting|outdoor-lighting-17897
  Ceiling fans|ceiling-fans-700600
Kitchen, appliances & supplies|kitchen-appliances-ka001
  Kitchen systems|kitchens-ka003
  Kitchen cabinets|kitchen-cabinets-700292
  Kitchen doors & drawer fronts|kitchen-doors-drawer-fronts-700293
  Kitchen appliances|appliances-ka002
  Kitchen countertops|kitchen-countertops-24264
  Kitchen islands & carts|kitchen-islands-carts-10471
  Kitchen cabinet & drawer organization|interior-fittings-24255
  Kitchen organization & wall storage|kitchen-wall-storage-20676
  Pantry shelving|kitchen-pantry-storage-16200
  Kitchen faucets|kitchen-faucets-10482
  Kitchen sinks|kitchen-sinks-24263
  Modular kitchens & kitchenettes|modular-kitchens-22957
  Knobs and handles|cabinet-knobs-handles-pulls-16298
  Kitchen lighting|kitchen-lighting-16282
  SEKTION cabinet shelves & drawers|sektion-cabinet-shelves-and-drawers-49117
Rugs & home textiles|home-textiles-tl001
  Bedding & bedding sets|bedding-tl004
  Decorative pillows & couch cushion covers|decorative-pillows-cushion-covers-10659
  Rugs|rugs-10653
  Table linens|table-linen-20538
  Blankets & throws|blankets-throws-20528
  Bathroom textiles|bathroom-textiles-tl003
  Kitchen linens & textiles|kitchen-textiles-18850
  Textiles for kids|kids-textiles-18730
  Outdoor cushions|outdoor-cushions-17893
  Chair pads & seat cushions|chair-pads-20542
  Clothing & accessories|clothing-accessories-42925
  Baby textiles|baby-textiles-18690
  Fabric & sewing accessories|fabrics-sewing-10655
  Lumbar support pillows|lumbar-support-700528
Tables & chairs|tables-chairs-fu002
  Dining furniture|dining-furniture-700417
  Tables|tables-700675
  Chairs|chairs-700676
  Benches|benches-700319
  Bar furniture|bar-furniture-16244
  Accent tables|accent-tables-10705
  Kids tables|kids-tables-18768
  High chairs|high-chairs-45782
  Stools|stools-22659
  Café furniture|cafe-furniture-19141
  Step stools & step ladders|step-stools-step-ladders-20611
  Vanity chairs|dressing-table-chairs-stools-59250
  Children's seating|childrens-chairs-bc004
Desks & desk chairs|workspace-desks-chairs-fu004
  Desks & computer desks|desks-computer-desks-20649
  Desk chairs|desk-chairs-20652
  Gaming furniture|gaming-furniture-55002
  Conference tables|mittzon-conference-meeting-tables-54173
  Conference table & chair sets|conference-table-chair-sets-700424
  Desk & chair sets|desk-chair-sets-53249
  Conference chairs|conference-chairs-47068
Kitchenware & tableware|cookware-tableware-kt001
  Dinnerware|dinnerware-18860
  Food storage & organizing|food-storage-organizing-15937
  Cookware|cookware-kt003
  Serveware|serveware-16043
  Drinkware|drinkware-18868
  Kitchen & cooking accessories|cooking-baking-utensils-kt002
  Flatware & cutlery|flatware-18865
  Table linens|table-linen-20538
  Bakeware & accessories|bakeware-20636
  Dishwashing accessories|dishwashing-accessories-15938
  Kitchen linens & textiles|kitchen-textiles-18850
  Kids tableware & dinnerware|kids-kitchenware-tableware-18714
  Coffee & tea accessories|coffee-tea-16044
  Knives & cutting boards|knives-chopping-boards-15934
  Napkins & napkin holders|napkins-napkin-holders-20560
  Outdoor & picnic supplies|picnic-outdoor-recreation-42924
  Nursing, feeding & eating|nursing-feeding-eating-31772
Home decor & accessories|home-decor-de001
  Wall décor|wall-decor-10757
  Mirrors|mirrors-20489
  Plants and flowers|plants-flowers-pp003
  Plant pots & stands|flower-pots-stands-pp004
  Home fragrances & scents|home-fragrance-42926
  Candle holders & candles|candle-holders-candles-10760
  Vases & decorating bowls|vases-bowls-10769
  Storage boxes & organization bins|storage-boxes-baskets-10550
  Bulletin boards, peg boards, pin boards & more|noticeboards-10574
  Clocks|clocks-10759
  Holiday decor|winter-decoration-49149
  Wrapping paper and bags|paper-shop-25227
  Table decor & decorative accessories|decorative-accessories-24924
Baby & kids|baby-kids-bc001
  Baby|baby-bc002
  Kids|kids-bc003
Storage containers, organizers & baskets|storage-containers-st007
  Storage boxes & organization bins|storage-boxes-baskets-10550
  Clothes organizers|clothes-organizers-10452
  Desk accessories|desk-accessories-10573
  Food storage & organizing|food-storage-organizing-15937
  Bathroom accessories & organizers|bathroom-accessories-10555
  Paper & media organizers|paper-media-organizers-10551
  Recycling bins|recycling-bins-34470
  Cable management & cord organizers|cable-management-accessories-16195
  Wall shelves & hooks|wall-shelves-hooks-st006
  Bags|bags-16248
  Moving supplies|moving-supplies-46078
Bathroom: furniture, supplies & more|bathroom-ba001
  Bathroom vanities|bathroom-vanities-20719
  Bathroom systems|bathroom-systems-700450
  Bathroom shelving units|bathroom-shelving-units-20804
  Bathroom accessories & organizers|bathroom-accessories-10555
  Bathroom textiles|bathroom-textiles-tl003
  Bathroom wall cabinets|bathroom-wall-cabinets-20808
  Bathroom faucets & sink taps|bathroom-faucets-20724
  Bathroom mirrors|bathroom-mirrors-20490
  Bathroom countertop & drawer organizers|bathroom-boxes-baskets-16233
  Bathroom storage carts|bathroom-carts-20858
  Bathroom stools & benches|bathroom-stools-benches-20859
  Bathroom laundry|bathroom-laundry-ba003
  Bathroom lighting|bathroom-lighting-10736
  Bathroom sinks|bathroom-sinks-20723
  Bathroom shelves|bathroom-shelves-20615
  Bathroom countertops|bathroom-countertops-30565
  Showers|showers-40690
Outdoor|outdoor-od001
  Outdoor patio furniture|outdoor-patio-furniture-od003
  Outdoor storage: shelves, cabinets & boxes|outdoor-organizing-21958
  Outdoor tiles & flooring|outdoor-flooring-21957
  Outdoor kitchen & accessories|outdoor-kitchens-700349
  Outdoor patio accessories|outdoor-accessories-34203
  Outdoor umbrellas, canopies, gazebos & more|umbrellas-gazebos-17887
  Plant accessories|outdoor-pots-plants-31787
  Outdoor lighting|outdoor-lighting-17897
  Outdoor rugs|outdoor-rugs-34204
Window treatments & coverings|window-treatments-tl002
  Curtains & drapes|curtains-10700
  Window blinds and shades|blinds-10701
  Curtain rods, rails & holders|curtain-rods-rails-18891
  Sewing supplies & accessories|sewing-accessories-14350
  Window accessories|window-films-accessories-700628
Plants & planters|plants-planters-pp001
  Plants and flowers|plants-flowers-pp003
  Plant pots & stands|flower-pots-stands-pp004
  Plant stands|plant-stands-movers-20494
  Plant supplies & accessories|plant-supplies-accessories-24887
  Watering cans & plant misters|watering-cans-20493
  Spray bottles & misters|spray-bottles-misters-700778
Laundry & cleaning|laundry-cleaning-lc001
  Waste sorting|bins-bags-16213
  Dishwashing accessories|dishwashing-accessories-15938
  Laundry room cabinets & shelving|laundry-cabinets-shelving-48925
  Laundry baskets, hampers & bags|laundry-baskets-20601
  Laundry accessories|laundry-accessories-55004
  Cleaning tools & essentials|cleaning-accessories-20609
  Clothes drying racks|drying-racks-20602
  Ironing boards & covers|ironing-boards-20608
IKEA Food & Swedish restaurant|ikea-food-restaurant-fb001
  Holiday food|holiday-foods-49227
  Side dishes & sauces|side-dishes-sauces-49147
  Snacks & sweets|snacks-sweets-46192
  Meat|meat-25217
  Fish & seafood|fish-seafood-25214
  Bread & dairy|bread-dairy-25212
  Pastries, desserts & cookies|pastries-desserts-cookies-25215
  Condiments & spreads|condiments-cheese-jams-25216
  Vegetarian & plant based|vegetarian-plant-based-25213
  Beverages|beverages-25211
  Summer food|summer-food-53254
Home electronics|home-electronics-he001
  Wireless & home speakers|speakers-40842
  Cell phone, tablet & laptop accessories|mobile-tablet-accessories-40843
  Charging accessories & power cords|cords-chargers-40845
  Cable management & cord organizers|cable-management-accessories-16195
  Smart lighting|smart-lighting-36812
  Kitchen appliances|appliances-ka002
  Air purifiers & filters|air-quality-products-49081
  Smart switches, plugs & sensors|smart-light-wireless-switch-36814
Home improvement|home-improvement-hi001
  SKYTTA sliding door system|skytta-sliding-door-system-55984
  Knobs and handles|cabinet-knobs-handles-pulls-16298
  Outdoor tiles & flooring|outdoor-flooring-21957
  Tools and accessories|tools-hardware-16292
  Faucets|taps-700718
  Moving supplies|moving-supplies-46078
  Wood treatment oils & furniture paint|oils-stains-product-care-42948
  Sound absorbing acoustic panels|acoustic-panels-46077
  Home safety locks, latches & more|safety-products-sp001
Pet products|pet-accessories-pt001
  Cat furniture & accessories|cats-39569
  Dog beds, toys & bowls|dogs-39570
Smart home|smart-home-hs001
  Smart lighting|smart-lighting-36812
  Smart switches, plugs & sensors|smart-light-wireless-switch-36814
  Smart air purifiers|smart-air-purifiers-56472
`

export const departments = []
for (const line of tree.split('\n').filter(Boolean)) {
  const [title, slug] = line.trim().split('|')
  if (line.startsWith('  ')) departments.at(-1).subs.push({ title, slug })
  else departments.push({ title, slug, subs: [] })
}
// Every category slug, first parent wins for breadcrumbs.
export const categoryIndex = new Map()
for (const d of departments) categoryIndex.set(d.slug, { ...d, parent: null })
for (const d of departments) for (const s of d.subs) if (!categoryIndex.has(s.slug)) categoryIndex.set(s.slug, { ...s, subs: [], parent: d })

// Order of the "Products" menu in the real header (Deals and new arrivals are separate pages).
export const menuDepartments = ['winter-holidays-wt001', 'storage-organization-st001', 'sofas-armchairs-700640', 'beds-mattresses-bm001', 'lighting-li001',
  'kitchen-appliances-ka001', 'home-textiles-tl001', 'tables-chairs-fu002', 'workspace-desks-chairs-fu004', 'cookware-tableware-kt001', 'home-decor-de001',
  'baby-kids-bc001', 'storage-containers-st007', 'bathroom-ba001', 'outdoor-od001', 'window-treatments-tl002', 'plants-planters-pp001', 'laundry-cleaning-lc001',
  'ikea-food-restaurant-fb001', 'home-electronics-he001', 'home-improvement-hi001', 'pet-accessories-pt001', 'smart-home-hs001']
// The real menu labels the holiday shop "Winter holiday shopping".
export const menuLabel = { 'winter-holidays-wt001': 'Winter holiday shopping' }

export const rooms = [
  ['Outdoor', 'outdoor'], ['Kitchen', 'kitchen'], ['Bathroom', 'bathroom'], ['Living room', 'living-room'], ['Bedroom', 'bedroom'], ['Dining room', 'dining'],
  ['Home office', 'home-office'], ["Children's room", 'childrens-room'], ['Gaming room', 'gaming-room'], ['Hallway', 'hallway'], ['Garage', 'garage'], ['Laundry', 'laundry'],
].map(([title, slug]) => ({ title, slug }))

// Departments each room page points to (editorial links only).
export const roomCategories = {
  outdoor: ['outdoor-patio-furniture-od003', 'outdoor-lighting-17897', 'outdoor-rugs-34204', 'outdoor-cushions-17893'],
  kitchen: ['kitchens-ka003', 'appliances-ka002', 'cookware-kt003', 'kitchen-islands-carts-10471'],
  bathroom: ['bathroom-vanities-20719', 'bathroom-textiles-tl003', 'bathroom-mirrors-20490', 'bathroom-accessories-10555'],
  'living-room': ['sofas-sectionals-fu003', 'armchairs-chaises-fu006', 'tv-media-furniture-10475', 'rugs-10653'],
  bedroom: ['beds-bm003', 'mattresses-bm002', 'bedding-tl004', 'nightstands-20656'],
  dining: ['dining-furniture-700417', 'tables-700675', 'chairs-700676', 'dinnerware-18860'],
  'home-office': ['desks-computer-desks-20649', 'desk-chairs-20652', 'desk-accessories-10573', 'lamps-light-fixtures-li002'],
  'childrens-room': ['baby-bc002', 'kids-bc003', 'kids-storage-organization-18706', 'kids-textiles-18730'],
  'gaming-room': ['gaming-furniture-55002', 'desk-chairs-20652', 'smart-lighting-36812', 'cable-management-accessories-16195'],
  hallway: ['shoe-cabinets-10456', 'hallway-furniture-sets-700411', 'mirrors-20489', 'wall-shelves-hooks-st006'],
  garage: ['garage-storage-700440', 'tools-hardware-16292', 'storage-boxes-baskets-10550', 'utility-storage-carts-fu005'],
  laundry: ['laundry-cabinets-shelving-48925', 'laundry-baskets-20601', 'drying-racks-20602', 'ironing-boards-20608'],
}

export const P = '/us/en'
export const footerColumns = [
  { title: 'Help', links: [['Customer service', `${P}/customer-service/`], ['FAQ', `${P}/customer-service/faq/`], ['My orders', `${P}/customer-service/track-manage-order/`],
    ['Contact Us', `${P}/customer-service/support/`], ['Product Recalls', `${P}/customer-service/product-support/recalls/`], ['Return Policy', `${P}/customer-service/returns-claims/`],
    ['Warranties', `${P}/customer-service/returns-claims/guarantee/`], ['Feedback', `${P}/customer-service/feedback/`]] },
  { title: 'Shop & Learn', links: [['Find a Location', `${P}/stores/`], ['IKEA Services', `${P}/customer-service/services/`], ['IKEA Family', `${P}/ikea-family/`],
    ['IKEA for Business', `${P}/ikea-business/`], ['IKEA Planning Tools', `${P}/planners/`], ['IKEA Brochures', `${P}/customer-service/catalogues/`],
    ['Buying guides', `${P}/customer-service/product-support/buying-guides/`], ['Payment options', `${P}/customer-service/payment-options/`],
    ['Gift Cards', `${P}/customer-service/gift-cards-pub3d1efe50/`], ['IKEA Credit Card Management', `${P}/customer-service/services/finance-options/ikea-credit-card-management/`],
    ['IKEA Credit Cards', `${P}/customer-service/services/finance-options/ikea-credit-cards-pub9b4272b0/`],
    ['Cash App Afterpay', `${P}/customer-service/services/finance-options/introducing-afterpay-pub5503e420/`], ['Explore the New IKEA App', `${P}/customer-service/mobile-apps/`]] },
  { title: 'About IKEA', links: [['This is IKEA', `${P}/this-is-ikea/`], ['Careers', `${P}/this-is-ikea/work-with-us/careers/`], ['Newsroom', `${P}/newsroom/`],
    ['Life at Home', `${P}/life-at-home/`], ['IKEA Foundation', `${P}/this-is-ikea/ikea-foundation/`], ['Safety at Home', `${P}/safety-at-home/`]] },
  { title: 'Legal', links: [['Privacy & Security', `${P}/customer-service/privacy-and-security-pub8a9dd8e1/`], ['Privacy policy', `${P}/customer-service/privacy-policy/`],
    ['Terms and conditions', `${P}/customer-service/terms-conditions/`], ["IKEA Children's Product Registration", `${P}/customer-service/product-support/childrens-product-registration/`],
    ['Accessibility', `${P}/customer-service/accessibility/`], ['IKEA SMÅLAND Privacy notice', `${P}/customer-service/privacy-policy/ikea-smaland-privacy-notice-pubf7ed5e70/`]] },
]
export const legalBar = [['Cookie policy', `${P}/customer-service/cookie-policy/`], ['Privacy policy', `${P}/customer-service/privacy-policy/`],
  ['California Notice at Collection', `${P}/customer-service/privacy-policy/#california-notice`]]
