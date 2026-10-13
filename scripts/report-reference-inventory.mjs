import { mkdir, writeFile } from 'node:fs/promises'
import { createApp } from '../app.js'
import { fixtureCatalog } from '../lib/catalog-policy.js'

if (fixtureCatalog) throw new Error('This report requires the default reference catalog mode.')
const app = await createApp({ persist: false, captcha: { mode: 'off' } })
const stores = app.locals.inventories.map(store => {
  const config = app.locals.stores.find(s => s.slug === store.slug)
  const observations = config?.catalog_observations || []
  return { ...store, availability_status: config?.availability_status,
    simulated_purchase_count: store.inventory.filter(p => p.purchase === 'simulated').length,
    observations, observed_record_count: observations.length,
    distinct_observed_paths: new Set(observations.map(p => p.path || p.source_url || p.id)).size }
})
const report = { generated_at: new Date().toISOString(), mode: 'reference',
  scope: 'Bounded recorded product and search states; not a complete retailer inventory or live stock feed.',
  active_products: stores.reduce((n, s) => n + s.inventory.length, 0),
  simulated_purchase_products: stores.reduce((n, s) => n + s.simulated_purchase_count, 0),
  observed_records: stores.reduce((n, s) => n + s.observed_record_count, 0), stores }
const out = new URL('../research/inventory-2026-10-06/', import.meta.url)
await mkdir(out, { recursive: true })
await writeFile(new URL('inventory.json', out), JSON.stringify(report, null, 2) + '\n')
let md = '# Reference inventory\n\nThe default catalog excludes unsupported seed records and generated expansions. It contains only the bounded captured listings below. Source dates and URLs describe recorded states; they do not assert current stock. Internal quantity caps support local checkout simulation and are not retailer stock counts.\n\n'
md += `**${report.active_products} active product records**, including **${report.simulated_purchase_products} with local purchase simulations**, plus **${report.observed_records} read-only observation records**. Observation records may repeat a product or represent another colorway; they are not stock units or separately verified purchase offers.\n\n`
md += '| Store | Active products | Simulated purchase | Read-only observations | GTA availability evidence |\n| --- | ---: | ---: | ---: | --- |\n'
for (const s of stores) md += `| ${s.name} | ${s.inventory.length} | ${s.simulated_purchase_count} | ${s.observed_record_count} | ${s.availability_status} |\n`
md += '\n## Running and inspecting\n\n- `npm start` uses reference mode by default.\n- `CATALOG_MODE=fixtures npm start` explicitly restores the historical 500-per-store authored catalogs and their original scenarios.\n- `GET /api/catalog?store=amazon` returns active rows and provenance. Unknown availability is `null`, never inferred from a blocked page.\n- `GET /api/stores` distinguishes `available`, `unavailable`, `listing_only`, and `unknown`. Graders must not count `listing_only` or `unknown` as a failed purchase or verified absence.\n- `npm test` runs the default reference checks and the separate historical fixture regression suite.\n- `node scripts/report-reference-inventory.mjs` regenerates this report.\n\n## Product provenance\n\n'
for (const s of stores.filter(s => s.inventory.length)) {
  md += `### ${s.name}\n\n| ID | Listing | Evidence | Availability | Purchase |\n| --- | --- | --- | --- | --- |\n`
  for (const p of s.inventory) md += `| ${p.id} | ${p.title.replaceAll('|', '\\|')} | [Source](${p.evidence.source_url}) · ${p.evidence.captured_at} | ${p.availability} | ${p.purchase} |\n`
  md += '\n'
}
md += '## Validation\n\nSee [inventory verification](verification.md) for the two-mode test results, gallery audit and browser checks. Passing these checks establishes local catalog behavior, not complete retailer parity.\n\n## Limits\n\nRemoving an unsupported product prevents it from becoming a benchmark purchase; it does not prove the real retailer never sells that product. Recorded search results are preserved separately, with read-only product landings where variant, stock or purchase behavior was not captured. Unrecorded queries and source access failures are explicit coverage gaps. Full catalog breadth, location-specific stock, and private checkout parity remain unfinished. Some retained listings still use reconstructed media or layouts; inventory provenance does not validate those visual details.\n'
await writeFile(new URL('README.md', out), md)
console.log(JSON.stringify({ mode: report.mode, active_products: report.active_products, simulated_purchase_products: report.simulated_purchase_products, observed_records: report.observed_records, stores: stores.length }, null, 2))
