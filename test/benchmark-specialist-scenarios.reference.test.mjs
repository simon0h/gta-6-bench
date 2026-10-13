import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { startEnvironment } from '../benchmark/environment.js'
import { tasks } from '../benchmark/tasks.js'
import { gradeTask } from '../benchmark/grader.js'
import { client, fieldValue } from './helpers.js'
const stores = ['chewy', 'ikea', 'nike', 'sephora', 'williams-sonoma']
async function environment(t, store, family) {
  const task = tasks.find(t => t.store === store && t.family === family)
  const directory = await mkdtemp(path.join(tmpdir(), 'gta-specialist-'))
  const env = await startEnvironment({ task, directory })
  t.after(async () => { await env.close(); await rm(directory, { recursive: true, force: true }) })
  return { task, env, c: client(env.baseUrl), base: '/' + store }
}
const checkout = (task, html, number = task.request.payment.number) => {
  const r = task.request, a = r.shipping_address
  return { email: r.customer.email, first_name: r.customer.first_name, last_name: r.customer.last_name,
    address: a.line1, city: a.city, state: a.state, postal_code: a.postal_code,
    card_name: r.payment.name, card_number: number, card_expiry: r.payment.expiry, card_cvv: r.payment.cvv,
    checkout_token: fieldValue(html, 'checkout_token') }
}
for (const store of stores) {
  test(`${store}: actual payment authorization rejects retries and accepts only a later backup purchase`, async t => {
    const { task, env, c, base } = await environment(t, store, 'payment_recovery')
    await c.post(base + '/cart/add', { id: task.scenario.product_id, qty: 1 })
    let page = await c.get(base + '/checkout')
    assert.equal(page.status, 200)
    assert.deepEqual((await env.snapshot()).scenarioEvents, [])
    for (let attempt = 0; attempt < 2; attempt++) {
      page = await c.post(base + '/checkout', checkout(task, page.text))
      assert.equal(page.status, 402)
      assert.match(page.text, /card was declined/i)
      assert.deepEqual((await env.snapshot()).orders, [])
    }
    page = await c.post(base + '/checkout', checkout(task, page.text, task.request.backup_payment.number))
    assert.equal(page.status, 200)
    const state = await env.snapshot(true)
    assert.deepEqual(state.errors, [])
    assert.equal(state.orders[0].benchmark.catalog_mode, 'fixtures')
    assert.equal(state.orders[0].items[0].kind, 'other')
    const grade = gradeTask(task, { ...state, finalResponse: { outcome: 'purchased', message: 'Recovered with authorized backup.' } })
    assert.equal(grade.status, 'passed', JSON.stringify(grade.reasons))
    assert.doesNotMatch(JSON.stringify(state), /4242424242424242|5555555555554444/)
  })
  test(`${store}: stock loss blocks skipped cart, replay and a fresh session`, async t => {
    const { task, env, c, base } = await environment(t, store, 'availability_loss')
    assert.equal((await c.post(base + '/cart/add', { id: task.scenario.product_id, qty: 1 }, { follow: false })).status, 302)
    assert.equal((await c.get(base + '/checkout')).status, 409)
    assert.notEqual((await c.post(base + '/checkout', checkout(task, ''))).status, 200)
    const other = client(env.baseUrl)
    const page = await other.post(base + '/cart/add', { id: task.scenario.product_id, qty: 1 })
    assert.equal(page.status, 400)
    assert.match(page.text, /out of stock/i)
    const state = await env.snapshot(true)
    assert.deepEqual(state.errors, [])
    assert.equal(state.scenarioEvents.length, 1)
    assert.deepEqual(state.orders, [])
  })
  test(`${store}: seeded wrong merchandise is removed before the exact requested purchase`, async t => {
    const { task, env, c, base } = await environment(t, store, 'cart_recovery')
    const cart = await c.get(base + '/cart')
    assert.match(cart.text, /value="2"/)
    await c.post(base + '/cart/add', { id: task.scenario.product_id, qty: 1 })
    await c.post(base + '/cart/update', { id: task.scenario.alternate_product_id, key: task.scenario.alternate_product_id + ':', action: 'remove' })
    const page = await c.get(base + '/checkout')
    assert.equal((await c.post(base + '/checkout', checkout(task, page.text))).status, 200)
    const state = await env.snapshot(true)
    const grade = gradeTask(task, { ...state, finalResponse: { outcome: 'purchased', message: 'Corrected cart and purchased.' } })
    assert.equal(grade.status, 'passed', JSON.stringify(grade.reasons))
  })
}
