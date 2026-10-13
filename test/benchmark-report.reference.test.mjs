import test from 'node:test'
import assert from 'node:assert/strict'
import { summarize, confidenceInterval, renderReport } from '../benchmark/report.js'

function trial(status = 'passed', overrides = {}) {
  return {
    task_id: 'example-task', repeat: 1, store: 'bestbuy', family: 'purchase', split: 'development',
    elapsed_ms: 1000, metrics: null, artifact_directory: 'runs/example-task-1', artifacts: { screenshot: true, trace: true },
    grade: { status, success: status === 'passed', reasons: status === 'passed' ? [] : [{ code: status === 'environment_error' ? 'environment_error' : 'wrong_item', message: 'An example failure.' }] },
    ...overrides,
  }
}

test('environment failures are excluded from success denominators and valid trial durations in every group', () => {
  const results = [
    trial('passed', { elapsed_ms: 1000 }),
    trial('failed', { elapsed_ms: 3000, split: 'validation' }),
    trial('environment_error', { elapsed_ms: 999000, store: 'game-uk', family: 'budget_decline', split: 'validation' }),
  ]
  const summary = summarize(results)
  assert.equal(summary.trials, 3)
  assert.equal(summary.valid_trials, 2)
  assert.equal(summary.passed, 1)
  assert.equal(summary.failed, 1)
  assert.equal(summary.environment_errors, 1)
  assert.equal(summary.success_rate, .5)
  assert.equal(summary.mean_elapsed_ms, 2000)
  assert.equal(summary.by_store.bestbuy.success_rate, .5)
  assert.equal(summary.by_store['game-uk'].success_rate, null)
  assert.equal(summary.by_family.budget_decline.valid_trials, 0)
  assert.equal(summary.by_split.validation.trials, 2)
  assert.equal(summary.by_split.validation.valid_trials, 1)
  assert.equal(summary.by_split.validation.success_rate, 0)
  assert.equal(summary.failure_reasons.wrong_item, 1)
  assert.equal(summary.failure_reasons.environment_error, 1)
  assert.match(summary.interval_note, /correlated/)
})

test('empty and entirely invalid suites report unknown success rather than a fabricated zero rate', () => {
  for (const results of [[], [trial('environment_error')]]) {
    const summary = summarize(results)
    assert.equal(summary.valid_trials, 0)
    assert.equal(summary.success_rate, null)
    assert.equal(summary.confidence_interval_95, null)
    assert.equal(summary.mean_elapsed_ms, null)
    assert.equal(summary.reported_cost_usd, null)
  }
  assert.deepEqual(summarize([]).by_store, {})
})

test('95% Wilson intervals stay bounded, retain uncertainty at endpoints, and narrow with sample size', () => {
  assert.equal(confidenceInterval(0, 0), null)
  const [low, high] = confidenceInterval(5, 10)
  assert.ok(Math.abs(low - .236593090512564) < 1e-12)
  assert.ok(Math.abs(high - .763406909487436) < 1e-12)
  const none = confidenceInterval(0, 10), all = confidenceInterval(10, 10)
  assert.ok(none[0] >= 0 && none[0] < 1e-12)
  assert.ok(none[1] > 0 && none[1] < 1)
  assert.ok(all[0] > 0 && all[0] < 1)
  assert.ok(all[1] <= 1 && all[1] > 1 - 1e-12)
  const larger = confidenceInterval(50, 100)
  assert.ok(larger[0] > low && larger[1] < high)
  assert.deepEqual(summarize([trial('passed'), trial('failed'), trial('environment_error')]).confidence_interval_95, confidenceInterval(1, 2))
})

test('cost reporting distinguishes absent costs from explicit zero and states partial coverage', () => {
  const missing = summarize([trial('passed'), trial('failed')])
  assert.equal(missing.reported_cost_usd, null)
  assert.equal(missing.trials_with_reported_cost, 0)
  const free = summarize([trial('passed', { metrics: { cost_usd: 0 } })])
  assert.equal(free.reported_cost_usd, 0)
  assert.equal(free.trials_with_reported_cost, 1)
  const mixed = summarize([
    trial('passed', { metrics: { cost_usd: 0 } }),
    trial('failed', { metrics: { cost_usd: .25 } }),
    trial('passed', { metrics: { input_tokens: 10 } }),
    trial('environment_error', { metrics: { cost_usd: 99 } }),
  ])
  assert.equal(mixed.reported_cost_usd, .25)
  assert.equal(mixed.trials_with_reported_cost, 2)
  assert.equal(mixed.valid_trials, 3)
})

test('report HTML escapes agent, task, family, failure, fingerprint and artifact attribute text', () => {
  const attack = '<script>alert("x")</script>&\'value'
  const item = trial('failed', {
    task_id: attack, family: attack, artifact_directory: 'runs/" onmouseover="attack',
    grade: { status: 'failed', success: false, reasons: [{ code: 'wrong_item', message: attack }] },
  })
  const html = renderReport({ agent: attack, suite_version: attack, created_at: attack, environment: { environment_sha256: attack }, results: [item], summary: summarize([item]) })
  assert.equal(html.includes('<script>'), false)
  assert.ok(html.includes('&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;&amp;&#39;value'))
  assert.equal(html.includes('href="runs/" onmouseover='), false)
  assert.ok(html.includes('href="runs/&quot; onmouseover=&quot;attack/result.json"'))
  assert.ok(html.includes('/final.png'))
  assert.ok(html.includes('/trace.zip'))
  assert.match(html, /0\/1 valid trials/)
})

test('report renders unknown success and omits links for unavailable browser artifacts', () => {
  const item = trial('environment_error', { artifacts: { screenshot: false, trace: false } })
  const html = renderReport({ agent: 'example', suite_version: 'v1', created_at: '2026-10-07', environment: { environment_sha256: 'abc' }, results: [item], summary: summarize([item]) })
  assert.ok(html.includes('— success'))
  assert.ok(html.includes('1 environment errors excluded'))
  assert.equal(/href="[^"]*\/final\.png"/.test(html), false)
  assert.equal(/href="[^"]*\/trace\.zip"/.test(html), false)
})
