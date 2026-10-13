import { mkdir, writeFile } from 'node:fs/promises'
import { PRODUCTS as bestbuy } from './data.js'
import { PRODUCTS as argos } from '../argos/data.js'
import { PRODUCTS as jb } from '../jb-hifi/data.js'
import { browseProducts as smyths } from '../smyths-toys/browse.js'
const shapes={
 laptop:'<path d="M64 59h192v126H64z"/><path d="M43 207h234l-21-22H64z"/><path d="M78 74h164v97H78z" fill="#bfd1da"/>',
 desktop:'<rect x="56" y="42" width="87" height="180" rx="9"/><rect x="159" y="79" width="105" height="80" rx="4"/><path d="M205 159v41m-27 2h54"/><circle cx="99" cy="71" r="8" fill="#b6d2df"/>',
 monitor:'<rect x="36" y="48" width="248" height="153" rx="8"/><path d="M51 63h218v118H51z" fill="#bfd1da"/><path d="M146 201v25h-53v8h134v-8h-53v-25"/>',
 tablet:'<rect x="79" y="28" width="162" height="210" rx="14"/><path d="M91 43h138v174H91z" fill="#bfd1da"/>',
 keyboard:'<rect x="27" y="94" width="266" height="107" rx="9"/><path d="M47 116h226m-226 23h226m-226 23h226m-171 23h120" stroke="#dce5e9" stroke-width="8"/>',
 mouse:'<path d="M104 220V107Q104 39 160 39Q216 39 216 107V220Z"/><path d="M160 43v61M106 113h108" stroke="#dce5e9" stroke-width="5"/>',
 drive:'<rect x="89" y="35" width="142" height="198" rx="16"/><path d="M111 59h98v115h-98z" fill="#dce5e9"/><circle cx="160" cy="112" r="40" fill="#8fa6b4"/><circle cx="160" cy="112" r="10" fill="#dce5e9"/>',
 router:'<rect x="49" y="135" width="222" height="69" rx="12"/><path d="M72 135V50m176 85V50" stroke-width="10"/><path d="M81 178h52m22 0h16m19 0h16" stroke="#cce1e8" stroke-width="6"/>',
 headphones:'<path d="M74 163V119a86 86 0 0 1 172 0v44" fill="none" stroke-width="23"/><rect x="56" y="126" width="49" height="100" rx="17"/><rect x="215" y="126" width="49" height="100" rx="17"/>',
 speaker:'<rect x="101" y="30" width="118" height="202" rx="12"/><circle cx="160" cy="82" r="28" fill="#c3d2da"/><circle cx="160" cy="162" r="46" fill="#c3d2da"/><circle cx="160" cy="162" r="19"/>',
 tv:'<rect x="24" y="46" width="272" height="162" rx="6"/><path d="M37 58h246v137H37z" fill="#a9c4d2"/><path d="M82 208l-19 27m175-27 19 27" stroke-width="10"/>',
 projector:'<rect x="53" y="87" width="214" height="127" rx="20"/><circle cx="196" cy="140" r="41" fill="#b7d6e4"/><circle cx="196" cy="140" r="26" fill="#426579"/><path d="M76 145h55m-55 18h55" stroke="#d9e1e7" stroke-width="7"/>',
 phone:'<rect x="104" y="20" width="112" height="226" rx="18"/><path d="M117 39h86v172h-86z" fill="#c2d4df"/><circle cx="160" cy="229" r="7" fill="#c2d4df"/>',
 watch:'<path d="M135 20h50v68h-50zm0 167h50v59h-50z"/><rect x="110" y="74" width="100" height="125" rx="27"/><circle cx="160" cy="136" r="38" fill="#c2d4df"/><path d="M160 107v30l24 13" stroke="#506779" stroke-width="7" fill="none"/>',
 camera:'<path d="M52 86h55l18-23h65l17 23h61v121H52z"/><circle cx="160" cy="144" r="49" fill="#bed1dc"/><circle cx="160" cy="144" r="32" fill="#526c7f"/>',
 appliance:'<rect x="77" y="37" width="166" height="202" rx="16"/><circle cx="160" cy="131" r="58" fill="#d3e0e6"/><path d="M101 214h119M104 65h114" stroke="#d3e0e6" stroke-width="8"/>',
 vacuum:'<path d="M146 30h28v70h-28zM147 174h24v47h-24zM101 219h118v22H101z"/><rect x="123" y="80" width="74" height="103" rx="23" fill="#9fb5c1"/>',
 controller:'<path d="M68 94Q92 73 118 94h84q26-21 50 0l35 116q-22 29-62-27H95q-40 56-62 27z"/><path d="M80 113v47m-23-24h47" stroke="#d2dfe6" stroke-width="12"/><circle cx="229" cy="119" r="10" fill="#d2dfe6"/><circle cx="252" cy="143" r="10" fill="#d2dfe6"/>',
 case:'<rect x="44" y="82" width="232" height="142" rx="24"/><path d="M119 80V59h82v21M44 138h232" fill="none" stroke-width="9"/><path d="M78 97v103m164-103v103" stroke="#bfd0d9" stroke-width="8"/>',
 microphone:'<rect x="126" y="32" width="68" height="139" rx="32"/><path d="M107 127v18q0 58 53 57q53 1 53-57v-18M160 202v33m-42 2h84" fill="none" stroke-width="9"/>',
 bricks:'<path d="M43 138h113v74H43zm122-41h112v115H165zM65 59h112v69H65z"/><path d="M60 128h32v10H60zm52 0h32v10h-32zm65-43h32v12h-32zm54 0h32v12h-32zM80 47h32v12H80zm47 0h32v12h-32z" fill="#aec3ce"/>',
 figure:'<circle cx="160" cy="50" r="25"/><path d="M124 84h72l18 75h-26v76h-23v-73h-10v73h-23v-76h-26zM124 95l-30 68-17-8 27-64zm72 0 30 68 17-8-27-64z"/>',
 doll:'<circle cx="160" cy="50" r="26"/><path d="M138 78h44l37 116h-118zM135 192h22v43h-22zm29 0h22v43h-22zM131 93l-34 71-13-9 26-76zm58 0 34 71 13-9-26-76z"/>',
 plush:'<circle cx="110" cy="55" r="22"/><circle cx="210" cy="55" r="22"/><ellipse cx="160" cy="93" rx="68" ry="61"/><ellipse cx="160" cy="179" rx="75" ry="62"/><ellipse cx="92" cy="179" rx="28" ry="47"/><ellipse cx="228" cy="179" rx="28" ry="47"/><circle cx="135" cy="82" r="7" fill="#d6e0e6"/><circle cx="185" cy="82" r="7" fill="#d6e0e6"/>',
 train:'<path d="M38 111h163v79H38zM61 65h83v48H61zM207 112h80v78h-80z"/><circle cx="76" cy="202" r="20"/><circle cx="162" cy="202" r="20"/><circle cx="246" cy="202" r="20"/><path d="M77 78h49v23H77z" fill="#d6e0e6"/>',
 car:'<path d="M39 131l33-56h128l48 56h31v65H34v-65z"/><circle cx="90" cy="198" r="29" fill="#445d6d"/><circle cx="233" cy="198" r="29" fill="#445d6d"/><path d="M87 90h96l28 41H68z" fill="#bcd0dc"/>',
 board:'<path d="M40 57h240v160H40z"/><path d="M55 72h210v130H55z" fill="#c8dbe5"/><path d="M75 173V101h163v72H75" fill="none" stroke="#668492" stroke-width="14"/><circle cx="82" cy="178" r="14"/><circle cx="211" cy="102" r="14"/>',
 puzzle:'<path d="M67 40h71v29q23 26 46 0V40h70v70h-28q-28 24 0 46h28v70h-70v-29q-23-25-46 0v29H67v-70h28q25-23 0-46H67z"/>',
 craft:'<path d="M57 92h206v123H57z" fill="#b9ccd7"/><path d="M80 84l33-51 10 7-26 53m46-7 5-61h12l3 61m28 0 24-58 11 5-18 59" stroke-width="12"/><path d="M69 151h182" stroke="#607f92" stroke-width="8"/>',
 science:'<path d="M115 30h89v20h-16v66l61 99q0 20-24 20H96q-25 0-24-20l60-99V50h-17z" fill="none" stroke-width="12"/><path d="M109 167h105l29 54H78z" fill="#adcbd9"/>',
 playset:'<path d="M38 51h244v35H38zm18 35h208v128H56z" fill="#c4d4de"/><path d="M74 105h76v80H74zm97 0h72v80h-72zM51 214h218v18H51z"/>',
 learning:'<rect x="53" y="46" width="214" height="182" rx="16" fill="#c5d7e0"/><circle cx="107" cy="102" r="27"/><path d="M158 75h57v57h-57zM92 163l33 44H58zM168 159h71v42h-71z"/>',
 music:'<path d="M49 184L254 56m-204-3 205 131" fill="none" stroke-width="10"/><path d="M79 86v82m40-95v108m40-122v136m40-152v165m40-182v195" stroke="#99b3c2" stroke-width="26"/>',
 outdoor:'<path d="M45 222V55h227v167" fill="none" stroke-width="12"/><path d="M62 74h192v137H62z" fill="none" stroke="#acbeca" stroke-width="4"/><circle cx="141" cy="201" r="34" fill="#c2d6e1"/>',
 bike:'<circle cx="72" cy="186" r="44" fill="none" stroke-width="13"/><circle cx="254" cy="186" r="44" fill="none" stroke-width="13"/><path d="M74 185l67-92 87 44 25 48M139 95l-17-31m95 72-14-79h31M102 62h45" fill="none" stroke-width="12"/>',
 crib:'<path d="M46 85h227v133H46z" fill="none" stroke-width="11"/><path d="M49 47v191m222-191v191M71 89v112m37-112v112m37-112v112m37-112v112m37-112v112m31-112v112" stroke-width="8"/>',
 bottle:'<path d="M137 27h47v25l22 19v145q-47 28-92 0V71l23-19z" fill="#c5dbe6"/><path d="M131 84h63v104h-63z" fill="#a7c3d1"/><path d="M146 97h38m-38 22h26m-26 22h38m-38 22h26" stroke-width="5"/>',
 stroller:'<path d="M85 190l64-74 71 78M140 105l-17-63H99M130 117h104l-31 67H91" fill="none" stroke-width="12"/><path d="M145 111q30-98 108-22l-19 28z" fill="#b1c9d5"/><circle cx="89" cy="219" r="24"/><circle cx="221" cy="219" r="24"/>',
 book:'<path d="M40 45q67-17 120 6 63-24 120-6v174q-60-20-120 0-63-22-120 0z" fill="#c1d3df"/><path d="M160 52v163M64 83h68m-68 30h68m-68 30h68m52-60h68m-68 30h68m-68 30h68" stroke-width="7"/>',
 chair:'<path d="M88 43h144v119H88zM61 143h199v51H61zM79 191v47m161-47v47"/><path d="M61 102h24v72H61zm175 0h24v72h-24z" fill="#adc4d1"/>',
 desk:'<path d="M34 80h252v25H34zM51 105h22v135H51zm196 0h22v135h-22zM84 112h88v67H84z"/><path d="M98 146h58" stroke="#dce7ed" stroke-width="6"/>',
 shelf:'<path d="M59 35h21v205H59zm181 0h21v205h-21zM80 40h160v18H80zm0 85h160v18H80zm0 84h160v18H80z"/>',
 lamp:'<path d="M127 31h65l44 82H83z"/><path d="M151 115h18v108h-18zM95 224h132v12H95z"/>',
 textile:'<path d="M51 57h210v160H51z" fill="#b6cdda"/><path d="M52 69h208m-208 34h208m-208 34h208m-208 34h208m-180-114v160m43-160v160m43-160v160m43-160v160" stroke="#e2eaf0" stroke-width="4"/>',
 kitchen:'<path d="M78 80h163v127q-82 37-163 0z" fill="#bacfdc"/><path d="M61 78h197v14H61zm63-22h67v22h-67zM78 102H50v55h28m163-55h28v55h-28" fill="none" stroke-width="12"/>',
 fitness:'<path d="M42 81h39v108H42zm39 23h32v62H81zm126 0h32v62h-32zm32-23h39v108h-39zM113 120h94v27h-94z"/>',
 garden:'<path d="M46 98h227v132H46z" fill="#b9cbd5"/><path d="M88 99V45q37 0 52 36m41 18V47q-39 5-52 37m77 15V60" fill="none" stroke-width="10"/>',
 fan:'<circle cx="160" cy="119" r="80" fill="#c5d8e3"/><path d="M151 203h18v28h-18zM109 229h102v12H109z"/><path d="M160 118q-77-17-39-57 44-22 39 57q59-56 78-7-4 52-78 7q8 80-42 69-40-25 42-69"/>',
 kettle:'<path d="M110 64h100l33 151H75zM132 49h56v15h-56z"/><path d="M213 78h53v78h-40M111 76L51 105l46 43" fill="none" stroke-width="13"/>',
 toaster:'<rect x="62" y="81" width="202" height="133" rx="21"/><path d="M93 93h127m-119 31h127" stroke="#d1e0e9" stroke-width="8"/><circle cx="238" cy="169" r="10" fill="#d1e0e9"/>',
 bag:'<path d="M78 72h164v158H78z"/><path d="M117 72V34h86v38" fill="none" stroke-width="12"/><path d="M92 141h135v68H92z" fill="#adc6d6"/>',
 clock:'<circle cx="160" cy="131" r="99" fill="#c2d7e3"/><path d="M160 67v65l46 31" fill="none" stroke-width="10"/>',
 mat:'<path d="M62 49h161l53 163H84z" fill="#aac3d1"/><path d="M67 51q-53 8-22 44l156-8q49-27 20-42z"/>',
}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]))
function choose(p){
 const t=p.title.toLowerCase()
 // Match product nouns, not fragments such as "tablet", "flight" or "format".
 // Category silhouettes deliberately remain simple when a design has no photo.
 for(const [re,shape]of [
  [/\bkettle\b/,'kettle'],[/\btoaster\b|sandwich press/,'toaster'],[/\bfan\b|\bcooler\b/,'fan'],
  [/\bclock\b|\bglobe\b/,'clock'],[/\bbag\b|\bpouch\b|\borganiser\b|\bfootmuff\b|rain cover|blackout cover/,'bag'],
  [/\bmat\b|\bblanket\b|\btowel\b|\bcurtain\b|\bblind\b/,'textile'],[/\bchair\b|\bbooster\b|\bstool\b/,'chair'],
  [/\bshelf\b|\bwardrobe\b|\bcabinet\b|\brack\b/,'shelf'],[/\btable\b|\bbench\b|\bdesk$/,'desk'],
  [/\blamp\b|\blight$|\blantern\b/,'lamp'],[/\bmirror\b/,'tablet'],[/\bbottle\b|\bcup\b|\bflask\b/,'bottle'],
  [/\bcontroller\b|\bgamepad\b|\bjoystick\b/,'controller'],[/\bheadset\b|\bheadphones\b/,'headphones'],[/\bstand\b|\bdock\b|\bhook\b/,'shelf'],
 ])if(re.test(t))return shape
 return p.shape
}
for(const[store,items]of Object.entries({bestbuy,argos,'jb-hifi':jb,'smyths-toys':smyths})){
 const dir=new URL(`../${store}/public/catalog500/`,import.meta.url);await mkdir(dir,{recursive:true})
 for(const p of items.filter(p=>p.art?.startsWith(`/${store}/static/catalog500/`))){const shape=choose(p);const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 290" role="img" aria-label="${esc(p.title)}"><title>${esc(p.title)}</title><rect width="320" height="290" fill="#f4f6f7"/><ellipse cx="160" cy="246" rx="113" ry="11" fill="#d9e0e4"/><g fill="#6d8494" stroke="#6d8494" stroke-width="3" stroke-linejoin="round">${shapes[shape]||shapes.case}</g><text x="160" y="276" text-anchor="middle" font-family="Arial,sans-serif" font-size="11" fill="#425464">${esc(p.type||p.family)}</text></svg>`;await writeFile(new URL(p.art.split('/').at(-1),dir),svg)}
}
