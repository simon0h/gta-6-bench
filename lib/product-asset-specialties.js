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
 const art=(x,y,w,h,back=false)=>rect(x,y,w,h,p.c,9,{stroke:steel,'stroke-width':2})+(back?rect(x+w*.08,y+h*.08,w*.84,h*.14,dark,2)+repeat(6,i=>line(x+w*.12,y+h*(.35+i*.07),x+w*(.72+(i%2)*.13),y+h*(.35+i*.07),paper,2))+rect(x+w*.12,y+h*.83,w*.52,h*.06,steel,2):circle(x+w*.66,y+h*.42,w*.23,p.accent)+poly(`${x+w*.07},${y+h*.73} ${x+w*.44},${y+h*.2} ${x+w*.92},${y+h*.81}`,dark)+path(`M${x+w*.17} ${y+h*.63}q${w*.47}-${h*.16} ${w*.65} ${h*.02}`,'none',paper,3)+text(String(p.title||'').slice(0,gift?32:22),x+w*.09,y+h*.14,w*.052,paper,{'font-weight':700})+(gift?'':text('COLLECTOR SERIES',x+w*.09,y+h*.93,w*.04,paper)))
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
const renderers={desktop,router,watch,'storage-drive':storage,'smart-device':smartDevice,printer,clock,microwave,tent,stroller,tool,collectible,media,card}
export const specialtyFamilies=Object.freeze(Object.keys(renderers))
export function renderSpecialty(family, model, view=0){return renderers[family]?.(model,view)||''}
