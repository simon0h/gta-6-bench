// Authored synthetic pet ranges. Species, ingredients, construction and function
// define base products; pack sizes and colors are never counted as extra listings.
const slug = value => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const foodCare = 'Follow the package feeding instructions and species suitability. Keep fresh water available; store sealed in a cool, dry place. Treats are supplemental, not a complete diet.'
const shapes = {
  bag:'M43 20h74l-6 17 8 67H41l8-67z M56 50h48v30H56z',
  can:'M44 32q36-16 72 0v62q-36 16-72 0z M44 32q36 16 72 0M44 84q36 16 72 0',
  bowl:'M30 44h100l-13 52H43z M30 44q50-20 100 0q-50 20-100 0',
  mat:'M22 42l101-11 18 57-105 14z M47 41l13 56M73 37l13 56M99 34l13 56',
  bed:'M25 73q0-35 55-35t55 35v20H25z M40 69q40-24 80 0v13H40z',
  brush:'M44 29h69v35H44z M71 64h16v44H71z M51 21v8m12-8v8m13-8v8m13-8v8m13-8v8',
  rope:'M47 30q20-21 33 0l30 57q12 24-9 23L47 52q-14-11 0-22',
  toy:'M44 63a36 36 0 1 0 72 0a36 36 0 1 0-72 0 M47 55h66M70 30v66M90 30v66',
  hide:'M24 100q0-61 53-65 58 1 59 65H98V80q-20-28-34 0v20z',
  perch:'M25 58l110-18 3 11L28 72z M33 45v37m91-53v37',
  crate:'M25 30h110v73H25z M29 50h102M29 73h102M47 31v68M80 31v68M111 31v68',
  bottle:'M55 36h50v67H55z M68 19h24v17H68z M64 12h42v9H64z',
  net:'M26 30h57v43H26z M29 33l50 37M79 33L30 70M79 68l55 32',
  filter:'M45 32h65v71H45z M54 42h47v32H54z M67 20h24v12H67z',
  lamp:'M39 70q0-48 42-48t42 48z M74 70h16v18H74z M81 22V9h45v80h-10',
  scoop:'M36 21h50v51H36z M47 29v32m14-32v32m14-32v32M76 69l44 35 9-11-43-34',
  comb:'M32 32h95v18H32z M39 50v51h6V50m10 0v51h6V50m10 0v51h6V50m10 0v51h6V50m10 0v51h6V50',
  fish:'M26 64q33-43 82-9l24-21v62l-24-21Q59 111 26 64z M51 61h6v6h-6z',
  ring:'M80 22a41 41 0 1 0 0 82a41 41 0 1 0 0-82 M80 44a19 19 0 1 1 0 38a19 19 0 1 1 0-38',
  disc:'M23 64q57-44 114 0q-57 42-114 0 M41 63q39-25 78 0q-39 26-78 0',
  tunnel:'M25 48q40-37 102-14v53q-44-19-90 15z M27 49q41-7 13 51M107 36q-25 24 16 48',
}
export function petAssortment() {
  const rows=[]
  const add=(title,pet,type,brand,price,size,material,description,shape,extra={})=>rows.push({id:slug(title),title,species:[pet],type,brand,price:Number(price.toFixed(2)),size,pack:size,material,description,detail:description,photo:null,art:shapes[shape],color:'#91a99a',care:'Inspect before use. Clean according to the material instructions and allow to dry. Check the intended animal and product dimensions before purchase.',keywords:`${pet} ${type} ${brand} ${title} ${material}`,details:[`Intended pet: ${pet}`,`Construction / contents: ${material}`,`Size / pack: ${size}`],...extra})
  const meals = (pet,brand,recipes,formats) => {
    for(const recipe of recipes) for(const [form,foodForm,type,pack,price,shape] of formats) {
      const [name,flavor,animal=pet,ingredients=name] = recipe
      add(`${animal} ${name.toLowerCase()} ${form}`,pet,type,brand,price,pack,ingredients,`${form[0].toUpperCase()+form.slice(1)} with ${ingredients.toLowerCase()}, labeled for ${animal.toLowerCase()}. Check the package for the complete formula and feeding amounts.`,shape,{foodForm,flavor,animal,lifeStage:'Adult',autoship:true,care:foodCare,details:[`Intended animal: adult ${animal.toLowerCase()}`,`Formula: ${ingredients}`,`Pack: ${pack}`,type==='Treats'?'Supplemental treat; not a complete meal.':'Follow the exact package feeding instructions.']})
    }
  }
  const proteins=[['Chicken & brown rice','Chicken'],['Salmon & oat','Salmon'],['Turkey & pumpkin','Turkey'],['Lamb & barley','Lamb'],['Duck & sweet potato','Duck'],['Whitefish & pea','Whitefish']]
  meals('Dog','Paw Meadow',proteins,[['dry kibble','Dry Food','Food','10 lb',32.99,'bag'],['wet pate','Wet Food','Food','6 × 12 oz',24.99,'can'],['stew in gravy','Wet Food','Food','6 × 12 oz',27.99,'can'],['baked reward bites','Biscuits','Treats','8 oz',9.99,'bag']])
  meals('Cat','Paw Meadow',proteins,[['dry kibble','Dry Food','Food','5 lb',25.99,'bag'],['wet pate','Wet Food','Food','12 × 3 oz',21.99,'can'],['shredded wet food','Wet Food','Food','12 × 3 oz',23.99,'can'],['freeze-dried treats','Freeze-Dried','Treats','2 oz',10.99,'bag']])
  meals('Pet Bird','Feather Field',[
    ['Canary seed & millet','Millet','Budgie'],['Millet & oat','Oat','Cockatiel'],['Canary seed & flax','Flax','Canary'],['Panicum & millet','Millet','Finch'],['Millet & safflower','Safflower','Lovebird'],['Oat & buckwheat','Buckwheat','Conure'],
  ],[['seed blend','Seed','Food','2 lb',11.99,'bag'],['crumbled food','Crumbles','Food','2 lb',14.99,'bag'],['baked foraging bites','Biscuits','Treats','4 oz',6.99,'bag']])
  meals('Fish','Blue Current',[
    ['Spirulina & kelp','Algae','Goldfish'],['Krill & algae','Krill','Community tropical fish'],['Insect & shrimp','Insect','Betta'],['Shrimp & kelp','Shrimp','Marine fish'],['Algae & pea','Algae','Herbivorous cichlid'],['Kelp & zucchini','Algae','Bottom-feeding fish'],
  ],[['food pellets','Pellets','Food','3 oz',8.99,'can'],['food flakes','Flakes','Food','2 oz',7.99,'can'],['supplemental crumbles','Crumbles','Treats','1 oz',6.99,'can']])
  meals('Small Pet','Little Burrow',[
    ['Timothy & parsley','Timothy','Rabbit'],['Timothy & bell pepper','Timothy','Guinea pig'],['Oat & millet','Oat','Hamster'],['Millet & barley','Millet','Gerbil'],['Timothy & rosehip','Timothy','Chinchilla'],['Oat & pea','Oat','Rat'],
  ],[['food pellets','Pellets','Food','3 lb',14.99,'bag'],['foraging food blend','Forage','Food','2 lb',12.99,'bag'],['baked reward pieces','Biscuits','Treats','4 oz',6.99,'bag']])
  // Each reptile diet names its target animal; no generic all-reptile food.
  for(const [animal,recipe,foodForm,shape] of [['Bearded dragon','Insect & vegetable','Pellets','bag'],['Aquatic turtle','Shrimp & fish','Pellets','bag'],['Tortoise','Grass & leaf','Pellets','bag'],['Crested gecko','Fruit & insect','Powder','can'],['Blue-tongued skink','Insect & vegetable','Wet Food','can'],['Uromastyx','Leaf & flower','Forage','bag']]) {
    meals('Reptile','Desert Den',[[recipe,recipe,animal]],[[foodForm==='Powder'?'mix-with-water meal powder':'prepared food',foodForm,'Food','8 oz',13.99,shape],['supplemental food bites',foodForm,'Treats','3 oz',7.99,shape]])
  }
  meals('Horse','Barn & Pasture',[[ 'Alfalfa & oat','Alfalfa'],['Timothy & barley','Timothy'],['Beet pulp & oat','Beet Pulp'],['Rice bran & flax','Rice Bran'],['Orchard grass & oat','Orchard Grass'],['Alfalfa & beet pulp','Alfalfa']], [['feed pellets','Pellets','Food','20 lb',29.99,'bag'],['baked reward treats','Biscuits','Treats','2 lb',12.99,'bag']])
  meals('Chicken','Barn & Pasture',[['Corn & wheat','Corn'],['Oat & barley','Oat'],['Millet & sorghum','Millet'],['Wheat & pea','Wheat'],['Barley & flax','Barley'],['Corn & sunflower','Sunflower']], [['adult layer pellets','Pellets','Food','20 lb',23.99,'bag'],['scratch grain treat blend','Seed','Treats','5 lb',10.99,'bag']])
  const group=(pet,type,brand,shape,size,price,names,material,care,extra={})=>{
    for(const [i,name]of names.split('|').entries()) add(`${pet} ${name}`,pet,type,brand,price+i,size,`${material}; ${name}`,`${name[0].toUpperCase()+name.slice(1)} for ${pet.toLowerCase()} routines. ${size} supplied.`,/brush|broom/.test(name)?'brush':/comb|rake/.test(name)?'comb':/cloth|towel|mat|pad|liner|panel/.test(name)?'mat':/tunnel|tube/.test(name)?'tunnel':/ring/.test(name)?'ring':/disc/.test(name)?'disc':/catnip fish/.test(name)?'fish':/net|hay bag|hay pouch|basket/.test(name)?'net':/water bottle/.test(name)?'bottle':shape,{care,...extra})
  }
  const play='Supervise play and remove after use. Inspect for loose or damaged parts; replace when worn. Choose a size that cannot be swallowed.'
  const clean='Wash with mild soap and warm water, rinse well and dry fully. Inspect surfaces and seams before reuse.'
  const groom='Use gentle strokes and stop if the animal is uncomfortable. Keep clean and dry; avoid eyes and irritated skin.'
  const fit='Check the listed dimensions and fit before use. Inspect fasteners and stitching each time; hand wash and air dry.'
  // 66 dog supplies: construction and function distinguish these products.
  group('Dog','Toys','Trail Tails','toy','1 toy',8.99,'rubber treat ball|rubber hollow cone|rubber ridged ring|rubber flying disc|rubber bounce cube|rubber rolling drum|rubber treat tumbler|rubber wobble egg|rubber knotted tug|rubber fetch stick|rubber lattice ball|rubber floating bumper','Molded natural rubber',play)
  group('Dog','Toys','Trail Tails','rope','1 toy',7.99,'cotton loop tug|cotton rope octopus|cotton braided ring|cotton knotted bone|cotton rope tennis tug|cotton tassel tug','Cotton rope',play)
  group('Dog','Feeding & Water','Paw Meadow','bowl','2 cup capacity',12.99,'ceramic shallow dish|ceramic raised bowl|steel slow-feed bowl|steel travel dish|silicone folding bowl|silicone lick tray|polymer maze feeder|polymer divided bowl|stoneware water crock|steel hanging bowl|silicone splash bowl|polymer gravity food tray','Food-contact bowl materials as named',clean)
  group('Dog','Walking','Trail Tails','rope','6 ft',18.99,'biothane clip leash|woven rope slip lead|cotton webbing leash|reflective tape leash|bungee running leash|double-handle nylon leash|padded traffic lead|braided leather leash|dual dog coupler|carabiner hiking leash|waist running lead|waterproof training line','Webbing, cord or strap as named with metal fittings',fit)
  group('Dog','Grooming','Paw Meadow','brush','1 grooming tool',11.99,'rubber curry brush|boar bristle brush|steel grooming comb|rounded-pin coat rake|silicone bath brush|microfiber drying mitt|wood pin brush|double-row detangling comb|flexible palm brush|soft face brush|rubber shedding blade|cotton grooming towel','Grooming tool materials as named',groom)
  group('Dog','Beds & Furniture','Cozy Grove','bed','30 × 24 in',39.99,'cotton canvas cushion|polyester bolster bed|woven fleece sleep mat|quilted crate pad|mesh elevated cot|sherpa lounge cushion|cotton covered foam mattress|water-resistant outdoor pad|corduroy nest bed|denim floor cushion|felt folding rest mat|removable-cover sofa bed','Textile shell and support construction as named',clean)
  // 66 cat supplies.
  group('Cat','Toys','Trail Tails','toy','1 toy',5.99,'felt wool ball|sisal chase ball|cork rolling ball|crinkle paper ball|cotton catnip fish|canvas catnip bird|knit catnip carrot|plush silvervine pillow|rattan chase ball|cardboard rolling drum|sisal spinning wheel|wood rolling cylinder','Supervised play materials as named',play)
  group('Cat','Toys','Trail Tails','rope','18 in handle',7.99,'ribbon chase wand|felt flutter wand|cotton tassel wand|paper streamer wand|plush caterpillar wand|sisal tassel wand','Reusable wand with named attachment',play)
  group('Cat','Feeding & Water','Paw Meadow','bowl','1 cup capacity',10.99,'ceramic whisker dish|steel shallow saucer|silicone lick plate|porcelain raised dish|stoneware water bowl|glass feeding dish|bamboo stand double bowl|steel hanging dish|polymer slow-feed saucer|ceramic divided dish|silicone travel bowl|polymer water reservoir','Food-contact materials as named',clean)
  group('Cat','Beds & Furniture','Cozy Grove','bed','20 × 16 in',29.99,'felt cave bed|canvas hammock bed|sherpa donut bed|cotton quilted cushion|wicker basket cushion|fleece window rest pad|corduroy sleep cube|mesh hanging lounge|linen bolster cushion|plush covered nest|cotton reversible mat|woven wool rest pad','Resting textile and construction as named',clean)
  group('Cat','Beds & Furniture','Cozy Grove','mat','18 × 10 in',15.99,'corrugated wave scratcher|sisal flat scratch mat|cork scratch board|cardboard ramp scratcher|sisal corner scratch board|jute hanging scratch panel|cardboard lounge scratcher|woven seagrass scratch mat|sisal door scratch panel|corrugated tunnel scratcher|wood-frame refill scratcher|jute floor scratch pad','Scratching surface as named', 'Vacuum debris; inspect fasteners and replace worn surfaces.')
  group('Cat','Grooming','Paw Meadow','brush','1 grooming tool',9.99,'soft bristle brush|steel wide-tooth comb|silicone palm brush|rounded pin brush|rubber curry brush|cotton grooming mitt','Grooming tool materials as named',groom)
  group('Cat','Cleaning','Cozy Grove','scoop','1 cleaning tool',8.99,'steel litter scoop|polymer slotted scoop|silicone litter mat|mesh litter catcher|covered waste pail|corner litter dustpan','Reusable cleaning construction as named',clean)
  // 32 bird supplies.
  group('Pet Bird','Habitats','Feather Field','perch','10 in',9.99,'manzanita branch perch|grapevine branch perch|dragonwood branch perch|cork bark ledge|woven seagrass platform|cotton rope perch|wood corner platform|natural wood ladder','Untreated named material with cage mounting hardware','Clean and dry; inspect mounting hardware and choose a diameter appropriate for the bird.')
  group('Pet Bird','Toys','Feather Field','rope','1 hanging toy',7.99,'palm leaf shred bundle|balsa foraging blocks|paper rope tassel|seagrass forage pouch|cork foraging cups|vine sphere cluster|cardboard shred stack|wood bead ladder','Untreated play material as named',play)
  group('Pet Bird','Feeding & Water','Feather Field','bowl','1 feeder',10.99,'steel cage food cup|ceramic water crock|glass seed dish|polymer covered seed cup|steel hanging water bowl|acrylic forage tray|porcelain treat dish|polymer splash bath','Feeding and bathing construction as named',clean)
  group('Pet Bird','Cleaning','Feather Field','scoop','1 cleaning tool',6.99,'cage corner brush|perch scrub brush|seed tray scraper|cage floor squeegee','Reusable cleaning material',clean)
  group('Pet Bird','Bedding','Feather Field','bag','30 count',10.99,'unprinted paper cage liners|absorbent cellulose tray pads|corrugated cage floor sheets|plain kraft tray liners','Unscented paper or cellulose as named','Replace soiled liners daily. Keep loose fibers away from food and water.',{autoship:true})
  // 32 aquarium supplies.
  group('Fish','Aquarium Care','Blue Current','filter','1 filter accessory',9.99,'sponge prefilter sleeve|ceramic media rings|fine filter floss|coarse filter sponge|activated carbon pouch|mesh media bag|biological filter blocks|zeolite media pouch','Named freshwater aquarium filter medium','Rinse and maintain according to the aquarium and filter instructions. Check dimensions and compatibility.',{autoship:true})
  group('Fish','Aquarium Care','Blue Current','net','1 maintenance tool',7.99,'fine mesh shrimp net|soft mesh fish net|telescopic debris net|algae cleaning pad|glass algae scraper|gravel siphon hose|aquascaping tweezers|plant trimming scissors|substrate leveling rake|suction-cup hose holder|aquarium bucket clip|feeding ring','Aquarium maintenance construction as named','Use aquarium-safe cleaning methods without household soap. Rinse and dry after use.')
  group('Fish','Habitats','Blue Current','hide','1 aquarium ornament',14.99,'ceramic breeding cave|resin rock arch|terracotta shelter tube|slate hiding ledge|ceramic shrimp tunnel|resin driftwood shelter|stone bridge ornament|ceramic planting cup','Aquarium-safe named material','Rinse thoroughly using aquarium-safe methods. Check openings and edges before placement.')
  group('Fish','Feeding & Water','Blue Current','bowl','1 feeding accessory',6.99,'glass shrimp feeding dish|acrylic feeding tube|silicone food holder|suction-cup vegetable clip','Aquarium feeding material as named','Rinse before use. Remove uneaten food according to your feeding routine.')
  // 38 small-pet supplies; intended animal metadata is explicit.
  group('Small Pet','Habitats','Little Burrow','hide','12 × 8 × 7 in',16.99,'rabbit wood shelter|rabbit seagrass hide|guinea pig fleece hide|guinea pig willow tunnel|chinchilla wood ledge|chinchilla ceramic hide|hamster cork tunnel|hamster ceramic burrow|gerbil wood chamber|gerbil cardboard tunnel|rat fleece hammock|rat rope climbing ladder','Species-specific habitat accessory as named','Inspect materials and mounting. Verify suitability and dimensions for your individual animal; these accessories are not complete habitats.')
  group('Small Pet','Toys','Little Burrow','toy','1 toy',5.99,'rabbit willow ball|rabbit applewood bundle|guinea pig hay ring|guinea pig seagrass ball|chinchilla pumice block|chinchilla wood chews|hamster forage wheel|hamster cardboard maze|gerbil grass ball|gerbil paper dig box|rat wood puzzle|rat cotton rope knot','Untreated species-specific activity material',play)
  group('Small Pet','Feeding & Water','Little Burrow','bowl','1 feeder',8.99,'rabbit ceramic crock|rabbit steel hay rack|guinea pig hay pouch|guinea pig water bottle|chinchilla steel food cup|hamster shallow food dish|gerbil glass water bottle|rat clip-on food bowl','Species-specific feeding construction as named',clean)
  group('Small Pet','Bedding','Little Burrow','bag','20 L',14.99,'unscented paper flake bedding|unscented cellulose pellet bedding|aspen shaving bedding|hemp fiber bedding|unbleached paper strip bedding|paper pulp nest bedding','Unscented bedding material as named','Check suitability for the animal. Remove damp or soiled bedding daily and replace according to the package.',{autoship:true})
  // 33 reptile supplies.
  group('Reptile','Habitats','Desert Den','hide','1 enclosure accessory',13.99,'cork bark hide|resin cave shelter|slate basking ledge|terracotta shelter tube|ceramic humid hide|wood climbing branch|cork climbing panel|resin feeding ledge|sandstone cave|woven climbing hammock|polymer dig box|natural bark tunnel','Species-specific enclosure construction as named','Verify fit, temperature, humidity and species requirements before installation. Clean using reptile-safe methods.')
  group('Reptile','Feeding & Water','Desert Den','bowl','1 feeder',8.99,'ceramic shallow water dish|resin corner water bowl|steel insect feeding cup|glass escape-resistant dish|suction feeding ledge|polymer soaking tray|silicone salad plate|ceramic gecko food cup','Feeding construction as named','Wash and rinse between uses; check water depth and access for the animal.')
  group('Reptile','Heating','Desert Den','lamp','1 accessory',17.99,'ceramic-socket lamp fixture|wire bulb safety guard|adjustable lamp stand|reflector clamp bracket|heat-resistant fixture hanger','Heat-equipment accessory; no bulb or thermostat included','Use only within the included electrical and heat ratings. Check fit, safe clearances and species requirements; monitor enclosure temperatures.')
  group('Reptile','Bedding','Desert Den','bag','8 L',12.99,'coconut husk chips|coconut coir fiber|aspen chip substrate|paper pellet substrate','Named terrarium substrate','Choose substrate suitable for the animal and humidity plan. Replace soiled material; follow package directions.',{autoship:true})
  group('Reptile','Cleaning','Desert Den','scoop','1 tool',8.99,'substrate sifting scoop|terrarium corner brush|glass cleaning pad|reptile water dish brush','Reusable enclosure cleaning tool','Keep separate from household cleaning supplies. Use reptile-safe methods and wash hands after cleaning.')
  // 28 horse supplies.
  group('Horse','Grooming','Barn & Pasture','brush','1 grooming tool',12.99,'rubber curry comb|soft body brush|stiff dandy brush|mane detangling comb|tail detangling brush|hoof cleaning pick|mane pulling comb|sweat scraper|rubber massage mitt|face finishing brush|coat shedding blade|microfiber grooming cloth','Horse grooming material as named',groom)
  group('Horse','Feeding & Water','Barn & Pasture','bowl','1 feeding accessory',19.99,'rubber feed pan|steel hanging bucket|polymer corner feeder|woven slow-feed hay bag|rope hay net|rubber ground water tub|clip-on feed scoop|polymer salt-block holder','Stable feeding construction as named','Clean regularly and inspect hanging hardware; use a safe mounting height and feeding arrangement.')
  group('Horse','Walking','Barn & Pasture','rope','8 ft',21.99,'cotton lead rope|braided nylon lead|polypropylene training lead|leather chain-free lead','Named lead material with metal clip',fit)
  group('Horse','Cleaning','Barn & Pasture','scoop','1 stable tool',18.99,'manure scoop|stable corner broom|rubber floor squeegee|bucket scrub brush','Reusable stable-cleaning material','Clean after use and store away from animals.')
  // 23 chicken supplies.
  group('Chicken','Feeding & Water','Barn & Pasture','bowl','1 feeder',17.99,'galvanized feed trough|polymer hanging feeder|steel treadle feeder|rubber feed pan|gravity waterer|nipple water bucket|ceramic grit dish|hanging vegetable basket','Poultry feeding construction as named','Wash regularly and remove stale feed; check access and mounting for your flock.')
  group('Chicken','Habitats','Barn & Pasture','crate','1 coop accessory',21.99,'wood roost bar|polymer nest box|woven nest basket|wood coop ramp|wire coop divider|rubber nest liner','Coop construction as named','Secure before use and inspect for sharp edges. Accessories do not constitute a complete predator-resistant coop.')
  group('Chicken','Bedding','Barn & Pasture','bag','20 L',13.99,'chopped straw bedding|hemp coop bedding|aspen coop shavings|paper nest bedding|coconut nest fiber','Named dry coop bedding material','Keep bedding dry, ventilate the coop and replace soiled material regularly.',{autoship:true})
  group('Chicken','Cleaning','Barn & Pasture','scoop','1 coop tool',11.99,'coop litter scoop|roost scraper|nest box brush|waterer cleaning brush','Reusable coop-cleaning material','Clean after use and wash hands; store tools away from feed.')
  // Species-specific names remain searchable and are also shown in PDP metadata.
  for(const row of rows) if(row.species[0]==='Small Pet'&&!row.animal) row.animal=['rabbit','guinea pig','chinchilla','hamster','gerbil','rat'].find(a=>row.title.toLowerCase().includes(a))||'Compatible small pets; check package'
  rows.find(row=>row.id==='fish-mesh-media-bag').autoship=false
  if(rows.length!==456) throw new Error(`Pet assortment must add 456 base listings; received ${rows.length}`)
  return rows
}
