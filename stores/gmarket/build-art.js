// Generate original, code-native catalog illustrations. No external image dependency.
import { mkdirSync, writeFileSync } from 'node:fs'
import { products } from './data.js'
const out = new URL('./public/catalog/',import.meta.url)
mkdirSync(out,{recursive:true})
const e=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]))
function drawing(p){
 const c=p.color, light='#f4eee4', dark='#263b46'
 const box=(x,y,w,h,r=8,fill=c)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"/>`
 const circle=(x,y,r,fill=c)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`
 const path=(d,fill=c,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`
 const line=(x1,y1,x2,y2,stroke=dark,sw=5)=>`<path d="M${x1} ${y1}L${x2} ${y2}" stroke="${stroke}" stroke-width="${sw}" fill="none"/>`
 const types={
 shirt:()=>path('M130 65L75 92 43 154 94 177 117 133 117 273 282 273 282 133 307 177 357 153 325 91 270 65 247 85 153 85Z')+path('M153 65L199 92 247 65 237 119 199 95 163 119',light)+line(199,95,199,270,'#ffffff66',2),
 cardigan:()=>path('M132 65L77 95 58 278 103 284 122 144 119 281 282 281 279 144 300 284 345 278 324 95 270 65 202 121Z')+line(202,121,202,280,light,7)+[152,188,224,260].map(y=>circle(205,y,4,dark)).join(''),
 jacket:()=>path('M132 78L76 105 43 263 98 274 126 151 122 287 280 287 275 151 306 274 361 263 326 105 270 78 247 110 154 110Z')+path('M155 102Q140 28 201 31Q265 28 247 102L201 130Z',dark)+line(201,124,201,285,light,5)+line(140,193,160,218,light,4)+line(243,218,264,193,light,4),
 pants:()=>path('M125 48L277 48 292 284 223 291 202 146 179 291 108 284Z')+line(129,82,273,82,light,3)+line(203,52,202,143,light,2)+line(145,87,129,120,light,2),
 shoe:()=>path('M54 221L100 125 151 135 168 173 255 188 326 223Q353 243 334 262L62 265Q43 253 54 221Z')+path('M50 240Q168 260 344 236L338 268 57 272Z',light)+[0,1,2,3].map(i=>line(157+i*21,178+i*4,147+i*21,201+i*4,light,6)).join(''),
 sandal:()=>path('M53 228Q54 171 195 187L327 226Q368 265 299 276L79 270Z',dark)+path('M99 182L138 118 189 136 163 211Z')+path('M243 199L266 151 311 171 312 228Z')+box(144,158,34,22,3,light),
 loafer:()=>path('M58 180Q82 100 176 138L214 189 299 197Q359 216 335 259L78 265Q48 237 58 180Z')+path('M68 242Q162 266 337 239L338 271 64 275Z',dark)+line(196,184,274,204,light,9),
 backpack:()=>box(104,91,195,205,42)+path('M148 103V76Q200 35 252 76V103','none',`stroke="${dark}" stroke-width="16"`)+box(127,201,150,77,14,dark)+line(139,219,265,219,light,3)+line(137,153,266,153,light,3),
 tote:()=>path('M96 121H305L289 288H111Z')+path('M143 133V83Q200 22 259 83V133','none',`stroke="${dark}" stroke-width="13"`)+box(152,178,97,65,4,light),
 wallet:()=>box(79,105,252,153,18)+box(94,124,222,26,4,dark)+box(107,162,93,18,3,light)+line(94,210,316,210,'#ffffff77',2),
 serum:()=>box(157,51,87,51,8,dark)+box(178,23,45,44,14,dark)+box(136,100,128,186,25)+box(150,161,99,80,3,light)+line(168,187,232,187,dark,4)+line(177,203,225,203,dark,3),
 tube:()=>path('M132 66H271L253 255H150Z')+box(151,253,101,40,7,dark)+box(155,127,91,93,2,light)+line(170,159,230,159,c,5)+line(180,177,220,177,c,3),
 brushes:()=>[0,1,2,3,4].map((i)=>box(85+i*47,139+i%2*22,14,150-i%2*22,5,dark)+path(`M${75+i*47} 146Q${64+i*47} ${60+i%3*12} ${92+i*47} ${53+i%3*12}Q${121+i*47} ${60+i%3*12} ${107+i*47} 146Z`)).join(''),
 diaper:()=>box(88,78,230,212,24,light)+box(88,177,230,80,0)+circle(203,139,32,'#e6be77')+path('M121 188Q200 222 279 188L265 266 230 268 217 243 185 243 172 268 138 266Z',light),
 wipes:()=>box(64,119,279,129,25)+box(126,104,156,60,22,light)+box(149,119,110,29,13,dark)+line(113,200,290,200,light,4),
 'baby-bottle':()=>box(151,103,100,183,25,light)+box(150,92,102,39,10)+path('M169 91V71Q179 51 190 52V32Q205 15 217 34V53Q240 59 234 91Z','#e9bf9c')+[160,180,200,220,240].map(y=>line(217,y,239,y,c,4)).join(''),
 blocks:()=>[ [81,173,93,89],[170,112,124,150],[110,72,81,67],[256,207,80,61] ].map(([x,y,w,h],i)=>box(x,y,w,h,6,[c,'#d3a457','#bd7060','#6d98a2'][i])+box(x+13,y-15,w-26,16,4,[c,'#d3a457','#bd7060','#6d98a2'][i])+line(x+9,y+h-9,x+w-9,y+h-9,'#0002',3)).join(''),
 puzzle:()=>box(80,70,242,220,8,light)+path('M95 263L157 147 202 205 258 110 312 263Z')+circle(142,110,22,'#ddb674')+line(199,76,199,285,'#fff',4)+line(84,178,318,178,'#fff',4),
 bear:()=>circle(131,94,34)+circle(272,94,34)+circle(201,132,78)+circle(201,228,71)+circle(125,252,42)+circle(277,252,42)+circle(175,132,7,dark)+circle(230,132,7,dark)+circle(204,164,27,light)+circle(204,157,9,dark),
 train:()=>box(56,171,114,72,10)+box(155,111,94,132,8)+box(172,132,59,48,5,light)+box(240,183,108,60,6,'#d3a457')+[86,139,192,280,323].map(x=>circle(x,251,20,dark)+circle(x,251,8,light)).join('')+box(70,123,22,54,4),
 rice:()=>path('M124 50H277L292 290H106Z',light)+box(122,114,153,116,5)+path('M167 203Q147 163 178 131M175 188L196 160M211 215Q210 160 237 142','none','stroke="#efe1b4" stroke-width="6"')+line(129,60,273,60,c,4),
 apples:()=>[ [126,190],[262,187],[194,123] ].map(([x,y],i)=>circle(x-17,y,45,['#b45743','#8b9d55','#c26f4f'][i])+circle(x+18,y,44,['#b45743','#8b9d55','#c26f4f'][i])+path(`M${x} ${y-41}q-8-27 2-32`,'none','stroke="#73583c" stroke-width="6"')+path(`M${x} ${y-56}q33-27 32 3q-21 7-32-3`,'#6b8c57')).join(''),
 vegetables:()=>[0,1,2,3].map(i=>`<ellipse cx="${130+i*43}" cy="${138+i%2*85}" rx="36" ry="80" transform="rotate(${35-i*18} ${130+i*43} ${138+i%2*85})" fill="${['#ac716c','#906568','#bb7f72','#9d6966'][i]}"/>`).join(''),
 coffee:()=>path('M131 53H273L292 290H110Z','#806451')+box(122,127,158,111,3,light)+circle(201,180,31,c)+path('M207 155Q178 180 201 208','none',`stroke="${light}" stroke-width="5"`)+line(137,72,269,72,light,3),
 oil:()=>box(174,48,57,105,12,'#58654a')+box(143,133,119,157,20,'#87956a')+box(176,32,52,39,5,dark)+box(153,183,99,64,3,light),
 oats:()=>box(128,59,151,228,5,'#d2b981')+box(131,64,145,18,4,light)+box(139,109,129,133,4,light)+path('M169 215L229 129M191 184L169 163M205 165L224 180','none',`stroke="${c}" stroke-width="5"`),
 tea:()=>box(78,102,247,175,7)+box(78,102,247,28,2,dark)+box(112,150,180,100,4,light)+path('M153 225Q153 144 244 166Q248 234 153 225Z','#8fa783')+line(160,217,227,175,light,3),
 pan:()=>`<ellipse cx="166" cy="197" rx="113" ry="70" fill="${dark}"/><ellipse cx="164" cy="188" rx="100" ry="59" fill="#647578"/>`+path('M260 175L351 104Q367 101 368 120L273 204Z',c),
 pot:()=>path('M90 138H313L291 272H113Z','#a7b3b8')+`<ellipse cx="201" cy="138" rx="112" ry="28" fill="${light}"/>`+path('M75 162H53V215H98M323 162H348V215H306','none',`stroke="${dark}" stroke-width="12"`)+box(166,82,71,24,11,dark)+path('M91 134Q123 101 198 101Q271 101 313 134Z',c),
 containers:()=>[[61,178,147,101],[160,101,171,109],[232,222,108,62]].map(([x,y,w,h])=>box(x,y,w,h,12,'#d4e5e1')+box(x-5,y-8,w+10,22,8,c)+line(x+12,y+40,x+w-12,y+40,'#fff',4)).join(''),
 quilt:()=>box(72,102,267,153,14)+path('M76 202L331 202 306 285H62Z',light)+[100,140,180,220,260,300].map(x=>line(x,114,x,250,'#ffffff44',3)).join('')+box(91,76,101,58,13,light)+box(209,76,107,58,13,light),
 lamp:()=>box(171,265,70,15,8,dark)+box(197,154,15,113,2,'#b19068')+path('M122 65H284L321 179H85Z',light)+path('M89 179H320','none',`stroke="${c}" stroke-width="10"`),
 notebooks:()=>[0,1,2].map(i=>`<g transform="rotate(${i*9-9} 200 170)">${box(103+i*8,62+i*15,179,216,6,[light,c,dark][i])}${line(125+i*8,64+i*15,125+i*8,274,'#ffffff77',2)}${box(161,127+i*18,78,45,0,light)}</g>`).join(''),
 pens:()=>[0,1,2,3,4,5,6].map(i=>box(93+i*32,88,15,174,5,['#c88484','#d6ae73','#a3b279','#84aaa6','#829fb5','#a599b6',dark][i])+path(`M${93+i*32} 262L${100+i*32} 286 ${108+i*32} 262Z`,dark)+box(93+i*32,61,15,60,4,light)).join(''),
 petfood:()=>path('M115 51H287L306 293H96Z')+box(110,132,182,103,3,light)+circle(201,191,24,dark)+[ [173,157],[202,147],[230,157] ].map(([x,y])=>circle(x,y,12,dark)).join(''),
 rope:()=>[ [122,170],[246,128],[251,241] ].map(([x,y],i)=>path(`M${x-55} ${y-20}Q${x} ${y+50} ${x+60} ${y-20}`,'none',`stroke="${[c,'#c89468','#9dabc0'][i]}" stroke-width="25" stroke-linecap="round"`)+circle(x-56,y-20,24,light)+circle(x+61,y-20,24,light)).join(''),
 game:()=>box(109,51,183,239,7,dark)+box(116,58,169,29,2,p.title.startsWith('Xbox')?'#478d4a':'#e5ecf2')+path('M117 216L183 115 225 173 286 131V281H117Z',c)+circle(243,126,28,'#dcb476')+`<text x="200" y="259" text-anchor="middle" fill="white" font-size="20" font-family="sans-serif" font-weight="bold">${e(p.sku==='gta5-xbox'?'GTA V':p.title.includes('GTA6')?'GTA VI':p.title.includes('아스트로')?'ASTRO':p.title.includes('마인크래프트')?'MINECRAFT':p.title.includes('호라이즌')?'HORIZON':'RACING')}</text>`,
 console:()=>p.sku==='gm-switch'?box(86,91,236,164,12,dark)+box(98,104,211,133,4,c)+box(58,90,52,167,22,light)+box(300,90,52,167,22,light)+circle(84,141,14,dark)+circle(326,211,14,dark):path('M148 47L195 65 183 287 117 287Z',light)+path('M199 60L251 43 287 287 191 287Z',light)+path('M184 60H210L230 287H162Z',dark)+line(220,241,266,241,dark,4),
 controller:()=>path('M98 120Q50 172 55 247Q67 296 127 229H271Q331 296 345 247Q352 172 304 120Z',light)+path('M109 165H294L269 233H131Z',dark)+circle(154,207,21,dark)+circle(248,207,21,dark)+line(112,139,112,179,dark,9)+line(93,159,132,159,dark,9)+[ [288,144],[270,162],[304,162],[288,180] ].map(([x,y])=>circle(x,y,6,c)).join(''),
 headphones:()=>path('M109 197V139Q109 44 204 44Q299 44 299 139V197','none',`stroke="${dark}" stroke-width="28"`)+box(79,170,66,107,23,c)+box(269,170,66,107,23,c)+box(126,172,22,102,9,dark)+box(264,172,22,102,9,dark),
 dock:()=>path('M91 160H306L333 244 309 265H86L66 244Z',dark)+box(111,130,67,83,8)+box(227,130,67,83,8)+line(106,237,300,237,'#91caaf',5),
 gamecase:()=>box(75,89,260,198,7,dark)+[0,1,2,3,4,5,6,7].map(i=>box(86+i*30,107,20,146,1,[c,light,'#a4b2b3'][i%3])).join(''),
 keyboard:()=>box(51,121,300,134,11,dark)+Array.from({length:40},(_,i)=>box(65+i%10*28,135+Math.floor(i/10)*24,22,17,3,i%7===0?c:light)).join('')+box(148,231,126,15,2,c),
 mouse:()=>`<ellipse cx="201" cy="177" rx="75" ry="117" fill="${c}"/>`+line(201,62,201,159,light,3)+box(192,95,17,37,8,dark)+path('M130 162H272','none',`stroke="${light}" stroke-width="3"`),
 monitor:()=>box(47,54,312,195,7,dark)+box(57,64,292,172,2,c)+path('M57 217L145 122 211 185 274 103 349 174V235H57Z','#a8c4c0')+box(191,243,24,43,2,dark)+box(138,283,134,13,4,dark),
 ssd:()=>box(106,84,192,187,19,dark)+box(124,99,155,151,11)+box(160,132,82,34,4,light)+path('M295 165Q368 159 348 92L321 75','none',`stroke="${dark}" stroke-width="11"`),
 speaker:()=>box(80,110,247,162,48,c)+Array.from({length:64},(_,i)=>circle(110+i%16*12,144+Math.floor(i/16)*27,2,'#ffffff77')).join('')+line(174,122,227,122,dark,4),
 earbuds:()=>box(103,171,204,106,37,light)+path('M105 184Q102 120 152 127H258Q312 125 304 184Z',c)+[147,235].map(x=>circle(x,86,22,light)+box(x-11,82,22,66,10,light)).join('')+circle(205,224,5,c),
 kettle:()=>path('M121 99H246L276 265Q200 294 106 265Z',light)+path('M243 129H293Q334 185 276 218','none',`stroke="${dark}" stroke-width="19"`)+path('M123 132L72 112 107 191Z',c)+box(139,81,92,22,5,dark)+box(95,270,192,17,7,dark),
 vacuum:()=>path('M94 63L174 81 260 232 208 264Z',c)+box(230,240,91,43,10,dark)+path('M136 100L237 95 268 171 223 187Z',dark)+box(85,56,69,23,5,light),
 mat:()=>path('M94 105L293 108 336 279H56Z',c)+`<ellipse cx="196" cy="108" rx="103" ry="34" fill="${light}"/><ellipse cx="196" cy="108" rx="91" ry="23" fill="${c}"/>`+line(88,239,311,239,'#ffffff44',2),
 dumbbell:()=>[0,1].map(i=>`<g transform="translate(${i*92-38} ${i*70-20}) rotate(-25 180 170)">${box(136,151,100,31,10,c)}${box(109,102,44,132,14,c)}${box(224,102,44,132,14,c)}${box(104,127,51,78,10,dark)}${box(221,127,51,78,10,dark)}</g>`).join(''),
 bands:()=>[0,1,2,3].map(i=>`<ellipse cx="${140+i*43}" cy="${174+i*8}" rx="48" ry="100" fill="none" stroke="${[c,'#b28186','#ccad75','#809eb0'][i]}" stroke-width="19" transform="rotate(22 ${140+i*43} 174)"/>`).join(''),
 bottle:()=>box(149,88,107,202,25,c)+box(159,58,87,42,8,dark)+path('M193 56V36H221V56','none',`stroke="${dark}" stroke-width="10"`)+box(166,137,75,92,3,light),
 tent:()=>path('M41 264L197 73 359 264Z',c)+path('M197 73L249 264H144Z',dark)+path('M197 92L211 249H161Z',light)+line(198,72,354,265,light,3)+line(41,266,361,266,dark,5),
 chair:()=>path('M105 87H291L272 203H123Z',c)+path('M123 203H272L298 235H99Z',c)+line(109,83,288,286,dark,9)+line(286,83,104,286,dark,9)+line(89,146,141,160,dark,10)+line(260,160,311,146,dark,10),
 lantern:()=>path('M138 103V71Q204 4 267 71V103','none',`stroke="${dark}" stroke-width="9"`)+box(130,115,143,161,32,light)+box(124,98,156,35,12,c)+box(124,257,156,28,9,c)+line(151,139,151,256,dark,6)+line(254,139,254,256,dark,6),
 carholder:()=>box(139,55,124,145,25,dark)+circle(201,121,41,c)+box(185,193,34,59,8,dark)+box(130,246,143,31,12,dark),
 wash:()=>box(67,92,143,129,10,light)+box(107,122,142,130,10,c)+box(154,154,142,129,10,'#8caeba')+path('M291 78Q348 100 335 198L299 211 271 145Z',c),
 pump:()=>box(109,104,169,181,16,c)+box(126,127,133,60,5,dark)+box(141,139,102,30,3,'#c2d7c7')+path('M263 114Q363 15 342 238','none',`stroke="${dark}" stroke-width="12"`)+box(320,232,38,27,5,dark),
 drill:()=>path('M105 81H252L299 116 288 167H211L227 245H152L133 157H88Z',c)+box(57,98,58,52,6,dark)+box(20,115,50,17,3,'#aaa')+box(143,236,109,42,9,dark)+box(206,174,29,37,7,dark)+line(127,100,204,100,dark,5),
 toolbox:()=>box(69,117,268,161,13,c)+path('M156 121V77H250V121','none',`stroke="${dark}" stroke-width="14"`)+line(76,176,330,176,dark,6)+box(111,158,31,53,4,light)+box(266,158,31,53,4,light),
 gloves:()=>[0,1].map(i=>`<g transform="translate(${i*126-46} ${i*20}) rotate(${i?15:-15} 170 160)">${path('M141 273L118 215 82 168Q75 142 97 150L118 177V84Q127 61 138 84V148 65Q150 44 160 64V145 68Q177 46 182 69V152 91Q199 76 204 96L206 203 183 273Z',light)}${box(130,251,67,35,3,c)}</g>`).join(''),
 book:()=>box(99,50,201,245,4,c)+box(108,59,180,224,2,light)+box(108,59,180,65,0,c)+path('M109 277L164 176 209 209 265 150 288 227V282Z',c)+line(124,142,257,142,dark,4)+line(124,154,223,154,dark,3),
 suitcase:()=>box(169,34,68,69,9,dark)+box(181,46,44,60,0,light)+box(105,92,201,198,24,c)+[140,175,210,245,280].map(x=>line(x,116,x,269,'#ffffff55',4)).join('')+circle(141,293,12,dark)+circle(271,293,12,dark),
 pouches:()=>[[60,84,173,128],[163,143,162,128],[90,226,123,64]].map(([x,y,w,h],i)=>box(x,y,w,h,14,[c,light,'#99aa9c'][i])+line(x+12,y+22,x+w-12,y+22,dark,3)).join(''),
 neckpillow:()=>path('M199 102Q126 102 127 190Q138 235 157 205L154 171Q196 136 240 172L237 205Q260 236 277 190Q282 31 198 40Q67 38 77 211Q94 318 166 273L198 223 232 273Q321 316 329 201Q328 90 270 55L250 101Q282 174 268 207','none',`stroke="${c}" stroke-width="39" stroke-linecap="round"`),
 milk:()=>[0,1,2].map(i=>box(86+i*73,97+i%2*26,63,175,4,light)+path(`M${86+i*73} ${97+i%2*26}l15-32h35l13 32Z`,c)+box(91+i*73,160+i%2*22,54,58,1,c)).join(''),
 ramen:()=>[0,1,2].map(i=>box(68+i*32,88+i*47,211,100,10,['#be674c','#d6a264','#93504a'][i])+box(106+i*32,110+i*47,133,54,6,light)+line(115+i*32,130+i*47,228+i*32,130+i*47,'#bd7c44',5)).join(''),
 water:()=>[0,1,2,3].map(i=>box(71+i*69,117+i%2*20,56,162,12,'#c1dce4')+box(81+i*69,76+i%2*20,37,50,10,'#c1dce4')+box(81+i*69,75+i%2*20,37,20,3,c)+box(72+i*69,175+i%2*10,55,50,1,light)).join(''),
 towels:()=>[0,1,2,3].map(i=>box(74+i%2*10,236-i*44,251,48,10,[light,c,'#b9c6bd','#ccc0b0'][i])+line(90,257-i*44,306,257-i*44,'#ffffff77',3)).join(''),
 }
 return (types[p.illustration]||types.book)()
}
for(const p of products.filter(p=>!p.catalogArt)){
 const art=drawing(p)
 const shell=content=>`<svg xmlns="http://www.w3.org/2000/svg" width="640" height="540" viewBox="0 0 400 340" role="img" aria-label="${e(p.title)}"><rect width="400" height="340" fill="#f4f4f0"/><ellipse cx="201" cy="301" rx="137" ry="15" fill="#000" opacity=".07"/>${content}</svg>`
 writeFileSync(new URL(`${p.sku}.svg`,out),shell(art))
 writeFileSync(new URL(`${p.sku}-detail.svg`,out),shell(`<g transform="translate(99 -8) scale(.75)">${art}</g><rect x="19" y="226" width="362" height="96" rx="8" fill="white"/>${p.specs.slice(0,3).map(([k,v],i)=>`<text x="35" y="${249+i*26}" fill="#334b4d" font-family="sans-serif" font-size="12">${e(k)}  ${e(v)}</text>`).join('')}`))
}
console.log(`Generated ${products.length*2} original catalog illustrations.`)
