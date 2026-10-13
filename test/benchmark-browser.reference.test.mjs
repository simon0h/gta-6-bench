import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { chromium } from 'playwright'
import { startEnvironment } from '../benchmark/environment.js'
import { runBaseline } from '../benchmark/baselines.js'
import { getTask, publicTask } from '../benchmark/tasks.js'
import { gradeTask } from '../benchmark/grader.js'

// Opt in because the normal server unit suite does not require an installed
// browser. npm run benchmark:verify enables these real UI integration checks.
test('browser baselines exercise real store journeys without evaluator APIs', { skip: process.env.RUN_BROWSER_TESTS !== '1', timeout: 600_000 }, async t => {
  const directory = await mkdtemp(path.join(tmpdir(), 'gta6-browser-test-'))
  const browser = await chromium.launch({ headless: true })
  try {
    const scenarios = [
      ['reference', 'bestbuy-purchase-ps5'],
      ['reference', 'game-uk-purchase-ps5'],
      ['reference', 'rockstar-store-purchase-ps5'],
      ['reference', 'bestbuy-quantity-xbox'],
      ['reference', 'game-uk-quantity-xbox'],
      ['reference', 'rockstar-store-address_detail-xbox'],
      ['reference', 'game-uk-budget_decline-ps5'],
      ['reference', 'bestbuy-unsupported_variant-ps5'],
      ['reference', 'game-uk-unsupported_variant-ps5'],
      ['reference', 'rockstar-store-unsupported_variant-ps5'],
      ['noop', 'bestbuy-purchase-ps5'],
    ]
    for (const [baseline, taskId] of scenarios) await t.test(`${baseline}: ${taskId}`, { timeout: 60_000 }, async () => {
      const task = getTask(taskId)
      const environment = await startEnvironment({ task, directory: path.join(directory, `${baseline}-${taskId}`) })
      const context = await browser.newContext()
      try {
        const page = await context.newPage()
        page.setDefaultTimeout(10_000)
        const requests = [], actions = []
        page.on('request', request => requests.push(new URL(request.url()).pathname))
        const finalResponse = await runBaseline(baseline, { page, task: publicTask(task), startUrl: environment.startUrl, recordAction: action => actions.push(action) })
        const snapshot = await environment.snapshot(true)
        assert.deepEqual(snapshot.errors, [])
        assert.equal(requests.some(url => url.startsWith('/api/')), false, 'The browser must not consult evaluator APIs')
        assert.ok(actions.some(action => action.type === 'navigate'))
        const grade = gradeTask(task, { orders: snapshot.orders, finalResponse })
        if (baseline === 'noop') {
          assert.equal(snapshot.orders.length, 0)
          assert.equal(grade.status, 'failed')
          assert.equal(finalResponse.reason, 'not_attempted')
        } else {
          assert.equal(grade.status, 'passed', JSON.stringify(grade.reasons))
          assert.ok(actions.some(action => action.type === 'review'))
          if (task.expected.outcome === 'purchased') assert.ok(actions.some(action => action.type === 'confirmation'))
        }
      } finally { await context.close(); await environment.close() }
    })
  } finally { await browser.close(); await rm(directory, { recursive: true, force: true }) }
})
