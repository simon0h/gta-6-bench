// Progressive keyboard behavior; shopping forms retain server-side validation.
const categories = document.querySelector('.tg-native-menu')
if (categories) {
  categories.querySelectorAll('.tg-menu-body > details').forEach(department => {
    department.addEventListener('toggle', () => {
      if (department.open) categories.querySelectorAll('.tg-menu-body > details').forEach(other => { if (other !== department) other.open = false })
    })
  })
  document.addEventListener('click', event => { if (!categories.contains(event.target)) categories.open = false })
  categories.addEventListener('keydown', event => {
    if (event.key === 'Escape') { categories.open = false; categories.querySelector('summary').focus() }
  })
}
const imageViewer = document.querySelector('.tg-image-viewer')
const imageTrigger = document.querySelector('[data-image-open]')
const drawer = document.querySelector('.tg-drawer[role="dialog"]')
const modal = () => location.hash === '#tg-image-viewer' ? imageViewer : drawer
function trapFocus(event) {
  const active = modal()
  if (!active) return
  if (event.key === 'Escape') {
    event.preventDefault()
    if (active === imageViewer) { location.hash = 'info-and-fulfillment'; imageTrigger?.focus() }
    else active.querySelector('.tg-drawer-close')?.click()
  }
  if (event.key === 'Tab') {
    const items = [...active.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex="0"]')]
    const first = items[0], last = items.at(-1)
    if (event.shiftKey && (document.activeElement === first || document.activeElement === active)) { event.preventDefault(); last?.focus() }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
  }
}
document.addEventListener('keydown', trapFocus)
window.addEventListener('hashchange', () => {
  if (location.hash === '#tg-image-viewer') imageViewer?.querySelector('[data-image-close]')?.focus()
  else if (document.activeElement?.closest('.tg-image-viewer')) imageTrigger?.focus()
})
if (drawer) drawer.querySelector('.tg-drawer-close')?.focus()
if (location.hash === '#tg-image-viewer') imageViewer?.querySelector('[data-image-close]')?.focus()
