// Product pictures for shelf items. They reuse the repo's synthetic product
// illustrations, served from this store's own route, so the shared
// /product-assets registry (which follows the evidenced inventory) is unchanged.
import { renderProductAsset, classifyProductAsset } from '../../lib/product-asset-art.js'
import { productGallery } from '../../lib/product-assets.js'
import { esc } from '../../lib/html.js'

// The shared illustrator picks an object form from the title. These phrases
// name the form for families whose product titles do not say what the object is.
const FORM = {
  'funko-pop': 'collectible pop figure', statue: 'collectible statue figure', replica: 'collectible replica figure', amiibo: 'collectible figure',
  figure: 'action figure', 'action-figure': 'action figure', 'blind-box': 'mystery figure', 'collectors-box': 'collectible figure', plush: 'plush',
  'building-set': 'building bricks set', 'board-game': 'board game', 'card-game': 'card game', puzzle: 'jigsaw puzzle', blaster: 'toy blaster kit',
  'tcg-booster': 'trading card booster pack', 'tcg-deck': 'trading card starter deck', 'sports-card-box': 'trading card booster pack', 'graded-card': 'collectible card',
  'card-sleeves': 'collectible card', 'card-binder': 'binder', 'internal-storage': 'nvme ssd storage drive', 'charging-dock': 'charging dock stand',
  'charging-cable': 'usb charging cable', 'hdmi-cable': 'hdmi cable', 'carrying-case': 'carrying case', 'console-stand': 'console stand', 'racing-wheel': 'racing wheel',
  'vr-headset': 'vr headset', 'mouse-pad': 'gaming mouse mat', 'stream-deck': 'keypad', 'capture-card': 'usb hub adapter', microphone: 'microphone',
  laptop: 'laptop', tablet: 'tablet', phone: 'smartphone', 'power-bank': 'power bank', earbuds: 'earbuds', speaker: 'speaker', hat: 'cap', blanket: 'throw blanket',
  poster: 'poster', lamp: 'lamp', mug: 'mug', hoodie: 'hoodie', tshirt: 'tee shirt', 'gaming-chair': 'gaming chair', monitor: 'monitor', webcam: 'webcam',
  keyboard: 'keyboard', mouse: 'mouse', 'gaming-headset': 'headset', controller: 'controller',
}
const cache = new Map()
export function shelfDescriptor(p) {
  const type = p.catalogType === 'game' ? 'game' : p.catalogType === 'console' && !['amiibo', 'vr-headset'].includes(p.family) ? 'console' : 'other'
  return {
    store: 'gamestop', id: p.id, aliases: [p.id], title: type === 'other' && FORM[p.family] ? FORM[p.family] : p.title, canonicalTitle: p.title.replace(/ - (?:PlayStation|Xbox|Nintendo|Retro).*$/, ''),
    type, category: p.department, brand: p.brand, platform: p.catalogPlatform || null, edition: type === 'game' ? 'standard' : null,
    format: type === 'game' ? (p.format || 'disc') : 'physical', variant: null, specs: p.specs, sourceArt: { urls: [], photo: null, inline: null, shape: null },
    identity: { store: 'gamestop-shelf', id: p.id }, assetKey: `gamestop-shelf-${p.id}`,
    raw: { ...p, title: undefined, type: undefined, shape: undefined, description: '', catalogType: type === 'other' ? undefined : type },
  }
}
export const shelfArtKind = p => classifyProductAsset(shelfDescriptor(p))
export function shelfAssetSvg(p, view = 0) {
  const key = `${p.id}:${view}`
  if (!cache.has(key)) {
    if (cache.size > 600) cache.delete(cache.keys().next().value)
    cache.set(key, renderProductAsset(shelfDescriptor(p), view))
  }
  return cache.get(key)
}
export const shelfAssetUrl = (p, view = 0) => `/gamestop/shelf-assets/${encodeURIComponent(p.id)}/${view}.svg`
export function shelfImage(p, className = '') {
  return `<img class="pa-product-image ${esc(className)}" data-product-asset src="${shelfAssetUrl(p)}" alt="${esc(p.title)}" width="720" height="720" loading="lazy" decoding="async">`
}
export function shelfGallery(p) {
  return productGallery('gamestop', p).replaceAll(`/product-assets/gamestop/${encodeURIComponent(p.id)}/`, `/gamestop/shelf-assets/${encodeURIComponent(p.id)}/`).replace(/(shelf-assets\/[^"/]+\/\d)\.svg\?[^"]*/g, '$1.svg')
}
