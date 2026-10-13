// Progressive enhancement: each selector still works with its visible submit button.
for (const form of document.querySelectorAll('[data-auto-submit]')) {
  form.addEventListener('change', event => { if (event.target.tagName === 'SELECT') form.requestSubmit() })
}
const input = document.querySelector('#sp-search'), panel = document.querySelector('#sp-suggestions')
if (input && panel) {
  let sequence = 0, timer
  input.addEventListener('input', () => {
    clearTimeout(timer)
    const current = ++sequence
    timer = setTimeout(async () => {
      try {
        const response = await fetch(`${input.form.action}/suggestions?q=${encodeURIComponent(input.value)}`)
        if (!response.ok) return
        const { suggestions } = await response.json()
        if (current !== sequence) return
        panel.replaceChildren()
        const heading = document.createElement('strong')
        heading.textContent = suggestions.length ? 'Suggested products' : 'No matching beauty products'
        panel.append(heading)
        for (const suggestion of suggestions) {
          const link = document.createElement('a')
          link.href = suggestion.url
          link.textContent = suggestion.label
          panel.append(link)
        }
      } catch { /* Search form remains usable when suggestions are unavailable. */ }
    }, 150)
  })
  input.addEventListener('keydown', event => { if (event.key === 'Escape') input.blur() })
}

// Native links and forms remain usable when enhancement is unavailable.
document.body.classList.add('sp-enhanced')
const shoppingMenu = document.querySelector('#sp-shop-nav')
const shoppingToggle = document.querySelector('.sp-shop-toggle')
function closeShoppingMenu() {
  shoppingToggle?.setAttribute('aria-expanded', 'false')
  shoppingToggle?.setAttribute('aria-label', 'Open shopping menu')
  shoppingMenu?.classList.remove('sp-nav-open')
}
shoppingToggle?.addEventListener('click', () => {
  const open = shoppingToggle.getAttribute('aria-expanded') !== 'true'
  shoppingToggle.setAttribute('aria-expanded', String(open))
  shoppingToggle.setAttribute('aria-label', open ? 'Close shopping menu' : 'Open shopping menu')
  shoppingMenu.classList.toggle('sp-nav-open', open)
})
const menus = [...document.querySelectorAll('.sp-menu')]
for (const menu of menus) {
  menu.addEventListener('toggle', () => {
    if (menu.open) for (const sibling of menus) if (sibling !== menu) sibling.open = false
  })
}
document.addEventListener('click', event => {
  for (const menu of menus) if (menu.open && !menu.contains(event.target)) menu.open = false
})
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return
  const openMenu = menus.find(menu => menu.open)
  if (openMenu) {
    openMenu.open = false
    openMenu.querySelector('summary').focus()
  } else if (shoppingToggle?.getAttribute('aria-expanded') === 'true') {
    closeShoppingMenu()
    shoppingToggle.focus()
  }
})
const narrow = matchMedia('(max-width: 760px)')
function updateCompactPanels() {
  for (const panel of document.querySelectorAll('.sp-filter-disclosure,.sp-account-directory')) panel.open = !narrow.matches
  if (!narrow.matches) closeShoppingMenu()
}
updateCompactPanels()
narrow.addEventListener('change', updateCompactPanels)
if (input && panel) {
  input.form.addEventListener('focusin', () => input.setAttribute('aria-expanded', 'true'))
  input.form.addEventListener('focusout', event => { if (!input.form.contains(event.relatedTarget)) input.setAttribute('aria-expanded', 'false') })
  input.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown') { event.preventDefault(); panel.querySelector('a')?.focus() }
  })
  panel.addEventListener('keydown', event => {
    if (event.key === 'Escape') { input.focus(); input.blur() }
  })
}
// Rating-summary links reveal their actual destination instead of landing on a closed section.
for (const link of document.querySelectorAll('a[href="#reviews"]')) {
  link.addEventListener('click', () => { const reviews = document.querySelector('#reviews'); if (reviews) reviews.open = true })
}

const referenceCompare = document.querySelector('[data-reference-compare]')
if (referenceCompare) {
  const choices = [...document.querySelectorAll('[data-reference-select]')]
  const comparison = document.querySelector('.sp-reference-comparison')
  const updateComparison = () => {
    const selected = choices.filter(choice => choice.checked)
    for (const choice of choices) choice.disabled = selected.length >= 4 && !choice.checked
    comparison.hidden = !referenceCompare.checked || selected.length === 0
    comparison.lastElementChild.replaceChildren(...selected.map(choice => {
      const product = choice.closest('article'), result = document.createElement('article')
      for (const selector of ['.sp-reference-photo>a:first-child', '.sp-reference-title', '.sp-reference-rating', '.sp-reference-price']) {
        result.append(product.querySelector(selector).cloneNode(true))
      }
      return result
    }))
  }
  referenceCompare.addEventListener('change', () => {
    for (const choice of choices) choice.parentElement.hidden = !referenceCompare.checked
    updateComparison()
  })
  for (const choice of choices) choice.addEventListener('change', updateComparison)
}
