import { mkdir, writeFile } from 'node:fs/promises'
import { GAME_SEEDS } from '../lib/expanded-games.js'
import { esc } from '../lib/html.js'
const dir=new URL('../public/art/catalog500/games/',import.meta.url)
await mkdir(dir,{recursive:true})
function lines(title) {
  const result=['']
  for(const word of title.split(' ')){
    if((result.at(-1)+' '+word).trim().length>21)result.push(word)
    else result[result.length-1]=(result.at(-1)+' '+word).trim()
  }
  return result
}
function scene(g,index) {
  const moon=`<circle cx="${80+index%9*30}" cy="${190+index%5*13}" r="${25+index%4*8}" fill="#f6db9a"/>`
  if(g.genre==='Racing')return `<path d="M0 380L150 230h120L420 380v190H0Z" fill="#182737"/><path d="M185 270l-30 250M235 270l30 250" stroke="#ffe49c" stroke-width="7" stroke-dasharray="18 17"/><path d="M95 394l25-62h175l35 62-18 55H110Z" fill="#efcd79"/><path d="M149 339h121l18 40H130Z" fill="#314754"/><circle cx="126" cy="433" r="14" fill="#192332"/><circle cx="299" cy="433" r="14" fill="#192332"/>`
  if(g.genre==='Sports')return `<path d="M0 280h420v260H0z" fill="#27645d"/><ellipse cx="210" cy="386" rx="174" ry="100" fill="none" stroke="#d9e9ce" stroke-width="3"/><path d="M210 286v200M36 386h348" stroke="#d9e9ce" stroke-width="3"/><circle cx="210" cy="358" r="57" fill="#f1d8aa"/><path d="M161 336l98 44m-93 17l93-69M208 301v114" stroke="#526d60" stroke-width="4"/>`
  if(['Puzzle','Strategy','Arcade'].includes(g.genre))return `<g transform="translate(72 228) rotate(${index%3*6-6} 135 125)">${Array.from({length:16},(_,i)=>`<rect x="${i%4*68}" y="${Math.floor(i/4)*65}" width="54" height="51" rx="${g.genre==='Arcade'?25:8}" fill="${(i+index)%3===0?'#edd394':(i+index)%3===1?'#a6c8c1':'#cedbd9'}" opacity="${i%5===0?.4:1}"/>`).join('')}</g>`
  if(g.genre==='Rhythm')return `<g stroke="#b9d7da" stroke-width="3">${[260,297,334,371,408].map(y=>`<path d="M20 ${y}Q210 ${y-38}400 ${y}" fill="none"/>`).join('')}</g><g fill="#f5d398">${[0,1,2,3].map(i=>`<ellipse cx="${82+i*83}" cy="${347-i%2*50}" rx="25" ry="17"/><path d="M${105+i*83} ${347-i%2*50}v-103h35v20h-30v83z"/>`).join('')}</g>`
  if(['Simulation','Family','Party'].includes(g.genre))return `<path d="M0 395Q90 315 220 375T420 339v190H0Z" fill="#719c84"/><path d="M100 294h220v165H100Z" fill="#efdcae"/><path d="M73 300l138-105 135 105Z" fill="#bd6c55"/><path d="M182 370h55v89h-55Z" fill="#6c8f8f"/><g fill="#72989a"><path d="M124 327h36v37h-36zm140 0h36v37h-36z"/></g><path d="M168 463q39 45 89 66H75Z" fill="#dbb57e"/>`
  return `${moon}<path d="M0 370l75-85 58 60 94-120 108 121 85-62v245H0Z" fill="#172e45"/><path d="M0 429l94-77 109 50 92-75 125 99v103H0Z" fill="#3b6676"/><path d="M80 529Q139 456 223 421T309 339" fill="none" stroke="#e3c58c" stroke-width="16"/><path d="M187 345v63m-17-49l17-14 23 14m-23 27l-18 27m18-27l22 27" stroke="#f9e6bd" stroke-width="8" stroke-linecap="round"/><circle cx="187" cy="330" r="13" fill="#f9e6bd"/>`
}
for(const [index,g] of GAME_SEEDS.entries()){
  const title=lines(g.title),font=title.length>3?27:31
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="420" height="600" viewBox="0 0 420 600" role="img" aria-label="${esc(g.title)} cover"><defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="${g.color}"/><stop offset="1" stop-color="#102336"/></linearGradient></defs><rect width="420" height="600" fill="url(#sky)"/><path d="M0 168h420" stroke="#fff" stroke-opacity=".16"/><g fill="#fff" font-family="Georgia,serif" font-weight="bold" text-anchor="middle">${title.map((line,i)=>`<text x="210" y="${52+i*35}" font-size="${font}">${esc(line)}</text>`).join('')}</g>${scene(g,index)}<rect y="530" width="420" height="70" fill="#0d1927"/><text x="210" y="556" fill="#e9d3a0" text-anchor="middle" font-family="Arial,sans-serif" font-size="12" letter-spacing="3">${esc(g.genre.toUpperCase())}</text><text x="210" y="581" fill="#eee" text-anchor="middle" font-family="Arial,sans-serif" font-size="12">${esc(g.publisher)}</text></svg>`
  await writeFile(new URL(`${g.id}.svg`,dir),svg)
}
console.log(`Wrote ${GAME_SEEDS.length} original, titled vector covers.`)
