// "Feedback": click through the real site in a frame, like a design review.
// In Comment mode a click drops a numbered pin with a note. Pins are kept by
// the server with the page, the element and the spot, and come back when the
// page is opened again. Everything is drawn over the frame from the dashboard;
// store pages themselves are never changed.
(() => {
  'use strict'
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]))
  const devices = [['desktop', 'Desktop', null], ['tablet', 'Tablet', 820], ['phone', 'Phone', 390]]
  const deviceName = note => devices.find(([key]) => key === note.device)?.[1] || (note.width && note.width <= 480 ? 'Phone' : 'Desktop')
  const dashboardPages = [['/dashboard#/', 'All runs'], ['/dashboard#/tasks', 'My tasks'], ['/dashboard#/tasks/new', 'New task']]
  const remember = (key, value) => { try { localStorage.setItem(key, value) } catch { /* storage blocked */ } }
  const recall = key => { try { return localStorage.getItem(key) } catch { return null } }
  const kinds = { a: 'Link', button: 'Button', img: 'Picture', svg: 'Picture', input: 'Field', select: 'Menu', textarea: 'Text box', label: 'Label', h1: 'Heading', h2: 'Heading', h3: 'Heading', h4: 'Heading', li: 'List item', nav: 'Menu bar', header: 'Header', footer: 'Footer', form: 'Form', table: 'Table', p: 'Text', span: 'Text' }

  function create({ api, toast, icon, stores, storeName, onChange = () => {} }) {
    const state = { notes: null, loading: null, agentBrowser: false, local: false, filter: 'open', scope: 'page', selected: null, pending: null,
      mode: recall('dashboard-feedback-mode') === 'comment' ? 'comment' : 'browse', device: recall('dashboard-feedback-device') || 'desktop',
      page: recall('dashboard-feedback-page') || '/bestbuy', editing: null, confirmDelete: null, hover: null }
    if (!devices.some(([key]) => key === state.device)) state.device = 'desktop'
    let view = null

    async function load(force = false) {
      if (state.notes && !force) return state
      if (!state.loading) state.loading = api('/feedback').then(apply).finally(() => { state.loading = null })
      return state.loading
    }
    function apply(body) {
      state.notes = Array.isArray(body.comments) ? body.comments : []
      state.agentBrowser = body.agent_browser === true
      onChange()
      return state
    }
    const openCount = () => (state.notes || []).filter(note => !note.resolved).length
    const isDashboard = page => /^\/dashboard(?:[/?#]|$)/.test(page)
    const storeOf = page => stores.find(slug => page === `/${slug}` || page.startsWith(`/${slug}/`) || page.startsWith(`/${slug}?`))
    const pageLabel = page => isDashboard(page) ? 'Dashboard' : storeOf(page) ? storeName(storeOf(page)) : 'Site'
    const samePage = (a, b) => a.replace(/\/(?=$|[?#])/, '') === b.replace(/\/(?=$|[?#])/, '')
    function time(value) {
      const parsed = new Date(value)
      return Number.isFinite(parsed.getTime()) ? parsed.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : ''
    }

    // ---- The page ---------------------------------------------------------
    function render(main, { local = false } = {}) {
      state.local = local
      document.title = 'Feedback · GTA 6 Bench'
      if (window.top !== window) {
        main.innerHTML = '<section class="empty-state"><h2>Feedback is already open</h2><p class="empty-help">This page is showing inside the feedback viewer. Pick another page from the list above it.</p></section>'
        return
      }
      if (view && main.contains(view.root)) { renderNotes(); return }
      const options = `<optgroup label="Stores">${stores.map(slug => `<option value="/${escape(slug)}">${escape(storeName(slug))}</option>`).join('')}</optgroup><optgroup label="Dashboard">${dashboardPages.map(([path, name]) => `<option value="${escape(path)}">${escape(name)}</option>`).join('')}</optgroup>`
      main.innerHTML = `<div class="page-heading viewer-heading"><div><h1>Feedback</h1><p>Click through the site. Switch to <strong>Comment</strong> and click anything to leave a note on it.</p></div><div class="page-actions"><button class="button" type="button" data-feedback="copy">${icon('copy')}Copy notes</button><button class="button" type="button" data-feedback="download">${icon('down')}Download</button></div></div>
        <section class="viewer" aria-label="Feedback viewer">
          <div class="viewer-toolbar">
            <div class="viewer-nav"><button class="icon-button" type="button" data-feedback="back" aria-label="Back" title="Back">${icon('back')}</button><button class="icon-button" type="button" data-feedback="forward" aria-label="Forward" title="Forward">${icon('arrow')}</button><button class="icon-button" type="button" data-feedback="reload" aria-label="Reload" title="Reload">${icon('refresh')}</button></div>
            <select class="viewer-picker" aria-label="Jump to a page"><option value="" hidden>Jump to…</option>${options}</select>
            <form class="viewer-address"><input name="path" aria-label="Page address" autocomplete="off" spellcheck="false"></form>
            <div class="segmented viewer-devices" role="tablist" aria-label="Screen size">${devices.map(([key, name]) => `<button class="segment" type="button" role="tab" data-feedback="device" data-device="${key}" aria-selected="${key === state.device}">${icon(key)}<span>${name}</span></button>`).join('')}</div>
            <div class="segmented viewer-modes" role="tablist" aria-label="Mode"><button class="segment" type="button" role="tab" data-feedback="mode" data-mode="browse" aria-selected="${state.mode === 'browse'}" title="Browse (Esc)">${icon('pointer')}<span>Browse</span></button><button class="segment" type="button" role="tab" data-feedback="mode" data-mode="comment" aria-selected="${state.mode === 'comment'}" title="Comment (C)">${icon('pin')}<span>Comment</span></button></div>
          </div>
          <div class="viewer-body">
            <div class="viewer-stage"><div class="viewer-frame"><iframe title="Page under review" name="feedback-frame"></iframe><div class="viewer-overlay" aria-hidden="false"></div><div class="viewer-blocked" hidden></div></div></div>
            <aside class="viewer-notes" aria-label="Notes"></aside>
          </div>
        </section>`
      const root = main.querySelector('.viewer')
      view = { root, main, frame: root.querySelector('iframe'), overlay: root.querySelector('.viewer-overlay'), blocked: root.querySelector('.viewer-blocked'),
        notes: root.querySelector('.viewer-notes'), address: root.querySelector('.viewer-address input'), picker: root.querySelector('.viewer-picker'), current: state.page, pins: new Map() }
      view.frame.addEventListener('load', frameLoaded)
      bind(main)
      applyDevice(); applyMode()
      renderNotes()
      requestAnimationFrame(tick)
      // Load the notes first: they say whether this browser holds an agent link.
      const opened = view
      load(true).catch(error => toast(error.message, true)).finally(() => { if (view === opened && view.root.isConnected) { renderNotes(); navigate(state.page) } })
    }

    function frameWindow() { try { const win = view.frame.contentWindow; void win.document; return win } catch { return null } }
    function framePath(win) {
      const { pathname, search, hash } = win.location
      return pathname + search + (isDashboard(pathname) ? hash : '')
    }
    function navigate(page) {
      state.pending = null; state.selected = state.selected && notesHere(page).some(note => note.id === state.selected) ? state.selected : null
      if (state.agentBrowser && !isDashboard(page)) { view.current = page; setAddress(page); checkBlocked(); return }
      view.blocked.hidden = true
      view.frame.src = page
      view.current = page
      setAddress(page)
    }
    function setAddress(page) {
      view.address.value = page
      view.picker.value = [...view.picker.options].some(option => option.value && samePage(option.value, page)) ? [...view.picker.options].find(option => option.value && samePage(option.value, page)).value : ''
    }
    // A browser holding an agent link would send store pages into that agent's task.
    function checkBlocked() {
      const blocked = state.agentBrowser && !isDashboard(view.current)
      view.blocked.hidden = !blocked
      if (blocked) {
        view.frame.src = 'about:blank'
        view.blocked.innerHTML = '<div><h2>Open this in a private window</h2><p>This browser has opened an agent link, so store pages here would count toward that agent’s task. Open the dashboard in a private window to review the stores. Dashboard pages still work here.</p></div>'
      }
    }
    function frameLoaded() {
      const win = frameWindow()
      if (!win || win.location.href === 'about:blank') return
      const page = framePath(win)
      if (state.agentBrowser && !isDashboard(win.location.pathname)) { view.current = page; checkBlocked(); return }
      view.current = page
      state.page = page
      remember('dashboard-feedback-page', page)
      setAddress(page)
      // The dashboard changes page without reloading; follow it.
      win.addEventListener('hashchange', () => { if (view && frameWindow() === win) frameLoaded() })
      win.addEventListener('keydown', keys)
      if (state.local && !isDashboard(win.location.pathname) && /Open a generated agent URL/.test(win.document.body?.textContent || '')) {
        toast('Store pages open here on the hosted site. Locally, only dashboard pages load.', true)
      }
      if (state.reveal) { const id = state.reveal; state.reveal = null; setTimeout(() => reveal(id), 150) }
      renderNotes()
    }

    // ---- Pins -------------------------------------------------------------
    const notesHere = page => (state.notes || []).filter(note => samePage(note.page, page))
    const visible = note => state.filter === 'all' || (state.filter === 'resolved' ? note.resolved : !note.resolved)
    function locate(note, win) {
      const doc = win.document
      let element = null
      if (note.selector) { try { element = doc.querySelector(note.selector) } catch { element = null } }
      if (element && note.dx !== null && note.dx !== undefined) {
        const box = element.getBoundingClientRect()
        if (box.width || box.height) return { x: box.left + note.dx * box.width, y: box.top + note.dy * box.height }
      }
      return { x: note.x - win.scrollX, y: note.y - win.scrollY }
    }
    function tick() {
      if (!view || !view.root.isConnected) { view = null; return }
      requestAnimationFrame(tick)
      const win = frameWindow()
      const ready = win && win.location.href !== 'about:blank' && view.blocked.hidden
      const width = view.overlay.clientWidth, height = view.overlay.clientHeight
      const wanted = ready ? notesHere(view.current).filter(visible) : []
      const seen = new Set()
      for (const note of wanted) {
        let pin = view.pins.get(note.id)
        if (!pin) {
          pin = document.createElement('button')
          pin.type = 'button'
          pin.className = 'viewer-pin'
          pin.dataset.feedback = 'pin'
          pin.dataset.id = note.id
          view.overlay.append(pin)
          view.pins.set(note.id, pin)
        }
        seen.add(note.id)
        const point = locate(note, win)
        pin.textContent = note.number
        pin.classList.toggle('resolved', Boolean(note.resolved))
        pin.classList.toggle('selected', note.id === state.selected)
        pin.setAttribute('aria-label', `Note ${note.number}: ${note.text}`)
        pin.title = note.text
        pin.hidden = point.x < -12 || point.y < -12 || point.x > width + 12 || point.y > height + 12
        pin.style.transform = `translate(${Math.round(point.x)}px, ${Math.round(point.y)}px)`
      }
      for (const [id, pin] of view.pins) if (!seen.has(id)) { pin.remove(); view.pins.delete(id) }
      // The note being written sits on a pin of its own until it is saved.
      const composer = view.overlay.querySelector('.viewer-composer'), marker = view.overlay.querySelector('.viewer-pin.draft')
      if (state.pending && ready && composer) {
        const point = locate(state.pending, win)
        marker.style.transform = `translate(${Math.round(point.x)}px, ${Math.round(point.y)}px)`
        const left = Math.max(8, Math.min(point.x + 18, width - composer.offsetWidth - 8)), top = Math.max(8, Math.min(point.y - 12, height - composer.offsetHeight - 8))
        composer.style.transform = `translate(${Math.round(left)}px, ${Math.round(top)}px)`
      }
      const hover = view.overlay.querySelector('.viewer-hover')
      if (hover) {
        const box = state.mode === 'comment' && !state.pending && ready && state.hover?.isConnected ? state.hover.getBoundingClientRect() : null
        hover.hidden = !box
        if (box) Object.assign(hover.style, { transform: `translate(${box.left}px, ${box.top}px)`, width: `${box.width}px`, height: `${box.height}px` })
      }
    }
    function selectorFor(element, doc) {
      const parts = []
      for (let node = element; node && node.nodeType === 1 && node !== doc.documentElement; node = node.parentElement) {
        if (node.id && doc.querySelectorAll(`#${CSS.escape(node.id)}`).length === 1) { parts.unshift(`#${CSS.escape(node.id)}`); break }
        const tag = node.tagName.toLowerCase()
        if (tag === 'body') { parts.unshift('body'); break }
        let index = 1
        for (let sibling = node.previousElementSibling; sibling; sibling = sibling.previousElementSibling) if (sibling.tagName === node.tagName) index++
        parts.unshift(`${CSS.escape(tag)}:nth-of-type(${index})`)
      }
      const selector = parts.join(' > ')
      return selector.length <= 600 ? selector : ''
    }
    function describe(element) {
      const target = element.closest('a, button, input, select, textarea, label, img, svg, h1, h2, h3, h4, li, [role="button"]') || element
      const tag = target.tagName.toLowerCase()
      const words = (target.getAttribute('aria-label') || target.getAttribute('alt') || target.getAttribute('title') || target.getAttribute('placeholder')
        || (tag === 'input' ? target.value : '') || target.innerText || target.textContent || '').replace(/\s+/g, ' ').trim()
      const kind = target.getAttribute('role') === 'button' ? 'Button' : kinds[tag] || 'Area'
      const short = words.length > 50 ? `${words.slice(0, 49).trim()}…` : words
      return short ? `${kind} “${short}”` : kind
    }
    function startNote(x, y) {
      const win = frameWindow()
      if (!win) return
      const doc = win.document, element = doc.elementFromPoint(x, y) || doc.body
      const box = element.getBoundingClientRect()
      state.pending = {
        x: Math.round(x + win.scrollX), y: Math.round(y + win.scrollY), width: Math.round(win.innerWidth), device: state.device, title: doc.title.slice(0, 200),
        selector: selectorFor(element, doc), element: describe(element),
        dx: box.width ? Math.min(1, Math.max(0, (x - box.left) / box.width)) : null, dy: box.height ? Math.min(1, Math.max(0, (y - box.top) / box.height)) : null,
      }
      if (state.pending.dx === null || state.pending.dy === null) { state.pending.dx = null; state.pending.dy = null }
      renderComposer()
    }
    function renderComposer() {
      view.overlay.querySelector('.viewer-composer')?.remove()
      view.overlay.querySelector('.viewer-pin.draft')?.remove()
      if (!state.pending) return
      const number = (state.notes || []).reduce((max, note) => Math.max(max, note.number || 0), 0) + 1
      view.overlay.insertAdjacentHTML('beforeend', `<span class="viewer-pin draft" aria-hidden="true">${number}</span><form class="viewer-composer"><p class="viewer-composer-target">${escape(state.pending.element)}</p><textarea name="text" rows="3" maxlength="2000" placeholder="What should change here?" aria-label="Note" required></textarea><p class="form-error" role="alert"></p><div class="viewer-composer-actions"><span class="viewer-composer-hint">${navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'} Enter to save</span><button class="button quiet small" type="button" data-feedback="cancel-note">Cancel</button><button class="button primary small" type="submit">Save note</button></div></form>`)
      view.overlay.querySelector('.viewer-composer textarea').focus()
    }
    async function saveNote(form) {
      const text = form.elements.text.value.trim(), error = form.querySelector('.form-error'), button = form.querySelector('button[type="submit"]')
      if (!text) { error.textContent = 'Write a note before saving.'; return }
      button.disabled = true; button.textContent = 'Saving…'
      try {
        apply(await api('/feedback', { method: 'POST', body: { ...state.pending, page: view.current, text } }))
        const saved = state.notes.filter(note => samePage(note.page, view.current)).at(-1)
        state.pending = null; renderComposer()
        if (saved) state.selected = saved.id
        if (state.filter === 'resolved') state.filter = 'open'
        renderNotes(); scrollToCard(state.selected)
        toast('Note saved')
      } catch (problem) {
        error.textContent = problem.message
        button.disabled = false; button.textContent = 'Save note'
      }
    }
    function cancelNote() { state.pending = null; renderComposer() }

    // ---- Notes list ------------------------------------------------------
    function renderNotes() {
      if (!view) return
      const all = state.notes || [], here = notesHere(view.current)
      const pool = state.scope === 'page' ? here : all
      const shown = pool.filter(visible).sort((a, b) => state.scope === 'page' ? a.number - b.number : b.number - a.number)
      const counts = { open: pool.filter(note => !note.resolved).length, resolved: pool.filter(note => note.resolved).length, all: pool.length }
      const empty = !state.notes ? 'Loading notes…' : state.scope === 'page'
        ? (state.filter === 'resolved' ? 'No resolved notes on this page.' : 'No notes on this page yet. Switch to Comment and click anything to add one.')
        : state.filter === 'resolved' ? 'No resolved notes yet.' : 'No notes yet.'
      view.notes.innerHTML = `<div class="viewer-notes-head"><div class="segmented" role="tablist" aria-label="Which notes"><button class="segment" type="button" role="tab" data-feedback="scope" data-scope="page" aria-selected="${state.scope === 'page'}">This page<span class="segment-count">${here.filter(note => !note.resolved).length}</span></button><button class="segment" type="button" role="tab" data-feedback="scope" data-scope="all" aria-selected="${state.scope === 'all'}">All pages<span class="segment-count">${openCount()}</span></button></div>
        <select class="viewer-filter" aria-label="Show"><option value="open"${state.filter === 'open' ? ' selected' : ''}>Open (${counts.open})</option><option value="resolved"${state.filter === 'resolved' ? ' selected' : ''}>Resolved (${counts.resolved})</option><option value="all"${state.filter === 'all' ? ' selected' : ''}>All (${counts.all})</option></select></div>
        ${shown.length ? `<ol class="note-list">${shown.map(noteCard).join('')}</ol>` : `<p class="viewer-notes-empty">${escape(empty)}</p>`}`
      if (state.editing) view.notes.querySelector('.note-edit textarea')?.focus()
    }
    function noteCard(note) {
      const editing = state.editing === note.id, confirming = state.confirmDelete === note.id
      const text = editing
        ? `<form class="note-edit" data-id="${escape(note.id)}"><textarea name="text" rows="3" maxlength="2000" aria-label="Note">${escape(note.text)}</textarea><div class="note-actions"><button class="button quiet small" type="button" data-feedback="cancel-edit">Cancel</button><button class="button primary small" type="submit">Save</button></div></form>`
        : `<p class="note-text">${escape(note.text).replace(/\n/g, '<br>')}</p>`
      return `<li class="note-card${note.resolved ? ' resolved' : ''}${note.id === state.selected ? ' selected' : ''}" data-id="${escape(note.id)}">
        <button class="note-number" type="button" data-feedback="open-note" data-id="${escape(note.id)}" aria-label="Show note ${note.number} on the page">${note.resolved ? icon('check') : note.number}</button>
        <div class="note-main"><button class="note-where" type="button" data-feedback="open-note" data-id="${escape(note.id)}"><span>${escape(pageLabel(note.page))}</span><small>${escape(note.page)}</small></button>
          ${text}<p class="note-element">${escape([note.element, deviceName(note), time(note.created_at)].filter(Boolean).join(' · '))}</p>
          ${editing ? '' : `<div class="note-actions"><button class="button quiet small" type="button" data-feedback="resolve" data-id="${escape(note.id)}">${note.resolved ? 'Reopen' : `${icon('check')}Resolve`}</button><button class="button quiet small" type="button" data-feedback="edit" data-id="${escape(note.id)}">Edit</button><button class="button danger small" type="button" data-feedback="delete" data-id="${escape(note.id)}">${confirming ? 'Delete?' : 'Delete'}</button></div>`}</div></li>`
    }
    function scrollToCard(id) { view?.notes.querySelector(`.note-card[data-id="${CSS.escape(id || '')}"]`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }) }
    function reveal(id) {
      const note = (state.notes || []).find(item => item.id === id), win = frameWindow()
      if (!note || !win) return
      const point = locate(note, win)
      win.scrollBy({ top: point.y - win.innerHeight / 2, left: Math.max(0, point.x - win.innerWidth + 40), behavior: 'smooth' })
      const pin = view.pins.get(id)
      if (pin) { pin.classList.remove('flash'); void pin.offsetWidth; pin.classList.add('flash') }
    }
    function openNote(id) {
      const note = (state.notes || []).find(item => item.id === id)
      if (!note) return
      state.selected = id
      if (!visible(note)) state.filter = 'all'
      if (samePage(note.page, view.current)) { renderNotes(); reveal(id); return }
      state.reveal = id
      navigate(note.page)
      renderNotes()
    }
    async function change(id, method, body) {
      try {
        apply(await api(`/feedback/${encodeURIComponent(id)}`, { method, ...(body ? { body } : {}) }))
        if (method === 'DELETE' && state.selected === id) state.selected = null
        state.editing = null; state.confirmDelete = null
        renderNotes()
      } catch (error) { toast(error.message, true) }
    }

    // ---- Export: plain text to paste into the project chat ---------------
    function exportText() {
      const notes = (state.notes || []).filter(note => !note.resolved).sort((a, b) => a.number - b.number)
      const groups = new Map()
      for (const note of notes) {
        const label = pageLabel(note.page)
        if (!groups.has(label)) groups.set(label, [])
        groups.get(label).push(note)
      }
      const lines = [`GTA 6 Bench feedback: ${notes.length} open note${notes.length === 1 ? '' : 's'} (${new Date().toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })})`]
      for (const [label, items] of groups) {
        lines.push('', `## ${label}`)
        for (const note of items) {
          lines.push('', `#${note.number} ${note.page} · ${note.element || 'Area'} · ${deviceName(note)}${note.width ? ` (${note.width}px wide)` : ''}`)
          lines.push(...note.text.split('\n').map(line => `  ${line}`))
        }
      }
      return lines.join('\n')
    }
    async function copyNotes() {
      const text = exportText()
      try {
        await navigator.clipboard.writeText(text)
        toast('Notes copied. Paste them into the project chat.')
      } catch { download(text); toast('Couldn’t copy, so the notes were downloaded instead.') }
    }
    function download(text = exportText()) {
      const link = document.createElement('a')
      link.href = URL.createObjectURL(new Blob([text + '\n'], { type: 'text/markdown' }))
      link.download = `gta-6-bench-feedback-${new Date().toISOString().slice(0, 10)}.md`
      document.body.append(link); link.click(); link.remove()
      setTimeout(() => URL.revokeObjectURL(link.href), 1000)
    }

    // ---- Controls ---------------------------------------------------------
    function applyDevice() {
      const width = devices.find(([key]) => key === state.device)[2]
      view.root.querySelector('.viewer-frame').style.width = width ? `${width}px` : ''
      view.root.classList.toggle('framed', Boolean(width))
      for (const button of view.root.querySelectorAll('[data-feedback="device"]')) button.setAttribute('aria-selected', String(button.dataset.device === state.device))
    }
    function applyMode() {
      view.root.classList.toggle('commenting', state.mode === 'comment')
      for (const button of view.root.querySelectorAll('[data-feedback="mode"]')) button.setAttribute('aria-selected', String(button.dataset.mode === state.mode))
      if (!view.overlay.querySelector('.viewer-hover')) view.overlay.insertAdjacentHTML('afterbegin', '<span class="viewer-hover" hidden></span>')
      if (state.mode === 'browse') cancelNote()
    }
    function setMode(mode) { state.mode = mode; remember('dashboard-feedback-mode', mode); applyMode() }
    function keys(event) {
      if (!view?.root.isConnected || event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return
      const typing = event.target.closest?.('input, textarea, select, [contenteditable="true"], [contenteditable=""]')
      if (event.key === 'Escape' && state.pending) { cancelNote(); return }
      if (typing) return
      if (event.key === 'c' || event.key === 'C') { event.preventDefault(); setMode(state.mode === 'comment' ? 'browse' : 'comment') }
      if (event.key === 'Escape' && state.mode === 'comment') setMode('browse')
    }

    function bind(main) {
      if (main.dataset.feedbackBound) return
      main.dataset.feedbackBound = 'true'
      main.addEventListener('click', async event => {
        if (!view) return
        const control = event.target.closest('[data-feedback]')
        if (control && !control.disabled) {
          const action = control.dataset.feedback, id = control.dataset.id, win = frameWindow()
          if (action === 'back') win?.history.back()
          if (action === 'forward') win?.history.forward()
          if (action === 'reload') { if (win && view.blocked.hidden) win.location.reload(); else navigate(view.current) }
          if (action === 'device') { state.device = control.dataset.device; remember('dashboard-feedback-device', state.device); applyDevice() }
          if (action === 'mode') setMode(control.dataset.mode)
          if (action === 'scope') { state.scope = control.dataset.scope; renderNotes() }
          if (action === 'copy') await copyNotes()
          if (action === 'download') download()
          if (action === 'cancel-note') cancelNote()
          if (action === 'pin') { state.selected = id; const note = state.notes.find(item => item.id === id); if (note && !visible(note)) state.filter = 'all'; state.scope = 'page'; renderNotes(); scrollToCard(id) }
          if (action === 'open-note') openNote(id)
          if (action === 'resolve') { const note = state.notes.find(item => item.id === id); if (note) await change(id, 'PATCH', { resolved: !note.resolved }) }
          if (action === 'edit') { state.editing = id; state.confirmDelete = null; renderNotes() }
          if (action === 'cancel-edit') { state.editing = null; renderNotes() }
          if (action === 'delete') {
            if (state.confirmDelete === id) await change(id, 'DELETE')
            else { state.confirmDelete = id; renderNotes(); setTimeout(() => { if (state.confirmDelete === id) { state.confirmDelete = null; renderNotes() } }, 4000) }
          }
          return
        }
        // In Comment mode the overlay takes the click instead of the page.
        if (state.mode === 'comment' && event.target === view.overlay && view.blocked.hidden) {
          const box = view.overlay.getBoundingClientRect()
          startNote(event.clientX - box.left, event.clientY - box.top)
        }
      })
      main.addEventListener('change', event => {
        if (!view) return
        if (event.target === view.picker && event.target.value) navigate(event.target.value)
        if (event.target.matches('.viewer-filter')) { state.filter = event.target.value; renderNotes() }
      })
      main.addEventListener('submit', async event => {
        if (!view) return
        const form = event.target
        if (form.matches('.viewer-address')) {
          event.preventDefault()
          let path = form.elements.path.value.trim()
          try { const url = new URL(path, location.origin); if (url.origin === location.origin) path = url.pathname + url.search + url.hash } catch { /* left as typed */ }
          if (!path.startsWith('/')) path = `/${path}`
          navigate(path)
        }
        if (form.matches('.viewer-composer')) { event.preventDefault(); await saveNote(form) }
        if (form.matches('.note-edit')) {
          event.preventDefault()
          const text = form.elements.text.value.trim()
          if (text) await change(form.dataset.id, 'PATCH', { text })
        }
      })
      main.addEventListener('keydown', event => {
        if (!view) return
        if ((event.metaKey || event.ctrlKey) && event.key === 'Enter' && event.target.closest('.viewer-composer, .note-edit')) { event.preventDefault(); event.target.form.requestSubmit() }
      })
      main.addEventListener('mousemove', event => {
        if (!view || state.mode !== 'comment' || event.target !== view.overlay) { if (state) state.hover = null; return }
        const win = frameWindow(), box = view.overlay.getBoundingClientRect()
        state.hover = win?.document.elementFromPoint(event.clientX - box.left, event.clientY - box.top) || null
      })
      main.addEventListener('mouseleave', () => { state.hover = null }, true)
      // The overlay sits on the frame in Comment mode, so pass scrolling through.
      main.addEventListener('wheel', event => {
        if (!view || state.mode !== 'comment' || !event.target.closest('.viewer-overlay') || event.target.closest('.viewer-composer')) return
        event.preventDefault()
        frameWindow()?.scrollBy(event.deltaX, event.deltaY)
      }, { passive: false })
      let touchY = null
      main.addEventListener('touchstart', event => { touchY = event.target === view?.overlay ? event.touches[0].clientY : null }, { passive: true })
      main.addEventListener('touchmove', event => {
        if (touchY === null || !view) return
        const y = event.touches[0].clientY
        frameWindow()?.scrollBy(0, touchY - y)
        touchY = y
      }, { passive: true })
      document.addEventListener('keydown', keys)
    }

    return { load, render, count: openCount }
  }
  window.DashboardFeedback = { create }
})()
