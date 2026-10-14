// Site chrome and information pages for the EB Games Australia clone.
// Captured 2026-10-13 from https://www.ebgames.com.au/ with WebFetch (see research/parity/eb-games-au.json).
// Menu entries keep the real site's URL paths; departments the real menu shows only as a heading
// use the real search URL scheme or a local landing page.

// [label, href, children: [label, href][]]
export const MENU = [
 ['Sale','/search?promotions=all',[['All Sale','/search?promotions=all'],['Buy 2 Get 1 Free - Pop! Vinyls','/search?promotions=Buy+2+Get+1+Free+Pop%21+Vinyl'],['TT Racing Sale','/search?promotions=TT+Racing+Sale'],['$20 When You Spend $30','/search?promotions=%2420+When+You+Spend+%2430']]],
 ['Trading Cards','/featured/trading-cards',[['Trading Card Home','/featured/trading-cards'],['Pokemon','/featured/pokemon-trading-card-game'],['Magic the Gathering','/featured/magic-the-gathering'],['One Piece','/search?category=trading-cards&subcategory=trading-cards-one-piece'],['Yu-Gi-Oh','/search?category=trading-cards&subcategory=trading-cards-yu-gi-oh'],['League of Legends - Riftbound','/search?category=trading-cards&subcategory=trading-cards-league-of-legends'],['Disney Lorcana','/disney-lorcana'],['Dragon Ball Super','/search?category=trading-cards&subcategory=trading-cards-dragon-ball'],['Pop Culture','/search?category=trading-cards&subcategory=trading-cards-pop-culture'],['Sports Trading Cards','/sports-trading-cards'],['Trading Card Accessories','/search?category=trading-cards&subcategory=trading-cards-accessories'],['We Buy TCG','/sell-your-tcg-singles']]],
 ['EB World PLUS','/plus',[]],
 ['Clothing & Lifestyle','/clothing',[['T-Shirts','/clothing#Clothing_Best_Tshirts'],['Hoodies & Jackets','/search?category=clothing&subcategory=clothing-hoodies-jackets'],['Sleepwear','/search?category=clothing&subcategory=clothing-sleepwear'],['Costumes & Cosplay','/search?category=apparel&subcategory=apparel-cosplay-gear'],['Socks','/search?category=clothing&subcategory=clothing-socks'],['Hats & Beanies','/search?category=apparel&subcategory=apparel-hats'],['Bags & Luggage','/search?category=apparel&subcategory=apparel-bags-luggage'],['Wallets','/search?category=apparel&subcategory=apparel-wallets'],['Jewellery','/search?category=apparel&subcategory=apparel-jewellery'],['Pets','/pets']]],
 ['Preowned','/featured/preowned',[['Retro','/retro'],['PlayStation','/search?category=gaming&condition=preowned&attributes=platform%3Aplaystation-4&attributes=platform%3Aplaystation-5&attributes=platform%3Aplaystation-vita&attributes=platform%3Aplaystation-vr&attributes=platform%3Aplaystation-vr2'],['Nintendo','/search?category=gaming&condition=preowned&attributes=platform%3Anintendo-switch-lite&attributes=platform%3Anintendo-switch&attributes=platform%3Anintendo-3ds&attributes=platform%3Anintendo-wii-u'],['Xbox','/search?category=gaming&condition=preowned&attributes=platform%3Axbox-360&attributes=platform%3Axbox-one&attributes=platform%3Axbox-series-x'],['Consoles','/search?category=gaming&subcategory=gaming-console&condition=preowned'],['Controllers','/search?category=gaming&subcategory=gaming-controller&condition=preowned']]],
 ['Consoles & Hardware','/search?category=gaming&subcategory=gaming-console',[['Nintendo Switch 2','/search?category=gaming&subcategory=gaming-console&attributes=platform%3Anintendo-switch-2'],['PlayStation','/search?category=gaming&subcategory=gaming-console&attributes=platform%3Aplaystation-5&attributes=platform%3Aplaystation-4&attributes=platform%3Aplaystation-vr2'],['Nintendo Switch','/search?category=gaming&subcategory=gaming-console&attributes=platform%3Anintendo-switch&attributes=platform%3Anintendo-switch-lite'],['Xbox','/search?category=gaming&subcategory=gaming-console&attributes=platform%3Axbox-series-x&attributes=platform%3Axbox-one'],['Retro Consoles','/search?category=gaming&attributes=console-type%3Aretro-console'],['Virtual Reality','/search?category=gaming&subcategory=gaming-virtual-reality'],['Arcade Machines','/search?category=gaming&subcategory=gaming-retro-gaming']]],
 ['Video Games','/search?category=gaming&subcategory=gaming-video-game',[['Nintendo Switch 2','/search?category=gaming&subcategory=gaming-video-game&attributes=platform%3Anintendo-switch-2'],['Nintendo Switch','/search?category=gaming&subcategory=gaming-video-game&attributes=platform%3Anintendo-switch'],['Nintendo 3DS','/search?category=gaming&subcategory=gaming-video-game&attributes=platform%3Anintendo-3ds'],['PlayStation 5','/search?category=gaming&subcategory=gaming-video-game&attributes=platform%3Aplaystation-5'],['PlayStation 4','/search?category=gaming&subcategory=gaming-video-game&attributes=platform%3Aplaystation-4'],['PlayStation 3','/search?category=gaming&subcategory=gaming-video-game&attributes=platform%3Aplaystation-3'],['PlayStation 2','/search?category=gaming&subcategory=gaming-video-game&attributes=platform%3Aplaystation-2'],['Xbox Series X','/search?category=gaming&subcategory=gaming-video-game&attributes=platform%3Axbox-series-x'],['Xbox One','/search?category=gaming&subcategory=gaming-video-game&attributes=platform%3Axbox-one'],['Xbox 360','/search?category=gaming&subcategory=gaming-video-game&attributes=platform%3Axbox-360'],['PC Games','/search?category=gaming&subcategory=gaming-video-game&attributes=platform%3Apc']]],
 ['Gaming Accessories','/search?category=gaming&subcategory=gaming-accessories',[['Controllers','/search?category=gaming&subcategory=gaming-controller'],['Headsets','/featured/headsets'],['Storage & Memory','/search?category=gaming&subcategory=gaming-storage'],['Racing & Simulation','/search?category=gaming&subcategory=gaming-simulation'],['Gaming Furniture','/gaming-furniture'],['Microphones','/search?category=gaming&subcategory=gaming-microphones'],['Cases','/search?category=gaming&subcategory=gaming-cases'],['Chargers, Cables & Batteries','/search?category=gaming&subcategory=gaming-chargers-batteries']]],
 ['Digital Currency, Content & Gift Cards','/featured/egift-cards',[['EB Games Gift Cards','/featured/egift-cards'],['PlayStation Store','/search?category=gaming&subcategory=gaming-digital&sort=price&order=asc&attributes=platform%3Aplaystation-5&attributes=platform%3Aplaystation-4&attributes=digital-type%3Acurrency&attributes=digital-type%3Agift-card&attributes=digital-type%3Acontent'],['Nintendo Switch & Nintendo Switch 2 Online & Digital Content','/search?category=gaming&subcategory=gaming-digital&sort=price&order=asc&attributes=digital-type%3Acurrency&attributes=digital-type%3Agift-card&attributes=platform%3Anintendo-switch-2&attributes=platform%3Anintendo-switch&attributes=digital-type%3Acontent&attributes=digital-type%3Afull-game-download&attributes=digital-type%3Asubscription'],['Xbox Gamepass & Digital Gift Cards','/search?category=gaming&subcategory=gaming-digital&sort=name&order=asc&attributes=platform%3Axbox-series-x&attributes=platform%3Axbox-one&attributes=digital-type%3Asubscription&attributes=digital-type%3Agift-card&attributes=developer%3Amicrosoft&attributes=digital-type%3Acontent'],['Roblox Robux Digital Currency','/search?category=gaming&subcategory=gaming-digital&attributes=franchise%3Aroblox&sort=price&order=asc'],['Check Gift Card Balance','/giftcards/balance']]],
 ['PC Gaming','/featured/pc',[['PC Gaming Home','/featured/pc'],['Gaming Desktops & Laptops','/featured/pc#PCSetupHeader'],['Handheld PC Hardware','/search?category=gaming&subcategory=gaming-pc-hardware&attributes=gaming-pcs%3Ahandheld'],['Video Games','/search?category=gaming&attributes=platform%3Apc&subcategory=gaming-video-game'],['Virtual Reality','/search?category=gaming&subcategory=gaming-virtual-reality'],['Headsets','/featured/headsets'],['Keyboards','/search?category=gaming&subcategory=gaming-keyboards'],['Mice','/search?category=gaming&subcategory=gaming-mice'],['Streaming Gear','/featured/pc#PCStreamingHeader'],['Speakers & Audio','/search?category=electronics&subcategory=electronics-audio'],['Gaming Desks & Chairs','/gaming-furniture']]],
 ['Homewares','/homewares',[['Homewares Home','/homewares'],['Glasses & Drinkware','/search?category=homewares&subcategory=homewares-drinkware'],['Bedding','/search?category=homewares&subcategory=homewares-bedding'],['Bath','/search?category=homewares&subcategory=homewares-bath'],['Towels','/search?category=homewares&attributes=bath-type%3Atowel'],['Dining','/search?category=homewares&subcategory=homewares-dining'],['Kitchenware','/search?category=homewares&subcategory=homewares-kitchenware'],['Lighting','/search?category=homewares&subcategory=homewares-home-decor&attributes=home-decor-type%3Alighting'],['Candles','/search?category=homewares&subcategory=homewares-home-decor&attributes=home-decor-type%3Acandle'],['Doormats','/search?q=doormat&category=homewares'],['Stationery','/search?category=homewares&subcategory=homewares-stationery'],['Posters & Wall Art','/search?category=homewares&subcategory=homewares-wall-decor'],['Smart Home','/search?category=electronics&subcategory=electronics-smart-home']]],
 ['Collectibles','/search?category=collectibles',[['See all','/search?category=collectibles'],['Pop Vinyls','/featured/pop-vinyl'],['POP MART','/pop-mart'],['Action Figures','/search?category=collectibles&subcategory=collectibles-figures&attributes=figure-type%3Aaction-figure'],['Replicas','/search?category=collectibles&subcategory=collectibles-replicas'],['Statues & Busts','/search?category=collectibles&subcategory=collectibles-statues-busts'],['Star Wars The Black Series','/featured/star-wars#SW_BlackSeriesHeader'],['Anime Figures','/search?category=collectibles&attributes=figure-type%3Afigure&attributes=manufacturer%3Abandai-namco&attributes=manufacturer%3Abanpresto'],['Limited Release','/search?q=limitedrelease&category=collectibles']]],
 ['Board Games','/featured/board-games',[['Board Games Home','/featured/board-games'],['New Release','/search?category=toys-hobbies&subcategory=toys-hobbies-board-games&attributes=board-game-type%3Anew-games'],['Classic Games','/search?category=toys-hobbies&subcategory=toys-hobbies-board-games&attributes=board-game-type%3Aclassic-games'],['Strategy & Tabletop Games','/search?category=toys-hobbies&subcategory=toys-hobbies-board-games&attributes=board-game-type%3Atabletop-and-strategy-games'],['Family & Party Games','/search?category=toys-hobbies&subcategory=toys-hobbies-board-games&attributes=board-game-type%3Afamily-and-party-games'],['Dungeons & Dragons','/featured/dungeons-and-dragons']]],
 ['Toys & Games','/search?category=toys-hobbies',[['See all','/search?category=toys-hobbies'],['Plush Toys','/plush'],['LEGO','/featured/lego'],['Puzzles and Dice','/search?category=toys-hobbies&subcategory=toys-hobbies-board-games&attributes=board-game-type%3Apuzzles-and-dice'],['NERF, Playsets & More','/search?category=toys-hobbies&subcategory=toys-hobbies-toys'],['Beyblade','/beyblade'],['Electronic Toys & Tamagotchi','/search?category=toys-hobbies&subcategory=toys-hobbies-electronic-toys']]],
 ['Books & Comics','/search?category=books-movies',[['Art Books','/search?category=books-movies&subcategory=books-movies-art-books'],['Cookbooks','/search?category=books-movies&subcategory=books-movies-cookbooks'],['Manga','/search?category=books-movies&subcategory=books-movies-manga']]],
 ['Movies & TV','/search?category=movies-tv',[['4K UHD Movies','/search?category=movies-tv&attributes=format%3Aultra-hd&subcategory=movies-tv-movies'],['Blu-ray Movies','/search?category=movies-tv&subcategory=movies-tv-movies&attributes=format%3Ablu-ray'],['DVD Movies','/search?category=movies-tv&subcategory=movies-tv-movies&attributes=format%3Advd'],['Blu-ray TV Shows','/search?category=movies-tv&subcategory=movies-tv-tv-shows&attributes=format%3Ablu-ray'],['DVD TV Shows','/search?category=movies-tv&subcategory=movies-tv-tv-shows&attributes=format%3Advd'],['Action & Adventure','/search?category=movies-tv&attributes=genre%3Aaction&attributes=genre%3Aadventure'],['Comedy','/search?category=movies-tv&attributes=genre%3Acomedy'],['Drama','/search?category=movies-tv&attributes=genre%3Adrama'],['Horror','/search?category=movies-tv&attributes=genre%3Ahorror'],['Sci-Fi','/search?category=movies-tv&attributes=genre%3Ascience-fiction'],['Thriller','/search?category=movies-tv&attributes=genre%3Athriller']]],
 ['Console Trade Deals','/console-trade-deals',[['Nintendo Trade Deals','/switch-trade-deals'],['PlayStation Trade Deals','/playstation-trade-deals'],['Xbox Trade Deals','/xbox-trade-deals']]],
]

export const SHOPPING_INFO = [['Reboot Repairs','/reboot'],['Find a Store','/stores'],['Events','/events'],['EB Market','/marketplace'],['Help & Support','/help'],['Careers at EB Games','/careers'],['Check Gift Card Balance','/giftcards/balance'],['EB Protect','/eb-protect'],['Click & Collect','/clickandcollect'],['Trade & Save','/trade-and-save'],['Zero Regrets','/zero-regrets']]
export const LEGAL = [['Privacy Policy','/privacy'],['Terms & Conditions','/terms'],['EB World Terms & Conditions','/ebworld/terms']]
export const PAYMENTS = ['Visa','Mastercard','Amex','Apple Pay','PayPal','Afterpay','Zip','Gift Card']

// Local department mapping for the real site's search slugs. Filters use only the store's own catalog.
export const CATEGORY_SLUGS = { 'trading-cards':'Trading Cards', collectibles:'Collectibles', 'toys-hobbies':'Toys & Games', homewares:'Homewares', clothing:'Clothing', apparel:'Clothing', 'books-movies':'Books & Comics', 'movies-tv':'Movies & TV', electronics:'Gaming Accessories' }
export const GAMING_SUBCATEGORIES = { 'gaming-console':{category:'Consoles'}, 'gaming-video-game':{category:'Video Games'}, 'gaming-controller':{type:'controller'}, 'gaming-keyboards':{type:'keyboard'}, 'gaming-mice':{type:'mouse'}, 'gaming-storage':{type:'ssd'}, 'gaming-simulation':{type:'wheel'}, 'gaming-cases':{type:'case'}, 'gaming-chargers-batteries':{category:'Gaming Accessories',q:'charge'} }

// Landing pages that mirror real paths: [path, title, intro, filters, tiles?, sections?]
export const LANDINGS = [
 ['/featured/pokemon-trading-card-game','Pokémon Trading Card Game','Booster packs, Elite Trainer Boxes, collections and tins from the latest Pokémon TCG expansions.',{category:'Trading Cards',q:'pokemon'}],
 ['/featured/magic-the-gathering','Magic: The Gathering','Play boosters, Commander decks, bundles and prerelease kits for the newest Magic sets.',{category:'Trading Cards',q:'magic'}],
 ['/disney-lorcana','Disney Lorcana','Starter decks, booster packs and gift sets for the Disney Lorcana Trading Card Game.',{category:'Trading Cards',q:'lorcana'}],
 ['/sports-trading-cards','Sports Trading Cards','AFL, NRL, NBA and NFL trading card packs, boxes and collector sets.',{category:'Trading Cards',q:'sports'}],
 ['/clothing','Clothing & Lifestyle','T-shirts, hoodies, sleepwear, socks, hats and bags from your favourite games, anime and pop culture.',{category:'Clothing'}],
 ['/pets','Pets','Pop culture collars, leads, toys and beds for your favourite companion.',{q:'pet'}],
 ['/retro','Retro','Classic consoles, games and accessories, tested and ready to play again.',{condition:'Preowned',q:'retro'}],
 ['/featured/headsets','Headsets','Gaming headsets for PlayStation, Xbox, Nintendo Switch and PC.',{type:'headphones'}],
 ['/gaming-furniture','Gaming Furniture','Gaming chairs, desks and accessories to build your battlestation.',{q:'chair'}],
 ['/featured/pc','PC Gaming','Gaming desktops and laptops, handheld PCs, keyboards, mice, headsets and streaming gear.',{platform:'PC'}],
 ['/featured/pop-vinyl','Pop! Vinyl','Collect Pop! Vinyl figures from games, movies, TV, anime and music.',{type:'figure',brand:'Funko'}],
 ['/pop-mart','POP MART','Blind boxes and designer collectible figures from POP MART.',{q:'pop mart'}],
 ['/featured/star-wars','Star Wars','Star Wars The Black Series figures, collectibles, apparel and LEGO.',{q:'star wars'}],
 ['/featured/dungeons-and-dragons','Dungeons & Dragons','Core rulebooks, starter sets, dice and adventures for Dungeons & Dragons.',{q:'dungeons'}],
 ['/plush','Plush Toys','Soft plush toys from games, anime and pop culture.',{type:'plush'}],
 ['/featured/lego','LEGO','LEGO sets from gaming, movies and pop culture.',{brand:'LEGO'}],
 ['/beyblade','Beyblade','Beyblade X starter packs, boosters and stadiums.',{q:'beyblade'}],
]

// Department landing tiles shown on hub pages (keyed by path).
export const HUB_TILES = {
 '/featured/trading-cards': { banner:'Trading Cards', tiles:[['Pokémon Trading Card Game','/featured/pokemon-trading-card-game'],['Magic: The Gathering','/featured/magic-the-gathering'],['One Piece','/search?category=trading-cards&subcategory=trading-cards-one-piece'],['Yu-Gi-Oh!','/search?category=trading-cards&subcategory=trading-cards-yu-gi-oh'],['Riftbound','/search?category=trading-cards&subcategory=trading-cards-league-of-legends'],['Disney Lorcana','/disney-lorcana'],['Pop Culture','/search?category=trading-cards&subcategory=trading-cards-pop-culture'],['Sports Trading Cards','/sports-trading-cards'],['Trading Card Accessories','/search?category=trading-cards&subcategory=trading-cards-accessories']], rows:['New Release Trading Cards','Shop the Latest Pokemon TCG!','Shop Magic: the Gathering!','Yu-Gi-Oh TCG!','League of Legends TCG!','Disney Lorcana!','Pop Culture Favourites!','Sports Trading Cards!'] },
 '/featured/preowned': { banner:'Same great games. Better value.', tiles:[['Retro','/retro'],['PlayStation','/search?category=gaming&condition=preowned&attributes=platform%3Aplaystation-4&attributes=platform%3Aplaystation-5&attributes=platform%3Aplaystation-vita&attributes=platform%3Aplaystation-vr&attributes=platform%3Aplaystation-vr2'],['Nintendo','/search?category=gaming&condition=preowned&attributes=platform%3Anintendo-switch-lite&attributes=platform%3Anintendo-switch&attributes=platform%3Anintendo-3ds&attributes=platform%3Anintendo-wii-u'],['Xbox','/search?category=gaming&condition=preowned&attributes=platform%3Axbox-360&attributes=platform%3Axbox-one&attributes=platform%3Axbox-series-x'],['Consoles','/search?category=gaming&subcategory=gaming-console&condition=preowned'],['Controllers','/search?category=gaming&subcategory=gaming-controller&condition=preowned']], rows:['Shop Preowned Consoles!','Shop Premium Preowned Consoles','Best Selling Preowned Titles!','Shop Preowned PlayStation Consoles','Best Selling PlayStation Games','Shop Preowned Nintendo Consoles','Best Selling Switch Games','Preowned Switch Controllers','Preowned Xbox Consoles','Best Selling Preowned Xbox Games','Preowned Xbox Controllers'] },
 '/featured/board-games': { banner:'Board Games', tiles:[['New Release','/search?category=toys-hobbies&subcategory=toys-hobbies-board-games&attributes=board-game-type%3Anew-games'],['Classic Games','/search?category=toys-hobbies&subcategory=toys-hobbies-board-games&attributes=board-game-type%3Aclassic-games'],['Strategy & Tabletop Games','/search?category=toys-hobbies&subcategory=toys-hobbies-board-games&attributes=board-game-type%3Atabletop-and-strategy-games'],['Family & Party Games','/search?category=toys-hobbies&subcategory=toys-hobbies-board-games&attributes=board-game-type%3Afamily-and-party-games'],['Dungeons & Dragons','/featured/dungeons-and-dragons'],['Puzzles and Dice','/search?category=toys-hobbies&subcategory=toys-hobbies-board-games&attributes=board-game-type%3Apuzzles-and-dice']] },
 '/homewares': { banner:'Homewares', tiles:[['Glasses & Drinkware','/search?category=homewares&subcategory=homewares-drinkware'],['Bedding','/search?category=homewares&subcategory=homewares-bedding'],['Bath','/search?category=homewares&subcategory=homewares-bath'],['Dining','/search?category=homewares&subcategory=homewares-dining'],['Kitchenware','/search?category=homewares&subcategory=homewares-kitchenware'],['Lighting','/search?category=homewares&subcategory=homewares-home-decor&attributes=home-decor-type%3Alighting'],['Stationery','/search?category=homewares&subcategory=homewares-stationery'],['Posters & Wall Art','/search?category=homewares&subcategory=homewares-wall-decor']] },
 '/featured/pc': { banner:'PC Gaming', tiles:[['Gaming Desktops & Laptops','/featured/pc#PCSetupHeader'],['Handheld PC Hardware','/search?category=gaming&subcategory=gaming-pc-hardware&attributes=gaming-pcs%3Ahandheld'],['Keyboards','/search?category=gaming&subcategory=gaming-keyboards'],['Mice','/search?category=gaming&subcategory=gaming-mice'],['Headsets','/featured/headsets'],['Streaming Gear','/featured/pc#PCStreamingHeader']], anchors:[['PCSetupHeader','Gaming Desktops & Laptops'],['PCStreamingHeader','Streaming Gear']] },
 '/clothing': { banner:'Clothing & Lifestyle', tiles:[['T-Shirts','/clothing#Clothing_Best_Tshirts'],['Hoodies & Jackets','/search?category=clothing&subcategory=clothing-hoodies-jackets'],['Sleepwear','/search?category=clothing&subcategory=clothing-sleepwear'],['Socks','/search?category=clothing&subcategory=clothing-socks'],['Hats & Beanies','/search?category=apparel&subcategory=apparel-hats'],['Bags & Luggage','/search?category=apparel&subcategory=apparel-bags-luggage']], anchors:[['Clothing_Best_Tshirts','Best Selling T-Shirts']] },
 '/featured/star-wars': { banner:'Star Wars', tiles:[], anchors:[['SW_BlackSeriesHeader','Star Wars The Black Series']] },
}

// Help centre (support.ebgames.com.au) categories with article titles from research/eb-games-au.md.
export const HELP_CATEGORIES = [
 ['delivery-collection','Delivery & Collection',[
  ['Do you offer free shipping?','Occasionally we run free shipping promotions. Please check the website banners and your checkout page to see if your order qualifies.'],
  ['How long will it take to ship to my address?','Orders are processed in 1–2 business days. Standard delivery takes 2–7 business days and Express 1–3 business days after dispatch.'],
  ['Why is express post not an option?','Express can be hidden for items containing lithium batteries, or when stock location or carrier limits apply.'],
  ['Can I deliver to a PO Box or Parcel Locker?','Yes. PO Boxes and Parcel Lockers can be entered as your delivery address.'],
  ['Same Day Delivery - How It Works','Same Day Delivery by Uber is offered at checkout in some areas for in-stock items. Orders placed after 2:00pm are delivered the next day.'],
  ['Who will deliver my order?','Orders are delivered by Australia Post, StarTrack or Couriers Please.'],
  ['What is Click & Collect?','Choose Click & Collect during checkout, then choose your store. When your order is ready for collection, we\'ll send you a notification.'],
  ['When will my Click & Collect order be ready for collection?','In-stock orders are usually ready within about 15 minutes during store trading hours.'],
  ['How long will my Click & Collect order be held at store?','In-stock orders are held for up to 6 weeks. Preorder pickup windows depend on your EB World level.'],
  ['What happens if my Click & Collect order is rejected?','You can change store, choose home delivery with complimentary shipping, or receive a full refund.']]],
 ['orders-preorders','Orders & Preorders',[
  ['What happens if my online preorder payment fails?','We email you instructions to update your card. If your preorder remains unpaid after 10 days, it may be cancelled.'],
  ['How do I pay my preorder off if I placed online for pick up in store?','Pay the balance at your nominated store with EB Games gift cards, trades, bank or credit cards.'],
  ['Do you ship preorders separately from other items?','If you order a preorder item and an in-stock item together, we\'ll usually ship the in-stock item immediately and the preorder item closer to release.'],
  ['How do I cancel my order?','Delivery orders can be cancelled from your order history if they have not been processed too far. Click & Collect preorders are cancelled at the pick-up store no earlier than 1 business day after ordering.'],
  ['How do I track my order?','Choose EB World or Guest at the top of the Track Order page, depending on whether you were signed in when you ordered.'],
  ['Where can I view my order history or invoices?','Signed-in EB World members can view orders and download tax invoices under My Orders.']]],
 ['payment-options','Payment Options',[
  ['Are there any surcharges for certain payment methods?','No, EB Games does not apply surcharges for Visa, Mastercard, PayPal, or Buy Now Pay Later services.'],
  ['What can Afterpay be used on?','Afterpay is not available for online preorders for home delivery or Click & Collect.'],
  ['What can Zip be used on?','You can pay the deposit for online Click & Collect preorders using Zip, but the remaining balance cannot be paid in store using Zip.'],
  ['Will I be charged GST on my purchase?','All prices displayed on our website include GST.']]],
 ['eb-world','EB World',[
  ['How to create an EB World Account','Enter your first name, last name, email address, password, date of birth and mobile number, choose a preferred store and select Sign Up.'],
  ['Need your password reset?','Select Forgotten password on the Sign In window and follow the emailed link.'],
  ['Earning Carrots & Leveling Up','EB World members earn Carrots on purchases and level up for extra rewards.'],
  ['What is EB World PLUS?','PLUS is a paid 12-month membership ($49.00) with extra member benefits.']]],
 ['returns-warranties','Returns & warranties',[
  ['Can I return an item if I change my mind?','Change of mind returns generally need the item unused, in its original packaging and returned within 7 days. Gift cards, digital products and opened hardware are excluded.'],
  ['What if my item is faulty?','Faulty goods are covered by the consumer guarantees under the Australian Consumer Law, which cannot be excluded.'],
  ['What is the Game Guarantee?','Selected games can be returned under EB World\'s Game Guarantee; conditions apply.'],
  ['What is EB Protect?','EB Protect covers faults, failures and accidental damage to consoles, games and controllers. Available in store only.']]],
 ['trade-preowned-reboot','Trade In, Preowned & Reboot',[
  ['How do I trade?','Bring your items and identification to a store; an associate will confirm the credit value.'],
  ['What is Zero Regrets?','EB World members can buy back a traded game for the price it was traded for.'],
  ['What is Reboot Repairs?','Fixed-price repairs for PlayStation, Nintendo and Xbox consoles and controllers.']]],
 ['gift-cards','Gift Cards',[
  ['How do I check my gift card balance?','Enter the 19-digit card number and 4-digit PIN on the Gift Card Balance page.'],
  ['How are eGift Cards delivered?','EB Games eGift Cards are emailed after checkout.']]],
 ['general-feedback','General & Feedback',[
  ['Price Match Promise','Ask in store about matching a competitor\'s advertised price; conditions apply.'],
  ['How do I contact EB Games?','Submit a support request with your order number and we\'ll get back to you.']]],
 ['announcements-troubleshooting','Announcements & Troubleshooting',[
  ['I am having issues using my credit card on your site','Check the card number, expiry and CVV, and that your billing address matches your card.']]],
]
export const POPULAR_ANSWERS = ['Can I cancel or change an order paid with Afterpay or Zip?','How can I pay for my Click & Collect order?','What is Click & Collect?','How long will my Click & Collect order be held at store?','How to create an EB World Account']

// Information pages: [path, title, lead, sections [heading, paragraphs[]]]
export const INFO_PAGES = [
 ['/clickandcollect','How It Works','Buy online and pick up from any of our 400+ EB Games stores.',[
  ['What is Click & Collect?',['Click & Collect lets you buy products online and pick them up from your local store. Find your product, add it to your cart, then choose a store and select Click & Collect at checkout.']],
  ['How can I pay for my Click & Collect order?',['Pay online at checkout. For preorder products, you can pay the deposit using Credit Card: Visa, Mastercard or Amex, and pay the balance in store.']],
  ['When will my Click & Collect order be ready for collection?',['In-stock orders are usually ready within 15 minutes during store trading hours. We\'ll email you when your order is ready.']],
  ['How do I collect my Click & Collect order?',['Bring your order ready email and valid photo ID (plus your EB World card if you\'re a member) to the store.']]]],
 ['/trade-and-save','Trade & Save at EB Games','Trade the games and consoles you\'ve finished with at any of our 300+ stores for credit towards your next purchase.',[
  ['Why should I trade?',['Turn the games, consoles and accessories you no longer play into store credit for your next game, console or collectible.']],
  ['How do I trade?',['Bring your items and the required identification to your local store. A store associate will tell you the credit value, which you can use on anything in store.']],
  ['What can I trade?',['Consoles, games and accessories you\'ve finished with. Check you have everything you need, such as cables and controllers, before you trade.']]]],
 ['/zero-regrets','Zero Regrets','Traded a game and want it back? EB World members can buy it back for the price it was traded for.',[
  ['How does the Zero Regrets Trade Policy work?',['EB World members can trade in games and later buy them back at any EB Games store for the price they were traded for.']],
  ['The game I traded is now on sale for cheaper than the trade value I got?',['If the current Preowned sale price is lower than the trade value you received, you only pay the sale price.']],
  ['My local store doesn\'t have stock of the Preowned game I want to buy back?',['Our team can check other stores, the warehouse and Home Direct for you, but availability isn\'t guaranteed.']]]],
 ['/reboot','Reboot Repairs','Fixed-price repairs for PlayStation, Nintendo and Xbox consoles and controllers, with a warranty on all repairs.',[
  ['Fixed Price Repairs',['Know the price up front. No Repair, No Fee Guarantee. Expert Technicians. Warranty on all Repairs.']],
  ['How Reboot Repairs Works',['Step 1. Tell Us What\'s Wrong. Step 2. Send Your Device. Step 3. We Fix It. Step 4. You Play It.']],
  ['Repair Prices',['Fixed Price - No Surprises! Each supported console and controller has a listed fixed repair price.']],
  ['Prefer to head in store?',['Drop your device off at your nearest EB Games store for assessment.']],
  ['Need More Help?',['Visit Help & Support or contact customer service. Online repair bookings are currently unavailable; please visit your nearest store.']]]],
 ['/eb-protect','EB Protect','Protecting your consoles, games and controllers from life\'s little mishaps.',[
  ['What does EB Protect cover?',['EB Protect will cover any faults, failures, or accidental damage to your console, games, or controllers within your cover period. Your cover is stored in your EB World account, so there are no receipts to keep.']],
  ['T&C\'s apply. See staff for details. Available instore only.',['EB Protect cannot be purchased online.']]]],
 ['/events','Events','Get ready Planeswalker, MAGIC MONDAYS are here!',[
  ['Bring your favourite deck or buy a new one and meet some awesome new people',['Free to play Magic: The Gathering events at select stores.']],
  ['Upcoming Magic Monday Nights! Commander Format',['21 September from 5:30PM · 5 October from 5:30PM · 19 October from 5:30PM · 2 November from 5:30PM. Events running fortnightly unless there is a Public Holiday in your relevant area.']],
  ['NSW/ACT',['Bankstown, Batemans Bay, Bathurst, Burwood, Chatswood, Glendale, Greenhills, Gungahlin, Lake Haven, Liverpool, Mt Druitt, Narellan, Parramatta, Penrith, Rouse Hill, Settlement, Shellharbour, Sydney Central, Warriewood, Wetherill Park, Zing Blacktown']],
  ['QLD',['Australia Fair, Browns Plains, Capalaba Central, Carindale, Chermside, Coomera, Garden City, Hervey Bay, Ipswich, Kippa Ring, Morayfield, North Lakes, Robina, Rockhampton Fair, Sunshine Plaza, Toowoomba, Willows Townsville']],
  ['VIC/TAS/SA/WA',['Arndale, Bendigo Marketplace, Bunbury East, Craigieburn, Devonport, Doncaster, Fountain Gate, Gateway, Highpoint, Knox City, Karingal, Launceston, Melton, Midland, Mildura, Mirrabooka, Munno Para, Plenty Valley, Point Cook, Watergardens, Waurn Ponds, Whyalla']],
  ['Get ready for game night!',['Protect your decks with our range of TCG accessories.']]]],
 ['/marketplace','EB Market','More gear. More brands. More ways to level up your life.',[
  ['What is EB Market?',['EB Market brings together products from trusted third-party sellers across collectibles, tech, gaming furniture, simulation gear, manga, board games, homewares, cosplay, bags and movies.']],
  ['Shop a Huge Range of Refurbished iPhones!',['Refurbished phones from marketplace sellers.']],
  ['Create the ultimate battlestation with furniture designed for peak gaming performance.',['Gaming chairs and desks.']],
  ['Expand your collection with even more Board Games!',['Board games from marketplace sellers.']],
  ['All of our trusted sellers',['Marketplace items are sold and shipped by their sellers. Marketplace listings are currently unavailable. Please check back soon.']]]],
 ['/sell-your-tcg-singles','Sell Your TCG Singles','Sell your Pokémon, One Piece and Magic: The Gathering singles and get a valuation at your nearest store.',[
  ['How it Works',['Bring your cards to a participating store. Our team will assess them and make you an offer.']],
  ['What We Buy',['Singles from recent sets of Pokémon, One Piece and Magic: The Gathering.']],
  ['Card Condition Guide',['Cards are valued on condition. Damaged, altered or counterfeit cards can\'t be bought.']],
  ['Get Your Cards Ready',['Sort your cards and keep them sleeved to protect their condition.']],
  ['We are buying TCG in the following stores:',['Ask your local store whether it is participating. EB Games doesn\'t offer refunds or exchanges for change of mind on singles.']]]],
 ['/careers','Careers at EB Games','Join the team at Australia\'s leading specialty games retailer.',[
  ['Working at EB Games',['EB Games and ZiNG employ team members in stores, distribution and the support office around Australia. Roles and applications are listed on the EB Games careers site.']],
  ['Store roles',['Store team members help customers with games, trades, preorders and pop culture collectibles.']]]],
 ['/privacy','Privacy Policy','Electronics Boutique Australia Pty Ltd, trading as EB Games, explains what information it collects and how it is used.',[
  ['Kinds of Information Collected',['Contact, payment and browsing information collected from shoppers and website visitors.']],
  ['How We Collect Your Personal Information',['Through stores, the website, the EB World loyalty program, surveys, cookies and Google Analytics.']],
  ['How We Use Your Personal Information',['To process orders, run EB World and improve our services.']],
  ['Sharing of Information',['Within our corporate group, with service providers, and when the law requires it.']],
  ['Accessing and Verifying Your Personal Information',['You can request access to and correction of your personal information.']],
  ['Contacting EB Games',['Contact our privacy officer through Help & Support.']]]],
 ['/terms','Terms & Conditions','These terms govern use of the EB Games website and purchases made through it.',[
  ['Your acceptance and agreement to these terms',['By using the website you agree to these terms.']],
  ['Registered users; protecting login information',['Keep your EB World login details secure.']],
  ['Purchase and trade terms and conditions',['These terms and conditions are part of the terms and conditions of use.']],
  ['Online policies',['Delivery is limited to addresses in Australia and New Zealand. In-stock orders usually ship within two business days; arrival times depend on the delivery option chosen at checkout. Change-of-mind returns generally require unused items in original packaging, returned within 7 days, and exclude gift cards, digital products and opened hardware.']],
  ['Consumer Guarantees',['Faulty goods are covered by the Australian Consumer Law or New Zealand consumer law, which cannot be excluded.']],
  ['Online Safety',['Report unsafe content or behaviour to EB Games.']],
  ['New Zealand Customers',['New Zealand customers pay their own return shipping for change-of-mind returns.']]]],
 ['/ebworld/terms','EB World Terms & Conditions','The terms of the free EB World loyalty program and the paid EB World PLUS membership.',[
  ['Membership',['EB World membership is free. Members earn Carrots on purchases and level up for extra rewards.']],
  ['EB World PLUS',['PLUS is a paid 12-month membership with additional benefits; see the PLUS page for current benefits.']],
  ['Privacy',['Member information is handled under the EB Games Privacy Policy.']]]],
 ['/console-trade-deals','Console Trade Deals','Trade your old console and put the credit towards a new one.',[
  ['Choose your platform',['See the current Nintendo, PlayStation and Xbox trade deals. Trade values are confirmed in store.']]]],
 ['/switch-trade-deals','Nintendo Trade Deals','Trade your Nintendo Switch towards a Nintendo Switch 2.',[
  ['How it works',['Bring your console, accessories and identification to a store for assessment. Trade values are confirmed in store.']]]],
 ['/playstation-trade-deals','PlayStation Trade Deals','Trade your PlayStation console towards a new PlayStation 5.',[
  ['How it works',['Bring your console, accessories and identification to a store for assessment. Trade values are confirmed in store.']]]],
 ['/xbox-trade-deals','Xbox Trade Deals','Trade your Xbox console towards a new Xbox Series X|S.',[
  ['How it works',['Bring your console, accessories and identification to a store for assessment. Trade values are confirmed in store.']]]],
]

export const PLUS_BENEFITS = ['Buy 10 Get 1 FREE Boosters','Buy 10 Get 1 FREE Pop! Vinyls','Buy 10 Get 1 FREE Socks','Buy 10 Get 1 $70 OFF Clothing Items under $70 are FREE!','5% off digital currencies and content','5% extra Trade Value Stacks with your EB World Trade Bonus.','Double Carrots on every purchase Stacks with all promotional bonuses.','PLUS FREE GIFT when you join!']
