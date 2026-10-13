import { fork } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { randomUUID } from 'node:crypto'

export const BENCHMARK_DATE = '2026-10-07'

/** Private parent/child control channel; the public HTTP server has no grader API. */
export async function startEnvironment({ task, directory, runId = randomUUID(), metadata = {} }) {
  const catalogMode = task.catalog_mode ?? 'reference'
  if (!['reference', 'fixtures'].includes(catalogMode)) throw new Error('Unsupported task catalog mode')
  await mkdir(directory, { recursive: true })
  // A previously used directory is never silently resumed as a fresh trial.
  await writeFile(path.join(directory, 'orders.json'), '[]\n', { flag: 'wx', mode: 0o600 })
  const worker = fork(new URL('./worker.js', import.meta.url), [], {
    env: { ...process.env, CATALOG_MODE: catalogMode, CAPTCHA_MODE: 'off', CAPTCHA_STORES: '', BENCHMARK_DATE },
    execArgv: [], stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
  })
  let stderr = '', stdout = '', sequence = 0, closed = false
  const pending = new Map()
  worker.stderr.on('data', chunk => { stderr = (stderr + chunk).slice(-32_000) })
  worker.stdout.on('data', chunk => { stdout = (stdout + chunk).slice(-32_000) })
  const failPending = error => {
    for (const entry of pending.values()) { clearTimeout(entry.timer); entry.reject(error) }
    pending.clear()
  }
  worker.on('error', failPending)
  worker.on('exit', (code, signal) => {
    closed = true
    failPending(new Error(`Environment exited (${code ?? signal})${stderr ? ': ' + stderr : ''}`))
  })
  worker.on('message', message => {
    const entry = pending.get(message.id)
    if (!entry) return
    pending.delete(message.id)
    clearTimeout(entry.timer)
    if (message.error) entry.reject(new Error(message.error))
    else entry.resolve(message)
  })
  function request(type, data = {}, timeoutMs = 30_000) {
    if (closed || !worker.connected) return Promise.reject(new Error('Environment is closed'))
    const id = ++sequence
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { pending.delete(id); reject(new Error(`Environment ${type} timed out`)) }, timeoutMs)
      pending.set(id, { resolve, reject, timer })
      worker.send({ id, type, ...data }, error => {
        if (error) { clearTimeout(timer); pending.delete(id); reject(error) }
      })
    })
  }
  async function close() {
    if (!closed) {
      try { await request('stop', {}, 3000) } catch { worker.kill('SIGKILL') }
    }
  }
  try {
    const ready = await request('start', {
      runId, store: task.store, scenario: task.scenario, ordersFile: path.join(directory, 'orders.json'),
      metadata: { ...metadata, run_id: runId, task_id: task.id, task_version: task.version, catalog_mode: catalogMode, benchmark_date: BENCHMARK_DATE },
    })
    return {
      runId, baseUrl: ready.baseUrl, startUrl: ready.baseUrl + '/' + task.store,
      snapshot: (finish = false) => request('snapshot', { finish }), close,
      logs: () => ({ stdout, stderr }),
    }
  } catch (error) {
    await close()
    throw error
  }
}
