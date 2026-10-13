import test from 'node:test'
import assert from 'node:assert/strict'
import { chromium } from 'playwright'
import { createDashboardApp } from '../dashboard/server.js'
import { createRunManager } from '../benchmark/dashboard-manager.js'
import { tasks } from '../benchmark/tasks.js'

test('browser traversal captures page lineage and actions without field values; operator can inspect it', { skip: process.env.RUN_BROWSER_TESTS !== '1', timeout: 120_000 }, async t => {
  const task = { ...tasks.find(task => task.id === 'bestbuy-budget_decline-ps5'), timeout_ms: 120_000 }
  const manager = await createRunManager({ persist: false, environment: { environment_sha256: 'traversal-browser-test' }, taskSets: { original30: [task], all240: [task] } })
  const app = await createDashboardApp({ manager })
  const server = await new Promise(resolve => { const listener = app.listen(0, '127.0.0.1', () => resolve(listener)) })
  const origin = `http://127.0.0.1:${server.address().port}`
  const browser = await chromium.launch({ headless: true })
  t.after(async () => { await browser.close(); server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); await manager.close() })
  const run = await manager.createRun({ name: 'Traversal browser check' })
  const attempt = await manager.addAttempt(run.id, { agent: 'muse' })
  const agent = await browser.newPage(), errors = []
  agent.on('pageerror', error => errors.push(error.message))
  await agent.goto(`${origin}/agent/${attempt.token}`)
  await agent.getByRole('button', { name: 'Start task', exact: true }).click()
  await agent.getByRole('link', { name: 'Continue shopping ↗' }).click()
  await agent.waitForURL(/\/bestbuy\/?$/)
  await agent.locator('script[src="/dashboard/capture.js"]').waitFor({ state: 'attached' })
  await agent.locator('a[href="/bestbuy/cart"]').first().click()
  await agent.waitForURL(/\/bestbuy\/cart$/)
  await agent.goBack()
  await agent.waitForURL(/\/bestbuy\/?$/)
  await agent.goto(`${origin}/bestbuy/identity/global/signin?token=TRAVERSAL_QUERY_CANARY`)
  await agent.locator('input[type="email"]').fill('TRAVERSAL_EMAIL_CANARY@example.test')
  await agent.getByRole('button', { name: 'Continue', exact: true }).click()
  await agent.locator('input[type="password"]').fill('TRAVERSAL_PASSWORD_CANARY')
  await agent.locator('input[type="password"]').press('Tab')
  await agent.locator('form button[type="submit"]').last().click()
  await agent.getByText('Oops! The email or password did not match our records. Please try again.', { exact: true }).waitFor()
  await agent.waitForLoadState('networkidle')
  // Poll observation delivery, not arbitrary sleeps: pagehide beacons can arrive
  // after the navigation response in a real browser.
  let snapshot, events
  for (let retry = 0; retry < 60; retry++) {
    snapshot = await manager.exportState()
    events = snapshot.dashboard_trace_events || []
    if (events.some(event => event.kind === 'submit') && events.filter(event => event.kind === 'page').length >= 3) break
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  assert.ok(events.some(event => event.kind === 'click'))
  assert.ok(events.some(event => event.kind === 'submit'))
  assert.ok(events.filter(event => event.kind === 'change').length >= 2)
  assert.ok(events.some(event => event.kind === 'page' && event.parent_page_id))
  assert.ok(events.some(event => event.navigation === 'back_forward'))
  assert.ok(events.some(event => event.kind === 'request' && event.method === 'POST'))
  assert.doesNotMatch(JSON.stringify(events), /TRAVERSAL_(QUERY|EMAIL|PASSWORD)_CANARY/)
  assert.doesNotMatch(JSON.stringify(events), new RegExp(attempt.token))
  await manager.finishTask(attempt.token, { outcome: 'not_purchased', reason: 'budget_exceeded', message: 'Budget decline traversal check.' })
  const operator = await browser.newPage({ viewport: { width: 1365, height: 1000 } })
  operator.on('pageerror', error => errors.push(error.message))
  await operator.goto(`${origin}/dashboard#/runs/${run.id}`)
  await operator.getByLabel('Comments').fill('Draft retained while inspecting traversal')
  await operator.getByRole('button', { name: 'View traversal', exact: true }).click()
  await operator.locator('#traversal-dialog').waitFor()
  await operator.locator('.trace-page').first().waitFor()
  assert.ok(await operator.locator('.trace-page').count() >= 3)
  assert.ok(await operator.locator('.trace-event').count() >= 3)
  await operator.screenshot({ path: '/private/tmp/gta-traversal-desktop.png', fullPage: true })
  await operator.setViewportSize({ width: 390, height: 844 })
  assert.equal(await operator.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
  await operator.screenshot({ path: '/private/tmp/gta-traversal-mobile.png', fullPage: true })
  await operator.keyboard.press('Escape')
  assert.equal(await operator.getByLabel('Comments').inputValue(), 'Draft retained while inspecting traversal')
  assert.deepEqual(errors, [])
})
