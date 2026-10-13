// Original, deterministic retail fixtures. Product photographs are illustrative packshots.
export const DEPARTMENTS = [
  { id:'976759', slug:'food', name:'Grocery', key:'groceries', photo:'apples', campaign:'groceries', intro:'Stock the pantry and bring something fresh to the table.', categories:['Dairy','Bakery','Produce','Pantry','Beverages'] },
  { id:'4044', slug:'home', name:'Home', key:'home', photo:'armchair', campaign:'home', intro:'Comfort, storage and everyday pieces for your space.', categories:['Furniture','Lighting','Home Decor','Storage'] },
  { id:'133012', slug:'kitchen-dining', name:'Kitchen & Dining', key:'kitchen', photo:'dutch-oven', campaign:'home', intro:'Make a little more of every meal.', categories:['Cookware','Drinkware','Kitchen Appliances'] },
  { id:'3944', slug:'electronics', name:'Electronics', key:'electronics', photo:'headphones', campaign:'electronics', intro:'Connect, create and play with everyday tech.', categories:['Audio','Computer Accessories','Monitors','Phones'] },
  { id:'5438', slug:'clothing', name:'Clothing, Shoes & Accessories', key:'fashion', photo:'hoodie', campaign:null, intro:'Easy layers and everyday favorites for wherever you go.', categories:['Clothing','Shoes','Bags & Accessories'] },
  { id:'1085666', slug:'beauty', name:'Beauty', key:'beauty', photo:'serum', campaign:null, intro:'Refresh your daily skin, hair and beauty routine.', categories:['Makeup','Skin Care','Fragrance','Hair Care'] },
  { id:'5440', slug:'pets', name:'Pets', key:'pets', photo:'dog-food', campaign:null, intro:'Food, comfort and play for your favorite companions.', categories:['Dog Supplies','Cat Supplies','Pet Beds','Pet Accessories'] },
  { id:'4171', slug:'toys', name:'Toys & Outdoor Play', key:'toys', photo:'building-bricks', campaign:'toys', intro:'Big ideas, small discoveries and family fun.', categories:['Building Toys','Stuffed Animals','Bikes','Games & Puzzles','Action Figures','Arts & Crafts'] },
  { id:'2636', slug:'video-games', name:'Video Games', key:'games', photo:'controller', campaign:'gaming', intro:'Discover games, controllers and your next adventure.', categories:['Video Games','Gaming Accessories'] },
  { id:'4104', slug:'music', name:'Music', key:'music', art:'/static/art/vinyl.svg', campaign:'digital-games', intro:'Build your collection with albums on vinyl and CD.', categories:['Vinyl Records','CDs'] },
]
export const departmentPath = (base, d) => `${base}/cp/${d.slug}/${d.id}`
export const categorySlug = s => s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/-$/,'')
export const SELLERS = {
  walmart:{id:'walmart',name:'Walmart.com',rating:4.7,description:'Everyday essentials sold and shipped by Walmart. Order updates and eligible returns are available through your purchase history.',returns:'Most unopened general merchandise may be returned within 90 days of delivery. Food and personal care exceptions are described on each item.'},
  'bright-home':{id:'bright-home',name:'Bright Home Market',rating:4.6,description:'A home and kitchen Marketplace seller specializing in practical furniture, storage and cookware.',returns:'Eligible unused items may be returned within 30 days of delivery. Keep the packaging for large home items.'},
  'everyday-tech':{id:'everyday-tech',name:'Everyday Tech Shop',rating:4.5,description:'A Marketplace seller offering computer accessories and everyday personal electronics.',returns:'Eligible electronics may be returned within 30 days of delivery. Include accessories and remove personal data before returning.'},
}
export const CAMPAIGNS = [
 {slug:'weekly-essentials',title:'A fresh start to your week',subtitle:'Pantry staples, fresh picks & everyday value.',image:'groceries',departments:['groceries']},
 {slug:'fall-home',title:'Make room for cozy',subtitle:'Comfortable corners. Little everyday upgrades.',image:'home',departments:['home','kitchen']},
 {slug:'everyday-tech',title:'Big possibilities. Everyday prices.',subtitle:'Stay connected with tech that fits your day.',image:'electronics',departments:['electronics']},
 {slug:'family-fun',title:'More time for play',subtitle:'Build, imagine & make memories together.',image:'toys',departments:['toys']},
 {slug:'game-night',title:'Your next game night starts here',subtitle:'Controllers, accessories & games for your setup.',image:'gaming',departments:['games']},
 {slug:'discover-entertainment',title:'Find your next adventure',subtitle:'Games and soundtracks to add to your collection.',image:'digital-games',departments:['games','music']},
]
// [photo, title, brand, category, price, specifications, useful product detail]
const SEEDS = {
 electronics:[
  ['controller','Gamepad Wireless Controller','Onn','Gaming Accessories',39.88,{Connectivity:'Bluetooth and USB-C',Compatibility:'PC and compatible mobile devices'},'Rechargeable wireless gamepad with textured grips and a USB-C charging cable.'],
  ['headphones','Everyday Wireless Over-Ear Headphones','Onn','Audio',29.88,{Connectivity:'Bluetooth',Battery:'Up to 30 hours',Design:'Over-ear'},'Soft ear cushions and a folding design for music, calls and travel.'],
  ['keyboard','Compact Wireless Keyboard','Onn','Computer Accessories',24.88,{Connection:'USB receiver',Layout:'US QWERTY',Power:'2 AAA batteries'},'Quiet keys and a compact footprint free up room on your desk.'],
  ['mouse','Wireless Optical Mouse','Onn','Computer Accessories',12.88,{Connection:'USB receiver',Resolution:'1600 DPI',Power:'1 AA battery'},'Comfortable everyday mouse with three buttons and a scroll wheel.'],
  ['monitor','24-inch Full HD Computer Monitor','Onn','Monitors',109,{Resolution:'1920 × 1080',Refresh:'75 Hz',Ports:'HDMI and VGA'},'A clear Full HD display with tilt adjustment for work and casual gaming.'],
  ['smartphone','Unlocked Everyday Smartphone, 128GB','Onn','Phones',149,{Storage:'128GB',Display:'6.5-inch',Network:'4G LTE; check carrier compatibility'},'Unlocked phone with expandable storage, a dual camera and USB-C charging.'],
 ],
 kitchen:[
  ['dutch-oven','Enameled Cast Iron Dutch Oven, 5 Quart','Mainstays','Cookware',44.97,{Material:'Enameled cast iron',Capacity:'5 qt',Care:'Hand wash'},'Even heat and a close-fitting lid for soups, stews and slow-cooked meals.'],
  ['frying-pan','Nonstick Frying Pan, 10 inch','Mainstays','Cookware',14.97,{Material:'Aluminum',Diameter:'10 in',Care:'Hand wash'},'A lightweight everyday skillet with a comfortable handle and easy-release surface.'],
  ['mug','Stoneware Coffee Mug, 14 oz','Mainstays','Drinkware',3.98,{Material:'Stoneware',Capacity:'14 fl oz',Care:'Dishwasher and microwave safe'},'A generous handle and glazed finish for your morning coffee or evening tea.'],
  ['stand-mixer','Tilt-Head Stand Mixer, 4.5 Quart','Mainstays','Kitchen Appliances',89,{Capacity:'4.5 qt',Speeds:'6',Includes:'Whisk, dough hook and flat beater'},'Mix doughs, batters and whipped toppings in the removable steel bowl.'],
  ['kettle','Electric Kettle, 1.7 Liter','Mainstays','Kitchen Appliances',19.96,{Capacity:'1.7 L',Power:'1500 W',Safety:'Automatic shutoff'},'A cordless pouring design with a clear water window and removable filter.'],
  ['toaster','2-Slice Toaster','Mainstays','Kitchen Appliances',18.94,{Slots:'2 wide slots',Settings:'6 browning levels',Care:'Removable crumb tray'},'Toast bagels and bread with adjustable browning and a convenient cancel button.'],
 ],
 groceries:[
  ['milk','Whole Milk','Great Value','Dairy',3.46,{Size:'1 gallon',Storage:'Keep refrigerated',Allergens:'Contains milk'},'Grade A pasteurized whole milk with vitamin D. Refrigerate promptly after delivery.'],
  ['bread','Whole Wheat Sandwich Bread, 20 oz','Great Value','Bakery',2.48,{Size:'20 oz',Dietary:'Whole grain',Allergens:'Contains wheat'},'Soft sliced whole wheat bread for sandwiches, toast and the family table.'],
  ['apples','Fresh Red Apples, 3 lb Bag','Fresh Harvest','Produce',4.97,{Weight:'3 lb',Storage:'Refrigerate for freshness',Preparation:'Wash before eating'},'Crisp red apples for snacks, baking and lunch boxes. Produce size may vary.'],
  ['noodles','Spaghetti Pasta, 16 oz','Great Value','Pantry',0.98,{Weight:'16 oz',Dietary:'Vegan',Allergens:'Contains wheat'},'Dried spaghetti made from durum wheat for weeknight pasta dinners.'],
  ['water','Purified Drinking Water, 24 Pack','Great Value','Beverages',4.98,{Pack:'24 bottles',Volume:'16.9 fl oz each',Storage:'Cool, dry place'},'Purified bottled water with convenient individual bottles for home and on the go.'],
  ['coffee','Medium Roast Ground Coffee, 12 oz','Great Value','Beverages',5.98,{Weight:'12 oz',Roast:'Medium',Preparation:'Ground for drip brewing'},'Balanced medium-roast ground coffee with a resealable bag for everyday brewing.'],
 ],
 fashion:[
  ['sneakers','Everyday Lace-Up Sneakers','Athletic Works','Shoes',19.98,{Upper:'Textile and synthetic',Sole:'Rubber',Fit:'Regular width'},'Cushioned casual sneakers with a lace-up closure and flexible outsole.'],
  ['tshirt','Cotton Crewneck T-Shirt','No Boundaries','Clothing',6.98,{Material:'100% cotton',Fit:'Regular',Care:'Machine wash cold'},'A soft everyday crewneck with short sleeves and a comfortable regular fit.'],
  ['hoodie','Fleece Pullover Hoodie','Athletic Works','Clothing',16.98,{Material:'Cotton polyester blend',Fit:'Regular',Care:'Machine wash cold'},'A soft fleece layer with an adjustable hood and front kangaroo pocket.'],
  ['jeans','Straight-Leg Stretch Jeans','No Boundaries','Clothing',19.98,{Material:'Cotton blend with stretch',Fit:'Straight leg',Care:'Machine wash cold'},'Classic five-pocket jeans with a touch of stretch for everyday movement.'],
  ['backpack','Everyday School Backpack','No Boundaries','Bags & Accessories',14.98,{Capacity:'22 L',Material:'Polyester',Pockets:'Main compartment and front pocket'},'Adjustable padded straps and an easy-access pocket for school or errands.'],
  ['cap','Adjustable Cotton Baseball Cap','Athletic Works','Bags & Accessories',7.98,{Material:'Cotton',Fit:'Adjustable back strap',Care:'Spot clean'},'A curved brim and adjustable fit make this an easy sunny-day essential.'],
 ],
 home:[
  ['armchair','Upholstered Accent Armchair','Better Homes & Gardens','Furniture',129,{Material:'Fabric upholstery and wood legs',Dimensions:'28 × 30 × 32 in',Assembly:'Leg assembly required'},'A compact upholstered chair that creates a cozy reading spot in living rooms and bedrooms.'],
  ['lamp','Ceramic Table Lamp with Shade','Mainstays','Lighting',24.88,{Height:'18 in',Bulb:'E26, maximum 60W; not included',Power:'Plug-in'},'A fabric shade and ceramic base cast a warm glow on a bedside or accent table.'],
  ['desk','Writing Desk with Storage Drawer','Mainstays','Furniture',69,{Dimensions:'40 × 20 × 30 in',Material:'Engineered wood and steel',Assembly:'Required'},'A practical work surface with a compact drawer for notebooks and supplies.'],
  ['shelf','4-Tier Open Bookcase','Mainstays','Storage',39.88,{Dimensions:'24 × 12 × 48 in',Shelves:'4',Safety:'Wall anchor included'},'Open shelves keep books and decorative pieces easy to reach. Secure to a wall as directed.'],
  ['cushion','Textured Decorative Throw Pillow','Better Homes & Gardens','Home Decor',12.88,{Size:'18 × 18 in',Cover:'Polyester blend',Care:'Spot clean'},'A soft filled cushion adds a comfortable finishing touch to a sofa or chair.'],
  ['basket','Woven Storage Basket with Handles','Better Homes & Gardens','Storage',14.97,{Size:'14 × 10 × 8 in',Material:'Woven natural fiber',Care:'Wipe clean'},'Use the easy-grip handles to move this practical basket from shelf to room.'],
 ],
 beauty:[
  ['lipstick','Cream Finish Lip Color','Petal & Leaf','Makeup',4.98,{Finish:'Cream',Size:'0.12 oz',Use:'External use only'},'A creamy lip color with a smooth glide and buildable coverage.'],
  ['moisturizer','Daily Facial Moisturizer, 1.7 oz','Equate Beauty','Skin Care',8.98,{Size:'1.7 oz',Skin:'Normal to dry',Use:'Apply to clean skin'},'A lightweight facial moisturizer for a simple morning and evening routine.'],
  ['serum','Hydrating Facial Serum, 1 oz','Equate Beauty','Skin Care',9.98,{Size:'1 fl oz',Texture:'Lightweight serum',Use:'Patch test before use'},'A smooth hydrating layer to use before moisturizer as part of your daily routine.'],
  ['perfume','Soft Floral Eau de Parfum, 1.7 oz','Petal & Leaf','Fragrance',19.98,{Size:'1.7 fl oz',Family:'Floral',Packaging:'Glass spray bottle'},'A soft floral fragrance with a convenient spray bottle for everyday wear.'],
  ['hairdryer','Ionic Hair Dryer with Concentrator','Onn Beauty','Hair Care',19.88,{Power:'1875 W',Settings:'3 heat and 2 speed',Includes:'Concentrator attachment'},'Choose heat and speed settings, then use the cool shot to finish your style.'],
  ['shampoo','Daily Moisture Shampoo, 12 oz','Equate Beauty','Hair Care',3.98,{Size:'12 fl oz',Hair:'Normal to dry',Use:'Rinse thoroughly'},'An everyday cleansing shampoo designed for a simple moisture-focused hair routine.'],
 ],
 pets:[
  ['dog-food','Adult Dry Dog Food, Chicken Recipe','Ol Roy','Dog Supplies',10.98,{Weight:'8 lb',LifeStage:'Adult dogs',Flavor:'Chicken'},'Complete adult dog food. Follow the feeding guide and keep fresh water available.'],
  ['cat-food','Adult Dry Cat Food, Chicken Recipe, 3.15 lb','Special Kitty','Cat Supplies',5.98,{Weight:'3.15 lb',LifeStage:'Adult cats',Flavor:'Chicken'},'Crunchy adult cat food for everyday feeding. Introduce changes gradually.'],
  ['pet-bed','Bolster Pet Bed, Medium','Vibrant Life','Pet Beds',19.98,{Size:'28 × 20 in',Cover:'Polyester',Care:'Machine washable cover'},'Cushioned bolsters give your pet a soft place to rest between adventures.'],
  ['pet-bowl','Stainless Steel Pet Bowl','Vibrant Life','Pet Accessories',4.98,{Capacity:'32 fl oz',Material:'Stainless steel',Base:'Non-slip ring'},'A sturdy feeding bowl with a removable non-slip ring. Wash regularly.'],
  ['pet-ball','Textured Dog Play Ball','Vibrant Life','Dog Supplies',3.98,{Diameter:'3 in',Material:'Rubber',Use:'Supervised play'},'A textured ball for fetch and supervised play. Replace when worn or damaged.'],
  ['leash','Comfort-Grip Dog Leash, 6 ft','Vibrant Life','Dog Supplies',7.98,{Length:'6 ft',Material:'Nylon webbing',Hardware:'Metal snap hook'},'A comfortable loop handle and metal clip for everyday walks.'],
 ],
 toys:[
  ['building-bricks','Creative Building Bricks Set, 300 Pieces','Play Day','Building Toys',14.98,{Pieces:'300',Age:'6 years and up',Safety:'Small parts; not for children under 3'},'Colorful building bricks encourage open-ended construction and imaginative play.'],
  ['teddy','Soft Plush Teddy Bear, 14 inch','Play Day','Stuffed Animals',9.98,{Height:'14 in',Age:'3 years and up',Care:'Surface washable'},'A soft plush teddy with embroidered details for everyday cuddles.'],
  ['bicycle','20-inch Kids Bicycle','Adventure Ridge','Bikes',98,{Wheel:'20 in',Age:'7–10 years; check rider fit',Assembly:'Adult assembly required'},'A sturdy bicycle with front and rear brakes. Wear a properly fitted helmet.'],
  ['board-game','Family Game Night Board Game','Play Day','Games & Puzzles',12.98,{Players:'2–6',Age:'6 years and up',Duration:'About 30 minutes'},'An easy-to-learn family game with colorful pieces and a fold-out board.'],
  ['figure','Adventure Action Figure','Play Day','Action Figures',8.98,{Height:'6 in',Age:'4 years and up',Features:'Poseable joints'},'Create your own stories with a poseable adventure figure and removable accessory.'],
  ['crayons','Jumbo Crayons, 24 Colors','Play Day','Arts & Crafts',2.98,{Count:'24',Age:'3 years and up',Care:'Washable from most fabrics'},'Bright colors and an easy-grip shape for drawing, coloring and creative afternoons.'],
 ],
}
SEEDS.electronics.push(
 ['earbuds','True Wireless Earbuds with Charging Case','Onn','Audio',19.88,{Connectivity:'Bluetooth',Battery:'Up to 20 hours with case',Includes:'Charging case and ear tips'},'Pocket-size wireless earbuds for music and calls with a rechargeable storage case.'],
 ['speaker','Portable Bluetooth Speaker','Onn','Audio',24.88,{Connectivity:'Bluetooth',Battery:'Up to 12 hours',Design:'Portable'},'A rechargeable speaker with simple controls for music around the home.'],
 ['webcam','Full HD USB Webcam','Onn','Computer Accessories',19.88,{Resolution:'1080p',Connection:'USB-A',Includes:'Privacy cover'},'A clip-on webcam with a built-in microphone for everyday video calls.'],
 ['usb-hub','4-Port USB-C Hub','Onn','Computer Accessories',17.88,{Ports:'4 USB-A ports',Connection:'USB-C',Compatibility:'Compatible USB-C computers'},'Connect everyday USB accessories through one compact hub.'],
 ['ssd','Portable Solid State Drive, 1TB','Onn','Computer Accessories',69.88,{Capacity:'1TB',Connection:'USB-C',Includes:'USB-C cable'},'Portable storage for photos and documents. Actual usable capacity varies.'],
 ['smart-plug','Wi-Fi Smart Plug','Onn','Smart Home',9.88,{Network:'2.4 GHz Wi-Fi',Outlet:'US 120V',Use:'Indoor only'},'Schedule compatible lamps and small appliances through the manufacturer app.']
)
SEEDS.home.push(
 ['bed','Upholstered Queen Platform Bed','Mainstays','Furniture',179,{Size:'Queen',Mattress:'Sold separately',Assembly:'Required'},'A padded headboard and supportive slat base for a bedroom refresh.'],
 ['bath-towels','Cotton Bath Towel Set, 4 Pieces','Mainstays','Bath',14.88,{Pieces:'4',Material:'Cotton',Care:'Machine wash'},'Soft absorbent towels for an everyday bath routine.'],
 ['storage-bins','Clear Latching Storage Bins, Set of 3','Mainstays','Storage',18.88,{Pack:'3 bins',Capacity:'16 qt each',Material:'Plastic'},'Clear sides and latching lids make everyday storage easy to organize.'],
 ['hangers','Slim Clothes Hangers, 20 Pack','Mainstays','Storage',8.88,{Count:'20',Material:'Plastic',Shape:'Slim profile'},'A matching hanger set helps keep shirts and light layers tidy.']
)
SEEDS.kitchen.push(['chef-knife','Stainless Steel Chef Knife, 8 inch','Mainstays','Kitchen Tools',9.88,{Blade:'8 in stainless steel',Care:'Hand wash and dry',Includes:'Blade guard'},'An everyday chef knife for slicing and chopping. Store safely with the blade guard.'])
SEEDS.fashion.push(['tote','Everyday Canvas Tote Bag','No Boundaries','Bags & Accessories',9.98,{Material:'Cotton canvas',Closure:'Open top',Care:'Spot clean'},'A roomy everyday tote with sturdy shoulder handles for light shopping and errands.'])
SEEDS.games=[
 ['controller-black','Wireless Console Controller, Black','Game Corner','Gaming Accessories',49.88,{Connection:'Wireless and USB-C',Compatibility:'PC and compatible consoles; check device guide',Power:'Rechargeable'},'A comfortable wireless controller with textured grips and a USB-C cable.'],
 ['gaming-headset','Over-Ear Gaming Headset with Microphone','Game Corner','Gaming Accessories',29.88,{Connection:'3.5 mm audio',Microphone:'Adjustable boom',Fit:'Over-ear'},'Cushioned ear cups and an adjustable microphone for compatible gaming devices.'],
 ['ps5-console','PlayStation 5 Console, 1TB','Sony','Game Consoles',499,{Storage:'1TB',Video:'Up to 4K on compatible displays',Includes:'Console, controller and cables'},'A PlayStation 5 console with a controller and cables. Games are sold separately.'],
 ['xbox-console','Xbox Series X Console, 1TB','Microsoft','Game Consoles',499,{Storage:'1TB',Video:'Up to 4K on compatible displays',Includes:'Console, controller and cables'},'An Xbox Series X console with a controller and cables. Games are sold separately.'],
 ['handheld-console','Portable Handheld Gaming System','Game Corner','Game Consoles',199,{Storage:'128GB',Display:'7-inch',Power:'Rechargeable battery'},'A portable gaming system with built-in controls. Check game compatibility before purchase.'],
 ['gaming-chair','Adjustable Gaming Desk Chair','Game Corner','Gaming Furniture',99,{Material:'Upholstered seat',Features:'Height adjustment and armrests',Assembly:'Required'},'A supportive desk chair with adjustable seat height for work and play.']
]
const variant = (id, options, price, stock) => ({id,options,price,stock})
export const RETAIL_PRODUCTS = Object.entries(SEEDS).flatMap(([department,rows],di) => rows.map(([photo,title,brand,category,price,specs,detail],i) => {
 const sellerId = department === 'home' || department === 'kitchen' && i === 0 ? 'bright-home' : department === 'electronics' && i > 1 ? 'everyday-tech' : 'walmart'
 const p = {
  id:String(310000001+di*100+i),family:photo,slug:categorySlug(title),title,brand,department,category,photo:photo==='ssd'?'portable-ssd':photo==='lamp'?'ceramic-lamp':photo==='noodles'?null:photo,art:photo==='noodles'?'/walmart/static/spaghetti.svg':undefined,kind:'other',rank:20+di*20+i,
  price,wasPrice:i % 3 === 0 ? Math.round(price*1.25*100)/100:null,stock:i === 5 && department === 'home' ? 0:12,
  cta:'Add',preorder:false,tileBadge:i % 3 === 0 ? 'Rollback':null,pdpBadges:i % 3 === 0 ? ['Rollback']:[],cartBadges:[],
  rating:Math.round((4.1+(i%4)*0.2)*10)/10,ratings:42+i*37+di*9,reviews:2,
  arrival:department === 'groceries' ? {short:'tomorrow',day:'tomorrow',full:'tomorrow'} : {short:'in 2–3 days',day:'in 2–3 days',full:'in 2–3 days'},
  fulfillment:['shipping'],shippingText:department === 'groceries' ? 'Free shipping, arrives tomorrow':'Free shipping, arrives in 2–3 days',
  sellerId,specs,features:[detail,...Object.entries(specs).map(([k,v])=>`${k}: ${v}`)],crumbs:[DEPARTMENTS.find(d=>d.key===department).name,category],
  returnPolicy:department === 'groceries' ? 'Contact Customer Care within 7 days if your groceries arrive damaged or unsuitable. Keep perishable items refrigerated.' : department === 'beauty' ? 'Return eligible unopened items within 30 days. Opened personal care products may have restrictions.' : SELLERS[sellerId].returns,
  keywords:`${department} ${category} ${brand} ${photo} ${Object.values(specs).join(' ')}`,
  reviewEntries:[{id:'a',stars:5,name:'Jamie',title:`A useful ${category.toLowerCase()} find`,body:detail,date:'2026-09-22'},{id:'b',stars:4,name:'Taylor',title:'Good everyday value',body:`The ${title.toLowerCase()} matched the listed details. I checked the ${Object.keys(specs)[0].toLowerCase()} before ordering.`,date:'2026-09-14'}],
 }
 if(photo==='tshirt') p.variants=[variant('small',{Size:'S',Color:'White'},6.98,4),variant('medium',{Size:'M',Color:'White'},6.98,3),variant('large',{Size:'L',Color:'White'},7.98,2),variant('xl',{Size:'XL',Color:'White'},8.98,0)]
 if(photo==='headphones') p.variants=[variant('standard',{Style:'Standard'},29.88,3),variant('travel',{Style:'Travel bundle'},39.88,2),variant('studio',{Style:'Studio bundle'},49.88,0)]
 if(photo==='milk') p.variants=[variant('gallon',{Pack:'1 gallon'},3.46,6),variant('two-gallons',{Pack:'2 × 1 gallon'},6.72,2)]
 if(photo==='sneakers') p.variants=[variant('size7',{Size:'7'},19.98,3),variant('size8',{Size:'8'},19.98,2),variant('size9',{Size:'9'},21.98,2),variant('size10',{Size:'10'},21.98,0)]
 if(photo==='dog-food') p.variants=[variant('8lb',{Size:'8 lb'},10.98,4),variant('16lb',{Size:'16 lb'},18.98,3)]
 if(photo==='mug') p.variants=[variant('single',{Pack:'Single'},3.98,8),variant('four',{Pack:'Set of 4'},13.98,3)]
 if(photo==='hoodie') p.variants=[variant('medium',{Size:'M'},16.98,4),variant('large',{Size:'L'},16.98,3),variant('xl',{Size:'XL'},18.98,2)]
 if(photo==='jeans') p.variants=[variant('30',{Waist:'30 in'},19.98,3),variant('32',{Waist:'32 in'},19.98,4),variant('34',{Waist:'34 in'},21.98,2)]
 if(p.variants) p.cta='Options'
 return p
}))
