// Progressive option selection: ordinary GET forms remain usable without JavaScript.
document.querySelector('[data-search-clear]')?.addEventListener('click', () => {
  const input = document.querySelector('#ikea-search')
  input.value = ''
  input.focus()
})
for (const form of document.querySelectorAll('[data-option-form]')) {
  form.addEventListener('change', event => {
    if (event.target.matches('select')) form.requestSubmit()
  })
}

// Mobile navigation retains ordinary links and native disclosure menus.
document.body.classList.add('ik-enhanced')
const navToggle = document.querySelector('[data-nav-toggle]')
const navigation = document.querySelector('#ikea-navigation')
const narrowScreen = window.matchMedia('(max-width: 760px)')
function closeNavigation() {
  document.body.classList.remove('ik-navigation-open')
  navToggle?.setAttribute('aria-expanded', 'false')
  navToggle?.setAttribute('aria-label', 'Open menu')
  for (const menu of document.querySelectorAll('.ik-menu[open]')) menu.open = false
}
function syncViewport() {
  if (navToggle) navToggle.hidden = !narrowScreen.matches
  closeNavigation()
  const filters = document.querySelector('[data-filter-disclosure]')
  if (filters) filters.open = !narrowScreen.matches
}
syncViewport()
narrowScreen.addEventListener('change', syncViewport)
navToggle?.addEventListener('click', () => {
  const open = document.body.classList.toggle('ik-navigation-open')
  navToggle.setAttribute('aria-expanded', String(open))
  navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu')
})
for (const menu of document.querySelectorAll('.ik-menu')) {
  menu.addEventListener('toggle', () => {
    if (menu.open) for (const other of document.querySelectorAll('.ik-menu')) if (other !== menu) other.open = false
  })
}
document.addEventListener('click', event => {
  if (!navigation?.contains(event.target) && !navToggle?.contains(event.target)) closeNavigation()
})
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return
  const openMenu = document.querySelector('.ik-menu[open]')
  const wasMobileOpen = document.body.classList.contains('ik-navigation-open')
  closeNavigation()
  if (wasMobileOpen) navToggle?.focus()
  else openMenu?.querySelector('summary').focus()
})

for (const browser of document.querySelectorAll('[data-category-browser]')) {
  const rail = browser.querySelector('[data-category-rail]')
  const controls = browser.querySelector('.ik-rail-controls')
  const previous = controls.querySelector('[data-rail-direction="-1"]')
  const next = controls.querySelector('[data-rail-direction="1"]')
  function updateRail() {
    controls.hidden = rail.scrollWidth <= rail.clientWidth + 2
    previous.disabled = rail.scrollLeft <= 2
    next.disabled = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 2
  }
  for (const button of controls.querySelectorAll('button')) button.addEventListener('click', () => {
    rail.scrollBy({left: Number(button.dataset.railDirection) * rail.clientWidth * .75, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'})
  })
  rail.addEventListener('scroll', updateRail, {passive:true})
  new ResizeObserver(updateRail).observe(rail)
  updateRail()
}

const imageDialog = document.querySelector('.ik-image-dialog')
const imageOpen = document.querySelector('[data-image-open]')
if (imageDialog && imageOpen && typeof imageDialog.showModal === 'function') {
  imageOpen.hidden = false
  imageOpen.addEventListener('click', () => imageDialog.showModal())
  imageDialog.addEventListener('click', event => {
    if (event.target !== imageDialog) return
    const box = imageDialog.getBoundingClientRect()
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) imageDialog.close()
  })
}
