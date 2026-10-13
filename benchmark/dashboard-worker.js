// One process per external-agent trial. The HTTP origin contains storefronts;
// checkpointing and grading evidence travel exclusively over parent IPC.
import { createServer } from 'node:http'
import { createApp } from '../app.js'
import { exportOrders, prepareOrderImport, finalizeOrders } from '../lib/orders.js'
import { exportAccounts, prepareAccountImport } from '../lib/accounts.js'
import { exportSessions, prepareSessionImport, sessionStates } from '../lib/session.js'
import { exportScenarioState, restoreScenarioState, finalizeScenario } from '../lib/benchmark-scenarios.js'
import { benchmarkDate } from '../lib/payment.js'

let app, server, runId, deadline, timer, initialized = false, timedOut = false, requests = 0

function seal(timeout = false) {
  if (!app) return
  timedOut ||= timeout
  app.locals.benchmarkFinished = true
  finalizeOrders()
  finalizeScenario()
  clearTimeout(timer)
}

function checkDeadline() {
  if (deadline && Date.now() >= deadline && !app.locals.benchmarkFinished) seal(true)
}

function snapshot() {
  checkDeadline()
  return {
    version: 1, run_id: runId, sessions: exportSessions({ runId }), orders: exportOrders(), accounts: exportAccounts(),
    scenario: exportScenarioState(sessionStates({ runId })), errors: structuredClone(app.locals.benchmarkErrors),
    finished: Boolean(app.locals.benchmarkFinished), timed_out: timedOut, request_count: requests,
  }
}

async function handle(message) {
  if (message.type === 'start') {
    if (initialized) throw new Error('A dashboard worker can run only one trial')
    initialized = true
    runId = message.runId
    if (typeof runId !== 'string' || !/^[a-zA-Z0-9-]+$/.test(runId)) throw new Error('Invalid trial identity')
    const task = message.task
    if (!task || (task.catalog_mode ?? 'reference') !== process.env.CATALOG_MODE) throw new Error('Trial catalog mode mismatch')
    benchmarkDate()
    deadline = Date.parse(message.deadline_at)
    if (!Number.isFinite(deadline)) throw new Error('Trial requires a deadline')
    app = await createApp({ persist: false, captcha: { mode: 'off', stores: [] }, benchmark: {
      runId, stores: [task.store], scenario: task.scenario,
      metadata: { ...message.metadata, run_id: runId, task_id: task.id, task_version: task.version, catalog_mode: task.catalog_mode ?? 'reference' },
    } })
    app.set('trust proxy', 1)
    // Reuse one cookie per agent URL across its task sequence. Per-task cookie
    // names would eventually exceed browser/server header limits in 240 tasks.
    const attemptId = message.metadata?.dashboard_attempt_id
    if (typeof attemptId !== 'string' || !/^[a-zA-Z0-9-]+$/.test(attemptId)) throw new Error('Invalid attempt identity')
    app.set('session cookie name', `attempt_${attemptId}`)
    app.set('hosted session cookies', Boolean(message.secureCookies))
    if (message.snapshot) {
      const saved = message.snapshot
      if (saved.version !== 1 || saved.run_id !== runId || !Array.isArray(saved.errors)
        || typeof saved.finished !== 'boolean' || typeof saved.timed_out !== 'boolean'
        || !Number.isInteger(saved.request_count) || saved.request_count < 0
        || !Array.isArray(saved.orders) || saved.orders.some(order => order.run_id !== runId)) throw new Error('Invalid trial checkpoint')
      const sessions = prepareSessionImport(saved.sessions, { runId })
      const orders = prepareOrderImport(saved.orders)
      const accounts = prepareAccountImport(saved.accounts)
      sessions(); orders(); accounts()
      restoreScenarioState(saved.scenario, sessionStates({ runId }))
      app.locals.benchmarkErrors = structuredClone(saved.errors)
      timedOut = saved.timed_out
      requests = saved.request_count
      if (saved.finished) seal(timedOut)
    }
    app.use((error, req, res, next) => {
      app.locals.benchmarkErrors.push({ method: req.method, path: req.path, error: error.message })
      res.status(500).send('Benchmark environment error')
    })
    server = createServer((req, res) => {
      checkDeadline()
      requests++
      app(req, res)
    })
    await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve) })
    checkDeadline()
    if (!app.locals.benchmarkFinished) {
      timer = setTimeout(() => seal(true), Math.max(1, deadline - Date.now()))
      timer.unref()
    }
    return { baseUrl: `http://127.0.0.1:${server.address().port}`, startPath: `/${task.store}` }
  }
  if (!app) throw new Error('Trial has not started')
  if (message.type === 'snapshot') {
    checkDeadline()
    if (message.finish) seal(false)
    return { snapshot: snapshot() }
  }
  if (message.type === 'stop') {
    clearTimeout(timer)
    server.closeAllConnections()
    await new Promise(resolve => server.close(resolve))
    return { stopped: true }
  }
  throw new Error('Unknown dashboard worker operation')
}

let queue = Promise.resolve()
process.on('message', message => {
  queue = queue.then(async () => {
    try {
      const response = await handle(message)
      process.send?.({ id: message.id, ...response }, () => { if (message.type === 'stop') process.exit(0) })
    } catch (error) {
      process.send?.({ id: message.id, error: error.message })
    }
  })
})
process.on('disconnect', () => process.exit(0))
