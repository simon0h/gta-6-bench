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
 // k names the item itself (title and catalog type), without descriptions that
 // mention other products ("pair with shorts", "dishwasher safe").
 const k=[title,raw.type,raw.productType,raw.shape,raw.artShape,raw.category,d.category].map(specString).join(' ').toLowerCase()
 return {d,raw,title,t:title.toLowerCase(),k,full,h,n,c,accent,material,shape,has,count,specs,platform:d.platform||raw.catalogPlatform||raw.platform||'',width:n('width',165,225),height:n('height',200,290)}
}

// What the product physically is outranks incidental title words: a fitness top
// is a garment, a hair dryer is not a tumble dryer and sunglasses are not cups.
const garmentEnd=/\b(?:t-shirts?|tees?|shirts?|tops?|jerseys?|hoodies?|jackets?|shorts|leggings?|bras?|jumpers?|sweaters?|sweatshirts?|cardigans?|coats?|pyjamas?|pajamas?|robes?|costumes?|tights|joggers|gloves|singlets?|polos?|vests?|dress(?:es)?|skirts?|trousers|pants|pullovers?|anoraks?|parkas?|gilets?|onesies?|bodysuits?|swimsuits?|leotards?|tracksuits?|windbreakers?|fleeces?|crew)$/
const notGarment=/\b(?:table|counter|work|bench|desk|spinning|roof|cook|stove|hob|tree|bar|flip|pop|laptop|high|low|mid|cake|muffin|box|bottle|jar|lid|screw|pump)[- ]tops?$|\b(?:top|base|gel|clear|nail|under|primer|paint|sealer|matte|glossy)[- ]?coats?$|\bgolf tees?$|\b(?:baby|door(?:way)?|activity) jumpers?$/
const produceWords=/\b(?:bananas?|apples|avocados?|persimmons?|kiwi ?fruit|kiwis?|mango(?:es|s)?|carrots?|sweet potato(?:es)?|grapes|oranges|lemons|limes|tomato(?:es)?|strawberries|blueberries|raspberries|spinach|lettuce|pears|peaches|mangoes|mangos|kiwis|kiwifruit|clementines|mandarins|potatoes|onions|carrots|broccoli|cucumbers?|peppers|cherries|plums|melons?|watermelons?|pineapples?|salad greens|mixed greens)\b/
const notProduce=/chips|crisps|juice|candy|sauce|jam|dried|freeze|snack|cereal|\bbars?\b|flavou?r|scented|candle|soap|toy|plush|puzzle|shampoo|lotion|cookie|\bpie\b|muffin|bread|smoothie|baby food|pouch|puree|vinegar|seeds?\b|plant|tree|charm|ornament|\boil\b|soup|paste|ketchup|salsa|powder|extract|\btea\b|water|drink|milk|yogh?urt|ice cream|cake|tart|wine|gum/
// Korean fruit and vegetable names (감 alone is persimmon; 감자 potato and 감귤 tangerine are their own words).
const produceKo=/사과|배(?=\s|$)|신고배|나주배|키위|단감|홍시|대봉|(?:^|\s)감(?=\s|$|\d)|바나나|감귤|귤(?!\s*칩)|한라봉|천혜향|레드향|오렌지|레몬|포도|샤인머스캣|딸기|토마토|방울토마토|수박|참외|멜론|복숭아|자두|체리|블루베리|망고|아보카도|양파|감자|고구마|당근|오이|브로콜리|양배추|배추|파프리카|애호박/
const notProduceKo=/마스크|시트|팩|수분|크림|토너|세럼|로션|샴푸|주스|즙|잼|칩|말랭이|건조|말린|젤리|과자|음료|식초|우유|아이스|맛|향|청(?=\s|$)|퓨레|분말|스낵|캔디|사탕|씨앗|모종|화분|비누|샴푸|크림|배송|배달|배터리|배낭/
const isProduce=(text,context='')=>(produceWords.test(text)&&!notProduce.test(text)&&/produce|fruit|vegetable|grocery|food|fresh|\bbag\b|\blb\b|\beach\b/.test(text+' '+context))||(produceKo.test(text)&&!notProduceKo.test(text)&&!notProduce.test(text))
function headNoun(t){
 let head=t.split(/\s+[-–—|:]\s+|\s*[(,[]/)[0]
 head=head.replace(/(?:\s+(?:\d+(?:\.\d+)?\s*(?:"|”|''|in|inch|-inch|cm|mm|l|ml|oz|qt|pc|pk|ct|pack|-pack|pieces?)?|\d+-?(?:pack|pc|pk|piece)|sets?|size\s+\S+|\d+\/\d+|x{0,3}s|m|l|x{1,3}l))+$/,'')
 return head.trim()
}
function productNoun(t,{type,category,merchandising}){
 const head=headNoun(t),context=`${type} ${category} ${merchandising}`.toLowerCase()
 if(garmentEnd.test(head)&&!notGarment.test(head))return 'apparel'
 if(/\b(?:short|long|half|cap|3\/4)[- ]?sleeved?\b|\bsleeveless\b/.test(t)&&!/(?:bag|case|cover|pillow|sheet|box|holder|hanger|rack|organi[sz]er)$/.test(head))return 'apparel'
 if(/\b(?:sunglasses|sunnies|goggles|eyeglasses|spectacles|eyewear|(?:reading|blue[- ]light|safety|optical|prescription|computer|gaming|ski|swim|snow) glasses)\b/.test(t)&&!/\b(?:case|cloth|strap|chain|cord|holder|stand|wipes|spray|cleaner|vr|virtual reality|headset)\b/.test(t))return 'eyewear'
 if(/\b(?:paper towels?|kitchen (?:paper )?rolls?|toilet (?:paper|rolls?|tissue)|bath tissue|loo rolls?)\b/.test(t)&&!/holder|dispenser|stand|hanger|storage|organi/.test(t))return 'paper-roll'
 if(/\b(?:hair ?dryers?|blow ?dryers?|air ?wrap|multi-?styler|air styler|hair styler|flexstyle|straighteners?|flat irons?|curling (?:irons?|wands?|tongs)|hair curlers?|hot (?:air )?brush|dryer brush|crimpers?|hair wavers?)\b/.test(t)||/\bdryers?\b/.test(t)&&/beauty|hair/.test(context))return 'hair-tool'
 if(/\bdishwashers?\b/.test(t)&&!/(?:-| )safe|tablets?|pods?|detergent|salt|rinse|cleaner|liquid|soap|basket|rack|cutlery|magnet|cover|\bgel\b|powder/.test(t))return 'dishwasher'
 if(/\bair ?fryers?\b/.test(t)&&!/oven|toaster|liners?|paper|cookbook|\brack|accessor|\btray|\bmat\b|parchment/.test(t))return 'air-fryer'
 if(/\bblood pressure (?:monitor|machine|cuff)|\bbp monitor\b|sphygmomanometer/.test(t))return 'health-monitor'
 if(/\btreadmills?\b|\bwalking pad\b/.test(t)&&!/\bmat\b|lubricant|\bbelt\b/.test(t))return 'fitness'
 if(/\b(?:washing machine|washer dryer|tumble dryer|clothes dryer|front.load washer|top.load washer)\b/.test(t))return 'appliance'
 if(/\bdoll(?:'s|s)?\s+(?:pram|carriage|stroller|buggy|pushchair)\b/.test(t))return 'stroller'
 if(/\bdoll(?:'s|s)?\s?houses?\b/.test(t))return 'toy'
 if(/\bice cream\b/.test(t)&&!/maker|machine|attachment|scoop|cart|truck|van|shop|parlou?r|playset|\btoy|play-doh|bowl|cone holder|stand/.test(t)&&!/toy/.test(context))return 'food'
 if(isProduce(t,context))return 'food'
 return null
}
// Home-goods and toy phrases name the item more exactly than their last word: a
// table runner is linen, a plant pot is not cookware, a charcoal grill is not an
// oven and a LEGO police car is a brick set. These run before the word rules.
function homeGoods(t,full,brand){
 if(/\b(?:table ?runners?|tablecloths?|table ?cloths?|table linens?|placemats?|place mats?)\b/.test(t))return 'textile'
 if(/\bplant (?:stands?|tables?|ladders?)\b|\bplanter stands?\b|\bflower stands?\b/.test(t))return 'stand'
 if(/\b(?:plant|flower) ?pots?\b|\bplanters?\b|\bcache ?pots?\b|\bpotted plants?\b/.test(t)&&!/\b(?:saucer|tray|mat|stand|food|soil|compost|feed|labels?|spikes?)s?$/.test(t))return 'vase'
 if(/\b(?:faucets?|mixer taps?|(?:kitchen|basin|bath|bathroom|sink|pillar|monobloc) (?:mixer )?taps?)\b/.test(t)&&!/aerator|filter|cartridge|extender|cover|washers?\b/.test(t))return 'faucet'
 if(/\bshower ?heads?\b|\b(?:hand(?:held)?|rain|overhead|thermostatic|mixer|electric) showers?\b|\bshower (?:systems?|sets?|columns?|mixers?|valves?|panels?|towers?|kits?|faucets?)\b/.test(t)&&!/curtain|caddy|speaker|radio|\bgel\b|\bcap\b|\bmat\b|cream|filter|hooks?\b|rail\b|\brod\b/.test(t))return 'faucet'
 if((/\b(?:charcoal|gas|kettle|pellet|propane|kamado|portable|outdoor)\s+(?:grills?|bbqs?|barbecues?)\b|\bbarbecues?\b|\bbbqs?\b|\bsmokers?\b/.test(t))&&!/\bpan\b|brush|tongs|cover|\bmat\b|sauce|\brub\b|tools?\b|utensil|apron|thermometer|skewer|cleaner|scraper|basket|charcoal bags?|briquettes?|lighter|chips|pellets$|cookbook|book\b/.test(t))return 'grill'
 if(/\b(?:desk|tower|pedestal|floor|box|table|ceiling|wall|clip|bladeless|oscillating|usb) fans?\b/.test(t)&&!/heater|light kit|remote|blades?$/.test(t))return 'appliance'
 if(/\b(?:espresso|coffee|capsule|pod|cappuccino|latte|bean.to.cup)\s+(?:machines?|makers?)\b|\bespresso maker\b|\bbarista (?:express|touch|pro)\b/.test(t)&&!/descal|clean|tablets?|filters? papers?|cover|mug|cups? set|capsules? pack|pods? pack|variety|moka|stove/.test(t)&&!(/espresso maker/.test(t)&&!/machine|electric|automatic|pump|bar\b/.test(t)))return 'coffee-machine'
 if(/\bwireless charg(?:ers?|ing (?:pads?|stands?|stations?|docks?|mats?))\b|\bcharging pads?\b|\bqi2? (?:charg|pad)|\bmagsafe charger\b/.test(t))return 'wireless-charger'
 if(/\b(?:roller|quad|inline|in-line|ice|figure|hockey)?\s*skates?\b/.test(t)&&!/skateboard|shoes?\b|sneakers?|helmet|pads?\b|guards?\b|bags?\b|wheels\b|bearings?|sharpen|tool|laces|socks|rink/.test(t))return 'skates'
 if(/\b(?:play-?doh|play ?dough|modell?ing (?:clay|dough|compound)|kinetic sand|thinking putty|air.dry clay|plasticine)\b/.test(full)&&!/scraper|cutter|pizza|cookie|bread|proofing/.test(t))return 'toy'
 if((/\blego\b|\bduplo\b|mega bloks/.test(full)||/^(?:lego|mega bloks)$/.test(brand))&&!/storage|backpack|\bbag\b|lunch|watch|\bbook\b|t-shirt|shirt|pyjama|costume|\blamp\b|clock|key ?ring|key ?chain|video game/.test(full.replace(/book nook/g,"")))return 'toy'
 if(/\bvanity\b/.test(t)&&/playset|\btoys?\b|kids|children|girls|light-up|pretend|\bplay\b|beauty set|vanity set|dimples/.test(full))return 'toy'
 // Household, personal-care and grocery items (English and Korean names).
 if(/\bnecklaces?\b|\bpendants?\b|\bearrings?\b|\bbracelets?\b|\banklets?\b|\bbangles?\b|\b(?:diamond|gold|silver|engagement|wedding|promise|eternity|signet|birthstone) rings?\b|목걸이|귀걸이|귀고리|반지(?!갑)|팔찌|발찌|펜던트|주얼리/.test(t)&&!/holder|organi[sz]er|\bstand\b|jewel(?:le)?ry box|\bcase\b|\btree\b|\bdish\b|cleaner|charger|watch|\bkit\b|making|maker|craft|beads?\b|loom/.test(t))return 'jewelry'
 if(/graphics cards?|\bgpu\b|\bgeforce rtx ?\d{4}|\bradeon rx ?\d{4}|그래픽 ?카드|지포스 ?rtx/.test(t)&&!/laptop|notebook|desktop|gaming pc|\bpc\b|노트북|데스크탑|조립|컴퓨터|mount|bracket|support|holder|riser|cable/.test(t))return 'graphics-card'
 if((/\b(?:aa|aaa|9v|lr6|lr03)\b.{0,30}\bbatter(?:y|ies)\b|\bbatter(?:y|ies)\b.{0,30}\b(?:aa|aaa|9v)\b|\balkaline batter|\bcoin cells?\b|\bcr2032\b|건전지/.test(t))&&!/charger|power bank|portable|laptop|camera|car battery|jump|operated|powered|included|remote|toy|holder|tester|organi[sz]er/.test(t))return 'battery'
 if(/\b(?:face|disposable|surgical|kf94|kf80|kn95|n95|medical|dust|protective) masks?\b|\bkf94\b|\bkn95\b|보건용 ?마스크|일회용 ?마스크|덴탈 ?마스크|마스크(?!\s*팩|\s*시트)/.test(t)&&!/sheet|clay|peel|sleep|eye mask|hair mask|mask pack|lip mask|halloween|costume|snorkel|dive|\bski\b|welding|hydrat|moistur|charcoal|\bgel\b|cream|serum|overnight|brighten|glow|skin|pore|collagen|honey|\bmud\b|exfoliat|마스크팩|수면|팩|헤어|시트|수분|모델링|필오프/.test(t))return 'face-mask'
 if(/\bdiapers?\b|\bnapp(?:y|ies)\b|\bpull-?ups\b|training pants|\bsanitary (?:pads?|towels?|napkins?)\b|\bpanty ?liners?\b|\bincontinence pads?\b|기저귀|생리대|팬티라이너|요실금/.test(t)&&!/\bbags?\b|cream|rash|pail|caddy|changing|cake|backpack|organi|wipes|bin\b|liners? for/.test(t))return 'diapers'
 if(/toothbrush|tooth brush|칫솔|toothpaste|치약/.test(t)&&!/holder|\bstand\b|\bcase\b|\bcover\b|saniti[sz]er|replacement heads?|brush heads?|travel kit|칫솔걸이|칫솔꽂이|살균기/.test(t))return 'oral-care'
 if(/\bdish(?:washing)? (?:soap|liquid|detergent|gel)\b|washing.?up liquid|주방세제|퐁퐁/.test(t)&&!/dishwasher|tablets?|pods?|brush|sponge|dispenser|caddy/.test(t))return 'dish-soap'
 if((/\b(?:beef|pork|lamb|veal|steaks?|ribeye|sirloin|brisket|mince|minced|chicken (?:breasts?|thighs?|wings?|drumsticks?|fillets?)|whole chicken|pork (?:belly|chops?|loin)|bacon|salmon fillets?|cod fillets?|fish fillets?|tuna steaks?|mackerel|sea bass|prawns|raw shrimp)\b|삼겹살|오겹살|목살|한우|한돈|소고기|쇠고기|돼지고기|닭가슴살|닭다리|닭고기|정육|등심|안심|차돌|불고기|고등어|연어|갈치|굴비|생선|광어/.test(t))&&!/\bdog|\bcat\b|\bpets?\b|treats?|jerky|chips|crisps|flavou?r|soup|noodle|ramen|broth|stock|sauce|seasoning|\brub\b|marinade|gravy|snack|bites|reward|canned|\bcan\b|\btin\b|pouch|\bpie\b|pizza|sandwich|sausage roll|kibble|\bfood\b|toy|plush|comfort|cuddl|heat|warm|knife|knives|fork|plate|board|\bpan\b|skillet|grill|thermometer|tongs|press|만두|교자|라면|스프|육수|소스|사료|간식|통조림|캔|맛|볶음밥|햄|스팸|죽|과자|칩/.test(t))return 'meat'
 if(/storage (?:box|boxes|bins?|containers?)\b|리빙박스|수납박스|정리박스/.test(t)&&!/\bbed\b|bench|ottoman|shelf|unit|drawers?|vacuum|food|lunch|bread|cereal|pantry|jewel|tea|coffee|spice/.test(t))return 'basket'
 if(/\bice (?:makers?|machines?)\b|제빙기/.test(t)&&!/tray|mould|mold|scoop|bag/.test(t))return 'appliance'
 if(/\b(?:glass|surface|multi.?surface|all.?purpose|bathroom|kitchen|oven|toilet|granite|stainless steel|wood|leather|jewel(?:le)?ry|stone|tile|grout|drain|shower|window) cleaner\b|cleaning (?:spray|solution)|\bdisinfectant\b|\bbleach\b/.test(t)&&!/vacuum|machine|robot|cordless|wet.?dry|wipes|cloth|brush|sponge|\bpads?\b|tablets?/.test(t))return 'beauty'
 return null
}
// Toy sets borrow the names of what they model: a LEGO F1 helmet, a roller
// coaster, an ice-cream cart or a light-up house are still toys.
const toyBrands=/^(?:lego|playmobil|play-doh|leapfrog|vtech|fisher-price|hot wheels|barbie|mattel|hasbro|melissa & doug|little tikes|bluey|peppa pig|paw patrol|mega bloks|duplo)$/
function toyOverride(descriptor,kind){
 const raw=descriptor.raw||{},t=String(descriptor.title||raw.title||'').toLowerCase()
 const hints=[raw.type,raw.typeLabel,raw.category,raw.artFamily,raw.shape,raw.artShape,descriptor.category].filter(Boolean).join(' ').toLowerCase()
 const toyish=/\b(?:toys?|playsets?|lego|bricks|building sets?|dolls|board games|games & puzzles|pre-school|figures?)\b/.test(hints)||toyBrands.test(String(raw.brand||descriptor.brand||'').toLowerCase().trim())
 if(!toyish)return kind
 const borrowed=kind==='apparel'&&/\bhelmets?\b/.test(t)||kind==='fitness'&&/\broller\b|\bbalance beam\b/.test(t)||kind==='pet-house'&&/\bscoop\b|\bcoop\b/.test(t)||kind==='beauty'&&/\bcream\b|vanity|make-?up/.test(t)||kind==='lamp'&&/\blight/.test(t)
 if(!borrowed)return kind
 return /^(?:figure|doll)$/.test(String(raw.shape||raw.artShape||'').toLowerCase())?'figure':'toy'
}
// Prefer the title over a broad merchandising family. A cat tunnel is not a bed,
// and a charging-cable keeper must never acquire electrical pins in its artwork.
export function classifyProductAsset(descriptor){return toyOverride(descriptor,classifyByName(descriptor))}
function classifyByName(descriptor){
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
 const noun=productNoun(t,{type,category,merchandising})
 if(noun)return noun
 const home=homeGoods(t,p.t,brand)
 if(home)return home
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
  if(type==='hair dryer')return 'hair-tool'
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
 if(/smart plug|streaming.*player|thermostat|doorbell|power bank|motion sensor|door\/window sensor|air quality sensor|wireless dimmer|smart hub|hub for smart|energy monitor|^\S+ plug$/.test(t))return 'smart-device'
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
  ['apparel',/\b(?:shirt|tee|hoodie|jacket|jersey|tank|bra|shorts|pants|legging|tights|skirt|dress|vest|swimsuit|singlet|anorak|polo|sweat|trouser|bikini|rash guard|balaclava|sock|glove|cap|beanie|joggers|tracksuit|windbreaker|jeans|scarf|bandana|crewneck|jumper|cardigan|pyjamas?|pajamas?|costume|onesie|parka|gilet)\b|목욕 가운|티셔츠|셔츠|장갑/],
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
  ['beauty',/eau de (?:toilette|parfum|cologne)|serum|shampoo|conditioner|\bcream\b|cleanser|moistur|toner|balm|lotion|fragrance|perfume|parfum|detergent|cologne|\bmist\b|spray|gloss|lip oil|foundation|concealer|primer|mascara|powder|\bgel\b|essence|\bwash\b|\bsoap\b|scrub|\bmask\b|sun.*screen|body polish|세안|크림|토너|워시|로션|에센스|마스크|샴푸|트리트먼트|스크럽|세제/],
  ['appliance',/vacuum|(?:vacuum|floor|carpet|steam|robot|cordless|stick|upright|cylinder|canister|handheld|wet.?dry) cleaner|dryer|\bfan\b|heater|kettle|toaster|blender|\bmixer\b|processor|coffee (?:maker|grinder)|espresso machine|air fryer|rice cooker|\boven\b|\bfridge\b|refrigerator|washer|washing machine|humidifier|purifier|projector|sewing machine|청소기|전기포트|선풍기/],
  ['pet-house',/\bcage\b|kennel|aquarium|terrarium|habitat|hutch|\bcoops?\b|cat tree|scratch|perch|tunnel|reptile hide|횃대|스크래처|터널/],
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
 const pants=p.has(/pants|trouser|legging|tights|shorts|jogger/),short=p.has(/shorts/),dress=p.has(/dress|skirt/),sleeveless=p.has(/tank|bra\b|vest|singlet/),long=p.has(/long|hoodie|jacket|sweatshirt|fleece|anorak|windbreaker|sweater|winter crew/)||/jumper|cardigan|\bcoat\b|puffer|pyjama|pajama|\brobe\b|parka|pullover|hooded|jumpsuit|onesie/.test(p.k),sock=p.has(/sock/),cap=p.has(/cap\b|beanie|hat\b/),glove=p.has(/glove/),w=p.n('garment-width',170,225),hem=p.n('hem',392,440),c=tone(p,p.c)
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
function display(p,v,laptop=false){if(!laptop&&/television|\btvs?\b|smart tv|oled|qled/.test(p.k)&&!/monitor|tablet|phone|projector|\bstand\b|mount|bracket|remote/.test(p.t))return television(p,v);const phone=p.has(/phone/),tablet=p.has(/tablet|reader|e-ink|e-paper/),w=phone?174:tablet?266:p.n('display-width',357,443),h=phone?306:tablet?322:p.n('display-height',238,279),x=320-w/2,y=phone?116:156
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
function speaker(p,v){if(/sound ?bar/.test(p.k))return soundbar(p,v);const mic=p.has(/microphone/),radio=p.has(/radio|clock|recorder/),h=p.n('speaker-height',220,306),w=p.n('speaker-width',145,208),x=320-w/2
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
// Folded towels stacked with their folds and hems showing.
function towelStack(p,v){const n=Math.max(2,Math.min(5,Number(p.t.match(/(\d+)\s*(?:-\s*)?(?:pack|pk|piece|pc|장|매)/)?.[1])||3)),w=p.n('towel-w',250,290),th=p.n('towel-th',44,54),x=320-w/2
 const towel=(y,i)=>rect(x,y,w,th,i%2&&/set|pack|장|매/.test(p.t)?p.accent:p.c,th/2.4,{stroke:dark,'stroke-width':2})+line(x+14,y+th*.5,x+w-14,y+th*.5,'#ffffff',2)+rect(x+w*.62,y+4,w*.08,th-8,'#ffffff',3,{opacity:.35})
 const stack=repeat(n,i=>towel(440-(i+1)*(th+4),i))
 if(v===1)return group(stack,'translate(-70,0) scale(.8 1)')+rect(380,140,150,300,p.c,10,{stroke:dark,'stroke-width':2})+rect(380,400,150,24,p.accent,4)+repeat(20,i=>line(388+i*7,150,388+i*7,396,'#ffffff',1))
 if(v===2)return group(stack,`translate(${320-1.9*320} ${280-1.9*(440-th*n/2)}) scale(1.9)`)
 return stack}
function textile(p,v){const pillow=p.has(/pillow|cushion|방석|베개|쿠션/),roll=p.has(/yoga mat|rolled|foam.*mat/),neck=p.has(/neck.*(?:pillow|support)|경추/),rug=p.has(/rug|mat/),w=p.n('textile-width',282,391),h=p.n('textile-height',pillow?182:231,pillow?235:302),x=320-w/2,y=174
 if(/\btowels?\b|수건|타월/.test(p.t)&&!/rail|holder|ring|hook|paper|kitchen roll|rack|bar\b/.test(p.t))return towelStack(p,v)
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
 const cubes=Number(p.t.match(/(\d+)\s*(?:-\s*)?cubes?\b/)?.[1])
 if(cubes>=2&&cubes<=25&&v!==2)return cubeUnit(p,v,cubes)
 if(p.has(/bookend/))return repeat(2,i=>path(`M${179+i*172} 171h39v216h85v29H${179+i*172}Z`,p.c,dark,3))+repeat(5,i=>line(188+i*9,397,188+i*9,411,p.accent,1))
 if(v===2)return furniturePanel(p,153,181,311,57)+furniturePanel(p,153,180,36,229)+repeat(5,i=>circle(169,257+i*23,3,dark))+rect(185,248,21,17,steel,3)+circle(175,209,9,steel)+line(169,326,271,326,p.accent,8)
 const shell=furniturePanel(p,x,y,w,h)+rect(x+13,y+13,w-26,h-26,v===1?p.accent:'#f0ece2',2)
 if(v===1)return shell+path(`M${x+17} ${y+17}l${w-34} ${h-34}m0-${h-34}L${x+17} ${y+h-17}`,'none',steel,3)
 return shell+repeat(rows-1,i=>furniturePanel(p,x+13,y+(i+1)*h/rows,w-26,12))+(cols>1?furniturePanel(p,315,y+13,13,h-26):'')+(cabinet?repeat(p.has(/drawer/)?rows:cols+1,i=>{const count=p.has(/drawer/)?rows:cols+1;return p.has(/drawer/)?furniturePanel(p,x+19,y+18+i*(h-35)/count,w-38,(h-42)/count-8)+line(301,y+39+i*(h-35)/count,340,y+39+i*(h-35)/count,dark,5):furniturePanel(p,x+18+i*(w-34)/count,y+17,(w-37)/count-5,h-34)+line(x+43+i*(w-34)/count,y+h*.47,x+43+i*(w-34)/count,y+h*.59,dark,5)}):'')
}
// A cube storage unit drawn with the number of cubes its name gives ("9 Cube" is 3 by 3).
function cubeUnit(p,v,cubes){const cols=cubes<=3?cubes:cubes===4?2:cubes<=6?3:cubes===8?4:Math.ceil(Math.sqrt(cubes)),rows=Math.ceil(cubes/cols),cell=Math.min(p.n('cube-cell',82,96),400/Math.max(cols,rows)),t=12,w=cols*cell+t,h=rows*cell+t,x=320-w/2,y=440-h
 let body=furniturePanel(p,x,y,w,h)+repeat(cols*rows,i=>rect(x+t+(i%cols)*cell,y+t+Math.floor(i/cols)*cell,cell-t,cell-t,'#f0ece2',2))
 if(v===1)body+=repeat(Math.min(cubes,cols*rows),i=>i%3===1?rect(x+t+(i%cols)*cell+4,y+t+Math.floor(i/cols)*cell+6,cell-t-8,cell-t-10,p.accent,4)+rect(x+(i%cols)*cell+cell/2-8,y+t+Math.floor(i/cols)*cell+14,16,6,dark,3):'')
 return body}
function bed(p,v){const pet=p.has(/pet|cat|dog|small animal|cushion|cuddler/),crib=p.has(/crib|cot/),width=p.n('bed-width',297,382),x=320-width/2
 if(pet)return ellipse(320,318,width/2,111,p.c)+ellipse(320,309,width/2-31,81,p.accent)+texture(p,ellipse(320,315,width/2-62,53,p.c))+(v===1?ellipse(320,323,width/2-29,84,dark)+repeat(40,i=>circle(210+p.n(`dotx${i}`,0,220),273+p.n(`doty${i}`,0,100),2,steel)):'')+(v===2?path('M227 302q91-53 188 0','none',paper,5):'')
 const frame=poly(`${x},227 ${x+width-24},202 ${x+width+43},370 ${x+32},410`,p.c,{stroke:dark,'stroke-width':3})+rect(x,152,width-23,83,p.accent,7)+path(`M${x+32} 408v40m${width-3}-77v58M${x} 228v185`,'none',dark,13)
 return frame+(v===1?repeat(11,i=>line(x+20+i*(width-28)/11,242,x+44+i*(width-28)/11,374,steel,14)):poly(`${x+13},233 ${x+width-28},217 ${x+width+28},355 ${x+39},389`,paper)+texture(p,poly(`${x+26},281 ${x+width-7},260 ${x+width+27},355 ${x+39},389`,p.accent))+rect(x+31,237,(width-80)/2,52,paper,16)+rect(x+width/2,231,(width-80)/2,52,paper,16))+(crib?repeat(13,i=>line(x+35+i*(width-8)/13,289,x+35+i*(width-8)/13,403,p.accent,8)):'' )
}
function lamp(p,v){const floor=p.has(/floor|tall|standing lamp/),task=p.has(/task|adjustable|hinged|reading|magnifier/)||/work lamp|desk lamp|architect|swing.?arm|clamp lamp|spotlight/.test(p.k),lantern=p.has(/lantern|camping/),w=p.n('shade-width',141,212),h=p.n('shade-height',103,162)
 if(lantern)return rect(233,181,174,229,p.c,23)+rect(250,213,140,155,'#f4e5b8',12)+repeat(5,i=>line(253+i*33,207,253+i*33,374,dark,6))+path('M251 181v-40q70-70 139 0v40','none',dark,13)+ellipse(320,414,105,15,dark)
 if(v===1&&task)return line(312,417,218,285,steel,18)+line(218,285,380,161,steel,15)+circle(218,285,20,dark)+ellipse(367,177,70,42,p.accent)+ellipse(320,439,106,21,p.c)
 if(v===0&&task){const ex=p.n('elbow-x',236,268),ey=p.n('elbow-y',236,266),hx=p.n('head-x',392,420),hy=p.n('head-y',150,172);return ellipse(262,446,80,16,p.c)+rect(248,418,28,28,dark,6)+line(262,424,ex,ey,steel,10)+line(276,420,ex+12,ey+4,dark,2)+circle(ex,ey,13,dark)+line(ex,ey,hx,hy,steel,10)+line(ex+10,ey-12,hx-6,hy-14,dark,2)+circle(hx,hy,11,dark)+group(path('M-26 -8L22 -30L74 50Q36 82 -14 52Z',p.c,dark,3)+ellipse(30,66,44,12,'#f3e6bd',{transform:'rotate(-32 30 66)'}),`translate(${hx} ${hy})`)}
 if(v===0&&floor){const top=p.n('floor-top',84,104),sw=w*.62;if(p.has(/\barc|arched|\bbow\b/))return ellipse(214,446,72,14,p.c)+path(`M214 440V250Q214 ${top} 350 ${top}Q446 ${top} 452 214`,'none',steel,8)+texture(p,path(`M${452-sw*.5} 262Q452 170 ${452+sw*.5} 262Z`,p.c,dark,3))+ellipse(452,262,sw*.5,10,'#f3e6bd');return ellipse(320,446,74,13,p.c)+line(320,442,320,top+h*.7,steel,7)+texture(p,path(`M${320-sw*.34} ${top}H${320+sw*.34}L${320+sw*.5} ${top+h*.82}H${320-sw*.5}Z`,p.c,dark,3))+ellipse(320,top+h*.82,sw*.5,7,'#f3e6bd',{opacity:.8})}
 if(v===2)return ellipse(320,272,w/2+47,87,p.c)+ellipse(320,272,w/2+30,71,'#f3e6bd')+circle(320,273,30,paper)+rect(303,286,34,51,steel,8)+repeat(8,i=>line(307,293+i*5,333,293+i*5,dark,1.5))
 return ellipse(320,442,108,18,p.c)+line(320,438,320,floor?154:262,steel,11)+(task?line(320,261,408,185,dark,13)+ellipse(399,192,84,41,p.c):texture(p,path(`M${320-w*.38} ${floor?126:177}H${320+w*.38}L${320+w*.6} ${floor?126+h:177+h}H${320-w*.6}Z`,p.c,dark,3)))
}
function mirrorArt(p,v){const round=p.has(/round|oval|circular/),w=p.n('frame-width',221,318),h=p.n('frame-height',251,331),x=320-w/2,y=135;if(p.has(/cork|message board|memo board|noticeboard|메모 보드/))return texture(p,rect(x,y,w,h,p.c,8,{stroke:dark,'stroke-width':3}))+rect(x+17,y+17,w-34,h-34,v===1?'#997e58':'#bea071',3)+repeat(70,i=>circle(x+27+p.n('corkx'+i,0,w-57),y+28+p.n('corky'+i,0,h-60),p.n('corkr'+i,1,3),'#766442',{opacity:.45}))+(v===1?path(`M${x+44} ${y+77}l${w/2-44}-30 ${w/2-44} 30`,'none',steel,4):rect(x+39,y+48,w-85,106,paper,1)+circle(x+w/2,y+51,8,p.accent))+(v===2?rect(238,320,88,79,steel,5)+circle(283,356,13,dark):'');if(v===1)return rect(x,y,w,h,p.c,round?110:7,{stroke:dark,'stroke-width':3})+path(`M${x+39} ${y+51}l${w/2-39}-20 ${w/2-39} 20`,'none',steel,4)+repeat(8,i=>rect(x+(i%2)*(w-10),y+37+Math.floor(i/2)*(h-74)/3,10,19,dark,2));return texture(p,rect(x,y,w,h,p.c,round?110:7))+rect(x+17,y+17,w-34,h-34,'url(#glass)',round?95:2)+path(`M${x+31} ${y+h-59}l${w-89}-${h-112}m-${w-109} ${h-68}l${w-80}-${h-116}`,'none',paper,13,{opacity:.55})+(v===2?group(path('M150 161h104v97h-30v-68h-74Z',p.c,dark,2),'translate(299,235)'):'')}
function basket(p,v){const mesh=p.has(/mesh|woven|rattan|seagrass|바구니/),lid=p.has(/lid|closed|lidded|뚜껑/),w=p.n('basket-width',238,338),h=p.n('basket-height',175,238),x=320-w/2,y=196,div=p.has(/three|3칸/)?3:p.has(/divid|sort|compartment/)?2:1
 if(/storage (?:box|boxes|bin|bins|container)|리빙박스|수납박스|정리함|정리박스|tote box|clear box|lidded box|plastic box/.test(p.t)&&!mesh)return storageBox(p,v)
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

function appliance(p,v){const K=p.k,vacuum=/vacuum|hoover\b|청소기|(?:floor|carpet|steam|wet.?dry|robot|cordless|upright|cylinder|canister|handheld|stick) cleaner/.test(K),fan=p.has(/fan|purifier|heater/),kettle=p.has(/kettle|coffee press/),toaster=p.has(/toaster/),mixer=p.has(/mixer|blender|processor/),fridge=p.has(/refrigerator|fridge|freezer/),washer=p.has(/washer|washing machine|dryer/),iron=p.has(/iron/),w=p.n('appliance-width',209,286),h=p.n('appliance-height',224,301),x=320-w/2,y=143
 if(p.has(/purifier|heater|tower.*fan|dehumidifier|humidifier/))return rect(223,112,194,338,p.c,p.has(/tower|cylindrical/)?69:22,{stroke:dark,'stroke-width':3})+rect(251,138,137,34,dark,7)+repeat(24,i=>line(248,194+i*9,391,194+i*9,steel,3))+(v===1?rect(243,184,154,235,'none',9,{stroke:dark,'stroke-width':6})+rect(302,189,39,14,steel,4):v===2?group(rect(215,137,158,232,paper,7)+repeat(19,i=>line(224+i*7,149,224+i*7,357,steel,3)),'translate(201,48) rotate(8 294 253)'):'')
 if(/ceiling fan/.test(p.t))return ceilingFan(p,v)
 if(/ice (?:maker|machine)|제빙기/.test(K))return iceMaker(p,v)
 if(/\bkettle\b|전기포트|커피포트/.test(K)&&!/kettle ?bell|grill|stove.?top|whistling|descal/.test(K))return jugKettle(p,v)
 if(/toaster|토스터/.test(K)&&!/oven|bags?\b/.test(K))return slotToaster(p,v)
 if(vacuum&&/robot|robovac|roomba|roborock|deebot/.test(p.t))return robotVacuum(p,v)
 if(vacuum&&/stick|cordless|handheld|dyson\s*v\d|v\d+\s|jet\b|stratos|wandvac|pet pro/.test(p.t))return stickVacuum(p,v)
 if(vacuum)return floorVacuum(p,v)
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
function figure(p,v){if(!/robot/.test(p.t)&&/\bdolls?\b|barbie|reborn|fashionista|rainbow high|our generation|annabell/.test(p.t)&&!/house|pram|carriage|stroller|plane|camper|\bcar\b|playset|walker|pets?\b/.test(p.t))return dollArt(p,v);const robot=p.has(/robot|mech|armour|armor/),doll=p.has(/doll|figure|figurine|action/),animal=p.has(/cat|rabbit|bear|dog|fox|teddy|bunny|lion|animal/),w=p.n('body-width',130,183),head=p.n('head-radius',50,78),ear=p.has(/rabbit|bunny/)?70:p.has(/cat|fox/)?47:27,x=320-w/2
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
const brightHue=(p,i,l=55)=>`hsl(${(p.h+i*47)%360} 68% ${l}%)`
// Modelling dough comes in lidded tubs, one open with a shaped dough piece beside it.
function doughTubs(p,v){const count=Math.min(10,Math.max(3,Number(p.t.match(/(\d+)\s*(?:-\s*)?(?:pack|tubs|pk|pots|colou?rs)/)?.[1])||Math.floor(p.n('tub-count',4,7)))),band=p.has(/super|classic|play-?doh/)?'#e98a2e':p.accent
 const tub=(cx,cy,i)=>path(`M${cx-34} ${cy}h68l-5 72h-58Z`,'#f3efe6',dark,2)+rect(cx-33,cy+18,66,24,band,2)+circle(cx,cy+30,7,'#ffffff',{opacity:.8})+rect(cx-37,cy-10,74,12,brightHue(p,i),5,{stroke:dark,'stroke-width':2})+ellipse(cx,cy-10,37,9,brightHue(p,i,62))
 const back=Math.min(5,Math.ceil(count/2)),front=Math.min(5,count-back),dx=p.n('tub-gap',76,84)
 const open=(cx,cy,i)=>path(`M${cx-34} ${cy}h68l-5 72h-58Z`,'#f3efe6',dark,2)+rect(cx-33,cy+18,66,24,band,2)+ellipse(cx,cy,34,9,dark)+path(`M${cx-30} ${cy}q30-52 60 0Z`,brightHue(p,i),dark,1.5)
 const shapes=path('M0 -26l8 17 19 2-14 13 4 19-17-9-17 9 4-19-14-13 19-2Z',brightHue(p,1),dark,1.5)
 let body=repeat(back,i=>tub(320-(back-1)*dx/2+i*dx,196,i))+repeat(front,i=>tub(320-(front-1)*dx/2+i*dx,286,back+i))
 if(v===1)return open(250,250,2)+group(shapes,'translate(380,330) scale(1.4)')+group(path('M-16 -12q-30 30 0 46h32q30-16 0-46Z',brightHue(p,4),dark,1.5),'translate(430,250)')+line(170,410,460,388,'#c9a77c',16)+circle(166,410,11,'#a8865c')+circle(464,388,11,'#a8865c')
 if(v===2)return group(open(320,240,0),'translate(-320,-260) scale(2)')+group(shapes,'translate(470,420) scale(1.6)')
 return body}
// A brick building set: the box with the built model in its window, a figure and loose bricks.
function brickSet(p,v,T){const is=re=>re.test(T),box=`hsl(${p.h%360} 42% 36%)`,sky=`hsl(${(p.h>>>4)%360} 40% 82%)`,c1=brightHue(p,0,52),c2=brightHue(p,2,58),grey='#9aa3a8'
 const brick=(x,y,w,h,c)=>rect(x,y,w,h,c,2,{stroke:dark,'stroke-width':1.5})+repeat(Math.max(1,Math.round(w/18)),i=>rect(x+4+i*18,y-5,11,5,c,1,{stroke:dark,'stroke-width':1}))
 const wheel=(x,y,r=17)=>circle(x,y,r,dark)+circle(x,y,r*.45,grey)
 const subject=is(/\btrain\b|locomotive|railway/)?'train':is(/\bcar\b|megacar|truck|police|fire engine|racer|race car|\bf1\b|ferrari|mclaren|koenigsegg|porsche|lamborghini|bugatti|vehicle|motorbike|tractor|\bvan\b|jeep|batmobile/)?'car':is(/\bship\b|boat|pirate|submarine/)?'ship':is(/tower|house|castle|hall|alley|asylum|shop|station|park|village|temple|hogwarts|school|\bhq\b|street|cafe|diner|bakery/)?'building':'model'
 const model={
  car:brick(10,104,180,30,c1)+brick(44,72,104,32,c2)+rect(56,78,40,22,'#bfe1ea',2)+rect(100,78,40,22,'#bfe1ea',2)+brick(176,110,18,14,'#f1d36b')+wheel(46,140)+wheel(156,140),
  train:brick(10,100,176,30,c1)+rect(20,62,94,38,c1,18,{stroke:dark,'stroke-width':1.5})+brick(116,40,64,60,c2)+rect(130,52,36,24,'#bfe1ea',2)+brick(32,36,22,26,dark)+repeat(3,i=>wheel(40+i*52,140,16)),
  ship:path('M0 110h200l-26 46H24Z',c1,dark,2)+line(96,10,96,110,'#7a5a3c',6)+path('M100 18q60 30 0 76Z','#f3efe6',dark,1.5)+path('M92 24q-58 28 0 66Z','#f3efe6',dark,1.5)+brick(30,92,40,18,c2)+brick(130,92,40,18,c2),
  building:repeat(4,i=>brick(30+(i%2)*6,128-i*30,140-(i%2)*12,30,i%2?c2:c1)+repeat(3,j=>rect(48+j*40,136-i*30,18,14,'#bfe1ea',1)))+brick(80,8,40,10,grey)+poly('70,8 100,-30 130,8',c2),
  model:brick(56,120,34,34,c1)+brick(110,120,34,34,c1)+brick(44,70,112,50,c2)+brick(64,26,72,44,c1)+circle(86,44,6,paper)+circle(114,44,6,paper)+brick(16,76,28,16,c1)+brick(156,76,28,16,c1),
 }[subject]
 const minifig=(x,y,s=1)=>group(rect(-10,-58,20,18,'#f2cd37',6)+path('M-16 -40h32l4 30h-40Z',c2,dark,1)+rect(-14,-10,13,22,dark,1)+rect(1,-10,13,22,dark,1)+circle(-4,-50,1.6,dark)+circle(4,-50,1.6,dark),`translate(${x} ${y}) scale(${s})`)
 const loose=brick(380,420,60,22,c1)+brick(450,426,40,22,c2)+brick(332,428,40,18,'#f2cd37')
 if(v===1)return group(model,'translate(140,140) scale(1.8)')+minifig(150,440,1.5)+loose
 if(v===2)return repeat(16,i=>brick(150+(i*67)%300,200+Math.floor(i/4)*52+(i%3)*6,30+(i%3)*18,22,brightHue(p,i,50+i%3*6)))+rect(120,150,150,190,'#f3efe6',4,{stroke:steel,'stroke-width':2})+group(model,'translate(140,190) scale(.55)')+minifig(470,440,1.4)
 return poly('490,110 512,124 512,392 490,380',`hsl(${p.h%360} 42% 26%)`)+rect(130,110,360,270,box,6,{stroke:dark,'stroke-width':2})+rect(146,124,46,34,'#d0312d',4)+rect(152,130,34,22,'#f2cd37',2)+rect(204,126,272,238,sky,4)+rect(204,300,272,64,`hsl(${(p.h>>>4)%360} 26% 66%)`,4)+group(model,`translate(${236+p.n('model-x',-6,6)},146) scale(1.1)`)+minifig(170,440,1.3)+loose}
// A child's light-up vanity: oval mirror ringed with bulbs, table with drawers and a stool.
function vanityToy(p,v){const c=p.has(/white/)?'#f1ede6':brightHue(p,0,78),trim=brightHue(p,1,62),mw=p.n('mirror-w',66,82)
 const body=rect(176,292,288,22,c,6,{stroke:dark,'stroke-width':2})+rect(190,314,120,70,c,4,{stroke:dark,'stroke-width':2})+line(214,348,286,348,dark,3)+repeat(2,i=>line(196+i*246,314,196+i*246,440,trim,12))+ellipse(320,196,mw,mw*1.25,'url(#glass)',{stroke:trim,'stroke-width':14})+repeat(10,i=>{const a=Math.PI+i*Math.PI/9;return circle(320+Math.cos(a)*(mw+12),196+Math.sin(a)*(mw*1.25+12),7,'#fff4c6',{stroke:'#e2c66a','stroke-width':2})})+rect(214,276,16,16,brightHue(p,3),4)+rect(238,268,12,24,brightHue(p,4),4)+circle(410,282,10,brightHue(p,5))
 const stool=ellipse(470,372,48,14,trim)+line(440,380,434,444,trim,8)+line(500,380,506,444,trim,8)+line(470,384,470,446,trim,8)
 if(v===1)return group(body,'translate(640,0) scale(-1,1)')+group(stool,'translate(-330,0)')
 if(v===2)return group(body,'translate(-300,-150) scale(1.9)')
 return body+stool}
// A robot pet: a dog-shaped body with a lit visor face, jointed legs and wheel paws.
function robotDog(p,v){const c=p.has(/white/)?'#eceae4':p.c,glow=p.has(/blue/)?'#62c3e8':brightHue(p,1,60),len=p.n('robodog-length',200,236)
 const dog=rect(320-len/2,248,len,96,c,42,{stroke:dark,'stroke-width':3})+rect(320-len/2+30,262,len-80,20,glow,8,{opacity:.6})+repeat(4,i=>{const x=320-len/2+26+i*(len-52)/3;return rect(x-13,330,26,82,i%2?steel:c,10,{stroke:dark,'stroke-width':2})+circle(x,418,16,dark)+circle(x,418,6,steel)})+path(`M${320-len/2+6} 270q-46-26-40-74`,'none',c,12)+group(rect(-58,-46,116,92,c,30,{stroke:dark,'stroke-width':3})+rect(-44,-26,88,46,'#1e2a33',14)+circle(-18,-4,9,glow)+circle(18,-4,9,glow)+path('M-50 -36q-34 6-30 62q16 6 22-6Z',p.accent,dark,2)+path('M50 -36q34 6 30 62q-16 6-22-6Z',p.accent,dark,2)+rect(-30,40,60,12,p.accent,6),`translate(${320+len/2-6} 214)`)
 if(v===1)return group(dog,'translate(640,0) scale(-1,1)')+group(rect(-30,-50,60,100,'#2d3237',16)+circle(0,-18,14,steel)+repeat(4,i=>circle(-12+i%2*24,18+Math.floor(i/2)*18,6,glow)),'translate(530,380) rotate(10)')
 if(v===2)return group(dog,`translate(${320-1.9*(320+len/2)} ${270-1.9*214}) scale(1.9)`)
 return dog}
// A playset is a cut-away building on a base: floors with rooms, a tower, a slide and tiny figures.
function playsetToy(p,v,T){const is=re=>re.test(T),wall=brightHue(p,0,64),roof=brightHue(p,2,48),inner=brightHue(p,4,82),w=p.n('playset-width',270,320),x=320-w/2,floors=is(/tower|hq|headquarters|lookout|mega|castle/)?3:2,fh=p.n('floor-height',74,88),mobile=is(/mobile|truck|hauler|camper|bus|airship|van\b/),kitchen=is(/kitchen|grocery|store|shop/)
 const fig=(fx,fy,i)=>circle(fx,fy-28,9,'#e7c3a0')+rect(fx-8,fy-20,16,22,brightHue(p,i+3,50),4)
 let body
 if(kitchen)body=rect(x,190,w,240,wall,8,{stroke:dark,'stroke-width':3})+rect(x+14,206,w*.46,80,'#2d3237',6)+repeat(4,i=>circle(x+38+(i%2)*w*.22,226+Math.floor(i/2)*38,14,steel))+rect(x+14,300,w*.46,116,inner,6,{stroke:dark,'stroke-width':2})+rect(x+30,320,w*.46-32,60,'url(#glass)',6)+rect(x+w*.55,206,w*.4,70,'#9fc9d4',6)+path(`M${x+w*.75} 206v-34h20`,'none',steel,7)+repeat(3,i=>rect(x+w*.55,300+i*40,w*.4,32,inner,4,{stroke:dark,'stroke-width':1.5})+circle(x+w*.75,316+i*40,4,dark))+rect(x-10,128,w+20,20,roof,6)+repeat(3,i=>rect(x+20+i*60,98,30,30,brightHue(p,i+5,60),6))
 else{const top=430-floors*fh
  body=rect(x,top,w,floors*fh,wall,6,{stroke:dark,'stroke-width':3})+repeat(floors,i=>rect(x+12,top+10+i*fh,w*.62,fh-20,inner,4)+line(x,top+(i+1)*fh,x+w,top+(i+1)*fh,dark,4)+fig(x+40+((i*67)%Math.max(1,w*.5)),top+(i+1)*fh-8,i))+poly(`${x-14},${top} ${320},${top-70} ${x+w+14},${top}`,roof,{stroke:dark,'stroke-width':3})+rect(x+w-74,top-120,60,120+floors*fh-fh,brightHue(p,1,58),8,{stroke:dark,'stroke-width':2})+circle(x+w-44,top-80,20,paper,{stroke:roof,'stroke-width':6})+line(x+w-44,top-120,x+w-44,top-160,dark,3)+poly(`${x+w-44},${top-160} ${x+w-10},${top-150} ${x+w-44},${top-140}`,roof)+path(`M${x+w-14} ${top+fh}q90 40 60 ${floors*fh-fh+30}`,'none','#f1c544',20)+rect(x+w*.66,430-fh+16,34,fh-18,'#7a5a3c',14)}
 const base=mobile?rect(x-20,428,w+40,30,dark,10)+repeat(3,i=>circle(x+20+i*(w-40)/2,462,24,dark)+circle(x+20+i*(w-40)/2,462,10,steel)):ellipse(320,440,w/2+60,26,brightHue(p,6,70),{stroke:dark,'stroke-width':2})
 if(v===1)return base+group(body,'translate(640,0) scale(-1,1)')
 if(v===2)return group(base+body,'translate(-240,-200) scale(1.75)')
 return base+body}
// A boxed board or party game: the lid art in perspective with dice, pawns and cards in front.
function boardGame(p,v){const box=brightHue(p,0,46),lid=brightHue(p,3,62),d=p.n('box-depth',34,46)
 const top=poly('150,214 410,160 500,236 236,298',box,{stroke:dark,'stroke-width':3})+poly(`150,214 236,298 236,${298+d} 150,${214+d}`,`hsl(${p.h%360} 50% 34%)`)+poly(`236,298 500,236 500,${236+d} 236,${298+d}`,`hsl(${p.h%360} 50% 28%)`)+group(circle(0,0,52,lid)+circle(0,0,30,paper,{opacity:.85})+repeat(6,i=>rect(-6,-76,12,22,lid,4,{transform:`rotate(${i*60})`})),'translate(325,229) scale(1 .55) rotate(-12)')
 const die=(x,y,pip)=>rect(x,y,34,34,paper,6,{stroke:dark,'stroke-width':2})+repeat(pip,i=>circle(x+9+(i%2)*16,y+9+Math.floor(i/2)*8,3,dark))
 const pawn=(x,y,c)=>circle(x,y-30,9,c,{stroke:dark,'stroke-width':1.5})+path(`M${x-7} ${y-22}h14l8 22h-30Z`,c,dark,1.5)
 const pieces=die(170,392,3)+die(216,404,5)+pawn(300,438,brightHue(p,1))+pawn(332,430,brightHue(p,2))+pawn(364,442,brightHue(p,4))+repeat(3,i=>rect(400+i*14,384+i*6,48,68,i===2?lid:paper,5,{stroke:dark,'stroke-width':1.5}))
 if(v===1)return rect(150,180,340,240,'#f3efe6',6,{stroke:dark,'stroke-width':3})+repeat(24,i=>{const k=i%6,s=Math.floor(i/6),pos=[[170+k*50,198],[454,198+k*36],[454-k*50,384],[170,384-k*36]][s];return rect(pos[0],pos[1],34,30,i%4?brightHue(p,i,72):lid,3,{stroke:dark,'stroke-width':1})})+circle(320,300,52,box)+pawn(330,330,brightHue(p,1))
 if(v===2)return group(pieces,'translate(-278,-494) scale(1.9)')
 return top+pieces}
// The generic toy is a retail window box with the toy itself standing inside.
function boxedToy(p,v,T){const box=brightHue(p,0,48),band=brightHue(p,2,58),bw=p.n('window-box-w',230,270),x=320-bw/2,toyC=brightHue(p,4,60)
 const critter=(cx,cy,s)=>group(ellipse(0,40,48,56,toyC,{stroke:dark,'stroke-width':2})+circle(0,-38,40,toyC,{stroke:dark,'stroke-width':2})+circle(-14,-44,7,dark)+circle(14,-44,7,dark)+path('M-12 -22q12 10 24 0','none',dark,3)+ellipse(-30,-76,12,18,toyC,{stroke:dark,'stroke-width':2})+ellipse(30,-76,12,18,toyC,{stroke:dark,'stroke-width':2})+ellipse(0,46,28,32,paper,{opacity:.5})+rect(-58,10,22,48,toyC,10)+rect(36,10,22,48,toyC,10),`translate(${cx} ${cy}) scale(${s})`)
 const pack=poly(`${x+bw},112 ${x+bw+26},128 ${x+bw+26},444 ${x+bw},430`,`hsl(${p.h%360} 50% 32%)`)+rect(x,112,bw,318,box,10,{stroke:dark,'stroke-width':3})+rect(x,112,bw,64,band,10)+circle(x+40,144,22,'#f6d64a',{stroke:dark,'stroke-width':2})+rect(x+74,132,bw-96,12,paper,5)+rect(x+74,152,bw-130,8,paper,4,{opacity:.7})+rect(x+18,190,bw-36,218,'#e9f2f5',8)+critter(320,300,1)+rect(x+18,190,bw-36,218,'url(#glass)',8,{opacity:.35})
 if(v===1)return group(pack,'translate(-90,0) scale(.85)')+critter(470,330,1.25)
 if(v===2)return critter(320,300,2.2)
 return pack}
// Toy sub-forms read the item's own name (title, shape and type), never the shop
// department: "Arts, Crafts & Music" must not turn modelling dough into a xylophone.
function toy(p,v){const T=[p.t,p.raw.shape,p.raw.artShape,p.raw.type].filter(Boolean).join(' ').toLowerCase(),is=re=>re.test(T)
 if(is(/play-?doh|play ?dough|\bdough\b|modell?ing (?:clay|compound)|\bclay\b|kinetic sand|putty|\bslime\b|squish|plasticine/))return doughTubs(p,v)
 if(is(/\blego\b|\bduplo\b|mega bloks|\bbricks?\b|building (?:set|kit)|magnetic (?:tiles|cubes)|construction set/)||/^(?:lego|mega bloks)$/.test(String(p.raw.brand||p.d.brand||'').toLowerCase()))return brickSet(p,v,T)
 if(is(/\bvanity\b|dressing table|beauty playset|make-?up set/))return vanityToy(p,v)
 if(is(/\brobo\b|\brobot|\bbots?\b/)){if(is(/dog|pup|puppy|\bpet\b|kitten|cat\b/))return robotDog(p,v);return figure(p,v)}
 if(is(/playset|\bhq\b|headquarters|\btower\b|dollhouse|doll house|play ?house|\bgarage\b|\bcastle\b|lookout|quarters|\bschool\b|\bfarm\b|play kitchen|grocery store|\bshop playset|airship|race track/))return playsetToy(p,v,T)
 const puzzle=is(/puzzle|board game|chess|domino|mosaic|jigsaw/),train=is(/train|rail/),vehicle=is(/car\b|truck|vehicle|tractor|hauler|ride.on|coupe|digger/),science=is(/science|circuit|solar|hydraulic|weather|crystal|magnet|laboratory/),music=is(/drum|guitar|xylophone|music|keyboard|piano|karaoke|\bdj\b/),castle=is(/castle|fort|house|building|architecture/),count=Math.floor(p.n('toy-count',5,10))
 if(!puzzle&&is(/\bgame\b|\buno\b|guess who|\bcards?\b/)&&!is(/arcade|video|console|controller/))return boardGame(p,v)
 if(!puzzle&&!vehicle&&!train&&!music&&is(/\bfigures?\b|action\b|interactive (?:toy|pet)|\bplush\b|puppet|\bpets?\b|buzz lightyear|woody\b/))return figure(p,v)
 if(is(/bus\b|tram/))return rect(133,191,373,209,p.c,14,{stroke:dark,'stroke-width':3})+repeat(5,i=>rect(151+i*68,211,57,74,'url(#glass)',5))+rect(427,300,61,84,p.accent,4)+circle(205,397,43,dark)+circle(205,397,24,steel)+circle(435,397,43,dark)+circle(435,397,24,steel)+repeat(20,i=>rect(145+i%10*35,183+Math.floor(i/10)*111,22,11,p.accent,4))+(v===1?rect(277,306,57,61,p.accent,3):v===2?line(156,339,409,339,steel,5):'')
 if(puzzle)return rect(167,170,309,247,p.c,13,{stroke:dark,'stroke-width':3})+repeat(12,i=>{const x=181+i%4*73,y=183+Math.floor(i/4)*74;return path(`M${x} ${y}h${55+p.n('piece'+i,0,8)}v22q12-6 12 8t-12 6v28h-24q6-13-6-13t-6 13h-22v-64Z`,`hsl(${(p.h+i*37)%360} 31% ${43+i%3*11}%)`,paper,2)})+(v===1?path('M195 199l246 185M444 201L195 385','none',p.accent,5):'')
 if(vehicle||train)return rect(155,269,344,115,p.c,18)+path('M214 269l44-94h123l67 94Z',p.accent,dark,3)+rect(273,196,99,66,'url(#glass)',5)+circle(226,380,54,dark)+circle(226,380,29,steel)+circle(443,380,54,dark)+circle(443,380,29,steel)+(v===1?rect(163,304,46,27,paper,7)+rect(468,304,29,27,'#be6363',7):'')
 if(science)return rect(172,327,301,87,p.c,12)+repeat(3,i=>rect(193+i*90,182,61,144,'url(#glass)',14,{stroke:steel,'stroke-width':3}))+repeat(3,i=>rect(193+i*90,247-i*14,61,78+i*14,`hsl(${(p.h+i*74)%360} 36% 58%)`,12))+repeat(3,i=>rect(204+i*90,160,39,31,dark,5))+path('M225 188q-59-95 82-47t73 45','none',steel,8)
 if(music)return is(/guitar/)?ellipse(292,323,93,110,p.c)+ellipse(292,261,65,58,p.c)+circle(292,290,32,dark)+rect(278,103,29,170,p.accent,4)+rect(271,78,45,69,p.c,8)+repeat(6,i=>line(281+i*5,95,281+i*5,379,steel,1)):repeat(8,i=>rect(161+i*42,190+i*9,38,208-i*18,`hsl(${(p.h+i*35)%360} 39% 57%)`,8,{stroke:dark,'stroke-width':2}))+line(176,428,398,187,steel,7)+circle(403,180,17,p.accent)
 if(castle)return repeat(count,i=>{const x=163+i%4*81,y=364-Math.floor(i/4)*102;return rect(x,y,75,96,`hsl(${(p.h+i*39)%360} 23% 60%)`,3,{stroke:dark,'stroke-width':2})+poly(`${x-8},${y} ${x+37},${y-56} ${x+82},${y}`,p.accent)})
 if(!is(/block|cube|stack|tiles|dice|baby|sensory|teeth|soft/))return boxedToy(p,v,T)
 let body=repeat(count,i=>{const x=160+i%4*89,y=177+Math.floor(i/4)*97;return group(rect(x,y,71,72,`hsl(${(p.h+i*53)%360} 30% 55%)`,8,{stroke:dark,'stroke-width':2})+repeat(4,j=>circle(x+20+j%2*31,y+20+Math.floor(j/2)*31,8,p.accent)),`rotate(${p.n(i,-9,9)} ${x+35} ${y+36})`)})
 if(v===1)body+=path('M165 430q160-96 302 0','none',steel,9)
 if(v===2)body=group(body,'translate(-157,-80) scale(1.4)')
 return body
}
function fitness(p,v){if(/treadmill|walking pad/.test(p.k))return treadmill(p,v);const weight=p.has(/dumbbell|kettlebell|weight/),roller=p.has(/roller/),block=p.has(/block|step|box/),bench=p.has(/bench|treadmill/),w=p.n('fitness-width',190,251)
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
 if(/\b(?:plant|flower|planter) (?:stands?|tables?|ladders?)\b/.test(p.t))return plantStand(p,v)
 if(/ps5|ps4|playstation|xbox|console|콘솔/.test(p.t)&&/stand|거치대|dock|cooling|charging station/.test(p.t)&&!/controller (?:stand|holder)|headset|phone/.test(p.t))return consoleStand(p,v)
 let body=poly(`${x},432 ${x+60},171 ${x+155},171 ${x+103},368 ${x+w},368 ${x+w},432`,p.c,{stroke:dark,'stroke-width':3})+rect(x+21,418,w-8,20,p.accent,6)
 if(holder)body+=path(`M${x+67} 211q77 68 111-4`,'none',dark,20)
 if(v===1)body+=line(x+69,194,x+w-28,416,steel,10)+circle(x+105,249,16,dark)
 if(v===2)body=group(body,'translate(-152,-149) scale(1.5)')+repeat(4,i=>circle(227+i*46,408,5,steel))
 return body
}
// A jug kettle stands on its round power base: tapered body, spout, handle and water window.
function jugKettle(p,v){const c=p.c,goose=/gooseneck|pour.over/.test(p.k),w=p.n('kettle-width',150,182),top=p.n('kettle-top',158,186),x=320-w/2,water='#9fc9d4'
 const base=ellipse(320,438,w*.72,16,dark)+rect(320-w*.72,420,w*1.44,18,'#3a4147',9)+circle(320+w*.55,428,4,p.accent)
 const body=goose?path(`M${x} 414Q${x-8} 300 ${x+24} 286H${x+w-24}Q${x+w+8} 300 ${x+w} 414Z`,c,dark,3)+path(`M${x+10} 330Q${x-60} 300 ${x-70} 220l-6-8`,'none',c,9)+ellipse(320,286,w/2-20,10,dark)+rect(306,262,28,20,dark,6)+path(`M${x+w-6} 300q64 0 56 70q-4 30-40 40`,'none',dark,16)
  :path(`M${x+8} 414L${x+20} ${top+24}Q${x+24} ${top} ${x+50} ${top}H${x+w-40}Q${x+w-14} ${top} ${x+w-10} ${top+24}L${x+w} 414Z`,c,dark,3)+path(`M${x+22} ${top+30}L${x-30} ${top+8}L${x-22} ${top+34}L${x+18} ${top+72}Z`,c,dark,3)+ellipse(320,top+4,w/2-20,10,dark)+rect(296,top-14,48,16,dark,6)+path(`M${x+w-12} ${top+26}q78 10 66 118q-6 70-56 92`,'none',dark,22)+path(`M${x+w-12} ${top+26}q78 10 66 118q-6 70-56 92`,'none',c,12)+rect(x+36,top+70,24,414-top-110,water,10,{opacity:.75,stroke:steel,'stroke-width':2})+repeat(4,i=>line(x+40,top+92+i*36,x+50,top+92+i*36,dark,2))+rect(x+w-18,392,20,12,p.accent,4)
 if(v===1)return base+group(body,'translate(0,-56) rotate(-6 320 300)')+path(`M${320+w*.7} 432q80 6 110 40`,'none',dark,6)
 if(v===2)return group(body+base,`translate(${320-1.8*320} ${290-1.8*(top+120)}) scale(1.8)`)
 return base+body}
// A pop-up toaster: rounded body, bread slots on the top face, side lever and browning dial.
function slotToaster(p,v){const c=p.c,four=/4.slice|four.slice|4 slot|four slot/.test(p.k),w=p.n('toaster-width',four?300:240,four?336:282),x=320-w/2,toast='#d9a85b'
 const slots=four?repeat(4,i=>rect(x+24+(i%2)*(w/2-12),218+Math.floor(i/2)*16,w/2-36,9,dark,4)):repeat(2,i=>rect(x+26,218+i*16,w-52,9,dark,4))
 const bread=v===0?(four?repeat(2,i=>rect(x+36+i*(w/2-12),180,w/2-60,46,toast,14,{stroke:'#a87436','stroke-width':3})):rect(x+42,178,w-84,48,toast,16,{stroke:'#a87436','stroke-width':3})):''
 const body=bread+path(`M${x} 250Q${x} 208 ${x+38} 208H${x+w-38}Q${x+w} 208 ${x+w} 250V410Q${x+w} 428 ${x+w-20} 428H${x+20}Q${x} 428 ${x} 410Z`,c,dark,3)+slots+rect(x+14,300,w-28,10,steel,4,{opacity:.6})+rect(x+w-6,262,24,14,dark,5)+circle(x+w*.5,368,16,steel,{stroke:dark,'stroke-width':2})+line(x+w*.5,368,x+w*.5+8,356,dark,3)+repeat(3,i=>circle(x+w*.5+34+i*18,368,5,i?dark:p.accent))+rect(x+18,420,w-36,12,'#3a4147',4)
 if(v===1)return group(body,'translate(640,0) scale(-1,1)')+path(`M${x+w-10} 420q70 10 90 40`,'none',dark,6)
 if(v===2)return group(body,`translate(${320-1.9*320} ${280-1.9*226}) scale(1.9)`)+rect(220,330,200,120,toast,22,{stroke:'#a87436','stroke-width':4})
 return body}
// A countertop ice maker: box with a viewing lid over a basket of cubes, and its scoop.
function iceMaker(p,v){const c=p.c,w=p.n('ice-width',240,282),x=320-w/2,cube=(cx,cy)=>rect(cx-11,cy-9,22,18,'#e7f3f7',4,{stroke:'#9fc9d4','stroke-width':2})
 const body=rect(x,200,w,226,c,24,{stroke:dark,'stroke-width':3})+rect(x+18,210,w-36,74,'#9fc9d4',14,{opacity:.6,stroke:dark,'stroke-width':2})+repeat(12,i=>cube(x+44+(i%6)*((w-88)/5),236+Math.floor(i/6)*22))+rect(x+30,310,w-60,34,'#2d3237',8)+repeat(3,i=>circle(x+56+i*34,327,7,i?steel:p.accent))+rect(x+w-90,318,52,16,'#5d7b88',3)
 if(v===1)return body+path(`M${x+18} 210l-40-90h${w-36}l40 90Z`,'#9fc9d4',dark,2,{opacity:.5})+group(path('M0 0h70l10 40H-10Z',steel,dark,2)+rect(80,14,50,12,steel,5),`translate(${x+w+10} 400)`)
 if(v===2)return repeat(30,i=>cube(140+(i%6)*72,180+Math.floor(i/6)*56))+group(path('M0 0h140l20 80H-20Z',steel,dark,3),'translate(240,320)')
 return body}
// Cylinder vacuums roll on wheels with a hose and wand; uprights stand on a floor head.
function floorVacuum(p,v){const c=p.c,upright=/upright/.test(p.k),bin='url(#glass)'
 let body
 if(upright)body=rect(232,404,176,40,dark,16)+rect(246,410,148,10,p.accent,4)+rect(282,200,76,210,c,28,{stroke:dark,'stroke-width':3})+rect(294,230,52,96,bin,18,{stroke:dark,'stroke-width':2})+line(320,200,320,110,steel,12)+rect(296,92,48,26,dark,10)+path('M358 240q60 40 30 160','none',dark,10)+circle(320,360,12,p.accent)
 else body=rect(150,322,170,98,c,44,{stroke:dark,'stroke-width':3})+circle(180,422,22,dark)+circle(296,422,22,dark)+circle(180,422,9,steel)+circle(296,422,9,steel)+rect(176,334,70,40,bin,14)+circle(286,352,12,p.accent)+path('M318 352q90-20 70-140','none',dark,14)+line(388,212,466,416,steel,12)+rect(380,196,24,30,dark,8)+rect(430,410,104,26,dark,12)+rect(440,416,84,8,p.accent,3)
 if(v===1)return group(body,'translate(640,0) scale(-1,1)')
 if(v===2)return group(body,`translate(${320-1.8*(upright?320:240)} ${300-1.8*360}) scale(1.8)`)
 return body}
// A ceiling fan hangs from its canopy on a downrod, blades in perspective round a motor and light.
function ceilingFan(p,v){const blades=p.has(/three|3-blade|3 blade/)?3:p.has(/four|4-blade/)?4:5,span=p.n('fan-span',225,262),drop=p.n('fan-drop',70,110),cy=150+drop,c=p.c,blade=p.has(/white/)?'#e9e6df':p.has(/wood|walnut|oak|bronze|brown/)?'#9a7350':'#b9a385',light=/light|led/.test(p.t)
 const blade1=a=>{const ex=Math.cos(a)*span,ey=Math.sin(a)*span*.26;return path(`M320 ${cy}L${320+ex-Math.sin(a)*34} ${cy+ey+Math.cos(a)*9}Q${320+ex*1.04} ${cy+ey*1.04} ${320+ex+Math.sin(a)*34} ${cy+ey-Math.cos(a)*9}Z`,blade,dark,2)}
 const order=Array.from({length:blades},(_,i)=>i*Math.PI*2/blades+p.n('fan-rot',0,1)).sort((a,b)=>Math.sin(a)-Math.sin(b))
 const body=rect(300,96,40,16,c,5,{stroke:dark,'stroke-width':2})+ellipse(320,96,46,10,c,{stroke:dark,'stroke-width':2})+line(320,108,320,cy-20,steel,9)+order.filter(a=>Math.sin(a)<0).map(blade1).join('')+ellipse(320,cy,70,26,c,{stroke:dark,'stroke-width':3})+rect(252,cy-6,136,14,c,6)+order.filter(a=>Math.sin(a)>=0).map(blade1).join('')+(light?path(`M276 ${cy+16}q44 70 88 0Z`,'#f3ead1',dark,2)+ellipse(320,cy+18,44,8,steel):ellipse(320,cy+22,22,8,steel))
 if(v===1)return line(60,96,580,96,'#d8d4cb',4)+group(body,'translate(640,0) scale(-1,1)')+line(354,cy+10,354,cy+90,dark,2)+circle(354,cy+94,5,steel)
 if(v===2)return group(body,`translate(${320-1.8*320} ${260-1.8*cy}) scale(1.8)`)
 return line(60,96,580,96,'#d8d4cb',4)+body}
// A cordless stick vacuum: handle, motor and bin at the top of a long wand, floor head below.
function stickVacuum(p,v){const c=p.c,len=p.n('wand-length',190,226),tilt=p.n('wand-tilt',12,20),hi=p.has(/yellow/)?'#d8b740':p.has(/purple/)?'#7a5d96':p.accent
 const unit=group(rect(-26,-108,52,92,'url(#glass)',22,{stroke:dark,'stroke-width':3})+repeat(4,i=>line(-20,-92+i*18,20,-92+i*18,steel,3))+rect(-34,-20,68,48,c,16,{stroke:dark,'stroke-width':3})+circle(0,4,13,hi)+path('M30 -10q58-10 54 46l-6 30h-26l6-30q2-22-22-22','none',dark,14)+rect(52,58,34,46,dark,8)+line(0,28,0,28+len,steel,14)+line(-4,28,-4,28+len,'#ffffff',3)+group(rect(-70,0,140,34,dark,14)+rect(-62,6,124,10,hi,4)+circle(-52,32,9,steel)+circle(52,32,9,steel),`translate(0 ${28+len}) rotate(${-tilt})`),`translate(300 ${150}) rotate(${tilt})`)
 if(v===1)return unit+group(rect(-14,-60,28,120,steel,12)+rect(-30,60,60,24,dark,10),'translate(470,300) rotate(-12)')+group(rect(-18,-26,36,52,dark,8)+rect(-26,26,52,14,hi,6),'translate(520,420)')
 if(v===2)return group(unit,`translate(${320-1.9*300} ${280-1.9*170}) scale(1.9)`)
 return unit}
// A robot vacuum is a low disc with a bumper, sensor turret and side brush, beside its dock.
function robotVacuum(p,v){const r=p.n('robot-radius',112,132),c=p.has(/white/)?'#eceae4':p.c,dock=/dock|station|empty|mop|qrevo|omni/.test(p.t)
 const disc=ellipse(320,392,r*1.25,r*.42,dark)+ellipse(320,380,r*1.25,r*.42,c,{stroke:dark,'stroke-width':3})+ellipse(320,372,r*.36,r*.14,dark)+ellipse(320,368,r*.3,r*.1,steel)+path(`M${320-r*1.2} 386q${r*1.2} ${r*.5} ${r*2.4} 0`,'none',steel,6)+repeat(3,i=>line(320-r*1.18,394,320-r*1.18-30+i*22,412,dark,3))
 const station=dock?rect(150,150,196,250,c,24,{stroke:dark,'stroke-width':3})+rect(170,172,156,60,'#9fc9d4',12,{opacity:.6})+rect(170,240,156,60,'#5d7b88',12,{opacity:.55})+rect(168,388,160,28,dark,8)+circle(248,206,8,p.accent):''
 if(v===1)return group(station,'translate(-20,0)')+ellipse(420,330,r*1.2,r*1.2*.95,dark)+circle(420,330,r*.9,'#3a4147')+repeat(2,i=>rect(380+i*68,300,14,60,steel,6))+rect(400,360,40,22,c,6)+circle(420,250,26,steel)
 if(v===2)return group(disc,`translate(${320-1.8*320} ${300-1.8*380}) scale(1.8)`)
 return (dock?station:'')+group(disc,dock?'translate(110,30)':'')}
// A lidded plastic storage box: clear body, coloured clip lid, stacked on a second box.
function storageBox(p,v){const lid=p.has(/white/)?'#eceae4':p.has(/grey|gray/)?'#8b949a':p.accent,w=p.n('sbox-w',280,330),h=p.n('sbox-h',130,160),x=320-w/2
 const box=(y,s)=>group(path(`M${x} ${y}h${w}l-14 ${h}H${x+14}Z`,'#dfe9ee',steel,2,{opacity:.9})+rect(x-8,y-18,w+16,24,lid,6,{stroke:dark,'stroke-width':2})+repeat(2,i=>rect(x+10+i*(w-50),y-8,30,20,lid,4,{stroke:dark,'stroke-width':1.5}))+rect(x+18,y+12,w-36,h-28,'#ffffff',6,{opacity:.25}),`translate(${320*(1-s)} 0) scale(${s} 1)`)
 if(v===1)return box(250,1)+path(`M${x-8} 232l30-110h${w-44}l30 110`,lid,dark,2,{opacity:.85})
 if(v===2)return group(box(220,1),'translate(-260,-200) scale(1.8)')
 return box(290,1)+box(290-h-28,.94)}
// A console stand holds the console upright on a base, with controller charging cradles beside it.
function consoleStand(p,v){const c=p.has(/white|화이트/)?'#eceae4':'#2d3237',xbox=/xbox/.test(p.t),h=p.n('console-h',250,280),cx=p.n('console-x',300,320)
 const unit=xbox?rect(cx-50,430-h,100,h,'#20252a',10,{stroke:dark,'stroke-width':2})+circle(cx,430-h+30,26,'#3a4147')+repeat(6,i=>circle(cx-12+(i%3)*12,430-h+24+Math.floor(i/3)*12,3,'#5a8f4a')):path(`M${cx-46} ${430-h}q-20 ${h/2} 0 ${h}h92q20-${h/2} 0-${h}Z`,'#f1f1ee',dark,2)+rect(cx-14,430-h+10,28,h-20,'#1e2328',8)
 const pad=(x)=>path(`M${x-38} 0q-14 30 4 50q14 10 24-6h20q10 16 24 6q18-20 4-50Z`,c==='#2d3237'?'#3a4147':'#f1f1ee',dark,2)
 const base=rect(160,426,320,34,c,12,{stroke:dark,'stroke-width':3})+repeat(2,i=>rect(390+i*0,400-i*70,70,22,c,8,{stroke:dark,'stroke-width':2}))+line(420,330,420,428,c,10)+circle(450,442,5,p.accent)+circle(190,442,5,p.accent)
 const pads=group(pad(0),'translate(424,350)')+group(pad(0),'translate(424,280)')
 if(v===1)return base+group(rect(cx-60,430-h,120,h,'none',12,{stroke:steel,'stroke-width':3,'stroke-dasharray':'8 6'}),'')+repeat(3,i=>circle(cx,330-i*50,18,'#3a4147'))
 if(v===2)return group(base+pads,`translate(${320-1.8*424} ${280-1.8*380}) scale(1.8)`)
 return base+unit+pads}
// A plant stand holds a potted plant on a round top with splayed legs, or on stepped tiers.
function plantStand(p,v){const tiers=p.has(/tier|ladder|bamboo|step/)?3:1,w=p.n('plant-stand-width',150,190),legH=p.n('plant-stand-legs',110,170),c=p.c,leaf='#5f8a5c'
 const plant=(cx,cy,s)=>group(path('M-34 0h68l-10 58h-48Z',p.accent,dark,2)+repeat(7,i=>path(`M0 0q${-60+i*20} ${-50-(i%3)*18} ${-44+i*15} ${-96-(i%2)*20}q${20-i*3} 40 ${-(-44+i*15)} ${96+(i%2)*20}`,i%2?leaf:'#78a272',dark,1.2)),`translate(${cx} ${cy}) scale(${s})`)
 let body
 if(tiers===3)body=line(228,442,286,150,c,13)+line(412,442,354,150,c,13)+repeat(3,i=>rect(256-i*24,200+i*86,128+i*48,14,c,4,{stroke:dark,'stroke-width':2}))+repeat(3,i=>plant(320+(i-1)*40,200+i*86-36,.62))
 else{const top=442-legH-26;body=repeat(3,i=>line(320+(i-1)*w*.18,top+20,320+(i-1)*w*.5,442,c,12))+ellipse(320,top+14,w/2,16,c,{stroke:dark,'stroke-width':2})+ellipse(320,top+8,w/2,14,c)+plant(320,top-50,1.05)}
 if(v===1)return group(body,'translate(640,0) scale(-1,1)')+ellipse(320,452,150,10,steel,{opacity:.5})
 if(v===2)return group(body,'translate(-200,-60) scale(1.6)')
 return body}
function food(p,v){if(isProduce(p.t,p.k))return produce(p,v);if(/\b(?:milk|buttermilk|oat ?milk|almond ?milk|soy ?milk|juice)\b/.test(p.t)&&!/chocolate|bone|powder|formula|biscuit|\btea\b|coffee|\bbars?\b|cookie|candy|\bmix\b|pouch|frother|shake|cleans|sunscreen|lotion|\bbox\b/.test(p.t))return milk(p,v);if(/ice cream|gelato|sorbet|frozen yogh?urt/.test(p.t))return pint(p,v);const can=p.has(/canned|can\b|tinned|tin\b|통조림/),jarred=p.has(/sauce|spread|honey|jam|소스/),box=p.has(/biscuit|cookie|bar\b|tea|cereal|soup|크래커|쿠키|수프/),w=p.n('food-width',194,271),h=p.n('food-height',257,313),x=320-w/2,y=138,foodColor=p.has(/berry|strawberry|tomato|딸기|토마토/)?'#ae6960':p.has(/pea|green|algae|완두|김|다시마/)?'#6e8766':p.has(/chocolate|cocoa|coffee|beef|chicken|초콜릿|코코아/)?'#836551':'#bd9e69'
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

// Product forms that broad families drew as something else. Each is keyed to the
// item's own name (p.k), never to descriptions that mention other products.
const tone=(p,fallback)=>colour(p.raw.colorName||p.raw.colour||p.raw.color||p.d.color,colour(p.title,fallback))
function television(p,v){
 const w=p.n('tv-width',430,492),h=Math.round(w*.565),x=320-w/2,y=p.n('tv-top',106,128),frame=tone(p,'#23272b'),pedestal=p.n('tv-stand',0,1)>.62,bezel=p.n('tv-bezel',5,9),sun=p.n('tv-sun',.6,.8)
 const feet=pedestal?rect(320-w*.27,y+h+12,w*.54,12,'#4a525a',5)+rect(300,y+h-4,40,18,'#4a525a',3):repeat(2,i=>{const fx=i?x+w*.86:x+w*.14,dir=i?1:-1;return path(`M${fx-8} ${y+h-4}L${fx+dir*24} ${y+h+38}h${dir*16}L${fx+8} ${y+h-4}Z`,'#3a4249',dark,2)})
 if(v===1)return feet+rect(x,y,w,h,'#3b4148',5,{stroke:dark,'stroke-width':2})+rect(x+w*.22,y+h*.16,w*.56,h*.64,'#454c54',18)+repeat(4,i=>circle(320+(i%2?1:-1)*w*.11,y+h*.3+Math.floor(i/2)*h*.32,5,dark))+rect(x+w*.7,y+h*.5,w*.12,h*.3,'#2c3136',4)+repeat(4,i=>rect(x+w*.715,y+h*.54+i*h*.06,w*.09,h*.03,steel,1))+repeat(10,i=>line(x+w*.27+i*w*.046,y+h*.21,x+w*.27+i*w*.046,y+h*.28,'#2c3136',3))
 if(v===2){const depth=p.n('tv-depth',10,16);return rect(250,y,depth,h,frame,3)+rect(250+depth,y+h*.25,depth*2.6,h*.5,'#3b4148',8)+(pedestal?rect(206,y+h+30,120,9,'#4a525a',4)+rect(252,y+h-4,14,36,'#4a525a',3):path(`M252 ${y+h-4}l-34 40h78l-30-40Z`,'#3a4249',dark,2))+group(rect(0,0,64,236,'#2d3237',30)+circle(32,34,10,'#c85a54')+repeat(9,i=>circle(18+i%3*14,80+Math.floor(i/3)*20,5,steel))+circle(32,170,20,'#454c54')+circle(32,170,8,steel),`translate(420,${y+40}) rotate(14)`)}
 const picture=path(`M${x+bezel} ${y+h*.78}Q${x+w*.3} ${y+h*.48} ${x+w*.5} ${y+h*.66}T${x+w-bezel} ${y+h*.55}V${y+h-bezel-4}H${x+bezel}Z`,p.accent,undefined,0,{opacity:.85})+circle(x+w*sun,y+h*.3,h*.09,'#f0d9ac')+line(x+w*.06,y+h*.1,x+w*.24,y+h*.1,'#fff',3,{opacity:.18})
 return feet+rect(x,y,w,h,frame,5,{stroke:dark,'stroke-width':2})+rect(x+bezel,y+bezel,w-bezel*2,h-bezel*2-4,'url(#screen)',2)+picture+circle(320,y+h-4,2.5,'#8fd19e')
}
function soundbar(p,v){
 const sub=/subwoofer|\bsub\b|\d\.1\b/.test(p.k),w=p.n('bar-width',sub?320:400,sub?360:468),h=p.n('bar-height',50,68),x=sub?96:320-w/2,y=sub?356:292,c=tone(p,'#2b2f33'),rx=h*.42
 const dots=(bx,by,bw,bh)=>{const cols=Math.floor(bw/11),rows=Math.max(1,Math.floor(bh/11));return repeat(cols*rows,i=>circle(bx+6+i%cols*11,by+6+Math.floor(i/cols)*11,2.2,'#000',{opacity:.3}))}
 const woofer=sub?rect(440,148,134,256,c,16,{stroke:dark,'stroke-width':2})+(v===1?circle(507,250,22,'#15181a')+rect(486,340,42,26,'#1f2326',4):circle(507,300,48,'#1d2124')+circle(507,300,31,'#3a4046')+circle(507,300,10,'#000',{opacity:.4}))+rect(470,166,74,6,'#fff',3,{opacity:.18}):''
 if(v===1)return woofer+rect(x,y,w,h,c,rx,{stroke:dark,'stroke-width':2})+rect(x+w*.4,y+h*.24,w*.2,h*.52,'#1f2326',6)+repeat(4,i=>rect(x+w*.42+i*w*.042,y+h*.38,w*.026,h*.24,steel,1))+repeat(2,i=>line(x+w*(i?.82:.18)-6,y+h*.5,x+w*(i?.82:.18)+6,y+h*.5,'#000',7))
 if(v===2)return rect(84,218,600,h*2.6,c,h*1.1,{stroke:dark,'stroke-width':3})+dots(130,218+h*.55,500,h*1.5)+repeat(3,i=>circle(220+i*58,224,7,'#fff',{opacity:.35}))+rect(84,218+h*2.6-10,600,10,'#000',4,{opacity:.2})
 return woofer+rect(x,y,w,h,c,rx,{stroke:dark,'stroke-width':2})+dots(x+rx*.7,y+h*.18,w-rx*1.4,h*.64)+rect(x+w*.47,y+3,w*.06,4,'#fff',2,{opacity:.5})
}
function eyewear(p,v){
 const k=p.k,goggles=/goggle/.test(k),ski=goggles&&/ski|snow/.test(k),optical=!goggles&&/optical|reading|prescription|eyeglasses|spectacles|blue[- ]light|computer|clear lens/.test(k)
 const frame=tone(p,goggles?'#2f5f8f':'#2a2c2e'),lens=optical?'#dcecf0':goggles?colour(p.raw.accent,ski?'#c77b3e':'#3e6f93'):/green|g-15/.test(k)?'#2f4436':/brown|amber|tortoise/.test(k)?'#5b4231':/blue|mirror/.test(k)?'#35546e':'#2b3136'
 const cy=p.n('lens-y',262,288)
 if(ski){const lw=p.n('ski-width',318,350),lh=p.n('ski-height',138,156),x=320-lw/2,t=cy-lh/2,b=cy+lh/2,shape=(i)=>`M${x+i} ${cy}Q${x+i} ${t+i} ${x+lw*.18} ${t+i}H${x+lw*.82}Q${x+lw-i} ${t+i} ${x+lw-i} ${cy}Q${x+lw-i} ${b-i} ${x+lw*.7} ${b-i}H${320+28}Q328 ${b-i-30} 320 ${b-i-34}Q312 ${b-i-30} ${320-28} ${b-i}H${x+lw*.3}Q${x+i} ${b-i} ${x+i} ${cy}Z`
  const strap=rect(x-80,cy-26,lw+160,52,p.accent,10)+repeat(9,i=>line(x-70+i*10,cy-20,x-70+i*10,cy+20,'#fff',1.5,{opacity:.25}))
  if(v===1)return ellipse(320,cy,lw*.62,70,'none',{stroke:p.accent,'stroke-width':46})+path(shape(0),frame,dark,3,{transform:`translate(0 ${cy}) scale(1 .45) translate(0 -${cy})`})
  if(v===2)return group(path(shape(0),frame,dark,3)+path(shape(14),lens,undefined,0),'translate(-150,-130) scale(1.5)')+path('M180 200q80-30 150-10','none','#fff',9,{opacity:.35})
  return strap+path(shape(0),frame,dark,3)+path(shape(14),lens,undefined,0)+path(`M${x+40} ${t+30}Q${x+lw*.4} ${t+12} ${x+lw*.62} ${t+26}`,'none','#fff',8,{opacity:.35})}
 if(goggles){const ew=p.n('goggle-lens',92,112),eh=ew*.64,gx=p.n('goggle-gap',100,118),strap=p.accent
  const eyes=repeat(2,i=>ellipse(320+(i?1:-1)*gx,cy,ew/2,eh/2,lens,{stroke:frame,'stroke-width':12})+ellipse(320+(i?1:-1)*gx-ew*.15,cy-eh*.15,ew*.14,eh*.08,'#fff',{opacity:.4}))+path(`M${320-gx+ew/2} ${cy}q${gx-ew/2} -20 ${2*(gx-ew/2)} 0`,'none',frame,7)
  if(v===1)return ellipse(320,cy+30,200,64,'none',{stroke:strap,'stroke-width':9})+group(eyes,`translate(0 ${cy+70}) scale(1 .5) translate(0 -${cy})`)
  if(v===2)return group(eyes,'translate(-190,-150) scale(1.6)')+path('M120 470q200-70 400 0','none',strap,9)
  return path(`M${320-gx-ew/2} ${cy}Q320 ${cy-150} ${320+gx+ew/2} ${cy}`,'none',strap,9)+path(`M${320-gx-ew/2} ${cy}Q320 ${cy+110} ${320+gx+ew/2} ${cy}`,'none',strap,9,{opacity:.55})+eyes}
 const style=/aviator|pilot/.test(k)?'aviator':/round|oval|lennon/.test(k)?'round':p.n('eyewear-style',0,1)<.55?'wayfarer':'square'
 const lw=p.n('lens-width',112,136),lh=style==='round'?lw*.92:p.n('lens-height',82,104),gap=p.n('bridge',30,46),cx=320+gap/2+lw/2,l=cx-lw/2,r=cx+lw/2,t=cy-lh/2,b=cy+lh/2
 const lensPath=style==='round'?`M${l} ${cy}a${lw/2} ${lh/2} 0 1 0 ${lw} 0a${lw/2} ${lh/2} 0 1 0 -${lw} 0Z`:style==='aviator'?`M${l+lw*.04} ${t+lh*.08}Q${cx} ${t-lh*.08} ${r} ${t+lh*.1}Q${r+lw*.04} ${t+lh*.62} ${cx+lw*.08} ${b}Q${l+lw*.04} ${b+lh*.04} ${l} ${t+lh*.42}Z`:style==='wayfarer'?`M${l} ${t}H${r+lw*.04}Q${r+lw*.07} ${t+lh*.3} ${r-lw*.04} ${b-lh*.22}Q${r-lw*.12} ${b} ${r-lw*.34} ${b}H${l+lw*.22}Q${l+lw*.02} ${b} ${l} ${b-lh*.3}Z`:`M${l} ${t+8}Q${l} ${t} ${l+10} ${t}H${r-10}Q${r} ${t} ${r} ${t+8}V${b-14}Q${r} ${b} ${r-16} ${b}H${l+16}Q${l} ${b} ${l} ${b-14}Z`
 const sw=style==='aviator'||optical&&p.n('eyewear-rim',0,1)<.5?4:11,mirror=s=>s+group(s,'translate(640,0) scale(-1,1)')
 const pair=mirror(path(lensPath,lens,frame,sw,{opacity:optical?.75:1})+path(`M${l+lw*.2} ${t+lh*.34}l${lw*.22}-${lh*.14}`,'none','#fff',5,{opacity:.28})+rect(r-4,t+4,18,12,frame,3))+path(`M${320-gap/2-3} ${t+lh*.24}Q320 ${t+lh*.04} ${320+gap/2+3} ${t+lh*.24}`,'none',frame,style==='aviator'?4:10)+(style==='aviator'?line(320-gap/2-lw*.4,t-1,320+gap/2+lw*.4,t-1,frame,3):'')+(style==='aviator'||optical?mirror(ellipse(320+gap/2+6,cy-lh*.04,5,9,'#e6e9e8',{stroke:steel,'stroke-width':1.5})):'')
 const temples=mirror(path(`M${r+10} ${t+12}L${640-r+lw*.25} ${b-lh*.18}`,'none',frame,7))
 if(v===1)return temples+group(pair,'',{opacity:.9})+line(320-lw-gap/2,b+18,320+lw+gap/2,b+18,'#000',3,{opacity:.08})
 if(v===2){const caseC=p.n('case-tone',0,1)>.5?'#3a2f2a':'#2f3b44';return ellipse(320,340,206,92,caseC,{stroke:dark,'stroke-width':3})+path('M120 330Q320 300 520 330','none','#000',3,{opacity:.35})+ellipse(320,318,180,64,'#b39d84',{opacity:.9})+group(temples+pair,'translate(122,140) scale(.62)')}
 return pair
}
function airFryer(p,v){
 const k=p.k,dual=/dual|double|\btwo\b|\bduo\b|zone|2-basket/.test(k),glass=/clear|window|view/.test(k),c=tone(p,'#2c3034'),w=p.n('fryer-width',dual?300:214,dual?346:258),h=p.n('fryer-height',248,292),x=320-w/2,y=448-h,rx=dual?30:w*.2,panelH=h*.24,drawerTop=y+panelH+30,dh=448-drawerTop-16
 const shell=rect(x,y,w,h,c,rx,{stroke:dark,'stroke-width':3})+line(x+rx*.7,y+9,x+w-rx*.7,y+9,'#fff',4,{opacity:.18})
 const panel=rect(x+w*.1,y+14,w*.8,panelH,'#1d2023',12)+rect(320-w*.14,y+22,w*.28,panelH*.42,'#6fb8bf',5,{opacity:.85})+(dual?repeat(6,i=>circle(x+w*.18+i*w*.128,y+20+panelH*.72,5.5,i%3?steel:p.accent)):circle(320,y+20+panelH*.72,10,steel)+repeat(4,i=>circle(i<2?320-w*.3+i*w*.1:320+w*.2+(i-2)*w*.1,y+20+panelH*.72,4.5,steel)))
 const drawer=(dx,dw)=>{const hy=drawerTop+dh*(glass?.58:.42);return rect(dx,drawerTop,dw,dh,'#000',dw*.14,{opacity:.18})+rect(dx+4,drawerTop+4,dw-8,dh-8,c,dw*.13,{stroke:dark,'stroke-width':2})+(glass?rect(dx+dw*.2,drawerTop+dh*.12,dw*.6,dh*.3,'url(#glass)',8):'')+rect(dx+dw*.2,hy,dw*.6,24,'#1d2023',12)+line(dx+dw*.28,hy+12,dx+dw*.72,hy+12,steel,3)}
 const feet=rect(x+w*.12,446,26,8,dark,3)+rect(x+w*.88-26,446,26,8,dark,3)
 if(v===1){const bw=p.n('basket-width',150,176),bx=390,by=318,bh=118;return group(feet+shell+panel+rect(x+16,drawerTop+4,w-32,dh-10,'#16191b',16),'translate(-92,0)')+rect(bx,by,bw,bh,c,22,{stroke:dark,'stroke-width':3})+ellipse(bx+bw/2,by,bw/2,20,'#1d2023')+repeat(18,i=>circle(bx+bw*.2+i%6*bw*.12,by-7+Math.floor(i/6)*7,2.5,steel))+rect(bx+bw*.3,by+bh*.42,bw*.4,22,'#1d2023',11)}
 if(v===2){const dial=p.n('dial-r',34,44);return rect(118,168,404,262,c,44,{stroke:dark,'stroke-width':3})+rect(150,194,340,210,'#1d2023',26)+rect(250,214,140,58,'#6fb8bf',8,{opacity:.85})+repeat(3,i=>rect(268+i*38,230,26,26,'#1d2023',3,{opacity:.55}))+circle(320,336,dial,steel)+circle(320,336,dial-10,'#3a4046')+line(320,336,320,336-dial+14,'#fff',4)+repeat(4,i=>circle(i<2?186+i*40:414+(i-2)*40,336,11,i===3?p.accent:steel))}
 return feet+shell+panel+(dual?drawer(x+12,w/2-18)+drawer(320+6,w/2-18):drawer(x+14,w-28))
}
function dishwasher(p,v){
 const k=p.k,slim=/slim|45 ?cm|compact/.test(k),built=/built-in|integrated/.test(k),c=tone(p,/stainless|steel|silver/.test(k)?'#b9c2c8':'#eceeea'),w=slim?p.n('dw-width',196,222):p.n('dw-width',254,288),h=p.n('dw-height',318,342),x=320-w/2,y=452-h,strip=h*.11,handleY=y+strip+p.n('dw-handle',14,24)
 if(v===1){const cab=h-74,rack=(ry,items)=>rect(x+16,ry,w-32,8,'none',2,{stroke:steel,'stroke-width':3})+repeat(9,i=>line(x+22+i*(w-44)/8,ry-items,x+22+i*(w-44)/8,ry+8,steel,1.5));return rect(x,y,w,cab,c,8,{stroke:dark,'stroke-width':3})+rect(x+12,y+strip,w-24,cab-strip-6,'#5d6971',4)+repeat(4,i=>path(`M${x+30+i*(w-60)/4} ${y+strip+40}h${(w-60)/4-10}l-6 34h${-(w-60)/4+22}Z`,i%2?p.accent:'#e9e6dd'))+rack(y+strip+76,40)+repeat(6,i=>ellipse(x+36+i*(w-72)/5,y+cab-58,9,40,'#f1efe9',{stroke:steel,'stroke-width':2}))+rack(y+cab-24,46)+poly(`${x},${y+cab} ${x+w},${y+cab} ${x+w+36},${y+cab+66} ${x-36},${y+cab+66}`,c,{stroke:dark,'stroke-width':3})+poly(`${x+14},${y+cab+6} ${x+w-14},${y+cab+6} ${x+w+12},${y+cab+56} ${x-12},${y+cab+56}`,'#c3cbd0')}
 if(v===2)return rect(96,176,448,236,c,14,{stroke:dark,'stroke-width':3})+rect(99,179,442,84,'#000',10,{opacity:.12})+rect(128,204,118,38,'#3b4650',6)+repeat(3,i=>rect(140+i*34,214,22,18,'#7fd3a2',2,{opacity:.7}))+repeat(6,i=>circle(282+i*40,222,9,i===5?p.accent:'#6d7880'))+line(102,266,538,266,'#000',2,{opacity:.3})+rect(150,300+p.n('dw-handle',0,12),340,24,steel,12,{stroke:dark,'stroke-width':2})
 return rect(x,y,w,h,c,8,{stroke:dark,'stroke-width':3})+(built?'':rect(x+3,y+3,w-6,strip,'#000',6,{opacity:.12})+rect(x+w*.08,y+strip*.3,w*.24,strip*.42,'#3b4650',3)+repeat(5,i=>circle(x+w*.45+i*w*.09,y+strip*.52,4.5,i===4?p.accent:'#6d7880')))+line(x+6,y+strip+2,x+w-6,y+strip+2,'#000',2,{opacity:.3})+rect(x+w*.18,handleY,w*.64,12,steel,6,{stroke:dark,'stroke-width':1.5})+rect(x+6,y+h-30,w-12,24,'#3b4650',4)+line(x+16,handleY+40,x+16,y+h-48,'#fff',5,{opacity:.22})
}
function hairTool(p,v){
 const k=p.k,c=tone(p,'#5d4a6b'),straight=/straighten|flat iron|crimp|waver/.test(k),wand=!straight&&/airwrap|multi-?styler|air styler|flexstyle|hot (?:air )?brush|dryer brush|curling|curler|styler|\bwand\b/.test(k),ring=!straight&&!wand&&/supersonic|dyson/.test(k),cord=(x,y)=>path(`M${x} ${y}q-10 44 -64 38q-62-6-80 30`,'none',dark,6)
 const barrel=(x,y,len,col)=>rect(x,y,40,len,col,20,{stroke:dark,'stroke-width':2})+repeat(Math.floor(len/22),i=>path(`M${x+3} ${y+14+i*22}l34 12`,'none',dark,2,{opacity:.35}))
 const brushHead=(x,y,len)=>rect(x,y,36,len,'#2b3036',18)+repeat(Math.floor(len/12)*2,i=>circle(x+10+i%2*16,y+8+Math.floor(i/2)*12,3,'#c9b9a5'))
 if(straight){const len=p.n('iron-length',290,330),open=p.n('iron-open',4,8),arm=rot=>group(rect(-22,-len,44,len,c,20,{stroke:dark,'stroke-width':3})+rect(-15,-len+14,30,len*.42,'#c9cdd0',8,{stroke:steel,'stroke-width':2})+circle(0,-len*.36,5,p.accent),`translate(320 452) rotate(${rot})`)
  if(v===1)return rect(232,96,176,370,'#3a3d42',36)+repeat(14,i=>line(250,120+i*24,390,120+i*24,'#fff',1,{opacity:.12}))+group(rect(-26,-len,52,len,c,22,{stroke:dark,'stroke-width':3})+line(0,-len+8,0,-8,'#000',2),'translate(320 452)')
  if(v===2)return rect(196,128,248,330,c,30,{stroke:dark,'stroke-width':3})+rect(226,150,188,236,'#c9cdd0',14,{stroke:steel,'stroke-width':3})+repeat(5,i=>line(244,180+i*40,396,180+i*40,'#fff',3,{opacity:.4}))+rect(268,404,104,30,'#1d2023',6)+repeat(3,i=>rect(284+i*26,412,16,14,'#e0a050',2,{opacity:.6+i*.1}))
  return cord(320,452)+arm(-open)+arm(open)+circle(320,440,14,'#2b3036')}
 if(wand){const hl=p.n('wand-length',236,268)
  if(v===1)return repeat(4,i=>{const x=160+i*86;return i===1?brushHead(x,190,170)+rect(x,358,36,30,'#2b3036',6):i===3?path(`M${x} 210h40l-6 160h-28Z`,'#2b3036')+rect(x-2,356,44,30,'#2b3036',6):barrel(x,190+i*6,170-i*6,i?'#c49a6c':steel)+rect(x,356,40,30,'#2b3036',6)})+line(140,400,500,400,steel,4)
  if(v===2)return barrel(270,110,300,'#c49a6c')+repeat(10,i=>rect(282,130+i*28,16,4,dark,2,{opacity:.5}))+rect(250,410,140,40,c,12)
  return cord(320,200+hl)+rect(296,200,48,hl,c,24,{stroke:dark,'stroke-width':3})+repeat(12,i=>circle(306+i%3*14,200+hl-70+Math.floor(i/3)*12,2.5,'#000',{opacity:.35}))+rect(294,196,52,14,'#2b3036',5)+circle(320,250,7,p.accent)+barrel(300,70,130,'#c49a6c')+group(brushHead(0,0,140),'translate(430 250) rotate(-16)')}
 if(ring){const hr=p.n('ring-r',80,92)
  if(v===1)return rect(292,250,56,200,c,24,{stroke:dark,'stroke-width':3})+circle(320,190,hr,c,{stroke:dark,'stroke-width':3})+repeat(36,i=>circle(320+Math.cos(i*.175)*hr*.78,190+Math.sin(i*.175)*hr*.78,2.5,dark))+repeat(20,i=>circle(301+i%5*10,330+Math.floor(i/5)*12,2.5,'#000',{opacity:.4}))
  if(v===2)return group(circle(0,0,hr,c,{stroke:dark,'stroke-width':3})+circle(0,0,hr*.52,'#f5f4f0',{stroke:steel,'stroke-width':6}),'translate(250 250) scale(1.4)')+path('M430 200h70l18 60h-106Z','#2b3036')+path('M420 330a46 46 0 1 1 92 0a46 46 0 1 1 -92 0',p.accent)+repeat(7,i=>circle(440+i%4*16,316+Math.floor(i/4)*20,5,'#2b3036'))
  return cord(320,450)+rect(292,250,56,200,c,24,{stroke:dark,'stroke-width':3})+rect(312,300,16,38,'#2b3036',6)+circle(320,190,hr,c,{stroke:dark,'stroke-width':3})+circle(320,190,hr*.52,'#f5f4f0',{stroke:steel,'stroke-width':6})+repeat(16,i=>circle(301+i%4*12,410+Math.floor(i/4)*9,2,'#000',{opacity:.35}))}
 const L=p.n('dryer-length',236,284),D=p.n('dryer-diameter',98,118),bx=320-L/2-14,by=p.n('dryer-y',150,172)
 const handle=group(rect(-28,0,56,178,c,24,{stroke:dark,'stroke-width':3})+rect(-10,40,20,34,'#2b3036',8)+circle(0,98,6,p.accent),`translate(${bx+L*.4} ${by+D-16}) rotate(14)`)
 if(v===1)return handle+circle(bx+L*.4,by+D/2,D*.62,c,{stroke:dark,'stroke-width':3})+circle(bx+L*.4,by+D/2,D*.46,'#3a4046')+repeat(4,i=>circle(bx+L*.4,by+D/2,D*(.1+i*.09),'none',{stroke:steel,'stroke-width':2}))
 if(v===2)return path('M150 230h110l50 50v40l-50 50H150Z','#3a4046',dark,3)+repeat(4,i=>line(270,262+i*18,300,262+i*18,steel,2))+circle(430,300,92,'#3a4046',{stroke:dark,'stroke-width':3})+repeat(19,i=>{const a=i*.33;return rect(426+Math.cos(a)*(i%2?36:66),296+Math.sin(a)*(i%2?36:66),10,10,c,5)})
 return cord(bx+L*.4+40,by+D+160)+handle+rect(bx,by,L,D,c,D/2,{stroke:dark,'stroke-width':3})+ellipse(bx+12,by+D/2,16,D/2-5,'#3a4046')+repeat(5,i=>line(bx+5,by+15+i*(D-30)/4,bx+19,by+15+i*(D-30)/4,steel,2))+path(`M${bx+L-6} ${by+9}L${bx+L+58} ${by+D*.3}V${by+D*.7}L${bx+L-6} ${by+D-9}Z`,'#3a4046',dark,2)+line(bx+28,by+14,bx+L-30,by+14,'#fff',4,{opacity:.25})
}
function healthMonitor(p,v){
 const c=tone(p,'#eef0ee'),cuff=p.n('cuff-tone',0,1)>.5?'#33475f':'#3e4448',uw=p.n('bp-width',166,194),uh=p.n('bp-height',212,242),ux=p.n('bp-x',318,340),uy=448-uh,hx=ux+uw-44,hy=uy+46
 const unit=rect(ux,uy,uw,uh,c,30,{stroke:dark,'stroke-width':3})+rect(ux+18,uy+20,uw-36,uh*.46,'#b9c9b8',10,{stroke:'#7f8f86','stroke-width':2})+repeat(3,i=>rect(ux+32,uy+38+i*uh*.12,(uw-90)*(1-i*.24),uh*.06,'#2f3d35',3,{opacity:.8}))+path(`M${hx} ${hy}c-6-8-18-2-10 8l10 9 10-9c8-10-4-16-10-8Z`,'#c0504d')+circle(ux+uw/2,uy+uh*.76,uh*.1,p.accent,{stroke:dark,'stroke-width':2})+repeat(2,i=>rect(ux+22+i*(uw-62),uy+uh*.72,18,11,'#9aa4aa',4))
 const tube=(x1,y1,x2,y2)=>path(`M${x1} ${y1}C${x1+30} ${y1+90} ${x2-70} ${y2+40} ${x2} ${y2}`,'none','#7d8a93',7)
 if(v===1)return tube(330,372,ux+24,uy-10)+rect(96,300,432,88,cuff,26,{stroke:dark,'stroke-width':3})+rect(128,316,150,56,'#c9ced2',8,{opacity:.9})+path('M300 312V378','none','#fff',2,{'stroke-dasharray':'5 4'})+rect(472,318,40,52,steel,8,{stroke:dark,'stroke-width':2})+group(unit,`translate(${ux*.45} ${uy*.45-110}) scale(.55)`)
 if(v===2)return group(unit,`translate(${-ux*1.6+170} ${-uy*1.6+110}) scale(1.6)`)
 return tube(206,420,ux,uy+uh*.56)+rect(104,262,200,158,cuff,24,{stroke:dark,'stroke-width':3})+ellipse(204,262,100,28,'#232c35',{stroke:dark,'stroke-width':3})+rect(130,300,148,52,'#c9ced2',8,{opacity:.85})+circle(278,388,12,'none',{stroke:steel,'stroke-width':5})+unit
}
function treadmill(p,v){
 const pad=/walking pad|under.?desk/.test(p.k),len=p.n('deck-length',320,372),c=tone(p,'#2c3136'),x0=pad?150:116,y0=pad?420:418,ex=x0+len
 const deck=poly(`${x0},${y0} ${ex},${y0-46} ${ex+64},${y0-14} ${x0+60},${y0+30}`,c,{stroke:dark,'stroke-width':3})+poly(`${x0+18},${y0} ${ex-14},${y0-40} ${ex+30},${y0-18} ${x0+60},${y0+20}`,'#454c53')+repeat(8,i=>line(x0+40+i*(len-40)/8,y0-6-i*(46/8)+2,x0+70+i*(len-40)/8,y0+16-i*(46/8),'#30363b',2))+path(`M${ex-24} ${y0-48}h52q36 0 36 34v8h-88Z`,c,dark,2)
 if(pad){if(v===1)return rect(150,170,340,250,c,34,{stroke:dark,'stroke-width':3})+rect(186,196,268,198,'#454c53',18)+repeat(9,i=>line(196,214+i*20,444,214+i*20,'#30363b',2))+rect(300,404,40,8,steel,3)+group(rect(0,0,44,92,'#2d3237',18)+circle(22,24,8,p.accent)+repeat(4,i=>circle(14+i%2*16,52+Math.floor(i/2)*16,4,steel)),'translate(520 300) rotate(12)')
  if(v===2)return rect(120,232,400,190,c,30,{stroke:dark,'stroke-width':3})+rect(160,258,320,110,'#30363b',14)+rect(250,284,140,46,'#6fb8bf',6,{opacity:.85})+repeat(9,i=>line(130+i*44,400,150+i*44,400,'#454c53',6))
  return deck+rect(x0+len*.48,y0-26,62,14,'#6fb8bf',4,{opacity:.85})}
 const top=p.n('console-top',152,176),post=line(ex+18,y0-44,ex+4,top+40,steel,14)+line(ex+40,y0-30,ex+30,top+44,steel,10)
 const consoleBox=poly(`${ex-82},${top+40} ${ex+50},${top+20} ${ex+60},${top+60} ${ex-70},${top+82}`,'#30363b',{stroke:dark,'stroke-width':2})+poly(`${ex-56},${top+46} ${ex+20},${top+34} ${ex+26},${top+56} ${ex-50},${top+68}`,'#6fb8bf',{opacity:.85})+line(ex-110,top+96,ex-20,top+74,steel,9)
 if(v===1)return rect(ex-60,top+20,88,250,c,16,{stroke:dark,'stroke-width':3})+rect(ex-46,top+40,60,210,'#454c53',10)+post+consoleBox+rect(ex-130,y0-14,240,24,c,8)+circle(ex-100,y0+10,10,dark)+circle(ex+80,y0+10,10,dark)
 if(v===2)return rect(108,180,424,190,'#30363b',26,{stroke:dark,'stroke-width':3})+rect(170,206,300,90,'#6fb8bf',10,{opacity:.85})+repeat(3,i=>rect(196+i*90,226,64,46,'#30363b',4,{opacity:.35}))+repeat(6,i=>circle(160+i*64,330,12,i===5?'#c0504d':steel))+line(80,410,560,380,steel,14)
 return deck+post+consoleBox
}
function dollArt(p,v){
 const baby=/baby|reborn|newborn|annabell|kissy|tiny|bitty/.test(p.k),skins=['#f1cfb4','#e2b48e','#c68b62','#8d5a3b'],hairs=['#e3c27a','#6b4630','#2b2321','#b5573c','#d77fa9'],skin=skins[Math.floor(p.n('doll-skin',0,3.99))],hair=hairs[Math.floor(p.n('doll-hair',0,4.99))],dress=tone(p,p.accent),pink='#e59aa8'
 if(baby){const hr=p.n('baby-head',58,66),bw=p.n('baby-body',112,132),body=ellipse(250,320,26,46,skin,{transform:'rotate(28 250 320)'})+ellipse(390,320,26,46,skin,{transform:'rotate(-28 390 320)'})+ellipse(286,420,30,38,skin)+ellipse(354,420,30,38,skin)+rect(320-bw/2,250,bw,150,dress,48,{stroke:dark,'stroke-width':2})+path(`M${320-bw/2+10} 272q${bw/2-10} 26 ${bw-20} 0`,'none','#fff',4,{opacity:.6})
  if(v===1)return body+circle(320,186,hr,skin)+path(`M${320-hr} 180Q${320-hr} ${186-hr*1.1} 320 ${186-hr}Q${320+hr} ${186-hr*1.1} ${320+hr} 180Q320 160 ${320-hr} 180Z`,hair)+ellipse(320,312,22,14,p.accent)
  if(v===2)return group(body+circle(320,186,hr,skin)+circle(298,186,7,dark)+circle(342,186,7,dark)+circle(320,214,11,p.accent)+circle(320,214,5,'#fff'),'translate(-150,-100) scale(1.4)')+rect(430,370,110,70,'#f3f1ea',14,{stroke:steel,'stroke-width':2})+rect(430,350,40,30,pink,8)
  return body+circle(320,186,hr,skin,{stroke:'#000','stroke-opacity':.08})+path(`M${300} ${186-hr+6}q20-16 34 2q-16-4-34-2Z`,hair)+circle(298,188,7,dark)+circle(342,188,7,dark)+circle(286,206,9,pink,{opacity:.45})+circle(354,206,9,pink,{opacity:.45})+circle(320,214,11,p.accent)+circle(320,214,5,'#fff')}
 const hl=p.n('hair-length',198,246),sk=p.n('skirt-width',58,82),sy=p.n('skirt-length',318,350)
 const limbs=line(292,198,264,300,skin,11)+line(348,198,376,300,skin,11)+line(309,sy-6,304,436,skin,12)+line(331,sy-6,336,436,skin,12)+ellipse(300,442,14,7,p.accent)+ellipse(340,442,14,7,p.accent)
 const outfit=path('M294 186H346L340 250H300Z',dress,dark,2)+path(`M300 248H340L${320+sk} ${sy}H${320-sk}Z`,dress,dark,2)+path(`M${322-sk} ${sy-10}H${318+sk}`,'none','#fff',3,{opacity:.5})+rect(313,166,14,22,skin)
 const big=s=>group(s,'translate(-64,-62) scale(1.2)')
 if(v===1)return big(path(`M282 140Q280 94 320 94Q362 94 358 140L366 ${hl}Q320 ${hl+14} 274 ${hl}Z`,hair)+limbs+outfit+circle(320,138,35,hair)+path('M300 240l20 12-20 12Zm40 0l-20 12 20 12Z',p.accent))
 if(v===2)return group(path(`M282 140Q280 94 320 94Q362 94 358 140L366 ${hl}Q320 ${hl+14} 274 ${hl}Z`,hair)+rect(313,166,14,22,skin)+path('M294 186H346L340 250H300Z',dress,dark,2)+circle(320,138,34,skin)+path('M287 130Q300 100 330 104Q352 110 354 132Q330 116 287 130Z',hair)+circle(308,140,4,dark)+circle(332,140,4,dark)+path('M312 156q8 6 16 0','none','#c25a6a',3),'translate(-330,-150) scale(2)')+path('M440 400h70l-6 46h-58Z',p.accent)+path('M452 400q22-34 46 0','none',p.accent,5)
 return big(path(`M282 140Q280 94 320 94Q362 94 358 140L366 ${hl}Q320 ${hl+14} 274 ${hl}Z`,hair)+limbs+outfit+circle(320,138,34,skin)+path('M287 130Q300 100 330 104Q352 110 354 132Q330 116 287 130Z',hair)+circle(308,140,3.6,dark)+circle(332,140,3.6,dark)+circle(300,150,6,pink,{opacity:.4})+circle(340,150,6,pink,{opacity:.4})+path('M312 156q8 6 16 0','none','#c25a6a',3))
}
function pint(p,v){
 const w=p.n('pint-width',176,206),h=p.n('pint-height',190,222),x=320-w/2,y=446-h,c=tone(p,p.accent),flavour=/chocolate|fudge|brownie|half baked|cookie/.test(p.k)?'#7a5340':/strawberr|cherry|raspberr/.test(p.k)?'#e3a0a4':/mint|pistachio/.test(p.k)?'#b9dcc0':'#f3e7c8'
 const tub=path(`M${x} ${y+24}H${x+w}L${x+w-14} ${y+h}Q320 ${y+h+12} ${x+14} ${y+h}Z`,c,dark,3)+path(`M${x+8} ${y+h*.42}Q320 ${y+h*.34} ${x+w-8} ${y+h*.42}`,'none','#fff',14,{opacity:.6})+ellipse(x+w*.7,y+h*.68,w*.13,h*.1,'#fff',{opacity:.55})
 if(v===1)return tub+repeat(6,i=>rect(x+30,y+h*.5+i*12,w-60-(i%3)*20,5,dark,2,{opacity:.3}))+ellipse(320,y+24,w/2,22,'#000',{opacity:.12})
 if(v===2)return ellipse(320,330,184,70,'#e9e6dd',{stroke:steel,'stroke-width':3})+repeat(3,i=>circle(250+i*68,300+(i%2)*14,52,flavour,{stroke:'#000','stroke-opacity':.12}))+(/chocolate|fudge|brownie|half baked|cookie/.test(p.k)?repeat(9,i=>rect(232+p.n('chunk-x'+i,0,170),280+p.n('chunk-y'+i,0,50),12,10,'#4e3428',2)):'')+path('M470 290l60-90','none',steel,10)
 return tub+ellipse(320,y+24,w/2+6,24,c,{stroke:dark,'stroke-width':3})+ellipse(320,y+18,w/2-6,16,'#fff',{opacity:.25})
}
function milk(p,v){
 const k=p.k,juice=/juice/.test(k),jug=/gal|gallon|\b[1-4] ?l\b|litre|liter|\bjug\b|pint/.test(k)||p.n('milk-pack',0,1)<.3,cap=/whole/.test(k)?'#c0393b':/2%|reduced/.test(k)?'#3b6db3':/skim|fat.free|1%/.test(k)?'#73a9d6':juice?'#e3912f':p.accent,liquid=juice?'#f2b34a':'#fbfbf7'
 let body
 if(jug){const w=p.n('jug-width',190,224),h=p.n('jug-height',248,278),x=320-w/2,y=448-h
  body=path(`M${x+20} ${y+70}Q${x} ${y+90} ${x} ${y+130}V${y+h-20}Q${x} ${y+h} ${x+20} ${y+h}H${x+w-20}Q${x+w} ${y+h} ${x+w} ${y+h-20}V${y+60}Q${x+w} ${y+20} ${x+w-40} ${y+16}H${x+w*.48}L${x+w*.42} ${y+30}H${x+w*.26}L${x+w*.2} ${y+52}Q${x+30} ${y+56} ${x+20} ${y+70}Z`,juice?liquid:'#f4f6f3',steel,3)+path(`M${x+w-74} ${y+42}H${x+w-30}Q${x+w-18} ${y+44} ${x+w-18} ${y+58}V${y+100}Q${x+w-18} ${y+112} ${x+w-32} ${y+112}H${x+w-62}Q${x+w-74} ${y+112} ${x+w-74} ${y+100}Z`,'#f5f4f0',steel,2)+rect(x+w*.22,y+6,w*.22,28,'#f4f6f3',4,{stroke:steel,'stroke-width':2})+rect(x+w*.19,y-12,w*.28,22,cap,5)+rect(x+8,y+h*.48,w-16,h*.3,cap,8,{opacity:.92})+path(`M${x+8} ${y+h*.62}q${w*.3}-24 ${w-16} 6`,'none','#fff',6,{opacity:.7})+circle(x+w*.72,y+h*.56,12,'#fff',{opacity:.85})}
 else{const w=p.n('carton-width',128,156),h=p.n('carton-height',248,286),x=320-w/2-14,y=450-h,d=38
  body=poly(`${x+w},${y+50} ${x+w+d},${y+38} ${x+w+d},${y+h-12} ${x+w},${y+h}`,'#dcdad2',{stroke:steel,'stroke-width':2})+poly(`${x+w/2},${y} ${x+w/2+d},${y-12} ${x+w+d},${y+38} ${x+w},${y+50}`,'#e7e5de',{stroke:steel,'stroke-width':2})+rect(x,y+50,w,h-50,'#f7f6f1',3,{stroke:steel,'stroke-width':2})+poly(`${x},${y+50} ${x+w/2},${y} ${x+w},${y+50}`,'#efeee8',{stroke:steel,'stroke-width':2})+rect(x+w/2-4,y-14,d+8,14,'#e7e5de',2,{stroke:steel,'stroke-width':1.5})+circle(x+w*.3,y+36,11,cap)+rect(x,y+h*.44,w,h*.32,cap)+path(`M${x} ${y+h*.56}q${w*.4}-22 ${w} 4`,'none','#fff',6,{opacity:.7})}
 if(v===1)return group(body,'translate(640,0) scale(-1,1)')+repeat(7,i=>rect(268,212+i*14,104-(i%3)*18,5,dark,2,{opacity:.35}))
 if(v===2){const gx=p.n('glass-x',372,392);return group(body,'translate(40,120) scale(.62)')+path(`M${gx} 250h112l-12 196h-88Z`,'url(#glass)',steel,3)+path(`M${gx+4} 286h104l-9 156h-86Z`,liquid,undefined,0,{opacity:.95})+ellipse(gx+56,286,52,8,'#fff')}
 return body
}
function produce(p,v){
 const k=p.t,banana=/banana|바나나/.test(k),leafy=/spinach|lettuce|salad|greens|상추|시금치|양배추|배추/.test(k),grape=/grape|포도|샤인머스캣/.test(k),avocado=/avocado/.test(k),bagged=/\bbag\b|\d ?lbs?\b|\bkg\b|\bnet\b|\bpack\b/.test(k)&&!banana&&!leafy
 const kiwi=/kiwi|키위/.test(k),persimmon=/persimmon|단감|홍시|대봉|(?:^|\s)감(?=\s|$|\d)/.test(k),straw=/strawberr|딸기/.test(k),blue=/blueberr|블루베리/.test(k),water=/watermelon|수박/.test(k),kmelon=/참외|korean melon/.test(k),carrot=/carrot|당근/.test(k),mango=/mango|망고/.test(k),tangerine=/감귤|(?:^|\s)귤|한라봉|천혜향|레드향|tangerine|mandarin|clementine/.test(k),sweetPotato=/sweet potato|고구마/.test(k),potato=!sweetPotato&&/potato|감자/.test(k),cucumber=/cucumber|오이/.test(k),broccoli=/broccoli|브로콜리/.test(k)
 const special=kiwi?'#7b5a35':persimmon?'#e2741f':straw?'#d0303a':blue?'#2f3d6b':water?'#3f7a3a':kmelon?'#f0c419':carrot?'#ea7b26':mango?'#f0a92e':tangerine?'#f08a1c':sweetPotato?'#8a3e5a':potato?'#c09a62':cucumber?'#4f8a3a':broccoli?'#3f7d3a':/사과/.test(k)?'#c2443b':/바나나/.test(k)?'#e7c64a':/포도|샤인머스캣/.test(k)?(/샤인|청포도/.test(k)?'#a7bf5a':'#6a3d6e'):/복숭아/.test(k)?'#f1a273':/토마토/.test(k)?'#d0452f':/배(?=\s|$)|신고배|나주배/.test(k)?'#d8b25a':/레몬/.test(k)?'#ecd34b':/양파/.test(k)?'#c58d5a':null
 const col=special?special:/apple/.test(k)?(/granny|green/.test(k)?'#8cb04a':'#c2443b'):/orange|clementine|mandarin/.test(k)?'#e88a2c':/lemon/.test(k)?'#ecd34b':/lime/.test(k)?'#7aa846':avocado?'#3f5226':/tomato/.test(k)?'#d0452f':/peach/.test(k)?'#f1a273':/pear/.test(k)?'#b9c255':/plum|cherr/.test(k)?'#7a2638':/potato/.test(k)?'#b98c58':/onion/.test(k)?'#c58d5a':grape?(/green|white/.test(k)?'#a7bf5a':'#6a3d6e'):'#c2443b'
 const odd=(x,y,r,i)=>{const rot=p.n('rot'+i,-30,30)
  if(kiwi)return ellipse(x,y,r*1.05,r*.82,col,{stroke:'#4a3520','stroke-width':2,transform:`rotate(${rot} ${x} ${y})`})+repeat(10,j=>circle(x-r*.6+(j*37)%(r*1.2),y-r*.4+(j*23)%(r*.8),1.5,'#a88a62'))
  if(persimmon)return ellipse(x,y,r,r*.8,col,{stroke:'#a14c12','stroke-width':2})+repeat(4,j=>ellipse(x+Math.cos(j*1.57)*r*.22,y-r*.74+Math.sin(j*1.57)*r*.1,r*.24,r*.1,'#5c6b2e',{transform:`rotate(${j*90} ${x} ${y-r*.74})`}))+circle(x,y-r*.76,r*.08,'#4a3a20')+ellipse(x-r*.35,y-r*.25,r*.22,r*.12,'#fff',{opacity:.3})
  if(straw)return path(`M${x} ${y+r}C${x-r*1.1} ${y+r*.1} ${x-r} ${y-r*.8} ${x} ${y-r*.7}C${x+r} ${y-r*.8} ${x+r*1.1} ${y+r*.1} ${x} ${y+r}Z`,col,'#8f1f26',2)+repeat(9,j=>ellipse(x-r*.5+(j%3)*r*.5,y-r*.35+Math.floor(j/3)*r*.42,2,3,'#f3d36b'))+path(`M${x-r*.5} ${y-r*.7}l${r*.25} ${-r*.3} ${r*.25} ${r*.2} ${r*.25} ${-r*.2} ${r*.25} ${r*.3}Z`,'#4f8a3a')
  if(blue)return circle(x,y,r*.42,col,{stroke:'#1c2442','stroke-width':1.5})+circle(x-r*.5,y+r*.2,r*.4,col)+circle(x+r*.5,y+r*.25,r*.4,col)+circle(x,y,r*.1,'#1c2442')+circle(x-r*.12,y-r*.15,r*.08,'#c8d2ea',{opacity:.6})
  if(water)return ellipse(x,y,r*1.5,r*1.15,col,{stroke:'#23461f','stroke-width':2})+repeat(5,j=>path(`M${x-r*1.1+j*r*.55} ${y-r}q${r*.15} ${r} 0 ${r*2}`,'none','#1f3d1c',r*.12))
  if(kmelon)return ellipse(x,y,r*1.1,r*.8,col,{stroke:'#a8840c','stroke-width':2})+repeat(5,j=>path(`M${x-r*.8+j*r*.4} ${y-r*.7}q${r*.1} ${r*.7} 0 ${r*1.4}`,'none','#fbf2c8',3))
  if(carrot)return group(path(`M${-r*.3} 0L${r*.3} 0L0 ${r*2.2}Z`,col,'#b4561a',2)+repeat(4,j=>line(-r*.2,r*(.4+j*.4),r*.1,r*(.45+j*.4),'#b4561a',1.5))+path(`M-6 0q-14-30 -6-44M0 0v-48M6 0q14-30 6-44`,'none','#4f8a3a',5),`translate(${x} ${y-r}) rotate(${rot})`)
  if(mango)return ellipse(x,y,r*1.15,r*.85,col,{stroke:'#b26d14','stroke-width':2,transform:`rotate(${rot} ${x} ${y})`})+ellipse(x-r*.4,y-r*.2,r*.5,r*.4,'#c94a2a',{opacity:.4})
  if(potato||sweetPotato)return ellipse(x,y,r*(sweetPotato?1.4:1.1),r*(sweetPotato?.6:.8),col,{stroke:'#5a4128','stroke-width':2,transform:`rotate(${rot} ${x} ${y})`})+repeat(4,j=>circle(x-r*.5+j*r*.3,y-r*.1+(j%2)*r*.2,1.8,'#5a4128'))
  if(cucumber)return ellipse(x,y,r*1.6,r*.38,col,{stroke:'#2c5420','stroke-width':2,transform:`rotate(${rot} ${x} ${y})`})+repeat(6,j=>circle(x-r+j*r*.4,y,1.6,'#d9e8c2'))
  if(broccoli)return rect(x-r*.18,y,r*.36,r*.9,'#8fb36a',r*.1)+repeat(6,j=>circle(x-r*.5+(j%3)*r*.5,y-r*.15-Math.floor(j/3)*r*.4,r*.38,col,{stroke:'#2c5420','stroke-width':1.5}))
  return null}
 const fruit=(x,y,r,i)=>odd(x,y,r,i)||(avocado?ellipse(x,y,r*.8,r,col,{stroke:'#26331a','stroke-width':2,transform:`rotate(${p.n('rot'+i,-30,30)} ${x} ${y})`})+ellipse(x-r*.25,y-r*.4,r*.14,r*.24,'#fff',{opacity:.16}):circle(x,y,r,col,{stroke:'#000','stroke-opacity':.18,'stroke-width':2})+(/honeycrisp|gala|pink lady|fuji/.test(k)?ellipse(x+r*.3,y+r*.3,r*.5,r*.42,'#e9b64c',{opacity:.35}):'')+ellipse(x-r*.35,y-r*.38,r*.2,r*.13,'#fff',{opacity:.35})+(/apple|pear|cherr|plum/.test(k)?line(x,y-r+4,x+4,y-r-12,'#5b4a2e',4)+ellipse(x+14,y-r-6,10,5,'#6e8f45',{transform:`rotate(-25 ${x+14} ${y-r-6})`}):/orange|clementine|mandarin|lemon|lime/.test(k)?circle(x,y-r*.1,2.5,'#000',{opacity:.25}):''))
 const banan=(sx,sy,rot,len)=>group(path(`M0 0C${len*.25} ${-len*.1} ${len*.75} ${-len*.05} ${len} ${-len*.42}C${len*.82} ${-len*.02} ${len*.3} ${len*.2} 0 22Z`,'#e7c64a','#b8963a',2)+path(`M${len} ${-len*.42}l10-6`,'none','#5b4a2e',6)+path(`M${len*.2} 9C${len*.5} 9 ${len*.75} 0 ${len*.92} ${-len*.3}`,'none','#fff',3,{opacity:.3}),`translate(${sx} ${sy}) rotate(${rot})`)
 const bunch=n=>repeat(n,i=>banan(196,330+i*6,-34+i*(48/Math.max(1,n-1)),p.n('banana'+i,226,262)))+path('M168 336q14-16 34-6l-4 22q-18 4-30-16Z','#7d8a3a',dark,2)
 const grapes=(cx,cy,s)=>line(cx,cy-20,cx+10,cy-60,'#5b4a2e',5)+repeat(15,i=>{const row=i<5?0:i<9?1:i<12?2:i<14?3:4,inRow=[0,5,9,12,14][row],cnt=[5,4,3,2,1][row];return circle(cx+(i-inRow-(cnt-1)/2)*s*2,cy+row*s*1.7,s,col,{stroke:'#000','stroke-opacity':.2})})
 const tub=(x,y,w,h)=>rect(x,y,w,h,'url(#glass)',18,{stroke:steel,'stroke-width':2})+repeat(16,i=>ellipse(x+30+p.n('lx'+i,0,w-60),y+30+p.n('ly'+i,0,h-60),26,15,i%3?'#4f7d3e':'#6a9a4c',{transform:`rotate(${p.n('lr'+i,0,180)} ${x+w/2} ${y+h/2})`}))+rect(x-8,y-14,w+16,24,'#e3eced',10,{opacity:.85,stroke:steel,'stroke-width':2})+rect(x+w*.3,y+h*.55,w*.4,h*.2,p.accent,4,{opacity:.9})
 const r=p.n('fruit-r',44,54),pile=repeat(7,i=>{const pos=[[230,380],[320,392],[410,380],[270,318],[366,318],[318,256],[200,316]][i];return fruit(pos[0]+p.n('fx'+i,-8,8),pos[1],r*(i===6?.9:1),i)})
 if(v===1){if(banana)return banan(150,360,-18,p.n('banana-big',330,360))
  if(grape)return grapes(320,190,22)
  if(leafy)return path('M320 440C210 380 170 210 320 120C470 210 430 380 320 440Z','#5d8f47',dark,2)+path('M320 430V140','none','#cfe0a8',5)+repeat(5,i=>path(`M320 ${380-i*50}q${i%2?60:-60}-30 ${i%2?90:-90}-70`,'none','#cfe0a8',3))
  if(avocado)return repeat(2,i=>group(ellipse(0,0,86,112,col)+ellipse(0,0,72,98,'#d6e39a')+(i?ellipse(0,18,40,46,'#c9b37a'):circle(0,18,38,'#7a5432')),`translate(${220+i*200} 300) rotate(${i?14:-14})`))
  return fruit(320,300,p.n('single-r',118,134),9)}
 if(v===2)return rect(140,330,360,118,'#b99a73',8,{stroke:dark,'stroke-width':2})+repeat(3,i=>line(146,356+i*30,494,356+i*30,'#8a6d4c',4))+(banana?group(bunch(4),'translate(40,-60)'):grape?grapes(260,230,18)+grapes(380,236,17):leafy?tub(190,190,260,150):repeat(6,i=>fruit(190+i%3*130+(i>2?60:0),300-(i>2?60:0),r*.95,i)))
 if(banana)return bunch(Math.round(p.n('banana-count',4,6.4)))
 if(grape)return grapes(320,180,24)
 if(leafy)return tub(170,220,300,200)
 if(bagged)return pile+path('M160 200Q320 176 480 200L496 446Q320 474 144 446Z','#fff',steel,2,{opacity:.16})+repeat(14,i=>line(150+i*26,206,190+i*26,450,'#fff',1.2,{opacity:.3}))+repeat(14,i=>line(190+i*26,206,150+i*26,450,'#fff',1.2,{opacity:.3}))+path('M290 190q30-30 60 0','none',steel,4)+rect(272,196,96,42,p.accent,6)+rect(286,206,52,8,'#fff',3,{opacity:.85})
 return pile
}
function paperRoll(p,v){
 const k=p.k,towel=/towel|kitchen/.test(k),count=Number(k.match(/(\d+)\s*(?:double|triple|mega|family|giant|big|huge|regular|jumbo|xl|super)?\s*rolls?\b/)?.[1])||(towel?6:12),cols=count<=2?count:count<=4?2:3,layers=towel?1:count>=9?2:1,rw=p.n('roll-width',towel?92:96,towel?104:108),rh=towel?p.n('roll-height',220,246):p.n('roll-height',112,124),packW=cols*rw+24,packH=layers*rh+24,x=320-packW/2,y=452-packH,band=tone(p,p.accent)
 const roll=(rx,ry,h=rh)=>rect(rx,ry+10,rw-6,h-14,'#f7f5ef',10,{stroke:'#d6d2c6','stroke-width':2})+ellipse(rx+(rw-6)/2,ry+12,(rw-6)/2,10,'#fbfaf6',{stroke:'#d6d2c6','stroke-width':1.5})+ellipse(rx+(rw-6)/2,ry+12,(rw-6)*.16,5,'#c9b48e')+repeat(towel?6:3,j=>line(rx+8,ry+30+j*(h-40)/(towel?6:3),rx+rw-14,ry+30+j*(h-40)/(towel?6:3),'#e2ded2',1.5))
 if(v===1){const R=p.n('roll-r',70,84),L=towel?280:190,cx=320-L/2,cy=210;return rect(cx,cy-R,L,R*2,'#f7f5ef')+line(cx,cy-R,cx+L,cy-R,'#d6d2c6',2)+ellipse(cx+L,cy,R*.35,R,'#efece4',{stroke:'#d6d2c6','stroke-width':2})+rect(cx+14,cy+R-6,L-28,180,'#fbfaf6',2,{stroke:'#d6d2c6','stroke-width':2})+line(cx+14,cy+R+86,cx+L-14,cy+R+86,'#bdb7a8',2,{'stroke-dasharray':'6 5'})+repeat(towel?24:12,i=>circle(cx+34+i%(towel?8:4)*((L-68)/(towel?7:3)),cy+R+20+Math.floor(i/(towel?8:4))*22,2.5,'#d9d4c6'))+ellipse(cx,cy,R*.35,R,'#fbfaf6',{stroke:'#d6d2c6','stroke-width':2})+ellipse(cx,cy,R*.12,R*.34,'#c9b48e')}
 if(v===2){const rows=towel?2:Math.max(2,Math.ceil(count/layers/cols)),d=p.n('top-roll',80,92),w=cols*d+28,h=rows*d+28,tx=320-w/2,ty=290-h/2;return rect(tx,ty,w,h,'#ffffff',18,{opacity:.35,stroke:steel,'stroke-width':2})+repeat(cols*rows,i=>circle(tx+14+d/2+i%cols*d,ty+14+d/2+Math.floor(i/cols)*d,d/2-3,'#f7f5ef',{stroke:'#d6d2c6','stroke-width':2})+circle(tx+14+d/2+i%cols*d,ty+14+d/2+Math.floor(i/cols)*d,d*.16,'#c9b48e'))+rect(tx,ty+h*.4,w,h*.18,band,3,{opacity:.85})}
 const bandY=y+packH*(towel?.36:.38),bandH=packH*(towel?.26:.24)
 return repeat(cols*layers,i=>roll(x+12+(i%cols)*rw,y+12+Math.floor(i/cols)*rh))+rect(x,y,packW,packH,'#ffffff',16,{opacity:.26,stroke:steel,'stroke-width':2})+line(x+14,y+22,x+14,y+packH-26,'#fff',6,{opacity:.6})+rect(x,bandY,packW,bandH,band,4,{opacity:.94})+rect(x+packW*.1,bandY+bandH*.22,packW*.38,bandH*.22,'#fff',3,{opacity:.85})+circle(x+packW*.78,bandY+bandH/2,bandH*.26,'#fff',{opacity:.8})+(count>=8?path(`M${320-packW*.18} ${y+4}q${packW*.18}-34 ${packW*.36} 0`,'none','#fff',7,{opacity:.7}):'')
}

// Scene grammar is keyed to both title motifs and genre. The stable world seed
// changes terrain, architecture, characters and prop placement, never just text.
function gameScene(p,v){
 // GTA covers keep their established look (read from the full listing). Other games
 // read motifs from their own name only, so platform words such as "PlayStation"
 // no longer turn every box into a city; without a motif the title's hash picks a world.
 const h=p.h,gta=/grand theft|\bgta\b/.test(`${p.t} ${p.raw.gameTitle||''}`.toLowerCase()),words=gta?p.full:`${p.t} ${p.raw.gameTitle||''} ${p.raw.genre||''}`.toLowerCase().replace(/playstation|xbox|nintendo|switch|\bps[345]\b|\bpc\b|\bseries [xs]\b/g,' '),has=re=>re.test(words)
 let genre=String(p.raw.genre||p.d.specs?.Genre||p.d.category||'').toLowerCase(),night=has(/night|moon|star|neon|midnight|space|comet/),sea=has(/sea|harbor|harbour|ferry|river|tide|coast|lake|island|marin|water/),urban=has(/city|metro|street|skyline|station|neon|grand theft|gta|cyber|auto/),snow=has(/snow|winter|glacier|alpine|ice/),racing=/racing/.test(genre)||has(/rally|circuit|kart|speedway|drift|raceway|racing|gran turismo|forza|need for speed|\bf1\b|motogp|burnout/),sport=/sports/.test(genre)||has(/football|basketball|tennis|baseball|hockey|volleyball|golf|bowling|rugby|athletics|\bfc \d|\bfifa\b|\bnba\b|madden|\bnfl\b|\bnhl\b|\bufc\b|\bwwe\b|\bpga\b|sports resort/),puzzle=/puzzle/.test(genre),music=/rhythm/.test(genre)||has(/orchestra|mixtape|rhythm|synth|concert|music box/),fantasy=/role-playing|strategy/.test(genre)||has(/sword|kingdom|paladin|rune|crown|guild|castle|dragon/),desert=!gta&&has(/desert|sand|dune|egypt|pharaoh|western|cowboy|outlaw/),space=!gta&&has(/space|galax|planet|star wars|starfield|cosmic|astro|orbit|alien/)
 if(!gta&&!(night||sea||urban||snow||racing||sport||puzzle||music||fantasy||desert||space)){const theme=(h>>>3)%8;urban=theme===0;sea=theme===1;snow=theme===2;fantasy=theme===3;night=theme===4||theme===6;desert=theme===5;space=theme===6}
 const sky=night?'#1c2d4d':snow?'#a9c8d6':gta?`hsl(${(h%90)+165} 36% 66%)`:desert?`hsl(${28+h%20} 62% 70%)`:`hsl(${h%360} 36% 66%)`,ground=snow?'#e8edf0':`hsl(${(h>>>9)%95+80} 22% 43%)`,accent=p.accent
 if(space){let sp=rect(0,0,640,520,`hsl(${220+h%60} 45% 12%)`)+repeat(60,i=>circle(p.n(`sx${i}`,5,635),p.n(`sy${i}`,5,515),p.n(`sr${i}`,.8,2.6),paper))+circle(p.n('planet-x'+v,140,480),p.n('planet-y'+v,140,260),p.n('planet-r',70,120),`hsl(${(h>>>6)%360} 45% 55%)`)+ellipse(p.n('planet-x'+v,140,480),p.n('planet-y'+v,140,260),p.n('planet-r',70,120)*1.7,p.n('planet-r',70,120)*.32,'none',{stroke:paper,'stroke-width':6,opacity:.6})+circle(p.n('moon-x'+v,60,580),p.n('moon-y'+v,60,180),p.n('moon-r',16,32),'#d9d4c4')+group(path('M0 0l60 20-60 20 12-20Z',steel,dark,2)+path('M-6 12h-26l8 8-8 8h26Z','#f3b45a'),`translate(${p.n('ship-x'+v,160,420)} ${p.n('ship-y'+v,300,400)}) rotate(${p.n('ship-r'+v,-30,10)})`)+path('M0 470q320-60 640 0V520H0Z',`hsl(${(h>>>6)%360} 25% 30%)`);return sp+figurePerson(p,330+v*40,430,1.2)}
 const peak=Array.from({length:9},(_,i)=>`${i*80},${p.n(`peak-${v}-${i}`,120,278)}`).join(' ')
 let body=rect(0,0,640,520,sky)+circle(p.n('sun-x'+v,410,553),p.n('sun-y'+v,58,129),p.n('sun-size',24,47),night?'#e2dcc7':'#f3d4a5')+poly(`0,311 ${peak} 640,380`,snow?'#c8d9df':'#698994')+path(`M0 344Q${p.n('ridge-x'+v,100,233)} ${p.n('ridge-y'+v,216,270)} 640 321V520H0Z`,ground)
 if(night)body+=repeat(29,i=>circle(p.n(`starx${i}`,13,632),p.n(`stary${i}`,15,223),p.n(`starr${i}`,1,2.5),paper))
 if(sea)body+=path(`M0 ${330+v*17}Q233 ${290+v*12} 640 ${340+v*9}V520H0Z`,'#598a9a')+repeat(15,i=>path(`M${p.n(`wave${i}`,0,553)} ${363+i*10}q${p.n(`wavew${i}`,20,74)}-8 69 0`,'none','#b4d4d7',2))+path('M170 392h218l-39 38H209Z',accent)+path('M249 389v-93h59v93Z',paper)+poly('257,293 257,365 199,365','#dcc7a3')
 if(urban)body+=repeat(12,i=>{const x=i*58-12,y=p.n(`city-${v}-${i}`,120,262),w=p.n(`city-w-${i}`,31,62);return rect(x,y,w,365-y,`hsl(${210+i*3} 20% ${23+i%3*7}%)`)+repeat(12,j=>rect(x+7+j%3*13,y+15+Math.floor(j/3)*19,5,8,night?'#e5ba84':'#a4b9bb'))})+poly('208,520 289,343 337,343 488,520','#47515b')+path('M318 371l22 35m17 27 26 43','none','#e2c993',5)
 if(fantasy)body+=repeat(4,i=>rect(100+i*74,229-i%2*57,63,141+i%2*57,'#b7aca0')+poly(`${94+i*74},${229-i%2*57} ${131+i*74},${167-i%2*57} ${170+i*74},${229-i%2*57}`,accent))+path('M213 365v-68q32-46 61 0v68Z',dark)+path('M482 414l-74-187 13-5 87 181Z',steel)+path('M415 358l71-31','none',accent,13)
 if(desert)body+=path(`M0 360Q${p.n('dune-a'+v,120,260)} ${p.n('dune-b'+v,290,330)} 640 352V520H0Z`,'#d9b47a')+path(`M0 430Q${p.n('dune-c'+v,300,460)} ${p.n('dune-d'+v,360,400)} 640 420V520H0Z`,'#c79a5f')+repeat(3,i=>{const x=p.n(`cactus-${v}-${i}`,40,600),y=p.n(`cactusy-${v}-${i}`,350,420);return path(`M${x} ${y}v-70m0 30h-18v-22m18 34h16v-28`,'none','#5f7d4f',12)})
 if(!urban&&!fantasy&&!desert)body+=repeat(7,i=>{const x=p.n(`treex-${v}-${i}`,9,595),y=p.n(`treey-${v}-${i}`,269,386),r=p.n(`tree-r-${i}`,28,58);return rect(x-5,y,10,r*1.6,'#705b4a')+poly(`${x-r},${y+10} ${x},${y-r*1.8} ${x+r},${y+10}`,'#426e61')+poly(`${x-r*.75},${y-r*.55} ${x},${y-r*2} ${x+r*.75},${y-r*.55}`,'#638672')})
 if(racing)body+=path('M0 501q260-127 452-27l188 46H0Z','#404953')+group(path('M154 367l60-70h122l81 70 68 16v69H145v-67Z',accent,dark,3)+path('M236 313h79l55 50H198Z','#a9cdd5')+circle(218,449,41,dark)+circle(405,449,41,dark)+circle(218,449,23,steel)+circle(405,449,23,steel),`translate(${v===1?-72:v===2?100:0} ${v===2?23:0}) scale(${v===2?.78:1})`)
 else if(sport)body+=ellipse(320,454,164,33,'#c5aa83')+line(144,364,507,364,paper,5)+line(144,319,144,478,paper,5)+line(507,319,507,478,paper,5)+circle(391,328,44,accent)+path('M347 328h88m-45-44v88','none',paper,3)+figurePerson(p,260+v*27,361,1.1)
 else if(puzzle)body+=repeat(9,i=>group(rect(132+i%3*122,174+Math.floor(i/3)*95,83,73,`hsl(${(h+i*53)%360} 43% 64%)`,8,{stroke:paper,'stroke-width':3})+circle(173+i%3*122,211+Math.floor(i/3)*95,18,accent),`rotate(${p.n(`tile-${v}-${i}`,-18,18)} ${173+i%3*122} ${211+Math.floor(i/3)*95})`))
 else if(music)body+=repeat(7,i=>rect(108+i*64,230+p.n(`beat-${v}-${i}`,0,133),39,199-p.n(`beat-${v}-${i}`,0,133),`hsl(${(h+i*43)%360} 38% 65%)`,15))+path('M136 206q172-201 364-17','none',paper,5)+circle(190,199,29,accent)+circle(455,177,34,accent)
 else body+=(!gta&&(h>>>11)%2?figurePerson(p,300+v*40,350,1.6):figurePerson(p,340+v*47,367,.9)+figurePerson(p,247-v*20,404,.65))+(p.has(/lantern|light|beacon/)?rect(373+v*47,299,36,48,'#e9c26e',5)+circle(392+v*47,324,31,'#f3cb74',{opacity:.2}):'')
 return body
}
function figurePerson(p,x,y,s){return group(circle(x,y-38,15,'#c9aa91')+path(`M${x-17} ${y-23}h34l13 66h-57Z`,p.accent)+line(x-10,y+43,x-17,y+93,dark,13)+line(x+12,y+43,x+27,y+93,dark,13)+path(`M${x-16} ${y-8}l-22 42m54-42 22 39`,'none',p.accent,13),`translate(${x*(1-s)},${y*(1-s)}) scale(${s})`)}
function wrapTitle(title,max=23){const words=String(title).split(/\s+/),lines=[];let current='';for(const word of words){if(current&&`${current} ${word}`.length>max){lines.push(current);current=word}else current+=(current?' ':'')+word}if(current)lines.push(current);return lines.slice(0,4)}
// A box shows the game's name, not the listing's extras such as
// "(Code in Box, Delivers 11/12/26)" or " - PlayStation 5".
function coverTitle(title){const name=String(title).replace(/\s*[([][^)\]]*[)\]]/g,'').replace(/\s+[-—–|:]\s*(?:for\s+)?(?:Xbox|PlayStation|PS[45]\b|Nintendo|Switch\b|PC\b).*$/i,'').trim();return name||String(title)}
// Catalog rows often carry platform keys such as "ps5" or "xbox-series-x"; a box prints the real name.
function platformName(value){const key=String(value).trim().toLowerCase().replace(/[\s_]+/g,'-');return {ps5:'PS5',ps4:'PS4','playstation-5':'PlayStation 5','playstation-4':'PlayStation 4',pc:'PC',switch:'Nintendo Switch','switch-2':'Nintendo Switch 2','nintendo-switch':'Nintendo Switch','nintendo-switch-2':'Nintendo Switch 2',xbox:'Xbox','xbox-series-x':'Xbox Series X','xbox-series-x|s':'Xbox Series X|S','xbox-series-xs':'Xbox Series X|S','xbox-one':'Xbox One',xbs:'Xbox Series X|S',switch2:'Nintendo Switch 2',xboxone:'Xbox One',xsxs:'Xbox Series X|S',xsx:'Xbox Series X'}[key]||String(value)}
function game(p,v){const gameTitle=p.raw.gameTitle||coverTitle(p.title),platform=platformName(p.raw.platformLabel||p.d.platform||p.raw.platform||'').slice(0,36),banner=/xbox/i.test(platform)?'#26714e':/switch|nintendo/i.test(platform)?'#b45154':'#3c647e',digital=p.d.format==='digital'||p.d.format==='digital-add-on'||p.raw.accessorySubtype==='digital-add-on',addon=p.d.format==='digital-add-on'||p.raw.accessorySubtype==='digital-add-on'
 if(addon){const coins=p.has(/cash|currency|shark|coin|money/),body=gameScene(p,v);return body+rect(86,141,468,308,dark,18,{opacity:.9})+(coins?repeat(5,i=>ellipse(230+i*41,307-i*19,44,23,'#c7a66a',{stroke:'#f0d8a7','stroke-width':4}))+repeat(3,i=>ellipse(267,346-i*19,44,23,'#c7a66a',{stroke:'#f0d8a7','stroke-width':4})):path('M262 212h118v48h49v113h-49v43H262v-43h-50V260h50Z',p.accent,steel,3))+wrapTitle(gameTitle,29).map((s,i)=>text(s,320,176+i*24,19,paper,{'text-anchor':'middle'})).join('')+text('Digital add-on',320,428,17,paper,{'text-anchor':'middle'})}
 if(digital&&v===1)return gameScene(p,1)+rect(0,421,640,99,dark)+text(gameTitle.slice(0,45),320,464,22,paper,{'text-anchor':'middle'})+text('Digital game',320,497,15,'#c0d2db',{'text-anchor':'middle'})
 if(v===2)return gameScene(p,2)+rect(0,0,640,38,dark)+text(''+gameTitle,22,26,17,paper)
 if(v===1)return rect(147,66,347,467,dark,11)+rect(158,78,324,66,banner,3)+text(gameTitle.slice(0,36),319,106,16,paper,{'text-anchor':'middle','font-weight':700})+group(gameScene(p,1),'translate(162,153) scale(.49)')+group(gameScene(p,2),'translate(171,410) scale(.21)')+group(gameScene(p,0),'translate(330,410) scale(.21)')
 if(v===3&&digital)return group(gameScene(p,0),'translate(38,98) scale(.85)')+group(gameScene(p,2),'translate(332,310) scale(.43)')
 if(v===3)return rect(81,145,292,347,dark,13)+group(gameScene(p,0),'translate(97,161) scale(.41)')+rect(338,145,211,347,p.c,13)+(/switch|nintendo ds/i.test(platform)?rect(394,230,103,135,dark,13)+rect(409,244,72,78,p.accent,4)+repeat(7,i=>rect(409+i*10,336,7,15,steel,0)):circle(443,318,89,'#c8ced0')+circle(443,318,67,p.accent)+circle(443,318,14,dark))+line(342,154,342,481,steel,4)
 return rect(140,55,359,487,dark,10)+rect(151,64,336,52,banner,3)+text(platform,319,97,18,paper,{'text-anchor':'middle','font-weight':700})+group(gameScene(p,0),'translate(151,117) scale(.525)')+rect(151,387,336,143,/grand theft|\bgta\b/i.test(gameTitle)?dark:`hsl(${(p.h>>>7)%360} 30% 19%)`,0)+wrapTitle(gameTitle,25).map((s,i)=>text(s,319,420+i*28,24,paper,{'text-anchor':'middle','font-weight':700})).join('')+text(p.raw.publisher||p.d.brand||'GAME',319,516,11,'#b6c4cc',{'text-anchor':'middle'})
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

const renderers={eyewear,'air-fryer':airFryer,dishwasher,'hair-tool':hairTool,'health-monitor':healthMonitor,'paper-roll':paperRoll,game,console:consoleArt,shoe,apparel,controller,arcade,wheel,headphones,keyboard,mouse,laptop:(p,v)=>display(p,v,true),display,camera,speaker,cable,beauty,palette,lipstick,pencil,brush,bag,textile,curtain,chair,table:tableArt,shelf,bed,lamp,mirror:mirrorArt,basket,pan,plate,bowl,cup,utensil,appliance,'pet-house':petHouse,leash,bicycle,ball,figure,book,toy,fitness,stand,food,vase,jar,object}
for(const family of specialtyFamilies)renderers[family]=(p,v)=>renderSpecialty(family,p,v)
export const supportedProductAssetTypes=Object.freeze(Object.keys(renderers))
function viewNumber(view){if(Number.isInteger(view)&&view>=0&&view<=3)return view;return ({front:0,primary:0,alternate:1,back:1,detail:2,context:2,contents:3,parts:3})[view]??0}
export function describeProductAsset(descriptor,view=0){const p=model(descriptor),kind=classifyProductAsset(descriptor),index=viewNumber(view),digital=descriptor.format==='digital'||descriptor.format==='digital-add-on'||p.raw.accessorySubtype==='digital-add-on',names=kind==='game'?(digital?['Digital cover artwork','Game world','Illustrated game scene','Digital artwork collection']:['Cover artwork','Rear packaging and scenes','Illustrated game world','Case and media']):['Product view','Reverse or interior view','Construction and material detail','Component and alternate views'];return {kind,type:kind,supported:typeof renderers[kind]==='function'&&kind!=='object',view:index,label:names[index],title:p.title,material:p.material,color:p.c,features:[p.shape,p.material,p.raw.type||p.d.type].filter(Boolean)}}
function deeper(c){const s=String(c||''),hex=s.match(/^#([0-9a-f]{6})$/i),hsl=s.match(/^hsl\((\d+(?:\.\d+)?) (\d+(?:\.\d+)?)% (\d+(?:\.\d+)?)%\)$/)
 if(hex)return '#'+[0,2,4].map(i=>Math.round(parseInt(hex[1].slice(i,i+2),16)*.72).toString(16).padStart(2,'0')).join('')
 if(hsl)return `hsl(${hsl[1]} ${hsl[2]}% ${Math.max(12,Number(hsl[3])-16)}%)`
 return null}
export function renderProductAsset(descriptor,view=0){
 const p=model(descriptor),meta=describeProductAsset(descriptor,view),v=meta.view,renderer=renderers[meta.kind]
 if(!renderer)throw new Error(`No product artwork renderer for ${meta.kind}: ${p.title}`)
 // Furniture and soft furnishings without a stated accent use a deeper shade of their
 // own colour for cushions, trims and panels, not a random hue (no green cushions on a grey sofa).
 if(!p.raw.accent&&/^(?:chair|table|bed|shelf|textile|curtain|lamp|mirror|basket)$/.test(meta.kind))p.accent=deeper(p.c)||p.accent
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
 // The picture is named by the listing itself; the view name stays in <desc>.
 const shownTitle=String(descriptor.canonicalTitle||p.title)
 const framed=group(group(artwork,viewTransform),`translate(${320*(1-sx)} ${290*(1-sy)}) scale(${sx} ${sy})`)
 return `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="600" viewBox="0 0 640 600" role="img" aria-label="${esc(shownTitle)}" data-product-form="${esc(meta.kind)}" data-view="${v}"><title>${esc(shownTitle)}</title><desc>${esc(meta.label+'. '+(p.raw.description||''))}</desc>${surfaceDefs(p)}${rect(0,0,640,600,'#f5f4f0')}${ellipse(320,493,214,18,'#b9b7b0',{opacity:.19})}<g data-asset-object="${esc(meta.kind)}" clip-path="url(#canvas)">${framed}</g></svg>`
}
