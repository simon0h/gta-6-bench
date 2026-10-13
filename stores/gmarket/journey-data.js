import { retailState } from '../../lib/retail-state.js'
import { bySku, totals } from './data.js'

// Public benefit concepts were observed; values/rules and private layouts are local fixtures.
export const coupons = [
  { id:'pantry10', title:'장보기 10% 할인', department:'food', percent:10, cap:3000, min:30000, rule:'식품 상품금액 30,000원 이상 · 최대 3,000원 · 예약상품 제외' },
  { id:'digital5000', title:'디지털 5,000원 할인', department:'digital', amount:5000, min:100000, rule:'디지털 상품금액 100,000원 이상 · 예약상품 제외' },
  { id:'checkin1000', title:'출석체크 1,000원 할인', amount:1000, min:50000, checkin:true, rule:'일반상품 금액 50,000원 이상 · 예약상품 제외 · 출석 후 받기' },
]
export const couponById = id => coupons.find(c=>c.id===id)
export function journeyState(req) {
  const state=retailState(req)
  state.followedStores ||= []
  state.coupons ||= []
  state.checkins ||= []
  return state
}
export const koreaDay = () => new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())
export function couponQuote(req, items, id='') {
  const t=totals(items)
  if(!id) return {totals:t,discount:0}
  const coupon=couponById(id),claim=journeyState(req).coupons.find(c=>c.id===id)
  if(!req.store.user||!coupon||!claim||claim.used_order) return {error:'사용 가능한 보유 쿠폰을 선택해 주세요.',totals:t,discount:0}
  // Resolve catalog facts rather than client price/kind/department fields.
  const eligible=items.filter(item=>{const p=bySku(item.sku);return p?.kind==='other'&&(!coupon.department||p.department===coupon.department)})
  const amount=eligible.reduce((n,item)=>n+item.unit_price*item.qty,0)
  if(amount<coupon.min) return {error:coupon.rule+' 조건을 확인해 주세요.',totals:t,discount:0}
  const discount=Math.min(amount,coupon.amount||Math.min(coupon.cap,Math.floor(amount*coupon.percent/100)))
  return {coupon,claim,discount,totals:{...t,discount,total:t.total-discount}}
}

export const topics = [['orders','주문/결제'],['shipping','배송'],['returns','취소/반품'],['benefits','쿠폰/혜택'],['account','회원/개인정보']]
export const articles = [
  {id:'find-order',topic:'orders',title:'주문한 상품과 결제내역은 어디에서 보나요?',text:'나의 G마켓의 주문/배송조회에서 주문번호와 상품을 확인할 수 있습니다. 주문 상세에는 받는 사람, 배송지, 판매자별 상품 구성, 결제금액이 표시됩니다. 이 환경의 주문은 구매한 브라우저에서만 조회할 수 있습니다.',link:'/account/orders',label:'주문/배송조회'},
  {id:'payment',topic:'orders',title:'결제 오류가 발생했어요.',text:'카드번호와 유효기간, 보안코드를 확인해 주세요. 입력 오류가 있으면 주문은 생성되지 않으며 카드번호와 보안코드를 다시 입력해야 합니다. 주문이 완료되었는지 주문내역에서 먼저 확인해 주세요.',link:'/account/orders',label:'주문내역 확인'},
  {id:'options',topic:'orders',title:'옵션별 상품가격과 장바구니 수량을 변경하고 싶어요.',text:'상품 상세에서 색상이나 규격을 먼저 선택해 주세요. 같은 상품도 옵션이 다르면 장바구니에 별도로 표시됩니다. 장바구니에서 옵션과 수량을 변경하고, 선택한 상품만 주문하거나 나중에 구매 목록에 보관할 수 있습니다.',link:'/cart',label:'장바구니 보기'},
  {id:'delivery',topic:'shipping',title:'배송비와 발송 예정일은 어떻게 확인하나요?',text:'상품별 배송비는 상세페이지에 표시됩니다. 같은 판매자의 유료배송 상품은 가장 높은 배송비가 한 번 부과됩니다. 무료배송 상품을 함께 담아도 다른 유료상품의 배송비가 없어지지는 않습니다. 최종 배송비는 주문/결제에서 확인해 주세요.',link:'/cart',label:'장바구니 확인'},
  {id:'preorder',topic:'shipping',title:'예약상품의 배송조회가 아직 없어요.',text:'예약상품은 안내된 출시 일정에 맞춰 발송 예정입니다. 주문접수 상태에서는 송장번호가 없습니다. 이 환경에서는 실제 택배 이동 정보가 제공되지 않으며 발송완료 상태로 자동 변경되지 않습니다.',link:'/account/orders',label:'발송 안내 확인'},
  {id:'address',topic:'shipping',title:'배송지를 저장하거나 기본 배송지를 바꾸고 싶어요.',text:'로그인 후 배송지 관리에서 받는 사람, 010 휴대폰 번호, 5자리 우편번호와 주소를 저장해 주세요. 기본 배송지가 주문서에 제안됩니다. 이미 완료된 주문의 배송지는 주소록을 수정해도 바뀌지 않습니다.',link:'/account/addresses',label:'배송지 관리'},
  {id:'cancel',topic:'returns',title:'주문을 취소하려면 어떻게 하나요?',text:'주문접수 상태인 주문 상세에서 취소 사유를 입력하고 전체주문 취소를 요청할 수 있습니다. 취소 후에도 원래 주문 상품과 결제내역은 보관됩니다. 이 환경의 취소는 로컬 주문 상태를 변경하며 실제 카드 환불은 발생하지 않습니다.',link:'/account/orders',label:'취소 가능한 주문 확인'},
  {id:'return',topic:'returns',title:'교환이나 반품은 언제 신청하나요?',text:'반품 요청은 배송완료 주문에 한해 가능합니다. 아직 주문접수 중이라면 주문취소를 이용해 주세요. 다운로드 코드 사용, 개봉 여부 및 상품 종류에 따라 조건이 달라질 수 있으므로 상품의 배송/교환/반품 안내를 확인해 주세요. 별도의 교환 처리가 필요하면 1:1 문의를 남겨 주세요.',link:'/help/inquiries/new',label:'1:1 문의하기'},
  {id:'coupon',topic:'benefits',title:'쿠폰을 받았는데 주문서에서 사용할 수 없어요.',text:'쿠폰함에서 사용 여부, 대상 카테고리와 최소 상품금액을 확인해 주세요. 배송비와 예약상품은 최소금액 계산에서 제외됩니다. 주문당 쿠폰 한 장을 사용할 수 있으며 결제가 완료되면 사용완료 처리됩니다. 취소한 주문의 쿠폰은 자동 복원되지 않습니다.',link:'/account/coupons',label:'쿠폰함 확인'},
  {id:'checkin',topic:'benefits',title:'출석체크는 하루에 몇 번 가능한가요?',text:'한국 시간 기준 하루 한 번 출석할 수 있습니다. 출석 쿠폰은 이 환경에서 계정별 한 번 받을 수 있으며 이미 받은 쿠폰은 중복 지급되지 않습니다. 앱 전용 혜택과 실제 포인트 전환은 제공되지 않습니다.',link:'/benefits',label:'혜택과 출석체크'},
  {id:'saved',topic:'account',title:'관심상품과 관심매장은 어디에서 확인하나요?',text:'상품 상세의 관심상품 버튼과 판매자 미니샵의 관심매장 버튼을 이용해 주세요. 나의 G마켓에서 모아 보고 삭제할 수 있습니다. 저장한 정보는 이 브라우저의 로그인 계정별로 구분됩니다.',link:'/account/wishlist',label:'관심상품 보기'},
  {id:'guest',topic:'account',title:'비회원 주문도 확인할 수 있나요?',text:'주문한 브라우저에서 비회원 주문조회로 들어가면 주문내역을 볼 수 있습니다. 다른 브라우저의 주문번호나 이메일만으로는 주문 정보를 조회할 수 없습니다. 이메일로 회원가입할 수 있습니다. 비밀번호 재설정 및 휴대폰 본인인증은 제공되지 않습니다.',link:'/account/guest-orders',label:'비회원 주문조회'},
]
export const notices=[{id:'local-services',title:'주문 및 상담 서비스 이용안내',date:'2026.10.02',text:'상품과 주문은 테스트용 데이터입니다. 문의는 이 브라우저에 접수내역으로 저장되며 실제 상담원이나 판매자에게 전송되지 않습니다. 실시간 택배 추적과 실제 환불은 지원하지 않습니다.'},{id:'coupon-rules',title:'쇼핑 쿠폰 사용조건 안내',date:'2026.10.01',text:'쿠폰은 회원 전용이며 대상 상품금액을 기준으로 계산합니다. 예약상품 및 배송비는 제외되고 주문당 한 장만 사용할 수 있습니다. 쿠폰은 결제완료 후 사용완료되며 주문취소 시 자동 재발급되지 않습니다.'}]
