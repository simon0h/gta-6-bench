// Chat about one run on the operator dashboard. Each question sends Claude the
// run's results (the same data as the AI summary) and gives it one tool to look
// up a single task's click path. The chat only reads results; it never changes
// grades, and agents never see it.
import Anthropic from '@anthropic-ai/sdk'
import { SUMMARY_MODEL, agentLabels, claudeError, taskName } from './ai-summary.js'

export const CHAT_HEADER = 'x-benchmark-chat-run'
export const CHAT_LIMITS = { question: 2000, questions: 30, bytes: 1_500_000, rounds: 6, pathLines: 400 }
const BETAS = ['server-side-fallback-2026-07-01', 'thinking-binding-controls-2026-08-01']
const fail = (message, status) => Object.assign(new Error(message), { status })

const SYSTEM = `You answer questions on the run page of an AI agent benchmark dashboard.

The benchmark: AI shopping agents use copies of real store websites (Best Buy, GAME UK, Rockstar Store and others) to pre-order Grand Theft Auto VI for a given address, card and spending limit. Some tasks should end in a purchase. Others should end with the agent refusing, for example when the cheapest total is 1 cent over the limit or the store does not sell the requested edition. A fixed grader has already marked each task passed, failed or environment error (a problem with the test setup, not the agent's fault). You cannot change results.

The user's messages include the run's results as JSON. A later message may carry updated results; always use the newest copy. To see what an agent actually did on one task (pages opened, buttons clicked, forms sent), call get_click_path with the agent's label and the task id exactly as they appear in the results. Only call it when the question needs it. Click paths show page addresses and button names, not what was typed.

The person asking runs the benchmark. Answer in plain, simple English, like a helpful colleague. No buzzwords. Be short: a few sentences, or a short list using "- " bullets. No headings or tables. Use real numbers and write task ids exactly as they appear in the results, so the page can link them. Only state what the data shows, and say when it does not answer the question.`

const TOOL = {
  name: 'get_click_path',
  description: 'Get the click path for one task an agent did in this run: the pages it opened, buttons it clicked and forms it sent, with seconds since the task started. Returns plain text lines.',
  eager_input_streaming: true,
  input_schema: {
    type: 'object', additionalProperties: false, required: ['agent', 'task'],
    properties: {
      agent: { type: 'string', description: 'The agent label exactly as in the run results, for example "Muse" or "Muse (URL 2)".' },
      task: { type: 'string', description: 'The task id exactly as in the run results.' },
    },
  },
}

/** Where each agent's task lives, so the host can read its click path. Keyed
 * by the task as the run data names it (the id, or a dashboard task's name).
 * Not sent to Claude. */
export function chatLookup(run) {
  const attempts = Array.isArray(run?.attempts) ? run.attempts : []
  const names = agentLabels(attempts)
  return Object.fromEntries(attempts.map((attempt, index) => [names[index], Object.fromEntries((attempt.trials || [])
    .filter(trial => trial.status === 'completed').map(trial => [taskName(run, trial.task_id), { attempt_id: attempt.id, trial_id: trial.id }]))]))
}

/** Traversal events as short readable lines. Typed values are never recorded. */
export function clickPathText(events) {
  const lines = []
  for (const event of Array.isArray(events) ? events : []) {
    const at = `+${Math.round((event.elapsed_ms || 0) / 1000)}s`
    const label = event.label ? ` "${event.label}"` : ''
    if (event.kind === 'start') lines.push(`${at} started the task`)
    else if (event.kind === 'page') lines.push(`${at} opened ${event.path || 'a page'}`)
    else if (event.kind === 'click') lines.push(`${at} clicked${label || ' something'}${event.path ? ` on ${event.path}` : ''}`)
    else if (event.kind === 'change') lines.push(`${at} filled in${label || ' a field'}`)
    else if (event.kind === 'submit') lines.push(`${at} sent form${label}${event.path ? ` on ${event.path}` : ''}`)
    else if (event.kind === 'navigation' && event.navigation === 'back_forward') lines.push(`${at} went back or forward`)
    else if (event.kind === 'navigation' && event.navigation === 'reload') lines.push(`${at} reloaded the page`)
    else if (event.kind === 'request' && ((event.method && event.method !== 'GET') || event.status >= 400)) lines.push(`${at} ${event.method || 'GET'} ${event.path || ''} answered ${event.status ?? '?'}`)
    else if (event.kind === 'complete') lines.push(`${at} submitted its result`)
  }
  if (!lines.length) return 'No click path was recorded for this task.'
  const max = CHAT_LIMITS.pathLines
  if (lines.length <= max) return lines.join('\n')
  const head = lines.slice(0, 150), tail = lines.slice(-(max - 150))
  return [...head, `... ${lines.length - max} steps left out ...`, ...tail].join('\n')
}

/** What the run page receives. */
export function chatView({ configured, chat }) {
  const messages = chat?.display ?? []
  return { configured: Boolean(configured), messages, full: chatFull(chat) }
}
export const chatFull = chat => Boolean(chat && (chat.display.filter(item => item.role === 'user').length >= CHAT_LIMITS.questions
  || JSON.stringify(chat.messages).length > CHAT_LIMITS.bytes))

export function validQuestion(value) {
  const question = typeof value === 'string' ? value.trim() : ''
  if (!question) throw fail('Type a question first.', 400)
  if (question.length > CHAT_LIMITS.question) throw fail(`Keep questions under ${CHAT_LIMITS.question} characters.`, 400)
  return question
}

/** One question and answer. The history only ever grows, so Claude's earlier
 * reasoning stays valid. Returns the updated chat to save. */
export async function runChat({ apiKey, client = new Anthropic({ apiKey, timeout: 180_000, maxRetries: 1 }), chat, input, inputKey, question, readClickPath, onText }) {
  const messages = [...(chat?.messages ?? [])]
  const content = []
  if (chat?.input_key !== inputKey) content.push({ type: 'text', text: `${chat ? 'Updated run results' : 'Run results'} as JSON:\n${JSON.stringify(input)}` })
  content.push({ type: 'text', text: question })
  messages.push({ role: 'user', content })
  let reply = ''
  for (let round = 0; round < CHAT_LIMITS.rounds; round++) {
    let message
    try {
      const stream = client.beta.messages.stream({
        model: SUMMARY_MODEL, max_tokens: 16000, betas: BETAS, fallbacks: 'default',
        thinking: { type: 'adaptive', block_binding: { prefix_mismatch_behavior: 'drop_block' } },
        output_config: { effort: 'medium' }, cache_control: { type: 'ephemeral' },
        system: SYSTEM, tools: [TOOL], messages,
        // The last round must answer, so its tool calls never go unanswered.
        ...(round === CHAT_LIMITS.rounds - 1 ? { tool_choice: { type: 'none' } } : {}),
      })
      stream.on('text', delta => {
        if (!reply.length && delta.trim() === '') return
        reply += delta; onText?.(delta)
      })
      message = await stream.finalMessage()
    } catch (error) { throw claudeError(error) }
    if (message.stop_reason === 'refusal') throw fail('Claude declined to answer that.', 502)
    messages.push({ role: 'assistant', content: message.content })
    const calls = message.content.filter(block => block.type === 'tool_use')
    if (message.stop_reason !== 'tool_use' || !calls.length) break
    const results = []
    for (const call of calls) {
      const valid = call.name === TOOL.name && typeof call.input?.agent === 'string' && typeof call.input?.task === 'string'
      let text = 'Ask with an agent label and a task id exactly as they appear in the run results.'
      if (valid) {
        const events = await readClickPath(call.input.agent, call.input.task)
        text = events ? clickPathText(events) : `No finished task ${call.input.task} for ${call.input.agent} in this run.`
      }
      results.push({ type: 'tool_result', tool_use_id: call.id, content: text, ...(valid ? {} : { is_error: true }) })
    }
    messages.push({ role: 'user', content: results })
    if (reply && !reply.endsWith('\n')) { reply += '\n\n'; onText?.('\n\n') }
  }
  if (!reply.trim()) throw fail('Claude did not write an answer. Try asking again.', 502)
  const at = new Date().toISOString()
  return { input_key: inputKey, messages, display: [...(chat?.display ?? []), { role: 'user', text: question, at }, { role: 'assistant', text: reply.trim(), at }] }
}

/** Streams one answer as lines of JSON: {type:'text'} pieces, then {type:'done'}
 * with the saved messages, or {type:'error'}. Used by the Worker and locally. */
export function chatStream({ save, finish = () => {}, ...options }) {
  const encoder = new TextEncoder()
  return new ReadableStream({
    async start(controller) {
      const send = value => controller.enqueue(encoder.encode(`${JSON.stringify(value)}\n`))
      try {
        const chat = await runChat({ ...options, onText: text => send({ type: 'text', text }) })
        await save(chat)
        send({ type: 'done', ...chatView({ configured: true, chat }) })
      } catch (error) {
        send({ type: 'error', error: error.status ? error.message : 'Could not answer. Try again.' })
      } finally {
        finish()
        controller.close()
      }
    },
  })
}
