const search = document.querySelector('#site-search')
const suggestions = document.querySelector('#eb-suggestions')
let pending
search?.addEventListener('input', () => {
  clearTimeout(pending)
  pending = setTimeout(async () => {
    const query = search.value.trim()
    if (query.length < 2) { suggestions.replaceChildren(); return }
    try {
      const response = await fetch(`/eb-games-au/search/suggestions?q=${encodeURIComponent(query)}`)
      const products = await response.json()
      if (search.value.trim() !== query) return
      suggestions.replaceChildren(...products.map(product => {
        const option = document.createElement('option')
        option.value = product.title
        return option
      }))
    } catch { suggestions.replaceChildren() }
  }, 180)
})

// Native controls remain usable without JavaScript; collapse the long filter list on phones.
const filters = document.querySelector('.filter-details')
if (filters && window.matchMedia('(max-width: 600px)').matches) filters.open = false
const menu = document.querySelector('.mega-menu')
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu?.open) { menu.open = false; menu.querySelector('summary').focus() }
})
document.addEventListener('click', event => {
  if (menu?.open && !menu.contains(event.target)) menu.open = false
})
