// Live tracker: where each agent of the open run is right now. It reads the
// operator-only live summary and never touches the storefront pages. The same
// poll tells the run page when a task was started or submitted (onUpdate), so
// every tab stays current; it stops once every agent has finished.
(() => {
  'use strict'
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]))
  const FAST = 3000, SLOW = 15000
  const kinds = { home: 'Home page', search: 'Search results', product: 'Product page', cart: 'Cart', checkout: 'Checkout', ordered: 'Order placed', account: 'Sign-in / account', browse: 'Browsing' }
  const stages = ['home', 'search', 'product', 'cart', 'checkout', 'ordered']
  const stageNames = { home: 'Home', search: 'Search', product: 'Product', cart: 'Cart', checkout: 'Checkout', ordered: 'Order placed' }
  const actions = { click: 'Clicked', submit: 'Submitted', change: 'Changed field' }
  const stores = {
    amazon: 'Amazon', argos: 'Argos', bestbuy: 'Best Buy', chewy: 'Chewy', coupang: 'Coupang', 'eb-games-au': 'EB Games', 'game-uk': 'GAME',
    gamestop: 'GameStop', gmarket: 'Gmarket', ikea: 'IKEA', 'jb-hifi': 'JB Hi-Fi', nike: 'Nike', 'playstation-store': 'PlayStation Store',
    'rockstar-store': 'Rockstar Store', sephora: 'Sephora', 'smyths-toys': 'Smyths Toys', target: 'Target', walmart: 'Walmart',
    'williams-sonoma': 'Williams Sonoma', 'xbox-store': 'Xbox Store',
  }
  const storeName = slug => stores[slug] || String(slug || '').replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase())

  function ago(ms) {
    const seconds = Math.max(0, Math.round(ms / 1000))
    if (seconds < 5) return 'just now'
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    return minutes < 60 ? `${minutes}m ${seconds % 60}s ago` : `${Math.floor(minutes / 60)}h ${minutes % 60}m ago`
  }
  function duration(ms) {
    const seconds = Math.max(0, Math.floor(ms / 1000)), minutes = Math.floor(seconds / 60)
    if (seconds < 60) return `${seconds}s`
    return minutes < 60 ? `${minutes}m ${seconds % 60}s` : `${Math.floor(minutes / 60)}h ${minutes % 60}m`
  }

  function create({ api, agents, onUpdate }) {
    let runId = null, container = null, data = null, error = '', offset = 0, timer, ticker, sequence = 0, lastHtml = ''
    const now = () => Date.now() + offset
    const agentName = key => agents[key]?.name || key
    const agentIcon = key => agents[key]?.icon || ''

    function position(current) {
      const live = current.position
      if (current.recorded === false) return '<p class="live-quiet">This task started before location tracking, so its position is unknown.</p>'
      if (!live?.page) return '<p class="live-quiet">Opening the store…</p>'
      const seen = new Set(live.seen || [])
      const strip = stages.map(stage => `<li class="${live.page.kind === stage ? 'current' : seen.has(stage) ? 'seen' : ''}"${live.page.kind === stage ? ' aria-current="step"' : ''}>${escape(stageNames[stage])}</li>`).join('')
      const trail = (live.trail || []).map(stop => `<li title="${escape(stop.path)}">${escape(stageNames[stop.kind] || kinds[stop.kind] || 'Page')}</li>`).join('')
      const action = live.action
        ? `${escape(actions[live.action.kind] || 'Acted')}${live.action.label ? ` “${escape(live.action.label)}”` : ''} · <span data-live-since="${escape(live.action.at)}"></span>`
        : 'No clicks or form entries yet'
      return `<div class="live-now"><span class="live-label">Now on</span><strong>${escape(kinds[live.page.kind] || 'Page')}</strong><code title="${escape(live.page.path)}">${escape(live.page.path)}</code></div>
        <ol class="live-stages" aria-label="Shopping steps reached">${strip}</ol>
        <dl class="live-facts"><div><dt>Last action</dt><dd>${action}</dd></div><div><dt>Last activity</dt><dd>${live.last_at ? `<span data-live-since="${escape(live.last_at)}"></span>` : '—'}</dd></div><div><dt>Pages opened</dt><dd>${escape(live.pages)}</dd></div></dl>
        ${trail ? `<div class="live-trail"><span class="live-label">Recent pages</span><ol>${trail}</ol></div>` : ''}`
    }

    function card(entry, index) {
      const current = entry.current
      const status = entry.status === 'complete' ? 'Finished' : current ? 'Shopping' : entry.completed ? 'Between tasks' : 'Not started'
      let body
      if (current) {
        body = `<div class="live-task"><span>Task ${escape(current.index)} of ${escape(entry.total)} · ${escape(storeName(current.store))}</span><small>${escape(current.task_id)}</small><span class="live-elapsed" title="Time since Start task. There is no time limit." data-live-started="${escape(current.started_at)}"></span></div>${position(current)}`
      } else {
        const last = entry.last
        const took = Number.isFinite(last?.elapsed_ms) ? ` · took ${escape(duration(last.elapsed_ms))}` : ''
        const lastText = last ? `Last task: ${escape(last.index)} · ${escape(storeName(last.store))} · <span class="result-status ${last.grade === 'passed' ? 'passed' : last.grade === 'failed' ? 'failed' : last.grade === 'environment_error' ? 'error' : ''}">${escape(last.timed_out ? 'timed out' : String(last.grade || 'submitted').replace(/_/g, ' '))}</span>${took}` : ''
        body = `<p class="live-quiet">${entry.status === 'complete' ? `All ${escape(entry.total)} tasks submitted.` : entry.completed ? `On the task page. ${escape(entry.completed)} of ${escape(entry.total)} tasks submitted.` : 'Has not started a task yet.'}</p>${lastText ? `<p class="live-quiet">${lastText}</p>` : ''}`
      }
      const icon = agentIcon(entry.agent)
      return `<article class="live-card${current ? ' active' : ''}"><div class="live-card-top"><div class="live-agent">${icon ? `<img src="${escape(icon)}" alt="">` : ''}<strong>${escape(agentName(entry.agent))}</strong><span class="entry-number">URL ${String(index + 1).padStart(2, '0')}</span></div><span class="badge ${current ? 'orange' : entry.status === 'complete' ? 'green' : 'gray'}"><span class="status-dot"></span>${status}</span></div>${body}
        <div class="live-card-footer"><button class="button quiet small" type="button" data-action="view-traversal" data-attempt="${escape(entry.attempt_id)}">View traversal</button></div></article>`
    }

    function tick() {
      if (!container?.isConnected) return
      for (const node of container.querySelectorAll('[data-live-since]')) node.textContent = ago(now() - Date.parse(node.dataset.liveSince))
      for (const node of container.querySelectorAll('[data-live-started]')) node.textContent = `${duration(now() - Date.parse(node.dataset.liveStarted))} so far`
    }

    function render() {
      if (!container?.isConnected) return
      const heading = '<div class="panel-head"><h2>Live tracker</h2><div class="panel-actions"><button class="icon-button" type="button" data-action="refresh" aria-label="Refresh results" title="Refresh results"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 8a8 8 0 1 0 0 8M20 3v5h-5"/></svg></button></div></div>'
      let content
      if (error && !data) content = `<p class="live-error" role="alert">${escape(error)}</p>`
      else if (!data) content = '<p class="live-quiet" role="status">Loading live positions…</p>'
      else if (!data.agents.length) content = '<p class="live-quiet">Generate a session URL to track it here.</p>'
      else content = `${error ? `<p class="live-error" role="alert">Couldn’t refresh: ${escape(error)}</p>` : ''}<div class="live-grid">${data.agents.map(card).join('')}</div>`
      const html = `${heading}<div class="panel-body">${content}</div>`
      // Skip identical redraws so focus and hover stay put between updates.
      if (html !== lastHtml || !container.firstChild) { container.innerHTML = html; lastHtml = html }
      tick()
    }

    function schedule() {
      clearTimeout(timer); timer = undefined
      if (!runId) return
      // A finished run has nothing left to watch; a new session URL mounts again.
      if (data?.agents.length && data.agents.every(entry => entry.status === 'complete')) return
      timer = setTimeout(load, data?.agents.some(entry => entry.current) ? FAST : SLOW)
    }

    async function load() {
      clearTimeout(timer); timer = undefined
      if (!runId) return
      if (document.hidden) return // Resumes on visibilitychange.
      const number = ++sequence, id = runId
      try {
        const result = await api(`/runs/${encodeURIComponent(id)}/live`)
        if (number !== sequence || id !== runId) return
        offset = Date.parse(result.server_time) - Date.now() || 0
        data = result; error = ''
        onUpdate?.(result)
      } catch (failure) {
        if (number !== sequence || id !== runId) return
        error = failure.message
      }
      render(); schedule()
    }

    // The node is the tracker panel on Overview; other tabs pass none and only
    // get onUpdate.
    function mount(node, id) {
      container = node || null
      if (id !== runId) { stop(); runId = id; lastHtml = '' }
      lastHtml = ''
      render()
      clearInterval(ticker)
      ticker = setInterval(tick, 1000)
      if (!timer) load()
    }

    function stop() {
      clearTimeout(timer); clearInterval(ticker)
      timer = undefined; ticker = undefined
      runId = null; data = null; error = ''; sequence++
    }

    document.addEventListener('visibilitychange', () => { if (!document.hidden && runId) load() })
    return { mount, stop, refresh: load }
  }

  window.DashboardLive = { create, storeName }
})()
