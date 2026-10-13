import { physicalFixtures } from './physical.js'
export function expandCatalog(products) {
 for(const p of products){p.catalogType=p.contentType==='base-game'?'game':'accessory';p.catalogPlatform=p.platforms.includes('PS5')?'ps5':'ps4';p.accessorySubtype=p.catalogType==='accessory'?'digital-add-on':null}
 const additions=physicalFixtures(products).map((p,i)=>({...p,ordinary:true,fictional:true,publisher:p.publisher||p.brand,release:p.release||'2026-09-01',genres:p.genre||'Hardware',rating:p.age||p.rating||null,localPlayers:p.localPlayers||0,onlinePlayers:0,plusRequired:false,onlineRequired:false,type:p.catalogType==='game'?'PHYSICAL GAME':p.catalogType==='console'?'CONSOLE':'ACCESSORY',contentType:p.catalogType==='game'?'base-game':'hardware',accessorySubtype:p.catalogType==='accessory'?'physical':null,cta:'cart',chips:p.platforms,editionName:'Physical store offer',bullets:[p.description],features:p.catalogType==='game'&&p.localPlayers>1?['Local Multiplayer']:[],accessibility:{},vr:'No VR',originalPrice:p.price,bestRank:38+i,downloadRank:1000+i,ratingCount:0,distribution:[],score:0,keywords:p.keywords||`${p.title} ${p.description}`}))
 return [...products,...additions]
}
