import { fixtureCatalog } from '../../lib/catalog-policy.js'
import { CATALOG_PLATFORMS, pageWindow } from './assortment500.js'
import { productArt } from './art.js'
import { esc, money } from '../../lib/html.js'
import { PRODUCTS, productPath, search, SORTS, DEPARTMENTS } from './data.js'
import { NODES, nodeById, nodePath, ancestorNodes, FILTER_KEYS, values, queryString } from './catalog.js'

export function productRow(base,title,products,href='',label='See more') {
  return `<section class="az-merch-row"><div class="az-section-heading"><h2>${esc(title)}</h2>${href?`<a href="${esc(href)}">${esc(label)}</a>`:''}</div><div class="az-product-strip">${products.map(p=>`<article><a href="${productPath(base,p)}">${productArt(p)}<span>${esc(p.title)}</span></a><b>${money(p.price)}</b>${p.deal?'<span class="az-deal-tag">Limited time deal</span>':''}<span class="az-fine">${esc(p.platformLabel || p.brand)}</span></article>`).join('')}</div></section>`
}
const inNode=id=>PRODUCTS.filter(p=>p.nodes.includes(id)&&p.stock>0)
const featuredFor=id=>inNode(id).find(p=>p.asin.startsWith('A0')) || inNode(id)[0] || PRODUCTS.find(p=>p.nodes.includes(id))
const categoryTile=(base,id)=>{const n=nodeById(id),p=featuredFor(id);if(!n || !p) return '';return `<a class="az-category-tile" href="${nodePath(base,id)}">${productArt(p)}<span>${esc(n.title)}</span></a>`}
export function browseHome({base}) {
 if (!fixtureCatalog) return `<div class="az-home">${productRow(base,'Video Games',PRODUCTS,base+'/s?k=grand+theft+auto+vi','Shop all')}</div>`
 const campaigns=[
  {tag:'MAKE TIME FOR PLAY',title:'Big ideas.<br>Little discoveries.',copy:'Build a new favorite family tradition with toys, games, and creative play.',node:'toys-and-games',label:'Shop Toys & Games',art:'toys',alt:'Colorful building blocks, a teddy bear, and creative play essentials'},
  {tag:'YOUR EVERYDAY, UPGRADED',title:'Make yourself<br>at home.',copy:'Practical kitchen finds and thoughtful touches for the spaces you love.',node:'home',label:'Shop Home & Kitchen',art:'home',alt:'Warmly styled living space with a chair, lighting, and storage'},
  {tag:'READY FOR YOUR NEXT LEVEL',title:'Find your<br>next adventure.',copy:'Explore games and accessories for every way you play.',node:'videogames',label:'Shop Video Games',art:'gaming',alt:'Gaming controllers and a headset in a colorful studio arrangement'},
 ]
 const boxes=[['Refresh your home',['kitchen','bedding','organization','home']],['Level up your play',['ps5','xbox','switch','gaming-accessories']],['Tech for your everyday',['audio','computers','smart-home','electronics']],['Find your next favorite',['fiction','cookbooks','creative-books','stripbooks']]]
 return `<div class="az-home az-retail-home"><section class="az-campaigns" aria-label="Featured collections" aria-roledescription="carousel">${campaigns.map((c,i)=>`<section class="az-retail-hero az-campaign-${c.art}" data-campaign ${i?'hidden':''} aria-label="${i+1} of ${campaigns.length}: ${esc(c.label)}"><div><p>${c.tag}</p><${i?'h2':'h1'}>${c.title}</${i?'h2':'h1'}><p>${c.copy}</p><a class="az-btn" href="${nodePath(base,c.node)}">${esc(c.label)}</a></div><img src="/static/art/depth/${c.art}-campaign.png" alt="${c.alt}"></section>`).join('')}<div class="az-campaign-controls" hidden><button type="button" data-campaign-prev aria-label="Previous featured collection">‹</button><span data-campaign-count aria-live="polite">1 / 3</span><button type="button" data-campaign-next aria-label="Next featured collection">›</button></div></section>
 <div class="az-home-mosaic">${boxes.map(([title,ids])=>`<section class="az-shopping-box"><h2>${title}</h2><div class="az-category-grid">${ids.map(id=>categoryTile(base,id)).join('')}</div><a href="${nodePath(base,nodeById(ids[0]).parent || ids[0])}">Explore more</a></section>`).join('')}</div>
 ${productRow(base,'Deals worth a look',PRODUCTS.filter(p=>p.deal&&p.stock>0).slice(0,8),`${base}/gp/goldbox`,'Shop all deals')}
 <div class="az-wide-features"><a href="${nodePath(base,'home')}" class="az-lifestyle"><img src="/static/art/retail/williams-sonoma.png" alt="A warmly styled kitchen"><div><h2>Make more of mealtime</h2><span>Shop Home &amp; Kitchen</span></div></a><section class="az-shopping-box"><h2>Fun for the whole family</h2><div class="az-category-grid">${['building','family-games','outdoor-toys','toys-and-games'].map(id=>categoryTile(base,id)).join('')}</div></section><section class="az-shopping-box"><h2>Take a little time for you</h2><div class="az-category-grid">${['vinyl','soundtracks','bags','accessories'].map(id=>categoryTile(base,id)).join('')}</div></section></div>
 ${productRow(base,'Best sellers in Books',search('','stripbooks','exact-aware-popularity-rank').slice(0,6),`${base}/gp/bestsellers/stripbooks`)}
 ${productRow(base,'Discover Video Games',inNode('videogames').filter(p=>p.kind==='game'||p.rank>=70).slice(0,8),nodePath(base,'videogames'))}
 ${productRow(base,'Small finds under $25',PRODUCTS.filter(p=>p.price<25&&p.stock>0&&p.department!=='videogames'&&p.asin.startsWith('A0')).slice(0,8),`${base}/s?price=under25`)}
 <section class="az-discover"><h2>More departments to explore</h2><div>${DEPARTMENTS.filter(([id])=>id).map(([id,label])=>`<a href="${nodePath(base,id)}">${esc(label)} &rsaquo;</a>`).join('')}</div></section></div>`
}

export function categoryIntro({base,node}) {
 if (!node || !PRODUCTS.some(p=>p.nodes.includes(node.id))) return ''
 const featured=featuredFor(node.id)
 const children=NODES.filter(n=>n.parent===node.id)
 const peers=children.length?children:NODES.filter(n=>n.parent===node.parent&&n.id!==node.id)
 const campaign={home:'home',electronics:'electronics',videogames:'gaming','toys-and-games':'toys'}[ancestorNodes(node.id)[0]?.id]
 return `<div class="az-department"><nav class="az-crumbs" aria-label="Breadcrumb"><a href="${base}/">Amazon home</a> &rsaquo; ${ancestorNodes(node.id).map(n=>`<a href="${nodePath(base,n.id)}">${esc(n.title)}</a>`).join(' &rsaquo; ')}</nav><header class="az-department-hero${campaign?' az-department-campaign':''}">${campaign?`<img class="az-department-campaign-img" src="${node.id === 'kitchen' ? '/static/art/retail/williams-sonoma.png' : `/static/art/depth/${campaign}-campaign.png`}" alt="${esc(node.title)} collection">`:''}<div><p>SHOP THE DEPARTMENT</p><h1>${esc(node.title)}</h1><p>${esc(node.description)}</p></div>${campaign?'':productArt(featured)}</header><div class="az-category-links">${peers.map(n=>categoryTile(base,n.id)).join('')}</div><nav class="az-curated-nav"><a href="${base}/gp/bestsellers/${node.id}">Best Sellers in ${esc(node.title)}</a><a href="${base}/gp/new-releases/${node.id}">New Arrivals</a>${inNode(node.id).some(p=>p.deal)?`<a href="${base}/gp/goldbox?node=${node.id}">Deals</a>`:''}${inNode(node.id).some(p=>p.price<25)?`<a href="${base}/s?node=${node.id}&amp;price=under25">Under $25</a>`:''}</nav></div>`
}
export function browseResults({base,q='',dept='',sort='',filters={},results,inCart={},page=1,node='',endpoint='/s',heading='',tile,gameTile}) {
 const state={k:q,i:dept,node,s:sort,...filters}
 const hidden=obj=>Object.entries(obj).flatMap(([k,v])=>values(v).map(x=>`<input type="hidden" name="${esc(k)}" value="${esc(x)}">`)).join('')
 const href=changes=>`${base}${endpoint}?${queryString(state,changes)}`
 const groups=[];let canonical=null
 for (const p of results) {if(p.kind==='game' && /gta|grand theft/i.test(q)) {if(!canonical) {canonical=[];groups.push(canonical)} canonical.push(p)} else groups.push([p])}
 const total=groups.length,pages=Math.max(1,Math.ceil(total/12)),current=Math.min(pages,Math.max(1,Number.parseInt(page,10)||1)),start=(current-1)*12
 const ret=`${endpoint}?${queryString(state,{page:current>1?current:''})}`
 const pool=search(q,dept,'',{},node)
 const choices=field=>[...new Set(pool.map(p=>p[field]).filter(Boolean))].sort().map(x=>[x,x])
 const checkboxes=(name,label,options)=>options.length?`<fieldset class="az-facet"><legend>${label}</legend>${options.map(([v,l])=>`<label class="az-filter-check"><input type="checkbox" name="${name}" value="${esc(v)}" ${values(filters[name]).includes(v)?'checked':''}> ${esc(l)}</label>`).join('')}</fieldset>`:''
 const select=(name,label,options)=>`<div class="az-facet"><h3><label for="az-${name}">${label}</label></h3><select id="az-${name}" name="${name}"><option value="">All</option>${options.map(([v,l])=>`<option value="${esc(v)}" ${filters[name]===v?'selected':''}>${esc(l)}</option>`).join('')}</select></div>`
 const facetHTML=`<aside class="az-facets" aria-label="Filters"><form method="get" action="${base}${endpoint}">${hidden({k:q,node,s:sort})}<div class="az-facet"><h3><label for="az-department">Department</label></h3><select id="az-department" name="i">${DEPARTMENTS.map(([v,l])=>`<option value="${v}" ${(dept||ancestorNodes(node)[0]?.id||'')===v?'selected':''}>${esc(l)}</option>`).join('')}</select></div>
 ${checkboxes('platform','Video Game Platform',CATALOG_PLATFORMS.map(p=>[p.id,p.label]).filter(([v])=>pool.some(p=>p.platformKey===v)))}
 ${select('price','Price',[['under25','Under $25'],['25to50','$25 to $50'],['50to100','$50 to $100'],['over100','Over $100']])}
 <div class="az-price-range"><label>Min $<input name="min" type="number" min="0" step="0.01" value="${esc(filters.min||'')}"></label><label>Max $<input name="max" type="number" min="0" step="0.01" value="${esc(filters.max||'')}"></label></div>
 ${select('rating','Customer Reviews',[['4','4 Stars & Up'],['4.5','4.5 Stars & Up']])}
 ${select('availability','Availability',[['in-stock','In Stock'],['preorder','Pre-order'],['unavailable','Currently unavailable']])}
 ${select('delivery','Delivery Day',[['tomorrow','Get It by Tomorrow']])}
 ${checkboxes('brand','Brands',choices('brand'))}${checkboxes('type','Product Type',choices('typeLabel'))}${checkboxes('condition','Condition',choices('condition'))}${checkboxes('seller','Seller',choices('seller'))}
 ${pool.some(p=>p.department==='videogames')?checkboxes('format','Format',[['physical','Physical copy'],['code-in-box','Code in Box'],['cartridge','Game card'],['download','Download code']].filter(([v])=>pool.some(p=>p.format===v))):''}
 <button type="submit" class="az-btn az-btn-block">Apply filters</button><a class="az-clear" href="${base}${endpoint}?${queryString({k:q,node})}">Clear all filters</a></form></aside>`
 const chips=FILTER_KEYS.flatMap(key=>values(filters[key]).map(v=>`<a class="az-filter-chip" href="${esc(href({[key]:values(filters[key]).filter(x=>x!==v),page:''}))}" aria-label="Remove ${esc(key)}: ${esc(v)}">${esc(key)}: ${esc(v)} ×</a>`)).join('')
 const related=q?(/gta|grand theft/i.test(q)?['gta 6','grand theft auto vi','Rockstar Games']:pool.length?[...new Set(pool.map(p=>p.brand))].slice(0,4):['headphones','kitchen','books','controller']):[]
 return `<div class="az-search-page"><div class="az-results-head"><h1 class="az-results-count">${total?`${start+1}-${Math.min(start+12,total)}`:'0'} of ${total} ${total===1?'result':'results'}${q?` for <span class="az-q">"${esc(q)}"</span>`:` in ${esc(heading||nodeById(node)?.title||DEPARTMENTS.find(([id])=>id===dept)?.[1]||'All Departments')}`}</h1><form class="az-sort" action="${base}${endpoint}" method="get">${hidden({...filters,k:q,i:dept,node})}<label for="s-result-sort-select">Sort by:</label><select id="s-result-sort-select" name="s" onchange="this.form.submit()">${SORTS.map(([v,l])=>`<option value="${v}" ${sort===v?'selected':''}>${esc(l)}</option>`).join('')}</select><button type="submit" class="az-link-btn az-nojs">Go</button></form></div>
 <div class="az-search-body">${facetHTML}<div class="az-results">${chips?`<nav class="az-active-filters" aria-label="Active filters">${chips}</nav>`:''}<p class="az-results-note">Check each product page for other buying options.</p><h2 class="az-results-label">${esc(heading||'Results')}</h2>
 ${total?groups.slice(start,start+12).map(g=>g[0].kind==='game'?gameTile(base,g,ret,inCart):tile(base,g[0],ret,inCart)).join(''):`<h2 class="az-no-results">No results for <span class="az-q">${esc(q||heading||'these filters')}</span>.</h2><p>Try a broader search, remove a filter above, or <a href="${nodePath(base,nodeById(node)?.id||dept||'electronics')}">browse the department</a>.</p>`}
 <nav class="az-pagination" aria-label="Pagination">${current>1?`<a href="${esc(href({page:current-1}))}">‹ Previous</a>`:'<span class="az-page-disabled">‹ Previous</span>'}${pageWindow(current,pages).map(n=>n===null?'<span aria-hidden="true">…</span>':n===current?`<span class="az-page-current" aria-current="page">${n}</span>`:`<a href="${esc(href({page:n}))}" aria-label="Page ${n}">${n}</a>`).join('')}${current<pages?`<a href="${esc(href({page:current+1}))}">Next ›</a>`:'<span class="az-page-disabled">Next ›</span>'}</nav>
 ${related.length?`<section class="az-related-searches"><h2>Related searches</h2>${related.map(term=>`<a href="${base}/s?${queryString({k:term,i:dept})}">${esc(term)}</a>`).join('')}</section>`:''}</div></div></div>`
}
