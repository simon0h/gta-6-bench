import { Router } from 'express'
import { esc } from '../lib/html.js'

// Public observations and purchase eligibility are separate. A search card is
// never enough evidence to create stock, variant choices or checkout controls.
export function observedProduct(product, { source, evidence, facts, capturedAt = '2026-10-06' }) {
  return Object.freeze({ ...product, source_url: source, captured_at: capturedAt,
    evidence_path: evidence, availability: 'unknown', purchase: 'unverified',
    facts: facts || ['title', 'native_path', 'displayed_price', 'image'] })
}

export const capturedPhrase = value => typeof value === 'string' && value.trim().toLowerCase().replace(/\s+/g, ' ') === 'gta 6'

export function referenceRetailStore(config) {
  const router = Router(), observations = Object.freeze(config.observations || [])
  const baseOf = res => res.locals.base || `/${config.slug}`
  function render(req, res, title, body, status = 200) {
    config.prepare?.(req)
    const chromeReq = Object.assign(Object.create(Object.getPrototypeOf(req)), req, {
      store: { ...req.store, cart: [] },
    })
    const html = config.chrome({ req: chromeReq, base: baseOf(res), title, body, count: 0, accountLabel: 'Sign In' })
    res.status(status).type('html').send(html)
  }
  function coverage(req, res, title = "Sorry, we couldn't find that page", status = 200) {
    const query = config.queryKeys.map(key => req.query[key]).find(value => typeof value === 'string' && value.trim())
    render(req, res, title, `<section class="empty reference-coverage" data-reference-state="uncaptured"><h1>${esc(title)}</h1>${query ? `<p>We couldn't find any matches for <strong>${esc(query)}</strong>. Check the spelling or try a more general search term.</p>` : ''}<a href="${baseOf(res)}/">Continue shopping</a></section>`, status)
  }
  function catalog(req, res) {
    const base = baseOf(res)
    const cards = observations.map(p => `<article data-reference-product="${esc(p.id)}" data-purchase-evidence="unverified"><a href="${esc(base + p.path)}">${p.image ? `<img src="${esc(p.image)}" alt="${esc(p.alt || p.title)}" loading="lazy" style="width:100%;height:220px;object-fit:contain">` : ''}<h2>${esc(p.title)}</h2></a>${p.subtitle ? `<p>${esc(p.subtitle)}</p>` : ''}${p.seller ? `<p>${esc(p.seller)}</p>` : ''}${p.price_text || p.priceDisplay ? `<p>${esc(p.price_text || p.priceDisplay)}</p>` : Number.isFinite(p.price) ? `<p>${esc(new Intl.NumberFormat('en-US', { style: 'currency', currency: config.currency || 'USD' }).format(p.price))}</p>` : ''}</article>`).join('')
    render(req, res, config.name, `<section class="reference-catalog" data-reference-state="catalog"><h1>${esc(config.name)}</h1><p>Featured products</p>${config.capturedSearch ? `<p><a href="${base}${config.capturedSearch}">See search results</a></p>` : ''}<form action="${base}${config.searchRoutes[0]}" method="get"><label for="reference-search">Search</label><input id="reference-search" name="${config.queryKeys[0]}" type="search"><button>Search</button></form><div class="reference-products" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:24px">${cards}</div></section>`)
  }
  router.use((req, res, next) => {
    if (Object.values(req.query).some(value => typeof value !== 'string')) return coverage(req, res, 'Choose one value for each query field', 400)
    next()
  })
  router.get('/', catalog)
  router.get('/reference/catalog', catalog)
  router.get(config.searchRoutes, (req, res) => {
    const query = config.queryKeys.map(key => req.query[key]).find(value => value !== undefined) || ''
    if (!config.search || !config.matches(query)) return coverage(req, res, `No results for "${query}"`)
    return config.search(req, res, { render, base: baseOf(res), query })
  })
  config.install?.(router, { render, coverage, baseOf })
  router.get('/location', (req, res) => render(req, res, 'Delivery location', `<h1>Delivery location</h1><form method="post" action="${baseOf(res)}/location"><label for="postal-code">ZIP code</label><input id="postal-code" name="postal_code" value="${esc(req.store.location || '')}" inputmode="numeric" required><button>Save location</button></form><p>We'll use this to show delivery and pickup options near you.</p>`))
  router.post('/location', (req, res) => {
    const postal = typeof req.body?.postal_code === 'string' ? req.body.postal_code.trim() : ''
    if (!/^\d{5}$/.test(postal)) return coverage(req, res, 'Enter a valid ZIP code', 400)
    req.store.location = postal
    res.redirect(`${baseOf(res)}/location`)
  })
  // No legacy mutations can reach an unverified observation or stale fixture cart.
  router.use((req, res) => coverage(req, res, req.method === 'GET' ? "Sorry, we couldn't find that page" : "This item isn't available to buy online right now", req.method === 'GET' ? 404 : 409))
  return { slug: config.slug, name: config.name, country: config.country || 'US', currency: config.currency || 'USD',
    gta6_available: config.availability === 'unavailable' ? false : null,
    availability_status: config.availability,
    catalog_status: observations.length ? 'captured-listings' : 'unverified',
    catalog_observations: observations,
    description: observations.length ? 'Captured public listings; purchase eligibility is unverified.' : 'Public product inventory is unverified.', router }
}
