// Coupang shelf: the general-merchandise assortment shown in the default reference
// catalog. Kept apart from GTA 6 evidence (catalog-data.js / reference.js): these rows
// are never catalog observations and are ordered only as `kind: 'other'` lines.
import { createHash } from 'node:crypto'
import { renderProductAsset } from '../../lib/product-asset-art.js'
import { DEPARTMENTS, FRESH, deptById } from './site-data.js'
import { SHELF_ROWS, GAME_ROWS } from './shelf-data.js'

const digits = (seed, size) => BigInt('0x' + createHash('sha256').update(seed).digest('hex').slice(0, 15)) % (10n ** BigInt(size))
const DELIVERY = { R: 'rocket', F: 'fresh', S: 'seller', G: 'global', SR: 'seller-rocket' }
export const DELIVERY_LABEL = { rocket: '로켓배송', fresh: '로켓프레시', seller: '판매자배송', global: '로켓직구', 'seller-rocket': '판매자로켓' }
const SELLERS = ['(주)한빛유통', '굿데이마켓', '바른상회', '해밀스토어', '다온커머스', '모아샵']

function unitText(price, unit) {
  if (!unit) return ''
  const [label, count] = unit
  const each = price / count
  return `${label}당 ${Math.round(each).toLocaleString('ko-KR')}원`
}

function build(dept, sub, row, index, game = false) {
  const [subSlug, brand, title, price, listPrice, rating, reviews, code, art, unit] = row
  const seed = `coupang-shelf:${title}`
  const productId = String(1000000000n + digits(seed + ':p', 10) % 8999999999n)
  const itemId = String(20000000000n + digits(seed + ':i', 11) % 9999999999n)
  const vendorItemId = String(80000000000n + digits(seed + ':v', 11) % 9999999999n)
  const delivery = DELIVERY[code]
  const d = deptById(dept)
  const s = d.subs.find(x => x.slug === subSlug) || (game ? d.subs.find(x => x.slug === 'game') : null)
  if (!s) throw new Error(`Unknown Coupang shelf subcategory ${dept}/${subSlug}`)
  let artInfo
  if (typeof art === 'string') { const [kind, hint] = art.split(':'); artInfo = { kind, hint } }
  else artInfo = { kind: art.type || art.shape, hint: art.hint, type: art.type, platform: art.platform }
  const h = Number(digits(seed + ':s', 6))
  return Object.freeze({
    id: productId, itemId, vendorItemId, sku: vendorItemId, kind: 'other',
    title, brand, price, listPrice: listPrice > price ? listPrice : 0,
    discount: listPrice > price ? Math.floor((1 - price / listPrice) * 100) : 0,
    rating, reviews, delivery, deliveryLabel: DELIVERY_LABEL[delivery],
    seller: delivery === 'seller' ? SELLERS[h % SELLERS.length] : delivery === 'global' ? '쿠팡 로켓직구' : '쿠팡',
    dept: d.id, deptLabel: d.label, sub: s.slug, subLabel: s.label, group: game ? subSlug : null,
    unit: unitText(price, unit), art: artInfo, stock: 99,
    // Ranking signals for 쿠팡 랭킹순 / 판매량순 / 최신순; derived, stable per item.
    sales: Math.round(reviews * (1.5 + (h % 100) / 100)), newness: h % 1000, order: index,
    wow: delivery === 'rocket' || delivery === 'fresh',
    path: `/vp/products/${productId}?itemId=${itemId}&vendorItemId=${vendorItemId}`,
  })
}

let index = 0
export const shelf = Object.freeze([
  ...Object.entries(SHELF_ROWS).flatMap(([dept, rows]) => rows.map(row => build(dept, row[0], row, index++))),
  ...GAME_ROWS.map(row => build('178255', 'game', row, index++, true)),
])
const byId = new Map(shelf.map(p => [p.id, p]))
const bySkuMap = new Map(shelf.map(p => [p.sku, p]))
if (byId.size !== shelf.length || bySkuMap.size !== shelf.length) throw new Error('Duplicate Coupang shelf identifiers')
export const shelfById = id => byId.get(String(id))
export const shelfBySku = sku => bySkuMap.get(String(sku))
export const isShelfSku = sku => typeof sku === 'string' && bySkuMap.has(sku)

// Search. Coupang matches title, brand and category words; Korean has no word
// boundaries, so each query token is a substring match and results rank by the
// number of matched tokens, then by Coupang ranking.
const fold = v => String(v || '').toLowerCase().normalize('NFKC')
const ALIASES = [['ps5', '플스5 플레이스테이션 playstation'], ['플스', 'ps5 playstation'], ['닌텐도', 'nintendo switch 스위치'], ['스위치', 'switch nintendo'], ['xbox', '엑스박스'], ['gta', 'grand theft auto 그랜드 테프트 오토'], ['tv', '티비 텔레비전'], ['노트북', 'laptop 맥북 그램 갤럭시북'], ['아이폰', 'iphone apple'], ['맥북', 'macbook'], ['에어팟', 'airpods'], ['생수', '물 water'], ['우유', 'milk'], ['라면', 'ramen 면'], ['기저귀', 'diaper'], ['사료', 'food'], ['게임', 'game']]
const haystack = p => fold([p.title, p.brand, p.deptLabel, p.subLabel, p.art.hint, p.deliveryLabel, ...ALIASES.filter(([k]) => fold(p.title + ' ' + p.subLabel).includes(k)).map(([, v]) => v)].join(' '))
const HAY = new Map(shelf.map(p => [p.id, haystack(p)]))
export const tokens = q => fold(q).split(/[\s,]+/).filter(t => t && !(/^[a-z0-9]$/.test(t)))
export function searchShelf(q) {
  const ts = tokens(q)
  if (!ts.length) return []
  return shelf.map(p => ({ p, score: ts.filter(t => HAY.get(p.id).includes(t)).length + (fold(p.title).includes(fold(q).trim()) ? ts.length : 0) }))
    .filter(x => x.score > 0 && (ts.length < 3 || x.score >= Math.ceil(ts.length / 2)))
    .sort((a, b) => b.score - a.score || b.p.sales - a.p.sales)
    .map(x => x.p)
}

// Facets shared by search, category and landing grids.
export const PRICE_BANDS = [['0-10000', '1만원 이하', 0, 10000], ['10000-30000', '1만원~3만원', 10000, 30000], ['30000-100000', '3만원~10만원', 30000, 100000], ['100000-', '10만원 이상', 100000, Infinity]]
const many = v => (Array.isArray(v) ? v : [v]).filter(x => typeof x === 'string' && x)
export function filterShelf(items, query = {}) {
  const delivery = many(query.deliveryType), brands = many(query.brand)
  const band = PRICE_BANDS.find(([v]) => v === query.price)
  const rating = Number(query.rating) || 0
  return items.filter(p => (!delivery.length || delivery.includes(p.delivery) || (delivery.includes('free') && p.delivery !== 'seller'))
    && (!brands.length || brands.includes(p.brand))
    && (!band || (p.price >= band[2] && p.price < band[3]))
    && p.rating >= rating)
}
const SORTERS = {
  scoreDesc: (a, b) => b.sales * b.rating - a.sales * a.rating,
  salePriceAsc: (a, b) => a.price - b.price,
  salePriceDesc: (a, b) => b.price - a.price,
  saleCountDesc: (a, b) => b.sales - a.sales,
  latestAsc: (a, b) => b.newness - a.newness,
}
export function sortShelf(items, sorter, keepOrder = false) {
  if (keepOrder && (!sorter || sorter === 'scoreDesc')) return items
  return [...items].sort(SORTERS[sorter] || SORTERS.scoreDesc)
}
export const inDept = (dept, sub) => shelf.filter(p => p.dept === dept && (!sub || p.sub === sub))
export const deptsWithShelf = [...DEPARTMENTS, FRESH].filter(d => shelf.some(p => p.dept === d.id))

// Product illustrations via the shared renderer, labelled in Korean.
const VIEW_LABELS = { 'Product view': '상품 전체', 'Reverse or interior view': '다른 각도', 'Construction and material detail': '확대 보기', 'Component and alternate views': '추가 이미지', 'Cover artwork': '표지', 'Rear packaging and illustrated scenes': '뒷면', 'Illustrated game world': '게임 화면', 'Case and media': '케이스 구성' }
export const SHELF_VIEWS = 3
const cache = new Map()
export function shelfArt(p, view = 0) {
  const key = `${p.id}:${view}`
  if (cache.has(key)) return cache.get(key)
  const a = p.art
  const descriptor = { store: 'coupang', title: a.hint, brand: p.brand, platform: a.platform, type: a.type, format: a.type === 'game' ? 'disc' : undefined, assetKey: `coupang-shelf-${p.id}`, specs: {},
    raw: { title: a.hint, brand: p.brand, shape: a.kind, description: a.hint, catalogType: a.type, gameTitle: a.type === 'game' ? a.hint : undefined, platform: a.platform } }
  let svg = renderProductAsset(descriptor, view)
  for (const [en, ko] of Object.entries(VIEW_LABELS)) svg = svg.split(en).join(ko)
  svg = svg.replace(/Synthetic product illustration\. /g, '상품 일러스트. ')
  // Coupang product images carry no caption: drop the view name stamped under the drawing
  // (it stays in the SVG <title> for screen readers).
  svg = svg.replace(/<text x="320" y="572"[^>]*>[^<]*<\/text>/, '')
  if (cache.size > 600) cache.delete(cache.keys().next().value)
  cache.set(key, svg)
  return svg
}
