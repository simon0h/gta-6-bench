import { readFile, writeFile, access } from 'node:fs/promises'
const root = new URL('../research/depth/', import.meta.url)
const read = name => readFile(new URL(name, root), 'utf8').then(JSON.parse)
const ledger = await read('agent-ledger.json')
const baseline = await read('baseline-inventory.json')
const integration = (await read('integration-checks.json')).at(-1)
const previewBase = process.env.DEPTH_PREVIEW_BASE || 'http://127.0.0.1:3106'
const storeLink = slug => `[${slug}](${previewBase}/${slug})`
const escape = value => String(value).replaceAll('|', '\\|').replaceAll('\n', ' ')
const completed = ledger.launched.filter(entry => entry.status === 'complete')
const assignmentsComplete = ledger.stores.length === 20 && ledger.launched.length === 100 &&
  ledger.stores.every(slug => ledger.passes.every(pass =>
    ledger.launched.filter(entry => entry.store === slug && entry.pass === pass && entry.status === 'complete').length === 1))
let report = `# Storefront depth coverage\n\nGenerated ${new Date().toISOString()}.\n\n${ledger.launched.length} distinct subagents launched; ${completed.length} completed. Five assigned passes per retailer: research, catalog/navigation, customer journeys, visual comparison, independent verification. This is a bounded synthetic retail environment, not a percentage claim about recreating an entire live business.\n\n[Run the environments](../../README.md#run) · [Browse the local preview](${previewBase}) · [Original ImageGen assets, saved paths and prompts](ASSETS.md)\n\n| Store | Baseline catalog entries | Current entries | Distinct product families | Verified page families | Status |\n| --- | ---: | ---: | ---: | ---: | --- |\n`
const coverage = [], missing = []
for (const slug of ledger.stores) {
  let store
  try { store = await read(`${slug}-coverage.json`) } catch { missing.push(slug) }
  if (!store) { report += `| ${storeLink(slug)} | ${baseline.products[slug]} | — | — | — | Verification pending |\n`; continue }
  const validCount = value => Number.isInteger(value) && value >= 0
  const validStrings = value => Array.isArray(value) && value.every(item => typeof item === 'string' && item.trim())
  const validFamilies = Array.isArray(store.pageFamilies) && store.pageFamilies.length > 0 && store.pageFamilies.every(family =>
    typeof family.name === 'string' && family.name.trim() && typeof family.route === 'string' && family.route.startsWith(`/${slug}`) &&
    Array.isArray(family.verifiedBy) && family.verifiedBy.length > 0 && family.verifiedBy.every(method => ['http', 'browser'].includes(method)))
  if (store.store !== slug || !validCount(store.catalogEntries) || !validCount(store.distinctProductFamilies) || store.distinctProductFamilies > store.catalogEntries ||
      !validFamilies || !validStrings(store.limitations) || !validStrings(store.journeys) || !validStrings(store.sourceUrls) ||
      !store.tests || typeof store.tests.command !== 'string' || !validCount(store.tests.passed) || !validCount(store.tests.failed)) throw new Error(`Invalid coverage record for ${slug}`)
  coverage.push(store)
  report += `| ${storeLink(slug)} | ${baseline.products[slug]} | ${store.catalogEntries} | ${store.distinctProductFamilies} | ${store.pageFamilies.length} | ${store.tests.failed ? 'Has failures' : 'Store verification complete'} |\n`
}
report += '\nBaseline counts include separately represented game editions in some stores; they are not equivalent to distinct product families. Page-family counts describe routes and flows actually checked, not all possible combinations.\n'
if (integration) report += `\nLatest whole-suite snapshot (${integration.at}): **${integration.passed} passed, ${integration.failed} failed**. Stage: ${integration.stage} See [integration history](integration-checks.json) for earlier snapshots.\n`
if (integration?.log === 'research/depth/integration-final.log') report += '\n[Final whole-suite test output](integration-final.log).\n'
for (const store of coverage) {
  const notes = Array.isArray(store.notes) ? store.notes.map(note => `- ${note}`).join('\n') : store.notes || ''
  const evidence = []
  for (const [stage, label] of [['before', 'Before rebuild'], ['after', 'Current homepage']]) {
    const names = stage === 'after' ? [`${store.store}-after-full.png`, `${store.store}-after-full.jpg`, `${store.store}-after.jpg`, `${store.store}-after.png`] : [`${store.store}-before.jpg`, `${store.store}-before.png`]
    for (const name of names) {
      const relative = `screenshots/${name}`
      if (await access(new URL(relative, root)).then(() => true, () => false)) { evidence.push(`[${label}](${relative})`); break }
    }
  }
  const passes = [['blueprint', 'Public research'], ['catalog', 'Catalog'], ['journeys', 'Customer journeys'], ['visual', 'Visual review'], ['verification', 'Independent verification']]
  const passLinks = passes.map(([pass, label]) => `[${label}](${store.store}-${pass}.md)`).join(' · ')
  report += `\n## ${store.store}\n\n[Open local storefront](${previewBase}/${store.store})${evidence.length ? ' · ' + evidence.join(' · ') : ''} · [Coverage JSON](${store.store}-coverage.json)\n\n${passLinks}\n\n${notes}\n\n| Page family | Example route | Verification |\n| --- | --- | --- |\n`
  for (const family of store.pageFamilies) report += `| ${escape(family.name)} | \`${escape(family.route)}\` | ${escape(family.verifiedBy.join(', '))} |\n`
  report += `\nVerified journeys:\n\n${store.journeys.map(journey => `- ${journey}`).join('\n')}\n\nStore tests: \`${store.tests.command}\`; ${store.tests.passed} passed, ${store.tests.failed} failed.\n\nRemaining limits:\n\n${store.limitations.map(limit => `- ${limit}`).join('\n')}\n\nResearch: ${store.sourceUrls.map((url, i) => `[Source ${i + 1}](${url})`).join(', ')}.\n`
}
if (missing.length) report += `\nVerification records still pending: ${missing.join(', ')}.\n`
await writeFile(new URL('COVERAGE.md', root), report)
console.log(JSON.stringify({ launched: ledger.launched.length, completed: completed.length, storeRecords: coverage.length, pending: missing }, null, 2))
if (missing.length || !assignmentsComplete || coverage.some(store => store.tests.failed) || !integration || integration.failed !== 0) process.exitCode = 1
