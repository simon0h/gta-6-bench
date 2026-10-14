// JB Hi-Fi everyday assortment for the default (reference) catalog.
//
// The live jbhifi.com.au storefront sells thousands of products; GTA VI is one listing among them.
// This file gives the clone a realistic store around the two evidence-backed GTA VI listings so
// that the homepage, departments, search and deals pages look like the real shop. These rows are
// authored (brand/model names are real product lines, prices are realistic AUD shelf prices, SKUs
// follow JB's 6-digit format) and are NOT source-captured evidence: they are kept out of
// PRODUCTS / CATALOG_EVIDENCE / inventory.js, so applyCatalogPolicy, /api/catalog `inventory` and
// the reference inventory reports keep describing only the evidenced GTA VI rows.
// Assortment purchases are recorded as `kind: 'other'` order lines (see index.js).
import { createHash } from 'node:crypto'
import { slugify } from './catalog.js'

const DEPT = {
  CT: 'Computers & Tablets', MP: 'Mobile Phones', WE: 'Wearables', TV: 'TVs & Home Theatre', HA: 'Headphones & Audio',
  CA: 'Cameras', GA: 'Gaming', AP: 'Home Appliances', SH: 'Smart Home', HB: 'Health & Beauty', MU: 'Music', MO: 'Movies & TV',
  CO: 'Collectibles & Merchandise', CR: 'Car Audio & GPS', ET: 'Electric Transportation', SW: 'Software',
}
const PLATFORM = { ps5: 'PlayStation 5', xbox: 'Xbox Series X', 'switch-2': 'Nintendo Switch 2', switch: 'Nintendo Switch', pc: 'PC' }

// dept | type | brand | title | price | was (ticketed price, blank if none) | attributes (k=v;k=v) | flags
// flags: deal, new, clear, excl (JB exclusive), online, oos, work, movie, kitchen, top, ps5/xbox/switch-2/switch/pc, r:<classification>
const ROWS = `
CT|Laptops|Apple|Apple MacBook Air 13-inch with M4 Chip, 16GB RAM, 256GB SSD (Midnight)|1499||Colour=Midnight;Display size=13.6 inch;Processor=Apple M4;RAM=16GB;Storage=256GB SSD|top work
CT|Laptops|Apple|Apple MacBook Air 15-inch with M4 Chip, 16GB RAM, 512GB SSD (Sky Blue)|2199||Colour=Sky Blue;Display size=15.3 inch;Processor=Apple M4;RAM=16GB;Storage=512GB SSD|work
CT|Laptops|Apple|Apple MacBook Pro 14-inch with M5 Chip, 16GB RAM, 512GB SSD (Space Black)|2699||Colour=Space Black;Display size=14.2 inch;Processor=Apple M5;RAM=16GB;Storage=512GB SSD|new work
CT|Laptops|Apple|Apple MacBook Pro 16-inch with M4 Pro Chip, 24GB RAM, 512GB SSD (Silver)|4299||Colour=Silver;Display size=16.2 inch;Processor=Apple M4 Pro;RAM=24GB;Storage=512GB SSD|work
CT|Laptops|HP|HP OmniBook 5 14" OLED Laptop (Snapdragon X Plus) [512GB]|1199|1499|Colour=Ceramic White;Display size=14 inch;Processor=Snapdragon X Plus;RAM=16GB;Storage=512GB SSD|deal work
CT|Laptops|HP|HP 15.6" Full HD Laptop (Intel Core i5) [512GB]|849|999|Colour=Natural Silver;Display size=15.6 inch;Processor=Intel Core i5-1334U;RAM=16GB;Storage=512GB SSD|deal work
CT|Laptops|Lenovo|Lenovo IdeaPad Slim 5 14" WUXGA OLED Laptop (Ryzen 7) [1TB]|1299|1599|Colour=Cosmic Blue;Display size=14 inch;Processor=AMD Ryzen 7 8845HS;RAM=16GB;Storage=1TB SSD|deal work
CT|Laptops|Lenovo|Lenovo Yoga Slim 7x 14.5" 3K OLED Copilot+ PC (Snapdragon X Elite) [1TB]|1899|2299|Colour=Cosmic Blue;Display size=14.5 inch;Processor=Snapdragon X Elite;RAM=16GB;Storage=1TB SSD|work
CT|Laptops|Lenovo|Lenovo LOQ 15.6" FHD 144Hz Gaming Laptop (Intel Core i5/RTX 4050) [512GB]|1399|1699|Colour=Luna Grey;Display size=15.6 inch;Processor=Intel Core i5-12450HX;Graphics=NVIDIA GeForce RTX 4050;RAM=16GB;Storage=512GB SSD|deal
CT|Laptops|ASUS|ASUS Vivobook 14 14" WUXGA Laptop (Intel Core 5) [512GB]|899||Colour=Quiet Blue;Display size=14 inch;Processor=Intel Core 5 120U;RAM=16GB;Storage=512GB SSD|work
CT|Laptops|ASUS|ASUS ROG Strix G16 16" 165Hz Gaming Laptop (Intel Core i9/RTX 5070 Ti) [1TB]|3799||Colour=Eclipse Grey;Display size=16 inch;Processor=Intel Core i9-14900HX;Graphics=NVIDIA GeForce RTX 5070 Ti;RAM=32GB;Storage=1TB SSD|new
CT|Laptops|Microsoft|Microsoft Surface Laptop 13.8" Copilot+ PC (Snapdragon X Plus) [512GB] (Platinum)|1899|2199|Colour=Platinum;Display size=13.8 inch;Processor=Snapdragon X Plus;RAM=16GB;Storage=512GB SSD|work
CT|Laptops|Acer|Acer Aspire Go 15 15.6" Full HD Laptop (Intel Core i3) [256GB]|549||Colour=Pure Silver;Display size=15.6 inch;Processor=Intel Core i3-N305;RAM=8GB;Storage=256GB SSD|work
CT|Laptops|Lenovo|Lenovo IdeaPad Slim 3 Chromebook 14" FHD (MediaTek) [128GB]|449||Colour=Abyss Blue;Display size=14 inch;Processor=MediaTek Kompanio 520;RAM=8GB;Storage=128GB eMMC|work clear
CT|Tablets|Apple|Apple iPad 11-inch Wi-Fi 128GB (Blue)|599||Colour=Blue;Display size=11 inch;Storage=128GB;Connectivity=Wi-Fi|top
CT|Tablets|Apple|Apple iPad Air 11-inch with M3 Chip Wi-Fi 128GB (Space Grey)|999||Colour=Space Grey;Display size=11 inch;Storage=128GB;Connectivity=Wi-Fi|work
CT|Tablets|Apple|Apple iPad Pro 13-inch with M5 Chip Wi-Fi 256GB (Space Black)|2499||Colour=Space Black;Display size=13 inch;Storage=256GB;Connectivity=Wi-Fi|new
CT|Tablets|Apple|Apple iPad mini Wi-Fi 128GB (Purple)|799||Colour=Purple;Display size=8.3 inch;Storage=128GB;Connectivity=Wi-Fi|
CT|Tablets|Samsung|Samsung Galaxy Tab S10 FE 10.9" Wi-Fi 128GB (Grey)|649|749|Colour=Grey;Display size=10.9 inch;Storage=128GB;Connectivity=Wi-Fi|deal
CT|Tablets|Samsung|Samsung Galaxy Tab A9+ 11" Wi-Fi 64GB (Graphite)|279|349|Colour=Graphite;Display size=11 inch;Storage=64GB;Connectivity=Wi-Fi|deal
CT|Tablets|Lenovo|Lenovo Tab M11 11" Wi-Fi 128GB with Pen (Luna Grey)|299||Colour=Luna Grey;Display size=11 inch;Storage=128GB;Connectivity=Wi-Fi|
CT|Desktop computers|Apple|Apple Mac mini with M4 Chip, 16GB RAM, 256GB SSD|999||Colour=Silver;Processor=Apple M4;RAM=16GB;Storage=256GB SSD|work
CT|Desktop computers|Apple|Apple iMac 24-inch with M4 Chip, 16GB RAM, 256GB SSD (Blue)|2199||Colour=Blue;Display size=24 inch;Processor=Apple M4;RAM=16GB;Storage=256GB SSD|
CT|Desktop computers|HP|HP OmniDesk Desktop PC (Intel Core i5) [512GB]|1099||Colour=Black;Processor=Intel Core i5-14400;RAM=16GB;Storage=512GB SSD|
CT|Monitors|Samsung|Samsung Odyssey G5 27" QHD 180Hz Gaming Monitor|349|449|Colour=Black;Display size=27 inch;Resolution=2560 x 1440;Refresh rate=180Hz|deal
CT|Monitors|LG|LG UltraGear 27" QHD 180Hz IPS Gaming Monitor|399||Colour=Black;Display size=27 inch;Resolution=2560 x 1440;Refresh rate=180Hz|
CT|Monitors|Dell|Dell 27 Plus 4K USB-C Monitor S2725QC|499||Colour=Ash White;Display size=27 inch;Resolution=3840 x 2160;Refresh rate=60Hz|work
CT|Monitors|ASUS|ASUS ROG Strix 32" 4K 240Hz QD-OLED Gaming Monitor|1599|1899|Colour=Black;Display size=31.5 inch;Resolution=3840 x 2160;Refresh rate=240Hz|
CT|Monitors|Samsung|Samsung 24" Essential S3 Full HD Monitor|149||Colour=Black;Display size=24 inch;Resolution=1920 x 1080;Refresh rate=100Hz|work
CT|Printers|HP|HP OfficeJet Pro 9130b All-in-One Wireless Printer|399|499|Colour=Grey;Functions=Print / scan / copy / fax;Connectivity=Wi-Fi|deal work
CT|Printers|Canon|Canon PIXMA TS7760a Wireless Inkjet All-in-One Printer|129||Colour=Black;Functions=Print / scan / copy;Connectivity=Wi-Fi|work
CT|Printers|Epson|Epson EcoTank ET-2960 Inkjet Multifunction Printer|349||Colour=Black;Functions=Print / scan / copy;Connectivity=Wi-Fi|work
CT|Networking|TP-Link|TP-Link Deco X55 AX3000 Whole Home Mesh Wi-Fi 6 System (3 Pack)|349|449|Colour=White;Connectivity=Wi-Fi 6;Coverage=Up to 600 m²|deal
CT|Networking|NETGEAR|NETGEAR Nighthawk RS300 BE9300 Wi-Fi 7 Router|499||Colour=Black;Connectivity=Wi-Fi 7|
CT|Networking|TP-Link|TP-Link Archer AX55 AX3000 Dual-Band Wi-Fi 6 Router|149||Colour=Black;Connectivity=Wi-Fi 6|
CT|Computer accessories|Logitech|Logitech MX Master 3S Performance Wireless Mouse (Graphite)|149|169|Colour=Graphite;Connectivity=Bluetooth / USB receiver|deal work
CT|Computer accessories|Logitech|Logitech MX Keys S Wireless Keyboard (Graphite)|169||Colour=Graphite;Connectivity=Bluetooth / USB receiver|work
CT|Computer accessories|Logitech|Logitech Pebble Mouse 2 M350s (Rose)|35||Colour=Rose;Connectivity=Bluetooth|work
CT|Computer accessories|Apple|Apple Magic Keyboard with Touch ID (USB-C)|249||Colour=White;Connectivity=Bluetooth|
CT|Computer accessories|Logitech|Logitech Brio 500 Full HD Webcam (Graphite)|149||Colour=Graphite;Resolution=1080p;Connectivity=USB-C|work
CT|Computer accessories|SanDisk|SanDisk Extreme Portable SSD V2 2TB|279|349|Colour=Black;Storage=2TB;Connectivity=USB-C|deal
CT|Computer accessories|Samsung|Samsung T7 Shield Portable SSD 1TB (Black)|169||Colour=Black;Storage=1TB;Connectivity=USB-C|
CT|Computer accessories|Seagate|Seagate One Touch 5TB Portable Hard Drive (Black)|229||Colour=Black;Storage=5TB;Connectivity=USB 3.0|
CT|Computer accessories|Belkin|Belkin Connect USB-C 7-in-1 Multiport Hub Adapter|89||Colour=Grey;Connectivity=USB-C|work
MP|iPhone|Apple|Apple iPhone 17 256GB (Lavender)|1399||Colour=Lavender;Storage=256GB;Display size=6.3 inch;Connectivity=5G|top new
MP|iPhone|Apple|Apple iPhone 17 Pro 256GB (Cosmic Orange)|1999||Colour=Cosmic Orange;Storage=256GB;Display size=6.3 inch;Connectivity=5G|top new
MP|iPhone|Apple|Apple iPhone 17 Pro Max 512GB (Deep Blue)|2549||Colour=Deep Blue;Storage=512GB;Display size=6.9 inch;Connectivity=5G|new
MP|iPhone|Apple|Apple iPhone Air 256GB (Sky Blue)|1799||Colour=Sky Blue;Storage=256GB;Display size=6.5 inch;Connectivity=5G|
MP|iPhone|Apple|Apple iPhone 16e 128GB (White)|999||Colour=White;Storage=128GB;Display size=6.1 inch;Connectivity=5G|
MP|Android phones|Samsung|Samsung Galaxy S25 Ultra 256GB (Titanium Silverblue)|1699|2149|Colour=Titanium Silverblue;Storage=256GB;Display size=6.9 inch;Connectivity=5G|deal top
MP|Android phones|Samsung|Samsung Galaxy S25 128GB (Navy)|1099|1399|Colour=Navy;Storage=128GB;Display size=6.2 inch;Connectivity=5G|deal
MP|Android phones|Samsung|Samsung Galaxy Z Flip7 256GB (Blue Shadow)|1699||Colour=Blue Shadow;Storage=256GB;Display size=6.9 inch;Connectivity=5G|new
MP|Android phones|Samsung|Samsung Galaxy A56 5G 128GB (Awesome Graphite)|649||Colour=Awesome Graphite;Storage=128GB;Display size=6.7 inch;Connectivity=5G|
MP|Android phones|Google|Google Pixel 10 Pro 256GB (Obsidian)|1799||Colour=Obsidian;Storage=256GB;Display size=6.3 inch;Connectivity=5G|new
MP|Android phones|Google|Google Pixel 10 128GB (Indigo)|1349||Colour=Indigo;Storage=128GB;Display size=6.3 inch;Connectivity=5G|
MP|Android phones|Google|Google Pixel 9a 128GB (Porcelain)|749|849|Colour=Porcelain;Storage=128GB;Display size=6.3 inch;Connectivity=5G|deal
MP|Android phones|OPPO|OPPO Reno14 F 5G 256GB (Luminous Green)|599||Colour=Luminous Green;Storage=256GB;Display size=6.57 inch;Connectivity=5G|
MP|Android phones|Motorola|Motorola moto g85 5G 256GB (Cobalt Blue)|399|449|Colour=Cobalt Blue;Storage=256GB;Display size=6.67 inch;Connectivity=5G|deal
MP|Prepaid phones|Telstra|Telstra Essential Pro 4G Prepaid Smartphone (Locked)|149||Colour=Black;Storage=64GB;Connectivity=4G|
MP|Phone cases|OtterBox|OtterBox Symmetry Series MagSafe Case for iPhone 17 Pro (Clear)|79||Colour=Clear;Compatibility=iPhone 17 Pro|
MP|Phone cases|Apple|Apple iPhone 17 Pro Silicone Case with MagSafe (Anchor Blue)|79||Colour=Anchor Blue;Compatibility=iPhone 17 Pro|new
MP|Phone cases|Samsung|Samsung Galaxy S25 Ultra Silicone Case (Black)|49||Colour=Black;Compatibility=Galaxy S25 Ultra|clear
MP|Phone chargers|Apple|Apple 20W USB-C Power Adapter|35||Colour=White;Power=20W;Connectivity=USB-C|
MP|Phone chargers|Belkin|Belkin BoostCharge Pro 3-in-1 Wireless Charging Pad with MagSafe 15W|179|229|Colour=White;Power=15W;Connectivity=MagSafe|deal
MP|Phone chargers|Anker|Anker Nano 65W USB-C Charger|69||Colour=White;Power=65W;Connectivity=USB-C|
MP|Power banks|Anker|Anker MagGo 10,000mAh Magnetic Power Bank|99||Colour=Black;Capacity=10000mAh;Connectivity=USB-C / Qi2|
MP|Power banks|Mophie|Mophie Powerstation Plus 20,000mAh Power Bank|89||Colour=Black;Capacity=20000mAh;Connectivity=USB-C / USB-A|clear
WE|Smart watches|Apple|Apple Watch Series 11 GPS 42mm Jet Black Aluminium Case with Black Sport Band (S/M)|699||Colour=Jet Black;Case size=42mm;Connectivity=GPS|top new
WE|Smart watches|Apple|Apple Watch SE 3 GPS 40mm Midnight Aluminium Case with Midnight Sport Band (S/M)|399||Colour=Midnight;Case size=40mm;Connectivity=GPS|
WE|Smart watches|Apple|Apple Watch Ultra 3 GPS + Cellular 49mm Natural Titanium Case with Black Trail Loop|1499||Colour=Natural;Case size=49mm;Connectivity=GPS + Cellular|new
WE|Smart watches|Samsung|Samsung Galaxy Watch8 44mm Bluetooth (Graphite)|549|649|Colour=Graphite;Case size=44mm;Connectivity=Bluetooth|deal
WE|Smart watches|Garmin|Garmin Forerunner 265 GPS Running Smartwatch (Black)|549|699|Colour=Black;Case size=46mm;Connectivity=GPS|deal
WE|Smart watches|Garmin|Garmin Venu 4 GPS Smartwatch (Slate)|799||Colour=Slate;Case size=45mm;Connectivity=GPS|new
WE|Fitness trackers|Fitbit|Fitbit Charge 6 Fitness Tracker (Obsidian)|199|249|Colour=Obsidian;Connectivity=Bluetooth|deal
WE|Fitness trackers|Garmin|Garmin vivosmart 5 Fitness Tracker (Black)|199||Colour=Black;Connectivity=Bluetooth|
WE|Watch straps|Apple|Apple 46mm Sport Loop Watch Band (Ultramarine)|79||Colour=Ultramarine;Case size=46mm|
TV|TVs|Samsung|Samsung 65" S90F 4K OLED Smart TV [2025]|2995|3995|Colour=Black;Display size=65 inch;Resolution=4K;Panel=OLED|deal top movie
TV|TVs|Samsung|Samsung 55" Q7F 4K QLED Smart TV [2025]|995|1295|Colour=Black;Display size=55 inch;Resolution=4K;Panel=QLED|deal movie
TV|TVs|Samsung|Samsung 85" QN90F 4K Neo QLED Smart TV [2025]|4995|6495|Colour=Black;Display size=85 inch;Resolution=4K;Panel=Neo QLED|movie
TV|TVs|LG|LG 65" C5 4K OLED evo AI Smart TV [2025]|3195|4199|Colour=Black;Display size=65 inch;Resolution=4K;Panel=OLED|deal top movie
TV|TVs|LG|LG 55" B5 4K OLED AI Smart TV [2025]|1995|2499|Colour=Black;Display size=55 inch;Resolution=4K;Panel=OLED|deal movie
TV|TVs|LG|LG 77" G5 4K OLED evo AI Smart TV [2025]|5995||Colour=Black;Display size=77 inch;Resolution=4K;Panel=OLED|movie
TV|TVs|Sony|Sony BRAVIA 8 II 65" 4K QD-OLED Google TV [2025]|4495||Colour=Black;Display size=65 inch;Resolution=4K;Panel=QD-OLED|movie
TV|TVs|Sony|Sony BRAVIA 5 75" 4K Mini LED Google TV|2995|3499|Colour=Black;Display size=75 inch;Resolution=4K;Panel=Mini LED|movie
TV|TVs|Hisense|Hisense 75" U7 4K Mini-LED ULED Smart TV [2025]|1795|2295|Colour=Black;Display size=75 inch;Resolution=4K;Panel=Mini LED|deal movie
TV|TVs|Hisense|Hisense 50" Q6 4K QLED Smart TV [2025]|595||Colour=Black;Display size=50 inch;Resolution=4K;Panel=QLED|movie
TV|TVs|TCL|TCL 65" C7K QD-Mini LED 4K Google TV|1495|1995|Colour=Black;Display size=65 inch;Resolution=4K;Panel=Mini LED|deal movie
TV|TVs|TCL|TCL 43" P7K 4K QLED Google TV|449||Colour=Black;Display size=43 inch;Resolution=4K;Panel=QLED|movie
TV|TVs|Samsung|Samsung 43" The Frame 4K QLED Smart TV [2025]|1295||Colour=Black;Display size=43 inch;Resolution=4K;Panel=QLED|
TV|Soundbars|Sonos|Sonos Arc Ultra Smart Soundbar (Black)|1499||Colour=Black;Channels=9.1.4;Connectivity=HDMI eARC / Wi-Fi|top movie
TV|Soundbars|Sonos|Sonos Beam (Gen 2) Smart Soundbar (White)|699||Colour=White;Channels=5.0;Connectivity=HDMI eARC / Wi-Fi|movie
TV|Soundbars|Samsung|Samsung HW-Q990F 11.1.4ch Dolby Atmos Soundbar|1495|1999|Colour=Black;Channels=11.1.4;Connectivity=HDMI eARC / Wi-Fi|deal movie
TV|Soundbars|Sony|Sony BRAVIA Theatre Bar 8 Dolby Atmos Soundbar|995||Colour=Black;Channels=5.0.2;Connectivity=HDMI eARC / Wi-Fi|movie
TV|Soundbars|JBL|JBL Bar 500MK2 5.1ch Dolby Atmos Soundbar|699|799|Colour=Black;Channels=5.1;Connectivity=HDMI eARC / Bluetooth|deal movie
TV|Projectors|Epson|Epson EH-LS650B 4K PRO-UHD Ultra Short Throw Smart Laser Projector|3499||Colour=Black;Resolution=4K PRO-UHD;Brightness=3600 lumens|movie
TV|Projectors|XGIMI|XGIMI MoGo 3 Pro Portable Smart Projector|699||Colour=Grey;Resolution=1080p;Brightness=450 ISO lumens|
TV|Streaming players|Apple|Apple TV 4K Wi-Fi + Ethernet 128GB|249||Colour=Black;Resolution=4K;Storage=128GB|movie
TV|Streaming players|Google|Google TV Streamer 4K (Porcelain)|159||Colour=Porcelain;Resolution=4K|movie
TV|Streaming players|Fetch|Fetch Mini 4K Streaming Set-Top Box|149||Colour=Black;Resolution=4K|clear
TV|Blu-ray & DVD players|Sony|Sony UBP-X700 4K Ultra HD Blu-ray Player|329||Colour=Black;Format=4K Ultra HD Blu-ray|movie
TV|TV wall brackets|Sanus|Sanus Full Motion TV Wall Mount for 42"-90" TVs|299||Colour=Black;Compatibility=42-90 inch TVs|
TV|TV wall brackets|Belkin|Belkin UltraHD High Speed HDMI 2.1 Cable 2m|59||Colour=Black;Length=2m;Connector=HDMI 2.1|
HA|Headphones|Sony|Sony WH-1000XM6 Wireless Noise Cancelling Headphones (Black)|649||Colour=Black;Connectivity=Bluetooth;Style=Over-ear;Noise cancelling=Yes;Battery life=30 hours|top new
HA|Headphones|Sony|Sony WH-1000XM5 Wireless Noise Cancelling Headphones (Silver)|399|549|Colour=Silver;Connectivity=Bluetooth;Style=Over-ear;Noise cancelling=Yes;Battery life=30 hours|deal
HA|Headphones|Bose|Bose QuietComfort Ultra Wireless Noise Cancelling Headphones (2nd Gen) (Black)|649||Colour=Black;Connectivity=Bluetooth;Style=Over-ear;Noise cancelling=Yes;Battery life=30 hours|new
HA|Headphones|Apple|Apple AirPods Max (USB-C) (Midnight)|899||Colour=Midnight;Connectivity=Bluetooth;Style=Over-ear;Noise cancelling=Yes|
HA|Headphones|Sennheiser|Sennheiser MOMENTUM 4 Wireless Headphones (Graphite)|399|549|Colour=Graphite;Connectivity=Bluetooth;Style=Over-ear;Noise cancelling=Yes;Battery life=60 hours|deal
HA|Headphones|JBL|JBL Tune 770NC Wireless Noise Cancelling Headphones (Blue)|129|179|Colour=Blue;Connectivity=Bluetooth;Style=Over-ear;Noise cancelling=Yes;Battery life=70 hours|deal
HA|Headphones|Beats|Beats Studio Pro Wireless Headphones (Sandstone)|399|549|Colour=Sandstone;Connectivity=Bluetooth;Style=Over-ear;Noise cancelling=Yes|deal
HA|Earbuds|Apple|Apple AirPods Pro 3|429||Colour=White;Connectivity=Bluetooth;Style=In-ear;Noise cancelling=Yes|top new
HA|Earbuds|Apple|Apple AirPods 4 with Active Noise Cancellation|299||Colour=White;Connectivity=Bluetooth;Style=In-ear;Noise cancelling=Yes|
HA|Earbuds|Samsung|Samsung Galaxy Buds3 Pro (Silver)|299|379|Colour=Silver;Connectivity=Bluetooth;Style=In-ear;Noise cancelling=Yes|deal
HA|Earbuds|Sony|Sony WF-1000XM5 Truly Wireless Noise Cancelling Earbuds (Black)|349|499|Colour=Black;Connectivity=Bluetooth;Style=In-ear;Noise cancelling=Yes|deal
HA|Earbuds|Bose|Bose QuietComfort Ultra Earbuds (2nd Gen) (Black)|449||Colour=Black;Connectivity=Bluetooth;Style=In-ear;Noise cancelling=Yes|
HA|Earbuds|JBL|JBL Tune Beam 2 True Wireless Earbuds (Black)|99|149|Colour=Black;Connectivity=Bluetooth;Style=In-ear|deal
HA|Earbuds|Beats|Beats Powerbeats Pro 2 (Jet Black)|399||Colour=Jet Black;Connectivity=Bluetooth;Style=In-ear|
HA|Portable speakers|JBL|JBL Flip 7 Portable Bluetooth Speaker (Black)|199||Colour=Black;Connectivity=Bluetooth;Protection=IP68;Battery life=14 hours|top
HA|Portable speakers|JBL|JBL Charge 6 Portable Bluetooth Speaker (Blue)|279|299|Colour=Blue;Connectivity=Bluetooth;Protection=IP68;Battery life=24 hours|deal
HA|Portable speakers|Ultimate Ears|Ultimate Ears BOOM 4 Portable Bluetooth Speaker (Active Black)|249||Colour=Black;Connectivity=Bluetooth;Protection=IP67;Battery life=15 hours|
HA|Portable speakers|Bose|Bose SoundLink Max Portable Speaker (Black)|599||Colour=Black;Connectivity=Bluetooth;Protection=IP67;Battery life=20 hours|
HA|Portable speakers|Sony|Sony ULT FIELD 1 Portable Wireless Speaker (Forest Grey)|199|249|Colour=Forest Grey;Connectivity=Bluetooth;Protection=IP67;Battery life=12 hours|deal
HA|Portable speakers|JBL|JBL PartyBox Encore 2 Portable Party Speaker|599||Colour=Black;Connectivity=Bluetooth;Battery life=15 hours|
HA|Smart speakers|Sonos|Sonos Era 100 Smart Speaker (Black)|399||Colour=Black;Connectivity=Wi-Fi / Bluetooth|
HA|Smart speakers|Sonos|Sonos Era 300 Smart Speaker (White)|749||Colour=White;Connectivity=Wi-Fi / Bluetooth|
HA|Smart speakers|Google|Google Nest Audio Smart Speaker (Chalk)|149||Colour=Chalk;Connectivity=Wi-Fi / Bluetooth|clear
HA|Smart speakers|Amazon|Amazon Echo Dot (5th Gen) Smart Speaker with Alexa (Charcoal)|79||Colour=Charcoal;Connectivity=Wi-Fi / Bluetooth|
HA|Turntables|Audio-Technica|Audio-Technica AT-LP60XBT Bluetooth Turntable (Black)|299||Colour=Black;Connectivity=Bluetooth;Speed=33⅓ / 45 rpm|
HA|Turntables|Audio-Technica|Audio-Technica AT-LP120XUSB Direct-Drive Turntable (Silver)|599||Colour=Silver;Connectivity=USB;Speed=33⅓ / 45 / 78 rpm|
HA|Turntables|Crosley|Crosley Cruiser Plus Portable Turntable (Mint)|129||Colour=Mint;Connectivity=Bluetooth;Speed=33⅓ / 45 / 78 rpm|
HA|Hi-Fi systems|Audioengine|Audioengine A2+ Wireless Bookshelf Speakers (Black)|499||Colour=Black;Connectivity=Bluetooth / USB|
HA|Hi-Fi systems|Yamaha|Yamaha R-N600A Network Stereo Receiver|1199||Colour=Black;Connectivity=Wi-Fi / Bluetooth / HDMI ARC|
CA|Mirrorless cameras|Sony|Sony Alpha a7 IV Mirrorless Camera with 28-70mm Lens|3999|4399|Colour=Black;Sensor=Full frame 33MP;Video resolution=4K 60p|deal
CA|Mirrorless cameras|Canon|Canon EOS R50 Mirrorless Camera with RF-S 18-45mm Lens Kit (Black)|1099||Colour=Black;Sensor=APS-C 24.2MP;Video resolution=4K 30p|top
CA|Mirrorless cameras|Nikon|Nikon Z50II Mirrorless Camera with 16-50mm Lens Kit|1699||Colour=Black;Sensor=APS-C 20.9MP;Video resolution=4K 60p|
CA|Mirrorless cameras|Fujifilm|Fujifilm X-M5 Mirrorless Camera with XC 15-45mm Lens Kit (Silver)|1399||Colour=Silver;Sensor=APS-C 26.1MP;Video resolution=6.2K 30p|new
CA|Camera lenses|Sony|Sony FE 50mm F1.8 Prime Lens|349||Mount=Sony E;Focal length=50mm|
CA|Camera lenses|Canon|Canon RF 24-105mm F4-7.1 IS STM Lens|699||Mount=Canon RF;Focal length=24-105mm|
CA|Action cameras|GoPro|GoPro HERO13 Black Action Camera|649|749|Colour=Black;Video resolution=5.3K 60p;Protection=Waterproof to 10m|deal
CA|Action cameras|DJI|DJI Osmo Action 5 Pro Standard Combo|599||Colour=Black;Video resolution=4K 120p;Protection=Waterproof to 20m|
CA|Action cameras|Insta360|Insta360 X5 360 Action Camera|849||Colour=Black;Video resolution=8K 30p;Protection=Waterproof to 15m|new
CA|Action cameras|DJI|DJI Osmo Pocket 3 Creator Combo Gimbal Camera|899||Colour=Black;Video resolution=4K 120p|
CA|Instant cameras|Fujifilm|Fujifilm Instax Mini 12 Instant Camera (Lilac Purple)|119||Colour=Lilac Purple;Film=Instax Mini|top
CA|Instant cameras|Fujifilm|Fujifilm Instax Mini Film Twin Pack (20 Shots)|29||Film=Instax Mini;Exposures=20|
CA|Instant cameras|Polaroid|Polaroid Now Generation 2 i-Type Instant Camera (Black)|199||Colour=Black;Film=i-Type / 600|clear
CA|Drones|DJI|DJI Mini 4 Pro Drone with DJI RC 2|1399|1549|Colour=Grey;Video resolution=4K 100p;Flight time=34 minutes|deal
CA|Drones|DJI|DJI Neo Fly More Combo Drone|399||Colour=Grey;Video resolution=4K 30p;Flight time=18 minutes|
GA|PlayStation consoles|Sony|PlayStation 5 Console Digital Edition Slim (825GB)|649||Colour=White;Storage=825GB;Format=Digital|top ps5
GA|PlayStation consoles|Sony|PlayStation 5 Console Slim (1TB)|799||Colour=White;Storage=1TB;Format=Disc|ps5
GA|PlayStation consoles|Sony|PlayStation 5 Pro Console (2TB)|1199||Colour=White;Storage=2TB;Format=Digital|ps5
GA|Xbox consoles|Microsoft|Xbox Series S 512GB Console (Robot White)|599||Colour=Robot White;Storage=512GB;Format=Digital|xbox
GA|Nintendo Switch consoles|Nintendo|Nintendo Switch 2 Console|699||Colour=Black;Storage=256GB|top switch-2
GA|Nintendo Switch consoles|Nintendo|Nintendo Switch 2 Console + Mario Kart World Bundle|769||Colour=Black;Storage=256GB|switch-2
GA|Nintendo Switch consoles|Nintendo|Nintendo Switch OLED Console (Neon)|499||Colour=Neon Red / Neon Blue;Storage=64GB|switch
GA|Nintendo Switch consoles|Nintendo|Nintendo Switch Lite Console (Turquoise)|299||Colour=Turquoise;Storage=32GB|switch
GA|PC gaming|ASUS|ASUS ROG Xbox Ally Handheld Gaming PC (512GB)|899||Colour=White;Storage=512GB;Processor=AMD Ryzen Z2 A|new pc
GA|PC gaming|Logitech|Logitech G PRO X Superlight 2 Wireless Gaming Mouse (Black)|229|269|Colour=Black;Connectivity=LIGHTSPEED wireless|deal pc
GA|PC gaming|Razer|Razer BlackWidow V4 X Mechanical Gaming Keyboard|179||Colour=Black;Connectivity=USB;Switch=Razer Green|pc
GA|VR|Meta|Meta Quest 3S 128GB Mixed Reality Headset|499||Colour=White;Storage=128GB|
GA|PS5 games|Sony Interactive Entertainment|Ghost of Yotei|79||Genre=Action & Adventure;Classification=MA15+;Game publisher=Sony Interactive Entertainment|top ps5 r:MA15+
GA|PS5 games|Sony Interactive Entertainment|Astro Bot|69||Genre=Platformer;Classification=G;Game publisher=Sony Interactive Entertainment|ps5 r:G
GA|PS5 games|Sony Interactive Entertainment|Death Stranding 2: On the Beach|79||Genre=Action & Adventure;Classification=MA15+;Game publisher=Sony Interactive Entertainment|ps5 r:MA15+
GA|PS5 games|Electronic Arts|EA SPORTS FC 26|79|109|Genre=Sports;Classification=G;Game publisher=Electronic Arts|deal ps5 r:G
GA|PS5 games|Electronic Arts|Battlefield 6|99||Genre=Shooter;Classification=MA15+;Game publisher=Electronic Arts|new ps5 r:MA15+
GA|PS5 games|2K|Borderlands 4|89||Genre=Shooter;Classification=MA15+;Game publisher=2K|ps5 r:MA15+
GA|PS5 games|2K|NBA 2K26|69|99|Genre=Sports;Classification=G;Game publisher=2K|deal ps5 r:G
GA|PS5 games|Rockstar Games|Red Dead Redemption 2|39||Genre=Action & Adventure;Classification=R18+;Game publisher=Rockstar Games|ps5 r:R18+
GA|PS5 games|Rockstar Games|Grand Theft Auto V|49||Genre=Action & Adventure;Classification=R18+;Game publisher=Rockstar Games|ps5 r:R18+
GA|PS5 games|Capcom|Resident Evil Requiem|89||Genre=Survival Horror;Classification=R18+;Game publisher=Capcom|ps5 r:R18+
GA|PS5 games|Bandai Namco|Elden Ring Nightreign|59||Genre=Role-playing;Classification=MA15+;Game publisher=Bandai Namco|ps5 r:MA15+
GA|PS5 games|Ubisoft|Assassin's Creed Shadows|59|99|Genre=Action & Adventure;Classification=MA15+;Game publisher=Ubisoft|deal ps5 r:MA15+
GA|PS5 games|Warner Bros. Games|Hogwarts Legacy|39||Genre=Role-playing;Classification=M;Game publisher=Warner Bros. Games|ps5 r:M
GA|PS5 games|Sony Interactive Entertainment|Gran Turismo 7|49||Genre=Racing;Classification=G;Game publisher=Sony Interactive Entertainment|ps5 r:G
GA|PS5 games|Bethesda|DOOM: The Dark Ages|79||Genre=Shooter;Classification=R18+;Game publisher=Bethesda|ps5 r:R18+
GA|PS5 games|Electronic Arts|EA SPORTS F1 25|59|99|Genre=Racing;Classification=G;Game publisher=Electronic Arts|clear ps5 r:G
GA|Xbox games|Electronic Arts|Battlefield 6|99||Genre=Shooter;Classification=MA15+;Game publisher=Electronic Arts|new xbox r:MA15+
GA|Xbox games|Electronic Arts|EA SPORTS FC 26|79|109|Genre=Sports;Classification=G;Game publisher=Electronic Arts|deal xbox r:G
GA|Xbox games|Xbox Game Studios|Forza Horizon 5|59||Genre=Racing;Classification=G;Game publisher=Xbox Game Studios|xbox r:G
GA|Xbox games|Bethesda|Indiana Jones and the Great Circle|69||Genre=Action & Adventure;Classification=M;Game publisher=Bethesda|xbox r:M
GA|Xbox games|2K|Borderlands 4|89||Genre=Shooter;Classification=MA15+;Game publisher=2K|xbox r:MA15+
GA|Xbox games|Rockstar Games|Red Dead Redemption 2|39||Genre=Action & Adventure;Classification=R18+;Game publisher=Rockstar Games|xbox r:R18+
GA|Nintendo Switch games|Nintendo|Mario Kart World|99||Genre=Racing;Classification=G;Game publisher=Nintendo|top switch-2 r:G
GA|Nintendo Switch games|Nintendo|Donkey Kong Bananza|99||Genre=Platformer;Classification=PG;Game publisher=Nintendo|switch-2 r:PG
GA|Nintendo Switch games|Nintendo|Pokemon Legends: Z-A Nintendo Switch 2 Edition|99||Genre=Role-playing;Classification=PG;Game publisher=Nintendo|new switch-2 r:PG
GA|Nintendo Switch games|Nintendo|Kirby Air Riders|99||Genre=Racing;Classification=G;Game publisher=Nintendo|new switch-2 r:G
GA|Nintendo Switch games|Nintendo|Metroid Prime 4: Beyond Nintendo Switch 2 Edition|99||Genre=Action & Adventure;Classification=M;Game publisher=Nintendo|switch-2 r:M
GA|Nintendo Switch games|Nintendo|The Legend of Zelda: Tears of the Kingdom|79||Genre=Action & Adventure;Classification=M;Game publisher=Nintendo|switch r:M
GA|Nintendo Switch games|Nintendo|Super Mario Party Jamboree|69||Genre=Party;Classification=G;Game publisher=Nintendo|switch r:G
GA|Nintendo Switch games|Nintendo|Animal Crossing: New Horizons|69||Genre=Simulation;Classification=G;Game publisher=Nintendo|switch r:G
GA|Nintendo Switch games|Mojang|Minecraft|39||Genre=Sandbox;Classification=PG;Game publisher=Mojang Studios|switch r:PG
GA|PC games|Team Cherry|Hollow Knight: Silksong|35||Genre=Platformer;Classification=PG;Game publisher=Team Cherry|pc r:PG
GA|PS5 accessories|Sony|PlayStation 5 DualSense Wireless Controller (Midnight Black)|109|119|Colour=Midnight Black;Connectivity=Bluetooth / USB-C|deal top ps5
GA|PS5 accessories|Sony|PlayStation 5 DualSense Wireless Controller (Cobalt Blue)|119||Colour=Cobalt Blue;Connectivity=Bluetooth / USB-C|ps5
GA|PS5 accessories|Sony|PlayStation Pulse Elite Wireless Headset|229||Colour=White;Connectivity=PlayStation Link / Bluetooth|ps5
GA|PS5 accessories|Sony|PlayStation Portal Remote Player|329||Colour=White;Connectivity=Wi-Fi|ps5
GA|Xbox accessories|Microsoft|Xbox Wireless Controller (Carbon Black)|89||Colour=Carbon Black;Connectivity=Bluetooth / USB-C|xbox
GA|Xbox accessories|Microsoft|Xbox Wireless Controller (Velocity Green)|99||Colour=Velocity Green;Connectivity=Bluetooth / USB-C|xbox
GA|Nintendo Switch accessories|Nintendo|Nintendo Switch 2 Pro Controller|129||Colour=Black;Connectivity=Bluetooth / USB-C|switch-2
GA|Nintendo Switch accessories|Nintendo|Nintendo Switch 2 Joy-Con 2 Pair (Light Blue / Light Red)|149||Colour=Light Blue / Light Red;Connectivity=Bluetooth|switch-2
GA|Nintendo Switch accessories|SanDisk|SanDisk microSD Express Card for Nintendo Switch 2 (256GB)|99||Storage=256GB;Compatibility=Nintendo Switch 2|switch-2
GA|Gaming accessories|SteelSeries|SteelSeries Arctis Nova 5 Wireless Gaming Headset (Black)|229|269|Colour=Black;Connectivity=2.4GHz wireless / Bluetooth|deal
GA|Gaming accessories|Turtle Beach|Turtle Beach Stealth 600 Gen 3 Wireless Gaming Headset (Black)|149||Colour=Black;Connectivity=2.4GHz wireless / Bluetooth|
GA|Gaming accessories|Logitech|Logitech G923 Racing Wheel and Pedals for PS5 / PC|399|499|Colour=Black;Compatibility=PS5 / PS4 / PC|deal
GA|Gaming accessories|PowerA|PowerA Dual Charging Station for PS5 DualSense Controllers|39||Colour=White;Compatibility=PS5 DualSense|clear
AP|Coffee machines|Breville|Breville the Barista Express Espresso Machine (Brushed Stainless Steel)|699|899|Colour=Brushed Stainless Steel;Type=Manual espresso;Water capacity=2L|deal top kitchen
AP|Coffee machines|Breville|Breville the Barista Touch Impress Espresso Machine (Black Truffle)|1999||Colour=Black Truffle;Type=Automatic espresso;Water capacity=2L|kitchen
AP|Coffee machines|De'Longhi|De'Longhi Magnifica Evo Fully Automatic Coffee Machine|999|1199|Colour=Black;Type=Fully automatic;Water capacity=1.8L|deal kitchen
AP|Coffee machines|Nespresso|Nespresso Vertuo Pop Capsule Coffee Machine (Aqua Mint)|149|199|Colour=Aqua Mint;Type=Capsule;Water capacity=0.6L|deal kitchen
AP|Coffee machines|Breville|Breville the Bambino Plus Espresso Machine (Sea Salt)|549||Colour=Sea Salt;Type=Manual espresso;Water capacity=1.9L|kitchen
AP|Vacuums|Dyson|Dyson V15 Detect Absolute Cordless Stick Vacuum (Yellow/Nickel)|1149|1349|Colour=Yellow / Nickel;Type=Cordless stick;Runtime=Up to 60 minutes|deal top
AP|Vacuums|Dyson|Dyson V8 Origin Extra Cordless Stick Vacuum|499||Colour=Purple;Type=Cordless stick;Runtime=Up to 40 minutes|
AP|Vacuums|Shark|Shark Stratos Cordless Stick Vacuum with Clean Sense IQ|699|899|Colour=Grey;Type=Cordless stick;Runtime=Up to 60 minutes|deal
AP|Vacuums|Roborock|Roborock Qrevo Curv Robot Vacuum and Mop|1499|1899|Colour=Black;Type=Robot vacuum & mop;Runtime=Up to 180 minutes|deal
AP|Vacuums|Samsung|Samsung Bespoke Jet AI Cordless Stick Vacuum|1099||Colour=Satin Grey;Type=Cordless stick;Runtime=Up to 100 minutes|
AP|Kitchen appliances|Ninja|Ninja Foodi MAX Dual Zone Air Fryer AF400|299|349|Colour=Black;Capacity=9.5L;Power=2470W|deal kitchen
AP|Kitchen appliances|Philips|Philips 3000 Series Airfryer XL 6.2L|179||Colour=Black;Capacity=6.2L;Power=1700W|kitchen
AP|Kitchen appliances|Ninja|Ninja CREAMi Deluxe Ice Cream Maker NC501|299||Colour=Silver;Capacity=709ml tubs|new kitchen
AP|Kitchen appliances|KitchenAid|KitchenAid Artisan KSM195 Stand Mixer (Empire Red)|849|999|Colour=Empire Red;Capacity=4.8L bowl;Power=300W|kitchen
AP|Kitchen appliances|Smeg|Smeg 50's Style Electric Kettle (Pastel Blue)|249||Colour=Pastel Blue;Capacity=1.7L|kitchen
AP|Kitchen appliances|Breville|Breville the Bit More 4-Slice Toaster (Brushed Stainless Steel)|119||Colour=Brushed Stainless Steel;Slots=4|kitchen
AP|Kitchen appliances|Panasonic|Panasonic NN-ST64JB 32L Inverter Microwave Oven|249||Colour=Black;Capacity=32L;Power=1000W|kitchen
AP|Kitchen appliances|Breville|Breville the Super Q Blender (Brushed Stainless Steel)|599||Colour=Brushed Stainless Steel;Capacity=2L;Power=2400W|kitchen
AP|Fridges & freezers|Samsung|Samsung 635L French Door Fridge with Beverage Centre SRF7500BB|2999|3599|Colour=Black Stainless;Capacity=635L;Energy rating=4 stars|deal
AP|Fridges & freezers|LG|LG 420L Bottom Mount Fridge GB-455PL|1199||Colour=Stainless;Capacity=420L;Energy rating=4 stars|
AP|Fridges & freezers|Hisense|Hisense 100L Bar Fridge HRBF100|299||Colour=White;Capacity=100L;Energy rating=3 stars|
AP|Washing machines & dryers|LG|LG 10kg Series 5 Front Load Washing Machine WV5-1410W|899|1099|Colour=White;Capacity=10kg;Energy rating=5 stars|deal
AP|Washing machines & dryers|Samsung|Samsung 8kg Heat Pump Dryer DV80CG|1199||Colour=White;Capacity=8kg;Energy rating=8 stars|
AP|Washing machines & dryers|Fisher & Paykel|Fisher & Paykel 9kg Front Loader Washing Machine WH9060J3|1099||Colour=White;Capacity=9kg;Energy rating=4.5 stars|
AP|Heating & cooling|Dyson|Dyson Purifier Cool PC1 Air Purifier Fan (White/Silver)|699||Colour=White / Silver;Filter=HEPA H13;Room coverage=Up to 81m²|
AP|Heating & cooling|De'Longhi|De'Longhi Pinguino Portable Air Conditioner PAC EL98|899||Colour=White;Cooling capacity=2.7kW|
AP|Heating & cooling|Philips|Philips 2000 Series Air Purifier AC2939|399|499|Colour=White;Filter=HEPA;Room coverage=Up to 79m²|deal
SH|Security cameras|Arlo|Arlo Pro 5S 2K Wire-Free Security Camera (2 Pack)|599|799|Colour=White;Resolution=2K;Connectivity=Wi-Fi|deal
SH|Security cameras|Eufy|eufy SoloCam S220 Solar Security Camera|149||Colour=White;Resolution=2K;Connectivity=Wi-Fi|
SH|Security cameras|Google|Google Nest Cam (Indoor, Wired, 2nd Gen) (Snow)|149||Colour=Snow;Resolution=1080p;Connectivity=Wi-Fi|
SH|Video doorbells|Ring|Ring Battery Video Doorbell Pro|349||Colour=Satin Nickel;Resolution=1536p;Connectivity=Wi-Fi|
SH|Video doorbells|Google|Google Nest Doorbell (Battery) (Snow)|299||Colour=Snow;Resolution=960 x 1280;Connectivity=Wi-Fi|
SH|Smart lighting|Philips Hue|Philips Hue White and Colour Ambiance E27 Smart Bulb (3 Pack)|169|199|Colour=White;Connectivity=Bluetooth / Zigbee|deal
SH|Smart lighting|Philips Hue|Philips Hue Bridge Pro|149||Colour=White;Connectivity=Zigbee / Ethernet|new
SH|Smart lighting|Nanoleaf|Nanoleaf Shapes Hexagons Smarter Kit (9 Pack)|299||Colour=White;Connectivity=Wi-Fi / Thread|
SH|Smart plugs & power|TP-Link|TP-Link Tapo P110 Mini Smart Wi-Fi Plug (2 Pack)|39||Colour=White;Connectivity=Wi-Fi|
SH|Smart plugs & power|Google|Google Nest Learning Thermostat (4th Gen)|499||Colour=Polished Silver;Connectivity=Wi-Fi / Thread|
HB|Hair care|Dyson|Dyson Airwrap i.d. Multi-Styler and Dryer (Vinca Blue/Topaz)|949||Colour=Vinca Blue / Topaz;Power=1300W|top
HB|Hair care|Dyson|Dyson Supersonic Nural Hair Dryer (Ceramic Patina/Topaz)|699||Colour=Ceramic Patina / Topaz;Power=1600W|
HB|Hair care|ghd|ghd Platinum+ Hair Straightener (Black)|429||Colour=Black|
HB|Hair care|Remington|Remington Pro Luxe You Adaptive Hair Dryer|99|149|Colour=Rose Gold;Power=2200W|deal
HB|Shavers & trimmers|Philips|Philips OneBlade 360 Face + Body QP2834|89|119|Colour=Lime Green / Charcoal|deal
HB|Shavers & trimmers|Braun|Braun Series 9 Pro+ Wet & Dry Shaver with PowerCase|599||Colour=Graphite|
HB|Electric toothbrushes|Oral-B|Oral-B iO Series 9 Electric Toothbrush (Rose Quartz)|399|499|Colour=Rose Quartz|deal
HB|Electric toothbrushes|Philips|Philips Sonicare 3100 Series Electric Toothbrush (White)|79||Colour=White|
HB|Massagers|Therabody|Theragun Mini (3rd Gen) Massage Gun (Black)|299||Colour=Black|
MU|Vinyl|EMI|Taylor Swift - The Life of a Showgirl (Vinyl)|59||Format=Vinyl;Discs=1 LP;Genre=Pop|top new
MU|Vinyl|Universal Music|Sabrina Carpenter - Man's Best Friend (Vinyl)|54||Format=Vinyl;Discs=1 LP;Genre=Pop|new
MU|Vinyl|Interscope|Billie Eilish - Hit Me Hard and Soft (Vinyl)|54||Format=Vinyl;Discs=1 LP;Genre=Pop|
MU|Vinyl|Warner Music|Fleetwood Mac - Rumours (Vinyl)|49||Format=Vinyl;Discs=1 LP;Genre=Rock|
MU|Vinyl|Sony Music|Oasis - (What's The Story) Morning Glory? (30th Anniversary Edition) (Vinyl)|69||Format=Vinyl;Discs=2 LP;Genre=Rock|
MU|Vinyl|Universal Music|Tame Impala - Deadbeat (Vinyl)|59||Format=Vinyl;Discs=2 LP;Genre=Alternative|new
MU|Vinyl|Capitol|The Beatles - Abbey Road (Vinyl)|49||Format=Vinyl;Discs=1 LP;Genre=Rock|
MU|Vinyl|Universal Music|Kendrick Lamar - GNX (Vinyl)|54||Format=Vinyl;Discs=1 LP;Genre=Hip Hop|
MU|Vinyl|Universal Music|Lady Gaga - Mayhem (Vinyl)|54||Format=Vinyl;Discs=1 LP;Genre=Pop|
MU|Vinyl|Sony Music|Midnight Oil - Diesel and Dust (Vinyl)|45||Format=Vinyl;Discs=1 LP;Genre=Rock|
MU|Vinyl|EMI|Taylor Swift - The Life of a Showgirl (JB Exclusive Orange Vinyl)|64||Format=Vinyl;Discs=1 LP;Genre=Pop|excl new
MU|Vinyl|Universal Music|Tame Impala - Currents (10th Anniversary) (JB Exclusive Coloured Vinyl)|69||Format=Vinyl;Discs=2 LP;Genre=Alternative|excl
MU|CDs|EMI|Taylor Swift - The Life of a Showgirl (CD)|24.99||Format=CD;Discs=1;Genre=Pop|new
MU|CDs|Universal Music|Sabrina Carpenter - Man's Best Friend (CD)|19.99||Format=CD;Discs=1;Genre=Pop|
MU|CDs|Sony Music|AC/DC - Back in Black (CD)|14.99||Format=CD;Discs=1;Genre=Rock|
MU|CDs|ABC Music|The Wiggles - Wiggle Up, Giddy Up! (CD)|14.99||Format=CD;Discs=1;Genre=Kids|clear
MU|Musical instruments|Fender|Fender Squier Sonic Stratocaster Electric Guitar (Black)|299||Colour=Black;Type=Electric guitar|
MU|Musical instruments|Yamaha|Yamaha PSR-E383 61-Key Portable Keyboard Piano|299||Colour=Black;Keys=61|
MO|4K Ultra HD|Warner Bros.|Superman (4K Ultra HD + Blu-ray)|39.99||Format=4K Ultra HD;Classification=M;Region=B|new movie
MO|4K Ultra HD|Universal Pictures|Jurassic World Rebirth (4K Ultra HD + Blu-ray)|39.99||Format=4K Ultra HD;Classification=M;Region=B|new movie
MO|4K Ultra HD|Warner Bros.|F1 The Movie (4K Ultra HD + Blu-ray)|39.99||Format=4K Ultra HD;Classification=M;Region=B|new movie
MO|4K Ultra HD|Warner Bros.|Dune: Part Two (4K Ultra HD + Blu-ray)|29.99||Format=4K Ultra HD;Classification=M;Region=B|movie
MO|4K Ultra HD|Universal Pictures|Oppenheimer (4K Ultra HD + Blu-ray)|29.99||Format=4K Ultra HD;Classification=M;Region=B|movie
MO|4K Ultra HD|Warner Bros.|Sinners (4K Ultra HD + Blu-ray)|39.99||Format=4K Ultra HD;Classification=MA15+;Region=B|movie
MO|Blu-ray|Disney|Lilo & Stitch (2025) (Blu-ray)|29.99||Format=Blu-ray;Classification=PG;Region=B|movie
MO|Blu-ray|Universal Pictures|Wicked (Blu-ray)|24.99||Format=Blu-ray;Classification=PG;Region=B|movie
MO|Blu-ray|Warner Bros.|A Minecraft Movie (Blu-ray)|24.99||Format=Blu-ray;Classification=PG;Region=B|movie
MO|DVD|BBC|Bluey: The Magic Xylophone and Other Stories (DVD)|14.99||Format=DVD;Classification=G;Region=4|
MO|TV series|HBO|The Last of Us: Season 2 (Blu-ray)|39.99||Format=Blu-ray;Classification=MA15+;Region=B|movie
MO|TV series|Paramount|Yellowstone: The Complete Series (DVD)|149.99|199.99|Format=DVD;Classification=MA15+;Region=4|deal movie
CO|LEGO|LEGO|LEGO Technic Ferrari SF-24 F1 Car 42207|349||Recommended age=18+;Pieces=1361|top
CO|LEGO|LEGO|LEGO Star Wars Millennium Falcon 75375|149||Recommended age=18+;Pieces=921|
CO|LEGO|LEGO|LEGO Icons Bouquet of Roses 10328|99|119|Recommended age=18+;Pieces=822|deal
CO|LEGO|LEGO|LEGO Super Mario Mario Kart - Mario & Standard Kart 72032|249||Recommended age=18+;Pieces=1972|new
CO|Pop! Vinyl|Funko|Funko Pop! Vinyl Stranger Things - Eleven|25||Height=9.5cm;Material=Vinyl|
CO|Pop! Vinyl|Funko|Funko Pop! Vinyl Wednesday - Wednesday Addams|25||Height=9.5cm;Material=Vinyl|
CO|Figurines|Nintendo|amiibo Donkey Kong (Donkey Kong Bananza)|25||Compatibility=Nintendo Switch 2|
CO|Trading cards|The Pokemon Company|Pokemon TCG: Scarlet & Violet Prismatic Evolutions Booster Bundle|69||Packs=6 booster packs|online
CO|Games & puzzles|Hasbro|Monopoly Classic Board Game|39||Players=2-8;Recommended age=8+|
CR|Dash cams|Garmin|Garmin Dash Cam Mini 2|179|229|Resolution=1080p;Connectivity=Wi-Fi|deal
CR|Dash cams|Navman|Navman MiVue Halo Front & Rear 4K Dash Cam|399||Resolution=4K front / 1080p rear;Connectivity=Wi-Fi|
CR|Car stereos|Pioneer|Pioneer DMH-A4450BT 6.8" Wireless Apple CarPlay & Android Auto Car Stereo|499||Display size=6.8 inch;Connectivity=Bluetooth|
CR|GPS navigation|Garmin|Garmin DriveSmart 76 7" GPS Navigator|399||Display size=7 inch;Maps=Australia & New Zealand|
ET|e-Scooters|Segway|Segway Ninebot KickScooter E2 Pro E Electric Scooter|599|699|Colour=Black;Top speed=25 km/h;Range=Up to 35 km|deal
ET|e-Scooters|Xiaomi|Xiaomi Electric Scooter 4 Lite (2nd Gen)|549||Colour=Black;Top speed=25 km/h;Range=Up to 25 km|
ET|e-Bikes|Fiido|Fiido C11 Pro Electric Commuter Bike|1699||Colour=Grey;Top speed=25 km/h;Range=Up to 100 km|
SW|Microsoft 365|Microsoft|Microsoft 365 Family 12-Month Subscription (Digital Download)|159|179|Users=Up to 6 people;Format=Digital download|deal work online
SW|Microsoft 365|Microsoft|Microsoft 365 Personal 12-Month Subscription (Digital Download)|129||Users=1 person;Format=Digital download|work online
SW|Antivirus & security|Norton|Norton 360 Deluxe 5 Devices 12-Month Subscription (Digital Download)|59|119|Devices=5;Format=Digital download|deal online
`

const ALIASES = { 'Grand Theft Auto V': 'gta 5 gta5 gta v gtav', 'Red Dead Redemption 2': 'rdr2 rdr 2', 'Pokemon Legends: Z-A Nintendo Switch 2 Edition': 'pokémon', 'Pokemon TCG: Scarlet & Violet Prismatic Evolutions Booster Bundle': 'pokémon trading card game' }
const hash = s => createHash('sha256').update(s).digest()
const OUT_OF_STOCK = new Set(['PlayStation 5 Pro Console (2TB)', 'LEGO Super Mario Mario Kart - Mario & Standard Kart 72032'])

const SUMMARY = {
  Laptops: 'A portable computer for work, study and everyday use.', Tablets: 'A slim tablet for streaming, notes, browsing and apps.',
  'Desktop computers': 'A desktop computer for home office and study.', Monitors: 'A desk monitor for work, study and play.',
  Printers: 'An all-in-one printer for home and small office.', Networking: 'Wi-Fi networking for a connected home. Requires a compatible internet service.',
  'Computer accessories': 'An everyday accessory to complete your desk setup.', iPhone: 'Apple iPhone, unlocked for all Australian networks. SIM and plan sold separately.',
  'Android phones': 'An unlocked Android smartphone for Australian networks. SIM and plan sold separately.', 'Prepaid phones': 'A prepaid handset locked to its network. Recharge sold separately.',
  'Phone cases': 'A protective case made for your phone.', 'Phone chargers': 'Fast, reliable charging for compatible devices.', 'Power banks': 'Portable power for your phone and accessories on the go.',
  'Smart watches': 'Track workouts, sleep and notifications from your wrist.', 'Fitness trackers': 'A lightweight tracker for steps, heart rate and sleep.', 'Watch straps': 'A replacement band for your watch.',
  TVs: 'A smart TV with built-in streaming apps. Internet and subscriptions may be required.', Soundbars: 'Bigger, clearer TV sound from a single bar.',
  Projectors: 'A big picture for movie nights at home.', 'Streaming players': 'Stream your favourite services in 4K. Subscriptions sold separately.',
  'Blu-ray & DVD players': 'Play your disc collection in stunning quality.', 'TV wall brackets': 'Mount and connect your TV with confidence.',
  Headphones: 'Over-ear headphones for music, calls and travel.', Earbuds: 'Wireless earbuds with a pocket charging case.',
  'Portable speakers': 'A portable speaker built to go wherever you do.', 'Smart speakers': 'A connected speaker for music around the home.',
  Turntables: 'Spin your vinyl collection at home.', 'Hi-Fi systems': 'Hi-fi sound for the music lover.',
  'Mirrorless cameras': 'An interchangeable-lens camera for stills and video.', 'Camera lenses': 'Expand what your camera can do.',
  'Action cameras': 'A rugged camera for your next adventure.', 'Instant cameras': 'Print your memories in seconds.', Drones: 'Shoot stunning aerial photos and video. Check CASA rules before flying.',
  'PlayStation consoles': 'Play the latest PlayStation 5 games.', 'Xbox consoles': 'Play the latest Xbox games and Game Pass titles.',
  'Nintendo Switch consoles': 'Play at home on the TV or on the go.', 'PC gaming': 'Gear up for PC gaming.', VR: 'Step into mixed reality gaming and entertainment.',
  'PS5 accessories': 'Official accessories for PlayStation 5.', 'Xbox accessories': 'Official accessories for Xbox Series X|S.',
  'Nintendo Switch accessories': 'Accessories for Nintendo Switch 2.', 'Gaming accessories': 'Level up your setup.',
  'Coffee machines': 'Make café-quality coffee at home.', Vacuums: 'Powerful cleaning for every floor.', 'Kitchen appliances': 'Make everyday cooking easier.',
  'Fridges & freezers': 'Keep food fresh with flexible storage.', 'Washing machines & dryers': 'Efficient laundry care for the whole household.',
  'Heating & cooling': 'Stay comfortable in every season.', 'Security cameras': 'Keep an eye on home from anywhere. Internet required.',
  'Video doorbells': 'See and speak to visitors from your phone. Internet required.', 'Smart lighting': 'Set the mood with app and voice-controlled lighting.',
  'Smart plugs & power': 'Automate your home with app control.', 'Hair care': 'Salon-style results at home.', 'Shavers & trimmers': 'A precise, comfortable shave and trim.',
  'Electric toothbrushes': 'A cleaner feeling every day.', Massagers: 'Ease sore muscles after training.',
  Vinyl: 'On vinyl LP. Turntable required.', CDs: 'On CD.', 'Musical instruments': 'Start making your own music.',
  '4K Ultra HD': 'On 4K Ultra HD with Blu-ray. 4K UHD player required for the 4K disc.', 'Blu-ray': 'On Blu-ray. Blu-ray player required.', DVD: 'On DVD.', 'TV series': 'The complete season on disc.',
  LEGO: 'A LEGO building set.', 'Pop! Vinyl': 'A collectible Funko Pop! Vinyl figure.', Figurines: 'A collectible figure.', 'Trading cards': 'Pokémon Trading Card Game product.', 'Games & puzzles': 'A classic game for family nights.',
  'Dash cams': 'Record the road ahead for peace of mind.', 'Car stereos': 'Upgrade your in-car entertainment.', 'GPS navigation': 'Turn-by-turn directions for Australian roads.',
  'e-Scooters': 'A foldable e-scooter for short trips. Check local road rules before riding.', 'e-Bikes': 'Pedal-assist commuting made easy.',
  'Microsoft 365': 'Premium Microsoft apps and cloud storage. Digital code emailed after purchase.', 'Antivirus & security': 'Protect your devices online. Digital code emailed after purchase.',
}

const seen = new Set()
function skuFor(key) {
  const h = hash(key)
  let n = 600000 + (h.readUInt32BE(0) % 290000)
  while (seen.has(n) || [829262, 840499, 896438, 896402, 482005, 899532].includes(n)) n++
  seen.add(n)
  return String(n)
}

export const SHELF = ROWS.trim().split('\n').map(line => {
  const [code, type, brand, rawTitle, price, was, attrs, flagText] = line.split('|')
  const flags = flagText.split(/\s+/).filter(Boolean)
  const platform = flags.find(f => PLATFORM[f])
  const classification = flags.find(f => f.startsWith('r:'))?.slice(2) ?? null
  const isGame = / games$/.test(type)
  const title = rawTitle
  const subtitle = isGame || /consoles|accessories/.test(type) && platform ? PLATFORM[platform] : brand
  const slug = isGame ? slugify(`${PLATFORM[platform]} ${title}`) : slugify(title)
  const id = skuFor(slug)
  const h = hash('rating:' + slug)
  const attributes = Object.fromEntries((attrs || '').split(';').filter(Boolean).map(kv => kv.split('=')))
  const ticket = was ? Number(was) : null
  const oos = OUT_OF_STOCK.has(title)
  const badges = [
    ...(flags.includes('deal') ? ['RED HOT DEAL'] : []),
    ...(flags.includes('clear') ? ['CLEARANCE'] : []),
    ...(flags.includes('new') && !flags.includes('deal') ? ['NEW'] : []),
    ...(flags.includes('excl') ? ['JB EXCLUSIVE'] : []),
    ...(flags.includes('online') ? ['ONLINE ONLY'] : []),
  ]
  const department = DEPT[code]
  const stars = (3.9 + (h[0] % 11) / 10).toFixed(1)
  const reviews = 3 + (h[1] * 7 + h[2]) % (flags.includes('top') ? 1400 : 420)
  return {
    id, kind: 'other', shelf: true, slug, title, subtitle, brand, type, family: slugify(type),
    crumbs: [department, type], price: Number(price), ticket,
    deliveryFrom: Number(price) >= 99 ? null : 4.99,
    badges, cta: oos ? 'Out of stock' : 'Add to cart', orderable: !oos, stock: oos ? 0 : 5 + h[3] % 16, purchaseLimit: 5,
    release: null, releaseLong: null, rating: classification,
    stars, reviews,
    ...(platform ? { platform, catalogPlatform: platform, platformName: PLATFORM[platform] } : {}),
    attributes,
    notice: flags.includes('online') ? ['Online only. Not available for Click & Collect.'] : [],
    description: [
      `${isGame ? `${title} for ${PLATFORM[platform]}.` : title + '.'} ${SUMMARY[type] || ''}`.trim(),
      ...(isGame ? [`Classification: ${classification}. Published by ${brand}.`] : [`Backed by the manufacturer's warranty and JB Hi-Fi's expert advice in store and online.`]),
    ],
    specs: [['Brand', brand], ...(isGame ? [['Console compatibility', PLATFORM[platform]]] : []), ...Object.entries(attributes)],
    keywords: [title, subtitle, ALIASES[title] || '', brand, type, department, ...Object.values(attributes), ...(isGame ? ['video games', 'gaming'] : []), ...(platform === 'ps5' ? ['ps5', 'playstation'] : platform === 'xbox' ? ['xbox'] : /switch/.test(platform || '') ? ['nintendo switch'] : [])].join(' '),
    campaigns: [
      ...(flags.includes('new') ? ['new'] : []), ...(flags.includes('deal') || ticket ? ['deals'] : []), ...(flags.includes('clear') ? ['clearance'] : []),
      ...(flags.includes('work') ? ['work-study'] : []), ...(flags.includes('movie') ? ['movie-night'] : []), ...(flags.includes('kitchen') ? ['kitchen-upgrades'] : []),
    ],
    top: flags.includes('top'),
  }
})
