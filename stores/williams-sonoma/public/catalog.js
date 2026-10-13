const wsSearch = document.querySelector('#ws-query')
let wsSearchTimer, wsSearchRequest = 0
wsSearch?.addEventListener('input', () => {
  clearTimeout(wsSearchTimer)
  const query = wsSearch.value.trim(), request = ++wsSearchRequest
  if (query.length < 2) return
  wsSearchTimer = setTimeout(async () => {
    try {
      const response = await fetch(`/williams-sonoma/search/suggestions?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      if (request !== wsSearchRequest) return
      const list = document.querySelector('#ws-suggestions')
      list.replaceChildren(...data.suggestions.map(item => { const option = document.createElement('option'); option.value = item.title; return option }))
    } catch { /* Native search remains usable without suggestions. */ }
  }, 180)
})

// Native details and forms remain usable when scripts are unavailable.
const wsNarrow = matchMedia('(max-width: 700px)')
const wsSiteMenu = document.querySelector('.ws-site-menu')
const wsFilterPanel = document.querySelector('.ws-filter-panel')
const wsMenus = [...document.querySelectorAll('.ws-nav-menu')]
function wsResponsiveControls() {
  if (wsSiteMenu) wsSiteMenu.open = !wsNarrow.matches
  if (wsFilterPanel) wsFilterPanel.open = !wsNarrow.matches
  wsMenus.forEach(menu => { menu.open = false })
}
wsResponsiveControls()
wsNarrow.addEventListener('change', wsResponsiveControls)
wsMenus.forEach(menu => menu.addEventListener('toggle', () => {
  if (menu.open) wsMenus.filter(other => other !== menu).forEach(other => { other.open = false })
}))
document.addEventListener('click', event => {
  if (!event.target.closest('.ws-nav-menu')) wsMenus.forEach(menu => { menu.open = false })
  const detailsLink = event.target.closest('a[aria-controls]')
  const target = detailsLink && document.getElementById(detailsLink.getAttribute('aria-controls'))
  if (target?.tagName === 'DETAILS') target.open = true
})
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return
  const active = wsMenus.find(menu => menu.open)
  if (active) { active.open = false; active.querySelector('summary').focus() }
  else if (wsNarrow.matches && wsSiteMenu?.open) { wsSiteMenu.open = false; wsSiteMenu.querySelector('summary').focus() }
})
// Avoid buying the old configuration after a shopper chooses a new option.
document.querySelectorAll('.ws-options select').forEach(select => select.addEventListener('change', () => select.form.requestSubmit()))
document.querySelectorAll('[data-print-recipe]').forEach(button => button.addEventListener('click', () => window.print()))
const wsCompare = document.querySelector('#ws-compare button')
if (wsCompare) {
  const boxes = [...document.querySelectorAll('input[form="ws-compare"]')]
  const update = () => {
    const selected = boxes.filter(box => box.checked).length
    wsCompare.textContent = selected ? `Compare selected (${selected})` : 'Compare selected (2–4)'
    wsCompare.disabled = selected < 2 || selected > 4
  }
  boxes.forEach(box => box.addEventListener('change', update))
  update()
}
