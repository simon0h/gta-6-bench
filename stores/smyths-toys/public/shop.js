// Progressive enhancements; server-rendered links and forms remain usable without JS.
const filters = document.querySelector('.filter-disclosure')
if (filters && matchMedia('(max-width: 760px)').matches) filters.open = false
// Phone: listing filters start folded under the Filters heading.
if (matchMedia('(max-width: 760px)').matches) for (const box of document.querySelectorAll('.st-filter-box[open]')) box.open = false
const menu = document.querySelector('.department-menu')
document.addEventListener('click', event => {
 if (menu?.open && !menu.contains(event.target)) menu.open = false
 const opener = event.target.closest('[data-open-dialog]')
 if (opener) document.getElementById(opener.dataset.openDialog)?.showModal()
 const closer = event.target.closest('[data-close-dialog]')
 if (closer) closer.closest('dialog')?.close()
})
document.addEventListener('keydown', event => {
 if(event.key === 'Escape' && menu?.open) { menu.open = false; menu.querySelector('summary').focus() }
})
