import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { chromium } from 'playwright'
import { startEnvironment } from '../benchmark/environment.js'
import { runDigital } from '../benchmark/baselines-digital.js'
import { tasks, publicTask } from '../benchmark/tasks.js'
import { gradeTask } from '../benchmark/grader.js'

test('native digital stores reject payments at purchase, enforce availability, and recover seeded carts', { skip: process.env.RUN_BROWSER_TESTS !== '1', timeout: 600_000 }, async t => {
  const directory = await mkdtemp(path.join(tmpdir(), 'gta6-digital-browser-'))
  const browser = await chromium.launch({ headless: true })
  try {
    const selected = tasks.filter(task => ['playstation-store', 'xbox-store'].includes(task.store) && task.scenario)
    assert.equal(selected.length, 20)
    for (const task of selected) await t.test(task.id, { timeout: 45_000 }, async () => {
      const environment = await startEnvironment({ task, directory: path.join(directory, task.id) })
      const context = await browser.newContext()
      try {
        const page = await context.newPage()
        page.setDefaultTimeout(7000)
        const requests = [], actions = []
        page.on('request', request => requests.push(new URL(request.url()).pathname))
        await page.goto(environment.startUrl)
        const finalResponse = await runDigital({ page, task: publicTask(task), recordAction: async action => {
          actions.push(action)
          if (task.family.startsWith('payment_') && ['Save the card and supplied billing address', 'Review the supplied payment method'].includes(action.description)) {
            const beforePurchase = await environment.snapshot()
            if (!actions.some(action => action.type === 'payment_declined')) assert.equal(beforePurchase.scenarioEvents.some(event => event.type === 'payment_rejected'), false, 'Card storage must not trigger purchase authorization')
          }
        } })
        const snapshot = await environment.snapshot(true)
        assert.deepEqual(snapshot.errors, [])
        assert.equal(requests.some(url => url.startsWith('/api/')), false)
        const grade = gradeTask(task, { orders: snapshot.orders, scenarioEvents: snapshot.scenarioEvents, finalResponse })
        assert.equal(grade.status, 'passed', JSON.stringify(grade.reasons))
        if (task.family === 'cart_recovery') assert.ok(actions.some(action => action.description.startsWith('Remove the unrequested cart item')), 'Signing in must preserve the seeded mistake until the agent removes it')
        if (task.family.startsWith('payment_')) assert.ok(actions.some(action => action.type === 'payment_declined'))
        if (task.expected.outcome === 'purchased') assert.ok(actions.some(action => action.type === 'confirmation'))
        else assert.equal(snapshot.orders.length, 0)
      } finally { await context.close(); await environment.close() }
    })
    await t.test('Xbox Buy Now does not attribute a different edition payment to the saved cart', { timeout: 45_000 }, async () => {
      const task = selected.find(task => task.id === 'xbox-store-payment_decline-standard')
      const alternate = selected.find(task => task.id === 'xbox-store-payment_decline-ultimate')
      const environment = await startEnvironment({ task, directory: path.join(directory, 'xbox-unrelated-cart-payment') })
      const context = await browser.newContext()
      try {
        const page = await context.newPage()
        page.setDefaultTimeout(7000)
        await page.goto(environment.startUrl)
        let inserted = false
        const finalResponse = await runDigital({ page, task: publicTask(alternate), recordAction: async action => {
          if (action.description === 'Start the requested digital preorder') {
            // A separate native cart request leaves Standard in the saved cart
            // while Buy Now is reviewing Ultimate. No evaluator API is involved.
            const response = await page.request.post(`${environment.startUrl}/en-US/cart/add`, { form: { pid: task.scenario.product_id } })
            assert.equal(response.ok(), true)
            inserted = true
          }
        } })
        const snapshot = await environment.snapshot(true)
        assert.equal(inserted, true)
        assert.deepEqual(snapshot.errors, [])
        assert.deepEqual(snapshot.scenarioEvents, [], 'An unrelated checkout cannot establish a primary rejection for the requested product')
        assert.equal(snapshot.orders.length, 1)
        assert.equal(snapshot.orders[0].items[0].sku, alternate.scenario.product_id)
        assert.equal(snapshot.orders[0].payment.last4, '4242')
        assert.equal(finalResponse.outcome, 'purchased')
        assert.equal(gradeTask(task, { ...snapshot, finalResponse }).status, 'failed', 'An unrelated completed purchase must never satisfy the intended task')
      } finally { await context.close(); await environment.close() }
    })
    await t.test('Xbox Buy Now cannot pass recovery with the mistaken cart restored before purchase', { timeout: 45_000 }, async () => {
      const task = selected.find(task => task.id === 'xbox-store-cart_recovery-standard')
      const environment = await startEnvironment({ task, directory: path.join(directory, 'xbox-uncorrected-cart-purchase') })
      const context = await browser.newContext()
      try {
        const page = await context.newPage()
        page.setDefaultTimeout(7000)
        await page.goto(environment.startUrl)
        const finalResponse = await runDigital({ page, task: publicTask(task), recordAction: async action => {
          if (action.description === 'Start the requested digital preorder') {
            await page.request.post(`${environment.startUrl}/en-US/cart/add`, { form: { pid: task.scenario.alternate_product_id } })
          }
        } })
        const snapshot = await environment.snapshot(true)
        assert.deepEqual(snapshot.errors, [])
        assert.equal(snapshot.orders.length, 1)
        assert.equal(snapshot.orders[0].items[0].sku, task.expected.sku)
        assert.deepEqual(snapshot.scenarioEvents.map(event => event.type), ['cart_seeded'])
        const grade = gradeTask(task, { ...snapshot, finalResponse })
        assert.equal(grade.status, 'failed')
        assert.ok(grade.reasons.some(reason => reason.code === 'missing_scenario_event'))
      } finally { await context.close(); await environment.close() }
    })
  } finally { await browser.close(); await rm(directory, { recursive: true, force: true }) }
})
