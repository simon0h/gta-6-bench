// Homepage product rows in reference mode, modelled on bestbuy.com's homepage: Top Deals and
// Deal of the Day carousels, Trending deals with category tabs, new video game releases,
// customer favorites and Outlet open-box offers. Rows mix the store assortment with the
// GTA VI pre-order listings the same way the real site mixes promoted items.
import { esc, money } from '../../lib/html.js'
import { productPath, stockFor, selectedProduct } from './data.js'
import { art } from './browse-pages.js'
import { PATHS } from './site-pages.js'

const stars = p => p.rating ? `<span class="bbs-stars" aria-label="Rating ${p.rating.stars} out of 5 stars with ${p.rating.count} reviews"><span class="bbs-star-fill" style="--r:${(p.rating.stars / 5 * 100).toFixed(0)}%" aria-hidden="true">★★★★★</span> <b>${p.rating.stars}</b> (${p.rating.count.toLocaleString('en-US')})</span>` : '<span class="bbs-stars bbs-new">Not yet reviewed</span>'
const save = p => p.listPrice > p.price ? `<p class="bbs-save"><span>Save ${money(p.listPrice - p.price)}</span> <s>Was ${money(p.listPrice)}</s></p>` : ''

export function card(base, p, { badge = '' } = {}) {
  const preferred = p.preferredFulfillment
  const fulfillment = preferred && stockFor(p, preferred) ? preferred : stockFor(p, 'pickup') ? 'pickup' : 'shipping'
  const available = stockFor(p, 'pickup') > 0 || stockFor(p, 'shipping') > 0
  const label = p.preorder ? 'Pre-order' : available ? 'Add to Cart' : 'Sold Out'
  const flag = badge || (p.preorder ? 'Pre-order' : p.deal && p.listPrice - p.price >= 100 ? 'Top Deal' : '')
  return `<article class="bbs-card" data-sku="${p.sku}" data-price="${p.price}">${flag ? `<span class="bbs-flag${flag === 'Pre-order' ? ' is-preorder' : ''}">${esc(flag)}</span>` : ''}<a class="bbs-card-img" href="${productPath(base, p)}" tabindex="-1" aria-hidden="true">${art(p)}</a><h3 class="bbs-card-title"><a href="${productPath(base, p)}">${esc(p.title)}</a></h3>${stars(p)}<p class="bbs-price">${money(p.price)}</p>${save(p)}<form method="post" action="${base}/cart/add"><input type="hidden" name="pid" value="${p.sku}">${p.variants ? `<input type="hidden" name="variant" value="${esc(p.variant || p.variants[0].id)}">` : ''}<input type="hidden" name="fulfillment" value="${fulfillment}"><button class="bbs-add" ${available ? '' : 'disabled'}>${label}</button></form></article>`
}

const row = (base, { id, title, href, linkText = 'See all', items, note = '', badge }) => items.length ? `<section class="bbs-row" id="${id}" aria-labelledby="${id}-h"><div class="bbs-row-head"><h2 id="${id}-h">${title}</h2>${href ? `<a href="${href}">${linkText} ›</a>` : ''}</div>${note ? `<p class="bbs-row-note">${note}</p>` : ''}<div class="bbs-scroller" role="list">${items.map(p => `<div role="listitem">${card(base, p, { badge: typeof badge === 'function' ? badge(p) : badge })}</div>`).join('')}</div></section>` : ''

const TABS = [
  ['tvs', 'TVs', p => p.category === 'TVs'],
  ['laptops', 'Laptops', p => p.nodes?.includes('Laptops')],
  ['phones', 'Cell Phones', p => p.tree === 'cell-phones' && p.category === 'Unlocked Cell Phones'],
  ['appliances', 'Appliances', p => p.tree === 'appliances'],
  ['audio', 'Headphones & Speakers', p => p.tree === 'audio'],
  ['gaming', 'Video Games', p => p.tree === 'video-games' && !p.esrb],
  ['smart-home', 'Smart Home', p => p.tree === 'smart-home'],
]
const TAB_LINKS = { tvs: '/site/tv-home-theater/tvs/abcat0101000.c', laptops: '/site/computers-pcs/laptop-computers/abcat0502000.c', phones: '/site/mobile-cell-phones/unlocked-mobile-phones/pcmcat156400050037.c', appliances: '/site/electronics/home-appliances/abcat0900000.c', audio: '/site/electronics/audio/abcat0200000.c', gaming: '/site/electronics/video-games/abcat0700000.c', 'smart-home': '/site/electronics/home-security-safety/pcmcat254000050002.c' }

// Spread a list across departments so one category never fills a whole row.
function mix(items, n, key = p => p.tree) {
  const groups = new Map()
  for (const p of items) { const k = key(p); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(p) }
  const out = [], lists = [...groups.values()]
  for (let i = 0; out.length < n && lists.some(l => l.length > i); i++) for (const l of lists) if (l[i] && out.length < n) out.push(l[i])
  return out
}
const saving = p => (p.listPrice - p.price) / p.listPrice

// The Deal of the Day band: on the homepage it links to the daily deals page; on that page it leads.
const dotdBand = (base, daily, onPage = false) => daily ? `<section class="bbs-dotd${onPage ? ' bbs-dotd-page' : ''}" aria-labelledby="dotd-h"><div class="bbs-dotd-copy"><p class="bbs-eyebrow">Deal of the Day</p><h2 id="dotd-h">Today only. While supplies last.</h2><p>Ends tonight at 11:59 p.m. CT.</p>${onPage ? '<p class="bbs-dotd-note">Limit 3 per customer. Price valid online and in stores.</p>' : `<a class="bbs-link" href="${base}${PATHS.dotd}">See all daily deals ›</a>`}</div><div class="bbs-dotd-card">${card(base, daily, { badge: 'Deal of the Day' })}</div></section>` : ''
export const dealOfTheDay = (base, catalog) => dotdBand(base, catalog.find(p => p.daily && (stockFor(p, 'pickup') > 0 || stockFor(p, 'shipping') > 0)) || catalog.find(p => p.daily), true)

export function shelfHome({ base, catalog, trending = 'tvs' }) {
  const shelf = catalog.filter(p => p.shelf && (p.stock > 0))
  const gta = catalog.filter(p => p.kind === 'game')
  const deals = shelf.filter(p => p.deal).sort((a, b) => saving(b) - saving(a) || b.rating.count - a.rating.count)
  const topDeals = mix(deals.filter(p => p.price >= 99), 12)
  const daily = shelf.find(p => p.daily)
  const tab = TABS.find(t => t[0] === trending) || TABS[0]
  const trendingItems = shelf.filter(tab[2]).sort((a, b) => b.rating.count - a.rating.count).slice(0, 10)
  const releases = shelf.filter(p => p.esrb).sort((a, b) => Date.parse(b.release) - Date.parse(a.release)).slice(0, 8)
  // GTA VI pre-orders sit inside the new-releases row, as they would in a games carousel.
  const games = [...releases.slice(0, 2), ...gta, ...releases.slice(2)]
  const favorites = mix(shelf.filter(p => p.rating.stars >= 4.7 && p.rating.count >= 1000).sort((a, b) => b.rating.count - a.rating.count), 12)
  const outlet = mix(shelf.filter(p => p.variants?.some(v => v.condition === 'Open-box')).map(p => selectedProduct(p, 'open-box-excellent')), 10, p => p.department)
  const under100 = mix(shelf.filter(p => p.price < 100 && p.deal).sort((a, b) => b.rating.count - a.rating.count), 12)
  return `<div class="bbs-home">
${row(base, { id: 'top-deals', title: 'Top Deals', href: `${base}/top-deals`, linkText: 'Shop all Top Deals', items: topDeals })}
${dotdBand(base, daily)}
<section class="bbs-row" id="trending" aria-labelledby="trending-h"><div class="bbs-row-head"><h2 id="trending-h">Trending deals</h2><a href="${base}${TAB_LINKS[tab[0]]}">Shop all ${esc(tab[1])} ›</a></div><nav class="bbs-tabs" aria-label="Trending deal categories">${TABS.map(([id, label]) => `<a href="${base}/?trending=${id}#trending"${id === tab[0] ? ' aria-current="page"' : ''}>${esc(label)}</a>`).join('')}</nav><div class="bbs-scroller" role="list">${trendingItems.map(p => `<div role="listitem">${card(base, p)}</div>`).join('')}</div></section>
${row(base, { id: 'new-games', title: 'New and upcoming video games', href: `${base}/site/video-games/all-video-games/pcmcat1487698928729.c`, linkText: 'Shop all video games', items: games })}
${row(base, { id: 'customer-favorites', title: 'Customer favorites', note: 'Top-rated products with thousands of reviews.', items: favorites })}
${row(base, { id: 'under-100', title: 'Great gifts under $100', href: `${base}${PATHS.giftIdeas}`, linkText: 'Shop gift ideas', items: under100 })}
${row(base, { id: 'outlet', title: 'Open-box deals from Best Buy Outlet', href: `${base}${PATHS.outlet}`, linkText: 'Shop Outlet', items: outlet, badge: 'Open-Box' })}
</div>`
}
