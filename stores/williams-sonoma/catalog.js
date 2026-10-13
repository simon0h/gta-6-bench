import { applyCatalogPolicy } from '../../lib/catalog-policy.js'
import { originalProducts } from './original-products.js'
import { kitchenRangeProducts } from './catalog-ranges.js'

export const slugify = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
export const departments = [
  { name: 'Cookware', label: 'Cookware', guide: 'Choose a shape for the way you cook. Stainless steel handles high-heat searing, while enameled cast iron holds steady heat for slow braises.', photo: 'dutch-oven' },
  { name: 'Tools', label: 'Cooks’ Tools', guide: 'Prepare with purpose: wood for gentle stirring, steel for measuring and straining, and a sturdy board for everyday prep.', photo: 'wood-utensils-three' },
  { name: 'Cutlery', label: 'Cutlery', guide: 'A chef’s knife starts the collection. Add a small paring blade for detail work and a serrated bread knife for crisp crusts.', photo: 'chef-knife' },
  { name: 'Electrics', label: 'Electrics', guide: 'Build a countertop around your routine. Match bowl capacity to your recipes and leave space around motorized appliances.', photo: 'espresso-machine' },
  { name: 'Bakeware', label: 'Bakeware', guide: 'Metal brings crisp edges; stoneware goes from oven to table. Measure your oven before choosing larger pans.', photo: 'baking-dish-cream' },
  { name: 'Tabletop', label: 'Tabletop & Bar', guide: 'Layer simple white dinnerware with soft linen, clear glasses and comfortable flatware for a table that works every day.', photo: 'dinner-plates-white' },
  { name: 'Food & Home', label: 'Food & Home', guide: 'Keep the daily rituals close: a good cup of coffee, olive oil for finishing, and absorbent towels by the sink.', photo: 'olive-oil' },
].map(d => ({ ...d, slug: slugify(d.name) }))

// Collection-house names are local catalog fixtures, not claims of live manufacturer inventory.
export const brands = ['Williams Sonoma', 'Open Kitchen', 'Heritage Kitchen', 'Countertop Studio', 'Pantry & Table'].map(name => ({ name, slug: slugify(name) }))
const shapes = {
  pan: 'M29 53Q80 32 119 53L107 88Q75 101 42 88Z M117 52L149 30L153 37L120 62Z',
  saucepan: 'M36 46H104V90Q70 108 36 90Z M103 49L149 33L152 40L104 59Z M33 45Q68 30 108 45Z M60 31H81V38H60Z',
  pot: 'M37 42H123V97Q79 109 37 97Z M32 42Q80 21 128 42Z M70 26H88V32H70Z M25 53H36V71H25Z M124 53H137V71H124Z',
  saute: 'M30 55H116V87Q72 101 30 87Z M115 57L151 42L154 49L116 65Z M30 52Q72 38 116 52Z M65 39H80V46H65Z',
  grill: 'M29 47H119V92H29Z M120 51L149 27L154 32L121 62Z M42 53V85 M55 53V85 M68 53V85 M81 53V85 M94 53V85 M107 53V85',
  roast: 'M29 45H130L123 94H36Z M18 48H28V69H18Z M131 48H143V69H131Z M41 55H119V82H41Z',
  wok: 'M28 48Q80 34 133 48Q116 99 81 99Q44 99 28 48Z M131 49L151 28L156 34L135 60Z',
  thermometer: 'M40 28Q40 18 52 18H80Q92 18 92 28V63Q92 73 80 73H52Q40 73 40 63Z M50 31H82V51H50Z M63 74H69V112H63Z',
  paring: 'M24 56L85 44V64L24 56Z M86 43H135V65H86Z',
  bread: 'M20 48H98V69L91 65L84 69L77 65L70 69L63 65L56 69L49 65L42 69L35 65L28 69L20 65Z M100 47H146V70H100Z',
  santoku: 'M20 43H99V78H53Q28 71 20 43Z M100 43H144V67H100Z M39 60H42 M52 60H55 M65 60H68 M78 60H81',
  honing: 'M18 53H106V61H18Z M106 45H115V69H106Z M116 48H146V66H116Z',
  sheet: 'M20 40H140L131 96H29Z M29 48H130L123 87H37Z',
  muffin: 'M18 30H142L132 98H28Z M40 43a10 7 0 1 0 1 0 M73 43a10 7 0 1 0 1 0 M106 43a10 7 0 1 0 1 0 M43 72a10 7 0 1 0 1 0 M74 72a10 7 0 1 0 1 0 M105 72a10 7 0 1 0 1 0',
  pie: 'M23 51Q80 19 138 51L122 86Q80 109 39 86Z M30 52Q80 28 130 52Q80 79 30 52Z',
  towels: 'M30 27H118V81H30Z M37 83H128V94H37Z M44 96H138V106H44Z M38 36H108 M38 43H108 M38 69H108',
}
const steelCare = 'Allow to cool before washing. Hand wash with mild soap and a soft sponge; dry thoroughly. Avoid abrasive cleaners.'
const cooktops = 'Gas, electric, ceramic and induction; oven safe to 450°F.'
const rows = [
// id, title, category, price, type, material, use, size, capacity, photo, brand, includes, care, compatibility, shape
['saucepan','Tri-ply covered saucepan','Cookware',89,'Saucepans','Stainless steel','Sauces','7 inch','2 qt',null,'Open Kitchen','Pan and fitted lid',steelCare,cooktops,'saucepan'],
['stockpot','Stainless steel stockpot','Cookware',119,'Stockpots','Stainless steel','Soups','10 inch','8 qt','steel-pot','Open Kitchen','Pot and fitted lid',steelCare,cooktops,'pot'],
['saute-pan','Covered sauté pan','Cookware',99,'Sauté pans','Stainless steel','Sautéing','11 inch','3 qt',null,'Open Kitchen','Pan and fitted lid',steelCare,cooktops,'saute'],
['grill-pan','Cast-iron ridged grill pan','Cookware',69,'Grill pans','Cast iron','Grilling','10 inch','',null,'Heritage Kitchen','One square grill pan','Hand wash and dry immediately; rub with a light coat of cooking oil.','Gas, electric and induction; oven safe to 500°F.','grill'],
['roasting-pan','Stainless steel roasting pan','Cookware',129,'Roasting pans','Stainless steel','Roasting','16 inch','',null,'Open Kitchen','One roasting pan',steelCare,'Oven safe to 450°F; not intended for stovetop use.','roast'],
['wok','Carbon-steel wok','Cookware',59,'Woks','Carbon steel','Stir-frying','12 inch','',null,'Heritage Kitchen','One flat-bottom wok','Season before first use. Hand wash, dry over low heat and oil lightly.','Gas, electric and induction; oven safe to 400°F.','wok'],
['whisk','Stainless steel balloon whisk','Tools',19,'Whisks','Stainless steel','Mixing','12 inch','','whisk-steel','Williams Sonoma','One balloon whisk','Dishwasher safe. Dry before storing.','For hand mixing; avoid scraping nonstick surfaces.'],
['colander','Footed stainless steel colander','Tools',39,'Colanders','Stainless steel','Draining','10 inch','5 qt','colander-steel','Open Kitchen','One two-handle colander','Dishwasher safe. Wipe dry to prevent water spots.','For draining produce and pasta; not for direct heat.'],
['measuring-spoons','Stainless measuring spoons, set of four','Tools',18,'Measuring','Stainless steel','Measuring','4 pieces','','measuring-spoons-steel','Williams Sonoma','¼ tsp, ½ tsp, 1 tsp and 1 tbsp on a ring','Dishwasher safe. Separate spoons for thorough cleaning.','For dry and liquid ingredients.'],
['rolling-pin','Maple rolling pin','Tools',29,'Rolling pins','Maple','Baking','18 inch','','rolling-pin-wood','Heritage Kitchen','One rolling pin','Wipe with a damp cloth; never soak or place in a dishwasher.','For rolling pastry, cookies and pizza dough.'],
['cutting-board','End-grain wood cutting board','Tools',69,'Cutting boards','Acacia wood','Chopping','16 × 12 inch','','cutting-board','Heritage Kitchen','One cutting board','Hand wash, dry upright and occasionally condition with food-safe mineral oil.','For countertop food preparation; not oven or dishwasher safe.'],
['thermometer','Instant-read cooking thermometer','Tools',29,'Thermometers','Stainless steel','Temperature','6 inch','',null,'Williams Sonoma','Probe thermometer and one battery','Wipe probe clean after use; do not immerse the display.','Reads 32–392°F; remove before cooking, not an oven-leave-in probe.','thermometer'],
['paring-knife','Precision paring knife, 3.5 inch','Cutlery',29,'Paring knives','Stainless steel','Peeling','3.5 inch','',null,'Open Kitchen','One knife and blade sleeve','Hand wash and dry immediately; store with blade protected.','For peeling and trimming on a wood or plastic cutting board.','paring'],
['bread-knife','Serrated bread knife, 9 inch','Cutlery',49,'Bread knives','Stainless steel','Slicing bread','9 inch','',null,'Open Kitchen','One knife and blade sleeve','Hand wash and dry immediately; do not hone serrated edges.','For bread, tomatoes and delicate cakes.','bread'],
['santoku','Hollow-edge santoku, 7 inch','Cutlery',69,'Santoku knives','Stainless steel','Chopping','7 inch','',null,'Williams Sonoma','One knife and blade sleeve','Hand wash and dry immediately; maintain with a fine honing steel.','For slicing and chopping; not for frozen food or bones.','santoku'],
['honing-steel','Knife honing steel, 10 inch','Cutlery',39,'Knife care','Stainless steel','Knife care','10 inch','',null,'Williams Sonoma','One honing steel','Wipe with a damp cloth and dry; store separately from knife edges.','For maintaining straight steel edges; not ceramic or serrated blades.','honing'],
['blender','Glass-pitcher countertop blender','Electrics',149,'Blenders','Glass and steel','Blending','15 inch tall','1.5 L','blender','Countertop Studio','Motor base, glass pitcher and lid','Unplug before cleaning. Wash pitcher by hand; wipe motor base.','120 V US outlet; use with cooled ingredients.'],
['espresso-machine','Compact espresso machine','Electrics',249,'Espresso machines','Stainless steel','Coffee','12 inch tall','1 L','espresso-machine','Countertop Studio','Machine, portafilter and two filter baskets','Rinse baskets after use and descale regularly; wipe exterior.','120 V US outlet; ground coffee only.'],
['coffee-maker','Glass-carafe drip coffee maker','Electrics',89,'Coffee makers','Glass and steel','Coffee','14 inch tall','10 cups','drip-coffee-maker','Countertop Studio','Coffee maker, carafe and filter basket','Wash removable parts by hand; descale regularly.','120 V US outlet; paper basket filters.'],
['kettle','Stainless electric kettle','Electrics',69,'Kettles','Stainless steel','Tea','9 inch tall','1.7 L','kettle','Countertop Studio','Kettle and powered base','Descale interior regularly; do not immerse base.','120 V US outlet; heat water only.'],
['toaster','Cream two-slice toaster','Electrics',79,'Toasters','Coated steel','Toasting','11 inch wide','2 slices','toaster','Countertop Studio','Toaster and removable crumb tray','Unplug and cool, then empty crumb tray and wipe exterior.','120 V US outlet; two slots for sliced bread.'],
['food-processor','Compact food processor','Electrics',179,'Food processors','Stainless steel','Chopping','15 inch tall','8 cups','food-processor-steel','Countertop Studio','Motor base, bowl, lid, S-blade and slicing disc','Unplug before removing blades. Hand wash removable parts.','120 V US outlet; cooled ingredients only.'],
['loaf-pan','Nonstick loaf pan','Bakeware',22,'Loaf pans','Aluminized steel','Baking bread','9 × 5 inch','','loaf-pan-dark','Open Kitchen','One loaf pan',steelCare,'Oven safe to 425°F; use wood or silicone utensils.'],
['sheet-pan','Aluminum half-sheet pan','Bakeware',24,'Sheet pans','Aluminum','Roasting','18 × 13 inch','',null,'Open Kitchen','One rimmed sheet pan',steelCare,'Oven safe to 450°F; no direct stovetop heat.','sheet'],
['muffin-pan','Nonstick six-cup muffin pan','Bakeware',26,'Muffin pans','Aluminized steel','Baking muffins','12 × 8 inch','6 cups',null,'Open Kitchen','One six-cup pan',steelCare,'Oven safe to 425°F; use paper liners or lightly grease.','muffin'],
['pie-dish','Ruffled stoneware pie dish','Bakeware',35,'Pie dishes','Stoneware','Baking pies','9 inch','',null,'Heritage Kitchen','One pie dish','Dishwasher safe. Avoid sudden temperature changes.','Oven safe to 425°F; microwave safe; not for direct heat.','pie'],
['serving-bowl','Ribbed ceramic serving bowl','Tabletop',39,'Serving bowls','Ceramic','Serving','10 inch','2 qt','serving-bowl-white','Pantry & Table','One white serving bowl','Dishwasher safe; allow to cool before washing.','Microwave safe; not for stovetop cooking.'],
['drinking-glasses','Stemless drinking glasses, set of four','Tabletop',29,'Glassware','Glass','Dining','4 pieces','15 oz','glassware','Pantry & Table','Four clear stemless glasses','Top-rack dishwasher safe; avoid thermal shock.','For cold and room-temperature beverages.'],
['flatware','Stainless flatware, four-piece setting','Tabletop',29,'Flatware','Stainless steel','Dining','4 pieces','','flatware','Pantry & Table','Dinner fork, table knife, soup spoon and teaspoon','Dishwasher safe; dry promptly to limit water spots.','One place setting; not microwave safe.'],
['olive-oil','Extra-virgin olive oil','Food & Home',24,'Pantry','Olive oil','Finishing','500 mL','','olive-oil','Pantry & Table','One 500 mL bottle','Store capped in a cool dark place; use within 60 days of opening.','Ingredients: extra-virgin olive oil. For cooking and finishing.'],
['coffee','Whole-bean morning blend coffee','Food & Home',18,'Coffee','Coffee beans','Coffee','12 oz','','coffee','Pantry & Table','One 12 oz bag of whole beans','Keep sealed, away from heat and moisture. Grind just before brewing.','Ingredients: roasted coffee beans. Requires a coffee grinder.'],
['kitchen-towels','Cotton kitchen towels, set of three','Food & Home',24,'Kitchen linens','Cotton','Drying','3 pieces','',null,'Pantry & Table','Three 20 × 28 inch cotton towels','Machine wash warm; tumble dry low. Wash before first use.','For drying hands and dishes; not heat-resistant oven mitts.','towels'],
]
const legacy = {
  skillet: ['Skillets','Stainless steel','Searing','10 inch','','frying-pan','Williams Sonoma','One skillet',steelCare,cooktops,'pan'],
  utensils: ['Utensils','Beech wood','Stirring','3 pieces','','wood-utensils-three','Williams Sonoma','Solid spoon, slotted spoon and turner','Hand wash; dry immediately. Do not soak.','Suitable for nonstick cookware; keep away from open flame.'],
  'dinner-plates': ['Dinnerware','Ceramic','Dining','4 pieces','','dinner-plates-white','Williams Sonoma','Four white 10.5-inch dinner plates','Dishwasher safe. Avoid sudden temperature changes.','Microwave safe; not intended for oven cooking.'],
  'dutch-oven': ['Dutch ovens','Enameled cast iron','Braising','10 inch','5 qt','dutch-oven','Heritage Kitchen','Cream Dutch oven and fitted lid','Hand wash after cooling; avoid metal utensils and thermal shock.',cooktops,'pot'],
  'chef-knife': ['Chef’s knives','Stainless steel','Chopping','8 inch','','chef-knife','Williams Sonoma','One chef’s knife','Hand wash and dry immediately; protect the blade in storage.','For chopping and slicing; not for bones or frozen food.'],
  'stand-mixer': ['Stand mixers','Coated steel','Mixing','14 inch tall','5 qt','stand-mixer','Countertop Studio','Red mixer, steel bowl, flat beater, dough hook and wire whip','Unplug, wipe motor head and hand wash attachments.','120 V US outlet; leave clearance above the tilt head.'],
  'baking-dish': ['Baking dishes','Stoneware','Baking casseroles','13 × 9 inch','3 qt','baking-dish-cream','Williams Sonoma','One cream rectangular baking dish','Dishwasher safe. Avoid sudden temperature changes.','Oven safe to 425°F; microwave safe; no direct heat.'],
  'linen-napkins': ['Napkins','Linen','Dining','4 pieces','','linen-napkins-beige','Williams Sonoma','Four beige 20-inch square napkins','Machine wash cold; tumble dry low; warm iron if desired.','For tabletop use; wash before first use.'],
}
const fields = ['type','material','use','size','capacity','photo','brand','includes','care','compatibility','shape']
const metadata = row => Object.fromEntries(fields.map((key,i) => [key,row[i] ?? '']))
export const products = [
  ...originalProducts.map(p => ({ ...p, ...metadata(legacy[p.id]) })),
  ...rows.map(([id,title,category,price,...rest],i) => ({ id,title,category,price,...metadata(rest), description: `${title} brings thoughtful design to ${rest[2].toLowerCase()} and everyday kitchen routines.`, rating: [4.6,4.4,4.8,4.2,4.7][i%5], reviews: 24+i*13, options: {}, badge: i%6===0?'New':'' })),
].map((p,i) => ({ ...p, brandSlug: slugify(p.brand), stock: 10, available: true, art: shapes[p.shape] || p.art || shapes.pan, color: ['Cast iron','Carbon steel'].includes(p.material)?'#454441':p.material==='Stoneware'?'#d5c9ab':'#9b9f9d', keywords: `${p.keywords||''} ${p.type} ${p.material} ${p.use} ${p.brand}`, ordinal:i, details: [`Size: ${p.size}`, ...(p.capacity?[`Capacity: ${p.capacity}`]:[]), `Material: ${p.material}`, `Includes: ${p.includes}`] }))
const byId = id => products.find(p=>p.id===id)
const additionalPhotos = {
  saucepan:'saucepan-steel', 'saute-pan':'saute-pan-steel', 'grill-pan':'grill-pan-black',
  'roasting-pan':'roasting-pan-steel', wok:'wok-black', thermometer:'probe-thermometer',
  'paring-knife':'paring-knife-black','bread-knife':'bread-knife-black',santoku:'santoku-black',
  'honing-steel':'honing-steel-black','sheet-pan':'sheet-pan-aluminum','muffin-pan':'muffin-pan-six',
  'pie-dish':'pie-dish-cream','kitchen-towels':'kitchen-towels-three',
}
for(const [id,photo] of Object.entries(additionalPhotos)) byId(id).photo=photo
function variants(id, labels, entries) {
  const p=byId(id)
  p.options = Object.fromEntries(labels.map((label,i)=>[label,[...new Set(entries.map(e=>e.values[i]))]]))
  p.variants=entries.map((e,i)=>({id:`${id}-${i+1}`,options:Object.fromEntries(labels.map((label,j)=>[label,e.values[j]])),price:e.price,stock:e.stock??8,...e.meta}))
}
variants('skillet',['Finish'],[
  {values:['Stainless steel'],price:59.99,meta:{photo:'frying-pan'}},
  {values:['Brushed steel'],price:64.99,meta:{photo:'skillet-brushed-steel',color:'#8f969a'}},
])
variants('saucepan',['Capacity','Finish'],[
  {values:['2 qt','Polished steel'],price:89,meta:{capacity:'2 qt',size:'7 inch'}},
  {values:['2 qt','Brushed steel'],price:95,stock:0,meta:{capacity:'2 qt',size:'7 inch',photo:'saucepan-brushed-steel'}},
  {values:['3 qt','Polished steel'],price:109,meta:{capacity:'3 qt',size:'8 inch'}},
  {values:['3 qt','Brushed steel'],price:115,stock:3,meta:{capacity:'3 qt',size:'8 inch',photo:'saucepan-brushed-steel'}},
])
variants('dutch-oven',['Capacity','Color'],[
  {values:['5 qt','Cream'],price:179,meta:{photo:'dutch-oven',capacity:'5 qt',size:'10 inch'}},
  {values:['7 qt','Cream'],price:219,meta:{photo:'dutch-oven',capacity:'7 qt',size:'12 inch'}},
  {values:['5 qt','Sage'],price:189,stock:0,meta:{photo:'dutch-oven-sage',gallery:['dutch-oven-sage','dutch-oven-sage-open'],color:'#83917f',capacity:'5 qt',size:'10 inch',includes:'Sage Dutch oven and fitted lid'}},
  {values:['7 qt','Sage'],price:229,stock:2,meta:{photo:'dutch-oven-sage',gallery:['dutch-oven-sage','dutch-oven-sage-open'],color:'#83917f',capacity:'7 qt',size:'12 inch',includes:'Sage Dutch oven and fitted lid'}},
])
variants('stand-mixer',['Capacity'],[
  {values:['5 qt'],price:299,meta:{capacity:'5 qt'}},
  {values:['6 qt'],price:349,stock:4,meta:{capacity:'6 qt'}},
])
variants('cutting-board',['Size'],[
  {values:['16 × 12 inch'],price:69,meta:{size:'16 × 12 inch'}},
  {values:['20 × 15 inch'],price:89,stock:4,meta:{size:'20 × 15 inch'}},
])
for (const id of ['dutch-oven','stand-mixer']) for (const v of byId(id).variants) {
  v.description=byId(id).description.replace(/5-quart|five-quart/g,v.capacity.replace(' qt','-quart'))
  v.detail=v.description
}
byId('honing-steel').stock=0
products.push(...kitchenRangeProducts)
export const collections = [
  {slug:'new',name:'New for the kitchen',intro:'Fresh additions for small rituals and memorable meals.',test:p=>p.badge==='New'},
  {slug:'sale',name:'Kitchen values',intro:'Useful finds at $50 and under.',test:p=>p.price<=50},
  {slug:'fall-baking',name:'A season for baking',intro:'Warm ovens, tender loaves and something to share.',test:p=>p.category==='Bakeware'||['stand-mixer','whisk','rolling-pin','measuring-spoons'].includes(p.id)},
  {slug:'registry-essentials',name:'Start a life of cooking',intro:'The dependable pieces you will reach for, day after day.',test:p=>['skillet','dutch-oven','chef-knife','utensils','stand-mixer','dinner-plates','linen-napkins','drinking-glasses','flatware','cutting-board'].includes(p.id)},
  {slug:'coffee-bar',name:'Make mornings yours',intro:'Coffee makers, everyday beans and countertop companions.',test:p=>['espresso-machine','coffee-maker','kettle','toaster','coffee'].includes(p.id)},
  {slug:'gathering',name:'Set a welcoming table',intro:'Simple layers for long conversations and shared plates.',test:p=>p.category==='Tabletop'||['baking-dish','dutch-oven','olive-oil'].includes(p.id)},
]
export const candidateVariants = p => p.variants?.length ? p.variants.map(v=>({...p,...v,id:p.id,variantId:v.id,options:v.options,stock:Math.min(p.stock,v.stock),available:p.available!==false&&v.available!==false})) : [{...p,options:{},variantId:null}]
const scalar = value=> typeof value==='string'?value.trim():''
export function readFilters(input={}) {
  input = { ...input, q: input.words ?? input.q }
  return Object.fromEntries(['q','category','type','brand','material','use','capacity','size','price','rating','stock','collection','sort','page'].map(k=>[k,scalar(input[k])]))
}
const aliases = {'frying pans':'skillet','fry pan':'skillet','cooks tools':'Tools','dishes':'dinner plates','mixer':'mixer','casserole':'baking dish','coffee machines':'coffee'}
export function filterCatalog(input={}) {
  const f=readFilters(input), query=aliases[f.q.toLowerCase()]||f.q.toLowerCase()
  const terms=query.split(/\s+/).filter(Boolean), collection=collections.find(c=>c.slug===f.collection)
  if(f.collection&&!collection) return []
  let result=products.filter(p=>terms.every(term=>`${p.title} ${p.keywords} ${p.category}`.toLowerCase().includes(term))&&(!f.category||p.category===f.category)&&(!f.type||p.type===f.type)&&(!f.brand||p.brandSlug===f.brand)&&(!f.material||p.material===f.material)&&(!f.use||p.use===f.use)&&(!f.rating||p.rating>=Number(f.rating))&&(!collection||collection.test(p)))
  result=result.flatMap(p=>{
    const choices=candidateVariants(p).filter(v=>(!f.capacity||v.capacity===f.capacity)&&(!f.size||v.size===f.size)&&(!f.price||v.price<=Number(f.price))&&(!f.stock||(f.stock==='in-stock'?v.available&&v.stock>0:f.stock==='out-of-stock'?!v.available||v.stock===0:false)))
    if(!choices.length)return []
    const selected=[...choices].sort((a,b)=>a.price-b.price)[0]
    return [{...p,matchedVariant:selected,displayPrice:selected.price,displayMax:Math.max(...choices.map(v=>v.price))}]
  })
  if(f.sort==='price-asc') result.sort((a,b)=>a.displayPrice-b.displayPrice)
  else if(f.sort==='price-desc') result.sort((a,b)=>b.displayPrice-a.displayPrice)
  else if(f.sort==='rating') result.sort((a,b)=>b.rating-a.rating)
  else if(f.sort==='new') result.sort((a,b)=>(b.badge==='New')-(a.badge==='New')||b.ordinal-a.ordinal)
  return result
}

// No legacy authored item has verified purchase evidence in reference mode.
applyCatalogPolicy('williams-sonoma', products, {})
