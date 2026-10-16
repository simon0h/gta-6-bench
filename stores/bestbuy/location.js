// Deterministic local store fixtures, not live availability or geolocation.
import { scenarioProduct } from '../../lib/benchmark-scenarios.js'
// Store-locator details: distance from the default 90220 search, today's closing time and weekly hours.
const WEEK = [['Mon–Sat','10 a.m.–8 p.m.'],['Sun','11 a.m.–7 p.m.']]
export const STORES = [
 {id:'compton',name:'Compton',address:'230 Towne Center Drive',city:'Compton',state:'CA',zip:'90220',hours:'10 a.m.–8 p.m.',services:['Store pickup','Electronics recycling'],miles:'1.4',week:WEEK,closes:'8 p.m.',},
 {id:'burbank',name:'Burbank',address:'1501 N Victory Place',city:'Burbank',state:'CA',zip:'91502',hours:'10 a.m.–8 p.m.',services:['Store pickup','Electronics recycling'],miles:'21.6',week:WEEK,closes:'8 p.m.',},
 {id:'culver-city',name:'Culver City',address:'6000 Sepulveda Boulevard',city:'Culver City',state:'CA',zip:'90230',hours:'10 a.m.–8 p.m.',services:['Store pickup','Electronics recycling'],miles:'11.8',week:WEEK,closes:'8 p.m.',},
]
export const currentStore = store => STORES.find(s=>s.id===store.pickupStoreId)||STORES[0]
export const locationContext = store => ({storeName:currentStore(store).name,shipZip:store.shipZip||'90001'})
export const localProduct = (p,store) => p ? scenarioProduct(store,{...p,pickupStoreId:currentStore(store).id,...locationContext(store),preferredFulfillment:store.retail?.preferences.fulfillment}) : null
export function pickupLimit(p,storeId) {
 if(storeId==='burbank' && (['microwave','television'].includes(p.family)||p.condition==='Open-box')) return 0
 if(storeId==='culver-city' && p.family==='laptop') return 1
 return Infinity
}
