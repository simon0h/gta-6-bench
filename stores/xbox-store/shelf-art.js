// Pictures for the everyday assortment (shelf.js). The shared product-asset route only knows the
// evidence-backed inventory, so the store renders the same synthetic illustrations itself at
// /xbox-store/shelf-art/<id>/<view>.svg: covers for games and add-ons, and the device itself for
// consoles, controllers, headsets, storage and gift cards.
import { renderProductAsset } from '../../lib/product-asset-art.js'
import { productGallery, productImage } from '../../lib/product-assets.js'
import { keyArt, drawsKeyArt } from './key-art.js'
import { codeCardArt, drawsCodeCard } from './code-card-art.js'

const ROOT = '/xbox-store/shelf-art'
const cache = new Map()

function descriptor(p) {
  const digital = !p.physical
  const type = p.type === 'game' || p.type === 'add-on' ? 'game' : p.catalogType === 'console' ? 'console' : 'accessory'
  const shape = p.type === 'gift-card' ? 'card' : p.shape
  return {
    store: 'xbox-store', id: p.id, title: p.type === 'gift-card' && !/gift card/i.test(p.title) ? `${p.title} digital code card` : p.title,
    type, category: p.category || p.genre, brand: p.brand, platform: 'xbox', format: digital ? 'digital' : 'physical', edition: null,
    specs: p.specs || {}, assetKey: `xbox-shelf-${p.id}`,
    raw: { ...p, catalogType: type, shape, colorName: p.color, accessorySubtype: p.type === 'add-on' ? 'digital-add-on' : p.accessorySubtype, description: p.description?.[0] },
  }
}

export function shelfArt(p, view) {
  if (!p || !p.shelf || !/^[0-3]$/.test(String(view))) return null
  const key = `${p.id}:${view}`
  if (!cache.has(key)) {
    if (cache.size > 600) cache.delete(cache.keys().next().value)
    // Games and add-ons get xbox.com-style full-bleed key art; devices and gift cards keep the product drawings.
    cache.set(key, drawsKeyArt(p) ? keyArt(p, Number(view)) : drawsCodeCard(p) ? codeCardArt(p, Number(view)) : renderProductAsset(descriptor(p), Number(view)))
  }
  return cache.get(key)
}

const local = (p, html) => html.split(`/product-assets/xbox-store/${encodeURIComponent(p.id)}/`).join(`${ROOT}/${p.id}/`)
export const shelfImage = (p, opts = {}) => local(p, productImage('xbox-store', p, opts))
export const shelfGallery = (p, opts = {}) => local(p, productGallery('xbox-store', p, opts))
