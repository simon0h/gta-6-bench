import { esc } from '../../lib/html.js'

// Recommendation records captured on the Xbox GTA VI added drawer/cart on 2026-10-06.
// Card data does not establish ancillary PDP details, stock, or checkout behavior.
export const REFERENCE_RECOMMENDATIONS = [
  { id: '829262', slug: 'logitech-g-astro-a20x-playsync-wireless-headset-white', title: 'Logitech G Astro A20X PLAYSYNC Wireless Headset (White)', price: 249, stars: '5.0', reviews: 2, deal: 'RED HOT DEAL' },
  { id: '840499', slug: 'legion-pro-lp-32ud-10-31-5-4k-uhd-240hz-oled-gaming-monitor', title: 'Legion Pro LP 32UD-10 31.5" 4K UHD 240Hz OLED Gaming Monitor', price: 1299, ticket: 1699, stars: '4.6', reviews: 5 },
  { id: '896438', slug: 'powera-advantage-plus-wired-controller-for-xbox-series-xs-moonlit-palms', title: 'PowerA Advantage Plus Wired Controller for XBOX Series X|S (Moonlit Palms)', price: 69 },
  { id: '896402', slug: 'xbox-series-x-1tb-console-1', title: 'Xbox Series X 1TB Console', price: 1099, stars: '4.6', reviews: 638 },
  { id: '903000', slug: 'playstation-5-grand-theft-auto-vi', title: 'Grand Theft Auto VI', format: 'PlayStation 5', price: 129, cta: 'Pre-order', native: true },
  { id: '482005', slug: 'xbox-rechargeable-battery-usb-c-cable', title: 'Xbox Rechargeable Battery + USB-C Cable', price: 29, stars: '4.5', reviews: 81 },
  { id: '899532', title: 'Call of Duty: Modern Warfare 4 - 2XP Edition', format: 'Xbox Series X', price: 89, cta: 'Pre-order' },
]
// Read-only catalog observations. A native link on a recommendation card does not
// establish the destination PDP's stock or purchase eligibility. COD had no
// recorded native href, so its source remains the captured Xbox added drawer.
export const catalogObservations = Object.freeze(REFERENCE_RECOMMENDATIONS.filter(p => !p.native).map(p => {
  const path = p.slug ? `/products/${p.slug}` : `/reference-products/${p.id}`
  const addedOnly = p.id === '899532'
  const cartOnly = p.id === '482005'
  const observedOn = [
    ...(!cartOnly ? ['https://www.jbhifi.com.au/products/xbox-series-x-grand-theft-auto-vi'] : []),
    ...(!addedOnly ? ['https://www.jbhifi.com.au/cart'] : []),
  ]
  return Object.freeze({
    id: p.id, sku: p.id, title: p.title, kind: 'other', price: p.price, currency: 'AUD',
    path, local_path: path, native_path: p.slug ? path : null,
    source_url: p.slug ? `https://www.jbhifi.com.au${path}` : observedOn[0],
    observed_on: observedOn, captured_at: '2026-10-06',
    evidence_path: 'research/fidelity-2026-10-06/specialist-retail.md',
    evidence_screenshots: [
      ...(!cartOnly ? ['research/fidelity-2026-10-06/screenshots/jb-added-live.jpg'] : []),
      ...(!addedOnly ? ['research/fidelity-2026-10-06/screenshots/jb-cart-live.jpg'] : []),
    ],
    observation: 'recommendation-card', availability: 'unknown', purchase: 'unverified', purchasable: false,
    image: `/static/reference/jb-hifi/recommendation-${p.id}.jpg`,
    facts: ['native_id', 'title', 'displayed_price', 'image', ...(p.slug ? ['native_path'] : []), ...(p.stars ? ['rating', 'review_count'] : [])],
    ...(p.stars ? { rating: Number(p.stars), reviews: p.reviews } : {}),
    ...(p.ticket ? { ticket_price: p.ticket } : {}),
    limitations: 'Only the recommendation card was captured; complete PDP, variants, stock and purchase behavior are unverified.' + (p.slug ? '' : ' No native product href was captured.'),
  })
}))

export const recommendationBySlug = slug => REFERENCE_RECOMMENDATIONS.find(p => !p.native && p.slug === slug) ?? null
export const recommendationById = id => REFERENCE_RECOMMENDATIONS.find(p => !p.native && p.id === id) ?? null
export const recommendationsFor = surface => (surface === 'added' ? ['829262','840499','896438','896402','899532','903000'] : ['829262','840499','896438','896402','903000','482005']).map(id => REFERENCE_RECOMMENDATIONS.find(p => p.id === id))
const image = p => `/static/reference/jb-hifi/${p.native ? 'gta-vi-ps5-1.jpg' : `recommendation-${p.id}.jpg`}`
const path = (base, p) => p.slug ? `${base}/products/${p.slug}` : `${base}/reference-products/${p.id}`

export function recommendationCarousel(base, surface, returnTo) {
  return `<div class="jb-reference-recommendations"><div class="jb-reference-rec-carousel" data-recommendation-rail tabindex="0" aria-label="${surface === 'added' ? 'Enhance your product' : 'Don’t forget these'}">${recommendationsFor(surface).map(p => `<article class="jb-reference-rec-card" data-reference-sku="${p.id}">
    <a class="jb-rec-image" href="${path(base,p)}"><img src="${image(p)}" alt="${esc(p.title)}" width="60" height="60"></a>
    <div class="jb-rec-details"><h3><a href="${path(base,p)}">${esc(p.title)}</a></h3>${p.format ? `<p class="jb-rec-format">${esc(p.format)}</p>` : ''}${p.stars ? `<div class="jb-rec-rating" aria-label="Rated ${p.stars} out of 5 from ${p.reviews} reviews"><span class="jb-rec-stars" aria-hidden="true"><i style="width:${Number(p.stars) * 20}%"></i></span><small>${p.stars} (${p.reviews})</small></div>` : ''}</div>
    <div class="jb-rec-actions"><div class="jb-rec-price">${p.deal ? `<span class="jb-rec-deal">${p.deal}</span>` : ''}${p.ticket ? `<span class="jb-rec-ticket">TICKET <s>$${p.ticket}</s></span>` : ''}<div class="jb-tag"><span>$${p.price}</span></div>${p.ticket ? `<span class="jb-rec-saving">$${p.ticket-p.price} <small>OFF^</small></span>` : ''}</div>${p.native ? `<form method="post" action="${base}/cart/add"><input type="hidden" name="id" value="${p.id}"><input type="hidden" name="return" value="${esc(returnTo)}"><button class="jb-btn jb-rec-cta" type="submit">${p.cta}</button></form>` : `<button class="jb-btn jb-rec-cta" type="button" disabled aria-label="${esc(p.cta || 'Add to cart')} — purchase behavior not captured">${p.cta || 'Add to cart'}</button>`}</div>
  </article>`).join('')}</div><div class="jb-rec-navigation"><button type="button" data-recommendation-direction="-1" aria-label="Previous recommendations" disabled><span></span></button><div class="jb-rec-scroll-track" aria-hidden="true"><span></span></div><button type="button" data-recommendation-direction="1" aria-label="Next recommendations"><span></span></button></div></div>`
}

export function recommendationPreview(base, p) {
  return `<section class="jb-reference-rec-preview"><p><a href="${base}/cart">Back to cart</a></p><div><img src="${image(p)}" alt="${esc(p.title)}"><article><h1>${esc(p.title)}</h1>${p.format ? `<p>${esc(p.format)}</p>` : ''}<div class="jb-tag jb-tag-big"><span>$${p.price}</span></div><p>Only this recommendation card was captured. Product details and purchase availability have not been verified.</p></article></div></section>`
}
