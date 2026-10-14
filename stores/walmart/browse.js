import { fixtureCatalog } from '../../lib/catalog-policy.js'
import { productImage } from '../../lib/product-assets.js'
import { CATALOG_PLATFORMS, pageWindow } from '../amazon/assortment500.js'
import { esc, money } from '../../lib/html.js'
import { productPhoto } from '../../lib/product-photos.js'
import { shelfImage, SHELF_DEPARTMENTS } from './shelf.js'
import { CATALOG, productPath, refine } from './data.js'
import { DEPARTMENTS, CAMPAIGNS, SELLERS, departmentPath, categorySlug } from './catalog.js'

export const FILTER_KEYS = ['department','category','price','availability','brand','format','platform','rating','fulfillment','seller','deal','dietary','size','sort']
export const filtersFrom = query => Object.fromEntries(FILTER_KEYS.map(k=>[k,typeof query[k]==='string' ? query[k]:'']))
const thumb = p => p.shelf ? shelfImage(p) : p.title ? productImage('walmart',p) : p.photo ? productPhoto(p.photo,p.name) : `<img src="${esc(p.art)}" alt="${esc(p.name)}">`
const queryLink = (route,values) => {const q = new URLSearchParams(Object.entries(values).filter(([,v])=>v!=='' && v!=null));return `${route}${q.size ? `?${esc(q.toString())}`:''}`}
const hero = (base,c) => `<section class="wm-depth-hero" style="background-image:url('/static/art/depth/${c.image}-campaign.png')"><div><p class="wm-eyebrow">Save money. Live better.</p><h1>${esc(c.title)}</h1><p>${esc(c.subtitle)}</p><a class="wm-pill wm-pill-white" href="${base}/shop/${c.slug}">Shop now</a></div></section>`
// walmart.com homepage (captured 2026-10-13): promo mosaic, Walmart+ hero, Flash Deals row, seasonal promo grid.
// Promo cards only link to categories; product tiles come from the active catalog.
function promo(base,{title,sub,cta='Shop now',path,photo,tone,big=false}) {
 return `<a class="wm-promo wm-promo-${tone}${big?' wm-promo-big':''}" href="${base}${path}"><div><h2>${title}</h2>${sub?`<p>${sub}</p>`:''}<span class="${big?'wm-pill wm-pill-white':'wm-text-cta'}">${cta}</span></div>${photo?productPhoto(photo,''):''}</a>`
}
// Reference homepage: walmart.com's promo mosaic and seasonal tiles around product carousels from
// many departments. The GTA VI preorders sit inside the "New releases" video game row only.
const discount = p => p.wasPrice ? (p.wasPrice - p.price) / p.wasPrice : 0
function referenceHome({base,products,tile,head,mosaic,grid}) {
 const shelf = products.filter(p=>p.shelf), dept = k => shelf.filter(p=>p.department===k)
 const popular = list => [...list].sort((a,b)=>b.ratings-a.ratings)
 const row = (title,sub,path,items,id) => `<section class="wm-depth-shelf wm-home-row" data-home-row="${id}"><div class="wm-section-head"><div><h2>${title}</h2>${sub?`<h3>${sub}</h3>`:''}</div><a href="${base}${path}">View all</a></div><div class="wm-grid wm-home-products">${items.slice(0,6).map(p=>tile(base,p,{from:'home'})).join('')}</div></section>`
 // Flash Deals: the deepest current Rollbacks, one per department so the row spans the store.
 const flashPicks=[], seen=new Set()
 for (const p of [...shelf].filter(p=>p.wasPrice).sort((a,b)=>discount(b)-discount(a))) { if(!seen.has(p.department)){seen.add(p.department);flashPicks.push(p)} }
 const flash=`<section class="wm-flash wm-home-row" data-home-row="flash-deals"><div class="wm-section-head"><div><h2>Flash Deals</h2><h3>Up to 65% off</h3></div><a href="${base}/shop/deals/flash-deals">View all</a></div><div class="wm-grid wm-home-products">${flashPicks.slice(0,6).map(p=>tile(base,p,{from:'home'})).join('')}</div></section>`
 const gta=products.filter(p=>p.kind==='game')
 const releases=['EA Sports College Football 27, PlayStation 5','Mario Kart World, Nintendo Switch 2','NBA 2K27, PlayStation 5','Halo: Campaign Evolved, Xbox Series X'].map(t=>shelf.find(p=>p.title===t)).filter(Boolean)
 const gameRow=[releases[0],gta[0],releases[1],releases[2],gta[1],releases[3]].filter(Boolean)
 return `<div class="wm-depth-home wm-real-home">${head}${mosaic}${flash}
 ${row('Stock up on household essentials','Paper towels, laundry &amp; more','/cp/household-essentials/1115193',popular(dept('household')),'household')}
 ${grid}
 ${row('Top deals in tech','TVs, laptops, headphones &amp; more','/cp/electronics/3944',[...dept('electronics')].filter(p=>p.wasPrice).sort((a,b)=>b.ratings-a.ratings),'electronics')}
 ${row('Grocery essentials','Low prices on pantry staples','/cp/food/976759',popular(dept('groceries')),'groceries')}
 ${row('New releases in video games','Just-released games and preorders','/cp/video-games/2636',gameRow,'video-games')}
 ${row('Refresh your space','Furniture, kitchen &amp; appliances','/cp/home/4044',popular(dept('home')).filter((p,i)=>i%2===0),'home')}
 ${row('Top toys for every kid','LEGO, Barbie, Hot Wheels &amp; more','/cp/toys/4171',popular(dept('toys')),'toys')}
 ${row('Pet favorites','Food, litter &amp; treats','/cp/pet-supplies/5440',popular(dept('pets')),'pets')}
 ${row('Beauty best sellers','Skincare, makeup &amp; hair','/cp/beauty/1085666',popular(dept('beauty')),'beauty')}
 ${row('Baby must-haves','Diapers, wipes &amp; feeding','/cp/baby-products/5427',popular(dept('baby')),'baby')}
 <a class="wm-rollback-strip" href="${base}/shop/savings"><span class="wm-rollback-mark" aria-hidden="true">↓</span><div><h2>Rollbacks &amp; more</h2><p>Find a little more value in your everyday.</p></div><span class="wm-pill wm-pill-white">Shop savings</span></a></div>`
}
export function homePage({base,products,tile}) {
 const P=(o)=>promo(base,o)
 const mosaic=`<section class="wm-home-mosaic" aria-label="Featured">
 <div class="wm-mosaic-col">${P({title:'Fashion, home &amp; more',sub:'Fresh styles for every day',path:'/cp/clothing/5438',photo:'hoodie',tone:'peach'})}${P({title:'From classics to top trends',sub:'Toys, games &amp; puzzles',path:'/cp/toys/4171',photo:'building-bricks',tone:'sky'})}</div>
 ${P({title:'Save more. A lot more.',sub:'Skip the trip! Get Free Delivery &amp; returns without leaving home',cta:'Try Walmart+ for $1',path:'/plus',tone:'blue',big:true})}
 <div class="wm-mosaic-col">${P({title:'Premium autumn prep',sub:'Cozy upgrades for the season',path:'/cp/home/4044',photo:'armchair',tone:'sand'})}${P({title:'Stylish kitchen upgrades',sub:'Cookware, appliances &amp; more',path:'/cp/kitchen-dining/623679',photo:'dutch-oven',tone:'mint'})}</div>
 </section>`
 const flashCats=[['Electronics','/cp/electronics/3944','headphones'],['Home','/cp/home/4044','lamp'],['Toys','/cp/toys/4171','teddy'],['Beauty','/cp/beauty/1085666','serum'],['Video Games','/shop/deals/video-games-and-media','controller'],['Patio & Garden','/cp/patio-garden/5428','camping-chair-khaki']]
 const flash=`<section class="wm-flash"><div class="wm-section-head"><div><h2>Flash Deals</h2><h3>Up to 65% off</h3></div><a href="${base}/shop/deals/flash-deals">View all</a></div><nav class="wm-flash-cats" aria-label="Flash Deals by department">${flashCats.map(([n,p,ph])=>`<a href="${base}${p}">${productPhoto(ph,n)}<span class="wm-deal-flag">Deals</span><b>${esc(n)}</b><span class="wm-text-cta">Shop deals</span></a>`).join('')}</nav></section>`
 const grid=`<section class="wm-promo-grid" aria-label="Seasonal picks">${P({title:'Decor, food &amp; more',sub:'Get everything for fall, fast',path:'/cp/party-occasions/2637',photo:'ceramic-lamp',tone:'sand'})}${P({title:'Fall coffee, syrups &amp; more',sub:'Your favorite seasonal sips',path:'/cp/food/976759',photo:'coffee',tone:'peach'})}${P({title:'Seasonal hosting essentials',sub:'Serveware for every gathering',path:'/cp/kitchen-dining/623679',photo:'glassware',tone:'mint'})}${P({title:'Halloween candy under $5',sub:'Treats for trick-or-treaters',path:'/cp/food/976759',photo:'cookies',tone:'sky'})}</section>`
 const gta=products.filter(p=>p.kind==='game')
 const gtaShelf=`<section class="wm-depth-shelf wm-home-gta"><div class="wm-section-head"><h2>Video Games</h2><a href="${base}/search?q=grand+theft+auto+vi">View all</a></div><p class="wm-fine">Preorder Grand Theft Auto VI</p><div class="wm-grid wm-home-products">${gta.map(p=>tile(base,p,{from:'home'})).join('')}</div></section>`
 const head=`<h1 class="sr-only">Walmart | Save Money. Live better.</h1>`
 if (!fixtureCatalog) return referenceHome({base,products,tile,head,mosaic,grid})
 const shelf = (title,path,items) => `<section class="wm-depth-shelf"><div class="wm-section-head"><h2>${title}</h2><a href="${base}${path}">View all</a></div><div class="wm-grid wm-home-products">${items.map(p=>tile(base,p,{from:'home'})).join('')}</div></section>`
 return `<div class="wm-depth-home wm-real-home">${head}${mosaic}${flash}<section><div class="wm-section-head"><h2>Shop by department</h2><a href="${base}/all-departments">See all departments</a></div><nav class="wm-department-shelf" aria-label="Shop by department">${DEPARTMENTS.map(d=>`<a href="${departmentPath(base,d)}">${thumb(d)}<span>${esc(d.name)}</span></a>`).join('')}</nav></section>
 ${shelf('Low prices on your weekly essentials','/cp/food/976759',products.filter(p=>p.department==='groceries').slice(0,6))}
 ${grid}
 <section class="wm-campaign-grid">${CAMPAIGNS.slice(0,4).map(c=>`<a class="wm-campaign-card" href="${base}/shop/${c.slug}" style="background-image:url('/static/art/depth/${c.image}-campaign.png')"><div><h2>${esc(c.title)}</h2><p>${esc(c.subtitle)}</p><span class="wm-pill wm-pill-white">Shop now</span></div></a>`).join('')}</section>
 ${shelf('Rollbacks worth a look','/shop/savings',products.filter(p=>p.wasPrice && p.photo).slice(0,6))}
 ${shelf('Home feels good','/cp/home/4044',products.filter(p=>p.department==='home').slice(0,6))}
 <section class="wm-campaign-grid wm-campaign-pair">${CAMPAIGNS.slice(4).map(c=>`<a class="wm-campaign-card" href="${base}/shop/${c.slug}" style="background-image:url('/static/art/depth/${c.image}-campaign.png')"><div><h2>${esc(c.title)}</h2><p>${esc(c.subtitle)}</p><span class="wm-pill wm-pill-white">Explore</span></div></a>`).join('')}</section>
 ${shelf('Everyday tech, ready to go','/cp/electronics/3944',products.filter(p=>p.department==='electronics').slice(6,12))}
 ${shelf('Playtime picks for the whole family','/cp/toys/4171',products.filter(p=>p.department==='toys').slice(0,6))}
 ${shelf('Coming soon: Grand Theft Auto VI','/search?q=gta+6',gta)}</div>`
}
export function departmentsPage({base,tile}) {
 return `<section class="wm-departments"><h1>All Departments</h1><p>Find the essentials, new favorites and everyday value.</p><div class="wm-department-grid">${DEPARTMENTS.map(d=>`<article><a href="${departmentPath(base,d)}">${thumb(d)}<h2>${esc(d.name)}</h2></a><p>${esc(d.intro)}</p><ul>${[...new Set(CATALOG.filter(p=>p.department===d.key).map(p=>p.category))].map(c=>`<li><a href="${base}/browse/${categorySlug(c)}?department=${d.key}">${esc(c)}</a></li>`).join('')}</ul><a href="${departmentPath(base,d)}">Shop all ${esc(d.name)}</a></article>`).join('')}</div></section>`
}
// Like walmart.com's Brand facet: the most-listed brands first, capped, plus any brand already chosen.
function topBrands(source,chosen) {
 const counts=new Map();for(const p of source)if(p.brand)counts.set(p.brand,(counts.get(p.brand)??0)+1)
 const top=[...counts].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).slice(0,15).map(([b])=>b)
 return chosen&&counts.has(chosen)&&!top.includes(chosen)?[...top,chosen]:top
}
export function listingPage({base,q='',source=CATALOG,filters={},page=1,route=`${base}/search`,title,description='',fixed={},tile,level=1,empty=''}) {
 const products=refine(source,filters), pageSize=12, pages=Math.max(1,Math.ceil(products.length/pageSize)), current=Math.min(pages,Math.max(1,Number.parseInt(page,10)||1))
 const shown=products.slice((current-1)*pageSize,current*pageSize)
 const values={...fixed,...filters,...(route===`${base}/search` ? {q}: {})}
 const distinct = key => [...new Set(source.map(p=>p[key]).filter(Boolean))]
 const gaming=source.some(p=>p.department==='games'), grocery=source.some(p=>p.department==='groceries')
 const options=[
  ['department','Department',(fixtureCatalog?DEPARTMENTS:SHELF_DEPARTMENTS).filter(d=>source.some(p=>p.department===d.key)).map(d=>[d.key,d.name])],
  ['category','Category',distinct('category').map(v=>[v,v])],
  ['price','Price',[['under25','Under $25'],['25to50','$25 to $50'],['50to100','$50 to $100'],['over100','Over $100']]],
  ['brand','Brand',topBrands(source,filters.brand).map(v=>[v,v])],
  ['seller','Retailer',distinct('sellerId').map(v=>[v,SELLERS[v].name])],
  ['availability','Availability',[['instock','In stock'],['preorder','Preorder'],['outofstock','Out of stock']]],
  ['rating','Customer rating',[['4','4 stars & up'],['4.5','4.5 stars & up']]],
  ['fulfillment','How to get it',[['shipping','Shipping'],['pickup','In-store pickup'],['delivery','Same-day delivery']]],
  ['deal','Special offers',[['rollback','Rollback']]],
  ...(gaming ? [['platform','Video Game Platform',CATALOG_PLATFORMS.map(p=>[p.id,p.label])],['format','Video Game Format',[['code-in-box','Code in Box'],['disc','Physical disc'],['cartridge','Game card'],['download','Download code'],['vinyl','Vinyl']]]] : []),
  ...(grocery && source.some(p=>p.specs?.Dietary) ? [['dietary','Dietary needs',[...new Set(source.map(p=>p.specs?.Dietary).filter(Boolean))].map(v=>[v,v])]] : []),
  ...(source.some(p=>p.variants?.some(v=>v.options.Size)) ? [['size','Size',[...new Set(source.flatMap(p=>p.variants?.map(v=>v.options.Size).filter(Boolean) ?? []))].map(v=>[v,v])]] : []),
 ].filter(([name,,opts])=>opts.length && !Object.hasOwn(fixed,name))
 const hidden=(data,omit=[])=>Object.entries(data).filter(([k,v])=>v!==''&&!omit.includes(k)).map(([k,v])=>`<input type="hidden" name="${esc(k)}" value="${esc(v)}">`).join('')
 const field=([name,label,opts])=>`<details ${filters[name] || ['department','category','price'].includes(name) ? 'open':''}><summary>${label}</summary>${[['','All'],...opts].map(([v,l],i)=>`<label for="filter-${name}-${i}"><input id="filter-${name}-${i}" aria-label="${esc(label)}: ${esc(l)}" type="radio" name="${name}" value="${esc(v)}" ${String(filters[name]??'')===v?'checked':''}> ${esc(l)}</label>`).join('')}</details>`
 const suggestions = source.some(p=>p.kind==='game') && /gta|grand theft/i.test(q) ? ['gta 6 ps5','gta 6 xbox','grand theft auto vi'] : ['coffee','wireless headphones','storage','cotton','pet food']
 const titleHtml=title ? esc(title) : `Results for &quot;${esc(q)}&quot;`
 const active=Object.entries(filters).filter(([k,v])=>v&&k!=='sort'&&!Object.hasOwn(fixed,k))
 return `<div class="wm-search-page"><h${level} class="wm-results-head">${titleHtml}<span>(${products.length})</span></h${level}>${description?`<p>${esc(description)}</p>`:''}<p class="wm-fine">Uses item details. Price when purchased online</p>
 <div class="wm-chip-row wm-active-filters">${active.map(([k,v])=>`<a class="wm-chip" href="${queryLink(route,{...values,[k]:''})}" aria-label="Remove ${esc(k)} filter ${esc(v)}">${esc(v)} ×</a>`).join('')}${active.length?`<a href="${queryLink(route,{...fixed,...(route===`${base}/search`?{q}:{})})}">Clear all</a>`:''}</div>
 <div class="wm-chip-row"><p class="wm-fine">${products.length?`${(current-1)*pageSize+1}–${Math.min(current*pageSize,products.length)} of ${products.length} results`:'0 results'}</p><form class="wm-sort" action="${route}" method="get">${hidden(values,['sort','page'])}<label for="wm-sort">Sort by | </label><select id="wm-sort" name="sort">${[['','Best Match'],['price_low','Price: low to high'],['price_high','Price: high to low'],['rating','Customer rating'],['bestseller','Most rated']].map(([v,l])=>`<option value="${v}" ${filters.sort===v?'selected':''}>${l}</option>`).join('')}</select><button class="wm-pill wm-pill-sm">Apply sort</button></form></div>
 <div class="wm-search-body"><aside class="wm-facets" id="wm-refinements" aria-label="Filters"><form action="${route}" method="get">${hidden({...fixed,...(route===`${base}/search`?{q}:{}),sort:filters.sort??''})}${options.map(field).join('')}<button class="wm-pill wm-filter-apply">Apply filters</button><a href="${queryLink(route,{...fixed,...(route===`${base}/search`?{q}:{})})}">Clear all</a></form></aside><div>
 ${shown.length?`<div class="wm-grid">${shown.map(p=>tile(base,p)).join('')}</div>`:empty&&!active.length?empty:`<section class="wm-empty"><h2>There were no search results${q?` for &quot;${esc(q)}&quot;`:''}.</h2><p>Try a broader term or remove a filter.</p><a class="wm-pill" href="${queryLink(route,{...fixed,...(route===`${base}/search`?{q}:{})})}">Clear all filters</a> <a href="${base}/departments">Browse departments</a></section>`}
 <nav class="wm-pager" aria-label="Pagination">${pageWindow(current,pages).map(n=>n===null?'<span aria-hidden="true">…</span>':n===current?`<span aria-current="page">${n}</span>`:`<a href="${queryLink(route,{...values,page:n})}" aria-label="Page ${n}">${n}</a>`).join('')}</nav>
 <div class="wm-related"><b>Related searches</b> ${suggestions.map(s=>`<a class="wm-chip" href="${base}/search?q=${encodeURIComponent(s)}">${esc(s)}</a>`).join('')}</div></div></div></div>`
}
export function departmentPage({base,department,filters,page,tile,crumbs='',shopBy='',heading=department.name,route:fixedRoute,empty=''}) {
 const source=CATALOG.filter(p=>p.department===department.key)
 const categories=[...new Set(source.map(p=>p.category))]
 const route=fixedRoute ?? departmentPath(base,department)
 return `${crumbs}<section class="wm-department-intro"><div><p><a href="${base}/all-departments">All Departments</a></p><h1>${esc(heading)}</h1><p>${esc(department.intro)}</p></div>${department.campaign?`<img src="/static/art/depth/${department.campaign}-campaign.png" alt="${esc(department.name)} inspiration">`:thumb(department)}</section><nav class="wm-category-links">${categories.map(c=>`<a href="${base}/browse/${categorySlug(c)}?department=${department.key}">${thumb(source.find(p=>p.category===c))}<span>${esc(c)}</span></a>`).join('')}</nav>${shopBy}${listingPage({base,source,filters,page,route,title:`Shop all ${heading}`,level:2,empty,tile})}`
}
export function campaignPage({base,campaign,filters,page,tile}) {
 const source=CATALOG.filter(p=>campaign.departments.includes(p.department))
 return hero(base,campaign)+listingPage({base,source,filters,page,route:`${base}/shop/${campaign.slug}`,title:campaign.title,tile})
}
export function sellerPage({base,seller,filters,page,tile}) {
 if (!fixtureCatalog) return `<section class="wm-seller-profile"><h1>${esc(seller.name)}</h1><p>Sold and shipped by Walmart.</p></section>${listingPage({base,source:CATALOG.filter(p=>p.sellerId===seller.id),filters,page,route:`${base}/seller/${seller.id}`,title:`Shop ${seller.name}`,tile})}`
 return `<section class="wm-seller-profile"><p>Marketplace seller</p><h1>${esc(seller.name)}</h1><p><strong>${seller.rating} out of 5</strong> seller rating</p><p>${esc(seller.description)}</p><h2>Shipping & returns</h2><p>Each item shows its shipping estimate. ${esc(seller.returns)}</p><a href="${base}/help">Get help with an order or seller</a></section>${listingPage({base,source:CATALOG.filter(p=>p.sellerId===seller.id),filters,page,route:`${base}/seller/${seller.id}`,title:`Shop ${seller.name}`,tile})}`
}
export function servicePage({base,slug}) {
 const services={
  services:['Services','Choose a service to learn what is available.',['Pharmacy','Auto Care','Photo','Financial services']],
  pharmacy:['Pharmacy','Online prescription transfers and refills are temporarily unavailable. Please call or visit your Walmart pharmacy for prescriptions and clinical advice.',['Browse personal care','Get order help']],
  'auto-care':['Auto Care Center','Online appointments are temporarily unavailable. Please contact your local Auto Care Center, or contact support about an online order.',['Get order help']],
  photo:['Photo Center','Photo uploads and print orders are temporarily unavailable. Please try again later.',['Browse Home','Get order help']],
  financial:['Financial services','Money transfers, credit applications and banking are currently unavailable online. Promotional payment offers do not change the merchandise total.',['Payment help']],
  'store-directory':['Store Directory',fixtureCatalog ? 'Set your ZIP code and choose a preferred store. Items ship to your address; store pickup and delivery reservations are unavailable.' : 'Set your ZIP code and choose a preferred store. Pickup and same-day delivery availability varies by location.',['Find a store','Shipping help','Browse departments']],
  plus:['Walmart+','Explore a 30-day trial for $1 at checkout, then choose monthly ($12.95) or annual ($98), plus applicable tax. Joining is optional. Cancel anytime.',['Manage membership','Membership help','Continue shopping']],
 }
 const entry=Object.hasOwn(services,slug)?services[slug]:null;if(!entry)return null
 const links={'Find a store':'/store-finder','Pharmacy':'/cp/pharmacy/5431','Auto Care':'/services/auto-care','Photo':'/services/photo','Financial services':'/services/financial','Browse personal care':'/cp/beauty/1085666','Get order help':'/help','Browse Home':'/cp/home/4044','Payment help':'/help/article/payments-and-preorders','Shipping help':'/help/article/pickup-and-delivery','Browse departments':'/departments','Manage membership':'/account/plus','Membership help':'/help/article/manage-walmart-plus','Continue shopping':'/'}
 const serviceCards=[
  ['pharmacy','Pharmacy','Health & wellness','Prescription and care service information.','✚','/cp/pharmacy/5431'],
  ['auto-care','Auto Care Center','For the road ahead','Find information about auto service availability.','◎','/services/auto-care'],
  ['photo','Photo Center','Memories that matter','Learn about printing and photo service options.','▧','/services/photo'],
  ['financial','Financial services','Everyday money services','Explore service information and payment help.','$','/services/financial'],
 ]
 const cards=serviceCards.map(([key,name,tag,description,icon,path])=>`<a class="wm-service-card" href="${base}${path}"><span class="wm-service-icon" aria-hidden="true">${icon}</span><small>${tag}</small><h2>${name}</h2><p>${description}</p><span class="wm-text-cta">Learn more</span></a>`).join('')
 if(slug==='services')return `<section class="wm-services-page"><div class="wm-service-hero"><p>Walmart services</p><h1>A little help with your everyday</h1><p>Explore service guides, manage your purchases, and find answers in one place.</p></div><h2>Explore our services</h2><div class="wm-services-grid">${cards}</div><section class="wm-service-support"><div><h2>Here to help with your shopping</h2><p>Find an order, choose your location or get answers to common questions.</p></div><nav><a href="${base}/orders">Purchase history</a><a href="${base}/store-finder">Store finder</a><a href="${base}/help">Visit the help center</a></nav></section></section>`
 if(slug==='plus'){
  const benefits=[['Free Delivery','Free delivery on orders over $35, as fast as today, plus discounted Express Delivery.'],['Free Shipping','Free next-day and two-day shipping from Walmart.com with no order minimum (most Marketplace items excluded).'],['Video Streaming Choice','Choose Paramount+ Essential or Peacock Premium.'],['Gas Savings','10¢ per gallon at participating stations, plus member prices at Sam\'s Club.'],['Free Pharmacy Delivery','Prescriptions delivered as soon as today with no order minimum.'],['Early Access','Early access to online deals, such as Black Friday, for paid members.'],['Scan & Go','Fast in-store checkout using your phone.'],['Free Returns From Home','Pickup of eligible returns from your home at select locations.']]
  const faq=[['How much does Walmart+ cost?','After the trial, Walmart+ is $12.95 a month or $98 a year, plus applicable taxes.'],['How do I start the $1 trial?','In this store, check the Walmart+ box in your cart or on an item page and choose a plan at checkout.'],['Can I cancel?','Yes. Manage or cancel your membership from your account at any time.']]
  return `<section class="wm-services-page wm-plus-page"><div class="wm-service-hero wm-plus-hero"><p>Walmart<span aria-hidden="true">+</span></p><h1>Try 30 days of Walmart+ for just $1</h1><p>The membership that gives you Free Delivery, Paramount+ or Peacock, Gas Savings &amp; more.</p><a class="wm-pill wm-pill-white" href="${base}/account/plus">Manage membership</a></div><section class="wm-plus-half"><h2>Get a Walmart+ membership for 50% off</h2><p>Qualifying government assistance recipients and college students pay $49/year or $6.47/month.</p></section><h2>Explore Walmart+ benefits</h2><div class="wm-membership-grid">${benefits.map(([h,t])=>`<article><h3>${h}</h3><p>${t}</p></article>`).join('')}</div><section class="wm-faq"><h2>Frequently Asked Questions</h2>${faq.map(([q,a])=>`<details><summary><h3>${q}</h3></summary><p>${a}</p></details>`).join('')}</section><section class="wm-service-support"><div><h2>About this membership experience</h2><p>${entry[1]}</p></div><a href="${base}/help/article/manage-walmart-plus">Membership questions</a></section><a class="wm-pill" href="${base}/">Continue shopping</a></section>`
 }
 const selected=serviceCards.find(c=>c[0]===slug)
 return `<section class="wm-services-page"><nav class="wm-crumbs"><a href="${base}/services">Walmart services</a> / ${entry[0]}</nav><div class="wm-service-hero"><p>${selected?.[2]||'Walmart services'}</p><h1>${entry[0]}</h1><p>${entry[1]}</p></div><div class="wm-service-detail"><section><h2>Explore your options</h2><p>Browse the available service information and follow a link below to continue.</p><nav class="wm-service-links">${entry[2].map(s=>`<a class="wm-pill wm-pill-white" href="${base}${links[s]}">${s}</a>`).join('')}</nav></section><aside><h2>Need help with an order?</h2><p>View purchases or find answers about shipping, payments and returns.</p><a href="${base}/orders">View purchase history</a><a href="${base}/help/article/marketplace-and-services">Services help</a></aside></div><h2>More services to explore</h2><div class="wm-services-grid">${cards}</div></section>`
}
