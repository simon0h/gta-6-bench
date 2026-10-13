import { fixtureCatalog } from '../../lib/catalog-policy.js'
import { productImage } from '../../lib/product-assets.js'
import { CATALOG_PLATFORMS, pageWindow } from '../amazon/assortment500.js'
import { esc, money } from '../../lib/html.js'
import { productPhoto } from '../../lib/product-photos.js'
import { PRODUCTS, productPath, refine } from './data.js'
import { DEPARTMENTS, CAMPAIGNS, SELLERS, departmentPath, categorySlug } from './catalog.js'

export const FILTER_KEYS = ['department','category','price','availability','brand','format','platform','rating','fulfillment','seller','deal','dietary','size','sort']
export const filtersFrom = query => Object.fromEntries(FILTER_KEYS.map(k=>[k,typeof query[k]==='string' ? query[k]:'']))
const thumb = p => p.title ? productImage('walmart',p) : p.photo ? productPhoto(p.photo,p.name) : `<img src="${esc(p.art)}" alt="${esc(p.name)}">`
const queryLink = (route,values) => {const q = new URLSearchParams(Object.entries(values).filter(([,v])=>v!=='' && v!=null));return `${route}${q.size ? `?${esc(q.toString())}`:''}`}
const hero = (base,c) => `<section class="wm-depth-hero" style="background-image:url('/static/art/depth/${c.image}-campaign.png')"><div><p class="wm-eyebrow">Save money. Live better.</p><h1>${esc(c.title)}</h1><p>${esc(c.subtitle)}</p><a class="wm-pill wm-pill-white" href="${base}/shop/${c.slug}">Shop now</a></div></section>`
export function homePage({base,products,tile}) {
 if (!fixtureCatalog) return `<section class="wm-depth-home"><h1>Video Games</h1><div class="wm-grid wm-home-products">${products.map(p=>tile(base,p,{from:'home'})).join('')}</div></section>`
 const mosaic = `<section class="wm-discover" aria-label="Fresh finds for every day">
 <a class="wm-discover-card wm-discover-grocery" href="${base}/shop/weekly-essentials"><div><p>Everyday essentials</p><h2>Fresh picks.<br>Low prices.</h2><span class="wm-text-cta">Shop grocery</span></div></a>
 <a class="wm-discover-card wm-discover-main" href="${base}/shop/fall-home"><div><p>Little updates. Big cozy energy.</p><h1>Fall in love<br>with your space</h1><span class="wm-pill wm-pill-white">Shop home</span></div></a>
 <a class="wm-discover-card wm-discover-style" href="${base}/cp/clothing/5438"><div><p>Easy layers for every day</p><h2>Your cozy era</h2><span class="wm-text-cta">Shop clothing</span></div>${productPhoto('hoodie','Fleece hoodie')}${productPhoto('sneakers','Casual sneakers')}</a>
 <a class="wm-discover-card wm-discover-tech" href="${base}/shop/everyday-tech"><div><p>Find your everyday upgrade</p><h2>Tech that fits<br>your day</h2><span class="wm-text-cta">Shop tech</span></div>${productPhoto('headphones','Wireless headphones')}</a>
 <a class="wm-discover-card wm-discover-play" href="${base}/shop/family-fun"><div><p>Make more time for fun</p><h2>Big little adventures</h2><span class="wm-text-cta">Shop toys</span></div></a>
 </section><a class="wm-rollback-strip" href="${base}/shop/savings"><span class="wm-rollback-mark" aria-hidden="true">↓</span><div><h2>Rollbacks &amp; more</h2><p>Find a little more value in your everyday.</p></div><span class="wm-pill wm-pill-white">Shop savings</span></a>`
 const shelf = (title,path,items) => `<section class="wm-depth-shelf"><div class="wm-section-head"><h2>${title}</h2><a href="${base}${path}">View all</a></div><div class="wm-grid wm-home-products">${items.map(p=>tile(base,p,{from:'home'})).join('')}</div></section>`
 return `<div class="wm-depth-home">${mosaic}<section><div class="wm-section-head"><h2>Shop by department</h2><a href="${base}/departments">See all departments</a></div><nav class="wm-department-shelf" aria-label="Shop by department">${DEPARTMENTS.map(d=>`<a href="${departmentPath(base,d)}">${thumb(d)}<span>${esc(d.name)}</span></a>`).join('')}</nav></section>
 ${shelf('Low prices on your weekly essentials','/cp/food/976759',products.filter(p=>p.department==='groceries').slice(0,6))}
 <section class="wm-campaign-grid">${CAMPAIGNS.slice(1,4).map(c=>`<a class="wm-campaign-card" href="${base}/shop/${c.slug}" style="background-image:url('/static/art/depth/${c.image}-campaign.png')"><div><h2>${esc(c.title)}</h2><p>${esc(c.subtitle)}</p><span class="wm-pill wm-pill-white">Shop now</span></div></a>`).join('')}</section>
 ${shelf('Rollbacks worth a look','/shop/savings',products.filter(p=>p.wasPrice && p.photo).slice(0,6))}
 ${shelf('Home feels good','/cp/home/4044',products.filter(p=>p.department==='home').slice(0,6))}
 <section class="wm-campaign-grid wm-campaign-pair">${CAMPAIGNS.slice(4).map(c=>`<a class="wm-campaign-card" href="${base}/shop/${c.slug}" style="background-image:url('/static/art/depth/${c.image}-campaign.png')"><div><h2>${esc(c.title)}</h2><p>${esc(c.subtitle)}</p><span class="wm-pill wm-pill-white">Explore</span></div></a>`).join('')}</section>
 ${shelf('Everyday tech, ready to go','/cp/electronics/3944',products.filter(p=>p.department==='electronics').slice(6,12))}
 ${shelf('Playtime picks for the whole family','/cp/toys/4171',products.filter(p=>p.department==='toys').slice(0,6))}
 <section class="wm-depth-membership"><h2>Walmart+ fits your everyday</h2><p>Explore local membership options, shipping benefits and the trial offered at checkout.</p><a class="wm-pill wm-pill-white" href="${base}/plus">Learn about Walmart+</a></section>
 ${shelf('Coming soon: Grand Theft Auto VI','/search?q=gta+6',products.filter(p=>p.kind==='game'))}</div>`
}
export function departmentsPage({base,tile}) {
 return `<section class="wm-departments"><h1>All Departments</h1><p>Find the essentials, new favorites and everyday value.</p><div class="wm-department-grid">${DEPARTMENTS.map(d=>`<article><a href="${departmentPath(base,d)}">${thumb(d)}<h2>${esc(d.name)}</h2></a><p>${esc(d.intro)}</p><ul>${[...new Set(PRODUCTS.filter(p=>p.department===d.key).map(p=>p.category))].map(c=>`<li><a href="${base}/browse/${categorySlug(c)}?department=${d.key}">${esc(c)}</a></li>`).join('')}</ul><a href="${departmentPath(base,d)}">Shop all ${esc(d.name)}</a></article>`).join('')}</div></section>`
}
export function listingPage({base,q='',source=PRODUCTS,filters={},page=1,route=`${base}/search`,title,description='',fixed={},tile}) {
 const products=refine(source,filters), pageSize=12, pages=Math.max(1,Math.ceil(products.length/pageSize)), current=Math.min(pages,Math.max(1,Number.parseInt(page,10)||1))
 const shown=products.slice((current-1)*pageSize,current*pageSize)
 const values={...fixed,...filters,...(route===`${base}/search` ? {q}: {})}
 const distinct = key => [...new Set(source.map(p=>p[key]).filter(Boolean))]
 const gaming=source.some(p=>p.department==='games'), grocery=source.some(p=>p.department==='groceries')
 const options=[
  ['department','Department',DEPARTMENTS.filter(d=>source.some(p=>p.department===d.key)).map(d=>[d.key,d.name])],
  ['category','Category',distinct('category').map(v=>[v,v])],
  ['price','Price',[['under25','Under $25'],['25to50','$25 to $50'],['50to100','$50 to $100'],['over100','Over $100']]],
  ['brand','Brand',distinct('brand').map(v=>[v,v])],
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
 return `<div class="wm-search-page"><h1 class="wm-results-head">${titleHtml}<span>(${products.length})</span></h1>${description?`<p>${esc(description)}</p>`:''}<p class="wm-fine">Uses item details. Price when purchased online</p>
 <div class="wm-chip-row wm-active-filters">${active.map(([k,v])=>`<a class="wm-chip" href="${queryLink(route,{...values,[k]:''})}" aria-label="Remove ${esc(k)} filter ${esc(v)}">${esc(v)} ×</a>`).join('')}${active.length?`<a href="${queryLink(route,{...fixed,...(route===`${base}/search`?{q}:{})})}">Clear all</a>`:''}</div>
 <div class="wm-chip-row"><p class="wm-fine">${products.length?`${(current-1)*pageSize+1}–${Math.min(current*pageSize,products.length)} of ${products.length} results`:'0 results'}</p><form class="wm-sort" action="${route}" method="get">${hidden(values,['sort','page'])}<label for="wm-sort">Sort by | </label><select id="wm-sort" name="sort">${[['','Best Match'],['price_low','Price: low to high'],['price_high','Price: high to low'],['rating','Customer rating'],['bestseller','Most rated']].map(([v,l])=>`<option value="${v}" ${filters.sort===v?'selected':''}>${l}</option>`).join('')}</select><button class="wm-pill wm-pill-sm">Apply sort</button></form></div>
 <div class="wm-search-body"><aside class="wm-facets" id="wm-refinements" aria-label="Filters"><form action="${route}" method="get">${hidden({...fixed,...(route===`${base}/search`?{q}:{}),sort:filters.sort??''})}${options.map(field).join('')}<button class="wm-pill wm-filter-apply">Apply filters</button><a href="${queryLink(route,{...fixed,...(route===`${base}/search`?{q}:{})})}">Clear all</a></form></aside><div>
 ${shown.length?`<div class="wm-grid">${shown.map(p=>tile(base,p)).join('')}</div>`:`<section class="wm-empty"><h2>There were no search results${q?` for &quot;${esc(q)}&quot;`:''}.</h2><p>Try a broader term or remove a filter. ${fixtureCatalog?'Pickup and same-day delivery are not available for this local assortment.':'Pickup and same-day delivery availability is unverified outside the captured session.'}</p><a class="wm-pill" href="${queryLink(route,{...fixed,...(route===`${base}/search`?{q}:{})})}">Clear all filters</a> <a href="${base}/departments">Browse departments</a></section>`}
 <nav class="wm-pager" aria-label="Pagination">${pageWindow(current,pages).map(n=>n===null?'<span aria-hidden="true">…</span>':n===current?`<span aria-current="page">${n}</span>`:`<a href="${queryLink(route,{...values,page:n})}" aria-label="Page ${n}">${n}</a>`).join('')}</nav>
 <div class="wm-related"><b>Related searches</b> ${suggestions.map(s=>`<a class="wm-chip" href="${base}/search?q=${encodeURIComponent(s)}">${esc(s)}</a>`).join('')}</div></div></div></div>`
}
export function departmentPage({base,department,filters,page,tile}) {
 const source=PRODUCTS.filter(p=>p.department===department.key)
 const categories=[...new Set(source.map(p=>p.category))]
 const route=departmentPath(base,department)
 return `<section class="wm-department-intro"><div><p><a href="${base}/departments">All Departments</a></p><h1>${esc(department.name)}</h1><p>${esc(department.intro)}</p></div>${department.campaign?`<img src="/static/art/depth/${department.campaign}-campaign.png" alt="${esc(department.name)} inspiration">`:thumb(department)}</section><nav class="wm-category-links">${categories.map(c=>`<a href="${base}/browse/${categorySlug(c)}?department=${department.key}">${thumb(source.find(p=>p.category===c))}<span>${esc(c)}</span></a>`).join('')}</nav>${listingPage({base,source,filters,page,route,title:`Shop all ${department.name}`,tile})}`
}
export function campaignPage({base,campaign,filters,page,tile}) {
 const source=PRODUCTS.filter(p=>campaign.departments.includes(p.department))
 return hero(base,campaign)+listingPage({base,source,filters,page,route:`${base}/shop/${campaign.slug}`,title:campaign.title,tile})
}
export function sellerPage({base,seller,filters,page,tile}) {
 if (!fixtureCatalog) return `<section class="wm-seller-profile"><h1>${esc(seller.name)}</h1><p>Sold and shipped by Walmart.</p></section>${listingPage({base,source:PRODUCTS.filter(p=>p.sellerId===seller.id),filters,page,route:`${base}/seller/${seller.id}`,title:`Shop ${seller.name}`,tile})}`
 return `<section class="wm-seller-profile"><p>Marketplace seller</p><h1>${esc(seller.name)}</h1><p><strong>${seller.rating} out of 5</strong> seller rating</p><p>${esc(seller.description)}</p><h2>Shipping & returns</h2><p>Each item shows its shipping estimate. ${esc(seller.returns)}</p><a href="${base}/help">Get help with an order or seller</a></section>${listingPage({base,source:PRODUCTS.filter(p=>p.sellerId===seller.id),filters,page,route:`${base}/seller/${seller.id}`,title:`Shop ${seller.name}`,tile})}`
}
export function servicePage({base,slug}) {
 const services={
  services:['Services','Choose a service to learn what is available.',['Pharmacy','Auto Care','Photo','Financial services']],
  pharmacy:['Pharmacy','Prescription transfers, refills and clinical care are not connected here. This information page does not submit a prescription or provide clinical advice.',['Browse personal care','Get order help']],
  'auto-care':['Auto Care Center','Appointments, vehicle records and installation are not connected here. You can browse service information and contact support about local shopping orders.',['Get order help']],
  photo:['Photo Center','Photo uploads, printing and photo order fulfillment are not available in this local store.',['Browse Home','Get order help']],
  financial:['Financial services','Money transfers, credit applications and banking are not available here. Promotional payment offers do not change the merchandise total.',['Payment help']],
  'store-directory':['Store Directory',fixtureCatalog ? 'Choose a browsing ZIP code and a sample preferred store. This assortment supports shipping; store pickup and delivery reservations are unavailable.' : 'Choose a browsing ZIP code and a sample preferred store. Shipping preorder was captured. These sample locations do not establish pickup or same-day delivery availability.',['Find a store','Shipping help','Browse departments']],
  plus:['Walmart+','Explore a 30-day trial for $1 at checkout, then choose monthly ($12.95) or annual ($98), plus applicable tax. Joining is optional. No external benefits or subscription billing are connected.',['Manage membership','Membership help','Continue shopping']],
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
 if(slug==='services')return `<section class="wm-services-page"><div class="wm-service-hero"><p>Walmart services</p><h1>A little help with your everyday</h1><p>Explore service guides, manage your purchases, and find answers in one place.</p></div><h2>Explore our services</h2><div class="wm-services-grid">${cards}</div><section class="wm-service-support"><div><h2>Here to help with your shopping</h2><p>Find an order, choose a browsing location or get answers to common questions.</p></div><nav><a href="${base}/orders">Purchase history</a><a href="${base}/store-finder">Store finder</a><a href="${base}/help">Visit the help center</a></nav></section></section>`
 if(slug==='plus')return `<section class="wm-services-page"><div class="wm-service-hero wm-plus-hero"><p>Walmart<span aria-hidden="true">+</span></p><h1>A little plus for your everyday</h1><p>Explore the optional trial available with your local checkout.</p><a class="wm-pill wm-pill-white" href="${base}/account/plus">Manage membership</a></div><div class="wm-membership-grid"><article><h2>Try 30 days for $1</h2><p>Select the offer at checkout and review the terms before joining.</p></article><article><h2>Choose your plan</h2><p>Monthly $12.95 or annual $98, plus applicable tax, after the displayed trial.</p></article><article><h2>Keep control</h2><p>Review your recorded selection and cancel local renewal from your account.</p></article></div><section class="wm-service-support"><div><h2>About this membership experience</h2><p>${entry[1]}</p></div><a href="${base}/help/article/manage-walmart-plus">Membership questions</a></section><a class="wm-pill" href="${base}/">Continue shopping</a></section>`
 const selected=serviceCards.find(c=>c[0]===slug)
 return `<section class="wm-services-page"><nav class="wm-crumbs"><a href="${base}/services">Walmart services</a> / ${entry[0]}</nav><div class="wm-service-hero"><p>${selected?.[2]||'Walmart services'}</p><h1>${entry[0]}</h1><p>${entry[1]}</p></div><div class="wm-service-detail"><section><h2>Explore your options</h2><p>Browse the available service information and follow a link below to continue.</p><nav class="wm-service-links">${entry[2].map(s=>`<a class="wm-pill wm-pill-white" href="${base}${links[s]}">${s}</a>`).join('')}</nav></section><aside><h2>Need help with an order?</h2><p>View purchases or find answers about shipping, payments and returns.</p><a href="${base}/orders">View purchase history</a><a href="${base}/help/article/marketplace-and-services">Services help</a></aside></div><h2>More services to explore</h2><div class="wm-services-grid">${cards}</div></section>`
}
