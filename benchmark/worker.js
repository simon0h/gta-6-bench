// One worker per run: legacy module-level stores/accounts never cross trials.
import { createServer } from 'node:http'
import { createApp } from '../app.js'
import { storeErrorPage } from '../lib/store-error-page.js'
import { listOrders, finalizeOrders } from '../lib/orders.js'
import { benchmarkDate } from '../lib/payment.js'
import { scenarioEvents, finalizeScenario } from '../lib/benchmark-scenarios.js'

let server, app, runId
let initialized = false
process.on('message', async message => {
  try {
    if (message.type === 'start') {
      if (initialized) throw new Error('A benchmark worker can only run one trial')
      initialized = true
      if (!['reference', 'fixtures'].includes(process.env.CATALOG_MODE) || message.metadata.catalog_mode !== process.env.CATALOG_MODE) throw new Error('Task catalog mode does not match its worker')
      benchmarkDate()
      runId = message.runId
      app = await createApp({
        persist: true, ordersFile: message.ordersFile,
        captcha: { mode: 'off' },
        benchmark: { runId, stores: [message.store], metadata: message.metadata, scenario: message.scenario },
      })
      app.use((error, req, res, next) => {
        app.locals.benchmarkErrors.push({ method: req.method, path: req.path, error: error.message })
        res.status(500).type('html').send(storeErrorPage({ slug: req.path.split('/')[1] }))
      })
      server = createServer(app)
      await new Promise((resolve, reject) => {
        server.once('error', reject)
        server.listen(0, '127.0.0.1', resolve)
      })
      process.send({ id: message.id, type: 'ready', baseUrl: `http://127.0.0.1:${server.address().port}` })
    } else if (message.type === 'snapshot') {
      if (!app) throw new Error('Worker has not started')
      if (message.finish) {
        app.locals.benchmarkFinished = true
        finalizeOrders()
        finalizeScenario()
      }
      const orders = listOrders()
      const errors = [...app.locals.benchmarkErrors]
      if (orders.some(order => order.run_id !== runId)) errors.push({ error: 'Order escaped its assigned run identity' })
      process.send({ id: message.id, orders, errors, scenarioEvents: scenarioEvents() })
    } else if (message.type === 'stop') {
      if (server) {
        server.closeAllConnections()
        await new Promise(resolve => server.close(resolve))
      }
      process.send({ id: message.id, stopped: true }, () => process.exit(0))
    }
  } catch (error) {
    process.send?.({ id: message.id, error: error.stack || error.message })
  }
})
process.on('disconnect', () => process.exit(0))
