import { fork } from 'node:child_process'
import { randomBytes, randomUUID, createHash } from 'node:crypto'
import { readFile, mkdir, writeFile, rename, unlink } from 'node:fs/promises'
import path from 'node:path'
import { tasks, publicTask, SUITE_VERSION } from './tasks.js'
import { gradeTask } from './grader.js'
import { environmentFingerprint, summarize } from './report.js'
import { BENCHMARK_DATE } from './environment.js'

export const DASHBOARD_AGENTS = ['grokbot', 'dots', 'muse']
const clone = value => structuredClone(value)
const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex')
const fail = (message, status = 400) => Object.assign(new Error(message), { status })
const isObject = value => value && typeof value === 'object' && !Array.isArray(value)
const iso = time => new Date(time).toISOString()

function metadata(input, previous = {}) {
  const agent = input.agent ?? previous.agent
  if (!DASHBOARD_AGENTS.includes(agent)) throw fail('Choose grokbot, dots or muse')
  const rawTags = input.tags ?? previous.tags ?? []
  const tags = typeof rawTags === 'string' ? rawTags.split(',').map(tag => tag.trim()).filter(Boolean) : rawTags
  if (!Array.isArray(tags) || tags.length > 20 || tags.some(tag => typeof tag !== 'string' || tag.length > 40)) throw fail('Use up to 20 tags of at most 40 characters')
  const comments = input.comments ?? previous.comments ?? ''
  if (typeof comments !== 'string' || comments.length > 4000) throw fail('Comments must be at most 4000 characters')
  return { agent, tags: [...new Set(tags.map(tag => tag.trim()).filter(Boolean))], comments }
}

async function launchTrial({ trial, task, run, secureCookies }) {
  const env = { ...process.env, CATALOG_MODE: task.catalog_mode ?? 'reference', CAPTCHA_MODE: 'off', CAPTCHA_STORES: '', BENCHMARK_DATE }
  delete env.HOSTING_INTERNAL_TOKEN
  delete env.BENCHMARK_API_TOKEN
  const child = fork(new URL('./dashboard-worker.js', import.meta.url), [], { env, execArgv: [], stdio: ['ignore', 'ignore', 'pipe', 'ipc'] })
  let sequence = 0, closed = false, stderr = ''
  const pending = new Map()
  child.stderr.on('data', chunk => { stderr = (stderr + chunk).slice(-8000) })
  const rejectPending = error => { for (const item of pending.values()) { clearTimeout(item.timer); item.reject(error) }; pending.clear() }
  child.on('error', rejectPending)
  child.on('exit', (code, signal) => { closed = true; rejectPending(new Error(`Trial process exited (${code ?? signal})${stderr ? ': ' + stderr : ''}`)) })
  child.on('message', message => {
    const item = pending.get(message.id)
    if (!item) return
    pending.delete(message.id); clearTimeout(item.timer)
    message.error ? item.reject(new Error(message.error)) : item.resolve(message)
  })
  function request(type, data = {}, timeout = 30000) {
    if (closed || !child.connected) return Promise.reject(new Error('Trial process is unavailable'))
    const id = ++sequence
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { pending.delete(id); reject(new Error(`Trial ${type} timed out`)) }, timeout)
      pending.set(id, { resolve, reject, timer })
      child.send({ id, type, ...data }, error => { if (error) { pending.delete(id); clearTimeout(timer); reject(error) } })
    })
  }
  async function close() {
    if (closed) return
    try { await request('stop', {}, 3000) } catch { child.kill('SIGKILL') }
  }
  try {
    const target = await request('start', {
      runId: trial.id, task, deadline_at: trial.deadline_at, snapshot: trial.snapshot, secureCookies,
      metadata: { suite_version: SUITE_VERSION, benchmark_date: BENCHMARK_DATE,
        environment_sha256: run.environment_sha256, selected_tasks_sha256: run.selected_tasks_sha256,
        dashboard_run_id: run.id, dashboard_attempt_id: trial.attempt_id },
    })
    return { target: { baseUrl: target.baseUrl, startPath: target.startPath },
      snapshot: async finish => (await request('snapshot', { finish: Boolean(finish) })).snapshot, close }
  } catch (error) { await close(); throw error }
}

/** Private run management. The router must never expose run/attempt records to
 * agent tokens: agentView is the only public projection of evaluator state. */
export async function createRunManager({
  directory = path.resolve('data/dashboard'), persist = true, secureCookies = false,
  environment, taskSets = { original30: tasks.filter(task => !task.scenario), all240: tasks },
  now = Date.now, workerFactory = launchTrial,
} = {}) {
  const fingerprint = environment ?? await environmentFingerprint()
  if (typeof fingerprint.environment_sha256 !== 'string' || !fingerprint.environment_sha256) throw fail('An environment fingerprint is required')
  const catalogs = Object.fromEntries(['original30', 'all240'].map(suite => {
    if (!Array.isArray(taskSets[suite]) || !taskSets[suite].length) throw fail(`Missing ${suite} task set`)
    return [suite, clone(taskSets[suite])]
  }))
  const hashes = Object.fromEntries(Object.entries(catalogs).map(([suite, selected]) => [suite, digest(selected)]))
  const filename = path.join(path.resolve(directory), 'dashboard-state.json')
  let runs = [], trials = [], queue = Promise.resolve(), closed = false, closePromise
  const workers = new Map(), timers = new Map()
  const serialized = operation => {
    const result = queue.then(() => { if (closed) throw fail('Run manager is closed', 503); return operation() })
    queue = result.catch(() => {})
    return result
  }
  const runById = id => runs.find(run => run.id === id) ?? null
  const findAttempt = token => {
    for (const run of runs) {
      const attempt = run.attempts.find(item => item.token === token)
      if (attempt) return { run, attempt }
    }
    throw fail('Agent URL not found', 404)
  }
  const attemptTrials = attempt => trials.filter(trial => trial.attempt_id === attempt.id).sort((a, b) => a.index - b.index)
  const activeTrial = attempt => attemptTrials(attempt).find(trial => trial.status === 'running')
  const selectedTasks = run => catalogs[run.suite]
  function compatible(run) {
    if (run.environment_sha256 !== fingerprint.environment_sha256 || run.selected_tasks_sha256 !== hashes[run.suite]
      || run.suite_version !== SUITE_VERSION) throw fail('The benchmark environment or task set changed. Generate a new run to avoid mixing versions.', 409)
  }
  function attemptDetail(run, attempt) {
    const records = attemptTrials(attempt)
    const completed = records.filter(trial => trial.status === 'completed')
    const results = completed.map(trial => trial.result)
    return { ...clone(attempt), status: completed.length === run.task_ids.length ? 'complete' : records.some(trial => trial.status === 'running') ? 'running' : 'ready',
      completed: completed.length, total: run.task_ids.length, summary: summarize(results),
      trials: records.map(({ snapshot, ...trial }) => clone(trial)) }
  }
  function runDetail(run) {
    return { ...clone(run), attempts: run.attempts.map(attempt => attemptDetail(run, attempt)) }
  }
  function view(run, attempt) {
    const completed = attemptTrials(attempt).filter(trial => trial.status === 'completed').length
    const current = activeTrial(attempt)
    let currentTask = null
    if (current) {
      compatible(run)
      const task = selectedTasks(run).find(task => task.id === current.task_id)
      if (!task) throw fail('The task set changed. Ask the operator for a new run.', 409)
      const publicFields = publicTask(task)
      currentTask = { index: current.index + 1, id: publicFields.id, store: publicFields.store,
        instruction: publicFields.instruction, request: publicFields.request, timeout_ms: publicFields.timeout_ms,
        status: 'running', started_at: current.started_at, deadline_at: current.deadline_at }
    }
    return { status: completed === run.task_ids.length ? 'complete' : current ? 'running' : 'ready', completed, total: run.task_ids.length, currentTask }
  }
  async function capture() {
    for (const [id, worker] of workers) {
      const trial = trials.find(trial => trial.id === id)
      if (trial?.status === 'running') trial.snapshot = await worker.snapshot(false)
    }
    return { dashboard_runs: clone(runs), dashboard_trials: clone(trials) }
  }
  async function save({ captureWorkers = true } = {}) {
    const state = captureWorkers ? await capture() : { dashboard_runs: clone(runs), dashboard_trials: clone(trials) }
    if (persist) {
      await mkdir(path.dirname(filename), { recursive: true })
      const temporary = `${filename}.${process.pid}.${randomBytes(6).toString('hex')}.tmp`
      try {
        await writeFile(temporary, JSON.stringify(state) + '\n', { flag: 'wx', mode: 0o600 })
        await rename(temporary, filename)
      } finally { await unlink(temporary).catch(error => { if (error.code !== 'ENOENT') throw error }) }
    }
    return state
  }
  function arm(run, attempt, trial) {
    clearTimeout(timers.get(trial.id))
    const timer = setTimeout(() => {
      serialized(async () => { await expire(run, attempt); await save() }).catch(() => {})
    }, Math.max(1, Math.min(2147483647, Date.parse(trial.deadline_at) - now())))
    timer.unref()
    timers.set(trial.id, timer)
  }
  async function ensureWorker(run, attempt, trial) {
    compatible(run)
    if (workers.has(trial.id)) return workers.get(trial.id)
    const task = selectedTasks(run)[trial.index]
    if (!task || task.id !== trial.task_id || task.version !== trial.task_version) throw fail('Trial task identity changed', 409)
    const worker = await workerFactory({ trial: clone(trial), task: clone(task), run: clone(run), secureCookies })
    workers.set(trial.id, worker)
    arm(run, attempt, trial)
    return worker
  }
  async function complete(run, attempt, trial, finalResponse, timedOut = false, startupError = null) {
    clearTimeout(timers.get(trial.id)); timers.delete(trial.id)
    let snapshot = trial.snapshot, environmentError = startupError?.message ?? null
    const worker = workers.get(trial.id)
    if (worker) {
      try { snapshot = await worker.snapshot(true) }
      catch (error) { environmentError = error.message }
      finally { await worker.close(); workers.delete(trial.id) }
    } else if (!snapshot && !environmentError) environmentError = 'Trial evidence is unavailable'
    const task = selectedTasks(run)[trial.index]
    const errors = snapshot?.errors || []
    if (errors.length) environmentError = JSON.stringify(errors)
    const orders = snapshot?.orders || []
    if (orders.some(order => order.run_id !== trial.id)) environmentError = 'Order escaped its assigned trial identity'
    const scenarioEvents = snapshot?.scenario?.events || []
    const deadlineExceeded = timedOut || Boolean(snapshot?.timed_out)
    const result = {
      run_id: trial.id, task_id: task.id, task_version: task.version, store: task.store, family: task.family, split: task.split,
      catalog_mode: task.catalog_mode ?? 'reference', elapsed_ms: Math.max(0, now() - Date.parse(trial.started_at)),
      final_response: clone(finalResponse ?? null), orders: clone(orders), scenario_events: clone(scenarioEvents),
      timed_out: deadlineExceeded, environment_error: environmentError, request_count: snapshot?.request_count ?? 0,
      grade: gradeTask(task, { orders, finalResponse, scenarioEvents, timedOut: deadlineExceeded, environmentError }),
      artifacts: { trace: false, screenshot: false }, metrics: null,
    }
    trial.status = 'completed'; trial.completed_at = iso(now()); trial.result = result
    // Completed evidence lives in result; checkpoint sessions and test-account
    // passwords are no longer needed after a trial is sealed and scored.
    trial.snapshot = null
    attempt.updated_at = iso(now())
    return view(run, attempt)
  }
  async function expire(run, attempt) {
    const trial = activeTrial(attempt)
    if (!trial || Date.parse(trial.deadline_at) > now()) return false
    compatible(run)
    await complete(run, attempt, trial, null, true)
    return true
  }
  async function expireAll() {
    let changed = false
    for (const run of runs) for (const attempt of run.attempts) {
      // Historical results stay readable after a deployment. Incompatible
      // active trials cannot resume or be scored by changed evaluator code.
      if (run.environment_sha256 !== fingerprint.environment_sha256 || run.selected_tasks_sha256 !== hashes[run.suite]) continue
      changed = await expire(run, attempt) || changed
    }
    if (changed) await save()
  }
  function validateState(state) {
    if (!isObject(state) || !Array.isArray(state.dashboard_runs) || !Array.isArray(state.dashboard_trials)) throw fail('Invalid dashboard checkpoint')
    const next = clone(state), ids = new Set(), tokens = new Set(), attempts = new Map()
    for (const run of next.dashboard_runs) {
      if (!isObject(run) || run.version !== 1 || typeof run.id !== 'string' || ids.has(run.id)
        || !Object.hasOwn(catalogs, run.suite) || typeof run.name !== 'string' || run.name.length > 120
        || typeof run.environment_sha256 !== 'string' || typeof run.selected_tasks_sha256 !== 'string'
        || typeof run.suite_version !== 'string' || !Number.isFinite(Date.parse(run.created_at))
        || !Array.isArray(run.task_ids) || !run.task_ids.length || new Set(run.task_ids).size !== run.task_ids.length
        || !Array.isArray(run.attempts) || run.attempts.length > 5) throw fail('Invalid dashboard run checkpoint')
      ids.add(run.id)
      if (run.selected_tasks_sha256 === hashes[run.suite]
        && JSON.stringify(run.task_ids) !== JSON.stringify(catalogs[run.suite].map(task => task.id))) throw fail('Dashboard task identities do not match the pinned task set')
      for (const attempt of run.attempts) {
        if (!isObject(attempt) || typeof attempt.id !== 'string' || attempts.has(attempt.id)
          || !/^[A-Za-z0-9_-]{43}$/.test(attempt.token) || tokens.has(attempt.token)
          || !Number.isFinite(Date.parse(attempt.created_at))) throw fail('Invalid dashboard attempt checkpoint')
        Object.assign(attempt, metadata(attempt))
        tokens.add(attempt.token); attempts.set(attempt.id, run)
      }
    }
    const trialIds = new Set(), positions = new Set()
    for (const trial of next.dashboard_trials) {
      if (!isObject(trial)) throw fail('Invalid dashboard trial checkpoint')
      const run = attempts.get(trial.attempt_id), position = `${trial.attempt_id}:${trial.index}`
      if (!isObject(trial) || typeof trial.id !== 'string' || trialIds.has(trial.id) || !run || run.id !== trial.run_id
        || !Number.isInteger(trial.index) || trial.index < 0 || trial.index >= run.task_ids.length
        || trial.task_id !== run.task_ids[trial.index] || !Number.isInteger(trial.task_version)
        || !['running', 'completed'].includes(trial.status) || positions.has(position)
        || !Number.isFinite(Date.parse(trial.started_at)) || !Number.isFinite(Date.parse(trial.deadline_at))
        || Date.parse(trial.deadline_at) <= Date.parse(trial.started_at)
        || (trial.status === 'completed' && (!isObject(trial.result?.grade) || !Array.isArray(trial.result.grade.reasons)))
        || (trial.status === 'running' && (!isObject(trial.snapshot) || trial.snapshot.version !== 1 || trial.snapshot.run_id !== trial.id))) {
        throw fail('Invalid dashboard trial checkpoint')
      }
      trialIds.add(trial.id); positions.add(position)
    }
    for (const id of attempts.keys()) {
      const records = next.dashboard_trials.filter(trial => trial.attempt_id === id).sort((a, b) => a.index - b.index)
      if (records.some((trial, index) => trial.index !== index || (trial.status === 'running' && index !== records.length - 1))) throw fail('Dashboard trials must be sequential')
    }
    return next
  }
  async function replaceState(state) {
    const next = validateState(state)
    for (const timer of timers.values()) clearTimeout(timer)
    timers.clear()
    await Promise.all([...workers.values()].map(worker => worker.close()))
    workers.clear()
    runs = next.dashboard_runs; trials = next.dashboard_trials
    for (const run of runs) for (const attempt of run.attempts) {
      const trial = activeTrial(attempt)
      if (trial && run.environment_sha256 === fingerprint.environment_sha256 && run.selected_tasks_sha256 === hashes[run.suite]) arm(run, attempt, trial)
    }
  }

  if (persist) {
    try { await replaceState(JSON.parse(await readFile(filename, 'utf8'))) }
    catch (error) { if (error.code !== 'ENOENT') throw error }
  }
  return {
    listRuns: () => serialized(async () => { await expireAll(); return runs.map(runDetail).reverse() }),
    getRun: id => serialized(async () => {
      await expireAll()
      const run = runById(id)
      if (!run) throw fail('Run not found', 404)
      return runDetail(run)
    }),
    createRun: (input = {}) => serialized(async () => {
      const suite = input.suite ?? 'original30'
      if (!Object.hasOwn(catalogs, suite)) throw fail('Choose original30 or all240')
      const name = input.name ?? `Benchmark ${iso(now()).slice(0, 10)}`
      if (typeof name !== 'string' || !name.trim() || name.length > 120) throw fail('Use a run name of 1–120 characters')
      const run = { version: 1, id: randomUUID(), name: name.trim(), suite, created_at: iso(now()), suite_version: SUITE_VERSION,
        environment_sha256: fingerprint.environment_sha256, selected_tasks_sha256: hashes[suite],
        task_ids: catalogs[suite].map(task => task.id), attempts: [] }
      runs.push(run)
      try { await save() } catch (error) { runs = runs.filter(item => item !== run); throw error }
      return runDetail(run)
    }),
    addAttempt: (runId, input) => serialized(async () => {
      const run = runById(runId)
      if (!run) throw fail('Run not found', 404)
      compatible(run)
      if (run.attempts.length >= 5) throw fail('A run can have at most five agent URLs', 409)
      const attempt = { id: randomUUID(), token: randomBytes(32).toString('base64url'), ...metadata(input ?? {}), created_at: iso(now()), updated_at: iso(now()) }
      run.attempts.push(attempt)
      try { await save() } catch (error) { run.attempts = run.attempts.filter(item => item !== attempt); throw error }
      return attemptDetail(run, attempt)
    }),
    updateAttempt: (runId, attemptId, input) => serialized(async () => {
      const run = runById(runId), attempt = run?.attempts.find(item => item.id === attemptId)
      if (!attempt) throw fail('Agent attempt not found', 404)
      const previous = clone(attempt)
      Object.assign(attempt, metadata(input ?? {}, attempt), { updated_at: iso(now()) })
      try { await save() } catch (error) { Object.assign(attempt, previous); throw error }
      return attemptDetail(run, attempt)
    }),
    agentView: token => serialized(async () => {
      const { run, attempt } = findAttempt(token)
      if (await expire(run, attempt)) await save()
      return view(run, attempt)
    }),
    startTask: token => serialized(async () => {
      const { run, attempt } = findAttempt(token)
      compatible(run)
      if (await expire(run, attempt)) { await save(); throw fail('The task timed out. Start the next task.', 409) }
      let trial = activeTrial(attempt)
      if (!trial) {
        const index = attemptTrials(attempt).length, task = selectedTasks(run)[index]
        if (!task) throw fail('All tasks are complete', 409)
        const started = now()
        trial = { id: randomUUID(), run_id: run.id, attempt_id: attempt.id, index, task_id: task.id, task_version: task.version,
          status: 'running', started_at: iso(started), deadline_at: iso(started + task.timeout_ms), snapshot: null, result: null }
        trials.push(trial)
      }
      try {
        const worker = await ensureWorker(run, attempt, trial)
        trial.snapshot = await worker.snapshot(false)
        await save()
        return clone(worker.target)
      } catch (error) {
        // A version mismatch is never converted into a graded task using a
        // different evaluator. A worker startup failure is an environment error.
        if (error.status === 409) throw error
        await complete(run, attempt, trial, null, false, error)
        await save()
        throw fail('The task environment could not start. The operator can inspect its error.', 503)
      }
    }),
    getTarget: token => serialized(async () => {
      const { run, attempt } = findAttempt(token)
      if (await expire(run, attempt)) { await save(); return null }
      const trial = activeTrial(attempt)
      if (!trial) return null
      const worker = await ensureWorker(run, attempt, trial)
      return clone(worker.target)
    }),
    finishTask: (token, finalResponse) => serialized(async () => {
      const { run, attempt } = findAttempt(token)
      compatible(run)
      const trial = activeTrial(attempt)
      if (!trial) throw fail('There is no running task to finish', 409)
      if (JSON.stringify(finalResponse ?? null).length > 64000) throw fail('Final response is too large')
      if (Date.parse(trial.deadline_at) <= now()) await complete(run, attempt, trial, null, true)
      else {
        try { await ensureWorker(run, attempt, trial); await complete(run, attempt, trial, finalResponse) }
        catch (error) { await complete(run, attempt, trial, finalResponse, false, error) }
      }
      await save(); return view(run, attempt)
    }),
    exportState: () => serialized(() => save()),
    validateState: state => validateState(state),
    importState: state => serialized(async () => { await replaceState(state); await save({ captureWorkers: false }) }),
    close: () => {
      if (closePromise) return closePromise
      closePromise = serialized(async () => {
        try { await save() }
        finally {
          for (const timer of timers.values()) clearTimeout(timer)
          timers.clear()
          await Promise.allSettled([...workers.values()].map(worker => worker.close()))
          workers.clear(); closed = true
        }
      })
      return closePromise
    },
  }
}
