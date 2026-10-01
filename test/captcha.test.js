import test from 'node:test'
import assert from 'node:assert/strict'
import { request as httpRequest } from 'node:http'
import { startServer, fieldValue } from './helpers.js'

const enabled = { captcha: { mode: 'on' } }
const ADDRESS = { firstName: 'Alex', lastName: 'Tester', address1: '123 Ocean Dr', city: 'Miami', stateCode: 'FL', postalCode: '33139', phone: '3055550123' }
const CARD = { paymentMethod: 'card', cardNumber: '4242424242424242', expirationMonthYear: '12/29', securityCode: '123' }

function challenge(page) {
  const id = fieldValue(page.text, 'challenge_id')
  assert.ok(id, 'a CAPTCHA interstitial includes its challenge form')
  return id
}

async function verifyCheckbox(c, id, opts) {
  return c.post('/gamestop/__captcha', { challenge_id: id, action: 'verify', human: '1' }, opts)
}

async function triangleTiles(c, store, id) {
  const selected = []
  for (let tile = 0; tile < 9; tile++) {
    const picture = await c.get(`/${store}/__captcha/image/${id}/${tile}.svg`)
    assert.equal(picture.status, 200)
    assert.match(picture.headers.get('content-type'), /^image\/svg\+xml/)
    if (picture.text.includes('<polygon')) selected.push(String(tile))
  }
  assert.ok(selected.length > 0 && selected.length < 9, 'the visual challenge mixes matching and nonmatching tiles')
  return selected
}

function puzzleSubmission(id, tiles) {
  const data = new URLSearchParams({ challenge_id: id, action: 'verify' })
  for (const tile of tiles) data.append('tiles', tile)
  return data
}

test('captcha: legacy defaults ignore environment, and explicit enablement can select stores', async () => {
  const prior = process.env.CAPTCHA_MODE
  const priorStores = process.env.CAPTCHA_STORES
  process.env.CAPTCHA_MODE = 'on'
  process.env.CAPTCHA_STORES = 'gamestop'
  let srv
  try {
    srv = await startServer()
    const login = await srv.client().get('/gamestop/login/')
    assert.equal(login.status, 200)
    assert.equal(fieldValue(login.text, 'challenge_id'), null)
    assert.deepEqual(await srv.client().json('/api/captcha'), [])
    await srv.close()
    srv = await startServer({ captcha: {} })
    challenge(await srv.client().get('/gamestop/login/'))
    assert.equal(fieldValue((await srv.client().get('/target/login')).text, 'challenge_id'), null)
  } finally {
    if (prior === undefined) delete process.env.CAPTCHA_MODE
    else process.env.CAPTCHA_MODE = prior
    if (priorStores === undefined) delete process.env.CAPTCHA_STORES
    else process.env.CAPTCHA_STORES = priorStores
    if (srv) await srv.close()
  }

  srv = await startServer({ captcha: { mode: 'on', stores: ['gamestop'] } })
  try {
    challenge(await srv.client().get('/gamestop/login/'))
    assert.equal(fieldValue((await srv.client().get('/target/login')).text, 'challenge_id'), null)
    assert.equal(fieldValue((await srv.client().get('/xbox-store/signup.live.com/signup')).text, 'challenge_id'), null)
    const stores = await srv.client().json('/api/stores')
    assert.deepEqual(stores.find(s => s.slug === 'gamestop').captcha, { enabled: true, kind: 'checkbox', trigger: 'Sign-in, account creation and checkout' })
    assert.equal(stores.find(s => s.slug === 'target').captcha.enabled, false)
    assert.equal(stores.find(s => s.slug === 'amazon').captcha, null)
  } finally { await srv.close() }
  await assert.rejects(startServer({ captcha: { mode: 'sometimes' } }), /CAPTCHA_MODE/)
  await assert.rejects(startServer({ captcha: { mode: 'on', stores: ['unknown-store'] } }), /CAPTCHA_STORES/)
})

test('captcha: gates relevant routes while home, search, and Microsoft sign-in remain available', async () => {
  const srv = await startServer(enabled)
  try {
    const publicPaths = [
      '/gamestop/', '/gamestop/search/?q=gta+6',
      '/target/', '/target/s?searchTerm=gta+6',
      '/walmart/', '/walmart/search?q=gta+6',
      '/game-uk/', '/game-uk/searchresults?descriptionfilter=gta+6',
      '/xbox-store/', '/xbox-store/en-US/search/results?q=gta+6',
      '/xbox-store/login.live.com/oauth20_authorize.srf',
      '/amazon/',
    ]
    for (const path of publicPaths) {
      const page = await srv.client().get(path)
      assert.equal(page.status, 200, path)
      assert.equal(fieldValue(page.text, 'challenge_id'), null, path)
    }
    const gates = [
      '/gamestop/login/', '/gamestop/account/create', '/gamestop/checkout/',
      '/target/p/grand-theft-auto-vi/-/A-100000001', '/target/cart', '/target/login/password', '/target/account/create', '/target/checkout',
      '/walmart/account/login', '/walmart/checkout/review-order',
      '/game-uk/account/login', '/game-uk/checkout/delivery',
      '/xbox-store/signup.live.com/signup',
    ]
    for (const path of gates) {
      const page = await srv.client().get(path)
      assert.equal(page.status, 200, path)
      assert.equal(page.url, srv.base + path, 'gate renders at the requested URL')
      challenge(page)
    }
    const microsoft = srv.client()
    const signIn = await microsoft.post('/xbox-store/login.live.com/oauth20_authorize.srf', { loginfmt: 'tester@example.com' })
    assert.match(signIn.text, /Enter password/)
    assert.equal(fieldValue(signIn.text, 'challenge_id'), null)
  } finally { await srv.close() }
})

test('captcha: checkbox success restores its GET and a guest order includes run-scoped verification metadata', async () => {
  const srv = await startServer(enabled)
  try {
    const c = srv.client()
    await c.post('/gamestop/cart/add?run=captcha-order', { pid: '448295' })
    const path = '/gamestop/checkout/login/?required=false&source=cart'
    const gate = await c.get(path)
    const id = challenge(gate)
    const rejected = await c.post('/gamestop/__captcha', { challenge_id: id, action: 'verify' })
    assert.equal(rejected.status, 400)
    assert.equal(challenge(rejected), id)
    const passed = await verifyCheckbox(c, id, { follow: false })
    assert.equal(passed.status, 303)
    assert.equal(passed.headers.get('location'), path)
    const resumed = await c.get(path)
    assert.equal(fieldValue(resumed.text, 'challenge_id'), null)
    assert.match(resumed.text, /Checkout as Guest/)
    await c.post('/gamestop/checkout/login/', { action: 'guest' })
    const done = await c.post('/gamestop/checkout/', { email: 'captcha@example.com', ...ADDRESS, shippingMethod: 'premium', ...CARD, billingSame: '1' })
    assert.match(done.text, /Thank you for your order!/)
    const [order] = await c.json('/api/orders?run=captcha-order&store=gamestop')
    assert.equal(order.run_id, 'captcha-order')
    assert.equal(order.meta.captcha.kind, 'checkbox')
    assert.equal(order.meta.captcha.attempts, 2)
    assert.equal(order.meta.captcha.failures, 1)
    assert.ok(order.meta.captcha.verified_at)
    const [record] = await c.json('/api/captcha?run=captcha-order&store=gamestop')
    assert.equal(record.status, 'passed')
    assert.equal(record.session_id, order.session_id)
    assert.equal(record.verified_at, order.meta.captcha.verified_at)

    assert.deepEqual(await c.json('/api/captcha?run=other-run'), [])
    assert.deepEqual(await c.json('/api/orders?run=other-run'), [])
    assert.equal(fieldValue((await c.get('/gamestop/login/')).text, 'challenge_id'), null, 'reading filtered benchmark results must not retag or revoke the shopper session')

    challenge(await c.get('/target/login'))
    challenge(await srv.client().get('/gamestop/login/?run=captcha-order'))
    challenge(await c.get('/gamestop/login/?run=next-run'))
    assert.equal((await c.json('/api/captcha?run=captcha-order&store=gamestop')).length, 2)
    const next = await c.json('/api/captcha?run=next-run&store=gamestop')
    assert.equal(next.length, 1)
    assert.equal(next[0].status, 'pending')
  } finally { await srv.close() }
})

test('captcha: direct POSTs cannot bypass gates, including case and trailing-slash route variants', async () => {
  const srv = await startServer(enabled)
  try {
    const paths = [
      '/GAMESTOP/LOGIN/', '/gamestop/checkout/', '/gamestop/account/create/',
      '/TARGET/CART/ADD/', '/target/buy-now/', '/target/checkout/place-order/',
      '/WALMART/ACCOUNT/SIGN-UP/', '/walmart/checkout/place-order/',
      '/GAME-UK/ACCOUNT/LOGIN/', '/game-uk/checkout/payment/',
      '/XBOX-STORE/SIGNUP.LIVE.COM/SIGNUP/',
    ]
    for (const path of paths) {
      const c = srv.client()
      const blocked = await c.post(path, { email: 'secret@example.com', password: 'private-password', cardNumber: CARD.cardNumber, action: 'guest', pid: '448295' }, { follow: false })
      assert.equal(blocked.status, 403, path)
      challenge(blocked)
      assert.doesNotMatch(blocked.text, /secret@example\.com|private-password|4242424242424242/)
    }
    assert.deepEqual(await srv.client().json('/api/orders'), [])

    const c = srv.client()
    await c.post('/gamestop/cart/add', { pid: '448295' })
    const blocked = await c.post('/gamestop/checkout/', { email: 'secret@example.com', ...ADDRESS, ...CARD, billingSame: '1' }, { follow: false })
    const passed = await verifyCheckbox(c, challenge(blocked), { follow: false })
    assert.equal(passed.status, 303)
    assert.match(passed.headers.get('location'), /^\/gamestop\//)
    assert.doesNotMatch(passed.headers.get('location'), /4242|secret|email|cardNumber/)
    await c.get(passed.headers.get('location'))
    assert.deepEqual(await c.json('/api/orders'), [], 'verification never replays the interrupted purchase')
  } finally { await srv.close() }
})

test('captcha: resume URLs stay local for absolute-form requests and untrusted referrers', async () => {
  const srv = await startServer(enabled)
  try {
    // Connect only to the local server; the foreign URL below is the raw HTTP
    // request target, as a proxy might send it, and is never fetched remotely.
    const local = new URL(srv.base)
    const requestLocal = (path, headers, method = 'GET') => new Promise((resolve, reject) => {
      const req = httpRequest({ hostname: local.hostname, port: local.port, method, path, headers }, res => {
        let text = ''
        res.setEncoding('utf8')
        res.on('data', chunk => { text += chunk })
        res.on('end', () => resolve({ status: res.statusCode, text }))
        res.on('error', reject)
      })
      req.on('error', reject)
      req.end()
    })
    const cases = [
      { path: 'http://example.invalid/gamestop/login', method: 'GET' },
      { path: `${srv.base}/gamestop/login?source=absolute`, method: 'GET', expected: '/gamestop/login?source=absolute' },
      { path: '/gamestop/checkout/', method: 'POST', referer: `${srv.base}/gamestop/cart/?source=checkout`, expected: '/gamestop/cart/?source=checkout' },
      { path: '/gamestop/checkout/', method: 'POST', referer: 'http://example.invalid/gamestop/cart/' },
      { path: '/gamestop/checkout/', method: 'POST', referer: `${srv.base}/target/cart` },
    ]
    for (const scenario of cases) {
      const c = srv.client()
      await c.get('/gamestop/')
      const headers = { cookie: [...c.jar].map(([name, value]) => `${name}=${value}`).join('; ') }
      if (scenario.referer) headers.referer = scenario.referer
      const gate = await requestLocal(scenario.path, headers, scenario.method)
      assert.equal(gate.status, scenario.method === 'GET' ? 200 : 403)
      const passed = await verifyCheckbox(c, challenge(gate), { follow: false })
      assert.equal(passed.status, 303)
      const destination = passed.headers.get('location')
      assert.match(destination, /^\/gamestop\//, 'verification always resumes within the same local store')
      assert.equal(new URL(destination, srv.base).origin, local.origin)
      if (scenario.expected) assert.equal(destination, scenario.expected)
    }
  } finally { await srv.close() }
})

test('captcha: challenge refresh, expiry, session ownership, and replay are enforced', async () => {
  let now = Date.UTC(2026, 8, 30)
  const srv = await startServer({ captcha: { mode: 'on', now: () => now } })
  try {
    const c = srv.client()
    const id = challenge(await c.get('/gamestop/login/?run=challenge-life'))
    const other = srv.client()
    const stolen = await verifyCheckbox(other, id, { follow: false })
    assert.equal(stolen.status, 400)
    assert.equal((await verifyCheckbox(c, 'not-a-challenge', { follow: false })).status, 400)
    const refreshed = await c.post('/gamestop/__captcha', { challenge_id: id, action: 'refresh' })
    assert.equal(refreshed.status, 200)
    const second = challenge(refreshed)
    assert.notEqual(second, id)
    assert.equal((await verifyCheckbox(c, id, { follow: false })).status, 400)
    now += 5 * 60 * 1000 + 1
    const expired = await verifyCheckbox(c, second, { follow: false })
    assert.equal(expired.status, 400)
    assert.match(expired.text, /expir/i)
    const third = challenge(expired)
    assert.notEqual(third, second)
    assert.equal((await verifyCheckbox(c, third, { follow: false })).status, 303)
    assert.equal((await verifyCheckbox(c, third, { follow: false })).status, 400)
    const [record] = await c.json('/api/captcha?store=gamestop&run=challenge-life')
    assert.equal(record.refreshes, 1)
    assert.equal(record.status, 'passed')
  } finally { await srv.close() }
})

test('captcha: hold challenge requires a server-timed start and a completed three-second hold', async () => {
  let now = Date.UTC(2026, 8, 30)
  const srv = await startServer({ captcha: { mode: 'on', now: () => now } })
  try {
    const c = srv.client()
    const id = challenge(await c.get('/target/login?redirect=%2Ftarget%2Fcart'))
    const submit = () => c.post('/target/__captcha', { challenge_id: id, action: 'verify', response: 'held' }, { follow: false })
    assert.equal((await submit()).status, 400, 'the client cannot claim a hold without starting it')
    const started = await c.post('/target/__captcha', { challenge_id: id, action: 'start' })
    assert.equal(started.status, 200)
    now += 2999
    assert.equal((await submit()).status, 400, 'client timing cannot substitute for elapsed server time')
    now += 1
    const done = await submit()
    assert.equal(done.status, 303)
    assert.equal(done.headers.get('location'), '/target/login?redirect=%2Ftarget%2Fcart')
    assert.equal(fieldValue((await c.get('/target/cart')).text, 'challenge_id'), null)
    const [record] = await c.json('/api/captcha?store=target')
    assert.equal(record.kind, 'hold')
    assert.equal(record.status, 'passed')

    const walmart = srv.client()
    const walmartId = challenge(await walmart.get('/walmart/account/login'))
    const start = await fetch(srv.base + '/walmart/__captcha/start', {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie: [...walmart.jar].map(([k, v]) => `${k}=${v}`).join('; ') },
      body: JSON.stringify({ challenge_id: walmartId }),
    })
    assert.equal(start.status, 200)
    await start.text()
    now += 3000
    assert.equal((await walmart.post('/walmart/__captcha', { challenge_id: walmartId, action: 'verify', response: 'held' }, { follow: false })).status, 303)
  } finally { await srv.close() }
})

test('captcha: image challenge requires the exact tile set and never exposes answers in HTML or telemetry', async () => {
  const srv = await startServer(enabled)
  try {
    const c = srv.client()
    const page = await c.get('/xbox-store/signup.live.com/signup?run=puzzle-run')
    const id = challenge(page)
    assert.doesNotMatch(page.text, /data-(?:answer|correct)|"(?:answer|correctTiles)"/)
    const tiles = await triangleTiles(c, 'xbox-store', id)
    assert.equal((await srv.client().get(`/xbox-store/__captcha/image/${id}/0.svg`)).status, 404)
    const all = Array.from({ length: 9 }, (_, i) => String(i))
    assert.equal((await c.post('/xbox-store/__captcha', puzzleSubmission(id, all))).status, 400)
    assert.equal((await c.post('/xbox-store/__captcha', puzzleSubmission(id, tiles.slice(1)))).status, 400)
    assert.equal((await c.post('/xbox-store/__captcha', puzzleSubmission(id, [...tiles, tiles[0]]))).status, 400)
    const passed = await c.post('/xbox-store/__captcha', puzzleSubmission(id, tiles), { follow: false })
    assert.equal(passed.status, 303)
    assert.equal(passed.headers.get('location'), '/xbox-store/signup.live.com/signup?run=puzzle-run')
    const signup = await c.get(passed.headers.get('location'))
    assert.match(signup.text, /Birthdate/)
    assert.equal(fieldValue(signup.text, 'challenge_id'), null)

    const telemetry = await c.json('/api/captcha?store=xbox-store&run=puzzle-run')
    assert.equal(telemetry.length, 1)
    assert.equal(telemetry[0].kind, 'puzzle')
    assert.equal(telemetry[0].status, 'passed')
    assert.deepEqual(Object.keys(telemetry[0]).sort(), ['store', 'run_id', 'session_id', 'kind', 'status', 'attempts', 'failures', 'refreshes', 'issued_at', 'verified_at'].sort())
    assert.doesNotMatch(JSON.stringify(telemetry), /challenge_id|answer|tiles|password|cardNumber/)

    const game = srv.client()
    const gameId = challenge(await game.get('/game-uk/account/login'))
    const gameTiles = await triangleTiles(game, 'game-uk', gameId)
    assert.equal((await game.post('/game-uk/__captcha', puzzleSubmission(gameId, gameTiles), { follow: false })).status, 303)
  } finally { await srv.close() }
})
