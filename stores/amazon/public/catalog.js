// The image links and forms remain usable without JavaScript.
const gallery = document.querySelector('#az-gallery-main')
const dialog = document.querySelector('#az-gallery-dialog')
document.querySelectorAll('[data-gallery-src]').forEach(link => link.addEventListener('click', event => {
  if (!gallery) return
  event.preventDefault()
  gallery.src = link.dataset.gallerySrc
  gallery.hidden = false
  document.querySelectorAll('[data-gallery-src]').forEach(item => item.removeAttribute('aria-current'))
  link.setAttribute('aria-current', 'true')
  document.querySelectorAll('[data-gallery-open]').forEach(item => { item.href = gallery.src })
}))
document.querySelectorAll('[data-gallery-open]').forEach(link => link.addEventListener('click', event => {
  if (!dialog?.showModal) return
  event.preventDefault()
  dialog.querySelector('img').src = gallery.src
  dialog.showModal()
}))
dialog?.addEventListener('click', event => { if (event.target === dialog) dialog.close() })
const bundle = document.querySelector('#az-bundle')
bundle?.addEventListener('change', () => {
  const selected = [...bundle.querySelectorAll('input[name="asin"]:checked')]
  document.querySelector('#az-bundle-total').textContent = new Intl.NumberFormat('en-US', {style:'currency',currency:'USD'}).format(selected.reduce((sum,input)=>sum+Number(input.dataset.price),0)/100)
  document.querySelector('#az-bundle-add').disabled = selected.length === 0
})

document.querySelectorAll('[data-gallery-photo-open]').forEach(button => button.addEventListener('click', () => { dialog?.showModal() }))

// Desktop Amazon gallery shows six thumbnails and a count for the remainder.
// The plain HTML fallback retains every image and the shared keyboard controls.
const amazonThumbs = document.querySelector('.az-pdp .pa-gallery-thumbnails')
if (amazonThumbs && matchMedia('(min-width:901px)').matches) {
  const extra = [...amazonThumbs.querySelectorAll('[data-pa-select]')].slice(6)
  if (extra.length) {
    extra.forEach(button => { button.hidden = true })
    const more = document.createElement('button')
    more.type = 'button'
    more.className = 'az-gallery-more'
    more.textContent = `${extra.length}+`
    more.setAttribute('aria-label', `Show ${extra.length} more images`)
    more.addEventListener('click', () => {
      extra.forEach(button => { button.hidden = false })
      more.remove()
      extra[0].focus()
    })
    amazonThumbs.append(more)
  }
}
