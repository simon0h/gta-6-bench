import { createHash } from 'node:crypto'
import { STORE_CATALOG_RULES } from './store-inventory.js'

// This registry reads the actual catalog rows lazily. Store renderers may import
// image helpers without causing a catalog -> renderer -> catalog import cycle.
const SOURCES = {
  coupang: ['catalog-data.js', 'products'], gmarket: ['data.js', 'products'],
  ikea: ['catalog.js', 'products'], nike: ['catalog.js', 'products'],
  sephora: ['catalog.js', 'products'], chewy: ['catalog.js', 'products'],
  'williams-sonoma': ['catalog.js', 'products'],
  'eb-games-au': ['browse.js', 'browseProducts'],
  'smyths-toys': ['browse.js', 'browseProducts'],
}
const clean = value => String(value ?? '').normalize('NFKC').trim()
const normalized = value => clean(value).toLowerCase().replace(/[®™]/g, '').replace(/[’‘]/g, "'").replace(/\s+/g, ' ')
const slug = value => normalized(value).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 64) || 'product'
const unique = values => [...new Set(values.flat().filter(value => typeof value === 'string' || typeof value === 'number').map(clean).filter(Boolean))]
const sorted = value => Array.isArray(value) ? value.map(sorted) : value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort().map(key => [key, sorted(value[key])])) : value
const stable = value => JSON.stringify(sorted(value))

export function normalizeAssetSpecs(value) {
  if (Array.isArray(value)) return Object.fromEntries(value.filter(row => Array.isArray(row) && row.length >= 2).map(([key, item]) => [clean(key), clean(item)]))
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, typeof item === 'object' ? stable(item) : clean(item)]))
  return {}
}

function nativeId(store, raw) {
  return clean(store === 'amazon' ? raw.asin : store === 'target' ? raw.tcin : ['argos', 'smyths-toys', 'eb-games-au', 'gmarket'].includes(store) ? raw.sku : raw.id)
}

function formatOf(store, raw, type, platform) {
  if (type !== 'game') return raw.format || (raw.accessorySubtype === 'digital-add-on' ? 'digital-add-on' : 'physical')
  const value = normalized([raw.formatLabel, raw.format, normalizeAssetSpecs(raw.specs).Format, normalizeAssetSpecs(raw.specs)['구성'], normalizeAssetSpecs(raw.specs)['형식']].filter(Boolean).join(' '))
  if (/code.in.box|코드|download code/.test(value)) return 'code-in-box'
  if (/digital|download/.test(value)) return 'digital'
  if (/cartridge|game card|카드|카트리지/.test(value)) return 'cartridge'
  if (/disc|디스크/.test(value)) return 'disc'
  if (!raw.physical && ['playstation-store', 'xbox-store'].includes(store)) return 'digital'
  if (store === 'rockstar-store' && raw.sale === 'link-out') return 'digital'
  if (platform === 'pc') return 'digital'
  return ['switch', 'switch-2', 'nintendo-ds'].includes(platform) ? 'cartridge' : 'disc'
}

function gameName(raw) {
  if (raw.gameTitle) return raw.gameTitle
  const title = clean(raw.title)
  // Explicit series mappings prevent GTA V, VI, IV, Online and add-ons being
  // collapsed by a loose "GTA" match. Merchandise never enters this function.
  if (/Grand Theft Auto VI\b|\bGTA\s?6\b/i.test(title)) return 'Grand Theft Auto VI'
  if (/Grand Theft Auto IV\b/i.test(title)) return /complete/i.test(title) ? 'Grand Theft Auto IV: Complete Edition' : 'Grand Theft Auto IV'
  if (/Grand Theft Auto V\b|\bGTA\s?5\b/i.test(title)) return /story mode/i.test(title) ? 'Grand Theft Auto V: Story Mode' : 'Grand Theft Auto V'
  if (/Grand Theft Auto Online/i.test(title)) return 'Grand Theft Auto Online'
  if (/Grand Theft Auto.*Trilogy/i.test(title)) return 'Grand Theft Auto: The Trilogy – The Definitive Edition'
  return title
    .replace(/\([^)]*(?:PlayStation|Xbox|PS[345]|Nintendo|Renewed)[^)]*\)/gi, '')
    .replace(/\s*[-–—,]\s*(?:PlayStation|Xbox|Nintendo|PS[345])\b.*$/i, '')
    .replace(/\s+(?:PS[345]|Xbox Series X(?:\|S)?|Nintendo Switch(?: 2)?)\s*(?:Game)?$/i, '')
    .replace(/\s+(?:Digital Download|base game)$/i, '')
    .replace(/\s*:?\s*(?:Standard|Deluxe|Ultimate|Premium) (?:Edition|Collection)$/i, '')
    .trim()
}

function editionOf(raw) {
  const value = normalized(raw.edition || raw.editionName || '')
  const title = normalized(raw.title)
  for (const word of ['ultimate', 'premium', 'deluxe', 'complete', 'anniversary', 'definitive', 'scholarship']) {
    if (new RegExp(`\\b${word}\\b`).test(`${value} ${title}`)) return word
  }
  return value === 'physical store offer' ? 'standard' : value.replace(/\bps[345]\b|edition/g, '').trim() || 'standard'
}

function configuration(raw, variant) {
  const options = variant ? { ...normalizeAssetSpecs(variant.options), ...normalizeAssetSpecs(variant.attributes) } : {}
  return {
    ...(Object.keys(options).length ? { options } : {}),
    ...(variant?.label ? { label: variant.label } : {}),
    ...(variant?.color ? { color: variant.color } : {}),
    ...(variant?.colorName ? { colorName: variant.colorName } : {}),
    ...(variant?.size ? { size: variant.size } : {}),
    ...(variant?.specs ? { specs: normalizeAssetSpecs(variant.specs) } : {}),
    ...(variant?.dimensions ? { dimensions: variant.dimensions } : {}),
    // Never assume that two variant IDs with no option text mean the same SKU.
    ...(variant && !Object.keys(options).length && !variant.label && !variant.specs ? { variantId: variant.id || variant.sku } : {}),
  }
}

function sourceArt(raw) {
  const values = unique([raw.catalogArt, raw.art, raw.image, raw.imageUrl, raw.gallery || []])
  return {
    urls: values.filter(value => /^(?:\/|https?:|data:image\/)/.test(value)),
    photo: raw.photo || raw.photoKey || null,
    inline: typeof raw.art === 'string' && /^[Mm]\s*[\d.-]/.test(raw.art) ? raw.art : null,
    shape: raw.shape || raw.illustration || raw.artFamily || (!/^\//.test(raw.art || '') ? raw.art : null),
  }
}

function identify(store, raw, inventory, variant = null) {
  const id = clean(inventory.id)
  const specs = normalizeAssetSpecs(raw.specs)
  const explicitPlatform = /^(?:ps[345]|xbox(?:-one|-360)?|switch(?:-2)?|nintendo-ds|pc|retro)$/.test(raw.platform || '') ? raw.platform : null
  const platform = raw.catalogPlatform || explicitPlatform || inventory.platform || null
  const type = inventory.type || raw.catalogType || 'other'
  const format = formatOf(store, raw, type, platform)
  const edition = type === 'game' ? editionOf(raw) : null
  const title = raw.title || inventory.title
  const canonicalTitle = type === 'game' ? gameName({ ...raw, title }) : title
  const options = configuration(raw, variant)
  let identity
  if (type === 'game' && platform && canonicalTitle) {
    const rawLanguage = normalized(specs.Language || specs['언어'] || (/한국어판|한글판/.test(title) ? 'Korean' : 'English'))
    const language = ({ '영어': 'english', '한국어': 'korean' })[rawLanguage] || rawLanguage
    const publisher = /^Grand Theft Auto\b|^Red Dead Redemption\b|^Bully:|^L\.A\. Noire$|^Max Payne\b/i.test(canonicalTitle)
      ? 'rockstar games' : normalized(raw.publisher || raw.brand || `unverified publisher at ${store}`)
    identity = { type, title: normalized(canonicalTitle), publisher, platform, edition, format, language }
    // A base entitlement and a bundle may share a title but differ in contents.
    if (format === 'digital' && (raw.bundle?.length || raw.gamesIncluded?.length || raw.addonsIncluded?.length)) {
      identity.contents = unique([raw.gamesIncluded || [], raw.addonsIncluded || [], raw.bundle || []]).sort()
    }
  } else {
    // Reuse is granted by explicit source fixture IDs, never by a generic photo,
    // silhouette, category, or title. Retailer-only goods keep their native ID.
    const hardware = [raw.id, raw.family, raw.art?.split('/').at(-1)?.replace(/\.svg$/, '')].find(value => /^hardware-/.test(value || ''))
    const korean = raw.catalogArt?.match(/^\/static\/art\/catalog500\/retail\/([^/]+)\.svg$/)?.[1]
    identity = hardware ? { type, fixture: hardware, platform, brand: normalized(raw.brand || raw.publisher), title: normalized(title) }
      : korean ? { type, fixture: korean, brand: normalized(raw.brand), title: normalized(title) }
        : { type, store, id }
  }
  // Offers already distinguish the same game by platform, edition and format;
  // retailer-specific offer SKUs must not inhibit legitimate cross-store reuse.
  if (variant && !(type === 'game' && variant.platform && variant.edition && variant.format)) identity.configuration = options
  const assetKey = `${slug(canonicalTitle)}--${createHash('sha256').update(stable(identity)).digest('hex').slice(0, 20)}`
  const aliases = unique([id, raw.id, raw.sku, raw.asin, raw.tcin, raw.slug, raw.path, raw.article])
  return {
    store, id, aliases, title, canonicalTitle, type, category: inventory.category || raw.category || raw.department || '',
    brand: raw.brand || raw.publisher || (['nike', 'ikea'].includes(store) ? STORE_CATALOG_RULES.find(rule => rule.slug === store).name : ''),
    platform: platform || null, edition, format, variant: variant ? { id: clean(variant.id || variant.sku), label: variant.label || Object.values(options.options || {}).join(' / '), ...options } : null,
    identity, assetKey, specs, sourceArt: sourceArt(raw), raw, variants: [],
  }
}

function variantRows(raw) {
  if (raw.variants?.length) return raw.variants
  if (Array.isArray(raw.options) && raw.options.some(option => option.id && !option.values)) return raw.options.filter(option => option.id)
  return []
}

function selectedRaw(raw, variant) {
  const appearance = normalized([variant.label, ...Object.entries(variant.options || {}).filter(([key]) => /color|colour|shade|finish/i.test(key)).map(([, value]) => value)].join(' '))
  const namedColors = [[/black|블랙|검정/, '#25262b'], [/white|화이트|흰색/, '#edece7'], [/blue|블루|파랑/, '#3569aa'], [/pink|핑크/, '#dc94b3'], [/red|레드|빨강/, '#b74645'], [/green|그린|초록/, '#62846a'], [/cream|크림/, '#eee4cd'], [/steel|스틸/, '#949fa5'], [/gray|grey|그레이/, '#8b9296']]
  const color = variant.color || namedColors.find(([pattern]) => pattern.test(appearance))?.[1]
  return { ...raw, ...variant, id: raw.id, sku: raw.sku, asin: raw.asin, tcin: raw.tcin,
    title: variant.title || raw.title,
    options: { ...normalizeAssetSpecs(variant.options), ...normalizeAssetSpecs(variant.attributes) },
    specs: { ...normalizeAssetSpecs(raw.specs), ...normalizeAssetSpecs(variant.specs), ...normalizeAssetSpecs(variant.attributes), ...normalizeAssetSpecs(variant.options) },
    ...(variant.label ? { variantLabel: variant.label } : {}),
    ...(color ? { color } : {}),
  }
}

let catalogPromise
export function readProductAssetCatalog() {
  return catalogPromise ||= Promise.all(STORE_CATALOG_RULES.map(async ({ slug: store }) => {
    const [file, key] = SOURCES[store] || ['data.js', 'PRODUCTS']
    const [source, adapter] = await Promise.all([import(`../stores/${store}/${file}`), import(`../stores/${store}/inventory.js`)])
    let rows = source[key]
    if (store === 'eb-games-au') {
      const { canonicalProducts } = await import('../stores/eb-games-au/canonical-products.js')
      rows = [...canonicalProducts.map(raw => ({ ...raw, title: `Grand Theft Auto VI - ${raw.label}`, edition: 'standard', format: 'code-in-box', brand: 'Rockstar Games', art: `/static/art/${raw.platform}-standard.svg` })), ...rows]
    }
    if (store === 'smyths-toys') rows = [...rows, ...(await import('../stores/smyths-toys/data.js')).products]
    const byId = new Map(rows.map(raw => [nativeId(store, raw), raw]))
    return adapter.inventory.map(inventory => {
      const original = byId.get(clean(inventory.id))
      if (!original) throw new Error(`Missing image catalog source: ${store}/${inventory.id}`)
      const offers = store === 'rockstar-store' && original.id === 'gta-vi' ? source.LISTINGS : null
      const raw = offers ? { ...original, ...offers[0], id: original.id } : original
      const descriptor = identify(store, raw, inventory)
      descriptor.variants = (offers || variantRows(raw)).map(variant => {
        const selected = identify(store, selectedRaw(raw, variant), inventory, variant)
        const variantId = clean(variant.id || variant.sku)
        selected.aliases = unique([variant.sku, variant.asin, variant.tcin,
          ...descriptor.aliases.map(alias => `${alias}:${variantId}`),
          // Native global IDs such as desk-2 are useful aliases; generic IDs
          // such as white are accepted only when selecting within the parent.
          variantId.length > 8 || variantId.startsWith(`${descriptor.id}-`) ? variantId : null,
        ])
        return selected
      })
      return descriptor
    })
  })).then(stores => stores.flat())
}

export function createProductAssetIndex(catalog) {
  const byStore = new Map(), byAssetKey = new Map()
  const addAlias = (map, alias, descriptor) => {
    if (!map.has(alias)) map.set(alias, descriptor)
    else if (map.get(alias)?.id !== descriptor.id) map.set(alias, null)
  }
  for (const descriptor of catalog) {
    const map = byStore.get(descriptor.store) || new Map()
    byStore.set(descriptor.store, map)
    for (const alias of descriptor.aliases) addAlias(map, alias, descriptor)
    if (!byAssetKey.has(descriptor.assetKey)) byAssetKey.set(descriptor.assetKey, descriptor)
    for (const variant of descriptor.variants) {
      for (const alias of variant.aliases) addAlias(map, alias, variant)
      if (!byAssetKey.has(variant.assetKey)) byAssetKey.set(variant.assetKey, variant)
    }
  }
  const get = (store, id, selection = {}) => {
    const map = byStore.get(clean(store).replace(/^\/|\/$/g, ''))
    if (!map) return null
    const descriptor = map.get(clean(id))
    if (!descriptor) return null
    if (!descriptor.variants.length) return descriptor
    const token = clean(selection.variant || selection.variantId || selection.variant_id || selection.option || selection.sku)
    if (token) {
      const selected = descriptor.variants.find(variant => variant.variant.id === token || variant.aliases.includes(token))
      if (selected) return selected
    }
    let options = selection.options
    if (typeof options === 'string') { try { options = JSON.parse(options) } catch { options = null } }
    if (options && typeof options === 'object' && Object.keys(options).length) {
      const match = descriptor.variants.find(variant => Object.entries(options).every(([key, value]) => normalized(variant.variant.options?.[key]) === normalized(value)))
      if (match) return match
    }
    if (selection.color) {
      const match = descriptor.variants.find(variant => [variant.raw.color, variant.raw.colorName, variant.variant.label, ...Object.values(variant.variant.options || {})].some(value => normalized(value) === normalized(selection.color)))
      if (match) return match
    }
    if (selection.platform || selection.edition || selection.format) {
      const match = descriptor.variants.find(variant => ['platform', 'edition', 'format'].every(key => !selection[key] || normalized(variant[key]) === normalized(selection[key])))
      if (match) return match
    }
    return descriptor
  }
  return { byStore, byAssetKey, get }
}

let indexPromise
export async function getProductAsset(store, id, selection = {}) {
  const index = await (indexPromise ||= readProductAssetCatalog().then(createProductAssetIndex))
  return index.get(store, id, selection)
}
