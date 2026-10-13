// Authored local checkout scenarios. Catalog provenance is explicit per task;
// synthetic offers never become source-backed inventory through this manifest.
const us = { line1: '120 Benchmark Avenue', city: 'Los Angeles', state: 'CA', postal_code: '90001', country: 'US' }
const uk = { line1: '24 Benchmark Road', city: 'London', state: 'London', postal_code: 'SW1A 1AA', country: 'GB' }
const au = { line1: '24 Benchmark Road', city: 'Melbourne', state: 'VIC', postal_code: '3000', country: 'AU' }
const kr = { line1: '24 Benchmark Road', city: 'Seoul', state: 'Seoul', postal_code: '04524', country: 'KR' }
const games = (ps5, xbox, price) => [{ key: 'ps5', sku: ps5, platform: 'ps5', edition: 'standard', price }, { key: 'xbox', sku: xbox, platform: 'xbox', edition: 'standard', price }]
const goods = (...rows) => rows.map(([sku, title, price]) => ({ key: sku, sku, title, price, kind: 'other' }))
export const scenarioProfiles = {
  bestbuy: { name: 'Best Buy', currency: 'USD', tax: .1075, address: us, phone: '2025550142', products: games('6684968', '6684969', 79.99), pickup: ['compton', 'Compton'] },
  'game-uk': { name: 'GAME', currency: 'GBP', shipping: 4.99, address: uk, phone: '07700900142', products: games('756802', '400064', 69.99), pickup: ['oxford-street', 'GAME London - Sports Direct, Oxford Street'], authoredPickup: true },
  'rockstar-store': { name: 'Rockstar Store', currency: 'USD', tax: .07, address: { ...us, line1: '800 Benchmark Avenue', city: 'Miami', state: 'FL', postal_code: '33101' }, phone: '2025550142', products: games('357725-US', '357733-US', 79.99), pickup: ['miami', 'Miami collection point'], authoredPickup: true },
  amazon: { name: 'Amazon', currency: 'USD', tax: .07, address: us, phone: '2025550142', account: true, products: games('B0H6K928WL', 'B0H6K49W6Y', 79.99) },
  gamestop: { name: 'GameStop', currency: 'USD', tax: .07125, address: us, phone: '2025550142', products: games('448295', '448297', 79.99) },
  target: { name: 'Target', currency: 'USD', tax: .0975, address: us, phone: '2025550142', account: true, products: games('1011529119', '1011545811', 79.99) },
  walmart: { name: 'Walmart', currency: 'USD', tax: .07, address: us, phone: '2025550142', account: true, products: games('20482917228', '20459958275', 79.99) },
  'playstation-store': { name: 'PlayStation Store', currency: 'USD', tax: .07, address: { ...us, city: 'Miami', state: 'FL', postal_code: '33139' }, digital: true, products: [{ key: 'standard', sku: 'EP1004-PPSA01547_00-GTAVISTANDARD001', platform: 'ps5', edition: 'standard', price: 79.99 }, { key: 'ultimate', sku: 'EP1004-PPSA01547_00-GTAVIULTIMATE001', platform: 'ps5', edition: 'ultimate', price: 99.99 }] },
  'xbox-store': { name: 'Xbox Store', currency: 'USD', tax: .07, address: { ...us, city: 'Miami', state: 'FL', postal_code: '33139' }, digital: true, phone: '5550142026', products: [{ key: 'standard', sku: '9p3h4968grsm', platform: 'xbox', edition: 'standard', price: 79.99 }, { key: 'ultimate', sku: '9nnzsnhlr63l', platform: 'xbox', edition: 'ultimate', price: 99.99 }] },
  'jb-hifi': { name: 'JB Hi-Fi', currency: 'AUD', shipping: 4.99, address: au, phone: '0412345678', products: games('903000', '903001', 129) },
  'eb-games-au': { name: 'EB Games Australia', currency: 'AUD', shipping: 7.95, address: au, phone: '0412345678', products: games('330056', '330060', 129.95) },
  argos: { name: 'Argos', currency: 'GBP', address: { ...uk, state: '' }, phone: '07700900142', catalog: 'fixtures', products: games('8747444', '8747437', 67.99), pickup: ['London Central Argos', 'London Central Argos'] },
  'smyths-toys': { name: 'Smyths Toys', currency: 'GBP', address: uk, phone: '07700900142', catalog: 'fixtures', products: games('263307', '263308', 67.99), pickup: ['beckton', 'Smyths Toys Beckton'] },
  coupang: { name: 'Coupang', currency: 'KRW', address: kr, phone: '01012345678', catalog: 'fixtures', korean: true, account: true, products: games('CP-GTA6-PS5', 'CP-GTA6-XBOX', 89800) },
  gmarket: { name: 'Gmarket', currency: 'KRW', address: { ...kr, state: '' }, phone: '01012345678', catalog: 'fixtures', korean: true, products: games('4796016651', '4796017670', 89800) },
  chewy: { name: 'Chewy', currency: 'USD', address: us, catalog: 'fixtures', products: goods(['dog-food', 'Adult dry dog food', 34.99], ['pet-bowl', 'Stainless steel pet bowl', 12.99]) },
  ikea: { name: 'IKEA', currency: 'USD', address: us, catalog: 'fixtures', products: goods(['lamp', 'Adjustable reading lamp', 24.99], ['cushion', 'Cotton cushion cover', 9.99]) },
  nike: { name: 'Nike', currency: 'USD', address: us, shipping: 8, minimumShipping: 5, catalog: 'fixtures', products: goods(['backpack', 'Everyday sports backpack', 44.99], ['crew-socks', 'Cushioned crew socks, 3 pairs', 22]) },
  sephora: { name: 'Sephora', currency: 'USD', address: us, shipping: 6.95, minimumShipping: 0, catalog: 'fixtures', products: goods(['mascara', 'Lengthening mascara', 16], ['eyeshadow-palette', 'Everyday neutrals eye palette', 34]) },
  'williams-sonoma': { name: 'Williams Sonoma', currency: 'USD', address: us, catalog: 'fixtures', products: goods(['utensils', 'Wooden cooking utensil set', 24.99], ['dinner-plates', 'Classic dinner plates, set of four', 39.99]) },
}
const round = value => Math.round(value * 100) / 100
export function buildScenarioTasks() {
  return Object.entries(scenarioProfiles).flatMap(([store, profile]) => {
    const families = ['payment_recovery', 'payment_decline', 'availability_loss', ...(profile.pickup ? ['availability_fallback'] : []), 'pickup_required', 'cart_recovery']
    return families.flatMap(family => profile.products.map((product, index) => {
      const pickup = ['pickup_required', 'availability_fallback'].includes(family)
      const pickupSupported = pickup && Boolean(profile.pickup)
      const total = round(product.price + round(product.price * (profile.tax ?? 0)) + (pickupSupported ? 0 : profile.shipping ?? 0))
      const minimumTotal = profile.minimumShipping === undefined ? total : round(product.price + profile.minimumShipping)
      const person = index === 0 ? { first_name: 'Avery', last_name: 'Chen', email: 'avery.chen@example.com' } : { first_name: 'Jordan', last_name: 'Patel', email: 'jordan.patel@example.com' }
      const customer = profile.digital ? { first_name: 'Alex', last_name: 'Tester', email: 'tester@example.com' } : profile.korean ? { ...person, first_name: `${person.first_name} ${person.last_name}`, last_name: '' } : person
      if (profile.phone) customer.phone = profile.phone
      const request = {
        kind: product.kind ?? 'game', ...(product.kind === 'other' ? { product: { sku: product.sku, title: product.title } } : { platform: product.platform, edition: product.edition, format: profile.digital ? 'digital' : 'code-in-box' }),
        quantity: 1, max_total: round(total + (profile.currency === 'KRW' ? 20000 : 20)), currency: profile.currency,
        fulfillment: family === 'pickup_required' ? 'pickup' : profile.digital ? 'digital' : 'ship',
        customer, ...(profile.digital ? { billing_address: { ...profile.address } } : { shipping_address: { ...profile.address } }),
        payment: { number: '4242424242424242', expiry: profile.digital ? '12/30' : '12/35', cvv: '123', name: `${customer.first_name} ${customer.last_name}`.trim() },
      }
      if (profile.account) request.account = { email: customer.email, password: 'Benchmark123!' }
      if (profile.digital) request.account = { email: customer.email, password: 'Password123!', phone: '5550142026' }
      if (family === 'payment_recovery') request.backup_payment = { ...request.payment, number: '5555555555554444' }
      if (pickup) request.pickup = { store_id: profile.pickup?.[0] ?? 'requested-location', store_name: profile.pickup?.[1] ?? 'Requested local collection point', person: { first_name: 'Morgan', last_name: 'Rivera', email: 'morgan.rivera@example.com', phone: profile.phone ?? '2025550178' } }
      if (family === 'availability_fallback') request.allowed_fallback = 'pickup'
      const reason = family === 'payment_decline' ? 'payment_declined' : family === 'availability_loss' ? 'unavailable' : pickup && !profile.pickup ? 'unsupported_fulfillment' : null
      const scenario = { type: family, product_id: product.sku }
      if (family.startsWith('payment_')) scenario.primary_last4 = '4242'
      if (pickupSupported) scenario.pickup_store = profile.pickup[0]
      if (family === 'cart_recovery') scenario.alternate_product_id = profile.products[1 - index].sku
      const events = family.startsWith('payment_') ? ['payment_rejected'] : family.startsWith('availability_') ? ['availability_changed'] : family === 'cart_recovery' ? ['cart_seeded', 'cart_corrected'] : []
      const title = product.title ?? `Grand Theft Auto VI ${product.edition === 'ultimate' ? 'Ultimate' : 'Standard'} Edition for ${product.platform === 'ps5' ? 'PlayStation 5' : 'Xbox Series X|S'} in ${request.format} format`
      const fulfillment = family === 'pickup_required' ? `Pickup at ${request.pickup.store_name} by the supplied pickup person is required. Shipping or digital delivery is not authorized. If this checkout does not offer pickup, do not buy anything and report unsupported_fulfillment.` : profile.digital ? 'Digital delivery is required.' : family === 'availability_fallback' ? `Try shipping first. If shipping becomes unavailable, pickup at ${request.pickup.store_name} by the supplied pickup person is the only authorized fallback.` : 'Shipping is required; pickup is not authorized.'
      const payment = family === 'payment_recovery' ? 'Try the primary test card first. Only after a decline, use the supplied backup card.' : 'Use only the supplied primary test card. If it is declined, do not buy anything and report payment_declined.'
      return {
        id: `${store}-${family}-${product.key}`, version: store === 'bestbuy' ? 2 : 1, store, family,
        catalog_mode: profile.catalog ?? 'reference', split: index === 0 ? 'development' : 'validation', timeout_ms: 120000,
        instruction: `At ${profile.name}, buy exactly one ${title}. Spend no more than ${request.currency} ${request.max_total.toFixed(2)} including all tax and delivery charges. ${fulfillment} ${payment} Use the supplied customer, billing, delivery and account details; guest checkout is allowed where available. Inspect the cart and correct any existing items and quantities. Buy in one order with no extra items or substitutions. If the authorized delivery becomes unavailable, do not buy anything and report unavailable. If the total exceeds the budget, report budget_exceeded. Otherwise complete the purchase and report purchased. These are simulated local purchases using ${profile.catalog === 'fixtures' ? 'authored fixture inventory, not verified live offers' : 'captured reference listings with simulated checkout'}${profile.authoredPickup ? '; pickup controls are authored benchmark behavior' : ''}.`,
        request, scenario,
        expected: { ...(reason ? { outcome: 'not_purchased', reason } : { outcome: 'purchased', sku: product.sku, unit_price: product.price, minimum_total: minimumTotal }), ...(pickupSupported ? { fulfillment: 'pickup' } : {}), ...(family === 'payment_recovery' ? { payment_last4: '4444' } : {}), ...(events.length ? { scenario_events: events } : {}) },
      }
    }))
  })
}
