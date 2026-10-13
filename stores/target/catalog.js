// Deterministic ordinary retail fixtures informed by the public category structure in
// research/depth/target-blueprint.md. Names, TCINs, stock and offers are local fixtures.
export const DEPARTMENTS = [
  ['electronics','Electronics & Tech','headphones','electronics-campaign','Sound, screens & everyday connections'],
  ['kitchen-dining','Kitchen & Dining','dutch-oven','home-campaign','Make room for good food'],
  ['home-decor','Home & Decor','armchair','home-campaign','Little updates. A whole new feeling.'],
  ['clothing','Clothing, Shoes & Accessories','hoodie','home-campaign','Everyday favorites, your way'],
  ['beauty','Beauty & Personal Care','moisturizer','home-campaign','Refresh your daily routine'],
  ['pets','Pets','pet-bed','home-campaign','For their happiest everyday'],
  ['toys','Toys & Games','building-bricks','toys-campaign','Big ideas for little imaginations'],
  ['grocery','Grocery & Pantry','coffee','groceries-campaign','Pantry favorites for busy days'],
  ['household','Household Essentials','paper-towels','home-campaign','Restock the everyday essentials'],
  ['video-games','Video Games','controller','gaming-campaign','Your next great game starts here'],
].map(([id,name,photo,campaign,tagline]) => ({id,name,photo,campaign,tagline}))

// id, family, title, brand, price, type, material, core specifications.
const rows = [
  ['electronics','headphones','Wireless Over-Ear Headphones','heyday',39.99,'Headphones','Plastic','Connection:Bluetooth 5.3|Battery:Up to 30 hours|Included:USB-C charging cable'],
  ['electronics','earbuds','True Wireless Earbuds with Charging Case','heyday',29.99,'Headphones','Plastic','Connection:Bluetooth 5.3|Battery:6 hours plus charging case|Microphone:Built in'],
  ['electronics','speaker','Portable Bluetooth Speaker','heyday',24.99,'Speakers','Plastic','Connection:Bluetooth|Power:Rechargeable battery|Design:Portable carry loop'],
  ['electronics','monitor','24-inch Full HD Computer Monitor','Acer',119.99,'Computer Accessories','Plastic','Screen:24 inches|Resolution:1920 × 1080|Connection:HDMI'],
  ['electronics','keyboard','Full-Size Wireless Keyboard','Logitech',29.99,'Computer Accessories','Plastic','Connection:USB receiver|Layout:Full size with number pad|Compatibility:Windows and macOS'],
  ['electronics','mouse','Compact Wireless Mouse','Logitech',14.99,'Computer Accessories','Plastic','Connection:USB receiver|Tracking:Optical|Power:One AA battery'],
  ['kitchen-dining','dutch-oven','Enameled Cast Iron Dutch Oven','Threshold',59.99,'Cookware','Cast iron','Capacity:5 quarts|Cooktop:Gas, electric and induction|Care:Hand wash'],
  ['kitchen-dining','frying-pan','Nonstick Aluminum Frying Pan','Figmint',24.99,'Cookware','Aluminum','Diameter:10 inches|Cooking surface:Nonstick|Care:Hand wash recommended'],
  ['kitchen-dining','mug','Stoneware Coffee Mug','Threshold',5,'Drinkware','Stoneware','Capacity:16 fluid ounces|Care:Dishwasher safe|Use:Microwave safe'],
  ['kitchen-dining','stand-mixer','Tilt-Head Stand Mixer','KitchenAid',349.99,'Small Appliances','Stainless steel','Bowl:4.5 quarts|Speeds:10|Included:Beater, whisk and dough hook'],
  ['kitchen-dining','kettle','Electric Kettle with Auto Shutoff','Hamilton Beach',29.99,'Small Appliances','Stainless steel','Capacity:1.7 liters|Power:1500 watts|Safety:Automatic shutoff'],
  ['kitchen-dining','toaster','2-Slice Toaster','Hamilton Beach',24.99,'Small Appliances','Stainless steel','Slots:2 wide slots|Settings:Bagel, defrost and cancel|Care:Removable crumb tray'],
  ['home-decor','armchair','Upholstered Accent Chair','Threshold',220,'Furniture','Polyester','Dimensions:30 W × 31 D × 33 H inches|Assembly:Legs require assembly|Care:Spot clean'],
  ['home-decor','lamp','Ceramic Table Lamp with Shade','Threshold',35,'Lighting','Ceramic','Height:20 inches|Bulb:One E26 bulb, sold separately|Power:Corded electric'],
  ['home-decor','desk','Compact Writing Desk','Room Essentials',85,'Furniture','Engineered wood','Dimensions:40 W × 20 D × 30 H inches|Assembly:Required|Care:Wipe clean'],
  ['home-decor','shelf','4-Shelf Bookcase','Room Essentials',55,'Furniture','Engineered wood','Dimensions:24 W × 12 D × 48 H inches|Shelves:4|Safety:Wall anchor included'],
  ['home-decor','cushion','Textured Square Throw Pillow','Threshold',20,'Decor','Cotton blend','Dimensions:18 × 18 inches|Fill:Polyester|Care:Spot clean'],
  ['home-decor','basket','Woven Storage Basket','Threshold',18,'Storage','Water hyacinth','Dimensions:12 W × 10 D × 9 H inches|Handles:Two|Care:Wipe clean'],
  ['clothing','sneakers','Everyday Low-Top Sneakers','Universal Thread',29.99,'Shoes','Canvas','Upper:Canvas|Outsole:Rubber|Closure:Lace up'],
  ['clothing','tshirt','Short Sleeve Crewneck T-Shirt','Goodfellow & Co',8,'Tops','Cotton','Fit:Regular|Sleeve:Short|Care:Machine wash cold'],
  ['clothing','hoodie','Fleece Pullover Hoodie','Goodfellow & Co',25,'Tops','Cotton blend','Fit:Relaxed|Pocket:Front kangaroo pocket|Care:Machine wash cold'],
  ['clothing','jeans','Straight Fit Stretch Jeans','Goodfellow & Co',29.99,'Bottoms','Cotton blend','Fit:Straight|Rise:Mid rise|Care:Machine wash inside out'],
  ['clothing','backpack','Everyday Zip Backpack','Embark',25,'Accessories','Polyester','Capacity:20 liters|Compartments:Main compartment and front pocket|Care:Spot clean'],
  ['clothing','cap','Adjustable Cotton Baseball Cap','Goodfellow & Co',12,'Accessories','Cotton','Size:One size fits most|Closure:Adjustable strap|Care:Hand wash'],
  ['beauty','lipstick','Satin Finish Lipstick','e.l.f.',6,'Makeup','Cream','Net weight:0.12 ounce|Finish:Satin|Use:External use only'],
  ['beauty','moisturizer','Daily Facial Moisturizer','up&up',9.99,'Skin Care','Cream','Size:4 fluid ounces|Skin type:Normal to dry|Fragrance:Fragrance free'],
  ['beauty','serum','Hydrating Facial Serum','Byoma',15.99,'Skin Care','Liquid','Size:1 fluid ounce|Skin type:All skin types|Use:Apply to clean skin'],
  ['beauty','perfume','Eau de Parfum Spray','Fine\'ry',29.99,'Fragrance','Liquid','Size:2 fluid ounces|Fragrance family:Warm floral|Use:External use only'],
  ['beauty','hairdryer','Full-Size Hair Dryer','Conair',24.99,'Hair Care','Plastic','Power:1875 watts|Settings:3 heat and 2 speed|Included:Concentrator attachment'],
  ['beauty','shampoo','Daily Moisture Shampoo','Dove',6.99,'Hair Care','Liquid','Size:12 fluid ounces|Hair type:Dry hair|Use:Rinse after washing'],
  ['pets','dog-food','Adult Dry Dog Food - Chicken Recipe','Kindfull',18.99,'Dog Food','Dry kibble','Life stage:Adult|Size:5 pounds|Feeding:Follow package guidance'],
  ['pets','cat-food','Adult Wet Cat Food Variety Pack','Kindfull',12.99,'Cat Food','Wet food','Life stage:Adult|Pack:12 cans, 3 ounces each|Storage:Refrigerate after opening'],
  ['pets','pet-bed','Bolster Pet Bed','Boots & Barkley',24.99,'Beds & Accessories','Polyester','Dimensions:24 × 18 inches|Fill:Polyester|Care:Removable washable cover'],
  ['pets','pet-bowl','Stainless Steel Pet Bowl','Boots & Barkley',6,'Beds & Accessories','Stainless steel','Capacity:32 fluid ounces|Base:Non-slip|Care:Dishwasher safe'],
  ['pets','pet-ball','Durable Fetch Ball Dog Toy','Boots & Barkley',4.99,'Pet Toys','Rubber','Diameter:2.5 inches|Use:Supervised play|Care:Wash with water'],
  ['pets','leash','Nylon Walking Leash','Boots & Barkley',9.99,'Beds & Accessories','Nylon','Length:6 feet|Width:1 inch|Hardware:Metal clip'],
  ['toys','building-bricks','Creative Building Bricks Set','LEGO',29.99,'Building Toys','Plastic','Age:4 years and up|Pieces:500|Safety:Small parts; not for under 3 years'],
  ['toys','teddy','Soft Plush Teddy Bear','Gigglescape',10,'Plush Toys','Polyester','Age:3 years and up|Height:12 inches|Care:Spot clean'],
  ['toys','bicycle','Kids\' 16-inch Bicycle','Schwinn',129.99,'Outdoor Play','Steel','Age:4–7 years|Wheel size:16 inches|Assembly:Required; adult supervision'],
  ['toys','board-game','Family Strategy Board Game','Ravensburger',24.99,'Games & Activities','Cardboard','Age:8 years and up|Players:2–4|Play time:30–45 minutes'],
  ['toys','figure','Adventure Action Figure','Playmates',12.99,'Action Figures','Plastic','Age:4 years and up|Height:6 inches|Safety:Small parts; not for under 3 years'],
  ['toys','crayons','Classic Crayons - 24 Count','Crayola',2.49,'Games & Activities','Wax','Age:3 years and up|Count:24|Use:Art and drawing'],
  ['grocery','coffee','Medium Roast Ground Coffee','Good & Gather',7.99,'Coffee & Beverages','Ground coffee','Size:12 ounces|Ingredients:Arabica coffee|Storage:Cool, dry place'],
  ['grocery','pasta','Penne Pasta','Good & Gather',1.29,'Pantry Staples','Dry pasta','Size:16 ounces|Ingredients:Durum wheat semolina|Allergens:Contains wheat'],
  ['grocery','water','Purified Bottled Water - 24 Pack','Good & Gather',3.99,'Coffee & Beverages','Water','Pack:24 bottles, 16.9 fluid ounces each|Ingredients:Purified water|Storage:Away from heat'],
  ['grocery','oatmeal','Old Fashioned Rolled Oats','Good & Gather',3.49,'Breakfast','Whole grain oats','Size:18 ounces|Ingredients:Whole grain oats|Preparation:Cook before serving'],
  ['grocery','peanut-butter','Creamy Peanut Butter','Good & Gather',2.49,'Pantry Staples','Spread','Size:16 ounces|Ingredients:Roasted peanuts, sugar, palm oil, salt|Allergens:Contains peanuts'],
  ['grocery','cookies','Chocolate Chip Cookies','Favorite Day',3.79,'Snacks','Baked cookies','Size:13 ounces|Allergens:Contains wheat, milk and soy|Storage:Keep sealed in a cool, dry place'],
  ['household','paper-towels','Paper Towels - 6 Double Rolls','up&up',9.99,'Paper Products','Paper','Count:6 double rolls|Ply:2|Use:Household spills'],
  ['household','laundry-detergent','Liquid Laundry Detergent','up&up',10.99,'Laundry','Liquid','Size:100 fluid ounces|Loads:64|Compatibility:HE and standard washers'],
  ['household','trash-bags','Tall Kitchen Drawstring Trash Bags','up&up',8.99,'Trash Bags','Plastic','Capacity:13 gallons|Count:45|Closure:Drawstring'],
  ['household','napkins','Everyday Paper Napkins','dealworthy',2.49,'Paper Products','Paper','Count:250|Size:12 × 12 inches unfolded|Use:Everyday meals'],
  ['household','dish-soap','Liquid Dish Soap','up&up',2.99,'Cleaning','Liquid','Size:24 fluid ounces|Scent:Lemon|Use:Hand dishwashing only'],
  ['household','cleaning-wipes','Multi-Surface Cleaning Wipes','up&up',3.99,'Cleaning','Nonwoven wipes','Count:75|Scent:Fresh|Use:Hard nonporous surfaces; follow label'],
]

export const ORDINARY_PRODUCTS = rows.map(([department, family, name, brand, price, type, material, rawSpecs], i) => {
  const specs = rawSpecs.split('|').map(s => s.split(':'))
  const dept = DEPARTMENTS.find(d => d.id === department)
  const stock = family === 'speaker' ? 0 : 5 + (i % 5)
  const p = { tcin:String(90000001+i), kind:'other', family, department, type, material,
    slug: `${brand}-${name}`.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''),
    title:`${name} - ${brand}`, brand, price, stock, limit:5, preorder:false, photo:({'cat-food':'wet-cat-food',lamp:'ceramic-lamp',sneakers:'canvas-sneakers'}[family]||family),
    crumbs:[dept.name,type], glance:specs[0].join(': '), questions:0, esp:false, seller:'Target',
    rating:{score:(4.1+(i%8)/10).toFixed(1),text:`${(4.1+(i%8)/10).toFixed(1)} out of 5 stars`,count:24+i*13,loved:['everyday value','easy to use','quality'][i%3]},
    highlights:[specs[0].join(': '),specs[1].join(': '),specs[2].join(': ')],
    description:`${name} from ${brand} fits into your everyday ${['grocery','kitchen-dining'].includes(department)?'kitchen':department==='pets'?'pet-care':department==='toys'?'playtime':'home'} routine. ${specs.map(([label,value]) => `${label}: ${value}.`).join(' ')}`,
    specs:[['Brand',brand],['Product type',type],['Material / form',material],...specs,['Sold and shipped by','Target']],
    shippingNote: department==='beauty' && family==='perfume' ? 'Ground shipping within the contiguous United States. This fragrance cannot ship to Alaska, Hawaii or PO Boxes.' : 'Standard shipping is available. Order Pickup and Same Day Delivery are not offered for this item in this catalog.',
    restricted:family==='perfume', returns:['grocery','beauty','pets'].includes(department)?'Check the package and contact Target Help for issues. Opened food and personal-care items may have additional return restrictions.':'Returns accepted within 90 days with proof of purchase. Item condition and category exceptions apply.',
    eta: family==='armchair'||family==='desk'||family==='shelf' ? 'Arrives in 5–7 business days' : 'Arrives in 3–5 business days',
    keywords:`${name} ${brand} ${dept.name} ${type} ${family} ${material} everyday essentials`,
    deal:i%3===0, isNew:i%7===0,
  }
  const unit={coffee:[12,'oz'],pasta:[16,'oz'],water:[405.6,'fl oz'],oatmeal:[18,'oz'],'peanut-butter':[16,'oz'],cookies:[13,'oz'],'paper-towels':[6,'roll'],'laundry-detergent':[100,'fl oz'],'trash-bags':[45,'bag'],napkins:[250,'napkin'],'dish-soap':[24,'fl oz'],'cleaning-wipes':[75,'wipe'],shampoo:[12,'fl oz'],'dog-food':[5,'lb'],'cat-food':[12,'can']}[family]
  if(unit){p.unitAmount=unit[0];p.unitLabel=unit[1]}
  if (p.deal) p.regularPrice=Math.round((price*1.2+1)*100)/100
  if (['sneakers','tshirt','hoodie','jeans','pet-bed','dutch-oven','coffee','shampoo'].includes(family)) {
    const choices={sneakers:['6','7','8','9','10'],tshirt:['S','M','L','XL'],hoodie:['S','M','L','XL'],jeans:['30 × 30','32 × 32','34 × 32','36 × 32'],'pet-bed':['Small','Large'],'dutch-oven':['5 qt','7 qt'],coffee:['12 oz','24 oz'],shampoo:['12 fl oz','20 fl oz']}[family]
    p.optionLabel=['coffee','shampoo','dutch-oven'].includes(family)?'Size / capacity':'Size'
    p.variants=choices.map((value,index)=>({id:`${p.tcin}-${index+1}`,options:{[p.optionLabel]:value},price:Math.round((price+(family==='dutch-oven'?20:family==='pet-bed'?10:family==='coffee'?6:family==='shampoo'?3:0)*index)*100)/100,stock:family==='tshirt'&&index===3?0:index===1?2:3}))
    p.variants.forEach((v,index)=>{
      if(family==='dutch-oven')v.specs=[['Capacity',index?'7 quarts':'5 quarts']]
      if(family==='coffee'){v.specs=[['Size',index?'24 ounces':'12 ounces']];v.unitAmount=index?24:12}
      if(family==='shampoo'){v.specs=[['Size',index?'20 fluid ounces':'12 fluid ounces']];v.unitAmount=index?20:12}
      if(family==='pet-bed')v.specs=[['Dimensions',index?'36 × 24 inches':'24 × 18 inches']]
    })
    p.stock=p.variants.reduce((n,v)=>n+v.stock,0)
  }
  return p
})

export const CAMPAIGNS = [
  {id:'top-deals',name:'Top Deals',tagline:'Good finds. Even better prices.',image:'home-campaign',description:'Browse current price reductions across your favorite departments.',select:p=>p.deal},
  {id:'clearance',name:'Clearance',tagline:'Last-chance finds for less',image:'home-campaign',description:'A small selection of reduced-price favorites while local stock lasts.',select:p=>p.deal&&p.price<30},
  {id:'new-arrivals',name:'New Arrivals',tagline:'Find your next favorite',image:'toys-campaign',description:'Discover fresh picks for your home, routine and playtime.',select:p=>p.isNew},
  {id:'fall-home',name:'The Fall Home Edit',tagline:'Make yourself at home',image:'target-fall-home-campaign',description:'Warm textures, practical storage and kitchen favorites for everyday gatherings.',select:p=>['home-decor','kitchen-dining'].includes(p.department)},
  {id:'everyday-essentials',name:'Everyday Essentials',tagline:'The little things you need, for less',image:'groceries-campaign',description:'Shelf-stable pantry picks, household refills and everyday care.',select:p=>['grocery','household','beauty'].includes(p.department)},
]
