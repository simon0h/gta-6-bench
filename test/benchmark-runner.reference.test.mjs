import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { runSuite } from '../benchmark/runner.js'
import { getTask } from '../benchmark/tasks.js'

// These checks need an installed Chromium; ordinary npm test skips browser work.
test('runner keeps failure evidence and separates agent failures from environment failures', { skip: process.env.RUN_BROWSER_TESTS !== '1', timeout: 120_000 }, async t => {
  const directory = await mkdtemp(path.join(tmpdir(), 'gta-benchmark-runner-'))
  t.after(() => rm(directory, { recursive: true, force: true }))
  const outputDirectory = path.join(directory, 'report')
  const original = getTask('bestbuy-purchase-ps5')
  const tasks = [
    { ...original, id: 'runner-public-contract', timeout_ms: 10_000 },
    { ...original, id: 'runner-adapter-failure', timeout_ms: 10_000 },
    { ...original, id: 'runner-timeout', timeout_ms: 1200 },
    { ...original, id: 'runner-missing-store', store: 'missing-store', timeout_ms: 10_000 },
  ]
  const observations = { inputs: [], apiStatuses: null, externalBlocked: false, timeoutNavigated: false, timeoutAborted: false }
  let invocation = 0
  const adapter = async ({ page, task, startUrl, recordAction, signal }) => {
    const scenario = invocation++
    observations.inputs.push(structuredClone(task))
    await page.goto(startUrl, { waitUntil: 'domcontentloaded' })
    recordAction({ type: 'adapter-navigation', description: 'Opened the assigned local storefront' })
    if (scenario === 0) {
      observations.apiStatuses = await page.evaluate(async () => {
        const endpoints = ['/api/stores', '/api/catalog', '/api/orders', '/api/captcha', '/api/health']
        const statuses = await Promise.all(endpoints.map(endpoint => fetch(endpoint).then(response => response.status)))
        statuses.push(await fetch('/api/orders?run=override', { method: 'DELETE' }).then(response => response.status))
        return statuses
      })
      observations.externalBlocked = await page.evaluate(async () => {
        try { await fetch('https://example.invalid/benchmark-network-probe'); return false }
        catch { return true }
      })
      return { finalResponse: { outcome: 'not_purchased', reason: 'not_attempted', message: 'Only inspected the assigned storefront.' }, metrics: { cost_usd: .01, input_tokens: 10, output_tokens: 5 } }
    }
    if (scenario === 1) throw new Error('Intentional adapter integration failure')
    observations.timeoutNavigated = true
    signal.addEventListener('abort', () => { observations.timeoutAborted = true }, { once: true })
    await new Promise(() => {}) // No timers or mutations continue after timeout.
  }
  const report = await runSuite({ tasks, outputDirectory, adapter, agentLabel: 'runner-integration-adapter' })
  const [contract, failure, timeout, missing] = report.results

  await t.test('the adapter receives an opaque public task with no evaluator labels', () => {
    assert.equal(observations.inputs.length, 3, 'an unavailable environment must never invoke its adapter')
    for (let index = 0; index < observations.inputs.length; index++) {
      const input = observations.inputs[index]
      assert.deepEqual(Object.keys(input).sort(), ['id', 'instruction', 'request', 'store', 'timeout_ms', 'version'])
      assert.match(input.id, /^[a-f0-9]{16}$/)
      assert.notEqual(input.id, tasks[index].id)
      assert.equal('expected' in input, false)
      assert.equal('family' in input, false)
      assert.equal('split' in input, false)
      assert.deepEqual(input.request, original.request)
    }
  })

  await t.test('browser requests cannot read evaluator APIs or leave the run origin', async () => {
    assert.deepEqual(observations.apiStatuses, [404, 404, 404, 404, 404, 404])
    assert.equal(observations.externalBlocked, true)
    assert.equal(contract.environment_error, null)
    assert.equal(contract.agent_error, null)
    const actions = JSON.parse(await readFile(path.join(outputDirectory, contract.artifact_directory, 'actions.json'), 'utf8'))
    assert.ok(actions.blocked_requests.some(request => request.url === 'https://example.invalid/benchmark-network-probe' && request.method === 'GET'), 'the runner route must record the blocked request before it reaches a network')
    assert.ok(actions.actions.some(action => action.type === 'adapter-navigation'))
    assert.deepEqual(contract.metrics, { cost_usd: .01, input_tokens: 10, output_tokens: 5 })
  })

  await t.test('adapter exceptions produce ordinary failed trials with screenshot and trace evidence', async () => {
    assert.equal(failure.grade.status, 'failed')
    assert.equal(failure.environment_error, null)
    assert.match(failure.agent_error, /Intentional adapter integration failure/)
    assert.ok(failure.grade.reasons.some(reason => reason.code === 'agent_error'))
    assert.equal(failure.artifacts.screenshot, true)
    assert.equal(failure.artifacts.trace, true)
    const screenshot = await readFile(path.join(outputDirectory, failure.artifact_directory, 'final.png'))
    const trace = await readFile(path.join(outputDirectory, failure.artifact_directory, 'trace.zip'))
    assert.deepEqual([...screenshot.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10])
    assert.equal(trace.subarray(0, 2).toString(), 'PK')
    const stored = JSON.parse(await readFile(path.join(outputDirectory, failure.artifact_directory, 'result.json'), 'utf8'))
    assert.deepEqual(stored, failure)
  })

  await t.test('task timeout aborts the adapter and stays distinct from an environment failure', () => {
    assert.equal(observations.timeoutNavigated, true)
    assert.equal(observations.timeoutAborted, true)
    assert.equal(timeout.grade.status, 'failed')
    assert.equal(timeout.environment_error, null)
    assert.match(timeout.agent_error, /Task exceeded 1200ms/)
    assert.ok(timeout.grade.reasons.some(reason => reason.code === 'timed_out'))
    assert.equal(timeout.artifacts.screenshot, true)
    assert.equal(timeout.artifacts.trace, true)
  })

  await t.test('missing stores become environment errors excluded from the success denominator', () => {
    assert.equal(missing.grade.status, 'environment_error')
    assert.match(missing.environment_error, /Required benchmark store is missing: missing-store/)
    assert.equal(missing.agent_error, null)
    assert.deepEqual(missing.artifacts, { trace: false, screenshot: false })
    assert.equal(report.summary.trials, 4)
    assert.equal(report.summary.valid_trials, 3)
    assert.equal(report.summary.environment_errors, 1)
    assert.equal(report.summary.failed, 3)
  })

  await t.test('JSON and HTML reports survive failures and output directories cannot be reused', async () => {
    const filename = path.join(outputDirectory, 'report.json')
    const contents = await readFile(filename, 'utf8')
    assert.deepEqual(JSON.parse(contents), report)
    const html = await readFile(path.join(outputDirectory, 'index.html'), 'utf8')
    assert.match(html, /runner-integration-adapter/)
    assert.match(html, /Intentional adapter integration failure/)
    assert.match(html, /runner-timeout/)
    assert.match(html, /runner-missing-store/)
    assert.match(html, /trace\.zip/)
    await assert.rejects(runSuite({ tasks: [original], outputDirectory, adapter }), /EEXIST|already exists/i)
    assert.equal(await readFile(filename, 'utf8'), contents)
  })
})
