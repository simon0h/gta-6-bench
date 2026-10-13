(() => {
  'use strict'
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]))
  const label = value => String(value || '').replace(/_/g, ' ')
  const active = task => !task?.completed_at && !['completed', 'complete', 'finished', 'failed', 'cancelled'].includes(task?.status)
  const navigation = { navigate: 'Navigate', reload: 'Reload', back_forward: 'Back / forward', push: 'History push', replace: 'History replace', hash: 'Fragment navigation' }

  function timestamp(event) {
    const parsed = new Date(event.at)
    const valid = Number.isFinite(parsed.getTime())
    const text = valid ? parsed.toLocaleTimeString(undefined, { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—'
    const elapsed = Number.isFinite(event.elapsed_ms) ? ` · +${(event.elapsed_ms / 1000).toFixed(1)}s` : ''
    return `<time${valid ? ` datetime="${escape(parsed.toISOString())}" title="${escape(parsed.toLocaleString())}${escape(elapsed)}"` : ''}>${escape(text)}</time>`
  }

  function eventRow(event) {
    let kind = event.kind === 'navigation' ? navigation[event.navigation] || 'Navigation' : ({ request: 'Request', page: 'Page opened', click: 'Click', submit: 'Submit', change: 'Change', start: 'Task started', complete: 'Task completed' }[event.kind] || label(event.kind) || 'Event')
    if (event.kind === 'page' && event.navigation) kind += ` · ${navigation[event.navigation] || label(event.navigation)}`
    const detail = [event.label, event.path].filter(Boolean).filter((value, index, values) => values.indexOf(value) === index).join(' · ')
    return `<li class="trace-event">${timestamp(event)}<span class="trace-event-kind">${escape(kind)}</span><span class="trace-event-description">${event.method ? `<span class="trace-method">${escape(event.method)}</span> ` : ''}${Number.isFinite(event.status) ? `<span class="trace-http" aria-label="HTTP status ${escape(event.status)}">${escape(event.status)}</span> ` : ''}${escape(detail)}${Number.isFinite(event.duration_ms) ? `<small>${escape(event.duration_ms)} ms</small>` : ''}</span></li>`
  }

  // Build a spanning forest iteratively. Missing parents and cycles still produce visible pages.
  function pageForest(events) {
    const pages = new Map(), unlinked = []
    for (const event of events) {
      if (!event.page_id || !(event.kind === 'page' || (event.kind === 'request' && event.html === true))) continue
      const id = String(event.page_id)
      if (!pages.has(id)) pages.set(id, { id, parent: null, path: '', events: [], children: [], request: null })
      const page = pages.get(id)
      if (event.parent_page_id) page.parent = String(event.parent_page_id)
      if (event.path) page.path = event.path
      if (event.kind === 'request') page.request = event
    }
    for (const event of events) {
      const page = pages.get(String(event.page_id))
      if (page) page.events.push(event)
      else unlinked.push(event)
    }
    const roots = []
    for (const page of pages.values()) {
      if (page.parent && page.parent !== page.id && pages.has(page.parent)) pages.get(page.parent).children.push(page.id)
      else roots.push(page.id)
    }
    const ordered = [], visited = new Set()
    const visit = (id, detached) => {
      const stack = [{ id, depth: 0, parent: null, detached }]
      while (stack.length) {
        const item = stack.pop()
        if (visited.has(item.id)) continue
        visited.add(item.id)
        const page = pages.get(item.id)
        ordered.push({ ...page, depth: item.depth, viewParent: item.parent, detached: item.detached })
        for (let index = page.children.length - 1; index >= 0; index--) stack.push({ id: page.children[index], depth: item.depth + 1, parent: page.id, detached: false })
      }
    }
    for (const id of roots) visit(id, false)
    for (const id of pages.keys()) if (!visited.has(id)) visit(id, true)
    return { pages: ordered, unlinked }
  }

  function create({ api }) {
    const dialog = document.querySelector('#traversal-dialog')
    let state = null, timer, sequence = 0, controller
    const find = selector => dialog.querySelector(selector)
    const basePath = () => `/runs/${encodeURIComponent(state.runId)}/attempts/${encodeURIComponent(state.attemptId)}/traversal`
    const selectedTask = () => state?.tasks.find(task => String(task.trial_id) === state.selected)
    const selectedCache = () => state?.cache.get(state.selected)
    const events = cache => [...(cache?.events.values() || [])].sort((a, b) => a.id - b.id)

    function clearPending() {
      clearTimeout(timer)
      controller?.abort()
      sequence++
    }
    function close() {
      clearPending()
      state = null
      if (dialog.open) dialog.close()
    }
    function schedule() {
      clearTimeout(timer)
      if (dialog.open && state && !document.hidden) timer = setTimeout(() => refresh(false), 5000)
    }
    function renderTasks() {
      const markup = state.tasks.length ? state.tasks.map((task, index) => `<button class="traversal-task${String(task.trial_id) === state.selected ? ' selected' : ''}" type="button" data-traversal-task="${escape(task.trial_id)}"${String(task.trial_id) === state.selected ? ' aria-current="true"' : ''}><span class="traversal-task-name">${escape(task.task_id || `Task ${index + 1}`)}</span><span class="traversal-task-meta"><span>${escape(label(task.grade?.status || task.status || 'In progress'))}</span><span>${task.recorded === false ? 'Unavailable' : `${Number(task.event_count) || 0} events`}</span></span></button>`).join('') : '<p class="traversal-empty">No tasks started yet.</p>'
      const container = find('.traversal-tasks')
      if (container.innerHTML !== markup) {
        const focused = document.activeElement?.dataset.traversalTask
        container.innerHTML = markup
        if (focused) [...container.querySelectorAll('button')].find(button => button.dataset.traversalTask === focused)?.focus({ preventScroll: true })
      }
      find('#traversal-task-count').textContent = state.tasks.length
    }
    function renderTrace() {
      if (!state) return
      const task = selectedTask(), cache = selectedCache(), container = find('.traversal-trace')
      find('[data-traversal-action="download"]').disabled = !cache?.events.size
      find('[data-traversal-action="expand"]').disabled = !cache?.events.size
      find('[data-traversal-action="collapse"]').disabled = !cache?.events.size
      if (!task) { container.innerHTML = '<p class="traversal-empty">Start a task to record its traversal.</p>'; return }
      if (task.recorded === false) { container.innerHTML = '<p class="traversal-empty">Traversal unavailable. This task started before recording was enabled.</p>'; return }
      if (!cache?.loaded) { container.innerHTML = '<p class="traversal-empty" role="status">Loading traversal…</p>'; return }
      const allEvents = events(cache), forest = pageForest(allEvents)
      const visible = new Map()
      const pages = forest.pages.map((page, index) => {
        const shown = page.viewParent === null || (visible.get(page.viewParent) && !cache.collapsed.has(page.viewParent))
        visible.set(page.id, shown)
        if (!shown) return ''
        const expanded = !cache.collapsed.has(page.id), bodyId = `trace-page-${index}`
        const first = page.request || page.events[0] || {}
        return `<li class="trace-page" style="--trace-depth:${Math.min(page.depth, 5)}"><button type="button" class="trace-page-toggle" data-traversal-page="${escape(page.id)}" aria-expanded="${expanded}" aria-controls="${bodyId}" aria-label="${escape(page.path || 'Page')}, level ${page.depth + 1}"><span class="trace-chevron" aria-hidden="true">${expanded ? '−' : '+'}</span><span class="trace-page-path">${escape(page.path || 'Page')}${page.detached ? '<small>Unlinked parent</small>' : ''}</span><span class="trace-page-meta">${first.method ? `<span>${escape(first.method)}</span>` : ''}${Number.isFinite(first.status) ? `<span aria-label="HTTP status ${escape(first.status)}">${escape(first.status)}</span>` : ''}${timestamp(first)}</span></button><div id="${bodyId}"${expanded ? '' : ' hidden'}><ol class="trace-events">${page.events.map(eventRow).join('')}</ol></div></li>`
      }).join('')
      const focusedPage = document.activeElement?.dataset.traversalPage
      const scroll = container.scrollTop
      container.innerHTML = `<div class="traversal-task-heading"><h3>${escape(task.task_id || 'Task')}</h3><span>${allEvents.length} / ${Number(cache.total ?? task.event_count) || allEvents.length} events</span></div>${!allEvents.length ? '<p class="traversal-empty">No events recorded yet.</p>' : ''}${pages ? `<ol class="trace-tree" aria-label="Pages visited">${pages}</ol>` : ''}${forest.unlinked.length ? `<section class="trace-unlinked"><h4>Requests and task events</h4><ol class="trace-events">${forest.unlinked.map(eventRow).join('')}</ol></section>` : ''}`
      container.scrollTop = scroll
      if (focusedPage) [...container.querySelectorAll('[data-traversal-page]')].find(button => button.dataset.traversalPage === focusedPage)?.focus({ preventScroll: true })
    }
    async function refresh(manual = true) {
      if (!state || !dialog.open || (!manual && document.hidden)) return
      clearPending()
      const request = sequence, session = state
      controller = new AbortController()
      const signal = controller.signal
      const valid = () => state === session && request === sequence && dialog.open
      const status = find('.traversal-status'), errorNode = find('.traversal-error')
      status.textContent = 'Refreshing…'
      errorNode.hidden = true
      find('[data-traversal-action="refresh"]').disabled = true
      try {
        const list = await api(basePath(), { signal })
        if (!valid()) return
        state.tasks = Array.isArray(list.tasks) ? list.tasks : []
        if (!state.tasks.some(task => String(task.trial_id) === state.selected)) {
          const task = state.tasks.find(active) || state.tasks[0]
          state.selected = task ? String(task.trial_id) : null
        }
        renderTasks()
        const task = selectedTask()
        if (!task || task.recorded === false) renderTrace()
        else {
          if (!state.cache.has(state.selected)) state.cache.set(state.selected, { events: new Map(), collapsed: new Set(), cursor: 0, total: 0, loaded: false })
          const cache = selectedCache()
          if (!cache.loaded) renderTrace()
          if (manual || !cache.loaded || active(task) || Number(task.event_count) !== cache.total) {
            let pages = 0, cursor = cache.cursor
            do {
              const batch = await api(`${basePath()}/${encodeURIComponent(state.selected)}?after=${cursor}`, { signal })
              if (!valid()) return
              for (const event of Array.isArray(batch.events) ? batch.events : []) {
                if (Number.isSafeInteger(event.id) && event.id > 0) { cache.events.set(event.id, event); cache.cursor = Math.max(cache.cursor, event.id) }
              }
              cache.total = Number(batch.event_count) || cache.events.size
              cache.loaded = true
              const next = Number(batch.next_cursor)
              if (batch.next_cursor == null || !Number.isSafeInteger(next) || next <= cursor) break
              cursor = next
            } while (++pages < 50)
            renderTrace()
          }
        }
        status.textContent = `Updated ${new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })} · Refreshes every 5s`
      } catch (error) {
        if (!valid() || error.name === 'AbortError') return
        errorNode.textContent = error.message || 'Couldn’t load traversal.'
        errorNode.hidden = false
        status.textContent = 'Refresh failed'
      } finally {
        if (valid()) { find('[data-traversal-action="refresh"]').disabled = false; schedule() }
      }
    }
    function open({ runId, attemptId, label: agentLabel }) {
      close()
      state = { runId, attemptId, selected: null, tasks: [], cache: new Map() }
      dialog.innerHTML = `<div class="traversal-header"><div><h2 id="traversal-title">Traversal <span>${escape(agentLabel)}</span></h2><p class="traversal-status" role="status">Loading…</p></div><button class="icon-button" type="button" data-traversal-action="close" aria-label="Close traversal" autofocus>×</button></div><div class="traversal-toolbar"><span>Pages and actions</span><div><button class="button secondary small" type="button" data-traversal-action="refresh">Refresh</button><button class="button quiet small" type="button" data-traversal-action="expand" disabled>Expand all</button><button class="button quiet small" type="button" data-traversal-action="collapse" disabled>Collapse all</button><button class="button quiet small" type="button" data-traversal-action="download" disabled>JSON</button></div></div><p class="traversal-error" role="alert" hidden></p><div class="traversal-layout"><aside class="traversal-task-panel"><h3>Tasks <span id="traversal-task-count">0</span></h3><nav class="traversal-tasks" aria-label="Started tasks"></nav></aside><section class="traversal-trace" aria-label="Task traversal" tabindex="0"><p class="traversal-empty">Loading traversal…</p></section></div>`
      dialog.showModal()
      refresh()
    }

    dialog.addEventListener('click', event => {
      const taskButton = event.target.closest('[data-traversal-task]')
      if (taskButton && state) {
        state.selected = taskButton.dataset.traversalTask
        renderTasks(); renderTrace(); refresh()
        return
      }
      const pageButton = event.target.closest('[data-traversal-page]')
      if (pageButton && selectedCache()) {
        const collapsed = selectedCache().collapsed, id = pageButton.dataset.traversalPage
        if (collapsed.has(id)) collapsed.delete(id); else collapsed.add(id)
        renderTrace()
        return
      }
      const button = event.target.closest('[data-traversal-action]')
      if (!button || button.disabled) return
      const action = button.dataset.traversalAction
      if (action === 'close') close()
      if (action === 'refresh') refresh()
      const cache = selectedCache()
      if (!cache) return
      if (action === 'expand') { cache.collapsed.clear(); renderTrace() }
      if (action === 'collapse') { cache.collapsed = new Set(pageForest(events(cache)).pages.map(page => page.id)); renderTrace() }
      if (action === 'download') {
        const data = { attempt_id: state.attemptId, trial_id: state.selected, task: selectedTask(), events: events(cache), event_count: cache.total }
        const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
        const link = document.createElement('a')
        link.href = url; link.download = `traversal-${String(state.selected).replace(/[^a-zA-Z0-9_-]/g, '_')}.json`
        document.body.append(link); link.click(); link.remove()
        setTimeout(() => URL.revokeObjectURL(url), 1000)
      }
    })
    dialog.addEventListener('close', () => { if (!dialog.open) { clearPending(); state = null } })
    document.addEventListener('visibilitychange', () => {
      if (!dialog.open || !state) return
      if (document.hidden) { clearPending(); find('.traversal-status').textContent = 'Refresh paused' }
      else refresh(false)
    })
    return { open, close }
  }
  window.DashboardTraversal = { create }
})()
