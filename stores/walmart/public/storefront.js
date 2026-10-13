// Native disclosure menus work without JavaScript; enhance dismissal and focus.
const menus = [...document.querySelectorAll('.wm-header-menu')]
function closeMenu(menu, restoreFocus = false) {
  menu.open = false
  if (restoreFocus) menu.querySelector('summary').focus()
}
menus.forEach(menu => menu.addEventListener('toggle', () => {
  if (menu.open) menus.forEach(other => { if (other !== menu) closeMenu(other) })
}))
document.addEventListener('click', event => menus.forEach(menu => {
  if (menu.open && !menu.contains(event.target)) closeMenu(menu)
}))
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return
  const openMenu = menus.find(menu => menu.open)
  if (openMenu) { closeMenu(openMenu, true); event.preventDefault() }
  if (location.hash === '#wm-image-viewer') {
    const close = document.querySelector('.wm-image-viewer > a')
    if (close) close.click()
  }
})
document.querySelectorAll('.wm-journey-tabs a').forEach(link => {
  if (new URL(link.href).pathname === location.pathname) link.setAttribute('aria-current', 'page')
})
const viewer = document.getElementById('wm-image-viewer')
function focusImageViewer() {
  if (viewer && location.hash === '#wm-image-viewer') viewer.querySelector('a').focus()
}
window.addEventListener('hashchange', focusImageViewer)
focusImageViewer()
document.addEventListener('keydown', event => {
  if (viewer && location.hash === '#wm-image-viewer' && event.key === 'Tab') {
    event.preventDefault()
    viewer.querySelector('a').focus()
  }
})
function revealLinkedDetails() {
  const target = document.getElementById(location.hash.slice(1))
  if (target?.tagName === 'DETAILS') target.open = true
}
window.addEventListener('hashchange', revealLinkedDetails)
revealLinkedDetails()
