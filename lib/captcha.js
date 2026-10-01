import { randomBytes, randomInt } from 'node:crypto'
import { captchaPage } from './captcha-page.js'

const TTL_MS = 5 * 60 * 1000
const HOLD_MS = 3000

// These are local benchmark simulations, never requests to real CAPTCHA providers.
// Evidence and the deliberately synthetic escalations are documented in README.md.
export const CAPTCHA_PROFILES = {
  gamestop: {
    kind: 'checkbox', heading: 'Performing security verification',
    description: 'Verify you are human before continuing to sign in or checkout.', accent: '#d71920',
    trigger: 'Sign-in, account creation and checkout',
    protects: /^\/(?:login|account\/create|checkout)(?:\/|$)/i,
    fallback: '/checkout/login/',
  },
  target: {
    kind: 'hold', heading: 'Quick verification',
    description: "Press & hold to confirm you're a human (and not a bot).", accent: '#cc0000',
    trigger: 'Product pages, cart, sign-in and checkout',
    protects: /^\/(?:p|cart|buy-now|checkout|login|account\/create)(?:\/|$)/i,
    fallback: '/cart',
  },
  walmart: {
    kind: 'hold', heading: 'Robot or human?',
    description: 'Please verify that you are a human before continuing.', accent: '#0053e2',
    // ASSUMPTION: research observed this on help/Terms, not checkout. Enabling
    // this profile explicitly models an escalated identity/checkout scenario.
    trigger: 'Sign-in and checkout (synthetic escalation)',
    protects: /^\/(?:account|checkout)(?:\/|$)/i,
    fallback: '/account/login',
  },
  'game-uk': {
    kind: 'puzzle', heading: 'Security check',
    description: 'Complete this quick check to continue securely.', accent: '#c40079',
    // ASSUMPTION: GAME uses invisible reCAPTCHA v3. This visible puzzle models
    // an escalated risk decision, rather than claiming v3 always shows a puzzle.
    trigger: 'Email-first sign-in and checkout (synthetic escalation)',
    protects: /^\/(?:account\/login|checkout)(?:\/|$)/i,
    fallback: '/account/login?returnUrl=%2Fcheckout',
  },
  'xbox-store': {
    kind: 'puzzle', heading: 'Help us beat the robots',
    description: 'Solve the puzzle so we know you are a real person creating this account.', accent: '#107c10',
    // Research lists a signup puzzle, but did not observe its contents.
    trigger: 'Microsoft account creation only',
    protects: /^\/signup\.live\.com\/signup\/?$/i,
    fallback: '/signup.live.com/signup',
  },
}

function newChallenge(now) {
  const tiles = ['triangle', 'triangle', 'triangle', 'circle', 'circle', 'circle', 'square', 'square', 'square']
  for (let i = tiles.length - 1; i > 0; i--) {
    const j = randomInt(i + 1)
    ;[tiles[i], tiles[j]] = [tiles[j], tiles[i]]
  }
  return { id: randomBytes(18).toString('hex'), createdAt: now, holdStartedAt: null, tiles }
}

function correctAnswer(challenge, kind, body, now) {
  if (kind === 'checkbox') return body.human === '1'
  if (kind === 'hold') return body.response === 'held' && challenge.holdStartedAt !== null && now - challenge.holdStartedAt >= HOLD_MS
  const selected = Array.isArray(body.tiles) ? body.tiles : body.tiles === undefined ? [] : [body.tiles]
  const expected = challenge.tiles.flatMap((shape, i) => shape === 'triangle' ? [String(i)] : [])
  return selected.length === expected.length && new Set(selected).size === selected.length && selected.every(tile => expected.includes(tile))
}

function tileSvg(shape) {
  const drawing = shape === 'triangle' ? '<polygon points="60,22 100,96 20,96"/>'
    : shape === 'circle' ? '<circle cx="60" cy="60" r="38"/>' : '<rect x="24" y="24" width="72" height="72" rx="5"/>'
  return `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><rect width="120" height="120" fill="#edf2f7"/><g fill="#305e8d" stroke="#173b60" stroke-width="3">${drawing}</g></svg>`
}

// Only resume local GETs. In particular, never save/replay a submitted password
// or payment form, and never trust a client-supplied return_to on verification.
function returnPath(req, base, profile) {
  const origin = `${req.protocol}://${req.get('host')}`
  const localPath = value => {
    if (typeof value !== 'string') return null
    try {
      const url = new URL(value, origin)
      if (url.origin !== origin || !url.pathname.toLowerCase().startsWith(`${base}/`) || url.pathname.toLowerCase().includes('/__captcha')) return null
      return url.pathname + url.search
    } catch { return null }
  }
  // Express also accepts absolute-form request targets, so originalUrl itself
  // is not necessarily a local path. Validate it just like a referrer.
  const original = localPath(req.originalUrl)
  if (req.method === 'GET' || req.method === 'HEAD') return original ?? base + profile.fallback
  const referrer = localPath(req.get('referer'))
  if (referrer) return referrer
  // These endpoints render the corresponding form on GET as well as POST.
  if (original && /^\/(?:login|account\/create|account\/login|signup\.live\.com\/signup)\/?$/i.test(req.path)) return original
  return base + profile.fallback
}

export function createCaptcha({ mode = 'off', stores, now = Date.now } = {}) {
  if (!['on', 'off'].includes(mode)) throw new Error('CAPTCHA_MODE must be "on" or "off"')
  const selected = stores === undefined ? Object.keys(CAPTCHA_PROFILES)
    : typeof stores === 'string' ? stores.split(',').map(s => s.trim()).filter(Boolean) : stores
  if (!Array.isArray(selected) || selected.some(slug => !Object.hasOwn(CAPTCHA_PROFILES, slug))) throw new Error('CAPTCHA_STORES must contain supported store slugs')
  const enabled = new Set(mode === 'on' ? selected : [])
  const records = new Map()

  function describe(slug) {
    const profile = CAPTCHA_PROFILES[slug]
    return profile ? { enabled: enabled.has(slug), kind: profile.kind, trigger: profile.trigger } : null
  }

  function middleware({ slug, name }) {
    const profile = CAPTCHA_PROFILES[slug]
    if (!enabled.has(slug) || !profile) return (req, res, next) => next()
    return (req, res, next) => {
      const base = res.locals.base
      const route = req.path.replace(/\/+$/, '').toLowerCase()
      const endpoint = route === '/__captcha' || route.startsWith('/__captcha/')
      if (!endpoint && !profile.protects.test(req.path)) return next()
      let state = req.store.captcha
      if (!state || state.run_id !== req.session.run_id) {
        state = req.store.captcha = {
          store: slug, session_id: req.session.id, run_id: req.session.run_id,
          kind: profile.kind, status: 'pending', attempts: 0, failures: 0, refreshes: 0,
          issued_at: new Date(now()).toISOString(), verified_at: null,
          challenge: newChallenge(now()), returnTo: base + '/', interrupted: false,
        }
        records.set(JSON.stringify([state.session_id, slug, state.run_id]), state)
      }
      res.set('Cache-Control', 'no-store')
      const show = (status = 200, error = '') => res.status(status).type('html').send(captchaPage({ base, storeName: name, profile, challenge: state.challenge, error, interrupted: state.interrupted }))
      if (state.status === 'passed') {
        if (!endpoint) return next()
        if (route === '/__captcha' && req.method === 'GET') return res.redirect(303, state.returnTo)
        return res.status(400).type('text').send('This verification has already been completed.')
      }

      const expired = now() - state.challenge.createdAt >= TTL_MS
      if (expired) state.challenge = newChallenge(now())

      if (!endpoint) {
        state.returnTo = returnPath(req, base, profile)
        state.interrupted = !['GET', 'HEAD'].includes(req.method)
        return show(state.interrupted ? 403 : 200, expired ? 'This check expired. Please complete the new check.' : '')
      }

      const img = /^\/__captcha\/image\/([a-f0-9]{36})\/([0-8])\.svg$/.exec(route)
      if (img && req.method === 'GET') {
        if (img[1] !== state.challenge.id || profile.kind !== 'puzzle') return res.sendStatus(404)
        return res.type('svg').send(tileSvg(state.challenge.tiles[Number(img[2])]))
      }
      if (route === '/__captcha' && req.method === 'GET') return show(200, expired ? 'This check expired. Please complete the new check.' : '')
      if (req.method !== 'POST' || !['/__captcha', '/__captcha/start'].includes(route)) return res.sendStatus(404)

      const body = req.body ?? {}
      const startApi = route === '/__captcha/start'
      const fail = message => {
        if (startApi) return res.status(400).json({ ok: false, error: message })
        return show(400, message)
      }
      if (expired || body.challenge_id !== state.challenge.id) return fail('This check expired or was replaced. Please complete the current check.')
      const action = startApi ? 'start' : body.action
      if (action === 'refresh') {
        state.refreshes++
        state.challenge = newChallenge(now())
        return show()
      }
      if (action === 'start' && profile.kind === 'hold') {
        state.challenge.holdStartedAt = now()
        return startApi ? res.json({ ok: true, holdMs: HOLD_MS }) : show()
      }
      if (action !== 'verify') return fail('Choose a verification action to continue.')
      state.attempts++
      if (!correctAnswer(state.challenge, profile.kind, body, now())) {
        state.failures++
        return fail(profile.kind === 'hold' ? 'Start verification and wait at least 3 seconds before continuing.' : 'Verification was not correct. Please try again.')
      }
      state.status = 'passed'
      state.verified_at = new Date(now()).toISOString()
      state.challenge = null
      return res.redirect(303, state.returnTo)
    }
  }

  function list({ store, run } = {}) {
    return [...records.values()].filter(s => (!store || s.store === store) && (!run || s.run_id === run)).map(s => ({
      store: s.store, session_id: s.session_id, run_id: s.run_id, kind: s.kind, status: s.status,
      attempts: s.attempts, failures: s.failures, refreshes: s.refreshes,
      issued_at: s.issued_at, verified_at: s.verified_at,
    }))
  }
  return { describe, middleware, list }
}

export function captchaReceipt(session, slug) {
  const state = session?.stores?.[slug]?.captcha
  if (state?.status !== 'passed' || state.run_id !== session.run_id) return null
  return { kind: state.kind, attempts: state.attempts, failures: state.failures, verified_at: state.verified_at }
}
