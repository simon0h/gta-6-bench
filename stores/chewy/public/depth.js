document.querySelectorAll('[data-chewy-option]').forEach(select => {
  select.addEventListener('change', () => {
    const form = select.form
    if ([...form.querySelectorAll('select[required]')].every(input => input.value)) form.requestSubmit()
  })
})

// Keep navigation and refinements available without JavaScript; collapse them
// only after their responsive toggle has been connected.
const chewyNarrowScreen = window.matchMedia('(max-width: 760px)')
document.querySelectorAll('[data-chewy-toggle]').forEach(button => {
  const panel = document.getElementById(button.dataset.chewyToggle)
  if (!panel) return
  const setOpen = open => {
    panel.hidden = !open
    button.setAttribute('aria-expanded', String(open))
  }
  const sync = () => {
    button.hidden = !chewyNarrowScreen.matches
    setOpen(!chewyNarrowScreen.matches)
  }
  button.addEventListener('click', () => setOpen(panel.hidden))
  panel.addEventListener('keydown', event => {
    if (event.key === 'Escape' && chewyNarrowScreen.matches) {
      setOpen(false)
      button.focus()
    }
  })
  chewyNarrowScreen.addEventListener('change', sync)
  sync()
})
