// Root orchestration bookkeeping. Run only after the corresponding actual
// collaboration-tool launch/completion; entries are not planned agents.
import { readFile, writeFile } from 'node:fs/promises'
const file = new URL('../research/depth/agent-ledger.json', import.meta.url)
const ledger = JSON.parse(await readFile(file, 'utf8'))
const [action, idText, store, pass, task] = process.argv.slice(2)
const id = Number(idText)
if (action === 'launch') {
  if (id !== ledger.launched.length + 1) throw new Error('Use the next sequential actual launch number')
  if (!ledger.stores.includes(store) || !ledger.passes.includes(pass)) throw new Error('Unknown store or pass')
  if (!task || ledger.launched.some(entry => entry.task === task || entry.store === store && entry.pass === pass)) throw new Error('Duplicate or missing assignment')
  ledger.launched.push({ id, store, pass, task, status: 'running', launchedAt: new Date().toISOString() })
} else if (action === 'complete') {
  const entry = ledger.launched.find(entry => entry.id === id)
  if (!entry) throw new Error('No such launched agent')
  entry.status = 'complete'
  entry.completedAt = new Date().toISOString()
} else if (action !== 'status') throw new Error('Usage: depth-ledger.mjs launch ID STORE PASS TASK | complete ID | status')
if (action !== 'status') await writeFile(file, JSON.stringify(ledger, null, 2) + '\n')
console.log(JSON.stringify({ launched: ledger.launched.length, complete: ledger.launched.filter(entry => entry.status === 'complete').length, running: ledger.launched.filter(entry => entry.status === 'running').map(entry => entry.task), remainingLaunches: ledger.requested_subagents - ledger.launched.length }, null, 2))
