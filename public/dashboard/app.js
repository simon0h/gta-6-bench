(() => {
  'use strict'
  const agents = {
    grokbot: { name: 'Grokbot', icon: '/dashboard/assets/agents/grokbot.webp' },
    dots: { name: 'Dots', icon: '/dashboard/assets/agents/dots.svg' },
    muse: { name: 'Muse', icon: '/dashboard/assets/agents/muse.webp' },
  }
  const paths = {
    plus: '<path d="M12 5v14M5 12h14"/>',
    arrow: '<path d="m9 5 7 7-7 7"/>',
    external: '<path d="M14 3h7v7M10 14 21 3M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/>',
    run: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h3"/>',
    link: '<path d="M10 13a5 5 0 0 0 7 .2l3-3a5 5 0 0 0-7-7l-2 2M14 11a5 5 0 0 0-7-.2l-3 3a5 5 0 0 0 7 7l2-2"/>',
    copy: '<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    refresh: '<path d="M20 8a8 8 0 1 0 0 8M20 3v5h-5"/>',
    tasks: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="m8 8 1 1 2-2M14 8h2M8 13h8M8 17h5"/>',
    prompt: '<path d="m5 6 6 6-6 6M13 18h6"/>',
    send: '<path d="M12 19V5M6 11l6-6 6 6"/>',
    spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    chat: '<path d="M5 18.5V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H8.5z"/><path d="M8.5 9h7M8.5 12h4.5"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
  }
  const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.run}</svg>`
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]))
  const $ = selector => document.querySelector(selector)
  const state = { runs: [], selected: null, loading: true, authenticated: false, local: false, drafts: new Map(), saving: new Set(), loadNumber: 0, runTab: 'overview', resultsView: { filter: 'all', agent: 'all', query: '' }, openResults: new Set(), summaries: new Map(), writingSummary: new Set(), summaryErrors: new Map(), chats: new Map(), chatDrafts: new Map(), chatAnswers: new Map(), chatErrors: new Map() }
  let toastTimer
  // The run page is split into tabs, as on Cloudflare's dashboard. The open tab is remembered on this device.
  const runTabs = [['overview', 'Overview'], ['results', 'Results'], ['agents', 'Agents']]
  try { const saved = localStorage.getItem('dashboard-run-tab'); if (runTabs.some(([key]) => key === saved)) state.runTab = saved } catch { /* storage blocked */ }
  function setRunTab(tab) {
    state.runTab = tab
    try { localStorage.setItem('dashboard-run-tab', tab) } catch { /* storage blocked */ }
  }
  // The run chat is a small window in the bottom right corner. Whether it is open is remembered on this device.
  try { state.chatOpen = localStorage.getItem('dashboard-chat-open') === 'true' } catch { state.chatOpen = false }
  function setChatOpen(open) {
    state.chatOpen = open
    try { localStorage.setItem('dashboard-chat-open', String(open)) } catch { /* storage blocked */ }
    const panel = $('.run-chat'), launcher = $('.chat-launcher'), label = open ? 'Close chat' : 'Chat about this run'
    if (panel) { panel.hidden = !open; panel.classList.toggle('opening', open) }
    if (launcher) { launcher.setAttribute('aria-expanded', String(open)); launcher.setAttribute('aria-label', label); launcher.title = label; launcher.innerHTML = launcherIcon(open) }
    if (open) { scrollChat(); $('.chat-form textarea')?.focus() }
  }
  const live = window.DashboardLive.create({ api, agents })

  async function api(path, options = {}) {
    const response = await fetch(`/dashboard/api${path}`, {
      credentials: 'same-origin', ...options,
      headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers },
      ...(options.body ? { body: JSON.stringify(options.body) } : {}),
    })
    let body
    try { body = await response.json() } catch { body = {} }
    if (!response.ok) {
      if (response.status === 401 && path !== '/login') showAuth()
      throw new Error(body.error?.message || body.message || (typeof body.error === 'string' && body.error) || `Request failed (${response.status}). Please try again.`)
    }
    return body
  }
  const traversal = window.DashboardTraversal.create({ api, replay: window.DashboardReplay?.create({ api }) })
  const tasks = window.DashboardTasks.create({ api, toast, icon })

  function toast(message, error = false) {
    clearTimeout(toastTimer)
    const node = $('#toast')
    node.textContent = message
    node.classList.toggle('error', error)
    node.hidden = false
    toastTimer = setTimeout(() => { node.hidden = true }, 3800)
  }

  function date(value, includeTime = false) {
    const parsed = new Date(value)
    if (!Number.isFinite(parsed.getTime())) return 'Just created'
    return parsed.toLocaleDateString(undefined, { month: 'short', day: 'numeric', ...(includeTime ? { hour: 'numeric', minute: '2-digit' } : { year: 'numeric' }) })
  }
  function duration(ms) {
    if (!Number.isFinite(ms)) return '—'
    const seconds = Math.max(0, Math.round(ms / 1000)), minutes = Math.floor(seconds / 60)
    if (seconds < 60) return `${seconds}s`
    return minutes < 60 ? `${minutes}m ${seconds % 60}s` : `${Math.floor(minutes / 60)}h ${minutes % 60}m`
  }
  function taskCount(run) { return Number(run.task_count ?? run.tasks?.length ?? (run.suite === 'all240' ? 240 : 30)) }
  function attempts(run) { return Array.isArray(run?.attempts) ? run.attempts : [] }
  function suiteName(run) { return run.suite === 'all240' ? 'All 240 tasks' : run.suite === 'custom' ? `My tasks (${taskCount(run)})` : 'Original 30 tasks' }
  // Tasks written in the dashboard show their name; built-in tasks their id.
  function taskLabel(run, id) { return run?.tasks?.find(task => task.id === id)?.name || id }
  function attemptCount(run) { return run.attempt_count ?? attempts(run).length }
  function runName(run) { return run.name || `Run ${date(run.created_at)}` }
  function agentData(key) { return agents[key] || agents.grokbot }
  function storeName(slug) { return window.DashboardLive.storeName(slug) || '—' }
  function entryUrl(attempt) { return new URL(attempt.url || `/agent/${encodeURIComponent(attempt.token || attempt.id)}`, location.origin).href }
  function resultList(attempt) {
    if (Array.isArray(attempt.results)) return attempt.results
    if (attempt.results) return Object.values(attempt.results)
    return (attempt.trials || []).filter(trial => trial.result).map(trial => ({ task_id: trial.task_id, ...trial.result }))
  }
  function progress(attempt, run) {
    const total = Number(attempt.total ?? attempt.progress?.total ?? taskCount(run))
    const completed = Number(attempt.completed ?? attempt.progress?.completed ?? resultList(attempt).length)
    return { total, completed, percentage: total > 0 ? Math.min(100, Math.max(0, completed / total * 100)) : 0 }
  }
  function statusBadge(attempt) {
    const raw = String(attempt.status || 'ready').toLowerCase()
    const complete = ['completed', 'complete', 'finished'].includes(raw)
    const active = ['running', 'active', 'in_progress', 'started'].includes(raw)
    const label = complete ? 'Completed' : active ? 'In progress' : ['ready', 'pending', 'created', 'idle'].includes(raw) ? 'Ready' : raw.replace(/_/g, ' ').replace(/^./, c => c.toUpperCase())
    return `<span class="badge ${complete ? 'green' : active ? 'orange' : 'gray'}"><span class="status-dot"></span>${escape(label)}</span>`
  }
  function options(selected) { return Object.entries(agents).map(([key, agent]) => `<option value="${key}"${key === selected ? ' selected' : ''}>${agent.name}</option>`).join('') }
  function setRun(run) {
    const index = state.runs.findIndex(item => item.id === run.id)
    if (index === -1) state.runs.unshift(run)
    else state.runs[index] = { ...state.runs[index], ...run }
    state.selected = run
  }
  function updateRun(run) {
    const index = state.runs.findIndex(item => item.id === run.id)
    if (index !== -1) state.runs[index] = { ...state.runs[index], ...run }
    if (state.selected?.id === run.id) state.selected = run
  }
  function getDraft(attempt) {
    if (!state.drafts.has(attempt.id)) state.drafts.set(attempt.id, { agent: attempt.agent || 'grokbot', tags: (attempt.tags || []).join(', '), comments: attempt.comments || '', dirty: false })
    return state.drafts.get(attempt.id)
  }

  function renderSidebar() {
    const view = route().view
    $('#run-count').textContent = state.runs.length
    $('#task-count').textContent = tasks.count()
    $('#overview-link').classList.toggle('active', view === 'overview')
    $('#tasks-link').classList.toggle('active', view === 'tasks' || view === 'task')
    $('#recent-runs').innerHTML = state.runs.length ? state.runs.slice(0, 12).map(run => `<a class="recent-run${state.selected?.id === run.id ? ' selected' : ''}" href="#/runs/${encodeURIComponent(run.id)}"${state.selected?.id === run.id ? ' aria-current="page"' : ''}>${icon('run')}<span>${escape(runName(run))}</span></a>`).join('') : '<p class="sidebar-empty">No runs yet.</p>'
  }

  function renderOverview() {
    live.stop()
    document.title = 'Runs · GTA 6 Bench'
    const links = state.runs.reduce((sum, run) => sum + attemptCount(run), 0)
    const complete = state.runs.reduce((sum, run) => sum + attempts(run).filter(entry => ['completed', 'complete', 'finished'].includes(entry.status)).length, 0)
    $('#main').innerHTML = `
      <div class="stats-grid" role="group" aria-label="Run summary"><div class="stat"><div class="stat-label">${icon('run')}Total runs</div><div class="stat-value">${state.runs.length}</div></div><div class="stat"><div class="stat-label">${icon('link')}Agent URLs</div><div class="stat-value">${links}</div></div><div class="stat"><div class="stat-label">${icon('check')}Completed attempts</div><div class="stat-value">${complete}</div></div></div>
      ${state.runs.length ? `<section class="panel"><div class="panel-head"><h2>Run history</h2><span class="panel-sub">${state.runs.length} run${state.runs.length === 1 ? '' : 's'}</span><div class="panel-actions"><button class="icon-button" data-action="refresh" aria-label="Refresh runs" title="Refresh runs">${icon('refresh')}</button><button class="button primary small" data-action="new-run">${icon('plus')}New run</button></div></div><div class="run-list" role="region" aria-label="Run history" tabindex="0"><table class="run-table"><thead><tr><th scope="col">Run</th><th scope="col">Task set</th><th scope="col">Agents</th><th scope="col">Progress</th><th scope="col">Created</th></tr></thead><tbody>${state.runs.map(run => {
        const entries = attempts(run)
        const completed = entries.reduce((sum, entry) => sum + progress(entry, run).completed, 0)
        const total = entries.reduce((sum, entry) => sum + progress(entry, run).total, 0)
        const percentage = total > 0 ? Math.min(100, completed / total * 100) : 0
        return `<tr class="run-row"><td class="run-name-cell"><a class="run-name" href="#/runs/${encodeURIComponent(run.id)}"><span class="run-symbol">${icon('run')}</span><span class="run-row-text"><span class="run-title">${escape(runName(run))}</span><small class="run-id">${escape(String(run.id).slice(0, 8))}</small></span>${icon('arrow')}</a></td><td class="run-suite-cell">${suiteName(run)}</td><td class="run-agents-cell"><div class="run-agents">${entries.length ? `<span class="agent-stack" aria-hidden="true">${entries.slice(0, 5).map(attempt => `<img src="${agentData(attempt.agent).icon}" alt="">`).join('')}</span>` : ''}<span class="attempt-count">${attemptCount(run)} / 5</span></div></td><td class="run-progress-cell"><div class="progress-group"><div class="progress-track" role="progressbar" aria-label="${escape(runName(run))} task progress" aria-valuenow="${completed}" aria-valuemin="0" aria-valuemax="${total || 1}"><div class="progress-fill" style="width:${percentage}%"></div></div><span>${completed} / ${total}</span></div></td><td class="run-date-cell">${escape(date(run.created_at, true))}</td></tr>`
      }).join('')}</tbody></table></div></section>` : `<section class="empty-state"><h2>No runs yet</h2><button class="button primary" data-action="new-run">${icon('plus')}New run</button></section>`}`
    renderSidebar()
  }

  // Passed results are green, failed red, environment errors amber.
  function resultTone(result) {
    const status = result.grade?.status
    return status === 'passed' ? 'passed' : status === 'failed' ? 'failed' : status === 'environment_error' ? 'error' : 'pending'
  }
  function resultBadge(result) {
    const status = result.grade?.status || result.outcome || result.status || 'Submitted'
    return `<span class="badge result-badge ${resultTone(result)}"><span class="status-dot"></span>${escape(status.replace(/_/g, ' ').replace(/^./, char => char.toUpperCase()))}</span>`
  }
  // Every task result in the run, newest agent URL last, each with a stable key.
  function runResults(run) {
    return attempts(run).flatMap((attempt, index) => resultList(attempt).map((result, n) => ({ attempt, index, result, key: `${attempt.id}:${result.task_id || n}` })))
  }
  // The All / Failed / Passed filter. "Failed" holds every graded task that did not pass.
  const resultFilters = [['all', 'All'], ['failed', 'Failed'], ['passed', 'Passed']]
  function renderResultsTab(run) {
    const rows = runResults(run), view = state.resultsView, entries = attempts(run)
    if (!rows.length) return `<section class="empty-state"><h2>No results yet</h2><p class="empty-help">Each task shows up here once an agent submits it.</p></section>`
    if (view.agent !== 'all' && !entries.some(attempt => attempt.id === view.agent)) view.agent = 'all'
    const segments = resultFilters.map(([key, name]) => `<button class="segment ${key}" type="button" role="tab" data-action="result-filter" data-filter="${key}" aria-selected="${key === view.filter}">${name}<span class="segment-count"></span></button>`).join('')
    const agentPicker = entries.length > 1 ? `<select id="results-agent" aria-label="Agent"><option value="all">All agents</option>${entries.map((attempt, index) => `<option value="${escape(attempt.id)}"${view.agent === attempt.id ? ' selected' : ''}>${escape(agentData(attempt.agent).name)} · URL ${String(index + 1).padStart(2, '0')}</option>`).join('')}</select>` : ''
    const groups = rows.map(({ attempt, result, key }, n) => {
      const tone = resultTone(result), open = state.openResults.has(key), agent = agentData(attempt.agent)
      const label = taskLabel(run, result.task_id) || result.task?.id || result.id || `Task ${n + 1}`, store = result.store ? storeName(result.store) : '—'
      return `<tbody class="result-group ${tone}${open ? ' open' : ''}" data-tone="${tone}" data-task="${escape(result.task_id || '')}" data-attempt="${escape(attempt.id)}" data-key="${escape(key)}" data-ms="${Number.isFinite(result.elapsed_ms) ? result.elapsed_ms : ''}" data-search="${escape(`${label} ${result.task_id || ''} ${store} ${agent.name}`.toLowerCase())}">
        <tr class="result-row" data-action="toggle-result" tabindex="0" aria-expanded="${open}"><td class="result-task"><span class="chevron">${icon('arrow')}</span><span>${escape(label)}</span></td><td class="result-store">${escape(store)}</td><td class="result-agent"><span class="agent-cell"><img src="${agent.icon}" alt="">${escape(agent.name)}</span></td><td>${resultBadge(result)}</td><td class="result-time">${escape(duration(result.elapsed_ms))}</td></tr>
        <tr class="result-outputs"${open ? '' : ' hidden'}><td colspan="5">${resultOutputs(result)}<div class="result-links"><button class="button quiet small" type="button" data-action="view-traversal" data-attempt="${escape(attempt.id)}">${icon('tasks')}View traversal</button></div></td></tr></tbody>`
    }).join('')
    return `<section class="panel results-panel" id="results-panel" aria-label="Task results"><div class="results-toolbar"><div class="segmented" role="tablist" aria-label="Filter task results">${segments}</div><label class="results-search">${icon('search')}<input id="results-query" type="search" placeholder="Filter by task, store or agent" aria-label="Filter by task, store or agent" value="${escape(view.query)}" autocomplete="off"></label>${agentPicker}<span class="results-total" id="results-total" role="status"></span></div>
      <div class="table-scroll"><table class="result-table"><thead><tr><th scope="col">Task</th><th scope="col">Store</th><th scope="col">Agent</th><th scope="col">Result</th><th scope="col">Time taken</th></tr></thead>${groups}</table></div><p class="result-empty" hidden>No tasks match.</p></section>`
  }
  // Filtering happens in place, so typing in the filter box keeps its focus.
  function applyResults() {
    const panel = $('#results-panel')
    if (!panel) return
    const view = state.resultsView, query = view.query.trim().toLowerCase(), counts = { all: 0, failed: 0, passed: 0 }
    let shown = 0, time = 0
    for (const group of panel.querySelectorAll('.result-group')) {
      const tone = group.dataset.tone, failed = tone === 'failed' || tone === 'error'
      const visible = (view.agent === 'all' || group.dataset.attempt === view.agent) && (!query || group.dataset.search.includes(query))
      if (visible) { counts.all++; if (tone === 'passed') counts.passed++; if (failed) counts.failed++ }
      const match = visible && (view.filter === 'all' || (view.filter === 'passed' ? tone === 'passed' : failed))
      group.hidden = !match
      if (match) { shown++; time += Number(group.dataset.ms) || 0 }
    }
    for (const tab of panel.querySelectorAll('[data-action="result-filter"]')) {
      tab.setAttribute('aria-selected', String(tab.dataset.filter === view.filter))
      tab.querySelector('.segment-count').textContent = counts[tab.dataset.filter]
    }
    panel.querySelector('.result-empty').hidden = shown > 0
    $('#results-total').textContent = `${shown} task${shown === 1 ? '' : 's'}${time ? ` · ${duration(time)} total` : ''}`
  }
  function toggleResult(group) {
    const open = !group.classList.contains('open')
    if (open) state.openResults.add(group.dataset.key); else state.openResults.delete(group.dataset.key)
    group.classList.toggle('open', open)
    group.querySelector('.result-outputs').hidden = !open
    group.querySelector('.result-row').setAttribute('aria-expanded', String(open))
  }

  // Expected output, actual output and (for tasks that did not pass) one
  // bullet per failure reason. The server works these out from the task.
  function bullets(lines) {
    return Array.isArray(lines) && lines.length ? `<ul>${lines.map(line => `<li>${escape(line)}</li>`).join('')}</ul>` : '<p>—</p>'
  }
  function resultOutputs(result) {
    const status = result.grade?.status
    const reasons = Array.isArray(result.failure_reasons) && result.failure_reasons.length ? result.failure_reasons : (result.grade?.reasons || []).map(reason => reason.message).filter(Boolean)
    const actual = Array.isArray(result.actual_output) ? result.actual_output : result.final_response?.message ? [`Agent’s message: “${result.final_response.message}”`] : []
    return `<div class="result-compare"><section><h4>Expected output</h4>${bullets(result.expected_output)}</section><section><h4>Actual output</h4>${bullets(actual)}</section></div>${status && status !== 'passed' ? `<section class="result-failure"><h4>Failure reason</h4>${bullets(reasons)}</section>` : ''}`
  }

  function renderAttempt(attempt, index, run) {
    const draft = getDraft(attempt), agent = agentData(draft.agent), url = entryUrl(attempt), p = progress(attempt, run)
    const id = escape(attempt.id)
    return `<article class="agent-card" data-attempt="${id}"><form class="attempt-form" data-attempt="${id}">
      <div class="agent-card-top"><div class="agent-identity"><img class="agent-logo" src="${agent.icon}" alt=""><div class="agent-select-wrap"><label for="agent-${id}">Agent</label><select name="agent" id="agent-${id}">${options(draft.agent)}</select></div></div><div class="agent-card-actions"><span class="entry-number">URL ${String(index + 1).padStart(2, '0')}</span>${statusBadge(attempt)}</div></div>
      <div class="agent-body"><div class="url-bar">${icon('link')}<input type="text" aria-label="Agent URL ${index + 1}" readonly value="${escape(url)}" autocomplete="off" spellcheck="false"><button class="button" type="button" data-action="copy-url" data-attempt="${id}">${icon('copy')}Copy URL</button></div><div class="link-utilities"><button class="copy-prompt" type="button" data-action="copy-prompt" data-attempt="${id}">${icon('prompt')}Copy prompt</button><a class="open-agent" href="${escape(url)}" target="_blank" rel="noopener">Open task${icon('external')}</a></div>
      <div class="entry-fields"><div><label for="tags-${id}">Tags</label><input name="tags" id="tags-${id}" value="${escape(draft.tags)}" placeholder="Use comma to separate" maxlength="500" autocomplete="off"></div><div><label for="comments-${id}">Comments</label><textarea name="comments" id="comments-${id}" placeholder="Model, settings, notes" maxlength="5000" rows="2">${escape(draft.comments)}</textarea></div></div></div>
      <div class="agent-card-footer"><div class="progress-group"><div class="progress-track" role="progressbar" aria-label="Task results submitted" aria-valuenow="${p.completed}" aria-valuemin="0" aria-valuemax="${p.total}"><div class="progress-fill" style="width:${p.percentage}%"></div></div><span>${p.completed} / ${p.total} results</span></div><div class="save-group"><span class="save-feedback${draft.dirty ? ' dirty' : ''}" role="status">${draft.dirty ? 'Unsaved changes' : 'Saved'}</span><button class="button secondary small" type="submit"${draft.dirty && !state.saving.has(attempt.id) ? '' : ' disabled'}>${state.saving.has(attempt.id) ? 'Saving…' : 'Save'}</button></div></div>
      </form><div class="attempt-traversal"><button class="button quiet small" type="button" data-action="view-traversal" data-attempt="${id}">${icon('tasks')}View traversal</button>${attemptResults(attempt)}</div></article>`
  }

  function toneCounts(results) {
    const counts = { passed: 0, failed: 0, error: 0 }
    for (const result of results) { const tone = resultTone(result); if (tone in counts) counts[tone]++ }
    return counts
  }
  function attemptResults(attempt) {
    const results = resultList(attempt)
    if (!results.length) return ''
    const counts = toneCounts(results)
    return `<span class="attempt-results"><span class="result-count passed">${counts.passed} passed</span> · <span class="result-count failed">${counts.failed + counts.error} failed</span></span><button class="button quiet small" type="button" data-action="agent-results" data-attempt="${escape(attempt.id)}">See results${icon('arrow')}</button>`
  }

  // AI summary, written by Claude from the graded results on request and kept
  // by the server. It never changes a grade.
  function renderSummary(run) {
    const data = state.summaries.get(run.id), writing = state.writingSummary.has(run.id)
    const error = state.summaryErrors.get(run.id)
    const button = label => `<button class="button secondary small" type="button" data-action="write-summary"${writing ? ' disabled' : ''}>${icon('spark')}${writing ? 'Writing…' : label}</button>`
    let body = '', action = ''
    if (!data) body = '<p class="ai-summary-note">Loading…</p>'
    else if (data.error) body = `<p class="ai-summary-error">Couldn’t load the summary. ${escape(data.error)}</p>`
    else if (!data.configured) body = state.local
      ? '<p class="ai-summary-note">To turn this on, start the dashboard with <code>ANTHROPIC_API_KEY</code> set to a Claude API key.</p>'
      : '<p class="ai-summary-note">To turn this on, add a Claude API key in Cloudflare: open the gta-6-bench Worker, go to Settings, then Variables and Secrets, and add a secret named <code>ANTHROPIC_API_KEY</code>.</p>'
    else if (!data.summary) {
      body = data.finished ? `<p class="ai-summary-note">${writing ? `Claude is reading ${data.finished} result${data.finished === 1 ? '' : 's'}. This can take up to a minute.` : 'Get a short write-up of how each agent did and where it went wrong.'}</p>` : '<p class="ai-summary-note">You can write a summary once agents have finished some tasks.</p>'
      if (data.finished) action = button('Write summary')
    } else {
      const summary = data.summary
      const added = data.finished - data.written_from
      const stale = data.stale ? ` · <span class="stale">${added > 0 ? `${added} new result${added === 1 ? '' : 's'} since then` : 'Results changed since then'}</span>` : ''
      body = `<p class="ai-summary-overview">${escape(summary.overview)}</p>
        ${summary.agents?.length ? `<ul class="ai-summary-agents">${summary.agents.map(item => `<li>${item.agent ? `<img src="${agentData(item.agent).icon}" alt="">` : ''}<div><strong>${escape(item.label)}</strong><span>${escape(item.summary)}</span></div></li>`).join('')}</ul>` : ''}
        ${summary.patterns?.length ? `<ul class="ai-summary-patterns">${summary.patterns.map(line => `<li>${escape(line)}</li>`).join('')}</ul>` : ''}
        <p class="ai-summary-meta">${writing ? 'Updating…' : `Written ${escape(date(data.written_at, true))} from ${data.written_from} result${data.written_from === 1 ? '' : 's'}${stale}`}</p>`
      if (data.stale) action = button('Update summary')
    }
    return `<section class="panel ai-summary" aria-label="AI summary" aria-busy="${writing}"><div class="panel-head ai-summary-top"><h2><svg class="sparkle" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M10 2.5c.4 3.9 2.6 6.1 6.5 6.5-3.9.4-6.1 2.6-6.5 6.5-.4-3.9-2.6-6.1-6.5-6.5 3.9-.4 6.1-2.6 6.5-6.5zM18 13c.2 2 1.3 3.1 3.3 3.3-2 .2-3.1 1.3-3.3 3.3-.2-2-1.3-3.1-3.3-3.3 2-.2 3.1-1.3 3.3-3.3zM6.5 16.5c.15 1.3.85 2 2.15 2.15-1.3.15-2 .85-2.15 2.15-.15-1.3-.85-2-2.15-2.15 1.3-.15 2-.85 2.15-2.15z"/></svg>AI summary</h2>${action}</div><div class="panel-body">${body}${error ? `<p class="ai-summary-error" role="alert">${escape(error)}</p>` : ''}</div></section>`
  }
  function refreshSummary() {
    const node = $('.ai-summary')
    if (node && state.selected) node.outerHTML = renderSummary(state.selected)
  }
  async function writeSummary(runId) {
    if (state.writingSummary.has(runId)) return
    state.writingSummary.add(runId); state.summaryErrors.delete(runId)
    refreshSummary()
    try {
      state.summaries.set(runId, await api(`/runs/${encodeURIComponent(runId)}/summary`, { method: 'POST' }))
    } catch (error) {
      state.summaryErrors.set(runId, error.message)
    } finally {
      state.writingSummary.delete(runId)
      if (state.selected?.id === runId) refreshSummary()
    }
  }

  // Chat about this run. Claude reads the run's results and can look up one
  // task's click path; answers stream in and the chat is kept with the run.
  const chatSuggestions = ['Which agent did best, and why?', 'What went wrong on the failed tasks?', 'Which tasks took the longest?']
  // Claude names tasks by id, or by name for tasks written in the dashboard.
  function runTaskNames(run) {
    const names = new Map()
    for (const id of attempts(run).flatMap(resultList).map(result => result.task_id).filter(Boolean)) {
      names.set(escape(id), id)
      names.set(escape(taskLabel(run, id).replace(/\s+/g, ' ').trim()), id)
    }
    return names
  }
  function formatAnswer(text, run) {
    const names = runTaskNames(run)
    const pattern = [...names.keys()].sort((a, b) => b.length - a.length).map(name => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    const links = pattern.length ? new RegExp(`(?<![\\w-])(${pattern.join('|')})(?![\\w-])`, 'g') : null
    const inline = line => {
      let html = escape(line).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      if (links) html = html.replace(links, name => `<a class="task-link" href="#" role="button" data-action="show-task" data-task="${escape(names.get(name))}">${name}</a>`)
      return html
    }
    // Short paragraphs and "- " bullets are all the chat asks Claude to use.
    const parts = []
    for (const block of String(text || '').split(/\n{2,}/)) {
      for (const line of block.split('\n').filter(item => item.trim())) {
        const bullet = /^\s*[-•*]\s+/.test(line), last = parts.at(-1)
        const content = inline(line.replace(/^\s*[-•*]\s+/, ''))
        if (last && last.bullet === bullet && (bullet || !last.closed)) last.lines.push(content)
        else parts.push({ bullet, lines: [content] })
      }
      if (parts.length) parts.at(-1).closed = true
    }
    return parts.map(part => part.bullet ? `<ul>${part.lines.map(line => `<li>${line}</li>`).join('')}</ul>` : `<p>${part.lines.join('<br>')}</p>`).join('')
  }
  function renderChat(run) {
    const data = state.chats.get(run.id), answer = state.chatAnswers.get(run.id), error = state.chatErrors.get(run.id)
    const finished = attempts(run).flatMap(resultList).length
    const messages = data?.messages || []
    const bubble = (role, html, extra = '') => `<li class="chat-message ${role}${extra}"><div class="chat-bubble">${html}</div></li>`
    let body = ''
    if (!data) body = '<p class="ai-summary-note">Loading…</p>'
    else if (data.error) body = `<p class="ai-summary-error">Couldn’t load the chat. ${escape(data.error)}</p>`
    else if (!data.configured) body = state.local
      ? '<p class="ai-summary-note">To turn this on, start the dashboard with <code>ANTHROPIC_API_KEY</code> set to a Claude API key.</p>'
      : '<p class="ai-summary-note">To turn this on, add a Claude API key in Cloudflare: open the gta-6-bench Worker, go to Settings, then Variables and Secrets, and add a secret named <code>ANTHROPIC_API_KEY</code>.</p>'
    else if (!finished) body = '<p class="ai-summary-note">You can chat about this run once agents have finished some tasks.</p>'
    else {
      const log = messages.map(item => item.role === 'user' ? bubble('user', escape(item.text).replace(/\n/g, '<br>')) : bubble('assistant', formatAnswer(item.text, run))).join('')
      const live = answer ? bubble('user', escape(answer.question).replace(/\n/g, '<br>')) + bubble('assistant', answer.text ? formatAnswer(answer.text, run) : '<span class="chat-thinking">Thinking<span>.</span><span>.</span><span>.</span></span>', ' chat-live') : ''
      const suggestions = !messages.length && !answer ? `<div class="chat-suggestions">${chatSuggestions.map(text => `<button class="chat-suggestion" type="button" data-action="chat-suggest" data-question="${escape(text)}">${escape(text)}</button>`).join('')}</div>` : ''
      const locked = Boolean(answer) || data.full
      body = `${log || live ? `<ol class="chat-log" aria-live="polite">${log}${live}</ol>` : ''}${suggestions}
        ${data.full ? '<p class="ai-summary-note">This chat is full. Clear it to start a new one.</p>' : ''}
        <form class="chat-form" data-run="${escape(run.id)}"><textarea name="question" rows="1" maxlength="2000" placeholder="Ask about this run" aria-label="Ask about this run"${data.full ? ' disabled' : ''}>${escape(state.chatDrafts.get(run.id) || '')}</textarea><button class="chat-send" type="submit" aria-label="Send" title="Send"${locked ? ' disabled' : ''}>${icon('send')}</button></form>`
    }
    const clear = messages.length && !answer ? '<button class="button quiet small" type="button" data-action="clear-chat">Clear chat</button>' : ''
    const close = `<button class="icon-button small" type="button" data-action="toggle-chat" aria-label="Close chat" title="Close chat">${icon('close')}</button>`
    return `<section class="panel run-chat" id="run-chat" role="dialog" aria-label="Chat about this run"${state.chatOpen ? '' : ' hidden'}><div class="panel-head chat-head"><div><h2>Chat about this run</h2><p>Claude can see every result and what an agent clicked.</p></div><div class="chat-head-actions">${clear}${close}</div></div><div class="panel-body">${body}${error ? `<p class="ai-summary-error" role="alert">${escape(error)}</p>` : ''}</div></section>`
  }
  const launcherIcon = open => icon(open ? 'down' : 'chat')
  function renderChatDock(run) {
    const open = state.chatOpen
    return `<div class="chat-dock">${renderChat(run)}<button class="chat-launcher" type="button" data-action="toggle-chat" aria-controls="run-chat" aria-expanded="${open}" aria-label="${open ? 'Close chat' : 'Chat about this run'}" title="${open ? 'Close chat' : 'Chat about this run'}">${launcherIcon(open)}</button></div>`
  }
  function scrollChat() { const log = $('.chat-log'); if (log) log.scrollTop = log.scrollHeight }
  function refreshChat({ focus = false } = {}) {
    const node = $('.run-chat')
    if (!node || !state.selected) return
    node.outerHTML = renderChat(state.selected)
    scrollChat()
    if (focus) $('.chat-form textarea')?.focus()
  }
  async function askChat(runId, question) {
    if (state.chatAnswers.has(runId) || !question.trim()) return
    const answer = { question: question.trim(), text: '' }
    state.chatAnswers.set(runId, answer); state.chatErrors.delete(runId); state.chatDrafts.delete(runId)
    refreshChat()
    let saved = false
    try {
      const response = await fetch(`/dashboard/api/runs/${encodeURIComponent(runId)}/chat`, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: answer.question }) })
      if (!response.ok) {
        let body = {}
        try { body = await response.json() } catch { /* not JSON */ }
        if (response.status === 401) showAuth()
        throw new Error(typeof body.error === 'string' ? body.error : `Request failed (${response.status}). Please try again.`)
      }
      const reader = response.body.getReader(), decoder = new TextDecoder()
      let buffer = ''
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        for (let index; (index = buffer.indexOf('\n')) >= 0;) {
          const line = buffer.slice(0, index).trim()
          buffer = buffer.slice(index + 1)
          if (!line) continue
          const event = JSON.parse(line)
          if (event.type === 'text') {
            answer.text += event.text
            const live = document.querySelector('.chat-live .chat-bubble')
            if (live && state.selected?.id === runId) { live.innerHTML = formatAnswer(answer.text, state.selected); scrollChat() }
          } else if (event.type === 'done') { state.chats.set(runId, { configured: true, messages: event.messages, full: event.full }); saved = true }
          else if (event.type === 'error') throw new Error(event.error)
        }
      }
      if (!saved) throw new Error('The answer was cut off. Please try again.')
    } catch (error) {
      state.chatErrors.set(runId, error.message)
      if (!state.chatDrafts.get(runId)) state.chatDrafts.set(runId, answer.question)
    } finally {
      state.chatAnswers.delete(runId)
      if (state.selected?.id === runId) refreshChat({ focus: true })
    }
  }
  function showTask(taskId) {
    const run = state.selected
    if (!run) return
    setRunTab('results')
    state.resultsView = { filter: 'all', agent: 'all', query: '' }
    for (const row of runResults(run)) if (row.result.task_id === taskId) state.openResults.add(row.key)
    render()
    const rows = [...document.querySelectorAll('.result-group')].filter(row => row.dataset.task === taskId)
    rows[0]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    for (const row of rows) { row.classList.remove('flash'); void row.offsetWidth; row.classList.add('flash') }
  }

  function runStatus(run) {
    const statuses = attempts(run).map(attempt => String(attempt.status || '').toLowerCase())
    if (statuses.some(status => ['running', 'active', 'in_progress', 'started'].includes(status))) return '<span class="badge orange"><span class="status-dot"></span>Running</span>'
    if (statuses.length && statuses.every(status => ['completed', 'complete', 'finished'].includes(status))) return '<span class="badge green"><span class="status-dot"></span>Completed</span>'
    return '<span class="badge gray"><span class="status-dot"></span>Ready</span>'
  }
  function renderTiles(run, rows) {
    const entries = attempts(run), results = rows.map(row => row.result)
    const completed = entries.reduce((sum, entry) => sum + progress(entry, run).completed, 0), total = entries.reduce((sum, entry) => sum + progress(entry, run).total, 0)
    const counts = { passed: 0, failed: 0, environment_error: 0 }
    for (const result of results) if (result.grade?.status in counts) counts[result.grade.status]++
    const timed = results.map(result => result.elapsed_ms).filter(Number.isFinite), time = timed.reduce((sum, ms) => sum + ms, 0)
    const share = count => results.length ? `${Math.round(count / results.length * 100)}% of finished tasks` : 'No results yet'
    return `<div class="stats-grid run-summary" role="group" aria-label="Run results">
      <div class="stat"><div class="stat-label">Completed tasks</div><div class="stat-value">${completed}</div><div class="stat-note">of ${total} across ${entries.length} agent URL${entries.length === 1 ? '' : 's'}</div></div>
      <div class="stat"><div class="stat-label"><span class="swatch passed"></span>Passed</div><div class="stat-value positive">${counts.passed}</div><div class="stat-note">${share(counts.passed)}</div></div>
      <div class="stat"><div class="stat-label"><span class="swatch failed"></span>Failed</div><div class="stat-value${counts.failed ? ' negative' : ''}">${counts.failed}</div><div class="stat-note">${share(counts.failed)}</div></div>
      <div class="stat"><div class="stat-label"><span class="swatch error"></span>Environment errors</div><div class="stat-value${counts.environment_error ? ' warning' : ''}">${counts.environment_error}</div><div class="stat-note">A store or setup problem, not the agent</div></div>
      <div class="stat"><div class="stat-label">Time taken</div><div class="stat-value">${timed.length ? duration(time) : '—'}</div><div class="stat-note">${timed.length ? `${duration(time / timed.length)} per task on average` : 'No results yet'}</div></div></div>`
  }
  // One bar per store: green passed, red failed, amber environment errors.
  function renderStoreBars(rows) {
    if (!rows.length) return ''
    const stores = new Map()
    for (const { result } of rows) {
      const slug = result.store || ''
      const entry = stores.get(slug) || { passed: 0, failed: 0, error: 0, total: 0 }
      const tone = resultTone(result)
      if (tone in entry) entry[tone]++
      entry.total++
      stores.set(slug, entry)
    }
    const width = (count, total) => `${(count / total * 100).toFixed(2)}%`
    return `<section class="panel" aria-label="Results by store"><div class="panel-head"><h2>Results by store</h2><div class="panel-actions legend"><span><span class="swatch passed"></span>Passed</span><span><span class="swatch failed"></span>Failed</span><span><span class="swatch error"></span>Environment error</span></div></div>
      <div class="panel-body store-bars">${[...stores].sort((a, b) => b[1].total - a[1].total).map(([slug, entry]) => `<div class="store-bar"><span class="store-bar-name">${escape(slug ? storeName(slug) : 'Other')}</span><div class="bar" role="img" aria-label="${entry.passed} passed, ${entry.failed} failed, ${entry.error} environment errors"><span class="passed" style="width:${width(entry.passed, entry.total)}"></span><span class="failed" style="width:${width(entry.failed, entry.total)}"></span><span class="error" style="width:${width(entry.error, entry.total)}"></span></div><span class="store-bar-count">${entry.passed} / ${entry.total} passed</span></div>`).join('')}</div></section>`
  }
  // Success rate over the run: one line per agent, its pass rate after each
  // finished task. Colors follow the agent's URL slot, so they never shift.
  function renderRateChart(run) {
    const total = taskCount(run)
    const series = attempts(run).map((attempt, index) => {
      let passed = 0
      const points = resultList(attempt).filter(result => resultTone(result) !== 'pending').map((result, n) => {
        if (resultTone(result) === 'passed') passed++
        return Math.round(passed / (n + 1) * 1000) / 10
      })
      return { name: agentData(attempt.agent).name, icon: agentData(attempt.agent).icon, slot: index + 1, url: `URL ${String(index + 1).padStart(2, '0')}`, points }
    }).filter(line => line.points.length)
    if (!series.length) return ''
    const span = Math.max(total, ...series.map(line => line.points.length), 2) - 1
    const x = n => (n / span * 100).toFixed(3), y = rate => (100 - rate).toFixed(3)
    const lines = series.map(line => line.points.length === 1
      ? ''
      : `<polyline class="rate-line s${line.slot}" points="${line.points.map((rate, n) => `${x(n)},${y(rate)}`).join(' ')}" vector-effect="non-scaling-stroke"/>`).join('')
    const ends = series.map(line => { const n = line.points.length - 1; return `<span class="rate-dot s${line.slot}" style="left:${x(n)}%;top:${y(line.points[n])}%"></span>` }).join('')
    const grid = [100, 75, 50, 25, 0].map(rate => `<span class="rate-grid${rate === 0 ? ' base' : ''}" style="top:${y(rate)}%"><span>${rate}%</span></span>`).join('')
    const ticks = [...new Set([1, Math.round((span + 1) / 3), Math.round((span + 1) * 2 / 3), span + 1])].filter(n => n >= 1).map(n => `<span style="left:${x(n - 1)}%">${n}</span>`).join('')
    const legend = series.map(line => `<li><span class="rate-key s${line.slot}"></span><img src="${line.icon}" alt="">${escape(line.name)}<small>${line.url}</small><strong>${line.points.at(-1)}%</strong></li>`).join('')
    const label = series.map(line => `${line.name}: ${line.points.at(-1)}% after ${line.points.length} task${line.points.length === 1 ? '' : 's'}`).join('; ')
    const data = escape(JSON.stringify(series.map(({ name, slot, points }) => ({ name, slot, points }))))
    return `<section class="panel rate-chart" aria-label="Success rate"><div class="panel-head"><h2>Success rate</h2><span class="panel-sub">Share of finished tasks passed, after each task</span></div>
      <div class="panel-body"><ul class="rate-legend">${legend}</ul>
        <div class="rate-frame"><div class="rate-plot" tabindex="0" role="img" aria-label="${escape(label)}" data-series="${data}" data-span="${span}">${grid}<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${lines}</svg>${ends}<span class="rate-cross" hidden></span><div class="rate-tip" hidden></div></div>
        <div class="rate-ticks" aria-hidden="true">${ticks}</div><div class="rate-axis">Tasks finished</div></div></div></section>`
  }
  // Hovering the chart (or arrow keys on it) shows every agent's rate at that task.
  function showRate(plot, index) {
    const series = JSON.parse(plot.dataset.series), span = Number(plot.dataset.span)
    index = Math.max(0, Math.min(span, index))
    plot.dataset.index = index
    const cross = plot.querySelector('.rate-cross'), tip = plot.querySelector('.rate-tip')
    cross.hidden = false; cross.style.left = `${index / span * 100}%`
    tip.replaceChildren()
    const head = document.createElement('strong'); head.textContent = `After task ${index + 1}`; tip.append(head)
    for (const line of series) {
      if (index >= line.points.length) continue
      const row = document.createElement('div'), key = document.createElement('span'), value = document.createElement('b')
      key.className = `rate-key s${line.slot}`; value.textContent = `${line.points[index]}%`
      row.append(key, value, document.createTextNode(` ${line.name}`)); tip.append(row)
    }
    if (tip.childElementCount === 1) { const none = document.createElement('div'); none.textContent = 'No agent has finished this many tasks yet'; tip.append(none) }
    tip.hidden = false
    tip.classList.toggle('flip', index / span > .6)
    tip.style.left = `${index / span * 100}%`
  }
  function hideRate(plot) {
    plot.querySelector('.rate-cross').hidden = true
    plot.querySelector('.rate-tip').hidden = true
    delete plot.dataset.index
  }
  document.addEventListener('pointermove', event => {
    const plot = event.target.closest?.('.rate-plot')
    if (!plot) { const open = document.querySelector('.rate-plot[data-index]'); if (open) hideRate(open); return }
    const box = plot.getBoundingClientRect()
    showRate(plot, Math.round((event.clientX - box.left) / box.width * Number(plot.dataset.span)))
  })
  document.addEventListener('pointerleave', event => { if (event.target.matches?.('.rate-plot')) hideRate(event.target) }, true)
  document.addEventListener('focusout', event => { if (event.target.matches?.('.rate-plot')) hideRate(event.target) })
  function renderAgentTable(run) {
    const entries = attempts(run)
    const head = `<div class="panel-head"><h2>Agents</h2><span class="panel-sub">${entries.length} / 5 URLs</span><div class="panel-actions"><button class="button quiet small" type="button" data-action="run-tab" data-tab="agents">Manage agent URLs</button></div></div>`
    if (!entries.length) return `<section class="panel" aria-label="Agents">${head}<div class="panel-body panel-empty"><p>No agent URLs yet.</p><button class="button primary" data-action="new-attempt">${icon('plus')}Add agent URL</button></div></section>`
    const rows = entries.map((attempt, index) => {
      const results = resultList(attempt), counts = toneCounts(results), p = progress(attempt, run), agent = agentData(attempt.agent)
      const timed = results.map(result => result.elapsed_ms).filter(Number.isFinite)
      const width = count => `${p.total ? (count / p.total * 100).toFixed(2) : 0}%`
      const name = `<span class="agent-cell"><img src="${agent.icon}" alt="">${escape(agent.name)}<small>URL ${String(index + 1).padStart(2, '0')}</small></span>`
      return `<tr><td>${results.length ? `<button class="agent-link" type="button" data-action="agent-results" data-attempt="${escape(attempt.id)}" title="See ${escape(agent.name)}’s results">${name}</button>` : name}</td>
        <td><div class="progress-group"><div class="progress-track split" role="progressbar" aria-label="${escape(agent.name)} tasks submitted" aria-valuenow="${p.completed}" aria-valuemin="0" aria-valuemax="${p.total}"><span class="passed" style="width:${width(counts.passed)}"></span><span class="failed" style="width:${width(counts.failed)}"></span><span class="error" style="width:${width(counts.error)}"></span><span class="pending" style="width:${width(Math.max(0, p.completed - counts.passed - counts.failed - counts.error))}"></span></div><span>${p.completed} / ${p.total}</span></div></td>
        <td class="num">${counts.passed}</td><td class="num">${counts.failed + counts.error}</td><td class="num hide-narrow">${timed.length ? duration(timed.reduce((sum, ms) => sum + ms, 0)) : '—'}</td><td>${statusBadge(attempt)}</td></tr>`
    }).join('')
    return `<section class="panel" aria-label="Agents">${head}<div class="table-scroll"><table class="data-table"><thead><tr><th scope="col">Agent</th><th scope="col">Progress</th><th scope="col" class="num">Passed</th><th scope="col" class="num">Failed</th><th scope="col" class="num hide-narrow">Time</th><th scope="col">Status</th></tr></thead><tbody>${rows}</tbody></table></div></section>`
  }
  function renderAgentsTab(run) {
    const entries = attempts(run)
    return `<div class="section-heading"><div><h2>Agent URLs<span class="section-count">${entries.length} / 5</span></h2><p>Use a separate browser session for each URL.</p></div><div class="section-actions"><button class="button primary" data-action="new-attempt"${entries.length >= 5 ? ' disabled title="This run has five agent URLs"' : ''}>${icon('plus')}Add agent URL</button></div></div>
      ${entries.length ? `<div class="agent-grid">${entries.map((attempt, index) => renderAttempt(attempt, index, run)).join('')}</div>${entries.length >= 5 ? '<p class="capacity-note">Five-URL limit reached.</p>' : ''}` : `<section class="empty-state"><h2>No agent URLs yet</h2><button class="button primary" data-action="new-attempt">${icon('plus')}Add agent URL</button></section>`}`
  }

  function renderDetail() {
    const run = state.selected, entries = attempts(run), rows = runResults(run), tab = state.runTab
    document.title = `${runName(run)} · GTA 6 Bench`
    const tabs = runTabs.map(([key, name]) => {
      const count = key === 'results' ? rows.length : key === 'agents' ? entries.length : null
      return `<button class="run-tab" type="button" role="tab" id="run-tab-${key}" data-action="run-tab" data-tab="${key}" aria-selected="${key === tab}" aria-controls="run-tab-panel">${name}${count === null ? '' : `<span class="tab-count">${count}</span>`}</button>`
    }).join('')
    let body
    if (tab === 'results') body = renderResultsTab(run)
    else if (tab === 'agents') body = renderAgentsTab(run)
    else body = `${renderTiles(run, rows)}<div class="overview-column">${renderSummary(run)}<section class="panel live-panel" id="live-panel" aria-label="Live tracker"></section>${renderRateChart(run)}${renderStoreBars(rows)}${renderAgentTable(run)}</div>`
    $('#main').innerHTML = `<nav class="crumbs" aria-label="Breadcrumb"><a href="#/">All runs</a><span aria-hidden="true">/</span><span>${escape(runName(run))}</span></nav>
      <div class="page-heading run-detail-heading"><div><div class="run-status-row">${runStatus(run)}</div><h1>${escape(runName(run))}</h1><div class="run-meta"><span>${icon('clock')}${escape(date(run.created_at, true))}</span></div></div></div>
      <div class="run-tabs" role="tablist" aria-label="Run sections">${tabs}</div>
      <div id="run-tab-panel" class="run-tab-panel" role="tabpanel" aria-labelledby="run-tab-${tab}">${body}</div>${renderChatDock(run)}`
    if (tab === 'overview') live.mount($('#live-panel'), run.id); else live.stop()
    if (tab === 'results') applyResults()
    scrollChat()
    renderSidebar()
  }

  function render() {
    const { view, id } = route()
    if (view === 'tasks' || view === 'task') {
      live.stop()
      if (view === 'tasks') tasks.renderList($('#main')); else tasks.renderEditor($('#main'), id)
      renderSidebar()
    } else if (state.selected) renderDetail(); else renderOverview()
  }
  function route() {
    const decode = value => { try { return decodeURIComponent(value) } catch { return null } }
    const run = location.hash.match(/^#\/runs\/([^/]+)/)
    if (run) return { view: 'run', id: decode(run[1]) }
    const task = location.hash.match(/^#\/tasks\/([^/]+)/)
    if (task) return { view: 'task', id: task[1] === 'new' ? null : decode(task[1]) }
    return { view: /^#\/tasks\/?$/.test(location.hash) ? 'tasks' : 'overview', id: null }
  }
  function selectedId() { const { view, id } = route(); return view === 'run' ? id : null }
  async function load({ initial = false } = {}) {
    if (!state.authenticated) return
    const number = ++state.loadNumber
    if (initial) $('#main').innerHTML = '<div role="status" aria-label="Loading runs"><div class="skeleton skeleton-line"></div><div class="skeleton skeleton-row"></div><div class="skeleton skeleton-row"></div></div>'
    const id = selectedId()
    try {
      const taskView = ['tasks', 'task'].includes(route().view)
      const [list, detail, summary, , chat] = await Promise.all([api('/runs'), id ? api(`/runs/${encodeURIComponent(id)}`) : Promise.resolve(null),
        id ? api(`/runs/${encodeURIComponent(id)}/summary`).catch(error => ({ error: error.message })) : Promise.resolve(null), tasks.load(taskView),
        id && !state.chatAnswers.has(id) ? api(`/runs/${encodeURIComponent(id)}/chat`).catch(error => ({ error: error.message })) : Promise.resolve(null)])
      if (number !== state.loadNumber || !state.authenticated) return
      if (id && summary) state.summaries.set(id, summary)
      if (id && chat && !state.chatAnswers.has(id)) state.chats.set(id, chat)
      state.runs = (list.runs || []).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      state.selected = detail ? (detail.run || detail) : null
      if (state.selected) setRun(state.selected)
      for (const run of state.runs) for (const attempt of attempts(run)) if (!state.drafts.get(attempt.id)?.dirty) state.drafts.delete(attempt.id)
      render()
    } catch (error) {
      if (number !== state.loadNumber || !state.authenticated) return
      $('#main').innerHTML = `<div class="error-state"><h2>Couldn’t load runs</h2><p>${escape(error.message)}</p><button class="button primary" data-action="refresh">${icon('refresh')}Try again</button> <a class="button quiet" href="#/">All runs</a></div>`
    } finally { state.loading = false }
  }

  function showAuth(error = '') {
    state.authenticated = false
    state.loadNumber++
    $('#boot').hidden = true
    $('#workspace').hidden = true
    $('#create-dialog').close()
    traversal.close()
    live.stop()
    $('#auth').hidden = false
    $('#auth').innerHTML = `<form class="auth-card" id="login-form"><span class="brand-mark" aria-hidden="true"></span><div class="eyebrow">GTA 6 Bench</div><h1>Sign in</h1><label for="workspace-token">Operator token</label><input id="workspace-token" name="token" type="password" required autocomplete="current-password"><p class="form-error" role="alert">${escape(error)}</p><button class="button primary" type="submit">Sign in</button></form>`
    $('#workspace-token').focus()
  }

  async function initialize() {
    try {
      const session = await api('/session')
      state.local = !!session.local
      if (!session.authenticated) return showAuth()
      state.authenticated = true
      $('#boot').hidden = true
      $('#auth').hidden = true
      $('#workspace').hidden = false
      $('#logout').hidden = state.local
      showTheme()
      await load({ initial: true })
    } catch (error) {
      $('#boot').hidden = true
      $('#auth').hidden = false
      $('#auth').innerHTML = `<div class="auth-card"><span class="brand-mark" aria-hidden="true"></span><h1>Connection unavailable</h1><p>${escape(error.message)}</p><button class="button primary" data-action="retry-session">Try again</button></div>`
    }
  }

  function openDialog(type) {
    if (type === 'attempt' && (!state.selected || attempts(state.selected).length >= 5)) return
    const dialog = $('#create-dialog')
    const isRun = type === 'run'
    dialog.innerHTML = `<form id="${isRun ? 'create-run-form' : 'create-attempt-form'}"><div class="dialog-content"><div class="dialog-header"><h2 id="dialog-title">${isRun ? 'New run' : 'Add agent URL'}</h2><button type="button" class="icon-button" data-action="close-dialog" aria-label="Close dialog">×</button></div>${isRun ? `<div class="field"><label for="run-name">Run name</label><input id="run-name" name="name" required maxlength="120" value="${escape(`Run · ${new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`)}" autocomplete="off"></div><div class="field"><label for="run-suite">Task set</label><select id="run-suite" name="suite"><option value="original30">Original 30 tasks</option><option value="all240">All 240 tasks</option><option value="custom">My tasks (${tasks.count()})</option></select></div><div class="field" id="run-task-picker" hidden>${tasks.runPicker()}</div>` : `<div class="field"><label for="new-agent">Agent</label><select id="new-agent" name="agent">${options('grokbot')}</select></div><div class="field"><label for="new-tags">Tags <span style="font-weight:400;color:var(--muted)">(optional)</span></label><input name="tags" id="new-tags" placeholder="baseline, v2" maxlength="500"><p class="field-help">Comma-separated.</p></div>`}<p class="form-error" role="alert"></p></div><div class="dialog-footer"><button class="button quiet" type="button" data-action="close-dialog">Cancel</button><button class="button primary" type="submit">${icon(isRun ? 'plus' : 'link')}${isRun ? 'Create run' : 'Create URL'}</button></div></form>`
    dialog.showModal()
    const first = dialog.querySelector('input, select')
    first?.focus()
    if (isRun) first?.select()
  }

  const parseTags = value => [...new Set(String(value || '').split(',').map(tag => tag.trim()).filter(Boolean))]
  async function copy(text, success) {
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text)
      else {
        const field = document.createElement('textarea')
        field.value = text; field.style.position = 'fixed'; field.style.opacity = '0'; document.body.append(field); field.select()
        const copied = document.execCommand('copy'); field.remove()
        if (!copied) throw new Error('Clipboard unavailable')
      }
      toast(success)
    } catch { toast('Couldn’t copy. Select and copy the URL from its field.', true) }
  }

  document.addEventListener('click', async event => {
    const control = event.target.closest('[data-action]')
    if (!control || control.disabled) return
    const action = control.dataset.action
    if (action === 'new-run') openDialog('run')
    if (action === 'new-attempt') openDialog('attempt')
    if (action === 'close-dialog') $('#create-dialog').close()
    if (action === 'refresh') { control.disabled = true; await load(); if (control.isConnected) control.disabled = false }
    if (action === 'retry-session') { control.disabled = true; await initialize() }
    if (action === 'write-summary' && state.selected) await writeSummary(state.selected.id)
    if (action === 'chat-suggest' && state.selected) await askChat(state.selected.id, control.dataset.question)
    if (action === 'show-task') { event.preventDefault(); if (matchMedia('(max-width: 760px)').matches) setChatOpen(false); showTask(control.dataset.task) }
    if (action === 'toggle-chat' && state.selected) { setChatOpen(!state.chatOpen); if (!state.chatOpen) $('.chat-launcher')?.focus() }
    if (action === 'clear-chat' && state.selected) {
      const runId = state.selected.id
      control.disabled = true
      try { state.chats.set(runId, await api(`/runs/${encodeURIComponent(runId)}/chat`, { method: 'DELETE' })); state.chatErrors.delete(runId) }
      catch (error) { state.chatErrors.set(runId, error.message) }
      if (state.selected?.id === runId) refreshChat()
    }
    if (action === 'run-tab' && state.selected) { setRunTab(control.dataset.tab); render(); $('#run-tab-' + control.dataset.tab)?.focus() }
    if (action === 'result-filter') { state.resultsView.filter = control.dataset.filter; applyResults() }
    if (action === 'toggle-result') toggleResult(control.closest('.result-group'))
    if (action === 'agent-results' && state.selected) {
      setRunTab('results')
      state.resultsView = { filter: 'all', agent: control.dataset.attempt, query: '' }
      render(); window.scrollTo(0, 0)
    }
    if (action === 'toggle-settings') setSettings($('#settings-menu').hidden)
    if (action === 'set-theme') {
      const root = document.documentElement, choice = control.dataset.themeChoice
      if (choice === 'system') delete root.dataset.theme; else root.dataset.theme = choice
      try { if (choice === 'system') localStorage.removeItem('dashboard-theme'); else localStorage.setItem('dashboard-theme', choice) } catch { /* storage blocked */ }
      showTheme()
    }
    if (action === 'toggle-menu') setMenu(!$('#workspace').classList.contains('menu-open'))
    if (action === 'view-traversal') {
      const attempt = attempts(state.selected).find(item => item.id === control.dataset.attempt)
      if (attempt) traversal.open({ runId: state.selected.id, attemptId: attempt.id, label: agentData(attempt.agent).name })
    }
    if (action === 'logout') {
      setSettings(false)
      control.disabled = true
      try { await api('/logout', { method: 'POST' }); state.drafts.clear(); state.runs = []; state.selected = null; showAuth() } catch (error) { toast(error.message, true) } finally { control.disabled = false }
    }
    if (action === 'copy-url' || action === 'copy-prompt') {
      const attempt = attempts(state.selected).find(item => item.id === control.dataset.attempt)
      if (!attempt) return
      const url = entryUrl(attempt)
      const prompt = `Open ${url} in a separate browser session for this agent URL to begin this GTA 6 Bench run. Follow the instructions on the task page. Use Start task to begin each task, then shop on the store's website. Return to the task page after shopping and use Submit result to report purchased or not_purchased, with a reason or message. Advance through the tasks sequentially until the run is complete.`
      await copy(action === 'copy-url' ? url : prompt, action === 'copy-url' ? 'Agent URL copied' : 'Agent prompt copied')
    }
  })

  document.addEventListener('change', event => {
    if (event.target.id === 'run-suite') $('#run-task-picker').hidden = event.target.value !== 'custom'
    if (event.target.id === 'results-agent') { state.resultsView.agent = event.target.value; applyResults() }
  })
  document.addEventListener('input', event => {
    if (event.target.id === 'results-query') { state.resultsView.query = event.target.value; applyResults(); return }
    if (event.target.id === 'goto-input') { gotoIndex = 0; renderGoto(); return }
    const chatForm = event.target.closest('.chat-form')
    if (chatForm && event.target.name === 'question') {
      state.chatDrafts.set(chatForm.dataset.run, event.target.value)
      event.target.style.height = 'auto'; event.target.style.height = `${Math.min(event.target.scrollHeight, 160)}px`
      return
    }
    const form = event.target.closest('.attempt-form')
    if (!form || !['agent', 'tags', 'comments'].includes(event.target.name)) return
    const attempt = attempts(state.selected).find(item => item.id === form.dataset.attempt)
    if (!attempt) return
    const draft = getDraft(attempt)
    draft[event.target.name] = event.target.value
    draft.dirty = draft.agent !== (attempt.agent || 'grokbot') || draft.comments !== (attempt.comments || '') || JSON.stringify(parseTags(draft.tags)) !== JSON.stringify(attempt.tags || [])
    const feedback = form.querySelector('.save-feedback')
    feedback.textContent = draft.dirty ? 'Unsaved changes' : 'Saved'; feedback.className = `save-feedback${draft.dirty ? ' dirty' : ''}`
    form.querySelector('button[type="submit"]').disabled = !draft.dirty || state.saving.has(attempt.id)
    if (event.target.name === 'agent') form.querySelector('.agent-logo').src = agentData(draft.agent).icon
  })

  document.addEventListener('keydown', event => {
    if ((event.key === 'Enter' || event.key === ' ') && event.target.matches?.('.result-row')) { event.preventDefault(); toggleResult(event.target.closest('.result-group')); return }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k' && state.authenticated) { event.preventDefault(); $('#goto-input').focus(); $('#goto-input').select(); return }
    if (event.target.id === 'goto-input') { gotoKey(event); return }
    if (event.target.matches?.('.rate-plot') && ['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
      event.preventDefault()
      const plot = event.target, span = Number(plot.dataset.span), index = plot.dataset.index === undefined ? -1 : Number(plot.dataset.index)
      showRate(plot, event.key === 'Home' ? 0 : event.key === 'End' ? span : index + (event.key === 'ArrowLeft' ? -1 : 1))
      return
    }
    if (event.key === 'Escape' && !$('#settings-menu').hidden) { setSettings(false); $('#settings-toggle').focus(); return }
    if (event.key === 'Escape' && state.chatOpen && event.target.closest?.('.chat-dock')) { setChatOpen(false); $('.chat-launcher')?.focus(); return }
    if (event.key !== 'Enter' || event.shiftKey || event.isComposing || !event.target.matches?.('.chat-form textarea')) return
    event.preventDefault()
    event.target.form.requestSubmit()
  })
  document.addEventListener('submit', async event => {
    const form = event.target
    if (form.matches('.chat-form')) {
      event.preventDefault()
      const question = String(new FormData(form).get('question') || '')
      if (question.trim()) await askChat(form.dataset.run, question)
      return
    }
    if (!['login-form', 'create-run-form', 'create-attempt-form'].includes(form.id) && !form.matches('.attempt-form')) return
    event.preventDefault()
    if (form.matches('.attempt-form')) {
      if (state.saving.has(form.dataset.attempt)) return
      state.saving.add(form.dataset.attempt)
    }
    const button = form.querySelector('button[type="submit"]'), oldText = button.innerHTML
    button.disabled = true
    button.textContent = form.id === 'login-form' ? 'Signing in…' : form.matches('.attempt-form') ? 'Saving…' : 'Creating…'
    const errorNode = form.querySelector('.form-error')
    if (errorNode) errorNode.textContent = ''
    try {
      const data = new FormData(form)
      if (form.id === 'login-form') {
        const token = String(data.get('token') || '').trim()
        await api('/login', { method: 'POST', body: { token } })
        form.reset()
        await initialize()
      } else if (form.id === 'create-run-form') {
        const name = String(data.get('name') || '').trim()
        if (!name) throw new Error('Give this run a name.')
        const suite = data.get('suite'), taskIds = data.getAll('task_ids')
        if (suite === 'custom' && !taskIds.length) throw new Error('Choose at least one of your tasks.')
        const result = await api('/runs', { method: 'POST', body: { name, suite, ...(suite === 'custom' ? { task_ids: taskIds } : {}) } })
        const run = result.run || result
        if (!run.id) throw new Error('The server did not return a run ID. Refresh the run history before trying again.')
        $('#create-dialog').close()
        setRun(run); render()
        location.hash = `/runs/${encodeURIComponent(run.id)}`
        toast('Run created')
      } else if (form.id === 'create-attempt-form') {
        const run = state.selected, runId = run.id
        const result = await api(`/runs/${encodeURIComponent(runId)}/attempts`, { method: 'POST', body: { agent: data.get('agent'), tags: parseTags(data.get('tags')), comments: '' } })
        const attempt = result.attempt || result
        run.attempts = [...attempts(run), attempt]
        updateRun(run)
        $('#create-dialog').close()
        render()
        toast('Agent URL created')
      } else {
        const run = state.selected, id = form.dataset.attempt, draft = state.drafts.get(id)
        const savedDraft = { ...draft }
        const result = await api(`/runs/${encodeURIComponent(run.id)}/attempts/${encodeURIComponent(id)}`, { method: 'PATCH', body: { agent: savedDraft.agent, tags: parseTags(savedDraft.tags), comments: savedDraft.comments } })
        const existing = attempts(run).find(attempt => attempt.id === id)
        Object.assign(existing, result.attempt || result)
        updateRun(run)
        const live = state.drafts.get(id)
        const changedDuringSave = live && ['agent', 'tags', 'comments'].some(key => live[key] !== savedDraft[key])
        if (changedDuringSave) live.dirty = true
        else { state.drafts.delete(id); getDraft(existing) }
        const displayedForm = [...document.querySelectorAll('.attempt-form')].find(element => element.dataset.attempt === id)
        if (displayedForm) {
          const feedback = displayedForm.querySelector('.save-feedback')
          feedback.textContent = changedDuringSave ? 'Unsaved changes' : 'Changes saved'; feedback.className = `save-feedback${changedDuringSave ? ' dirty' : ''}`
          displayedForm.querySelector('button[type="submit"]').disabled = !changedDuringSave
        }
        toast('Agent details saved')
      }
    } catch (error) {
      if (errorNode) errorNode.textContent = error.message
      else { const feedback = form.querySelector('.save-feedback'); feedback.textContent = 'Couldn’t save'; feedback.className = 'save-feedback error'; toast(error.message, true) }
    } finally {
      if (form.matches('.attempt-form')) {
        state.saving.delete(form.dataset.attempt)
        const displayedForm = [...document.querySelectorAll('.attempt-form')].find(element => element.dataset.attempt === form.dataset.attempt)
        if (displayedForm) {
          const currentButton = displayedForm.querySelector('button[type="submit"]')
          currentButton.textContent = 'Save'
          currentButton.disabled = !state.drafts.get(form.dataset.attempt)?.dirty
        }
      }
      if (button.isConnected) {
        button.innerHTML = oldText
        button.disabled = form.matches('.attempt-form') ? !state.drafts.get(form.dataset.attempt)?.dirty : false
      }
    }
  })
  // "Go to": jump to a page, a run or one of your tasks by name. Ctrl K (⌘K) focuses it.
  let gotoIndex = 0
  function gotoItems(query) {
    const text = query.trim().toLowerCase()
    const items = [{ label: 'All runs', kind: 'Page', href: '#/' }, { label: 'My tasks', kind: 'Page', href: '#/tasks' }, { label: 'New task', kind: 'Page', href: '#/tasks/new' },
      ...state.runs.map(run => ({ label: runName(run), kind: 'Run', href: `#/runs/${encodeURIComponent(run.id)}` })),
      ...tasks.list().map(task => ({ label: task.name, kind: 'Task', href: `#/tasks/${encodeURIComponent(task.id)}` }))]
    return (text ? items.filter(item => item.label.toLowerCase().includes(text)) : items).slice(0, 8)
  }
  function renderGoto() {
    const input = $('#goto-input'), list = $('#goto-results'), items = gotoItems(input.value)
    gotoIndex = Math.min(gotoIndex, Math.max(0, items.length - 1))
    list.innerHTML = items.length ? items.map((item, index) => `<li role="option" id="goto-${index}" aria-selected="${index === gotoIndex}"><a href="${escape(item.href)}" tabindex="-1"><span>${escape(item.label)}</span><small>${item.kind}</small></a></li>`).join('') : '<li class="goto-empty">No matches</li>'
    list.hidden = false
    input.setAttribute('aria-expanded', 'true')
    if (items.length) input.setAttribute('aria-activedescendant', `goto-${gotoIndex}`); else input.removeAttribute('aria-activedescendant')
    return items
  }
  function closeGoto() {
    $('#goto-results').hidden = true
    $('#goto-input').setAttribute('aria-expanded', 'false')
    $('#goto-input').removeAttribute('aria-activedescendant')
  }
  function gotoKey(event) {
    if (event.key === 'Escape') { closeGoto(); event.target.blur(); return }
    if (!['ArrowDown', 'ArrowUp', 'Enter'].includes(event.key)) return
    event.preventDefault()
    const items = gotoItems(event.target.value)
    if (!items.length) return
    if (event.key === 'Enter') { location.hash = items[gotoIndex].href.slice(1); event.target.value = ''; closeGoto(); event.target.blur(); return }
    gotoIndex = (gotoIndex + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length
    renderGoto()
  }
  document.addEventListener('focusin', event => { if (event.target.id === 'goto-input') renderGoto() })
  document.addEventListener('click', event => {
    if (event.target.closest?.('#goto-results a')) { $('#goto-input').value = ''; closeGoto(); return }
    if (!event.target.closest?.('.goto') && !$('#goto-results').hidden) closeGoto()
    if (!event.target.closest?.('.settings') && !$('#settings-menu').hidden) setSettings(false)
  })
  // Settings, at the bottom of the sidebar: theme and sign out.
  function setSettings(open) {
    $('#settings-menu').hidden = !open
    $('#settings-toggle').setAttribute('aria-expanded', String(open))
    if (open) showTheme()
  }
  function showTheme() {
    const current = document.documentElement.dataset.theme || 'system'
    for (const option of document.querySelectorAll('[data-theme-choice]')) option.setAttribute('aria-checked', String(option.dataset.themeChoice === current))
  }
  // On narrow screens the sidebar slides in over the page.
  function setMenu(open) {
    $('#workspace').classList.toggle('menu-open', open)
    $('.sidebar-scrim').hidden = !open
    $('.menu-toggle').setAttribute('aria-expanded', String(open))
  }
  window.addEventListener('hashchange', () => { traversal.close(); closeGoto(); setMenu(false); if (state.authenticated) load({ initial: true }) })
  window.addEventListener('beforeunload', event => { if (tasks.dirty || [...state.drafts.values()].some(draft => draft.dirty)) { event.preventDefault(); event.returnValue = '' } })
  initialize()
})()
