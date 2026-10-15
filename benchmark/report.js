import { createHash } from 'node:crypto'
import { readFile, readdir, writeFile, rename, mkdir } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
export async function writeJson(filename, value) {
  await mkdir(path.dirname(filename), { recursive: true })
  const temporary = filename + '.tmp'
  await writeFile(temporary, JSON.stringify(value, null, 2) + '\n', { mode: 0o600 })
  await rename(temporary, filename)
}

export async function environmentFingerprint() {
  const hash = createHash('sha256')
  let fileCount = 0
  async function add(relative) {
    const absolute = path.join(root, relative)
    const entries = await readdir(absolute, { withFileTypes: true })
    for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      const name = path.posix.join(relative, entry.name)
      if (entry.isDirectory()) await add(name)
      else if (entry.isFile()) {
        hash.update(name + '\0').update(await readFile(path.join(root, name))).update('\0')
        fileCount++
      }
    }
  }
  for (const name of ['app.js', 'server.js', 'package.json', 'package-lock.json']) {
    hash.update(name + '\0').update(await readFile(path.join(root, name))).update('\0')
    fileCount++
  }
  for (const folder of ['benchmark', 'lib', 'stores', 'public']) await add(folder)
  let revision = null, dirty = null
  try {
    revision = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
    dirty = Boolean(execFileSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim())
  } catch { /* Source archive installations still have a content fingerprint. */ }
  return { git_revision: revision, git_dirty: dirty, environment_sha256: hash.digest('hex'), hashed_files: fileCount, node_version: process.version }
}

// Wilson interval, 95%, for descriptive per-trial success rates.
export function confidenceInterval(successes, total) {
  if (!total) return null
  const z = 1.959963984540054, p = successes / total, denominator = 1 + z * z / total
  const center = (p + z * z / (2 * total)) / denominator
  const margin = z * Math.sqrt(p * (1 - p) / total + z * z / (4 * total * total)) / denominator
  return [Math.max(0, center - margin), Math.min(1, center + margin)]
}

function aggregate(results) {
  const valid = results.filter(result => result.grade.status !== 'environment_error')
  const passed = valid.filter(result => result.grade.success).length
  const durations = valid.map(result => result.elapsed_ms).filter(Number.isFinite)
  return {
    trials: results.length, valid_trials: valid.length, passed, failed: valid.length - passed,
    environment_errors: results.length - valid.length, success_rate: valid.length ? passed / valid.length : null,
    confidence_interval_95: confidenceInterval(passed, valid.length),
    mean_elapsed_ms: durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : null,
    reported_cost_usd: valid.some(r => r.metrics?.cost_usd != null)
      ? valid.reduce((sum, r) => sum + (r.metrics?.cost_usd || 0), 0) : null,
    trials_with_reported_cost: valid.filter(r => r.metrics?.cost_usd != null).length,
  }
}

export function summarize(results) {
  const group = field => Object.fromEntries([...new Set(results.map(r => r[field]))].sort().map(key => [key, aggregate(results.filter(r => r[field] === key))]))
  return {
    ...aggregate(results), by_store: group('store'), by_family: group('family'), by_split: group('split'), by_catalog_mode: group('catalog_mode'),
    interval_note: 'Wilson intervals describe individual trials; repeated trials of the same task are correlated. Do not interpret these as task-generalization confidence intervals.',
    failure_reasons: results.reduce((counts, result) => {
      for (const reason of result.grade.reasons) counts[reason.code] = (counts[reason.code] || 0) + 1
      return counts
    }, {}),
  }
}

export function renderReport(report) {
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char])
  const lines = items => Array.isArray(items) && items.length ? `<ul>${items.map(item => `<li>${esc(item)}</li>`).join('')}</ul>` : '—'
  const percent = value => value == null ? '—' : `${(100 * value).toFixed(1)}%`
  const rows = report.results.map(result => `<tr><td>${esc(result.task_id)}<small>trial ${result.repeat} · ${esc(result.catalog_mode ?? 'reference')} catalog</small></td><td class="${result.grade.status}">${esc(result.grade.status)}</td><td>${lines(result.expected_output)}</td><td>${lines(result.actual_output)}</td><td>${result.grade.status === 'passed' ? 'Passed' : lines(result.failure_reasons?.length ? result.failure_reasons : result.grade.reasons.map(r => r.message))}</td><td>${(result.elapsed_ms / 1000).toFixed(1)}s</td><td><a href="${esc(result.artifact_directory)}/result.json">JSON</a>${result.artifacts.screenshot ? ` · <a href="${esc(result.artifact_directory)}/final.png">Screenshot</a>` : ''}${result.artifacts.trace ? ` · <a href="${esc(result.artifact_directory)}/trace.zip">Trace</a>` : ''}</td></tr>`).join('')
  const groups = Object.entries(report.summary.by_family).map(([name, stats]) => `<tr><td>${esc(name)}</td><td>${stats.passed}/${stats.valid_trials}</td><td>${percent(stats.success_rate)}</td><td>${stats.environment_errors}</td></tr>`).join('')
  const catalogModes = Object.entries(report.summary.by_catalog_mode ?? {}).map(([name, stats]) => `<tr><td>${esc(name)}</td><td>${stats.passed}/${stats.valid_trials}</td><td>${percent(stats.success_rate)}</td><td>${stats.environment_errors}</td></tr>`).join('')
  return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Commerce benchmark results</title><style>body{font:15px/1.5 system-ui,sans-serif;max-width:1200px;margin:40px auto;padding:0 24px;background:#f7f8fa;color:#16202c}h1{margin-bottom:6px}small{display:block;color:#637083}table{width:100%;border-collapse:collapse;background:white;margin:20px 0}th,td{text-align:left;padding:12px;border-bottom:1px solid #dce1e8;vertical-align:top}th{background:#e9edf3}.passed{color:#137443}.failed{color:#b12635}.environment_error{color:#875900}a{color:#1458ba}.stat{font-size:32px;font-weight:700}code{overflow-wrap:anywhere}td ul{margin:0;padding-left:18px}</style><h1>Commerce benchmark results</h1><p>${esc(report.agent)} · Suite ${esc(report.suite_version)} · ${esc(report.created_at)}</p><p class="stat">${percent(report.summary.success_rate)} success · ${report.summary.passed}/${report.summary.valid_trials} valid trials</p><p>${report.summary.environment_errors} environment errors excluded from success rate. ${esc(report.summary.interval_note)}</p><p>Scripted baselines validate the environment and grader; they do not measure a model's intelligence. Development and validation tasks are both public.</p><h2>Task families</h2><table><thead><tr><th>Family</th><th>Passed / valid</th><th>Success</th><th>Environment errors</th></tr></thead><tbody>${groups}</tbody></table><h2>Catalog modes</h2><p>Reference catalogs use captured listings; fixture catalogs use authored inventory. All checkouts are local simulations.</p><table><thead><tr><th>Catalog</th><th>Passed / valid</th><th>Success</th><th>Environment errors</th></tr></thead><tbody>${catalogModes}</tbody></table><h2>Trials</h2><table><thead><tr><th>Task</th><th>Outcome</th><th>Expected output</th><th>Actual output</th><th>Failure reason</th><th>Duration</th><th>Evidence</th></tr></thead><tbody>${rows}</tbody></table><p>Source fingerprint: <code>${esc(report.environment.environment_sha256)}</code>. <a href="report.json">Full report and configuration</a>. View trace ZIPs locally with <code>npx playwright show-trace path/to/trace.zip</code>.</p></html>`
}
