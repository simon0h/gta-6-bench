import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { chromium } from 'playwright'
import { startEnvironment } from '../benchmark/environment.js'
import { runInternational } from '../benchmark/baselines-international.js'
import { tasks, publicTask } from '../benchmark/tasks.js'
import { gradeTask } from '../benchmark/grader.js'
import { client, fieldValue } from './helpers.js'

const supported = ['jb-hifi', 'eb-games-au', 'argos', 'smyths-toys', 'coupang', 'gmarket']

for (const store of ['coupang', 'gmarket']) test(`${store}: an unrelated Buy Now order cannot produce rejection evidence for an item left in the cart`, async t => {
  const task = tasks.find(task => task.id === `${store}-payment_recovery-ps5`)
  const directory = await mkdtemp(path.join(tmpdir(), 'gta-payment-attribution-'))
  const env = await startEnvironment({ task, directory })
  t.after(async () => { await env.close(); await rm(directory, { recursive: true, force: true }) })
  const c = client(env.baseUrl), r = task.request, a = r.shipping_address, p = r.payment
  const alternate = tasks.find(task => task.id === `${store}-payment_recovery-xbox`).scenario.product_id
  const add = sku => store === 'coupang' ? { sku, qty: '1', intent: 'cart' } : { sku, qty: '1', action: 'cart', age_confirmed: '1' }
  await c.post(`/${store}/cart/add`, add(task.scenario.product_id))
  if (store === 'coupang') await c.post('/coupang/register', { email: r.customer.email, password: r.account.password, password_confirm: r.account.password, first_name: r.customer.first_name, phone: r.customer.phone, agree: 'yes' })
  else await c.post('/gmarket/account', { action: 'guest', guest_email: r.customer.email })
  const buy = sku => ({ ...add(sku), ...(store === 'coupang' ? { intent: 'buy' } : { action: 'buy' }) })
  await c.post(`/${store}/cart/add`, buy(alternate))
  const fields = store === 'coupang'
    ? { recipient: r.customer.first_name, phone: r.customer.phone, postcode: a.postal_code, city: a.city, address: a.line1, payment_method: 'card', card_name: p.name, card_number: p.number, card_expiry: p.expiry, card_cvv: p.cvv, agree: 'yes' }
    : { recipient: r.customer.first_name, phone: r.customer.phone, postal_code: a.postal_code, city: a.city, line1: a.line1, name_on_card: p.name, card_number: p.number, expiry: p.expiry, cvv: p.cvv, terms: '1' }
  const paymentPath = store === 'coupang' ? '/coupang/checkout/order' : '/gmarket/checkout'
  const unrelated = await c.post(paymentPath, fields)
  assert.equal(unrelated.status, 200)
  assert.match(unrelated.text, /주문이 완료되었습니다/)
  let snapshot = await env.snapshot()
  assert.deepEqual(snapshot.errors, [])
  assert.equal(snapshot.orders.length, 1)
  assert.equal(snapshot.orders[0].items[0].sku, alternate)
  assert.ok((await c.get(`/${store}/cart`)).text.includes(task.scenario.product_id), 'The requested item must still be present in the untouched cart')
  assert.deepEqual(snapshot.scenarioEvents, [], 'The requested item remaining in the cart is not this payment selection')
  const grade = gradeTask(task, { ...snapshot, finalResponse: { outcome: 'purchased' } })
  assert.ok(grade.reasons.some(reason => reason.code === 'missing_scenario_event'))
  await c.post(`/${store}/cart/add`, buy(task.scenario.product_id))
  if (store === 'gmarket') await c.post('/gmarket/account', { action: 'guest', guest_email: r.customer.email })
  const actual = await c.post(paymentPath, fields)
  assert.equal(actual.status, 402)
  assert.match(actual.text, /card was declined/i)
  snapshot = await env.snapshot()
  assert.equal(snapshot.orders.length, 1)
  assert.equal(snapshot.scenarioEvents.length, 1)
  assert.equal(snapshot.scenarioEvents[0].product_id, task.scenario.product_id)
})

test('international scenario reference uses native browser flows and records strict outcomes', { skip: process.env.RUN_BROWSER_TESTS !== '1', timeout: 900_000 }, async t => {
  const root = await mkdtemp(path.join(tmpdir(), 'gta-international-'))
  const browser = await chromium.launch({ headless: true })
  try {
    const selected = tasks.filter(task => supported.includes(task.store) && task.scenario && (!process.env.INTERNATIONAL_STORES || process.env.INTERNATIONAL_STORES.split(',').includes(task.store)) && (!process.env.INTERNATIONAL_FAMILIES || process.env.INTERNATIONAL_FAMILIES.split(',').includes(task.family)))
    assert.ok(selected.length >= 2)
    for (const task of selected) await t.test(task.id, { timeout: 60_000 }, async () => {
      const env = await startEnvironment({ task, directory: path.join(root, task.id) })
      const context = await browser.newContext()
      try {
        const page = await context.newPage(), requests = [], actions = [], posts = []
        page.setDefaultTimeout(6000)
        page.on('request', request => {
          requests.push(new URL(request.url()).pathname)
          if (request.method() === 'POST') posts.push({ url: request.url(), form: Object.fromEntries(new URLSearchParams(request.postData() || '')) })
        })
        await page.goto(env.startUrl)
        const finalResponse = await runInternational({ task: publicTask(task), page, recordAction: action => actions.push(action) })
        // A replay must not clear the obstacle or turn a rejected payment into
        // an order. These HTTP probes are evaluator tests, never baseline tools.
        if (task.family === 'payment_decline') {
          const submission = posts.findLast(post => post.form.card_number)
          assert.ok(submission)
          await page.request.get(submission.url)
          let replay = await page.request.post(submission.url, { form: submission.form })
          if (task.store === 'smyths-toys') {
            const review = await replay.text()
            assert.equal((await env.snapshot()).scenarioEvents.filter(event => event.type === 'payment_rejected').length, 1, 'Saving the instrument alone must not authorize payment or emit a provider rejection')
            const placement = posts.findLast(post => /\/checkout\/place-order$/.test(new URL(post.url).pathname))
            replay = await page.request.post(placement.url, { form: { terms: '1', token: fieldValue(review, 'token') } })
          }
          assert.match(await replay.text(), /card was declined/i)
          assert.equal((await env.snapshot()).orders.length, 0)
        }
        if (task.family === 'availability_loss') {
          const addition = posts.find(post => /\/(?:cart|trolley)\/add$/.test(new URL(post.url).pathname))
          assert.ok(addition)
          await page.request.post(addition.url, { form: addition.form })
          const checkout = requests.findLast(url => /checkout/.test(url))
          const response = await page.request.get(new URL(checkout || `${task.store}/checkout`, env.baseUrl).href)
          assert.match(await response.text(), /Shipping unavailable/)
          assert.equal((await env.snapshot()).orders.length, 0)
        }
        const snapshot = await env.snapshot(true)
        assert.deepEqual(snapshot.errors, [])
        assert.equal(requests.some(url => url.startsWith('/api/')), false)
        const grade = gradeTask(task, { orders: snapshot.orders, scenarioEvents: snapshot.scenarioEvents, finalResponse })
        assert.equal(grade.status, 'passed', JSON.stringify({ reasons: grade.reasons, response: finalResponse, orders: snapshot.orders }))
        if (task.family.startsWith('payment_')) {
          const decline = actions.findIndex(action => action.type === 'payment_declined')
          const payment = actions.map((action, index) => ({ ...action, index })).filter(action => action.type === 'payment')
          assert.ok(payment[0].index < decline)
          assert.equal(payment.length, task.request.backup_payment ? 2 : 1)
          if (payment[1]) assert.ok(payment[1].index > decline)
        }
      } finally { await context.close(); await env.close() }
    })
  } finally { await browser.close(); await rm(root, { recursive: true, force: true }) }
})
