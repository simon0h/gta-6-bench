// Progressive controls only. Catalog selection and purchase validation stay on the server.
const rail = document.querySelector('.gs-nav')
const arrows = [...document.querySelectorAll('[data-nav-scroll]')]
function updateRail() {
  if (!rail) return
  const overflowing = rail.scrollWidth > rail.clientWidth + 2
  for (const arrow of arrows) {
    arrow.hidden = !overflowing
    arrow.disabled = arrow.dataset.navScroll === '-1' ? rail.scrollLeft < 2 : rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 2
  }
}
for (const arrow of arrows) arrow.addEventListener('click', () => rail.scrollBy({left:Number(arrow.dataset.navScroll) * rail.clientWidth * .7,behavior:'smooth'}))
rail?.addEventListener('scroll', updateRail)
window.addEventListener('resize', updateRail)
updateRail()
const menus = [...document.querySelectorAll('.gs-native-menu, .gs-account-menu')]
menus.forEach(menu => menu.addEventListener('toggle', () => { if(menu.open) menus.filter(other => other !== menu).forEach(other => {other.open = false}) }))
document.addEventListener('click', event => menus.forEach(menu => { if(!menu.contains(event.target)) menu.open = false }))
document.addEventListener('keydown', event => { if(event.key === 'Escape') menus.forEach(menu => {if(menu.open){menu.open = false;menu.querySelector('summary').focus()}}) })
// Each tabbed product row (Featured Products, Top Deals, ...) switches on its own.
for (const section of document.querySelectorAll('.gs-featured')) {
  const featuredTabs = [...section.querySelectorAll('[data-featured-tab]')]
  const panels = [...section.querySelectorAll('[role="tabpanel"]')]
  if (!featuredTabs.length) continue
  const chooseFeatured = (index, focus = false) => {
    featuredTabs.forEach((tab,i) => {tab.setAttribute('aria-selected', String(i===index));tab.tabIndex = i===index ? 0 : -1})
    panels.forEach((panel,i) => {panel.hidden = i !== index})
    if(focus) featuredTabs[index].focus()
  }
  featuredTabs.forEach((tab,i) => {
    tab.addEventListener('click', () => chooseFeatured(i))
    tab.addEventListener('keydown', event => {
      if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return
      event.preventDefault()
      chooseFeatured(event.key==='Home'?0:event.key==='End'?featuredTabs.length-1:(i+(event.key==='ArrowRight'?1:-1)+featuredTabs.length)%featuredTabs.length,true)
    })
  })
  section.classList.add('is-enhanced');chooseFeatured(0)
}
const filterToggle=document.querySelector('.gs-filter-toggle'), filterForm=document.querySelector('#gs-filter-form')
if(filterToggle){filterToggle.hidden=false;filterToggle.closest('aside').classList.add('is-enhanced');filterToggle.addEventListener('click',()=>{const expanded=filterToggle.getAttribute('aria-expanded')!=='true';filterToggle.setAttribute('aria-expanded',String(expanded));filterForm.classList.toggle('is-open',expanded)})}
const imageDialog = document.querySelector('.gs-gallery-dialog')
for(const button of document.querySelectorAll('[data-gallery-open]')) button.addEventListener('click',()=>imageDialog.showModal())
imageDialog?.addEventListener('click',event=>{if(event.target===imageDialog){const rect=imageDialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)imageDialog.close()}})

const gameThumbs = document.querySelector('.gs-game-pdp .pa-gallery-thumbnails')
const gameThumbScroll = document.querySelector('[data-gs-gallery-scroll]')
if (gameThumbs && gameThumbScroll) {
  const updateThumbScroll = () => {
    gameThumbScroll.hidden = gameThumbs.scrollHeight <= gameThumbs.clientHeight + 2
    const atEnd = gameThumbs.scrollTop + gameThumbs.clientHeight >= gameThumbs.scrollHeight - 2
    gameThumbScroll.textContent = atEnd ? '⌃' : '⌄'
    gameThumbScroll.setAttribute('aria-label', atEnd ? 'Previous thumbnails' : 'Next thumbnails')
  }
  gameThumbScroll.addEventListener('click', () => {
    const atEnd = gameThumbs.scrollTop + gameThumbs.clientHeight >= gameThumbs.scrollHeight - 2
    gameThumbs.scrollBy({ top: (atEnd ? -1 : 1) * gameThumbs.clientHeight * .8, behavior: 'smooth' })
  })
  gameThumbs.addEventListener('scroll', updateThumbScroll)
  window.addEventListener('resize', updateThumbScroll)
  updateThumbScroll()
}

const recommendationRail = document.querySelector('[data-gs-recommendations]')
const recommendationArrows = [...document.querySelectorAll('[data-gs-recommendation-scroll]')]
function updateRecommendationArrows() {
  if (!recommendationRail) return
  for (const button of recommendationArrows) button.disabled = button.dataset.gsRecommendationScroll === '-1'
    ? recommendationRail.scrollLeft < 2
    : recommendationRail.scrollLeft + recommendationRail.clientWidth >= recommendationRail.scrollWidth - 2
}
for (const button of recommendationArrows) button.addEventListener('click', () => recommendationRail.scrollBy({ left: Number(button.dataset.gsRecommendationScroll) * 232, behavior: 'smooth' }))
recommendationRail?.addEventListener('scroll', updateRecommendationArrows)
window.addEventListener('resize', updateRecommendationArrows)
updateRecommendationArrows()
const addedPanel = document.querySelector('.gs-game-added')
if (addedPanel) {
  const close = addedPanel.querySelector('.gs-modal-close')
  close.focus()
  addedPanel.parentElement.addEventListener('click', event => { if (event.target === addedPanel.parentElement) location.href = close.href })
  addedPanel.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); location.href = close.href }
    if (event.key !== 'Tab') return
    const focusable = [...addedPanel.querySelectorAll('a[href],button:not([disabled])')]
    if (event.shiftKey && document.activeElement === focusable[0]) { event.preventDefault(); focusable.at(-1).focus() }
    else if (!event.shiftKey && document.activeElement === focusable.at(-1)) { event.preventDefault(); focusable[0].focus() }
  })
}
