// Specific equipment forms for the shared synthetic product gallery.
// The caller supplies a deterministic appearance model and a 640 × 520 art area.
const esc = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]))
const attrs = o => Object.entries(o).filter(([,v])=>v!==undefined).map(([k,v])=>` ${k}="${esc(v)}"`).join('')
const tag=(name,o,body='')=>`<${name}${attrs(o)}>${body}</${name}>`
const rect=(x,y,width,height,fill,rx=0,o={})=>tag('rect',{x,y,width,height,fill,rx,...o})
const circle=(cx,cy,r,fill,o={})=>tag('circle',{cx,cy,r,fill,...o})
const ellipse=(cx,cy,rx,ry,fill,o={})=>tag('ellipse',{cx,cy,rx,ry,fill,...o})
const line=(x1,y1,x2,y2,stroke,width=3)=>tag('line',{x1,y1,x2,y2,stroke,'stroke-width':width,'stroke-linecap':'round'})
const path=(d,fill='none',stroke='#24333d',width=3,o={})=>tag('path',{d,fill,stroke,'stroke-width':width,'stroke-linecap':'round','stroke-linejoin':'round',...o})
const poly=(points,fill,o={})=>tag('polygon',{points,fill,...o})
const text=(value,x,y,size=15,fill='#27313d',o={})=>tag('text',{x,y,'font-family':'Arial, sans-serif','font-size':size,fill,...o},esc(value))
const group=(body,transform,o={})=>tag('g',{transform,...o},body)
const repeat=(n,fn)=>Array.from({length:n},(_,i)=>fn(i)).join('')
const dark='#26333d',light='#ecf0ee',steel='#9aa9b3',glass='#9fc9d4',paper='#f7f5ee'
const n=(p,key,min,max)=>Math.round(p.n(key,min,max)*10)/10
const has=(p,re)=>re.test(p.t||p.title?.toLowerCase()||'')
const shadow=(x=321,y=446,w=176)=>ellipse(x,y,w,17,'#122433',{opacity:.11})
const desk=()=>rect(42,430,556,19,'#b79c78',4)+rect(71,449,19,65,'#8a785d')+rect(548,449,19,65,'#8a785d')
const grille=(x,y,columns,rows,color=dark)=>repeat(rows,r=>repeat(columns,c=>rect(x+c*14,y+r*10,7,3,color,1)))
const ports=(x,y,count=3)=>repeat(count,i=>rect(x+i*37,y,26,14,dark,2)+rect(x+3+i*37,y+3,20,5,steel,1))
function desktop(p,v){
 const mini=has(p,/mini|micro/),allinone=has(p,/all.in.one|counter|monitor/),towerHeight=n(p,'caseHeight',228,291),towerWidth=n(p,'caseWidth',112,148)
 if(allinone){
  const screen=rect(132,115,369,245,p.c,13)+rect(146,130,340,213,dark,3)+poly('148,342 148,259 259,165 399,343',p.accent,{opacity:.7})+circle(351,206,35,'#c8d9d4')+line(316,360,316,415,p.c,22)+rect(229,409,176,12,p.c,5)
  return (v===2?desk():shadow())+(v===1?rect(147,112,340,253,p.c,16)+grille(201,151,17,7)+ports(250,294,4)+line(317,366,317,415,steel,22)+rect(234,409,167,12,steel,5):v===3?screen+group(ports(0,0,4),'translate(250,374)'):screen)
 }
 if(mini){
  const width=n(p,'miniWidth',212,257),height=n(p,'miniHeight',83,132),x=318-width/2,y=296-height/2
  const box=poly(`${x},${y} ${x+45},${y-38} ${x+width+45},${y-38} ${x+width},${y}`,steel)+poly(`${x+width},${y} ${x+width+45},${y-38} ${x+width+45},${y+height-31} ${x+width},${y+height}`,dark)+rect(x,y,width,height,p.c,8)
  return (v===2?desk():shadow(329,410,172))+(v===1?box+ports(x+24,y+height/2,Math.floor(width/48))+grille(x+20,y+20,Math.floor(width/16),2):box+circle(x+width-27,y+height/2,8,p.accent)+ports(x+21,y+height/2-7,has(p,/dual.network/)?2:3)+(v===3?poly(`${x+9},${y-16} ${x+40},${y-70} ${x+width+33},${y-70} ${x+width-8},${y-16}`,p.c)+grille(x+61,y-56,8,2):''))
 }
 const x=265-towerWidth/2,y=418-towerHeight
 const body=rect(x,y,towerWidth,towerHeight,p.c,8)+poly(`${x+towerWidth},${y} ${x+towerWidth+69},${y-37} ${x+towerWidth+69},${418-37} ${x+towerWidth},418`,dark)+poly(`${x},${y} ${x+69},${y-37} ${x+towerWidth+69},${y-37} ${x+towerWidth},${y}`,steel)
 const front=circle(x+towerWidth-24,y+23,6,p.accent)+ports(x+13,y+46,2)+(has(p,/optical/)?rect(x+12,y+77,towerWidth-24,27,dark,2):'')+grille(x+17,y+towerHeight-127,Math.floor(towerWidth/15)-1,10)+rect(x+13,418,23,10,dark)+rect(x+towerWidth-35,418,23,10,dark)
 const rear=rect(x+13,y+17,towerWidth-26,towerHeight-34,dark,5)+circle(x+towerWidth/2,y+68,37,steel)+repeat(7,i=>line(x+24,y+40+i*9,x+towerWidth-24,y+40+i*9,dark,4))+ports(x+18,y+131,2)+rect(x+19,y+towerHeight-47,32,21,steel,3)
 return shadow()+body+(v===1?rear:front)+(v===2?poly(`${x+towerWidth+8},${y+28} ${x+towerWidth+60},${y+1} ${x+towerWidth+60},363 ${x+towerWidth+8},391`,glass,{opacity:.6})+circle(x+towerWidth+35,y+94,17,p.accent)+circle(x+towerWidth+35,y+174,17,p.accent):'')+(v===3?group(rect(0,0,79,163,steel,2)+grille(10,15,4,12),'translate(443,239) rotate(8)'):'')
}
function router(p,v){
 const wall=has(p,/wall.plate|outdoor/),pair=has(p,/pair/),switcher=has(p,/switch|wired/),usb=has(p,/usb.*adapter/),hotspot=has(p,/hotspot/),powerline=has(p,/powerline/)
 if(usb)return shadow(327,412,133)+group(rect(237,215,125,94,p.c,13)+rect(208,236,33,48,steel,2)+rect(210,245,8,27,dark)+path(v===1?'M358 237l107-106':'M358 237l31-144','none',p.c,17)+circle(357,238,12,steel)+(v===2?rect(230,337,250,19,'#afb4ba',3)+rect(322,305,144,24,dark,2):''),v===1?'rotate(14 320 265)':'')
 if(wall)return (v===2?rect(84,64,470,402,'#e5e1d9',7):shadow())+rect(236,124,n(p,'wallWidth',130,167),266,p.c,24)+(v===1?rect(262,159,111,180,dark,10)+ports(280,242,2)+repeat(4,i=>circle(263+(i%2)*109,144+Math.floor(i/2)*213,4,steel)):circle(312,331,4,p.accent)+line(279,167,345,167,steel,3))
 const pod=(x,y)=>rect(x,y,has(p,/mesh/)?116:154,has(p,/mesh/)?194:126,p.c,24)+ellipse(x+(has(p,/mesh/)?58:77),y+6,has(p,/mesh/)?55:74,10,light)+circle(x+(has(p,/mesh/)?58:77),y+(has(p,/mesh/)?169:105),4,p.accent)+(v===1?ports(x+15,y+70,has(p,/mesh/)?2:3):hotspot?rect(x+30,y+33,91,49,dark,5)+text('4G',x+53,y+64,22,light):grille(x+15,y+28,has(p,/mesh/)?6:9,3))+(powerline?rect(x+31,y-27,8,28,steel)+rect(x+99,y-27,8,28,steel):'')
 if(pair||hotspot||powerline)return(v===2?desk():shadow())+pod(pair?171:242,205)+(pair?pod(351,has(p,/mesh/)?174:202):'')
 const width=n(p,'routerWidth',switcher?324:254,switcher?350:333),x=320-width/2,y=301
 const box=poly(`${x},${y} ${x+39},222 ${x+width+39},222 ${x+width},${y}`,p.c)+poly(`${x+width},${y} ${x+width+39},222 ${x+width+39},265 ${x+width},344`,dark)+rect(x,y,width,43,p.c,6)
 const antennas=switcher?'':repeat(has(p,/cellular/)?2:4,i=>line(x+24+i*((width-45)/3),248,x+14+i*((width-25)/3),144+(i%2)*20,dark,11))
 return(v===2?desk():shadow())+antennas+box+(v===1?rect(x+17,312,36,20,dark,3)+circle(x+width-28,322,7,dark)+grille(x+71,313,Math.floor((width-120)/14),2):switcher?ports(x+12,313,8):repeat(6,i=>circle(x+24+i*17,322,3,i===0?'#7faf91':steel)))+(v===3?grille(x+63,242,Math.floor(width/17)-5,4):'')
}
function watch(p,v){
 const band=has(p,/band|wristband|cycling computer/),clip=has(p,/clip.on/),analog=has(p,/analog|hybrid/),width=n(p,'watchWidth',108,136),cx=323,cy=263
 const face=band?rect(cx-47,cy-78,94,157,dark,27):circle(cx,cy,width/2,dark,{stroke:steel,'stroke-width':8})
 const strap=clip?path('M276 303q-71-52 1-111','none',p.c,18):rect(cx-width*.34,75,width*.68,378,p.c,24)+repeat(6,i=>rect(cx-5,364+i*11,10,4,steel,1))+rect(cx-width*.37,65,width*.74,41,steel,7)+rect(cx-width*.27,72,width*.54,24,p.c,3)
 const dial=analog?repeat(12,i=>{const a=i*Math.PI/6;return line(cx+Math.sin(a)*41,cy-Math.cos(a)*41,cx+Math.sin(a)*47,cy-Math.cos(a)*47,light,3)})+line(cx,cy,cx-21,cy-22,light,4)+line(cx,cy,cx+28,cy-13,light,3)+circle(cx,cy,4,p.accent):text(has(p,/kids/)?'09:15':'10:08',cx,cy+3,band?21:25,light,{'text-anchor':'middle'})+path(`M${cx-30} ${cy+23}l14-8 9 13 13-20 11 12`,'none',p.accent,4)
 const rear=(band?rect(cx-40,cy-70,80,140,p.c,23):circle(cx,cy,width/2,p.c))+circle(cx,cy,27,dark)+repeat(4,i=>circle(cx-11+(i%2)*22,cy-11+Math.floor(i/2)*22,6,i===0?'#648c71':steel))+circle(cx-16,cy+49,4,steel)+circle(cx+16,cy+49,4,steel)
 const core=strap+(v===1?rear:face+dial)+rect(cx+width/2,cy-7,12,17,steel,4)
 if(v===2)return path('M99 443q83-122 169-236q43-66 94-62q70 11 142 23l-72 324H147z','#c7a28f','none')+group(core,'translate(72,-4) rotate(27 323 263) scale(.82)')
 return shadow(323,467,121)+group(core,v===3?'rotate(-23 323 263)':clip?'rotate(12 323 263)':'')
}
function storage(p,v){
 const internal=has(p,/internal|pcie|m\.2|nvme/)&&!has(p,/enclosure|external|portable/),bay=has(p,/bay|backup station|dual.drive|dual.nvme|docking station/),optical=has(p,/optical/),width=n(p,'driveWidth',181,246)
 if(internal){const board=rect(114,206,406,101,'#315749',5)+rect(487,206,33,101,'#b6a05d',2)+repeat(8,i=>line(493+i*3,207,493+i*3,307,'#e2c477',1))+circle(123,256,6,steel)+repeat(4,i=>rect(162+i*79,225,59,57,dark,3));return shadow(320,370,216)+group(board+(v===1?repeat(6,i=>rect(162+i*48,245,29,26,steel,2)):has(p,/heatsink|gaming/)?repeat(12,i=>rect(146+i*28,216,15,81,p.c,2)):rect(182,237,205,32,p.c,2)),v===2?'rotate(-19 320 260)':v===3?'rotate(15 320 260)':'')}
 const h=bay?205:optical?83:146,x=320-width/2,y=340-h/2
 let body=poly(`${x},${y} ${x+46},${y-63} ${x+width+46},${y-63} ${x+width},${y}`,steel)+poly(`${x+width},${y} ${x+width+46},${y-63} ${x+width+46},${y+h-58} ${x+width},${y+h}`,dark)+rect(x,y,width,h,p.c,9)
 body+=v===1?ports(x+23,y+h-39,3)+grille(x+22,y+23,Math.floor(width/15)-3,Math.floor(h/16)-3):bay?repeat(has(p,/dual|two/)?2:3,i=>rect(x+14+i*((width-25)/3),y+12,(width-38)/3,h-24,dark,4)+rect(x+24+i*((width-25)/3),y+h-38,(width-69)/3,8,steel,2)):optical?rect(x+11,y+17,width-22,36,dark,3)+circle(x+width-22,y+65,3,p.accent):rect(x+22,y+25,width-44,4,p.accent,2)+circle(x+width-21,y+h-19,3,'#7cbb90')
 if(has(p,/rugged/))body+=rect(x-9,y-3,13,h+6,dark,5)+rect(x+width-4,y-3,13,h+6,dark,5)
 return(v===2?desk():shadow(344,466,170))+body+(v===3&&bay?rect(98,310,71,154,steel,5)+rect(107,323,53,104,dark,3):'')
}
function smartDevice(p,v){
 const door=has(p,/doorbell/),thermo=has(p,/thermostat/),bank=has(p,/power bank/),player=has(p,/streaming|media player/),pair=has(p,/2 pack|two.pack/)
 if(door){const body=rect(253,99,139,312,p.c,24)+rect(263,113,119,137,dark,17)+circle(322,165,34,steel)+circle(322,165,23,dark)+circle(313,157,7,glass)+circle(322,321,37,p.accent,{stroke:steel,'stroke-width':5});return(v===2?rect(54,61,364,410,'#e4dccd',4)+rect(439,61,130,410,'#8b7463',4):shadow())+(v===1?rect(253,99,139,312,dark,24)+repeat(4,i=>circle(269+(i%2)*107,125+Math.floor(i/2)*256,5,steel))+rect(281,213,80,53,steel,5)+circle(299,239,6,dark)+circle(344,239,6,dark):body)}
 if(thermo)return(v===2?rect(41,47,558,422,'#e4e0d9',5):shadow())+circle(321,262,n(p,'thermostatDiameter',117,142),p.c,{stroke:steel,'stroke-width':8})+(v===1?rect(261,222,120,79,dark,8)+repeat(6,i=>circle(282+i*16,279,4,p.accent)):circle(321,262,98,dark)+text('21°',322,279,59,light,{'text-anchor':'middle'})+path('M263 316q60 34 118 0','none',p.accent,7))
 if(bank){const w=n(p,'batteryWidth',123,151),x=321-w/2;return(v===2?desk():shadow())+rect(x,126,w,277,p.c,19)+(v===1?ports(x+21,157,Math.floor(w/43)):repeat(4,i=>circle(x+31+i*16,163,3,p.accent)))+ports(x+28,369,2)+(v===3?path(`M${x+58} 409q111 109 183-41q23-99-38-124`,'none',dark,6)+rect(462,212,17,39,steel,3):'')}
 if(player)return(v===2?desk():shadow())+rect(163,247,229,103,p.c,23)+ellipse(277,247,109,29,steel)+circle(372,311,3,p.accent)+(v===1?ports(193,282,4):'')+group(rect(0,0,49,224,dark,18)+circle(25,59,15,steel)+repeat(9,i=>circle(13+(i%3)*12,106+Math.floor(i/3)*22,4,steel))+circle(25,25,5,p.accent),'translate(445,173) rotate(13)')
 const plug=(x,y)=>rect(x,y,137,148,p.c,23)+(v===1?rect(x+39,y-25,8,35,steel)+rect(x+89,y-25,8,35,steel):rect(x+38,y+48,12,29,dark,3)+rect(x+87,y+48,12,29,dark,3)+circle(x+67,y+95,8,dark))+circle(x+111,y+125,4,p.accent)
 return(v===2?rect(45,58,554,408,'#e6e2da',5):shadow())+plug(pair?158:250,228)+(pair?plug(363,228):'')
}
function printer(p,v){
 const w=n(p,'printerWidth',340,398),x=320-w/2
 const base=rect(x,242,w,148,p.c,17)+poly(`${x},242 ${x+51},164 ${x+w+30},164 ${x+w},242`,steel)+poly(`${x+w},242 ${x+w+30},164 ${x+w+30},321 ${x+w},390`,dark)
 const front=rect(x+25,271,w-91,82,dark,7)+poly(`${x+53},327 ${x+w-53},327 ${x+w-24},430 ${x+29},430`,paper)+repeat(4,i=>line(x+77,352+i*15,x+w-57,352+i*15,i===0?p.accent:'#b2c5c4',5))+rect(x+w-60,263,37,27,dark,4)+repeat(3,i=>circle(x+w-42,308+i*15,4,p.accent))
 const lid=poly(`${x+37},227 ${x+76},179 ${x+w+3},179 ${x+w-28},227`,v===3?glass:p.c,{stroke:dark,'stroke-width':3})
 return(v===2?desk():shadow(320,460,220))+base+(v===1?grille(x+31,271,Math.floor(w/16)-5,7)+ports(x+36,352,2):front)+lid+(v===3?poly(`${x+39},179 ${x+41},76 ${x+w+8},76 ${x+w+3},179`,p.c,{stroke:steel,'stroke-width':4}):'')
}
function clock(p,v){
 const radius=n(p,'clockRadius',137,164),r=radius-17
 const ticks=repeat(12,i=>{const a=i*Math.PI/6;return line(320+Math.sin(a)*(r-15),261-Math.cos(a)*(r-15),320+Math.sin(a)*(r-4),261-Math.cos(a)*(r-4),dark,4)})
 const body=circle(320,261,radius,p.c,{stroke:'#9e8365','stroke-width':8})+circle(320,261,r,paper)+ticks+line(320,261,273,215,dark,7)+line(320,261,374,222,dark,5)+circle(320,261,8,p.accent)
 return(v===2?rect(45,49,550,422,'#e9e4d9',3)+line(45,403,595,403,'#c1b7a6',11):shadow(320,450,177))+(v===1?circle(320,261,radius,p.c)+rect(291,196,57,103,dark,5)+rect(300,208,38,63,steel,3)+circle(320,334,12,steel)+path('M302 140h36l-18 27z',dark,'none'):group(body,v===3?'translate(-45,-41) scale(1.15)':''))
}
function microwave(p,v){
 if(has(p,/steriliser|sterilizer/))return shadow()+ellipse(320,213,143,63,glass,{opacity:.85})+rect(178,217,284,164,p.c,45)+ellipse(320,374,135,31,p.c)+rect(297,130,49,57,p.c,14)+path('M232 169q90-49 179 0','none',steel,8)+(v===1?repeat(5,i=>rect(234+i*37,251,15,42,dark,4)):v===3?group(ellipse(0,0,124,44,glass),'translate(320,121)'):'')
 const w=n(p,'microwaveWidth',347,407),x=320-w/2,h=n(p,'microwaveHeight',190,225),y=328-h/2
 const body=rect(x,y,w,h,p.c,10)+poly(`${x},${y} ${x+34},${y-46} ${x+w+34},${y-46} ${x+w},${y}`,steel)+poly(`${x+w},${y} ${x+w+34},${y-46} ${x+w+34},${y+h-42} ${x+w},${y+h}`,dark)
 const panel=rect(x+w-83,y+20,66,39,dark,4)+text('0:00',x+w-75,y+46,22,'#bcdacf')+circle(x+w-49,y+h-48,22,steel)+repeat(6,i=>circle(x+w-66+(i%2)*32,y+82+Math.floor(i/2)*19,5,dark))
 const door=rect(x+15,y+17,w-115,h-36,dark,9)+rect(x+29,y+30,w-168,h-62,'#62717a',4)+repeat(9,r=>repeat(17,c=>circle(x+38+c*((w-187)/17),y+41+r*((h-87)/9),1.4,dark)))+rect(x+w-129,y+49,9,h-98,steel,4)
 return(v===2?desk():shadow(340,465,210))+body+(v===1?grille(x+20,y+24,Math.floor(w/16)-4,Math.floor(h/13)-3)+rect(x+22,y+h-34,50,19,dark,3):panel+(v===3?rect(x+17,y+22,w-120,h-42,dark,5)+ellipse(x+(w-115)/2,y+h-47,(w-145)/2,23,glass)+group(door,`translate(${-((w-100)*.48)},0) skewY(-9)`):door))
}
function tent(p,v){
 const left=99,right=548,top=n(p,'tentHeight',93,145),center=n(p,'tentCenter',296,337)
 const dome=path(`M${left} 409q37-${409-top} ${center-left} ${top-409}q${right-center-17} 29 ${right-center} ${409-top}z`,p.c,dark,3)
 const seam=path(`M${left} 409Q${center-62} ${top-72} ${right} 409M${center} ${top}q-102 112-109 261M${center} ${top}q102 111 128 261`,'none',steel,4)
 const entrance=path(`M${center-95} 406q4-144 90-239q109 104 110 239z`,v===1?p.accent:dark,steel,3)
 const mesh=v===1?rect(center-66,286,141,68,glass,10)+grille(center-51,299,8,5,steel):path(`M${center+8} 174q58 98 82 224l-79-31z`,p.accent,steel,2)
 const ropes=line(left+47,318,53,437,steel,3)+line(right-28,308,595,437,steel,3)+line(center+5,top+16,628,425,steel,2)
 return(v===2?path('M0 406q80-36 178 2t152-6t198 5t112-3v116H0z','#bed0b0','none')+circle(553,93,31,'#dfc17d'):shadow(323,445,247))+dome+entrance+mesh+seam+ropes+(v===3?rect(173,445,269,32,p.c,16)+line(209,447,209,474,dark,5)+line(408,446,408,474,dark,5):'')
}
function stroller(p,v){
 const terrain=has(p,/terrain/),cover=has(p,/rain cover/),muff=has(p,/footmuff/),radius=terrain?38:27
 if(muff)return shadow(320,449,156)+rect(217,125,206,294,p.c,75)+ellipse(320,176,70,36,dark)+repeat(6,i=>path(`M229 ${215+i*29}q88 17 180 0`,'none',steel,3))+(v===1?line(321,232,321,381,dark,5)+repeat(3,i=>rect(286,215+i*57,68,17,dark,3)):path('M274 188q46 72 93 0','none',p.accent,7))
 const frame=line(233,256,406,429,steel,11)+line(399,239,213,429,steel,11)+path('M401 267l26-129q6-26 27-25h40','none',dark,13)
 const wheels=repeat(4,i=>circle(i<2?196+i*28:400+(i-2)*28,434+(i%2)*8,radius,dark,{stroke:steel,'stroke-width':4}))
 const seat=poly('229,226 363,250 393,358 257,370 221,302',p.c)+path('M237 266q78 16 112-3M274 362l-22 45h106','none',steel,7)+path('M260 228v76m-20-27h83','none',dark,7)
 const hood=path('M181 218q24-127 150-103q70 12 89 89l-61 36q-113-56-178-22z',p.accent,dark,3)+path('M264 122q58 21 95 118','none',steel,3)
 return(v===2?path('M0 427q158-40 319 3t321-3v93H0z','#d5d1c4','none'):shadow(320,473,202))+group(frame+wheels+seat+hood+(cover?path('M180 218q-15 133 44 196h181q44-136 16-209q-107-129-241 13z',glass,steel,3,{opacity:.58}):'')+(v===1?path('M225 268l141 17-25 94-87-2z',dark,'none')+rect(264,294,76,47,p.c,6):''),v===3?'translate(122,22) scale(.7) rotate(15 320 270)':v===1?'translate(637,0) scale(-1,1)':'')
}
function tool(p,v){
 if(has(p,/hiking|trekking|등산 스틱/)){
  const pole=(x,y,angle)=>group(rect(x-10,y,20,96,dark,9)+line(x,y+97,x,y+308,steel,9)+line(x,y+189,x,y+277,p.c,12)+rect(x-13,y+163,26,17,p.accent,4)+ellipse(x,y+301,27,6,dark)+path(`M${x-6} ${y+307}l6 24 6-24`,dark,'none')+path(`M${x+8} ${y+16}q68 15 13 66`,'none',p.c,7),`rotate(${angle} ${x} ${y})`)
  return shadow()+pole(v===1?236:255,92,v===2?-17:12)+pole(v===1?400:393,98,v===2?13:-9)+(v===1?rect(181,347,286,46,p.c,18)+line(227,348,227,392,dark,5):'')
 }
 if(has(p,/hammer|해머|tent pegs|텐트 팩/)){
  const hammer=group(rect(266,216,24,207,p.c,10)+rect(203,160,157,76,steel,11)+rect(184,176,24,43,dark,5)+path('M360 174l35-20-9 59-26 12',steel,dark,3),v===2?'rotate(23 279 291)':v===1?'rotate(-18 279 291)':'')
  return shadow()+rect(153,201,309,221,dark,17)+hammer+repeat(4,i=>path(`M${420+i*21} 227v159q-2 19-17 18`,'none',steel,6))
 }
 const gauge=has(p,/공기압|pressure|gauge/),kit=has(p,/공구 세트|tool.*(?:set|kit)|toolkit/)
 if(gauge)return shadow(320,450,130)+group(path('M239 196h157v102l-39 97h-103z',p.c,dark,4)+rect(268,216,100,62,dark,7)+text('32.0',278,255,26,light)+rect(322,136,47,61,steel,7)+rect(354,111,46,29,dark,6)+circle(294,313,12,p.accent),v===1?'rotate(22 320 260)':v===2?'rotate(-35 320 260)':'')
 const driver=(x,y,c)=>group(rect(0,0,31,124,c,11)+rect(12,-108,7,109,steel,2)+path('M12-108h7l5-24H7z',steel,'none'),'translate('+x+','+y+')')
 if(kit){const body=rect(107,163,425,258,p.c,20)+rect(133,185,373,211,dark,10)+path('M257 163v-31h128v31','none',p.c,14);const tools=driver(168,266,p.accent)+driver(242,263,steel)+path('M323 217l-25 149m-4-155l60 10','none',steel,15)+path('M403 234l-38 128m36-118l58 104','none',p.accent,13)+circle(403,234,15,steel)+rect(369,306,67,53,steel,7);return(v===2?desk():shadow())+body+(v===1?grille(147,207,24,12):tools)+(v===3?group(driver(0,0,p.accent),'translate(535,235) rotate(20)'):'' )}
 const body=path('M185 169h168l36 40-35 54-167-7z',p.c,dark,4)+rect(359,186,60,43,dark,5)+rect(413,194,73,22,steel,3)+path('M247 252l-19 116h90l-18-111',p.c,dark,4)+rect(207,357,133,51,dark,9)+rect(215,365,118,20,p.accent,4)+rect(229,240,35,21,dark,5)+grille(194,191,7,4)
 return(v===2?desk():shadow())+group(body,v===1?'translate(640,0) scale(-1,1)':v===3?'rotate(-12 321 276)':'')+(v===3?repeat(4,i=>rect(413+i*21,295,7,89,steel,2)):'')
}
function collectible(p,v){
 const pins=has(p,/pins?/),key=has(p,/keychain/),coasters=has(p,/coaster/),board=has(p,/display board/),folder=has(p,/folder/),gold=has(p,/gold bars/),member=has(p,/^gta\+$/)
 const emblem=(x,y,size=49)=>path(`M${x} ${y-size}l${size*.3} ${size*.63}h${size*.66}l-${size*.53} ${size*.41}l${size*.2} ${size*.63}l-${size*.63}-${size*.41}l-${size*.63} ${size*.41}l${size*.2}-${size*.63}l-${size*.53}-${size*.41}h${size*.66}z`,p.accent,'#c6ad71',4)
 if(key){
  if(v===2)return shadow(320,472,153)+ellipse(312,216,106,85,'none',{stroke:steel,'stroke-width':19})+path('M236 269q67 54 145-5','none',light,5)+line(312,299,312,350,steel,21)+rect(230,340,164,101,p.c,15)+rect(241,352,141,76,steel,8)+circle(263,377,5,dark)+circle(359,413,5,dark)
  return shadow(320,451,136)+ellipse(321,156,62,46,'none',{stroke:steel,'stroke-width':11})+line(321,197,321,246,steel,14)+rect(260,237,124,157,p.c,15)+(v===1?rect(276,256,92,118,steel,7):emblem(321,308))
 }
 if(board||folder){
  if(v===2)return shadow()+ (board?rect(110,111,361,308,p.c,12,{stroke:steel,'stroke-width':8})+repeat(30,i=>circle(134+(i%6)*62,139+Math.floor(i/6)*60,4,steel))+emblem(287,256,72)+circle(463,342,32,steel)+line(463,311,463,371,dark,6):poly('75,160 313,116 560,157 555,415 313,372 80,413',p.c,{stroke:steel,'stroke-width':4})+line(313,117,313,372,steel,5)+poly('112,164 284,141 284,323 112,346',paper)+emblem(199,243,41)+poly('339,143 527,174 527,352 339,324',paper)+emblem(429,247,42)+poly('80,309 313,272 313,372 80,413',p.accent)+poly('313,272 555,312 555,415 313,372',p.accent))
  return shadow()+rect(175,127,287,282,p.c,board?9:4,{stroke:steel,'stroke-width':5})+(board?repeat(20,i=>circle(208+(i%5)*53,166+Math.floor(i/5)*61,3,steel))+emblem(312,261,31):line(212,131,212,405,steel,4)+emblem(334,255,61))+(v===1?line(220,186,405,186,steel,9)+circle(313,166,8,dark):v===3?group(rect(0,0,120,137,p.accent,4)+emblem(60,67,34),'translate(458,283) rotate(14)'):'')
 }
 if(pins||coasters){const count=coasters?4:has(p,/trilogy/)?3:2;return(v===2?desk():shadow())+repeat(count,i=>{const x=174+(i%2)*171,y=197+Math.floor(i/2)*172;return group(rect(x-57,y-58,126,126,coasters?p.c:paper,coasters?7:3,{stroke:steel,'stroke-width':2})+(v===1?circle(x+6,y+3,14,steel)+line(x+6,y-19,x+6,y+23,dark,5):emblem(x+6,y+3,43)),v===3?`rotate(${i*8-10} ${x} ${y})`:'')})}
 if(gold){
  const bar=(x,y)=>poly(`${x},${y+77} ${x+17},${y} ${x+110},${y} ${x+127},${y+77}`,'#c1a25c',{stroke:'#88703e','stroke-width':3})+poly(`${x+17},${y} ${x+40},${y-18} ${x+127},${y-18} ${x+110},${y}`,'#e0c17b')
  if(v===2)return shadow()+group(bar(174,184)+path('M210 216h38l19 29-22 17-35-15z','none','#8b703b',3),'translate(-22,-34) scale(1.55)')+group(bar(303,316),'rotate(-17 358 359)')
  return shadow()+repeat(v===1?3:5,i=>bar(157+(i%3)*114,198+Math.floor(i/3)*125))
 }
 if(member){
  const skyline=repeat(9,i=>rect(103+i*49,163+(i%3)*31,39,242-(i%3)*31,i%2?p.accent:dark,2)+repeat(6,j=>rect(112+i*49+(j%2)*14,185+(i%3)*31+Math.floor(j/2)*33,6,13,paper,1)))
  return rect(73,83,494,373,p.c,24)+skyline+(v===1?poly('197,456 292,298 357,298 452,456',steel)+line(324,333,328,383,paper,5)+circle(427,157,40,p.accent):v===2?circle(321,267,127,dark,{stroke:steel,'stroke-width':5})+emblem(462,409,31):path('M107 159q226-104 420 50','none',steel,9))+text('GTA+',321,v===1?253:291,v===2?69:78,paper,{'text-anchor':'middle','font-weight':700})
 }
 const box=rect(172,177,292,236,p.c,8)+poly('172,177 231,116 523,116 464,177',steel)+poly('464,177 523,116 523,355 464,413',dark)+emblem(318,289,61)
 return(v===2?desk():shadow(343,453,208))+box+(v===1?grille(201,222,16,12):v===3?poly('172,177 175,83 466,83 464,177',p.c,{stroke:steel,'stroke-width':4})+rect(183,188,270,92,dark,7):'')
}
function media(p,v){
 const vinyl=/vinyl|\blp\b|records/i.test([p.title,p.raw.type,p.raw.typeLabel,p.raw.category,p.raw.shape,p.raw.artFamily].join(' '))
 const bluRay=/blu.?ray/i.test([p.title,p.raw.type,p.raw.typeLabel,p.raw.category].join(' '))
 const album=String(p.title||'Original soundtrack').replace(/\s*[-—]\s*(?:audio cd|vinyl|lp).*$/i,'').slice(0,43)
 const motif=n(p,'albumMotif',0,3),sunX=n(p,'albumSunX',170,265),sunY=n(p,'albumSunY',130,200)
 const artwork=()=>rect(0,0,300,300,p.c)+circle(sunX,sunY,54,p.accent)+path(`M0 220L${n(p,'albumPeak',65,125)} 93L224 300H0Z`,dark,'none')+path(`M53 300L${n(p,'albumSecondPeak',170,229)} 147L300 225V300Z`,steel,'none')+repeat(4+iSafe(motif),i=>path(`M0 ${238+i*11}q145 ${-n(p,'albumWave'+i,18,60)} 300 ${-i*6}`,'none',paper,2,{opacity:.35}))+text(album,16,35,album.length>29?11:15,paper,{'font-weight':700})+text(bluRay?'FEATURE FILM':'ORIGINAL SOUNDTRACK',16,57,8,paper,{'letter-spacing':2})
 const rear=(x,y,size)=>rect(x,y,size,size,p.c,2)+group(artwork(),`translate(${x+size*.62},${y+size*.06}) scale(${size*.28/300})`)+text(album,x+size*.07,y+size*.13,size*.043,paper)+repeat(9,i=>rect(x+size*.08,y+size*.24+i*size*.058,size*(.23+(i%3)*.075),2,paper,1))+repeat(30,i=>rect(x+size*.7+i*size*.005,y+size*.8,size*(i%3===0?.003:.0015),size*.09,paper))+text(vinyl?'33⅓ RPM • STEREO':bluRay?'BLU-RAY • HIGH DEFINITION':'COMPACT DISC • DIGITAL AUDIO',x+size*.08,y+size*.93,size*.026,paper)
 const disc=(x,y,r,reverse=false)=>circle(x,y,r,vinyl?'#171c22':'#d1dbe0',{stroke:vinyl?'#39424a':'#8fadb7','stroke-width':3})+repeat(vinyl?16:7,i=>circle(x,y,r*(.44+i*(vinyl?.032:.074)),'none',{stroke:vinyl?'#4a5055':i%2?'#c5cadb':'#add2d2','stroke-width':vinyl?1:2,opacity:.7}))+(!vinyl?path(`M${x-r*.8} ${y-r*.38}L${x+r*.68} ${y+r*.52}M${x-r*.65} ${y+r*.6}L${x+r*.68} ${y-r*.53}`,'none',paper,15,{opacity:.3}):'')+circle(x,y,r*.34,reverse?steel:p.c)+text(reverse?'SIDE B':vinyl?'SIDE A':bluRay?'BLU-RAY':'SOUNDTRACK',x,y-r*.13,r*.06,dark,{'text-anchor':'middle'})+circle(x,y,r*.095,paper,{stroke:steel,'stroke-width':3})
 if(bluRay){
  if(v===2)return shadow(320,466,241)+rect(84,113,457,311,'#3364a7',9,{stroke:'#1c3f7c','stroke-width':5})+line(302,119,302,416,'#254e8c',8)+group(artwork(),'translate(97,137) scale(.65,.88)')+circle(423,274,106,'#204275')+disc(423,274,97)+circle(423,274,11,steel)
  return shadow(320,468,156)+rect(194,94,247,345,'#3364a7',8)+text('BLU-RAY',319,119,14,paper,{'text-anchor':'middle'})+(v===1?group(rear(0,0,300),'translate(204,132) scale(.755,.98)'):group(artwork(),'translate(204,132) scale(.755,.98)'))
 }
 if(vinyl){
  if(v===1)return shadow(320,472,222)+rear(125,104,319)+group(disc(422,338,115,true),'rotate(8 422 338)')
  if(v===2)return shadow(320,472,245)+group(artwork(),'translate(91,153) scale(.77) rotate(-9 150 150)')+disc(409,278,153)+rect(327,392,165,33,paper,2)+text('ALBUM LINER NOTES',344,412,10,dark)
  return shadow(320,472,230)+disc(419,256,153)+rect(100,111,310,310,dark,2)+group(artwork(),'translate(105,116)')+line(109,417,403,417,steel,2)
 }
 if(v===1)return shadow(319,459,207)+rect(114,119,383,306,'#dce4e5',5,{stroke:steel,'stroke-width':4})+rear(140,129,286)+rect(437,131,46,280,dark,2)+repeat(17,i=>line(444,145+i*15,476,145+i*15,steel,1))
 if(v===2)return shadow(321,468,259)+group(artwork(),'translate(52,177) scale(.62) rotate(-7 150 150)')+rect(244,123,306,306,'#d4dfe2',5,{stroke:steel,'stroke-width':4})+rect(258,137,278,278,dark,3)+disc(397,276,125)+circle(397,276,15,steel)+repeat(4,i=>path(`M${269+(i%2)*250} ${148+Math.floor(i/2)*250}h-9v9`,'none',steel,3))
 return shadow(320,457,213)+rect(112,105,370,322,'#dce4e5',5,{stroke:steel,'stroke-width':4})+rect(124,117,29,299,dark,2)+repeat(15,i=>line(129,128+i*19,147,128+i*19,steel,1))+group(artwork(),'translate(158,117)')+path('M165 123h286v286','none',paper,3,{opacity:.65})
}
const iSafe=value=>Math.max(0,Math.min(3,Math.floor(value)))
function card(p,v){
 const graded=has(p,/graded|\bgrade\b/),pack=has(p,/booster|foil pack/),deck=has(p,/deck|card set|battle|trading card/),gift=has(p,/gift|cash|shark|credit|currency/)
 const art=(x,y,w,h,back=false)=>rect(x,y,w,h,p.c,9,{stroke:steel,'stroke-width':2})+(back?rect(x+w*.08,y+h*.08,w*.84,h*.14,dark,2)+repeat(6,i=>line(x+w*.12,y+h*(.35+i*.07),x+w*(.72+(i%2)*.13),y+h*(.35+i*.07),paper,2))+rect(x+w*.12,y+h*.83,w*.52,h*.06,steel,2):circle(x+w*.66,y+h*.42,w*.23,p.accent)+poly(`${x+w*.07},${y+h*.73} ${x+w*.44},${y+h*.2} ${x+w*.92},${y+h*.81}`,dark)+path(`M${x+w*.17} ${y+h*.63}q${w*.47}-${h*.16} ${w*.65} ${h*.02}`,'none',paper,3)+(gift?rect(x+w*.09,y+h*.08,w*.34,h*.07,paper,3,{opacity:.9})+circle(x+w*.86,y+h*.12,w*.05,paper,{opacity:.85}):text(String(p.title||'').slice(0,22),x+w*.09,y+h*.14,w*.052,paper,{'font-weight':700}))+(gift?'':text('COLLECTOR SERIES',x+w*.09,y+h*.93,w*.04,paper)))
 const slab=(x,y,back=false)=>rect(x,y,216,321,'#e4ebeb',12,{stroke:steel,'stroke-width':4})+rect(x+15,y+14,187,50,paper,3)+rect(x+22,y+20,174,12,p.accent,2)+text(back?'CERTIFIED COLLECTIBLE':'COLLECTOR GRADE',x+26,y+47,10,dark)+art(x+24,y+79,169,223,back)+circle(x+196,y+27,7,steel)
 if(graded)return shadow()+group(slab(v===2?153:215,v===2?104:100,v===1),v===2?'rotate(-8 260 260)':'')+(v===2?group(slab(350,144,true),'translate(138,95) scale(.6)'):'')
 if(pack){
  const wrapper=(x,y,back=false)=>rect(x,y,210,308,steel,2)+repeat(15,i=>line(x+7+i*14,y+4,x+7+i*14,y+22,dark,1)+line(x+7+i*14,y+287,x+7+i*14,y+306,dark,1))+art(x+5,y+27,200,255,back)
  return shadow()+group(wrapper(v===2?151:213,109,v===1),v===2?'rotate(-8 256 263)':'')+(v===2?group(art(0,0,155,209),'translate(365,231) rotate(12 77 105)'):'')
 }
 if(gift||!deck){
  if(v===2)return shadow()+group(art(146,153,290,184),'rotate(-11 291 245)')+group(art(300,286,232,147,true),'rotate(9 416 359)')
  return shadow(320,391,197)+art(123,150,394,248,v===1)+(v===1?repeat(24,i=>rect(170+i*4,314,i%3===0?3:1,28,dark)):'')
 }
 if(v===2)return shadow()+repeat(4,i=>group(art(0,0,162,217,i===3),`translate(${146+i*59},${157+i*16}) rotate(${i*12-18} 81 108)`))
 return shadow()+repeat(7,i=>rect(219+i*4,116+i*5,179,250,i%2?paper:steel,7))+art(219,116,179,250,v===1)
}
// The full listing name and colour: some shelves draw from a short generic title
// ("Breville espresso machine") and keep the real name in canonicalTitle.
const named=(p,re)=>re.test(`${p.t||''} ${p.d?.canonicalTitle||''} ${p.raw?.colour||p.raw?.colorName||p.raw?.color||''}`.toLowerCase())
// Finish named in the title (chrome, matte black, brass) or the item's own colour.
const metalTone=p=>named(p,/matte black|\bblack\b/)?'#2d3237':named(p,/brass|gold/)?'#c4a15a':named(p,/copper|bronze/)?'#b87352':named(p,/\bwhite\b/)?'#e6e8e5':'#c3ccd2'
const bodyTone=(p,fallback)=>named(p,/\bblack|midnight|graphite|carbon|truffle|charcoal grill/)?'#2b3035':named(p,/\bred\b|cherry/)?'#b04a46':named(p,/\bblue|navy|sky/)?'#4b7298':named(p,/\bgreen|mint|sage|olive/)?'#7fa58f':named(p,/\bwhite|porcelain|cream|sea salt|ivory/)?'#eceae4':named(p,/stainless|silver|brushed|steel|nickel/)?'#b9c3c9':named(p,/yellow/)?'#d6b84f':named(p,/\bpink|rose/)?'#d79aa8':fallback
// A tap or shower: the spout, lever and supply hoses, or the spray head on its arm.
function faucet(p,v){
 const m=metalTone(p),hi='#f6f9fa',water='#9fcbd8'
 if(named(p,/shower/)){
  const r=n(p,'showerHead',58,80),armY=n(p,'showerArm',108,134),hand=named(p,/hand|wand|magnetix|function|slide/)
  const face=(cx,cy,R)=>circle(cx,cy,R,m,{stroke:dark,'stroke-width':3})+circle(cx,cy,R*.84,'#dde4e7')+repeat(4,k=>repeat(6*(k+1),i=>{const a=i*Math.PI*2/(6*(k+1))+k*.3,rr=R*.8*(k+1)/4.6;return circle(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr,R/26+1,dark)}))+circle(cx,cy,R*.08,dark)
  if(v===2)return shadow(320,470,190)+face(320,262,n(p,'showerFace',160,182))+repeat(6,i=>{const a=i*Math.PI/3-Math.PI/2;return rect(320+Math.cos(a)*192-9,262+Math.sin(a)*192-5,18,10,p.accent,3)})+path('M320 58l14 22h-28Z',dark,'none')
  if(v===1)return shadow(320,452,150)+face(320,250,r*2.3)+rect(304,62,32,70,m,8,{stroke:dark,'stroke-width':2})+rect(285,52,70,20,m,6)
  const wall=rect(118,armY-26,34,52,m,8,{stroke:dark,'stroke-width':2})+path(`M150 ${armY}H${hand?250:300}Q${hand?268:320} ${armY} ${hand?268:320} ${armY+30}V${armY+48}`,'none',m,16)
  const rain=hand?'':ellipse(320,armY+64,r*1.5,r*.32,m,{stroke:dark,'stroke-width':3})+ellipse(320,armY+70,r*1.36,r*.24,'#dde4e7')+repeat(7,i=>rect(320-r*1.2+i*r*.4,armY+96,4,170+(i%3)*14,water,2,{opacity:.55}))
  const handset=hand?group(rect(-17,0,34,150,m,16,{stroke:dark,'stroke-width':3})+ellipse(0,-6,r*.95,r*.95,m,{stroke:dark,'stroke-width':3})+ellipse(0,-6,r*.78,r*.78,'#dde4e7')+repeat(19,i=>circle(Math.cos(i*.33)*r*.55*(i%2?1:.55),-6+Math.sin(i*.33)*r*.55*(i%2?1:.55),3,dark))+rect(-10,40,20,12,p.accent,4),`translate(268 ${armY+120}) rotate(-24)`)+path(`M326 ${armY+246}q38 150-80 156q-136 0-74-120q22-46-20-74`,'none',steel,9)+rect(140,armY+150,36,46,m,8,{stroke:dark,'stroke-width':2}):''
  const valve=circle(170,armY+250,40,m,{stroke:dark,'stroke-width':3})+rect(160,armY+218,58,16,m,7,{stroke:dark,'stroke-width':2})
  return shadow(320,470,170)+line(96,60,96,470,'#d8d4cb',6)+wall+rain+handset+valve
 }
 const reach=n(p,'spoutReach',118,158),top=n(p,'spoutTop',112,146),x0=n(p,'faucetX',246,272),base=396,pull=named(p,/pull|spray|sprayer/)
 const spout=path(`M${x0} ${base-150}V${top+58}Q${x0} ${top} ${x0+reach/2} ${top}Q${x0+reach} ${top} ${x0+reach} ${top+58}V${top+92}`,'none',m,22)+path(`M${x0-6} ${base-150}V${top+58}Q${x0-6} ${top-6} ${x0+reach/2} ${top-6}`,'none',hi,4,{opacity:.6})+rect(x0+reach-16,top+86,32,pull?44:20,pull?m:dark,6,{stroke:dark,'stroke-width':2})
 const column=rect(x0-21,base-156,42,166,m,12,{stroke:dark,'stroke-width':3})+line(x0-10,base-146,x0-10,base-6,hi,4)
 const lever=group(rect(0,-8,78,16,m,8,{stroke:dark,'stroke-width':2})+circle(0,0,15,m,{stroke:dark,'stroke-width':2}),`translate(${x0+18} ${base-118}) rotate(-22)`)
 const counter=rect(96,base+10,448,24,'#d4cdbf',4)+path(`M${x0+reach-104} ${base+12}q104 34 208 0`,'#9aa4a9','none')+ellipse(x0,base+10,48,10,m,{stroke:dark,'stroke-width':2})
 if(v===1)return shadow(320,472,180)+counter+column+lever+spout+repeat(2,i=>path(`M${x0-8+i*16} ${base+34}q${i?30:-30} 60 ${i?16:-16} 118`,'none',steel,8))+repeat(2,i=>repeat(9,j=>line(x0-10+i*16+(i?1:-1)*j*2.4,base+42+j*12,x0-4+i*16+(i?1:-1)*j*2.4,base+46+j*12,dark,1.5)))+rect(x0-26,base+34,52,16,steel,4)
 if(v===2)return shadow(320,470,190)+group(spout+lever+column,`translate(${320-2*(x0+reach)} ${280-2*(top+60)}) scale(2)`)+repeat(5,i=>circle(300+i*10,430+(i%2)*14,4,water))
 return shadow(320,472,180)+counter+column+lever+spout+rect(x0+reach-7,top+(pull?132:108),14,base-top-(pull?122:98),water,6,{opacity:.6})
}
// Charcoal kettle grill on legs and wheels, or a gas grill cart with a hood.
function grill(p,v){
 const c=bodyTone(p,p.c),gas=named(p,/\bgas\b|propane|burner/)
 const coals=(cx,cy,R)=>repeat(14,i=>circle(cx-R*.7+(i*53)%(R*1.4),cy-6+(i*7)%16,9,i%3?'#3a3330':'#d9733f'))
 const food=(cx,cy,R)=>repeat(3,i=>rect(cx-R*.62+i*R*.42,cy-14,R*.3,18,'#a8573d',9))+repeat(2,i=>ellipse(cx-R*.3+i*R*.6,cy+18,R*.18,9,'#7d4a34'))
 if(gas){
  const w=n(p,'gasWidth',248,292),x=320-w/2,hood=path(`M${x} 290V232Q${x} 172 ${x+44} 172H${x+w-44}Q${x+w} 172 ${x+w} 232V290Z`,c,dark,3)+line(x+34,196,x+w-34,196,steel,9)+circle(x+w/2,236,13,paper)
  const cart=rect(x,290,w,30,steel,4,{stroke:dark,'stroke-width':2})+repeat(4,i=>circle(x+w*(.2+i*.2),305,9,dark))+rect(x+8,320,w-16,104,c,4,{stroke:dark,'stroke-width':2})+line(320,328,320,416,dark,3)+repeat(2,i=>rect(300+i*28,350,8,36,steel,3))+rect(x-82,284,82,14,steel,3)+rect(x+w,284,82,14,steel,3)+circle(x+22,438,17,dark)+circle(x+w-22,438,17,dark)
  if(v===1)return shadow(320,460,230)+path(`M${x} 262V160Q${x} 120 ${x+44} 120H${x+w-44}Q${x+w} 120 ${x+w} 160V262Z`,c,dark,3)+rect(x+6,258,w-12,34,dark,4)+repeat(Math.floor(w/18),i=>line(x+14+i*18,262,x+14+i*18,288,steel,4))+food(320,262,w/2)+cart
  if(v===2)return shadow(320,470,200)+rect(108,170,424,250,dark,10)+repeat(12,i=>line(128+i*35,180,128+i*35,410,steel,9))+group(food(0,0,180),'translate(320,295) scale(1.6)')
  return shadow(320,460,230)+hood+cart
 }
 const r=n(p,'grillRadius',112,132),cy=n(p,'grillBowl',258,276),lid=r*n(p,'lidRise',.72,.86)
 const bowl=path(`M${320-r} ${cy}A${r} ${r*.92} 0 0 0 ${320+r} ${cy}Z`,c,dark,3)+repeat(2,i=>rect(i?320+r-6:320-r-22,cy+16,28,10,steel,4))+circle(320,cy+r*.62,10,steel)
 const legs=line(320-r*.55,cy+r*.7,320-r*.95,440,steel,9)+line(320+r*.55,cy+r*.7,320+r*.95,440,steel,9)+line(320,cy+r*.9,320,452,steel,8)+ellipse(320,cy+r+30,r*.55,11,steel)+circle(320-r*.95,440,19,dark)+circle(320+r*.95,440,19,dark)
 const lidShape=path(`M${320-r} ${cy}A${r} ${lid} 0 0 1 ${320+r} ${cy}Z`,c,dark,3)+rect(290,cy-lid-24,60,14,'#7a5a3c',6)+line(305,cy-lid-10,305,cy-lid+2,steel,5)+line(335,cy-lid-10,335,cy-lid+2,steel,5)+circle(320,cy-lid*.55,16,steel)+path(`M${320-r*.72} ${cy-lid*.42}q${r*.4}-${lid*.36} ${r*.62}-${lid*.48}`,'none','#ffffff',5,{opacity:.18})
 if(v===1)return shadow(320,462,190)+group(lidShape,`rotate(-72 ${320-r} ${cy})`)+bowl+ellipse(320,cy,r-4,20,dark)+coals(320,cy,r)+repeat(9,i=>line(320-r*.82+i*r*.2,cy-14,320-r*.82+i*r*.2,cy+14,steel,3))+legs
 if(v===2)return shadow(320,470,200)+ellipse(320,282,232,176,dark)+repeat(13,i=>line(110+i*35,140,110+i*35,424,steel,8))+group(food(0,0,160),'translate(320,282) scale(1.7)')
 return shadow(320,462,190)+legs+bowl+lidShape
}
// A skate boot on its frame: quad wheels with a toe stop, an inline wheel row, or an ice blade.
function skates(p,v){
 const ice=named(p,/\bice\b|figure skat|hockey skat/),inline=!ice&&named(p,/inline|in-line|blades?\b/),c=bodyTone(p,p.c),w=n(p,'skateLength',250,286),x=320-w/2,top=n(p,'skateTop',112,146),sole=332,wr=inline?n(p,'wheelR',28,33):n(p,'wheelR',33,40),wheel=named(p,/pastel|light-up|led/)?'#e9a6c0':p.accent
 const boot=path(`M${x+16} ${sole}V${top+40}Q${x+16} ${top} ${x+56} ${top}H${x+108}Q${x+126} ${top} ${x+126} ${top+26}V${sole-112}Q${x+150} ${sole-98} ${x+w-54} ${sole-72}Q${x+w} ${sole-56} ${x+w} ${sole-18}V${sole}Z`,c,dark,3)+rect(x+18,top,108,20,p.accent,10)+path(`M${x+110} ${top+10}Q${x+150} ${top+30} ${x+146} ${sole-100}`,'none',paper,12,{opacity:.55})+repeat(5,i=>line(x+112+i*16,top+44+i*24,x+132+i*16,top+60+i*24,paper,4)+line(x+132+i*16,top+44+i*24,x+112+i*16,top+60+i*24,paper,4))+rect(x+8,sole,w,14,dark,5)
 const under=ice?path(`M${x+30} ${sole+14}l14 40M${x+w-40} ${sole+14}l-10 40`,'none',steel,10)+path(`M${x-10} ${sole+58}H${x+w}q40 0 36-26`,'none','#c9d3d8',9):inline?rect(x+16,sole+12,w-26,22,steel,6)+repeat(4,i=>circle(x+44+i*(w-80)/3,sole+42,wr,dark)+circle(x+44+i*(w-80)/3,sole+42,wr*.42,wheel))+rect(x-14,sole+20,34,28,dark,7):rect(x+26,sole+12,w-52,12,steel,3)+repeat(2,i=>rect(x+50+i*(w-120),sole+22,22,14,steel,3)+circle(x+60+i*(w-120),sole+30+wr*.6,wr,wheel,{stroke:dark,'stroke-width':4})+circle(x+60+i*(w-120),sole+30+wr*.6,wr*.36,paper))+rect(x+w-12,sole+8,28,30,'#c9534f',9)
 const skate=boot+under
 if(v===1)return shadow(330,470,210)+group(skate,'translate(58,-22) scale(.94)',{opacity:.82})+group(skate,'translate(-30,26)')
 if(v===2)return shadow(320,470,200)+group(skate,`translate(${320-1.9*(x+w-60)} ${300-1.9*(sole+20)}) scale(1.9)`)
 return shadow(320,458,170)+skate
}
// A wireless charging pad or a multi-device charging stand.
function wirelessCharger(p,v){
 const c=bodyTone(p,'#2f3439'),stand=named(p,/stand|3-in-1|2-in-1|dock|station|tower/),r=n(p,'padR',92,114),led=p.accent
 const phone=(cx,cy,rot)=>group(rect(-74,-132,148,264,'#1e2328',22)+rect(-66,-122,132,244,'#4f6d7a',16)+rect(-66,-122,132,244,'#9fc9d4',16,{opacity:.35})+rect(-18,-118,36,8,'#1e2328',4),`translate(${cx} ${cy}) rotate(${rot})`)
 if(stand){
  const lean=n(p,'standLean',4,10),baseL=n(p,'standBase',150,170)
  const base=path(`M${320-baseL} 404q0-22 28-22h${baseL*2-56}q28 0 28 22v8q0 14-28 14H${348-baseL}q-28 0-28-14Z`,c,dark,3)+ellipse(320+baseL-62,394,34,9,'#e8ebed')+circle(320+baseL-62,393,4,led)+ellipse(320-baseL+66,396,38,10,steel)
  const upright=group(rect(-50,-250,100,252,c,22,{stroke:dark,'stroke-width':3})+circle(0,-150,42,'none',{stroke:steel,'stroke-width':5})+circle(0,-150,6,led),`translate(320 386) rotate(${lean})`)
  const extras=group(rect(-26,-36,52,40,'#f3f3f0',16,{stroke:steel,'stroke-width':2}),`translate(${320-baseL+66} 392)`)+group(rect(-20,-34,40,48,'#3a4046',12)+rect(-15,-28,30,36,'#5d7b88',8),`translate(${320+baseL-62} 380)`)
  if(v===1)return shadow(320,452,200)+base+upright
  if(v===2)return shadow(320,470,200)+group(base+extras,`translate(${320-2*(320+baseL-62)} ${300-2*390}) scale(2)`)
  return shadow(320,452,200)+base+upright+group(phone(0,-140,0),`translate(320 386) rotate(${lean})`)+extras
 }
 const pad=ellipse(320,362,r*1.5,r*.46,'#1c2125')+ellipse(320,350,r*1.5,r*.46,c,{stroke:dark,'stroke-width':2})+ellipse(320,350,r*1.22,r*.36,'none',{stroke:steel,'stroke-width':2})+ellipse(320,350+r*.36,7,3,led)+path(`M${320+r*1.45} 356q90 18 120 80`,'none',dark,8)
 if(v===1)return shadow(320,440,200)+pad+repeat(4,i=>ellipse(320,348,r*(.3+i*.2),r*(.1+i*.06),'none',{stroke:'#b07a45','stroke-width':3}))
 if(v===2)return shadow(320,470,200)+circle(320,262,r*1.9,c,{stroke:dark,'stroke-width':3})+circle(320,262,r*1.55,'none',{stroke:steel,'stroke-width':3})+repeat(60,i=>circle(320+Math.cos(i*2.4)*(i%9)*r*.18,262+Math.sin(i*2.4)*(i%9)*r*.18,2.4,steel))+rect(312,262+r*1.6,16,10,led,4)
 return shadow(320,440,200)+pad+group(phone(0,0,0),`translate(320 318) rotate(-62) scale(.62 .9) skewX(28)`)
}
// Espresso machine with portafilter, a capsule machine, a bean-to-cup automatic or a drip brewer.
function coffeeMachine(p,v){
 const c=bodyTone(p,p.c),capsule=named(p,/capsule|\bpods?\b|nespresso|vertuo|keurig|k-cup|dolce gusto|tassimo/),auto=!capsule&&named(p,/automatic|bean.to.cup|magnifica|dinamica|eletta|jura/),drip=!capsule&&!auto&&named(p,/drip|filter coffee|carafe|cold brew|\d+.cup|coffee maker/),grinder=named(p,/express|touch|grinder|oracle|impress/),w=n(p,'coffeeWidth',226,262),h=n(p,'coffeeHeight',226,262),x=320-w/2,base=432
 const cup=(cx,cy,s=1)=>group(path('M-26 -40h52l-6 40h-40Z',paper,dark,2)+path('M24 -32q18 0 14 14t-18 8','none',dark,4)+ellipse(0,-40,26,6,'#6b4430'),`translate(${cx} ${cy}) scale(${s})`)
 const tray=rect(x+12,base-22,w-24,18,steel,4)+repeat(Math.floor((w-40)/14),i=>line(x+22+i*14,base-19,x+22+i*14,base-8,dark,2))
 let front
 if(capsule){
  const cw=w*.62,cx=320-cw/2
  front=rect(cx+cw*.55,base-h-6,cw*.5,h-20,'#9fc9d4',14,{opacity:.6,stroke:steel,'stroke-width':2})+rect(cx,base-h+10,cw,h-10,c,cw/3,{stroke:dark,'stroke-width':3})+ellipse(320,base-h+30,cw*.42,18,dark)+circle(320,base-h+30,9,p.accent)+rect(304,base-h+100,32,26,dark,6)+rect(cx+10,base-30,cw-20,14,steel,5)+cup(320,base-32)+circle(cx+cw-22,base-h+68,8,p.accent)
 }else if(auto){
  front=rect(x,base-h-34,w,h+34,c,12,{stroke:dark,'stroke-width':3})+ellipse(x+w*.3,base-h-34,w*.22,10,dark)+rect(x+w*.22,base-h-6,w*.56,46,'#1f2a33',6)+repeat(4,i=>rect(x+w*.27+i*w*.12,base-h+8,w*.08,16,i===1?p.accent:'#5d7b88',3))+rect(296,base-h+68,48,28,dark,6)+repeat(2,i=>rect(306+i*20,base-h+94,8,14,steel,2))+rect(x+16,base-h+124,w-32,h-140,'#3a4147',10)+tray+cup(320,base-24)+circle(x+w-26,base-h+90,13,steel)
 }else if(drip){
  front=rect(x+w-82,base-h,74,h,c,10,{stroke:dark,'stroke-width':3})+rect(x+8,base-h,w-16,58,c,10,{stroke:dark,'stroke-width':3})+rect(x+14,base-22,w-28,20,c,6,{stroke:dark,'stroke-width':2})+path(`M${x+44} ${base-140}h104l10 26v86q0 30-30 30h-64q-30 0-30-30v-86Z`,'#9fc9d4',dark,3,{opacity:.85})+path(`M${x+36} ${base-60}h120v18q0 30-30 30h-62q-28 0-28-30Z`,'#6b4430','none')+path(`M${x+150} ${base-120}q36 6 30 50`,'none',dark,8)+rect(x+w-66,base-h+80,42,12,p.accent,4)+circle(x+w-45,base-h+120,9,'#d36a5a')
 }else{
  front=rect(x,base-h,w,h,c,14,{stroke:dark,'stroke-width':3})+rect(x+6,base-h-12,w-12,14,steel,4)+(grinder?path(`M${x+20} ${base-h-12}l-10-82h82l-10 82Z`,'#9fc9d4',dark,3,{opacity:.85})+repeat(10,i=>ellipse(x+28+(i%5)*12,base-h-34-Math.floor(i/5)*14,6,4,'#5a3a28')):'')+circle(x+w*.5,base-h+46,22,paper,{stroke:dark,'stroke-width':3})+line(x+w*.5,base-h+46,x+w*.5+12,base-h+34,dark,3)+repeat(4,i=>circle(x+w-30-i*22,base-h+46,8,i===0?p.accent:dark))+rect(x+16,base-h+82,w-32,h-110,'#3a4147',10)+rect(298,base-h+86,44,22,steel,4)+rect(278,base-h+106,84,18,steel,7)+rect(356,base-h+108,96,12,dark,6)+line(x+w-22,base-h+96,x+w-6,base-92,steel,7)+tray+cup(320,base-26)
 }
 if(v===1)return shadow(320,462,170)+group(front,`translate(640,0) scale(-1,1)`)+rect(x-8,base-h+20,20,h-30,'#9fc9d4',6,{opacity:.55})
 if(v===2)return shadow(320,470,190)+group(front,`translate(${320-2*320} ${290-2*(base-80)}) scale(2)`)
 return shadow(320,462,170)+front
}
// Necklace with pendant, earrings, a ring or a bracelet, in the metal its name gives.
function jewelry(p,v){
 const metal=named(p,/rose ?gold|로즈/)?'#d8a08a':named(p,/gold|골드|18k|14k|24k|금/)?'#d6b04c':'#c9d0d6',gem=named(p,/heart|하트/)?'#d4515f':named(p,/blue|sapphire|블루/)?'#4f78c4':named(p,/green|emerald/)?'#4f9e6e':'#eef3f6',heart=named(p,/heart|하트|infinity|인피니티/)
 const kind=named(p,/earring|귀걸이|귀고리/)?'ear':named(p,/bracelet|팔찌|발찌|anklet|bangle/)?'wrist':named(p,/\brings?\b|반지(?!갑)/)&&!named(p,/necklace|목걸이/)?'ring':'neck'
 const r=n(p,'gemSize',18,28),drop=n(p,'chainDrop',250,300)
 const pendant=(cx,cy,s)=>group((heart?path('M0 18C-30 -4 -26 -30 -10 -30C-2 -30 0 -22 0 -18C0 -22 2 -30 10 -30C26 -30 30 -4 0 18Z',metal,dark,2)+path('M0 8C-16 -4 -14 -20 -6 -20C0 -20 0 -14 0 -12','none',gem,4):circle(0,0,r,metal,{stroke:dark,'stroke-width':2})+circle(0,0,r*.66,gem,{stroke:steel,'stroke-width':1.5}))+circle(0,-r-8,5,'none',{stroke:metal,'stroke-width':3}),`translate(${cx} ${cy}) scale(${s})`)
 const chain=(x1,y1,x2,y2,cy)=>path(`M${x1} ${y1}Q${(x1+x2)/2} ${cy*2-(y1+y2)/2} ${x2} ${y2}`,'none',metal,3,{'stroke-dasharray':'5 3'})
 let item
 if(kind==='ear')item=repeat(2,i=>{const x=250+i*140;return circle(x,190,8,metal,{stroke:dark,'stroke-width':1.5})+line(x,198,x,228,metal,3)+(heart?group(pendant(0,0,1.1),`translate(${x} 262)`):circle(x,262,r*1.4,'none',{stroke:metal,'stroke-width':7})+circle(x,262+r*1.4,r*.5,gem,{stroke:steel,'stroke-width':1.5}))})
 else if(kind==='ring')item=ellipse(320,320,96,40,'none',{stroke:metal,'stroke-width':18})+ellipse(320,300,96,40,'none',{stroke:metal,'stroke-width':16})+path(`M300 262l20-40 20 40-20 14Z`,gem,steel,2)+line(304,262,320,236,'#ffffff',2)
 else if(kind==='wrist')item=ellipse(320,300,150,70,'none',{stroke:metal,'stroke-width':10,'stroke-dasharray':'14 4'})+pendant(320,374,1)+circle(176,300,8,metal)
 else item=chain(200,110,440,110,drop)+pendant(320,drop+r+14,1.4)
 if(v===1)return shadow(320,452,190)+rect(150,180,340,250,'#2f3a4a',16)+rect(170,200,300,210,'#3d4b5e',12)+path('M150 180l40-92h260l40 92Z','#26303c','none')+group(item,'translate(80,90) scale(.75)')
 if(v===2)return kind==='neck'?pendant(320,270,4.2):group(item,'translate(-320,-300) scale(2)')
 return shadow(320,452,160)+item
}
// A graphics card: fan shroud over the board, backplate edge, bracket with ports and gold contacts.
function graphicsCard(p,v){
 const fans=named(p,/\b50[89]0|\b40[89]0|\b7900|triple|3x|trio|gaming oc|strix|suprim|aorus/)?3:named(p,/mini|itx|single/)?1:2,len=n(p,'gpuLength',360,420),x=320-len/2+20,shroud=named(p,/white|화이트/)?'#e6e8e5':'#2d3237',accent=p.accent
 const fan=(cx,cy,R)=>circle(cx,cy,R,'#1c2025',{stroke:steel,'stroke-width':3})+repeat(9,i=>group(path(`M0 0q${R*.3}-${R*.5} ${R*.9}-${R*.3}q-${R*.5} ${R*.1}-${R*.9} ${R*.3}Z`,'#4a525a'),`translate(${cx} ${cy}) rotate(${i*40})`))+circle(cx,cy,R*.28,accent)
 const fr=Math.min(66,(len-40)/(fans*2.2))
 const front=rect(x,200,len,136,shroud,14,{stroke:dark,'stroke-width':3})+repeat(fans,i=>fan(x+len*(i+.5)/fans,268,fr))+line(x+12,206,x+len-12,206,accent,4)+rect(x-34,184,34,170,steel,3)+repeat(3,i=>rect(x-28,206+i*34,22,18,dark,3))+rect(x+40,336,len*.5,14,'#c9a54a',2)+repeat(Math.floor(len*.5/7),i=>line(x+44+i*7,338,x+44+i*7,348,'#8a6d2c',2))+rect(x+len-80,186,44,14,dark,3)
 if(v===1)return shadow(320,450,230)+rect(x,200,len,136,'#3a4147',14,{stroke:dark,'stroke-width':3})+repeat(18,i=>rect(x+30+i*((len-60)/18),230,8,76,'#262b30',3))+rect(x-34,184,34,170,steel,3)+rect(x+40,336,len*.5,14,'#c9a54a',2)
 if(v===2)return shadow(320,470,200)+fan(320,262,190)+rect(80,46,480,26,accent,6,{opacity:.6})
 return shadow(320,450,230)+front
}
// Batteries: a blister card of cells (AA/AAA), a 9V block or coin cells.
function battery(p,v){
 const count=Math.max(2,Math.min(12,Number(`${p.t} ${p.d?.canonicalTitle||''}`.match(/(\d+)\s*(?:-\s*)?(?:pack|pk|count|개입|개|입|알)/i)?.[1])||4)),thin=named(p,/\baaa\b/),coin=named(p,/cr\d{4}|coin|lr44|button cell|코인/),nine=named(p,/\b9v\b|9볼트/),band=named(p,/copper|duracell|듀라셀/)?'#c47a3a':p.accent
 const cell=(cx,cy,rot=0,s=1)=>group(rect(-(thin?13:18),-62,thin?26:36,124,dark,6)+rect(-(thin?13:18),-62,thin?26:36,44,band,6)+rect(-(thin?13:18),-26,thin?26:36,8,'#e8e1c8',1)+rect(-7,-70,14,9,steel,3)+line(-(thin?7:10),-50,-(thin?7:10),40,'#ffffff',3),`translate(${cx} ${cy}) rotate(${rot}) scale(${s})`)
 const coinCell=(cx,cy,s=1)=>group(circle(0,0,46,'#c9d0d6',{stroke:steel,'stroke-width':4})+circle(0,0,36,'#b3bcc3')+text('+',-8,10,30,dark),`translate(${cx} ${cy}) scale(${s})`)
 const block=(cx,cy)=>group(rect(-44,-70,88,140,dark,8)+rect(-44,-70,88,46,band,8)+circle(-18,-80,10,steel)+rect(8,-88,22,18,steel,3),`translate(${cx} ${cy})`)
 const shown=Math.min(count,coin?4:nine?2:8),gap=coin?100:nine?110:thin?36:46
 const items=repeat(shown,i=>{const cx=320-(shown-1)*gap/2+i*gap;return coin?coinCell(cx,300):nine?block(cx,300):cell(cx,300)})
 if(v===1)return shadow(320,452,200)+repeat(Math.min(count,6),i=>coin?coinCell(220+(i%3)*100,240+Math.floor(i/3)*110,.9):nine?block(240+(i%2)*160,300):cell(200+i*46,320+(i%2)*20,60+i*14))
 if(v===2)return shadow(320,470,200)+(coin?coinCell(320,270,3.4):nine?group(block(0,0),'translate(320,270) scale(2.4)'):cell(320,276,90,2.6))
 return shadow(320,452,200)+rect(320-Math.min(260,shown*gap/2+50),130,Math.min(520,shown*gap+100),300,'#eef1f2',14,{stroke:steel,'stroke-width':2})+rect(320-Math.min(260,shown*gap/2+50),130,Math.min(520,shown*gap+100),54,band,14)+circle(320,148,9,'#ffffff')+items+rect(320-Math.min(240,shown*gap/2+30),214,Math.min(480,shown*gap+60),180,'#ffffff',12,{opacity:.25,stroke:steel,'stroke-width':2})
}
// Disposable face masks: a fold-flat mask with ear loops in front of its dispenser box.
function faceMask(p,v){
 const mc=named(p,/black|블랙/)?'#33393f':named(p,/blue|블루|덴탈|dental|surgical/)?'#a9c8e0':named(p,/pink|핑크/)?'#e7b7c3':'#f1f2f0',kf=named(p,/kf94|kf80|kn95|n95|새부리|boat/),w=n(p,'maskWidth',220,250)
 const mask=(cx,cy,s)=>group((kf?path(`M${-w/2} 0Q${-w/2+20} -78 0 -92Q${w/2-20} -78 ${w/2} 0Q${w/2-20} 78 0 92Q${-w/2+20} 78 ${-w/2} 0Z`,mc,dark,2)+path('M0 -92V92','none',steel,2):rect(-w/2,-62,w,124,mc,22,{stroke:dark,'stroke-width':2})+repeat(3,i=>line(-w/2+10,-24+i*24,w/2-10,-24+i*24,steel,2)))+path(`M${-w/2} -40q-46 40 0 80M${w/2} -40q46 40 0 80`,'none',mc,6)+path(`M${-w/2} -40q-46 40 0 80M${w/2} -40q46 40 0 80`,'none',steel,1.5),`translate(${cx} ${cy}) scale(${s})`)
 const box=rect(150,150,340,200,named(p,/kf94|보건용/)?'#e7eef5':p.c,10,{stroke:steel,'stroke-width':2})+poly('490,150 516,164 516,364 490,350','#c8d2da')+rect(170,170,120,36,p.accent,6)+ellipse(400,190,60,16,dark,{opacity:.6})
 if(v===1)return shadow(320,452,210)+repeat(4,i=>group(rect(-80,-56,160,112,'#ffffff',8,{stroke:steel,'stroke-width':2})+rect(-70,-46,60,16,p.accent,4)+group(mask(30,8,.4),''),`translate(${210+(i%2)*200} ${210+Math.floor(i/2)*140}) rotate(${i*4-6})`))
 if(v===2)return shadow(320,470,200)+mask(320,270,1.9)
 return shadow(320,452,210)+box+mask(320,360,.95)
}
// Nappies, pull-ups and sanitary pads: a soft printed pack with a carry handle and folded stack.
function softPack(p,v){
 const pads=named(p,/sanitary|pad|liner|생리대|라이너|요실금|incontinence/),w=n(p,'packWidth',240,284),h=n(p,'packHeight',250,290),x=320-w/2,y=440-h,c=pads?'#f2d6e2':named(p,/pull|팬티/)?'#d8e7f4':'#e5f0f7',band=p.accent
 const pack=path(`M${x+16} ${y}H${x+w-16}Q${x+w} ${y} ${x+w} ${y+24}V${y+h-14}Q${x+w} ${y+h} ${x+w-16} ${y+h}H${x+16}Q${x} ${y+h} ${x} ${y+h-14}V${y+24}Q${x} ${y} ${x+16} ${y}Z`,c,dark,3)+ellipse(320,y+26,34,12,'#ffffff',{stroke:steel,'stroke-width':2})+rect(x+18,y+h*.3,w-36,h*.42,'#ffffff',18,{opacity:.85})+(pads?path(`M${x+w*.3} ${y+h*.5}q${w*.2}-60 ${w*.4} 0q-${w*.2} 60-${w*.4} 0Z`,band,'none'):circle(x+w*.36,y+h*.5,h*.12,'#f2d3b4')+circle(x+w*.33,y+h*.48,3,dark)+circle(x+w*.39,y+h*.48,3,dark)+path(`M${x+w*.33} ${y+h*.54}q${w*.03} 8 ${w*.06} 0`,'none',dark,2))+rect(x+w*.55,y+h*.42,w*.3,18,band,6)+rect(x+w*.55,y+h*.5,w*.24,10,steel,4)+rect(x+w*.55,y+h*.58,w*.2,10,steel,4)+rect(x+18,y+h-38,w-36,16,band,6)
 const single=pads?path('M220 280q100-70 200 0q-20 40-100 40t-100-40Z','#ffffff',steel,2)+path('M250 280q70-34 140 0','none',band,6):path('M200 180h240q-10 80-50 110l50 120H200l50-120q-40-30-50-110Z','#ffffff',steel,3)+rect(190,180,40,30,band,8)+rect(410,180,40,30,band,8)+path('M260 330q60 20 120 0','none',steel,2,{'stroke-dasharray':'6 4'})
 if(v===1)return shadow(320,452,200)+single
 if(v===2)return shadow(320,470,200)+group(pack,`translate(${320-1.8*320} ${280-1.8*(y+h*.5)}) scale(1.8)`)
 return shadow(320,452,180)+repeat(8,i=>line(x+w+4,y+30+i*((h-50)/7),x+w+16,y+36+i*((h-50)/7),steel,3))+pack
}
// Toothbrushes (manual or electric on a charger) and toothpaste tubes.
function oralCare(p,v){
 const brushes=named(p,/toothbrush|tooth brush|칫솔/),electric=named(p,/electric|sonic|전동|oral-b io|sonicare/),count=Math.max(1,Math.min(6,Number(`${p.t} ${p.d?.canonicalTitle||''}`.match(/(\d+)\s*(?:-\s*)?(?:pack|pk|개입|개|입)/)?.[1])||(brushes?3:1)))
 const brush=(cx,cy,rot,c)=>group(rect(-9,-40,18,250,c,9,{stroke:dark,'stroke-width':1.5})+rect(-12,-110,24,70,'#ffffff',8,{stroke:steel,'stroke-width':1.5})+repeat(10,i=>rect(-10+(i%2)*10,-106+Math.floor(i/2)*13,9,11,i%3?'#dfe9f0':'#7fb3d9',2))+rect(-6,40,12,90,'#ffffff',6,{opacity:.4}),`translate(${cx} ${cy}) rotate(${rot})`)
 const ebrush=(cx,cy)=>group(rect(-24,-30,48,250,p.c,22,{stroke:dark,'stroke-width':2})+rect(-8,-110,16,90,'#eef0f1',6)+rect(-12,-128,24,26,'#ffffff',8,{stroke:steel,'stroke-width':1.5})+circle(0,40,10,p.accent)+ellipse(0,232,48,14,'#3a4147'),`translate(${cx} ${cy})`)
 const tube=(cx,cy,s)=>group(path('M-60 -150h120l-6 210h-108Z',paper,dark,2)+rect(-62,-158,124,14,steel,3)+repeat(10,i=>line(-56+i*12,-156,-56+i*12,-146,dark,1))+rect(-34,60,68,40,p.accent,8,{stroke:dark,'stroke-width':2})+rect(-52,-90,104,70,p.accent,6)+path('M-40 -50q40-24 80 0','none','#ffffff',5),`translate(${cx} ${cy}) scale(${s})`)
 let body
 if(electric)body=ebrush(320,190)
 else if(brushes)body=repeat(Math.min(count,5),i=>brush(320+(i-(Math.min(count,5)-1)/2)*44,210,(i-(Math.min(count,5)-1)/2)*7,brightTone(p,i)))
 else body=rect(170,170,300,92,p.accent,8,{stroke:dark,'stroke-width':2})+poly('470,170 492,182 492,274 470,262',dark,{opacity:.4})+rect(190,190,120,18,'#ffffff',4,{opacity:.85})+group(tube(0,0,1),'translate(330,380) rotate(-90) scale(.72)')
 if(v===1)return shadow(320,452,190)+(brushes||electric?group(body,'translate(640,0) scale(-1,1)')+rect(200,380,240,40,'#eef0f1',12,{stroke:steel,'stroke-width':2}):tube(320,300,1.1))
 if(v===2)return shadow(320,470,200)+(brushes||electric?group(body,`translate(${320-2.2*320} ${260-2.2*110}) scale(2.2)`):group(tube(0,0,1),'translate(320,330) rotate(-90) scale(1.6)')+path('M410 250q60-30 100 10q-40 30-100-10Z','#eef3f6',steel,2))
 return shadow(320,452,190)+body
}
const brightTone=(p,i)=>`hsl(${(p.h+i*61)%360} 55% 58%)`
// Washing-up liquid: a squeezable bottle with a flip cap (or a refill pouch), bubbles and a sponge.
function dishSoap(p,v){
 const refill=named(p,/refill|리필|pouch/),liquid=named(p,/lemon|레몬/)?'#e8d35a':named(p,/green|apple|녹차|그린/)?'#7fbf6a':named(p,/blue|blue|ocean/)?'#6aa6d8':'#e5a06a',h=n(p,'soapHeight',250,290),w=n(p,'soapWidth',110,130),y=440-h
 const bottle=refill?path(`M220 ${y+40}h200l14 ${h-50}q0 10-10 10H216q-10 0-10-10Z`,'url(#glass)',dark,2)+path(`M226 ${y+120}h188l10 ${h-140}H216Z`,liquid,'none',0,{opacity:.85})+rect(292,y+10,56,34,dark,6)+rect(240,y+150,160,70,'#ffffff',8,{opacity:.85})
  :path(`M${320-w/2} ${y+60}q0-26 26-26h${w-52}q26 0 26 26v${h-70}q0 10-10 10H${320-w/2+10}q-10 0-10-10Z`,liquid,dark,2)+rect(296,y,48,38,'#ffffff',8,{stroke:dark,'stroke-width':2})+rect(310,y-14,20,16,'#ffffff',4,{stroke:dark,'stroke-width':1.5})+rect(320-w/2+14,y+110,w-28,90,'#ffffff',10,{opacity:.88})+rect(320-w/2+24,y+124,w-48,16,p.accent,4)+circle(320,y+170,16,liquid)+line(320-w/2+12,y+70,320-w/2+12,y+h-30,'#ffffff',5)
 const bubbles=repeat(7,i=>circle(410+(i*37)%90,y+40+(i*53)%160,6+(i%3)*5,'#ffffff',{stroke:'#9fc9d4','stroke-width':2,opacity:.85}))
 const sponge=rect(150,380,110,52,'#f0d36a',10,{stroke:dark,'stroke-width':1.5})+rect(150,368,110,22,'#5f8f5a',8)
 if(v===1)return shadow(320,452,190)+group(bottle,'translate(640,0) scale(-1,1)')+sponge
 if(v===2)return shadow(320,470,200)+group(bottle,`translate(${320-1.8*320} ${260-1.8*(y+140)}) scale(1.8)`)+bubbles
 return shadow(320,452,190)+bottle+bubbles
}
// Fresh meat and fish in a tray under film: pork belly, steak, chicken, a fish or salmon fillets.
function meat(p,v){
 const kind=named(p,/salmon|연어/)?'salmon':named(p,/shrimp|prawn|새우/)?'shrimp':named(p,/fish|mackerel|cod|bass|tuna|고등어|갈치|조기|굴비|생선|광어|도미|삼치/)?'fish':named(p,/chicken|turkey|닭/)?'chicken':named(p,/belly|bacon|삼겹|오겹|대패/)?'belly':'steak'
 const tray=(w=n(p,'trayWidth',360,400))=>rect(320-w/2,236,w,190,named(p,/black|블랙|프리미엄|한우/)?'#2d3237':'#f1f0ec',24,{stroke:steel,'stroke-width':3})+rect(320-w/2+14,250,w-28,162,named(p,/black|블랙|프리미엄|한우/)?'#3a4147':'#e4e2dc',18)
 const piece=i=>{const x=200+(i%3)*90,y=270+Math.floor(i/3)*64
  if(kind==='belly')return group(repeat(5,j=>rect(0,j*10,120,10,j%2?'#f3e6dc':'#d77f80',2)),`translate(${x-30} ${y}) rotate(${-8+i*4})`)
  if(kind==='chicken')return ellipse(x+30,y+26,62,28,'#f1c9b7',{stroke:'#d79f8c','stroke-width':2})
  if(kind==='salmon')return group(rect(0,0,110,52,'#f08a5d',10)+repeat(5,j=>path(`M${14+j*20} 4q-8 22 0 44`,'none','#fbd2bd',3)),`translate(${x-24} ${y}) rotate(${-6+i*3})`)
  if(kind==='shrimp')return path(`M${x} ${y+40}q10-44 54-36q20 6 14 30l-14-6q2-12-10-12q-24 0-26 28Z`,'#f19a6e','#c96a45',2)
  return path(`M${x-20} ${y+6}q60-26 120 0q18 30-10 50q-60 16-110-4q-20-20 0-46Z`,'#b6383c','#7c2226',2)+repeat(6,j=>path(`M${x-6+j*16} ${y+8}q6 18-4 40`,'none','#efd7d0',2))}
 const fish=(cx,cy,s)=>group(path('M-150 0Q-80 -60 60 -40L140 -70L120 0L140 70L60 40Q-80 60 -150 0Z','#9aa9b5',dark,2)+path('M-140 4Q-60 30 60 24','none','#d9e2e8',8)+circle(-110,-10,8,'#ffffff')+circle(-110,-10,4,dark)+repeat(8,i=>path(`M${-60+i*14} -24q6 24 0 48`,'none','#7f8f9b',1.5)),`translate(${cx} ${cy}) scale(${s})`)
 const label=rect(400,260,96,56,'#ffffff',6,{stroke:steel,'stroke-width':1.5})+rect(408,268,80,12,p.accent,3)+repeat(3,i=>rect(408,286+i*8,60-i*12,4,steel,2))
 const film=path('M140 244q180-30 360 0','none','#ffffff',6,{opacity:.6})+rect(140,236,360,190,'#ffffff',24,{opacity:.12})
 const contents=kind==='fish'?fish(320,330,1)+fish(320,386,.8):repeat(kind==='chicken'?4:6,piece)
 if(v===1)return shadow(320,452,210)+tray()+(kind==='fish'?fish(320,330,1.05):repeat(3,piece))+film
 if(v===2)return shadow(320,470,200)+group(contents,`translate(${320-2*300} ${280-2*310}) scale(2)`)
 return shadow(320,452,210)+tray()+contents+film+label
}
const renderers={desktop,router,watch,'storage-drive':storage,'smart-device':smartDevice,printer,clock,microwave,tent,stroller,tool,collectible,media,card,faucet,grill,skates,'wireless-charger':wirelessCharger,'coffee-machine':coffeeMachine,jewelry,'graphics-card':graphicsCard,battery,'face-mask':faceMask,diapers:softPack,'oral-care':oralCare,'dish-soap':dishSoap,meat}
export const specialtyFamilies=Object.freeze(Object.keys(renderers))
export function renderSpecialty(family, model, view=0){return renderers[family]?.(model,view)||''}
