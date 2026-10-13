// Progressive enhancement: search remains a normal GET form without JavaScript.
const searchInput = document.querySelector('.bb-search input[name="st"]')
const suggestions = document.querySelector('#bb-search-suggestions')
if (searchInput && suggestions) {
  let timer, version = 0
  searchInput.addEventListener('input', () => {
    clearTimeout(timer)
    const revision = ++version
    timer = setTimeout(async () => {
      if (searchInput.value.trim().length < 2) return
      try {
        const base = searchInput.form.action.replace('/site/searchpage.jsp', '')
        const response = await fetch(`${base}/search/suggestions?q=${encodeURIComponent(searchInput.value)}`)
        if (!response.ok) return
        const rows = await response.json()
        if (revision !== version) return
        suggestions.replaceChildren(...rows.map(row => {
          const option = document.createElement('option')
          option.value = row.title
          return option
        }))
      } catch { /* The normal search form remains available. */ }
    }, 180)
  })
}
// Native menus remain keyboard-operable and dismiss with Escape.
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') document.querySelectorAll('.bb-native-menu[open]').forEach(menu => { menu.open = false; menu.querySelector('summary').focus() })
})

const utilityMenus = [...document.querySelectorAll('.bb-native-menu')]
for (const menu of utilityMenus) {
  menu.addEventListener('toggle', () => {
    if (menu.open) utilityMenus.forEach(other => { if (other !== menu) other.open = false })
  })
}
document.addEventListener('click', event => {
  utilityMenus.forEach(menu => { if (menu.open && !menu.contains(event.target)) menu.open = false })
})
const imageDialog = document.querySelector('.bb-photo-dialog')
const imageLink = document.querySelector('[data-image-open]')
if (imageDialog && imageLink && typeof imageDialog.showModal === 'function') {
  imageLink.addEventListener('click', event => { event.preventDefault(); imageDialog.showModal() })
  imageDialog.addEventListener('click', event => {
    if (event.target !== imageDialog) return
    const box=imageDialog.getBoundingClientRect()
    if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom) imageDialog.close()
  })
  imageDialog.addEventListener('close', () => imageLink.focus())
}
for (const link of document.querySelectorAll('.bb-journey-nav a')) {
  if (new URL(link.href).pathname === location.pathname) link.setAttribute('aria-current','page')
}
