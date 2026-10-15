(() => {
  'use strict'
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]))
  const label = value => String(value || '').replace(/_/g, ' ')
  // Passed results are green, failed red, environment errors amber.
  const tone = status => status === 'passed' ? 'passed' : status === 'failed' ? 'failed' : status === 'environment_error' ? 'error' : ''
  const bullets = lines => Array.isArray(lines) && lines.length ? `<ul>${lines.map(line => `<li>${escape(line)}</li>`).join('')}</ul>` : '<p>—</p>'
  // Expected output, actual output and failure reasons for a finished task.
  function resultSummary(task, open) {
    if (!Array.isArray(task?.expected_output) || !task.grade) return ''
    const failed = task.grade.status !== 'passed'
    return `<details class="traversal-result"${open ? ' open' : ''}><summary>Expected vs actual output · <span class="result-status ${tone(task.grade.status)}">${escape(label(task.grade.status))}</span></summary><div class="result-compare"><section><h4>Expected output</h4>${bullets(task.expected_output)}</section><section><h4>Actual output</h4>${bullets(task.actual_output)}</section></div>${failed ? `<section class="result-failure"><h4>Failure reason</h4>${bullets(task.failure_reasons)}</section>` : ''}</details>`
  }
  const active = task => !task?.completed_at && !['completed', 'complete', 'finished', 'failed', 'cancelled'].includes(task?.status)
  const navigation = { navigate: 'Navigate', reload: 'Reload', back_forward: 'Back / forward', push: 'History push', replace: 'History replace', hash: 'Fragment navigation' }

  function timestamp(event) {
    const parsed = new Date(event.at)
    const valid = Number.isFinite(parsed.getTime())
    const text = valid ? parsed.toLocaleTimeString(undefined, { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—'
    const elapsed = Number.isFinite(event.elapsed_ms) ? ` · +${(event.elapsed_ms / 1000).toFixed(1)}s` : ''
    return `<time${valid ? ` datetime="${escape(parsed.toISOString())}" title="${escape(parsed.toLocaleString())}${escape(elapsed)}"` : ''}>${escape(text)}</time>`
  }

  function eventKind(event) {
    let kind = event.kind === 'navigation' ? navigation[event.navigation] || 'Navigation' : ({ request: 'Request', page: 'Page opened', click: 'Click', submit: 'Submit', change: 'Change', start: 'Task started', complete: 'Task completed' }[event.kind] || label(event.kind) || 'Event')
    if (event.kind === 'page' && event.navigation) kind += ` · ${navigation[event.navigation] || label(event.navigation)}`
    return kind
  }

  function eventRow(event) {
    const detail = [event.label, event.path].filter(Boolean).filter((value, index, values) => values.indexOf(value) === index).join(' · ')
    return `<li class="trace-event" data-event-id="${escape(event.id)}">${timestamp(event)}<span class="trace-event-kind">${escape(eventKind(event))}</span><span class="trace-event-description">${event.method ? `<span class="trace-method">${escape(event.method)}</span> ` : ''}${Number.isFinite(event.status) ? `<span class="trace-http" aria-label="HTTP status ${escape(event.status)}">${escape(event.status)}</span> ` : ''}${escape(detail)}${Number.isFinite(event.duration_ms) ? `<small>${escape(event.duration_ms)} ms</small>` : ''}</span></li>`
  }

  function pageGraph(events) {
    const pages = new Map(), unlinked = []
    for (const event of events) {
      if (!event.page_id || !(event.kind === 'page' || (event.kind === 'request' && event.html === true))) continue
      const id = String(event.page_id)
      if (!pages.has(id)) pages.set(id, { id: `page:${id}`, pageId: id, kind: 'page', parents: new Map(), path: '', events: [], request: null })
      const page = pages.get(id)
      if (event.path) page.path = event.path
      if (event.kind === 'request') page.request = event
    }
    for (const event of events) {
      const page = pages.get(String(event.page_id))
      if (page) {
        page.events.push(event)
        if (event.parent_page_id) {
          const parent = String(event.parent_page_id)
          if (!page.parents.has(parent)) page.parents.set(parent, new Set())
          if (event.navigation && event.navigation !== 'navigate') page.parents.get(parent).add(navigation[event.navigation] || label(event.navigation))
        }
      }
      else unlinked.push(event)
    }
    const edges = []
    for (const page of pages.values()) {
      page.title = page.path || 'Page'
      page.detail = [...new Set(page.events.filter(event => event.navigation && event.navigation !== 'navigate').map(event => navigation[event.navigation] || label(event.navigation)))].join(' · ')
      for (const [parent, types] of page.parents) if (pages.has(parent)) edges.push({ from: `page:${parent}`, to: page.id, relation: 'parent', label: [...types].join(' · ') })
      page.missingParents = [...page.parents.keys()].filter(parent => !pages.has(parent))
    }
    const nodes = [...pages.values()]
    if (unlinked.length) nodes.push({ id: 'unlinked', kind: 'unlinked', title: 'Unlinked events', detail: 'No recorded page association', events: unlinked })
    return { nodes, edges }
  }

  // Layer placement uses a spanning forest, but every recorded edge remains in the graph.
  // Iterative traversal handles cycles and arbitrarily deep paths without recursion or clipping.
  function layoutGraph(graph, mode) {
    const width = 232, height = 116, gapX = 94, gapY = 40, padding = 36
    const lookup = new Map(graph.nodes.map(node => [node.id, node]))
    if (mode === 'events') {
      graph.nodes.forEach((node, index) => {
        const row = Math.floor(index / 4), column = row % 2 ? 3 - index % 4 : index % 4
        node.x = padding + column * (width + gapX); node.y = padding + row * (height + gapY)
      })
    } else {
      const ranks = new Map(), outgoing = new Map(), incoming = new Set()
      for (const edge of graph.edges) {
        if (!outgoing.has(edge.from)) outgoing.set(edge.from, [])
        outgoing.get(edge.from).push(edge.to); incoming.add(edge.to)
      }
      const place = root => {
        if (ranks.has(root)) return
        ranks.set(root, 0)
        const queue = [root]
        for (let index = 0; index < queue.length; index++) {
          const id = queue[index]
          for (const child of outgoing.get(id) || []) if (!ranks.has(child)) { ranks.set(child, ranks.get(id) + 1); queue.push(child) }
        }
      }
      for (const node of graph.nodes) if (!incoming.has(node.id)) place(node.id)
      for (const node of graph.nodes) place(node.id)
      const rows = new Map()
      for (const node of graph.nodes) {
        const rank = ranks.get(node.id), row = rows.get(rank) || 0
        rows.set(rank, row + 1)
        node.x = padding + rank * (width + gapX); node.y = padding + row * (height + gapY)
      }
    }
    let graphWidth = width + padding * 2, graphHeight = height + padding * 2
    for (const node of graph.nodes) { node.width = width; node.height = height; graphWidth = Math.max(graphWidth, node.x + width + 100); graphHeight = Math.max(graphHeight, node.y + height + 100) }
    return { ...graph, lookup, width: graphWidth, height: graphHeight }
  }

  function graphFor(events, mode) {
    if (mode === 'pages') return layoutGraph(pageGraph(events), mode)
    const nodes = events.map(event => ({ id: `event:${event.id}`, kind: 'event', title: event.label || event.path || eventKind(event), detail: eventKind(event), events: [event], request: event }))
    const edges = nodes.slice(1).map((node, index) => ({ from: nodes[index].id, to: node.id, relation: 'sequence', label: '' }))
    return layoutGraph({ nodes, edges }, mode)
  }

  function edgeMarkup(edge, graph, index) {
    const from = graph.lookup.get(edge.from), to = graph.lookup.get(edge.to)
    let path, labelX, labelY
    if (edge.relation === 'parent' && to.x <= from.x) {
      const x1 = from.x + from.width * .65, x2 = to.x + to.width * .35
      const y1 = from.y + from.height, y2 = to.y + to.height, bend = Math.max(y1, y2) + 25 + index % 4 * 12
      path = `M${x1} ${y1} C${x1} ${bend},${x2} ${bend},${x2} ${y2}`
      labelX = (x1 + x2) / 2; labelY = bend - 4
    } else if (to.x !== from.x) {
      const forward = to.x > from.x, x1 = from.x + (forward ? from.width : 0), x2 = to.x + (forward ? 0 : to.width)
      const y1 = from.y + from.height / 2, y2 = to.y + to.height / 2, bend = (x1 + x2) / 2
      path = `M${x1} ${y1} C${bend} ${y1},${bend} ${y2},${x2} ${y2}`
      labelX = bend; labelY = (y1 + y2) / 2 - 8
    } else {
      const x = from.x + from.width / 2, y1 = from.y + from.height, y2 = to.y
      path = `M${x} ${y1} L${x} ${y2}`; labelX = x + 6; labelY = (y1 + y2) / 2
    }
    return `<path class="traversal-graph-edge ${edge.relation}" data-from="${escape(edge.from)}" data-to="${escape(edge.to)}" data-relation="${edge.relation}" d="${path}" marker-end="url(#traversal-arrow)"><title>${escape(edge.relation === 'parent' ? 'Recorded parent' : 'Recorded order')}${edge.label ? ` · ${escape(edge.label)}` : ''}</title></path>${edge.label ? `<text class="traversal-edge-label" x="${labelX}" y="${labelY}" text-anchor="middle">${escape(edge.label)}</text>` : ''}`
  }

  function create({ api, replay }) {
    const dialog = document.querySelector('#traversal-dialog')
    let state = null, timer, sequence = 0, controller, drag = null, restoringFocus = false
    const find = selector => dialog.querySelector(selector)
    const basePath = () => `/runs/${encodeURIComponent(state.runId)}/attempts/${encodeURIComponent(state.attemptId)}/traversal`
    const selectedTask = () => state?.tasks.find(task => String(task.trial_id) === state.selected)
    const selectedCache = () => state?.cache.get(state.selected)
    const events = cache => [...(cache?.events.values() || [])].sort((a, b) => a.id - b.id)
    const currentView = () => {
      const cache = selectedCache()
      if (!cache) return null
      cache.mode ||= 'pages'
      cache.views ||= {}
      return cache.views[cache.mode] ||= { x: 0, y: 0, scale: 1, selected: null }
    }

    function clearPending() {
      clearTimeout(timer)
      controller?.abort()
      sequence++
    }
    function close() {
      clearPending()
      state = null
      drag = null
      if (dialog.open) dialog.close()
    }
    function schedule() {
      clearTimeout(timer)
      if (dialog.open && state && !document.hidden) timer = setTimeout(() => refresh(false), 5000)
    }
    function took(ms) {
      const seconds = Math.max(0, Math.round(ms / 1000)), minutes = Math.floor(seconds / 60)
      return seconds < 60 ? `${seconds}s` : minutes < 60 ? `${minutes}m ${seconds % 60}s` : `${Math.floor(minutes / 60)}h ${minutes % 60}m`
    }
    function renderTasks() {
      const markup = state.tasks.length ? state.tasks.map((task, index) => `<button class="traversal-task${String(task.trial_id) === state.selected ? ' selected' : ''} ${tone(task.grade?.status)}" type="button" data-traversal-task="${escape(task.trial_id)}"${String(task.trial_id) === state.selected ? ' aria-current="true"' : ''}><span class="traversal-task-name">${escape(task.task_id || `Task ${index + 1}`)}</span><span class="traversal-task-meta"><span><span class="result-status ${tone(task.grade?.status)}">${escape(label(task.grade?.status || task.status || 'In progress'))}</span>${Number.isFinite(task.elapsed_ms) ? ` · ${escape(took(task.elapsed_ms))}` : ''}</span><span>${task.recorded === false ? 'Unavailable' : `${Number(task.event_count) || 0} events`}</span></span></button>`).join('') : '<p class="traversal-empty">No tasks started yet.</p>'
      const container = find('.traversal-tasks')
      if (container.innerHTML !== markup) {
        const focused = document.activeElement?.dataset.traversalTask
        container.innerHTML = markup
        if (focused) [...container.querySelectorAll('button')].find(button => button.dataset.traversalTask === focused)?.focus({ preventScroll: true })
      }
      find('#traversal-task-count').textContent = state.tasks.length
    }
    function applyView() {
      const view = currentView(), scene = find('.traversal-graph-scene'), viewport = find('.traversal-graph-viewport')
      if (!view || !scene || !viewport) return
      scene.style.transform = `translate(${view.x}px, ${view.y}px) scale(${view.scale})`
      viewport.dataset.zoom = String(view.scale)
      viewport.scrollLeft = 0; viewport.scrollTop = 0
      find('.traversal-zoom-value').textContent = `${Math.round(view.scale * 100)}%`
    }
    function zoom(factor, point) {
      const view = currentView(), viewport = find('.traversal-graph-viewport')
      if (!view || !viewport) return
      const x = point?.x ?? viewport.clientWidth / 2, y = point?.y ?? viewport.clientHeight / 2
      const scale = Math.min(3, Math.max(.00001, view.scale * factor)), ratio = scale / view.scale
      view.x = x - (x - view.x) * ratio; view.y = y - (y - view.y) * ratio; view.scale = scale
      applyView()
    }
    function fit() {
      const view = currentView(), graph = selectedCache()?.graph, viewport = find('.traversal-graph-viewport')
      if (!view || !graph || !viewport) return
      view.scale = Math.min(1, Math.max(.00001, Math.min((viewport.clientWidth - 24) / graph.width, (viewport.clientHeight - 24) / graph.height)))
      view.x = (viewport.clientWidth - graph.width * view.scale) / 2; view.y = (viewport.clientHeight - graph.height * view.scale) / 2
      applyView()
    }
    function revealNode(button) {
      const view = currentView(), viewport = find('.traversal-graph-viewport'), node = selectedCache()?.graph?.lookup.get(button.dataset.nodeId)
      if (!view || !viewport || !node) return
      const left = node.x * view.scale + view.x, top = node.y * view.scale + view.y
      const width = node.width * view.scale, height = node.height * view.scale, margin = 14
      if (left < margin || left + width > viewport.clientWidth - margin) view.x = (viewport.clientWidth - width) / 2 - node.x * view.scale
      if (top < margin || top + height > viewport.clientHeight - margin) view.y = (viewport.clientHeight - height) / 2 - node.y * view.scale
      applyView()
    }
    function renderInspector() {
      const cache = selectedCache(), view = currentView(), inspector = find('.traversal-inspector')
      if (!cache?.graph || !view || !inspector) return
      const node = cache.graph.lookup.get(view.selected)
      if (!node) { inspector.innerHTML = '<p class="traversal-empty">Select a node to inspect its events.</p>'; return }
      const first = node.request || node.events[0] || {}, previousScroll = inspector.scrollTop
      const relationship = node.kind === 'page' && node.missingParents.length ? `<p class="traversal-inspector-note">Parent not recorded: ${node.missingParents.map(escape).join(', ')}</p>` : node.kind === 'unlinked' ? '<p class="traversal-inspector-note">These events have no recorded page association.</p>' : ''
      inspector.innerHTML = `<div class="traversal-inspector-heading"><span>${node.kind === 'page' ? 'Page' : node.kind === 'unlinked' ? 'Unlinked events' : escape(eventKind(first))}</span><h3>${escape(node.title)}</h3></div><dl class="traversal-inspector-meta"><div><dt>Recorded</dt><dd>${timestamp(first)}</dd></div>${first.method ? `<div><dt>Method</dt><dd>${escape(first.method)}</dd></div>` : ''}${Number.isFinite(first.status) ? `<div><dt>HTTP</dt><dd>${escape(first.status)}</dd></div>` : ''}${node.kind === 'event' && first.path ? `<div><dt>Path</dt><dd>${escape(first.path)}</dd></div>` : ''}</dl>${relationship}<h4 class="traversal-inspector-events">${node.events.length} event${node.events.length === 1 ? '' : 's'}</h4><ol class="trace-events">${node.events.map(eventRow).join('')}</ol>`
      inspector.scrollTop = previousScroll
    }
    function selectNode(id) {
      const view = currentView()
      if (!view || !selectedCache()?.graph?.lookup.has(id)) return
      view.selected = id
      for (const node of dialog.querySelectorAll('.traversal-graph-node')) node.setAttribute('aria-pressed', String(node.dataset.nodeId === id))
      const inspector = find('.traversal-inspector')
      if (inspector) inspector.scrollTop = 0
      renderInspector()
    }
    function renderTrace() {
      if (!state) return
      const task = selectedTask(), cache = selectedCache(), container = find('.traversal-trace')
      const available = !!(task && task.recorded !== false && cache?.loaded && cache.events.size)
      for (const control of dialog.querySelectorAll('[data-traversal-mode], [data-traversal-action="download"], [data-traversal-action="fit"], [data-traversal-action="zoom-in"], [data-traversal-action="zoom-out"]')) control.disabled = !available
      for (const control of dialog.querySelectorAll('[data-traversal-mode]')) control.setAttribute('aria-pressed', String(control.dataset.traversalMode === (cache?.mode || 'pages')))
      const replayButton = find('[data-traversal-action="replay"]')
      if (replayButton) replayButton.disabled = !replay || !(Number(task?.replay_chunks) > 0)
      if (!task) { container.innerHTML = '<p class="traversal-empty">Start a task to record its traversal.</p>'; return }
      if (task.recorded === false) { container.innerHTML = `${resultSummary(task, state.resultOpen)}<p class="traversal-empty">Traversal unavailable. This task started before recording was enabled.</p>`; return }
      if (!cache?.loaded) { container.innerHTML = '<p class="traversal-empty" role="status">Loading traversal…</p>'; return }
      const allEvents = events(cache), view = currentView(), graph = graphFor(allEvents, cache.mode)
      cache.graph = graph
      if (!graph.lookup.has(view.selected)) view.selected = graph.nodes[0]?.id || null
      const focusedNode = document.activeElement?.dataset.nodeId, focusedViewport = document.activeElement?.matches('.traversal-graph-viewport')
      const inspectorScroll = find('.traversal-inspector')?.scrollTop || 0
      const nodes = graph.nodes.map(node => {
        const first = node.request || node.events[0] || {}
        return `<button type="button" class="traversal-graph-node ${node.kind}" data-node-id="${escape(node.id)}" aria-pressed="${node.id === view.selected}" aria-label="${escape(node.title)}, ${node.events.length} event${node.events.length === 1 ? '' : 's'}" aria-controls="traversal-inspector" style="left:${node.x}px;top:${node.y}px;width:${node.width}px;height:${node.height}px"><span class="traversal-node-kind">${node.kind === 'page' ? 'Page' : node.kind === 'unlinked' ? 'Unlinked' : escape(eventKind(first))}<span>${node.kind === 'event' ? `#${escape(first.id)}` : `${node.events.length} events`}</span></span><span class="traversal-node-title" title="${escape(node.title)}">${escape(node.title)}</span><span class="traversal-node-meta">${first.method ? `<span>${escape(first.method)}</span>` : ''}${Number.isFinite(first.status) ? `<span>${escape(first.status)}</span>` : ''}${timestamp(first)}</span><span class="traversal-node-detail" title="${escape(node.detail || (node.missingParents?.length ? 'Parent not recorded' : ''))}">${escape(node.detail || (node.missingParents?.length ? 'Parent not recorded' : ''))}</span></button>`
      }).join('')
      container.innerHTML = `<div class="traversal-task-heading"><h3>${escape(task.task_id || 'Task')}</h3><span>${allEvents.length} / ${Number(cache.total ?? task.event_count) || allEvents.length} events</span></div>${resultSummary(task, state.resultOpen)}${!allEvents.length ? '<p class="traversal-empty">No events recorded yet.</p>' : `<div class="traversal-graph-workspace"><div class="traversal-graph-area"><div class="traversal-graph-viewport" tabindex="0" role="region" aria-label="Traversal graph. Drag to pan. Arrow keys pan; plus and minus zoom; zero fits the graph."><div class="traversal-graph-scene" style="width:${graph.width}px;height:${graph.height}px"><svg class="traversal-graph-edges" width="${graph.width}" height="${graph.height}" aria-hidden="true"><defs><marker id="traversal-arrow" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 8 4 0 8z"/></marker></defs>${graph.edges.map((edge, index) => edgeMarkup(edge, graph, index)).join('')}</svg>${nodes}</div></div><div class="traversal-graph-legend"><span class="${cache.mode === 'events' ? 'sequence' : 'parent'}">${cache.mode === 'events' ? 'Recorded order · dashed arrows, not causality' : 'Arrows: recorded parent → page'}</span><span>${graph.nodes.length} nodes · Drag to pan</span></div></div><section id="traversal-inspector" class="traversal-inspector" aria-label="Node details" tabindex="0"></section></div>`}`
      applyView(); renderInspector()
      if (find('.traversal-inspector')) find('.traversal-inspector').scrollTop = inspectorScroll
      // Refresh never changes the user's framing. Keyboard navigation reveals offscreen nodes.
      restoringFocus = true
      if (focusedNode) [...container.querySelectorAll('.traversal-graph-node')].find(button => button.dataset.nodeId === focusedNode)?.focus({ preventScroll: true })
      else if (focusedViewport) find('.traversal-graph-viewport')?.focus({ preventScroll: true })
      restoringFocus = false
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
          if (!state.cache.has(state.selected)) state.cache.set(state.selected, { events: new Map(), cursor: 0, total: 0, loaded: false, mode: 'pages', views: {} })
          const cache = selectedCache()
          if (!cache.loaded) renderTrace()
          if (manual || !cache.loaded || active(task) || cache.events.size < cache.total || Number(task.event_count) !== cache.total) {
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
      state = { runId, attemptId, selected: null, tasks: [], cache: new Map(), resultOpen: true }
      dialog.innerHTML = `<div class="traversal-header"><div><h2 id="traversal-title">Traversal <span>${escape(agentLabel)}</span></h2><p class="traversal-status" role="status">Loading…</p></div><button class="icon-button" type="button" data-traversal-action="close" aria-label="Close traversal" autofocus>×</button></div><div class="traversal-toolbar"><div class="traversal-modes" role="group" aria-label="Graph view"><button class="button quiet small" type="button" data-traversal-mode="pages" aria-pressed="true" disabled>Pages</button><button class="button quiet small" type="button" data-traversal-mode="events" aria-pressed="false" disabled>All events</button></div><div class="traversal-graph-controls"><button class="button secondary small" type="button" data-traversal-action="replay" title="Play back the page as the agent saw it" disabled>Watch replay</button><button class="button secondary small" type="button" data-traversal-action="refresh">Refresh</button><button class="button quiet small" type="button" data-traversal-action="zoom-out" aria-label="Zoom out" title="Zoom out" disabled>−</button><output class="traversal-zoom-value" aria-label="Zoom level">100%</output><button class="button quiet small" type="button" data-traversal-action="zoom-in" aria-label="Zoom in" title="Zoom in" disabled>+</button><button class="button quiet small" type="button" data-traversal-action="fit" disabled>Fit view</button><button class="button quiet small" type="button" data-traversal-action="download" disabled>JSON</button></div></div><p class="traversal-error" role="alert" hidden></p><div class="traversal-layout"><aside class="traversal-task-panel"><h3>Tasks <span id="traversal-task-count">0</span></h3><nav class="traversal-tasks" aria-label="Started tasks"></nav></aside><section class="traversal-trace" aria-label="Task traversal"><p class="traversal-empty">Loading traversal…</p></section></div>`
      dialog.showModal()
      refresh()
    }

    // Remember whether the output summary is open across refreshes and tasks.
    dialog.addEventListener('toggle', event => {
      if (state && event.target.matches?.('.traversal-result')) state.resultOpen = event.target.open
    }, true)
    dialog.addEventListener('click', event => {
      const taskButton = event.target.closest('[data-traversal-task]')
      if (taskButton && state) {
        state.selected = taskButton.dataset.traversalTask
        renderTasks(); renderTrace(); refresh()
        return
      }
      const nodeButton = event.target.closest('.traversal-graph-node')
      if (nodeButton) { selectNode(nodeButton.dataset.nodeId); return }
      const modeButton = event.target.closest('[data-traversal-mode]')
      if (modeButton && !modeButton.disabled && selectedCache()) {
        selectedCache().mode = modeButton.dataset.traversalMode
        renderTrace(); return
      }
      if (drag?.moved) {
        drag = null
        return
      }
      const button = event.target.closest('[data-traversal-action]')
      if (!button || button.disabled) return
      const action = button.dataset.traversalAction
      if (action === 'close') close()
      if (action === 'refresh') refresh()
      if (action === 'replay' && replay && selectedTask()) replay.open({ runId: state.runId, attemptId: state.attemptId, trialId: state.selected, taskId: selectedTask().task_id, label: find('#traversal-title span')?.textContent || '' })
      const cache = selectedCache()
      if (!cache) return
      if (action === 'zoom-in') zoom(1.25)
      if (action === 'zoom-out') zoom(.8)
      if (action === 'fit') fit()
      if (action === 'download') {
        const data = { attempt_id: state.attemptId, trial_id: state.selected, task: selectedTask(), events: events(cache), event_count: cache.total }
        const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
        const link = document.createElement('a')
        link.href = url; link.download = `traversal-${String(state.selected).replace(/[^a-zA-Z0-9_-]/g, '_')}.json`
        document.body.append(link); link.click(); link.remove()
        setTimeout(() => URL.revokeObjectURL(url), 1000)
      }
    })
    dialog.addEventListener('pointerdown', event => {
      const viewport = event.target.closest('.traversal-graph-viewport'), view = currentView()
      if (!viewport || !view || event.target.closest('button') || event.button !== 0) return
      event.preventDefault()
      viewport.focus({ preventScroll: true })
      viewport.setPointerCapture(event.pointerId)
      viewport.classList.add('dragging')
      drag = { id: event.pointerId, viewport, view, startX: event.clientX, startY: event.clientY, x: view.x, y: view.y }
    })
    dialog.addEventListener('pointermove', event => {
      if (!drag || drag.id !== event.pointerId) return
      drag.view.x = drag.x + event.clientX - drag.startX; drag.view.y = drag.y + event.clientY - drag.startY
      drag.moved = true
      applyView()
    })
    const stopDrag = () => { if (drag) drag.viewport.classList.remove('dragging'); drag = null }
    dialog.addEventListener('pointerup', stopDrag)
    dialog.addEventListener('pointercancel', stopDrag)
    dialog.addEventListener('wheel', event => {
      const viewport = event.target.closest('.traversal-graph-viewport'), view = currentView()
      if (!viewport || !view) return
      event.preventDefault()
      if (event.ctrlKey || event.metaKey) {
        const bounds = viewport.getBoundingClientRect()
        zoom(Math.exp(-event.deltaY * .008), { x: event.clientX - bounds.left, y: event.clientY - bounds.top })
      } else { view.x -= event.deltaX; view.y -= event.deltaY; applyView() }
    }, { passive: false })
    dialog.addEventListener('keydown', event => {
      if (!event.target.closest('.traversal-graph-viewport') || !currentView()) return
      const view = currentView(), distance = event.shiftKey ? 150 : 60
      if (event.key === 'ArrowLeft') view.x += distance
      else if (event.key === 'ArrowRight') view.x -= distance
      else if (event.key === 'ArrowUp') view.y += distance
      else if (event.key === 'ArrowDown') view.y -= distance
      else if (event.key === '+' || event.key === '=') zoom(1.25)
      else if (event.key === '-' || event.key === '_') zoom(.8)
      else if (event.key === '0' || event.key === 'Home') fit()
      else return
      event.preventDefault(); applyView()
    })
    dialog.addEventListener('focusin', event => {
      if (!restoringFocus && event.target.matches('.traversal-graph-node')) revealNode(event.target)
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
