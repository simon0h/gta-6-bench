import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { chromium } from 'playwright'
import { startEnvironment } from '../benchmark/environment.js'
import { runBaseline } from '../benchmark/baselines.js'
import { tasks, publicTask } from '../benchmark/tasks.js'
import { gradeTask } from '../benchmark/grader.js'

// These are actual rendered journeys: the reference baseline learns about
// failures from the same cart and checkout controls available to an agent.
test('browser reference handles changing availability, rejected payments, pickup and existing cart mistakes', { skip: process.env.RUN_BROWSER_TESTS !== '1', timeout: 1_800_000 }, async t => {
  const directory = await mkdtemp(path.join(tmpdir(), 'gta6-scenarios-browser-'))
  const browser = await chromium.launch({ headless: true })
  try {
    const scenarios = tasks.filter(task => task.scenario)
    assert.equal(scenarios.length, 210)
    for (const task of scenarios) await t.test(task.id, { timeout: 60_000 }, async () => {
      const environment = await startEnvironment({ task, directory: path.join(directory, task.id) })
      const context = await browser.newContext()
      try {
        const page = await context.newPage()
        page.setDefaultTimeout(10_000)
        const requests = [], actions = []
        page.on('request', request => requests.push(new URL(request.url()).pathname))
        const publicRequest = publicTask(task)
        assert.equal(publicRequest.scenario, undefined)
        assert.equal(publicRequest.family, undefined)
        assert.equal(publicRequest.expected, undefined)
        const finalResponse = await runBaseline('reference', { page, task: publicRequest, startUrl: environment.startUrl, recordAction: action => actions.push(action) })
        const snapshot = await environment.snapshot(true)
        assert.deepEqual(snapshot.errors, [])
        assert.equal(requests.some(url => url.startsWith('/api/')), false, 'The browser must not consult evaluator APIs')
        const grade = gradeTask(task, { orders: snapshot.orders, scenarioEvents: snapshot.scenarioEvents, finalResponse })
        assert.equal(grade.status, 'passed', JSON.stringify(grade.reasons))
        if (task.family.startsWith('payment_')) {
          const rejected = actions.findIndex(action => action.type === 'payment_declined')
          assert.ok(rejected >= 0, 'The primary rejection must be visibly observed')
          const payments = actions.map((action, index) => ({ ...action, index })).filter(action => action.type === 'payment')
          assert.equal(payments.length, task.request.backup_payment ? 2 : 1)
          assert.ok(payments[0].index < rejected)
          if (task.request.backup_payment) assert.ok(payments[1].index > rejected, 'Backup payment is attempted only after rejection')
        }
        if (task.family === 'availability_fallback') assert.ok(actions.some(action => action.type === 'fulfillment' && action.description.includes('pickup')))
        if (task.family === 'cart_recovery') assert.ok(actions.some(action => action.type === 'click' && /remove/i.test(action.description)))
        if (task.expected.outcome === 'purchased') assert.ok(actions.some(action => action.type === 'confirmation'))
        else assert.equal(snapshot.orders.length, 0)
      } finally { await context.close(); await environment.close() }
    })
  } finally { await browser.close(); await rm(directory, { recursive: true, force: true }) }
})
