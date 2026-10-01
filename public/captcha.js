(() => {
  const form = document.querySelector('[data-captcha-form][data-captcha-kind="hold"]')
  if (!form || !window.fetch || !window.requestAnimationFrame || !form.requestSubmit) return

  const enhancement = form.querySelector('[data-hold-enhancement]')
  const button = form.querySelector('[data-hold-button]')
  const label = form.querySelector('[data-hold-label]')
  const progress = form.querySelector('[data-hold-progress]')
  const status = form.querySelector('[data-hold-status]')
  const verify = form.querySelector('[data-hold-verify]')
  const challenge = form.elements.namedItem('challenge_id')
  if (!enhancement || !button || !label || !progress || !status || !verify || !challenge) return

  let active = false
  let startingRequest = false
  let submitting = false
  let attempt = 0
  let timer = null
  let frame = null
  let pointerId = null
  let heldKey = null

  function clearProgress() {
    window.clearTimeout(timer)
    window.cancelAnimationFrame(frame)
    timer = null
    frame = null
    progress.style.transform = 'scaleX(0)'
  }

  function cancel() {
    if (!active || submitting) return
    active = false
    attempt += 1
    pointerId = null
    heldKey = null
    clearProgress()
    button.classList.remove('is-holding')
    label.textContent = 'Press and hold'
    status.textContent = 'Released early. Press and hold again, or use timed verification below.'
  }

  async function begin() {
    if (active || submitting || startingRequest) return
    active = true
    startingRequest = true
    const currentAttempt = ++attempt
    label.textContent = 'Preparing…'
    status.textContent = 'Keep holding while verification starts.'
    button.classList.add('is-holding')

    try {
      const response = await fetch(form.dataset.captchaStart, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ challenge_id: challenge.value }),
      })
      if (!response.ok) throw new Error('Verification could not start.')
      const result = await response.json()
      if (!result.ok || !Number.isFinite(result.holdMs) || result.holdMs < 3000 || result.holdMs > 30000) {
        throw new Error('Verification could not start.')
      }
      if (!active || currentAttempt !== attempt) return

      const startedAt = performance.now()
      label.textContent = 'Keep holding…'
      status.textContent = 'Keep holding until verification completes.'
      const paintProgress = () => {
        if (!active || currentAttempt !== attempt) return
        const fraction = Math.min((performance.now() - startedAt) / result.holdMs, 1)
        progress.style.transform = `scaleX(${fraction})`
        frame = window.requestAnimationFrame(paintProgress)
      }
      frame = window.requestAnimationFrame(paintProgress)
      timer = window.setTimeout(() => {
        if (!active || submitting || currentAttempt !== attempt) return
        submitting = true
        active = false
        window.cancelAnimationFrame(frame)
        progress.style.transform = 'scaleX(1)'
        label.textContent = 'Continuing…'
        status.textContent = 'Verification complete. Continuing to the store.'
        button.disabled = true
        form.requestSubmit(verify)
      }, result.holdMs)
    } catch {
      if (!active || currentAttempt !== attempt) return
      active = false
      clearProgress()
      button.classList.remove('is-holding')
      label.textContent = 'Press and hold'
      status.textContent = 'Unable to start. Try again, or use timed verification below.'
    } finally {
      startingRequest = false
    }
  }

  button.addEventListener('pointerdown', (event) => {
    if (!event.isPrimary || event.button !== 0 || active || startingRequest || submitting) return
    event.preventDefault()
    button.focus({ preventScroll: true })
    pointerId = event.pointerId
    begin()
  })
  window.addEventListener('pointerup', (event) => {
    if (event.pointerId === pointerId) cancel()
  })
  window.addEventListener('pointercancel', (event) => {
    if (event.pointerId === pointerId) cancel()
  })
  window.addEventListener('pointermove', (event) => {
    if (event.pointerId !== pointerId) return
    const bounds = button.getBoundingClientRect()
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) cancel()
  })
  button.addEventListener('pointerleave', () => {
    if (pointerId !== null) cancel()
  })
  button.addEventListener('keydown', (event) => {
    if (event.key !== ' ' && event.key !== 'Enter') return
    event.preventDefault()
    if (event.repeat || active || startingRequest || submitting) return
    heldKey = event.key
    begin()
  })
  button.addEventListener('keyup', (event) => {
    if (event.key !== ' ' && event.key !== 'Enter') return
    event.preventDefault()
    if (event.key === heldKey) cancel()
  })
  button.addEventListener('blur', cancel)
  window.addEventListener('blur', cancel)
  window.addEventListener('pagehide', cancel)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancel()
  })
  form.addEventListener('reset', cancel)
  form.addEventListener('submit', () => {
    clearProgress()
    submitting = true
    active = false
    button.disabled = true
  })

  enhancement.hidden = false
  form.classList.add('is-enhanced')
})()
