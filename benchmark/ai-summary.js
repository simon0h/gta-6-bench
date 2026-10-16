// AI run summary for the operator dashboard. Claude reads a run's graded
// results (never the task manifest's secrets or the agents' pages) and writes
// a short plain-language summary. It never changes grading, and agents never
// see it: the endpoints sit behind operator sign-in.
import Anthropic from '@anthropic-ai/sdk'

export const SUMMARY_MODEL = 'claude-opus-5-5'
export const SUMMARY_HEADER = 'x-benchmark-summary-run'
const AGENT_NAMES = { grokbot: 'Grokbot', dots: 'Dots', muse: 'Muse' }
const FAMILY_NAMES = {
  purchase: 'normal buy', quantity: 'buy 2 copies', address_detail: 'apartment address',
  budget_boundary: 'exact-budget buy', budget_decline: 'budget 1 cent short (should refuse)',
  unsupported_variant: 'edition not sold (should refuse)', custom: 'task written in the dashboard',
}
const MAX_TEXT = 300
const clean = (value, limit = MAX_TEXT) => typeof value === 'string'
  ? value.replace(/\b(?:\d[ -]?){12,19}\b/g, '[card number]').replace(/\s+/g, ' ').trim().slice(0, limit)
  : ''
const lines = value => Array.isArray(value) ? value.map(line => clean(line)).filter(Boolean).slice(0, 12) : []
const seconds = ms => Number.isFinite(ms) ? Math.round(ms / 1000) : null

/** Agent labels as the dashboard shows them; repeats get their URL number. */
function labels(attempts) {
  const counts = {}
  for (const attempt of attempts) counts[attempt.agent] = (counts[attempt.agent] || 0) + 1
  return attempts.map((attempt, index) => {
    const name = AGENT_NAMES[attempt.agent] || clean(attempt.agent, 40) || 'Agent'
    return counts[attempt.agent] > 1 ? `${name} (URL ${index + 1})` : name
  })
}

/** The compact, sanitized run data Claude reads. Passed tasks are one line;
 * tasks that did not pass carry expected/actual output and failure reasons. */
export function summaryInput(run) {
  const attempts = Array.isArray(run?.attempts) ? run.attempts : []
  const names = labels(attempts)
  return {
    run: { name: clean(run?.name, 120), task_set: run?.suite === 'all240' ? 'All 240 tasks' : run?.suite === 'custom' ? 'Tasks written in the dashboard' : 'Original 30 tasks', tasks_per_agent: run?.task_ids?.length ?? null },
    agents: attempts.map((attempt, index) => {
      const results = (attempt.trials || []).filter(trial => trial.status === 'completed' && trial.result)
      const count = status => results.filter(trial => trial.result.grade?.status === status).length
      const timed = results.map(trial => trial.result.elapsed_ms).filter(Number.isFinite)
      return {
        label: names[index], agent: attempt.agent,
        tags: (attempt.tags || []).map(tag => clean(tag, 40)), operator_comments: clean(attempt.comments),
        finished: results.length, total: attempt.total ?? null,
        passed: count('passed'), failed: count('failed'), environment_errors: count('environment_error'),
        total_seconds: timed.length ? seconds(timed.reduce((sum, ms) => sum + ms, 0)) : null,
        tasks: results.map(trial => {
          const result = trial.result, status = result.grade?.status ?? 'unknown'
          const name = run?.tasks?.find(item => item.id === trial.task_id)?.name
          const task = { task: name ? clean(name, 80) : trial.task_id, store: result.store, type: FAMILY_NAMES[result.family] || result.family, result: status, seconds: seconds(result.elapsed_ms) }
          if (status === 'passed') return task
          return { ...task, expected: lines(result.expected_output), actual: lines(result.actual_output),
            failure_reasons: lines(result.failure_reasons?.length ? result.failure_reasons : (result.grade?.reasons || []).map(reason => reason.message)) }
        }),
      }
    }),
  }
}

/** A fingerprint of the input, so the page can say when new results arrived. */
export async function summaryKey(input) {
  const bytes = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(input))))
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')
}
export const finishedCount = input => input.agents.reduce((sum, agent) => sum + agent.finished, 0)

const SYSTEM = `You write the summary at the top of a run page on an AI agent benchmark dashboard.

The benchmark: AI shopping agents use copies of real store websites (Best Buy, GAME UK, Rockstar Store and others) to pre-order Grand Theft Auto VI for a given address, card and spending limit. Some tasks should end in a purchase. Others should end with the agent refusing, for example when the cheapest total is 1 cent over the limit or the store does not sell the requested edition. A fixed grader has already marked each task passed, failed or environment error (a problem with the test setup, not the agent's fault). You never change those results.

The person reading this runs the benchmark. Write in plain, simple English, like a colleague giving a quick update. No buzzwords, no jargon, no hype. Use real numbers and name task types and stores. Only state what the data shows; if there are too few results to see a pattern, say so.

Return:
- overview: 2 to 4 sentences on how the run went overall and how the agents compare.
- agents: one entry per agent, in the order given, using its label exactly. summary is 1 or 2 sentences: how it did, and its biggest weak spot (or that it had none).
- patterns: up to 4 short lines about things worth knowing across the run, such as the same mistake by several agents, very slow tasks, or environment errors. Use an empty list if nothing stands out.`

const SCHEMA = {
  type: 'object', additionalProperties: false, required: ['overview', 'agents', 'patterns'],
  properties: {
    overview: { type: 'string' },
    agents: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['label', 'summary'], properties: { label: { type: 'string' }, summary: { type: 'string' } } } },
    patterns: { type: 'array', items: { type: 'string' } },
  },
}

const fail = (message, status) => Object.assign(new Error(message), { status })

/** Ask Claude for the summary. Returns { overview, agents: [{ label, agent, summary }], patterns }. */
export async function writeRunSummary({ apiKey, input, client = new Anthropic({ apiKey, timeout: 120_000, maxRetries: 1 }) }) {
  let response
  try {
    response = await client.beta.messages.create({
      model: SUMMARY_MODEL,
      max_tokens: 16000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: { effort: 'medium', format: { type: 'json_schema', schema: SCHEMA } },
      system: SYSTEM,
      messages: [{ role: 'user', content: `Run results as JSON:\n${JSON.stringify(input)}` }],
    })
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError || error instanceof Anthropic.PermissionDeniedError) throw fail('Claude rejected the API key. Check the ANTHROPIC_API_KEY secret.', 502)
    if (error instanceof Anthropic.RateLimitError) throw fail('Claude is busy right now. Try again in a minute.', 503)
    if (error instanceof Anthropic.APIError) throw fail('Claude could not write the summary. Try again.', 502)
    throw fail('Could not reach Claude. Try again.', 502)
  }
  if (response.stop_reason === 'refusal') throw fail('Claude declined to summarize this run.', 502)
  const text = response.content.filter(block => block.type === 'text').map(block => block.text).join('')
  let parsed
  try { parsed = JSON.parse(text) } catch { throw fail('Claude returned a summary the dashboard could not read. Try again.', 502) }
  if (typeof parsed?.overview !== 'string' || !Array.isArray(parsed.agents) || !Array.isArray(parsed.patterns)) throw fail('Claude returned a summary the dashboard could not read. Try again.', 502)
  const byLabel = new Map(input.agents.map(agent => [agent.label, agent.agent]))
  return {
    overview: clean(parsed.overview, 2000),
    agents: parsed.agents.filter(item => typeof item?.label === 'string' && typeof item.summary === 'string')
      .map(item => ({ label: clean(item.label, 60), agent: byLabel.get(item.label) ?? null, summary: clean(item.summary, 800) })).slice(0, 10),
    patterns: parsed.patterns.filter(line => typeof line === 'string').map(line => clean(line, 400)).filter(Boolean).slice(0, 4),
  }
}

/** What the run page receives, in local and hosted mode alike. */
export function summaryView({ configured, saved, key, finished }) {
  return {
    configured: Boolean(configured), finished,
    summary: saved?.summary ?? null, written_at: saved?.written_at ?? null,
    written_from: saved?.finished ?? null, stale: Boolean(saved && saved.key !== key),
  }
}
