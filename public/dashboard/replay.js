(() => {
  'use strict'
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]))
  let vendor

  // The player bundle is only needed once someone opens a replay.
  function loadPlayer() {
    vendor ||= new Promise((resolve, reject) => {
      const style = document.createElement('link')
      style.rel = 'stylesheet'; style.href = '/dashboard/vendor/rrweb-player.css'
      document.head.append(style)
      const script = document.createElement('script')
      script.src = '/dashboard/vendor/rrweb-player.js'
      script.onload = () => {
        const Player = window.rrwebPlayer?.default || window.rrwebPlayer
        typeof Player === 'function' ? resolve(Player) : reject(new Error('Replay player failed to load.'))
      }
      script.onerror = () => { vendor = null; reject(new Error('Replay player failed to load.')) }
      document.head.append(script)
    })
    return vendor
  }

  async function decode(chunk) {
    const bytes = Uint8Array.from(atob(chunk.data), char => char.charCodeAt(0))
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))
    const events = JSON.parse(await new Response(stream).text())
    return Array.isArray(events) ? events : []
  }

  // rrweb stores a click as an incremental snapshot (3) from mouse interaction (2) of type click (2).
  const isClick = event => event?.type === 3 && event.data?.source === 2 && event.data?.type === 2

  // Draws a ripple where each click landed and outlines the element that was pressed.
  // Works on any recording, because rrweb has always saved click positions and targets.
  const clickEffect = {
    handler(event, isSync, { replayer }) {
      // Seeking applies many events at once; only show clicks as they play.
      if (isSync || !isClick(event)) return
      const wrapper = replayer.wrapper
      if (!wrapper) return
      const viewport = replayer.iframe?.contentWindow
      let node = replayer.getMirror?.().getNode(event.data.id)
      if (node && node.nodeType !== 1) node = node.parentElement
      // Positions inside a frame on the page are measured from that frame; shift them onto the page.
      let rect = null, offsetX = 0, offsetY = 0
      try {
        for (let frame = node?.ownerDocument.defaultView; frame && frame !== viewport && frame.frameElement; frame = frame.parent) {
          const outer = frame.frameElement.getBoundingClientRect()
          offsetX += outer.left; offsetY += outer.top
        }
        const inner = node?.getBoundingClientRect()
        if (inner) rect = new DOMRect(inner.left + offsetX, inner.top + offsetY, inner.width, inner.height)
      } catch { /* The node may have left the page. */ }
      let shown = true
      try { const style = node.ownerDocument.defaultView.getComputedStyle(node); shown = style.visibility !== 'hidden' && style.opacity !== '0' } catch { /* Keep the outline. */ }
      const fits = shown && rect && rect.width > 0 && rect.height > 0 &&
        !(viewport && rect.width >= viewport.innerWidth * 0.9 && rect.height >= viewport.innerHeight * 0.9)
      let x = event.data.x + offsetX, y = event.data.y + offsetY
      // Clicks fired from a script carry no position; fall back to the middle of the element.
      if (!(event.data.x || event.data.y) && fits) {
        x = rect.left + rect.width / 2; y = rect.top + rect.height / 2
        replayer.mouse.style.left = `${x}px`; replayer.mouse.style.top = `${y}px`
      }
      const add = (className, style) => {
        const mark = document.createElement('div')
        mark.className = className
        Object.assign(mark.style, style)
        wrapper.append(mark)
        mark.addEventListener('animationend', () => mark.remove(), { once: true })
        setTimeout(() => mark.remove(), 2000)
      }
      if (fits) add('replay-click-target', { left: `${rect.left - 3}px`, top: `${rect.top - 3}px`, width: `${rect.width + 6}px`, height: `${rect.height + 6}px` })
      if (Number.isFinite(x) && Number.isFinite(y)) add('replay-click', { left: `${x}px`, top: `${y}px` })
    },
  }

  function create({ api }) {
    const dialog = document.querySelector('#replay-dialog')
    let state = null, player = null
    const find = selector => dialog.querySelector(selector)

    function teardown() {
      state?.controller.abort()
      try { player?.$destroy?.() } catch { /* The player may not have finished mounting. */ }
      player = null
    }
    function close() {
      teardown()
      state = null
      if (dialog.open) dialog.close()
    }
    function status(text) { const node = find('.replay-status'); if (node) node.textContent = text }

    async function load() {
      const session = state
      teardown()
      session.controller = new AbortController()
      const { signal } = session.controller
      const stage = find('.replay-stage'), errorNode = find('.replay-error')
      errorNode.hidden = true
      stage.innerHTML = '<p class="traversal-empty" role="status">Loading replay…</p>'
      find('[data-replay-action="download"]').disabled = true
      try {
        const base = `/runs/${encodeURIComponent(session.runId)}/attempts/${encodeURIComponent(session.attemptId)}/replay/${encodeURIComponent(session.trialId)}`
        const chunks = []
        let cursor = 0, total = 0, pages = 0
        do {
          const batch = await api(`${base}?after=${cursor}`, { signal })
          if (state !== session) return
          if (batch.recorded === false) { stage.innerHTML = '<p class="traversal-empty">Replay unavailable. This task started before replay recording was enabled.</p>'; status('Not recorded'); return }
          total = Number(batch.chunk_count) || 0
          chunks.push(...(Array.isArray(batch.chunks) ? batch.chunks : []))
          status(`Loading ${chunks.length} of ${total} pieces…`)
          const next = Number(batch.next_cursor)
          if (batch.next_cursor == null || !Number.isSafeInteger(next) || next <= cursor) break
          cursor = next
        } while (++pages < 500)
        const decoded = await Promise.all(chunks.map(chunk => decode(chunk).catch(() => [])))
        if (state !== session) return
        // Chunks from different page loads can arrive out of order; play by time.
        const events = decoded.flat().filter(event => Number.isFinite(event?.timestamp)).sort((a, b) => a.timestamp - b.timestamp)
        session.events = events
        if (!events.some(event => event.type === 2) || events.length < 2) {
          stage.innerHTML = '<p class="traversal-empty">No replay recorded for this task yet.</p>'
          status(total ? `${total} pieces, nothing playable yet` : 'Nothing recorded yet')
          return
        }
        const seconds = Math.round((events.at(-1).timestamp - events[0].timestamp) / 1000)
        const Player = await loadPlayer()
        if (state !== session) return
        stage.innerHTML = ''
        const width = Math.max(320, stage.clientWidth - 2), height = Math.max(240, stage.clientHeight - 90)
        player = new Player({ target: stage, props: { events, width, height, autoPlay: false, skipInactive: true, showController: true, mouseTail: { strokeStyle: '#f5c518' }, plugins: [clickEffect] } })
        const clicks = events.filter(isClick).length
        status(`${Math.floor(seconds / 60)}m ${seconds % 60}s recorded · ${new Set(chunks.map(chunk => chunk.page_id)).size} page loads · ${clicks} ${clicks === 1 ? 'click' : 'clicks'}`)
        find('[data-replay-action="download"]').disabled = false
      } catch (error) {
        if (state !== session || error.name === 'AbortError') return
        stage.innerHTML = ''
        errorNode.textContent = error.message || 'Couldn’t load the replay.'
        errorNode.hidden = false
        status('Load failed')
      }
    }

    function open({ runId, attemptId, trialId, taskId, label }) {
      close()
      state = { runId, attemptId, trialId, taskId, controller: new AbortController(), events: [] }
      dialog.innerHTML = `<div class="traversal-header"><div><h2 id="replay-title">Replay <span>${escape(label)} · ${escape(taskId || 'Task')}</span></h2><p class="replay-status traversal-status" role="status">Loading…</p></div><div class="replay-actions"><button class="button secondary small" type="button" data-replay-action="reload">Reload</button><button class="button quiet small" type="button" data-replay-action="download" disabled>JSON</button><button class="icon-button" type="button" data-replay-action="close" aria-label="Close replay" autofocus>×</button></div></div><p class="replay-error traversal-error" role="alert" hidden></p><div class="replay-stage"></div><p class="replay-note">Rebuilt from the page as the agent saw it. Passwords and card details are masked. Product images may be missing on a local dashboard.</p>`
      dialog.showModal()
      load()
    }

    dialog.addEventListener('click', event => {
      const button = event.target.closest('[data-replay-action]')
      if (!button || button.disabled || !state) return
      const action = button.dataset.replayAction
      if (action === 'close') close()
      if (action === 'reload') load()
      if (action === 'download') {
        const data = { attempt_id: state.attemptId, trial_id: state.trialId, task_id: state.taskId, events: state.events }
        const url = URL.createObjectURL(new Blob([JSON.stringify(data)], { type: 'application/json' }))
        const link = document.createElement('a')
        link.href = url; link.download = `replay-${String(state.trialId).replace(/[^a-zA-Z0-9_-]/g, '_')}.json`
        document.body.append(link); link.click(); link.remove()
        setTimeout(() => URL.revokeObjectURL(url), 1000)
      }
    })
    dialog.addEventListener('close', () => { if (state) { teardown(); state = null } })
    return { open, close }
  }
  window.DashboardReplay = { create }
})()
