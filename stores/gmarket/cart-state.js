import { selectedOffer, bySku } from './data.js'

export const lineKey = line => line.line_key || line.sku
export const cartServices = [
 {id:'all',label:'전체',matches:()=>true},
 {id:'emart',label:'이마트몰',matches:()=>false,notice:'현재 장바구니에는 이마트몰 전용 상품이 없습니다. 식품관 상품은 판매자 택배로 배송됩니다.'},
 {id:'star',label:'스타배송',matches:p=>p.delivery==='star',notice:'스타배송 상품을 담으면 이곳에서 함께 확인할 수 있습니다.'},
 {id:'sameday',label:'당일배송',matches:()=>false,notice:'현재 당일 도착을 보장하는 상품은 없습니다. 오늘출발은 판매자의 발송 예정일을 뜻하며 당일배송과 다릅니다.'},
 {id:'today',label:'오늘출발',matches:p=>p.delivery==='today',notice:'오늘출발 상품을 담으면 이곳에서 확인할 수 있습니다. 도착일 보장 서비스는 아닙니다.'},
]
export const cartService = id => cartServices.find(s=>s.id===id)||cartServices[0]
// One source for coupon eligibility, shipping, payment and the recorded order.
export function checkoutItems(req) {
 const purchase=req.store.gmarketPurchase
 if(purchase?.mode==='complete')return []
 if(purchase?.mode==='buy')return purchase.items
 if(purchase?.mode==='cart')return req.store.cart.filter(p=>purchase.keys.includes(lineKey(p)))
 return req.store.cart
}
export function selectCart(req,keys) {
 req.store.gmarketPurchase={mode:'cart',keys:[...new Set(keys)]}
 delete req.store.checkout.coupon_id
}
export function forgetCartLine(req,key,replacement) {
 const purchase=req.store.gmarketPurchase
 if(purchase?.mode==='cart')purchase.keys=[...new Set(purchase.keys.flatMap(k=>k===key?(replacement?[replacement]:[]):[k]))]
}
export function resolveSaved(line) {
 const p=bySku(line.sku)
 if(!p)return {error:'더 이상 판매하지 않는 상품입니다.'}
 const offer=selectedOffer(p,line.variant_id||'')
 if(offer.error)return offer
 return {...offer,item:{...offer.item,qty:line.qty}}
}
