import test from 'node:test'
import assert from 'node:assert/strict'
import { gunzipSync } from 'node:zlib'
import { chromium } from 'playwright'
import { createDashboardApp } from '../dashboard/server.js'
import { createRunManager } from '../benchmark/dashboard-manager.js'
import { tasks } from '../benchmark/tasks.js'

const replayEvents = chunks => chunks.flatMap(chunk => JSON.parse(gunzipSync(Buffer.from(chunk.data, 'base64')).toString('utf8')))

test('browser replay records pages, pointer and typing with passwords and card fields masked; operator can play it', { skip: process.env.RUN_BROWSER_TESTS !== '1', timeout: 120_000 }, async t => {
  const task = { ...tasks.find(task => task.id === 'bestbuy-budget_decline-ps5'), timeout_ms: 120_000 }
  const manager = await createRunManager({ persist: false, environment: { environment_sha256: 'replay-browser-test' }, taskSets: { original30: [task], all240: [task] } })
  const app = await createDashboardApp({ manager })
  const server = await new Promise(resolve => { const listener = app.listen(0, '127.0.0.1', () => resolve(listener)) })
  const origin = `http://127.0.0.1:${server.address().port}`
  const browser = await chromium.launch({ headless: true })
  t.after(async () => { await browser.close(); server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); await manager.close() })
  const run = await manager.createRun({ name: 'Replay browser check' })
  const attempt = await manager.addAttempt(run.id, { agent: 'dots' })
  const agent = await browser.newPage(), errors = []
  agent.on('pageerror', error => errors.push(error.message))
  await agent.goto(`${origin}/agent/${attempt.token}`)
  await agent.getByRole('button', { name: 'Start task', exact: true }).click()
  await agent.getByRole('link', { name: 'Continue shopping ↗' }).click()
  await agent.waitForURL(/\/bestbuy\/?$/)
  await agent.locator('script[src="/dashboard/recorder.js"]').waitFor({ state: 'attached' })
  assert.equal(await agent.evaluate(() => 'rrwebRecord' in window), false)
  await agent.mouse.move(200, 300)
  await agent.mouse.wheel(0, 600)
  await agent.locator('input[name="st"], input[type="search"]').first().fill('REPLAY_SEARCH_VISIBLE')
  // A card field added after load is recorded as a change and still masked.
  await agent.evaluate(() => { const input = document.createElement('input'); input.autocomplete = 'cc-number'; input.id = 'replay-card'; document.body.append(input) })
  await agent.locator('#replay-card').fill('4111111111111111')
  await agent.goto(`${origin}/bestbuy/identity/global/signin`)
  await agent.locator('input[type="email"]').fill('replay-email@example.test')
  await agent.getByRole('button', { name: 'Continue', exact: true }).click()
  await agent.locator('input[type="password"]').fill('REPLAY_PASSWORD_CANARY')
  await agent.locator('input[type="password"]').press('Tab')
  await agent.waitForTimeout(1500)
  let replay
  for (let retry = 0; retry < 60; retry++) {
    replay = await manager.getReplay(run.id, attempt.id, (await manager.getTarget(attempt.token)).trialId)
    const text = JSON.stringify(replayEvents(replay.chunks))
    if (new Set(replay.chunks.map(chunk => chunk.page_id)).size >= 2 && text.includes('replay-email@example.test')) break
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  const events = replayEvents(replay.chunks), text = JSON.stringify(events)
  assert.ok(events.filter(event => event.type === 2).length >= 2, 'each page load records a full snapshot')
  assert.ok(events.some(event => event.type === 3 && event.data?.source === 1), 'pointer movement is recorded')
  assert.ok(events.some(event => event.type === 3 && event.data?.source === 3), 'scrolling is recorded')
  assert.match(text, /REPLAY_SEARCH_VISIBLE/)
  assert.match(text, /replay-email@example\.test/)
  assert.doesNotMatch(text, /REPLAY_PASSWORD_CANARY|4111111111111111/)
  assert.doesNotMatch(text, new RegExp(attempt.token))
  await manager.finishTask(attempt.token, { outcome: 'not_purchased', reason: 'budget_exceeded', message: 'Replay check.' })

  const operator = await browser.newPage({ viewport: { width: 1365, height: 1000 } })
  operator.on('pageerror', error => errors.push(error.message))
  await operator.goto(`${origin}/dashboard#/runs/${run.id}`)
  await operator.getByRole('button', { name: 'View traversal', exact: true }).click()
  await operator.locator('#traversal-dialog').waitFor()
  await operator.getByRole('button', { name: 'Watch replay', exact: true }).click()
  await operator.locator('#replay-dialog .rr-player').waitFor()
  await operator.locator('#replay-dialog .replayer-wrapper iframe').waitFor({ state: 'attached' })
  assert.match(await operator.locator('#replay-dialog .replay-status').textContent(), /^\d+m \d+s recorded · [2-9] page loads$/)
  if (process.env.REPLAY_SCREENSHOT) await operator.screenshot({ path: process.env.REPLAY_SCREENSHOT })
  await operator.keyboard.press('Escape')
  assert.deepEqual(errors, [])
})
