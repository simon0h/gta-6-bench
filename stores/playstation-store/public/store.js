// Progressive controls; navigation, product selection and checkout remain server-rendered.
const menus = [...document.querySelectorAll('.ps-nav-menu,.ps-mobile-menu,.ps-search,.ps-account')]
for (const menu of menus) menu.addEventListener('toggle', () => {
  if (menu.open) for (const other of menus) if (other !== menu) other.open = false
})
document.addEventListener('click', event => {
  const closer = event.target.closest('[data-close-details]')
  if (closer) {
    const details = closer.closest('details')
    details.open = false
    details.querySelector('summary').focus()
  }
  for (const menu of menus) if (!menu.contains(event.target)) menu.open = false
})
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    const open = [...document.querySelectorAll('.ps-nav-menu[open],.ps-mobile-menu[open],.ps-search[open],.ps-account[open],.ps-filter-panel[open],.ps-cover-viewer[open]')]
    for (const details of open) { details.open = false; details.querySelector('summary').focus() }
  }
})
for (const section of document.querySelectorAll('.ps-top-section')) {
  const rail = section.querySelector('.ps-top-shelf'), buttons = section.querySelectorAll('[data-shelf-step]')
  const update = () => {
    buttons[0].disabled = rail.scrollLeft <= 1
    buttons[1].disabled = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 2
  }
  for (const button of buttons) button.addEventListener('click', () => rail.scrollBy({left: Number(button.dataset.shelfStep) * rail.clientWidth * .8, behavior:'smooth'}))
  rail.addEventListener('scroll', update); new ResizeObserver(update).observe(rail); update()
}
for (const list of document.querySelectorAll('.ps-access-tabs')) {
  const tabs = [...list.querySelectorAll('[role="tab"]')]
  const activate = tab => {
    for (const item of tabs) {
      const selected = item === tab
      item.setAttribute('aria-selected', String(selected)); item.tabIndex = selected ? 0 : -1
      document.getElementById(item.getAttribute('aria-controls')).hidden = !selected
    }
  }
  for (const tab of tabs) {
    tab.addEventListener('click', () => activate(tab))
    tab.addEventListener('keydown', event => {
      if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return
      event.preventDefault()
      const i = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (tabs.indexOf(tab) + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length
      activate(tabs[i]); tabs[i].focus()
    })
  }
}
const drawer = document.querySelector('.ps-drawer')
if (drawer) {
  drawer.focus()
  drawer.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return
    const controls = [...drawer.querySelectorAll('a[href],button,input,select,textarea')].filter(el=>!el.disabled&&el.type!=='hidden')
    if (event.shiftKey && (document.activeElement===controls[0] || document.activeElement===drawer)) {event.preventDefault();controls.at(-1)?.focus()}
    else if (!event.shiftKey && document.activeElement===controls.at(-1)) {event.preventDefault();controls[0]?.focus()}
  })
}
for (const viewer of document.querySelectorAll('.ps-cover-viewer')) {
  const close = viewer.querySelector('[data-close-details]')
  viewer.addEventListener('toggle', () => { if (viewer.open) close.focus() })
  viewer.addEventListener('keydown', event => { if (viewer.open && event.key==='Tab') {event.preventDefault();close.focus()} })
}
