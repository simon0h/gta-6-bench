document.documentElement.classList.add('nk-js')
const narrowLayout = window.matchMedia('(max-width: 900px)')

// The ordinary links and forms stay useful without JavaScript.
document.querySelectorAll('[data-dialog-open]').forEach(button => {
  button.addEventListener('click', () => {
    const dialog = document.getElementById(button.dataset.dialogOpen)
    if (dialog && !dialog.open) dialog.showModal()
  })
})
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.querySelectorAll('[data-dialog-close]').forEach(button => button.addEventListener('click', () => dialog.close()))
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return
    const box = dialog.getBoundingClientRect()
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close()
  })
})
document.querySelector('[data-search-toggle]')?.addEventListener('click', event => {
  const button = event.currentTarget
  const open = button.getAttribute('aria-expanded') !== 'true'
  button.setAttribute('aria-expanded', String(open))
  button.setAttribute('aria-label', open ? 'Close search' : 'Open search')
  document.getElementById('nike-search-form').classList.toggle('nk-search-open', open)
  if (open) document.getElementById('nike-search-query').focus()
})
document.addEventListener('click', event => {
  document.querySelectorAll('.nk-nav .nk-menu[open]').forEach(menu => {
    if (!menu.contains(event.target)) menu.open = false
  })
})
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return
  document.querySelectorAll('.nk-nav .nk-menu[open]').forEach(menu => {
    menu.open = false
    menu.querySelector('summary').focus()
  })
  if (document.activeElement?.closest('.nk-search')) document.activeElement.blur()
})

document.querySelectorAll('[data-filter-toggle]').forEach(button => {
  const filters = document.getElementById(button.getAttribute('aria-controls'))
  const setOpen = open => {
    button.setAttribute('aria-expanded', String(open))
    button.textContent = open ? 'Hide Filters' : 'Show Filters'
    filters.hidden = !open
    filters.closest('.nk-list-layout').classList.toggle('nk-filters-hidden', !open)
  }
  setOpen(!narrowLayout.matches)
  button.addEventListener('click', () => setOpen(button.getAttribute('aria-expanded') !== 'true'))
})
document.querySelector('[data-nike-sort] select')?.addEventListener('change', event => event.currentTarget.form.requestSubmit())
document.querySelectorAll('a[href="#size-guide"]').forEach(link => link.addEventListener('click', () => {
  document.getElementById('size-guide').open = true
}))
document.querySelectorAll('[data-nike-buy]').forEach(form => {
  form.querySelectorAll('[name="option_Size"]').forEach(radio => {
    radio.addEventListener('change', () => {
      const stock = Number(radio.dataset.stock)
      form.querySelector('[data-option-stock]').textContent = `${stock} available for this option`
      const qty = form.querySelector('[name="qty"]')
      qty.max = stock
      if (Number(qty.value) > stock) qty.value = stock
      form.querySelector('[type="submit"]').disabled = !stock
      const favoriteSize = document.querySelector('.nk-favorite')?.form?.querySelector('[name="Size"]')
      if (favoriteSize) favoriteSize.value = radio.value
      // Carry the shopper's size through color and gallery links.
      document.querySelectorAll('.nk-color-options a, .nk-thumbnails a').forEach(link => {
        const url = new URL(link.href)
        url.searchParams.set('Size', radio.value)
        link.href = url.href
      })
    })
  })
})

document.querySelectorAll('.nk-member-nav a').forEach(link => {
  if (new URL(link.href).pathname === window.location.pathname) link.setAttribute('aria-current', 'page')
})

// Live catalog suggestions retain ordinary links and the search form as fallback.
const searchInput = document.getElementById('nike-search-query')
const suggestions = document.querySelector('[data-nike-suggestions]')
if (searchInput && suggestions) {
  const popular = suggestions.innerHTML
  let timer, controller, version = 0
  searchInput.addEventListener('input', () => {
    clearTimeout(timer)
    controller?.abort()
    const q = searchInput.value.trim(), current = ++version
    if (q.length < 2) { suggestions.innerHTML = popular; return }
    timer = setTimeout(async () => {
      controller = new AbortController()
      try {
        const response = await fetch(`${searchInput.form.action.replace(/\/(?:search|w)$/, '/suggest')}?q=${encodeURIComponent(q)}`, { signal: controller.signal })
        if (!response.ok) return
        const data = await response.json()
        if (current !== version) return
        const heading = document.createElement('span')
        heading.textContent = data.products.length ? 'Matching Products' : 'No matching products'
        suggestions.replaceChildren(heading)
        for (const product of data.products) {
          const link = document.createElement('a')
          link.href = product.href
          link.textContent = product.title
          suggestions.append(link)
        }
        const all = document.createElement('a')
        all.href = `${searchInput.form.action}?q=${encodeURIComponent(q)}`
        all.textContent = 'View all search results'
        suggestions.append(all)
      } catch (error) {
        if (error.name !== 'AbortError' && current === version) suggestions.innerHTML = popular
      }
    }, 160)
  })
}

// The captured US search has a hideable filter rail and a native sort menu.
const referenceSearch = document.querySelector('.nk-captured-search')
const referenceToggle = document.querySelector('[data-reference-filters]')
referenceToggle?.addEventListener('click', () => {
  const hidden = referenceSearch.classList.toggle('nk-reference-hide-filters')
  referenceToggle.setAttribute('aria-expanded', String(!hidden))
  referenceToggle.firstChild.textContent = hidden ? 'Show Filters ' : 'Hide Filters '
})
const referenceSort = document.querySelector('[data-reference-sort]')
if (referenceSort) {
  referenceSort.addEventListener('change', () => referenceSort.form.requestSubmit())
}

for (const swatch of document.querySelectorAll('[data-reference-colorway]')) {
  const hero = swatch.closest('article').querySelector('.nk-captured-image')
  const image = swatch.querySelector('img'), original = {src: hero.src, alt: hero.alt}
  const preview = () => { hero.src = image.src; hero.alt = image.alt }
  const restore = () => { hero.src = original.src; hero.alt = original.alt }
  swatch.addEventListener('mouseenter', preview)
  swatch.addEventListener('focus', preview)
  swatch.addEventListener('mouseleave', restore)
  swatch.addEventListener('blur', restore)
}
