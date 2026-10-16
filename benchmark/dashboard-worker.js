// One process per external-agent trial. The HTTP origin contains storefronts;
// checkpointing and grading evidence travel exclusively over parent IPC.
import { createServer } from 'node:http'
import { createApp } from '../app.js'
import { storeErrorPage } from '../lib/store-error-page.js'
import { exportOrders, prepareOrderImport, finalizeOrders } from '../lib/orders.js'
import { exportAccounts, prepareAccountImport } from '../lib/accounts.js'
import { exportSessions, prepareSessionImport, sessionStates } from '../lib/session.js'
import { exportScenarioState, restoreScenarioState, finalizeScenario } from '../lib/benchmark-scenarios.js'
import { benchmarkDate } from '../lib/payment.js'

// Tasks have no time limit: the storefront stays open until the agent submits.
let app, server, runId, initialized = false, requests = 0

function seal() {
  if (!app) return
  app.locals.benchmarkFinished = true
  finalizeOrders()
  finalizeScenario()
}

function snapshot() {
  return {
    version: 1, run_id: runId, sessions: exportSessions({ runId }), orders: exportOrders(), accounts: exportAccounts(),
    scenario: exportScenarioState(sessionStates({ runId })), errors: structuredClone(app.locals.benchmarkErrors),
    finished: Boolean(app.locals.benchmarkFinished), request_count: requests,
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
        || typeof saved.finished !== 'boolean'
        || !Number.isInteger(saved.request_count) || saved.request_count < 0
        || !Array.isArray(saved.orders) || saved.orders.some(order => order.run_id !== runId)) throw new Error('Invalid trial checkpoint')
      const sessions = prepareSessionImport(saved.sessions, { runId })
      const orders = prepareOrderImport(saved.orders)
      const accounts = prepareAccountImport(saved.accounts)
      sessions(); orders(); accounts()
      restoreScenarioState(saved.scenario, sessionStates({ runId }))
      app.locals.benchmarkErrors = structuredClone(saved.errors)
      requests = saved.request_count
      if (saved.finished) seal()
    }
    app.use((error, req, res, next) => {
      app.locals.benchmarkErrors.push({ method: req.method, path: req.path, error: error.message })
      res.status(500).type('html').send(storeErrorPage({ slug: req.path.split('/')[1] }))
    })
    server = createServer((req, res) => {
      requests++
      app(req, res)
    })
    await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve) })
    return { baseUrl: `http://127.0.0.1:${server.address().port}`, startPath: `/${task.store}` }
  }
  if (!app) throw new Error('Trial has not started')
  if (message.type === 'snapshot') {
    if (message.finish) seal()
    return { snapshot: snapshot() }
  }
  if (message.type === 'stop') {
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
