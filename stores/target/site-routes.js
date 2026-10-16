// Routes for Target.com's non-checkout pages: department landing pages under Target's own
// /c/<slug>/-/N-<id> paths, help/policy/information pages, store locator, gift card balance,
// registry search, email sign-up, feedback and the site map. Forms work without JavaScript and
// never contact a real service.
import { esc, publicNotice } from '../../lib/html.js'
import * as S from './site.js'
import * as D from './site-data.js'
import { STORES, selectedStore } from './journeys.js'

const SERVICES = ['Order Pickup', 'Drive Up', 'Grocery', 'CVS pharmacy']
const clean = (v, n = 120) => typeof v === 'string' ? v.trim().slice(0, n) : ''
const field = (id, label, value = '', attrs = '') => `<div class="tg-field"><label for="${id}">${label}</label><input id="${id}" name="${id}" value="${esc(value)}" ${attrs}></div>`

export function installSite(router, { render, notFound, browseRender, products }) {
  const page = (req, res, title, body, status = 200) => render(req, res, `${title} : Target`, body, { status })

  function sitePage(req, res) {
    const base = res.locals.base, path = req.path
    if (path === D.SHOP_ALL_PATH) return page(req, res, 'Shop All Categories', S.shopAllPage(base))
    const info = S.infoFor(path)
    if (info) return page(req, res, info.h1, S.infoPage(base, info))
    const view = S.categoryView(base, path)
    if (!view) return notFound(req, res)
    browseRender(req, res, { pool: products.filter(p => !p.addon && view.scope(p)), heading: view.title, intro: view.intro, outro: view.outro, crumbs: false, emptyCategory: true })
  }
  router.get('/c/:slug/-/:node', sitePage)
  router.get('/c/:slug/:node', (req, res, next) => /^N-[0-9a-z]+$/i.test(req.params.node) ? sitePage(req, res) : next())
  router.get('/l/:slug/-/:node', sitePage)
  for (const p of ['/circlecard', '/circle/deals', '/returns', '/security', '/guest-privacy', '/guest-privacy/legal-privacy', '/bullseye-shop', '/advertise-with-us', '/partners', '/targetplus'])
    router.get(p, sitePage)
  router.get('/corporate/:page', sitePage)
  router.get('/help/articles/:topic/:article', sitePage)
  router.get('/redcard', (req, res) => res.redirect(301, `${res.locals.base}/circlecard`))
  router.get('/help/contact-us', (req, res) => page(req, res, 'Contact Us', S.contactUsPage(res.locals.base)))

  // Store locator: "Find a store" with ZIP/city search and a services filter.
  router.get(D.FIND_STORES_PATH, (req, res) => {
    const base = res.locals.base, q = clean(req.query.q, 100), wanted = [].concat(req.query.service ?? []).filter(s => SERVICES.includes(s))
    const near = q || req.store.locationZip || '95065'
    const found = STORES.filter(s => (q ? `${s.name} ${s.address}`.toLowerCase().includes(q.toLowerCase()) || (/^\d{5}$/.test(q) && s.zip.slice(0, 3) === q.slice(0, 3)) : s.zip.slice(0, 3) === near.slice(0, 3) || s.id === selectedStore(req).id) && wanted.every(w => s.services.includes(w)))
    page(req, res, 'Find a store', `<div class="tg-journey tg-locator"><h1>Find a store</h1>
    <form class="tg-locator-form" method="get" action="${base}${D.FIND_STORES_PATH}"><div class="tg-field"><label for="q">Enter ZIP or city, state</label><input id="q" name="q" value="${esc(q)}" autocomplete="postal-code"></div><fieldset class="tg-service-filter"><legend>Filter by services</legend>${SERVICES.map((s, i) => `<label class="tg-check"><input type="checkbox" name="service" value="${esc(s)}" id="svc${i}"${wanted.includes(s) ? ' checked' : ''}> ${esc(s)}</label>`).join('')}</fieldset><button class="tg-btn" aria-label="search">Search</button></form>
    ${wanted.length ? `<section class="tg-applied"><h2>Applied filters</h2>${wanted.map(w => `<span class="tg-chip">${esc(w)}</span>`).join(' ')} <a href="${base}${D.FIND_STORES_PATH}${q ? '?q=' + encodeURIComponent(q) : ''}">Clear all</a></section>` : ''}
    <p class="tg-count">${found.length} ${found.length === 1 ? 'store' : 'stores'} near ${q ? `“${esc(q)}”` : esc(near)}</p>
    <div class="tg-locator-list">${found.map(s => `<article class="tg-store-card"><h2><a href="${base}/stores/${s.id}">${esc(s.name)}</a></h2><p>${esc(s.address)}</p><p class="tg-green">Open today ${esc(s.hours)}</p><p class="tg-fine">${s.services.map(esc).join(' · ')}</p><form action="${base}/stores/select" method="post"><input type="hidden" name="store_id" value="${s.id}"><button class="tg-btn tg-btn-outline tg-btn-sm">${selectedStore(req).id === s.id ? 'Your store' : 'Make it my store'}</button></form></article>`).join('') || `<p>No stores match your search. Try another ZIP code or city.</p>`}</div>
    <p class="tg-fine">Store hours may vary on holidays. Pharmacy and clinic hours may differ from store hours.</p>${publicNotice('<p class="tg-fine">This local directory lists a few stores only; hours and services are not live.</p>')}</div>`)
  })

  // Gift card balance: never invents a balance.
  const balanceForm = (base, v = {}, error = '') => `<div class="tg-journey tg-narrow"><nav class="tg-crumbs" aria-label="Breadcrumb"><a href="${base}${D.GIFT_CARDS_PATH}">Gift Cards</a> › <span aria-current="page">Check balance</span></nav><h1>Check a gift card balance</h1>
    ${error ? `<div class="tg-error-box" role="alert">${esc(error)}</div>` : ''}<form method="post" action="${base}/guest/gift-card-balance" class="tg-journey-form" novalidate>${field('cardNumber', 'Card number', v.cardNumber, 'inputmode="numeric" autocomplete="off" maxlength="19"')}${field('accessNumber', 'Access number', v.accessNumber, 'inputmode="numeric" autocomplete="off" maxlength="8"')}<button class="tg-btn">Check balance</button></form>
    <p class="tg-fine">Find the 15-digit card number and 8-digit access number on the back of the card, under the scratch-off strip. <a href="${base}/help/articles/gift-cards/target-giftcards">Gift card FAQs</a></p></div>`
  router.get('/guest/gift-card-balance', (req, res) => page(req, res, 'Check a gift card balance', balanceForm(res.locals.base)))
  router.post('/guest/gift-card-balance', (req, res) => {
    const v = { cardNumber: clean(req.body.cardNumber, 19).replace(/\D/g, ''), accessNumber: clean(req.body.accessNumber, 8).replace(/\D/g, '') }
    const error = v.cardNumber.length !== 15 ? 'Enter a valid 15-digit card number.' : v.accessNumber.length !== 8 ? 'Enter a valid 8-digit access number.' : 'We couldn’t find a gift card with that number. Check the card number and access number and try again.'
    page(req, res, 'Check a gift card balance', balanceForm(res.locals.base, v, error), 400)
  })

  // Registry & Wish List landing page with a registry search that never invents results.
  router.get('/gift-registry', (req, res) => {
    const base = res.locals.base, first = clean(req.query.firstName, 60), last = clean(req.query.lastName, 60), searched = 'lastName' in req.query
    page(req, res, 'Registry & Wish List', `<div class="tg-registry-page"><section class="tg-registry-hero"><div><h1>Registry &amp; Wish List</h1><h2>Celebrate any milestone</h2><p>Baby, wedding, birthday, housewarming or just because — make a list of what you love.</p></div></section>
    <div class="tg-journey"><div class="tg-journey-cards"><section class="tg-journey-card"><h2>Create or manage your registry and wish list</h2><p>Sign in to see your wish list and add the items you love.</p><a class="tg-btn" href="${base}/lists">Manage wish list</a></section>
    <section class="tg-journey-card"><h2>Find a registry or wish list</h2><form method="get" action="${base}/gift-registry" class="tg-journey-form">${field('firstName', 'First name', first, 'autocomplete="off"')}${field('lastName', 'Last name', last, 'autocomplete="off" required')}<button class="tg-btn tg-btn-outline">Search</button></form>${searched ? `<p role="status">${last ? `No registries or wish lists found for ${esc(`${first} ${last}`.trim())}.` : 'Enter a last name to search.'}</p>` : ''}</section></div>
    <section class="tg-group"><h2>Easy for everyone</h2><p>Free returns on registry gifts for one year after the event date, a welcome kit and a completion discount on Target.com.</p></section>
    <section class="tg-group"><h2>Download the Target App</h2><p>Scan items in store to add them to your registry.</p><a href="${base}${D.node('target-app', 'N-4th2r')}">Learn about the Target App</a></section>
    <section class="tg-group"><h2>Registry &amp; Wish List help</h2><p>Wish lists are private to your account. Sign in to view, edit or add items to your list.</p><a href="${base}/help">Target Help</a></section></div></div>`)
  })

  router.get('/feedback', (req, res) => page(req, res, 'Feedback', feedbackForm(res.locals.base)))
  router.post('/feedback', (req, res) => {
    const message = clean(req.body.message, 2000)
    if (message.length < 5) return page(req, res, 'Feedback', feedbackForm(res.locals.base, 'Tell us a little more (at least 5 characters).', message), 400)
    page(req, res, 'Feedback', `<div class="tg-journey tg-narrow"><h1>Thanks for your feedback</h1><p>We read every comment and use it to make Target better for all guests.</p>${publicNotice('<p class="tg-fine">Your comments were received by this local store. Nothing is sent to Target.</p>')}<a class="tg-btn" href="${res.locals.base}/">Continue shopping</a></div>`)
  })
  router.post('/newsletter', (req, res) => {
    const email = clean(req.body.email, 200), ok = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)
    page(req, res, 'Sign up', `<div class="tg-journey tg-narrow"><h1>${ok ? 'Thanks for signing up!' : 'Check your email address'}</h1><p>${ok ? 'You’re on the list for top deals, the latest trends and more from Target.' : 'Enter a valid email address in the sign-up box below.'}</p>${ok ? publicNotice('<p class="tg-fine">This local store does not send emails, so no message will arrive.</p>') : ''}<a class="tg-btn" href="${res.locals.base}/">Continue shopping</a></div>`, ok ? 200 : 400)
  })

  router.get('/sitemap', (req, res) => page(req, res, 'Site map', S.sitemapPage(res.locals.base)))
  router.get('/sitemap.xml', (req, res) => {
    const base = res.locals.base
    res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${S.sitemapPaths().map(p => `  <url><loc>${esc(base + p)}</loc></url>`).join('\n')}\n</urlset>\n`)
  })
}
function feedbackForm(base, error = '', message = '') {
  return `<div class="tg-journey tg-narrow"><h1>Feedback</h1><p>Tell us about your experience on this site.</p>${error ? `<div class="tg-error-box" role="alert">${esc(error)}</div>` : ''}<form method="post" action="${base}/feedback" class="tg-journey-form"><div class="tg-field"><label for="message">Your feedback</label><textarea id="message" name="message" rows="5" maxlength="2000">${esc(message)}</textarea></div><button class="tg-btn">Submit feedback</button></form></div>`
}
