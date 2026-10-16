// Progressive enhancements: every destination and form also has a regular page.
const searchDept = document.querySelector('#searchDropdownBox'), searchDeptLabel = document.querySelector('.az-search-facade-label')
searchDept?.addEventListener('change', () => { if (searchDeptLabel) searchDeptLabel.textContent = searchDept.value ? searchDept.selectedOptions[0].textContent : 'All' })
const locationDialog = document.querySelector('#az-location-dialog')
document.querySelectorAll('[data-location-open]').forEach(link => link.addEventListener('click', event => {
  if (!locationDialog?.showModal) return
  event.preventDefault()
  locationDialog.showModal()
  locationDialog.querySelector('input[name="zip"]')?.focus()
}))
locationDialog?.addEventListener('click', event => {
  if (event.target !== locationDialog) return
  const box = locationDialog.getBoundingClientRect()
  if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) locationDialog.close()
})

const menu = document.querySelector('.az-menu'), account = document.querySelector('.az-account-menu')
const closeMenu = () => { if (!menu?.open) return; menu.open = false; menu.querySelector('summary').focus() }
const closeAccount = () => { if (!account?.open) return; account.open = false; account.querySelector('summary').focus() }
document.querySelectorAll('[data-menu-close]').forEach(button => button.addEventListener('click', closeMenu))
document.querySelector('[data-account-close]')?.addEventListener('click', closeAccount)
menu?.addEventListener('toggle', () => {
  document.body.classList.toggle('az-menu-is-open', menu.open)
  if (menu.open) { if (account) account.open = false; menu.querySelector('.az-drawer-head button')?.focus() }
})
account?.addEventListener('toggle', () => { if(account.open && menu?.open) closeMenu() })
document.addEventListener('click', event => { if (account?.open && !account.contains(event.target)) account.open = false })
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') { closeMenu(); closeAccount() }
  if (event.key !== 'Tab' || !menu?.open) return
  const visible = [...menu.querySelectorAll('a,button,summary')].filter(el => el.getClientRects().length && !el.classList.contains('az-menu-backdrop') && !el.classList.contains('az-nav-all'))
  const first = visible[0], last = visible.at(-1)
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
  if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
})

const campaigns = [...document.querySelectorAll('[data-campaign]')]
if (campaigns.length > 1) {
  let current = 0
  document.querySelector('.az-campaign-controls').hidden = false
  const show = delta => {
    current = (current + delta + campaigns.length) % campaigns.length
    campaigns.forEach((panel, index) => { panel.hidden = index !== current })
    document.querySelector('[data-campaign-count]').textContent = `${current + 1} / ${campaigns.length}`
  }
  document.querySelector('[data-campaign-prev]').addEventListener('click', () => show(-1))
  document.querySelector('[data-campaign-next]').addEventListener('click', () => show(1))
}
