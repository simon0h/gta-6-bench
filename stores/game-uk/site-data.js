// Site structure captured from www.game.co.uk on 2026-10-13 (homepage, department pages,
// /sitemap Categories directory, /deals, /coming-soon). See research/parity/game-uk.json.
// Landing pages reproduce the real page shape (breadcrumb, tiles, "In This Section",
// filters, sort, editorial copy). Product grids only ever list rows from data.js PRODUCTS,
// so in reference mode most categories show the empty "0 Products" state.

const CAT = (...names) => p => names.includes(p.category) || names.includes(p.browseCategory)
const PLATFORM = { ps: p => p.platformFacet === 'PS5', xbox: p => p.platformFacet === 'Xbox', nintendo: p => p.platformFacet === 'Nintendo' || p.brand === 'Nintendo', pc: p => p.platformFacet === 'PC' || (p.departments || []).includes('pc-gaming') }
const ACCESSORY = CAT('Controllers', 'Headsets', 'Racing Wheels', 'Charging Docks', 'Carry Cases')
const DEAL = p => p.ticketPrice > p.price
const and = (...fns) => p => fns.every(f => f(p))
const NONE = () => false

// Real sitemap "Categories" tree: [label, path, children, options]
export const CATEGORY_TREE = [
  ['Accessories', '/accessories', [
    ['Controllers', '/accessories/controllers', [], { match: CAT('Controllers') }],
    ['Fight Sticks', '/accessories/fight-sticks'],
    ['Gaming Chairs', '/accessories/gaming-chairs'],
    ['Gaming Desks', '/accessories/gaming-desks'],
    ['Headsets', '/accessories/headsets', [['Kids Headsets', '/accessories/headsets/kids'], ['Wired Headsets', '/accessories/headsets/wired'], ['Wireless Headsets', '/accessories/headsets/wireless']], { match: CAT('Headsets') }],
  ], { match: ACCESSORY, intro: 'Controllers, headsets, chairs and desks to complete your setup.' }],
  ['Black Friday', '/black-friday/deals', [
    ['Black Friday Accessories', '/black-friday/accessories', [['Black Friday Gaming Chairs', '/black-friday/accessories/gaming-chairs']]],
    ['Black Friday Games', '/black-friday/games', [['Black Friday PC Games', '/black-friday/games/pc']]],
    ['Black Friday Nintendo', '/black-friday/nintendo', [['Black Friday Nintendo Accessories', '/black-friday/nintendo/accessories'], ['Black Friday Nintendo Controllers', '/black-friday/nintendo/controllers'], ['Black Friday Nintendo Games', '/black-friday/nintendo/games']]],
    ['Black Friday PlayStation', '/black-friday/playstation', [['PlayStation Black Friday Accessories', '/black-friday/playstation/accessories'], ['PlayStation Black Friday Controllers', '/black-friday/playstation/controllers'], ['PlayStation Black Friday Games', '/black-friday/playstation/games']]],
    ['Black Friday Tech', '/black-friday/tech'],
    ['Black Friday Toys', '/black-friday/toys', [['Black Friday LEGO', '/black-friday/lego']]],
    ['Black Friday Xbox', '/black-friday/xbox', [['Black Friday Xbox Accessories', '/black-friday/xbox/accessories'], ['Black Friday Xbox Controllers', '/black-friday/xbox/controllers'], ['Black Friday Xbox Games', '/black-friday/xbox/games']]],
  ], { match: NONE, intro: 'Black Friday offers appear here when the event is live.' }],
  ['Christmas', '/christmas', [
    ['Christmas Gifts For Gamers', '/christmas/gamer-gifts'], ['Christmas Novelty Gifts', '/christmas/novelty-gifts'], ['Christmas Party Games', '/christmas/party-games'],
    ['Christmas Soft Toys', '/christmas/gifts/christmas-soft-toys'], ['Christmas Top Picks', '/christmas/xmas-top-picks'], ['Pokemon Christmas Gifts', '/christmas/pokemon-gifts'],
    ['Stocking Filler Gifts', '/christmas/gifts/stocking-fillers'], ['Tech & Gadgets Christmas Gifts', '/christmas/tech-gifts'],
  ], { intro: 'Christmas gift ideas for gamers, collectors and families.' }],
  ['Coming Soon', '/coming-soon', [
    ['PC Coming Soon', '/coming-soon/pc', [], { match: and(p => p.preorder, PLATFORM.pc) }],
    ['Toys Coming Soon', '/coming-soon/toys', [], { match: NONE }],
    ['Trading Cards Coming Soon', '/coming-soon/trading-cards', [], { match: NONE }],
  ], { match: p => p.preorder, intro: "Keep an eye on what's coming next at GAME.", section: [['Trading Cards Coming Soon', '/coming-soon/trading-cards'], ['Toys Coming Soon', '/coming-soon/toys']] }],
  ['Deals', '/deals', [
    ['2 for £20', '/deals/2-for-20'], ['Accessory Deals', '/deals/accessories'], ['ASUS Peripherals', '/deals/asus-peripherals'], ['Board Games Deals', '/deals/board-games'],
    ['Clearance', '/deals/clearance', [['Video Games Clearance', '/deals/clearance/videogames']]], ['Frasers Plus Top Picks', '/deals/frasers-plus-promo-top-picks'],
    ['Games under £15', '/deals/video-games-under-15'], ['Nintendo Deals', '/deals/nintendo'], ['PC Gaming Deals', '/deals/pc'], ['PlayStation Days of Play', '/deals/days-of-play'],
    ['PlayStation Deals', '/deals/playstation'], ['Tech Deals', '/deals/tech'], ['Toy Deals', '/deals/toys'], ['Trading Card Deals', '/deals/tcg'],
    ['Up to 30% off', '/deals/30-off'], ['Up to 50% off', '/deals/50-off'], ['Up to 70% off', '/deals/70-off'], ['Up to 80% off', '/deals/80-off'], ['Up to 90% off', '/deals/90-off'],
    ['Warehouse Clearance', '/deals/warehouse-clearance'], ['Xbox Deals', '/deals/xbox'],
  ], {
    match: DEAL, all: DEAL,
    intro: 'Discover incredible deals across a wide range of products, from iconic toys and collectibles to the latest games, consoles and tech.',
    tiles: [['Toys', '/deals/toys'], ['Board Games', '/deals/board-games'], ['Trading Card Games', '/deals/tcg'], ['Tech Deals', '/deals/tech'], ['Up to 90% Off', '/deals/90-off'], ['Up to 80% Off', '/deals/80-off'], ['Up to 70% Off', '/deals/70-off'], ['Up to 50% Off', '/deals/50-off']],
    section: [['2 for £20', '/deals/2-for-20'], ['PlayStation Days of Play', '/deals/days-of-play'], ['Nintendo Deals', '/deals/nintendo'], ['PC Gaming Deals', '/deals/pc'], ['PlayStation Deals', '/deals/playstation'], ['Trading Card Deals', '/deals/tcg'], ['Tech Deals', '/deals/tech'], ['Toy Deals', '/deals/toys'], ['Xbox Deals', '/deals/xbox'], ['Frasers Plus Top Picks', '/deals/frasers-plus-promo-top-picks'], ['ASUS Peripherals', '/deals/asus-peripherals'], ['Clearance', '/deals/clearance'], ['Accessory Deals', '/deals/accessories'], ['Up to 30% off', '/deals/30-off'], ['Up to 50% off', '/deals/50-off'], ['Up to 70% off', '/deals/70-off'], ['Up to 80% off', '/deals/80-off'], ['Up to 90% off', '/deals/90-off'], ['Board Games Deals', '/deals/board-games'], ['Video Games Clearance', '/deals/clearance/videogames'], ['Games under £15', '/deals/video-games-under-15'], ['Warehouse Clearance', '/deals/warehouse-clearance']],
  }],
  ['Digital', '/digital', [
    ['Digital Add Ons', '/digital/add-ons'], ['Digital Credit', '/digital/credit', [], { match: CAT('Digital Downloads') }], ['Digital Games', '/digital/games'],
    ['Digital Subscriptions', '/digital/subscriptions'], ['Gift Cards', '/digital/gift-cards'],
  ], { dept: true }],
  ['Events', '/events', [
    ['Back To University', '/events/back-to-uni'], ['Easter Video Games Top Picks', '/events/easter-video-games'], ['Fathers Day', '/events/fathers-day-gifts'], ['Game on For Easter', '/events/easter-games-toys-outdoor'],
    ['Half Term Deals', '/events/half-term'], ['Halloween', '/events/halloween'], ['Mario Day', '/events/mario-day'], ["Mother's Day", '/events/mothers-day-gifts'], ["School's Out Picks", '/events/schools-out'], ['World Cup', '/events/world-cup'],
  ], { intro: 'Seasonal events and gift guides from GAME.' }],
  ['Frasers Plus Exclusive Prices', '/frasers-plus-exclusive-prices', [['Consoles and Games', '/frasers-plus-exclusive-prices/games-and-consoles'], ['Toys and Board Games', '/frasers-plus-exclusive-prices/toys-and-board-games']], { intro: 'Exclusive prices for Frasers Plus members, applied when you pay with Frasers Plus.' }],
  ['GAME Exclusives', '/game-exclusives', [['Tech GAME Exclusives', '/game-exclusives/tech']], { intro: 'Editions and products you can only find at GAME.' }],
  ['Games', '/games', [
    ['Action Adventure Games', '/games/action-adventure', [], { match: p => p.style === 'Action / Adventure' }], ['Anime Games', '/games/anime-games'], ['Family Games', '/games/family-casual'],
    ['Fighting Games', '/games/fighting'], ['Football Games', '/games/football'], ['Horror Games', '/games/horror'], ['Puzzle Games', '/games/puzzle'],
    ['Racing Games', '/games/racing', [], { match: p => p.style === 'Racing' }], ['RPG Games', '/games/rpg'], ['Rugby Games', '/games/rugby-games'], ['Shooter Games', '/games/shooter'],
    ['Simulation Games', '/games/simulation', [], { match: p => p.style === 'Simulation' }], ['Sports Games', '/games/sports'], ['Strategy Games', '/games/strategy'],
  ], { match: CAT('Video Games'), intro: 'Shop video games for PlayStation, Xbox, Nintendo Switch and PC by genre.' }],
  ['Gaming Homeware', '/gaming-homeware'],
  ['Gaming, TV & Movie Merchandise', '/merchandise', [
    ['Back to School', '/merchandise/back-to-school'], ['Display Collectables', '/merchandise/display-collectables'], ['Esports Merchandise', '/merchandise/esports'],
    ['Gaming Clothing', '/merchandise/clothing', [['Gaming Hats', '/merchandise/clothing/hats'], ['Gaming Hoodies', '/merchandise/clothing/hoodies'], ['Gaming T-shirts', '/merchandise/clothing/t-shirts'], ['Gaming, TV & Movie Clothing Accessories', '/merchandise/clothing/accessories']]],
    ['Gaming, TV & Movie Collectables', '/merchandise/collectables', [['Statues & Figurines', '/merchandise/collectables/statues-and-figurines']]],
    ['Homeware', '/merchandise/homeware', [['Gaming Bedding & Game Cushions', '/merchandise/homeware/bedding'], ['Gaming, TV & Movie Calendars', '/merchandise/homeware/calendars'], ['Gaming, TV & Movie Decorative Lights', '/merchandise/homeware/lights'], ['Gaming, TV & Movie Novelty Mugs', '/merchandise/homeware/mugs'], ['Gaming, TV & Movie Stationery', '/merchandise/homeware/stationery']]],
    ['Retro', '/merchandise/retro', [['Retro Arcade Machines', '/merchandise/retro/arcade-machines'], ['Retro Gaming Consoles', '/merchandise/retro/consoles']]],
  ], { intro: 'Clothing, collectables and homeware from your favourite games, TV shows and films.' }],
  ['Gifts', '/gifts', [
    ['Character Gifts', '/gifts/character-gifts'], ['Digital Gift Cards and Currency', '/gifts/digital-gift-cards-and-currency', [], { match: CAT('Gift Cards', 'Digital Downloads') }], ['Football Gifts', '/gifts/football-gifts'],
    ['Gifts for Gamers', '/gifts/gifts-for-gamers', [], { match: p => (p.campaigns || []).includes('gifts-for-gamers') }], ['Toy Gifts', '/gifts/toy-gifts'], ['Trading Card Gifts', '/gifts/trading-card-gifts'],
  ], { intro: 'Gift ideas for every gamer, collector and fan.' }],
  ['Just Landed', '/just-landed-up-next', [], { intro: 'The latest arrivals and what is up next at GAME.' }],
  ['SALE', '/sale', [
    ['Accessories on SALE', '/sale/accessories', [['Nintendo Accessories Sale', '/sale/accessories/nintendo']]], ['Apple Sale', '/sale/apple'], ['Disney Sale', '/sale/disney'],
    ['Games & Consoles on SALE', '/sale/gaming'], ['Nintendo SALE', '/sale/nintendo'], ['PC Gaming SALE', '/sale/pc-gaming'], ['PC SALE', '/sale/pc'], ['PlayStation SALE', '/sale/playstation'],
    ['Pokemon Sale', '/sale/pokemon'], ['Sonic Sale', '/sale/sonic'], ['Super Mario Sale', '/sale/super-mario'], ['Tech on SALE', '/sale/tech'], ['Top Picks SALE', '/sale/top-picks'],
    ['Toys on SALE', '/sale/toys'], ['Trading Cards Sale', '/sale/trading-cards'], ['Xbox SALE', '/sale/xbox'],
  ], { match: DEAL, all: DEAL, intro: 'Reduced prices across games, consoles, tech and toys while stocks last.' }],
  ['Xbox Gaming', '/xbox/all-xbox', [
    ['Xbox Accessories', '/xbox/accessories', [
      ['Xbox Charging', '/xbox/accessories/charging', [['Xbox One Charging Docks, Cables & Battery Packs', '/xbox/accessories/charging/xbox-one'], ['Xbox Series Charging Docks, Cables & Battery Packs', '/xbox/accessories/charging/xbox-series']]],
      ['Xbox Controllers', '/xbox/accessories/controllers'], ['Xbox Headsets', '/xbox/accessories/headsets'], ['Xbox One Accessories', '/xbox/accessories/xbox-one'],
      ['Xbox Series X | S Accessories', '/xbox/accessories/xbox-series'], ['Xbox Steering Wheels', '/xbox/accessories/steering-wheels', [['Xbox One Steering Wheels', '/xbox/accessories/steering-wheels/xbox-one']]],
    ]],
    ['Xbox Consoles', '/xbox/consoles'],
    ['Xbox Digital Downloads', '/xbox/digital-downloads', [
      ['Xbox Digital Games & Add-ons', '/xbox/digital-downloads/digital-games'],
      ['Xbox Game Pass', '/xbox/digital-downloads/xbox-game-pass', [['Xbox Game Pass Essential', '/xbox/digital-downloads/xbox-game-pass/xbox-gamepass-essential'], ['Xbox Game Pass Premium', '/xbox/digital-downloads/xbox-game-pass/xbox-gamepass-premium'], ['Xbox GamePass Ultimate', '/xbox/digital-downloads/xbox-game-pass/xbox-gamepass-ultimate']]],
      ['Xbox Gift Cards', '/xbox/digital-downloads/xbox-gift-cards'],
    ]],
    ['Xbox Games', '/xbox/games', [['Coming Soon', '/coming-soon/xbox', [], { h1: 'Xbox Coming Soon', match: and(p => p.preorder, PLATFORM.xbox) }], ['Series X | S Games', '/xbox/games/xbox-series-x'], ['Xbox Games Bestsellers', '/xbox/games/bestsellers'], ['Xbox One Games', '/xbox/games/xbox-one', [], { match: NONE }]]],
    ['Xbox Gifts', '/xbox/merchandise'],
    ['Xbox Series S', '/xbox/series-s', [['Series S Consoles', '/xbox/consoles/xbox-series-s']]],
    ['Xbox Series X', '/xbox/series-x', [['Series X Consoles', '/xbox/consoles/xbox-series-x']]],
  ], { h1: 'Xbox Gaming', match: PLATFORM.xbox, intro: 'Shop Xbox Series X|S consoles, games, controllers, Game Pass and gift cards.' }],
]

// Header departments and other landing pages (tiles = "Shop by Category", section = "In This Section").
export const LANDINGS = {
  '/gaming': { h1: 'Gaming', title: 'Consoles & Video Games | GAME', tiles: [['Game Consoles', '/gaming/consoles'], ['Video Games', '/gaming/video-games'], ['Gaming Accessories', '/gaming/accessories'], ['Gift Cards', '/digital']], section: [['Accessories', '/gaming/accessories']], intro: 'Shop consoles, video games and accessories for PlayStation, Xbox, Nintendo and PC.', editorial: 'From the latest consoles and new releases to controllers, headsets and gaming chairs, GAME has everything you need to level up your setup. Pick up bundles and deals across PlayStation, Xbox, Nintendo Switch and PC.' },
  '/gaming/accessories': { h1: 'Gaming Accessories', match: ACCESSORY, parent: '/gaming' },
  '/digital': { h1: 'Digital', title: 'Digital Gift Cards | GAME', tiles: [['GAME e-Vouchers', '/digital/gift-cards'], ['PlayStation Gift Cards', '/playstation/digital-gaming'], ['Xbox Gift Cards', '/xbox/digital-downloads'], ['Xbox Game Pass', '/xbox/digital-downloads/xbox-game-pass'], ['Nintendo Switch Online', '/nintendo/eshop/nintendo-switch-online'], ['Nintendo Gift Cards', '/nintendo/eshop']], section: [['Digital Add Ons', '/digital/add-ons'], ['Digital Credit', '/digital/credit'], ['Digital Games', '/digital/games'], ['Digital Subscriptions', '/digital/subscriptions'], ['Gift Cards', '/digital/gift-cards']], intro: "Desperate to get a new game or in-game content? It's time to go digital with GAME.", editorial: 'Digital codes are delivered by email. Check the platform and UK region before buying: codes are intended for accounts registered in the United Kingdom.' },
  '/digital/gift-cards': { h1: 'Gift Cards', parent: '/digital', intro: 'Give the gift of choice with a Frasers Group Multi-Store Gift Card, the perfect present for any occasion.', editorial: 'Gift cards and eVouchers can be used at the payment step of checkout. Balance checks and new gift-card purchases are not available in this shop.' },
  '/pc-gaming': { h1: 'PC Gaming', title: 'PC Gaming - Desktops, Accessories, Desks and Deals | GAME', tilesHeading: 'Shop by Category', tiles: [['Headsets', '/pc-gaming/accessories/headsets'], ['Keyboards', '/pc-gaming/accessories/keyboards'], ['Mice', '/pc-gaming/accessories/mice'], ['Mouse Mats / Surfaces', '/pc-gaming/accessories/mouse-pads'], ['Microphones', '/pc-gaming/accessories/microphones'], ['Streaming', '/pc-gaming/accessories/streaming-equipment'], ['Monitors', '/pc-gaming/accessories/gaming-monitors'], ['Handheld Consoles', '/tech/handheld-consoles'], ['Gaming Chairs', '/accessories/gaming-chairs'], ['Networking', '/pc-gaming/accessories/gaming-routers'], ['Controllers', '/pc-gaming/accessories/controllers'], ['Speakers', '/tech/speakers']], intro: 'From the most recent single-player game to popular eSports titles and the classics that will never get old, we have a PC game for you.', editorial: 'Upgrade your PC setup with gaming keyboards, mice, headsets, monitors and streaming gear, plus chairs and desks built for long sessions.' },
  '/tech': { h1: 'Tech', title: 'Tech and Home Entertainment | GAME', tilesHeading: 'Shop by Category', tiles: [['Mobile Phones', '/tech/mobile-phones'], ['Mobile Accessories', '/tech/mobile-phones/mobile-accessories'], ['Smart Watches', '/tech/smart-tech/smart-watches'], ['Headphones', '/tech/headphones-and-earbuds'], ['Tablets', '/tech/tablets'], ['Speakers', '/tech/speakers'], ['Smart Lighting', '/tech/smart-tech/smart-lighting'], ['Novelty Lighting', '/merchandise/homeware/lights'], ['Virtual Reality', '/tech/vr'], ['Arcade Machines', '/merchandise/retro/arcade-machines'], ['Retro', '/merchandise/retro'], ['Cameras', '/tech/cameras'], ['TV & Monitors', '/pc-gaming/accessories/gaming-monitors'], ['Robots', '/robosen'], ['Drones', '/tech/drones'], ['Kids Tech', '/tech/kids-tech']], intro: 'Phones, headphones, smart tech, VR and home entertainment.', editorial: 'Unreal experiences at an unreal price. Explore virtual reality, smart home tech, speakers, tablets and retro gaming from GAME.' },
  '/lego': { h1: 'LEGO', h2: 'Welcome to the GAME LEGO Store', section: [['Shop all LEGO', '/lego/all-lego'], ['NEW LEGO Sets', '/lego/new-lego'], ['Lego Coming Soon', '/lego/coming-soon'], ['Pokemon LEGO', '/lego/pokemon']], intro: 'Create endless games, learn new skills and enjoy building your own toys with our LEGO store.', editorial: 'From LEGO video games to creative building sets, find a build for every age and interest.' },
  '/toys': { h1: 'Toys', title: 'Toys & Games | GAME', tilesHeading: 'Shop By Category', tiles: [['Action Figures', '/toys/action-figures'], ['Plushies', '/toys/plushies-and-soft-toys'], ['Retro Gaming', '/merchandise/retro'], ['Remote Control Cars', '/toys/toy-cars-and-vehicles/remote-control'], ['Collectibles', '/merchandise/collectables'], ['Pre-School Toys', '/toys/pre-school'], ['Playsets', '/toys/playsets'], ['Dolls', '/toys/dolls']], section: [['All Toys', '/toys/all-toys'], ['Outdoor Toys', '/toys/outdoor-toys'], ['LEGO', '/lego'], ['Pokémon', '/pokemon'], ['Star Wars', '/starwars'], ['Monopoly', '/monopoly'], ['LEGO Sale', '/lego/lego-deals'], ['Toys Sale', '/sale/toys']], intro: 'Adventure, excitement, fun… all from your own home!', editorial: 'Shop action figures, plushies, playsets, remote control cars and board games for every age.' },
  '/toys/trading-cards': { h1: 'Trading Cards', crumbs: [['Toys & Games', '/toys/all-toys']], section: [['Trading Card Booster Packs', '/toys/trading-cards/booster-packs'], ['New Trading Cards', '/toys/trading-cards/new'], ['Trading Card Accessories', '/toys/trading-cards/accessories']], intro: 'Collect, trade and play with our wide range of trading cards!', editorial: 'Booster packs, starter decks, binders and sleeves for Pokémon, Magic: The Gathering, Yu-Gi-Oh! and more.' },
  '/playstation': { h1: 'PlayStation', h2: 'Shop PlayStation Gaming', title: 'PlayStation Gaming | GAME', match: PLATFORM.ps, tilesHeading: 'Shop by Category', tiles: [['Games', '/playstation/games'], ['Accessories', '/playstation/accessories'], ['Consoles', '/consoles/playstation'], ['Digital', '/playstation/digital-gaming']], section: [['PS5 Disc Console', '/playstation/consoles/ps5/disc-edition'], ['PS5 Digital Console', '/playstation/consoles/ps5/digital-edition'], ['PS5 Bundles', '/playstation/consoles/ps5/bundles'], ['Controllers', '/playstation/accessories/controllers'], ['Headsets', '/playstation/accessories/headsets'], ['Storage', '/playstation/accessories/storage'], ['PS5 Controllers', '/playstation/accessories/controllers/ps5'], ['PlayStation Gift Cards', '/playstation/digital-gaming']], intro: 'Discover the latest PlayStation games from exclusive blockbusters to innovative indies.', editorial: 'Shop PS5 consoles, games, DualSense controllers, headsets and PlayStation Store gift cards.' },
  '/nintendo': { h1: 'Nintendo', title: 'Nintendo Gaming | GAME', match: PLATFORM.nintendo, tilesHeading: 'Shop by Category', tiles: [['Games', '/nintendo/games'], ['Accessories', '/nintendo/accessories'], ['Consoles', '/nintendo/consoles'], ['Digital', '/nintendo/eshop']], section: [['Nintendo Switch OLED Bundle', '/nintendo/consoles/nintendo-switch-oled'], ['Nintendo Switch Bundle', '/consoles/nintendo/nintendo-bundles'], ['Nintendo Switch Lite Bundle', '/nintendo/consoles/nintendo-switch-lite'], ['Controllers', '/nintendo/accessories/controllers'], ['Cases', '/nintendo/accessories/cases'], ['Memory Cards', '/nintendo/accessories/memory-cards'], ['Joy-Cons', '/nintendo/accessories/controllers/joycons']], intro: 'Explore new worlds and meet iconic Nintendo characters with our wide range of Nintendo Switch games.', editorial: 'Shop Nintendo Switch consoles, games, Joy-Con controllers, cases and eShop cards.' },
  '/pokemon': { h1: 'Pokémon', intro: 'Pokémon games, trading cards, plush and collectables.', section: [['Pokemon LEGO', '/lego/pokemon'], ['Pokemon Sale', '/sale/pokemon'], ['Pokemon Christmas Gifts', '/christmas/pokemon-gifts']] },
}

// Infer a listing filter for pages only reached from tiles: platform from the path,
// product kind from the last segment. Undetermined pages list nothing.
export function inferMatch(path) {
  const plat = /playstation|ps5/.test(path) ? PLATFORM.ps : /xbox/.test(path) ? PLATFORM.xbox : /nintendo/.test(path) ? PLATFORM.nintendo : null
  if (/digital|gift|eshop|game-pass|gamepass|credit|deal|sale|clearance|black-friday|bundles|disc-edition|digital-edition|lego|toys|cards/.test(path)) return NONE
  const kind = /\/games$/.test(path) ? CAT('Video Games') : /consoles/.test(path) ? CAT('Consoles') : /controllers/.test(path) ? CAT('Controllers') : /headsets/.test(path) ? CAT('Headsets') : /accessories$/.test(path) ? ACCESSORY : null
  if (!kind) return NONE
  return plat ? and(plat, kind) : kind
}

// Flatten everything into one path -> landing map.
export function allLandings() {
  const map = new Map()
  const put = (path, data) => { if (!map.has(path)) map.set(path, data); else map.set(path, { ...data, ...map.get(path) }) }
  const walk = (nodes, parents) => {
    for (const [label, path, kids = [], opts = {}] of nodes) {
      put(path, { h1: opts.h1 || label, label, crumbs: parents, intro: opts.intro, section: opts.section || (kids.length ? kids.map(([l, p]) => [l, p]) : null), match: opts.match, tiles: opts.tiles, editorial: opts.editorial, dept: opts.dept })
      walk(kids, [...parents, [label, path]])
    }
  }
  walk(CATEGORY_TREE, [])
  for (const [path, data] of Object.entries(LANDINGS)) {
    const parent = data.parent && map.get(data.parent)
    map.set(path, { label: data.h1, crumbs: data.crumbs || (data.parent ? [[parent?.h1 || LANDINGS[data.parent]?.h1, data.parent]] : []), ...(map.get(path) || {}), ...data })
  }
  // Tile / section targets that the real menus link to but the sitemap tree does not list.
  for (const [path, data] of [...map]) {
    for (const [label, p] of [...(data.tiles || []), ...(data.section || [])]) if (!map.has(p)) map.set(p, { h1: label, label, crumbs: [...(data.crumbs || []), [data.h1, path]], match: inferMatch(p) })
  }
  for (const [path, data] of map) if (!data.match && !data.dept) data.match = inferMatch(path)
  return map
}
