import { applyCatalogPolicy } from '../../lib/catalog-policy.js'
import { petAssortment } from './assortment.js'
// Original eight fixtures retain their IDs, base prices and required options.
const original = [
  {
    "id": "dog-food",
    "title": "Adult dry dog food",
    "category": "Dog",
    "price": 34.99,
    "keywords": "pet food kibble supplies",
    "description": "A resealable bag of everyday dry food for adult dogs.",
    "art": "M48 19h64l-6 17 7 65H47l7-65z M68 59h24v22H68z",
    "color": "#c5ae89",
    "rating": 4.3,
    "reviews": 31,
    "badge": "New",
    "detail": "A resealable bag of everyday dry food for adult dogs.",
    "options": {},
    "details": [
      "Bag size: 12 lb",
      "Life stage: adult",
      "Food form: dry kibble",
      "Store in a cool, dry place"
    ]
  },
  {
    "id": "cat-bed",
    "title": "Cozy round cat bed",
    "category": "Cat",
    "price": 27.99,
    "keywords": "pet bed cushion supplies",
    "description": "A soft round bed with raised edges for cozy cat naps.",
    "art": "M29 73a51 27 0 1 0 102 0 51 27 0 1 0-102 0 M47 66q33-28 66 0v15H47z",
    "color": "#919b7d",
    "rating": 4.4,
    "reviews": 78,
    "badge": "",
    "detail": "A soft round bed with raised edges for cozy cat naps.",
    "options": {
      "Size": [
        "Small",
        "Medium",
        "Large"
      ]
    }
  },
  {
    "id": "pet-bowl",
    "title": "Stainless steel pet bowl",
    "category": "Pet supplies",
    "price": 12.99,
    "keywords": "dog cat feeding water dish",
    "description": "A durable everyday feeding bowl with a broad base.",
    "art": "M45 48h70l12 46H33z M46 42h68v7H46z",
    "color": "#bb8f76",
    "rating": 4.5,
    "reviews": 125,
    "badge": "",
    "detail": "A durable everyday feeding bowl with a broad base.",
    "options": {}
  },
  {
    "id": "dog-toy",
    "title": "Durable rubber fetch ball",
    "category": "Dog",
    "price": 8.99,
    "keywords": "pet dog toy fetch ball play",
    "description": "A textured rubber ball for supervised games of fetch.",
    "art": "M45 61a35 35 0 1 0 70 0 35 35 0 1 0-70 0",
    "color": "#687f84",
    "rating": 4.6,
    "reviews": 172,
    "badge": "New",
    "detail": "A textured rubber ball for supervised games of fetch.",
    "options": {}
  },
  {
    "id": "cat-food",
    "title": "Indoor adult cat food, 7 lb",
    "category": "Cat",
    "price": 23.99,
    "keywords": "pet food kibble cat supplies",
    "description": "A resealable bag of dry food for adult indoor cats.",
    "art": "M48 19h64l-6 17 7 65H47l7-65z M68 59h24v22H68z",
    "color": "#e7b5aa",
    "rating": 4.7,
    "reviews": 219,
    "badge": "",
    "detail": "A resealable bag of dry food for adult indoor cats.",
    "options": {}
  },
  {
    "id": "cat-tree",
    "title": "Two-level cat tree",
    "category": "Cat",
    "price": 54.99,
    "keywords": "pet furniture scratcher toys",
    "description": "A cozy platform and sisal-wrapped scratching posts.",
    "art": "M29 98h103v8H29z M52 50h8v47h-8z M101 29h8v68h-8z M30 43h58v8H30z M86 23h43v8H86z",
    "color": "#d6cfbf",
    "rating": 4.3,
    "reviews": 266,
    "badge": "",
    "detail": "A cozy platform and sisal-wrapped scratching posts.",
    "options": {}
  },
  {
    "id": "dog-leash",
    "title": "Everyday dog leash, 6 ft",
    "category": "Dog",
    "price": 15.99,
    "keywords": "pet walking nylon leash supplies",
    "description": "Durable woven nylon with a comfortable loop handle.",
    "art": "M58 28q0-17 18-17t18 17q0 17-18 17V90h17v12H66V45q-8-6-8-17",
    "color": "#c6a89d",
    "rating": 4.4,
    "reviews": 313,
    "badge": "",
    "detail": "Durable woven nylon with a comfortable loop handle.",
    "options": {}
  },
  {
    "id": "bird-feeder",
    "title": "Small bird feeding station",
    "category": "Other Animals",
    "price": 19.99,
    "keywords": "bird feeder pet supplies",
    "description": "An easy-to-clean feeder for small pet birds.",
    "art": "M49 40h62v52H49z M39 39l41-23 41 23z M38 94h84v9H38z",
    "color": "#809079",
    "rating": 4.5,
    "reviews": 360,
    "badge": "",
    "detail": "An easy-to-clean feeder for small pet birds.",
    "options": {}
  }
]

export const species = ['Dog', 'Cat', 'Pet Bird', 'Fish', 'Small Pet', 'Reptile', 'Horse', 'Chicken']
export const slugify = value => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
export const categories = ['Food', 'Treats', 'Toys', 'Beds & Furniture', 'Feeding & Water', 'Walking', 'Grooming', 'Cleaning', 'Habitats', 'Bedding', 'Aquarium Care', 'Heating']
export const brands = ['Paw Meadow', 'Cozy Grove', 'Trail Tails', 'Feather Field', 'Blue Current', 'Little Burrow', 'Desert Den', 'Barn & Pasture']
const foodCare = 'Store sealed in a cool, dry place. Follow the feeding instructions on the specific package for your animal and life stage. Fresh water should always be available.'
const toyCare = 'Supervise use, inspect regularly and replace if damaged. Choose a size appropriate for your pet.'
const art = {
  bag: 'M48 20h64l-5 17 8 66H45l8-66z M58 53h44v27H58z',
  crate: 'M25 36h110v66H25z M28 35l20-20h70l17 20 M44 37v62m18-62v62m19-62v62m18-62v62m18-62v62M26 56h108M26 78h108',
  pads: 'M24 47l86-26 29 56-84 29z M38 51l66-19 22 40-66 22z',
  bags: 'M42 39q0-14 17-14h16v69H42z M84 54q0-14 17-14h17v53H84z M43 43h30m12 16h31',
  puzzle: 'M22 82l11-36h94l11 36-13 18H35z M46 54h23v22H46z M87 54h23v22H87z M68 80h23v13H68z',
  mat: 'M22 42l101-11 18 57-105 14z M47 41l13 56M73 37l13 56M99 34l13 56',
  mouse: 'M48 78q-11-34 23-41 34-1 40 32l-7 21H63z M95 89q40 22 42-7 M59 43l-6-18 18 5 M93 40l8-16 9 28',
  glove: 'M43 91V53q0-12 10-9V26q3-13 12 0V19q5-13 12 1v5q8-14 14 0v9q11-8 15 4v24l9-16q16-5 12 10l-16 40z',
  perch: 'M25 58l110-18 3 11L28 72z M33 45v37m91-53v37',
  foraging: 'M80 13v18 M64 30h32v18H64z M55 52h50v22H55z M65 80h30v21H65z M50 41l-18 10m78-10 18 10M53 65l-23 10m80-10 21 10',
  flakes: 'M47 27h66v13H47z M51 42h58v59H51z M61 58h38v22H61z',
  filter: 'M47 33h58v62H47z M100 40h20v40h-13V54h-7 M53 31V19h33v13 M60 48h29v29H60z',
  net: 'M26 30h57v43H26z M29 33l50 37M79 33L30 70M79 68l55 32',
  hay: 'M33 42h94v58H33z M39 50l13 39m-1-45 13 48m2-50 10 49m2-49 11 50m3-49 9 45m4-45 11 42 M39 40l12-18m7 17 8-20m11 21 13-20m12 23 12-12',
  terrarium: 'M21 24h118v77H21z M25 30h110v63H25z M24 62h112M80 32v58 M35 81l14-18 16 17',
  hide: 'M24 100q0-61 53-65 58 1 59 65H98V80q-20-28-34 0v20z',
  lamp: 'M43 66q0-47 39-47t39 47z M74 68h16v15H74z M81 19V8h43v70h-11',
  mitt: 'M45 96V50q0-29 30-27 27-1 27 25v16l16-16q15-4 9 15l-25 36z M55 47l34 4m-36 10 39 3m-37 10 31 3',
}
const baseline = {
  'dog-food': { species:['Dog'], type:'Food', brand:'Paw Meadow', photo:'dog-food', lifeStage:'Adult', foodForm:'Dry Food', flavor:'Original', pack:'12 lb', size:'12 lb', material:'Dry kibble', care:foodCare, autoship:true, details:['Bag size: 12 lb','Life stage: adult','Food form: dry kibble','Store in a cool, dry place'] },
  'cat-bed': { species:['Cat'], type:'Beds & Furniture', brand:'Cozy Grove', photo:'cat-bed-sage', pack:'1 bed', size:'Small', material:'Polyester plush cover and fiber fill', care:'Spot clean with mild soap; air dry completely before use.', details:['Color: sage green','Small: 18 in diameter','Medium: 22 in diameter','Large: 26 in diameter'], variants:[{id:'cat-bed-small',options:{Size:'Small'},price:27.99,stock:8},{id:'cat-bed-medium',options:{Size:'Medium'},price:32.99,stock:5},{id:'cat-bed-large',options:{Size:'Large'},price:39.99,stock:2}] },
  'pet-bowl': { species:['Dog','Cat'], type:'Feeding & Water', brand:'Paw Meadow', photo:'pet-bowl', pack:'1 bowl',size:'2 cups', material:'Stainless steel', care:'Wash with warm soapy water after each use; rinse thoroughly.', details:['Capacity: 2 cups','Diameter: 6 in','For food or water'] },
  'dog-toy': { species:['Dog'], type:'Toys', brand:'Trail Tails', photo:'pet-ball', pack:'1 ball',size:'2.5 in',material:'Textured rubber', care:toyCare, details:['Diameter: 2.5 in','For supervised fetch','Not intended as a chew toy'] },
  'cat-food': { species:['Cat'], type:'Food',brand:'Paw Meadow',photo:'cat-food',lifeStage:'Adult',foodForm:'Dry Food',flavor:'Original',pack:'7 lb',size:'7 lb',material:'Dry kibble',care:foodCare,autoship:true,details:['Bag size: 7 lb','Life stage: adult','For indoor cats'] },
  'cat-tree': { species:['Cat'], type:'Beds & Furniture',brand:'Cozy Grove',photo:'cat-tree-two-level',pack:'1 tree',size:'28 in',material:'Sisal-wrapped posts, plush fabric and engineered wood',care:'Vacuum fabric; wipe base with a damp cloth. Check hardware regularly.',details:['Height: 28 in','Two perches, no enclosed cubby','Assembly required'] },
  'dog-leash': { species:['Dog'], type:'Walking',brand:'Trail Tails',photo:'leash',pack:'1 leash',size:'6 ft',material:'Woven nylon with metal clip',care:'Hand wash and air dry. Inspect clip and webbing before every walk.',details:['Length: 6 ft','Width: 1 in','Loop handle'] },
  'bird-feeder': { species:['Pet Bird'],type:'Feeding & Water',brand:'Feather Field',photo:'bird-feeder-green',pack:'1 feeder',size:'Small',material:'Painted wood and removable plastic tray',care:'Remove uneaten food daily. Wash tray and dry fully before refilling.',details:['For small pet birds','Check cage spacing and mounting fit','Dimensions: 6 × 5 × 7 in'] },
}
// Catalog metadata is descriptive fixture content, never veterinary or dietary advice.
const more = [
 ['training-treats','Crunchy training dog treats',9.49,['Dog'],'Treats','Paw Meadow','dog-treats','6 oz','Baked biscuit treats','Reward-sized biscuits for supervised training.',foodCare,{foodForm:'Biscuits',flavor:'Peanut Butter',lifeStage:'Adult',autoship:true,options:{Pack:['6 oz','12 oz']},variants:[['6 oz',9.49,8],['12 oz',16.99,4]]}],
 ['rope-toy','Knotted cotton rope toy',7.49,['Dog'],'Toys','Trail Tails','rope-toy','12 in','Cotton rope','A colorful three-knot rope for interactive tug.',toyCare],
 ['dog-harness','Red padded walking harness',22.99,['Dog'],'Walking','Trail Tails','dog-harness','Small','Nylon webbing and padded mesh','An adjustable red harness for everyday walks.','Hand wash; air dry. Fit to your dog before use.',{options:{Size:['Small','Medium','Large']},variants:[['Small',22.99,5],['Medium',26.99,0],['Large',29.99,3]],details:['Small chest: 16–20 in','Medium chest: 20–26 in','Large chest: 26–32 in','Measure around the widest part of the chest']}],
 ['dog-collar','Adjustable red dog collar',10.99,['Dog'],'Walking','Trail Tails','dog-collar-red','Medium','Nylon webbing, plastic buckle and metal ring','A red everyday collar with a side-release buckle.','Hand wash and air dry. Check fit and hardware before use.',{details:['Neck fit: 14–20 in','Width: 0.75 in','For walking with a compatible leash']}],
 ['dog-crate','Folding wire dog crate',59.99,['Dog'],'Habitats','Cozy Grove','dog-crate-black','30 in','Coated steel wire and plastic tray','A single-door crate with a removable cleaning tray.','Wipe clean and dry; inspect the door latch before use.',{art:art.crate,details:['Dimensions: 30 × 19 × 21 in','Choose a crate that allows your dog to stand and turn','Assembly required']}],
 ['training-pads','Absorbent dog training pads',16.49,['Dog'],'Cleaning','Paw Meadow','training-pads-blue','30 count','Cellulose absorbent core and plastic backing','Disposable pads for a designated indoor training area.','Replace after use; dispose in household trash, never flush.',{art:art.pads,autoship:true,lifeStage:'Puppy',details:['Pack: 30 pads','Pad size: 22 × 22 in']}],
 ['waste-bags','Dog waste bag refill rolls',11.99,['Dog'],'Cleaning','Trail Tails','waste-bags-green','120 count','Plastic film','Refill rolls for everyday walk cleanups.','Store away from heat. Dispose of filled bags in household trash.',{art:art.bags,autoship:true,details:['8 rolls, 15 bags per roll','Unscented','Check roll fit in your dispenser']}],
 ['puzzle-feeder','Slide-and-find dog puzzle feeder',18.99,['Dog'],'Toys','Paw Meadow','puzzle-feeder-teal','10 in','Polypropylene','Sliding compartments add a supervised activity to treat time.','Hand wash removable parts; dry before reassembly.',{art:art.puzzle,details:['Width: 10 in','For dry treats or kibble','Supervise use and remove after play']}],
 ['cooling-mat','Foldable dog cooling mat',24.99,['Dog'],'Beds & Furniture','Cozy Grove','cooling-mat-blue','24 × 36 in','Polyester shell with sealed gel insert','A flat foldable mat for a shaded resting spot.','Wipe clean. Discard if punctured; do not allow chewing.',{art:art.mat,stock:0,details:['Dimensions: 24 × 36 in','Indoor or shaded covered use','No powered components']}],
 ['wet-cat-food','Chicken adult wet cat food',18.49,['Cat'],'Food','Paw Meadow','wet-cat-food','12 × 3 oz','Wet food in cans','An everyday chicken recipe in individual cans.',foodCare,{foodForm:'Wet Food',flavor:'Chicken',lifeStage:'Adult',autoship:true,options:{Pack:['12 × 3 oz','24 × 3 oz']},variants:[['12 × 3 oz',18.49,10],['24 × 3 oz',34.99,6]],details:['Serving size: follow package guidance','Refrigerate opened food according to the label','Photography represents the food format, not exact can count']}],
 ['cat-litter','Unscented clumping cat litter',15.49,['Cat'],'Cleaning','Paw Meadow','cat-litter','14 lb','Clumping clay','Unscented litter for routine litter-box care.','Scoop daily and replace per package instructions; never flush.',{autoship:true,options:{Pack:['14 lb','28 lb']},variants:[['14 lb',15.49,10],['28 lb',27.99,4]],details:['Unscented','Store in a dry place','Wash hands after handling']}],
 ['litter-tray','Teal open litter tray',13.49,['Cat'],'Cleaning','Cozy Grove','litter-tray-teal','18 × 14 in','Polypropylene','An open litter tray with an accessible low entry.','Wash with mild soap and warm water; dry before adding litter.',{details:['Dimensions: 18 × 14 × 5 in','Open top','Color: teal']}],
 ['teaser-wand','Feather teaser cat wand',6.99,['Cat'],'Toys','Trail Tails','cat-teaser-wand','18 in','Plastic handle, cord and feathers','A flexible wand for interactive chase and pounce.',toyCare,{details:['Handle length: 18 in','Put away out of reach after play']}],
 ['scratching-post','Sisal cat scratching post',29.99,['Cat'],'Beds & Furniture','Cozy Grove','scratching-post','24 in','Sisal and engineered wood','A freestanding vertical scratching post on a square base.','Vacuum fibers; tighten hardware regularly.',{details:['Height: 24 in','Base: 14 × 14 in','Assembly required']}],
 ['catnip-mouse','Fabric catnip mouse toy',4.99,['Cat'],'Toys','Trail Tails','catnip-mouse-gray','4 in','Polyester fabric and dried catnip','A small fabric mouse for supervised batting and chasing.',toyCare,{art:art.mouse,details:['Length: 4 in, excluding tail','Contains dried catnip']}],
 ['grooming-glove','Soft cat grooming glove',12.49,['Cat'],'Grooming','Paw Meadow','grooming-glove-gray','One size','Mesh fabric and silicone nubs','A flexible grooming glove for gentle brushing.','Rinse and air dry. Use light strokes; stop if your cat is uncomfortable.',{art:art.glove,details:['Right-hand glove','Adjustable wrist strap']}],
 ['pet-carrier','Gray soft-sided pet carrier',35.99,['Dog','Cat'],'Habitats','Cozy Grove','pet-carrier','17 in','Polyester fabric and mesh','A soft-sided carrier with mesh windows and a removable base.','Spot clean; air dry. Check zippers and seams before travel.',{details:['Dimensions: 17 × 11 × 11 in','Suitable only when your pet fits comfortably','Check travel provider requirements separately']}],
 ['pet-fountain','White circulating pet fountain',32.99,['Dog','Cat'],'Feeding & Water','Paw Meadow','pet-fountain-white','2 L','Plastic reservoir and electric pump','A white fountain with a raised center spout.','Unplug before cleaning; wash the reservoir and rinse pump parts as directed.',{details:['Reservoir capacity: 2 L','Indoor use','Includes pump; replaceable filter sold separately']}],
 ['slicker-brush','Black-handle pet slicker brush',13.99,['Dog','Cat'],'Grooming','Paw Meadow','slicker-brush-black','One size','Steel pins, rubber cushion and plastic handle','A cushioned pin brush for gentle coat care.','Remove loose fur after use; wipe clean. Avoid damaged or sensitive skin.',{details:['Brush head: 4 × 2 in','Use light pressure','For dog and cat coats suitable for pin brushing']}],
 ['pet-shampoo','Everyday pet shampoo',11.49,['Dog','Cat'],'Grooming','Paw Meadow','pet-shampoo-blue','16 fl oz','Liquid grooming shampoo','A simple rinse-out grooming shampoo for dogs and cats.','Follow the package directions; avoid eyes and rinse thoroughly.',{autoship:true,details:['Bottle size: 16 fl oz','Check label ingredients for your pet','No medicinal claims or treatment use']}],
 ['bird-seed','Small pet bird seed blend',12.99,['Pet Bird'],'Food','Feather Field','bird-seed','3 lb','Mixed seeds','A seed blend for compatible small pet birds.',foodCare,{autoship:true,foodForm:'Seed',flavor:'Seed Blend',details:['Bag size: 3 lb','Check package species suitability','Use as part of the feeding routine on the label']}],
 ['bird-perch','Natural wood bird perch',8.49,['Pet Bird'],'Habitats','Feather Field','bird-perch-wood','10 in','Natural wood and metal mount','A cage-mounted wood perch for small pet birds.','Wipe clean and dry; check mounting hardware and wear regularly.',{art:art.perch,details:['Length: 10 in','Diameter varies: about 0.5–0.75 in','Check foot fit and cage compatibility']}],
 ['bird-foraging-toy','Hanging bird foraging toy',10.49,['Pet Bird'],'Toys','Feather Field','bird-foraging-toy','9 in','Untreated wood blocks and paper','A hanging wood-and-paper activity toy for small pet birds.',toyCare,{art:art.foraging,details:['Length: 9 in','Inspect hanging hardware regularly']}],
 ['aquarium','Black-trim glass aquarium',49.99,['Fish'],'Habitats','Blue Current','aquarium-black','10 gal','Glass with plastic trim and lid','An empty glass aquarium for a carefully planned fish setup.','Use aquarium-safe cleaning methods. Never use household soap inside the tank.',{details:['Capacity: 10 US gallons','Tank and lid only; equipment sold separately','Choose stocking and equipment to suit the species']}],
 ['fish-flakes','Tropical fish food flakes',5.99,['Fish'],'Food','Blue Current','fish-flakes-jar','1 oz','Dry fish food flakes','Flake food for compatible tropical aquarium fish.',foodCare,{art:art.flakes,foodForm:'Flakes',flavor:'Original',autoship:true,details:['Container: 1 oz','Check species suitability and feeding amounts on the package']}],
 ['aquarium-filter','Hang-on aquarium filter',24.49,['Fish'],'Aquarium Care','Blue Current','aquarium-filter-black','10–20 gal','Plastic housing and electric pump','A hang-on filter for compatible freshwater tank setups.','Disconnect power before maintenance. Clean according to the included instructions.',{art:art.filter,details:['For 10–20 gallon tanks','Check tank rim clearance before purchase','Media and pump included']}],
 ['aquarium-net','Fine mesh aquarium net',4.49,['Fish'],'Aquarium Care','Blue Current','aquarium-net-green','4 in','Nylon mesh and coated metal handle','A small fine mesh net for aquarium maintenance.','Rinse with aquarium-safe water and air dry; keep separate from household tools.',{art:art.net,details:['Net width: 4 in','Handle length: 10 in']}],
 ['timothy-hay','Timothy hay for rabbits',16.99,['Small Pet'],'Food','Little Burrow','timothy-hay-bag','40 oz','Dried timothy grass hay','Bagged timothy hay for adult rabbits.',foodCare,{art:art.hay,animal:'Rabbit',lifeStage:'Adult',foodForm:'Hay',flavor:'Timothy',autoship:true,options:{Pack:['40 oz','80 oz']},variants:[['40 oz',16.99,8],['80 oz',29.99,4]]}],
 ['rabbit-pellets','Adult rabbit food pellets',13.49,['Small Pet'],'Food','Little Burrow','rabbit-pellets-bag','4 lb','Dry pellets','Pelleted food labeled for adult rabbits.',foodCare,{art:art.bag,animal:'Rabbit',lifeStage:'Adult',foodForm:'Pellets',flavor:'Original',autoship:true}],
 ['paper-bedding','Unscented small-pet paper bedding',18.99,['Small Pet'],'Bedding','Little Burrow','paper-bedding-white','30 L','Paper fibers','Soft paper bedding for compatible small-pet habitats.','Remove soiled bedding regularly; follow species-specific habitat guidance.',{art:art.bag,animal:'Hamster',autoship:true,details:['Volume: 30 L','Unscented','Check package suitability for your animal']}],
 ['hamster-habitat','Compact hamster activity habitat',44.99,['Small Pet'],'Habitats','Little Burrow','small-pet-habitat','24 in','Wire top, plastic base and wood accessories','A compact hamster activity enclosure with a wheel and hide.','Wash removable surfaces and dry fully. Inspect wire spacing and latches.',{animal:'Hamster',details:['Dimensions: 24 × 16 × 15 in','For supervised activity; not a complete permanent home','Not suitable for rabbits or guinea pigs']}],
 ['terrarium','Front-opening glass terrarium',89.99,['Reptile'],'Habitats','Desert Den','terrarium-glass','18 in','Glass with ventilated mesh top','A front-opening enclosure for a species-specific reptile setup.','Clean using reptile-safe methods; inspect door locks and ventilation.',{art:art.terrarium,details:['Dimensions: 18 × 18 × 18 in','Empty enclosure; equipment sold separately','Check adult animal size and habitat requirements']}],
 ['reptile-hide','Rock-style reptile hide',14.99,['Reptile'],'Habitats','Desert Den','reptile-hide-gray','8 in','Molded resin','A sheltered hide with a rounded entry.','Wash with reptile-safe cleaning products, rinse and dry.',{art:art.hide,details:['Dimensions: 8 × 6 × 4 in','Entry: 3 × 3 in','Check fit and avoid trapping risk']}],
 ['heat-lamp','Reptile heat-lamp fixture',21.99,['Reptile'],'Heating','Desert Den','heat-lamp-black','5.5 in','Metal reflector and ceramic socket','A reflector fixture for a compatible reptile heat bulb.','Disconnect before handling. Follow fixture, bulb and habitat instructions.',{art:art.lamp,details:['Reflector diameter: 5.5 in','Bulb and thermostat sold separately','Rated maximum: 75 W; check bulb compatibility','Use appropriate temperature monitoring and safe mounting']}],
 ['horse-grooming-mitt','Horse grooming mitt',9.99,['Horse'],'Grooming','Barn & Pasture','horse-mitt-blue','One size','Flexible rubber','A textured mitt for routine horse coat grooming.','Rinse and dry after use. Use gentle strokes and avoid irritated areas.',{art:art.mitt,details:['One adult hand size','Textured palm']}],
 ['chicken-feed','Adult layer chicken feed',25.99,['Chicken'],'Food','Barn & Pasture','chicken-feed-pellets','25 lb','Dry feed pellets','Bagged layer feed labeled for adult laying hens.',foodCare,{art:art.bag,foodForm:'Pellets',flavor:'Original',lifeStage:'Adult',autoship:true,details:['Bag size: 25 lb','For adult laying hens; not chick starter','Follow package feeding and storage guidance']}],
]
function normalize(p, i) {
  return { stock:10, available:true, lifeStage:'All Life Stages', foodForm:'Not Food', flavor:'Not Flavored', autoship:false, cadenceWeeks:[2,4,6,8], dietTags:[], options:{}, details:[], rating:Number((4.2 + (i % 7)/10).toFixed(1)), reviews:17+i*11, badge:i%8===0?'New':'', ...p, family:p.id, category:p.category || (p.species.length>1?'Pet supplies':['Dog','Cat'].includes(p.species[0])?p.species[0]:'Other Animals'), introduced:i }
}
export const products = [
 ...original.map((p,i)=>normalize({...p,...baseline[p.id]},i)),
 ...more.map(([id,title,price,species,type,brand,photo,size,material,description,care,extra={}],i)=>{
   const data={id,title,price,species,type,brand,photo,size,pack:size,material,description,detail:description,care,color:'#81969c',art:art.bag,keywords:[species.join(' '),type,brand,extra.animal||'',extra.foodForm||''].join(' '),...extra}
   if (Array.isArray(extra.variants)) { const label=Object.keys(extra.options)[0]; data.variants=extra.variants.map(([value,price,stock])=>({id:id+'-'+slugify(value),options:{[label]:value},price,stock})) }
   return normalize(data,i+8)
 }),
 ...petAssortment().map((p, i) => normalize(p, i + 44)),
]
export const collections = {
 'playtime-picks':{title:'A little more play, every day',description:'Fetch, chase, tug and forage. Find a supervised activity for your pet.',ids:products.filter(p=>p.type==='Toys').map(p=>p.id)},
 'daily-essentials':{title:'Everyday essentials, all together',description:'Food, litter and care supplies to keep the routine running.',ids:products.filter(p=>p.autoship).map(p=>p.id)},
 'cozy-corners':{title:'Their very own cozy corner',description:'Resting spots, scratching surfaces and practical carriers.',ids:products.filter(p=>p.type==='Beds & Furniture'||p.id==='pet-carrier').map(p=>p.id)},
 'small-worlds':{title:'Big care for small companions',description:'Thoughtful setup supplies for fish, hamsters, rabbits and reptiles. Always check the intended species.',ids:products.filter(p=>p.species.some(s=>['Fish','Small Pet','Reptile'].includes(s))).map(p=>p.id)},
}

// No legacy authored item has verified purchase evidence in reference mode.
applyCatalogPolicy('chewy', products, {})
