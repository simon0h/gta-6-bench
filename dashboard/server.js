import express from 'express'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { createRunManager } from '../benchmark/dashboard-manager.js'
import { createDashboardRouter } from './router.js'

export async function createDashboardApp({ directory = path.resolve('data/dashboard'), local = true, apiToken = process.env.BENCHMARK_API_TOKEN, manager: suppliedManager } = {}) {
  const manager = suppliedManager || await createRunManager({ directory, secureCookies: !local })
  const app = express()
  app.disable('x-powered-by')
  app.set('etag', false)
  app.use(createDashboardRouter({ manager, local, apiToken }))
  app.use((req, res) => res.status(404).send('Open a generated agent URL to start a benchmark task.'))
  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error)
    res.status(error.status || 500).json({ error: error.status && error.status < 500 ? error.message : 'Dashboard request failed' })
  })
  app.locals.runManager = manager
  return app
}

export async function startDashboardServer({ port = Number(process.env.DASHBOARD_PORT || 3001), ...options } = {}) {
  const app = await createDashboardApp(options)
  const server = await new Promise((resolve, reject) => {
    const result = app.listen(port, '127.0.0.1', error => error ? reject(error) : resolve(result))
    result.once('error', reject)
  })
  return { app, server, close: async () => { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); await app.locals.runManager.close() } }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const { server, close } = await startDashboardServer()
  console.log(`Benchmark dashboard: http://localhost:${server.address().port}/dashboard`)
  for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => { void close().finally(() => process.exit(0)) })
}
