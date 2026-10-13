// Record the page as the agent sees it (layout, scrolling, pointer, clicks and
// typing) so the operator can replay the task. Passwords and card details are
// masked before they leave the browser. Replays are never used for grading.
(() => {
  'use strict'
  const script = document.currentScript
  const trial = script?.dataset.trial, page = script?.dataset.page
  const record = window.rrwebRecord?.record
  try { delete window.rrwebRecord } catch { /* Leave the global if it cannot be removed. */ }
  if (!trial || !page || typeof record !== 'function') return
  const endpoint = seq => `/agent/replay?trial=${encodeURIComponent(trial)}&page=${encodeURIComponent(page)}&seq=${seq}`
  const BEACON_LIMIT = 60 * 1024, FLUSH_BYTES = 256 * 1024
  let pending = [], pendingBytes = 0, seq = 0, timer, stopped = false, stop

  // Typed text is shown, except passwords and payment card fields.
  const CARD_FIELD = /card|cvv|cvc|csc|security.?code|expir|exp(?:iry|iration)?[-_ ]?(?:date|month|year|mm|yy)|\bpin\b|^number$/i
  const sensitive = element => {
    if (!element || !(element instanceof Element)) return false
    if (element.getAttribute('type') === 'password') return true
    if (/^cc-(?!name|given-name|family-name|additional-name)/i.test(element.getAttribute('autocomplete') || '')) return true
    return ['name', 'id', 'placeholder', 'aria-label'].some(attribute => CARD_FIELD.test(element.getAttribute(attribute) || ''))
  }
  const mask = (text, element) => sensitive(element) ? '•'.repeat(String(text || '').length) : text
  const masked = Object.fromEntries(['color', 'date', 'datetime-local', 'email', 'month', 'number', 'range', 'search', 'select', 'tel', 'text', 'textarea', 'time', 'url', 'week', 'password'].map(type => [type, true]))

  async function gzip(text) {
    if (typeof CompressionStream !== 'function') return null
    try { return await new Response(new Blob([text]).stream().pipeThrough(new CompressionStream('gzip'))).blob() }
    catch { return null }
  }
  async function send(events, leaving) {
    const text = JSON.stringify(events), url = endpoint(++seq)
    // A departing page cannot wait for compression; small batches go as a beacon.
    if (leaving && text.length <= BEACON_LIMIT && navigator.sendBeacon?.(url, new Blob([text], { type: 'application/json' }))) return
    const body = await gzip(text) || new Blob([text], { type: 'application/json' })
    const init = { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/octet-stream' }, body }
    let response
    try { response = await fetch(url, { ...init, keepalive: body.size <= BEACON_LIMIT }) }
    catch {
      // keepalive bodies are capped by the browser; retry once without it.
      try { response = await fetch(url, init) } catch { return }
    }
    if ([401, 403, 404, 409, 413].includes(response.status)) { stopped = true; pending = []; stop?.() }
  }
  function flush(leaving = false) {
    clearTimeout(timer)
    timer = null
    if (!pending.length || stopped) return
    const events = pending
    pending = []; pendingBytes = 0
    // Observation must never interrupt the benchmark task.
    void send(events, leaving).catch(() => {})
  }
  function emit(event) {
    if (stopped) return
    pending.push(event)
    pendingBytes += event.type === 2 ? FLUSH_BYTES : JSON.stringify(event).length
    // Send the first page snapshot at once; batch later activity every second.
    if (pendingBytes >= FLUSH_BYTES) flush()
    else if (!timer) timer = setTimeout(() => flush(), 1000)
  }
  try {
    stop = record({
      emit, maskInputOptions: masked, maskInputFn: mask, recordCanvas: false, collectFonts: false,
      sampling: { mousemove: 50, scroll: 150, media: 800, input: 'last' },
    })
  } catch { return }
  addEventListener('pagehide', () => flush(true))
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(true) })
})()
