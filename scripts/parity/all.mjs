#!/usr/bin/env node
// Run the parity scorecard for every store that has research/parity/<slug>.json.
import { readdirSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
const dir = new URL('../../research/parity/', import.meta.url)
const slugs = readdirSync(dir).filter(f => f.endsWith('.json')).map(f => f.slice(0, -5)).sort()
let failed = 0
for (const slug of slugs) {
  const run = spawnSync(process.execPath, [new URL('./check.mjs', import.meta.url).pathname, slug, '--json'], { encoding: 'utf8' })
  try {
    const r = JSON.parse(run.stdout)
    if (!r.ok) failed++
    console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${slug.padEnd(20)} ${String(r.score).padStart(5)}%  ${String(r.passed).padStart(3)}/${String(r.total).padEnd(4)} broken links: ${r.broken_links}  pages crawled: ${r.crawled}`)
  } catch { failed++; console.log(`ERROR ${slug}\n${run.stderr}`) }
}
process.exit(failed ? 1 : 0)
