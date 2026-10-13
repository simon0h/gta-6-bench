import test from 'node:test'
import assert from 'node:assert/strict'
import { access,readFile } from 'node:fs/promises'
import { createApp } from '../app.js'
import { readStoreInventories } from '../lib/store-inventory.js'
import { CATALOG_PLATFORMS,GAME_SEEDS,makeGameFixtures } from '../lib/expanded-games.js'
import { HARDWARE_SEEDS } from '../lib/expanded-hardware.js'
test('catalog500: all twenty live catalogs have exactly the requested listing and game counts',async()=>{
 const stores=await readStoreInventories();assert.equal(stores.length,20);assert.equal(stores.reduce((n,s)=>n+s.inventory.length,0),10000)
 for(const s of stores){const rows=s.inventory;assert.equal(rows.length,500,s.slug);assert.equal(new Set(rows.map(p=>p.id)).size,500,s.slug+' unique IDs');assert.equal(rows.filter(p=>p.type==='game').length,s.games,s.slug+' game count')
  for(const p of rows){assert.ok(p.id&&p.title&&p.category,s.slug+' complete record '+p.id);assert.ok(['game','console','accessory','other'].includes(p.type));assert.equal(typeof p.available,'boolean');if(p.type==='game')assert.ok(p.platform,s.slug+' platform '+p.id)}
  if(s.games)for(const platform of CATALOG_PLATFORMS)assert.ok(rows.some(p=>p.type==='game'&&p.platform===platform.id),s.slug+' missing '+platform.id)
  if(s.games===300)assert.equal(rows.filter(p=>p.type==='console'||p.type==='accessory').length,200,s.slug+' hardware/accessory count')
 }
})
test('catalog500: every inventoried retailer registers in the running app',async()=>{
 const app=await createApp({persist:false,captcha:{mode:'off'}})
 const catalogs=await readStoreInventories()
 assert.deepEqual(app.locals.stores.map(s=>s.slug).sort(),catalogs.map(s=>s.slug).sort())
})
test('catalog500: authored game covers and hardware art resolve; allocator balances all nine platforms',async()=>{
 assert.equal(GAME_SEEDS.length,300);assert.equal(new Set(GAME_SEEDS.map(p=>p.title)).size,300)
 for(const p of [...GAME_SEEDS,...HARDWARE_SEEDS])await access(new URL('../public/'+p.art.slice('/static/'.length),import.meta.url))
 const games=makeGameFixtures({count:244,existingPlatforms:['ps5','ps5','xbox','xbox','switch','switch']})
 const counts=CATALOG_PLATFORMS.map(p=>games.filter(g=>g.platform===p.id).length+['ps5','ps5','xbox','xbox','switch','switch'].filter(id=>id===p.id).length)
 assert.equal(games.length,244);assert.ok(counts.every(n=>n===27||n===28));assert.ok(games.every(p=>p.kind==='other'))
 for(const p of games.slice(0,15)){const art=await readFile(new URL('../public/'+p.art.slice('/static/'.length),import.meta.url),'utf8');assert.ok(art.includes('<svg'));assert.ok(p.description&&p.specs.Platform&&p.specs.Genre)}
})
