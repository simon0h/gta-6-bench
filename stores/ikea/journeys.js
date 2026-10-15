import { inches } from './display.js'
import { randomBytes } from 'node:crypto'
import { esc, money, publicNotice } from '../../lib/html.js'
import { retailState, saveAddress, deleteAddress, ownedOrders, ownedOrder, orderStatus, requestOrderAction, createSupportCase } from '../../lib/retail-state.js'

const clean = (v, max = 240) => typeof v === 'string' ? v.trim().slice(0, max) : ''
const key = prefix => `${prefix}-${randomBytes(6).toString('hex')}`
const integer = v => typeof v === 'string' && /^\d+$/.test(v) ? Number(v) : NaN
const decimal = v => typeof v === 'string' && /^\d+(?:\.\d{1,3})?$/.test(v) ? Number(v) : NaN
const optionText = options => Object.values(options || {}).join(' · ')
const hidden = (name, value) => `<input type="hidden" name="${esc(name)}" value="${esc(value)}">`
const field = (name, label, value = '', type = 'text', extra = '') => `<label>${label}<input name="${name}" type="${type}" value="${esc(value)}" ${extra}></label>`
const notes = value => `<label>Notes<textarea name="notes" maxlength="1000">${esc(value || '')}</textarea></label>`
const errorBox = error => error ? `<div class="error" role="alert">${esc(Array.isArray(error) ? error.join(' ') : error)}</div>` : ''
const articles = [
  { id: 'delivery', title: 'Delivery and your order', topic: 'Orders', text: 'Standard delivery is free. Your checkout shows the complete total. New orders show as processing until a delivery date is booked.', link: '/orders', action: 'View your orders' },
  { id: 'returns', title: 'Cancellations and return requests', topic: 'Orders', text: 'You can cancel a processing order from its details page. A return request becomes available only for an order marked delivered. New purchases stay processing; we do not invent delivery progress. We’ll contact you to arrange collection and your refund.', link: '/orders', action: 'Manage an order' },
  { id: 'assembly', title: 'Assembly, hardware and spare parts', topic: 'Products', text: 'Read the assembly and care overview on your product page. Check the included booklet, count the components and allow space to unpack. Wall fixings must suit your wall. You can send us a product question below; online assembly appointments and replacement-part orders are currently unavailable.', link: '/help/contact?category=Assembly', action: 'Ask about assembly' },
  { id: 'materials', title: 'Materials, measurements and care', topic: 'Products', text: 'Product pages list the material, care guidance and measurements for your selected option. Measure doorways, stairs and the space around the furniture. The room planner compares rectangular footprints; it cannot check construction, safety clearances or exact access through a building.', link: '/services/planning', action: 'Plan your space' },
  { id: 'lists', title: 'Shopping lists and saved room projects', topic: 'Planning', text: 'Create a named list for each idea, choose product options and quantities, and review the current subtotal. Add a complete list to your bag after availability checks. Room projects save dimensions, a budget and furniture positions. Guest work stays with the guest; signing in opens that account’s own work.', link: '/lists', action: 'Your shopping lists' },
  { id: 'family', title: 'Your IKEA Family profile', topic: 'Account', text: 'Join IKEA Family to save your membership choice and interests. Lists, planning and receipts are available to every shopper.', link: '/account/family', action: 'Family preferences' },
]

export function ikeaJourneys(router, context) {
  const { render, products, productById, selectedProduct, artwork, stockLimit } = context
  const base = res => res.locals.base
  const state = req => { const s = retailState(req); s.ikeaLists ||= []; s.ikeaProjects ||= []; return s }
  const page = (req, res, title, content, error, status = 200) => render(req, res, title, `<div class="ik-journeys"><p class="breadcrumb"><a href="${base(res)}/">Home</a> / ${esc(title)}</p><nav class="ik-journey-nav" aria-label="Your home projects"><a href="${base(res)}/lists"${req.path.startsWith('/lists') || req.path === '/favorites' ? ' aria-current="page"' : ''}>Shopping lists</a><a href="${base(res)}/services/planning"${req.path.startsWith('/projects') || req.path === '/services/planning' ? ' aria-current="page"' : ''}>Room planner</a><a href="${base(res)}/account"${req.path.startsWith('/account') ? ' aria-current="page"' : ''}>Your account</a><a href="${base(res)}/orders"${req.path.startsWith('/order') ? ' aria-current="page"' : ''}>Orders</a><a href="${base(res)}/help"${req.path.startsWith('/help') ? ' aria-current="page"' : ''}>Help</a></nav><h1>${esc(title)}</h1>${errorBox(error)}${content}</div>`, status)
  const missing = (req, res) => page(req, res, 'Not found', '<p>This item is not available in your current account or browser session.</p>', '', 404)
  const accountOnly = (req, res, next) => req.store.user ? next() : res.redirect(`${base(res)}/account`)
  const myOrders = req => ownedOrders(req, 'ikea').filter(o => (o.meta.account_id || null) === (req.store.user?.id || null))
  const myOrder = (req, id) => { const o = ownedOrder(req, id, 'ikea'); return o && (o.meta.account_id || null) === (req.store.user?.id || null) ? o : null }
  const findList = (req, id) => state(req).ikeaLists.find(l => l.id === clean(id))
  const findProject = (req, id) => state(req).ikeaProjects.find(p => p.id === clean(id))
  function resolved(row) {
    const p = productById(row.pid)
    if (!p || Object.entries(p.options || {}).some(([label, options]) => !options.includes(row.options?.[label]))) return null
    const chosen = selectedProduct(p, row.options)
    return chosen && { ...chosen, dimensions: p.variants?.find(v => v.id === chosen.variantId)?.dimensions || p.dimensions }
  }
  const subtotal = rows => Math.round(rows.reduce((sum, row) => sum + (resolved(row)?.price || 0) * row.qty, 0) * 100) / 100
  const productLink = (b, row) => `${b}/product/${row.pid}?${esc(new URLSearchParams(Object.entries(row.options).map(([label, value]) => [`option_${label}`, value])).toString())}`
  function selection(input, planner = false) {
    const product = productById(input.product_id || input.id), options = {}, errors = []
    if (!product) return { errors: ['Choose a product from the catalog.'] }
    for (const [label, allowed] of Object.entries(product.options || {})) {
      const value = clean(input[`option_${label}`]); options[label] = value
      if (!allowed.includes(value)) errors.push(`Choose an available ${label.toLowerCase()}.`)
    }
    if (Object.keys(input).some(k => k.startsWith('option_') && !Object.hasOwn(product.options || {}, k.slice(7)))) errors.push('Choose only the options listed for this product.')
    const qty = planner ? 1 : integer(input.qty)
    if (!Number.isSafeInteger(qty) || qty < 1 || qty > 10) errors.push('Choose a whole quantity from 1 to 10.')
    const row = { id: key('item'), pid: product.id, options, qty }
    if (!errors.length && !resolved(row)) errors.push('Choose a valid combination of options.')
    if (planner && !['Furniture', 'Storage'].includes(product.category)) errors.push('Choose furniture or storage for the floor plan.')
    return { row, errors }
  }
  function addRowsToBag(req, rows) {
    if (!rows.length) return 'Add at least one item first.'
    const next = req.store.cart.map(row => ({ ...row, options: { ...row.options } }))
    for (const row of rows) {
      const product = productById(row.pid), chosen = resolved(row)
      if (!product || !chosen || !Number.isSafeInteger(row.qty) || row.qty < 1) return 'An item or option is no longer available. Your list has been kept.'
      const lineKey = product.id + ':' + Object.keys(product.options || {}).map(label => row.options[label]).join('|')
      const existing = next.find(item => item.pid === product.id && item.key === lineKey)
      const total = next.filter(item => item.pid === product.id).reduce((sum, item) => sum + item.qty, 0)
      if (row.qty + total > stockLimit(product) || row.qty + (existing?.qty || 0) > stockLimit(chosen)) return `${product.title}: the requested quantity is not available, including items already in your bag. Your list has been kept.`
      if (existing) existing.qty += row.qty
      else next.push({ pid: product.id, key: lineKey, options: { ...row.options }, qty: row.qty })
    }
    req.store.cart = next
    return null
  }
  function picker(b, action, values = {}, planner = false) {
    const p = productById(values.product_id || values.id)
    const available = planner ? products.filter(p => ['Furniture', 'Storage'].includes(p.category)) : products
    return `<section class="ik-panel"><h2>Add ${planner ? 'furniture' : 'a product'}</h2><form method="get" action="${action}"><label>Product<select name="product_id" required><option value="">Choose a product</option>${available.map(item => `<option value="${item.id}"${p?.id === item.id ? ' selected' : ''}>${esc(item.title)}</option>`).join('')}</select></label><button class="secondary">Choose product</button></form>${p ? `<form method="post" action="${action}">${hidden('product_id', p.id)}<h3>${esc(p.title)}</h3>${Object.entries(p.options || {}).map(([label, options]) => `<label>${esc(label)}<select name="option_${label}" required><option value="">Choose ${esc(label.toLowerCase())}</option>${options.map(value => `<option value="${esc(value)}"${values[`option_${label}`] === value ? ' selected' : ''}>${esc(value)}</option>`).join('')}</select></label>`).join('')}${planner ? '<p>Each placement represents one item. Add another placement for a second piece.</p>' : field('qty', 'Quantity', clean(values.qty) || '1', 'number', 'min="1" max="10" required')}<button>Add to ${planner ? 'project' : 'list'}</button><p><a href="${b}/product/${p.id}">Product details and measurements →</a></p></form>` : ''}</section>`
  }
  router.use((req, res, next) => {
    // The inherited array has no ownership marker. Adopt it only into the guest
    // bucket, once, and thereafter mirror the active owner's validated saves.
    if (!req.store.ikeaLegacyFavorites) req.store.ikeaLegacyFavorites = { ids: (req.store.favorites || []).filter(id => productById(id)) }
    const s = state(req)
    if (!req.store.user && !req.store.ikeaLegacyFavorites.adopted) {
      s.favorites = [...new Set([...s.favorites, ...req.store.ikeaLegacyFavorites.ids])]
      req.store.ikeaLegacyFavorites.adopted = true
    }
    req.store.favorites = s.favorites
    if (req.store.user && s.ikeaProfile) Object.assign(req.store.user, s.ikeaProfile)
    next()
  })
  router.post('/favorites', (req, res) => {
    const p = productById(req.body.id)
    if (!p) return missing(req, res)
    const s = state(req)
    s.favorites = s.favorites.includes(p.id) ? s.favorites.filter(id => id !== p.id) : [...s.favorites, p.id].slice(-100)
    req.store.favorites = s.favorites
    const options = new URLSearchParams(Object.entries(p.options || {}).flatMap(([label, choices]) => choices.includes(req.body[`option_${label}`]) ? [[`option_${label}`, req.body[`option_${label}`]]] : []))
    res.redirect(`${base(res)}/product/${p.id}${options.size ? `?${options}` : ''}`)
  })
  router.get('/favorites', (req, res) => {
    const b = base(res)
    page(req, res, 'Saved products', `<p>Keep inspiration here, then choose options and quantities in a shopping list.</p><a class="button" href="${b}/lists">Open your shopping lists</a><div class="ik-saved-grid">${state(req).favorites.map(productById).filter(Boolean).map(p => `<article>${artwork(p)}<h2><a href="${b}/product/${p.id}">${esc(p.title)}</a></h2><a href="${b}/lists/add?product_id=${p.id}">Choose options and save to a list →</a><form method="post" action="${b}/favorites">${hidden('id', p.id)}<button class="secondary">Remove saved product</button></form></article>`).join('') || '<p>No saved products yet. Use the heart on a product to save it.</p>'}</div>`)
  })
  function listsPage(req, res, error, values = {}, status = 200) {
    const b = base(res), lists = state(req).ikeaLists
    page(req, res, 'Your shopping lists', `<p>A place for every home idea. Lists are private to this browser and the current ${req.store.user ? 'account' : 'guest'}. Prices update from the catalog.</p><div class="ik-split"><section>${lists.map(l => `<article class="ik-panel" data-list-id="${l.id}"><h2><a href="${b}/lists/${l.id}">${esc(l.name)}</a></h2><p>${l.rows.length} selections · ${money(subtotal(l.rows))}</p><p>${esc(l.notes)}</p></article>`).join('') || '<p>Create your first list to get started.</p>'}<a href="${b}/favorites">See saved products</a></section><form class="ik-panel" action="${b}/lists" method="post"><h2>Create a list</h2>${field('name', 'List name', values.name, 'text', 'maxlength="80" required')}${notes(values.notes)}<button>Create list</button></form></div>`, error, status)
  }
  router.get('/lists', (req, res) => listsPage(req, res))
  router.post('/lists', (req, res) => {
    const s = state(req), name = clean(req.body.name, 80)
    if (!name || s.ikeaLists.length >= 20) return listsPage(req, res, 'Enter a list name. You can keep up to 20 lists.', req.body, 400)
    const list = { id: key('list'), name, notes: clean(req.body.notes, 1000), rows: [] }; s.ikeaLists.push(list)
    res.redirect(`${base(res)}/lists/${list.id}`)
  })
  function saveToListPage(req, res, values = req.query, error, status = 200) {
    const b = base(res), p = productById(values.product_id || values.id)
    if (!p) return missing(req, res)
    const query = new URLSearchParams(Object.entries(values).filter(([k, v]) => typeof v === 'string' && (k.startsWith('option_') || k === 'qty')))
    query.set('product_id', p.id)
    page(req, res, `Save ${p.title}`, `<p>Choose an existing list, or create one with this product’s selected options.</p>${state(req).ikeaLists.map(l => `<p><a class="button secondary" href="${b}/lists/${l.id}/add?${esc(query.toString())}">${esc(l.name)}</a></p>`).join('')}<form class="ik-panel ik-form" action="${b}/lists/add" method="post"><h2>Create a list and save this product</h2>${hidden('product_id', p.id)}${field('name', 'List name', clean(values.name, 80), 'text', 'maxlength="80" required')}${notes(clean(values.notes, 1000))}${Object.entries(p.options || {}).map(([label, options]) => `<label>${esc(label)}<select name="option_${label}" required><option value="">Choose ${esc(label.toLowerCase())}</option>${options.map(value => `<option value="${esc(value)}"${values[`option_${label}`] === value ? ' selected' : ''}>${esc(value)}</option>`).join('')}</select></label>`).join('')}${field('qty', 'Quantity', clean(values.qty) || '1', 'number', 'min="1" max="10" required')}<button>Create list and save product</button><p>Availability is checked when you add the list to your bag.</p></form><a href="${b}/lists">Manage your lists</a>`, error, status)
  }
  router.get('/lists/add', (req, res) => saveToListPage(req, res))
  router.post('/lists/add', (req, res) => {
    const s = state(req), name = clean(req.body.name, 80), { row, errors } = selection(req.body)
    if (!name || s.ikeaLists.length >= 20) errors.push('Enter a list name. You can keep up to 20 lists.')
    if (errors.length) return saveToListPage(req, res, req.body, errors, 400)
    const list = { id: key('list'), name, notes: clean(req.body.notes, 1000), rows: [row] }
    s.ikeaLists.push(list)
    res.redirect(`${base(res)}/lists/${list.id}`)
  })
  function listPage(req, res, list, error, status = 200, draft = {}) {
    const b = base(res), root = `${b}/lists/${list.id}`
    page(req, res, list.name, `<div class="ik-split"><section><p>${esc(list.notes)}</p>${list.rows.map(row => {
      const p = resolved(row)
      return `<article class="ik-list-row" data-row-id="${row.id}">${p ? artwork(p) : ''}<div><h2>${p ? `<a href="${productLink(b, row)}">${esc(p.title)}</a>` : 'Product unavailable'}</h2><p>${esc(optionText(row.options))}</p><p>${p ? `${money(p.price)} each · ${stockLimit(p) ? `${stockLimit(p)} available` : 'Out of stock'}` : 'Choose a different product'}</p><form action="${root}/items/${row.id}" method="post">${field('qty', 'Quantity', draft.row === row.id ? clean(draft.qty) : row.qty, 'number', 'min="1" max="10" required')}<button name="action" value="update" class="secondary">Update quantity</button><button name="action" value="remove" class="secondary" formnovalidate>Remove item</button></form></div><strong>${money((p?.price || 0) * row.qty)}</strong></article>`
    }).join('') || '<p>Your list is ready for ideas. Add your first product.</p>'}<a class="button secondary" href="${root}/add">Add a product</a></section><aside><section class="ik-panel"><h2>List subtotal</h2><p class="price" data-list-total="${subtotal(list.rows)}">${money(subtotal(list.rows))}</p><p>Standard delivery $0. Tax $0. Availability is checked again before adding to your bag.</p><form action="${root}/bag" method="post"><button name="action" value="add">Add all to bag</button><button class="secondary" name="action" value="move">Move all to bag and clear list</button></form></section><form class="ik-panel" action="${root}" method="post"><h2>Edit list</h2>${field('name', 'List name', list.name, 'text', 'maxlength="80" required')}${notes(list.notes)}<button>Save list details</button></form><form action="${root}/delete" method="post"><button class="secondary">Delete list</button></form></aside></div>`, error, status)
  }
  router.get('/lists/:id', (req, res) => { const l = findList(req, req.params.id); return l ? listPage(req, res, l) : missing(req, res) })
  router.post('/lists/:id', (req, res) => {
    const l = findList(req, req.params.id); if (!l) return missing(req, res)
    const name = clean(req.body.name, 80)
    if (!name) return listPage(req, res, { ...l, name: clean(req.body.name), notes: clean(req.body.notes, 1000) }, 'Enter a list name.', 400)
    l.name = name; l.notes = clean(req.body.notes, 1000); res.redirect(`${base(res)}/lists/${l.id}`)
  })
  router.post('/lists/:id/delete', (req, res) => { const l = findList(req, req.params.id); if (!l) return missing(req, res); state(req).ikeaLists = state(req).ikeaLists.filter(i => i !== l); res.redirect(`${base(res)}/lists`) })
  const listAddPage = (req, res, l, error, values = req.query, status = 200) => page(req, res, `Add to ${l.name}`, picker(base(res), `${base(res)}/lists/${l.id}/add`, values), error, status)
  router.get('/lists/:id/add', (req, res) => { const l = findList(req, req.params.id); return l ? listAddPage(req, res, l) : missing(req, res) })
  router.post('/lists/:id/add', (req, res) => {
    const l = findList(req, req.params.id); if (!l) return missing(req, res)
    const { row, errors } = selection(req.body)
    if (l.rows.length >= 60) errors.push('A list can hold up to 60 selections.')
    if (errors.length) return listAddPage(req, res, l, errors, req.body, 400)
    l.rows.push(row); res.redirect(`${base(res)}/lists/${l.id}`)
  })
  router.post('/lists/:id/items/:row', (req, res) => {
    const l = findList(req, req.params.id), row = l?.rows.find(i => i.id === req.params.row)
    if (!row) return missing(req, res)
    if (req.body.action === 'remove') l.rows = l.rows.filter(i => i !== row)
    else if (req.body.action === 'update' && Number.isSafeInteger(integer(req.body.qty)) && integer(req.body.qty) >= 1 && integer(req.body.qty) <= 10) row.qty = integer(req.body.qty)
    else return listPage(req, res, l, 'Choose an item action and a whole quantity from 1 to 10.', 400, { row: row.id, qty: req.body.qty })
    res.redirect(`${base(res)}/lists/${l.id}`)
  })
  router.post('/lists/:id/bag', (req, res) => {
    const l = findList(req, req.params.id); if (!l) return missing(req, res)
    if (!['add', 'move'].includes(req.body.action)) return listPage(req, res, l, 'Choose how to add your list.', 400)
    const error = addRowsToBag(req, l.rows)
    if (error) return listPage(req, res, l, error, 400)
    if (req.body.action === 'move') l.rows = []
    res.redirect(`${base(res)}/cart`)
  })

  function projectForm(action, p = {}) {
    return `<form action="${action}" method="post">${field('name', 'Project name', p.name, 'text', 'maxlength="80" required')}<div class="ik-form-grid">${field('width', 'Room width (in)', p.width ?? 120, 'number', 'min="24" max="1200" step="0.001" required')}${field('depth', 'Room depth (in)', p.depth ?? 144, 'number', 'min="24" max="1200" step="0.001" required')}${field('budget', 'Furniture budget ($)', p.budget ?? 500, 'number', 'min="0" max="100000" step="0.01" required')}</div>${notes(p.notes)}<button>Save project</button></form>`
  }
  function projectInput(input) {
    const values = { name: clean(input.name, 80), width: decimal(input.width), depth: decimal(input.depth), budget: decimal(input.budget), notes: clean(input.notes, 1000) }
    const error = !values.name || !Number.isFinite(values.width) || values.width < 24 || values.width > 1200 || !Number.isFinite(values.depth) || values.depth < 24 || values.depth > 1200 || !Number.isFinite(values.budget) || values.budget < 0 || values.budget > 100000
    return { values, error: error ? 'Enter a project name, room sides from 24 to 1200 inches, and a budget from $0 to $100,000.' : null }
  }
  function planningHome(req, res, error, values, status = 200) {
    const b = base(res)
    page(req, res, 'Plan your space', `<p class="ik-lead">Give your ideas a little room. Compare furniture footprints and keep an eye on your budget.</p><p>This simple top-down planner uses rectangular measurements in inches. Measure doorways and allow extra space for movement, open doors and drawers. It does not check those clearances, wall fixings or kitchen engineering, and offers no 3D scan or service booking.</p><div class="ik-split"><section><h2>Your saved projects</h2>${state(req).ikeaProjects.map(p => `<article class="ik-panel" data-project-id="${p.id}"><h3><a href="${b}/projects/${p.id}">${esc(p.name)}</a></h3><p>${inches(p.width)} × ${inches(p.depth)} in · ${p.rows.length} pieces · ${money(subtotal(p.rows))}</p></article>`).join('') || '<p>Start your first room below. Your project is saved to your account.</p>'}</section><section class="ik-panel"><h2>Start a room project</h2>${projectForm(`${b}/projects`, values)}</section></div>`, error, status)
  }
  router.get('/services/planning', (req, res) => planningHome(req, res))
  router.get('/projects', (req, res) => res.redirect(`${base(res)}/services/planning`))
  router.post('/projects', (req, res) => {
    const { values, error } = projectInput(req.body), s = state(req)
    if (error || s.ikeaProjects.length >= 20) return planningHome(req, res, error || 'You can save up to 20 projects.', req.body, 400)
    const p = { ...values, id: key('project'), rows: [] }; s.ikeaProjects.push(p); res.redirect(`${base(res)}/projects/${p.id}`)
  })
  function footprints(project) {
    return project.rows.map(row => { const p = resolved(row), d = p?.dimensions || {}; return { row, product: p, width: row.rotation === 90 ? d.depth : d.width, depth: row.rotation === 90 ? d.width : d.depth } })
  }
  function projectPage(req, res, p, error, status = 200, draft = {}) {
    const b = base(res), root = `${b}/projects/${p.id}`, shapes = footprints(p), total = subtotal(p.rows)
    const issues = shapes.flatMap((a, i) => {
      const out = !a.width || a.row.x + a.width > p.width || a.row.y + a.depth > p.depth
      const overlap = shapes.slice(0, i).some(c => a.row.x < c.row.x + c.width && a.row.x + a.width > c.row.x && a.row.y < c.row.y + c.depth && a.row.y + a.depth > c.row.y)
      return [...(out ? [`${a.product?.title || 'An item'} extends outside the room.`] : []), ...(overlap ? [`${a.product?.title} overlaps another footprint.`] : [])]
    })
    page(req, res, p.name, `<p>${esc(p.notes)}</p><div class="ik-split"><section><div class="ik-plan" data-room-width="${p.width}" data-room-depth="${p.depth}"><svg viewBox="0 0 ${p.width} ${p.depth}" role="img" aria-label="Room plan ${p.width} by ${p.depth} inches"><rect width="${p.width}" height="${p.depth}" fill="#fafafa" stroke="#111" stroke-width="1"/>${shapes.map((s, i) => `<g><title>${esc(s.product?.title)}: ${s.width} by ${s.depth} inches</title><rect x="${s.row.x}" y="${s.row.y}" width="${s.width}" height="${s.depth}" fill="${i % 2 ? '#a7c9e8' : '#f9df6e'}" stroke="#333" stroke-width=".5"/><text x="${s.row.x + 2}" y="${s.row.y + 6}" font-size="5">${i + 1}</text></g>`).join('')}</svg></div><p>Room: ${inches(p.width)} × ${inches(p.depth)} in. Positions are measured from the top-left corner.</p>${issues.length ? `<div class="ik-fit-warning" role="status"><strong>Check your layout</strong><ul>${issues.map(i => `<li>${esc(i)}</li>`).join('')}</ul></div>` : '<p>All current footprints fit inside the room without overlaps. Check real-world clearances before buying.</p>'}<h2>Your furniture</h2>${shapes.map((s, i) => `<article class="ik-panel" data-project-row="${s.row.id}" data-footprint-width="${s.width}" data-footprint-depth="${s.depth}"><h3>${i + 1}. <a href="${productLink(b, s.row)}">${esc(s.product?.title)}</a></h3><p>${esc(optionText(s.row.options))} · ${inches(s.width)} × ${inches(s.depth)} in footprint · ${money(s.product?.price || 0)}</p><p>${esc(s.product?.material)} · ${esc(s.product?.assembly)}</p><form action="${root}/items/${s.row.id}" method="post"><div class="ik-form-grid">${field('x', 'From left (in)', draft.row === s.row.id ? clean(draft.x) : s.row.x, 'number', 'min="0" max="1200" step="0.001" required')}${field('y', 'From top (in)', draft.row === s.row.id ? clean(draft.y) : s.row.y, 'number', 'min="0" max="1200" step="0.001" required')}<label>Rotation<select name="rotation"><option value="0"${s.row.rotation === 0 ? ' selected' : ''}>0°</option><option value="90"${s.row.rotation === 90 ? ' selected' : ''}>90°</option></select></label></div><button name="action" value="update" class="secondary">Update position</button><button name="action" value="remove" class="secondary" formnovalidate>Remove furniture</button></form></article>`).join('')}<a class="button" href="${root}/add">Add furniture</a></section><aside><section class="ik-panel"><h2>Your budget</h2><p class="price" data-project-total="${total}">${money(total)}</p><p>Budget ${money(p.budget)} · ${total > p.budget ? `${money(total - p.budget)} over budget` : `${money(p.budget - total)} remaining`}</p><p>Standard delivery $0. Tax $0.</p><form action="${root}/list" method="post"><label>Shopping list<select name="list_id"><option value="new">Create a list for this project</option>${state(req).ikeaLists.map(l => `<option value="${l.id}">${esc(l.name)}</option>`).join('')}</select></label><button>Copy furniture to list</button></form></section><section class="ik-panel"><h2>Room details</h2>${projectForm(root, p)}</section><form action="${root}/delete" method="post"><button class="secondary">Delete project</button></form></aside></div>`, error, status)
  }
  router.get('/projects/:id', (req, res) => { const p = findProject(req, req.params.id); return p ? projectPage(req, res, p) : missing(req, res) })
  router.post('/projects/:id', (req, res) => {
    const p = findProject(req, req.params.id); if (!p) return missing(req, res)
    const { values, error } = projectInput(req.body)
    if (error) return page(req, res, 'Edit room details', projectForm(`${base(res)}/projects/${p.id}`, req.body), error, 400)
    Object.assign(p, values); res.redirect(`${base(res)}/projects/${p.id}`)
  })
  router.post('/projects/:id/delete', (req, res) => { const p = findProject(req, req.params.id); if (!p) return missing(req, res); state(req).ikeaProjects = state(req).ikeaProjects.filter(i => i !== p); res.redirect(`${base(res)}/projects`) })
  const projectAddPage = (req, res, p, error, values = req.query, status = 200) => page(req, res, `Furniture for ${p.name}`, picker(base(res), `${base(res)}/projects/${p.id}/add`, values, true), error, status)
  router.get('/projects/:id/add', (req, res) => { const p = findProject(req, req.params.id); return p ? projectAddPage(req, res, p) : missing(req, res) })
  router.post('/projects/:id/add', (req, res) => {
    const p = findProject(req, req.params.id); if (!p) return missing(req, res)
    const { row, errors } = selection(req.body, true)
    if (p.rows.length >= 30) errors.push('A project can hold up to 30 furniture placements.')
    if (errors.length) return projectAddPage(req, res, p, errors, req.body, 400)
    p.rows.push({ ...row, x: 0, y: 0, rotation: 0 }); res.redirect(`${base(res)}/projects/${p.id}`)
  })
  router.post('/projects/:id/items/:row', (req, res) => {
    const p = findProject(req, req.params.id), row = p?.rows.find(i => i.id === req.params.row)
    if (!row) return missing(req, res)
    if (req.body.action === 'remove') p.rows = p.rows.filter(i => i !== row)
    else {
      const x = decimal(req.body.x), y = decimal(req.body.y)
      if (req.body.action !== 'update' || !Number.isFinite(x) || !Number.isFinite(y) || x > 1200 || y > 1200 || !['0', '90'].includes(req.body.rotation)) return projectPage(req, res, p, 'Choose positions from 0 to 1200 inches and a rotation of 0° or 90°.', 400, { row: row.id, x: req.body.x, y: req.body.y })
      Object.assign(row, { x, y, rotation: Number(req.body.rotation) })
    }
    res.redirect(`${base(res)}/projects/${p.id}`)
  })
  router.post('/projects/:id/list', (req, res) => {
    const p = findProject(req, req.params.id), s = state(req); if (!p) return missing(req, res)
    let l = req.body.list_id === 'new' ? { id: key('list'), name: p.name, notes: p.notes, rows: [] } : findList(req, req.body.list_id)
    if (!l) return missing(req, res)
    if (!p.rows.length || p.rows.some(row => !resolved(row)) || l.rows.length + p.rows.length > 60 || (req.body.list_id === 'new' && s.ikeaLists.length >= 20)) return projectPage(req, res, p, 'Add valid furniture first, and keep each list within 60 selections and your collection within 20 lists.', 400)
    l.rows.push(...p.rows.map(row => ({ id: key('item'), pid: row.pid, options: { ...row.options }, qty: 1 })))
    if (req.body.list_id === 'new') s.ikeaLists.push(l)
    res.redirect(`${base(res)}/lists/${l.id}`)
  })

  router.get('/account', (req, res, next) => {
    if (!req.store.user) return next()
    const b = base(res), s = state(req)
    page(req, res, `Hej, ${req.store.user.first_name}`, `<p>${esc(req.store.user.email)}</p><section class="ik-account-welcome"><div><p class="eyebrow">Your home, your ideas</p><h2>A little inspiration goes a long way.</h2><p>Bring your saved products, room projects and everyday plans together.</p></div><a class="button" href="${b}/services/planning">Plan your next room</a></section><div class="ik-account-grid">${[['profile', 'Your profile', 'Name, phone and home interests'], ['family', 'IKEA Family', s.ikeaFamily?.joined ? 'Your local membership is active' : 'Choose your membership preferences'], ['addresses', 'Address book', `${s.addresses.length} saved addresses`]].map(([id, title, detail]) => `<a class="ik-panel" href="${b}/account/${id}"><h2>${title}</h2><p>${esc(detail)}</p></a>`).join('')}<a class="ik-panel" href="${b}/orders"><h2>Your orders</h2><p>${myOrders(req).length} orders</p></a><a class="ik-panel" href="${b}/lists"><h2>Shopping lists</h2><p>${s.ikeaLists.length} home ideas</p></a><a class="ik-panel" href="${b}/help/cases"><h2>Your help requests</h2><p>${s.cases.length} saved requests</p></a></div><form action="${b}/logout" method="post"><button class="secondary">Sign out</button></form>`)
  })
  function profilePage(req, res, error, values, status = 200) {
    const s = state(req), v = values || { ...req.store.user, ...s.preferences }
    page(req, res, 'Your profile', `<form class="ik-panel ik-form" action="${base(res)}/account/profile" method="post">${field('first_name', 'First name', v.first_name, 'text', 'maxlength="80" required')}${field('last_name', 'Last name', v.last_name, 'text', 'maxlength="80" required')}${field('phone', 'Phone (optional)', v.phone, 'tel')}<p>Account email: ${esc(req.store.user.email)}</p><label>Your next room project<select name="room"><option value="">Choose an interest</option>${['Living room', 'Bedroom', 'Home office', 'Kitchen', 'Bathroom', 'Children’s room'].map(room => `<option${v.room === room ? ' selected' : ''}>${room}</option>`).join('')}</select></label><label>Contact preference<select name="contact"><option value="none"${v.contact !== 'email' ? ' selected' : ''}>No updates</option><option value="email"${v.contact === 'email' ? ' selected' : ''}>Email ideas</option></select></label><p>This saves your preference here; no email subscription is sent.</p><button>Save profile</button></form>`, error, status)
  }
  router.get('/account/profile', accountOnly, (req, res) => profilePage(req, res))
  router.post('/account/profile', accountOnly, (req, res) => {
    const first_name = clean(req.body.first_name, 80), last_name = clean(req.body.last_name, 80), phone = clean(req.body.phone, 25), room = clean(req.body.room), contact = clean(req.body.contact)
    if (!first_name || !last_name || (phone && !/^[+\d\s().-]{7,25}$/.test(phone)) || !['', 'Living room', 'Bedroom', 'Home office', 'Kitchen', 'Bathroom', 'Children’s room'].includes(room) || !['none', 'email'].includes(contact)) return profilePage(req, res, 'Enter your name, a valid optional phone number and listed preferences.', req.body, 400)
    const s = state(req); s.ikeaProfile = { first_name, last_name, phone }; Object.assign(req.store.user, s.ikeaProfile); Object.assign(s.preferences, { room, contact })
    res.redirect(`${base(res)}/account`)
  })
  function familyPage(req, res, error, status = 200) {
    const s = state(req)
    page(req, res, 'IKEA Family', `<section class="ik-family"><p class="eyebrow">A little more at home</p><h2>${s.ikeaFamily?.joined ? 'Your IKEA Family membership is active' : 'Join IKEA Family today'}</h2><p>Save a membership choice alongside your home interests. Membership is free.</p><p>Shopping lists, room planning and receipts are available to every shopper.</p><form action="${base(res)}/account/family" method="post">${s.ikeaFamily?.joined ? '<button name="action" value="leave" class="secondary">Leave IKEA Family</button>' : '<label><input type="checkbox" name="consent" value="yes" required> I would like to join IKEA Family.</label><button name="action" value="join">Join IKEA Family</button>'}</form><p><a href="${base(res)}/account/profile">Update your interests and preferences →</a></p></section>`, error, status)
  }
  router.get('/account/family', accountOnly, (req, res) => familyPage(req, res))
  router.post('/account/family', accountOnly, (req, res) => {
    if (!['join', 'leave'].includes(req.body.action) || (req.body.action === 'join' && req.body.consent !== 'yes')) return familyPage(req, res, 'Choose a membership action and confirm your choice to join.', 400)
    state(req).ikeaFamily = { joined: req.body.action === 'join' }; res.redirect(`${base(res)}/account/family`)
  })
  function addressesPage(req, res, error, values = {}, status = 200) {
    const b = base(res)
    page(req, res, 'Your address book', `<div class="ik-split"><section>${state(req).addresses.map(a => `<article class="ik-panel" data-address-id="${a.id}"><h2>${esc(a.label || a.name)} ${a.is_default ? '· Default' : ''}</h2><p>${esc(a.name)}<br>${esc(a.line1)} ${esc(a.line2)}<br>${esc(a.city)}, ${esc(a.state)} ${esc(a.postal_code)}</p><p>${esc(a.phone)}</p><a href="${b}/account/addresses?edit=${a.id}">Edit address</a><form action="${b}/account/addresses/${a.id}/default" method="post"><button class="secondary">Use as default</button></form><form action="${b}/account/addresses/${a.id}/delete" method="post"><button class="secondary">Delete address</button></form></article>`).join('') || '<p>No addresses saved yet.</p>'}<p>Choose an address from your address book at checkout. You can edit the delivery details before placing an order.</p></section><form class="ik-panel" action="${b}/account/addresses" method="post"><h2>${values.id ? 'Edit address' : 'Add an address'}</h2>${values.id ? hidden('id', values.id) : ''}${[['label', 'Address label', false], ['name', 'Recipient name', true], ['phone', 'Phone (optional)', false], ['line1', 'Street address', true], ['line2', 'Apartment or suite (optional)', false], ['city', 'City', true], ['state', 'State (two letters)', true], ['postal_code', 'ZIP code', true]].map(([name, label, required]) => field(name, label, values[name], name === 'phone' ? 'tel' : 'text', required ? 'required' : '')).join('')}<label><input type="checkbox" name="is_default" value="yes"${values.is_default ? ' checked' : ''}> Use as default address</label><button>Save address</button></form></div>`, error, status)
  }
  router.get('/account/addresses', accountOnly, (req, res) => {
    const a = req.query.edit ? state(req).addresses.find(a => a.id === clean(req.query.edit)) : {}
    return a ? addressesPage(req, res, '', a) : missing(req, res)
  })
  router.post('/account/addresses', accountOnly, (req, res) => {
    if (!/^[A-Z]{2}$/i.test(clean(req.body.state))) return addressesPage(req, res, 'Use a two-letter state code.', req.body, 400)
    const result = saveAddress(req, req.body, { country: 'US' })
    if (result.errors) return addressesPage(req, res, result.errors, { ...result.values, id: clean(req.body.id) }, 400)
    res.redirect(`${base(res)}/account/addresses`)
  })
  router.post('/account/addresses/:id/default', accountOnly, (req, res) => {
    const s = state(req), a = s.addresses.find(a => a.id === req.params.id)
    if (!a) return missing(req, res)
    s.addresses.forEach(a => { a.is_default = a.id === req.params.id }); res.redirect(`${base(res)}/account/addresses`)
  })
  router.post('/account/addresses/:id/delete', accountOnly, (req, res) => {
    if (!deleteAddress(req, req.params.id)) return missing(req, res)
    res.redirect(`${base(res)}/account/addresses`)
  })

  const statusText = o => ({ processing: 'Processing', cancelled: 'Cancelled', delivered: 'Delivered', return_requested: 'Return requested' })[orderStatus(o)] || 'Processing'
  router.get('/orders', (req, res) => {
    const b = base(res)
    page(req, res, 'Your orders', `<p>Sign in to the account used to place an order to see it here.</p>${myOrders(req).slice().reverse().map(o => `<article class="ik-panel"><h2><a href="${b}/order/${o.id}">${esc(o.order_number)}</a></h2><p>${esc(statusText(o))} · ${money(o.totals.total)} · ${esc(o.created_at.slice(0, 10))}</p><p>${o.items.map(i => `${esc(i.title)} × ${i.qty}`).join(' · ')}</p></article>`).join('') || '<p>No orders here yet. Your confirmed purchases will appear here.</p>'}`)
  })
  function orderPage(req, res, order, error, status = 200, receipt = false) {
    const b = base(res), lifecycle = orderStatus(order)
    page(req, res, receipt ? `Receipt ${order.order_number}` : `Order ${order.order_number}`, `<p class="eyebrow">Order confirmed</p><section class="ik-panel"><h2>${esc(statusText(order))}</h2><p>${lifecycle === 'processing' ? `Thank you for your order. We’ll let you know when a delivery date has been booked.${publicNotice(' This is not the real IKEA website: no real order is placed and nothing will be delivered.')}` : lifecycle === 'cancelled' ? 'This order has been cancelled. No delivery is scheduled.' : lifecycle === 'return_requested' ? 'Your return request has been received. We’ll contact you to arrange collection and your refund.' : 'This order has been delivered.'}</p><p>Placed ${esc(order.created_at)} · ${esc(order.customer.email)}</p></section><div class="ik-split"><section><h2>Your items</h2>${order.items.map((i, index) => `<article class="ik-receipt-row"><h3>${esc(i.title)}</h3><p>${esc(optionText(order.meta.options?.[index]?.options))} · ${i.qty} × ${money(i.unit_price)}</p><strong>${money(i.qty * i.unit_price)}</strong></article>`).join('')}<h2>Delivery address</h2><p>${esc(order.customer.first_name)} ${esc(order.customer.last_name)}<br>${esc(order.shipping_address.line1)}<br>${esc(order.shipping_address.city)}, ${esc(order.shipping_address.state)} ${esc(order.shipping_address.postal_code)}</p></section><aside class="ik-panel"><h2>Payment summary</h2><p>Items ${money(order.totals.subtotal)}</p><p>Standard delivery ${money(order.totals.shipping)}</p><p>Tax ${money(order.totals.tax)}</p><p class="price">Total ${money(order.totals.total)}</p><p>${esc(order.payment.brand)} ending in ${esc(order.payment.last4)}</p>${receipt ? `<a href="${b}/order/${order.id}">Back to order details</a>` : `<a href="${b}/order/${order.id}/receipt">View receipt</a>`}</aside></div>${!receipt ? `<section class="ik-panel"><h2>Manage your order</h2>${['processing', 'delivered'].includes(lifecycle) ? `<form action="${b}/order/${order.id}/action" method="post">${field('reason', 'Reason for request', clean(req.body?.reason, 1000), 'text', 'maxlength="1000" required')}<button name="action" value="${lifecycle === 'processing' ? 'cancel' : 'return'}">${lifecycle === 'processing' ? 'Cancel order' : 'Request a return'}</button></form>` : '<p>No further order action is available for this status.</p>'}${lifecycle === 'processing' ? '<p>A return request becomes available only after delivery.</p>' : ''}<a href="${b}/help/contact?order_id=${order.id}&category=Orders">Get help with this order</a></section>` : ''}${order.meta.lifecycle?.length ? `<h2>Order activity</h2><ul>${order.meta.lifecycle.map(e => `<li>${esc(e.status.replaceAll('_', ' '))}: ${esc(e.reason)}</li>`).join('')}</ul>` : ''}`, error, status)
  }
  router.get('/order/:id', (req, res) => { const o = myOrder(req, req.params.id); return o ? orderPage(req, res, o) : missing(req, res) })
  router.get('/order/:id/receipt', (req, res) => { const o = myOrder(req, req.params.id); return o ? orderPage(req, res, o, '', 200, true) : missing(req, res) })
  router.post('/order/:id/action', (req, res) => {
    const o = myOrder(req, req.params.id); if (!o) return missing(req, res)
    const result = requestOrderAction(req, o.id, req.body.action, req.body.reason, 'ikea')
    if (result.error) return orderPage(req, res, o, result.error, result.status)
    res.redirect(`${base(res)}/order/${o.id}`)
  })

  router.get('/help', (req, res) => {
    const q = clean(req.query.q).toLowerCase(), results = articles.filter(a => `${a.title} ${a.topic} ${a.text}`.toLowerCase().includes(q)), b = base(res)
    page(req, res, 'How can we help?', `<form class="ik-help-search" action="${b}/help" method="get">${field('q', 'Search help', clean(req.query.q), 'search')}<button>Search help</button></form><p>${results.length} helpful articles</p><div class="ik-account-grid">${results.map(a => `<a class="ik-panel" id="${a.id}" href="${b}/help/articles/${a.id}"><p>${a.topic}</p><h2>${a.title}</h2></a>`).join('') || '<p>No matching help articles. Try “delivery”, “assembly” or “lists”.</p>'}</div><p><a class="button" href="${b}/help/contact">Save a help request</a> <a href="${b}/help/cases">Your help requests</a></p>`)
  })
  router.get('/help/articles/:id', (req, res) => {
    const a = articles.find(a => a.id === req.params.id)
    if (!a) return missing(req, res)
    page(req, res, a.title, `<section class="ik-form"><p class="ik-lead">${a.text}</p><a class="button" href="${base(res) + a.link}">${a.action}</a><p><a href="${base(res)}/help/contact?category=${a.topic === 'Products' ? 'Products' : a.topic}">Still need help?</a></p></section>`)
  })
  const caseCategories = ['Orders', 'Products', 'Assembly', 'Planning', 'Account']
  function contactPage(req, res, error, values = req.query, status = 200) {
    const b = base(res)
    page(req, res, 'Save a help request', `<p>Tell us about your question and we’ll give you a request number. Online assembly booking and spare-part orders are currently unavailable.</p><form class="ik-panel ik-form" action="${b}/help/contact" method="post"><label>Topic<select name="category" required><option value="">Choose a topic</option>${caseCategories.map(c => `<option${values.category === c ? ' selected' : ''}>${c}</option>`).join('')}</select></label><label>Related order (optional)<select name="order_id"><option value="">No order</option>${myOrders(req).map(o => `<option value="${o.id}"${values.order_id === o.id ? ' selected' : ''}>${esc(o.order_number)}</option>`).join('')}</select></label><label>Related product (optional)<select name="product_id"><option value="">No product</option>${products.map(p => `<option value="${p.id}"${values.product_id === p.id ? ' selected' : ''}>${esc(p.title)}</option>`).join('')}</select></label>${field('email', 'Email address', values.email || req.store.user?.email || '', 'email', 'required')}${field('subject', 'Subject', values.subject, 'text', 'maxlength="160" required')}<label>Your question<textarea name="message" minlength="10" maxlength="3000" required>${esc(values.message || '')}</textarea></label><button>Save request</button></form>`, error, status)
  }
  router.get('/help/contact', (req, res) => contactPage(req, res))
  router.post('/help/contact', (req, res) => {
    const orderId = clean(req.body.order_id), productId = clean(req.body.product_id), errors = []
    if (!caseCategories.includes(req.body.category)) errors.push('Choose a listed help topic.')
    if (req.body.order_id && (!orderId || !myOrder(req, orderId))) errors.push('Choose one of your own orders.')
    if (req.body.product_id && (!productId || !productById(productId))) errors.push('Choose a product from the catalog.')
    if (errors.length) return contactPage(req, res, errors, req.body, 400)
    const result = createSupportCase(req, req.body, 'ikea')
    if (result.errors) return contactPage(req, res, result.errors, req.body, 400)
    result.supportCase.product_id = productId
    res.redirect(`${base(res)}/help/cases/${result.supportCase.id}`)
  })
  router.get('/help/cases', (req, res) => page(req, res, 'Your help requests', `${state(req).cases.map(c => `<article class="ik-panel"><h2><a href="${base(res)}/help/cases/${c.id}">${esc(c.subject)}</a></h2><p>${esc(c.category)} · Request saved · ${esc(c.created_at.slice(0, 10))}</p></article>`).join('') || '<p>No help requests saved yet.</p>'}<a class="button" href="${base(res)}/help/contact">Save a help request</a>`))
  router.get('/help/cases/:id', (req, res) => {
    const c = state(req).cases.find(c => c.id === req.params.id)
    if (!c) return missing(req, res)
    const p = productById(c.product_id), o = c.order_id ? myOrder(req, c.order_id) : null
    page(req, res, 'Your help request is saved', `<section class="ik-panel"><p>Request number: <strong>${esc(c.id)}</strong></p><h2>${esc(c.subject)}</h2><p>${esc(c.category)} · ${esc(c.email)}</p><p class="ik-preserve">${esc(c.message)}</p>${o ? `<p>Order: <a href="${base(res)}/order/${o.id}">${esc(o.order_number)}</a></p>` : ''}${p ? `<p>Product: <a href="${base(res)}/product/${p.id}/assembly">${esc(p.title)} · assembly and care</a></p>` : ''}<p>Status: Received. We’ll reply to your email address as soon as possible.</p>${publicNotice('<p>This is not the real IKEA website: requests are not sent to IKEA.</p>')}</section><a href="${base(res)}/help/cases">View all your requests</a>`)
  })
}
