import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer, fieldValue } from './helpers.js'
import { byId } from '../stores/gamestop/data.js'
import { getOrder } from '../lib/orders.js'

const LOGIN = { email: 'tester@example.com', password: 'Password123!' }
const ADDRESS = { label: 'Home', name: 'Alex Tester', phone: '3055550123', line1: '123 Ocean Dr', line2: 'Apt 4', city: 'Miami', state: 'FL', postal_code: '33139', is_default: 'yes' }
const ORDER = { email: 'guest@example.com', firstName: 'Alex', lastName: 'Tester', address1: '123 Ocean Dr', city: 'Miami', stateCode: 'FL', postalCode: '33139', phone: '3055550123', shippingMethod: 'premium', paymentMethod: 'card', cardNumber: '4242424242424242', expirationMonthYear: '12/29', securityCode: '123', billingSame: '1' }
const base = '/gamestop'
async function signIn(c) { return c.post(base + '/login', LOGIN) }
async function otherAccount(c, suffix) { return c.post(base + '/account/create', { firstName: 'Other', lastName: 'Player', email: `other-${suffix}@example.com`, password: 'Password123!', confirmPassword: 'Password123!' }) }
async function purchase(c, pid = 'gs-mug', account = true) {
  if (account) await signIn(c)
  await c.post(base + '/cart/add', { pid })
  const checkout = account ? await c.get(base + '/checkout') : await c.post(base + '/checkout/login', { action: 'guest' })
  const done = await c.post(base + '/checkout', { ...ORDER, reviewToken: fieldValue(checkout.text, 'reviewToken') })
  assert.equal(done.status, 200); assert.match(done.text, /Thank you for your order/)
  const orders = await c.json('/api/orders?store=gamestop')
  return { done, order: orders.at(-1) }
}

test('gamestop journeys: exact variant favorites resume sign-in and isolate owner state', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    await c.get(base + '/products/gs-dualsense-white?variant=preowned')
    let page = await c.get(base + '/account/saved')
    assert.match(page.text, /gs-dualsense-white\.html\?variant=preowned/)
    assert.match(page.text, /Pre-Owned/)
    assert.equal((await c.post(base + '/favorites/toggle', { pid: 'gs-binder', variant: 'forged' })).status, 400)
    const gate = await c.post(base + '/favorites/toggle', { pid: 'gs-dualsense-white', variant: 'preowned' })
    assert.match(gate.url, /\/login$/)
    assert.equal((await c.post(base + '/login', { ...LOGIN, password: 'wrong' })).status, 401)
    page = await signIn(c)
    assert.match(page.url, /\/account\/saved$/); assert.match(page.text, /gs-dualsense-white\.html\?variant=preowned/); assert.match(page.text, /Remove favorite/)
    await c.get(base + '/logout'); await otherAccount(c, 'saved')
    assert.doesNotMatch((await c.get(base + '/account/saved')).text, /Remove favorite/)
    await c.get(base + '/logout'); page = await signIn(c)
    page = await c.get(base + '/account/saved'); assert.match(page.text, /Remove favorite/)
    await c.post(base + '/favorites/toggle', { pid: 'gs-dualsense-white', variant: 'preowned' })
    assert.doesNotMatch((await c.get(base + '/account/saved')).text, /Remove favorite/)
  } finally { await srv.close() }
})

test('gamestop journeys: saved cart lines retain trusted options/quantity and reject overstock restores', async () => {
  const srv = await startServer(), binder = byId('gs-binder'), originalStock = binder.stock
  try {
    const c = srv.client()
    await c.post(base + '/cart/add', { pid: 'gs-binder', variant: 'red', qty: '2' })
    let cart = await c.get(base + '/cart'), line = fieldValue(cart.text, 'line')
    await c.post(base + '/cart/update', { line, action: 'save' })
    let saved = await c.get(base + '/account/saved'), id = fieldValue(saved.text, 'id')
    assert.ok(id); assert.match(saved.text, /Quantity: 2/); assert.match(saved.text, /Color: Red/)
    binder.stock = 0
    const failed = await c.post(base + '/saved/restore', { id, pid: '448295', variant: 'black', qty: '1', price: '0.01' })
    assert.equal(failed.status, 400); assert.match(failed.text, /saved item has been kept/)
    binder.stock = originalStock
    cart = await c.post(base + '/saved/restore', { id, pid: '448295', qty: '1', price: '0.01' })
    assert.match(cart.text, /Ship To Home: 2 Items/); assert.match(cart.text, /Color: Red/); assert.match(cart.text, /\$55.98/)
    assert.equal((await c.post(base + '/saved/restore', { id })).status, 404)
    await c.post(base + '/cart/update', { line: fieldValue(cart.text, 'line'), action: 'save' })
    saved = await c.get(base + '/account/saved'); id = fieldValue(saved.text, 'id')
    await c.post(base + '/cart/add', { pid: 'gs-binder', variant: 'red' })
    assert.equal((await c.post(base + '/saved/restore', { id })).status, 400)
    assert.equal((await srv.client().post(base + '/saved/remove', { id })).status, 404)
    await c.post(base + '/saved/remove', { id })
    assert.doesNotMatch((await c.get(base + '/account/saved')).text, /Move to cart/)
  } finally { binder.stock = originalStock; await srv.close() }
})

test('gamestop journeys: profile/address CRUD, owner isolation, defaults and checkout picker', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    assert.match((await c.get(base + '/account/addresses')).url, /\/login$/)
    assert.match((await signIn(c)).url, /\/account\/addresses$/)
    const profile = await c.post(base + '/account/profile', { first_name: 'Sam', last_name: 'Player', phone: '3055550199', email: 'forged@example.com' })
    assert.match(profile.text, /value="Sam"/); assert.match(profile.text, /tester@example.com/); assert.doesNotMatch(profile.text, /forged@example.com/)
    let invalid = await c.post(base + '/account/addresses', { ...ADDRESS, state: '??', postal_code: 'bad' })
    assert.equal(invalid.status, 400); assert.match(invalid.text, /value="123 Ocean Dr"/)
    let page = await c.post(base + '/account/addresses', ADDRESS), firstId = /\?edit=(address-[a-f0-9]+)/.exec(page.text)[1]
    page = await c.post(base + '/account/addresses', { ...ADDRESS, label: 'Office', line1: '200 Brickell Avenue', is_default: '' })
    const ids = [...page.text.matchAll(/\?edit=(address-[a-f0-9]+)/g)].map(m => m[1]), secondId = ids.find(id => id !== firstId)
    assert.ok(secondId)
    page = await c.post(base + '/account/addresses', { ...ADDRESS, id: firstId, line2: 'Suite 8' }); assert.match(page.text, /Suite 8/)
    await c.post(base + '/account/addresses/default', { id: secondId })
    await c.post(base + '/cart/add', { pid: 'gs-mug' })
    page = await c.get(base + '/checkout'); assert.match(page.text, /value="200 Brickell Avenue"/); assert.match(page.text, /Use address/)
    page = await c.get(base + '/checkout?address_id=' + firstId); assert.match(page.text, /value="Suite 8"/)
    assert.equal((await c.get(base + '/checkout?address_id=forged')).status, 400)
    const review = fieldValue(page.text, 'reviewToken')
    await c.get(base + '/logout'); await otherAccount(c, 'addresses')
    assert.doesNotMatch((await c.get(base + '/account/addresses')).text, /Suite 8|Brickell/)
    assert.equal((await c.post(base + '/account/addresses/delete', { id: firstId })).status, 404)
    assert.equal((await c.post(base + '/account/addresses/default', { id: firstId })).status, 404)
    assert.equal((await c.get(base + '/checkout?address_id=' + firstId)).status, 400)
    assert.doesNotMatch((await c.get(base + '/checkout')).text, /value="123 Ocean Dr"|value="200 Brickell Avenue"/)
    assert.equal((await c.post(base + '/checkout', { ...ORDER, reviewToken: review })).status, 400)
    await c.get(base + '/logout'); await signIn(c)
    assert.match((await c.get(base + '/account/profile')).text, /value="Sam"/)
    await c.post(base + '/account/addresses/delete', { id: secondId })
    page = await c.get(base + '/account/addresses'); assert.match(page.text, /Home · Default/)
    await c.post(base + '/account/addresses/delete', { id: firstId })
    assert.match((await c.get(base + '/account/addresses')).text, /address book is empty/)
    await c.post(base + '/account/preferences', { platform: 'Nintendo', promotions: 'yes' })
    assert.match((await c.get(base + '/account/preferences')).text, /option selected>Nintendo/)
    assert.equal((await c.post(base + '/account/preferences', { platform: 'Injected' })).status, 400)
  } finally { await srv.close() }
})

test('gamestop journeys: orders, confirmation, support and lifecycle require session AND account ownership', async () => {
  const srv = await startServer()
  try {
    const c = srv.client(), stranger = srv.client(), { done, order } = await purchase(c), path = base + '/order/details/' + order.id
    await signIn(stranger)
    assert.doesNotMatch((await stranger.get(base + '/account/orders')).text, new RegExp(order.order_number))
    for (const route of [path, base + '/account/orders/' + order.id, done.url, base + '/help/contact?order_id=' + order.id]) assert.equal((await stranger.get(route)).status, 404)
    assert.equal((await stranger.post(path + '/action', { action: 'cancel', reason: 'stolen' })).status, 404)
    const support = { category: 'Orders', subject: 'Need help', message: 'Please check my delivery address.', email: LOGIN.email, order_id: order.id }
    assert.equal((await stranger.post(base + '/help/contact', support)).status, 400)
    assert.equal((await stranger.post(base + '/order/search', { order_number: order.order_number, email: LOGIN.email, postal_code: '33139' })).status, 404)
    await c.get(base + '/logout'); await otherAccount(c, 'orders')
    assert.equal((await c.get(done.url)).status, 404); assert.equal((await c.get(path)).status, 404)
    assert.equal((await c.post(path + '/action', { action: 'cancel', reason: 'stolen' })).status, 404)
    assert.equal((await c.post(base + '/help/contact', support)).status, 400)
    await c.get(base + '/logout'); await signIn(c)
    assert.match((await c.get(base + '/account/orders')).text, new RegExp(order.order_number))
    assert.match((await c.get(path)).text, /Awaiting shipment/)
    assert.equal((await c.post(path + '/action', { action: 'return', reason: 'Too soon' })).status, 400)
    const cancelled = await c.post(path + '/action', { action: 'cancel', reason: 'Changed my mind' })
    assert.match(cancelled.text, /Cancelled/)
    assert.doesNotMatch(cancelled.text, /Ships after order processing|Ships on or just after|estimated delivery/)
    const receipt = await c.get(done.url)
    assert.match(receipt.text, /Order cancelled/)
    assert.match(receipt.text, /Cancelled before shipment/)
    assert.doesNotMatch(receipt.text, /Ships after order processing|Ships on or just after|estimated delivery/)
    await c.post(path + '/action', { action: 'cancel', reason: 'Again' })
    assert.equal(getOrder(order.id).meta.lifecycle.length, 1)
    assert.deepEqual(getOrder(order.id).items, order.items)
    assert.equal(getOrder(order.id).items[0].kind, 'other')
    const casePage = await c.post(base + '/help/contact', support)
    assert.match(casePage.text, /Support request received/); assert.match(casePage.text, /View linked order/)
    assert.equal((await stranger.get(casePage.url)).status, 404)
    await c.get(base + '/logout'); await otherAccount(c, 'case')
    assert.equal((await c.get(casePage.url)).status, 404)
  } finally { await srv.close() }
})

test('gamestop journeys: local return request accepts delivered merchandise and rejects excluded cards', async () => {
  const srv = await startServer()
  try {
    const c = srv.client(), { order } = await purchase(c)
    getOrder(order.id).meta.lifecycle = [{ status: 'delivered', reason: 'Trusted test fulfillment fixture' }]
    let page = await c.get(base + '/order/details/' + order.id); assert.match(page.text, /Request return/)
    page = await c.post(base + '/order/details/' + order.id + '/action', { action: 'return', reason: 'Does not fit my setup' })
    assert.match(page.text, /Return requested/)
    const cardOrder = (await purchase(c, 'gs-sports-box')).order
    getOrder(cardOrder.id).meta.lifecycle = [{ status: 'delivered', reason: 'Trusted test fulfillment fixture' }]
    assert.equal((await c.post(base + '/order/details/' + cardOrder.id + '/action', { action: 'return', reason: 'Opened packs' })).status, 400)
    assert.equal(getOrder(cardOrder.id).meta.lifecycle.length, 1)
  } finally { await srv.close() }
})

test('gamestop journeys: guest order lookup links support without fabricating shipment or cancellation', async () => {
  const srv = await startServer()
  try {
    const c = srv.client(), { order } = await purchase(c, 'gs-mug', false), path = base + '/order/details/' + order.id
    assert.equal((await c.post(base + '/order/search', { order_number: order.order_number, email: ORDER.email, postal_code: '00000' })).status, 404)
    const page = await c.post(base + '/order/search', { order_number: order.order_number, email: ORDER.email, postal_code: '33139' })
    assert.match(page.url, /\/order\/details\//); assert.match(page.text, /Contact support to request guest cancellation/)
    assert.equal((await c.post(path + '/action', { action: 'cancel', reason: 'Cancel guest' })).status, 400)
    const support = await c.post(base + '/help/contact', { category: 'Orders', subject: 'Guest cancellation', message: 'Please cancel this processing guest order.', order_id: order.id, email: ORDER.email })
    assert.match(support.text, /Support request received/)
    assert.equal(getOrder(order.id).meta.lifecycle, undefined)
  } finally { await srv.close() }
})

test('gamestop journeys: help search, validation, escaped cases and working store service choices', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    let page = await c.get(base + '/help?q=preorder'); assert.match(page.text, /Preorders and release dates/)
    assert.match((await c.get(base + '/help?q=unknown-nothing')).text, /No help articles/)
    assert.equal((await c.get(base + '/help/articles/payments')).status, 200)
    page = await c.post(base + '/help/contact', { category: 'Orders', subject: 'Keep this subject', email: 'bad', message: 'short' })
    assert.equal(page.status, 400); assert.match(page.text, /Keep this subject/)
    page = await c.post(base + '/help/contact', { category: 'Orders', subject: '<script>unsafe</script>', email: 'guest@example.com', message: 'Please help with my local order.' })
    assert.match(page.text, /&lt;script&gt;unsafe&lt;\/script&gt;/); assert.doesNotMatch(page.text, /<script>unsafe/)
    assert.equal((await c.get(base + '/stores?q=123')).status, 400)
    page = await c.get(base + '/stores?q=Miami'); assert.match(page.text, /Biscayne Games Plaza/); assert.doesNotMatch(page.text, /South Congress Games/)
    await c.post(base + '/stores/select', { id: 'miami' })
    assert.match((await c.get(base + '/')).text, /Biscayne Games Plaza/)
    assert.equal((await c.post(base + '/stores/select', { id: 'injected' })).status, 404)
    assert.equal((await c.get(base + '/card-grading-service')).status, 200)
    assert.match((await c.get(base + '/trade')).url, /\/trade-in$/)
  } finally { await srv.close() }
})

test('gamestop journeys: registration redacts passwords and resumed favorite still hits CAPTCHA', async () => {
  let srv = await startServer()
  try {
    const c = srv.client()
    const page = await c.post(base + '/account/create', { firstName: 'Player', email: 'bad', password: 'SecretValue123!', confirmPassword: 'SecondSecret123!' })
    assert.equal(page.status, 400); assert.match(page.text, /value="Player"/); assert.doesNotMatch(page.text, /SecretValue|SecondSecret/)
    await c.post(base + '/account/create', { firstName:'New',lastName:'Player',email:'registration-preference@example.com',password:'Password123!',confirmPassword:'Password123!',emails:'1' })
    assert.match((await c.get(base + '/account/preferences')).text, /name="promotions" value="yes" checked/)
  } finally { await srv.close() }
  srv = await startServer({ captcha: { mode: 'on', stores: ['gamestop'] } })
  try {
    const c = srv.client()
    const page = await c.post(base + '/favorites/toggle', { pid: 'gs-binder', variant: 'red' })
    assert.match(page.text, /Performing security verification/)
    assert.match((await c.post(base + '/login', LOGIN)).text, /Performing security verification/)
    assert.match((await c.post(base + '/account/create', { firstName: 'New', password: 'Password123!' })).text, /Performing security verification/)
    assert.doesNotMatch((await c.get(base + '/account/saved')).text, /Remove favorite/)
  } finally { await srv.close() }
})
