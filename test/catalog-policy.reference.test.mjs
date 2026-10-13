import test from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { CATALOG_MODE, fixtureCatalog, applyCatalogPolicy } from '../lib/catalog-policy.js'

test('reference is the default catalog; fixtures require explicit startup selection', () => {
  assert.equal(CATALOG_MODE, 'reference')
  assert.equal(fixtureCatalog, false)
  const env = { ...process.env }; delete env.CATALOG_MODE
  const run = spawnSync(process.execPath, ['--input-type=module', '-e', 'import {CATALOG_MODE} from "./lib/catalog-policy.js"; console.log(CATALOG_MODE)'], { env, encoding: 'utf8' })
  assert.equal(run.status, 0, run.stderr)
  assert.equal(run.stdout.trim(), 'reference')
  const invalid = spawnSync(process.execPath, ['--input-type=module', '-e', 'import "./lib/catalog-policy.js"'], { env: { ...env, CATALOG_MODE: 'typo' }, encoding: 'utf8' })
  assert.notEqual(invalid.status, 0)
  assert.match(invalid.stderr, /Unsupported CATALOG_MODE/)
})

test('catalog restriction updates every reference to the shared source array', () => {
  const rows = [{ id: 'real', title: 'Observed listing' }, { id: 'fiction', title: 'Invented listing' }]
  const consumer = rows
  const evidence = { real: { source_url: 'https://retailer.example/product/real', captured_at: '2026-10-06', evidence_path: 'test fixture', availability: 'unknown', purchase: 'unverified' } }
  assert.equal(applyCatalogPolicy('policy-test', rows, evidence), rows)
  assert.deepEqual(consumer.map(p => p.id), ['real'])
  assert.equal(consumer[0].catalogEvidence.availability, 'unknown')
  assert.equal(consumer[0].stock, undefined, 'selection must not invent stock')
  assert.throws(() => applyCatalogPolicy('invalid', [], { unsupported: {} }), /Incomplete catalog evidence/)
})
