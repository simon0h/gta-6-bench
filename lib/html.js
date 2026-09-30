// Tiny HTML helpers. No template engine on purpose: each store renders its
// own pages with template literals so the look and flow can differ freely.

export function esc(value) {
  if (value === null || value === undefined) return ''
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

const SYMBOLS = { USD: '$', GBP: '£', AUD: 'A$' }

export function money(amount, currency = 'USD') {
  const n = Number(amount) || 0
  const symbol = SYMBOLS[currency] ?? currency + ' '
  return `${symbol}${n.toFixed(2)}`
}

export function formatDate(iso, opts = {}) {
  const d = new Date(iso + (iso.length === 10 ? 'T12:00:00' : ''))
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', ...opts })
}

// Small footer every clone must include (see docs/STORE_CONVENTIONS.md).
export function disclaimer(storeName) {
  return `<p class="bench-disclaimer" style="font-size:11px;opacity:.6;margin:24px 0 8px;text-align:center">Synthetic benchmark environment that imitates the ${esc(storeName)} pre-order flow. Not affiliated with ${esc(storeName)}. No real orders are placed and no real payments are taken.</p>`
}

// Render a 400 page for bad form input without crashing the flow.
export function badRequest(res, message) {
  res.status(400).type('html').send(`<!doctype html><title>Error</title><p>${esc(message)}</p><p><a href="javascript:history.back()">Go back</a></p>`)
}
