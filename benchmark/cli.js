#!/usr/bin/env node
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { tasks, SUITE_VERSION } from './tasks.js'
import { runSuite } from './runner.js'

const help = `Commerce benchmark ${SUITE_VERSION}

  npm run benchmark -- list
  npm run benchmark -- run --baseline reference
  npm run benchmark -- run --baseline noop --repeats 2
  npm run benchmark -- run --store bestbuy --split validation
  npm run benchmark -- run --family payment_recovery
  npm run benchmark -- run --catalog-mode fixtures
  npm run benchmark -- run --task TASK_ID --out data/benchmark/my-run
  npm run benchmark -- run --agent ./my-agent.mjs --agent-label my-agent

Options: --baseline reference|noop, --task ID, --store SLUG, --family FAMILY,
         --catalog-mode reference|fixtures,
         --split development|validation, --repeats 1..100, --out DIRECTORY,
         --agent MODULE, --agent-label LABEL, --headed, --help.

Custom modules export async function run({page,task,startUrl,recordAction,signal}).
Return {outcome:'purchased'|'not_purchased',reason?,message}, or
{finalResponse: {...}, metrics: {cost_usd?,input_tokens?,output_tokens?}}.
Adapters are trusted local code. The page has storefront-only network access.
Exit: 0 all passed; 1 agent/task failures; 2 environment/configuration errors.
`

try {
  const args = process.argv.slice(2)
  if (args.includes('--help') || args.includes('-h')) { console.log(help); process.exit(0) }
  const command = args[0] && !args[0].startsWith('-') ? args.shift() : 'run'
  if (!['run', 'list'].includes(command)) throw new Error(`Unknown command: ${command}`)
  const options = {}
  const valued = new Set(['baseline', 'task', 'store', 'family', 'catalog-mode', 'split', 'repeats', 'out', 'agent', 'agent-label'])
  while (args.length) {
    const flag = args.shift()
    if (flag === '--headed') { options.headed = true; continue }
    const key = flag.startsWith('--') ? flag.slice(2) : ''
    if (!valued.has(key)) throw new Error(`Unknown option: ${flag}`)
    const value = args.shift()
    if (!value || value.startsWith('--')) throw new Error(`Missing value for ${flag}`)
    if (options[key] != null) throw new Error(`Duplicate option: ${flag}`)
    options[key] = value
  }
  if (options.agent && options.baseline) throw new Error('Choose either --agent or --baseline')
  const selected = tasks.filter(task => (!options.task || task.id === options.task) && (!options.store || task.store === options.store) && (!options.family || task.family === options.family) && (!options['catalog-mode'] || (task.catalog_mode ?? 'reference') === options['catalog-mode']) && (!options.split || task.split === options.split))
  if (!selected.length) throw new Error('No tasks match the supplied filters')
  if (command === 'list') {
    for (const task of selected) console.log(`${task.id.padEnd(55)} ${task.split.padEnd(12)} ${(task.catalog_mode ?? 'reference').padEnd(10)} ${task.instruction}`)
  } else {
    const outputDirectory = path.resolve(options.out || `data/benchmark/${new Date().toISOString().replace(/[:.]/g, '-')}-${process.pid}`)
    let adapter, agentConfig, adapterSha256
    if (options.agent) {
      const module = await import(pathToFileURL(path.resolve(options.agent)).href)
      adapter = module.run ?? module.default
      if (typeof adapter !== 'function') throw new Error('Agent module must export a run function')
      agentConfig = module.metadata ?? {}
      adapterSha256 = createHash('sha256').update(await readFile(path.resolve(options.agent))).digest('hex')
    }
    const report = await runSuite({ tasks: selected, outputDirectory,
      baseline: options.baseline || 'reference', adapter, agentLabel: options['agent-label'], agentConfig, adapterSha256,
      repeats: options.repeats == null ? 1 : Number(options.repeats), headless: !options.headed,
      onProgress: event => {
        if (event.phase === 'start') console.log(`Running ${event.task}, trial ${event.repeat}…`)
        else console.log(`  ${event.result.grade.status}: ${event.result.grade.reasons.map(reason => reason.code).join(', ') || 'all requirements satisfied'}`)
      },
    })
    console.log(`${report.summary.passed}/${report.summary.valid_trials} passed; ${report.summary.environment_errors} environment errors`)
    console.log(`Report: ${path.join(outputDirectory, 'index.html')}`)
    process.exitCode = report.summary.environment_errors ? 2 : report.summary.failed ? 1 : 0
  }
} catch (error) {
  console.error(error.stack || error.message)
  process.exitCode = 2
}
