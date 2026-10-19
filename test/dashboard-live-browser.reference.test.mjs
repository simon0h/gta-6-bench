import test from 'node:test'
import assert from 'node:assert/strict'
import { chromium } from 'playwright'
import { createDashboardApp } from '../dashboard/server.js'
import { createRunManager } from '../benchmark/dashboard-manager.js'
import { tasks } from '../benchmark/tasks.js'

const picked = ['bestbuy-budget_decline-ps5', 'bestbuy-purchase-ps5', 'game-uk-budget_decline-ps5'].map(id => tasks.find(task => task.id === id))
const factory = async ({ trial }) => ({ target: { baseUrl: 'http://127.0.0.1:1', startPath: '/bestbuy' },
  snapshot: async () => ({ version: 1, run_id: trial.id, orders: [], errors: [], sessions: [], request_count: 0 }), close: async () => {} })
const decline = { outcome: 'not_purchased', reason: 'budget_exceeded' }

test('run page numbers, results and config progress update while a run is going, then polling stops', { skip: process.env.RUN_BROWSER_TESTS !== '1', timeout: 120_000 }, async t => {
  const manager = await createRunManager({ persist: false, environment: { environment_sha256: 'live-browser-test' }, taskSets: { original30: picked, all240: picked }, workerFactory: factory })
  const app = await createDashboardApp({ manager })
  const server = await new Promise(resolve => { const listener = app.listen(0, '127.0.0.1', () => resolve(listener)) })
  const browser = await chromium.launch({ headless: true })
  t.after(async () => { await browser.close(); server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); await manager.close() })
  const run = await manager.createRun({ name: 'Live page check' }), attempt = await manager.addAttempt(run.id, { agent: 'dots' })
  const page = await browser.newPage(), errors = []
  let livePolls = 0
  page.on('pageerror', error => errors.push(error.message))
  page.on('request', request => { if (request.url().endsWith('/live')) livePolls++ })
  await page.addInitScript(() => localStorage.setItem('dashboard-run-tab', 'overview'))
  await page.goto(`http://127.0.0.1:${server.address().port}/dashboard#/runs/${run.id}`)
  const completed = page.locator('.run-summary .stat-value').first(), status = page.locator('.run-status-row')
  await assert.doesNotReject(completed.filter({ hasText: '0/3' }).waitFor())

  await manager.startTask(attempt.token)
  await status.filter({ hasText: 'Running' }).waitFor({ timeout: 20_000 })
  await manager.finishTask(attempt.token, decline)
  await completed.filter({ hasText: '1/3' }).waitFor({ timeout: 20_000 })
  await page.locator('#overview-results .store-bar').first().waitFor()

  // On Results, a new task appears without losing the open row or the text being typed.
  await page.click('#run-tab-results')
  await page.click('.result-row')
  await page.fill('#results-query', 'best')
  await manager.startTask(attempt.token)
  await manager.finishTask(attempt.token, decline)
  await page.locator('#run-tab-results .tab-count').filter({ hasText: '2' }).waitFor({ timeout: 20_000 })
  assert.equal(await page.locator('.result-group').count(), 2)
  assert.equal(await page.locator('.result-group.open').count(), 1)
  assert.equal(await page.inputValue('#results-query'), 'best')
  assert.equal(await page.evaluate(() => document.activeElement?.id), 'results-query')

  // On Manage sessions, the progress bar moves; once every agent is done the page stops asking.
  await page.click('#run-tab-agents')
  await manager.startTask(attempt.token)
  await manager.finishTask(attempt.token, decline)
  await page.locator('.agent-card .progress-group').filter({ hasText: '3 / 3 results' }).waitFor({ state: 'attached', timeout: 20_000 })
  await status.filter({ hasText: 'Completed' }).waitFor()
  const polls = livePolls
  await page.waitForTimeout(17_000)
  assert.equal(livePolls, polls)
  assert.deepEqual(errors, [])
})
