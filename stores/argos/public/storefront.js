// Progressive enhancements; forms and department links also work without JavaScript.
const menus = [...document.querySelectorAll('.shop-menu')]
for (const menu of menus) menu.addEventListener('toggle', () => {
  if (menu.open) for (const other of menus) if (other !== menu) other.open = false
})
document.addEventListener('click', event => {
  for (const menu of menus) if (!menu.contains(event.target)) menu.open = false
})
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return
  for (const menu of menus) if (menu.open) {
    menu.open = false
    menu.querySelector('summary').focus()
  }
})
const gallery = document.querySelector('.gallery-dialog')
const galleryButton = document.querySelector('[data-open-gallery]')
if (gallery && galleryButton) {
  galleryButton.addEventListener('click', () => gallery.showModal())
  gallery.addEventListener('click', event => { if (event.target === gallery) gallery.close() })
  gallery.addEventListener('close', () => galleryButton.focus())
}
for (const link of document.querySelectorAll('.product-sections a, .purchase-panel .rating a')) {
  link.addEventListener('click', () => {
    const target = document.getElementById(link.hash.slice(1))
    if (target?.tagName === 'DETAILS') target.open = true
  })
}
const departmentDirectory = document.querySelector('.department-directory')
if (departmentDirectory) departmentDirectory.open = window.matchMedia('(min-width: 761px)').matches
