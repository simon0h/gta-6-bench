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
  if (currency === 'KRW') return `${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}원`
  const symbol = SYMBOLS[currency] ?? currency + ' '
  return `${symbol}${n.toFixed(2)}`
}

export function formatDate(iso, opts = {}) {
  const d = new Date(iso + (iso.length === 10 ? 'T12:00:00' : ''))
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', ...opts })
}

// Small footer every clone must include (see docs/STORE_CONVENTIONS.md).
// Kept for callers; stores carry no visible disclaimer so pages read like the real retailer.
export function disclaimer(storeName) {
  return ''
}

// Render a 400 page for bad form input without crashing the flow.
export function badRequest(res, message) {
  res.status(400).type('html').send(`<!doctype html><title>Error</title><p>${esc(message)}</p><p><a href="javascript:history.back()">Go back</a></p>`)
}
