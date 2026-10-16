import { fixtureCatalog } from '../../lib/catalog-policy.js'
import { CATALOG_PLATFORMS, pageWindow } from '../amazon/assortment500.js'
import { esc } from '../../lib/html.js'
import { money } from './media.js'
import { productPhoto } from '../../lib/product-photos.js'
import { CATALOG as PRODUCTS, SHELF_ITEMS, ALL_DEPARTMENTS as DEPARTMENTS, departmentOf, productPath, stockLimit, selectedProduct, PREORDER_ARRIVAL } from './data.js'
import { CAMPAIGNS } from './catalog.js'
import { productImage, optionText, targetIcon, productGallery } from './media.js'
export const brandSlug = name => name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/-$/,'')
const url = (path, changes={}) => {
  const u=new URL(path,'http://local'); for(const [k,v] of Object.entries(changes)) v?u.searchParams.set(k,v):u.searchParams.delete(k)
  return u.pathname+u.search
}
const link = (path,changes) => esc(url(path,changes))
const unique = values => [...new Set(values.filter(Boolean))].sort((a,b)=>a.localeCompare(b))
const count = n => `${n} ${n===1?'result':'results'}`
export function catalogTile(base,p,backPath) {
  const path=url(productPath(base,p),{variant:p.variantId||'',...(p.family?{returnTo:backPath}:{})}), available=stockLimit(p)>0, cta=p.preorder?'Preorder':'Add to cart'
  return `<article class="tg-tile" data-tcin="${p.tcin}"><div class="tg-tile-media"><a href="${path}">${productImage(p)}</a><a class="tg-heart" href="${path}#save-to-list" aria-label="View options and save ${esc(p.title)} to your wish list">&#9825;</a></div>
  ${p.deal?'<span class="tg-deal-label">Sale</span>':p.sponsored?'<span class="tg-tile-badge">Sponsored</span>':p.isNew?'<span class="tg-tile-badge">New at Target</span>':''}
  <div class="tg-tile-price">${money(p.price)} ${p.regularPrice?`<del class="tg-fine">${money(p.regularPrice)}</del>`:''}</div>
  ${p.unitAmount?`<span class="tg-fine">${money(p.price/p.unitAmount)} / ${esc(p.unitLabel)}</span>`:""}
  <a class="tg-tile-title" href="${path}">${esc(p.title)}</a><a class="tg-product-brand" href="${base}/b/${brandSlug(p.brand)}">${esc(p.brand)}</a>
  ${p.rating?`<div class="tg-tile-rating"><span class="tg-stars" aria-hidden="true">★★★★★</span> ${esc(p.rating.score)} <span class="tg-fine">(${p.rating.count})</span></div>`:''}
  <div class="tg-tile-ship">${!available?'Out of stock':p.preorder?`Release date ${esc(p.release)}`:esc(p.eta)}</div>
  <a class="tg-tile-free" href="${base}/services/pickup-delivery">${p.family?'Free shipping on $35+ orders':'Ships free - exclusions apply'}</a>
  ${p.variants?`<a class="tg-btn tg-btn-block tg-btn-outline" href="${path}">Choose options</a>`:`<form action="${base}/cart/add" method="post"><input type="hidden" name="tcin" value="${p.tcin}"><input type="hidden" name="back" value="${esc(backPath)}"><button class="tg-btn tg-btn-block" aria-label="${cta} ${esc(p.title)}"${available?'':' disabled'}>${available?cta:'Out of stock'}</button></form>`}</article>`
}
const tiles=(base,products,path)=>`<div class="tg-grid">${products.map(p=>catalogTile(base,p,path)).join('')}</div>`
const hero=(base,{title,tagline,description,image,href,cta='Shop now'})=>`<section class="tg-depth-hero" style="background-image:url('/static/art/depth/${image}.png')"><div><p class="tg-eyebrow">${esc(tagline)}</p><h1>${esc(title)}</h1><p>${esc(description)}</p>${href?`<a class="tg-btn" href="${base}${href}">${esc(cta)}</a>`:''}</div></section>`
const departmentTiles=base=>`<nav class="tg-department-grid" aria-label="Departments">${DEPARTMENTS.map(d=>`<a href="${base}/c/${d.id}">${productPhoto(d.photo,d.name)}<b>${esc(d.name)}</b></a>`).join('')}</nav>`
export function catalogHome({base}) {
  if (!fixtureCatalog) return homeRows(base).more
  const shelf=(title,href,products)=>`<section class="tg-section tg-home-shelf"><div class="tg-section-head"><h2>${esc(title)}</h2><a href="${base}${href}">Shop all</a></div>${tiles(base,products.slice(0,6),base+'/')}</section>`
  return hero(base,{title:'Hello, cozy season.',tagline:'The Fall Home Edit',description:'Fresh textures, warm accents and everyday finds to make your space feel like you.',image:'target-fall-home-campaign',href:'/c/fall-home',cta:'Shop home & kitchen'})+
    `<section class="tg-section"><h2>Shop your favorite departments</h2>${departmentTiles(base)}</section>
    <section class="tg-editorial-grid">${[
      ['groceries-campaign','Everyday essentials, easy prices','Pantry staples and household refills for your weekly list.','everyday-essentials'],
      ['toys-campaign','A little more play','Building, creating and family fun for every day.','toys'],
      ['electronics-campaign','Tune into your day','Helpful tech for your desk, commute and downtime.','electronics']
    ].map(([image,title,copy,id])=>`<a href="${base}/c/${id}" class="tg-editorial"><img src="/static/art/depth/${image}.png" alt=""><div><h2>${title}</h2><p>${copy}</p><b>Shop now →</b></div></a>`).join('')}</section>`+
    shelf('Deals worth a Target run','/c/top-deals',PRODUCTS.filter(p=>p.deal&&stockLimit(p)>0))+
    shelf('New favorites to discover','/c/new-arrivals',PRODUCTS.filter(p=>p.isNew))+
    shelf('Make room for everyday gatherings','/c/kitchen-dining',PRODUCTS.filter(p=>p.department==='kitchen-dining'))+
    shelf('Restock your everyday','/c/everyday-essentials',PRODUCTS.filter(p=>['grocery','household'].includes(p.department)))+
    `<section class="tg-brand-edit"><h2>Only-at-Target favorites</h2><p>Explore the brands that bring more to your everyday.</p><div class="tg-brand-links">${['Threshold','Good & Gather','Goodfellow & Co','up&up','Room Essentials','Boots & Barkley'].map(b=>`<a href="${base}/b/${brandSlug(b)}">${esc(b)}</a>`).join('')}</div></section>`+
    shelf('Next up in gaming','/c/video-games',PRODUCTS.filter(p=>p.kind==='game'))
}
// Reference-mode homepage product carousels. The Halloween and fall-newness rows list the products
// target.com showed in those rows on 2026-10-13; the others mix deals and categories from shelf.js.
const carousel=(base,products,label)=>`<div class="tg-carousel" role="region" tabindex="0" aria-label="${esc(label)}">${tiles(base,products,base+'/')}</div>`
const titled=(re)=>SHELF_ITEMS.filter(p=>re.test(p.title))
export function homeRows(base) {
  const row=(title,href,products,link='Shop all')=>`<section class="tg-section tg-home-shelf tg-home-carousel"><div class="tg-section-head"><h2>${esc(title)}</h2><a href="${base}${href}">${esc(link)}</a></div>${carousel(base,products,title)}</section>`
  const pick=(...lists)=>{const seen=new Set();return lists.flat().filter(p=>p&&!seen.has(p.tcin)&&seen.add(p.tcin))}
  const halloween=[/Monopoly Harry Potter/,/Joyfy/,/Elsa Travel/,/17\.9" Ghost/,/JMM x Monsters/,/Anna Classic/,/Bluey/,/Chihuahua/,/Hocus Pocus/,/Ariel Dress/,/Spiderweb/,/Scoob/,/Light Pumpkin/,/Count Chocula/,/Spider Pumpkin/,/Candelabra/,/Belle Dress/,/Ghost Tombstone/,/Grim Reaper/].map(re=>SHELF_ITEMS.find(p=>re.test(p.title))).filter(Boolean)
  const newness=SHELF_ITEMS.filter(p=>p.isNew&&!['video-games','halloween','entertainment'].includes(p.department)).sort((a,b)=>(a.department==='electronics')-(b.department==='electronics'))
  const deals=pick(...['electronics','kitchen-dining','home-decor','household','beauty','toys','baby','grocery','sports-outdoors','patio-garden'].map(d=>SHELF_ITEMS.filter(p=>p.department===d&&p.deal).slice(0,2))).slice(0,16)
  const essentials=SHELF_ITEMS.filter(p=>['grocery','household'].includes(p.department)&&p.rating.count>2000).slice(0,14)
  const tech=titled(/AirPods Pro 3|Nintendo Switch 2 Console|PlayStation 5 Console \(Slim\)|Apple iPad 11|Beats Studio Pro|Mario Kart World -|Xbox Series X 1TB|Samsung 65|JBL Flip 7|Apple Watch Series 11|Meta Quest|Kindle Paperwhite/)
  return {
    halloween:carousel(base,halloween,'Save on Halloween must-haves'),
    newness:carousel(base,newness,'Next-level fall newness'),
    deals:row('Top deals','/c/top-deals/-/N-4xw74',deals,'Shop all deals'),
    more:row('Trending in tech & gaming','/c/electronics/-/N-5xtg6',tech)+row('Restock your essentials','/c/household-essentials/-/N-5xsz1',essentials),
  }
}
export function categoryIntro({base,department,campaign,weekly=false}) {
  if (weekly) return hero(base,{title:'Weekly Ad',tagline:'This week’s featured offers',description:'Shop this week’s featured deals. Displayed sale prices apply automatically; no coupon clipping needed.',image:'groceries-campaign'})
  if (department) {
    const products=PRODUCTS.filter(p=>p.department===department.id&&!p.addon), types=unique(products.map(p=>p.type))
    return `<section class="tg-department-intro"><h1>${esc(department.name)}</h1><p>${esc(department.tagline)}</p><nav class="tg-type-circles" aria-label="Shop ${esc(department.name)} by type">${types.map(type=>{const p=products.find(p=>p.type===type);return `<a href="${base}/c/${department.id}?type=${encodeURIComponent(type)}#products">${productImage(p)}<b>${esc(type)}</b></a>`}).join('')}</nav><div class="tg-department-feature"><div><p class="tg-eyebrow">Find your everyday favorites</p><h2>Explore ${esc(department.name)}</h2><p>Shop by brand, compare details and find the right fit.</p></div><nav aria-label="Featured brands">${unique(products.map(p=>p.brand)).map(brand=>`<a href="${base}/c/${department.id}?brand=${encodeURIComponent(brand)}#products">${esc(brand)}</a>`).join('')}</nav></div></section>`
  }
  if (campaign) return hero(base,{title:campaign.name,tagline:campaign.tagline,description:campaign.description,image:campaign.image})
  return ''
}
export function categoryDirectory({base}) {return `<section class="tg-section"><h1>Shop all categories</h1><p>Find your favorites, from everyday essentials to something new.</p>${departmentTiles(base)}</section>`}
export function listingPage({base,q='',products,pool=PRODUCTS,filters={},backPath,drawer='',heading='',subheading='',intro='',outro='',crumbs=true,emptyCategory=false,page=1,perPage=12}) {
  const total=products.length, pages=Math.max(1,Math.ceil(total/perPage)); page=Math.min(pages,Math.max(1,page))
  const shown=products.slice((page-1)*perPage,page*perPage), baseUrl=url(backPath,{page:'',added:'',notadded:''})
  const fields=[
    ['category','Department',DEPARTMENTS.filter(d=>pool.some(p=>p.department===d.id)).map(d=>[d.id,d.name])],
    ['type','Type',unique(pool.map(p=>p.type)).map(v=>[v,v])],
    ['brand','Brand',unique(pool.map(p=>p.brand)).map(v=>[v,v])],
    ['price','Price',[['under25','Under $25'],['25to50','$25 to under $50'],['50to100','$50 to under $100'],['over100','$100 and up']]],
    ['rating','Guest rating',[['4','4 stars and up'],['4.5','4.5 stars and up']]],
    ['availability','Availability',[['instock','In stock'],['preorder','Preorder'],['outofstock','Out of stock']]],
    ['fulfillment','Pickup & delivery',[['shipping','Shipping'],['pickup','Pickup'],['delivery','Same Day Delivery']]],
    ['material','Material / form',unique(pool.map(p=>p.material)).map(v=>[v,v])],
    ['size','Size / capacity',unique(pool.flatMap(p=>(p.variants||[]).flatMap(v=>Object.values(v.options)))).map(v=>[v,v])],
    ['platform','Compatibility',pool.some(p=>p.department==='video-games')?CATALOG_PLATFORMS.map(p=>[p.id,p.label]):[]],
    ['format','Format',pool.some(p=>p.type==='Video Games')?[['code-in-box','Code in box'],['disc','Disc'],['cartridge','Game card'],['download','Download code']]:[]],
    ['sort','Sort',[['price_low','Price: low to high'],['price_high','Price: high to low'],['rating','Guest rating'],['name','Name: A to Z']]],
  ].filter(([name,label,values])=>values.length)
  const active=Object.entries(filters).filter(([,v])=>v), pathname=new URL(backPath,'http://local').pathname
  const clear=url(baseUrl,Object.fromEntries(Object.keys(filters).map(k=>[k,''])))
  const suggestions=DEPARTMENTS.filter(d=>pool.some(p=>p.department===d.id)).slice(0,6)
  return `${drawer}${intro}<div class="tg-search-page" id="products">${crumbs?`<nav class="tg-crumbs"><a href="${base}/">Target</a> › <a href="${base}/c">Categories</a>${heading?' › '+esc(heading):''}</nav>`:''}<${intro?'h2':'h1'}>${esc(intro?subheading||'Shop '+heading:heading||q.toLowerCase()||'Shop all products')}</${intro?'h2':'h1'}>
    ${suggestions.length>1?`<nav class="tg-suggestion-links" aria-label="Related categories">${suggestions.map(d=>`<a href="${link(baseUrl,{category:d.id,page:''})}">${esc(d.name)}</a>`).join('')}</nav>`:''}
    ${heading&&pool.length?`<nav class="tg-suggestion-links" aria-label="Shop by type">${unique(pool.map(p=>p.type)).map(type=>`<a href="${link(baseUrl,{type,page:''})}">${esc(type)}</a>`).join('')}</nav>`:''}
    <details class="tg-filter-drawer"><summary class="tg-chip tg-chip-strong">Filter &amp; Sort${active.length?` (${active.length} applied)`:''}</summary><form action="${pathname}" method="get">${pathname.endsWith('/s')?`<input type="hidden" name="searchTerm" value="${esc(q)}">`:''}<div class="tg-filter-fields">${fields.map(([name,label,values])=>`<label>${label}<select name="${name}" aria-label="${label}"><option value="">${name==='sort'?'Relevance':'All'}</option>${values.map(([value,text])=>`<option value="${esc(value)}" ${filters[name]===value?'selected':''}>${esc(text)}</option>`).join('')}</select></label>`).join('')}</div><button class="tg-btn">Show results</button><a href="${esc(clear)}">Clear all</a></form></details>
    ${active.length?`<nav class="tg-active-filters" aria-label="Active filters">${active.map(([key,value])=>`<a class="tg-chip" href="${link(baseUrl,{[key]:'',page:''})}" aria-label="Remove ${esc(key)} filter">${esc(fields.find(([name])=>name===key)?.[1]||key)}: ${esc(fields.find(([name])=>name===key)?.[2].find(([id])=>id===value)?.[1]||value)} ×</a>`).join('')}</nav>`:''}
    <p class="tg-count">${total?`${count(total)}${q?` for &ldquo;${esc(q)}&rdquo;`:''} · Showing ${(page-1)*perPage+1}–${Math.min(page*perPage,total)}`:emptyCategory&&!active.length?'0 results':'We couldn&rsquo;t find a match for your search.'}</p>
    ${total?tiles(base,shown,url(baseUrl,{page:page>1?String(page):''})):emptyCategory&&!active.length?`<div class="tg-empty tg-empty-cat"><h2>No items to show here yet</h2><p>We don’t have items to show in this category right now. Check back soon, or try another category or search for a product.</p><a class="tg-btn" href="${base}/c/shop-all-categories/-/N-5xsxf">Shop all categories</a></div>`:`<div class="tg-empty"><h2>Let’s try something else</h2><p>Remove a filter or search for a product, brand or department.</p><a class="tg-btn" href="${esc(clear)}">Clear all filters</a> <a href="${base}/c">Browse every department</a><h3>Popular searches</h3><div class="tg-suggestion-links">${['coffee','headphones','paper towels','pet bed','GTA 6'].map(term=>`<a href="${base}/s?searchTerm=${encodeURIComponent(term)}">${term}</a>`).join('')}</div></div>`}
    ${total?`<nav class="tg-paging" aria-label="Results pages">${page>1?`<a href="${link(baseUrl,{page:String(page-1)})}">Previous</a>`:''} ${pageWindow(page,pages).map(n=>n===null?'<span aria-hidden="true">…</span>':`<a class="tg-chip" ${page===n?'aria-current="page"':''} href="${link(baseUrl,{page:n>1?String(n):''})}">${n}</a>`).join(' ')} ${page<pages?`<a href="${link(baseUrl,{page:String(page+1)})}">Next</a>`:''}<span>page ${page} of ${pages}</span></nav>`:''}</div>${outro}`
}

export function ordinaryProductPage({base,p,recs,user,drawer,listMsg,shipZip='95065',fulfillment='shipping',browseBack=''}) {
  const path=productPath(base,p), selected=selectedProduct(p,p.variantId||p.variants?.[0]?.id||''), available=stockLimit(selected)>0
  p=selected||p
  const variant=p.variantId?`<input type="hidden" name="variant" value="${p.variantId}">`:''
  const back=url(path,{variant:p.variantId||'',returnTo:browseBack})
  const canBuy=available&&fulfillment==='shipping'
  const login=`${base}/login?redirect=${encodeURIComponent(back)}`
  return `${drawer||''}${browseBack?`<p><a href="${esc(browseBack)}">← Back to results</a></p>`:''}<nav class="tg-crumbs">${(()=>{const d=departmentOf(p.department),href=base+(d.path||'/c/'+p.department);return `<a href="${base}/">Target</a> › <a href="${href}">${esc(d.name)}</a> › <a href="${esc(href+'?type='+encodeURIComponent(p.type))}">${esc(p.type)}</a>`})()}</nav>
    ${listMsg?`<p class="tg-toast">${esc(listMsg)}</p>`:''}<div class="tg-pdp">${productGallery(p)}
    <div class="tg-buybox" id="info-and-fulfillment"><a href="${base}/b/${brandSlug(p.brand)}">Shop all ${esc(p.brand)}</a><h1>${esc(p.title)}</h1><a href="#reviews" class="tg-rating-row"><span class="tg-stars" aria-hidden="true">★★★★★</span> ${esc(p.rating.text)} (${p.rating.count})</a>
    <div class="tg-price-module"><b class="tg-price">${money(p.price)}</b>${p.regularPrice?` <span class="tg-deal-label">Sale</span> <del>${money(p.regularPrice)}</del>`:''}</div>${p.unitAmount?`<p class="tg-fine">${money(p.price/p.unitAmount)} / ${esc(p.unitLabel)}</p>`:""}<p class="tg-fine">Sold and shipped by ${esc(p.seller)}</p>
    ${p.variants?`<form method="get" action="${path}" class="tg-options">${browseBack?`<input type="hidden" name="returnTo" value="${esc(browseBack)}">`:""}<label for="variant">${esc(p.optionLabel)}</label><select id="variant" name="variant" onchange="this.form.submit()">${p.variants.map(v=>`<option value="${v.id}"${p.variantId===v.id?' selected':''}>${esc(Object.values(v.options).join(' / '))} — ${money(v.price)}${v.stock?'':' — Out of stock'}</option>`).join('')}</select><button class="tg-btn tg-btn-outline tg-option-update" type="submit">Update selection</button></form><p data-selected-options>${esc(optionText(p))}</p>`:''}
    ${p.department==='clothing'?'<details class="tg-acc"><summary>Size &amp; fit guide</summary><p>Choose your usual US size. Apparel S, M, L and XL correspond to approximate chest measurements of 34–36, 38–40, 42–44 and 46–48 inches. Jeans list waist × inseam in inches; shoe sizes use US sizing.</p></details>':''}
    <div class="tg-fulfillment"><div class="tg-tabs" aria-label="Fulfillment">${[['pickup','Pickup'],['delivery','Delivery'],['shipping','Shipping']].map(([id,title])=>`<a class="tg-tab ${fulfillment===id?'is-selected':''}" href="${link(back,{fulfillment:id})}#info-and-fulfillment">${targetIcon(id==='pickup'?'store':id==='delivery'?'delivery':'shipping')}<b>${title}</b><span>${id==='shipping'?(available?'Available':'Out of stock'):'Not available'}</span></a>`).join('')}</div><div class="tg-cell">${fulfillment==='shipping'?`<div class="tg-cell-head"><h3>Ship to ${esc(shipZip)}</h3><a href="${base}/location?returnTo=${encodeURIComponent(back)}">Edit ZIP code</a></div><p class="${available?'tg-green':'tg-orange'}">${available?esc(p.eta):'Out of stock'}</p><p class="tg-fine">${available?`${p.stock} available · Limit ${stockLimit(p)} per order`:'Choose another option or browse similar items.'}</p><p>Free shipping on orders $35 and up.</p>`:`<h3>${fulfillment==='pickup'?'Order Pickup':'Same Day Delivery'}</h3><p>This item is offered for standard shipping only. Choose Shipping to continue.</p><a href="${link(back,{fulfillment:'shipping'})}#info-and-fulfillment">Check shipping</a>`}</div></div>
    <form action="${base}/cart/add" method="post" class="tg-atc"><input type="hidden" name="tcin" value="${p.tcin}">${variant}<input type="hidden" name="back" value="${esc(back)}"><input type="hidden" name="fulfillment" value="shipping"><div class="tg-atc-row"><label class="tg-qty" for="qty">Qty</label><select name="qty" id="qty">${Array.from({length:Math.max(1,stockLimit(p))},(_,i)=>`<option>${i+1}</option>`).join('')}</select><button class="tg-btn tg-btn-block" data-test="addToCartButton"${canBuy?'':' disabled'}>${available?'Add to cart':'Out of stock'}</button></div></form>
    ${user?`<form action="${base}/buy-now" method="post"><input type="hidden" name="tcin" value="${p.tcin}">${variant}<button class="tg-btn tg-btn-outline tg-btn-block"${canBuy?'':' disabled'}>Buy now</button></form>`:`<a class="tg-btn tg-btn-outline tg-btn-block" href="${login}">Sign in to buy now</a>`}
    <div class="tg-registry" id="save-to-list"><span>Save your favorites</span>${user?`<form action="${base}/list/add" method="post"><input type="hidden" name="tcin" value="${p.tcin}">${variant}<button class="tg-btn tg-btn-outline">Add to list</button></form>`:`<a href="${login}">Sign in to add to list</a>`}</div></div></div>
    <section class="tg-about"><h2>About this item</h2><details class="tg-acc" open><summary>Highlights &amp; description</summary><ul>${p.highlights.map(h=>`<li>${esc(h)}</li>`).join('')}</ul><p>${esc(p.description)}</p></details><details class="tg-acc" open><summary>Specifications</summary><table class="tg-specs">${[...p.specs,...Object.entries(p.selectedOptions||{}),['TCIN',p.tcin]].map(([k,v])=>`<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`).join('')}</table></details><details class="tg-acc"><summary>Shipping &amp; returns</summary><p>${esc(p.shippingNote)}</p><p>${esc(p.returns)}</p><a href="${base}/help">Target Help</a></details></section><section class="tg-section" id="reviews"><h2>Guest ratings &amp; reviews</h2><p>${esc(p.rating.text)} from ${p.rating.count} ratings.</p></section><section class="tg-section"><h2>More for your everyday</h2>${tiles(base,recs,back)}</section>`
}
