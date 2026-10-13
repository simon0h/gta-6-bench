import { applyCatalogPolicy } from '../../lib/catalog-policy.js'
import { expandCatalog, gamePlatform } from './catalog500.js'
import { GAME } from '../../lib/catalog.js'
import { departments, sellers, extraProducts, campaigns } from './fixtures.js'
export { departments, sellers, campaigns }

export const name = 'Gmarket (G마켓)'
export const release = GAME.release_date
// Search-listing snapshots; full product pages required adult authentication.
// ASSUMPTION: the two local preorder variants are Standard code-in-box products.
const originalProducts = [
  { sku: '4796016651', title: 'PS5 GTA6 Grand Theft Auto VI 한글판 예약판매', platform: 'ps5', edition: 'standard', format: 'code-in-box', unit_price: 89800, seller: 'h2몰', category: 'games' },
  { sku: '4796017670', title: 'Xbox Series X|S GTA6 Grand Theft Auto VI 한글판 예약판매', platform: 'xbox', edition: 'standard', format: 'code-in-box', unit_price: 89800, seller: 'h2몰', category: 'games' },
  { art: 'gta5', adult: true, sku: 'gta5-xbox', kind: 'other', title: 'Xbox Series X 그랜드 테프트 오토 V (한국어판) GTA5', unit_price: 26400, seller: 'h2몰', category: 'games' },
  { sku:'gm-controller', kind:'other', title:'소니 PS5 듀얼센스 무선 컨트롤러', unit_price:79800, seller:'게임셀렉트',category:'games',art:'controller',reviews:138,rating:4.8 },
  { sku:'gm-headphones', kind:'other', title:'무선 블루투스 헤드폰 블랙', unit_price:49900,seller:'디지털마트',category:'electronics',art:'headphones',reviews:72,rating:4.6 },
  { sku:'gm-milk', kind:'other', title:'고소한 멸균우유 1L 10팩', unit_price:21900,seller:'푸드마켓',category:'food',art:'milk',reviews:382,rating:4.9 },
  { sku:'gm-ramen', kind:'other', title:'얼큰한 라면 20봉 멀티팩', unit_price:15900,seller:'푸드마켓',category:'food',art:'ramen',reviews:227,rating:4.7 },
  { sku:'gm-water', kind:'other', title:'맑은 생수 500ml 24병', unit_price:7900,seller:'푸드마켓',category:'food',art:'water',reviews:408,rating:4.8 },
  { sku:'gm-towels', kind:'other', title:'코튼 호텔수건 선택형 세트', unit_price:18900,seller:'리빙셀렉트',category:'home',art:'household',reviews:63,rating:4.6 },
]
const originalDetails = {
  '4796016651':['digital','games','Rockstar Games','h2','game','플랫폼:PS5|에디션:스탠다드|구성:코드 인 박스 (디스크 미포함)|출시예정:'+release],
  '4796017670':['digital','games','Rockstar Games','h2','game','플랫폼:Xbox Series X·S|에디션:스탠다드|구성:코드 인 박스 (디스크 미포함)|출시예정:'+release],
  'gta5-xbox':['digital','games','Rockstar Games','h2','game','플랫폼:Xbox Series X|작품:Grand Theft Auto V|형태:게임 디스크|언어:한국어 지원'],
  'gm-controller':['digital','gaming-accessories','소니','games','controller','호환:PS5 및 지원 PC|연결:Bluetooth USB-C|기능:햅틱 피드백|구성:컨트롤러 1개'],
  'gm-headphones':['digital','audio','사운드룸','digitalmart','headphones','연결:Bluetooth 5.2|재생:최대 30시간|충전:USB-C|구성:헤드폰 충전케이블'],
  'gm-milk':['food','drinks','모닝테이블','foodmarket','milk','용량:1L × 10팩|유형:멸균우유|알레르기:우유 함유|보관:개봉 후 냉장 보관'],
  'gm-ramen':['food','pantry','모닝테이블','foodmarket','ramen','수량:20봉|중량:120g × 20|조리:끓는 물에 4분|알레르기:밀 대두 함유'],
  'gm-water':['food','drinks','맑은샘','foodmarket','water','용량:500ml × 24병|유형:먹는샘물|보관:직사광선 피함|구성:24병 1박스'],
  'gm-towels':['home','living','룸앤데이','living','towels','소재:면 100%|크기:40 × 80cm|중량:장당 180g|관리:섬유유연제 사용 자제'],
}
export const products = [...originalProducts.map((p,i)=>{
 const [department,leaf,brand,sellerId,illustration,spec] = originalDetails[p.sku]
 return {...p,department,leaf,brand,sellerId,illustration,specs:spec.split('|').filter(s=>s.includes(':')).map(s=>s.split(':')),rating:p.rating||0,reviews:p.reviews||0,sales:700+i*143,recommended:1100-i*11,added:20+i,stock:40,condition:'new',imported:false,delivery:p.kind?'standard':'preorder',shippingFee:p.kind?3000:0,deal:i===3||i===5,color:['#61798a','#73977d','#b69a79'][i%3]}
}),...extraProducts]
products.push(...expandCatalog(products))
const variants = {
 'gm-controller':[['white','화이트',0,25],['black','미드나이트 블랙',5000,18],['pink','노바 핑크',5000,0]],
 'gm-towels':[['five','혼합색상 5장',0,20],['ten','혼합색상 10장',17000,12],['grey','그레이 5장',0,0]],
 'gm-shirt':[['m','블루 M',0,12],['l','블루 L',0,15],['xl','블루 XL',0,8]],
 'gm-sneakers':[['240','아이보리 240mm',0,12],['250','아이보리 250mm',0,10],['260','아이보리 260mm',0,0]],
 'gm-suitcase':[['silver','실버 20형',0,20],['navy','네이비 20형',0,15]],
 'gm-yogamat':[['sage','세이지 6mm',0,20],['purple','라일락 6mm',0,18]],
}
for (const p of products) {
 if(p.sku==='4796017670')p.specs[0]=['플랫폼','Xbox Series X|S']
 p.gallery = [`${p.sku}.svg`,`${p.sku}-detail.svg`]
 if (variants[p.sku]) p.variants=variants[p.sku].map(([id,label,extra,stock])=>({id,label,extra,stock}))
 p.list_price = Math.round(p.unit_price*1.16/100)*100
}
export const bySku = sku => products.find(p => p.sku === sku)
export const sellerById = id => sellers.find(s=>s.id===id)
export const departmentById = id => departments.find(d=>d.id===id)
export const categories = [['all','전체'],['games','게임 · 콘솔'],['electronics','디지털 · 가전'],...departments.filter(d=>d.id!=='digital').map(d=>[d.id,d.name])]
export const sorts = [['relevance','G마켓 추천순'],['sales','판매 인기순'],['price-asc','낮은 가격순'],['price-desc','높은 가격순'],['reviews','상품평 많은순'],['newest','신규 등록순']]
export const deliveryLabels = {standard:'일반택배',star:'스타배송',today:'오늘출발',preorder:'예약배송'}
const string = value => (typeof value==='string'||typeof value==='number')?String(value).trim().slice(0,120):''
export function cleanOptions(input={}) {
 const o=Object.fromEntries(['q','category','seller','brand','delivery','condition','exclude','within','sort','view','page','min','max','rating','stock','deal','platform'].map(k=>[k,string(input[k])]))
 o.sort=sorts.some(([key])=>key===o.sort)?o.sort:'relevance'
 o.view=o.view==='gallery'?'gallery':'list'
 o.page=/^\d{1,5}$/.test(o.page)?Math.max(1,Number(o.page)):1
 return o
}
const normalize = q => String(q).toLowerCase().replace(/grand\s*theft\s*auto\s*(v(?!i)|5)|그랜드\s*테프트\s*오토\s*(v(?!i)|5)|gta\s*(v(?!i)|5)/gi,'gta5').replace(/grand\s*theft\s*auto\s*(vi|6)?|그랜드\s*테프트\s*오토\s*(vi|6)?|그타\s*6|gta\s*(vi|6)/gi,'gta6').replace(/[^a-z0-9가-힣]+/g,'')
function matches(p,q) {
 if(!q) return true
 const hay=normalize(`${p.title} ${p.keywords||''} ${p.seller} ${p.brand} ${p.category} ${p.leaf} ${p.department} ${departmentById(p.department)?.name} ${departmentById(p.department)?.leaves.find(([id])=>id===p.leaf)?.[1]||''} ${p.specs.map(s=>s.join(' ')).join(' ')}`)
 const full=normalize(q)
 if(hay.includes(full)) return true
 const words=q.replace(/grand\s*theft\s*auto\s*(vi|6)?|그랜드\s*테프트\s*오토\s*(vi|6)?|gta\s*(vi|6)/gi,'gta6').split(/\s+/).map(normalize).filter(Boolean)
 return words.length>0&&words.every(w=>hay.includes(w))
}
export function search(query='', options={}) {
 const o=cleanOptions(options)
 let result=products.filter(p=>matches(p,string(query))&&matches(p,o.within))
 if(o.category&&o.category!=='all') result=result.filter(p=>[p.category,p.department,p.leaf].includes(o.category))
 if(o.seller) result=result.filter(p=>p.seller===o.seller||p.sellerId===o.seller)
 if(o.platform) result=result.filter(p=>gamePlatform(p)===o.platform)
 if(o.brand) result=result.filter(p=>p.brand===o.brand)
 if(o.delivery) result=result.filter(p=>o.delivery==='free'?p.shippingFee===0:p.delivery===o.delivery)
 if(o.condition) result=result.filter(p=>p.condition===o.condition)
 if(o.exclude==='imported') result=result.filter(p=>!p.imported)
 if(o.exclude&&o.exclude!=='imported') result=result.filter(p=>!matches(p,o.exclude))
 if(o.stock==='available') result=result.filter(p=>p.stock>0)
 if(/^\d{1,9}$/.test(o.min)) result=result.filter(p=>p.unit_price>=Number(o.min))
 if(/^\d{1,9}$/.test(o.max)) result=result.filter(p=>p.unit_price<=Number(o.max))
 if(/^[0-5](\.\d)?$/.test(o.rating)) result=result.filter(p=>p.rating>=Number(o.rating))
 if(o.deal==='yes') result=result.filter(p=>p.deal)
 const compare={relevance:(a,b)=>b.recommended-a.recommended,sales:(a,b)=>b.sales-a.sales,'price-asc':(a,b)=>a.unit_price-b.unit_price,'price-desc':(a,b)=>b.unit_price-a.unit_price,reviews:(a,b)=>b.reviews-a.reviews,newest:(a,b)=>b.added-a.added}[o.sort]
 return result.sort((a,b)=>compare(a,b)||a.sku.localeCompare(b.sku))
}
export function paginate(items, page=1, size=12) {
 const totalPages=Math.max(1,Math.ceil(items.length/size))
 const current=Math.min(totalPages,Math.max(1,Number(page)||1))
 return {items:items.slice((current-1)*size,current*size),page:current,totalPages,total:items.length}
}
export function selectedOffer(p,variantId) {
 if(!p.variants) return variantId?{error:'선택할 수 없는 상품 옵션입니다.'}:{item:{...p,line_key:p.sku}}
 const variant=p.variants.find(v=>v.id===variantId)
 if(!variant) return {error:'상품 옵션을 선택해 주세요.'}
 if(!variant.stock) return {error:'품절된 옵션입니다. 다른 옵션을 선택해 주세요.'}
 return {item:{...p,variant_id:variant.id,variant_label:variant.label,line_key:`${p.sku}--${variant.id}`,title:`${p.title} [${variant.label}]`,unit_price:p.unit_price+variant.extra,stock:variant.stock}}
}
export function totals(cart) {
 const subtotal=cart.reduce((sum,p)=>sum+p.qty*p.unit_price,0)
 const groups=new Map()
 for(const p of cart) {const seller=p.seller||bySku(p.sku)?.seller||'seller';groups.set(seller,[...(groups.get(seller)||[]),p])}
 // Every line has a shipping profile. A free item never waives unrelated paid items.
 const shipping=[...groups.values()].reduce((sum,items)=>sum+Math.max(...items.map(p=>p.shippingFee??bySku(p.sku)?.shippingFee??3000)),0)
 return {subtotal,shipping,tax:0,discount:0,total:subtotal+shipping}
}
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const POSTCODE_RE = /^\d{5}$/
export function validPhone(phone) {
  if (!/^[+\d\s()-]+$/.test(phone)) return false
  const digits = phone.replace(/\D/g, '').replace(/^8210/, '010')
  return /^010\d{8}$/.test(digits)
}

// No legacy authored item has verified purchase evidence in reference mode.
applyCatalogPolicy('gmarket', products, {})
