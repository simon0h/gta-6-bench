import { productGallery } from '../../lib/product-assets.js'
import { esc, money } from '../../lib/html.js'
import { CATALOG_PLATFORMS, makeGameFixtures } from '../../lib/expanded-games.js'
import { makeHardwareFixtures } from '../../lib/expanded-hardware.js'
export { CATALOG_PLATFORMS }
export const platformLabel = id => CATALOG_PLATFORMS.find(p=>p.id===id)?.short || id
export const pageWindow = (page,last) => [...new Set([1,...[page-2,page-1,page,page+1,page+2].filter(n=>n>1&&n<last),last])].sort((a,b)=>a-b).flatMap((n,i,a)=>i&&n-a[i-1]>1?[null,n]:[n])
export function physicalFixtures(original) {
 const games=original.filter(p=>p.catalogType==='game')
 return [...makeGameFixtures({count:300-games.length,existingPlatforms:games.map(p=>p.catalogPlatform),excludedTitles:original.map(p=>p.title)}),...makeHardwareFixtures({count:200-(original.length-games.length)})].map(p=>{
  const game=p.catalogType==='game',format=game?(['switch','switch-2','nintendo-ds'].includes(p.catalogPlatform)?'Game card':'Disc'):'Hardware'
  const compatibility=p.catalogPlatform==='xbox'&&game?'Xbox Series X with disc drive; not compatible with Series S':p.specs.Compatibility||p.specs.Platform
  return {...p,catalog500:true,physical:true,kind:'other',format:game?'physical':'hardware',formatLabel:format,platforms:[platformLabel(p.catalogPlatform)],family:p.id,available:p.stock>0,description:p.description+(game?` Physical ${format.toLowerCase()} for ${compatibility}.`:''),specs:{...p.specs,Format:format,...(game?{'Supported devices':compatibility}:{})},shippingLabel:'Free standard shipping · 3–5 business days',entitlements:[]}
 })
}
export function shippingFields(values={}) {
 const field=(name,label,optional=false)=>`<label for="${name}">${label}<input id="${name}" name="${name}" value="${esc(values[name]||'')}" ${optional?'':'required'} maxlength="120"></label>`
 return `<fieldset class="physical-shipping"><legend>Shipping address</legend><p>Physical items ship free by standard delivery in 3–5 business days. United States addresses only.</p>${field('shipName','Recipient name')}${field('shipAddress1','Street address')}${field('shipAddress2','Apartment or suite',true)}${field('shipCity','City')}${field('shipState','State (two-letter code)')}${field('shipZip','ZIP code')}<label for="shipCountry">Country<select id="shipCountry" name="shipCountry"><option value="US">United States</option></select></label></fieldset>`
}
const states='AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY'.split(' ')
export function readShipping(body) {
 const v=Object.fromEntries(['shipName','shipAddress1','shipAddress2','shipCity','shipState','shipZip','shipCountry'].map(k=>[k,typeof body[k]==='string'?body[k].trim():'']))
 const valid=v.shipName&&v.shipAddress1&&v.shipCity&&states.includes(v.shipState)&&/^\d{5}(-\d{4})?$/.test(v.shipZip)&&v.shipCountry==='US'&&Object.values(v).every(x=>x.length<=120)
 return {values:v,address:valid?{name:v.shipName,line1:v.shipAddress1,line2:v.shipAddress2||null,city:v.shipCity,state:v.shipState,postal_code:v.shipZip,country:'US'}:null,error:valid?null:'Enter a complete United States shipping address, including recipient, street, city, state and ZIP code.'}
}
export function physicalPage({base,p,action,idField,buttonClass,inCart=false,cartPath}) {
 return `<section class="physical-product"><p class="physical-eyebrow">Physical store offer · ${p.catalogType==='game'?'Game':p.catalogType==='console'?'Console':'Accessory'}</p><div class="physical-product-grid">${productGallery(base.split('/')[1],p,{className:'physical-product-art'})}<div><h1>${esc(p.title)}</h1><p>${esc(p.platforms.join(' / '))} · ${esc(p.formatLabel)}</p><p class="physical-price">${money(p.price)}</p><p>${esc(p.description)}</p><p>${esc(p.shippingLabel)}</p><p>This physical purchase does not add a digital license to your account library. Use the compatible hardware listed below.</p>${inCart?`<a class="${buttonClass}" href="${cartPath}">Open cart</a>`:`<form method="post" action="${action}"><input type="hidden" name="${idField}" value="${esc(p.id)}"><button class="${buttonClass}">Add to Cart</button></form>`}<h2>${p.catalogType==='game'?'Game details':'Specifications and compatibility'}</h2><dl class="physical-specs">${Object.entries(p.specs).map(([k,v])=>`<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl></div></div></section>`
}
export function shippingReceipt(order) {
 const a=order.shipping_address
 return a?`<section class="physical-receipt"><h3>Physical delivery</h3><p>Free standard shipping · 3–5 business days</p><p>${esc(a.name)}<br>${esc(a.line1)}${a.line2?`<br>${esc(a.line2)}`:''}<br>${esc(a.city)}, ${esc(a.state)} ${esc(a.postal_code)} · US</p><p>Physical items do not grant a digital library entitlement.</p></section>`:''
}
