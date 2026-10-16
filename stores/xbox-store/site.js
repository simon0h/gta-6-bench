// Xbox.com chrome and editorial pages (header mega-menu, footer, Games home, Game Pass sub-pages,
// devices, community, support, Microsoft Store policy pages, site map). Headings and CTA labels
// follow the xbox.com / microsoft.com pages captured on 2026-10-13 (see research/parity/xbox-store.json).
// Product grids only ever show the store's own catalog (PRODUCTS); where xbox.com would list titles or
// hardware the catalog does not carry, the page shows the real section with an empty state.
import { esc } from '../../lib/html.js'
import { getOrder } from '../../lib/orders.js'
import { MENU, FOOTER, LEGAL, ALL_MICROSOFT } from './site-data.js'
import { heroArt, cardArt, coverCollage, coverPicks, consolesSvg } from './hero-art.js'
import { CATALOG as PRODUCTS, productPath, isBuyable, COLLECTIONS } from './data.js'

// ---------- chrome ----------
export function megaNav(base) {
  return MENU.map(m => `<details class="xb-nav-menu xb-menu-host"><summary role="button" aria-expanded="false">${esc(m.label)} <span aria-hidden="true">⌄</span></summary><div class="xb-nav-panel xs-mega${m.groups.length > 2 ? ' xs-mega-wide' : ''}">${m.groups.map(g => `<div class="xs-mega-col"><p class="xs-mega-title">${esc(g.title)}</p>${g.links.map(([label, href]) => `<a href="${base}${href}">${esc(label)}</a>`).join('')}</div>`).join('')}</div></details>`).join('')
}

export function footerCols(base) {
  return `<div class="xb-footer-cols xs-footer-cols">${FOOTER.map(c => `<div><h4>${esc(c.title)}</h4>${c.links.map(([label, href]) => `<a href="${base}${href}">${esc(label)}</a>`).join('')}</div>`).join('')}</div>
  <div class="xs-footer-bar"><a class="xs-locale" href="${base}/en-US/locale"><span aria-hidden="true">🌐</span> English (United States)</a><nav class="xs-legal" aria-label="Legal">${LEGAL.map(([label, href]) => `<a href="${base}${href}">${esc(label)}</a>`).join('')}<span>&copy; Microsoft 2026</span></nav></div>`
}

// ---------- page building blocks ----------
const href = (base, p) => p.startsWith('/') ? base + p : p
const cta = (base, [label, path], cls = 'xs-btn') => `<a class="${cls}" href="${href(base, path)}">${esc(label)}</a>`
function hero(base, pg) {
  return `<section class="xs-hero xs-hero-${pg.tone || 'green'}"><div class="xs-hero-copy">${pg.eyebrow ? `<p class="xs-eyebrow">${esc(pg.eyebrow)}</p>` : ''}<h1>${esc(pg.h1)}</h1>${pg.intro ? `<p class="xs-lede">${esc(pg.intro)}</p>` : ''}${pg.ctas ? `<div class="xs-ctas">${pg.ctas.map((c, i) => cta(base, c, i ? 'xs-btn xs-btn-ghost' : 'xs-btn')).join('')}</div>` : ''}</div>${heroArt(pg) || '<div class="xs-hero-art" aria-hidden="true"><span></span><span></span><span></span></div>'}</section>`
}
function section(base, s, ctx) {
  const id = s.id ? ` id="${esc(s.id)}"` : ''
  let body = ''
  if (s.text) body += (Array.isArray(s.text) ? s.text : [s.text]).map(t => `<p>${esc(t)}</p>`).join('')
  if (s.cards) body += `<div class="xs-cards${s.cards.length === 2 ? ' xs-cards-2' : ''}">${s.cards.map(c => `<article class="xs-card"${c.id ? ` id="${esc(c.id)}"` : ''}>${cardArt(c)}<div class="xs-card-body">${c.tag ? `<p class="xs-tag">${esc(c.tag)}</p>` : ''}<h3>${esc(c.h)}</h3>${c.text ? `<p>${esc(c.text)}</p>` : ''}${c.cta ? cta(base, c.cta, 'xs-link') : ''}</div></article>`).join('')}</div>`
  if (s.list) body += `<ul class="xs-list">${s.list.map(i => `<li>${esc(i)}</li>`).join('')}</ul>`
  if (s.table) body += `<div class="xs-table-wrap"><table class="xs-table"><thead><tr>${s.table[0].map(h => `<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>${s.table.slice(1).map(r => `<tr>${r.map((c, i) => i ? `<td>${esc(c)}</td>` : `<th scope="row">${esc(c)}</th>`).join('')}</tr>`).join('')}</tbody></table></div>`
  if (s.faq) body += `<div class="xs-faq">${s.faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>`
  if (s.products) body += productRow(base, s.products, ctx)
  if (s.html) body += s.html(base, ctx)
  if (s.ctas) body += `<div class="xs-ctas">${s.ctas.map(c => cta(base, c)).join('')}</div>`
  return `<section class="xs-section${s.band ? ' xs-band' : ''}"${id}>${s.h ? `<h2>${esc(s.h)}</h2>` : ''}${s.sub ? `<p class="xs-sub">${esc(s.sub)}</p>` : ''}${body}</section>`
}
// Product rows: titles the store's catalog carries, most popular first (one row of up to `limit` tiles);
// otherwise a styled empty state.
const popularityOf = p => p.popularity ?? ({ '9p3h4968grsm': 17000, '9nnzsnhlr63l': 9000 })[p.id] ?? 0
function productRow(base, { filter, empty, more, limit = 10, sort }, ctx) {
  const list = PRODUCTS.filter(filter).sort(sort || ((a, b) => popularityOf(b) - popularityOf(a)))
  if (!list.length) return `<div class="xs-empty"><p class="xs-empty-title">${esc(empty || 'No games found.')}</p><p>Check back soon for more.</p>${more ? cta(base, more, 'xs-link') : ''}</div>`
  return `<div class="xb-grid xs-row">${list.slice(0, limit).map(p => ctx.tile(base, p)).join('')}</div>${more ? cta(base, more, 'xs-link xs-more') : ''}`
}
const countLabel = (label, filter) => `${label} (${PRODUCTS.filter(filter).length})`
const isAccessory = p => p.type === 'hardware' && p.catalogType !== 'console'
const ACCESSORY_CHIPS = [['Controllers', 'controllers'], ['XBOX Design Lab', 'design-lab'], ['Mobile gaming accessories', 'mobile'], ['Handheld gaming accessories', 'handheld'], ['Stands and charging solutions', 'charging'], ['Headsets & communication', 'headsets'], ['Storage', 'storage'], ['Console wraps', 'wraps'], ['Wheels & joysticks', 'wheels'], ['Assistive technologies', 'assistive']]
const inCategory = (...names) => p => p.type === 'hardware' && names.includes(p.category)
const shopCategory = name => ['SHOP ' + name.toUpperCase(), `/en-US/store/b/xbox-accessories?category=${encodeURIComponent(name)}`]
export function infoPage(base, pg, ctx) {
  return `<div class="xs-page">${pg.crumbs ? `<nav class="xs-crumbs" aria-label="Breadcrumb">${pg.crumbs.map(([l, p]) => `<a href="${base}${p}">${esc(l)}</a>`).join('<span aria-hidden="true">›</span>')}</nav>` : ''}${hero(base, pg)}${(pg.sections || []).map(s => section(base, s, ctx)).join('')}</div>`
}

// ---------- shared content ----------
const card = (h, text, ctaLabel, path, extra = {}) => ({ h, text, cta: ctaLabel ? [ctaLabel, path] : null, ...extra })
const GTA = p => p.family === 'gta-vi' || /grand theft auto vi/i.test(p.title)
const isGame = p => p.type === 'game'
const buyableGames = p => isGame(p) && isBuyable(p)
const PLANS = { h: 'Choose the plan that’s right for you', id: 'plans', cards: [
  card('Essential', 'Online multiplayer, a library of 50+ games and Rewards with Game Pass on console, PC and supported cloud devices.', 'SELECT', '/account/services/join'),
  card('Premium', 'Everything in Essential plus a library of 200+ games on console, PC and cloud, with Xbox-published games within a year of launch.', 'SELECT', '/account/services/join'),
  card('Ultimate', 'Day one games, EA Play, Ubisoft+ Classics, Fortnite Crew and the best of Xbox Cloud Gaming on all your devices.', 'SELECT', '/account/services/join', { tag: 'BEST VALUE' }),
  card('PC only', 'PC Game Pass: day one games and hundreds of high-quality PC games, plus EA Play on PC.', 'SELECT', '/account/services/join'),
], ctas: [['COMPARE ALL FEATURES', '/en-US/xbox-game-pass#plans']] }
const GP_FAQ = { h: 'Frequently asked questions', faq: [
  ['What is XBOX Game Pass?', 'Xbox Game Pass is a subscription that gives you access to a library of games you can play on console, PC and supported cloud devices, plus member benefits and discounts.'],
  ['Is XBOX Game Pass available in my market?', 'Game Pass is available in many countries and regions; plan availability, features and cloud gaming vary by region.'],
  ['Where do I find XBOX Game Pass games?', 'Browse included games on the Game Pass games page or in the Xbox app on console and PC.'],
  ['How long do I have access to games in the XBOX Game Pass library?', 'Games are available while they are in the library and your membership is active. Titles leave the library over time; you can buy them at a member discount.'],
  ['How do I cancel XBOX Game Pass?', 'Sign in to your Microsoft account, open Services & subscriptions, and choose Manage, then Cancel subscription.'],
  ['How do I stop recurring billing?', 'Turn off recurring billing in Services & subscriptions. You keep access until the end of the period you paid for.'],
] }
const WAYS = { h: 'Discover more ways to play', cards: [
  card('XBOX consoles', 'Play thousands of games on Xbox Series X|S.', 'EXPLORE CONSOLES', '/en-US/consoles'),
  card('XBOX on PC', 'Discover, download and play with the Xbox PC app.', 'EXPLORE XBOX ON PC', '/en-US/xbox-on-pc'),
  card('XBOX on handhelds', 'Take your games with you on Windows handhelds.', 'EXPLORE XBOX ON HANDHELDS', '/en-US/xbox-on-handhelds'),
  card('XBOX on TVs', 'Stream games on supported smart TVs and streaming sticks.', 'EXPLORE XBOX ON TVS', '/en-US/xbox-on-tvs'),
] }
const STORE_WHY = { h: 'Why buy from Microsoft Store', band: true, cards: [
  card('Trade in. Gift more.', 'Trade in eligible devices for cash toward your next purchase.', 'Learn more', '/en-US/store/b/gift-cards'),
  card('Sleigh now, pay later', 'Pay over time options may be available for qualified customers at checkout.', 'Learn more', '/en-US/support/microsoft-store'),
  card('Free returns through January 31, 2027', 'Eligible physical products bought during the holiday period can be returned for free.', 'Learn about returns', '/en-US/returns'),
  card('Fast, free delivery', 'Free expedited shipping on eligible physical orders in the US.', 'Learn about shipping', '/en-US/shipping'),
] }
const supportTopic = (h1, intro, articles) => ({ eyebrow: 'XBOX SUPPORT', h1, intro, tone: 'light', crumbs: [['Support home', '/en-US/support']], ctas: [['Contact us', '/en-US/contactus']], sections: [
  { h: 'Popular articles', cards: articles.map(([h, t, path]) => card(h, t, 'Read article', path || '/en-US/support')) },
  { h: 'Still need help?', text: 'Sign in to see support options for your account, check service status, or contact Xbox Support.', ctas: [['XBOX status', '/en-US/support/xbox-live-status'], ['Contact support', '/en-US/support/contact']] },
] })
const simple = (eyebrow, h1, intro, sections, extra = {}) => ({ eyebrow, h1, intro, sections, ...extra })

// ---------- pages ----------
export const PAGES = {
  '/en-US/games': {
    h1: 'XBOX games', eyebrow: 'GAMES', intro: 'Explore new releases, best sellers and the games coming to Xbox Game Pass.', ctas: [['Join Game Pass', '/en-US/xbox-game-pass'], ['Browse Games', '/en-US/xbox-game-pass/games']],
    sections: [
      { h: 'New releases', products: { filter: p => isGame(p) && p.ribbon !== 'PRE-ORDER' && isBuyable(p) && (COLLECTIONS.find(c => c.id === 'new-releases')?.test(p) ?? true), sort: (a, b) => new Date(b.release || 0) - new Date(a.release || 0), empty: 'No new releases are available right now.', more: ['EXPLORE MORE', '/en-US/games/all-games/console'] } },
      { h: 'Best sellers', sub: 'Pre-orders available now', products: { filter: buyableGames, empty: 'No best sellers are available right now.', more: ['EXPLORE MORE', '/en-US/games/all-games/console'] } },
      { h: 'XBOX GAME PASS', band: true, text: 'Play hundreds of high-quality games on console, PC and cloud with Xbox Game Pass.', ctas: [['EXPLORE XBOX GAME PASS', '/en-US/xbox-game-pass']] },
      { h: 'Recently added to XBOX Game Pass', products: { filter: p => isGame(p) && (p.subscriptions || []).length > 0, empty: 'No Game Pass titles are available right now.', more: ['EXPLORE MORE', '/en-US/xbox-game-pass/games'] } },
      { h: 'Buy once, play anywhere', text: 'Xbox Play Anywhere games are yours to play on Xbox consoles and Windows PCs with one purchase, with progress that goes with you.', ctas: [['EXPLORE XBOX PLAY ANYWHERE', '/en-US/games/xbox-play-anywhere']] },
      { h: 'Browse by genre', html: base => `<nav class="xs-chips" aria-label="Genres">${[['Action and adventure', 'Action & adventure'], ['Platformer', 'Platformer'], ['Family and kids', 'Family & kids'], ['Racing and flying', 'Racing & flying'], ['Role-playing', 'Role playing'], ['Shooter', 'Shooter'], ['Sports', 'Sports'], ['Strategy', 'Strategy']].map(([l, v]) => `<a href="${base}/en-US/games/genre/${encodeURIComponent(v)}">${esc(l)}</a>`).join('')}</nav>` },
      { h: 'Enjoy more ways to play with XBOX', cards: [
        card('Cloud gaming', 'Stream hundreds of games on the devices you already have.', 'EXPLORE', '/en-US/cloud-gaming'),
        card('Handheld compatibility', 'Find games that play great on Windows gaming handhelds.', 'EXPLORE', '/en-US/handhelds/handheld-compatibility'),
        card('Backward compatible', 'Play thousands of Xbox One, Xbox 360 and original Xbox games.', 'EXPLORE', '/en-US/games/backward-compatibility'),
        card('Optimized for XBOX Series X|S consoles', 'Faster load times, higher framerates and stunning visuals.', 'EXPLORE', '/en-US/games/optimized'),
      ] },
      { h: 'Everything you need to play', text: 'Controllers, headsets and storage designed for Xbox.', ctas: [['EXPLORE GAME PASS', '/en-US/xbox-game-pass'], ['SHOP CONTROLLERS', '/en-US/accessories#controllers']] },
      { h: 'XBOX Family Settings', band: true, text: 'Manage screen time, content filters and spending for your family from your phone.', ctas: [['EXPLORE FAMILY SETTINGS', '/en-US/apps/family-settings-app']] },
      { h: 'WAYS TO PLAY WITH XBOX', cards: [
        card('XBOX CONSOLES', '', 'EXPLORE', '/en-US/consoles'), card('XBOX ON PC', '', 'EXPLORE', '/en-US/xbox-on-pc'), card('XBOX ON HANDHELDS', '', 'EXPLORE', '/en-US/xbox-on-handhelds'),
        card('XBOX ON MOBILE', '', 'EXPLORE', '/en-US/xbox-on-mobile'), card('XBOX ON VR HEADSETS', '', 'EXPLORE', '/en-US/xbox-on-vr-headsets'), card('XBOX ON TV', '', 'EXPLORE', '/en-US/xbox-on-tvs'),
      ], ctas: [['EXPLORE ALL DEVICES', '/en-US/devices']] },
    ],
  },
  '/en-US/xbox-game-pass/games': {
    h1: 'XBOX GAME PASS GAMES', eyebrow: 'XBOX GAME PASS', intro: 'Discover hundreds of games to play on console, PC and cloud.', ctas: [['JOIN GAME PASS', '/en-US/xbox-game-pass'], ['UPGRADE TO ULTIMATE', '/en-US/xbox-game-pass#plans']], crumbs: [['Game Pass', '/en-US/xbox-game-pass']],
    sections: [
      { h: 'XBOX Game Pass benefits', cards: [
        card('Day one games', 'Play new Xbox games the day they launch with Ultimate.', 'EXPLORE GAMES', '/en-US/xbox-game-pass/games#games'),
        card('EA Play', 'Top EA franchises and trials of new releases.', 'EXPLORE EA PLAY', '/en-US/xbox-game-pass'),
        card('Cloud gaming', 'Stream games to your phone, tablet, TV or browser.', 'EXPLORE CLOUD GAMING', '/en-US/cloud-gaming'),
        card('Deals and discounts', 'Members save on select games and add-ons.', 'EXPLORE DEALS', '/en-US/xbox-game-pass/deals'),
      ] },
      { get h() { return countLabel('Games', p => p.type === 'game' && (p.subscriptions || []).length > 0) }, id: 'games', sub: 'Console Games · PC Games — Sort by: Recently added', html: (base, ctx) => `<form class="xs-filterbar" method="get" action="${base}/en-US/games/collection/game-pass"><label for="gp-q">Search game title</label><input id="gp-q" name="q" type="search"><label for="gp-sort">Sort by</label><select id="gp-sort" name="sort"><option value="release">Recently added</option><option value="name">Title (A-Z)</option><option value="name-desc">Title (Z-A)</option></select><button class="xs-btn" type="submit">SHOW RESULTS</button></form>${productRow(base, { filter: p => p.type === 'game' && (p.subscriptions || []).length > 0, limit: 15, empty: 'No games found.', more: ['SEE ALL GAME PASS GAMES', '/en-US/games/collection/game-pass'] }, ctx)}<p class="xs-sub">Grand Theft Auto VI is not included with Game Pass and is sold separately.</p>` },
      { h: 'Access XBOX Game Pass on your devices', cards: [card('XBOX on PC', 'Get the Xbox PC app.', 'GET THE APP', '/en-US/xbox-on-pc'), card('XBOX on mobile', 'Get the Xbox mobile app.', 'DOWNLOAD THE APP', '/en-US/xbox-on-mobile'), card('XBOX Cloud Gaming', 'Play in your browser.', 'EXPLORE CLOUD GAMING', '/en-US/cloud-gaming')] },
    ],
  },
  '/en-US/xbox-game-pass/deals': {
    h1: 'Deals with Game Pass', eyebrow: 'XBOX GAME PASS', intro: 'Game Pass members save on select games, add-ons and DLC in the Microsoft Store.', ctas: [['JOIN GAME PASS', '/en-US/xbox-game-pass']], crumbs: [['Game Pass', '/en-US/xbox-game-pass']],
    sections: [
      { h: 'Member deals', products: { filter: p => p.listPrice && p.listPrice > p.price, empty: 'No member deals are available right now.', more: ['SEE ALL DEALS', '/en-US/promotions/sales/sales-and-specials'] } },
      { h: 'How member discounts work', list: ['Discounts apply to eligible games and add-ons while your membership is active.', 'Prices shown at checkout include the member discount for your signed-in account.', 'Some discounts are only available with Ultimate or Premium.'] },
      GP_FAQ,
    ],
  },
  '/en-US/cloud-gaming': {
    h1: 'XBOX CLOUD GAMING', eyebrow: 'XBOX GAME PASS', intro: 'Stream XBOX games on your favorite devices', ctas: [['JOIN GAME PASS', '/en-US/xbox-game-pass'], ['DEVICES SUPPORTED', '/en-US/devices']],
    sections: [
      { h: 'Stream XBOX games on your favorite devices', text: 'Play hundreds of games on the devices you already have, including phones, tablets, TVs, PCs and VR headsets.', ctas: [['WAYS TO PLAY', '/en-US/devices']] },
      { h: 'STREAM THE GAMES YOU LOVE', text: 'Stream select games you own, as well as games in the Game Pass library.', ctas: [['STREAM YOUR OWN GAMES', '/en-US/play'], ['EXPLORE GAMES', '/en-US/xbox-game-pass/games']] },
      { ...WAYS },
      { h: 'Get started', cards: [card('XBOX Game Pass subscription', 'Cloud gaming is included with Essential, Premium and Ultimate.', 'JOIN GAME PASS', '/en-US/xbox-game-pass'), card('Compatible device', 'Phone, tablet, PC, TV or browser.', 'DEVICES SUPPORTED', '/en-US/devices'), card('Compatible controller', 'Use an Xbox Wireless Controller or touch controls.', 'CONTROLLER READINESS', '/en-US/accessories#controllers'), card('High-speed internet connection', 'A 5 GHz Wi-Fi or mobile data connection of at least 20 Mbps.', 'LEARN MORE', '/en-US/support/help/hardware-network/browse')] },
      { ...PLANS, cards: PLANS.cards.slice(0, 3) },
      { h: 'Frequently asked questions', faq: [['What do I need to play?', 'A Game Pass membership that includes cloud gaming, a supported device, a compatible controller and a fast internet connection.'], ['Can I stream games I own?', 'Yes, select games you own can be streamed with eligible Game Pass plans.']], ctas: [['XBOX GAME PASS FAQ', '/en-US/xbox-game-pass#faq'], ['XBOX CLOUD GAMING FAQ', '/en-US/support/help/games-apps/browse']] },
    ],
  },
  '/en-US/play': {
    h1: 'Play on Xbox.com', eyebrow: 'XBOX CLOUD GAMING', intro: 'Jump into games instantly in your browser with Xbox Cloud Gaming. Sign in with your Microsoft account to see your library and Game Pass games.', ctas: [['JOIN GAME PASS', '/en-US/xbox-game-pass'], ['EXPLORE CLOUD GAMING', '/en-US/cloud-gaming']],
    sections: [
      { h: 'Your library', html: base => `<div class="xs-empty"><p class="xs-empty-title">Sign in to see your games</p><p>Your purchases appear in My library.</p><a class="xs-link" href="${base}/account/library">My library</a></div>` },
      { h: 'Cloud games', products: { filter: p => (p.platforms || []).includes('Cloud'), empty: 'No cloud-playable games are available right now.', more: ['Shop all console games', '/en-US/games/all-games/console'] } },
    ],
  },
  '/en-US/games/xbox-play-anywhere': simple('GAMES', 'XBOX PLAY ANYWHERE', 'Buy once, play anywhere: play your digital games on Xbox consoles and Windows PCs, with saves, add-ons and achievements that go with you.', [
    { h: 'What is XBOX Play Anywhere?', cards: [card('Buy once, play anywhere', 'One purchase of a Play Anywhere game lets you play it on Xbox console and Windows PC.'), card('Progress goes with you', 'Your saves, add-ons and achievements move with you between devices.')] },
    { h: '1,000 games and growing', products: { filter: p => (p.capabilities || []).includes('Xbox Play Anywhere'), empty: 'No Xbox Play Anywhere titles are available right now.', more: ['BROWSE ALL GAMES', '/en-US/games/all-games/console'] } },
    { h: 'Ready to play?', cards: [card('Play on XBOX Series X|S', '', 'EXPLORE CONSOLES', '/en-US/consoles'), card('Play on PC', '', 'DOWNLOAD THE APP', '/en-US/xbox-on-pc'), card('Play on gaming handhelds', '', 'LEARN MORE', '/en-US/xbox-on-handhelds')] },
    { h: 'Enjoy more ways to play with Game Pass', ctas: [['EXPLORE GAME PASS', '/en-US/xbox-game-pass']] },
  ], { ctas: [['BROWSE ALL GAMES', '/en-US/games/all-games/console']] }),
  '/en-US/games/free-to-play': simple('GAMES', 'FREE-TO-PLAY GAMES ON XBOX', 'Jump in for free. Online multiplayer is not required to play free-to-play games on Xbox consoles.', [
    { h: 'Most-played free games', products: { filter: p => p.price === 0, empty: 'No free-to-play games are available right now.', more: ['LEARN MORE', '/en-US/games/all-games/console'] } },
    { h: 'Explore more free-to-play genres on XBOX', html: base => `<nav class="xs-chips" aria-label="Free-to-play genres">${['ACTION ADVENTURE GAMES', 'FIGHTING GAMES', 'STRATEGY GAMES', 'KIDS & FAMILY GAMES', 'RACING & FLYING', 'ROLE PLAYING GAMES', 'SHOOTER GAMES', 'SPORTS GAMES'].map(l => `<a href="${base}/en-US/games/genres">${esc(l)}</a>`).join('')}</nav>` },
    { h: 'In-game benefits', text: 'Game Pass Ultimate members get in-game content and perks in popular free-to-play games.', ctas: [['JOIN GAME PASS', '/en-US/xbox-game-pass']] },
    { h: 'POWER YOUR DREAMS', ctas: [['EXPLORE CONSOLES', '/en-US/consoles']] },
  ]),
  '/en-US/games/optimized': simple('GAMES', 'OPTIMIZED FOR XBOX SERIES X|S', 'Games built to take advantage of the speed and power of Xbox Series X|S.', [
    { h: 'Featured games Optimized for XBOX Series X|S', products: { filter: p => isGame(p) && (p.capabilities || []).some(c => /Optimized/.test(c)), empty: 'No optimized games are available right now.', more: ['BROWSE OPTIMIZED GAMES', '/en-US/games/all-games/console'] } },
    { h: 'Amazing visual fidelity', text: 'Up to 4K resolution, HDR and ray tracing on Xbox Series X.' },
    { h: 'Next-gen framerates', text: 'Up to 120 frames per second in supported games.' },
    { h: 'Faster load times', text: 'The custom SSD gets you into your games faster, and Quick Resume lets you switch between games.' },
    { h: 'XBOX Smart Delivery', text: 'Buy a supported game once and always get the best version for your console.' },
  ], { ctas: [['BROWSE OPTIMIZED GAMES', '/en-US/games/all-games/console']] }),
  '/en-US/handhelds/handheld-compatibility': simple('GAMES', 'Optimized for handhelds', 'Find games that are verified to play well on Windows gaming handhelds, with controller support, readable text and handheld-friendly settings.', [
    { h: 'Handheld compatible games', products: { filter: p => ['Optimized', 'Compatible'].includes(p.handheld), empty: 'No handheld-verified games are available right now.', more: ['Shop all PC games', '/en-US/games/all-games/pc'] } },
    { h: 'What the labels mean', list: ['Optimized for handhelds: plays great with default settings on a handheld.', 'Playable: may need minor adjustments, such as text size or an on-screen keyboard.', 'Unsupported: not recommended on handhelds.'] },
  ], { ctas: [['XBOX on handhelds', '/en-US/xbox-on-handhelds']] }),
  '/en-US/games/backward-compatibility': simple('GAMES', 'XBOX Backward Compatible Games Library', 'Play thousands of Xbox One, Xbox 360 and original Xbox games on Xbox Series X|S.', [
    { h: 'Collections', html: base => `<form class="xs-filterbar" method="get" action="${base}/en-US/games/backward-compatibility"><label for="bc-q">Search</label><input id="bc-q" type="search" name="q"><button class="xs-btn" type="submit">Search</button><a class="xs-link" href="${base}/en-US/games/backward-compatibility">CLEAR FILTERS</a></form><div class="xs-empty"><p class="xs-empty-title">No games found.</p><p>Try a different search or clear your filters.</p></div>` },
    { h: 'Thousands of your favorite games get better with XBOX Series X|S', cards: [card('Delivering on our promise', 'Your library comes with you to the next generation.'), card('FPS Boost', 'Up to double the original framerate in select games.'), card('Improved resolution', 'Sharper visuals with no work from developers.'), card('Auto HDR', 'Richer color and brightness in games originally made without HDR.')] },
    { h: 'Top frequently asked questions', faq: [['Do I need the original disc?', 'Disc-based games need the disc in the drive; digital games appear in your library.'], ['Do my saves carry over?', 'Saves stored in the cloud sync automatically to your new console.']], ctas: [['JOIN NOW', '/en-US/xbox-game-pass'], ['EXPLORE CONSOLES', '/en-US/consoles']] },
  ], { ctas: [['BUY GIFT CARD', '/en-US/store/b/gift-cards'], ['REDEEM CODE', '/en-US/redeem']] }),
  '/en-US/promotions/sales/sales-and-specials': {
    h1: 'XBOX Sales & Specials', eyebrow: 'DEALS', intro: 'Find the latest deals on digital games, controllers and accessories.', ctas: [['SEE ALL DEALS', '/en-US/games/all-games/console']],
    sections: [
      { h: 'This week’s digital game deals', products: { filter: p => p.type !== 'hardware' && p.listPrice && p.listPrice > p.price, limit: 15, empty: 'No digital game deals are available right now.', more: ['SHOP MORE', '/en-US/games/collection/deals'] } },
      { h: 'Controllers & accessories on sale', products: { filter: p => p.type === 'hardware' && p.listPrice && p.listPrice > p.price, empty: 'No controllers or accessories are on sale right now.', more: ['SHOP MORE', '/en-US/store/b/xbox-accessories?price=sale'] } },
      { h: 'Deals with Game Pass', band: true, text: 'Members save on select games and add-ons.', ctas: [['JOIN GAME PASS', '/en-US/xbox-game-pass'], ['Deals with Game Pass', '/en-US/xbox-game-pass/deals']] },
      { h: 'Receive an XBOX gift card? Redeem your code to apply on digital games.', ctas: [['REDEEM CODE', '/en-US/redeem']] },
    ],
  },
  '/en-US/devices': simple('DEVICES', 'PLAY XBOX ACROSS DEVICES', 'Play on consoles, PCs, handhelds, phones, TVs and VR headsets.', [
    { h: 'Ways to play', cards: [
      card('XBOX consoles', 'Xbox Series X and Xbox Series S.', 'EXPLORE', '/en-US/consoles'), card('XBOX on PC', 'The Xbox PC app and PC Game Pass.', 'EXPLORE', '/en-US/xbox-on-pc'), card('XBOX on handhelds', 'Windows gaming handhelds.', 'EXPLORE', '/en-US/xbox-on-handhelds'),
      card('XBOX on mobile', 'The Xbox app and cloud gaming on phones and tablets.', 'EXPLORE', '/en-US/xbox-on-mobile'), card('XBOX on TVs', 'Stream with no console on supported TVs.', 'EXPLORE', '/en-US/xbox-on-tvs'), card('XBOX on VR headsets', 'Play on a giant virtual screen.', 'EXPLORE', '/en-US/xbox-on-vr-headsets'),
      card('Play on Xbox.com', 'Play in your web browser.', 'EXPLORE', '/en-US/play'),
    ] },
    { h: 'JUMP IN', ctas: [['XBOX GAME PASS', '/en-US/xbox-game-pass'], ['GAMES', '/en-US/games'], ['ACCESSORIES', '/en-US/accessories']] },
  ]),
  '/en-US/consoles': {
    h1: 'XBOX CONSOLES', eyebrow: 'DEVICES', tone: 'dark', intro: 'Play thousands of games on the fastest, most powerful Xbox consoles.', ctas: [['SHOP CONSOLES', '/en-US/consoles/all-consoles']],
    sections: [
      { h: 'XBOX SERIES X and XBOX SERIES S', cards: [card('XBOX SERIES X', 'The fastest, most powerful Xbox ever. True 4K gaming with up to 120 FPS.', 'LEARN MORE', '/en-US/consoles/xbox-series-x'), card('XBOX SERIES S', 'Next-gen performance in the smallest Xbox ever. All-digital.', 'LEARN MORE', '/en-US/consoles/xbox-series-s')] },
      { h: 'Which console is right for you?', ctas: [['COMPARE CONSOLES', '/en-US/consoles/compare'], ['Help me choose a console', '/en-US/consoles/help-me-choose']] },
      { h: 'WELCOME TO XBOX SERIES X|S', cards: [card('Play more, wait less', 'Quick Resume lets you switch between multiple games and pick up where you left off.')] },
      { h: 'THOUSANDS OF GAMES READY TO PLAY', ctas: [['BROWSE GAMES', '/en-US/games'], ['EXPLORE GAME PASS', '/en-US/xbox-game-pass']] },
      { h: 'GET THE MOST OUT OF YOUR XBOX', cards: [
        card('Meet the XBOX dashboard', 'Your games, friends and apps in one place.', 'LEARN MORE', '/en-US/support/help/games-apps/browse'),
        card('Grow your digital games library', 'Buy games digitally and play them on any of your Xbox consoles.', 'BROWSE GAMES', '/en-US/games'),
        card('Gear up for action', 'Controllers, headsets and storage designed for Xbox.', 'SHOP ACCESSORIES', '/en-US/accessories'),
        card('Playtime peace of mind', 'Family settings for screen time, content and spending.', 'LEARN MORE', '/en-US/family-hub'),
        card('Jump in with cloud gaming', 'Stream games to your phone, tablet or TV.', 'LEARN MORE', '/en-US/cloud-gaming'),
        card('Make it a party', 'Play with friends across console, PC and mobile.', 'LEARN MORE', '/en-US/community'),
      ] },
      { h: 'Need help with your XBOX console?', ctas: [['VISIT SUPPORT', '/en-US/support/help/hardware-network/browse']] },
      { h: 'Play your way', ctas: [['EXPLORE WAYS TO PLAY', '/en-US/devices'], ['EXPLORE ALL DEVICES', '/en-US/devices']] },
    ],
  },
  '/en-US/consoles/xbox-series-x': simple('CONSOLES', 'XBOX SERIES X', 'The fastest, most powerful Xbox ever. Explore rich new worlds with 12 teraflops of processing power and true 4K gaming.', [
    { h: 'MORE PLAYING, LESS WAITING', cards: [card('QUICK RESUME', 'Continue multiple games from a suspended state.'), card('FASTER LOAD TIMES', 'A custom 1TB SSD gets you into games faster.'), card('FASTER FRAMERATE', 'Up to 120 FPS in supported games.')] },
    { h: 'TRUE 4K GAMING', text: 'Play games at up to 4K resolution and 60 FPS, with HDR and DirectX ray tracing.' },
    { h: 'LOOKS BETTER, SOUNDS BETTER, PLAYS BETTER', cards: [card('Optimized gaming experience', '', 'EXPLORE GAMES', '/en-US/games/optimized'), card('Amazing visual fidelity', ''), card('Get it once', 'Smart Delivery gives you the best version of supported games.')] },
    { h: 'Buy XBOX Series X', products: { filter: p => p.group === 'series-x', sort: (a, b) => a.price - b.price, empty: 'Consoles (0)', more: ['SHOP ALL CONSOLES', '/en-US/consoles/all-consoles'] } },
  ], { tone: 'dark', crumbs: [['Consoles', '/en-US/consoles']], ctas: [['COMPARE CONSOLES', '/en-US/consoles/compare']] }),
  '/en-US/consoles/xbox-series-s': simple('CONSOLES', 'XBOX SERIES S', 'Next-gen performance in the smallest Xbox ever. Go all-digital with Xbox Series S.', [
    { h: 'VARIETY MEETS VALUE', cards: [card('QUICK RESUME', 'Continue multiple games from a suspended state.'), card('FASTER LOAD TIMES', 'A custom SSD gets you into games faster.'), card('FASTER FRAMERATE', 'Up to 120 FPS in supported games.')] },
    { h: 'ALL DIGITAL, ALL XBOX', text: 'Xbox Series S has no disc drive; build your digital library and play Game Pass games.' },
    { h: 'BACKWARD COMPATIBLE WITH THOUSANDS OF GAMES', ctas: [['Backward compatible games', '/en-US/games/backward-compatibility']] },
    { h: 'Buy XBOX Series S', products: { filter: p => p.group === 'series-s', sort: (a, b) => a.price - b.price, empty: 'Consoles (0)', more: ['SHOP ALL CONSOLES', '/en-US/consoles/all-consoles'] } },
    { h: 'TECH SPECS', table: [['Spec', 'XBOX SERIES S'], ['Processor', '4 TFLOPS, 20 CUs @1.565 GHz'], ['Storage', '512GB or 1TB custom NVMe SSD'], ['Performance target', '1440p at 60 FPS, up to 120 FPS'], ['Optical drive', 'Digital only']] },
  ], { tone: 'dark', crumbs: [['Consoles', '/en-US/consoles']], ctas: [['COMPARE CONSOLES', '/en-US/consoles/compare']] }),
  '/en-US/consoles/all-consoles': simple('CONSOLES', 'Shop all consoles', 'Xbox Series X, Xbox Series S and special editions.', [
    { get h() { return countLabel('Consoles', p => p.type === 'hardware' && (p.catalogType === 'console' || /console|series [xs]/i.test(p.title))) }, products: { filter: p => p.type === 'hardware' && (p.catalogType === 'console' || /console|series [xs]/i.test(p.title)), sort: (a, b) => b.price - a.price, empty: 'Consoles (0)', more: ['Where to buy', '/en-US/where-to-buy'] } },
    { h: 'Storage for your console', products: { filter: inCategory('Storage'), more: shopCategory('Storage') } },
  ], { crumbs: [['Consoles', '/en-US/consoles']], ctas: [['COMPARE CONSOLES', '/en-US/consoles/compare']] }),
  '/en-US/consoles/compare': simple('CONSOLES', 'COMPARE XBOX CONSOLES', 'See how Xbox Series X and Xbox Series S compare.', [
    { h: 'Specifications', table: [['', 'XBOX SERIES X', 'XBOX SERIES S'], ['COLOR', 'Carbon Black', 'Robot White / Carbon Black'], ['STORAGE & EXPANDABILITY', '1TB or 2TB Custom SSD', '512GB or 1TB Custom SSD'], ['PROCESSOR', '12 Teraflops processing power', '4 Teraflops processing power'], ['GAMING RESOLUTION', 'True 4K', '1440p'], ['OPTICAL DISC DRIVE', '4K UHD Blu-ray (disc models)', 'Digital only'], ['VIDEO', 'HDMI 2.1, Dolby Vision', 'HDMI 2.1, Dolby Vision'], ['XBOX SERIES X|S FEATURES', 'Quick Resume, Variable Refresh Rate, Auto Low-Latency Mode', 'Quick Resume, Variable Refresh Rate, Auto Low-Latency Mode']] },
    { h: 'STILL UNSURE WHICH CONSOLE IS THE RIGHT ONE?', ctas: [['HELP ME CHOOSE', '/en-US/consoles/help-me-choose']] },
  ], { crumbs: [['Consoles', '/en-US/consoles']] }),
  '/en-US/consoles/help-me-choose': simple('CONSOLES', 'Help me choose a console', 'Answer a few questions about how you play to find the Xbox that suits you.', [
    { h: 'How do you like to play?', cards: [card('I want the best performance', 'True 4K gaming and a disc drive option.', 'XBOX SERIES X', '/en-US/consoles/xbox-series-x'), card('I want great value', 'All-digital next-gen gaming in a compact console.', 'XBOX SERIES S', '/en-US/consoles/xbox-series-s')] },
    { h: 'Compare side by side', ctas: [['COMPARE CONSOLES', '/en-US/consoles/compare']] },
  ], { crumbs: [['Consoles', '/en-US/consoles']] }),
  '/en-US/where-to-buy': simple('DEVICES', 'FIND AVAILABLE XBOX RETAILERS', 'Find Xbox consoles and accessories at participating retailers.', [
    { h: 'Buy direct from Microsoft', text: 'Microsoft Store sells Xbox consoles and accessories online with free shipping on eligible orders.' },
    { h: 'Participating retailers', id: 'accessories', list: ['Microsoft Store', 'Amazon', 'Walmart', 'Best Buy', 'GameStop', 'Target', 'Verizon'], text: 'Retailer stock and prices vary. Microsoft Store ships consoles and accessories directly.' },
    { h: '0% APR with Amazon monthly payments', text: 'Eligible customers may be offered monthly payments at checkout with the retailer. Terms apply.' },
  ]),
  '/en-US/accessories': {
    h1: 'Accessories', eyebrow: 'DEVICES', intro: 'Controllers, headsets, storage and more for Xbox consoles, PC and mobile.', ctas: [['Design your controller', '/en-US/xbox-design-lab'], ['Where to buy', '/en-US/where-to-buy#accessories']],
    sections: [
      { get h() { return countLabel('Accessories', isAccessory) }, html: (base, ctx) => `<nav class="xs-chips" aria-label="Accessory categories">${ACCESSORY_CHIPS.map(([l, id]) => `<a href="${base}/en-US/accessories#${id}">${esc(l)}</a>`).join('')}</nav>${PRODUCTS.some(isAccessory) ? productRow(base, { filter: isAccessory, limit: 10, more: ['SHOP ALL ACCESSORIES', '/en-US/store/b/xbox-accessories'] }, ctx) : `<div class="xs-empty"><p class="xs-empty-title">${PRODUCTS.some(p => p.type === 'hardware') ? 'Accessories are listed in Shop all products.' : 'No accessories match your selection.'}</p><p>Try a different category or clear your filters.</p><a class="xs-link" href="${base}/en-US/games/browse?type=hardware">CLEAR FILTERS</a></div>`}` },
      { h: 'Controllers', id: 'controllers', text: 'Xbox Wireless Controllers, Elite Series 2 and Xbox Adaptive Controller.', ctas: [['XBOX Design Lab', '/en-US/xbox-design-lab']], products: { filter: inCategory('Controllers', 'PC accessories'), limit: 5, empty: 'No items in this category right now.', more: shopCategory('Controllers') } },
      { h: 'Mobile gaming accessories', id: 'mobile', text: 'Clips and controllers for playing on phones and tablets.', products: { filter: inCategory('Mobile gaming'), limit: 5, empty: 'No items in this category right now.', more: shopCategory('Mobile gaming') } },
      { h: 'Handheld gaming accessories', id: 'handheld', text: 'Cases and accessories for Windows gaming handhelds.', products: { filter: inCategory('Handheld gaming'), limit: 5, empty: 'No items in this category right now.', more: shopCategory('Handheld gaming') } },
      { h: 'Stands & charging solutions', id: 'charging', text: 'Rechargeable battery packs and charging stands.', products: { filter: inCategory('Stands & charging'), limit: 5, empty: 'No items in this category right now.', more: shopCategory('Stands & charging') } },
      { h: 'Headsets & communication', id: 'headsets', text: 'Xbox Wireless Headset and Designed for Xbox headsets.', products: { filter: inCategory('Headsets & communication'), limit: 5, empty: 'No items in this category right now.', more: shopCategory('Headsets & communication') } },
      { h: 'Storage', id: 'storage', text: 'Storage Expansion Cards for Xbox Series X|S and external drives for backward compatible games.', products: { filter: inCategory('Storage'), limit: 5, empty: 'No items in this category right now.', more: shopCategory('Storage') } },
      { h: 'Console wraps', id: 'wraps', text: 'Skins and wraps for Xbox Series X|S.' },
      { h: 'Wheels & Joysticks', id: 'wheels', text: 'Racing wheels, flight sticks and arcade sticks Designed for Xbox.', products: { filter: inCategory('Wheels & joysticks'), limit: 5, empty: 'No items in this category right now.', more: shopCategory('Wheels & joysticks') } },
      { h: 'Assistive technologies', id: 'assistive', text: 'The Xbox Adaptive Controller, Adaptive Joystick and switch accessories.', products: { filter: inCategory('Assistive technologies'), limit: 5, empty: 'No items in this category right now.', more: shopCategory('Assistive technologies') } },
      { h: 'Stream XBOX games. No console required.', ctas: [['EXPLORE CLOUD GAMING', '/en-US/cloud-gaming']] },
    ],
  },
  '/en-US/xbox-design-lab': simple('ACCESSORIES', 'XBOX Design Lab', 'Design your own Xbox Wireless Controller: choose colors for the body, back case, D-pad, thumbsticks, bumpers and triggers, and add engraving.', [
    { h: 'How it works', list: ['Pick a controller base.', 'Choose colors and finishes for each part.', 'Add optional engraving and rubberized grips.'], text: 'Custom controllers are designed and ordered on Xbox Design Lab.' },
  ], { id: 'design-lab', crumbs: [['Accessories', '/en-US/accessories']], ctas: [['Shop all accessories', '/en-US/accessories']] }),
  ...Object.fromEntries([
    ['xbox-on-pc', 'XBOX ON PC', 'Elevate your PC gaming experience with XBOX. Get the Xbox PC app to discover, download and play hundreds of games with PC Game Pass.', ['Get an instant library on PC', 'Most-played XBOX PC games', 'Maximize PC gameplay with Game Bar', 'PC gaming accessories']],
    ['xbox-on-handhelds', 'XBOX ON HANDHELDS', 'Play your Xbox PC games on Windows gaming handhelds, including ROG XBOX Ally X and ROG XBOX Ally, with the full-screen Xbox experience.', ['Built to game with XBOX', 'Optimized for handhelds', 'Handheld gaming accessories']],
    ['xbox-on-mobile', 'XBOX ON MOBILE', 'Stream games, chat with friends and buy games with the Xbox mobile app on phones and tablets.', ['Stream games on your phone', 'Remote Play from your console', 'Mobile gaming accessories']],
    ['xbox-on-tvs', 'XBOX ON TVS', 'Play Xbox games with no console on supported smart TVs and streaming devices with Xbox Cloud Gaming.', ['Supported TVs', 'Connect a controller', 'Stream hundreds of games']],
    ['xbox-on-vr-headsets', 'XBOX ON VR HEADSETS', 'Play Xbox games on a giant virtual screen with supported VR headsets and Xbox Cloud Gaming.', ['Supported headsets', 'Play on a big screen anywhere', 'Connect a controller']],
  ].map(([slug, h1, intro, heads]) => [`/en-US/${slug}`, simple('PLAY', h1, intro, [
    { h: 'Play your way', cards: heads.map(h => card(h, '')) },
    { ...WAYS },
    { h: 'Frequently asked questions', faq: [['What do I need?', 'A Microsoft account, a supported device and, for cloud gaming, an eligible Game Pass plan.'], ['Can I play the games I buy here?', 'Yes. Digital purchases are added to your Microsoft account library.']] },
  ], { ctas: [['GET THE APP', '/en-US/xbox-game-pass'], ['EXPLORE CLOUD GAMING', '/en-US/cloud-gaming']] })])),
  '/en-US/community': simple('COMMUNITY', 'XBOX COMMUNITY', 'Thank you for being part of the XBOX community. It\'s gamers like you that make this the best place to play. Now, go play—together!', [
    { h: 'The latest in gaming', cards: [card('XBOX News', 'Announcements, game reveals and Game Pass updates.', 'Read more', '/en-US/news'), card('FanFest', 'Exclusive events for passionate Xbox fans.', 'Learn more', '/en-US/community/fanfest'), card('XBOX 25th Anniversary', 'Celebrating 25 years of Xbox.', 'Learn more', '/en-US/xbox-25th-anniversary')] },
    { h: 'Current discussions', cards: [card('Community standards', 'How we keep Xbox safe and fun for everyone.', 'Read the standards', '/en-US/legal/community-standards'), card('Accessible gaming', 'Gaming for everyone.', 'Learn more', '/en-US/community/for-everyone/accessibility'), card('User Research at XBOX', 'Help shape future Xbox products.', 'Learn more', '/en-US/community/research')] },
    { h: 'Stay connected', ctas: [['XBOX CONSOLES', '/en-US/consoles'], ['GAMES', '/en-US/games'], ['ACCESSORIES', '/en-US/accessories'], ['MY ACCOUNT', '/account']] },
  ]),
  '/en-US/xbox-25th-anniversary': simple('COMMUNITY', 'XBOX 25th Anniversary', 'Celebrating 25 years of Xbox with the players, creators and games that made it.', [{ h: 'Celebrate with us', cards: [card('Anniversary collections', 'Designed for XBOX 25th Anniversary Collection accessories.', 'Shop all accessories', '/en-US/accessories'), card('Anniversary in-game items', 'Look for anniversary content in participating games.', 'Games home', '/en-US/games')] }]),
  '/en-US/community/fanfest': simple('COMMUNITY', 'XBOX FanFest', 'FanFest brings passionate Xbox fans together for exclusive events, previews and meetups with game creators.', [{ h: 'How FanFest works', list: ['Events are invitation-based and announced on Xbox Wire.', 'Participants may receive exclusive gear and early looks at games.', 'Follow Xbox to hear about upcoming events.'] }]),
  '/en-US/news': simple('XBOX WIRE', 'XBOX News', 'Xbox Wire is the official source for Xbox news: game announcements, Game Pass additions, hardware and community updates. This page summarises the section; articles are published on news.xbox.com.', [{ h: 'Popular topics', cards: [card('Xbox Game Pass', 'New games joining and leaving the library.', 'Explore Game Pass', '/en-US/xbox-game-pass'), card('Games', 'Release dates, trailers and previews.', 'Games home', '/en-US/games'), card('Hardware', 'Consoles and accessories news.', 'XBOX consoles', '/en-US/consoles')] }]),
  '/en-US/community/sustainability': simple('COMMUNITY', 'Sustainability', 'Xbox is working to reduce the environmental impact of its consoles, packaging and services, with energy-saving console settings and recyclable packaging.', [{ h: 'What you can do', list: ['Use the Shutdown (energy saving) power option.', 'Recycle old consoles and accessories responsibly.', 'Keep your console updated for the latest efficiency improvements.'] }]),
  '/en-US/community/for-everyone': simple('COMMUNITY', 'Our philosophy', 'Gaming for everyone: Xbox believes everyone should be able to experience the joy of gaming, and builds products and community standards to make that possible.', [{ h: 'Gaming for everyone', cards: [card('Accessible gaming', '', 'Learn more', '/en-US/community/for-everyone/accessibility'), card('Family hub', '', 'Learn more', '/en-US/family-hub'), card('Community standards', '', 'Learn more', '/en-US/legal/community-standards')] }]),
  '/en-US/community/for-everyone/accessibility': simple('COMMUNITY', 'Accessible gaming', 'Xbox products and services are designed so more people can play: the Xbox Adaptive Controller, accessibility settings, and game accessibility feature tags in the Store.', [{ h: 'Accessibility features', list: ['Narrator, high contrast and text size settings on console.', 'Copilot and button remapping for controllers.', 'Accessibility filters when browsing games.'] }, { h: 'Get help', ctas: [['Accessible gaming support', '/en-US/support/help/accessible-gaming']] }]),
  '/en-US/family-hub': simple('FAMILY', 'FAMILY-FRIENDLY GAMING FOR EVERYONE', 'Tools to help your family play safely: screen time, content filters, spending limits and privacy settings.', [
    { h: 'XBOX Family Settings app', ctas: [['LEARN MORE', '/en-US/apps/family-settings-app']] },
    { h: 'Create a family group', cards: [card('Benefits of a family group', ''), card('Add a family member online', ''), card('Change your child’s XBOX online settings', '')] },
    { h: 'Set good screen time habits', cards: [card('Set device screen time limits online', ''), card('Set app and game screen time limits', ''), card('View activity reports', '')] },
    { h: 'Shop with smart limits', cards: [card('Approve your child’s purchases', ''), card('Set up an allowance', ''), card('Keep track of purchases', 'Order history', 'Order history', '/account/billing/orders')] },
    { h: 'Turn off the toxicity, turn up the fun', ctas: [['VIEW XBOX COMMUNITY STANDARDS', '/en-US/legal/community-standards']] },
  ]),
  '/en-US/apps/family-settings-app': simple('FAMILY', 'XBOX Family Settings app', 'Manage your children\'s gaming activities from your phone: set screen time limits, filter content, approve purchases and manage who they can play with.', [{ h: 'What you can do', list: ['Set daily screen time limits.', 'Review activity reports.', 'Approve friend requests and purchases.', 'Add money to a child\'s account as an allowance.'] }], { ctas: [['Family hub', '/en-US/family-hub']] }),
  '/en-US/legal/community-standards': simple('LEGAL', 'XBOX COMMUNITY STANDARDS', 'Xbox is a place for players everywhere. Help keep it safe and fun by following these standards.', [
    { h: 'Our values', text: 'Make gaming accessible, encourage creativity, keep competition fair, support each other and reject hate.' },
    { h: 'Conduct', text: 'Treat others with respect, be a good sport and don\'t troll or bully.' },
    { h: 'Content', text: 'Share your creations without harming other people\'s enjoyment of the community.' },
    { h: 'Attitude', text: 'Join clubs and groups, and use mute, block and report when you encounter misconduct.' },
    { h: 'Cross-platform play', text: 'Be respectful and welcoming to players on every platform.' },
    { h: 'Standards', list: ['1. Keep it legal', '2. Do your part to keep everyone safe', '3. Turn that spam into substance', '4. Keep your content clean', '5. Fraud benefits no one', '6. Where there are limits, there\'s a reason', '7. Harmful behavior has no place on XBOX', '8. Respect the rights of others', '9. Always respect the privacy of others', '10. Be a force for good, even when others aren\'t'] },
    { h: 'Consequences', text: 'Enforcement protects the community. Inappropriate conduct can lead to temporary feature restrictions; repeat or severe offenses can lead to permanent suspension.' },
    { h: 'Reporting', text: 'Block, mute and report players or content from the console, PC app or mobile app; you can appeal enforcement decisions.' },
  ]),
  '/en-US/gear': simple('MORE', 'XBOX Gear', 'The official Xbox Gear Shop sells Xbox-branded apparel, collectibles and lifestyle merchandise. It is a separate store; Xbox Gear is not sold here.', [{ h: 'Shop here instead', ctas: [['Games home', '/en-US/games'], ['Shop all accessories', '/en-US/accessories']] }]),
  '/en-US/xbox-game-studios': simple('MORE', 'XBOX Game Studios', 'Xbox Game Studios develops and publishes games such as Halo, Forza, Gears of War and Minecraft. Find official merchandise at the Xbox Gear Shop.', [{ h: 'Explore games', ctas: [['Games home', '/en-US/games']] }]),
  '/en-US/support/xbox-live-status': supportTopic('XBOX status', 'All services are up and running. Check here for the current status of Xbox services, games and apps.', [['Account and profile', 'Up and running'], ['Store and subscriptions', 'Up and running'], ['Games and gaming', 'Up and running'], ['Social and activity', 'Up and running']].map(([h, t]) => [h, t, '/en-US/support/xbox-live-status'])),
  '/en-US/support/help/account-profile/browse': supportTopic('Account & profile', 'Sign in, recover your account, manage your gamertag and profile, and keep your account secure.', [['Sign in to Xbox', 'Fix sign-in problems on console, PC and mobile.'], ['Change your gamertag', 'Choose a new gamertag.'], ['Account security', 'Protect your Microsoft account with two-step verification.', '/en-US/support/account']]),
  '/en-US/support/help/subscriptions-billing/browse': supportTopic('Subscriptions & billing', 'Manage Game Pass and other subscriptions, payment options, order history, refunds and redeeming codes.', [['Manage subscriptions', 'Turn recurring billing on or off.', '/en-US/support/subscriptions'], ['Request a refund for digital games', 'Check refund eligibility for digital purchases.', '/en-US/returns'], ['Pre-order FAQ', 'When you are charged and how to cancel a pre-order.', '/en-US/support/purchases'], ['Redeem a code or gift card', 'Add a code to your Microsoft account.', '/en-US/redeem']]),
  '/en-US/support/help/hardware-network/browse': supportTopic('Hardware & networking', 'Set up and troubleshoot your console, controllers, storage, display and network connection.', [['Console setup', 'Get started with Xbox Series X|S.'], ['Controller troubleshooting', 'Pair and update your controller.'], ['Network connection', 'Test and fix your network connection.']]),
  '/en-US/support/help/family-online-safety/browse': supportTopic('Family & online safety', 'Set up a family group, manage privacy and online safety, and report inappropriate behavior.', [['Family Settings', 'Screen time, content and spending.', '/en-US/apps/family-settings-app'], ['Privacy settings', 'Choose who can communicate with your child.'], ['Photosensitive Seizure Warning', 'Important health information.', '/en-US/support/help/family-online-safety/online-safety/photosensitive-seizure-warning']]),
  '/en-US/support/help/games-apps/browse': supportTopic('Games & apps', 'Install, play and troubleshoot games and apps, cloud saves, game add-ons and cloud gaming.', [['Install games and add-ons', 'Find your games in My library.', '/en-US/support/installation'], ['Pre-install a pre-order', 'Download pre-orders before release.'], ['Cloud saves', 'Keep your progress in sync.']]),
  '/en-US/support/help/friends-social-activity/browse': supportTopic('Friends & social activity', 'Add friends, join parties, use clubs, share captures and manage messages.', [['Add friends', 'Find and follow other players.'], ['Parties and chat', 'Talk with friends while you play.'], ['Report a player', 'Report inappropriate behavior.', '/en-US/legal/community-standards']]),
  '/en-US/support/help/accessible-gaming': supportTopic('Accessible gaming', 'Learn about accessibility settings and devices for Xbox consoles, PC and mobile.', [['Xbox Adaptive Controller', 'Set up and customise the adaptive controller.'], ['Narrator and display settings', 'Use Narrator, high contrast and magnifier.'], ['Copilot', 'Use two controllers as one.']]),
  '/en-US/support/help/hardware-network/settings-updates/whats-new-xbox-one-system-updates': supportTopic('XBOX system updates', 'See what\'s new in the latest Xbox console system updates and how to update your console.', [['Update your console', 'Settings > System > Updates.'], ['Release notes', 'Features added in recent updates.']]),
  '/en-US/support/help/family-online-safety/online-safety/photosensitive-seizure-warning': supportTopic('Photosensitive Seizure Warning', 'A very small percentage of people may experience a seizure when exposed to certain visual images, including flashing lights or patterns that may appear in video games. If you experience any symptoms, immediately stop playing and consult a doctor.', [['Who is at risk', 'Even people with no history of seizures or epilepsy may have an undiagnosed condition.'], ['Reduce the risk', 'Sit farther from the screen, use a smaller screen, play in a well-lit room and do not play when drowsy or fatigued.']]),
  '/en-US/support/microsoft-store': supportTopic('Microsoft Store Support', 'Help with payment, billing and Microsoft Store purchases: payment options, order history, pre-orders, refunds and gift cards.', [['Payment & billing', 'Add or update a payment option.', '/en-US/support/help/subscriptions-billing/browse'], ['Order history', 'View and manage your orders.', '/account/billing/orders'], ['Returns and refunds', 'Refund eligibility for Microsoft Store purchases.', '/en-US/returns'], ['Shipping', 'Shipping options, costs and delivery times.', '/en-US/shipping']]),
  '/en-US/play/user': null, // dynamic (profile)
  '/en-US/rewards': simple('REWARDS', 'Play. Earn. Redeem. Repeat.', 'Earn Microsoft Rewards points for playing, shopping and completing quests, then redeem them for gift cards, games and more.', [
    { h: 'Get started earning rewards with XBOX', cards: [card('Play', 'Complete quests in the Rewards hub.'), card('Shop', 'Earn points on eligible purchases.'), card('Redeem', 'Use points for gift cards and more.', 'REDEEM', '/en-US/redeem')] },
    { h: 'HOW TO EARN POINTS', cards: [card('Earn for playing', 'Visit the Rewards hub to claim your points and start earning.'), card('Earn for shopping', 'Earn points on games, add-ons and subscriptions.')] },
    { h: 'EARN MORE, EARN FASTER', text: 'Get up to 10% back in points with Ultimate and up to 5% back in points with Premium on select Game Pass library games and add-ons purchases.', ctas: [['JOIN GAME PASS', '/en-US/xbox-game-pass']] },
    { h: 'HOW TO REDEEM POINTS', text: 'Redeem your points for real rewards, such as Xbox gift cards, or spend points directly on your XBOX console.' },
    { h: 'Frequently Asked Questions', faq: [['Who can join?', 'Anyone with a Microsoft account in a supported market.'], ['Do points expire?', 'Points expire if you do not earn or redeem any for 18 months.']] },
  ], { ctas: [['GET STARTED', '/account']] }),
  '/en-US/developers/games': simple('FOR DEVELOPERS', 'Games', 'Microsoft Game Dev gives developers tools, programs and documentation to build and publish games for Xbox, PC and cloud. This page summarises developer.microsoft.com/games.', [{ h: 'Developer programs', list: ['ID@Xbox for independent developers.', 'Xbox Game Dev Kit (GDK).', 'Publishing to the Microsoft Store.'] }]),
  '/en-US/designed-for-xbox': simple('FOR DEVELOPERS', 'Designed for XBOX', 'Designed for Xbox accessories are made by licensed partners and certified to work with Xbox consoles and PCs.', [{ h: 'Licensed accessory categories', list: ['Controllers', 'Headsets', 'Storage', 'Wheels & joysticks', 'Charging solutions'] }, { h: 'Shop', ctas: [['Shop all accessories', '/en-US/accessories']] }]),
  '/en-US/feedback': simple('RESOURCES', 'Feedback', 'Share ideas and suggestions for Xbox products and services. Feedback is collected on the Xbox Ideas site; you can also contact support for help with an issue.', [{ h: 'Other ways to help', ctas: [['User Research at XBOX', '/en-US/community/research'], ['Contact support', '/en-US/support/contact']] }]),
  '/en-US/community/research': simple('RESOURCES', 'User Research at XBOX', 'Help shape the future of Xbox. Sign up to take part in studies and surveys about games, apps and devices.', [{ h: 'How it works', list: ['Sign up with your Microsoft account.', 'Get invited to studies that match your interests.', 'Take part online or in person.'] }]),
  '/en-US/returns': simple('MICROSOFT STORE', 'Get a refund for apps and games purchased from Microsoft Store', 'Digital goods such as apps, games, add-on content, subscriptions, movies, TV shows and books are generally not refundable, except where the offer or applicable law states that you\'re eligible for a refund.', [
    { h: 'How to request a refund for Microsoft Store apps on a Windows PC', text: ['Sign in to your Microsoft account, open Order history, find the purchase and select Request a refund. For Xbox digital games, see Request a refund for digital games.', 'Pre-orders can be cancelled from Order history up to 10 days before release. If you cancel a pre-order after it is billed but before it is released, it is processed as a refund.'], ctas: [['Order history', '/account/billing/orders'], ['Pre-order FAQ', '/en-US/support/purchases']] },
    { h: 'Charges you don\'t recognize', text: 'Review a charge on the Manage your payments page of your Microsoft account.' },
    { h: 'Terms of Sale', text: 'See the Microsoft Store Terms of Sale for full return and refund policies.', ctas: [['Terms of use', '/en-US/terms']] },
  ]),
  '/en-US/shipping': simple('MICROSOFT STORE', 'Shipping options, costs, and delivery times', 'Microsoft Store only ships to certain countries or regions. Delivery times are business days. Digital games, add-ons and subscriptions are delivered to your account and never ship.', [
    { h: 'Where we ship', table: [['Country or region', 'Options and costs', 'Delivery time'], ['USA & Puerto Rico', 'Expedited: free; Express: $16.99', 'Expedited: 2-3 days; Express: 1-2 days'], ['Canada', 'Ground: free; Expedited: CAD $9.99', 'Ground: 3-7 days; Expedited: 1-2 days'], ['Australia', 'Standard: free', '1-6 days, depending on region'], ['Germany', 'Standard: free; Express: €13.00', 'Standard: 2-3 days; Express: 1-2 days']] },
    { h: 'Digital items', text: 'Grand Theft Auto VI and other digital purchases from this store are licenses added to your Microsoft account. Pre-orders unlock on the release date.' },
  ]),
  '/en-US/trademarks': simple('LEGAL', 'Trademarks', 'Microsoft, Xbox, Xbox Series X|S and the Xbox logos are trademarks of the Microsoft group of companies. Other names may be trademarks of their respective owners.', [{ h: 'Using Microsoft trademarks', text: 'Use of Microsoft trademarks or logos in modified or misleading ways is prohibited.' }]),
  '/en-US/legal/legal-notices': simple('LEGAL', 'THIRD PARTY NOTICES', 'Xbox products include third-party open-source components. Their original copyright notices and license terms are listed here.', [{ h: 'Components', list: ['cocos2d', 'STL', 'Base64', 'libPNG', 'Huffman', 'Saliency', 'Independent JPEG Group', 'util', 'MD5', 'RFC 3492', 'DotNetZip', 'JSON-C', 'MKV', 'FLAC', 'Xiph Opus', 'WebM', 'pstdint', 'KISS-FFT', 'SILK', 'tinyh264'] }]),
  '/en-US/legal/devices-safety-and-eco': simple('LEGAL', 'Devices safety and eco', 'Product safety, regulatory and environmental compliance information for Microsoft devices, including Xbox consoles and accessories.', [{ h: 'Topics', list: ['Product safety warnings', 'Battery and recycling information', 'Regulatory compliance', 'Energy efficiency'] }]),
  '/en-US/legal/consumer-health-privacy': simple('LEGAL', 'Consumer Health Privacy', 'Microsoft\'s Consumer Health Data Privacy Policy explains how consumer health data is collected, used and shared, and the rights you have over it.', [{ h: 'Your rights', list: ['Access your consumer health data.', 'Delete your consumer health data.', 'Withdraw consent.'], ctas: [['Privacy & Cookies', '/en-US/privacy']] }]),
  '/en-US/privacy-choices': simple('LEGAL', 'Your Privacy Choices', 'Opt out of the sale or sharing of your personal data for targeted advertising, and manage your privacy settings.', [{ h: 'Manage your choices', ctas: [['Privacy & Cookies', '/en-US/privacy'], ['Your info', '/account/profile']] }]),
  '/en-US/about-our-ads': simple('LEGAL', 'About our ads', 'Microsoft shows personalized ads based on your activity. You can turn personalized ads off in your Microsoft account privacy settings.', [{ h: 'Ad settings', ctas: [['Your Privacy Choices', '/en-US/privacy-choices']] }]),
  '/en-US/locale': simple('LANGUAGE', 'Choose your country or region', 'This store is available in English (United States). Prices are in US dollars.', [{ h: 'Americas', list: ['English (United States) — current'], ctas: [['Xbox home', '/']] }]),
  '/en-US/all-microsoft': null, // dynamic
  '/en-US/contactus': simple('MICROSOFT SUPPORT', 'Contact us', 'Get help with Microsoft products and services.', [
    { h: 'Select the product you need help with', cards: [card('Xbox', 'Account, billing, consoles and games.', 'Get help', '/en-US/support'), card('Microsoft Store', 'Payment, orders, refunds and shipping.', 'Get help', '/en-US/support/microsoft-store'), card('Microsoft 365', 'Office apps and subscriptions.'), card('Windows', 'Windows devices and updates.'), card('Surface devices', 'Surface hardware and accessories.'), card('PC accessories', 'Mice, keyboards and more.')] },
    { h: 'More support options', ctas: [['Contact support', '/en-US/support/contact'], ['Get self-help support', '/en-US/support']] },
  ]),
  '/en-US/store/b/gift-cards': simple('MICROSOFT STORE', 'Microsoft and XBOX Gift Cards', 'Give the gift of games, apps and more. Gift cards add money to a Microsoft account to spend in Microsoft Store and on Xbox.', [
    { h: 'Shop gift cards', cards: [card('The perfect gift for gamers', 'Xbox gift cards can be used for games, add-ons and Game Pass.'), card('Giving made easy', 'Send a digital code by email or give a physical card.'), card('Gift Card FAQ', 'Answers to common gift card questions.', 'Read the FAQ', '/en-US/store/b/gift-cards#faq'), card('Redeem a gift card', 'Add a gift card to your Microsoft account balance.', 'Learn more', '/en-US/redeem')], html: (base, ctx) => PRODUCTS.some(p => p.type === 'gift-card') ? productRow(base, { filter: p => p.type === 'gift-card', limit: 10, sort: (a, b) => a.rank - b.rank, more: ['SHOP ALL GIFT CARDS', '/en-US/search/results?type=gift-cards'] }, ctx) : `<div class="xs-empty"><p class="xs-empty-title">Gift cards are currently unavailable online.</p><p>You can still redeem an Xbox or Microsoft gift card code.</p><a class="xs-link" href="${base}/en-US/redeem">Redeem a code</a></div>` },
    { h: 'Give 100+ games with Game Pass', ctas: [['Join Game Pass', '/en-US/xbox-game-pass']] },
    { h: 'Frequently Asked Questions', id: 'faq', faq: [['What can I purchase with an XBOX gift card?', 'Games, add-ons, subscriptions such as Game Pass, movies and apps in Microsoft Store on Xbox and Windows.'], ['Where can you use an XBOX or Microsoft gift card?', 'Redeem it to your Microsoft account, then use the balance in Microsoft Store on Xbox, Windows and the web.'], ['How do you gift XBOX Game Pass?', 'Buy a Game Pass gift card or digital code and send it to the recipient.']] },
    STORE_WHY,
  ]),
  '/en-US/store/locations/find-a-store': simple('MICROSOFT STORE', 'Microsoft Experience Centers', 'Visit us to explore the latest Microsoft devices, get expert support and join in-person gaming events.', [
    { h: 'Microsoft Experience Center - Fifth Avenue', html: () => `<div class="xs-store-card"><address class="xs-address">677 Fifth Avenue, New York, NY 10022-4210<br>(212) 824-3100</address><dl class="xs-hours"><dt>Monday – Saturday</dt><dd>10:00 AM – 8:00 PM</dd><dt>Sunday</dt><dd>11:00 AM – 6:00 PM</dd></dl></div>`, ctas: [['Book an appointment', '/en-US/contactus']] },
    { h: 'Why visit', cards: [card('Expert support experience like no other', 'Get hands-on help and device support from Microsoft experts.'), card('In-person gaming events', 'Join community events and tournaments.'), card('Best-in-class devices', 'Try Surface, Xbox and Windows devices.')] },
    { h: 'Frequently asked questions', faq: [['What is a Microsoft Experience Center?', 'A Microsoft location where you can explore products, get support and attend events.'], ['How do I get help if I am unable to come in to the Microsoft Experience Center?', 'Contact Microsoft Support online.'], ['Can I return products at the Microsoft Experience Center?', 'Returns for online orders are handled online; see the returns policy.'], ['Will you open any other stores?', 'There are no other Microsoft retail stores announced at this time.']] },
  ]),
}

// ---------- dynamic pages ----------
export function allMicrosoft(base) {
  return infoPage(base, { eyebrow: 'MICROSOFT', h1: 'All Microsoft', intro: 'Microsoft makes products and services across software, devices, gaming, business and developer tools. Explore Microsoft products and services from the All Microsoft menu.', ctas: [['Xbox home', '/']], sections: [
    { html: () => `<div class="xs-allms">${ALL_MICROSOFT.map(([h, items]) => `<div><h2>${esc(h)}</h2><ul>${items.map(i => `<li>${esc(i)}</li>`).join('')}</ul></div>`).join('')}</div>` },
    { h: 'From Microsoft', ctas: [['Gift cards', '/en-US/store/b/gift-cards'], ['Shop XBOX', '/en-US/games'], ['XBOX Game Pass Ultimate', '/en-US/xbox-game-pass']] },
  ] }, {})
}

export function profilePage(base, user) {
  return infoPage(base, { eyebrow: 'PROFILE', h1: user ? `${user.first_name || 'Your'} profile` : 'Profile', intro: user ? `Signed in as ${user.email}.` : 'Sign in to see your gamertag, achievements, friends and recently played games.', ctas: user ? [['Microsoft account', '/account'], ['My library', '/account/library']] : [['Sign in', '/login.live.com/oauth20_authorize.srf?prompt=select_account&ru=' + encodeURIComponent(base + '/en-US/play/user')]], sections: [{ h: 'Recently played', html: () => '<div class="xs-empty"><p class="xs-empty-title">No recent activity.</p><p>Play a game on your console or PC to see it here.</p></div>' }] }, {})
}

const FAQ_TRACK = [
  ['How do I check out as a guest?', 'Select Check out as guest at checkout for eligible physical items. Digital games such as Grand Theft Auto VI require a Microsoft account.'],
  ['Can I use a Microsoft or Xbox Gift Card checking out as a guest?', 'No. Gift card balances are tied to a Microsoft account.'],
  ['Where can I view or manage an order purchased as a guest?', 'Use Manage guest order with your order number and the email address used at checkout.'],
  ['I checked out as a guest, but I also have a Microsoft account. Why do I not see my order in account.microsoft.com?', 'Guest orders are not linked to an account. Look them up with Manage guest order.'],
  ['What is the refund policy for products purchased as a guest?', 'The same return policy applies to guest and account orders.'],
]
export function orderTracking(base, { query = {}, result } = {}) {
  const orderNo = String(query.order || ''), email = String(query.email || '')
  const looked = query.order !== undefined || query.email !== undefined
  const lookup = `<form class="xs-form" method="get" action="${base}/en-US/store/b/order-tracking#guest" id="guest"><h3>Manage guest order</h3><div class="xb-field"><label for="ot-order">Order number</label><input id="ot-order" name="order" inputmode="numeric" value="${esc(orderNo)}" required></div><div class="xb-field"><label for="ot-email">Email address</label><input id="ot-email" name="email" type="email" autocomplete="email" value="${esc(email)}" required></div><button class="xs-btn" type="submit">Find order</button>${looked ? result : ''}</form>`
  return infoPage(base, { eyebrow: 'MICROSOFT STORE', h1: 'Order Tracking', intro: 'Track, manage or return your Microsoft Store orders.', sections: [
    { h: 'Manage your orders', cards: [card('Manage Microsoft account order', 'Sign in to see orders placed with your Microsoft account, cancel pre-orders and request refunds.', 'Manage Microsoft account order', '/account/billing/orders'), card('Manage guest order', 'Look up an order placed without signing in.', 'Manage guest order', '/en-US/store/b/order-tracking#guest')], html: () => lookup },
    { h: 'Frequently Asked Questions', faq: FAQ_TRACK },
    STORE_WHY,
  ] }, {})
}
export function lookupOrder(base, query, req) {
  const order = getOrder(String(query.order || '').trim())
  const email = String(query.email || '').trim().toLowerCase()
  if (!/^\d{10}$/.test(String(query.order || '').trim()) || !email) return '<p class="xb-error-summary" role="alert">Enter your 10-digit order number and the email address used for the order.</p>'
  if (!order || order.store !== req.storeSlug || order.customer?.email?.toLowerCase() !== email) return '<p class="xb-error-summary" role="alert">We couldn\'t find an order with that order number and email address. Orders placed with a Microsoft account are in Order history.</p>'
  return `<div class="xs-result" role="status"><p><b>Order ${esc(order.order_number)}</b></p><p>${esc(order.items.map(i => i.title).join(', '))}</p><p>${esc(order.fulfillment?.eta || '')}</p><p>This order was placed with a Microsoft account. <a href="${base}/account/billing/orders/${esc(order.order_number)}">View it in Order history</a>.</p></div>`
}

// ---------- site map ----------
const EXTRA_SITEMAP = [
  ['Microsoft Store', [['Cart', '/en-US/cart'], ['Gift cards', '/en-US/store/b/gift-cards'], ['Shipping', '/en-US/shipping'], ['Order history', '/account/billing/orders'], ['My library', '/account/library'], ['Search', '/en-US/search/results']]],
  ['Games catalog', [['Grand Theft Auto VI', '/en-US/search/results?q=grand%20theft%20auto%20vi'], ['Explore genres', '/en-US/games/genres'], ['Play with your devices', '/en-US/games/platforms'], ['Add-ons', '/en-US/search/results?type=add-ons']]],
  ['Information', [['All Microsoft', '/en-US/all-microsoft'], ['Contact us', '/en-US/contactus'], ['Choose your country or region', '/en-US/locale']]],
]
export function sitemapPage(base) {
  const block = (title, links) => `<section class="xs-sm-block"><h2>${esc(title)}</h2><ul>${links.map(([l, p]) => `<li><a href="${base}${p}">${esc(l)}</a></li>`).join('')}</ul></section>`
  return `<div class="xs-page"><section class="xs-hero xs-hero-light"><div class="xs-hero-copy"><p class="xs-eyebrow">XBOX</p><h1>Sitemap</h1><p class="xs-lede">Find your way around Xbox.com, from Game Pass and games to support and Microsoft Store policies.</p></div></section><div class="xs-sitemap">
  ${block('Home', [['Xbox home', '/']])}
  ${MENU.map(m => m.groups.map(g => block({ Devices: 'All devices', Shop: 'Shop Xbox', Support: 'Xbox Support', Account: 'Your account', Developers: 'Xbox developers' }[g.title] || g.title, g.links.map(([l, p]) => [l, p]))).join('')).join('')}
  ${FOOTER.map(c => block(c.title === 'Microsoft Store' ? 'Shop Microsoft Store' : c.title === 'For Developers' ? 'Xbox for developers' : c.title, c.links)).join('')}
  ${block('Legal', LEGAL)}
  ${EXTRA_SITEMAP.map(([t, l]) => block(t, l)).join('')}
  </div></div>`
}
export function sitemapXml(base, origin = '') {
  const paths = new Set(['/'])
  for (const m of MENU) for (const g of m.groups) for (const [, p] of g.links) paths.add(p.split('#')[0])
  for (const c of FOOTER) for (const [, p] of c.links) paths.add(p)
  for (const [, p] of LEGAL) paths.add(p)
  for (const [, l] of EXTRA_SITEMAP) for (const [, p] of l) paths.add(p)
  for (const p of Object.keys(PAGES)) paths.add(p)
  for (const p of PRODUCTS) paths.add(productPath('', p))
  const xmlEsc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...paths].map(p => `  <url><loc>${xmlEsc(origin + base + p)}</loc></url>`).join('\n')}\n</urlset>\n`
}

// ---------- homepage sections ----------
// xbox.com's home hero is a carousel; its slide copy is image-only in the capture, so the clone's
// slides point at what this store sells (GTA VI pre-orders) and the Xbox sections it mirrors.
export function homeHero(base) {
  const gta = PRODUCTS.find(p => p.id === '9p3h4968grsm')
  const outer = PRODUCTS.find(p => p.shelf && p.title === 'The Outer Worlds 2')
  const slides = [
    ...(outer ? [{ id: 'outer-worlds', cls: 'xs-slide-gp', eyebrow: 'AVAILABLE NOW', h: 'The Outer Worlds 2', text: 'Become an Earth Directorate agent in Arcadia. Play it with Game Pass Ultimate and PC Game Pass, or buy it today.', ctas: [['BUY NOW', productPath('', outer)], ['JOIN GAME PASS', '/en-US/xbox-game-pass']] }] : []),
    { id: 'gta', cls: 'xs-slide-gta', eyebrow: 'PRE-ORDER NOW', h: 'Grand Theft Auto VI', text: 'Pre-order now on Xbox Series X|S and receive the Vintage Vice City Pack and one month of GTA+.', ctas: gta ? [['PRE-ORDER', productPath('', gta)], ['COMPARE EDITIONS', productPath('', gta)]] : [['Games home', '/en-US/games']] },
    { id: 'gamepass', cls: 'xs-slide-gp', eyebrow: 'XBOX GAME PASS', h: 'Play hundreds of games', text: 'Discover your next favorite game on console, PC and cloud.', ctas: [['JOIN GAME PASS', '/en-US/xbox-game-pass'], ['BROWSE GAMES', '/en-US/xbox-game-pass/games']] },
    { id: 'consoles', cls: 'xs-slide-hw', eyebrow: 'XBOX SERIES X|S', h: 'Power your dreams', text: 'The fastest, most powerful Xbox consoles.', ctas: [['SHOP CONSOLES', '/en-US/consoles'], ['COMPARE CONSOLES', '/en-US/consoles/compare']] },
  ]
  return `<section class="xs-carousel" aria-roledescription="carousel" aria-label="Featured">
  <div class="xs-slides">${slides.map((s, i) => `<article class="xs-slide ${s.cls}" id="slide-${s.id}" aria-roledescription="slide" aria-label="${i + 1} of ${slides.length}"><div class="xs-slide-copy"><p class="xs-eyebrow">${esc(s.eyebrow)}</p><h2>${esc(s.h)}</h2><p>${esc(s.text)}</p><div class="xs-ctas">${s.ctas.map((c, j) => `<a class="xs-btn${j ? ' xs-btn-ghost' : ''}" href="${base}${c[1]}">${esc(c[0])}</a>`).join('')}</div></div>${s.id === 'gta' && gta ? `<a class="xs-slide-cover" href="${base}${productPath('', gta)}" aria-label="View Grand Theft Auto VI"><img src="/static/reference/xbox-store/gta-vi-cover.png" alt="Grand Theft Auto VI cover art"></a>` : ''}${s.id === 'outer-worlds' && outer ? `<a class="xs-slide-cover" href="${base}${productPath('', outer)}" aria-label="View The Outer Worlds 2"><img src="/xbox-store/shelf-art/${outer.id}/0.svg" alt="The Outer Worlds 2 cover art"></a>` : ''}${s.id === 'gamepass' ? coverCollage(coverPicks(p => (p.subscriptions || []).length > 0, 9), 'xs-collage-slide') : ''}${s.id === 'consoles' ? `<div class="xs-slide-device" aria-hidden="true">${consolesSvg()}</div>` : ''}</article>`).join('')}</div>
  <nav class="xs-dots" aria-label="Choose slide">${slides.map((s, i) => `<a href="#slide-${s.id}" aria-label="Go to slide ${i + 1}: ${esc(s.h)}"></a>`).join('')}</nav><script>${CAROUSEL_JS}</script></section>`
}
// Keeps the active dot in step with the visible slide, and moves the carousel sideways on a dot click
// instead of jumping the page to the slide's anchor. The dots and slides still work without it.
const CAROUSEL_JS = `(function(){var c=document.currentScript.parentNode,r=c.querySelector('.xs-slides'),n=c.querySelector('.xs-dots'),d=[].slice.call(n.querySelectorAll('a'));n.classList.add('js');function u(){var i=Math.round(r.scrollLeft/Math.max(1,r.clientWidth));d.forEach(function(a,j){a.classList.toggle('is-active',j===i);a.setAttribute('aria-current',j===i?'true':'false')})}r.addEventListener('scroll',u,{passive:true});d.forEach(function(a,j){a.addEventListener('click',function(e){e.preventDefault();r.scrollTo({left:j*r.clientWidth,behavior:'smooth'})})});u()})()`
const ICON_USER = 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 21a8 8 0 0 1 16 0'
export function shopStrip(base, user) {
  const items = [['XBOX GAME PASS', '/en-US/xbox-game-pass', 'M4 5h16v14H4z M8 9h8 M8 13h5'], ['GAMES', '/en-US/games', 'M6 8h12a3 3 0 0 1 3 3v2a3 3 0 0 1-5 2l-1-1H9l-1 1a3 3 0 0 1-5-2v-2a3 3 0 0 1 3-3z'], ['CONSOLES', '/en-US/consoles', 'M8 3h8v18H8z M12 7v1'], ['ACCESSORIES', '/en-US/accessories', 'M4 14a8 8 0 0 1 16 0v4h-4v-5 M4 18v-4h4v5'], ['DEALS', '/en-US/promotions/sales/sales-and-specials', 'M3 12l9-9h9v9l-9 9z M16 8h.01'], ['REDEEM CODE', '/en-US/redeem', 'M3 7h18v10H3z M7 12h10'], ['WISH LIST', '/en-US/wishlist', 'M12 20s-7-4.5-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.5-7 10-7 10z'], user ? ['MY ACCOUNT', '/account', ICON_USER] : ['SIGN IN', '/login.live.com/oauth20_authorize.srf?prompt=select_account', ICON_USER]]
  return `<section class="xs-shop-strip"><h2>Shop for more xbox products or sign in to your xbox account</h2><nav aria-label="Shop for more Xbox products"><ul>${items.map(([l, p, d]) => `<li><a href="${base}${p}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d}"/></svg><span>${esc(l)}</span></a></li>`).join('')}</ul></nav></section>`
}
export function followXbox(base) {
  const nets = ['Email', 'Facebook', 'X', 'Instagram', 'WhatsApp', 'TikTok', 'YouTube', 'LinkedIn']
  return `<section class="xs-follow"><h2>Follow XBOX</h2><ul aria-label="Xbox social channels">${nets.map(n => `<li><span class="xs-social" aria-hidden="true">${esc(n[0])}</span><span>${esc(n)}</span></li>`).join('')}</ul><p class="xs-fine">Get the latest announcements on <a href="${base}/en-US/news">XBOX News</a>.</p></section>`
}

// ---------- routes ----------
export function installSite(router, { render, tile }) {
  const ctx = { tile }
  for (const [path, pg] of Object.entries(PAGES)) {
    if (!pg) continue
    router.get(path, (req, res) => render(req, res, pg.h1.replace(/^./, c => c.toUpperCase()), infoPage(res.locals.base, pg, ctx)))
  }
  router.get('/en-US/all-microsoft', (req, res) => render(req, res, 'All Microsoft', allMicrosoft(res.locals.base)))
  router.get('/en-US/play/user', (req, res) => render(req, res, 'Profile', profilePage(res.locals.base, req.store.user)))
  router.get('/en-US/store/b/order-tracking', (req, res) => {
    const looked = req.query.order !== undefined || req.query.email !== undefined
    render(req, res, 'Order Tracking', orderTracking(res.locals.base, { query: req.query, result: looked ? lookupOrder(res.locals.base, req.query, req) : '' }))
  })
  router.get('/en-US/sitemap', (req, res) => render(req, res, 'Sitemap', sitemapPage(res.locals.base)))
  router.get('/sitemap.xml', (req, res) => res.type('application/xml').send(sitemapXml(res.locals.base)))
}
