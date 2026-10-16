// "My tasks": shopping tasks that dashboard users write themselves. The server
// works out the right answer from the store's prices and rules; this page
// shows it as you type, so you can see what the agent should do before saving.
(() => {
  'use strict'
  const consoles = { ps5: 'PlayStation 5', xbox: 'Xbox Series X|S' }
  const editions = { standard: 'Standard Edition', ultimate: 'Ultimate Edition' }
  const reasons = {
    budget_exceeded: 'The cheapest total is over the spending limit.',
    unsupported_variant: 'The store doesn’t sell this edition as a code-in-box.',
  }
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]))
  const money = (currency, value) => Number.isFinite(value) ? `${currency} ${value.toFixed(2)}` : '—'

  function create({ api, toast, icon }) {
    const state = { tasks: null, stores: [], loading: null, editing: null, dirty: false, previewNumber: 0, previewTimer: null }
    const storeOf = key => state.stores.find(store => store.store === key) || state.stores[0]

    async function load(force = false) {
      if (state.tasks && !force) return state
      if (!state.loading) state.loading = api('/tasks').then(body => { state.tasks = body.tasks || []; state.stores = body.stores || []; return state }).finally(() => { state.loading = null })
      return state.loading
    }
    function count() { return state.tasks?.length ?? 0 }
    function byId(id) { return state.tasks?.find(task => task.id === id) ?? null }

    function answerBadge(answer) {
      if (!answer) return '<span class="badge gray"><span class="status-dot"></span>Not worked out</span>'
      return answer.outcome === 'purchased'
        ? '<span class="badge green"><span class="status-dot"></span>Should buy</span>'
        : `<span class="badge amber"><span class="status-dot"></span>Should not buy</span>`
    }
    function summary(task) {
      const store = storeOf(task.store)
      return `${task.quantity} × ${editions[task.edition] || task.edition}, ${consoles[task.platform] || task.platform} · limit ${money(store?.currency || '', task.max_total)}`
    }

    function renderList(main) {
      document.title = 'My tasks · GTA 6 Bench'
      const tasks = state.tasks || []
      main.innerHTML = `<div class="page-heading"><div><h1>My tasks</h1><p>Write your own shopping tasks, then pick them when you start a run.</p></div><a class="button primary" href="#/tasks/new">${icon('plus')}New task</a></div>
        <div class="section-heading"><h2>Saved tasks<span class="section-count">${tasks.length}</span></h2></div>
        ${tasks.length ? `<div class="run-list" role="region" aria-label="Saved tasks" tabindex="0"><table class="run-table task-table"><thead><tr><th scope="col">Task</th><th scope="col">Store</th><th scope="col">Asks for</th><th scope="col">Right answer</th><th scope="col">Updated</th></tr></thead><tbody>${tasks.map(task => `<tr class="run-row"><td class="run-name-cell"><a class="run-name" href="#/tasks/${encodeURIComponent(task.id)}"><span class="run-symbol">${icon('tasks')}</span><span class="run-row-text"><span class="run-title">${escape(task.name)}</span><small class="run-id">${task.version > 1 ? `Edited ${task.version - 1}×` : 'Not edited'}</small></span>${icon('arrow')}</a></td><td class="run-suite-cell">${escape(storeOf(task.store)?.name || task.store)}</td><td class="task-asks">${escape(summary(task))}</td><td>${answerBadge(task.preview?.answer)}</td><td class="run-date-cell">${escape(new Date(task.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }))}</td></tr>`).join('')}</tbody></table></div>`
        : `<section class="empty-state"><h2>No tasks yet</h2><p class="empty-help">Pick a store, a console, how many copies, a spending limit and where to ship. The dashboard works out whether the agent should buy.</p><a class="button primary" href="#/tasks/new">${icon('plus')}New task</a></section>`}`
    }

    function blank(storeKey) {
      const store = storeOf(storeKey)
      return { name: '', store: store.store, platform: 'ps5', edition: 'standard', quantity: 1, max_total: '', instruction: '',
        customer: { ...store.defaults.customer }, shipping_address: { ...store.defaults.shipping_address } }
    }
    function input(name, label, value, extra = '') { return `<div class="field"><label for="task-${name}">${label}</label><input id="task-${name}" name="${name}" value="${escape(value)}" autocomplete="off" ${extra}></div>` }
    function stateField(store, value) {
      if (store.states) return `<div class="field"><label for="task-state">${store.state_label}</label><select id="task-state" name="state">${store.states.map(code => `<option${code === value ? ' selected' : ''}>${code}</option>`).join('')}</select></div>`
      return input('state', `${store.state_label} <span class="optional">(optional)</span>`, value, 'maxlength="60"')
    }
    function formFields(task) {
      const store = storeOf(task.store)
      return `<section class="form-card"><h2>What to buy</h2>
          <div class="field"><label for="task-name">Task name</label><input id="task-name" name="name" value="${escape(task.name)}" required maxlength="80" placeholder="Two copies to an apartment" autocomplete="off"></div>
          <div class="field-grid">
            <div class="field"><label for="task-store">Store</label><select id="task-store" name="store">${state.stores.map(item => `<option value="${item.store}"${item.store === store.store ? ' selected' : ''}>${escape(item.name)}</option>`).join('')}</select></div>
            <div class="field"><label for="task-platform">Console</label><select id="task-platform" name="platform">${Object.entries(consoles).map(([key, name]) => `<option value="${key}"${key === task.platform ? ' selected' : ''}>${name}</option>`).join('')}</select></div>
            <div class="field"><label for="task-edition">Edition</label><select id="task-edition" name="edition">${Object.entries(editions).map(([key, name]) => `<option value="${key}"${key === task.edition ? ' selected' : ''}>${name}</option>`).join('')}</select></div>
            <div class="field"><label for="task-quantity">Copies</label><input id="task-quantity" name="quantity" type="number" inputmode="numeric" min="1" max="${store.max_quantity}" step="1" value="${escape(task.quantity)}" required><p class="field-help">${store.max_quantity === 1 ? `${escape(store.name)} sells one copy per order.` : `${escape(store.name)} sells 1 to ${store.max_quantity} per order.`}</p></div>
          </div>
          <div class="field"><label for="task-max_total">Spending limit (${escape(store.currency)}, including tax and delivery)</label><div class="limit-row"><input id="task-max_total" name="max_total" type="number" inputmode="decimal" min="0.01" step="0.01" value="${escape(task.max_total)}" required placeholder="100.00"><button class="button quiet small" type="button" data-task-action="exact">Exact total</button><button class="button quiet small" type="button" data-task-action="short">1 cent short</button></div><p class="field-help" id="task-cheapest"></p></div>
        </section>
        <section class="form-card"><h2>Shopper</h2><div class="field-grid">
          ${input('first_name', 'First name', task.customer.first_name, 'required maxlength="60"')}${input('last_name', 'Last name', task.customer.last_name, 'required maxlength="60"')}
          ${input('email', 'Email', task.customer.email, 'type="email" required maxlength="120"')}${input('phone', 'Phone', task.customer.phone, 'type="tel" required maxlength="30"')}
        </div><p class="field-help">The agent pays with the test card ending 4242.</p></section>
        <section class="form-card"><h2>Ship to</h2>
          ${input('line1', 'Street address', task.shipping_address.line1, 'required maxlength="100"')}
          ${input('line2', 'Apartment, suite or unit <span class="optional">(optional)</span>', task.shipping_address.line2, 'maxlength="60"')}
          <div class="field-grid three">${input('city', store.store === 'game-uk' ? 'Town or city' : 'City', task.shipping_address.city, 'required maxlength="60"')}${stateField(store, task.shipping_address.state)}${input('postal_code', store.postal_label, task.shipping_address.postal_code, 'required maxlength="12"')}</div>
          <p class="field-help">Country: ${escape(store.country)}. ${escape(store.name)} only ships there.</p>
        </section>
        <section class="form-card"><h2>Instructions for the agent <span class="optional">(optional)</span></h2>
          <textarea id="task-instruction" name="instruction" rows="5" maxlength="4000" placeholder="Leave blank to use the standard wording (see “What the agent sees”).">${escape(task.instruction || '')}</textarea>
          <p class="field-help">Grading always follows the fields above, so keep your wording consistent with them.</p>
        </section>`
    }

    function renderEditor(main, id) {
      const saved = id ? byId(id) : null
      if (id && !saved) {
        main.innerHTML = `<div class="error-state"><h2>Task not found</h2><p>It may have been deleted.</p><a class="button primary" href="#/tasks">My tasks</a></div>`
        return
      }
      const task = saved ? structuredClone(saved) : blank(state.stores[0]?.store)
      state.editing = { id: saved?.id ?? null }
      state.dirty = false
      document.title = `${saved ? 'Edit task' : 'New task'} · GTA 6 Bench`
      main.innerHTML = `<div class="page-heading"><div><h1>${saved ? escape(saved.name) : 'New task'}</h1><p>${saved ? 'Changes apply to runs you create after saving. Runs already made keep their copy.' : 'The right answer is worked out from the store’s prices as you type.'}</p></div></div>
        <form id="task-form" class="task-editor" data-store="${escape(task.store)}" novalidate><div class="task-form-column"><div class="task-fields">${formFields(task)}</div>
          <p class="form-error" role="alert"></p>
          <div class="task-form-actions">${saved ? '<button class="button danger" type="button" data-task-action="delete">Delete task</button>' : ''}<a class="button quiet" href="#/tasks">Cancel</a><button class="button primary" type="submit">${icon('check')}${saved ? 'Save changes' : 'Save task'}</button></div>
        </div><aside class="task-preview" aria-live="polite"><div class="answer-card" id="task-answer"><p class="eyebrow">Right answer</p><p class="answer-wait">Fill in the form to see it.</p></div><details class="agent-view"${matchMedia('(max-width: 1050px)').matches ? '' : ' open'}><summary>What the agent sees</summary><p id="task-instruction-preview"></p></details></aside></form>`
      refreshPreview(main.querySelector('#task-form'), true)
    }

    function values(form) {
      const data = new FormData(form)
      const get = key => String(data.get(key) ?? '')
      return {
        name: get('name'), store: get('store'), platform: get('platform'), edition: get('edition'),
        quantity: Number(get('quantity')), max_total: get('max_total') === '' ? null : Number(get('max_total')),
        customer: { first_name: get('first_name'), last_name: get('last_name'), email: get('email'), phone: get('phone') },
        shipping_address: { line1: get('line1'), line2: get('line2'), city: get('city'), state: get('state'), postal_code: get('postal_code') },
        instruction: get('instruction'),
      }
    }

    // The preview call checks every field; until the name is typed, fill a
    // placeholder so the right answer shows up straight away.
    function refreshPreview(form, immediate = false) {
      clearTimeout(state.previewTimer)
      const run = async () => {
        const number = ++state.previewNumber, body = values(form)
        const store = storeOf(body.store)
        const answerNode = form.querySelector('#task-answer'), instructionNode = form.querySelector('#task-instruction-preview')
        if (!body.name.trim()) body.name = 'Untitled task'
        // Without a limit yet, still ask for the cheapest total so the
        // "Exact total" button works straight away.
        const noLimit = body.max_total === null
        if (noLimit) body.max_total = 100000
        try {
          const preview = await api('/tasks/preview', { method: 'POST', body })
          if (number !== state.previewNumber || !form.isConnected) return
          const answer = preview.answer, cheapest = preview.cheapest_total
          form.querySelector('#task-cheapest').textContent = `Cheapest possible total at ${store.name}: ${money(store.currency, cheapest)}.`
          form.dataset.cheapest = cheapest
          if (noLimit) {
            answerNode.className = 'answer-card'
            answerNode.innerHTML = '<p class="eyebrow">Right answer</p><p class="answer-wait">Enter a spending limit to see it.</p>'
            instructionNode.textContent = ''
            return
          }
          answerNode.className = `answer-card ${answer.outcome === 'purchased' ? 'buy' : 'refuse'}`
          answerNode.innerHTML = `<p class="eyebrow">Right answer</p><p class="answer-title">${answer.outcome === 'purchased' ? 'Buy it' : 'Don’t buy'}</p>${answer.outcome === 'purchased' ? '' : `<p class="answer-reason">Report <code>${escape(answer.reason)}</code>. ${escape(reasons[answer.reason] || '')}</p>`}<ul>${preview.expected_output.map(line => `<li>${escape(line)}</li>`).join('')}</ul>`
          instructionNode.textContent = preview.instruction
        } catch (error) {
          if (number !== state.previewNumber || !form.isConnected) return
          answerNode.className = 'answer-card'
          answerNode.innerHTML = `<p class="eyebrow">Right answer</p><p class="answer-problem">${escape(error.message)}</p>`
        }
      }
      if (immediate) run(); else state.previewTimer = setTimeout(run, 250)
    }

    // A new store brings its own address and phone format; replace them only
    // while they still hold the previous store's starting values.
    function switchStore(form, previousKey) {
      const before = storeOf(previousKey), after = storeOf(form.elements.store.value), current = values(form)
      const untouched = ['line1', 'line2', 'city', 'state', 'postal_code'].every(key => current.shipping_address[key] === (before.defaults.shipping_address[key] ?? ''))
      const task = { ...current, max_total: current.max_total ?? '', quantity: Math.min(current.quantity || 1, after.max_quantity) }
      if (untouched) task.shipping_address = { ...after.defaults.shipping_address }
      if (current.customer.phone === before.defaults.customer.phone) task.customer.phone = after.defaults.customer.phone
      form.querySelector('.task-fields').innerHTML = formFields(task)
      form.dataset.store = after.store
    }

    async function submit(form) {
      const button = form.querySelector('button[type="submit"]'), errorNode = form.querySelector('.form-error'), label = button.innerHTML
      button.disabled = true; button.textContent = 'Saving…'; errorNode.textContent = ''
      try {
        const body = values(form)
        const id = state.editing?.id
        const result = await api(id ? `/tasks/${encodeURIComponent(id)}` : '/tasks', { method: id ? 'PUT' : 'POST', body })
        const task = result.task
        state.tasks = [task, ...(state.tasks || []).filter(item => item.id !== task.id)]
        state.dirty = false
        toast(id ? 'Task saved' : 'Task created')
        location.hash = '/tasks'
      } catch (error) {
        errorNode.textContent = error.message
      } finally { if (button.isConnected) { button.disabled = false; button.innerHTML = label } }
    }

    async function remove(form, control) {
      const id = state.editing?.id
      if (!id || !window.confirm('Delete this task? Runs you already made with it keep their copy.')) return
      control.disabled = true
      try {
        await api(`/tasks/${encodeURIComponent(id)}`, { method: 'DELETE' })
        state.tasks = (state.tasks || []).filter(task => task.id !== id)
        state.dirty = false
        toast('Task deleted')
        location.hash = '/tasks'
      } catch (error) { form.querySelector('.form-error').textContent = error.message; control.disabled = false }
    }

    function setLimit(form, short) {
      const cheapest = Number(form.dataset.cheapest)
      if (!form.dataset.cheapest || !Number.isFinite(cheapest)) return
      form.elements.max_total.value = (short ? cheapest - .01 : cheapest).toFixed(2)
      state.dirty = true
      refreshPreview(form, true)
    }

    document.addEventListener('input', event => {
      const form = event.target.closest?.('#task-form')
      if (!form) return
      state.dirty = true
      if (event.target.name === 'store') return
      refreshPreview(form)
    })
    document.addEventListener('change', event => {
      const form = event.target.closest?.('#task-form')
      if (!form || event.target.name !== 'store') return
      switchStore(form, form.dataset.store)
      refreshPreview(form, true)
    })
    document.addEventListener('click', event => {
      const control = event.target.closest?.('[data-task-action]'), form = control?.closest('#task-form')
      if (!form) return
      const action = control.dataset.taskAction
      if (action === 'exact' || action === 'short') setLimit(form, action === 'short')
      if (action === 'delete') remove(form, control)
    })
    document.addEventListener('submit', event => {
      if (event.target.id !== 'task-form') return
      event.preventDefault()
      submit(event.target)
    })

    // The task list inside the New run dialog.
    function runPicker() {
      const tasks = state.tasks || []
      if (!tasks.length) return '<p class="field-help">You haven’t saved any tasks yet. <a class="text-link" href="#/tasks/new" data-action="close-dialog">Write one</a></p>'
      return `<fieldset class="task-picker"><legend>Tasks in this run</legend><div class="task-picker-list">${tasks.map(task => `<label class="task-pick"><input type="checkbox" name="task_ids" value="${escape(task.id)}" checked><span><strong>${escape(task.name)}</strong><small>${escape(storeOf(task.store)?.name || task.store)} · ${escape(summary(task))}</small></span></label>`).join('')}</div></fieldset>`
    }

    return { load, count, renderList, renderEditor, runPicker, get dirty() { return state.dirty }, clearDirty() { state.dirty = false } }
  }
  window.DashboardTasks = { create }
})()
