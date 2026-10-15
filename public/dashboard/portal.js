const token = document.body.dataset.token
const base = `/agent/${encodeURIComponent(token)}`
const $ = id => document.getElementById(id)
let state
async function api(path, body) {
  const response = await fetch(base + path, { credentials: 'same-origin', ...(body !== undefined ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {}) })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Unable to load this task.')
  return data
}
function error(message) { $('error').textContent = message; $('error').hidden = !message }
function render(next) {
  state = next
  $('loading').hidden = true
  const complete = ['completed', 'complete'].includes(state.status) || state.completed >= state.total
  $('complete').hidden = !complete
  $('workspace').hidden = complete
  if (complete) return
  const task = state.currentTask
  $('progress').textContent = `TASK ${state.completed + 1} OF ${state.total}`
  $('start').disabled = false
  if (!task) {
    $('status').textContent = 'Ready to start'
    $('title').textContent = 'Your next task'
    $('instruction').textContent = 'Start when you are ready. Your instructions and shopping details will appear here.'
    $('request').textContent = 'Details are revealed when this task starts.'
    $('start').hidden = false
    $('resume').hidden = true
    $('finish-section').hidden = true
    $('timing').textContent = 'Each task starts with a fresh shopping environment. There is no time limit.'
    return
  }
  $('status').textContent = task.status === 'running' ? 'In progress' : 'Ready to start'
  $('title').textContent = task.store ? `Shopping at ${task.store.replaceAll('-', ' ')}` : 'Your next task'
  $('instruction').textContent = task.instruction
  $('request').textContent = JSON.stringify(task.request, null, 2)
  const running = task.status === 'running'
  $('start').hidden = running
  $('resume').hidden = !running
  $('resume').href = `/${task.store}`
  $('finish-section').hidden = !running
  $('timing').textContent = 'There is no time limit. Submit your result when you are done.'
}
$('start').addEventListener('click', async () => {
  error(''); $('start').disabled = true
  try { await api('/start', {}); render(await api('/state')) }
  catch (e) { error(e.message); $('start').disabled = false }
})
$('outcome').addEventListener('change', () => {
  const abstain = $('outcome').value === 'not_purchased'
  $('reason-field').hidden = !abstain
  $('reason').required = abstain
})
$('finish').addEventListener('submit', async event => {
  event.preventDefault(); error('')
  const button = event.submitter
  button.disabled = true
  try {
    render(await api('/finish', { outcome: $('outcome').value, message: $('message').value.trim(), ...($('outcome').value === 'not_purchased' ? { reason: $('reason').value } : {}) }))
    event.target.reset(); $('reason-field').hidden = true; $('reason').required = false
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (e) { error(e.message) }
  finally { button.disabled = false }
})
api('/state').then(render).catch(e => { $('loading').hidden = true; error(e.message) })
