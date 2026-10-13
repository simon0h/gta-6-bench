import { mkdirSync, writeFileSync } from 'node:fs'
import { otherFixtures, fixtureSvg } from './assortment500.js'
for(const [store,count]of[['amazon',204],['walmart',181],['target',195]]){
 const directory=new URL(`../${store}/public/catalog500/`,import.meta.url)
 mkdirSync(directory,{recursive:true})
 for(const p of otherFixtures(store,count))writeFileSync(new URL(p.id+'.svg',directory),fixtureSvg(p))
}
