// Feedback pins: notes an operator drops on a page in the dashboard's
// "Feedback" viewer. Node checks sign-in and turns each request into one
// checked operation; whoever keeps the notes (Node locally, the Worker on
// Cloudflare) applies it with applyFeedback. Agents never see these.
export const FEEDBACK_HEADER = 'x-benchmark-feedback'
export const FEEDBACK_LIMITS = { comments: 500, text: 2000, page: 600, title: 200, selector: 600, element: 200 }

const fail = message => Object.assign(new Error(message), { status: 400 })
const ID = /^[a-zA-Z0-9_-]{8,64}$/
const DEVICES = ['desktop', 'tablet', 'phone']
function text(value, limit, name, { required = false } = {}) {
  if (value === undefined || value === null) value = ''
  if (typeof value !== 'string') throw fail(`${name} must be text`)
  const clean = value.replace(/\r\n?/g, '\n').trim()
  if (required && !clean) throw fail(`Write a note before saving.`)
  if (clean.length > limit) throw fail(`${name} is too long`)
  return clean
}
function number(value, name, { min = 0, max = 1_000_000 } = {}) {
  if (value === undefined || value === null || value === '') return null
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) throw fail(`${name} is out of range`)
  return Math.round(parsed * 1000) / 1000
}
// Pages are same-site paths such as /bestbuy/cart or /dashboard#/tasks.
function page(value) {
  const clean = text(value, FEEDBACK_LIMITS.page, 'Page', { required: true })
  if (!clean.startsWith('/') || clean.startsWith('//') || /[\s\\]/.test(clean)) throw fail('Page must be a path on this site')
  return clean
}

export function feedbackOperation(method, id, body = {}) {
  if (id !== undefined && !ID.test(id)) throw Object.assign(new Error('Note not found'), { status: 404 })
  if (method === 'GET' && id === undefined) return { op: 'list' }
  if (method === 'POST' && id === undefined) {
    return { op: 'add', comment: {
      page: page(body.page), title: text(body.title, FEEDBACK_LIMITS.title, 'Title'),
      text: text(body.text, FEEDBACK_LIMITS.text, 'Note', { required: true }),
      selector: text(body.selector, FEEDBACK_LIMITS.selector, 'Selector'), element: text(body.element, FEEDBACK_LIMITS.element, 'Element'),
      x: number(body.x, 'x') ?? 0, y: number(body.y, 'y') ?? 0, dx: number(body.dx, 'dx', { max: 1 }), dy: number(body.dy, 'dy', { max: 1 }),
      width: number(body.width, 'width', { min: 1, max: 10_000 }), device: DEVICES.includes(body.device) ? body.device : '',
    } }
  }
  if (method === 'PATCH' && id !== undefined) {
    const changes = {}
    if (body.resolved !== undefined) {
      if (typeof body.resolved !== 'boolean') throw fail('resolved must be true or false')
      changes.resolved = body.resolved
    }
    if (body.text !== undefined) changes.text = text(body.text, FEEDBACK_LIMITS.text, 'Note', { required: true })
    if (!Object.keys(changes).length) throw fail('Nothing to change')
    return { op: 'update', id, changes }
  }
  if (method === 'DELETE' && id !== undefined) return { op: 'delete', id }
  throw Object.assign(new Error('Endpoint not found'), { status: 404 })
}

const order = (a, b) => a.number - b.number
// Applies one operation to the saved notes. Returns every note in order, plus
// the one note that changed (to save) or the id that went (to remove).
export function applyFeedback(saved, operation, { now = new Date().toISOString(), newId = () => crypto.randomUUID() } = {}) {
  const comments = [...saved].sort(order)
  if (!operation || typeof operation.op !== 'string') throw new Error('Invalid feedback operation')
  if (operation.op === 'list') return { comments }
  if (operation.op === 'add') {
    if (comments.length >= FEEDBACK_LIMITS.comments) throw Object.assign(new Error(`You can keep up to ${FEEDBACK_LIMITS.comments} notes. Delete some to add more.`), { status: 409 })
    const number = comments.reduce((max, item) => Math.max(max, item.number || 0), 0) + 1
    const comment = { id: newId(), number, ...operation.comment, resolved: false, created_at: now, updated_at: now }
    return { comments: [...comments, comment], changed: comment }
  }
  const index = comments.findIndex(item => item.id === operation.id)
  if (index === -1) throw Object.assign(new Error('Note not found'), { status: 404 })
  if (operation.op === 'update') {
    const comment = { ...comments[index], ...operation.changes, updated_at: now }
    comments[index] = comment
    return { comments, changed: comment }
  }
  if (operation.op === 'delete') {
    comments.splice(index, 1)
    return { comments, removed: operation.id }
  }
  throw new Error('Invalid feedback operation')
}
