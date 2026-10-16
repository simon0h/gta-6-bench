// Store chrome, info pages and editorial sections that mirror store.rockstargames.com (research/parity/rockstar-store.json,
// captured 2026-10-13). Nothing here sells anything: titles that the reference catalog does not stock render the real page
// structure with a read-only "not available in this store" state and no prices or purchase controls.
import { esc, publicNotice } from '../../lib/html.js'
import { fixtureCatalog } from '../../lib/catalog-policy.js'
import { GAME, PRODUCTS, LISTINGS, CATALOG, SHELF_ITEMS } from './data.js'
import { tile, shelf as carouselShelf } from './depth-pages.js'
import { money } from '../../lib/html.js'

const REF = '/static/reference/rockstar-store/'
const SUB = c => `/search?sort=date.desc&amp;subcategories%5Ball%5D=${c}`

// Header menubar exactly as the real store renders it.
export const NAV = [
  { label: 'Games', href: '/view-all-games', items: [['View All Games', '/view-all-games'], ['Grand Theft Auto VI', '/game/buy-gta-vi'], ['Grand Theft Auto V', '/game/buy-gta-v'], ['Red Dead Redemption 2', '/game/buy-red-dead-redemption-2'], ['Red Dead Redemption', '/game/buy-red-dead-redemption'], ['Bully: Scholarship Edition', '/game/buy-bully-scholarship-edition']] },
  { label: 'Game Add-Ons', href: '/game-add-ons', items: [['Grand Theft Auto Online: Shark Cash Cards', '/buy-gta-v-shark-cash-cards'], ['Red Dead Online: Gold Bars', '/buy-red-dead-online-gold-bars']] },
  { label: 'GTA+', href: '/game/gta-plus' },
  { label: 'Merchandise', href: '/merchandise', items: [['View All Merchandise', '/merchandise'], ['Apparel', SUB('apparel')], ['Accessories', SUB('accessories')], ['Collectibles', SUB('collectible')]] },
  { label: 'Featured', href: '/new-arrivals', items: [['New Arrivals', '/new-arrivals'], ['Shop Grand Theft Auto VI Collection', '/grand-theft-auto-vi-collection'], ['Shop Red Dead Redemption', '/red-dead-redemption-collection'], ['Shop Grand Theft Auto', '/grand-theft-auto-collection'], ['Shop Rockstar Games', '/rockstar-collection']] },
]

// Footer link row. Off-site destinations (rockstargames.com, take2games.com) are local summary pages.
export const FOOTER = [['Rockstar Support', '/support'], ['Privacy Policy', '/privacy'], ['Cookie Policy', '/cookie-policy'], ['Terms of Service', '/legal'], ['Do Not Sell or Share My Personal Information', '/ccpa'], ['Refunds', '/refund-and-return-policy'], ['Cookie Settings', '/cookie-settings']]

// ---------- read-only title pages ----------
const NOT_SOLD = 'This title is currently unavailable to purchase on the Rockstar Store. Check back soon, or pre-order Grand Theft Auto VI today.'
const PLATFORMS_PC = ['Rockstar Games Launcher']
const SHARK = ['Megalodon Shark Cash Card (PC)', 'Whale Shark Cash Card (PC)', 'Great White Shark Cash Card (PC)', 'Bull Shark Cash Card (PC)', 'Tiger Shark Cash Card (PC)']
const GOLD = ['350 Gold Bars', '245 Gold Bars', '150 Gold Bars', '55 Gold Bars', '25 Gold Bars']
const LANGS = 'English, French, Italian, German, Spanish, Portuguese (Brazil), Russian, Polish, Japanese, Korean, Chinese (Simplified), Chinese (Traditional)'
const STD_FAQ = [['Which platform does the Rockstar Store sell this title for?', 'The Rockstar Store sells the PC version for the Rockstar Games Launcher. Console versions are bought from the PlayStation Store or Microsoft Store.'], ['Do I need a Rockstar Games account?', 'Yes. PC purchases are added to the library of the Rockstar Games account you are signed in with.'], ['Where can I find my receipt?', 'Receipts for all purchases are sent to the email address associated with your Rockstar Games account or specified during Guest checkout.']]

export const TITLES = {
  'buy-gta-v': { title: 'Grand Theft Auto V', h1: 'Buy Grand Theft Auto V and Grand Theft Auto Online', cover: ['#0f3d2e', '#3fa66b'], platforms: ['Rockstar Games Launcher', 'PlayStation 5', 'Xbox Series X|S'],
    details: 'When a young street hustler, a retired bank robber and a terrifying psychopath find themselves entangled with some of the most frightening and deranged elements of the criminal underworld, the U.S. government and the entertainment industry, they must pull off a series of dangerous heists to survive in a ruthless city in which they can trust nobody — least of all each other. The PC purchase includes both GTAV Enhanced and GTAV Legacy.',
    features: ['Welcome to Los Santos', 'Stunning Visuals', 'Faster Loading', 'Immersive Controls', '3D Audio', 'Grand Theft Auto Online', 'Exclusive Content', 'New Career Builder', 'New Menu Design', 'Access to All Current and Previous Updates'],
    addons: ['Buy Shark Cash Cards for PC', SHARK, '/buy-gta-v-shark-cash-cards'], media: ['Videos', 'Screenshots'], requirements: ['GTAV Enhanced System Requirements', 'GTAV Legacy System Requirements'], faq: STD_FAQ },
  'buy-red-dead-redemption-2': { title: 'Red Dead Redemption 2', h1: 'Buy Red Dead Redemption 2', cover: ['#3a0b0b', '#c0392b'], platforms: PLATFORMS_PC,
    details: 'America, 1899. Arthur Morgan and the Van der Linde gang are outlaws on the run. With federal agents and the best bounty hunters in the nation massing on their heels, the gang must rob, steal and fight their way across the rugged heartland of America in order to survive.',
    editions: ['Red Dead Redemption 2: Ultimate Edition', 'Red Dead Redemption 2', 'Red Dead Online'],
    features: ['Live In A Gang Of Outlaws Fighting To Survive', 'The World of Red Dead Online', 'Step into a Frontier Pursuits Role'],
    addons: ['Buy Gold Bars for PC', GOLD, '/buy-red-dead-online-gold-bars'], media: ['Videos', 'Screenshots'], languages: true, requirements: ['System Requirements'], faq: STD_FAQ },
  'buy-red-dead-redemption': { title: 'Red Dead Redemption', h1: 'Buy Red Dead Redemption', cover: ['#3b2208', '#d98c2b'], platforms: PLATFORMS_PC,
    details: 'Experience the epic open world story of John Marston, a former outlaw forced to hunt down the members of his old gang, along with the Undead Nightmare expansion, now on PC.',
    media: ['Screenshots and Videos'], languages: true, requirements: ['System Requirements'], faq: STD_FAQ },
  'buy-bully-scholarship-edition': { title: 'Bully: Scholarship Edition', h1: 'Buy Bully: Scholarship Edition', cover: ['#3b3b0b', '#c9b037'], platforms: PLATFORMS_PC,
    details: 'As mischievous schoolboy Jimmy Hopkins, stand up to bullies, get picked on by teachers, play pranks, win or lose the girl and navigate the social hierarchy at the worst school around, Bullworth Academy.',
    media: ['Screenshots and Videos'], languages: true, requirements: ['System Requirements'], faq: STD_FAQ },
  'buy-grand-theft-auto-the-trilogy-the-definitive-edition': { title: 'Grand Theft Auto: The Trilogy – The Definitive Edition', h1: 'Buy Grand Theft Auto: The Trilogy – The Definitive Edition', cover: ['#1d2a4a', '#e07a3f'], platforms: PLATFORMS_PC,
    details: 'Three iconic cities, three epic stories. Play the genre-defining classics Grand Theft Auto III, Grand Theft Auto: Vice City and Grand Theft Auto: San Andreas, updated for a new generation.',
    media: ['Screenshots and Videos'], languages: true, requirements: ['System Requirements'], faq: STD_FAQ },
  'buy-la-noire': { title: 'L.A. Noire', h1: 'Buy L.A. Noire', cover: ['#1f1f1f', '#8a7a5a'], platforms: PLATFORMS_PC,
    details: 'Amid the post-war boom of Hollywood’s Golden Age, Cole Phelps, an LAPD detective, is thrown into a dark world of corruption, murder and conspiracy. Use real investigative techniques to solve a series of crimes in 1940s Los Angeles.',
    media: ['Screenshots and Videos'], languages: true, requirements: ['System Requirements'], faq: STD_FAQ },
  'buy-max-payne-3': { title: 'Max Payne 3', h1: 'Buy Max Payne 3', cover: ['#2b2b2b', '#b8b8b8'], platforms: PLATFORMS_PC,
    details: 'Years after the events of the original games, Max Payne takes a job in São Paulo, Brazil, protecting the family of a wealthy real estate mogul — and fights to uncover the truth as everything goes wrong.',
    media: ['Screenshots and Videos'], languages: true, requirements: ['System Requirements'], faq: STD_FAQ },
  'buy-grand-theft-auto-iv': { title: 'Grand Theft Auto IV: Complete Edition', h1: 'Buy Grand Theft Auto IV: Complete Edition', cover: ['#2d3640', '#9fb3c8'], platforms: PLATFORMS_PC,
    details: 'Experience Niko Bellic’s American dream in Liberty City, along with both episodic expansions, The Lost and Damned and The Ballad of Gay Tony, in one complete package.',
    media: ['Screenshots and Videos'], languages: true, requirements: ['System Requirements'], faq: STD_FAQ },
  'buy-grand-theft-auto-the-trilogy': { title: 'Grand Theft Auto: The Trilogy', h1: 'Buy Grand Theft Auto: The Trilogy', cover: ['#402020', '#e8b04a'], platforms: PLATFORMS_PC,
    details: 'The original versions of Grand Theft Auto III, Grand Theft Auto: Vice City and Grand Theft Auto: San Andreas.',
    media: ['Screenshots and Videos'], languages: true, requirements: ['System Requirements'], faq: STD_FAQ },
}
// /view-all-games order on the real store.
export const ALL_GAMES = ['buy-gta-v', 'buy-red-dead-redemption-2', 'buy-red-dead-redemption', 'buy-grand-theft-auto-the-trilogy-the-definitive-edition', 'buy-la-noire', 'buy-bully-scholarship-edition', 'buy-max-payne-3', 'buy-grand-theft-auto-iv', 'buy-grand-theft-auto-the-trilogy']

// Short descriptions under each Key Features heading, in the store's own words.
const FEATURE_COPY = {
  'Welcome to Los Santos': 'Experience the story of Franklin, Michael and Trevor across the sprawling city of Los Santos and the surrounding Blaine County.',
  'Stunning Visuals': 'Ray-traced shadows, reflections and ambient occlusion, plus AMD FSR and NVIDIA DLSS support on PC.',
  'Faster Loading': 'Get into the action faster, with DirectStorage support on compatible PCs.',
  'Immersive Controls': 'Full controller support with refined driving, aiming and camera controls.',
  '3D Audio': 'Hear Los Santos all around you with Dolby Atmos and 3D audio support.',
  'Grand Theft Auto Online': 'Rise through the criminal underworld of Los Santos and Blaine County with up to 30 players.',
  'Exclusive Content': 'Hao’s Special Works vehicle upgrades, new vehicles and more, exclusive to GTAV Enhanced.',
  'New Career Builder': 'Jump-start a life of crime in GTA Online: choose a business, get GTA$4,000,000 and a high-end apartment, vehicle and weapons.',
  'New Menu Design': 'A redesigned menu that gets you into Story Mode or GTA Online in a couple of clicks.',
  'Access to All Current and Previous Updates': 'Every GTA Online update since launch, from Heists and Nightclubs to The Cayo Perico Heist and beyond.',
  'Live In A Gang Of Outlaws Fighting To Survive': 'America, 1899. Arthur Morgan and the Van der Linde gang rob, steal and fight their way across the rugged heartland to survive.',
  'The World of Red Dead Online': 'Hunt, fish, trade and fight your way across a living frontier, alone or with a posse of up to seven players.',
  'Step into a Frontier Pursuits Role': 'Make a living as a Bounty Hunter, Trader, Collector, Moonshiner or Naturalist, each with its own progression and rewards.',
}

// PC system requirements as listed on each title's store page.
const SPEC = (os, cpu, ram, gpu, disk) => [['OS', os], ['Processor', cpu], ['Memory', ram], ['Graphics', gpu], ['Storage', disk]]
const REQUIREMENTS = {
  'GTAV Enhanced System Requirements': [SPEC('Windows 10 64-bit (22H2)', 'Intel Core i7-4770 | AMD FX-9590', '8 GB', 'NVIDIA GeForce GTX 1630 (4 GB) | AMD Radeon RX 6400 (4 GB)', '105 GB SSD'), SPEC('Windows 11 64-bit', 'Intel Core i5-9600K | AMD Ryzen 5 3600', '16 GB', 'NVIDIA GeForce RTX 3060 (8 GB) | AMD Radeon RX 6600 XT (8 GB)', '105 GB SSD')],
  'GTAV Legacy System Requirements': [SPEC('Windows 10 64-bit', 'Intel Core 2 Quad Q6600 @ 2.40 GHz | AMD Phenom 9850 @ 2.5 GHz', '4 GB', 'NVIDIA 9800 GT (1 GB) | AMD HD 4870 (1 GB)', '120 GB'), SPEC('Windows 10 64-bit', 'Intel Core i5 3470 @ 3.2 GHz | AMD X8 FX-8350 @ 4 GHz', '8 GB', 'NVIDIA GTX 660 (2 GB) | AMD HD 7870 (2 GB)', '120 GB')],
  'buy-red-dead-redemption-2': [SPEC('Windows 10 64-bit', 'Intel Core i5-2500K | AMD FX-6300', '8 GB', 'NVIDIA GeForce GTX 770 (2 GB) | AMD Radeon R9 280 (3 GB)', '150 GB'), SPEC('Windows 10 64-bit', 'Intel Core i7-4770K | AMD Ryzen 5 1500X', '12 GB', 'NVIDIA GeForce GTX 1060 (6 GB) | AMD Radeon RX 480 (4 GB)', '150 GB')],
  'buy-red-dead-redemption': [SPEC('Windows 10 64-bit', 'Intel Core i7-4770K | AMD Ryzen 5 1500X', '8 GB', 'NVIDIA GeForce GTX 960 (2 GB) | AMD Radeon RX 570 (4 GB)', '12 GB'), SPEC('Windows 11 64-bit', 'Intel Core i5-8600K | AMD Ryzen 5 3600', '16 GB', 'NVIDIA GeForce GTX 1070 (8 GB) | AMD Radeon RX 6600 (8 GB)', '12 GB')],
  'buy-bully-scholarship-edition': [SPEC('Windows 10 64-bit', 'Intel Pentium 4 3.0 GHz | AMD Athlon 64 3000+', '1 GB', 'NVIDIA GeForce 6800 (128 MB) | ATI Radeon X1300 (128 MB)', '4.7 GB'), SPEC('Windows 10 64-bit', 'Intel Core 2 Duo 2.0 GHz | AMD Athlon 64 X2', '2 GB', 'NVIDIA GeForce 7900 (256 MB) | ATI Radeon X1800 (256 MB)', '4.7 GB')],
  'buy-grand-theft-auto-the-trilogy-the-definitive-edition': [SPEC('Windows 10 64-bit', 'Intel Core i5-3470 | AMD FX-8350', '8 GB', 'NVIDIA GeForce GTX 760 (2 GB) | AMD Radeon R9 280 (3 GB)', '45 GB'), SPEC('Windows 10 64-bit', 'Intel Core i5-6600K | AMD Ryzen 5 2600', '16 GB', 'NVIDIA GeForce GTX 970 (4 GB) | AMD Radeon R9 390 (8 GB)', '45 GB')],
  'buy-la-noire': [SPEC('Windows 10 64-bit', 'Intel Dual Core 2.2 GHz | AMD Dual Core 2.4 GHz', '2 GB', 'NVIDIA GeForce 8600 GT (512 MB) | AMD Radeon HD 3000 (512 MB)', '16 GB'), SPEC('Windows 10 64-bit', 'Intel Quad Core 2.66 GHz | AMD Quad Core 3.2 GHz', '4 GB', 'NVIDIA GeForce GTX 280 (1 GB) | AMD Radeon HD 6850 (1 GB)', '16 GB')],
  'buy-max-payne-3': [SPEC('Windows 10 64-bit', 'Intel Dual Core 2.4 GHz | AMD Dual Core 2.6 GHz', '2 GB', 'NVIDIA GeForce 8600 GT (512 MB) | AMD Radeon HD 3400 (512 MB)', '35 GB'), SPEC('Windows 10 64-bit', 'Intel Core i7 860 2.8 GHz | AMD FX-8150 3.6 GHz', '3 GB', 'NVIDIA GeForce GTX 480 (1.5 GB) | AMD Radeon HD 5870 (1 GB)', '35 GB')],
  'buy-grand-theft-auto-iv': [SPEC('Windows 10 64-bit', 'Intel Core 2 Quad 2.4 GHz | AMD Phenom X3 2.15 GHz', '1.5 GB', 'NVIDIA GeForce 7900 (256 MB) | ATI Radeon X1900 (256 MB)', '22 GB'), SPEC('Windows 10 64-bit', 'Intel Core i5-2400 | AMD Phenom II X4 940', '4 GB', 'NVIDIA GeForce GTX 480 (1.5 GB) | AMD Radeon HD 5870 (1 GB)', '22 GB')],
  'buy-grand-theft-auto-the-trilogy': [SPEC('Windows 10 64-bit', 'Intel Pentium 4 1.5 GHz | AMD Athlon XP 1.5 GHz', '512 MB', 'DirectX 9 compatible (64 MB)', '7.2 GB'), SPEC('Windows 10 64-bit', 'Intel Core 2 Duo | AMD Athlon 64 X2', '2 GB', 'NVIDIA GeForce 8600 (256 MB) | ATI Radeon HD 2600 (256 MB)', '7.2 GB')],
}
const requirements = (slug, heading) => REQUIREMENTS[heading] || REQUIREMENTS[slug] || REQUIREMENTS['buy-red-dead-redemption-2']

const GTA_PLUS_FAQ = {
  'How can I become a GTA+ Member?': 'GTA+ is a monthly membership for GTA Online on PlayStation 5, Xbox Series X|S and GTAV Enhanced for PC. Join from the GTA+ page in GTA Online or through your platform store.',
  'What is included in the GTA+ Membership?': 'A monthly GTA$500,000 deposit, rotating monthly benefits in GTA Online, The Vinewood Club, member discounts and access to the GTA+ Games Library.',
  'Once I’m a GTA+ Member, how do I claim my Membership benefits for each Member-only GTA Online Event?': 'Sign in to GTA Online during the Event. Most benefits are delivered automatically; vehicles and items are claimed at the location shown in the GTA+ section of the pause menu.',
  'How can I cancel my GTA+ Membership?': 'Cancel the recurring subscription from the subscription settings of the platform account you joined with. Your membership stays active until the end of the current billing period.',
  'What happens to my GTA+ Membership benefits if I cancel my GTA+ Membership?': 'Items you already claimed stay in your account. Benefits that need an active membership, such as the GTA+ Games Library and The Vinewood Club, end with your billing period.',
  'When will I get my monthly GTA$500,000 bonus in GTA Online?': 'The GTA$500,000 bonus is deposited into your Maze Bank account within 72 hours of the start of each billing cycle.',
  'What are the benefits of GTA+ Shark Cash Cards?': 'GTA+ Members receive 15% bonus GTA$ on Shark Cash Cards bought during their membership.',
  'Are GTA Online benefits available on PlayStation 4, Xbox One, or for players of the Grand Theft Auto V Legacy version of GTA Online for PC?': 'No. GTA Online membership benefits are available on PlayStation 5, Xbox Series X|S and GTAV Enhanced for PC only.',
  'What happens if I don’t claim a particular benefit before the end of a Member-only Event?': 'Benefits that must be claimed are only available during their Event. Unclaimed benefits are not carried over to the next month.',
  'What games can I play with my GTA+ Membership?': 'The GTA+ Games Library includes Grand Theft Auto V, Red Dead Redemption, the Grand Theft Auto Trilogy – The Definitive Edition, Bully, L.A. Noire and more. Titles rotate over time.',
  'What happens when a game that is included with GTA+ is leaving?': 'Games leaving the library are announced in advance. Purchase the game to keep playing; your save progress is kept.',
  'How can I use my 20% Member discount to purchase select Rockstar Games titles?': 'Sign in with your Rockstar Games account while your membership is active. The member price is shown at checkout on eligible titles.',
}

// Video and screenshot tiles on a title page: crops of the title's illustrated scene artwork.
const VIDEO_TITLES = { 'buy-gta-v': ['Grand Theft Auto V: Expanded & Enhanced Trailer', 'GTA Online: Career Builder', 'GTAV Enhanced PC Trailer'] }
const CROPS = [['50% 45%', 1.18], ['20% 60%', 1.4], ['80% 35%', 1.65]]
function mediaTile(slug, t, kind, i) {
  const game = shelfGame(slug)
  if (!game) return `<span class="rp-shot" style="--c1:${t.cover[0]};--c2:${t.cover[1]}" aria-hidden="true">${kind === 'Videos' ? '▶' : ''}</span>`
  const video = kind === 'Videos' || (kind === 'Screenshots and Videos' && i === 0)
  const caption = video ? (VIDEO_TITLES[slug]?.[i] || `${t.title} Trailer`) : ''
  const [pos, zoom] = CROPS[i % CROPS.length]
  return `<figure class="rp-shot rp-shot-art"><img src="/rockstar-store/shelf-art/${encodeURIComponent(game.id)}/2.svg" alt="${esc(caption || `${t.title} screenshot`)}" loading="lazy" style="object-position:${pos};transform:scale(${zoom})">${video ? `<span class="rp-play" aria-hidden="true">▶</span><figcaption>${esc(caption)}</figcaption>` : ''}</figure>`
}

const cover = (title, [a, b], small = '') => `<span class="rp-cover" style="--c1:${a};--c2:${b}" aria-hidden="true"><b>R<i>*</i></b><span>${esc(title)}</span>${small ? `<small>${esc(small)}</small>` : ''}</span>`
// A link card for a title or category the reference catalog does not sell: no price, no purchase control.
export const linkCard = (base, href, title, colors, note = 'View details') => `<article class="rs-tile rp-link-tile"><a class="rs-tile-visual" href="${base}${href}">${cover(title, colors)}</a><h3><a href="${base}${href}">${esc(title)}</a></h3><p class="rs-fine">${esc(note)}</p></article>`
const titleCard = (base, slug) => shelfGame(slug) ? tile(base, shelfGame(slug)) : linkCard(base, `/game/${slug}`, TITLES[slug].title, TITLES[slug].cover, 'PC · Rockstar Games Launcher')
const gtaviTile = base => tile(base, GAME)
const unavailable = (base, text = NOT_SOLD) => `<div class="rp-unavailable" role="note"><b>Currently unavailable</b><p>${esc(text)}</p><a class="rs-btn rs-btn-pill rs-btn-sm" href="${base}/game/buy-gta-vi">Shop Grand Theft Auto VI</a></div>`

export function titlePage(base, slug, buy = '') {
  const t = TITLES[slug]
  const nav = [['game-details', 'Game Details'], t.editions && ['compare-editions', 'Compare Editions'], t.features && ['key-features', 'Key Features'], t.media && ['media', t.media[0]], t.requirements && ['system-requirements', 'System Requirements'], ['faq', 'FAQ']].filter(Boolean)
  return `<section class="rp-title-hero" style="--c1:${t.cover[0]};--c2:${t.cover[1]}"><div class="rp-title-copy"><h1>${esc(t.h1)}</h1>
  <div class="rp-platforms"><span class="rs-platform-label">Platform</span>${t.platforms.map((p, i) => `<span class="rp-chip${i === 0 ? ' is-selected' : ''}">${esc(p)}</span>`).join('')}</div>
  ${buy || unavailable(base)}</div>${cover(t.title, t.cover)}</section>
<nav class="rs-subnav" aria-label="Page sections">${nav.map(([id, l]) => `<a href="#${id}">${l}</a>`).join('')}</nav>
<div class="rs-game-body">
<section id="game-details" class="rs-section"><h2>Game Details</h2><p>${esc(t.details)}</p><dl class="rs-meta"><div><dt>Developer</dt><dd>Rockstar Games</dd></div><div><dt>Publisher</dt><dd>Rockstar Games</dd></div><div><dt>Platform</dt><dd>${esc(t.platforms.join(', '))}</dd></div></dl></section>
${t.editions ? `<section id="compare-editions" class="rs-section"><h2>Compare Editions</h2><div class="rp-cards">${t.editions.map(e => `<article class="rp-card"><p class="rs-kicker">${esc(t.title)}</p><h3>${esc(e)}</h3><p class="rs-fine">${buy ? "PC · Rockstar Games Launcher. Choose an edition at the top of this page." : "Currently unavailable."}</p></article>`).join('')}</div></section>` : ''}
${t.features ? `<section id="key-features" class="rs-section"><h2>Key Features</h2><div class="rp-cards">${t.features.map(f => `<article class="rp-card"><h3>${esc(f)}</h3>${FEATURE_COPY[f] ? `<p>${esc(FEATURE_COPY[f])}</p>` : ''}</article>`).join('')}</div></section>` : ''}
${t.addons ? `<section class="rs-section"><div class="rs-section-head"><h2>${esc(t.addons[0])}</h2><a href="${base}${t.addons[2]}">View all</a></div>${addonTiles(base, t.addons[2]) || `<ul class="rp-list">${t.addons[1].map(n => `<li>${esc(n)}</li>`).join('')}</ul><p class="rs-fine">Currently unavailable.</p>`}</section>` : ''}
<section id="media" class="rs-section">${t.media.map(m => `<h2>${esc(m)}</h2><div class="rp-media">${[0, 1, 2].map(i => mediaTile(slug, t, m, i)).join('')}</div>`).join('')}</section>
${t.languages ? `<section class="rs-section"><h2>Supported Languages</h2><p class="rs-fine">${LANGS}</p></section>` : ''}
<section id="system-requirements" class="rs-section">${t.requirements.map(r => `<h2>${esc(r)}</h2><div class="rp-cards rp-reqs">${['Minimum', 'Recommended'].map((level, i) => `<article class="rp-card"><h3>${level}</h3><dl class="rp-req-list">${requirements(slug, r)[i].map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl></article>`).join('')}</div>`).join('')}</section>
<section id="faq" class="rs-section"><h2>FAQ</h2>${t.faq.map(([q, a]) => `<details class="rs-faq"><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</section>
</div>`
}

export function gtaPlusPage(base) {
  const sections = [['Cash Every Month', 'A monthly bonus of GTA$500,000 deposited into your Maze Bank account, plus accelerated GTA$ from select GTA Online missions and modes.'], ['The Vinewood Club', 'Claim a vehicle each month at the Vinewood Car Club showroom, buy member-discounted vehicles from a rotating selection, and store up to 100 Personal Vehicles at The Vinewood Club Garage with its Vehicle Workshop.'], ['New Monthly Benefits', 'Rotating monthly benefits such as GTA$ and RP multipliers, Chameleon Paint schemes, property upgrades and apparel.'], ['And More...', 'CEO/VIP abilities at no cost from the Interaction Menu, shorter cooldowns and waived costs for Downtown Cab Co. taxis, and a Gun Van with special weapons and discounts that always shows on the map.']]
  const library = ['Grand Theft Auto V', 'Red Dead Redemption', 'Grand Theft Auto: Vice City – The Definitive Edition', 'Grand Theft Auto III – The Definitive Edition', 'Grand Theft Auto: San Andreas – The Definitive Edition', 'Bully', 'L.A. Noire', 'Grand Theft Auto: Liberty City Stories', 'Grand Theft Auto: Chinatown Wars']
  const faq = ['How can I become a GTA+ Member?', 'What is included in the GTA+ Membership?', 'Once I’m a GTA+ Member, how do I claim my Membership benefits for each Member-only GTA Online Event?', 'How can I cancel my GTA+ Membership?', 'What happens to my GTA+ Membership benefits if I cancel my GTA+ Membership?', 'When will I get my monthly GTA$500,000 bonus in GTA Online?', 'What are the benefits of GTA+ Shark Cash Cards?', 'Are GTA Online benefits available on PlayStation 4, Xbox One, or for players of the Grand Theft Auto V Legacy version of GTA Online for PC?', 'What happens if I don’t claim a particular benefit before the end of a Member-only Event?', 'What games can I play with my GTA+ Membership?', 'What happens when a game that is included with GTA+ is leaving?', 'How can I use my 20% Member discount to purchase select Rockstar Games titles?']
  return `<section class="rp-title-hero rp-gtaplus"><div class="rp-title-copy"><p class="rp-gtaplus-logo">GTA<b>+</b></p><h1>Join to claim special GTA Online benefits, access a selection of Rockstar Games titles, and much more</h1>${unavailable(base, 'GTA+ memberships are currently unavailable to purchase on the Rockstar Store. Existing members can manage their membership from their platform account.')}</div></section>
<nav class="rs-subnav" aria-label="Page sections"><a href="#key-features">Key Features</a><a href="#library">GTA+ Games Library</a><a href="#shark-cards">Member-Only Shark Cards</a><a href="#faq">FAQ</a></nav>
<div class="rs-game-body"><section id="key-features" class="rs-section"><h2>Key Features</h2><div class="rp-cards">${sections.map(([h, p]) => `<article class="rp-card"><h3>${h}</h3><p>${p}</p></article>`).join('')}</div></section>
<section id="library" class="rs-section"><h2>GTA+ Games Library</h2><ul class="rp-list">${library.map(g => `<li>${esc(g)}</li>`).join('')}</ul></section>
<section id="shark-cards" class="rs-section"><h2>Member-Only Shark Cards</h2><p>GTA+ Members get Shark Cards with 15% bonus GTA$. <a href="${base}/buy-gta-v-shark-cash-cards">See Shark Cash Cards</a></p></section>
<section id="faq" class="rs-section"><h2>FAQ</h2>${faq.map(q => `<details class="rs-faq"><summary>${esc(q)}</summary><p>${esc(GTA_PLUS_FAQ[q] || 'See Rockstar Support for details about your GTA+ Membership.')}</p></details>`).join('')}</section></div>`
}

export function currencyPage(base, kind) {
  const shark = kind === 'shark'
  const title = shark ? 'Grand Theft Auto Online: Shark Cash Cards' : 'Red Dead Online: Gold Bars'
  const colors = shark ? ['#06303d', '#21a0c6'] : ['#3d2a06', '#e3b23c']
  const href = shark ? '/buy-gta-v-shark-cash-cards' : '/buy-red-dead-online-gold-bars'
  const tiles = addonTiles(base, href)
  return `<section class="rp-title-hero" style="--c1:${colors[0]};--c2:${colors[1]}"><div class="rp-title-copy"><p class="rs-eyebrow">GAME ADD-ONS</p><h1>${title}</h1><h2>${shark ? 'Shark Cards' : 'Gold Bars'}</h2><p>${shark ? 'Purchase GTA$ for Grand Theft Auto Online on PC. Requires Grand Theft Auto V for PC and a Rockstar Games account.' : 'Purchase Gold Bars for Red Dead Online on PC. Requires Red Dead Redemption 2 or Red Dead Online for PC and a Rockstar Games account.'}</p>${tiles ? `<p class="rs-fine">PC only. Currency is added to the Rockstar Games account you sign in with at checkout.</p><a class="rs-btn rs-btn-pill" href="#buy">${shark ? 'Choose a Shark Card' : 'Choose Gold Bars'}</a>` : unavailable(base, 'In-game currency for PC is currently unavailable to purchase on the Rockstar Store.')}</div>${cover(shark ? 'Shark Cards' : 'Gold Bars', colors)}</section>
<div class="rs-game-body"><section class="rs-section" id="buy"><h2>${shark ? 'Buy Shark Cash Cards for PC' : 'Buy Gold Bars for PC'}</h2>${tiles || `<div class="rs-grid">${(shark ? SHARK : GOLD).map(n => `<article class="rs-tile rp-link-tile">${cover(n, colors, 'PC')}<h3>${esc(n)}</h3><p class="rs-fine">PC · Currently unavailable</p></article>`).join('')}</div>`}</section></div>`
}

// ---------- store assortment helpers (shelf.js; empty in fixture mode) ----------
export const shelfOf = (collection, category) => SHELF_ITEMS.filter(p => p.collections.includes(collection) && (!category || p.category === category))
export const newArrivals = () => SHELF_ITEMS.filter(p => p.collections.includes('new-arrivals'))
const shelfGame = slug => SHELF_ITEMS.find(p => p.titleSlug === slug)
// Priced add-on tiles for the Shark Card / Gold Bar pages and the GTA V / RDR2 add-on sections.
export function addonTiles(base, href) {
  const list = shelfOf(href.includes('shark') ? 'shark-cards' : 'gold-bars')
  return list.length ? `<div class="rs-grid rp-grid">${list.map(p => tile(base, p)).join('')}</div>` : ''
}
// Buy panel used on title pages for games the assortment sells (replaces the read-only notice).
export function titleBuyBox(base, p, variantId = '', error = '') {
  const v = p.variants ? (p.variants.find(x => x.id === variantId) || p.variants[0]) : null
  return `<div class="rp-buy" data-shelf-buy><div class="rs-price rs-price-lg">${money(v?.price ?? p.price)}</div>${p.variants ? `<fieldset class="rs-variants"><legend>${esc(p.optionLabel)}: ${esc(v.label)}</legend>${p.variants.map(o => `<a href="${base}${p.path}?variant=${o.id}" aria-pressed="${o.id === v.id}">${esc(o.label)} · ${money(o.price)}</a>`).join('')}</fieldset>` : ''}${error ? `<p role="alert" class="rs-error">${esc(error)}</p>` : ''}<form class="rs-buy-form" method="post" action="${base}/cart/add"><input type="hidden" name="sku" value="${esc(p.sku)}">${v ? `<input type="hidden" name="variant" value="${esc(v.id)}">` : ''}<div class="rs-buy-btns"><button class="rs-btn rs-btn-primary" formaction="${base}/buy-now">Buy Now</button><button class="rs-btn rs-btn-outline">Add to Cart</button></div></form><form method="post" action="${base}/wishlist"><input type="hidden" name="sku" value="${esc(p.sku)}"><button class="rs-btn rs-btn-text rs-wishlist-action">♡ Add to Wishlist</button></form><p class="rs-fine">PC · Rockstar Games Launcher. Added to the Rockstar Games account you sign in with at checkout. Console versions are sold by the PlayStation Store and Microsoft Store.</p></div>`
}

// ---------- listing pages ----------
const empty = (base, what) => `<div class="rp-empty"><p class="rs-empty">0 results</p><p>${esc(what)} are currently out of stock. Check back soon.</p><a href="${base}/game/buy-gta-vi">Shop Grand Theft Auto VI</a></div>`
const section = (base, heading, body, href) => `<section class="rs-carousel"><div class="rs-section-head"><h2>${esc(heading)}</h2>${href ? `<a href="${base}${href}">See all</a>` : ''}</div>${body}</section>`
const grid = cards => `<div class="rs-grid rp-grid">${cards.join('')}</div>`

export function collectionPage(base, { eyebrow = 'Collections', title, banner, art = 'GTAVI_PreOrderWebstore_HeroBackground_3840x1646_R03.jpg', sections }) {
  return `<section class="rp-collection-hero" style="background-image:linear-gradient(90deg,rgba(0,0,0,.85),rgba(0,0,0,.25)),url(${REF}${art})"><p class="rs-eyebrow">${esc(eyebrow)}</p><h1>${esc(title)}</h1>${banner ? `<p>${esc(banner)}</p>` : ''}</section>
${sections.map(([heading, body, href]) => section(base, heading, body, href)).join('')}`
}

export function collectionRoutes(base) {
  // Product grids from the store assortment; fixture mode has no assortment and keeps the empty state.
  const merch = (name, list = []) => list.length ? grid(list.map(p => tile(base, p))) : empty(base, `${name} products`)
  const na = newArrivals()
  const games = slugs => grid(slugs.map(s => titleCard(base, s)))
  return {
    '/new-arrivals': ['New Arrivals', { title: 'New Arrivals', art: '01_-_Vice_City_01.jpg', sections: [['New Arrivals', merch('New arrival', na.filter(p => p.section === 'Gear').slice(0, 8)), SUB('apparel')], ['Apparel', merch('Apparel', na.filter(p => p.category === 'apparel')), SUB('apparel')], ['Accessories', merch('Accessories', na.filter(p => p.category === 'accessories')), SUB('accessories')], ['Collectibles', merch('Collectible', na.filter(p => p.category === 'collectibles')), SUB('collectible')]].filter(([h, , ], i) => i === 0 || na.length) }],
    '/grand-theft-auto-vi-collection': ['Grand Theft Auto VI Collection', { eyebrow: 'Featured', title: 'Grand Theft Auto VI Collection', banner: 'Apparel, accessories and collectibles from Leonida.', art: '04_-_Leonida_Keys_01.jpg', sections: [['Grand Theft Auto VI', grid([gtaviTile(base)])], ['Apparel', merch('Apparel', shelfOf('gtavi', 'apparel')), SUB('apparel')], ['Accessories', merch('Accessories', shelfOf('gtavi', 'accessories')), SUB('accessories')], ['Collectibles', merch('Collectible', shelfOf('gtavi', 'collectibles')), SUB('collectible')]] }],
    '/grand-theft-auto-collection': ['Grand Theft Auto', { title: 'Grand Theft Auto', art: '02_-_Jason_Duval_01.jpg', sections: [['Shop Grand Theft Auto VI', grid([gtaviTile(base)])], ['Shop Grand Theft Auto V', grid([titleCard(base, 'buy-gta-v')])], ['Shop Grand Theft Auto Trilogy', grid([titleCard(base, 'buy-grand-theft-auto-the-trilogy-the-definitive-edition'), titleCard(base, 'buy-grand-theft-auto-the-trilogy')])], ['Buy Shark Cash Cards for PC', addonTiles(base, '/buy-gta-v-shark-cash-cards') || grid([linkCard(base, '/buy-gta-v-shark-cash-cards', 'Grand Theft Auto Online: Shark Cash Cards', ['#06303d', '#21a0c6'], 'PC add-on')]), '/buy-gta-v-shark-cash-cards'], ['Games', grid([gtaviTile(base), titleCard(base, 'buy-gta-v'), titleCard(base, 'buy-grand-theft-auto-iv')]), '/view-all-games'], ...(SHELF_ITEMS.length ? [['Apparel', merch('Apparel', shelfOf('gta', 'apparel')), SUB('apparel')], ['Accessories', merch('Accessories', shelfOf('gta', 'accessories')), SUB('accessories')], ['Collectibles', merch('Collectible', shelfOf('gta', 'collectibles')), SUB('collectible')]] : [])] }],
    '/red-dead-redemption-collection': ['Red Dead Redemption', { title: 'Red Dead Redemption', art: '08_-_Grassrivers_03.jpg', sections: [['Games', SHELF_ITEMS.length ? grid(shelfOf('rdr', 'full-game').map(p => tile(base, p))) : games(['buy-red-dead-redemption-2', 'buy-red-dead-redemption']), '/view-all-games'], ['Buy Gold Bars for PC', addonTiles(base, '/buy-red-dead-online-gold-bars') || grid([linkCard(base, '/buy-red-dead-online-gold-bars', 'Red Dead Online: Gold Bars', ['#3d2a06', '#e3b23c'], 'PC add-on')]), '/buy-red-dead-online-gold-bars'], ['Apparel', merch('Red Dead Redemption apparel', shelfOf('rdr', 'apparel')), SUB('apparel')], ['Collectibles', merch('Red Dead Redemption collectible', shelfOf('rdr', 'collectibles')), SUB('collectible')], ...(SHELF_ITEMS.length ? [['Accessories', merch('Accessories', shelfOf('rdr', 'accessories')), SUB('accessories')]] : [])] }],
    '/rockstar-collection': ['Rockstar Collection', { title: 'Rockstar Games', art: '06_-_Cal_Hampton_03.jpg', sections: [['Games', games(['buy-bully-scholarship-edition', 'buy-max-payne-3', 'buy-la-noire']), '/view-all-games'], ['Apparel', merch('Rockstar Games apparel', shelfOf('rockstar', 'apparel')), SUB('apparel')], ['Collectibles', merch('Rockstar Games collectible', shelfOf('rockstar', 'collectibles')), SUB('collectible')], ['Accessories', merch('Rockstar Games accessory', shelfOf('rockstar', 'accessories')), SUB('accessories')]] }],
  }
}

export function allGamesPage(base) {
  const extra = SHELF_ITEMS.filter(p => p.section === 'Games' && !ALL_GAMES.includes(p.titleSlug))
  return `<div class="rs-listing"><p class="rs-eyebrow">Games</p><h1>All Games</h1>${grid([gtaviTile(base), ...ALL_GAMES.map(s => titleCard(base, s)), ...extra.map(p => tile(base, p))])}</div>`
}
export function addOnsPage(base) {
  const sold = SHELF_ITEMS.filter(p => p.section === 'Add-Ons')
  if (sold.length) return `<div class="rs-listing"><p class="rs-eyebrow">Game Add-Ons</p><h1>Game Add-Ons for PC</h1><section class="rs-section"><div class="rs-section-head"><h2>Grand Theft Auto Online: Shark Cash Cards</h2><a href="${base}/buy-gta-v-shark-cash-cards">View all</a></div>${grid(sold.filter(p => p.collections.includes('gta')).map(p => tile(base, p)))}</section><section class="rs-section"><div class="rs-section-head"><h2>Red Dead Online: Gold Bars</h2><a href="${base}/buy-red-dead-online-gold-bars">View all</a></div>${grid(sold.filter(p => p.collections.includes('rdr')).map(p => tile(base, p)))}</section><section class="rs-section"><h2>GTA+</h2>${grid([linkCard(base, '/game/gta-plus', 'GTA+', ['#3d0636', '#e33caf'], 'Membership · PlayStation 5 and Xbox Series X|S')])}</section></div>`
  return `<div class="rs-listing"><p class="rs-eyebrow">Game Add-Ons</p><h1>Game Add-Ons for PC</h1>${grid([linkCard(base, '/buy-gta-v-shark-cash-cards', 'Grand Theft Auto Online: Shark Cash Cards', ['#06303d', '#21a0c6'], 'PC add-on'), linkCard(base, '/buy-red-dead-online-gold-bars', 'Red Dead Online: Gold Bars', ['#3d2a06', '#e3b23c'], 'PC add-on'), linkCard(base, '/game/gta-plus', 'GTA+', ['#3d0636', '#e33caf'], 'Membership')])}</div>`
}

// ---------- homepage (reference catalog) ----------
const promo = (base, { eyebrow, heading, text, href, cta, img, cls = '' }) => `<section class="rp-promo ${cls}" style="background-image:linear-gradient(90deg,rgba(0,0,0,.9) 0%,rgba(0,0,0,.55) 45%,rgba(0,0,0,0) 100%),url(${REF}${img})"><div class="rp-promo-copy"><p class="rs-eyebrow">${esc(eyebrow)}</p><h2>${esc(heading)}</h2><p>${esc(text)}</p><a class="rs-btn rs-btn-pill" href="${base}${href}">${esc(cta)}</a></div></section>`
// Homepage product rows from the store assortment, in the order of the real homepage's shelves.
const pick = (ids) => ids.map(id => CATALOG.find(p => p.id === id)).filter(Boolean)
function assortmentRows(base, part) {
  const row = (heading, list, href) => list.length ? carouselShelf(base, heading, list, href) : ''
  if (part === 'top') return [
    row('New Arrivals', newArrivals().filter(p => p.section === 'Gear').slice(0, 12), '/new-arrivals'),
    row('Games', [GAME, ...ALL_GAMES.map(shelfGame).filter(Boolean)], '/view-all-games'),
    row('Popular Items', pick(['great-white-shark-cash-card', 'grand-theft-auto-v-hoodie', 'white-grand-theft-auto-vi-macca-the-gator-tee', 'red-dead-redemption-2-glass-candle-by-joya', '150-gold-bars', 'rockstar-baseball-cap-navy-and-white', 'black-grand-theft-auto-vi-logo-tee', 'rockstar-varsity-crewneck', 'grand-theft-auto-vi-keychain', 'bull-shark-cash-card', 'rockstar-logo-water-bottle', 'red-dead-redemption-2-logo-hoodie']), '/search?collection=best-sellers'),
  ].join('\n')
  if (part === 'middle') return [
    row('Apparel', SHELF_ITEMS.filter(p => p.category === 'apparel' && !p.collections.includes('gtavi')).slice(0, 12), SUB('apparel')),
    row('Game Add-Ons', SHELF_ITEMS.filter(p => p.section === 'Add-Ons'), '/game-add-ons'),
  ].join('\n')
  return [
    row('Red Dead Redemption Collection', shelfOf('rdr').filter(p => p.section === 'Gear').slice(0, 12), '/red-dead-redemption-collection'),
    row('Accessories', SHELF_ITEMS.filter(p => p.category === 'accessories' && !p.collections.includes('rdr')).slice(0, 12), SUB('accessories')),
    row('Collectibles', SHELF_ITEMS.filter(p => p.category === 'collectibles' && !p.collections.includes('gtavi')).slice(0, 12), SUB('collectible')),
  ].join('\n')
}
// Fixture-mode homepage rows (no assortment).
function oldRows(base, shelf) {
  return `${shelf('Games', [gtaviTile(base), ...ALL_GAMES.slice(0, 4).map(s => titleCard(base, s))], '/view-all-games')}
${shelf('New Arrivals', [linkCard(base, SUB('apparel'), 'Apparel', ['#30264a', '#ff7ab6'], 'Shop category'), linkCard(base, SUB('accessories'), 'Accessories', ['#173b4a', '#4fc3e0'], 'Shop category'), linkCard(base, SUB('collectible'), 'Collectibles', ['#4a3517', '#f2b84b'], 'Shop category')], '/new-arrivals')}
${shelf('Popular Items', [gtaviTile(base), linkCard(base, '/game/gta-plus', 'GTA+', ['#3d0636', '#e33caf'], 'Membership'), linkCard(base, '/buy-gta-v-shark-cash-cards', 'Grand Theft Auto Online: Shark Cash Cards', ['#06303d', '#21a0c6'], 'PC add-on'), linkCard(base, '/buy-red-dead-online-gold-bars', 'Red Dead Online: Gold Bars', ['#3d2a06', '#e3b23c'], 'PC add-on')])}`
}
export function referenceHome(base) {
  const shelf = (heading, cards, href) => `<section class="rs-carousel"><div class="rs-section-head"><h2>${esc(heading)}</h2>${href ? `<a href="${base}${href}">See all</a>` : ''}</div><div class="rs-grid rp-shelf">${cards.join('')}</div></section>`
  return `<h1 class="visually-hidden">Rockstar Store</h1><section class="rs-hero-carousel" aria-label="Featured campaigns" data-hero>
  <div class="rs-hero-track" id="rs-featured-track">
    <article class="rs-hero rp-hero" id="slide-1" aria-label="1 of 2" style="background-image:linear-gradient(90deg,rgba(0,0,0,.85),rgba(0,0,0,.1)),url(${REF}01_-_Vice_City_01.jpg)">
      <div class="rs-hero-text"><span class="rs-badge">COMING SOON</span><h2>Grand Theft Auto VI: The Goodtime State – Vice City&trade; Collection</h2><p>A premium Collector’s Box featuring all the essentials for a good time, inspired by Leonida’s hit TV show, Macca the Gator.</p>${SHELF_ITEMS.some(p => p.id === 'gtavi-goodtime-state-vice-city-collection') ? `<a class="rs-btn rs-btn-pill" href="${base}/merchandise/gtavi-goodtime-state-vice-city-collection">Pre-Order Now</a>` : `<a class="rs-btn rs-btn-pill" href="${base}/grand-theft-auto-vi-collection">View Collection</a>`}</div>
    </article>
    <article class="rs-hero rp-hero" id="slide-2" aria-label="2 of 2" style="background-image:linear-gradient(90deg,rgba(0,0,0,.85),rgba(0,0,0,.1)),url(${REF}GTAVI_PreOrderWebstore_HeroBackground_3840x1646_R03.jpg)">
      <div class="rs-hero-text"><span class="rs-badge">COMING SOON</span><h2>Grand Theft Auto VI</h2><p>Reserve today to unlock exclusive benefits and be ready to play at launch.</p><a class="rs-btn rs-btn-pill" href="${base}${GAME.path}">Pre-Order Now</a></div>
    </article>
  </div>
  <div class="rs-hero-controls"><button class="rs-round" data-hero-step="-1" aria-label="Previous campaign" aria-controls="rs-featured-track">‹</button><div class="rs-hero-dots"><button data-hero-index="0" aria-label="Go to slide 1" aria-current="true"></button><button data-hero-index="1" aria-label="Go to slide 2"></button></div><button class="rs-round" data-hero-step="1" aria-label="Next campaign" aria-controls="rs-featured-track">›</button><span class="visually-hidden" data-hero-status aria-live="polite">Campaign 1 of 2</span></div>
</section>
${promo(base, { eyebrow: 'Featured', heading: 'Grand Theft Auto VI Collection', text: 'Apparel, accessories and collectibles inspired by Vice City and the state of Leonida.', href: '/grand-theft-auto-vi-collection', cta: 'Shop Now', img: '04_-_Leonida_Keys_01.jpg' })}
${SHELF_ITEMS.length ? assortmentRows(base, 'top') : oldRows(base, shelf)}
${promo(base, { eyebrow: 'Collections', heading: 'Rockstar Games Collection', text: 'Classic logos and essentials from across the Rockstar Games catalogue.', href: '/rockstar-collection', cta: 'Shop Now', img: '06_-_Cal_Hampton_03.jpg' })}
${SHELF_ITEMS.length ? assortmentRows(base, 'middle') : ''}
${promo(base, { eyebrow: 'Coming Soon', heading: 'Grand Theft Auto VI: The Album', text: 'Music from the world of Grand Theft Auto VI. Find it in the Grand Theft Auto VI Collection.', href: '/grand-theft-auto-vi-collection', cta: 'Learn More', img: '05_-_Boobie_Ike_02.jpg' })}
${promo(base, { eyebrow: 'Red Dead Redemption', heading: 'Shop Red Dead Redemption', text: 'Games, Gold Bars and essentials from the frontier.', href: '/red-dead-redemption-collection', cta: 'Shop Now', img: '08_-_Grassrivers_03.jpg', cls: 'rp-promo-red' })}
${SHELF_ITEMS.length ? assortmentRows(base, 'bottom') : ''}`
}

// ---------- policy, corporate and leaving pages ----------
export function docPage({ eyebrow = 'Rockstar Games', title, intro = '', sections = [], note = '' }) {
  return `<article class="rp-doc"><p class="rs-eyebrow">${esc(eyebrow)}</p><h1>${esc(title)}</h1>${intro ? `<p class="rp-doc-intro">${intro}</p>` : ''}${sections.map(([h, b]) => `<section><h2>${esc(h)}</h2>${b}</section>`).join('')}${note ? `<p class="rs-fine">${note}</p>` : ''}</article>`
}
const P = s => `<p>${s}</p>`
export const DOCS = base => ({
  '/refund-and-return-policy': ['Refunds and Returns', { eyebrow: 'Rockstar Store', title: 'Refunds and Returns FAQ', sections: [
    ['What are my refund rights for digital purchases?', P('Digital games bought through Rockstar’s own stores can be refunded within 14 days of purchase if you have played for less than two hours and no non-refundable items, such as virtual currency, are tied to the purchase. Purchases made through other retailers follow that retailer’s policy.')],
    ['What are my refund rights for physical purchases?', P('Physical items bought from the Rockstar Games Store are refundable if they never arrive. Damaged or defective items may be exchanged, or refunded in full or in part if the item is no longer available.')],
    ['What is the EEA / UK right of withdrawal?', P('Customers in the EEA or UK can withdraw from certain purchases within 14 days without giving a reason. Refunds are issued within 14 days using the original payment method; the customer pays return shipping for physical items.')],
    ['Which Store purchases are not subject to the EEA / UK right of withdrawal?', P('Custom or personalized goods, items that become inseparably mixed after delivery, unsealed recordings or software, and digital content whose performance began with your consent.')],
    ['Where can I find the full refund policy for content purchased from Rockstar?', P(`When Rockstar is the merchant, Rockstar’s own refund policy governs the purchase. Questions about Store orders go to <a href="${base}/support">Rockstar Support</a>.`)],
    ['Who is Xsolla and where can I find the full refund policy?', P('Xsolla is Rockstar’s authorized reseller and merchant of record for some purchases, including physical items. Its refund policy governs those orders and Xsolla issues any refunds or exchanges, with Rockstar Games Support helping to facilitate requests.')],
    ['Who is the merchant of record for my transaction?', P('The merchant of record is shown during checkout and on your receipt.')],
    ['Additional Details:', `<ul class="rp-list"><li><a href="${base}/support">Customer Support</a></li><li><a href="${base}/legal">Terms of Service</a></li><li><a href="${base}/privacy">Privacy Policy</a></li><li><a href="${base}/rockstar-games">Company Details</a></li></ul>`]] }],
  '/privacy': ['Privacy Policy', { title: 'Privacy Policy', intro: 'Summary of the Rockstar Games Privacy Policy published at rockstargames.com/privacy.', sections: [
    ['Information we collect', P('Account details you provide (such as email address, nickname and date of birth), purchase and transaction records, and technical data from your devices and gameplay.')],
    ['How we use information', P('To provide games, online services and the Store, process purchases through payment partners such as Xsolla, keep services secure, support you, and, with your consent where required, send marketing.')],
    ['Sharing', P('With service providers and payment partners that act on Rockstar’s behalf, with Take-Two Interactive group companies, and where required by law.')],
    ['Your choices and rights', P(`Manage marketing preferences in your Rockstar Games account, change cookie choices in <a href="${base}/cookie-settings">Cookie Settings</a>, and use <a href="${base}/ccpa">Do Not Sell or Share My Personal Information</a> where available.`)]],
    note: `Read the full Rockstar Games Privacy Policy at rockstargames.com/privacy.${publicNotice(' This copy is a summary for a demonstration store; no personal data entered here leaves this environment.')}` }],
  '/cookie-policy': ['Cookie Policy', { title: 'Cookie Policy', intro: 'Summary of the Rockstar Games Cookie Policy published at rockstargames.com/cookies.', sections: [
    ['What cookies are', P('Small files that websites store in your browser to remember choices, keep you signed in and measure how pages are used.')],
    ['Types of cookies used', P('Strictly necessary cookies (sign-in, cart and checkout), performance and analytics cookies, functional cookies, and targeting or advertising cookies.')],
    ['Managing cookies', P(`Accept or reject optional cookies from the banner or at any time in <a href="${base}/cookie-settings">Cookie Settings</a>. Strictly necessary cookies cannot be switched off.`)]] }],
  '/legal': ['Terms of Service', { title: 'Terms of Service', intro: 'Summary of the Rockstar Games Terms of Service and legal notices published at rockstargames.com/legal.', sections: [
    ['Agreement', P('Using Rockstar Games websites, online services and the Store means you accept the Terms of Service and the applicable End User License Agreement for each game.')],
    ['Purchases', P(`Store purchases are licences to digital content or sales of physical goods. Some physical and pre-order purchases are fulfilled by Xsolla as merchant of record. See <a href="${base}/refund-and-return-policy">Refunds</a>.`)],
    ['Accounts and conduct', P('Keep your Rockstar Games account secure and follow the online conduct rules; Rockstar may suspend accounts that break them.')],
    ['Trademarks', P('Rockstar Games, Grand Theft Auto, Red Dead Redemption and related marks are trademarks of Take-Two Interactive Software, Inc.')]] }],
  '/ccpa': ['Do Not Sell or Share My Personal Information', { eyebrow: 'Take-Two Interactive', title: 'Do Not Sell or Share My Personal Information', intro: 'Summary of the Take-Two Interactive request page at take2games.com/ccpa.', sections: [
    ['Your right to opt out', P('Residents of California and other US states with similar laws may opt out of the “sale” or “sharing” of personal information for cross-context behavioural advertising.')],
    ['How to opt out', P(`Choose “Reject All” in <a href="${base}/cookie-settings">Cookie Settings</a> for this browser. For requests tied to your Rockstar Games account, submit Take-Two’s online request form at take2games.com/ccpa.`)]] }],
  '/rockstar-games': ['Rockstar Games', { eyebrow: 'Company', title: 'Rockstar Games', intro: 'Rockstar Games, Inc. is a video game publisher based in New York City and a subsidiary of Take-Two Interactive Software, Inc. It develops and publishes the Grand Theft Auto, Red Dead Redemption, Max Payne, L.A. Noire and Bully series.', sections: [
    ['Rockstar Store', P(`The Rockstar Store sells PC games for the Rockstar Games Launcher, in-game currency, GTA+ memberships and official merchandise. Physical items and the Grand Theft Auto VI code-in-box pre-order are fulfilled by Xsolla. <a href="${base}/view-all-games">Shop games</a> · <a href="${base}/merchandise">Shop merchandise</a>`)],
    ['Support', P(`Help with orders, refunds and accounts: <a href="${base}/support">Rockstar Support</a>.`)]] }],
})

const PLATFORM_STORE = { ps5: 'PlayStation Store', xbox: 'Microsoft Store' }
const REAL_LINK = {
  'ps5-standard': 'store.playstation.com/product/EP1004-PPSA01547_00-GTAVISTANDARD001', 'ps5-ultimate': 'store.playstation.com/product/EP1004-PPSA01547_00-GTAVIULTIMATE001', 'ps5-upgrade': 'store.playstation.com (Ultimate Edition upgrade)',
  'xbox-standard': 'xbox.com/games/store/grand-theft-auto-vi/9P3H4968GRSM', 'xbox-ultimate': 'xbox.com/games/store/grand-theft-auto-vi-ultimate-edition/9NNZSNHLR63L', 'xbox-upgrade': 'xbox.com (Ultimate Edition upgrade)',
}
export const LEAVING_KEYS = Object.keys(REAL_LINK)
export function leavingPage(base, key) {
  const [platform, edition] = key.split('-')
  const store = PLATFORM_STORE[platform]
  const what = edition === 'upgrade' ? 'The Grand Theft Auto VI Ultimate Edition upgrade' : `Grand Theft Auto VI – ${edition === 'ultimate' ? 'Ultimate' : 'Standard'} Edition (digital)`
  return `<div class="rp-leaving"><span class="rp-leaving-icon" aria-hidden="true">↗</span><p class="rs-eyebrow">${esc(store)}</p><h1>You are leaving the Rockstar Store</h1>
<p>${esc(what)} for ${platform === 'ps5' ? 'PlayStation 5' : 'Xbox Series X|S'} is sold by the ${esc(store)}, not by the Rockstar Store. Digital editions are purchased and downloaded through your platform account at <b>${esc(REAL_LINK[key])}</b>.</p>
<p>A digital pre-order cannot be completed on the Rockstar Store. The Rockstar Store sells the physical Code-in-Box version.</p>${publicNotice(`<p class="rs-fine">The ${esc(store)} is not part of this demonstration store, so this page does not open it.</p>`)}
<div class="rp-leaving-actions"><a class="rs-btn rs-btn-pill" href="${base}/game/buy-gta-vi?platform=${platform}#code-in-box">Pre-order the Code-in-Box instead</a><a class="rs-btn rs-btn-outline" href="${base}/game/buy-gta-vi?platform=${platform}#compare-editions">Back to Grand Theft Auto VI</a></div></div>`
}
// Where a digital edition button points: the sibling store clones in historical fixture mode (tests rely on it), a local
// "you are leaving" page in the default reference mode so single-store runs never link into another store's mount.
export const digitalHref = (base, platform, edition) => {
  if (fixtureCatalog) return edition === 'upgrade' ? (platform === 'ps5' ? '/playstation-store/en-us/product/EP1004-PPSA01547_00-ULTEDTIONUPGRADE' : '/xbox-store/en-US/games/store/grand-theft-auto-vi-ultimate-edition-upgrade/9pn4llbr8rch') : LISTINGS.find(l => l.platform === platform && l.edition === edition && l.format === 'digital').linkOut
  return `${base}/leaving-rockstar-store/${platform}-${edition}`
}

// ---------- site map ----------
export function sitemapTree() {
  return [
    ['Games', '/view-all-games', [['Grand Theft Auto VI', '/game/buy-gta-vi'], ...ALL_GAMES.map(s => [TITLES[s].title, `/game/${s}`])]],
    ['Game Add-Ons', '/game-add-ons', [['Grand Theft Auto Online: Shark Cash Cards', '/buy-gta-v-shark-cash-cards'], ['Red Dead Online: Gold Bars', '/buy-red-dead-online-gold-bars']]],
    ['GTA+', '/game/gta-plus', []],
    ['Merchandise', '/merchandise', [['Apparel', SUB('apparel')], ['Accessories', SUB('accessories')], ['Collectibles', SUB('collectible')]]],
    ['Featured', '/new-arrivals', [['New Arrivals', '/new-arrivals'], ['Grand Theft Auto VI Collection', '/grand-theft-auto-vi-collection'], ['Grand Theft Auto Collection', '/grand-theft-auto-collection'], ['Red Dead Redemption Collection', '/red-dead-redemption-collection'], ['Rockstar Games Collection', '/rockstar-collection']]],
    ['Shopping', '/cart', [['Cart', '/cart'], ['Search', '/search'], ['Sign In', '/signin'], ['Create Account', '/signup']]],
    ['Help', '/support', [['Rockstar Support', '/support'], ['Order receipts', '/support/articles/receipts'], ['Track a physical order', '/support/articles/track-physical-order'], ['Refunds', '/refund-and-return-policy']]],
    ['Legal', '/legal', [['Privacy Policy', '/privacy'], ['Cookie Policy', '/cookie-policy'], ['Terms of Service', '/legal'], ['Do Not Sell or Share My Personal Information', '/ccpa'], ['Cookie Settings', '/cookie-settings'], ['Rockstar Games', '/rockstar-games']]],
  ]
}
export function sitemapPage(base) {
  return `<article class="rp-doc rp-sitemap"><p class="rs-eyebrow">Rockstar Store</p><h1>Site Map</h1><div class="rp-sitemap-cols">${sitemapTree().map(([h, href, kids]) => `<section><h2><a href="${base}${href}">${esc(h)}</a></h2>${kids.length ? `<ul>${kids.map(([l, p]) => `<li><a href="${base}${p}">${esc(l)}</a></li>`).join('')}</ul>` : ''}</section>`).join('')}</div></article>`
}
export function sitemapXml(base) {
  const paths = new Set(['/', '/sitemap'])
  for (const [, href, kids] of sitemapTree()) { paths.add(href); kids.forEach(([, p]) => paths.add(p)) }
  for (const p of PRODUCTS) paths.add(p.path)
  const x = s => s.replace(/&amp;/g, '&').replace(/&/g, '&amp;')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...paths].map(p => `  <url><loc>${x(base + p)}</loc></url>`).join('\n')}\n</urlset>\n`
}

// ---------- routes ----------
export function installParity(router, { render, notFound }) {
  const page = (path, title, html) => router.get(path, (req, res) => render(req, res, title, html(res.locals.base)))
  router.get('/leaving-rockstar-store/:key', (req, res) => LEAVING_KEYS.includes(req.params.key) ? render(req, res, 'You are leaving the Rockstar Store', leavingPage(res.locals.base, req.params.key)) : notFound(req, res))
  for (const [path, [title]] of Object.entries(DOCS(''))) router.get(path, (req, res) => render(req, res, title, docPage(DOCS(res.locals.base)[path][1])))
  page('/sitemap', 'Site Map', sitemapPage)
  router.get('/sitemap.xml', (req, res) => res.type('application/xml').send(sitemapXml(res.locals.base)))
  // Real add-on URLs. Fixture mode keeps its purchasable add-on products at /game/shark-cash-cards and /game/gold-bars.
  for (const [path, kind, fixture] of [['/buy-gta-v-shark-cash-cards', 'shark', '/game/shark-cash-cards'], ['/buy-red-dead-online-gold-bars', 'gold', '/game/gold-bars']])
    router.get(path, (req, res) => fixtureCatalog && PRODUCTS.some(p => p.path === fixture) ? res.redirect(`${res.locals.base}${fixture}`) : render(req, res, kind === 'shark' ? 'Grand Theft Auto Online: Shark Cash Cards' : 'Red Dead Online: Gold Bars', currencyPage(res.locals.base, kind)))
  router.get('/new-arrivals', (req, res) => render(req, res, 'New Arrivals', collectionPage(res.locals.base, collectionRoutes(res.locals.base)['/new-arrivals'][1])))
  router.get('/grand-theft-auto-vi-collection', (req, res) => render(req, res, 'Grand Theft Auto VI Collection', collectionPage(res.locals.base, collectionRoutes(res.locals.base)['/grand-theft-auto-vi-collection'][1])))
}
// Reference-mode replacements for the fixture hubs; fixture mode keeps the original hub pages.
export function referenceRoute(base, path) {
  const c = collectionRoutes(base)[path]
  return c ? [c[0], collectionPage(base, c[1])] : null
}
