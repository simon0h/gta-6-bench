// Information pages, site map and account aliases that mirror www.game.co.uk URLs.
// Off-site destinations on the real site (help.game.co.uk, frasers.group careers, app
// stores) are summarised as local pages so shoppers never leave the store.
import { esc } from '../../lib/html.js'
import { CATEGORY_TREE, allLandings } from './site-data.js'
import { DEPARTMENTS } from './catalog.js'

export const DEPARTMENT_LINKS = [['Consoles & Video Games', '/gaming'], ['Digital Gift Cards', '/digital'], ['PC Gaming', '/pc-gaming'], ['Tech', '/tech'], ['LEGO', '/lego'], ['Toys & Games', '/toys'], ['Trading Cards', '/toys/trading-cards']]
export const FOOTER_COLUMNS = [
  ['Customer services', [['Help Home', '/help'], ['Contact Us', '/contact'], ['Delivery & Collection', '/help/categories/delivery'], ['Returns & Cancellations', '/help/categories/returns'], ['Track order', '/accountinformation/orderhistorysummary']]],
  ['Information', [['My account', '/accountinformation'], ['Game Blog', '/blog'], ['Find your local store', '/stores'], ['Cookie preferences', '/cookie-preferences']]],
  ['About', [['Careers', '/careers'], ['Affiliates', '/affiliates'], ['Promotional terms', '/terms-and-conditions'], ['Terms & conditions', '/help/articles/offers-promotions-and-competitions']]],
]
export const ACCOUNT_LINKS = [['Account details', '/accountinformation'], ['Track orders', '/accountinformation/orderhistorysummary'], ['Manage payments', '/accountinformation/managecards'], ['Address book', '/accountinformation/manageaddressbook'], ['Change password', '/accountinformation/changepassword'], ['Contact preferences', '/accountinformation/contactpreferences']]

const BLOG_POSTS = [
  ['resident-evil-games-in-order', 'The Resident Evil Games in Order', 'Guides', 'A walk through the Resident Evil series from the 1996 original to the latest entries, with the order to play them in.'],
  ['nintendo-switch-2-blog', 'Nintendo Switch 2 Blog', 'Nintendo', 'Everything to know about Nintendo Switch 2: the hardware, launch games and backwards compatibility.'],
  ['ps5-pro-vs-ps5', 'PS5 Pro vs PS5', 'PlayStation', 'How the PS5 Pro compares with the standard PS5 on graphics, storage and price.'],
  ['marvel-vs-dc', 'The World’s Favourite Superhero Universe? Marvel vs DC', 'Entertainment', 'Comparing the two biggest superhero universes across games, films and collectables.'],
  ['best-call-of-duty-characters', '10 Best Call of Duty Characters', 'Lists', 'From Captain Price to Ghost: the most memorable characters in Call of Duty history.'],
  ['top-multiplayer-ps5-games', 'The Top 10 Multiplayer PS5 Games', 'PlayStation', 'The best PS5 games to play with friends, online and on the sofa.'],
]

const PROMO_TERMS = {
  current: [
    ['Frasers Plus Extra 10% Off Sale – July 2026', 'Frasers Plus members receive an extra 10% off qualifying sale-priced products from the start of 28 July to the end of 10 August 2026. The discount is applied automatically at checkout when paying with Frasers Plus. Pre-orders, delivery charges, staff purchases and discontinued products are excluded.'],
    ['Frasers Plus New Customer Offer - £20 reward (2000 points) when you spend £50', 'New Frasers Plus customers who spend £50 or more using Frasers Plus receive 2000 points (£20 reward). Points are added to the Frasers Plus account after the qualifying purchase. Credit is subject to status.'],
    ['Frasers Plus Discount', 'Selected products show an exclusive Frasers Plus price. The price applies only when the order is paid with Frasers Plus.'],
  ],
  past: ['Frasers Plus New Customer Offer - £20 reward (2000 points) when you spend £50', 'Frasers Plus Extra 10% Off - January 2026', 'Black Friday - November 2025', 'LEGO Party and Nintendo Switch Joy-Cons - Competition Terms', 'Xbox Series X and Xbox Series S - October 2025', 'Game Voucher - December 2024', 'Frasers Plus Double Points T&Cs - November 2024', 'Call of Duty Black Ops 6 - Gift with Purchase - September 2024', 'Silent Hill 2 - Gift with Purchase - September 2024', '20% Discount on your Order (EXTRA20) - October 2024', 'Warhammer 40, 000: Space Marine 2- September 2024', 'Match Attax - Twitter Giveaway - September 2024'],
}



export function installSite(router, { render }) {
  const info = (req, res, title, html, { pageTitle, status = 200, crumbs = [] } = {}) => render(req, res, { title: (pageTitle || title) + ' | GAME', status, body: `<div class="gu-info"><nav class="gu-crumbs" aria-label="Breadcrumb"><a href="${res.locals.base}/">Home</a> / ${crumbs.map(([l, u]) => `<a href="${res.locals.base}${u}">${esc(l)}</a> / `).join('')}<span>${esc(title)}</span></nav><h1>${esc(title)}</h1>${html}</div>` })

  // ---- account URLs used by the real header (game.co.uk/accountinformation/...) ----
  const gate = (req, res) => { if (req.store.user) return true; res.redirect(`${res.locals.base}/account/login?returnUrl=${encodeURIComponent(req.originalUrl)}`); return false }
  router.get('/accountinformation', (req, res) => res.redirect(`${res.locals.base}/account`))
  router.get('/accountinformation/manageaddressbook', (req, res) => res.redirect(`${res.locals.base}/account/addresses`))
  router.get('/accountinformation/contactpreferences', (req, res) => res.redirect(`${res.locals.base}/account/preferences`))
  router.get('/accountinformation/managecards', (req, res) => { if (gate(req, res)) info(req, res, 'Manage payments', `<p>You have no saved payment cards.</p><p>Card details are entered at the payment step of checkout and are not stored in this shop.</p><p><a href="${res.locals.base}/account">Back to My Account</a></p>`) })
  router.get('/accountinformation/changepassword', (req, res) => { if (gate(req, res)) info(req, res, 'Change password', `<p>Password changes are handled by the GAME sign-in service. Changing your password is not available in this shop.</p><p><a href="${res.locals.base}/account">Back to My Account</a></p>`) })

  // ---- footer information pages ----
  router.get('/blog', (req, res) => info(req, res, 'GAME Blog', `<p class="gu-intro">News, guides and opinion from the GAME team.</p><h2>Featured Blogs</h2><div class="gu-blog-grid">${BLOG_POSTS.map(([id, t, tag, s], i) => `<article class="gu-blog-card"><a class="gu-blog-art gu-tone-${i % 6}" href="${res.locals.base}/blog/${id}" aria-hidden="true" tabindex="-1">${esc(tag)}</a><span class="gu-fine">${esc(tag)}</span><h3><a href="${res.locals.base}/blog/${id}">${esc(t)}</a></h3><p>${esc(s)}</p></article>`).join('')}</div>`))
  router.get('/blog/:id', (req, res) => {
    const post = BLOG_POSTS.find(p => p[0] === req.params.id); if (!post) return info(req, res, 'Sorry – This Page Could Not Be Found', '<p>You may have entered an incorrect URL or the page you were after no longer exists.</p>', { status: 404 })
    info(req, res, post[1], `<p class="gu-fine">${esc(post[2])}</p><p>${esc(post[3])}</p><p>The full article is not reproduced in this shop.</p><p><a href="${res.locals.base}/blog">Back to the GAME Blog</a></p>`, { crumbs: [['GAME Blog', '/blog']] })
  })
  router.get('/affiliates', (req, res) => info(req, res, "GAME's Affiliate Program", `<h2>Why do customers shop at GAME?</h2><p>GAME is the UK's specialist retailer for games, consoles, accessories, toys and board games. Hardware comes with a 12-month guarantee.</p><h2>So, why should you join the GAME Affiliate Program?</h2><p>Affiliates earn commission on sales from visitors they refer, within a 30-day window after a click, when the programme conditions are met. Ready-made creatives are supplied for your site.</p><h2>Sound good? How do I sign up?</h2><p>Registration and tracking are managed by Partnerize. Affiliate sign-up is not available in this shop.</p>`, { pageTitle: 'Affiliates' }))
  router.get('/terms-and-conditions', (req, res) => info(req, res, 'Promotion terms', `<h2>Terms &amp; Conditions - Current Promotions</h2>${PROMO_TERMS.current.map(([h, t]) => `<details class="gu-acc" open><summary>${esc(h)}</summary><p>${esc(t)}</p></details>`).join('')}<h2>Terms &amp; Conditions - Past Promotions</h2>${PROMO_TERMS.past.map(h => `<details class="gu-acc"><summary>${esc(h)}</summary><p>This promotion has ended. Its terms are kept for reference.</p></details>`).join('')}`))
  router.get('/careers', (req, res) => info(req, res, 'Careers', `<p>GAME is part of Frasers Group. Store, warehouse and head-office vacancies for GAME are advertised on the Frasers Group careers site.</p><h2>Working at GAME</h2><p>Roles include store colleagues and managers, customer service, buying and e-commerce. Staff discount and training are offered across the group.</p><p>Job search and applications are not available in this shop.</p><p><a href="${res.locals.base}/stores">Find your local store</a></p>`))
  router.get('/cookie-preferences', (req, res) => info(req, res, 'Cookie preferences', `<p>Our website uses cookies and similar technologies to personalise the ads that are shown to you and to help you get the best experience on our site.</p><form method="post" action="${res.locals.base}/cookies" class="gu-cookie-form"><input type="hidden" name="back" value="/cookie-preferences"><p>Current choice: <b>${esc({ allow: 'Allow all', reject: 'Reject all', manage: 'Managed' }[req.store.cookieChoice] || 'Not set')}</b></p><button type="submit" name="choice" value="reject" class="gu-btn gu-btn-black">Reject all</button> <button type="submit" name="choice" value="allow" class="gu-btn">Allow all</button></form><p>This shop only uses a session cookie to keep your bag, account and checkout together.</p>`))
  router.get('/mobile-app', (req, res) => info(req, res, 'GAME Mobile App', `<p>Shop games, consoles and tech, track your orders and get notified about new releases with the GAME app.</p><h2>Download the app</h2><p class="gu-app-badges"><span class="gu-paylogo">App Store</span> <span class="gu-paylogo">Google Play</span></p><p>The GAME app is available on the Apple App Store and Google Play. App downloads are not available in this shop.</p>`))

  // ---- site map ----
  const landings = allLandings()
  const tree = (nodes, depth = 0) => `<ul class="gu-sitemap-list gu-depth-${depth}">${nodes.map(([l, p, kids = []]) => `<li><a href="${'BASE'}${p}">${esc(l)}</a>${kids.length ? tree(kids, depth + 1) : ''}</li>`).join('')}</ul>`
  const treeHtml = tree(CATEGORY_TREE)
  const extras = [['PlayStation', '/playstation'], ['Nintendo', '/nintendo'], ['Xbox Gaming', '/xbox/all-xbox'], ['Pokémon', '/pokemon'], ['Coming Soon', '/coming-soon'], ['Deals', '/deals']]
  const services = [['Store Finder', '/stores'], ['Help Home', '/help'], ['Contact Us', '/contact'], ['Delivery & Collection', '/help/categories/delivery'], ['Returns & Cancellations', '/help/categories/returns'], ['Track order', '/accountinformation/orderhistorysummary'], ['My account', '/accountinformation'], ['My Wish List', '/wishlist'], ['My Bag', '/cart']]
  const about = [['Frasers Plus', '/frasersplus'], ['Game Blog', '/blog'], ['Affiliates', '/affiliates'], ['Careers', '/careers'], ['Promotional terms', '/terms-and-conditions'], ['Cookie preferences', '/cookie-preferences'], ['GAME Mobile App', '/mobile-app']]
  const list = (base, links) => `<ul class="gu-sitemap-list">${links.map(([l, p]) => `<li><a href="${base}${p}">${esc(l)}</a></li>`).join('')}</ul>`
  router.get('/sitemap', (req, res) => {
    const base = res.locals.base
    info(req, res, 'Sitemap', `<div class="gu-sitemap"><section><h2>Shop by Department</h2>${list(base, [...DEPARTMENT_LINKS, ...extras])}</section><section class="gu-sitemap-cats"><h2>Categories</h2>${treeHtml.replaceAll('href="BASE', `href="${base}`)}</section><section><h2>Customer services</h2>${list(base, services)}<h2>Information</h2>${list(base, about)}</section></div>`)
  })
  router.get('/sitemap.xml', (req, res) => {
    const base = res.locals.base
    const paths = new Set(['/', ...DEPARTMENTS.map(d => '/' + d.id), ...landings.keys(), ...services.map(s => s[1]), ...about.map(s => s[1]), '/sitemap', '/searchresults', '/help/categories/legal', ...BLOG_POSTS.map(p => '/blog/' + p[0])])
    res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...paths].map(p => `  <url><loc>${esc(base + p)}</loc></url>`).join('\n')}\n</urlset>\n`)
  })
}

