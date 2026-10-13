// Site structure of www.coupang.com (desktop), captured 2026-10-13.
// Header, quick menu (GNB) and partner links come from a live fetch of a Coupang
// storefront page (shop.coupang.com); the department tree uses Coupang's public
// category IDs (/np/categories/<id>). See research/parity/coupang.json for sources and gaps.
// No products, prices, stock or ratings are recorded here.

// [real id, label, local slug aliases, subcategories [slug, label]]
export const DEPARTMENTS = [
  ['564553', '패션의류/잡화', ['fashion', 'clothing', 'bags'], [['women', '여성패션'], ['men', '남성패션'], ['unisex', '남녀 공용 의류'], ['kids', '유아동패션']]],
  ['176422', '뷰티', ['beauty', 'skincare', 'bodycare'], [['luxury', '명품뷰티'], ['skincare', '스킨케어'], ['cleansing', '클렌징/필링'], ['makeup', '메이크업'], ['perfume', '향수'], ['men', '남성화장품'], ['nail', '네일'], ['hair', '헤어']]],
  ['219079', '출산/유아동', ['baby', 'babycare', 'babymeal'], [['diapers', '기저귀'], ['wipes', '물티슈'], ['formula', '분유/어린이식품'], ['feeding', '수유/이유용품'], ['safety', '놀이매트/안전용품'], ['outing', '외출용품'], ['bath', '목욕/위생용품']]],
  ['194276', '식품', ['food', 'milk', 'drinks', 'coffee', 'pantry', 'fresh', 'snacks'], [['fruit', '과일'], ['nuts', '견과/건과'], ['vegetables', '채소'], ['rice', '쌀/잡곡'], ['meat', '축산/계란'], ['seafood', '수산물/건어물'], ['drinks', '생수/음료'], ['coffee', '커피/원두/차'], ['noodles', '면/통조림/가공식품'], ['dairy', '유제품/아이스크림/디저트']]],
  ['185669', '주방용품', ['kitchen', 'cookware', 'tableware'], [['appliances', '주방가전'], ['cookware', '냄비/프라이팬'], ['tools', '주방조리도구'], ['dishes', '그릇/홈세트'], ['cutlery', '수저/커트러리'], ['cups', '컵/텀블러/와인용품'], ['storage', '밀폐저장/도시락'], ['disposable', '일회용품/종이컵']]],
  ['115673', '생활용품', ['home', 'cleaning', 'bath'], [['hair', '헤어'], ['body', '바디/세안'], ['oral', '구강/면도'], ['tissue', '화장지/물티슈'], ['laundry', '세탁세제'], ['cleaning', '청소/주방세제'], ['deodorize', '탈취/방향/살충'], ['medical', '건강/의료용품'], ['tools', '공구/철물/DIY']]],
  ['184555', '홈인테리어', ['interior', 'lighting', 'bedding'], [['decor', '홈데코'], ['furniture', '가구'], ['storage', '수납/정리'], ['bedding', '침구'], ['curtains', '커튼/블라인드'], ['rugs', '카페트/쿠션/거실화'], ['lighting', '조명/스탠드'], ['garden', '원예/가드닝']]],
  ['178255', '가전디지털', ['electronics', 'games', 'consoles', 'software', 'accessories', 'audio', 'computing', 'mobile', 'appliances'], [['tv', 'TV/영상가전'], ['refrigerator', '냉장고'], ['washer', '세탁기/건조기'], ['living', '생활가전'], ['vacuum', '청소기'], ['laptop', '노트북'], ['monitor', '모니터'], ['mobile', '휴대폰'], ['tablet', '태블릿PC'], ['audio', '음향가전'], ['camera', '카메라'], ['game', '게임']]],
  ['317778', '스포츠/레저', ['sports', 'fitness', 'outdoor'], [['camping', '캠핑'], ['fitness', '홈트레이닝'], ['swim', '수영/수상스포츠'], ['golf', '골프'], ['bike', '자전거'], ['fishing', '낚시'], ['hiking', '등산'], ['shoes', '스포츠신발']]],
  ['183960', '자동차용품', ['automotive', 'carcare', 'caraccessories'], [['interior', '인테리어'], ['exterior', '익스테리어'], ['wash', '세차/카케어'], ['electronics', '차량용전자기기'], ['maintenance', '차량관리/소모품'], ['motorcycle', '오토바이용품']]],
  ['317777', '도서/음반/DVD', ['books', 'reading', 'music'], [['children', '유아/어린이'], ['fiction', '소설/에세이/시'], ['study', '초중고참고서'], ['business', '경제 경영'], ['comics', '만화/라이트노벨'], ['selfhelp', '자기계발'], ['music', '음반'], ['dvd', 'DVD/블루레이']]],
  ['317779', '완구/취미', ['toys', 'building', 'play'], [['blocks', '블록놀이'], ['figures', '인형/피규어'], ['rc', 'RC완구/부품'], ['boardgames', '보드게임'], ['puzzles', '퍼즐/큐브/피젯토이'], ['models', '프라모델/모형'], ['baby', '신생아/영아완구'], ['instruments', '악기/음향기기']]],
  ['177195', '문구/오피스', ['stationery', 'writing', 'office'], [['office', '사무용품'], ['school', '학용품/수업준비'], ['pens', '필기류'], ['notes', '노트/메모지'], ['art', '미술/화방용품'], ['machines', '사무기기'], ['planners', '다이어리/플래너']]],
  ['115674', '반려동물용품', ['pets', 'petmeal', 'petcare'], [['dog-food', '강아지 사료/간식/영양제'], ['dog', '강아지 용품'], ['cat-food', '고양이 사료/간식/영양제'], ['cat', '고양이 용품'], ['fish', '관상어 용품'], ['small', '소동물/가축 용품']]],
  ['305798', '헬스/건강식품', ['health', 'supplements', 'wellness'], [['vitamins', '비타민/미네랄'], ['supplements', '영양제'], ['herbal', '허브/자연추출물'], ['ginseng', '홍삼/인삼'], ['diet', '다이어트/이너뷰티'], ['protein', '헬스보충식품'], ['juice', '건강즙/과일즙'], ['tea', '건강차']]],
].map(([id, label, aliases, subs]) => ({ id, label, aliases, subs: subs.map(([slug, name]) => ({ slug, label: name })) }))

// Rocket Fresh is a category id on the real site (/np/categories/393760).
export const FRESH = { id: '393760', label: '로켓프레시', subs: [['fruit', '과일'], ['vegetables', '채소'], ['dairy', '우유/유제품'], ['meat', '정육/계란'], ['seafood', '수산/해산'], ['meal', '간편식/반찬']].map(([slug, label]) => ({ slug, label })) }

export const deptById = id => id === FRESH.id ? FRESH : DEPARTMENTS.find(d => d.id === id || d.aliases.includes(id))

// Quick menu (GNB) in page order, live capture 2026-10-13. Off-site entries become local info pages.
export const GNB = [
  ['쿠팡플레이', '/np/coupangplay'], ['로켓배송', '/np/campaigns/82'], ['로켓프레시', '/np/categories/393760'],
  ['다시 구매', '/np/fbi'], ['쿠팡비즈', '/np/coupangbiz'], ['로켓직구', '/np/coupangglobal'], ['골드박스', '/np/goldbox'],
  ['이달의신상', '/p/136938'], ['입점신청', '/np/partners/vendor-signup'], ['판매자특가', '/np/omp'], ['와우회원할인', '/np/campaigns/83'],
  ['반품마켓', '/p/54908'], ['착한상점', '/p/63240'], ['기획전', '/p/bep'], ['쿠팡트래블', '/np/travel'],
]

// 입점신청 dropdown in the top bar.
export const PARTNER_MENU = [
  ['오픈마켓', '/np/partners/marketplace'], ['여행·티켓', '/np/partners/travel'], ['로켓배송', '/np/partners/rocket-supplier'],
  ['제휴마케팅', '/np/partners/affiliate'], ['로켓그로스', '/np/partners/rocket-growth'],
]
export const HELP_MENU = [
  ['자주묻는 질문', '/ssr/desktop/contact/faq'], ['1:1 채팅문의', '/ssr/desktop/contact/inquiry'],
  ['고객의 소리', '/ssr/desktop/contact/voc'], ['취소 / 반품 안내', '/returnPolicy.pang'],
]
export const MY_MENU = [
  ['주문목록', '/ssr/desktop/order/list'], ['취소/반품', '/ssr/desktop/cancel-return-exchange/list'], ['찜 리스트', '/wishInitView.pang'],
]
export const FOOTER_LINKS = [
  ['회사소개', '/np/company'], ['Investor Relations', '/np/investor-relations'], ['인재채용', '/np/careers'],
  ['입점 / 제휴문의', '/np/partnership'], ['공지사항', '/np/notices'], ['고객의 소리', '/ssr/desktop/contact/voc'],
  ['이용약관', '/np/policies/terms'], ['개인정보 처리방침', '/np/policies/privacy'], ['쿠팡페이 이용약관', '/np/policies/coupay'],
  ['위치기반서비스 이용약관', '/np/policies/location'], ['청소년보호정책', '/np/policies/youth'], ['판매자 이용약관', '/np/policies/seller'],
]
