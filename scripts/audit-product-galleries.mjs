import { createApp } from '../app.js'
import { productAssetViewCount } from '../lib/product-assets.js'
import { writeFile, mkdir } from 'node:fs/promises'
import { CATALOG_MODE, fixtureCatalog } from '../lib/catalog-policy.js'

const app = await createApp({ persist: false, captcha: { mode: 'off' } })
const server = app.listen(0, '127.0.0.1')
await new Promise(resolve => server.once('listening', resolve))
const origin = `http://127.0.0.1:${server.address().port}`
const routes = new Map()
const normal = ['amazon','walmart','target','bestbuy','gamestop','game-uk','jb-hifi','playstation-store','xbox-store']
for (const store of normal) routes.set(store, (await import(`../stores/${store}/data.js`)).productPath)
const pathFor = d => {
  if (routes.has(d.store)) return routes.get(d.store)('/'+d.store,d.raw)
  if (d.store === 'rockstar-store') return '/rockstar-store'+d.raw.path
  if (d.store === 'coupang') return '/coupang/vp/products/'+d.id
  if (d.store === 'smyths-toys') return '/smyths-toys/uk/en-gb'+(d.raw.path||'/catalog/'+d.id)
  if (d.store === 'eb-games-au') return '/eb-games-au'+(d.raw.path||'/catalog/'+d.id)
  return '/'+d.store+'/product/'+d.id
}
const stores={}, failures=[], assets=new Map()
async function pool(rows,fn,size=8){let n=0;await Promise.all(Array.from({length:size},async()=>{while(n<rows.length)await fn(rows[n++])}))}
try {
 for(const store of app.locals.stores){
  const products=app.locals.productAssetCatalog.filter(d=>d.store===store.slug)
  const report={products:products.length,galleries:0,referencePresentations:0,threeOrMoreViews:0,images:0}
  await pool(products,async d=>{
   const pathname=pathFor(d),r=await fetch(origin+pathname),html=await r.text()
   // Platform stores use their observed presentation: a single Xbox cover, or the PS/Rockstar screenshot rail.
   const nativeReference = (d.store==='playstation-store'&&d.raw.family==='gta-vi') || (d.store==='xbox-store'&&['9p3h4968grsm','9nnzsnhlr63l','9nl3wwnzlzzn'].includes(d.id)) || (d.store==='rockstar-store'&&d.id==='gta-vi')
   if(nativeReference){
    const urls=[...new Set([...html.matchAll(/src="(\/static\/reference\/[^" ]+)"/g)].map(m=>m[1]))].filter(u=>u.startsWith(`/static/reference/${d.store}/`)&&!/logo|font|mark|icon|esrb|eng_us/i.test(u))
    const expected=d.store==='playstation-store'?'/gta-vi-hero.jpg':d.store==='xbox-store'?(d.id==='9nnzsnhlr63l'?'/gta-vi-ultimate-cover.jpg':'/gta-vi-cover.png'):'/GTAVI_PreOrderWebstore_GamesGrid_FOB_1212x1497_R01.jpg'
    if(r.status!==200||!urls.some(u=>u.endsWith(expected)))failures.push({store:d.store,id:d.id,path:pathname,status:r.status,error:'Missing observed reference media'})
    else report.referencePresentations++
    if(d.store==='playstation-store'&&urls.filter(u=>/gta-vi-screenshot-/.test(u)).length!==10)failures.push({store:d.store,id:d.id,error:'Expected ten observed screenshots'})
    if(d.store==='rockstar-store'&&urls.filter(u=>/\/0[1-8]_-_/.test(u)).length!==8)failures.push({store:d.store,id:d.id,error:'Expected eight observed screenshots'})
    for(const url of urls){assets.set(url,{store:d.store,id:d.id,url});report.images++}
    return
   }
   const gallery=/<section class="pa-gallery\b[^>]*data-product-gallery[\s\S]*?<\/section>/.exec(html)?.[0]
   if(r.status!==200||!gallery){failures.push({store:d.store,id:d.id,path:pathname,status:r.status,error:'Missing product gallery'});return}
   report.galleries++
   const urls=[...gallery.matchAll(/data-pa-src="([^"]+)"/g)].map(m=>m[1].replaceAll('&amp;','&'))
   const expected=productAssetViewCount(d.raw, d.store)
   if(new Set(urls).size!==expected||new Set(urls).size!==urls.length)failures.push({store:d.store,id:d.id,error:'Image count differs from product media evidence',expected,urls})
   else if(urls.length>=3)report.threeOrMoreViews++
   if(!html.includes('/static/product-gallery.js')||!html.includes('/static/product-gallery.css'))failures.push({store:d.store,id:d.id,error:'Missing gallery interaction assets'})
   for(const url of urls){const u=new URL(url,origin),parts=u.pathname.split('/').map(decodeURIComponent);const descriptor=app.locals.productAssetIndex.get(parts[2],parts[3],Object.fromEntries(u.searchParams));if(!descriptor||descriptor.id!==d.id||descriptor.store!==d.store)failures.push({store:d.store,id:d.id,url,error:'Image does not resolve to this product'})
    assets.set(url,{store:d.store,id:d.id,url});report.images++}
  })
  stores[store.slug]=report;console.log(store.slug,JSON.stringify(report))
 }
 await pool([...assets.values()],async asset=>{
  const r=await fetch(origin+asset.url),mime=r.headers.get('content-type')||'',bytes=await r.arrayBuffer()
  if(r.status!==200||!mime.startsWith('image/')||bytes.byteLength===0||(mime.startsWith('image/svg+xml')&&!/<svg\b/.test(new TextDecoder().decode(bytes))))failures.push({...asset,error:'Invalid image response',status:r.status})
 },12)
 const report={catalogMode:CATALOG_MODE,verifiedAt:new Date().toISOString(),method:'Requested every base PDP through createApp. Verified native reference hero and screenshot presentations for official PS, Xbox and Rockstar GTA VI pages; verified product-gallery controls and identity for other products. Fetched every distinct image URL and checked successful nonempty image responses. Includes default selected variants.',stores,products:app.locals.productAssetCatalog.length,checkedImageURLs:assets.size,failures}
 const out=new URL(fixtureCatalog?'../research/product-assets/':'../research/inventory-2026-10-06/',import.meta.url)
 await mkdir(out,{recursive:true})
 await writeFile(new URL('gallery-coverage.json',out),JSON.stringify(report,null,2)+'\n')
 console.log(JSON.stringify({products:report.products,imageURLs:assets.size,failures:failures.length,examples:failures.slice(0,20)},null,2))
 if(failures.length)process.exitCode=1
}finally{await new Promise(resolve=>server.close(resolve))}
