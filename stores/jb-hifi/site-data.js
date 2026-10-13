// Site chrome and information architecture for the JB Hi-Fi clone: the header, the footer,
// the Products department tree and the help / service / policy pages. Paths mirror
// jbhifi.com.au (Shopify: /collections/<handle>, /pages/<handle>, /blogs/<handle>).
// Sources and gaps: research/parity/jb-hifi.json. Off-site JB properties (careers, investors,
// JB Hi-Fi Business, Education) are local summary pages so agents never leave the sandbox.

// Products mega-menu: departments and their main sub-categories. `match` picks products from the
// store's own catalogue (crumbs, type, title); no products are added for any category.
const D = (slug, title, blurb, subs, extra = {}) => ({ slug, title, blurb, subs: subs.map(([s, t, match]) => ({ slug: s, title: t, match })), ...extra })
export const DEPARTMENTS = [
  D('computers-tablets', 'Computers & Tablets', 'Laptops, tablets, desktops, monitors and everything to keep you working, studying and creating.', [
    ['laptops', 'Laptops', /laptop/i], ['tablets', 'Tablets', /tablet/i], ['desktop-computers', 'Desktop Computers', /desktop/i],
    ['monitors', 'Monitors', /monitor/i], ['printers-ink', 'Printers & Ink', /printer/i], ['networking', 'Networking', /network|router/i],
    ['computer-accessories', 'Computer Accessories', /keyboard|mice|mouse|webcam|usb hub|storage/i]]),
  D('mobile-phones', 'Mobile Phones', 'The latest iPhone and Android phones, prepaid handsets, plans and accessories.', [
    ['iphone', 'iPhone', /iphone/i], ['android-phones', 'Android Phones', /unlocked|android|galaxy|pixel/i], ['prepaid-phones', 'Prepaid Phones', /prepaid/i],
    ['phone-cases', 'Phone Cases', /phone case/i], ['phone-chargers', 'Phone Chargers', /charger/i], ['power-banks', 'Power Banks', /power bank/i]]),
  D('wearables', 'Wearables', 'Smart watches, fitness trackers and the bands to go with them.', [
    ['smart-watches', 'Smart Watches', /smartwatch|smart watch/i], ['fitness-trackers', 'Fitness Trackers', /fitness|tracker/i], ['watch-straps', 'Watch Straps', /strap/i]]),
  D('tvs-home-theatre', 'TVs & Home Theatre', 'Big screens and big sound: TVs, soundbars, projectors and streaming players.', [
    ['tvs', 'TVs', /television|\btv\b/i], ['soundbars', 'Soundbars', /soundbar/i], ['projectors', 'Projectors', /projector/i],
    ['streaming-players', 'Streaming Players', /streaming/i], ['blu-ray-players', 'Blu-ray & DVD Players', /blu-ray player|dvd player/i], ['tv-wall-brackets', 'TV Wall Brackets', /bracket|cable/i]]),
  D('headphones-audio', 'Headphones & Audio', 'Headphones, earbuds and speakers for home and on the go.', [
    ['headphones', 'Headphones', /headphone/i], ['earbuds', 'Earbuds', /earbud/i], ['portable-speakers', 'Portable Speakers', /portable speaker/i],
    ['smart-speakers', 'Smart Speakers', /smart speaker/i], ['turntables', 'Turntables', /turntable/i], ['hi-fi-systems', 'Hi-Fi Systems', /hi-fi|\bspeakers\b/i]]),
  D('cameras', 'Cameras', 'Cameras, lenses and drones for every kind of shooter.', [
    ['mirrorless-cameras', 'Mirrorless Cameras', /mirrorless/i], ['dslr-cameras', 'DSLR Cameras', /dslr/i], ['action-cameras', 'Action Cameras', /action camera/i],
    ['instant-cameras', 'Instant Cameras', /instant/i], ['camera-lenses', 'Camera Lenses', /lens/i], ['drones', 'Drones', /drone/i]]),
  D('gaming', 'Gaming', 'Consoles, games and accessories for PlayStation, Xbox, Nintendo and PC.', [
    ['playstation', 'PlayStation', /playstation|ps5|ps4/i], ['xbox', 'Xbox', /xbox/i], ['nintendo-switch', 'Nintendo Switch', /nintendo|switch/i],
    ['pc-gaming', 'PC Gaming', /pc gam/i], ['gaming-accessories', 'Gaming Accessories', /accessor|racing wheel|carry case|charging/i], ['game-pre-orders', 'Game Pre-orders', /pre-order/i]]),
  D('home-appliances', 'Home Appliances', 'Kitchen, laundry, floor care and climate control for every room.', [
    ['coffee-machines', 'Coffee Machines', /coffee/i], ['vacuums', 'Vacuums', /vacuum|floor care/i], ['kitchen-appliances', 'Kitchen Appliances', /kettle|microwave|kitchen/i],
    ['fridges-freezers', 'Fridges & Freezers', /fridge|freezer/i], ['washing-machines-dryers', 'Washing Machines & Dryers', /washing|dryer/i], ['heating-cooling', 'Heating & Cooling', /climate|purifier|heater|fan/i]]),
  D('smart-home', 'Smart Home', 'Security cameras, video doorbells, smart lighting and more for a connected home.', [
    ['security-cameras', 'Security Cameras', /security camera/i], ['video-doorbells', 'Video Doorbells', /doorbell/i], ['smart-lighting', 'Smart Lighting', /lighting|bulb/i],
    ['smart-plugs-power', 'Smart Plugs & Power', /smart plug|smart home device/i]]),
  D('health-beauty', 'Health & Beauty', 'Hair care, grooming, oral care and personal health tech.', [
    ['hair-care', 'Hair Care', /hair/i], ['shavers-trimmers', 'Shavers & Trimmers', /shaver|trimmer/i], ['electric-toothbrushes', 'Electric Toothbrushes', /toothbrush/i], ['massagers', 'Massagers', /massag/i]]),
  D('music', 'Music', 'Vinyl, CDs and JB exclusives, plus instruments to make your own.', [
    ['vinyl', 'Vinyl', /vinyl/i], ['cds', 'CDs', /\bcds?\b/i], ['jb-exclusive-vinyl', 'JB Exclusive Vinyl', /jb exclusive/i], ['musical-instruments', 'Musical Instruments', /guitar|instrument|keyboard piano/i]]),
  D('movies-tv', 'Movies & TV', 'New release movies and TV series on 4K Ultra HD, Blu-ray and DVD.', [
    ['4k-ultra-hd', '4K Ultra HD', /4k/i], ['blu-ray', 'Blu-ray', /blu-ray/i], ['dvd', 'DVD', /\bdvd\b/i], ['tv-series', 'TV Series', /tv series|season/i]]),
  D('collectibles-merchandise', 'Collectibles & Merchandise', 'LEGO, Pop! Vinyl, figures and pop-culture merchandise.', [
    ['lego', 'LEGO', /lego|building set/i], ['pop-vinyl', 'Pop! Vinyl', /pop!? vinyl/i], ['figurines', 'Figurines', /figur/i], ['board-games', 'Board Games', /board game/i]]),
  D('car-audio-gps', 'Car Audio & GPS', 'Dash cams, car stereos and navigation for the road.', [
    ['dash-cams', 'Dash Cams', /dash ?cam/i], ['car-stereos', 'Car Stereos', /car stereo/i], ['gps-navigation', 'GPS Navigation', /gps|navigation/i]]),
  D('electric-transportation', 'Electric Transportation', 'e-Scooters and e-Bikes for getting around town.', [
    ['e-scooters', 'e-Scooters', /scooter/i], ['e-bikes', 'e-Bikes', /e-?bike/i]]),
  D('software', 'Software', 'Microsoft 365, antivirus and security software.', [
    ['microsoft-365', 'Microsoft 365', /microsoft 365|office/i], ['antivirus-security', 'Antivirus & Security', /antivirus|security software/i]]),
]

// Header (yellow bar utilities + black nav bar), as seen on jbhifi.com.au.
export const UTILITIES = [
  ['Track order', '/pages/track-my-order', 'track'], ['Stores', '/pages/store-finder', 'store'], ['Log in', '/account/login', 'user'], ['Cart', '/cart', 'cart'],
]
export const NEW_MENU = [['New at JB!', '/collections/new'], ['Game Pre-orders', '/collections/game-pre-orders'], ['Coming soon', '/collections/new?availability=preorder'], ['News & Reviews', '/blogs/news-and-reviews']]
export const DEALS_MENU = [['Current catalogues', '/pages/catalogues'], ['Hot deals', '/collections/deals'], ['Clearance', '/collections/clearance'], ['Work & Study', '/collections/work-study'], ['Movie Night', '/collections/movie-night'], ['Kitchen Upgrades', '/collections/kitchen-upgrades']]
export const SERVICES_MENU = [['Installations', '/pages/installations'], ['Trade-in', '/pages/tradein'], ['JB Hi-Fi ExtraCare', '/pages/extracare'], ['Interest Free Finance', '/pages/interest-free-finance'], ['Mobile & Broadband Plans', '/pages/mobile-broadband-plans'], ['Prepaid SIM', '/pages/pre-paid-sim'], ['JB Hi-Fi Business', '/pages/jb-hi-fi-business'], ['JB Hi-Fi Education', '/pages/education']]
export const POPULAR_BRANDS = ['Apple', 'Samsung', 'Sony', 'LG', 'Microsoft', 'Nintendo', 'PlayStation', 'Xbox', 'Bose', 'JBL', 'Dyson', 'Breville', 'Logitech', 'Lenovo', 'HP', 'Canon', 'GoPro', 'Garmin', 'DJI', 'Philips']

export const FOOTER = [
  ['Help & Support', [['Help & Support', '/pages/help-and-support'], ['Track my order', '/pages/track-my-order'], ['Delivery & Collection', '/pages/help-and-support/delivery-and-collection'], ['Click & Collect', '/pages/help-and-support/what-is-click-and-collect'], ['Pre-orders', '/pages/help-and-support/how-do-pre-orders-work'], ['Payment methods', '/pages/help-and-support/online-payment-methods'], ['Returns policy', '/pages/help-and-support/how-do-i-return-faulty-goods'], ['Warranty guide', '/pages/help-and-support/refunds-and-warranties-guide'], ['Contact us', '/pages/contact-us']]],
  ['Services', [['Installations', '/pages/installations'], ['Trade-in', '/pages/tradein'], ['JB Hi-Fi ExtraCare', '/pages/extracare'], ['Interest Free Finance', '/pages/interest-free-finance'], ['Mobile & Broadband Plans', '/pages/mobile-broadband-plans'], ['Prepaid SIM', '/pages/pre-paid-sim'], ['Digital receipts', '/pages/receipts']]],
  ['Shop with JB', [['Gift Cards', '/pages/gift-cards'], ['JB Perks', '/pages/perks'], ['Catalogues', '/pages/catalogues'], ['Brands', '/pages/brands'], ['JB Hi-Fi Business', '/pages/jb-hi-fi-business'], ['JB Hi-Fi Education', '/pages/education'], ['Corporate gift cards', '/pages/corporate-gift-cards']]],
  ['About JB Hi-Fi', [['About us', '/pages/about-us'], ['Careers', '/pages/careers'], ['Investor relations', '/pages/investors'], ['Store finder', '/pages/store-finder'], ['News & Reviews', '/blogs/news-and-reviews'], ['Competitions', '/blogs/competitions'], ['Product recalls', '/pages/product-recalls']]],
]
export const LEGAL = [['Privacy policy', '/pages/privacy-policy'], ['Terms & conditions', '/pages/terms-and-conditions'], ['Site map', '/sitemap']]

// Help & Support centre (jbhifi.com.au/pages/help-and-support/<article>).
export const HELP_TOPICS = [
  ['Orders', 'orders', ['how-do-pre-orders-work', 'why-cant-i-order-multiple-copies-of-the-same-item', 'when-will-i-get-my-pre-order']],
  ['Delivery & Collection', 'delivery-and-collection', ['what-are-the-delivery-options-for-online-purchases', 'what-is-click-and-collect', 'click-and-collect-pre-orders']],
  ['Payments', 'payments', ['online-payment-methods', 'afterpay', 'zip', 'paypal-pay-in-4']],
  ['Returns & Warranty', 'returns-and-warranty', ['how-do-i-return-faulty-goods', 'refunds-and-warranties-guide']],
  ['My Account', 'my-account', ['jb-perks']],
]
const p = (...lines) => lines.map(l => `<p>${l}</p>`).join('')
const ul = (...items) => `<ul>${items.map(i => `<li>${i}</li>`).join('')}</ul>`
export const HELP_ARTICLES = {
  'how-do-pre-orders-work': ['How do pre-orders work?', p('Pre-orders allow you to pay for an item you want ahead of its release day. You pay the full price when you place your order.', 'Pre-order price guarantee: if the price of your pre-order drops before release day, we\'ll refund you the difference shortly after release.', 'Pre-orders are dispatched from our Victorian warehouse one day before release. Orders placed within three business days of release may arrive after release day. Pre-orders are not eligible for courier delivery.')],
  'why-cant-i-order-multiple-copies-of-the-same-item': ['Why can\'t I order multiple copies of the same item?', p('Some popular and limited items have a per-order quantity limit so more customers can get one. The cart shows the maximum you can select for each item (up to 5 for most games).')],
  'when-will-i-get-my-pre-order': ['When will I get my pre-order?', p('Delivery pre-orders leave our warehouse one day before release so most arrive on or close to release day. The extra pre-order delivery time is highlighted during the checkout process.', 'Click & Collect pre-orders are ready from store opening on release day. Wait for your ready-to-collect email and SMS before you visit.')],
  'what-are-the-delivery-options-for-online-purchases': ['What are the delivery options for online purchases?', `${p('Delivery options and charges are shown at checkout once you enter your address.')}${ul('<b>Standard Delivery</b> (2 – 12 days) via Australia Post Mail, Australia Post eParcel or Team Global Express Priority (2 – 4 days).', '<b>Express Delivery</b> (1 – 2 business days).', '<b>Courier Delivery</b> (next business day) — pre-orders are not eligible.', '<b>Uber ASAP / Scheduled</b> for metro stock from a nearby store.')}`],
  'what-is-click-and-collect': ['What is Click & Collect?', p('Click & Collect lets you buy online and pick up from a JB Hi-Fi store. Choose Click & Collect at checkout and select a store with your item available.', 'We\'ll email and SMS you when your order is ready. Bring your order number or barcode and photo ID to the store.')],
  'click-and-collect-pre-orders': ['Click & Collect pre-orders', p('Click & Collect pre-orders are available from store opening on release day, unless the product page says otherwise (some games can be collected early to preload). Pre-order bonuses may be online-delivery only.')],
  'online-payment-methods': ['What payment methods are accepted online?', `${p('We accept:')}${ul('Visa, Mastercard and American Express credit and debit cards', 'PayPal', 'Apple Pay (Safari on Apple devices)', 'Afterpay', 'Zip', 'UnionPay', 'Latitude Interest Free', 'JB Hi-Fi Gift Cards')}${p('Diners Club cards can be used through PayPal. Afterpay, Zip and PayPal cannot be combined with each other.')}`],
  afterpay: ['Afterpay', p('Buy now and pay in four instalments with Afterpay. Select Afterpay at checkout. Afterpay cannot be combined with Zip or PayPal. Eligibility and limits are set by Afterpay.')],
  zip: ['Zip', p('Zip Pay and Zip Money let you spread the cost of your purchase. Select Zip at checkout. Zip cannot be combined with Afterpay or PayPal. Approval is subject to Zip\'s terms.')],
  'paypal-pay-in-4': ['PayPal Pay in 4', p('PayPal Pay in 4 splits eligible purchases into four interest-free payments. Choose PayPal at checkout and select Pay in 4 when it is offered.')],
  'how-do-i-return-faulty-goods': ['How do I return faulty goods?', p('If your product is faulty, bring it with your proof of purchase to any JB Hi-Fi store, or contact us for an online order. Our products come with guarantees that cannot be excluded under the Australian Consumer Law.', 'We do not accept change of mind returns on video games distributed by digital redemption code (Code in Box). Choose carefully.')],
  'refunds-and-warranties-guide': ['Refunds and warranties guide', p('You are entitled to a replacement or refund for a major failure and compensation for any other reasonably foreseeable loss or damage under the Australian Consumer Law. Manufacturer warranties are in addition to these rights.', 'Keep your receipt — JB Perks members can find digital receipts in their account.')],
  'jb-perks': ['JB Perks', p('JB Perks is our free membership: a welcome coupon, member-only discounts, early access to sales, a Birthday Perk and digital receipts. Joining needs a JB Hi-Fi account and an Australian mobile number. Membership is not required to buy.')],
}

// Information pages: [title, lead, sections[[heading, html]], related links]
export const INFO_PAGES = {
  '/pages/contact-us': ['Contact us', 'Get help with an order, a product or a store.', [['Live chat', p('Chat with our online team from the Help & Support centre. Have your order number ready.')], ['Call us', p('Call <b>13 52 44</b> for online orders and general enquiries.')], ['Send us a request', p('Use the support request form and we\'ll get back to you by email.')]], [['Send a support request', '/help/contact'], ['Help & Support', '/pages/help-and-support'], ['Store finder', '/pages/store-finder']]],
  '/pages/services': ['Services', 'More than just products — JB Hi-Fi services to set up, protect and pay for your tech.', [], [['Installations', '/pages/installations'], ['Trade-in', '/pages/tradein'], ['JB Hi-Fi ExtraCare', '/pages/extracare'], ['Interest Free Finance', '/pages/interest-free-finance'], ['Mobile & Broadband Plans', '/pages/mobile-broadband-plans'], ['Prepaid SIM', '/pages/pre-paid-sim'], ['Digital receipts', '/pages/receipts'], ['JB Hi-Fi Business', '/pages/jb-hi-fi-business'], ['JB Hi-Fi Education', '/pages/education']]],
  '/pages/installations': ['Installations', 'Let our installation partners set up your new TV, home theatre, appliance or smart home device.', [['What we install', ul('TV wall mounting and setup', 'Home theatre and soundbars', 'Dishwashers, ovens and cooktops', 'Split system air conditioners', 'Smart home devices and security cameras')], ['How to book', p('Add an installation to your purchase in store, or ask our team after you buy online. Availability depends on your area.')]], [['Find a store', '/pages/store-finder']]],
  '/pages/tradein': ['Trade-in', 'Trade in your old phone, tablet, laptop or console and put the value towards something new.', [['How it works', ul('Get a quote online or in store', 'Bring your device to a participating JB Hi-Fi store', 'Receive the trade-in value as store credit')], ['Before you trade in', p('Back up and wipe your device, remove accounts and SIM cards, and bring photo ID.')]], [['Find a store', '/pages/store-finder']]],
  '/pages/extracare': ['JB Hi-Fi ExtraCare', 'Extended care for your tech after the manufacturer\'s warranty ends.', [['What\'s covered', p('ExtraCare plans can cover repairs for eligible products for an extended period. Terms, exclusions and prices depend on the product.')], ['Your consumer rights', p('ExtraCare is in addition to your rights under the Australian Consumer Law.')]], [['Warranty guide', '/pages/help-and-support/refunds-and-warranties-guide']]],
  '/pages/interest-free-finance': ['Interest Free Finance', 'Spread the cost of bigger purchases with interest free finance.', [['Payment options', ul('Latitude Interest Free', 'Zip', 'Afterpay', 'PayPal Pay in 4')], ['Things to know', p('Approval, fees and terms are set by each finance provider. Interest free periods and minimum spends vary by offer.')]], [['Payment methods', '/pages/help-and-support/online-payment-methods']]],
  '/pages/mobile-broadband-plans': ['Mobile & Broadband Plans', 'Compare mobile and home internet plans from leading Australian networks, in store or online.', [['Plans in store', p('Our telco specialists can connect a new plan, port your number and set up your phone in store.')]], [['Mobile Phones', '/collections/mobile-phones'], ['Prepaid SIM', '/pages/pre-paid-sim']]],
  '/pages/pre-paid-sim': ['Prepaid SIM', 'Prepaid SIMs and recharges for the major Australian networks.', [['Activate', p('Activate a new prepaid SIM online with the network, using your ID and the SIM serial number.')]], [['Mobile Phones', '/collections/mobile-phones']]],
  '/pages/receipts': ['Digital receipts', 'JB Perks members get their receipts stored in their account — no more lost paper receipts.', [['Find a receipt', p('Log in and open your account to see digital receipts for purchases linked to your JB Perks membership.')]], [['Log in', '/account/login'], ['JB Perks', '/pages/perks']]],
  '/pages/gift-cards': ['Gift Cards', 'Give the gift of choice with a JB Hi-Fi Gift Card — use it in store and online.', [['JB Hi-Fi Gift Cards', p('Choose a physical gift card in store or a digital gift card. Values from $20.')], ['Using your gift card', p('Enter your gift card number and PIN at checkout. Gift cards can be combined with most other payment methods.')], ['Check your balance', p('Check your gift card balance in store or on the receipt that came with it.')]], [['Corporate gift cards', '/pages/corporate-gift-cards'], ['Payment methods', '/pages/help-and-support/online-payment-methods']]],
  '/pages/corporate-gift-cards': ['Corporate gift cards', 'Bulk JB Hi-Fi Gift Cards for staff rewards, incentives and promotions.', [['About', p('JB Hi-Fi runs a separate corporate gift card service for business orders. This page is a local summary; that service is not part of this store.')]], [['Gift Cards', '/pages/gift-cards']]],
  '/pages/catalogues': ['Current catalogues', 'Shop Red Hot Deals at JB Hi-Fi! Browse our latest catalogues and deals.', [['This week\'s catalogue', p('Our current catalogue features hot deals across TVs, computers, gaming, audio and appliances. Prices valid while stocks last.')], ['Hot deals', p('Look for the <b>RED HOT DEAL</b> and <b>ON SALE</b> badges across the site.')]], [['Shop hot deals', '/collections/deals'], ['Clearance', '/collections/clearance']]],
  '/pages/about-us': ['About us', 'JB Hi-Fi is Australia\'s largest home entertainment retailer.', [['Our story', p('JB Hi-Fi started as a single store in Keilor East, Melbourne in 1974 and is now a leading retailer of consumer electronics, home appliances, games, music and movies across Australia and New Zealand.')], ['Always cheap prices', p('Our everyday focus is on great value, a wide range and knowledgeable staff in stores across the country.')]], [['Careers', '/pages/careers'], ['Investor relations', '/pages/investors'], ['Store finder', '/pages/store-finder']]],
  '/pages/careers': ['Careers', 'Work with JB Hi-Fi in stores, distribution centres and support offices.', [['Join the team', p('JB Hi-Fi lists retail, sales, distribution and support office roles on its separate careers site. This page is a local summary; applications are not accepted here.')]], [['About us', '/pages/about-us']]],
  '/pages/investors': ['Investor relations', 'JB Hi-Fi Limited (ASX: JBH) investor information.', [['About the group', p('JB Hi-Fi Limited is listed on the Australian Securities Exchange and operates JB Hi-Fi Australia, JB Hi-Fi New Zealand and The Good Guys. Reports and announcements are published on its separate investor site; this page is a local summary.')]], [['About us', '/pages/about-us']]],
  '/pages/jb-hi-fi-business': ['JB Hi-Fi Business', 'Technology solutions for businesses, government and education.', [['For business', p('JB Hi-Fi Business supplies hardware, software and services to organisations of all sizes through a dedicated team and its own site. This page is a local summary.')]], [['Contact us', '/pages/contact-us']]],
  '/pages/education': ['JB Hi-Fi Education', 'Device programs for schools and students.', [['For schools', p('JB Hi-Fi Education runs bring-your-own-device portals for schools, with recommended devices and support. This page is a local summary.')]], [['Computers & Tablets', '/collections/computers-tablets']]],
  '/pages/product-recalls': ['Product recalls', 'Current product safety recalls for products sold by JB Hi-Fi.', [['Current recalls', p('If a product you bought is recalled, stop using it and follow the instructions in the recall notice. Recalls are also listed on the ACCC Product Safety Australia website.')]], [['Contact us', '/pages/contact-us']]],
  '/pages/privacy-policy': ['Privacy policy', 'How JB Hi-Fi collects, uses and protects your personal information.', [['What we collect', p('We collect the details you give us when you order, create an account, join JB Perks or contact us, and information about how you use our website.')], ['How we use it', p('To process orders, provide services, send you offers you have agreed to receive and improve our stores and website.')], ['This environment', p('In this benchmark clone, information stays in your browser session and local test data. Nothing is sent to JB Hi-Fi.')]], [['Terms & conditions', '/pages/terms-and-conditions']]],
  '/pages/terms-and-conditions': ['Terms & conditions', 'The terms that apply when you shop at JB Hi-Fi online.', [['Pricing', p('All prices are in Australian dollars and include GST. Discounts apply to the previous ticketed or advertised price.')], ['Orders', p('An order is accepted when we confirm it. Some items have a per-order quantity limit.')], ['Pre-orders', p('Pre-orders are paid in full at the time of order and are covered by our pre-order price guarantee.')]], [['Privacy policy', '/pages/privacy-policy']]],
}

// Blogs (News & Reviews hub).
export const BLOGS = [
  ['news-and-reviews', 'News & Reviews', 'The latest in tech, games, music and movies from the JB Hi-Fi team.'],
  ['tech', 'Tech', 'Hands-on reviews and tech news.'],
  ['games', 'Games', 'Game news, previews and release dates.'],
  ['music', 'Music', 'New releases and interviews.'],
  ['movies-tv-show', 'Movies & TV', 'Interviews, news and 4K Ultra HD release round-ups.'],
  ['guides-tips', 'Guides & Tips', 'Buying guides to help you choose.'],
  ['competitions', 'Competitions', 'Enter to win prizes from JB Hi-Fi and our partners.'],
]
