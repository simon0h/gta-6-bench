import { productImage as assetImage, productGallery as assetGallery } from '../../lib/product-assets.js'
import { esc } from '../../lib/html.js'
export const productImage = (p,className='') => assetImage('target',p,{className})
export const optionText = p => Object.entries(p.selectedOptions || {}).map(([k,v])=>`${k}: ${v}`).join(' · ')

// Small, consistent outline icons stay legible at header and fulfillment sizes.
export function targetIcon(name) {
  const paths={search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',account:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="9" r="3"/><path d="M6 19c1-6 11-6 12 0"/>',cart:'<path d="M2 3h3l2 12h12l2-9H6M8 19h.01M18 19h.01"/><circle cx="8" cy="19" r="1"/><circle cx="18" cy="19" r="1"/>',pin:'<path d="M12 22s8-8 8-13a8 8 0 0 0-16 0c0 5 8 13 8 13Z"/><circle cx="12" cy="9" r="3"/>',store:'<path d="M4 10v11h16V10M2 10l3-7h14l3 7M2 10h20M9 21v-7h6v7"/>',shipping:'<path d="m3 6 9-4 9 4v12l-9 4-9-4Zm0 0 9 4 9-4M12 10v12M7 4l10 4v5"/>',delivery:'<path d="M2 5h12v13H2Zm12 5h5l3 4v4h-8"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="19" r="2"/>'};
  return `<svg class="tg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.shipping}</svg>`
}
export function productGallery(p) {
 return `<div class="tg-gallery"><a class="tg-skip" href="#info-and-fulfillment">Skip images</a>${assetGallery('target',p)}<a class="tg-heart" href="#save-to-list" aria-label="Save ${esc(p.title)} to your wish list">&#9825;</a></div>`
}
