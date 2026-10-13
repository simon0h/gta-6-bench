// Best Buy department tree, captured 2026-10-13 from bestbuy.com department pages (TV & Home Theater,
// Video Games, Computers & Tablets, Top Deals tiles, Outlet tiles). Paths mirror the real site's
// category URLs (without the ?id= query). Where a category ID was not observed, the path keeps the
// real URL shape with a descriptive slug only. Every node renders a local category landing page;
// products appear only when the store's active catalog has matching items.
//
// local: the fixture department id (catalog.js) whose products may fill the grid in fixture mode.
// match: optional category / family filter inside that department.
const sub = (name, path, extra = {}) => ({ name, path, ...extra })

export const TREE = [
  { id: 'appliances', name: 'Appliances', path: '/site/electronics/home-appliances/abcat0900000.c', local: 'appliances',
    intro: 'Major and small appliances for every room, from refrigerators and ranges to coffee makers and floor care.',
    subs: [
      sub('Appliance Deals', '/site/all-electronics-on-sale/all-appliances-on-sale/pcmcat1637009144989.c'),
      sub('Refrigerators', '/site/home-appliances/refrigerators/abcat0901000.c'),
      sub('Washers & Dryers', '/site/home-appliances/washers-dryers/abcat0910000.c'),
      sub('Ranges, Cooktops & Ovens', '/site/home-appliances/ranges-cooktops-ovens/abcat0904000.c'),
      sub('Dishwashers', '/site/home-appliances/dishwashers/abcat0905000.c'),
      sub('Microwaves', '/site/home-appliances/microwaves/abcat0904010.c', { match: 'Microwaves' }),
      sub('Small Kitchen Appliances', '/site/home-appliances/small-appliances/abcat0912000.c', { match: /Coffee|Mixer|Toaster/ }),
      sub('Vacuums & Floor Care', '/site/home-appliances/vacuums-floor-care/abcat0911000.c'),
    ] },
  { id: 'tv-home-theater', name: 'TV & Home Theater', path: '/site/electronics/tv-video/abcat0100000.c', local: 'tv-home-theater',
    intro: 'TVs, projectors, sound bars and streaming devices to build the home theater that fits your space.',
    subs: [
      sub('TV & Home Theater Deals', '/site/all-electronics-on-sale/all-tv-home-theater-on-sale/pcmcat1690836748285.c'),
      sub('TVs', '/site/tv-home-theater/tvs/abcat0101000.c', { match: 'TVs' }),
      sub('Projectors & Screens', '/site/tv-home-theater/projectors-screens/pcmcat158900050008.c'),
      sub('Streaming Devices', '/site/tv-home-theater/streaming-media-devices/pcmcat161100050040.c', { match: 'Streaming Media Players' }),
      sub('Home Audio', '/site/audio/home-audio-systems/pcmcat241600050001.c'),
      sub('TV Stands & Mounts', '/site/tv-video-accessories/tv-stands-mounts/abcat0106000.c'),
      sub('TV & Home Theater Accessories', '/site/tv-home-theater/tv-video-accessories/abcat0107000.c', { match: 'HDMI Cables' }),
      sub('TV & Home Theater Services', '/site/services/tv-home-theater-services/pcmcat138100050024.c'),
      sub('Sound Bars', '/site/speakers/sound-bars/abcat0205007.c', { match: 'Sound Bars' }),
      sub('Home Theater & Stereo Systems', '/site/home-audio-systems/home-theater-systems/abcat0203000.c'),
      sub('Blu-ray and DVD Players', '/site/tv-home-theater/blu-ray-dvd-players/abcat0102000.c'),
      sub('Outdoor Home Theater', '/site/tv-home-theater/outdoor-home-theater/pcmcat1590695649808.c'),
    ] },
  { id: 'computers-tablets', name: 'Computers & Tablets', path: '/site/electronics/computers-pcs/abcat0500000.c', local: 'computers-tablets',
    intro: 'Laptops, desktops, tablets, monitors and the accessories that keep you productive.',
    subs: [
      sub('Computers & Tablets Deals', '/site/all-electronics-on-sale/all-computers-tablets-on-sale/pcmcat1632941704767.c'),
      sub('Laptops', '/site/computers-pcs/laptop-computers/abcat0502000.c', { match: 'Laptops' }),
      sub('Desktops & All-in-Ones', '/site/computers-pcs/desktops-all-in-one-computers/abcat0501000.c'),
      sub('Tablets', '/site/computers-pcs/tablets/pcmcat209000050006.c', { match: 'Tablets' }),
      sub('PC Gaming', '/site/computers-pcs/pc-gaming/abcat0712000.c'),
      sub('Printers, Ink & Toner', '/site/computers-pcs/printers-ink-toner/abcat0511001.c'),
      sub('Monitors', '/site/computer-monitors/all-monitors/pcmcat143700050048.c', { match: 'Monitors' }),
      sub('Computer Cards & Components', '/site/computers-pcs/computer-cards-components/abcat0507000.c'),
      sub('Hard Drives, SSD & Storage', '/site/computers-pcs/hard-drives-storage/abcat0504001.c', { match: 'Internal SSDs' }),
      sub('Computer Accessories & Peripherals', '/site/computers-pcs/computer-accessories-peripherals/abcat0515000.c', { match: /Keyboards|Mice|Webcams/ }),
      sub('Software', '/site/computers-pcs/software/abcat0508000.c'),
      sub('Wi-Fi & Networking', '/site/computers-pcs/networking/abcat0503000.c'),
    ] },
  { id: 'cell-phones', name: 'Cell Phones', path: '/site/electronics/mobile-cell-phones/abcat0800000.c', local: 'phones-wearables', match: /Phone/,
    intro: 'Unlocked and carrier phones, plus cases, chargers and plans to keep you connected.',
    subs: [
      sub('Cell Phone Deals', '/site/all-electronics-on-sale/all-cell-phones-on-sale/pcmcat1690895861552.c'),
      sub('Unlocked Cell Phones', '/site/mobile-cell-phones/unlocked-mobile-phones/pcmcat156400050037.c', { match: 'Unlocked Cell Phones' }),
      sub('iPhone', '/site/mobile-cell-phones/iphone/pcmcat305200050000.c'),
      sub('Samsung Galaxy', '/site/mobile-cell-phones/samsung-galaxy/pcmcat1567520553233.c'),
      sub('Prepaid Phones', '/site/mobile-cell-phones/prepaid-phones/pcmcat1482868003920.c'),
      sub('Cell Phone Accessories', '/site/mobile-cell-phones/mobile-phone-accessories/abcat0811002.c', { match: 'Cell Phone Cases' }),
    ] },
  { id: 'audio', name: 'Audio', path: '/site/electronics/audio/abcat0200000.c', local: 'headphones-audio',
    intro: 'Headphones, earbuds, speakers and home audio for every kind of listener.',
    subs: [
      sub('Headphones', '/site/audio-headphones/headphones/abcat0204000.c', { match: 'Over-Ear Headphones' }),
      sub('Wireless Earbuds', '/site/headphones/wireless-earbuds/pcmcat1498066426730.c', { match: 'True Wireless Earbuds' }),
      sub('Bluetooth & Wireless Speakers', '/site/home-audio/bluetooth-wireless-speakers/pcmcat310200050004.c', { match: 'Bluetooth Speakers' }),
      sub('Sound Bars', '/site/speakers/sound-bars/abcat0205007.c'),
      sub('Turntables & Record Players', '/site/home-audio/turntables-accessories/abcat0208029.c'),
    ] },
  { id: 'video-games', name: 'Video Games', path: '/site/electronics/video-games/abcat0700000.c', local: 'gaming',
    intro: 'Consoles, games, accessories and VR for PlayStation, Xbox, Nintendo and PC gaming.',
    subs: [
      sub('Video Games Deals', '/site/all-electronics-on-sale/all-video-games-on-sale/pcmcat1690896520374.c'),
      sub('PlayStation', '/site/video-games/playstation/pcmcat1741974777714.c', { platform: 'ps5' }),
      sub('Nintendo', '/site/video-games/nintendo/pcmcat1742407305710.c'),
      sub('XBOX', '/site/video-games/xbox/pcmcat1741975945801.c', { platform: 'xbox' }),
      sub('All Video Games', '/site/video-games/all-video-games/pcmcat1487698928729.c', { games: true }),
      sub('Handheld Gaming', '/site/video-games/handheld-gaming/pcmcat1662993575810.c'),
      sub('Video Game Accessories', '/site/video-games/video-games-accessories/abcat0715000.c', { match: /Accessor|Controller/ }),
      sub('Virtual Reality', '/site/video-games/virtual-reality/pcmcat1476727552895.c'),
      sub('Digital Gaming', '/site/video-games/digital-gaming/pcmcat1497456762821.c'),
      sub('Gaming Gift Cards', '/site/entertainment-gift-cards/gaming-gift-cards/pcmcat140000050010.c'),
      sub('Simulation Racing', '/site/video-games/simulation-racing/pcmcat1762458962968.c'),
      sub('Retro Gaming & Arcade', '/site/video-games/retro-gaming/pcmcat1500927006607.c'),
      sub('Video Game Releases & Events', '/site/video-games/video-game-releases-events/pcmcat308100050002.c', { games: true }),
    ] },
  { id: 'cameras', name: 'Cameras, Camcorders & Drones', path: '/site/electronics/cameras-camcorders/abcat0400000.c', local: 'cameras',
    intro: 'Mirrorless and DSLR cameras, lenses, action cams and drones for every kind of creator.',
    subs: [
      sub('Digital Cameras', '/site/cameras-camcorders/digital-cameras/abcat0401000.c'),
      sub('Camera Lenses', '/site/digital-camera-accessories/camera-lenses/abcat0410018.c'),
      sub('Action Cameras', '/site/cameras-camcorders/action-cameras/pcmcat1487692616219.c'),
      sub('Drones', '/site/cameras-camcorders/drones/pcmcat369900050001.c'),
      sub('Camcorders', '/site/cameras-camcorders/camcorders/abcat0403000.c'),
    ] },
  { id: 'home-furniture-office', name: 'Home, Furniture & Office', path: '/site/electronics/home-furniture-office', local: null,
    intro: 'Furniture, office chairs, desks, lighting and home essentials.',
    subs: [
      sub('Office Furniture', '/site/home-furniture-office/office-furniture'),
      sub('Living Room Furniture', '/site/furniture-and-decor/living-room-furniture/pcmcat272800050000.c'),
      sub('Gaming Chairs', '/site/home-furniture-office/gaming-chairs'),
      sub('Home Organization', '/site/home-furniture-office/home-organization'),
    ] },
  { id: 'smart-home', name: 'Smart Home, Security & Wi-Fi', path: '/site/electronics/home-security-safety/pcmcat254000050002.c', local: 'smart-home',
    intro: 'Smart speakers, security cameras, video doorbells, thermostats and mesh Wi-Fi.',
    subs: [
      sub('Smart Doorbells', '/site/door-window-security/smart-doorbells/pcmcat748301598672.c', { match: 'Video Doorbells' }),
      sub('Security Cameras', '/site/home-security-safety/security-cameras/pcmcat1496260974185.c', { match: 'Security Cameras' }),
      sub('Smart Thermostats', '/site/smart-home/smart-thermostats/pcmcat1492808199261.c', { match: 'Smart Thermostats' }),
      sub('Wi-Fi & Networking', '/site/computers-pcs/networking/abcat0503000.c'),
    ] },
  { id: 'car-electronics', name: 'Car Electronics & GPS', path: '/site/electronics/car-electronics-gps/abcat0300000.c', local: null,
    intro: 'Dash cams, car audio, remote starters, GPS and more for the road.',
    subs: [
      sub('Dash Cameras', '/site/car-electronics-gps/dash-cameras'),
      sub('Car Audio', '/site/car-electronics-gps/car-audio'),
      sub('Car Chargers & Mounts', '/site/car-electronics-gps/car-chargers-mounts'),
    ] },
  { id: 'wearables', name: 'Wearable Technology', path: '/site/electronics/wearable-technology/pcmcat332000050000.c', local: 'phones-wearables', match: /Smartwatch/,
    intro: 'Smartwatches, fitness trackers and smart rings to keep up with your day.',
    subs: [
      sub('Smartwatches', '/site/wearable-technology/smartwatches', { match: 'Smartwatches' }),
      sub('Fitness Trackers', '/site/wearable-technology/fitness-trackers'),
    ] },
  { id: 'health-wellness', name: 'Health, Wellness & Fitness', path: '/site/electronics/health-wellness-fitness', local: null,
    intro: 'Massagers, personal care, fitness equipment and health monitoring tech.',
    subs: [
      sub('Massagers', '/site/spa-relaxation/massagers/abcat0915003.c'),
      sub('Fitness Equipment', '/site/health-wellness-fitness/fitness-equipment'),
      sub('Personal Care & Beauty', '/site/health-wellness-fitness/personal-care-beauty'),
    ] },
  { id: 'outdoor-living', name: 'Outdoor Living', path: '/site/electronics/outdoor-living', local: null,
    intro: 'Grills, patio furniture, outdoor audio and yard tools.',
    subs: [
      sub('Grills & Outdoor Cooking', '/site/outdoor-living/grills-outdoor-cooking'),
      sub('Patio Furniture', '/site/outdoor-living/patio-furniture'),
    ] },
  { id: 'toys-games', name: 'Toys, Games & Crafts', path: '/site/electronics/toys-games-crafts', local: null,
    intro: 'Toys, LEGO, trading cards, collectibles and crafting tools.',
    subs: [
      sub('Toys', '/site/toys-games-crafts/toys/pcmcat1492451998184.c'),
      sub('Trading Cards & Collectibles', '/site/toys-games-crafts/trading-cards-collectibles'),
      sub('Crafting', '/site/toys-games-crafts/crafting'),
    ] },
  { id: 'movies-music', name: 'Movies & Music', path: '/site/electronics/movies-music/abcat0600000.c', local: 'gaming', match: /Music|Vinyl/,
    intro: 'Movies, TV shows, vinyl records and CDs.',
    subs: [
      sub('Vinyl Records', '/site/movies-music/vinyl-records'),
      sub('Movies & TV Shows', '/site/movies-music/movies-tv-shows'),
    ] },
  { id: 'electric-transportation', name: 'Electric Transportation', path: '/site/electronics/electric-transportation', local: null,
    intro: 'E-bikes, electric scooters and accessories for getting around.',
    subs: [
      sub('Electric Bikes', '/site/electric-transportation/electric-bikes'),
      sub('Electric Scooters', '/site/electric-transportation/electric-scooters'),
    ] },
]

// Flat lookup of every category node with its parent.
export const NODES = TREE.flatMap(d => [{ ...d, parent: null }, ...d.subs.map(s => ({ ...s, parent: d }))])
  .filter((n, i, all) => all.findIndex(m => m.path === n.path) === i)

// Header menus (the real header's Shop / Deals / Support & Services / Discover pills).
export const MENUS = {
  Shop: TREE.map(d => [d.name, d.path]).concat([['Gift Cards', '/site/electronics/gift-cards/cat09000.c'], ['Gift Ideas', '/site/electronics/gift-ideas/abcat0010000.c'], ['Best Buy Outlet', '/site/electronics/outlet-refurbished-clearance/pcmcat142300050026.c'], ['Shop by Brand', '/brands']]),
  Deals: [['Top Deals', '/top-deals'], ['Deal of the Day', '/site/misc/deal-of-the-day/pcmcat248000050016.c'], ['Exclusive Member Deals', '/site/best-buy-membership/member-deals/pcmcat1679678876400.c'], ['Best Buy Outlet', '/site/electronics/outlet-refurbished-clearance/pcmcat142300050026.c'], ['Trade-In Offers', '/site/best-buy-trade-in/trade-in-offers/pcmcat1774297472214.c']],
  'Support & Services': [['Visit our Support Center', '/support'], ['Check Order Status', '/profile/ss/orderlookup'], ['Shop with an Expert', '/services/triage/shopping'], ['Schedule a Service', '/services/triage/home'], ['Protection & Support Plans', '/site/electronics/services/pcmcat1528819595254.c'], ['Haul Away & Recycling', '/site/services/recycling/pcmcat149900050025.c'], ['Find a Store', '/site/store-locator'], ['Contact Us', '/contact-us']],
  Discover: [['My Best Buy Memberships', '/site/electronics/best-buy-membership/pcmcat1679668833285.c'], ['Credit Cards', '/site/misc/financing-rewards/pcmcat102500050032.c'], ['Gift Ideas', '/site/electronics/gift-ideas/abcat0010000.c'], ['Best Buy Business', '/site/electronics/bestbuy-business/pcmcat230900050001.c'], ['Best Buy app', '/site/misc/mobile-app/pcmcat208500050016.c'], ['Grand Theft Auto VI', '/site/video-game-franchises/grand-theft-auto/pcmcat301800050002.c']],
}

// The real header's link strip (seasonal promos skipped).
export const HEADER_LINKS = [
  ['Top Deals', '/top-deals'],
  ['Deal of the Day', '/site/misc/deal-of-the-day/pcmcat248000050016.c'],
  ['Trade-In', '/site/best-buy-trade-in/trade-in-offers/pcmcat1774297472214.c'],
  ['Gift Ideas', '/site/electronics/gift-ideas/abcat0010000.c'],
  ['My Best Buy Memberships', '/site/electronics/best-buy-membership/pcmcat1679668833285.c'],
  ['Credit Cards', '/site/misc/financing-rewards/pcmcat102500050032.c'],
  ['Gift Cards', '/site/electronics/gift-cards/cat09000.c'],
  ['Best Buy Business', '/site/electronics/bestbuy-business/pcmcat230900050001.c'],
]

export const SUPPORT_PANEL = [
  ['Check your Order Status', '/profile/ss/orderlookup'],
  ['Shipping, Delivery & Store Pickup', '/site/help-topics/shipping-delivery-store-pickup/pcmcat316000050003.c'],
  ['Returns & Exchanges', '/site/help-topics/return-exchange-policy/pcmcat260800050014.c'],
  ['Price Match Guarantee', '/site/help-topics/price-match-guarantee/pcmcat290300050002.c'],
]

export const FOOTER = [
  ['Order & Purchases', [
    ['Check Order Status', '/profile/ss/orderlookup'],
    ['Shipping, Delivery & Pickup', '/site/help-topics/shipping-delivery-store-pickup/pcmcat316000050003.c'],
    ['Returns & Exchanges', '/site/help-topics/return-exchange-policy/pcmcat260800050014.c'],
    ['Price Match Guarantee', '/site/help-topics/price-match-guarantee/pcmcat290300050002.c'],
    ['Product Recalls', '/site/help-topics/product-recalls/pcmcat114800050015.c'],
    ['Trade-In Program', '/trade-in'],
    ['Gift Cards', '/site/electronics/gift-cards/cat09000.c'],
  ]],
  ['Payment Options', [
    ['My Best Buy® Credit Card', '/site/misc/financing-rewards/pcmcat102500050032.c'],
    ['Pay Your Bill at Citibank', '/identity/sso/signin'],
    ['Lease to Own', '/site/financing-rewards/progressive-leasing/pcmcat1535574988808.c'],
    ['Buy Now, Pay Later', '/site/financing-rewards/zip/pcmcat1727878406362.c'],
    ['Best Buy Business Financing', '/site/bestbuy-business/best-buy-business-financing/pcmcat1556029048796.c'],
  ]],
  ['Support & Services', [
    ['Visit our Support Center', '/support'],
    ['Shop with an Expert', '/services/triage/shopping'],
    ['Schedule a Service', '/services/triage/home'],
    ['Manage an Appointment', '/dossier/service/appointmentfinder'],
    ['Protection & Support Plans', '/site/electronics/services/pcmcat1528819595254.c'],
    ['Haul Away & Recycling', '/site/services/recycling/pcmcat149900050025.c'],
    ['Contact Us', '/contact-us'],
  ]],
  ['Rewards & Membership', [
    ['My Best Buy Memberships', '/site/electronics/best-buy-membership/pcmcat1679668833285.c'],
    ['View Points & Certificates', '/profile/c/rwz/overview'],
    ['Member Offers', '/loyalty/catalog'],
  ]],
  ['Partnerships', [
    ['Sell on Best Buy Marketplace', '/site/electronics/marketplace/pcmcat248200050007.c'],
    ['Advertise with Us', '/advertise-with-us'],
    ['Affiliates: Creators & Publishers', '/site/misc/best-buy-affiliate-program/pcmcat198500050002.c'],
    ['Best Buy Health', '/best-buy-health'],
    ['Best Buy Education', '/site/bestbuy-business/bestbuy-education/pcmcat356600050000.c'],
    ['Best Buy Business', '/site/electronics/bestbuy-business/pcmcat230900050001.c'],
    ['Partner+', '/site/clp-bbfb/partner-plus/pcmcat1715699845027.c'],
  ]],
  ['About Best Buy', [
    ['Corporate Information', '/corporate-information'],
    ['Careers', '/careers'],
    ['Corporate Responsibility', '/corporate-responsibility'],
    ['Sustainability', '/sustainability'],
  ]],
]

export const LEGAL = [
  ['Accessibility', '/site/help-topics/accessibility/pcmcat1496336482680.c'],
  ['Terms & Conditions', '/site/help-topics/terms-and-conditions/pcmcat204400050067.c'],
  ['Privacy', '/site/help-topics/privacy-policy/pcmcat204400050062.c'],
  ['Interest-Based Ads', '/site/privacy-policy/interest-based-ads/pcmcat204400050066.c'],
  ['State Privacy Rights', '/site/privacy-policy/state-privacy-rights/pcmcat204400050063.c'],
  ['Health Data Privacy', '/site/privacy-policy/health-data-privacy/pcmcat1709131468002.c'],
  ['Do Not Sell/Share My Personal Information', '/sentry/landing?type=ca_donotsell'],
  ['Limit Use of My Sensitive Personal Information', '/sentry/landing?type=optout'],
  ['Targeted Advertising Opt Out', '/sentry/landing?type=donottarget'],
  ['CA Supply Chain Transparency Act', '/site/help-topics/ca-transparency-act/pcmcat263000050003.c'],
]

// Main non-product sections listed on the site map page.
export const SECTIONS = [
  ['Top Deals', '/top-deals'],
  ['Deal of the Day', '/site/misc/deal-of-the-day/pcmcat248000050016.c'],
  ['Best Buy Outlet', '/site/electronics/outlet-refurbished-clearance/pcmcat142300050026.c'],
  ['Gift Ideas', '/site/electronics/gift-ideas/abcat0010000.c'],
  ['Gift Cards', '/site/electronics/gift-cards/cat09000.c'],
  ['Check Gift Card Balance', '/gift-card-balance'],
  ['Trade-In Offers', '/site/best-buy-trade-in/trade-in-offers/pcmcat1774297472214.c'],
  ['My Best Buy Memberships', '/site/electronics/best-buy-membership/pcmcat1679668833285.c'],
  ['My Best Buy Credit Cards', '/site/misc/financing-rewards/pcmcat102500050032.c'],
  ['Best Buy Business', '/site/electronics/bestbuy-business/pcmcat230900050001.c'],
  ['Shop by Brand', '/brands'],
  ['Best Buy app', '/site/misc/mobile-app/pcmcat208500050016.c'],
  ['Store Locator', '/site/store-locator'],
  ['Support Center', '/support'],
  ['Contact Us', '/contact-us'],
  ['Order Status', '/profile/ss/orderlookup'],
  ['Account', '/account'],
  ['Cart', '/cart'],
]
