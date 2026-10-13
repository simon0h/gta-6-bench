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
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7v1"/>',
    tasks: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="m8 8 1 1 2-2M14 8h2M8 13h8M8 17h5"/>',
    prompt: '<path d="m5 6 6 6-6 6M13 18h6"/>',
  }
  const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.run}</svg>`
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]))
  const $ = selector => document.querySelector(selector)
  const state = { runs: [], selected: null, loading: true, authenticated: false, local: false, drafts: new Map(), saving: new Set(), loadNumber: 0 }
  let toastTimer

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
  function taskCount(run) { return Number(run.task_count ?? run.tasks?.length ?? (run.suite === 'all240' ? 240 : 30)) }
  function attempts(run) { return Array.isArray(run?.attempts) ? run.attempts : [] }
  function suiteName(run) { return run.suite === 'all240' ? 'All 240 tasks' : 'Original 30 tasks' }
  function attemptCount(run) { return run.attempt_count ?? attempts(run).length }
  function runName(run) { return run.name || `Run ${date(run.created_at)}` }
  function agentData(key) { return agents[key] || agents.grokbot }
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
    $('#run-count').textContent = state.runs.length
    $('#overview-link').classList.toggle('active', !state.selected)
    $('#recent-runs').innerHTML = state.runs.length ? state.runs.slice(0, 12).map(run => `<a class="recent-run${state.selected?.id === run.id ? ' selected' : ''}" href="#/runs/${encodeURIComponent(run.id)}"${state.selected?.id === run.id ? ' aria-current="page"' : ''}>${icon('run')}<span>${escape(runName(run))}</span></a>`).join('') : '<p class="sidebar-empty">Your runs will appear here.<br>Create one to get started.</p>'
    $('#breadcrumb-current').textContent = state.selected ? runName(state.selected) : 'Runs'
  }

  function renderOverview() {
    document.title = 'Runs · GTA 6 Bench'
    const links = state.runs.reduce((sum, run) => sum + attemptCount(run), 0)
    const complete = state.runs.reduce((sum, run) => sum + attempts(run).filter(entry => ['completed', 'complete', 'finished'].includes(entry.status)).length, 0)
    $('#main').innerHTML = `
      <div class="page-heading"><div><div class="eyebrow">YOUR EVALUATION WORKSPACE</div><h1>Benchmark runs</h1><p>One task set. A unique link for every agent. See how they compare.</p></div><button class="button primary" data-action="new-run">${icon('plus')}Generate new run</button></div>
      <div class="stats-grid" aria-label="Workspace summary"><div class="stat"><div class="stat-label">${icon('run')}Total runs</div><div class="stat-value">${state.runs.length}<span class="stat-note">in your workspace</span></div></div><div class="stat"><div class="stat-label">${icon('link')}Agent URLs</div><div class="stat-value">${links}<span class="stat-note">across all runs</span></div></div><div class="stat"><div class="stat-label">${icon('check')}Completed attempts</div><div class="stat-value">${complete}<span class="stat-note">ready to review</span></div></div></div>
      <div class="section-heading"><h2>Run history<span class="section-count">${state.runs.length}</span></h2><button class="icon-button" data-action="refresh" aria-label="Refresh runs" title="Refresh runs">${icon('refresh')}</button></div>
      ${state.runs.length ? `<div class="run-list">${state.runs.map(run => `<a class="run-row" href="#/runs/${encodeURIComponent(run.id)}"><div class="run-symbol">${icon('run')}</div><div class="run-row-text"><h3>${escape(runName(run))}</h3><div class="run-row-meta"><span>${escape(date(run.created_at, true))}</span><span class="meta-divider">·</span><span>${suiteName(run)}</span></div></div><div class="run-row-extra">${attempts(run).length ? `<div class="agent-stack" aria-hidden="true">${attempts(run).slice(0, 5).map(attempt => `<img src="${agentData(attempt.agent).icon}" alt="">`).join('')}</div>` : ''}<span class="attempt-count">${attemptCount(run)} / 5 URLs</span><span class="badge">${taskCount(run)} tasks</span>${icon('arrow')}</div></a>`).join('')}</div>` : `<section class="empty-state"><div class="empty-illustration" aria-hidden="true"><span class="sheet"></span><span class="sheet front">${icon('plus')}</span></div><h2>Your first run starts here</h2><p>Create a run, assign up to five agent URLs, and send each agent its own link to get started.</p><button class="button primary" data-action="new-run">${icon('plus')}Generate new run</button></section>`}
      <div class="workflow-note">${icon('info')}<p><strong>A fair starting point.</strong> Every agent URL in a run uses the same task set. Labels, tags, and comments help you keep track of each attempt.</p></div>`
    renderSidebar()
  }

  function renderResults(attempt) {
    const results = resultList(attempt)
    if (!results.length) return ''
    return `<details class="result-details"><summary>View ${results.length} task result${results.length === 1 ? '' : 's'}${Number.isFinite(attempt.summary?.passed) ? ` · ${attempt.summary.passed} passed` : ''}</summary><table class="result-table"><thead><tr><th scope="col">Task</th><th scope="col">Result</th><th scope="col">Notes</th></tr></thead><tbody>${results.map((result, index) => `<tr><td>${escape(result.task_id || result.task?.id || result.id || `Task ${index + 1}`)}</td><td>${escape((result.grade?.status || result.outcome || result.status || 'Submitted').replace(/_/g, ' '))}</td><td>${escape(result.grade?.reasons?.map(reason => reason.message).filter(Boolean).join('; ') || result.final_response?.message || result.reason || result.message || result.notes || '—')}</td></tr>`).join('')}</tbody></table></details>`
  }

  function renderAttempt(attempt, index, run) {
    const draft = getDraft(attempt), agent = agentData(draft.agent), url = entryUrl(attempt), p = progress(attempt, run)
    const id = escape(attempt.id)
    return `<article class="agent-card" data-attempt="${id}"><form class="attempt-form" data-attempt="${id}">
      <div class="agent-card-top"><div class="agent-identity"><img class="agent-logo" src="${agent.icon}" alt=""><div class="agent-select-wrap"><label for="agent-${id}">Agent label</label><select name="agent" id="agent-${id}">${options(draft.agent)}</select></div></div><div class="agent-card-actions"><span class="entry-number">URL ${String(index + 1).padStart(2, '0')}</span>${statusBadge(attempt)}</div></div>
      <div class="agent-body"><div class="url-bar">${icon('link')}<input type="text" aria-label="Agent URL ${index + 1}" readonly value="${escape(url)}" autocomplete="off" spellcheck="false"><button class="button" type="button" data-action="copy-url" data-attempt="${id}">${icon('copy')}Copy URL</button></div><div class="link-utilities"><button class="copy-prompt" type="button" data-action="copy-prompt" data-attempt="${id}">${icon('prompt')}Copy agent prompt</button><a class="open-agent" href="${escape(url)}" target="_blank" rel="noopener">Open task page${icon('external')}</a></div>
      <div class="entry-fields"><div><label for="tags-${id}">Tags</label><input name="tags" id="tags-${id}" value="${escape(draft.tags)}" placeholder="e.g. baseline, browser, v2" maxlength="500" autocomplete="off"><p class="field-help">Separate tags with commas.</p></div><div><label for="comments-${id}">Comments</label><textarea name="comments" id="comments-${id}" placeholder="Model version, setup, or observations…" maxlength="5000" rows="2">${escape(draft.comments)}</textarea></div></div></div>
      <div class="agent-card-footer"><div class="progress-group"><div class="progress-track" role="progressbar" aria-label="Task results submitted" aria-valuenow="${p.completed}" aria-valuemin="0" aria-valuemax="${p.total}"><div class="progress-fill" style="width:${p.percentage}%"></div></div><span>${p.completed} / ${p.total} results</span></div><div class="save-group"><span class="save-feedback${draft.dirty ? ' dirty' : ''}" role="status">${draft.dirty ? 'Unsaved changes' : 'Saved'}</span><button class="button secondary small" type="submit"${draft.dirty && !state.saving.has(attempt.id) ? '' : ' disabled'}>${state.saving.has(attempt.id) ? 'Saving…' : 'Save changes'}</button></div></div>
      </form>${renderResults(attempt)}</article>`
  }

  function renderDetail() {
    const run = state.selected, entries = attempts(run)
    document.title = `${runName(run)} · GTA 6 Bench`
    $('#main').innerHTML = `<div class="page-heading run-detail-heading"><div><div class="eyebrow">BENCHMARK RUN</div><h1>${escape(runName(run))}</h1><p>Assign your agents. Share their links. Review the results in one place.</p><div class="run-meta"><span>${icon('tasks')}${suiteName(run)}</span><span>${icon('clock')}${escape(date(run.created_at, true))}</span><span class="badge">${entries.length} of 5 URLs</span></div></div><button class="button primary" data-action="new-run">${icon('plus')}Generate new run</button></div>
      <div class="detail-intro">${icon('link')}<div><strong>A separate link for every agent</strong><p>Use a separate browser session for each agent URL. Copy a prompt to get an agent started; labels, tags, and comments help you organize the attempts.</p></div></div>
      <div class="section-heading"><div><h2>Agent URLs<span class="section-count">${entries.length} / 5</span></h2><p>${entries.length ? 'Each link belongs to one attempt in this run.' : 'Add a link to start your first agent attempt.'}</p></div><div class="section-actions"><button class="icon-button" data-action="refresh" aria-label="Refresh results" title="Refresh results">${icon('refresh')}</button><button class="button secondary" data-action="new-attempt"${entries.length >= 5 ? ' disabled title="This run has five agent URLs"' : ''}>${icon('plus')}Add agent URL</button></div></div>
      ${entries.length ? `<div class="agent-grid">${entries.map((attempt, index) => renderAttempt(attempt, index, run)).join('')}</div>${entries.length >= 5 ? '<p class="capacity-note">All five URLs are in use. Generate a new run to compare more agents.</p>' : ''}` : `<section class="empty-state"><div class="empty-illustration" aria-hidden="true"><span class="sheet"></span><span class="sheet front">${icon('link')}</span></div><h2>Ready for your first agent</h2><p>Add an agent URL, choose a label, and copy the prompt to launch your benchmark.</p><button class="button primary" data-action="new-attempt">${icon('plus')}Add agent URL</button></section>`}`
    renderSidebar()
  }

  function render() { if (state.selected) renderDetail(); else renderOverview() }
  function selectedId() {
    const match = location.hash.match(/^#\/runs\/([^/]+)/)
    try { return match ? decodeURIComponent(match[1]) : null } catch { return null }
  }
  async function load({ initial = false } = {}) {
    if (!state.authenticated) return
    const number = ++state.loadNumber
    if (initial) $('#main').innerHTML = '<div role="status" aria-label="Loading runs"><div class="skeleton skeleton-line"></div><div class="skeleton skeleton-row"></div><div class="skeleton skeleton-row"></div></div>'
    const id = selectedId()
    try {
      const [list, detail] = await Promise.all([api('/runs'), id ? api(`/runs/${encodeURIComponent(id)}`) : Promise.resolve(null)])
      if (number !== state.loadNumber || !state.authenticated) return
      state.runs = (list.runs || []).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      state.selected = detail ? (detail.run || detail) : null
      if (state.selected) setRun(state.selected)
      for (const run of state.runs) for (const attempt of attempts(run)) if (!state.drafts.get(attempt.id)?.dirty) state.drafts.delete(attempt.id)
      render()
    } catch (error) {
      if (number !== state.loadNumber || !state.authenticated) return
      $('#main').innerHTML = `<div class="error-state"><h2>We couldn’t load this workspace</h2><p>${escape(error.message)}</p><button class="button primary" data-action="refresh">${icon('refresh')}Try again</button> <a class="button quiet" href="#/">Back to all runs</a></div>`
    } finally { state.loading = false }
  }

  function showAuth(error = '') {
    state.authenticated = false
    state.loadNumber++
    $('#boot').hidden = true
    $('#workspace').hidden = true
    $('#create-dialog').close()
    $('#auth').hidden = false
    $('#auth').innerHTML = `<form class="auth-card" id="login-form"><span class="brand-mark" aria-hidden="true">VI</span><div class="eyebrow">GTA 6 BENCH</div><h1>Your benchmark workspace</h1><p>Sign in with your workspace token to create runs and manage agent URLs.</p><label for="workspace-token">Workspace token</label><input id="workspace-token" name="token" type="password" required autocomplete="current-password" placeholder="Enter your workspace token"><p class="form-error" role="alert">${escape(error)}</p><button class="button primary" type="submit">Open workspace${icon('arrow')}</button></form>`
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
      $('#connection-label').textContent = state.local ? 'Local workspace' : 'Workspace connected'
      await load({ initial: true })
    } catch (error) {
      $('#boot').hidden = true
      $('#auth').hidden = false
      $('#auth').innerHTML = `<div class="auth-card"><span class="brand-mark" aria-hidden="true">VI</span><h1>Connection unavailable</h1><p>${escape(error.message)}</p><button class="button primary" data-action="retry-session">Try again</button></div>`
    }
  }

  function openDialog(type) {
    if (type === 'attempt' && (!state.selected || attempts(state.selected).length >= 5)) return
    const dialog = $('#create-dialog')
    const isRun = type === 'run'
    dialog.innerHTML = `<form id="${isRun ? 'create-run-form' : 'create-attempt-form'}"><div class="dialog-content"><div class="dialog-header"><h2 id="dialog-title">${isRun ? 'Generate a new run' : 'Add an agent URL'}</h2><button type="button" class="icon-button" data-action="close-dialog" aria-label="Close dialog">×</button></div><p class="dialog-description">${isRun ? 'Choose a task set, then give each agent its own URL. You can add up to five URLs to this run.' : 'Create a unique link and label it for the agent you plan to benchmark. You can change the label later.'}</p>${isRun ? `<div class="field"><label for="run-name">Run name</label><input id="run-name" name="name" required maxlength="120" value="${escape(`Run · ${new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`)}" autocomplete="off"></div><div class="field"><label for="run-suite">Task set</label><select id="run-suite" name="suite"><option value="original30">Original 30 tasks</option><option value="all240">All 240 tasks</option></select><div class="suite-description">${icon('tasks')}<span id="suite-description">The original 30-task benchmark. Every URL in this run receives the same set of tasks.</span></div></div>` : `<div class="field"><label for="new-agent">Agent label</label><select id="new-agent" name="agent">${options('grokbot')}</select><p class="field-help">Labels help you organize attempts. You can use a label more than once.</p></div><div class="field"><label for="new-tags">Tags <span style="font-weight:400;color:var(--muted)">(optional)</span></label><input name="tags" id="new-tags" placeholder="e.g. baseline, browser, v2" maxlength="500"><p class="field-help">Separate tags with commas.</p></div>`}<p class="form-error" role="alert"></p></div><div class="dialog-footer"><button class="button quiet" type="button" data-action="close-dialog">Cancel</button><button class="button primary" type="submit">${icon(isRun ? 'plus' : 'link')}${isRun ? 'Generate run' : 'Create agent URL'}</button></div></form>`
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
    if (action === 'logout') {
      control.disabled = true
      try { await api('/logout', { method: 'POST' }); state.drafts.clear(); state.runs = []; state.selected = null; showAuth() } catch (error) { toast(error.message, true) } finally { control.disabled = false }
    }
    if (action === 'copy-url' || action === 'copy-prompt') {
      const attempt = attempts(state.selected).find(item => item.id === control.dataset.attempt)
      if (!attempt) return
      const url = entryUrl(attempt)
      const prompt = `Open ${url} in a separate browser session for this agent URL to begin this GTA 6 Bench run. Follow the instructions on the task page. Use Start task to begin each task, then work through the synthetic storefront. Return to the task page after shopping and use Submit result to report purchased or not_purchased, with a reason or message. Advance through the tasks sequentially until the run is complete. No real purchases or payments are required.`
      await copy(action === 'copy-url' ? url : prompt, action === 'copy-url' ? 'Agent URL copied' : 'Agent prompt copied')
    }
  })

  document.addEventListener('input', event => {
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
  document.addEventListener('change', event => {
    if (event.target.id === 'run-suite') $('#suite-description').textContent = event.target.value === 'all240' ? 'The complete 240-task benchmark. Every URL in this run receives the same set of tasks.' : 'The original 30-task benchmark. Every URL in this run receives the same set of tasks.'
  })

  document.addEventListener('submit', async event => {
    const form = event.target
    if (!['login-form', 'create-run-form', 'create-attempt-form'].includes(form.id) && !form.matches('.attempt-form')) return
    event.preventDefault()
    if (form.matches('.attempt-form')) {
      if (state.saving.has(form.dataset.attempt)) return
      state.saving.add(form.dataset.attempt)
    }
    const button = form.querySelector('button[type="submit"]'), oldText = button.innerHTML
    button.disabled = true
    button.textContent = form.id === 'login-form' ? 'Opening…' : form.matches('.attempt-form') ? 'Saving…' : 'Creating…'
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
        const result = await api('/runs', { method: 'POST', body: { name, suite: data.get('suite') } })
        const run = result.run || result
        if (!run.id) throw new Error('The server did not return a run ID. Refresh the run history before trying again.')
        $('#create-dialog').close()
        setRun(run); render()
        location.hash = `/runs/${encodeURIComponent(run.id)}`
        toast('Run created. Add your first agent URL.')
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
          currentButton.textContent = 'Save changes'
          currentButton.disabled = !state.drafts.get(form.dataset.attempt)?.dirty
        }
      }
      if (button.isConnected) {
        button.innerHTML = oldText
        button.disabled = form.matches('.attempt-form') ? !state.drafts.get(form.dataset.attempt)?.dirty : false
      }
    }
  })
  window.addEventListener('hashchange', () => { if (state.authenticated) load({ initial: true }) })
  window.addEventListener('beforeunload', event => { if ([...state.drafts.values()].some(draft => draft.dirty)) { event.preventDefault(); event.returnValue = '' } })
  initialize()
})()
