/* Store-owned progressive controls. Purchasing and catalog decisions remain on the server. */
(() => {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
  const motion = reducedMotion ? 'instant' : 'smooth'
  const menus = [...document.querySelectorAll('.rs-desktop-menu,.rs-drawer,.rs-user-menu')]
  menus.forEach(menu => menu.addEventListener('toggle', () => {
    menu.querySelector('summary')?.setAttribute('aria-expanded', String(menu.open))
    if (menu.open) menus.filter(other => other !== menu).forEach(other => { other.open = false })
  }))
  document.addEventListener('click', e => menus.forEach(menu => { if (!menu.contains(e.target)) menu.open = false }))
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') menus.forEach(menu => { if (menu.open) { menu.open = false; menu.querySelector('summary')?.focus() } })
  })
  const hero = document.querySelector('[data-hero]')
  if (hero) {
    const track = hero.querySelector('.rs-hero-track'), slides = [...track.children], dots = [...hero.querySelectorAll('[data-hero-index]')]
    let index = 0
    const update = () => {
      index = Math.round(track.scrollLeft / (slides[0].getBoundingClientRect().width || 1))
      index = Math.max(0, Math.min(slides.length - 1, index))
      dots.forEach((dot, i) => dot.setAttribute('aria-current', String(i === index)))
      hero.querySelector('[data-hero-status]').textContent = `Campaign ${index + 1} of ${slides.length}`
      slides.forEach((slide, i) => { slide.inert = i !== index })
    }
    const show = next => {
      index = (next + slides.length) % slides.length
      track.scrollTo({left:slides[index].offsetLeft - slides[0].offsetLeft, behavior:motion})
    }
    hero.querySelectorAll('[data-hero-step]').forEach(button => button.addEventListener('click', () => show(index + Number(button.dataset.heroStep))))
    dots.forEach((button, i) => button.addEventListener('click', () => show(i)))
    track.addEventListener('scroll', update, {passive:true})
    new ResizeObserver(update).observe(track)
    update()
  }
  document.querySelectorAll('[data-shelf]').forEach(shelf => {
    const track = shelf.querySelector('.rs-grid'), prev = shelf.querySelector('[data-shelf-step="-1"]'), next = shelf.querySelector('[data-shelf-step="1"]'), meter = shelf.querySelector('.rs-shelf-meter span')
    const update = () => {
      const max = track.scrollWidth - track.clientWidth
      prev.disabled = track.scrollLeft < 2
      next.disabled = track.scrollLeft >= max - 2
      meter.style.width = `${Math.min(100, 100 * track.clientWidth / track.scrollWidth)}%`
      meter.style.marginLeft = `${max > 0 ? (100 - 100 * track.clientWidth / track.scrollWidth) * track.scrollLeft / max : 0}%`
    }
    shelf.querySelectorAll('[data-shelf-step]').forEach(button => button.addEventListener('click', () => track.scrollBy({left: Number(button.dataset.shelfStep) * track.clientWidth, behavior:motion})))
    track.addEventListener('scroll', update, {passive:true})
    track.addEventListener('keydown', e => {
      if (e.target !== track || !['ArrowLeft','ArrowRight'].includes(e.key)) return
      e.preventDefault(); track.scrollBy({left:(e.key==='ArrowRight'?1:-1)*track.clientWidth,behavior:motion})
    })
    new ResizeObserver(update).observe(track)
    update()
  })
  document.querySelectorAll('[data-gallery]').forEach(gallery => {
    const views = [...gallery.querySelectorAll('[data-gallery-view]')], selectors = [...gallery.querySelectorAll('[data-gallery-select]')], dialog = gallery.querySelector('dialog'), expanded = dialog.querySelector('.rs-zoom-view')
    let index = 0
    const show = next => {
      index = (next + views.length) % views.length
      views.forEach((view, i) => { view.hidden = i !== index })
      selectors.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)))
      gallery.querySelector('[data-gallery-count]').textContent = `Image ${index + 1} of ${views.length}`
      expanded.replaceChildren(...[...views[index].childNodes].map(node => node.cloneNode(true)))
    }
    selectors.forEach((button, i) => button.addEventListener('click', () => show(i)))
    gallery.querySelectorAll('[data-gallery-step]').forEach(button => button.addEventListener('click', () => show(index + Number(button.dataset.galleryStep))))
    gallery.querySelector('[data-gallery-expand]').addEventListener('click', () => { show(index); dialog.showModal() })
    gallery.querySelector('[data-gallery-close]').addEventListener('click', () => dialog.close())
    dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close() })
    dialog.addEventListener('keydown', e => { if (['ArrowLeft','ArrowRight'].includes(e.key)) {e.preventDefault();show(index+(e.key==='ArrowRight'?1:-1))} })
    dialog.addEventListener('close', () => gallery.querySelector('[data-gallery-expand]').focus())
    show(0)
  })
  document.querySelectorAll('[data-product-tabs]').forEach(group => {
    const list = group.querySelector('.rs-tab-list'), links = [...list.querySelectorAll('a')], panels = [...group.querySelectorAll('.rs-tab-panel')]
    list.setAttribute('role','tablist')
    const show = index => {
      links.forEach((link, i) => {link.setAttribute('aria-selected',String(i === index)); link.tabIndex = i === index ? 0 : -1})
      panels.forEach((panel,i) => {panel.hidden = i !== index})
    }
    links.forEach((link,i) => {
      link.id = `tab-${panels[i].id}`; link.setAttribute('role','tab'); link.setAttribute('aria-controls',panels[i].id)
      panels[i].setAttribute('role','tabpanel');panels[i].setAttribute('aria-labelledby',link.id);panels[i].tabIndex=0
      link.addEventListener('click', e => {e.preventDefault();show(i)})
      link.addEventListener('keydown', e => {
        if (!['ArrowLeft','ArrowRight','Home','End'].includes(e.key)) return
        e.preventDefault()
        const n=e.key==='Home'?0:e.key==='End'?links.length-1:(i+(e.key==='ArrowRight'?1:-1)+links.length)%links.length
        show(n);links[n].focus()
      })
    })
    const initial=panels.findIndex(panel=>`#${panel.id}`===location.hash)
    show(initial<0?0:initial)
  })
  const filterPanel=document.querySelector('.rs-filter-panel')
  if (filterPanel && matchMedia('(max-width:760px)').matches) filterPanel.open=false
})()
