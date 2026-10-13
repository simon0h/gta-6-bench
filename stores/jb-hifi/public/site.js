// Progressive enhancements; every destination and purchase remains server-rendered.
const menus = [...document.querySelectorAll('.jb-nav-menu')];
menus.forEach(menu => menu.addEventListener('toggle', () => {
  if (menu.open) menus.forEach(other => { if (other !== menu) other.open = false; });
}));
document.addEventListener('click', event => {
  if (!event.target.closest('.jb-nav-menu')) menus.forEach(menu => { menu.open = false; });
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') menus.forEach(menu => { if (menu.open) { menu.open = false; menu.querySelector('summary').focus(); } });
});
const rail = document.querySelector('#department-rail');
document.querySelectorAll('[data-rail]').forEach(button => button.addEventListener('click', () => {
  rail?.scrollBy({left: Number(button.dataset.rail) * Math.max(250, rail.clientWidth * .7), behavior: 'smooth'});
}));
const hotTabs = [...document.querySelectorAll('[data-hot]')];
function selectHot(tab) {
  hotTabs.forEach(item => {
    const active = item === tab;
    item.setAttribute('aria-selected', String(active));
    item.tabIndex = active ? 0 : -1;
    document.getElementById(item.getAttribute('aria-controls')).hidden = !active;
  });
}
hotTabs.forEach((tab,index) => {
  tab.addEventListener('click', () => selectHot(tab));
  tab.addEventListener('keydown', event => {
    const next = event.key === 'ArrowRight' ? (index + 1) % hotTabs.length : event.key === 'ArrowLeft' ? (index + hotTabs.length - 1) % hotTabs.length : event.key === 'Home' ? 0 : event.key === 'End' ? hotTabs.length - 1 : null;
    if (next !== null) { event.preventDefault(); selectHot(hotTabs[next]); hotTabs[next].focus(); }
  });
});
const filters = document.querySelector('.jb-filter-drawer');
if (filters && window.matchMedia('(max-width: 800px)').matches) filters.open = false;
const gallery = document.querySelector('.jb-image-dialog');
document.querySelector('[data-gallery-open]')?.addEventListener('click', () => gallery.showModal());
document.querySelector('[data-gallery-close]')?.addEventListener('click', () => gallery.close());
gallery?.addEventListener('click', event => { if (event.target === gallery) { const r = gallery.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) gallery.close(); } });
// Mark the current account destination without changing the server ownership checks.
document.querySelectorAll('.jb-journey-nav a').forEach(link => {
  if (new URL(link.href).pathname === window.location.pathname) link.setAttribute('aria-current','page');
});

// The native added-item drawer keeps keyboard focus inside the active panel.
const addedDrawer = document.querySelector('.jb-reference-added');
if (addedDrawer) {
  for (const child of document.body.children) if (child !== addedDrawer) child.inert = true;
  const close = addedDrawer.querySelector('.jb-modal-close');
  close?.focus();
  addedDrawer.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); close?.click(); }
    if (event.key !== 'Tab') return;
    const focusable = [...addedDrawer.querySelectorAll('a[href],button:not(:disabled),input:not([type="hidden"]):not(:disabled),select:not(:disabled),textarea:not(:disabled)')].filter(el => el.getClientRects().length);
    const first = focusable[0], last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  });
}

// The observed collection-point checkout continues directly to payment.
const informationForm = document.getElementById('jb-information-form');
if (informationForm) {
  const continueButton = informationForm.querySelector('[data-information-continue]');
  informationForm.addEventListener('change', event => {
    if (event.target.name !== 'delivery_method' || !continueButton) return;
    const direct = event.target.value === 'pickup' || (event.target.value === 'collection_point' && informationForm.querySelector('input[name="point_id"]'));
    continueButton.textContent = direct ? 'Continue to payment' : 'Continue to shipping';
    const summary = document.querySelector('[data-information-summary]');
    if (summary) {
      const subtotal = Number(summary.dataset.subtotal);
      const collection = event.target.value === 'collection_point' && informationForm.querySelector('input[name="point_id"]');
      const fee = collection ? Number(summary.dataset.collectionPrice) : 0;
      const money = amount => new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(amount);
      summary.querySelector('[data-information-shipping]').textContent = collection ? money(fee) : event.target.value === 'pickup' ? 'Free' : 'Calculated at next step';
      const total = summary.querySelector('[data-information-total]');
      total.replaceChildren(Object.assign(document.createElement('small'), { textContent: 'AUD' }), document.createTextNode(' ' + money(subtotal + fee)));
      const gst = summary.querySelector('.jb-co-gst');
      gst.hidden = !collection;
      gst.textContent = 'Includes ' + money((subtotal + fee) / 11) + ' GST';
    }
  });
}

// Native recommendation rails show the observed six-card selection in a scrollable row.
document.querySelectorAll('.jb-reference-recommendations').forEach(section => {
  const rail = section.querySelector('[data-recommendation-rail]');
  const previous = section.querySelector('[data-recommendation-direction="-1"]');
  const next = section.querySelector('[data-recommendation-direction="1"]');
  const indicator = section.querySelector('.jb-rec-scroll-track > span');
  const sync = () => {
    const max = Math.max(0, rail.scrollWidth - rail.clientWidth);
    previous.disabled = rail.scrollLeft < 1;
    next.disabled = rail.scrollLeft >= max - 1;
    const visible = Math.min(1, rail.clientWidth / Math.max(1, rail.scrollWidth));
    indicator.style.width = `${visible * 100}%`;
    indicator.style.left = `${max ? rail.scrollLeft / max * (1 - visible) * 100 : 0}%`;
  };
  section.querySelectorAll('[data-recommendation-direction]').forEach(button => button.addEventListener('click', () => {
    const card = rail.querySelector('article');
    rail.scrollBy({ left: Number(button.dataset.recommendationDirection) * ((card?.getBoundingClientRect().width || 302) + 10), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }));
  rail.addEventListener('scroll', sync, { passive: true });
  new ResizeObserver(sync).observe(rail);
  sync();
});
// Homepage banner carousel: dots scroll the track (no page jump) and the banners advance every 7 seconds.
document.querySelectorAll('.jb-hero-carousel').forEach(carousel => {
  const track = carousel.querySelector('.jb-hero-track'), slides = [...track.children], dots = [...carousel.querySelectorAll('.jb-hero-dots a')];
  let paused = false;
  const current = () => Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
  const show = i => track.scrollTo({ left: slides[i].offsetLeft - track.offsetLeft, behavior: 'smooth' });
  dots.forEach((dot, i) => dot.addEventListener('click', event => { event.preventDefault(); paused = true; show(i); }));
  track.addEventListener('scroll', () => dots.forEach((dot, j) => dot.setAttribute('aria-current', String(current() === j))), { passive: true });
  carousel.addEventListener('mouseenter', () => { paused = true; });
  carousel.addEventListener('focusin', () => { paused = true; });
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) setInterval(() => { if (!paused && !document.hidden) show((current() + 1) % slides.length); }, 7000);
});
