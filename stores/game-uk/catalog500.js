import { makeGameFixtures, CATALOG_PLATFORMS } from '../../lib/expanded-games.js'
import { hardwareFixtures } from '../gamestop/catalog500-hardware.js'
const slug=value=>value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')
const platformMap={PS5:'ps5',Xbox:'xbox',PC:'pc'}
export function expandGameUK(products) {
  for(const p of products){
    p.catalogType=p.category==='Video Games'||p.id==='992025'?'game':p.category==='Consoles'?'console':['Controllers','Headsets','Racing Wheels','Charging Docks','Carry Cases','Keyboards','Mice','PC Bundles','Monitors','Laptops','Headphones','Storage','Cables','Webcams','Card Storage'].includes(p.category)?'accessory':'other'
    p.catalogPlatform=p.id==='271604'?'ps5':p.id==='271605'?'xbox':platformMap[p.platformFacet]||null
  }
  const games=products.filter(p=>p.catalogType==='game')
  const source=makeGameFixtures({count:250-games.length,existingPlatforms:games.map(p=>p.catalogPlatform),excludedTitles:games.map(p=>p.title)})
  const add=(p,index)=>{const id=String(993000+index);return {...p,id,colcode:`${id}99`,slug:`${slug(p.title)}-${id}`,kind:'other',ticketPrice:p.price,photo:null,artAlt:`${p.title} — product illustration`,badges:[],preorder:false,release:p.release||'2026-09-01',stock:p.stock,collect:!p.digital,swatch:p.platformFacet||'Standard',age:p.age||'All ages',pegi:p.pegi||null,carrier:p.digital?'email':'Evri',family:p.gameTitle||p.title,description:[p.description],catalogRange:'game-retail-500'}}
  products.push(...source.map((p,index)=>add({...p,price:Math.round(p.price*0.8*100)/100,category:'Video Games',brand:p.publisher,platformFacet:p.catalogPlatform==='ps5'?'PS5':p.catalogPlatform==='xbox'?'Xbox':p.platformLabel,style:p.genre,departments:['gaming'],crumbs:['Consoles & Video Games','Video Games'],specs:{...p.specs,Format:p.catalogPlatform==='xbox'?'Download code in box':p.formatLabel,Region:'United Kingdom'},pegi:p.age==='T'?12:p.age==='E10+'?7:3,age:p.age==='T'?'PEGI 12':p.age==='E10+'?'PEGI 7':'PEGI 3'},index)))
  const remaining=250-products.filter(p=>p.catalogType!=='game').length
  products.push(...hardwareFixtures.slice(0,remaining).map((p,index)=>{
    const category=p.catalogType==='console'?'Consoles':p.category==='PC Peripherals'?(p.title.includes('mouse')||p.title.includes('trackball')?'Mice':'Keyboards'):['Mounts','Desk Accessories'].includes(p.category)?'PC Bundles':['Console Stands','Console Protection','Game Storage'].includes(p.category)?'Carry Cases':p.category
    const departments=['Consoles','Controllers','Carry Cases'].includes(category)?['gaming']:['Storage','Cables'].includes(category)?['tech','pc-gaming']:['pc-gaming']
    return add({...p,price:Math.round(p.price*0.8*100)/100,category,brand:p.catalogType==='console'?'GameLab':category==='Storage'?'StoreTech':'GameLab',departments,crumbs:[departments[0]==='gaming'?'Consoles & Video Games':'PC Gaming',category],style:category,platformFacet:p.catalogPlatform==='pc'?'PC':p.catalogPlatform==='ps5'?'PS5':p.catalogPlatform==='xbox'?'Xbox':CATALOG_PLATFORMS.find(platform=>platform.id===p.catalogPlatform)?.label||null},source.length+index)
  }))
}
