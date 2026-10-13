import { esc } from '../../lib/html.js'
import { retailState, defaultAddress } from '../../lib/retail-state.js'
import { signinPath } from './data.js'

export const LOCATION = '/gp/delivery-location'
// Return paths are appended to the current storefront base, never treated as URLs.
export const locationReturn = value => typeof value === 'string' && /^\/(?!\/)/.test(value) && !/[\\\x00-\x1f]/.test(value) && !value.startsWith(LOCATION) ? value.slice(0, 1200) : '/'
export function deliveryLocation(req) {
  const s = retailState(req), choice = s.preferences.amazonLocation
  if (choice?.kind === 'zip') return { postal_code: choice.zip, city: '', source: 'zip' }
  const address = req.store.user && (s.addresses.find(a => a.id === choice?.id) || defaultAddress(req))
  return address ? { id: address.id, postal_code: address.postal_code, city: address.city, source: 'address' } : null
}
export const locationLabel = destination => destination ? [destination.city, destination.postal_code].filter(Boolean).join(' ') : 'San Jose 95112'

export function locationForm({ base, user, destination, addresses = [], ret = '/', zip, error = '', standalone = false }) {
  const back = locationReturn(ret), fieldId = standalone ? 'az-location-page-zip' : 'az-location-zip'
  return `<div class="az-location-content">${error ? `<div class="az-alert" role="alert">${esc(error)}</div>` : ''}<p class="az-fine">Choose where you shop. Confirm your full delivery address and available shipping options at checkout.</p>
  <p class="az-location-current">Currently shopping for <b>${esc(locationLabel(destination))}</b></p>
  ${user ? `${addresses.length ? `<form method="post" action="${base}${LOCATION}" class="az-service-form"><input type="hidden" name="ret" value="${esc(back)}"><input type="hidden" name="mode" value="address"><label>Your saved addresses<select name="addressId">${addresses.map(a => `<option value="${esc(a.id)}"${a.id === destination?.id ? ' selected' : ''}>${esc(a.label || a.name)} — ${esc(a.city)} ${esc(a.postal_code)}</option>`).join('')}</select></label><button class="az-btn az-btn-outline">Use this address</button></form>` : ''}<a href="${base}/a/addresses">Manage your addresses</a>` : `<a class="az-btn az-btn-block" href="${esc(base + signinPath(`${LOCATION}?ret=${encodeURIComponent(back)}`))}">Sign in to see your addresses</a>`}
  <form method="post" action="${base}${LOCATION}" class="az-location-zip-form"><input type="hidden" name="ret" value="${esc(back)}"><input type="hidden" name="mode" value="zip"><label for="${fieldId}">Enter a US ZIP code</label><div><input id="${fieldId}" name="zip" value="${esc(zip ?? destination?.postal_code ?? '')}" inputmode="numeric" autocomplete="postal-code" maxlength="10" required pattern="[0-9]{5}(-[0-9]{4})?"><button class="az-btn az-btn-outline">Apply</button></div></form>
  <details class="az-location-scope"><summary>Shipping outside the United States</summary><p>This storefront supports US delivery addresses. International delivery and region-specific inventory are not available here.</p></details>
  ${destination ? `<form method="post" action="${base}${LOCATION}"><input type="hidden" name="ret" value="${esc(back)}"><button class="az-link-btn" name="mode" value="default">Use default shopping location</button></form>` : ''}
  <div class="az-location-done">${standalone ? `<a class="az-btn" href="${esc(base + back)}">Done</a>` : '<form method="dialog"><button class="az-btn">Done</button></form>'}</div></div>`
}

export function registerLocation(router, { render }) {
  function show(req, res, error = '') {
    const ret = locationReturn(req.body?.ret || req.query.ret)
    render(req, res, 'Choose your location', `<section class="az-journey az-location-page"><h1>Choose your location</h1>${locationForm({ base: res.locals.base, user: req.store.user, addresses: req.store.user ? retailState(req).addresses : [], destination: deliveryLocation(req), ret, zip: error ? String(req.body.zip || '').slice(0, 10) : undefined, error, standalone: true })}</section>`, { status: error ? 400 : 200 })
  }
  router.get(LOCATION, (req, res) => show(req, res))
  router.post(LOCATION, (req, res) => {
    const s = retailState(req), mode = req.body.mode
    if (mode === 'zip') {
      const zip = typeof req.body.zip === 'string' ? req.body.zip.trim() : ''
      if (!/^\d{5}(?:-\d{4})?$/.test(zip) || /^00000/.test(zip)) return show(req, res, 'Enter a valid US ZIP code, such as 95112.')
      s.preferences.amazonLocation = { kind: 'zip', zip }
    } else if (mode === 'address') {
      if (!req.store.user || !s.addresses.some(a => a.id === req.body.addressId)) return show(req, res, 'Choose one of your saved addresses.')
      s.preferences.amazonLocation = { kind: 'address', id: req.body.addressId }
    } else if (mode === 'default') delete s.preferences.amazonLocation
    else return show(req, res, 'Choose a ZIP code or a saved address.')
    s.amazonLocationNotice = `Shopping location updated to ${locationLabel(deliveryLocation(req))}. Confirm your shipping address at checkout.`
    res.redirect(res.locals.base + locationReturn(req.body.ret))
  })
}
