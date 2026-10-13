// Observe storefront interaction without collecting entered values or changing
// controls. Events are diagnostic evidence, never input to benchmark grading.
(() => {
  'use strict'
  const script = document.currentScript
  const trial = script?.dataset.trial, page = script?.dataset.page
  if (!trial || !page) return
  const storageKey = `bench-traversal:${trial}`
  let pending = [], timer, sending = false, stopped = false
  const path = value => {
    try {
      const url = new URL(value, location.href)
      if (url.origin !== location.origin) return '[external]'
      return url.pathname.replace(/^\/agent\/[^/]+/, '/agent/[task]').slice(0, 512)
    } catch { return '' }
  }
  const clean = value => String(value || '').replace(/\s+/g, ' ').trim().slice(0, 100)
  const label = element => {
    if (!element) return ''
    // Input.value, selected options, editable text and field contents are never read.
    if (element.matches('input, select, textarea')) return clean(element.getAttribute('name') || element.getAttribute('type') || element.tagName.toLowerCase())
    const copy = element.cloneNode(true)
    copy.querySelectorAll('input, select, textarea, [contenteditable]').forEach(node => node.remove())
    return clean(element.getAttribute('aria-label') || copy.textContent || element.tagName.toLowerCase())
  }
  const lastPage = () => {
    try { return sessionStorage.getItem(storageKey) || undefined } catch { return undefined }
  }
  const rememberPage = () => { try { sessionStorage.setItem(storageKey, page) } catch { /* Storage may be disabled. */ } }
  function enqueue(event) {
    if (stopped) return
    pending.push(event)
    clearTimeout(timer)
    if (pending.length >= 24) void flush()
    else timer = setTimeout(() => { void flush() }, 100)
  }
  async function flush(leaving = false) {
    clearTimeout(timer)
    if (!pending.length || stopped) return
    // A departure must send queued events even while a prior batch is in flight.
    if (sending && !leaving) return
    const events = pending.splice(0, 32)
    const body = JSON.stringify({ trial_id: trial, page_id: page, events })
    if (leaving && navigator.sendBeacon?.('/agent/events', new Blob([body], { type: 'application/json' }))) return
    sending = true
    try {
      const response = await fetch('/agent/events', { method: 'POST', credentials: 'same-origin', keepalive: true, headers: { 'Content-Type': 'application/json' }, body })
      if ([401, 403, 404, 409].includes(response.status)) { stopped = true; pending = [] }
      // Do not retry an ambiguous POST: it may already have been checkpointed.
    } catch { /* Observation must never interrupt the benchmark task. */ }
    finally { sending = false; if (pending.length && !stopped) timer = setTimeout(() => { void flush() }, 100) }
  }
  const previous = lastPage()
  enqueue({ kind: 'page', path: path(location.href), ...(previous && previous !== page ? { parent_page_id: previous } : {}), navigation: performance.getEntriesByType('navigation')[0]?.type || 'navigate' })
  rememberPage()
  document.addEventListener('click', event => {
    if (!(event.target instanceof Element)) return
    const control = event.target.closest('a[href], button, input[type="submit"], input[type="button"], input[type="checkbox"], input[type="radio"], [role="button"], [role="link"], summary')
    if (!control || control.closest('[contenteditable]')) return
    enqueue({ kind: 'click', label: label(control), path: path(control.closest('a[href]')?.href || location.href) })
  }, { capture: true, passive: true })
  document.addEventListener('submit', event => {
    const form = event.target
    if (!(form instanceof HTMLFormElement)) return
    enqueue({ kind: 'submit', label: label(event.submitter) || 'Form', path: path(form.action || location.href) })
    void flush(true)
  }, { capture: true, passive: true })
  document.addEventListener('change', event => {
    const field = event.target
    if (!(field instanceof Element) || !field.matches('input, select, textarea')) return
    enqueue({ kind: 'change', label: label(field), path: path(location.href) })
  }, { capture: true, passive: true })
  const navigation = type => enqueue({ kind: 'navigation', navigation: type, path: path(location.href) })
  for (const [method, type] of [['pushState', 'push'], ['replaceState', 'replace']]) {
    const original = history[method]
    history[method] = function (...args) {
      const result = Reflect.apply(original, this, args)
      navigation(type)
      return result
    }
  }
  addEventListener('popstate', () => navigation('back_forward'))
  addEventListener('hashchange', () => navigation('hash'))
  addEventListener('pageshow', event => {
    if (event.persisted) { rememberPage(); navigation('back_forward') }
  })
  addEventListener('pagehide', () => { void flush(true) })
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') void flush(true) })
})()
