import { chromium } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { randomUUID, createHash } from 'node:crypto'
import { publicTask, SUITE_VERSION } from './tasks.js'
import { gradeTask } from './grader.js'
import { describeResult } from './outcome.js'
import { startEnvironment, BENCHMARK_DATE } from './environment.js'
import { runBaseline, BASELINES } from './baselines.js'
import { environmentFingerprint, writeJson, summarize, renderReport } from './report.js'

const errorText = error => error instanceof Error ? error.message : String(error)

/** Adapters are trusted runner plugins. Only public task fields reach the agent. */
export async function runSuite({ tasks, outputDirectory, baseline = 'reference', adapter, agentLabel, agentConfig = {}, adapterSha256 = null, repeats = 1, headless = true, onProgress = () => {} }) {
  if (!Array.isArray(tasks) || !tasks.length) throw new Error('Select at least one task')
  if (!Number.isInteger(repeats) || repeats < 1 || repeats > 100) throw new Error('repeats must be an integer from 1 to 100')
  if (!adapter && !BASELINES.includes(baseline)) throw new Error(`Unknown baseline: ${baseline}`)
  if (!agentConfig || typeof agentConfig !== 'object' || Array.isArray(agentConfig)) throw new Error('Agent metadata must be an object')
  const savedAgentConfig = JSON.parse(JSON.stringify(agentConfig))
  const directory = path.resolve(outputDirectory)
  await mkdir(path.dirname(directory), { recursive: true })
  await mkdir(directory) // Refuse to overwrite or mix reports from different evaluations.
  const environment = await environmentFingerprint()
  const suiteHash = createHash('sha256').update(JSON.stringify(tasks)).digest('hex')
  const agent = agentLabel || (adapter ? 'custom-adapter' : `scripted-${baseline}`)
  const report = {
    schema_version: 1, suite_version: SUITE_VERSION, selected_tasks_sha256: suiteHash,
    created_at: new Date().toISOString(), agent, environment,
    configuration: { repeats, catalog_mode: new Set(tasks.map(task => task.catalog_mode ?? 'reference')).size === 1 ? (tasks[0].catalog_mode ?? 'reference') : 'mixed', catalog_modes: Object.fromEntries(tasks.map(task => [task.id, task.catalog_mode ?? 'reference'])), benchmark_date: BENCHMARK_DATE,
      viewport: { width: 1280, height: 900 }, locale: 'en-US', timezone: 'UTC', headless,
      task_ids: tasks.map(task => task.id), interface: 'browser-dom', network: 'run-origin-only',
      agent: savedAgentConfig, adapter_sha256: adapterSha256,
      adapter_trust: 'Adapters execute as trusted local runner code; browser-origin restrictions are not an OS sandbox.',
    }, results: [],
  }
  let browser, launchError
  try { browser = await chromium.launch({ headless }); environment.browser_version = browser.version() }
  catch (error) { launchError = `Browser failed to start: ${errorText(error)}. Run npx playwright install chromium.` }
  try {
    for (const task of tasks) {
      for (let repeat = 1; repeat <= repeats; repeat++) {
        onProgress({ phase: 'start', task: task.id, repeat })
        const runId = randomUUID()
        const relative = `runs/${task.id}-${repeat}`
        const runDirectory = path.join(directory, relative)
        await mkdir(runDirectory, { recursive: true })
        const actions = [], consoleErrors = [], blockedRequests = []
        const artifacts = { trace: false, screenshot: false }
        let worker, context, page, finalResponse, agentError, environmentError = launchError, orders = [], scenarioEvents = [], metrics = null, started = Date.now()
        const controller = new AbortController()
        const recordAction = action => {
          if (!controller.signal.aborted) actions.push({ elapsed_ms: Date.now() - started, ...action })
        }
        try {
          if (launchError) throw new Error(launchError)
          worker = await startEnvironment({ task, directory: runDirectory, runId, metadata: {
            suite_version: SUITE_VERSION, environment_sha256: environment.environment_sha256, selected_tasks_sha256: suiteHash,
          } })
          context = await browser.newContext({ viewport: report.configuration.viewport, locale: 'en-US', timezoneId: 'UTC', serviceWorkers: 'block' })
          await context.route('**/*', route => {
            const url = new URL(route.request().url())
            if (url.origin === worker.baseUrl) return route.continue()
            blockedRequests.push({ url: url.href, method: route.request().method() })
            return route.abort('blockedbyclient')
          })
          // Storefronts need no sockets. HTTP routing alone does not cover them.
          await context.routeWebSocket('**/*', socket => {
            blockedRequests.push({ url: socket.url(), method: 'WEBSOCKET' })
            socket.close()
          })
          await context.tracing.start({ screenshots: true, snapshots: true, sources: true })
          page = await context.newPage()
          page.setDefaultTimeout(10_000)
          page.setDefaultNavigationTimeout(15_000)
          page.on('pageerror', error => consoleErrors.push(error.message))
          // HTTP method/path/status complement the browser trace; never log form bodies.
          page.on('response', response => {
            const url = new URL(response.url())
            if (response.request().resourceType() === 'document') {
              recordAction({ type: 'navigation', method: response.request().method(), path: url.pathname, status: response.status() })
            }
          })
          started = Date.now()
          try {
            // Tasks have no time limit; elapsed_ms records how long the agent took.
            const input = { page, task: publicTask(task), startUrl: worker.startUrl, recordAction, signal: controller.signal }
            const response = await Promise.resolve().then(() => adapter ? adapter(input) : runBaseline(baseline, input))
            finalResponse = response?.finalResponse ?? response
            if (response?.metrics) {
              const { cost_usd, input_tokens, output_tokens } = response.metrics
              metrics = Object.fromEntries(Object.entries({ cost_usd, input_tokens, output_tokens }).filter(([, value]) => Number.isFinite(value) && value >= 0))
            }
          } catch (error) { agentError = errorText(error) }
          finally { controller.abort() }
          // Freeze on settlement, before screenshot/trace work, so late actions
          // cannot change the scored transaction after the agent has finished.
          const snapshot = await worker.snapshot(true)
          orders = snapshot.orders
          scenarioEvents = snapshot.scenarioEvents
          if (snapshot.errors.length) environmentError = JSON.stringify(snapshot.errors)
          try { await page.screenshot({ path: path.join(runDirectory, 'final.png'), fullPage: true, timeout: 5000 }); artifacts.screenshot = true }
          catch (error) { consoleErrors.push(`Screenshot unavailable: ${errorText(error)}`) }
        } catch (error) { environmentError = errorText(error) }
        finally {
          controller.abort()
          if (context) {
            try { await context.tracing.stop({ path: path.join(runDirectory, 'trace.zip') }); artifacts.trace = true }
            catch (error) { consoleErrors.push(`Trace unavailable: ${errorText(error)}`) }
            await context.close().catch(() => {})
          }
          if (worker) {
            await writeJson(path.join(runDirectory, 'server-log.json'), worker.logs())
            await worker.close()
          }
        }
        const result = {
          run_id: runId, task_id: task.id, task_version: task.version, store: task.store, family: task.family, split: task.split, catalog_mode: task.catalog_mode ?? 'reference', repeat,
          elapsed_ms: Date.now() - started, metrics, action_count: actions.length, final_response: finalResponse ?? null,
          grade: gradeTask(task, { orders, finalResponse, scenarioEvents, environmentError, agentError }),
          scenario_events: scenarioEvents,
          environment_error: environmentError ?? null, agent_error: agentError ?? null,
          artifact_directory: relative, artifacts,
        }
        Object.assign(result, describeResult(task, result, orders))
        await writeJson(path.join(runDirectory, 'task.json'), task)
        await writeJson(path.join(runDirectory, 'actions.json'), { actions, console_errors: consoleErrors, blocked_requests: blockedRequests })
        await writeJson(path.join(runDirectory, 'scenario-events.json'), scenarioEvents)
        await writeJson(path.join(runDirectory, 'result.json'), result)
        report.results.push(result)
        report.summary = summarize(report.results)
        await writeJson(path.join(directory, 'report.json'), report)
        await writeFile(path.join(directory, 'index.html'), renderReport(report))
        onProgress({ phase: 'complete', task: task.id, repeat, result })
      }
    }
  } finally { await browser?.close() }
  return report
}
