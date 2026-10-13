import { readdirSync } from 'node:fs'
import { spawnSync } from 'node:child_process'

const files = readdirSync(new URL('../test/', import.meta.url))
for (const mode of ['reference', 'fixtures']) {
  const suffix = mode === 'reference' ? '.reference.test.mjs' : '.test.js'
  const tests = files.filter(file => file.endsWith(suffix)).sort().map(file => `test/${file}`)
  if (!tests.length) throw new Error(`No tests for ${mode} catalog mode`)
  console.log(`\nCatalog mode: ${mode}`)
  const run = spawnSync(process.execPath, ['--test', ...tests], {
    cwd: new URL('../', import.meta.url), stdio: 'inherit',
    env: { ...process.env, CATALOG_MODE: mode },
  })
  if (run.error) throw run.error
  if (run.status !== 0) process.exit(run.status || 1)
}
