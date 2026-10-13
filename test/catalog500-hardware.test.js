import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { HARDWARE_SEEDS, makeHardwareFixtures } from '../lib/expanded-hardware.js'

const byId=id=>HARDWARE_SEEDS.find(p=>p.id===`hardware-${id}`)

test('hardware audit preserves all 216 commercial identities, prices, stocks and brands',()=>{
 assert.equal(HARDWARE_SEEDS.length,216)
 assert.equal(new Set(HARDWARE_SEEDS.map(p=>p.id)).size,216)
 assert.equal(new Set(HARDWARE_SEEDS.map(p=>p.title)).size,216)
 assert.equal(HARDWARE_SEEDS.filter(p=>p.catalogType==='console').length,18)
 assert.equal(HARDWARE_SEEDS.filter(p=>p.catalogType==='accessory').length,198)
 const commercial=HARDWARE_SEEDS.map(({id,price,stock,catalogPlatform,catalogType,brand})=>({id,price,stock,catalogPlatform,catalogType,brand}))
 // Recorded before the compatibility/art fixes; detects accidental commercial changes.
 assert.equal(createHash('sha256').update(JSON.stringify(commercial)).digest('hex'),'41ef1ff97bc99320eb08731764d192fba27f5b4c9858747ae05743d45343e15c')
 for(const p of HARDWARE_SEEDS){
  assert.equal(p.kind,'other')
  assert.ok(Number.isFinite(p.price)&&p.price>0,p.id)
  assert.ok(Number.isInteger(p.stock)&&p.stock>0,p.id)
 }
 for(const platform of new Set(HARDWARE_SEEDS.map(p=>p.catalogPlatform))){
  assert.equal(HARDWARE_SEEDS.filter(p=>p.catalogPlatform===platform).length,24)
 }
})

test('Switch 2 travel bundle includes substantive equipment beyond the base console',()=>{
 const plain=byId('nintendo-switch-2-console'),bundle=byId('nintendo-switch-2-travel-starter-bundle')
 assert.notEqual(bundle.specs.Includes,plain.specs.Includes)
 for(const item of ['hard-shell travel case','twelve-slot game-card wallet','screen protector','cable-organizer pouch']){
  assert.ok(bundle.specs.Includes.includes(item),item)
  assert.ok(bundle.description.includes(item),item)
  assert.ok(!plain.specs.Includes.includes(item),item)
 }
 assert.equal(bundle.shape,'handheld-travel-bundle')
})

test('fitted accessories distinguish console bodies and controller shells within platform families',()=>{
 const examples=[
  ['xbox-stand',/Series X 1 TB/,/Series S/],
  ['xbox-one-travel',/One S 1 TB/,/One X/],
  ['xbox-360-dust-cover',/360 S 250 GB/,/360 E/],
  ['ps5-wall-bracket',/Disc Edition.*CFI-1000/,/Digital Edition.*CFI-2000/],
  ['ps4-flight-case',/Slim 1 TB/,/Pro/],
  ['ps3-stand',/Slim 160 GB/,/Super Slim/],
  ['switch-screen',/OLED.*HEG-001/,/Switch Lite/],
  ['switch-2-grip',/Switch 2.*Joy-Con 2/,/Switch OLED/],
  ['nintendo-ds-grip',/DS Lite.*USG-001/,/DSi/],
 ]
 for(const [id,model,excluded] of examples){
  const p=byId(id)
  assert.equal(p.fitScope,'model',id)
  assert.match(p.specs.Compatibility,model,id)
  assert.match(p.specs['Fit exclusions'],excluded,id)
  assert.match(p.title,model,id)
 }
 assert.match(byId('ps5-sleeve').specs.Compatibility,/DualSense/)
 assert.match(byId('xbox-caps').specs.Compatibility,/Xbox Wireless Controller/)
 assert.match(byId('ps3-controller-case').specs.Compatibility,/DUALSHOCK 3/)
 for(const p of HARDWARE_SEEDS.filter(p=>p.catalogType==='accessory')){
  assert.ok(p.specs.Connection,p.id)
  assert.ok(['model','universal'].includes(p.fitScope),p.id)
  if(p.fitScope==='model')assert.ok(p.specs['Fit exclusions'],p.id)
  else assert.match(p.specs.Compatibility,/Universal/,p.id)
  assert.doesNotMatch(p.description,/Fits .* hardware only/,p.id)
 }
})

test('electrical products name connectors; passive charging aids do not promise power',()=>{
 const ds=byId('nintendo-ds-charger')
 assert.match(ds.specs['Adapter model'],/USG-002/)
 assert.match(ds.specs.Connection,/DS Lite proprietary plug.*5\.2V IN.*not the DSi/)
 assert.match(ds.specs['AC input'],/120 V/)
 assert.match(byId('switch-charger').specs['Adapter model'],/HAC-002/)
 assert.match(byId('switch-charger').specs.Connection,/USB-C/)
 assert.match(byId('switch-2-charger').specs['Adapter model'],/NGN-01.*BEE-011/)
 assert.match(byId('switch-2-charger').specs.Connection,/USB-C to USB-C/)
 for(const platform of ['xbox','xbox-one','xbox-360','ps5','ps4','ps3']){
  for(const type of ['controller','arcade','wheel'])assert.match(byId(`${platform}-${type}`).specs.Connection,/USB Type-A plug.*USB Type-A host/)
  assert.match(byId(`${platform}-cable`).specs.Connection,/HDMI Type-A male to HDMI Type-A male/)
  assert.match(byId(`${platform}-headset`).specs.Connection,/3\.5 mm TRS/)
  assert.match(byId(`${platform}-charging`).description,/passive.*no charging contacts/)
  assert.match(byId(`${platform}-power`).description,/passive.*no electrical lead/)
 }
 for(const platform of ['switch-2','switch','nintendo-ds']){
  assert.match(byId(`${platform}-charging`).description,/no electrical contacts or electronics/)
  assert.match(byId(`${platform}-car-charger`).description,/no vehicle adapter, charging cable or electrical components/)
 }
})

test('every fixture has valid generated native art, including hinged DS screens and travel equipment',async()=>{
 for(const p of HARDWARE_SEEDS){
  const svg=await readFile(new URL(`../public/art/catalog500/hardware/${p.id}.svg`,import.meta.url),'utf8')
  assert.match(svg,/^<svg[^>]+xmlns=/,p.id)
  assert.match(svg,/<title>.+<\/title><desc>.+<\/desc>/,p.id)
  assert.match(svg,/<\/svg>$/,p.id)
  assert.doesNotMatch(svg,/undefined|null|NaN/,p.id)
  if(p.catalogType==='console'&&p.catalogPlatform==='nintendo-ds'){
   assert.equal(p.shape,'dual-screen')
   assert.match(svg,/data-screen="upper"/)
   assert.match(svg,/data-screen="lower"/)
   assert.match(svg,/data-hinge="true"/)
  }
 }
 const dsFilms=byId('nintendo-ds-screen')
 assert.equal(dsFilms.shape,'dual-screen-protectors')
 assert.match(dsFilms.description,/flexible clear films.*touch and stylus compatible/)
})

test('store-sized hardware selections keep stable order and return independent specs',()=>{
 const first=makeHardwareFixtures({count:194}),second=makeHardwareFixtures({count:194})
 assert.equal(first.length,194)
 assert.equal(first.filter(p=>p.catalogType==='console').length,18)
 assert.deepEqual(first.map(p=>p.id),second.map(p=>p.id))
 first[0].specs.Model='changed locally'
 assert.notEqual(first[0].specs.Model,second[0].specs.Model)
 assert.equal(makeHardwareFixtures({count:216}).length,216)
})
