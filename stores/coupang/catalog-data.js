import { applyCatalogPolicy } from '../../lib/catalog-policy.js'
import { expandCatalog } from './catalog500.js'
// Authored, deterministic retail fixtures. No live inventory, endorsements or delivery claims.
export const departments = [
 ['fashion','패션의류 / 잡화','shirt','매일 입는 편안함'],['beauty','뷰티','cosmetics','나를 위한 작은 루틴'],['baby','출산 / 유아동','diapers','함께 자라는 일상'],['food','식품','milk','든든하게 채우는 장바구니'],['kitchen','주방용품','pan','즐거운 요리의 시작'],['home','생활용품','towels','쾌적한 우리 집'],['interior','홈인테리어','lamp','취향을 담은 공간'],['electronics','가전디지털','monitor','생활을 바꾸는 디지털'],['sports','스포츠 / 레저','yoga','가볍게 시작하는 운동'],['automotive','자동차용품','car','차 안의 편안함'],['books','도서 / 음반','book','한 페이지의 즐거움'],['toys','완구 / 취미','blocks','상상력이 자라는 시간'],['stationery','문구 / 오피스','notebook','책상 위의 정리'],['pets','반려동물용품','petfood','반려친구의 건강한 하루'],['health','헬스 / 건강식품','vitamins','꾸준한 건강 습관'],
].map(([id,label,art,headline])=>({id,label,art,headline,parent:null}))
const children = [
 ['games','게임 / 게임기','electronics'],['consoles','게임기','games'],['software','게임 소프트웨어','games'],['accessories','게임 주변기기','games'],['audio','음향기기','electronics'],['computing','컴퓨터 / 주변기기','electronics'],['mobile','모바일 액세서리','electronics'],['appliances','생활가전','electronics'],
 ['milk','우유 / 유제품','food'],['drinks','생수 / 음료','food'],['coffee','커피 / 차','food'],['pantry','라면 / 가공식품','food'],['fresh','신선 / 냉장식품','food'],['snacks','과자 / 견과','food'],
 ['clothing','의류','fashion'],['bags','가방 / 신발','fashion'],['skincare','스킨케어','beauty'],['bodycare','헤어 / 바디','beauty'],['babycare','기저귀 / 물티슈','baby'],['babymeal','유아식 / 수유','baby'],['cookware','냄비 / 조리도구','kitchen'],['tableware','식기 / 보관용기','kitchen'],['cleaning','세제 / 청소','home'],['bath','욕실 / 위생','home'],['lighting','조명 / 소품','interior'],['bedding','침구 / 수납','interior'],['fitness','헬스 / 요가','sports'],['outdoor','캠핑 / 아웃도어','sports'],['carcare','세차 / 차량관리','automotive'],['caraccessories','차량 액세서리','automotive'],['reading','도서','books'],['music','음반','books'],['building','블록 / 만들기','toys'],['play','보드게임 / 인형','toys'],['writing','필기구 / 노트','stationery'],['office','사무용품','stationery'],['petmeal','사료 / 간식','pets'],['petcare','위생 / 장난감','pets'],['supplements','비타민 / 영양제','health'],['wellness','건강용품','health'],
].map(([id,label,parent])=>({id,label,parent}))
export const categoryTree = [...departments,...children]
export const categories = [['all','전체'],...categoryTree.map(c=>[c.id,c.label])]
export const categoryAliases = {'178255':'electronics','395267':'games','194276':'food'}
export const categoryById = id => categoryTree.find(c=>c.id===(categoryAliases[id]||id))
export function categoryPath(id) { const path=[]; let node=categoryById(id); while(node){path.unshift(node);node=categoryById(node.parent)} return path }
export const inCategory = (p,id) => !id||id==='all'||categoryPath(p.category).some(c=>c.id===(categoryAliases[id]||id))
// id, title, price, leaf category, brand, illustration, options, search aliases. Sibling options are not distinct products.
const rows = [
 ['dualsense-white','소니 PS5 듀얼센스 무선 컨트롤러, 화이트',79800,'accessories','Sony','controller','화이트 / 1개','ps5 playstation 게임 패드'],
 ['ps5-console','소니 PlayStation 5 슬림 디스크 에디션',688000,'consoles','Sony','console','1TB / 본체','ps5 플레이스테이션 게임기'],
 ['xbox-console','Xbox Series X 게임 콘솔',678000,'consoles','Microsoft','console','1TB / 블랙','xbox 엑스박스 게임기'],
 ['switch-oled','Nintendo Switch OLED 게임기',379000,'consoles','Nintendo','switch','화이트 / 본체','닌텐도 게임기'],
 ['mario-wonder','닌텐도 슈퍼 마리오브라더스 원더',58900,'software','Nintendo','game','Switch / 한국어','마리오 게임 switch'],
 ['zelda-tears','닌텐도 젤다의 전설 티어스 오브 더 킹덤',64800,'software','Nintendo','game','Switch / 한국어','젤다 게임 switch'],
 ['astro-bot','소니 아스트로봇 PS5 게임',65800,'software','Sony','game','PS5 / 한국어','ps5 게임 astro'],
 ['forza-horizon','포르자 호라이즌 5 Xbox 게임',49800,'software','Microsoft','game','Xbox / 한국어','xbox 레이싱 게임'],
 ['xbox-controller','Xbox 무선 컨트롤러',64800,'accessories','Microsoft','controller','카본 블랙 / 1개','xbox 게임 패드'],
 ['switch-case','게임기 하드 파우치 휴대 케이스',16900,'accessories','GameNest','bag','네이비 / 1개','닌텐도 switch 게임 가방'],
 ['gaming-headset','마이크 일체형 유선 게이밍 헤드셋',35900,'accessories','GameNest','headphones','블랙 / 3.5mm','ps5 xbox pc 게임 헤드폰'],
 ['charging-dock','듀얼 컨트롤러 충전 거치대',22900,'accessories','GameNest','dock','2구 / 화이트','ps5 게임 충전'],
 ['wireless-headphones','블루투스 무선 헤드폰, 블랙',49900,'audio','Soundway','headphones','블랙 / 1개','headphones 오디오 음악'],
 ['bluetooth-speaker','휴대용 방수 블루투스 스피커',29900,'audio','Soundway','speaker','그린 / 1개','speaker 음향 캠핑'],
 ['wireless-earbuds','커널형 무선 이어폰 충전 케이스 포함',39900,'audio','Soundway','earbuds','화이트 / 1세트','earbuds 오디오 음악'],
 ['mechanical-keyboard','텐키리스 기계식 키보드 적축',59900,'computing','Keylab','keyboard','화이트 / 유선','keyboard 컴퓨터 pc 게임'],
 ['wireless-mouse','저소음 무선 마우스',17900,'computing','Keylab','mouse','그레이 / 무선','mouse 컴퓨터 pc'],
 ['monitor-27','27인치 FHD IPS 모니터',179000,'computing','Viewline','monitor','27인치 / 100Hz','monitor 디스플레이 컴퓨터 pc'],
 ['portable-ssd','휴대용 외장 SSD USB-C',109000,'computing','Dataleaf','drive','1TB / 실버','ssd 저장장치 컴퓨터 pc'],
 ['usb-hub','USB-C 6포트 멀티 허브',32900,'computing','Dataleaf','hub','6 in 1 / 그레이','usb 컴퓨터 pc 노트북'],
 ['laptop-stand','알루미늄 접이식 노트북 거치대',24900,'computing','Keylab','stand','실버 / 1개','laptop 컴퓨터 pc'],
 ['charger-65','65W 고속 충전기 듀얼 포트',27900,'mobile','Chargeon','charger','65W / 화이트','charger usb 충전'],
 ['powerbank','10000mAh 보조배터리 USB-C',23900,'mobile','Chargeon','battery','10000mAh / 블랙','battery 충전'],
 ['robot-vacuum','슬림 로봇청소기 물걸레 겸용',219000,'appliances','Cleanmate','vacuum','화이트 / 1대','청소기 vacuum'],
 ['electric-kettle','스테인리스 전기포트 1.7L',26900,'appliances','Cleanmate','kettle','1.7L / 실버','kettle 주전자'],
 ['desk-fan','충전식 탁상용 선풍기',19900,'appliances','Cleanmate','fan','화이트 / 1대','fan 여름'],
 ['milk-10','고소한 멸균우유 1L, 10개',21900,'milk','목장일기','milk','1L / 10팩','milk 우유 유제품 장보기'],
 ['fresh-milk','신선한 냉장 흰우유 900ml, 2개',5980,'milk','목장일기','milk','900ml / 2팩','milk 우유 유제품 장보기'],
 ['lowfat-milk','담백한 저지방 멸균우유 1L, 6개',15900,'milk','목장일기','milk','1L / 6팩','milk 우유 유제품 장보기'],
 ['lactose-free','속편한 락토프리 멸균우유 190ml, 24개',18900,'milk','하루농장','milk','190ml / 24팩','milk 우유 유제품 장보기'],
 ['chocolate-milk','진한 초코우유 200ml, 24개',17900,'milk','하루농장','milk','200ml / 24팩','milk 우유 유제품 장보기'],
 ['oat-drink','고소한 오트 음료 1L, 6개',19900,'milk','그레인하우스','milk','1L / 6팩','우유 oat 귀리 비건 장보기'],
 ['soy-milk','무가당 검은콩 두유 190ml, 24개',14900,'milk','그레인하우스','milk','190ml / 24팩','우유 soy 두유 장보기'],
 ['greek-yogurt','플레인 그릭요거트 450g, 2개',11900,'milk','목장일기','yogurt','450g / 2개','요거트 우유 유제품 장보기'],
 ['water-24','맑은 생수 무라벨, 500ml, 24개',7900,'drinks','맑은샘','water','500ml / 24개','water 물 장보기'],
 ['water-2l','깨끗한 생수 2L, 6개',5900,'drinks','맑은샘','water','2L / 6개','water 물 장보기'],
 ['sparkling-water','라임 탄산수 350ml, 24개',12900,'drinks','맑은샘','water','350ml / 24개','water soda 음료 장보기'],
 ['orange-juice','오렌지 주스 1L, 2개',7900,'drinks','모닝테이블','juice','1L / 2개','juice 주스 음료 장보기'],
 ['coffee-beans','데일리 블렌드 원두커피 1kg',22900,'coffee','로스터리온','coffee','1kg / 홀빈','coffee 카페 장보기'],
 ['drip-coffee','핸드드립백 커피 10g, 30개',14900,'coffee','로스터리온','coffee','10g / 30개','coffee 카페 장보기'],
 ['green-tea','국산 녹차 티백 100개',8900,'coffee','차의시간','tea','1.2g / 100개','tea 차 장보기'],
 ['ramen-20','얼큰한 라면 멀티팩, 20개',15900,'pantry','한끼정원','ramen','20개입','ramen noodle 장보기'],
 ['rice-10kg','국산 백미 쌀 10kg',28900,'pantry','한끼정원','rice','10kg / 1포','rice 곡물 장보기'],
 ['instant-rice','즉석밥 210g, 24개',21900,'pantry','한끼정원','rice','210g / 24개','rice 밥 장보기'],
 ['olive-oil','엑스트라버진 올리브오일 500ml',11900,'pantry','모닝테이블','oil','500ml / 1병','oil 요리 장보기'],
 ['pasta','듀럼밀 스파게티 면 500g, 4개',8900,'pantry','모닝테이블','pasta','500g / 4개','pasta 파스타 장보기'],
 ['canned-tuna','담백한 참치 통조림 100g, 6개',11900,'pantry','한끼정원','can','100g / 6캔','tuna 통조림 장보기'],
 ['eggs-30','신선한 대란 30구',8900,'fresh','하루농장','eggs','30구 / 1판','eggs 달걀 계란 장보기'],
 ['salad-mix','간편 샐러드 채소 믹스 300g',5900,'fresh','하루농장','vegetables','300g / 1봉','salad 채소 장보기'],
 ['bananas','달콤한 바나나 1.2kg',4980,'fresh','하루농장','fruit','1.2kg / 1송이','banana 과일 장보기'],
 ['mixed-nuts','하루 견과 개별포장 20g, 30봉',17900,'snacks','그레인하우스','nuts','20g / 30봉','nuts 간식 장보기'],
 ['oat-cookies','통곡물 오트 쿠키 300g',5900,'snacks','그레인하우스','cookies','300g / 1상자','snack 과자 장보기'],
 ['cotton-shirt','데일리 코튼 라운드 반팔 티셔츠',12900,'clothing','Daywear','shirt','오프화이트 / M','옷 t-shirt 패션'],
 ['linen-shirt','린넨 혼방 오픈칼라 셔츠',24900,'clothing','Daywear','shirt','샌드 / M','옷 shirt 패션'],
 ['canvas-tote','캔버스 숄더 에코백',15900,'bags','Daywear','bag','아이보리 / 1개','가방 bag 패션'],
 ['walking-shoes','가벼운 메쉬 워킹 운동화',34900,'bags','Stride','shoe','그레이 / 260mm','shoes 신발 패션'],
 ['face-cleanser','약산성 데일리 클렌징폼 150ml',9900,'skincare','온스킨','cosmetics','150ml / 1개','beauty 세안 화장품'],
 ['hydrating-serum','히알루론산 수분 세럼 50ml',16900,'skincare','온스킨','dropper','50ml / 1개','beauty 수분 화장품'],
 ['sunscreen','촉촉한 선크림 SPF50+ PA++++ 50ml',13900,'skincare','온스킨','cosmetics','50ml / 1개','beauty 자외선 화장품'],
 ['shampoo','두피 딥클렌징 샴푸 500ml',11900,'bodycare','리프케어','pump','500ml / 1개','hair 헤어 beauty'],
 ['body-wash','시트러스 바디워시 500ml',10900,'bodycare','리프케어','pump','500ml / 1개','body beauty 샤워'],
 ['diapers','편안한 밴드형 기저귀 4단계 64매',24900,'babycare','포근베베','diapers','4단계 / 64매','baby 아기 diaper'],
 ['baby-wipes','도톰한 아기 물티슈 캡형 80매, 10팩',14900,'babycare','포근베베','wipes','80매 / 10팩','baby 아기 wipes'],
 ['baby-bottle','와이드넥 PPSU 젖병 260ml',17900,'babymeal','포근베베','babybottle','260ml / 1개','baby 아기 수유'],
 ['baby-bowl','실리콘 유아 흡착 식판',18900,'babymeal','포근베베','bowl','민트 / 1개','baby 아기 이유식'],
 ['frying-pan','인덕션 세라믹 프라이팬 28cm',22900,'cookware','키친데이','pan','28cm / 1개','kitchen 요리 후라이팬'],
 ['soup-pot','스테인리스 양수 냄비 20cm',29900,'cookware','키친데이','pot','20cm / 1개','kitchen 요리 냄비'],
 ['cooking-tools','실리콘 조리도구 5종 세트',16900,'cookware','키친데이','utensils','5종 / 세이지','kitchen 주걱 국자'],
 ['food-containers','밀폐 보관용기 4종 세트',18900,'tableware','키친데이','containers','4종 / 투명','kitchen 반찬통'],
 ['ceramic-mugs','세라믹 머그컵 350ml, 2개',12900,'tableware','키친데이','mug','350ml / 2개','kitchen 식기 컵'],
 ['towels-5','데일리 코튼 호텔 수건, 5개 세트',18900,'bath','홈그로운','towels','혼합색상 / 5개','수건 towel 욕실'],
 ['tissue','3겹 두루마리 화장지 30롤',15900,'bath','홈그로운','tissue','30m / 30롤','휴지 tissue 욕실'],
 ['laundry-liquid','고농축 액체 세탁세제 2.5L',11900,'cleaning','클린하루','detergent','2.5L / 1개','세탁 laundry 청소'],
 ['dish-soap','순한 주방세제 750ml, 2개',8900,'cleaning','클린하루','pump','750ml / 2개','설거지 dish 청소'],
 ['floor-mop','극세사 밀대 청소기 세트',17900,'cleaning','클린하루','mop','패드 2매 포함','mop 청소'],
 ['desk-lamp','밝기조절 LED 스탠드 조명',24900,'lighting','룸노트','lamp','화이트 / 1개','lamp 인테리어 책상'],
 ['wall-clock','무소음 우드 벽시계',18900,'lighting','룸노트','clock','30cm / 내추럴','clock 인테리어 시계'],
 ['cotton-bedding','코튼 체크 차렵이불 세트',59900,'bedding','룸노트','bedding','싱글 / 블루','침구 이불 인테리어'],
 ['storage-basket','패브릭 수납 바스켓 2개',14900,'bedding','룸노트','basket','대형 / 그레이','정리 storage 인테리어'],
 ['yoga-mat','논슬립 TPE 요가매트 6mm',19900,'fitness','Movefit','yoga','6mm / 라벤더','운동 yoga fitness'],
 ['dumbbells','네오프렌 아령 2kg, 2개',16900,'fitness','Movefit','dumbbells','2kg / 2개','운동 fitness 웨이트'],
 ['camping-chair','접이식 경량 캠핑 의자',29900,'outdoor','Trailway','chair','카키 / 1개','캠핑 camping 의자'],
 ['camping-lantern','충전식 LED 캠핑 랜턴',24900,'outdoor','Trailway','lantern','샌드 / 1개','캠핑 camping 조명'],
 ['car-shampoo','고농축 카샴푸 1L',9900,'carcare','Drivecare','detergent','1L / 1개','세차 car 자동차'],
 ['car-towels','극세사 세차 타월 3개',7900,'carcare','Drivecare','towels','3개 / 그레이','세차 car 자동차'],
 ['car-phone-holder','차량용 송풍구 휴대폰 거치대',14900,'caraccessories','Drivecare','stand','블랙 / 1개','car 자동차 휴대폰'],
 ['cooking-book','한 그릇 집밥: 쉬운 요리 60선',16800,'reading','종이숲','book','종이책 / 224쪽','book 도서 요리'],
 ['travel-book','산책하듯 떠나는 국내 여행',17800,'reading','종이숲','book','종이책 / 288쪽','book 도서 여행'],
 ['piano-album','조용한 오후 피아노 연주집 CD',14900,'music','종이숲','album','CD / 12트랙','music 음반 음악'],
 ['building-blocks','창의력 컬러 블록 320피스',24900,'building','Playgarden','blocks','320피스 / 1세트','toy 완구 블록'],
 ['craft-kit','어린이 종이공작 만들기 키트',12900,'building','Playgarden','craft','12작품 / 1세트','toy 완구 미술'],
 ['board-game','우리 가족 동물 탐험 보드게임',19900,'play','Playgarden','boardgame','2–4인 / 6세 이상','toy 완구 게임'],
 ['plush-bear','포근한 곰인형 35cm',16900,'play','Playgarden','bear','35cm / 브라운','toy 완구 인형'],
 ['gel-pens','부드러운 중성펜 0.5mm 12개',7900,'writing','Paperroom','pens','블랙 / 12개','문구 stationery pen'],
 ['ruled-notebooks','심플 줄노트 A5 5권',6900,'writing','Paperroom','notebook','A5 / 5권','문구 stationery note'],
 ['desk-organizer','메쉬 책상 정리함',12900,'office','Paperroom','organizer','화이트 / 1개','문구 office 수납'],
 ['dog-food','성견용 연어 건식사료 2kg',23900,'petmeal','포포키친','petfood','2kg / 1봉','dog 강아지 사료 pet'],
 ['cat-food','고양이 닭고기 건식사료 2kg',21900,'petmeal','포포키친','petfood','2kg / 1봉','cat 고양이 사료 pet'],
 ['cat-litter','먼지 적은 두부 모래 7L, 3개',17900,'petcare','포포키친','litter','7L / 3개','cat 고양이 모래 pet'],
 ['dog-toy','강아지 코튼 로프 장난감 3종',8900,'petcare','포포키친','rope','3종 / 1세트','dog 강아지 장난감 pet'],
 ['vitamin-c','비타민 C 500mg 60정',11900,'supplements','하루밸런스','vitamins','60정 / 1병','vitamin 건강 영양'],
 ['multivitamin','데일리 멀티비타민 90정',19900,'supplements','하루밸런스','vitamins','90정 / 1병','vitamin 건강 영양'],
 ['heat-pack','전자레인지용 곡물 온열 찜질팩',16900,'wellness','하루밸런스','heatpack','목 / 어깨용','건강 찜질'],
 ['digital-scale','디지털 체중계 강화유리',14900,'wellness','하루밸런스','scale','화이트 / 1개','건강 체중계'],
]
const preservedSku = {'dualsense-white':'CP-PAD-WHITE','wireless-headphones':'CP-AUDIO-01','milk-10':'CP-MILK-10','ramen-20':'CP-RAMEN-20','water-24':'CP-WATER-24','towels-5':'CP-TOWEL-5'}
const departmentSpecs = {
 fashion:{'관리방법':'비슷한 색상끼리 분리 세탁','소재 안내':'선택 옵션 및 상세 구성 참고'}, beauty:{'사용기한':'수령 후 포장 표기 확인','사용방법':'내용물을 적당량 덜어 사용'}, baby:{'사용 안내':'보호자 관찰하에 사용','주의사항':'포장에 표시된 권장 연령 및 체중 확인'}, food:{'보관방법':'직사광선을 피한 서늘한 곳','소비기한':'출고 상품 포장에 별도 표기','식품 표시':'원재료와 알레르기 정보는 포장 확인'}, kitchen:{'관리방법':'중성세제로 세척 후 건조','구성품':'선택 옵션에 표시된 구성'}, home:{'사용 안내':'용도에 맞게 사용','보관방법':'습기와 직사광선을 피하여 보관'}, interior:{'관리방법':'부드러운 천으로 관리','구성품':'본품 및 제품 안내서'}, electronics:{'품질보증':'수령일 기준 1년, 소모품 제외','구성품':'본품 및 사용설명서','호환 안내':'선택한 규격 및 플랫폼 확인'}, sports:{'사용 안내':'사용 전 파손 여부 확인','보관방법':'물기를 제거하고 통풍이 되는 곳에 보관'}, automotive:{'사용 안내':'차량 규격과 장착 위치 확인','구성품':'상품명에 표시된 구성'}, books:{'언어':'한국어','출판 / 제작':'로컬 카탈로그 기획판'}, toys:{'권장 사용':'보호자 관찰하에 사용','주의사항':'작은 부품을 삼키지 않도록 주의'}, stationery:{'용도':'학습 및 사무용','구성품':'상품명에 표시된 구성'}, pets:{'사용 안내':'반려동물의 크기와 연령에 맞게 사용','보관방법':'밀봉하여 서늘한 곳에 보관'}, health:{'섭취 / 사용':'포장에 표시된 섭취량 및 사용방법 확인','제품 안내':'의약품이 아니며 질병의 예방 및 치료용이 아닙니다'},
}
const freshIds = new Set(['fresh-milk','greek-yogurt','eggs-30','salad-mix','bananas'])
export const products = [
 {id:'gta6-ps5',sku:'CP-GTA6-PS5',platform:'ps5',label:'PlayStation 5',title:'Grand Theft Auto VI (GTA 6) — PlayStation 5',price:89800,category:'software',brand:'Rockstar Games',delivery:'seller',rating:0,reviews:0,stock:50,condition:'new',sales:0,newness:120,aliases:'gta 6 gta vi 그랜드 테프트 오토 게임 ps5',seller:'벤치 게임 스토어',specs:{'에디션':'스탠다드','형식':'박스 내 다운로드 코드 · 디스크 미포함','플랫폼':'PlayStation 5'},description:'제이슨과 루시아의 이야기를 따라 레오니다와 바이스 시티를 탐험하는 게임의 모의 예약상품입니다.'},
 {id:'gta6-xbox',sku:'CP-GTA6-XBOX',platform:'xbox',label:'Xbox Series X|S',title:'Grand Theft Auto VI (GTA 6) — Xbox Series X|S',price:89800,category:'software',brand:'Rockstar Games',delivery:'seller',rating:0,reviews:0,stock:50,condition:'new',sales:0,newness:119,aliases:'gta 6 gta vi 그랜드 테프트 오토 게임 xbox',seller:'벤치 게임 스토어',specs:{'에디션':'스탠다드','형식':'박스 내 다운로드 코드 · 디스크 미포함','플랫폼':'Xbox Series X|S'},description:'제이슨과 루시아의 이야기를 따라 레오니다와 바이스 시티를 탐험하는 게임의 모의 예약상품입니다.'},
 ...rows.map(([id,title,price,category,brand,art,label,aliases],i)=>{
  const department=categoryPath(category)[0].id
  const delivery=freshIds.has(id)?'fresh':i%5===3?'seller':'rocket'
  const platform=categoryPath(category).some(c=>c.id==='games')?(aliases.includes('switch')||brand==='Nintendo'?'switch':aliases.includes('xbox')&&brand==='Microsoft'?'xbox':aliases.includes('ps5')?'ps5':'pc'):''
  return {id,sku:preservedSku[id]||`CP-${id.toUpperCase()}`,kind:'other',title,price,category,brand,art,label,aliases,delivery,platform,stock:id==='piano-album'?0:20+i%25,condition:['robot-vacuum','monitor-27','camping-chair'].includes(id)?'open-box':'new',rating:id==='dualsense-white'?4.8:id==='milk-10'?4.9:Number((4.1+(i*3%9)/10).toFixed(1)),reviews:83+i*17%920,sales:1000+(i*193)%9200,newness:i,listPrice:Math.ceil(price*1.15/100)*100,shipping:0,maxQty:4,seller:delivery==='seller'?`${brand} 셀렉트`:'쿠팡 로컬 셀렉트',description:`${title.replace(/, /g,' · ')}. ${categoryById(category).label}에 필요한 구성을 간편하게 만나보세요. ${freshIds.has(id)?'냉장 포장으로 보관하고 개봉 후 빠르게 섭취해 주세요.':'구매 전 구성과 옵션을 확인해 주세요.'}`,specs:{'브랜드':brand,'구성 / 규격':label,...departmentSpecs[department],...(freshIds.has(id)?{'보관방법':'냉장 보관, 수령 후 즉시 냉장고에 보관'}:{})}}
 })
]
const variantTitles={'milk-10':'고소한 멸균우유','dualsense-white':'소니 PS5 듀얼센스 무선 컨트롤러','wireless-headphones':'블루투스 무선 헤드폰','portable-ssd':'휴대용 외장 SSD USB-C','cotton-shirt':'데일리 코튼 라운드 반팔 티셔츠','walking-shoes':'가벼운 메쉬 워킹 운동화','diapers':'편안한 밴드형 기저귀','frying-pan':'인덕션 세라믹 프라이팬','yoga-mat':'논슬립 TPE 요가매트'}
products.push(...expandCatalog(products))
function addVariants(id, variants) {
 const p=products.find(p=>p.id===id)
 p.variants=[{sku:p.sku,label:p.label,price:p.price,stock:p.stock},...variants.map(([suffix,label,price,extra={}])=>({sku:`${p.sku}-${suffix}`,label,price,stock:20,...extra}))]
}
addVariants('milk-10',[['6','1L / 6팩',14900],['24','200ml / 24팩',16900],['48','200ml / 48팩',31900]])
addVariants('dualsense-white',[['BLACK','블랙 / 1개',79800],['BLUE','블루 / 1개',82800]])
addVariants('wireless-headphones',[['CREAM','크림 / 1개',49900]])
addVariants('portable-ssd',[['2TB','2TB / 실버',179000]])
addVariants('cotton-shirt',[['S','오프화이트 / S',12900],['L','오프화이트 / L',12900],['NAVY','네이비 / M',12900]])
addVariants('walking-shoes',[['250','그레이 / 250mm',34900],['270','그레이 / 270mm',34900]])
addVariants('diapers',[['L','5단계 / 56매',24900]])
addVariants('frying-pan',[['24','24cm / 1개',18900]])
addVariants('yoga-mat',[['BLUE','6mm / 블루',19900],['THICK','10mm / 그레이',26900]])
export const bySku = sku => {for(const p of products){if(p.variants){const v=p.variants.find(v=>v.sku===sku);if(v)return {...p,...v,title:`${variantTitles[p.id]}, ${v.label}`,description:p.description.replace(p.title.replace(/, /g,' · '),`${variantTitles[p.id]} · ${v.label}`),listPrice:Math.ceil(v.price*1.15/100)*100,specs:{...p.specs,'구성 / 규격':v.label}}}else if(p.sku===sku)return p}return undefined}
export const unitPrice = p => {
 const match=p.label.match(/([\d.]+)(ml|L) \/ (\d+)(팩|개)/)
 if(!match)return ''
 const ml=Number(match[1])*(match[2]==='L'?1000:1)*Number(match[3])
 return `100ml당 ${Math.round(p.price/ml*100).toLocaleString('en-US')}원`
}
export const campaigns = [
 {id:'digital-week',title:'가전디지털 위크',headline:'우리집 디지털 생활의 시작',copy:'책상 위부터 거실까지, 필요한 디지털을 한곳에서',category:'electronics',art:'monitor-27',color:'#e1eafc'},
 {id:'pantry',title:'식탁을 채우는 장보기',headline:'오늘도 든든한 한 끼',copy:'우유와 생수부터 간편식까지 한 번에 준비하세요',category:'food',art:'milk-10',color:'#fff0d8'},
 {id:'home-refresh',title:'우리집 새단장',headline:'작은 변화로 기분 좋은 집',copy:'조명과 수납, 포근한 침구를 만나보세요',category:'interior',art:'desk-lamp',color:'#e9f1e5'},
 {id:'beauty-picks',title:'뷰티 루틴',headline:'매일 나를 돌보는 시간',copy:'클렌징부터 보습까지, 나만의 데일리 루틴',category:'beauty',art:'hydrating-serum',color:'#fce6eb'},
 {id:'weekend-outdoors',title:'주말의 취미',headline:'가볍게 떠나는 주말',copy:'몸과 마음이 즐거운 운동 · 캠핑 용품',category:'sports',art:'camping-chair',color:'#e1f1f1'},
 {id:'pet-days',title:'반려친구의 하루',headline:'함께라서 더 좋은 매일',copy:'맛있는 한 끼부터 신나는 놀이까지',category:'pets',art:'dog-food',color:'#f8edd8'},
 {id:'rocket',title:'로켓배송',headline:'필요한 일상을 빠르게',copy:'로켓배송으로 만나는 생활 필수품. 도착일은 주문 확인 화면에서 확인하세요.',delivery:'rocket',art:'water-24',color:'#e0f2ff'},
 {id:'rocket-fresh',title:'로켓프레시',headline:'신선하게 채우는 냉장고',copy:'냉장 우유, 채소, 계란. 냉장 보관이 필요한 상품을 골라보세요.',delivery:'fresh',art:'salad-mix',color:'#dcf3dd'},
 {id:'gold-box',title:'골드박스',headline:'알뜰한 장바구니 발견',copy:'부담 없이 담는 2만원 이하 추천 상품',max:'20000',art:'ceramic-mugs',color:'#fff0b7'},
 {id:'seller-deals',title:'판매자 특가',headline:'브랜드 셀렉트 모아보기',copy:'판매자 배송으로 만나는 다양한 상품',delivery:'seller',art:'towels-5',color:'#f5e9dd'},
 {id:'returned',title:'반품 / 리퍼',headline:'꼼꼼하게 고르는 오픈박스',copy:'포장 개봉 이력이 있는 상품입니다. 상품별 상태를 확인하세요.',condition:'open-box',art:'robot-vacuum',color:'#e8ebef'},
 {id:'new-arrivals',title:'신상품',headline:'새로 만나는 발견',copy:'최근 카탈로그에 추가된 상품을 둘러보세요',sort:'newest',art:'digital-scale',color:'#e9e5f7'},
]

// No legacy authored item has verified purchase evidence in reference mode.
applyCatalogPolicy('coupang', products, {})
