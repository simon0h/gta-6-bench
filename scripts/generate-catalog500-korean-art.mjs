import {mkdir,writeFile} from 'node:fs/promises'
import {KOREAN_RETAIL_SEEDS} from '../lib/expanded-korean-retail.js'
import {esc} from '../lib/html.js'
const dir=new URL('../public/art/catalog500/retail/',import.meta.url)
await mkdir(dir,{recursive:true})
const shapes={
 pack:'<path d="M107 66h146l10 202H97Z"/><path d="M109 80h142M105 251h151" stroke="#fff" stroke-width="5"/><rect x="119" y="117" width="121" height="98" rx="3" fill="#fff" opacity=".8"/><path d="M149 178q32-58 64 0q-32 24-64 0" fill="#73887a"/>',
 bottle:'<rect x="130" y="92" width="100" height="169" rx="23"/><rect x="144" y="58" width="72" height="35" rx="5" fill="#344a57"/><rect x="139" y="148" width="82" height="64" fill="#f9f5eb"/><path d="M159 177h43m-43 12h32" stroke="#9bada7" stroke-width="3"/>',
 jar:'<path d="M109 135h142v114q-71 24-142 0Z"/><ellipse cx="180" cy="133" rx="72" ry="18" fill="#f3ecdf"/><rect x="107" y="114" width="146" height="24" rx="7" fill="#465a68"/><path d="M133 190h94m-94 15h58" stroke="#f8f1df" stroke-width="5"/>',
 bag:'<rect x="78" y="119" width="206" height="143" rx="22"/><path d="M131 123V98q0-69 98 0v25" fill="none" stroke="#4a5867" stroke-width="12"/><path d="M94 154h174M168 159h44" stroke="#e9e2cf" stroke-width="5"/><rect x="153" y="191" width="61" height="42" rx="3" fill="#f9f0dc" opacity=".6"/>',
 cloth:'<path d="M76 114h192l22 138H91Z"/><path d="M87 130h179l12 108H99Z" fill="none" stroke="#f0e7d8" stroke-width="5"/><path d="M92 252l198-1-25 24H71Z" fill="#7d9291"/><path d="M127 130v106m41-106v106m41-106v106m41-106v106" stroke="#f5eada" opacity=".4" stroke-width="3"/>',
 plate:'<ellipse cx="180" cy="191" rx="113" ry="63" fill="#f0eee5" stroke="#c4ccca" stroke-width="4"/><ellipse cx="180" cy="184" rx="80" ry="41" fill="#fffef7" stroke="#cbd3cf" stroke-width="2"/>',
 bowl:'<path d="M74 144q12 118 105 123q94-5 108-123Z" fill="#e9e9e3" stroke="#adbbb8" stroke-width="3"/><ellipse cx="181" cy="144" rx="106" ry="33" fill="#fcfbf6" stroke="#adbbb8" stroke-width="3"/>',
 pot:'<path d="M91 133h178v112q-88 30-178 0Z" fill="#c6cecc" stroke="#7d918f" stroke-width="3"/><ellipse cx="180" cy="133" rx="90" ry="23" fill="#e8eeeb"/><path d="M90 155H58v48h33m181-48h31v48h-31" fill="none" stroke="#738782" stroke-width="9"/><path d="M159 107v-15h44v15" fill="none" stroke="#738782" stroke-width="8"/>',
 pan:'<ellipse cx="151" cy="191" rx="100" ry="65" fill="#a9b9b6"/><ellipse cx="151" cy="181" rx="89" ry="52" fill="#e1e7e0"/><path d="M239 181l82-47" stroke="#536568" stroke-width="19" stroke-linecap="round"/>',
 tools:'<path d="M121 127v125m64-125v125m60-125v125" stroke="#94704b" stroke-width="12" stroke-linecap="round"/><ellipse cx="121" cy="99" rx="25" ry="40" fill="#b89868"/><path d="M163 67h44v70h-44Z" fill="#b89868"/><path d="M224 70v52m20-52v52m20-52v52m-40-10q20 39 40 0" fill="none" stroke="#b89868" stroke-width="9"/>',
 basket:'<path d="M77 124h208l-23 143H98Z"/><path d="M110 120q5-69 47-39m46 0q42-29 47 39" fill="none" stroke="#596f70" stroke-width="11"/><path d="M102 153h159m-153 31h147m-141 31h135m-126 28h117" stroke="#e0e4d5" opacity=".7" stroke-width="5"/>',
 book:'<rect x="109" y="71" width="148" height="203" rx="4" fill="#fff8e8"/><rect x="99" y="61" width="148" height="203" rx="4"/><path d="M121 64v197M143 124h80m-80 23h80m-80 23h61" stroke="#f3ebd6" stroke-width="4"/>',
 brush:'<path d="M138 173v-92q0-28 24-28t24 28v92" fill="#b09870"/><rect x="101" y="159" width="121" height="63" rx="12"/><path d="M109 220v40m15-40v40m15-40v40m15-40v40m15-40v40m15-40v40m15-40v40m15-40v40" stroke="#40525e" stroke-width="8"/>',
 mat:'<path d="M70 134h195l44 119H107Z"/><path d="M78 150h191m-183 17h189m-182 17h189m-182 17h188m-181 17h188m-181 17h188" stroke="#e5e5cc" opacity=".4" stroke-width="2"/>',
 box:'<path d="M74 133l106-42 108 41-108 49Z" fill="#d5be99"/><path d="M74 133l106 48v101L74 235Z" fill="#bba180"/><path d="M180 181l108-49v102l-108 48Z" fill="#d2b994"/><path d="M150 103l108 49M180 183v62" stroke="#f2e6c4" stroke-width="11"/>',
 stand:'<path d="M114 95h151l-48 127H75Z" fill="#bac8c1"/><path d="M187 211l79 58H103l-18-19h126l-45-34" fill="#7d9391"/><path d="M105 205h119" stroke="#526f70" stroke-width="10"/>',
 lamp:'<path d="M177 165v99m-51 0h105" stroke="#58767c" stroke-width="11"/><path d="M133 75h90l38 95H95Z"/><path d="M124 171h113" stroke="#f1ddb1" stroke-width="8"/>',
 ring:'<ellipse cx="180" cy="178" rx="78" ry="76" fill="none" stroke="#687e90" stroke-width="14"/><path d="M82 163h31v33H82zm165 0h31v33h-31z" fill="#a1b1a8"/>',
 toy:'<rect x="76" y="174" width="78" height="84" rx="4" fill="#769a94"/><rect x="158" y="151" width="86" height="107" rx="4" fill="#d1a77c"/><path d="M156 149l46-53 47 53Z" fill="#a3736b"/><circle cx="269" cy="228" r="29" fill="#a7a2c9"/><rect x="176" y="188" width="32" height="36" fill="#f0e0b8"/>',
}
function type(p){const t=p.title
 if(p.department==='food')return 'pack'
 if(/책|노트|플래너|바인더|파일/.test(t))return /받침|스탠드/.test(t)?'stand':'book'
 if(/샴푸|워시|로션|토너|오일|에센스|밀크/.test(t))return 'bottle'
 if(/크림|마스크|밤 |스크럽|젤/.test(t))return 'jar'
 if(/가방|파우치|백팩|토트|더플|슬리브|지갑|미니백|걸이/.test(t))return 'bag'
 if(/세정|청소|브러시|스퀴지|스펀지|닦이/.test(t))return 'brush'
 if(/볼|그릇|식기|반찬|소스|수저|버터|접시/.test(t))return /믹싱|수프|스피너/.test(t)?'bowl':'plate'
 if(/냄비|소스팬|찜기/.test(t))return 'pot'
 if(/팬|베이킹|파이틀|머핀/.test(t))return 'pan'
 if(/뒤집개|가위|거품|해머|도구|망 |스트랩/.test(t))return 'tools'
 if(/함|상자|보관|트레이|서랍/.test(t))return 'box'
 if(/바구니|바스켓|횃대|수거/.test(t))return 'basket'
 if(/매트|패드|가리개/.test(t))return 'mat'
 if(/담요|이불|베개|쿠션|커튼|가운|커버|방석/.test(t))return 'cloth'
 if(/랜턴|전구/.test(t))return 'lamp'
 if(/링|밴드|줄넘기|악력|롤러/.test(t))return 'ring'
 if(/키트|블록|타일|만들기|공작|놀이/.test(t))return 'toy'
 if(/테이블|선반|보드|스탠드/.test(t))return 'stand'
 return 'box'
}
for(const [i,p] of KOREAN_RETAIL_SEEDS.entries()){
 const artType=type(p),color=['#88a49d','#af9379','#8da2b6','#b09baf'][i%4]
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="360" height="340" viewBox="0 0 360 340" role="img" aria-label="${esc(p.title)}"><rect width="360" height="340" fill="#f8f8f5"/><ellipse cx="180" cy="285" rx="110" ry="10" fill="#dfe5df"/><g fill="${color}">${shapes[artType]}</g><text x="180" y="323" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#59676e">${esc(p.brand)}</text></svg>`
 await writeFile(new URL(`${p.id}.svg`,dir),svg)
}
console.log(`Wrote ${KOREAN_RETAIL_SEEDS.length} original Korean merchandise illustrations.`)
