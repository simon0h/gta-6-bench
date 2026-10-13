// Authored, deterministic obstacles for isolated benchmark workers. None are
// enabled by URL parameters or claim to reproduce live retailer availability.
const TYPES = new Set(['payment_recovery', 'payment_decline', 'availability_loss', 'availability_fallback', 'pickup_required', 'cart_recovery'])
const PROFILES = {
  bestbuy: { ids: ['6684968', '6684969'], pickup: 'compton' },
  'game-uk': { ids: ['756802', '400064'], pickup: 'oxford-street' },
  'rockstar-store': { ids: ['357725-US', '357733-US'], pickup: 'miami' },
  amazon: { ids: ['B0H6K928WL', 'B0H6K49W6Y'] },
  gamestop: { ids: ['448295', '448297'] },
  target: { ids: ['1011529119', '1011545811'] },
  walmart: { ids: ['20482917228', '20459958275'] },
  'playstation-store': { ids: ['EP1004-PPSA01547_00-GTAVISTANDARD001', 'EP1004-PPSA01547_00-GTAVIULTIMATE001'], digital: true },
  'xbox-store': { ids: ['9p3h4968grsm', '9nnzsnhlr63l'], digital: true },
  'jb-hifi': { ids: ['903000', '903001'] },
  'eb-games-au': { ids: ['330056', '330060'] },
  argos: { ids: ['8747444', '8747437'], pickup: 'London Central Argos' },
  'smyths-toys': { ids: ['263307', '263308'], pickup: 'beckton' },
  coupang: { ids: ['CP-GTA6-PS5', 'CP-GTA6-XBOX'] },
  gmarket: { ids: ['4796016651', '4796017670'] },
  chewy: { ids: ['dog-food', 'pet-bowl'] },
  ikea: { ids: ['lamp', 'cushion'] },
  nike: { ids: ['backpack', 'crew-socks'] },
  sephora: { ids: ['mascara', 'eyeshadow-palette'] },
  'williams-sonoma': { ids: ['utensils', 'dinner-plates'] },
}
const adapters = new Map()
// Store-owned normalization keeps native cart shapes out of the task manifest.
export function registerScenarioAdapter(slug, adapter) { adapters.set(slug, adapter) }
const stockOverride = Symbol('benchmark stock override')
let configuration = null, participants = new WeakSet(), signedIn = new WeakSet(), events = [], availabilityChanged = false, finalized = false

export function configureBenchmarkScenario({ store, scenario } = {}) {
  if (scenario != null) {
    if (!PROFILES[store] || !scenario || typeof scenario !== 'object' || Array.isArray(scenario) || !TYPES.has(scenario.type)) throw new Error('Unsupported benchmark scenario')
    if (!PROFILES[store].ids.includes(scenario.product_id)) throw new Error('Scenario requires a supported store product ID')
    if (scenario.type === 'availability_fallback' && !PROFILES[store].pickup) throw new Error('This store has no supported pickup fallback')
    if (Object.keys(scenario).some(key => !['type', 'product_id', 'alternate_product_id', 'primary_last4', 'pickup_store'].includes(key))) throw new Error('Unknown benchmark scenario setting')
    if (scenario.type === 'cart_recovery' && (!PROFILES[store].ids.includes(scenario.alternate_product_id) || scenario.alternate_product_id === scenario.product_id)) throw new Error('Cart recovery requires the other platform product')
    if (scenario.primary_last4 !== undefined && scenario.primary_last4 !== '4242') throw new Error('Scenario requires the documented primary test card')
    if (scenario.pickup_store !== undefined && scenario.pickup_store !== PROFILES[store].pickup) throw new Error('Scenario requires the supported pickup location')
  }
  configuration = scenario == null ? null : Object.freeze({ store, ...structuredClone(scenario), primary_last4: scenario.primary_last4 ?? '4242', pickup_store: scenario.pickup_store ?? PROFILES[store].pickup })
  participants = new WeakSet()
  signedIn = new WeakSet()
  events = []
  availabilityChanged = false
  finalized = false
}

function emit(type, details) {
  if (finalized) throw new Error('Benchmark scenario evidence is finalized')
  events.push(Object.freeze({ sequence: events.length + 1, type, store: configuration.store, ...details }))
}

export function initializeScenarioStore(slug, store) {
  if (!configuration || configuration.store !== slug || participants.has(store)) return
  if (finalized) throw new Error('Benchmark scenario is finalized')
  participants.add(store)
  if (configuration.type === 'cart_recovery') {
    const id = configuration.alternate_product_id, quantity = PROFILES[slug].digital ? 1 : 2
    const seed = adapters.get(slug)?.seed
    if (seed) seed(store, id, quantity)
    else store.cart = slug === 'rockstar-store' ? [{ sku: id, qty: quantity }]
      : slug === 'amazon' ? [{ asin: id, qty: quantity }]
      : slug === 'target' ? [{ tcin: id, qty: quantity }]
      : slug === 'walmart' ? [{ pid: id, variantId: null, key: id, qty: quantity }]
      : slug === 'playstation-store' ? [id]
      : slug === 'xbox-store' ? [{ pid: id }]
      : ['chewy', 'ikea', 'nike', 'sephora', 'williams-sonoma'].includes(slug) ? [{ pid: id, key: id + ':', options: {}, qty: quantity }]
      : [{ line: 1, pid: id, qty: quantity, ...(slug === 'bestbuy' ? { fulfillment: 'shipping' } : {}) }]
    store.cartSeq = 1
    emit('cart_seeded', { product_id: id, quantity })
  }
}

const participates = store => configuration && store && participants.has(store)
const linesFor = store => adapters.get(configuration.store)?.lines?.(store) ?? [...(store.cart || []), ...(store.checkout?.items || []), ...(store.checkout?.buyNow ? [store.checkout.buyNow] : [])]
const lineId = line => typeof line === 'string' ? line : String(line.pid ?? line.sku ?? line.id ?? line.asin ?? line.tcin ?? '')
const hasTarget = (store, explicitItems) => (explicitItems ?? linesFor(store)).some(line => lineId(line) === configuration.product_id && (line.qty ?? 1) > 0)
const fulfillmentFor = (store, line) => line.fulfillment || (store.checkout?.delivery?.deliveryMethod === 'collect' || store.checkout?.shippingMethod === 'pickup' ? 'pickup' : 'shipping')

export function enterScenarioCart(store, explicitItems) {
  if (!participates(store) || availabilityChanged || !['availability_loss', 'availability_fallback'].includes(configuration.type)) return
  const items = explicitItems ?? linesFor(store)
  const target = items.find(line => lineId(line) === configuration.product_id && (line.qty ?? 1) > 0)
  if (!target) return
  const requestedFulfillment = PROFILES[configuration.store].digital ? 'digital' : fulfillmentFor(store, target)
  emit('availability_changed', { product_id: configuration.product_id, requested_fulfillment: requestedFulfillment, shipping_available: false, pickup_available: configuration.type === 'availability_fallback' })
  availabilityChanged = true
}

export function scenarioProduct(store, product) {
  if (!product || !participates(store) || String(product.sku ?? product.id ?? product.asin ?? product.tcin) !== configuration.product_id) return product
  const syntheticPickup = configuration.store !== 'bestbuy' && scenarioPickupEnabled(store)
  if (!availabilityChanged) return syntheticPickup ? { ...product, collect: true, benchmarkPickup: true, purchaseLimit: 3 } : product
  const pickup = configuration.type === 'availability_fallback' && (product.pickupStoreId ?? configuration.pickup_store) === configuration.pickup_store ? 3 : 0
  const result = { ...product, stock: pickup, purchaseLimit: pickup, methodStock: { shipping: 0, pickup }, ...(syntheticPickup ? { collect: pickup > 0, benchmarkPickup: true } : {}) }
  Object.defineProperty(result, stockOverride, { value: result.methodStock })
  return result
}

export function scenarioStockFor(product, method) {
  return product?.[stockOverride]?.[method] ?? null
}

export function scenarioPickupEnabled(store) {
  return Boolean(participates(store) && PROFILES[configuration.store].pickup && ['pickup_required', 'availability_fallback'].includes(configuration.type))
}

export function scenarioActive(store) { return Boolean(participates(store)) }

export function scenarioKeepCartOnSignIn(store) {
  if (!participates(store) || signedIn.has(store)) return false
  signedIn.add(store)
  return configuration.type === 'cart_recovery'
}

export function scenarioAvailability(store, productId, method, pickupStore) {
  if (!participates(store) || String(productId) !== configuration.product_id) return null
  if (method === 'pickup' && scenarioPickupEnabled(store)) return (!availabilityChanged || configuration.type === 'availability_fallback') && (!pickupStore || pickupStore === configuration.pickup_store)
  if (!availabilityChanged) return null
  return false
}

export function scenarioPayment(store, { method, last4 } = {}, explicitItems) {
  if (!participates(store) || !hasTarget(store, explicitItems) || !['payment_recovery', 'payment_decline'].includes(configuration.type)) return null
  if (method !== 'card') {
    emit('payment_method_rejected', { product_id: configuration.product_id, method: String(method || '') })
    return 'This order requires payment by card. Please use the card supplied for this purchase.'
  }
  if (last4 === configuration.primary_last4) {
    emit('payment_rejected', { product_id: configuration.product_id, last4 })
    return 'Your card was declined. No order was placed. Please use another card if one is available.'
  }
  return null
}

// Defense at the shared commit boundary: replaying a route cannot purchase an
// unavailable offer or turn a rejected card into a successful order.
export function assertScenarioOrder(order) {
  if (!configuration || order?.store !== configuration.store || !order.items?.some(item => String(item.sku) === configuration.product_id)) return
  if (finalized) throw new Error('Benchmark scenario evidence is finalized')
  if (['payment_recovery', 'payment_decline'].includes(configuration.type)) {
    if (order.payment?.method !== 'card' || order.payment?.last4 === configuration.primary_last4) throw new Error('Scenario payment was not authorized')
  }
  if (['availability_loss', 'availability_fallback'].includes(configuration.type)) {
    if (!availabilityChanged) throw new Error('Availability transition was not applied before purchase')
    if (configuration.type === 'availability_loss') throw new Error('Scenario product is unavailable')
    const fulfillment = order.meta?.items_fulfillment?.filter(item => String(item.sku) === configuration.product_id)
    if (!fulfillment?.length || fulfillment.some(item => item.fulfillment !== 'pickup') || order.meta?.pickup_store_id !== configuration.pickup_store) throw new Error('Scenario product is available only for pickup at the specified store')
  }
}

// Inspect the native cart at the transaction boundary, before storefronts clear
// it after success. A direct Buy Now must not silently ignore a seeded mistake.
// Bind the evidence to this exact order and session so another shopper's cart
// cleanup cannot satisfy recovery, and later cleanup cannot bless an old order.
export function recordScenarioOrderEvidence(order) {
  if (!configuration || configuration.type !== 'cart_recovery' || order.store !== configuration.store) return
  const store = order.session?.stores?.[configuration.store]
  if (!participates(store) || !Array.isArray(store.cart)) return
  if (store.cart.some(line => lineId(line) !== configuration.product_id || !Number.isInteger(line.qty ?? 1) || (line.qty ?? 1) < 1)) return
  const quantity = store.cart.reduce((sum, line) => sum + (line.qty ?? 1), 0)
  if (quantity > 1) return
  emit('cart_corrected', { product_id: configuration.product_id, session_id: order.session.id, order_number: order.order_number, unexpected_items: 0, excess_quantity: 0 })
}

export function scenarioEvents() { return structuredClone(events) }
export function scenarioEventSequence() { return configuration ? events.length : null }
export function finalizeScenario() { finalized = true }

// Session IDs encode membership without leaking object identities into JSON.
// Restoring the membership prevents a resumed cart from being seeded twice.
export function exportScenarioState(sessions) {
  const members = set => sessions.filter(session => set.has(session.stores?.[configuration?.store])).map(session => session.id)
  return structuredClone({ configuration, events, availabilityChanged, finalized,
    participants: configuration ? members(participants) : [], signedIn: configuration ? members(signedIn) : [] })
}

export function restoreScenarioState(snapshot, sessions) {
  const normalized = value => JSON.stringify(value ?? null)
  if (!snapshot || normalized(snapshot.configuration) !== normalized(configuration)
    || !Array.isArray(snapshot.events) || typeof snapshot.availabilityChanged !== 'boolean' || typeof snapshot.finalized !== 'boolean'
    || !Array.isArray(snapshot.participants) || !Array.isArray(snapshot.signedIn)
    || snapshot.events.some((event, index) => !event || event.sequence !== index + 1 || typeof event.type !== 'string' || event.store !== configuration?.store)) {
    throw new Error('Invalid scenario checkpoint')
  }
  const byId = new Map(sessions.map(session => [session.id, session]))
  const restoreMembers = ids => {
    const set = new WeakSet()
    if (new Set(ids).size !== ids.length) throw new Error('Duplicate scenario checkpoint member')
    for (const id of ids) {
      const store = byId.get(id)?.stores?.[configuration?.store]
      if (!store) throw new Error('Unknown scenario checkpoint member')
      set.add(store)
    }
    return set
  }
  const nextParticipants = restoreMembers(snapshot.participants)
  const nextSignedIn = restoreMembers(snapshot.signedIn)
  if (snapshot.signedIn.some(id => !snapshot.participants.includes(id))) throw new Error('Invalid signed-in scenario member')
  if (!configuration && (snapshot.events.length || snapshot.participants.length || snapshot.signedIn.length || snapshot.availabilityChanged)) throw new Error('Unexpected scenario checkpoint')
  participants = nextParticipants
  signedIn = nextSignedIn
  events = structuredClone(snapshot.events).map(event => Object.freeze(event))
  availabilityChanged = snapshot.availabilityChanged
  finalized = snapshot.finalized
}
