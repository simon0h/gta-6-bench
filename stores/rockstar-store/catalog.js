// Deterministic USD catalog; observed families and fulfillment are documented in the depth blueprint.
const sizes = (price) => ['S','M','L','XL','XXL','XXXL'].map((label,i)=>({id:label.toLowerCase(),label,price,stock:i>3?0:8-i}))
const merch = (id,title,price,category,collection,shape,blurb,extra={}) => ({id,title,price,sku:`RS-${id.toUpperCase()}`,kind:'other',section:'Gear',path:`/merchandise/${id}`,sale:'direct',category,collections:[category,collection,'new-arrivals'],shape,blurb,keywords:`${title} ${category} merchandise gear`,...extra})
const game = (id,title,price,collection,genre,storage) => ({id,title,price,sku:`RS-${id.toUpperCase()}`,kind:'other',section:'Games',path:`/game/buy-${id}`,sale:'direct',delivery:'digital',category:'full-game',collections:['games',collection],chips:['PC'],genre,storage,blurb:`Play ${title} on PC with the Rockstar Games Launcher.`,keywords:`${title} PC launcher game ${genre}`})
export const EXTRA_PRODUCTS = [
 game('gta-trilogy','Grand Theft Auto: The Trilogy – The Definitive Edition',59.99,'gta','Action adventure','45 GB'),
 game('la-noire','L.A. Noire',19.99,'rockstar','Detective adventure','16 GB'),
 game('max-payne-3','Max Payne 3',19.99,'rockstar','Action','35 GB'),
 game('gta-iv','Grand Theft Auto IV: Complete Edition',19.99,'gta','Action adventure','22 GB'),
 ...[
 ['san-andreas-tee','Grand Theft Auto: San Andreas Screenshot Tee',39.99,'gta','San Andreas print on a black cotton tee.'],
 ['gta-iii-tee','Grand Theft Auto III Screenshot Tee',39.99,'gta','Liberty City print on a black cotton tee.'],
 ['midnight-club-tee','Midnight Club Los Angeles Screenshot Tee',39.99,'rockstar','Los Angeles racing print on a black cotton tee.'],
 ['manhunt-tee','Manhunt Screenshot Tee',39.99,'rockstar','Screen print on a black cotton tee.'],
 ['rockstar-crewneck','Rockstar Varsity Crewneck',69.99,'rockstar','Black crewneck with a collegiate Rockstar chest design.'],
 ['gta-v-hoodie','Grand Theft Auto V Hoodie',74.99,'gta','Black hooded sweatshirt with a GTA V inspired chest print.'],
 ].map(([id,title,price,col,blurb])=>merch(id,title,price,'apparel',col,id.includes('hoodie')?'hoodie':id.includes('crewneck')?'crewneck':'tee',blurb,{optionLabel:'Size',variants:sizes(price),material:'Cotton blend',care:'Machine wash cold inside out. Dry on low heat.'})),
 merch('new-era-snapback','Rockstar New Era Snapback',34.99,'accessories','rockstar','cap','Black snapback with an adjustable closure.',{material:'Cotton twill',fit:'Adjustable'}),
 merch('reflective-five-panel','Rockstar Reflective 5 Panel Hat',34.99,'accessories','rockstar','cap','A gray five-panel cap with reflective details.',{material:'Synthetic woven fabric',fit:'Adjustable',color:'#777'}),
 merch('logo-baggu','Rockstar Logo Baggu',24.99,'accessories','rockstar','bag','A reusable black shopping bag with logo print.',{material:'Nylon',care:'Machine wash cold; line dry.'}),
 merch('logo-water-bottle','Rockstar Logo Water Bottle',29.99,'accessories','rockstar','bottle','Black reusable bottle with white logo.',{material:'Stainless steel',capacity:'20 fl oz'}),
 merch('varsity-water-bottle','Rockstar Varsity Water Bottle',29.99,'accessories','rockstar','bottle','A yellow reusable bottle with collegiate lettering.',{material:'Stainless steel',capacity:'20 fl oz',color:'#dcb837'}),
 merch('chop-leash-collar','Chop Leash and Collar',39.99,'accessories','gta','leash','Matching green collar and leash inspired by Chop.',{material:'Nylon webbing',optionLabel:'Fit',variants:[{id:'medium',label:'Medium',price:39.99,stock:6},{id:'large',label:'Large',price:39.99,stock:4}]}),
 merch('trilogy-pins','Grand Theft Auto Trilogy Enamel Pins Set 1',19.99,'collectibles','gta','pins','A set of enamel pins inspired by the Grand Theft Auto trilogy.',{material:'Enamel and metal',note:'Collectible accessories. Keep away from young children.'}),
 merch('red-dead-pins','Red Dead Redemption Enamel Pins',19.99,'collectibles','rdr','pins','Red Dead inspired enamel pin set.',{material:'Enamel and metal',color:'#a92729'}),
 merch('logo-keychain','Rockstar Red and Black Logo Keychain',9.99,'collectibles','rockstar','keychain','Red and black logo keychain with a metal split ring.',{material:'Rubber and metal'}),
 merch('red-dead-candle','Red Dead Redemption 2 Glass Candle by Joya',59.99,'collectibles','rdr','candle','Black wax candle in a tall patterned black glass.',{material:'Wax and glass',care:'Never leave a burning candle unattended. Place on a heat-resistant surface.'}),
 merch('vintage-glass-tray','Red Dead Redemption 2 Vintage Glass Decoupage Tray',49.99,'collectibles','rdr','tray','Vintage artwork under handblown glass.',{material:'Handblown glass',dimensions:'4 × 6 inches',care:'Wipe clean with a damp cloth. Do not immerse.'}),
 {id:'shark-cash-cards',title:'Grand Theft Auto Online: Shark Cash Cards',price:9.99,sku:'RS-SHARK-CARDS',kind:'other',section:'Add-Ons',category:'currency',delivery:'digital',path:'/game/shark-cash-cards',sale:'direct',collections:['add-ons','gta','best-sellers'],chips:['PC'],shape:'currency',optionLabel:'Cash value',variants:[{id:'tiger',label:'Tiger Shark · GTA$250,000',price:9.99,stock:99},{id:'bull',label:'Bull Shark · GTA$600,000',price:19.99,stock:99},{id:'great-white',label:'Great White Shark · GTA$1,500,000',price:49.99,stock:99}],blurb:'PC currency for GTA Online. Requires GTA V and a Rockstar Games account.',keywords:'shark cash cards add-ons gta online pc currency'},
 {id:'gold-bars',title:'Red Dead Online: Gold Bars',price:9.99,sku:'RS-GOLD-BARS',kind:'other',section:'Add-Ons',category:'currency',delivery:'digital',path:'/game/gold-bars',sale:'direct',collections:['add-ons','rdr','new-arrivals'],chips:['PC'],shape:'currency',optionLabel:'Gold Bars',variants:[{id:'25',label:'25 Gold Bars',price:9.99,stock:99},{id:'55',label:'55 Gold Bars',price:19.99,stock:99},{id:'150',label:'150 Gold Bars',price:49.99,stock:99}],blurb:'PC currency for Red Dead Online. Requires the base game and a Rockstar Games account.',keywords:'red dead online gold bars add-ons pc currency'},
]
export function enrichCatalog(products) {
 for (const p of products) {
  p.category ||= p.section==='Games'?'full-game':'collectibles'
  p.delivery ||= 'physical'
  p.inventory = Number.isInteger(p.inventory)?p.inventory:12
  p.art ||= `/rockstar-store/art/${p.id}.svg`
  p.stock = p.inventory ? 'In stock' : 'Out of stock'
  p.specs ||= {}
 }
 for (const id of ['gta-v','red-dead-redemption-2','red-dead-redemption','bully-scholarship-edition']) {
  const p=products.find(p=>p.id===id);Object.assign(p,{sale:'direct',delivery:'digital',chips:['PC'],genre:id.includes('red-dead')?'Western action adventure':'Action adventure',storage:({'gta-v':'105 GB','red-dead-redemption-2':'150 GB','red-dead-redemption':'12 GB','bully-scholarship-edition':'4.7 GB'})[id]})
 }
 const tee=products.find(p=>p.id==='vice-city-tee');Object.assign(tee,{category:'apparel',shape:'tee',color:'#f8f7f1',blurb:'White heavyweight cotton tee with a small square pastel sunset and golfer print.',note:'Unisex fit. Game not included.',material:'Heavyweight cotton',care:'Machine wash cold inside out. Do not iron the print.',optionLabel:'Size',variants:sizes(tee.price),art:'/rockstar-store/art/vice-city-tee.svg'})
 const cap=products.find(p=>p.id==='rockstar-cap');Object.assign(cap,{category:'accessories',shape:'cap',color:'#172841',blurb:'Navy stretch-fitted cotton cap with a white Rockstar logo.',note:'Stretch-fitted. Choose S–M or L–XL.',material:'Cotton with stretch',fit:'Stretch-fitted',optionLabel:'Size',variants:[{id:'s-m',label:'S–M',price:cap.price,stock:6},{id:'l-xl',label:'L–XL',price:cap.price,stock:4}],art:'/rockstar-store/art/rockstar-cap.svg'});cap.collections.push('rockstar')
 const collector=products.find(p=>p.id==='gtavi-goodtime-state-vice-city-collection');Object.assign(collector,{freeShipping:false,inventory:3,dimensions:'19 × 13.5 × 12.5 inches',material:'Mixed collectible materials',note:'Grand Theft Auto VI game sold separately. Ages 18+. Excluded from free shipping.',contents:'A collector box inspired by Vice City and Macca the Gator, with eleven included pieces.',care:'Adult collectible, ages 18+. Contains small parts and sharp edges. Fragile; handle with care.',included:['Macca the Gator figurine','Oakley Frogskins sunglasses','Leonida Keys crossbody bag','New Era snapback hat','Macca magnetic mirror','Chunkee shot glass','Vice City swizzle spoon','Vice City keychain','Leonida Keys enamel pins in a tin','Leonida Keys stickers in a stash bag','Two-sided souvenir poster and Leonida map']});collector.collections.push('collectibles')
 const card=products.find(p=>p.id==='buy-loneliest-robot-greeting-card');card.collections.push('collectibles','rockstar');card.material='Printed paper';card.dimensions='Folded greeting card with envelope'
 const photos={'gtavi-goodtime-state-vice-city-collection':'rockstar-collector-box','red-dead-candle':'rockstar-glass-candle','vintage-glass-tray':'rockstar-glass-tray','vice-city-tee':'rockstar-tee-white','rockstar-cap':'rockstar-cap-navy','rockstar-crewneck':'rockstar-crewneck-black','new-era-snapback':'rockstar-snapback-black','logo-keychain':'rockstar-keychain-red','gta-v':'digital-rockstar-gta-v','red-dead-redemption-2':'digital-rockstar-rdr2','red-dead-redemption':'digital-rockstar-rdr','la-noire':'digital-rockstar-la-noire','bully-scholarship-edition':'digital-rockstar-bully','gta-iv':'digital-rockstar-gta-iv'}
 const galleryViews={'gtavi-goodtime-state-vice-city-collection':[['rockstar-collector-box','Closed collector box'],['rockstar-collector-detail','Box emblem and lid detail']],'red-dead-candle':[['rockstar-glass-candle','Complete glass candle'],['rockstar-candle-detail','Wax, wick and patterned glass detail']],'vintage-glass-tray':[['rockstar-glass-tray','Complete glass tray'],['rockstar-tray-detail','Glass edge and artwork detail']]};
 for (const p of products) { p.gallery=galleryViews[p.id]; p.photo=photos[p.id]||null; if (p.variants) p.inventory=p.variants.reduce((n,v)=>n+v.stock,0); p.keywords+=` ${p.category} ${(p.collections||[]).join(' ')}` }
}
