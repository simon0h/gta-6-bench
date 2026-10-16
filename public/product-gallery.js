(() => {
  for (const gallery of document.querySelectorAll('[data-product-gallery]')) {
    const choices = [...gallery.querySelectorAll('[data-pa-select]')]
    const main = gallery.querySelector('.pa-gallery-main')
    const expanded = gallery.querySelector('[data-pa-expanded]')
    const dialog = gallery.querySelector('dialog')
    let index = Math.max(0, choices.findIndex(button => button.getAttribute('aria-pressed') === 'true'))
    const select = value => {
      index = (value + choices.length) % choices.length
      const choice = choices[index]
      for (const button of choices) button.setAttribute('aria-pressed', String(button === choice))
      for (const image of [main, expanded]) { image.src = choice.dataset.paSrc; image.alt = choice.dataset.paAlt }
      for (const caption of gallery.querySelectorAll('[data-pa-caption]')) caption.textContent = `${index + 1} / ${choices.length}`
    }
    gallery.addEventListener('click', event => {
      const choice = event.target.closest('[data-pa-select]')
      const step = event.target.closest('[data-pa-step]')
      if (choice) select(Number(choice.dataset.paSelect))
      if (step) select(index + Number(step.dataset.paStep))
      if (event.target.closest('[data-pa-enlarge]')) dialog.showModal()
      if (event.target.closest('[data-pa-close]')) dialog.close()
    })
    gallery.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
      if (!dialog.open && !event.target.closest('.pa-gallery-thumbnails')) return
      event.preventDefault()
      select(event.key === 'Home' ? 0 : event.key === 'End' ? choices.length - 1 : index + (event.key === 'ArrowRight' ? 1 : -1))
      if (!dialog.open) choices[index].focus()
    })
    dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close() } })
  }
})()
