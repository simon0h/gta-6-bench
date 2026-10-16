import { renderSpecialty, specialtyFamilies } from './product-asset-specialties.js'

// Self-contained native product illustrations for the synthetic catalog.
// All geometry is rendered locally. A gallery shows the actual item form from
// different views; a spec sheet or a recolored thumbnail is not a gallery image.
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]))
const hash = s => { let n=2166136261; for(const c of String(s)) n=Math.imul(n^c.codePointAt(0),16777619); return n>>>0 }
const a = values => Object.entries(values).filter(([,v])=>v!==undefined).map(([k,v])=>` ${k}="${esc(v)}"`).join('')
const tag = (name,values,body='') => `<${name}${a(values)}>${body}</${name}>`
const rect=(x,y,width,height,fill,rx=0,extra={})=>tag('rect',{x,y,width,height,rx,fill,...extra})
const circle=(cx,cy,r,fill,extra={})=>tag('circle',{cx,cy,r,fill,...extra})
const ellipse=(cx,cy,rx,ry,fill,extra={})=>tag('ellipse',{cx,cy,rx,ry,fill,...extra})
const line=(x1,y1,x2,y2,stroke,width=3,extra={})=>tag('line',{x1,y1,x2,y2,stroke,'stroke-width':width,'stroke-linecap':'round',...extra})
const path=(d,fill,stroke,width=2,extra={})=>tag('path',{d,fill,stroke,'stroke-width':width,'stroke-linejoin':'round','stroke-linecap':'round',...extra})
const poly=(points,fill,extra={})=>tag('polygon',{points,fill,...extra})
const text=(s,x,y,size=18,fill='#27313d',extra={})=>tag('text',{x,y,'font-family':'Arial, sans-serif','font-size':size,fill,...extra},esc(s))
const group=(body,transform,extra={})=>tag('g',{transform,...extra},body)
const repeat=(n,fn)=>Array.from({length:n},(_,i)=>fn(i)).join('')
const dark='#26313c',ink='#17232e',steel='#97a7b4',paper='#f6f5f1'
const colors={black:'#24282c',white:'#eceeea',grey:'#818b92',gray:'#818b92',silver:'#adb9c0',navy:'#243d62',blue:'#316fa2',green:'#61836c',red:'#ad4f51',pink:'#d3a4b0',rosewood:'#a55862',brown:'#815c43',orange:'#cf8053',yellow:'#d4b653',purple:'#77648e',natural:'#cbb08a',ivory:'#e4ddc9',oatmeal:'#c7bda9',stone:'#96968e',clear:'#b8d1da',sand:'#c6b397',flax:'#bbaa89',champagne:'#d6b47c',pearl:'#d2cfc7'}
function colour(v,fallback){ if(typeof v!=='string')return fallback; if(/^#[0-9a-f]{3,8}$/i.test(v))return v;return Object.entries(colors).find(([key])=>new RegExp(`\\b${key}\\b`,'i').test(v))?.[1]||fallback }
function specString(value){if(Array.isArray(value))return value.map(specString).join(' ');if(value&&typeof value==='object')return Object.entries(value).map(([k,v])=>`${k} ${specString(v)}`).join(' ');return String(value??'')}
function model(d){
 const raw=d.raw||{},title=String(d.title||raw.title||raw.name||'Product'),full=[title,d.category,raw.type,raw.productType,raw.shape,raw.artShape,raw.material,raw.description,raw.details,raw.features,d.specs,raw.specs].map(specString).join(' ').toLowerCase(),h=hash(d.assetKey||title)
 const specs=specString(d.specs||raw.specs),colourName=raw.colorName||raw.colour||raw.color||d.color||specs.match(/(?:colou?r)[: ]+([^;]+)/i)?.[1]
 const dims=raw.dimensions&&typeof raw.dimensions==='object'?raw.dimensions:null
 const n=(index,min,max)=>{const seed=(hash(`${d.assetKey||title}:${index}`)%10001)/10000;let amount=seed;if(dims?.width&&dims?.height&&/width|height/.test(String(index))){const ratio=Number(dims.width)/Number(dims.height);amount=/width/.test(String(index))?Math.max(0,Math.min(1,(ratio-.5)/2)):Math.max(0,Math.min(1,(1/ratio-.35)/1.8));amount=amount*.92+seed*.08}return min+amount*(max-min)}
 const material=/bamboo|대나무/.test(full)?'bamboo':/oak|pine|timber|beech|wood|목재|나무/.test(full)?'wood':/woven|rattan|seagrass|weave|knit|wool|cotton|linen|felt|면|패브릭/.test(full)?'fabric':/glass|유리/.test(full)?'glass':/steel|metal|alumin|스테인리스|무쇠/.test(full)?'metal':/ceramic|stoneware|porcelain|도자기/.test(full)?'ceramic':'smooth'
 const materialColor={bamboo:'#c6ac72',wood:'#b99a73',fabric:'#aca599',glass:'#b6d1d8',metal:'#aab8c1',ceramic:'#d8cdbb',smooth:`hsl(${h%360} 24% 53%)`}[material]
 const c=colour(colourName,materialColor),accent=colour(raw.accent,`hsl(${(h>>>5)%360} 35% 43%)`)
 const shape=String(raw.shape||raw.artShape||raw.illustration||'').toLowerCase()
 const has=re=>re.test(full),count=Math.min(12,Math.max(1,Number(title.match(/\b(\d+)\s*(?:piece|pack|pc|tier|drawer|slot|shelf|compartment)/i)?.[1])||Number(full.match(/(?:three|3)[ -](?:shelf|tier|drawer|compartment)/)?.[0]?3:0)||1))
 return {d,raw,title,t:title.toLowerCase(),full,h,n,c,accent,material,shape,has,count,specs,platform:d.platform||raw.catalogPlatform||raw.platform||'',width:n('width',165,225),height:n('height',200,290)}
}

// Prefer the title over a broad merchandising family. A cat tunnel is not a bed,
// and a charging-cable keeper must never acquire electrical pins in its artwork.
export function classifyProductAsset(descriptor){
 const p=model(descriptor),{raw}=p,category=String(raw.category||''),type=String(raw.type||raw.productType||raw.typeLabel||'').toLowerCase()
 const brand=String(raw.brand||descriptor.brand||'').toLowerCase().trim()
 let t=p.t
 if(brand&&t.startsWith(brand))t=t.slice(brand.length).replace(/^[\s,:–—-]+/,'')
 // Included features are not the primary item: a webcam with a privacy cover
 // is a camera, while a privacy cover for a webcam remains an accessory.
 t=t.split(/\s+with\s+|\s+including\s+/)[0]
 if(descriptor.type==='game'||raw.catalogType==='game')return 'game'
 if(descriptor.type==='console'||raw.catalogType==='console')return 'console'
 if(raw.accessorySubtype==='digital-add-on')return 'game'
 const merchandising=[raw.type,raw.typeLabel,raw.category,raw.artFamily,raw.shape].filter(Boolean).join(' ').toLowerCase()
 if(/audio cd|\bcds?\b|vinyl|blu-ray/.test(merchandising)||raw.department==='music'||/\b(?:vinyl|(?:\d+x?\s*)?lp)\b/.test(t))return 'media'
 if(/^(games & puzzles|board games|puzzles)$/.test(type)||/\brailway\b|\bcraft kit\b/.test(t))return 'toy'
 if(/(?:trading.card|collectible card|gift card|cash card|starter deck|booster pack)/.test(t)&&!/(?:binder|case|vault|wallet|sleeve|holder|pouch|display|storage)/.test(t))return 'card'
 if(type==='cable')return 'cable'
 if(/^(skin care|skincare|personal care)$/.test(type))return 'beauty'
 if(/^(pantry|beverages|grains)$/.test(type))return 'food'
 if(type==='food storage')return /wrap/.test(t)?'textile':/pouch/.test(t)?'bag':'jar'
 if(type==='pet accessories'&&/food dish|water dish/.test(t))return 'bowl'
 if(type==='pet accessories'&&/feeding rack/.test(t))return 'stand'
 if(/\bscrubber\b/.test(t))return 'brush'
 if(/paperback|hardcover|\bbooks?\b/.test(merchandising))return 'book'
 if(/\b(?:dutch oven|stockpot|stove.top kettle|whistling kettle)\b/.test(t))return 'pan'
 if(/\b(?:t-shirt|t shirt|shirt|hoodie|jacket|crewneck|polo|bathrobe)\b/.test(t))return 'apparel'
 if(/\b(?:hub|adapter|adaptor)\b/.test(t)&&/(?:usb|laptop|computer|audio|display|ethernet|memory|card)/.test(t))return 'cable'
 if(/\bstand mixer\b/.test(t)&&!/(?:cover|attachment|bowl|replacement)/.test(t))return 'appliance'
 if(/\banalog.stick grips?\b|\b(?:thumbstick|analog-stick) (?:caps?|grips?)\b/.test(t))return 'stand'
 if(/\bscratch drive\b/.test(t))return 'storage-drive'
 if(/(?:console|cable|pushchair|stroller).*\b(?:travel organizer|organiser)\b/.test(t))return 'bag'
 if(/\bbed runner\b/.test(t))return 'textile'
 if(/\b(?:bags|pouches|duffels|totes)\b/.test(t))return 'bag'
 if(/\b(?:storage|pantry) (?:tin|jar|canister|container)\b|\b(?:tea|coffee|spice) (?:storage )?(?:tin|jar|canister|container)\b/.test(t))return 'jar'
 // Structured catalog types take precedence over fragrance names, material names,
 // and usage descriptions: sandalwood perfume is not footwear.
 if(descriptor.store==='nike'){
  if(category==='Shoes')return 'shoe'
  if(category==='Clothing')return 'apparel'
  if(/^(hats|socks|headbands)$/.test(type))return 'apparel'
  if(type==='bags')return 'bag'
  if(type==='balls')return 'ball'
  if(type==='bottles')return 'jar'
  if(type==='mats')return 'textile'
  if(/equipment/.test(type))return /cap|glove/.test(t)?'apparel':/bag/.test(t)?'bag':'fitness'
 }
 if(descriptor.store==='sephora'){
  if(/^(blush|bronzer|eyeshadow|highlighter)$/.test(type))return 'palette'
  if(type==='lipstick')return 'lipstick'
  if(/pencil|liner/.test(type))return 'pencil'
  if(type==='brushes')return 'brush'
  if(type==='hair dryer')return 'appliance'
  return 'beauty'
 }
 if(descriptor.store==='williams-sonoma'){
  if(category==='Cookware'||category==='Bakeware')return 'pan'
  if(category==='Cutlery')return 'utensil'
  if(category==='Electrics')return 'appliance'
  if(category==='Tools')return /boards/.test(type)?'plate':/colanders/.test(type)?'bowl':'utensil'
  if(category==='Tabletop')return /napkins/.test(type)?'textile':/flatware/.test(type)?'utensil':/bowls/.test(type)?'bowl':/mugs|glassware|drinkware/.test(type)?'cup':/pitchers|coffee service|tea service/.test(type)?'vase':'plate'
  if(/^(pantry|baking ingredients|condiments|coffee|grains|meal starters|pasta|preserves|seasonings|tea)$/.test(type))return 'food'
  if(/linens|heat protection/.test(type))return 'textile'
  if(/food storage/.test(type))return 'jar'
  if(/sink-side dispenser/.test(t))return 'beauty'
  if(/sachet/.test(t))return 'bag'
  if(/taper/.test(t))return 'jar'
 }
 if(descriptor.store==='chewy'){
  if(/^(food|treats)$/.test(type))return 'food'
  if(type==='walking')return 'leash'
  if(type==='bedding')return 'textile'
  if(type==='habitats')return 'pet-house'
  if(type==='grooming')return /shampoo|conditioner|spray|wash/.test(t)?'beauty':/towel|mitt/.test(t)?'textile':'brush'
  if(type==='heating')return /lamp|light/.test(t)?'lamp':'textile'
  if(type==='toys')return /ball\b|egg\b|ring\b/.test(t)?'ball':/mouse|fish|bird|carrot|catnip|plush/.test(t)?'figure':/rope|tug/.test(t)?'leash':'toy'
  if(type==='feeding & water')return /rack|station/.test(t)?'stand':/fountain|waterer/.test(t)?'appliance':/bottle/.test(t)?'jar':/cup/.test(t)?'cup':'bowl'
  if(type==='beds & furniture')return /scratch|tree|perch|hide|hammock|house/.test(t)?'pet-house':/pad|mat/.test(t)?'textile':'bed'
  if(type==='aquarium care')return /net|brush|scraper/.test(t)?'brush':/filter|pump|aerator/.test(t)?'appliance':'pet-house'
  if(type==='cleaning')return /pads|mat|mitt/.test(t)?'textile':/brush|rake|scoop|scraper|blade|squeegee/.test(t)?'brush':/litter|waste|bag|roll|bedding/.test(t)?'bag':'beauty'
 }
 // Accessory nouns override the host device, as do furniture and storage nouns.
 if(descriptor.store==='ikea'){
  if(category==='Textiles'||category==='Bathroom')return /curtain|canopy/.test(t)?'curtain':/dispenser/.test(t)?'beauty':/brush/.test(t)?'brush':'textile'
  if(category==='Storage')return /bench/.test(t)?'chair':/\b(?:basket|hamper|bin|box|boxes|organizer|file)\b/.test(t)?'basket':/hanger|hook/.test(t)?'stand':'shelf'
  if(/chaise|lounge unit/.test(t))return 'chair'
  if(/workstation|writing desk/.test(t))return 'table'
  if(/dollhouse|play kitchen/.test(t))return 'toy'
  if(/butter dish/.test(t))return 'plate'
 }
 if(/수납 포켓/.test(t))return 'bag'
 if(/김서림 닦이/.test(t))return 'textile'
 if(/반사 삼각대/.test(t))return 'stand'
 if(/수납함/.test(t))return 'basket'
 if(/테이블/.test(t))return 'table'
 if(/소프트 쿨러/.test(t))return 'bag'
 if(/등산 스틱|팩 해머/.test(t))return 'tool'
 if(/캠핑 식기/.test(t))return 'bowl'
 if(/레인커버|stroller.*(?:cover|footmuff)/.test(t))return 'textile'
 if(/steam steriliser/.test(t))return 'jar'
 if(/under.desk computer tray/.test(t))return 'stand'
 const exactShape=String(raw.shape||'').toLowerCase()
 if(exactShape==='desktop'||/\bmini pc\b|\btower workstation\b/.test(t))return 'desktop'
 if(exactShape==='router'||/\brouter\b|network switch|access point/.test(t))return 'router'
 if(exactShape==='watch'||/\bwatch\b|smartwatch|activity tracker|tracking wristband/.test(t))return 'watch'
 if(/\bssd\b|solid.state drive|storage drive|nvme|encrypted portable drive/.test(t)||exactShape==='ssd')return 'storage-drive'
 if(/smart plug|streaming.*player|thermostat|doorbell|power bank/.test(t))return 'smart-device'
 if(/printer/.test(t))return 'printer'
 if(/microwave/.test(t))return 'microwave'
 if(/\btent\b/.test(t))return 'tent'
 if(/stroller/.test(t))return 'stroller'
 if(/드릴|공구 세트|공기압 측정기/.test(t))return 'tool'
 if(/enamel pins?|keychain|sticker folder|tile coaster|gold bars|goodtime state|^gta\+$/.test(t))return 'collectible'
 if(/candle/.test(t))return 'jar'
 if(/squeegee/.test(t))return 'brush'
 if(/trash bags/.test(t))return 'bag'
 if(/\bbins\b/.test(t))return 'basket'
 if(/\bsocks\b/.test(t))return 'apparel'
 if(/sound ?bar|audio interface/.test(t))return 'speaker'
 if(/\bphone\b/.test(t)&&!/(?:case|stand)/.test(t))return 'display'
 if(/baby bouncer|garden kneeler/.test(t))return 'chair'
 if(/bathroom scale/.test(t))return 'appliance'
 if(/slime|shape discovery|activity gym|ring toss|hose reel cart|trampoline/.test(t))return 'toy'
 if(/foot-to-floor|pedal tractor/.test(t))return 'bicycle'
 if(/helmet/.test(t))return 'apparel'
 const specific=[
  ['bag',/\b(?:backpack|duffel|duffle|tote|purse|wallet|pouch|satchel|luggage|suitcase)\b|\b(?:carry|carrying|travel|transport|controller|camera|laptop|card|protective) (?:case|bag|trunk)\b|가방|지갑|파우치|주머니|에코백/],
  ['stand',/\b(?:stand|mount|holder|bracket|dock|riser|rest|hooks?|hangers?|display easel|display base|display cradle|screen protector|trigger extension|foam insert)\b|거치|받침|걸이|스탠드/],
  ['chair',/\b(?:chair|armchair|settee|sofa|stool|bench|seat|rocker)\b|의자/],
  ['table',/\b(?:table|desk|worktop)\b(?!.*\b(?:lamp|mat|organizer|shelf|tray|microphone|drawer|caddy)\b)/],
  ['shelf',/\b(?:shelf|shelves|shelving|bookcase|cabinet|wardrobe|dresser|cupboard|storage tower|bookends?|storage rack|storage drawer|drawer chest|lingerie chest|utility cart|trolley|display unit|display ledge|storage unit|storage console|magazine file)\b|수납 선반|문서 트레이|책 받침|북엔드/],
  ['curtain',/\b(?:curtains?|blind|canopy panel)\b|커튼|가리개/],
  ['textile',/\b(?:blanket|duvet|comforter|towels?|pillow|pillowcase|cushion|bedding|quilt|throw|mattress|rug|mat|felt pad|cloths?|cover|sleeves?|hall runner|fitted sheet|flat sheet|sheet set|napkins?|tablecloth|bathrobe)\b|보호 쿠션|담요|베개|이불|매트|방석|수건|타월/],
  ['brush',/\bbrush\b|\bcomb\b|청소솔|브러시/],
 ]
 for(const [kind,re]of specific)if(re.test(t))return kind
 const rules=[
  ['shoe',/\b(?:shoes?|sneakers?|cleats?|trainers?|boots?|sandals?)\b|신발/],
  ['apparel',/\b(?:shirt|tee|hoodie|jacket|jersey|tank|bra|shorts|pants|legging|tights|skirt|dress|vest|swimsuit|singlet|anorak|polo|sweat|trouser|bikini|rash guard|balaclava|sock|glove|cap|beanie|joggers|tracksuit|windbreaker|jeans|scarf|bandana|crewneck)\b|목욕 가운|티셔츠|셔츠|장갑/],
  ['controller',/\bcontroller\b|gamepad|dualshock|dualsense|컨트롤러|듀얼센스/],
  ['arcade',/arcade.*(?:stick|joystick)|fight stick/],['wheel',/racing wheel|pedal set/],
  ['headphones',/headphone|headset|earbud|earphone|헤드폰|헤드셋|이어폰/],
  ['keyboard',/keyboard|keypad|키보드/],['mouse',/\bmouse\b|trackball|마우스/],
  ['laptop',/\blaptop\b|notebook computer|chromebook/],
  ['display',/television|\btv\b|\bmonitor\b|e-reader|\btablet\b|smartphone|mobile phone|e-paper|e-ink|모니터/],
  ['camera',/\bcamera\b|camcorder|action cam|webcam|binocular|microscope/],
  ['speaker',/\bspeaker\b|\bradio\b|microphone|amplifier|record player|turntable|stereo recorder|스피커/],
  ['cable',/\bcable\b|\badapter\b|\badaptor\b|usb.*hub|card reader|power lead|\bcharger\b|charging kit|멀티 허브|충전기/],
  ['palette',/\bpalette\b|\bblush\b|cheek powder|\bbronzer\b|\bhighlighter\b|eye shadow|eyeshadow/],
  ['lipstick',/\blipstick\b|lip color|lip care stick|립 케어 스틱/],
  ['pencil',/lip liner|eye pencil|brow pencil|eye pen|brow pen|eyeliner/],
  ['bed',/\bbed\b|\bcot\b|\bcrib\b|\bhammock\b|해먹/],
  ['lamp',/\blamp\b|\blantern\b|\blight\b|light set|nightlight|랜턴/],
  ['mirror',/\bmirror\b|\bframe\b|메모 보드/],
  ['basket',/\bbasket\b|\bhamper\b|\bbin\b|\bbox\b|\bcrate\b|\bcaddy\b|toolbox|바구니|보관함|정리 상자/],
  ['pan',/\bpan\b|skillet|cookware|\bwok\b|casserole|\bpot\b|saucier|braiser|rondeau|cocotte|roaster|sauteuse|griddle|comal|baking dish|baking sheet|baking tray|cake mold|cake mould|pie dish|pie plate|loaf tin|muffin|cloche|냄비|그릴팬|프라이팬|베이킹|파이틀/],
  ['plate',/\bplates?\b|platter|\btray\b|(?:cutting|chopping|cheese|carving|crumb|pastry|serving) board|baking stone|접시|도마|식판/],
  ['bowl',/\bbowl\b|colander|steamer|strainer|찜기|믹싱볼|수프볼|파스타 바스켓|거름망/],
  ['cup',/\bmug\b|\bcup\b|tumbler|\bgoblets?\b|glass set|glasses|wine glass|flask|물통|머그컵/],
  ['utensil',/\bspoon\b|\bfork\b|\bpaddle\b|turner|spatula|whisk|ladle|masher|tongs|scissor|\bknife\b|\bknives\b|peeler|grater|reamer|scraper|server|chopstick|rolling pin|slicer|flatware|utensil|crepe spreader|뒤집개|가위|주방 도구|조리도구/],
  ['beauty',/serum|shampoo|conditioner|\bcream\b|cleanser|moistur|toner|balm|lotion|fragrance|perfume|parfum|detergent|cologne|\bmist\b|spray|gloss|lip oil|foundation|concealer|primer|mascara|powder|\bgel\b|essence|\bwash\b|\bsoap\b|scrub|\bmask\b|sun.*screen|body polish|세안|크림|토너|워시|로션|에센스|마스크|샴푸|트리트먼트|스크럽|세제/],
  ['appliance',/vacuum|cleaner|dryer|\bfan\b|heater|kettle|toaster|blender|\bmixer\b|processor|coffee (?:maker|grinder)|espresso machine|air fryer|rice cooker|\boven\b|\bfridge\b|refrigerator|washer|washing machine|humidifier|purifier|projector|sewing machine|청소기|전기포트|선풍기/],
  ['pet-house',/\bcage\b|kennel|aquarium|terrarium|habitat|hutch|coop|cat tree|scratch|perch|tunnel|reptile hide|횃대|스크래처|터널/],
  ['leash',/\bleash\b|harness|\bcollar\b|\blead\b|tether|\bstrap\b|\bband\b|\brope\b|목줄|스트랩/],
  ['bicycle',/bicycle|\bbike\b|scooter|tricycle|ride-on|\bskates?\b/],
  ['ball',/\bball\b|football|basketball|soccer ball|massage ball|snow globe|볼 세트/],
  ['figure',/\bplush\b|\bfigure\b|\bdoll\b|puppet|teddy|stuffed|인형/],
  ['book',/\bbook\b|journal|planner|notebook|binder|album|calendar|poster|\bprint\b|\bguide\b|paperback|hardcover|vinyl|audio cd|blu-ray|gift card|cash card|collectible card|trading card|starter deck|booster pack|플래너|노트|바인더/],
  ['fitness',/exercise|fitness|\broller\b|kettlebell|dumbbell|\byoga\b|resistance|pull-up|step.*box|workout|pilates|balance|treadmill|운동|요가|필라테스|악력|아령/],
  ['toy',/puzzle|\bkit\b|playset|building|construction|board game|strategy game|memory game|card game|dice game|stacking game|marble maze|remote control|remote car|crayons|playhouse|play kitchen|\btoy\b|craft|\bdrum\b|\bguitar\b|xylophone|learning|\brobot\b|\btrain\b|bricks|blocks|vehicle|chess|domino|science|조립|만들기|공작|회로|놀이/],
  ['food',/\bfood\b|\btreat\b|\bfeed\b|\bseed\b|\bhay\b|kibble|milk|bread|apples|drinking water|bottled water|rolled oats|biscuit|cookie|snack|granola|\btea\b|chocolate|\bcoffee\b|\bpasta\b|\bnoodle\b|\brice\b|\bsoup\b|\bsauce\b|\bcereal\b|\bnut\b|\bfruit\b|\bmeal\b|crackers|누룽지|국수|수제비|통조림|수프|파스타|양념|다시마|카레|또띠아|쿠키|그래놀라|과일칩|스낵|쌀과자|크래커|초콜릿|딸기|검은콩|믹스|비스킷|두부과자/],
  ['vase',/\bvase\b|planter|flowerpot|plant pot|cachepot|\bjug\b|pitcher/],['jar',/\bjar\b|canister|\bbottle\b|\btin\b|container|보관|도시락통|수저통/],
 ]
 for(const [kind,re]of rules)if(re.test(t))return kind
 const shape=String(raw.shape||raw.artShape||raw.illustration||raw.artFamily||(typeof raw.art==='string'&&raw.art.length<40&&!/^(?:\/|[Mm]\s*[\d.-])/.test(raw.art)?raw.art:'')||type).toLowerCase()
 const shapes={vinyl:'media',cd:'media',cloth:'textile',belt:'leash',puzzle:'toy',footwear:'shoe',jeans:'apparel',storage:'basket',plush:'figure',train:'toy',car:'toy',board:'toy',baby:'toy',tools:'utensil',ring:'ball',joystick:'arcade',throttle:'arcade',yoke:'wheel',keypad:'keyboard',clock:'clock',litter:'bag',vitamins:'jar',heatpack:'textile',scale:'appliance',seat:'chair',sofa:'chair',desk:'table',cabinet:'shelf',box:'basket',pot:'pan',textile:'textile',frame:'mirror',jug:'vase',spoon:'utensil',turner:'utensil',house:'pet-house',runner:'shoe',trail:'shoe',court:'shoe',cleat:'shoe',sandal:'shoe',loafer:'shoe',tee:'apparel',long:'apparel',tank:'apparel',bra:'apparel',shorts:'apparel',pants:'apparel',skirt:'apparel',dress:'apparel',suit:'apparel',jacket:'apparel',vest:'apparel',shirt:'apparel',cardigan:'apparel',duffel:'bag',cap:'apparel',sock:'apparel',bottle:'jar',mat:'textile',band:'leash',bands:'fitness',rope:'leash',towel:'textile',towels:'textile',glove:'apparel',gloves:'apparel',pump:'beauty',spray:'beauty',dropper:'beauty',tube:'beauty',packet:'beauty',case:'bag',grip:'stand',screen:'stand',cleaning:'brush',food:'food',noodles:'food',cereal:'food',petbed:'bed',shampoo:'beauty',cosmetics:'beauty',kitchen:'utensil',craft:'toy',science:'toy',bricks:'toy',blocks:'toy',playset:'toy',learning:'toy',music:'toy',crib:'bed',stroller:'bicycle',headset:'headphones',earbuds:'headphones',controller:'controller',handheld:'console','dual-screen':'console','handheld-travel-bundle':'console',console:'console',switch:'console',dock:'stand',drive:'storage-drive',ssd:'storage-drive',hub:'cable',charger:'cable',battery:'cable',monitor:'display',fan:'appliance',vacuum:'appliance',kettle:'appliance',milk:'food',yogurt:'food',juice:'food',water:'food',coffee:'food',tea:'food',eggs:'food',fruit:'food',vegetables:'food',cookies:'food',nuts:'food',rice:'food',ramen:'food',oil:'food',can:'food',apples:'food',oats:'food',petfood:'food',diapers:'bag',diaper:'bag',wipes:'bag',babybottle:'jar','baby-bottle':'jar',utensils:'utensil',containers:'jar',tissue:'textile',detergent:'beauty',mop:'brush',cleaner:'brush',dumbbells:'fitness',dumbbell:'fitness',yoga:'textile',bear:'figure',boardgame:'toy',notebooks:'book',notebook:'book',album:'book',pens:'pencil',backpack:'bag',wallet:'bag',tote:'bag',gamecase:'bag',suitcase:'bag',pouches:'bag',neckpillow:'textile',quilt:'textile',cushion:'textile',bedding:'textile',organizer:'shelf',brushes:'brush',serum:'beauty',tent:'tent',lantern:'lamp',bowl:'bowl',mug:'cup'}
 if(shapes[shape])return shapes[shape]
 if(['palette','lipstick','pencil','brush','basket','bowl','plate','vase','lamp','mirror','shelf','table','chair','bag','jar','pan','cup','keyboard','mouse','camera','speaker','cable','ball','book','toy','shoe','apparel','controller','arcade','wheel','headphones','laptop','display','textile','curtain','bed','appliance','pet-house','leash','bicycle','figure','fitness','stand','food','beauty'].includes(shape))return shape
 if(/beauty|skincare|hair|makeup|fragrance/.test(String(raw.category)+' '+type))return 'beauty'
 if(/food|nutrition|pantry/.test(String(raw.category)+' '+type))return 'food'
 if(/book|paperback|hardcover|vinyl|audio cd/.test(type))return 'book'
 if(/bedding|bath|household cleaning/.test(type))return 'textile'
 if(/board games|outdoor games|baby toys|soft toys|building toys/.test(type))return /soft toys/.test(type)?'figure':'toy'
 return 'object'
}

function surfaceDefs(p){
 const pitch=p.n('texture-pitch',8,16),weave=/herringbone/.test(p.full)?`M0 0l${pitch} ${pitch}m0-${pitch}L0 ${pitch}`:`M0 0H${pitch}V${pitch}`
 return `<defs><linearGradient id="finish" x1="0" y1="0" x2="1" y2=".3"><stop stop-color="#fff" stop-opacity=".45"/><stop offset=".25" stop-color="${p.c}"/><stop offset=".7" stop-color="${p.c}"/><stop offset="1" stop-color="#000" stop-opacity=".18"/></linearGradient><linearGradient id="screen" x2="1" y2="1"><stop stop-color="#253749"/><stop offset="1" stop-color="#8aafb7"/></linearGradient><linearGradient id="glass" x2="1"><stop stop-color="#e9f9fd" stop-opacity=".65"/><stop offset=".5" stop-color="${p.c}" stop-opacity=".75"/><stop offset="1" stop-color="#7497a0" stop-opacity=".8"/></linearGradient><pattern id="grain" width="${pitch*5}" height="${pitch*3}" patternUnits="userSpaceOnUse"><path d="M0 ${pitch}Q${pitch*2} 0 ${pitch*5} ${pitch}M0 ${pitch*2}Q${pitch*3} ${pitch*3} ${pitch*5} ${pitch*2}" stroke="#5f4129" stroke-opacity=".18" fill="none" stroke-width="1.5"/></pattern><pattern id="weave" width="${pitch}" height="${pitch}" patternUnits="userSpaceOnUse"><path d="${weave}" stroke="#fff" stroke-opacity=".27" fill="none" stroke-width="1.2"/><path d="M${pitch/2} 0V${pitch}M0 ${pitch/2}H${pitch}" stroke="#000" stroke-opacity=".1" stroke-width="1"/></pattern><pattern id="brushed" width="80" height="5" patternUnits="userSpaceOnUse"><path d="M0 1h80M20 4h50" stroke="#fff" stroke-opacity=".3"/></pattern><clipPath id="canvas"><rect x="28" y="35" width="584" height="530" rx="18"/></clipPath></defs>`
}
function texture(p,body){ const pattern=/wood|bamboo/.test(p.material)?'grain':p.material==='fabric'?'weave':p.material==='metal'?'brushed':null;return body+(pattern?tag('g',{fill:`url(#${pattern})`,'pointer-events':'none'},body.replace(/fill="[^"]*"/g,`fill="url(#${pattern})"`).replace(/stroke="[^"]*"/g,'stroke="none"')):'') }
function label(p,x,y,w=130){ const words=(p.raw.brand||p.d.brand||'').slice(0,23),seed=p.h; return rect(x,y,w,73,'#f7f4ea',3)+text(words,x+8,y+20,11,p.accent,{'font-weight':700})+repeat(3,i=>rect(x+8,y+30+i*10,w-18-(seed>>i*3)%29,3,p.accent,1,{opacity:.58}))+path(`M${x+w-28} ${y+60}q8-24 18-30q2 23-18 30`,p.accent) }
function dimension(p,key,defaultValue){const found=p.full.match(new RegExp(`(\\d+(?:\\.\\d+)?)\\s*(?:${key})`));return found?Number(found[1]):defaultValue}

function shoe(p,v){
 const high=p.has(/high[- ](?:top|collar)|mid[- ]height|boot|ankle sleeve/),flat=p.has(/flat|barbell|stance|court feel|low[- ]drop|indoor/),open=p.has(/sandal|slide sandal/),cleat=p.has(/cleat|stud|soccer/),trail=p.has(/trail|hiking|lug|mud|gravel/),lace=p.has(/lace|runner|shoe|sneaker|boot/)&&!p.has(/laceless|slip-on|sandal/),strap=p.has(/strap/),sole=flat?17:p.has(/platform|cushion|34 mm|deep heel/)?37:25,w=p.n('last',290,335),heel=high?170:232,toe=p.n('toe',275,310)
 if(v===0){const upper=`M135 358L${143} ${heel}Q174 ${heel-28} 207 ${heel+10}L250 265Q302 290 ${135+w} ${toe}L${143+w} 356Q350 390 135 358Z`;return texture(p,path(upper,'url(#finish)',dark,2))+path(`M133 353Q306 378 ${147+w} 347L${140+w} ${365+sole}Q315 ${405+sole} 128 ${374+sole}Z`,'#e6e4de',dark,2)+path(`M145 ${370+sole}Q315 ${400+sole} ${139+w} ${362+sole}`,'none',dark,4)+(lace?repeat(5,i=>line(204+i*11,heel+40+i*10,237+i*11,heel+22+i*13,paper,5)):'')+(strap?path('M190 240l55 30-16 24-55-28Z',p.accent,dark):'')+path(`M150 ${heel+35}Q220 320 286 307L328 332Q227 340 157 301Z`,p.accent)+((trail||cleat)?repeat(cleat?7:16,i=>rect(144+i*(w-12)/(cleat?7:16),384+sole-(i>8?8:0),cleat?13:10,cleat?15:7,dark,2)):'')+(p.has(/vent|mesh|perforat/)?repeat(35,i=>circle(302+(i%7)*14,309+Math.floor(i/7)*8,2.2,paper,{opacity:.7})):'')+(open?path('M196 288Q270 230 332 291L315 321Q262 280 208 323Z',p.accent,dark,3):'')}
 if(v===1){const w2=p.n('toe-box',112,158);return path(`M${320-w2/2} 407Q${223} 285 254 143Q320 85 386 143Q420 284 ${320+w2/2} 407Q320 450 ${320-w2/2} 407Z`,'#e6e5df',dark,3)+texture(p,path(`M${325-w2/2} 398Q244 286 265 151Q320 110 375 151Q394 284 ${315+w2/2} 398Q320 425 ${325-w2/2} 398Z`,p.c,dark,2))+ellipse(320,166,44,38,dark)+ellipse(320,162,34,27,'#9b9691')+rect(283,204,74,132,p.accent,22)+(lace?repeat(7,i=>line(282,222+i*14,357,212+i*15,paper,5)):'')+(strap?rect(251,243,138,31,p.accent,6):'')+path('M271 353Q321 337 370 353','none',paper,3)}
 if(v===2){return path('M242 112Q311 67 374 105Q421 160 399 264Q375 305 374 416Q320 467 266 417Q259 317 233 265Q207 172 242 112Z',dark)+path('M253 124Q311 86 363 118Q402 175 383 252Q359 309 360 403Q320 440 280 403Q276 310 249 258Q226 174 253 124Z',p.accent)+repeat(cleat?12:22,i=>cleat?circle(272+(i%3)*45,151+Math.floor(i/3)*75,11,steel):path(`M${250+(i%2)*67} ${143+Math.floor(i/2)*26}l25-12 22 12-22 12Z`,i%3===0?paper:dark))+line(319,133,319,408,p.c,7)}
 return group(shoe(p,0),'translate(-70,20) scale(.78)')+group(shoe(p,1),'translate(230,78) scale(.65)')+path('M122 474q69-102 146-35','none',p.accent,5)+repeat(3,i=>rect(107+i*62,467,48,11,p.c,6))
}

function apparel(p,v){
 const pants=p.has(/pants|trouser|legging|tights|shorts|jogger/),short=p.has(/shorts/),dress=p.has(/dress|skirt/),sleeveless=p.has(/tank|bra\b|vest|singlet/),long=p.has(/long|hoodie|jacket|sweatshirt|fleece|anorak|windbreaker|sweater|winter crew/),sock=p.has(/sock/),cap=p.has(/cap\b|beanie|hat\b/),glove=p.has(/glove/),w=p.n('garment-width',170,225),hem=p.n('hem',392,440),c=p.c
 if(cap){return v===0?path('M188 306Q191 144 330 156Q443 165 448 304L512 347Q468 390 350 331L195 330Z',c,dark,3)+path('M326 169Q344 249 342 320','none',paper,2)+ellipse(320,161,12,7,dark):v===1?path('M173 345Q172 143 320 147Q468 149 467 345H368Q366 282 320 282Q275 282 273 345Z',c,dark,3)+rect(280,325,84,27,p.accent,4)+repeat(7,i=>circle(291+i*10,338,2,paper)):texture(p,rect(165,160,310,240,c,24))+path('M180 340Q320 243 460 340','none',paper,6)+repeat(9,i=>line(203+i*29,170,213+i*26,267,p.accent,2))}
 if(sock)return path(v===1?'M238 116h164v263q-80 77-216 26l-36-44 93-83Z':'M215 115h142v177l112 67q36 48-19 74H214q-37-18-19-63l23-75Z',c,dark,3)+repeat(7,i=>line(227+i*15,128,227+i*15,210,p.accent,3))+path('M227 350q57 1 78 54','none',paper,6)
 if(glove)return path(`M228 257V147Q242 120 261 151L267 233V104Q284 72 300 108V228L311 87Q332 68 344 103V230L364 115Q387 96 399 128L393 273L433 235Q482 240 453 284L389 425H250L201 333Q171 267 228 257Z`,c,dark,3)+path(v===1?'M269 266v124m45-132v138m46-128v117':'M253 302q61 43 126 7', 'none',p.accent,7)
 let body
 if(pants)body=path(`M${320-w/2} 129H${320+w/2}L${345+w/2} ${short?350:463}H347L320 ${short?238:230}L290 ${short?350:463}H${295-w/2}Z`,c,dark,3)+line(320,143,320,225,p.accent,3)+line(320-w/2,163,320+w/2,163,p.accent,8)
 else if(dress)body=path(`M266 119H290Q320 147 350 119H374L363 238L438 ${hem}H202L278 238Z`,c,dark,3)
 else body=path(`M259 126L${long?183:176} 164L${long?135:137} ${long?421:231}L${long?175:192} ${long?436:265}L${320-w/2} 215V${hem}H${320+w/2}V215L${long?465:448} ${long?436:265}L${long?505:503} ${long?421:231}L${long?458:465} 164L380 126Q320 ${v===1?148:196} 259 126Z`,c,dark,3)
 if(sleeveless&&!pants)body=path(`M258 129H285Q320 200 355 129H383L374 225L${320+w/2} ${hem}H${320-w/2}L266 225Z`,c,dark,3)
 body=texture(p,body)
 const seams=path(pants?`M${320-w/2+13} 174L${305-w/2} ${short?340:451}M${320+w/2-13} 174L${335+w/2} ${short?340:451}`:`M${320-w/2+11} 222V${hem-14}H${320+w/2-11}V222`,'none',paper,1.8,{'stroke-dasharray':'4 4'})
 if(v===2)return group(body+seams,'translate(-120,-100) scale(1.4)')+path(`M205 327Q320 315 447 329L433 385Q319 363 217 386Z`,p.accent,dark,2)+repeat(17,i=>line(219+i*12,340,224+i*12,375,paper,1))
 if(v===1)return body+seams+(p.has(/hood|jacket/)?path('M264 125Q250 53 320 69Q389 53 376 125L320 209Z',p.accent,dark,2):rect(296,143,49,10,p.accent,2))+(pants?rect(230,179,58,70,p.accent,7)+rect(352,179,58,70,p.accent,7):p.has(/vent|mesh/)?path('M237 232h166v39H237Z',p.accent):'')
 return body+seams+(p.has(/zip|jacket|vest/)?line(320,149,320,hem-8,steel,5):'')+(p.has(/pocket|cargo|hoodie/)?rect(257,291,126,66,p.accent,12):'')+(p.has(/reflective|night/)?path(`M${320-w/2} 246h${w}`,'none',paper,8):'')
}

function consoleArt(p,v){
 const ds=p.has(/nintendo ds|nintendo dsi|ds lite/),portable=ds||p.has(/switch|handheld/),ps=p.has(/playstation|ps5|ps4|ps3/),slim=p.has(/slim|series s|one s/),digital=p.has(/digital/),c=colour(p.raw.color,ps||slim?'#e6e8e8':'#2b3037'),x=242,w=p.n('console-width',130,159),h=p.n('console-height',245,280)
 if(ds){if(v===1)return rect(172,142,296,218,c,28,{stroke:dark,'stroke-width':3})+rect(202,167,235,120,'#c4c8c8',15)+rect(256,305,116,25,dark,6)+circle(420,320,4,steel)+line(185,275,457,275,steel,5);return rect(173,84,294,170,c,19,{stroke:dark,'stroke-width':3})+rect(207,103,226,128,'url(#screen)',7)+rect(173,267,294,188,c,19,{stroke:dark,'stroke-width':3})+rect(228,285,181,142,'url(#screen)',5)+rect(187,251,266,19,steel,8)+line(189,339,215,339,dark,6)+line(202,326,202,352,dark,6)+repeat(4,i=>circle(433+Math.cos(i*Math.PI/2)*12,335+Math.sin(i*Math.PI/2)*12,4,dark))+(v===2?group(rect(120,115,220,165,c,14)+rect(153,140,157,110,'url(#screen)',4)+line(180,264,282,157,steel,8),'translate(145,210) scale(.7)'):'')}
 if(portable){if(v===1)return rect(119,172,402,215,c,33,{stroke:dark,'stroke-width':3})+rect(183,172,277,215,dark,7)+path('M216 207h92v152h-92Z','#454b50')+repeat(13,i=>line(338+i*7,193,338+i*7,210,steel,2))+rect(348,304,64,49,'#717a83',4);return rect(103,174,434,213,c,35,{stroke:dark,'stroke-width':3})+rect(158,183,324,194,dark,8)+rect(172,198,294,164,'url(#screen)',4)+circle(129,238,13,dark)+line(116,303,141,303,dark,5)+line(129,291,129,316,dark,5)+circle(510,306,13,dark)+repeat(4,i=>circle(510+Math.cos(i*Math.PI/2)*13,241+Math.sin(i*Math.PI/2)*13,4,dark))+(v===2?rect(207,392,218,19,dark,5)+rect(305,407,29,12,steel,2):'')}
 if(v===1)return rect(x,111,w,h,c,10,{stroke:dark,'stroke-width':3})+repeat(15,i=>line(x+17,140+i*8,x+w-17,140+i*8,steel,3))+rect(x+16,296,30,18,dark,2)+rect(x+55,296,36,18,dark,2)+circle(x+22,350,7,dark)+rect(x+55,340,40,17,dark,3)+repeat(4,i=>circle(x+13+(i%2)*(w-26),124+Math.floor(i/2)*(h-25),2,dark))
 if(v===2)return group(consoleArt(p,1),'translate(-141,-90) scale(1.45)')+rect(240,359,58,27,steel,4)+rect(322,359,81,27,steel,4)+line(269,386,269,443,dark,13)+line(362,386,407,431,dark,10)
 let body=ps&&p.has(/5|ps5/)?path(`M232 94Q245 246 220 421L284 432Q313 261 284 81Z`,c,dark,3)+path('M288 83H365V425H283Z',dark)+path('M368 88Q378 230 417 418L376 441Q340 244 368 88Z',c,dark,3):poly(`${x},118 ${x+w},106 ${x+w+37},128 ${x+w+37},410 ${x},422`,'#4b5560')+rect(x,118,w,h,c,9,{stroke:dark,'stroke-width':2})
 body+=slim?circle(x+w/2,202,47,dark)+repeat(18,i=>line(x+27+(i%6)*13,170+Math.floor(i/6)*22,x+27+(i%6)*13,180+Math.floor(i/6)*22,steel,3)):repeat(11,i=>line(x+12+i*9,129,x+12+i*9,145,dark,4));if(!digital)body+=rect(x+15,327,w-38,6,dark,2);body+=circle(x+w-19,370,6,ps?'#74aaf5':paper)
 return body+(v===3?group(controller(p,0),'translate(57,304) scale(.42)')+group(cable(p,0),'translate(282,340) scale(.3)'):'')
}

function controller(p,v){const symmetrical=p.has(/dualsense|dualshock|playstation|ps[345]/),c=colour(p.raw.color,p.has(/white/)?paper:'#3a434d'),w=p.n('grip-width',185,222),grip=p.n('grip-drop',384,418)
 if(v===1)return path(`M${320-w} 297Q141 180 242 189H395Q499 197 ${320+w} 303L497 ${grip}Q461 444 405 336H230Q175 443 145 ${grip}Z`,c,dark,3)+rect(245,221,150,78,p.accent,13)+line(250,279,389,279,dark,4)+repeat(p.has(/rear|paddle/)?4:2,i=>rect(233+i*53,317,33,51,dark,8))+repeat(4,i=>circle(189+(i%2)*263,237+Math.floor(i/2)*123,3,steel))
 if(v===2)return circle(301,281,122,c,{stroke:dark,'stroke-width':3})+circle(301,281,83,dark)+circle(301,273,65,p.accent)+repeat(36,i=>line(301+Math.cos(i*Math.PI/18)*52,273+Math.sin(i*Math.PI/18)*52,301+Math.cos(i*Math.PI/18)*61,273+Math.sin(i*Math.PI/18)*61,steel,2))+rect(187,421,62,31,c,9)+rect(276,421,62,31,c,9)+rect(365,421,62,31,c,9)
 return path(`M${320-w} 297Q141 180 242 189H395Q499 197 ${320+w} 303L497 ${grip}Q461 444 405 336H230Q175 443 145 ${grip}Z`,c,dark,3)+rect(245,210,150,62,p.accent,10)+circle(symmetrical?265:200,symmetrical?307:251,27,dark)+circle(376,307,27,dark)+circle(symmetrical?265:200,symmetrical?307:251,19,steel)+circle(376,307,19,steel)+line(symmetrical?181:247,symmetrical?270:310,symmetrical?226:292,symmetrical?270:310,paper,12)+line(symmetrical?203:269,symmetrical?248:288,symmetrical?203:269,symmetrical?292:332,paper,12)+repeat(4,i=>circle(438+Math.cos(i*Math.PI/2)*23,258+Math.sin(i*Math.PI/2)*23,8,['#6996ad','#bea868','#a65e64','#76a47d'][i]))
}
function arcade(p,v){return poly(v===1?'139,221 485,221 513,379 120,379':'138,252 466,221 520,381 116,405',p.c,{stroke:dark,'stroke-width':3})+rect(147,373,341,37,dark,8)+(v===1?rect(243,275,143,60,steel,5)+repeat(4,i=>circle(158+(i%2)*313,243+Math.floor(i/2)*98,5,dark)):line(226,293,226,175,steel,13)+circle(226,164,29,p.accent)+repeat(8,i=>ellipse(325+(i%4)*39,274+Math.floor(i/4)*40,13,9,i%2?dark:p.accent,{stroke:paper,'stroke-width':2})))+(v===2?group(circle(216,185,81,p.accent)+circle(216,185,60,dark),'translate(248,5) scale(.62)'):'')}
function wheel(p,v){if(v===1)return rect(222,176,191,153,p.c,24)+rect(269,142,94,69,dark,9)+path('M248 315v99h41v-63h76v63h41V315Z',steel,dark,3);return circle(310,259,143,dark)+circle(310,259,112,paper)+circle(310,259,41,p.c)+repeat(3,i=>line(310+Math.cos(i*Math.PI*2/3+.5)*39,259+Math.sin(i*Math.PI*2/3+.5)*39,310+Math.cos(i*Math.PI*2/3+.5)*124,259+Math.sin(i*Math.PI*2/3+.5)*124,p.c,23))+poly('417,368 552,368 575,470 393,470',dark)+rect(424,380,33,60,steel,9)+rect(489,380,43,72,steel,9)}
function headphones(p,v){const buds=p.has(/earbud|earphone/);if(buds)return rect(200,306,246,117,p.c,36)+ellipse(323,310,122,45,dark)+repeat(2,i=>group(ellipse(240+i*157,189,43,51,p.c)+rect(229+i*157,213,25,112,p.c,11)+ellipse(224+i*184,185,12,29,dark),v===1?`translate(640,0) scale(-1,1)`:undefined))+(v===2?circle(465,121,45,dark)+repeat(7,i=>circle(445+i%3*20,106+Math.floor(i/3)*16,4,steel)):'');return path('M174 302V233a145 145 0 01290 0v69','none',dark,30)+path('M174 248v-24a145 145 0 01290 0v24','none',p.c,19)+rect(145,258,89,163,p.c,39)+rect(407,258,89,163,p.c,39)+rect(v===1?178:144,273,28,129,dark,14)+rect(v===1?407:468,273,28,129,dark,14)+(p.has(/headset|microphone|boom/)?path('M446 409q-5 51-91 32','none',dark,12):'')+(v===2?circle(323,385,73,dark)+circle(323,385,48,steel)+repeat(20,i=>line(323+Math.cos(i)*34,385+Math.sin(i)*34,323+Math.cos(i)*46,385+Math.sin(i)*46,dark,2)):'')}
function keyboard(p,v){const compact=p.has(/compact|travel|mini|fold|keypad/),split=p.has(/split|ergonomic/),rows=5,cols=p.has(/numeric.*keypad/)?4:compact?12:17,w=cols*25+28,x=320-w/2
 if(v===1)return rect(x,175,w,219,p.c,14)+repeat(4,i=>rect(x+15+(i%2)*(w-66),190+Math.floor(i/2)*165,37,12,dark,3))+rect(270,241,100,56,steel,4)+repeat(4,i=>circle(x+15+(i%2)*(w-30),226+Math.floor(i/2)*141,3,dark))
 if(v===2)return repeat(5,i=>rect(168+i*57,262,46,46,p.c,6,{stroke:dark,'stroke-width':2}))+rect(285,151,60,60,p.c,6)+rect(296,174,39,45,steel,5)+rect(306,207,17,25,p.accent,3)+path('M304 244l13-11 14 11','none',dark,3)
 const keys=repeat(rows*cols,i=>{const r=Math.floor(i/cols),c=i%cols;return rect(x+14+c*25+(split&&c>cols/2?13:0),192+r*33,21,27,(r===4&&c>2&&c<8)?p.accent:paper,4,{stroke:steel,'stroke-width':1})})
 return rect(x,175,w+(split?13:0),194,p.c,14,{stroke:dark,'stroke-width':2})+keys+(p.has(/trackpad/)?rect(x+w-114,345,91,58,steel,4):'')
}
function mouse(p,v){const track=p.has(/trackball/),ergo=p.has(/ergonomic|vertical/),w=ergo?184:p.n('mouse-width',139,180)
 if(v===1)return ellipse(320,291,w*.65,162,dark)+repeat(2,i=>rect(320-w*.4,174+i*214,w*.8,27,steel,12))+rect(300,252,41,62,p.accent,5)+circle(320,282,12,'#df5560')
 return path(`M${320-w/2} 171Q321 117 ${320+w/2} 171L${320+w/2+20} 325Q320 475 ${320-w/2-20} 325Z`,p.c,dark,3)+line(320,156,320,260,dark,3)+rect(307,177,26,67,steel,12)+repeat(6,i=>line(311,185+i*8,329,185+i*8,dark,2))+(track?circle(355,281,55,p.accent):'')+(v===2?path('M241 283q79 33 165 0','none',paper,5)+repeat(12,i=>circle(251+i%4*13,298+Math.floor(i/4)*12,3,dark)):'')}
function display(p,v,laptop=false){const phone=p.has(/phone/),tablet=p.has(/tablet|reader|e-ink|e-paper/),w=phone?174:tablet?266:p.n('display-width',357,443),h=phone?306:tablet?322:p.n('display-height',238,279),x=320-w/2,y=phone?116:156
 if(v===1)return rect(x,y,w,h,p.c,15,{stroke:dark,'stroke-width':3})+(phone||tablet?circle(x+29,y+30,14,dark)+circle(x+59,y+30,12,dark):rect(292,y+h-71,57,77,dark,8)+repeat(8,i=>line(x+25+i*16,y+31,x+25+i*16,y+49,dark,4)))+(laptop?poly(`${x-19},${y+h} ${x+w+19},${y+h} ${x+w+48},${y+h+45} ${x-43},${y+h+45}`,steel):'')
 const screen=rect(x,y,w,h,dark,15)+rect(x+11,y+13,w-22,h-27,'url(#screen)',7)+path(`M${x+11} ${y+h-23}L${x+w*.35} ${y+h*.39}L${x+w*.64} ${y+h*.69}L${x+w-11} ${y+h*.29}V${y+h-23}Z`,p.accent)+circle(x+w*.7,y+h*.29,h*.12,'#f0d9ac')
 if(laptop)return screen+poly(`${x-19},${y+h} ${x+w+19},${y+h} ${x+w+48},${y+h+66} ${x-43},${y+h+66}`,steel,{stroke:dark,'stroke-width':2})+repeat(48,i=>rect(x+18+i%12*(w-36)/12,y+h+8+Math.floor(i/12)*8,(w-60)/12,5,dark,1))+rect(278,y+h+42,91,18,p.c,3)
 if(v===2)return group(screen,'translate(-62,-63) scale(1.2)')+rect(260,465,125,16,steel,4)+rect(280,480,19,18,dark,3)+rect(311,480,39,13,dark,3)
 return screen+((phone||tablet)?'':rect(299,y+h,43,69,steel,4)+ellipse(320,y+h+68,107,13,dark))
}
function camera(p,v){const lens=p.n('lens-radius',61,94),small=p.has(/webcam|action/),c=p.c
 if(p.has(/webcam/))return rect(155,171,331,153,c,39,{stroke:dark,'stroke-width':3})+(v===1?rect(242,222,161,29,dark,6)+rect(221,332,190,44,steel,12)+path('M320 245q-132 110 23 202','none',dark,9):circle(320,249,62,dark)+circle(320,249,44,steel)+circle(320,249,31,'url(#screen)')+repeat(9,i=>circle(186+i%3*11,224+Math.floor(i/3)*13,2,dark))+circle(450,244,7,'#75aa78'))+path('M240 324h165l42 98H208Z',c,dark,3)+(v===2?circle(320,249,48,'none',{stroke:paper,'stroke-width':3})+path('M225 369h204','none',steel,8):'')
 if(v===1)return rect(146,188,348,219,c,24,{stroke:dark,'stroke-width':3})+rect(175,215,222,159,'url(#screen)',5)+circle(443,247,24,dark)+repeat(4,i=>circle(443+Math.cos(i*Math.PI/2)*17,327+Math.sin(i*Math.PI/2)*17,6,steel))
 if(v===2)return circle(320,283,132,dark)+circle(320,283,108,steel)+circle(320,283,89,'url(#screen)')+repeat(10,i=>path(`M320 283L${320+Math.cos(i*.628)*85} ${283+Math.sin(i*.628)*85}L${320+Math.cos(i*.628+.6)*46} ${283+Math.sin(i*.628+.6)*46}Z`,i%2?p.accent:dark))+circle(345,248,23,'#fff',{opacity:.35})
 return rect(small?204:149,205,small?233:344,189,c,23,{stroke:dark,'stroke-width':3})+path('M237 210l20-53h110l23 53Z',c,dark,3)+circle(small?323:340,298,lens,dark)+circle(small?323:340,298,lens*.74,steel)+circle(small?323:340,298,lens*.59,'url(#screen)')+circle(360,281,17,paper,{opacity:.42})+rect(184,175,49,28,dark,7)+circle(451,234,9,p.accent)
}
function speaker(p,v){const mic=p.has(/microphone/),radio=p.has(/radio|clock|recorder/),h=p.n('speaker-height',220,306),w=p.n('speaker-width',145,208),x=320-w/2
 if(mic)return rect(260,113,118,224,steel,56)+repeat(21,i=>line(268,130+i*8,368,130+i*8,dark,2))+rect(279,289,80,81,p.c,8)+path('M244 241v76q74 105 149 0v-76','none',dark,9)+line(320,372,320,442,dark,12)+ellipse(320,443,99,17,p.c)
 if(p.has(/record player|turntable/))return poly('120,192 457,167 531,390 137,420',p.c,{stroke:dark,'stroke-width':3})+ellipse(298,281,130,91,dark)+repeat(8,i=>ellipse(298,281,34+i*11,22+i*8,'none',{stroke:'#657079','stroke-width':1}))+ellipse(298,281,31,21,p.accent)+path('M427 218l-26 105-78 38','none',steel,8)
 if(v===1)return rect(x,136,w,h,p.c,20,{stroke:dark,'stroke-width':3})+rect(x+26,176,w-52,56,steel,4)+rect(x+24,282,42,18,dark,3)+rect(x+84,282,39,18,dark,3)+line(x+25,359,x+w-25,359,dark,5)
 let body=rect(x,136,w,h,p.c,20,{stroke:dark,'stroke-width':3})+circle(320,136+h*.63,w*.37,dark)+circle(320,136+h*.63,w*.25,'#4a5259')+circle(320,136+h*.63,w*.12,p.accent)
 body+=radio?rect(x+21,159,w-42,49,dark,5)+text(p.has(/clock/)?'10:24':'FM',320,192,24,paper,{'text-anchor':'middle'}):circle(320,186,27,dark)
 if(v===2)body=group(body,'translate(-42,-41) scale(1.15)')+repeat(11,i=>line(213+i*18,185,213+i*18,380,steel,1))
 return body
}
function cable(p,v){
 const keeper=p.has(/keeper|organizer|organiser|wrap|management|ties/),hdmi=p.has(/hdmi/),usb=p.has(/usb/),adapter=p.has(/adapter|adaptor|hub|reader|charger|charging kit/),count=p.has(/four|4.port/)?4:p.has(/dual|two/)?2:3
 if(keeper)return rect(176,190,287,219,p.c,20)+repeat(count+2,i=>path(`M${201+i*43} 212v96q20 38 0 69`, 'none',dark,12))+repeat(3,i=>rect(176,225+i*62,287,19,p.accent,4))+(v===1?rect(201,319,237,81,p.accent,10)+line(216,334,421,334,steel,4):'')
 const plug=(x,y,rotate=0)=>group(rect(x,y,68,46,p.c,7)+rect(x+hdmi*3,y-26,hdmi?61:34,26,steel,3)+rect(x+8,y-20,hdmi?45:18,8,dark,2),`rotate(${rotate} ${x+34} ${y+15})`)
 if(adapter)return rect(205,205,228,145,p.c,20,{stroke:dark,'stroke-width':3})+repeat(count,i=>rect(227+i*61,244,41,17,dark,3))+(p.has(/ac |wall|charging kit/)?line(251,205,251,159,steel,12)+line(381,205,381,159,steel,12):'')+path('M433 278q93-53 67 87q-58 88-148 35','none',dark,12)+plug(295,389,90)+(v===2?group(plug(206,128),'translate(-97,-76) scale(1.45)'):'')
 if(v===1)return path('M190 195c181-133 414 139 188 184c-189 36-252-140-46-137c159 0 166 95 39 107','none',p.c,13)+plug(157,171,-25)+plug(323,342,90)
 return path(v===2?'M158 424q158-57 143-226':'M191 214q-103 266 150 179t16-193','none',p.c,13)+plug(v===2?270:156,v===2?139:178)+plug(v===2?124:324,v===2?407:164,90)
}

function beauty(p,v){
 const jar=p.shape==='jar'||p.has(/cream|balm|scrub|powder|mask|butter/)&&!p.has(/tube|eye cream|sheet/),drop=p.shape==='dropper'||p.has(/serum|essence oil|cuticle|facial oil/),pump=p.shape==='pump'||p.has(/shampoo|handwash|hand wash|bodywash|body wash|cleanser|foundation/),spray=p.shape==='spray'||p.has(/mist|spray|perfume|fragrance|cologne/),packet=p.shape==='packet'||p.has(/sheet mask/),wand=p.has(/gloss|mascara|concealer|lip oil/),tube=p.shape==='tube'||p.has(/tube|gloss|mascara|concealer|primer|conditioner|lip oil|oil roller/),width=jar?p.n('jar-width',192,256):wand?p.n('wand-width',77,112):p.n('bottle-width',122,162),height=jar?p.n('jar-height',120,171):p.n('bottle-height',237,305),x=320-width/2,y=jar?255:161,top=y-(drop?70:pump?38:35)
 const ingredients=/aloe|green tea|cucumber|오이|알로에/.test(p.full)?'#628773':/rose|lavender|로즈|라벤더/.test(p.full)?'#a87897':/oat|rice|shea|coconut|오트|쌀겨|코코넛/.test(p.full)?'#d6c5a1':/argan|jojoba|apricot|아르간|호호바/.test(p.full)?'#bfa06a':p.accent
 const swatch=path(`M${199+p.n('swatch',0,35)} 333Q214 280 335 278Q440 276 461 324Q474 371 366 399Q252 427 196 393Q171 372 ${199+p.n('swatch',0,35)} 333Z`,ingredients,undefined,0,{opacity:p.has(/gel|oil|water|liquid/)?'.7':1})+repeat(p.has(/scrub|powder|mineral|pearl/)?40:8,i=>circle(224+p.n(`grain-x${i}`,0,206),308+p.n(`grain-y${i}`,0,68),p.n(`grain-r${i}`,1,4),paper,{opacity:.55}))
 if(packet){if(v===2)return path('M226 143Q320 92 413 143L440 314Q397 447 320 453Q244 448 199 314Z',paper,steel,3)+ellipse(267,228,26,14,p.c)+ellipse(376,228,26,14,p.c)+path('M308 258l-11 51h43','none',steel,4)+ellipse(320,354,47,13,p.c);return rect(203,141,233,314,ingredients,12)+repeat(16,i=>line(210+i*14,147,210+i*14,160,paper,2))+label(p,239,247,160)+(v===1?repeat(12,i=>line(238,184+i*17,400-p.n(i,0,55),184+i*17,paper,2)):'')}
 if(v===2)return swatch+group(drop?rect(302,106,37,76,dark,8)+rect(315,179,12,99,steel,5)+path('M320 287q-22 28 0 33q21-7 0-33',ingredients):wand?rect(284,103,67,68,p.c,6)+line(319,171,319,253,steel,8)+path('M305 243q37 0 17 43l-13-4Z',ingredients):spray?rect(299,107,61,78,steel,7)+circle(306,138,8,dark)+repeat(16,i=>circle(225-p.n(`mistx${i}`,0,84),141+p.n(`misty${i}`,-55,55),p.n(`mistr${i}`,1.5,3),ingredients)):rect(298,118,90,75,p.c,10)+path('M320 191q-22 37-62 26','none',ingredients,15),'translate(20,0)')
 let body
 if(jar)body=rect(x,y,width,height,'url(#finish)',25,{stroke:steel,'stroke-width':2})+ellipse(320,y,width/2,26,ingredients)+rect(x-5,y-26,width+10,32,p.c,9)+label(p,x+16,y+45,width-32)
 else if(wand)body=rect(x,y+91,width,height-72,'url(#glass)',12,{stroke:steel,'stroke-width':2})+rect(x-2,y,width+4,103,p.accent,9)+rect(x+width*.43,y+99,width*.14,height*.4,steel,4)+label(p,x+7,y+height*.62,width-14)
 else if(tube)body=path(`M${x-8} ${y}H${x+width+8}L${x+width-14} ${y+height}H${x+14}Z`,'url(#finish)',steel,2)+rect(x+12,y+height-9,width-24,31,p.accent,5)+line(x-2,y+12,x+width+2,y+12,p.accent,3)+label(p,x+7,y+height*.37,width-14)
 else body=rect(x,y,width,height,p.material==='glass'?'url(#glass)':'url(#finish)',25,{stroke:steel,'stroke-width':2})+rect(x+width*.24,y-31,width*.52,38,steel,5)+(drop?path(`M${x+width*.25} ${y-25}v-27q${width*.25}-57 ${width*.5} 0v27Z`,dark):pump?path(`M${x+width*.43} ${y-31}v-29h${width*.64}v15h-${width*.39}v14Z`,p.accent):spray?rect(x+width*.3,y-63,width*.4,40,steel,4)+circle(x+width*.39,y-47,5,dark):rect(x+width*.19,y-43,width*.62,25,p.accent,5))+label(p,x+9,y+height*.34,width-18)
 if(v===1)return (jar?rect(x,y+12,width,height,p.c,25)+ellipse(320,y+12,width/2,26,ingredients)+path(`M${x+28} ${y+9}q${width*.34}-21 ${width*.68} 0`,'none',paper,8)+group(rect(x-5,y-26,width+10,32,p.c,9),`translate(-66,-112) rotate(-19 320 200)`):body.replace(label(p,x+9,y+height*.34,width-18),''))+repeat(9,i=>line(x+19,y+58+i*13,x+width-19-p.n(i,0,15),y+58+i*13,p.accent,2))
 return body+(v===3?group(swatch,'translate(171,250) scale(.48)')+rect(161,359,67,114,paper,3,{stroke:steel,'stroke-width':2}):'')
}
function palette(p,v){const loose=p.has(/loose/),multi=p.has(/palette/),count=multi?Math.floor(p.n('pans',4,13)):1,cols=count>4?4:2,compact=p.n('compact-width',225,295),x=320-compact/2,c=p.c
 if(v===1)return rect(x,176,compact,233,dark,20)+rect(x+25,224,compact-50,133,p.c,5)+label(p,x+40,253,compact-80)+repeat(4,i=>circle(x+15+(i%2)*(compact-30),195+Math.floor(i/2)*191,3,steel))
 if(v===2)return repeat(Math.min(8,count+2),i=>path(`M${148+i*44} ${235+p.n(`swatchy${i}`,-29,29)}q18-59 37 0l-3 135q-22 51-37 0Z`,`hsl(${(p.h%60)+i*13} ${p.has(/shimmer|pearl/)?28:23}% ${35+i*5}%)`))+repeat(p.has(/shimmer|pearl/)?28:0,i=>circle(p.n(`sparkx${i}`,158,454),p.n(`sparky${i}`,222,371),1.7,paper))
 return rect(x,259,compact,179,dark,18)+rect(x,93,compact,166,dark,18)+rect(x+13,105,compact-26,140,'url(#glass)',7)+path(`M${x+27} 224l${compact-68}-102`,'none',paper,13,{opacity:.55})+(loose?ellipse(320,343,compact*.37,62,c)+repeat(38,i=>circle(p.n(`powderx${i}`,235,406),p.n(`powdery${i}`,310,377),2,p.accent)):repeat(count,i=>{const size=count===1?104:Math.min(59,(compact-42)/cols);return rect(count===1?268:x+17+(i%cols)*(size+10),count===1?288:278+Math.floor(i/cols)*(size+7),size,size,`hsl(${(p.h%60)+i*15} 25% ${35+i*4}%)`,6,{stroke:steel,'stroke-width':2})}))
}
function lipstick(p,v){const c=p.c,height=p.n('lip-height',101,159);if(v===2)return path(`M198 246q69-107 200-51q89 29 28 110q-84 104-221 51q-65-29-7-110Z`,c)+repeat(8,i=>path(`M${222+i*19} 254q-29 64-13 94`,'none',paper,2,{opacity:.2}));return rect(258,279,124,173,dark,10)+rect(267,224,106,70,steel,5)+path(`M277 231V${226-height}Q327 ${198-height} 363 ${243-height}V231Z`,c,dark,1)+rect(v===1?399:164,v===1?180:285,111,169,p.accent,12)+rect(v===1?404:169,v===1?315:420,101,13,steel,2)+(v===1?rect(281,364,78,51,p.accent,3):'')}
function pencil(p,v){const felt=p.has(/felt|brush-tip|liquid/),c=p.c,w=p.n('pencil-width',20,33);return group(rect(291,128,w,297,p.accent,4)+path(`M291 128l${w/2}-${felt?81:57} ${w/2} ${felt?81:57}Z`,felt?dark:'#c7a582')+path(`M${291+w*.28} ${128-(felt?55:34)}l${w*.22}-${felt?27:23} ${w*.22} ${felt?27:23}Z`,c)+rect(346,217,w+7,198,p.accent,5)+rect(291,399,w,22,steel,2),v===1?'rotate(145 320 280)':v===2?'translate(-130,-120) scale(1.6)':'rotate(22 320 280)')}
function brush(p,v){const clean=p.has(/clean|dust|scrub|toilet|drain|청소|브러시 세트/),fan=p.has(/fan brush/),comb=p.has(/comb/),w=p.n('bristle-width',clean?98:51,clean?150:89),head=p.n('bristle-height',70,115)
 if(comb)return rect(180,217,290,39,p.c,12)+repeat(23,i=>rect(189+i*12,247,6,110+p.n(`tooth${i}`,-10,10),p.c,2))
 let body=rect(302,272,37,184,p.c,14)+rect(293,232,55,84,steel,6)+path(fan?`M294 238L${320-w} 119Q320 68 ${320+w} 119L347 238Z`:`M${320-w/2} 237V${237-head}Q320 ${200-head} ${320+w/2} ${237-head}V237Z`,clean?'#748480':'#806757')+repeat(18,i=>line(320-w/2+i*w/18,217,320-w/2+i*w/18,141+p.n(`bristle${i}`,-9,7),'#d1baa0',1.5))
 if(v===1)body=rect(320-w/2,143,w,122,p.c,22)+rect(298,259,45,180,p.c,15)+circle(320,405,8,dark)
 if(v===2)body=group(body,'translate(-125,-80) scale(1.4)')+repeat(9,i=>line(160+i*35,430,170+i*32,376+p.n(i,-17,13),'#b09b7a',7))
 return body
}
function bag(p,v){const backpack=p.has(/backpack|rucksack/),duffel=p.has(/duffel|duffle|gym|swimming|sport.*bag/),wallet=p.has(/wallet|card case/),hard=p.has(/hard|trunk|molded/),w=p.n('bag-width',230,310),h=backpack?p.n('bag-height',270,325):p.n('bag-height',165,221),x=320-w/2,y=182,slots=p.has(/twelve|12/)?12:p.has(/twenty-four|24/)?24:p.has(/eight|8/)?8:6
 if(v===1)return texture(p,rect(x,y,w,h,p.c,hard?21:36,{stroke:dark,'stroke-width':3}))+(backpack?path(`M${x+31} ${y+10}q-58 94 0 ${h-20}M${x+w-31} ${y+10}q58 94 0 ${h-20}`,'none',p.accent,22):rect(x+19,y+h*.4,w-38,68,p.accent,9))+line(x+25,y+23,x+w-25,y+23,steel,3)
 if(v===2)return rect(x,y-22,w,h+50,p.c,22,{stroke:dark,'stroke-width':3})+rect(x+13,y-8,w-26,h+23,dark,17)+(p.has(/game card|disc|wallet/)?repeat(slots,i=>rect(x+25+i%6*(w-49)/6,y+20+Math.floor(i/6)*38,(w-75)/6,27,p.accent,4)):rect(x+27,y+20,w*.56,h-15,p.accent,12)+rect(x+w*.68,y+20,w*.19,h*.35,p.accent,7)+rect(x+w*.68,y+h*.51,w*.19,h*.35,p.accent,7))+line(x+12,y-4,x+w-12,y-4,steel,4)
 return texture(p,rect(x,y,w,h,p.c,hard?21:36,{stroke:dark,'stroke-width':3}))+path(`M${x+w*.3} ${y}v-53q${w*.2}-31 ${w*.4} 0v53`,'none',p.accent,14)+rect(x+21,y+h*.47,w-42,h*.4,p.accent,13)+line(x+34,y+h*.52,x+w-34,y+h*.52,steel,3)+rect(x+w-62,y+h*.48,10,26,steel,3)+(duffel?line(x+w*.3,y+2,x+w*.3,y+h,p.accent,13)+line(x+w*.7,y+2,x+w*.7,y+h,p.accent,13):'')+(wallet?rect(x+w*.55,y+h*.5,w*.45,35,dark,5):'')
}
function textile(p,v){const pillow=p.has(/pillow|cushion|방석|베개|쿠션/),roll=p.has(/yoga mat|rolled|foam.*mat/),neck=p.has(/neck.*(?:pillow|support)|경추/),rug=p.has(/rug|mat/),w=p.n('textile-width',282,391),h=p.n('textile-height',pillow?182:231,pillow?235:302),x=320-w/2,y=174
 if(p.has(/neck warmer|neck wrap|gaiter|snood/))return texture(p,path(`M208 177q113-58 227 0v241q-113 39-227 0Z`,p.c,dark,3))+ellipse(320,177,113,37,p.accent)+ellipse(320,179,88,22,dark)+path(v===1?'M238 210v189':'M213 376q104 22 216-5','none',paper,2,{'stroke-dasharray':'4 4'})+(v===2?path('M279 225q64-22 104 13l-13 112-90-9Z',p.accent,dark,2)+repeat(11,i=>line(291+i*7,243,288+i*7,325,paper,2)):'')
 if(neck)return path('M181 221Q196 106 320 117Q444 104 460 221L437 374Q422 449 348 422L342 318Q340 268 319 267Q296 268 294 318L287 422Q215 449 200 374Z',p.c,dark,3)+path('M211 231Q224 151 320 150Q411 151 432 231','none',paper,3)
 if(roll)return poly('173,183 414,144 489,360 230,422',p.c)+ellipse(175,182,64,37,p.accent)+ellipse(174,182,42,24,p.c)+ellipse(174,182,21,11,p.accent)+repeat(12,i=>line(220+i*17,208-i*3,251+i*17,382-i*4,p.accent,2))
 const outline=pillow?path(`M${x} ${y}Q320 ${y-25} ${x+w} ${y}Q${x+w-22} 290 ${x+w} ${y+h}Q320 ${y+h-20} ${x} ${y+h}Q${x+20} 280 ${x} ${y}Z`,p.c,dark,2):path(`M${x} ${y}L${x+w} ${y-15}L${x+w+23} ${y+h}L${x-20} ${y+h+13}Z`,p.c,dark,2)
 let body=texture(p,outline)+path(`M${x+15} ${y+17}L${x+w-15} ${y+6}L${x+w+5} ${y+h-18}L${x-1} ${y+h-7}Z`,'none',paper,2,{'stroke-dasharray':'4 3'})
 if(p.has(/quilt|weighted|누빔/))body+=repeat(6,i=>line(x+20+i*(w-40)/5,y+20,x+20+i*(w-40)/5,y+h-15,p.accent,3))+repeat(5,i=>line(x+10,y+32+i*(h-60)/4,x+w-10,y+22+i*(h-60)/4,p.accent,3))
 if(v===1)body+=path(`M${x+35} ${y+h*.55}L${x+w-35} ${y+h*.5}`,'none',steel,7)+rect(x+w-69,y+h*.5-8,15,21,dark,3)
 if(v===2)return group(body,'translate(-220,-185) scale(1.7)')+path('M215 410q99-133 235-64l-28 106Z',p.accent,dark,3)+repeat(18,i=>line(230+i*12,408-i*2,231+i*12,431-i*1.8,paper,2))
 if(rug||p.has(/fringe|throw|waffle/))body+=repeat(25,i=>line(x+i*w/25,y+h+8,x-4+i*w/25,y+h+26,p.accent,2))
 return body
}
function curtain(p,v){const w=p.n('curtain-width',150,183),count=p.has(/single|one panel/)?1:2,blackout=p.has(/blackout|opaque|thermal|빛차단/);if(p.has(/blind|sunshade|가리개/))return rect(157,134,326,31,steel,9)+texture(p,rect(167,165,306,v===1?228:279,v===1&&blackout?'#444c51':p.c,3))+rect(161,v===1?390:439,319,15,steel,5)+line(482,158,482,394,dark,3)+ellipse(482,399,12,34,'none',{stroke:steel,'stroke-width':4})+(v===2?rect(174,207,163,98,p.accent,7)+repeat(9,i=>line(182+i*17,219,182+i*17,293,paper,2)):'');let body=line(112,125,529,125,dark,9)+repeat(count,i=>{const x=count===1?230:136+i*209;return texture(p,path(`M${x} 137H${x+w}V454Q${x+w*.74} 432 ${x+w*.5} 454Q${x+w*.25} 433 ${x} 454Z`,v===1&&blackout?'#424b52':p.c,dark,2))+repeat(6,j=>line(x+15+j*(w-30)/5,151,x+9+j*(w-16)/5,442,p.accent,3))+repeat(6,j=>circle(x+15+j*(w-30)/5,137,6,steel))});return v===2?group(body,'translate(-179,-101) scale(1.45)')+path('M338 254q98 46 96 174l-79-20Z',blackout?'#424b52':paper,dark,2):body}
function furniturePanel(p,x,y,w,h){return texture(p,rect(x,y,w,h,p.c,3,{stroke:dark,'stroke-width':2}))}
function chair(p,v){const sofa=p.has(/sofa|settee/),stool=p.has(/stool|footstool/),armless=p.has(/armless|stool|dining/),office=p.has(/office|task chair|swivel/),rock=p.has(/rocking|rocker/),width=sofa?p.n('seat-width',345,401):p.n('seat-width',210,266),x=320-width/2,back=stool?285:p.n('back-height',109,186),seat=318
 if(v===2)return furniturePanel(p,165,174,296,87)+path('M186 262l42 146h42l-34-146M389 262l-33 146h40l42-146',p.accent,dark,3)+circle(218,249,11,steel)+circle(409,249,11,steel)+repeat(6,i=>line(188+i*42,190,188+i*42,241,paper,2))
 let body=stool?'':furniturePanel(p,x+14,back,width-28,seat-back+9);body+=furniturePanel(p,x,seat,width,59)
 if(v===1)body+=(stool?'':line(x+31,back+10,x+31,421,dark,11)+line(x+width-31,back+10,x+width-31,421,dark,11))+line(x+26,302,x+width-26,302,dark,9)
 else body+=(stool?'':texture(p,rect(x+30,back+13,width-60,seat-back-12,p.accent,18)))+(sofa?line(320,back+20,320,367,paper,3):'')+(!armless?rect(x-15,256,39,108,p.c,15)+rect(x+width-23,256,39,108,p.c,15):'')
 if(office)body+=line(320,377,320,437,steel,16)+repeat(5,i=>line(320,437,320+Math.cos(i*1.26)*115,437+Math.sin(i*1.26)*25,dark,9))+repeat(5,i=>circle(320+Math.cos(i*1.26)*115,437+Math.sin(i*1.26)*25,10,dark))
 else body+=line(x+26,377,x+16,442,dark,12)+line(x+width-26,377,x+width-16,442,dark,12)+(rock?path(`M${x-23} 427q${width/2} 79 ${width+46} 0`,'none',p.accent,12):'')
 return body
}
function tableArt(p,v){const round=p.has(/round|circular/),trestle=p.has(/trestle/),fold=p.has(/fold|drop-leaf|hinge/),draw=p.has(/drawer/),cshape=p.has(/c-shaped|over-sofa/),w=p.n('table-width',337,423),x=320-w/2,h=p.n('table-height',190,245),y=218
 const top=round?ellipse(320,y,w/2,60,p.material==='glass'?'url(#glass)':p.c,{stroke:dark,'stroke-width':2}):poly(`${x},${y-33} ${x+w-34},${y-64} ${x+w+25},${y+27} ${x+21},${y+63}`,p.material==='glass'?'url(#glass)':p.c,{stroke:dark,'stroke-width':3})
 let legs=cshape?path(`M${x+33} ${y+41}v${h-28}h${w-31}v-24H${x+60}V${y+46}Z`,dark):trestle?repeat(2,i=>path(`M${x+50+i*(w-95)} ${y+35}l-40 ${h}h29l22-${h*.7} 30 ${h*.7}h31l-47-${h}Z`,p.accent,dark,2)):repeat(2,i=>path(`M${x+45+i*(w-102)} ${y+34}v${h}h22V${y+34}Z`,p.accent,dark,2))
 if(v===2)return poly('156,156 428,137 497,362 190,389',p.c,{stroke:dark,'stroke-width':3})+line(178,209,451,188,steel,11)+line(192,324,478,302,steel,11)+repeat(4,i=>circle(193+(i%2)*231,202+Math.floor(i/2)*111,7,dark))+(fold?rect(291,226,62,78,steel,5):rect(277,227,93,95,p.accent,3))
 return legs+texture(p,top)+(draw?rect(x+47,y+57,w-95,51,p.accent,5)+line(294,y+84,346,y+84,steel,6):'')+(v===1?line(x+60,y+84,x+w-45,y+h-12,dark,7):'')+(fold?line(x+w*.62,y-48,x+w*.65,y+43,steel,3):'')
}
function shelf(p,v){const cabinet=p.has(/cabinet|wardrobe|dresser|drawer/),low=p.has(/under|low|bench|desktop|bookend/),w=p.n('shelf-width',221,326),h=low?p.n('shelf-height',126,198):p.n('shelf-height',279,333),x=320-w/2,y=140,rows=p.has(/three|3-tier|3단/)?3:p.has(/four|4-tier/)?4:Math.max(2,p.count),cols=p.has(/cube|cubey|divider|modular/)?2:1
 if(p.has(/bookend/))return repeat(2,i=>path(`M${179+i*172} 171h39v216h85v29H${179+i*172}Z`,p.c,dark,3))+repeat(5,i=>line(188+i*9,397,188+i*9,411,p.accent,1))
 if(v===2)return furniturePanel(p,153,181,311,57)+furniturePanel(p,153,180,36,229)+repeat(5,i=>circle(169,257+i*23,3,dark))+rect(185,248,21,17,steel,3)+circle(175,209,9,steel)+line(169,326,271,326,p.accent,8)
 const shell=furniturePanel(p,x,y,w,h)+rect(x+13,y+13,w-26,h-26,v===1?p.accent:'#f0ece2',2)
 if(v===1)return shell+path(`M${x+17} ${y+17}l${w-34} ${h-34}m0-${h-34}L${x+17} ${y+h-17}`,'none',steel,3)
 return shell+repeat(rows-1,i=>furniturePanel(p,x+13,y+(i+1)*h/rows,w-26,12))+(cols>1?furniturePanel(p,315,y+13,13,h-26):'')+(cabinet?repeat(p.has(/drawer/)?rows:cols+1,i=>{const count=p.has(/drawer/)?rows:cols+1;return p.has(/drawer/)?furniturePanel(p,x+19,y+18+i*(h-35)/count,w-38,(h-42)/count-8)+line(301,y+39+i*(h-35)/count,340,y+39+i*(h-35)/count,dark,5):furniturePanel(p,x+18+i*(w-34)/count,y+17,(w-37)/count-5,h-34)+line(x+43+i*(w-34)/count,y+h*.47,x+43+i*(w-34)/count,y+h*.59,dark,5)}):'')
}
function bed(p,v){const pet=p.has(/pet|cat|dog|small animal|cushion|cuddler/),crib=p.has(/crib|cot/),width=p.n('bed-width',297,382),x=320-width/2
 if(pet)return ellipse(320,318,width/2,111,p.c)+ellipse(320,309,width/2-31,81,p.accent)+texture(p,ellipse(320,315,width/2-62,53,p.c))+(v===1?ellipse(320,323,width/2-29,84,dark)+repeat(40,i=>circle(210+p.n(`dotx${i}`,0,220),273+p.n(`doty${i}`,0,100),2,steel)):'')+(v===2?path('M227 302q91-53 188 0','none',paper,5):'')
 const frame=poly(`${x},227 ${x+width-24},202 ${x+width+43},370 ${x+32},410`,p.c,{stroke:dark,'stroke-width':3})+rect(x,152,width-23,83,p.accent,7)+path(`M${x+32} 408v40m${width-3}-77v58M${x} 228v185`,'none',dark,13)
 return frame+(v===1?repeat(11,i=>line(x+20+i*(width-28)/11,242,x+44+i*(width-28)/11,374,steel,14)):poly(`${x+13},233 ${x+width-28},217 ${x+width+28},355 ${x+39},389`,paper)+texture(p,poly(`${x+26},281 ${x+width-7},260 ${x+width+27},355 ${x+39},389`,p.accent))+rect(x+31,237,(width-80)/2,52,paper,16)+rect(x+width/2,231,(width-80)/2,52,paper,16))+(crib?repeat(13,i=>line(x+35+i*(width-8)/13,289,x+35+i*(width-8)/13,403,p.accent,8)):'' )
}
function lamp(p,v){const floor=p.has(/floor|tall/),task=p.has(/task|adjustable|hinged|reading|magnifier/),lantern=p.has(/lantern|camping/),w=p.n('shade-width',141,212),h=p.n('shade-height',103,162)
 if(lantern)return rect(233,181,174,229,p.c,23)+rect(250,213,140,155,'#f4e5b8',12)+repeat(5,i=>line(253+i*33,207,253+i*33,374,dark,6))+path('M251 181v-40q70-70 139 0v40','none',dark,13)+ellipse(320,414,105,15,dark)
 if(v===1&&task)return line(312,417,218,285,steel,18)+line(218,285,380,161,steel,15)+circle(218,285,20,dark)+ellipse(367,177,70,42,p.accent)+ellipse(320,439,106,21,p.c)
 if(v===2)return ellipse(320,272,w/2+47,87,p.c)+ellipse(320,272,w/2+30,71,'#f3e6bd')+circle(320,273,30,paper)+rect(303,286,34,51,steel,8)+repeat(8,i=>line(307,293+i*5,333,293+i*5,dark,1.5))
 return ellipse(320,442,108,18,p.c)+line(320,438,320,floor?154:262,steel,11)+(task?line(320,261,408,185,dark,13)+ellipse(399,192,84,41,p.c):texture(p,path(`M${320-w*.38} ${floor?126:177}H${320+w*.38}L${320+w*.6} ${floor?126+h:177+h}H${320-w*.6}Z`,p.c,dark,3)))
}
function mirrorArt(p,v){const round=p.has(/round|oval|circular/),w=p.n('frame-width',221,318),h=p.n('frame-height',251,331),x=320-w/2,y=135;if(p.has(/cork|message board|memo board|noticeboard|메모 보드/))return texture(p,rect(x,y,w,h,p.c,8,{stroke:dark,'stroke-width':3}))+rect(x+17,y+17,w-34,h-34,v===1?'#997e58':'#bea071',3)+repeat(70,i=>circle(x+27+p.n('corkx'+i,0,w-57),y+28+p.n('corky'+i,0,h-60),p.n('corkr'+i,1,3),'#766442',{opacity:.45}))+(v===1?path(`M${x+44} ${y+77}l${w/2-44}-30 ${w/2-44} 30`,'none',steel,4):rect(x+39,y+48,w-85,106,paper,1)+circle(x+w/2,y+51,8,p.accent))+(v===2?rect(238,320,88,79,steel,5)+circle(283,356,13,dark):'');if(v===1)return rect(x,y,w,h,p.c,round?110:7,{stroke:dark,'stroke-width':3})+path(`M${x+39} ${y+51}l${w/2-39}-20 ${w/2-39} 20`,'none',steel,4)+repeat(8,i=>rect(x+(i%2)*(w-10),y+37+Math.floor(i/2)*(h-74)/3,10,19,dark,2));return texture(p,rect(x,y,w,h,p.c,round?110:7))+rect(x+17,y+17,w-34,h-34,'url(#glass)',round?95:2)+path(`M${x+31} ${y+h-59}l${w-89}-${h-112}m-${w-109} ${h-68}l${w-80}-${h-116}`,'none',paper,13,{opacity:.55})+(v===2?group(path('M150 161h104v97h-30v-68h-74Z',p.c,dark,2),'translate(299,235)'):'')}
function basket(p,v){const mesh=p.has(/mesh|woven|rattan|seagrass|바구니/),lid=p.has(/lid|closed|lidded|뚜껑/),w=p.n('basket-width',238,338),h=p.n('basket-height',175,238),x=320-w/2,y=196,div=p.has(/three|3칸/)?3:p.has(/divid|sort|compartment/)?2:1
 if(p.has(/stackable|stacking|nesting/)&&p.has(/bins|box|containers|pack|set/))return repeat(Math.max(2,Math.min(4,p.count)),i=>{const bx=176+i*24,by=191+i*67,bw=260-i*10;return poly(`${bx},${by} ${bx+bw},${by} ${bx+bw-15},${by+94} ${bx+15},${by+94}`,p.c,{stroke:dark,'stroke-width':3})+ellipse(bx+bw/2,by,bw/2,27,p.accent)+ellipse(bx+bw/2,by,bw/2-12,17,v===1?dark:paper)+rect(bx+bw/2-43,by+39,86,20,p.accent,7)+(v===2?repeat(5,j=>line(bx+24+j*44,by+29,bx+28+j*42,by+82,paper,2)):'')})
 if(v===2)return texture(p,poly(`${x},${y} ${x+w},${y} ${x+w-31},${y+h} ${x+29},${y+h}`,p.c,{stroke:dark,'stroke-width':3}))+ellipse(320,y,w/2,47,dark)+ellipse(320,y,w/2-13,34,p.accent)+repeat(div-1,i=>line(x+(i+1)*w/div,y-29,x+(i+1)*w/div,y+26,steel,5))
 let body=texture(p,poly(`${x},${y} ${x+w},${y} ${x+w-31},${y+h} ${x+29},${y+h}`,p.c,{stroke:dark,'stroke-width':3}))+ellipse(320,y,w/2,27,p.accent)+(mesh?repeat(13,i=>line(x+16+i*(w-32)/12,y+18,x+39+i*(w-78)/12,y+h-13,paper,3))+repeat(7,i=>path(`M${x+14} ${y+23+i*25}q${w/2} 22 ${w-28} 0`,'none',p.accent,7)):'')
 if(lid)body+=rect(x-9,y-25,w+18,31,p.c,8)+rect(291,y-42,62,19,dark,6)
 else body+=path(`M${x+47} ${y+2}v-52q${w*.35}-43 ${w*.66} 0v52`,'none',p.accent,13)
 if(v===1)body+=rect(x+56,y+87,w-112,48,p.accent,6)+rect(x+76,y+104,w-152,13,dark,4)
 return body
}
function pan(p,v){const handle=p.has(/pan|skillet|saucepan|wok|그릴팬|소스팬/)&&!p.has(/muffin|cake|baking|pie|sheet/),muffin=p.has(/muffin|madeleine|tartlet|6구/),flat=p.has(/sheet|tray|pizza|grill|griddle/),loaf=p.has(/loaf|bread/),round=!p.has(/square|rectangular|loaf|sheet|tray|muffin/),w=p.n('pan-width',251,322),h=flat?38:p.n('pan-height',92,137),x=320-w/2,y=244
 if(muffin)return rect(144,161,352,264,p.c,12,{stroke:dark,'stroke-width':3})+repeat(6,i=>ellipse(204+i%3*114,231+Math.floor(i/3)*122,44,39,v===1?p.c:dark,{stroke:steel,'stroke-width':3}))+repeat(6,i=>ellipse(204+i%3*114,231+Math.floor(i/3)*122,31,26,p.accent))
 if(v===1)return (round?ellipse(320,286,w/2,117,p.c,{stroke:dark,'stroke-width':4}):rect(x,181,w,212,p.c,15,{stroke:dark,'stroke-width':3}))+repeat(5,i=>ellipse(320,286,38+i*22,29+i*16,'none',{stroke:steel,'stroke-width':2}))+(handle?path(`M${x+w-4} 258l121-65 14 23-127 77Z`,dark):'')
 let body=round?path(`M${x} ${y}h${w}q-5 ${h} -${w/2} ${h}q-${w/2}-5-${w/2}-${h}Z`,p.c,dark,3)+ellipse(320,y,w/2,53,dark)+ellipse(320,y-3,w/2-14,39,steel):rect(x,y-63,w,h+60,p.c,13,{stroke:dark,'stroke-width':3})+rect(x+13,y-49,w-26,h+17,dark,7)
 if(handle)body+=path(`M${x+w-7} ${y+2}l100-41 12 23-99 48Z`,dark)+ellipse(x+w+93,y-35,14,10,steel)
 else body+=path(`M${x} ${y+31}h-27q-28-37 0-43h27m${w} 43h27q28-37 0-43h-27`,'none',dark,11)
 if(p.has(/ridge|grill|돌기/))body+=repeat(10,i=>line(x+29+i*(w-58)/9,y-20,x+29+i*(w-58)/9,y+21,dark,4))
 if(v===2)body=group(body,'translate(-132,-87) scale(1.35)')+circle(284,285,7,steel)+circle(310,286,7,steel)
 return body
}
function plate(p,v){const board=p.has(/board|stone/),rectangular=p.has(/rect|square|tray|board/),divide=p.has(/divid|two|three|칸/),w=p.n('plate-width',278,365),h=p.n('plate-height',189,250)
 const base=rectangular?rect(320-w/2,280-h/2,w,h,p.c,board?14:25,{stroke:dark,'stroke-width':3}):ellipse(320,280,w/2,h/2,p.c,{stroke:dark,'stroke-width':3});let body=texture(p,base)+(rectangular?rect(335-w/2,295-h/2,w-30,h-30,'none',15,{stroke:p.accent,'stroke-width':3}):ellipse(320,280,w/2-26,h/2-21,'none',{stroke:p.accent,'stroke-width':4}));if(divide)body+=line(320,184,320,375,p.accent,5)+line(320,278,461,278,p.accent,5);if(v===1)body+=ellipse(320,280,w*.27,h*.27,'none',{stroke:steel,'stroke-width':13});if(v===2)body=group(body,'translate(-127,-92) scale(1.4)')+path('M166 399q135-51 282-5l-4 18q-140-39-276 7Z',p.accent,dark,2);return body}
function bowl(p,v){const steamer=p.has(/steamer|찜기/),colander=p.has(/colander|strainer|거름망|타공/),w=p.n('bowl-width',247,332),x=320-w/2,h=p.n('bowl-height',121,190),y=228
 if(v===1)return ellipse(320,298,w/2,117,p.c,{stroke:dark,'stroke-width':3})+ellipse(320,298,w/2-26,91,p.accent)+ellipse(320,298,w/2-41,76,p.c)+(colander?repeat(70,i=>circle(p.n(`holex${i}`,238,402),p.n(`holey${i}`,237,354),3,dark)):'')
 let body=texture(p,path(`M${x} ${y}Q${x+13} ${y+h} 320 ${y+h}Q${x+w-13} ${y+h} ${x+w} ${y}Z`,p.c,dark,3))+ellipse(320,y,w/2,52,p.accent)+ellipse(320,y,w/2-13,40,p.material==='metal'?steel:paper)
 if(colander)body+=repeat(45,i=>circle(x+47+(i%9)*(w-94)/8,y+38+Math.floor(i/9)*17,3,dark))
 if(steamer)body+=path(`M${x} ${y+52}h${w}M${x+8} ${y+110}h${w-16}`,'none',p.accent,7)+ellipse(320,y-34,w/2+6,27,p.c)+rect(294,y-67,50,22,dark,7)
 if(v===2)body=group(body,'translate(-141,-137) scale(1.5)')+path('M161 425q148-90 315-19','none',p.accent,18)
 return body
}
function cup(p,v){const wine=p.has(/wine|goblet|flute|champagne/),handle=p.has(/mug|tea cup|handle|손잡이/),lid=p.has(/flask|travel|insulat|tumbler|bottle/),w=p.n('cup-width',129,195),h=p.n('cup-height',170,242),x=320-w/2,y=174
 if(wine)return path(`M${x} 123Q${x-10} 290 320 315Q${x+w+10} 290 ${x+w} 123Z`,'url(#glass)',steel,3)+ellipse(320,123,w/2,25,'url(#glass)',{stroke:steel,'stroke-width':2})+line(320,315,320,428,steel,9)+ellipse(320,438,77,20,'url(#glass)',{stroke:steel,'stroke-width':2})
 let body=path(`M${x} ${y}h${w}l-14 ${h}q-${w/2-14} 33-${w-28} 0Z`,p.material==='glass'?'url(#glass)':'url(#finish)',dark,2)+ellipse(320,y,w/2,25,p.accent)+ellipse(320,y,w/2-10,16,paper)
 if(handle)body+=path(`M${x+w-4} ${y+39}q104-36 71 78q-22 38-79 31`,'none',p.c,19)+path(`M${x+w+3} ${y+42}q80-22 58 65`,'none',steel,2)
 if(lid)body+=ellipse(320,y-10,w/2+7,26,dark)+rect(300,y-31,62,19,p.accent,7)
 if(v===1)body=ellipse(320,278,w/2+25,104,p.c,{stroke:dark,'stroke-width':3})+ellipse(320,278,w/2+10,88,dark)+ellipse(320,278,w/2-7,68,p.accent)
 if(v===2)body=group(body,'translate(-120,-85) scale(1.4)')+path('M209 409q113 39 216-2','none',steel,7)
 return body
}
function utensil(p,v){const whisk=p.has(/whisk|거품기/),knife=p.has(/knife|scissor|slicer/),spoon=p.has(/spoon|ladle|server/),fork=p.has(/fork|masher/),grater=p.has(/grater/),brushy=p.has(/brush/),w=p.n('utensil-width',63,104),x=320-w/2
 let head=knife?path('M284 246V92q143 95 78 230l-17-93Z',steel,dark,2):whisk?repeat(6,i=>ellipse(320,194,25+i*8,106,'none',{stroke:steel,'stroke-width':3})):spoon?ellipse(320,176,w*.71,93,steel,{stroke:dark,'stroke-width':2}):grater?rect(240,117,164,216,steel,7)+repeat(42,i=>path(`M${253+i%6*25} ${138+Math.floor(i/6)*27}h13l-6 8Z`,dark)):rect(x,116,w,154,steel,9)+(fork?repeat(5,i=>rect(x+7+i*(w-16)/5,100,7,96,p.c,2)):repeat(4,i=>rect(x+9+i*(w-20)/4,145,6,75,dark,3)))
 let body=head+rect(307,262,27,180,p.c,11)+circle(320,416,6,dark)
 if(v===1)body=group(body,`rotate(${knife?-20:24} 320 285)`)+path('M329 289v110','none',paper,2)
 if(v===2)body=group(head,'translate(-139,-45) scale(1.4)')+rect(253,372,124,66,p.c,15)+line(272,385,359,425,steel,6)
 return body
}

function appliance(p,v){const vacuum=p.has(/vacuum|cleaner/),fan=p.has(/fan|purifier|heater/),kettle=p.has(/kettle|coffee press/),toaster=p.has(/toaster/),mixer=p.has(/mixer|blender|processor/),fridge=p.has(/refrigerator|fridge|freezer/),washer=p.has(/washer|washing machine|dryer/),iron=p.has(/iron/),w=p.n('appliance-width',209,286),h=p.n('appliance-height',224,301),x=320-w/2,y=143
 if(p.has(/purifier|heater|tower.*fan|dehumidifier|humidifier/))return rect(223,112,194,338,p.c,p.has(/tower|cylindrical/)?69:22,{stroke:dark,'stroke-width':3})+rect(251,138,137,34,dark,7)+repeat(24,i=>line(248,194+i*9,391,194+i*9,steel,3))+(v===1?rect(243,184,154,235,'none',9,{stroke:dark,'stroke-width':6})+rect(302,189,39,14,steel,4):v===2?group(rect(215,137,158,232,paper,7)+repeat(19,i=>line(224+i*7,149,224+i*7,357,steel,3)),'translate(201,48) rotate(8 294 253)'):'')
 if(vacuum)return ellipse(322,421,138,40,dark)+rect(269,261,103,153,p.c,39)+line(319,272,347,115,steel,21)+rect(330,102,93,48,p.accent,15)+circle(302,411,24,steel)+(v===1?rect(283,299,77,77,p.accent,12):'')+(v===2?rect(175,164,159,126,paper,14)+repeat(14,i=>line(187+i*10,174,187+i*10,278,steel,3)):'')
 if(fan)return ellipse(320,441,117,18,p.c)+line(320,410,320,262,steel,16)+circle(320,236,133,p.c)+circle(320,236,116,dark)+repeat(5,i=>group(path('M320 236q-60-120 33-96q62 56-33 96',p.accent),`rotate(${i*72} 320 236)`))+repeat(20,i=>line(320+Math.cos(i*.314)*25,236+Math.sin(i*.314)*25,320+Math.cos(i*.314)*116,236+Math.sin(i*.314)*116,steel,2))+circle(320,236,25,steel)+(v===2?circle(320,236,80,'none',{stroke:paper,'stroke-width':3}):'')
 if(kettle)return path('M242 227Q255 171 320 167Q392 172 404 227L435 389Q320 445 210 389Z',p.c,dark,3)+ellipse(320,190,68,24,steel)+rect(293,154,54,29,dark,8)+path('M240 241l-84-33 33 89 39 30Z',p.c,dark,3)+path('M406 226q118-55 84 118q-16 48-73 15','none',dark,20)+(v===1?rect(277,244,80,109,steel,16)+repeat(5,i=>line(294,261+i*19,339,261+i*19,dark,3)):'')
 if(mixer)return rect(242,330,164,109,p.c,17)+path('M231 150h177l-24 179H259Z','url(#glass)',dark,3)+rect(227,128,186,25,dark,5)+path('M406 173q91-30 67 70q-20 51-77 22','none',steel,12)+circle(321,383,23,dark)+repeat(4,i=>line(275,180+i*30,300,180+i*30,p.accent,3))+(v===1?rect(271,359,99,54,steel,5):'')
 let body=rect(x,y,w,h,p.c,23,{stroke:dark,'stroke-width':3})
 if(v===1)body+=repeat(17,i=>line(x+24,y+36+i*10,x+w-24,y+36+i*10,dark,3))+rect(290,y+h-65,64,34,steel,5)+path(`M320 ${y+h-37}q95 68 71-4`,'none',dark,7)
 else body+=fridge?line(x+11,y+h*.4,x+w-11,y+h*.4,dark,4)+rect(x+w-35,y+29,9,h*.21,dark,4)+rect(x+w-35,y+h*.51,9,h*.32,dark,4):washer?circle(320,y+h*.6,w*.33,dark)+circle(320,y+h*.6,w*.26,'url(#glass)')+rect(x+19,y+20,w-38,41,steel,6):toaster?ellipse(320,y+9,w*.38,22,dark)+line(x+w-30,y+65,x+w-30,y+158,dark,5)+rect(x+w-45,y+124,34,16,steel,3):rect(x+20,y+60,w-40,h-96,dark,11)+rect(x+29,y+69,w-58,h-114,'url(#glass)',6)+circle(x+35,y+31,11,dark)+circle(x+w-36,y+31,11,dark)
 return v===2?group(body,'translate(-73,-25) scale(1.2)')+rect(219,418,210,32,steel,6)+repeat(13,i=>line(230+i*15,423,230+i*15,445,dark,3)):body
}
function petHouse(p,v){const cage=p.has(/cage|bird|aviary|hutch/),tank=p.has(/aquarium|terrarium|habitat/),tree=p.has(/cat tree|scratch|perch/),tunnel=p.has(/tunnel/),w=p.n('pet-width',258,339),h=p.n('pet-height',227,289),x=320-w/2,y=167
 if(tunnel)return ellipse(214,304,96,113,p.c)+path('M214 191q194-25 264 91v150q-130-45-264-16Z',p.c,dark,3)+ellipse(214,304,96,113,p.accent)+ellipse(214,304,72,88,dark)+repeat(5,i=>path(`M${275+i*35} ${184+i*11}q-69 115 0 225`,'none',steel,4))
 if(tree)return ellipse(320,444,162,22,p.c)+rect(266,176,25,269,p.accent,9)+rect(381,265,25,180,p.accent,9)+rect(194,157,198,35,p.c,12)+rect(318,265,147,35,p.c,12)+rect(155,314,171,100,p.c,12)+circle(220,358,37,dark)+repeat(19,i=>line(269,206+i*9,288,200+i*9,paper,2))
 if(tank)return rect(x,y,w,h,steel,7)+rect(x+9,y+12,w-18,h-26,'url(#glass)',2)+rect(x+13,y+h-57,w-26,32,'#bda67a',2)+repeat(7,i=>path(`M${x+29+i*39} ${y+h-25}q-29-56 2-${48+p.n(i,0,51)}`,'none','#638c75',7))+(v===1?rect(x+w-53,y+26,27,h-93,dark,7):'')
 let body=rect(x,y,w,h,p.c,12,{stroke:dark,'stroke-width':3})+rect(x+15,y+21,w-30,h-42,cage?paper:dark,3)
 if(cage)body+=repeat(16,i=>line(x+23+i*(w-44)/15,y+24,x+23+i*(w-44)/15,y+h-24,steel,4))+line(x+15,y+h*.54,x+w-15,y+h*.54,steel,6)+rect(285,y+62,79,h-91,'none',8,{stroke:dark,'stroke-width':7})
 else body+=poly(`${x-22},${y+21} 320,${y-95} ${x+w+22},${y+21}`,p.accent,{stroke:dark,'stroke-width':3})+path(`M270 ${y+h-20}v-100q50-74 100 0v100Z`,p.accent)
 if(v===2)body=group(body,'translate(-98,-79) scale(1.3)')+rect(266,260,85,35,dark,8)+line(294,270,328,270,steel,6)
 return body
}
function leash(p,v){const harness=p.has(/harness/),collar=p.has(/collar/),strap=p.has(/strap|resistance band|exercise band|스트랩/),w=p.n('strap-width',15,30)
 if(p.has(/belt/)&&!p.has(/leash|pet|dog|cat/))return path('M181 247q106-131 299 4v80q-156-131-299 0Z',p.c,dark,3)+rect(156,232,112,115,steel,10)+rect(177,252,70,75,dark,7)+line(168,284,221,284,steel,9)+repeat(8,i=>circle(353+i*15,283+p.n('belthole'+i,-9,8),3,dark))+(v===1?path('M203 358q152 63 278-13l-2 39q-142 87-278 17Z',p.accent,dark,2):'')+(v===2?rect(188,331,253,71,p.c,4)+repeat(21,i=>line(200+i*11,344,200+i*11,389,paper,1.5)):'')
 if(harness)return path('M213 170q99-67 204 0l-52 102 56 125q-111 57-200 0l51-125Z','none',p.c,w+9)+line(223,196,407,358,p.accent,w)+line(405,196,233,358,p.accent,w)+rect(288,248,61,45,steel,8)+rect(302,258,34,23,dark,4)
 const body=path(collar?'M193 204q215-121 264 76q24 168-229 106q-109-47-35-182':'M185 196q-30-105 72-63q59 39-39 80q-128 128 92 204q269 41 180-213','none',p.c,w)+rect(collar?175:179,collar?273:199,w+34,41,steel,8)+path(collar?'M189 262v-27q36-39 43 0v27':'M488 204q-23-92 32-80q61 28 8 73','none',steel,11)
 return body+(v===1?repeat(14,i=>line(227+i*13,390,230+i*13,408,paper,1.5)):'')+(v===2?group(rect(191,180,115,96,steel,15)+rect(210,199,77,58,dark,10)+line(253,187,253,242,steel,9),'translate(155,-20) scale(1.1)'):'')
}
function bicycle(p,v){const scooter=p.has(/scooter/),stroller=p.has(/stroller|pram|pushchair/),tri=p.has(/tricycle/),radius=p.n('wheel-radius',67,89),w=p.n('wheelbase',237,291),rear=320-w/2,front=320+w/2
 if(stroller)return circle(203,425,48,dark)+circle(442,425,55,dark)+path('M196 428l211-269h47m-40 235L204 155h-47','none',steel,14)+path('M223 251h183l-20 118H250Z',p.c,dark,3)+path('M213 247q88-192 190 0Z',p.accent,dark,3)
 const wheel=(cx)=>circle(cx,371,radius,dark)+circle(cx,371,radius-12,steel)+circle(cx,371,radius-17,paper)+repeat(12,i=>line(cx,371,cx+Math.cos(i*.524)*(radius-15),371+Math.sin(i*.524)*(radius-15),steel,2))
 if(scooter)return circle(rear,402,42,dark)+circle(front,402,42,dark)+line(rear,393,front-38,393,p.c,24)+line(front,395,front-34,133,steel,13)+line(front-72,135,front+15,135,dark,13)
 let body=wheel(rear)+wheel(front)+path(`M${rear} 370l99-144 103 0-73 144H${rear}l104-137 26 137m66-150 68 150`,'none',p.c,13)+line(rear+94,224,rear+79,190,steel,11)+line(rear+48,189,rear+117,189,dark,14)+path(`M${rear+202} 226l-14-61h62`,'none',steel,11)+circle(rear+129,371,17,dark)+line(rear+129,371,rear+155,397,steel,8)
 if(v===1)body=group(body,'translate(640,0) scale(-1,1)')+circle(rear+129,371,29,'none',{stroke:steel,'stroke-width':3})
 if(v===2)body=group(body,'translate(-205,-135) scale(1.55)')
 return body
}
function ball(p,v){const basket=p.has(/basketball/),foot=p.has(/football|soccer/),tennis=p.has(/tennis/),golf=p.has(/golf/),r=p.n('ball-size',115,153),c=tennis?'#a4b346':basket?'#b67d4a':p.c;let body=circle(320,282,r,c,{stroke:dark,'stroke-width':3})
 if(foot)body+=repeat(6,i=>group(poly('320,249 349,270 339,304 301,304 290,270',i===0?dark:p.accent),`translate(${i?Math.cos(i*1.26)*87:0},${i?Math.sin(i*1.26)*87:0})`))
 else if(golf)body+=repeat(80,i=>circle(220+p.n(`dotx${i}`,0,196),185+p.n(`doty${i}`,0,182),3,p.accent))
 else body+=path(`M${320-r} 282h${r*2}M320 ${282-r}v${r*2}M${320-r*.65} ${282-r*.76}q${r*1.3} ${r*.77} 0 ${r*1.52}M${320+r*.65} ${282-r*.76}q-${r*1.3} ${r*.77} 0 ${r*1.52}`,'none',tennis?paper:dark,tennis?7:4)
 if(v===1)body=group(body,`rotate(${31+p.n('ball-angle',0,23)} 320 282)`)+circle(318,341,9,dark)+circle(318,341,3,steel)
 if(v===2)body=group(body,'translate(-161,-152) scale(1.55)')+circle(405,345,25,dark)+circle(405,345,8,steel)
 return body
}
function figure(p,v){const robot=p.has(/robot|mech|armour|armor/),doll=p.has(/doll|figure|figurine|action/),animal=p.has(/cat|rabbit|bear|dog|fox|teddy|bunny|lion|animal/),w=p.n('body-width',130,183),head=p.n('head-radius',50,78),ear=p.has(/rabbit|bunny/)?70:p.has(/cat|fox/)?47:27,x=320-w/2
 if(robot)return rect(260,115,120,107,p.c,19)+rect(243,235,155,150,p.accent,15)+rect(193,239,39,158,p.c,12)+rect(411,239,39,158,p.c,12)+rect(256,390,53,78,p.c,10)+rect(339,390,53,78,p.c,10)+rect(275,144,89,42,dark,4)+circle(299,164,8,paper)+circle(343,164,8,paper)+(v===1?rect(268,264,103,93,dark,9)+repeat(7,i=>line(279,280+i*9,359,280+i*9,steel,2)):'')
 let body=animal?ellipse(269,142,29,ear,p.c)+ellipse(370,142,29,ear,p.c):path('M252 182q-17-120 103-85q70 8 42 121Z',p.accent)
 body+=ellipse(320,324,w/2,107,p.c)+ellipse(x-19,319,29,78,p.c)+ellipse(x+w+19,319,29,78,p.c)+ellipse(273,439,43,27,p.c)+ellipse(368,439,43,27,p.c)+circle(320,193,head,p.c)
 if(v===1)body+=path('M320 251v164','none',paper,2,{'stroke-dasharray':'5 4'})+ellipse(320,400,25,41,p.accent)
 else body+=circle(295,183,7,dark)+circle(346,183,7,dark)+ellipse(320,218,21,16,p.accent)+path('M310 228q10 9 20 0','none',dark,2)
 if(v===2)body=group(body,'translate(-116,-77) scale(1.4)')+repeat(12,i=>line(268+i*9,351,271+i*9,359,paper,2))
 return body
}
function book(p,v){const w=p.n('book-width',210,276),h=p.n('book-height',290,342),x=320-w/2,y=127,c=p.c
 if(v===1)return rect(x-9,y+8,w,h,paper,3)+rect(x,y,w,h,c,5)+repeat(10,i=>line(x+26,y+57+i*19,x+w-26-p.n(i,0,36),y+57+i*19,paper,3))+rect(x+27,y+h-68,97,37,paper,2)+repeat(15,i=>line(x+34+i*5,y+h-62,x+34+i*5,y+h-38,dark,i%3===0?2:1))
 if(v===2)return path('M320 176q-155-93-236-31v269q144-30 236 31q119-61 238-31V145q-135-44-238 31Z',paper,steel,3)+path('M320 180v252','none',steel,4)+repeat(10,i=>path(`M119 ${244+i*15}q90-12 171 12`,'none',steel,2))+group(gameScene(p,1),'translate(341,192) scale(.3)')
 return rect(x-9,y+8,w,h,paper,3)+rect(x,y,w,h,c,5)+rect(x,y,14,h,p.accent,3)+group(gameScene(p,0),`translate(${x+21},${y+58}) scale(.38)`)+text(p.title.length>32?p.title.slice(0,32)+'…':p.title,320,y+41,15,paper,{'text-anchor':'middle','font-weight':700})
}
function toy(p,v){const puzzle=p.has(/puzzle|board game|chess|domino|mosaic/),train=p.has(/train|rail/),vehicle=p.has(/car\b|truck|vehicle|tractor/),science=p.has(/science|circuit|solar|hydraulic|weather|crystal|magnet|laboratory/),music=p.has(/drum|guitar|xylophone|music|keyboard/),castle=p.has(/castle|fort|house|building|architecture/),count=Math.floor(p.n('toy-count',5,10))
 if(p.has(/bus\b|tram/))return rect(133,191,373,209,p.c,14,{stroke:dark,'stroke-width':3})+repeat(5,i=>rect(151+i*68,211,57,74,'url(#glass)',5))+rect(427,300,61,84,p.accent,4)+circle(205,397,43,dark)+circle(205,397,24,steel)+circle(435,397,43,dark)+circle(435,397,24,steel)+repeat(20,i=>rect(145+i%10*35,183+Math.floor(i/10)*111,22,11,p.accent,4))+(v===1?rect(277,306,57,61,p.accent,3):v===2?line(156,339,409,339,steel,5):'')
 if(puzzle)return rect(167,170,309,247,p.c,13,{stroke:dark,'stroke-width':3})+repeat(12,i=>{const x=181+i%4*73,y=183+Math.floor(i/4)*74;return path(`M${x} ${y}h${55+p.n('piece'+i,0,8)}v22q12-6 12 8t-12 6v28h-24q6-13-6-13t-6 13h-22v-64Z`,`hsl(${(p.h+i*37)%360} 31% ${43+i%3*11}%)`,paper,2)})+(v===1?path('M195 199l246 185M444 201L195 385','none',p.accent,5):'')
 if(vehicle||train)return rect(155,269,344,115,p.c,18)+path('M214 269l44-94h123l67 94Z',p.accent,dark,3)+rect(273,196,99,66,'url(#glass)',5)+circle(226,380,54,dark)+circle(226,380,29,steel)+circle(443,380,54,dark)+circle(443,380,29,steel)+(v===1?rect(163,304,46,27,paper,7)+rect(468,304,29,27,'#be6363',7):'')
 if(science)return rect(172,327,301,87,p.c,12)+repeat(3,i=>rect(193+i*90,182,61,144,'url(#glass)',14,{stroke:steel,'stroke-width':3}))+repeat(3,i=>rect(193+i*90,247-i*14,61,78+i*14,`hsl(${(p.h+i*74)%360} 36% 58%)`,12))+repeat(3,i=>rect(204+i*90,160,39,31,dark,5))+path('M225 188q-59-95 82-47t73 45','none',steel,8)
 if(music)return p.has(/guitar/)?ellipse(292,323,93,110,p.c)+ellipse(292,261,65,58,p.c)+circle(292,290,32,dark)+rect(278,103,29,170,p.accent,4)+rect(271,78,45,69,p.c,8)+repeat(6,i=>line(281+i*5,95,281+i*5,379,steel,1)):repeat(8,i=>rect(161+i*42,190+i*9,38,208-i*18,`hsl(${(p.h+i*35)%360} 39% 57%)`,8,{stroke:dark,'stroke-width':2}))+line(176,428,398,187,steel,7)+circle(403,180,17,p.accent)
 if(castle)return repeat(count,i=>{const x=163+i%4*81,y=364-Math.floor(i/4)*102;return rect(x,y,75,96,`hsl(${(p.h+i*39)%360} 23% 60%)`,3,{stroke:dark,'stroke-width':2})+poly(`${x-8},${y} ${x+37},${y-56} ${x+82},${y}`,p.accent)})
 let body=repeat(count,i=>{const x=160+i%4*89,y=177+Math.floor(i/4)*97;return group(rect(x,y,71,72,`hsl(${(p.h+i*53)%360} 30% 55%)`,8,{stroke:dark,'stroke-width':2})+repeat(4,j=>circle(x+20+j%2*31,y+20+Math.floor(j/2)*31,8,p.accent)),`rotate(${p.n(i,-9,9)} ${x+35} ${y+36})`)})
 if(v===1)body+=path('M165 430q160-96 302 0','none',steel,9)
 if(v===2)body=group(body,'translate(-157,-80) scale(1.4)')
 return body
}
function fitness(p,v){const weight=p.has(/dumbbell|kettlebell|weight/),roller=p.has(/roller/),block=p.has(/block|step|box/),bench=p.has(/bench|treadmill/),w=p.n('fitness-width',190,251)
 if(weight)return p.has(/kettle/)?path('M257 235v-67q62-98 125 0v67','none',dark,26)+circle(320,326,115,p.c)+circle(320,321,64,p.accent):line(179,280,469,280,steel,29)+repeat(4,i=>rect(146+i%2*270+Math.floor(i/2)*31,188,31,184,p.c,9))
 if(roller)return rect(167,216,306,142,p.c,4)+ellipse(167,287,49,72,p.accent)+ellipse(473,287,49,72,p.accent)+ellipse(473,287,27,47,dark)+repeat(13,i=>line(181+i*20,230,181+i*20,344,steel,6))
 if(block)return poly('170,221 413,180 481,296 218,357',p.c,{stroke:dark,'stroke-width':3})+poly('170,221 218,357 218,415 169,290',p.accent)+poly('218,357 481,296 481,350 218,415',dark)+repeat(11,i=>line(216+i*18,236-i*3,246+i*18,320-i*3,p.accent,2))
 if(bench)return poly('154,252 432,219 489,298 201,341',p.c,{stroke:dark,'stroke-width':3})+line(208,336,187,437,steel,16)+line(460,310,483,424,steel,16)+line(182,437,253,437,dark,11)+line(449,427,514,427,dark,11)
 return ellipse(320,281,w/2+38,149,'none',{stroke:p.c,'stroke-width':28})+rect(182,220,39,121,dark,16)+rect(418,220,39,121,dark,16)+(v===1?line(229,384,411,179,p.accent,15):'')+(v===2?group(rect(190,123,196,88,p.c,26)+repeat(13,i=>line(204+i*12,136,204+i*12,197,dark,3)),'translate(127,108)'):'')
}
function stand(p,v){const holder=p.has(/holder|rest|mount/),screen=p.has(/screen|protector|film/),grip=p.has(/grip|sleeve|caps|trigger/),hooks=p.has(/hook|hanger/),w=p.n('stand-width',230,318),x=320-w/2
 if(screen)return rect(155,172,330,213,'url(#glass)',17,{stroke:steel,'stroke-width':4})+path('M181 348l229-154m-167 171 220-145','none',paper,12)+(p.has(/dual|ds lite/)?rect(174,416,289,104,'url(#glass)',9,{stroke:steel,'stroke-width':3}):'')+(v===1?rect(441,163,47,25,p.accent,4):'')
 if(grip)return p.has(/caps|analog.stick grips|thumbstick.*grip/)?repeat(6,i=>circle(218+i%3*102,233+Math.floor(i/3)*109,40,p.c)+circle(218+i%3*102,233+Math.floor(i/3)*109,26,p.accent)+repeat(14,j=>circle(218+i%3*102+Math.cos(j*.45)*20,233+Math.floor(i/3)*109+Math.sin(j*.45)*20,2,dark))):path('M182 224q43-52 119-30h44q76-22 119 30l36 135q-10 71-69 33l-68-69h-87l-68 69q-59 38-69-33Z','none',p.c,29)
 if(hooks)return repeat(3,i=>path(`M${192+i*110} 161v178q0 117 69 37v-36`,'none',p.c,24))
 let body=poly(`${x},432 ${x+60},171 ${x+155},171 ${x+103},368 ${x+w},368 ${x+w},432`,p.c,{stroke:dark,'stroke-width':3})+rect(x+21,418,w-8,20,p.accent,6)
 if(holder)body+=path(`M${x+67} 211q77 68 111-4`,'none',dark,20)
 if(v===1)body+=line(x+69,194,x+w-28,416,steel,10)+circle(x+105,249,16,dark)
 if(v===2)body=group(body,'translate(-152,-149) scale(1.5)')+repeat(4,i=>circle(227+i*46,408,5,steel))
 return body
}
function food(p,v){const can=p.has(/canned|can\b|tinned|tin\b|통조림/),jarred=p.has(/sauce|spread|honey|jam|소스/),box=p.has(/biscuit|cookie|bar\b|tea|cereal|soup|크래커|쿠키|수프/),w=p.n('food-width',194,271),h=p.n('food-height',257,313),x=320-w/2,y=138,foodColor=p.has(/berry|strawberry|tomato|딸기|토마토/)?'#ae6960':p.has(/pea|green|algae|완두|김|다시마/)?'#6e8766':p.has(/chocolate|cocoa|coffee|beef|chicken|초콜릿|코코아/)?'#836551':'#bd9e69'
 if(v===2)return ellipse(320,372,186,76,p.c)+ellipse(320,361,166,58,paper)+repeat(p.has(/noodle|pasta|국수/)?29:45,i=>p.has(/noodle|pasta|국수/)?path(`M${226+p.n(`x${i}`,0,175)} ${302+p.n(`y${i}`,0,63)}q-37 13 21 25`,'none',foodColor,5):ellipse(p.n(`x${i}`,193,447),p.n(`y${i}`,316,395),p.n(`r${i}`,6,15),p.n(`ry${i}`,4,10),foodColor,{transform:`rotate(${p.n(i,0,180)} 320 360)`}))+group(path('M260 186q28-73 65 0q-41 23-65 0',foodColor),'translate(-20,-14)')
 let body=can?rect(x,y,w,h,steel,13)+ellipse(320,y,w/2,26,steel)+ellipse(320,y,w/2-13,16,dark)+rect(x+1,y+50,w-2,h-91,foodColor,0):jarred?rect(x,y+44,w,h-37,'url(#glass)',23)+rect(x-4,y+22,w+8,33,p.accent,8)+rect(x+6,y+81,w-12,h-105,foodColor,13):box?rect(x,y,w,h,p.c,6)+poly(`${x+w},${y} ${x+w+25},${y+16} ${x+w+25},${y+h-9} ${x+w},${y+h}`,p.accent):path(`M${x+13} ${y}h${w-26}l14 48-8 ${h-73} 15 28H${x-8}l15-28-8-${h-73}Z`,p.c,dark,2)
 body+=label(p,x+15,y+68,w-30)
 if(v===1)body+=rect(x+17,y+154,w-34,h-171,paper,3)+repeat(8,i=>line(x+23,y+163+i*12,x+w-23-p.n(i,0,23),y+163+i*12,foodColor,2))
 else body+=repeat(13,i=>ellipse(x+31+p.n(`fx${i}`,0,w-62),y+192+p.n(`fy${i}`,0,54),8,5,foodColor))
 return body
}
function vase(p,v){const jug=p.has(/jug|pitcher/),pot=p.has(/pot|planter/),w=p.n('vase-width',172,246),neck=p.n('neck-width',62,112),h=p.n('vase-height',228,299),y=139,x=320-w/2
 if(v===1)return ellipse(320,284,w/2,123,p.c,{stroke:dark,'stroke-width':3})+ellipse(320,284,w/2-20,101,p.accent)+ellipse(320,284,w/2-45,75,dark)+(pot?circle(320,284,9,steel):'')
 let body=pot?path(`M${x} ${y+38}h${w}l-26 ${h-28}H${x+26}Z`,p.c,dark,3)+ellipse(320,y+38,w/2,25,p.accent):path(`M${320-neck/2} ${y}h${neck}v66Q${x+w+37} ${y+99} ${x+w-6} ${y+h-13}Q320 ${y+h+31} ${x+6} ${y+h-13}Q${x-37} ${y+99} ${320-neck/2} ${y+66}Z`,p.material==='glass'?'url(#glass)':'url(#finish)',dark,3)+ellipse(320,y,neck/2,13,p.accent)
 if(jug)body+=path(`M${x+w-14} ${y+94}q126-62 86 96q-13 42-78 35`,'none',p.c,21)
 body=texture(p,body)
 if(v===2)body=group(body,'translate(-128,-57) scale(1.4)')+ellipse(324,424,84,25,p.accent)+ellipse(324,424,60,16,p.c)
 return body
}
function jar(p,v){const box=p.has(/box|container|lunch|divid/),bottle=p.has(/bottle|pourer|squeeze|dispenser/),w=p.n('jar-width',174,251),h=p.n('jar-height',box?160:230,box?214:299),x=320-w/2,y=176
 if(box){const base=rect(x,y,w,h,p.c,20,{stroke:dark,'stroke-width':3})+rect(x+13,y+13,w-26,h-26,p.accent,15);return base+(v===1?rect(x+26,y+29,w-52,h-58,p.c,7):line(320,y+18,320,y+h-18,steel,8))+(v===2?rect(x-18,y-57,w+36,42,p.c,14)+rect(x+23,y-35,w-46,10,p.accent,4):'')}
 let body=rect(x,y,w,h,p.material==='glass'?'url(#glass)':'url(#finish)',23,{stroke:steel,'stroke-width':3})+rect(x+(bottle?42:-6),y-(bottle?64:35),w-(bottle?84:-12),bottle?68:43,p.accent,9)
 if(p.has(/clamp|clip/))body+=path(`M${x+18} ${y-12}v57h${w-36}v-57`,'none',steel,6)
 if(v===1)body+=repeat(7,i=>line(x+23,y+42+i*25,x+53,y+42+i*25,p.accent,3))
 if(v===2)body=ellipse(320,281,w/2+38,96,p.accent)+ellipse(320,281,w/2+18,76,steel)+ellipse(320,281,w/2,59,'url(#glass)')+path('M226 376q89 46 190 0','none',steel,7)
 return body
}

// Scene grammar is keyed to both title motifs and genre. The stable world seed
// changes terrain, architecture, characters and prop placement, never just text.
function gameScene(p,v){
 const h=p.h,genre=String(p.raw.genre||p.d.specs?.Genre||p.d.category||'').toLowerCase(),night=p.has(/night|moon|star|neon|midnight|space|comet/),sea=p.has(/sea|harbor|harbour|ferry|river|tide|coast|lake|island|marin|water/),urban=p.has(/city|metro|street|skyline|station|neon|grand theft|gta|cyber|auto/),snow=p.has(/snow|winter|glacier|alpine|ice/),racing=/racing/.test(genre)||p.has(/rally|circuit|kart|speedway|drift|raceway|racing/),sport=/sports/.test(genre)||p.has(/football|basketball|tennis|baseball|hockey|volleyball|golf|bowling|rugby|athletics/),puzzle=/puzzle/.test(genre),music=/rhythm/.test(genre)||p.has(/orchestra|mixtape|rhythm|synth|concert|music box/),fantasy=/role-playing|strategy/.test(genre)||p.has(/sword|kingdom|paladin|rune|crown|guild|castle|dragon/),sky=night?'#1c2d4d':snow?'#a9c8d6':`hsl(${(h%90)+165} 36% 66%)`,ground=snow?'#e8edf0':`hsl(${(h>>>9)%95+80} 22% 43%)`,accent=p.accent
 const peak=Array.from({length:9},(_,i)=>`${i*80},${p.n(`peak-${v}-${i}`,120,278)}`).join(' ')
 let body=rect(0,0,640,520,sky)+circle(p.n('sun-x'+v,410,553),p.n('sun-y'+v,58,129),p.n('sun-size',24,47),night?'#e2dcc7':'#f3d4a5')+poly(`0,311 ${peak} 640,380`,snow?'#c8d9df':'#698994')+path(`M0 344Q${p.n('ridge-x'+v,100,233)} ${p.n('ridge-y'+v,216,270)} 640 321V520H0Z`,ground)
 if(night)body+=repeat(29,i=>circle(p.n(`starx${i}`,13,632),p.n(`stary${i}`,15,223),p.n(`starr${i}`,1,2.5),paper))
 if(sea)body+=path(`M0 ${330+v*17}Q233 ${290+v*12} 640 ${340+v*9}V520H0Z`,'#598a9a')+repeat(15,i=>path(`M${p.n(`wave${i}`,0,553)} ${363+i*10}q${p.n(`wavew${i}`,20,74)}-8 69 0`,'none','#b4d4d7',2))+path('M170 392h218l-39 38H209Z',accent)+path('M249 389v-93h59v93Z',paper)+poly('257,293 257,365 199,365','#dcc7a3')
 if(urban)body+=repeat(12,i=>{const x=i*58-12,y=p.n(`city-${v}-${i}`,120,262),w=p.n(`city-w-${i}`,31,62);return rect(x,y,w,365-y,`hsl(${210+i*3} 20% ${23+i%3*7}%)`)+repeat(12,j=>rect(x+7+j%3*13,y+15+Math.floor(j/3)*19,5,8,night?'#e5ba84':'#a4b9bb'))})+poly('208,520 289,343 337,343 488,520','#47515b')+path('M318 371l22 35m17 27 26 43','none','#e2c993',5)
 if(fantasy)body+=repeat(4,i=>rect(100+i*74,229-i%2*57,63,141+i%2*57,'#b7aca0')+poly(`${94+i*74},${229-i%2*57} ${131+i*74},${167-i%2*57} ${170+i*74},${229-i%2*57}`,accent))+path('M213 365v-68q32-46 61 0v68Z',dark)+path('M482 414l-74-187 13-5 87 181Z',steel)+path('M415 358l71-31','none',accent,13)
 if(!urban&&!fantasy)body+=repeat(7,i=>{const x=p.n(`treex-${v}-${i}`,9,595),y=p.n(`treey-${v}-${i}`,269,386),r=p.n(`tree-r-${i}`,28,58);return rect(x-5,y,10,r*1.6,'#705b4a')+poly(`${x-r},${y+10} ${x},${y-r*1.8} ${x+r},${y+10}`,'#426e61')+poly(`${x-r*.75},${y-r*.55} ${x},${y-r*2} ${x+r*.75},${y-r*.55}`,'#638672')})
 if(racing)body+=path('M0 501q260-127 452-27l188 46H0Z','#404953')+group(path('M154 367l60-70h122l81 70 68 16v69H145v-67Z',accent,dark,3)+path('M236 313h79l55 50H198Z','#a9cdd5')+circle(218,449,41,dark)+circle(405,449,41,dark)+circle(218,449,23,steel)+circle(405,449,23,steel),`translate(${v===1?-72:v===2?100:0} ${v===2?23:0}) scale(${v===2?.78:1})`)
 else if(sport)body+=ellipse(320,454,164,33,'#c5aa83')+line(144,364,507,364,paper,5)+line(144,319,144,478,paper,5)+line(507,319,507,478,paper,5)+circle(391,328,44,accent)+path('M347 328h88m-45-44v88','none',paper,3)+figurePerson(p,260+v*27,361,1.1)
 else if(puzzle)body+=repeat(9,i=>group(rect(132+i%3*122,174+Math.floor(i/3)*95,83,73,`hsl(${(h+i*53)%360} 43% 64%)`,8,{stroke:paper,'stroke-width':3})+circle(173+i%3*122,211+Math.floor(i/3)*95,18,accent),`rotate(${p.n(`tile-${v}-${i}`,-18,18)} ${173+i%3*122} ${211+Math.floor(i/3)*95})`))
 else if(music)body+=repeat(7,i=>rect(108+i*64,230+p.n(`beat-${v}-${i}`,0,133),39,199-p.n(`beat-${v}-${i}`,0,133),`hsl(${(h+i*43)%360} 38% 65%)`,15))+path('M136 206q172-201 364-17','none',paper,5)+circle(190,199,29,accent)+circle(455,177,34,accent)
 else body+=figurePerson(p,340+v*47,367,.9)+figurePerson(p,247-v*20,404,.65)+(p.has(/lantern|light|beacon/)?rect(373+v*47,299,36,48,'#e9c26e',5)+circle(392+v*47,324,31,'#f3cb74',{opacity:.2}):'')
 return body
}
function figurePerson(p,x,y,s){return group(circle(x,y-38,15,'#c9aa91')+path(`M${x-17} ${y-23}h34l13 66h-57Z`,p.accent)+line(x-10,y+43,x-17,y+93,dark,13)+line(x+12,y+43,x+27,y+93,dark,13)+path(`M${x-16} ${y-8}l-22 42m54-42 22 39`,'none',p.accent,13),`translate(${x*(1-s)},${y*(1-s)}) scale(${s})`)}
function wrapTitle(title,max=23){const words=String(title).split(/\s+/),lines=[];let current='';for(const word of words){if(current&&`${current} ${word}`.length>max){lines.push(current);current=word}else current+=(current?' ':'')+word}if(current)lines.push(current);return lines.slice(0,4)}
// A box shows the game's name, not the listing's extras such as
// "(Code in Box, Delivers 11/12/26)" or " - PlayStation 5".
function coverTitle(title){const name=String(title).replace(/\s*[([][^)\]]*[)\]]/g,'').replace(/\s+[-—–|:]\s*(?:for\s+)?(?:Xbox|PlayStation|PS[45]\b|Nintendo|Switch\b|PC\b).*$/i,'').trim();return name||String(title)}
function game(p,v){const gameTitle=p.raw.gameTitle||coverTitle(p.title),platform=String(p.raw.platformLabel||p.d.platform||p.raw.platform||'').slice(0,36),banner=/xbox/i.test(platform)?'#26714e':/switch|nintendo/i.test(platform)?'#b45154':'#3c647e',digital=p.d.format==='digital'||p.d.format==='digital-add-on'||p.raw.accessorySubtype==='digital-add-on',addon=p.d.format==='digital-add-on'||p.raw.accessorySubtype==='digital-add-on'
 if(addon){const coins=p.has(/cash|currency|shark|coin|money/),body=gameScene(p,v);return body+rect(86,141,468,308,dark,18,{opacity:.9})+(coins?repeat(5,i=>ellipse(230+i*41,307-i*19,44,23,'#c7a66a',{stroke:'#f0d8a7','stroke-width':4}))+repeat(3,i=>ellipse(267,346-i*19,44,23,'#c7a66a',{stroke:'#f0d8a7','stroke-width':4})):path('M262 212h118v48h49v113h-49v43H262v-43h-50V260h50Z',p.accent,steel,3))+wrapTitle(gameTitle,29).map((s,i)=>text(s,320,176+i*24,19,paper,{'text-anchor':'middle'})).join('')+text('Digital add-on',320,428,17,paper,{'text-anchor':'middle'})}
 if(digital&&v===1)return gameScene(p,1)+rect(0,421,640,99,dark)+text(gameTitle.slice(0,45),320,464,22,paper,{'text-anchor':'middle'})+text('Digital game',320,497,15,'#c0d2db',{'text-anchor':'middle'})
 if(v===2)return gameScene(p,2)+rect(0,0,640,38,dark)+text(''+gameTitle,22,26,17,paper)
 if(v===1)return rect(147,66,347,467,dark,11)+rect(158,78,324,66,banner,3)+text(gameTitle.slice(0,36),319,106,16,paper,{'text-anchor':'middle','font-weight':700})+group(gameScene(p,1),'translate(162,153) scale(.49)')+group(gameScene(p,2),'translate(171,410) scale(.21)')+group(gameScene(p,0),'translate(330,410) scale(.21)')
 if(v===3&&digital)return group(gameScene(p,0),'translate(38,98) scale(.85)')+group(gameScene(p,2),'translate(332,310) scale(.43)')
 if(v===3)return rect(81,145,292,347,dark,13)+group(gameScene(p,0),'translate(97,161) scale(.41)')+rect(338,145,211,347,p.c,13)+(/switch|nintendo ds/i.test(platform)?rect(394,230,103,135,dark,13)+rect(409,244,72,78,p.accent,4)+repeat(7,i=>rect(409+i*10,336,7,15,steel,0)):circle(443,318,89,'#c8ced0')+circle(443,318,67,p.accent)+circle(443,318,14,dark))+line(342,154,342,481,steel,4)
 return rect(140,55,359,487,dark,10)+rect(151,64,336,52,banner,3)+text(platform,319,97,18,paper,{'text-anchor':'middle','font-weight':700})+group(gameScene(p,0),'translate(151,117) scale(.525)')+rect(151,387,336,143,dark,0)+wrapTitle(gameTitle,25).map((s,i)=>text(s,319,420+i*28,24,paper,{'text-anchor':'middle','font-weight':700})).join('')+text(p.raw.publisher||p.d.brand||'GAME',319,516,11,'#b6c4cc',{'text-anchor':'middle'})
}
function object(p,v){
 // Rare unmatched artifacts use their existing native outline when available;
 // otherwise build a functional tray/display assembly, never a fake photograph.
 const old=p.raw.art,hasOutline=typeof old==='string'&&/^M[\d\s.,-]/i.test(old),w=p.n('object-width',239,317),h=p.n('object-height',153,238)
 if(hasOutline)return group(path(old,p.c,dark,1.3),v===1?'translate(518,86) scale(-2.5,2.5)':v===2?'translate(45,-27) scale(3.3)':'translate(112,136) scale(2.5)')+repeat(3,i=>line(235+i*48,412,259+i*48,428,p.accent,5))
 return texture(p,rect(320-w/2,193,w,h,p.c,21,{stroke:dark,'stroke-width':3}))+rect(339-w/2,213,w-38,h-42,p.accent,12)+repeat(3+Math.floor(p.n('components',0,5)),i=>rect(353-w/2+(i%3)*(w-65)/3,234+Math.floor(i/3)*56,(w-99)/3,39,v===1?dark:paper,7))+(v===2?line(214,442,428,442,steel,11):'')
}

// Symmetric or closed objects need an explicitly drawn alternate face. Cropping
// the front alone would not reveal construction. These views expose their real
// mechanisms, reverse surfaces or constituent parts rather than a fact card.
function constructionFace(p,kind,v){
 const w=p.n('construction-width',220,306),x=320-w/2,c=p.c
 if(kind==='laptop')return rect(116,167,408,243,steel,13)+repeat(60,i=>rect(132+i%12*32,183+Math.floor(i/12)*31,27,24,i%9===0?p.accent:dark,3))+rect(242,349,159,47,c,6)+rect(125,412,390,28,c,6)+rect(155,423,67,10,dark,2)+rect(259,421,42,15,dark,2)+rect(362,421,58,15,dark,2)
 if(['lamp','speaker','wheel','appliance'].includes(kind)){
  if(kind==='wheel')return poly('156,204 468,204 510,423 131,423',dark,{stroke:steel,'stroke-width':3})+repeat(2,i=>poly(`${190+i*147},230 ${256+i*147},230 ${280+i*147},353 ${175+i*147},353`,c,{stroke:steel,'stroke-width':3}))+repeat(8,i=>line(190+i%2*147,250+Math.floor(i/2)*23,256+i%2*147,250+Math.floor(i/2)*23,steel,5))
  if(kind==='appliance')return ellipse(319,293,139,107,c,{stroke:dark,'stroke-width':3})+ellipse(319,293,116,87,steel)+ellipse(319,293,92,65,dark)+ellipse(319,293,62,42,steel)+rect(299,193,42,49,c,9)+path('M240 265q42-41 142 0','none',paper,7)
  if(kind==='speaker'&&v===2)return rect(199,171,242,254,steel,53,{stroke:dark,'stroke-width':3})+repeat(18,i=>line(214,184+i*12,426,184+i*12,dark,4))+repeat(12,i=>line(224+i*17,180,224+i*17,408,dark,2))+rect(266,418,109,34,c,7)
  if(kind==='lamp'&&v===2)return rect(204,148,230,296,c,25,{stroke:dark,'stroke-width':3})+rect(224,174,190,225,'#f1e3bc',13)+rect(304,188,33,155,paper,13)+rect(288,343,65,55,steel,7)+repeat(7,i=>line(292,348+i*7,349,348+i*7,dark,2))+line(225,175,225,399,dark,10)+line(414,175,414,399,dark,10)
  return ellipse(320,294,w/2,105,c,{stroke:dark,'stroke-width':3})+ellipse(320,294,w/2-23,83,dark)+repeat(4,i=>circle(320+Math.cos(i*Math.PI/2+.7)*81,294+Math.sin(i*Math.PI/2+.7)*53,7,steel))+rect(266,272,111,37,steel,5)+circle(292,290,9,dark)+rect(321,282,42,17,dark,3)+path('M366 326q157 84 28 126','none',dark,10)
 }
 if(['cable','stand','leash'].includes(kind)){
  if(kind==='cable'&&p.has(/adapter|hub|reader/))return rect(161,219,320,167,c,25,{stroke:dark,'stroke-width':3})+repeat(4,i=>rect(185+i*75,246,56,23,dark,5))+repeat(4,i=>repeat(5,j=>line(193+i*75+j*9,252,193+i*75+j*9,264,steel,2)))+rect(192,317,255,42,steel,7)+repeat(4,i=>circle(175+i%2*292,234+Math.floor(i/2)*135,4,dark))
  if(kind==='stand'&&p.has(/screen|protector/))return rect(151,171,321,213,'url(#glass)',15,{stroke:steel,'stroke-width':4})+path('M403 178l61 203-164 65-29-21 101-96Z','url(#glass)',paper,3)+rect(436,146,61,27,p.accent,5)
  if(kind==='stand'&&p.has(/grip|caps/))return v===1?ellipse(320,270,123,103,c)+ellipse(320,270,91,74,dark)+repeat(27,i=>circle(320+Math.cos(i*.233)*108,270+Math.sin(i*.233)*89,4,steel))+ellipse(320,352,57,29,p.accent)+rect(304,346,32,91,dark,6):path('M169 283q150-151 302 0v105h-47v-82q-101-85-207 0v82h-48Z',c,dark,3)+path('M216 309q103-72 208 0','none',p.accent,13)+repeat(16,i=>line(207+i*15,243-p.n(i,0,18),207+i*15,269-p.n(i,0,18),steel,3))
  if(v===1)return rect(214,151,216,285,c,17,{stroke:dark,'stroke-width':3})+repeat(4,i=>circle(242+i%2*160,190+Math.floor(i/2)*204,13,steel))+repeat(2,i=>path(`M${266+i*115} 229v114q8 41 43 17`,'none',p.accent,20))+rect(270,371,103,21,dark,5)
  return rect(177,177,285,167,c,16,{stroke:dark,'stroke-width':3})+rect(227,195,185,128,steel,9)+rect(257,219,125,83,dark,7)+line(318,188,318,274,steel,17)+repeat(7,i=>line(303,208+i*11,333,208+i*11,p.accent,2))+path('M195 351h246v53H195Z',p.accent,dark,2)+repeat(20,i=>line(207+i*12,359,207+i*12,392,paper,1.5))
 }
 if(['apparel','textile','curtain'].includes(kind))return texture(p,path('M152 150h319l-24 294-280-17Z',c,dark,3))+path(v===1?'M161 292q142-59 301-23l-41 132-236 13Z':'M176 214q156-33 282 1l-15 100q-143-40-258 13Z',p.accent,dark,2)+repeat(27,i=>line(183+i*10,231,184+i*10,291,paper,1.3))+repeat(21,i=>line(181+i*13,345,186+i*13,354,steel,2))+(p.has(/zip|neck/)?line(224,383,414,372,steel,7):'')
 if(['shelf','bed'].includes(kind))return v===1?furniturePanel(p,164,177,305,235)+repeat(4,i=>rect(185+i%2*234,198+Math.floor(i/2)*156,29,32,dark,8))+repeat(6,i=>circle(226+i*38,282,5,steel)):furniturePanel(p,151,165,333,49)+furniturePanel(p,151,165,39,279)+furniturePanel(p,160,378,306,41)+rect(190,231,56,44,steel,5)+circle(217,250,10,dark)+line(184,338,401,338,p.accent,18)+repeat(6,i=>circle(171,235+i*24,3,dark))
 if(kind==='pan')return rect(153,159,335,257,c,18,{stroke:dark,'stroke-width':3})+repeat(6,i=>ellipse(209+i%3*111,226+Math.floor(i/3)*118,45,41,steel)+ellipse(209+i%3*111,230+Math.floor(i/3)*118,30,24,p.accent))+line(169,180,473,180,paper,5)
 if(kind==='brush')return v===1?rect(177,236,294,49,c,17)+repeat(21,i=>rect(187+i*13,137,8,126+p.n('tooth'+i,-12,12),p.accent,4))+ellipse(319,261,53,9,p.accent):rect(177,173,294,62,c,17)+repeat(21,i=>path(`M${187+i*13} 227v${145+p.n('tooth'+i,-12,12)}q5 22 9 0V227Z`,p.accent))+path('M191 191h258','none',paper,3)
 if(kind==='pet-house'){
  if(p.has(/cat tree|scratch|perch/))return v===1?rect(164,223,315,161,c,17,{stroke:dark,'stroke-width':3})+rect(298,144,43,89,p.accent,9)+repeat(4,i=>circle(193+i%2*257,250+Math.floor(i/2)*105,10,steel))+line(320,297,320,335,steel,6):rect(211,150,213,286,p.accent,29)+repeat(31,i=>path(`M206 ${165+i*8}q118 22 223-4`,'none',c,9))+rect(163,421,309,30,c,13)+circle(320,424,13,steel)
  if(p.has(/tunnel/))return v===1?ellipse(320,286,144,127,c)+ellipse(320,286,112,99,dark)+ellipse(320,286,54,48,p.accent)+repeat(12,i=>line(320+Math.cos(i*.523)*122,286+Math.sin(i*.523)*109,320+Math.cos(i*.523)*138,286+Math.sin(i*.523)*122,steel,2)):path('M159 176q161-82 318 0v238q-163-92-318 0Z',c,dark,3)+repeat(9,i=>path(`M${173+i*35} 181q-19 104 0 205`,'none',steel,7))+path('M196 253q127-44 249 0','none',paper,3,{'stroke-dasharray':'5 4'})
  return rect(172,153,298,284,c,12,{stroke:dark,'stroke-width':3})+rect(195,177,251,231,p.accent,8)+repeat(11,i=>line(214+i*21,187,214+i*21,397,steel,5))+rect(280,270,80,52,dark,6)+line(302,296,343,296,steel,10)
 }
 if(kind==='bicycle')return circle(201,415,51,dark)+circle(438,415,51,dark)+line(201,396,283,225,steel,15)+line(438,396,360,225,steel,15)+line(234,213,405,213,c,23)+line(320,213,320,129,steel,17)+line(229,129,411,129,dark,19)+(v===2?circle(318,265,41,c)+circle(318,265,23,steel)+repeat(6,i=>circle(318+Math.cos(i*1.05)*32,265+Math.sin(i*1.05)*32,3,dark)):'')
 if(kind==='fitness')return rect(180,207,280,178,c,36,{stroke:dark,'stroke-width':3})+ellipse(320,205,140,61,p.accent)+ellipse(320,205,103,41,dark)+repeat(15,i=>line(196+i*18,249,196+i*18,356,steel,3))+(v===1?rect(263,303,115,61,dark,11):rect(221,111,197,34,steel,9)+line(241,145,241,228,steel,12)+line(399,145,399,228,steel,12))
 if(kind==='figure')return rect(217,153,209,277,c,30,{stroke:dark,'stroke-width':3})+rect(244,185,157,198,dark,14)+repeat(4,i=>rect(258,204+i*41,126,24,steel,4))+circle(271,357,11,p.accent)+circle(371,357,11,p.accent)
 if(kind==='toy'){
  if(p.has(/puzzle|board game|chess|domino|mosaic/))return repeat(6,i=>{const px=175+i%3*107,py=194+Math.floor(i/3)*133;return path(`M${px} ${py}h33q-8-28 13-27t13 27h33v32q28-7 28 13t-28 13v33h-32q7 27-13 27t-13-27h-34Z`,v===1?'#aa9476':c,dark,2)})
  if(p.has(/train|car\b|truck|vehicle|boat|bus/))return v===1?poly('158,177 459,177 487,417 138,417',c,{stroke:dark,'stroke-width':3})+repeat(4,i=>rect(120+i%2*321,205+Math.floor(i/2)*150,79,58,dark,12))+line(147,234,469,234,steel,11)+line(145,382,471,382,steel,11)+rect(250,262,138,99,p.accent,11):rect(174,208,294,171,c,12)+circle(196,293,78,dark)+circle(442,293,78,dark)+line(201,292,437,292,steel,22)+circle(318,292,43,p.accent)+repeat(8,i=>rect(276+i%4*27,218+Math.floor(i/4)*121,16,21,steel,2))
  return repeat(8,i=>{const px=149+i%4*90,py=180+Math.floor(i/4)*163;return rect(px,py,72,111,c,5,{stroke:dark,'stroke-width':2})+repeat(3,j=>circle(px+36,py+20+j*33,12,v===1?dark:p.accent))+line(px+15,py+13,px+15,py+97,steel,2)})
 }
 return null
}

function renderFace(renderer,p,kind,v){
 const result=renderer(p,v)
 if(v===0||v===3)return result
 const front=renderer(p,0)
 if(result!==front)return result
 const face=constructionFace(p,kind,v)
 if(!face)throw new Error(`Missing meaningful ${v} face for ${kind}: ${p.title}`)
 return face
}

const renderers={game,console:consoleArt,shoe,apparel,controller,arcade,wheel,headphones,keyboard,mouse,laptop:(p,v)=>display(p,v,true),display,camera,speaker,cable,beauty,palette,lipstick,pencil,brush,bag,textile,curtain,chair,table:tableArt,shelf,bed,lamp,mirror:mirrorArt,basket,pan,plate,bowl,cup,utensil,appliance,'pet-house':petHouse,leash,bicycle,ball,figure,book,toy,fitness,stand,food,vase,jar,object}
for(const family of specialtyFamilies)renderers[family]=(p,v)=>renderSpecialty(family,p,v)
export const supportedProductAssetTypes=Object.freeze(Object.keys(renderers))
function viewNumber(view){if(Number.isInteger(view)&&view>=0&&view<=3)return view;return ({front:0,primary:0,alternate:1,back:1,detail:2,context:2,contents:3,parts:3})[view]??0}
export function describeProductAsset(descriptor,view=0){const p=model(descriptor),kind=classifyProductAsset(descriptor),index=viewNumber(view),digital=descriptor.format==='digital'||descriptor.format==='digital-add-on'||p.raw.accessorySubtype==='digital-add-on',names=kind==='game'?(digital?['Digital cover artwork','Game world','Illustrated game scene','Digital artwork collection']:['Cover artwork','Rear packaging and scenes','Illustrated game world','Case and media']):['Product view','Reverse or interior view','Construction and material detail','Component and alternate views'];return {kind,type:kind,supported:typeof renderers[kind]==='function'&&kind!=='object',view:index,label:names[index],title:p.title,material:p.material,color:p.c,features:[p.shape,p.material,p.raw.type||p.d.type].filter(Boolean)}}
export function renderProductAsset(descriptor,view=0){
 const p=model(descriptor),meta=describeProductAsset(descriptor,view),v=meta.view,renderer=renderers[meta.kind]
 if(!renderer)throw new Error(`No product artwork renderer for ${meta.kind}: ${p.title}`)
 // Slight product-specific physical proportions keep two authored constructions
 // distinct even when their catalog happens to use one broad family name.
 const sx=p.n('physical-profile-x',.95,1.05),sy=p.n('physical-profile-y',.96,1.04)
 let artwork
 if(v===3&&meta.kind==='console'){
  const portable=p.has(/switch|nintendo ds|handheld/),power=model({...p.d,title:'Power supply and lead',raw:{...p.raw,title:'Power supply and lead',description:'Original console power adapter',shape:'adapter'}})
  artwork=group(renderer(p,0),'translate(-40,30) scale(.72)')+group(cable(power,0),'translate(310,245) scale(.38)')+(portable?(p.has(/bundle/)?group(bag(p,2),'translate(287,59) scale(.43)'):''):group(controller(p,0),'translate(283,85) scale(.42)'))
 }else if(v===3&&meta.kind!=='game'){
  artwork=group(renderFace(renderer,p,meta.kind,1),'translate(-49,62) scale(.72)')+group(renderFace(renderer,p,meta.kind,2),'translate(300,199) scale(.5)')
 }else artwork=renderFace(renderer,p,meta.kind,v)
 // The close view uses a genuinely different object face/detail above and a
 // tighter optical framing, so material, stitching, ports and fittings are clear.
 const viewTransform=v===2&&meta.kind!=='game'?'translate(-32,-24) scale(1.1)':v===1?'translate(8,9) scale(.975)':''
 const framed=group(group(artwork,viewTransform),`translate(${320*(1-sx)} ${290*(1-sy)}) scale(${sx} ${sy})`)
 return `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="600" viewBox="0 0 640 600" role="img" aria-label="${esc(p.title+' — '+meta.label)}" data-product-form="${esc(meta.kind)}" data-view="${v}"><title>${esc(p.title+' — '+meta.label)}</title><desc>${esc(meta.label+'. '+(p.raw.description||''))}</desc>${surfaceDefs(p)}${rect(0,0,640,600,'#f5f4f0')}${ellipse(320,493,214,18,'#b9b7b0',{opacity:.19})}<g data-asset-object="${esc(meta.kind)}" clip-path="url(#canvas)">${framed}</g></svg>`
}
