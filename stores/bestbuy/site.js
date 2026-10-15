// Routes for the real-site structure: department/category landing pages, membership, credit card,
// trade-in, gift card, business and app pages, help/policy pages, order lookup, newsletter sign-up
// and the site map. Product grids list only the active catalog (see site-tree.js for the mapping).
import { esc } from '../../lib/html.js'
import { orderStatus } from '../../lib/retail-state.js'
import { CATALOG, refine } from './data.js'
import { tile } from './browse-pages.js'
import { localProduct } from './location.js'
import { privateOrders } from './journeys.js'
import { NODES } from './site-tree.js'
import { INFO, SENTRY } from './site-content.js'
import * as S from './site-pages.js'

const textMatch = (m, v) => m instanceof RegExp ? m.test(v) : v === m
// GTA VI listings keep their original node rules; assortment rows (shelf.js) name their
// site-tree department and categories directly.
function shelfMatch(node, p) {
  const dept = node.parent || node
  if (p.tree !== dept.id && p.alsoTree !== dept.id) return false
  if (!node.parent) return true
  if (/ Deals$/.test(node.name)) return p.deal && (p.tree === dept.id)
  if (node.games) return !!p.esrb
  return p.nodes.includes(node.name)
}
export function nodeProducts(node) {
  const dept = node.parent || node
  return CATALOG.filter(p => {
    if (p.shelf) return shelfMatch(node, p)
    if (!dept.local) return false
    if (node.games) return p.kind === 'game'
    if (node.platform) return p.kind === 'game' && p.platform === node.platform
    if (p.department !== dept.local) return false
    if (dept.match && !textMatch(dept.match, `${p.category} ${p.title}`)) return false
    if (!node.parent) return true
    return node.match ? textMatch(node.match, p.category) : false
  })
}

export function installSite(router, { render, notFound }) {
  const page = (title, body) => (req, res) => render(req, res, `${title} - Best Buy`, body(res.locals.base, req))
  for (const node of NODES) {
    router.get(node.path, (req, res) => {
      const sort = ['price_low', 'price_high', 'rating'].includes(req.query.sort) ? req.query.sort : ''
      let items = refine(nodeProducts(node).map(p => localProduct(p, req.store)), { sort })
      // Best Match: the pre-order listings sit among the department's products (after the first
      // row), as a promoted item would, rather than ahead of everything else.
      if (!sort && items.some(p => p.shelf)) { const promoted = items.filter(p => !p.shelf), rest = items.filter(p => p.shelf); items = [...rest.slice(0, 4), ...promoted, ...rest.slice(4)] }
      const base = res.locals.base, dept = node.parent || node
      const shelfDept = items.find(p => p.shelf)?.department
      const moreHref = `${base}/site/searchpage.jsp?${new URLSearchParams(shelfDept ? { department: shelfDept, ...(node.parent && !/ Deals$/.test(node.name) && !node.games ? { node: node.name } : {}), ...(/ Deals$/.test(node.name) ? { offer: 'deals' } : {}) } : dept.local ? { department: dept.local } : { st: node.name })}`
      render(req, res, `${node.name} - Best Buy`, S.categoryPage({ base, node, count: items.length, shown: Math.min(items.length, 24), moreHref, sort, tilesHtml: items.slice(0, 24).map(p => tile(base, p)).join('') }))
    })
  }
  for (const path of ['/site/electronics/best-buy-membership/pcmcat1679668833285.c', '/membership']) router.get(path, page('My Best Buy Memberships', S.membershipPage))
  for (const path of ['/site/misc/financing-rewards/pcmcat102500050032.c', '/financing']) router.get(path, page('My Best Buy Credit Cards', S.creditPage))
  for (const path of ['/site/best-buy-trade-in/trade-in-offers/pcmcat1774297472214.c', '/trade-in']) router.get(path, page('Trade-In Offers', S.tradeInPage))
  for (const path of ['/site/electronics/gift-cards/cat09000.c', '/gift-cards']) router.get(path, page('Gift Cards', S.giftCardsPage))
  for (const path of ['/site/electronics/bestbuy-business/pcmcat230900050001.c', '/business']) router.get(path, page('Best Buy Business', S.businessPage))
  router.get('/site/misc/mobile-app/pcmcat208500050016.c', page('Best Buy Mobile App', S.appPage))
  for (const [path, info] of Object.entries(INFO)) router.get(path, (req, res) => render(req, res, `${info.title.replace('&amp;', '&')} - Best Buy`, S.infoPage(res.locals.base, path, info)))
  router.get('/sentry/landing', (req, res) => {
    const [title, lead] = SENTRY[req.query.type] || SENTRY.ca_donotsell
    render(req, res, `${title} - Best Buy`, S.infoPage(res.locals.base, '/sentry/landing', { group: 'Legal &amp; Privacy', title: esc(title), lead: esc(lead), sections: [['Submit a request', '<p>On the real site you confirm your identity and submit the request here. This local store keeps no marketing profile, so there is nothing to opt out of and no request is sent.</p>'], ['Learn more', `<p>See our <a href="${res.locals.base}/site/help-topics/privacy-policy/pcmcat204400050062.c">Privacy Policy</a> and <a href="${res.locals.base}/site/privacy-policy/state-privacy-rights/pcmcat204400050063.c">State Privacy Rights</a>.</p>`]] }))
  })
  router.get('/gift-card-balance', page('Gift Card Balance', base => S.giftBalancePage(base)))
  router.post('/gift-card-balance', (req, res) => {
    const values = { cardNumber: String(req.body.cardNumber ?? '').replace(/\D/g, '').slice(0, 19) }
    const error = !values.cardNumber || !String(req.body.pin ?? '').trim() ? 'Please enter your card number and PIN.' : "Sorry, we couldn't find a gift card with that number and PIN."
    render(req, res, 'Gift Card Balance - Best Buy', S.giftBalancePage(res.locals.base, { values, error }), { status: 400 })
  })
  router.get('/profile/ss/orderlookup', (req, res) => {
    const base = res.locals.base, values = { orderNumber: String(req.query.orderNumber ?? '').trim().toUpperCase().slice(0, 40), email: String(req.query.email ?? '').trim().slice(0, 120) }
    let error = '', result = '', status = 200
    if (req.query.orderNumber !== undefined || req.query.email !== undefined) {
      if (!values.orderNumber || !values.email) { error = 'Please enter your order number and email address.'; status = 400 }
      else {
        const o = privateOrders(req).find(o => o.order_number.toUpperCase() === values.orderNumber && o.customer.email === values.email.toLowerCase())
        if (!o) { error = "We couldn't find an order with that information. Check your order number and email address and try again."; status = 404 }
        else result = `<div class="bbx-order-result" role="status"><h2>Order ${esc(o.order_number)}</h2><p>Status: <b>${esc(orderStatus(o).replaceAll('_', ' '))}</b></p><p>${o.items.map(i => esc(i.title)).join('<br>')}</p><a class="bbx-btn bbx-btn-blue" href="${base}/account/orders/${o.id}/tracking">View order details</a></div>`
      }
    }
    render(req, res, 'Order Status - Best Buy', S.orderLookupPage(base, { values, error, result }), { status })
  })
  router.post('/newsletter', (req, res) => {
    const email = String(req.body.deals_email ?? '').trim()
    const ok = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)
    render(req, res, 'Get the latest deals - Best Buy', `<div class="bbx-form-page"><h1>${ok ? 'Thanks for signing up!' : 'Please enter a valid email address.'}</h1><p>${ok ? `We saved your interest for ${esc(email)} in this browser session only. This local store does not send marketing email.` : 'Enter an email address like name@example.com to get the latest deals.'}</p><a class="bbx-btn bbx-btn-blue" href="${res.locals.base}/">Continue shopping</a></div>`, { status: ok ? 200 : 400 })
  })
  router.get('/sitemap', page('Site Map', S.sitemapPage))
  router.get('/sitemap.xml', (req, res) => res.type('application/xml').send(S.sitemapXml(res.locals.base)))
}
