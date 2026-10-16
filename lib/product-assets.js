import { esc } from './html.js'
import { referenceProductMedia } from './reference-product-media.js'

const nativeId = (store, p) => (store === 'amazon' ? p?.asin : store === 'target' ? p?.tcin : ['argos', 'smyths-toys', 'eb-games-au', 'gmarket'].includes(store) ? p?.sku : p?.id) ?? p?.id ?? p?.sku ?? p?.asin ?? p?.ASIN ?? p?.tcin ?? p?.product_id ?? p?.code
const titleOf = p => p?.title || p?.name || p?.label || 'Product'

export function productAssetViewCount(p, store) {
  const reference = store && referenceProductMedia(store, p)
  if (reference) return reference.length
  const title = titleOf(p)
  return /\b(bundle|kit|set|console|camera|laptop|pc tower|starter pack|gift pack)\b|세트|본체|묶음/.test(title.toLowerCase()) || p?.catalogType === 'console' ? 4 : 3
}
export function productAssetUrl(store, p, view = 0) {
  const id = nativeId(store, p)
  if (id === undefined || id === null || id === '') throw new Error(`Missing product image identity: ${store} ${titleOf(p)}`)
  const query = new URLSearchParams()
  const variant = p.variantId ?? p.variant_id ?? p.option ?? (typeof p.variant === 'string' ? p.variant : p.variant?.id)
  if (variant) query.set('variant', String(variant))
  if (p.sku && String(p.sku) !== String(id)) query.set('sku', String(p.sku))
  if (p.colorName) query.set('color', p.colorName)
  return `/product-assets/${encodeURIComponent(store)}/${encodeURIComponent(id)}/${view}.svg${query.size ? '?' + query.toString() : ''}`
}
export function productImage(store, p, { className = '', view = 0, alt, loading = 'lazy' } = {}) {
  return `<img class="pa-product-image ${esc(className)}" data-product-asset src="${esc(productAssetUrl(store, p, view))}" alt="${esc(alt || titleOf(p))}" width="720" height="720" loading="${loading === 'eager' ? 'eager' : 'lazy'}" decoding="async">`
}
export function productGallery(store, p, { className = '', locale = store === 'coupang' || store === 'gmarket' ? 'ko' : 'en', view = 0 } = {}) {
  const korean = locale === 'ko', count = productAssetViewCount(p, store)
  const reference = referenceProductMedia(store, p)
  const labels = reference?.map(image => image.label) || (korean ? ['상품 전체', '다른 각도', '확대 보기', '추가 이미지'] : ['Product view', 'Alternate view', 'Close-up', 'Additional view'])
  const selected = Math.min(count - 1, Math.max(0, Number.parseInt(view, 10) || 0))
  const images = Array.from({ length: count }, (_, i) => ({ src: productAssetUrl(store, p, i), label: labels[i] }))
  const title = titleOf(p)
  // GameStop crops its screenshot thumbnails to squares. Use the original
  // raster for those thumbnails so the square SVG stage does not letterbox it.
  const thumbnail = (i, label) => store === 'gamestop' && reference
    ? `<img class="pa-product-image" data-product-asset src="${esc(reference[i].localUrl)}" alt="${esc(label)}" width="720" height="720" loading="lazy" decoding="async">`
    : productImage(store, p, { view: i, alt: label })
  return `<section class="pa-gallery ${esc(className)}" data-product-gallery data-product-store="${esc(store)}" data-product-id="${esc(nativeId(store, p))}" aria-label="${korean ? '상품 이미지' : 'Product images'}"><div class="pa-gallery-stage"><button type="button" class="pa-gallery-enlarge" data-pa-enlarge aria-label="${korean ? '이미지 크게 보기' : 'Enlarge product image'}">${productImage(store, p, { view: selected, loading: 'eager', className: 'pa-gallery-main', alt: title + ' — ' + labels[selected] })}<span aria-hidden="true">⌕</span></button></div><div class="pa-gallery-controls"><button type="button" data-pa-step="-1" aria-label="${korean ? '이전 이미지' : 'Previous image'}">‹</button><p class="pa-gallery-caption" data-pa-caption aria-live="polite">${selected + 1} / ${count}</p><button type="button" data-pa-step="1" aria-label="${korean ? '다음 이미지' : 'Next image'}">›</button></div><div class="pa-gallery-thumbnails" aria-label="${korean ? '이미지 선택' : 'Choose an image'}">${images.map((image, i) => `<button type="button" data-pa-select="${i}" data-pa-src="${esc(image.src)}" data-pa-label="${esc(image.label)}" data-pa-alt="${esc(title + ' — ' + image.label)}" aria-label="${esc(image.label)}" aria-pressed="${i === selected}">${thumbnail(i, image.label)}</button>`).join('')}</div><dialog class="pa-gallery-dialog" aria-label="${esc(title)}"><button type="button" class="pa-gallery-close" data-pa-close aria-label="${korean ? '닫기' : 'Close image'}">×</button><img data-pa-expanded src="${esc(images[selected].src)}" alt="${esc(title + ' — ' + labels[selected])}" width="720" height="720"><div class="pa-gallery-controls"><button type="button" data-pa-step="-1" aria-label="${korean ? '이전 이미지' : 'Previous image'}">‹</button><p data-pa-caption>${selected + 1} / ${count}</p><button type="button" data-pa-step="1" aria-label="${korean ? '다음 이미지' : 'Next image'}">›</button></div></dialog><noscript><div class="pa-gallery-noscript">${images.slice(1).map((image, i) => `<figure>${productImage(store, p, { view: i + 1, alt: title + ' — ' + image.label })}<figcaption>${esc(image.label)}</figcaption></figure>`).join('')}</div></noscript></section>`
}

// Every storefront has its own document layout; only pages rendering product
// assets receive the common interaction code and gallery styles.
export function productAssetPageMiddleware(req, res, next) {
  const send = res.send
  res.send = function (body) {
    if (typeof body === 'string' && body.includes('data-product-asset') && body.includes('</head>') && !body.includes('/static/product-gallery.js')) {
      body = body.replace('</head>', '<link rel="stylesheet" href="/static/product-gallery.css"><script src="/static/product-gallery.js" defer></script></head>')
    }
    return send.call(this, body)
  }
  next()
}
