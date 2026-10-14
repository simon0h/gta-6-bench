// Argos everyday assortment ("the shelf"): the wider range a shopper sees around the GTA VI listings.
// It is deliberately kept apart from PRODUCTS, the evidence-backed GTA VI array, so applyCatalogPolicy,
// /api/catalog and the reference inventory reports keep describing only those evidenced rows.
// Shelf rows are local simulation merchandise modelled on the Argos range (real brands, Argos-style
// titles, 7-digit product numbers and GBP prices). Stock, prices and ratings are illustrative and were
// not captured from argos.co.uk. Orders for them are recorded as kind: 'other' lines.
// Reference mode only: fixture mode keeps its authored 500-row catalogue untouched.
import { fixtureCatalog } from '../../lib/catalog-policy.js'

// category key -> mega-menu department id, Argos category path, shopper label, art hint, search words, base specs
const CATS = {
  // ---------- Technology ----------
  tv: { menu: 'technology', path: '/browse/technology/televisions-and-accessories/televisions/c:30106', label: 'Televisions', words: 'tv tvs television televisions smart tv 4k', specs: { Resolution: '4K Ultra HD', 'Smart TV': 'Yes', 'Freeview Play': 'Yes', 'HDMI ports': '4' }, desc: 'Stream, watch and play with a sharp picture and built-in apps. Wall bracket sold separately.' },
  soundbar: { menu: 'technology', path: '/browse/technology/sound-bars/c:30123', label: 'Sound Bars', words: 'soundbar soundbars sound bar home cinema speaker', specs: { Connectivity: 'HDMI eARC, optical, Bluetooth', Mounting: 'Wall mountable' }, desc: 'Bigger, clearer TV sound with dialogue enhancement and easy HDMI set-up.' },
  camera: { menu: 'technology', path: '/browse/technology/cameras/c:30168', label: 'Cameras', words: 'camera cameras photography', specs: { 'Video resolution': '4K', 'Wi-Fi': 'Yes' }, desc: 'Take photos and video with easy controls and wireless sharing to your phone.' },
  phone: { menu: 'technology', path: '/browse/technology/mobile-phones-and-accessories/sim-free-phones/c:30147', label: 'SIM Free Mobile Phones', words: 'phone phones mobile mobiles smartphone sim free unlocked', specs: { Network: '5G', 'SIM type': 'Nano SIM and eSIM', Unlocked: 'Yes' }, desc: 'SIM free and unlocked, so you can choose any network. Charger not included.' },
  watch: { menu: 'technology', path: '/browse/jewellery-and-watches/watches/smart-watches/c:786024', label: 'Smart Watches', words: 'smartwatch smartwatches smart watch watches fitness', specs: { 'Water resistance': '5 ATM', 'Heart rate monitor': 'Yes', GPS: 'Yes' }, desc: 'Track workouts, sleep and notifications from your wrist. Not a medical device.' },
  headphones: { menu: 'technology', path: '/browse/technology/headphones-and-earphones/wireless-headphones/c:815766', label: 'Wireless Headphones', words: 'headphones earbuds earphones wireless bluetooth noise cancelling', specs: { Connection: 'Bluetooth', 'Noise cancelling': 'Active' }, desc: 'Wireless listening with rich sound, long battery life and a built-in microphone for calls.' },
  laptop: { menu: 'technology', path: '/browse/technology/laptops-and-pcs/laptops/c:30049', label: 'Laptops & 2-in-1s', words: 'laptop laptops notebook computer pc', specs: { 'Operating system': 'Windows 11 Home', Display: 'Full HD' }, desc: 'Work, study and stream with a fast processor, solid-state storage and all-day battery.' },
  tablet: { menu: 'technology', path: '/browse/technology/tablets-and-ipad/tablets/c:30159', label: 'Tablets', words: 'tablet tablets ipad ipads', specs: { Connectivity: 'Wi-Fi' }, desc: 'A portable screen for streaming, reading, video calls and games.' },
  // ---------- Gaming ----------
  ps5: { menu: 'gaming', path: '/browse/technology/video-games-and-consoles/playstation/ps5-consoles/c:812421', label: 'PS5 Consoles', type: 'console', plat: 'ps5', words: 'ps5 playstation 5 console consoles sony', specs: { Platform: 'PlayStation 5', Resolution: 'Up to 4K at 120Hz' }, desc: 'Play the latest PS5 games with ultra-high speed SSD loading and the DualSense wireless controller.' },
  ps5game: { menu: 'gaming', path: '/browse/technology/video-games-and-consoles/playstation/ps5-games/c:812420', label: 'PS5 Games', type: 'game', plat: 'ps5', words: 'ps5 game games playstation video game', specs: { Platform: 'PlayStation 5', Format: 'Disc' }, desc: 'PS5 game on disc. A PlayStation 5 console with a disc drive is required.' },
  xbox: { menu: 'gaming', path: '/browse/technology/video-games-and-consoles/xbox/xbox-series-x-consoles/c:812425', label: 'XBOX Series X Consoles', type: 'console', plat: 'xbox', words: 'xbox series x series s console consoles microsoft', specs: { Platform: 'Xbox Series X|S', Resolution: 'Up to 4K at 120Hz' }, desc: 'Fast load times, 4K gaming and Xbox Game Pass ready. Game Pass subscription sold separately.' },
  xboxgame: { menu: 'gaming', path: '/browse/technology/video-games-and-consoles/xbox/xbox-series-games/c:812426', label: 'XBOX Series Games', type: 'game', plat: 'xbox', words: 'xbox series x game games video game', specs: { Platform: 'Xbox Series X|S', Format: 'Disc' }, desc: 'Xbox Series X game on disc. Xbox Series S has no disc drive.' },
  switch2: { menu: 'gaming', path: '/browse/technology/video-games-and-consoles/nintendo/nintendo-switch-2-consoles/c:1054684', label: 'Nintendo Switch 2 Consoles', type: 'console', plat: 'switch-2', words: 'nintendo switch 2 console consoles handheld', specs: { Platform: 'Nintendo Switch 2', Screen: '7.9 inch LCD' }, desc: 'Play at home on the TV or on the go with Nintendo Switch 2.' },
  switchgame: { menu: 'gaming', path: '/browse/technology/video-games-and-consoles/nintendo/nintendo-switch-games/c:30292', label: 'Nintendo Switch Games', type: 'game', plat: 'switch', words: 'nintendo switch game games video game', specs: { Platform: 'Nintendo Switch', Format: 'Game card' }, desc: 'Nintendo game card. Plays on Nintendo Switch and Nintendo Switch 2.' },
  psdigital: { menu: 'gaming', path: '/browse/technology/video-games-and-consoles/playstation/playstation-digital-downloads/c:1012069', label: 'PlayStation Digital Downloads', type: 'card', words: 'playstation store gift card psn digital download voucher plus', specs: { Delivery: 'Code by email', Region: 'UK accounts only' }, desc: 'Digital code delivered by email. Redeem on a UK PlayStation Network account.' },
  headset: { menu: 'gaming', path: '/browse/technology/video-games-and-consoles/gaming-headsets/c:29987', label: 'Gaming Headsets', words: 'gaming headset headsets headphones microphone', specs: { Microphone: 'Detachable boom' }, desc: 'Hear every footstep with clear game audio and talk to your team with a noise-reducing microphone.' },
  gaminglaptop: { menu: 'gaming', path: '/browse/technology/laptops-and-pcs/gaming-laptops/c:30279', label: 'Gaming Laptops', words: 'gaming laptop laptops pc gaming nvidia rtx', specs: { 'Operating system': 'Windows 11 Home', 'Refresh rate': '144Hz' }, desc: 'Play the latest PC games with a dedicated NVIDIA GeForce RTX graphics card and high refresh rate display.' },
  pcgame: { menu: 'gaming', path: '/browse/technology/video-games-and-consoles/pc-gaming/pc-games/c:30005', label: 'PC Games', type: 'game', plat: 'pc', words: 'pc game games video game', specs: { Platform: 'PC', Format: 'Download code in a box' }, desc: 'PC game supplied as a download code. Internet connection and platform account required.' },
  // ---------- Home & Furniture ----------
  bed: { menu: 'home-and-furniture', path: '/browse/home-and-furniture/bedroom-furniture/beds/c:29865', label: 'Beds', bulky: true, words: 'bed beds bed frame bedroom double king', specs: { Assembly: 'Self assembly', 'Mattress included': 'No' }, desc: 'A sturdy bed frame with a sprung slatted base. Mattress sold separately.' },
  sofa: { menu: 'home-and-furniture', path: '/browse/home-and-furniture/living-room-furniture/sofas/c:29643', label: 'Sofas', bulky: true, words: 'sofa sofas settee couch living room', specs: { Assembly: 'Legs to attach' }, desc: 'Generous seating with supportive foam cushions. Measure doorways before ordering.' },
  rug: { menu: 'home-and-furniture', path: '/browse/home-and-furniture/home-furnishings/rugs-and-runners/c:1000173', label: 'Rugs & Runners', words: 'rug rugs runner runners carpet', specs: { Backing: 'Non-slip recommended' }, desc: 'Add warmth and texture underfoot. Vacuum regularly without the beater bar.' },
  kitchenware: { menu: 'home-and-furniture', path: '/browse/home-and-furniture/kitchenware/c:29704', label: 'Kitchenware & Accessories', words: 'kitchen kitchenware cookware pan pans knife knives', specs: { 'Dishwasher safe': 'Yes' }, desc: 'Everyday kitchen essentials that make cooking simpler.' },
  dining: { menu: 'home-and-furniture', path: '/browse/home-and-furniture/dining-room-furniture/dining-table-and-chair-sets/c:29647', label: 'Dining Table Sets', bulky: true, words: 'dining table chairs set dining room', specs: { Assembly: 'Self assembly' }, desc: 'A dining table and chairs set for family meals. Requires self assembly.' },
  desk: { menu: 'home-and-furniture', path: '/browse/home-and-furniture/office-furniture/desks/c:29863', label: 'Desks', bulky: true, words: 'desk desks office home office computer desk', specs: { Assembly: 'Self assembly' }, desc: 'A practical desk for home working and study.' },
  ceilinglight: { menu: 'home-and-furniture', path: '/browse/home-and-furniture/lighting/ceiling-lights/c:29802', label: 'Ceiling Lights', words: 'ceiling light lights lighting pendant lamp shade', specs: { 'Bulb included': 'No' }, desc: 'Refresh a room with a statement ceiling light. Professional installation recommended for wired fittings.' },
  storage: { menu: 'home-and-furniture', path: '/browse/home-and-furniture/storage-and-organisation/storage-units/c:29590', label: 'Storage Units', words: 'storage unit units shelving cube shelves bookcase', specs: { Assembly: 'Self assembly' }, desc: 'Clever storage to keep books, baskets and everyday clutter organised.' },
  // ---------- Health & Beauty ----------
  hairstyler: { menu: 'health-and-beauty', path: '/browse/health-and-beauty/hair-care/hot-air-stylers-and-brushes/c:29238', label: 'Hair Stylers', words: 'hair styler stylers dryer straightener curler airwrap brush', specs: { 'Heat settings': '3' }, desc: 'Dry and style in one step with less heat damage.' },
  toothbrush: { menu: 'health-and-beauty', path: '/browse/health-and-beauty/electric-toothbrushes/c:29231', label: 'Electric Toothbrushes', words: 'electric toothbrush toothbrushes dental oral b', specs: { Timer: '2-minute', 'Battery life': 'Up to 2 weeks' }, desc: 'A cleaner, fresher feel with a built-in timer and pressure sensor.' },
  perfume: { menu: 'health-and-beauty', path: '/browse/health-and-beauty/fragrance/perfume/c:29282', label: 'Perfume', words: 'perfume perfumes fragrance eau de parfum aftershave gift', specs: { Type: 'Eau de Parfum' }, desc: 'A signature fragrance, ideal as a gift.' },
  makeup: { menu: 'health-and-beauty', path: '/browse/health-and-beauty/makeup/makeup-sets/c:29265', label: 'Makeup Sets', words: 'makeup make up set sets gift palette', specs: {}, desc: 'A gift-ready makeup set with everyday essentials.' },
  beautyappliance: { menu: 'health-and-beauty', path: '/browse/health-and-beauty/beauty-appliances/c:29259', label: 'Beauty Appliances', words: 'beauty appliance ipl hair removal epilator facial', specs: {}, desc: 'Salon-style results at home. Read the safety guidance before first use.' },
  massager: { menu: 'health-and-beauty', path: '/browse/health-and-beauty/wellness/handheld-massagers/c:29227', label: 'Handheld Massagers', words: 'massager massage gun handheld wellness', specs: { 'Speed settings': '5' }, desc: 'Ease tight muscles after exercise with interchangeable massage heads.' },
  shaver: { menu: 'health-and-beauty', path: '/browse/health-and-beauty/mens-shaving-and-grooming/shavers-and-shaving-accessories/mens-electric-shavers/c:29256', label: 'Mens Shavers', words: 'shaver shavers razor trimmer grooming mens', specs: { 'Wet and dry': 'Yes' }, desc: 'A close, comfortable shave, wet or dry.' },
  bpmonitor: { menu: 'health-and-beauty', path: '/browse/health-and-beauty/health/blood-pressure-monitors/c:29219', label: 'Blood Pressure Monitors', words: 'blood pressure monitor monitors health', specs: { 'Clinically validated': 'Yes' }, desc: 'Monitor your blood pressure at home. Always consult your GP about your readings.' },
  // ---------- Appliances ----------
  vacuum: { menu: 'appliances', path: '/browse/appliances/vacuum-cleaners-and-floorcare/vacuum-cleaners/c:29693', label: 'Vacuum Cleaners', words: 'vacuum vacuums cleaner hoover cordless floorcare', specs: { Bagless: 'Yes' }, desc: 'Powerful suction for carpets and hard floors, with tools for upholstery and stairs.' },
  fridge: { menu: 'appliances', path: '/browse/appliances/fridges-and-freezers/fridge-freezers/c:29617', label: 'Fridge Freezers', bulky: true, words: 'fridge freezer fridges freezers refrigerator', specs: { 'Frost free': 'Yes' }, desc: 'Keep food fresher for longer. Large item delivery and recycling of your old appliance available.' },
  washer: { menu: 'appliances', path: '/browse/appliances/laundry/washing-machines/c:29612', label: 'Washing Machines', bulky: true, words: 'washing machine machines washer laundry', specs: { 'Quick wash': '15 minutes' }, desc: 'Efficient washing with quick and eco programmes. Installation available.' },
  cooker: { menu: 'appliances', path: '/browse/appliances/cookers-ovens-and-hobs/freestanding-cookers/c:29623', label: 'Freestanding Cookers', bulky: true, words: 'cooker cookers oven ovens hob freestanding', specs: { Width: '60 cm' }, desc: 'A freestanding cooker with oven, grill and hob. Gas and electric connections need a qualified engineer.' },
  dishwasher: { menu: 'appliances', path: '/browse/appliances/dishwashers/c:29615', label: 'Dishwashers', bulky: true, words: 'dishwasher dishwashers', specs: { 'Place settings': '13' }, desc: 'Quiet, efficient dishwashing with quick and eco cycles.' },
  kettle: { menu: 'appliances', path: '/browse/appliances/kettles/c:29560', label: 'Kettles', words: 'kettle kettles', specs: { Capacity: '1.7 litres', Plug: 'UK 3-pin' }, desc: 'A fast-boil cordless kettle with a 360-degree base and limescale filter.' },
  heater: { menu: 'appliances', path: '/browse/appliances/fans-heaters-and-dehumidifiers/heaters-and-radiators/c:29444', label: 'Heaters', words: 'heater heaters radiator oil filled fan heater', specs: { Thermostat: 'Adjustable' }, desc: 'Warm up cold rooms quickly with adjustable heat settings and overheat protection.' },
  airfryer: { menu: 'appliances', path: '/browse/appliances/small-cooking-appliances/air-fryers-and-fryers/c:29575', label: 'Air Fryers & Fryers', words: 'air fryer fryers airfryer ninja', specs: { 'Dishwasher-safe parts': 'Yes' }, desc: 'Crispy results with little or no oil, plus roast, bake and reheat functions.' },
  // ---------- Sports & Leisure ----------
  dumbbell: { menu: 'sports-and-leisure', path: '/browse/sports-and-leisure/weights/dumbbells/c:30630', label: 'Dumbbells', words: 'dumbbell dumbbells weights gym', specs: {}, desc: 'Build strength at home with durable dumbbells.' },
  treadmill: { menu: 'sports-and-leisure', path: '/browse/sports-and-leisure/exercise-machines/treadmills/c:30612', label: 'Treadmills', bulky: true, words: 'treadmill treadmills running machine walking pad', specs: { Folding: 'Yes' }, desc: 'Walk or run at home with adjustable speed and incline.' },
  exercisemat: { menu: 'sports-and-leisure', path: '/browse/sports-and-leisure/fitness-and-gym-accessories/exercise-and-yoga-mats/c:30622', label: 'Exercise Mats', words: 'yoga mat mats exercise pilates', specs: {}, desc: 'A cushioned, non-slip surface for yoga, pilates and floor exercises.' },
  bike: { menu: 'sports-and-leisure', path: '/browse/sports-and-leisure/bikes-and-accessories/mens-and-womens-bikes/c:30482', label: 'Adult Bikes', bulky: true, words: 'bike bikes bicycle bicycles cycling ebike', specs: { Assembly: '90% assembled' }, desc: 'Arrives 90% assembled. Check frame size against your height before ordering.' },
  football: { menu: 'sports-and-leisure', path: '/browse/sports-and-leisure/sports/football/c:30531', label: 'Football', words: 'football footballs goal goals soccer', specs: {}, desc: 'Get the game going in the garden or at the park.' },
  suitcase: { menu: 'sports-and-leisure', path: '/browse/sports-and-leisure/bags-luggage-and-travel/suitcases/c:30493', label: 'Suitcases', words: 'suitcase suitcases luggage cabin case travel', specs: { Wheels: '4 spinner wheels', Lock: 'TSA combination lock' }, desc: 'Lightweight luggage with smooth spinner wheels and a telescopic handle.' },
  tent: { menu: 'sports-and-leisure', path: '/browse/sports-and-leisure/camping-and-caravanning/tents/c:30505', label: 'Tents', words: 'tent tents camping festival', specs: { 'Hydrostatic head': '3000 mm' }, desc: 'Waterproof camping shelter with taped seams and a sewn-in groundsheet.' },
  tracker: { menu: 'sports-and-leisure', path: '/browse/sports-and-leisure/fitness-and-activity-trackers/c:30621', label: 'Fitness Trackers', words: 'fitness tracker trackers activity band fitbit', specs: { 'Water resistance': '5 ATM' }, desc: 'Track steps, heart rate and sleep. Not a medical device.' },
  // ---------- Jewellery & Watches ----------
  menswatch: { menu: 'jewellery-and-watches', path: '/browse/jewellery-and-watches/watches/mens-watches/c:29307', label: 'Mens Watches', words: 'mens watch watches gift', specs: { 'Water resistance': '50 m' }, desc: 'A classic watch presented in a gift box.' },
  womenswatch: { menu: 'jewellery-and-watches', path: '/browse/jewellery-and-watches/watches/womens-watches/c:29306', label: 'Womens Watches', words: 'womens ladies watch watches gift', specs: { 'Water resistance': '30 m' }, desc: 'An elegant watch presented in a gift box.' },
  earrings: { menu: 'jewellery-and-watches', path: '/browse/jewellery-and-watches/womens-jewellery/womens-earrings/c:29315', label: 'Womens Earrings', shape: 'ring', words: 'earrings earring studs hoops jewellery gift', specs: {}, desc: 'Presented in an Argos gift box.' },
  chain: { menu: 'jewellery-and-watches', path: '/browse/jewellery-and-watches/mens-jewellery/mens-necklaces-and-chains/c:29329', label: 'Chains & Necklaces', shape: 'ring', words: 'chain chains necklace necklaces mens jewellery', specs: {}, desc: 'Presented in an Argos gift box.' },
  weddingring: { menu: 'jewellery-and-watches', path: '/browse/jewellery-and-watches/wedding-bands/c:1043194', label: 'Wedding Rings', shape: 'ring', words: 'wedding ring rings band bands', specs: {}, desc: 'Hallmarked precious metal. Use our ring size guide before ordering.' },
  jewellerybox: { menu: 'jewellery-and-watches', path: '/browse/jewellery-and-watches/jewellery-boxes-and-hangers/c:29344', label: 'Jewellery Boxes', words: 'jewellery box boxes storage', specs: {}, desc: 'Keep rings, earrings and necklaces tidy and tangle-free.' },
  // ---------- Baby & Nursery ----------
  pram: { menu: 'baby-and-nursery', path: '/browse/baby-and-nursery/prams-and-pushchairs/c:29042', label: 'Prams & Pushchairs', words: 'pram prams pushchair pushchairs stroller travel system buggy', specs: { 'Suitable from': 'Birth' }, desc: 'A smooth ride for baby with a one-hand fold for you.' },
  earlylearning: { menu: 'baby-and-nursery', path: '/browse/baby-and-nursery/baby-toys/early-learning-toys/c:29101', label: 'Early Learning Toys', words: 'baby toy toys early learning activity', specs: { 'Suitable from': '6 months' }, desc: 'Lights, sounds and textures to encourage early discovery.' },
  cot: { menu: 'baby-and-nursery', path: '/browse/baby-and-nursery/cots-and-cot-beds/c:29129', label: 'Cots & Cot Beds', bulky: true, words: 'cot cots cot bed nursery', specs: { 'Mattress included': 'No' }, desc: 'Adjustable base heights and converts to a toddler bed. Mattress sold separately.' },
  highchair: { menu: 'baby-and-nursery', path: '/browse/baby-and-nursery/feeding-and-weaning/highchairs/c:29067', label: 'Highchairs', words: 'highchair highchairs high chair feeding weaning', specs: { Harness: '5-point' }, desc: 'A wipe-clean highchair for mealtimes from 6 months.' },
  babybath: { menu: 'baby-and-nursery', path: '/browse/baby-and-nursery/bathing-and-changing/baby-baths/c:29089', label: 'Baby Baths', words: 'baby bath baths bathing', specs: {}, desc: 'A supportive bath for little ones. Never leave a baby unattended in water.' },
  babymonitor: { menu: 'baby-and-nursery', path: '/browse/baby-and-nursery/health-and-safety/baby-monitors/c:29056', label: 'Baby Monitors', words: 'baby monitor monitors video audio', specs: { Range: 'Up to 300 m' }, desc: 'Keep an eye and ear on your little one with night vision and two-way talk.' },
  nightlight: { menu: 'baby-and-nursery', path: '/browse/baby-and-nursery/baby-sleep-aids/nightlights-projectors-and-clocks/c:29033', label: 'Nightlights & Projectors', words: 'nightlight night light projector sleep aid clock', specs: {}, desc: 'A soothing glow and sounds to help settle little ones.' },
  // ---------- Toys ----------
  toddler: { menu: 'toys', path: '/sd/1-to-2-years-toys', label: '1 to 2 years', words: 'toddler toy toys 1 2 years', specs: { 'Recommended age': '12 months+' }, desc: 'Chunky, colourful play designed for little hands.' },
  playset: { menu: 'toys', path: '/browse/toys/playsets-and-figures/c:30373', label: 'Playsets & Figures', words: 'playset playsets figure figures lego toy', specs: {}, desc: 'Imaginative play with characters and accessories.' },
  boardgame: { menu: 'toys', path: '/browse/toys/family-games/board-games/c:30423', label: 'Board Games', words: 'board game games family games puzzle', specs: {}, desc: 'Bring the family together for game night.' },
  creative: { menu: 'toys', path: '/browse/toys/art-and-creativity-toys/c:30302', label: 'All Creative Toys', words: 'creative craft arts crafts building lego kit', specs: {}, desc: 'Build, make and create at home.' },
  doll: { menu: 'toys', path: '/browse/toys/dolls-and-doll-accessories/c:30305', label: 'All Dolls & Accessories', words: 'doll dolls dolls house accessories barbie', specs: {}, desc: 'Fashion, fun and storytelling play.' },
  vehicle: { menu: 'toys', path: '/browse/toys/toy-vehicles-and-sets/c:30311', label: 'All Toy Vehicles', words: 'toy car cars vehicle vehicles remote control track hot wheels', specs: {}, desc: 'Race, crash and drive with toy vehicles and track sets.' },
  // ---------- Clothing ----------
  womens: { menu: 'clothing', path: '/browse/clothing/womens/c:691104', label: 'Shop All Womens', words: 'womens women ladies clothing tu', specs: { Fit: 'Regular' }, desc: 'Tu clothing, machine washable.' },
  mens: { menu: 'clothing', path: '/browse/clothing/mens/c:691144', label: 'Shop All Mens', words: 'mens men clothing tu', specs: { Fit: 'Regular' }, desc: 'Tu clothing, machine washable.' },
  boys: { menu: 'clothing', path: '/browse/clothing/boys/c:812621', label: 'Shop All Boys', words: 'boys kids clothing tu', specs: {}, desc: 'Tu kidswear, machine washable.' },
  girls: { menu: 'clothing', path: '/browse/clothing/girls/c:812622', label: 'Shop All Girls', words: 'girls kids clothing tu', specs: {}, desc: 'Tu kidswear, machine washable.' },
  uniform: { menu: 'clothing', path: '/browse/clothing/school-uniforms/girls-school-uniforms/c:812484', label: 'Girls Uniform', words: 'school uniform uniforms girls', specs: {}, desc: 'Hard-wearing school uniform from Tu.' },
  fancydress: { menu: 'clothing', path: '/browse/clothing/fancy-dress/c:29137', label: 'Fancy Dress', words: 'fancy dress costume costumes halloween dress up', specs: {}, desc: 'Dress up for parties, World Book Day and Halloween.' },
  // ---------- Garden & DIY ----------
  patio: { menu: 'garden-and-diy', path: '/browse/garden-and-diy/garden-furniture/patio-sets/c:29391', label: 'Garden Table & Chair Sets', bulky: true, words: 'garden furniture patio set table chairs bistro rattan', specs: {}, desc: 'Weather-resistant garden furniture. Cover or store over winter.' },
  gazebo: { menu: 'garden-and-diy', path: '/browse/garden-and-diy/garden-furniture/gazebos-and-awnings/c:29397', label: 'Gazebos', bulky: true, words: 'gazebo gazebos awning shelter garden', specs: {}, desc: 'Shade and shelter for summer gatherings.' },
  shed: { menu: 'garden-and-diy', path: '/browse/garden-and-diy/sheds-and-garden-storage/sheds/c:29492', label: 'Sheds', bulky: true, words: 'shed sheds garden storage', specs: {}, desc: 'Secure garden storage. Requires a firm, level base.' },
  summerhouse: { menu: 'garden-and-diy', path: '/browse/garden-and-diy/summer-houses-and-log-cabins/c:29495', label: 'Summerhouses', bulky: true, words: 'summerhouse summerhouses log cabin garden room', specs: {}, desc: 'A garden retreat. Requires a firm, level base and self assembly.' },
  greenhouse: { menu: 'garden-and-diy', path: '/browse/garden-and-diy/greenhouses/greenhouses/c:29490', label: 'Greenhouses', bulky: true, words: 'greenhouse greenhouses grow house', specs: {}, desc: 'Extend the growing season with a sturdy greenhouse.' },
  bbq: { menu: 'garden-and-diy', path: '/browse/garden-and-diy/barbecues/c:29382', label: 'Barbecues', bulky: true, words: 'bbq bbqs barbecue barbecues grill gas charcoal', specs: {}, desc: 'Get grilling outdoors. Always use outside in a well-ventilated area.' },
  // ---------- Christmas ----------
  xmastree: { menu: 'christmas', path: '/browse/home-and-furniture/home-furnishings/christmas-decorations/christmas-trees/c:29817', label: 'Christmas Trees', bulky: true, words: 'christmas tree trees artificial decorations', specs: { Stand: 'Metal stand included' }, desc: 'A full, realistic artificial Christmas tree with hinged branches.' },
}

// [title, price, brand, rating, reviews, options]
// options: was (previous price), s (specs), pegi, plat, oos (out of stock), new, colour, extra (more category paths)
const ROWS = {
  tv: [
    ['Samsung 55 Inch QE55Q60DAUXXU Smart 4K UHD HDR QLED TV', 499, 'Samsung', 4.7, 1268, { was: 599, s: { 'Screen size': '55 inches', 'Panel type': 'QLED' } }],
    ['Samsung 65 Inch QE65S90DAEXXU Smart 4K UHD HDR OLED TV', 1299, 'Samsung', 4.8, 412, { was: 1599, s: { 'Screen size': '65 inches', 'Panel type': 'OLED' } }],
    ['LG 65 Inch OLED65C46LA Smart 4K UHD HDR OLED Freeview TV', 1399, 'LG', 4.8, 655, { s: { 'Screen size': '65 inches', 'Panel type': 'OLED evo' } }],
    ['LG 43 Inch 43UT80006LA Smart 4K UHD HDR LED Freeview TV', 279, 'LG', 4.6, 902, { s: { 'Screen size': '43 inches', 'Panel type': 'LED' } }],
    ['Sony Bravia 55 Inch K55XR70 Smart 4K UHD HDR Mini LED Google TV', 1099, 'Sony', 4.7, 188, { new: true, s: { 'Screen size': '55 inches', 'Panel type': 'Mini LED' } }],
    ['Hisense 50 Inch 50E7NQTUK Smart 4K UHD HDR QLED Freeview TV', 299, 'Hisense', 4.5, 734, { was: 349, s: { 'Screen size': '50 inches', 'Panel type': 'QLED' } }],
    ['TCL 75 Inch 75C655K Smart 4K UHD HDR QLED Google TV', 649, 'TCL', 4.5, 321, { s: { 'Screen size': '75 inches', 'Panel type': 'QLED' } }],
    ['Bush 32 Inch DLED32HDS Smart HD Ready LED Freeview TV', 149, 'Bush', 4.3, 2145, { s: { 'Screen size': '32 inches', Resolution: 'HD Ready', 'Panel type': 'LED' } }],
    ['Toshiba 40 Inch 40LV3463DB Smart Full HD HDR LED Freeview TV', 199, 'Toshiba', 4.4, 516, { s: { 'Screen size': '40 inches', Resolution: 'Full HD', 'Panel type': 'LED' } }],
  ],
  soundbar: [
    ['Sonos Beam Gen 2 Wireless Soundbar with Dolby Atmos - Black', 449, 'Sonos', 4.8, 611, { s: { Channels: '5.0', 'Dolby Atmos': 'Yes' } }],
    ['Samsung HW-Q600C 3.1.2Ch 360W Soundbar with Wireless Subwoofer', 299, 'Samsung', 4.6, 398, { was: 379, s: { Channels: '3.1.2', Power: '360 W' } }],
    ['Sony HT-S2000 3.1Ch Dolby Atmos Soundbar', 349, 'Sony', 4.6, 227, { s: { Channels: '3.1', 'Dolby Atmos': 'Yes' } }],
    ['JBL Bar 300 5.0Ch Dolby Atmos Compact Soundbar', 279, 'JBL', 4.6, 189, { s: { Channels: '5.0', Power: '260 W' } }],
    ['Bush 2.1Ch 120W Soundbar with Subwoofer', 79.99, 'Bush', 4.2, 1306, { was: 99.99, s: { Channels: '2.1', Power: '120 W' } }],
  ],
  camera: [
    ['Canon EOS R50 Mirrorless Camera with 18-45mm Lens', 679, 'Canon', 4.8, 245, { s: { Sensor: '24.2 MP APS-C', Type: 'Mirrorless' } }],
    ['Sony Alpha ZV-E10 II Mirrorless Vlogging Camera with 16-50mm Lens', 949, 'Sony', 4.7, 98, { new: true, s: { Sensor: '26 MP APS-C', Type: 'Mirrorless' } }],
    ['GoPro HERO13 Black Action Camera', 349, 'GoPro', 4.6, 402, { was: 399, s: { 'Video resolution': '5.3K', Waterproof: '10 m' } }],
    ['Fujifilm Instax Mini 12 Instant Camera - Blossom Pink', 69.99, 'Fujifilm', 4.7, 3122, { s: { Type: 'Instant camera', 'Wi-Fi': 'No', 'Video resolution': 'Not applicable' } }],
    ['Kodak PIXPRO FZ55 16MP 5x Zoom Compact Digital Camera - Black', 109.99, 'Kodak', 4.2, 367, { s: { Sensor: '16 MP', Zoom: '5x optical', 'Video resolution': 'Full HD' } }],
  ],
  phone: [
    ['SIM Free iPhone 17 256GB 5G Mobile Phone - Black', 799, 'Apple', 4.8, 534, { new: true, s: { Storage: '256GB', Screen: '6.3 inches' } }],
    ['SIM Free iPhone 16 128GB 5G Mobile Phone - Ultramarine', 699, 'Apple', 4.8, 1820, { s: { Storage: '128GB', Screen: '6.1 inches' } }],
    ['SIM Free iPhone 16e 128GB 5G Mobile Phone - White', 599, 'Apple', 4.7, 702, { s: { Storage: '128GB', Screen: '6.1 inches' } }],
    ['SIM Free Samsung Galaxy S25 256GB 5G Mobile Phone - Navy', 799, 'Samsung', 4.7, 966, { was: 859, s: { Storage: '256GB', Screen: '6.2 inches' } }],
    ['SIM Free Samsung Galaxy A56 128GB 5G Mobile Phone - Graphite', 399, 'Samsung', 4.6, 618, { s: { Storage: '128GB', Screen: '6.7 inches' } }],
    ['SIM Free Google Pixel 10 128GB 5G Mobile Phone - Obsidian', 799, 'Google', 4.6, 211, { new: true, s: { Storage: '128GB', Screen: '6.3 inches' } }],
    ['SIM Free Motorola Moto G85 256GB 5G Mobile Phone - Cobalt Blue', 199.99, 'Motorola', 4.5, 488, { was: 229.99, s: { Storage: '256GB', Screen: '6.67 inches' } }],
    ['SIM Free Nokia G42 128GB 5G Mobile Phone - Purple', 149.99, 'Nokia', 4.3, 377, { s: { Storage: '128GB', Screen: '6.56 inches' } }],
  ],
  watch: [
    ['Apple Watch Series 11 GPS 42mm Aluminium Case - Jet Black', 399, 'Apple', 4.8, 342, { new: true, s: { Case: '42 mm aluminium' } }],
    ['Apple Watch SE 3 GPS 40mm Aluminium Case - Starlight', 219, 'Apple', 4.7, 801, { s: { Case: '40 mm aluminium' } }],
    ['Samsung Galaxy Watch8 Bluetooth 44mm Smart Watch - Graphite', 299, 'Samsung', 4.6, 154, { s: { Case: '44 mm' } }],
    ['Garmin Forerunner 165 GPS Running Smart Watch - Black', 219.99, 'Garmin', 4.7, 263, { was: 249.99, s: { Case: '43 mm' } }],
    ['Google Pixel Watch 3 41mm Smart Watch - Matte Black', 349, 'Google', 4.5, 118, { s: { Case: '41 mm' } }],
  ],
  headphones: [
    ['Apple AirPods Pro 3 Wireless Earbuds with MagSafe Charging Case', 219, 'Apple', 4.8, 1490, { new: true, s: { Type: 'In-ear', 'Battery life': 'Up to 8 hours' } }],
    ['Apple AirPods 4 Wireless Earbuds', 129, 'Apple', 4.7, 2216, { s: { Type: 'In-ear', 'Noise cancelling': 'No', 'Battery life': 'Up to 5 hours' } }],
    ['Sony WH-1000XM6 Over-Ear Wireless Noise Cancelling Headphones - Black', 399, 'Sony', 4.8, 377, { s: { Type: 'Over-ear', 'Battery life': 'Up to 30 hours' } }],
    ['Sony WH-CH520 On-Ear Wireless Headphones - Black', 39.99, 'Sony', 4.5, 3874, { was: 49.99, s: { Type: 'On-ear', 'Noise cancelling': 'No', 'Battery life': 'Up to 50 hours' } }],
    ['Bose QuietComfort Ultra Over-Ear Wireless Headphones - Black', 399.95, 'Bose', 4.7, 412, { s: { Type: 'Over-ear', 'Battery life': 'Up to 24 hours' } }],
    ['Samsung Galaxy Buds3 Pro Wireless Earbuds - Silver', 179, 'Samsung', 4.5, 296, { was: 219, s: { Type: 'In-ear', 'Battery life': 'Up to 6 hours' } }],
    ['JBL Tune 520BT On-Ear Wireless Headphones - Blue', 34.99, 'JBL', 4.6, 1953, { s: { Type: 'On-ear', 'Noise cancelling': 'No', 'Battery life': 'Up to 57 hours' } }],
    ['Beats Solo 4 On-Ear Wireless Headphones - Matte Black', 149.99, 'Beats', 4.6, 544, { was: 199.99, s: { Type: 'On-ear', 'Noise cancelling': 'No', 'Battery life': 'Up to 50 hours' } }],
  ],
  laptop: [
    ['Apple MacBook Air 13 Inch M4 16GB 256GB Laptop - Midnight', 899, 'Apple', 4.9, 612, { s: { Processor: 'Apple M4', Memory: '16GB', Storage: '256GB SSD', 'Operating system': 'macOS' } }],
    ['HP 15.6 Inch Intel Core i5 16GB 512GB Laptop - Silver', 499, 'HP', 4.5, 788, { was: 579, s: { Processor: 'Intel Core i5-1335U', Memory: '16GB', Storage: '512GB SSD' } }],
    ['Lenovo IdeaPad Slim 3 15.3 Inch Ryzen 5 8GB 512GB Laptop - Grey', 429, 'Lenovo', 4.5, 655, { s: { Processor: 'AMD Ryzen 5 7520U', Memory: '8GB', Storage: '512GB SSD' } }],
    ['ASUS Vivobook 14 Inch Intel Core i3 8GB 256GB Laptop - Blue', 329, 'ASUS', 4.3, 412, { s: { Processor: 'Intel Core i3-1215U', Memory: '8GB', Storage: '256GB SSD' } }],
    ['Acer Aspire Go 15.6 Inch Intel Celeron 4GB 128GB Laptop - Silver', 229, 'Acer', 4.1, 934, { was: 249, s: { Processor: 'Intel Celeron N4500', Memory: '4GB', Storage: '128GB eMMC' } }],
    ['Microsoft Surface Laptop 7 13.8 Inch Snapdragon X Plus 16GB 512GB Copilot+ PC', 999, 'Microsoft', 4.6, 177, { s: { Processor: 'Snapdragon X Plus', Memory: '16GB', Storage: '512GB SSD' } }],
    ['Lenovo IdeaPad Flex 5 14 Inch Ryzen 7 16GB 512GB 2-in-1 Laptop', 599, 'Lenovo', 4.6, 241, { s: { Processor: 'AMD Ryzen 7 7730U', Memory: '16GB', Storage: '512GB SSD', Display: 'Touchscreen WUXGA' } }],
  ],
  tablet: [
    ['Apple iPad 11 Inch Wi-Fi 128GB Tablet - Blue', 329, 'Apple', 4.8, 1544, { s: { Storage: '128GB', Screen: '11 inches' } }],
    ['Apple iPad Air 11 Inch M3 Wi-Fi 128GB Tablet - Space Grey', 599, 'Apple', 4.8, 302, { s: { Storage: '128GB', Screen: '11 inches' } }],
    ['Samsung Galaxy Tab A9+ 11 Inch 64GB Wi-Fi Tablet - Graphite', 169, 'Samsung', 4.6, 1188, { was: 219, s: { Storage: '64GB', Screen: '11 inches' } }],
    ['Samsung Galaxy Tab S10 FE 10.9 Inch 128GB Wi-Fi Tablet - Silver', 449, 'Samsung', 4.6, 154, { s: { Storage: '128GB', Screen: '10.9 inches' } }],
    ['Amazon Fire HD 10 Inch 32GB Tablet - Black', 99.99, 'Amazon', 4.5, 2961, { was: 139.99, s: { Storage: '32GB', Screen: '10.1 inches' } }],
    ['Lenovo Tab M11 11 Inch 128GB Wi-Fi Tablet with Pen - Grey', 179, 'Lenovo', 4.4, 506, { s: { Storage: '128GB', Screen: '11 inches' } }],
  ],
  ps5: [
    ['PlayStation 5 Console - Digital Edition (Slim)', 399.99, 'Sony', 4.8, 2788, { s: { Storage: '825GB SSD', 'Disc drive': 'No' } }],
    ['PlayStation 5 Console (Slim) with Disc Drive', 479.99, 'Sony', 4.8, 3410, { s: { Storage: '1TB SSD', 'Disc drive': 'Yes' } }],
    ['PlayStation 5 Pro Console - Digital Edition', 699.99, 'Sony', 4.7, 652, { s: { Storage: '2TB SSD', 'Disc drive': 'Sold separately' } }],
  ],
  ps5game: [
    ['EA SPORTS FC 26 PS5 Game', 59.99, 'EA', 4.2, 488, { pegi: 3, new: true }],
    ['Marvel\'s Spider-Man 2 PS5 Game', 39.99, 'Sony', 4.8, 1630, { was: 54.99, pegi: 16 }],
    ['Ghost of Yotei PS5 Game', 69.99, 'Sony', 4.8, 312, { pegi: 18, new: true }],
    ['Astro Bot PS5 Game', 39.99, 'Sony', 4.9, 822, { pegi: 7 }],
    ['Call of Duty: Black Ops 7 PS5 Game', 69.99, 'Activision', 4.3, 210, { pegi: 18, new: true }],
    ['Grand Theft Auto V PS5 Game', 19.99, 'Rockstar Games', 4.7, 2504, { pegi: 18, game: 'Grand Theft Auto V', kw: 'gta 5 gta v gtav' }],
    ['Red Dead Redemption 2 PS4 Game', 19.99, 'Rockstar Games', 4.8, 3012, { pegi: 18, kw: 'rdr2', s: { Platform: 'PlayStation 4 (plays on PS5)' } }],
    ['Hogwarts Legacy PS5 Game', 24.99, 'Warner Bros. Games', 4.7, 1904, { was: 34.99, pegi: 12 }],
    ['EA SPORTS F1 25 PS5 Game', 44.99, 'EA', 4.4, 233, { pegi: 3 }],
    ['Minecraft PS4 Game', 19.99, 'Mojang', 4.8, 4021, { pegi: 7, s: { Platform: 'PlayStation 4 (plays on PS5)' } }],
  ],
  xbox: [
    ['Xbox Series X 1TB Console - Black', 499.99, 'Microsoft', 4.8, 1844, { s: { Storage: '1TB SSD', 'Disc drive': 'Yes' } }],
    ['Xbox Series S 512GB Console - White', 299.99, 'Microsoft', 4.7, 2381, { s: { Storage: '512GB SSD', 'Disc drive': 'No', Resolution: 'Up to 1440p at 120Hz' } }],
    ['Xbox Series X 2TB Galaxy Black Special Edition Console', 649.99, 'Microsoft', 4.8, 288, { s: { Storage: '2TB SSD', 'Disc drive': 'Yes' } }],
  ],
  xboxgame: [
    ['EA SPORTS FC 26 Xbox Series X & Xbox One Game', 59.99, 'EA', 4.1, 201, { pegi: 3, new: true }],
    ['Call of Duty: Black Ops 7 Xbox Series X & Xbox One Game', 69.99, 'Activision', 4.2, 144, { pegi: 18, new: true }],
    ['Forza Horizon 5 Xbox Series X & Xbox One Game', 29.99, 'Xbox Game Studios', 4.8, 1290, { pegi: 3 }],
    ['Grand Theft Auto V Xbox Series X Game', 19.99, 'Rockstar Games', 4.7, 1488, { pegi: 18, game: 'Grand Theft Auto V', kw: 'gta 5 gta v gtav' }],
    ['Indiana Jones and the Great Circle Xbox Series X Game', 39.99, 'Bethesda', 4.6, 167, { pegi: 16 }],
    ['Minecraft Xbox Game', 19.99, 'Mojang', 4.8, 2650, { pegi: 7, s: { Platform: 'Xbox Series X|S and Xbox One' } }],
  ],
  switch2: [
    ['Nintendo Switch 2 Console', 395.99, 'Nintendo', 4.8, 1512, { s: { Storage: '256GB' } }],
    ['Nintendo Switch 2 Console & Mario Kart World Bundle', 429.99, 'Nintendo', 4.9, 2106, { s: { Storage: '256GB', 'Game included': 'Mario Kart World (download)' } }],
    ['Nintendo Switch Lite Console - Turquoise', 199.99, 'Nintendo', 4.8, 4880, { plat: 'switch', s: { Platform: 'Nintendo Switch Lite', Screen: '5.5 inch LCD', Storage: '32GB' } }],
  ],
  switchgame: [
    ['Mario Kart World Nintendo Switch 2 Game', 66.99, 'Nintendo', 4.8, 984, { pegi: 3, plat: 'switch-2', s: { Platform: 'Nintendo Switch 2' } }],
    ['Donkey Kong Bananza Nintendo Switch 2 Game', 66.99, 'Nintendo', 4.8, 402, { pegi: 7, plat: 'switch-2', s: { Platform: 'Nintendo Switch 2' } }],
    ['Pokemon Legends: Z-A Nintendo Switch Game', 49.99, 'Nintendo', 4.6, 233, { pegi: 7, new: true }],
    ['Mario Kart 8 Deluxe Nintendo Switch Game', 44.99, 'Nintendo', 4.9, 6122, { pegi: 3 }],
    ['Animal Crossing: New Horizons Nintendo Switch Game', 44.99, 'Nintendo', 4.9, 5304, { pegi: 3 }],
    ['Super Mario Party Jamboree Nintendo Switch Game', 44.99, 'Nintendo', 4.7, 812, { pegi: 3 }],
    ['The Legend of Zelda: Tears of the Kingdom Nintendo Switch Game', 49.99, 'Nintendo', 4.9, 2044, { pegi: 12 }],
    ['Minecraft Nintendo Switch Game', 24.99, 'Mojang', 4.8, 3390, { pegi: 7 }],
  ],
  psdigital: [
    ['PlayStation Store £20 Gift Card', 20, 'PlayStation', 4.8, 1702, {}],
    ['PlayStation Store £50 Gift Card', 50, 'PlayStation', 4.8, 1288, {}],
    ['PlayStation Plus Essential 12 Month Membership', 71.99, 'PlayStation', 4.6, 566, { s: { Duration: '12 months' } }],
  ],
  headset: [
    ['Sony PlayStation Pulse 3D Wireless Headset - White', 79.99, 'Sony', 4.6, 2212, { s: { Connection: 'Wireless USB adapter', Compatibility: 'PS5, PS4 and PC' } }],
    ['Turtle Beach Stealth 600 Gen 3 Wireless PS5, PS4, PC Headset', 89.99, 'Turtle Beach', 4.5, 431, { was: 99.99, s: { Connection: '2.4GHz wireless and Bluetooth', Compatibility: 'PS5, PS4, PC' } }],
    ['SteelSeries Arctis Nova 5 Wireless Xbox Gaming Headset', 129.99, 'SteelSeries', 4.6, 205, { s: { Connection: '2.4GHz wireless and Bluetooth', Compatibility: 'Xbox Series X|S, PC' } }],
    ['Razer BlackShark V2 X Wired Gaming Headset', 34.99, 'Razer', 4.5, 1388, { was: 49.99, s: { Connection: '3.5 mm', Compatibility: 'PC, consoles and mobile' } }],
    ['Logitech G435 Lightspeed Wireless Gaming Headset - Black', 49.99, 'Logitech G', 4.4, 902, { s: { Connection: 'Lightspeed wireless and Bluetooth', Compatibility: 'PC, PS5, mobile' } }],
  ],
  gaminglaptop: [
    ['ASUS TUF Gaming A15 15.6 Inch Ryzen 7 16GB 512GB RTX 4060 Gaming Laptop', 899, 'ASUS', 4.6, 312, { was: 999, s: { Processor: 'AMD Ryzen 7 7435HS', Graphics: 'NVIDIA GeForce RTX 4060', Memory: '16GB', Storage: '512GB SSD' } }],
    ['HP Victus 15.6 Inch Intel Core i5 16GB 512GB RTX 3050 Gaming Laptop', 649, 'HP', 4.4, 488, { s: { Processor: 'Intel Core i5-12450H', Graphics: 'NVIDIA GeForce RTX 3050', Memory: '16GB', Storage: '512GB SSD' } }],
    ['Lenovo LOQ 15.6 Inch Intel Core i7 16GB 1TB RTX 4060 Gaming Laptop', 1049, 'Lenovo', 4.6, 156, { s: { Processor: 'Intel Core i7-13650HX', Graphics: 'NVIDIA GeForce RTX 4060', Memory: '16GB', Storage: '1TB SSD' } }],
  ],
  pcgame: [
    ['The Sims 4 PC Game (Code in a Box)', 19.99, 'EA', 4.5, 1022, { pegi: 12 }],
    ['Football Manager 26 PC Game (Code in a Box)', 49.99, 'SEGA', 4.2, 118, { pegi: 3, new: true }],
    ['Red Dead Redemption 2 PC Game (Code in a Box)', 24.99, 'Rockstar Games', 4.7, 588, { pegi: 18 }],
  ],
  bed: [
    ['Habitat Kirby Double Fabric Ottoman Bed Frame - Grey', 279, 'Habitat', 4.5, 1288, { was: 349, s: { Size: 'Double (4ft 6)', Storage: 'Ottoman lift-up' } }],
    ['Argos Home Hallingford Double Wooden Bed Frame - White', 159, 'Argos Home', 4.3, 2210, { s: { Size: 'Double (4ft 6)', Material: 'Solid pine' } }],
    ['Argos Home Lavendon Kingsize Metal Bed Frame - Black', 139, 'Argos Home', 4.4, 1844, { s: { Size: 'King (5ft)', Material: 'Metal' } }],
    ['Habitat Kotka Kingsize Velvet Bed Frame - Green', 449, 'Habitat', 4.6, 302, { s: { Size: 'King (5ft)', Material: 'Velvet upholstery' } }],
    ['Argos Home Seville Single Bed Frame with Drawers - White', 189, 'Argos Home', 4.3, 912, { oos: true, s: { Size: 'Single (3ft)', Storage: '2 drawers' } }],
  ],
  sofa: [
    ['Habitat Kayla 3 Seater Fabric Sofa - Grey', 499, 'Habitat', 4.4, 1022, { was: 599, s: { Width: '201 cm', Upholstery: 'Fabric' } }],
    ['Argos Home Tammy 2 Seater Fabric Sofa - Charcoal', 249, 'Argos Home', 4.3, 1406, { s: { Width: '150 cm', Upholstery: 'Fabric' } }],
    ['Habitat Celine 3 Seater Velvet Sofa - Navy', 699, 'Habitat', 4.6, 288, { s: { Width: '208 cm', Upholstery: 'Velvet' } }],
    ['Argos Home Reclina Manual Recliner 3 Seater Sofa - Brown', 599, 'Argos Home', 4.2, 377, { s: { Width: '196 cm', Upholstery: 'Faux leather', Recliner: 'Manual' } }],
    ['Habitat Moda Corner Fabric Sofa - Natural', 899, 'Habitat', 4.5, 166, { new: true, s: { Width: '245 cm', Upholstery: 'Fabric' } }],
  ],
  rug: [
    ['Habitat Berber Geometric Rug - 160x230cm - Cream', 89, 'Habitat', 4.5, 412, { s: { Size: '160 x 230 cm', Material: 'Polypropylene' } }],
    ['Argos Home Shaggy Rug - 120x170cm - Grey', 35, 'Argos Home', 4.3, 2301, { was: 45, s: { Size: '120 x 170 cm', Pile: 'Shaggy' } }],
    ['Habitat Traditional Washable Runner - 60x230cm - Terracotta', 39, 'Habitat', 4.4, 233, { s: { Size: '60 x 230 cm', Care: 'Machine washable' } }],
    ['Argos Home Jute Look Flatweave Rug - 160x230cm - Natural', 59, 'Argos Home', 4.2, 488, { s: { Size: '160 x 230 cm', Weave: 'Flatweave' } }],
  ],
  kitchenware: [
    ['Tefal Easy Cook & Clean 3 Piece Non Stick Frying Pan Set', 34.99, 'Tefal', 4.7, 2810, { was: 49.99, s: { Pieces: '3', 'Hob compatibility': 'All hobs including induction' } }],
    ['Le Creuset 26cm Cast Iron Round Casserole Dish - Volcanic', 279, 'Le Creuset', 4.9, 401, { s: { Capacity: '5.3 litres', Material: 'Enamelled cast iron' } }],
    ['Joseph Joseph Nest 9 Plus Compact Food Preparation Set', 39.99, 'Joseph Joseph', 4.7, 655, { s: { Pieces: '9' } }],
    ['Habitat 16 Piece Stoneware Dinner Set - White', 40, 'Habitat', 4.6, 1188, { s: { Pieces: '16', Material: 'Stoneware' } }],
    ['Stellar James Martin 5 Piece Knife Block Set', 79.99, 'Stellar', 4.7, 266, { s: { Pieces: '5', Material: 'Stainless steel' } }],
    ['Argos Home 3 Piece Stainless Steel Saucepan Set', 25, 'Argos Home', 4.4, 1712, { s: { Pieces: '3' } }],
  ],
  dining: [
    ['Habitat Kendall Wood Effect Dining Table & 4 Chairs - Grey', 299, 'Habitat', 4.4, 766, { was: 349, s: { Seats: '4', Table: '120 x 75 cm' } }],
    ['Argos Home Lido Glass Dining Table & 4 Chairs - Black', 249, 'Argos Home', 4.2, 1033, { s: { Seats: '4', Table: 'Tempered glass top' } }],
    ['Habitat Nel Extending Oak Dining Table & 6 Chairs', 699, 'Habitat', 4.6, 144, { s: { Seats: '6', Table: '150-190 cm extending' } }],
    ['Argos Home Bistro Table & 2 Chairs - White', 129, 'Argos Home', 4.3, 512, { s: { Seats: '2', Table: '70 cm round' } }],
  ],
  desk: [
    ['Habitat Loft Living Desk - Oak Effect', 149, 'Habitat', 4.5, 433, { s: { Width: '120 cm', Finish: 'Oak effect' } }],
    ['Argos Home Pepper 1 Drawer Office Desk - White', 69, 'Argos Home', 4.3, 2522, { was: 79, s: { Width: '100 cm', Drawers: '1' } }],
    ['Argos Home Electric Height Adjustable Standing Desk - Black', 249, 'Argos Home', 4.5, 311, { new: true, s: { Width: '140 cm', Height: '72-118 cm electric' } }],
    ['Habitat Jenson Corner Desk - Walnut Effect', 199, 'Habitat', 4.4, 188, { s: { Width: '140 x 120 cm', Shape: 'L-shaped corner desk' } }],
  ],
  ceilinglight: [
    ['Habitat Rattan Easy Fit Pendant Shade - Natural', 25, 'Habitat', 4.6, 902, { s: { Fitting: 'Easy fit', Diameter: '40 cm' } }],
    ['Argos Home 3 Light Flush Ceiling Light - Chrome', 39, 'Argos Home', 4.4, 1206, { was: 49, s: { Fitting: 'Flush, wired', Bulbs: '3 x G9' } }],
    ['Habitat Beatrix 5 Light Glass Chandelier - Brass', 120, 'Habitat', 4.5, 166, { s: { Fitting: 'Wired pendant', Bulbs: '5 x E14' } }],
    ['Argos Home LED Integrated Flush Ceiling Light - White', 30, 'Argos Home', 4.3, 744, { s: { Fitting: 'Flush, wired', 'Bulb included': 'Integrated LED' } }],
  ],
  storage: [
    ['Habitat Squares 9 Cube Storage Unit - White', 65, 'Habitat', 4.6, 3220, { was: 75, s: { Cubes: '9', Size: 'H112 x W112 x D29 cm' } }],
    ['Argos Home Malibu 5 Shelf Bookcase - Oak Effect', 55, 'Argos Home', 4.3, 1102, { s: { Shelves: '5', Height: '170 cm' } }],
    ['Habitat Squares Plus 4 Cube Storage Unit - Walnut Effect', 45, 'Habitat', 4.5, 1488, { s: { Cubes: '4', Size: 'H74 x W74 x D29 cm' } }],
    ['Argos Home Kids 6 Box Storage Unit - White & Pastel', 40, 'Argos Home', 4.4, 512, { s: { Boxes: '6 fabric boxes' } }],
    ['Habitat Jenson 4 Drawer Chest of Drawers - Walnut Effect', 119, 'Habitat', 4.4, 677, { s: { Drawers: '4', Height: '93 cm' } }],
  ],
  hairstyler: [
    ['Dyson Airwrap i.d. Multi-Styler and Dryer - Vinca Blue', 479.99, 'Dyson', 4.6, 712, { s: { Attachments: '6' } }],
    ['Shark FlexStyle 5-in-1 Air Styler & Hair Dryer', 199.99, 'Shark', 4.6, 1834, { was: 269.99, s: { Attachments: '5' } }],
    ['ghd Platinum+ Hair Straightener - Black', 229, 'ghd', 4.8, 1290, { s: { 'Heat settings': 'Single optimum 185C', Plates: 'Ceramic' } }],
    ['Remington One Dry & Style Hair Dryer Brush', 44.99, 'Remington', 4.4, 922, { s: { 'Heat settings': '3' } }],
    ['BaByliss Hydro-Fusion Anti-Frizz Hair Dryer', 59.99, 'BaByliss', 4.6, 1477, { was: 79.99, s: { Power: '2100 W' } }],
  ],
  toothbrush: [
    ['Oral-B Pro 3 3500 Electric Toothbrush - Black', 49.99, 'Oral-B', 4.7, 4412, { was: 89.99 }],
    ['Oral-B iO6 Electric Toothbrush - Grey Opal', 129.99, 'Oral-B', 4.8, 1310, { s: { 'Cleaning modes': '5' } }],
    ['Philips Sonicare 3100 Electric Toothbrush - White', 39.99, 'Philips', 4.6, 2206, {}],
    ['Oral-B Vitality Pro Kids Electric Toothbrush - Frozen', 19.99, 'Oral-B', 4.7, 1533, {}],
  ],
  perfume: [
    ['Dior Sauvage Eau de Toilette for Men - 100ml', 109, 'Dior', 4.8, 2012, { s: { Type: 'Eau de Toilette', Size: '100 ml' } }],
    ['Paco Rabanne 1 Million Eau de Toilette for Men - 100ml', 79, 'Rabanne', 4.7, 1444, { was: 92, s: { Type: 'Eau de Toilette', Size: '100 ml' } }],
    ['Lancome La Vie Est Belle Eau de Parfum - 50ml', 86, 'Lancome', 4.8, 1702, { s: { Size: '50 ml' } }],
    ['Yves Saint Laurent Black Opium Eau de Parfum - 50ml', 89, 'Yves Saint Laurent', 4.8, 1288, { s: { Size: '50 ml' } }],
    ['Jean Paul Gaultier Le Male Eau de Toilette - 125ml', 82, 'Jean Paul Gaultier', 4.7, 912, { was: 99, s: { Type: 'Eau de Toilette', Size: '125 ml' } }],
    ['Marc Jacobs Daisy Eau de Toilette - 50ml', 69, 'Marc Jacobs', 4.7, 1011, { s: { Type: 'Eau de Toilette', Size: '50 ml' } }],
  ],
  makeup: [
    ['Benefit Cosmetics Pore Perfecting Makeup Gift Set', 45, 'Benefit', 4.6, 211, { new: true }],
    ['Revolution Ultimate Beauty Advent Calendar Makeup Set', 50, 'Revolution', 4.4, 377, { new: true }],
    ['Rimmel London Mascara and Lip Makeup Gift Set', 15, 'Rimmel', 4.3, 266, { was: 20 }],
  ],
  beautyappliance: [
    ['Philips Lumea IPL 8000 Series Hair Removal Device', 349.99, 'Philips', 4.6, 1105, { was: 449.99 }],
    ['Braun Silk-epil 9 Wet & Dry Epilator', 99.99, 'Braun', 4.5, 802, {}],
    ['FOREO LUNA 4 Mini Facial Cleansing Device - Pearl Pink', 89, 'FOREO', 4.5, 233, {}],
  ],
  massager: [
    ['Theragun Mini 3rd Generation Massage Gun', 179, 'Therabody', 4.7, 401, { was: 199 }],
    ['Homedics Physio Massage Gun with Heat', 79.99, 'Homedics', 4.4, 612, {}],
  ],
  shaver: [
    ['Philips Series 5000 Wet & Dry Electric Shaver', 89.99, 'Philips', 4.6, 2012, { was: 149.99 }],
    ['Braun Series 9 Pro+ Wet & Dry Electric Foil Shaver', 299.99, 'Braun', 4.7, 588, {}],
    ['Philips OneBlade 360 Face & Body Hybrid Trimmer', 44.99, 'Philips', 4.6, 3108, {}],
    ['Remington R5 Style Series Rotary Electric Shaver', 59.99, 'Remington', 4.3, 744, { was: 79.99 }],
  ],
  bpmonitor: [
    ['Omron M3 Comfort Upper Arm Blood Pressure Monitor', 59.99, 'Omron', 4.7, 1244, {}],
    ['Braun ExactFit 3 Upper Arm Blood Pressure Monitor', 39.99, 'Braun', 4.5, 612, { was: 49.99 }],
  ],
  vacuum: [
    ['Shark Anti Hair Wrap Cordless Pet Stick Vacuum Cleaner IZ202UKT', 229, 'Shark', 4.6, 6488, { was: 299, s: { Type: 'Cordless stick', 'Run time': 'Up to 40 minutes' } }],
    ['Dyson V15 Detect Absolute Cordless Vacuum Cleaner', 549.99, 'Dyson', 4.8, 1711, { s: { Type: 'Cordless stick', 'Run time': 'Up to 60 minutes' } }],
    ['Henry HVR160 Bagged Cylinder Vacuum Cleaner - Red', 139, 'Numatic', 4.8, 4022, { s: { Type: 'Corded cylinder', Bagless: 'No' } }],
    ['Vax Mach Air Corded Upright Vacuum Cleaner', 129, 'Vax', 4.5, 1902, { s: { Type: 'Corded upright' } }],
    ['Shark Steam & Scrub Automatic Steam Mop S6002UK', 149.99, 'Shark', 4.5, 902, { s: { Type: 'Steam mop' } }],
    ['Bush Cordless 2 in 1 Handheld Vacuum Cleaner', 59.99, 'Bush', 4.1, 1611, { was: 69.99, s: { Type: 'Cordless 2 in 1', 'Run time': 'Up to 25 minutes' } }],
  ],
  fridge: [
    ['Bush MFF55180W 55cm Frost Free Fridge Freezer - White', 349, 'Bush', 4.4, 1288, { s: { Width: '55 cm', Capacity: '236 litres' } }],
    ['Samsung RB34C632ESA 60cm Frost Free Fridge Freezer - Silver', 549, 'Samsung', 4.6, 812, { was: 649, s: { Width: '60 cm', Capacity: '344 litres' } }],
    ['Hisense RQ5P470SMIE American Style Fridge Freezer - Stainless Steel', 899, 'Hisense', 4.5, 302, { s: { Width: '79 cm', Capacity: '470 litres' } }],
    ['Beko CFG4686VW 60cm Frost Free Fridge Freezer - White', 429, 'Beko', 4.5, 655, { s: { Width: '60 cm', Capacity: '324 litres' } }],
  ],
  washer: [
    ['Bosch Series 4 WGG04409GB 9KG 1400 Spin Washing Machine - White', 449, 'Bosch', 4.7, 1411, { was: 529, s: { Capacity: '9 kg', 'Spin speed': '1400 rpm' } }],
    ['Hoover H-Wash 300 8KG 1400 Spin Washing Machine - White', 299, 'Hoover', 4.4, 2033, { s: { Capacity: '8 kg', 'Spin speed': '1400 rpm' } }],
    ['Samsung Series 5 WW90CGC04DAE 9KG 1400 Spin Washing Machine', 429, 'Samsung', 4.6, 722, { s: { Capacity: '9 kg', 'Spin speed': '1400 rpm' } }],
    ['Bush WMNB712EW 7KG 1200 Spin Washing Machine - White', 239, 'Bush', 4.3, 1544, { s: { Capacity: '7 kg', 'Spin speed': '1200 rpm' } }],
  ],
  cooker: [
    ['Bush BETC60W 60cm Electric Cooker with Ceramic Hob - White', 349, 'Bush', 4.3, 702, { s: { Fuel: 'Electric', Hob: 'Ceramic' } }],
    ['Beko KDVC563AK 50cm Double Oven Electric Cooker - Black', 399, 'Beko', 4.5, 433, { s: { Width: '50 cm', Fuel: 'Electric' } }],
    ['Indesit IS67V5KHW 60cm Gas Cooker - White', 449, 'Indesit', 4.4, 266, { s: { Fuel: 'Gas' } }],
  ],
  dishwasher: [
    ['Bosch Series 2 SMS2HVW67G Full Size Dishwasher - White', 399, 'Bosch', 4.6, 1188, { s: { 'Place settings': '13' } }],
    ['Hisense HV643D60UK Full Size Dishwasher - Stainless Steel', 349, 'Hisense', 4.4, 355, { was: 399, s: { 'Place settings': '14' } }],
    ['Beko DVS05C20W Slimline Dishwasher - White', 279, 'Beko', 4.4, 612, { s: { 'Place settings': '10', Width: '45 cm' } }],
  ],
  kettle: [
    ['Russell Hobbs 26051 Brushed Steel Quiet Boil Kettle', 39.99, 'Russell Hobbs', 4.5, 2188, { was: 49.99 }],
    ['Breville VKT224 Impressions Electric Kettle - White', 34.99, 'Breville', 4.6, 1702, {}],
    ['Cookworks Illuminated Glass Kettle', 14.99, 'Cookworks', 4.2, 3480, {}],
    ['Smeg KLF03 Electric Kettle - Cream', 149.95, 'Smeg', 4.7, 922, {}],
  ],
  heater: [
    ['De\'Longhi Dragon 4 2kW Oil Filled Radiator', 199.99, 'De\'Longhi', 4.6, 802, { s: { Power: '2000 W' } }],
    ['Challenge 2kW Oil Filled Radiator - White', 54.99, 'Challenge', 4.3, 2402, { was: 64.99, s: { Power: '2000 W' } }],
    ['Dyson Purifier Hot+Cool HP07 Fan Heater - White & Silver', 499.99, 'Dyson', 4.5, 377, { s: { Power: '2000 W', Purifier: 'HEPA H13' } }],
  ],
  airfryer: [
    ['Ninja Foodi MAX Dual Zone AF400UK 9.5L Air Fryer - Black', 199.99, 'Ninja', 4.8, 9302, { was: 249.99, s: { Capacity: '9.5 litres', Drawers: '2' } }],
    ['Ninja Air Fryer AF100UK 3.8L - Grey', 99.99, 'Ninja', 4.8, 6012, { s: { Capacity: '3.8 litres', Drawers: '1' } }],
    ['Tower T17088 Vortx 9L Dual Basket Air Fryer - Black', 89.99, 'Tower', 4.5, 2244, { was: 119.99, s: { Capacity: '9 litres', Drawers: '2' } }],
    ['Cosori Pro LE 4.7L Air Fryer - Grey', 79.99, 'Cosori', 4.6, 1411, { s: { Capacity: '4.7 litres', Drawers: '1' } }],
    ['Instant Vortex Plus ClearCook 5.7L Air Fryer', 119.99, 'Instant', 4.6, 802, { s: { Capacity: '5.7 litres', Window: 'Yes' } }],
    ['Ninja Double Stack XL 9.5L Air Fryer SL400UK', 229.99, 'Ninja', 4.7, 1288, { new: true, s: { Capacity: '9.5 litres', Drawers: '2 stacked' } }],
  ],
  dumbbell: [
    ['Opti Vinyl Dumbbells - 2 x 3kg', 15, 'Opti', 4.6, 2044, { s: { Weight: '2 x 3 kg' } }],
    ['Men\'s Health 20kg Adjustable Dumbbell Set', 49.99, "Men's Health", 4.5, 1102, { was: 59.99, s: { Weight: '20 kg total' } }],
    ['Bowflex SelectTech 552i Adjustable Dumbbells - Pair', 399, 'Bowflex', 4.8, 233, { s: { Weight: '2 to 24 kg each' } }],
  ],
  treadmill: [
    ['Opti Folding Treadmill', 299, 'Opti', 4.2, 1206, { s: { 'Max speed': '12 km/h' } }],
    ['Reebok GT40s One Series Treadmill', 649, 'Reebok', 4.5, 377, { was: 749, s: { 'Max speed': '16 km/h', Incline: 'Up to 15%' } }],
    ['Opti Walking Pad Under Desk Treadmill', 199, 'Opti', 4.3, 612, { new: true, s: { 'Max speed': '6 km/h', Folding: 'Flat storage' } }],
  ],
  exercisemat: [
    ['Opti 6mm Yoga Mat - Purple', 10, 'Opti', 4.5, 3202, {}],
    ['Women\'s Health 10mm Thick Exercise Mat - Grey', 20, "Women's Health", 4.6, 1306, {}],
    ['Opti Jigsaw Gym Floor Mats - 6 Pack', 25, 'Opti', 4.4, 902, {}],
  ],
  bike: [
    ['Cross FXT500 27.5 Inch Wheel Size Mens Mountain Bike', 269, 'Cross', 4.4, 811, { was: 299, s: { 'Wheel size': '27.5 inches', Gears: '21' } }],
    ['Cross Hybrid 700c Wheel Size Womens Hybrid Bike', 249, 'Cross', 4.3, 512, { s: { 'Wheel size': '700c', Gears: '18' } }],
    ['Carrera Crossfire E 27.5 Inch Electric Mountain Bike', 1199, 'Carrera', 4.5, 211, { s: { 'Wheel size': '27.5 inches', Motor: '250 W' } }],
    ['Challenge Folding 20 Inch Wheel Size Unisex Bike', 199, 'Challenge', 4.2, 377, { s: { 'Wheel size': '20 inches', Gears: '6' } }],
  ],
  football: [
    ['Nike Premier League Academy Football - Size 5', 22, 'Nike', 4.7, 1103, { s: { Size: '5' } }],
    ['Kickmaster 8ft x 5ft Folding Football Goal', 59.99, 'Kickmaster', 4.4, 802, { was: 69.99 }],
    ['Adidas Euro Training Football - Size 4', 18, 'Adidas', 4.5, 488, { s: { Size: '4' } }],
  ],
  suitcase: [
    ['Samsonite Upscape 4 Wheel Hard Cabin Suitcase - Black', 189, 'Samsonite', 4.7, 512, { s: { Size: 'Cabin 55 cm', Capacity: '40 litres' } }],
    ['Antler Clifton 4 Wheel Large Suitcase - Taupe', 199, 'Antler', 4.6, 433, { was: 249, s: { Size: 'Large 80 cm', Capacity: '107 litres' } }],
    ['Go Explore 4 Wheel Hard Medium Suitcase - Navy', 45, 'Go Explore', 4.3, 1906, { s: { Size: 'Medium 68 cm', Capacity: '67 litres' } }],
    ['Go Explore 4 Wheel Soft Cabin Suitcase - Grey', 30, 'Go Explore', 4.3, 2210, { s: { Size: 'Cabin 55 cm', Capacity: '35 litres' } }],
  ],
  tent: [
    ['ProAction 4 Man 1 Room Pop Up Camping Tent', 69.99, 'ProAction', 4.3, 702, { s: { Berth: '4 person', Pitching: 'Pop up' } }],
    ['Coleman Ridgeline 4 Plus 4 Man 1 Room Tent', 179.99, 'Coleman', 4.6, 266, { s: { Berth: '4 person' } }],
    ['Vango Odyssey Air 600 6 Man 3 Room Inflatable Tent', 599, 'Vango', 4.7, 98, { s: { Berth: '6 person', Pitching: 'Inflatable air beams' } }],
  ],
  tracker: [
    ['Fitbit Charge 6 Fitness Tracker - Obsidian', 109.99, 'Fitbit', 4.5, 1288, { was: 139.99 }],
    ['Fitbit Inspire 3 Fitness Tracker - Midnight Zen', 59.99, 'Fitbit', 4.4, 1903, {}],
    ['Garmin Vivosmart 5 Fitness Tracker - Black', 119.99, 'Garmin', 4.4, 312, {}],
  ],
  menswatch: [
    ['Casio Men\'s Classic Black Resin Strap Digital Watch', 22.99, 'Casio', 4.7, 3011, { s: { Display: 'Digital' } }],
    ['Sekonda Men\'s Silver Stainless Steel Bracelet Watch', 49.99, 'Sekonda', 4.5, 702, { was: 69.99 }],
    ['Seiko 5 Sports Men\'s Automatic Blue Dial Watch', 279, 'Seiko', 4.8, 188, { s: { Movement: 'Automatic' } }],
    ['Tissot PRX Men\'s Silver Stainless Steel Bracelet Watch', 375, 'Tissot', 4.8, 144, {}],
  ],
  womenswatch: [
    ['Sekonda Ladies Rose Gold Tone Bracelet Watch', 39.99, 'Sekonda', 4.5, 1102, { was: 54.99 }],
    ['Michael Kors Ladies Lexington Gold Tone Bracelet Watch', 249, 'Michael Kors', 4.7, 288, {}],
    ['Radley Ladies Black Leather Strap Watch', 69, 'Radley', 4.6, 377, {}],
    ['Olivia Burton Ladies Bee Blooms Rose Gold Mesh Watch', 99, 'Olivia Burton', 4.6, 212, {}],
  ],
  earrings: [
    ['Revere 9ct Gold Cubic Zirconia Stud Earrings', 49.99, 'Revere', 4.6, 512, { s: { Metal: '9ct yellow gold' }, extra: ['/sd/gold-jewellery'] }],
    ['Revere Sterling Silver Hoop Earrings', 25, 'Revere', 4.5, 802, { was: 30, s: { Metal: 'Sterling silver' } }],
    ['Swarovski Rhodium Plated Crystal Stud Earrings', 49, 'Swarovski', 4.7, 377, {}],
  ],
  chain: [
    ['Revere Men\'s 9ct Gold Curb Chain - 20 Inch', 179, 'Revere', 4.6, 233, { s: { Metal: '9ct yellow gold', Length: '20 inches' }, extra: ['/sd/gold-jewellery'] }],
    ['Revere Men\'s Sterling Silver Figaro Chain - 22 Inch', 45, 'Revere', 4.5, 402, { s: { Metal: 'Sterling silver', Length: '22 inches' } }],
    ['Revere Men\'s Stainless Steel Cross Pendant Necklace', 20, 'Revere', 4.4, 612, {}],
  ],
  weddingring: [
    ['Revere 9ct Gold 3mm Court Wedding Ring', 99, 'Revere', 4.7, 288, { s: { Metal: '9ct yellow gold', Width: '3 mm' }, extra: ['/sd/gold-jewellery'] }],
    ['Revere Platinum 4mm D-Shape Wedding Ring', 549, 'Revere', 4.8, 66, { s: { Metal: 'Platinum', Width: '4 mm' } }],
  ],
  jewellerybox: [
    ['Mele & Co Grey Velvet Jewellery Box', 25, 'Mele & Co', 4.6, 402, {}],
    ['Argos Home Mirrored Jewellery Cabinet - White', 89, 'Argos Home', 4.3, 233, { s: { Mounting: 'Wall or over door' } }],
  ],
  pram: [
    ['Silver Cross Pioneer 3 in 1 Travel System - Black', 650, 'Silver Cross', 4.7, 312, { s: { 'Car seat included': 'Yes' } }],
    ['Cosatto Wow 3 Travel System Bundle - Foxford Hall', 799, 'Cosatto', 4.6, 188, {}],
    ['Joie Litetrax 4 Pushchair - Shale', 179, 'Joie', 4.5, 612, { was: 219 }],
    ['Cuggl Maple Pushchair - Grey', 59.99, 'Cuggl', 4.3, 2033, { s: { 'Suitable from': '6 months' } }],
  ],
  earlylearning: [
    ['VTech Baby Musical Rhyme Book', 14.99, 'VTech', 4.7, 1906, {}],
    ['Fisher-Price Laugh & Learn Smart Stages Puppy', 24.99, 'Fisher-Price', 4.7, 1302, { was: 29.99 }],
    ['Chad Valley Baby Activity Gym', 25, 'Chad Valley', 4.5, 802, { s: { 'Suitable from': 'Birth' } }],
  ],
  cot: [
    ['Cuggl Lulworth 3 in 1 Cot Bed - White', 129.99, 'Cuggl', 4.6, 1188, { was: 149.99 }],
    ['Silver Cross Nostalgia Cot Bed - Antique Pine', 299, 'Silver Cross', 4.7, 211, {}],
    ['Chicco Next2Me Magic Bedside Crib - Grey', 199, 'Chicco', 4.6, 655, { s: { Type: 'Bedside crib' } }],
  ],
  highchair: [
    ['Cuggl Pear Highchair - Grey', 29.99, 'Cuggl', 4.4, 1412, {}],
    ['Joie Mimzy Recline Highchair - Linen', 99, 'Joie', 4.6, 377, { was: 119 }],
    ['Tommee Tippee Closer to Nature Starter Feeding Set', 35, 'Tommee Tippee', 4.7, 902, { s: { Includes: '4 bottles, teats and brush' } }],
  ],
  babybath: [
    ['Shnuggle Baby Bath - White & Grey', 29.99, 'Shnuggle', 4.7, 1022, {}],
    ['Cuggl Folding Baby Bath - Grey', 20, 'Cuggl', 4.3, 412, {}],
  ],
  babymonitor: [
    ['VTech BM5150 Smart Video Baby Monitor', 99.99, 'VTech', 4.4, 512, { s: { Screen: '5 inches', 'Night vision': 'Yes' } }],
    ['Motorola VM65 Connect Video Baby Monitor', 119.99, 'Motorola', 4.3, 377, { was: 139.99 }],
    ['BT Audio Baby Monitor 450', 39.99, 'BT', 4.5, 1288, { s: { Type: 'Audio only' } }],
  ],
  nightlight: [
    ['Gro Company Hatch Groclock Sleep Trainer', 34.99, 'Gro', 4.5, 1906, {}],
    ['Chad Valley Ocean Light Projector', 15, 'Chad Valley', 4.4, 802, {}],
  ],
  toddler: [
    ['VTech Toot-Toot Drivers Garage', 34.99, 'VTech', 4.7, 1544, { s: { 'Recommended age': '12 months to 5 years' } }],
    ['Chad Valley Wooden Shape Sorter', 8, 'Chad Valley', 4.5, 902, { extra: ['/list/3-for-20-on-selected-toys'] }],
    ['LEGO DUPLO Town Big Interactive Community Train 10428', 129.99, 'LEGO', 4.8, 288, { s: { 'Recommended age': '2 years+', Pieces: '86' } }],
  ],
  playset: [
    ['LEGO Star Wars Millennium Falcon 75375', 79.99, 'LEGO', 4.9, 802, { s: { Pieces: '921', 'Recommended age': '10 years+' } }],
    ['LEGO Technic McLaren Formula 1 Race Car 42141', 159.99, 'LEGO', 4.8, 433, { was: 189.99, s: { Pieces: '1432', 'Recommended age': '18 years+' } }],
    ['LEGO Friends Heartlake City Hospital 42621', 79.99, 'LEGO', 4.8, 266, { s: { Pieces: '1045', 'Recommended age': '7 years+' } }],
    ['Paw Patrol Lookout Tower Playset', 59.99, 'Paw Patrol', 4.7, 1306, { was: 74.99, s: { 'Recommended age': '3 years+' } }],
    ['Sylvanian Families Red Roof Country Home', 59.99, 'Sylvanian Families', 4.8, 512, { s: { 'Recommended age': '3 years+' } }],
    ['Bluey Ultimate Lights & Sounds Playhouse', 49.99, 'Bluey', 4.7, 702, {}],
  ],
  boardgame: [
    ['Monopoly Classic Board Game', 25, 'Hasbro Gaming', 4.7, 3011, { was: 30 }],
    ['Cluedo Classic Mystery Board Game', 20, 'Hasbro Gaming', 4.7, 1906, {}],
    ['The Traitors Official Board Game', 25, 'Bandai', 4.4, 802, { new: true, extra: ['/list/shop-the-traitors'] }],
    ['Articulate! Family Board Game', 25, 'Drumond Park', 4.8, 1288, {}],
    ['UNO Card Game', 8, 'Mattel', 4.8, 4022, { extra: ['/list/3-for-20-on-selected-toys'] }],
  ],
  creative: [
    ['LEGO Classic Large Creative Brick Box 10698', 44.99, 'LEGO', 4.9, 3203, { s: { Pieces: '790' } }],
    ['Play-Doh Kitchen Creations Ultimate Ice Cream Truck', 29.99, 'Play-Doh', 4.6, 1102, {}],
    ['Crayola Inspiration Art Case', 20, 'Crayola', 4.7, 1544, { was: 25 }],
    ['Chad Valley Bumper Craft Box', 8, 'Chad Valley', 4.3, 433, { extra: ['/list/3-for-20-on-selected-toys'] }],
  ],
  doll: [
    ['Barbie Dreamhouse 2024 Playset', 249.99, 'Barbie', 4.8, 912, { was: 299.99 }],
    ['Barbie Fashionistas Doll with Pink Dress', 12, 'Barbie', 4.7, 1288, { extra: ['/list/3-for-20-on-selected-toys'] }],
    ['Baby Annabell Little Sweet Annabell Doll', 29.99, 'Baby Annabell', 4.6, 433, {}],
    ['Rainbow High Fashion Doll - Ruby Anderson', 24.99, 'Rainbow High', 4.6, 377, {}],
  ],
  vehicle: [
    ['Hot Wheels Action Loop Cyclone Challenge Track Set', 29.99, 'Hot Wheels', 4.6, 802, {}],
    ['Hot Wheels 5 Car Gift Pack', 6, 'Hot Wheels', 4.8, 2602, { extra: ['/list/3-for-20-on-selected-toys'] }],
    ['Chad Valley Remote Control Stunt Car', 20, 'Chad Valley', 4.2, 912, { was: 25 }],
    ['Paw Patrol Chase Deluxe Vehicle', 15, 'Paw Patrol', 4.7, 1306, {}],
  ],
  womens: [
    ['Tu Womens Cream Cable Knit Jumper', 20, 'Tu', 4.4, 233, { s: { Sizes: '8 to 24' } }],
    ['Tu Womens Black Faux Leather Biker Jacket', 35, 'Tu', 4.5, 188, { s: { Sizes: '8 to 22' } }],
    ['Tu Womens Navy Fleece Lined Pyjama Set', 18, 'Tu', 4.6, 377, { s: { Sizes: '8 to 24' } }],
  ],
  mens: [
    ['Tu Mens Navy Crew Neck Jumper', 18, 'Tu', 4.4, 312, { s: { Sizes: 'S to XXL' } }],
    ['Tu Mens Black Padded Hooded Jacket', 40, 'Tu', 4.5, 266, { s: { Sizes: 'S to XXL' } }],
    ['Tu Mens Slim Fit Stretch Jeans - Indigo', 20, 'Tu', 4.3, 488, { s: { Waist: '30 to 40 inches' } }],
  ],
  boys: [
    ['Tu Boys Grey Joggers 2 Pack', 10, 'Tu', 4.6, 402, { s: { Ages: '3 to 14 years' } }],
    ['Tu Boys Navy Hooded Puffer Coat', 25, 'Tu', 4.5, 188, { s: { Ages: '3 to 14 years' } }],
  ],
  girls: [
    ['Tu Girls Pink Unicorn Hoodie', 12, 'Tu', 4.6, 266, { s: { Ages: '3 to 14 years' } }],
    ['Tu Girls Black Leggings 3 Pack', 9, 'Tu', 4.7, 512, { s: { Ages: '3 to 14 years' } }],
  ],
  uniform: [
    ['Tu Girls Grey Pleated School Skirt 2 Pack', 8, 'Tu', 4.5, 702, { s: { Ages: '3 to 16 years' } }],
    ['Tu Unisex White Polo Shirts 5 Pack', 6, 'Tu', 4.6, 1544, { s: { Ages: '3 to 16 years' } }],
  ],
  fancydress: [
    ['Rubies Harry Potter Gryffindor Robe Costume - 7-8 Years', 20, 'Rubies', 4.5, 233, {}],
    ['Disney Frozen Elsa Dress Up Costume - 5-6 Years', 18, 'Disney', 4.6, 377, {}],
  ],
  patio: [
    ['Argos Home Rattan Effect 4 Seater Garden Sofa Set - Grey', 349, 'Argos Home', 4.3, 512, { was: 449 }],
    ['Habitat Bistro 2 Seater Metal Garden Set - Sage', 99, 'Habitat', 4.4, 377, {}],
    ['Argos Home Wood 6 Seater Garden Dining Set', 399, 'Argos Home', 4.2, 188, {}],
  ],
  gazebo: [
    ['Argos Home 3m x 3m Garden Gazebo - Grey', 79, 'Argos Home', 4.1, 702, {}],
    ['Argos Home 3m x 3m Pop Up Gazebo - Black', 99, 'Argos Home', 4.2, 433, { was: 129 }],
  ],
  shed: [
    ['Forest Garden Overlap 6 x 4ft Apex Wooden Shed', 399, 'Forest Garden', 4.3, 433, {}],
    ['Rowlinson Shiplap 7 x 5ft Pent Wooden Shed', 549, 'Rowlinson', 4.4, 211, {}],
    ['Lifetime 8 x 7.5ft Plastic Garden Shed', 999, 'Lifetime', 4.6, 98, {}],
  ],
  summerhouse: [
    ['Forest Garden Oakley 7 x 5ft Wooden Summerhouse', 1149, 'Forest Garden', 4.4, 66, {}],
  ],
  greenhouse: [
    ['Argos Home 6 x 4ft Polycarbonate Greenhouse', 249, 'Argos Home', 4.2, 312, {}],
    ['Palram Canopia Hybrid 6 x 8ft Greenhouse - Green', 699, 'Palram', 4.5, 88, {}],
  ],
  bbq: [
    ['Weber Original Kettle E-5710 57cm Charcoal BBQ - Black', 239, 'Weber', 4.8, 702, {}],
    ['Char-Broil Performance Core 3 Burner Gas BBQ', 299, 'Char-Broil', 4.4, 233, { was: 349 }],
    ['Argos Home Kettle Charcoal BBQ', 39, 'Argos Home', 4.2, 1206, {}],
  ],
  xmastree: [
    ['Argos Home 6ft Pre-Lit Nordic Spruce Christmas Tree - Green', 99, 'Argos Home', 4.5, 1203, { new: true, s: { Height: '6 ft', Lights: '300 warm white LEDs' } }],
    ['Habitat 7ft Snow Tipped Alpine Christmas Tree', 149, 'Habitat', 4.6, 377, { new: true, s: { Height: '7 ft' } }],
    ['Argos Home 6ft Classic Pine Christmas Tree - Green', 40, 'Argos Home', 4.4, 2601, { s: { Height: '6 ft' } }],
  ],
}

const slugify = v => String(v).toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const hash = s => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) } return h >>> 0 }
const RESERVED = new Set(['8747444', '8747437'])
const GAME_PLATFORM_LABEL = { ps5: 'PlayStation 5', xbox: 'Xbox Series X|S', switch: 'Nintendo Switch', 'switch-2': 'Nintendo Switch 2', pc: 'PC' }

function buildShelf() {
  const used = new Set(RESERVED), rows = []
  for (const [key, list] of Object.entries(ROWS)) {
    const cat = CATS[key]
    if (!cat) throw new Error(`Unknown shelf category ${key}`)
    for (const [title, price, brand, rating, reviews, o = {}] of list) {
      // Argos product numbers are seven digits; avoid the 98xxxxx/99xxxxx fixture ranges and the GTA listings.
      let n = 1000000 + hash(title) % 7800000
      while (used.has(String(n)) || /^9[89]/.test(String(n))) n = n >= 8799999 ? 1000000 : n + 1
      const sku = String(n); used.add(sku)
      const plat = o.plat || cat.plat || null
      const game = cat.type === 'game'
      rows.push({
        sku, title, unit_price: price, brand, rating, reviews,
        was: o.was || null, deal: !!o.was, new: !!o.new,
        kind: 'other', shelf: true, shelfCat: key,
        catalogType: cat.type || 'other', catalogPlatform: plat,
        ...(game ? { gameTitle: o.game || title.replace(/\s+(?:PS[45]|Xbox.*|Nintendo Switch(?: 2)?|PC)\s+Game.*$/i, ''), platformLabel: (o.s?.Platform || '').replace(/\s*\(.*\)/, '') || GAME_PLATFORM_LABEL[plat], format: 'disc' } : {}),
        menu: cat.menu, department: cat.menu, category: MENU_NAMES[cat.menu], family: cat.label, group: cat.label,
        paths: [cat.path, ...(o.extra || [])],
        keywords: `${cat.words} ${brand} ${cat.label} ${o.kw || ''}`.toLowerCase(),
        specs: { Brand: brand, ...cat.specs, ...(o.s || {}) },
        description: `${cat.desc}`,
        pegi: o.pegi && o.pegi >= 18 ? o.pegi : null,
        ageRating: o.pegi ? `PEGI ${o.pegi}` : null,
        stock: o.oos ? 0 : 3 + hash(sku) % 10,
        methods: cat.bulky ? ['ship'] : ['ship', 'pickup'],
        bulky: !!cat.bulky,
        shape: cat.shape || undefined,
        included: game ? 'Game disc or code in retail packaging.' : 'Product and instructions.',
        guarantee: /Apple|Samsung|Sony|LG|Dyson/.test(brand) ? '1 year manufacturer guarantee. Argos Care available.' : '1 year manufacturer guarantee',
      })
    }
  }
  return rows
}

export const MENU_NAMES = { christmas: 'Christmas', toys: 'Toys', technology: 'Technology', gaming: 'Gaming', 'home-and-furniture': 'Home & Furniture', 'health-and-beauty': 'Health & Beauty', appliances: 'Appliances', 'sports-and-leisure': 'Sports & Leisure', 'jewellery-and-watches': 'Jewellery & Watches', 'baby-and-nursery': 'Baby & Nursery', clothing: 'Clothing', 'garden-and-diy': 'Garden & DIY' }
export const SHELF_CATEGORIES = CATS
export const SHELF = fixtureCatalog ? [] : buildShelf()
export const shelfBySku = sku => SHELF.find(p => p.sku === String(sku))
export const isShelf = p => !!p && SHELF.some(s => s.sku === String(p.sku))
export { slugify as shelfSlug }

// Popularity: rating weighted by review volume, so best-sellers lead "Recommended" ordering.
export const popularity = p => (p.rating || 0) * Math.log10(10 + (p.reviews || 0))
export const byPopularity = list => [...list].sort((a, b) => popularity(b) - popularity(a))
