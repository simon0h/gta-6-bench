// Target.com everyday assortment for the default reference storefront.
//
// The GTA VI listings in data.js stay the only evidence-backed, graded rows (catalog-evidence.js).
// This shelf is a separate, purchasable-as-`kind: 'other'` assortment so the homepage, departments
// and search look like target.com instead of a single game page. Homepage rows reuse product names
// and prices seen on https://www.target.com/ (WebFetch, 2026-10-13: "Save on Halloween must-haves"
// and "Next-level fall newness"); everything else is a representative mix of real brands and
// models Target carries, with local prices, ratings, TCINs and stock. None of it is source evidence.
//
// Row: [title, brand, price, regularPrice|0, rating, ratingCount, 'Spec:Value|…', 'flags']
// flags: new (New at Target), clear (clearance), pre (preorder), sizes:S/M/L (size options),
// kw:extra search words, ps5|xbox|switch|switch-2 (game platform), console, game
const T = (type, dept, node, rows) => rows.map(r => ({ type, dept, node, r }))

const PHOTOS = { electronics: 'headphones', 'video-games': 'controller', 'home-decor': 'armchair', 'kitchen-dining': 'dutch-oven', grocery: 'apples', household: 'paper-towels', beauty: 'moisturizer', clothing: 'hoodie', baby: 'baby-bottle', toys: 'building-bricks', pets: 'dog-food', health: 'sunscreen', 'sports-outdoors': 'dumbbells-purple', 'school-office': 'notebooks', entertainment: 'book-orchard-house', 'patio-garden': 'tent-green', halloween: 'lantern-cream' }
export const SHELF_DEPARTMENTS = [
  ['electronics', 'Electronics', 'N-5xtg6', '/c/electronics/-/N-5xtg6', 'Sound, screens & everyday connections'],
  ['video-games', 'Video Games', 'N-5xtg5', '/c/video-games/-/N-5xtg5', 'Your next great game starts here'],
  ['home-decor', 'Home', 'N-5xtvd', '/c/home/-/N-5xtvd', 'Little updates. A whole new feeling.'],
  ['kitchen-dining', 'Kitchen & Dining', 'N-hz89j', '/c/kitchen-dining/-/N-hz89j', 'Make room for good food'],
  ['grocery', 'Grocery', 'N-5xt1a', '/c/grocery/-/N-5xt1a', 'Pantry favorites for busy days'],
  ['household', 'Household Essentials', 'N-5xsz1', '/c/household-essentials/-/N-5xsz1', 'Restock the everyday essentials'],
  ['beauty', 'Beauty', 'N-55r1x', '/c/beauty/-/N-55r1x', 'Refresh your daily routine'],
  ['clothing', 'Clothing, Shoes & Accessories', 'N-rdihz', '/c/clothing-shoes-accessories/-/N-rdihz', 'Everyday favorites, your way'],
  ['baby', 'Baby', 'N-5xtly', '/c/baby/-/N-5xtly', 'Everything for their first years'],
  ['toys', 'Toys', 'N-5xtb0', '/c/toys/-/N-5xtb0', 'Big ideas for little imaginations'],
  ['pets', 'Pets', 'N-5xt44', '/c/pets/-/N-5xt44', 'For their happiest everyday'],
  ['health', 'Health', 'N-5xu1n', '/c/health/-/N-5xu1n', 'Care for every day'],
  ['sports-outdoors', 'Sports & Outdoors', 'N-5xt85', '/c/sports-outdoors/-/N-5xt85', 'Get out there'],
  ['school-office', 'School & Office Supplies', 'N-5xsxr', '/c/school-office-supplies/-/N-5xsxr', 'Ready for every to-do'],
  ['entertainment', 'Books, Music & Movies', 'N-5xsxe', '/c/movies-music-books/-/N-5xsxe', 'Stories, sounds & screens'],
  ['patio-garden', 'Patio & Garden', 'N-5xtq9', '/c/patio-garden/-/N-5xtq9', 'Outdoor living, made easy'],
  ['halloween', 'Halloween', 'N-5xt2o', '/c/halloween/-/N-5xt2o', 'Costumes, candy & spooky decor'],
].map(([id, name, node, path, tagline]) => ({ id, name, node, path, tagline, photo: PHOTOS[id] }))

const ROWS = [
  // ---------------- Electronics ----------------
  ...T('TVs', 'electronics', 'N-5xtdw', [
    ['Samsung 65" Class S90D 4K OLED Smart TV - QN65S90D', 'Samsung', 1399.99, 1999.99, 4.6, 812, 'Screen Size:65 Inches|Resolution:4K UHD|Display Type:OLED|Refresh Rate:120Hz|Smart Platform:Tizen'],
    ['Samsung 55" Class DU7200 Crystal UHD 4K Smart TV - UN55DU7200', 'Samsung', 349.99, 399.99, 4.5, 2316, 'Screen Size:55 Inches|Resolution:4K UHD|Display Type:LED|Refresh Rate:60Hz|Smart Platform:Tizen'],
    ['LG 65" Class C5 Series OLED evo 4K Smart TV - OLED65C5PUA', 'LG', 1799.99, 2499.99, 4.7, 388, 'Screen Size:65 Inches|Resolution:4K UHD|Display Type:OLED|Refresh Rate:144Hz|Smart Platform:webOS', 'new'],
    ['LG 50" Class UA75 Series 4K UHD Smart TV - 50UA7500PUA', 'LG', 299.99, 0, 4.4, 517, 'Screen Size:50 Inches|Resolution:4K UHD|Display Type:LED|Smart Platform:webOS'],
    ['Sony 65" Class BRAVIA 7 II 4K Mini LED Smart Google TV - K65XR72M2', 'Sony', 1499.99, 1699.99, 4.7, 164, 'Screen Size:65 Inches|Resolution:4K UHD|Display Type:Mini LED|Smart Platform:Google TV', 'new'],
    ['TCL 55" Class QM6K 4K QD-Mini LED Smart Google TV - 55QM6K', 'TCL', 449.99, 599.99, 4.5, 702, 'Screen Size:55 Inches|Resolution:4K UHD|Display Type:QD-Mini LED|Refresh Rate:144Hz'],
    ['Hisense 75" Class U7 Series 4K Mini-LED ULED Smart Google TV - 75U7', 'Hisense', 899.99, 1199.99, 4.6, 451, 'Screen Size:75 Inches|Resolution:4K UHD|Display Type:Mini-LED|Refresh Rate:165Hz'],
    ['Roku 43" Class Select Series 4K HDR Smart RokuTV', 'Roku', 229.99, 0, 4.4, 1932, 'Screen Size:43 Inches|Resolution:4K UHD|Smart Platform:Roku TV'],
    ['Roku Streaming Stick 4K with Voice Remote', 'Roku', 39.99, 49.99, 4.7, 8840, 'Resolution:4K HDR|Connectivity:Wi-Fi 6|Remote:Voice remote', 'kw:streaming tech accessories'],
    ['Sonos Beam (Gen 2) Compact Smart Soundbar with Dolby Atmos', 'Sonos', 499.99, 0, 4.7, 1290, 'Connectivity:Wi-Fi, HDMI eARC|Voice Assistant:Amazon Alexa|Audio:Dolby Atmos', 'kw:speakers audio'],
  ]),
  ...T('Headphones', 'electronics', 'N-5xteg', [
    ['Apple AirPods Pro 3', 'Apple', 249.99, 0, 4.7, 3104, 'Noise Cancelling:Active Noise Cancellation|Battery Life:Up to 8 hours|Charging:USB-C MagSafe case|Water Resistance:IP57', 'new kw:airpods earbuds'],
    ['Apple AirPods 4 with Active Noise Cancellation', 'Apple', 179.99, 0, 4.6, 5421, 'Noise Cancelling:Active Noise Cancellation|Battery Life:Up to 5 hours|Charging:USB-C case', 'kw:airpods earbuds'],
    ['Apple AirPods 4', 'Apple', 119.99, 129.99, 4.6, 6012, 'Battery Life:Up to 5 hours|Charging:USB-C case|Water Resistance:IP54', 'kw:airpods earbuds'],
    ['Apple AirPods Max - Midnight', 'Apple', 499.99, 549.99, 4.6, 2210, 'Noise Cancelling:Active Noise Cancellation|Battery Life:Up to 20 hours|Connector:USB-C'],
    ['Beats Studio Pro Bluetooth Wireless Noise Cancelling Headphones - Black', 'Beats', 199.99, 349.99, 4.6, 3550, 'Noise Cancelling:Active Noise Cancellation|Battery Life:Up to 40 hours|Connectivity:Bluetooth Class 1'],
    ['Beats 360 Over-Ear Headphones with Performance Knit Cushions', 'Beats', 349.99, 0, 4.5, 41, 'Connectivity:Bluetooth|Cushions:Performance knit', 'new'],
    ['Beats Solo Buds True Wireless Earbuds - Matte Black', 'Beats', 69.99, 79.99, 4.3, 2875, 'Battery Life:Up to 18 hours|Connectivity:Bluetooth', 'kw:earbuds'],
    ['Sony WH-1000XM6 Wireless Noise Canceling Headphones - Black', 'Sony', 449.99, 0, 4.7, 612, 'Noise Cancelling:Active Noise Cancellation|Battery Life:Up to 30 hours|Connectivity:Bluetooth 5.3', 'new'],
    ['Bose QuietComfort Ultra Wireless Noise Cancelling Earbuds (2nd Gen)', 'Bose', 299.99, 0, 4.5, 830, 'Noise Cancelling:Active Noise Cancellation|Battery Life:Up to 6 hours|Water Resistance:IPX4', 'kw:earbuds'],
    ['JBL Tune 720BT Bluetooth Wireless Over-Ear Headphones - Black', 'JBL', 59.99, 89.99, 4.4, 1844, 'Battery Life:Up to 76 hours|Connectivity:Bluetooth 5.3'],
    ['Skullcandy Dime 3 True Wireless Bluetooth Earbuds', 'Skullcandy', 24.99, 29.99, 4.2, 3920, 'Battery Life:Up to 20 hours|Water Resistance:IPX4', 'kw:earbuds'],
  ]),
  ...T('Speakers', 'electronics', 'N-5xte2', [
    ['JBL Flip 7 Portable Bluetooth Waterproof Speaker - Black', 'JBL', 149.99, 0, 4.7, 488, 'Battery Life:Up to 16 hours|Water Resistance:IP68|Connectivity:Bluetooth 5.4', 'new'],
    ['JBL Charge 6 Portable Bluetooth Waterproof Speaker - Blue', 'JBL', 199.99, 0, 4.7, 290, 'Battery Life:Up to 28 hours|Water Resistance:IP68'],
    ['Bose SoundLink Flex Portable Bluetooth Speaker (2nd Gen) - Black', 'Bose', 119.99, 149.99, 4.7, 2611, 'Battery Life:Up to 12 hours|Water Resistance:IP67'],
    ['Amazon Echo Dot (5th Gen) Smart Speaker with Alexa - Charcoal', 'Amazon', 49.99, 0, 4.6, 7330, 'Voice Assistant:Amazon Alexa|Connectivity:Wi-Fi, Bluetooth', 'kw:smart home'],
    ['Crosley Cruiser Plus Bluetooth Portable Turntable - Black', 'Crosley', 79.99, 0, 4.3, 1104, 'Speeds:33 1/3, 45, 78 RPM|Connectivity:Bluetooth in and out', 'kw:record player vinyl'],
  ]),
  ...T('Cell Phones', 'electronics', 'N-5xte8', [
    ['Straight Talk Apple iPhone 16e (128GB) - Black', 'Straight Talk', 499.99, 0, 4.5, 211, 'Storage:128GB|Carrier:Straight Talk|Screen Size:6.1 Inches', 'kw:iphone apple prepaid'],
    ['Total by Verizon Samsung Galaxy A16 5G (128GB) - Black', 'Total by Verizon', 99.99, 179.99, 4.2, 389, 'Storage:128GB|Carrier:Total by Verizon|Screen Size:6.7 Inches', 'kw:prepaid phone'],
    ['Tracfone Motorola moto g 2025 (64GB) - Blue', 'Tracfone', 69.99, 0, 4.0, 145, 'Storage:64GB|Carrier:Tracfone|Screen Size:6.7 Inches', 'kw:prepaid phone'],
    ['Belkin BoostCharge Pro 2-in-1 Magnetic Wireless Charging Stand with Qi2', 'Belkin', 99.99, 129.99, 4.6, 402, 'Wattage:15W|Compatibility:iPhone, AirPods', 'kw:tech accessories charger'],
    ['Anker 3-Port 65W USB-C Wall Charger - White', 'Anker', 39.99, 0, 4.7, 1220, 'Ports:2 USB-C, 1 USB-A|Wattage:65W', 'kw:tech accessories charger'],
  ]),
  ...T('Wearable Tech', 'electronics', 'N-551ss', [
    ['Apple Watch Series 11 GPS 42mm Jet Black Aluminum Case with Black Sport Band - M/L', 'Apple', 399.99, 0, 4.7, 642, 'Case Size:42mm|Connectivity:GPS|Water Resistance:50m', 'new'],
    ['Apple Watch SE 3 GPS 40mm Midnight Aluminum Case with Midnight Sport Band - S/M', 'Apple', 249.99, 0, 4.7, 410, 'Case Size:40mm|Connectivity:GPS'],
    ['Fitbit Charge 6 Fitness Tracker - Obsidian/Black Aluminum', 'Fitbit', 129.99, 159.99, 4.3, 2208, 'Battery Life:Up to 7 days|Water Resistance:50m'],
    ['Samsung Galaxy Watch8 Bluetooth 40mm Smartwatch - Graphite', 'Samsung', 299.99, 349.99, 4.5, 177, 'Case Size:40mm|Connectivity:Bluetooth'],
    ['Garmin Forerunner 165 GPS Running Smartwatch - Black/Slate Gray', 'Garmin', 199.99, 249.99, 4.7, 530, 'Battery Life:Up to 11 days|Display:AMOLED'],
  ]),
  ...T('Computers', 'electronics', 'N-5xtfc', [
    ['Apple MacBook Air 13-inch Laptop with M4 chip, 16GB RAM, 256GB SSD - Midnight', 'Apple', 899.99, 999.99, 4.8, 712, 'Processor:Apple M4|Memory:16GB|Storage:256GB SSD|Screen Size:13.6 Inches', 'kw:laptop'],
    ['HP 15.6" Laptop - Intel Core i5 - 8GB RAM - 512GB SSD - Natural Silver (15-fd0)', 'HP', 449.99, 599.99, 4.3, 864, 'Processor:Intel Core i5|Memory:8GB|Storage:512GB SSD|Screen Size:15.6 Inches', 'kw:laptop'],
    ['Lenovo IdeaPad Slim 3 15.6" Laptop - AMD Ryzen 5 - 16GB RAM - 512GB SSD', 'Lenovo', 529.99, 649.99, 4.4, 318, 'Processor:AMD Ryzen 5|Memory:16GB|Storage:512GB SSD|Screen Size:15.6 Inches', 'kw:laptop'],
    ['Acer Chromebook 315 15.6" Laptop - Intel Celeron - 4GB RAM - 64GB eMMC', 'Acer', 179.99, 249.99, 4.2, 1530, 'Processor:Intel Celeron N4500|Memory:4GB|Storage:64GB eMMC|Operating System:ChromeOS', 'kw:laptop chromebook'],
    ['HP DeskJet 4255e All-in-One Wireless Color Inkjet Printer with 3 Months Instant Ink', 'HP', 59.99, 89.99, 4.0, 2470, 'Functions:Print, copy, scan|Connectivity:Wi-Fi', 'kw:printers printer'],
    ['Logitech MX Master 3S Wireless Performance Mouse - Graphite', 'Logitech', 99.99, 0, 4.7, 1402, 'Connectivity:Bluetooth, Logi Bolt|Battery:Rechargeable', 'kw:tech accessories'],
    ['Logitech K380 Multi-Device Bluetooth Keyboard - Rose', 'Logitech', 29.99, 39.99, 4.6, 2804, 'Connectivity:Bluetooth|Battery:2 AAA', 'kw:tech accessories'],
    ['SanDisk 1TB Extreme Portable SSD V2 - USB-C', 'SanDisk', 89.99, 129.99, 4.7, 960, 'Capacity:1TB|Interface:USB-C 3.2 Gen 2', 'kw:tech accessories storage'],
  ]),
  ...T('Tablets & E-readers', 'electronics', 'N-5xtf0', [
    ['Apple iPad 11-inch Wi-Fi 128GB (A16 chip) - Blue', 'Apple', 299.99, 349.99, 4.8, 1880, 'Storage:128GB|Screen Size:11 Inches|Chip:A16', 'kw:ipad tablet'],
    ['Apple iPad Air 11-inch Wi-Fi 128GB (M3 chip) - Space Gray', 'Apple', 549.99, 599.99, 4.8, 402, 'Storage:128GB|Screen Size:11 Inches|Chip:Apple M3', 'kw:ipad tablet'],
    ['Samsung Galaxy Tab A9+ 11" 64GB Wi-Fi Tablet - Graphite', 'Samsung', 179.99, 219.99, 4.5, 1210, 'Storage:64GB|Screen Size:11 Inches', 'kw:tablet'],
    ['Amazon Kindle Paperwhite (16GB) - Black', 'Amazon', 159.99, 0, 4.7, 3720, 'Storage:16GB|Screen Size:7 Inches|Display:Glare-free', 'kw:e-reader kindle'],
    ['Amazon Fire HD 10 Tablet 10.1" 32GB - Black', 'Amazon', 99.99, 139.99, 4.5, 2604, 'Storage:32GB|Screen Size:10.1 Inches', 'kw:tablet'],
  ]),
  ...T('Smart Home', 'electronics', 'N-556xa', [
    ['Ring Battery Video Doorbell - Satin Nickel', 'Ring', 99.99, 0, 4.5, 2730, 'Video:Head-to-toe HD|Power:Rechargeable battery'],
    ['Google Nest Thermostat - Snow', 'Google', 129.99, 0, 4.5, 1490, 'Compatibility:Works with Google Home|Power:C-wire or Nest Power Connector'],
    ['Blink Mini 2 1080p Plug-In Indoor/Outdoor Smart Security Camera - White', 'Blink', 39.99, 0, 4.4, 810, 'Video:1080p HD|Night Vision:Color'],
    ['Kasa Smart Wi-Fi Plug Mini 15A (4-Pack)', 'Kasa', 24.99, 29.99, 4.6, 5110, 'Count:4|Voice Assistant:Alexa, Google Assistant', 'kw:smart plug'],
    ['Philips Hue White and Color Ambiance A19 Smart LED Bulb Starter Kit (3-Pack)', 'Philips Hue', 129.99, 0, 4.6, 1950, 'Count:3 bulbs and Bridge|Connectivity:Bluetooth, Zigbee'],
  ]),
  ...T('Cameras', 'electronics', 'N-5xtez', [
    ['Polaroid Go Gen 3 Pokemon Camera Pikachu', 'Polaroid', 99.99, 0, 4.6, 58, 'Film Type:Polaroid Go film|Lens:Autofocus', 'new kw:pokemon instant camera'],
    ['Fujifilm Instax Mini 12 Instant Camera - Clay White', 'Fujifilm', 79.99, 0, 4.7, 4290, 'Film Type:Instax Mini|Exposure:Automatic', 'kw:instant camera'],
    ['GoPro HERO13 Black Action Camera', 'GoPro', 349.99, 399.99, 4.5, 320, 'Video Resolution:5.3K60|Water Resistance:33 ft'],
    ['DJI Mini 4K Drone Fly More Combo', 'DJI', 349.99, 449.99, 4.6, 214, 'Video Resolution:4K|Flight Time:Up to 31 minutes|Weight:249g', 'kw:drones drone'],
  ]),
  ...T('Batteries', 'electronics', 'N-5xtg6', [
    ['Energizer MAX AA Batteries - 24pk', 'Energizer', 19.99, 0, 4.8, 6020, 'Battery Size:AA|Count:24|Chemistry:Alkaline', 'kw:batteries'],
    ['Duracell Coppertop AAA Batteries - 16pk', 'Duracell', 16.99, 0, 4.8, 4410, 'Battery Size:AAA|Count:16|Chemistry:Alkaline', 'kw:batteries'],
  ]),

  // ---------------- Video Games (beside the three evidenced GTA VI rows) ----------------
  ...T('Video Game Consoles', 'video-games', 'N-5xtg5', [
    ['PlayStation 5 Console (Slim)', 'Sony', 549.99, 0, 4.8, 9810, 'Storage:1TB SSD|Disc Drive:Ultra HD Blu-ray|Included:DualSense wireless controller', 'console ps5 kw:ps5 playstation 5 consoles'],
    ['PlayStation 5 Digital Edition Console (Slim)', 'Sony', 499.99, 0, 4.8, 6240, 'Storage:1TB SSD|Disc Drive:None (digital only)', 'console ps5 kw:ps5 playstation 5 consoles'],
    ['PlayStation 5 Pro Console', 'Sony', 749.99, 0, 4.7, 1180, 'Storage:2TB SSD|Disc Drive:Sold separately', 'console ps5 kw:ps5 playstation 5 consoles'],
    ['Nintendo Switch 2 Console', 'Nintendo', 449.99, 0, 4.8, 3720, 'Storage:256GB|Screen Size:7.9 Inches|Included:Joy-Con 2 controllers, dock', 'console switch-2 kw:nintendo switch 2 consoles'],
    ['Nintendo Switch 2 + Mario Kart World Bundle', 'Nintendo', 499.99, 0, 4.9, 2880, 'Storage:256GB|Included Game:Mario Kart World (download)', 'console switch-2 kw:nintendo switch 2 consoles mario'],
    ['Nintendo Switch OLED Model with White Joy-Con', 'Nintendo', 349.99, 0, 4.8, 15400, 'Storage:64GB|Screen Size:7 Inches OLED', 'console switch kw:nintendo switch consoles'],
    ['Xbox Series X 1TB Console - Carbon Black', 'Microsoft', 649.99, 0, 4.8, 7020, 'Storage:1TB SSD|Disc Drive:4K UHD Blu-ray', 'console xbox kw:xbox series x consoles'],
    ['Xbox Series S 512GB Console - Robot White', 'Microsoft', 399.99, 0, 4.7, 8150, 'Storage:512GB SSD|Disc Drive:None (digital only)', 'console xbox kw:xbox series s consoles'],
    ['Meta Quest 3S 128GB All-in-One VR Headset', 'Meta', 299.99, 0, 4.5, 1540, 'Storage:128GB|Tracking:Inside-out, hand tracking', 'console kw:virtual reality vr'],
  ]),
  ...T('Video Games', 'video-games', 'N-5xtg5', [
    ['Mario Kart World - Nintendo Switch 2', 'Nintendo', 79.99, 0, 4.8, 1640, 'ESRB Rating:E - Everyone|Video Game Genre:Racing|Players:1-24', 'game switch-2 kw:nintendo switch 2 super mario'],
    ['Donkey Kong Bananza - Nintendo Switch 2', 'Nintendo', 69.99, 0, 4.8, 720, 'ESRB Rating:E10+ - Everyone 10+|Video Game Genre:Action, Adventure', 'game switch-2 kw:nintendo switch 2'],
    ['Pokémon Legends: Z-A - Nintendo Switch 2', 'Nintendo', 69.99, 0, 4.7, 960, 'ESRB Rating:E10+ - Everyone 10+|Video Game Genre:Role-Playing', 'game switch-2 kw:pokemon nintendo switch 2'],
    ['Kirby Air Riders - Nintendo Switch 2', 'Nintendo', 69.99, 0, 4.6, 310, 'ESRB Rating:E - Everyone|Video Game Genre:Racing, Action', 'game switch-2 kw:nintendo switch 2'],
    ['Super Mario Party Jamboree + Jamboree TV - Nintendo Switch 2 Edition', 'Nintendo', 79.99, 0, 4.6, 260, 'ESRB Rating:E - Everyone|Video Game Genre:Party', 'game switch-2 kw:super mario nintendo switch 2'],
    ['Minecraft - Nintendo Switch', 'Mojang', 29.99, 0, 4.8, 12100, 'ESRB Rating:E10+ - Everyone 10+|Video Game Genre:Sandbox', 'game switch kw:minecraft nintendo switch'],
    ['Animal Crossing: New Horizons - Nintendo Switch', 'Nintendo', 59.99, 0, 4.9, 9430, 'ESRB Rating:E - Everyone|Video Game Genre:Simulation', 'game switch kw:nintendo switch'],
    ['Ghost of Yōtei - PlayStation 5', 'Sony', 69.99, 0, 4.8, 1220, 'ESRB Rating:M - Mature 17+|Video Game Genre:Action, Adventure', 'game ps5 kw:ghost of yotei ps5 playstation 5'],
    ["Marvel's Spider-Man 2 - PlayStation 5", 'Sony', 49.99, 69.99, 4.8, 3900, 'ESRB Rating:T - Teen|Video Game Genre:Action, Adventure', 'game ps5 kw:spiderman ps5 playstation 5'],
    ['Call of Duty: Black Ops 7 - PlayStation 5', 'Activision', 69.99, 0, 4.2, 840, 'ESRB Rating:M - Mature 17+|Video Game Genre:Shooter', 'game ps5 kw:call of duty cod ps5 playstation 5'],
    ['Call of Duty: Black Ops 7 - Xbox Series X|S', 'Activision', 69.99, 0, 4.2, 610, 'ESRB Rating:M - Mature 17+|Video Game Genre:Shooter', 'game xbox kw:call of duty cod xbox series x'],
    ['Battlefield 6 - PlayStation 5', 'Electronic Arts', 49.99, 69.99, 4.4, 1310, 'ESRB Rating:M - Mature 17+|Video Game Genre:Shooter', 'game ps5 kw:ps5 playstation 5'],
    ['EA Sports Madden NFL 27 - PlayStation 5', 'Electronic Arts', 69.99, 0, 4.1, 290, 'ESRB Rating:E - Everyone|Video Game Genre:Sports', 'game ps5 kw:madden football ps5 playstation 5 video game new releases'],
    ['NBA 2K27 - Xbox Series X|S', '2K', 69.99, 0, 4.0, 180, 'ESRB Rating:E - Everyone|Video Game Genre:Sports', 'game xbox kw:basketball xbox series x video game new releases'],
    ['EA Sports FC 26 - PlayStation 5', 'Electronic Arts', 39.99, 69.99, 4.2, 960, 'ESRB Rating:E - Everyone|Video Game Genre:Sports', 'game ps5 kw:soccer fifa ps5 playstation 5'],
    ['Resident Evil Requiem - PlayStation 5', 'Capcom', 59.99, 69.99, 4.7, 540, 'ESRB Rating:M - Mature 17+|Video Game Genre:Survival Horror', 'game ps5 kw:ps5 playstation 5'],
    ['Borderlands 4 - Xbox Series X', '2K', 49.99, 69.99, 4.3, 420, 'ESRB Rating:M - Mature 17+|Video Game Genre:Shooter, Role-Playing', 'game xbox kw:xbox series x'],
    ['Hogwarts Legacy - PlayStation 5', 'Warner Bros. Games', 29.99, 0, 4.8, 6800, 'ESRB Rating:T - Teen|Video Game Genre:Action, Role-Playing', 'game ps5 kw:harry potter ps5 playstation 5'],
    ['Final Fantasy VII Rebirth - PlayStation 5', 'Square Enix', 39.99, 0, 4.8, 2100, 'ESRB Rating:T - Teen|Video Game Genre:Role-Playing', 'game ps5 kw:final fantasy ps5 playstation 5'],
    ['Fortnite Minty Legends Pack - Nintendo Switch', 'Epic Games', 29.99, 0, 4.4, 980, 'Format:Download code in box|Video Game Genre:Battle Royale', 'game switch kw:fortnite nintendo switch'],
    ['Elden Ring Nightreign - PlayStation 5', 'Bandai Namco', 39.99, 0, 4.5, 620, 'ESRB Rating:M - Mature 17+|Video Game Genre:Action, Role-Playing', 'game ps5 kw:ps5 playstation 5'],
    ['Minecraft Legends: Deluxe Edition - PC', 'Mojang', 29.99, 39.99, 4.3, 120, 'Format:Download code|Platform:Windows PC', 'game kw:minecraft pc games pc gaming'],
  ]),
  ...T('Video Game Accessories', 'video-games', 'N-5xtg5', [
    ['DualSense Wireless Controller for PlayStation 5 - Midnight Black', 'Sony', 74.99, 0, 4.7, 8820, 'Connectivity:Bluetooth, USB-C|Features:Haptic feedback, adaptive triggers', 'ps5 kw:controller ps5 playstation 5 video game accessories'],
    ['Nintendo Switch 2 Pro Controller', 'Nintendo', 84.99, 0, 4.7, 960, 'Connectivity:Bluetooth, USB-C|Features:Assignable GL/GR buttons', 'switch-2 kw:controller nintendo switch 2 video game accessories'],
    ['Xbox Wireless Controller - Carbon Black', 'Microsoft', 64.99, 0, 4.7, 11200, 'Connectivity:Xbox Wireless, Bluetooth|Battery:2 AA', 'xbox kw:controller xbox series x video game accessories'],
    ['Turtle Beach Stealth 600 Gen 3 Wireless Gaming Headset for PlayStation', 'Turtle Beach', 99.99, 0, 4.4, 640, 'Connectivity:2.4GHz wireless, Bluetooth|Battery Life:Up to 80 hours', 'ps5 kw:gaming headset video game accessories pc gaming'],
    ['PDP Nintendo Switch 2 Travel Case - Black', 'PDP', 24.99, 0, 4.5, 210, 'Compatibility:Nintendo Switch 2|Storage:Holds 18 game cards', 'switch-2 kw:case nintendo switch 2 video game accessories'],
    ['PlayStation Portal Remote Player for PS5', 'Sony', 199.99, 0, 4.5, 1840, 'Screen Size:8 Inches|Connectivity:Wi-Fi', 'ps5 kw:ps5 playstation 5 video game accessories'],
    ['Razer BlackShark V2 X Wired Gaming Headset', 'Razer', 39.99, 59.99, 4.5, 1330, 'Connectivity:3.5mm wired|Compatibility:PC, PS5, Xbox, Switch', 'kw:gaming headset pc gaming video game accessories'],
    ['PlayStation Store $50 Gift Card (Digital)', 'Sony', 50, 0, 4.8, 3010, 'Delivery:Email|Value:$50', 'ps5 kw:gift card gaming gift cards ps5 playstation'],
    ['Nintendo eShop $35 Gift Card (Digital)', 'Nintendo', 35, 0, 4.8, 2600, 'Delivery:Email|Value:$35', 'switch kw:gift card gaming gift cards nintendo'],
  ]),
  ...T('Video Game Collectibles', 'video-games', 'N-5xtg5', [
    ['Funko POP! Games: Five Nights at Freddy\'s - Freddy Fazbear Vinyl Figure', 'Funko', 12.99, 0, 4.8, 860, 'Height:4 Inches|Material:Vinyl', 'kw:video game collectibles figure'],
    ['amiibo Link (Tears of the Kingdom) - The Legend of Zelda Series', 'Nintendo', 29.99, 0, 4.8, 520, 'Compatibility:Nintendo Switch, Nintendo Switch 2', 'kw:video game collectibles zelda amiibo'],
  ]),

  // ---------------- Home ----------------
  ...T('Bedding', 'home-decor', 'N-5xtvd', [
    ['Fairisle Knit Throw with Faux Fur Ivory - Threshold', 'Threshold', 35, 0, 4.7, 96, 'Dimensions:50" W x 60" L|Material:Acrylic, polyester faux fur', 'new kw:blanket throw fall'],
    ['Washed Cotton Sateen Comforter & Sham Set - Threshold', 'Threshold', 120, 0, 4.5, 1220, 'Size:Full/Queen|Material:100% Cotton', 'kw:comforter bedding'],
    ['300 Thread Count Ultra Soft Sheet Set - Threshold', 'Threshold', 30, 40, 4.5, 3480, 'Size:Queen|Material:Cotton blend', 'kw:sheets bedding'],
    ['Cozy Plush Throw Blanket - Room Essentials', 'Room Essentials', 10, 0, 4.7, 8200, 'Dimensions:50" W x 60" L|Material:100% Polyester', 'kw:blanket throw dorm'],
    ['Standard Bed Pillow Set of 2 - Room Essentials', 'Room Essentials', 12, 0, 4.2, 2900, 'Count:2|Fill:Polyester', 'kw:pillows'],
  ]),
  ...T('Bath', 'home-decor', 'N-5xtvc', [
    ['Performance Plus Bath Towel - Threshold', 'Threshold', 10, 0, 4.6, 5100, 'Dimensions:30" W x 56" L|Material:Cotton', 'kw:towels'],
    ['Quick Dry Bath Rug - Threshold', 'Threshold', 15, 0, 4.4, 1310, 'Dimensions:20" x 34"|Material:Cotton', 'kw:bath mat'],
    ['Fabric Shower Curtain Stripe - Threshold', 'Threshold', 25, 0, 4.5, 640, 'Dimensions:72" x 72"|Material:Cotton'],
  ]),
  ...T('Home Decor', 'home-decor', 'N-5xtvd', [
    ['4"x4" Marble Frame Natural - Threshold', 'Threshold', 18, 0, 4.6, 34, 'Photo Size:4" x 4"|Material:Marble', 'new kw:picture frame'],
    ['Printer\'s Accent Chair Green Foliage - Threshold designed with Studio McGee', 'Threshold designed with Studio McGee', 700, 0, 4.5, 12, 'Dimensions:30" W x 33" D x 34" H|Material:Polyester, wood', 'new kw:accent chair furniture'],
    ['Ceramic Table Lamp with Linen Shade - Threshold designed with Studio McGee', 'Threshold designed with Studio McGee', 50, 0, 4.6, 410, 'Height:21 Inches|Bulb Type:E26, sold separately', 'kw:lamp lighting'],
    ['Woven Faux Olive Tree in Pot - Threshold designed with Studio McGee', 'Threshold designed with Studio McGee', 60, 0, 4.4, 280, 'Height:5 ft|Material:Plastic', 'kw:artificial plant'],
    ['Woodland Spice 3-Wick Jar Candle 14oz - Threshold', 'Threshold', 15, 0, 4.6, 930, 'Burn Time:40 Hours|Scent:Woodland spice', 'kw:candle fall'],
    ['Boy Smells Essentials Candle Rosalita 8.5oz - Target Beauty Studio', 'Boy Smells', 30, 0, 4.5, 41, 'Burn Time:50 Hours|Wax:Coconut and beeswax blend', 'new kw:candle'],
    ['5\'x7\' Persian Style Woven Area Rug - Threshold', 'Threshold', 120, 160, 4.4, 520, 'Dimensions:5\' x 7\'|Material:Polypropylene', 'kw:rug rugs'],
  ]),
  ...T('Furniture', 'home-decor', 'N-5xtnr', [
    ['Carson 5 Shelf Horizontal Bookcase - Threshold', 'Threshold', 140, 160, 4.4, 2340, 'Dimensions:31.5" W x 11.7" D x 72" H|Material:Engineered wood', 'kw:bookcase shelf'],
    ['Loring Wood Writing Desk - Threshold', 'Threshold', 180, 0, 4.5, 380, 'Dimensions:42" W x 22" D x 30" H|Assembly:Required', 'kw:desk home office'],
    ['Accent Kitchen Bar Stool - Room Essentials', 'Room Essentials', 40, 0, 4.2, 690, 'Seat Height:24 Inches|Material:Metal', 'kw:stool'],
  ]),
  ...T('Storage & Organization', 'home-decor', 'N-5xto8', [
    ['Sterilite 18qt Latching Storage Box Clear', 'Sterilite', 6.49, 0, 4.7, 4120, 'Capacity:18 Quarts|Material:Plastic', 'kw:storage bin tote'],
    ['11" Fabric Cube Storage Bin - Brightroom', 'Brightroom', 5, 0, 4.7, 9800, 'Dimensions:11" x 11" x 11"|Material:Fabric', 'kw:storage bin'],
    ['3 Tier Rolling Utility Cart - Brightroom', 'Brightroom', 30, 0, 4.6, 6640, 'Tiers:3|Material:Steel', 'kw:cart'],
  ]),

  // ---------------- Kitchen & Dining ----------------
  ...T('Small Appliances', 'kitchen-dining', 'N-hz89j', [
    ['Ninja Air Fryer Pro 4-in-1 5qt - AF141', 'Ninja', 89.99, 129.99, 4.8, 6420, 'Capacity:5 Quarts|Functions:Air fry, roast, reheat, dehydrate', 'kw:air fryer'],
    ['KitchenAid Artisan 5qt Tilt-Head Stand Mixer - KSM150PS', 'KitchenAid', 349.99, 449.99, 4.8, 9320, 'Capacity:5 Quarts|Speeds:10', 'kw:stand mixer'],
    ['Keurig K-Mini Single-Serve K-Cup Pod Coffee Maker', 'Keurig', 69.99, 99.99, 4.5, 15000, 'Capacity:6-12 oz single serve|Water Reservoir:Single serve', 'kw:coffee maker'],
    ['Nespresso Vertuo Pop+ Coffee and Espresso Machine by Breville', 'Nespresso', 129.99, 0, 4.6, 1030, 'Capacity:Single serve|Pod Type:Vertuo', 'kw:coffee maker espresso'],
    ['Ninja Professional Plus Blender with Auto-iQ - BN701', 'Ninja', 99.99, 0, 4.7, 4010, 'Capacity:72 oz|Wattage:1400W', 'kw:blender'],
    ['Instant Pot 6qt Duo 7-in-1 Electric Pressure Cooker', 'Instant Pot', 79.99, 99.99, 4.7, 21400, 'Capacity:6 Quarts|Functions:7-in-1', 'kw:pressure cooker'],
    ['Hamilton Beach 2 Slice Toaster - Black', 'Hamilton Beach', 21.99, 0, 4.4, 2380, 'Slots:2|Settings:Bagel, defrost, cancel'],
  ]),
  ...T('Cookware', 'kitchen-dining', 'N-hz89j', [
    ['Lodge 10.25" Cast Iron Skillet', 'Lodge', 24.99, 0, 4.8, 8200, 'Diameter:10.25 Inches|Material:Cast iron', 'kw:pan skillet'],
    ['Caraway Nonstick Ceramic 4pc Cookware Set - Sage', 'Caraway', 395, 0, 4.6, 480, 'Pieces:4 pans, 4 lids|Material:Ceramic-coated aluminum'],
    ['10pc Nonstick Aluminum Cookware Set - Figmint', 'Figmint', 80, 0, 4.4, 690, 'Pieces:10|Material:Aluminum', 'kw:pots pans'],
    ['Enameled Cast Iron 5qt Round Dutch Oven - Figmint', 'Figmint', 60, 0, 4.7, 1250, 'Capacity:5 Quarts|Material:Enameled cast iron'],
  ]),
  ...T('Drinkware', 'kitchen-dining', 'N-hz89j', [
    ['Stanley 40oz Stainless Steel H2.0 FlowState Quencher Tumbler - Rose Quartz', 'Stanley', 45, 0, 4.8, 9930, 'Capacity:40 fl oz|Material:Stainless steel', 'kw:stanley cup tumbler'],
    ['Stanley 30oz Stainless Steel H2.0 FlowState Quencher Tumbler - Charcoal', 'Stanley', 35, 0, 4.8, 5120, 'Capacity:30 fl oz|Material:Stainless steel', 'kw:stanley cup tumbler'],
    ['Corkcicle 40 fl oz Cruiser Rifle Paper Stainless Steel Water Bottle - Garden Party Cream', 'Corkcicle', 50, 0, 4.6, 22, 'Capacity:40 fl oz|Material:Stainless steel', 'new kw:tumbler water bottle'],
    ['Owala FreeSip 24oz Stainless Steel Water Bottle - Denim', 'Owala', 27.99, 0, 4.8, 7440, 'Capacity:24 fl oz|Material:Stainless steel', 'kw:water bottle'],
    ['16oz Stoneware Mug - Threshold', 'Threshold', 4, 0, 4.6, 2900, 'Capacity:16 fl oz|Material:Stoneware', 'kw:mug coffee'],
  ]),
  ...T('Dinnerware & Food Storage', 'kitchen-dining', 'N-hz89j', [
    ['12pc Stoneware Dinnerware Set - Threshold', 'Threshold', 50, 0, 4.6, 1840, 'Pieces:12|Material:Stoneware', 'kw:dishes plates'],
    ['Pyrex 18pc Simply Store Glass Food Storage Container Set', 'Pyrex', 29.99, 39.99, 4.7, 6100, 'Pieces:18|Material:Glass', 'kw:food storage'],
    ['Rubbermaid 26pc Brilliance Food Storage Container Set', 'Rubbermaid', 39.99, 0, 4.7, 3320, 'Pieces:26|Material:Tritan plastic', 'kw:food storage'],
  ]),

  // ---------------- Grocery ----------------
  ...T('Produce', 'grocery', 'N-u7fty', [
    ['Honeycrisp Apples - 3lb Bag - Good & Gather', 'Good & Gather', 5.99, 0, 4.4, 1210, 'Net Weight:3 lb|Storage:Refrigerate', 'kw:apples fruit'],
    ['Bananas - each', 'Good & Gather', 0.25, 0, 4.3, 3020, 'Count:1|Storage:Room temperature', 'kw:fruit'],
    ['Organic Baby Spinach - 5oz - Good & Gather', 'Good & Gather', 2.99, 0, 4.4, 980, 'Net Weight:5 oz|Organic:USDA Organic', 'kw:salad greens'],
    ['Avocados - 4ct Bag', 'Good & Gather', 4.99, 0, 4.2, 870, 'Count:4|Storage:Room temperature until ripe', 'kw:fruit'],
  ]),
  ...T('Meat & Seafood', 'grocery', 'N-5xsyh', [
    ['Boneless & Skinless Chicken Breasts - 2.5lb - Good & Gather', 'Good & Gather', 10.49, 0, 4.4, 1430, 'Net Weight:2.5 lb|Storage:Keep refrigerated'],
    ['85/15 Ground Beef - 1lb - Good & Gather', 'Good & Gather', 6.49, 0, 4.5, 920, 'Net Weight:1 lb|Storage:Keep refrigerated'],
    ['Atlantic Salmon Fillet - 1lb - Good & Gather', 'Good & Gather', 10.99, 0, 4.2, 410, 'Net Weight:1 lb|Storage:Keep refrigerated', 'kw:fish seafood'],
  ]),
  ...T('Dairy', 'grocery', 'N-5xszm', [
    ['2% Reduced Fat Milk - 1gal - Good & Gather', 'Good & Gather', 3.69, 0, 4.6, 2210, 'Size:1 gallon|Storage:Keep refrigerated'],
    ['Grade A Large Eggs - 12ct - Good & Gather', 'Good & Gather', 3.19, 0, 4.6, 1840, 'Count:12|Storage:Keep refrigerated'],
    ['Chobani Plain Nonfat Greek Yogurt - 32oz', 'Chobani', 6.29, 0, 4.7, 760, 'Size:32 oz|Storage:Keep refrigerated', 'kw:yogurt'],
    ['Tillamook Medium Cheddar Cheese Block - 8oz', 'Tillamook', 4.49, 0, 4.8, 1120, 'Size:8 oz|Storage:Keep refrigerated', 'kw:cheese'],
  ]),
  ...T('Frozen Foods', 'grocery', 'N-5xszd', [
    ['DiGiorno Rising Crust Pepperoni Frozen Pizza - 27.5oz', 'DiGiorno', 7.79, 8.79, 4.6, 1310, 'Size:27.5 oz|Storage:Keep frozen', 'kw:pizza'],
    ['Ben & Jerry\'s Half Baked Ice Cream - 16oz', 'Ben & Jerry\'s', 5.99, 0, 4.8, 880, 'Size:1 pint|Storage:Keep frozen', 'kw:ice cream'],
    ['Eggo Homestyle Frozen Waffles - 24ct', 'Eggo', 6.49, 0, 4.7, 670, 'Count:24|Storage:Keep frozen', 'kw:breakfast waffles'],
  ]),
  ...T('Snacks', 'grocery', 'N-5xsy9', [
    ['Doritos Nacho Cheese Flavored Tortilla Chips - 9.25oz', 'Doritos', 5.29, 0, 4.8, 3400, 'Size:9.25 oz', 'kw:chips'],
    ['Goldfish Cheddar Crackers - 30oz Carton', 'Pepperidge Farm', 9.99, 0, 4.8, 2210, 'Size:30 oz', 'kw:crackers'],
    ['BonBon A Swedish Candy Moomin Strawberry & Blueberry Foam Clouds - 4.1oz', 'BonBon', 4.99, 0, 4.6, 19, 'Size:4.1 oz', 'new kw:candy'],
    ['Oreo Chocolate Sandwich Cookies Family Size - 18.12oz', 'Oreo', 5.79, 0, 4.8, 3900, 'Size:18.12 oz', 'kw:cookies'],
    ['Kind Dark Chocolate Nuts & Sea Salt Bars - 6ct', 'Kind', 6.49, 0, 4.6, 1400, 'Count:6 bars', 'kw:snack bars'],
  ]),
  ...T('Beverages & Pantry', 'grocery', 'N-5xt1a', [
    ['Starbucks Pike Place Medium Roast Ground Coffee - 12oz', 'Starbucks', 9.99, 11.49, 4.7, 2860, 'Size:12 oz|Roast:Medium', 'kw:coffee'],
    ['Coca-Cola Soda - 12pk/12 fl oz Cans', 'Coca-Cola', 8.99, 0, 4.8, 2040, 'Count:12 cans|Size:12 fl oz each', 'kw:soda'],
    ['Purified Water - 24pk/16.9 fl oz Bottles - Good & Gather', 'Good & Gather', 3.99, 0, 4.7, 4200, 'Count:24 bottles', 'kw:water'],
    ['Cheerios Toasted Whole Grain Oat Cereal - 18oz', 'General Mills', 5.49, 0, 4.8, 1630, 'Size:18 oz', 'kw:cereal breakfast'],
    ['Count Chocula Halloween Breakfast Cereal - 12.1oz - Monster Cereal', 'General Mills', 3.99, 0, 4.7, 310, 'Size:12.1 oz', 'kw:cereal halloween monster'],
    ['Barilla Spaghetti Pasta - 16oz', 'Barilla', 1.99, 0, 4.8, 1420, 'Size:16 oz', 'kw:pasta'],
  ]),

  // ---------------- Household Essentials ----------------
  ...T('Laundry Care', 'household', 'N-5xsyr', [
    ['Tide Original Liquid Laundry Detergent - 92 fl oz', 'Tide', 13.99, 0, 4.8, 5300, 'Size:92 fl oz|Loads:64', 'kw:detergent laundry'],
    ['Tide PODS Spring Meadow Laundry Detergent Pacs - 81ct', 'Tide', 21.99, 24.99, 4.8, 6100, 'Count:81 pacs', 'kw:detergent laundry'],
    ['Downy Unstopables In-Wash Scent Booster Beads Fresh - 20.1oz', 'Downy', 15.99, 0, 4.8, 3420, 'Size:20.1 oz', 'kw:laundry scent'],
    ['Bounce Outdoor Fresh Dryer Sheets - 240ct', 'Bounce', 9.99, 0, 4.8, 2020, 'Count:240', 'kw:laundry'],
  ]),
  ...T('Paper Towels', 'household', 'N-4y1o4', [
    ['Bounty Select-A-Size Paper Towels - 6 Double Rolls', 'Bounty', 13.49, 0, 4.8, 6400, 'Count:6 double rolls', 'kw:paper towels'],
    ['Make-A-Size Paper Towels - 12 Mega Rolls - up&up', 'up&up', 17.99, 0, 4.5, 2900, 'Count:12 mega rolls', 'kw:paper towels'],
    ['Bounty Select-A-Size Paper Towels - 12 Double Rolls', 'Bounty', 25.99, 27.99, 4.8, 3310, 'Count:12 double rolls', 'kw:paper towels'],
    ['Viva Multi-Surface Cloth Choose-A-Sheet Paper Towels - 6 Big Rolls', 'Viva', 11.99, 0, 4.7, 2140, 'Count:6 big rolls', 'kw:paper towels'],
    ['Brawny Tear-A-Square Paper Towels - 6 Double Rolls', 'Brawny', 10.99, 0, 4.7, 1530, 'Count:6 double rolls', 'kw:paper towels'],
    ['Sparkle Pick-A-Size Paper Towels - 6 Double Rolls', 'Sparkle', 8.99, 0, 4.6, 974, 'Count:6 double rolls', 'kw:paper towels'],
  ]),
  ...T('Toilet Paper', 'household', 'N-5xsyk', [
    ['Charmin Ultra Soft Toilet Paper - 18 Mega Rolls', 'Charmin', 24.99, 0, 4.8, 7300, 'Count:18 mega rolls', 'kw:toilet paper'],
    ['Soft & Strong Toilet Paper - 24 Mega Rolls - up&up', 'up&up', 19.99, 0, 4.5, 3800, 'Count:24 mega rolls', 'kw:toilet paper'],
    ['Cottonelle Ultra Comfort Toilet Paper - 12 Mega Rolls', 'Cottonelle', 15.49, 0, 4.7, 4280, 'Count:12 mega rolls', 'kw:toilet paper'],
    ['Scott 1000 Sheets Per Roll Toilet Paper - 12 Rolls', 'Scott', 11.99, 0, 4.7, 5160, 'Count:12 rolls', 'kw:toilet paper'],
    ['Quilted Northern Ultra Plush Toilet Paper - 12 Mega Rolls', 'Quilted Northern', 17.99, 19.49, 4.7, 2090, 'Count:12 mega rolls', 'kw:toilet paper'],
  ]),
  ...T('Cleaning Supplies', 'household', 'N-5xsyy', [
    ['Clorox Disinfecting Wipes Value Pack Fresh Scent - 3pk/225ct', 'Clorox', 13.99, 0, 4.8, 8100, 'Count:3 packs, 75 wipes each', 'kw:wipes cleaning'],
    ['Dawn Ultra Original Scent Dishwashing Liquid Dish Soap - 28 fl oz', 'Dawn', 4.99, 0, 4.8, 4200, 'Size:28 fl oz', 'kw:dish soap'],
    ['Cascade Platinum Plus Dishwasher Pods Fresh - 62ct', 'Cascade', 23.99, 26.99, 4.8, 3010, 'Count:62', 'kw:dishwasher'],
    ['Swiffer Sweeper Dry + Wet Sweeping Kit', 'Swiffer', 16.99, 0, 4.7, 5200, 'Includes:1 sweeper, 7 dry cloths, 3 wet cloths', 'kw:mop floor care'],
    ['Mrs. Meyer\'s Clean Day Multi-Surface Everyday Cleaner Lemon Verbena - 16 fl oz', 'Mrs. Meyer\'s Clean Day', 4.99, 0, 4.7, 1900, 'Size:16 fl oz', 'kw:cleaner spray'],
    ['Glad ForceFlex Tall Kitchen Drawstring Trash Bags OdorShield - 13 Gallon - 80ct', 'Glad', 16.99, 0, 4.7, 5100, 'Capacity:13 gallons|Count:80', 'kw:trash bags'],
  ]),

  // ---------------- Beauty & Personal Care ----------------
  ...T('Makeup', 'beauty', 'N-5xu1e', [
    ['e.l.f. Halo Glow Liquid Filter - 1.06 fl oz', 'e.l.f.', 14, 0, 4.4, 3800, 'Size:1.06 fl oz|Finish:Radiant', 'kw:foundation'],
    ['Maybelline Lash Sensational Sky High Washable Mascara - Very Black', 'Maybelline', 12.99, 0, 4.4, 9100, 'Size:0.24 fl oz|Formula:Washable'],
    ['e.l.f. Shimmer Glimmer Hair Stick - 0.7oz', 'e.l.f.', 8, 0, 4.3, 26, 'Size:0.7 oz', 'new kw:hair'],
    ['ColourPop Pokemon Lip Balm Umbreon - 0.49oz', 'ColourPop', 12, 0, 4.5, 17, 'Size:0.49 oz', 'new kw:pokemon lip balm'],
    ['NYX Professional Makeup Butter Gloss - Crème Brûlée', 'NYX Professional Makeup', 6, 0, 4.6, 5300, 'Size:0.27 fl oz|Finish:Sheer', 'kw:lip gloss'],
    ['Starface Peach Star Lip Balm - 0.15 fl oz', 'Starface', 6.99, 0, 4.4, 22, 'Size:0.15 fl oz', 'new kw:lip balm'],
  ]),
  ...T('Skincare', 'beauty', 'N-5xtzj', [
    ['CeraVe Moisturizing Cream for Normal to Dry Skin - 16oz', 'CeraVe', 18.99, 0, 4.8, 12100, 'Size:16 oz|Skin Type:Normal to dry', 'kw:moisturizer lotion'],
    ['CeraVe Hydrating Facial Cleanser - 16 fl oz', 'CeraVe', 16.99, 0, 4.8, 8700, 'Size:16 fl oz', 'kw:face wash'],
    ['La Roche-Posay Anthelios Melt-In Milk Sunscreen SPF 60 - 5 fl oz', 'La Roche-Posay', 37.99, 0, 4.7, 1400, 'Size:5 fl oz|SPF:60', 'kw:sunscreen'],
    ['The Ordinary Niacinamide 10% + Zinc 1% Serum - 1 fl oz', 'The Ordinary', 6.50, 0, 4.4, 4300, 'Size:1 fl oz', 'kw:serum'],
    ['Bubble Skincare Slam Dunk Hydrating Face Moisturizer - 1.7 fl oz', 'Bubble', 19.99, 0, 4.5, 2110, 'Size:1.7 fl oz', 'kw:moisturizer'],
  ]),
  ...T('Hair Care', 'beauty', 'N-5xu0k', [
    ['Pantene Pro-V Deep Nourishing Leave-In Cream to Mist - 5oz', 'Pantene', 14.99, 0, 4.4, 31, 'Size:5 oz', 'new kw:leave-in conditioner'],
    ['OGX Renewing + Argan Oil of Morocco Shampoo - 13 fl oz', 'OGX', 8.99, 0, 4.6, 6100, 'Size:13 fl oz', 'kw:shampoo'],
    ['Dyson Airwrap Multi-Styler and Dryer - Nickel/Copper', 'Dyson', 599.99, 0, 4.6, 1100, 'Attachments:6|Heat Settings:4', 'kw:hair dryer styler'],
    ['SLICKHAIR Ultimate Set Hair Wax - Target Beauty Studio', 'SLICKHAIR', 35, 0, 4.3, 14, 'Includes:Wax stick, styling comb', 'new kw:hair'],
  ]),
  ...T('Fragrance', 'beauty', 'N-0cb2f', [
    ['Boy Smells Water Melons Body Mist - 3.3 fl oz - Target Beauty Studio', 'Boy Smells', 24, 0, 4.5, 18, 'Size:3.3 fl oz', 'new kw:perfume body mist'],
    ['Dossier Aromatic Pineapple Perfume - 50ml', 'Dossier', 28.99, 0, 4.3, 160, 'Size:50ml', 'new kw:perfume'],
    ['Sol de Janeiro Brazilian Crush Cheirosa 62 Perfume Mist - 8.1 fl oz', 'Sol de Janeiro', 38, 0, 4.7, 3200, 'Size:8.1 fl oz', 'kw:perfume body mist'],
  ]),
  ...T('Personal Care', 'beauty', 'N-5xtzq', [
    ['Crest 3D White Brilliance Toothpaste - 3.8oz/2pk', 'Crest', 9.99, 0, 4.7, 2010, 'Count:2|Size:3.8 oz each', 'kw:toothpaste oral care'],
    ['Oral-B iO Series 2 Rechargeable Electric Toothbrush - Black', 'Oral-B', 59.99, 79.99, 4.6, 940, 'Battery:Rechargeable|Modes:3', 'kw:electric toothbrush'],
    ['Dove Deep Moisture Body Wash - 30.6 fl oz', 'Dove', 11.49, 0, 4.8, 4100, 'Size:30.6 fl oz', 'kw:body wash'],
    ['Native Coconut & Vanilla Deodorant - 2.65oz', 'Native', 13.99, 0, 4.4, 3800, 'Size:2.65 oz', 'kw:deodorant'],
    ['Gillette Fusion5 Men\'s Razor + 2 Blade Refills', 'Gillette', 13.99, 0, 4.6, 2900, 'Includes:Handle, 2 cartridges', 'kw:razor grooming'],
    ['Conair On-The-Go Compact Lighted Mirror', 'Conair', 22.99, 0, 4.4, 37, 'Magnification:1x, 5x|Power:Batteries', 'new kw:mirror'],
  ]),

  // ---------------- Clothing, Shoes & Accessories ----------------
  ...T("Women's Clothing", 'clothing', 'N-5xtd3', [
    ["Women's High Pile Zip-Up Jacket - JoyLab Rose", 'JoyLab', 45, 0, 4.5, 28, 'Material:100% Polyester|Fit:Relaxed', 'new sizes:XS/S/M/L/XL kw:fleece jacket'],
    ["Women's Off the Shoulder Drop-Waist Romper - Wild Fable White Polka Dots", 'Wild Fable', 30, 0, 4.2, 15, 'Material:Cotton blend', 'new sizes:XS/S/M/L/XL'],
    ["Women's Long Sleeve 'The Crys Rugby Shirt' - KBB by KAHLANA Gray/Navy Blue Striped", 'KBB by KAHLANA', 55, 0, 4.4, 11, 'Material:Cotton', 'new sizes:S/M/L/XL'],
    ["Women's Fine Gauge Crewneck Pullover Sweater - Universal Thread", 'Universal Thread', 25, 0, 4.4, 860, 'Material:Viscose, nylon blend', 'sizes:XS/S/M/L/XL kw:sweater fall'],
    ["Women's High-Rise 90's Straight Jeans - Universal Thread Medium Wash", 'Universal Thread', 32, 0, 4.4, 2100, 'Material:Cotton, elastane', 'sizes:2/4/6/8/10/12'],
    ["Women's Everyday Soft Ultra High-Rise Leggings - All In Motion Black", 'All In Motion', 25, 0, 4.6, 4900, 'Material:Nylon, spandex|Inseam:28 Inches', 'sizes:XS/S/M/L/XL kw:activewear'],
    ["Women's Amalfi Print Tunneled Medium Coverage One Piece Swimsuit - Shade & Shore Blue", 'Shade & Shore', 45, 0, 4.3, 12, 'Material:Nylon, spandex', 'new sizes:XS/S/M/L'],
  ]),
  ...T("Men's Clothing", 'clothing', 'N-18y1l', [
    ["Men's Short Sleeve Crewneck T-Shirt - Goodfellow & Co Black", 'Goodfellow & Co', 8, 0, 4.4, 3100, 'Material:100% Cotton|Fit:Standard', 'sizes:S/M/L/XL/XXL kw:tshirt'],
    ["Men's Regular Fit Hooded Sweatshirt - Goodfellow & Co Heather Gray", 'Goodfellow & Co', 25, 0, 4.5, 1800, 'Material:Cotton, polyester', 'sizes:S/M/L/XL/XXL kw:hoodie fall'],
    ["Men's Slim Fit Jeans - Goodfellow & Co Dark Blue", 'Goodfellow & Co', 30, 0, 4.4, 1400, 'Material:Cotton, elastane', 'sizes:30x30/32x30/32x32/34x32/36x32'],
    ["Men's Woven Shorts 7\" - All In Motion Black", 'All In Motion', 22, 0, 4.5, 920, 'Material:Polyester, spandex', 'sizes:S/M/L/XL'],
  ]),
  ...T("Kids' Clothing", 'clothing', 'N-xcoz4', [
    ["Girls' Microfleece Vest - Cat & Jack", 'Cat & Jack', 15, 0, 4.6, 24, 'Material:100% Polyester', 'new sizes:XS/S/M/L/XL'],
    ["Girls' Miffy Holiday Long Sleeve Button-Down 2pc Pajama Set - White/Red", 'Miffy', 20, 0, 4.7, 9, 'Material:Cotton', 'new sizes:XS/S/M/L/XL kw:pajamas'],
    ["Boys' Long Sleeve Graphic T-Shirt - Cat & Jack", 'Cat & Jack', 6, 0, 4.6, 410, 'Material:Cotton', 'sizes:XS/S/M/L/XL'],
    ["Kids' Christmas Sweater Knit Double Lined Cozy Crew Socks - Cat & Jack Gray and Lavender", 'Cat & Jack', 5, 0, 4.6, 7, 'Material:Polyester, spandex', 'new sizes:S/M/L kw:socks'],
  ]),
  ...T('Shoes', 'clothing', 'N-rdihz', [
    ["Women's Estella Tall Boots - A New Day Brown", 'A New Day', 45, 0, 4.2, 18, 'Shaft Height:15 Inches|Closure:Side zip', 'new sizes:5/6/7/8/9/10 kw:boots'],
    ["Women's Converse Chuck Taylor All Star Sneakers - Black", 'Converse', 65, 0, 4.7, 3200, 'Upper:Canvas|Closure:Lace-up', 'sizes:6/7/8/9/10 kw:shoes'],
    ["Men's Nike Revolution 7 Running Shoes - Black/White", 'Nike', 70, 0, 4.6, 830, 'Upper:Mesh|Closure:Lace-up', 'sizes:8/9/10/11/12 kw:shoes sneakers'],
    ["Kids' Light-Up Sneakers - Cat & Jack", 'Cat & Jack', 25, 0, 4.4, 1200, 'Upper:Synthetic|Closure:Hook and loop', 'sizes:11/12/13/1/2 kw:shoes'],
  ]),

  // ---------------- Baby ----------------
  ...T('Diapering', 'baby', 'N-5xtlp', [
    ['Pampers Swaddlers Active Baby Diapers - Size 1 - 96ct', 'Pampers', 32.99, 0, 4.8, 9300, 'Size:Size 1 (8-14 lb)|Count:96', 'kw:diapers'],
    ['Huggies Little Snugglers Baby Diapers - Size 2 - 84ct', 'Huggies', 29.99, 0, 4.8, 4200, 'Size:Size 2 (12-18 lb)|Count:84', 'kw:diapers'],
    ['Fragrance Free Baby Wipes - 576ct - up&up', 'up&up', 13.99, 0, 4.7, 6100, 'Count:576', 'kw:wipes'],
  ]),
  ...T('Car Seats', 'baby', 'N-5xtlx', [
    ['Graco 4Ever DLX 4-in-1 Convertible Car Seat - Fairmont', 'Graco', 299.99, 349.99, 4.8, 3800, 'Weight Range:4-120 lb|Modes:4-in-1'],
    ['Chicco KeyFit 35 Zip Infant Car Seat - Onyx', 'Chicco', 249.99, 0, 4.8, 1310, 'Weight Range:4-35 lb'],
  ]),
  ...T('Strollers', 'baby', 'N-5xtk7', [
    ['UPPAbaby Minu V3 Stroller - Jake (Charcoal)', 'UPPAbaby', 499.99, 0, 4.7, 280, 'Weight:16.5 lb|Fold:One-hand'],
    ['Graco Modes Pramette Travel System - Ellington', 'Graco', 349.99, 399.99, 4.7, 1400, 'Includes:Stroller, SnugRide infant car seat', 'kw:stroller'],
  ]),
  ...T('Baby Feeding & Gear', 'baby', 'N-5xtjv', [
    ['Dr. Brown\'s Options+ Anti-Colic Baby Bottles - 8oz/4pk', 'Dr. Brown\'s', 24.99, 0, 4.7, 2800, 'Count:4|Capacity:8 oz', 'kw:bottles feeding'],
    ['Similac 360 Total Care Infant Formula Powder - 30.8oz', 'Similac', 51.99, 0, 4.8, 2100, 'Size:30.8 oz', 'kw:formula'],
    ['Fisher-Price Deluxe Kick & Play Piano Gym', 'Fisher-Price', 59.99, 0, 4.8, 3200, 'Age:Newborn and up', 'kw:activity gym'],
    ['Hatch Rest 2nd Gen Sound Machine, Night Light & Time-to-Rise', 'Hatch', 89.99, 0, 4.7, 1900, 'Connectivity:Wi-Fi|Power:Plug-in', 'kw:nursery sound machine'],
  ]),

  // ---------------- Toys ----------------
  ...T('Building Sets', 'toys', 'N-5xtb0', [
    ['LEGO Star Wars Millennium Falcon Building Toy Set 75375', 'LEGO', 84.99, 0, 4.8, 980, 'Pieces:921|Age:18 Years and up', 'kw:legos lego'],
    ['LEGO Icons Wildflower Bouquet Building Set 10313', 'LEGO', 59.99, 0, 4.9, 2900, 'Pieces:939|Age:18 Years and up', 'kw:legos lego botanicals flowers'],
    ['LEGO Harry Potter Hogwarts Castle and Grounds 76419', 'LEGO', 169.99, 0, 4.9, 1100, 'Pieces:2,660|Age:18 Years and up', 'kw:legos lego'],
    ['LEGO Classic Large Creative Brick Box 10698', 'LEGO', 59.99, 0, 4.9, 4500, 'Pieces:790|Age:4 Years and up', 'kw:legos lego'],
    ['LEGO Minecraft The Creeper Ambush 21177', 'LEGO', 9.99, 0, 4.8, 620, 'Pieces:72|Age:7 Years and up', 'kw:legos lego minecraft'],
  ]),
  ...T('Dolls & Dollhouses', 'toys', 'N-5xt90', [
    ['Barbie Dreamhouse 2023 Pool Party Doll House with 75+ Pieces', 'Barbie', 199.99, 229.99, 4.8, 1600, 'Pieces:75+|Age:3 Years and up', 'kw:barbie doll'],
    ['Barbie Fashionistas Doll #215', 'Barbie', 10.99, 0, 4.8, 410, 'Age:3 Years and up', 'kw:barbie doll'],
    ['Disney Frozen Anna Classic Dress Size 5/6', 'Disney Frozen', 49.99, 0, 4.6, 74, 'Size:5/6|Material:Polyester', 'kw:halloween costumes dress up'],
  ]),
  ...T('Board Games & Puzzles', 'toys', 'N-5xtb0', [
    ['Monopoly Harry Potter Board Game', 'Hasbro Gaming', 22.49, 29.99, 4.7, 140, 'Players:2-6|Age:8 Years and up', 'kw:games puzzles board game'],
    ['Ravensburger Hocus Pocus Puzzle - 1000pc', 'Ravensburger', 9.99, 19.99, 4.7, 88, 'Pieces:1000|Age:14 Years and up', 'kw:games puzzles halloween'],
    ['UNO Card Game', 'Mattel', 5.99, 0, 4.8, 8200, 'Players:2-10|Age:7 Years and up', 'kw:games cards'],
    ['Exploding Kittens Card Game', 'Exploding Kittens', 19.99, 0, 4.8, 3100, 'Players:2-5|Age:7 Years and up', 'kw:games cards'],
  ]),
  ...T('Stuffed Animals', 'toys', 'N-5xtat', [
    ['Squishmallows 16" Cam the Cat Plush', 'Squishmallows', 19.99, 0, 4.9, 3900, 'Size:16 Inches', 'kw:plush'],
    ['Jellycat Bashful Bunny Medium 12"', 'Jellycat', 25, 0, 4.9, 1200, 'Size:12 Inches', 'kw:plush bunny'],
  ]),
  ...T('Trading Cards & Collectibles', 'toys', 'N-5xtb0', [
    ['Pokémon Trading Card Game: Mega Evolution Elite Trainer Box', 'Pokémon', 49.99, 0, 4.8, 420, 'Includes:9 booster packs, sleeves, dice', 'new kw:pokemon cards trading card'],
    ['Pokémon Trading Card Game: Scarlet & Violet Prismatic Evolutions Booster Bundle', 'Pokémon', 26.94, 0, 4.8, 1900, 'Includes:6 booster packs', 'kw:pokemon cards trading card'],
    ['Magic: The Gathering Foundations Play Booster Box', 'Magic: The Gathering', 159.99, 0, 4.6, 140, 'Includes:36 play boosters', 'kw:trading card mtg'],
  ]),
  ...T('Vehicles & Remote Control', 'toys', 'N-5xtaz', [
    ['Hot Wheels Monster Trucks Arena Smashers Mega-Wrex Vs Crushzilla Playset', 'Hot Wheels', 49.99, 0, 4.6, 380, 'Age:4 Years and up', 'kw:cars'],
    ['Hot Wheels 20-Car Gift Pack', 'Hot Wheels', 21.99, 0, 4.8, 5100, 'Count:20 cars', 'kw:cars'],
    ['Sharper Image Hyper Drive RC Stunt Car', 'Sharper Image', 29.99, 39.99, 4.2, 210, 'Power:Rechargeable', 'kw:remote control'],
  ]),
  ...T('Outdoor Toys', 'toys', 'N-5xtai', [
    ['Little Tikes Cozy Coupe Ride-On', 'Little Tikes', 64.99, 0, 4.8, 2800, 'Age:18 Months and up', 'kw:ride-on'],
    ['Nerf Elite 2.0 Commander RD-6 Blaster', 'Nerf', 14.99, 0, 4.6, 980, 'Darts:12 included|Age:8 Years and up'],
  ]),

  // ---------------- Pets ----------------
  ...T('Dog Supplies', 'pets', 'N-5xt3t', [
    ['Purina Pro Plan Adult Chicken & Rice Formula Dry Dog Food - 35lbs', 'Purina Pro Plan', 76.99, 0, 4.8, 4100, 'Net Weight:35 lb|Life Stage:Adult', 'kw:dog food'],
    ['Blue Buffalo Life Protection Formula Chicken & Brown Rice Adult Dry Dog Food - 30lbs', 'Blue Buffalo', 66.99, 0, 4.7, 3800, 'Net Weight:30 lb|Life Stage:Adult', 'kw:dog food'],
    ['Milk-Bone Original Medium Dog Biscuits - 24oz', 'Milk-Bone', 6.49, 0, 4.8, 2900, 'Size:24 oz', 'kw:dog treats'],
    ['Plush Dog Toy - Boots & Barkley', 'Boots & Barkley', 6, 0, 4.4, 1300, 'Material:Polyester', 'kw:dog toy'],
    ['Oval Bolster Dog Bed - M - Boots & Barkley Gray', 'Boots & Barkley', 30, 0, 4.6, 1900, 'Dimensions:30" x 20"', 'kw:pet bed dog bed'],
  ]),
  ...T('Cat Supplies', 'pets', 'N-5xt42', [
    ['Purina Friskies Pate Wet Cat Food Variety Pack - 5.5oz/32ct', 'Purina Friskies', 26.99, 0, 4.7, 3200, 'Count:32 cans', 'kw:cat food'],
    ['Tidy Cats Lightweight Free & Clean Unscented Clumping Cat Litter - 17lbs', 'Tidy Cats', 19.99, 0, 4.7, 4400, 'Net Weight:17 lb', 'kw:cat litter'],
    ['Temptations Classic Tasty Chicken Flavor Cat Treats - 16oz', 'Temptations', 10.99, 0, 4.8, 3600, 'Size:16 oz', 'kw:cat treats'],
  ]),

  // ---------------- Health ----------------
  ...T('Vitamins & Supplements', 'health', 'N-5xu07', [
    ['Olly Women\'s Multivitamin Gummies - Berry - 90ct', 'Olly', 14.99, 0, 4.6, 2900, 'Count:90 gummies', 'kw:vitamins'],
    ['Nature Made Vitamin D3 2000 IU Softgels - 250ct', 'Nature Made', 15.99, 0, 4.8, 2100, 'Count:250 softgels', 'kw:vitamins'],
    ['Vital Proteins Collagen Peptides Unflavored - 9.33oz', 'Vital Proteins', 26.99, 0, 4.6, 1700, 'Size:9.33 oz', 'kw:supplement'],
  ]),
  ...T('Medicines & Treatments', 'health', 'N-5xu09', [
    ['Tylenol Extra Strength Acetaminophen Pain Reliever Caplets - 100ct', 'Tylenol', 12.99, 0, 4.8, 1800, 'Count:100|Active Ingredient:Acetaminophen 500mg', 'kw:pain relief'],
    ['Advil Ibuprofen Pain Reliever Tablets - 200ct', 'Advil', 17.99, 0, 4.8, 2100, 'Count:200|Active Ingredient:Ibuprofen 200mg', 'kw:pain relief'],
    ['Zyrtec 24 Hour Allergy Relief Tablets - 30ct', 'Zyrtec', 26.99, 0, 4.7, 1100, 'Count:30|Active Ingredient:Cetirizine HCl 10mg', 'kw:allergy'],
    ['Allergy Relief Loratadine Tablets - 90ct - up&up', 'up&up', 9.99, 0, 4.7, 1900, 'Count:90|Active Ingredient:Loratadine 10mg', 'kw:allergy'],
  ]),
  ...T('First Aid & Home Health', 'health', 'N-5xu0c', [
    ['Band-Aid Flexible Fabric Adhesive Bandages - 100ct', 'Band-Aid', 7.99, 0, 4.8, 2400, 'Count:100', 'kw:bandages first aid'],
    ['Braun ThermoScan 5 Ear Thermometer - IRT6500', 'Braun', 49.99, 0, 4.6, 980, 'Type:Ear|Power:Batteries', 'kw:thermometer'],
  ]),

  // ---------------- Sports & Outdoors ----------------
  ...T('Exercise & Fitness', 'sports-outdoors', 'N-5xt7d', [
    ['Yoga Mat 5mm - All In Motion', 'All In Motion', 25, 0, 4.6, 2100, 'Thickness:5mm|Material:TPE', 'kw:yoga'],
    ['Hex Dumbbell 15lb - All In Motion', 'All In Motion', 22, 0, 4.7, 980, 'Weight:15 lb|Material:Cast iron, rubber', 'kw:weights'],
    ['Bowflex SelectTech 552 Adjustable Dumbbells (Pair)', 'Bowflex', 429, 549, 4.8, 640, 'Weight Range:5-52.5 lb each', 'kw:weights'],
  ]),
  ...T('Sports Equipment', 'sports-outdoors', 'N-5xt52', [
    ['Spalding NBA Street Outdoor Basketball - Size 7', 'Spalding', 21.99, 0, 4.7, 1900, 'Size:7 (29.5")|Material:Rubber', 'kw:basketball'],
    ['Franklin Sports Pickleball Paddle and Ball Set', 'Franklin Sports', 39.99, 0, 4.5, 820, 'Includes:4 paddles, 4 balls', 'kw:pickleball'],
  ]),
  ...T('Camping Gear', 'sports-outdoors', 'N-5xt6e', [
    ['Coleman Sundome 4 Person Dome Tent', 'Coleman', 89.99, 0, 4.6, 2100, 'Capacity:4 person|Setup:Approx. 10 minutes', 'kw:tent'],
    ['Yeti Rambler 20oz Tumbler with MagSlider Lid - Navy', 'Yeti', 35, 0, 4.9, 1800, 'Capacity:20 fl oz|Material:Stainless steel', 'kw:tumbler'],
    ['Coleman 52qt Xtreme 5 Day Wheeled Cooler - Blue', 'Coleman', 54.99, 0, 4.7, 1500, 'Capacity:52 quarts', 'kw:cooler'],
  ]),
  ...T('Bikes & Scooters', 'sports-outdoors', 'N-5xt83', [
    ['Huffy 24" Granite Mountain Bike - Black', 'Huffy', 189.99, 0, 4.3, 410, 'Wheel Size:24 Inches|Speeds:15', 'kw:bike bicycle'],
    ['Razor A Kick Scooter - Red', 'Razor', 39.99, 0, 4.7, 3800, 'Max Weight:143 lb', 'kw:scooter'],
  ]),

  // ---------------- School & Office ----------------
  ...T('School & Office Supplies', 'school-office', 'N-5xsxr', [
    ['Five Star 1-Subject Wide Ruled Spiral Notebook', 'Five Star', 3.99, 0, 4.8, 2800, 'Sheets:100|Ruling:Wide ruled', 'kw:notebook'],
    ['BIC Cristal Xtra Smooth Ballpoint Pens Medium Point Black - 24ct', 'BIC', 4.99, 0, 4.8, 1900, 'Count:24|Ink Color:Black', 'kw:pens'],
    ['Crayola Washable Markers Broad Line - 10ct', 'Crayola', 3.29, 0, 4.9, 2500, 'Count:10', 'kw:markers'],
    ['Sharpie Permanent Markers Fine Point Black - 12ct', 'Sharpie', 9.99, 0, 4.9, 3200, 'Count:12', 'kw:markers'],
    ['JanSport SuperBreak Plus Backpack - Black', 'JanSport', 49.99, 0, 4.8, 2600, 'Capacity:26L|Laptop Sleeve:15 Inches', 'kw:backpack'],
    ['Desk Organizer Mesh 3-Tier - Brightroom', 'Brightroom', 12, 0, 4.5, 540, 'Tiers:3|Material:Steel mesh', 'kw:desk organization'],
  ]),

  // ---------------- Books, Music & Movies ----------------
  ...T('Books', 'entertainment', 'N-5xsxd', [
    ['Onyx Storm - (Empyrean) by Rebecca Yarros (Hardcover)', 'Entangled: Red Tower Books', 21.49, 29.99, 4.6, 3100, 'Format:Hardcover|Pages:544', 'kw:book fantasy'],
    ['The Housemaid - by Freida McFadden (Paperback)', 'Bloom Books', 10.99, 0, 4.7, 4200, 'Format:Paperback|Pages:336', 'kw:book thriller'],
    ['Atomic Habits - by James Clear (Hardcover)', 'Avery', 16.99, 27, 4.8, 5600, 'Format:Hardcover|Pages:320', 'kw:book'],
    ['Diary of a Wimpy Kid #20 - by Jeff Kinney (Hardcover)', 'Amulet Books', 9.99, 14.99, 4.8, 340, 'Format:Hardcover|Pages:224', 'new kw:book kids'],
  ]),
  ...T('Movies', 'entertainment', 'N-5xsx0', [
    ['Wicked: For Good (Blu-ray + DVD + Digital)', 'Universal Pictures', 29.99, 0, 4.7, 120, 'Format:Blu-ray + DVD + Digital|Rating:PG', 'new kw:movie'],
    ['Lilo & Stitch (2025) (Blu-ray + DVD + Digital)', 'Walt Disney Studios', 24.99, 0, 4.7, 320, 'Format:Blu-ray + DVD + Digital|Rating:PG', 'kw:movie disney'],
  ]),
  ...T('Music', 'entertainment', 'N-5xswr', [
    ['Taylor Swift - The Life of a Showgirl (Target Exclusive, Vinyl)', 'Republic Records', 34.99, 0, 4.8, 1900, 'Format:Vinyl LP', 'kw:vinyl record album'],
    ['Sabrina Carpenter - Man\'s Best Friend (Vinyl)', 'Island Records', 29.99, 0, 4.7, 520, 'Format:Vinyl LP', 'kw:vinyl record album'],
  ]),

  // ---------------- Patio & Garden ----------------
  ...T('Patio & Garden', 'patio-garden', 'N-5xtq9', [
    ['Weber Original Kettle 22" Charcoal Grill - Black', 'Weber', 179, 0, 4.8, 1400, 'Cooking Area:363 sq in|Fuel:Charcoal', 'kw:grill'],
    ['Solo Stove Bonfire 2.0 Smokeless Fire Pit', 'Solo Stove', 249.99, 299.99, 4.8, 900, 'Diameter:19.5 Inches|Fuel:Wood', 'kw:fire pit'],
    ['4pc Wicker Patio Conversation Set - Threshold', 'Threshold', 500, 650, 4.3, 140, 'Pieces:4|Material:Resin wicker, steel', 'clear kw:patio furniture'],
    ['Miracle-Gro Indoor Potting Mix - 6qt', 'Miracle-Gro', 6.99, 0, 4.7, 1100, 'Size:6 quarts', 'kw:soil plants'],
  ]),

  // ---------------- Halloween (target.com homepage, 2026-10-13) ----------------
  ...T('Halloween Decorations', 'halloween', 'N-5xt2o', [
    ['17.9" Ghost with Jack Blow Mold Halloween Decorative Prop - Hyde & EEK! Boutique', 'Hyde & EEK! Boutique', 12, 20, 4.7, 66, 'Height:17.9 Inches|Material:Plastic', 'kw:halloween decorations decor'],
    ['11.5" Chihuahua Skeleton Halloween Decorative Prop - Hyde & EEK! Boutique', 'Hyde & EEK! Boutique', 10.5, 15, 4.8, 120, 'Height:11.5 Inches|Material:Plastic', 'kw:halloween decorations decor'],
    ['14\' Stretchy Spiderweb Halloween Decorative Prop - Hyde & EEK! Boutique', 'Hyde & EEK! Boutique', 2.1, 3, 4.4, 410, 'Length:14 ft|Material:Polyester', 'kw:halloween decorations decor'],
    ['16" Light Pumpkin with 2 Teeth and Timer Decorative Prop - Hyde & EEK! Boutique', 'Hyde & EEK! Boutique', 10.5, 15, 4.6, 75, 'Height:16 Inches|Power:Batteries', 'kw:halloween decorations pumpkin'],
    ['50" Large Spider Pumpkin Head Eyeball Decorative Prop - Hyde & EEK! Boutique', 'Hyde & EEK! Boutique', 7, 10, 4.5, 38, 'Length:50 Inches', 'kw:halloween decorations'],
    ['14" Classic Lit Candelabra Candle with Timer and Ghost Face Decorative Prop - Hyde & EEK! Boutique', 'Hyde & EEK! Boutique', 6, 10, 4.5, 44, 'Height:14 Inches|Power:Batteries', 'kw:halloween decorations'],
    ['12" Ghost Tombstone Outdoor Decorative Sculpture - Hyde & EEK! Boutique', 'Hyde & EEK! Boutique', 6, 10, 4.6, 51, 'Height:12 Inches|Material:Foam', 'kw:halloween decorations outdoor'],
    ['Gemmy Halloween Inflatable Bluey in Jack O\' Lantern Costume - 3.5ft', 'Gemmy', 33.6, 69.99, 4.7, 54, 'Height:3.5 ft|Power:Plug-in', 'kw:halloween inflatable'],
    ['Gemmy Airblown Inflatable Scoob Puppy As Bat WB - 3.5ft', 'Gemmy', 36, 79.99, 4.7, 29, 'Height:3.5 ft|Power:Plug-in', 'kw:halloween inflatable'],
    ['Joyfy 2 PCS LED Light Halloween Trick-or-Treat Bags', 'Joyfy', 17.99, 29.99, 4.4, 21, 'Count:2|Power:Batteries', 'kw:halloween trick or treat'],
  ]),
  ...T('Halloween Costumes', 'halloween', 'N-5xt2o', [
    ['Disney Frozen 2 Elsa Travel Dress', 'Disney Frozen', 19.99, 0, 4.6, 140, 'Size:4-6X|Material:Polyester', 'kw:halloween costumes dress up'],
    ['Disney Princess Ariel Dress 5-6', 'Disney Princess', 49.99, 0, 4.7, 58, 'Size:5-6|Material:Polyester', 'kw:halloween costumes dress up'],
    ['Disney Princess Belle Dress 9-10', 'Disney Princess', 49.99, 0, 4.7, 36, 'Size:9-10|Material:Polyester', 'kw:halloween costumes dress up'],
    ['Dress Up America Grim Reaper Costume for Kids - Small', 'Dress Up America', 9.99, 19.99, 4.3, 64, 'Size:Small (4-6)|Material:Polyester', 'kw:halloween costumes'],
    ['Kids\' Light Up Skeleton Halloween Costume Jumpsuit - Hyde & EEK! Boutique', 'Hyde & EEK! Boutique', 25, 0, 4.4, 210, 'Material:Polyester|Power:Batteries', 'sizes:XS/S/M/L kw:halloween costumes'],
  ]),
  ...T('Halloween Candy', 'halloween', 'N-5xt2o', [
    ['Monster Cereal JMM x Monsters Limited Edition Halloween Breakfast Cereal - 3.55oz', 'General Mills', 3.99, 0, 4.5, 12, 'Size:3.55 oz', 'new kw:halloween cereal'],
    ['Reese\'s Peanut Butter Cups Snack Size Halloween Candy - 30.9oz', 'Reese\'s', 14.99, 0, 4.8, 1900, 'Size:30.9 oz', 'kw:halloween candy chocolate trick or treat'],
    ['Mars Halloween Fun Size Variety Pack Chocolate Candy - 90ct', 'Mars', 19.99, 0, 4.8, 2600, 'Count:90 pieces', 'kw:halloween candy chocolate trick or treat'],
    ['Brach\'s Classic Candy Corn - 20oz', 'Brach\'s', 4.99, 0, 4.4, 1100, 'Size:20 oz', 'kw:halloween candy'],
    ['Joyfy 2 Pack Halloween Wind Up Ghost & Pumpkin Toys for Kids', 'Joyfy', 9.23, 15.39, 4.3, 14, 'Count:2', 'kw:halloween toys'],
  ]),
]

// ---- build product records ----
const hash = s => { let n = 2166136261; for (const c of String(s)) n = Math.imul(n ^ c.codePointAt(0), 16777619); return n >>>0 }
const slugify = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/&/g, ' ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
// TCINs the reference policy tests treat as invented fixtures must never be reused here.
const RESERVED = new Set(['1011529119', '1011545811', '1013468584', '1012260588', '81960427', '84233912', '82900531', '89027781'])
const DPCI_CLASS = { electronics: '057', 'video-games': '207', 'home-decor': '063', 'kitchen-dining': '072', grocery: '212', household: '060', beauty: '037', clothing: '011', baby: '005', toys: '087', pets: '090', health: '049', 'sports-outdoors': '056', 'school-office': '084', entertainment: '279', 'patio-garden': '066', halloween: '231' }
const BLURB = {
  electronics: 'Shop with free shipping on orders $35+ and easy returns on most electronics within 30 days.',
  'video-games': 'Play your way with the latest games, consoles and accessories.',
  'home-decor': 'Refresh your space with comfortable, good-looking pieces made for everyday living.',
  'kitchen-dining': 'Make everyday cooking, serving and sipping a little easier.',
  grocery: 'Stock up on pantry staples, fresh favorites and snacks for the week.',
  household: 'Keep your home fresh and clean with trusted everyday essentials.',
  beauty: 'Find your new favorite for your everyday routine.',
  clothing: 'Comfortable, versatile style you can wear on repeat.',
  baby: 'Thoughtful essentials for baby and peace of mind for you.',
  toys: 'Hours of play and imagination for kids and grown-ups alike.',
  pets: 'Everyday care and treats for your furry family members.',
  health: 'Use only as directed. Read and follow the product label.',
  'sports-outdoors': 'Gear up for workouts, games and time outdoors.',
  'school-office': 'Stay organized and ready for school, work and everything in between.',
  entertainment: 'Stories, music and movies to enjoy again and again.',
  'patio-garden': 'Make the most of your outdoor space.',
  halloween: 'Get into the spooky spirit with Halloween decor, costumes and treats.',
}
const SUB_LOVE = ['quality', 'value', 'easy to use', 'design', 'comfort', 'size']

const used = new Set()
export const SHELF = ROWS.map(({ type, dept, node, r }, i) => {
  const [title, brand, price, regular, score, count, rawSpecs = '', rawFlags = ''] = r
  const flags = rawFlags.split('kw:')[0].split(' ').filter(Boolean)
  const kw = (rawFlags.match(/kw:(.*)$/)?.[1] || '')
  const has = f => flags.includes(f)
  let n = 80000000 + (hash(title) % 14999999)
  while (used.has(String(n)) || RESERVED.has(String(n))) n += 7
  const tcin = String(n); used.add(tcin)
  const specs = rawSpecs ? rawSpecs.split('|').map(s => { const at = s.indexOf(':'); return [s.slice(0, at), s.slice(at + 1)] }) : []
  const department = SHELF_DEPARTMENTS.find(d => d.id === dept)
  const platform = ['ps5', 'xbox', 'switch', 'switch-2'].find(has) || null
  const game = has('game'), consoleItem = has('console')
  const deal = regular > price
  const h = hash(tcin)
  const stock = 2 + (h % 9)
  const dpci = `${DPCI_CLASS[dept]}-${String(h % 100).padStart(2, '0')}-${String((h >>> 8) % 10000).padStart(4, '0')}`
  const material = specs.find(([k]) => k === 'Material')?.[1]
  const s = Number(score).toFixed(1)
  const p = {
    tcin, kind: 'other', shelf: true, family: `shelf-${dept}`, department: dept, type, brand, title,
    slug: slugify(title), price, ...(deal ? { regularPrice: regular } : {}), deal, clearance: has('clear'), isNew: has('new'),
    material, stock, limit: Math.min(stock, dept === 'grocery' || dept === 'household' ? 10 : consoleItem ? 2 : 5),
    preorder: has('pre'), release: null, seller: 'Target', esp: false, questions: h % 40,
    crumbs: [department.name, type], glance: specs[0] ? specs[0].join(': ') : type, dpci,
    rating: { score: s, text: `${s} out of 5 stars`, count, loved: SUB_LOVE[h % SUB_LOVE.length] },
    highlights: specs.length ? specs.map(([k, v]) => `${k}: ${v}`) : [type],
    description: `${title}. ${BLURB[dept]}${specs.length ? ' ' + specs.map(([k, v]) => `${k}: ${v}.`).join(' ') : ''}`,
    specs: [...specs, ['Brand', brand], ['DPCI', dpci], ['Origin', /Good & Gather|up&up|Threshold|Room Essentials|Brightroom|Cat & Jack|Goodfellow|Universal Thread|All In Motion|Figmint|Hyde/.test(brand) ? 'Imported' : 'Imported or made in USA']],
    shippingNote: dept === 'grocery' && /refrigerat|frozen/i.test(rawSpecs) ? 'This item is shipped in insulated packaging and must arrive within 2 days. Order Pickup and Same Day Delivery are not available for this item.' : 'Standard shipping is available. Order Pickup and Same Day Delivery are not available for this item.',
    returns: ['grocery', 'health', 'beauty', 'baby'].includes(dept) ? 'Most unopened items in new condition can be returned within 90 days. Opened food, health and personal-care items may have return restrictions.' : dept === 'electronics' || dept === 'video-games' ? 'This item must be returned within 30 days of the date it was purchased in store, shipped, delivered by a Shipt shopper, or made ready for pickup.' : 'Most unopened items in new condition and returned within 90 days will receive a refund or exchange.',
    restricted: false, eta: consoleItem || /TV|Furniture|Patio|Car Seats|Strollers/.test(type) ? 'Arrives in 3–7 business days' : 'Arrives in 2–4 business days',
    keywords: `${brand} ${type} ${department.name} ${kw}`,
    catalogType: game ? 'game' : consoleItem ? 'console' : 'other', catalogPlatform: platform,
  }
  p.nodes = [...new Set([department.node, node, ...(dept === 'video-games' ? ['N-5xtg6'] : []), ...(dept === 'halloween' ? ['N-5xt3c'] : []), ...(/beauty studio/i.test(title) ? ['N-0cb2f'] : []), ...(/gift card/i.test(title) ? ['N-5xtfh', 'N-5xsxu'] : []), ...(deal ? ['N-4xw74'] : []), ...(p.isNew ? ['N-o9rnh'] : []), ...(p.clearance || (deal && regular >= price * 1.5) ? ['N-5q0ga'] : []), ...(/kids|girls|boys|toddler/i.test(title) && dept === 'clothing' ? ['N-xcoz4'] : [])])]
  const sizes = flags.find(f => f.startsWith('sizes:'))?.slice(6)
  if (sizes) {
    p.optionLabel = 'Size'
    p.variants = sizes.split('/').map((size, k) => ({ id: `${tcin}-${k + 1}`, options: { Size: size.replace('x', ' x ') }, price, stock: (h >>> k) % 5 === 0 ? 0 : 1 + ((h >>> k) % 4) }))
    if (!p.variants.some(v => v.stock)) p.variants[0].stock = 3
    p.stock = p.variants.reduce((t, v) => t + v.stock, 0)
    p.limit = 5
  }
  return p
})

export const shelfByTcin = new Map(SHELF.map(p => [p.tcin, p]))

// Art hints steer lib/product-asset-art.js toward the right illustration where a retail title alone
// would pick a generic or wrong form (e.g. "SSD" in a laptop title). `title` replaces the
// classification title only; `shape` names a renderer family used when no title rule matches.
const ART_HINTS = [
  [/Laptop/, { title: 'Laptop computer' }], [/iPhone|Galaxy A16|moto g/, { title: 'Smartphone' }], [/iPad|Kindle|Fire HD/, { title: 'Tablet' }],
  [/Roku 43/, { title: 'Television' }], [/Streaming Stick/, { title: 'Streaming media player' }], [/Smart Wi-Fi Plug/, { title: 'Smart plug' }],
  [/Philips Hue/, { title: 'Smart light bulb lamp' }], [/Drone/, { shape: 'camera' }], [/Batteries/, { title: 'Battery power bank' }],
  [/Controller -|Controller$|Pro Controller/, { title: 'Wireless controller' }], [/Headset/, { title: 'Gaming headset' }], [/Travel Case/, { title: 'Controller carrying case' }],
  [/Portal Remote/, { title: 'Handheld tablet display' }], [/Funko|amiibo|Ghost with Jack|Chihuahua Skeleton|Spider Pumpkin|Ghost Tombstone|Inflatable/, { title: 'Decorative figure' }],
  [/Printer's Accent Chair/, { title: 'Upholstered armchair' }], [/Instant Pot/, { title: 'Electric pressure cooker oven' }], [/Dinnerware/, { title: 'Stoneware dinner plates' }],
  [/Bananas|Avocados|Spinach|Eggs|Yogurt|Cheese|Doritos|BonBon|Candy Corn|Potting Mix|Cat Treats|Infant Formula/, { shape: 'food' }],
  [/Cat Litter|Diapers/, { shape: 'bag' }], [/Vitamin|Multivitamin|Collagen|Tylenol|Advil|Zyrtec|Loratadine|Disinfecting Wipes|Baby Bottles/, { shape: 'jar' }],
  [/Bandages/, { shape: 'basket' }], [/Thermometer/, { shape: 'appliance' }], [/Toilet Paper|Paper Towels/, { title: 'Paper rolls multipack', shape: 'food' }], [/Fat Milk|Whole Milk/, { title: 'Gallon jug' }], [/Dryer Sheets/, { title: 'Fabric softener sheets', shape: 'food' }],
  [/Dishwasher Pods/, { title: 'Detergent pods' }], [/Hooded Sweatshirt/, { title: 'Hoodie' }], [/Romper/, { title: 'Dress' }], [/Leggings/, { title: 'Women tights' }], [/Hogwarts Castle/, { shape: 'toy' }],
  [/Travel System/, { title: 'Stroller' }], [/Kick & Play/, { shape: 'toy' }], [/Sound Machine/, { shape: 'speaker' }],
  [/Bashful Bunny/, { title: 'Plush bunny' }], [/Hot Wheels|Stunt Car|Nerf|Wind Up/, { shape: 'toy' }], [/Monster Trucks/, { title: 'Monster truck playset' }],
  [/Plush Dog Toy/, { title: 'Plush dog toy' }], [/Dog Bed/, { title: 'Pet bed' }], [/Dreamhouse/, { title: 'Dollhouse playset' }],
  [/Cooler/, { shape: 'basket' }], [/Fire Pit/, { shape: 'bowl' }], [/Patio Conversation Set/, { title: 'Patio chair set' }],
  [/Pens|Markers/, { shape: 'pencil' }], [/Desk Organizer/, { title: 'Desk organizer shelf' }], [/Booster Box/, { title: 'Booster pack' }],
  [/Spiderweb/, { title: 'Spiderweb throw' }], [/Grim Reaper Costume/, { title: 'Costume dress' }], [/Swiffer/, { title: 'Floor mop brush' }],
]
// Asset descriptor for lib/product-asset-art.js renderProductAsset.
export function shelfArtDescriptor(p, variantId = '') {
  const v = p.variants?.find(x => x.id === variantId)
  const hint = ART_HINTS.find(([re]) => re.test(p.title))?.[1] || {}
  const title = hint.title || p.title
  const playable = p.catalogType === 'game' || p.catalogType === 'console'
  const category = p.department === 'video-games' && !playable ? 'electronics' : p.department
  return {
    store: 'target', id: p.tcin, title, canonicalTitle: title, category,
    type: p.catalogType, platform: playable ? p.catalogPlatform : null, format: p.catalogType === 'game' ? 'physical' : null, edition: p.catalogType === 'game' ? 'standard' : null,
    brand: p.brand, specs: Object.fromEntries(p.specs), assetKey: `target-shelf-${p.tcin}${v ? ':' + v.id : ''}`,
    raw: { title, brand: p.brand, type: category === p.department ? p.type : 'accessory', department: category, description: p.description, specs: Object.fromEntries(p.specs), catalogType: p.catalogType, ...(playable ? { catalogPlatform: p.catalogPlatform } : {}), ...(hint.shape ? { shape: hint.shape } : {}), ...(v ? { options: v.options } : {}) },
    variant: null,
  }
}
